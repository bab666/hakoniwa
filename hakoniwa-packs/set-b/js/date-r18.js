/* r18:begin */
/* @event scen=set-b-date id=dt_night_ouchi cat=romance tie=- tags=night label=デート帰りに寄ったお家で結ばれる夜 */
/* @event scen=set-b-date id=dt_night_tomari cat=romance tie=- tags=night label=デートの夜にそのまま泊まって求め合う */
/* @event scen=set-b-date id=dt_night_hotel cat=romance tie=- tags=night label=デートの帰りにラブホテルへ入る夜 */
/* @event scen=set-b-date id=dt_night_yado cat=romance tie=- tags=night label=旅先の宿で二人きりの夜を過ごす */
/* @event scen=set-b-date id=dt_night_kaeru cat=romance tie=lover tags=night label=デート帰りの二人の家で続きをする */
/* @event scen=set-b-date id=dt_night_first cat=romance tie=- tags=night label=初めてのお泊まりで結ばれる夜 */
/* @event scen=set-b-date id=dt_night_car cat=romance tie=- tags=night label=帰り道に車を停めて車内で求め合う */
/* @event scen=set-b-date id=dt_heat_r18 cat=romance tie=- tags=night label=デート中に人目を盗んで触れ合う */
/* @event scen=set-b-date id=dt_long_hotel cat=romance tie=- tags=night label=ラブホテルの部屋に入るなり始まる夜 */
/* @event scen=set-b-date id=dt_long_ouchi cat=romance tie=- tags=night label=デートの余韻のまま玄関で始まる夜 */
/* @event scen=set-b-date id=dt_long_car cat=romance tie=- tags=night label=夜景の見える駐車場の車の中で */
/* @event scen=set-b-date id=dt_long_yado cat=romance tie=- tags=night label=旅館の布団と浴衣で過ごす旅先の夜 */
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
     ・DR.heatTail(ctx, 攻め, 受け, 場所)：デート中の人目を盗んだキスのあとに足す、触れ合いの一文（R18版だけ。体の関係にしてよい二人）
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
  function dedupe(t) {
    var seen = {};
    return String(t).split('\n\n').map(function (para) {
      var out = '', cur = '', d = 0;
      for (var i = 0; i < para.length; i++) {
        var c = para.charAt(i); cur += c;
        if (c === '「') d++; else if (c === '」') d = Math.max(0, d - 1);
        if ((/[。！？]/.test(c) && !d) || i === para.length - 1) { var k = cur.replace(/[「」『』\s]/g, ''); if (k.length >= 12 && seen[k]) { cur = ''; continue; } seen[k] = 1; out += cur; cur = ''; }
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
  DR.heatTail = function (ctx, a, b, place) {
    var S = ctx.dt, T = TX();
    if (!S || S.lewdMax <= 0 || !pairOk(ctx) || ctx.rng() > 0.5) return '';
    var H = T.HEAT || {}, t = DT.pickT(ctx, (H[place] || []).concat(H.all || []), a, b);
    if (!t) return '';
    S.cnt.heatR18 = (S.cnt.heatR18 || 0) + 1;
    return t;
  };
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
    /* 初めてのお泊まりをラブホで：ホテルのきっかけに、初めての夜の一文を足す */
    if (first && br === 'hotel' && L0) L0 += DT.pickT(ctx, T.FIRST_ADD, x, y, true) || '';
    var FE = T.FEEL || {}, fe = DT.pickT(ctx, FE[PR.att(x, y)] || FE.gentle, x, y) || DT.pickT(ctx, FE.gentle, x, y, true);
    var FA = T.FANS || {}, fa = DT.pickT(ctx, FA[PR.att(y, x)] || FA.gentle, x, y) || DT.pickT(ctx, FA.gentle, x, y, true);
    if (!L0) return false;
    var dest = day.P && day.P.main ? day.P.main.name : '';
    var lt = DT.fill(ctx, L0 + (fe || '') + (fa || ''), x, y, { dest: dest });
    var lcat = S.love && (!ctx.romanceOk || ctx.romanceOk([x, y], false)) ? 'romance' : 'bond';
    var le = ctx.say({ kind: 'event', cat: lcat, actors: [x, y], text: lt, why: 'きっかけ：' + (first ? ENTRY.first + (br === 'hotel' ? '・ラブホ' : '') : ENTRY[entry]) + '（' + x.name + 'から・' + (dest ? dest + 'の' : '') + (S.love ? 'デートの余韻' : 'お出かけのあと') + '）', mag: 0 });
    if (le) le.tag = 'きっかけ';
    /* 2. 場面 */
    var lv = LV ? LV.lv(env) : 'mid', ero = !!(LV && LV.ero(env) && HK.ThickEro), nogen = !!(HK.NoGen && HK.NoGen.on && HK.NoGen.on(a, b));
    var form = PR.formOf(ctx, S, env, lv, nogen, last || S.sex + 1 >= S.lewdMax);
    SRC.R = { BOTTOM: T.BOTTOM_ROWS, TOP: T.TOP_ROWS };
    var rows = T.PLAY_ROWS, play = J.pick(ctx, 'dtplay', rows, function (r) { return !r.br || r.br.indexOf(br) >= 0 ? 1 : 0; }) || rows[0], pi = rows.indexOf(play);
    CUR = ctx; S.curBr = br;
    var full;
    try { full = PR.scene(ctx, S, env, a, b, sh, form, { lv: lv, ero: ero, nogen: nogen, play: play, pi: pi, afi: 0, jealTop: !!day.jeal && x === a, leadB: x === b, entry: entry, resume: false }, SRC); }
    finally { S.curBr = ''; }
    form = full.form;
    full.text = dedupe(full.text);
    remember(ctx, full.text, [T.OPEN, T.FADE], a, b);
    var e = ctx.act2({ actors: [a, b], cat: S.love ? 'romance' : 'bond', text: full.text, why: 'デートの日々：夜（' + FORM[form] + '・' + (first ? ENTRY.first : ENTRY[entry]) + '）', sex: true, lewd: form !== 'fade',
      fx: function () { ctx.mod2(a, b, { aff: 4, att: 6, trust: 2 }, { aff: 4, att: 6, trust: 2 }); } });
    if (!e) { if (le) { var L = ctx.log, i = L.indexOf(le); if (i >= 0) L.splice(i, 1); } return false; }
    S.sex++;
    if (form === 'long') S.longN = (S.longN || 0) + 1;
    S.forms[form] = (S.forms[form] || 0) + 1;
    S.entries[first ? 'first' : entry] = (S.entries[first ? 'first' : entry] || 0) + 1;
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
