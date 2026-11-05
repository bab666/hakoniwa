/* 関係の種類の内部の名前を本文に出さない点検（2026-11-05。決まりと数字は docs/reports/2026-11-04/kin-and-topics.md の 3 節）
   使い方: node rel-word-audit.js <ビルドのディレクトリ> [1箱庭・1モードあたりの回数=6] [--scen=whiteroom,…] [--modes=r18,safe,zen] [--zen=全年齢版のフォルダ] [--why]
     パック：HK_PACK_CODES=<コード> HK_ONLY_SCEN=<部屋,…> node rel-word-audit.js <試しのフォルダ>/hakoniwa-full 6 --modes=r18,safe
   ・住人 0・1 に、関係図の札・設定の選択肢の名前が本文に出やすい関係（擬似親子・義理の兄弟・セフレ・元恋人・友達以上恋人未満・敵対。
     擬似親子と義理の兄弟は「恋愛：あり」も）を順に置き、性別・人数（2〜3 人）を回して全箱庭（--scen= で絞る）を回す
   ・数える型（記録の区分 e.seg で分ける。docs/reports/2026-10-26/seg-design.md）：
       R1 台詞：台詞行（l）・地の文に埋まった発話（q）・話し手の決まらない発話（u）に、関係の種類の内部の名前
       R2 地の文：地の文（n）に、内部の名前を二人の呼び名として使う言い回し（「擬似親子の二人」「セフレの{b}」など。WORD_N）
     数えないもの：名詞の引用（c）・喘ぎとモブ（m）・区切りの見出し（step・phase）・理由の欄（why）・結果欄・関係図の札・設定の説明（記録の本文でないもの）
       R0 回の失敗：シミュレーションが例外で止まった
   ・内部の名前（WORD）：擬似親子・疑似親子・擬似／疑似（家族）・義兄弟・義姉妹・義理のきょうだい・親代わり・拾った子／拾われた（関係）・元恋人・セフレ・
     友達以上恋人未満・宿敵・両片想い。人が口にしても自然な語（「元カレ」「義理の姉」「片想い」「命を拾った」）は数えない
   ・合格は R0〜R2 の合計 0 件（全年齢版は --modes=zen で、ビルドのフォルダを hakoniwa-zenrei に読み替える）
   ・check.js が「関係の名前の語（rel-word）」として回す（血縁の札 kin-label と同じ印 kin・rel のファイルを変えたとき） */
'use strict';
const core = require('./audit/core.js');

/* ---------- パス relword（ページの中）：opt = { N, only } ---------- */
const PASS = function* (HK, opt) {
  const N = opt.N || 6;
  const REL = [
    { type: 'pparent', ages: [44, 23] }, { type: 'stepsib', ages: [24, 21] }, { type: 'fwb', ages: [27, 25] }, { type: 'ex', ages: [28, 27] },
    { type: 'pparent', ages: [42, 24], love: 'ok' }, { type: 'almost', ages: [23, 23] }, { type: 'stepsib', ages: [25, 22], love: 'ok' }, { type: 'enemy', ages: [26, 26] }
  ];
  const NAMES = ['アキラ', 'ユキノ', 'ハヤテ'];
  const ids = (HK.SCEN_ORDER || Object.keys(HK.SCENARIOS)).filter(id => HK.SCENARIOS[id] && !(HK.SCEN_ONLY && HK.SCEN_ONLY.indexOf(id) < 0) && !(opt.only && opt.only.length && opt.only.indexOf(id) < 0));
  for (const id of ids) {
    const sc = HK.SCENARIOS[id];
    const minC = Math.max(2, sc.minCast || 2), maxC = Math.max(minC, Math.min(sc.maxCast || 6, 3));
    for (let s = 0; s < N; s++) {
      const K = REL[s % REL.length];
      const n = Math.max(minC, Math.min(maxC, 2 + ((s >> 1) % 2)));
      const gs = [['m', 'f', 'm'], ['f', 'f', 'm'], ['m', 'm', 'f'], ['f', 'm', 'f']][(s + (s / REL.length | 0)) % 4];
      const chars = [];
      for (let i = 0; i < n; i++) chars.push({ name: NAMES[i] || ('住人' + i), gender: gs[i % 3], likes: '', age: i < 2 ? K.ages[i] : 25,
        eg: { CP: (s * 7 + i * 5) % 21, NP: (s * 3 + i * 11) % 21, A: (s * 13 + i * 3) % 21, FC: (s * 5 + i * 7) % 21, AC: (s * 11 + i * 3) % 21 }, calls: {}, tone: '', fp: '', memo: '' });
      const env = {}; (sc.env || []).forEach(e => { env[e.id] = e.def != null ? e.def : (e.options && e.options[0] ? e.options[0].v : (e.min != null ? e.min : '')); });
      (sc.env || []).forEach(e => { if (e.max != null && s % 2 === 0 && /romance|love|night|ev|heat/.test(e.id)) env[e.id] = e.max; });
      if (HK.Content) env.ct = HK.Content.TAGS.map(t => t.id).join(',');
      /* なれそめ・住人どうしの関係の選択肢（新婚の部屋の「二人のなれそめ」など）も 3 回に 1 回回す（元恋人・家族同然・拾った・拾われた などの文） */
      (sc.env || []).forEach(e => { if (e.id === 'rel' && e.options && e.options.length > 1 && s % 3 === 1) env.rel = e.options[1 + ((s / 3 | 0) % (e.options.length - 1))].v; });
      const ties = [{ a: 0, b: 1, type: K.type, love: K.love || '' }];
      const input = { scenId: id, seed: 8100 + s * 19, env, chars, perChar: chars.map(() => ({ pick: {} })), ties };
      yield { sc: id, s, input, meta: { rel: K.type, love: K.love || '', gs: gs.slice(0, n).join(''), n } };
    }
  }
};

/* ---------- 判定 relword（ページの中）：opt = { why } ---------- */
const JUDGE = function (HK, opt) {
  const WHY = !!opt.why, LIM = WHY ? 80 : 3;
  /* 台詞に出たら数える内部の名前 */
  const WORD = /擬似親子|疑似親子|擬似の|疑似の|擬似家族|疑似家族|義兄弟|義姉妹|義理のきょうだい|親代わり|拾われた(?:子|側|仲|関係|恩)|拾った(?:子|側|仲|関係)|元恋人|セフレ|友達以上恋人未満|宿敵|両片想い|両片思い/;
  /* 地の文：二人の呼び名・間柄として使う言い回しだけ（「擬似親子の二人」「セフレの{b}」「元恋人どうし」「義兄弟として」「両片想いのまま」） */
  /* 「元恋人」は地の文では普通の言い方（「元恋人の背中」）なので、本人の視点で自分を呼ぶ「元恋人の自分」だけ数える */
  const WORD_N = /(?:擬似親子|疑似親子|義兄弟|義姉妹|義理のきょうだい|セフレ|友達以上恋人未満|宿敵|両片想い|両片思い)(?:の|どうし|同士|として|で|だ|に|を|が|は|と|、|。|」|$)|元恋人の自分|親代わり(?:の|として|だ|に|を|が|と|、|。)|拾われた(?:子|側|仲|関係)|拾った(?:子|側|仲|関係)/;
  /* 別の担当が直している箱庭の表（scenario-futari.js の MEET.tie・FINAL・AFTER。{rel} に関係の名前が入る）の文は、直し待ち（P）として別に数え、合否には入れない。
     直し案は docs/reports/2026-11-04/kin-and-topics.md の 3 節。直ったらこの表を消す */
  const RW = '(?:擬似親子|義理の[^、。]{1,6}|友達以上恋人未満|セフレ|両片想い)';
  const PENDING = { futari: new RegExp('^\\s*(?:\\S+と\\S+は、' + RW + 'だ。|\\S+と\\S+は' + RW + 'として、もうしばらく|' + RW + 'の\\S+と\\S+の、同じ家での最初の朝|(?:[^、。]*' + RW + ')の\\S+と\\S+は、いつものように|\\d+日が過ぎても、\\S+と\\S+は' + RW + 'のままだった|' + RW + 'として一緒に暮らすのも|\\S+と\\S+は、その後も' + RW + 'として|\\S+と\\S+の' + RW + 'としての距離|両片想いのまま、また明日が来る)') };
  const out = { runs: 0, n: { R0: 0, R1: 0, R2: 0 }, ex: { R0: [], R1: [], R2: [] }, bySc: {}, byRel: {}, uniq: {}, words: {}, pend: 0, pendEx: [] };
  function add(k, run, s, where) {
    out.n[k]++;
    const b = out.bySc[run.sc] = out.bySc[run.sc] || { R0: 0, R1: 0, R2: 0 }; b[k]++;
    out.byRel[run.meta.rel + (run.meta.love ? '+恋愛' : '')] = (out.byRel[run.meta.rel + (run.meta.love ? '+恋愛' : '')] || 0) + 1;
    const m = String(s).match(k === 'R2' ? WORD_N : WORD); if (m) out.words[m[0].replace(/[のどうし同士としてでだにをがはと、。」]+$/, '')] = (out.words[m[0].replace(/[のどうし同士としてでだにをがはと、。」]+$/, '')] || 0) + 1;
    const line = run.sc + ' ' + run.mode + ' #' + run.s + '（' + run.meta.rel + (run.meta.love ? '・恋愛あり' : '') + '・' + run.meta.gs + '）［' + where + '］' + String(s).trim().replace(/\n/g, ' ').slice(0, 160);
    if (out.ex[k].length < LIM) out.ex[k].push(line);
    if (WHY) { const u = run.sc + ' ' + k + ' ［' + where + '］' + String(s).trim().replace(/アキラ/g, '{A}').replace(/ユキノ/g, '{B}').replace(/ハヤテ/g, '{C}').replace(/\n/g, ' ').slice(0, 150); out.uniq[u] = (out.uniq[u] || 0) + 1; }
  }
  /* seg が無い記録（保存から開いた記録など）は「」で分ける */
  const segOf = (e) => {
    if (Array.isArray(e.seg) && e.seg.length) return e.seg;
    const t = String(e.text), r = []; let last = 0; const re = /「[^」]*」/g; let m;
    while ((m = re.exec(t))) { if (m.index > last) r.push({ t: 'n', s: t.slice(last, m.index) }); r.push({ t: 'l', s: m[0] }); last = m.index + m[0].length; }
    if (last < t.length) r.push({ t: 'n', s: t.slice(last) });
    return r;
  };
  return {
    error(run, e) { run.mode = HK.SAFE_ON ? 'safe' : (HK.R18 === false ? 'zen' : 'r18'); add('R0', run, String(e && e.message || e), '例外'); },
    end(run, res) {
      out.runs++;
      run.mode = HK.SAFE_ON ? 'safe' : (HK.R18 === false ? 'zen' : 'r18');
      (res.log || []).forEach(e => {
        if (!e || !e.text || e.kind === 'step' || e.kind === 'phase') return;
        const where = e.tag || e.cat || '出来事';
        segOf(e).forEach(g => {
          if (!g || !g.s) return;
          if (g.t === 'l' || g.t === 'q' || g.t === 'u') { if (WORD.test(g.s)) add('R1', run, g.s, where); }
          else if (g.t === 'n') String(g.s).split(/(?<=[。！？\n])/).forEach(x => {
            if (!WORD_N.test(x)) return;
            if (PENDING[run.sc] && PENDING[run.sc].test(x)) { out.pend++; if (out.pendEx.length < (WHY ? 40 : 4)) out.pendEx.push(run.sc + ' #' + run.s + ' ' + String(x).trim().slice(0, 120)); return; }
            add('R2', run, x, where);
          });
        });
      });
    },
    finish() { return out; }
  };
};

const LABEL = { R0: '回の失敗（例外）', R1: '台詞（内部の名前）', R2: '地の文（内部の名前を呼び名に）' };
function print(r, errors, o) {
  if (!r) { console.log('結果なし'); return; }
  console.log('関係の名前の語の回 ' + r.runs + ' 回');
  Object.keys(LABEL).forEach(k => console.log('  ' + k + ' ' + LABEL[k] + '：' + r.n[k] + ' 件'));
  Object.keys(r.bySc).forEach(sc => console.log('  箱庭 ' + sc + '：' + Object.keys(LABEL).map(k => k + ' ' + r.bySc[sc][k]).join('・')));
  if (Object.keys(r.byRel).length) console.log('  関係ごと：' + Object.keys(r.byRel).map(k => k + ' ' + r.byRel[k]).join('・'));
  if (r.pend) { console.log('  直し待ち（別の担当のファイル。合否に入れない）：' + r.pend + ' 件'); (r.pendEx || []).forEach(x => console.log('    ' + x)); }
  if (Object.keys(r.words).length) console.log('  語ごと：' + Object.keys(r.words).map(k => k + ' ' + r.words[k]).join('・'));
  if (o.why) {
    console.log('文ごと（多い順。名前は {A}{B}{C}）：');
    Object.keys(r.uniq || {}).sort((a, b) => r.uniq[b] - r.uniq[a]).forEach(k => console.log('    ' + String(r.uniq[k]).padStart(4) + '  ' + k));
  }
  Object.keys(LABEL).forEach(k => { if (!r.ex[k].length) return; console.log('例 ' + k + '（' + LABEL[k] + '）：'); r.ex[k].forEach(x => console.log('    ' + x)); });
  if (errors && errors.length) console.log('pageerr', JSON.stringify(errors.slice(0, 3)));
}
function summarize(r) {
  const items = {}, ex = {};
  if (!r || !r.n) return { items, ex, info: {}, err: 0 };
  Object.keys(LABEL).forEach(k => { items[k] = r.n[k]; ex[k] = r.ex[k].slice(0, 3); });
  return { items, ex, info: { 関係の名前の語の回: r.runs }, err: 0 };
}
module.exports = { passes: { relword: PASS }, judges: { relword: JUDGE }, print, summarize, LABEL };

if (require.main === module) (async () => {
  const args = process.argv.slice(2).filter(a => !/^--/.test(a));
  const arg = (n, d) => { const a = process.argv.find(x => x.indexOf('--' + n + '=') === 0); return a ? a.slice(n.length + 3) : d; };
  const dir = args[0] || 'hakoniwa-full', N = +args[1] || 6, WHY = process.argv.includes('--why');
  const only = arg('scen', '').split(',').filter(Boolean);
  const modes = arg('modes', 'r18,safe,zen').split(',').filter(Boolean);
  let bad = 0, errs = 0;
  for (const m of modes) {
    const hash = m === 'zen' ? '' : m;
    const t = await core.runTool({ dir: m === 'zen' ? arg('zen', dir.replace(/hakoniwa-full(\/?)$/, 'hakoniwa-zenrei$1')) : dir, hash, lewdMode: '', mod: module.exports, pass: 'relword', judge: 'relword', opt: { N, only, why: WHY } });
    console.log('== ' + ({ r18: 'R18版', safe: '全年齢モード', zen: '全年齢版' }[m] || m));
    print(t.r, t.errors, { why: WHY });
    if (t.r) bad += Object.keys(LABEL).reduce((s, k) => s + t.r.n[k], 0);
    if (t.errors && t.errors.length) errs += t.errors.length;
  }
  console.log('rel-word：' + bad + ' 件' + (errs ? '（ページのエラー ' + errs + '）' : ''));
  if (bad || errs) process.exitCode = 1;
})();
