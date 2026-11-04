/* 新婚部屋：季節と日付・月の行事・バレンタイン／ホワイトデー・誕生日（両方のビルド。2026-11-03 利用者の追加の指示）
   ■ HK.ShinkonCal（CL）
     ・設定「始まりの月」（env.month：auto／m1〜m12）と「始まりの日」（env.sday：auto＝その月の大きな行事の日が入るように／rand／e 上旬／m 中旬／l 下旬）から、DAY1 の月日を決める（CL.setup）。
       CL.date(S, d)：d 日目の { m, dd }（月をまたぐ。2 月は 28 日）。曜日は今までどおり DAY1＝月曜の並び（土日が休日）
     ・季節に合わない文を外す（CL.ok(ctx, t)：文の季節の語（雪・花火・浴衣・紅葉・クリスマス など）とその日の月。CL.rowOk：表の行）。
       「誕生日」の語は、その日が誰かの誕生日のときだけ。shinkon.js の okText・表の行の選び方・本体の共通の出来事の除外（scen.exclude）が使う
     ・月の行事（CL.EV。各月 2〜3 種。決まった日の行事は、その日が遊ぶ日数に入れば必ず出る。ほかは月のうちのどこかで）
     ・バレンタイン（2/14）：贈る人は性別で決めず、それぞれの気質で決める（二人とも贈ってもよい。少なくとも一人）。手作り（料理をする人だけ）・市販・手作りの失敗・サプライズ。
       受け取った人の反応は態度 9 種（GIFT）。手作りの人は前の晩（2/13）に準備の段も。恋愛にならない二人は感謝のしるし
     ・ホワイトデー（3/14）：「先月のバレンタインに貰ったか」はその場で決める（貰った人がお返し・二人とも贈り合っていた・どちらも貰っていないが贈る・どちらも何もしない）
     ・誕生日：住人の設定の「誕生月」（本体の住人の欄 bmonth）が遊ぶ日数に入れば、その月の行事の日を避けたどこかの日（2026-11-04 NO 5b。以前の「誕生日の日」の欄は外した。1〜31日）。
       遊ぶ日数に入れば、前の日に準備、当日の朝・夜に祝い（料理をする人は手料理、しない人はケーキを買う・店を予約）と贈り物（受け取った人の態度 9 種）。
       誕生日・バレンタイン・ホワイトデー・クリスマス・イブの日は、出張・体調を崩す日を入れない（shinkon.js の rollDay）
     ・R18版：贈り物がえっちなことになる夜の入口（day.r18x。shinkon-r18-cal.js の HK.ShinkonR18Cal が、きっかけの段と場面の文を持つ）
   文は shinkon-cal-text.js（HK.ShinkonCalText）。{a}＝言い出す人・贈る人（各表の頭に書いた役）、{b}＝相手。登場人物はすべて成人として扱う */
/* @event scen=set-b-shinkon id=sk_m1_hatsumode cat=romance tie=- label=二人で初詣に出かける（1月） */
/* @event scen=set-b-shinkon id=sk_m1_shogatsu cat=bond tie=- label=お正月を家で迎える（1月） */
/* @event scen=set-b-shinkon id=sk_m1_kotatsu cat=bond tie=- label=冷え込む夜をこたつで過ごす（1月） */
/* @event scen=set-b-shinkon id=sk_m2_setsubun cat=bond tie=- label=節分の豆まきと恵方巻（2月） */
/* @event scen=set-b-shinkon id=sk_m2_snow cat=bond tie=- label=雪の日を二人で過ごす（2月） */
/* @event scen=set-b-shinkon id=sk_m3_hina cat=bond tie=- label=ひな祭りの夜（3月） */
/* @event scen=set-b-shinkon id=sk_m3_spring cat=bond tie=- label=春の気配と衣替え（3月） */
/* @event scen=set-b-shinkon id=sk_m4_hanami cat=romance tie=- label=桜の下でお花見（4月） */
/* @event scen=set-b-shinkon id=sk_m4_nendo cat=bond tie=- label=新しい年度の話をする夜（4月） */
/* @event scen=set-b-shinkon id=sk_m5_renkyu cat=bond tie=- label=連休をどう過ごすか（5月） */
/* @event scen=set-b-shinkon id=sk_m5_green cat=bond tie=- label=新緑の午後をのんびり（5月） */
/* @event scen=set-b-shinkon id=sk_m6_tsuyu cat=bond tie=- label=梅雨の長い午後（6月） */
/* @event scen=set-b-shinkon id=sk_m6_ajisai cat=romance tie=- label=雨上がりの紫陽花を見に行く（6月） */
/* @event scen=set-b-shinkon id=sk_m6_bride cat=romance tie=- cond=結婚している二人 label=六月の花嫁の話をする夜（6月） */
/* @event scen=set-b-shinkon id=sk_m7_tanabata cat=romance tie=- label=七夕の短冊に願いを書く（7月） */
/* @event scen=set-b-shinkon id=sk_m7_furin cat=bond tie=- label=夏の始まりの風鈴とスイカ（7月） */
/* @event scen=set-b-shinkon id=sk_m7_matsuri cat=romance tie=- label=近所の夏祭りに出かける（7月） */
/* @event scen=set-b-shinkon id=sk_m8_hanabi cat=romance tie=- label=花火大会の夜（8月） */
/* @event scen=set-b-shinkon id=sk_m8_kakigori cat=bond tie=- label=暑い昼にかき氷を作る（8月） */
/* @event scen=set-b-shinkon id=sk_m8_obon cat=bond tie=- label=お盆休みの静かな夜（8月） */
/* @event scen=set-b-shinkon id=sk_m9_tsukimi cat=romance tie=- label=十五夜のお月見（9月） */
/* @event scen=set-b-shinkon id=sk_m9_zansho cat=bond tie=- label=残暑の夕方（9月） */
/* @event scen=set-b-shinkon id=sk_m9_yonaga cat=bond tie=- label=秋の夜長を二人で過ごす（9月） */
/* @event scen=set-b-shinkon id=sk_m10_halloween cat=romance tie=- label=ハロウィンのいたずら（10月） */
/* @event scen=set-b-shinkon id=sk_m10_aki cat=bond tie=- label=栗や焼き芋の秋の味覚（10月） */
/* @event scen=set-b-shinkon id=sk_m11_momiji cat=romance tie=- label=紅葉を見に出かける（11月） */
/* @event scen=set-b-shinkon id=sk_m11_fufu cat=romance tie=- cond=結婚している二人 label=いい夫婦の日の夜（11月） */
/* @event scen=set-b-shinkon id=sk_m11_nabe cat=bond tie=- label=寒くなった夜に鍋を囲む（11月） */
/* @event scen=set-b-shinkon id=sk_m12_xmas cat=romance tie=- label=二人のクリスマス（12月） */
/* @event scen=set-b-shinkon id=sk_m12_omisoka cat=romance tie=- label=大晦日に年を越す（12月） */
/* @event scen=set-b-shinkon id=sk_m12_osouji cat=bond tie=- label=年末の大掃除（12月） */
/* @event scen=set-b-shinkon id=sk_vday_prep cat=romance tie=- label=バレンタインの前の晩にこっそり準備 */
/* @event scen=set-b-shinkon id=sk_vday cat=romance tie=- label=バレンタインに贈る・受け取る */
/* @event scen=set-b-shinkon id=sk_wday cat=romance tie=- label=ホワイトデーのお返し */
/* @event scen=set-b-shinkon id=sk_bday_prep cat=bond tie=- label=誕生日の前の日にこっそり準備 */
/* @event scen=set-b-shinkon id=sk_bday_morn cat=bond tie=- label=誕生日の朝のおめでとう */
/* @event scen=set-b-shinkon id=sk_bday_party cat=romance tie=- label=誕生日を祝う夜と贈り物 */
(function () {
  'use strict';
  var HK = window.HK;
  if (!HK) return;
  var CL = HK.ShinkonCal = {};
  function TX() { return HK.ShinkonCalText || {}; }
  function SK() { return HK.Shinkon; }
  var DIM = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  /* ---------- 季節の語 → 合う月（1〜12） ---------- */
  var SEA = [
    [/正月|初詣|お雑煮|おせち|年賀|初日の出|鏡餅|書き初め/, [1]],
    [/節分|豆まき|恵方巻/, [2]],
    [/バレンタイン/, [2, 3]],
    [/ホワイトデー/, [3]],
    [/ひな祭り|ひな人形|雛人形|ひなあられ/, [3]],
    [/桜(?!でんぶ)|花見|花冷え|夜桜|新年度|新しい年度/, [3, 4]],
    [/連休|こいのぼり|鯉のぼり|柏餅|新緑|若葉/, [5]],
    [/梅雨|紫陽花|あじさい|てるてる坊主|六月に式/, [6]],
    [/七夕|短冊|笹の葉|天の川/, [7]],
    [/花火|夏祭|浴衣|夜店|お盆|金魚すくい|灯籠/, [7, 8]],
    [/海水浴|水着|日焼け|かき氷|蝉|セミの声|風鈴|麦茶|扇風機|クーラー|猛暑|暑い|暑さ|(?<!真)夏(?!休みの宿題)/, [6, 7, 8, 9]],
    [/月見|十五夜|秋の夜長|すすき/, [9]],
    [/ハロウィン|仮装/, [10]],
    [/紅葉|もみじ|落ち葉|焼き芋|栗ご飯|銀杏並木|(?<!千)秋(?!刀)/, [9, 10, 11]],
    [/いい夫婦の日/, [11]],
    [/クリスマス|サンタ|ツリーに明かり/, [12]],
    [/大晦日|年越し|除夜|紅白|大掃除|年の瀬/, [12]],
    [/イルミネーション/, [11, 12, 1, 2]],
    [/雪(?!解け)|こたつ|炬燵|マフラー|手袋|寒い|寒さ|凍え|暖房|息が白|おでん|湯たんぽ|冬(?!眠)/, [11, 12, 1, 2, 3]],
    [/肌寒/, [10, 11, 12, 1, 2, 3, 4]],
    [/苺摘み|いちご狩り|苺狩り/, [1, 2, 3, 4, 5]],
    [/春(?!巻)/, [3, 4, 5]]
  ];
  /* 表の行の鍵（行の k）で季節が決まるもの（デートの「海」「お祭り」） */
  var ROWK = { '海': [6, 7, 8, 9], 'お祭り': [7, 8, 9] };
  CL.SEA = SEA;
  function S0(ctx) { return ctx && ctx.sk; }
  /* 今の日の月（setup のあいだは DAY1） */
  function curD(S) { return S.curD != null ? S.curD : S.day ? S.day.d : 0; }
  CL.monthOf = function (ctx) { var S = S0(ctx); if (!S || !S.cal) return 0; return CL.date(S, curD(S)).m; };
  /* その日が誰かの誕生日か */
  CL.isBday = function (ctx) { var S = S0(ctx); if (!S || !S.bdays) return false; var d = curD(S); return S.bdays.some(function (x) { return x.d === d; }); };
  CL.okMonth = function (t, m) {
    if (!m || typeof t !== 'string') return true;
    for (var i = 0; i < SEA.length; i++) if (SEA[i][0].test(t) && SEA[i][1].indexOf(m) < 0) return false;
    return true;
  };
  CL.ok = function (ctx, t) {
    if (typeof t !== 'string') return true;
    var S = S0(ctx); if (!S || !S.cal) return true;
    if (/誕生日/.test(t) && !CL.isBday(ctx)) return false;
    return CL.okMonth(t, CL.monthOf(ctx));
  };
  CL.rowOk = function (ctx, x) {
    if (!x) return true;
    var S = S0(ctx); if (!S || !S.cal) return true;
    var m = CL.monthOf(ctx), k = x.k || '';
    if (ROWK[k] && ROWK[k].indexOf(m) < 0) return false;
    return CL.ok(ctx, (x.k || '') + '／' + (x.t || ''));
  };
  /* ---------- 日付 ---------- */
  CL.date = function (S, d) {
    var c = S.cal, m = c.m, dd = c.d + d;
    while (dd > DIM[m - 1]) { dd -= DIM[m - 1]; m = m % 12 + 1; }
    return { m: m, dd: dd };
  };
  CL.label = function (S, d) { var x = CL.date(S, d); return x.m + '月' + x.dd + '日'; };
  /* 「始まりの日」のおまかせで、遊ぶ日数に入れたい月の大きな行事の日 */
  var KEY = { 1: 1, 2: 14, 3: 14, 4: 5, 5: 3, 6: 15, 7: 7, 8: 15, 9: 15, 10: 31, 11: 22, 12: 24 };
  CL.setup = function (ctx, S) {
    var env = ctx.env || {}, mv = String(env.month || 'auto'), m = /^m(\d+)$/.test(mv) ? +mv.slice(1) : 0;
    if (!(m >= 1 && m <= 12)) m = 1 + Math.floor(ctx.rng() * 12);
    var sd = String(env.sday || 'auto'), dim = DIM[m - 1], d0;
    if (sd === 'e') d0 = 1; else if (sd === 'm') d0 = 11; else if (sd === 'l') d0 = 21;
    else if (sd === 'rand') d0 = 1 + Math.floor(ctx.rng() * dim);
    else { var k = KEY[m]; d0 = Math.max(1, k - Math.floor(ctx.rng() * Math.min(S.days, k))); }
    S.cal = { m: m, d: Math.min(dim, d0) };
    /* 誕生日（2026-11-04 不具合リスト NO 5b）：住人の設定の誕生月（bmonth）が日数の中に入れば、その月のどこかの日に祝う（以前の住人ごとの「誕生日の日」の欄は外した。
       保存された値（pick.bday）は読まない）。月の決まった日の行事（バレンタイン・ホワイトデー・クリスマス・イブ・正月・七夕など）の日と、ほかの人の誕生日の日は避ける。
       避けると日が残らないときは、その遊びでは祝わない（行事の日に重ねて、前後が食い違わないように） */
    S.bdays = [];
    (S.spouses || [S.A, S.B]).forEach(function (c) {
      var bm = +c.bmonth;
      if (!(bm >= 1 && bm <= 12)) return;
      var hits = [];
      for (var i = 0; i < S.days; i++) {
        var x = CL.date(S, i);
        if (x.m !== bm || evDay(x) || S.bdays.some(function (b) { return b.d === i; })) continue;
        hits.push(i);
      }
      if (!hits.length) return;
      var di = hits[Math.floor(ctx.rng() * hits.length)];
      S.bdays.push({ c: c, d: di, label: CL.label(S, di) });
    });
    /* バレンタインの準備（前の晩）を出すために、贈る人と贈り方を先に決めておく */
    S.vplan = null;
    /* 三人婚は、その日の二人で決める（前の晩の準備は出さない） */
    if (!S.trio) for (var j = 0; j < S.days; j++) { var y = CL.date(S, j); if (y.m === 2 && y.dd === 14) { S.vplan = vPlan(ctx, S, j); break; } }
  };
  /* 月の決まった日の行事の日（誕生日をそこに重ねない）：バレンタイン・ホワイトデー・クリスマス・イブと、CL.EV の決まった日（fix） */
  function evDay(x) {
    if ((x.m === 2 && x.dd === 14) || (x.m === 3 && x.dd === 14) || (x.m === 12 && (x.dd === 24 || x.dd === 25))) return true;
    return (CL.EV[x.m] || []).some(function (e) { return e.fix && e.fix.indexOf(x.dd) >= 0; });
  }
  /* 大事な日（出張・体調を崩す日を入れない）：誕生日・バレンタイン・ホワイトデー・クリスマス・イブ */
  CL.keyDay = function (S, d) {
    if (!S.cal) return false;
    var x = CL.date(S, d);
    if ((x.m === 2 && x.dd === 14) || (x.m === 3 && x.dd === 14) || (x.m === 12 && (x.dd === 24 || x.dd === 25))) return true;
    return (S.bdays || []).some(function (b) { return b.d === d; });
  };
  /* ---------- 月の行事 ---------- */
  /* fix：決まった日（その日なら必ず）／from-to：その月のこの範囲のどこか（1 日あたりの起こりやすさ p）。part：d 日中／n 夜。out：出かける（まだだるい日は出さない）。wed：結婚している二人だけ */
  CL.EV = {
    1: [{ id: 'm1_hatsumode', from: 1, to: 7, p: 0.5, part: 'd', out: 1, nm: '初詣' }, { id: 'm1_shogatsu', fix: [1, 2, 3], part: 'd', nm: 'お正月' }, { id: 'm1_kotatsu', from: 4, to: 31, p: 0.18, part: 'n', nm: '寒い夜' }],
    2: [{ id: 'm2_setsubun', fix: [3], part: 'n', nm: '節分' }, { id: 'm2_snow', from: 1, to: 28, p: 0.15, part: 'd', nm: '雪の日' }],
    3: [{ id: 'm3_hina', fix: [3], part: 'n', nm: 'ひな祭り' }, { id: 'm3_spring', from: 15, to: 31, p: 0.18, part: 'd', nm: '春の気配' }],
    4: [{ id: 'm4_hanami', from: 1, to: 15, p: 0.3, part: 'd', out: 1, hol: 1, nm: 'お花見' }, { id: 'm4_nendo', from: 1, to: 10, p: 0.25, part: 'n', nm: '新しい年度' }],
    5: [{ id: 'm5_renkyu', fix: [3, 4, 5], part: 'd', nm: '連休' }, { id: 'm5_green', from: 6, to: 31, p: 0.18, part: 'd', nm: '新緑' }],
    6: [{ id: 'm6_tsuyu', from: 5, to: 30, p: 0.18, part: 'd', nm: '梅雨' }, { id: 'm6_ajisai', from: 1, to: 30, p: 0.15, part: 'd', out: 1, nm: '紫陽花' }, { id: 'm6_bride', from: 1, to: 30, p: 0.12, part: 'n', wed: 1, nm: '六月の花嫁' }],
    7: [{ id: 'm7_tanabata', fix: [7], part: 'n', nm: '七夕' }, { id: 'm7_furin', from: 1, to: 31, p: 0.15, part: 'd', nm: '夏の始まり' }, { id: 'm7_matsuri', from: 14, to: 31, p: 0.25, part: 'd', out: 1, hol: 1, nm: '夏祭り' }],
    8: [{ id: 'm8_hanabi', from: 1, to: 31, p: 0.18, part: 'n', out: 1, nm: '花火大会' }, { id: 'm8_kakigori', from: 1, to: 31, p: 0.15, part: 'd', nm: 'かき氷' }, { id: 'm8_obon', fix: [13, 14, 15], part: 'n', nm: 'お盆' }],
    9: [{ id: 'm9_tsukimi', fix: [15], from: 10, to: 28, p: 0.15, part: 'n', nm: '十五夜' }, { id: 'm9_zansho', from: 1, to: 14, p: 0.18, part: 'd', nm: '残暑' }, { id: 'm9_yonaga', from: 16, to: 30, p: 0.15, part: 'n', nm: '秋の夜長' }],
    10: [{ id: 'm10_halloween', fix: [31], part: 'n', nm: 'ハロウィン' }, { id: 'm10_aki', from: 1, to: 30, p: 0.18, part: 'd', nm: '秋の味覚' }],
    11: [{ id: 'm11_momiji', from: 1, to: 30, p: 0.2, part: 'd', out: 1, hol: 1, nm: '紅葉' }, { id: 'm11_fufu', fix: [22], part: 'n', wed: 1, nm: 'いい夫婦の日' }, { id: 'm11_nabe', from: 10, to: 30, p: 0.15, part: 'n', nm: '寒くなった夜' }],
    12: [{ id: 'm12_xmas', fix: [24, 25], part: 'n', nm: 'クリスマス' }, { id: 'm12_omisoka', fix: [31], part: 'n', nm: '大晦日' }, { id: 'm12_osouji', from: 20, to: 30, p: 0.3, part: 'd', nm: '大掃除' }]
  };
  /* その日の行事（rollDay から）：{ ev, part } か null。バレンタイン・ホワイトデー・誕生日はここで印を付ける */
  CL.roll = function (ctx, S, day) {
    if (!S.cal) return;
    var x = CL.date(S, day.d), used = S.calUsed = S.calUsed || {};
    day.date = x;
    day.bday = (S.bdays || []).filter(function (b) { return b.d === day.d; });
    if (!day.bday.length) day.bday = null;
    /* 誕生日の前の日（準備） */
    day.bprep = (S.bdays || []).filter(function (b) { return b.d === day.d + 1; })[0] || null;
    if (x.m === 2 && x.dd === 14) day.vday = S.vplan || vPlan(ctx, S, day.d);
    if (x.m === 2 && x.dd === 13 && S.vplan && S.vplan.prep) day.vprep = S.vplan;
    if (x.m === 3 && x.dd === 14) day.wday = true;
    if (day.sick) return;
    var L = (CL.EV[x.m] || []).filter(function (e) {
      if (used[e.id] || (e.wed && !S.wed)) return false;
      if (e.out && (day.dull || day.apart)) return false;
      if (e.fix && e.fix.indexOf(x.dd) >= 0) return true;
      return false;
    });
    var ev = L[0] || null;
    if (!ev && !day.vday && !day.wday && !day.bday) {
      var F = (CL.EV[x.m] || []).filter(function (e) { return !used[e.id] && !(e.wed && !S.wed) && !(e.out && (day.dull || day.apart)) && e.from && x.dd >= e.from && x.dd <= e.to && (!e.hol || day.hol); });
      for (var i = 0; i < F.length && !ev; i++) if (ctx.rng() < F[i].p * (S.calN ? 0.6 : 1.4)) ev = F[i];
    }
    if (ev) { used[ev.id] = 1; day.sea = ev; }
  };
  /* ---------- バレンタインの贈り方 ---------- */
  function giveW(c) { var t = c.tr || {}; return 0.45 + (t.np || 0.5) * 0.35 + (t.fc || 0.5) * 0.15 + (t.ac || 0.5) * 0.1; }
  function styleOf(ctx, c) {
    var LF = HK.Life, t = c.tr || {}, cook = LF && LF.canCook ? LF.canCook(c) : true, clumsy = LF && LF.clumsy ? LF.clumsy(c) : false;
    var W = [['shop', 0.6 + (t.cp || 0.5) * 0.3], ['surp', 0.25 + (t.fc || 0.5) * 0.5 + (t.impulse || 0.4) * 0.3]];
    if (cook) { W.push(['hand', 0.4 + (t.np || 0.5) * 0.6]); W.push(['fail', clumsy ? 0.9 : 0.15]); }
    return HK.weighted(ctx.rng, W, function (w) { return w[1]; })[0];
  }
  function vPlan(ctx, S, d) {
    var P = (S.spouses || [S.A, S.B]).slice(0, 2), g = P.filter(function (c) { return ctx.rng() < giveW(c) * 0.85; });
    if (!g.length) g = [ctx.rng() < 0.5 ? P[0] : P[1]];
    var st = g.map(function (c) { return styleOf(ctx, c); });
    return { d: d, givers: g, style: st, prep: d > 0 && st.some(function (s) { return s === 'hand' || s === 'fail'; }) };
  }
  /* ---------- 文の選び方（shinkon.js の HK.Shinkon の部品） ---------- */
  function T(ctx, arr, a, b) { return SK().pickT(ctx, arr, a, b); }
  function F(ctx, t, a, b, ex) { return t ? SK().fill(ctx, t, a, b, ex) : ''; }
  function gift(ctx, who, giver) {
    var G = TX().GIFT || {}, k = SK().per(who);
    return F(ctx, T(ctx, G[k] || G.gentle, who, giver), who, giver);
  }
  CL.gift = gift;
  function act(ctx, o) { var e = ctx.act2(o); if (e && ctx.sk) ctx.sk.calN = (ctx.sk.calN || 0) + 1; return e; }
  function other(S, c) { return c === S.A ? S.B : S.A; }
  /* その区切りの行事を出す（shinkon.js の phase から。part：m 朝／d 日中／n 夜）。trio のときは S.A／S.B がその日の二人 */
  CL.run = function (ctx, S, day, part) {
    var CT = TX(), A = S.A, B = S.B, lv = S.love, R18 = HK.ShinkonR18Cal;
    if (!S.cal || day.sick || day.apart) return;
    var lab = CL.label(S, day.d);
    /* 誕生日 */
    (day.bday || []).forEach(function (bd) {
      var c = bd.c, o = c === A ? B : c === B ? A : null, MU = HK.ShinkonMulti;
      if (!o) o = (S.C && c === S.C) || (S.D && c === S.D) ? A : null;
      /* 三人婚・四人婚：祝うのは誕生日の人の恋の相手（恋の相手どうしでない伴侶が恋人のように祝わないように。2026-11-04 NO 1） */
      if (MU && S.lp && o && !MU.love(ctx, S, o, c)) o = MU.partner(ctx, S, c, [A, B].filter(function (x) { return x !== c; })) || MU.partner(ctx, S, c) || o;
      if (!o) return;
      var lv = MU && S.lp ? MU.love(ctx, S, o, c) : S.love, lv0 = S.love, wd0 = S.wed;
      if (MU && S.lp) { S.love = lv; S.wed = lv; }
      try { bdayRun(bd, c, o, lv); } finally { S.love = lv0; S.wed = wd0; }
    });
    function bdayRun(bd, c, o, lv) {
      if (part === 'm' && !bd.morn) {
        bd.morn = 1;
        var mt = T(ctx, (CT.BDAY || {}).morn, o, c);
        if (mt) act(ctx, { actors: [o, c], cat: 'bond', text: F(ctx, mt, o, c), why: '新婚部屋：誕生日の朝（' + lab + '・' + c.name + 'の誕生日）', fx: function () { ctx.mod2(o, c, { aff: 2 }, { aff: 3, trust: 1 }); } });
      }
      if (part === 'n' && !bd.party) {
        bd.party = 1;
        var LF = HK.Life, how = LF && LF.canCook && LF.canCook(o) && !(o === A ? day.pa : day.pb || {}).late ? (ctx.rng() < 0.6 ? 'cook' : 'buy') : ctx.rng() < 0.5 ? 'buy' : 'out';
        if (how === 'out' && day.dull) how = 'buy';
        var BD = CT.BDAY || {}, pt = T(ctx, (BD.party || {})[how], o, c), gt = T(ctx, BD.gift, o, c);
        var gname = (BD.GIFTS || ['腕時計'])[Math.floor(ctx.rng() * (BD.GIFTS || [1]).length)];
        var tx = F(ctx, pt, o, c) + (gt ? '\n\n' + F(ctx, gt, o, c, { gift: gname }) + gift(ctx, c, o) : '');
        var th = trio3(ctx, S, day, BD.trio3, o, c);
        if (th) tx += th;
        var e = act(ctx, { actors: th ? [o, c].concat(S.spouses.filter(function (x) { return x !== o && x !== c; })) : [o, c], cat: lv ? 'romance' : 'bond', text: tx, why: '新婚部屋：誕生日（' + lab + '・' + c.name + 'の誕生日・' + { cook: o.name + 'の手料理', buy: 'ケーキを買って', out: '店を予約して' }[how] + '）',
          fx: function () { ctx.mod2(o, c, { aff: 3, att: lv ? 2 : 0 }, { aff: 5 + SK().persK(c, 'warm'), att: lv ? 3 : 0, trust: 2 }); } });
        if (e) { S.bdayN = (S.bdayN || 0) + 1; if (R18 && R18.offer && lv) R18.offer(ctx, S, day, 'bday', o, c); }
      }
    }
    if (day.bprep && part === 'n' && !day.bprep.prep) {
      var bc = day.bprep.c, bo = bc === A ? B : bc === B ? A : (S.C && bc === S.C) || (S.D && bc === S.D) ? A : null;
      if (bo) { day.bprep.prep = 1; var pp = T(ctx, (CT.BDAY || {}).prep, bo, bc); if (pp) act(ctx, { actors: [bo], cat: 'solo', text: F(ctx, pp, bo, bc), why: '新婚部屋：誕生日の前の日（' + bc.name + 'の誕生日は明日）' }); }
    }
    /* バレンタイン（前の晩の準備・当日） */
    if (day.vprep && part === 'n') {
      var vp = day.vprep, gi = vp.style.map(function (s, i) { return s === 'hand' || s === 'fail' ? vp.givers[i] : null; }).filter(Boolean)[0];
      if (gi && (gi === A || gi === B)) { var pr = T(ctx, (CT.VDAY || {}).prep, gi, other(S, gi)); if (pr) act(ctx, { actors: [gi], cat: lv ? 'romance' : 'bond', text: F(ctx, pr, gi, other(S, gi)), why: '新婚部屋：バレンタインの前の晩（' + gi.name + 'が手作りの準備）' }); }
      day.vprep = null;
    }
    if (day.vday && part === (day.hol ? 'd' : 'n') && !day.vdone) { day.vdone = 1; valentine(ctx, S, day, day.vday); }
    if (day.wday && part === (day.hol ? 'd' : 'n') && !day.wdone) { day.wdone = 1; whiteday(ctx, S, day); }
    /* 月の行事 */
    var ev = day.sea;
    if (ev && ev.part === part && !day.seaDone) {
      day.seaDone = 1;
      var who = ctx.rng() < 0.5 ? A : B, ot = other(S, who), tt = T(ctx, (CT.EV || {})[ev.id], who, ot);
      if (tt) {
        var rom = HK.Shinkon.ROM.test(tt);
        var re = { text: '', odd: false };
        act(ctx, { actors: [who, ot], cat: lv && rom ? 'romance' : 'bond', text: F(ctx, tt, who, ot) + re.text, odd: re.odd, why: '新婚部屋：季節の行事（' + lab + '・' + ev.nm + '）',
          fx: function () { ctx.mod2(who, ot, { aff: 2, att: lv ? 1 : 0 }, { aff: 2, att: lv ? 1 : 0 }); } });
      }
    }
  };
  /* 三人婚：三人目（{c}）も加わる一文。三人目が家にいるときだけ */
  function trio3(ctx, S, day, arr, a, b) {
    if (!S.trio || !S.C || !HK.ShinkonTrio || !arr) return '';
    var c3 = S.spouses.filter(function (x) { return x !== a && x !== b; })[0];
    if (!c3 || (day.pc && day.pc.trip && c3 === S.C)) return '';
    return HK.ShinkonTrio.say(ctx, arr, a, b, c3);
  }
  function valentine(ctx, S, day, vp) {
    var CT = TX().VDAY || {}, A = S.A, B = S.B, lv = S.love, lab = CL.label(S, day.d);
    var gs = vp.givers.filter(function (c) { return c === A || c === B; });
    if (!gs.length) gs = [A];
    var both = gs.length > 1, parts = [], why = [];
    if (both) parts.push(F(ctx, T(ctx, CT.both, gs[0], gs[1]), gs[0], gs[1]));
    var th = trio3(ctx, S, day, CT.trio3, A, B);
    gs.forEach(function (g, i) {
      var r = other(S, g), st = vp.style[vp.givers.indexOf(g)] || 'shop';
      var list = lv ? (CT.give || {})[st] : CT.thanks, t = T(ctx, list, g, r) || T(ctx, (CT.give || {}).shop, g, r);
      if (!t) return;
      parts.push(F(ctx, t, g, r) + gift(ctx, r, g));
      why.push(g.name + '→' + r.name + '（' + (lv ? { hand: '手作り', shop: '市販', fail: '手作りに失敗', surp: 'サプライズ' }[st] : '感謝のしるし') + '）');
    });
    var e = act(ctx, { actors: th ? [gs[0], other(S, gs[0]), S.C] : [gs[0], other(S, gs[0])], cat: lv ? 'romance' : 'bond', text: parts.join('\n\n') + th, why: '新婚部屋：バレンタイン（' + lab + '・' + why.join('／') + (th ? '・' + S.C.name + 'も' : '') + '）',
      fx: function () { gs.forEach(function (g) { ctx.mod2(g, other(S, g), { aff: 2, att: lv ? 2 : 0 }, { aff: 4, att: lv ? 3 : 0 }); }); } });
    if (e) { S.vdayN = 1; if (HK.ShinkonR18Cal && HK.ShinkonR18Cal.offer) HK.ShinkonR18Cal.offer(ctx, S, day, 'vday', gs[Math.floor(ctx.rng() * gs.length)], null); }
  }
  /* ホワイトデー：先月のバレンタインに貰ったかは、その場で決める（それぞれ。贈る気質の人ほど贈っていた） */
  function whiteday(ctx, S, day) {
    var CT = TX().WDAY || {}, A = S.A, B = S.B, lv = S.love, lab = CL.label(S, day.d);
    var gotA = ctx.rng() < 0.3 + giveW(B) * 0.45, gotB = ctx.rng() < 0.3 + giveW(A) * 0.45, parts = [], why, giver = null;
    if (gotA && gotB) {
      parts.push(F(ctx, T(ctx, CT.both, A, B), A, B) + gift(ctx, B, A));
      why = '二人とも、先月のバレンタインに贈り合っていた';
      giver = ctx.rng() < 0.5 ? A : B;
    } else if (gotA || gotB) {
      var ret = gotA ? A : B, r = other(S, ret), st = styleOf(ctx, ret);
      var t = lv ? T(ctx, (CT.ret || {})[st], ret, r) : T(ctx, CT.thanks, ret, r);
      if (!t) t = T(ctx, (CT.ret || {}).shop, ret, r);
      parts.push(F(ctx, t, ret, r) + gift(ctx, r, ret));
      why = ret.name + 'は先月のバレンタインに' + r.name + 'から貰っていた（お返し：' + (lv ? { hand: '手作り', shop: '市販', fail: '手作りに失敗', surp: 'サプライズ' }[st] : '感謝のしるし') + '）';
      giver = ret;
    } else {
      /* どちらも貰っていない：贈る気質の人がいれば、お返しではなく自分から。いなければ二人で笑って終わる */
      var g2 = [A, B].filter(function (c) { return ctx.rng() < giveW(c) * 0.6; })[0];
      if (g2) { parts.push(F(ctx, T(ctx, CT.nogot, g2, other(S, g2)), g2, other(S, g2)) + gift(ctx, other(S, g2), g2)); why = '先月のバレンタインは二人とも何もしなかった。今日は' + g2.name + 'から'; giver = g2; }
      else { parts.push(F(ctx, T(ctx, CT.none, A, B), A, B)); why = '先月のバレンタインも、今日も、二人とも何もしなかった'; }
    }
    var th = trio3(ctx, S, day, CT.trio3, A, B);
    var e = act(ctx, { actors: th ? [giver || A, other(S, giver || A), S.C] : [giver || A, other(S, giver || A)], cat: lv ? 'romance' : 'bond', text: parts.join('') + th, why: '新婚部屋：ホワイトデー（' + lab + '・' + why + (th ? '・' + S.C.name + 'も' : '') + '）',
      fx: function () { if (giver) ctx.mod2(giver, other(S, giver), { aff: 2, att: lv ? 2 : 0 }, { aff: 4, att: lv ? 3 : 0 }); } });
    if (e) { S.wdayN = 1; if (giver && HK.ShinkonR18Cal && HK.ShinkonR18Cal.offer) HK.ShinkonR18Cal.offer(ctx, S, day, 'wday', giver, null); }
  }
})();
