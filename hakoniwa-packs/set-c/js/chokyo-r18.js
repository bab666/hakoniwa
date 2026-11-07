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
/* @event scen=set-c-chokyo id=ck_show_fade cat=bond tie=- tags=night label=競りの前のお披露目・ほのめかす */
/* @event scen=set-c-chokyo id=ck_show_long cat=bond tie=- tags=night,mob label=競りの前のお披露目で長めに見せつける */
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
  var PEG = /ペニバン|張り型/, FINGER_IN = /(?:\{ナカ\}|\{後ろ\})の指|指を[^。]{0,10}(?:\{ナカ\}|\{後ろ\})|沈めた指|指が\{ナカ\}|指を(?:二|三)本|指で\{前立腺\}|指が奥|指を[^。]{0,6}曲げ|指を抜|指を揃え|指の動き|指と舌|指で奥|指が奥|指を(?:二|三)本/;
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
  /* ov：お披露目の場面の表の差し替え（open・mid（客の好みの一幕）・end・after・top（台詞）・bsay（受けの一言）・ng（表から外す語：調教師でない相手に「帳面」「昼の調教」を出さない）） */
  function compose(ctx, S, a, b, sh, form, kind, force, n, ov) {
    ov = ov || {};
    S.peg = sh !== 'mf' && S.tools === 'full' && ctx.rng() < (sh === 'fm' ? 0.25 : 0.34);
    var T = X(), used = [], hold = HK.ForceRep && HK.ForceRep.holds ? HK.ForceRep.holds(b) : false;
    var LV = HK.Lewd, ero = !!(LV && LV.ero && LV.ero(ctx.env)), high = LV && LV.lv(ctx.env) === 'high';
    var ng = function (list) { return ov.ng ? (list || []).filter(function (r) { return !ov.ng.test(typeof r === 'string' ? r : r && r.t); }) : list; };
    var P = function (list, key) { return part(ctx, S, ng(list), sh, used, key); };
    if (form === 'fade') return P(ov.fade || T.FADE);
    var paras = [];
    var res = force ? P((T.RESIST || {})[n >= 3 ? (hold ? 'hold' : 'give') : n], 'open') : '';
    var open = (ov.open ? P(ov.open, 'open') : '') || P(T.OPEN, 'open');
    paras.push(open + (res ? res : ''));
    paras.push(P(T.FORE, 'fore')); if (form === 'long') paras.push(P(T.FORE, 'fore'));
    /* 指でほぐした段のすぐあとに挿れるときは、指を抜く一文を挟む（指を抜かずに挿れない） */
    var ins = P(T.INSERT, 'insert'), prev = String(paras[paras.length - 1] || '').replace(/「[^」]*」/g, '');
    if (ins && FINGER_PREV.test(prev) && !FINGER_OUT.test(prev) && !FINGER_PREV.test(ins.replace(/「[^」]*」/g, ''))) ins = '{a}はゆっくりと指を抜いた。' + ins;
    paras.push(ins);
    /* 女性の攻め × 男性の受けは指と手で繋がるので、最中の段を一つ多く（流れの管理の性感が山場の前に届くように） */
    var nm = (form === 'long' ? 3 : form === 'mid' ? 2 : 1) + (sh === 'fm' ? (form === 'short' ? 2 : 1) : 0);
    for (var i = 0; i < nm; i++) {
      var mp = i === 0 && ov.mid ? P(ov.mid, 'mid') : '';
      mp = mp || P(T.MID, 'mid');
      if (i === 0 && ov.bsay) { var bs = P(ov.bsay); if (bs && mp) mp += bs; }
      paras.push(mp);
    }
    /* 濃いときのもう一度は、山場と同じ段落に続けて書く（もう一度の段で二度目の山場まで行く） */
    var pk0 = ero ? P(T.PEAKE, 'peak') || P(T.PEAK, 'peak') : P(T.PEAK, 'peak');
    if (high && form === 'long') { var ag = P(T.AGAIN, 'again'); if (ag) pk0 += ag; }
    paras.push(pk0);
    if (form !== 'short') paras.push((ov.end ? P(ov.end, 'end') : '') || P(T.END, 'end'));
    var body = paras.filter(Boolean).join('\n\n');
    var top = P(ov.top || ((T.TOPSAY || {})[DK.per(a)]) || (T.TOPSAY || {}).gentle);
    body = body.replace(/\{t\}/g, top || '……');
    body = body.replace(/\{m0\}/g, function () { return moan(ctx, b, 0, force); }).replace(/\{mm\}/g, function () { return moan(ctx, b, 1, force); }).replace(/\{m\}/g, function () { return moan(ctx, b, 2, force); });
    return body;
  }
  KR.compose = compose;
  /* 体の場面にしてよい二人か（避けている・恐れている二人は不可） */
  KR.ok = function (ctx, a, b) {
    if (HK.SAFE_ON || !HK.bodyOK || !HK.bodyOK(a, b)) return false;
    if (HK.Avoid && HK.Avoid.of && (HK.Avoid.of(ctx, a, b) || HK.Avoid.of(ctx, b, a))) return false;
    if (HK.fearHeld && HK.fearHeld(a, b)) return false;
    return true;
  };
  /* 客の一人（モブ）を相手にしてよい奴隷か：モブとの体の場面に出してよい（本体の HK.Mob.sexOk）・モブには受けに回る（HK.Mob.side）・モブを相手に選べる性別がある */
  KR.mobOk = function (ctx, b) { return !HK.SAFE_ON && !!(HK.Mob && HK.Mob.sexOk(b) && HK.Mob.side(b, 'bottom') !== 'top' && mobGender(b)); };
  function mobGender(b) { var P = HK.Pos; return ['m', 'f'].filter(function (g) { return !P || !P.genderOK || P.genderOK(b, { gender: g, likes: '' }, true); })[0] || ''; }
  /* 場面を一つ組んで記録する（夜の場面・お披露目の場面の共通）。Ss＝計器を動かす組（お披露目の奴隷どうしは二つ）、a＝攻め・b＝受け（a はモブのこともある） */
  function run(ctx, Ss, a, b, o) {
    var S = Ss[0], T = X(), kind = o.kind, mob = !!a.mob;
    /* 文の絞り込み（体の語）は、この場面の二人で見る（奴隷どうし・客の一人のとき） */
    var Sx = Object.create(S); Sx.A = a; Sx.B = b; Sx.noBody = false;
    var c0 = ctx.ck; ctx.ck = Sx;
    try {
      var sh = shOf(a, b), force = !mob && DK.content(ctx, 'force'), FR = HK.ForceRep, n = force && FR && FR.n ? FR.n(ctx, a, b) : 1;
      var form = o.form || formOf(ctx, S, kind);
      var H = HK.Heat && HK.Heat.enabled && HK.Heat.enabled(ID) ? HK.Heat : null;
      var h = H ? H.of(ctx, a, b, { force: force, scen: ID, first: S.sex === 0 }) : null;
      /* きっかけの段 */
      var lead = o.lead ? CK.pk(ctx, o.lead, { again: true }) : S.sex === 0 ? CK.pk(ctx, (T.LEAD || {})[kind] || (T.LEAD || {}).test) : CK.pk(ctx, T.LEAD2, { again: true });
      if (!lead) lead = CK.pk(ctx, (T.LEAD || {})[kind] || (T.LEAD || {}).test, { again: true });
      var ln = force ? CK.pk(ctx, (T.LEAD_N || {})[n >= 3 ? (FR && FR.holds && FR.holds(b) ? 'hold' : 'give') : n]) : '';
      var chg = h && H.change ? H.change(ctx, h, a, b) : '';
      /* 変化の一文（本体の表）は、組が二つでも一回の遊びで同じ文を二度出さない */
      var CU = ctx._ckChg = ctx._ckChg || {}; if (chg && CU[chg]) chg = ''; else if (chg) CU[chg] = 1;
      var leadT = DK.fill(ctx, (lead + ln).split('{c}').join(o.cName || ''), a, b) + (chg ? DK.fill(ctx, chg, a, b) : '');
      /* 本文 */
      var hk = heatKey(h), soft = /^(sweet|fresh|play)$/.test(hk) || (S.care === 'many' && !/^(rough|warped)$/.test(hk));
      var aftL = (o.ov && o.ov.after) || ((T.AFTER || {})[soft ? 'soft' : 'hard']) || [];
      if (H && H.trim) aftL = H.trim(aftL, 'after', hk);
      var aft = form === 'fade' ? '' : CK.pk(ctx, aftL, { again: true });
      /* 組んで、流れの矛盾があれば組み直す（6 回まで。使った文の印は組み直しの前に戻す。印の入れ物は組どうしで共有なので中身だけ戻す） */
      var snap = function () { return { u: Object.assign({}, Sx.used || {}), l: Object.assign({}, Sx.lru || {}), k: Sx._tick }; };
      var back = function (x) { var U = Sx.used, R = Sx.lru; Object.keys(U).forEach(function (q) { delete U[q]; }); Object.keys(R).forEach(function (q) { delete R[q]; }); Object.assign(U, x.u); Object.assign(R, x.l); Sx._tick = x.k; };
      var s0 = snap(), body = '', best = null;
      for (var tr = 0; tr < 6; tr++) {
        if (tr) back(s0);
        body = h ? H.scope(ctx, a, b, h, function () { return compose(ctx, Sx, a, b, sh, form, kind, force, n, o.ov); }) : compose(ctx, Sx, a, b, sh, form, kind, force, n, o.ov);
        var bad = form === 'fade' ? 0 : flowBad(body, a, b, sh, aft);
        if (!best || bad < best.bad) best = { body: body, bad: bad, st: snap() };
        if (!bad) break;
      }
      if (best.body !== body) { body = best.body; back(best.st); }
      if (form !== 'fade') body = flow(body, a, b, sh, aft);
      if (aft) body += '\n\n' + aft;
      if (h && H.strip) body = H.strip(body, hk);
      if (Array.isArray(KR.trace)) KR.trace.push({ t: body, sh: sh, form: form, a: a.name, b: b.name, bad: best ? best.bad : 0, kind: kind });
      var text = DK.fill(ctx, body, a, b);
      var actors = o.actors || [a, b];
      /* 記録：きっかけ → 場面 */
      var el = DK.say(ctx, { id: 'ck_lead', tag: 'きっかけ', cat: 'bond', actors: actors, text: leadT, why: 'きっかけ：' + o.label + (S.sex ? '（' + (S.sex + 1) + '度目）' : '（初めて）') + (force ? '・合意のない展開の' + n + '回目' : ''), mag: 3, face: faceB(b, 'shy') });
      /* 本体の合意のない回数の段（HK.ForceRep の包み）を差させない：回数は下で本体の数え方にそろえて足す */
      var fb0 = ctx._frBusy; ctx._frBusy = true;
      var e;
      try { e = DK.say(ctx, { id: o.id || 'ck_sex_' + form, cat: 'bond', actors: actors, text: text, sex: true, lewd: form !== 'fade', force: force, mag: o.mag || 8,
        why: '調教の地下室：' + o.label + '（' + { fade: 'ほのめかす', short: '短い場面', mid: '中くらいの場面', long: '長い場面' }[form] + (h ? '・温度：' + H.label(hk) : '') + '）', face: faceB(b, 'shy') }); } finally { ctx._frBusy = fb0; }
      if (!e) { if (el && ctx.log) { var k = ctx.log.indexOf(el); if (k >= 0) ctx.log.splice(k, 1); } return false; }
      if (force && FR && FR.on && FR.on(ctx) && !mob) { var m = ctx._frN = ctx._frN || {}, kk = a.i < b.i ? a.i + '-' + b.i : b.i + '-' + a.i; m[kk] = (m[kk] || 0) + 1; }
      Ss.forEach(function (Z) {
        Z.sex++; if (form === 'long') Z.hadLong = true;
        DK.push(Z, 'want', 5); DK.push(Z, 'dep', 4); DK.push(Z, 'jo', 5); DK.push(Z, 'obey', 3);
        (Z.focus || []).forEach(function (k2) { if (Z.gauges['sens_' + k2]) DK.push(Z, 'sens_' + k2, 5); });
      });
      if (h) { if (H.move && !mob) H.move(ctx, h, a, b); if (H.note) H.note(ctx, h, a, b, { text: text }); if (H.remember) H.remember(ctx, a, b, hk); }
      return true;
    } finally { ctx.ck = c0; }
  }
  var KN = { reward: '褒美の夜', punish: '罰の続きの夜', test: '仕上がりを確かめる夜', beg: 'ねだられた夜', debut: 'お披露目の見せつけ' };
  KR.night = function (ctx, S, kind) {
    if (S.noBody || !KR.ok(ctx, S.A, S.B)) return false;
    return run(ctx, [S], S.A, S.B, { kind: kind, label: '夜・' + KN[kind] });
  };
  /* ---------- 競りの前のお披露目（山場。長めの場面） ----------
     mode：trainer 調教師と／mob 客の一人（モブ）と／pair 奴隷どうし。パターンは調教の段（従順の段 1 以下・2 以上）× 客の好み（満遍なく・ピンポイント・心）、
     台詞は攻めの態度（調教師の TOPSAY・奴隷どうしの攻めの PAIR_SAY・客の一人 MOB_SAY）、受けの一言は受けの態度（BSAY） */
  var NG_OTHER = /帳面|昼の調教|昼に教え|昼に躾け|躾けた言葉|調教の続き|調教の跡|ゆるい結び目/;
  KR.show = function (ctx, S, mode) {
    var T = X(), SH = T.SHOW || {}, lv = DK.stage(S, 'obey') >= 2 ? 'hi' : 'lo', cl = S.client || 'even';
    var LV = HK.Lewd, form = LV && LV.lv(ctx.env) === 'low' ? 'fade' : 'long';
    var pw = { nip: '{乳首}', ear: '耳', mouth: '喉の奥', pro: '{前立腺}', colon: '{結腸}', vag: '{女性器}', cock: '{男性器}' }[S.pinPart] || '体';
    var lvRows = function (x) { return ((x || {})[lv] || []).concat(); };
    var midRows = function (x) { return ((x || {})[cl] || []).map(function (t) { return t.split('{p}').join(pw); }); };
    var bsay = (SH.bsay || {})[DK.per(S.B)] || [];
    if (mode === 'trainer') {
      if (!KR.ok(ctx, S.A, S.B)) return false;
      return run(ctx, [S], S.A, S.B, { kind: 'debut', form: form, label: '競りの前のお披露目（調教師と）', id: 'ck_show_' + form, mag: 12, lead: (T.LEAD || {}).debut,
        ov: { open: lvRows((SH.open || {}).trainer), mid: midRows((SH.mid || {}).trainer), end: (SH.end || {}).trainer, bsay: bsay } });
    }
    if (mode === 'mob') {
      var g = mobGender(S.B); if (!g || !KR.mobOk(ctx, S.B)) return false;
      var mob = HK.Mob.make(ctx, { gender: g, role: '客' });
      return run(ctx, [S], mob, S.B, { kind: 'debut', form: form, label: '競りの前のお披露目（客の一人と）', id: 'ck_show_' + form, mag: 12, lead: SH.leadMob, actors: [S.B],
        ov: { open: lvRows((SH.open || {}).mob), mid: midRows((SH.mid || {}).mob), end: (SH.end || {}).mob, after: (SH.after || {}).mob, top: SH.mobSay, bsay: bsay, ng: NG_OTHER } });
    }
    if (mode === 'pair') {
      var L = ctx.ckPairs || []; if (L.length < 2) return false;
      var X0 = L[0].B, Y0 = L[1].B; if (!KR.ok(ctx, X0, Y0)) return false;
      var od = HK.Pos && HK.Pos.order ? HK.Pos.order(X0, Y0, [X0, Y0]) : [X0, Y0], a = od[0], b = od[1];
      var Sb = L.filter(function (Z) { return Z.B === b; })[0] || S;
      bsay = (SH.bsay || {})[DK.per(b)] || [];
      cl = Sb.client || cl;
      return run(ctx, L, a, b, { kind: 'debut', form: form, label: '競りの前のお披露目（奴隷どうしで）', id: 'ck_show_' + form, mag: 12, lead: SH.leadPair,
        ov: { open: lvRows((SH.open || {}).pair), mid: ((SH.mid || {}).pair || {})[cl] || [], end: (SH.end || {}).pair, after: (SH.after || {}).pair, top: ((SH.pairSay || {})[DK.per(a)]) || [], bsay: bsay, ng: NG_OTHER } });
    }
    return false;
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
