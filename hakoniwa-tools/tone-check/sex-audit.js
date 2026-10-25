/* 性的な場面の回数と、文の繰り返しを数える
   使い方: node sex-audit.js <ビルドのディレクトリ> [回数=30] [r18|safe|''] [箱庭id,…] [--hot] [--top=15]
   箱庭ごとに：
     回数  … 一回の性的な記録の数（平均・最大）、同じ二人の性的な記録の数（一回の中の最大）
     重複  … 一回の中で同じ性的な文（名前を伏せて比べる）が二度以上出た数（その回の性的な文に対する割合）
     偏り  … 全部の回を通して、いちばんよく出た性的な文（回をまたいで同じ文が出る＝表が小さい）
   性的な文は pos-audit の SEXCORE と同じ語で判定する */
'use strict';
const { openBuild } = require('./lib.js');
(async () => {
  const args = process.argv.slice(2).filter(a => !/^--/.test(a));
  const dir = args[0], N = +args[1] || 30, mode = args[2] || 'r18', only = args[3] ? args[3].split(',') : null;
  const HOT = process.argv.includes('--hot'), TOP = +((process.argv.find(a => /^--top=/.test(a)) || '--top=8').slice(6));
  const { browser, page, errors } = await openBuild(dir, mode);
  const r = await page.evaluate(({ N, only, HOT, TOP }) => {
    const SEX = /抱き潰|イカせ|イかせ|イった|イっ|果てた|果てる|果てて|喘|挿れ|挿入|愛撫|達した|達して|体を重ね|腰を(?:振|沈|打ち|揺|落と|突き|使)|跨[っがりるら]|犯さ|犯し|射精|ナカ|♡|昂り|濡れた音|濡れそぼ|奥まで(?:突|沈|貫)|最奥|繋がっ|繋がり|呑み込ん|搾り取|搾精|種付け|孕ま|白濁|中に出|ちんぽ|肉棒|秘部|膣|乳首|舐め上げ|舌を這/;
    const NAMES = ['アキラ', 'ミナト', 'ユキノ', 'カオル', 'ハルカ', 'レンジ'];
    const out = {};
    Object.keys(HK.SCENARIOS).filter(id => !only || only.indexOf(id) >= 0).forEach(sc => {
      const scen = HK.SCENARIOS[sc], lo = Math.max(2, scen.minCast || 1), hi = Math.min(scen.maxCast || 6, 6);
      const o = out[sc] = { runs: 0, ev: [], pairMax: [], dupRun: 0, sexSent: 0, freq: {} };
      for (let s = 0; s < N; s++) {
        const n = Math.max(lo, Math.min(hi, lo + (s % (hi - lo + 1))));
        const chars = []; for (let i = 0; i < n; i++) chars.push({ name: NAMES[i], eg: { CP: (s * 7 + i * 5) % 21, NP: (s * 3 + i * 11) % 21, A: (s * 13 + i * 3) % 21, FC: (s * 5 + i * 7) % 21, AC: (s * 11 + i * 3) % 21 }, gender: ['m', 'f', 'f', 'm', 'f', 'm'][(i + s) % 6], pos: ['top', 'bottom', '', 'riba', 'bottom', 'top'][(i + s) % 6], calls: {}, loveNG: [] });
        const env = {}; (scen.env || []).forEach(e => { env[e.id] = e.def != null ? e.def : (e.options && e.options[0] ? e.options[0].v : (e.min != null ? e.min : '')); });
        if (HOT) (scen.env || []).forEach(e => {
          if (e.max != null && /lewd|dose|shady|heat|prey|pleasure|traffic|ev$|aphro|night/.test(e.id)) env[e.id] = e.max;
          else if (e.options && /lewd/.test(e.id)) { const hi2 = e.options.filter(x => /high|max|lewd/.test(x.v))[0]; if (hi2) env[e.id] = hi2.v; }
        });
        if (HK.Content) env.ct = HK.Content.TAGS.map(t => t.id).join(',');
        const ties = n >= 2 ? [{ a: 0, b: 1, type: 'lover' }] : [];
        let res; try { res = HK.simulate({ scenId: sc, seed: 5300 + s, env, chars, perChar: chars.map(() => ({ pick: {} })), ties }); } catch (e) { continue; }
        o.runs++;
        let evs = 0; const pc = {}, seen = {};
        (res.log || []).forEach(e => {
          const t = e && e.text; if (typeof t !== 'string' || !SEX.test(t)) return;
          evs++;
          const ac = (e.actors || []).map(x => typeof x === 'number' ? x : x && x.i).filter(x => x != null).sort().join('-');
          if (ac.indexOf('-') > 0) pc[ac] = (pc[ac] || 0) + 1;
          let m = t; chars.forEach(c => { m = m.split(c.name).join('X'); });
          m.split(/(?<=[。！？」])/).forEach(x => {
            x = x.trim(); if (x.length < 12 || !SEX.test(x)) return;
            o.sexSent++;
            if (seen[x]) o.dupRun++; seen[x] = 1;
            o.freq[x] = (o.freq[x] || 0) + 1;
          });
        });
        o.ev.push(evs); o.pairMax.push(Math.max(0, ...Object.values(pc)));
      }
      const ks = Object.keys(o.freq).sort((a, b) => o.freq[b] - o.freq[a]);
      o.top = ks.slice(0, TOP).map(k => o.freq[k] + '× ' + k.slice(0, 70));
      o.distinct = ks.length;
      delete o.freq;
    });
    return out;
  }, { N, only, HOT, TOP });
  console.log('箱庭'.padEnd(10), '回数', '性的な記録/回(平均・最大)', '同じ二人の最大', '文の総数', '異なる文', '回の中の重複%');
  Object.keys(r).forEach(sc => {
    const o = r[sc]; if (!o.runs) return;
    const avg = o.ev.reduce((a, b) => a + b, 0) / o.runs, mx = Math.max(0, ...o.ev), pm = o.pairMax.reduce((a, b) => a + b, 0) / o.runs;
    console.log(sc.padEnd(10), String(o.runs).padStart(4), (avg.toFixed(1) + '・' + mx).padStart(10), pm.toFixed(1).padStart(8), String(o.sexSent).padStart(8), String(o.distinct).padStart(8), (o.sexSent ? (o.dupRun / o.sexSent * 100).toFixed(1) : '0').padStart(8));
  });
  if (TOP) Object.keys(r).forEach(sc => { const o = r[sc]; if (o.top && o.top.length && o.sexSent) { console.log('--- ' + sc); o.top.forEach(x => console.log('  ' + x)); } });
  console.log('pageerr', JSON.stringify(errors.slice(0, 3)));
  await browser.close();
})();
