/* 箱庭シミュレーター: 箱庭の表 HK.SCENARIOS・HK.SCEN_ORDER を用意する（中核。scenarios-a.js の位置。全年齢版・R18版共通）
   目録（HK_MANIFEST）があるときは js/load.js が先に作る。目録の無いとき（build が目録を作る vm・js を1本ずつ読む開発中）は、
   今まで中核の scenarios-a.js（合コン・クラスメイト）が作っていたが、2026-10-27（分割読み込みの第3段）で箱庭の登録を scen-<id> に移したので、ここで作る */
(function () {
  'use strict';
  var HK = window.HK = window.HK || {};
  HK.SCENARIOS = HK.SCENARIOS || {};
  HK.SCEN_ORDER = HK.SCEN_ORDER || [];
})();
