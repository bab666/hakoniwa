/* 新婚生活：三人婚・四人婚の組み立て（両方のビルド。2026-11-04 不具合リスト 1104 の NO 1・2）
   ■ 利用者の指摘：三人・四人の全員を「新婚の夫婦」にしても、攻めどうし・受けどうしの組があると三人婚・四人婚にならず、上の二人の暮らし（「〜の同居の7日」・二人のキス・二人用の導入）になっていた。
     三人目・四人目もほとんど出なかった。→ 全員が配偶者なら全員が夫婦。恋の相手どうしでない組（攻めどうし・受けどうし・恋愛対象の合わない組）は夫婦の関係（恋愛：なし）にし、
     生まれる気持ちは恋愛より下（友人のよう・張り合う・互いを邪魔に思う。性格と態度で選ぶ）。恋愛の出来事（告白・やきもち・デート）はその組には出さない
   ■ HK.ShinkonMulti（M）
     ・M.setup(ctx, S)：恋の相手の組（S.lp）・恋の相手どうしでない組（S.nl[組]＝{ kind: nl|kin, mood }）・家の形（S.shape＝{ k: full|v|star|cycle|part, hub, cyc }）
     ・M.start(ctx, S)：一区切り目の値（恋の相手の組はどれも同じだけ近づける。恋の相手どうしでない組は気持ちの種類で）
     ・M.focus(ctx, S, d)：その日の二人（S.A・S.B）とほかの人（S.C・S.D）。体調を崩した人と看る人の日はその二人、ほかは家にいる組のうち、これまでの出番の少ない人の組（恋の相手の組を少し優先。大事な日・最後の日は恋の相手の組だけ）。
       その日の二人が恋の相手どうしでなければ S.love・S.wed を偽にする（恋愛・結婚の語の文を外す）
     ・M.order(ctx, S, list)：三人・四人の文に名前を当てる順（v・star は真ん中の人を {a}、cycle は輪の順）
     ・M.lovePair(ctx, S, day)：その日の二人が恋の相手どうしでない夜の、夜の場面の二人（家にいる恋の相手の組）
     ・M.partner(ctx, S, x, list)：x の恋の相手（list の中から）
     ・M.intro(ctx, S, home)：三人・四人の始まりの段（全員が知り合い／一部／ほとんど知らない × 結婚のいきさつ（形）＋恋の相手どうしでない組の一文）
     ・M.nlDay(ctx, S, day)：その日の二人が恋の相手どうしでない日の、二人の一幕（気持ちの種類で）
     ・M.kiss(ctx, S)：最後の夜の幸せなキス（三人・四人。どの組も恋の相手なら今までの文、混ざる家は恋の相手の組だけが口づける文）
   台詞は3本。登場人物はすべて成人として扱う */
/* @event scen=set-b-shinkon id=sk_multi_nl cat=bond tie=- cond=三人婚・四人婚で恋の相手どうしでない伴侶の日 label=恋の相手でない伴侶どうしの一幕 */
(function () {
  'use strict';
  var HK = window.HK;
  if (!HK) return;
  var M = HK.ShinkonMulti = {};
  function SK() { return HK.Shinkon; }
  function MT() { return HK.ShinkonMultiText || {}; }
  function LF() { return HK.Life; }
  function pk(ctx, arr) { return arr && arr.length ? arr[Math.floor(ctx.rng() * arr.length)] : null; }
  function shuffle(ctx, arr) { var a = arr.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(ctx.rng() * (i + 1)), t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
  function key(a, b) { return a.i < b.i ? a.i + '-' + b.i : b.i + '-' + a.i; }
  function holiday(d) { return d % 7 === 5 || d % 7 === 6; }
  function names(L0) { return L0.map(function (c) { return c.name; }).join('と'); }
  M.key = key;
  M.multi = function (S) { return !!(S && (S.trio || S.quad)); };
  M.love = function (ctx, S, x, y) { return !!(x && y && x !== y && !(S.nl && S.nl[key(x, y)]) && SK().canLove2(ctx, x, y)); };
  function pairsOf(T) { var P = []; for (var i = 0; i < T.length; i++) for (var j = i + 1; j < T.length; j++) P.push([T[i], T[j]]); return P; }
  /* 恋の相手どうしでない二人の気持ち：嫉妬深い・張り合う気質・態度で */
  function moodOf(ctx, x, y) {
    var tx = x.tr || {}, ty = y.tr || {}, px = SK().per(x), py = SK().per(y);
    var jea = Math.max(tx.jealous || 0.4, ty.jealous || 0.4), cp = ((tx.cp || 0.5) + (ty.cp || 0.5)) / 2;
    var W = [['tomo', 1 + ((tx.warmth || 0.5) + (ty.warmth || 0.5)) * 0.6 + (/gentle|devoted|free/.test(px) ? 0.3 : 0) + (/gentle|devoted|free/.test(py) ? 0.3 : 0)],
      ['rival', 0.3 + cp * 1.1 + (/proud|stern/.test(px) ? 0.35 : 0) + (/proud|stern/.test(py) ? 0.35 : 0)],
      ['jama', 0.2 + Math.max(0, jea - 0.4) * 2 + (/tsun|cool/.test(px) ? 0.25 : 0) + (/tsun|cool/.test(py) ? 0.25 : 0)]];
    return HK.weighted(ctx.rng, W, function (w) { return w[1]; })[0];
  }
  M.setup = function (ctx, S) {
    var T = S.spouses, NL0 = ctx._skNL || {};
    S.nl = {}; S.lp = [];
    pairsOf(T).forEach(function (p) {
      var k = key(p[0], p[1]);
      if (NL0[k] || !SK().canLove2(ctx, p[0], p[1])) S.nl[k] = { kind: NL0[k] === 'kin' ? 'kin' : 'nl', x: p[0], y: p[1], mood: NL0[k] === 'kin' ? 'kin' : moodOf(ctx, p[0], p[1]) };
      else S.lp.push(p);
    });
    var deg = {}; T.forEach(function (c) { deg[c.i] = 0; });
    S.lp.forEach(function (p) { deg[p[0].i]++; deg[p[1].i]++; });
    var n = T.length, E = S.lp.length, sh = { k: 'part', hub: null, cyc: null };
    if (E === n * (n - 1) / 2) sh.k = 'full';
    else if (n === 3 && E === 2) { sh.k = 'v'; sh.hub = T.filter(function (c) { return deg[c.i] === 2; })[0]; }
    else if (n === 4 && E === 3 && T.some(function (c) { return deg[c.i] === 3; })) { sh.k = 'star'; sh.hub = T.filter(function (c) { return deg[c.i] === 3; })[0]; }
    else if (n === 4 && E === 4 && T.every(function (c) { return deg[c.i] === 2; })) {
      /* 輪の順：a-b・b-c・c-d・d-a が恋の相手 */
      var a = T[0], nb = T.filter(function (c) { return c !== a && !S.nl[key(a, c)]; }), b = nb[0], d = nb[1], c = T.filter(function (x) { return x !== a && x !== b && x !== d; })[0];
      sh.k = 'cycle'; sh.cyc = [a, b, c, d];
    }
    S.shape = sh;
    S.full = sh.k === 'full';
  };
  /* 一区切り目の値：恋の相手の組はどれも同じだけ（以前は上の二人だけが近づいていた）、恋の相手どうしでない組は気持ちの種類で */
  var MOOD_MOD = { tomo: { aff: 10, trust: 15 }, rival: { aff: -50, ten: 52, trust: -15 }, jama: { aff: -60, ten: 40, trust: -20 }, kin: { aff: 5, trust: 5 } };
  M.start = function (ctx, S) {
    S.lp.forEach(function (p) { ctx.mod2(p[0], p[1], { aff: 45, trust: 35, att: 45 }, { aff: 45, trust: 35, att: 45 }); });
    Object.keys(S.nl).forEach(function (k) { var x = S.nl[k], m = MOOD_MOD[x.mood] || MOOD_MOD.tomo; ctx.mod2(x.x, x.y, m, m); });
  };
  /* 二人に共通の恋の相手（いなければ null） */
  function hubOf(ctx, S, x, y) {
    var h = S.spouses.filter(function (c) { return c !== x && c !== y && M.love(ctx, S, c, x) && M.love(ctx, S, c, y); });
    return h.length ? h[Math.floor(ctx.rng() * h.length)] : null;
  }
  M.partner = function (ctx, S, x, list) {
    var L0 = (list || S.spouses).filter(function (c) { return c !== x && M.love(ctx, S, x, c); });
    return pk(ctx, L0);
  };
  /* ---------- その日の二人 ---------- */
  M.focus = function (ctx, S, d) {
    var T = S.spouses, hol = holiday(d), k = S.sick, cnt = S.fcnt = S.fcnt || {}, pair = null, CL = HK.ShinkonCal;
    T.forEach(function (c) { if (cnt[c.i] == null) cnt[c.i] = 0; });
    if (k && !k.done && d <= k.last + 1 && k.carer) pair = [k.c, k.carer];
    else {
      var last = d === S.days - 1, home = last ? T : T.filter(function (c) { return !LF().day(ctx, c, d, hol).trip; });
      var P = pairsOf(home.length >= 2 ? home : T);
      var key0 = last || (CL && S.cal && CL.keyDay(S, d));
      var PL = P.filter(function (p) { return M.love(ctx, S, p[0], p[1]); });
      if (key0 && PL.length) P = PL;
      var best = null, bs = 1e9;
      P.forEach(function (p) {
        var s = cnt[p[0].i] + cnt[p[1].i] + (M.love(ctx, S, p[0], p[1]) ? 0 : 0.9) + ctx.rng() * 0.6;
        if (s < bs) { bs = s; best = p; }
      });
      pair = ctx.rng() < 0.5 ? [best[0], best[1]] : [best[1], best[0]];
    }
    cnt[pair[0].i]++; cnt[pair[1].i]++;
    S.A = pair[0]; S.B = pair[1];
    var rest = T.filter(function (c) { return c !== S.A && c !== S.B; });
    S.C = rest[0] || null; S.D = rest[1] || null;
    S.love = M.love(ctx, S, S.A, S.B); S.wed = S.love;
    S.nlDayN = S.nlDayN || 0;
  };
  /* ---------- 名前を当てる順 ---------- */
  M.order = function (ctx, S, list) {
    var L0 = (list || S.spouses).slice(), sh = S.shape || {};
    if (sh.k === 'cycle' && L0.length === 4) { var c = sh.cyc.slice(), r = Math.floor(ctx.rng() * 4); c = c.slice(r).concat(c.slice(0, r)); return ctx.rng() < 0.5 ? c : [c[0]].concat(c.slice(1).reverse()); }
    if ((sh.k === 'v' || sh.k === 'star') && L0.indexOf(sh.hub) >= 0) return [sh.hub].concat(shuffle(ctx, L0.filter(function (x) { return x !== sh.hub; })));
    if (sh.k === 'part' && L0.length >= 3) {
      /* 恋の相手の組を {a}{b} に */
      var o = shuffle(ctx, L0), p = null;
      for (var i = 0; i < o.length && !p; i++) for (var j = i + 1; j < o.length && !p; j++) if (M.love(ctx, S, o[i], o[j])) p = [o[i], o[j]];
      if (p) return p.concat(o.filter(function (x) { return p.indexOf(x) < 0; }));
      return o;
    }
    return shuffle(ctx, L0);
  };
  /* その日の二人が恋の相手どうしでない夜の、夜の場面の二人（家にいる恋の相手の組のうち、夜の少ない組） */
  M.lovePair = function (ctx, S, day, homeFn) {
    var P = (S.lp || []).filter(function (p) { return homeFn(p[0]) && homeFn(p[1]) && (!HK.PairR18 || HK.PairR18.sexOk(ctx, p[0], p[1])); });
    if (!P.length) return null;
    var sc = S.pairSex = S.pairSex || {};
    P.sort(function (x, y) { return (sc[key(x[0], x[1])] || 0) - (sc[key(y[0], y[1])] || 0) || ctx.rng() - 0.5; });
    return P[0];
  };
  M.sexed = function (S, a, b) { var sc = S.pairSex = S.pairSex || {}, k = key(a, b); sc[k] = (sc[k] || 0) + 1; };
  /* ---------- 始まりの段 ---------- */
  function fillN(ctx, t, a, b, ex) { return SK().fill(ctx, t, a, b, ex); }
  M.intro = function (ctx, S, home) {
    var T = S.spouses, n = T.length, MX = MT(), all = n === 4 ? '四人' : '三人';
    var orig = (ctx.input && (ctx.input._skOrig || ctx.input.ties)) || [];
    var known = [], newp = [];
    pairsOf(T).forEach(function (p) {
      var o = orig.filter(function (t) { return t && HK.TIES[t.type] && t.type !== 'noobs' && ((t.a === p[0].i && t.b === p[1].i) || (t.a === p[1].i && t.b === p[0].i)); });
      if (o.length) known.push(p[0].name + 'と' + p[1].name + '（' + (HK.tieLabel ? HK.tieLabel(o[0]) : HK.TIES[o[0].type].label) + '）');
      else newp.push(p[0].name + 'と' + p[1].name);
    });
    var kk = !newp.length ? 'all' : !known.length ? 'none' : 'some';
    var o = M.order(ctx, S), sh = S.shape || {}, ex = { all: all, names: names(T), home: home, known: known.join('、'), newp: newp.length > 2 ? 'ほかの組' : newp.join('、'), c: o[2] ? o[2].name : '', d: o[3] ? o[3].name : '' };
    if (sh.hub) { ex.h = sh.hub.name; ex.arms = names(T.filter(function (c) { return c !== sh.hub; })); }
    var KN = (n === 4 ? MX.KNOW4 : MX.KNOW3) || {}, W = MX.WHY || {};
    var t1 = SK().pickT(ctx, KN[kk] || [], o[0], o[1]), t2 = SK().pickT(ctx, W[sh.k] || W.part || [], o[0], o[1]);
    var tx = (t1 ? fillN(ctx, t1, o[0], o[1], ex) : '') + (t2 ? fillN(ctx, t2, o[0], o[1], ex) : '');
    /* 恋の相手どうしでない組の一文 */
    Object.keys(S.nl).forEach(function (k) {
      var x = S.nl[k], E = (MX.NL || {})[x.mood] || {}, h = hubOf(ctx, S, x.x, x.y);
      var t = SK().pickT(ctx, h && E.introH ? E.introH : E.intro, x.x, x.y);
      if (t) tx += '\n\n' + fillN(ctx, t, x.x, x.y, { h: h ? h.name : '' });
    });
    return tx;
  };
  /* ---------- 恋の相手どうしでない伴侶の日の一幕 ---------- */
  M.nlDay = function (ctx, S, day) {
    var A = S.A, B = S.B, x = S.nl && S.nl[key(A, B)];
    if (!x || day.sick || day.apart || day.nlDone) return null;
    day.nlDone = true;
    var E = (MT().NL || {})[x.mood] || {}, h = hubOf(ctx, S, A, B);
    if (h && !(day.ph ? HK.ShinkonFour && HK.ShinkonFour.at(S, day, h, 'd') : true)) h = null;
    var t = SK().pickT(ctx, h && E.dayH ? E.dayH : E.day, A, B);
    if (!t) return null;
    var act = [A, B].concat(h ? [h] : []);
    var e = ctx.act2({ actors: act, cat: 'bond', text: fillN(ctx, t, A, B, { h: h ? h.name : '' }), why: '新婚生活：恋の相手でない伴侶どうしの一幕（' + A.name + 'と' + B.name + '・' + (MT().MOOD || {})[x.mood] + '）',
      fx: function () { var m = x.mood === 'tomo' || x.mood === 'kin' ? { aff: 2, trust: 2 } : { ten: 2, aff: -1 }; ctx.mod2(A, B, m, m); } });
    if (e) S.nlDayN++;
    return e;
  };
  /* ---------- 最後の夜のキス ---------- */
  /* 最後の夜のキス（2026-11-04 利用者の回答「恋愛もする組み合わせの全員がキスすべき」）：恋の相手の組（S.lp）のすべてが口づける。
     口づけるのは受けの側（HK.Pos.order の後ろ）で、恋の相手の多い人（受けの中心）から順に。文は口づける人の態度 9 種（edgeP）。
     恋の相手でない組（攻めどうし・受けどうし）は口づけない（拳を合わせる・肩を叩く・乾杯・目を合わせる。NL[気持ち].kiss） */
  M.kiss = function (ctx, S) {
    var T = S.spouses, MX = MT(), K = MX.KISS || {}, all = T.length === 4 ? '四人' : '三人', P = HK.Pos;
    var deg = {}; T.forEach(function (c) { deg[c.i] = 0; }); S.lp.forEach(function (p) { deg[p[0].i]++; deg[p[1].i]++; });
    var E = S.lp.map(function (p) {
      var o = P && P.order ? P.order(p[0], p[1]) : p, x = o[1], y = o[0];
      if (!P || !P.order) { if (deg[p[1].i] > deg[p[0].i]) { x = p[1]; y = p[0]; } else { x = p[0]; y = p[1]; } }
      return [x, y];
    });
    E.sort(function (u, v) { return (deg[v[0].i] - deg[u[0].i]) || (u[0].i - v[0].i); });
    var used = {}, parts = [], open = pk(ctx, K.open) || '';
    var eds = E.map(function (p) {
      var x = p[0], y = p[1], EP = (K.edgeP || {})[SK().per(x)] || K.edge || [];
      var L0 = EP.filter(function (t) { return !used[t]; }), t = pk(ctx, L0.length ? L0 : EP);
      used[t] = 1;
      return t.split('{x}').join(x.name).split('{y}').join(y.name);
    });
    parts.push(fillN(ctx, open.split('{all}').join(all) + eds.join('。') + '。', T[0], T[1]));
    Object.keys(S.nl).forEach(function (k) {
      var x = S.nl[k], L1 = ((MX.NL || {})[x.mood] || {}).kiss;
      var t = SK().pickT(ctx, L1 || [], x.x, x.y);
      if (t) parts.push(fillN(ctx, t, x.x, x.y));
    });
    parts.push(fillN(ctx, (pk(ctx, K.close) || '').split('{all}').join(all), T[0], T[1]));
    S.kissPairs = E.map(function (p) { return [p[0].i, p[1].i]; });
    return !!ctx.act2({ actors: T.slice(), cat: 'romance', text: parts.join(''), why: '新婚生活：最後の夜（' + all + 'の幸せなキス）',
      fx: function () { S.lp.forEach(function (p) { ctx.mod2(p[0], p[1], { aff: 5, att: 5 }, { aff: 5, att: 5 }); }); } });
  };
  M.mood = function (S, a, b) { var x = S && S.nl && S.nl[key(a, b)]; return x ? x.mood : ''; };
  M.MOOD = function () { return MT().MOOD || {}; };
})();
