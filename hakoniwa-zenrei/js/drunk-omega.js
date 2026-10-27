/* 箱庭シミュレーター: 酔い方（drunk.js）のオメガバースの出来事（全年齢版・R18版共通）
   2026-10-27（分割読み込みの第3段）：drunk.js から分けた（部品と文は drunk.js の HK.Drunk._k。このファイルは drunk.js のすぐ後に読む）
   {a}=酔った人 {b}=相手 */
(function () {
  'use strict';
  var HK = window.HK, D = HK.Drunk, K = D && D._k;
  if (!K) return;
  var top = K.top, fill = K.fill, react = K.react, why = K.why, behave = K.behave, SHOW = K.SHOW, TO = K.TO, CARE = K.CARE, MORN = K.MORN, OM_EX = K.OM_EX, OM_AB = K.OM_AB, OCC = K.OCC, WEAK = K.WEAK;
  /* ---------- オメガバース ---------- */
  var OMS = HK.SCENARIOS && HK.SCENARIOS.omega;
  if (OMS) {
    OMS.events.push({
      id: 'om_drink', cat: 'romance', scope: 'pair',
      when: function (ctx, a, b) { var pf = ctx.pair(a, b); var mk = a.i < b.i ? a.i + '-' + b.i : b.i + '-' + a.i; return ctx.om && ctx.om.met && (ctx.om.met[mk] || ctx.R(a, b).aff > 5 || pf.couple) && (pf.dkAt == null || ctx.stepIndex - pf.dkAt >= 4); },
      w: function (ctx, a, b) { return (0.35 + a.tr.fc * 0.3 + ctx.R(a, b).aff / 150 + (ctx.pair(a, b).couple ? 0.2 : 0)) * [1, 1.3, 1.15, 1, 0.85, 0.7][D.strong(ctx, a)]; },
      run: function (ctx, a, b) {
        var pf = ctx.pair(a, b); pf.dkAt = ctx.stepIndex;
        var k = behave(ctx, a, b), sx = a.om && a.om.sex, st = D.strong(ctx, a);
        /* 酒に強い人（4）は、半分くらいは顔に出ない */
        if (st === 4 && k !== 'zaru' && ctx.rng() < 0.5) k = 'zaru';
        var t = fill(ctx, ctx.pick(OCC), a, b) + (st <= 1 && k !== 'zaru' ? fill(ctx, ctx.pick(WEAK), a, b) : '') + fill(ctx, ctx.pick(SHOW[k]), a, b) + fill(ctx, ctx.pick(TO[k]), a, b);
        if (sx && OM_EX[sx] && (sx !== 'b' || k === 'zaru') && ctx.rng() < 0.5) {
          t += fill(ctx, ctx.pick(OM_EX[sx]), a, b);
          if (sx === 'o' && b.om && b.om.sex === 'a') { t += fill(ctx, ctx.pick(OM_AB), a, b); ctx.mod2(a, b, { trust: 4 }, { att: 5 }); }
        }
        t += react(ctx, a, b);
        if (k !== 'zaru' && D.strong(ctx, b) >= 3 && ctx.rng() < 0.45) { t += fill(ctx, ctx.pick(CARE), a, b); ctx.mod(a, b, { trust: 6, aff: 4 }); }
        pf.dkMorning = ctx.stepIndex;
        return { cat: k === 'sekkyo' ? 'bond' : 'romance', text: t, why: why(ctx, a) + '／' + b.name + 'の反応は' + top(b) + '（いちばん強い因子）', mag: 16 };
      }
    });
    OMS.events.push({
      id: 'om_drink_morning', cat: 'romance', scope: 'pair',
      when: function (ctx, a, b) { var pf = ctx.pair(a, b); return pf.dkMorning != null && ctx.stepIndex - pf.dkMorning === 1; },
      w: function () { return 1.5; },
      run: function (ctx, a, b) {
        var pf = ctx.pair(a, b); pf.dkMorning = null;
        var drunkOne = D.strong(ctx, a) <= D.strong(ctx, b) ? a : b, other = drunkOne === a ? b : a;
        var rem = drunkOne.tr.a + drunkOne.tr.caution > 1 ? 'remember' : 'forget';
        return { text: fill(ctx, ctx.pick(MORN[rem]), drunkOne, other), why: drunkOne.name + 'の翌朝（' + (rem === 'remember' ? '覚えている：A・慎重さが高い' : '覚えていない') + '）', mag: 6 };
      }
    });
  }
})();
