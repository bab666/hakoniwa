/* 追加パック「ふたりのイチャイチャセット」：「新婚部屋」の箱庭のタグ（2026-11-07。カードの札と、箱庭を選ぶ一覧の絞り込み。語彙は本体の js/scen-tags.js の HK.ScenTags.DEF、判定の根拠は docs/reports/2026-11-07/scen-tags.md）
   恋人推奨＝最初の二人が新婚の夫婦として始まる部屋。3P 可・4P 可＝三人婚・四人婚の夜（計測で 3 人 9/10 回・4 人 8/10 回）。季節・行事＝月の行事の出来事 13 件。
   build-pack が目録の tags に写すので、まだ読み込んでいないときもカードに出る。R18 の語は r18 の印の中（全年齢版のパックには入れない） */
(function () {
  'use strict';
  var HK = window.HK;
  if (!HK || !HK.ScenTags || !HK.ScenTags.add) return;
  HK.ScenTags.add('set-b-shinkon', ['daily', 'relCore', 'duo', 'lover', 'food', 'birthday', 'season']);
  /* r18:begin */
  HK.ScenTags.add('set-b-shinkon', ['p3', 'p4', 'heat', 'night']);
  /* r18:end */
})();
