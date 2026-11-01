/* 恋愛相手・性行為の相手を複数人に固定したときの三人の場面（3P）の点検（2026-11-01 担当LK。利用者の不具合報告
   「攻め・攻め・受けの三人で、受けの恋愛相手を攻めの二人に固定すると 3P が起きない」の確かめ）
   使い方: node hakoniwa-tools/tone-check/lock-trio-check.js <ビルドのフォルダ> [N=200] [--scen=locker] [--fuzz=3000]
   ・表 1（N 回ずつ）：攻め・攻め・受け（男男女・男男男・女女男・女女女）× 受けの設定（恋愛相手の固定＝攻め二人／一人／なし、
     性行為の相手の固定＝二人／一人、恋愛相手の固定を相互に、一途＋恋人二人）で、三人の場面（媚薬ロッカーの「三人で」「三人の夜」「三人の絶頂」、
     ほかの箱庭は体の場面の印 lewd の付いた三人以上の記録）の出た率
   ・表 2（4 人）：攻め A・B・受け C・攻め D で、C が A・B を固定。三人の場面のうち A・B・C の回と、C と D がいっしょに体の場面に出た回（0 であること）
   ・門の食い違い（--fuzz 回。媚薬ロッカーのとき）：ばらばらの三人で、一人が残りの二人を固定した回と固定なしの回で、事前の表示の「成り立つ三人」
     （LK.crowdGate.trio：本番と同じ判定）が食い違う配役の数（0 であること。三人の中だけの固定は三人の場面を変えない） */
'use strict';
const lib = require('./lib.js');
const args = process.argv.slice(2).filter(a => !/^--/.test(a));
const dir = args[0], N = +args[1] || 200;
const SCEN = (process.argv.find(a => /^--scen=/.test(a)) || '--scen=locker').slice(7);
const FUZZ = +((process.argv.find(a => /^--fuzz=/.test(a)) || '--fuzz=3000').slice(7));
(async () => {
  const { browser, page, errors } = await lib.openBuild(dir, 'r18', { lewdMode: 'direct' });
  const res = await page.evaluate(({ N, SCEN, FUZZ }) => {
    const HK = window.HK, sc = HK.SCENARIOS[SCEN];
    const env0 = {};
    (sc.env || []).forEach(e => { env0[e.id] = e.def != null ? e.def : (e.options && e.options[0] ? e.options[0].v : (e.min != null ? e.min : '')); });
    if (env0.night == null) env0.night = 50; if (env0.romance == null) env0.romance = 50;
    if (SCEN === 'locker') env0.layout = 'big';
    if (HK.Content) env0.ct = HK.Content.TAGS.map(t => t.id).filter(t => t !== 'force').join(',');
    const NM = ['アキラ', 'ミナト', 'ユキノ', 'ソラ'];
    const TRIO_TAG = /^(三人で|三人の夜|三人の絶頂)$/;
    const ids = e => (e.actors || []).map(a => typeof a === 'number' ? a : a && a.i);
    /* 三人の場面：媚薬ロッカーの札か、ほかの箱庭では体の場面の印（lewd）で三人以上が出る記録 */
    const isTrio = e => !!e && (TRIO_TAG.test(e.tag || '') || (!!e.lewd && new Set(ids(e)).size >= 3));
    const egOf = (s, i) => ({ CP: (s * 7 + i * 5) % 13, NP: 6 + (s * 3 + i * 11) % 13, A: (s * 13 + i * 3) % 13, FC: 8 + (s * 5 + i * 7) % 12, AC: (s * 11 + i * 3) % 13 });
    const run = (chars, ties, seed) => HK.simulate({ scenId: SCEN, seed, env: Object.assign({}, env0), chars, perChar: chars.map(() => ({ action: 'auto', goal: 'auto', stats: {}, pick: {}, role: '' })), ties });
    /* 表 1 */
    const GS = { '男男女': 'mmf', '男男男': 'mmm', '女女男': 'ffm', '女女女': 'fff' };
    const SET = {
      'a 恋愛の固定＝攻め二人': c => { c[2].loveLock = [0, 1]; },
      'b 恋愛の固定＝攻め一人': c => { c[2].loveLock = 0; },
      'c 固定なし': () => {},
      'd 性行為の固定＝二人': c => { c[2].sexLock = [0, 1]; },
      'd 性行為の固定＝一人': c => { c[2].sexLock = 0; },
      'e 恋愛の固定（相互）': c => { c[2].loveLock = [0, 1]; c[0].loveLock = 2; c[1].loveLock = 2; },
      'f 一途＋恋人二人': c => { c[2].faithful = true; },
      'g 恋人二人（一途なし）': () => {}
    };
    const t1 = [];
    for (const g in GS) for (const k in SET) {
      let runs = 0, p3 = 0, err = 0;
      for (let s = 0; s < N; s++) {
        const chars = [0, 1, 2].map(i => ({ name: NM[i], eg: egOf(s, i), gender: GS[g][i], likes: 'both', pos: i < 2 ? 'top' : 'bottom', tone: '', fp: '', calls: {}, memo: '', libido: 'high' }));
        SET[k](chars);
        const ties = k[0] === 'f' || k[0] === 'g' ? [{ a: 2, b: 0, type: 'lover' }, { a: 2, b: 1, type: 'lover' }] : [];
        let r; try { r = run(chars, ties, 7100 + s * 37); } catch (e) { err++; continue; }
        runs++;
        if ((r.log || []).some(isTrio)) p3++;
      }
      t1.push({ g, k, runs, p3, err });
    }
    /* 表 2：4 人（C が A・B を固定。D は固定にない人） */
    const t2 = [];
    for (const f of ['loveLock', 'sexLock']) for (const g of ['mmfm', 'fffm', 'mmmm']) {
      let runs = 0, abc = 0, cd = 0, err = 0;
      for (let s = 0; s < N; s++) {
        const chars = [0, 1, 2, 3].map(i => ({ name: NM[i], eg: egOf(s, i), gender: g[i], likes: 'both', pos: i === 2 ? 'bottom' : 'top', tone: '', fp: '', calls: {}, memo: '', libido: 'high' }));
        chars[2][f] = [0, 1];
        let r; try { r = run(chars, [], 8100 + s * 29); } catch (e) { err++; continue; }
        runs++;
        const log = r.log || [];
        if (log.some(e => isTrio(e) && Array.from(new Set(ids(e))).sort().join() === '0,1,2')) abc++;
        if (log.some(e => e && e.lewd && ids(e).indexOf(2) >= 0 && ids(e).indexOf(3) >= 0)) cd++;
      }
      t2.push({ f, g, runs, abc, cd, err });
    }
    /* 門の食い違い（媚薬ロッカーの事前の表示と同じ判定） */
    const fz = { n: 0, diff: 0, ex: [] };
    if (SCEN === 'locker' && HK.LockerNote && HK.LockerNote.preview) {
      let seed = 777; const rnd = () => (seed = (seed * 1103515245 + 12345) % 2147483648) / 2147483648; const pick = a => a[Math.floor(rnd() * a.length)];
      for (let n = 0; n < FUZZ; n++) {
        const chars = [0, 1, 2].map(i => {
          const c = { name: NM[i], eg: { CP: Math.floor(rnd() * 20), NP: Math.floor(rnd() * 20), A: Math.floor(rnd() * 20), FC: Math.floor(rnd() * 20), AC: Math.floor(rnd() * 20) }, gender: pick(['m', 'f']), likes: pick(['both', 'both', 'm', 'f', 'none']), pos: pick(['top', 'bottom', 'riba', '']), tone: '', fp: '', calls: {}, memo: '' };
          if (rnd() < 0.3) c.libido = pick(['high', 'low', 'none']);
          if (rnd() < 0.15) c.faithful = true;
          if (rnd() < 0.2) { c.posFor = {}; c.posFor[(i + 1 + Math.floor(rnd() * 2)) % 3] = pick(['top', 'bottom', 'riba']); }
          if (rnd() < 0.15) c.sexLikes = pick(['m', 'f', 'both']);
          if (rnd() < 0.15) c.sexLock = 'any';
          return c;
        });
        const X = Math.floor(rnd() * 3), O = [0, 1, 2].filter(i => i !== X), ties = [];
        if (rnd() < 0.6) O.forEach(o => { if (rnd() < 0.6) ties.push({ a: X, b: o, type: pick(['lover', 'crush', 'fwb', 'friend', 'almost', 'honmei', 'mate', 'rival', 'enemy', 'ex']) }); });
        if (rnd() < 0.3) ties.push({ a: O[0], b: O[1], type: pick(['lover', 'friend', 'rival', 'fwb', 'crush']) });
        const env = Object.assign({}, env0, { night: pick([50, 50, 100]), romance: pick([50, 50, 0, 100]) });
        const mode = pick(['love', 'sex', 'sexMob', 'both']);
        const gate = lockOn => {
          const cs = JSON.parse(JSON.stringify(chars));
          if (lockOn) { if (mode === 'love' || mode === 'both') cs[X].loveLock = O.slice(); if (mode !== 'love') { cs[X].sexLock = O.slice(); if (mode === 'sexMob') cs[X].sexLockMob = true; } }
          const r = HK.LockerNote.preview({ scenId: 'locker', seed: 1, env, chars: cs, perChar: cs.map(() => ({ action: 'auto', goal: 'auto', stats: {}, pick: {}, role: '' })), ties: JSON.parse(JSON.stringify(ties)) });
          return r ? JSON.stringify(r.trios) : 'null';
        };
        fz.n++;
        const a = gate(true), c = gate(false);
        if (a !== c) { fz.diff++; if (fz.ex.length < 5) fz.ex.push(mode + ' X=' + X + ' 固定=' + a + ' なし=' + c + ' ' + JSON.stringify(chars.map(q => [q.gender, q.likes, q.pos, q.libido || '', q.posFor || '', q.sexLock || ''])) + ' ' + JSON.stringify(ties)); }
      }
    }
    return { t1, t2, fz };
  }, { N, SCEN, FUZZ });
  console.log('版', dir, '箱庭', SCEN, 'N', N, errors.length ? 'pageerr ' + errors.slice(0, 2).join(' / ') : '');
  console.log('■ 表1 攻め・攻め・受け（三人の場面の出た率）');
  res.t1.forEach(o => console.log('  ' + (o.g + ' ' + o.k).padEnd(24), String(o.runs).padStart(4) + '回', ((o.runs ? Math.round(o.p3 / o.runs * 1000) / 10 : 0) + '%').padStart(7), o.err ? 'err ' + o.err : ''));
  console.log('■ 表2 4人（受け C が攻め A・B を固定、D は固定にない攻め）');
  res.t2.forEach(o => console.log('  ' + (o.f + ' ' + o.g).padEnd(16), String(o.runs).padStart(4) + '回', 'A・B・C の三人の場面 ' + ((o.runs ? Math.round(o.abc / o.runs * 1000) / 10 : 0) + '%').padStart(6), ' C と D の体の場面 ' + o.cd + ' 回', o.err ? 'err ' + o.err : ''));
  if (res.fz.n) { console.log('■ 門の食い違い（三人の中だけの固定と固定なし）: ' + res.fz.diff + ' / ' + res.fz.n); res.fz.ex.forEach(x => console.log('    ' + x)); }
  const bad = res.t2.reduce((s, o) => s + o.cd + o.err, 0) + res.fz.diff + res.t1.reduce((s, o) => s + o.err, 0);
  console.log(bad ? '問題 ' + bad + ' 件' : 'すべて 0 件');
  await browser.close();
  process.exit(bad ? 1 : 0);
})();
