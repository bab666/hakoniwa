/* 読み込み方を変えても結果が変わらないかを確かめる：全箱庭を固定のシード・配役で回し、結果の指紋（ハッシュ）を出す
   node regress.js <ビルドのディレクトリ> [回数=6] [r18|safe] > out.json */
'use strict';
const path = require('path'), crypto = require('crypto');
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || '/opt/node22/lib/node_modules/playwright');
(async () => {
  const dir = process.argv[2], N = +process.argv[3] || 6, mode = process.argv[4] || 'r18';
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
  const p = await b.newPage(); const errors = [];
  p.on('pageerror', e => errors.push(String(e)));
  await p.goto('file://' + path.resolve(dir) + '/index.html#' + mode);
  await p.waitForFunction(() => window.HK && window.HK.simulate && window.HK.TONE_KEYS && (window.HK.LATE_READY !== false), null, { timeout: 120000 });
  const out = await p.evaluate((N) => {
    const HK = window.HK, tones = HK.TONE_KEYS.slice(), NAMES = ['アキラ', 'ミナト', 'ユキノ', 'カオル', 'ハルカ', 'レンジ'];
    const POS = ['', 'top', 'bottom', 'riba'], G = ['m', 'f', ''];
    const res = {}; let ti = 0;
    HK.SCEN_ORDER.forEach(id => {
      const sc = HK.SCENARIOS[id]; const n = Math.max(sc.minCast || 2, Math.min(sc.maxCast || 6, 6)); const parts = [];
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
  }, N);
  const h = {}; Object.keys(out).forEach(k => { h[k] = crypto.createHash('sha1').update(out[k].join('\n')).digest('hex').slice(0, 12); });
  console.log(JSON.stringify({ mode, errors, hash: h }));
  if (process.env.DUMP) require('fs').writeFileSync(process.env.DUMP, JSON.stringify(out));
  await b.close();
})();
