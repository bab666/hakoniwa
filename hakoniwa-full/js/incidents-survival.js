/* 箱庭診断: 全員に降りかかる出来事（無人島。バトルロワイヤルは incidents-br.js に分けた） */
(function () {
  'use strict';
  var HK = window.HK;
  HK.INCIDENTS = HK.INCIDENTS || {};
  function R(ctx, a, b) { return ctx.R(a, b); }
  function names(list) { return list.map(function (c) { return c.name; }).join('・'); }
  function hurt(ctx, c, v, how) { c.hp -= v; if (c.hp <= 0 && c.alive) ctx.kill(c, null, how); }
  function without(list, x) { return list.filter(function (c) { return x.indexOf ? x.indexOf(c) < 0 : c !== x; }); }
  function fav(ctx, a, pool) {
    var best = null, bv = 25;
    pool.forEach(function (o) { if (o === a) return; var r = R(ctx, a, o), v = r.aff * 0.6 + r.att; if (v > bv) { bv = v; best = o; } });
    return best;
  }

  /* ======================= 無人島 ======================= */
  HK.INCIDENTS.island = [
    {
      id: 'storm', once: false,
      force: function (ctx, s) { return s > 0 && ctx.rng() < ctx.env.storm / 100 * 0.38; },
      run: function (ctx) {
        var P = ctx.present(), rng = ctx.rng;
        ctx.incident('夜半から嵐になった。雨が横殴りに叩きつけ、拠点の屋根が軋んでいる。');
        var weak = P.slice().sort(function (x, y) { return x.hp - y.hp; })[0];
        var guard = ctx.most(without(P, [weak]), function (c) { return c.tr.np + c.tr.cp * 0.3; });
        var keeper = ctx.most(without(P, [weak, guard]), function (c) { return c.tr.a + c.tr.caution * 0.5; });
        var panic = ctx.most(P, function (c) { return c.tr.ac * 0.6 + c.tr.impulse * 0.4 + c.stress / 100; });
        var loner = ctx.most(P, function (c) { return c.tr.cold; });
        var spared = {};
        if (guard && guard.tr.np > 0.45) {
          spared[weak.i] = 1;
          ctx.act2({ actors: [guard, weak], cat: 'help', fx: function () { hurt(ctx, guard, 6, '嵐の中で' + weak.name + 'をかばい続けた'); ctx.mod2(guard, weak, { aff: 4 }, { aff: 12, trust: 14, att: 4 }); },
            text: ctx.t('{a}は、一番弱っていた{b}を壁際に押しやり、自分の体で雨風を受けた。', guard, weak), why: guard.name + 'のNP（' + Math.round(guard.eg.NP) + '）。' + weak.name + 'の体力が最も低かった' });
        }
        var saved = false;
        if (keeper && keeper.tr.a > 0.5) {
          saved = true;
          ctx.act2({ actors: [keeper], cat: 'help', fx: function () { ctx.others(keeper).forEach(function (o) { ctx.mod(o, keeper, { trust: 4 }); }); },
            text: ctx.t('{a}は真っ先に食料を岩陰へ運んでいた。人より先に物資を守る判断だった。', keeper), why: keeper.name + 'のA（' + Math.round(keeper.eg.A) + '）：優先順位をつけるのが早い' });
        }
        if (panic && panic.stress > 25 && panic.tr.ac + panic.tr.impulse > 0.9) {
          var holder = ctx.closest(panic);
          ctx.act2({ actors: [panic, holder], cat: 'solo', fx: function () { if (holder) ctx.mod2(panic, holder, { trust: 8, att: 3 }, { aff: 3 }); ctx.stress(panic, 10); },
            text: holder ? ctx.t('{a}が叫んで外へ飛び出しかけた。{b}がその腕を掴んで引き戻した。', panic, holder) : ctx.t('{a}は叫び声を上げて、膝を抱えた。', panic),
            why: panic.name + 'のAC・衝動性と溜まった焦り（' + Math.round(panic.stress) + '）' });
        }
        if (loner && loner.tr.cold > 0.65 && loner !== guard) {
          ctx.act2({ actors: [loner], cat: 'solo', fx: function () { ctx.others(loner).forEach(function (o) { ctx.mod(o, loner, { aff: -5, ten: 4 }); }); },
            text: ctx.t('朝になって、{a}が一人で奥の洞窟に避難していたことが分かった。', loner), why: loner.name + 'のドライさ（A高・NP低）' });
        }
        ctx.food = Math.max(0, ctx.food - (saved ? 6 : 16));
        P.forEach(function (c) {
          if (!c.alive || spared[c.i]) return;
          c.stress = HK.clamp(c.stress + 12, 0, 100);
          hurt(ctx, c, 5 + rng() * 10 * (1.4 - ctx.stat(c, 'hp') * 0.15), '嵐の夜に力尽きた');
        });
        ctx.say({ text: saved ? '嵐が去ったあと確かめると、食料はなんとか半分残っていた。' : '嵐が去ったあと確かめると、蓄えていた食料の多くが波にさらわれていた。' });
      }
    },
    {
      id: 'famine',
      force: function (ctx, s) { return s >= 2 && ctx.food < 8; },
      min: 2,
      run: function (ctx) {
        var P = ctx.present();
        ctx.incident(ctx.few() ? '食料が底をついた。二人は焚き火の前で顔を見合わせた。' : '食料が底をついた。全員が焚き火の前に集まった。');
        var lead = ctx.most(P, function (c) { return c.tr.lead; });
        ctx.act2({ actors: [lead], cat: 'conflict', fx: function () {
          ctx.others(lead).forEach(function (o) { if (o.tr.fc > 0.6 && o.tr.ac < 0.5) ctx.mod(o, lead, { ten: 10 }); else ctx.mod(o, lead, { trust: 5 }); });
        }, text: ctx.t('{a}が配給制を提案した。一日に貝ふたつ。反論する者もいたが、他に案はなかった。', lead), why: lead.name + 'の主導性（CP・A）' });
        var giver = ctx.most(without(P, [lead]).concat(lead), function (c) { return c.tr.np - c.tr.cold * 0.5; });
        var weak = P.slice().sort(function (x, y) { return x.hp - y.hp; })[0];
        if (giver && giver !== weak && giver.tr.np > 0.55) {
          ctx.act2({ actors: [giver, weak], cat: 'help', mag: 10, fx: function () { giver.hp -= 10; weak.hp = Math.min(100, weak.hp + 10); ctx.mod2(giver, weak, { aff: 5 }, { aff: 16, trust: 16, att: 6 }); },
            text: ctx.t('その夜、{a}は自分の分を黙って{b}の横に置いた。{b}が気づいたのは翌朝だった。', giver, weak), why: giver.name + 'のNP（' + Math.round(giver.eg.NP) + '）。自分の体力（' + Math.round(giver.hp) + '）より相手を優先した' });
        }
        var grab = ctx.most(P, function (c) { return c.tr.aggr * 0.6 + c.tr.cold * 0.4; });
        if (grab && grab.tr.aggr > 0.6 && grab !== giver) {
          var who = ctx.most(ctx.others(grab), function (o) { return o.tr.cp + o.tr.a * 0.5; });
          ctx.act2({ actors: [grab, who], cat: 'conflict', fx: function () { grab.hp += 6; ctx.others(grab).forEach(function (o) { ctx.mod(o, grab, { trust: -12, ten: 10 }); }); ctx.mod2(who, grab, { ten: 15 }, { ten: 10 }); },
            text: ctx.t('配給の貝を一つ余計に取った{a}を、{b}が見逃さなかった。「数えてるんだよ｜数えているんだ｜数えているんですよ」', grab, who), why: grab.name + 'の攻撃性・ドライさ／' + who.name + 'のCP・A（不正を許さない）' });
        }
        ctx.food += 6;
        P.forEach(function (c) { c.stress = HK.clamp(c.stress + 10, 0, 100); });
      }
    },
    {
      id: 'crate', from: 1,
      run: function (ctx) {
        var P = ctx.present(), rng = ctx.rng;
        var kinds = ['酒', 'ナイフ', '無線機', '日記', '缶詰'];
        var kind = rng.pick(kinds);
        var label = { '酒': 'ウイスキーの瓶が三本', 'ナイフ': '大ぶりのナイフが一本', '無線機': '壊れた無線機', '日記': '前にこの島へ流れ着いた誰かの日記', '缶詰': '缶詰が十数個' }[kind];
        var opener = ctx.most(P, function (c) { return c.tr.fc + c.tr.impulse * 0.5; });
        ctx.incident('浜に木箱が打ち上げられていた。');
        ctx.act2({ actors: [opener], cat: 'solo', text: ctx.t('真っ先に駆け寄って蓋をこじ開けたのは{a}だった。中には、' + label + '。', opener), why: opener.name + 'のFC（好奇心）' });
        if (kind === '酒') {
          var pairs = [];
          ctx.act2({ actors: P, cat: 'bond', fx: function () {
            P.forEach(function (a) { ctx.stress(a, -18); P.forEach(function (b) { if (a !== b && R(ctx, a, b).att > 20) { ctx.mod(a, b, { att: 7 }); pairs.push([a, b]); } }); });
          }, text: 'その夜は小さな宴になった。久しぶりに誰かが笑った。', why: '酒と島の緊張の反動' });
          var drunk = ctx.most(P, function (c) { return c.tr.impulse + c.tr.honesty * 0.5; });
          var tg = fav(ctx, drunk, P);
          if (tg) ctx.act2({ actors: [drunk, tg], cat: 'romance', fx: function () { ctx.mod2(drunk, tg, { att: 6 }, { att: R(ctx, tg, drunk).att > 25 ? 10 : 2, aff: 3 }); },
            text: ctx.t('酔った{a}が{b}の肩にもたれて、何か言いかけて、やめた。', drunk, tg), why: drunk.name + 'の衝動性と、' + tg.name + 'への惹かれ（' + Math.round(R(ctx, drunk, tg).att) + '）' });
        } else if (kind === 'ナイフ') {
          var taker = ctx.most(P, function (c) { return c.tr.cp + c.tr.aggr * 0.6; });
          ctx.act2({ actors: [taker], cat: 'conflict', fx: function () {
            taker.flags.knife = true;
            ctx.others(taker).forEach(function (o) { if (o.tr.caution > 0.55) ctx.mod(o, taker, { ten: 10, trust: -6 }); else ctx.mod(o, taker, { trust: 3 }); });
          }, text: ctx.t('ナイフは{a}が預かることになった。「私が持ってるのが一番安全｜私が持っているのが一番安全だ｜私が持っているのが一番安全です」と言って。', taker), why: taker.name + 'のCP×攻撃性。慎重な者ほど警戒した' });
        } else if (kind === '無線機') {
          var fixer = ctx.most(P, function (c) { return c.tr.a + ctx.stat(c, 'know') * 0.15; });
          var ok = rng() < 0.2 + ctx.stat(fixer, 'know') * 0.1 + fixer.tr.a * 0.25;
          ctx.act2({ actors: [fixer], cat: 'escape', mag: ok ? 25 : 0, fx: function () {
            if (ok) { ctx.flags.radio = true; P.forEach(function (o) { ctx.stress(o, -20); if (o !== fixer) ctx.mod(o, fixer, { trust: 10, aff: 6 }); }); }
            else ctx.stress(fixer, 10);
          }, text: ok ? ctx.t('{a}が二晩かけて無線機を直した。雑音の向こうで、確かに誰かが応答した。', fixer) : ctx.t('{a}は無線機を分解して、また組み立てた。何度やっても雑音しか出なかった。', fixer), why: fixer.name + 'のA／サバイバル知識 ' + ctx.stat(fixer, 'know') });
        } else if (kind === '日記') {
          var reader = ctx.most(P, function (c) { return c.tr.a; });
          var sus = ctx.most(P, function (c) { return c.tr.jealous; });
          var tgt = ctx.most(ctx.others(sus), function (o) { return R(ctx, sus, o).ten - R(ctx, sus, o).trust * 0.5; });
          ctx.act2({ actors: [reader], cat: 'solo', fx: function () { P.forEach(function (o) { ctx.stress(o, 12); }); },
            text: ctx.t('{a}が日記を読み上げた。前の漂流者たちは、最後の十日間で互いを疑い始め、一人ずつ減っていったらしい。', reader), why: '島に流れ着いた過去の記録' });
          if (tgt) ctx.act2({ actors: [sus, tgt], cat: 'conflict', fx: function () { ctx.mod2(sus, tgt, { ten: 12, trust: -10 }, { ten: 5 }); },
            text: ctx.t('その夜から、{a}は{b}が眠るまで目を閉じなくなった。', sus, tgt), why: sus.name + 'の嫉妬・執着（疑い深さ）' });
        } else {
          var dist = ctx.most(P, function (c) { return c.tr.np + c.tr.lead * 0.5; });
          ctx.food += 28;
          ctx.act2({ actors: [dist], cat: 'help', fx: function () { ctx.others(dist).forEach(function (o) { ctx.mod(o, dist, { trust: 5, aff: 3 }); }); },
            text: ctx.t('缶詰は{a}がきっちり人数分に分けた。', dist), why: dist.name + 'のNP・主導性' });
        }
      }
    },
    {
      id: 'beast', from: 1,
      w: function (ctx) { return 0.8 + ctx.env.storm / 200; },
      run: function (ctx) {
        var P = ctx.present(), rng = ctx.rng;
        var victim = rng.pick(P);
        var rescuer = ctx.most(ctx.others(victim), function (o) { return o.tr.np * 0.5 + o.tr.aggr * 0.5 + Math.max(0, R(ctx, o, victim).aff) / 80; });
        var runner = ctx.most(without(P, [victim, rescuer]), function (o) { return o.tr.caution; });
        ctx.incident('森の奥から、猪が飛び出してきた。');
        if (rescuer && rescuer.tr.np * 0.5 + rescuer.tr.aggr * 0.5 > 0.45) {
          ctx.act2({ actors: [rescuer, victim], cat: 'help', mag: 12, fx: function () { hurt(ctx, rescuer, 8 + rng() * 10, '猪に突かれた傷がもとで'); ctx.mod2(rescuer, victim, { aff: 5 }, { aff: 14, trust: 14, att: 6 }); },
            text: ctx.t('牙が{b}に向かった瞬間、{a}が流木で猪を殴りつけた。猪は逃げ、{a}の腕には深い傷が残った。', rescuer, victim), why: rescuer.name + 'の' + (rescuer.tr.np > rescuer.tr.aggr ? 'NP（守りたい）' : '攻撃性（迷わず殴る）') });
        } else {
          ctx.act2({ actors: [victim], cat: 'solo', fx: function () { hurt(ctx, victim, 18, '猪に襲われた傷がもとで'); },
            text: ctx.t('{a}は猪の牙に脚をやられた。誰も間に合わなかった。', victim), why: '偶然' });
        }
        if (runner && runner !== rescuer && runner.tr.caution > 0.6) {
          ctx.act2({ actors: [runner, victim], cat: 'solo', fx: function () { ctx.mod(victim, runner, { aff: -8, ten: 8 }); },
            text: ctx.t('猪が暴れているあいだ、{a}は一人で木の上に逃げていた。{b}は、そのことを忘れなかった。', runner, victim), why: runner.name + 'の慎重さ（' + Math.round(runner.tr.caution * 100) + '）' });
        }
      }
    },
    {
      id: 'mushroom',
      run: function (ctx) {
        var P = ctx.present();
        var eater = ctx.most(P, function (c) { return c.tr.impulse + (1 - c.tr.a) * 0.5 + c.stress / 150; });
        var nurse = ctx.most(ctx.others(eater), function (o) { return o.tr.np; });
        var mock = ctx.most(ctx.others(eater), function (o) { return o.tr.cp * (1 - o.tr.np); });
        ctx.incident('森で、見たことのない色のキノコが見つかった。');
        ctx.act2({ actors: [eater], cat: 'solo', fx: function () { hurt(ctx, eater, 22, '毒キノコに当たって'); ctx.stress(eater, 15); },
          text: ctx.t('止める間もなく{a}が一口かじった。一時間後、{a}は激しく吐いていた。', eater), why: eater.name + 'の衝動性（FC高・A低）と空腹' });
        if (eater.alive && nurse && nurse.tr.np > 0.45) ctx.act2({ actors: [nurse, eater], cat: 'help', fx: function () { eater.hp += 10; ctx.mod2(nurse, eater, { aff: 3 }, { aff: 12, trust: 12 }); },
          text: ctx.t('{a}は{b}の背中をさすり続け、真水を少しずつ飲ませた。', nurse, eater), why: nurse.name + 'のNP' });
        if (eater.alive && mock && mock !== nurse && mock.tr.cp > 0.6) ctx.act2({ actors: [mock, eater], cat: 'conflict', fx: function () { ctx.mod(eater, mock, { ten: 12, aff: -6 }); },
          text: ctx.t('「だから言ったじゃん｜だから言っただろう｜だから言ったでしょう」と{a}が吐き捨てた。{b}は言い返す気力もなかった。', mock, eater), why: mock.name + 'のCP高・NP低' });
      }
    },
    {
      id: 'ship', from: 1,
      run: function (ctx) {
        var P = ctx.present();
        var sig = ctx.most(P, function (c) { return c.tr.a + c.tr.lead * 0.5; });
        ctx.incident('水平線に船影が見えた。');
        ctx.act2({ actors: [sig], cat: 'escape', text: ctx.t(ctx.few() ? '{a}が真っ先に狼煙を上げた。二人で浜に並び、声が嗄れるまで叫んだ。' : '{a}が真っ先に狼煙を上げた。全員で浜に並び、声が嗄れるまで叫んだ。', sig), why: sig.name + 'のA・主導性' });
        ctx.say({ text: '船は、こちらに気づかないまま遠ざかっていった。' });
        P.forEach(function (c) { c.stress = HK.clamp(c.stress + 16, 0, 100); });
        var blamer = ctx.most(ctx.others(sig), function (o) { return o.tr.aggr + o.stress / 100; });
        if (blamer && blamer.tr.aggr > 0.55) ctx.act2({ actors: [blamer, sig], cat: 'conflict', fx: function () { ctx.mod2(blamer, sig, { ten: 14, aff: -6 }, { ten: 10 }); },
          text: ctx.t('「火を焚くのが遅かったんだ｜火を焚くのが遅かった｜火を焚くのが遅かったんです」{a}は{b}のせいにした。', blamer, sig), why: blamer.name + 'の攻撃性と失望' });
        var comf = ctx.most(P, function (c) { return c.tr.np + c.tr.fc * 0.3; });
        var low = ctx.most(ctx.others(comf), function (o) { return o.stress; });
        if (comf && low && comf.tr.np > 0.5) ctx.act2({ actors: [comf, low], cat: 'help', fx: function () { ctx.stress(low, -15); ctx.mod(low, comf, { aff: 8, trust: 8 }); },
          text: ctx.t('砂浜に座り込んだ{b}の隣に、{a}が黙って腰を下ろした。「次は気づいてもらえる｜＝｜次は気づいてもらえます」', comf, low), why: comf.name + 'のNP' });
      }
    },
    {
      id: 'water', min: 2,
      run: function (ctx) {
        var P = ctx.present();
        var lead = ctx.most(P, function (c) { return c.tr.lead + c.tr.fc * 0.3; });
        var mate = ctx.most(ctx.others(lead), function (o) { return R(ctx, lead, o).trust + R(ctx, lead, o).att * 0.5; });
        ctx.incident('湧き水が濁り始めた。新しい水源を探しに行く必要がある。');
        var found = ctx.rng() < 0.45 + (ctx.stat(lead, 'know') + ctx.stat(mate, 'know')) * 0.05;
        ctx.act2({ actors: [lead, mate], cat: R(ctx, lead, mate).att > 30 ? 'romance' : 'bond', fx: function () {
          ctx.mod2(lead, mate, { trust: 10, att: 4, aff: 5 }, { trust: 10, att: 4, aff: 5 });
          if (found) P.forEach(function (c) { c.hp = Math.min(100, c.hp + 8); }); else { lead.hp -= 6; mate.hp -= 6; }
        }, text: ctx.t('{a}は{b}を連れて島の奥へ向かった。' + (found ? '崖の下で澄んだ湧き水を見つけ、二人で頭から浴びた。' : '一晩、岩陰で身を寄せ合って過ごし、何も見つけられずに戻った。'), lead, mate), why: lead.name + 'が最も信頼していた相手を選んだ' });
        P.forEach(function (o) {
          if (o === lead || o === mate) return;
          var c = ctx.crush(o, 55);
          if (c === lead || c === mate) ctx.act2({ actors: [o, c === lead ? mate : lead], cat: 'conflict', fx: function () { ctx.mod(o, c === lead ? mate : lead, { ten: 10 }); ctx.pair(o, c === lead ? mate : lead).jealous++; },
            text: ctx.t('二人が戻るまで、{a}は一度も森の入り口から目を離さなかった。', o), why: o.name + 'は' + c.name + 'に惹かれていた' });
        });
      }
    },
    {
      id: 'vote', min: 3, from: 2,
      run: function (ctx) {
        var P = ctx.present(), votes = {}, lines = [];
        ctx.incident('誰がこの島のまとめ役になるか、決めることになった。');
        P.forEach(function (a) {
          var pick = a.tr.cp > 0.75 && a.tr.ac < 0.35 ? a : ctx.most(ctx.others(a), function (o) { return R(ctx, a, o).trust + R(ctx, a, o).aff * 0.4 + o.tr.lead * 20; });
          votes[pick.i] = (votes[pick.i] || 0) + 1;
          lines.push(a.name + '→' + pick.name);
        });
        var win = ctx.most(P, function (c) { return (votes[c.i] || 0) * 10; });
        ctx.act2({ actors: [win], cat: 'bond', mag: 10, fx: function () { win.flags.leader = true; ctx.stress(win, 8); },
          text: ctx.t('まとめ役は{a}に決まった（' + lines.join('、') + '）。', win), why: '信頼と主導性で投票' });
        P.forEach(function (o) {
          if (o === win || o.tr.lead < 0.62) return;
          ctx.act2({ actors: [o, win], cat: 'conflict', fx: function () { ctx.mod(o, win, { ten: 14 }); },
            text: ctx.t('まとめ役が決まって皆が拍手する中、{a}だけは手を叩かなかった。', o), why: o.name + 'も主導性が高い（CP・A高、AC低）' });
        });
      }
    },
    {
      id: 'campfire', min: 2,
      run: function (ctx) {
        var P = ctx.present();
        ctx.incident('風の止んだ夜、焚き火を囲んで、島に来る前の話をした。');
        var talker = ctx.most(P, function (c) { return c.tr.honesty + c.stress / 200; });
        var silent = ctx.most(ctx.others(talker), function (c) { return c.tr.cold + (1 - c.tr.honesty) * 0.5; });
        ctx.act2({ actors: [talker], cat: 'bond', fx: function () { ctx.others(talker).forEach(function (o) { ctx.mod(o, talker, { trust: 7, aff: 4 }); }); },
          text: ctx.t('{a}は、帰っても誰も待っていないのだと笑って言った。火の粉がはぜる音だけが返ってきた。', talker), why: talker.name + 'の本音の出やすさ（FC高・AC低）' });
        if (silent && silent.tr.cold > 0.5) {
          var asker = ctx.most(ctx.others(silent), function (o) { return R(ctx, o, silent).att + o.tr.np * 20; });
          ctx.act2({ actors: [silent, asker], cat: 'solo', fx: function () { ctx.mod(asker, silent, { att: 4, trust: -2 }); },
            text: ctx.t('{a}は自分の番が来ても話さなかった。{b}だけが、その横顔をしばらく見ていた。', silent, asker), why: silent.name + 'のドライさ。' + asker.name + 'の関心' });
        }
      }
    },
    {
      id: 'fever', from: 2,
      run: function (ctx) {
        var P = ctx.present();
        var sick = ctx.most(P, function (c) { return (100 - c.hp) / 100 + (5 - ctx.stat(c, 'hp')) * 0.1; });
        ctx.incident('朝になって、' + sick.name + 'が高熱を出して起き上がれなくなった。');
        var carers = ctx.others(sick).filter(function (o) { return o.tr.np > 0.5 || R(ctx, o, sick).aff > 35; });
        var avoid = ctx.others(sick).filter(function (o) { return carers.indexOf(o) < 0 && o.tr.caution > 0.55; });
        hurt(ctx, sick, 14, '熱が下がらないまま');
        /* 熱で亡くなったら、看病は最初の一人だけ（その看病のあとに死の記録が出る）。亡くなった人の寝床を移す場面も出さない */
        carers.slice(0, 2).forEach(function (c, k) {
          if (k > 0 && !sick.alive) return;
          ctx.act2({ actors: [c, sick], cat: 'help', fx: function () { sick.hp += 6; c.hp -= 4; ctx.mod2(c, sick, { aff: 4 }, { aff: 10, trust: 10, att: 4 }); },
            text: ctx.t('{a}は一晩中、{b}の額の布を替え続けた。', c, sick), why: c.name + (c.tr.np > 0.5 ? 'のNP' : 'の' + sick.name + 'への好意') });
        });
        if (!sick.alive) { ctx.flush(); return; }
        if (avoid.length) ctx.act2({ actors: [avoid[0], sick], cat: 'solo', fx: function () { ctx.mod(sick, avoid[0], { aff: -5 }); },
          text: ctx.t('{a}は「うつると困る｜＝｜うつると困ります」と言って、寝床を離れた場所に移した。', avoid[0], sick), why: avoid[0].name + 'の慎重さ' });
      }
    }
  ];
  /* 2026-10-27（分割読み込みの第3段）：バトルロワイヤルの表（全年齢版だけの箱庭）は incidents-br.js（scen-br。このファイルのすぐ後）に分けた */
})();
