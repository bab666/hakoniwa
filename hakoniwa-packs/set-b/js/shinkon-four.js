/* 新婚部屋：三人・四人で暮らす（両方のビルド。2026-11-04 利用者の指示「新婚部屋は 4 人まで暮らせるように」「3 人・4 人限定のシーンを追加」）
   ■ 家の顔ぶれ（shinkon.js の setup が決める）：S.spouses（新婚の夫婦。二人・三人婚・四人婚）＋ S.M（立場「同じ家で暮らす住人」＝同居人。立場がおまかせの三人目・四人目も）＝ S.H。
     同居人は恋愛・夜の相手にしない（出番の外は留守の印 gone。出番の場面のあいだだけ場に出す。本体の共通の出来事に混ざらない）。訪ねてくる住人（立場「他の住人（訪ねてくる側）」・名簿から訪れる住人）は S.G のまま
   ■ HK.ShinkonFour（F）
     ・F.dayAll(ctx, S, day)：家の全員のその日の予定（day.ph[番号]＝HK.Life.day）。F.at(S, day, c, part)：その区切りに家にいるか（出張でない。夜は帰りが遅い人も帰ってくる）
     ・F.roll(ctx, S, day)：その日の暮らしの場面を一つ決める（家に三人以上いるときだけ。day.house＝{ k, part }）。F.run(ctx, S, day, part)：その区切りの場面を出す
       種（文は shinkon-four-text.js の HK.ShinkonFourText.H）：kaji 家事の分担／souji 大掃除（一回の遊びで一度）／kaidashi 買い出しの手分け／kanbyo 一人が体調を崩して残りが看る（体調の状態の夜）／
       shokutaku みんなの食卓／osoi 誰かの帰りが遅い夜／furo 順番待ちの風呂
       展開：言い出す人の態度 9 種・人ごとの一文（家事・料理をする人／しない人で別の文。HK.Life.canChore／canCook）・掃除が苦手な人のやらかし・衝動の強い人の余計な買い物・
       受け止め方（本体の部屋の反応 HK.ShinkonReact の態度 9 種。運命の揺らぎでらしくない反応）・締め（全員が配偶者の家 fam／同居人のいる家 mix）・同居人と関係のある人の一文（関係の種類）・四人だけの一文
     ・四人婚（S.quad）：F.focus（その日の二人）・F.qRoll／F.qRun（四人の朝・日中・休日）・F.qHelp（困りごとに二人が駆けつける）・F.qNight（四人で眠る夜）・F.qKiss（最後の夜）・F.qSetup
   ■ R18版の昼の二人きり（ほかの人が仕事・外出）と四人の夜は shinkon-r18-four.js（HK.ShinkonR18Four）。台詞は3本。登場人物はすべて成人として扱う */
/* @event scen=set-b-shinkon id=sk_house_kaji cat=bond tie=- cond=家に三人以上 label=家事の分担を和気あいあいと決める */
/* @event scen=set-b-shinkon id=sk_house_souji cat=bond tie=- cond=家に三人以上・休日 label=家の全員で大掃除をする */
/* @event scen=set-b-shinkon id=sk_house_kaidashi cat=bond tie=- cond=家に三人以上 label=買い出しを手分けして出かける */
/* @event scen=set-b-shinkon id=sk_house_kanbyo cat=bond tie=- cond=家に三人以上・体調を崩した人がいる label=体調を崩した一人を残りの皆で看る */
/* @event scen=set-b-shinkon id=sk_house_shokutaku cat=bond tie=- cond=家に三人以上 label=家の全員で食卓を囲む夕飯 */
/* @event scen=set-b-shinkon id=sk_house_osoi cat=bond tie=- cond=家に三人以上・帰りが遅い人がいる label=帰りの遅い一人を皆で待つ夜 */
/* @event scen=set-b-shinkon id=sk_house_furo cat=bond tie=- cond=家に三人以上 label=順番待ちの風呂でひと騒ぎ */
/* @event scen=set-b-shinkon id=sk_quad_setup cat=romance tie=- cond=四人とも配偶者を選んだ label=四人の新婚の暮らしが始まる */
/* @event scen=set-b-shinkon id=sk_quad_morn cat=romance tie=- cond=四人婚 label=四人で迎えるにぎやかな朝 */
/* @event scen=set-b-shinkon id=sk_quad_day cat=romance tie=- cond=四人婚 label=四人で過ごす日中（4種） */
/* @event scen=set-b-shinkon id=sk_quad_date cat=romance tie=- cond=四人婚 label=四人で出かける休日（2種） */
/* @event scen=set-b-shinkon id=sk_quad_help cat=bond tie=- cond=四人婚 label=困りごとにほかの二人が駆けつける */
/* @event scen=set-b-shinkon id=sk_quad_night cat=romance tie=- cond=四人婚 label=四人で布団を並べて眠る夜 */
/* @event scen=set-b-shinkon id=sk_quad_kiss cat=romance tie=- cond=四人婚 label=最後の夜の四人のキス */
(function () {
  'use strict';
  var HK = window.HK;
  if (!HK) return;
  var F = HK.ShinkonFour = {};
  function SK() { return HK.Shinkon; }
  function LF() { return HK.Life; }
  function RC() { return HK.ShinkonReact; }
  function FT() { return HK.ShinkonFourText || {}; }
  function pk(ctx, arr) { return arr && arr.length ? arr[Math.floor(ctx.rng() * arr.length)] : null; }
  function shuffle(ctx, arr) { var a = arr.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(ctx.rng() * (i + 1)), t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
  var NUM = ['', '一人', '二人', '三人', '四人', '五人', '六人', '七人'];
  F.num = function (n) { return NUM[n] || n + '人'; };
  /* ---------- 家の顔ぶれ・その日の予定 ---------- */
  F.house = function (S) { return S.H || S.spouses || [S.A, S.B]; };
  F.multi = function (S) { return !!(S.trio || S.quad); };
  F.isMate = function (S, c) { return !!(S.M && S.M.indexOf(c) >= 0); };
  function holiday(d) { return d % 7 === 5 || d % 7 === 6; }
  F.dayAll = function (ctx, S, day) {
    var ph = day.ph = day.ph || {}, hol = day.hol, last = day.d === S.days - 1;
    F.house(S).forEach(function (c) {
      if (ph[c.i]) return;
      var p = c === S.A ? day.pa : c === S.B ? day.pb : LF().day(ctx, c, day.d, hol);
      /* 最後の日は全員が家にいる（出張は切り上げる） */
      if (p && p.trip && last) { p.trip = false; p.tripEnd = true; p.home = { m: true, d: p.hol, n: true }; }
      ph[c.i] = p;
    });
    if (S.trio && S.C) day.pc = ph[S.C.i] || day.pc;
    if (S.quad) { if (S.C) day.pc = ph[S.C.i]; if (S.D) day.pd = ph[S.D.i]; }
  };
  F.pOf = function (S, day, c) { return day && day.ph ? day.ph[c.i] : null; };
  /* その区切りに家にいるか：出張でない。日中は休日か家で過ごす日。朝・夜は家にいる（帰りが遅い人も夜には帰る） */
  F.at = function (S, day, c, part) {
    var p = F.pOf(S, day, c);
    if (!p) return true;
    if (p.trip) return false;
    if (part === 'd') return !!(p.hol || (p.home && p.home.d));
    return true;
  };
  F.here = function (S, day, part, noLate) {
    return F.house(S).filter(function (c) { var p = F.pOf(S, day, c); return F.at(S, day, c, part) && !(noLate && p && p.late) && c.alive !== false; });
  };
  /* 同居人を、出番の場面のあいだだけ場に出す（留守の印 gone を外す） */
  function onStage(S, M, fn) {
    var off = M.filter(function (c) { return c.gone; });
    off.forEach(function (c) { c.gone = false; });
    try { return fn(); } finally { off.forEach(function (c) { c.gone = true; }); }
  }
  /* 恋愛の文を出してよい二人（夫婦の二人で、恋愛にしてよい組） */
  function spPair(ctx, S, x, y) {
    if (!S.love || !x || !y || x === y) return false;
    if (S.spouses.indexOf(x) < 0 || S.spouses.indexOf(y) < 0) return false;
    return SK().canLove2(ctx, x, y);
  }
  /* 文を引いて名前を当てる。{c}{d}{all}{rest} は ex で */
  function exOf(M, a, b, extra) {
    var rest = M.filter(function (c) { return c !== a && c !== b; });
    var ex = { all: F.num(M.length), rest: rest.map(function (c) { return c.name; }).join('と'), c: rest[0] ? rest[0].name : '', d: rest[1] ? rest[1].name : '' };
    if (extra) Object.keys(extra).forEach(function (k) { ex[k] = extra[k]; });
    return ex;
  }
  function line(ctx, M, arr, a, b, extra) {
    var t = SK().pickT(ctx, arr, a, b || a);
    return t ? SK().fill(ctx, t, a, b || a, exOf(M, a, b, extra)) : '';
  }
  /* 受け止め方（本体の部屋の反応 態度 9 種。らしくない反応もある）。夫婦でない二人には恋愛・結婚の語の文を使わない */
  function react(ctx, S, kind, who, other, p) {
    if (!RC() || !who || !other || ctx.rng() > p) return { t: '', odd: false };
    var r = RC().say(ctx, kind, who, other);
    if (!r.text) return { t: '', odd: false };
    var sp = spPair(ctx, S, who, other);
    if (!sp && (SK().ROM.test(r.text) || SK().WED.test(r.text))) return { t: '', odd: false };
    if (!SK().okText(ctx, r.text, who, other)) return { t: '', odd: false };
    var t = SK().fill(ctx, r.text, who, other);
    if (r.odd) t += SK().fill(ctx, RC().after(ctx, sp), who, other);
    return { t: t, odd: r.odd };
  }
  function per(c) { return RC() ? RC().per(c) : 'gentle'; }
  function chore(c) { return LF().canChore(c); }
  function cook(c) { return LF().canCook(c); }
  /* 言い出す人：段取りの得意な態度・気質ほど選ばれやすい */
  var LEAD_W = { stern: 2.2, polite: 1.8, proud: 1.8, cool: 1.5, devoted: 1.4, gentle: 1.2, free: 1.2, tsun: 1, shy: 0.6 };
  function leaderOf(ctx, list) { return HK.weighted(ctx.rng, list, function (c) { return (LEAD_W[per(c)] || 1) * (0.5 + ((c.tr && c.tr.cp) || 0.5)); }); }
  /* 締め：全員が配偶者の家（fam）／同居人のいる家（mix：夫婦の二人と同居人 {g}） */
  function endLine(ctx, S, M, E, focus, notG) {
    var sp = M.filter(function (c) { return S.spouses.indexOf(c) >= 0; }), mt = M.filter(function (c) { return F.isMate(S, c); });
    if (!mt.length) { var a = focus && sp.indexOf(focus) >= 0 ? focus : sp[0], b = sp.filter(function (c) { return c !== a; })[0]; return line(ctx, M, E.fam, a, b); }
    if (sp.length < 2) return '';
    var g = pk(ctx, mt.filter(function (c) { return c !== notG; })) || (notG ? null : pk(ctx, mt)), A0 = sp[0], B0 = sp[1];
    if (!g) return '';
    return line(ctx, M, E.mix, A0, B0, { g: g.name, gs: mt.map(function (c) { return c.name; }).join('と') });
  }
  /* 同居人と関係のある配偶者の一文 */
  function mateLine(ctx, S, M, p) {
    var mt = M.filter(function (c) { return F.isMate(S, c); });
    if (!mt.length || ctx.rng() > p) return '';
    var g = pk(ctx, mt), V = HK.PairVisit, sp = M.filter(function (c) { return S.spouses.indexOf(c) >= 0; });
    var best = null, cls = 'none';
    sp.forEach(function (a) { var k = V ? V.cls(ctx, a, g) : null; if (k && !best) { best = a; cls = k; } });
    if (cls === 'ex') cls = 'known';
    var a = best || sp[0];
    if (!a) return '';
    return line(ctx, M, FT().MATE[cls] || FT().MATE.none, a, a, { g: g.name, gl: V ? V.word(ctx, a, g) : '' });
  }
  function emit(ctx, S, M, kind, text, why, fx, odd) {
    if (!text) return null;
    var e = onStage(S, M, function () { return ctx.act2({ actors: M.slice(), cat: 'bond', text: text, odd: !!odd, why: '新婚部屋：' + why, fx: fx }); });
    if (e) { S.houseN = (S.houseN || 0) + 1; var U = S.houseK = S.houseK || {}; U[kind] = (U[kind] || 0) + 1; if (odd) S.odd = (S.odd || 0) + 1; }
    return e;
  }
  function warmAll(ctx, M, x, n) { return function () { M.forEach(function (o) { if (o !== x) ctx.mod2(x, o, { aff: n, trust: 1 }, { aff: n, trust: 1 }); }); }; }
  var KN = { kaji: '家事の分担', souji: '大掃除', kaidashi: '買い出しの手分け', kanbyo: '皆で看病', shokutaku: 'みんなの食卓', osoi: '帰りの遅い人を待つ夜', furo: '順番待ちの風呂' };
  F.KN = KN;

  /* ---------- その日の場面を決める ---------- */
  F.roll = function (ctx, S, day) {
    day.house = null;
    if (F.house(S).length < 3) return;
    F.dayAll(ctx, S, day);
    var U = S.houseK || {}, H = F.house(S), W = [];
    var add = function (k, part, w) { if (w > 0) W.push({ k: k, part: part, w: w / (1 + (U[k] || 0) * 0.8) }); };
    if (day.sick) {
      /* 体調を崩した人と、夜に家にいるほかの二人以上 */
      var carers = F.here(S, day, 'n').filter(function (c) { return c !== day.sick; });
      if (carers.length >= 2 && !(U.kanbyo >= 2)) day.house = { k: 'kanbyo', part: 'n' };
      return;
    }
    if (ctx.rng() > 0.55) return;
    var nD = F.here(S, day, 'd').length, nN = F.here(S, day, 'n').length, nNL = F.here(S, day, 'n', true).length;
    var late = H.filter(function (c) { var p = F.pOf(S, day, c); return p && !p.trip && p.late; });
    if (day.hol && nD >= 3) {
      if (!S.soujiDone && !day.dull) add('souji', 'd', (day.date && day.date.m === 12 ? 2.5 : 0.8));
      add('kaji', 'd', 1);
      if (!day.dull) add('kaidashi', 'd', 0.8);
    }
    if (nNL >= 3) { add('shokutaku', 'n', 1); add('kaji', 'n', 0.35); if (!day.dull) add('kaidashi', 'n', 0.3); }
    if (nN >= 3) add('furo', 'n', 0.6);
    if (late.length && nNL >= 2) add('osoi', 'n', 2);
    if (!W.length) return;
    var x = HK.weighted(ctx.rng, W, function (o) { return o.w; });
    day.house = { k: x.k, part: x.part };
    /* みんなの食卓の夜は、二人の夕飯の段を出さない */
    if (x.k === 'shokutaku' && day.meal && day.mealK !== 'BREAKFAST') day.meal = null;
  };
  F.run = function (ctx, S, day, part) {
    var h = day.house;
    if (!h || h.part !== part || h.done || !FT().H) return;
    h.done = true;
    var fn = RUN[h.k];
    if (fn) fn(ctx, S, day, part);
  };
  var RUN = {
    kaji: function (ctx, S, day, part) {
      var M = F.here(S, day, part, part === 'n'), T = FT().H.kaji, doers = M.filter(chore);
      if (M.length < 3 || doers.length < 2) return;
      var ld = leaderOf(ctx, doers), others = shuffle(ctx, M.filter(function (c) { return c !== ld; }));
      var parts = [line(ctx, M, T.open[per(ld)] || T.open.gentle, ld, others[0])];
      others.forEach(function (x) { parts.push(line(ctx, M, chore(x) ? T.do : T.no, x, ld)); });
      if (M.length === 4 && doers.length === 4 && ctx.rng() < 0.45) { var q = others; parts.push(line(ctx, M, T.q4, ld, q[0])); }
      var r = react(ctx, S, 'warm', pk(ctx, others), ld, 0.5);
      if (r.t) parts.push(r.t);
      parts.push(mateLine(ctx, S, M, 0.35), endLine(ctx, S, M, T.end, ld));
      emit(ctx, S, M, 'kaji', parts.filter(Boolean).join(''), KN.kaji + '（' + ld.name + 'が割り振った・' + F.num(M.length) + '）', warmAll(ctx, M, ld, 2), r.odd);
    },
    souji: function (ctx, S, day, part) {
      var M = F.here(S, day, part), T = FT().H.souji, doers = M.filter(chore);
      if (M.length < 3 || doers.length < 2) return;
      S.soujiDone = true;
      var ld = leaderOf(ctx, doers), others = shuffle(ctx, M.filter(function (c) { return c !== ld; }));
      var p1 = [line(ctx, M, T.open[per(ld)] || T.open.gentle, ld, others[0])], p2 = [];
      others.forEach(function (x) { p1.push(line(ctx, M, chore(x) ? T.do : T.no, x, ld)); });
      if (M.length === 4 && doers.length === 4 && ctx.rng() < 0.45) p1.push(line(ctx, M, T.q4, ld, others[0]));
      /* 家事が苦手（ポンコツ）な人のやらかし */
      var cl = doers.filter(function (c) { return LF().clumsy(c); }), odd = false, why = KN.souji + '（' + ld.name + 'が言い出した・' + F.num(M.length) + '）';
      if (cl.length && ctx.rng() < 0.6) {
        var oc = pk(ctx, cl), ob = ld !== oc ? ld : others.filter(function (c) { return c !== oc; })[0];
        p2.push(line(ctx, M, T.oops, oc, ob));
        var r = react(ctx, S, 'oops', ob, oc, 0.6); if (r.t) { p2.push(r.t); odd = r.odd; }
        why += '・' + oc.name + 'のやらかし';
      }
      if (ctx.rng() < 0.5) { var fa = pk(ctx, M), fb = pk(ctx, M.filter(function (c) { return c !== fa; })); p2.push(line(ctx, M, T.find, fa, fb)); }
      p2.push(mateLine(ctx, S, M, 0.3), endLine(ctx, S, M, T.end, ld));
      emit(ctx, S, M, 'souji', p1.filter(Boolean).join('') + '\n\n' + p2.filter(Boolean).join(''), why, warmAll(ctx, M, ld, 2), odd);
    },
    kaidashi: function (ctx, S, day, part) {
      var M = F.here(S, day, part, part === 'n'), T = FT().H.kaidashi;
      if (M.length < 3) return;
      var pl = leaderOf(ctx, M), others = shuffle(ctx, M.filter(function (c) { return c !== pl; })), parts = [line(ctx, M, T.open, pl, others[0])];
      if (M.length === 4 && ctx.rng() < 0.6) {
        /* 二組に分かれる：夫婦の組を先に */
        var a = pl, b = others.filter(function (c) { return spPair(ctx, S, a, c); })[0] || others[0];
        parts.push(line(ctx, M, T.q4, a, b));
      } else M.slice(0, 3).forEach(function (x) { parts.push(line(ctx, M, T.part, x, pl)); });
      var imp = M.slice().sort(function (x, y) { return ((y.tr && y.tr.impulse) || 0) - ((x.tr && x.tr.impulse) || 0); })[0];
      if (imp && (((imp.tr && imp.tr.impulse) || 0) > 0.55 || per(imp) === 'free') && ctx.rng() < 0.6) parts.push(line(ctx, M, T.extra, imp, pl));
      var r = react(ctx, S, 'warm', pk(ctx, others), pl, 0.4);
      if (r.t) parts.push(r.t);
      parts.push(endLine(ctx, S, M, T.end, pl));
      emit(ctx, S, M, 'kaidashi', parts.filter(Boolean).join(''), KN.kaidashi + '（' + pl.name + 'が段取りした・' + F.num(M.length) + '）', warmAll(ctx, M, pl, 1), r.odd);
    },
    kanbyo: function (ctx, S, day, part) {
      var s = day.sick, M = F.here(S, day, part), cr = shuffle(ctx, M.filter(function (c) { return c !== s; })), T = FT().H.kanbyo;
      if (!s || cr.length < 2) return;
      if (day.carer && cr.indexOf(day.carer) > 0) { cr.splice(cr.indexOf(day.carer), 1); cr.unshift(day.carer); }
      var names = cr.map(function (c) { return c.name; }).join('と');
      var parts = [SK().fill(ctx, SK().pickT(ctx, T.open, cr[0], s), cr[0], s, { rest: names, all: F.num(M.length) })], did = {};
      cr.forEach(function (x) {
        var k = cook(x) && !did.cook ? 'cook' : chore(x) && !did.chore ? 'chore' : 'other';
        did[k] = 1;
        parts.push(line(ctx, M, T[k], x, s));
      });
      /* 看病を受ける人の受け止め方（態度 9 種。看病の部品 HK.ShinkonSick.REACT） */
      var RE = HK.ShinkonSick && HK.ShinkonSick.REACT;
      if (RE && ctx.rng() < 0.6) { var a0 = pk(ctx, cr), rt = SK().pickT(ctx, RE[per(s)] || RE.gentle, a0, s); if (rt) parts.push(SK().fill(ctx, rt, a0, s)); }
      var mt = cr.filter(function (c) { return F.isMate(S, c); }), E;
      if (!mt.length) E = SK().pickT(ctx, T.end.fam, cr[0], s);
      else E = SK().pickT(ctx, T.end.mix, cr[0], s);
      if (E) parts.push(SK().fill(ctx, E, cr[0], s, { rest: names, g: mt.length ? pk(ctx, mt).name : '', all: F.num(M.length) }));
      emit(ctx, S, M, 'kanbyo', parts.filter(Boolean).join(''), KN.kanbyo + '（' + s.name + 'が体調を崩した・' + names + 'が看た）',
        function () { cr.forEach(function (x) { ctx.mod2(x, s, { aff: 1, trust: 1 }, { aff: 2, trust: 2 }); }); });
    },
    shokutaku: function (ctx, S, day, part) {
      var M = F.here(S, day, part, true), T = FT().H.shokutaku;
      if (M.length < 3) return;
      var cooks = M.filter(cook), ck = cooks.length && ctx.rng() < 0.78 ? LF().cookOf(ctx, cooks) : null, a = ck || pk(ctx, M);
      var others = shuffle(ctx, M.filter(function (c) { return c !== a; })), parts = [line(ctx, M, ck ? T.cook : T.deli, a, others[0])];
      others.slice(0, 2).forEach(function (x) { parts.push(line(ctx, M, chore(x) ? T.help : T.sit, x, a)); });
      var t1 = pk(ctx, M), t2 = pk(ctx, M.filter(function (c) { return c !== t1; }));
      parts.push(line(ctx, M, T.talk, t1, t2));
      if (M.length === 4 && ctx.rng() < 0.5) parts.push(line(ctx, M, T.q4, a, others[0]));
      var r = ck ? react(ctx, S, 'warm', pk(ctx, others), ck, 0.45) : { t: '', odd: false };
      if (r.t) parts.push(r.t);
      parts.push(mateLine(ctx, S, M, 0.3), endLine(ctx, S, M, T.end, a, ck));
      emit(ctx, S, M, 'shokutaku', parts.filter(Boolean).join(''), KN.shokutaku + '（' + (ck ? ck.name + 'が作った' : a.name + 'が出前を頼んだ') + '・' + F.num(M.length) + '）', warmAll(ctx, M, a, 1), r.odd);
    },
    osoi: function (ctx, S, day, part) {
      var H = F.house(S), late = H.filter(function (c) { var p = F.pOf(S, day, c); return p && !p.trip && p.late; });
      var b = pk(ctx, late), W = b ? F.here(S, day, part, true).filter(function (c) { return c !== b; }) : [], T = FT().H.osoi;
      if (!b || W.length < 2) return;
      var M = W.concat([b]), names = W.map(function (c) { return c.name; }).join('と'), ex = { rest: names, all: F.num(M.length) };
      var parts = [SK().fill(ctx, SK().pickT(ctx, T.open, W[0], b), W[0], b, ex)], kept = false;
      shuffle(ctx, W).slice(0, 2).forEach(function (x) {
        var k = cook(x) && !kept && ctx.rng() < 0.6 ? 'keep' : 'wait';
        if (k === 'keep') kept = true;
        parts.push(line(ctx, M, T[k], x, b));
      });
      parts.push(SK().fill(ctx, SK().pickT(ctx, T.home, W[0], b), W[0], b, ex));
      var rw = pk(ctx, W), r = react(ctx, S, 'wait', rw, b, 0.5);
      if (r.t) parts.push(r.t);
      /* 締め：全員が配偶者なら fam。同居人がいるなら、帰りの遅い人が配偶者で、待つ人に配偶者と同居人がいるときだけ mix */
      var mt = W.filter(function (c) { return F.isMate(S, c); }), spW = W.filter(function (c) { return S.spouses.indexOf(c) >= 0; }), E = '';
      if (!mt.length) E = SK().fill(ctx, SK().pickT(ctx, T.end.fam, W[0], b) || '', W[0], b, ex);
      else if (S.spouses.indexOf(b) >= 0 && spW.length) E = SK().fill(ctx, SK().pickT(ctx, T.end.mix, spW[0], b) || '', spW[0], b, { g: pk(ctx, mt).name });
      parts.push(E);
      emit(ctx, S, M, 'osoi', parts.filter(Boolean).join(''), KN.osoi + '（' + b.name + 'の帰りが遅かった）', function () { W.forEach(function (x) { ctx.mod2(x, b, { aff: 1 }, { aff: 2, trust: 1 }); }); }, r.odd);
      day.houseLate = b;
    },
    furo: function (ctx, S, day, part) {
      var M = F.here(S, day, part), T = FT().H.furo;
      if (M.length < 3) return;
      var o = shuffle(ctx, M), parts = [line(ctx, M, T.open, o[0], o[1])];
      o.slice(0, 3).forEach(function (x) { parts.push(line(ctx, M, T.att[per(x)] || T.att.gentle, x, o[0] === x ? o[1] : o[0])); });
      var sp = M.filter(function (c) { return S.spouses.indexOf(c) >= 0; }), pr = null;
      for (var i = 0; i < sp.length && !pr; i++) for (var j = i + 1; j < sp.length && !pr; j++) if (spPair(ctx, S, sp[i], sp[j])) pr = [sp[i], sp[j]];
      if (pr && ctx.rng() < 0.35) parts.push(line(ctx, M, T.pair, pr[0], pr[1]));
      if (M.length === 4 && ctx.rng() < 0.5) parts.push(line(ctx, M, T.q4, o[3], o[0]));
      parts.push(mateLine(ctx, S, M, 0.3), endLine(ctx, S, M, T.end, o[0]));
      emit(ctx, S, M, 'furo', parts.filter(Boolean).join(''), KN.furo + '（' + F.num(M.length) + '）', warmAll(ctx, M, o[0], 1));
    }
  };

  /* ---------- 四人婚 ---------- */
  F.say = function (ctx, arr, a, b, c, d, ex) {
    var t = SK().pickT(ctx, arr, a, b);
    if (!t) return '';
    var e = { c: c ? c.name : '', d: d ? d.name : '' };
    if (ex) Object.keys(ex).forEach(function (k) { e[k] = ex[k]; });
    return SK().fill(ctx, t, a, b, e);
  };
  F.qSetup = function (ctx, S, home) { var T = S.spouses; return F.say(ctx, FT().Q.SETUP, T[0], T[1], T[2], T[3], { home: home }); };
  /* その日の二人（体調を崩した人と看る人、出張でない二人、ほかは日ごとに回す）。S.C・S.D＝ほかの二人 */
  F.focus = function (ctx, S, d) {
    var T = S.spouses, k = S.sick, pair, hol = holiday(d);
    if (S.quadOff == null) S.quadOff = Math.floor(ctx.rng() * 6);
    var P = [[T[0], T[1]], [T[2], T[3]], [T[0], T[2]], [T[1], T[3]], [T[0], T[3]], [T[1], T[2]]];
    if (k && !k.done && d <= k.last + 1 && k.carer) pair = [k.c, k.carer];
    else {
      var home = d === S.days - 1 ? T : T.filter(function (c) { return !LF().day(ctx, c, d, hol).trip; });
      var ok = P.filter(function (p) { return home.indexOf(p[0]) >= 0 && home.indexOf(p[1]) >= 0; });
      pair = home.length === 2 ? home : ok.length ? ok[(d + S.quadOff) % ok.length] : P[(d + S.quadOff) % 6];
    }
    S.A = pair[0]; S.B = pair[1];
    var rest = T.filter(function (c) { return c !== S.A && c !== S.B; });
    S.C = rest[0]; S.D = rest[1];
  };
  F.allHome = function (S, day, part) { return S.spouses.every(function (c) { return F.at(S, day, c, part || 'n'); }); };
  F.qRoll = function (ctx, S, day) {
    if (day.sick || !F.allHome(S, day, 'm')) return;
    day.quadM = ctx.rng() < 0.4;
    var Q = FT().Q, U = S.quadUsed = S.quadUsed || {};
    if (!Q) return;
    if (day.hol && !day.dull && ctx.rng() < 0.5) { var dk = Object.keys(Q.DATE).filter(function (k) { return !U[k]; }); if (dk.length) { day.quadD = { k: pk(ctx, dk), date: true }; U[day.quadD.k] = 1; } }
    else if (ctx.rng() < 0.36) { var yk = Object.keys(Q.DAY).filter(function (k) { return !U[k]; }); if (yk.length) { day.quadD = { k: pk(ctx, yk) }; U[day.quadD.k] = 1; } }
  };
  var QKN = { eiga: '映画', ban: '当番表', yaki: 'ヤキモチ', hanashi: '夜更けの話', kouen: '公園', gaishoku: '四人で食事' };
  F.qRun = function (ctx, S, day, part) {
    var Q = FT().Q;
    if (!Q || day.sick) return;
    var o = shuffle(ctx, S.spouses), all4 = function (fx) { return function () { for (var i = 0; i < 4; i++) for (var j = i + 1; j < 4; j++) ctx.mod2(o[i], o[j], fx, fx); }; };
    if (part === 'm' && day.quadM && F.allHome(S, day, 'm')) {
      day.quadM = false;
      var mt = F.say(ctx, Q.MORN, o[0], o[1], o[2], o[3]);
      if (mt) ctx.act2({ actors: o, cat: 'romance', text: mt, why: '新婚部屋：四人の朝', fx: all4({ aff: 1 }) });
    }
    if (part === 'd' && day.quadD && !day.quadD.done && F.allHome(S, day, 'd')) {
      day.quadD.done = true;
      var X = day.quadD, tt = F.say(ctx, (X.date ? Q.DATE : Q.DAY)[X.k], o[0], o[1], o[2], o[3]);
      if (tt) ctx.act2({ actors: o, cat: 'romance', text: tt, why: '新婚部屋：四人の' + (X.date ? '休日（' : '日中（') + QKN[X.k] + '）', fx: all4({ aff: 2, att: 1 }) });
    }
  };
  /* 困りごとにほかの二人が駆けつける（{a}{b}＝困りごとの二人、{c}{d}＝駆けつける二人）。駆けつけた二人を返す */
  F.qHelp = function (ctx, S, day, a, b) {
    var cd = S.spouses.filter(function (c) { return c !== a && c !== b && F.at(S, day, c, 'n'); });
    if (cd.length < 2) return null;
    var t = F.say(ctx, FT().Q.HELP, a, b, cd[0], cd[1]);
    return t ? { t: t, who: cd } : null;
  };
  F.qNight = function (ctx, S, day) {
    if (!F.allHome(S, day, 'n')) return false;
    var o = shuffle(ctx, S.spouses), t = F.say(ctx, FT().Q.NIGHT, o[0], o[1], o[2], o[3]);
    if (!t) return false;
    return !!ctx.act2({ actors: o, cat: 'romance', text: t, why: '新婚部屋：四人で眠る夜', fx: function () { ctx.mod2(o[0], o[1], { aff: 1 }, { aff: 1 }); ctx.mod2(o[0], o[2], { aff: 1 }, { aff: 1 }); ctx.mod2(o[0], o[3], { aff: 1 }, { aff: 1 }); } });
  };
  F.qKiss = function (ctx, S) {
    var T = S.spouses, kt = F.say(ctx, FT().Q.KISS, T[0], T[1], T[2], T[3]);
    if (!kt) return false;
    return !!ctx.act2({ actors: T.slice(), cat: 'romance', text: kt, why: '新婚部屋：最後の夜（四人の幸せなキス）', fx: function () { for (var i = 0; i < 4; i++) for (var j = i + 1; j < 4; j++) ctx.mod2(T[i], T[j], { aff: 5, att: 5 }, { aff: 5, att: 5 }); } });
  };
})();
