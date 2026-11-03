/* @event-ok キスの描写の型の組み立て（HK.Kiss）。出来事そのものは kiss-events.js と追加パックの shinkon-kiss.js。2026-11-03 */
/* 箱庭シミュレーター: キスの描写の型（HK.Kiss）。両方のビルド（R18版は族のかたまり pack-lewd、全年齢版は pack-rel）
   一回のキスを、きっかけ（12 種）・長さ（短い＝1 段／中くらい＝2〜3 段／長い＝4〜6 段）・深さ（触れる・ついばむ・重ねる・深い）・場所（玄関・台所・ソファ・布団・外）・
   終わり方（照れて離れる・もう一回・名残惜しい・手をつなぐ／抱きしめる・お預け・時間に気づく・送り出す・そのまま夜へ（R18 だけ））で組む。文の表は kiss-text.js・kiss-text2.js（HK.KissText）。
   ■ HK.Kiss.plan(ctx, a, b, opt)  … 型を決める（{ trig, len, place, end, rel, top, bot, night }）。a・b はどちらが先でもよい（受け攻めは HK.Pos.order。攻めを選んだ人を受けにしない）
   ■ HK.Kiss.text(ctx, a, b, opt)  … 本文と型（{ text, plan, why, label }）。段は '\n\n' で区切る
   ■ HK.Kiss.scene(ctx, a, b, opt) … 本文を記録に一件出す（ctx.act2。cat は romance。opt.why・opt.fx・opt.mod を渡せる）。戻り値は記録か null
   ■ HK.Kiss.trio(ctx, a, b, c)    … 三人のキスの段 ／ HK.Kiss.seen(ctx, a, b, c, 'warm'|'jeal') … 三人目に見られる段
   opt：trig（きっかけ）・len（'s'|'m'|'l'）・place・end（終わり方を固定）・rel（'love'|'first'|'friend'|'feud'）・x・y（いってらっしゃい・おかえりの出かける人／帰った人と見送る人）・lead（始まりの段をこの文に替える。{a}{b}のまま）・tail（最後の段の後ろに足す文）・
        night（true：R18 で「そのまま夜へ」を候補にする）・promise（true：いってらっしゃいの「続きは帰ってから」を候補にする）・oazuke（お預けの起こりやすさに足す値）・long（長い版の起こりやすさの倍率）
   選び方：受けと攻めの態度 9 種・攻めの夜の性格（サド・意地悪はお預けが出やすい、甘々は長く、恥じらいは短くて照れる。全年齢は性格なし）・気分（HK.Emo の喜び・恥ずかしさ）・関係・きっかけ。
   一回の遊びの中で同じ文は二度出さない（ctx._kissU に使った回数を覚え、いちばん使っていない文から選ぶ）。乱数は ctx.rng。
   R18 の濃い文（舌・濡れた音）と「そのまま夜へ」は R18版の R18 のとき（!HK.SAFE_ON）だけ。HK.KISS_OFF が真なら、キスだけの場面の出来事を出さない（regress の比べ用）。
   エッチの入り方「キス」（HK.Play・play-text-r18.js の ENTRY.kiss）にも、同じ型の文を組んだ段を足す（R18版だけ）。設計は docs/reports/2026-11-03/kiss-design.md */
(function () {
  'use strict';
  var HK = window.HK;
  if (!HK) return;
  var K = HK.Kiss = HK.Kiss || {};
  function T() { return HK.KissText || {}; }
  var PK = ['proud', 'stern', 'tsun', 'gentle', 'devoted', 'cool', 'free', 'shy', 'polite'];
  function per(c) {
    var p = c && HK.Emo && HK.Emo.att ? HK.Emo.att(c) : c && c.persona;
    return PK.indexOf(p) >= 0 ? p : 'gentle';
  }
  K.per = per;
  /* 攻めの夜の性格（R18 で決めている人だけ。全年齢・おまかせは none） */
  function nightOf(a, b) {
    if (HK.SAFE_ON || !HK.Attr || !HK.Attr.nightKind) return 'none';
    var k = HK.Attr.nightKind(a, b);
    return /^(sadist|maso|mean|sweet|shy)$/.test(k) ? k : 'none';
  }
  K.nightOf = nightOf;
  function r18() { return !HK.SAFE_ON && !HK.SAFE_BUILD; }
  function order(a, b) { var o = HK.Pos && HK.Pos.order ? HK.Pos.order(a, b) : [a, b]; return o && o[0] && o[1] ? o : [a, b]; }
  /* 重みつきで一つ選ぶ（{ 値: 重み }） */
  function wpick(ctx, w) {
    var ks = Object.keys(w).filter(function (k) { return w[k] > 0; }), tot = 0;
    ks.forEach(function (k) { tot += w[k]; });
    if (!ks.length) return null;
    var r = ctx.rng() * tot;
    for (var i = 0; i < ks.length; i++) { r -= w[ks[i]]; if (r < 0) return ks[i]; }
    return ks[ks.length - 1];
  }
  /* 使っていない文から選ぶ（一回の遊びのあいだ。全部使ったら、使った回数の少ないものから） */
  function fresh(ctx, list) {
    if (!list || !list.length) return '';
    var U = ctx._kissU || (ctx._kissU = {}), m = Infinity, sub = [];
    list.forEach(function (t) { var n = U[t] || 0; if (n < m) { m = n; sub = [t]; } else if (n === m) sub.push(t); });
    var t = sub[Math.floor(ctx.rng() * sub.length)];
    U[t] = (U[t] || 0) + 1;
    return t;
  }
  K.fresh = fresh;
  function relOk(ctx, list, a, b) {
    if (!list) return [];
    if (HK.relFilter && a && b) { var r = HK.relFilter(ctx, list, a, b); if (r && r.length) return r; }
    return list;
  }
  function fill(ctx, t, a, b, c, ex) {
    t = String(t || '');
    if (ex) Object.keys(ex).forEach(function (k) { t = t.split('{' + k + '}').join(ex[k]); });
    return ctx.t ? ctx.t(t, a, b, c) : t.replace(/\{a\}/g, a.name).replace(/\{b\}/g, b.name).replace(/\{c\}/g, c ? c.name : '');
  }
  K.fill = fill;
  function emo(c, k) { var e = c && c.emo; return e ? e[k] || 0 : 0; }

  /* ---------- 型を決める ---------- */
  var TRIG_FREE = ['fui', 'naka', 'hobi', 'karakai', 'amae', 'kinen'];
  K.TRIG_FREE = TRIG_FREE;
  K.plan = function (ctx, a, b, opt) {
    opt = opt || {};
    var o = order(a, b), top = o[0], bot = o[1], X0 = T();
    var nt = nightOf(top, bot), pt = per(top), pb = per(bot);
    /* 濃い文（舌・濡れた音）と「そのまま夜へ」は、R18 のときで、二人が体の関係になってよい組だけ（R18に参加しない人・恋愛対象の合わない組などは HK.sexBlocked・HK.Pos.okSex） */
    var hot = r18() && !(HK.sexBlocked && HK.sexBlocked(top, bot)) && (!HK.Pos || !HK.Pos.okSex || HK.Pos.okSex(top, bot));
    var p = { top: top, bot: bot, night: nt, pt: pt, pb: pb, rel: opt.rel || 'love', hot: hot };
    if (p.rel !== 'love') return p;
    p.trig = opt.trig || wpick(ctx, { fui: 1.2, karakai: /^(sadist|mean)$/.test(nt) || pt === 'free' || pt === 'proud' ? 1 : 0.4, hobi: 0.6, amae: /^(devoted|free|shy|gentle)$/.test(pb) ? 0.8 : 0.4, kinen: 0.25 });
    p.place = opt.place || (X0.TRIG_PLACE || {})[p.trig] || null;
    /* 長さ */
    var wl = { s: 0.5, m: 0.35, l: 0.15 };
    var TL = { itte: [0.75, 0.17, 0.08], okaeri: [0.45, 0.35, 0.2], oyasumi: [0.45, 0.4, 0.15], neoki: [0.6, 0.3, 0.1], gochi: [0.55, 0.35, 0.1], amayadori: [0.35, 0.4, 0.25] }[p.trig];
    if (TL) wl = { s: TL[0], m: TL[1], l: TL[2] };
    if (nt === 'sweet') { wl.l *= 2.5; wl.m *= 1.3; }
    else if (nt === 'shy') { wl.s *= 1.8; wl.l *= 0.4; }
    else if (nt === 'sadist' || nt === 'mean') wl.m *= 1.3;
    if (pb === 'shy' || pt === 'shy') wl.s *= 1.3;
    if (emo(top, 'joy') > 40 || emo(bot, 'joy') > 40) wl.l *= 1.5;
    if (emo(bot, 'shame') > 40) wl.s *= 1.3;
    if (opt.long) wl.l *= opt.long;
    p.len = opt.len || wpick(ctx, wl);
    /* 終わり方 */
    var we = { tere: 1, again: 0.8, nagori: p.len === 'l' ? 1.6 : 0.6, hold: 1 };
    if (nt === 'shy' || pb === 'shy' || pb === 'tsun') we.tere *= 1.8;
    if (nt === 'sweet' || pb === 'devoted') { we.again *= 1.5; we.nagori *= 1.4; }
    if (!r18()) we.hold *= 1.3;
    var oz = nt === 'sadist' ? 0.45 : nt === 'mean' ? 0.4 : (pt === 'proud' || pt === 'free') ? 0.1 : 0.05;
    if (p.trig === 'karakai') oz += 0.3;
    if (opt.oazuke) oz += opt.oazuke;
    var rest = we.tere + we.again + we.nagori + we.hold;
    if (p.trig === 'itte') {
      /* いってらっしゃい：送り出すのが基本。長い版は時間に気づく（遅刻しそう）。お預けは「続きは帰ってから」 */
      we = { out: p.len === 'l' ? 0.4 : 2, tere: 0.4, again: p.len === 's' ? 0.3 : 0.2, late: p.len === 'l' ? 1.6 : p.len === 'm' ? 0.3 : 0, hold: 0.2 };
      rest = 0; Object.keys(we).forEach(function (k) { rest += we[k]; });
      if (opt.promise !== false) we.promise = rest * (oz + (p.len === 'l' ? 0.15 : 0.08)) / Math.max(0.05, 1 - oz);
    } else we.oazuke = rest * oz / Math.max(0.05, 1 - oz);
    if (opt.night && hot && p.len !== 's' && p.trig !== 'itte') we.night = rest * (nt === 'sweet' || nt === 'sadist' ? 0.35 : 0.22);
    p.end = opt.end || wpick(ctx, we);
    return p;
  };

  /* ---------- 段を組む ---------- */
  function lineA(ctx, p) {
    var A = (T().A_LINE || {})[p.pt] || T().A_LINE.gentle, nt = p.night;
    var l = (A[nt] || A.none || []).slice();
    if (nt !== 'none' && ctx.rng() < 0.3) l = A.none || l;
    return fresh(ctx, l);
  }
  function reactB(ctx, p) { var R = T().B_REACT || {}; return fresh(ctx, R[p.pb] || R.gentle); }
  function step(ctx, d, a, b, hot) {
    var X0 = T(), l = (X0.STEP || {})[d] || [];
    if (d === 'deep' && hot && r18() && X0.STEP_R18 && X0.STEP_R18.deep && ctx.rng() < 0.7) l = X0.STEP_R18.deep;
    return fresh(ctx, relOk(ctx, l, a, b));
  }
  function stepR(ctx, d, hot) { var X0 = T(); return hot && r18() && X0.STEP_R18 && X0.STEP_R18[d] ? fresh(ctx, X0.STEP_R18[d]) : ''; }
  function endText(ctx, p) {
    var X0 = T(), E = X0.END || {};
    if (p.end === 'oazuke') return fresh(ctx, (X0.OAZUKE_A || {})[p.pt] || X0.OAZUKE_A.gentle) + fresh(ctx, (X0.OAZUKE_B || {})[p.pb] || X0.OAZUKE_B.gentle);
    if (p.end === 'promise') return fresh(ctx, X0.ITTE_PROMISE || []);
    return fresh(ctx, E[p.end] || E.tere || []);
  }
  /* 本文（{a}＝攻め・{b}＝受け・{x}{y}＝いってらっしゃい・おかえりの出かける人／帰った人・見送る人。名前はここで当てる） */
  K.text = function (ctx, a, b, opt) {
    opt = opt || {};
    var p = opt.plan || K.plan(ctx, a, b, opt), X0 = T(), top = p.top, bot = p.bot, paras = [];
    var x = opt.x || bot, y = x === top ? bot : x === bot ? top : (opt.y || top);
    var ex = { x: x.name, y: y.name };
    if (p.rel === 'first' || p.rel === 'friend' || p.rel === 'feud') {
      var L0 = { first: X0.FIRST, friend: X0.FRIEND, feud: X0.FEUD }[p.rel];
      paras.push(fresh(ctx, relOk(ctx, L0, top, bot)));
    } else {
      var head = '';
      if (p.place && TRIG_FREE.indexOf(p.trig) >= 0 && X0.PLACE && X0.PLACE[p.place]) head = fresh(ctx, X0.PLACE[p.place]);
      var tr = fresh(ctx, relOk(ctx, (X0.TRIG || {})[p.trig] || X0.TRIG.fui, top, bot));
      var p1 = opt.lead != null ? opt.lead : head + tr;
      var oz = p.end === 'oazuke', last = endText(ctx, p);
      if (p.len === 's') {
        /* 短い：触れるだけ・ついばむの一段（お預けは、触れる前に止める） */
        if (!oz) p1 += step(ctx, ctx.rng() < 0.6 ? 'touch' : 'peck', top, bot);
        if (!oz && p.end !== 'promise' && ctx.rng() < 0.35) p1 += reactB(ctx, p);
        paras.push(p1 + last);
      } else if (p.len === 'm') {
        /* 中くらい：きっかけ → 深まる段（攻めの一言）→ 受けの反応と終わり方 */
        paras.push(p1);
        var p2 = step(ctx, ctx.rng() < 0.45 ? 'peck' : 'press', top, bot);
        if (ctx.rng() < 0.4) p2 += stepR(ctx, 'press', p.hot);
        if (ctx.rng() < 0.6) p2 += lineA(ctx, p);
        paras.push(p2);
        paras.push(reactB(ctx, p) + last);
      } else {
        /* 長い：きっかけ → 重ねる → 深い（攻めの一言）→ 息が上がる（受けの反応）→ 名残惜しい → 終わり方 */
        paras.push(p1);
        paras.push(step(ctx, 'press', top, bot) + fresh(ctx, (X0.LONG || {}).more));
        paras.push(step(ctx, 'deep', top, bot, p.hot) + lineA(ctx, p));
        paras.push(fresh(ctx, (X0.LONG || {}).iki) + reactB(ctx, p));
        if (p.end !== 'nagori' && p.end !== 'oazuke' && ctx.rng() < 0.75) paras.push(fresh(ctx, (X0.LONG || {}).nagori) + last);
        else paras.push(last);
      }
    }
    if (opt.tail && paras.length) paras[paras.length - 1] += opt.tail;
    var text = paras.filter(Boolean).map(function (s) { return fill(ctx, s, top, bot, null, ex); }).join('\n\n');
    return { text: text, plan: p, label: K.label(p), why: K.why(p, top, bot) };
  };
  var LEN_NAME = { s: '短い', m: '中くらい', l: '長い' };
  var END_NAME = { tere: '照れて離れる', again: 'もう一回', nagori: '名残惜しい', hold: '抱きしめて終わる', oazuke: 'お預け', promise: '続きは帰ってから', late: '遅刻しそう', out: '送り出す', night: 'そのまま夜へ' };
  var KISS_NAME = { itte: 'いってらっしゃいのキス', okaeri: 'おかえりのキス', oyasumi: 'おやすみのキス', neoki: '寝起きのキス', gochi: 'ごちそうさまのキス', fui: 'ふいのキス', naka: '仲直りのキス', hobi: 'ご褒美のキス', karakai: 'からかいのキス', amayadori: '雨宿りのキス', amae: 'おねだりのキス', kinen: 'お祝いのキス' };
  K.LEN_NAME = LEN_NAME; K.END_NAME = END_NAME; K.KISS_NAME = KISS_NAME;
  K.label = function (p) {
    if (p.rel === 'first') return '初めてのキス';
    if (p.rel === 'friend') return 'じゃれ合いのキス（事故）';
    if (p.rel === 'feud') return '顔が近づいてにらみ合う';
    return KISS_NAME[p.trig] || 'キス';
  };
  K.why = function (p, top, bot) {
    if (p.rel !== 'love') return K.label(p);
    return K.label(p) + '（' + LEN_NAME[p.len] + '・' + (END_NAME[p.end] || '') + (p.night !== 'none' && (p.end === 'oazuke' || p.end === 'promise') ? '・' + top.name + 'の夜の性格' : '') + '）';
  };
  /* 記録に出す */
  K.scene = function (ctx, a, b, opt) {
    opt = opt || {};
    var r = K.text(ctx, a, b, opt);
    if (!r.text) return null;
    var pre = opt.whyPre != null ? opt.whyPre : 'キスだけの触れ合い：';
    var o = { actors: opt.actors || [r.plan.top, r.plan.bot], cat: opt.cat || (r.plan.rel === 'friend' || r.plan.rel === 'feud' ? 'bond' : 'romance'), text: r.text, why: pre + r.why, fx: opt.fx };
    var e = ctx.act2 ? ctx.act2(o) : ctx.say(Object.assign({ kind: 'event' }, o));
    if (e) { e.kiss = { trig: r.plan.trig || r.plan.rel, len: r.plan.len || 's', end: r.plan.end || '', rel: r.plan.rel }; if (opt.tag) e.tag = opt.tag; }
    return e ? { e: e, plan: r.plan, text: r.text } : null;
  };
  /* 三人のキス・三人目に見られる版（名前はここで当てる） */
  K.trio = function (ctx, a, b, c) { return fill(ctx, fresh(ctx, T().TRIO || []), a, b, c); };
  K.trioT = function (ctx) { return fresh(ctx, T().TRIO || []); };
  K.seen = function (ctx, a, b, c, kind) { return fill(ctx, fresh(ctx, relOk(ctx, kind === 'jeal' ? T().SEEN_JEAL : T().SEEN_WARM, a, b) || []), a, b, c); };

  /* r18:begin */
  /* ---------- エッチの入り方「キス」（HK.Play）に、同じ型の文で組んだ段を足す（R18版だけ。乱数を使わない決まった組み合わせ） ----------
     ついばむ段 → 濃い段（舌）→ 攻めの一言。三つの組（mf・ff・fm）に共通の書き方なので、どの組にも同じ 6 本を足す */
  function playEntry() {
    var PT = HK.PlayText, X0 = T();
    if (K._playDone || !PT || !PT.ENTRY || !PT.ENTRY.kiss || !X0.STEP || !X0.STEP_R18) return;
    var AL = X0.A_LINE || {}, keys = ['gentle', 'proud', 'cool', 'devoted', 'free', 'polite'], add = [];
    for (var i = 0; i < 6; i++) {
      var pk = X0.STEP.peck[i % X0.STEP.peck.length], dp = X0.STEP_R18.deep[i % X0.STEP_R18.deep.length];
      var al = ((AL[keys[i]] || {}).none || [])[i % 2];
      if (pk && dp && al) add.push(pk + dp + al);
    }
    ['mf', 'ff', 'fm'].forEach(function (m) { var l = PT.ENTRY.kiss[m]; if (Array.isArray(l)) add.forEach(function (t) { l.push(t); }); });
    K._playDone = true;
  }
  playEntry();
  /* r18:end */
})();
