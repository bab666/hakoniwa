/* 箱庭診断: クラスメイトの一年（行事カレンダー・いじめ・不登校） */
(function () {
  'use strict';
  var HK = window.HK;
  var L = (HK.ClassLife = {});
  function R(ctx, a, b) { return ctx.R(a, b); }
  /* 学年：学園全体のときは住人ごと（setup で c.grade）、それ以外はクラスの学年 */
  function gr(ctx, c) { return c.grade || +ctx.env.grade || 2; }
  function names(list) { return list.map(function (c) { return c.name; }).join('・'); }
  function note(ctx, s) { (ctx.flags.endNotes = ctx.flags.endNotes || []).push(s); }
  function crushOf(ctx, a, min) { return ctx.crush(a, min == null ? 55 : min); }
  function liked(ctx, c) { var s = 0; ctx.present().forEach(function (o) { if (o !== c) s += R(ctx, o, c).aff; }); return s; }

  /* ======================= 行事カレンダー ======================= */
  var CAL = {
    '4月': function (ctx) {
      var P = ctx.present();
      var cands = P.filter(function (c) { return c.action.id === 'rep' || c.tr.lead > 0.6; });
      if (!cands.length) {
        var pushed = ctx.most(P, function (c) { return c.tr.ac + c.tr.np * 0.5; });
        ctx.incident('学級委員決め。誰も手を挙げなかった。');
        ctx.act2({ actors: [pushed], cat: 'help', fx: function () { pushed.flags.leader = true; ctx.stress(pushed, 10); }, text: ctx.t('沈黙に耐えかねて、{a}が小さく手を挙げた。', pushed), why: pushed.name + 'のAC（' + Math.round(pushed.eg.AC) + '）：空気に押された' });
        return;
      }
      ctx.incident('学級委員決め。');
      if (cands.length === 1) {
        ctx.act2({ actors: [cands[0]], cat: 'bond', fx: function () { cands[0].flags.leader = true; }, text: ctx.t('{a}が立候補し、そのまま学級委員になった。', cands[0]), why: cands[0].name + 'の主導性' });
        return;
      }
      var votes = cands.map(function (c) { var v = 0; P.forEach(function (o) { if (o !== c) v += R(ctx, o, c).trust + R(ctx, o, c).aff * 0.5 + ctx.rng() * 20; }); return { c: c, v: v }; }).sort(function (a, b) { return b.v - a.v; });
      var w = votes[0].c, l = votes[1].c;
      ctx.act2({ actors: [w, l], cat: 'conflict', mag: 10, fx: function () { w.flags.leader = true; ctx.mod2(l, w, { ten: 14 }, { ten: 4 }); ctx.stress(l, 8); },
        text: ctx.t('{a}と{b}が立候補して選挙になった。僅差で{a}が勝った。', w, l), why: 'クラスからの信頼と好意' });
    },
    '6月': function (ctx) {
      var P = ctx.present(), rng = ctx.rng;
      if (P.length < 2) return;
      ctx.incident('体育祭。');
      var cheer = ctx.most(P, function (c) { return c.tr.fc + c.tr.lead * 0.5; });
      ctx.act2({ actors: [cheer], cat: 'bond', fx: function () { ctx.others(cheer).forEach(function (o) { ctx.mod(o, cheer, { aff: 3 + o.tr.fc * 3 }); }); }, text: ctx.t('応援団長は{a}。声が嗄れるまで叫び続けた。', cheer), why: cheer.name + 'のFC・主導性' });
      var anc = P.slice().sort(function (x, y) { return ctx.stat(y, 'sport') - ctx.stat(x, 'sport'); })[0];
      var win = rng() < 0.3 + ctx.stat(anc, 'sport') * 0.12;
      ctx.act2({ actors: [anc], cat: win ? 'bond' : 'solo', mag: 10, fx: function () {
        ctx.others(anc).forEach(function (o) { ctx.mod(o, anc, win ? { att: 6, aff: 4 } : { aff: o.tr.np > 0.5 ? 3 : -2 }); });
        if (!win) ctx.stress(anc, 15); else ctx.present().forEach(function (c) { ctx.stress(c, -8); });
      }, text: ctx.t(win ? 'リレーのアンカーは{a}。最後の直線で二人抜いて、クラスが総立ちになった。' : 'リレーのアンカーは{a}。ゴール手前で抜かれ、{a}はしばらくトラックから動けなかった。', anc), why: '運動 ' + ctx.stat(anc, 'sport') + '＋運' });
      if (!win) {
        var blame = ctx.most(ctx.others(anc), function (o) { return o.tr.aggr * o.tr.cp; });
        var comfort = ctx.most(ctx.others(anc), function (o) { return o.tr.np + Math.max(0, R(ctx, o, anc).att) / 80; });
        if (blame && blame.tr.aggr * blame.tr.cp > 0.35) ctx.act2({ actors: [blame, anc], cat: 'conflict', fx: function () { ctx.mod(anc, blame, { ten: 15, aff: -8 }); }, text: ctx.t('「あそこで抜かれるか？」{a}が聞こえるように言った。', blame, anc), why: blame.name + 'の攻撃性×CP' });
        if (comfort && comfort !== blame) ctx.act2({ actors: [comfort, anc], cat: 'help', fx: function () { ctx.mod(anc, comfort, { aff: 10, trust: 8, att: 4 }); ctx.stress(anc, -10); }, text: ctx.t('閉会式のあと、{a}がスポーツドリンクを{b}の頬に押し当てた。「かっこよかったよ｜かっこよかった｜かっこよかったですよ」', comfort, anc), why: comfort.name + 'のNP' });
      }
    },
    '7月': function (ctx) {
      var P = ctx.present();
      if (P.length < 2) return;
      var P1 = P.filter(function (c) { return gr(ctx, c) === 1; });
      if (P1.length >= 2) {
        ctx.incident((P1.length < P.length ? '一年生の' : '') + '林間学校。夜は肝試し。くじで二人一組になった。');
        var sh = ctx.rng.shuffle(P1);
        for (var i = 0; i + 1 < sh.length; i += 2) (function (a, b) {
          var scared = a.tr.ac + (1 - a.tr.a) * 0.3 > b.tr.ac + (1 - b.tr.a) * 0.3 ? a : b, brave = scared === a ? b : a;
          ctx.act2({ actors: [scared, brave], cat: 'romance', fx: function () { ctx.mod2(scared, brave, { att: 8, trust: 6 }, { att: 5, aff: 4 }); },
            text: ctx.t(ctx.pick(['墓地の道で、{a}は{b}の袖を握ったまま離さなかった。{b}は気づかないふりをして、歩く速さを少し落とした。', '茂みががさりと鳴った瞬間、{a}は{b}の腕にしがみついた。{b}は「大丈夫｜大丈夫だ｜大丈夫です」と言って、そのまま腕を貸した。', '{a}は懐中電灯を持つ手が震えて、何度も{b}に持ち替えてもらった。最後には、二人で一本を握っていた。', 'ゴールが見えたとき、{a}はようやく{b}の手を握っていたことに気づいて、慌てて離した。']), scared, brave), why: scared.name + 'のAC（怖がり）／' + brave.name + 'の落ち着き' });
        })(sh[i], sh[i + 1]);
      }
      var Pr = P.filter(function (c) { return !(P1.length >= 2 && gr(ctx, c) === 1); });
      if (Pr.length) {
        ctx.incident('一学期の終業式。夏休みの予定が飛び交った。');
        Pr.forEach(function (a) {
          var c = crushOf(ctx, a, 60);
          if (!c || c.out || ctx.rng() > a.tr.honesty) return;
          var ok = R(ctx, c, a).att > 25 || c.tr.fc > 0.6;
          ctx.act2({ actors: [a, c], cat: 'romance', fx: function () { if (ok) { ctx.mod2(a, c, { att: 6 }, { att: 6 }); a.flags.summer = c.i; } else ctx.stress(a, 8); },
            text: ctx.t(ctx.pick(ok ? ['{a}は{b}を夏祭りに誘った。「いいよ｜いい｜いいですよ」と{b}は言った。', '{a}は帰り際、{b}に「夏祭り、一緒に行かない？｜夏祭り、一緒に行かないか｜夏祭り、一緒に行きませんか？」と聞いた。{b}は少し考えてから頷いた。', '{a}は{b}に夏祭りのチラシを見せた。「これ、行こうよ｜これ、行こう｜これ、行きましょう」――{b}は「浴衣、着ていこうかな｜浴衣、着ていくか｜浴衣、着ていきましょうか」と笑った。'] : ['{a}は{b}を夏祭りに誘いかけて、結局「みんなで｜＝｜みんなで」と言い直した。', '{a}は{b}に夏祭りの話を振ったが、誘う一言は最後まで出てこなかった。', '{a}は{b}を誘おうとして、{b}がほかの友達と行く約束をしているのを聞いてしまった。']), a, c), why: a.name + 'の惹かれと本音の出やすさ' });
        });
      }
    },
    '8月': function (ctx) {
      var P = ctx.present(), shown = false;
      P.forEach(function (a) {
        if (a.flags.summer == null) return;
        var b = ctx.chars[a.flags.summer];
        if (!b || b.out) return;
        if (!shown) { ctx.incident('夏祭りの夜。'); shown = true; }
        ctx.act2({ actors: [a, b], cat: 'romance', mag: 12, fx: function () { ctx.mod2(a, b, { att: 10, aff: 6, trust: 5 }, { att: 10, aff: 6, trust: 5 }); },
          text: ctx.t(ctx.pick(['花火が上がるあいだ、{a}と{b}は人混みの中ではぐれないように手を繋いでいた。', '{a}と{b}は屋台のりんご飴を一つずつ買って、河原の端で花火を見上げた。', '最後の大きな花火が開いたとき、{a}は{b}の横顔を見ていた。{b}も、同じように{a}を見ていた。', '{a}と{b}は、人混みを抜けた神社の石段に並んで座って、遠くの花火の音を聞いていた。']), a, b), why: '一学期の終わりに交わした約束' });
        P.forEach(function (o) {
          if (o === a || o === b) return;
          var c = crushOf(ctx, o, 55);
          if ((c === a || c === b) && (!HK.Obsess || HK.Obsess.jealOk(ctx, o, c))) ctx.act2({ actors: [o, c], cat: 'conflict', fx: function () { ctx.mod(o, c === a ? b : a, { ten: 12 }); ctx.stress(o, 15); if (HK.Obsess) HK.Obsess.feed(ctx, o, c, 6); ctx.pair(o, c === a ? b : a).jealous++; },
            text: ctx.t(ctx.pick(['{a}は、屋台の灯りの向こうに二人の後ろ姿を見つけてしまった。', '{a}は、人混みの中で並んで歩く二人を見かけて、思わず足を止めた。', '{a}は花火を見上げるふりをして、少し離れたところにいる二人から目をそらした。']), o), why: o.name + 'は' + c.name + 'に惹かれていた' });
        });
      });
    },
    '9月': function (ctx) {
      var P = ctx.present();
      if (P.length < 3) return;
      ctx.flags.fest = { work: 0, slack: [] };
      var props = P.slice().sort(function (a, b) { return b.tr.lead + b.tr.fc * 0.3 - a.tr.lead - a.tr.fc * 0.3; }).slice(0, 2);
      var ideas = ['お化け屋敷', '執事・メイド喫茶', '演劇「ロミオとジュリエット」', '縁日', '脱出ゲーム'];
      var ia = ctx.rng.pick(ideas), ib = ctx.rng.pick(ideas.filter(function (x) { return x !== ia; }));
      ctx.incident('文化祭の出し物決め。' + props[0].name + 'は「' + ia + '」、' + props[1].name + 'は「' + ib + '」を推した。');
      var va = 0, vb = 0;
      P.forEach(function (o) { if (props.indexOf(o) >= 0) return; (R(ctx, o, props[0]).trust + R(ctx, o, props[0]).aff * 0.5 >= R(ctx, o, props[1]).trust + R(ctx, o, props[1]).aff * 0.5 ? va++ : vb++); });
      var win = va >= vb ? props[0] : props[1], lose = win === props[0] ? props[1] : props[0];
      ctx.flags.fest.title = win === props[0] ? ia : ib;
      ctx.flags.fest.lead = win.i;
      ctx.act2({ actors: [win, lose], cat: 'conflict', fx: function () { ctx.mod2(lose, win, { ten: lose.tr.cp > 0.6 ? 15 : 6 }, { ten: 3 }); },
        text: ctx.t('多数決で「' + ctx.flags.fest.title + '」に決まった（' + Math.max(va, vb) + '対' + Math.min(va, vb) + '）。{b}は' + (lose.tr.cp > 0.6 ? '最後まで納得していない顔だった。' : 'すぐに切り替えて、手伝うと言った。'), win, lose), why: 'クラスの信頼。' + lose.name + 'の' + (lose.tr.cp > 0.6 ? 'CP（譲れない）' : 'AC・NP') });
    },
    '10月': function (ctx) {
      var P = ctx.present(), rng = ctx.rng, F = ctx.flags.fest;
      if (P.length < 2) return;
      if (!F) { F = ctx.flags.fest = { title: '模擬店', lead: ctx.most(P, function (c) { return c.tr.lead; }).i, work: 0 }; }
      var lead = ctx.chars[F.lead];
      ctx.incident('文化祭の準備期間。出し物は「' + F.title + '」。');
      var hard = P.filter(function (c) { return c.tr.np * 0.5 + c.tr.ac * 0.4 + c.tr.a * 0.2 > 0.55; });
      var slack = P.filter(function (c) { return hard.indexOf(c) < 0 && c.tr.fc * (1 - c.tr.ac) > 0.3; });
      if (hard.length >= 2) {
        var pair = rng.shuffle(hard).slice(0, 2);
        ctx.act2({ actors: pair, cat: R(ctx, pair[0], pair[1]).att > 25 ? 'romance' : 'bond', fx: function () { ctx.mod2(pair[0], pair[1], { trust: 10, aff: 6, att: 4 }, { trust: 10, aff: 6, att: 4 }); },
          text: ctx.t('下校時刻を過ぎても、{a}と{b}は二人で看板にペンキを塗っていた。', pair[0], pair[1]), why: '二人ともNP・ACが高く、最後まで残るタイプ' });
      }
      slack.forEach(function (s) {
        var angry = ctx.most(hard.length ? hard : ctx.others(s), function (o) { return o.tr.cp; });
        if (angry && angry !== s && angry.tr.cp > 0.5) ctx.act2({ actors: [angry, s], cat: 'conflict', fx: function () { ctx.mod2(angry, s, { ten: 12 }, { ten: 8 }); }, text: ctx.t(ctx.pick(['{b}は準備を抜けて帰った。翌朝、{a}は{b}と目を合わせなかった。', '{b}がいつの間にかいなくなっていることに、{a}は気づいていた。翌日、{a}は{b}の分の仕事を、わざと机の上に積んでおいた。', '{a}は、準備をさぼって帰る{b}の背中に「また？｜またか｜またですか？」と聞こえるように言った。']), angry, s), why: s.name + 'のFC高・AC低／' + angry.name + 'のCP' });
      });
      var score = hard.length / P.length * 0.6 + (1 - slack.length / P.length) * 0.2 + lead.tr.lead * 0.2 + (rng() - 0.5) * 0.4;
      var ok = score > 0.45;
      ctx.incident('文化祭当日。');
      ctx.act2({ actors: [lead], cat: ok ? 'bond' : 'conflict', mag: 15, fx: function () {
        ctx.present().forEach(function (c) { ctx.stress(c, ok ? -12 : 10); if (c !== lead) ctx.mod(c, lead, ok ? { trust: 6, aff: 4 } : { ten: 6 }); });
      }, text: ok ? '「' + F.title + '」には行列ができ、学年で一番の売り上げになった。' + lead.name + 'は打ち上げで泣いた。' : '「' + F.title + '」は客がまばらで、二日目の午後には片付けが始まっていた。', why: '準備に本気だった人数（' + hard.length + '人）とサボり（' + slack.length + '人）、運' });
      note(ctx, '文化祭「' + F.title + '」は' + (ok ? '大成功' : '空振り') + '。仕切り役は' + lead.name + '。');
      if (!ok) {
        var bl = ctx.most(P, function (c) { return c.tr.aggr; });
        var tgt = slack[0] || ctx.most(ctx.others(bl), function (o) { return R(ctx, bl, o).ten; });
        if (bl && tgt && bl !== tgt && bl.tr.aggr > 0.55) ctx.act2({ actors: [bl, tgt], cat: 'conflict', fx: function () { ctx.mod2(bl, tgt, { ten: 14 }, { ten: 16, aff: -8 }); ctx.stress(tgt, 12); }, text: ctx.t('「誰のせいだと思ってんの｜誰のせいだと思っている｜誰のせいだと思っているんですか」{a}の矛先は{b}に向いた。', bl, tgt), why: bl.name + 'の攻撃性' });
      }
      var fire = false;
      P.forEach(function (a) {
        var c = crushOf(ctx, a, 55);
        if (!c || c.out || rng() > 0.35 + a.tr.honesty * 0.5 || (HK.Poly && !HK.Poly.canTry(ctx, a, c))) return;
        if (!fire) { ctx.incident('後夜祭。グラウンドの真ん中でキャンプファイヤーが燃えている。'); fire = true; }
        var yes = R(ctx, c, a).att > 30;
        ctx.act2({ actors: [a, c], cat: 'romance', mag: 12, fx: function () { ctx.mod2(a, c, { att: yes ? 8 : 0 }, { att: yes ? 10 : 3, aff: yes ? 5 : 0 }); if (!yes) ctx.stress(a, 12); if (yes && R(ctx, a, c).aff > 30 && R(ctx, c, a).aff > 30) ctx.pair(a, c).couple = true; },
          text: ctx.t(ctx.pick(yes ? ['{a}は{b}をフォークダンスの輪に誘った。曲が終わっても、手はしばらく離れなかった。', '{a}は{b}の前に手を差し出した。{b}は笑ってその手を取り、火の粉の舞う輪の中に入っていった。', '{a}と{b}は輪から少し離れて、キャンプファイヤーの火が小さくなるまで並んで見ていた。'] : ['{a}は{b}をダンスに誘った。{b}は「ごめん、片付けがあるから｜すまない、片付けがある｜すみません、片付けがありますから」と校舎に戻っていった。', '{a}は{b}を誘おうと近づいたが、{b}はもう別の人と輪の中にいた。', '{a}は{b}に声をかけた。{b}は「また今度ね｜また今度な｜また今度、お願いします」と笑って、友達のところへ戻っていった。']), a, c), why: a.name + 'の惹かれと本音の出やすさ／' + c.name + 'の側の惹かれ（' + Math.round(R(ctx, c, a).att) + '）' });
      });
    },
    '12月': function (ctx) {
      var P = ctx.present();
      var couples = [];
      for (var i = 0; i < P.length; i++) for (var j = i + 1; j < P.length; j++) if (ctx.pair(P[i], P[j]).couple) couples.push([P[i], P[j]]);
      if (!couples.length && P.length < 2) return;
      ctx.incident('二学期の終業式。明日はクリスマス・イブ。');
      couples.forEach(function (c) {
        ctx.act2({ actors: c, cat: 'romance', fx: function () { ctx.mod2(c[0], c[1], { aff: 6, att: 6 }, { aff: 6, att: 6 }); }, text: ctx.t(ctx.pick(['{a}と{b}は、駅前のイルミネーションの下で待ち合わせをした。', '{a}と{b}は、終業式の帰りにそのまま二人でケーキ屋に寄った。', '{a}は{b}に、イブの夜に渡すプレゼントの中身を、最後まで内緒にしていた。', '{a}と{b}は、教室に最後まで残って、明日の待ち合わせの時間を三回確かめた。']), c[0], c[1]), why: '恋人同士' });
      });
      var lonely = ctx.most(P, function (c) { return c.stress / 100 + (couples.some(function (x) { return x.indexOf(c) >= 0; }) ? -9 : 0) + (crushOf(ctx, c, 55) ? 0.3 : 0); });
      if (lonely && !couples.some(function (x) { return x.indexOf(lonely) >= 0; })) {
        var cr = crushOf(ctx, lonely, 55);
        /* 想い人が転校・卒業などでいなくなっていたら、名前は出さない（ケーキの文に） */
        if (cr && !(HK.State ? HK.State.here(cr) : (cr.alive !== false && !cr.out))) cr = null;
        ctx.act2({ actors: [lonely, cr], cat: 'solo', fx: function () { ctx.stress(lonely, 8); }, text: cr ? ctx.t('{a}はイブの夜、{b}に送るメッセージを書いては消した。結局、送らなかった。', lonely, cr) : ctx.t('{a}はイブの夜、コンビニでケーキを一つだけ買った。', lonely), why: cr ? lonely.name + 'の' + cr.name + 'への想い' : lonely.name + 'の孤独' });
      }
    },
    '1月': function (ctx) {
      var P = ctx.present();
      var P3 = P.filter(function (c) { return gr(ctx, c) === 3; });
      if (P3.length) {
        ctx.incident((P3.length < P.length ? '三年生の' : '') + '共通テスト。');
        P3.forEach(function (c) {
          var good = ctx.rng() < 0.2 + ctx.stat(c, 'study') * 0.13 - c.stress / 300;
          c.flags.exam = good;
        });
        var bad = P3.filter(function (c) { return c.flags.exam === false; });
        /* 振るわなかった人は一つの記録にまとめる（同じ一文が人数ぶん並ばないように） */
        if (bad.length) ctx.act2({ actors: bad, cat: 'solo', fx: function () { bad.forEach(function (c) { ctx.stress(c, 20); }); },
          text: bad.length === 1 ? ctx.t(ctx.pick(['{a}は自己採点の途中で鉛筆を置いた。', '{a}は答え合わせの赤ペンを握ったまま、しばらく動けなくなった。', '{a}は自己採点の結果を、誰にも見せずに鞄の奥にしまった。']), bad[0])
            : ctx.pick(['{n}は、自己採点の途中で鉛筆を置いた。', '{n}は、答え合わせの途中で黙りこんだ。教室の一角だけ、空気が重かった。', '自己採点のあと、{n}は誰とも目を合わせずに帰っていった。']).replace('{n}', HK.Birthday ? HK.Birthday.grp(bad) : names(bad)),
          why: bad.map(function (c) { return c.name + '（学力 ' + ctx.stat(c, 'study') + '・焦り ' + Math.round(c.stress) + '）'; }).join('・') });
        bad.forEach(function (b) {
          var h = ctx.most(ctx.others(b), function (o) { return o.tr.np + Math.max(0, R(ctx, o, b).aff) / 60; });
          if (h && h.tr.np > 0.5) ctx.act2({ actors: [h, b], cat: 'help', fx: function () { ctx.mod(b, h, { aff: 8, trust: 10 }); ctx.stress(b, -10); }, text: ctx.t(ctx.pick(['{a}は、自分の受験勉強の手を止めて、{b}と二次試験の過去問を解いた。', '{a}は{b}を図書室に誘って、閉館まで一緒に苦手な分野をやり直した。', '{a}は{b}に、自分のまとめノートを丸ごと貸した。「まだ二次がある。ここからでしょ｜まだ二次がある。ここからだろう｜まだ二次があります。ここからでしょう」']), h, b), why: h.name + 'のNP' });
        });
        if (P3.length === P.length) return;
        P = P.filter(function (c) { return gr(ctx, c) !== 3; });
      }
      if (P.length < 2) return;
      ctx.incident('三学期の始まり。冬休み明けの教室は、少しだけ空気が変わっていた。');
      var a = ctx.rng.pick(P), b = ctx.closest(a);
      if (b) ctx.act2({ actors: [a, b], cat: 'bond', fx: function () { ctx.mod2(a, b, { trust: 5, aff: 4 }, { trust: 5, aff: 4 }); }, text: ctx.t('{a}は{b}と初詣に行った話を、誰にも言わなかった。', a, b), why: '冬休みのあいだに縮まった距離' });
    },
    '2月': function (ctx) { valentine(ctx); },
    '3月': function (ctx) {
      whiteDay(ctx);
      var P = ctx.present();
      var G3 = P.filter(function (c) { return gr(ctx, c) === 3; });
      if (G3.length) {
        ctx.incident(G3.length < P.length ? '卒業式。三年生の' + G3.map(function (c) { return c.name; }).join('・') + 'が、学校を去る日。' : '卒業式。');
        if (G3.length < P.length) seeOff(ctx, G3, P.filter(function (c) { return gr(ctx, c) !== 3; }));
        G3.forEach(function (a) {
          var c = crushOf(ctx, a, 50);
          if (!c || c.out || ctx.rng() > 0.3 + a.tr.honesty * 0.5 || (HK.Poly && !HK.Poly.canTry(ctx, a, c))) return;
          var yes = R(ctx, c, a).att > 28;
          ctx.act2({ actors: [a, c], cat: 'romance', mag: 15, fx: function () { ctx.mod2(a, c, { att: 6 }, { att: yes ? 10 : 2 }); if (yes) ctx.pair(a, c).couple = true; else ctx.stress(a, 15); },
            text: ctx.t(ctx.pick(yes ? ['式のあと、{a}は{b}に第二ボタンをねだった。{b}は黙って、ボタンごと学ランの前を外した。', '式のあと、{a}は{b}を桜の木の下に呼び出した。「ずっと言えなかったことがある｜＝｜ずっと言えなかったことがあります」――{b}は、最後まで聞いてから頷いた。', '{a}は{b}の卒業アルバムの寄せ書きの欄に、一行だけ書いた。{b}はそれを読んで、{a}を追いかけた。'] : ['{a}は{b}を呼び止めて、それから「元気でね｜元気でな｜お元気で」とだけ言った。', '{a}は{b}に花束を渡した。言いたかったことは、花束の中のカードにも書けなかった。', '{a}は校門のところで{b}を待っていたが、{b}は友達に囲まれていて、結局手を振っただけだった。']), a, c), why: '最後の日。' + a.name + 'の惹かれ（' + Math.round(R(ctx, a, c).att) + '）' });
        });
        if (G3.length === P.length) return;
        P = P.filter(function (c) { return gr(ctx, c) !== 3; });
      }
      if (P.length < 2) return;
      ctx.incident('球技大会。来月にはクラス替えがある。');
      var best = ctx.most(P, function (c) { return ctx.stat(c, 'sport') / 5 + c.tr.fc * 0.3; });
      ctx.act2({ actors: [best], cat: 'bond', fx: function () { ctx.present().forEach(function (o) { if (o !== best) ctx.mod(o, best, { aff: 4 }); }); }, text: ctx.t('決勝のスリーポイントを決めたのは{a}だった。' + (ctx.few() ? '二人で、子どもみたいに喜んだ。' : 'このクラスで最後に、全員で喜んだ。'), best), why: '運動 ' + ctx.stat(best, 'sport') });
    }
  };

  /* ======================= バレンタイン／ホワイトデー ======================= */
  var V_GIVE = [
    '{a}は放課後の下駄箱で{b}を待ち伏せして、紙袋を押しつけた。「本命だから｜本命だ｜本命ですから」',
    '{a}は{b}の机の中に、リボンのかかった箱をこっそり入れた。差出人の名前は書かなかった。',
    '昼休み、{a}は{b}を屋上に呼び出した。手作りのトリュフは、少し形が崩れていた。',
    '{a}は「余ったから｜余ったからだ｜余りましたから」と言って{b}に箱を渡した。余るはずのない、一つだけのラッピングだった。',
    '{a}は帰り道、{b}の自転車の籠に箱を入れて、走って逃げた。',
    '{a}は{b}の前で深呼吸を三回して、両手で箱を差し出した。',
    '{a}は「義理だから｜義理だ｜義理ですから」と言いながら、{b}にだけ違う色の包みを渡した。',
    '部活終わりの暗い廊下で、{a}は{b}を呼び止めた。「これ。……意味、分かるよね｜これ。……意味は、分かるだろう｜これ。……意味、分かりますよね」'
  ];
  var V_YES = ['{b}はその場で包みを開けて、一粒食べた。「うまい。……ホワイトデー、待てないかも｜うまい。……ホワイトデーまで、待てないかもしれないな｜おいしいです。……ホワイトデー、待てないかもしれません」', '{b}は箱を受け取ったまま、しばらく動かなかった。それから小さく「俺も」と言った。', '{b}は耳まで赤くして「ありがとう｜＝｜ありがとうございます」と言い、その日のうちに返事のメッセージを送った。', '{b}は{a}の手ごと箱を握った。それが返事だった。'];
  var V_HOLD = ['{b}は「ありがとう｜＝｜ありがとうございます」と笑って受け取った。それ以上は何も言わなかった。', '{b}は少し困った顔をして、「ホワイトデーまで考えさせて｜ホワイトデーまで考えさせてくれ｜ホワイトデーまで考えさせてください」と言った。', '{b}は箱を鞄にしまった。その表情からは、何も読めなかった。'];
  var V_NO = ['{b}は申し訳なさそうに箱を見た。「ごめん、受け取れない｜すまない、受け取れない｜すみません、受け取れません」', '{b}は「気持ちは私も嬉しい｜気持ちは私も嬉しい｜気持ちは私も嬉しいです」と言って、箱を{a}の手に戻した。', '{b}には、もう決まった相手がいた。{a}はそれを、その場で知った。'];
  var V_FAIL = ['{a}の鞄の中で、{c}に渡すはずだった箱は一日中出番を待っていた。結局、帰り道のゴミ箱に捨てた。', '{a}は{c}の机の前まで行って、引き返した。三回。', '{a}は{c}に渡す箱を、義理チョコの山の中に紛れ込ませた。{c}はそれに気づかなかった。', '{a}は家で一人、{c}に渡せなかったチョコを全部食べた。'];
  var V_GIRI = ['{a}はクラス全員に、手作りのクッキーを一枚ずつ配って回った。', '{a}は大袋のチョコを開けて、教卓に「ご自由に」と貼り紙をした。', '{a}は義理チョコに一人ずつ違うメッセージを書いていた。', '{a}は休み時間ごとに、誰かにチロルチョコを渡していた。'];
  var V_TOMO = ['{a}と{b}は友チョコを交換して、その場で全部食べた。', '{a}は{b}に、去年より上達した生チョコを自慢げに渡した。', '{a}と{b}は互いのチョコを半分ずつ交換した。'];
  var V_NONE = ['{a}は「くだらない｜＝｜くだらないです」と言って、一日中いつも通りに過ごした。', '{a}は、自分には関係のない日だという顔をしていた。', '{a}は机の上に積まれた義理チョコを、黙って鞄に詰めた。'];

  function valentine(ctx) {
    var P = ctx.present(), rng = ctx.rng, got = {};
    if (P.length < 2) return;
    ctx.incident('バレンタイン当日。朝から教室の空気がそわそわしている。');
    ctx.flags.valentine = [];
    var order = rng.shuffle(P);
    order.forEach(function (a) {
      var c = crushOf(ctx, a, 50);
      if (c && !c.out && ctx.pair(a, c).couple) {
        ctx.act2({ actors: [a, c], cat: 'romance', fx: function () { ctx.mod2(a, c, { aff: 5, att: 5 }, { aff: 5, att: 5 }); }, text: ctx.t(ctx.pick(['{a}は恋人の{b}に、去年の失敗作とは比べものにならない出来のチョコを渡した。', '{a}と{b}は、二人きりの教室でチョコを半分こした。', '{a}は{b}の分だけ、ラッピングを三回やり直した。']), a, c), why: '恋人同士' });
        return;
      }
      if (c && !c.out) {
        var go = rng() < 0.2 + a.tr.honesty * 0.55 + (a.goal.id === 'lover' ? 0.2 : 0) - a.tr.ac * 0.15;
        if (!go) {
          ctx.act2({ actors: [a, c], cat: 'solo', fx: function () { ctx.stress(a, 12); ctx.mod(a, c, { att: 4 }); }, text: ctx.t(ctx.pick(V_FAIL), a, null, c), why: a.name + 'のAC（' + Math.round(a.eg.AC) + '）：渡したい気持ちより、断られる怖さが勝った' });
          return;
        }
        got[c.i] = (got[c.i] || 0) + 1;
        var rc = R(ctx, c, a);
        var taken = P.some(function (o) { return o !== a && o !== c && ctx.pair(c, o).couple; }) || !!(HK.Poly && !HK.Poly.canTry(ctx, a, c));
        var res = taken ? 'no' : rc.att > 32 && rc.aff > 22 ? 'yes' : rc.att > 15 || c.tr.np > 0.55 ? 'hold' : 'no';
        var line = ctx.pick(V_GIVE) + ctx.pick(res === 'yes' ? V_YES : res === 'hold' ? V_HOLD : V_NO);
        ctx.act2({ actors: [a, c], cat: 'romance', mag: res === 'yes' ? 25 : 15, fx: function () {
          ctx.pair(a, c).confessed[a.i] = true;
          if (res === 'yes') { ctx.pair(a, c).couple = true; ctx.mod2(a, c, { att: 10, aff: 8 }, { att: 12, aff: 10, trust: 8 }); }
          else if (res === 'hold') { ctx.mod(c, a, { att: 6 }); ctx.flags.valentine.push({ a: a.i, b: c.i }); }
          else { ctx.stress(a, 25); ctx.mod2(a, c, { ten: 8 }, { ten: 4 }); }
        }, text: ctx.t(line, a, c), why: a.name + 'の惹かれ（' + Math.round(R(ctx, a, c).att) + '）と本音の出やすさ／' + c.name + 'の側：惹かれ ' + Math.round(rc.att) + (taken ? '・すでに恋人がいる' : '') });
        P.forEach(function (o) {
          if (o === a || o === c) return;
          if (crushOf(ctx, o, 55) === c && (!HK.Obsess || HK.Obsess.jealOk(ctx, o, c))) ctx.act2({ actors: [o, a], cat: 'conflict', fx: function () { ctx.mod(o, a, { ten: 14 }); ctx.stress(o, 12); ctx.pair(o, a).jealous++; }, text: ctx.t(ctx.pick(['{a}は、{b}が{c}に箱を渡すところを見てしまった。', '{a}は一日中、{c}の鞄の中身のことばかり考えていた。', '{a}の手の中で、渡せなかった箱が少し潰れた。']), o, a, c), why: o.name + 'も' + c.name + 'に惹かれていた' });
        });
        return;
      }
      if (a.tr.np > 0.6 || (a.tr.ac > 0.65 && a.tr.cold < 0.5)) {
        ctx.act2({ actors: [a], cat: 'help', fx: function () { ctx.others(a).forEach(function (o) { ctx.mod(o, a, { aff: 3 }); got[o.i] = got[o.i] || 0; }); }, text: ctx.t(ctx.pick(V_GIRI), a), why: a.name + 'の' + (a.tr.np > 0.6 ? 'NP' : 'AC') });
        return;
      }
      var f = ctx.most(ctx.others(a), function (o) { return R(ctx, a, o).aff + o.tr.fc * 20; });
      if (a.tr.fc > 0.55 && f && R(ctx, a, f).aff > 20) {
        ctx.act2({ actors: [a, f], cat: 'bond', fx: function () { ctx.mod2(a, f, { aff: 6 }, { aff: 6 }); }, text: ctx.t(ctx.pick(V_TOMO), a, f), why: a.name + 'のFC' });
        return;
      }
      if (a.tr.cold > 0.6) ctx.act2({ actors: [a], cat: 'solo', text: ctx.t(ctx.pick(V_NONE), a), why: a.name + 'のドライさ' });
    });
    var pop = Object.keys(got).sort(function (x, y) { return got[y] - got[x]; })[0];
    if (pop != null && got[pop] >= 2) {
      var pc = ctx.chars[pop];
      ctx.act2({ actors: [pc], cat: 'bond', fx: function () { ctx.stress(pc, -6); }, text: ctx.t(ctx.pick(['放課後、{a}の机の上には本命らしき箱が' + got[pop] + 'つ並んでいた。', '{a}は帰り道、紙袋を二つ提げていた。本命が' + got[pop] + 'つ混じっていることを、本人だけが知らない。']), pc), why: 'クラスの惹かれが' + pc.name + 'に集まっていた' });
      note(ctx, 'バレンタインの本命は' + pc.name + 'に' + got[pop] + 'つ集まった。');
    }
  }

  function whiteDay(ctx) {
    var list = ctx.flags.valentine || [];
    if (!list.length) return;
    ctx.incident('ホワイトデー。一か月前の返事の日。');
    list.forEach(function (v) {
      var a = ctx.chars[v.a], b = ctx.chars[v.b];
      if (!a.alive || !b.alive || a.out || b.out) return;
      var r = R(ctx, b, a), yes = r.att > 30 && r.aff > 22 && (!HK.Poly || HK.Poly.canTry(ctx, a, b));
      if (yes) {
        ctx.act2({ actors: [b, a], cat: 'romance', mag: 25, fx: function () { ctx.pair(a, b).couple = true; ctx.mod2(a, b, { att: 10, aff: 8 }, { att: 10, aff: 8 }); },
          text: ctx.t(ctx.pick(['{a}は{b}に、手作りのマカロンを渡した。「一か月、ちゃんと考えた。……付き合おう｜＝｜一か月、ちゃんと考えました。……付き合いましょう」', '{a}は{b}を校門で待っていた。差し出した箱には、メッセージカードが一枚入っていた。', '{a}は「三倍返し｜三倍返しだ｜三倍返しです」と言って、{b}に大きな箱を渡した。中身より、添えられた言葉の方が大事だった。']), b, a), why: b.name + 'の惹かれがこの一か月で育った（' + Math.round(r.att) + '）' });
      } else if (b.tr.cold > 0.6) {
        ctx.act2({ actors: [b, a], cat: 'conflict', fx: function () { ctx.stress(a, 20); ctx.mod(a, b, { ten: 10 }); }, text: ctx.t('{a}はホワイトデーのことを、すっかり忘れていた。{b}は何も言わなかった。', b, a), why: b.name + 'のドライさ' });
      } else {
        ctx.act2({ actors: [b, a], cat: 'romance', fx: function () { ctx.stress(a, 15); ctx.mod(b, a, { aff: 4 }); }, text: ctx.t(ctx.pick(['{a}はお返しのクッキーを渡して、「友達として、これからもよろしく｜友達として、これからもよろしくな｜友達として、これからもよろしくお願いします」と言った。', '{a}は丁寧に包んだお返しと一緒に、申し訳なさそうな顔を{b}に渡した。']), b, a), why: b.name + 'の惹かれは育たなかった（' + Math.round(r.att) + '）' });
      }
    });
  }

  L.month = function (ctx, s) {
    var f = CAL[ctx.label];
    if (f) { f(ctx); ctx.flush(); }
    birthdays(ctx);
    if (ctx.env.grade === 'all') senpaiMonth(ctx);
  };
  L.gr = gr;
  /* 箱庭全体の出来事のうち、同じ一文が人数ぶん並ぶもの（誕生日・転校の噂）は、birthday.js のまとめ方で出す */
  if (HK.Birthday && HK.INCIDENTS && HK.INCIDENTS.classroom) HK.INCIDENTS.classroom.forEach(function (x) {
    if (x.id === 'birthday') x.run = HK.Birthday.incident;
    if (x.id === 'transfer') x.run = HK.Birthday.transfer;
  });

  /* ======================= 先輩と後輩（学園全体） ======================= */
  /* {a}＝先輩 {b}＝後輩 */
  var SK = [
    { cat: 'help', t: ['部活の練習のあと、{a}は残って{b}のフォームを見てやった。「肘、もう少し上げてみ｜肘、もう少し上げてみろ｜肘、もう少し上げてみてください」', '{a}は{b}に、去年の自分のノートを丸ごと貸した。「赤線のところ、だいたい出るよ｜赤線のところ、だいたい出る｜赤線のところ、だいたい出ます」', '{a}は委員会の仕事で困っている{b}に気づいて、黙って半分引き受けた。'], fx: function (ctx, a, b) { ctx.mod2(a, b, { aff: 4, trust: 3 }, { aff: 6, trust: 7 }); } },
    { cat: 'bond', t: ['{b}は自販機の前で{a}にばったり会い、なぜか緊張して二本買ってしまった。一本は{a}の手に渡った。', '昼休み、{b}は{a}の教室の前を、用もないのに二回通った。', '{a}は廊下で{b}を見かけるたび、「おう」と軽く手を上げた。{b}はそれだけで少し嬉しかった。', '{b}は{a}に部活の差し入れを持っていった。{a}は「気が利くね｜気が利くな｜気が利きますね」と笑って、その場で半分を部員に配った。'], fx: function (ctx, a, b) { ctx.mod2(a, b, { aff: 3 }, { aff: 5 }); } },
    { cat: 'conflict', t: ['{a}は、挨拶をしなかった{b}を呼び止めて注意した。{b}は頭を下げたが、内心は面白くなかった。', '{b}がレギュラーに選ばれ、{a}は控えに回された。{a}は{b}に「おめでとう｜＝｜おめでとうございます」と言った。声が少しかすれていた。', '委員会で、{b}は{a}のやり方に真っ向から反対した。「去年のままじゃ、だめだと思う｜去年のままでは、だめだと思う｜去年のままじゃ、だめだと思います」'], fx: function (ctx, a, b) { ctx.mod2(a, b, { ten: 6 }, { ten: 5 }); ctx.stress(a, 4); } },
    { cat: 'help', t: ['他校の生徒に絡まれていた{b}の前に、{a}が割って入った。「うちの後輩に何か用？｜うちの後輩に何か用か｜うちの後輩に何か用ですか？」', '{b}が先生に叱られているところへ、{a}が来て「自分が頼んだことなの｜自分が頼んだことだ｜自分が頼んだことなんです」と口を挟んだ。'], fx: function (ctx, a, b) { ctx.mod(b, a, { aff: 8, trust: 10 }); ctx.stress(b, -6); } },
    { cat: 'solo', who: 'b', t: ['{b}は、来年の春には{a}がもう校舎にいないことを、ふと考えてしまった。', '{b}は{a}の背中を見て、あんな先輩になりたいと思った。'], fx: function (ctx, a, b) { ctx.mod(b, a, { aff: 3 }); } },
    { cat: 'romance', t: ['{b}は、{a}の引退試合をスタンドの最前列で見ていた。試合が終わっても、しばらく席を立てなかった。', '{a}は帰りの駅で{b}と二人になった。「先輩」と呼ばれるたび、{a}は少しだけ照れた。'], fx: function (ctx, a, b) { ctx.mod2(a, b, { att: 4 }, { att: 6 }); }, love: true }
  ];
  var SEEOFF = ['{b}は、卒業式のあと{a}を呼び止めて、言葉にならないまま頭を下げた。{a}はその頭をくしゃっと撫でた。「あとは任せたよ｜あとは任せた｜あとは任せました」', '{b}は{a}に、部員みんなで書いた色紙を渡した。{a}は笑っていたが、目が赤かった。', '{a}は校門の前で振り返り、{b}に向かって手を振った。{b}は見えなくなるまで手を振り返した。'];
  function senior(ctx, a, b) { return gr(ctx, a) > gr(ctx, b); }
  function senpaiMonth(ctx) {
    var P = ctx.present(), pairs = [];
    P.forEach(function (a) { P.forEach(function (b) { if (a !== b && senior(ctx, a, b)) pairs.push([a, b]); }); });
    if (!pairs.length) return;
    var n = 1 + (pairs.length > 3 && ctx.rng() < 0.3 ? 1 : 0);
    for (var k = 0; k < n; k++) {
      var pr = HK.weighted(ctx.rng, pairs, function (x) { return 0.4 + Math.max(0, R(ctx, x[1], x[0]).aff) / 50 + Math.max(0, R(ctx, x[0], x[1]).aff) / 80; }), a = pr[0], b = pr[1];
      var list = SK.filter(function (e) { return !e.love || (ctx.romanceOk([a, b]) && R(ctx, b, a).att > 20); });
      var e = ctx.pick(list);
      (function (e, a, b) { ctx.act2({ actors: e.who === 'b' ? [b, a] : [a, b], cat: e.cat, fx: function () { e.fx(ctx, a, b); }, text: ctx.t(ctx.pick(e.t), a, b), why: a.name + '（' + gr(ctx, a) + '年）と' + b.name + '（' + gr(ctx, b) + '年）。先輩と後輩', mag: 8 }); })(e, a, b);
    }
  }
  function seeOff(ctx, G3, rest) {
    rest.forEach(function (b) {
      var a = G3.slice().sort(function (x, y) { return R(ctx, b, y).aff - R(ctx, b, x).aff; })[0];
      if (!a || R(ctx, b, a).aff < 15) return;
      ctx.act2({ actors: [a, b], cat: 'bond', fx: function () { ctx.mod2(a, b, { aff: 5, trust: 5 }, { aff: 8, trust: 5 }); ctx.stress(b, 6); }, text: ctx.t(ctx.pick(SEEOFF), a, b), why: b.name + 'が見送る、先輩の' + a.name + 'の卒業', mag: 14 });
    });
  }

  /* ======================= 誕生日（プロフィールの誕生月） ======================= */
  var BD_GROUP = ['朝、{a}が教室に入ると、黒板いっぱいに「HAPPY BIRTHDAY」の文字が描かれていた。描いたのは{n}だった。', '{n}は、{a}の机にこっそり寄せ書きの色紙を置いておいた。{a}は昼休みまで気づかなかった。', '放課後、{n}は{a}を引き止めて、コンビニのケーキにろうそくを一本立てた。', '{n}は、{a}の誕生日に合わせて、昼休みに小さなお菓子の山を作った。{a}は「大げさだって｜大げさだ｜大げさですよ」と言いながら、笑っていた。'];
  var BD_ONE = ['{b}は{a}に「誕生日でしょ｜誕生日だろう｜誕生日でしょう」と言って、紙パックのジュースを一本おごった。', '{b}は{a}の誕生日を覚えていた。帰り際、{a}の鞄に小さな包みを入れておいた。', '{b}は朝いちばんに「誕生日おめでとう｜＝｜誕生日おめでとうございます」と言った。{a}は、それだけで一日機嫌がよかった。'];
  var BD_LOVE = ['{b}は放課後の教室で、{a}に小さな箱を渡した。「誕生日、おめでとう。……一番に言いたかった｜＝｜誕生日、おめでとうございます。……一番に言いたかったんです」', '{b}は{a}の誕生日に、一緒に帰ろうと声をかけた。途中で寄った公園で、手作りのお守りを渡した。'];
  var BD_NONE = ['今日が{a}の誕生日だということを、クラスの誰も知らなかった。{a}は帰り道、自分で小さなケーキを一つ買った。', '{a}は誕生日の一日を、いつも通りに過ごした。家に帰ってから、母親からのメッセージに気づいた。'];
  function birthdays(ctx) {
    var m = parseInt(ctx.label, 10);
    if (!m) return;
    ctx.flags.bday = ctx.flags.bday || {};
    ctx.present().forEach(function (a) {
      if (+a.bmonth !== m || ctx.flags.bday[a.i]) return;
      /* 祝い方（個別・まとめ・笑い話・好物・空回り）は birthday.js */
      if (HK.Birthday) { HK.Birthday.celebrate(ctx, a, { m: m }); return; }
      ctx.flags.bday[a.i] = 1;
      var fr = ctx.others(a).filter(function (o) { return R(ctx, o, a).aff > 20 && o.role !== 'teacher'; }).sort(function (x, y) { return R(ctx, y, a).aff - R(ctx, x, a).aff; });
      var lv = fr.filter(function (o) { return ctx.romanceOk([o, a]) && (ctx.pair(o, a).couple || R(ctx, o, a).att > 40); })[0];
      if (lv && ctx.rng() < 0.6) {
        ctx.act2({ actors: [lv, a], cat: 'romance', fx: function () { ctx.mod2(lv, a, { att: 5, aff: 4 }, { att: 8, aff: 6 }); ctx.stress(a, -8); }, text: ctx.t(ctx.pick(BD_LOVE), a, lv), why: a.name + 'の誕生日（' + m + '月）。' + lv.name + 'の想い', mag: 14 });
      } else if (fr.length >= 2) {
        var g = fr.slice(0, Math.min(3, fr.length));
        ctx.act2({ actors: [a].concat(g), cat: 'bond', fx: function () { g.forEach(function (o) { ctx.mod2(o, a, { aff: 3 }, { aff: 6, trust: 3 }); }); ctx.stress(a, -10); }, text: ctx.t(ctx.pick(BD_GROUP).replace(/\{n\}/g, g.map(function (o) { return o.name; }).join(g.length > 2 ? '・' : 'と')), a), why: a.name + 'の誕生日（' + m + '月）', mag: 12 });
      } else if (fr.length) {
        ctx.act2({ actors: [fr[0], a], cat: 'bond', fx: function () { ctx.mod2(fr[0], a, { aff: 3 }, { aff: 6, trust: 4 }); ctx.stress(a, -6); }, text: ctx.t(ctx.pick(BD_ONE), a, fr[0]), why: a.name + 'の誕生日（' + m + '月）', mag: 10 });
      } else {
        ctx.act2({ actors: [a], cat: 'solo', fx: function () { ctx.stress(a, 6); }, text: ctx.t(ctx.pick(BD_NONE), a), why: a.name + 'の誕生日（' + m + '月）。まだ、祝ってくれるほど親しい人がいない', mag: 8 });
      }
    });
  }

  /* ======================= いじめ ======================= */
  var FORMS = [
    null,
    { t: '{a}が{b}の机に落書きをした。何人かが笑った。', st: 14 },
    { t: '{b}だけがクラスのグループLINEから外された。{a}の仕業だと、誰もが知っていた。', st: 18 },
    { t: '{b}の上履きが、ゴミ箱の中から見つかった。', st: 22 },
    { t: '放課後、{a}たちが{b}を体育館の裏に呼び出した。', st: 28 }
  ];

  function bullyActive(ctx) { var B = ctx.flags.bully; return B && !B.stopped ? B : null; }

  function startBully(ctx) {
    var mode = ctx.env.bully || 'auto';
    if (mode === 'off') return;
    var P = ctx.present();
    if (P.length < 3) return;
    var last = ctx.flags.bullyEnd || -9;
    if (ctx.stepIndex - last < 2) return;
    var by = ctx.most(P, function (c) { return c.tr.aggr * (0.6 + c.tr.cp * 0.6) + c.tr.jealous * 0.3; });
    if (!by || by.tr.aggr < (mode === 'high' ? 0.45 : 0.57)) return;
    var fac = ctx.fac && ctx.fac.regime === 'dictator' && ctx.fac.groups[0].leader === by.i ? 0.2 : 0;
    var p = 0.1 + (50 - ctx.env.climate) / 220 + (mode === 'high' ? 0.25 : 0) + fac;
    if (ctx.rng() > p) return;
    var tg = ctx.most(ctx.others(by), function (o) { return -liked(ctx, o) / 120 + o.tr.ac * 0.5 + R(ctx, by, o).ten / 80 + (ctx.fac && ctx.fac.loners.indexOf(o.i) >= 0 ? 0.4 : 0) - Math.max(0, R(ctx, by, o).aff) / 60; });
    ctx.flags.bully = { by: by.i, tg: tg.i, level: 1, since: ctx.label, join: [], stopped: null, start: ctx.stepIndex };
    ctx.act2({ actors: [by, tg], cat: 'conflict', mag: 18, fx: function () { ctx.mod(tg, by, { ten: 20, aff: -14 }); ctx.stress(tg, FORMS[1].st); },
      text: ctx.t(FORMS[1].t, by, tg), why: by.name + 'の攻撃性×CP（' + Math.round(by.tr.aggr * 100) + '）。標的になったのは、輪の中で味方の少ない' + tg.name });
  }

  function stop(ctx, B, how, who) {
    B.stopped = { how: how, by: who ? who.i : null, at: ctx.label };
    ctx.flags.bullyEnd = ctx.stepIndex;
    var by = ctx.chars[B.by], tg = ctx.chars[B.tg];
    var lab = { defender: (who ? who.name : '') + 'が止めた', teacher: tg.name + 'が先生に打ち明けて止まった', fight: tg.name + 'がやり返して止まった', bored: by.name + 'が飽きて終わった', absent: tg.name + 'が学校に来なくなって終わった' }[how];
    note(ctx, 'いじめ：' + by.name + '→' + tg.name + '（' + B.since + '〜' + ctx.label + '、段階' + B.level + '）。' + lab + '。' + (B.join.length ? '加わったのは' + B.join.map(function (i) { return ctx.chars[i].name; }).join('・') + '。' : ''));
  }

  function bullyStep(ctx) {
    var B = bullyActive(ctx);
    if (!B) { startBully(ctx); return; }
    if (B.start === ctx.stepIndex) return;
    var by = ctx.chars[B.by], tg = ctx.chars[B.tg], rng = ctx.rng;
    if (!by.alive || by.out) { stop(ctx, B, 'bored'); return; }
    if (tg.out) { stop(ctx, B, 'absent'); return; }
    var others = ctx.present().filter(function (o) { return o !== by && o !== tg && B.join.indexOf(o.i) < 0; });
    var def = ctx.most(others, function (o) { return o.tr.np * 0.6 + o.tr.cp * 0.4 + Math.max(0, R(ctx, o, tg).aff) / 70 + (o.focus === tg ? 0.4 : 0) - o.tr.caution * 0.3; });
    var ds = def ? def.tr.np * 0.6 + def.tr.cp * 0.4 + Math.max(0, R(ctx, def, tg).aff) / 70 + (def.focus === tg ? 0.4 : 0) - def.tr.caution * 0.3 : 0;
    if (def && ds > 0.62 - B.level * 0.04 && rng() < 0.55) {
      ctx.act2({ actors: [def, by, tg], cat: 'help', mag: 25, fx: function () { ctx.mod(tg, def, { aff: 22, trust: 25, att: 8 }); ctx.mod2(def, by, { ten: 20 }, { ten: 22, aff: -10 }); ctx.stress(tg, -20); },
        text: ctx.t('「いい加減にしてよ｜いい加減にしろ｜いい加減にしてください」{a}が{b}の前に立った。教室が静まり返った。それきり、{c}への嫌がらせは止んだ。', def, by, tg), why: def.name + 'のNP・CPと、' + tg.name + 'への好意（' + Math.round(R(ctx, def, tg).aff) + '）' });
      stop(ctx, B, 'defender', def); return;
    }
    if (tg.tr.aggr > 0.58 && rng() < 0.35) {
      ctx.act2({ actors: [tg, by], cat: 'conflict', mag: 20, fx: function () { ctx.mod2(tg, by, { ten: 25 }, { ten: 25, trust: 5 }); ctx.stress(tg, -10); },
        text: ctx.t('{a}は、{b}の机を蹴り倒した。それ以来、{b}は{a}に手を出さなくなった。', tg, by), why: tg.name + 'の攻撃性（CP・FC高）' });
      stop(ctx, B, 'fight'); return;
    }
    if (tg.tr.honesty > 0.55 && rng() < 0.25 + B.level * 0.05) {
      ctx.act2({ actors: [tg, by], cat: 'solo', mag: 15, fx: function () { ctx.mod(by, tg, { ten: 15 }); ctx.stress(by, 15); ctx.stress(tg, -10); },
        text: ctx.t('{a}は担任に全部話した。翌週、{b}は親と一緒に呼び出された。', tg, by), why: tg.name + 'の本音の出やすさ（FC高・AC低）' });
      stop(ctx, B, 'teacher'); return;
    }
    if (rng() < 0.12 + by.tr.np * 0.25) {
      ctx.act2({ actors: [by], cat: 'solo', text: ctx.t('{a}の関心は、いつの間にか別のことに移っていた。', by), why: by.name + 'のNP（' + Math.round(by.eg.NP) + '）が歯止めになった' });
      stop(ctx, B, 'bored'); return;
    }
    B.level = Math.min(4, B.level + 1);
    var F = FORMS[B.level];
    var gang = [by].concat(B.join.map(function (i) { return ctx.chars[i]; }));
    ctx.act2({ actors: gang.concat(tg), cat: 'conflict', mag: 12 + B.level * 4, fx: function () { ctx.mod(tg, by, { ten: 12, aff: -10 }); ctx.stress(tg, F.st); },
      text: ctx.t(F.t, by, tg), why: '誰も止めなかった。いじめは段階' + B.level + 'へ' });
    var j = ctx.most(others, function (o) { return o.tr.ac * 0.5 + (ctx.fac && ctx.fac.of[o.i] != null && ctx.fac.of[o.i] === ctx.fac.of[by.i] ? 0.5 : 0) + R(ctx, o, tg).ten / 80 - Math.max(0, R(ctx, o, tg).aff) / 50 - o.tr.np * 0.4; });
    if (j && j.tr.ac + (ctx.fac && ctx.fac.of[j.i] === ctx.fac.of[by.i] ? 0.3 : 0) - j.tr.np * 0.5 > 0.3 && rng() < 0.5) {
      B.join.push(j.i);
      var wasFriend = R(ctx, j, tg).aff > 10;
      ctx.act2({ actors: [j, tg], cat: 'betray', odd: j.tr.np > 0.55, fx: function () { ctx.mod(tg, j, { trust: -25, aff: -15, ten: 15 }); ctx.mod2(j, by, { trust: 6 }, { trust: 4 }); },
        text: ctx.t(wasFriend ? '前は{b}と弁当を食べていた{a}も、いつからか一緒に笑うようになった。' : '{a}も、{b}を見て笑うようになった。', j, tg), why: j.name + 'のAC（' + Math.round(j.eg.AC) + '）：輪から外れるのが怖い' });
    }
    var secret = ctx.most(others.filter(function (o) { return o !== j; }), function (o) { return Math.max(0, R(ctx, o, tg).aff) / 50 + o.tr.np * 0.4; });
    if (secret && R(ctx, secret, tg).aff > 18 && secret.tr.caution > 0.5) {
      ctx.act2({ actors: [secret, tg], cat: 'help', fx: function () { ctx.mod(tg, secret, { aff: 10, trust: 12 }); ctx.stress(tg, -8); ctx.stress(secret, 6); },
        text: ctx.t('夜、{b}のスマホに{a}から短いメッセージが届いた。「教室では話せなくてごめん｜教室では話せなくてすまない｜教室では話せなくてすみません」', secret, tg), why: secret.name + 'の慎重さと、' + tg.name + 'への好意。表では動けない' });
    }
  }

  /* ======================= 不登校 ======================= */
  function absenceStep(ctx) {
    var C = ctx.chars, B = bullyActive(ctx);
    C.forEach(function (c) {
      if (!c.alive || c.flags.teacher) return;
      if (!c.out) {
        var victim = B && B.tg === c.i && B.level >= 2;
        if (c.stress >= 62 + c.tr.cp * 10 - c.tr.ac * 6 || (victim && c.stress >= 32 + c.tr.cp * 15 - B.level * 4)) {
          c.out = true; c.flags.absent = { since: ctx.label, months: 0 };
          ctx.act2({ actors: [c], cat: 'solo', mag: 20, fx: function () { ctx.chars.forEach(function (o) { if (o !== c && o.alive && R(ctx, o, c).aff > 30) ctx.stress(o, 10); }); },
            text: ctx.t('{a}の席が、朝から空いていた。次の日も、その次の日も。', c), why: victim ? 'いじめ（段階' + B.level + '）と限界を越えた負担（' + Math.round(c.stress) + '）' : '積もった負担（' + Math.round(c.stress) + '）' });
        }
        return;
      }
      if (!c.flags.absent) return;
      c.flags.absent.months++;
      var P = ctx.present();
      var v = ctx.most(P, function (o) { return Math.max(0, R(ctx, o, c).aff) / 60 + o.tr.np * 0.5 + (o.focus === c ? 0.6 : 0); });
      var vs = v ? Math.max(0, R(ctx, v, c).aff) / 60 + v.tr.np * 0.5 + (v.focus === c ? 0.6 : 0) : 0;
      if (v && vs > 0.55 && ctx.rng() < 0.65) {
        var opened = R(ctx, c, v).trust > 10 || c.flags.absent.months > 1;
        ctx.act2({ actors: [v, c], cat: 'help', mag: 12, fx: function () { ctx.stress(c, opened ? -22 : -8); ctx.mod2(v, c, { aff: 4 }, { aff: opened ? 14 : 4, trust: opened ? 16 : 4, att: opened ? 5 : 0 }); },
          text: ctx.t(opened ? '{a}がプリントを届けに来た。{b}は玄関まで出てきて、少しだけ話をした。' : '{a}がプリントを届けに来た。{b}の部屋の窓は、最後まで開かなかった。', v, c), why: v.name + 'の' + (v.focus === c ? '目標（' + c.name + 'を見守る）' : 'NPと' + c.name + 'への好意') });
      } else c.stress = HK.clamp(c.stress - 2, 0, 100);
      var still = bullyActive(ctx) && bullyActive(ctx).tg === c.i;
      if (c.stress < 45 && !still) {
        c.out = false;
        var since = c.flags.absent.since;
        c.flags.absent = null; c.flags.returned = since;
        ctx.act2({ actors: [c], cat: 'bond', mag: 15, fx: function () { ctx.present().forEach(function (o) { if (o !== c && o.tr.np > 0.5) ctx.mod(c, o, { aff: 4 }); }); },
          text: ctx.t('{a}が、' + since + '以来はじめて教室のドアを開けた。何人かが「おはよう｜＝｜おはようございます」と言った。', c), why: '負担が下がった（' + Math.round(c.stress) + '）' });
        note(ctx, c.name + 'は' + since + 'から学校を休んでいたが、' + ctx.label + 'に戻ってきた。');
      }
    });
  }

  L.after = function (ctx) {
    ctx.present().forEach(function (c) { c.stress = HK.clamp(c.stress + 1 + c.tr.ac * 3 + (gr(ctx, c) === 3 ? 2 : 0) + (50 - ctx.env.climate) / 25, 0, 100); });
    bullyStep(ctx);
    ctx.flush();
    absenceStep(ctx);
    ctx.flush();
  };

  L.finish = function (ctx) {
    var B = ctx.flags.bully;
    if (B && !B.stopped) note(ctx, 'いじめ：' + ctx.chars[B.by].name + '→' + ctx.chars[B.tg].name + '（' + B.since + '〜、段階' + B.level + '）。年度末まで、誰も止められなかった。' + (B.join.length ? '加わったのは' + B.join.map(function (i) { return ctx.chars[i].name; }).join('・') + '。' : ''));
    ctx.chars.forEach(function (c) {
      if (c.alive && c.out && c.flags.absent) {
        c.fate = '不登校';
        c.fateNote = c.flags.absent.since + 'から学校に来ていない';
        note(ctx, c.name + 'は' + c.flags.absent.since + 'から不登校のまま年度を終えた。');
      }
    });
  };
})();
