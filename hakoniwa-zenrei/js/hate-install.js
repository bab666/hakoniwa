/* 箱庭シミュレーター: 敵視の出来事を、関係の値で動く箱庭に組み込む（hate-kit.js の H.install）
   ・ゾンビの街・クラスメイト・合コン・出られない部屋：中心になる箱庭。出会ったときの反応と、嫌がらせ・無視・噛み合わない関係・衝突
     （ゾンビの街は、同じエリアで出会ったときの反応を zombie-core.js の出会いの場面で出す）
   ・オメガバース：一方が近づき、一方が嫌悪する（フェロモンに引き寄せられる）
   物語型の箱庭は、それぞれのファイルから呼ぶ（邪神村・吹雪の館・人狼・媚薬ロッカー・ダンジョン） */
(function () {
  'use strict';
  var HK = window.HK, H = HK.HateKit, SC = HK.SCENARIOS;
  if (!H || !SC) return;
  if (SC.zombie) H.install(SC.zombie, { w: 1.4 });
  if (SC.classroom) H.install(SC.classroom, { w: 1.3, place: function () { return '教室で、'; } });
  if (SC.goukon) H.install(SC.goukon, { w: 1.3, place: function () { return '合コンの席で、'; } });
  if (SC.whiteroom) H.install(SC.whiteroom, { w: 1.3 });
  if (SC.omega) H.install(SC.omega, { w: 0.7, approach: function (ctx, a, b) { return b.name + 'は、' + a.name + 'の匂いに引き寄せられるように、距離を詰めた。'; } });
})();
