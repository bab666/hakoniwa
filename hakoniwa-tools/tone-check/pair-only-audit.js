/* 二人だけの回の「第三者がいないと成立しない」文の点検（2026-11-04 担当PR。設計・件数は docs/reports/2026-11-04/pair-only.md）
   使い方: node pair-only-audit.js <ビルドのディレクトリ> [1箱庭・1モードあたりの回数=60] [--scen=whiteroom,…] [--modes=r18,safe] [--why] [--all-kinds]
   ・参加者 2 人（男×女・男×男・女×女を順に。恋愛対象はたがいに合わせる）で箱庭を回し、記録の文（地の文・台詞・結末）から、
     その場に三人目がいないと成り立たない言い回しを拾う。関係（なし・恋人・片想い・執着の各型・元恋人・体だけ・友人・敵対・恐怖 など）と、
     箱庭の設定（条件・濃さ・作風・登場しない住人の名前）を回ごとに回す
   ・拾う型（P1〜P5）：
       P1 相手以外への動作（ほかの誰か・別の人・みんな・他の二人・周りの人・人目・観客・輪に入る など）
       P2 執着・嫉妬の問い（誰と話していた・誰に笑いかけた・さっきの人・あいつ／あの人と話す など）
       P3 人数（三人・四人…・全員・残りの人・誰が最後に）
       P4 複数人前提の段取り（多数決・投票・当番・班・全員で・順番に〜する）
       P5 二人以外の名前（参加していない住人の名前。「登場しない住人の名前を出す」が切の回）
     「二人の誰か」「どちらか」「誰もいない」「ほかの誰にも渡さない」のように、二人でも成り立つ言い方は除く（EXCL）
   ・--why で、型ごとに例（箱庭・モード・出来事の id・文）を出す。出来事の id は、記録を書いたときに動いていた出来事（ctx._ev.id）。
     出来事の外（段の進行・結末）で書かれた記録は「段:〈段の名前〉」「結末」
   ・audit-all.js の追加の配役パス（--extra=pair）からも同じ関数を呼ぶ。合格は「出られない部屋（whiteroom）の 2 人で 0 件」。
     ほかの箱庭（--scen=）は参考（明らかな矛盾は直す） */
'use strict';
const core = require('./audit/core.js');

const DEF_SCEN = ['whiteroom'];

/* ---------- パス pair（ページの中）：opt = { N, only } ---------- */
const PASS = function* (HK, opt) {
  const N = opt.N || 60;
  /* 既定は出られない部屋だけ（audit-all の --extra=pair）。HK_ONLY_SCEN で絞られているときは、その中に出られない部屋があるときだけ回す */
  const only = opt.only || ['whiteroom'].filter(id => !(HK.SCEN_ONLY && HK.SCEN_ONLY.length) || HK.SCEN_ONLY.indexOf(id) >= 0);
  /* 記録に出来事の id を付ける（数えない印。1 度だけ包む） */
  if (HK.Ctx && !HK.Ctx.prototype.__pairTag) {
    const say0 = HK.Ctx.prototype.say;
    HK.Ctx.prototype.say = function (o) {
      const e = say0.call(this, o);
      try { if (e && !e.skipped) Object.defineProperty(e, '_ev', { value: this._ev && this._ev.id ? String(this._ev.id) : '段:' + (this.label || ''), enumerable: false, writable: true }); } catch (x) { /* 包めなくても回す */ }
      return e;
    };
    HK.Ctx.prototype.__pairTag = true;
  }
  const NAMES = ['アキラ', 'ユキノ'];
  /* 関係の型（a=0 → b=1）。null は関係なし */
  const TIES = [null, { type: 'lover' }, { type: 'crush' }, { type: 'yan' }, { type: 'yan', sub: 'bind' }, { type: 'yan', sub: 'purge' }, { type: 'yan', sub: 'dep' },
    { type: 'yan', sub: 'hatelove' }, { type: 'yan', sub: 'devote' }, { type: 'ex' }, { type: 'fwb' }, { type: 'friend' }, { type: 'enemy' }, { type: 'rival' },
    { type: 'honmei' }, { type: 'spouse' }, { type: 'childhood' }, { type: 'bad' }, { type: 'worship' }, { type: 'fear' }, { type: 'abuse' }, { type: 'almost' }];
  const OUTS = ['ハヤテ', 'ツバサ'];
  for (const id of only) {
    const sc = HK.SCENARIOS[id]; if (!sc) continue;
    if ((sc.minCast || 2) > 2) continue;
    for (let s = 0; s < N; s++) {
      const gs = [['m', 'f'], ['m', 'm'], ['f', 'f']][s % 3];
      const chars = gs.map((g, i) => ({ name: NAMES[i], gender: g, likes: s % 3 === 0 ? (g === 'm' ? 'f' : 'm') : g,
        pos: [['top', 'bottom'], ['bottom', 'top'], ['riba', 'riba'], ['', '']][(s >> 1) % 4][i],
        eg: { CP: (s * 7 + i * 5) % 21, NP: (s * 3 + i * 11) % 21, A: (s * 13 + i * 3) % 21, FC: (s * 5 + i * 7) % 21, AC: (s * 11 + i * 3) % 21 }, calls: {}, tone: s % 3 === 1 && HK.TONE_KEYS ? HK.TONE_KEYS[(s * 2 + i * 7) % HK.TONE_KEYS.length] : '', fp: '', memo: '' }));
      const env = {}; (sc.env || []).forEach(e => { env[e.id] = e.def != null ? e.def : (e.options && e.options[0] ? e.options[0].v : (e.min != null ? e.min : '')); });
      (sc.env || []).forEach((e, k) => {
        if (e.options && e.options.length > 1 && (s + k) % 3 === 0 && !/^outsideNames$/.test(e.id)) env[e.id] = e.options[(s * 5 + k) % e.options.length].v;
        if (e.max != null && s % 2 === 0 && /lewd|night|romance|heat|ev|dose|aphro|love|shady|prey|pleasure|pressure/.test(e.id)) env[e.id] = e.max;
        if (e.options && /^lewd$/.test(e.id) && s % 2 === 0) { const hi = e.options.filter(o => o.v === 'high')[0]; if (hi) env[e.id] = 'high'; }
      });
      if (HK.Content) env.ct = HK.Content.TAGS.map(t => t.id).join(',');
      const names = s % 4 === 3;
      if ((sc.env || []).some(e => e.id === 'outsideNames')) env.outsideNames = names ? 'yes' : 'no';
      const T = TIES[s % TIES.length], ties = [];
      if (T) { const t = Object.assign({ a: s % 2, b: 1 - s % 2 }, T); if (t.type === 'fear') { t.type = 'fear'; } ties.push(t); }
      const input = { scenId: id, seed: 4100 + s * 13, env, chars, perChar: chars.map(() => ({ pick: {} })), ties };
      /* 登場しない住人（room-end.js の outside の形）：名前は「出す」の回だけ持たせる */
      input.outside = [{ i: 0, k: 'friend', l: '友人' }, { i: 1, k: 'family', l: '家族' }].map((o, j) => names ? Object.assign(o, { n: OUTS[j] }) : o);
      yield { sc: id, s, input, meta: { outNames: names, outs: OUTS, cast: NAMES, tie: T ? T.type + (T.sub ? '/' + T.sub : '') : 'なし', gs: gs.join('') } };
    }
  }
};

/* ---------- 判定 pair（ページの中）：opt = { why, all } ---------- */
const JUDGE = function (HK, opt) {
  const WHY = !!opt.why, LIM = WHY ? 40 : 3;
  /* 型ごとの言い回し（re）と、二人でも成り立つ言い方（ex：その文に当たれば数えない） */
  const P = {
    P1: { re: /ほかの誰か|他の誰か|ほかの人|他の人|別の人|別の誰か|みんな|皆さん|皆(?![無目既様])|他の二人|ほかの二人|残りの二人|周り(?:の人|の者|の皆|のみんな)|周囲の(?:人|者|視線)|誰かに(?:笑いかけ|話しかけ|手を振|声をかけ|目配せ)|誰かと(?:話し|笑い|喋)|近くの誰か|隣の人|輪に入|輪の中|人目|観客|ギャラリー|見物|ほかの住人|他の住人|ほかの者|他の者|他の連中|ほかの連中/,
      ex: /人目(?:が|も)?(?:ない|無い|なく|無く)|人目を気にせず|人目を気にしなくて|人目のない|人目もない|ほかの誰(?:にも|でもない|でもなく|も)|他の誰(?:にも|でもない|でもなく|も)|ほかの誰か(?:のもの|に渡|と結ば|を好き|を選)|他の誰か(?:のもの|に渡|と結ば|を好き|を選)|ほかの人(?:には|にも)(?:言わ|話さ|見せ|渡さ|内緒)|他の人(?:には|にも)(?:言わ|話さ|見せ|渡さ|内緒)|(?:ほか|他)の(?:人|者|誰か)(?:じゃ|では|に|と|なんて)、?(?:マジ)?(?:だめ|ダメ|意味|駄目|ムリ|無理|嫌|いや)|(?:ほか|他)の(?:人|者)間?(?:は|なんて|など)(?:いらな|要らな|いりませ)|(?:ほか|他)の(?:人|誰か)(?:が|と|なら|とだったら)[^。」]{0,8}(?:よかった|良かった|ましだった|マシ)|みんなには内緒|皆には内緒|誰もいない|見物人もいない|観客もいない|観客のいない|ギャラリーもいない/ },
    P2: { re: /誰と話して|誰と話してた|誰に笑いかけ|誰に話しかけ|誰と一緒に|誰を見て(?:い|た)|誰のこと(?:を)?(?:見て|考え)|さっきの人|さっきの子|さっきのやつ|さっきの奴|あいつと(?:話|何|笑)|あの人と(?:話|何|笑)|あの子と(?:話|何|笑)|ほかの奴|他の奴|ほかのやつ|他のやつ|ほかの男|他の男|ほかの女|他の女/,
      ex: /(?:ほか|他)の(?:男|女|奴|やつ)(?:に|には|にも|なんて|など|じゃ|では|と)、?(?:渡|触|見せ|取ら|盗ら|だめ|ダメ|駄目|意味|無理|ムリ|比べ)/ },
    P3: { re: /[三四五六七八3-8３-８]人(?!称|前|分|目|部屋)|全員|残りの人|残った人|(?:出ていった|先に出た|外に出た|出た|残された)人たち|誰が最後に|一人ずつ|ひとりずつ/,
      /* 「三人の場面でだけ数える」部屋を二人で選んだときの、扉の紙と但し書き（room-games.js。設定どおりの告知なので数えない） */
      ex: /三人称|二人と三人|「三人で」|「三人で[^」]*出られない」|三人そろわなければ|三人そろわなかった/ },
    P4: { re: /多数決|投票|[^一-鿿]班(?!長)|全員で|誰か一組|どの組|ほかの組|他の組|くじ引きで誰/, ex: null }
  };
  const out = { runs: 0, n: { P1: 0, P2: 0, P3: 0, P4: 0, P5: 0 }, ex: { P1: [], P2: [], P3: [], P4: [], P5: [] }, byEv: {}, bySc: {}, lines: 0, uniq: {} };
  const sents = t => String(t).split(/(?<=[。！？!?」\n])/).filter(x => x.trim());
  function add(k, run, ev, s, seg) {
    out.n[k]++;
    const key = run.sc + ' ' + k + ' ' + ev;
    out.byEv[key] = (out.byEv[key] || 0) + 1;
    if (WHY) { const u = run.sc + ' ' + k + ' ［' + ev + '］' + s.trim().replace(/アキラ/g, '{A}').replace(/ユキノ/g, '{B}').slice(0, 140); out.uniq[u] = (out.uniq[u] || 0) + 1; }
    out.bySc[run.sc] = out.bySc[run.sc] || { P1: 0, P2: 0, P3: 0, P4: 0, P5: 0 }; out.bySc[run.sc][k]++;
    if (out.ex[k].length < LIM) out.ex[k].push(run.sc + ' ' + (run.mode || '') + ' #' + run.s + '（' + run.meta.gs + '・' + run.meta.tie + '）［' + ev + '］' + s.trim().slice(0, 160));
  }
  function scan(run, ev, text, names) {
    sents(text).forEach(s => {
      out.lines++;
      /* 結末の「その後」・最期の言葉は、部屋や船の外の世間・家族のことを言うので数えない。過去の漂流者の話も */
      const outside = /のその後――|最期に遺した言葉|前の漂流者/.test(s);
      ['P1', 'P2', 'P3', 'P4'].forEach(k => { const p = P[k]; if (p.re.test(s) && !(p.ex && p.ex.test(s)) && !(outside && k !== 'P2')) add(k, run, ev, s); });
      if (names) names.forEach(nm => { if (s.indexOf(nm) >= 0) add('P5', run, ev, s); });
    });
  }
  return {
    end(run, res) {
      out.runs++;
      run.mode = HK.SAFE_ON ? 'safe' : (HK.R18 === false ? 'zen' : 'r18');
      if (run.mode === 'r18' && !(HK.SAFE_ON === undefined || HK.SAFE_ON === false)) run.mode = 'safe';
      const names = run.meta.outNames ? null : run.meta.outs;
      const nc = (res.chars || []).length;
      if (nc !== 2) return;
      (res.log || []).forEach(e => {
        if (!e || !e.text || e.kind === 'step') return;
        scan(run, e._ev || ('段:' + (e.label || '')), e.text, names);
      });
      /* 結末（res.end の文字列をすべて。見出し・行・注記） */
      const seen = new Set();
      const walk = (v, d) => { if (d > 4 || v == null) return; if (typeof v === 'string') { if (v.length > 6 && /[ぁ-ん]/.test(v) && !seen.has(v)) { seen.add(v); scan(run, '結末', v, names); } return; } if (typeof v === 'object' && !seen.has(v)) { seen.add(v); Object.keys(v).forEach(k => walk(v[k], d + 1)); } };
      walk(res.end || res.ending, 0);
      (res.chars || []).forEach(c => { if (c && typeof c.fateNote === 'string') scan(run, '結末', c.fateNote, names); });
    },
    finish() { return out; }
  };
};

const LABEL = { P1: '相手以外への動作', P2: '執着・嫉妬の問い（第三者）', P3: '人数（三人以上）', P4: '複数人前提の段取り', P5: '登場しない住人の名前' };
function print(r, errors, o) {
  if (!r) { console.log('結果なし'); return; }
  console.log('二人だけの回 ' + r.runs + ' 回・文 ' + r.lines + ' 本');
  Object.keys(LABEL).forEach(k => console.log('  ' + k + ' ' + LABEL[k] + '：' + r.n[k] + ' 件'));
  Object.keys(r.bySc).forEach(sc => console.log('  箱庭 ' + sc + '：' + Object.keys(LABEL).map(k => k + ' ' + r.bySc[sc][k]).join('・')));
  if (o.why) {
    console.log('出来事ごと（多い順）：');
    Object.keys(r.byEv).sort((a, b) => r.byEv[b] - r.byEv[a]).forEach(k => console.log('    ' + String(r.byEv[k]).padStart(4) + '  ' + k));
    console.log('文ごと（多い順。名前は {A}{B}）：');
    Object.keys(r.uniq || {}).sort((a, b) => r.uniq[b] - r.uniq[a]).forEach(k => console.log('    ' + String(r.uniq[k]).padStart(4) + '  ' + k.replace(/\n/g, ' ')));
    Object.keys(LABEL).forEach(k => { if (!r.ex[k].length) return; console.log('例 ' + k + '（' + LABEL[k] + '）：'); r.ex[k].forEach(x => console.log('    ' + x.replace(/\n/g, ' '))); });
  }
  if (errors && errors.length) console.log('pageerr', JSON.stringify(errors.slice(0, 3)));
}
function summarize(r) {
  const items = {}, ex = {};
  if (!r || !r.n) return { items, ex, info: {}, err: 0 };
  Object.keys(LABEL).forEach(k => { items[k] = r.n[k]; ex[k] = r.ex[k].slice(0, 3); });
  return { items, ex, info: { 二人だけの回: r.runs, 文: r.lines }, err: 0 };
}
module.exports = { passes: { pair: PASS }, judges: { pair: JUDGE }, print, summarize, LABEL, DEF_SCEN };

if (require.main === module) (async () => {
  const args = process.argv.slice(2).filter(a => !/^--/.test(a));
  const arg = (n, d) => { const a = process.argv.find(x => x.indexOf('--' + n + '=') === 0); return a ? a.slice(n.length + 3) : d; };
  const dir = args[0], N = +args[1] || 60, WHY = process.argv.includes('--why');
  const only = arg('scen', DEF_SCEN.join(',')).split(',').filter(Boolean);
  const modes = arg('modes', 'r18,safe').split(',').filter(Boolean);
  let bad = 0;
  for (const m of modes) {
    const hash = m === 'zen' ? '' : m;
    const t = await core.runTool({ dir: m === 'zen' ? dir.replace(/hakoniwa-full\/?$/, 'hakoniwa-zenrei') : dir, hash, lewdMode: '', mod: module.exports, pass: 'pair', judge: 'pair', opt: { N, only, why: WHY } });
    console.log('== ' + ({ r18: 'R18版', safe: '全年齢モード', zen: '全年齢版' }[m] || m));
    print(t.r, t.errors, { why: WHY });
    if (t.r && only.indexOf('whiteroom') >= 0) bad += (t.r.bySc.whiteroom ? Object.keys(LABEL).reduce((s, k) => s + t.r.bySc.whiteroom[k], 0) : 0);
  }
  console.log(bad ? '★ 出られない部屋の二人で ' + bad + ' 件' : '出られない部屋の二人：0 件');
  if (bad) process.exitCode = 1;
})();
