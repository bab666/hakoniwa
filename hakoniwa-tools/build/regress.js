/* 読み込み方を変えても結果が変わらないかを確かめる：全箱庭を固定のシード・配役で回し、結果の指紋（ハッシュ）を出す
   node regress.js <ビルドのディレクトリ> [回数=6] [r18|safe] > out.json
   出力：{ mode, errors, hash: {箱庭: 指紋1}, hash2: {箱庭: 指紋2} }
   - 指紋1（hash）：今までどおり。口調の割り当てを HK.SCEN_ORDER の並びの通し番号で決める（並びが変わると全部変わる）
   - 指紋2（hash2）：並びに左右されない。口調の割り当ての始まりを箱庭の id から決める（箱庭を足したり並べ替えたりしても、ほかの箱庭の指紋は変わらない）
   分割読み込みの版（index.html に目録がある版）は #r18&all・#safe&all・#all で開き、全部のかたまりを読み終えてから回す（tone-check/lib.js の buildUrl）。
   ほかの道具（chunk-regress.js）向けに、指紋の取り方を module.exports で出している。 */
'use strict';
const path = require('path'), crypto = require('crypto');
const lib = require('../tone-check/lib.js');

/* ページの中で回す。arg = { N: 回数, kind: 1|2, ids: 回す箱庭（null なら HK.SCEN_ORDER の全部） }
   kind 1 の口調の通し番号は、ids を絞っても SCEN_ORDER の並び全体で数える（＝全部回したときと同じ配役になる。
   人数は minCast・maxCast だけから決まるので、目録の仮の箱庭でも数えられる）。
   本体を読む前の仮の箱庭（HK.Load.info の stub）は回さず 'STUB' を返す */
const FP = function (arg) {
  const HK = window.HK, N = arg.N, tones = HK.TONE_KEYS.slice(), NAMES = ['アキラ', 'ミナト', 'ユキノ', 'カオル', 'ハルカ', 'レンジ'];
  const POS = ['', 'top', 'bottom', 'riba'], G = ['m', 'f', ''];
  const castN = sc => Math.max(sc.minCast || 2, Math.min(sc.maxCast || 6, 6));
  const idHash = id => { let h = 0x811c9dc5; for (let i = 0; i < id.length; i++) { h ^= id.charCodeAt(i); h = Math.imul(h, 0x01000193) >>> 0; } return h; };
  /* 本体を読む前の箱庭は HK.SCENARIOS に無く、HK.Load.info(id) が目録の仮の箱庭（stub: true・minCast・maxCast）を返す */
  const info = id => HK.SCENARIOS[id] || (HK.Load && HK.Load.info ? HK.Load.info(id) : null);
  const order = HK.SCEN_ORDER.slice(), want = arg.ids || order;
  const start = {}; let acc = 0;
  order.forEach(id => { start[id] = acc; const sc = info(id); acc += sc ? castN(sc) * N : 0; });
  const res = {};
  want.forEach(id => {
    const sc = info(id);
    if (!sc) { res[id] = ['MISSING']; return; }
    if (sc.stub) { res[id] = ['STUB']; return; }
    const n = castN(sc), parts = [];
    let ti = arg.kind === 2 ? idHash(id) % 9973 : (start[id] != null ? start[id] : 0);
    for (let s = 0; s < N; s++) {
      const chars = [], perChar = [];
      for (let i = 0; i < n; i++) chars.push({ name: NAMES[i], eg: { CP: (s * 7 + i * 3) % 21, NP: (s * 5 + i * 11) % 21, A: (s * 3 + i * 13) % 21, FC: (s * 11 + i * 5) % 21, AC: (s * 13 + i * 7) % 21 }, memo: '', gender: G[(s + i) % 3], tone: tones[(ti++) % tones.length], pos: POS[(s + i) % 4], futa: (s + i) % 7 === 0 });
      for (let i = 0; i < n; i++) perChar.push({ action: 'auto', goal: 'auto', stats: {}, weapon: '', pick: {}, role: '' });
      const env = {}; (sc.env || []).forEach((e, k) => { env[e.id] = e.def != null ? e.def : (e.options && e.options[0] ? e.options[0].v : ''); if (s % 2 && e.max != null) env[e.id] = e.max; if (s % 3 === 2 && e.options && e.options.length > 1) env[e.id] = e.options[(s + k) % e.options.length].v; });
      const ties = s % 2 ? [{ a: 0, b: 1, type: 'lover' }, { a: 1, b: Math.min(2, n - 1), type: 'yan' }].filter(t => t.a !== t.b && t.b < n) : [];
      let r; try { r = JSON.stringify(HK.simulate({ scenId: id, seed: 777 + s * 131, env, chars, perChar, ties })); } catch (e) { r = 'ERR ' + e.message; }
      parts.push(r);
    }
    res[id] = parts;
  });
  return res;
};
const sha12 = parts => crypto.createHash('sha1').update(parts.join('\n')).digest('hex').slice(0, 12);
/* page で指紋を取る。opts = { N, kind: 1|2, ids, dump } → { 箱庭: 指紋 }（opts.dump があれば生の結果も返す） */
async function fingerprint(page, opts) {
  const out = await page.evaluate(FP, { N: opts.N || 6, kind: opts.kind || 1, ids: opts.ids || null });
  const h = {}; Object.keys(out).forEach(k => { h[k] = (out[k].length === 1 && /^(STUB|MISSING)$/.test(out[k][0])) ? out[k][0] : sha12(out[k]); });
  return opts.dump ? { h, out } : h;
}
async function launch() {
  const { chromium } = lib.loadPlaywright();
  const exe = process.env.CHROMIUM_PATH || (require('fs').existsSync('/opt/pw-browsers/chromium') ? '/opt/pw-browsers/chromium' : '');
  return chromium.launch(exe ? { executablePath: exe } : {});
}
/* 全部を読み終えるまで待つ（LATE_READY は、#all の版では全部のかたまりを読み終えたら true） */
async function waitReady(page) {
  await page.waitForFunction(() => window.HK && window.HK.simulate && window.HK.TONE_KEYS && (window.HK.LATE_READY !== false), null, { timeout: 180000 });
}
module.exports = { FP, fingerprint, launch, waitReady, sha12 };

if (require.main === module) (async () => {
  const dir = process.argv[2], N = +process.argv[3] || 6, mode = process.argv[4] || 'r18';
  const b = await launch();
  const p = await b.newPage(); const errors = [];
  p.on('pageerror', e => errors.push(String(e)));
  await p.goto(lib.buildUrl(dir, mode));
  await waitReady(p);
  const r1 = await fingerprint(p, { N, kind: 1, dump: !!process.env.DUMP });
  const h = process.env.DUMP ? r1.h : r1;
  const h2 = await fingerprint(p, { N, kind: 2 });
  console.log(JSON.stringify({ mode, errors, hash: h, hash2: h2 }));
  if (process.env.DUMP) require('fs').writeFileSync(process.env.DUMP, JSON.stringify(r1.out));
  await b.close();
})();
