/* 箱庭診断: 全員に降りかかる出来事（ゾンビの街／オメガバース）。環境値「ハプニングの頻度」で起きやすさが変わる（engine.js の runIncident）
   ・ゾンビの街：住人は街のあちこちにいるので、出来事は街ごと（放送・雨・停電・サイレン・物資の投下・悲鳴・壁の伝言）。
     二人の関係が動くのは、同じエリアにいる二人だけ
   ・オメガバース：街の暮らしに降りかかる出来事（抑制剤の品薄・台風・第二性の検診・満月の噂・停電・パーティーの誘い） */
(function () {
  'use strict';
  var HK = window.HK;
  HK.INCIDENTS = HK.INCIDENTS || {};
  function R(ctx, a, b) { return ctx.R(a, b); }
  function L(s) { return s.split('|'); }
  /* 恋愛の出来事にしてよい二人か（恋愛の起こりやすさ0・恋愛の成り立たない組・恋愛：なしの血縁・恋愛相手を別に決めた人は除く） */
  function loveOK(ctx, a, b) { return ctx.env.romance !== 0 && (!HK.canLove || HK.canLove(a, b)) && !ctx.pair(a, b).kin && !HK.lockOut(a, b) && !HK.lockOut(b, a); }
  /* 同じエリアにいて、惹かれか好意のある二人（いなければ null） */
  function zPair(ctx, P, min, love) {
    var best = null, bv = min == null ? 20 : min;
    P.forEach(function (a) {
      P.forEach(function (b) {
        if (a === b || !a.z || !b.z || a.z.area !== b.z.area || a.z.alone || b.z.alone) return;
        if (love && !loveOK(ctx, a, b)) return;
        var v = R(ctx, a, b).att + R(ctx, a, b).aff * 0.5 + ctx.rng() * 10;
        if (v > bv) { bv = v; best = [a, b]; }
      });
    });
    return best;
  }
  function zLive(ctx) { return ctx.present().filter(function (c) { return !c.z || !c.z.zombie; }); }

  /* 区切りの多い箱庭なので、続けて起きすぎないよう間を空ける（ゾンビの街は4区切り＝1日、オメガバースは6区切り＝3か月） */
  function spaced(list, gap) {
    list.forEach(function (x) {
      var w0 = x.when, r0 = x.run;
      x.when = function (ctx, s, n) { var at = ctx.flags.incAt; return (at == null || s - at >= gap) && (!w0 || w0(ctx, s, n)); };
      x.run = function (ctx, s, n) { ctx.flags.incAt = s; return r0(ctx, s, n); };
    });
  }
  /* 2026-10-27（分割読み込みの第3段）：箱庭ごとの出来事の表は incidents-zombie.js・incidents-omega.js（それぞれの箱庭のかたまり。このファイルのすぐ後）に分けた。部品は HK.IncExtra で渡す */
  HK.IncExtra = { R: R, L: L, loveOK: loveOK, zPair: zPair, zLive: zLive, spaced: spaced };
})();
