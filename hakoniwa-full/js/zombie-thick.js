/* 箱庭シミュレーター: ゾンビの街 ― 恋人たちの夜（「描写する」）の山場を段落に分けて厚くする（R18版のみ。組み立ては omega-thick.js の HK.TKC）
   襲われる場面（ゾンビ・怪物・略奪者）は元のまま。ここで厚くするのは、合意のうえの恋人たちの夜だけ */
(function () {
  'use strict';
  var HK = window.HK, Z = HK.ZB, TK = HK.TKC;
  if (!Z || !Z.LOVE || !Z.LOVE.nightHigh || !TK) return;
  function L(s) { return s.split('|'); }
  var LEAD = L('外では、ゾンビの呻き声が途切れ途切れに続いていた。バリケード代わりの棚の向こうで、二人は息を殺して抱き合った。|非常灯の赤い光だけが、狭い部屋をぼんやり照らしていた。{T}は{U}の体に咬み跡がないか、一つずつ唇で確かめていった。|');
  var FIN = L('物音がするたびに、二人は繋がったまま動きを止めた。それでも、離れようとはしなかった。|果てたあとも、二人は外の物音に耳を澄ませたまま抱き合っていた。生きている。その体温だけが、確かだった。');
  var n0 = Z.LOVE.nightHigh;
  Z.LOVE.nightHigh = function (ctx, a, b) {
    if (HK.SAFE_ON || !HK.Pos || !HK.Voice) return n0.apply(this, arguments);
    var o = HK.Pos.order(a, b, [a, b]), T = o[0], U = o[1];
    if (!TK.ok(T, U)) return n0.apply(this, arguments);
    var pk = function (arr) { return ctx.pick(arr); };
    var t = TK.body(T, U, { pick: pk, rng: ctx.rng, bed: '毛布', lead: pk(LEAD), finish: pk(FIN), noAfter: true });
    return '\n\n' + TK.names(t, T, U) + '\n\n';
  };
})();
