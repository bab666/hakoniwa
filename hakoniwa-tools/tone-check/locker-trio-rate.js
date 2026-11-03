/* 媚薬ロッカー 三人の場面（3P）の起こりやすさの計測（担当LK3）
   使い方: node hakoniwa-tools/tone-check/locker-trio-rate.js <ビルドのフォルダ> [N=48] [--json=out.json] [--why] [--basic（基本の 6 行だけ）] [--scen=whiteroom（ほかの箱庭と比べる。列「性3人%」＝三人以上の性的な記録のある回）]
   ・人数 3／4／6 × 配役（fit：全員 両性・おまかせ・性欲 強・恋人だけなし／normal：性別・恋愛対象・受け攻め・性欲ふつうを混ぜる）× N 回（同じ種）
   ・追加の掃き出し（fit・4 人と 6 人）：layout big／split、night 0／100、romance 0／100、finder mob（参考）
   数える：三人の場面（ロッカーの中「三人で」／ベッド「三人の夜」）・三人のロッカーができた回・三人のロッカーで 3P にならなかった回とその理由 */
'use strict';
const lib = require('./lib.js');
const fs = require('fs');
const args = process.argv.slice(2).filter(a => !/^--/.test(a));
const dir = args[0], N = +args[1] || 48;
const jsonOut = (process.argv.find(a => /^--json=/.test(a)) || '').slice(7);
const WHY = process.argv.includes('--why');
const SCEN = (process.argv.find(a => /^--scen=/.test(a)) || '--scen=locker').slice(7);
const BASIC = process.argv.includes('--basic');
(async () => {
  const { browser, page, errors } = await lib.openBuild(dir, 'r18', { lewdMode: 'direct' });
  const res = await page.evaluate(({ N, WHY, SCEN, BASIC }) => {
    const HK = window.HK;
    const NAMES = ['アキラ', 'ユキノ', 'ミナト', 'ソラ', 'カエデ', 'ヒカル'];
    function cast(kind, n, s) {
      const chars = [];
      for (let i = 0; i < n; i++) {
        const eg = { CP: (s * 7 + i * 5) % 13, NP: 6 + (s * 3 + i * 11) % 13, A: (s * 13 + i * 3) % 13, FC: 8 + (s * 5 + i * 7) % 12, AC: (s * 11 + i * 3) % 13 };
        if (kind === 'fit') chars.push({ name: NAMES[i], eg, gender: (i + s) % 2 ? 'f' : 'm', likes: 'both', pos: '', tone: '', fp: '', calls: {}, memo: '', libido: 'high' });
        else {
          const g = (i * 3 + s) % 2 ? 'f' : 'm';
          const lk = ['both', 'opp', 'same', 'both', 'opp'][(i + s * 2) % 5];
          const likes = lk === 'both' ? 'both' : lk === 'opp' ? (g === 'm' ? 'f' : 'm') : g;
          const pos = ['', '', 'top', 'bot', 'riba'][(i * 7 + s) % 5];
          chars.push({ name: NAMES[i], eg, gender: g, likes, pos, tone: '', fp: '', calls: {}, memo: '', libido: ['', '', 'high', 'low'][(i + s) % 4] });
        }
      }
      return chars;
    }
    const sc = HK.SCENARIOS[SCEN];
    function envOf(over) {
      const env = {};
      (sc.env || []).forEach(e => { env[e.id] = e.def != null ? e.def : (e.options && e.options[0] ? e.options[0].v : (e.min != null ? e.min : '')); });
      if (SCEN === 'locker') { if (env.night == null) env.night = 50; if (env.romance == null) env.romance = 50; }
      if (HK.Content) env.ct = HK.Content.TAGS.map(t => t.id).filter(t => t !== 'force').join(',');
      return Object.assign(env, over || {});
    }
    const CFG = [];
    [3, 4, 6].forEach(n => ['fit', 'normal'].forEach(k => CFG.push({ key: k + '-' + n, kind: k, n, env: {} })));
    if (!BASIC) [4, 6].forEach(n => {
      [['layout=big', { layout: 'big' }], ['layout=split', { layout: 'split' }], ['night=0', { night: 0 }], ['night=100', { night: 100 }], ['romance=0', { romance: 0 }], ['romance=100', { romance: 100 }], ['finder=mob', { finder: 'mob' }]]
        .forEach(([lab, o]) => CFG.push({ key: 'fit-' + n + ' ' + lab, kind: 'fit', n, env: o }));
    });
    const out = {};
    for (const cf of CFG) {
      const o = out[cf.key] = { runs: 0, err: 0, lewd3: 0, p3: 0, p3locker: 0, p3bed: 0, trioLk: 0, trioLkNo3P: 0, kiss3: 0, why: {}, ex: [] };
      for (let s = 0; s < N; s++) {
        const chars = cast(cf.kind, cf.n, s);
        const input = { scenId: SCEN, seed: 9100 + s * 37, env: envOf(cf.env), chars, perChar: chars.map(() => ({ action: 'auto', goal: 'auto', stats: {}, pick: {}, role: '' })), ties: [] };
        let r;
        try { r = HK.simulate(input); } catch (e) { o.err++; if (o.ex.length < 3) o.ex.push('ERR ' + e.message); continue; }
        o.runs++;
        const log = r.log || [];
        const tags = log.map(e => e && e.tag);
        const inL = tags.indexOf('三人で') >= 0, inB = tags.indexOf('三人の夜') >= 0 || tags.indexOf('三人の絶頂') >= 0;
        if (log.some(e => e && e.lewd && Array.isArray(e.actors) && new Set(e.actors.map(a => typeof a === 'number' ? a : a && a.i)).size >= 3)) o.lewd3++;
        if (inL) o.p3locker++; if (inB) o.p3bed++; if (inL || inB) o.p3++;
        if (tags.indexOf('三人でキス') >= 0 || tags.indexOf('三人で寄り添う') >= 0) o.kiss3++;
        const wk = log.find(e => e && e.tag === '目覚め');
        const m = wk && /（(.*)）・拘束/.exec(String(wk.why || ''));
        const groups = m ? m[1].split('／').map(x => x.split('・')) : [];
        const tri = groups.filter(g => g.length === 3);
        if (tri.length) {
          o.trioLk++;
          if (!inL && !inB) {
            o.trioLkNo3P++;
            /* 理由：三人のロッカーの顔ぶれについて、ロッカーの記録から分類 */
            const names = tri[0];
            const evs = log.filter(e => e && Array.isArray(e.actors) && e.actors.length >= 2 && e.actors.every(a => names.indexOf((r.input || input).chars[typeof a === 'number' ? a : a.i] ? (r.input || input).chars[typeof a === 'number' ? a : a.i].name : '') >= 0));
            const tg = evs.map(e => e.tag).join(',');
            let k = '';
            if (/三人でキス|三人で寄り添う/.test(tg)) k = '三人で寄り添う／キスまで（熱・段が届かず）';
            else if (evs.some(e => /気持ちが、まだ追いついて/.test(e.why || ''))) k = '応じる側の気持ちが追いつかない（willing）';
            else if (/見守る|嫉妬|嗜めた/.test(tg)) k = '二人だけの触れ合い（三人の門を通らない）';
            else if (evs.some(e => /手を出さず|触れず|耐え/.test((e.why || '') + (e.tag || '')))) k = '手を出さずに耐えた';
            else k = '三人のロッカーで何も起きない（勢い不足）';
            /* 門（新しい版だけ）：LK.crowdGate.trio */
            let gate = '';
            if (HK.LOCKER.crowdGate && HK.LOCKER.crowdGate.trio) {
              try {
                const S = HK.Story.state(input, 'locker');
                S.ties = HK.Story.tiesOk ? HK.Story.tiesOk(S.P, input.ties) : [];
                S.nightNo = false;
                const mm = names.map(nm => S.P.find(p => p.name === nm));
                gate = HK.LOCKER.crowdGate.trio(S, mm) ? '門○' : '門×';
              } catch (e) { gate = '門?'; }
            }
            const kk = (gate ? gate + ' ' : '') + k;
            o.why[kk] = (o.why[kk] || 0) + 1;
            if (WHY && o.ex.length < 4) o.ex.push(kk + ' ｜ ' + names.join('・') + ' ｜ ' + evs.map(e => e.tag + ':' + String(e.why || '').slice(0, 50)).join(' / ').slice(0, 300));
          }
        }
      }
    }
    return out;
  }, { N, WHY, SCEN, BASIC });
  console.log('版', dir, 'N', N, 'pageerr', errors.slice(0, 2));
  console.log('配役'.padEnd(22), '3P%'.padStart(5), '性3人%'.padStart(6), '中'.padStart(4), 'ベッド'.padStart(5), '三人Lk'.padStart(6), 'Lk→3P%'.padStart(7), 'キス3'.padStart(5), ' 3Pにならない理由');
  for (const k in res) {
    const o = res[k];
    const pc = x => (o.runs ? Math.round(x / o.runs * 100) : 0) + '%';
    console.log(k.padEnd(22), pc(o.p3).padStart(5), pc(o.lewd3).padStart(6), String(o.p3locker).padStart(4), String(o.p3bed).padStart(5), String(o.trioLk).padStart(6), ((o.trioLk ? Math.round((o.trioLk - o.trioLkNo3P) / o.trioLk * 100) : 0) + '%').padStart(7), String(o.kiss3).padStart(5), ' ', Object.entries(o.why).sort((a, b) => b[1] - a[1]).map(([a, b]) => a + '=' + b).join('；'), o.err ? 'err ' + o.err : '');
    o.ex.forEach(x => console.log('    ' + x));
  }
  if (jsonOut) fs.writeFileSync(jsonOut, JSON.stringify(res, null, 1));
  await browser.close();
})();
