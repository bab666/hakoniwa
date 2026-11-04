/* 血縁の二人を「友人」にしない点検（2026-11-04。決まりと数字は docs/reports/2026-11-04/kin-and-topics.md）
   使い方: node kin-label-audit.js <ビルドのディレクトリ> [1箱庭・1モードあたりの回数=6] [--scen=whiteroom,…] [--modes=r18,safe,zen] [--zen=全年齢版のフォルダ] [--why]
   ・住人 0・1 に血縁の関係（親子・擬似親子・兄弟姉妹・兄弟（庇護）・兄弟（親友のよう）・兄弟（不仲）・双子・義理の兄弟・親族）を置き、
     「恋愛：自動／あり」（双子は自動だけ）・性別・人数（2〜3 人）を回ごとに回して、全箱庭（--scen= で絞る）を回す
   ・数える型：
       K1 結末：二人の結末の関係の名前・結末の文（res.pairs）、住人の結末の注記（fateNote）に「友人・友達・親友」
       K2 関係図：関係図の「開始時」「転機」の札（HK.MapView.atOf）に「友人・友達・親友」
       K3 台詞：二人だけの記録（actors が二人とも血縁の二人）の「」の中に、二人を友人として扱う言い回し
       K4 地の文：同じ記録の「」の外と理由（why）に、二人を友人として扱う言い回し
     関係の名前そのもの（「兄弟（親友のよう）」）と、その説明の「親友のように育った」などは、利用者が選んだ関係の名前なので数えない（EXCL）
       K0 回の失敗：血縁の配役でシミュレーションが例外で止まった
   ・合格は K0〜K4 の合計 0 件（全年齢版は --modes=zen で、ビルドのフォルダを hakoniwa-zenrei に読み替える）
   ・audit-all とは別に、check.js が「血縁の札（kin-label）」として回す（engine・view-map・tie-*・rel-*・共通の出来事・結末を変えたとき） */
'use strict';
const core = require('./audit/core.js');

/* ---------- パス kin（ページの中）：opt = { N, only } ---------- */
const PASS = function* (HK, opt) {
  const N = opt.N || 6;
  const KIN = [
    { type: 'parent', ages: [46, 22] }, { type: 'pparent', ages: [44, 23] }, { type: 'sibling', ages: [26, 22] }, { type: 'sibprot', ages: [27, 21] },
    { type: 'sibclose', ages: [24, 23] }, { type: 'sibbad', ages: [25, 22] }, { type: 'twin', ages: [22, 22] }, { type: 'stepsib', ages: [24, 21] }, { type: 'relative', ages: [30, 26] }
  ];
  const NAMES = ['アキラ', 'ユキノ', 'ハヤテ'];
  const ids = (HK.SCEN_ORDER || Object.keys(HK.SCENARIOS)).filter(id => HK.SCENARIOS[id] && !(HK.SCEN_ONLY && HK.SCEN_ONLY.indexOf(id) < 0) && !(opt.only && opt.only.length && opt.only.indexOf(id) < 0));
  for (const id of ids) {
    const sc = HK.SCENARIOS[id];
    const minC = Math.max(2, sc.minCast || 2), maxC = Math.max(minC, Math.min(sc.maxCast || 6, 3));
    for (let s = 0; s < N; s++) {
      const K = KIN[s % KIN.length];
      const n = Math.max(minC, Math.min(maxC, 2 + ((s >> 1) % 2)));
      const gs = [['m', 'f', 'm'], ['f', 'f', 'm'], ['m', 'm', 'f'], ['f', 'm', 'f']][(s + (s / KIN.length | 0)) % 4];
      const chars = [];
      for (let i = 0; i < n; i++) chars.push({ name: NAMES[i] || ('住人' + i), gender: gs[i % 3], likes: '', age: i < 2 ? K.ages[i] : 25,
        eg: { CP: (s * 7 + i * 5) % 21, NP: (s * 3 + i * 11) % 21, A: (s * 13 + i * 3) % 21, FC: (s * 5 + i * 7) % 21, AC: (s * 11 + i * 3) % 21 }, calls: {}, tone: '', fp: '', memo: '' });
      const env = {}; (sc.env || []).forEach(e => { env[e.id] = e.def != null ? e.def : (e.options && e.options[0] ? e.options[0].v : (e.min != null ? e.min : '')); });
      (sc.env || []).forEach(e => { if (e.max != null && s % 2 === 0 && /romance|love|night|ev|heat/.test(e.id)) env[e.id] = e.max; });
      if (HK.Content) env.ct = HK.Content.TAGS.map(t => t.id).join(',');
      /* 「恋愛：あり」は双子以外で 3 回に 1 回（恋愛へ進んでも、表示は血縁を残す） */
      const love = K.type !== 'twin' && s % 3 === 2 ? 'ok' : '';
      const ties = [{ a: 0, b: 1, type: K.type, love }];
      const input = { scenId: id, seed: 7300 + s * 17, env, chars, perChar: chars.map(() => ({ pick: {} })), ties };
      yield { sc: id, s, input, meta: { kin: K.type, love, gs: gs.slice(0, n).join(''), n } };
    }
  }
};

/* ---------- 判定 kin（ページの中）：opt = { why } ---------- */
const JUDGE = function (HK, opt) {
  const WHY = !!opt.why, LIM = WHY ? 60 : 3;
  const WORD = /友人|友達|友だち|親友|ともだち|女友達|男友達/;
  /* 二人を友人として扱わない言い回し（数えない）：関係の名前・その説明、第三者の友人（「友達に会う」など）、否定（「友達じゃない」） */
  const EXCL = /親友のよう|親友や幼馴染のよう|友達のよう|友人のよう|(?:友人|友達|友だち)(?:に会|と会|と遊|と飲|の家|の結婚|から|に誘|が来|に呼ば|との約束|に頼|の話|が多|もいな|もでき|が少な|と出かけ|と電話|からの|に電話|に連絡|と旅行|と長電話|にも教え|を一人失|を連れて|の声|「)|(?:の|学校の|職場の|昔の|共通の|地元の|大学の|遊びに来ていた)(?:友人|友達)|^\s*(?:友人|友達)は|(?:友人|友達)のところ|(?:友人|友達|友だち)(?:じゃ|では|なんか|なんて)(?:な|あり)/;
  const out = { runs: 0, n: { K0: 0, K1: 0, K2: 0, K3: 0, K4: 0 }, ex: { K0: [], K1: [], K2: [], K3: [], K4: [] }, bySc: {}, byKin: {}, uniq: {} };
  function add(k, run, s, where) {
    out.n[k]++;
    const b = out.bySc[run.sc] = out.bySc[run.sc] || { K0: 0, K1: 0, K2: 0, K3: 0, K4: 0 }; b[k]++;
    out.byKin[run.meta.kin] = (out.byKin[run.meta.kin] || 0) + 1;
    const line = run.sc + ' ' + run.mode + ' #' + run.s + '（' + run.meta.kin + (run.meta.love ? '・恋愛あり' : '') + '・' + run.meta.gs + '）［' + where + '］' + String(s).trim().replace(/\n/g, ' ').slice(0, 160);
    if (out.ex[k].length < LIM) out.ex[k].push(line);
    if (WHY) { const u = run.sc + ' ' + k + ' ［' + where + '］' + String(s).trim().replace(/アキラ/g, '{A}').replace(/ユキノ/g, '{B}').replace(/\n/g, ' ').slice(0, 140); out.uniq[u] = (out.uniq[u] || 0) + 1; }
  }
  const EXG = new RegExp(EXCL.source, 'g');
  const hit = s => WORD.test(String(s || '').replace(EXG, ''));
  const pairOf = (P) => (P || []).filter(p => p && ((p.a === 0 && p.b === 1) || (p.a === 1 && p.b === 0)))[0];
  return {
    /* 回が落ちた（シミュレーションの例外）も数える（血縁の配役でだけ通る道の不具合を見逃さない） */
    error(run, e) { run.mode = HK.SAFE_ON ? 'safe' : (HK.R18 === false ? 'zen' : 'r18'); add('K0', run, String(e && e.message || e), '例外'); },
    end(run, res) {
      out.runs++;
      run.mode = HK.SAFE_ON ? 'safe' : (HK.R18 === false ? 'zen' : 'r18');
      const p = pairOf(res.pairs);
      /* K1 結末 */
      if (p) {
        if (hit(p.name)) add('K1', run, p.name, '結末の関係');
        if (hit(p.text || '')) add('K1', run, p.text, '結末の文');
      }
      (res.chars || []).slice(0, 2).forEach((c, i) => { const o = (res.chars[1 - i] || {}).name; if (c && o && typeof c.fateNote === 'string' && c.fateNote.indexOf(o) >= 0 && hit(c.fateNote)) add('K1', run, c.fateNote, '住人の結末'); });
      /* K2 関係図（開始時・転機） */
      const MV = HK.MapView;
      if (MV && MV.atOf) ['start', 'tp'].forEach(at => {
        let r2 = null; try { r2 = MV.atOf(res, at); } catch (e) { r2 = null; }
        const q = r2 && pairOf(r2.pairs);
        if (q && hit(q.name)) add('K2', run, q.name, at === 'start' ? '関係図・開始時' : '関係図・転機');
      });
      /* K3・K4 二人だけの記録 */
      (res.log || []).forEach(e => {
        if (!e || !e.text || e.kind === 'step' || e.kind === 'phase') return;
        const ac = [...new Set((e.actors || []).map(x => typeof x === 'number' ? x : x && x.i))];
        if (!(ac.length === 2 && ac.indexOf(0) >= 0 && ac.indexOf(1) >= 0)) return;
        const t = String(e.text);
        const qs = t.match(/「[^」]*」/g) || [];
        qs.forEach(q => { if (hit(q)) add('K3', run, q, e.tag || e.cat || '出来事'); });
        const nar = t.replace(/「[^」]*」/g, '「」') + ' ' + (e.why || '');
        nar.split(/(?<=[。！？\n])/).forEach(x => { if (hit(x)) add('K4', run, x, e.tag || e.cat || '出来事'); });
      });
    },
    finish() { return out; }
  };
};

const LABEL = { K0: '回の失敗（例外）', K1: '結末（関係の名前・結末の文）', K2: '関係図の札（開始時・転機）', K3: '台詞', K4: '地の文・理由' };
function print(r, errors, o) {
  if (!r) { console.log('結果なし'); return; }
  console.log('血縁の二人の回 ' + r.runs + ' 回');
  Object.keys(LABEL).forEach(k => console.log('  ' + k + ' ' + LABEL[k] + '：' + r.n[k] + ' 件'));
  Object.keys(r.bySc).forEach(sc => console.log('  箱庭 ' + sc + '：' + Object.keys(LABEL).map(k => k + ' ' + r.bySc[sc][k]).join('・')));
  if (Object.keys(r.byKin).length) console.log('  関係ごと：' + Object.keys(r.byKin).map(k => k + ' ' + r.byKin[k]).join('・'));
  if (o.why) {
    console.log('文ごと（多い順。名前は {A}{B}）：');
    Object.keys(r.uniq || {}).sort((a, b) => r.uniq[b] - r.uniq[a]).forEach(k => console.log('    ' + String(r.uniq[k]).padStart(4) + '  ' + k));
  }
  Object.keys(LABEL).forEach(k => { if (!r.ex[k].length) return; console.log('例 ' + k + '（' + LABEL[k] + '）：'); r.ex[k].forEach(x => console.log('    ' + x)); });
  if (errors && errors.length) console.log('pageerr', JSON.stringify(errors.slice(0, 3)));
}
function summarize(r) {
  const items = {}, ex = {};
  if (!r || !r.n) return { items, ex, info: {}, err: 0 };
  Object.keys(LABEL).forEach(k => { items[k] = r.n[k]; ex[k] = r.ex[k].slice(0, 3); });
  return { items, ex, info: { 血縁の二人の回: r.runs }, err: 0 };
}
module.exports = { passes: { kin: PASS }, judges: { kin: JUDGE }, print, summarize, LABEL };

if (require.main === module) (async () => {
  const args = process.argv.slice(2).filter(a => !/^--/.test(a));
  const arg = (n, d) => { const a = process.argv.find(x => x.indexOf('--' + n + '=') === 0); return a ? a.slice(n.length + 3) : d; };
  const dir = args[0] || 'hakoniwa-full', N = +args[1] || 6, WHY = process.argv.includes('--why');
  const only = arg('scen', '').split(',').filter(Boolean);
  const modes = arg('modes', 'r18,safe,zen').split(',').filter(Boolean);
  let bad = 0, errs = 0;
  for (const m of modes) {
    const hash = m === 'zen' ? '' : m;
    const t = await core.runTool({ dir: m === 'zen' ? arg('zen', dir.replace(/hakoniwa-full(\/?)$/, 'hakoniwa-zenrei$1')) : dir, hash, lewdMode: '', mod: module.exports, pass: 'kin', judge: 'kin', opt: { N, only, why: WHY } });
    console.log('== ' + ({ r18: 'R18版', safe: '全年齢モード', zen: '全年齢版' }[m] || m));
    print(t.r, t.errors, { why: WHY });
    if (t.r) bad += Object.keys(LABEL).reduce((s, k) => s + t.r.n[k], 0);
    if (t.errors && t.errors.length) errs += t.errors.length;
  }
  console.log('kin-label：' + bad + ' 件' + (errs ? '（ページのエラー ' + errs + '）' : ''));
  if (bad || errs) process.exitCode = 1;
})();
