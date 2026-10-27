/* 箱庭診断: 全員に降りかかる出来事（クラスメイト）
   2026-10-27（分割読み込みの第3段）：incidents-social.js から分けた（箱庭のかたまり scen-classroom。incidents-social.js のすぐ後に読む）。部品は HK.IncSocial */
(function () {
  'use strict';
  var HK = window.HK, K = HK.IncSocial;
  if (!K) return;
  HK.INCIDENTS = HK.INCIDENTS || {};
  var R = K.R, names = K.names, fav = K.fav, pointAll = K.pointAll;
  /* ======================= クラスメイト ======================= */
  HK.INCIDENTS.classroom = [
    {
      id: 'cheat', from: 1,
      run: function (ctx) {
        var P = ctx.present();
        var ch = ctx.most(P, function (c) { return c.tr.impulse * 0.6 + c.stress / 150 + (ctx.stat(c, 'study') <= 2 ? 0.4 : 0); });
        var w = ctx.most(ctx.others(ch), function (o) { return o.tr.a; });
        ctx.incident('抜き打ちの小テスト。');
        ctx.act2({ actors: [ch], cat: 'solo', text: ctx.t('{a}の机の中で、カンペが小さく光った。', ch), why: ch.name + 'の衝動性と、学力 ' + ctx.stat(ch, 'study') });
        if (!w) return;
        if (w.tr.cp > 0.65 && w.tr.np < 0.55) ctx.act2({ actors: [w, ch], cat: 'betray', mag: 18, fx: function () { ctx.mod(ch, w, { ten: 30, aff: -20, trust: -25 }); ctx.stress(ch, 25); }, text: ctx.t('{a}は手を挙げた。「先生、{b}が」', w, ch), why: w.name + 'のCP（' + Math.round(w.eg.CP) + '）：見逃せない' });
        else if (w.tr.np > 0.5 || R(ctx, w, ch).aff > 25) { ctx.pair(w, ch).secret = true; ctx.act2({ actors: [w, ch], cat: 'help', mag: 12, fx: function () { ctx.mod2(w, ch, { trust: 5 }, { trust: 18, aff: 10 }); }, text: ctx.t('{a}は気づいていた。放課後、{b}にだけ「次はやめときな｜次はやめておけ｜次はやめておいたほうがいいですよ」と言った。', w, ch), why: w.name + 'の' + (w.tr.np > 0.5 ? 'NP' : ch.name + 'への好意') }); }
        else ctx.act2({ actors: [w, ch], cat: 'solo', fx: function () { ctx.mod(w, ch, { trust: -6 }); }, text: ctx.t('{a}は見なかったことにした。', w, ch), why: w.name + 'のドライさ' });
      }
    },
    {
      id: 'umbrella', min: 2,
      run: function (ctx) {
        var P = ctx.present(), forgot = ctx.rng.pick(P);
        var off = ctx.most(ctx.others(forgot), function (o) { return R(ctx, o, forgot).att / 60 + o.tr.np * 0.5; });
        ctx.incident('放課後、急な土砂降り。' + forgot.name + 'は傘を持っていなかった。');
        ctx.act2({ actors: [off, forgot], cat: R(ctx, off, forgot).att > 25 ? 'romance' : 'help', fx: function () { ctx.mod2(off, forgot, { att: 5, aff: 3 }, { att: 8, aff: 5 }); },
          text: ctx.t('昇降口で立ち尽くす{b}に、{a}が傘を半分差しかけた。駅までの道で、{a}の左肩だけが濡れていた。', off, forgot), why: off.name + 'の' + (R(ctx, off, forgot).att > 25 ? '惹かれ（' + Math.round(R(ctx, off, forgot).att) + '）' : 'NP') });
      }
    },
    {
      id: 'locked', min: 2,
      run: function (ctx) {
        var P = ctx.present();
        var pair = null, bv = -1;
        P.forEach(function (a) { P.forEach(function (b) { if (a.i < b.i) { var v = R(ctx, a, b).ten + R(ctx, a, b).att + ctx.rng() * 30; if (v > bv) { bv = v; pair = [a, b]; } } }); });
        var a = pair[0], b = pair[1];
        ctx.incident('体育の片付け中、' + a.name + 'と' + b.name + 'が体育倉庫に閉じ込められた。');
        var tense = R(ctx, a, b).ten > 30;
        ctx.act2({ actors: [a, b], cat: tense ? 'conflict' : (R(ctx, a, b).att > 25 ? 'romance' : 'bond'), mag: 15,
          fx: function () { if (tense) ctx.mod2(a, b, { ten: -14, trust: 12 }, { ten: -14, trust: 12 }); else ctx.mod2(a, b, { att: 9, trust: 8 }, { att: 9, trust: 8 }); },
          text: ctx.t(tense ? '最初の三十分は口もきかなかった。マットに並んで座るころには、{a}と{b}は互いの悪口を言い合って笑っていた。' : '跳び箱にもたれて、{a}と{b}は助けが来るまでの二時間、ずっと小声で話していた。', a, b), why: tense ? '逃げ場のない時間が緊張をほどいた' : '二人きりの時間' });
      }
    },
    {
      id: 'chorus', min: 3,
      run: function (ctx) {
        var P = ctx.present();
        var cond = ctx.most(P, function (c) { return c.tr.lead; });
        var slack = ctx.most(ctx.others(cond), function (o) { return o.tr.fc * (1 - o.tr.ac); });
        ctx.incident('合唱コンクールの練習が始まった。指揮は' + cond.name + '。');
        if (slack && slack.tr.fc * (1 - slack.tr.ac) > 0.35) ctx.act2({ actors: [cond, slack], cat: 'conflict', fx: function () { ctx.mod2(cond, slack, { ten: 14 }, { ten: 12, aff: -4 }); },
          text: ctx.t('「ちゃんと声出して｜ちゃんと声を出せ｜ちゃんと声を出してください」{a}の注意に、{b}は聞こえるようにため息をついた。', cond, slack), why: cond.name + 'のCP／' + slack.name + 'のFC高・AC低' });
        var peace = ctx.most(ctx.others(cond), function (o) { return o.tr.np + o.tr.ac * 0.5; });
        if (peace && peace !== slack) ctx.act2({ actors: [peace, cond], cat: 'help', fx: function () { ctx.mod(cond, peace, { trust: 8 }); }, text: ctx.t('練習のあと、{a}が楽譜にこっそり「おつかれ｜＝｜おつかれさまです」と書いて{b}に返した。', peace, cond), why: peace.name + 'のNP' });
      }
    },
    {
      id: 'transfer', from: 3, min: 2,
      run: function (ctx) {
        var P = ctx.present(), t = ctx.rng.pick(P);
        ctx.incident(t.name + 'が転校するらしい、という噂が流れた。');
        ctx.others(t).forEach(function (o) {
          var r = R(ctx, o, t);
          if (r.att > 35 || r.aff > 45) ctx.act2({ actors: [o, t], cat: 'romance', fx: function () { ctx.mod(o, t, { att: 6 }); ctx.stress(o, 15); o.tr.honesty = HK.clamp(o.tr.honesty + 0.15); },
            text: ctx.t('{a}は授業中、何度も{b}の席の方を振り返った。', o, t), why: o.name + 'の' + t.name + 'への想い（好意' + Math.round(r.aff) + '・惹かれ' + Math.round(r.att) + '）' });
        });
        ctx.say({ text: '噂は、ただの噂だった。' + t.name + 'は何も知らなかった。' });
      }
    },
    {
      id: 'birthday', min: 2,
      run: function (ctx) {
        var P = ctx.present(), t = ctx.rng.pick(P);
        ctx.incident('今日は' + t.name + 'の誕生日だった。');
        var any = false;
        ctx.others(t).forEach(function (o) {
          var r = R(ctx, o, t);
          if (r.att > 30 || (o.tr.np > 0.65 && r.aff > 10)) {
            any = true;
            ctx.act2({ actors: [o, t], cat: r.att > 30 ? 'romance' : 'help', fx: function () { ctx.mod(t, o, { aff: 10, att: r.att > 30 ? 6 : 2 }); }, text: ctx.t('{a}は、購買のプリンを一つ{b}の机に置いていった。名前は書かなかった。', o, t), why: o.name + 'は覚えていた（' + (r.att > 30 ? '惹かれ' : 'NP') + '）' });
          }
        });
        if (!any) ctx.act2({ actors: [t], cat: 'solo', fx: function () { ctx.stress(t, 12); }, text: ctx.t('誰も気づかなかった。{a}も、自分からは言わなかった。', t), why: t.name + 'の' + (t.tr.ac > 0.55 ? 'AC' : 'ドライさ') });
      }
    },
    {
      id: 'future', min: 2,
      run: function (ctx) {
        var P = ctx.present();
        ctx.incident('進路希望調査の紙が配られた。');
        var dreamer = ctx.most(P, function (c) { return c.tr.fc + c.tr.honesty * 0.5; });
        var realist = ctx.most(ctx.others(dreamer), function (o) { return o.tr.a * o.tr.cp; });
        ctx.act2({ actors: [dreamer], cat: 'bond', text: ctx.t('{a}は第一志望の欄に、誰も聞いたことのない夢を書いた。', dreamer), why: dreamer.name + 'のFC' });
        if (realist && realist.tr.a * realist.tr.cp > 0.35) ctx.act2({ actors: [realist, dreamer], cat: 'conflict', fx: function () { ctx.mod(dreamer, realist, { ten: dreamer.tr.ac > 0.5 ? 12 : 6, att: dreamer.tr.ac > 0.5 ? 0 : 3 }); }, text: ctx.t('「それ、本気で言ってる？｜それは、本気で言っているのか｜それ、本気で言っていますか？」{a}の一言に、{b}は笑って「本気｜本気だ｜本気です」と返した。', realist, dreamer), why: realist.name + 'のA×CP' });
      }
    }
  ];
})();
