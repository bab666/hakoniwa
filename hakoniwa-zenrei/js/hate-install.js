/* 箱庭シミュレーター: 敵視の出来事を、関係の値で動く箱庭に組み込む（hate-kit.js の H.install）
   ・ゾンビの街・クラスメイト・合コン・出られない部屋：中心になる箱庭。出会ったときの反応と、嫌がらせ・無視・噛み合わない関係・衝突
     （ゾンビの街は、同じエリアで出会ったときの反応を zombie-core.js の出会いの場面で出す）
   ・オメガバース：一方が近づき、一方が嫌悪する（フェロモンに引き寄せられる）
   物語型の箱庭は、それぞれのファイルから呼ぶ（邪神村・吹雪の館・人狼・媚薬ロッカー・ダンジョン）
   2026-10-27（分割読み込みの第3段）：箱庭の本体は箱庭のかたまり（scen-<id>）で後から届くので、HK.atScen で「有れば今、無ければ届いたとき」に組み込む */
/* @event-ok 閉じ込められた部屋・二人きりの分岐（展開の不整合。2026-10-31 担当RC） */
(function () {
  'use strict';
  var HK = window.HK, H = HK.HateKit, SC = HK.SCENARIOS;
  if (!H || !SC) return;
  HK.atScen('zombie', function (s) { H.install(s, { w: 1.4 }); });
  /* 無人島にも（片方向の不仲・敵対で、敵視する側だけが冷たくする場面。2026-11-02） */
  HK.atScen('island', function (s) { H.install(s, { w: 1.3 }); });
  HK.atScen('classroom', function (s) { H.install(s, { w: 1.3, place: function () { return '教室で、'; } }); });
  HK.atScen('goukon', function (s) { H.install(s, { w: 1.3, place: function () { return '合コンの席で、'; } }); });
  /* 出られない部屋は最初から同じ部屋にいるので、「顔を合わせる」は目覚めの区切りだけ（2026-10-31 担当RC） */
  HK.atScen('whiteroom', function (s) { H.install(s, { w: 1.3, atStart: true }); });
  HK.atScen('omega', function (s) { H.install(s, { w: 0.7, approach: function (ctx, a, b) { return b.name + 'は、' + a.name + 'の匂いに引き寄せられるように、距離を詰めた。'; } }); });
})();
