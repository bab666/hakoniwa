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
      id: 'airdrop', min: 1, from: 2,
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

  /* 区切りの多い箱庭なので、続けて起きすぎないよう間を空ける（ゾンビの街は4区切り＝1日、オメガバースは6区切り＝3か月） */
  function spaced(list, gap) {
    list.forEach(function (x) {
      var w0 = x.when, r0 = x.run;
      x.when = function (ctx, s, n) { var at = ctx.flags.incAt; return (at == null || s - at >= gap) && (!w0 || w0(ctx, s, n)); };
      x.run = function (ctx, s, n) { ctx.flags.incAt = s; return r0(ctx, s, n); };
    });
  }
  spaced(HK.INCIDENTS.zombie, 4);
  spaced(HK.INCIDENTS.omega, 6);
})();
