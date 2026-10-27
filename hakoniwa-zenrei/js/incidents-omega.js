/* 箱庭診断: 全員に降りかかる出来事（オメガバース）。環境値「ハプニングの頻度」で起きやすさが変わる（engine.js の runIncident）
   2026-10-27（分割読み込みの第3段）：incidents-extra.js から分けた（箱庭のかたまり scen-omega。incidents-extra.js のすぐ後に読む）。部品は HK.IncExtra */
(function () {
  'use strict';
  var HK = window.HK, K = HK.IncExtra;
  if (!K) return;
  HK.INCIDENTS = HK.INCIDENTS || {};
  var R = K.R, L = K.L, loveOK = K.loveOK, zPair = K.zPair, zLive = K.zLive, spaced = K.spaced;
  /* ======================= オメガバース ======================= */
  function sx(c) { return c.om && c.om.sex; }
  HK.INCIDENTS.omega = [
    {
      id: 'shortage', min: 1, from: 1,
      run: function (ctx) {
        var P = ctx.present(), O = P.filter(function (c) { return sx(c) === 'o'; });
        ctx.incident('抑制剤の主要メーカーで出荷停止のニュースが流れた。薬局の棚から、抑制剤が一斉に消えた。');
        O.forEach(function (o) { ctx.stress(o, 12); });
        var o = O.length ? ctx.rng.pick(O) : null;
        var helper = o ? ctx.most(P.filter(function (c) { return c !== o; }), function (c) { return c.tr.np * 0.6 + Math.max(0, R(ctx, c, o).aff) / 80; }) : null;
        if (o && helper && (helper.tr.np > 0.5 || R(ctx, helper, o).aff > 30)) ctx.act2({ actors: [helper, o], cat: R(ctx, helper, o).att > 35 && loveOK(ctx, helper, o) ? 'romance' : 'help', fx: function () { ctx.mod(o, helper, loveOK(ctx, helper, o) ? { aff: 8, trust: 8, att: 3 } : { aff: 8, trust: 8 }); ctx.stress(o, -8); },
          text: ctx.t('{a}は、三軒目の薬局でようやく見つけた抑制剤を{b}に手渡した。「足りなくなったら、また探すから｜足りなくなったら、また探す｜足りなくなったら、また探しますから」', helper, o), why: helper.name + 'のNP・' + o.name + 'への好意' });
        else if (o) ctx.act2({ actors: [o], cat: 'solo', text: ctx.t('{a}は手持ちの抑制剤を数え、カレンダーと見比べて、黙って溜め息をついた。', o), why: 'Ωの暮らしに直撃する知らせ' });
      }
    },
    {
      id: 'typhoon', min: 2, from: 1,
      run: function (ctx) {
        var P = ctx.present(), best = null, bv = 15;
        P.forEach(function (a) { P.forEach(function (b) { if (a === b || !loveOK(ctx, a, b)) return; var v = R(ctx, a, b).att + R(ctx, a, b).aff * 0.4 + ctx.rng() * 12; if (v > bv) { bv = v; best = [a, b]; } }); });
        ctx.incident('大型の台風で、街に外出禁止の呼びかけが出た。');
        if (!best) return;
        ctx.act2({ actors: best, cat: 'romance', fx: function () { ctx.mod2(best[0], best[1], { att: 6, aff: 4 }, { att: 6, aff: 4 }); },
          text: ctx.t(ctx.pick(L('帰れなくなった{b}は、{a}の部屋に泊まることになった。窓を叩く雨の音と、すぐそばにある相手の匂いのせいで、二人とも明け方まで眠れなかった。|停電した{a}の部屋で、{b}と二人、ろうそくの火を見ていた。互いの匂いが、狭い部屋に少しずつ混ざっていった。')), best[0], best[1]), why: '台風で二人きりに（ハプニングの頻度 ' + ctx.env.incident + '）' });
      }
    },
    {
      id: 'checkup', min: 1, from: 1,
      run: function (ctx) {
        var P = ctx.present(), a = ctx.rng.pick(P);
        ctx.incident('第二性の定期検診の季節になった。' + a.name + 'の元にも、通知が届いた。');
        if (sx(a) === 'o') ctx.act2({ actors: [a], cat: 'solo', fx: function () { ctx.stress(a, a.tr.ac > 0.55 ? 8 : 2); }, text: ctx.t(a.tr.ac > 0.55 ? '{a}は「フェロモン値：高め」の欄から、しばらく目を離せなかった。' : '{a}は結果を一瞥して、「いつも通り｜＝｜いつも通りです」とだけ呟いた。', a), why: a.name + 'のAC' });
        else if (sx(a) === 'a') ctx.act2({ actors: [a], cat: 'solo', text: ctx.t('{a}は検診の問診票の「番の有無」の欄で、少しだけペンを止めた。', a), why: 'α：番について考える' });
        else ctx.act2({ actors: [a], cat: 'solo', text: ctx.t('{a}は「β・特記事項なし」の結果を折りたたみ、なぜか少しだけ寂しくなった。', a), why: 'β：第二性の外側から見る' });
      }
    },
    {
      id: 'fullmoon', once: false, min: 2, from: 2,
      run: function (ctx) {
        var P = ctx.present();
        ctx.incident('「⁠満月の夜は発情期が重なりやすい」という噂が、街で囁かれていた。その夜、空には大きな月が出ていた。');
        P.filter(function (c) { return sx(c) === 'a' || sx(c) === 'o'; }).forEach(function (c) { ctx.stress(c, 4); });
        var best = null, bv = 30;
        P.forEach(function (a) { P.forEach(function (b) { if (a === b || !loveOK(ctx, a, b) || !(sx(a) === 'a' && sx(b) === 'o' || sx(a) === 'o' && sx(b) === 'a')) return; var v = R(ctx, a, b).att + ctx.rng() * 10; if (v > bv) { bv = v; best = [a, b]; } }); });
        if (best) ctx.act2({ actors: best, cat: 'romance', fx: function () { ctx.mod2(best[0], best[1], { att: 7 }, { att: 7 }); },
          text: ctx.t('帰り道、{a}はふいに{b}の匂いに足を止めた。月のせいにしたかったが、そうではないことは自分がいちばん分かっていた。', best[0], best[1]), why: 'α×Ωの惹かれ（' + Math.round(R(ctx, best[0], best[1]).att) + '）と満月の噂' });
      }
    },
    {
      id: 'party', min: 2, from: 2,
      run: function (ctx) {
        var P = ctx.present(), free = P.filter(function (c) { return !P.some(function (o) { return o !== c && ctx.pair(c, o).couple; }); });
        if (free.length < 1) return;
        var a = ctx.most(free, function (c) { return c.tr.fc * 0.5 + c.tr.warmth * 0.5; });
        ctx.incident('街で、第二性を問わない交流パーティーが開かれることになった。' + a.name + 'の手元にも、招待状が二枚届いた。');
        var b = ctx.most(P.filter(function (c) { return c !== a; }), function (c) { return R(ctx, a, c).att + R(ctx, a, c).aff * 0.5; });
        if (b && loveOK(ctx, a, b) && R(ctx, a, b).att > 25 && a.tr.fc + a.tr.impulse > 0.9) ctx.act2({ actors: [a, b], cat: 'romance', fx: function () { ctx.mod2(a, b, { att: 6 }, { att: 5, aff: 4 }); }, text: ctx.t('{a}は二枚目の招待状を、少し迷ってから{b}に差し出した。「……一緒に行かない？｜……一緒に行かないか｜……一緒に行きませんか？」', a, b), why: a.name + 'のFC・衝動性と、' + b.name + 'への惹かれ' });
        else ctx.act2({ actors: [a], cat: 'solo', text: ctx.t('{a}は招待状を机の引き出しにしまった。誘いたい相手の顔が浮かんだが、結局、声はかけなかった。', a), why: a.name + 'の遠慮' });
      }
    },
    {
      id: 'blackout', min: 2, from: 3,
      run: function (ctx) {
        var P = ctx.present();
        ctx.incident('街全体が停電した。エレベーターも止まり、通りは月明かりだけになった。');
        var best = null, bv = 20;
        P.forEach(function (a) { P.forEach(function (b) { if (a === b) return; var v = R(ctx, a, b).aff + R(ctx, a, b).att * 0.5 + ctx.rng() * 10; if (v > bv) { bv = v; best = [a, b]; } }); });
        if (best) ctx.act2({ actors: best, cat: 'bond', fx: function () { ctx.mod2(best[0], best[1], { aff: 5, trust: 4, att: 2 }, { aff: 5, trust: 4, att: 2 }); }, text: ctx.t('{a}は真っ暗な階段で、{b}の手を引いて一段ずつ降りた。降りきってからも、しばらく手は離れなかった。', best[0], best[1]), why: '停電の夜に、近くにいた二人' });
      }
    }
  ];
  spaced(HK.INCIDENTS.omega, 6);
})();
