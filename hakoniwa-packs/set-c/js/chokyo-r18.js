/* 調教の地下室の夜の場面（R18版だけ。2026-11-07。設計は docs/reports/2026-11-07/chokyo-design.md）
   ■ HK.ChokyoR18.quota(ctx, 'none'|'low'|'mid'|'high')：一回の遊びのエッチの回数の上限（0／1／2／3）。多めは一度は長い場面
   ■ HK.ChokyoR18.night(ctx, S, kind)：夜の場面を一つ出したら true。chokyo.js が、本音 want が線を越えた二人・体の関係にしてよい二人・回数が残っている夜に呼ぶ
     ・入口 kind：reward 褒美の夜／punish 罰の続き／test 仕上がりを確かめる／beg ねだられて／debut お披露目会の見せつけ
     ・場面の直前に必ず「きっかけ」の段（記録の一件。e.tag＝'きっかけ'、理由の欄は「きっかけ：…」）：なぜ今か ＋ 止められたのに止めなかった一文。二度目からは二度目の理由（LEAD2）
     ・合意のない展開（内容のスイッチ force）が入のときだけ、表面の拒む言葉（RESIST）と回数の一文（LEAD_N。本体の HK.ForceRep.n で数える）を入れる。切のときは合意の夜として書く
     ・文は部屋の表だけ（HK.ChokyoR18Text）。喘ぎは本体の HK.Ero.moan。最後に本体の流れの管理 HK.SexFlow.fix を通し、流れの管理が足した本体の段（つなぎ・追い上げ）は外す
     ・温度（HK.Heat。forceGate）：場面のあいだ H.scope、甘い・初々しいに荒い入り方の文、荒い・ドライ・歪んだに甘い事後の文を出さない（H.trim・H.strip）。変化の一文はきっかけの段に
     ・体の組：攻めに男性器 mf（フタナリの攻めも）／受けに男性器で攻めに無い fm（指と手。ペニバンは道具が「薬まで」のときだけ。跨る文は書かない）／女性どうし ff
   ・KR.KIT：kit-dark-r18.js（HK.DarkKit.R18）が届いたら、部屋の段を R18.addRoom で渡せるように表をまとめたもの（今は部屋の中で組む）
   登場人物はすべて成人として扱う */
/* @event scen=set-c-chokyo id=ck_lead cat=bond tie=- label=夜の場面のきっかけが語られる */
/* @event scen=set-c-chokyo id=ck_sex_fade cat=bond tie=- tags=night label=地下室の夜・ほのめかす（暗転と翌朝） */
/* @event scen=set-c-chokyo id=ck_sex_short cat=bond tie=- tags=night,force label=地下室の夜・短い場面 */
/* @event scen=set-c-chokyo id=ck_sex_mid cat=bond tie=- tags=night,force label=地下室の夜・中くらいの場面 */
/* @event scen=set-c-chokyo id=ck_sex_long cat=bond tie=- tags=night,force label=地下室の夜・段落を分けた長い場面 */
/* @event scen=set-c-chokyo id=ck_none_why cat=bond tie=- label=夜の場面にならなかった理由が語られる */
(function () {
  'use strict';
  var HK = window.HK;
  if (!HK || !HK.DarkKit || !HK.Chokyo) return;
  var DK = HK.DarkKit, CK = HK.Chokyo, ID = 'set-c-chokyo';
  function X() { return HK.ChokyoR18Text || {}; }
  if (HK.Heat && HK.Heat.use) HK.Heat.use(ID, { forceGate: true });
  if (HK.Play && HK.Play.strict) HK.Play.strict(ID, true);
  var KR = HK.ChokyoR18 = {};
  KR.quota = function (ctx, v) { var S = ctx.ck; if (S) S.wantLong = v === 'high'; return { none: 0, low: 1, mid: 2, high: 3 }[v] != null ? { none: 0, low: 1, mid: 2, high: 3 }[v] : 2; };
  function shOf(a, b) { var P = HK.Pos; if (P && P.hasM && P.hasM(a)) return 'mf'; if (P && P.hasM && P.hasM(b)) return 'fm'; return 'ff'; }
  KR.shOf = shOf;
  /* 場面の中で同じ文を二度使わない（一回の遊びで同じ文も避ける：DK.pick の S.used） */
  /* 張り型（ペニバン）を使う夜か（女性の攻め：道具が「薬まで」のときだけ。fm は 4 回に 1 回、ff は 3 回に 1 回）。使う夜は指で繋がる文を、使わない夜は張り型の文を出さない */
  var PEG = /ペニバン|張り型/, FINGER_IN = /(?:\{ナカ\}|\{後ろ\})の指|指を[^。]{0,10}(?:\{ナカ\}|\{後ろ\})|沈めた指|指が\{ナカ\}|指を(?:二|三)本|指で\{前立腺\}|指が奥|指を[^。]{0,6}曲げ|指を抜|指を揃え|指の動き|指と舌/;
  var FINGER_PREV = /指(?:を|が)(?:[^。]{0,12})(?:ねじ込|挿れ|挿し|差し入れ|入れ|沈め|埋め|潜り込|滑り込|突き入れ)|指で(?:[^。]{0,10})(?:掻き回|かき回|ほぐ|擦|こす|責め|突)|指(?:を|が)(?:[^。]{0,8})(?:動か|曲げ|抜き差し|出し入れ)/, FINGER_OUT = /指を(?:[^。]{0,8})(?:抜|引き抜|離)/;
  function part(ctx, S, list, sh, used, key) {
    var rows = (list || []).map(function (r) { return typeof r === 'string' ? { t: r } : r; });
    if (sh !== 'mf') rows = rows.filter(function (r) { return S.peg ? !(key !== 'fore' && key !== 'open' && FINGER_IN.test(r.t)) : !PEG.test(r.t); });
    if (HK.Heat && HK.Heat.cur && HK.Heat.trim) rows = HK.Heat.trim(rows, key);
    rows = rows.filter(function (r) { return used.indexOf(r.t) < 0; });
    var t = CK.pk(ctx, rows, { sh: sh, again: true });
    if (t) used.push(t);
    return t;
  }
  function moan(ctx, b, st, force) {
    var E = HK.Ero; if (!E || !E.moan) return '';
    var m = '';
    try { m = String(E.moan(ctx, b, st, { force: !!force }) || ''); } catch (e) { m = ''; }
    m = m.replace(/^「|」$/g, '').replace(/♡+/g, '').replace(/[ 　]+$/, '');
    return m ? '{b}「' + m + '」' : '';
  }
  function flow(text, a, b, sh, after) {
    var F = HK.SexFlow; if (!F || !F.fix) return text;
    var t = text;
    try { var r = F.fix(text, { a: a, b: b, mode: sh, after: after || '' }); if (r && typeof r.text === 'string' && r.text) t = r.text; } catch (e) { return text; }
    if (t === text) return t;
    /* 流れの管理が本体の文（つなぎ・追い上げ）を足したなら、足す前の本文を使う（部屋の文だけで書く決まり。組み直しで矛盾は先に避けてある） */
    var nm = function (s) { return String(s).split(a.name).join('{a}').split(b.name).join('{b}').replace(/[\s\u2060]/g, ''); }, orig = nm(text);
    var foreign = t.split(/[。\n]/).some(function (x) { x = nm(x); return x.length >= 8 && orig.indexOf(x) < 0; });
    var cnt = function (x) { return (String(x).match(/。/g) || []).length; };
    return foreign || cnt(t) > cnt(text) ? text : t;
  }
  /* 流れの点検（本体の HK.SexFlow.analyze）で矛盾の数を数える（組み直しの目安。部屋の計測でも使う） */
  function flowBad(text, a, b, sh, after) {
    var F = HK.SexFlow; if (!F || !F.analyze) return 0;
    try { var an = F.analyze(text, a, b, sh, after || '', null); return (an && an.check && an.check.v || []).length; } catch (e) { return 0; }
  }
  KR.flowBad = flowBad;
  /* 場面の長さ */
  function formOf(ctx, S, kind) {
    var env = ctx.env, LV = HK.Lewd, lv = LV ? LV.lv(env) : 'mid';
    if (lv === 'low') return 'fade';
    if (env.lewdLen === 'short') return 'short';
    if (env.lewdLen === 'thick') return 'long';
    var lastChance = S.lewdMax - S.sex <= 1;
    if (S.wantLong && !S.hadLong && (lastChance || ctx.rng() < 0.5)) return 'long';
    if (kind === 'debut') return 'mid';
    return ctx.rng() < 0.45 ? 'short' : 'mid';
  }
  function heatKey(h) { return h && h.key ? h.key : 'dry'; }
  function compose(ctx, S, a, b, sh, form, kind, force, n) {
    S.peg = sh !== 'mf' && S.tools === 'full' && ctx.rng() < (sh === 'fm' ? 0.25 : 0.34);
    var T = X(), used = [], hold = HK.ForceRep && HK.ForceRep.holds ? HK.ForceRep.holds(b) : false;
    var LV = HK.Lewd, ero = !!(LV && LV.ero && LV.ero(ctx.env)), high = LV && LV.lv(ctx.env) === 'high';
    var P = function (list, key) { return part(ctx, S, list, sh, used, key); };
    if (form === 'fade') return P(T.FADE);
    var paras = [];
    var res = force ? P((T.RESIST || {})[n >= 3 ? (hold ? 'hold' : 'give') : n], 'open') : '';
    var open = P(T.OPEN, 'open');
    paras.push(open + (res ? res : ''));
    paras.push(P(T.FORE, 'fore')); if (form === 'long') paras.push(P(T.FORE, 'fore'));
    /* 指でほぐした段のすぐあとに挿れるときは、指を抜く一文を挟む（指を抜かずに挿れない） */
    var ins = P(T.INSERT, 'insert'), prev = String(paras[paras.length - 1] || '').replace(/「[^」]*」/g, '');
    if (ins && FINGER_PREV.test(prev) && !FINGER_OUT.test(prev) && !FINGER_PREV.test(ins.replace(/「[^」]*」/g, ''))) ins = '{a}はゆっくりと指を抜いた。' + ins;
    paras.push(ins);
    /* 女性の攻め × 男性の受けは指と手で繋がるので、最中の段を一つ多く（流れの管理の性感が山場の前に届くように） */
    var nm = (form === 'long' ? 3 : form === 'mid' ? 2 : 1) + (sh === 'fm' ? (form === 'short' ? 2 : 1) : 0);
    for (var i = 0; i < nm; i++) paras.push(P(T.MID, 'mid'));
    /* 濃いときのもう一度は、山場と同じ段落に続けて書く（もう一度の段で二度目の山場まで行く） */
    var pk0 = ero ? P(T.PEAKE, 'peak') || P(T.PEAK, 'peak') : P(T.PEAK, 'peak');
    if (high && form === 'long') { var ag = P(T.AGAIN, 'again'); if (ag) pk0 += ag; }
    paras.push(pk0);
    if (form !== 'short') paras.push(P(T.END, 'end'));
    var body = paras.filter(Boolean).join('\n\n');
    var top = P(((T.TOPSAY || {})[DK.per(a)]) || (T.TOPSAY || {}).gentle);
    body = body.replace(/\{t\}/g, top || '……');
    body = body.replace(/\{m0\}/g, function () { return moan(ctx, b, 0, force); }).replace(/\{mm\}/g, function () { return moan(ctx, b, 1, force); }).replace(/\{m\}/g, function () { return moan(ctx, b, 2, force); });
    return body;
  }
  KR.compose = compose;
  KR.night = function (ctx, S, kind) {
    var a = S.A, b = S.B, T = X(), P = HK.Pos;
    if (HK.SAFE_ON || S.noBody || !HK.bodyOK || !HK.bodyOK(a, b)) return false;
    /* 避けている・恐れている二人（苦手・恐怖・嫌悪。本体の HK.Avoid・恐怖の和らぐ前）は夜にしない（心理劇の夜のまま） */
    if (HK.Avoid && HK.Avoid.of && (HK.Avoid.of(ctx, a, b) || HK.Avoid.of(ctx, b, a))) return false;
    if (HK.fearHeld && HK.fearHeld(a, b)) return false;
    var sh = shOf(a, b), force = DK.content(ctx, 'force'), FR = HK.ForceRep, n = force && FR && FR.n ? FR.n(ctx, a, b) : 1;
    var form = formOf(ctx, S, kind);
    var H = HK.Heat && HK.Heat.enabled && HK.Heat.enabled(ID) ? HK.Heat : null;
    var h = H ? H.of(ctx, a, b, { force: force, scen: ID, first: S.sex === 0 }) : null;
    /* きっかけの段 */
    var lead = S.sex === 0 ? CK.pk(ctx, (T.LEAD || {})[kind] || (T.LEAD || {}).test) : CK.pk(ctx, T.LEAD2, { again: true });
    if (!lead) lead = CK.pk(ctx, (T.LEAD || {})[kind], { again: true });
    var ln = force ? CK.pk(ctx, (T.LEAD_N || {})[n >= 3 ? (FR && FR.holds && FR.holds(b) ? 'hold' : 'give') : n]) : '';
    var chg = h && H.change ? H.change(ctx, h, a, b) : '';
    var KN = { reward: '褒美の夜', punish: '罰の続きの夜', test: '仕上がりを確かめる夜', beg: 'ねだられた夜', debut: 'お披露目会の見せつけ' };
    var leadT = DK.fill(ctx, lead + ln, a, b) + (chg ? DK.fill(ctx, chg, a, b) : '');
    /* 本文 */
    var hk = heatKey(h), soft = /^(sweet|fresh|play)$/.test(hk) || (S.care === 'many' && !/^(rough|warped)$/.test(hk));
    var aftL = ((T.AFTER || {})[soft ? 'soft' : 'hard']) || [];
    if (H && H.trim) aftL = H.trim(aftL, 'after', hk);
    var aft = form === 'fade' ? '' : CK.pk(ctx, aftL, { again: true });
    /* 組んで、流れの矛盾があれば組み直す（6 回まで。使った文の印は組み直しの前に戻す） */
    var snap = function () { return { u: Object.assign({}, S.used || {}), l: Object.assign({}, S.lru || {}), k: S._tick }; }, back = function (x) { S.used = Object.assign({}, x.u); S.lru = Object.assign({}, x.l); S._tick = x.k; };
    var s0 = snap(), body = '', best = null;
    for (var tr = 0; tr < 6; tr++) {
      if (tr) back(s0);
      body = h ? H.scope(ctx, a, b, h, function () { return compose(ctx, S, a, b, sh, form, kind, force, n); }) : compose(ctx, S, a, b, sh, form, kind, force, n);
      var bad = form === 'fade' ? 0 : flowBad(body, a, b, sh, aft);
      if (!best || bad < best.bad) best = { body: body, bad: bad, st: snap() };
      if (!bad) break;
    }
    if (best.body !== body) { body = best.body; back(best.st); }
    if (form !== 'fade') body = flow(body, a, b, sh, aft);
    if (aft) body += '\n\n' + aft;
    if (h && H.strip) body = H.strip(body, hk);
    if (Array.isArray(KR.trace)) KR.trace.push({ t: body, sh: sh, form: form, a: a.name, b: b.name, bad: best ? best.bad : 0 });
    var text = DK.fill(ctx, body, a, b);
    /* 記録：きっかけ → 場面 */
    var el = DK.say(ctx, { id: 'ck_lead', tag: 'きっかけ', cat: 'bond', actors: [a, b], text: leadT, why: 'きっかけ：' + KN[kind] + (S.sex ? '（' + (S.sex + 1) + '度目）' : '（初めて）') + (force ? '・合意のない展開の' + n + '回目' : ''), mag: 3, face: faceB(b, 'shy') });
    /* 本体の合意のない回数の段（HK.ForceRep の包み）を差させない：回数は下で本体の数え方にそろえて足す */
    var fb0 = ctx._frBusy; ctx._frBusy = true;
    var e;
    try { e = DK.say(ctx, { id: 'ck_sex_' + form, cat: 'bond', actors: [a, b], text: text, sex: true, lewd: form !== 'fade', force: force, mag: 8,
      why: '調教の地下室：夜（' + { fade: 'ほのめかす', short: '短い場面', mid: '中くらいの場面', long: '長い場面' }[form] + '・' + KN[kind] + (h ? '・温度：' + H.label(hk) : '') + '）', face: faceB(b, 'shy') }); } finally { ctx._frBusy = fb0; }
    if (!e) { if (el && ctx.log) { var k = ctx.log.indexOf(el); if (k >= 0) ctx.log.splice(k, 1); } return false; }
    S.sex++; if (form === 'long') S.hadLong = true;
    if (force && FR && FR.on && FR.on(ctx)) { var m = ctx._frN = ctx._frN || {}, kk = a.i < b.i ? a.i + '-' + b.i : b.i + '-' + a.i; m[kk] = (m[kk] || 0) + 1; }
    DK.push(S, 'want', 5); DK.push(S, 'dep', 4); DK.push(S, 'jo', 5); DK.push(S, 'obey', 3);
    (S.focus || []).forEach(function (k2) { if (S.gauges['sens_' + k2]) DK.push(S, 'sens_' + k2, 5); });
    if (h) { if (H.move) H.move(ctx, h, a, b); if (H.note) H.note(ctx, h, a, b, { text: text }); if (H.remember) H.remember(ctx, a, b, hk); }
    return true;
  };
  function faceB(b, k) { var o = {}; o[b.i] = k; return o; }
  /* 夜の場面にならなかった理由（回数の上限があるのに一度も出なかった回。最後の夜の前に一件） */
  KR.noneWhy = function (ctx, S) {
    var T = X(), k = S.noBody ? 'nobody' : DK.val(S, 'want') < S.LINE ? 'want' : 'chance';
    var t = CK.pk(ctx, (T.NONE || {})[k]);
    if (t) DK.say(ctx, { id: 'ck_none_why', cat: 'bond', actors: [S.A, S.B], t: t, a: S.A, b: S.B, S: S, why: '調教の地下室：夜の場面にならなかった理由（' + { nobody: '体に触れない二人', want: '本音がまだ線の手前', chance: '機会が合わなかった' }[k] + '）' });
  };
  /* kit-dark-r18.js が来たら渡す形（今は部屋の中で組む） */
  KR.KIT = function () { var T = X(); return { lead: T.LEAD, open: T.OPEN, fore: T.FORE, insert: T.INSERT, mid: T.MID, peak: T.PEAK, peakE: T.PEAKE, end: T.END, after: T.AFTER, again: T.AGAIN, resist: T.RESIST, top: T.TOPSAY, fade: T.FADE }; };
})();
