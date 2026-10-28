/* 箱庭診断: 派閥の形成・離合集散・独裁（クラスメイト／無人島） */
(function () {
  'use strict';
  var HK = window.HK;
  var F = (HK.Factions = {});
  function R(ctx, a, b) { return ctx.R(a, b); }
  function names(list) { return list.map(function (c) { return c.name; }).join('・'); }

  F.REGIME = {
    none: '派閥なし', single: '一大グループ＋はぐれ者', two: '二大派閥', three: '三つ巴', multi: '群雄割拠', dictator: '独裁'
  };

  /* 派閥の設定（全体の環境値 HK.GLOBAL_ENV。fac:1 は派閥のある箱庭＝無人島・クラスメイトだけに出す。ui.js の genv）
     ・facMode 派閥の決め方：auto 自動（今までどおり）／fix 「仲間とみなす」グループで固定／none 派閥は生まれない
     ・facLead リーダーの決め方：auto 自動（主導性と信頼。下克上もある）／CP・NP・A・FC・AC その値が最も高い人（交代しない）
     既定の値（def）は置かない：選ばれていないときは結果の env に欄が出ない（JSON に入らない）ので、今までの結果・指紋と変わらない。
     画面のセレクトは値が無いとき先頭（自動）を出す */
  var FAC_ENV = [
    { id: 'facMode', label: '派閥の決め方', type: 'select', fac: 1, options: [
      { v: 'auto', label: '自動（関係と気質で生まれ、入れ替わる）' },
      { v: 'fix', label: '「仲間とみなす」グループで固定' },
      { v: 'none', label: '派閥は生まれない' }
    ], desc: '固定：住人タブのグループ見出しで「仲間とみなす」を入れたグループが、そのまま派閥になります（人数の設定は見ません。抜ける・鞍替え・解散は起きず、死亡・退場だけ反映。仲間のグループが無ければ自動と同じ）。無人島・クラスメイトで共通' },
    { id: 'facLead', label: '派閥のリーダー', type: 'select', fac: 1, options: [
      { v: 'auto', label: '自動（主導性と信頼。下克上もある）' },
      { v: 'CP', label: 'CP（厳しさ）が最も高い人' },
      { v: 'NP', label: 'NP（優しさ）が最も高い人' },
      { v: 'A', label: 'A（冷静さ）が最も高い人' },
      { v: 'FC', label: 'FC（自由さ）が最も高い人' },
      { v: 'AC', label: 'AC（協調性）が最も高い人' }
    ], desc: '気質を選ぶと、派閥の中でその値が最も高い人がリーダーになり、下克上（リーダー交代）は起きません（リーダーが死亡・退場したときだけ次の人へ）。無人島・クラスメイトで共通' }
  ];
  if (HK.GLOBAL_ENV && !HK.GLOBAL_ENV.some(function (e) { return e.id === 'facMode'; })) {
    if (HK.addTo) HK.addTo(HK.GLOBAL_ENV, FAC_ENV); else Array.prototype.push.apply(HK.GLOBAL_ENV, FAC_ENV);
  }
  function facMode(ctx) { var v = ctx.env && ctx.env.facMode; return v === 'fix' || v === 'none' ? v : 'auto'; }
  function facLead(ctx) { var v = ctx.env && ctx.env.facLead; return /^(CP|NP|A|FC|AC)$/.test(v || '') ? v : ''; }
  F.mode = facMode; F.leadBy = facLead;
  /* 気質の値で最も高い人（同点は主導性、さらに同点は番号の小さい人）。乱数は使わない */
  function topBy(ctx, mem, k) {
    var C = ctx.chars;
    return mem.slice().sort(function (x, y) { return ((C[y].eg && C[y].eg[k]) || 0) - ((C[x].eg && C[x].eg[k]) || 0) || C[y].tr.lead - C[x].tr.lead || x - y; })[0];
  }
  function leadFirst(g, L) { g.leader = L; g.members = [L].concat(g.members.filter(function (m) { return m !== L; })); return g; }
  /* 「仲間とみなす」グループ（関係 comrade が全員どうしに付いた輪）を、はじめの住人の並びから組み立てる。
     一人が二つのグループに入っているときは、先に見つかったほうに入れる（派閥は一人一つ） */
  function comradeGroups(ctx) {
    if (ctx._facCG) return ctx._facCG;
    var C = ctx.chars, T = HK.Ties, used = {}, out = [];
    var co = function (a, b) { return !!(T && T.has && T.has(ctx, a, b, 'comrade')); };
    for (var i = 0; i < C.length; i++) {
      if (used[i]) continue;
      var g = [i];
      for (var j = i + 1; j < C.length; j++) {
        if (used[j]) continue;
        if (g.every(function (m) { return co(C[m], C[j]); })) g.push(j);
      }
      if (g.length >= 2) { g.forEach(function (m) { used[m] = 1; }); out.push(g); }
    }
    return (ctx._facCG = out);
  }
  /* 固定：グループの顔ぶれはそのまま（いま居る人だけ）。リーダーは気質の指定、なければ主導性（下克上の印 flags.leader と前のリーダーを優先） */
  function evalFixed(ctx, P, cg, prev) {
    var lt = facLead(ctx), here = {}, prevL = {};
    P.forEach(function (c) { here[c.i] = 1; });
    (prev && prev.groups || []).forEach(function (g) { if (g.gid != null) prevL[g.gid] = g.leader; });
    var groups = [];
    cg.forEach(function (mem, k) {
      var m = mem.filter(function (x) { return here[x]; });
      if (m.length < 2) return;
      var C = ctx.chars, L = lt ? topBy(ctx, m, lt) : m.slice().sort(function (x, y) {
        var sc = function (z) { return C[z].tr.lead * 100 + (C[z].flags.leader ? 50 : 0) + (prevL[k] === z ? 15 : 0); };
        return sc(y) - sc(x) || x - y;
      })[0];
      groups.push(leadFirst({ leader: L, members: m, gid: k }, L));
    });
    groups.sort(function (a, b) { return b.members.length - a.members.length || a.gid - b.gid; });
    return finish(ctx, P, groups, '「仲間とみなす」グループのまま（派閥は固定）');
  }

  function bond(ctx, o, L, prevLeader) {
    var r = R(ctx, o, L);
    return r.trust * 0.6 + r.aff * 0.4 + L.tr.lead * 18 - r.ten * 0.5 + (prevLeader === L.i ? 10 : 0) + (L.flags.leader ? 8 : 0);
  }
  function pull(ctx, L, P) {
    var s = 0;
    P.forEach(function (o) { if (o !== L) s += Math.max(0, bond(ctx, o, L, null)); });
    return s;
  }

  /* 現在の関係から派閥構造を算出 */
  F.evaluate = function (ctx) {
    var P = ctx.present(), th = ctx.env.faction || 4, prev = ctx.fac || { of: {} };
    var mode = facMode(ctx);
    if (mode === 'none') return { regime: 'none', reason: '派閥は生まれない設定', groups: [], loners: P.map(function (c) { return c.i; }), of: {} };
    if (mode === 'fix') { var cg = comradeGroups(ctx); if (cg.length) return evalFixed(ctx, P, cg, ctx.fac); }
    if (P.length < th) {
      return { regime: 'none', reason: 'いま残っているのは' + P.length + '人。派閥に分かれるには少なすぎる（' + th + '人以上で派閥が生まれる設定）', groups: [], loners: P.map(function (c) { return c.i; }), of: {} };
    }
    var cands = P.filter(function (c) { return c.tr.lead > 0.42 || c.flags.leader; });
    if (!cands.length) {
      return { regime: 'none', reason: '人を引っぱる気質（CP・A高、AC低）の持ち主がいない。輪はできても派閥にはならない', groups: [], loners: P.map(function (c) { return c.i; }), of: {} };
    }
    var pw = {};
    cands.forEach(function (L) { pw[L.i] = pull(ctx, L, P) * (0.6 + L.tr.lead); });
    var join = {};
    P.forEach(function (o) {
      var best = null, bv = P.length > 12 ? 16 : 24;
      cands.forEach(function (L) {
        if (L === o) return;
        var v = bond(ctx, o, L, prev.of[o.i]);
        /* 主導性のある人でも、自分より求心力のある相手には補佐として付きやすい（NP・ACが高いほど、二番手に収まる） */
        if (cands.indexOf(o) >= 0) { if (pw[L.i] <= pw[o.i] * 1.2 || v + o.tr.np * 14 + o.tr.ac * 10 - o.tr.cp * 10 < 36) return; }
        if (v > bv) { bv = v; best = L; }
      });
      if (best) join[o.i] = best.i;
    });
    /* 連鎖をたどって頂点のリーダーへ */
    function root(i) { var seen = {}; while (join[i] != null && !seen[i]) { seen[i] = 1; i = join[i]; } return i; }
    var groupsBy = {};
    P.forEach(function (o) {
      if (join[o.i] == null) return;
      var r = root(o.i);
      (groupsBy[r] = groupsBy[r] || []).push(o.i);
    });
    var groups = Object.keys(groupsBy).map(function (k) { return { leader: +k, members: [+k].concat(groupsBy[k].filter(function (x) { return x !== +k; })) }; })
      .filter(function (g) { return g.members.length >= 2; })
      .sort(function (a, b) { return b.members.length - a.members.length; });
    /* 派閥は基本2〜3つ。4つ目以降の小さな輪は、近い派閥に吸収されるか、ばらけて無所属になる */
    var maxG = P.length >= 9 ? 3 : P.length >= 5 ? 3 : 2;
    while (groups.length > maxG) {
      var sm = groups.pop();
      sm.members.forEach(function (m) {
        var o = ctx.chars[m], best = null, bv = 30;
        groups.forEach(function (g) { var v = bond(ctx, o, ctx.chars[g.leader], prev.of[m]) + (m === sm.leader ? o.tr.np * 10 + o.tr.ac * 8 - o.tr.cp * 10 : 0); if (v > bv) { bv = v; best = g; } });
        if (best) best.members.push(m);
      });
      groups.sort(function (a, b) { return b.members.length - a.members.length; });
    }
    /* 一つの大きな輪しかないとき：そこに馴染めない側に、もう一人の中心ができやすい */
    if (groups.length === 1 && P.length >= 5) {
      var G0 = groups[0], L0 = ctx.chars[G0.leader];
      var rv = cands.filter(function (c) { return c !== L0 && pw[c.i] >= pw[L0.i] * 0.4; }).sort(function (x, y) { return (R(ctx, y, L0).ten - R(ctx, y, L0).trust + pw[y.i] / 20) - (R(ctx, x, L0).ten - R(ctx, x, L0).trust + pw[x.i] / 20); })[0];
      if (rv && R(ctx, rv, L0).trust < 35) {
        var side = P.filter(function (o) { return o !== L0 && o !== rv && bond(ctx, o, rv, prev.of[o.i]) > Math.max(20, bond(ctx, o, L0, prev.of[o.i]) - 4); });
        if (side.length) {
          G0.members = G0.members.filter(function (m) { return m !== rv.i && side.indexOf(ctx.chars[m]) < 0; });
          groups.push({ leader: rv.i, members: [rv.i].concat(side.map(function (o) { return o.i; })) });
          groups = groups.filter(function (g) { return g.members.length >= 2; }).sort(function (a, b) { return b.members.length - a.members.length; });
        }
      }
    }
    /* リーダーを気質で決める設定：輪の顔ぶれはそのままで、頭だけ指定の気質が最も高い人に */
    var lt = facLead(ctx);
    if (lt) groups.forEach(function (g) { leadFirst(g, topBy(ctx, g.members, lt)); });
    return finish(ctx, P, groups, '');
  };

  /* 派閥の形のまとめ（補佐・所属・無所属・体制の名前） */
  function finish(ctx, P, groups, fixReason) {
    /* 補佐：派閥の中にいる、主導性のある人（二番手） */
    groups.forEach(function (g) { g.subs = g.members.filter(function (m) { return m !== g.leader && ctx.chars[m].tr.lead > 0.5; }); });
    var of = {};
    groups.forEach(function (g) { g.members.forEach(function (m) { of[m] = g.leader; }); });
    var loners = P.filter(function (c) { return of[c.i] == null; }).map(function (c) { return c.i; });
    var regime, reason = '';
    if (!groups.length) { regime = 'none'; reason = '中心になれる人物はいたが、まだ誰もついていくほど信頼していない'; }
    else if (groups.length === 1) {
      var L = ctx.chars[groups[0].leader];
      if (groups[0].members.length >= Math.ceil(P.length * 0.7) && L.tr.cp > 0.6 && L.tr.np < 0.6) {
        regime = 'dictator'; reason = L.name + 'のCP（' + Math.round(L.eg.CP) + '）と主導性に、ほぼ全員が従った';
      } else { regime = 'single'; reason = L.name + 'を中心に一つの輪ができた'; }
    } else regime = groups.length === 2 ? 'two' : groups.length === 3 ? 'three' : 'multi';
    if (fixReason) reason = groups.length ? fixReason + (reason ? '。' + reason : '') : P.length < 2 ? 'いま残っているのは' + P.length + '人' : '「仲間とみなす」グループで、二人以上残っているものがない';
    return { regime: regime, reason: reason, groups: groups, loners: loners, of: of };
  }

  function sameKey(f) {
    return f.regime + '|' + f.groups.map(function (g) { return g.leader + ':' + g.members.slice().sort().join(','); }).join('/');
  }

  /* 1区切りごとに呼ばれる */
  F.step = function (ctx, s, n) {
    if (s === 0) return;
    var f = F.evaluate(ctx), prev = ctx.fac;
    var C = ctx.chars;
    /* 1区切り3行までに絞った記録の印（F.foldSet が畳まない。結果の factions.final に入る） */
    f.lim = CAP;
    ctx.facHist = ctx.facHist || [];
    var changed = !prev || sameKey(prev) !== sameKey(f);
    /* 派閥の出来事は候補として集め、最後に flushQ で上限と間隔を見て出す */
    ctx._facQ = [];
    if (changed) { if (f.groups.some(function (g) { return g.gid != null; }) || (prev && prev.groups.some(function (g) { return g.gid != null; }))) narrateFixed(ctx, prev, f); else narrate(ctx, prev, f); }
    ctx.fac = f;
    if (changed || s === n - 1) ctx.facHist.push({ step: s, label: ctx.label, regime: f.regime, reason: f.reason, groups: JSON.parse(JSON.stringify(f.groups)), loners: f.loners.slice() });

    /* 派閥が関係に与える影響 */
    ctx.k = 1; ctx._mag = 0; ctx._touched = {};
    f.groups.forEach(function (g) {
      g.members.forEach(function (a) { g.members.forEach(function (b) { if (a !== b) ctx.mod(C[a], C[b], { trust: 2, aff: 1 }); }); });
    });
    for (var i = 0; i < f.groups.length; i++) for (var j = i + 1; j < f.groups.length; j++) {
      var A = C[f.groups[i].leader], B = C[f.groups[j].leader];
      ctx.mod2(A, B, { ten: 6 }, { ten: 6 });
      f.groups[i].members.forEach(function (m) { if (m !== A.i) ctx.mod(C[m], B, { ten: 2 }); });
      f.groups[j].members.forEach(function (m) { if (m !== B.i) ctx.mod(C[m], A, { ten: 2 }); });
    }
    /* 派閥は生まれない設定：派閥の代わりに、仲の良い相手どうしの輪（ring）で同じ後押しをする（友人が極端に減らないように） */
    ctx._ring = facMode(ctx) === 'none' ? ring(ctx) : null;
    if (f.regime === 'dictator') {
      f.loners.forEach(function (i) {
        var c = C[i];
        c.stress = HK.clamp(c.stress + 8, 0, 100);
        if (ctx.scen.id === 'island') c.hp -= 3;
      });
    }
    if (f.groups.length >= 2 && ctx.rng() < 0.45) clash(ctx, f);
    if (f.groups.length && ctx.rng() < 0.28) tide(ctx, f);
    if (f.groups.length && !facLead(ctx)) coup(ctx, f);
    if (f.regime === 'dictator' && f.loners.length && ctx.rng() < 0.55) purge(ctx, f);
    flushQ(ctx);
  };

  /* 派閥の代わりの輪（facMode 'none' のときだけ。2026-10-28）
     派閥があると、同じ派閥の人どうしは区切りごとに信頼・好意が少しずつ上がり（上の「派閥が関係に与える影響」）、
     相手を選ぶときも同じ派閥の人を選びやすい（engine.js の act）。派閥を無くすとこの後押しがまるごと消えて、友人が大きく減っていた。
     そこで、一人ひとりが仲の良い相手（信頼・好意が高く、緊張の低い順）を二人まで選び、その結びつきで輪を作って、派閥と同じ後押しをする。
     輪には頭も名前もなく、語りも出さない（派閥ではないので）。輪は区切りごとに作り直す。乱数は使わない。
     返す値は { 住人の番号: 輪の番号 }（engine.js の相手選びの重みが使う） */
  var RING = { pick: 2, min: 4, cap: 0.4 };
  function ring(ctx) {
    var P = ctx.present(), C = ctx.chars, edges = [];
    if (P.length < 3) return null;
    var close = function (a, b) { var r = R(ctx, a, b); return r.trust * 0.6 + r.aff * 0.4 - r.ten * 0.5; };
    P.forEach(function (a) {
      P.filter(function (b) { return b !== a; }).map(function (b) { return { a: a.i, b: b.i, v: close(a, b) + close(b, a) * 0.5 }; })
        .filter(function (x) { return x.v > RING.min; })
        .sort(function (x, y) { return y.v - x.v || x.b - y.b; }).slice(0, RING.pick).forEach(function (x) { edges.push(x); });
    });
    edges.sort(function (x, y) { return y.v - x.v || x.a - y.a || x.b - y.b; });
    var top = {}, size = {}, cap = Math.max(3, Math.round(P.length * RING.cap));
    P.forEach(function (c) { top[c.i] = c.i; size[c.i] = 1; });
    var find = function (i) { while (top[i] !== i) i = top[i] = top[top[i]]; return i; };
    edges.forEach(function (x) {
      var p = find(x.a), q = find(x.b);
      if (p === q || size[p] + size[q] > cap) return;
      if (q < p) { var t = p; p = q; q = t; }
      top[q] = p; size[p] += size[q];
    });
    var of = {}, mem = {};
    P.forEach(function (c) { var r = find(c.i); if (size[r] < 2) return; of[c.i] = r; (mem[r] = mem[r] || []).push(c.i); });
    Object.keys(mem).forEach(function (k) {
      var m = mem[k];
      m.forEach(function (a) { m.forEach(function (b) { if (a !== b) ctx.mod(C[a], C[b], { trust: 2, aff: 1 }); }); });
    });
    return of;
  }
  F.ring = ring; F.RING = RING;

  /* 時系列で畳むための印（結果の JSON には入らない）。畳み方は F.foldSet */
  function tag(e, k) { if (e && typeof e === 'object') try { Object.defineProperty(e, 'fac', { value: k, enumerable: false, configurable: true }); } catch (x) { /* 印は無くても困らない */ } return e; }

  /* ---------- 派閥の出来事の出し方（2026-10-28） ----------
     ・1区切りに出す派閥の出来事は、合わせて CAP（3）行まで。候補をいったん集め（cand）、優先順 PRI の上から選ぶ（flushQ）。
       結成 ＞ 独裁・崩壊・頭の交代 ＞ 対立・下克上・粛清 ＞ 鞍替え ＞ 勢い ＞ 補佐 ＞ 散り散り ＞ 輪から外れた
     ・同じ種類は、前に出した区切りから GAP 区切りのあいだは出さない（結成・対立は5、ほかは3。独裁・崩壊・頭の交代は間を空けない）
     ・補佐（参謀・右腕・二番手）は1区切りに1行。同じ派閥のほかの補佐は、その行の理由に「ほかに○○も」とまとめる
     ・鞍替え・輪から外れたは、その区切りの分を1行にまとめる
     ・選ばれなかった候補は起きなかったことにする（記録にも書かず、関係も動かさない）。ただし鞍替えは所属がもう変わっているので、
       元の頭との関係の悪化だけは黙って反映する（silent）。補佐に選ばれなかった人は、次に派閥の形が変わった区切りでまた候補になる */
  var CAP = 3;
  var PRI = { form: 0, dict: 1, end: 1, lead: 1, clash: 2, coup: 2, purge: 2, swap: 3, tide: 4, sub: 5, scatter: 6, lone: 7 };
  var GAP = { form: 5, clash: 5, dict: 0, end: 0, lead: 0 };
  F.CAP = CAP; F.PRI = PRI; F.GAP = GAP;
  function gapOf(k) { return GAP[k] != null ? GAP[k] : 3; }
  function okKind(ctx, k) { var L = (ctx._facLast || {})[k]; return L == null || gapOf(k) === 0 || ctx.stepIndex - L > gapOf(k); }
  /* 候補を足す。opt.parent：この候補の親（親が選ばれたときだけ続けて出す。対立の仲裁・粛清のかばい）。opt.silent：選ばれなかったときに黙って行う処理 */
  function cand(ctx, k, run, opt) {
    var Q = ctx._facQ;
    if (!Q) { run(); return -1; }
    Q.push({ k: k, p: PRI[k] != null ? PRI[k] : 9, i: Q.length, run: run, parent: opt && opt.parent, silent: opt && opt.silent });
    return Q.length - 1;
  }
  function flushQ(ctx) {
    var Q = ctx._facQ || [], last = ctx._facLast = ctx._facLast || {}, s = ctx.stepIndex, pick = {}, n = 0;
    ctx._facQ = null;
    Q.filter(function (x) { return okKind(ctx, x.k); }).sort(function (x, y) { return x.p - y.p || x.i - y.i; }).forEach(function (x) {
      if (n >= CAP || (x.parent != null && !pick[x.parent])) return;
      pick[x.i] = 1; n++;
    });
    Q.forEach(function (x) {
      if (pick[x.i]) { if (x.run()) last[x.k] = s; }
      else if (x.silent) { ctx.k = 1; ctx._mag = 0; ctx._touched = {}; x.silent(); }
    });
  }

  /* 場所の言葉（クラスメイト：クラス・教室／無人島：島・浜） */
  var PLACE = { classroom: { pl: 'クラス', spot: '教室' }, island: { pl: '島', spot: '浜' } };
  function placeOf(ctx) { return PLACE[ctx.scen.id] || { pl: ctx.place || 'ここ', spot: ctx.place || 'ここ' }; }
  function fill(t, o) { return t.replace(/\{([a-z]+)\}/g, function (m, k) { return o[k] != null ? o[k] : m; }); }
  /* 箱庭ごとの言い回し（共通 _ ＋ 箱庭の分） */
  function pickT(ctx, T) { return ctx.pick((T._ || []).concat(T[ctx.scen.id] || [])); }
  function nameList(list) { return list.length <= 3 ? names(list) : names(list.slice(0, 2)) + 'ほか' + (list.length - 2) + '人'; }

  /* 結成：{a} 頭・{m} 加わった人・{pl} クラス／島・{spot} 教室／浜 */
  var T_FORM = {
    _: ['{a}を中心に、{m}がまとまり始めた。{pl}の中に「{a}派」ができた。',
      '{m}は、何かあると{a}の顔を見るようになった。誰が言い出したのか、{pl}ではそれを「{a}派」と呼んだ。',
      '{a}が「＠{a}＠一緒にやろう｜＝｜一緒にやりましょう」と声をかけると、{m}が頷いた。{pl}に「{a}派」ができた瞬間だった。'],
    classroom: ['休み時間になると、{m}が{a}の席の周りに集まるようになった。いつの間にか、{spot}では「{a}派」と呼ばれていた。'],
    island: ['焚き火を囲むとき、{m}は自然と{a}の隣に座るようになった。{spot}の一角に「{a}派」ができた。']
  };
  var WHY_FORM = ['信頼・好意と{a}の主導性（{n}）', '{a}の主導性（{n}）に、信頼を寄せる人が集まった', '{a}への信頼・好意が、ほかの誰よりも高い人たちが集まった（{a}の主導性 {n}）'];
  /* 散り散り：{a} 前の頭 */
  var T_SCATTER = {
    _: ['{a}派は、いつの間にか散り散りになっていた。',
      '{a}の周りに集まる顔は、日に日に減っていった。気づけば、{a}派と呼べるものは残っていなかった。'],
    classroom: ['{a}が声をかけても、もう誰も席を立たなかった。{a}派は、{spot}から静かに消えた。'],
    island: ['{a}の焚き火を囲む者は、もういなかった。{a}派は、潮が引くように{spot}から消えた。']
  };
  /* 輪から外れた：{m} 外れた人（一人以上）・{solo} ひとりで／それぞれひとりで */
  var T_LONE = {
    _: ['{m}は、どの輪にも属さなくなった。', '{m}は、どの派閥の集まりにも顔を出さなくなった。'],
    classroom: ['{m}は、休み時間を{solo}過ごすようになった。どの派閥からも、もう声はかからない。'],
    island: ['{m}は、焚き火から少し離れたところで、{solo}眠るようになった。どの派閥にも、もう入っていない。']
  };
  /* 鞍替え：{a} 抜けた人・{b} 元の頭・{c} 新しい頭 */
  var T_SWAP = {
    _: ['{a}は{b}のグループを抜けて、{c}の側についた。',
      '{a}は、{b}派の集まりに顔を出さなくなった。次に見かけたとき、{a}は{c}の隣にいた。',
      '{a}「悪いけど、これからは{c}につく｜悪いが、これからは{c}につく｜すみません、これからは{c}の側につきます」――{b}は何も言わずに背を向けた。'],
    classroom: ['{a}は昼休みの席を、{b}たちの輪から{c}たちの輪へ移した。それだけで、{pl}中に鞍替えの噂が広まった。'],
    island: ['{a}は寝床を、{b}たちの焚き火のそばから{c}たちの焚き火のそばへ移した。誰も口には出さなかったが、意味は皆わかっていた。']
  };
  /* 鞍替え（元の頭がもういない）：{a} 抜けた人・{b} 元の頭・{c} 新しい頭 */
  var T_SWAP_GONE = ['{a}は、{b}のいなくなったグループを離れて{c}の側についた。', '{b}のいない輪に、{a}はもう戻らなかった。次に見かけたとき、{a}は{c}の隣にいた。'];
  /* 前の頭が、自分の派閥をたたんでほかの派閥に入った：{a} 前の頭・{c} 新しい頭 */
  var T_FOLD = {
    _: ['{a}は自分の派閥をたたみ、{c}の側についた。',
      '{a}は「私の負け。これからは{c}についていく｜私の負けだ。これからは{c}についていく｜私の負けです。これからは{c}についていきます」と言って、自分の派閥をたたんだ。',
      '{a}の派閥は、そのまま{c}派に飲み込まれた。{a}自身も、{c}の隣に席を移した。']
  };
  /* 頭の交代（下克上でないとき）：{a} 新しい頭・{b} 前の頭 */
  var T_LEAD = {
    _: ['{b}派の皆が相談に行く相手は、いつの間にか{a}に変わっていた。派閥は、そのまま「{a}派」と呼ばれるようになった。',
      '{b}が一歩引いた形で、{a}が派閥の先頭に立つようになった。{b}は黙ってそれを受け入れた。',
      '{a}が{b}に代わって、派閥をまとめるようになった。「＠{a}＠これからは私が仕切る｜＝｜これからは私が仕切ります」――誰も反対しなかった。']
  };
  var T_LEAD_GONE = { _: ['{b}がいなくなり、{a}が代わって皆をまとめることになった。', '{b}のいない派閥を、{a}が引き継いだ。', '{b}が抜けた穴を埋めるように、{a}が派閥の先頭に立った。'] };
  /* 対立：{t} 揉めごとの種・{a}{b} 二つの派閥の頭 */
  var T_CLASH = {
    _: ['{t}を巡って、{a}派と{b}派が真っ二つに割れた。',
      '{t}のことで、{a}と{b}が{spot}の真ん中で言い合いになった。どちらの派閥の者も、黙ってはいなかった。',
      '{t}の話し合いは、{a}派と{b}派の意地の張り合いになった。結局、その日は何も決まらなかった。',
      '{a}が「＠{a}＠それは違う｜＝｜それは違います」と言えば、{b}も一歩も引かなかった。{t}を巡って、{a}派と{b}派の溝が深まった。']
  };

  /* 補佐（参謀・右腕・二番手）の文：態度9種（HK.personaOf）× 型3つ。{a} 補佐に回った人・{b} 頭 */
  var T_SUB = {
    proud: [
      '{a}は「仕切るのは{b}でいい。……今はね｜仕切るのは{b}でいい。……今はな｜仕切るのは{b}で構いません。……今は、ですが」と言って腕を組み、{b}派の参謀役に収まった。',
      '{a}は文句を言いながらも、{b}の右腕として面倒な段取りを片っ端から片づけていった。「＠{a}＠これは貸しだからね｜これは貸しだからな｜これは貸しですからね」',
      '{a}は「トップは{b}に譲る。二番目で十分｜トップは{b}に譲る。二番目で十分だ｜トップは{b}に譲ります。二番目で十分です」と言い捨てて、二番手の席にどかりと座った。'],
    stern: [
      '{a}は「{b}が決めて。細かい詰めは私がやる｜{b}が決めろ。細かい詰めは私がやる｜{b}が決めてください。細かい詰めは私がやります」と言い、{b}派の参謀役を引き受けた。',
      '{a}は{b}の右腕として、決まりごとの抜けを一つずつ埋めていった。誰に頼まれたわけでもなかった。',
      '{a}は{b}の一歩後ろに立つことを選んだ。「＠{a}＠上に立つ者は一人でいい｜＝｜上に立つ者は一人でいいのです」'],
    tsun: [
      '{a}は「べ、別に{b}のためじゃないから。放っておけないだけ｜別に{b}のためではない。放っておけないだけだ｜別に{b}のためではありません。放っておけないだけです」と言いながら、{b}派の作戦を練るようになった。',
      '{a}はぶつぶつ言いながらも、{b}が言い出したことの後始末を全部引き受けた。気づけば、誰が見ても{b}の右腕だった。',
      '{a}は「二番手でいいなんて、言ってないから｜二番手でいいとは言っていない｜二番手でいいなんて、言っていませんから」と言いつつ、{b}の隣の席から動かなかった。'],
    gentle: [
      '{a}は「{b}が前に出るなら、私は後ろで考えるね｜{b}が前に出るなら、私は後ろで考えよう｜{b}が前に出るなら、私は後ろで考えますね」と微笑み、{b}派の参謀役に収まった。',
      '{a}は{b}の右腕として、皆の話を聞いて回った。{b}のところに届く頃には、揉め事はたいてい小さくなっていた。',
      '{a}は、{b}の隣で二番手の席に座った。{b}が厳しく言ったあとには、いつも{a}がそっと声をかけに行った。'],
    devoted: [
      '{a}は{b}のために、夜遅くまで次の手を考えた。「＠{a}＠{b}の役に立てるなら、それでいい｜＝｜{b}の役に立てるなら、それでいいんです」',
      '{a}は「細かいことは全部、私に任せて｜細かいことは全部、私に任せろ｜細かいことは全部、私に任せてください」と言い、{b}の右腕として走り回った。',
      '{a}は{b}の一歩後ろを自分の場所と決めて、二番手の席に座った。{b}に頼られるたび、嬉しそうに頷いた。'],
    cool: [
      '{a}は「{b}が旗を振って、私が計算する。それがいちばん効率がいい｜{b}が旗を振り、私が計算する。それがいちばん効率がいい｜{b}が旗を振って、私が計算します。それがいちばん効率がいいです」と言い、{b}派の参謀役に収まった。',
      '{a}は{b}の右腕として、誰が何をするかを手早く割り振った。{b}が口で言い、{a}が段取りに落とす。役割は自然に分かれた。',
      '{a}は人数を数えて、{b}につくのが得策だと判断した。「＠{a}＠トップは{b}でいい。私は二番手で十分｜トップは{b}でいい。私は二番手で十分だ｜トップは{b}でいいと判断します。私は二番手で十分です」'],
    free: [
      '{a}は「作戦考えるの、けっこう楽しいかも｜作戦を考えるのは、なかなか楽しい｜作戦を考えるの、けっこう楽しいです」と言い出し、いつの間にか{b}派の参謀役になっていた。',
      '{a}は{b}の右腕として、思いつきを次々に持ち込んだ。半分は使えなかったが、残りの半分で{b}派は何度も助けられた。',
      '{a}は「てっぺんは{b}にあげる。私は二番目で好きにやる｜てっぺんは{b}に譲る。私は二番目で好きにやる｜てっぺんは{b}に譲ります。私は二番目で好きにやります」と笑って、二番手の席に座った。'],
    shy: [
      '{a}は、{b}にだけ小さな声で考えを伝えるようになった。{b}がそれを皆の前で言うと、たいていうまくいった。{a}は{b}派の、目立たない参謀役になった。',
      '{a}は「わ、私は、{b}のそばで……手伝えたら、それで｜私は、{b}のそばで……手伝えたら、それで｜わ、私は、{b}のそばで……お手伝いできたら、それで」と言い、{b}の右腕として細かな仕事を引き受けた。',
      '{a}は、皆に押し出されるようにして二番手の席に座った。「＠{a}＠わ、私なんかで、いいのかな……｜私などで、いいのか……｜わ、私なんかで、いいんでしょうか……」'],
    polite: [
      '{a}は「{b}が皆の前に立つなら、私は裏で支える。それが筋だと思う｜{b}が皆の前に立つなら、私は裏で支える。それが筋だろう｜{b}が皆の前に立つなら、私は裏でお支えします。それが筋だと思います」と言い、{b}派の参謀役に収まった。',
      '{a}は{b}の右腕として、頼まれた用事を一つ残らず丁寧に片づけた。{b}派の誰もが、困ったときは{a}を頼るようになった。',
      '{a}は「トップは{b}がいいと思う｜＝｜トップは{b}がいいと思います」と言い、二番手の席に座った。']
  };
  /* 補佐の理由：{a} 補佐・{b} 頭・{n} 補佐の主導性 */
  var WHY_SUB = ['{a}も主導性はある（{n}）が、{b}の求心力が上回った', '{a}の主導性（{n}）より、{b}を推す声のほうが多かった', '{b}の周りに集まる顔ぶれを見て、{a}（主導性 {n}）は支える側に回った'];
  function subNote(c) {
    var t = c.tr;
    if (t.np + t.ac > 1) return 'NP・ACが高く、補佐に回るのが苦にならない';
    if (t.a > 0.6) return 'Aが高く、自分が立つより得だと見た';
    if (t.cp > 0.6) return 'CPは高いが、今は機を待つことにした';
    if (t.fc > 0.6) return 'FCが高く、肩書きより動きやすさを取った';
    return '';
  }

  /* 固定（「仲間とみなす」グループ）の語り：最初のまとまり・リーダーの交代（死亡・退場・下克上）・人が減って形を保てなくなった、だけ */
  function narrateFixed(ctx, prev, f) {
    var C = ctx.chars, W = placeOf(ctx), place = W.pl;
    var pg = {};
    (prev ? prev.groups : []).forEach(function (g) { if (g.gid != null) pg[g.gid] = g; });
    f.groups.forEach(function (g) {
      var L = C[g.leader], was = pg[g.gid];
      if (!was) {
        var mem = g.members.filter(function (m) { return m !== g.leader; }).map(function (m) { return C[m]; });
        cand(ctx, 'form', function () {
          return tag(ctx.act2({ actors: [L].concat(mem), cat: 'bond', mag: 12, text: L.name + 'を中心に、' + names(mem) + 'がひとつにまとまった。' + place + 'の中で、仲間どうしの「' + L.name + '派」として動いていく。', why: '「仲間とみなす」グループ（派閥は固定）。リーダーは' + (facLead(ctx) ? facLead(ctx) + 'が最も高い' + L.name : L.name + 'の主導性（' + Math.round(L.tr.lead * 100) + '）') }), 'form');
        });
      } else if (was.leader !== g.leader) {
        var O = C[was.leader];
        /* 下克上（coup）はその場で語ったので、ここでは言わない */
        if (O.alive && !O.out && g.members.indexOf(O.i) >= 0) return;
        cand(ctx, 'lead', function () {
          return tag(ctx.act2({ actors: [L], cat: 'bond', mag: 10, text: O.name + 'がいなくなり、' + L.name + 'が代わって仲間たちをまとめることになった。', why: '派閥は固定。リーダーが' + (O.alive ? '退場した' : '亡くなった') }), 'lead');
        });
      }
    });
    Object.keys(pg).forEach(function (k) {
      if (f.groups.some(function (g) { return g.gid === +k; })) return;
      var g = pg[k], rest = g.members.filter(function (m) { return C[m].alive && !C[m].out; });
      if (!rest.length) return;
      cand(ctx, 'scatter', function () {
        return tag(ctx.act2({ actors: rest.map(function (m) { return C[m]; }), cat: 'solo', text: C[g.leader].name + '派は、残ったのが' + names(rest.map(function (m) { return C[m]; })) + 'だけになり、派閥の形を保てなくなった。', why: '派閥は固定。仲間が死亡・退場で減った' }), 'scatter');
      });
    });
    if (f.regime === 'dictator' && (!prev || prev.regime !== 'dictator')) {
      var D = C[f.groups[0].leader];
      cand(ctx, 'dict', function () { return tag(ctx.act2({ actors: [D], cat: 'conflict', mag: 20, text: D.name + 'の言葉が、そのまま' + place + 'の決まりになった。異を唱える者はほとんどいない。', why: f.reason }), 'dict'); });
    }
  }

  /* 前の区切りの派閥と今の派閥の対応 { 今の頭: 前の頭 }：頭が同じなら同じ派閥。頭が替わっても、今の頭が前の派閥にいて、
     顔ぶれの半分以上が同じなら、同じ派閥の続き（頭の交代）として扱う（結成と散り散りを一度に言わない） */
  function carry(prev, f) {
    var map = {}, used = {};
    if (!prev) return map;
    f.groups.forEach(function (g) { prev.groups.forEach(function (x) { if (x.leader === g.leader) { map[g.leader] = x.leader; used[x.leader] = 1; } }); });
    f.groups.forEach(function (g) {
      if (map[g.leader] != null) return;
      var best = null, bv = 0;
      prev.groups.forEach(function (x) {
        if (used[x.leader] || x.members.indexOf(g.leader) < 0) return;
        var same = x.members.filter(function (m) { return g.members.indexOf(m) >= 0; }).length;
        if (same * 2 >= Math.max(x.members.length, g.members.length) && same > bv) { bv = same; best = x; }
      });
      if (best) { map[g.leader] = best.leader; used[best.leader] = 1; }
    });
    return map;
  }

  function narrate(ctx, prev, f) {
    var C = ctx.chars, W = placeOf(ctx), place = W.pl;
    var pof = prev ? prev.of : {}, map = carry(prev, f), back = {};
    Object.keys(map).forEach(function (k) { back[map[k]] = +k; });
    /* 結成・頭の交代 */
    f.groups.forEach(function (g) {
      var L = C[g.leader];
      if (map[g.leader] != null) {
        if (map[g.leader] === g.leader) return;
        var O = C[map[g.leader]];
        /* 下克上（coup）で替わった頭は、その場で語ったので言わない */
        if (L.flags.coupOver === O.i) { delete L.flags.coupOver; return; }
        var here = O.alive && !O.out;
        cand(ctx, 'lead', function () {
          return tag(ctx.act2({ actors: here ? [L, O] : [L], cat: 'bond', mag: 10, text: fill(pickT(ctx, here ? T_LEAD : T_LEAD_GONE), { a: L.name, b: O.name }),
            why: here ? L.name + 'への信頼が、' + O.name + 'への信頼を上回った（' + L.name + 'の主導性 ' + Math.round(L.tr.lead * 100) + '）' : O.name + 'が' + (O.alive ? '退場した' : '亡くなった') }), 'lead');
        });
        return;
      }
      var mem = g.members.filter(function (m) { return m !== g.leader; }).map(function (m) { return C[m]; });
      cand(ctx, 'form', function () {
        var o = { a: L.name, m: names(mem), pl: W.pl, spot: W.spot, n: Math.round(L.tr.lead * 100) };
        return tag(ctx.act2({ actors: [L].concat(mem), cat: 'bond', mag: 12, text: fill(pickT(ctx, T_FORM), o), why: fill(ctx.pick(WHY_FORM), o) }), 'form');
      });
    });
    /* 補佐：1区切りに1行（いちばん主導性の高い人）。同じ派閥のほかの補佐は理由にまとめる */
    var subs = [];
    f.groups.forEach(function (g) { (g.subs || []).forEach(function (m) { if (C[m].flags.subOf !== g.leader) subs.push({ m: m, g: g }); }); });
    if (subs.length) {
      subs.sort(function (x, y) { return C[y.m].tr.lead - C[x.m].tr.lead || x.m - y.m; });
      var top = subs[0], rest = subs.filter(function (x) { return x !== top && x.g === top.g; }).map(function (x) { return C[x.m]; });
      cand(ctx, 'sub', function () {
        var c = C[top.m], L = C[top.g.leader], per = HK.personaOf ? HK.personaOf(c) : 'gentle';
        c.flags.subOf = L.i;
        rest.forEach(function (x) { x.flags.subOf = L.i; });
        var o = { a: c.name, b: L.name, n: Math.round(c.tr.lead * 100) }, note = subNote(c);
        return tag(ctx.act2({ actors: [c, L], cat: 'bond', mag: 8, text: fill(ctx.pick(T_SUB[per] || T_SUB.gentle), o),
          why: fill(ctx.pick(WHY_SUB), o) + (note ? '。' + note : '') + (rest.length ? '。ほかに' + nameList(rest) + 'も、' + L.name + 'を支える側に回った' : '') }), 'sub');
      });
    }
    /* 鞍替え：その区切りの分を1行に（頭が替わっただけの派閥の人は数えない） */
    var sw = [];
    Object.keys(f.of).forEach(function (k) {
      var i = +k, nowL = f.of[i], oldL = pof[i];
      if (oldL == null || oldL === nowL || i === nowL || map[nowL] === oldL) return;
      sw.push({ c: C[i], o: C[oldL], n: C[nowL] });
    });
    if (sw.length) {
      sw.sort(function (x, y) { return R(ctx, y.c, y.n).trust - R(ctx, x.c, x.n).trust || x.c.i - y.c.i; });
      var hurt = function () { sw.forEach(function (x) { if (x.o !== x.c) ctx.mod(x.o, x.c, { ten: 15, trust: -15 }); }); };
      cand(ctx, 'swap', function () {
        var m = sw[0], more = sw.slice(1).map(function (x) { return x.c; });
        /* 元の頭が亡くなった・退場したあとの鞍替えは、その人が振る舞う型（背を向ける など）を使わない（state-audit S25。2026-10-28） */
        var oGone = !m.o.alive || m.o.out;
        var t = m.o === m.c ? fill(pickT(ctx, T_FOLD), { a: m.c.name, c: m.n.name }) : oGone ? fill(ctx.pick(T_SWAP_GONE), { a: m.c.name, b: m.o.name, c: m.n.name }) : fill(pickT(ctx, T_SWAP), { a: m.c.name, b: m.o.name, c: m.n.name, pl: W.pl, spot: W.spot });
        return tag(ctx.act2({ actors: [m.c, m.o, m.n].filter(function (x, j, A) { return A.indexOf(x) === j && (x !== m.o || !oGone); }).concat(more), cat: 'betray', mag: 15, fx: hurt,
          text: t + (more.length ? '同じ頃、' + nameList(more) + 'も所属を変えた。' : ''), why: m.c.name + 'の' + m.n.name + 'への信頼（' + Math.round(R(ctx, m.c, m.n).trust) + '）が上回った' }), 'swap');
      }, { silent: hurt });
    }
    /* 散り散り（前の頭が生きていて、派閥が続いていない。前の頭がほかの派閥に入ったときは鞍替えで語る） */
    var gone = {};
    if (prev) prev.groups.forEach(function (g) {
      var Lg = C[g.leader];
      if (back[g.leader] != null || !Lg.alive || Lg.out || f.of[g.leader] != null) return;
      gone[g.leader] = 1;
      cand(ctx, 'scatter', function () {
        var mood = g.members.length >= 4 ? '大きかった輪が、求心力を失った' : '求心力の低下';
        return tag(ctx.act2({ actors: [Lg], cat: 'solo', text: fill(pickT(ctx, T_SCATTER), { a: Lg.name, pl: W.pl, spot: W.spot }), why: mood }), 'scatter');
      });
    });
    /* 輪から外れた：その区切りの分を1行に（派閥が散り散りになった前の頭は、散り散りの行で語るので数えない） */
    var lone = f.loners.filter(function (i) { return pof[i] != null && C[i].alive && !gone[i]; }).map(function (i) { return C[i]; });
    if (lone.length) cand(ctx, 'lone', function () {
      var cold = lone.every(function (c) { return c.tr.cold > 0.55; });
      return tag(ctx.act2({ actors: lone, cat: 'solo', text: fill(pickT(ctx, T_LONE), { m: names(lone), solo: lone.length > 1 ? 'それぞれひとりで' : 'ひとりで' }),
        why: '誰に対しても信頼が足りなかった／' + (cold ? 'ドライさ' : '居場所のなさ') }), 'lone');
    });
    if (f.regime === 'dictator' && (!prev || prev.regime !== 'dictator')) {
      var D = C[f.groups[0].leader];
      cand(ctx, 'dict', function () { return tag(ctx.act2({ actors: [D], cat: 'conflict', mag: 20, text: D.name + 'の言葉が、そのまま' + place + 'の決まりになった。異を唱える者はほとんどいない。', why: f.reason }), 'dict'); });
    }
    if (prev && prev.regime === 'dictator' && f.regime !== 'dictator') {
      cand(ctx, 'end', function () { return tag(ctx.say({ text: C[prev.groups[0].leader].name + 'の支配が崩れた。' }), 'end'); });
    }
    if (f.regime === 'none' && prev && prev.groups.length) cand(ctx, 'end', function () { return tag(ctx.say({ text: '派閥はなくなった。' + f.reason + '。' }), 'end'); });
  }

  function clash(ctx, f) {
    if (!okKind(ctx, 'clash')) return;
    var C = ctx.chars, A = C[f.groups[0].leader], B = C[f.groups[1].leader], W = placeOf(ctx);
    var p = cand(ctx, 'clash', function () {
      var topic = ctx.rng.pick(ctx.scen.id === 'island' ? ['水場と寝床の割り当て', '火の番の順番', '食料の分け方'] : ['席替えのやり方', '修学旅行の班決め', 'クラスTシャツのデザイン', '放課後の掃除当番']);
      return tag(ctx.act2({ actors: [A, B], cat: 'conflict', fx: function () { ctx.mod2(A, B, { ten: 12, aff: -6 }, { ten: 12, aff: -6 }); },
        text: fill(pickT(ctx, T_CLASH), { t: topic, a: A.name, b: B.name, spot: W.spot }), why: '派閥の対立。双方の主導性' }), 'clash');
    });
    var mid = f.groups[1].members.concat(f.groups[0].members).map(function (i) { return C[i]; }).filter(function (c) { return c !== A && c !== B && c.tr.np > 0.6 && c.tr.ac > 0.5; })[0];
    if (mid) cand(ctx, 'clash', function () {
      return tag(ctx.act2({ actors: [mid], cat: 'help', fx: function () { ctx.mod(A, mid, { trust: 4 }); ctx.mod(B, mid, { trust: 4 }); ctx.stress(mid, 10); },
        text: mid.name + 'が両方の顔を立てて、なんとか話をまとめた。本人はその夜、ひどく疲れた顔をしていた。', why: mid.name + 'のNP・AC（板挟み役）' }), 'clash');
    }, { parent: p });
  }

  /* 月日の流れ：出来事で、派閥の勢いが変わる（求心力＝メンバーからの信頼が動く） */
  var TIDE = {
    classroom: { up: ['文化祭の出し物で大成功を収め', '体育祭のリレーで逆転勝ちを決め', '定期テストで学年上位に入り', '先生に一目置かれる発言をして'], down: ['文化祭の準備でメンバーと揉め', '修学旅行の班決めで仲間を一人置き去りにし', '陰口を言っていたことが広まり', 'テスト期間に誰の相談にも乗らず'] },
    island: { up: ['大物の魚を仕留めて皆に振る舞い', '嵐の夜に的確な指示を出し', '真水の湧く場所を見つけ'], down: ['食料の分配で自分の取り分を多くし', '狩りの失敗を人のせいにし', '嵐の夜に判断を誤り'] },
    _: { up: ['皆の前で頼れるところを見せ', '揉め事をうまく収め'], down: ['大事な場面で判断を誤り', '仲間の信頼を裏切るような真似をし'] }
  };
  function tide(ctx, f) {
    if (!okKind(ctx, 'tide')) return;
    var C = ctx.chars, T = TIDE[ctx.scen.id] || TIDE._;
    var g = ctx.rng.pick(f.groups), L = C[g.leader], up = ctx.rng() < 0.5 + (L.tr.np * 0.2 + L.tr.a * 0.15 - L.tr.cold * 0.15);
    var all = ctx.present();
    cand(ctx, 'tide', function () {
      return tag(ctx.act2({ actors: [L], cat: up ? 'bond' : 'conflict', mag: 12, fx: function () {
        all.forEach(function (o) { if (o !== L) ctx.mod(o, L, up ? { trust: g.members.indexOf(o.i) >= 0 ? 6 : 9, aff: 4 } : { trust: -12, aff: -6, ten: 6 }); });
      }, text: L.name + 'は' + ctx.pick(up ? T.up : T.down) + '、' + (up ? L.name + '派の勢いが増した。様子見していた者たちの目も、' + L.name + 'に向き始めた。' : L.name + '派の求心力に陰りが見えた。'), why: '月日の流れで変わる力関係（' + L.name + 'の' + (up ? 'NP・A：人を惹きつけた' : 'ドライさ・判断ミス') + '）' }), 'tide');
    });
  }
  /* 補佐の下克上：二番手の求心力がトップを上回ると、派閥の頭が入れ替わる（出せる区切りでだけ起きる） */
  function coup(ctx, f) {
    if (!okKind(ctx, 'coup')) return;
    var C = ctx.chars;
    f.groups.forEach(function (g) {
      var L = C[g.leader];
      (g.subs || []).forEach(function (m) {
        var c = C[m]; if (!c.alive || c.out || g.done) return;
        var mine = g.members.filter(function (x) { return x !== m && x !== g.leader; });
        var sL = mine.reduce(function (t, x) { return t + R(ctx, C[x], L).trust; }, 0), sC = mine.reduce(function (t, x) { return t + R(ctx, C[x], c).trust; }, 0);
        if (mine.length && sC > sL + 25 && c.tr.cp + c.tr.lead > 1 && ctx.rng() < 0.5) {
          g.done = true;
          cand(ctx, 'coup', function () {
            mine.forEach(function (x) { ctx.mod(C[x], c, { trust: 10 }); ctx.mod(C[x], L, { trust: -10 }); });
            ctx.mod2(L, c, { ten: 25, trust: -25 }, { ten: 10 });
            c.flags.leader = true; L.flags.leader = false; c.flags.coupOver = L.i;
            return tag(ctx.act2({ actors: [c, L], cat: 'betray', mag: 25, text: '気づけば、' + L.name + '派の皆が相談に行く相手は' + c.name + 'になっていた。' + c.name + 'は' + L.name + 'に代わって、派閥の先頭に立った。', why: '補佐の' + c.name + 'への信頼（' + Math.round(sC / mine.length) + '）が、' + L.name + 'への信頼（' + Math.round(sL / mine.length) + '）を上回った。' + c.name + 'のCP・主導性' }), 'coup');
          });
        }
      });
    });
  }

  function purge(ctx, f) {
    if (!okKind(ctx, 'purge')) return;
    var C = ctx.chars, D = C[f.groups[0].leader];
    var t = f.loners.map(function (i) { return C[i]; }).sort(function (a, b) { return (R(ctx, b, D).ten + b.tr.lead * 30) - (R(ctx, a, D).ten + a.tr.lead * 30); })[0];
    if (!t) return;
    var follower = f.groups[0].members.map(function (i) { return C[i]; }).filter(function (c) { return c !== D; });
    var doubter = follower.filter(function (c) { return c.tr.np > 0.6 && R(ctx, c, t).aff > 15; })[0];
    var island = ctx.scen.id === 'island';
    var p = cand(ctx, 'purge', function () {
      return tag(ctx.act2({ actors: [D, t], cat: 'conflict', mag: 15, fx: function () { ctx.mod(t, D, { ten: 18, aff: -10 }); ctx.stress(t, 15); if (island) t.hp -= 6; follower.forEach(function (c) { ctx.mod(c, t, { aff: -4 }); }); },
        text: island ? D.name + 'は、従わない' + t.name + 'の配給を減らすと決めた。誰も反対しなかった。' : D.name + 'のひと言で、クラスの誰も' + t.name + 'に話しかけなくなった。',
        why: D.name + 'の独裁。' + t.name + 'は輪の外にいた' }), 'purge');
    });
    if (doubter) cand(ctx, 'purge', function () {
      return tag(ctx.act2({ actors: [doubter, t, D], cat: 'help', fx: function () { ctx.mod(t, doubter, { aff: 14, trust: 14 }); ctx.mod(D, doubter, { ten: 8 }); },
        text: doubter.name + 'だけが、こっそり' + t.name + 'に' + (island ? '自分の分の魚を半分' : 'ノートを貸していた') + '。', why: doubter.name + 'のNP。' + D.name + '派にいながら' }), 'purge');
    }, { parent: p });
  }

  /* ---------- 時系列で畳む（表示だけ。記録・結果は変えない） ----------
     似た派閥の出来事が続いて時系列が埋まらないように、view.js の時系列が畳む出来事の番号の表 { n: 1 } を返す。
     ・派閥の顔ぶれの動き（結成・補佐・鞍替え・離脱・解散・リーダー交代）：前に見せた区切りから3区切りたつまでは畳む。
       一人の鞍替え・離脱だけの小さな動き（結成・解散・補佐を含まない）は畳む（最初の派閥ができた区切りは全部見せる）
     ・対立と勢いの出来事（真っ二つに割れた・勢いが増した／陰った）：3区切りに1回まで
     ・同じ人の鞍替えは2回まで（3回目からは畳む）
     ・独裁・下克上・粛清・支配の崩壊はいつも見せる
     印 e.fac（その場で回した結果だけに付く）が無いとき（セーブを開いたときなど）は、文の形で見分ける */
  var KIND_RE = [['form', /を中心に、.*がまとまり始めた。|がひとつにまとまった。.*として動いていく/], ['sub', /参謀役に収まった|の右腕として、細かな段取り|二番手の席に座った/], ['swap', /のグループを抜けて、.*の側についた/],
    ['scatter', /派は、いつの間にか散り散りになっていた|派閥の形を保てなくなった/], ['lone', /は、どの輪にも属さなくなった/], ['lead', /が代わって仲間たちをまとめる/],
    ['clash', /派が真っ二つに割れた|が両方の顔を立てて/], ['tide', /派の勢いが増した|派の求心力に陰りが見えた/]];
  var FAM = { form: 'chg', sub: 'chg', swap: 'chg', scatter: 'chg', lone: 'chg', lead: 'chg', clash: 'flv', tide: 'flv' };
  F.kindOf = function (e) {
    if (!e) return null;
    if (e.fac) return e.fac;
    if (e.kind !== 'event' || !e.text) return null;
    for (var i = 0; i < KIND_RE.length; i++) if (KIND_RE[i][1].test(e.text)) return KIND_RE[i][0];
    return null;
  };
  F.foldSet = function (res) {
    if (!res || !res.factions || !res.log) return null;
    /* 1区切り3行までに絞って記録した結果（factions.final.lim。2026-10-28 から）は、もう畳まない */
    if (res.factions.final && res.factions.final.lim) return null;
    var by = {}, steps = [];
    res.log.forEach(function (e) {
      var k = F.kindOf(e);
      if (!k || !FAM[k]) return;
      if (!by[e.step]) { by[e.step] = []; steps.push(e.step); }
      by[e.step].push({ e: e, k: k });
    });
    var fold = {}, last = { chg: null, flv: null }, swaps = {}, n = 0;
    steps.forEach(function (st) {
      var L = by[st], chg = L.filter(function (x) { return FAM[x.k] === 'chg'; }), flv = L.filter(function (x) { return FAM[x.k] === 'flv'; });
      if (chg.length) {
        var first = last.chg == null, big = chg.some(function (x) { return x.k === 'form' || x.k === 'scatter' || x.k === 'sub' || x.k === 'lead'; }) || chg.filter(function (x) { return x.k === 'swap' || x.k === 'lone'; }).length > 1;
        var show = first || (big && st - last.chg >= 3);
        chg.forEach(function (x) {
          var hide = !show;
          if (x.k === 'swap') { var a = x.e.actors[0]; swaps[a] = (swaps[a] || 0) + 1; if (swaps[a] > 2) hide = true; }
          if (hide) { fold[x.e.n] = 1; n++; }
        });
        if (show) last.chg = st;
      }
      if (flv.length) {
        if (last.flv != null && st - last.flv < 3) flv.forEach(function (x) { fold[x.e.n] = 1; n++; });
        else last.flv = st;
      }
    });
    return n ? fold : null;
  };

  /* 住人ごとの所属まとめ */
  F.noteFor = function (ctx, c) {
    var h = ctx.facHist || [];
    if (!h.length) return null;
    var last = h[h.length - 1], C = ctx.chars;
    var mine = last.groups.filter(function (g) { return g.members.indexOf(c.i) >= 0; })[0];
    var hist = [];
    h.forEach(function (x) {
      var g = x.groups.filter(function (g2) { return g2.members.indexOf(c.i) >= 0; })[0];
      var tag = g ? C[g.leader].name + '派' + (g.leader === c.i ? '（頭）' : '') : '無所属';
      if (hist[hist.length - 1] !== tag) hist.push(tag);
    });
    var ever = h.some(function (x) { return x.groups.length; });
    var now = mine ? (mine.leader === c.i ? C[c.i].name + '派を率いた' + (last.regime === 'dictator' ? '。独裁者として君臨した' : '') : C[mine.leader].name + '派に属した')
      : (!ever ? '派閥は生まれなかった' : last.regime === 'none' ? '最後には派閥そのものが消えた' : 'どの派閥にも属さなかった');
    return '派閥：' + now + (hist.length > 1 ? '（' + hist.join(' → ') + '）' : '') + '。';
  };
})();
