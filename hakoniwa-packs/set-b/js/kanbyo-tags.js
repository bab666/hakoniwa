/* 追加パック「ふたりのイチャイチャセット」：「看病の部屋」の箱庭のタグ（2026-11-07。カードの札と、箱庭を選ぶ一覧の絞り込み。語彙は本体の js/scen-tags.js の HK.ScenTags.DEF、判定の根拠は docs/reports/2026-11-07/scen-tags.md）
   恋人推奨は付けない（関係の設定のまま遊べ、片想い・友人から「治って恋人に」へ進むのが本筋の一つ）。三人目は見舞いの側で、三人の夜は起きない（計測で 3 人 0/10 回）。
   build-pack が目録の tags に写すので、まだ読み込んでいないときもカードに出る。R18 の語は r18 の印の中（全年齢版のパックには入れない） */
(function () {
  'use strict';
  var HK = window.HK;
  if (!HK || !HK.ScenTags || !HK.ScenTags.add) return;
  HK.ScenTags.add('set-b-kanbyo', ['daily', 'relCore', 'duo', 'food']);
  /* r18:begin */
  HK.ScenTags.add('set-b-kanbyo', ['heat']);
  /* r18:end */
})();
