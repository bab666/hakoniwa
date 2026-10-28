/* 箱庭診断: 全員に降りかかる出来事（合コン）
   2026-10-27（分割読み込みの第3段）：incidents-social.js から分けた（箱庭のかたまり scen-goukon。incidents-social.js のすぐ後に読む）。部品は HK.IncSocial */
(function () {
  'use strict';
  var HK = window.HK, K = HK.IncSocial;
  if (!K) return;
  HK.INCIDENTS = HK.INCIDENTS || {};
  var R = K.R, names = K.names, fav = K.fav, pointAll = K.pointAll;
  /* ======================= 合コン ======================= */
  HK.INCIDENTS.goukon = [
    {
      id: 'point', label: '一番気になる人を同時に指さす', from: 2, min: 3,
      run: function (ctx) {
        ctx.incident('「じゃあ、せーので一番気になる人を指さそう｜では、せーので一番気になる者を指す｜では、せーので一番気になる人を指さしましょう」と誰かが言い出した。');
        pointAll(ctx, ctx.present().filter(function (c) { return c.flags.cagePair == null; }), 'せーの。', '同時指さし');
      }
    },
    {
      id: 'ex', from: 1,
      run: function (ctx) {
        var P = ctx.present(), a = ctx.rng.pick(P);
        ctx.incident(a.name + 'のスマホが鳴った。画面には元恋人の名前。');
        if (a.tr.honesty > 0.6) ctx.act2({ actors: [a], cat: 'bond', fx: function () { ctx.others(a).forEach(function (o) { ctx.mod(o, a, { trust: 4 }); }); }, text: ctx.t('「元カレ……いや、元カノか。どっちでもいいや｜元カレ……いや、元カノか。どちらでもいい｜元カレ……いえ、元カノでした。どちらでもいいです」{a}は画面を伏せて笑った。', a), why: a.name + 'の本音の出やすさ' });
        else if (a.tr.cold > 0.55) ctx.act2({ actors: [a], cat: 'solo', text: ctx.t('{a}は表情を変えずに着信を切り、電源ごと落とした。', a), why: a.name + 'のドライさ' });
        else ctx.act2({ actors: [a], cat: 'solo', fx: function () { ctx.stress(a, 14); }, text: ctx.t('{a}は「ちょっと｜少し失礼する｜ちょっと失礼します」と言って席を外し、しばらく戻ってこなかった。', a), why: a.name + 'のAC：切り捨てられない' });
        ctx.others(a).forEach(function (o) {
          if (R(ctx, o, a).att > 35) ctx.act2({ actors: [o, a], cat: 'conflict', fx: function () { ctx.mod(o, a, { att: 4, ten: 6 }); ctx.stress(o, 8); }, text: ctx.t('{a}は、{b}が戻ってくるまでグラスの氷ばかり見ていた。', o, a), why: o.name + 'は' + a.name + 'に惹かれていた（嫉妬・執着 ' + Math.round(o.tr.jealous * 100) + '）' });
        });
      }
    },
    {
      id: 'drunkard', label: '隣の席の酔客に絡まれる', from: 2, min: 2,
      run: function (ctx) {
        var P = ctx.present(), t = ctx.most(P, function (c) { return R(ctx, P[0] === c ? P[1] : P[0], c).att / 100 + ctx.rng() * 0.5; });
        ctx.incident('隣の席の酔客が、' + t.name + 'に絡み始めた。');
        var def = ctx.most(ctx.others(t), function (o) { return o.tr.cp * 0.5 + o.tr.aggr * 0.3 + o.tr.np * 0.3 + Math.max(0, R(ctx, o, t).att) / 80; });
        var hide = ctx.most(ctx.others(t).filter(function (o) { return o !== def; }), function (o) { return o.tr.caution; });
        if (def && def.tr.cp * 0.5 + def.tr.aggr * 0.3 + def.tr.np * 0.3 > 0.35) {
          ctx.act2({ actors: [def, t], cat: 'help', mag: 12, fx: function () { ctx.mod(t, def, { att: 10, aff: 8, trust: 10 }); },
            text: ctx.t('「連れなんで｜連れだ｜連れなんです」{a}が立ち上がって、{b}と酔客の間に入った。', def, t), why: def.name + 'の' + (def.tr.cp > def.tr.np ? 'CP（筋を通す）' : 'NP（守る）') });
        } else ctx.act2({ actors: [t], cat: 'solo', fx: function () { ctx.stress(t, 15); }, text: ctx.t('誰も動かなかった。{a}は愛想笑いでやり過ごした。', t), why: '全員の慎重さが勝った' });
        if (hide && hide.tr.caution > 0.65) ctx.act2({ actors: [hide, t], cat: 'solo', fx: function () { ctx.mod(t, hide, { att: -5 }); }, text: ctx.t('{a}はずっとメニューで顔を隠していた。', hide), why: hide.name + 'の慎重さ' });
      }
    },
    {
      id: 'spill', from: 1,
      run: function (ctx) {
        var P = ctx.present(), clumsy = ctx.most(P, function (c) { return c.tr.impulse + (c.flags.drunk || 0) / 100; });
        var wiper = ctx.most(ctx.others(clumsy), function (o) { return o.tr.np; });
        var laugher = ctx.most(ctx.others(clumsy), function (o) { return o.tr.fc * o.tr.cp; });
        ctx.incident(clumsy.name + 'の肘が当たって、グラスが倒れた。');
        if (wiper) ctx.act2({ actors: [wiper, clumsy], cat: 'help', fx: function () { ctx.mod2(wiper, clumsy, { aff: 2 }, { aff: 7, att: 4 }); }, text: ctx.t('{a}が真っ先におしぼりを掴んで、{b}の袖を拭いた。', wiper, clumsy), why: wiper.name + 'のNP' });
        if (laugher && laugher !== wiper && laugher.tr.fc * laugher.tr.cp > 0.35) ctx.act2({ actors: [laugher, clumsy], cat: 'conflict', fx: function () { ctx.mod(clumsy, laugher, { ten: clumsy.tr.ac > 0.6 ? 10 : 2, aff: clumsy.tr.fc > 0.6 ? 3 : -3 }); }, text: ctx.t('{a}は手を叩いて笑った。「やると思った｜＝｜やると思いました」', laugher, clumsy), why: laugher.name + 'のFC×CP' });
      }
    },
    {
      id: 'love_talk', from: 1, min: 2,
      run: function (ctx) {
        var P = ctx.present();
        ctx.incident('話題が恋愛遍歴に移った。');
        var talker = ctx.most(P, function (c) { return c.tr.honesty + (c.flags.drunk || 0) / 150; });
        var dodger = ctx.most(ctx.others(talker), function (o) { return o.tr.ac + o.tr.cold * 0.5 - o.tr.honesty; });
        ctx.act2({ actors: [talker], cat: 'bond', fx: function () { ctx.others(talker).forEach(function (o) { ctx.mod(o, talker, { trust: 5, att: o.tr.fc > 0.5 ? 4 : 1 }); }); }, text: ctx.t('{a}は、三年付き合って振られた話を、自分で笑いながら話し切った。', talker), why: talker.name + 'の本音の出やすさ' });
        if (dodger) ctx.act2({ actors: [dodger], cat: 'solo', fx: function () { ctx.others(dodger).forEach(function (o) { if (R(ctx, o, dodger).att > 25) ctx.mod(o, dodger, { att: 5 }); }); }, text: ctx.t('{a}は「普通だよ｜普通だ｜普通ですよ」としか言わなかった。それがかえって気になった者もいた。', dodger), why: dodger.name + 'のAC／ドライさ。隠すほど興味を引く' });
      }
    },
    {
      id: 'bill',
      when: function (ctx, s, n) { return s >= n - 3; },
      w: function () { return 2; },
      run: function (ctx) {
        var P = ctx.present();
        ctx.incident('会計の伝票が回ってきた。');
        var payer = ctx.most(P, function (c) { return c.tr.cp * 0.4 + c.tr.np * 0.4 + c.tr.fc * 0.2; });
        var counter = ctx.most(ctx.others(payer), function (o) { return o.tr.a * o.tr.cp; });
        ctx.act2({ actors: [payer], cat: 'help', fx: function () { ctx.others(payer).forEach(function (o) { ctx.mod(o, payer, { att: o.tr.ac > 0.55 ? 6 : 2, aff: 3 }); }); }, text: ctx.t('{a}が伝票を取り上げた。「今日は多めに出すよ｜今日は多めに出す｜今日は多めに出しますよ」', payer), why: payer.name + 'のCP・NP（面倒を見る側に立つ）' });
        if (counter && counter.tr.a * counter.tr.cp > 0.4) ctx.act2({ actors: [counter, payer], cat: 'conflict', fx: function () { ctx.mod2(counter, payer, { ten: 4 }, { ten: 6 }); }, text: ctx.t('{a}は電卓アプリを開いて、一円単位で割り直した。', counter), why: counter.name + 'のA×CP' });
      }
    },
    {
      id: 'lastTrain', label: '終電を逃す',
      when: function (ctx, s, n) { return s >= n - 2; },
      w: function () { return 2; },
      run: function (ctx) {
        var P = ctx.present();
        var a = ctx.most(P, function (c) { return c.tr.impulse + (c.flags.drunk || 0) / 100; });
        var b = fav(ctx, a, P, 20) || ctx.closest(a);
        if (!b) return;
        ctx.incident(a.name + 'が終電を逃した。');
        var rb = R(ctx, b, a);
        ctx.act2({ actors: [b, a], cat: rb.att > 30 ? 'romance' : 'help', fx: function () { ctx.mod2(b, a, { att: rb.att > 30 ? 8 : 2 }, { att: 8, trust: 6 }); },
          text: ctx.t(rb.att > 30 ? '「うち、ここから歩いて十分だけど｜うちは、ここから歩いて十分だが｜うち、ここから歩いて十分ですけど」と{a}が言った。{b}は少し考えて、頷いた。' : '{a}はタクシー代を貸してやった。{b}は「絶対返す｜＝｜絶対返します」と三回言った。', b, a), why: b.name + 'の側の惹かれ（' + Math.round(rb.att) + '）' });
      }
    }
  ];
})();
