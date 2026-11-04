/* 合意のない展開の二回目・三回目の点検（2026-11-04。仕組みは hakoniwa-full/js/force-repeat-r18.js、計測の数字は docs/reports/2026-11-04/force-repeat.md）
   使い方: node force-repeat-audit.js <ビルドのディレクトリ> [1組あたりの回数=24] [箱庭id,…] [--why]
   同じ二人に合意のない場面が 2〜3 回起きる配役（敵対・恐怖の二人。出られない部屋は条件「エッチ」3 回・48 時間。内容のスイッチは全部入）を回し、
     (a) 二回目・三回目の場面に回数の文（受けの拒みきれなかった理由・最初の抵抗・事後）が入った割合（目標 100%）
     (b) 一回の遊びの中で同じ台詞が二度出た件数（合意のない場面とその前振りの台詞。喘ぎ（漢字・読点の無い短い声）は除く。目標 0）
     (c) 回数の表の出方（n2／n3g（慣れ・諦め）／n3h（心が折れない）・部品ごと）
   ほかに、スイッチ「合意のない展開」を切った回で回数の段が出ないこと（S8 の見方：出たら件数）を数える */
'use strict';
const { openBuild } = require('./lib.js');
const args = process.argv.slice(2), flags = args.filter(a => /^--/.test(a)), pos = args.filter(a => !/^--/.test(a));
const dir = pos[0] || 'hakoniwa-full', N = +pos[1] || 24, ids = (pos[2] || 'whiteroom,omega,goukon,zombie,island,yakata').split(','), WHY = flags.includes('--why');
(async () => {
  const { browser, page, errors } = await openBuild(dir, 'r18', { lewdMode: 'direct' });
  const r = await page.evaluate(([ids, N, WHY]) => {
    const HK = window.HK, FR = HK.ForceRep, out = { runs: 0, err: [], byN: {}, scen: {}, a: { n: 0, ok: 0, ex: [] }, b: { n: 0, ex: [] }, c: { k: {}, parts: {} }, off: { runs: 0, hit: 0 } };
    if (!FR) return { fatal: 'HK.ForceRep がない' };
    const NAMES = ['アキラ', 'ミナト', 'ユキノ', 'カオル'], G = [['m', 'f'], ['f', 'f'], ['f', 'm'], ['m', 'm']], W = ['weak', 'avg', 'strong', ''];
    const TIES = ['enemy', 'fear'];
    const MOAN = s => !/[一-龥、]/.test(s) || s.length < 8;
    for (const sc of ids) {
      const scen = HK.SCENARIOS[sc]; if (!scen) { out.err.push('箱庭がない ' + sc); continue; }
      const st = out.scen[sc] = { runs: 0, scenes: 0, rep: 0 };
      for (let s = 0; s < N; s++) for (const off of [false, true]) {
        if (off && s % 4) continue;
        const g = G[s % 4];
        const chars = [0, 1].map(i => ({ name: NAMES[i], eg: { CP: (s * 7 + i * 5) % 21, NP: (s * 3 + i * 11) % 21, A: (s * 13 + i * 3) % 21, FC: (s * 5 + i * 7) % 21, AC: (s * 11 + i * 3) % 21 }, memo: '', gender: g[i], likes: '', tone: '', fp: '', pos: i === 0 ? 'top' : 'bottom', posLike: '', color: '', call: '', calls: {}, loveLock: '', genital: '', will: i === 1 ? W[(s >> 2) % 4] : '' }));
        const env = {}; (scen.env || []).forEach(e => { env[e.id] = e.def != null ? e.def : (e.options && e.options[0] ? e.options[0].v : (e.min != null ? e.min : '')); });
        if (HK.Content) env.ct = off ? '' : HK.Content.TAGS.map(t => t.id).join(',');
        env.lewd = s % 3 === 2 ? 'mid' : 'high'; if (s % 5 === 4) env.style = 'ero';
        if (sc === 'whiteroom') Object.assign(env, { cond: 'h', n1: 3, hours: 48 });
        const ty = TIES[(s >> 1) % 2], ties = [ty === 'fear' ? { a: 1, b: 0, type: 'fear', body: 'auto' } : { a: 0, b: 1, type: 'enemy' }];
        FR.log = [];
        let res;
        try { res = HK.simulate({ scenId: sc, seed: 9100 + s * 7, env, chars, perChar: chars.map(() => ({ action: 'auto', goal: 'auto', stats: {}, weapon: '', pick: {} })), ties }); }
        catch (e) { out.err.push(sc + '#' + s + ' ' + String(e && e.stack || e).slice(0, 300)); continue; }
        const L = FR.log; FR.log = null;
        if (off) { out.off.runs++; out.off.hit += L.filter(x => x.n >= 2).length; continue; }
        out.runs++; st.runs++;
        const log = res.log || [];
        const sceneN = new Set();
        L.forEach(x => {
          out.byN[x.n >= 3 ? '3+' : x.n] = (out.byN[x.n >= 3 ? '3+' : x.n] || 0) + 1; st.scenes++;
          if (x.e != null) sceneN.add(x.e);
          if (x.n >= 2) {
            st.rep++; out.a.n++;
            const ok = !!(x.parts && x.parts.resist && x.lead);
            if (ok) out.a.ok++; else if (out.a.ex.length < 5) out.a.ex.push(sc + '#' + s + ' n' + x.n + ' ' + JSON.stringify(x));
            const U = chars[1], k = x.n === 2 ? 'n2' : FR.holds(U) ? 'n3h' : 'n3g';
            out.c.k[k] = (out.c.k[k] || 0) + 1;
            for (const p in (x.parts || {})) if (x.parts[p]) out.c.parts[p] = (out.c.parts[p] || 0) + 1;
          }
        });
        /* (b) 合意のない場面と、その直前のきっかけの段の台詞の重なり */
        const seen = {};
        log.forEach((e, i) => {
          const isScene = sceneN.has(e.n != null ? e.n : i) || (log[i + 1] && sceneN.has(log[i + 1].n != null ? log[i + 1].n : i + 1) && e.tag === 'きっかけ');
          if (!isScene) return;
          const qs = String(e.text).match(/「[^「」]{2,80}」/g) || [];
          const inE = {};
          qs.forEach(q => {
            const c = q.slice(1, -1).replace(/[⁠♡゛]/g, '');
            if (MOAN(c) || inE[c]) return; inE[c] = 1;
            if (seen[c]) { out.b.n++; if (out.b.ex.length < 8) out.b.ex.push(sc + '#' + s + ' 「' + c + '」'); }
            seen[c] = 1;
          });
        });
      }
    }
    return out;
  }, [ids, N, WHY]);
  if (r.fatal) { console.log(r.fatal); await browser.close(); process.exit(2); }
  console.log('回した回数 ' + r.runs + '（スイッチ切 ' + r.off.runs + '）・エラー ' + r.err.length);
  r.err.slice(0, 5).forEach(e => console.log('  ' + e));
  console.log('箱庭ごと（回・合意のない場面・二回目以降）: ' + Object.keys(r.scen).map(k => k + ' ' + r.scen[k].runs + '/' + r.scen[k].scenes + '/' + r.scen[k].rep).join('、'));
  console.log('回数の分布: ' + JSON.stringify(r.byN));
  const pa = r.a.n ? (100 * r.a.ok / r.a.n).toFixed(1) : '-';
  console.log('(a) 二回目以降に回数の文が入った割合: ' + r.a.ok + '/' + r.a.n + '（' + pa + '%）');
  if (WHY) r.a.ex.forEach(e => console.log('    ' + e));
  console.log('(b) 同じ遊びの中で同じ台詞が二度出た件数: ' + r.b.n);
  if (WHY || r.b.n) r.b.ex.forEach(e => console.log('    ' + e));
  console.log('(c) 回数の表: ' + JSON.stringify(r.c.k) + '・部品 ' + JSON.stringify(r.c.parts));
  console.log('スイッチ切で回数の段が出た件数（S8）: ' + r.off.hit);
  if (errors.length) console.log('ページのエラー: ' + errors.slice(0, 3).join(' / '));
  await browser.close();
  const bad = r.err.length + r.b.n + r.off.hit + (r.a.n && r.a.ok < r.a.n ? 1 : 0) + (r.a.n ? 0 : 1);
  console.log(bad ? '要確認' : 'すべて合格');
  process.exit(bad ? 1 : 0);
})();
