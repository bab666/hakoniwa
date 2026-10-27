/* 箱庭シミュレーター: オメガバース ― 恋人・番の夜と、エッチの回数の目安
   ・番になった二人ほど求め合う。恋人どうしも、ときどき
   ・エッチの場面は一回の箱庭で平均2回ほど（発情期・恋人の夜・一夜限り・憎しみの夜・寝取りを合わせて）。
     回数が増えるほど次は起きにくくなり、発情期は抑制剤や看病で乗り切る場面に変わりやすくなる
   ・展開は「場面 × はじまり × プレイ × 結び × 事後」を組み合わせる。プレイと結びは二人の第二性の組み合わせ
     （α攻め×Ω受け／Ω攻め×α受け／α同士／Ω同士／βがいる）で文が変わる。受け攻めの指定でΩ攻めも起きる
   {a}=抱く側（攻め） {b}=抱かれる側（受け）。登場人物はすべて成人として扱う
   2026-10-27（分割読み込みの第3段）：文と組み立て（OM.LOVE・OM.loveScene など）は omega-love-kit.js（pack-rel。このファイルのすぐ前）に分けた。ここは箱庭に足す出来事だけ */
(function () {
  'use strict';
  var HK = window.HK, OM = HK.OMEGA, scen = HK.SCENARIOS && HK.SCENARIOS.omega, K = OM && OM._love;
  if (!scen || !OM || !K) return;
  var L = K.L, sx = K.sx, bonded = K.bonded, pick = K.pick, cap = K.cap, scene = K.scene;
  var CB_LABEL = { ao: 'α攻め×Ω受け', oa: 'Ω攻め×α受け', aa: 'α同士', oo: 'Ω同士', b: 'βがいる組' };
  scen.events.push({
    id: 'om_lovers', cat: 'romance', sex: true, scope: 'pair', pri: true,
    when: function (ctx, a, b) {
      var pf = ctx.pair(a, b);
      if (!(pf.couple || bonded(ctx, a, b)) || !HK.canLove(a, b) || !HK.canLove(b, a)) return false;
      if ((a.om && (a.om.heat > 0 || a.om.rut > 0)) || (b.om && (b.om.heat > 0 || b.om.rut > 0))) return false;
      return pf.loveAt == null || ctx.stepIndex - pf.loveAt >= 2;
    },
    w: function (ctx, a, b) {
      var bond = bonded(ctx, a, b), r = Math.min(ctx.R(a, b).att, ctx.R(b, a).att);
      return ((bond ? 2.2 : 0.5) + r / 100 + (a.tr.impulse + b.tr.impulse) * 0.15 + (ctx.env.lewd === 'high' ? 0.3 : 0)) * cap(ctx);
    },
    run: function (ctx, a, b) {
      var bond = bonded(ctx, a, b), pf = ctx.pair(a, b);
      pf.loveAt = ctx.stepIndex; pf.nights = (pf.nights || 0) + 1;
      ctx.om.sexN = (ctx.om.sexN || 0) + 1;
      /* OM.loveScene を通す（R18版では omega-thick.js が段落に分けた版・男性向けに包む） */
      var s = (OM.loveScene || scene)(ctx, a, b, bond);
      ctx.mod2(a, b, { att: 5, aff: 4, trust: 3 }, { att: 5, aff: 4, trust: 3 });
      ctx.stress(a, -10); ctx.stress(b, -10);
      return { text: s.text, why: (bond ? '番になった二人。番の匂いが、何度でも二人を引き寄せる' : '恋人どうし（互いの惹かれ）') + '／' + CB_LABEL[s.cb] + '（' + s.A.name + 'が攻め）', mag: bond ? 22 : 15 };
    }
  });

  /* ---------- ほかのエッチの場面にも回数の目安をかける ---------- */
  var SEXY = { om_heat: 0.5, om_night: 1, om_hatenight: 1, om_steal: 1 };
  var COOL = L('{b}は抑制剤を飲んで、熱が引くまで一人で布団にくるまっていた。{a}は扉の外から、何度も声をかけた。|{a}は{b}のために抑制剤と水を用意し、熱が下がるまで、部屋の外で看病を続けた。|{b}は{a}に電話をかけた。「声だけ聞かせて｜声だけ聞かせてくれ｜声だけ聞かせてください」――{a}は一晩中、他愛ない話を続けた。|{b}は巣作りに夢中になって、{a}の服を全部持ち出した。{a}は苦笑して、熱が引くのを隣で待った。|{a}は{b}の額に冷たいタオルを乗せ、「今回はゆっくり休もう｜＝｜今回はゆっくり休みましょう」と言った。{b}は少し残念そうに、でも安心したように眠った。');
  scen.events.forEach(function (e) {
    if (!SEXY[e.id] || e._capped) return;
    e._capped = true;
    var w0 = e.w, r0 = e.run, k = SEXY[e.id];
    e.w = function (ctx, a, b) { var w = w0.apply(this, arguments), m = cap(ctx); return w * (1 - k + k * m); };
    e.run = function (ctx, a, b) {
      /* 発情期：回数が多い回は、抑制剤・看病・電話などで乗り切る場面に */
      if (e.id === 'om_heat' && ctx.rng() > cap(ctx) * 1.3) {
        var O = sx(a) === 'o' && a.om.heat > 0 ? a : b, X = O === a ? b : a;
        ctx.mod2(X, O, { trust: 6, aff: 4 }, { trust: 8, aff: 5 });
        return { cat: 'help', text: (OM.sc || function (t) { return t; })(ctx.t(pick(ctx, COOL), X, O), X, O), why: '発情期（' + O.name + '）。今回は抑制剤と看病で乗り切った' };
      }
      var pf = ctx.pair(a, b), n0 = pf.nights || 0;
      var r = r0.apply(this, arguments);
      if ((pf.nights || 0) > n0) ctx.om.sexN = (ctx.om.sexN || 0) + 1;
      return r;
    };
  });
})();
