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

  /* ======================= 合コン ======================= */
  HK.INCIDENTS.goukon = [
    {
      id: 'point', from: 2, min: 3,
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
        if (a.tr.honesty > 0.6) ctx.act2({ actors: [a], cat: 'bond', fx: function () { ctx.others(a).forEach(function (o) { ctx.mod(o, a, { trust: 4 }); }); }, text: ctx.t('「元カレ……いや、元カノか。どっちでもいいや｜元カレ……いや、元カノか。どちらでもいい｜元カレ……いや、元カノですか。どちらでもいいです」{a}は画面を伏せて笑った。', a), why: a.name + 'の本音の出やすさ' });
        else if (a.tr.cold > 0.55) ctx.act2({ actors: [a], cat: 'solo', text: ctx.t('{a}は表情を変えずに着信を切り、電源ごと落とした。', a), why: a.name + 'のドライさ' });
        else ctx.act2({ actors: [a], cat: 'solo', fx: function () { ctx.stress(a, 14); }, text: ctx.t('{a}は「ちょっと」と言って席を外し、しばらく戻ってこなかった。', a), why: a.name + 'のAC：切り捨てられない' });
        ctx.others(a).forEach(function (o) {
          if (R(ctx, o, a).att > 35) ctx.act2({ actors: [o, a], cat: 'conflict', fx: function () { ctx.mod(o, a, { att: 4, ten: 6 }); ctx.stress(o, 8); }, text: ctx.t('{a}は、{b}が戻ってくるまでグラスの氷ばかり見ていた。', o, a), why: o.name + 'は' + a.name + 'に惹かれていた（嫉妬・執着 ' + Math.round(o.tr.jealous * 100) + '）' });
        });
      }
    },
    {
      id: 'drunkard', from: 2, min: 2,
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
      id: 'lastTrain',
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
          var line = { np: '「誰かに飲ませるくらいなら、自分が飲む｜＝｜誰かに飲ませるくらいなら、自分が飲みます」{a}はそう言って小瓶を空けた。', fc: '「どうせなら試してみたいでしょ｜どうせなら試してみたいだろう｜どうせなら試してみたいでしょう」{a}は止める間もなく一息に飲み干した。', cold: '「効率の問題だよ｜効率の問題だ｜効率の問題です」{a}は表情も変えずに小瓶を傾けた。' }[how];
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
      id: 'point', from: 1, min: 2,
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
            var duo = pal ? ctx.pick(['{a}はレンズに向かってピースした。「どうせ見てるなら｜どうせ見ているなら｜どうせ見ているなら」――{b}もすかさず隣に並んで、二人でピースした。', '{a}はレンズに向かってピースした。{b}が横から顔を出して、ダブルピースで割り込んだ。', '{a}は{b}の腕を引っぱって、二人でレンズに向かってピースした。「盛れてる？｜盛れているか｜盛れていますか？」', '{a}と{b}は、レンズの前で指ハートを半分ずつ作って、くっつけた。']) : '';
            ctx.act2({ actors: pal ? [c, pal] : [c], cat: 'bond', fx: function () { ctx.others(c).forEach(function (o) { ctx.stress(o, -5); ctx.mod(o, c, { aff: 3 }); }); if (pal) ctx.mod2(c, pal, { aff: 5 }, { aff: 5 }); }, text: pal ? ctx.t(duo, c, pal) : ctx.t('{a}はレンズに向かってピースした。「どうせ見てるなら｜どうせ見ているなら｜どうせ見ているなら」', c), why: c.name + 'のFC' + (pal ? '。' + pal.name + 'も乗った（FC・人懐こさ）' : '') });
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
        else if (w.tr.np > 0.5 || R(ctx, w, ch).aff > 25) { ctx.pair(w, ch).secret = true; ctx.act2({ actors: [w, ch], cat: 'help', mag: 12, fx: function () { ctx.mod2(w, ch, { trust: 5 }, { trust: 18, aff: 10 }); }, text: ctx.t('{a}は気づいていた。放課後、{b}にだけ「次はやめときな」と言った。', w, ch), why: w.name + 'の' + (w.tr.np > 0.5 ? 'NP' : ch.name + 'への好意') }); }
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
        if (peace && peace !== slack) ctx.act2({ actors: [peace, cond], cat: 'help', fx: function () { ctx.mod(cond, peace, { trust: 8 }); }, text: ctx.t('練習のあと、{a}が楽譜にこっそり「おつかれ」と書いて{b}に返した。', peace, cond), why: peace.name + 'のNP' });
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
