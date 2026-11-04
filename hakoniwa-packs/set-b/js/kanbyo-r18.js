/* r18:begin */
/* @event scen=set-b-kanbyo id=kb_night_heal cat=romance tie=- tags=night label=治った日の夜に気持ちがあふれる */
/* @event scen=set-b-kanbyo id=kb_night_date cat=romance tie=- tags=night label=お礼のデートの帰りに結ばれる夜 */
/* @event scen=set-b-kanbyo id=kb_night_back cat=romance tie=- tags=night label=看病し返されて治った夜 */
/* @event scen=set-b-kanbyo id=kb_night_amai cat=romance tie=lover tags=night label=いつもより甘い数日の夜 */
/* @event scen=set-b-kanbyo id=kb_night_after cat=romance tie=- tags=night label=治ったあとの夜に看病の礼を交わす */
/* @event scen=set-b-kanbyo id=kb_ill_osoi cat=romance tie=- tags=night label=熱に浮かされた受けのほうから迫る夜 */
/* @event scen=set-b-kanbyo id=kb_ill_soine cat=romance tie=- tags=night label=心細くて一緒に寝るうちに求め合う夜 */
/* @event scen=set-b-kanbyo id=kb_ill_yukkuri cat=romance tie=- tags=night label=熱のある体を気づかうゆっくりした夜 */
/* @event scen=set-b-kanbyo id=kb_ill_rise cat=romance tie=- tags=night label=弱った相手に看る側の理性が揺らぐ夜 */
/* @event scen=set-b-kanbyo id=kb_ill_kuchi cat=romance tie=- tags=night label=今日はここまでと口や手だけで終える夜 */
/* @event scen=set-b-kanbyo id=kb_ill_kuchi_more cat=romance tie=- tags=night label=口だけのはずが我慢できず最後までする */
/* @event scen=set-b-kanbyo id=kb_ill_jii cat=solo tie=- tags=night label=相手が寝込む夜に別室でひとりで慰める */
/* @event scen=set-b-kanbyo id=kb_ill_jii_found cat=romance tie=- tags=night label=別室でひとりでしているのを見つかる夜 */
/* @event scen=set-b-kanbyo id=kb_ill_jii_next cat=romance tie=- tags=night label=今日もするのかと腕を掴まれる翌晩 */
/* @event scen=set-b-kanbyo id=kb_long_mizu cat=romance tie=- tags=night label=水をこぼして濡れた服を脱がせるうちに */
/* @event scen=set-b-kanbyo id=kb_long_ase cat=romance tie=- tags=night label=汗を拭くうちに手が止まらなくなる夜 */
/* @event scen=set-b-kanbyo id=kb_long_koori cat=romance tie=- tags=night label=氷枕を替える夜に熱い額へ口づけて */
/* @event scen=set-b-kanbyo id=kb_long_shouko cat=romance tie=- tags=night label=元気になった証拠を見せる看病のお礼の夜 */
/* @event scen=set-b-kanbyo id=kb_ill_kusuri cat=romance tie=- tags=night label=薬を口移しで飲ませるうちに求め合う夜 */
/* @event scen=set-b-kanbyo id=kb_ill_samuke cat=romance tie=- tags=night label=寒気に震える体を肌で温めるうちに */
/* @event scen=set-b-kanbyo id=kb_ill_taion cat=romance tie=- tags=night label=額を合わせて熱を測るうちに唇が触れる夜 */
/* @event scen=set-b-kanbyo id=kb_well_momo cat=romance tie=- tags=night label=桃の缶詰を食べさせ合ううちに始まる夜 */
/* @event scen=set-b-kanbyo id=kb_well_doraiya cat=romance tie=- tags=night label=風呂上がりの髪を乾かすうちに始まる夜 */
/* @event scen=set-b-kanbyo id=kb_well_gokko cat=romance tie=- tags=night label=今度は私が看る番と看病ごっこから始まる夜 */
/* @event scen=set-b-kanbyo id=kb_well_yume cat=romance tie=- tags=night label=熱の夜に見た夢の話から始まる夜 */
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
  /* 一回の遊びで同じ始まり・ほのめかすの文を二度使わない（使った文を外した候補を渡し、場面のあとで本文に入った文を覚える） */
  var CUR = null;
  function fresh(arr) { var U = CUR && CUR.kb && CUR.kb.used; if (!U || !arr) return arr; var q = arr.filter(function (x) { return !U['r18:' + x]; }); return q.length ? q : arr; }
  function remember(ctx, text, lists) { var U = ctx.kb.used; lists.forEach(function (l) { (l || []).forEach(function (x) { var k = String(x).replace(/\{[^}]+\}|「[^」]*」/g, '').slice(0, 14); if (k && text.indexOf(k) >= 0) U['r18:' + x] = 1; }); }); }
  var SRC = { TX: TX, MO: function () { var T = TX(); return { OPEN: fresh(T.OPEN), REOPEN: fresh(T.OPEN), FADE: fresh(T.FADE), PEAK_E: PR.FB.peakE }; }, R: null, ok: function () { return KB.okText; } };
  /* 病気の道中の場面の文（反応・事後・ほのめかすを、熱のある夜の版に） */
  var SRC_ILL = { TX: function () { var T = TX(); return { PLAY: T.PLAY, AFTER: T.AFTER, BOTTOM: T.ILL_BOTTOM, TOP: T.ILL_TOP }; }, MO: function () { var T = TX(); return { OPEN: T.OPEN, REOPEN: T.OPEN, FADE: fresh(T.ILL_FADE), PEAK_E: PR.FB.peakE }; }, R: null, ok: function () { return KB.okText; } };
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
  /* ---------- 病気の道中の夜（2026-11-03 利用者の追加の指示）----------
     KR.ill(ctx, day, last)：看る人が来ている夜で、熱のある人がいる夜。kanbyo.js の illNight が呼ぶ（寝込むほど重いときのいちばん高い夜・回数の上限・一回の遊びで一度まで）
     入口：osoi 熱に浮かされた受けが迫る（受けが看病される人のときだけ。攻めが受け止めて主導する＝受け攻めは入れ替えない）／soine 心細くて一緒に寝る→したくなる／
       yukkuri 熱のある体を気づかうゆっくりした場面（短い場面だけ。山場も静か）／rise 弱った相手に看る側（攻め）の理性が揺らぐ（合意の上。受けの「でも……」とためらう段を必ず入れる）
     翌朝は kanbyo.js の afterIll（反省・甘やかし。熱がぶり返す・看る人にうつりやすくなる） */
  /* ---------- 看病の部屋でしか出ない長い場面（mizu・ase・koori は熱の下がってきた夜で、受けが看病される人のとき。shouko は治った日の夜） ---------- */
  var LONG = { mizu: '水をこぼして濡れた服を脱がせるうちに', ase: '汗を拭くうちに手が止まらなくなって', koori: '氷枕を替える夜に熱い額へ口づけて', shouko: '元気になった証拠を見せる看病のお礼' };
  KR.LONG = LONG;
  function longScene(ctx, key, a, b, sh, x, y, last) {
    var S = ctx.kb, env = ctx.env, T = TX(), LV = HK.Lewd;
    var lv = LV ? LV.lv(env) : 'mid', ero = !!(LV && LV.ero(env) && HK.ThickEro);
    var L0 = KB.pickT(ctx, (T.LONG_LEAD || {})[key], x, y, true);
    var FE = T.FEEL || {}, fe = key === 'shouko' ? KB.pickT(ctx, FE[PR.att(x, y)] || FE.gentle, x, y) : '';
    var le = lead(ctx, x, y, K.fill(ctx, L0 + (fe || ''), x, y), LONG[key] + '・' + x.name + 'から', key === 'shouko' ? '治った日の夜' : '');
    var pk = function (arr) { return pickOf(ctx, arr); }, text, form;
    if (lv === 'low') { text = K.fill(ctx, KB.pickT(ctx, T.ILL_FADE, a, b, true), a, b); form = 'fade'; }
    else {
      CUR = ctx;
      var open = K.mark(KB.pickT(ctx, ((T.LONG_OPEN || {})[key] || {})[sh], a, b, true)), aft = K.mark(KB.pickT(ctx, (T.LONG_AFTER || {})[key], a, b, true));
      var st = HK.ThickSex.style(a);
      var rr = ero ? HK.ThickEro.scene({ S: ctx, pick: pk, rng: ctx.rng, a: a, b: b, style: st, open: open, after: aft, jealous: false, leadB: x === b })
        : HK.ThickSex.scene({ pick: pk, rng: ctx.rng, a: a, b: b, style: st, open: open, after: aft, ctx: ctx, jealous: false, leadB: x === b });
      text = dedupe(ctx.t(rr.text, a, b)); form = 'long';
    }
    var e = ctx.act2({ actors: [a, b], cat: S.love ? 'romance' : 'bond', text: text, why: '看病の部屋：' + (key === 'shouko' ? '夜' : '熱のある夜') + '（' + FORM[form] + '・' + LONG[key] + '）', sex: true, lewd: form !== 'fade',
      fx: function () { ctx.mod2(a, b, { aff: 4, att: 6 }, { aff: 4, att: 6 }); } });
    if (!e) { drop(ctx, le); return false; }
    if (form === 'long') S.longN = (S.longN || 0) + 1;
    S.entries = S.entries || {}; S.entries['long_' + key] = (S.entries['long_' + key] || 0) + 1;
    return true;
  }

  /* ---------- 看病ならではの入り方・最中の一幕・終わり方（2026-11-04 不具合リスト 1104 の 11「共通部品以外のエロを一定量」。文は kanbyo-r18-text-b.js）----------
     入り方：熱のある夜 3（kusuri・samuke・taion。KR.ill の候補に足す）／治ったあとの夜 4（momo・doraiya・gokko・yume。KR.night が 45% で使う）。どれもきっかけの段つき
     最中の一幕：短い・中くらいの場面は挿入の前の段に、長い場面は始まりの段のあとに一つ差す（一回の遊びで同じ一幕は一度）
     終わり方：短い・中くらいの場面は事後の段を替え、長い場面は事後に渡す（一回の遊びで同じ終わり方は一度） */
  var NEW_NAME = { kusuri: '薬を口移しで飲ませるうちに', samuke: '寒気に震える体を肌で温めるうちに', taion: '額を合わせて熱を測るうちに', momo: '桃の缶詰を食べさせ合ううちに', doraiya: '風呂上がりの髪を乾かすうちに', gokko: '今度は私が看る番と看病ごっこから', yume: '熱の夜に見た夢の話から' };
  KR.NEW = NEW_NAME;
  function pT(ctx, arr, a, b) { return KB.pickT(ctx, arr, a, b, true); }
  function attT(ctx, tbl, x, y) { tbl = tbl || {}; return pT(ctx, tbl[PR.att(x, y)] || tbl.gentle, x, y); }
  function unused(ctx, tag, keys) { var U = ctx.kb.used; return keys.filter(function (k) { return !U[tag + k]; }); }
  /* 最中の一幕の段（名前を当てた文）：p＝熱のある人・治った人、q＝看る人 */
  function beatText(ctx, a, b, sh, p, q, ill) {
    var BT = TX().BEAT || {}, keys = unused(ctx, 'beat:', Object.keys(BT).filter(function (k) { var w = BT[k].when; return w === 'both' || w === (ill ? 'ill' : 'well'); }));
    if (!keys.length) return '';
    var k = keys[Math.floor(ctx.rng() * keys.length)], B0 = BT[k];
    var ev = pT(ctx, B0.ev, p, q), re = attT(ctx, B0.re, p, q), co = pT(ctx, B0[sh], a, b);
    if (!ev || !co) return '';
    ctx.kb.used['beat:' + k] = 1;
    return K.fill(ctx, ev + (re || ''), p, q) + K.fill(ctx, co, a, b);
  }
  /* 終わり方の段（名前を当てた文） */
  function endText(ctx, a, b, sh, p, q, not) {
    var KE = TX().KEND || {}, keys = unused(ctx, 'kend:', Object.keys(KE).filter(function (k) { return k !== not; }));
    if (!keys.length) return '';
    var k = keys[Math.floor(ctx.rng() * keys.length)], E0 = KE[k];
    var co = pT(ctx, E0[sh], a, b), ev = pT(ctx, E0.ev, p, q), re = attT(ctx, E0.re, p, q);
    if (!co || !ev) return '';
    ctx.kb.used['kend:' + k] = 1;
    return K.fill(ctx, co, a, b) + K.fill(ctx, ev + (re || ''), p, q);
  }
  /* 段落の頭の一文のあと（短い場面＝挿入より前）か、一つ目の段落のあと（中くらい＝受けの反応のあと）に段を差す */
  function afterFirst(text, ins, form) {
    if (!ins) return text;
    var P = String(text).split('\n\n');
    if (form === 'mid' && P.length > 1) { P.splice(1, 0, ins); return P.join('\n\n'); }
    var t = P[0], d = 0;
    for (var k = 0; k < t.length; k++) { var c = t.charAt(k); if (c === '「') d++; else if (c === '」') d = Math.max(0, d - 1); else if (!d && c === '。' && k < t.length - 1) { P[0] = t.slice(0, k + 1) + '\n\n' + ins + '\n\n' + t.slice(k + 1); return P.join('\n\n'); } }
    P.splice(0, 0, ins);
    return P.join('\n\n');
  }
  /* 入り方の本文の雛形（{a}{b} のまま）の最後の一文（つながる文）の前で段落を分け、そこに最中の一幕を差す */
  function withBeat(t, bt) {
    t = String(t || ''); var d = 0, pos = -1;
    for (var k = 0; k < t.length - 1; k++) { var c = t.charAt(k); if (c === '「') d++; else if (c === '」') d = Math.max(0, d - 1); else if (!d && c === '。') pos = k + 1; }
    if (pos < 0) return bt ? bt + '\n\n' + t : t;
    return t.slice(0, pos) + '\n\n' + (bt ? bt + '\n\n' : '') + t.slice(pos);
  }
  /* 短い・中くらいの場面に、最中の一幕（pb の確率）と終わり方（pe の確率。最後の段落＝事後を替える）を入れる */
  function spice(ctx, text, form, a, b, sh, p, q, ill, pb, pe, notEnd) {
    if (form !== 'short' && form !== 'mid') return text;
    if (ctx.rng() < pb) text = afterFirst(text, beatText(ctx, a, b, sh, p, q, ill), form);
    if (ctx.rng() < pe) { var en = endText(ctx, a, b, sh, p, q, notEnd); if (en) { var P = text.split('\n\n'); if (P.length > 1) { P[P.length - 1] = en; text = P.join('\n\n'); } } }
    return text;
  }
  /* 入り方の場面：key＝入り方、ill＝熱のある夜か、x＝言い出す人、p＝熱のある人・治った人、q＝看る人、entry＝治ったあとの夜の入口（ill のときは null） */
  function newScene(ctx, key, a, b, sh, ill, x, y, p, q, entry, last) {
    var S = ctx.kb, env = ctx.env, T = TX(), NE = (T.NEW || {})[key], LV = HK.Lewd;
    if (!NE) return false;
    /* 1. きっかけ（入り方の地の文＋言い出す人の態度9種の一言。治ったあとの夜は相手の応え） */
    var lt = pT(ctx, NE.lead, x, y) + (attT(ctx, NE.feel, x, y) || '') + (ill ? '' : (attT(ctx, T.FANS, y, x) || ''));
    var le = lead(ctx, x, y, K.fill(ctx, lt, x, y), NEW_NAME[key] + '・' + x.name + 'から', ill ? '熱のある夜' : ENTRY[entry]);
    /* 2. 場面：熱のある夜は短い〜中くらい、治ったあとの夜は共通の長さの決め方 */
    var lv = LV ? LV.lv(env) : 'mid', ero = !!(LV && LV.ero(env) && HK.ThickEro), nogen = !!(HK.NoGen && HK.NoGen.on && HK.NoGen.on(a, b));
    var form = ill ? (lv === 'low' ? 'fade' : env.lewdLen === 'short' || ctx.rng() < 0.5 ? 'short' : 'mid') : PR.formOf(ctx, S, env, lv, nogen, last);
    if (form === 'mid' && nogen) form = 'short';
    if (form === 'long' && (!NE.open || !HK.ThickSex)) form = 'mid';
    var text, pk = function (arr) { return pickOf(ctx, arr); };
    CUR = ctx;
    if (form === 'long') {
      var open = K.mark(pT(ctx, NE.open[sh], a, b)), bt = beatText(ctx, a, b, sh, p, q, ill), en = endText(ctx, a, b, sh, p, q, key === 'momo' ? 'yashoku' : '');
      if (bt) open += '\n\n' + bt;
      var again = lv === 'high' && HK.ThickEro ? HK.ThickEro.again(ctx, pk, a, b, ero, false) + '\n\n' : '';
      var aft = again + (en || K.mark(pickOf(ctx, T.AFTER[0].all)));
      var st = HK.ThickSex.style(a);
      var rr = ero ? HK.ThickEro.scene({ S: ctx, pick: pk, rng: ctx.rng, a: a, b: b, style: st, open: open, after: aft, jealous: false, leadB: x === b })
        : HK.ThickSex.scene({ pick: pk, rng: ctx.rng, a: a, b: b, style: st, open: open, after: aft, ctx: ctx, jealous: false, leadB: x === b });
      text = dedupe(ctx.t(rr.text, a, b));
    } else {
      var base = ill ? SRC_ILL : SRC, bt0 = ctx.rng() < 0.75 ? beatText(ctx, a, b, sh, p, q, ill) : '', row = {};
      /* 雛形には目印（〔一幕〕）だけを差し、名前を当てたあとで一幕の段に置き換える（一幕の台詞に雛形の話し手の印が付かないように） */
      ['mf', 'ff', 'fm'].forEach(function (k) { row[k] = (NE.play[k] || []).map(function (t) { return withBeat(t, bt0 ? '〔一幕〕' : ''); }); });
      var SRC_N = { TX: function () { var t0 = base.TX(); return { PLAY: [row], AFTER: t0.AFTER || T.AFTER, BOTTOM: t0.BOTTOM, TOP: t0.TOP }; }, MO: base.MO, R: ill ? { BOTTOM: T.ILL_BOTTOM_ROWS, TOP: T.ILL_TOP_ROWS } : { BOTTOM: T.BOTTOM_ROWS, TOP: T.TOP_ROWS }, ok: base.ok };
      var full = PR.scene(ctx, S, env, a, b, sh, form, { lv: ill ? (lv === 'low' ? 'low' : 'mid') : lv, ero: ero, nogen: nogen, pi: 0, afi: ill ? 1 : 0, jealTop: false, leadB: x === b, entry: x === b ? 'ini' : key, resume: false }, SRC_N);
      form = full.form;
      /* 最中の一幕が本文に入らなかった（男性向けの短い場面・性器なしの組は本文の部品が替わる）ときは、段落の頭のあとに差す */
      if (bt0 && full.text.indexOf('〔一幕〕') >= 0) full.text = full.text.replace('〔一幕〕', full.form === 'fade' ? '' : bt0).replace(/\n\n\n\n/g, '\n\n');
      else if (bt0 && full.form !== 'fade') full.text = afterFirst(full.text, bt0, form);
      text = full.form === 'fade' ? full.text : spice(ctx, full.text, form, a, b, sh, p, q, ill, 0, 1, key === 'momo' ? 'yashoku' : '');
      text = dedupe(text);
      remember(ctx, text, [T.OPEN, T.FADE, T.ILL_FADE]);
    }
    var e = ctx.act2({ actors: [a, b], cat: S.love ? 'romance' : 'bond', text: text, why: '看病の部屋：' + (ill ? '熱のある夜' : '夜') + '（' + FORM[form] + '・' + NEW_NAME[key] + '）', sex: true, lewd: form !== 'fade',
      fx: function () { ctx.mod2(a, b, { aff: 4, att: 6 }, { aff: 4, att: 6 }); } });
    if (!e) { drop(ctx, le); return false; }
    S.used['new:' + key] = 1;
    if (form === 'long') S.longN = (S.longN || 0) + 1;
    S.forms = S.forms || {}; S.forms[form] = (S.forms[form] || 0) + 1;
    S.entries = S.entries || {}; S.entries[(ill ? 'ill_' : 'well_') + key] = (S.entries[(ill ? 'ill_' : 'well_') + key] || 0) + 1;
    if (ill) S.illEntry = key;
    return true;
  }
  /* 治ったあとの夜の入り方を選ぶ（使っていないもの。言い出す人が相手を避けていれば入れ替え、両方なら使わない）。使えなければ null */
  function newWell(ctx, entry, a, b, sh, last) {
    var S = ctx.kb, A = S.A, B = S.B, AV = HK.Avoid, NE = TX().NEW || {};
    var h = entry === 'back' ? A : B, q = h === A ? B : A;
    var keys = unused(ctx, 'new:', Object.keys(NE).filter(function (k) { return NE[k].well; }));
    if (!keys.length) return null;
    var key = keys[Math.floor(ctx.rng() * keys.length)], xk = NE[key].x;
    var x = xk === 'healed' ? h : xk === 'carer' ? q : (ctx.rng() < 0.5 ? h : q), y = x === h ? q : h;
    if (AV && AV.of && AV.of(ctx, x, y)) { if (AV.of(ctx, y, x) || xk !== 'any') return null; var sw = x; x = y; y = sw; }
    return newScene(ctx, key, a, b, sh, false, x, y, h, q, entry, last);
  }
  var ILL = { osoi: '熱に浮かされて受けから', soine: '心細くて一緒に寝るうちに', yukkuri: '体を気づかってゆっくり', rise: '看る側の理性が揺らいで', kuchi: '今日はここまでと口や手だけで', jii: '別室でひとりで', jiinext: '今日もするのかと腕を掴まれて' };
  KR.ILL = ILL;
  KR.ill = function (ctx, day, last) {
    var S = ctx.kb, env = ctx.env, LV = HK.Lewd, P = HK.Pos, A = S.A, B = S.B, T = TX(), AV = HK.Avoid;
    if (!T.ILL_LEAD) return false;
    if (!PR.sexOk(ctx, A, B) || (P && P.okSex && !P.okSex(A, B))) return false;
    var o = P && P.order ? P.order(A, B) : [A, B], a = o[0], b = o[1], sh = PR.shape(a, b);
    if (AV && ((AV.topOk && !AV.topOk(ctx, a, b)) || (AV.okSex && !AV.okSex(ctx, a, b)))) return false;
    /* 起こりやすさ：低め（恋人どうしでない二人はさらに低い）。性欲で上下 */
    var p = (S.couple ? 0.22 : 0.12) * (P && P.libMul ? Math.min(1.5, P.libMul([A, B])) : 1);
    if (ctx.rng() > p) return false;
    /* 入口の選び方：受けが看病される人なら「受けから迫る」も。看る側が攻めなら「理性が揺らぐ」も */
    var bt = PR.att(b, a), tp = PR.att(a, b), ld = P && P.leadOf ? P.leadOf(b) : '', kd = HK.Attr && HK.Attr.nightKind ? HK.Attr.nightKind(a, b) : '';
    var W = [['yukkuri', 1.2], ['soine', /devoted|gentle|shy|free/.test(PR.att(B, A)) ? 1.1 : 0.6]];
    if (b === B && ld !== 'top' && !(P && P.hardTop && P.hardTop(b, a))) W.push(['osoi', /sasoi|osoi/.test(ld) ? 1.4 : /free|proud|devoted/.test(bt) ? 0.8 : 0.4]);
    W.push(['kuchi', 1], ['jii', 0.8]);
    /* 看病ならではの入り方（2026-11-04）：薬を口移し・額で熱を測る（看る人から）、寒気を肌で温める（熱のある人が頼む） */
    unused(ctx, 'new:', ['kusuri', 'samuke', 'taion']).forEach(function (k) { W.push([k, 1]); });
    /* 専用の長い場面（受けが看病される人で、熱の下がってきた日か軽い風邪） */
    if (b === B && (day.st === 'fall' || S.sev === 'light') && !(HK.NoGen && HK.NoGen.on && HK.NoGen.on(a, b))) W.push(['mizu', 1.2], ['ase', 1.2], ['koori', 1.2]);
    if (a === A) W.push(['rise', /sadist|mean/.test(kd) ? 1.4 : /proud|free|cool/.test(tp) ? 1 : 0.7]);
    var entry = HK.weighted(ctx.rng, W, function (x) { return x[1]; })[0];
    if (entry === 'mizu' || entry === 'ase' || entry === 'koori') return longScene(ctx, entry, a, b, sh, A, B, last);
    if (entry === 'kusuri' || entry === 'taion' || entry === 'samuke') { var xn = entry === 'samuke' ? B : A, yn = xn === A ? B : A; if (AV && AV.of && AV.of(ctx, xn, yn)) return false; return newScene(ctx, entry, a, b, sh, true, xn, yn, B, A, null, last); }
    if (entry === 'kuchi') return kuchi(ctx, day, a, b, sh);
    if (entry === 'jii') return jii(ctx, day, a, b, sh);
    /* 1. きっかけ：x＝言い出す人（osoi・soine は看病される人、rise は攻め、yukkuri は看る人） */
    var x = entry === 'rise' ? a : entry === 'yukkuri' ? A : B, y = x === A ? B : A;
    if (entry === 'osoi') { x = b; y = a; }
    var L0 = KB.pickT(ctx, (T.ILL_LEAD || {})[entry], x, y, true);
    var FE = (T.ILL_FEEL || {})[entry] || {}, fe = KB.pickT(ctx, FE[PR.att(x, y)] || FE.gentle || FE.all, x, y);
    var lt = K.fill(ctx, L0 + (fe || ''), x, y);
    /* 理性が揺らぐ夜は、受けの「でも……」とためらう段と、それでも受け入れる一言を必ず入れる */
    if (entry === 'rise') { var HZ = T.ILL_HESIT || {}, hz = KB.pickT(ctx, HZ[PR.att(b, a)] || HZ.gentle, a, b, true), ok = KB.pickT(ctx, T.ILL_YES, a, b, true); lt += K.fill(ctx, hz + ok, a, b); }
    var lcat = S.love && (!ctx.romanceOk || ctx.romanceOk([x, y], false)) ? 'romance' : 'bond';
    var le = ctx.say({ kind: 'event', cat: lcat, actors: [x, y], text: lt, why: 'きっかけ：熱のある夜（' + ILL[entry] + '・' + x.name + 'から）', mag: 0 });
    if (le) le.tag = 'きっかけ';
    /* 2. 場面：ゆっくりは短い場面（山場の喘ぎを出さない静かな本文）。ほかは中くらいまで（病気の体なので長い場面にしない） */
    var lv = LV ? LV.lv(env) : 'mid', ero = !!(LV && LV.ero(env) && HK.ThickEro), nogen = !!(HK.NoGen && HK.NoGen.on && HK.NoGen.on(a, b));
    var form = lv === 'low' ? 'fade' : entry === 'yukkuri' ? 'short' : (env.lewdLen === 'short' || ctx.rng() < 0.5 ? 'short' : 'mid');
    if (form === 'mid' && nogen) form = 'short';
    SRC_ILL.R = { BOTTOM: T.ILL_BOTTOM_ROWS, TOP: T.ILL_TOP_ROWS };
    var pi = T.PLAY_ROWS.length - (entry === 'yukkuri' ? 2 : 1);
    CUR = ctx;
    var full = PR.scene(ctx, S, env, a, b, sh, form, { lv: lv === 'low' ? 'low' : 'mid', ero: entry === 'yukkuri' ? false : ero, nogen: nogen, pi: pi, afi: 1, jealTop: entry === 'rise', leadB: entry === 'osoi', entry: entry === 'osoi' ? 'ini' : entry, resume: false }, SRC_ILL);
    full.text = dedupe(spice(ctx, full.text, full.form, a, b, sh, B, A, true, 0.5, 0.4, ''));
    remember(ctx, full.text, [T.OPEN, T.FADE, T.ILL_FADE]);
    var e = ctx.act2({ actors: [a, b], cat: S.love ? 'romance' : 'bond', text: full.text, why: '看病の部屋：熱のある夜（' + FORM[full.form] + '・' + ILL[entry] + '）', sex: true, lewd: full.form !== 'fade',
      fx: function () { ctx.mod2(a, b, { aff: 3, att: 5 }, { aff: 3, att: 5 }); } });
    if (!e) { if (le) { var Lg = ctx.log, i = Lg.indexOf(le); if (i >= 0) Lg.splice(i, 1); } return false; }
    S.illEntry = entry;
    S.entries = S.entries || {}; S.entries['ill_' + entry] = (S.entries['ill_' + entry] || 0) + 1;
    return true;
  };
  /* ---------- 「今日はここまで」と口や手だけで終える（2026-11-03 利用者の追加）----------
     看る人が無理をさせない、か、看病される人が「これだけ」とねだる。する側（{s}）：看病される人が受けなら攻めが、看病される人が攻めなら受けが（攻め受けは入れ替えない）。
     山場は口・手の山場（受ける人の態度の喘ぎ）。30% で、ためらいの段を挟んで我慢できずに最後まで（短い場面） */
  function moanOf(ctx, c) { var T0 = HK.ThickSex; var m = T0 && T0.moan ? T0.moan(function (arr) { return pickOf(ctx, arr); }, c, true, ctx.rng) : ''; return m ? String(m).replace(/^「|」$/g, '') : ''; }
  function sceneSay(ctx, a, b, text, why, form, cat) {
    var S = ctx.kb;
    text = dedupe(text);
    var e = ctx.act2({ actors: [a, b], cat: cat || (S.love ? 'romance' : 'bond'), text: text, why: why, sex: true, lewd: true, fx: function () { ctx.mod2(a, b, { aff: 3, att: 4 }, { aff: 3, att: 4 }); } });
    return e;
  }
  function lead(ctx, x, y, text, why, pre) {
    var S = ctx.kb, lcat = S.love && (!ctx.romanceOk || ctx.romanceOk([x, y], false)) ? 'romance' : 'bond';
    var le = ctx.say({ kind: 'event', cat: lcat, actors: [x, y], text: text, why: 'きっかけ：' + (pre || '熱のある夜') + '（' + why + '）', mag: 0 });
    if (le) le.tag = 'きっかけ';
    return le;
  }
  function drop(ctx, le) { if (!le) return; var Lg = ctx.log, i = Lg.indexOf(le); if (i >= 0) Lg.splice(i, 1); }
  function kuchi(ctx, day, a, b, sh) {
    var S = ctx.kb, A = S.A, B = S.B, T = TX();
    var giver = B === b ? a : b, recv = giver === a ? b : a, beg = ctx.rng() < 0.5;
    /* きっかけ：看る人が「今日はここまで」と決める、か、看病される人が「これだけ」とねだる（言い出す人の夜の態度9種） */
    var x = beg ? B : A, y = x === A ? B : A;
    var KL = (T.KUCHI_LEAD || {})[beg ? 'beg' : 'stop'] || {}, kl = KB.pickT(ctx, KL[PR.att(x, y)] || KL.gentle, x, y, true);
    var base = KB.pickT(ctx, T.KUCHI_PRE, x, y, true);
    var le = lead(ctx, x, y, K.fill(ctx, base + kl, x, y), ILL.kuchi + '・' + x.name + 'から');
    /* 本文：する側が受ける側を、口か手で（形と、受ける側に男性器があるかで文を分ける） */
    var P = HK.Pos, mr = P && P.hasM ? P.hasM(recv) : !(P && P.isF && P.isF(recv));
    /* 受けがする側のときは、相手の中に指を入れる文を使わない（攻め受けを入れ替えない） */
    var KB0 = ((T.KUCHI || {})[mr ? 'm' : 'f'] || []).filter(function (x) { return giver !== b || !/\{ナカ\}/.test(x); }), body = KB.pickT(ctx, KB0, giver, recv, true);
    var mo = moanOf(ctx, recv);
    var pk = KB.pickT(ctx, (T.KUCHI_PEAK || {})[mr ? 'm' : 'f'], giver, recv, true).replace('{m}', mo ? '{b}「' + mo + '」' : '');
    var more = ctx.rng() < 0.3 && !(HK.NoGen && HK.NoGen.on && HK.NoGen.on(a, b));
    var text = K.fill(ctx, body + '\n\n' + pk, giver, recv);
    if (!more) {
      text += '\n\n' + K.fill(ctx, KB.pickT(ctx, T.KUCHI_END, A, B, true), A, B);
      var e = sceneSay(ctx, a, b, text, '看病の部屋：熱のある夜（短い場面・' + ILL.kuchi + '）');
      if (!e) { drop(ctx, le); return false; }
      S.illEntry = 'kuchi'; return true;
    }
    /* 我慢できなくなって最後まで：ためらいの段（受けの態度）を挟んで、短い場面 */
    var HZ = T.ILL_HESIT || {}, hz = KB.pickT(ctx, HZ[PR.att(b, a)] || HZ.gentle, a, b, true), ok = KB.pickT(ctx, T.ILL_YES, a, b, true);
    var mid = K.fill(ctx, KB.pickT(ctx, T.KUCHI_MORE, a, b, true) + hz + ok, a, b);
    CUR = ctx; SRC_ILL.R = { BOTTOM: T.ILL_BOTTOM_ROWS, TOP: T.ILL_TOP_ROWS };
    var full = PR.scene(ctx, S, ctx.env, a, b, sh, 'short', { lv: 'mid', ero: false, nogen: false, pi: T.PLAY_ROWS.length - 1, afi: 1, jealTop: true, leadB: false, entry: 'rise', resume: false }, SRC_ILL);
    var e2 = sceneSay(ctx, a, b, text + '\n\n' + mid + '\n\n' + full.text, '看病の部屋：熱のある夜（短い場面・口だけのはずが最後まで）');
    if (!e2) { drop(ctx, le); return false; }
    S.illEntry = 'kuchi_more'; return true;
  }
  /* ---------- 相手が寝込んでいるので、看る人が別室でひとりで慰める（気づかれない／気づかれてエッチに）。翌日は「今日もするのか……？」 ---------- */
  function jii(ctx, day, a, b, sh) {
    var S = ctx.kb, A = S.A, B = S.B, T = TX(), P = HK.Pos;
    var mA = P && P.hasM ? P.hasM(A) : !(P && P.isF && P.isF(A));
    var why0 = KB.pickT(ctx, T.JII_LEAD, A, B, true);
    var le = lead(ctx, A, B, K.fill(ctx, why0, A, B), ILL.jii + '・' + A.name);
    var body = KB.pickT(ctx, (T.JII || {})[mA ? 'm' : 'f'], A, B, true);
    var found = ctx.rng() < 0.4;
    S.jiiDay = day.d;
    if (!found) {
      var tx = K.fill(ctx, body + '\n\n' + KB.pickT(ctx, T.JII_SAFE, A, B, true), A, B);
      var e = ctx.act2({ actors: [A], cat: 'solo', text: dedupe(tx), why: '看病の部屋：熱のある夜（別室でひとりで・気づかれなかった）', lewd: true });
      if (!e) { drop(ctx, le); S.jiiDay = null; return false; }
      S.illEntry = 'jii'; return true;
    }
    /* 気づかれた：見つけた人（看病される人 B）の態度9種のきっかけ → 場面（短い〜中くらい） */
    var FD = T.JII_FOUND || {}, fd = KB.pickT(ctx, FD[PR.att(B, A)] || FD.gentle, A, B, true);
    var tx2 = K.fill(ctx, body + '\n\n' + fd, A, B);
    var le2 = lead(ctx, B, A, tx2, '別室でひとりでしているのを見つけた・' + B.name + 'から');
    CUR = ctx; SRC_ILL.R = { BOTTOM: T.ILL_BOTTOM_ROWS, TOP: T.ILL_TOP_ROWS };
    var full = PR.scene(ctx, S, ctx.env, a, b, sh, ctx.rng() < 0.6 ? 'short' : 'mid', { lv: 'mid', ero: !!(HK.Lewd && HK.Lewd.ero(ctx.env) && HK.ThickEro), nogen: !!(HK.NoGen && HK.NoGen.on && HK.NoGen.on(a, b)), pi: T.PLAY_ROWS.length - 1, afi: 1, jealTop: false, leadB: B === b, entry: 'ini', resume: false }, SRC_ILL);
    var e3 = sceneSay(ctx, a, b, full.text, '看病の部屋：熱のある夜（' + FORM[full.form] + '・別室でしていたのを見つかって）');
    if (!e3) { drop(ctx, le); drop(ctx, le2); S.jiiDay = null; return false; }
    S.illEntry = 'jii_found'; return true;
  }
  /* 翌晩：「今日もするのか……？」と看病される人が腕を掴む（態度9種）。55% でそこから始まる夜、ほかは「今夜は大人しく寝る」 */
  KR.jiiNext = function (ctx, day, canSex) {
    var S = ctx.kb, A = S.A, B = S.B, T = TX(), P = HK.Pos;
    S.jiiDay = null;
    var GR = T.JII_NEXT || {}, g = KB.pickT(ctx, GR[PR.att(B, A)] || GR.gentle, A, B, true);
    if (!g) return false;
    var go = canSex && PR.sexOk(ctx, A, B) && !(P && P.okSex && !P.okSex(A, B)) && ctx.rng() < 0.55;
    var o = P && P.order ? P.order(A, B) : [A, B], a = o[0], b = o[1], AV = HK.Avoid;
    if (go && AV && ((AV.topOk && !AV.topOk(ctx, a, b)) || (AV.okSex && !AV.okSex(ctx, a, b)))) go = false;
    if (!go) {
      var t = K.fill(ctx, g + KB.pickT(ctx, T.JII_NEXT_NO, A, B, true), A, B);
      ctx.act2({ actors: [B, A], cat: 'bond', text: t, why: '看病の部屋：今日もするのかと腕を掴まれた夜（大人しく寝た）' });
      return false;
    }
    var le = lead(ctx, B, A, K.fill(ctx, g + KB.pickT(ctx, T.JII_NEXT_YES, A, B, true), A, B), ILL.jiinext + '・' + B.name + 'から');
    var sh = PR.shape(a, b);
    CUR = ctx; SRC_ILL.R = { BOTTOM: T.ILL_BOTTOM_ROWS, TOP: T.ILL_TOP_ROWS };
    var full = PR.scene(ctx, S, ctx.env, a, b, sh, ctx.rng() < 0.5 ? 'short' : 'mid', { lv: 'mid', ero: !!(HK.Lewd && HK.Lewd.ero(ctx.env) && HK.ThickEro), nogen: !!(HK.NoGen && HK.NoGen.on && HK.NoGen.on(a, b)), pi: T.PLAY_ROWS.length - 1, afi: 1, jealTop: false, leadB: B === b, entry: B === b ? 'ini' : 'jiinext', resume: false }, SRC_ILL);
    var e = sceneSay(ctx, a, b, full.text, '看病の部屋：熱のある夜（' + FORM[full.form] + '・' + ILL.jiinext + '）');
    if (!e) { drop(ctx, le); return false; }
    S.entries = S.entries || {}; S.entries.ill_jiinext = (S.entries.ill_jiinext || 0) + 1;
    return true;
  };
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
    /* 治った日の夜は 35% で専用の長い場面「元気になった証拠を見せる」（言い出すのは治った人） */
    if (entry === 'heal' && !(HK.NoGen && HK.NoGen.on && HK.NoGen.on(a, b)) && ctx.rng() < 0.35) { var AVx = HK.Avoid, xb = B, yb = A; if (AVx && AVx.of && AVx.of(ctx, B, A)) { xb = A; yb = B; } return longScene(ctx, 'shouko', a, b, sh, xb, yb, last); }
    /* 看病ならではの入り方（2026-11-04）：45% で、桃の缶詰・風呂上がりの髪・看病ごっこ・熱の夜の夢 */
    if (ctx.rng() < 0.45) { var nw = newWell(ctx, entry, a, b, sh, last); if (nw != null) return nw; }
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
    /* 最後の二行は病気の道中の夜の種なので、治ったあとの夜には使わない */
    var play = J.pick(ctx, 'kplay', T.PLAY_ROWS, function (x, i) { return i < T.PLAY_ROWS.length - 2 ? 1 : 0; }) || T.PLAY_ROWS[0], pi = T.PLAY_ROWS.indexOf(play);
    CUR = ctx;
    var full = PR.scene(ctx, S, env, a, b, sh, form, { lv: lv, ero: ero, nogen: nogen, play: play, pi: pi, afi: 0, jealTop: false, leadB: x === b, entry: entry, resume: false }, SRC);
    form = full.form;
    /* 一つの場面の中で同じ文（12 字以上）を二度出さない（本体の部品を重ねたときの重なりを、あとの方から外す） */
    full.text = dedupe(spice(ctx, full.text, form, a, b, sh, entry === 'back' ? A : B, entry === 'back' ? B : A, false, 0.45, 0.4, ''));
    remember(ctx, full.text, [T.OPEN, T.FADE, T.ILL_FADE]);
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
