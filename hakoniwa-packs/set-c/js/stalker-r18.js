/* 君と僕の一か月（set-c-stalker）の夜（R18版だけ。2026-11-07）
   ■ HK.StalkerR18.quota(ctx, 'none'|'low'|'mid'|'high')：夜の場面の回数の上限（0／1／2／3）
   ■ HK.StalkerR18.night(ctx, S, d)：その夜に夜の場面を出したら true（stalker.js が最後の夜より前の夜ごとに呼ぶ）
     ・二人の夜（invite 招き入れる・ambush 待ち伏せ・sleep 眠ったふり・abduct 連れ去った部屋・voicep 電話越し）は、見つめられる側が相手に気づいていて（aware の段 2）、
       向き合い方が「会いに行く」「取り込まれる」で、本音 want が線（60。待ち伏せ 65・眠ったふり 70・連れ去り 75）を越えた二人だけ（土台は合意。set-c-design.md の 0-2）。
       表面が合意に見えない入口（待ち伏せ・眠ったふり・連れ去り）は、内容のスイッチ「合意のない展開」が入のときだけ（連れ去りは展開の重さが「軽い」でなく、恋愛にしてよい二人だけ）
     ・ひとりの夜（solo 耽る・fantasy 頭の中・voice 録った声・peep 窓の影）は、見つめる側が R18 に参加し、二人が体の関係にしてよい組のときだけ（相手を思い浮かべるので）
     ・場面の直前に必ず「きっかけ」の段（記録の一件。e.tag＝'きっかけ'・理由の欄は「きっかけ：…」）。二人の夜は「止められたのに止めなかった一文」（STOP）を必ず入れる
     ・長さ：ほのめかす（描写の有無 low・性器なしの人）→ fade、数行で短く → short、混ぜる → mid か long、厚く → long。回数「多め」なら一度は長い場面
     ・温度（HK.Heat.use(ID, { forceGate: true })）：場面のあいだ H.scope、組み立てたあと H.strip・H.move・H.note・H.remember（文は部屋のものだけ。本体の温度の文は使わない）
     ・流れの管理 HK.SexFlow.fix を二人の夜に通す。喘ぎは本体の HK.Moan.say（声の表だけ本体）
     ・表面が合意に見えない夜の回数（1／2／3 回目以降）は部屋で数える（S.fN）。本体の HK.ForceRep の文が混ざらないよう、記録に force の印は付けない
   ■ HK.StalkerR18.noneWhy(ctx, S)：回数を設定したのに一度も起きなかった回に、理由の文を一つ
   文は stalker-r18-text-a.js〜c.js（HK.StalkerR18Text）。体の語は印。登場人物はすべて成人として扱う */
/* @event scen=set-c-stalker id=st_x_invite cat=romance tie=- tags=night label=気づいた人が自分から扉を開ける夜 */
/* @event scen=set-c-stalker id=st_x_ambush cat=romance tie=- tags=night,force label=合鍵で入った部屋で帰りを待ち伏せる夜 */
/* @event scen=set-c-stalker id=st_x_sleep cat=romance tie=- tags=night,force label=薬を捨てて眠ったふりで迎える夜 */
/* @event scen=set-c-stalker id=st_x_abduct cat=romance tie=- tags=night,force label=連れ去った部屋で告白しながら抱く夜 */
/* @event scen=set-c-stalker id=st_x_voicep cat=romance tie=- tags=night label=電話をつないだまま互いに触れる夜 */
/* @event scen=set-c-stalker id=st_x_solo cat=solo tie=- tags=night label=持ち帰った布の匂いでひとり耽る夜 */
/* @event scen=set-c-stalker id=st_x_fantasy cat=solo tie=- tags=night label=頭の中で何度もなぞる想像の夜 */
/* @event scen=set-c-stalker id=st_x_voice cat=solo tie=- tags=night label=録りためた声を聞きながら耽る夜 */
/* @event scen=set-c-stalker id=st_x_peep cat=solo tie=- tags=night label=恋人といる窓の影を見ながら耽る夜 */
/* @event scen=set-c-stalker id=st_x_lead cat=bond tie=- label=夜の場面の前のきっかけ */
/* @event scen=set-c-stalker id=st_x_none cat=bond tie=- label=夜の場面が起きなかったわけ */
(function () {
  'use strict';
  var HK = window.HK;
  if (!HK || !HK.DarkKit || !HK.Stalker) return;
  var DK = HK.DarkKit, ST = HK.Stalker, ID = ST.ID, P = HK.Pos;
  function RT() { return HK.StalkerR18Text || {}; }
  var KR = HK.StalkerR18 = {};
  if (HK.Heat && HK.Heat.use) HK.Heat.use(ID, { forceGate: true });
  if (HK.Play && HK.Play.strict) HK.Play.strict(ID, true);
  var PAIR = { invite: 1, ambush: 1, sleep: 1, abduct: 1, voicep: 1 };
  var FORCEK = { ambush: 1, sleep: 1, abduct: 1 };
  var NAME = { invite: '自分から扉を開ける', ambush: '部屋での待ち伏せ', sleep: '眠ったふりで迎える', abduct: '連れ去った部屋での告白', voicep: '電話越し', solo: 'ひとりで耽る', fantasy: '頭の中の夜', voice: '録った声で耽る', peep: '窓の影を見ながら耽る' };
  var LINE = { invite: 60, voicep: 60, ambush: 65, sleep: 70, abduct: 75 };
  var FORM = { fade: 'ほのめかす', short: '短い場面', mid: '中くらいの場面', long: '長い場面' };
  KR.quota = function (ctx, v) { return v === 'none' ? 0 : v === 'low' ? 1 : v === 'high' ? 3 : 2; };

  function shOf(a, b) {
    var H = HK.Heat; if (H && H.modeOf) return H.modeOf(a, b);
    if (P && P.ff && P.ff(a, b)) return 'ff';
    if (P && P.isF && P.isF(a, b) && !P.isF(b, a) && !(P.hasM && P.hasM(a))) return 'fm';
    return 'mf';
  }
  function noGen(c) { return !!(P && P.noGen && P.noGen(c)); }
  function hasM(c) { return !!(P && P.hasM && P.hasM(c)); }
  function hasF(c) { return !!(P && P.hasF && P.hasF(c)); }
  function forceOn(ctx) { return DK.content(ctx, 'force'); }
  /* 二人の夜にしてよいか（体の場面の可否・気づき・分岐・本音の線） */
  function pairOk(ctx, S, kind, d) {
    var A = S.A, B = S.B;
    if (!S.body || S.kin || !S.realized || d <= S.realDay || !(S.br === 'meet' || S.br === 'drawn')) return false;
    if (DK.val(S, 'want') < LINE[kind]) return false;
    /* 恋愛の可否（恋愛にしない相手など）では止めない（本体の決まり：性的な出来事は性欲と衝動で。体の可否は S.body＝HK.bodyOK）。夜の起こりやすさ 0 は止める */
    if (HK.Pos && HK.Pos.nightOff && HK.Pos.nightOff(ctx)) return false;
    var bs = DK.stage(S, 'bold');
    if (kind === 'invite') return bs >= 1 && (S.br === 'drawn' ? DK.stage(S, 'drawn') >= 1 : DK.seen(S, 'st_confront'));
    if (kind === 'voicep') return true;
    if (!forceOn(ctx)) return false;
    if (kind === 'ambush') return bs >= 2;
    if (kind === 'sleep') return bs >= 3 && (S.br === 'meet' || DK.stage(S, 'drawn') >= 1);
    if (kind === 'abduct') return S.br === 'drawn' && bs >= 3 && S.love && !S.abduct && DK.heavy(ctx) !== 'mild' && d >= Math.floor(S.days * 0.5);
    return false;
  }
  /* ひとりの夜にしてよいか（見つめる側が R18 に参加・二人が体の関係にしてよい組・相手も R18 に参加） */
  function soloOk(ctx, S, kind, d) {
    var A = S.A, B = S.B;
    if (!S.r18 || B.noR18 || S.kin || S.avoidA || noGen(A) || !(HK.bodyOK && HK.bodyOK(A, B))) return false;
    if (kind === 'fantasy' && noGen(B)) return false;
    var bs = DK.stage(S, 'bold');
    if (kind === 'solo') return d >= 1;
    if (kind === 'fantasy') return d >= 2;
    if (kind === 'voice') return bs >= 1;
    if (kind === 'peep') { var L = S.lover; return !!(L && bs >= 2 && !L.noR18 && HK.bodyOK && HK.bodyOK(B, L)); }
    return false;
  }
  function kindsOf(ctx, S, d) {
    var W = [];
    ['invite', 'voicep', 'ambush', 'sleep', 'abduct'].forEach(function (k) { if (pairOk(ctx, S, k, d)) W.push([k, { invite: 3, voicep: 2, ambush: 3, sleep: 2.5, abduct: 8 }[k]]); });
    ['solo', 'fantasy', 'voice', 'peep'].forEach(function (k) { if (soloOk(ctx, S, k, d)) W.push([k, k === 'peep' ? 1.4 : 1]); });
    W.forEach(function (x) { if (S.kinds[x[0]]) x[1] *= 0.3 / S.kinds[x[0]]; });
    return W;
  }
  function formOf(ctx, S, kind, mustLong) {
    var env = ctx.env || {}, LV = HK.Lewd, lv = LV ? LV.lv(env) : 'mid', len = env.lewdLen || 'mix';
    if (lv === 'low' || (PAIR[kind] && (noGen(S.A) || noGen(S.B)))) return 'fade';
    if (len === 'short') return 'short';
    if (mustLong) return 'long';
    if (len === 'thick') return ctx.rng() < 0.75 ? 'long' : 'mid';
    return ctx.rng() < 0.5 ? 'mid' : 'long';
  }

  /* ---------- 表を引く（部屋の札でふるう） ---------- */
  var SLEEP_NG = /目をそら|天井を見|見上げ|見つめたまま|見返|しがみつ|首を振|背中に爪|肩に爪/;
  function fit(S, list, o) {
    var A = S.A, B = S.B, bm = hasM(B), bf = hasF(B) && !bm, cur = o.cur || {};
    return (list || []).filter(function (r0) {
      var r = typeof r0 === 'string' ? { t: r0 } : r0, t = r.t;
      if (!ST.rowPre(S, r)) return false;
      if (r.nobr && S.realized && String(r.nobr).split(/\s+/).indexOf(S.br) >= 0) return false;
      if (r.kind && r.kind !== o.kind) return false;
      if (r.notk && String(r.notk).split(/\s+/).indexOf(o.kind) >= 0) return false;
      if (r.awake && o.kind === 'sleep') return false;
      if (o.kind === 'sleep' && SLEEP_NG.test(t)) return false;
      if (r.bf && !bf) return false;
      if (r.bm && !bm) return false;
      if (r.n && !DK.stOk(r.n, Math.min(3, o.n || 1))) return false;
      if (o.sh && (o.sh === 'mf' || o.sh === 'ff') && bm && /\{(?:女性器|陰核|愛液)\}/.test(t)) return false;
      if (/張り型/.test(t) && !cur.strap && !r.strap) return false;
      if (r.strap && o.part !== 'insert' && !cur.strap) return false;
      if (/玩具/.test(t) && !cur.toy && o.part !== 'insert') return false;
      return true;
    });
  }
  function pk(ctx, S, list, o) {
    var row = DK.pick(ctx, S, fit(S, list, o), { a: S.A, b: S.B, full: true, again: true });
    if (!row) return '';
    if (o.cur && o.part === 'insert') { if (row.strap) o.cur.strap = true; if (/玩具/.test(row.t)) o.cur.toy = true; }
    return row.t;
  }
  function moan(ctx, S, who, kind, o) {
    var M = HK.Moan, m = M && M.say ? M.say(ctx, who, kind, o) : HK.Ero && HK.Ero.moan ? HK.Ero.moan(ctx, who, kind === 'climax' ? 2 : 1, { force: !!o.force }) : '……っ';
    return (who === S.A ? '{a}' : '{b}') + '「' + m + '」';
  }
  function fillMoans(ctx, S, t, kind, ero) {
    var B = S.B, frc = !!FORCEK[kind] && DK.stage(S, 'drawn') < 2, o0 = { force: frc, novel: !ero, hush: kind === 'sleep' };
    return t.replace(/\{mm\}/g, function () { return moan(ctx, S, B, 'mid', o0); })
      .replace(/\{m\}/g, function () { return moan(ctx, S, B, 'climax', { force: false, novel: !ero, hush: kind === 'sleep', late: true }); });
  }
  function perT(tbl, k) { return (tbl || {})[k] || (tbl || {}).gentle || []; }

  /* ---------- 二人の夜を組む ---------- */
  function pairText(ctx, S, kind, form, ero, n) {
    var R = RT(), A = S.A, B = S.B, sh = shOf(A, B), cur = {}, o = function (part) { return { kind: kind, sh: sh, n: n, cur: cur, part: part }; };
    var g = function (list, part) { return pk(ctx, S, list, o(part)); }, ps = [];
    if (kind === 'voicep') {
      var aB = hasM(A) ? 'm' : 'f', bB = hasM(B) ? 'm' : 'f';
      if (form === 'fade') return g(R.FADE.voicep);
      ps.push(g(R.PHONE_A[aB]));
      if (form !== 'short') ps.push(g(R.PHONE_B[bB]));
      if (form === 'long') ps.push(g(R.PHONE_MID));
      ps.push(g(R.PHONE_PEAK));
      ps.push(g(R.PHONE_END));
      return ps.filter(Boolean).join('\n\n');
    }
    if (form === 'fade') return g(R.FADE[kind]);
    ps.push(g(R.OPEN[kind]));
    var side = '';
    if (form !== 'short') {
      if (kind === 'invite') side = g(perT(R.BLINE, S.perB));
      else if (kind === 'sleep') side = g(R.SLEEP_IN);
      else side = n >= 2 && ctx.rng() < 0.6 ? g(R.RESIST.again) || g(perT(R.RESIST, S.perB)) : g(perT(R.RESIST, S.perB));
      ps.push(side);
      ps.push(g(R.FORE[sh]));
    }
    if (form === 'long') ps.push(g(perT(R.TOP, S.perA)));
    ps.push(g(R.INSERT[sh], 'insert'));
    var midN = form === 'long' ? 3 : form === 'mid' ? 1 : 0;
    for (var i = 0; i < midN; i++) {
      ps.push(g(R.MID[sh]));
      if (kind === 'abduct' && i === 0 && form !== 'short') ps.push(g(perT(R.CONFESS, S.perA)));
    }
    ps.push((ero && form !== 'short' ? g(R.PEAKE[sh]) : '') || g(R.PEAK[sh]));
    if (form !== 'short') ps.push(g(R.END[sh]));
    ps.push(g(R.AFTER[kind]));
    if (form === 'long' && HK.Lewd && HK.Lewd.lv(ctx.env || {}) === 'high' && kind !== 'sleep') ps.push(g(R.AGAIN[sh]));
    return ps.filter(Boolean).join('\n\n');
  }
  /* ---------- ひとりの夜を組む ---------- */
  function soloText(ctx, S, kind, form) {
    var R = RT(), A = S.A, B = S.B, sh = shOf(A, B), aB = hasM(A) ? 'm' : 'f', o = { kind: kind, sh: sh, cur: {} };
    var g = function (list) { return pk(ctx, S, list, o); }, ps = [];
    if (form === 'fade') return g(R.FADE[kind]);
    if (kind === 'fantasy') ps.push(g(R.FANT_BODY[sh]));
    ps.push(g(R.SOLO_BODY[aB]));
    if (form !== 'short') { if (kind === 'voice') ps.push(g(R.VOICE_MID)); else if (kind === 'peep') ps.push(g(R.PEEP_MID)); else if (form === 'long') ps.push(g(R.SOLO_BODY[aB])); }
    if (form === 'long' && kind === 'fantasy') ps.push(g(R.FANT_BODY[sh]));
    ps.push(g(R.SOLO_PEAK[aB]));
    ps.push(g(R.SOLO_AFTER[kind]));
    return ps.filter(Boolean).join('\n\n');
  }

  function drop(ctx, e) { if (!e) return; var L = ctx.log, i = L.indexOf(e); if (i >= 0) { L.splice(i, 1); for (var j = i; j < L.length; j++) if (L[j]) L[j].n = j; } }
  KR.night = function (ctx, S, d) {
    if (HK.SAFE_ON || !S || S.sexN >= S.sexMax) return false;
    var left = S.days - 1 - d;
    if (left <= 0) return false;
    var W = kindsOf(ctx, S, d);
    if (!W.length) return false;
    var rem = S.sexMax - S.sexN, hasPair = W.some(function (x) { return PAIR[x[0]]; });
    var p = Math.min(0.95, rem * 1.3 / left);
    if (S.lastSexD === d - 1) p *= 0.3;
    /* 二人の夜がまだ来ない（会いに行く・取り込まれるの二人で、まだ線の手前）なら、最後の一回は二人の夜のために少し待つ */
    if (!hasPair && rem === 1 && !S.pairN && (S.br === 'meet' || S.br === 'drawn') && left > 3) p *= 0.25;
    if (hasPair && !S.pairN) p = Math.min(0.95, p * 1.8);
    if (ctx.rng() >= p) return false;
    if (hasPair && !S.pairN) W = W.filter(function (x) { return PAIR[x[0]]; });
    var kind = HK.weighted ? HK.weighted(ctx.rng, W, function (x) { return x[1]; })[0] : W[0][0];
    var A = S.A, B = S.B, pair = !!PAIR[kind], frc = !!FORCEK[kind], n = frc ? (S.fN || 0) + 1 : (S.kinds[kind] || 0) + 1;
    var mustLong = S.sexMax >= 3 && !S.longDone && (rem === 1 || pair);
    var form = formOf(ctx, S, kind, mustLong), ero = !!(HK.Lewd && HK.Lewd.ero && HK.Lewd.ero(ctx.env || {}));
    var R = RT(), oo = { kind: kind, n: n, cur: {} };
    /* きっかけ（二人の夜は止めなかった一文を必ず） */
    S._c = kind === 'peep' ? S.lover : null;
    var lt = pk(ctx, S, R.LEAD[kind], oo), stop = pair || (kind === 'peep' && S.realized && (S.br === 'meet' || S.br === 'drawn')) ? pk(ctx, S, R.STOP[kind], oo) : '';
    if (!lt || (pair && !stop)) { S._c = null; return false; }
    var why0 = pair ? (B.name + 'は' + A.name + 'に気づいていて、拒みきらなかった（' + NAME[kind] + '）') : (A.name + 'が' + B.name + 'を思って（' + NAME[kind] + '）');
    /* 本体の夜の後付けの一文（劣等感・優越の一文など）を差させない：部屋の文だけで組む（記録を出すあいだだけ ctx.apart を立てる。電話越しの夜は記録にも e.apart） */
    var ap0 = ctx.apart; ctx.apart = true;
    try {
    var le = ST.sayX(ctx, S, { id: 'st_x_lead', cat: 'bond', t: lt + stop, actors: pair ? [A, B] : [A], tag: 'きっかけ', why: 'きっかけ：' + why0, face: ST.faceOf(S), g: kind === 'peep' ? S.lover : null, ex: ST.exOf(S, kind === 'peep' ? S.lover : null) });
    if (!le) { S._c = null; return false; }
    /* 場面（温度を読む） */
    var H = HK.Heat && HK.Heat.enabled && HK.Heat.enabled(ID) && pair ? HK.Heat : null;
    var h = H ? H.of(ctx, A, B, { force: frc, scen: ID }) : null;
    var raw = H && h ? H.scope(ctx, A, B, h, function () { return pair ? pairText(ctx, S, kind, form, ero, n) : soloText(ctx, S, kind, form); }) : pair ? pairText(ctx, S, kind, form, ero, n) : soloText(ctx, S, kind, form);
    S._c = null;
    if (!raw) { drop(ctx, le); return false; }
    var text = DK.fill(ctx, fillMoans(ctx, S, raw, kind, ero), A, B, ST.exOf(S, kind === 'peep' ? S.lover : null));
    if (pair && kind !== 'voicep' && form !== 'fade' && HK.SexFlow && HK.SexFlow.fix) { try { var fr = HK.SexFlow.fix(text, { a: A, b: B, mode: shOf(A, B) }); if (fr && fr.text) text = fr.text; } catch (e0) { /* 流れの管理に失敗しても場面は出す */ } }
    if (h) text = H.strip(text, h.key);
    var fc = {}; fc[B.i] = form === 'fade' ? 'shy' : 'normal'; fc[A.i] = 'normal';
    var e = DK.say(ctx, { id: 'st_x_' + kind, cat: pair ? (S.love ? 'romance' : 'bond') : 'solo', actors: pair ? [A, B] : [A], text: text, sex: pair, lewd: form !== 'fade',
      why: '君と僕の一か月：夜（' + FORM[form] + '・' + NAME[kind] + (frc && n >= 2 ? '・' + Math.min(n, 3) + (n >= 3 ? '回目以降' : '回目') : '') + '）',
      fx: function () {
        if (pair) { ctx.mod2(A, B, S.love ? { att: 5, aff: 3 } : { aff: 4 }, S.love ? { att: 5, aff: 3 } : { aff: 3 }); DK.push(S, 'want', 6); DK.push(S, 'drawn', 8); }
        else { DK.push(S, 'bold', 3); ctx.mod2(A, B, S.love ? { att: 2 } : { aff: 1 }, {}); }
      } });
    if (!e) { drop(ctx, le); return false; }
    if (kind === 'voicep') { le.apart = true; e.apart = true; }
    } finally { ctx.apart = ap0; }
    if (h) { H.move(ctx, h, A, B); H.note(ctx, h, A, B, { text: text }); H.remember(ctx, A, B, h.key); }
    S.sexN++; S.kinds[kind] = (S.kinds[kind] || 0) + 1; S.lastSexD = d;
    if (pair) { S.pairN++; if (frc) S.fN = (S.fN || 0) + 1; if (shOf(A, B) === 'mf' && kind !== 'voicep') S.insN++; if (kind === 'abduct') S.abduct = true; } else S.soloN++;
    if (form === 'long') S.longDone = true;
    (S.sexLog = S.sexLog || []).push({ d: d, kind: kind, form: form, pair: pair, want: DK.val(S, 'want'), aware: DK.stage(S, 'aware'), br: S.br, lead: le.n, scene: e.n });
    return true;
  };
  /* 回数を設定したのに一度も起きなかった：理由の文を一つ */
  KR.noneWhy = function (ctx, S) {
    if (S.sexN || !S.sexMax || DK.once(S, 'noneWhy') === false) return null;
    var R = RT(), k = !S.r18 || !S.body ? 'nobody' : S.br === 'report' || S.ally === 'many' ? 'guard' : 'door';
    var t = DK.pick(ctx, S, (R.NONE_WHY || {})[k] || [], { a: S.A, b: S.B });
    if (!t) return null;
    return ST.sayX(ctx, S, { id: 'st_x_none', cat: 'bond', t: t, why: '君と僕の一か月：夜の場面が起きなかった（' + { nobody: '体の場面にしない二人', guard: '周りに守られていた', door: '扉が開かなかった' }[k] + '）' });
  };
})();
