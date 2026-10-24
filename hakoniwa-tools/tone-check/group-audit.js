/* 複数人（三人以上）が出る恋愛・夜の出来事の、嫉妬系と仲良し系の比率を数える（設計指針：半々くらい）
   使い方: node group-audit.js <ビルドのディレクトリ> [回数=30] [r18|safe|''] [--why]
   嫉妬系（すれ違い）：理由か本文に 嫉妬・取り合い・恋敵・失恋・三角関係・執着 などがあるもの。それ以外（恋愛の分類か三人の場面）を仲良し系として数える
   配役は三人以上。回ごとに「恋人どうし＋片想い」「同じ人に恋人が二人」を交互に置く */
'use strict';
const { openBuild } = require('./lib.js');
(async () => {
  const args = process.argv.slice(2).filter(a => !/^--/.test(a));
  const dir = args[0], N = +args[1] || 30, mode = args[2] || '', WHY = process.argv.includes('--why');
  const { browser, page, errors } = await openBuild(dir, mode);
  const r = await page.evaluate(({ N, WHY }) => {
    const JEAL = /嫉妬|やきもち|ヤキモチ|取り合|恋敵|奪い合|張り合|修羅場|二股|浮気|独り占め|妬|失恋|三角関係|胸に刺さ|諦め|阻ん|執着|ふられ|振られ|選ばなかった|頷けなかった/;
    const NAMES = ['アキラ', 'ミナト', 'ユキノ', 'カオル', 'ハルカ', 'レンジ'];
    const out = {};
    Object.keys(HK.SCENARIOS).forEach(sc => {
      const scen = HK.SCENARIOS[sc]; if ((scen.maxCast || 6) < 3) return;
      const o = out[sc] = { jeal: 0, warm: 0, exJ: [], exW: [] };
      for (let s = 0; s < N; s++) {
        const n = Math.max(scen.minCast || 3, Math.min(scen.maxCast || 6, 3 + (s % 4)));
        const chars = []; for (let i = 0; i < n; i++) chars.push({ name: NAMES[i], eg: { CP: (s * 7 + i * 5) % 21, NP: (s * 3 + i * 11) % 21, A: (s * 13 + i * 3) % 21, FC: (s * 5 + i * 7) % 21, AC: (s * 11 + i * 3) % 21 }, gender: ['m', 'f', 'm', 'f', 'm', 'f'][(i + s) % 6], calls: {}, loveNG: [] });
        const env = {}; (scen.env || []).forEach(e => { env[e.id] = e.def != null ? e.def : (e.options && e.options[0] ? e.options[0].v : ''); });
        if (HK.Content) env.ct = HK.Content.TAGS.map(t => t.id).join(',');
        const ties = s % 2 ? [{ a: 0, b: 1, type: 'lover' }, { a: 1, b: 2, type: 'lover' }] : [{ a: 0, b: 1, type: 'lover' }, { a: 2, b: 0, type: 'crush' }];
        let res; try { res = HK.simulate({ scenId: sc, seed: 900 + s, env, chars, perChar: chars.map(() => ({ pick: {} })), ties: ties.filter(t => t.a < n && t.b < n) }); } catch (e) { continue; }
        (res.log || []).forEach(e => {
          if (!e || !e.text || (e.kind && /step|phase|death/.test(e.kind))) return;
          const ac = [...new Set((e.actors || []).map(x => typeof x === 'number' ? x : x && x.i).filter(x => x != null))];
          if (ac.length < 3) return;
          const rom = e.cat === 'romance' || /三人の場面|三人で|三人の夜|恋人たち|仲良し）/.test((e.tag || '') + (e.why || ''));
          if (!rom) return;
          const j = JEAL.test(((e.why || '') + (e.tag || '') + e.text).replace(/嫉妬：なし/g, ''));
          if (j) { o.jeal++; if (WHY && o.exJ.length < 3) o.exJ.push((e.why || e.tag || '').slice(0, 70)); } else { o.warm++; if (WHY && o.exW.length < 3) o.exW.push((e.why || e.tag || '').slice(0, 70)); }
        });
      }
    });
    return out;
  }, { N, WHY });
  let J = 0, W = 0;
  Object.keys(r).forEach(sc => {
    const o = r[sc]; J += o.jeal; W += o.warm; const t = o.jeal + o.warm; if (!t) return;
    console.log(sc.padEnd(10), '嫉妬系', String(o.jeal).padStart(4), '仲良し系', String(o.warm).padStart(4), '嫉妬の割合', (o.jeal / t * 100).toFixed(0) + '%');
    if (WHY) { o.exJ.forEach(x => console.log('    J ' + x)); o.exW.forEach(x => console.log('    W ' + x)); }
  });
  console.log('合計 嫉妬系', J, '仲良し系', W, '嫉妬の割合', (J / Math.max(1, J + W) * 100).toFixed(0) + '%');
  console.log('pageerr', JSON.stringify(errors.slice(0, 3)));
  await browser.close();
})();
