/* 箱庭シミュレーター: ゾンビの街（R18版のみ）― 略奪者に襲われて犯される／周りの反応
   ・略奪者と出くわしたとき、まれに一人が犯される展開になる（襲われる人が「攻め」指定でないとき・「恋人たちの夜」が描かないでないとき）
   ・分かれ方はゾンビに襲われたとき（zombie-assault.js）とそろえる：
       一人きり … 略奪者は群れの気配に逃げていく（身分証や写真を奪っていく）／口封じに殺される
       仲間がいる … 助け出す（略奪者は身分証や写真を奪って逃げる）／助けに入った人が撃たれ・殴られる／銃口の前で見ているしかない
   ・恋人がその場にいれば強いショック。不仲の相手は背を向けることもある
   ・された人は、体力と心がすり減る。写真を撮られた人は、あとでそれを思い知らされる
   台詞は tone-lines.js（口調ごとの書き下ろし）。全年齢版ではこのファイルは読み込まれない。登場人物はすべて成人として扱う */
(function () {
  'use strict';
  var HK = window.HK, Z = HK.ZB;
  if (!Z || !Z.scen || !HK.TL) return;
  var TL = HK.TL;
  function L(s) { return s.split('|'); }
  /* 「＠……」は住人以外（略奪者）の台詞。口調を変えないよう、見えない印（U+2060）に置き換える */
  function fill(t, m) { return t.replace(/\{(\w+)\}/g, function (x, k) { return m[k] != null ? m[k] : x; }).replace(/「＠/g, '「⁠'); }
  function alive(c) { return c && c.alive && !c.out; }
  function hate(ctx, a, b) { var t = HK.Ties && HK.Ties.get(ctx, a, b); return !!t && /^(enemy|bad|sibbad)$/.test(t.like || t.type); }

  var RT = {
    open: L('{n}たちの一人が、{a}の腕を掴んで、崩れた店の奥へ引きずり込んだ。「＠食い物だけじゃ、割に合わねえな」|「＠こっちのほうが、よっぽど上物だ」――{n}たちのリーダーが、{a}を顎でしゃくった。二人がかりで、{a}は床に押さえつけられた。'),
    openM: L('{n}たちは銃口を{m}に向けたまま、{a}だけを奥の部屋へ引きずっていった。|「＠動くなよ。動いたら、こいつの頭が飛ぶ」――{n}たちは{m}を壁際に並ばせ、その目の前で、{a}を床に押し倒した。'),
    act: L('男は{a}のズボンを引き下ろし、慣らしもしないまま、奥までねじ込んだ。順番を待つ男たちが、缶詰をつまみながら笑っていた。|{a}は代わる代わる組み敷かれた。終わった男が煙草に火をつけ、次の男がベルトを外した。誰かが、終わった人数を数えていた。|男は{a}の髪を掴んで顔を床に押しつけ、獣のように腰を打ちつけた。床の割れたタイルが、{a}の頬に食い込んだ。'),
    act2: L('男たちは、{a}の中に吐き出すたびに、下品な冗談を言い合った。|最後の男が離れたとき、{a}の脚は、自分のものではないように震えていた。|男たちが離れたあとも、床に押しつけられた跡が、{a}の手首にくっきりと残っていた。'),
    fade: L('{a}の服の裂ける音がした。それから長いあいだ、男たちの笑い声と、押し殺した声だけが続いた。|扉の向こうで何が起きているのか、誰も口にしなかった。男たちが出てきたのは、ずいぶん経ってからだった。'),
    seen: L('{m}は壁際で、銃口を突きつけられたまま、それを見ていることしかできなかった。|{m}は目を閉じようとした。「＠目ぇ逸らすな」――男に髪を掴まれ、顔を上げさせられた。|{m}は唇を噛み切るほど食いしばった。助けに飛び出せば、銃口は{a}に向く。'),
    photo: L('男の一人が、床に倒れた{a}をスマホで撮った。それから{a}の財布を拾い上げ、免許証を抜き取った。「＠住所、覚えたからな。誰かに喋ったら、分かるよな」|去り際、リーダーは{a}の免許証と、{a}が大事に持っていた家族の写真を、ポケットにねじ込んだ。「＠記念にもらってくぜ」|男たちは、ぐったりした{a}を何枚も撮った。「＠こういうの、欲しがるやつがいるんだよ」――{a}の社員証も、一緒に持っていかれた。'),
    flee: L('遠くで、群れの呻き声が近づいてきた。男たちは舌打ちして、奪った食料を担いで走り去った。|どこかで車の防犯ブザーが鳴り出した。男たちは慌てて、荷物を抱えて逃げ出した。'),
    kill: L('「＠顔、見られたからな」――最後の男が、{a}の額に銃口を当てた。乾いた音がひとつ、廃墟に響いた。|男たちは、動かなくなった{a}を置き去りにして、店に火を放った。'),
    save: L('――{m}が{w}を振りかざして飛び込んだ。不意を突かれた男が床に転がり、残りの男たちは悪態をつきながら逃げ出した。|――{m}が、隠し持っていた発煙筒に火をつけた。煙の中で、男たちは咳き込みながら散り散りになった。'),
    saveL: L('――{L}は我を忘れて、{a}にのしかかっていた男に殴りかかった。男の顔が潰れても、{L}は殴るのをやめなかった。|――{L}は男の銃身を素手で掴み、もみ合いのまま男を割れた窓の外へ突き落とした。残りの男たちは、逃げていった。'),
    caught: L('――{m}が飛びかかった。だが、銃床で顔を殴られ、床に倒れた。男たちは、倒れた{m}の背中を、靴で何度も踏みつけた。|――{m}が叫んで駆け寄った瞬間、乾いた銃声が響いた。{m}は脇腹を押さえて崩れ落ちた。'),
    abandon: L('――{m}は、銃口の前で一歩も動けなかった。{a}の声が途切れるまで、{m}は床の一点を見つめていた。|――「＠妙な真似したら、こいつを殺す」{m}は、拳を握りしめたまま、それを聞いているしかなかった。'),
    after: L('{a}は、男たちが去ったあとも、しばらく起き上がれなかった。|{a}は、残っていた飲み水を全部使って、何度も体を洗った。誰も、止めなかった。'),
    cold: L('{x}は、何も言わずに{a}に背を向けた。|{x}は、床に落ちた食料の数を数えていた。{a}の方は、一度も見なかった。'),
    later: L('{a}は、崩れた掲示板に、見覚えのある写真が貼られているのを見つけた。自分の、あの日の写真だった。{a}は写真を剥がして破り、その場に座り込んだ。|{a}は、拾ったラジオから、自分の名前と住所が読み上げられるのを聞いた。「＠――そいつを見つけたら、連れてこい」略奪者たちの無線だった。|{a}は夜中に飛び起きた。男たちの笑い声が、まだ耳の奥に残っていた。持っていかれた写真の家族の顔が、どうしても思い出せなかった。')
  };

  /* 略奪者に襲われ、犯される。v=襲われる人、mates=居合わせた仲間、n=略奪者（NPC） */
  Z.raiderAssault = function (ctx, v, mates, n) {
    var rng = ctx.rng, lv = ctx.env.zlewd === 'high' ? 'high' : 'fade';
    var L0 = Z.loverOf ? Z.loverOf(ctx, v) : null, here = L0 && mates.indexOf(L0) >= 0;
    var m = { a: v.name, n: n.label, m: mates.length ? Z.names(mates.slice(0, 2)) : '', L: L0 ? L0.name : '' };
    var t = fill(ctx.pick(mates.length ? RT.openM : RT.open), m) + TL.line(v, 'RAID_BEG');
    if (mates.length) {
      var wit = here ? L0 : ctx.most(mates, function (x) { return x.tr.np + x.tr.cp * 0.5 + (hate(ctx, x, v) ? -2 : 0); });
      if (!hate(ctx, wit, v)) t += TL.line(wit, 'RAID_WITNESS', v);
    }
    var body = function () {
      if (lv !== 'high') return fill(ctx.pick(RT.fade), m);
      /* ときどき長い版（dark-thick.js） */
      if (HK.DarkThick && rng() < HK.DarkThick.RATE) return HK.DarkThick.raid(ctx, v, mates, m);
      return fill(ctx.pick(RT.act), m) + (mates.length && rng() < 0.6 ? fill(ctx.pick(RT.seen), m) : '') + fill(ctx.pick(RT.act2), m);
    };
    var drain = function (k) { v.hp -= 18 + rng.int(14) + (k || 0); ctx.stress(v, 48 + (k || 0)); v.flags.raided = true; v.z.raidAt = ctx.stepIndex; };
    var photo = function () { if (rng() < 0.6) { v.flags.raidPhoto = true; return fill(ctx.pick(RT.photo), m); } return ''; };
    var why = Z.an(ctx, n.area) + 'で、' + n.label + 'たちに襲われた（' + v.name + 'は攻め指定ではない）';
    var actors = [v].concat(mates);
    var cold = mates.filter(function (x) { return x !== L0 && hate(ctx, x, v); })[0];
    var tail = function () {
      var s = fill(ctx.pick(RT.after), m) + TL.line(v, 'RAID_SELF');
      var comf = here && alive(L0) ? L0 : mates.filter(function (x) { return alive(x) && !hate(ctx, x, v); }).sort(function (a, b) { return b.tr.np - a.tr.np; })[0];
      if (comf) { s += TL.line(comf, 'RAID_AFTER', v); ctx.mod(v, comf, { trust: 12, aff: 6 }); }
      if (cold) s += fill(ctx.pick(RT.cold), { a: v.name, x: cold.name });
      return s;
    };
    if (!mates.length) {
      if (rng() < 0.78 + ctx.stat(v, 'luck') * 0.02) {
        drain(8);
        var tt = t + body() + photo() + fill(ctx.pick(RT.flee), m) + fill(ctx.pick(RT.after), m) + TL.line(v, 'RAID_SELF');
        if (v.hp <= 0) { ctx.kill(v, null, n.label + 'たちに犯され、そのまま動けなくなって'); return { with: actors, text: tt, why: why + '――体がもたなかった', mag: 56 }; }
        return { with: actors, text: tt, why: why + '――略奪者たちは、群れの気配に逃げていった。' + v.name + 'の体力と心が、大きくすり減った' + (v.flags.raidPhoto ? '（身分証や写真を奪われた）' : ''), mag: 50 };
      }
      ctx.kill(v, null, n.label + 'たちに犯され、口封じに殺された');
      return { with: actors, text: t + body() + fill(ctx.pick(RT.kill), m), why: why + '（その場に、誰もいなかった）――口封じに殺された', mag: 58 };
    }
    var shock = Z.loverShock ? Z.loverShock(ctx, v, L0, here, true) : '';
    var pow = mates.reduce(function (s0, x) { return s0 + (x.weapon ? x.weapon.pow : 0); }, 0);
    var brave = mates.reduce(function (s0, x) { return Math.max(s0, x.tr.np * 0.5 + x.tr.cp * 0.3 + x.tr.aggr * 0.3); }, 0);
    var save = Math.min(0.8, 0.05 + ctx.stat(v, 'luck') * 0.03 + mates.length * 0.13 + pow * 0.02 + brave * 0.2 + (here ? 0.15 : 0) - (n.gun ? 0.15 : 0));
    var r = rng();
    mates.forEach(function (x) { ctx.stress(x, hate(ctx, x, v) ? 4 : 22); });
    if (r < save) {
      var hero = here && rng() < 0.6 ? L0 : ctx.most(mates, function (x) { return x.tr.np * 0.5 + x.tr.cp * 0.3 + (x.weapon ? x.weapon.pow * 0.05 : 0) - (hate(ctx, x, v) ? 2 : 0); });
      drain(-10);
      mates.forEach(function (x) { if (!hate(ctx, x, v)) ctx.mod(v, x, { aff: 10, trust: 15 }); });
      var hm = { a: v.name, m: hero.name, w: hero.weapon ? hero.weapon.name : '素手', L: L0 ? L0.name : '' };
      return { with: actors, text: t + shock + fill(ctx.pick(hero === L0 ? RT.saveL : RT.save), hm) + (rng() < 0.5 ? (v.flags.raidPhoto = true, '逃げ際、男の一人が床に落ちていた' + v.name + 'の財布を拾っていった。中には、免許証と写真が入っていた。') : '') + tail(),
        why: why + '――' + (hero === L0 ? '恋人の' : '') + hero.name + 'たちが助け出した（仲間 ' + mates.length + '人・助かる見込み ' + Math.round(save * 100) + '%）。それでも、' + v.name + 'の心はすり減った', mag: 46 };
    }
    if (r < save + (1 - save) * 0.4) {
      var vic = here && rng() < 0.5 ? L0 : ctx.most(mates, function (x) { return x.tr.np + x.tr.impulse * 0.5 - (hate(ctx, x, v) ? 2 : 0); });
      drain(6);
      var t2 = t + shock + fill(ctx.pick(RT.caught), { a: v.name, m: vic.name }) + body() + photo() + fill(ctx.pick(RT.flee), m);
      vic.hp -= 30 + rng.int(25) + (n.gun ? 15 : 0); ctx.stress(vic, 35);
      if (vic.hp <= 0) { ctx.kill(vic, null, v.name + 'を助けに入り、' + n.label + 'たちに殺された'); t2 += vic.name + 'は、それきり起き上がらなかった。'; }
      return { with: actors, text: t2 + (alive(v) ? tail() : ''), why: why + '――助けに入った' + vic.name + 'も' + (alive(vic) ? '痛めつけられた' : '殺された'), mag: 56 };
    }
    drain(10);
    mates.forEach(function (x) { if (!hate(ctx, x, v)) { ctx.stress(x, 25); x.flags.guilt = v.i; } });
    if (rng() < 0.18 + (n.gun ? 0.08 : 0)) {
      ctx.kill(v, null, n.label + 'たちに、仲間の前で犯され、口封じに殺された');
      return { with: actors, text: t + shock + fill(ctx.pick(RT.abandon), m) + body() + fill(ctx.pick(RT.kill), m), why: why + '――仲間は、銃口の前で動けなかった' + (here ? '（恋人の' + L0.name + 'の目の前で）' : ''), mag: 60 };
    }
    return { with: actors, text: t + shock + fill(ctx.pick(RT.abandon), m) + body() + photo() + fill(ctx.pick(RT.flee), m) + tail(), why: why + '――仲間は、銃口の前で見ているしかなかった' + (here ? '（恋人の' + L0.name + 'の目の前で）' : '') + '。' + v.name + 'の体力と心が、大きくすり減った', mag: 56 };
  };

  /* 写真や身分証を奪われた人は、あとでそれを思い知らされる（2日ほどあと、一度だけ） */
  var after0 = Z.scen.after;
  Z.scen.after = function (ctx, s, n) {
    if (after0) after0.apply(this, arguments);
    ctx.present().forEach(function (c) {
      if (!c.flags.raidPhoto || c.flags.raidLater || ctx.stepIndex - (c.z.raidAt || 0) < 8 || ctx.rng() > 0.35) return;
      c.flags.raidLater = true;
      ctx.act2({ actors: [c], cat: 'solo', fx: function () { ctx.stress(c, 22); }, text: fill(ctx.pick(RT.later), { a: c.name }), why: c.name + 'は、略奪者に身分証や写真を奪われていた', mag: 28 });
    });
  };
})();
