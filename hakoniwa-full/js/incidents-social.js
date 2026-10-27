/* 箱庭診断: 全員に降りかかる出来事（合コン／出られない部屋／クラスメイト） */
(function () {
  'use strict';
  var HK = window.HK;
  HK.INCIDENTS = HK.INCIDENTS || {};
  function R(ctx, a, b) { return ctx.R(a, b); }
  function names(list) { return list.map(function (c) { return c.name; }).join('・'); }
  function fav(ctx, a, pool, min) {
    var best = null, bv = min == null ? 25 : min;
    pool.forEach(function (o) { if (o === a) return; var r = R(ctx, a, o), v = r.aff * 0.5 + r.att; if (v > bv) { bv = v; best = o; } });
    return best;
  }
  /* 同時に指をさす系：全員の矢印を公開する */
  function pointAll(ctx, P, prefix, why) {
    if (P.length > 8) P = ctx.rng.shuffle(P).slice(0, 8);
    var pick = {};
    P.forEach(function (a) { pick[a.i] = fav(ctx, a, P, 22); });
    var done = {};
    P.forEach(function (a) {
      var b = pick[a.i];
      if (!b) {
        ctx.act2({ actors: [a], cat: 'solo', fx: function () { P.forEach(function (o) { if (o !== a && R(ctx, o, a).att > 35) ctx.stress(o, 8); }); },
          text: ctx.t(a.tr.cold > 0.55 ? '{a}は誰のことも指さず、肩をすくめた。' : '{a}は迷った末に、誰でもなく天井を指さした。', a), why: a.name + 'に、指さすほどの相手がまだいない' });
        return;
      }
      if (done[a.i]) return;
      if (pick[b.i] === a) {
        done[a.i] = done[b.i] = 1;
        ctx.act2({ actors: [a, b], cat: 'romance', mag: 20, fx: function () { ctx.mod2(a, b, { att: 12, aff: 6 }, { att: 12, aff: 6 }); },
          text: ctx.t(prefix + '{a}と{b}の指が、互いを向いていた。どちらも一瞬、手を下ろしかけた。', a, b), why: why + '：両想い（惹かれ ' + Math.round(R(ctx, a, b).att) + '／' + Math.round(R(ctx, b, a).att) + '）' });
      } else {
        var c = pick[b.i];
        ctx.act2({ actors: [a, b], cat: 'romance', fx: function () {
          ctx.mod(b, a, { att: b.tr.ac > 0.55 ? 8 : 4 }); ctx.stress(a, 6);
          if (c && (!HK.Obsess || HK.Obsess.jealOk(ctx, a, b))) { ctx.mod(a, c, { ten: 8 }); ctx.pair(a, c).jealous++; if (HK.Obsess) HK.Obsess.feed(ctx, a, b, 5); }
        }, text: ctx.t(prefix + '{a}は{b}を指さした。' + (c ? '{b}の指は{c}を向いていた。' : ''), a, b, c), why: why + '：' + a.name + 'の惹かれ（' + Math.round(R(ctx, a, b).att) + '）' });
      }
    });
  }

  /* 2026-10-27（分割読み込みの第3段）：箱庭ごとの出来事の表は incidents-goukon.js・incidents-room.js・incidents-classroom.js（それぞれの箱庭のかたまり。このファイルのすぐ後）に分けた。部品は HK.IncSocial で渡す */
  HK.IncSocial = { R: R, names: names, fav: fav, pointAll: pointAll };
})();
