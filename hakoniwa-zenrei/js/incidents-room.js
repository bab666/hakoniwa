/* 箱庭診断: 全員に降りかかる出来事（出られない部屋）
   2026-10-27（分割読み込みの第3段）：incidents-social.js から分けた（箱庭のかたまり scen-whiteroom。incidents-social.js のすぐ後に読む）。部品は HK.IncSocial */
(function () {
  'use strict';
  var HK = window.HK, K = HK.IncSocial;
  if (!K) return;
  HK.INCIDENTS = HK.INCIDENTS || {};
  var R = K.R, names = K.names, fav = K.fav, pointAll = K.pointAll;
  /* ======================= 出られない部屋 ======================= */
  HK.INCIDENTS.whiteroom = [
    {
      id: 'aphro', from: 1,
      when: function (ctx) { return ctx.flags.romantic && !ctx.flags.hasAphroRule; },
      w: function () { return 2.2; },
      run: function (ctx) {
        var P = ctx.present();
        ctx.incident('天井の小窓から、小瓶が一つ落ちてきた。ラベルには「媚薬。一人が飲めば、扉は少しだけ近くなる」');
        var boss = ctx.most(P, function (c) { return c.tr.lead + c.tr.cp * 0.5; });
        var meek = ctx.most(ctx.others(boss), function (o) { return o.tr.ac; });
        var breaker = ctx.most(P, function (c) { return c.tr.cp * 0.6 + (c.goal.id === 'noway' ? 0.6 : 0) - c.tr.fc * 0.3; });
        var drinker = null, how;
        if (breaker.tr.cp > 0.7 && breaker.goal.id === 'noway' && ctx.rng() < 0.6) {
          ctx.act2({ actors: [breaker], cat: 'conflict', fx: function () { P.forEach(function (o) { ctx.stress(o, 10); if (o !== breaker) ctx.mod(o, breaker, { ten: o.goal.id === 'quick' ? 12 : 0, trust: o.tr.np > 0.5 ? 6 : 0 }); }); },
            text: ctx.t('{a}は小瓶を拾い上げ、そのまま床に叩きつけた。「誰が飲むの、こんなもの｜誰が飲むか、こんなもの｜誰が飲むんですか、こんなもの」', breaker), why: breaker.name + 'のCP（' + Math.round(breaker.eg.CP) + '）と目標「' + breaker.goal.label + '」' });
          return;
        }
        if (boss.tr.cp > 0.65 && boss.tr.np < 0.45 && meek && meek.tr.ac > 0.6) {
          drinker = meek; how = 'forced';
          ctx.act2({ actors: [boss, meek], cat: 'conflict', mag: 15, fx: function () { ctx.mod(meek, boss, { ten: 18, trust: -12, att: 4 }); },
            text: ctx.t('「あなたが飲んで｜あなたが飲め｜あなたが飲んでください」{a}は{b}に小瓶を握らせた。{b}は数秒黙ってから、蓋を開けた。', boss, meek), why: boss.name + 'のCP高・NP低／' + meek.name + 'のAC（' + Math.round(meek.eg.AC) + '）：断れない' });
        } else {
          drinker = ctx.most(P, function (c) { return c.tr.np * 0.45 + c.tr.impulse * 0.45 + c.tr.cold * 0.3 + (c.goal.id === 'quick' ? 0.4 : 0) + (c.goal.id === 'respect' ? 0.3 : 0); });
          how = drinker.tr.np >= Math.max(drinker.tr.impulse, drinker.tr.cold) ? 'np' : drinker.tr.impulse >= drinker.tr.cold ? 'fc' : 'cold';
          var line = { np: '「誰かに飲ませるくらいなら、私が飲む｜＝｜誰かに飲ませるくらいなら、私が飲みます」{a}はそう言って小瓶を空けた。', fc: '「どうせなら試してみたいでしょ｜どうせなら試してみたいだろう｜どうせなら試してみたいでしょう」{a}は止める間もなく一息に飲み干した。', cold: '「効率の問題だよ｜効率の問題だ｜効率の問題です」{a}は表情も変えずに小瓶を傾けた。' }[how];
          ctx.act2({ actors: [drinker], cat: 'romance', mag: 10, text: ctx.t(line, drinker), why: drinker.name + 'の' + { np: 'NP（自分が引き受ける）', fc: '衝動性（FC高・A低）', cold: 'ドライさ（A高・NP低）' }[how] });
        }
        drinker.flags.aphro = true;
        drinker.tr.impulse = HK.clamp(drinker.tr.impulse + 0.25);
        drinker.tr.honesty = HK.clamp(drinker.tr.honesty + 0.2);
        ctx.stress(drinker, 18);
        ctx.k = 1; ctx._touched = {};
        ctx.others(drinker).forEach(function (o) { ctx.mod(drinker, o, { att: 16 }); });
        ctx.say({ text: '飲んでから十五分ほどして、' + drinker.name + 'の呼吸が浅くなり、頬が赤く染まってきた。' });
        ctx.others(drinker).forEach(function (o) {
          var r = R(ctx, o, drinker);
          if (o.tr.np > 0.55) ctx.act2({ actors: [o, drinker], cat: 'help', fx: function () { ctx.mod2(o, drinker, { att: 3 }, { trust: 14, aff: 8 }); },
            text: ctx.t('{a}は水を汲んで{b}に渡し、手の届かない距離に座り直した。「辛かったら言って｜辛かったら言え｜辛かったら言ってください」', o, drinker), why: o.name + 'のNP：相手の意思を待つ' });
          else if (r.att > 35) ctx.act2({ actors: [o, drinker], cat: 'romance', fx: function () { ctx.mod2(o, drinker, { att: 10 }, { att: 6 }); },
            text: ctx.t('{a}は、潤んだ目の{b}から視線を外せなくなっていた。', o, drinker), why: o.name + 'の元々の惹かれ（' + Math.round(r.att) + '）' });
          else if (o.tr.cp > 0.6 && how === 'fc') ctx.act2({ actors: [o, drinker], cat: 'conflict', fx: function () { ctx.mod(o, drinker, { ten: 8 }); },
            text: ctx.t('「考えなしに飲むからだよ｜考えなしに飲むからだ｜考えなしに飲むからです」{a}は壁際から動かなかった。', o, drinker), why: o.name + 'のCP' });
        });
      }
    },
    {
      id: 'point', label: '一番気になる人を同時に指さす', from: 1, min: 2,
      run: function (ctx) {
        ctx.incident('新しい紙が差し込まれた。「この部屋で一番好きな人を、同時に指させ」');
        pointAll(ctx, ctx.present().filter(function (c) { return c.flags.cagePair == null; }), '', '追加ルール');
      }
    },
    {
      id: 'camera', from: 1,
      run: function (ctx) {
        var P = ctx.present(), finder = ctx.most(P, function (c) { return c.tr.a; });
        ctx.act2({ actors: [finder], cat: 'escape', text: ctx.t('{a}が、照明の縁に小さなレンズを見つけた。この部屋は見られている。', finder), why: finder.name + 'のA（観察力）' });
        P.forEach(function (c) {
          if (c.tr.ac > 0.6) ctx.act2({ actors: [c], cat: 'solo', fx: function () { ctx.stress(c, 15); }, text: ctx.t('{a}は膝を抱えてレンズに背を向けた。', c), why: c.name + 'のAC：見られることへの羞恥' });
          else if (c.tr.cp > 0.65) ctx.act2({ actors: [c], cat: 'conflict', fx: function () { ctx.stress(c, 8); }, text: ctx.t('{a}はレンズを睨みつけ、靴で叩き割ろうとした。届かなかった。', c), why: c.name + 'のCP：理不尽への怒り' });
          else if (c.tr.fc > 0.65) {
            /* 隣にノリのいい人（FC・人懐こさ）か仲のいい人がいれば、二人でピース */
            var pal = ctx.most(ctx.others(c).filter(function (o) { return o.tr.ac <= 0.6 && (o.tr.fc > 0.5 || o.tr.warmth > 0.55 || ctx.R(o, c).aff > 25); }), function (o) { return o.tr.fc * 0.5 + o.tr.warmth * 0.3 + ctx.R(o, c).aff / 100; });
            var duo = pal ? ctx.pick(['{a}はレンズに向かってピースした。「どうせ見てるなら｜どうせ見ているなら｜どうせ見ているのでしたら」――{b}もすかさず隣に並んで、二人でピースした。', '{a}はレンズに向かってピースした。{b}が横から顔を出して、ダブルピースで割り込んだ。', '{a}は{b}の腕を引っぱって、二人でレンズに向かってピースした。「盛れてる？｜盛れているか｜盛れていますか？」', '{a}と{b}は、レンズの前で指ハートを半分ずつ作って、くっつけた。']) : '';
            ctx.act2({ actors: pal ? [c, pal] : [c], cat: 'bond', fx: function () { ctx.others(c).forEach(function (o) { ctx.stress(o, -5); ctx.mod(o, c, { aff: 3 }); }); if (pal) ctx.mod2(c, pal, { aff: 5 }, { aff: 5 }); }, text: pal ? ctx.t(duo, c, pal) : ctx.t('{a}はレンズに向かってピースした。「どうせ見てるなら｜どうせ見ているなら｜どうせ見ているのでしたら」', c), why: c.name + 'のFC' + (pal ? '。' + pal.name + 'も乗った（FC・人懐こさ）' : '') });
          }
        });
      }
    },
    {
      id: 'tray', min: 2,
      run: function (ctx) {
        var P = ctx.present();
        ctx.incident('差し入れ口から、食事のトレイが一つだけ出てきた。');
        var giver = ctx.most(P, function (c) { return c.tr.np - c.tr.cold * 0.4; });
        var taker = ctx.most(P, function (c) { return c.tr.aggr + c.tr.cold * 0.5; });
        var splitter = ctx.most(P, function (c) { return c.tr.a; });
        if (taker.tr.aggr > 0.65 && taker !== giver && ctx.rng() < 0.6) {
          ctx.act2({ actors: [taker], cat: 'conflict', fx: function () { ctx.others(taker).forEach(function (o) { ctx.mod(o, taker, { ten: 8, aff: -4 }); }); }, text: ctx.t('{a}がトレイを引き寄せ、黙って食べ始めた。', taker), why: taker.name + 'の攻撃性・ドライさ' });
        } else if (giver.tr.np > 0.6) {
          var to = ctx.most(ctx.others(giver), function (o) { return o.stress + R(ctx, giver, o).aff; });
          ctx.act2({ actors: [giver, to], cat: 'help', fx: function () { ctx.mod(to, giver, { aff: 10, trust: 10, att: 4 }); }, text: ctx.t('{a}はトレイをそのまま{b}の前に置いた。「先に食べて｜先に食べろ｜先に食べてください」', giver, to), why: giver.name + 'のNP' });
        } else {
          ctx.act2({ actors: [splitter], cat: 'help', fx: function () { ctx.others(splitter).forEach(function (o) { ctx.mod(o, splitter, { trust: 5 }); }); }, text: ctx.t('{a}がパンを等分に割った。端の大きさまで揃えて。', splitter), why: splitter.name + 'のA' });
        }
      }
    },
    {
      id: 'blackout', from: 1, min: 2,
      run: function (ctx) {
        var P = ctx.present();
        ctx.incident('照明が落ちた。完全な暗闇。');
        var reach = ctx.most(P, function (c) { return c.tr.impulse + (c.flags.aphro ? 0.4 : 0); });
        var tg = fav(ctx, reach, P, 15);
        if (tg) ctx.act2({ actors: [reach, tg], cat: 'romance', fx: function () { ctx.mod2(reach, tg, { att: 8 }, { att: R(ctx, tg, reach).att > 25 ? 10 : 0, ten: R(ctx, tg, reach).att > 25 ? 0 : 8 }); },
          text: ctx.t('暗闇の中で、{a}の手が{b}の手を探り当てた。' + (R(ctx, tg, reach).att > 25 ? '{b}は振りほどかなかった。' : '{b}はびくりと身を引いた。'), reach, tg), why: reach.name + 'の衝動性。' + tg.name + 'の側の惹かれ（' + Math.round(R(ctx, tg, reach).att) + '）' });
        var scared = ctx.most(ctx.others(reach), function (o) { return o.tr.ac + o.stress / 100; });
        var near = scared && ctx.closest(scared);
        if (scared && near && scared.tr.ac > 0.55) ctx.act2({ actors: [scared, near], cat: 'bond', fx: function () { ctx.mod2(scared, near, { trust: 8, att: 5 }, { att: 3 }); }, text: ctx.t('{a}は手探りで{b}の服の裾を掴み、明かりが戻るまで離さなかった。', scared, near), why: scared.name + 'のAC' });
        var calm = ctx.most(P, function (c) { return c.tr.a - c.tr.ac * 0.3; });
        if (calm && calm.tr.a > 0.65) ctx.act2({ actors: [calm], cat: 'escape', text: ctx.t('{a}は暗闇のあいだ、壁に耳を当てて、外の物音を聞いていた。', calm), why: calm.name + 'のA' });
      }
    },
    {
      id: 'shrink', from: 2,
      run: function (ctx) {
        var P = ctx.present();
        ctx.incident('低い駆動音。壁が、少しずつ内側へ迫ってくる。');
        ctx.k = 1; ctx._touched = {};
        P.forEach(function (a) { ctx.stress(a, 14); P.forEach(function (b) { if (a !== b) ctx.mod(a, b, { att: 4 }); }); });
        var panic = ctx.most(P, function (c) { return c.tr.ac + c.tr.impulse * 0.5; });
        var lead = ctx.most(ctx.others(panic), function (o) { return o.tr.lead; });
        ctx.act2({ actors: [panic, lead], cat: 'help', fx: function () { if (lead) ctx.mod(panic, lead, { trust: 10 }); },
          text: lead ? ctx.t('壁を押し返そうとする{a}の肩を、{b}が掴んだ。「止まった。もう止まってる｜止まった。もう止まっている｜止まりました。もう止まっています」', panic, lead) : ctx.t('{a}は壁を押し返そうとしていた。', panic), why: panic.name + 'の焦り／' + (lead ? lead.name + 'の主導性' : '') });
      }
    },
    {
      id: 'bed', from: 1, min: 2,
      run: function (ctx) {
        var P = ctx.present();
        ctx.incident('部屋の隅の床が開いて、ベッドが一台せり上がってきた。一台だけ。');
        var best = null, bv = 0;
        P.forEach(function (a) { P.forEach(function (b) { if (a.i < b.i) { var v = Math.min(R(ctx, a, b).att, R(ctx, b, a).att) + Math.min(R(ctx, a, b).trust, R(ctx, b, a).trust) * 0.5; if (v > bv) { bv = v; best = [a, b]; } } }); });
        if (best && bv > 40) {
          ctx.act2({ actors: best, cat: 'romance', mag: 10, fx: function () { ctx.mod2(best[0], best[1], { att: 8, trust: 5 }, { att: 8, trust: 5 }); }, text: ctx.t('結局、ベッドは{a}と{b}が使った。背中合わせで、どちらも眠らなかった。', best[0], best[1]), why: '互いの惹かれと信頼' });
          return;
        }
        var giver = ctx.most(P, function (c) { return c.tr.np; }), claim = ctx.most(P, function (c) { return c.tr.cp + c.tr.cold * 0.5; });
        if (claim.tr.cp > 0.65 && claim.tr.np < 0.5) ctx.act2({ actors: [claim], cat: 'conflict', fx: function () { ctx.others(claim).forEach(function (o) { ctx.mod(o, claim, { ten: 6 }); }); }, text: ctx.t('{a}は当然のようにベッドに腰を下ろした。', claim), why: claim.name + 'のCP高・NP低' });
        else ctx.act2({ actors: [giver], cat: 'help', fx: function () { ctx.others(giver).forEach(function (o) { ctx.mod(o, giver, { aff: 5 }); }); }, text: ctx.t('{a}は「床で平気｜床で平気だ｜床で平気です」と言って、ベッドを譲った。', giver), why: giver.name + 'のNP' });
      }
    },
    {
      id: 'memory', from: 2, min: 2,
      run: function (ctx) {
        var P = ctx.present(), t = ctx.rng.pick(P);
        ctx.incident('壁一面にスクリーンが浮かび、' + t.name + 'の過去の映像が流れ始めた。誰にも話していなかった頃のこと。');
        ctx.act2({ actors: [t], cat: 'solo', fx: function () { ctx.stress(t, 22); }, text: ctx.t(t.tr.cp > 0.6 ? '{a}は唇を噛んで、自分の過去の映像から最後まで目を逸らさなかった。' : '{a}は自分の過去が映し出されるのに耐えられず、途中で顔を覆った。', t), why: t.name + 'の' + (t.tr.cp > 0.6 ? 'CP（弱みを見せない）' : 'AC') });
        ctx.others(t).forEach(function (o) {
          if (o.tr.np > 0.6) ctx.act2({ actors: [o, t], cat: 'help', fx: function () { ctx.mod2(o, t, { aff: 5, att: 3 }, { trust: 12, aff: 8 }); }, text: ctx.t('映像が終わると、{a}は何も訊かずに{b}の隣に座った。', o, t), why: o.name + 'のNP' });
          else if (o.tr.jealous > 0.6 || o.tr.cold > 0.65) ctx.act2({ actors: [o, t], cat: 'conflict', fx: function () { ctx.mod2(o, t, { trust: -6 }, { ten: 8 }); }, text: ctx.t('映像を見たあと、{a}は{b}を見る目を少し変えた。', o, t), why: o.name + 'の' + (o.tr.jealous > 0.6 ? '疑い深さ' : 'ドライさ') });
          else ctx.act2({ actors: [o, t], cat: 'bond', fx: function () { ctx.mod(o, t, { trust: 4, att: 2 }); }, text: '', why: '' });
        });
      }
    },
    {
      id: 'clock', from: 2,
      run: function (ctx) {
        ctx.incident('壁の時計の針が、急に速く回り始めた。残り時間が削られていく。');
        ctx.present().forEach(function (c) { c.stress = HK.clamp(c.stress + 18, 0, 100); });
        var c = ctx.most(ctx.present(), function (x) { return x.tr.a; });
        ctx.act2({ actors: [c], cat: 'escape', text: ctx.t('{a}だけが、針の速さから残り時間を計算していた。', c), why: c.name + 'のA' });
      }
    }
  ];
})();
