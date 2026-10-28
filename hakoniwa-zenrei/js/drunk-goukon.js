/* 箱庭シミュレーター: 酔い方（drunk.js）の合コンの出来事（全年齢版・R18版共通）
   2026-10-27（分割読み込みの第3段）：drunk.js から分けた（部品と文は drunk.js の HK.Drunk._k。このファイルは drunk.js のすぐ後に読む）
   {a}=酔った人 {b}=相手 */
(function () {
  'use strict';
  var HK = window.HK, D = HK.Drunk, K = D && D._k;
  if (!K) return;
  var top = K.top, fill = K.fill, react = K.react, why = K.why, behave = K.behave, SHOW = K.SHOW, TO = K.TO, CARE = K.CARE, MORN = K.MORN, OM_EX = K.OM_EX, OM_AB = K.OM_AB, OCC = K.OCC, WEAK = K.WEAK;
  /* ---------- 合コン ---------- */
  var GK = HK.SCENARIOS && HK.SCENARIOS.goukon;
  if (GK) {
    GK.events.push({
      id: 'dk_style', label: '酔いが回って酒癖が出る', cat: 'solo', scope: 'solo',
      when: function (ctx, a) { return (a.flags.drunk > 45 || ctx.stat(a, 'drink') >= 5 && ctx.stepIndex >= 2) && !a.flags.dkShown; },
      w: function (ctx, a) { return 1.2 + (a.flags.drunk || 0) / 80; }, pri: true,
      run: function (ctx, a) {
        a.flags.dkShown = true;
        var k = ctx.stat(a, 'drink') >= 5 ? 'zaru' : D.type(a);
        return { text: fill(ctx, ctx.pick(SHOW[k]), a, null), why: why(ctx, a), mag: 10 };
      }
    });
    GK.events.push({
      id: 'dk_to', label: '酔って気になる相手に絡む', cat: 'romance', scope: 'pair',
      when: function (ctx, a, b) { return a.flags.dkShown && (a.flags.drunk > 50 || ctx.stat(a, 'drink') >= 5) && (ctx.pair(a, b).dk || 0) < 2; },
      w: function (ctx, a, b) { return 0.9 + ctx.R(a, b).att / 60 + (a.flags.drunk || 0) / 100; },
      run: function (ctx, a, b) {
        var pf = ctx.pair(a, b); pf.dk = (pf.dk || 0) + 1;
        var k = behave(ctx, a, b);
        return { cat: k === 'sekkyo' ? 'bond' : k === 'zaru' ? 'help' : 'romance', text: fill(ctx, ctx.pick(TO[k]), a, b) + react(ctx, a, b), why: why(ctx, a) + '／' + b.name + 'の反応は' + top(b) + '（いちばん強い因子）', mag: 14 };
      }
    });
    GK.events.push({
      id: 'dk_care', label: '酔いつぶれた人を介抱する', cat: 'help', scope: 'pair',
      when: function (ctx, a, b) { return b.flags.drunk > 75 && (a.flags.drunk || 0) < 50 && !b.flags.dkCared && ctx.stepIndex >= 4; },
      w: function (ctx, a, b) { return 0.6 + a.tr.np + ctx.R(a, b).att / 60; },
      run: function (ctx, a, b) {
        b.flags.dkCared = true;
        ctx.mod2(a, b, { aff: 4, att: 3 }, { trust: 10, aff: 8, att: 5 });
        return { text: fill(ctx, ctx.pick(CARE), b, a), why: a.name + 'の面倒見（NP ' + Math.round(a.eg.NP) + '）と、' + b.name + 'の酔い（' + Math.round(b.flags.drunk) + '）', mag: 16 };
      }
    });
  }
})();
