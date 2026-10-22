/* 箱庭診断: 全員に降りかかる出来事（無人島／バトルロワイヤル） */
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
            text: ctx.t('配給の貝を一つ余計に取った{a}を、{b}が見逃さなかった。「数えてるんだぞ」', grab, who), why: grab.name + 'の攻撃性・ドライさ／' + who.name + 'のCP・A（不正を許さない）' });
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
          }, text: ctx.t('ナイフは{a}が預かることになった。「俺が持っているのが一番安全だ」と言って。', taker), why: taker.name + 'のCP×攻撃性。慎重な者ほど警戒した' });
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
          text: ctx.t('「だから言っただろ」と{a}が吐き捨てた。{b}は言い返す気力もなかった。', mock, eater), why: mock.name + 'のCP高・NP低' });
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
          text: ctx.t('「火を焚くのが遅かったんだ」{a}は{b}のせいにした。', blamer, sig), why: blamer.name + 'の攻撃性と失望' });
        var comf = ctx.most(P, function (c) { return c.tr.np + c.tr.fc * 0.3; });
        var low = ctx.most(ctx.others(comf), function (o) { return o.stress; });
        if (comf && low && comf.tr.np > 0.5) ctx.act2({ actors: [comf, low], cat: 'help', fx: function () { ctx.stress(low, -15); ctx.mod(low, comf, { aff: 8, trust: 8 }); },
          text: ctx.t('砂浜に座り込んだ{b}の隣に、{a}が黙って腰を下ろした。「次は気づいてもらえる」', comf, low), why: comf.name + 'のNP' });
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
        carers.slice(0, 2).forEach(function (c) {
          ctx.act2({ actors: [c, sick], cat: 'help', fx: function () { sick.hp += 6; c.hp -= 4; ctx.mod2(c, sick, { aff: 4 }, { aff: 10, trust: 10, att: 4 }); },
            text: ctx.t('{a}は一晩中、{b}の額の布を替え続けた。', c, sick), why: c.name + (c.tr.np > 0.5 ? 'のNP' : 'の' + sick.name + 'への好意') });
        });
        if (avoid.length) ctx.act2({ actors: [avoid[0], sick], cat: 'solo', fx: function () { ctx.mod(sick, avoid[0], { aff: -5 }); },
          text: ctx.t('{a}は「うつると困る」と言って、寝床を離れた場所に移した。', avoid[0], sick), why: avoid[0].name + 'の慎重さ' });
      }
    }
  ];

  /* ======================= バトルロワイヤル（主催者のゲーム） ======================= */
  HK.INCIDENTS.br = [
    {
      id: 'vote', min: 3, from: 2,
      w: function () { return 1.2; },
      run: function (ctx) {
        var P = ctx.present(), votes = {}, ballots = [];
        ctx.incident('放送：「特別ゲーム。生存者全員で投票し、最多票の一名を処刑する。白票は本人の首輪を作動させる」');
        P.forEach(function (a) {
          var pick = ctx.most(ctx.others(a), function (o) { var r = R(ctx, a, o); return r.ten - r.aff * 0.6 - r.trust * 0.3 + (a.flags.revenge === o.i ? 60 : 0); });
          votes[pick.i] = (votes[pick.i] || 0) + 1;
          ballots.push({ a: a, b: pick });
        });
        var top = ctx.most(P, function (c) { return (votes[c.i] || 0) * 10; });
        var max = votes[top.i];
        var tied = P.filter(function (c) { return votes[c.i] === max; });
        if (ballots.length <= 8) ctx.say({ text: '開票：' + ballots.map(function (x) { return x.a.name + '→' + x.b.name; }).join('、') });
        else ctx.say({ text: '開票：' + P.filter(function (c) { return votes[c.i]; }).sort(function (x, y) { return votes[y.i] - votes[x.i]; }).slice(0, 5).map(function (c) { return c.name + ' ' + votes[c.i] + '票'; }).join('、') + (P.length > 5 ? 'ほか' : '') });
        var shown = 0;
        ballots.forEach(function (x) {
          var r = R(ctx, x.a, x.b);
          if (r.aff > 20 && shown++ < 6) ctx.act2({ actors: [x.a, x.b], cat: 'betray', odd: true, fx: function () { ctx.mod(x.b, x.a, { trust: -30, ten: 25, aff: -15 }); },
            text: ctx.t('{a}は、好意を持っていたはずの{b}の名前を書いていた。', x.a, x.b), why: '生き残るための計算。' + x.a.name + 'の' + (x.a.tr.cold > 0.55 ? 'ドライさ' : '恐怖') });
          else ctx.act2({ actors: [x.a, x.b], cat: 'conflict', fx: function () { ctx.mod(x.b, x.a, { ten: 10, trust: -8 }); }, text: '', why: '' });
        });
        if (tied.length > 1) {
          ctx.say({ text: '同票。' + names(tied) + 'の首輪から電流が流れた。' });
          tied.forEach(function (c) { hurt(ctx, c, 28, '投票ゲームの電流で'); });
        } else {
          ctx.kill(top, null, '投票ゲームで処刑された（' + max + '票）');
          P.forEach(function (o) {
            if (o === top || !o.alive || R(ctx, o, top).aff < 35) return;
            ballots.forEach(function (x) { if (x.b === top && x.a !== o) { ctx.k = 1; ctx.mod(o, x.a, { ten: 20, aff: -12 }); o.flags.revenge = x.a.i; } });
          });
        }
      }
    },
    {
      id: 'dilemma', min: 2,
      run: function (ctx) {
        var P = ctx.present(), rng = ctx.rng;
        var a = rng.pick(P), b = ctx.most(ctx.others(a), function (o) { return Math.abs(R(ctx, a, o).aff) + R(ctx, a, o).ten; });
        ctx.incident('放送：「' + a.name + 'と' + b.name + 'は別々の部屋へ。『信じる』か『裏切る』か、ボタンを一つ押せ」');
        function choose(x, y) { var r = R(ctx, x, y); return r.trust + x.tr.np * 40 - x.tr.cold * 30 - (x.goal.id === 'last' ? 25 : 0) + rng() * 30 * (0.5 + ctx.chaos) > 25; }
        var ca = choose(a, b), cb = choose(b, a);
        var txt, why;
        if (ca && cb) {
          txt = '二人とも『信じる』を押した。扉が開き、二人分の水と食料が置かれていた。';
          ctx.act2({ actors: [a, b], cat: 'bond', mag: 15, fx: function () { a.hp = Math.min(100, a.hp + 15); b.hp = Math.min(100, b.hp + 15); ctx.mod2(a, b, { trust: 25, aff: 10 }, { trust: 25, aff: 10 }); }, text: txt, why: '互いの信頼（' + Math.round(R(ctx, a, b).trust) + '／' + Math.round(R(ctx, b, a).trust) + '）' });
        } else if (!ca && !cb) {
          ctx.act2({ actors: [a, b], cat: 'betray', fx: function () { hurt(ctx, a, 30, '信頼ゲームの罰で'); hurt(ctx, b, 30, '信頼ゲームの罰で'); ctx.mod2(a, b, { ten: 15 }, { ten: 15 }); },
            text: '二人とも『裏切る』を押した。両方の首輪が鳴った。', why: '互いに相手を信じきれなかった' });
        } else {
          var tr = ca ? b : a, vi = ca ? a : b;
          ctx.act2({ actors: [tr, vi], cat: 'betray', mag: 20, fx: function () { tr.hp = Math.min(100, tr.hp + 20); hurt(ctx, vi, 40, tr.name + 'に裏切られた信頼ゲームで'); ctx.mod(vi, tr, { trust: -60, ten: 40, aff: -25 }); vi.flags.revenge = tr.i; },
            text: ctx.t('{a}は『裏切る』を、{b}は『信じる』を押した。', tr, vi), why: tr.name + 'のドライさ（' + Math.round(tr.tr.cold * 100) + '）／' + vi.name + 'の' + (vi.tr.np > 0.55 ? 'NP' : '信頼') });
        }
      }
    },
    {
      id: 'roulette', min: 2, from: 3,
      run: function (ctx) {
        var P = ctx.rng.shuffle(ctx.present()).slice(0, 4), rng = ctx.rng;
        ctx.incident('放送：「' + names(P) + 'は体育館へ。弾は一発、六つの穴。順番に引き金を引け」');
        var first = ctx.most(P, function (c) { return c.tr.cp * 0.5 + c.tr.fc * 0.5 + c.tr.cold * 0.3; });
        ctx.act2({ actors: [first], cat: 'solo', text: ctx.t('最初に銃を取ったのは{a}だった。', first), why: first.name + 'の' + (first.tr.cp > first.tr.fc ? 'CP（自分で決めたい）' : 'FC（どうせなら先に）') });
        var order = [first].concat(P.filter(function (c) { return c !== first; }));
        var left = 6;
        for (var t = 0; t < 8; t++) {
          var cur = order[t % order.length];
          if (!cur.alive) continue;
          var sub = ctx.most(P.filter(function (o) { return o !== cur && o.alive; }), function (o) { return R(ctx, o, cur).aff / 100 + o.tr.np * 0.5; });
          var shooter = cur;
          if (sub && R(ctx, sub, cur).aff > 45 && sub.tr.np > 0.55 && rng() < 0.6) {
            shooter = sub;
            ctx.act2({ actors: [sub, cur], cat: 'help', mag: 20, fx: function () { ctx.mod2(sub, cur, { aff: 5 }, { aff: 20, trust: 20, att: 10 }); },
              text: ctx.t('{b}の番で、{a}が銃を奪った。「代わる」', sub, cur), why: sub.name + 'のNPと' + cur.name + 'への好意（' + Math.round(R(ctx, sub, cur).aff) + '）' });
          }
          if (rng() < 1 / left) { ctx.kill(shooter, null, 'ロシアンルーレットの' + (7 - left) + '発目で'); break; }
          left--;
          ctx.say({ text: shooter.name + '、空砲。' });
          if (left <= 1) break;
        }
        P.forEach(function (c) { if (c.alive) c.stress = HK.clamp(c.stress + 18, 0, 100); });
      }
    },
    {
      id: 'confession', min: 2, from: 1,
      run: function (ctx) {
        var P = ctx.present(), picks = {};
        if (P.length > 10) P = ctx.rng.shuffle(P).slice(0, 10);
        ctx.incident('放送：「紙に一番大切な人の名前を書け。両想いだった二人には、救急箱と食料を与える」');
        P.forEach(function (a) { picks[a.i] = fav(ctx, a, ctx.others(a)); });
        var done = {};
        P.forEach(function (a) {
          var b = picks[a.i];
          if (!b) { ctx.act2({ actors: [a], cat: 'solo', text: ctx.t('{a}の紙は白紙だった。', a), why: a.name + 'に、名前を書くほどの相手がいなかった' }); return; }
          if (done[a.i]) return;
          if (picks[b.i] === a) {
            done[a.i] = done[b.i] = 1;
            ctx.pair(a, b).confessed[a.i] = ctx.pair(a, b).confessed[b.i] = true;
            ctx.act2({ actors: [a, b], cat: 'romance', mag: 25, fx: function () { a.hp = Math.min(100, a.hp + 20); b.hp = Math.min(100, b.hp + 20); ctx.mod2(a, b, { att: 14, aff: 10, trust: 12 }, { att: 14, aff: 10, trust: 12 }); },
              text: ctx.t('{a}と{b}の名前が並んで読み上げられた。互いの名前を書いていた。', a, b), why: '両想い（惹かれ ' + Math.round(R(ctx, a, b).att) + '／' + Math.round(R(ctx, b, a).att) + '）' });
          } else {
            var c = picks[b.i];
            ctx.act2({ actors: [a, b], cat: 'romance', fx: function () { ctx.mod(b, a, { att: b.tr.np > 0.5 ? 6 : 2, ten: b.tr.cold > 0.6 ? 4 : 0 }); ctx.stress(a, 12); if (c) { ctx.mod(a, c, { ten: 12 }); ctx.pair(a, c).jealous++; } },
              text: ctx.t('{a}は{b}の名前を書いた。' + (c ? '{b}が書いたのは{c}だった。' : '{b}の紙は白紙だった。'), a, b, c), why: '一方通行の想いが、全員の前で明かされた' });
          }
        });
      }
    },
    {
      id: 'crate', min: 2,
      run: function (ctx) {
        var P = ctx.present();
        ctx.incident('放送：「分校の屋上に救急箱を一つ置いた。一人分だ」');
        var claim = ctx.most(P, function (c) { return c.tr.aggr * 0.6 + c.tr.cold * 0.4 + (100 - c.hp) / 200; });
        var rival = ctx.most(ctx.others(claim), function (o) { return o.tr.aggr + (100 - o.hp) / 150; });
        var giver = ctx.most(P, function (c) { return c.tr.np - c.tr.cold * 0.5; });
        if (giver && giver.tr.np > 0.65 && giver !== claim) {
          var weak = P.slice().sort(function (x, y) { return x.hp - y.hp; })[0];
          if (weak !== giver) {
            ctx.act2({ actors: [giver, weak], cat: 'help', mag: 15, fx: function () { weak.hp = Math.min(100, weak.hp + 35); ctx.mod2(giver, weak, { aff: 5 }, { aff: 18, trust: 18 }); },
              text: ctx.t('救急箱を手にした{a}は、それを自分には使わず{b}に投げ渡した。', giver, weak), why: giver.name + 'のNP（' + Math.round(giver.eg.NP) + '）' });
            return;
          }
        }
        if (rival && rival.tr.aggr > 0.5) {
          var r = ctx.fight(claim, rival, { lethality: 0.6 });
          ctx.act2({ actors: [claim, rival], cat: 'combat', fx: function () { if (r.winner) r.winner.hp = Math.min(100, r.winner.hp + 30); },
            text: ctx.t('屋上で{a}と{b}が鉢合わせた。', claim, rival) + r.text, why: '物資の奪い合い。' + (r.why || '') });
        } else {
          ctx.act2({ actors: [claim], cat: 'solo', fx: function () { claim.hp = Math.min(100, claim.hp + 30); ctx.others(claim).forEach(function (o) { ctx.mod(o, claim, { ten: 4 }); }); },
            text: ctx.t('救急箱は{a}が持ち去った。', claim), why: claim.name + 'の攻撃性・ドライさ' });
        }
      }
    },
    {
      id: 'hostage', min: 3, from: 2,
      run: function (ctx) {
        var P = ctx.present(), rng = ctx.rng;
        var v = rng.pick(P);
        ctx.incident('放送：「' + v.name + 'を灯台に拘束した。日没までに誰も来なければ首輪を作動させる」');
        var res = ctx.most(ctx.others(v), function (o) { return Math.max(0, R(ctx, o, v).aff) / 60 + o.tr.np * 0.5 + (o.focus === v ? 1 : 0) - o.tr.caution * 0.3; });
        var score = Math.max(0, R(ctx, res, v).aff) / 60 + res.tr.np * 0.5 + (res.focus === v ? 1 : 0) - res.tr.caution * 0.3;
        if (score > 0.55) {
          ctx.act2({ actors: [res, v], cat: 'help', mag: 25, fx: function () { hurt(ctx, res, 20, v.name + 'を助けに灯台へ向かって'); ctx.mod2(res, v, { aff: 6 }, { aff: 22, trust: 25, att: 10 }); },
            text: ctx.t('日没の十分前、灯台の扉を蹴破ったのは{a}だった。', res, v), why: res.name + 'の' + (res.focus === v ? '目標（' + v.name + 'を守る）' : 'NPと' + v.name + 'への好意') });
        } else {
          ctx.kill(v, null, '灯台で、誰にも助けられないまま');
          ctx.others(v).forEach(function (o) { if (o.alive && R(ctx, o, v).aff > 35) ctx.act2({ actors: [o, v], cat: 'solo', fx: function () { ctx.stress(o, 25); }, text: ctx.t('{a}は灯台の方角を見ないようにしていた。', o, v), why: o.name + 'の慎重さが、' + v.name + 'への好意（' + Math.round(R(ctx, o, v).aff) + '）に勝った' }); });
        }
      }
    },
    {
      id: 'dinner', min: 3,
      run: function (ctx) {
        var P = ctx.present(), rng = ctx.rng;
        ctx.incident('放送：「食堂に人数分の食事を用意した。一皿だけ、毒が入っている」');
        var taster = ctx.most(P, function (c) { return c.tr.np * 0.6 + c.tr.fc * 0.3 + (c.goal.id === 'save' ? 0.5 : 0); });
        var forcer = ctx.most(P, function (c) { return c.tr.cp * (1 - c.tr.np); });
        var meek = ctx.most(ctx.others(forcer), function (o) { return o.tr.ac; });
        var tasterUsed = taster;
        if (forcer.tr.cp > 0.7 && forcer.tr.np < 0.4 && meek && meek.tr.ac > 0.6) {
          tasterUsed = meek;
          ctx.act2({ actors: [forcer, meek], cat: 'conflict', fx: function () { ctx.mod(meek, forcer, { ten: 20, trust: -15 }); },
            text: ctx.t('「お前が先に食え」{a}は{b}の前に皿を押しやった。{b}は逆らわなかった。', forcer, meek), why: forcer.name + 'のCP高・NP低／' + meek.name + 'のAC（' + Math.round(meek.eg.AC) + '）' });
        } else {
          ctx.act2({ actors: [taster], cat: 'help', fx: function () { ctx.others(taster).forEach(function (o) { ctx.mod(o, taster, { trust: 6, aff: 4 }); }); },
            text: ctx.t('「毒見なら俺がやる」{a}が真っ先にスプーンを取った。', taster), why: taster.name + 'のNP・FC' });
        }
        var poisoned = rng.pick(P);
        var nose = ctx.most(ctx.others(poisoned), function (o) { return o.tr.a; });
        if (nose && rng() < nose.tr.a * 0.55) {
          ctx.act2({ actors: [nose, poisoned], cat: 'help', mag: 15, fx: function () { ctx.mod(poisoned, nose, { trust: 18, aff: 10 }); },
            text: ctx.t('{b}が口をつける直前、{a}がその皿を払い落とした。「匂いが違う」', nose, poisoned), why: nose.name + 'のA（' + Math.round(nose.eg.A) + '）：観察力' });
        } else {
          ctx.act2({ actors: [poisoned], cat: 'solo', fx: function () { hurt(ctx, poisoned, poisoned === tasterUsed ? 55 : 45, '毒入りの皿を引いて'); }, text: ctx.t('毒の皿を引いたのは{a}だった。', poisoned), why: '偶然' });
        }
      }
    },
    {
      id: 'zone', from: 2,
      run: function (ctx) {
        var P = ctx.present();
        if (P.length < 2) return;
        var a = ctx.rng.pick(P);
        var b = ctx.most(ctx.others(a), function (o) { return R(ctx, a, o).ten + R(ctx, a, o).att; });
        ctx.incident('放送：「' + a.name + 'の潜伏地点を禁止エリアに指定する」');
        var r = R(ctx, a, b);
        if (r.ten > 35 && a.tr.aggr > 0.45) {
          var f = ctx.fight(a, b);
          ctx.act2({ actors: [a, b], cat: 'combat', text: ctx.t('追い出された{a}は、逃げた先で{b}と出くわした。', a, b) + f.text, why: '強制移動。積もった緊張（' + Math.round(r.ten) + '）。' + f.why });
        } else {
          ctx.act2({ actors: [a, b], cat: r.att > 30 ? 'romance' : 'bond', fx: function () { ctx.mod2(a, b, { trust: 8, att: 4 }, { trust: 6, att: 4 }); },
            text: ctx.t('追い出された{a}は、逃げた先で{b}と出くわした。{b}は黙って、隠れ家の奥を空けた。', a, b), why: b.name + 'の側に敵意がなかった' });
        }
      }
    }
  ];
})();
