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
    desc: '追加パックの見本です。「ふたりの日常」と同じ仕組みで、二人の毎日を眺めます。',
    /* 出来事の一覧の見本（2026-11-03）：パックの箱庭だけの出来事は、本体と同じく label（表示名）と、要るなら tie・tags を付ける。
       元の箱庭の出来事の山を写して足す（元の配列は書き換えない）。見本なので起きない（when が false） */
    events: (base.events || []).concat([
      { id: 'sample_star', cat: 'bond', scope: 'pair', tie: '-', label: '（見本）二人でベランダから星を眺める', w: 0,
        when: function () { return false; }, run: function () { return null; } }
    ])
  });
  /* 関数で書いた場面は、近くに 1 行の印を書くと一覧に入る（R18 の場面の印は r18 の印の中か R18 専用のファイル） */
  /* @event scen=sample-futari id=sample_walk cat=bond tie=lover label=（見本）休日に二人で川沿いを散歩する */
  /* r18:begin */
  /* @event scen=sample-futari id=sample_night cat=romance tie=lover tags=night label=（見本）記念日の夜を二人きりで過ごす */
  /* r18:end */
})();
