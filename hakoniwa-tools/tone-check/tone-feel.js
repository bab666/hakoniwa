/* 口調の「違和感」の点検：全 49 口調 × 箱庭で住人の台詞を集め、口調ごとの決まり（口調直し第1〜5回の各担当の判定）で違和感の割合を出す。
   設計・判定の一覧・所要時間は docs/reports/2026-10-30/tone-feel.md（決まりの元は docs/reports/2026-10-30/tone-mixed-progress.md）。
   使い方:
     node hakoniwa-tools/tone-check/tone-feel.js hakoniwa-full                       # 既定の一式（49 口調 × 3 箱庭 × N=24 × 種 2000・21001）
     node hakoniwa-tools/tone-check/tone-feel.js hakoniwa-full --scen=locker         # 場面を足した箱庭だけ
     node hakoniwa-tools/tone-check/tone-feel.js hakoniwa-full --tones=kansai,sondai --why   # 口調を絞り、違和感の台詞を頻度順に
     node hakoniwa-tools/tone-check/tone-feel.js hakoniwa-zenrei                     # 全年齢版（ページは無印。内容のスイッチは全年齢版にあるものだけ）
   ほかの指定：--N=24（箱庭ごとの回数）、--seeds=2000,21001（最初が「直すときに見た種」、残りが「見ていない種」）、--mode=r18|safe（R18版のページの hash。既定 r18）、
              --why（違和感の台詞を口調ごとに 30 件。--why=100 で件数）、--json=出力.json、--base=基準.json（悪化した口調を出す）、--jobs=2（ページを何本並べるか）
   ・台詞の集め方は口調直しの trace.js と同じ：話し手（ハルカ）の口調を固定し、相手はおまかせ。エゴグラム 6 種・男女半々・受け攻め半々・3 回に 1 回は恋人。
     自動の態度口調（proud など HK.PERSONA の 9 種）は、口調を「おまかせ」にして、その口調になるエゴグラムを 8 種探して使う（丁寧 polite だけは口調を設定。TD の作り方）。
     環境は既定値で、恋愛・夜・媚薬・発情などの上限があるものは上限、内容のスイッチは force 以外ぜんぶ。喘ぎ（♡・小さい母音を含む 14 字未満）は数えない。
   ・判定：機械の規則だけ（各担当の check*.js をそのまま写した feel/*.js。目視の一覧 man_*.txt は入れていない）。関西弁は第2回（TX）と第4回のノリ（TK）の両方の規則。
     台詞ごとに話し手の性別を付けて判定する（性別の規則：一人称・男性の女性語・女性の男性語）。
   ・合否：口調ごとに全部の種を合わせた割合（本数で加重）で ◯ 3% 以下／△ 10% 以下／✕。すべて ◯ でシミュレーション・ページのエラーが無ければ終了コード 0、ほかは 1。 */
'use strict';
const path = require('path'), fs = require('fs');
const { openBuild, buildUrl } = require('./lib.js');

const FEEL = ['mx', 'tx', 'tk', 'ta', 'tb', 'tc', 'td'].map(f => require('./feel/' + f + '.js'));
const JUDGE = {}; /* 口調 → 判定の並び */
FEEL.forEach(m => m.tones.forEach(t => { (JUDGE[t] = JUDGE[t] || []).push(m); }));
const AUTO = ['proud', 'stern', 'tsun', 'gentle', 'devoted', 'cool', 'free', 'shy', 'polite']; /* 自動の態度口調（TD の配役） */
const DEF_SCEN = ['whiteroom', 'locker', 'omega'];

function arg(name, def) { const a = process.argv.find(x => x === '--' + name || x.indexOf('--' + name + '=') === 0); if (!a) return def; return a.indexOf('=') < 0 ? true : a.slice(name.length + 3); }
const markOf = p => p <= 3 ? '◯' : p <= 10 ? '△' : '✕';
const pct = (b, t) => t ? 100 * b / t : 0;

/* ---------- ページの中で 1 口調ぶんの台詞を集める（口調直しの TX/trace.js・TD/trace.js と同じ配役） ---------- */
function collectInPage(a) {
  const HK = window.HK, V = HK.Voice, TONE = a.tone, cnt = {}, bySc = {}, errs = [], RAW = {}, HITS = new Map();
  const qs = t => { const r = []; let d = 0, st = -1; for (let i = 0; i < t.length; i++) { const c = t[i]; if (c === '「') { if (d === 0) st = i; d++; } else if (c === '」' && d > 0) { d--; if (d === 0) r.push(t.slice(st + 1, i)); } } return r; };
  /* 元の台詞（3 本）と出どころ（OWN＝この口調の書き下ろし・BASE＝借りた書き下ろし・D3＝辞書・D1＝1 本の台詞の言い換え） */
  const pt0 = V.processText; V.processText = function (text) { const o = pt0.apply(this, arguments); try { if (typeof text === 'string' && typeof o === 'string') { const x = qs(text), y = qs(o); if (x.length === y.length) x.forEach((r, i) => { const f = y[i].replace(/^「|」$/g, ''); const m = RAW[f] = RAW[f] || {}; m[r] = (m[r] || 0) + 1; }); } } catch (e) { /* 数えるだけ */ } return o; };
  const of0 = V.overrideFor; V.overrideFor = function (q, who) { const r = of0.apply(this, arguments); if (r != null && who && (who.tone === TONE || who._from === TONE)) { const k = String(q).replace(/[-]+/g, '〈〉').replace(/レン|ソラ|ハルカ/g, '〈〉'); HITS.set(k, who.tone === TONE ? 'OWN' : 'BASE'); } return r; };
  let EGS = [];
  if (a.auto) {
    let rs = 12345; const rnd = () => { rs = (rs * 1103515245 + 12345) & 0x7fffffff; return rs / 0x7fffffff; };
    if (TONE !== 'polite') for (let i = 0; i < 200000 && EGS.length < 8; i++) {
      const eg = { CP: Math.round(rnd() * 20), NP: Math.round(rnd() * 20), A: Math.round(rnd() * 20), FC: Math.round(rnd() * 20), AC: Math.round(rnd() * 20) };
      if (HK.toneOf({ tone: '', eg }) === TONE && !EGS.some(e => Math.abs(e.CP - eg.CP) + Math.abs(e.NP - eg.NP) + Math.abs(e.A - eg.A) + Math.abs(e.FC - eg.FC) + Math.abs(e.AC - eg.AC) < 14)) EGS.push(eg);
    }
    if (!EGS.length) EGS.push({ CP: 8, NP: 12, A: 10, FC: 12, AC: 12 }, { CP: 16, NP: 8, A: 12, FC: 6, AC: 6 }, { CP: 6, NP: 10, A: 8, FC: 16, AC: 8 }, { CP: 6, NP: 14, A: 8, FC: 8, AC: 16 });
  } else EGS = [{ CP: 8, NP: 12, A: 10, FC: 12, AC: 12 }, { CP: 16, NP: 8, A: 12, FC: 6, AC: 6 }, { CP: 6, NP: 10, A: 8, FC: 16, AC: 8 }, { CP: 6, NP: 14, A: 8, FC: 8, AC: 16 }, { CP: 10, NP: 16, A: 12, FC: 8, AC: 10 }, { CP: 12, NP: 6, A: 16, FC: 8, AC: 8 }];
  const SC = a.scen.filter(s => HK.SCENARIOS[s]);
  let wrong = 0, runs = 0;
  for (const SEED of a.seeds) for (const sc of SC) {
    const scen = HK.SCENARIOS[sc]; bySc[sc] = bySc[sc] || 0;
    for (let s = 0; s < a.N; s++) {
      const g = s % 2 ? 'f' : 'm';
      const chars = [
        { name: 'ハルカ', gender: g, likes: 'both', pos: s % 4 < 2 ? 'bottom' : 'top', tone: a.auto ? (TONE === 'polite' ? 'polite' : '') : TONE, fp: '', memo: '', eg: EGS[(s >> 1) % EGS.length] },
        { name: 'レン', gender: g === 'f' ? 'm' : 'f', likes: 'both', pos: s % 4 < 2 ? 'top' : 'bottom', tone: '', fp: '', memo: '', eg: { CP: 10, NP: 10, A: 10, FC: 12, AC: 8 } },
        { name: 'ソラ', gender: 'f', likes: 'both', pos: '', tone: '', fp: '', memo: '', eg: { CP: 6, NP: 14, A: 8, FC: 10, AC: 14 } }
      ].slice(0, sc === 'locker' ? 3 : 2 + (s % 2));
      if (HK.toneOf(chars[0]) !== TONE) wrong++;
      const env = {}; (scen.env || []).forEach(e => { env[e.id] = e.def != null ? e.def : (e.options && e.options[0] ? e.options[0].v : (e.min != null ? e.min : '')); });
      (scen.env || []).forEach(e => { if (e.max != null && /romance|love|night|lewd|heat|aphro|dose|pleasure/.test(e.id)) env[e.id] = e.max; });
      if (HK.Content) env.ct = HK.Content.TAGS.map(t => t.id).filter(t => t !== 'force').join(',');
      let R; runs++;
      try { R = HK.simulate({ scenId: sc, seed: SEED + s * 7, env, chars, ties: s % 3 === 0 ? [{ a: 0, b: 1, type: 'lover' }] : [], perChar: chars.map(() => ({ action: 'auto', goal: 'auto', stats: {}, pick: {}, role: '' })) }); } catch (e) { errs.push(sc + '/' + (SEED + s * 7) + ':' + e.message); continue; }
      bySc[sc]++;
      (R.log || []).forEach(e => { (e.seg || []).forEach(g2 => {
        if ((g2.t === 'l' || g2.t === 'e') && g2.who === 0) {
          const q = g2.s.replace(/^ハルカ/, '').replace(/^「|」$/g, '');
          if (/[♡ぁぃぅぇぉ]/.test(q) && q.length < 14) return;
          const k = g + '\t' + q, c = cnt[k] = cnt[k] || { n: 0, sc: {}, seed: {} };
          c.n++; c.sc[sc] = 1; c.seed[SEED] = (c.seed[SEED] || 0) + 1;
        }
      }); });
    }
  }
  V.processText = pt0; V.overrideFor = of0;
  const rows = Object.keys(cnt).map(k0 => {
    const v = cnt[k0], g = k0[0], k = k0.slice(2);
    const m = RAW[k] || RAW[k.replace(/^[^「]*「/, '')] || {};
    const raw = Object.keys(m).sort((x, y) => m[y] - m[x])[0] || '';
    const alts = raw.replace(/^⁢/, '').replace(/レン|ソラ|ハルカ/g, '〈〉').split('｜');
    const hx = alts.find(x => HITS.has(x));
    const src = hx ? HITS.get(hx) : raw.indexOf('｜') >= 0 ? 'D3' : raw ? 'D1' : '?';
    return { n: v.n, g, s: k, sc: Object.keys(v.sc), seed: v.seed, src, raw: raw.replace(/レン|ソラ|ハルカ/g, '〈〉').replace(/[⁠-⁤]/g, '') };
  });
  const label = (HK.TONES && HK.TONES[TONE] && HK.TONES[TONE].label) || (HK.PERSONA && HK.PERSONA[TONE] && (HK.PERSONA[TONE].label || HK.PERSONA[TONE].name)) || TONE;
  return { tone: TONE, label, runs, bySc, errs, wrong, egs: EGS.length, rows };
}

/* ---------- 判定（Node 側） ---------- */
function judgeTone(res, seeds) {
  const js = JUDGE[res.tone] || [];
  const perSeed = {}; seeds.forEach(sd => { perSeed[sd] = { total: 0, bad: 0 }; });
  const rules = {}, badMap = new Map();
  let total = 0, bad = 0, kinds = 0;
  const lineSet = new Set();
  res.rows.forEach(r => {
    lineSet.add(r.s);
    const why = [];
    js.forEach(m => m.judge(res.tone, r).forEach(k => { if (why.indexOf(k) < 0) why.push(k); }));
    total += r.n;
    seeds.forEach(sd => { const n = r.seed[sd] || 0; perSeed[sd].total += n; if (why.length) perSeed[sd].bad += n; });
    if (!why.length) return;
    bad += r.n;
    why.forEach(k => { rules[k] = (rules[k] || 0) + r.n; });
    const o = badMap.get(r.s) || { n: 0, s: r.s, why: [], g: {}, src: r.src, raw: r.raw, sc: new Set() };
    o.n += r.n; o.g[r.g] = (o.g[r.g] || 0) + r.n; why.forEach(k => { if (o.why.indexOf(k) < 0) o.why.push(k); }); r.sc.forEach(x => o.sc.add(x));
    badMap.set(r.s, o);
  });
  kinds = badMap.size;
  const rate = pct(bad, total);
  const tk = FEEL.find(m => m.team === 'TK');
  const extra = res.tone === 'kansai' ? { nori: tk.noriRate(res.rows) } : {};
  return {
    tone: res.tone, label: res.label, judges: js.map(m => m.team), lines: lineSet.size, total, bad, badKinds: kinds, rate: +rate.toFixed(2), mark: markOf(rate),
    perSeed: Object.fromEntries(seeds.map(sd => [sd, { total: perSeed[sd].total, bad: perSeed[sd].bad, rate: +pct(perSeed[sd].bad, perSeed[sd].total).toFixed(2) }])),
    rules, runs: res.runs, simErr: res.errs.length, simErrEx: res.errs.slice(0, 3), wrong: res.wrong, egs: res.egs, bySc: res.bySc, extra,
    bads: [...badMap.values()].sort((a, b) => b.n - a.n).map(o => ({ n: o.n, s: o.s, why: o.why, g: Object.keys(o.g).map(k => k + o.g[k]).join(''), src: o.src, raw: o.raw, sc: [...o.sc].join('/') }))
  };
}

async function waitReady(page) {
  await page.waitForFunction(() => window.HK && window.HK.simulate && window.HK.TONE_KEYS && window.HK.LATE_READY !== false, null, { timeout: 120000 });
}

(async () => {
  const root = path.resolve(__dirname, '../..');
  const bArg = process.argv.slice(2).find(x => !/^--/.test(x)) || 'hakoniwa-full';
  const dir = fs.existsSync(path.resolve(bArg)) ? path.resolve(bArg) : path.join(root, bArg);
  const isZen = /zenrei/.test(path.basename(dir));
  const mode = isZen ? '' : String(arg('mode', 'r18'));
  const o = {
    scen: String(arg('scen', DEF_SCEN.join(','))).split(',').filter(Boolean),
    N: Math.max(1, +arg('N', 24) || 24),
    seeds: String(arg('seeds', '2000,21001')).split(',').map(Number).filter(x => x > 0),
    jobs: Math.max(1, +arg('jobs', 2) || 1),
    why: arg('why', false), json: arg('json', ''), base: arg('base', '')
  };
  const whyN = o.why === true ? 30 : +o.why || 0;
  const T0 = Date.now();
  const log = s => process.stderr.write(s + '\n');
  /* 口調の一覧はページから（HK.TONE_KEYS＝選択欄の 49 口調） */
  const first = await openBuild(dir, mode);
  const info = await first.page.evaluate(() => ({ keys: window.HK.TONE_KEYS.slice(), persona: Object.keys(window.HK.PERSONA || {}), scen: Object.keys(window.HK.SCENARIOS) }));
  const want = arg('tones', '') ? String(arg('tones')).split(',').filter(Boolean) : info.keys;
  const unknown = want.filter(t => info.keys.indexOf(t) < 0).concat(o.scen.filter(s => info.scen.indexOf(s) < 0));
  if (unknown.length) { await first.browser.close(); console.error('知らない口調・箱庭：' + unknown.join(',')); process.exit(2); }
  const noJudge = want.filter(t => !JUDGE[t]);
  log('tone-feel：' + path.basename(dir) + (mode ? '#' + mode : '') + '・' + want.length + ' 口調 × ' + o.scen.join(',') + ' × N=' + o.N + ' × 種 ' + o.seeds.join(',') + '・ページ ' + o.jobs + ' 本' + (noJudge.length ? '（判定の無い口調：' + noJudge.join(',') + '）' : ''));
  const queue = want.slice(), results = {}, pageErr = [];
  const worker = async (pre) => {
    const ob = pre || await openBuild(dir, mode);
    try {
      let fresh = true;
      while (queue.length) {
        const t = queue.shift(), t1 = Date.now();
        /* 口調ごとにページを読み直す（前の口調の状態を持ち越さない。結果が並べ方・本数によらない） */
        if (!fresh) { await ob.page.goto(buildUrl(dir, mode)); await waitReady(ob.page); }
        fresh = false;
        const n0 = ob.errors.length;
        const res = await ob.page.evaluate(collectInPage, { tone: t, auto: AUTO.indexOf(t) >= 0 || info.persona.indexOf(t) >= 0 && !JUDGE[t], scen: o.scen, N: o.N, seeds: o.seeds });
        res.pageErr = ob.errors.slice(n0);
        res.pageErr.forEach(e => pageErr.push(t + ': ' + e));
        results[t] = judgeTone(res, o.seeds);
        const R = results[t];
        log('  ' + t.padEnd(12) + R.mark + ' ' + R.rate.toFixed(1) + '%（' + R.bad + '/' + R.total + ' 本）・' + ((Date.now() - t1) / 1000).toFixed(1) + ' 秒' + (R.simErr ? '・シミュレーションの失敗 ' + R.simErr : '') + (res.pageErr.length ? '・ページのエラー ' + res.pageErr.length : ''));
      }
    } finally { await ob.browser.close(); }
  };
  await Promise.all(Array.from({ length: Math.min(o.jobs, want.length) }, (_, i) => worker(i === 0 ? first : null)));
  const sec = (Date.now() - T0) / 1000;

  /* ---------- 出力 ---------- */
  const order = want.filter(t => results[t]);
  const L = [];
  L.push('| 口調 | 名前 | 判定の担当 | 台詞（種類／本） | 違和感（種類／本） | 割合 | ' + o.seeds.map((sd, i) => '種 ' + sd + (i ? '〜（見ていない）' : '〜（見た）')).join(' | ') + ' | 判定 | 多い規則 |');
  L.push('|---|---|---|---|---|---|' + o.seeds.map(() => '---|').join('') + '---|---|');
  order.forEach(t => {
    const R = results[t];
    const top = Object.entries(R.rules).sort((a, b) => b[1] - a[1]).slice(0, 3).map(([k, v]) => k + ' ' + v).join('・');
    L.push('| ' + t + ' | ' + R.label + ' | ' + R.judges.join('+') + ' | ' + R.lines + '／' + R.total + ' | ' + R.badKinds + '／' + R.bad + ' | ' + R.rate.toFixed(1) + '% | ' +
      o.seeds.map(sd => R.perSeed[sd].rate.toFixed(1) + '%（' + R.perSeed[sd].bad + '/' + R.perSeed[sd].total + '）').join(' | ') + ' | ' + R.mark + ' | ' + (top || '—') + (R.extra.nori != null ? '（ノリの印 ' + R.extra.nori + '%）' : '') + ' |');
  });
  console.log(L.join('\n'));
  if (whyN) order.forEach(t => {
    const R = results[t]; if (!R.bads.length) return;
    console.log('\n## ' + t + '（' + R.label + '）' + R.mark + ' ' + R.rate.toFixed(1) + '%：違和感の台詞（頻度順・' + Math.min(whyN, R.bads.length) + '/' + R.bads.length + ' 種）');
    R.bads.slice(0, whyN).forEach(b => console.log(b.n + '\t' + b.g + '\t' + b.why.join(',') + '\t' + b.s + '\t［' + b.src + '］' + (b.raw ? '\t元：' + b.raw : '')));
  });
  /* 基準との比べ（悪化：割合が 0.5 ポイント以上上がった・判定が下がった） */
  let worse = [];
  if (o.base) {
    const B = JSON.parse(fs.readFileSync(o.base, 'utf8')).tones || {};
    const rank = { '◯': 0, '△': 1, '✕': 2 };
    order.forEach(t => { const a = B[t], b = results[t]; if (!a) return; if (b.rate - a.rate >= 0.5 || rank[b.mark] > rank[a.mark]) worse.push(t + ' ' + a.rate.toFixed(1) + '% → ' + b.rate.toFixed(1) + '%' + (a.mark !== b.mark ? '（' + a.mark + '→' + b.mark + '）' : '')); });
    console.log('\n== 基準（' + path.basename(o.base) + '）との比べ：' + (worse.length ? '悪化した口調 ' + worse.length + '：' + worse.join('、') : '悪化した口調なし'));
  }
  const notO = order.filter(t => results[t].mark !== '◯');
  const simErr = order.reduce((s, t) => s + results[t].simErr, 0);
  const wrong = order.filter(t => results[t].wrong);
  if (simErr) order.forEach(t => results[t].simErrEx.forEach(x => console.log('シミュレーションの失敗：' + t + ' ' + x)));
  pageErr.slice(0, 5).forEach(x => console.log('ページのエラー：' + String(x).slice(0, 200)));
  if (wrong.length) console.log('（参考）口調が狙いと違った回：' + wrong.map(t => t + ' ' + results[t].wrong).join('、'));
  const runs = order.reduce((s, t) => s + results[t].runs, 0);
  console.log('\n== まとめ：' + (notO.length ? '◯ でない口調 ' + notO.length + '（' + notO.map(t => t + ' ' + results[t].mark + results[t].rate.toFixed(1) + '%').join('・') + '）' : 'すべて ◯') +
    '・シミュレーション ' + runs + ' 回' + (simErr ? '（失敗 ' + simErr + '）' : '') + (pageErr.length ? '・ページのエラー ' + pageErr.length : '') + '・所要 ' + sec.toFixed(0) + ' 秒');
  if (o.json) {
    const out = { meta: { build: path.basename(dir), mode, scen: o.scen, N: o.N, seeds: o.seeds, sec: +sec.toFixed(0), date: new Date().toISOString().slice(0, 10) }, tones: {} };
    order.forEach(t => { const R = Object.assign({}, results[t]); R.bads = R.bads.slice(0, 40); out.tones[t] = R; });
    fs.writeFileSync(o.json, JSON.stringify(out, null, 1) + '\n');
  }
  process.exitCode = notO.length || simErr || pageErr.length ? 1 : 0;
})().catch(e => { console.error(e && e.stack || e); process.exitCode = 1; });
