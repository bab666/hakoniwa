/* 箱庭シミュレーター: 出られない部屋 ― 三人以上で一緒に条件を満たして出る（三人婚の芽）
   ・扉の紙の但し書き「三人以上で同時に行った場合、参加者全員がそれぞれ条件を満たしたものとみなす」
   ・三人になるきっかけ：選べない三角関係／恋人同士が取り残されそうな一人を誘う／ノリで／時間切れが迫って
   ・行為の場面は受け攻めの指定どおり（三人のなかでの上下を決めて書き分ける）
   ・回数が一回でも、一度の三人の場面で全員の分が数えられ、そのまま三人で出られる
   ・部屋を出たあとの三人（三人婚・三人だけの秘密・なかったことに） */
(function () {
  'use strict';
  var HK = window.HK, A = HK.RoomAPI;
  if (!A) return;
  var K = A.K, EV = A.EV, scen = A.scen;
  var T = HK.RoomTrio = {};
  function R(ctx, a, b) { return ctx.R(a, b); }
  function L(s) { return s.split('|'); }
  function nm3(g) { return g.map(function (c) { return c.name; }).join('・'); }
  function kn(n) { return ['', '一人', '二人', '三人', '四人', '五人', '六人'][n] || n + '人'; }

  /* 箱庭の設定：三人以上での条件達成（初期値は「最初から紙に書いてある」。三人ちょうどで条件がエッチか媚薬なら、受けに回れる人が一人でもいれば三人の場面が自然に起こる） */
  scen.env.splice(4, 0, { id: 'multi', label: '三人以上で一緒に満たす', type: 'select', def: 'open', options: [
    { v: 'open', label: '最初から紙に書いてある' },
    { v: 'note', label: '扉の紙の裏に但し書きがある（見つけたら使える）' },
    { v: 'no', label: '認めない（二人ずつだけ）' }
  ], desc: '「三人以上で同時にした場合、全員がそれぞれ満たしたものとみなす」。回数が一回でも、三人の場面一度で全員分が数えられます。三人ちょうどでエッチか媚薬の部屋なら、受けに回れる人が一人でもいれば三人の場面（3P）が起こります' });

  function multiOf(ctx) { return ctx.env.multi || 'open'; }
  function allowed(ctx) { return multiOf(ctx) !== 'no' && !ctx.flags.isOne && !ctx.flags.oneCond && A.hasPairRule(ctx); }
  /* 受け攻めの部品（親が pos.js に足す予定のものは、無ければ自前の判定に戻す） */
  /* pos.js はこのファイルより後に読み込まれるので、HK.Pos は呼ぶたびに見る（読み込み時に束縛しない） */
  function isF(c) { var P = HK.Pos; return !!(P && P.isF(c)); }
  function hardTop(c) { var P = HK.Pos; return !!(c && P && P.hardTop(c)); }
  function canBottom(c) { var P = HK.Pos; return !P || P.canBottom(c); }
  function bothRiba(a, b) { var P = HK.Pos; if (!P) return false; if (P.bothRiba) return P.bothRiba(a, b); return P.of(a) === 'riba' && P.of(b) === 'riba'; }
  /* 嫉妬・執着の強さ（c が g の中の相手 o について）：気質（嫉妬・執着）、関係「執着（ヤンデレ）」、「相手は一人だけ」の決め事、育った執着度 */
  function jealVal(ctx, c, o) {
    var v = (c.tr.jealous || 0);
    if (HK.Obsess && HK.Obsess.yanTie && HK.Obsess.yanTie(ctx, c, o)) v += 0.5;
    else if (HK.Ties && HK.Ties.has && HK.Ties.has(ctx, c, o, 'yan')) v += 0.5;
    if (c.flags.excl && (c.flags.partner === o.i)) v += 0.4;
    if (HK.Obsess && HK.Obsess.level && HK.Obsess.level(ctx, c, o) >= 35) v += 0.35;
    if ((ctx.pair(c, o).jealous || 0) > 0) v += 0.1;
    if (HK.Obsess && HK.Obsess.noTie && HK.Obsess.noTie(ctx, c, o)) v = 0;   /* 関係「執着なし」：嫉妬しない */
    return v;
  }
  function isJealous(ctx, c, o) { return jealVal(ctx, c, o) >= 0.62; }
  /* 嫉妬の型：pair の二人（攻め二人／受け二人／サンドイッチの上下）が、真ん中の人 o について嫉妬しているか。none / one / both と、嫉妬している人 j・もう一人 o */
  function jealShape(ctx, pr, o) {
    var js = pr.filter(function (c) { return isJealous(ctx, c, o); });
    if (!js.length) return { jeal: 'none' };
    if (js.length === 2) { var a = jealVal(ctx, pr[0], o) >= jealVal(ctx, pr[1], o) ? pr[0] : pr[1]; return { jeal: 'both', j: a, o: pr[0] === a ? pr[1] : pr[0] }; }
    return { jeal: 'one', j: js[0], o: pr[0] === js[0] ? pr[1] : pr[0] };
  }
  /* 受けの開放度：奔放・衝動・経験・媚薬で上がり、内気・CP・慎重で下がる → open / mid / shy */
  function openVal(ctx, c) {
    var t = c.tr;
    return t.fc * 0.45 + (t.impulse || 0) * 0.3 + (ctx.stat(c, 'exp') - 3) * 0.07 + (c.flags.aphro || 0) * 0.04 - t.ac * 0.5 - t.cp * 0.2 - (t.caution || 0) * 0.1;
  }
  function openOf(ctx, c) { var v = openVal(ctx, c); return v >= 0.28 ? 'open' : v <= 0.02 ? 'shy' : 'mid'; }
  var OPEN_LABEL = { open: '開放的', mid: 'ふつう', shy: '照れ屋' }, JEAL_LABEL = { none: 'なし', one: '片方', both: '両方' }, SHAPE_LABEL = { oneTwo: '攻め×受け・受け', twoOne: '攻め・攻め×受け', sandwich: 'サンドイッチ', ring: '輪' };
  T.jealVal = jealVal; T.openOf = openOf;
  function pairRules(ctx) { return ctx.rules.filter(function (r) { var t = K[r.k].type; return t === 'act' || t === 'word'; }); }
  function maxLvl(ctx) { return ctx.rules.reduce(function (m, r) { return K[r.k].type === 'act' ? Math.max(m, K[r.k].lvl) : m; }, 2); }
  function hasH(ctx) { return ctx.rules.some(function (r) { return r.k === 'h'; }); }
  /* 三人の場面に加われるか：生きていて、部屋を出ておらず、倒れておらず、監禁（執着の暴走）のさなかでない */
  function free(c) { return c && c.alive !== false && !c.out && !c.flags.down && c.flags.cagePair == null; }
  function pairsOf(g) { var o = []; for (var i = 0; i < g.length; i++) for (var j = i + 1; j < g.length; j++) o.push([g[i], g[j]]); return o; }
  function done3(ctx, g) { return pairsOf(g).every(function (p) { return A.pairDone(ctx, p[0], p[1]); }); }
  function family(ctx, a, b) { return A.tieWall(ctx, a, b, 3) >= 999; }
  function okSex(a, b) { return (!HK.Pos || HK.Pos.okSex(a, b)) && !(HK.roomWsNoSex && HK.roomWsNoSex(HK._curCtx, a, b)); }
  /* 円満な三人：三人のどの二人も恋人（番・運命の番を含む）どうし。三人の場面は成り行きではなく、恋人どうしの円満な場面（love）にする */
  function loveTie(ctx, a, b) { var T0 = HK.Ties; return ctx.pair(a, b).couple || !!(T0 && T0.has && (T0.has(ctx, a, b, 'lover') || T0.has(ctx, a, b, 'mate') || T0.has(ctx, a, b, 'fated'))); }
  /* 中心の人と恋人／友達以上恋人未満 */
  function hubTie(ctx, a, b) { var T0 = HK.Ties; return loveTie(ctx, a, b) || !!(T0 && T0.has && T0.has(ctx, a, b, 'almost')); }
  /* 中心の人をはさむ二人が、仲のよい間柄（親友・友達・幼なじみ・相棒・同僚・先輩後輩、または恋人どうし）で、張りつめていない */
  function friendTie(ctx, a, b) {
    var T0 = HK.Ties, t = T0 && T0.get ? T0.get(ctx, a, b) : null;
    if (!t || !/^(best|friend|childhood|buddy|colleague|senpai|almost|lover|mate|fated)$/.test(t.type)) return false;
    return R(ctx, a, b).ten < 50 && R(ctx, b, a).ten < 50;
  }
  /* 円満な三人：
     ・full：三人のどの二人も恋人（番・運命の番を含む）どうし
     ・hub：一人（中心）が残りの二人の両方と恋人（または友達以上恋人未満）で、残りの二人は親友など仲のよい間柄。中心の人を二人で愛する形（二人どうしは直接は交わらない）
     三人の場面は成り行きではなく、円満な場面（love／lovehub）にする */
  function harmonyOf(ctx, g) {
    if (!g || g.length !== 3) return null;
    /* 恋人どうしの円満さは、設定の「恋愛・R18にしない相手」「恋愛相手の固定」だけで見る（同じ人の恋人どうし＝coNG は、中心のある三人の形そのもの） */
    var ngH = HK.ngPairHard || HK.ngPair;
    if (pairsOf(g).some(function (p) { return ngH && ngH(p[0], p[1]); })) return null;
    if (pairsOf(g).every(function (p) { return loveTie(ctx, p[0], p[1]); })) return { full: true };
    for (var i = 0; i < 3; i++) {
      var h = g[i], o = g.filter(function (c) { return c !== h; });
      if (hubTie(ctx, h, o[0]) && hubTie(ctx, h, o[1]) && friendTie(ctx, o[0], o[1])) return { full: false, hub: h };
    }
    return null;
  }
  function harmony(ctx, g) { return !!harmonyOf(ctx, g); }
  /* 執着：関係「執着（ヤンデレ）」を重ねているか、執着度が育っている（「執着なし」の組は除く） */
  function obsessed(ctx, c, o) {
    var O = HK.Obsess;
    if (!O || (O.noTie && O.noTie(ctx, c, o))) return false;
    return !!(O.yanTie && O.yanTie(ctx, c, o)) || (O.level ? O.level(ctx, c, o) : 0) >= 35;
  }
  /* 円満な三人のうち、二人の恋人が同じ一人（{w}）にそろって執着している：円満ではなく、激しい取り合いになる */
  function clashOf(ctx, g) {
    var hm = harmonyOf(ctx, g);
    if (!hm) return null;
    var cs = hm.full ? g : [hm.hub];
    for (var i = 0; i < cs.length; i++) {
      var w = cs[i], o = g.filter(function (c) { return c !== w; });
      if (obsessed(ctx, o[0], w) && obsessed(ctx, o[1], w)) return { w: w, pr: o };
    }
    return null;
  }
  function loveKind(ctx, g) { var hm = harmonyOf(ctx, g); return !hm ? null : clashOf(ctx, g) ? 'loveclash' : hm.full ? 'love' : 'lovehub'; }
  function isLove(kind) { return kind === 'love' || kind === 'lovehub'; }
  /* 恋人どうしの三人（円満・取り合い）：決め事の説得・拒みのきっかけを使わない */
  function isLoveAny(kind) { return isLove(kind) || kind === 'loveclash'; }
  /* 中心のある円満な三人：中心の人が二人の両方と交われるなら、中心だけが二人と繋がる形 */
  function loveShape(ctx, g) {
    var hm = harmonyOf(ctx, g), cl = hm && clashOf(ctx, g);
    if (!hm || (hm.full && !cl)) return null;
    /* 取り合いは、取り合われる人を中心に（執着している二人どうしは直接は交わらない） */
    var h = cl ? cl.w : hm.hub, o = g.filter(function (c) { return c !== h; });
    if (hubOut(g, h)) return null;
    if (blocked(h, o[0]) || blocked(h, o[1])) return null;
    return okSex(h, o[0]) && okSex(h, o[1]) ? { sg: [h].concat(o), hubOnly: true } : null;
  }
  T.harmony = harmony; T.harmonyOf = harmonyOf;
  /* 体の関係の形：三人の全組が体の関係を持てるなら全員で、そうでなければ二人の両方と持てる一人を中心に（つながらない二人は直接は触れ合わない）。どれも無理なら null */
  /* 性行為の相手を固定している人（engine.js の sexLock）は、決めた相手以外の人がいる三人の場面に入らない（直接は触れ合わない形でも）。
     ただし二人とも「三人の場面：固定した相手が中心なら参加する」（住人の設定 trioHub）なら、固定の食い違い・同じ人の恋人どうし（coNG）だけで
     止まっている組は、その二人が直接は触れ合わない形（固定した相手を中心にした形）でだけ通す。苦手な組（恋愛・R18にしない相手）・R18に参加しない人は通さない */
  function blocked(x, y) { return !!((HK.sexNG && HK.sexNG(x, y)) || (HK.ngPair && HK.ngPair(x, y))); }
  function soft(x, y) { return !!(x.trioHub && y.trioHub) && !(HK.ngExplicit && HK.ngExplicit(x, y)) && !x.noR18 && !y.noR18; }
  function sexLockOut(g) { return g.some(function (x) { return g.some(function (y) { return y !== x && blocked(x, y) && !soft(x, y); }); }); }
  /* 中心のある円満な三人（loveShape）：中心 h の恋人どうしの二人は「同じ人の恋人どうし」（coNG）なので、二人の間だけは coNG を見ない
     （二人は直接は触れ合わない形）。二人の間でも、性行為の相手の固定（HK.sexNG）と苦手な組（HK.ngExplicit）は止める（trioHub の soft は同じに通す）。
     併合（2026-10-26）で sexLockOut が ngPair（coNG を含む）も見るようになり、恋人二人の中心の三人が起きなくなっていたのを直す */
  function hubOut(g, h) {
    return g.some(function (x) { return g.some(function (y) {
      if (y === x) return false;
      var b = x !== h && y !== h ? !!((HK.sexNG && HK.sexNG(x, y)) || (HK.ngExplicit && HK.ngExplicit(x, y))) : blocked(x, y);
      return b && !soft(x, y);
    }); });
  }
  function sexShape(g, hubOnly) {
    if (sexLockOut(g)) return null;
    /* 固定の食い違いだけで止まっている組（soft）があれば、その二人を中心にはしない（中心は残りの一人） */
    var softPair = null;
    for (var i = 0; i < 3; i++) for (var j = i + 1; j < 3; j++) if (blocked(g[i], g[j])) softPair = softPair || [g[i], g[j]];
    if (!softPair && !hubOnly && okSex(g[0], g[1]) && okSex(g[0], g[2]) && okSex(g[1], g[2])) return { sg: g, hubOnly: false };
    for (var k = 0; k < 3; k++) {
      var h = g[k], r = g.filter(function (c) { return c !== h; });
      if (softPair && softPair.indexOf(h) >= 0) continue;
      if (!blocked(h, r[0]) && !blocked(h, r[1]) && okSex(h, r[0]) && okSex(h, r[1])) return { sg: [h].concat(r), hubOnly: true };
    }
    return null;
  }
  T.soft = soft;
  /* きっかけごとの形。取り合われた人・誘われた人が中心のきっかけでは、その人が中心になれなければ成り立たない */
  function shapeFor(ctx, g, kind) {
    if (kind === 'lovehub' || kind === 'loveclash') return loveShape(ctx, g);
    var x = g[1], y = g[2];
    var hub = kind === 'hub' || (kind === 'invite' && !(HK.canLove(x, y) && HK.canLove(y, x) && R(ctx, x, y).att > 10));
    var sp = sexShape(g, hub);
    if (sp && sp.hubOnly && sp.sg[0] !== g[0] && (kind === 'hub' || kind === 'invite')) return null;
    return sp;
  }

  /* 準備：最初から書いてあるとき */
  var setup0 = scen.setup, phase0 = scen.phase, finish0 = scen.finish;
  scen.setup = function (ctx) {
    setup0(ctx);
    ctx.flags.multiKnown = multiOf(ctx) === 'open';
    ctx.flags.trios = []; ctx.flags.trioHL = {};
    ctx.flags.trioRoll = null;   /* 三人ちょうどのとき、この回は三人の場面に向かうか（性格・関係から一度だけ決める） */
  };
  scen.phase = function (ctx, s, n) {
    phase0(ctx, s, n);
    if (s === 0 && ctx.flags.multiKnown && allowed(ctx) && ctx.present().length >= 3)
      ctx.say({ text: '紙の一番下には、小さな字で但し書きがあった。「\u2060※三人以上で同時に行った場合、参加者全員がそれぞれ条件を満たしたものとみなす」' });
  };

  /* ---------- 但し書きを見つける ---------- */
  var FIND = L('{a}は扉の紙を何度も読み返しているうちに、裏面に小さな字の但し書きがあることに気づいた。「\u2060※三人以上で同時に行った場合、参加者全員がそれぞれ条件を満たしたものとみなす」|{a}は紙を照明に透かして、裏に印刷された一文を読み上げた。「\u2060三人以上で同時に行った場合、参加者全員が条件を満たしたものとみなす……だって」|{a}が紙の端をめくると、折り込まれていた部分に続きがあった。「\u2060※複数人での同時達成も可」――部屋の空気が、少し変わった。');
  var FIND_REACT = {
    fc: L('{b}が「え、じゃあ一回で済むじゃん｜つまり、一回で済むわけか｜え、では一回で済むんですね」と身を乗り出した。|{b}は「一石三鳥ってこと？｜一石三鳥ということか？｜一石三鳥ということですか？」と笑った。'),
    ac: L('{b}は顔を真っ赤にして、紙から目を逸らした。|{b}は聞こえなかったふりをして、膝を抱え直した。'),
    cp: L('{b}は「冗談じゃない｜冗談ではない｜冗談じゃありません」と吐き捨てたが、紙から目を離さなかった。|{b}は「……選択肢の一つとしては、覚えておく｜＝｜……選択肢の一つとしては、覚えておきます」とだけ言った。'),
    np: L('{b}は「それなら、誰も置いていかなくて済むね｜それなら、誰も置いていかずに済むな｜それなら、誰も置いていかなくて済みますね」と小さく言った。|{b}は全員の顔を順番に見て、「無理はしないで｜無理はするな｜無理はしないでください」と言った。'),
    cold: L('{b}は「合理的ではある｜＝｜合理的ではあります」と頷いた。|{b}は黙って、残り時間を計算し直した。')
  };
  function topKey(c) {
    var t = c.tr, best = 'np', bv = -1;
    [['np', t.np], ['fc', t.fc], ['cold', t.cold], ['ac', t.ac], ['cp', t.cp]].forEach(function (x) { if (x[1] > bv) { bv = x[1]; best = x[0]; } });
    return best;
  }
  EV.push({
    id: 'trio_note', cat: 'escape', scope: 'solo', pri: true,
    when: function (ctx, a) { return allowed(ctx) && !ctx.flags.multiKnown && ctx.present().length >= 3 && ctx.stepIndex >= 1 && free(a); },
    w: function (ctx, a) { return 0.7 + a.tr.a * 0.8 + (a.action && a.action.id === 'inspect' ? 1.2 : 0) + ctx.stepIndex * 0.15; },
    run: function (ctx, a) {
      ctx.flags.multiKnown = true;
      var others = ctx.present().filter(function (c) { return c !== a; });
      var b = ctx.pick(others);
      var t = ctx.t(ctx.pick(FIND), a) + ctx.t(ctx.pick(FIND_REACT[topKey(b)]), a, b);
      return { text: t, why: a.name + 'のA（' + Math.round(a.eg.A) + '）と、扉を調べる気持ち', mag: 14, with: [b] };
    }
  });

  /* ---------- 三人になるきっかけ ---------- */
  function partnered(ctx, a, b) {
    var t = HK.Ties ? HK.Ties.get(ctx, a, b) : null;
    return a.flags.partner === b.i || b.flags.partner === a.i || ctx.pair(a, b).couple || (t && /lover|fwb|almost/.test(t.type));
  }
  /* 「相手は一人だけ」と決めた人は、すぐには三人に加わらない。
     加わるのは、説得されて折れたとき（exclOpen）／時間が経って、三人目への惹かれが育ったとき／終盤に追い詰められたとき */
  function exclBlock(ctx, x, g) {
    if (!x.flags.excl || x.flags.exclOpen || harmony(ctx, g)) return false;
    var el = ctx.stepIndex - (x.flags.partnerAt || 0);
    var others = g.filter(function (y) { return y !== x && y.i !== x.flags.partner; });
    if (el >= 3 && others.every(function (o) { return R(ctx, x, o).att >= 35; })) return false;
    if (el >= 2 && x.stress > 70 && ctx.stepIndex >= ctx.stepsTotal * 0.7) return false;
    return true;
  }
  /* 三人の組み合わせと、きっかけの種類を選ぶ */
  function plan(ctx, a, b) {
    var P = ctx.present().filter(function (c) { return free(c) && c !== a && c !== b; });
    var lv = maxLvl(ctx), best = null;
    P.forEach(function (c) {
      var g = [a, b, c];
      if (done3(ctx, g)) return;
      if (pairsOf(g).some(function (p) { return family(ctx, p[0], p[1]); })) return;
      if (g.some(function (x) { return x.flags.trioNo; })) return;
      if (g.some(function (x) { return exclBlock(ctx, x, g); })) return;
      /* 部屋に残る誰かの恋人を連れていく組み合わせは選ばない。
         ただし恋人が三人以上いる人（円満な三人の中心）は、二人の恋人と三人で過ごしたあと、残る恋人のために部屋に残る（T.exitGroup）。場面はいつも三人まで */
      var leftLov = function (x, o) { var t = HK.Ties ? HK.Ties.get(ctx, x, o) : null; return (t && /lover|fwb/.test(t.type)) || ctx.pair(x, o).couple; };
      var holders = g.filter(function (x) { return ctx.present().some(function (o) { return g.indexOf(o) < 0 && leftLov(x, o); }); });
      if (holders.length && !(harmony(ctx, g) && holders.length === 1)) return;
      var cands = [];
      /* 円満な三人：三人とも互いに恋人どうしなら、成り行きではなく、恋人どうしとして三人で（ほかのきっかけより先に選ぶ） */
      var hm = harmonyOf(ctx, g);
      var cl0 = hm && clashOf(ctx, g);
      if (hm) cands.push({ kind: cl0 ? 'loveclash' : hm.full ? 'love' : 'lovehub', h: cl0 ? cl0.w : hm.full ? g.slice().sort(function (p, q) { return A.eager(ctx, q) - A.eager(ctx, p); })[0] : hm.hub, v: 10 });
      /* 選べない三角関係：b と c がどちらも a に惹かれている */
      var hub = function (h, x, y) {
        if (R(ctx, x, h).att > 22 && R(ctx, y, h).att > 22 && R(ctx, h, x).att > 10 && R(ctx, h, y).att > 10 && R(ctx, x, y).ten < 55 && R(ctx, y, x).ten < 55 && HK.canLove(h, x) && HK.canLove(h, y) && HK.canLove(x, h) && HK.canLove(y, h))
          cands.push({ kind: 'hub', h: h, x: x, y: y, v: 1.2 + (R(ctx, x, h).att + R(ctx, y, h).att) / 70 });
      };
      hub(a, b, c); hub(b, a, c); hub(c, a, b);
      /* 恋人同士が、取り残されそうな一人を誘う */
      [[a, b, c], [a, c, b], [b, c, a]].forEach(function (z) {
        var x = z[0], y = z[1], o = z[2];
        if (partnered(ctx, x, y) && o.flags.partner == null && R(ctx, o, x).att + R(ctx, o, y).att > 20 && R(ctx, x, o).ten < 50 && R(ctx, y, o).ten < 50 && (x.tr.np + y.tr.np > 0.9 || A.eager(ctx, x) + A.eager(ctx, y) > 1.1 || ctx.present().length === 3))
          cands.push({ kind: 'invite', h: o, x: x, y: y, v: 0.9 + (x.tr.np + y.tr.np) * 0.6 + (ctx.present().length === 3 ? 0.6 : 0) });
      });
      /* ノリで：三人とも積極的 */
      if (g.every(function (x) { return A.eager(ctx, x) > 0.5; }) && pairsOf(g).every(function (p) { return R(ctx, p[0], p[1]).ten < 50; }))
        cands.push({ kind: 'free', h: g.slice().sort(function (p, q) { return A.eager(ctx, q) - A.eager(ctx, p); })[0], v: 0.8 + g.reduce(function (s, x) { return s + A.eager(ctx, x); }, 0) * 0.4 });
      /* 時間がない：三人とも焦っている */
      if (ctx.stepIndex >= ctx.stepsTotal * 0.55 && g.every(function (x) { return x.stress > 45 || x.flags.resign; }) && pairsOf(g).every(function (p) { return R(ctx, p[0], p[1]).ten < 60 && R(ctx, p[0], p[1]).trust > -15; }))
        cands.push({ kind: 'late', h: g[0], v: 0.7 + ctx.stepIndex / ctx.stepsTotal });
      /* どの二人も、同じ行為を二人きりでできる程度には打ち解けている */
      if (pairsOf(g).every(function (p) { return A.willing(ctx, p[0], p[1], Math.min(lv, 4)); }))
        cands.push({ kind: 'warm', h: g[0], v: 1.0 });
      cands.forEach(function (cd) {
        cd.g = cd.h ? [cd.h].concat(g.filter(function (x) { return x !== cd.h; })) : g;
        /* 条件がエッチなら、受け攻めの指定で成り立つ形があるときだけ（中心がずれるきっかけは、中心を先頭に） */
        if (hasH(ctx)) { var sh = shapeFor(ctx, cd.g, cd.kind); if (!sh) return; if (sh.hubOnly) cd.g = sh.sg; }
        if (!best || cd.v > best.v) best = cd;
      });
    });
    return best;
  }

  /* ---------- 受け攻め：三人の上下を決める ---------- */
  function ord(ctx, x, y) {
    var fb = HK.RoomLewd ? HK.RoomLewd.lead(ctx, x, y) : [x, y];
    return HK.Pos ? HK.Pos.order(x, y, fb) : fb;
  }
  /* 中心 h とほか二人だけが繋がる場合（hub）と、三人全員が繋がる場合 */
  function shape(ctx, g, hubOnly) {
    var h = g[0], x = g[1], y = g[2];
    if (hubOnly) {
      var ox = ord(ctx, h, x), oy = ord(ctx, h, y), ht = (ox[0] === h ? 1 : 0) + (oy[0] === h ? 1 : 0);
      if (ht === 2) return { p: 'oneTwo', t: h, m: x, u: y };
      if (ht === 0) return { p: 'twoOne', t: x, m: y, u: h };
      return { p: 'sandwich', t: ox[0] === h ? y : x, m: h, u: ox[0] === h ? x : y };
    }
    var es = pairsOf(g).map(function (p) { return ord(ctx, p[0], p[1]); });
    var top = function (c) { return es.filter(function (e) { return e[0] === c; }).length; };
    var Tn = g.filter(function (c) { return top(c) === 2; })[0], Bn = g.filter(function (c) { return top(c) === 0; })[0];
    if (!Tn || !Bn) { var e0 = es[0], e1 = es.filter(function (e) { return e[1] === e0[0]; })[0] || es[1]; return { p: 'ring', t: e0[0], m: e0[1], u: e1[0] === e0[0] ? e1[1] : e1[0] }; }
    var M = g.filter(function (c) { return c !== Tn && c !== Bn; })[0];
    /* 真ん中の人が自分で「受け」を選んでいれば、攻め×受け・受け（oneTwo）に寄せる。受け×受けの組で動く側に回るのは、ときどきだけ */
    var P = HK.Pos, pool = P && P.explicit(M, Tn) && P.isBottom(M, Tn) ? ['oneTwo', 'oneTwo', 'oneTwo', 'sandwich', 'twoOne'] : ['sandwich', 'sandwich', 'twoOne', 'oneTwo'];
    return { p: ctx.rng.pick(pool), t: Tn, m: M, u: Bn };
  }
  /* {t}=上 {m}=真ん中 {u}=下。oneTwo：{t}が{m}と{u}を抱く／twoOne：{t}と{m}が{u}を抱く／sandwich：{t}が{m}を、{m}が{u}を／ring：{t}→{m}→{u}→{t} */
  /* r18:begin */
  var SEX = {
    sandwich: L('{m}は{u}の奥まで沈みながら、後ろから{t}に貫かれた。前と後ろから同時に押し寄せる熱に、{m}の声が途切れ途切れになった。|{u}を組み敷いた{m}の腰を、{t}が後ろから掴んで引き寄せた。{m}が{u}を突き上げるたびに、{t}も{m}の奥を突いた。三人の動きは、いつの間にか一つのリズムになっていた。|{t}に後ろから抱かれた{m}は、そのまま{u}の中に入っていった。一番声を上げていたのは、挟まれた{m}だった。'),
    twoOne: L('{u}は{t}に後ろから貫かれながら、{m}にしがみついた。途中で{t}と{m}が入れ替わり、{u}は休む間もなく二人を受け入れ続けた。|{t}と{m}は、{u}を前と後ろから挟むようにして交互に抱いた。{u}は二人の名前を交互に呼びながら、何度も達した。|{u}は{t}の上に跨って腰を落とし、振り返って{m}の首に腕を回した。{t}が果てると、今度は{m}が後ろから{u}の中に入ってきた。'),
    oneTwo: L('{t}は{m}と{u}を並べて寝かせ、交互に抱いた。自分の番を待つ間、{m}と{u}は互いの手を握り合っていた。|{t}が{m}の奥を突いている間、{u}は{t}の背中に口づけを落とし続けた。それから{t}は、待ちきれずに腰を揺らしていた{u}の中に入っていった。|{t}は{m}を抱き、{u}を抱き、また{m}に戻った。二人分の甘い声が、白い部屋の中で重なり合った。'),
    ring: L('三人は、輪のように繋がった。{t}が{m}を抱き、{m}が{u}を抱き、そして{u}が{t}を抱いた。誰が誰を抱いているのか、途中から誰にも分からなくなった。|{t}は{m}の中に、{m}は{u}の中に、{u}は{t}の中に――三人は順番に組み合わせを変えながら、何度も互いを求め合った。')
  };
  /* r18:end */
  var SOFT = {
    kiss: L('三人は額を寄せ合い、順番に唇を重ねた。{a}と{b}、{b}と{c}、{c}と{a}――最後の一回は、三人同時に唇を寄せようとして、鼻がぶつかって笑ってしまった。|{a}は{b}に、{b}は{c}に、{c}は{a}に。三人は輪になって、一周ずつキスを回した。'),
    hug: L('三人は輪になって、互いの背中に腕を回した。誰かの鼓動が、三人分まとめて伝わってきた。|{a}が{b}と{c}をまとめて抱き寄せた。三人分の体温で、白い部屋が少しだけ暖かくなった。'),
    hand: L('三人は輪になって、手を繋いだ。{a}の右手は{b}と、左手は{c}と。|{a}を真ん中に、三人は手を繋いで並んで座った。'),
    lap: L('{a}は{b}の膝に頭を乗せ、{c}の膝に脚を預けた。三人は、そのまましばらく黙っていた。|{b}と{c}が並んで座り、その膝の上に{a}が寝転がった。「贅沢すぎる｜＝｜贅沢すぎます」と{a}が笑った。'),
    love: L('三人は向かい合って、順番に「好き｜好きだ｜好きです」と言い合った。{a}から{b}へ、{b}から{c}へ、{c}から{a}へ。言い終わったあと、三人とも照れて目を逸らした。'),
    honne: L('三人は輪になって座り、一人ずつ本音を打ち明けた。誰か一人を選べなかったこと、それでいいと思えたこと。'),
    praise: L('三人は順番に、残りの二人のいいところを言い合った。言われるたびに、誰かが顔を覆った。')
  };
  var OPEN = {
    /* 二人の恋人が、同じ一人（{h}）にそろって執着している：取り合い */
    loveclash: L('{x}と{y}は、但し書きを読み終える前に{h}の両腕を掴んでいた。どちらも、手を離す気はなかった。{x}「{h}は私のだ｜{h}は私のものだ｜{h}は私のものです」{y}「最初から、私のだ｜最初から、私のものだ｜最初から、私のものです」|{h}が但し書きを読み上げると、{x}と{y}は同時に{h}を引き寄せようとして、互いの手がぶつかった。二人は睨み合い、それから同じことを考えた。三人でなら、相手に{h}を独り占めさせずに済む。|「三人で」と{h}が言い終わる前に、{x}が{h}の唇を塞いだ。{y}はその肩を掴んで{h}を自分の方へ向かせ、奪い返すように口づけた。どちらも、相手に一秒でも長く{h}を渡したくなかった。'),
    /* 中心のある円満な三人：{h} が二人の恋人、{x}{y} は仲のよい二人 */
    lovehub: L('{x}と{y}は但し書きを読んで、顔を見合わせた。どちらも{h}と特別な仲で、どちらも互いをよく知っていた。{x}「……{h}となら、三人でも大丈夫｜……{h}となら、三人でも大丈夫だ｜……{h}となら、三人でも大丈夫です」{y}も笑って頷いた。|{h}は{x}と{y}の手を、片方ずつ握った。「二人とも好き。それは、二人とももう知ってるよね｜二人とも好きだ。それは、二人とももう知っているだろう｜二人とも好きです。それは、二人とももう知っていますよね」――{x}と{y}は、照れくさそうに目を合わせた。仲のいい二人のあいだに、迷いはなかった。|{y}が{x}の肩を軽く叩いた。「今日は、一緒に{h}を大事にしよう｜＝｜今日は、一緒に{h}を大事にしましょう」{x}は「言われなくても｜言われるまでもない｜言われなくても、そのつもりです」と笑い返した。{h}は二人のやりとりを聞いて、顔を赤くした。'),
    /* 円満な三人（全員が恋人どうし）：成り行きではなく、いつもの三人として */
    love: L('{h}は紙の但し書きを読んで、{x}と{y}の顔を見た。二人とも、もう笑っていた。{x}「三人一緒なら、いつもどおりだね｜三人一緒なら、いつもどおりだ｜三人一緒なら、いつもどおりですね」|{x}と{y}は、迷わず{h}の両側に腰を下ろした。三人で恋人どうしになってから、誰か一人を置いていくことなど、一度も考えたことがなかった。{h}が二人の手を取ると、指が自然に絡んだ。|「こんな部屋でも、三人なら怖くない｜＝｜こんな部屋でも、三人なら怖くありません」と{y}が言った。{x}が頷いて、{h}の肩に頭を預けた。{h}は二人の髪に順番に口づけてから、「おいで｜来い｜来てください」と囁いた。|三人は、但し書きを読む前から同じベッドに座っていた。いつもの夜と同じように、{h}が真ん中で、{x}と{y}が両側にいた。違うのは、この部屋に窓がないことだけだった。'),
    hub: L('{x}と{y}の視線が、同時に{h}に向いた。{h}は二人の顔を見比べて、長いこと黙っていた。「……選べない。だったら、三人で｜……選べない。ならば、三人で｜……選べません。だったら、三人で」|{x}と{y}は、どちらが{h}の相手をするかで言い争いになりかけた。{h}が二人の手を同時に取った。「喧嘩するくらいなら、三人でしよう｜喧嘩をするくらいなら、三人でしよう｜喧嘩するくらいなら、三人でしましょう」|{h}は「どっちかを選んだら、もう一人を置いていくことになる｜どちらかを選べば、もう一人を置いていくことになる｜どちらかを選んだら、もう一人を置いていくことになります」と言った。それから、紙の但し書きを指さした。'),
    invite: L('{x}と{y}は顔を見合わせ、部屋の隅で膝を抱えていた{h}に手を差し出した。「一人だけ置いていくのは、なしにしよう｜一人だけ置いていくのは、なしだ｜一人だけ置いていくのは、なしにしましょう」|{x}は{y}の手を握ったまま、{h}の方を振り返った。「{h}も、一緒に｜{h}も、一緒に来い｜{h}も、一緒に来てください」――{y}も、黙って頷いた。|二人で出たら、{h}は一人きりでこの部屋に残る。{x}と{y}は同じことを考えていた。「……三人で、出よう｜……三人で、出るぞ｜……三人で、出ましょう」'),
    free: L('{h}が「三人の方が早くない？｜三人の方が早くないか？｜三人の方が早くないですか？」と笑った。誰も、反対しなかった。|{h}は残りの二人の手を引いて、ベッドの真ん中に座らせた。「せっかくだし、みんなで｜せっかくだ、みんなでやろう｜せっかくですし、みんなでやりましょう」'),
    late: L('時間がない。三人は顔を見合わせ、言葉少なに決めた。「……三人で、一回で終わらせよう｜＝｜……三人で、一回で終わらせましょう」|照明が暗くなっていく中で、三人は誰からともなく身を寄せ合った。'),
    warm: L('この部屋で過ごすうちに、三人の距離はすっかり縮まっていた。{h}が但し書きを指さすと、残りの二人は顔を見合わせて、小さく笑った。|「誰と誰が、とかじゃなくてさ｜誰と誰が、ということではなく｜誰と誰が、とかじゃなくてですね」と{h}が言った。「三人で、ってのはどう？｜三人で、というのはどうだ？｜三人で、というのはどうですか？」――二人は少し考えて、頷いた。')
  };
  /* r18:begin */
  var CLIMAX3 = L('三人はほとんど同時に果てて、そのまま折り重なるようにベッドに沈んだ。|最後に誰が果てたのか、三人とも覚えていなかった。乱れたシーツの上で、三人分の荒い息だけが聞こえていた。|終わったあと、三人は川の字になって寝転がった。真ん中の誰かが、両側の手を握っていた。');
  /* r18:end */

  /* ---------- 三人の場面 ---------- */
  /* 三人のエッチ：前戯→本番→見所→絶頂→余韻（文は room-trio-lines.js） */
  function sexScene(ctx, g, kind, sp, hubOnly, first) {
    /* 一つの回の中で同じ文を繰り返さない選び方（R18版は ero-kit.js の HK.Ero.freshPick。全年齢版は ctx.pick のまま） */
    var fpk = HK.Ero && HK.Ero.freshPick ? HK.Ero.freshPick(ctx, function (arr) { return ctx.pick(arr); }) : function (arr) { return ctx.pick(arr); };
    var X = HK.TrioLines, V = HK.Voice, pf = function (arr) { return fpk(arr); };
    var r = { h: g[0], x: g[1], y: g[2], t: sp.t, m: sp.m, u: sp.u };
    /* 嫉妬の型：攻め二人（twoOne）は受けについて、受け二人（oneTwo）は攻めについて、サンドイッチは上下の二人が真ん中について */
    var jp = sp.p === 'twoOne' ? [sp.t, sp.m] : sp.p === 'oneTwo' ? [sp.m, sp.u] : sp.p === 'sandwich' ? [sp.t, sp.u] : null;
    var jc = sp.p === 'twoOne' ? sp.u : sp.p === 'oneTwo' ? sp.t : sp.m;
    /* 円満な三人（love）は、互いに恋人どうしなので嫉妬の型を使わない */
    var J = jp ? jealShape(ctx, jp, jc) : { jeal: 'none' };
    /* 円満な三人でも、嫉妬しやすい人がいれば、ちょっとした小競り合い（すぐ収まる焼きもち）を一つはさむことがある */
    var spat = null;
    if (isLove(kind)) { if (J.j && ctx.rng() < 0.7) spat = { j: J.j, o: J.o, w: jc }; J = { jeal: 'none' }; }
    /* 取り合い：執着している二人（jp）が、真ん中の人（jc）を奪い合う。嫉妬は「両方」として扱う */
    if (kind === 'loveclash' && jp) { var j1 = jealVal(ctx, jp[0], jc) >= jealVal(ctx, jp[1], jc) ? jp[0] : jp[1]; J = { jeal: 'both', j: j1, o: jp[0] === j1 ? jp[1] : jp[0] }; }
    if (J.j) { r.j = J.j; r.o = J.o; }
    if (kind === 'loveclash') r.w = jc;
    /* 受けの開放度：受ける人（twoOne・sandwich は {u}、oneTwo は {m}{u} のうち開放度の極端な方）の性格から */
    var sCand = sp.p === 'oneTwo' ? [sp.m, sp.u] : sp.p === 'ring' ? [sp.t, sp.m, sp.u].filter(canBottom) : [sp.u];
    sCand = sCand.filter(canBottom);
    var sB = sCand.length ? sCand.slice().sort(function (p, q) { return Math.abs(openVal(ctx, q) - 0.15) - Math.abs(openVal(ctx, p) - 0.15); })[0] : null;
    var op = sB ? openOf(ctx, sB) : 'mid';
    r.s = sB;
    /* {p}{q}：{s} 以外の二人（{s} の文で、残りの二人を指すとき。{x}{y} だと {s} と同じ人になることがある） */
    var setPQ = function (rr) { if (rr.s) { var oth = g.filter(function (c) { return c !== rr.s; }); rr.p = oth[0]; rr.q = oth[1]; } else { rr.p = rr.q = null; } };
    setPQ(r);
    /* 受ける側の役（recv）に、自分で攻めを選んだ人を置かない */
    var sTop = function (k) { var c = g.slice().sort(function (p, q) { return q.tr[k] - p.tr[k]; })[0]; return c.tr[k] > 0.55 ? c : null; };
    var recvOK = function (o, rr) { rr = rr || r; return !o.recv || !o.recv.split(' ').some(function (k) { var c = k === 's' && o.who ? sTop(o.who) : rr[k]; return !c || hardTop(c, g); }); };
    /* 女性どうしで繋がる組があれば、挿入の描写を使わない（白い部屋の木箱の玩具はよい） */
    var E = { oneTwo: [[sp.t, sp.m], [sp.t, sp.u]], twoOne: [[sp.t, sp.u], [sp.m, sp.u]], sandwich: [[sp.t, sp.m], [sp.m, sp.u]], ring: [[sp.t, sp.m], [sp.m, sp.u], [sp.u, sp.t]] }[sp.p];
    var ffE = HK.Pos ? E.filter(function (e) { return HK.Pos.ff(e[0], e[1]); })[0] : null;
    var PEN = /奥まで沈|深く沈|腰を沈|腰を落と|繋が|貫|突い|突き|突く|突か|中に入|入って|熱を吐き出|腰を打ちつけ|果てて.*中|奥で果て|中で果て|最奥|迎え入れ|受け入れ|挿れ|挿入|抜き差し|根元|穿|口に含|のもの/;
    var penRaw = function (l) { return !ffE || !PEN.test(l); };
    /* 文の中の役（{j}{o}{s} など）が全部そろっている文だけ使う */
    var rolesOK = function (l) { var m = String(l).match(/\{[a-z]\}/g) || []; return m.every(function (k) { return !!r[k.charAt(1)]; }); };
    /* 円満な三人には、成り行きの戸惑い（三人は初めて・選べない・変な関係・忘れて など）の文を使わない */
    var AWK = /本当にするの|初めてだった|初めて見る|初めてだ|選べない|変な関係|二人同時なんて|二人は、だめ|忘れて|飲み込めて|顔を上げられ|気まず|見なかったことに|取り合って|張り合|睨|拗ね|恋敵/;
    var moodOK = function (l) { return !isLove(kind) || !AWK.test(l); };
    var penOK = function (l) { return penRaw(l) && rolesOK(l) && moodOK(l) && apartOK(l); };
    var tagOK = function (o) {
      return (!o.kinds || o.kinds.split(' ').indexOf(kind) >= 0) && (!o.shapes || o.shapes.split(' ').indexOf(sp.p) >= 0)
        && (!o.jeal || o.jeal.split(' ').indexOf(J.jeal) >= 0) && (!o.open || o.open.split(' ').indexOf(op) >= 0)
        && (!o.recv || o.recv.split(' ').every(function (k) { return k === 's' ? !!(o.who || r.s) : !!r[k]; }));
    };
    var ok = function (o) { return tagOK(o) && recvOK(o); };
    var noHub = function (l) { return (!hubOnly || !/同時に触れ合|抱きしめ合/.test(l)) && penOK(l); };
    /* リバ同士の二人だけに許す文（入れ替わり・双頭・擦り合わせ） */
    var allRiba = bothRiba(sp.t, sp.m) && bothRiba(sp.m, sp.u) && bothRiba(sp.t, sp.u);
    var ribaOK = function (o) { var pr = { tm: [sp.t, sp.m], mu: [sp.m, sp.u], tu: [sp.t, sp.u] }[o.riba]; return o.riba === 'all' ? allRiba : !!pr && bothRiba(pr[0], pr[1]); };
    var swapOK = function (l) { return allRiba || !/入れ替わ|どちらの顔も/.test(l); };
    var toyOK = function (l) { return !/双頭/.test(l) || bothRiba(sp.t, sp.m); };
    /* 直接は繋がらない二人（中心のある三人）のうち、恋愛対象が合わない二人（apart）は、文の中で触れ合わせない：
       その二人を指す役（{m}{u} など）が同じ文に出て、三人目が出ない文に触れ合いの語がある文・「互いの」「〜合う」のように三人が触れ合う文は使わない。
       受け攻めの向きが合わないだけ（受けどうし・攻めどうし）で、恋愛対象の合う二人は、触れ合ってよい */
    /* （HK.canLove は受け攻めの向きも見るので使わない。恋愛対象 genderOK と、恋愛・R18にしない相手 ngPair だけで見る） */
    var apart = pairsOf(g).filter(function (p) { return !okSex(p[0], p[1]) && !(HK.Pos && HK.Pos.genderOK && HK.Pos.genderOK(p[0], p[1]) && !(HK.ngPair && HK.ngPair(p[0], p[1]))); });
    var TOUCH = /口づけ|唇|キス|舐|抱|撫で|触れ|吸い|指|舌|繋が|挿|貫|重な|絡|しゃぶ|咥|胸|奥|しがみつ/;
    var MUTUAL3 = /互いの|互いに|抱きしめ合|触れ合|重ね合|口づけ合|求め合|絡み合|確かめ合|擦り合|下の二人|残りの二人が/;
    var apartOK = function (l, rr) {
      if (!apart.length) return true;
      rr = rr || r;
      if (MUTUAL3.test(l)) return false;
      return String(l).split(/[。\n]/).every(function (x) {
        if (!TOUCH.test(x)) return true;
        var who = (x.match(/\{[a-z]\}/g) || []).map(function (k) { return rr[k.charAt(1)]; }).filter(Boolean);
        return !apart.some(function (p) { return who.indexOf(p[0]) >= 0 && who.indexOf(p[1]) >= 0 && !g.some(function (c) { return c !== p[0] && c !== p[1] && who.indexOf(c) >= 0; }); });
      });
    };
    /* 「役を入れ替え」のような、抱く側と抱かれる側が入れ替わる文は、自分で攻めを選んだ人がいる三人では使わない */
    var roleSwapOK = function (l) { return !/役を入れ替え|入れ替わ|入れ替え/.test(l) || !g.some(function (c) { return HK.Pos && HK.Pos.hardTopIn(c, g); }); };
    /* 文の候補から、触れ合わせない二人・役の入れ替わりの文を除く（残らなければ null） */
    var pickA = function (arr, rr) { var l = (arr || []).filter(function (x) { return apartOK(x, rr) && roleSwapOK(x); }); return l.length ? fpk(l) : null; };
    if (HK.SAFE_ON && HK.RoomFade3) return HK.RoomFade3(ctx);
    /* r18:begin */
    if (!X) return fpk(SEX[sp.p]).replace(/\{t\}/g, sp.t.name).replace(/\{m\}/g, sp.m.name).replace(/\{u\}/g, sp.u.name) + fpk(CLIMAX3);
    /* r18:end */
    var out = [], used = [];
    /* R18の描写の設定（lewd-unify.js）：ほのめかす＝暗転の一文（safe-room.js）、短く＝本番と絶頂だけ、男性向け＝thick-sex-ero.js の三人の文、濃い＝もう一度 */
    var LV = HK.Lewd, r18 = !HK.SAFE_ON && LV;
    /* 全年齢版・全年齢モード（HK.SAFE_ON）も、ほのめかすと同じ暗転の一文に（行為の文を組み立てない） */
    if ((HK.SAFE_ON || (r18 && LV.lv(ctx.env) === 'low')) && HK.RoomFade3) return HK.RoomFade3(ctx);
    var tShort = r18 && LV.short(ctx.env, ctx.rng), TE = r18 && LV.ero(ctx.env) && HK.ThickEro && HK.ThickEro.TRIO ? HK.ThickEro : null, tHigh = r18 && LV.high(ctx.env);
    var efill = function (l) { return X.fill(TE.trioFill(ctx, l, r), r); };
    var pickTagged = function (pool, wfn) {
      var cands = pool.filter(ok).filter(function (o) { return o.t.some(penOK); });
      if (!cands.length) return null;
      var o = HK.weighted(ctx.rng, cands, function (z) { return (wfn ? wfn(z) : 1) * (isLoveAny(kind) && z.kinds ? 3 : 1) / (1 + (ctx.flags.trioHL[z.id] || 0) * 2); });
      if (!o) return null;
      ctx.flags.trioHL[o.id] = (ctx.flags.trioHL[o.id] || 0) + 1;
      var ls = o.t.filter(penOK);
      return { o: o, text: X.fill(fpk(ls.length ? ls : o.t), r) };
    };
    /* 円満な三人で、攻め一人×受け二人（oneTwo）：受けの二人が攻めを取り合う（二人で口で・順番に。迫るのは受けの二人、攻めもまんざらではない合意の場面）。
       攻めが男性なら口と挿入、女性なら口・胸・指・跨っての文（X.LT の topm／topf） */
    var ltOn = isLove(kind) && sp.p === 'oneTwo' && !HK.SAFE_ON && X.LT;
    var ltPick = function (k) {
      var pool = (X.LT && X.LT[k] || []).filter(function (o) { return (!o.topm || !isF(sp.t)) && (!o.topf || isF(sp.t)) && recvOK(o) && o.t.some(penOK); });
      if (!pool.length) return null;
      var o = HK.weighted(ctx.rng, pool, function (z) { return 1 / (1 + (ctx.flags.trioHL[z.id] || 0) * 2); });
      ctx.flags.trioHL[o.id] = (ctx.flags.trioHL[o.id] || 0) + 1;
      if (o.tag) used.push(o.tag);
      return X.fill(fpk(o.t.filter(penOK)), r);
    };
    /* 前戯（初回だけ）：嫉妬・開放度・きっかけに合う文を優先 */
    var ltW = ltOn && first && !tShort && ctx.rng() < 0.85 ? ltPick('warm') : null;
    if (ltW) out.push(ltW);
    else if (first && !tShort) {
      /* 前戯の文も、触れ合わせない二人（apart：中心の形で直接は繋がらない二人・恋愛対象の合わない二人）が触れ合う文を除く */
      var warmPool = [];
      X.WARM.forEach(function (o) { var ls = o.t.filter(function (l) { return noHub(l) && apartOK(l); }); if (ls.length) { var c = {}; for (var k in o) c[k] = o[k]; c.t = ls; warmPool.push(c); } });
      var w = pickTagged(warmPool, function (z) { return (z.jeal ? 2.6 : 1) * (z.open ? 1.8 : 1) * (z.kinds ? 2 : 1); });
      if (w) { out.push(w.text); if (w.o.jeal || w.o.open) used.push(w.o.jeal ? '嫉妬の前戯' : OPEN_LABEL[op] + 'な受け'); }
    }
    /* 本番 */
    var ml = ffE && X.MAIN_FF ? X.MAIN_FF[sp.p].filter(swapOK).concat(ctx.flags.toolbox ? (X.TOY_FF[sp.p] || []).filter(toyOK).filter(swapOK) : []).filter(function (l) { return apartOK(l); }) : X.MAIN[sp.p].filter(noHub).filter(swapOK).filter(function (l) { return apartOK(l); });
    var ml0 = X.MAIN[sp.p].filter(swapOK), ml1 = ml0.filter(function (l) { return apartOK(l); });
    out.push(X.fill(fpk(ml.length ? ml : ml1.length ? ml1 : ml0), r));
    /* 夜の性格の一文（attr-r18.js）：攻め→受けの組ごとに、二つまで（サド二人×マゾ一人なら、攻めの振る舞いと受けの崩れ方） */
    if (HK.Attr && HK.Attr.nightText) {
      var NP = { oneTwo: [[sp.t, sp.m], [sp.t, sp.u]], twoOne: [[sp.t, sp.u], [sp.m, sp.u]], sandwich: [[sp.t, sp.m], [sp.m, sp.u]], ring: [[sp.t, sp.m], [sp.m, sp.u]] }[sp.p] || [[sp.t, sp.u]];
      var keyOf = function (c) { return c === sp.t ? 't' : c === sp.m ? 'm' : 'u'; }, nAdded = 0;
      NP.forEach(function (pr) {
        if (nAdded >= 2 || !pr[0] || !pr[1] || pr[0] === pr[1]) return;
        var md = HK.Pos && HK.Pos.isF(pr[0]) ? (HK.Pos.isF(pr[1]) ? 'ff' : 'fm') : 'mf';
        /* 二つ目からは攻めの文だけ（同じ受けの崩れ方を二度書かない） */
        var nt = HK.Attr.nightText(pr[0], pr[1], md, fpk, !!TE, nAdded ? 'top' : undefined);
        if (nt) { out.push(X.fill(nt.replace(/\{a\}/g, '{' + keyOf(pr[0]) + '}').replace(/\{b\}/g, '{' + keyOf(pr[1]) + '}'), r)); nAdded++; }
      });
    }
    /* 男性向け：入れる側がみな男性なら挿入の文、そうでなければ指・舌・口の文を足す */
    if (TE) {
      var pens = { oneTwo: [sp.t], twoOne: [sp.t, sp.m], sandwich: [sp.t, sp.m], ring: [sp.t, sp.m, sp.u] }[sp.p] || [sp.t];
      var penM = !ffE && HK.Pos && pens.every(function (c) { return !HK.Pos.isF(c); }) && TE.TRIO.pen[sp.p];
      var teL = pickA(penM ? TE.TRIO.pen[sp.p] : TE.TRIO.soft);
      if (teL) out.push(efill(teL));
    }
    /* 受けの二人が攻めを取り合う見所（一つは必ず、初回はもう一つのことも） */
    if (ltOn) { var lh1 = ltPick('hl'); if (lh1) out.push(lh1); if (first && !tShort && ctx.rng() < 0.6) { var lh2 = ltPick('hl'); if (lh2 && lh2 !== lh1) out.push(lh2); } }
    /* リバ同士の二人がいれば、入れ替わりの一文を足すことがある */
    var rb = (ffE ? X.RIBA_FF : X.RIBA) || [];
    rb = rb.filter(function (o) { return (!o.shapes || o.shapes.split(' ').indexOf(sp.p) >= 0) && ribaOK(o); });
    if (rb.length && ctx.rng() < 0.5) { var rbL = pickA(fpk(rb).t); if (rbL) { out.push(X.fill(rbL, r)); used.push('リバ同士の入れ替わり'); } }
    if (V && sp.u && !hardTop(sp.u, g) && ctx.rng() < 0.75) out.push(X.fill(V.line(pf, sp.u.persona, ctx.rng() < 0.5 ? 'edge' : 'climax', 'b').replace(/\{b\}/g, '{u}').replace(/\{a\}/g, '{t}'), r));
    /* 見所：嫉妬の型があれば嫉妬の見所を一つ（高確率）、受けの開放度の見所を一つ（ときどき）、ほかに性格・きっかけの見所 */
    var top = function (k, th) { var c = g.slice().sort(function (p, q) { return q.tr[k] - p.tr[k]; })[0]; return c.tr[k] > th ? c : null; };
    var after = null;
    var addHL = function (pool, wfn) {
      var cands = pool.filter(function (o) { return ok(o) && (!o.who || top(o.who, 0.55)) && o.t.some(penOK); });
      if (!cands.length) return false;
      var o = HK.weighted(ctx.rng, cands, function (z) { return (wfn ? wfn(z) : 1) * (isLoveAny(kind) && z.kinds ? 3 : 1) / (1 + (ctx.flags.trioHL[z.id] || 0) * 2); });
      if (!o) return false;
      ctx.flags.trioHL[o.id] = (ctx.flags.trioHL[o.id] || 0) + 1;
      var rr = Object.assign({}, r); if (o.who) { rr.s = top(o.who, 0.55); setPQ(rr); }
      if (!recvOK(o, rr)) return false;
      var ls = o.t.filter(function (l) { return penOK(l) && apartOK(l, rr); });
      if (!ls.length) { if (apart.length) return false; ls = o.t; }
      out.push(X.fill(fpk(ls), rr));
      used.push(o.tag);
      if (o.id === 'sync') r.synced = true;
      if (o.after) after = o.after;
      return true;
    };
    if (!tShort) {
    var hlJ = X.HL.filter(function (o) { return o.jeal; }), hlO = X.HL.filter(function (o) { return o.open && !o.jeal; }), hlG = X.HL.filter(function (o) { return !o.jeal && !o.open && !o.spat; });
    if (spat && X.SPAT && X.SPAT.length) {
      var so = X.SPAT[Math.floor(ctx.rng() * X.SPAT.length)], rs = Object.assign({}, r, spat), sl = so.t.filter(function (l) { return penRaw(l) && moodOK(l) && apartOK(l, rs) && (String(l).match(/\{[a-z]\}/g) || []).every(function (k) { return !!rs[k.charAt(1)]; }); });
      if (sl.length) { out.push(X.fill(fpk(sl), rs)); used.push(so.tag); }
    }
    var nJ = kind === 'loveclash' ? 1 : J.jeal !== 'none' ? (ctx.rng() < 0.85 ? 1 : 0) : (ctx.rng() < 0.45 ? 1 : 0);
    /* 取り合い：取り合いの見所を一つ必ず入れる（嫉妬の見所に加えて） */
    if (kind === 'loveclash') addHL(X.HL.filter(function (o) { return o.kinds && o.kinds.split(' ').indexOf('loveclash') >= 0; }));
    if (nJ) addHL(hlJ);
    if (ctx.rng() < (first ? 0.6 : 0.35)) addHL(hlO);
    var nG = first ? (ctx.rng() < 0.6 ? 1 : 0) + (used.length < 2 ? 1 : 0) : (used.length ? 0 : 1);
    for (var k = 0; k < nG; k++) addHL(hlG, function (z) { return (z.kinds ? 2.2 : 1) * (z.shapes ? 1.6 : 1) * (z.who ? 1.3 : 1); });
    }
    if (sp.p === 'sandwich' && V && !hardTop(sp.m, g) && ctx.rng() < 0.6) out.push(X.fill(V.line(pf, sp.m.persona, 'climax', 'b').replace(/\{b\}/g, '{m}').replace(/\{a\}/g, '{t}'), r));
    /* 絶頂：形・嫉妬・開放度に合う文があれば優先 */
    var ltC = ltOn && !TE && !r.synced && ctx.rng() < 0.6 ? ltPick('climax') : null;
    if (ltC) out.push(ltC);
    else if (TE && pickA(TE.TRIO.climax) !== null) out.push(efill(pickA(TE.TRIO.climax)));
    else if (!r.synced) {
      var cx = (X.CLIMAX_X || []).filter(function (o) { return ok(o) && o.t.some(penOK) && (!o.after || o.after === after); });
      var c = cx.length && ctx.rng() < 0.7 ? HK.weighted(ctx.rng, cx, function (z) { return (z.jeal ? 2 : 1) * (z.open ? 1.5 : 1) * (z.kinds ? (isLoveAny(kind) ? 6 : 2) : 1) / (1 + (ctx.flags.trioHL[z.id] || 0) * 2); }) : null;
      if (c) { ctx.flags.trioHL[c.id] = (ctx.flags.trioHL[c.id] || 0) + 1; var cl = c.t.filter(penOK); out.push(X.fill(fpk(cl.length ? cl : c.t), r)); }
      else out.push(X.fill(fpk(X.CLIMAX.filter(penOK)), r));
    }
    if (tHigh && HK.ThickEro) { var agL = pickA(TE ? TE.TRIO.again : HK.ThickEro.TRIO.againNovel); if (agL) out.push(TE ? efill(agL) : X.fill(agL, r)); }
    /* 余韻：見所の結末（折れた／険悪／連帯）と嫉妬・開放度に合わせる */
    if (!tShort && ctx.rng() < (first ? 0.75 : 0.4)) {
      var aOK = function (l) { return rolesOK(l) && moodOK(l) && apartOK(l); };
      var ax = (X.AFTER_X || []).filter(function (o) { return ok(o) && o.t.some(aOK) && (!o.after || o.after === after || (!after && o.after === 'bond' && J.jeal === 'none')); });
      var a = ax.length && ctx.rng() < (after ? 0.9 : 0.6) ? HK.weighted(ctx.rng, ax, function (z) { return (z.after && z.after === after ? 3 : 1) * (z.jeal ? 1.6 : 1) * (z.kinds ? (isLoveAny(kind) ? 6 : 2) : 1) / (1 + (ctx.flags.trioHL[z.id] || 0) * 2); }) : null;
      var al = a ? a.t.filter(aOK) : [];
      if (a && al.length) { ctx.flags.trioHL[a.id] = (ctx.flags.trioHL[a.id] || 0) + 1; out.push(X.fill(fpk(al), r)); }
      else { var af = X.AFTER.filter(aOK); out.push(X.fill(fpk(af.length ? af : X.AFTER.filter(moodOK)), r)); }
    }
    ctx.flags.lastTrioTags = used;
    ctx.flags.lastTrioInfo = { p: sp.p, jeal: J.jeal, open: op, j: J.j ? J.j.name : '', s: sB ? sB.name : '', after: after };
    var txt3 = out.join('');
    if (ffE && HK.FF) txt3 = HK.FF.fix(ctx, txt3, ffE[0], ffE[1], { tools: !!ctx.flags.toolbox });
    /* 女性の攻めが入れる側に書かれた文は、男性の相手ごとに女性上位の文へ（pos-fm.js） */
    if (HK.FM && HK.Pos) g.filter(function (c) { return HK.Pos.isF(c) && (HK.Pos.isTop(c) || HK.Pos.hasFor(c)); }).forEach(function (f) {
      g.forEach(function (m) { if (m !== f && !HK.Pos.isF(m) && HK.Pos.isTop(f, m)) txt3 = HK.FM.fixWith(ctx, txt3, f, m.name); });
    });
    /* 形の上で女性が男性を抱く側に回った組（受け×受けで女性が動く側に回ったときなど、女性の指定が攻めでない組）も、同じく女性上位の文へ */
    if (HK.FM && HK.Pos && E) E.forEach(function (e) { var f = e[0], m = e[1]; if (f && m && f !== m && HK.Pos.isF(f, m) && !HK.Pos.isF(m, f) && !HK.Pos.isTop(f, m)) txt3 = HK.FM.fixWith(ctx, txt3, f, m.name); });
    return txt3;
  }
  /* 新しいきっかけの文（auto・join・aphro）は room-trio-lines.js */
  if (HK.TrioLines && HK.TrioLines.OPEN) Object.keys(HK.TrioLines.OPEN).forEach(function (k) { OPEN[k] = OPEN[k] || HK.TrioLines.OPEN[k]; });
  /* pre：形を先に決めてあるとき { sg, hubOnly, sp }（三人ちょうどの自動のきっかけ）。force：条件にエッチがなくても体の場面を書く（媚薬の部屋） */
  function scene(ctx, g, kind, first, nPresent, pre, force) {
    var h = g[0], x = g[1], y = g[2], V = HK.Voice, pf = function (arr) { return ctx.pick(arr); };
    var op = (OPEN[kind] || OPEN.warm).filter(function (l) { return nPresent === 3 || !/一人きり/.test(l); });
    var txt = first ? ctx.t(ctx.pick(op).replace(/\{h\}/g, '\u0001').replace(/\{x\}/g, '\u0002').replace(/\{y\}/g, '\u0003'), h, x, y).replace(/\u0001/g, h.name).replace(/\u0002/g, x.name).replace(/\u0003/g, y.name)
      : (HK.TrioLines ? HK.TrioLines.fill(ctx.pick(HK.TrioLines.ROUND2), { h: h, x: x, y: y }) : ctx.t('三人は、もう一度身を寄せ合った。', h, x, y));
    var rk = pairRules(ctx), sex = force || rk.some(function (r) { return r.k === 'h'; });
    if (sex) {
      /* 体の関係を持てない二人（攻め×攻めなど）は直接は繋がらない：両方と持てる一人を中心にする */
      var sh = pre || shapeFor(ctx, g, kind);
      if (sh) txt += sexScene(ctx, sh.sg, kind, sh.sp || shape(ctx, sh.sg, sh.hubOnly), sh.hubOnly, first, nPresent);
      else txt += '三人は身を寄せ合ったが、それ以上は進まなかった。';
    }
    rk.forEach(function (r) { if (r.k !== 'h' && SOFT[r.k]) txt += ctx.t(ctx.pick(SOFT[r.k]), h, x, y); });
    return txt;
  }
  /* 進み具合：三人の組み合わせ全部に、同じだけ数える */
  function count(ctx, g) {
    var span = Math.max(3, ctx.stepsTotal * 0.55);
    pairRules(ctx).forEach(function (r) {
      var Tk = K[r.k];
      pairsOf(g).forEach(function (pr) {
        var p = A.prog(ctx, pr[0], pr[1]);
        if (Tk.type === 'act') {
          var inc = r.n > 3 ? Math.max(1, Math.round(r.n / span * 1.2 * (0.6 + ctx.rng() * 0.8) * (6 - Tk.lvl) / 3)) : 1;
          p.act[r.k] = Math.min(r.n, (p.act[r.k] || 0) + inc);
        } else {
          pr.forEach(function (c) { p.said[r.k + c.i] = Math.min(r.n, (p.said[r.k + c.i] || 0) + (Tk.mode === 'sum' ? Math.ceil(r.n / 2) : 1)); });
        }
      });
    });
  }
  function progText(ctx, g) {
    var r = pairRules(ctx).filter(function (q) { return K[q.k].type === 'act' && q.n > 1; })[0];
    if (!r) return '';
    /* 組ごとに数えるので、三つの組の分を並べる（いちばん少ない組だけ出すと、数が戻ったように見える） */
    return '（三人で' + K[r.k].noun + '：' + pairsOf(g).map(function (pr) { return pr[0].name + '×' + pr[1].name + ' ' + (A.prog(ctx, pr[0], pr[1]).act[r.k] || 0) + '/' + r.n; }).join('・') + '）';
  }

  /* 三人（以上）で出る */
  /* 三人で出るとき、まだ部屋に残る恋人がいる人（恋人が三人以上いる人）は、その恋人のために残る */
  function stayFor(ctx, g) {
    var out = null;
    g.some(function (x) {
      var o = ctx.present().filter(function (y) { return g.indexOf(y) < 0 && !y.out && y.alive !== false && y.flags.cagePair == null && loveTie(ctx, x, y) && !A.pairDone(ctx, x, y); })[0];
      if (o) out = { s: x, o: o };
      return !!o;
    });
    return out;
  }
  T.exitGroup = function (ctx, g, text, why, night, kind) {
    var sf = stayFor(ctx, g);
    if (sf) {
      var go = g.filter(function (c) { return c !== sf.s; });
      go.forEach(function (c) { c.out = true; c.fate = '脱出'; c.fateNote = go.filter(function (o) { return o !== c; }).map(function (o) { return o.name; }).join('と') + 'と部屋を出た（' + sf.s.name + 'は、' + sf.o.name + 'のために残った）'; c.flags.trio = g.map(function (o) { return o.i; }); });
      sf.s.flags.trio = g.map(function (o) { return o.i; }); sf.s.flags.stayed = (sf.s.flags.stayed || 0) + 1;
      pairsOf(g).forEach(function (pr) { ctx.mod2(pr[0], pr[1], { trust: 8, aff: 4 }, { trust: 8, aff: 4 }); if (night && okSex(pr[0], pr[1])) ctx.pair(pr[0], pr[1]).night = true; });
      ctx.mod2(sf.s, sf.o, { trust: 6, aff: 4 }, { trust: 6, aff: 4 });
      var ex0 = { group: g.map(function (c) { return c.i; }), label: ctx.label, trio: true, night: !!night, kind: kind || 'warm' };
      (ctx.flags.exits = ctx.flags.exits || []).push(ex0);
      ctx.flags.trios.push(ex0);
      var st = ctx.t(ctx.pick([
        '扉の鍵が外れる音がした。{a}は二人の背中を押して先に行かせ、自分は部屋の中に向き直った。{a}「{b}を一人にはしない。すぐ行く｜＝｜{b}を一人にはしません。すぐ行きます」',
        '扉が開いた。{a}は出ていく二人に手を振ってから、部屋の隅の{b}の隣に腰を下ろした。{a}「待たせた。次は、二人で｜待たせたな。次は、二人でだ｜お待たせしました。次は、二人で」',
        '鍵の外れる音に、{b}が顔を上げた。{a}は扉をくぐらず、{b}の手を取った。{a}「先に出てて。{b}と一緒に行くから｜先に出ていろ。{b}と一緒に行く｜先に出ていてください。{b}と一緒に行きますから」――二人は頷いて、先に扉をくぐった。'
      ]), sf.s, sf.o);
      return { cat: 'escape', mag: 40, text: text + st, why: why + '／' + sf.s.name + 'には、部屋に残る恋人（' + sf.o.name + '）がいる。場面は三人までにして、' + sf.s.name + 'が残った', with: g.concat([sf.o]), lewd: night ? true : undefined };
    }
    g.forEach(function (c) {
      c.out = true; c.fate = '脱出';
      c.fateNote = g.filter(function (o) { return o !== c; }).map(function (o) { return o.name; }).join('と') + 'と、' + kn(g.length) + 'で部屋を出た';
      c.flags.trio = g.map(function (o) { return o.i; });
    });
    pairsOf(g).forEach(function (pr) { ctx.mod2(pr[0], pr[1], { trust: 8, aff: 4 }, { trust: 8, aff: 4 }); if (night && okSex(pr[0], pr[1])) ctx.pair(pr[0], pr[1]).night = true; });
    var ex = { group: g.map(function (c) { return c.i; }), label: ctx.label, trio: true, night: !!night, kind: kind || 'warm' };
    (ctx.flags.exits = ctx.flags.exits || []).push(ex);
    ctx.flags.trios.push(ex);
    return { cat: 'escape', mag: 40, text: text + '扉の鍵が外れる音がした。' + nm3(g) + 'は、' + kn(g.length) + 'そろって部屋を出た。', why: why, with: g, lewd: night ? true : undefined };
  };

  /* 「一人だけ」と決めた人を、三人に誘う（説得）。折れれば、次から三人の場面に入れる */
  EV.push({
    id: 'trio_persuade', cat: 'romance', scope: 'pair', pri: true,
    when: function (ctx, a, b) {
      if (!allowed(ctx) || !ctx.flags.multiKnown || ctx.present().length < 3 || !free(a) || !free(b) || ctx.flags.trioCur) return false;
      if (!b.flags.excl || b.flags.exclOpen || (b.flags.persuadeAt === ctx.stepIndex) || (b.flags.persuadeN || 0) >= 3) return false;
      if (ctx.stepIndex - (b.flags.partnerAt || 0) < 1) return false;
      /* 家族（恋愛：なし）の二人が入る三人には誘わない */
      if (family(ctx, a, b)) return false;
      var third = ctx.present().filter(function (c) { return c !== a && c !== b && free(c) && HK.canLove(b, c) && !family(ctx, a, c) && !family(ctx, b, c); })[0];
      if (!third) return false;
      return a.i === b.flags.partner ? A.eager(ctx, a) > 0.45 || a.tr.np > 0.6 : A.eager(ctx, a) > 0.55 && R(ctx, a, b).att > 15;
    },
    w: function (ctx, a, b) { return 0.5 + A.eager(ctx, a) + (a.i === b.flags.partner ? 0.5 : 0); },
    run: function (ctx, a, b) {
      var isP = a.i === b.flags.partner;
      var c = ctx.present().filter(function (x) { return x !== a && x !== b && free(x) && HK.canLove(b, x) && !family(ctx, a, x) && !family(ctx, b, x); }).sort(function (x, y) { return R(ctx, b, y).att - R(ctx, b, x).att; })[0];
      b.flags.persuadeAt = ctx.stepIndex; b.flags.persuadeN = (b.flags.persuadeN || 0) + 1;
      var ch = 0.2 + R(ctx, b, a).trust / 110 + R(ctx, b, a).att / 130 + A.eager(ctx, b) * 0.4 - b.tr.cp * 0.3 + (isP ? 0.15 : 0) + b.stress / 300 + (b.flags.persuadeN - 1) * 0.1 + Math.max(0, R(ctx, b, c).att) / 150;
      var ok = ctx.rng() < ch;
      var t = ctx.t(ctx.pick(isP ? [
        '{a}は{b}の手を取った。{a}「三人で、なんて……{b}が嫌ならやめる。でも、{c}を一人にしておけないんだ｜三人で、というのは……{b}が嫌ならやめる。だが、{c}を一人にはしておけない｜三人で、なんて……{b}が嫌ならやめます。でも、{c}を一人にしておけないんです」',
        '{a}は{b}の耳元で囁いた。{a}「私は{b}が一番だよ。それは変わらない。……{c}も、一緒にいてほしい｜私は{b}が一番だ。それは変わらない。……{c}にも、一緒にいてほしい｜私は{b}が一番ですよ。それは変わりません。……{c}にも、一緒にいてほしいんです」',
        '{a}「{b}が決めたことは分かってる。でも、このままじゃ{c}だけ出られない｜{b}が決めたことは分かっている。だが、このままでは{c}だけ出られない｜{b}が決めたことは分かっています。でも、このままじゃ{c}だけ出られません」'
      ] : [
        '{a}が{b}の前に座り込んだ。{a}「{b}が一人だけって決めてるのは知ってる。でも、三人なら早く出られる｜{b}が一人だけと決めているのは知っている。だが、三人なら早く出られる｜{b}が一人だけと決めているのは知っています。でも、三人なら早く出られます」',
        '{a}は{b}に頭を下げた。{a}「お願い。邪魔はしない。端っこにいさせてくれるだけでいいから｜頼む。邪魔はしない。端にいさせてくれるだけでいい｜お願いします。邪魔はしません。端っこにいさせてくれるだけでいいですから」',
        '{a}「ねえ{b}、決め事って、たまには破ってもいいと思う｜なあ{b}、決め事は、たまには破ってもいいと思う｜ねえ{b}、決め事って、たまには破ってもいいと思います」'
      ]), a, b, c);
      if (ok) {
        b.flags.exclOpen = true;
        ctx.mod2(b, a, { trust: 4, att: 3 }, { trust: 4, att: 3 });
        t += ctx.t(ctx.pick([
          '{b}は長いこと黙っていた。それから、{a}の顔を見ずに小さく頷いた。{b}「……{a}がそこまで言うなら｜＝｜……{a}がそこまでおっしゃるなら」',
          '{b}はため息をついた。{b}「……今回だけ。それに、{a}が隣にいるなら｜……今回だけだ。それに、{a}が隣にいるなら｜……今回だけですよ。それに、{a}が隣にいるなら」',
          '{b}は{c}の方をちらりと見て、目を伏せた。{b}「……分かった。仲間外れは、させたくない｜＝｜……分かりました。仲間外れは、させたくありません」'
        ]), a, b, c);
        return { text: t, why: a.name + 'が、「相手は一人だけ」と決めていた' + b.name + 'を説得した（' + (isP ? '決めた相手からの頼み・' : '') + '信頼・惹かれ）。' + b.name + 'は三人に加わってもいいと思い始めた', mag: 16, with: c ? [c] : [] };
      }
      ctx.mod2(b, a, { ten: 4 }, { ten: 2 });
      t += ctx.t(ctx.pick([
        '{b}は首を振った。{b}「最初に言ったよね。他の人とは無理｜最初に言ったはずだ。他の人とは無理だ｜最初に言いましたよね。他の人とは無理です」',
        '{b}は{a}の手をそっと外した。{b}「……ごめん。そこは、譲れない｜……すまない。そこは、譲れない｜……ごめんなさい。そこは、譲れません」',
        '{b}は黙って、壁の方を向いてしまった。'
      ]), a, b, c);
      return { text: t, why: b.name + 'は「相手は一人だけ」という決め事を曲げなかった（CP・積極性の低さ）', mag: 10, with: c ? [c] : [] };
    }
  });
  /* ---------- 三人ちょうど：受けに回れる人が一人でもいれば、三人の場面（3P）が自然に起こる ----------
     ・この回が三人に向かうかは、性格（積極性・奔放・内気・CP）と関係（「相手は一人だけ」の決め事・媚薬）から確率を出して、一度だけ決める（二人ずつ成立する回も残る）
     ・形は shape()（受け攻めの決まりどおり。自分で攻めを選んだ人は受けの役に置かない。okSex でない二人は直接は繋がらない）
     ・きっかけは状況から：二人が先に始めていれば途中参加（join）、媚薬が回っていれば熱（aphro）、二人が一人に惹かれていれば hub、恋人がいれば invite、全員積極的なら free、終盤なら late、ほかは auto */
  function trioProb(ctx, g) {
    var avg = function (f) { return g.reduce(function (s, c) { return s + f(c); }, 0) / g.length; };
    var p = 0.62 + (avg(function (c) { return A.eager(ctx, c); }) - 0.35) * 0.7;
    if (g.some(function (c) { return HK.Pos && HK.Pos.nori && HK.Pos.nori(c); })) p += 0.08;
    p -= avg(function (c) { return c.tr.ac; }) * 0.2 + avg(function (c) { return c.tr.cp; }) * 0.15;
    p -= g.filter(function (c) { return c.flags.excl && !c.flags.exclOpen; }).length * 0.1;
    if (ctx.flags.hasAphroRule) p += 0.1;
    p += (+ctx.env.pressure || 50) / 1000;
    /* 円満な三人（全員が恋人どうし）は、三人で過ごすのが自然 */
    if (harmony(ctx, g)) p = Math.max(p + 0.25, 0.8);
    return HK.clamp(p, 0.3, 0.95);
  }
  function roll(ctx) {
    var g = ctx.present();
    if (ctx.flags.trioRoll == null) {
      if (g.length !== 3) return false;
      var p = trioProb(ctx, g);
      ctx.flags.trioProb = p;
      ctx.flags.trioRoll = ctx.rng() < p ? 'y' : 'n';
    }
    /* 二人ずつの回でも、終盤に誰も出られず全員が焦っていれば、「時間がない」で三人に転ぶことがある（一度だけ判定） */
    if (ctx.flags.trioRoll === 'n' && !ctx.flags.trioLate && g.length === 3 && ctx.stepIndex >= ctx.stepsTotal * 0.65 && !(ctx.flags.exits || []).length && g.every(function (c) { return c.stress > 55 || c.flags.resign; })) {
      ctx.flags.trioLate = true;
      if (ctx.rng() < 0.5) { ctx.flags.trioRoll = 'y'; ctx.flags.trioProb = 0.5; }
    }
    return ctx.flags.trioRoll === 'y';
  }
  T.roll = roll;
  function aphroHot(ctx, g) {
    var n = function (th) { return g.filter(function (c) { return (c.flags.aphro || 0) >= th; }).length; }, sum = g.reduce(function (s, c) { return s + (c.flags.aphro || 0); }, 0);
    return n(2) >= 2 || (sum >= 5 && n(1.5) >= 2) || sum >= 7;
  }
  function donePair(ctx, g) { return pairsOf(g).filter(function (p) { return (A.prog(ctx, p[0], p[1]).act.h || 0) > 0; })[0] || null; }
  /* 三人の場面を始めてよい頃合いか：媚薬が回った／二人が先に始めていた／どこかの二人がその気（willing・desperate）／時間が四割過ぎた */
  function ready(ctx, g) {
    if (ctx.stepIndex < 1) return false;
    if (aphroHot(ctx, g) || donePair(ctx, g)) return true;
    var lv = Math.min(maxLvl(ctx), 5);
    if (pairsOf(g).some(function (p) { return okSex(p[0], p[1]) && (A.willing(ctx, p[0], p[1], lv) || A.desperate(ctx, p[0], p[1], lv)); })) return true;
    return ctx.stepIndex >= ctx.stepsTotal * 0.4;
  }
  /* 「相手は一人だけ」と決めた人：三人ちょうどなら、少し時間が経てば加わる（嫉妬深い人は、決めた相手をもう一人と二人きりにしないために加わる） */
  function exclOK3(ctx, c, g) {
    if (!c.flags.excl || c.flags.exclOpen || harmony(ctx, g)) return true;
    var el = ctx.stepIndex - (c.flags.partnerAt || 0), p = c.flags.partner != null ? ctx.chars[c.flags.partner] : null;
    if (el >= 1 && p && isJealous(ctx, c, p)) return true;
    if (el >= 2 && (A.eager(ctx, c) > 0.35 || c.stress > 40)) return true;
    return c.stress > 70 && ctx.stepIndex >= ctx.stepsTotal * 0.6;
  }
  function kindFor(ctx, g) {
    if (harmony(ctx, g)) return loveKind(ctx, g);
    if (aphroHot(ctx, g)) return 'aphro';
    if (donePair(ctx, g)) return 'join';
    var cands = ['auto'];
    g.forEach(function (h) {
      var o = g.filter(function (c) { return c !== h; });
      if (R(ctx, o[0], h).att > 30 && R(ctx, o[1], h).att > 30 && HK.canLove(o[0], h) && HK.canLove(o[1], h)) cands.push('hub');
    });
    if (pairsOf(g).some(function (p) { return partnered(ctx, p[0], p[1]); })) cands.push('invite');
    if (g.every(function (c) { return A.eager(ctx, c) > 0.5; })) cands.push('free');
    if (ctx.stepIndex >= ctx.stepsTotal * 0.6 && g.every(function (c) { return c.stress > 45 || c.flags.resign; })) cands.push('late');
    return ctx.rng.pick(cands);
  }
  /* 文の役 {h}{x}{y}：{h} は二人から求められる人（hub なら中心、twoOne なら受け、oneTwo なら攻め、サンドイッチなら真ん中、途中参加ならあとから加わった人、hub/invite はきっかけの中心） */
  function orderG(ctx, g, sh, sp, kind) {
    var h;
    if (kind === 'join') { var dp = donePair(ctx, g); h = g.filter(function (c) { return dp.indexOf(c) < 0; })[0]; }
    else if (kind === 'hub') h = g.slice().sort(function (p, q) { var s = function (c) { return g.reduce(function (t, o) { return o === c ? t : t + R(ctx, o, c).att; }, 0); }; return s(q) - s(p); })[0];
    else if (kind === 'lovehub') h = harmonyOf(ctx, g).hub;
    else if (kind === 'loveclash') h = clashOf(ctx, g).w;
    else if (kind === 'invite') h = g.filter(function (c) { return g.filter(function (o) { return o !== c; }).every(function (o) { return !partnered(ctx, c, o); }); })[0];
    if (!h) h = sh.hubOnly ? sh.sg[0] : sp.p === 'twoOne' ? sp.u : sp.p === 'oneTwo' ? sp.t : sp.p === 'sandwich' ? sp.m : sh.sg[0];
    return [h].concat(g.filter(function (c) { return c !== h; }));
  }
  /* 「一人だけ」と決めていた人が加わるときの一言 */
  var TURN = L('{a}は、「相手は一人だけ」と言ったときのことを思い出した。あれから何時間も経って、気持ちは少しずつ変わっていた。|{a}は、自分で決めたはずの線を、もう一度見直していた。この部屋で過ごした時間が、それを書き換えていた。');
  var TURN_LATE = L('{a}は、「他の人とは無理｜他の人とは無理だ｜他の人とは無理です」と言った自分を思い出した。けれど、もう時間がなかった。|{a}は唇を噛んだ。最初の決め事より、ここを出ることの方が大事になっていた。');
  var TURN_JEAL = L('{a}は、{b}をもう一人と二人きりにするくらいなら、と自分も加わることにした。決め事を曲げたのは、嫉妬だった。|{a}「……{b}を一人で行かせるより、ましだ｜＝｜……{b}を一人で行かせるより、ましです」{a}はそう言って、決めたはずの線を自分で踏み越えた。|{a}は{b}の手を離さなかった。離さないまま、三人の輪の中に入っていった。');
  function turnText(ctx, g) {
    if (harmony(ctx, g)) { g.forEach(function (c) { if (c.flags.excl) c.flags.exclOpen = true; }); return ''; }
    return g.filter(function (c) { return c.flags.excl && !c.flags.exclOpen; }).map(function (c) {
      c.flags.exclOpen = true;
      var p = c.flags.partner != null ? ctx.chars[c.flags.partner] : null;
      var late = c.stress > 70 && ctx.stepIndex >= ctx.stepsTotal * 0.6;
      if (p && isJealous(ctx, c, p) && !late) return ctx.t(ctx.pick(TURN_JEAL), c, p);
      return ctx.t(ctx.pick(late ? TURN_LATE : TURN), c);
    }).join('');
  }
  var KIND_WHY = { loveclash: '二人の恋人が、同じ一人にそろって執着していた。円満ではなく、激しい取り合いになった', love: '三人とも互いに恋人どうしで、円満だった', lovehub: '一人が残りの二人の両方と恋人（または友達以上恋人未満）で、残りの二人も仲がよい。円満な三人', hub: '二人が同じ一人に惹かれていた', invite: '恋人同士が、残る一人を誘った', free: '三人とも積極的だった', late: '残り時間への焦り。三人なら一度で済む', warm: '三人とも、互いに打ち解けていた', auto: '三人ちょうどで、受けに回れる人がいた', join: '二人が先に始めていて、三人目が加わった', aphro: '媚薬が三人に回っていた' };
  function infoWhy(ctx, sh) {
    var info = ctx.flags.lastTrioInfo;
    if (!info) return '';
    var hubNote = sh && sh.hubOnly ? '（' + pairsOf(sh.sg).filter(function (p) { return !okSex(p[0], p[1]); }).map(function (p) { return p[0].name + 'と' + p[1].name; }).join('・') + 'は直接は繋がらない）' : '';
    return '／形：' + (SHAPE_LABEL[info.p] || info.p) + hubNote + '／嫉妬：' + JEAL_LABEL[info.jeal] + (info.j ? '（' + info.j + '）' : '') + '／受けの開放度：' + OPEN_LABEL[info.open] + (info.s ? '（' + info.s + '）' : '') + (info.after ? '／結末：' + { sour: '険悪', bond: '連帯', yield: '折れた' }[info.after] : '');
  }
  EV.push({
    id: 'trio_auto', cat: 'romance', sex: true, scope: 'pair', pri: true,
    when: function (ctx, a, b) {
      if (!allowed(ctx) || !ctx.flags.multiKnown || ctx.flags.trioCur) return false;
      var g = ctx.present();
      if (g.length !== 3 || !g.every(free)) return false;
      if (!hasH(ctx) && !(ctx.flags.hasAphroRule && aphroHot(ctx, g))) return false;
      if (done3(ctx, g) || pairsOf(g).some(function (p) { return family(ctx, p[0], p[1]); })) return false;
      if (g.some(function (c) { return c.flags.trioNo; })) return false;
      if (!g.some(canBottom) || !(loveShape(ctx, g) || sexShape(g, false))) return false;
      if (!roll(ctx)) return false;
      if (!g.every(function (c) { return exclOK3(ctx, c, g); })) return false;
      return ready(ctx, g);
    },
    w: function (ctx) { var g = ctx.present(); return 5.5 + g.reduce(function (s, c) { return s + A.eager(ctx, c); }, 0) * 1.5 + (aphroHot(ctx, g) ? 2 : 0) + (donePair(ctx, g) ? 1.5 : 0); },
    run: function (ctx, a, b) {
      var g = ctx.present();
      var sh = loveShape(ctx, g) || sexShape(g, false);
      if (!sh) return null;
      var sp = shape(ctx, sh.sg, sh.hubOnly), kind = kindFor(ctx, g), go = orderG(ctx, g, sh, sp, kind);
      var turn = turnText(ctx, g);
      ctx.flags.trioCur = { g: g.map(function (c) { return c.i; }), kind: kind };
      g.forEach(function (c) { c.flags.partner = null; });
      count(ctx, g);
      pairsOf(g).forEach(function (pr) { ctx.mod2(pr[0], pr[1], { att: 8, aff: 5, trust: 4 }, { att: 8, aff: 5, trust: 4 }); if (okSex(pr[0], pr[1])) ctx.pair(pr[0], pr[1]).heatDone = true; });
      var text = turn + scene(ctx, go, kind, true, 3, { sg: go, hubOnly: sh.hubOnly, sp: sp }, !hasH(ctx));
      var why = '三人の場面：' + KIND_WHY[kind] + infoWhy(ctx, sh) + '／三人になる確率 ' + Math.round((ctx.flags.trioProb || 0) * 100) + '%（積極性・奔放・内気・CP・決め事・媚薬から）／但し書き：三人以上で同時なら全員分';
      if (ctx.flags.lastTrioTags && ctx.flags.lastTrioTags.length) { why += '／見所：' + ctx.flags.lastTrioTags.join('・'); ctx.flags.lastTrioTags = null; }
      var third = g.filter(function (c) { return c !== a && c !== b; });
      if (done3(ctx, g)) { ctx.flags.trioCur = null; return T.exitGroup(ctx, g, text, why, hasH(ctx), kind); }
      return { text: text + progText(ctx, g) + '扉はまだ開かない。', why: why, mag: 30, with: third };
    }
  });
  /* 媚薬だけの部屋（二人の条件がない）：媚薬が三人に回れば、熱に呑まれて三人で（一度だけ。条件の数には関わらない） */
  EV.push({
    id: 'trio_heat', cat: 'romance', sex: true, scope: 'pair', pri: true,
    when: function (ctx, a, b) {
      if (multiOf(ctx) === 'no' || ctx.flags.isOne || ctx.flags.oneCond || A.hasPairRule(ctx) || !ctx.flags.hasAphroRule || ctx.flags.trioHeat) return false;
      var g = ctx.present();
      if (g.length !== 3 || !g.every(free) || !aphroHot(ctx, g)) return false;
      if (pairsOf(g).some(function (p) { return family(ctx, p[0], p[1]); })) return false;
      if (!g.some(canBottom) || !(loveShape(ctx, g) || sexShape(g, false))) return false;
      return roll(ctx);
    },
    w: function (ctx) { var g = ctx.present(); return 4 + g.reduce(function (s, c) { return s + (c.flags.aphro || 0); }, 0) / 3; },
    run: function (ctx, a, b) {
      var g = ctx.present(), sh = loveShape(ctx, g) || sexShape(g, false);
      if (!sh) return null;
      ctx.flags.trioHeat = true;
      var hk = loveKind(ctx, g) || 'aphro';
      var sp = shape(ctx, sh.sg, sh.hubOnly), go = orderG(ctx, g, sh, sp, hk);
      pairsOf(g).forEach(function (pr) { var pf = ctx.pair(pr[0], pr[1]); pf.heatDone = true; if (okSex(pr[0], pr[1])) pf.night = true; ctx.mod2(pr[0], pr[1], { att: 10, aff: 4 }, { att: 10, aff: 4 }); });
      var text = scene(ctx, go, hk, true, 3, { sg: go, hubOnly: sh.hubOnly, sp: sp }, true);
      var why = '三人の場面：' + (isLoveAny(hk) ? KIND_WHY[hk] + '。' : '') + '媚薬が三人に回っていた（' + g.map(function (c) { return Math.round(c.flags.aphro || 0); }).join('・') + '）' + infoWhy(ctx, sh);
      if (ctx.flags.lastTrioTags && ctx.flags.lastTrioTags.length) { why += '／見所：' + ctx.flags.lastTrioTags.join('・'); ctx.flags.lastTrioTags = null; }
      return { text: text, why: why, mag: 30, with: g.filter(function (c) { return c !== a && c !== b; }) };
    }
  });
  EV.push({
    id: 'trio', cat: 'romance', sex: true, scope: 'pair', pri: true,
    when: function (ctx, a, b) {
      if (!allowed(ctx) || !ctx.flags.multiKnown || ctx.present().length < 3 || !free(a) || !free(b)) return false;
      if (ctx.flags.trioCur) return false;
      /* 三人ちょうどの部屋では、この回が三人に向かうかの決め（roll）に従う（二人ずつ成立する回を残す） */
      if (ctx.present().length === 3 && hasH(ctx) && !roll(ctx)) return false;
      var pl = plan(ctx, a, b);
      ctx._trioPlan = pl;
      return !!pl;
    },
    w: function (ctx, a, b) { var pl = plan(ctx, a, b); return pl ? 0.6 + pl.v * 0.9 : 0; },
    run: function (ctx, a, b) {
      var pl = plan(ctx, a, b);
      if (!pl) return { text: ctx.t('{a}と{b}は、紙の但し書きをもう一度読んだ。', a, b) };
      var g = pl.g;
      /* 三人のうち誰かが強く拒むことがある（CP・恋人への操） */
      var refuser = g.filter(function (c) { return c.tr.cp > 0.72 && A.eager(ctx, c) < 0.35 && pl.kind !== 'late' && !isLoveAny(pl.kind); })[0];
      if (refuser) {
        refuser.flags.trioNo = true;
        g.forEach(function (c) { if (c !== refuser) ctx.mod(refuser, c, { ten: 6 }); });
        return { cat: 'conflict', text: ctx.t(ctx.pick(['{a}は「三人で、なんて絶対に無理｜三人で、というのは絶対に無理だ｜三人で、なんて絶対に無理です」と首を振った。話は、そこで終わった。', '{a}は但し書きの紙を裏返して、「見なかったことにする｜＝｜見なかったことにします」と言った。', '{a}「私は、するなら一人とだけ。それは譲れない｜私は、するなら一人とだけだ。それは譲れない｜私は、するなら一人とだけです。それは譲れません」']), refuser), why: refuser.name + 'のCP（' + Math.round(refuser.eg.CP) + '）：三人でという形には頷けなかった', mag: 12, with: g.filter(function (c) { return c !== refuser; }) };
      }
      /* 「一人だけ」と決めていた人が加わるなら、気持ちが変わったことを一言はさむ（説得されていれば、その場面がすでにある） */
      var turn = isLoveAny(pl.kind) ? '' : g.filter(function (c) { return c.flags.excl && !c.flags.exclOpen; }).map(function (c) {
        c.flags.exclOpen = true;
        var late = c.stress > 70 && ctx.stepIndex >= ctx.stepsTotal * 0.7;
        return ctx.t(ctx.pick(late ? ['{a}は、「他の人とは無理｜他の人とは無理だ｜他の人とは無理です」と言った自分を思い出した。けれど、もう時間がなかった。', '{a}は唇を噛んだ。最初の決め事より、ここを出ることの方が大事になっていた。']
          : ['{a}は、「相手は一人だけ」と言ったときのことを思い出した。あれから何時間も経って、気持ちは少しずつ変わっていた。', '{a}は、自分で決めたはずの線を、もう一度見直していた。この部屋で過ごした時間が、それを書き換えていた。']), c);
      }).join('');
      ctx.flags.trioCur = { g: g.map(function (c) { return c.i; }), kind: pl.kind };
      g.forEach(function (c) { c.flags.partner = null; });
      count(ctx, g);
      pairsOf(g).forEach(function (pr) { ctx.mod2(pr[0], pr[1], { att: 8, aff: 5, trust: 4 }, { att: 8, aff: 5, trust: 4 }); });
      ctx.present().filter(function (o) { return g.indexOf(o) < 0; }).forEach(function (o) { g.forEach(function (c) { ctx.mod(o, c, { ten: 3 }); }); ctx.stress(o, 5); });
      var text = turn + scene(ctx, g, pl.kind, true, ctx.present().length);
      var why = '三人の場面：' + { loveclash: g[1].name + 'と' + g[2].name + 'はどちらも' + g[0].name + 'の恋人で、どちらも' + g[0].name + 'に執着していた。激しい取り合いになった', love: KIND_WHY.love, lovehub: g[0].name + 'は' + g[1].name + 'と' + g[2].name + 'の両方と恋人（または友達以上恋人未満）で、' + g[1].name + 'と' + g[2].name + 'も仲がよい。円満な三人', hub: g[1].name + 'と' + g[2].name + 'がどちらも' + g[0].name + 'に惹かれていた。' + g[0].name + 'は選ばなかった', invite: g[1].name + 'と' + g[2].name + 'は、' + g[0].name + 'を一人で残したくなかった', free: '三人とも積極的だった（' + g.map(function (c) { return Math.round(A.eager(ctx, c) * 100); }).join('・') + '）', late: '残り時間への焦り。三人なら一度で済む', warm: '三人とも、互いに打ち解けていた' }[pl.kind] + infoWhy(ctx, null) + '／但し書き：三人以上で同時なら全員分';
      if (ctx.flags.lastTrioTags && ctx.flags.lastTrioTags.length) { why += '／見所：' + ctx.flags.lastTrioTags.join('・'); ctx.flags.lastTrioTags = null; }
      if (done3(ctx, g)) { ctx.flags.trioCur = null; return T.exitGroup(ctx, g, text, why, hasH(ctx), pl.kind); }
      return { text: text + progText(ctx, g) + '扉はまだ開かない。', why: why, mag: 30, with: g.filter(function (c) { return c !== a && c !== b; }) };
    }
  });
  /* 二回目以降（回数が多い条件のとき） */
  EV.push({
    id: 'trio_more', cat: 'romance', sex: true, scope: 'solo', pri: true,
    when: function (ctx, a) {
      var c = ctx.flags.trioCur;
      if (!c) return false;
      /* 三人のうち誰かが亡くなった・部屋を出た・監禁されたら、三人の続きは終わり */
      if (!c.g.every(function (i) { return free(ctx.chars[i]); })) { ctx.flags.trioCur = null; return false; }
      return c.g.indexOf(a.i) >= 0;
    },
    w: function () { return 2.2; },
    run: function (ctx, a) {
      var c = ctx.flags.trioCur, g = c.g.map(function (i) { return ctx.chars[i]; });
      count(ctx, g);
      var text = scene(ctx, g, c.kind, false);
      if (done3(ctx, g)) { ctx.flags.trioCur = null; return T.exitGroup(ctx, g, text, '三人で、条件の回数を重ねきった', hasH(ctx), c.kind); }
      return { text: text + progText(ctx, g), why: '三人で条件を重ねていく', mag: 12, with: g.filter(function (x) { return x !== a; }) };
    }
  });

  /* ---------- 部屋を出たあとの三人 ---------- */
  T.bond = function (ctx, g) {
    var ps = pairsOf(g), v = ps.map(function (pr) { return Math.min(R(ctx, pr[0], pr[1]).aff + R(ctx, pr[0], pr[1]).att * 0.6, R(ctx, pr[1], pr[0]).aff + R(ctx, pr[1], pr[0]).att * 0.6); });
    var mn = Math.min.apply(null, v), av = v.reduce(function (s, x) { return s + x; }, 0) / v.length;
    var ten = Math.max.apply(null, ps.map(function (pr) { return Math.max(R(ctx, pr[0], pr[1]).ten, R(ctx, pr[1], pr[0]).ten); }));
    if (av > 55 && mn > 30 && ten < 40) return 'marry';
    if (av > 32 && ten < 55) return 'secret';
    if (ten >= 55) return 'jealous';
    return 'forget';
  };
  /* 円満な三人（全員が恋人どうし）が部屋を出たあと */
  var LOVE_BOND = L('三人は部屋を出ると、自然に手を繋いだ。{a}が真ん中で、{b}と{c}が両側だった。帰り道、誰も「この先どうする」とは訊かなかった。答えは、もう三人とも知っていた。|部屋を出た夜、三人はいつもの部屋に帰って、同じ毛布にくるまった。{b}が「怖かった？｜怖かったか？｜怖かったですか？」と訊くと、{a}は首を振った。{c}が「三人だったから｜三人だったからだ｜三人でしたから」と代わりに答えた。|しばらくして、三人は揃いの指輪を作った。三人で恋人になったときから決めていたことを、あの白い部屋が少しだけ早めた。{a}は指輪を眺めながら、「次は、窓のある部屋がいい｜＝｜次は、窓のある部屋がいいです」と笑った。|三人の暮らしは、部屋を出たあとも何も変わらなかった。朝は{b}が珈琲を淹れ、{c}が寝坊し、{a}が二人を起こした。変わったのは、三人で笑う理由が一つ増えたことだけだった。');
  /* 二人の恋人が同じ一人（{a}）を取り合う三人が部屋を出たあと（{b}{c}が執着している二人） */
  var CLASH_BOND = L('部屋を出たあとも、{b}と{c}は{a}の両腕を一本ずつ離さなかった。どちらが{a}の隣を歩くかで、帰り道のあいだじゅう張り合っていた。{a}は困った顔で、それでも二人の手を握り返していた。|それからも三人は一緒にいた。{b}と{c}は相変わらず{a}を奪い合い、{a}はそのたびに二人の間に割って入った。誰も、三人をやめるとは言わなかった。|{a}の部屋には、歯ブラシが三本並ぶようになった。{b}と{c}は、どちらが{a}の隣で眠るかを毎晩のように争った。{a}は二人の真ん中で眠ることにして、争いを終わらせた。');
  /* 中心のある円満な三人（{a}以外の二人のどちらかが中心とは限らないので、三人の名で書く） */
  var HUB_BOND = L('部屋を出たあとも、三人の形は変わらなかった。{a}と{b}と{c}は、誰か一人が欠けることを、もう考えなかった。三人で過ごす夜は、それからも続いた。|三人は外に出ると、近くの店で朝ご飯を食べた。誰がどこに座るかで少しだけ揉めて、結局いつもの並びになった。あの部屋のことは、三人だけの思い出になった。|部屋を出た三人は、それからも同じように会い続けた。二人の恋人と、恋人を同じくする親友。名前のつけにくい関係だったが、三人ともそれを気に入っていた。');
  T.BOND_LABEL = { marry: '三人婚', secret: '三人だけの秘密の関係', jealous: '三人のうち一人が揺れている', forget: 'なかったことにした' };
  var BOND_TEXT = {
    marry: L('部屋を出てしばらくして、{a}・{b}・{c}は一緒に暮らし始めた。誰か一人を選ぶ必要は、もうなかった。|半年後、三人は揃いの指輪をはめていた。形のない約束だったが、三人にはそれで十分だった。|三人はそれからも、休みのたびに同じ部屋に集まった。いつの間にか、そこが三人の家になっていた。'),
    secret: L('部屋を出たあとも、三人はときどき集まった。それが何という関係なのか、誰も名前をつけなかった。|三人のグループチャットは、外から見ればただの友達同士だった。夜にだけ、少しだけ違う会話が流れた。'),
    jealous: L('部屋を出たあと、{a}は二人が並んで歩く背中を、少しだけ寂しそうに見ていた。三人の形は、まだ定まっていなかった。|三人はそれからも会ったが、誰か一人が先に帰る夜が増えていった。'),
    forget: L('部屋を出た三人は、あの部屋でのことを一度も口にしなかった。それが、三人の出した答えだった。|三人は外で別れるとき、「じゃあ、また｜では、また｜では、またお会いしましょう」とだけ言った。また、があるのかは分からなかった。')
  };
  function loveBoth(ctx, x, y) { return HK.canLove(x, y) && HK.canLove(y, x) && !(HK.Poly && HK.Poly.faithBlocked && HK.Poly.faithBlocked(ctx, x, y)); }
  function marryOk(ctx, g) {
    if (HK.Poly && HK.Poly.mode && HK.Poly.mode(ctx) === 'none') return false;
    return g.some(function (h) { return g.every(function (o) { return o === h || loveBoth(ctx, h, o); }); });
  }
  scen.finish = function (ctx) {
    finish0(ctx);
    (ctx.flags.trios || []).forEach(function (ex) {
      var g = ex.group.map(function (i) { return ctx.chars[i]; });
      var bd = T.bond(ctx, g), lv = ex.kind === 'love' && harmony(ctx, g), lh = ex.kind === 'lovehub' && harmony(ctx, g), lc = ex.kind === 'loveclash' && harmony(ctx, g);
      /* 円満な三人は、張りつめた緊張がなければ三人婚に。中心のある三人は、なかったことにはしない */
      if (lv && bd !== 'jealous') bd = 'marry';
      if (lh && bd === 'forget') bd = 'secret';
      /* 三人婚（一緒に暮らす・揃いの指輪）は、複数の恋人を認める設定（poly.js の「あり」「秘密」）のときだけ。「なし」では、三人だけの秘密の関係にとどめる。
         三人とも互いに恋人どうしの三人（lv）・中心のある円満な三人（lh）は関係の設定で恋人にした組なので、そのまま。
         どの設定でも、二人の両方と恋愛として成り立つ人（恋愛対象・恋愛相手の固定・恋愛にしない相手・一途を両方向で見る）がいない三人は、三人婚にしない */
      if (bd === 'marry' && !lv && !lh && !marryOk(ctx, g)) bd = 'secret';
      ex.bond = bd; ex.bondLabel = T.BOND_LABEL[bd];
      /* 円満な三人は、恋人たちの組として記録する（poly.js の ctx.flags.polyGroups。結果のラベル「三人で円満」「一人を二人が愛している」） */
      if (HK.Poly && (lv || lh) && bd !== 'jealous') HK.Poly.register(ctx, g, lh ? (harmonyOf(ctx, g) || {}).hub : null);
      var lone = bd === 'jealous' ? g.slice().sort(function (p, q) { var s = function (c) { return g.reduce(function (t, o) { return o === c ? t : t + R(ctx, o, c).aff; }, 0); }; return s(p) - s(q); })[0] : g[0];
      var cw = lc ? clashOf(ctx, g) : null;
      if (cw) lone = cw.w;
      var order = [lone].concat(g.filter(function (c) { return c !== lone; }));
      g.forEach(function (c) { c.fateNote += '。その後は「' + ex.bondLabel + '」'; });
      ctx.say({ kind: 'event', cat: 'romance', actors: g, text: ctx.t(ctx.pick(lc ? CLASH_BOND : lv && bd === 'marry' ? LOVE_BOND : lh && bd !== 'jealous' ? HUB_BOND : BOND_TEXT[bd]), order[0], order[1], order[2] || order[1]), why: '部屋を出たあとの三人：' + (lc ? '二人の恋人が同じ一人を取り合う三人だった。' : lv ? '三人とも恋人どうしで、円満だった。' : lh ? '中心のある円満な三人だった。' : '') + '三人のあいだの好意と緊張から', mag: 20 });
    });
  };
})();
