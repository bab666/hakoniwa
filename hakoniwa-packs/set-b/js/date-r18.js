/* r18:begin */
/* @event scen=set-b-date id=dt_night_ouchi cat=romance tie=- tags=night label=デート帰りに寄ったお家で結ばれる夜 */
/* @event scen=set-b-date id=dt_night_tomari cat=romance tie=- tags=night label=デートの夜にそのまま泊まって求め合う */
/* @event scen=set-b-date id=dt_night_hotel cat=romance tie=- tags=night label=デートの帰りにラブホテルへ入る夜 */
/* @event scen=set-b-date id=dt_night_yado cat=romance tie=- tags=night label=旅先の宿で二人きりの夜を過ごす */
/* @event scen=set-b-date id=dt_night_kaeru cat=romance tie=lover tags=night label=デート帰りの二人の家で続きをする */
/* @event scen=set-b-date id=dt_night_first cat=romance tie=- tags=night label=初めてのお泊まりで結ばれる夜 */
/* @event scen=set-b-date id=dt_night_car cat=romance tie=- tags=night label=帰り道に車を停めて車内で求め合う */
/* @event scen=set-b-date id=dt_night_trio cat=romance tie=- tags=night cond=三人の恋人の三人デート label=三人の恋人で過ごすデートの夜 */
/* @event scen=set-b-date id=dt_heat_r18 cat=romance tie=- tags=night label=デート中に人目を盗んで触れ合う */
/* @event scen=set-b-date id=dt_long_hotel cat=romance tie=- tags=night label=ラブホテルの部屋に入るなり始まる夜 */
/* @event scen=set-b-date id=dt_long_ouchi cat=romance tie=- tags=night label=デートの余韻のまま玄関で始まる夜 */
/* @event scen=set-b-date id=dt_long_car cat=romance tie=- tags=night label=夜景の見える駐車場の車の中で */
/* @event scen=set-b-date id=dt_long_yado cat=romance tie=- tags=night label=旅館の布団と浴衣で過ごす旅先の夜 */
/* @event scen=set-b-date id=dt_yoin_iri cat=romance tie=- tags=night label=デートの余韻のまま始まる夜（観覧車・映画・海など） */
/* @event scen=set-b-date id=dt_yoin_naka cat=romance tie=- tags=night label=夜の最中にデートの一日を思い出す一幕 */
/* @event scen=set-b-date id=dt_yoin_owari cat=romance tie=- tags=night label=デートの夜の終わり方（次の約束・写真・窓の灯り） */
/* @event scen=set-b-date id=dt_form_fade cat=romance tie=- tags=night label=夜の場面・ほのめかす（暗転と翌朝） */
/* @event scen=set-b-date id=dt_form_short cat=romance tie=- tags=night label=夜の場面・短い場面（デートの夜） */
/* @event scen=set-b-date id=dt_form_mid cat=romance tie=- tags=night label=夜の場面・中くらいの場面（反応と山場） */
/* @event scen=set-b-date id=dt_form_long cat=romance tie=- tags=night label=夜の場面・段落を分けた長い場面 */
/* デートの日々の夜（R18版だけ。全年齢版のパックを組み立てるとき、この印の間は落ちる。2026-11-03）
   ■ HK.DateR18（DR）
     ・DR.quota(ctx, 'none'|'low'|'mid'|'high')：一回の遊びのエッチの回数の上限（0／1／3／5）
     ・DR.can(ctx)：今夜エッチの場面を出せるか（回数が残っていて、体の関係にしてよい二人。受け攻めは HK.Pos.order）
     ・DR.night(ctx, br, day, last)：夜の分かれ道 br（ouchi お家に寄った／tomari 泊まった／hotel ラブホ／yado 旅先の宿／kaeru 一緒に暮らす家に帰った／car 帰り道の車の中）で、
       エッチの場面を出したら true。場面の直前に必ず「きっかけ」の段（記録の一件。理由の欄は「きっかけ：…」、e.tag＝'きっかけ'）：その日のデートの余韻・性欲・関係から、言い出した人の夜の態度9種の台詞
     ・恋愛感情の有無では止めない（本体の決まり）。恋人どうしでない二人は起こりやすさを少し下げる（不仲・敵対の二人は、喧嘩で途中で帰る日がある分だけ起こりにくい）
     ・長さ・山場・喘ぎは共通の部品 HK.PairR18（formOf・scene）。長い場面は、この部屋の専用の長い場面（HK.Play.addScene：ラブホ・お家の玄関・車の中・旅先の宿）が選ばれやすい
     ・DR.heatTail(ctx, 攻め, 受け, 場所, 舞台)：デート中の人目を盗んだキスのあとに足す、触れ合いの一文（R18版だけ。体の関係にしてよい二人）
     ・デートならではの夜（2026-11-04。不具合リスト 1104 の 11。文は date-r18-yoin-text.js）：その日のスポットの余韻 yo（観覧車・映画・海・湯上がり・夜景・はしゃいだ・買い物）で、
       きっかけの一文（LEAD_YO）・入り方（PLAY の yo の行が選ばれやすい）・長い場面の始まり（OPEN_YO）・最中の一幕（NAKA＋受けの態度9種の一言。短い・中くらいの場面）・
       終わり方（OWARI＋受けの態度9種の一言。ほのめかす以外）が変わる。一回の遊びで同じ文を二度出さない（S.used）
   文は date-r18-text.js（HK.DateR18Text）。体の語は印。登場人物はすべて成人として扱う */
(function () {
  'use strict';
  var HK = window.HK;
  var PR = HK.PairR18, DT = HK.Date;
  if (!PR || !DT || !HK.Journal) return;
  var J = HK.Journal, K = HK.PairKit;
  function TX() { return HK.DateR18Text || {}; }
  function pickOf(ctx, arr) { return arr && arr.length ? arr[Math.floor(ctx.rng() * arr.length)] : ''; }
  /* 一回の遊びで同じ始まり・ほのめかすの文を二度使わない */
  var CUR = null;
  function fresh(arr) { var U = CUR && CUR.dt && CUR.dt.used; if (!U || !arr) return arr; var q = arr.filter(function (x) { return !U['r18:' + x]; }); return q.length ? q : arr; }
  function remember(ctx, text, lists, a, b) { var U = ctx.dt.used; lists.forEach(function (l) { (l || []).forEach(function (x) { var k = ctx.t(String(x).replace(/「[^」]*」/g, ''), a, b).replace(/\{[^}]+\}/g, '').slice(0, 14); if (k && text.indexOf(k) >= 0) U['r18:' + x] = 1; }); }); }
  var SRC = { TX: TX, MO: function () { var T = TX(); return { OPEN: fresh(T.OPEN), REOPEN: fresh(T.OPEN), FADE: fresh(T.FADE), PEAK_E: PR.FB.peakE }; }, R: null, ok: function () { return DT.okText; } };
  var ENTRY = { ouchi: 'お家に寄った夜', tomari: '泊まった夜', hotel: 'ラブホの夜', yado: '旅先の宿の夜', kaeru: 'デート帰りの家の夜', first: '初めてのお泊まりの夜', car: '帰り道の車の中' };
  var FORM = { fade: 'ほのめかす', short: '短い場面', mid: '中くらいの場面', long: '長い場面' };
  function dedupe(t, a, b) {
    var seen = {}, nm = function (x) { return a && b ? x.split('{a}').join(a.name).split('{b}').join(b.name) : x; };
    return String(t).split('\n\n').map(function (para) {
      var out = '', cur = '', d = 0;
      for (var i = 0; i < para.length; i++) {
        var c = para.charAt(i); cur += c;
        if (c === '「') d++; else if (c === '」') d = Math.max(0, d - 1);
        if ((/[。！？\n]/.test(c) && !d) || (c === '」' && !d) || i === para.length - 1) { var k = nm(cur).replace(/\ue3a0[\s\S]*?\ue3a1/g, '').replace(/[「」『』\s]/g, ''); if (k.length >= 12 && seen[k]) { cur = ''; continue; } seen[k] = 1; out += cur; cur = ''; }
      }
      return out;
    }).filter(function (x) { return x; }).join('\n\n');
  }
  var DR = HK.DateR18 = { ENTRY: ENTRY, FORM: FORM };
  DR.quota = function (ctx, v) { return v === 'none' ? 0 : v === 'low' ? 1 : v === 'high' ? 5 : 3; };
  function pairOk(ctx) {
    var S = ctx.dt, A = S.A, B = S.B, P = HK.Pos;
    if (!PR.sexOk(ctx, A, B)) return null;
    if (P && P.okSex && !P.okSex(A, B)) return null;
    var o = P && P.order ? P.order(A, B) : [A, B], a = o[0], b = o[1], AV = HK.Avoid;
    if (AV && ((AV.topOk && !AV.topOk(ctx, a, b)) || (AV.okSex && !AV.okSex(ctx, a, b)))) return null;
    return [a, b];
  }
  DR.can = function (ctx) { var S = ctx.dt; return !!(S && S.sex < S.lewdMax && pairOk(ctx)); };
  /* デート中の触れ合いの一文（人目を盗んだキスのあと）：半分ほど */
  DR.heatTail = function (ctx, a, b, place, so) {
    var S = ctx.dt, T = TX();
    if (!S || S.lewdMax <= 0 || !pairOk(ctx) || ctx.rng() > 0.5) return '';
    var H = T.HEAT || {}, t = DT.pickT(ctx, (H[place] || []).concat(H.all || []), a, b, false, so || null);
    if (!t) return '';
    S.cnt.heatR18 = (S.cnt.heatR18 || 0) + 1;
    return t;
  };
  /* ---------- その日のスポットの余韻（yo）。最後にいた行き先ほど強く、最後のデートの観覧車の山場も ---------- */
  var YO_ID = { eiga: 'eiga', gekijo: 'eiga', planetarium: 'eiga', umi: 'umi', okinawa: 'umi', onsen: 'onsen', kyoto: 'onsen', tenbo: 'yakei', dinner: 'yakei', illumi: 'yakei', hanabi: 'yakei', hotel: 'yakei' };
  function yoOf(d) {
    var o = [], has = function (x) { return (' ' + (d.flags || '') + ' ').indexOf(' ' + x + ' ') >= 0; };
    if (has('kanran')) o.push('kanran');
    if (YO_ID[d.id]) o.push(YO_ID[d.id]);
    if (d.kind === 'fun') o.push('asobi');
    if (d.kind === 'shop') o.push('kaimono');
    return o;
  }
  function yoinOf(ctx, day) {
    var S = ctx.dt, P = day && day.P, W = {};
    if (!P) return '';
    var last = P.slots.length ? P.slots[P.slots.length - 1].d : P.main;
    P.slots.forEach(function (sl) { yoOf(sl.d).forEach(function (k, i) { W[k] = (W[k] || 0) + (sl.d === last ? 3 : 1) / (i + 1); }); });
    if (day.last && S.climax === 'kanran') W.kanran = (W.kanran || 0) + 4;
    var ks = Object.keys(W);
    if (!ks.length || ctx.rng() < 0.15) return '';
    return HK.weighted(ctx.rng, ks, function (k) { return W[k]; });
  }
  DR.yoinOf = yoinOf;
  /* 表の行から、余韻に合う行（yo が合う行を重く、合わない余韻の行は使わない） */
  function rowPick(ctx, rows, yo) {
    var ok = (rows || []).filter(function (r) { return !r.yo || r.yo.split(' ').indexOf(yo) >= 0; });
    if (!ok.length) return null;
    return HK.weighted(ctx.rng, ok, function (r) { return r.yo ? 4 : 1; });
  }
  /* 最中の一幕と受けの一言、終わり方と受けの一言（{a}＝攻め、{b}＝受け。名前は場面の組み立てで当てる） */
  /* 場面の部品は {date} を知らないので、先に「デート」「お出かけ」にする */
  function dw(ctx, t) { return String(t).split('{date}').join(ctx.dt && ctx.dt.dword || 'デート'); }
  function nakaOf(ctx, yo, a, b, sh) {
    var T = TX(), r = rowPick(ctx, T.NAKA_ROWS, yo); if (!r) return null;
    var t = DT.pickT(ctx, ((T.NAKA || {})[r.k] || {})[sh], a, b); if (!t) return null;
    var sy = DT.pickT(ctx, (T.NAKA_SAY || {})[PR.att(b, a)] || (T.NAKA_SAY || {}).gentle, a, b) || '';
    return { k: r.k, name: r.name, text: dw(ctx, t + (sy ? '\n\n' + sy : '')) };
  }
  function owariOf(ctx, yo, a, b, sh) {
    var T = TX(), r = rowPick(ctx, T.OWARI_ROWS, yo); if (!r) return null;
    var t = DT.pickT(ctx, ((T.OWARI || {})[r.k] || {})[sh], a, b); if (!t) return null;
    var sy = DT.pickT(ctx, (T.OWARI_SAY || {})[PR.att(b, a)] || (T.OWARI_SAY || {}).gentle, a, b) || '';
    return { k: r.k, name: r.name, text: dw(ctx, t + sy) };
  }

  /* 部屋の専用の長い場面（HK.Play.addScene）を選ぶための、今夜の分かれ道 */
  function curBr(ctx) { return ctx && ctx.dt && ctx.dt.curBr || ''; }
  DR.night = function (ctx, br, day, last) {
    var S = ctx.dt, env = ctx.env, LV = HK.Lewd, P = HK.Pos, A = S.A, B = S.B, T = TX();
    if (!T.PLAY || S.sex >= S.lewdMax) return false;
    var ab = pairOk(ctx);
    if (!ab) return false;
    var a = ab[0], b = ab[1], sh = PR.shape(a, b);
    var first = last && S.endK === 'tomari' && (br === 'tomari' || br === 'hotel');
    var p = { hotel: 1, tomari: 0.75, yado: S.couple ? 0.75 : 0.3, ouchi: 0.55, kaeru: 0.32, car: 1 }[br] || 0.4;
    if (first) p = 0.95;
    if (!S.couple && br !== 'hotel') p *= 0.78;
    if (br !== 'hotel' && br !== 'car') p *= P && P.libMul ? Math.min(1.5, P.libMul([A, B])) : 1;
    /* 喧嘩した日も止めない（その場で仲直りした夜。帰ってしまった日は夜の区切りが無い） */
    if (ctx.rng() > p) return false;
    var entry = first && br !== 'hotel' ? 'first' : br;
    /* 1. きっかけ：言い出す人（{a}）。ラブホ・車は性欲の強い方・夜の性格が攻めの方、ほかはデートの余韻から */
    var la = P && P.libK ? P.libK(A) : 1, lb = P && P.libK ? P.libK(B) : 1;
    var x = br === 'hotel' || br === 'car' ? (la > lb ? A : lb > la ? B : (ctx.rng() < 0.6 ? a : b)) : (ctx.rng() < 0.55 ? a : b), y = x === A ? B : A;
    var AV = HK.Avoid;
    if (AV && AV.of && AV.of(ctx, x, y)) { if (AV.of(ctx, y, x)) return false; var sw = x; x = y; y = sw; }
    var L0 = DT.pickT(ctx, (T.LEAD || {})[entry], x, y) || DT.pickT(ctx, (T.LEAD || {})[entry], x, y, true);
    /* その日のスポットの余韻（観覧車のあと・映画のあと・海のあと…）の一文 */
    var yo = br === 'car' ? '' : yoinOf(ctx, day), ly = yo && L0 ? DT.pickT(ctx, (T.LEAD_YO || {})[yo], x, y) : '';
    if (ly) L0 += ly;
    /* 初めてのお泊まりをラブホで：ホテルのきっかけに、初めての夜の一文を足す */
    if (first && br === 'hotel' && L0) L0 += DT.pickT(ctx, T.FIRST_ADD, x, y, true) || '';
    var FE = T.FEEL || {}, fe = DT.pickT(ctx, FE[PR.att(x, y)] || FE.gentle, x, y) || DT.pickT(ctx, FE.gentle, x, y, true);
    var FA = T.FANS || {}, fa = DT.pickT(ctx, FA[PR.att(y, x)] || FA.gentle, x, y) || DT.pickT(ctx, FA.gentle, x, y, true);
    if (!L0) return false;
    var dest = day.P && day.P.main ? day.P.main.name : '';
    var lt = DT.fill(ctx, L0 + (fe || '') + (fa || ''), x, y, { dest: dest });
    var lcat = S.love && (!ctx.romanceOk || ctx.romanceOk([x, y], false)) ? 'romance' : 'bond';
    var le = ctx.say({ kind: 'event', cat: lcat, actors: [x, y], text: lt, why: 'きっかけ：' + (first ? ENTRY.first + (br === 'hotel' ? '・ラブホ' : '') : ENTRY[entry]) + '（' + x.name + 'から・' + (dest ? dest + 'の' : '') + (S.love ? 'デートの余韻' : 'お出かけのあと') + (yo && T.YO_NAME ? '・' + T.YO_NAME[yo] : '') + '）', mag: 0 });
    if (le) le.tag = 'きっかけ';
    /* 2. 場面 */
    var lv = LV ? LV.lv(env) : 'mid', ero = !!(LV && LV.ero(env) && HK.ThickEro), nogen = !!(HK.NoGen && HK.NoGen.on && HK.NoGen.on(a, b));
    var form = PR.formOf(ctx, S, env, lv, nogen, last || S.sex + 1 >= S.lewdMax);
    SRC.R = { BOTTOM: T.BOTTOM_ROWS, TOP: T.TOP_ROWS };
    /* 入り方：その日の余韻に合う行（yo）が選ばれやすい。合わない余韻の行は使わない */
    var rows = T.PLAY_ROWS, play = J.pick(ctx, 'dtplay', rows, function (r) { if (r.br && r.br.indexOf(br) < 0) return 0; return r.yo ? (r.yo === yo ? 5 : 0) : 1; }) || rows[0], pi = rows.indexOf(play);
    /* デートならではの夜：入り方の本文に最中の一幕を続け、事後を終わり方にする（文はこの夜のために選んで、場面の部品に渡す） */
    var src = SRC, naka = null, owari = null, Tx2 = null, iri = '';
    if (form !== 'fade') {
      Tx2 = Object.create(T);
      var pr0 = T.PLAY[pi] || {}, pl0 = (form === 'short' || form === 'mid') && !(form === 'short' && ero) && !nogen ? DT.pickT(ctx, pr0[sh] || pr0.all, a, b) : '';
      if (pl0 && ctx.rng() < 0.75) naka = nakaOf(ctx, yo, a, b, sh);
      if (pl0) { var P2 = T.PLAY.slice(), o2 = {}; o2[sh] = [pl0 + (naka ? '\n\n' + naka.text : '')]; P2[pi] = o2; Tx2.PLAY = P2; }
      if (ctx.rng() < 0.7) owari = owariOf(ctx, yo, a, b, sh);
      if (owari) Tx2.AFTER = [owari.text];
      var oy = form === 'long' && yo && ctx.rng() < 0.7 ? DT.pickT(ctx, (T.OPEN_YO || {})[yo], a, b) : '';
      src = Object.assign({}, SRC, { TX: function () { return Tx2; }, MO: oy ? function () { var m = SRC.MO(); m.OPEN = [oy]; return m; } : SRC.MO });
      /* 入り方として出たもの（短い・中くらい：余韻の行の本文／長い：余韻の始まり） */
      iri = play && play.yo && pl0 ? play.k : oy && T.YO_NAME ? T.YO_NAME[yo] + 'の始まり' : '';
    }
    CUR = ctx; S.curBr = br;
    var full;
    try { full = PR.scene(ctx, S, env, a, b, sh, form, { lv: lv, ero: ero, nogen: nogen, play: play, pi: pi, afi: 0, jealTop: !!day.jeal && x === a, leadB: x === b, entry: entry, resume: false }, src); }
    finally { S.curBr = ''; }
    form = full.form;
    full.text = dedupe(full.text, a, b);
    remember(ctx, full.text, [T.OPEN, T.FADE], a, b);
    var e = ctx.act2({ actors: [a, b], cat: S.love ? 'romance' : 'bond', text: full.text, why: 'デートの日々：夜（' + FORM[form] + '・' + (first ? ENTRY.first : ENTRY[entry]) + (iri ? '・入り方：' + iri : '') + (naka ? '・最中：' + naka.name : '') + (owari ? '・終わり方：' + owari.name : '') + '）', sex: true, lewd: form !== 'fade',
      fx: function () { ctx.mod2(a, b, { aff: 4, att: 6, trust: 2 }, { aff: 4, att: 6, trust: 2 }); } });
    if (!e) { if (le) { var L = ctx.log, i = L.indexOf(le); if (i >= 0) L.splice(i, 1); } return false; }
    S.sex++;
    if (form === 'long') S.longN = (S.longN || 0) + 1;
    S.forms[form] = (S.forms[form] || 0) + 1;
    S.entries[first ? 'first' : entry] = (S.entries[first ? 'first' : entry] || 0) + 1;
    if (iri) S.cnt['iri_' + yo] = (S.cnt['iri_' + yo] || 0) + 1;
    if (naka) S.cnt['naka_' + naka.k] = (S.cnt['naka_' + naka.k] || 0) + 1;
    if (owari) S.cnt['owari_' + owari.k] = (S.cnt['owari_' + owari.k] || 0) + 1;
    return true;
  };

  /* ---------- 三人の恋人の三人デートの夜（本体の HK.Pos.trioPlan・HK.Trio3。直接の行為は plan の組だけ。形は受け攻めの設定から） ---------- */
  function okPair(ctx) { return function (x, y) { return PR.sexOk(ctx, x, y); }; }
  function trioPlan(ctx) {
    var S = ctx.dt, T = S && S.trio, P = HK.Pos;
    if (!T || T.k !== 'poly' || HK.SAFE_ON || !P || !P.trioPlan || !HK.Trio3) return null;
    var pl = P.trioPlan(S.A, S.B, T.C, { ok: okPair(ctx) });
    return pl && pl.pairs && pl.pairs.length >= 2 ? pl : null;
  }
  DR.trioCan = function (ctx) { var S = ctx.dt; return !!(S && S.sex < S.lewdMax && (trioPlan(ctx) || (HK.Trio3 && HK.Trio3.touchOk && S.trio && S.trio.k === 'poly' && HK.Trio3.touchOk([S.A, S.B, S.trio.C], okPair(ctx))))); };
  DR.trio = function (ctx, day, last) {
    var S = ctx.dt, Tr = S.trio, g = [S.A, S.B, Tr.C], X3 = HK.Trio3, P = HK.Pos, TT = TX().TRIO;
    if (!X3 || !TT || S.sex >= S.lewdMax) return false;
    var pl = trioPlan(ctx), touch = !pl && X3.touchOk && X3.touchOk(g, okPair(ctx));
    if (!pl && !touch) return false;
    var p = (Tr.nights ? 0.3 : 0.55) * (P && P.libMul ? Math.min(1.5, P.libMul(g)) : 1);
    if (last && !Tr.nights) p = 0.9;
    if (ctx.rng() > p) return false;
    var LV = HK.Lewd, env = ctx.env, lv = LV ? LV.lv(env) : 'mid';
    var a = g[Math.floor(ctx.rng() * 3)], bc = g.filter(function (c) { return c !== a; });
    var sp = touch ? null : X3.shapeOf(ctx, g, pl, { soft: true });
    if (!touch && !sp) return false;
    var nm = sp ? { t: sp.t.name, m: sp.m.name, u: sp.u.name } : {}, sub = function (t) { return String(t).replace(/\{([tmu])\}/g, function (m0, k) { return nm[k] || m0; }); };
    var pk = function (arr) { return arr[Math.floor(ctx.rng() * arr.length)]; };
    var dest = day.P && day.P.main ? day.P.main.name : '';
    var say3 = function (arr) { var t = DT.pickT(ctx, arr, a, bc[0]) || DT.pickT(ctx, arr, a, bc[0], true); return t ? DT.fill(ctx, t, a, bc[0], { c: bc[1].name, dest: dest }) : ''; };
    var lt = say3(TT.LEAD), fl = TT.FORM_LEAD[touch ? 'touch' : sp.p];
    if (!lt) return false;
    if (fl) lt += sub(pk(fl));
    var le = ctx.say({ kind: 'event', cat: 'romance', actors: g, text: lt, why: 'きっかけ：三人の夜（' + a.name + 'から・' + (dest ? dest + 'の' : '') + 'デートの余韻）', mag: 0 });
    if (le) le.tag = 'きっかけ';
    var text, why;
    if (touch) { text = X3.touchScene(ctx, [a, bc[0], bc[1]]); why = '三人とも攻めなので、口づけと手だけ'; }
    else if (lv === 'low') { text = say3(TT.FADE); why = 'ほのめかす'; }
    else {
      var short = !!(LV && LV.short && LV.short(env, ctx.rng));
      var body = X3.quick(ctx, g, { sp: sp, plan: pl, env: env, ero: !!(LV && LV.ero && LV.ero(env)), short: short, mid: short ? '' : sub(pk(TT.MID[sp.p] || TT.MID.ring)) });
      if (!body) { if (le) { var L0 = ctx.log, i0 = L0.indexOf(le); if (i0 >= 0) L0.splice(i0, 1); } return false; }
      text = body + '\n\n' + say3(TT.AFTER);
      why = (X3.FORM_JA && X3.FORM_JA[sp.p] || '') + '：' + { oneTwo: sp.t.name + 'が二人を', twoOne: sp.t.name + 'と' + sp.m.name + 'が' + sp.u.name + 'を', sandwich: '真ん中の' + sp.m.name + 'を挟んで', ring: '輪になって', show: sp.t.name + 'と' + sp.m.name + '、' + sp.u.name + 'は見守る' }[sp.p];
    }
    if (!text) return false;
    var e = ctx.act2({ actors: g, cat: 'romance', text: text, why: 'デートの日々：三人の夜（' + why + '）', sex: !touch, lewd: lv !== 'low', trioPairs: pl ? pl.pairs : [],
      fx: function () { ctx.mod2(g[0], g[1], { att: 4, aff: 2 }, { att: 4, aff: 2 }); ctx.mod2(g[0], g[2], { att: 4, aff: 2 }, { att: 4, aff: 2 }); ctx.mod2(g[1], g[2], { att: 4, aff: 2 }, { att: 4, aff: 2 }); } });
    if (!e) { if (le) { var L = ctx.log, i = L.indexOf(le); if (i >= 0) L.splice(i, 1); } return false; }
    Tr.nights = (Tr.nights || 0) + 1;
    if (!touch) { S.sex++; S.entries.trio = (S.entries.trio || 0) + 1; }
    return true;
  };

  /* ---------- この部屋でしか出ない長い場面（HK.Play.addScene。長い場面が選ばれた夜に、今夜の分かれ道に合うものが選ばれやすい） ---------- */
  var PL = HK.Play;
  if (PL && PL.addScene) {
    var ROOM = 'set-b-date';
    var W = function (br) { return function (ctx) { return curBr(ctx) === br || (br === 'ouchi' && curBr(ctx) === 'tomari') ? 6 : 0; }; };
    var LS = function () { return TX().LONG || {}; };
    var mk = function (key, part) { return function (ctx, a, b, mode) { var o = (LS()[key] || {})[part] || {}; var l = o[mode] || o.all || []; return l.length ? l[Math.floor((ctx && ctx.rng ? ctx.rng() : Math.random()) * l.length)] : ''; }; };
    /* @event-ok 部屋の専用の長い場面の登録（出来事の印はこのファイルの頭の dt_long_*） */
    ['hotel', 'ouchi', 'car', 'yado'].forEach(function (k) {
      PL.addScene(ROOM, { id: 'date-' + k, label: { hotel: 'ラブホテルの部屋に入るなり始まる夜', ouchi: 'デートの余韻のまま玄関で始まる夜', car: '夜景の見える駐車場の車の中で', yado: '旅館の布団と浴衣で過ごす旅先の夜' }[k],
        when: function (ctx) { return curBr(ctx) === k || (k === 'ouchi' && /^(tomari|kaeru)$/.test(curBr(ctx))); }, weight: W(k),
        play: k === 'car' ? { pos: 'zai', prop: 'chakui' } : { prop: 'none' },
        lead: mk(k, 'lead'),
        steps: [{ stage: 'undress', fn: mk(k, 'undress') }, { stage: 'fore', fn: mk(k, 'fore') }, { stage: 'after', fn: mk(k, 'after') }],
        tags: ['night'] });
    });
  }
})();
/* r18:end */
