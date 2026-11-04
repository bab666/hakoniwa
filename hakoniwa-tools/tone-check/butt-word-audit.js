/* お尻の語の点検（2026-11-04。利用者の指摘「女性が受けでも地の文・台詞がケツ表記なのが気になる。女性相手だとお尻表記に」）
   使い方: node butt-word-audit.js <ビルドのディレクトリ> [1組あたりの回数=6] [箱庭id,…] [--why]
   R18版で、体の語の印（lewd-words.js）を普段の列（点検用の direct でなく）で解決し、男性向けの作風・描写「直接」・内容のスイッチ全部入りで回して、
   記録（地の文・台詞）に出た「ケツ」を組ごとに数える：
     (a) 受けが女性の体の組（男×女・女×女。受けの全員が女性器のある人）の記録の「ケツ」 … 目標 0 件
     (b) 受けが男性の体の組（女攻め×男・男×男）の記録の「ケツ」 … 作風どおり出ること（0 件なら「ケツ」の語が消えた疑い。参考の数）
   決まりは docs/reports/2026-10-26/lewd-words.md の「{尻}・{後ろ} の持ち主が女性の体の人」 */
'use strict';
const { openBuild } = require('./lib.js');
const args = process.argv.slice(2), flags = args.filter(a => /^--/.test(a)), pos = args.filter(a => !/^--/.test(a));
const dir = pos[0] || 'hakoniwa-full', N = +pos[1] || 6, WHY = flags.includes('--why');
const only = (pos[2] || process.env.HK_ONLY_SCEN || '').split(',').filter(Boolean);
(async () => {
  const { browser, page, errors } = await openBuild(dir, 'r18', { lewdMode: 'none' });
  const r = await page.evaluate(([only, N]) => {
    const HK = window.HK, out = { runs: 0, err: [], f: { n: 0, runs: 0, ex: [] }, m: { n: 0, runs: 0, ex: [] }, scen: {} };
    if (!HK.LewdWords) return { fatal: 'HK.LewdWords がない（R18版でない？）' };
    const ids = (only.length ? only : HK.SCEN_ORDER).filter(id => HK.SCENARIOS[id]);
    const NAMES = ['アキラ', 'ミナト', 'ユキノ', 'カオル'];
    /* [攻め, 受け, 三人目] の性別。f＝受けが女性の体（三人目も受けの女性）、m＝受けが男性の体（三人目はリバの男性）。箱庭の最少人数に足りない分は受けと同じ性別 */
    const G = [{ g: ['m', 'f'], k: 'f' }, { g: ['f', 'f'], k: 'f' }, { g: ['f', 'm'], k: 'm' }, { g: ['m', 'm'], k: 'm' }, { g: ['m', 'f', 'f'], k: 'f' }, { g: ['m', 'm', 'm'], k: 'm' }];
    const TIES = ['lover', 'fwb', 'enemy'];
    for (const sc of ids) {
      const scen = HK.SCENARIOS[sc];
      const st = out.scen[sc] = { f: 0, m: 0 };
      for (let s = 0; s < N; s++) for (const gg of G) {
        const n = Math.max(scen.minCast || 2, Math.min(scen.maxCast || 6, gg.g.length));
        if (n !== gg.g.length && n > 1 && gg.g.length === 3) continue;
        const chars = [];
        for (let i = 0; i < n; i++) chars.push({ name: NAMES[i], eg: { CP: (s * 7 + i * 5) % 21, NP: (s * 3 + i * 11) % 21, A: (s * 13 + i * 3) % 21, FC: (s * 5 + i * 7) % 21, AC: (s * 11 + i * 3) % 21 }, memo: '', gender: i < gg.g.length ? gg.g[i] : gg.g[1], likes: '', tone: '', fp: '', pos: i === 0 ? 'top' : i === 1 ? 'bottom' : (gg.k === 'f' ? 'bottom' : 'riba'), posLike: '', color: '', call: '', calls: {}, loveLock: '', genital: '' });
        const env = {}; (scen.env || []).forEach(e => { env[e.id] = e.def != null ? e.def : (e.options && e.options[0] ? e.options[0].v : (e.min != null ? e.min : '')); });
        (scen.env || []).forEach(e => {
          if (e.max != null && /lewd|dose|heat|aphro|night|pleasure/.test(e.id)) env[e.id] = e.max;
          if (e.id === 'mode' && e.options && e.options.some(o => o.v === 'lewd')) env[e.id] = 'lewd';
        });
        env.lewd = 'high'; env.style = 'ero'; env.lewdLen = s % 2 ? 'thick' : 'mix';
        if (HK.Content) env.ct = HK.Content.TAGS.map(t => t.id).join(',');
        if (sc === 'whiteroom') Object.assign(env, { cond: 'h', n1: 3, hours: 48 });
        const ties = [{ a: 0, b: 1, type: TIES[s % TIES.length] }];
        let res;
        try { res = HK.simulate({ scenId: sc, seed: 7300 + s * 13, env, chars, perChar: chars.map(() => ({ action: 'auto', goal: 'auto', stats: {}, weapon: '', pick: {} })), ties }); }
        catch (e) { out.err.push(sc + '#' + s + ' ' + String(e && e.stack || e).slice(0, 200)); continue; }
        out.runs++;
        const B = out[gg.k]; B.runs++;
        const texts = (res.log || []).map(e => e && typeof e.text === 'string' ? e.text : '');
        const E = res.ending || res.end; if (E) { (E.lines || []).forEach(l => typeof l === 'string' && texts.push(l)); if (typeof E.text === 'string') texts.push(E.text); }
        texts.forEach(t => {
          const c = t.replace(/[\u2060\u2064]/g, '');
          const re = /(?<!バ)ケツ(?!ァ)/g; let m;
          while ((m = re.exec(c))) {
            B.n++; st[gg.k]++;
            if (B.ex.length < 12) B.ex.push(sc + '#' + s + ' ' + gg.g.join('') + '：…' + c.slice(Math.max(0, m.index - 60), m.index + 30).replace(/\n+/g, ' ／ ') + '…');
          }
        });
      }
    }
    return out;
  }, [only, N]);
  if (r.fatal) { console.log(r.fatal); await browser.close(); process.exit(2); }
  console.log('回した回数 ' + r.runs + '・エラー ' + r.err.length);
  r.err.slice(0, 5).forEach(e => console.log('  ' + e));
  console.log('(a) 受けが女性の体の組（男×女・女×女）の「ケツ」: ' + r.f.n + ' 件（' + r.f.runs + ' 回）');
  if (WHY || r.f.n) r.f.ex.forEach(e => console.log('    ' + e));
  console.log('(b) 受けが男性の体の組（女攻め×男・男×男）の「ケツ」（参考。作風どおり出ること）: ' + r.m.n + ' 件（' + r.m.runs + ' 回）');
  if (WHY) r.m.ex.forEach(e => console.log('    ' + e));
  const hit = Object.keys(r.scen).filter(k => r.scen[k].f || r.scen[k].m);
  if (WHY && hit.length) console.log('箱庭ごと（女性の受け/男性の受け）: ' + hit.map(k => k + ' ' + r.scen[k].f + '/' + r.scen[k].m).join('、'));
  if (errors.length) console.log('ページのエラー: ' + errors.slice(0, 3).join(' / '));
  await browser.close();
  const bad = r.err.length + r.f.n;
  console.log(bad ? '要確認' : 'すべて合格');
  process.exit(bad ? 1 : 0);
})();
