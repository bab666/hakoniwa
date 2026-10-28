/* 箱庭シミュレーター: 出られない部屋 ― 条件「三人で」を選んだときの事前の表示（両ビルド共通。2026-10-28 担当JB）
   利用者の不具合報告「3P が起こらない」「なんで持てないのか、理由を表示してあげてほしい」への対応。
   ・HK.RoomGames.preview(input)：動かす前に、この顔ぶれ・この設定で「三人で」が成り立つかを調べる。本番と同じ判定を使うため、
     入力の写しで HK.simulate を区切り0個で回し（scen.steps を空にする）、room-games.js の setup が HK._trioPrev に置く中身
     { n: 参加者の数, okN: 成り立つ三人の数, ng: [{ a, b, t: 理由, fix: 直し方 }], out: [「3P しない」の人], few: 三人未満, soft: 全年齢 } を返す
   ・箱庭タブで出られない部屋の条件1・条件2に「三人で」を選んでいれば、環境値の欄の上（#trio-note。2026-10-28 までは条件の欄の下）に
     「三人の場面：成り立つ三人 N 組／体の関係を持てない組：アキラとミナト（ミナトの性欲の強さが「なし」→ 直し方）…」を出す。
     画面の部品（ui.js・view*.js・index.html）は触らず、箱庭タブの書き換え・入力の変更を見て、自分の一行だけを足し替える */
(function () {
  'use strict';
  var HK = window.HK, scen = HK && HK.SCENARIOS && HK.SCENARIOS.whiteroom;
  if (!scen) return;
  var RG = HK.RoomGames = HK.RoomGames || {};
  /* 調べるあいだだけ、区切りを0個にする（setup のあと、出来事を起こさずに終わる） */
  var steps0 = scen.steps;
  scen.steps = function () { return HK._trioPrev ? [] : steps0.apply(this, arguments); };
  RG.preview = function (input) {
    var box = {}, prev = HK._trioPrev;
    HK._trioPrev = box;
    try { HK.simulate(JSON.parse(JSON.stringify(input))); } catch (e) { box.err = String(e && e.message || e); } finally { HK._trioPrev = prev || null; }
    return box.res || null;
  };
  /* 表示の文 */
  function noteText(r) {
    if (!r) return '';
    if (r.few) return '条件「三人で」は三人以上で成り立ちます。いまの参加者は' + r.n + '人なので、条件は「ハグ」に替わります（参加者を三人以上にすると使えます）。';
    if (r.soft) return '条件「三人で」は、三人そろって抱き合う場面になります。';
    var t = '';
    /* r18:begin */
    t = '三人の場面（3P）：この顔ぶれで成り立つ三人は ' + r.okN + ' 組' + (r.okN ? '' : '（成り立つ三人がいないので、条件は「三人で抱き合う」に替わります）') + '。';
    /* 成り立つ三人ごとの形（2026-10-28 担当LG：三人の場面の可否を、二人の組の理由と分けて書く。攻めどうしの組の理由が、三人が成り立たない理由に読めないように） */
    if (r.trios && r.trios.length) t += r.trios.slice(0, 4).map(function (o) {
      return o.names.join('・') + '：できる' + (o.hub ? '（' + o.hub + 'を真ん中に。' + o.watch.map(function (x) { return x.a + 'と' + x.b + 'は直接は触れ合いません――' + x.t; }).join('。') + '）' : '（三組とも触れ合えます）') +
        (o.tense.length ? '。不仲の' + o.tense.map(function (x) { return x.a + 'と' + x.b; }).join('・') + 'も、時間が経って焦りが溜まれば割り切って加わります' : '');
    }).join('。') + '。' + (r.trios.length > 4 ? 'ほかに ' + (r.trios.length - 4) + ' 組。' : '');
    var shown = {};
    (r.trios || []).slice(0, 4).forEach(function (o) { o.watch.forEach(function (x) { shown[x.a + '\u0001' + x.b] = 1; }); });
    var ng2 = (r.ng || []).filter(function (x) { return !shown[x.a + '\u0001' + x.b]; });
    if (ng2.length) t += (r.okN ? '体の関係にならない二人（三人の場面の可否は上のとおり）：' : '体の関係を持てない組：') + ng2.map(function (x) { return x.a + 'と' + x.b + '（' + x.t + (x.fix ? '。直し方：' + x.fix : '') + '）'; }).join('、') + '。';
    /* 不仲・敵対の組（2026-10-28 担当LG） */
    if (r.tense && r.tense.length) { var tz = r.tense.filter(function (x) { return x.avoid || x.low.length; }); if (tz.length) t += tz.map(function (x) { return x.avoid ? x.avoid + 'は' + (x.avoid === x.a ? x.b : x.a) + 'を避けているので、この二人は三人の場面に加わりません（直し方：' + x.avoid + 'が持つ側の「愛憎」を不仲に付ける、または不仲を外す）' : '性欲「弱い」の' + x.low.join('・') + 'は、不仲の相手と割り切るまでに強い焦りが要ります'; }).join('。') + '。'; }
    if (r.faith && r.faith.length) t += '一途で恋人のいる人：' + r.faith.join('・') + '（恋人でない人がいる三人には加わりません。直し方：「一途」を外す）。';
    if (r.out && r.out.length) t += '「三人の場面（3P）：しない」の人：' + r.out.join('・') + '（住人の欄で「する」にすると加わります）。';
    /* r18:end */
    return t;
  }
  RG.noteText = noteText;
  /* 表示の HTML（2026-10-28 担当LH：利用者の指示「体の関係を持てない理由をもう少し目立つ位置に」）：
     成り立たない組・三人に加わらない人がいれば、環境値の欄の上（部屋の名前のすぐ下）に帯（ui-env.js の HK.NgBand）で1組1行。
     いなければ（三人未満・全年齢・全員が持てる）今までどおりの薄い注記 */
  function noteHtml(r) {
    if (!r) return '';
    var h = '';
    /* r18:begin */
    var NB = HK.NgBand, notes = [];
    if (NB && !r.few && !r.soft && ((r.ng && r.ng.length) || (r.faith && r.faith.length) || (r.out && r.out.length))) {
      if (r.faith && r.faith.length) notes.push('一途で恋人のいる人：' + r.faith.join('・') + '（恋人でない人がいる三人には加わりません。直し方：「一途」を外す）');
      if (r.out && r.out.length) notes.push('「三人の場面（3P）：しない」の人：' + r.out.join('・') + '（住人の欄で「する」にすると加わります）');
      h = NB.html({ title: r.ng && r.ng.length ? '体の関係にならない組' : '三人の場面に加わらない人', rows: (r.ng || []).map(function (x) { return { a: x.a, b: x.b, t: x.t, fix: x.fix }; }), notes: notes,
        lead: '三人の場面（3P）：この顔ぶれで成り立つ三人は ' + r.okN + ' 組' + (r.okN ? '' : '（成り立つ三人がいないので、条件は「三人で抱き合う」に替わります）') + '。' + (r.okN && r.ng && r.ng.length ? 'この組を含む三人は、二人の両方と持てる人を真ん中にしたときだけ成り立ちます。' : ''),
        foot: '「○○の設定」を押すと、その人の設定が開きます（直すと、この表示も書き換わります）。' });
    }
    /* r18:end */
    if (!h) { var t = noteText(r); h = t ? '<div class="desc trioinfo">' + HK.escape(t) + '</div>' : ''; }
    return h;
  }
  RG.noteHtml = noteHtml;

  /* ---------- 箱庭タブの表示 ---------- */
  if (typeof document === 'undefined' || !document.addEventListener || typeof MutationObserver === 'undefined') return;
  var timer = null, busy = false, lastKey = '', lastText = '';
  function schedule() { if (busy) return; clearTimeout(timer); timer = setTimeout(update, 250); }
  function trioSel() {
    var ids = ['env-cond', 'env-cond2'];
    for (var i = 0; i < ids.length; i++) { var s = document.getElementById(ids[i]); if (s && s.value === 'trio3') return s; }
    return null;
  }
  /* 置き場所：環境値の欄の上（出られない部屋の部屋の名前のすぐ下）。描き直しで消えたら、入れ直す */
  function update() {
    try {
      var UI = HK.UI, S = UI && UI.state ? UI.state() : null, old = document.getElementById('trio-note');
      var sel = S && S.scenId === 'whiteroom' ? trioSel() : null;
      if (!sel || !UI.buildInput) { if (old) { busy = true; old.parentNode.removeChild(old); setTimeout(function () { busy = false; }, 0); } return; }
      var input = UI.buildInput(0), key = JSON.stringify({ c: input.chars, t: input.ties, e: input.env, n: (S.chars || []).map(function (c) { return c.name; }) });
      var t = key === lastKey ? lastText : noteHtml(RG.preview(input));
      lastKey = key; lastText = t;
      var grid = sel.closest && sel.closest('.envgrid'), host = grid ? grid.parentNode : (sel.closest && sel.closest('.envitem')) || sel.parentNode;
      busy = true;
      if (old && (old.parentNode !== host || (grid && old.nextSibling !== grid))) { old.parentNode.removeChild(old); old = null; }
      if (!t) { if (old) old.parentNode.removeChild(old); }
      else {
        if (!old) { old = document.createElement('div'); old.id = 'trio-note'; old.setAttribute('aria-live', 'polite'); if (grid) host.insertBefore(old, grid); else host.appendChild(old); }
        if (old._h !== t) { old.innerHTML = t; old._h = t; }
      }
      setTimeout(function () { busy = false; }, 0);
    } catch (e) { busy = false; /* 表示できなくても、箱庭は動かせる */ }
  }
  RG.noteUpdate = update;
  document.addEventListener('change', schedule, true);
  document.addEventListener('input', schedule, true);
  var start = function () { try { new MutationObserver(schedule).observe(document.body || document.documentElement, { childList: true, subtree: true }); } catch (e) { /* 見張れなくても、入力の変更で書き換える */ } schedule(); };
  if (document.body) start(); else document.addEventListener('DOMContentLoaded', start);
})();
