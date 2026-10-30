/* 箱庭シミュレーター: 出られない部屋 ― 「三人の場面でだけ数える」を選んだときの事前の表示（両ビルド共通。2026-10-28 担当JB。2026-10-30 担当TR：
   条件「三人で」を環境値「三人以上で一緒に満たす」の「三人の場面でだけ数える（三人で仲良く）」に統合したので、その選択肢を選んだときだけ出す）
   利用者の不具合報告「3P が起こらない」「なんで持てないのか、理由を表示してあげてほしい」への対応。
   ・HK.RoomGames.preview(input)：動かす前に、この顔ぶれ・この設定で「三人で」が成り立つかを調べる。本番と同じ判定を使うため、
     入力の写しで HK.simulate を区切り0個で回し（scen.steps を空にする）、room-games.js の setup が HK._trioPrev に置く中身
     { n: 参加者の数, okN: 成り立つ三人の数, ng: [{ a, b, t: 理由, fix: 直し方 }], out: [「3P しない」の人], few: 三人未満, soft: 全年齢・エッチの条件がない } を返す
   ・箱庭タブで出られない部屋の「三人以上で一緒に満たす」に「三人の場面でだけ数える」を選んでいれば、環境値の欄の上（#trio-note）に出す。
     成り立つ三人がいれば薄い一行「三人の場面：成り立つ三人 N 組（形）」だけ。成り立つ三人が 0 組のときだけ、帯（HK.NgBand）で理由と直し方を出す
     （2026-10-30：利用者の報告「3P ができる組み合わせでも注意書きが出てややこしい」）。
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
    if (r.off) return '三人の場面でだけ数える：この条件では無効です（' + r.off + '。' + (r.pair ? '二人ずつ数えます。' : 'いつもどおりの数え方です。') + '行為・言葉の条件で、傷つける条件がないときに有効）。';
    if (r.few) return '三人の場面でだけ数える：三人そろわないので、二人ずつ数えます（いまの参加者は' + r.n + '人。三人以上にすると使えます）。';
    if (r.soft && r.hug) return '「三人の場面でだけ数える」：この顔ぶれでは三人の場面を組める三人がいないので、条件は「三人で抱き合う」に替わります。';
    if (r.soft) return r.safe ? '「三人の場面でだけ数える」：条件は三人そろった場面でだけ進みます（ハグなどは三人で抱き合う場面）。' : '「三人の場面でだけ数える」：条件は三人そろった場面でだけ進み、二人きりでは数えません。';
    var t = '';
    /* r18:begin */
    /* 成り立つ三人ごとの形（直接は触れ合わない組があればその旨。理由の長い説明・体の関係にならない二人の一覧は、成り立つ三人がいないときの帯だけに出す） */
    t = '三人の場面：この顔ぶれで成り立つ三人は ' + r.okN + ' 組' + (r.okN ? '' : '（成り立つ三人がいないので、条件は「三人で抱き合う」に替わります）') + '。';
    if (r.okN && r.trios && r.trios.length) t += r.trios.slice(0, 4).map(function (o) {
      return o.names.join('・') + (o.hub ? '（' + o.hub + 'を真ん中に。' + o.watch.map(function (x) { return x.a + 'と' + x.b; }).join('・') + 'は直接は触れ合いません）' : '（三組とも触れ合えます）') +
        (o.tense.length ? '。不仲の' + o.tense.map(function (x) { return x.a + 'と' + x.b; }).join('・') + 'は、焦りが溜まれば割り切って加わります' : '');
    }).join('。') + '。' + (r.trios.length > 4 ? 'ほかに ' + (r.trios.length - 4) + ' 組。' : '');
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
    /* 成り立つ三人が 0 組のときだけ、帯で理由（体の関係にならない組・三人に加わらない人）と直し方を出す */
    var NB = HK.NgBand, notes = [];
    if (NB && !r.few && !r.soft && !r.okN) {
      if (r.faith && r.faith.length) notes.push('一途で恋人のいる人：' + r.faith.join('・') + '（恋人でない人がいる三人には加わりません。直し方：「一途」を外す）');
      if (r.out && r.out.length) notes.push('「三人の場面（3P）：しない」の人：' + r.out.join('・') + '（住人の欄で「する」にすると加わります）');
      if (r.tense && r.tense.length) r.tense.filter(function (x) { return x.avoid; }).forEach(function (x) { notes.push(x.avoid + 'は' + (x.avoid === x.a ? x.b : x.a) + 'を避けているので、この二人は三人の場面に加わりません（直し方：' + x.avoid + 'が持つ側の「愛憎」を不仲に付ける、または不仲を外す）'); });
      h = NB.html({ title: r.ng && r.ng.length ? '体の関係にならない組' : '三人の場面に加わらない人', rows: (r.ng || []).map(function (x) { return { a: x.a, b: x.b, t: x.t, fix: x.fix }; }), notes: notes,
        lead: '三人の場面：この顔ぶれで成り立つ三人は 0 組です（成り立つ三人がいないので、条件は「三人で抱き合う」に替わります）。二組以上が体の関係を持てる三人がいると、三人の場面になります。',
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
  /* 「三人以上で一緒に満たす」の欄が「三人の場面でだけ数える」のときだけ */
  function trioSel() { var s = document.getElementById('env-multi'); return s && s.value === 'only' ? s : null; }
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
