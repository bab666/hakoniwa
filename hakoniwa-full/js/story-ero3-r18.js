/* 箱庭シミュレーター（R18版のみ）― エロシーンの拡充 第3段（担当E3b・2026-10-31）：物語型・合意のない喉奥と結腸・媚薬ロッカーの三人以上
   設計と計測：docs/reports/2026-10-31/ero3-story.md
   ・物語型（邪神村・吹雪の館・宇宙船漂流記・人狼）の山場に、E1 のプレイの段（HK.EroPlay）と E2 の能動性の型（HK.Initiative）を取り付ける。
       男性向け（thick-sex-ero.js の HK.ThickEro.scene）と宇宙船の小説調（omega-thick-kit.js の HK.TKC.body）は、HK.EroPlay.SCEN に箱庭を足すだけで共通の口（raceWeave）が効く。
       邪神村・吹雪の館の小説調（r18-thick.js の名前を埋めた段落）は、ここで raceWeave と HK.R18M.sex・HK.R18Thick.ff を包んで差す（合意の夜だけ。mood が rough の夜・敵対や恐怖の二人には差さない）。
       人狼の小説調の合意の夜（段落の無い短い本文）は、前戯の段（乳首・喉奥・前立腺の指）だけを本文の前に置く。
   ・箱庭ごとの組み合わせの段（HK.EroPlay3.own(箱庭)＝HK.Ero3Jashin など。文は箱庭ごとのファイル jashin-ero3-r18.js など）：プレイの段（on:'ep'）か型の段（on:'ini'）が出た場面に、
       その箱庭らしい一段（体の組 mf／ff／fm／mm ごと・小説調／男性向け）と受けの態度9種の反応・喘ぎを足す。合意のない形（on:'force'）は合意のない段の前に置く。
   ・合意のない喉奥・結腸（X3.force）：敵対の強引なエッチ（hate-sex-r18.js の HK.HateSex.scene）・恐怖／無関心の力ずくの夜（cold-fear-r18.js の HK.ColdFear.R18.scene。
       出られない部屋の cf_room_r18 を含む）・人狼の強引な夜・邪神村の憑依の夜に、内容のスイッチ「合意のない展開」が入・攻めの夜の性格が sadist・体が成り立つ組のときだけ差す。
       喉奥は攻めに男性器（男×女・男×男）、結腸は攻めに男性器・受けが男性器だけ。「暴力をともなう性描写」が切なら、押さえつける・髪を掴む一文は足さない。
   ・媚薬ロッカーの三人以上（locker-crowd.js）：同じロッカーの二人が繋がっているあいだ（HK.Trio3.pairTalk の口）にプレイの段（乳首・結腸。狭いので喉奥・前立腺の指は使わない）と型の段（受けの返し・主導が移る。
       体位を変える段・寝台の文は使わない）、三人の場面（HK.Trio3.begin）の最初の組に型の段を足す。
   ・本筋の乱数は使わない（入力の seed・名前・回の番号から別の乱数）。差さない回の結果は今までと同じ。
   ・受け攻めの向きは呼ぶ側の HK.Pos.order のまま。受け優位・逆転は HK.Initiative が受け本人の夜の主導（誘い受け・襲い受け）のときだけ出す。攻めを選んだ人は受けにしない。
   全年齢版にはこのファイルはない。登場人物はすべて成人として扱う */
/* @event-ok 物語型・ロッカーの三人以上・敵対と恐怖の強引な夜の既存の山場に、プレイの段・能動性の型・箱庭ごとの組み合わせの段・合意のない喉奥と結腸の段を足す（新しい出来事ではない） */
(function () {
  'use strict';
  var HK = window.HK;
  if (!HK || !HK.wrap) return;
  var X3 = HK.EroPlay3 = {};
  X3.log = null;
  /* 箱庭ごとの文の表（各箱庭のかたまりの jashin-ero3-r18.js など。箱庭を読んでいなければ null） */
  var OWN_KEY = { jashin: 'Ero3Jashin', yakata: 'Ero3Yakata', ship: 'Ero3Ship', jinro: 'Ero3Jinro' };
  X3.own = function (scen) { var k = OWN_KEY[scen]; return (k && HK[k]) || null; };
  function L(s) { return s.split('|'); }
  var ATTS = ['proud', 'stern', 'tsun', 'gentle', 'devoted', 'cool', 'free', 'shy', 'polite'];
  /* 小説調の名前を埋めた段落に差す箱庭（r18-thick.js の SCEN と同じ）と、人狼（段落の無い短い本文） */
  var NAME_SCEN = { jashin: 1, yakata: 1 };
  var MY = { jashin: 1, yakata: 1, ship: 1, jinro: 1 };

  /* ---------- 回の状態（本筋の乱数は使わない） ---------- */
  var RUN = { seed: '', n: 0, env: {}, scen: '', nc: 0, ties: [] };
  function hstr(s) { var h = 2166136261; for (var i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }
  function mkRng(key) {
    var h = hstr(key) || 1;
    var r = function () { h = (Math.imul(h ^ (h >>> 15), 2246822507) + 0x6D2B79F5) >>> 0; h ^= h >>> 13; return (h >>> 8) / 16777216; };
    r.int = function (m) { return Math.floor(r() * m); };
    r.pick = function (a) { return a[r.int(a.length)]; };
    return r;
  }
  function rngFor(tag, T, U) { RUN.n++; return mkRng('e3|' + RUN.seed + '|' + RUN.n + '|' + tag + '|' + (T && T.name) + '|' + (U && U.name)); }
  X3.rngFor = rngFor;
  HK.wrap(HK, 'simulate', function (sim0) {
    if (typeof sim0 !== 'function') return sim0;
    var f = function (input) {
      var prev = { seed: RUN.seed, n: RUN.n, env: RUN.env, scen: RUN.scen, nc: RUN.nc, ties: RUN.ties };
      RUN.ties = (input && input.ties) || [];
      RUN.seed = String(input && input.seed != null ? input.seed : ''); RUN.n = 0;
      RUN.env = (input && input.env) || {}; RUN.scen = (input && input.scenId) || ''; RUN.nc = input && input.chars ? input.chars.length : 0;
      try { return sim0.apply(this, arguments); } finally { for (var k in prev) RUN[k] = prev[k]; }
    };
    return cp(f, sim0);
  });
  X3.scen = function () { return RUN.scen; };
  /* 点検用：回の中で使った文の数（回をまたいで残っていないか） */
  X3.usedN = function () { return Object.keys(USED).length; };

  /* ---------- 体・設定 ---------- */
  function P() { return HK.Pos || {}; }
  function EP() { return HK.EroPlay; }
  function INI() { return HK.Initiative; }
  function hasM(c) { var Q = P(); return Q.hasM ? Q.hasM(c) : (c && c.gender) === 'm'; }
  function hasF(c) { var Q = P(); return Q.hasF ? Q.hasF(c) : (c && c.gender) === 'f'; }
  function isF(c) { var Q = P(); return Q.isF ? Q.isF(c) : (c && c.gender) === 'f'; }
  function hardTopU(T, U) { var Q = P(); return !!(Q.hardTop && Q.hardTop(U, T)); }
  function ct(tag) { return !!(HK.Content && HK.Content.on && HK.Content.on(RUN.env, tag, RUN.scen)); }
  function noGen(T, U) { return !!(HK.NoGen && HK.NoGen.on && HK.NoGen.on(T, U)); }
  function hostile(T, U) { var Q = P(); return !!((Q.hostile && Q.hostile(T, U)) || (Q.fearOf && (Q.fearOf(T, U) || Q.fearOf(U, T)))); }
  /* 場面の体の組（プレイの組）：mf（受けに女性器）／mm（攻めに男性器・受けが男性器だけ）／ff／fm */
  function comboOf(T, U, mode) {
    if (mode === 'ff') return 'ff';
    if (mode === 'fm') return 'fm';
    return hasM(U) && !hasF(U) ? 'mm' : 'mf';
  }
  /* 山場の体の組（mode）：r18-thick.js と同じ決め方 */
  function modeOf(T, U) {
    var Q = P();
    if (Q.ff && Q.ff(T, U)) return 'ff';
    if (HK.FM && HK.FM.on && HK.FM.on(T, U)) return 'fm';
    if (isF(T) && (((U.gender || (U.src && U.src.gender)) === 'm') || (hasM(U) && !hasM(T)))) return 'fm';
    return 'mf';
  }
  X3.comboOf = comboOf; X3.modeOf = modeOf;
  function attOf(a, b) { var E = EP(); var w = E && E.attOf ? E.attOf(a, b) : (HK.personaOf ? HK.personaOf(a) : 'gentle'); return ATTS.indexOf(w) >= 0 ? w : 'gentle'; }
  function kindOf(a, b) { var E = EP(); return E && E.kindOf ? E.kindOf(a, b) : ''; }

  /* ---------- 文を組む部品 ---------- */
  var USED = {};
  function pickF(R, arr) {
    if (!arr || !arr.length) return '';
    var free = arr.filter(function (x) { return !USED[x]; });
    var l = free.length ? free : arr, x = l[R.int(l.length)];
    USED[x] = 1;
    return x;
  }
  function moan(R, U, T, kind, ero, o) {
    var M = HK.Moan, fb = function () { return kind === 'climax' ? 'あ、ぁ……っ' : 'ん、ぅ……っ'; };
    var op = { novel: !ero, top: T };
    if (o) for (var k in o) op[k] = o[k];
    /* 元の表（old）は渡さない：小説調で4割が決まった一声になるのを避け、いつも喘ぎの辞書（態度・口調・濁点・♡の設定）から引く */
    var t = M && M.say ? M.say(R, U, kind, op) : fb();
    return t || fb();
  }
  function sfx(R, k) { var l = HK.Ero && HK.Ero.SFX && HK.Ero.SFX[k]; return l && l.length ? l[R.int(l.length)] : ''; }
  function fill(t, R, T, U, ero, force) {
    return String(t)
      .replace(/\{mb\}/g, function () { return moan(R, U, T, 'mid', ero, force ? { force: true, late: true } : null); })
      .replace(/\{md\}/g, function () { return moan(R, U, T, 'mid', ero, force ? { force: true, late: true, deep: true } : { deep: true }); })
      .replace(/\{mg\}/g, function () { var E = EP(); var m = moan(R, U, T, 'mid', ero, force ? { force: true, deep: true } : { deep: true }); return '{b}「' + (E && E.muffle ? E.muffle(m, R) : m) + '」'; })
      .replace(/\{s:(\w+)\}。?/g, function (m, k) { if (!ero) return ''; var s = sfx(R, k); return s ? s + '。' : ''; })
      .replace(/。。/g, '。');
  }
  function paint(t, T, U, ph) {
    if (ph === 'TU') return t.replace(/\{a\}/g, '{T}').replace(/\{b\}/g, '{U}');
    if (ph === 'name') return t.replace(/\{a\}/g, T.name).replace(/\{b\}/g, U.name);
    return t;
  }
  function log(o) { if (X3.log) X3.log.push(o); }
  /* 包み直した関数に、内側の関数の印（_eroPlay・_attr・_lead・_flavor など。ほかのファイルが二度包まないための印）を引き継ぐ */
  function cp(f, f0) { if (typeof f0 === 'function') for (var k in f0) if (Object.prototype.hasOwnProperty.call(f0, k) && !(k in f)) f[k] = f0[k]; return f; }

  /* ---------- 箱庭ごとの組み合わせの段 ---------- */
  /* 箱庭の表 = { REACT: { 態度: [文] }, LIST: [{ id, on: 'ep'|'ini'|'force', keys: [プレイ], need: function (情報), p: 起こりやすさ, T: { n: { mf, ff, fm, mm }, e: {…} }, TK: { プレイ: { n, e } } }] } */
  function ownPick(on, info, T, U, ero, R) {
    var O = X3.own(RUN.scen);
    if (!O || !O.LIST || HK.SAFE_ON) return null;
    var cb = comboOf(T, U, info.mode), st = ero ? 'e' : 'n';
    var cand = O.LIST.filter(function (c) {
      if (c.on !== on) return false;
      if (c.keys && !(info.keys || []).some(function (k) { return c.keys.indexOf(k) >= 0; })) return false;
      if (c.need && !c.need(info, T, U)) return false;
      return !!tblOf(c, info, st, cb);
    });
    if (!cand.length) return null;
    var c = cand[R.int(cand.length)];
    if (R() >= (c.p != null ? c.p : 0.6)) return null;
    var key = c.keys ? (info.keys || []).filter(function (k) { return c.keys.indexOf(k) >= 0; })[0] : '';
    var arr = tblOf(c, info, st, cb, key);
    var t = pickF(R, arr);
    if (on !== 'force') {
      var at = attOf(U, T), rl = O.REACT && (O.REACT[at] || O.REACT.gentle);
      if (rl) t += pickF(R, rl);
      if (!/\{b\}「/.test(t)) t += '{b}「{mb}」';
      /* 前立腺の指の段のあとは繋がる段が来るので、指を抜く一文で閉じる（点検 misc の FI） */
      if (key === 'pros' && /指(?:を|が|で)/.test(t) && !/指を[^。]{0,8}(?:抜|引き抜|離)/.test(t)) t += pickF(R, PROS_OUT);
    }
    t = fill(t, R, T, U, ero, on === 'force');
    log({ kind: 'own', scen: RUN.scen, id: c.id, key: key, combo: cb, mode: info.mode, ero: !!ero, aT: attOf(T, U), aU: attOf(U, T), kT: kindOf(T, U), kU: kindOf(U, T), hardTopU: hardTopU(T, U), anat: anatOwn(t, T, U, cb), text: paint(t, T, U, 'name') });
    return { text: t, key: key, id: c.id };
  }
  var PROS_OUT = L('やがて{a}は、濡れた指をゆっくりと引き抜いた。|{a}は名残惜しそうに、{b}の中から指を引き抜いた。');
  function tblOf(c, info, st, cb, key) {
    var tb = c.TK ? null : c.T;
    if (c.TK) {
      var ks = key ? [key] : (info.keys || []).filter(function (k) { return c.keys.indexOf(k) >= 0; });
      for (var i = 0; i < ks.length; i++) { var x = c.TK[ks[i]] && c.TK[ks[i]][st]; if (x && (x[cb] || (cb === 'mm' && x.mf && !c.noMM))) return x[cb] || x.mf; }
      return null;
    }
    var s = tb && tb[st];
    if (!s) return null;
    return s[cb] || (cb === 'mm' && !c.noMM ? s.mf : null) || null;
  }
  /* 解剖の点検：受けに女性器が無いのに {女性器}{陰核}{愛液}、攻めに男性器が無いのに「{a}の{男性器}」、受けに男性器が無いのに「{b}の{男性器}」・{前立腺}{結腸} */
  function anatOwn(t, T, U, cb) {
    if (/\{b\}の(?:\{女性器\}|\{陰核\}|\{愛液\})/.test(t) && !hasF(U)) return false;
    if (/\{a\}の(?:\{女性器\}|\{陰核\})/.test(t) && !hasF(T)) return false;
    if (/\{a\}の\{男性器\}/.test(t) && !hasM(T)) return false;
    if (/\{b\}の\{男性器\}/.test(t) && !hasM(U)) return false;
    if (/\{前立腺\}|\{結腸\}/.test(t) && hasF(U)) return false;
    return true;
  }
  X3.anatOwn = anatOwn;

  /* 段落の配列の差分：after のうち before に無い段落（差し込まれた段落）の番号を、連続ごとにまとめる */
  function runsOf(before, after) {
    var runs = [], i = 0, j = 0, cur = null;
    while (i < after.length) {
      var a = after[i], b = before[j];
      var same = j < before.length && (a === b || (typeof a === 'string' && typeof b === 'string' && b.length > 8 && a.length > b.length && a.slice(-b.length) === b));
      if (same) { if (cur) { runs.push(cur); cur = null; } i++; j++; }
      else { if (!cur) cur = { s: i, e: i }; else cur.e = i; i++; }
    }
    if (cur) runs.push(cur);
    return runs;
  }

  /* 型の段を差した前後で「指で責める段 → いきなり繋がる段」にならないよう、指を抜く一文を足す（点検 misc の FI と同じ判定。
     E2 の HK.Initiative.apply は女性どうしの場面を除いて直前の段だけを見るので、物語型の箱庭では差した段の前後の両方を見る） */
  var FI_FINGER = /指(?:を|が)(?:[^。]{0,12})(?:ねじ込|挿れ|挿し|差し入れ|入れ|沈め|埋め|潜り込|滑り込|突き入れ)|指で(?:[^。]{0,10})(?:掻き回|かき回|ほぐ|擦|こす|責め|突)|指(?:を|が)(?:[^。]{0,8})(?:動か|曲げ|抜き差し|出し入れ)/;
  var FI_OUT = /指を(?:[^。]{0,8})(?:抜|引き抜|離)|指が(?:[^。]{0,6})(?:抜け|抜か|離れ)|舐め取|指を(?:[^。]{0,8})(?:見せ|突きつけ|口に)/;
  var FI_INS = /突き入れ|挿入|貫い|貫か|繋が(?:っ|る|り)|腰を沈め|(?:先端|切っ先|熱|もの|それ)を(?:[^。]{0,10})(?:押し当て|宛てが|あてが|埋め|沈め|押し込)|奥まで(?:[^。]{0,6})(?:押し込|沈め|呑み込|突き)|ゆっくりと(?:[^。]{0,6})入って/;
  var FI_PULL = '{a}は濡れた指を、ゆっくりと引き抜いた。';
  function fiStrip(t) { return String(t || '').replace(/「[^」]*」/g, '').replace(/髪に指[^。]*/g, ''); }
  function fiOpen(t) { var x = fiStrip(t); return FI_FINGER.test(x) && !FI_OUT.test(x) && !FI_INS.test(x); }
  function fiIns(t) { var x = fiStrip(t); return FI_INS.test(x) && !FI_OUT.test(x) && !FI_FINGER.test(x); }
  function fiFix(text, res) {
    var bf = text.split(/\n+/), af = res.split(/\n+/), runs = runsOf(bf, af), fix = {}, ins = {};
    runs.forEach(function (r) { for (var q = r.s; q <= r.e; q++) ins[q] = 1; });
    /* 差した段が絡む隣どうし（差した段の中どうしも）。空の段は飛ばして次の段を見る */
    for (var i = 0; i < af.length; i++) {
      if (!af[i].trim() || !fiOpen(af[i])) continue;
      var j = i + 1; while (j < af.length && !af[j].trim()) j++;
      if (j >= af.length || !(ins[i] || ins[j]) || !fiIns(af[j])) continue;
      if (ins[j]) fix[j] = 'pre'; else fix[i] = 'post';
    }
    if (!Object.keys(fix).length) return res;
    /* 段の区切り（改行の数）はそのまま残す */
    var parts = res.split(/(\n+)/), k = -1;
    return parts.map(function (p, i) { if (i % 2) return p; k++; return fix[k] === 'pre' ? FI_PULL + p : fix[k] === 'post' ? p + FI_PULL : p; }).join('');
  }
  /* HK.EroPlay.weave の後：プレイの段が出たら、そのプレイの段の後ろに箱庭の組み合わせの段 */
  function epOwn(arr, before, T, U, plan, o) {
    if (!X3.own(RUN.scen)) return;
    var R = rngFor('own-ep', T, U), ero = !!(o && o.ero);
    var own = ownPick('ep', { mode: plan.mode || (o && o.mode) || 'mf', keys: plan.keys }, T, U, ero, R);
    if (!own) return;
    var runs = runsOf(before, arr), fk = plan.keys.filter(function (k) { return k !== 'colon'; });
    var foreRun = fk.length ? runs[0] : null, midRun = runs[foreRun ? 1 : 0];
    var at = -1;
    if (own.key === 'colon') at = midRun ? midRun.e : -1;
    else if (foreRun && fk.indexOf(own.key) >= 0) at = Math.min(foreRun.s + fk.indexOf(own.key), foreRun.e);
    if (at < 0) return;
    arr.splice(at + 1, 0, paint(own.text, T, U, (o && o.ph) || 'ab'));
  }
  /* HK.Initiative.apply の後：型の段（展開・返し・主導が移る）が出たら、その段の後ろに箱庭の組み合わせの段（{a}{b} のまま） */
  function iniOwn(text, res, pl) {
    if (!X3.own(RUN.scen) || !pl || !pl.a || !pl.b) return res;
    var info = { mode: pl.mode, keys: [], dev: pl.dev, pose: pl.pose, react: pl.react, change: pl.change, lsty: pl.lsty, lead: pl.lead };
    var R = rngFor('own-ini', pl.a, pl.b);
    var own = ownPick('ini', info, pl.a, pl.b, !!pl.ero, R);
    if (!own) return res;
    var bf = text.split(/\n+/), af = res.split(/\n+/), runs = runsOf(bf, af), flat = [];
    runs.forEach(function (r) { for (var i = r.s; i <= r.e; i++) flat.push(i); });
    var leadN = pl.lsty ? (pl.tresp ? 2 : 1) : 0, endN = pl.change === 'swap' ? 1 : 0;
    var mid = flat.slice(leadN, flat.length - endN);
    if (!mid.length) return res;
    var last = af[mid[mid.length - 1]], k = res.lastIndexOf(last);
    if (k < 0) return res;
    k += last.length;
    return res.slice(0, k) + '\n\n' + own.text + res.slice(k);
  }

  /* ---------- 合意のない喉奥・結腸 ---------- */
  var F = X3.F = {
    react: {
      proud: L('{b}は屈辱に目を見開き、それでも{a}を睨みつけようとした。けれど息を奪われた体には、睨み返す力さえ残っていなかった。|{b}は最後まで声を上げまいとした。崩れかけた誇りだけが、かろうじて{b}の顔を上げさせていた。'),
      stern: L('{b}は眉ひとつ動かすまいと奥歯を噛んだ。それでも、震える指先だけはどうにもならなかった。|{b}は表情を殺したまま、ただ早く終わることだけを考えようとした。'),
      tsun: L('{b}は涙目のまま、こんなものは何でもないと言いたげに顔を背けた。けれど漏れる声は、少しも誤魔化せていなかった。|{b}は悔しさに唇を震わせ、それでも負けを認めまいと{a}の腕に爪を立てた。'),
      gentle: L('{b}はやめてほしいと目で訴えた。その目に{a}が応えることはなく、{b}は静かに涙をこぼした。|{b}は抗う力も尽きて、嵐が過ぎるのを待つように、きつく目を閉じた。'),
      devoted: L('{b}は嫌だと首を振ろうとした。けれど体は、命じられることに慣れたように力を抜いてしまっていた。|{b}は拒む言葉を探したが、喉からこぼれたのは掠れた息だけだった。'),
      cool: L('{b}は何が起きているのかを冷静に数えようとした。けれど数えるそばから、考えは熱に崩されていった。|{b}は抗っても無駄だと頭では分かっていた。分かっていることが、かえって悔しかった。'),
      free: L('いつもの軽口は、どこにも見当たらなかった。{b}はただ、思いどおりにならない体に戸惑っていた。|{b}は冗談にしてしまおうと笑いかけたが、その笑みはすぐに引きつって消えた。'),
      shy: L('{b}は恐ろしさに体を縮め、声を出すことさえできなかった。小さな肩が、ずっと震えていた。|{b}は見られていることに耐えられず、両手で顔を覆おうとしたが、その手もすぐに払いのけられた。'),
      polite: L('{b}はやめてほしいと何度も言おうとした。丁寧な言葉は、途中から言葉の形を失っていった。|{b}は最後まで取り乱すまいと唇を結んだが、それも長くは続かなかった。')
    },
    end: {
      n: L('ようやく引き抜かれると、{b}は床に手をつき、激しく咳き込んだ。濡れた唇を拭う気力も残っていなかった。|{a}が腰を引くと、{b}は肩で荒く息をした。喉の奥に残った感触は、いつまでも消えなかった。'),
      e: L('ずるりと{a}の{男性器}が引き抜かれ、{b}の唇とのあいだに涎が糸を引いた。{b}はげほげほと咳き込み、涙で濡れた顔を伏せた。|解放された喉で、{b}は必死に空気を吸い込んだ。口の端から垂れた涎が、ぽたぽたと床に落ちた。')
    },
    vioT: L('{a}は{b}の髪を掴んで頭を固定し、逃げようとする喉を何度も奥まで突いた。|{a}は{b}の髪を鷲掴みにしたまま、えずいて涙が溢れても腰を止めなかった。'),
    colLead: L('{a}は、それでもまだ満足していなかった。|{a}の責めは、そこで終わらなかった。'),
    colon: {
      n: L('{a}は逃げようとする{b}の腰を引き戻し、行き止まりだと思っていたさらに奥へ、{a}の{男性器}の先を押し当てた。{b}の体がびくりと強張り、拒む声が喉の奥で潰れた。閉じていたはずの{結腸}の入口をこじ開けられて、{b}の視界は白く明滅した。|' +
        '{a}は深く繋がったまま、{b}の奥の行き止まりを何度も小突いた。やめてほしいという声には耳を貸さず、{a}はそこが開くまで同じ場所を突き続けた。奥の奥まで呑み込まされた瞬間、{b}の体は意思に反して大きく跳ねた。'),
      e: L('{a}は{b}の腰を掴んで引き寄せ、{a}の{男性器}の先を最奥のさらに奥へねじ込んだ。{s:hit}。ぐぽっ、と鈍い音がして{結腸}の入口がこじ開けられ、{b}の喉から潰れた悲鳴が漏れた。拒んでいたはずの奥は、一度開かれると、{a}の形を覚えたように吸いついた。|' +
        '{a}は行き止まりを容赦なく突き上げ、{b}の拒む声ごと奥の奥まで押し入った。{s:hit}。{結腸}を抉られるたびに、{b}の{男性器}は意思に反してびくびくと震えた。逃げようとした腰は、そのたびに引き戻されて、さらに深く呑み込まされた。')
    },
    vioC: L('{a}は{b}の腰に指の跡が残るほど強く掴み、逃げる体を何度も引き戻した。|{a}は{b}の背中に体重をかけ、這って逃げようとする体を床に縫いとめた。')
  };
  /* T＝攻め・U＝受け（呼ぶ側の向き）。mode：mf／fm／ff。戻り値 { throat:'', colon:'', keys:[] }（{a}{b} のまま・喘ぎは埋めてある）か null */
  X3.force = function (T, U, mode, ero, src) {
    var E = EP();
    if (HK.SAFE_ON || !E || !E.anatOk || !T || !U || T === U) return null;
    if (!ct('force') || noGen(T, U) || hardTopU(T, U)) return null;
    if (kindOf(T, U) !== 'sadist') return null;
    var R = rngFor('force|' + (src || ''), T, U), st = ero ? 'e' : 'n', vio = ct('violence');
    var th = E.anatOk('throat', T, U, mode) && R() < 0.45, co = E.anatOk('colon', T, U, mode) && R() < 0.35;
    if (!th && !co) { log({ kind: 'force', scen: RUN.scen, src: src || '', keys: [], combo: comboOf(T, U, mode) }); return null; }
    var at = attOf(U, T), out = { throat: '', colon: '', keys: [] };
    if (th) {
      var D = E.D && E.D.throat, core = D && D.force ? pickF(R, D.force[st]) : '';
      var man = D && D.m && D.m.sadist ? pickF(R, D.m.sadist) : '';
      out.throat = fill(pickF(R, E.WHY && E.WHY.force ? E.WHY.force : F.colLead) + core + man + (vio ? pickF(R, F.vioT) : '') + pickF(R, F.react[at] || F.react.gentle) + pickF(R, F.end[st]), R, T, U, ero, true);
      out.keys.push('throat');
    }
    if (co) {
      out.colon = fill(pickF(R, F.colLead) + pickF(R, F.colon[st]) + (vio ? pickF(R, F.vioC) : '') + pickF(R, F.react[at] || F.react.gentle) + '{b}「{md}」', R, T, U, ero, true);
      out.keys.push('colon');
    }
    /* 箱庭の組み合わせの段（合意のない形の前置き） */
    var own = ownPick('force', { mode: mode, keys: out.keys }, T, U, ero, R);
    if (own) out.pre = own.text;
    var all = (out.pre || '') + out.throat + out.colon;
    log({ kind: 'force', scen: RUN.scen, src: src || '', keys: out.keys.slice(), combo: comboOf(T, U, mode), force: true, vio: vio, aT: attOf(T, U), aU: at, kT: kindOf(T, U), hardTopU: hardTopU(T, U),
      anat: out.keys.every(function (k) { return E.anatOk(k, T, U, mode); }) && anatOwn(all, T, U, comboOf(T, U, mode)), trig: true, ero: !!ero, text: paint(all, T, U, 'name') });
    return out;
  };

  /* ---------- 共通の部品の包み ---------- */
  function installEP() {
    var E = EP();
    if (!E || !E.weave || E.weave._e3) return;
    E.SCEN.jashin = 1; E.SCEN.yakata = 1; E.SCEN.ship = 1; E.SCEN.jinro = 1;
    HK.wrap(E, 'weave', function (w0) {
      var f = function (arr, T, U, idx, o) {
        var before = Array.isArray(arr) ? arr.slice() : null;
        var plan = w0.apply(this, arguments);
        if (plan && before && !plan.force && MY[RUN.scen]) { try { epOwn(arr, before, T, U, plan, o); } catch (e) { log({ kind: 'err', err: String(e && e.stack || e) }); } }
        return plan;
      };
      f._e3 = true;
      return cp(f, w0);
    });
  }
  function installIni() {
    var I = INI();
    if (!I || !I.apply || I.apply._e3) return;
    HK.wrap(I, 'apply', function (a0) {
      var f = function (text, pl) {
        var res = a0.apply(this, arguments);
        if (typeof res !== 'string' || res === text || !MY[RUN.scen]) return res;
        try { return iniOwn(text, fiFix(text, res), pl); } catch (e) { log({ kind: 'err', err: String(e && e.stack || e) }); return res; }
      };
      f._e3 = true;
      return cp(f, a0);
    });
  }
  /* 小説調の名前を埋めた段落（r18-thick.js）：呼び出しのあいだの場面の気分 */
  var CUR = null;
  function phOf(arr) { var s = arr.join(''); return /\{T\}|\{U\}/.test(s) ? 'TU' : /\{a\}|\{b\}/.test(s) ? 'ab' : 'name'; }
  function nthOf(S, T, U) { return HK.Ero && HK.Ero.pairNight ? HK.Ero.pairNight(S, T, U, true) : 1; }
  function epOpt(S, T, U, mode, ero, src, mood) {
    var E = EP(), ET = HK.EroTop;
    if (!E || mood === 'rough' || hostile(T, U)) return null;
    return { mode: mode, ero: !!ero, src: src, rel: ET && ET.relOf ? ET.relOf(null, T, U) : '', heat: mood === 'drug' ? 'drug' : '', nth: nthOf(S, T, U),
      lewd: HK.Lewd && HK.Lewd.lv ? HK.Lewd.lv(RUN.env || {}) : '', R: E.rngFor ? E.rngFor(T, U) : rngFor('ep', T, U) };
  }
  function installRW() {
    var A = HK.Attr;
    if (!A || !A.raceWeave || A.raceWeave._e3) return;
    HK.wrap(A, 'raceWeave', function (rw0) {
      var f = function (arr, T, U, pick, idx, o) {
        var r = rw0.apply(this, arguments);
        if (HK.SAFE_ON || !CUR || !NAME_SCEN[RUN.scen] || !Array.isArray(arr) || !T || !U || phOf(arr) !== 'name') return r;
        try {
          var mode = o && /^(?:mf|fm|ff)$/.test(o.mode || '') ? o.mode : 'mf';
          var co = epOpt(CUR.S, T, U, mode, false, 'r18thick', CUR.mood);
          if (co && !noGen(T, U)) { co.ph = 'name'; EP().weave(arr, T, U, idx, co); CUR.ep = true; }
        } catch (e) { log({ kind: 'err', err: String(e && e.stack || e) }); }
        return r;
      };
      f._e3 = true;
      return cp(f, rw0);
    });
  }
  /* 段落の無い短い本文（人狼の小説調）：前戯の段だけを本文の前に（結腸は差さない） */
  function blockFore(S, T, U, mode, mood, body) {
    var E = EP();
    var co = epOpt(S, T, U, mode, false, 'block', mood);
    if (!co || !E.plan || !E.build) return body;
    var plan = E.plan(T, U, co);
    if (plan) plan.keys = plan.keys.filter(function (k) { return k !== 'colon'; });
    if (!plan || !plan.keys.length) { log({ kind: 'ep', src: 'block', scen: RUN.scen, keys: [], combo: comboOf(T, U, mode) }); return body; }
    var b = E.build(T, U, plan, co);
    if (!b.fore.length) return body;
    var fore = b.fore.slice(), own = ownPick('ep', { mode: mode, keys: plan.keys }, T, U, false, rngFor('own-blk', T, U));
    if (own) fore.push(own.text);
    var txt = fore.map(function (t) { return paint(t, T, U, 'name'); }).join('\n\n');
    log({ kind: 'ep', src: 'block', scen: RUN.scen, keys: plan.keys.slice(), combo: comboOf(T, U, mode), anat: plan.keys.every(function (k) { return E.anatOk(k, T, U, mode); }), hardTopU: hardTopU(T, U), trig: true, ero: false, aT: attOf(T, U), aU: attOf(U, T), text: txt });
    return txt + '\n\n' + body;
  }
  /* 能動性の型：名前を埋めた本文に差す（差した段は {a}{b} のまま来るので名前にする） */
  function iniName(S, T, U, mode, mood, t, src) {
    var I = INI();
    if (!I || !I.plan || !I.apply) return t;
    var own = (S && S.rng) || S, memo = own ? (own._iniMemo || (own._iniMemo = {})) : null;
    var pl = I.plan(S, T, U, { mode: mode, ero: false, drug: mood === 'drug', nth: nthOf(S, T, U), memo: memo, r: I.rngFor(T, U, t), seenHost: S && S.rng ? S : null });
    if (!pl) return t;
    var r = I.apply(t, pl, { place: RUN.scen, src: src });
    return r.replace(/\{a\}/g, T.name).replace(/\{b\}/g, U.name);
  }
  function story(S, x, y, opt, t, viaFF) {
    if (HK.SAFE_ON || typeof t !== 'string' || !t || !x || !y) return t;
    opt = opt || {};
    var Q = P(), od = Q.order ? Q.order(x, y, [x, y]) : [x, y], T = od[0], U = od[1];
    if (noGen(T, U)) return t;
    var LW = HK.Lewd, ero = !!(LW && LW.storyEro && LW.storyEro(S));
    var mood = opt.mood || '', scen = RUN.scen, mode = viaFF ? 'ff' : modeOf(T, U);
    /* 合意のない夜：人狼の強引な夜（mood rough）・邪神村の憑依（rough・short）。喉奥は本文の前、結腸は繋がった段の後ろ（段落がある本文だけ） */
    if (mood === 'rough' && !ero && (scen === 'jinro' || (scen === 'jashin' && opt.short))) {
      var fc = X3.force(T, U, mode, false, scen === 'jinro' ? 'jinro' : 'possess');
      if (!fc) return t;
      var sep = /\n\n/.test(t) || scen === 'jinro' ? '\n\n' : '';
      var ps = t.split('\n\n');
      if (fc.colon && ps.length >= 3) { ps.splice(1, 0, paint(fc.colon, T, U, 'name')); t = ps.join('\n\n'); }
      var pre = (fc.pre ? fc.pre + (sep ? '\n\n' : '') : '') + fc.throat;
      if (pre) t = paint(pre, T, U, 'name') + (sep || '') + t;
      return t;
    }
    if (mood === 'rough' || ero || hostile(T, U)) return t;
    var para = NAME_SCEN[scen] && HK.R18Thick && HK.R18Thick.on && HK.R18Thick.on(S) && /\n\n/.test(t);
    if (para) return iniName(S, T, U, mode, mood, t, 'R18Thick');
    if (scen === 'jinro') return blockFore(S, T, U, mode, mood, t);
    return t;
  }
  function installStory() {
    var R = HK.R18M, RT = HK.R18Thick;
    if (R && R.sex && !R._e3) {
      R._e3 = true;
      HK.wrap(R, 'sex', function (sex0) {
        return cp(function (S, x, y, opt) {
          if (HK.SAFE_ON || !MY[RUN.scen] || RUN.scen === 'ship') return sex0.apply(this, arguments);
          var prev = CUR; CUR = { S: S, mood: (opt && opt.mood) || '' };
          var t;
          try { t = sex0.apply(this, arguments); } finally { CUR = prev; }
          try { return story(S, x, y, opt, t, false); } catch (e) { log({ kind: 'err', err: String(e && e.stack || e) }); return t; }
        }, sex0);
      });
    }
    if (RT && RT.ff && !RT._e3) {
      RT._e3 = true;
      HK.wrap(RT, 'ff', function (ff0) {
        return cp(function (S, x, y, opt) {
          if (HK.SAFE_ON || !NAME_SCEN[RUN.scen]) return ff0.apply(this, arguments);
          var prev = CUR; CUR = { S: S, mood: (opt && opt.mood) || '' };
          var t;
          try { t = ff0.apply(this, arguments); } finally { CUR = prev; }
          try { return story(S, x, y, opt, t, true); } catch (e) { log({ kind: 'err', err: String(e && e.stack || e) }); return t; }
        }, ff0);
      });
    }
  }

  /* ---------- 敵対の強引なエッチ（HK.HateSex.scene）：繋がる段の前に喉奥、最中の段の後ろに結腸 ---------- */
  var MK1 = '⁣E3T⁣', MK2 = '⁣E3C⁣';
  function installHate() {
    var HS = HK.HateSex;
    if (!HS || !HS.scene || HS._e3) return;
    HS._e3 = true;
    HK.wrap(HS, 'scene', function (sc0) {
      return cp(function (x, a, b, opt) {
        if (HK.SAFE_ON || !HS.order || !HS.INSERT || !HS.BODY) return sc0.apply(this, arguments);
        var fc = null, o = HS.order(x, a, b), T = o[0], B = o[1];
        try {
          var LW = HK.Lewd, env = (opt && opt.env) || x.env || {}, ero = !!(LW && LW.ero && LW.ero(env));
          if (!(LW && LW.lv && LW.lv(env) === 'low') && !(opt && opt.low)) fc = X3.force(T, B, isF(T) ? (isF(B) ? 'ff' : 'fm') : 'mf', ero, 'HateSex');
        } catch (e) { fc = null; }
        if (!fc) return sc0.apply(this, arguments);
        var sub = hasF(B) ? 'mv' : 'ma', keep = [];
        var mark = function (tbl, k, f) { if (tbl && tbl[k]) { keep.push([tbl, k, tbl[k]]); tbl[k] = tbl[k].map(f); } };
        if (fc.throat) { mark(HS.INSERT, sub, function (s) { return MK1 + s; }); mark(HS.ERO_INSERT, sub, function (s) { return MK1 + s; }); }
        if (fc.colon) { mark(HS.BODY, 'm', function (s) { return s + MK2; }); mark(HS.ERO_BODY, 'm', function (s) { return s + MK2; }); }
        var r;
        try { r = sc0.apply(this, arguments); } finally { keep.forEach(function (k) { k[0][k[1]] = k[2]; }); }
        if (typeof r !== 'string') return r;
        var th = paint((fc.pre || '') + fc.throat, T, B, 'name'), co = paint(fc.colon, T, B, 'name');
        var done = { t: r.indexOf(MK1) >= 0, c: r.indexOf(MK2) >= 0 };
        r = r.replace(MK1, th).replace(MK2, co).split(MK1).join('').split(MK2).join('');
        if (X3.log && X3.log.length) { var lg = X3.log[X3.log.length - 1]; if (lg.kind === 'force') { lg.placed = { throat: !fc.throat || done.t, colon: !fc.colon || done.c }; lg.keys = lg.keys.filter(function (k) { return k === 'throat' ? done.t : done.c; }); } }
        return r;
      }, sc0);
    });
  }
  /* ---------- 恐怖・無関心の力ずくの夜（HK.ColdFear.R18.scene。出られない部屋の cf_room_r18 を含む） ---------- */
  function installCold() {
    var CF = HK.ColdFear, R = CF && CF.R18;
    if (!R || !R.scene || R._e3) return;
    R._e3 = true;
    HK.wrap(R, 'scene', function (sc0) {
      return cp(function (ctx, T, H) {
        var r = sc0.apply(this, arguments);
        if (HK.SAFE_ON || typeof r !== 'string' || !/\n\n/.test(r) || !T || !H) return r;
        try {
          var LW = HK.Lewd, env = (ctx && ctx.env) || {}, ero = !!(LW && LW.ero && LW.ero(env));
          var fc = X3.force(T, H, isF(T) ? (isF(H) ? 'ff' : 'fm') : 'mf', ero, 'ColdFear');
          if (!fc) return r;
          var ps = r.split('\n\n'), bi = ps.length >= 5 ? 2 : 1;
          if (fc.colon) ps.splice(bi + 1, 0, paint(fc.colon, T, H, 'name'));
          var pre = (fc.pre || '') + fc.throat;
          if (pre) ps.splice(bi, 0, paint(pre, T, H, 'name'));
          return ps.join('\n\n');
        } catch (e) { log({ kind: 'err', err: String(e && e.stack || e) }); return r; }
      }, sc0);
    });
  }

  /* ---------- 媚薬ロッカーの三人以上 ---------- */
  /* 狭いロッカーの中：寝台・寝転ぶ・体位を変える文は使わない */
  var LOCK_NG = /寝台|ベッド|シーツ|枕|敷布|仰向け|寝転|寝そべ|横たえ|寝かせ|四つん這い|押し倒/;
  function crowd(S) { return RUN.scen === 'locker' && S && S.P && S.P.length >= 3; }
  function lockIni(S, T, U, mode, ero, tag) {
    var I = INI();
    if (!I || !I.plan || !I.parts) return '';
    for (var k = 0; k < 4; k++) {
      var pl = I.plan(S, T, U, { mode: mode, ero: ero, drug: true, nth: nthOf(S, T, U), r: I.rngFor(T, U, tag + '|' + k + '|' + RUN.n), ini: { dev: false, lead: false } });
      if (!pl) { log({ kind: 'iniTry', why: tag + ':noplan' }); return ''; }
      if (pl.change === 'ride_b') pl.change = 'shift';
      if (pl.change === 'swap') { pl.change = ''; pl.why = ''; }
      if (!pl.react && !pl.change) { log({ kind: 'iniTry', why: tag + ':none' }); return ''; }
      var pp = I.parts(pl);
      if (pp.mid && !LOCK_NG.test(pp.mid)) {
        if (I.log) I.log.push({ a: T.name, b: U.name, mode: pl.mode, kind: pl.kind, kindU: pl.kindU, att: pl.att, attU: pl.attU, accT: pl.accT, accU: pl.accU, lead: pl.lead, lsty: '', bind: false, tresp: '', dev: '', pose: '', react: pl.react, change: pl.change, why: pl.why, ero: pl.ero, H: pl.H, place: 'locker', src: tag });
        log({ kind: 'iniTry', why: tag + ':ok' });
        return pp.mid;
      }
      log({ kind: 'iniTry', why: tag + ':ng' });
    }
    return '';
  }
  function lockEP(S, T, U, mode, ero) {
    var E = EP();
    if (!E || !E.plan || !E.build || hostile(T, U)) return '';
    var R = E.rngFor ? E.rngFor(T, U) : rngFor('lk', T, U);
    var co = { mode: mode, ero: ero, place: 'locker', heat: 'drug', nth: nthOf(S, T, U), lewd: HK.Lewd && HK.Lewd.lv ? HK.Lewd.lv(RUN.env || {}) : '', R: R };
    var plan = E.plan(T, U, co);
    if (plan) plan.keys = plan.keys.filter(function (k) { return k === 'nip' || k === 'colon'; });
    if (!plan || !plan.keys.length) { log({ kind: 'ep', src: 'crowd', scen: RUN.scen, keys: [], combo: comboOf(T, U, mode) }); return ''; }
    var b = E.build(T, U, plan, co);
    var ps = [];
    if (plan.keys.indexOf('nip') >= 0 && b.fore[0]) ps.push(b.fore[0]);
    if (plan.keys.indexOf('colon') >= 0 && b.mid.length) ps.push(b.mid[b.mid.length - 1]);
    else if (b.mid.length && plan.keys.indexOf('nip') >= 0) ps.push(b.mid[0]);
    var txt = ps.filter(function (t) { return t && !LOCK_NG.test(t); }).map(function (t) { return paint(t, T, U, 'name'); }).join('');
    log({ kind: 'ep', src: 'crowd', scen: RUN.scen, keys: txt ? plan.keys.slice() : [], combo: comboOf(T, U, mode), anat: plan.keys.every(function (k) { return E.anatOk(k, T, U, mode); }), hardTopU: hardTopU(T, U), trig: !!txt, ero: !!ero, aT: attOf(T, U), aU: attOf(U, T), text: txt });
    return txt;
  }
  function lockMode(T, U) { return isF(T) ? (isF(U) ? 'ff' : 'fm') : 'mf'; }
  function installLocker() {
    var T3 = HK.Trio3;
    if (!T3 || T3._e3 || !T3.pairTalk || !T3.begin) return;
    T3._e3 = true;
    /* 同じロッカーの二人が繋がっているあいだ（locker-crowd.js の contTurn が一度だけ呼ぶ。声を殺す hush の呼び出し） */
    HK.wrap(T3, 'pairTalk', function (p0) {
      return cp(function (S, top, bot, o) {
        var r = p0.apply(this, arguments);
        if (HK.SAFE_ON || !crowd(S) || !o || !o.hush || !top || !bot || hardTopU(top, bot) || noGen(top, bot)) return r;
        try {
          var ero = !!o.ero, mode = lockMode(top, bot);
          var ep = lockEP(S, top, bot, mode, ero), ini = lockIni(S, top, bot, mode, ero, 'crowd');
          var add = ep + (ini ? paint(ini, top, bot, 'name').replace(/\n+/g, '') : '');
          return add ? r + add : r;
        } catch (e) { log({ kind: 'err', err: String(e && e.stack || e) }); return r; }
      }, p0);
    });
    /* 三人の場面（locker-crowd.js の trioScene → HK.Trio3.begin）：最初の組（攻め→受け）に型の段 */
    HK.wrap(T3, 'begin', function (bg0) {
      return cp(function (S, sp, o) {
        var c = bg0.apply(this, arguments);
        if (HK.SAFE_ON || !c || typeof c.text !== 'function' || !crowd(S)) return c;
        var tx0 = c.text;
        c.text = function () {
          if (!this._e3) {
            this._e3 = true;
            try {
              var e = this.E && this.E[0], T = e && e[0], U = e && e[1];
              if (T && U && !hardTopU(T, U) && !noGen(T, U)) {
                var ini = lockIni(S, T, U, lockMode(T, U), !!this.ero, 'trio');
                if (ini) this.add('mid', paint(ini, T, U, 'name').replace(/\n+/g, ''), 1, '');
              }
            } catch (er) { log({ kind: 'err', err: String(er && er.stack || er) }); }
          }
          return tx0.apply(this, arguments);
        };
        return c;
      }, bg0);
    });
  }

  /* 物語型の箱庭では、場面の部品（エンジン型の ctx）が無いので、HK.EroTop.relOf(null, …) は前に回した別の箱庭の ctx を引いてしまう（回をまたいで結果が変わる）。
     物語型の回では、入力の関係（恋人・つがい・夫婦・本命＝lover、セフレ＝casual）から決める */
  var REL_L = { lover: 1, mate: 1, fated: 1, spouse: 1, honmei: 1 }, REL_C = { fwb: 1 };
  function storyRel(a, b) {
    var r = '';
    (RUN.ties || []).forEach(function (t) { if ((t.a === a.i && t.b === b.i) || (t.a === b.i && t.b === a.i)) { if (REL_L[t.type]) r = 'lover'; else if (REL_C[t.type] && !r) r = 'casual'; } });
    return r;
  }
  function installRel() {
    var ET = HK.EroTop;
    if (!ET || !ET.relOf || ET._e3) return;
    ET._e3 = true;
    HK.wrap(ET, 'relOf', function (r0) {
      return cp(function (S, a, b) {
        if (!S && MY[RUN.scen] && !HK.SAFE_ON) return a && b && a.i != null && b.i != null ? storyRel(a, b) : '';
        return r0.apply(this, arguments);
      }, r0);
    });
  }
  function install() {
    USED = {};
    installRel();
    installEP(); installIni(); installRW(); installStory(); installHate(); installCold(); installLocker();
  }
  install();
  if (HK.Load && HK.Load.onChunk) HK.Load.onChunk(install);
  HK.wrap(HK, 'simulate', function (sim0) {
    if (typeof sim0 !== 'function') return sim0;
    return cp(function () { USED = {}; return sim0.apply(this, arguments); }, sim0);
  });
})();
