/* 新婚部屋のキス（追加パック set-b。両方のビルド。shinkon.js のあとに読む。shinkon.js は書き換えず、HK.wrap で差し込む）
   本体の共通部品 HK.Kiss（キスの描写の型：きっかけ・長さ・深さ・終わり方。文は本体の kiss-text*.js）で、新婚の毎日のキスを足す。夜（エッチ）には数えない。
   ・朝：いってらっしゃいのキス（その日、仕事で出かける人がいる朝。短い版が基本で、たまに盛り上がって名残惜しくなり、遅刻しそうになる／「続きは帰ってから」のお預け）
   ・夜のはじめ：おかえりのキス（出かけた人が帰った夜。帰りが遅い夜・出張の日は出さない）
   ・日中：ご褒美のキス（二人とも家にいる日）
   ・夜：仲直りのキス（喧嘩した夜の仲直りのあと）・ごちそうさまのキス（夕飯の夜）・おやすみのキス（どれか一つ。最後の夜は出さない）
   ・最後の夜の幸せなキス（sk_kiss）：型の長い版（始まりは今までの幸せなキスの文、そのあとに深まる段・名残惜しい段）。三人婚なら三人のキス
   ・三人婚（S.trio）：家にいる二人を選び、三人とも家にいる夜は、ときどき三人のキス
   ・R18（R18版の R18 のとき）：いってらっしゃいの「続きは帰ってから」と、おやすみのキスの「そのまま夜へ」は、その夜のエッチのきっかけの段（shinkon-r18.js）に続ける
     （その夜のきっかけの段の頭に、朝の約束・キスの続きの一文を置き、その夜の起こりやすさを上げる。エッチの回数が残っていない・休む夜は、約束のキスの段で終える）
   起こる割合は計測（docs/reports/2026-11-03/kiss-design.md）。台詞は 3 本「くだけた常体｜硬い常体｜敬語」。登場人物はすべて成人として扱う */
/* @event scen=set-b-shinkon id=sk_kiss_itte cat=romance tie=- label=出かける朝のいってらっしゃいのキス */
/* @event scen=set-b-shinkon id=sk_kiss_okaeri cat=romance tie=- label=帰ってきた相手とおかえりのキス */
/* @event scen=set-b-shinkon id=sk_kiss_hobi cat=romance tie=- label=家にいる休みの日のご褒美のキス */
/* @event scen=set-b-shinkon id=sk_kiss_naka cat=romance tie=- label=喧嘩した夜の仲直りのキス */
/* @event scen=set-b-shinkon id=sk_kiss_gochi cat=romance tie=- label=夕飯のあとのごちそうさまのキス */
/* @event scen=set-b-shinkon id=sk_kiss_oyasumi cat=romance tie=- label=寝る前のおやすみのキス */
/* @event scen=set-b-shinkon id=sk_kiss_trio cat=romance tie=- label=三人婚の三人で交わすキス */
/* @event scen=set-b-shinkon id=sk_kiss_last cat=romance tie=- label=最後の夜の長い幸せなキス */
(function () {
  'use strict';
  var HK = window.HK;
  var ID = 'set-b-shinkon';
  if (!HK || !HK.Kiss || !HK.SCENARIOS || !HK.SCENARIOS[ID] || !HK.Journal || !HK.wrap) return;
  var KS = HK.Kiss, scen = HK.SCENARIOS[ID];
  function S0(ctx) { return ctx && ctx.scen && ctx.scen.id === ID ? ctx.sk : null; }
  function lifeDay(c, d) { return c && c.life && c.life.days ? c.life.days[d] : null; }
  function spouses(S) { return S.trio && S.C ? (S.spouses || [S.A, S.B, S.C]) : [S.A, S.B]; }
  function r18on() { return !HK.SAFE_ON && !HK.SAFE_BUILD; }
  function ok2(ctx, a, b) { return !!(a && b && a !== b && HK.canLove(a, b, ctx) && HK.canLove(b, a, ctx)); }
  function stat(ctx) { return ctx.flags.shinkonKiss = ctx.flags.shinkonKiss || { itteDays: 0, itte: 0, itteLong: 0, itteLate: 0, promise: 0, okaeri: 0, hobi: 0, naka: 0, gochi: 0, oyasumi: 0, trio: 0, night: 0, promiseNight: 0, last: 0, oazuke: 0, oazukeSad: 0, sadKiss: 0 }; }
  /* キスの段を出す（記録の一件。夜（エッチ）の印は付けない） */
  function kiss(ctx, a, b, opt, k) {
    var S = S0(ctx), st = stat(ctx);
    var r = KS.scene(ctx, a, b, Object.assign({ whyPre: '新婚部屋：', fx: function () { ctx.mod2(a, b, { aff: 2, att: 2 }, { aff: 2, att: 2 }); } }, opt));
    if (!r) return null;
    st[k] = (st[k] || 0) + 1;
    var p = r.plan;
    if (p.night === 'sadist' || p.night === 'mean') { st.sadKiss++; if (p.end === 'oazuke' || p.end === 'promise') st.oazukeSad++; }
    if (p.end === 'oazuke' || p.end === 'promise') st.oazuke++;
    if (S) S.kissN = (S.kissN || 0) + 1;
    return r;
  }
  /* 家にいる二人（三人婚なら、出かけない人のうちの二人）から一組 */
  function pairAt(ctx, S, d, part) {
    var P = spouses(S).filter(function (c) { var p = lifeDay(c, d); return !p || (!p.trip && (!p.home || p.home[part] !== false)); });
    if (P.length < 2) return null;
    if (P.length === 2) return ok2(ctx, P[0], P[1]) ? P : null;
    var i = Math.floor(ctx.rng() * 3), pr = [P[i], P[(i + 1) % 3]];
    return ok2(ctx, pr[0], pr[1]) ? pr : null;
  }
  /* ---------- 朝：いってらっしゃい ---------- */
  function morning(ctx, S, day) {
    if (!S.love || day.sick || day.apart || day.recover || day.dull) return;
    var d = day.d, P = spouses(S);
    var out = P.filter(function (c) { var p = lifeDay(c, d); return p && !p.trip && !p.hol && p.home && p.home.d === false; });
    if (!out.length) return;
    var st = stat(ctx); st.itteDays++;
    var x = out[Math.floor(ctx.rng() * out.length)], ys = P.filter(function (c) { return c !== x && ok2(ctx, x, c); });
    if (!ys.length) return;
    var y = ys[Math.floor(ctx.rng() * ys.length)];
    var shy = [x, y].some(function (c) { return KS.per(c) === 'shy' || KS.per(c) === 'stern'; });
    if (ctx.rng() > (shy ? 0.6 : 0.75)) return;
    var r = kiss(ctx, x, y, { trig: 'itte', x: x, y: y, promise: true, tag: 'いってらっしゃいのキス' }, 'itte');
    if (!r) return;
    if (r.plan.len === 'l') st.itteLong++;
    if (r.plan.end === 'late') st.itteLate++;
    if (r.plan.end === 'promise') { st.promise++; day.kissPromise = { x: x, y: y }; }
  }
  /* ---------- 夜のはじめ：おかえり ---------- */
  function evening(ctx, S, day) {
    if (!S.love || day.sick || day.apart || day.dull || day.lateHome) return;
    /* その夜の困りごと（残業・電車・雨・停電など）がある夜は、帰ってきた場面がそちらにあるので出さない */
    if (day.trouble && day.trouble.tr && day.trouble.tr.part === 'n') return;
    var d = day.d, P = spouses(S);
    var back = P.filter(function (c) { var p = lifeDay(c, d); return p && !p.trip && !p.hol && !p.late && p.home && p.home.d === false; });
    if (!back.length || ctx.rng() > (day.kissPromise ? 0.75 : 0.35)) return;
    var x = day.kissPromise && back.indexOf(day.kissPromise.x) >= 0 ? day.kissPromise.x : back[Math.floor(ctx.rng() * back.length)];
    var ys = P.filter(function (c) { return c !== x && ok2(ctx, x, c); });
    if (!ys.length) return;
    var y = day.kissPromise && day.kissPromise.x === x ? day.kissPromise.y : ys[Math.floor(ctx.rng() * ys.length)];
    /* 朝の約束がある夜は、おかえりのキスを短くする（続きは夜のきっかけの段へ） */
    kiss(ctx, x, y, { trig: 'okaeri', x: x, y: y, len: day.kissPromise && r18on() ? 's' : null, end: day.kissPromise && r18on() ? 'nagori' : null, tag: 'おかえりのキス' }, 'okaeri');
  }
  /* ---------- 日中：ご褒美 ---------- */
  function daytime(ctx, S, day) {
    if (!S.love || day.sick || day.apart || ctx.rng() > (day.hol ? 0.2 : 0.06)) return;
    var pr = pairAt(ctx, S, day.d, 'd');
    if (pr) kiss(ctx, pr[0], pr[1], { trig: 'hobi', place: ctx.rng() < 0.5 ? 'sofa' : 'kitchen', tag: 'ご褒美のキス' }, 'hobi');
  }
  /* ---------- 夜：仲直り・ごちそうさま・おやすみ（どれか一つ）。R18 の「そのまま夜へ」はその夜のきっかけへ ---------- */
  function nightCan(ctx, S, day) {
    return r18on() && !!HK.ShinkonR18 && S.sex < S.lewdMax && !(HK.Shinkon && HK.Shinkon.restNight && HK.Shinkon.restNight(ctx, day));
  }
  function night(ctx, S, day) {
    if (!S.love || day.sick || day.apart || day.d === S.days - 1) return;
    var st = stat(ctx), pr = pairAt(ctx, S, day.d, 'n');
    if (!pr) return;
    /* 三人婚：三人とも家にいる夜は、ときどき三人のキス */
    if (S.trio && S.C && spouses(S).every(function (c) { var p = lifeDay(c, day.d); return !p || !p.trip; }) && ctx.rng() < 0.18) {
      var T3 = spouses(S), t3 = KS.trio(ctx, T3[0], T3[1], T3[2]);
      if (t3 && ctx.act2({ actors: T3, cat: 'romance', text: t3, why: '新婚部屋：三人のキス（おやすみ）', fx: function () { ctx.mod2(T3[0], T3[1], { aff: 2, att: 2 }, { aff: 2, att: 2 }); ctx.mod2(T3[1], T3[2], { aff: 2, att: 2 }, { aff: 2, att: 2 }); } })) st.trio++;
      return;
    }
    var k = null;
    if (day.fought && S.makeups && ctx.rng() < 0.55) k = 'naka';
    else if (day.meal && day.mealK === 'DINNER' && ctx.rng() < 0.22) k = 'gochi';
    else if (ctx.rng() < (day.kissPromise ? 0.15 : 0.3)) k = 'oyasumi';
    if (!k) return;
    var can = k === 'oyasumi' && nightCan(ctx, S, day) && !day.kissPromise;
    var r = kiss(ctx, pr[0], pr[1], { trig: k, night: can, tag: KS.KISS_NAME[k] }, k);
    if (r && r.plan.end === 'night') { st.night++; day.kissLead = { a: r.plan.top, b: r.plan.bot, k: 'night' }; }
  }

  /* ---------- 差し込み：段の区切り（shinkon.js の phase）を包む ---------- */
  HK.wrap(scen, 'phase', function (ph0) {
    return function (ctx, s, n) {
      var S = ctx.sk, t = s % 3, last = S && s === S.days * 3 - 1;
      if (S) ctx._skkStep = s;
      if (S && t === 2 && S.day && !S.day.sick) evening(ctx, S, S.day);
      var sw = last ? swapLast(ctx, S) : null;
      try { ph0.apply(this, arguments); } finally { if (sw) sw(); }
      S = ctx.sk;
      if (!S || !S.day) return;
      if (t === 0 && S.day.d === Math.floor(s / 3)) morning(ctx, S, S.day);
      else if (t === 1) daytime(ctx, S, S.day);
    };
  });
  /* 結果の記録（ctx.flags.shinkon）に、キスの回数を足す（計測用。表示はしない） */
  HK.wrap(scen, 'finish', function (f0) {
    return function (ctx) { var r = f0.apply(this, arguments); if (ctx.flags && ctx.flags.shinkon && ctx.flags.shinkonKiss) ctx.flags.shinkon.kiss = ctx.flags.shinkonKiss; return r; };
  });
  /* 夜の段：願望の高まり（HK.Journal.add）を最初に数える場所＝仲直りのあと・願望の行動とエッチの前 */
  HK.wrap(HK.Journal, 'add', function (add0) {
    return function (ctx, c, n) {
      var S = S0(ctx);
      if (S && S.day && ctx._skkStep != null && ctx._skkStep % 3 === 2 && ctx._skkNight !== ctx._skkStep) {
        ctx._skkNight = ctx._skkStep;
        try { night(ctx, S, S.day); } catch (e) { if (HK.DEBUG) throw e; }
      }
      return add0.apply(this, arguments);
    };
  });

  /* ---------- 最後の夜の幸せなキス：型の長い版（今までの幸せなキスの文を始まりの段にする）。三人婚は三人のキス ---------- */
  var HAPPY = '二人は幸せなキスをした。';
  function swapLast(ctx, S) {
    var TX = HK.ShinkonText, st = stat(ctx);
    if (S.trio && HK.ShinkonTrio && HK.ShinkonTrio.T && HK.ShinkonTrio.T.KISS) {
      var TT = HK.ShinkonTrio.T, k0 = TT.KISS, L3 = (HK.KissText.LONG || {}).nagori || [];
      TT.KISS = [0, 1, 2].map(function () { return '最後の夜。' + KS.trioT(ctx) + '\n\n' + KS.fresh(ctx, L3).replace(/\{a\}と\{b\}/g, '三人') + '三人は幸せなキスをした。'; });
      st.last++;
      return function () { TT.KISS = k0; };
    }
    if (!S.love || !TX || !TX.KISS || !TX.KISS.length) return null;
    var A = S.A, B = S.B, rows = TX.KISS, row = rows[Math.floor(ctx.rng() * rows.length)];
    var lead = Array.isArray(row) ? row[Math.floor(ctx.rng() * row.length)] : String(row || '');
    lead = String(lead).replace(/二人は幸せなキスをした。$/, '');
    if (!lead) return null;
    var r = KS.text(ctx, A, B, { trig: 'fui', len: 'l', end: ctx.rng() < 0.5 ? 'hold' : 'nagori', lead: lead, tail: HAPPY });
    if (!r || !r.text) return null;
    var k1 = TX.KISS;
    TX.KISS = k1.map(function () { return [r.text]; });
    st.last++;
    return function () { TX.KISS = k1; };
  }

  /* r18:begin */
  /* @event scen=set-b-shinkon id=sk_night_kiss cat=romance tie=- tags=night label=朝のキスの約束の続きから始まる夜 */
  /* ---------- R18：朝の約束・おやすみのキスの「そのまま夜へ」を、その夜のエッチのきっかけの段に続ける ----------
     その夜の起こりやすさを上げ（願望の高まり day.urge）、きっかけの段（理由が「きっかけ：」の記録）の頭に一文を置く。{x}＝出かけた人・{y}＝見送った人 */
  var LEAD = {
    promise: [
      '朝の玄関で交わした「続きは帰ってから」を、{x}は一日じゅう忘れていなかった。帰ってきてからずっと、{y}と目が合うたびに、どちらからともなく視線をそらしていた。',
      '{y}は、朝の約束を覚えているのかどうか、{x}の顔をうかがっていた。寝る支度を終えた{x}が、{y}の袖をそっと引いた。{x}「＠{x}＠……朝の続き｜……朝の続きだ｜……朝の続きです」',
      '一日の終わり、{x}と{y}は並んで歯を磨きながら、鏡越しに何度も目を合わせた。朝、玄関で途中にしたままのキスが、二人ともずっと気になっていた。',
      '{x}は帰り道、朝のキスのことばかり考えていた。玄関で迎えた{y}の顔を見た瞬間、それが自分だけではなかったと分かった。'
    ],
    night: [
      'おやすみのキスで終わるはずだった。けれど唇を離しても、二人とも目を閉じようとはしなかった。',
      '軽く触れるだけのつもりだったおやすみのキスが、気づけば何度も重なっていた。二人の呼吸は、眠るにはもう熱すぎた。',
      '「おやすみ」の言葉は、いつの間にかどこかへ行ってしまった。{a}が{b}の頬を撫でると、{b}はその手に自分の手を重ねた。',
      'キスの余韻が残る暗がりで、{b}が{a}の服の裾を握った。眠るつもりなど、もう二人ともなかった。'
    ]
  };
  function pickL(ctx, l) { return KS.fresh(ctx, l); }
  if (HK.ShinkonR18 && HK.ShinkonR18.night) HK.wrap(HK.ShinkonR18, 'night', function (n0) {
    return function (ctx, A, B, day, last) {
      var S = S0(ctx), pk = day && day.kissPromise, kl = day && day.kissLead;
      if (!S || (!pk && !kl)) return n0.apply(this, arguments);
      var st = stat(ctx), lt = pk ? pickL(ctx, LEAD.promise) : pickL(ctx, LEAD.night), lead = '';
      if (pk) lead = lt.split('{x}').join(pk.x.name).split('{y}').join(pk.y.name);
      else lead = lt.split('{a}').join(kl.a.name).split('{b}').join(kl.b.name);
      lead = ctx.t ? ctx.t(lead, A, B) : lead;
      var u0 = day.urge, ub = day.urgeBy;
      day.urge = Math.max(day.urge || 0, pk ? 0.85 : 1);
      if (!day.urgeBy) day.urgeBy = pk ? pk.x : kl.a;
      var say0 = ctx.say, own = Object.prototype.hasOwnProperty.call(ctx, 'say'), done = false;
      ctx.say = function (o) {
        if (!done && o && o.kind === 'event' && /^きっかけ：/.test(o.why || '')) { done = true; o.text = lead + o.text; o.why = o.why + (pk ? '（朝のいってらっしゃいのキスの続き）' : '（おやすみのキスから）'); }
        return say0.apply(this, arguments);
      };
      var r;
      try { r = n0.apply(this, arguments); } finally { if (own) ctx.say = say0; else delete ctx.say; if (!r) { day.urge = u0; day.urgeBy = ub; } }
      if (r && done) { if (pk) st.promiseNight++; }
      return r;
    };
  });
  /* r18:end */
})();
