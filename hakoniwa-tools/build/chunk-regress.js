/* 分割読み込みの順に結果が左右されないかを確かめる（regress.js と同じシード・配役で、箱庭ごとの指紋を比べる）
   使い方：
     node hakoniwa-tools/build/chunk-regress.js <ビルドのディレクトリ> [r18|safe] [--rounds=5] [--base=基準.json] [--N=6] [--only=goukon,ship] [--no-single] [--no-shuffle]
   - (a) 単独：箱庭ごとに新しいページ（保存なし）を開き（#all なし）、中核・late・その箱庭に要るかたまり（目録の deps をたどったもの）
         だけを読ませる（ほかのかたまりの通信は止めたままにする）。HK.Load.ensure(id) を待ってから、その箱庭の指紋を取る。
   - (b) 乱順：ページを1回開き（#all なし）、箱庭を乱数（seed 3,5,7,11,21,…）で並べ替えて順に ensure → すぐその箱庭の指紋。
         最後に全箱庭の指紋を取り直す（あとから読んだ別のかたまりに汚されていないか）。--rounds 通り。
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
        const need = man ? ['core', 'late'].concat(chunksFor(man, id)) : null, held = [];
        const P = await openPage(browser, S.url + 'index.html' + hashOf(mode), man ? { allow: need, srcName, held } : { srcName }), { ctx, page, errors } = P;
        const e = await ensure(page, id);
        const got = { hash: await R.fingerprint(page, { N, kind: 1, ids: [id] }), hash2: await R.fingerprint(page, { N, kind: 2, ids: [id] }) };
        const order = P.loaded.filter(n => held.indexOf(n) < 0);
        const b = cmp(ref, got, [id]);
        report.single[id] = { ok: !b.length && e !== 'no-loader' ? true : !b.length, ensure: e, chunks: need, order, held: Array.from(new Set(held)), errors };
        if (b.length || /^ERR/.test(e) || errors.length) bad.push(b.join('') || (id + ' ' + e + ' ' + errors.join(' | ')));
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
  } finally { await browser.close(); await S.close(); }
  const nbad = Object.values(report.single).filter(x => !x.ok || /^ERR/.test(x.ensure) || x.errors.length).length + report.shuffle.filter(x => x.badEach.length || x.badEnd.length || x.errors.length || x.ensure.some(e => !/no-loader/.test(e))).length + report.errors.length;
  if (opt.out) fs.writeFileSync(opt.out, JSON.stringify(report, null, 1));
  console.log('chunk-regress ' + path.basename(dir) + ' ' + (mode || '(無印)') + '：不一致・エラー ' + nbad + ' 件（' + ((Date.now() - t0) / 1000).toFixed(0) + '秒）');
  process.exit(nbad ? 1 : 0);
}
module.exports = { serve, readManifest, depClosure, chunksFor, srcToName, shuffle, openPage, ensure };
if (require.main === module) main().catch(e => { console.error(e); process.exit(2); });
