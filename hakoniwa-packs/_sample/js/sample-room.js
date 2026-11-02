/* 追加パックの見本：「ふたりの日常」の仕組みをそのまま使う試しの箱庭（本番には出さない。build-pack.js の試し・画面の確かめ用）
   ・パックの箱庭の id はパックの id で始める（sample-…）。登録は HK.SCENARIOS[id] = 箱庭; だけ（並びは本体の HK.Load.addPack が足す）
   ・頼る本体のかたまり（scen-futari）は pack.json の deps に書く */
(function () {
  'use strict';
  var HK = window.HK;
  var base = (HK.SCENARIOS_HIDDEN && HK.SCENARIOS_HIDDEN.futari) || HK.SCENARIOS.futari;
  if (!base) return;
  HK.SCENARIOS['sample-futari'] = Object.assign({}, base, {
    id: 'sample-futari', name: '（見本）ふたりの休日', kicker: '恋愛・日常',
    desc: '追加パックの見本です。「ふたりの日常」と同じ仕組みで、二人の毎日を眺めます。'
  });
})();
