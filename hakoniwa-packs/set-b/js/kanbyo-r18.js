/* r18:begin */
/* @event scen=set-b-kanbyo id=kb_night_heal cat=romance tie=- tags=night label=治った日の夜に気持ちがあふれる */
/* @event scen=set-b-kanbyo id=kb_night_date cat=romance tie=- tags=night label=お礼のデートの帰りに結ばれる夜 */
/* @event scen=set-b-kanbyo id=kb_night_back cat=romance tie=- tags=night label=看病し返されて治った夜 */
/* @event scen=set-b-kanbyo id=kb_night_amai cat=romance tie=lover tags=night label=いつもより甘い数日の夜 */
/* @event scen=set-b-kanbyo id=kb_night_after cat=romance tie=- tags=night label=治ったあとの夜に看病の礼を交わす */
/* @event scen=set-b-kanbyo id=kb_form_fade cat=romance tie=- tags=night label=夜の場面・ほのめかす（暗転と翌朝） */
/* @event scen=set-b-kanbyo id=kb_form_short cat=romance tie=- tags=night label=夜の場面・短い場面（治ったあとの内容） */
/* @event scen=set-b-kanbyo id=kb_form_mid cat=romance tie=- tags=night label=夜の場面・中くらいの場面（反応と山場） */
/* @event scen=set-b-kanbyo id=kb_form_long cat=romance tie=- tags=night label=夜の場面・段落を分けた長い場面 */
/* 看病の部屋の夜（R18版だけ。全年齢版のパックを組み立てるとき、この印の間は落ちる。2026-11-03）
   ■ HK.KanbyoR18.quota(ctx, 'none'|'low'|'high')：一回の遊びのエッチの回数の上限（0／1／2）
   ■ HK.KanbyoR18.night(ctx, entry, day, last)：その夜にエッチの場面を出したら true。kanbyo.js が、誰も病気でない夜（治った日の夜・治ったあと・うつった人が治った夜）で、
     体の関係にしてよい組のときに呼ぶ
     ・入口 entry：heal 治った日の夜／date お礼のデートの夜／back うつった人が治った夜／amai いつもより甘い数日の夜（恋人どうし）／after 治ったあとの夜（恋人どうしでない二人）
     ・恋愛感情の有無では止めない（本体の決まり）。恋人どうしでない二人は起こりやすさを下げる（不仲・敵対はさらに下げる）
     ・体の関係にしてよい組だけ（HK.PairR18.sexOk・HK.Pos.okSex・恋愛にしてよい二人）。受け攻めは HK.Pos.order（攻めを選んだ人を受けにしない）
     ・場面の直前に必ず「きっかけ」の段（記録の一件。理由の欄は「きっかけ：…」、e.tag＝'きっかけ'）：看病された・した気持ち（感謝・照れ・愛しさ）を、言い出した人の夜の態度9種の台詞で
     ・長さ・山場・喘ぎは共通の部品 HK.PairR18（formOf・scene。長い場面は本体の HK.ThickSex.scene・HK.ThickEro.scene、中くらいは態度9種の山場）
   文は kanbyo-r18-text.js（HK.KanbyoR18Text）。体の語は印。登場人物はすべて成人として扱う */
(function () {
  'use strict';
  var HK = window.HK;
  var PR = HK.PairR18, KB = HK.Kanbyo;
  if (!PR || !KB || !HK.Journal) return;
  var J = HK.Journal, K = HK.PairKit;
  function TX() { return HK.KanbyoR18Text || {}; }
  function pickOf(ctx, arr) { return arr && arr.length ? arr[Math.floor(ctx.rng() * arr.length)] : ''; }
  var SRC = { TX: TX, MO: function () { var T = TX(); return { OPEN: T.OPEN, REOPEN: T.OPEN, FADE: T.FADE, PEAK_E: PR.FB.peakE }; }, R: null, ok: function () { return KB.okText; } };
  var ENTRY = { heal: '治った日の夜', date: 'お礼のデートの夜', back: 'うつった人が治った夜', amai: 'いつもより甘い夜', after: '治ったあとの夜' };
  var FORM = { fade: 'ほのめかす', short: '短い場面', mid: '中くらいの場面', long: '長い場面' };
  /* きっかけの予備（入口の文が二人に合わなかったとき。3 文） */
  var LEAD_FB = '看病の数日が終わって、部屋にはようやく静かな夜が戻ってきた。{a}は、熱の夜のことを思い出しながら、{b}の顔を見つめた。看病のあいだ胸にしまっていた気持ちが、今夜はどうしても抑えられなかった。';
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
  var KR = HK.KanbyoR18 = { ENTRY: ENTRY, FORM: FORM };
  KR.quota = function (ctx, v) { return v === 'none' ? 0 : v === 'low' ? 1 : 2; };
  KR.night = function (ctx, entry, day, last) {
    var S = ctx.kb, env = ctx.env, LV = HK.Lewd, P = HK.Pos, A = S.A, B = S.B, T = TX();
    if (!T.PLAY) return false;
    if (!PR.sexOk(ctx, A, B)) return false;
    if (P && P.okSex && !P.okSex(A, B)) return false;
    var o = P && P.order ? P.order(A, B) : [A, B], a = o[0], b = o[1], sh = PR.shape(a, b);
    /* 苦手で避けている人は自分から迫らない（本体の HK.Avoid。恋愛の出来事でない夜は romanceOk の門を通らないので、ここで見る） */
    var AV = HK.Avoid;
    if (AV && ((AV.topOk && !AV.topOk(ctx, a, b)) || (AV.okSex && !AV.okSex(ctx, a, b)))) return false;
    var p = { heal: 0.5, date: 0.75, back: 0.6, amai: 0.45, after: 0.4 }[entry] || 0.4;
    /* 恋人どうしでない二人は起こりにくく（不仲・敵対・元恋人はさらに） */
    if (!S.couple) p *= /^(bad|ex)$/.test(S.rk) ? 0.55 : 0.75;
    p *= P && P.libMul ? Math.min(1.5, P.libMul([A, B])) : 1;
    if (last && S.sex < S.lewdMax) p = Math.max(p, S.couple ? 0.85 : 0.5);
    if (ctx.rng() > p) return false;
    /* 1. きっかけ：言い出す人（{x}）。治った日・デート・甘い夜は看病された人（B）が多く、うつって治った夜は看病し返された人（A） */
    var x = entry === 'back' ? (ctx.rng() < 0.7 ? A : B) : entry === 'amai' ? (ctx.rng() < 0.5 ? A : B) : (ctx.rng() < 0.7 ? B : A), y = x === A ? B : A;
    /* 言い出す人が相手を避けていれば、相手を言い出す人にする（両方なら起こさない） */
    if (AV && AV.of && AV.of(ctx, x, y)) { if (AV.of(ctx, y, x)) return false; var sw = x; x = y; y = sw; }
    var fx = PR.att(x, y), fy = PR.att(y, x);
    var lead = KB.pickT(ctx, (T.LEAD || {})[entry], x, y) || KB.pickT(ctx, (T.LEAD || {})[entry], x, y, true) || LEAD_FB, feel = KB.pickT(ctx, (T.FEEL || {})[fx] || (T.FEEL || {}).gentle, x, y), ans = KB.pickT(ctx, (T.FANS || {})[fy] || (T.FANS || {}).gentle, x, y);
    var lt = K.fill(ctx, lead + feel + ans, x, y);
    var why = 'きっかけ：' + ENTRY[entry] + '（' + x.name + 'から・' + (x === B && entry !== 'back' ? '看病してもらった気持ち' : entry === 'back' ? '看病し返してもらった気持ち' : '看病した相手への' + (S.couple ? '愛しさ' : '情')) + '）';
    /* 恋愛の出来事にできない組（本体の romanceOk）では、きっかけの段を記録から落とさないよう bond にする */
    var lcat = S.love && (!ctx.romanceOk || ctx.romanceOk([x, y], false)) ? 'romance' : 'bond';
    var le = ctx.say({ kind: 'event', cat: lcat, actors: [x, y], text: lt, why: why, mag: 0 });
    if (le) le.tag = 'きっかけ';
    /* 2. 場面 */
    var lv = LV ? LV.lv(env) : 'mid', ero = !!(LV && LV.ero(env) && HK.ThickEro);
    var nogen = !!(HK.NoGen && HK.NoGen.on && HK.NoGen.on(a, b));
    var form = PR.formOf(ctx, S, env, lv, nogen, last);
    SRC.R = { BOTTOM: T.BOTTOM_ROWS, TOP: T.TOP_ROWS };
    var play = J.pick(ctx, 'kplay', T.PLAY_ROWS) || T.PLAY_ROWS[0], pi = T.PLAY_ROWS.indexOf(play);
    var full = PR.scene(ctx, S, env, a, b, sh, form, { lv: lv, ero: ero, nogen: nogen, play: play, pi: pi, afi: 0, jealTop: false, leadB: x === b, entry: entry, resume: false }, SRC);
    form = full.form;
    /* 一つの場面の中で同じ文（12 字以上）を二度出さない（本体の部品を重ねたときの重なりを、あとの方から外す） */
    full.text = dedupe(full.text);
    var e = ctx.act2({ actors: [a, b], cat: S.love ? 'romance' : 'bond', text: full.text, why: '看病の部屋：夜（' + FORM[form] + '・' + ENTRY[entry] + '）', sex: true, lewd: form !== 'fade',
      fx: function () { ctx.mod2(a, b, { aff: 4, att: 6, trust: 2 }, { aff: 4, att: 6, trust: 2 }); } });
    if (!e) { if (le) { var L = ctx.log, i = L.indexOf(le); if (i >= 0) L.splice(i, 1); } return false; }
    if (form === 'long') S.longN = (S.longN || 0) + 1;
    S.forms = S.forms || {}; S.forms[form] = (S.forms[form] || 0) + 1;
    S.entries = S.entries || {}; S.entries[entry] = (S.entries[entry] || 0) + 1;
    return true;
  };
})();
/* r18:end */
