/* 箱庭シミュレーター: 出られない部屋 ― 条件「三人で」を選んだときの事前の表示（両ビルド共通。2026-10-28 担当JB）
   利用者の不具合報告「3P が起こらない」「なんで持てないのか、理由を表示してあげてほしい」への対応。
   ・HK.RoomGames.preview(input)：動かす前に、この顔ぶれ・この設定で「三人で」が成り立つかを調べる。本番と同じ判定を使うため、
     入力の写しで HK.simulate を区切り0個で回し（scen.steps を空にする）、room-games.js の setup が HK._trioPrev に置く中身
     { n: 参加者の数, okN: 成り立つ三人の数, ng: [{ a, b, t: 理由, fix: 直し方 }], out: [「3P しない」の人], few: 三人未満, soft: 全年齢 } を返す
   ・箱庭タブで出られない部屋の条件1・条件2に「三人で」を選んでいれば、その欄の下（.envitem の中の #trio-note）に
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
    if (r.ng && r.ng.length) t += '体の関係を持てない組：' + r.ng.map(function (x) { return x.a + 'と' + x.b + '（' + x.t + (x.fix ? '。直し方：' + x.fix : '') + '）'; }).join('、') + '。' + (r.okN ? 'この組を含む三人は、二人の両方と持てる人を真ん中にしたときだけ成り立ちます。' : '');
    if (r.faith && r.faith.length) t += '一途で恋人のいる人：' + r.faith.join('・') + '（恋人でない人がいる三人には加わりません。直し方：「一途」を外す）。';
    if (r.out && r.out.length) t += '「三人の場面（3P）：しない」の人：' + r.out.join('・') + '（住人の欄で「する」にすると加わります）。';
    /* r18:end */
    return t;
  }
  RG.noteText = noteText;

  /* ---------- 箱庭タブの表示 ---------- */
  if (typeof document === 'undefined' || !document.addEventListener || typeof MutationObserver === 'undefined') return;
  var timer = null, busy = false, lastKey = '', lastText = '';
  function schedule() { if (busy) return; clearTimeout(timer); timer = setTimeout(update, 250); }
  function trioSel() {
    var ids = ['env-cond', 'env-cond2'];
    for (var i = 0; i < ids.length; i++) { var s = document.getElementById(ids[i]); if (s && s.value === 'trio3') return s; }
    return null;
  }
  function update() {
    try {
      var UI = HK.UI, S = UI && UI.state ? UI.state() : null, old = document.getElementById('trio-note');
      var sel = S && S.scenId === 'whiteroom' ? trioSel() : null;
      if (!sel || !UI.buildInput) { if (old) { busy = true; old.parentNode.removeChild(old); setTimeout(function () { busy = false; }, 0); } return; }
      var input = UI.buildInput(0), key = JSON.stringify({ c: input.chars, t: input.ties, e: input.env });
      var t = key === lastKey ? lastText : noteText(RG.preview(input));
      lastKey = key; lastText = t;
      var host = (sel.closest && sel.closest('.envitem')) || sel.parentNode;
      busy = true;
      if (old && !host.contains(old)) { old.parentNode.removeChild(old); old = null; }
      if (!t) { if (old) old.parentNode.removeChild(old); }
      else {
        if (!old) { old = document.createElement('div'); old.id = 'trio-note'; old.className = 'desc'; host.appendChild(old); }
        if (old.textContent !== t) old.textContent = t;
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
