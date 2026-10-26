/* 箱庭シミュレーター: ゾンビの街 ― 一緒にゾンビになる／逃げ切ったが感染していた／発症が遅いあいだに心中を図る
   ・ゾンビになった住人に襲われた人は、喰い殺されるだけでなく、その場でゾンビとして起き上がり、二人並んでさまようことがある
   ・逃げ切った人の体に、気づかない引っかき傷や、隠した歯形が残ることがある
   ・発症まで時間がある恋人どうしは、残りの日々を一緒に過ごしてから心中を図ることがある（成功するとは限らない） */
(function () {
  'use strict';
  var HK = window.HK, Z = HK.ZB;
  if (!Z || !Z.scen || !Z.turn) return;
  var EV = Z.scen.events;
  function L(s) { return s.split('|'); }
  function fill(t, m) { return t.replace(/\{(\w+)\}/g, function (x, k) { return m[k] != null ? m[k] : x; }); }
  function lover(ctx, a, b) { return Z.isLover ? Z.isLover(ctx, a, b) : false; }
  function zpOf(ctx, i) { return ctx.zb.zpc.filter(function (z) { return z.i === i; })[0]; }
  Z.zpOf = zpOf;

  var T = Z.TOGETHER = {
    /* 喰われたあと、起き上がる（{z}=襲ったゾンビ、{v}=襲われた人） */
    rise: L('{v}の悲鳴が途切れた。しばらくして、{v}はゆっくりと起き上がった。濁った目で{z}を見つめ、それから、{z}の隣に並んだ。|{z}に組み伏せられた{v}は、もう抵抗しなかった。数分後、二つの影が、同じ足取りで通りへ出ていった。|{v}は{z}の腕の中で動かなくなった。やがて{v}の指がぴくりと動き、{z}の服の裾を掴んだ。生きていたころと、同じ仕草だった。'),
    riseLove: L('{v}は最後まで{z}を抱きしめていた。咬まれても、離さなかった。やがて{v}の呼吸が止まり――そして、{v}は{z}と同じ目をして顔を上げた。二人は、手を繋いだまま歩き出した。|「やっと、同じになれたね｜やっと、同じになれた｜やっと、同じになれましたね」――{v}の最後の言葉は、それだった。起き上がった{v}は、{z}の肩に頭を預けるようにして、並んでさまよい始めた。|{v}は{z}に咬まれながら、笑っていた。日が沈むころ、二人のゾンビが、寄り添うように瓦礫の街を歩いていた。'),
    seePair: L('{v}は通りの向こうに、{z}と{p}を見つけた。二人は、肩が触れ合うほど近くを、同じ方向へ歩いていた。|{v}は窓の外を、{z}と{p}が並んで通り過ぎるのを見た。{p}の手は、{z}の袖を掴んだままだった。|{v}は、{z}と{p}が寄り添うように立ち尽くしているのを見た。生きていたころより、ずっと穏やかな顔に見えた。'),
    /* 逃げ切ったが、感染していた */
    scratch: L('――そのとき{v}は、袖口に小さな血の染みができていることに、まだ気づいていなかった。|――逃げ込んだ先で、{v}は手の甲の擦り傷を舐めた。ただの擦り傷だと思った。|――{v}は息を整えながら、首筋のひりつきを汗のせいだと思った。'),
    bitHide: L('――逃げ切った。だが、{v}の腕には、くっきりと歯形が残っていた。{v}は袖を下ろして、何も言わなかった。|――扉を閉めたあと、{v}は自分のふくらはぎを見下ろした。破れたズボンの下に、赤黒い咬み跡があった。'),
    /* 心中の計画（{a}=咬まれた人、{b}=恋人） */
    plan: L('{a}は{b}に咬み跡を見せた。{b}は長いあいだ黙っていた。「……まだ、時間はあるんだよね｜……まだ、時間はあるんだな｜……まだ、時間はあるんですよね」「たぶん、数日｜＝｜たぶん、数日です」「じゃあ、その数日を全部ちょうだい。最後の日に、一緒に行こう｜では、その数日を全部くれ。最後の日に、一緒に行こう｜では、その数日を全部ください。最後の日に、一緒に行きましょう」|{a}と{b}は、地図の上で一つの場所を指さした。昔、二人で行こうと話していた海の見える丘だった。「そこで、終わろう｜＝｜そこで、終わりにしましょう」|{b}は{a}の咬み跡に、そっと口づけた。「一人では行かせない。発症する前の晩に、二人で｜＝｜一人では行かせません。発症する前の晩に、二人で」――{a}は泣きながら頷いた。'),
    days: L('{a}と{b}は、残された時間を数えるのをやめた。崩れたカフェで、二人は賞味期限切れのクッキーを分け合い、何年も先の話をした。|{a}の熱は少しずつ上がっていた。{b}は一晩中、{a}の額を冷やし続けた。「あと少しだけ、このままで｜＝｜あと少しだけ、このままでいさせてください」|{a}と{b}は、空っぽの映画館の座席に並んで座った。スクリーンには何も映らなかったが、二人は最後まで席を立たなかった。|{b}は{a}の好きだった曲を、何度も口ずさんだ。{a}はそのたびに、少しだけ音程の外れたハーモニーを重ねた。'),
    goBoth: L('約束の夜、{a}と{b}は丘の上に立った。指を絡めたまま、二人は同時に目を閉じた。――翌朝、そこには寄り添うように眠る二人だけが残っていた。|{a}と{b}は、最後の薬を半分ずつ分け合った。「おやすみ｜＝｜おやすみなさい」「おやすみ｜＝｜おやすみなさい」――それが、二人の最後の会話だった。|{b}は{a}を抱きしめたまま、屋上の縁から一歩、踏み出した。{a}は最後に、{b}の名前を呼んだ。'),
    goStop: L('その瞬間、{a}は{b}の手を振りほどいた。「やっぱり、だめだ。あなたは生きて｜やっぱり、だめだ。あなたは生きろ｜やっぱり、だめです。あなたは生きてください」――{a}は{b}を突き飛ばし、ひとりで闇の中へ消えた。|{a}は{b}の手から薬を奪い取った。「あなたの分まで、私が持っていく｜＝｜あなたの分まで、私が持っていきます」――{b}が止める間もなく、{a}は一人で全部を飲み込んだ。|最後の瞬間、{a}は笑って言った。「ごめん、嘘ついた。一緒には行かない｜すまない、嘘をついた。一緒には行かない｜ごめんなさい、嘘をつきました。一緒には行きません」――{a}はひとりで、扉の向こうへ歩いていった。'),
    goFail: L('約束の夜、{b}はどうしても、最後の一歩を踏み出せなかった。{a}の熱い手を握ったまま、{b}は泣き崩れた。――その夜明け、{a}の呼吸が止まった。|{b}は武器を握ったまま、震えて動けなかった。「ごめん……ごめん、できない……｜すまない……すまない、できない……｜ごめんなさい……ごめんなさい、できません……」――{a}は{b}の頬を撫でて、「いいよ｜いいんだ｜いいんです」と言った。それが、{a}としての最後の言葉だった。'),
    goRise: L('約束の夜、二人が手を取り合った瞬間、{a}の目から光が消えた。発症が、ほんの少しだけ早かった。――{a}の歯が、{b}の首筋に沈んだ。{b}は抵抗しなかった。「……いいよ。これで、一緒だ｜……いい。これで、一緒だ｜……いいんです。これで、一緒です」|{a}は最後の口づけの途中で、{b}の唇を咬み破った。{b}は痛みに顔をしかめて、それから、泣きながら笑った。'),
    dayLabel: { shinjuPlan: '恋人と最後の日々を過ごし、心中する' }
  };

  /* ---------- 一緒にゾンビになる ---------- */
  /* 襲われた人 v を、その場でゾンビとして起き上がらせ、襲ったゾンビ zp と並んでさまよわせる */
  Z.riseTogether = function (ctx, zp, v, opt) {
    opt = opt || {};
    var c = ctx.chars[zp.i], love = lover(ctx, v, c), m = { v: v.name, z: c.name };
    v.z.bitten = v.z.bitten || { at: ctx.stepIndex, by: c.i };
    v.z.hiding = false;
    if (!opt.silent) ctx.act2({ actors: [c, v], cat: 'death', text: (opt.pre || '') + fill(ctx.pick(love ? T.riseLove : T.rise), m), why: opt.why || ('ゾンビになった' + c.name + 'に襲われた' + v.name + 'は、その場でゾンビになった' + (love ? '（恋人どうし）' : '')), mag: 55 });
    var n0 = ctx.zb.zpc.length;
    Z.turn(ctx, v, true);
    var nz = ctx.zb.zpc[n0];
    if (nz) {
      nz.with = c.i; nz.type = 'wild'; nz.target = null; nz.area = zp.area;
      zp.with = v.i; if (zp.type === 'bond' && zp.target === v.i) zp.type = 'wild';
      v.fateNote = ctx.label + '、' + Z.an(ctx, zp.area) + 'で' + c.name + 'に襲われてゾンビになった。' + c.name + 'と並んでさまよっている';
      c.fateNote = (c.fateNote || '').replace(/。[^。]*を探してさまよっている$/, '') + '。' + v.name + 'と並んでさまよっている';
    }
  };
  /* 襲われたとき、喰い殺されるかわりに起き上がるか */
  Z.riseChance = function (ctx, zp, v) {
    var c = ctx.chars[zp.i];
    return (lover(ctx, v, c) ? 0.6 : ctx.R(v, c).aff > 45 ? 0.4 : 0.25);
  };
  /* 並んでさまようゾンビ：あとから起き上がった方が、先の方についていく */
  Z.pairMove = function (ctx, zp) {
    if (zp.with == null) return false;
    var pz = zpOf(ctx, zp.with);
    if (!pz || pz.down) { zp.with = null; return false; }
    if (zp.at > pz.at || (zp.at === pz.at && zp.i > pz.i)) { zp.area = pz.area; return true; }
    return false;
  };
  Z.pairSee = function (ctx, v, c, zp) {
    if (!zp || zp.with == null) return null;
    var p = ctx.chars[zp.with], pz = zpOf(ctx, zp.with);
    if (!p || !pz || pz.down || pz.area !== zp.area) return null;
    return fill(ctx.pick(T.seePair), { v: v.name, z: c.name, p: p.name });
  };

  /* ---------- 逃げ切ったが、感染していた ---------- */
  /* 返り値：本文に足す文（感染しなければ ''） */
  Z.fleeInfect = function (ctx, zp, v, hes) {
    var rng = ctx.rng, r = rng(), m = { v: v.name };
    if (v.z.bitten) return '';
    var p = 0.18 + (hes ? 0.1 : 0) - (v.weapon ? v.weapon.pow * 0.01 : 0);
    if (r < p * 0.55) { Z.infect(ctx, v, zp.i, false); return fill(ctx.pick(T.scratch), m); }
    if (r < p) { Z.infect(ctx, v, zp.i, true); v.z.hiding = v.tr.honesty < 0.55; return fill(ctx.pick(T.bitHide), m); }
    return '';
  };

  /* ---------- 発症が遅いあいだに、心中を図る ---------- */
  var biteOpts0 = Z.biteOpts, biteRun0 = Z.biteRun;
  if (Z.BITE_LABEL) Z.BITE_LABEL.shinjuPlan = T.dayLabel.shinjuPlan;
  Z.biteOpts = function (ctx, c, opts, mates, close, lv) {
    if (biteOpts0) biteOpts0(ctx, c, opts, mates, close, lv);
    if (lv && lv.alive && c.z.turnAt - ctx.stepIndex >= 4) {
      opts.push(['shinjuPlan', 0.3 + lv.tr.ac * 0.3 + lv.tr.jealous * 0.2 + ctx.R(lv, c).aff / 220 + c.tr.np * 0.15]);
    }
  };
  Z.biteRun = function (ctx, c, pick, why, mates, close, lv) {
    if (pick === 'shinjuPlan' && lv && lv.alive) {
      var pf = ctx.pair(c, lv);
      pf.sjPlan = { by: c.i, with: lv.i, at: Math.max(ctx.stepIndex + 2, c.z.turnAt - 1), days: 0 };
      c.z.sj = pf.sjPlan; lv.z.sj = pf.sjPlan;
      ctx.mod2(c, lv, { aff: 10, att: 8 }, { aff: 10, att: 8 });
      ctx.act2({ actors: [c, lv], cat: 'romance', text: fill(ctx.pick(T.plan), { a: c.name, b: lv.name }), why: why + '／発症まで、まだ ' + (c.z.turnAt - ctx.stepIndex) + ' 区切りある', mag: 40 });
      return true;
    }
    return biteRun0 ? biteRun0(ctx, c, pick, why, mates, close, lv) : false;
  };
  /* 計画した二人の、残された日々 */
  EV.push({
    id: 'z_sj_days', cat: 'romance', scope: 'pair', pri: true,
    when: function (ctx, a, b) { var p = a.z.sj; return p && p === b.z.sj && p.by === a.i && p.days < 2 && ctx.stepIndex < p.at; },
    w: function () { return 4; },
    run: function (ctx, a, b) {
      var p = a.z.sj; p.days++;
      ctx.mod2(a, b, { aff: 5, att: 5 }, { aff: 5, att: 5 });
      return { text: fill(ctx.pick(T.days), { a: a.name, b: b.name }), why: '心中を約束した二人の、残された時間（約束の日まで ' + (p.at - ctx.stepIndex) + ' 区切り）', mag: 26 };
    }
  });
  /* 約束の日：結末を決める。処理したら true（zombie-core の発症処理から呼ぶ） */
  Z.shinjuCheck = function (ctx, c) {
    var p = c.z.sj;
    if (!p || p.done || p.by !== c.i || ctx.stepIndex < p.at) return false;
    var b = ctx.chars[p.with];
    p.done = true;
    if (!b || !b.alive || b.out || b.z.area !== c.z.area) return false;
    var rng = ctx.rng, m = { a: c.name, b: b.name };
    var opts = [
      ['both', 0.5 + b.tr.ac * 0.3 + b.tr.jealous * 0.2 + ctx.R(b, c).aff / 250],
      ['stop', c.tr.np * 0.45 + c.tr.cp * 0.25 + (b.goal.id === 'escape' ? 0.15 : 0)],
      ['fail', b.tr.caution * 0.35 + b.tr.np * 0.15 + (1 - b.tr.impulse) * 0.15],
      ['rise', 0.18 + (c.z.turnAt - ctx.stepIndex <= 1 ? 0.25 : 0)]
    ];
    var k = HK.weighted(rng, opts, function (o) { return Math.pow(Math.max(0.03, o[1]), 2); })[0];
    var why = '約束の日。' + c.name + 'と' + b.name + 'の心中の結末';
    if (k === 'both') {
      ctx.pair(c, b).shinju = true;
      ctx.act2({ actors: [c, b], cat: 'romance', text: fill(ctx.pick(T.goBoth), m), why: why + '（' + b.name + 'の想い：AC・執着・好意）', mag: 58 });
      ctx.kill(c, null, '発症する前に、恋人の' + b.name + 'と心中した');
      ctx.kill(b, null, '咬まれた恋人の' + c.name + 'と、約束どおり心中した');
      return true;
    }
    if (k === 'stop') {
      ctx.act2({ actors: [c, b], cat: 'romance', text: fill(ctx.pick(T.goStop), m), why: why + '――' + c.name + 'は最後に、' + b.name + 'を生かすことを選んだ（NP・CP）', mag: 52 });
      ctx.stress(b, 40); b.flags.grief = c.i;
      ctx.kill(c, null, '恋人の' + b.name + 'を残して、ひとりで終わらせた');
      return true;
    }
    if (k === 'fail') {
      ctx.act2({ actors: [c, b], cat: 'romance', text: fill(ctx.pick(T.goFail), m), why: why + '――' + b.name + 'は、最後の一歩を踏み出せなかった（慎重さ・NP）', mag: 48 });
      ctx.stress(b, 35);
      c.z.turnAt = ctx.stepIndex; /* このあと、そのまま発症する */
      return false;
    }
    /* 心中の途中で発症し、恋人を咬む：二人ともゾンビになる */
    ctx.act2({ actors: [c, b], cat: 'death', text: fill(ctx.pick(T.goRise), m) + '――夜が明けるころ、' + c.name + 'と' + b.name + 'は、手を繋いだまま街へ降りていった。', why: why + '――発症の方が、ほんの少し早かった。二人ともゾンビになった', mag: 58 });
    var n0 = ctx.zb.zpc.length;
    Z.turn(ctx, c, true);
    var zp = ctx.zb.zpc[n0];
    if (zp && b.alive && !b.out) { zp.target = null; zp.type = 'wild'; Z.riseTogether(ctx, zp, b, { silent: true }); }
    return true;
  };
})();
