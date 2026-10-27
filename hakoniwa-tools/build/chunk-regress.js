/* 分割読み込みの順に結果が左右されないかを確かめる（regress.js と同じシード・配役で、箱庭ごとの指紋を比べる）
   使い方：
     node hakoniwa-tools/build/chunk-regress.js <ビルドのディレクトリ> [r18|safe] [--rounds=5] [--base=基準.json] [--N=6] [--only=goukon,ship] [--no-single] [--no-shuffle] [--no-closure]
   - (a) 単独：箱庭ごとに新しいページ（保存なし）を開き（#all なし）、中核・late・その箱庭に要るかたまり（目録の deps をたどったもの）
         だけを読ませる（ほかのかたまりの通信は止めたままにする）。HK.Load.ensure(id) を待ってから、その箱庭の指紋を取る。
   - (b) 乱順：ページを1回開き（#all なし）、箱庭を乱数（seed 3,5,7,11,21,…）で並べ替えて順に ensure → すぐその箱庭の指紋。
         最後に全箱庭の指紋を取り直す（あとから読んだ別のかたまりに汚されていないか）。--rounds 通り。
   - 口調（第4段）：目録に tones.pack があれば、(a) では配役（指紋1・2）の住人の口調から道具の側で閉包（HK.TONES の base／derive）を求め、
         その tone-<口調> だけを許して HK.Load.ensureTones(口調の鍵) を待つ（閉包の外の包みを読みに行くと止めたままになり、打ち切りで失敗と出る）。
         (b) では選ぶたびに ensure と ensureTones の両方を待つ。
   - (c) 口調の閉包：自作口調（住人ごとの語尾の設定。元の口調を指定）と喘ぎの口調を混ぜた小さな配役（CLOSURE_CAST）で、
         単独（中核・late・tone-base・箱庭・閉包だけ）と #all の結果が一致するか。対照として、読み込み器を通さずに包みを直に読む3通り
         （住人の口調の包みだけ／派生元までの閉包だけ／包みなし）も回し、違いが出ること（＝試験が効くこと）を示す（対照の「違う」は失敗ではない）。
         --no-closure で飛ばす。--closure-ids=… で箱庭（既定は全箱庭）を、--closure-N=12 で回数を変える。
   - 比べる相手：--base（regress.js の出力。hash と、あれば hash2）。無ければ同じビルドを #all で開いて regress と同じ指紋を取り、それと比べる。
     指紋1（hash）は SCEN_ORDER の並びで口調を割り当てる（目録の並び＝全部読んだときの並び）。指紋2（hash2）は並びに左右されない。
   - 通信の差し止め（page.route）は file:// では効かないので、この道具はビルドを http（127.0.0.1 の小さな静的サーバ。.br があれば Content-Encoding: br）で配って開く。
   - 結果：一致しない箱庭と、その時の読み込み順（HK.Load が読み終えたかたまりの順）を出す。全部一致なら exit 0。
   ほかの道具（画面の往復試験など）向けに、静的サーバ serve() と目録の読み取り readManifest() を module.exports で出している。 */
'use strict';
const fs = require('fs'), path = require('path'), http = require('http');
const R = require('./regress.js'), lib = require('../tone-check/lib.js');

/* ---------- 目録（index.html の window.HK_MANIFEST） ---------- */
function readManifest(dir) {
  const html = fs.readFileSync(path.join(path.resolve(dir), 'index.html'), 'utf8');
  const m = html.match(/window\.HK_MANIFEST\s*=\s*(\{[\s\S]*?\})\s*;?\s*<\/script>/);
  if (!m) return null;
  return JSON.parse(m[1]);
}
/* かたまり名 → 依存を先にたどった並び（自分を含む） */
function depClosure(man, names) {
  const out = [], seen = {};
  const go = n => { if (seen[n]) return; seen[n] = 1; const c = man.chunks[n]; if (!c) return; (c.deps || []).forEach(go); out.push(n); };
  names.forEach(go); return out;
}
/* その箱庭に要るかたまり（core と late は別） */
function chunksFor(man, id) {
  const s = man.scen && man.scen[id];
  return depClosure(man, (s && s.chunks) || []);
}
/* src（js/c/pack-rel.0123456789.js）→ かたまり名 */
function srcToName(man) {
  const m = {}; m[man.core] = 'core';
  Object.keys(man.chunks || {}).forEach(n => { m[man.chunks[n].src] = n; });
  return m;
}

/* ---------- 静的サーバ ---------- */
const TYPES = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.json': 'application/json', '.png': 'image/png', '.jpg': 'image/jpeg', '.svg': 'image/svg+xml', '.ico': 'image/x-icon', '.webp': 'image/webp', '.txt': 'text/plain; charset=utf-8', '.webmanifest': 'application/manifest+json' };
/* root を配る。.br／.gz があり、受け側が受け付けるなら圧縮のまま返す。opts.log があれば配ったパスを記録 */
function serve(root, opts) {
  opts = opts || {};
  root = path.resolve(root);
  const served = [];
  const srv = http.createServer((req, res) => {
    let u = decodeURIComponent(req.url.split('?')[0].split('#')[0]);
    if (u.endsWith('/')) u += 'index.html';
    const f = path.join(root, u);
    if (!f.startsWith(root)) { res.writeHead(403); res.end(); return; }
    fs.stat(f, (err, st) => {
      if (err || !st.isFile()) { res.writeHead(404); res.end('not found'); return; }
      const ext = path.extname(f), ae = String(req.headers['accept-encoding'] || '');
      const head = { 'Content-Type': TYPES[ext] || 'application/octet-stream', 'Cache-Control': /\/js\/c\//.test(u) ? 'public, max-age=31536000, immutable' : 'no-cache', 'Vary': 'Accept-Encoding' };
      let file = f;
      if (/\.(js|css|html|json)$/.test(ext)) {
        if (/\bbr\b/.test(ae) && fs.existsSync(f + '.br')) { file = f + '.br'; head['Content-Encoding'] = 'br'; }
        else if (/\bgzip\b/.test(ae) && fs.existsSync(f + '.gz')) { file = f + '.gz'; head['Content-Encoding'] = 'gzip'; }
      }
      const size = fs.statSync(file).size; head['Content-Length'] = size;
      served.push({ url: u, bytes: size, enc: head['Content-Encoding'] || '' });
      res.writeHead(200, head);
      fs.createReadStream(file).pipe(res);
    });
  });
  return new Promise(ok => srv.listen(opts.port || 0, '127.0.0.1', () => ok({ srv, port: srv.address().port, url: 'http://127.0.0.1:' + srv.address().port + '/', served, close: () => new Promise(r => srv.close(r)) })));
}

/* ---------- 乱数（seed 固定） ---------- */
function rng(seed) { let s = seed >>> 0 || 1; return () => { s ^= s << 13; s >>>= 0; s ^= s >>> 17; s ^= s << 5; s >>>= 0; return s / 4294967296; }; }
function shuffle(a, seed) { const r = rng(seed * 2654435761), b = a.slice(); for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); const t = b[i]; b[i] = b[j]; b[j] = t; } return b; }

/* ---------- ページ ---------- */
async function openPage(browser, url, opts) {
  opts = opts || {};
  const ctx = await browser.newContext(opts.ctx || {});
  const page = await ctx.newPage(); const errors = [], loaded = [];
  page.on('pageerror', e => errors.push(String(e).slice(0, 300)));
  if (opts.allow) {
    /* 許したかたまり以外の通信は止めたまま（応えない）にする：失敗にはしないので、読み込み器の再試行・知らせは出ない */
    await page.route('**/js/c/**', route => {
      const u = new URL(route.request().url()).pathname.replace(/^\//, '').replace(/\.(br|gz)$/, '');
      const name = opts.srcName[u];
      if (name && opts.allow.indexOf(name) < 0) { opts.held && opts.held.push(name); return; }
      route.continue();
    });
  }
  /* 読み込んだかたまりの順（script 要素での読み込みだけ。先読み＝prefetch は数えない） */
  page.on('request', rq => {
    if (rq.resourceType() !== 'script' || !/\/js\/c\//.test(rq.url())) return;
    const u = new URL(rq.url()).pathname.replace(/^\//, '').replace(/\.(br|gz)$/, '');
    loaded.push((opts.srcName && opts.srcName[u]) || u.replace(/^js\/c\//, '').replace(/\.[0-9a-f]+\.js$/, ''));
  });
  /* 止めたままのかたまり（script 要素）があると load が来ないので、DOMContentLoaded までで先へ進む */
  await page.goto(url, { waitUntil: 'domcontentloaded' });
  await R.waitReady(page);
  return { ctx, page, errors, loaded };
}
async function ensure(page, id) {
  return page.evaluate(id => { const L = window.HK.Load; if (!L || !L.ensure) return 'no-loader'; return L.ensure(id).then(() => 'ok', e => 'ERR ' + (e && e.message || e)); }, id);
}

/* ---------- 口調（第4段：tone-base／tone-<口調>） ---------- */
/* 住人の写しの並び → 住人の口調として渡す鍵（口調・喘ぎの口調・自作口調の元の口調。K／F／P は辞書の型の代わりの口調） */
const TONE_KEYS_OF = function (chars) {
  const FORM = { K: 'gentle', F: 'stern', P: 'polite' }, out = [];
  (chars || []).forEach(c => { if (!c) return; if (typeof c === 'string') { out.push(c); return; } [c.tone, c.moanTone, c.ending && (FORM[c.ending.base] || c.ending.base)].forEach(t => { if (t && out.indexOf(t) < 0) out.push(t); }); });
  return out;
};
/* 道具の側で求める口調の閉包（読み込み器とは別に。HK.TONES の base／derive をたどる）→ 口調の鍵の並び */
const TONE_CLOSURE = function (keys) {
  const R = window.HK.TONES || {}, seen = {}, q = keys.slice();
  while (q.length) { const x = q.pop(); if (!x || seen[x]) continue; seen[x] = 1; const e = R[x] || {}; q.push(e.base, e.derive, e.endingOf); }
  return Object.keys(seen);
};
/* 目録の口調の包み（tones.pack）があるか */
const hasTonePacks = man => !!(man && man.tones && man.tones.pack);
/* 口調の鍵の並び → 読む口調のかたまり（自動の10口調＝tone-base は起動で読むので含めない） */
function toneChunks(man, keys) {
  if (!hasTonePacks(man)) return [];
  const out = []; keys.forEach(k => { const n = man.tones.pack[k]; if (n && out.indexOf(n) < 0) out.push(n); }); return out;
}
/* 配役（regress と同じ。指紋1・指紋2 の両方）で使う住人の口調の鍵 */
async function castTones(page, N, id) {
  const keys = [];
  for (const kind of [1, 2]) {
    const c = await R.casts(page, { N, kind, ids: [id] });
    (c[id] || []).forEach(chars => { if (Array.isArray(chars)) chars.forEach(x => { if (keys.indexOf(x.tone) < 0) keys.push(x.tone); }); });
  }
  return keys.filter(Boolean);
}
/* 住人の口調を読み込み器で読む（HK.Load.ensureTones）。止めたままのかたまりを待つと終わらないので ms で打ち切る */
async function ensureTones(page, arg, ms) {
  return page.evaluate(a => {
    const L = window.HK.Load; if (!L || !L.ensureTones) return 'no-loader';
    return Promise.race([L.ensureTones(a.arg).then(() => 'ok', e => 'ERR ' + (e && e.message || e)), new Promise(r => setTimeout(() => r('TIMEOUT（止めたままのかたまりを待っている）'), a.ms))]);
  }, { arg, ms: ms || 60000 });
}

/* ---------- (c) 口調の閉包の試験 ---------- */
/* 自作口調（住人ごとの語尾の設定。元の口調を指定）と喘ぎの口調（R18版）を混ぜた小さな配役。口調はどれも自動の10以外で、包みが別々になるように選ぶ */
const CLOSURE_CAST = [
  { name: 'アキラ', tone: 'sondai', moanTone: 'gyaru' },                                            /* 尊大 → derive 古風な紳士。喘ぎはギャル */
  { name: 'ミナト', tone: 'boku_n', ending: { base: 'ojou', plain: 'ですぞ', ask: 'ですかな' } },    /* 中性的（僕）→ derive 穏やか（中性的）。自作口調の元はお嬢様 */
  { name: 'ユキノ', tone: '', ending: { base: 'kansai', plain: 'やで', surprise: 'なんやて！' }, moanTone: 'noja' },   /* 口調はおまかせ。自作口調の元は関西弁。喘ぎはのじゃ */
  { name: 'カオル', tone: 'kohai', moanTone: 'chara' },
  { name: 'ハルカ', tone: 'mukuchi' },
  { name: 'レンジ', tone: 'hero', ending: { base: 'P', plain: 'でござる' } },
  { name: 'ソウタ', tone: 'genki', moanTone: 'usan' },
  { name: 'リオ', tone: 'keigo_twist' },                                                             /* 辞書だけの口調 */
  { name: 'ツバサ', tone: 'darui_lite' },                                                            /* → derive けだるげ */
  { name: 'ナギ', tone: 'god' },                                                                     /* → derive 古風な紳士 */
  { name: 'シオン', tone: 'mystic', ending: { base: 'yankee', plain: 'だぜ' } },
  { name: 'マコト', tone: 'chara_down', moanTone: 'ane' }
];
/* ページの中で回す：a = { id, N, chars } → [回ごとの結果の JSON]。s 回目は s 番目の住人から人数分（回ごとにずらし、人数の少ない箱庭でも N≥12 なら全員が出る） */
const FPC = function (a) {
  const HK = window.HK, sc = HK.SCENARIOS[a.id];
  if (!sc) return ['MISSING'];
  const POS = ['', 'top', 'bottom', 'riba'], G = ['m', 'f', ''], L = a.chars.length;
  const n = Math.max(sc.minCast || 2, Math.min(sc.maxCast || 6, L)), out = [];
  for (let s = 0; s < a.N; s++) {
    const chars = [], perChar = [];
    for (let i = 0; i < n; i++) {
      const c = JSON.parse(JSON.stringify(a.chars[(i + s) % L]));
      chars.push(Object.assign({ eg: { CP: (s * 7 + i * 3) % 21, NP: (s * 5 + i * 11) % 21, A: (s * 3 + i * 13) % 21, FC: (s * 11 + i * 5) % 21, AC: (s * 13 + i * 7) % 21 }, memo: '', gender: G[(s + i) % 3], pos: POS[(s + i) % 4], futa: false }, c));
      perChar.push({ action: 'auto', goal: 'auto', stats: {}, weapon: '', pick: {}, role: '' });
    }
    const env = {}; (sc.env || []).forEach((e, k) => { env[e.id] = e.def != null ? e.def : (e.options && e.options[0] ? e.options[0].v : ''); if (s % 2 && e.max != null) env[e.id] = e.max; if (s % 3 === 2 && e.options && e.options.length > 1) env[e.id] = e.options[(s + k) % e.options.length].v; });
    const ties = s % 2 ? [{ a: 0, b: 1, type: 'lover' }] : [];
    let r; try { r = JSON.stringify(HK.simulate({ scenId: a.id, seed: 991 + s * 37, env, chars, perChar, ties })); } catch (e) { r = 'ERR ' + e.message; }
    out.push(r);
  }
  return out;
};
async function closureTest(browser, S, dir, man, srcName, mode, opt) {
  const N = +opt['closure-N'] || 12, hashOf = h => h ? '#' + h : '', res = { ids: [], bad: [], errors: [] };
  /* 既定は目録の全箱庭（箱庭だけの行の振り分けの漏れ＝別の箱庭のかたまりに入った行を、ほかの箱庭が使っている、もここで見つかる） */
  const want = opt['closure-ids'] ? opt['closure-ids'].split(',') : (man.order || Object.keys(man.scen || {}));
  const ids = want.filter(id => man && man.scen && man.scen[id]);
  res.ids = ids;
  /* #all の結果 */
  const A = await openPage(browser, S.url + 'index.html' + hashOf(lib.withAll(mode, dir)), {});
  const ref = {};
  for (const id of ids) ref[id] = R.sha12(await A.page.evaluate(FPC, { id, N, chars: CLOSURE_CAST }));
  if (A.errors.length) res.errors.push('#all: ' + A.errors.join(' | '));
  await A.ctx.close();
  /* 単独：中核・late・tone-base・その箱庭・配役の口調の閉包だけ（本番は読み込み器の ensureTones に住人の写しをそのまま渡し、
     口調・喘ぎの口調・自作口調の元の口調を拾い、派生元をたどるかも見る）。
     対照は読み込み器を通さず、決めた口調の包みだけを script で直に読む＝この試験が漏れを見分けられるかの確かめ（「違う」が出てよい）：
       noderive … 住人の口調そのものの包みだけ（派生元・文面を借りる口調・喘ぎの口調・自作口調の元の口調を読まない）
       nomoan   … 住人の口調の閉包（派生元はたどる）だけ（喘ぎの口調・自作口調の元の口調を読まない）
       none     … 口調の包みを読まない（tone-base だけ） */
  const inject = (page, src) => page.evaluate(src => new Promise((ok, ng) => { const e = document.createElement('script'); e.src = src; e.onload = () => ok(1); e.onerror = () => ng(new Error('読めない：' + src)); document.head.appendChild(e); }), src);
  res.noderive = []; res.nomoan = []; res.none = [];
  for (const variant of ['full', 'noderive', 'nomoan', 'none']) {
    for (const id of ids) {
      const need = ['core', 'late', 'tone-base'].concat(chunksFor(man, id)), held = [];
      const P = await openPage(browser, S.url + 'index.html' + hashOf(mode), { allow: need, srcName, held });
      const own = CLOSURE_CAST.map(c => c.tone).filter(Boolean);
      const keys = variant === 'full' ? await P.page.evaluate(TONE_KEYS_OF, CLOSURE_CAST) : variant === 'none' ? [] : own;
      const clo = variant === 'noderive' ? own : await P.page.evaluate(TONE_CLOSURE, keys);
      const tch = toneChunks(man, clo); tch.forEach(n => need.push(n));
      const e1 = await ensure(P.page, id);
      let e2 = 'ok';
      if (variant === 'full') e2 = await ensureTones(P.page, { chars: CLOSURE_CAST }, 20000);
      else for (const n of tch) await inject(P.page, man.chunks[n].src).catch(e => { e2 = String(e.message || e); });
      const got = R.sha12(await P.page.evaluate(FPC, { id, N, chars: CLOSURE_CAST }));
      const heldU = Array.from(new Set(held)).filter(n => /^tone-/.test(n));
      if (variant === 'full') {
        if (got !== ref[id] || e1 !== 'ok' || !/^(ok|no-loader)$/.test(e2) || P.errors.length) res.bad.push(id + '：' + (got !== ref[id] ? '結果が #all と違う ' : '') + (e1 !== 'ok' ? 'ensure ' + e1 + ' ' : '') + (!/^(ok|no-loader)$/.test(e2) ? 'ensureTones ' + e2 + ' ' : '') + (P.errors.length ? 'ページのエラー ' + P.errors.join(' | ') : '') + (heldU.length ? '（止めた口調の包み：' + heldU.join(',') + '）' : ''));
        res[id] = { tones: keys, closure: clo, chunks: tch, heldTone: heldU, order: P.loaded.filter(n => held.indexOf(n) < 0) };
      } else {
        res[variant].push(id + (got !== ref[id] ? '：違う' : '：同じ'));
        if (e2 !== 'ok' || P.errors.length) res.errors.push('対照 ' + variant + ' ' + id + '：' + e2 + ' ' + P.errors.join(' | '));
      }
      await P.ctx.close();
    }
  }
  return res;
}

function cmp(ref, got, ids) {
  const bad = [];
  ids.forEach(id => {
    const a1 = ref.hash && ref.hash[id], a2 = ref.hash2 && ref.hash2[id], b1 = got.hash[id], b2 = got.hash2[id];
    const m1 = a1 == null || a1 === b1, m2 = a2 == null || a2 === b2;
    if (!m1 || !m2) bad.push(id + (m1 ? '' : ' 指紋1 ' + a1 + '→' + b1) + (m2 ? '' : ' 指紋2 ' + a2 + '→' + b2));
  });
  return bad;
}

async function main() {
  const args = process.argv.slice(2), pos = args.filter(a => !a.startsWith('--')), opt = {};
  args.filter(a => a.startsWith('--')).forEach(a => { const m = a.slice(2).split('='); opt[m[0]] = m.length > 1 ? m.slice(1).join('=') : true; });
  const dir = path.resolve(pos[0]), mode = pos[1] || (/zenrei/.test(dir) ? '' : 'r18'), N = +opt.N || 6, rounds = opt.rounds != null ? +opt.rounds : 5;
  const man = readManifest(dir);
  if (!man) console.error('注意：目録（HK_MANIFEST）が無い index.html です。かたまりの差し止めはせず、読み込み器なしで回します（道具の試運転用）');
  const srcName = man ? srcToName(man) : {};
  const S = await serve(dir); const browser = await R.launch();
  const hashOf = h => h ? '#' + h : '';
  const t0 = Date.now(); let total = 0;
  const report = { mode, single: {}, shuffle: [], errors: [] };
  try {
    /* 比べる相手 */
    let ref;
    if (opt.base) ref = JSON.parse(fs.readFileSync(opt.base, 'utf8'));
    else {
      const { ctx, page, errors } = await openPage(browser, S.url + 'index.html' + hashOf(lib.withAll(mode, dir)));
      ref = { hash: await R.fingerprint(page, { N, kind: 1 }), hash2: await R.fingerprint(page, { N, kind: 2 }) };
      if (errors.length) report.errors.push('#all: ' + errors.join(' | '));
      await ctx.close();
    }
    let ids = Object.keys(ref.hash || ref.hash2);
    if (opt.only) ids = ids.filter(id => opt.only.split(',').indexOf(id) >= 0);
    /* (a) 単独 */
    if (!opt['no-single']) {
      const bad = [];
      for (const id of ids) {
        /* 読ませるのは中核・late・tone-base・その箱庭のかたまりと、配役（指紋1・2）の口調の閉包（道具の側で求めたもの）だけ */
        const need = man ? ['core', 'late', 'tone-base'].concat(chunksFor(man, id)) : null, held = [];
        const P = await openPage(browser, S.url + 'index.html' + hashOf(mode), man ? { allow: need, srcName, held } : { srcName }), { ctx, page, errors } = P;
        const tones = await castTones(page, N, id), clo = await page.evaluate(TONE_CLOSURE, tones), tch = toneChunks(man, clo);
        if (need) tch.forEach(n => need.push(n));
        const e = await ensure(page, id), et = hasTonePacks(man) ? await ensureTones(page, tones, 20000) : 'no-packs';
        const got = { hash: await R.fingerprint(page, { N, kind: 1, ids: [id] }), hash2: await R.fingerprint(page, { N, kind: 2, ids: [id] }) };
        const order = P.loaded.filter(n => held.indexOf(n) < 0);
        const b = cmp(ref, got, [id]), etBad = !/^(ok|no-loader|no-packs)$/.test(et);
        report.single[id] = { ok: !b.length && !etBad, ensure: e, ensureTones: et, tones, toneChunks: tch, chunks: need, order, held: Array.from(new Set(held)), errors };
        if (b.length || /^ERR/.test(e) || etBad || errors.length) bad.push(b.join('') || (id + ' ' + e + (etBad ? ' ensureTones ' + et + '（止めた：' + Array.from(new Set(held)).filter(n => /^tone-/.test(n)).join(',') + '）' : '') + ' ' + errors.join(' | ')));
        total++; await ctx.close();
      }
      console.log('単独：' + (ids.length - bad.length) + '/' + ids.length + ' 一致' + (bad.length ? '\n  ' + bad.join('\n  ') : ''));
    }
    /* (b) 乱順 */
    if (!opt['no-shuffle']) {
      const SEEDS = [3, 5, 7, 11, 21, 33, 45, 57, 69, 81];
      for (let k = 0; k < rounds; k++) {
        const seed = SEEDS[k] || (k * 12 + 9), ord = shuffle(ids, seed);
        const P = await openPage(browser, S.url + 'index.html' + hashOf(mode), { srcName }), { ctx, page, errors } = P;
        const each = { hash: {}, hash2: {} }, ens = [];
        for (const id of ord) {
          const e = await ensure(page, id); if (e !== 'ok') ens.push(id + ':' + e);
          if (hasTonePacks(man)) { const et = await ensureTones(page, await castTones(page, N, id)); if (et !== 'ok') ens.push(id + ':口調 ' + et); }
          Object.assign(each.hash, await R.fingerprint(page, { N, kind: 1, ids: [id] }));
          Object.assign(each.hash2, await R.fingerprint(page, { N, kind: 2, ids: [id] }));
        }
        const fin = { hash: await R.fingerprint(page, { N, kind: 1, ids }), hash2: await R.fingerprint(page, { N, kind: 2, ids }) };
        const order = P.loaded.slice();
        const b1 = cmp(ref, each, ids), b2 = cmp(ref, fin, ids);
        report.shuffle.push({ seed, order: ord, loadOrder: order, badEach: b1, badEnd: b2, ensure: ens, errors });
        console.log('乱順 seed=' + seed + '：選ぶたび ' + (ids.length - b1.length) + '/' + ids.length + '・最後 ' + (ids.length - b2.length) + '/' + ids.length + ' 一致' + (errors.length ? '・ページのエラー ' + errors.length : '') + (ens.length && ens[0].indexOf('no-loader') < 0 ? '・ensure の失敗 ' + ens.join(',') : ''));
        if (b1.length || b2.length) console.log('  選んだ順：' + ord.join(' ') + '\n  読み終えたかたまりの順：' + order.join(' ') + (b1.length ? '\n  選ぶたび：' + b1.join('／') : '') + (b2.length ? '\n  最後：' + b2.join('／') : ''));
        total++; await ctx.close();
      }
    }
    /* (c) 口調の閉包 */
    if (!opt['no-closure'] && man && hasTonePacks(man)) {
      const c = await closureTest(browser, S, dir, man, srcName, mode, opt);
      report.closure = c;
      console.log('口調の閉包（自作口調・喘ぎの口調を含む配役。単独＝閉包だけ ↔ #all）：' + (c.ids.length - c.bad.length) + '/' + c.ids.length + ' 一致' + (c.bad.length ? '\n  ' + c.bad.join('\n  ') : '') +
        '\n  対照（「違う」が出れば、その漏れをこの試験で見分けられる）：' +
        ['noderive', 'nomoan', 'none'].map(v => { const d = c[v].filter(x => /違う$/.test(x)).length; return '\n    ' + { noderive: '住人の口調の包みだけ（派生元・喘ぎ・語尾の元なし）', nomoan: '派生元までの閉包だけ（喘ぎの口調・語尾の元なし）', none: '口調の包みなし（tone-base だけ）' }[v] + '：違う ' + d + '/' + c[v].length + (d ? '（' + c[v].filter(x => /違う$/.test(x)).map(x => x.replace(/：違う$/, '')).join(',') + '）' : ''); }).join('') + (c.errors.length ? '\n  ' + c.errors.join('\n  ') : ''));
      c.ids.forEach(id => { if (c[id]) console.log('  ' + id + '：口調 ' + c[id].tones.join(',') + ' → 閉包 ' + c[id].closure.length + '口調・包み ' + c[id].chunks.join(',')); });
    } else if (!opt['no-closure']) console.log('口調の閉包：目録に口調の包み（tones.pack）が無いので飛ばした');
  } finally { await browser.close(); await S.close(); }
  const nbad = Object.values(report.single).filter(x => !x.ok || /^ERR/.test(x.ensure) || x.errors.length).length + report.shuffle.filter(x => x.badEach.length || x.badEnd.length || x.errors.length || x.ensure.some(e => !/no-loader/.test(e))).length + report.errors.length + (report.closure ? report.closure.bad.length + report.closure.errors.length : 0);
  if (opt.out) fs.writeFileSync(opt.out, JSON.stringify(report, null, 1));
  console.log('chunk-regress ' + path.basename(dir) + ' ' + (mode || '(無印)') + '：不一致・エラー ' + nbad + ' 件（' + ((Date.now() - t0) / 1000).toFixed(0) + '秒）');
  process.exit(nbad ? 1 : 0);
}
module.exports = { serve, readManifest, depClosure, chunksFor, srcToName, shuffle, openPage, ensure, ensureTones, closureTest, castTones, toneChunks, hasTonePacks, TONE_KEYS_OF, TONE_CLOSURE, CLOSURE_CAST };
if (require.main === module) main().catch(e => { console.error(e); process.exit(2); });
