/* r18:begin */
/* @event scen=set-b-shinkon id=sk_night_lewd cat=romance tie=- tags=night label=ちょっとえっちな出来事から始まる夜 */
/* @event scen=set-b-shinkon id=sk_night_trig cat=romance tie=- tags=night label=日々の気持ちの高まりから始まる夜 */
/* @event scen=set-b-shinkon id=sk_night_witness cat=romance tie=- tags=night label=ひとりでしているのを見てしまう夜 */
/* @event scen=set-b-shinkon id=sk_night_gomu cat=romance tie=- tags=night label=ゴムを買いそびれたけれどねだられる夜 */
/* @event scen=set-b-shinkon id=sk_night_late cat=romance tie=- tags=night label=残業で遅く帰った相手を求める夜 */
/* @event scen=set-b-shinkon id=sk_night_rain cat=romance tie=- tags=night label=雨に濡れて帰り一緒に温まる夜 */
/* @event scen=set-b-shinkon id=sk_night_dark cat=romance tie=- tags=night label=停電の暗がりで身を寄せ合う夜 */
/* @event scen=set-b-shinkon id=sk_night_trip cat=romance tie=- tags=night label=出張から帰った相手と過ごす夜 */
/* @event scen=set-b-shinkon id=sk_night_jeal cat=romance tie=- tags=night label=来客へのヤキモチから始まる夜 */
/* @event scen=set-b-shinkon id=sk_night_ini cat=romance tie=- tags=night label=受けのほうから誘う・迫る・ねだる夜 */
/* @event scen=set-b-shinkon id=sk_form_fade cat=romance tie=- tags=night label=夜の場面・ほのめかす（暗転と翌朝） */
/* @event scen=set-b-shinkon id=sk_form_short cat=romance tie=- tags=night label=夜の場面・短い場面（52種の内容） */
/* @event scen=set-b-shinkon id=sk_form_mid cat=romance tie=- tags=night label=夜の場面・中くらいの場面（反応と山場） */
/* @event scen=set-b-shinkon id=sk_form_long cat=romance tie=- tags=night label=夜の場面・段落を分けた長い場面 */
/* 新婚部屋の夜（R18版だけ。全年齢版のパックを組み立てるとき、この印の間は落ちる）
   ■ HK.ShinkonR18.quota(ctx, 'low'|'mid'|'high')：一回の遊びのエッチの回数（1／1〜2／2〜3）
   ■ HK.ShinkonR18.night(ctx, A, B, day, last)：その夜にエッチの場面を出したら true
     ・体の関係にしてよい組だけ（HK.State.pairSex・HK.sexBlocked・HK.ngSexPair・HK.canLove を両方向）。受け攻めは HK.Pos.order
     ・起こりやすさ：願望が高まった夜（願望行動の urge）・ちょっとえっちな日替わり・残りの回数と残りの夜（回数に届くように最後のほうで足す）
     ・入口：ちょっとえっちな日替わりイベント／きっかけ表（♦8「隠れてしていた自慰を目撃されて」は専用の流れ）
     ・形：短い場面（きっかけ・プレイの内容・事後）と中くらいの場面（きっかけ・前戯の反応・プレイの内容・攻めの反応・山場＝HK.ThickSex.scene・事後）を 6：4 で
     ・場面の直前に必ず「きっかけ」の段（記録の一件。理由の欄は「きっかけ：…」）
   ■ 文は shinkon-r18-text.js の HK.ShinkonR18Text（表の行ごと・形 mf／ff／fm ごと）。無い行は下の FB の文
   体の語は印（{男性器} など。lewd-words.js が作風で語を選ぶ）。登場人物はすべて成人として扱う */
(function () {
  'use strict';
  var HK = window.HK;
  var R = HK.ShinkonR18Data;
  if (!R || !HK.Journal) return;
  var J = HK.Journal;
  function L(s) { return s.split('|'); }
  function TX() { return HK.ShinkonR18Text || {}; }
  function pickOf(ctx, arr) { return arr && arr.length ? arr[Math.floor(ctx.rng() * arr.length)] : ''; }
  function fill(ctx, t, a, b, ex) {
    t = String(t || '');
    if (ex) Object.keys(ex).forEach(function (k) { t = t.split('{' + k + '}').join(ex[k]); });
    return ctx.t(t, a, b);
  }
  var PR = HK.PairR18;
  if (!PR) return;
  var sexOk = PR.sexOk, shape = PR.shape;
  /* 表の行ごとの文（共通の部品 HK.PairR18.text。新婚部屋の文 HK.ShinkonR18Text と、家事の担い手の絞り込み HK.Shinkon.okText） */
  var SRC = { TX: TX, MO: function () { return HK.ShinkonR18More || {}; }, R: R, ok: function () { return HK.Shinkon ? HK.Shinkon.okText : null; } };
  function text(ctx, key, i, sh, fb, a, b) { return PR.text(ctx, SRC, key, i, sh, fb, a, b); }
  /* 文の予備は共通の部品（kit-r18.js の HK.PairR18.FB） */
  var FB = PR.FB;
  var LEAD_FB = L('{who}の気持ちは、もう溢れそうだった。一日の終わりの寝室で、{who}は黙って手を伸ばした。|二人きりの夜、どちらからともなく目が合った。{who}は、もう気持ちを隠すのをやめた。|灯りを落とした部屋で、{who}がそっと身を寄せた。新婚の夜に、それを止める理由はどこにもなかった。');
  /* 理由の欄に出す表の行の言葉：最初の句だけ（途中で切ると「エッチない」のように崩れるため） */
  function rowWhy(t) { var s0 = String(t || '').split(/[、。]/)[0]; return s0.length > 22 ? s0.slice(0, 22) + '…' : s0; }
  /* ---------- 回数・起こりやすさ ---------- */
  var SH = HK.ShinkonR18 = {};
  var K = HK.ShinkonKit;
  function mk(ctx, t, a, b, ex) { return K ? K.fill(ctx, t, a, b, ex) : fill(ctx, t, a, b, ex); }
  function MO() { return HK.ShinkonR18More || {}; }
  function per(c) { return HK.ShinkonReact ? HK.ShinkonReact.per(c) : 'gentle'; }
  function okT(ctx, t, a, b) { return !HK.Shinkon || HK.Shinkon.okText(ctx, t, a, b); }
  function pickOk(ctx, arr, a, b) { var l = (arr || []).filter(function (x) { return okT(ctx, x, a, b); }); return pickOf(ctx, l.length ? l : arr); }
  /* その行に、二人で使える文が一つでもあるか（無い行の予備の文は家事をしないので使える） */
  function rowOk(ctx, key, i, sh, a, b) { var T = TX()[key], p = T && T[i]; if (p && !Array.isArray(p) && typeof p === 'object') p = p[sh] || p.all; if (!Array.isArray(p) || !p.length || !HK.Shinkon) return true; return p.some(function (x) { return HK.Shinkon.okText(ctx, x, a, b); }); }
  /* 回数は日数に合わせる（2026-11-05 報告「14 日・多めで場面が 5 日目までの 3 回だけ」）：多め＝日数の 3 分の 1（2 以上）＋0〜1（7 日で 2〜3、10 日で 3〜4、14 日で 4〜5）、
     ふつう＝日数の 7 分の 1（1 以上）＋0〜1、少なめ＝1 */
  SH.quota = function (ctx, v, days) {
    var r = ctx.rng(), n = +days || (ctx.env && +ctx.env.days) || 7;
    return v === 'low' ? 1 : v === 'high' ? Math.max(2, Math.floor(n / 3)) + (r < 0.5 ? 1 : 0) : Math.max(1, Math.floor(n / 7)) + (r < 0.5 ? 1 : 0);
  };
  /* 日数に配る：その日（0 から）までに出してよい回数は、回数の目安を日数で割った分まで（前半で使い切らないように。後半にも必ず残る） */
  SH.paceOk = function (ctx, S, d) { if (!S || !S.lewdMax || !S.days) return true; return S.sex < Math.ceil(S.lewdMax * (d + 1) / S.days); };
  SH.behind = function (ctx, S, d) { return !!(S && S.lewdMax && S.days && S.sex < Math.ceil(S.lewdMax * (d + 1) / S.days) - 1); };
  /* 入口の名前（記録の理由の欄・出来事の一覧と同じ言葉） */
  var ENTRY = { lewd: 'ちょっとえっちな出来事', trig: '日々の気持ちの高まり', witness: 'ひとりでしているところを見て', gomu: 'ゴムを買いそびれた夜', late: '遅く帰った夜', rain: '雨に濡れて帰った夜', dark: '停電の夜', trip: '出張から帰った夜', jeal: 'ヤキモチ', ini: '受けのほうから',
    /* 新婚らしい出来事・季節の贈り物から来る入口（2026-11-03。shinkon-r18-special.js の HK.ShinkonR18X） */
    apron: '裸エプロンの出迎え', pillow: 'イエスの枕', vday: 'バレンタインの贈り物', wday: 'ホワイトデーのお返し', bday: '誕生日の贈り物' };
  var FORM = { fade: 'ほのめかす', short: '短い場面', mid: '中くらいの場面', long: '長い場面' };
  SH.ENTRY = ENTRY; SH.FORM = FORM;
  /* ---------- 夜の性格（attr.js の夜の態度・夜の主導）。2026-11-03 利用者の指示「夜の性格を反映できているか。受けが誘ったりするように」 ---------- */
  /* c が相手 o に向ける夜の態度（夜の性格で態度を選んでいればそれ、なければ気質の態度9種） */
  var att = PR.att;
  SH.att = att;
  var KANJI = ['', '一', '二', '三', '四', '五', '六', '七', '八', '九'];
  var INI_NAME = { sasoi: '誘った', osoi: '迫った', nedari: 'ねだった' };
  /* 受け b のほうから始める夜：{ k: sasoi 誘う／osoi 迫る／nedari ねだる, p: 起こりやすさ, why }。受けが攻め指定の組（向きの決まらない組）・受けの夜の主導が「攻めが主導」なら null */
  function iniOf(ctx, a, b) {
    var P = HK.Pos, A0 = HK.Attr;
    if (!HK.ShinkonIniText || (P && P.hardTop && P.hardTop(b, a))) return null;
    var ld = P && P.leadOf ? P.leadOf(b) : '', kd = A0 && A0.nightKind ? A0.nightKind(b, a) : '', at = att(b, a), k = 'sasoi', p = 0.12, why = '';
    if (ld === 'top') return null;
    if (ld === 'sasoi' || ld === 'osoi') { k = ld; p = 0.55; why = '夜の主導：' + (ld === 'sasoi' ? '誘い受け' : '襲い受け'); }
    else if (kd) { k = { maso: 'nedari', sweet: 'sasoi', shy: 'nedari', sadist: 'osoi', mean: 'osoi' }[kd] || 'sasoi'; p = kd === 'shy' ? 0.18 : 0.3; why = '夜の性格：' + ({ maso: 'マゾ', sweet: '甘々', shy: '恥じらい', sadist: 'サド', mean: '意地悪' }[kd] || ''); }
    else {
      var T0 = { free: ['osoi', 0.28], proud: ['osoi', 0.2], devoted: ['nedari', 0.28], gentle: ['sasoi', 0.18], shy: ['nedari', 0.15], tsun: ['nedari', 0.15], cool: ['sasoi', 0.12], stern: ['sasoi', 0.1], polite: ['nedari', 0.12] }[at] || ['sasoi', 0.12];
      k = T0[0]; p = T0[1]; why = '態度：' + (HK.PERSONA && HK.PERSONA[at] ? HK.PERSONA[at].label || at : at);
    }
    var lib = P && P.libOf ? P.libOf(b) : '';
    if (lib === 'high') p *= 1.3; else if (lib === 'low') p *= 0.6;
    return { k: k, p: Math.min(0.75, p), why: why };
  }
  var nightAdd = PR.nightAdd, insert1 = PR.insert1, formOf = PR.formOf;
  function countNight(ctx, S, A, B, form, entry) {
    S.forms = S.forms || {}; S.forms[form] = (S.forms[form] || 0) + 1;
    S.entries = S.entries || {}; S.entries[entry] = (S.entries[entry] || 0) + 1;
    J.count(ctx, 'sex');
    [A, B].forEach(function (c) { var wv = J.of(ctx, c); if (wv && wv.d === 9) wv.pt = Math.max(0, wv.pt - 4); });
  }
  /* 場面の本文：{ text（名前を当てたもの）, form }（共通の部品 HK.PairR18.scene） */
  function sceneText(ctx, S, env, a, b, sh, form, o, src) { return PR.scene(ctx, S, env, a, b, sh, form, o, src || SRC); }
  SH.night = function (ctx, A, B, day, last) {
    var S = ctx.sk, env = ctx.env, LV = HK.Lewd, P = HK.Pos, SKN = HK.Shinkon;
    if (!sexOk(ctx, A, B)) return false;
    /* 体調を崩している人がいる夜・まだだるい日・離れている夜は出さない（shinkon.js の restNight）。イエスノー枕で断られた夜も */
    if (SKN && SKN.restNight && SKN.restNight(ctx, day)) return false;
    if (day.noSex) return false;
    /* 恋愛へ進む段の出ていない二人（shinkon.js の loveLater）は、まだ夜にしない */
    if (S.loveLater && !S.stepDone) return false;
    /* 願望の高まりやすさ「ゆっくり」：最初の二日の夜はまだ体の関係にしない（2026-11-04 報告「ゆっくりなのに 2 日目にエッチ」） */
    if (env.speed === 'slow' && day.d < 2 && !last) return false;
    /* 夜の起こりやすさ 0（本体の共通の設定）：夜の場面を出さない（きっかけの段だけが出ていた。2026-11-04 報告） */
    if (env.night === 0 || env.night === '0') return false;
    var o = P && P.order ? P.order(A, B) : [A, B], a = o[0], b = o[1], sh = shape(a, b);
    var hasM = P && P.hasM ? (P.hasM(a) || P.hasM(b)) : sh !== 'ff';
    var prevTrip = day.d > 0 && ((A.life.days[day.d - 1] || {}).trip || (B.life.days[day.d - 1] || {}).trip);
    /* その日の出来事から来るきっかけ（重い順） */
    var cute = null, XX = HK.ShinkonR18X, X0 = day.r18x && XX ? day.r18x : null;
    if (X0 && !((X0.x === A || X0.x === B) && (X0.y === A || X0.y === B))) X0 = null;
    /* 新婚らしい出来事・季節の贈り物から来る入口（裸エプロン・イエスの枕・バレンタイン・ホワイトデー・誕生日） */
    if (X0) cute = 'x';
    else if (day.jealBy && (day.jealBy === A || day.jealBy === B)) cute = 'jeal';
    else if (hasM && (day.forgot || ctx.rng() < 0.08)) cute = 'gomu';
    else if (day.lateHome) cute = 'late';
    else if (day.rain) cute = 'rain';
    else if (day.dark) cute = 'dark';
    else if (prevTrip) cute = 'trip';
    var pc = { x: X0 && X0.sure ? 1 : 0.9, jeal: 0.85, gomu: 0.55, late: 0.45, rain: 0.5, dark: 0.55, trip: 0.65 }[cute] || 0;
    var left = S.lewdMax - S.sex, nightsLeft = S.days - day.d - (SKN && SKN.restAhead ? Math.max(0, SKN.restAhead(ctx, day.d + 1)) : 0);
    /* 受けのほうから誘う夜（夜の主導・夜の性格・態度で。受け攻めは変えない） */
    var ini = !cute ? iniOf(ctx, a, b) : null;
    if (ini && ctx.rng() < ini.p) cute = 'ini';
    else ini = null;
    var lewdEv = !cute && ctx.rng() < 0.3 ? J.pick(ctx, 'lewd', R.LEWD, function (x, i) { return rowOk(ctx, 'LEWD', i, sh, a, b) ? 1 : 0; }) : null;
    var p = Math.max(day.urge || 0, lewdEv ? 0.75 : 0, pc, 0.12) * (P && P.libMul ? Math.min(1.6, P.libMul([A, B])) : 1);
    if (left >= nightsLeft) p = 1;
    else if (SH.behind(ctx, S, day.d)) p = Math.max(p, 0.8);
    if (day.d === 0 && p < 1) p *= 0.5;
    if (ctx.rng() > p) return false;
    var who = day.urgeBy || (J.of(ctx, A).pt >= J.of(ctx, B).pt ? A : B);
    var lonely = day.pa.late || day.pb.late, trig = J.pick(ctx, 'trig', R.TRIGGER, function (x, i) { return i === 30 ? (lonely && !lewdEv && !cute ? 3 : 0) : rowOk(ctx, 'TRIGGER', i, sh, a, b) ? 1 : 0; });
    var ti = R.TRIGGER.indexOf(trig), witness = !cute && !lewdEv && ti === 30;
    var entry = cute === 'x' ? X0.k : cute || (lewdEv ? 'lewd' : witness ? 'witness' : 'trig');
    var play = J.pick(ctx, 'play', R.PLAY, function (x, i) { return rowOk(ctx, 'PLAY', i, sh, a, b) ? 1 : 0; }) || R.PLAY[0], pi = R.PLAY.indexOf(play);
    var af = J.pick(ctx, 'after', R.AFTER), afi = R.AFTER.indexOf(af);
    var s = witness ? (who === a || who === b ? who : b) : null, w = s ? (s === a ? b : a) : null;
    /* 1. きっかけの段（なぜ今夜こうなったか。場面の直前に必ず） */
    var lt, lwho = [who, who === A ? B : A];
    if (cute === 'x') {
      lt = XX.lead(ctx, X0.k, a, b, X0.x, X0.y, X0.ex);
      lwho = [X0.x, X0.y];
    } else if (cute === 'jeal') {
      var jb = day.jealBy, jo = jb === A ? B : A, ex = { g: day.jealG ? day.jealG.name : '' };
      var jl = ((day.jealEx ? MO().JEAL_EX : MO().JEAL) || []).filter(function (x) { return jb === a || !/手首をつかんで|壁際|引き寄せ/.test(x); });
      if (!jl.length) jl = MO().JEAL || [];
      lt = mk(ctx, pickOk(ctx, jl, jb, jo), jb, jo, ex) + mk(ctx, pickOk(ctx, MO().JEAL_ANS, jb, jo), jb, jo);
      lwho = [jb, jo];
    } else if (cute === 'ini') {
      var IT = HK.ShinkonIniText || {}, lb = ((IT.LEAD || {})[ini.k] || {}), ab = IT.ANS || {};
      lt = mk(ctx, pickOk(ctx, lb[att(b, a)] || lb.gentle || FB.after, a, b), a, b) + mk(ctx, pickOk(ctx, ab[att(a, b)] || ab.gentle || [''], a, b), a, b);
      lwho = [b, a];
    } else if (cute === 'late' || cute === 'trip') {
      /* {x}＝遅く帰った人・出張から帰った人（受け攻めに関係なく）、{n}＝離れていた日数 */
      var aw = HK.Shinkon && HK.Shinkon.away ? HK.Shinkon.away(ctx) : { n: 1, who: [] };
      var lx = cute === 'late' ? day.lateHome || a : aw.who[0] || a, ly = lx === A ? B : A;
      lt = mk(ctx, pickOk(ctx, (MO().LEAD || {})[cute], a, b), a, b, { x: lx.name, y: ly.name, n: KANJI[Math.max(1, Math.min(9, aw.n))] + '日' });
      lwho = [lx, ly];
    } else if (cute) {
      lt = mk(ctx, pickOk(ctx, (MO().LEAD || {})[cute], a, b), a, b);
      if (cute === 'gomu') { var bg = MO().BEG || {}; lt += mk(ctx, pickOk(ctx, bg[per(b)] || bg.gentle, a, b), a, b) + mk(ctx, pickOk(ctx, MO().BEG_ANS, a, b), a, b); lwho = [b, a]; }
    } else {
      /* 行の文が二人に合わず無いときの予備は、表の行（作り手のメモの言葉）を差しこまない文にする（2026-11-04 報告「理性が溶ける。」がそのまま本文に出た） */
      var lt0 = witness ? text(ctx, 'WITNESS', 0, sh, pickOf(ctx, FB.witness), a, b) : text(ctx, 'TRIGGER', ti, sh, pickOf(ctx, LEAD_FB), a, b);
      if (lewdEv) { var le = text(ctx, 'LEWD', R.LEWD.indexOf(lewdEv), sh, '', a, b); if (le) lt0 = le; }
      lt = mk(ctx, lt0, a, b, { who: who.name, trig: trig.t.replace(/。$/, ''), s: s ? s.name : '', w: w ? w.name : '' });
    }
    var lwhy = 'きっかけ：' + ENTRY[entry] + (cute === 'x' ? '（' + X0.x.name + 'から）' : cute === 'ini' ? '（' + b.name + 'が' + INI_NAME[ini.k] + '・' + ini.why + '）' : cute === 'jeal' ? '（' + day.jealBy.name + 'が' + (day.jealG ? day.jealG.name : '') + 'に）' : lewdEv ? '（' + lewdEv.k + '）' : entry === 'trig' ? '（' + trig.k + '）' : '') + (day.urge && !cute ? '／' + who.name + 'の願望が高まった' : '');
    var le0 = ctx.say({ kind: 'event', cat: ctx.sk.love ? 'romance' : 'bond', actors: lwho, text: lt, why: lwhy, mag: 0 });
    if (le0) le0.tag = 'きっかけ';
    /* 2. 場面の長さ（formOf）。最中に邪魔が入る夜（knock）は、前半の段・邪魔と応対・再開の理由のあとに本番の場面 */
    var lv = LV ? LV.lv(env) : 'mid', ero = !!(LV && LV.ero(env) && HK.ThickEro);
    var nogen = !!(HK.NoGen && HK.NoGen.on && HK.NoGen.on(a, b));
    var form = formOf(ctx, S, env, lv, nogen, last);
    var kn = form !== 'fade' && cute !== 'x' && HK.ShinkonKnock ? HK.ShinkonKnock.roll(ctx, S, day, a, b) : null;
    if (kn) {
      var kr = HK.ShinkonKnock.run(ctx, S, day, a, b, sh, kn);
      if (kr === 'stop') { S.knockN = (S.knockN || 0) + 1; countNight(ctx, S, A, B, 'knockStop', entry); return true; }
      if (!kr) kn = null;
      else S.knockN = (S.knockN || 0) + 1;
    }
    /* 新婚らしい入口・贈り物の夜は、入口ごとの場面の文（PLAY・OPEN。枕は新婚部屋の文のまま） */
    var xsrc = cute === 'x' ? XX.src(X0.k, X0.x, X0.y, SRC, a) : null;
    /* 新婚の型（2026-11-04 不具合リスト NO 11。shinkon-r18-pair.js）：短い・中くらいの場面の 55%。邪魔が入った続き・新婚らしい入口・性器の指定のある組・
       受けから始まる夜（受けから誘う・ゴムのおねだり・受けが妬いた夜）・攻めが妬いた夜は今までの組み立て */
    var leadB0 = cute === 'ini' || cute === 'gomu' || (cute === 'jeal' && day.jealBy === b);
    var pairS = !kn && cute !== 'x' && cute !== 'jeal' && !leadB0 && !nogen && (form === 'short' || form === 'mid') && HK.ShinkonPair && ctx.rng() < 0.55
      ? HK.ShinkonPair.scene(ctx, S, env, a, b, sh, form, { lv: lv, ero: ero, high: lv === 'high', entry: entry, cute: cute || '' }) : null;
    var full = pairS || sceneText(ctx, S, env, a, b, sh, form, { lv: lv, ero: ero, nogen: nogen, play: play, pi: xsrc ? 0 : pi, afi: afi, jealTop: cute === 'jeal' && day.jealBy === a,
      /* 受けの側のきっかけ（受けから誘う・ゴムのおねだり・受けが妬いた夜・受けが言い出した贈り物の夜）は受けから始める */
      leadB: !kn && (cute === 'ini' || cute === 'gomu' || (cute === 'jeal' && day.jealBy === b) || (cute === 'x' && X0.x === b)), entry: entry, resume: !!kn }, xsrc);
    day.r18x = null;
    form = full.form;
    var e = ctx.act2({ actors: [a, b], cat: ctx.sk.love ? 'romance' : 'bond', text: full.text, why: '新婚部屋：' + (cute === 'x' && X0.k === 'futari' ? '昼' : '夜') + '（' + FORM[form] + '）' + (full.room ? '・新婚の段' : '') + (pairS ? '・' + pairS.why : cute === 'x' ? '・' + ENTRY[entry] : (form === 'short' || form === 'mid') && !kn ? '・' + rowWhy(play.t) : kn ? '・続き' : ''), sex: true, lewd: form !== 'fade',
      fx: function () { ctx.mod2(a, b, { aff: 4, att: 6, trust: 2 }, { aff: 4, att: 6, trust: 2 }); } });
    /* 場面が出せなかった夜は、きっかけの段も取り消す（きっかけだけが残らないように） */
    if (!e) { if (le0 && !kn) { var li = ctx.log.lastIndexOf(le0); if (li >= 0) ctx.log.splice(li, 1); } return !!kn; }
    if (form === 'long') S.longN = (S.longN || 0) + 1;
    countNight(ctx, S, A, B, form, entry);
    return true;
  };
})();
/* r18:end */
