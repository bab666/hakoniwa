/* 追加パック「ふたりのイチャイチャセット」：「カップル配信」の箱庭のタグ（2026-11-07。カードの札と、箱庭を選ぶ一覧の絞り込み。語彙は本体の js/scen-tags.js の HK.ScenTags.DEF、判定の根拠は docs/reports/2026-11-07/scen-tags.md）
   恋人推奨＝どんな関係でもカップルとして扱い、結末の結婚報告は恋人か夫婦の二人のときだけ。2 人固定なので 3P・4P は無し。
   build-pack が目録の tags に写すので、まだ読み込んでいないときもカードに出る。R18 の語は r18 の印の中（全年齢版のパックには入れない） */
(function () {
  'use strict';
  var HK = window.HK;
  if (!HK || !HK.ScenTags || !HK.ScenTags.add) return;
  HK.ScenTags.add('set-b-haishin', ['daily', 'relCore', 'duo', 'lover', 'short', 'food']);
  /* r18:begin */
  HK.ScenTags.add('set-b-haishin', ['night']);
  /* r18:end */
})();
