/* 箱庭診断: 全員に降りかかる出来事（ゾンビの街）。環境値「ハプニングの頻度」で起きやすさが変わる（engine.js の runIncident）
   2026-10-27（分割読み込みの第3段）：incidents-extra.js から分けた（箱庭のかたまり scen-zombie。incidents-extra.js のすぐ後に読む）。部品は HK.IncExtra */
(function () {
  'use strict';
  var HK = window.HK, K = HK.IncExtra;
  if (!K) return;
  HK.INCIDENTS = HK.INCIDENTS || {};
  var R = K.R, L = K.L, loveOK = K.loveOK, zPair = K.zPair, zLive = K.zLive, spaced = K.spaced;
  /* ======================= ゾンビの街 ======================= */
  HK.INCIDENTS.zombie = [
    {
      id: 'radio', min: 1, from: 1,
      run: function (ctx) {
        var P = zLive(ctx);
        if (!P.length) return;
        ctx.incident(ctx.pick(L('ノイズまじりの臨時放送が流れた。「⁠――生存者は、北の高台へ。繰り返す……」放送は途中で途切れた。|拾ったラジオから、自衛隊の呼びかけが聞こえた。「⁠救助は継続中。むやみに動かず――」そこで電波が消えた。')));
        P.forEach(function (c) { ctx.stress(c, -6); });
        var doubt = ctx.most(P, function (c) { return c.tr.a * 0.7 + c.tr.caution * 0.4; });
        var hope = ctx.most(P.filter(function (c) { return c !== doubt; }), function (c) { return c.tr.fc * 0.6 + c.tr.impulse * 0.4; });
        if (doubt && doubt.tr.a > 0.55) ctx.act2({ actors: [doubt], cat: 'solo', text: ctx.t('{a}は放送の内容を書き留め、繰り返し聞き直した。「録音かもしれない。……鵜呑みにはしない｜＝｜録音かもしれません。……鵜呑みにはしません」', doubt), why: doubt.name + 'のA（' + Math.round(doubt.eg.A) + '）：冷静に疑う' });
        if (hope) ctx.act2({ actors: [hope], cat: 'solo', fx: function () { ctx.stress(hope, -8); }, text: ctx.t('{a}は思わず拳を握った。「まだ、誰かが動いてるんだ｜まだ、誰かが動いているのか｜まだ、誰かが動いているんですね」', hope), why: hope.name + 'のFC：希望に飛びつく' });
      }
    },
    {
      id: 'rain', once: false, min: 1, from: 1,
      run: function (ctx) {
        var P = zLive(ctx);
        if (!P.length) return;
        ctx.incident(ctx.pick(L('冷たい雨が降り出した。雨音にまぎれて、群れのうめき声が遠のいていく。|夕方から土砂降りになった。ゾンビたちは軒下で動きを止め、街が少しだけ静かになった。')));
        P.forEach(function (c) { ctx.stress(c, -3); });
        var pr = zPair(ctx, P, 15);
        if (pr) ctx.act2({ actors: pr, cat: R(ctx, pr[0], pr[1]).att > 35 && loveOK(ctx, pr[0], pr[1]) ? 'romance' : 'bond', fx: function () { ctx.mod2(pr[0], pr[1], loveOK(ctx, pr[0], pr[1]) ? { aff: 5, att: 3 } : { aff: 5 }, loveOK(ctx, pr[0], pr[1]) ? { aff: 5, att: 3 } : { aff: 5 }); },
          text: ctx.t(ctx.pick(L('雨宿りの軒下で、{a}と{b}は濡れた肩を寄せ合った。しばらく、どちらも何も言わなかった。|{a}は{b}に、乾いた上着を半分かけた。「雨の音、嫌いじゃない｜雨の音は、嫌いではない｜雨の音、嫌いじゃないです」と{b}が言った。')), pr[0], pr[1]), why: '雨で群れが静まった（ハプニングの頻度 ' + ctx.env.incident + '）' });
      }
    },
    {
      id: 'blackout', once: false, min: 1, from: 2,
      run: function (ctx) {
        var P = zLive(ctx);
        if (!P.length) return;
        ctx.incident(ctx.pick(L('街の明かりが、一斉に消えた。最後まで点いていた信号機も、もう光らない。|変電所が落ちたらしい。どの建物も真っ暗になり、闇の中で何かが窓を叩く音だけが残った。')));
        P.forEach(function (c) { ctx.stress(c, 8 + c.tr.ac * 6); });
        var keep = ctx.most(P, function (c) { return c.tr.caution * 0.6 + c.tr.cp * 0.4; });
        if (keep && keep.tr.caution > 0.5) ctx.act2({ actors: [keep], cat: 'help', fx: function () { ctx.others(keep).forEach(function (o) { ctx.mod(o, keep, { trust: 4 }); }); }, text: ctx.t('{a}は手探りで懐中電灯を探し当て、光が外に漏れないよう布で覆った。', keep), why: keep.name + 'の慎重さ' });
        var pr = zPair(ctx, P, 25, true);
        if (pr) ctx.act2({ actors: pr, cat: 'romance', fx: function () { ctx.mod2(pr[0], pr[1], { att: 5, trust: 3 }, { att: 5, trust: 3 }); },
          text: ctx.t(ctx.pick(L('暗闇の中で、{a}の手が{b}の手を探し当てた。どちらも、離そうとしなかった。|「……そこにいる？｜……そこにいるのか｜……そこにいますか？」{b}の声に、{a}は肩を触れ合わせて答えた。')), pr[0], pr[1]), why: '停電の暗闇で、互いの存在を確かめ合った' });
      }
    },
    {
      id: 'siren', min: 1, from: 2,
      run: function (ctx) {
        var P = zLive(ctx);
        if (!P.length) return;
        ctx.incident('遠くでサイレンが鳴り続けている。音のする方へ、群れがゆっくりと流れていった。');
        P.forEach(function (c) { ctx.stress(c, 6); });
        var go = ctx.most(P, function (c) { return c.tr.impulse * 0.6 + c.tr.fc * 0.4; });
        var stop = go ? ctx.most(P.filter(function (c) { return c !== go && c.z && go.z && c.z.area === go.z.area; }), function (c) { return c.tr.caution * 0.6 + c.tr.np * 0.3; }) : null;
        if (go && go.tr.impulse > 0.55) {
          if (stop && stop.tr.caution > 0.45) ctx.act2({ actors: [stop, go], cat: 'help', fx: function () { ctx.mod2(stop, go, { trust: 3 }, { ten: 3, trust: 4 }); }, text: ctx.t('「様子を見に行こう｜＝｜様子を見に行きましょう」と言いかけた{b}の袖を、{a}が掴んだ。「群れが向かってる方だよ。行かないで｜群れが向かっている方だ。行くな｜群れが向かっている方です。行かないでください」', stop, go), why: stop.name + 'の慎重さが、' + go.name + 'の衝動性を止めた' });
          else ctx.act2({ actors: [go], cat: 'solo', fx: function () { ctx.stress(go, 6); }, text: ctx.t('{a}は窓から身を乗り出して、サイレンの方角をいつまでも見ていた。', go), why: go.name + 'の衝動性' });
        }
      }
    },
    {
      id: 'airdrop', label: 'ヘリから物資の箱が落とされる', min: 1, from: 2,
      run: function (ctx) {
        var P = zLive(ctx);
        if (!P.length) return;
        var a = ctx.rng.pick(P);
        ctx.incident('ヘリの音が近づき、パラシュートつきの箱が' + a.name + 'のいる辺りに落ちてきた。');
        ctx.act2({ actors: [a], cat: 'help', fx: function () { if (a.z) { a.z.food = (a.z.food || 0) + 2; a.z.hunger = 0; } ctx.stress(a, -6); }, text: ctx.t('{a}は群れの隙をついて箱を引きずり込んだ。中身は缶詰と水だった。', a), why: a.name + 'の近くに物資が落ちた（運）' });
        var mates = P.filter(function (o) { return o !== a && o.z && a.z && o.z.area === a.z.area && !o.z.alone; });
        if (mates.length) {
          var b = ctx.rng.pick(mates);
          if (a.tr.np > 0.5 || R(ctx, a, b).aff > 30) ctx.act2({ actors: [a, b], cat: 'bond', fx: function () { if (b.z) b.z.food = (b.z.food || 0) + 1; ctx.mod(b, a, { aff: 8, trust: 8 }); }, text: ctx.t('{a}は缶詰を半分、黙って{b}の前に置いた。', a, b), why: a.name + 'のNP・' + b.name + 'への好意' });
          else if (a.tr.cold > 0.55) ctx.act2({ actors: [a, b], cat: 'conflict', fx: function () { ctx.mod(b, a, { ten: 10, aff: -5 }); }, text: ctx.t('{a}は箱を抱えたまま、{b}に背を向けた。「見つけたのは私だよ｜見つけたのは私だ｜見つけたのは私です」', a, b), why: a.name + 'のドライさ' });
        }
      }
    },
    {
      id: 'scream', once: false, min: 1, from: 3,
      run: function (ctx) {
        var P = zLive(ctx);
        if (!P.length) return;
        ctx.incident('夜の向こうで、誰かの悲鳴が上がった。そして、急に途切れた。');
        P.forEach(function (c) { ctx.stress(c, 5 + c.tr.np * 5); });
        var help = ctx.most(P, function (c) { return c.tr.np * 0.7 + c.tr.cp * 0.3; });
        var cold = help ? ctx.most(P.filter(function (c) { return c !== help && c.z && help.z && c.z.area === help.z.area; }), function (c) { return c.tr.cold; }) : null;
        if (help && help.tr.np > 0.55) {
          if (cold && cold.tr.cold > 0.5) ctx.act2({ actors: [cold, help], cat: 'conflict', fx: function () { ctx.mod2(cold, help, { ten: 4 }, { ten: 8, aff: -3 }); }, text: ctx.t('立ち上がった{b}の前に、{a}が立ちはだかった。「今行っても、死体が一つ増えるだけだよ｜今行っても、死体が一つ増えるだけだ｜今行っても、死体が一つ増えるだけです」', cold, help), why: cold.name + 'のドライさと、' + help.name + 'のNPがぶつかった' });
          else ctx.act2({ actors: [help], cat: 'solo', fx: function () { ctx.stress(help, 8); }, text: ctx.t('{a}は耳を塞いだ。助けに行けなかった自分を、朝まで責め続けた。', help), why: help.name + 'のNP' });
        }
      }
    },
    {
      id: 'message', min: 1, from: 2,
      run: function (ctx) {
        var P = zLive(ctx);
        if (!P.length) return;
        var a = ctx.rng.pick(P);
        ctx.incident(a.name + 'は、壁にスプレーで書かれた伝言を見つけた。「⁠生きてる。○○中学の屋上にいる。――ユウキ」日付は三日前だった。');
        ctx.act2({ actors: [a], cat: 'solo', fx: function () { ctx.stress(a, a.tr.np > 0.5 ? -4 : 2); }, text: ctx.t(a.tr.np > 0.5 ? '{a}は伝言の下に、自分の名前と日付を書き足した。誰かが読むかもしれない。' : '{a}は伝言をしばらく眺めて、何も書かずに立ち去った。', a), why: a.name + (a.tr.np > 0.5 ? 'のNP：ほかの生存者を思う' : 'の慎重さ：痕跡を残さない') });
      }
    }
  ];
  spaced(HK.INCIDENTS.zombie, 4);
})();
