/* r18:begin */
/* @event-ok 夜・三人・四人の夜に、性行為の相手に選び合っただけの二人・輪（恋人ではない）の体だけの版のきっかけ・事後の文を足した（新しい出来事ではない。2026-11-06） */
/* @event scen=set-b-date id=dt_night_ouchi cat=romance tie=- tags=night label=デート帰りに寄ったお家で結ばれる夜 */
/* @event scen=set-b-date id=dt_night_tomari cat=romance tie=- tags=night label=デートの夜にそのまま泊まって求め合う */
/* @event scen=set-b-date id=dt_night_hotel cat=romance tie=- tags=night label=デートの帰りにラブホテルへ入る夜 */
/* @event scen=set-b-date id=dt_night_yado cat=romance tie=- tags=night label=旅先の宿で二人きりの夜を過ごす */
/* @event scen=set-b-date id=dt_night_kaeru cat=romance tie=lover tags=night label=デート帰りの二人の家で続きをする */
/* @event scen=set-b-date id=dt_night_first cat=romance tie=- tags=night label=初めてのお泊まりで結ばれる夜 */
/* @event scen=set-b-date id=dt_night_car cat=romance tie=- tags=night label=帰り道に車を停めて車内で求め合う */
/* @event scen=set-b-date id=dt_night_trio cat=romance tie=- tags=night cond=三人の恋人の三人デート label=三人の恋人で過ごすデートの夜 */
/* @event scen=set-b-date id=dt_night_quad cat=romance tie=- tags=night cond=四人の輪がそろったダブルデート label=ダブルデートの帰りに四人で過ごす夜 */
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
/* @event scen=set-b-date id=dt_night_uchi cat=romance tie=- tags=night label=おうちデートの家でそのまま迎える夜 */
/* @event scen=set-b-date id=dt_night_none cat=bond tie=- tags=night label=夜の場面が無かった二人のわけ */
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
  var ENTRY = { ouchi: 'お家に寄った夜', tomari: '泊まった夜', hotel: 'ラブホの夜', yado: '旅先の宿の夜', kaeru: 'デート帰りの家の夜', first: '初めてのお泊まりの夜', car: '帰り道の車の中', uchi: 'おうちデートの夜' };
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
    /* 片想い・両片想いの二人は、想いを告げて付き合い始めるまで体の関係にしない（2026-11-05 報告「3 回目の夜にエッチ→4 回目に告白」） */
    if (S.pine && !S.confessed) return null;
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
  /* 行き先ごとの余韻（2026-11-05：プラネタリウムの日に「映画のあと」、イルミネーションに行っていない日に「光の中を歩いた余韻」が出ていたので、行き先ごとに分けた） */
  var YO_ID = { eiga: 'eiga', gekijo: 'butai', live: 'butai', planetarium: 'hoshi', umi: 'umi', okinawa: 'umi', onsen: 'onsen', kyoto: 'onsen', tenbo: 'yakei', dinner: 'yakei', illumi: 'hikari', hanabi: 'hanabi', hotel: 'yakei' };
  /* 表の行（入り方・最中・終わり方）の余韻の印に当てるときの読み替え（観劇・ライブは映画の行、光・花火は夜景の行も使う） */
  var YO_ROW = { butai: 'eiga', hikari: 'yakei', hanabi: 'yakei' };
  function yoOf(d) {
    var o = [], has = function (x) { return (' ' + (d.flags || '') + ' ').indexOf(' ' + x + ' ') >= 0; };
    if (has('kanran')) o.push('kanran');
    if (YO_ID[d.id]) o.push(YO_ID[d.id]);
    if (d.kind === 'fun') o.push('asobi');
    /* 服を買う余韻は、服を買える行き先だけ（家具と雑貨の店の日に「今日選んだ服」を出さない。2026-11-05 通し読み） */
    if (d.kind === 'shop' && d.id !== 'kagu') o.push('kaimono');
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
    var ok = (rows || []).filter(function (r) { return !r.yo || r.yo.split(' ').indexOf(yo) >= 0 || (YO_ROW[yo] && r.yo.split(' ').indexOf(YO_ROW[yo]) >= 0); });
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
    var sy = ctx.rng() < 0.5 ? DT.pickT(ctx, (T.OWARI_SAY || {})[PR.att(b, a)] || (T.OWARI_SAY || {}).gentle, a, b) || '' : '';
    return { k: r.k, name: r.name, text: dw(ctx, t + sy) };
  }

  /* 部屋の専用の長い場面（HK.Play.addScene）を選ぶための、今夜の分かれ道 */
  function curBr(ctx) { return ctx && ctx.dt && ctx.dt.curBr || ''; }
  /* ---------- 今夜の舞台（宿の種類・場所・その日にあったこと。2026-11-05 遊んで確かめた報告 3 回目「宿は旅館に固定」「車の場面にシーツ」「その日に無かった出来事を参照」） ---------- */
  var INN_OF = { onsen: 'ryokan', kyoto: 'ryokan', hokkaido: 'hotel', hotel: 'hotel', kaigai: 'abroad', okinawa: 'resort', cruise: 'ship', uchu: 'space', aurora: 'cottage', glamping: 'tent' };
  function kindOf(ctx, br, day) {
    var S = ctx.dt, P = day && day.P || {};
    if (br === 'hotel') return 'love';
    if (br === 'car') return 'car';
    if (br === 'yado') {
      var D = P.main || {}, k = INN_OF[D.id] || 'hotel';
      /* 宇宙旅行の帰還まで進んだ夜は地上のホテル */
      if (k === 'space' && day.phAt && D.ph && D.ph.inn && day.phAt[D.id] != null && D.ph.inn[D.ph.k[day.phAt[D.id]]]) k = 'hotel';
      return k;
    }
    if (P.home && !S.cohab && (br === 'ouchi' || br === 'tomari')) return 'uchi';
    return S.cohab || br === 'kaeru' ? 'kaeru' : 'home';
  }
  var SHOP_K = /^(shop)$/, TICKET_K = /^(fun|movie|culture)$/;
  function dayFlags(ctx, day, br) {
    var P = day && day.P || {}, k = day && day.k || {}, o = {}, ds = (P.slots || []).map(function (x) { return x.d; }).concat(P.main ? [P.main] : []);
    if (ds.some(function (d) { return SHOP_K.test(d.kind || '') || /outlet|shopping|kagu/.test(d.id); })) o.shop = 1;
    if (k.photo) o.photo = 1;
    if (P.trip) { o.trip = 1; o.tsukare = 1; }
    if (P.len === 'long') o.tsukare = 1;
    if (day.ateDin || day.ateIn) o.dinner = 1;
    if (day.trouble) o.trouble = 1;
    if (day.fight) o.fight = 1;
    if (day.toki) o.toki = 1;
    if (day.kiss || k.kiss) o.kiss = 1;
    if (day.rich) o.rich = 1;
    if (P.bud && P.bud <= 3000) o.low = 1;
    if (k.ame || k.acc_ame || k.acc_yudachi) o.ame = 1;
    if (ds.some(function (d) { return (' ' + (d.flags || '') + ' ').indexOf(' kanran ') >= 0; }) && !P.trip) o.kanran = 1;
    if (ds.some(function (d) { return TICKET_K.test(d.kind || ''); })) o.ticket = 1;
    if (o.shop || P.trip) o.omiyage = 1;
    if (br === 'ouchi') o.ouchi = 1;
    var sk = Object.keys(day && day.spots || {}), last = sk.length ? sk[sk.length - 1].split(':') : null;
    if (last && last[1] && last[1].length <= 12) { o.spot = 1; o.spotName = last[1]; }
    return o;
  }
  /* 場面の部品の長い場面（本体の HK.ThickSex／ThickEro。部屋の段で組めなかったときの補い）に場所を渡す（場面のあいだだけ包む） */
  function withSpot(spot, fn) {
    if (!spot || !HK.SexSpot) return fn();
    var undo = [];
    [HK.ThickSex, HK.ThickEro].forEach(function (X) {
      if (!X || typeof X.scene !== 'function') return;
      var f0 = X.scene;
      X.scene = function (o) { if (o && !o.spot) { var o2 = {}; Object.keys(o).forEach(function (k) { o2[k] = o[k]; }); o2.spot = spot; return f0.call(this, o2); } return f0.apply(this, arguments); };
      Object.keys(f0).forEach(function (k) { X.scene[k] = f0[k]; });
      undo.push(function () { X.scene = f0; });
    });
    try { return fn(); } finally { undo.forEach(function (u) { u(); }); }
  }
  /* 今夜は長い場面にするか（エッチ多め：まだ長い場面が無ければ、最後のデートか、後半の泊まり・ラブホの夜に） */
  DR.wantLong = function (ctx, day, br) {
    var S = ctx.dt, env = ctx.env;
    if (env.lewdN !== 'high' || env.lewdLen === 'short' || S.longN) return false;
    if (day.last || S.sex + 1 >= S.lewdMax) return true;
    return day.d >= Math.floor(S.n / 2) && /^(yado|hotel|tomari|kaeru)$/.test(br);
  };
  /* 部屋の文の {dest}・{spot}・{date} を当てる（場面の部品はこの印を知らない） */
  function fillEx(ctx, t, N, dest) { return String(t).split('{dest}').join(dest || 'デートの行き先').split('{spot}').join(N && N.f.spotName || dest || '行き先').split('{date}').join(ctx.dt && ctx.dt.dword || 'デート'); }
  /* 部品の名前の覚え */
  function nm(o, k) { return o && o[k] ? o[k].filter(function (x, i, l) { return l.indexOf(x) === i; }).join('・') : ''; }
  /* opt：{ force（必ず場面にする）} */
  DR.night = function (ctx, br, day, last, opt) {
    opt = opt || {};
    var S = ctx.dt, env = ctx.env, LV = HK.Lewd, P = HK.Pos, A = S.A, B = S.B, T = TX(), RM = HK.DateRoom;
    if (!T.PLAY || S.sex >= S.lewdMax) return false;
    var ab = pairOk(ctx);
    if (!ab) return false;
    var a = ab[0], b = ab[1], sh = PR.shape(a, b);
    var first = last && S.endK === 'tomari' && (br === 'tomari' || br === 'hotel');
    var p = { hotel: 1, tomari: 0.75, yado: S.couple ? 0.75 : 0.3, ouchi: 0.55, kaeru: 0.32, car: 1 }[br] || 0.4;
    if (first) p = 0.95;
    if (!S.couple && !S.fwb && br !== 'hotel') p *= 0.78;
    if (br !== 'hotel' && br !== 'car') p *= P && P.libMul ? Math.min(1.5, P.libMul([A, B])) : 1;
    /* エッチ多め（5 回まで）：泊まり・お家・宿の夜はほとんど場面にする（2026-11-05 報告「多めで平均 2.2 回」） */
    if (env.lewdN === 'high') p = Math.max(p, S.couple || S.fwb ? 0.94 : 0.72);
    if (opt.force) p = 1;
    /* 喧嘩した日も止めない（その場で仲直りした夜。帰ってしまった日は夜の区切りが無い） */
    if (ctx.rng() > p) return false;
    var entry = first && br !== 'hotel' ? 'first' : br;
    var kind = kindOf(ctx, br, day);
    if (kind === 'uchi' && entry !== 'first') entry = 'uchi';
    var dest = day.P && day.P.main ? day.P.main.noun || day.P.main.name : '';
    /* 1. きっかけ：言い出す人（{a}）。ラブホ・車は性欲の強い方・夜の性格が攻めの方、ほかはデートの余韻から */
    var la = P && P.libK ? P.libK(A) : 1, lb = P && P.libK ? P.libK(B) : 1;
    var x = br === 'hotel' || br === 'car' ? (la > lb ? A : lb > la ? B : (ctx.rng() < 0.6 ? a : b)) : (ctx.rng() < 0.55 ? a : b), y = x === A ? B : A;
    var AV = HK.Avoid;
    if (AV && AV.of && AV.of(ctx, x, y)) { if (AV.of(ctx, y, x)) return false; var sw = x; x = y; y = sw; }
    /* 宿の種類ごとのきっかけ（旅館・ホテル・船室・テント…・おうちデートの家）。ラブホは前からの文と半々 */
    var LI = RM && RM.LEAD && RM.LEAD[kind] ? RM.LEAD[kind] : null;
    var L0 = LI && (br !== 'hotel' || ctx.rng() < 0.6) && entry !== 'first' ? DT.pickT(ctx, LI, x, y) : '';
    if (!L0) L0 = DT.pickT(ctx, (T.LEAD || {})[entry === 'uchi' ? 'ouchi' : entry], x, y) || DT.pickT(ctx, (T.LEAD || {})[entry === 'uchi' ? 'ouchi' : entry], x, y, true);
    if (entry === 'uchi' && L0 && /部屋に上が|玄関の扉が閉ま|帰り道/.test(L0) && LI) L0 = DT.pickT(ctx, LI, x, y, true);
    /* その日のスポットの余韻（観覧車のあと・映画のあと・海のあと…）の一文。その日に行った行き先からだけ */
    var yo = br === 'car' ? '' : yoinOf(ctx, day), lyl = yo ? ((T.LEAD_YO || {})[yo] || (RM && RM.LEAD_YO[yo]) || null) : null, ly = lyl && L0 ? DT.pickT(ctx, lyl, x, y) : '';
    if (ly) L0 += ly;
    /* 初めてのお泊まりをラブホで：ホテルのきっかけに、初めての夜の一文を足す */
    if (first && br === 'hotel' && L0) L0 += DT.pickT(ctx, T.FIRST_ADD, x, y, true) || '';
    var FE = T.FEEL || {}, fe = DT.pickT(ctx, FE[PR.att(x, y)] || FE.gentle, x, y) || DT.pickT(ctx, FE.gentle, x, y, true);
    var FA = T.FANS || {}, fa = DT.pickT(ctx, FA[PR.att(y, x)] || FA.gentle, x, y) || DT.pickT(ctx, FA.gentle, x, y, true);
    /* 性行為の相手に選び合っただけの二人（S.body。date.js の mkPair）：体だけの夜と分かる一文を足し、恋人の語の一言は使わない（2026-11-06） */
    if (S.body && L0) { var bl = DT.pickT(ctx, T.LEAD_BODY, x, y) || DT.pickT(ctx, T.LEAD_BODY, x, y, true); if (bl) L0 += bl; if (LOVE_W.test(fe || '')) fe = ''; if (LOVE_W.test(fa || '')) fa = ''; }
    if (!L0) return false;
    var lt = DT.fill(ctx, L0 + (fe || '') + (fa || ''), x, y, { dest: dest });
    var lcat = S.love && (!ctx.romanceOk || ctx.romanceOk([x, y], false)) ? 'romance' : 'bond';
    var KN = RM ? RM.NAME : {};
    var le = ctx.say({ kind: 'event', cat: lcat, actors: [x, y], text: lt, why: 'きっかけ：' + (S.body ? '体だけの夜（関係はそのまま）・' : '') + (first ? ENTRY.first + (br === 'hotel' ? '・ラブホ' : '') : ENTRY[entry] || ENTRY[br]) + '（' + x.name + 'から・' + (dest ? dest + 'の' : '') + (S.love ? 'デートの余韻' : 'お出かけのあと') + (br === 'yado' && KN[kind] ? '・' + KN[kind] : '') + (yo && T.YO_NAME ? '・' + T.YO_NAME[yo] : '') + '）', mag: 0 });
    if (le) le.tag = 'きっかけ';
    /* 2. 場面 */
    var lv = LV ? LV.lv(env) : 'mid', ero = !!(LV && LV.ero(env) && HK.ThickEro), nogen = !!(HK.NoGen && HK.NoGen.on && HK.NoGen.on(a, b));
    var form = PR.formOf(ctx, S, env, lv, nogen, last || S.sex + 1 >= S.lewdMax);
    /* エッチ多め：一度は長い場面（最後のデートか後半の泊まり。2026-11-05 報告「多めで長い場面が無い遊びが 4 回に 1 回」） */
    if (form !== 'fade' && DR.wantLong(ctx, day, br)) form = 'long';
    SRC.R = { BOTTOM: T.BOTTOM_ROWS, TOP: T.TOP_ROWS };
    var N = RM ? RM.begin(ctx, { kind: kind, br: br, yo: yo, f: dayFlags(ctx, day, br), dest: dest }) : null;
    /* 入り方：その日の余韻に合う行（yo）が選ばれやすい。合わない余韻の行は使わない */
    var rows = T.PLAY_ROWS, play = J.pick(ctx, 'dtplay', rows, function (r) { if (r.br && r.br.indexOf(br) < 0) return 0; return r.yo ? (r.yo === yo || r.yo === YO_ROW[yo] ? 5 : 0) : 1; }) || rows[0], pi = rows.indexOf(play);
    var src = SRC, naka = null, owari = null, Tx2 = null, iri = '', open = '', rmName = '';
    if (form !== 'fade') {
      Tx2 = Object.create(T);
      /* 宿・車・おうちデートの家の夜は、その舞台の入り方（短い場面は書き出し＋繋がる段、中くらい・長い場面は書き出し） */
      var spec = !!(RM && N && (RM.pick(ctx, 'open', sh, a, b) || ''));
      if (spec && form !== 'short') { open = RM.pick(ctx, 'open', sh, a, b); rmName = KN[kind] || ''; }
      var oy = (form === 'long' || form === 'mid') && yo && ctx.rng() < 0.6 ? DT.pickT(ctx, (T.OPEN_YO || {})[yo] || (RM && RM.OPEN_YO[yo]), a, b) : '';
      if (oy && (!open || ctx.rng() < 0.5)) { open = oy; rmName = ''; }
      var pl0 = '';
      if (form === 'short' && !(ero) && !nogen) {
        var o1 = RM && N && /^(love|ryokan|hotel|abroad|resort|ship|space|cottage|tent|car|uchi)$/.test(kind) ? RM.pick(ctx, 'open', sh, a, b) : '';
        /* 女性の攻め×男性の受けは、指と手の繋がる段（部屋の段）で（前からの入り方の文は跨る形ばかりだった。2026-11-05 報告「女攻め×男が騎乗位に寄る」） */
        if (!o1 && RM && N && (sh === 'fm' || ctx.rng() < 0.5)) o1 = RM.pick(ctx, 'open', sh, a, b, true);
        var i1 = o1 ? RM.pick(ctx, 'insert', sh, a, b, true) : '';
        if (o1 && i1) { pl0 = o1 + '\n\n' + i1.replace(/\n\n\{mm\}$/, ''); rmName = KN[kind] || ''; }
        else pl0 = DT.pickT(ctx, (T.PLAY[pi] || {})[sh] || (T.PLAY[pi] || {}).all, a, b);
      }
      if (pl0 && ctx.rng() < 0.8) {
        /* 最中の一幕：その日のこと・宿の文を先に。無ければ前からの余韻の一幕 */
        var m1 = RM ? RM.pick(ctx, 'mid', sh, a, b) : '';
        if (m1) naka = { k: 'room', name: (RM.seen(m1.split('{a}').join(a.name).split('{b}').join(b.name), a, b).mid || [])[0] || 'デートの一幕', text: m1.replace(/\n\n\{mm\}/g, '') };
        else naka = nakaOf(ctx, yo, a, b, sh);
      }
      if (pl0) { var P2 = T.PLAY.slice(), o2 = {}; o2[sh] = [pl0 + (naka ? '\n\n' + naka.text : '')]; P2[pi] = o2; Tx2.PLAY = P2; }
      /* 終わり方（短い場面）・事後の一言（中くらい・長い場面は部屋の段の終わり方のあとに、受けの一言だけ） */
      var sayT = DT.pickT(ctx, (T.OWARI_SAY || {})[PR.att(b, a)] || (T.OWARI_SAY || {}).gentle, a, b) || DT.pickT(ctx, (T.OWARI_SAY || {}).gentle, a, b, true) || '';
      if (form === 'short') {
        var e1 = RM ? RM.pick(ctx, 'end', sh, a, b, ctx.rng() < 0.5) : '';
        if (e1) owari = { k: 'room', name: '舞台の終わり方', text: e1 + (ctx.rng() < 0.4 ? sayT : '') };
        else if (ctx.rng() < 0.8) owari = owariOf(ctx, yo, a, b, sh);
        if (!owari) owari = { k: 'say', name: '', text: (DT.pickT(ctx, ((T.AFTER || [])[0] || {}).all, a, b) || '') + sayT };
        Tx2.AFTER = [owari.text];
        if (!owari.name) owari = null;
      } else Tx2.AFTER = [' '];
      src = Object.assign({}, SRC, { TX: function () { return Tx2; }, MO: open && form === 'long' ? function () { var m = SRC.MO(); m.OPEN = [open]; return m; } : SRC.MO });
      iri = open ? (rmName || (T.YO_NAME ? T.YO_NAME[yo] + 'の始まり' : '')) : play && play.yo && pl0 ? play.k : rmName;
    }
    CUR = ctx; S.curBr = br;
    var full, spot = N && N.spot || '', PL = HK.Play, off0 = PL ? PL.off : null;
    /* 短い場面に本体の型の体位の一文を足さない（舞台と食い違うため。入り方の文が体位を決めている） */
    if (PL && form === 'short') PL.off = true;
    try { full = withSpot(spot, function () { return PR.scene(ctx, S, env, a, b, sh, form, { lv: lv, ero: ero, nogen: nogen, play: play, pi: pi, afi: 0, jealTop: !!day.jeal && x === a, leadB: x === b, entry: entry, resume: false, open: open }, src); }); }
    finally { S.curBr = ''; if (PL) PL.off = off0; }
    form = full.form;
    full.text = fillEx(ctx, dedupe(full.text, a, b), N, dest).replace(/\s+$/, '');
    if (spot && HK.SexSpot && HK.SexSpot.fix) full.text = HK.SexSpot.fix(full.text, spot);
    var seen = RM && full.room ? RM.seen(full.text, a, b) : {};
    if (RM) RM.end(ctx);
    remember(ctx, full.text, [T.OPEN, T.FADE], a, b);
    var parts = full.room ? ['部屋の段' + (nm(seen, 'mid') ? '・最中：' + nm(seen, 'mid') : '') + (nm(seen, 'end') ? '・終わり方：' + nm(seen, 'end') : '')] : [];
    var e = ctx.act2({ actors: [a, b], cat: S.love ? 'romance' : 'bond', text: full.text, why: 'デートの日々：夜（' + FORM[form] + '・' + (first ? ENTRY.first : ENTRY[entry] || ENTRY[br]) + (iri ? '・入り方：' + iri : '') + (naka ? '・最中：' + naka.name : '') + (owari ? '・終わり方：' + owari.name : '') + (parts.length ? '・' + parts.join('') : '') + '）', sex: true, lewd: form !== 'fade',
      fx: function () { ctx.mod2(a, b, { aff: 4, att: 6, trust: 2 }, { aff: 4, att: 6, trust: 2 }); } });
    if (!e) { if (le) { var L = ctx.log, i = L.indexOf(le); if (i >= 0) L.splice(i, 1); } return false; }
    S.sex++;
    if (form === 'long') S.longN = (S.longN || 0) + 1;
    S.forms[form] = (S.forms[form] || 0) + 1;
    S.entries[first ? 'first' : entry] = (S.entries[first ? 'first' : entry] || 0) + 1;
    S.cnt['inn_' + kind] = (S.cnt['inn_' + kind] || 0) + 1;
    if (iri) S.cnt['iri_' + (yo || kind)] = (S.cnt['iri_' + (yo || kind)] || 0) + 1;
    if (naka) S.cnt['naka_' + naka.k] = (S.cnt['naka_' + naka.k] || 0) + 1;
    if (owari) S.cnt['owari_' + owari.k] = (S.cnt['owari_' + owari.k] || 0) + 1;
    if (full.room) S.cnt.room = (S.cnt.room || 0) + 1;
    return true;
  };

  /* ---------- エッチの場面が一度も無かったとき、そのわけを一つ（最後のデートの夜のあと。2026-11-05 報告「出ないときは理由の文を一つ」） ---------- */
  var NONE = {
    body: ['二人の夜は、最後まで穏やかなまま過ぎていった。手をつなぐことはあっても、それ以上を求める空気は、この二人のあいだには生まれなかった。', '{a}と{b}は、何度出かけても、夜はそれぞれの部屋で眠った。それ以上の夜を、二人のどちらも望んでいなかった。'],
    pine: ['想いを告げられないまま、二人は毎回それぞれの家に帰った。触れたい気持ちはあっても、想いを伝えるより先に夜を共にすることは、どちらもしなかった。', '{a}は{b}への気持ちを、最後まで言葉にできなかった。気持ちを伝えるまでは、それ以上は踏みこまない――{a}はそう決めていた。'],
    chance: ['二人は毎回、その日のうちにそれぞれの家に帰った。名残惜しい夜はあっても、一緒に朝を迎える機会は、とうとう訪れなかった。', '別れ際の手は何度もなかなか離れなかったが、二人が同じ部屋で夜を過ごすことはなかった。終電の時間は、いつも少しだけ早すぎた。'],
    chanceF: ['二人は毎回、その日のうちにそれぞれの家に帰った。お互いに踏みこみすぎない距離が、この二人にはちょうどよかった。', '楽しい一日のあとも、二人はいつも駅で手を振って別れた。夜まで一緒に過ごすほどの理由は、二人のあいだにはまだ無かった。'],
    chanceC: ['同じ家に帰っても、デートの日の夜はいつも疲れて、二人ともすぐに眠ってしまった。それはそれで、幸せな眠りだった。'],
    fight: ['喧嘩をして途中で帰ってしまった日が続いて、二人は甘い夜を過ごしそびれた。仲直りの続きは、またいつかの夜に持ち越しになった。']
  };
  DR.noneWhy = function (ctx, day) {
    var S = ctx.dt; if (!S || S.lewdMax <= 0 || S.sex > 0 || S.noneSaid || HK.SAFE_ON) return;
    if (S.grp === 'fam' || S.rk === 'pfam' || !(ctx.env.lewdN === 'high' || S.love)) return;
    S.noneSaid = true;
    var PR0 = HK.PairR18, P = HK.Pos, A = S.A, B = S.B, k, why;
    if (S.pine && !S.confessed) { k = 'pine'; why = '告白の前の二人だった'; }
    else if (!PR0.sexOk(ctx, A, B) || (P && P.okSex && !P.okSex(A, B))) { k = 'body'; why = '体の関係にならない二人（恋愛対象・受け攻め・性欲・関係の設定）'; }
    else if (S.kaeru >= Math.max(1, Math.ceil(S.n / 3))) { k = 'fight'; why = '喧嘩で途中で帰った日が多かった'; }
    else { k = S.cohab ? 'chanceC' : S.love ? 'chance' : 'chanceF'; why = '夜を一緒に過ごす日が無かった'; }
    var t = NONE[k][Math.floor(ctx.rng() * NONE[k].length)];
    ctx.act2({ actors: [A, B], cat: 'bond', text: DT.fill(ctx, t, A, B), why: 'デートの日々：夜の場面が無かったわけ（' + why + '）' });
  };

  /* ---------- 三人の恋人の三人デートの夜（本体の HK.Pos.trioPlan・HK.Trio3。直接の行為は plan の組だけ。形は受け攻めの設定から） ---------- */
  /* 恋人の語（体だけの夜には出さない） */
  var LOVE_W = /恋人|大好き|好きだ|好きって|愛して|ずっと一緒/;
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
    var dest = day.P && day.P.main ? day.P.main.noun || day.P.main.name : '';
    var say3 = function (arr) { var t = DT.pickT(ctx, arr, a, bc[0]) || DT.pickT(ctx, arr, a, bc[0], true); return t ? DT.fill(ctx, t, a, bc[0], { c: bc[1].name, dest: dest }) : ''; };
    /* 性行為の相手に選び合っただけの輪の三人（Tr.body。date.js の trioKind）：体だけのきっかけ・事後、恋人の語の形の文は使わない（2026-11-06） */
    var bd = !!Tr.body, TB = TT.BODY || {};
    var lt = say3(bd && TB.LEAD ? TB.LEAD : TT.LEAD), fl = (TT.FORM_LEAD[touch ? 'touch' : sp.p] || []).filter(function (x) { return !bd || !LOVE_W.test(x); });
    if (!lt) return false;
    if (fl.length) lt += sub(pk(fl));
    var le = ctx.say({ kind: 'event', cat: 'romance', actors: g, text: lt, why: 'きっかけ：' + (bd ? '体だけの三人の夜（関係はそのまま。' : '三人の夜（') + a.name + 'から・' + (dest ? dest + 'の' : '') + 'デートの余韻）', mag: 0, trioPairs: pl ? pl.pairs : null });
    if (le) le.tag = 'きっかけ';
    var text, why;
    if (touch) { text = X3.touchScene(ctx, [a, bc[0], bc[1]]); why = '三人とも攻めなので、口づけと手だけ'; }
    else if (lv === 'low') { text = say3(TT.FADE); why = 'ほのめかす'; }
    else {
      var short = !!(LV && LV.short && LV.short(env, ctx.rng));
      var mids = (TT.MID[sp.p] || TT.MID.ring).filter(function (x) { return !bd || !LOVE_W.test(x); });
      var body = X3.quick(ctx, g, { sp: sp, plan: pl, env: env, ero: !!(LV && LV.ero && LV.ero(env)), short: short, body: bd, mid: short || !mids.length ? '' : sub(pk(mids)) });
      if (!body) { if (le) { var L0 = ctx.log, i0 = L0.indexOf(le); if (i0 >= 0) L0.splice(i0, 1); } return false; }
      text = body + '\n\n' + say3(bd && TB.AFTER ? TB.AFTER : TT.AFTER);
      why = (X3.FORM_JA && X3.FORM_JA[sp.p] || '') + '：' + { oneTwo: sp.t.name + 'が二人を', twoOne: sp.t.name + 'と' + sp.m.name + 'が' + sp.u.name + 'を', sandwich: '真ん中の' + sp.m.name + 'を挟んで', ring: '輪になって', show: sp.t.name + 'と' + sp.m.name + '、' + sp.u.name + 'は見守る' }[sp.p];
    }
    if (!text) return false;
    var e = ctx.act2({ actors: g, cat: 'romance', text: text, why: 'デートの日々：' + (bd ? '体だけの三人の夜（関係はそのまま。' : '三人の夜（') + why + '）', sex: !touch, lewd: lv !== 'low', trioPairs: pl ? pl.pairs : [], free: bd,
      fx: function () { var d = bd ? { aff: 1 } : { att: 4, aff: 2 }; ctx.mod2(g[0], g[1], d, d); ctx.mod2(g[0], g[2], d, d); ctx.mod2(g[1], g[2], d, d); } });
    if (!e || e.skipped) { if (le) { var L = ctx.log, i = L.indexOf(le); if (i >= 0) L.splice(i, 1); } return false; }
    Tr.nights = (Tr.nights || 0) + 1;
    if (!touch) { S.sex++; S.entries.trio = (S.entries.trio || 0) + 1; }
    return true;
  };


  /* ---------- ダブルデートの四人の夜（本体の HK.Quad。2026-11-05 利用者の指示「デートでも 3P・4P を」） ----------
     二組のダブルデートの四人が、性的に対象になる組がすべて恋人・互いに固定し合った相手（受けを中心にした輪。HK.Quad.ok：同居・新婚部屋と同じ判定）なら、
     その日の夜の分かれ道の代わりに、夜の起こりやすさを一度だけ振って四人の夜（本体の HK.Quad.scene。短い／二人ずつの段）。きっかけの段はこの部屋の文 */
  var QLEAD = [
    '帰りの電車で、{a}が「＠{a}＠このまま解散するの、もったいない｜このまま解散するのは、もったいない｜このまま解散するのは、もったいないです」と言った。{b}と{c}と{d}は顔を見合わせ、誰も降りる駅を言わなかった。四人で取った部屋の扉が閉まると、外の音は何も聞こえなくなった。',
    '{dest}からの帰り道、四人の足は誰の家にも向かわなかった。{a}が見つけた宿の看板の前で立ち止まると、{b}が黙って{a}の袖を引き、{c}と{d}もその後ろに並んだ。今日一日の距離の近さが、そのまま夜まで続いていた。',
    '一日じゅう二組で歩き回ったあと、四人は{a}の部屋に転がり込んだ。缶を開ける音が四つ重なって、笑い声が少しずつ小さくなる。{a}が明かりを一段落とすと、{b}も{c}も{d}も、立ち上がろうとしなかった。',
    '別れ際の改札の前で、{c}が「＠{c}＠まだ帰りたくない｜まだ帰りたくない｜まだ帰りたくないです」と言った。{a}と{b}が目を見交わし、{d}が小さくうなずいた。四人は来た道を引き返し、灯りの多い通りの宿に入った。'
  ];
  var QLEAD_BODY = [
    '四人のうち誰と誰が付き合っている、というわけではなかった。体の相手として互いを選んだ四人が、今日は二組に分かれて歩いていただけだった。{dest}からの帰り道、{a}が宿の看板の前で足を止めると、{b}と{c}と{d}も黙って並んだ。',
    '別れ際、{a}が「＠{a}＠今夜は四人で。……明日には、いつもどおり｜今夜は四人で。……明日には、いつもどおりだ｜今夜は四人で。……明日には、いつもどおりです」と言った。{b}も{c}も{d}も、それ以上の言葉は求めなかった。四人は灯りの多い通りの宿に入った。'
  ];
  /* DR.quadRoll(ctx, day)：その日に四人の夜にするか（条件と、夜の起こりやすさの一振り）。夜の別行動の段より前に決める（通し読み：「夜は別行動」のあとに四人の夜） */
  DR.quadRoll = function (ctx, day) {
    var S = ctx.dt, Q = HK.Quad;
    if (HK.SAFE_ON || !Q || !Q.ok || !Q.scene || !S || !S.p2 || day.over || day.fight) return false;
    var g = [S.A, S.B, S.p2.A, S.p2.B];
    if (S.sex >= S.lewdMax || !Q.ok(ctx, g.map(function (c) { return c.i; }))) return false;
    var nk = HK.Pos && HK.Pos.nightK ? HK.Pos.nightK(ctx) : 1;
    return !(nk <= 0 || ctx.rng() >= (nk >= 1.69 ? 1 : Math.min(1, 0.5 * nk)));
  };
  DR.quad = function (ctx, day) {
    var S = ctx.dt, Q = HK.Quad;
    if (HK.SAFE_ON || !Q || !Q.scene || !S || !S.p2) return false;
    var g = [S.A, S.B, S.p2.A, S.p2.B];
    var LW = HK.Lewd, short = ctx.env.lewdLen === 'short' || (LW && LW.lv(ctx.env) === 'low') || !!(LW && LW.short && LW.short(ctx.env, ctx.rng));
    var a = g[Math.floor(ctx.rng() * 4)], rest = g.filter(function (c) { return c !== a; });
    /* 性行為の相手に選び合っただけの輪の四人（HK.Quad.bodyRing）：体だけのきっかけ（2026-11-06） */
    var bq = !!(Q.bodyRing && Q.bodyRing(ctx, g)), QL = bq ? QLEAD_BODY : QLEAD;
    var U = S.used || {}, q = QL.filter(function (x) { return !U['r18q:' + x]; }); if (!q.length) q = QL;
    var t0 = q[Math.floor(ctx.rng() * q.length)]; U['r18q:' + t0] = 1;
    var dest = day.P && day.P.main ? day.P.main.noun || day.P.main.name : 'デートの行き先';
    var lt = DT.fill(ctx, String(t0).split('{dest}').join(dest), a, rest[0], { c: rest[1].name, d: rest[2].name });
    var r = Q.scene(ctx, g.map(function (c) { return c.i; }), { len: short ? 'short' : 'long', lead: lt, leadWhy: (bq ? '体だけの四人の夜（関係はそのまま。' : '四人の夜（') + g.map(function (c) { return c.name; }).join('・') + '・ダブルデートの帰りに）', why: 'デートの日々：' });
    if (!r) return false;
    S.sex++; S.p2.sex = (S.p2.sex || 0) + 1; S.quadN = (S.quadN || 0) + 1;
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
