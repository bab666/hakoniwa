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
  /* 体の関係にしてよい二人か。恋愛感情の有無では止めない（利用者の決まり「性的な出来事は性欲と衝動で判定し、恋愛感情が発生を防がないように」。
     「恋愛：なし」の夫婦＝契約結婚のような二人も、体の関係は共通の判定に任せる）。血縁・無関心は止める。恐怖などは HK.sexBlocked（noSex）が止める */
  function sexOk(ctx, a, b) {
    if (!a || !b || a === b) return false;
    if (ctx.pair && ctx.pair(a, b).kin) return false;
    if (HK.Ties && HK.Ties.apathy && (HK.Ties.apathy(ctx, a, b) || HK.Ties.apathy(ctx, b, a))) return false;
    if (HK.State && HK.State.pairSex && !HK.State.pairSex(a, b)) return false;
    /* 性欲「なし」の人は合意ありの場面に出さない（pos.js の HK.Pos.libNone） */
    if (HK.Pos && HK.Pos.libNone && HK.Pos.libNone([a, b])) return false;
    if (HK.sexBlocked && HK.sexBlocked(a, b)) return false;
    if (HK.ngSexPair && HK.ngSexPair(a, b)) return false;
    return true;
  }
  /* 形：攻め a・受け b から（thick-sex.js と同じ決め方） */
  function shape(a, b) { var P = HK.Pos, fem = P && P.isF; return fem && fem(a) && fem(b) ? 'ff' : fem && fem(a) && !fem(b) ? 'fm' : 'mf'; }
  /* 表の行ごとの文：T[key][i] が { mf: [...], ff: [...], fm: [...] } か配列 */
  function text(ctx, key, i, sh, fb, a, b) {
    var T = TX()[key], p = T && T[i];
    if (p && !Array.isArray(p) && typeof p === 'object') p = p[sh] || p.all;
    /* 家事をしない設定の人が家事・料理をする文は使わない（HK.Shinkon.okText） */
    if (Array.isArray(p) && a && HK.Shinkon) p = p.filter(function (x) { return HK.Shinkon.okText(ctx, x, a, b); });
    if (Array.isArray(p) && p.length) return pickOf(ctx, p);
    if (typeof p === 'string' && p) return p;
    return fb || '';
  }
  /* ---------- 文の予備（shinkon-r18-text.js が無い行のため。形ごとに 3 文以上） ---------- */
  var FB = {
    lead: L('{who}の気持ちは、もう溢れそうだった。{trig}――それが、今夜の始まりになった。|一日の終わり、二人きりの部屋で、{trig}。{who}はもう、気持ちを隠すのをやめた。|{trig}。新婚の夜に、それを止める理由はどこにもなかった。'),
    short: {
      mf: L('{a}は{b}をベッドに横たえ、ゆっくりと服を脱がせていった。肌が重なるたびに、{b}の息が浅くなる。{a}が奥まで身を沈めると、{b}は{a}の背中にしがみついた。|{a}は{b}の脚の間に身を割り入れ、確かめるように何度もキスを落とした。{b}が小さくうなずくのを待って、{a}は{b}の{ナカ}へゆっくりと入っていった。二人の呼吸が、少しずつ同じ速さになった。|灯りを落とした寝室で、{a}は{b}を抱き寄せた。触れるたびに{b}の体が熱を帯びていく。重なり合ったまま、二人は短く、深く、互いを求めた。'),
      ff: L('{a}は{b}の胸元に唇を寄せ、指先で肌をなぞった。{b}の脚が震え、{a}の指が{女性器}を探り当てる。小さな声が、二人だけの部屋に何度もこぼれた。|{a}と{b}は向かい合って肌を重ね、指を絡めたまま口づけを繰り返した。{a}の指が{b}の{ナカ}を優しく撫でるたび、{b}の腰が浮く。最後は二人そろって、互いの名前を呼んだ。|{a}は{b}の{乳首}をそっと唇で挟み、もう片方の手で太ももの内側をなぞった。{b}が堪えきれずに{a}の髪を掴む。{a}は笑って、もっと深く{b}に触れた。'),
      fm: L('{a}は{b}の胸板に手をついて跨り、上からじっと見下ろした。{a}がゆっくり腰を沈めると、{b}の喉が鳴った。{a}は自分のいいところを探すように、少しずつ動きを速めた。|{a}は{b}をソファに押しつけ、その上に乗った。「動かないで｜動くな｜動かないでください」――{a}がそう囁くと、{b}は素直に目を閉じた。{a}の腰が揺れるたびに、二人の熱が重なっていく。|{a}は{b}の手首を軽く押さえ、唇で首筋をたどった。{b}の{男性器}が熱を帯びるのを確かめてから、{a}は自分からそれを受け入れた。')
    },
    /* 指を抜く一文（受けの反応の段で指が中にあるまま、次の段で繋がるとき） */
    fingerOut: L('{a}はゆっくりと指を引き抜き、濡れた指先で{b}の太ももをなぞった。|{a}が指をそっと抜くと、{b}の腰が名残惜しそうに揺れた。|{a}は指を引き抜いて、{b}の額に軽くキスを落とした。'),
    /* 山場（中くらいの場面）：{m} に受けの絶頂の喘ぎ（態度ごと）が入る */
    peak: {
      mf: L('{a}の動きが少しずつ速くなり、{b}は{a}の背中に爪を立てた。{m}――深く繋がったまま、二人はほとんど同時に果てた。|{b}の呼吸が細く途切れはじめた。{a}が最後に奥まで沈むと、{m}――{b}の体が大きく震え、{a}もそのまま熱を注いだ。|{a}は{b}の名前を何度も呼んだ。{m}――{b}がしがみつく腕に力がこもり、二人の熱が一つになって弾けた。'),
      ff: L('{a}の指が一番弱いところを捉えて離さなかった。{m}――{b}の背中が弓なりに反り、{a}はその体をしっかりと抱きとめた。|{b}の声がどんどん高くなっていく。{a}が唇と指で追い詰めると、{m}――{b}は{a}の肩に顔を埋めて、長く震えた。|{a}は{b}の脚を抱え込み、休む間を与えなかった。{m}――{b}の太ももが{a}の頬を挟んで、小刻みに震えた。'),
      fm: L('{a}は{b}の胸に手をついたまま、腰の動きを速めた。{m}――{a}が深く腰を沈めた瞬間、{b}もこらえきれずに果てた。|{b}の手が{a}の腰を掴む。{a}はその手に自分の手を重ね、最後まで自分の速さで揺れた。{m}――{b}の熱を奥で受け止めて、{a}は満ち足りた息をついた。|{a}が見下ろしたまま微笑むと、{b}の喉がひくりと鳴った。{m}――{a}がきつく締めつけると、{b}は{a}の名前を呼びながら果てた。')
    },
    after: L('事のあと、{b}は{a}の胸に頬を寄せたまま、しばらく動かなかった。|{a}は汗ばんだ{b}の前髪をそっとかき上げ、額にキスをした。|二人はシーツにくるまったまま、くすくすと笑い合った。'),
    witness: L('{w}がふと寝室の戸を開けると、{s}がひとりで体を慰めていた。{s}は息を呑んで固まり、{w}もまた、目を逸らせなかった。|帰りが早くなった{w}は、寝室から漏れる小さな声に足を止めた。そっと覗くと、{s}が{w}の名前を呼びながら、ひとりで熱を逃がしていた。|浴室の扉の向こうで、{s}が自分の体に触れていた。気づかれたと知って真っ赤になる{s}に、{w}は黙って近づいた。')
  };
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
  SH.quota = function (ctx, v) { var r = ctx.rng(); return v === 'low' ? 1 : v === 'high' ? 2 + (r < 0.5 ? 1 : 0) : 1 + (r < 0.5 ? 1 : 0); };
  /* 入口の名前（記録の理由の欄・出来事の一覧と同じ言葉） */
  var ENTRY = { lewd: 'ちょっとえっちな出来事', trig: '日々の気持ちの高まり', witness: 'ひとりでしているところを見て', gomu: 'ゴムを買いそびれた夜', late: '遅く帰った夜', rain: '雨に濡れて帰った夜', dark: '停電の夜', trip: '出張から帰った夜', jeal: 'ヤキモチ' };
  var FORM = { fade: 'ほのめかす', short: '短い場面', mid: '中くらいの場面', long: '長い場面' };
  SH.ENTRY = ENTRY; SH.FORM = FORM;
  SH.night = function (ctx, A, B, day, last) {
    var S = ctx.sk, env = ctx.env, LV = HK.Lewd, P = HK.Pos;
    if (!sexOk(ctx, A, B)) return false;
    var o = P && P.order ? P.order(A, B) : [A, B], a = o[0], b = o[1], sh = shape(a, b);
    var hasM = P && P.hasM ? (P.hasM(a) || P.hasM(b)) : sh !== 'ff';
    var prevTrip = day.d > 0 && ((A.life.days[day.d - 1] || {}).trip || (B.life.days[day.d - 1] || {}).trip);
    /* その日の出来事から来るきっかけ（重い順） */
    var cute = null;
    if (day.jealBy && (day.jealBy === A || day.jealBy === B)) cute = 'jeal';
    else if (hasM && (day.forgot || ctx.rng() < 0.08)) cute = 'gomu';
    else if (day.lateHome) cute = 'late';
    else if (day.rain) cute = 'rain';
    else if (day.dark) cute = 'dark';
    else if (prevTrip) cute = 'trip';
    var pc = { jeal: 0.85, gomu: 0.55, late: 0.45, rain: 0.5, dark: 0.55, trip: 0.65 }[cute] || 0;
    var left = S.lewdMax - S.sex, nightsLeft = S.days - day.d;
    var lewdEv = !cute && ctx.rng() < 0.3 ? J.pick(ctx, 'lewd', R.LEWD, function (x, i) { return rowOk(ctx, 'LEWD', i, sh, a, b) ? 1 : 0; }) : null;
    var p = Math.max(day.urge || 0, lewdEv ? 0.75 : 0, pc, 0.12) * (P && P.libMul ? Math.min(1.6, P.libMul([A, B])) : 1);
    if (left >= nightsLeft) p = 1;
    if (day.d === 0 && p < 1) p *= 0.5;
    if (ctx.rng() > p) return false;
    var who = day.urgeBy || (J.of(ctx, A).pt >= J.of(ctx, B).pt ? A : B);
    var lonely = day.pa.late || day.pb.late, trig = J.pick(ctx, 'trig', R.TRIGGER, function (x, i) { return i === 30 ? (lonely && !lewdEv && !cute ? 3 : 0) : rowOk(ctx, 'TRIGGER', i, sh, a, b) ? 1 : 0; });
    var ti = R.TRIGGER.indexOf(trig), witness = !cute && !lewdEv && ti === 30;
    var entry = cute || (lewdEv ? 'lewd' : witness ? 'witness' : 'trig');
    var play = J.pick(ctx, 'play', R.PLAY, function (x, i) { return rowOk(ctx, 'PLAY', i, sh, a, b) ? 1 : 0; }) || R.PLAY[0], pi = R.PLAY.indexOf(play);
    var af = J.pick(ctx, 'after', R.AFTER), afi = R.AFTER.indexOf(af);
    var s = witness ? (who === a || who === b ? who : b) : null, w = s ? (s === a ? b : a) : null;
    /* 1. きっかけの段（なぜ今夜こうなったか。場面の直前に必ず） */
    var lt, lwho = [who, who === A ? B : A];
    if (cute === 'jeal') {
      var jb = day.jealBy, jo = jb === A ? B : A, ex = { g: day.jealG ? day.jealG.name : '' };
      var jl = ((day.jealEx ? MO().JEAL_EX : MO().JEAL) || []).filter(function (x) { return jb === a || !/手首をつかんで|壁際|引き寄せ/.test(x); });
      if (!jl.length) jl = MO().JEAL || [];
      lt = mk(ctx, pickOk(ctx, jl, jb, jo), jb, jo, ex) + mk(ctx, pickOk(ctx, MO().JEAL_ANS, jb, jo), jb, jo);
      lwho = [jb, jo];
    } else if (cute) {
      lt = mk(ctx, pickOk(ctx, (MO().LEAD || {})[cute], a, b), a, b);
      if (cute === 'gomu') { var bg = MO().BEG || {}; lt += mk(ctx, pickOk(ctx, bg[per(b)] || bg.gentle, a, b), a, b) + mk(ctx, pickOk(ctx, MO().BEG_ANS, a, b), a, b); lwho = [b, a]; }
    } else {
      var lt0 = witness ? text(ctx, 'WITNESS', 0, sh, pickOf(ctx, FB.witness)) : text(ctx, 'TRIGGER', ti, sh, pickOf(ctx, FB.lead), a, b);
      if (lewdEv) { var le = text(ctx, 'LEWD', R.LEWD.indexOf(lewdEv), sh, '', a, b); if (le) lt0 = le; }
      lt = mk(ctx, lt0, a, b, { who: who.name, trig: trig.t.replace(/。$/, ''), s: s ? s.name : '', w: w ? w.name : '' });
    }
    var lwhy = 'きっかけ：' + ENTRY[entry] + (cute === 'jeal' ? '（' + day.jealBy.name + 'が' + (day.jealG ? day.jealG.name : '') + 'に）' : lewdEv ? '（' + lewdEv.k + '）' : entry === 'trig' ? '（' + trig.k + '）' : '') + (day.urge && !cute ? '／' + who.name + 'の願望が高まった' : '');
    var le0 = ctx.say({ kind: 'event', cat: ctx.sk.love ? 'romance' : 'bond', actors: lwho, text: lt, why: lwhy, mag: 0 });
    if (le0) le0.tag = 'きっかけ';
    /* 2. 場面の長さ：ほのめかす（描写の有無）／短い・中くらい・長い（描写の長さ。混ぜるならくじ）。エッチ多めなら一度は長い場面（「数行で短く」以外） */
    var lv = LV ? LV.lv(env) : 'mid', len = env.lewdLen || 'mix', ero = !!(LV && LV.ero(env) && HK.ThickEro), high = lv === 'high';
    var nogen = !!(HK.NoGen && HK.NoGen.on && HK.NoGen.on(a, b));
    var form;
    if (lv === 'low') form = 'fade';
    else if (env.lewdN === 'high' && !S.longN && len !== 'short') form = 'long';
    else if (len === 'thick') form = 'long';
    else if (len === 'short') form = 'short';
    else { var r0 = ctx.rng(); form = r0 < 0.35 ? 'short' : r0 < 0.65 ? 'mid' : 'long'; }
    if (form === 'mid' && (nogen || ero)) form = ero ? 'long' : 'short';
    var pk = function (arr) { return pickOf(ctx, arr); };
    var aft = text(ctx, 'AFTER', afi, sh, pickOf(ctx, FB.after), a, b);
    var jealTop = cute === 'jeal' && day.jealBy === a;
    var body;
    if (form === 'fade') body = pickOf(ctx, MO().FADE || FB.after);
    else if (form === 'long' && HK.ThickSex) {
      var st = HK.ThickSex.style(a), open = K ? K.mark(pickOf(ctx, MO().OPEN || ['{a}は{b}を抱き寄せた。'])) : pickOf(ctx, MO().OPEN || ['{a}は{b}を抱き寄せた。']);
      if (K) aft = K.mark(aft);
      var again = high && HK.ThickEro ? HK.ThickEro.again(ctx, pk, a, b, ero, false) + '\n\n' : '';
      var rr = ero ? HK.ThickEro.scene({ S: ctx, pick: pk, rng: ctx.rng, a: a, b: b, style: st, open: open, after: again + aft })
        : HK.ThickSex.scene({ pick: pk, rng: ctx.rng, a: a, b: b, style: st, open: open, after: again + aft, ctx: ctx, jealous: jealTop });
      body = rr.text; aft = '';
    } else if (form === 'short' && ero && HK.ThickEro && HK.ThickEro.short) {
      body = HK.ThickEro.short({ S: ctx, pick: pk, a: a, b: b, open: '', again: high, after: '' }).text;
    } else {
      body = text(ctx, 'PLAY', pi, sh, pickOf(ctx, FB.short[sh]), a, b);
      if (nogen) { var ng = HK.NoGen.scene({ pick: pk, rng: ctx.rng, a: a, b: b, open: '', after: false }); body = ng && ng.text ? ng.text : body; form = 'short'; }
      if (form === 'mid') {
        var bt = J.pick(ctx, 'bottom', R.BOTTOM), tp = J.pick(ctx, 'top', R.TOP);
        var bx = text(ctx, 'BOTTOM', R.BOTTOM.indexOf(bt), sh, '{b}の' + bt.k + 'に触れると、' + bt.t.replace(/。$/, '') + '。', a, b);
        var tx = text(ctx, 'TOP', R.TOP.indexOf(tp), sh, '{a}は、' + tp.t.replace(/。$/, '') + '。', a, b);
        var T = HK.ThickSex;
        if (HK.NovelMoan) HK.NovelMoan.top = a;
        var mo = T && T.moan ? T.moan(pk, b, true, ctx.rng) : '';
        var peak = text(ctx, 'PEAK', 0, sh, pickOf(ctx, FB.peak[sh])).replace('{m}', mo ? '{b}「' + String(mo).replace(/^「|」$/g, '') + '」' : '');
        var fo = T && T.fingerOut ? T.fingerOut(bx, body, sh, false) : '';
        if (!fo && sh !== 'ff' && /指/.test(bx) && /沈め|入れ|入って|入ってる|中を|ナカ|何本/.test(bx) && !/指を(?:抜|引き抜)/.test(bx + body)) fo = pickOf(ctx, FB.fingerOut);
        body = bx + (fo ? fo : '') + '\n\n' + body + '\n\n' + peak + '\n\n' + tx;
      }
      /* 濃い：もう一度（短い版の一文は形を問わない書き方なので、女性どうしは段落の版にする） */
      if (high && HK.ThickEro) body += '\n\n' + HK.ThickEro.again(ctx, pk, a, b, false, form === 'short' && sh !== 'ff');
    }
    var full = form === 'long' ? ctx.t(body, a, b) : mk(ctx, body + (aft ? '\n\n' + aft : ''), a, b);
    var e = ctx.act2({ actors: [a, b], cat: ctx.sk.love ? 'romance' : 'bond', text: full, why: '新婚部屋：夜（' + FORM[form] + '）' + (form === 'short' || form === 'mid' ? '・' + play.t.slice(0, 18) : ''), sex: true, lewd: form !== 'fade',
      fx: function () { ctx.mod2(a, b, { aff: 4, att: 6, trust: 2 }, { aff: 4, att: 6, trust: 2 }); } });
    if (!e) return false;
    if (form === 'long') S.longN = (S.longN || 0) + 1;
    S.forms = S.forms || {}; S.forms[form] = (S.forms[form] || 0) + 1;
    S.entries = S.entries || {}; S.entries[entry] = (S.entries[entry] || 0) + 1;
    J.count(ctx, 'sex');
    [A, B].forEach(function (c) { var wv = J.of(ctx, c); if (wv && wv.d === 9) wv.pt = Math.max(0, wv.pt - 4); });
    return true;
  };
})();
/* r18:end */
