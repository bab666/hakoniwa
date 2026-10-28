/* 箱庭シミュレーター ui: クラスメイトの先生（2026-10-28 担当KB。ui.js が 2000 行を超えないよう分けた）
   ・先生は「担任の先生」で選んだ人（S.teacher）と、参加表の「先生（受け持ち）」（perFields の tch）を選んだ人（classroom-teacher.js）
   ・castFor：先生を名簿の後ろに回す（「担任の先生」で選んだ人が先頭＝同じ学年の担任。ほかは副担任）
   ・selectHtml：箱庭タブの「担任の先生」の欄と説明
   ui.js は実行のとき・描くときにだけ呼ぶ（ui.js の直後に読む。S と per は呼ぶ側が渡す） */
(function () {
  'use strict';
  var HK = window.HK;
  if (!HK) return;
  var esc = HK.escape || function (s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); };
  function isTeacher(S, c, id, per) { return id === 'classroom' && !!c && (c.id === S.teacher || !!((per(c, id).pick || {}).tch)); }
  function order(S, J, id, per) {
    if (id !== 'classroom') return J;
    var tc = J.filter(function (c) { return isTeacher(S, c, id, per); });
    if (!tc.length) return J;
    tc.sort(function (x, y) { return (y.id === S.teacher ? 1 : 0) - (x.id === S.teacher ? 1 : 0); });
    return J.filter(function (c) { return tc.indexOf(c) < 0; }).concat(tc);
  }
  function selectHtml(S) {
    return '<div class="row" style="margin-top:10px"><label for="teacher"><b>担任の先生</b></label><select id="teacher" data-f="teacher"><option value="">なし（生徒だけ）</option>' +
      S.chars.map(function (c) { return '<option value="' + c.id + '"' + (S.teacher === c.id ? ' selected' : '') + '>' + esc(c.name) + '</option>'; }).join('') +
      '</select><span class="hint" style="margin:0">ここで選んだ人が担任になります。ほかの先生（学年ごとの担任・副担任）は、参加表の「先生（受け持ち）」で選べます。先生は生徒の輪に入らず、生徒との恋愛は起きません（環境値「先生との恋愛」を「あり」にしたときを除く）。</span></div>';
  }
  HK.CastTeacher = { isTeacher: isTeacher, order: order, selectHtml: selectHtml };
})();
