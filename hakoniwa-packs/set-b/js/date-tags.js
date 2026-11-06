/* 追加パック「ふたりのイチャイチャセット」：「デートの日々」の箱庭のタグ（2026-11-07。カードの札と、箱庭を選ぶ一覧の絞り込み。語彙は本体の js/scen-tags.js の HK.ScenTags.DEF、判定の根拠は docs/reports/2026-11-07/scen-tags.md）
   恋人推奨＝恋愛にならない関係では「お出かけ」になり恋愛の結末が出ない。W デート＝4 人で二組のダブルデート（計測で 10/10 回）。3P 可・4P 可＝三人デート・ダブルデートの夜（3 人 10/10 回・4 人 7/10 回）。
   build-pack が目録の tags に写すので、まだ読み込んでいないときもカードに出る。R18 の語は r18 の印の中（全年齢版のパックには入れない） */
(function () {
  'use strict';
  var HK = window.HK;
  if (!HK || !HK.ScenTags || !HK.ScenTags.add) return;
  HK.ScenTags.add('set-b-date', ['daily', 'relCore', 'duo', 'lover', 'wdate', 'jealous', 'food', 'birthday', 'season']);
  /* r18:begin */
  HK.ScenTags.add('set-b-date', ['p3', 'p4', 'heat', 'night']);
  /* r18:end */
})();
