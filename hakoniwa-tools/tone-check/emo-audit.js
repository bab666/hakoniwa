/* 気分（HK.Emo）の点検：大きな出来事のあとに、何事もなかったような出来事が出ていないか
   使い方: node emo-audit.js <ビルドのディレクトリ> [1箱庭あたりの回数=16] [r18|safe|''] [箱庭id,…] [--why]
   E1: 悲しみの深い人（grief 60 以上）が、恋愛の出来事の主役になった（エンジン型。0 であること）
   E2: 気分の一句（HK.Emo の句）が、一つの区切りの中に二度出た（0 であること）
   E3: 全員の気分が最初から最後まで「平静」のまま終わった回の割合。気分を持つ箱庭ごとに、過半数（50% 超）なら数える
   E4: 気分の一句に、置き換え漏れ（{a} など）があった・全年齢で「火照り」の気分が立った
   気分を持つのは、エンジン型の箱庭（合コン・クラスメイト・無人島・出られない部屋・オメガバース・ゾンビの街ほか）と、物語型の邪神村・吹雪の館・宇宙船 */
'use strict';
const { openBuild } = require('./lib.js');
(async () => {
  const args = process.argv.slice(2).filter(a => !/^--/.test(a));
  const dir = args[0], N = +args[1] || 16, mode = args[2] || '', only = args[3] ? args[3].split(',') : null, WHY = process.argv.includes('--why');
  if (!dir) { console.log('使い方: node emo-audit.js <ビルドのディレクトリ> [回数] [r18|safe|\'\'] [箱庭id,…]'); process.exit(1); }
  const { browser, page, errors } = await openBuild(dir, mode);
  const r = await page.evaluate(({ N, only, WHY }) => {
    const X = HK.Emo;
    const out = { n: { E1: 0, E2: 0, E3: 0, E4: 0 }, ex: { E1: [], E2: [], E3: [], E4: [] }, bySc: {}, err: [] };
    if (!X) { out.err.push('HK.Emo がない'); return out; }
    let cur = null;
    const hit = (k, msg) => { out.n[k]++; if (cur) out.bySc[cur][k] = (out.bySc[cur][k] || 0) + 1; if (out.ex[k].length < (WHY ? 30 : 5)) out.ex[k].push((cur || '') + ' | ' + msg); };
    /* E1：記録に残った恋愛の出来事（飛ばされた分は数えない）の主役の悲しみを、記録の時点で見る */
    const Ctx = HK.Ctx;
    if (Ctx && !Ctx.prototype.say._emoAudit) {
      const say0 = Ctx.prototype.say;
      Ctx.prototype.say = function (o) {
        const a = o && o.actors && o.actors[0];
        const g = a && a.emo ? a.emo.grief : 0;
        const e = say0.apply(this, arguments);
        if (cur && e && !e.skipped && o.cat === 'romance' && (o.kind || 'phase') !== 'phase' && g >= X.LOVE_BLOCK) hit('E1', a.name + '（悲しみ ' + Math.round(g) + '）' + String(o.text).slice(0, 120));
        return e;
      };
      Ctx.prototype.say._emoAudit = true;
    }
    /* 句の一覧（{a} を名前に置き換えて探す） */
    const ALL = [];
    Object.keys(X.WORDS).forEach(at => Object.keys(X.WORDS[at]).forEach(m => X.WORDS[at][m].forEach(t => ALL.push(t))));
    if (X.WORDS_LUST) Object.keys(X.WORDS_LUST).forEach(at => X.WORDS_LUST[at].forEach(t => ALL.push(t)));
    const LUSTW = X.WORDS_LUST ? [].concat.apply([], Object.keys(X.WORDS_LUST).map(k => X.WORDS_LUST[k])) : [];
    const NAMES = ['アキラ', 'ミナト', 'ユキノ', 'カオル', 'ハルカ', 'レンジ', 'ソウタ', 'リコ'];
    const CASTS = [
      { g: ['m', 'f', 'm', 'f', 'm', 'f'], p: ['top', 'bottom', '', '', 'top', 'bottom'], ties: [{ a: 0, b: 1, type: 'lover' }, { a: 2, b: 3, type: 'yan' }] },
      { g: ['f', 'f', 'm', 'm', 'f', 'm'], p: ['', '', 'top', 'bottom', 'top', ''], ties: [{ a: 0, b: 1, type: 'lover' }] },
      { g: ['m', 'm', 'f', 'f', 'm', 'f'], p: ['top', 'bottom', 'top', 'bottom', '', ''], ties: [] },
      { g: ['f', 'm', 'f', 'm', 'f', 'm'], p: ['top', 'bottom', '', 'top', 'bottom', ''], ties: [{ a: 0, b: 1, type: 'friend' }, { a: 3, b: 2, type: 'crush' }] }
    ];
    const ids = (only || Object.keys(HK.SCENARIOS)).filter(id => { const s = HK.SCENARIOS[id]; return s && (!s.solo || X.STORY_EMO[id]); });
    for (const sc of ids) {
      const scen = HK.SCENARIOS[sc];
      out.bySc[sc] = { runs: 0, calm: 0 };
      cur = sc;
      for (let s = 0; s < N; s++) {
        const cast = CASTS[s % CASTS.length];
        const n = Math.max(scen.minCast || 2, Math.min(scen.maxCast || 6, 3 + (s % 4)));
        const chars = [];
        for (let i = 0; i < n; i++) chars.push({ name: NAMES[i], eg: { CP: (s * 7 + i * 5) % 21, NP: (s * 3 + i * 11) % 21, A: (s * 13 + i * 3) % 21, FC: (s * 5 + i * 7) % 21, AC: (s * 11 + i * 3) % 21 }, gender: cast.g[i % 6], pos: cast.p[i % 6], calls: {}, loveNG: [] });
        const env = {}; (scen.env || []).forEach(e => { env[e.id] = e.def != null ? e.def : (e.options && e.options[0] ? e.options[0].v : (e.min != null ? e.min : '')); });
        (scen.env || []).forEach((e, k) => { if (e.options && e.options.length > 1 && (s + k) % 3 === 0) env[e.id] = e.options[(s + k) % e.options.length].v; if (/^role_/.test(e.id)) env[e.id] = s % 2 ? 'res' : 'auto'; });
        if (HK.Content) env.ct = s % 2 ? HK.Content.TAGS.map(t => t.id).join(',') : '';
        const ties = cast.ties.filter(t => t.a < n && t.b < n);
        let res;
        try { res = HK.simulate({ scenId: sc, seed: 7100 + s, env, chars, perChar: chars.map(() => ({ pick: {} })), ties }); } catch (e) { out.err.push(sc + ': ' + String(e && e.stack || e).slice(0, 300)); continue; }
        out.bySc[sc].runs++;
        /* E2：区切りごとの句の数（文の中に、名前を入れた句がそのまま出たもの） */
        const nm = chars.map(c => c.name);
        const per = {};
        let stepK = 0;
        (res.log || []).forEach(e => {
          if (!e || typeof e.text !== 'string') return;
          if (e.kind === 'step') { stepK++; return; }
          const k = scen.solo ? stepK : (e.step != null ? e.step : stepK);
          let c = 0;
          ALL.forEach(t => nm.forEach(x => { const w = t.replace(/\{a\}/g, x); let at = -1; while ((at = e.text.indexOf(w, at + 1)) >= 0) c++; }));
          if (c) { per[k] = (per[k] || 0) + c; if (per[k] === 2) hit('E2', '区切り ' + (e.label || k) + ' | ' + e.text.slice(0, 120)); }
          if (/\{a\}/.test(e.text) && e.emoWord) hit('E4', '置き換え漏れ | ' + e.text.slice(0, 120));
          if (HK.SAFE_ON && LUSTW.some(t => nm.some(x => e.text.indexOf(t.replace(/\{a\}/g, x)) >= 0))) hit('E4', '全年齢で火照りの句 | ' + e.text.slice(0, 120));
        });
        /* E3：全員が平静のまま（いちばん強かった気分がない） */
        const L = scen.solo ? (res.heroes || []) : (res.chars || []);
        if (L.length && L.every(c => !c.moodPeak)) out.bySc[sc].calm++;
        if (HK.SAFE_ON && L.some(c => c.emo && c.emo.lust)) hit('E4', '全年齢で火照りの値 | ' + L.map(c => c.name).join('・'));
      }
      cur = null;
      const b = out.bySc[sc];
      if (b.runs && b.calm / b.runs > 0.5) { cur = sc; hit('E3', '平静のままの回 ' + b.calm + '/' + b.runs); cur = null; }
    }
    return out;
  }, { N, only, WHY });
  Object.keys(r.bySc).forEach(sc => { const b = r.bySc[sc]; console.log(sc.padEnd(10), 'runs', b.runs, '平静のまま', b.calm + '/' + b.runs, 'E1', b.E1 || 0, 'E2', b.E2 || 0, 'E4', b.E4 || 0); });
  console.log('合計', JSON.stringify(r.n));
  Object.keys(r.ex).forEach(k => { if (r.ex[k].length) { console.log('--- ' + k); r.ex[k].forEach(x => console.log('  ' + x.replace(/\n/g, ' '))); } });
  if (r.err.length) { console.log('--- 例外'); r.err.slice(0, 20).forEach(x => console.log('  ' + x)); }
  console.log('pageerr', JSON.stringify(errors.slice(0, 5)));
  await browser.close();
})();
