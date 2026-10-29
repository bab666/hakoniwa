/* 箱庭シミュレーター: 複数人での交際（恋人の数の設定）と「一途」（全エンジン箱庭・物語型で共通。全年齢版も同じ）
   全体の設定「複数の恋人」（HK.GLOBAL_ENV の poly。events-common.js が足す）
   ・なし（none・既定）：恋人は一人まで。恋人がいる人が別の人と恋人になるときは「乗り換え」（前の恋人と別れる。二股にはしない）
   ・あり（any）：複数の恋人を認める。恋人がつながった三人以上は ctx.flags.polyGroups に {members, hub?, known:true} で持つ
   ・秘密（secret）：複数持てるが、恋人どうしは互いを知らない（known:false。三人とも互いに恋人どうしの三人は、互いを知っている）。発覚の出来事 poly_found（rel-group.js が足す）で修復か破局
   設定の関係で、はじめから同じ人に恋人を二人つけた組は、「なし」でもそのまま認める（利用者の設定を優先）
   ・HK.Poly.lovers(ctx, c)：恋人の一覧（pf.couple）
   ・HK.Poly.canCouple(ctx, a, b)：恋人にしてよいか（なし：どちらにも別の恋人がいない・本命がいれば本命だけ。一途の人は恋人がいる間は誰とも）
   ・HK.Poly.canTry(ctx, a, b)：告白などを起こしてよいか（恋人にしてよい、または「なし」で乗り換えの気持ちが育っている）
   ・恋人になった瞬間（pf.couple が真になったとき。engine.js の Ctx.pair が HK.Poly.watch で見張る）に、
     「なし」で別の恋人がいれば乗り換えにする（前の恋人と別れる・前の恋人のストレス・brokeAt・乗り換えの一文）
   一途（住人の設定 faithful）：恋人ができたら、その恋人がいる間は、ほかの人と恋愛・夜の場面にならない（engine.js の romanceOk と sexOne が呼ぶ）
   台詞の一人称は「私」で書き、口調の言い換えに任せる。登場人物はすべて成人として扱う */
(function () {
  'use strict';
  var HK = window.HK;
  if (!HK) return;
  function L(s) { return s.split('|'); }
  var P = HK.Poly = {};
  var PK = ['proud', 'stern', 'tsun', 'gentle', 'devoted', 'cool', 'free', 'shy', 'polite'];
  function per(c) { var k = c && (c.persona || (HK.personaOf && HK.personaOf(c))) || 'gentle'; return PK.indexOf(k) >= 0 ? k : 'gentle'; }
  P.per = per;
  function alive(c) { return !!c && c.alive !== false; }
  function isCtx(x) { return !!(x && x.R && x.pair && x.chars); }

  P.ENV = {
    id: 'poly', label: '複数の恋人', type: 'select', def: 'none',
    options: [
      { v: 'none', label: 'なし（恋人は一人まで。ほかの人を好きになったら乗り換え）' },
      { v: 'any', label: 'あり（複数の恋人を認める。三人で円満な恋人たちも）' },
      { v: 'secret', label: '秘密（複数持てるが、恋人どうしは互いを知らない）' },
      /* 2026-10-26：恋人どうしが互いを知っている（あり）うえで、険悪か・仲が良いか */
      { v: 'feud', label: 'あり・恋人どうしは険悪（鉢合わせると口論になる）' },
      { v: 'warm', label: 'あり・恋人どうしは仲が良い（三人で過ごすことも）' }
    ],
    desc: '一人の人が同時に何人と恋人になれるか。「あり」の二つは、恋人どうし（同じ人の恋人の二人）が互いを知っていて、険悪か仲が良いか。関係の設定で最初から恋人を二人つけた人は、どれを選んでもそのまま'
  };
  P.modeOf = function (env) { var v = env && env.poly; return v === 'any' || v === 'secret' || v === 'feud' || v === 'warm' ? v : 'none'; };
  /* x はエンジンの ctx か、物語型の S（S.poly） */
  P.mode = function (x) { if (!x) return 'none'; if (x.poly) return x.poly; return P.modeOf(x.env); };

  /* ---------- 恋人の一覧 ---------- */
  /* 恋人の一覧は、恋人の印（pf.couple）が変わるまで覚えておく（P.watch の setter が ctx._couV を進める。
     大人数（35人）で canCouple などから何度も呼ばれ、毎回全員の組を引くと重いため。2026-10-28 担当KB。結果は変わらない） */
  P.lovers = function (ctx, c) {
    if (!isCtx(ctx) || !c) return [];
    var ver = ctx._couV || 0, L = ctx._couL;
    if (!L || L.v !== ver) L = ctx._couL = { v: ver, m: {} };
    var r = L.m[c.i];
    if (!r) r = L.m[c.i] = ctx.chars.filter(function (o) { return o !== c && ctx.pair(c, o).couple; });
    return r.slice();
  };
  function others(ctx, a, not) { return P.lovers(ctx, a).filter(function (o) { return o !== not && alive(o); }); }
  function feel(ctx, a, b) { var r = ctx.R(a, b); return r ? r.att + r.aff * 0.5 : 0; }
  /* 本命（関係 honmei）がいる人は、本命以外と恋人にならない（本命が箱庭にいて生きているとき） */
  function honmeiBlock(ctx, a, b) {
    if (a.honmei == null || a.honmei === b.i) return false;
    var h = ctx.chars[a.honmei];
    return !!h && alive(h);
  }
  /* 一途：恋人がいる間は、ほかの人と恋人にならない */
  P.faithBlocked = function (ctx, a, b) {
    return !!((a.faithful && others(ctx, a, b).length) || (b.faithful && others(ctx, b, a).length));
  };
  P.canCouple = function (ctx, a, b) {
    if (!a || !b || a === b) return false;
    if (!isCtx(ctx)) return P.storyCan(ctx, a, b);
    if (ctx.pair(a, b).couple) return true;
    if (P.faithBlocked(ctx, a, b)) return false;
    if (P.mode(ctx) !== 'none') return true;
    if (others(ctx, a, b).length || others(ctx, b, a).length) return false;
    return !honmeiBlock(ctx, a, b) && !honmeiBlock(ctx, b, a);
  };
  /* 「なし」で、恋人がいる人の気持ちが、今の恋人より新しい相手に傾いているか（乗り換えてよいか） */
  P.switchOk = function (ctx, a, b) {
    if (!isCtx(ctx) || P.mode(ctx) !== 'none' || P.faithBlocked(ctx, a, b)) return false;
    var ok = true;
    [[a, b], [b, a]].forEach(function (pr) {
      var x = pr[0], y = pr[1];
      others(ctx, x, y).forEach(function (l) { if (x.honmei === l.i || feel(ctx, x, y) < feel(ctx, x, l) + 8) ok = false; });
    });
    return ok && !honmeiBlock(ctx, a, b) && !honmeiBlock(ctx, b, a);
  };
  P.canTry = function (ctx, a, b) { return P.canCouple(ctx, a, b) || P.switchOk(ctx, a, b); };

  /* ---------- 物語型（邪神村・吹雪の館・宇宙船など）：S.poly と、関係の恋人（S.ties）・恋仲（S.rom） ---------- */
  function storyLovers(S, a) {
    var out = [];
    /* 恋人の記録を一本で持つ箱庭（宇宙船の S.lovers：組の配列。別れた組は消える）は、それだけを読む */
    if (Array.isArray(S.lovers)) { S.lovers.forEach(function (pr) { var j = pr[0] === a.i ? pr[1] : pr[1] === a.i ? pr[0] : -1, o = j >= 0 && S.P && S.P[j]; if (o && out.indexOf(o) < 0) out.push(o); }); return out.filter(alive); }
    (S.ties || []).forEach(function (t) { if (/^(lover|mate|fated)$/.test(t.type) && (t.a === a.i || t.b === a.i)) { var o = S.P && S.P[t.a === a.i ? t.b : t.a]; if (o && out.indexOf(o) < 0) out.push(o); } });
    if (S.rom) Object.keys(S.rom).forEach(function (k) { if (!S.rom[k]) return; var ij = k.split('-'); if (+ij[0] === a.i || +ij[1] === a.i) { var o = S.P && S.P[+ij[0] === a.i ? +ij[1] : +ij[0]]; if (o && out.indexOf(o) < 0) out.push(o); } });
    return out.filter(alive);
  }
  P.storyLovers = storyLovers;
  P.storyCan = function (S, a, b) {
    if (!S || !a || !b || a === b) return false;
    /* 恋愛相手の固定が食い違う二人は、恋人にしない（engine.js の HK.lockConflict） */
    if (HK.lockConflict && HK.lockConflict(a, b)) return false;
    var la = storyLovers(S, a).filter(function (o) { return o !== b; }), lb = storyLovers(S, b).filter(function (o) { return o !== a; });
    if (storyLovers(S, a).indexOf(b) >= 0) return true;
    if ((a.faithful && la.length) || (b.faithful && lb.length)) return false;
    if (P.mode(S) !== 'none') return true;
    return !la.length && !lb.length;
  };
  /* 媚薬ロッカーの三人など、物語型で恋人どうしがそろった三人を記録する */
  P.storyReg = function (S, m) {
    if (!S || !m || m.length < 3) return;
    var n = 0, hub = null;
    m.forEach(function (x) { var k = m.filter(function (y) { return y !== x && storyLovers(S, x).indexOf(y) >= 0; }).length; n += k; if (k === m.length - 1) hub = hub || x; });
    if (n < 4) return;
    S.flags = S.flags || {};
    (S.flags.polyGroups = S.flags.polyGroups || []).push({ members: m.map(function (x) { return x.i; }), hub: n >= m.length * (m.length - 1) ? null : hub ? hub.i : null, known: true });
  };

  /* ---------- 一途（engine.js の romanceOk・sexOne から） ---------- */
  /* 恋愛の出来事の顔ぶれに、恋人がいる一途の人と、その恋人でない人が一緒にいれば偽 */
  P.faithOk = function (ctx, actors) {
    var L0 = (actors || []).filter(function (c) { return c && c.i != null; });
    if (!isCtx(ctx) || !L0.some(function (c) { return c.faithful; })) return true;
    for (var i = 0; i < L0.length; i++) {
      var x = L0[i]; if (!x.faithful) continue;
      var lv = others(ctx, x, null);
      if (!lv.length) continue;
      for (var j = 0; j < L0.length; j++) if (j !== i && lv.indexOf(L0[j]) < 0 && L0[j] !== x) return false;
    }
    return true;
  };
  /* 体の関係：x が一途で恋人がいて、y がその恋人でなければ真（その組は体の関係にならない） */
  P.faithNG = function (x, y) {
    if (!x || !y || !x.faithful) return false;
    var C = HK._curCtx;
    if (C && C.pf && C.chars && C.chars[x.i] === x) { var lv = others(C, x, null); return lv.length > 0 && lv.indexOf(y) < 0; }
    return !!(x.loveSet && x.loveSet.length && x.loveSet.indexOf(y.i) < 0);
  };

  /* ---------- 乗り換え（「なし」で、恋人がいる人が別の人と恋人になったとき） ---------- */
  var SWITCH = {
    proud: L('{a}は{c}を呼び出して、まっすぐに言った。「悪いけど、終わりにしたい。もう{b}しか見えてない」――{c}は何か言い返そうとして、唇を噛んだ。|{a}は言い訳をしなかった。「{c}、別れてほしい。{b}と付き合う」――{c}の平手が飛んだが、{a}はよけなかった。|{a}は{c}の前で、目を逸らさずに頭を下げた。「半端なまま二人と付き合うのは性に合わない。……別れよう」――{c}は黙って背を向けた。'),
    stern: L('{a}は{c}と向き合い、静かに告げた。「けじめをつけたい。{b}を選んだ以上、{c}との関係は今日で終わりにする」――{c}は長いあいだ、何も言えなかった。|{a}「二人と同時に、というのは筋が通らない。{c}、すまない」――{a}は深く頭を下げた。{c}は「……そう｜……そうか｜……そうですか」とだけ答えた。|{a}は{c}に、自分の気持ちが{b}に移ったことを包み隠さず話した。{c}は最後まで聞いてから、指先で目元を拭った。'),
    tsun: L('{a}は{c}の顔を見られないまま、早口で言った。「べ、別に{c}が悪いんじゃないから。……{b}のこと、好きになっちゃったの」――{c}は呆然と立ち尽くした。|{a}「……ごめん。ちゃんと言わなきゃって、ずっと思ってた。私、{b}と付き合う」――言い終えた{a}の目のほうが、先に潤んでいた。|{a}は{c}に背を向けたまま「もう終わりにしよ」と言った。振り返ったとき、{c}の顔はもう見られなかった。'),
    gentle: L('{a}は{c}の手を取って、ゆっくりと話した。「{c}のこと、大事だった。でも今は、{b}のそばにいたいの」――{c}は手を握り返さなかった。|{a}「傷つけるって分かってて言うね。……{c}とは、もう続けられない」――{a}は泣きそうな顔で笑った。{c}は笑わなかった。|{a}は{c}に、{b}を好きになったことを正直に打ち明けた。{c}「……そっか｜……そうか｜……そうですか」――その声は、思っていたよりずっと小さかった。'),
    devoted: L('{a}は何度も言葉を飲み込んでから、やっと口にした。「{c}、ごめんなさい。……{b}のことしか、考えられなくなっちゃった」――{c}はうつむいたまま、動かなかった。|{a}は{c}の前で深く頭を下げた。「ずっと大事にしてもらったのに、こんな……本当に、ごめんなさい」――{c}は何も言わずに、その場を離れた。|{a}「{b}と一緒にいたいの。中途半端なまま{c}のそばにいるのは、{c}に失礼だから」――{c}は唇を震わせて、小さく頷いた。'),
    cool: L('{a}は淡々と告げた。「気持ちが{b}に移った。隠して続けるのは、{c}にも{b}にも不誠実だと思う」――{c}は返事のかわりに、長い息を吐いた。|{a}「別れよう。理由は、もう分かってると思う」――{c}は{b}のほうをちらりと見て、黙って頷いた。|{a}は{c}に、恋人をやめたいとだけ短く伝えた。説明を求める{c}に、{a}は「{b}を選んだ」と、それ以上の言葉を足さなかった。'),
    free: L('{a}は頭をかいて、{c}に向き直った。「ごめん！　ほんとにごめん。{b}のこと、好きになっちゃった」――{c}は笑おうとして、うまく笑えなかった。|{a}「{c}とのこと、ここで終わりにさせて。……ずるいのは分かってる」――{c}は{a}の肩を一度だけ小突いて、背を向けた。|{a}はいつもの軽い調子を引っ込めて、{c}に別れを切り出した。{c}「……{b}でしょ｜……{b}だろう｜……{b}でしょう」――{a}は否定しなかった。'),
    shy: L('{a}は消え入りそうな声で言った。「あの……{c}、ごめん。私、{b}のことが……」――最後まで言えなかったが、{c}にはそれで十分だった。|{a}は{c}に、震える手で書いた短い手紙を渡した。読み終えた{c}は、それを静かに折りたたんだ。|{a}は何度も迷ったあげく、やっと{c}に別れを告げた。{c}「……{b}と、幸せにね｜……{b}と、幸せにな｜……{b}と、幸せになってください」――{a}は顔を上げられなかった。'),
    polite: L('{a}は{c}に向き直り、丁寧に頭を下げた。「勝手を申し上げます。私は、{b}と一緒に歩いていきたいのです」――{c}は言葉を失った。|{a}「これまで本当にありがとうございました。……けれど、私の心はもう{b}のところにあります」――{c}は、ゆっくりと目を閉じた。|{a}は{c}に、言葉を尽くして詫びた。{c}は最後に「あなたらしい別れ方だね｜あなたらしい別れ方だ｜あなたらしい別れ方ですね」とだけ言って、背を向けた。')
  };
  P.SWITCH = SWITCH;
  function fill(t, a, b, c) { return t.replace(/\{a\}/g, a.name).replace(/\{b\}/g, b.name).replace(/\{c\}/g, c.name); }
  /* 箱庭が回り始めたか（関係の設定・準備で恋人になった組は、乗り換えにしない） */
  function live(ctx) {
    if (ctx._polyLive) return true;
    var lg = ctx.log || [];
    for (var i = 0; i < lg.length; i++) if (lg[i].kind === 'step') { ctx._polyLive = true; return true; }
    return false;
  }
  function breakFor(ctx, x, l, nw) {
    var pl = ctx.pair(x, l);
    pl.couple = false; pl.brokeAt = ctx.stepIndex; pl.broke = 'switch'; pl.switchTo = nw.i;
    var r1 = ctx.R(l, x), r2 = ctx.R(x, l);
    if (r1) { r1.aff = HK.clamp(r1.aff - 12, -100, 100); r1.ten = HK.clamp(r1.ten + 14, 0, 100); r1.trust = HK.clamp(r1.trust - 8, -100, 100); }
    if (r2) r2.ten = HK.clamp(r2.ten + 6, 0, 100);
    l.stress = HK.clamp((l.stress || 0) + 22, 0, 100);
    l.flags = l.flags || {}; l.flags.dumpedBy = x.i;
    var note = { kind: 'event', cat: 'conflict', actors: [x, l], mag: 18, text: fill(ctx.pick(SWITCH[per(x)]), x, nw, l), why: x.name + 'は' + l.name + 'と別れて、' + nw.name + 'に乗り換えた（複数の恋人：なし。恋人は一人まで）' };
    /* 前の恋人がもう場にいない（部屋を出た・亡くなった・閉じ込められている）ときは、別れは記録に書かない（その場にいない人を出来事に出さない） */
    if (l.out || l.alive === false || (l.flags && l.flags.caged != null)) return { pf: pl, note: null };
    (ctx.pending = ctx.pending || []).push(note);
    return { pf: pl, note: note };
  }
  function onCouple(ctx, pf, a, b) {
    if (!live(ctx)) return true;
    /* 一途の人は、恋人がいる間はほかの人と恋人にならない（念のため、ここでも止める） */
    if (P.faithBlocked(ctx, a, b)) return false;
    if (a.faithful || b.faithful) [a, b].forEach(function (x) { if (!x.faithful) return; var y = x === a ? b : a; ctx.chars.forEach(function (o) { if (o !== x && o !== y) { var r = ctx.R(x, o); if (r && r.att > 25) r.att = 25; } }); });
    if (P.mode(ctx) !== 'none') { P.sync(ctx); return true; }
    var done = [];
    [[a, b], [b, a]].forEach(function (pr) { others(ctx, pr[0], pr[1]).forEach(function (l) { done.push(breakFor(ctx, pr[0], l, pr[1])); }); });
    if (done.length) pf._polyUndo = { step: ctx.stepIndex, list: done };
    return true;
  }
  /* 恋人になったのを同じ段階のうちに取り消した（過ちだった・恋人にはならない など）ときは、乗り換えも取り消す */
  function onBreak(ctx, pf) {
    var u = pf._polyUndo;
    if (!u) return;
    delete pf._polyUndo;
    if (u.step !== ctx.stepIndex) return;
    u.list.forEach(function (d) {
      var k = (ctx.pending || []).indexOf(d.note);
      if (k >= 0) ctx.pending.splice(k, 1);
      d.pf._polyRestore = true; d.pf.couple = true; delete d.pf._polyRestore;
      d.pf.brokeAt = null; d.pf.broke = null; delete d.pf.switchTo;
    });
  }
  /* engine.js の Ctx.pair が、組を作るときに一度だけ呼ぶ */
  P.watch = function (ctx, pf, a, b) {
    if (!pf || pf._polyW) return;
    var v = !!pf.couple;
    Object.defineProperty(pf, '_polyW', { value: true, enumerable: false });
    Object.defineProperty(pf, 'couple', {
      enumerable: true, configurable: true,
      get: function () { return v; },
      set: function (nv) {
        nv = !!nv;
        if (nv === v) return;
        /* 恋愛相手の固定が食い違う二人は、どの出来事からでも恋人にしない（engine.js の HK.lockConflict） */
        if (nv && HK.lockConflict && HK.lockConflict(a, b)) return;
        v = nv;
        /* 恋人の一覧の覚え（P.lovers）を捨てる。onCouple・onBreak の中で一覧を引くこともあるので、先に進める */
        ctx._couV = (ctx._couV || 0) + 1;
        if (pf._polyRestore) return;
        if (nv) { if (onCouple(ctx, pf, a, b) === false) { v = false; ctx._couV++; } }
        else onBreak(ctx, pf);
      }
    });
  };

  /* ---------- 恋人がつながった三人以上（ctx.flags.polyGroups） ---------- */
  function gkey(m) { return m.slice().sort(function (x, y) { return x - y; }).join('-'); }
  P.register = function (ctx, members, hub) {
    if (!ctx || !members || members.length < 3) return;
    var ms = members.map(function (c) { return typeof c === 'number' ? c : c.i; });
    var reg = ctx.flags.polyReg = ctx.flags.polyReg || {};
    reg[gkey(ms)] = { members: ms, hub: hub == null ? null : typeof hub === 'number' ? hub : hub.i, known: true, reg: true };
    P.sync(ctx);
  };
  P.groups = function (ctx) { return P.sync(ctx); };
  P.sync = function (ctx) {
    if (!isCtx(ctx)) return [];
    var C = ctx.chars, n = C.length, adj = C.map(function () { return []; });
    for (var i = 0; i < n; i++) for (var j = i + 1; j < n; j++) if (ctx.pair(C[i], C[j]).couple) { adj[i].push(j); adj[j].push(i); }
    var seen = {}, out = [], mode = P.mode(ctx), known = ctx.flags.polyKnown || {};
    for (var s = 0; s < n; s++) {
      if (seen[s] || !adj[s].length) continue;
      var comp = [], q = [s]; seen[s] = 1;
      while (q.length) { var x = q.shift(); comp.push(x); adj[x].forEach(function (y) { if (!seen[y]) { seen[y] = 1; q.push(y); } }); }
      if (comp.length < 3) continue;
      var edges = comp.reduce(function (t, x) { return t + adj[x].length; }, 0) / 2, full = edges === comp.length * (comp.length - 1) / 2;
      var hub = null;
      if (!full) comp.forEach(function (x) { if (hub == null && adj[x].length === comp.length - 1 && edges === comp.length - 1) hub = x; });
      if (!full && hub == null) continue;
      var k = gkey(comp);
      out.push({ members: comp.slice().sort(function (x, y) { return x - y; }), hub: hub, full: full, known: full || mode !== 'secret' || !!known[k] });
    }
    var reg = ctx.flags.polyReg || {};
    Object.keys(reg).forEach(function (k) { if (!out.some(function (g) { return gkey(g.members) === k; })) out.push(reg[k]); });
    /* 「あり・恋人どうしは険悪／仲が良い」：中心のある組の恋人どうし（中心以外の二人）の気持ちを、組ができたときに一度だけ寄せる（関係値だけ。記録は出さない） */
    if (mode === 'feud' || mode === 'warm') out.forEach(function (g) {
      if (!g.known || g.hub == null) return;
      var oth = g.members.filter(function (i) { return i !== g.hub; }), done = ctx.flags.polyMood = ctx.flags.polyMood || {};
      for (var x = 0; x < oth.length; x++) for (var y = x + 1; y < oth.length; y++) {
        var k2 = oth[x] + '-' + oth[y];
        if (done[k2]) continue;
        done[k2] = 1;
        [[C[oth[x]], C[oth[y]]], [C[oth[y]], C[oth[x]]]].forEach(function (q) {
          var r = q[0] && q[1] ? ctx.R(q[0], q[1]) : null;
          if (!r) return;
          if (mode === 'feud') { r.ten = HK.clamp(r.ten + 18, 0, 100); r.aff = HK.clamp(r.aff - 10, -100, 100); }
          else { r.aff = HK.clamp(r.aff + 12, -100, 100); r.trust = HK.clamp(r.trust + 8, -100, 100); r.ten = HK.clamp(r.ten - 6, 0, 100); }
        });
      }
    });
    ctx.flags.polyGroups = out;
    return out;
  };
  /* c が入っている、知られた（円満になりうる）恋人たちの組 */
  P.groupOf = function (ctx, c, knownOnly) {
    var gs = P.sync(ctx);
    for (var i = 0; i < gs.length; i++) if (gs[i].members.indexOf(c.i) >= 0 && (!knownOnly || gs[i].known)) return gs[i];
    return null;
  };
  /* 円満な三人か（知られていて、誰どうしも張りつめていない） */
  P.harmonious = function (ctx, g) {
    if (!g || !g.known || g.members.length !== 3) return false;
    /* 恋人どうしは険悪（feud）：円満にはならない（全員が互いに恋人どうしの三人は除く） */
    var md = P.mode(ctx);
    if (md === 'feud' && !g.full) return false;
    var m = g.members.map(function (i) { return ctx.chars[i]; });
    for (var i = 0; i < 3; i++) for (var j = 0; j < 3; j++) if (i !== j) { var r = ctx.R(m[i], m[j]); if (!r || r.ten >= (md === 'warm' ? 60 : 50) || r.aff < (md === 'warm' ? -10 : 0)) return false; }
    return true;
  };
  /* 恋人どうし（同じ人 h の恋人で、互いは恋人でない二人 x・y）。「あり・険悪」「あり・仲が良い」の場面が使う */
  P.rivalsOf = function (ctx, x, y) {
    if (!isCtx(ctx) || !x || !y || x === y || ctx.pair(x, y).couple) return null;
    var hs = P.lovers(ctx, x).filter(function (h) { return h !== y && ctx.pair(h, y).couple && alive(h) && (!HK.State || HK.State.here(h)); });
    if (!hs.length) return null;
    var g = P.groupOf(ctx, x, true);
    return g && g.members.indexOf(y.i) >= 0 ? hs[0] : null;
  };

  /* 「秘密」：恋人どうし（i・j）の夜で、どちらかのもう一人の恋人（pi・pj）がその場におらず、まだ知らされていない（engine.js の markRel） */
  P.secretCheat = function (ctx, i, j, pi, pj, ev) {
    if (P.mode(ctx) !== 'secret' || !ev) return false;
    var C = ctx.chars;
    function hid(x, o) { if (o < 0 || ev.actors.indexOf(o) >= 0) return false; var g = P.groupOf(ctx, C[x], false); return !!g && !g.known && g.members.indexOf(o) >= 0; }
    return hid(i, pi) || hid(j, pj);
  };

  /* ---------- 結末の分類（rel-group.js が tie-rel.js の TieRel.refine・pairText に重ねる） ---------- */
  P.LABELS = { polyamory: { name: '三人で円満', cls: 'love', pol: 2 }, hub: { name: '一人を二人が愛している', cls: 'love', pol: 2 } };
  P.MARKS = { polyfound: '秘密の発覚', polyrepair: '三人で修復' };
  P.install = function () {
    if (HK.LABELS) for (var k in P.LABELS) if (!HK.LABELS[k]) HK.LABELS[k] = P.LABELS[k];
    if (HK.MARK_NAME) for (var m in P.MARKS) if (!HK.MARK_NAME[m]) HK.MARK_NAME[m] = P.MARKS[m];
  };
  function nm3(ctx, g) { return g.members.map(function (i) { return ctx.chars[i].name; }); }
  /* 結末のメモ（res.end.notes）に、恋人たちの組を一度だけ書く */
  function endNote(ctx) {
    if (ctx.flags.polyNoted) return;
    ctx.flags.polyNoted = true;
    var gs = P.sync(ctx);
    gs.forEach(function (g) {
      /* 亡くなった人がいる組は、もう「複数の恋人」として結末に書かない（亡くなった人を、いまも愛し合っている扱いにしない） */
      if (g.members.some(function (i) { return ctx.chars[i] && ctx.chars[i].alive === false; })) return;
      var ns = nm3(ctx, g), line, md = P.mode(ctx);
      /* 「あり・険悪」「あり・仲が良い」：中心のある組は、恋人どうし（中心以外の二人）の仲を添える。張りつめたまま終わったか、打ち解けたかは値で見る */
      var rv = '';
      if (g.known && g.hub != null && (md === 'feud' || md === 'warm')) {
        var oth = g.members.filter(function (i) { return i !== g.hub; }).map(function (i) { return ctx.chars[i]; }), tens = 0, affs = 0, np = 0;
        for (var x = 0; x < oth.length; x++) for (var y = 0; y < oth.length; y++) if (x !== y) { var rr = ctx.R(oth[x], oth[y]); tens += rr.ten; affs += rr.aff; np++; }
        tens /= Math.max(1, np); affs /= Math.max(1, np);
        rv = md === 'feud' ? (affs > 15 && tens < 25 ? '険悪だった恋人どうしも、いつしか少し歩み寄った' : '恋人どうしは最後まで険悪なまま') : (affs > 15 && tens < 40 ? '恋人どうしも仲が良い' : '恋人どうしは仲良くしようとしていた');
      }
      if (!g.known) line = '秘密のままの恋：' + ns.join('・') + '（恋人どうしは、互いのことを知らないまま）';
      else if (g.hub != null) line = '複数の恋人：' + ctx.chars[g.hub].name + 'を、' + ns.filter(function (x) { return x !== ctx.chars[g.hub].name; }).join('と') + 'が愛している（一人を二人が愛している' + (rv ? '。' + rv : '') + '）';
      else line = '複数の恋人：' + ns.join('・') + '（' + (P.harmonious(ctx, g) ? '三人で円満' : '恋人どうしの三人') + '）';
      (ctx.flags.endNotes = ctx.flags.endNotes || []).push(line);
    });
  }
  P.refine = function (ctx, A, B, pf, cl) {
    if (!cl || !pf || !pf.couple || pf.kill || !/^(lovers|night|vague|pining)$/.test(cl.id)) { if (isCtx(ctx)) endNote(ctx); return null; }
    P.install(); endNote(ctx);
    var g = P.groupOf(ctx, A, true);
    if (!g || g.members.indexOf(B.i) < 0) return null;
    if (g.hub != null) return g.hub === A.i || g.hub === B.i ? { id: 'hub', dir: g.hub } : null;
    return P.harmonious(ctx, g) ? { id: 'polyamory' } : null;
  };
  P.pairText = function (ctx, A, B, cl) {
    if (!cl) return null;
    if (cl.id === 'polyamory') { var g = P.groupOf(ctx, A, true), ns = g ? nm3(ctx, g) : [A.name, B.name]; return ns.join('・') + 'は、三人で恋人として落ち着いた。誰か一人を選ぶ必要は、もうなかった。'; }
    if (cl.id === 'hub') { var h = ctx.chars[cl.dir], o = h === A ? B : A; return o.name + 'は、' + h.name + 'を愛するもう一人と一緒に、' + h.name + 'の恋人であり続けた。'; }
    return null;
  };
  P.hookTieRel = function () {
    var TR = HK.TieRel;
    if (!TR || TR._polyHooked) return;
    TR._polyHooked = true;
    /* HK.wrap：呼んだファイル（rel-group.js）の番号で包む。分割読み込みで後から届いても、包む順は元のファイルの順 */
    HK.wrap(TR, 'refine', function (rf0) { return function (ctx, A, B, pf, cl) { var r = P.refine(ctx, A, B, pf, cl); return r || (rf0 ? rf0.apply(this, arguments) : null); }; });
    HK.wrap(TR, 'pairText', function (pt0) { return function (ctx, A, B, cl) { return P.pairText(ctx, A, B, cl) || (pt0 ? pt0.apply(this, arguments) : null); }; });
  };

  /* ---------- 秘密の発覚（「秘密」のときだけ。嫉妬系） ----------
     {a}＝気づいた恋人、{b}＝恋人が二人いる人、{c}＝もう一人の恋人 */
  var FOUND = {
    lead: L('{a}は、{b}のスマホに届いた通知の名前を見てしまった。{c}――しかも、恋人にしか送らないような言葉だった。|{a}は、{b}と{c}が人目を避けて手を握り合うのを、物陰から見てしまった。|{a}は、{b}の上着から、{c}の匂いがするのに気づいた。問い詰めると、{b}は目を逸らした。|{c}が何気なく口にした「{b}とこの前」という言葉で、{a}はすべてを悟った。'),
    react: {
      proud: L('{a}は{b}の胸ぐらを掴みかけて、手を止めた。「……二股かよ。ふざけんな」|{a}「{c}とも付き合ってたって？　よくもまあ、平気な顔でいられたな」|{a}は壁を拳で殴った。「黙ってたのが、いちばん腹が立つ」'),
      stern: L('{a}「説明してもらおうか。{c}とは、どういう関係だ」――{a}の声は、驚くほど静かだった。|{a}は{b}を正面から見据えた。「隠し事をされるのが、何より嫌いだと言ったはずだ」|{a}「……そうか。私だけでは、なかったのか」――{a}は拳を握りしめて、それ以上は言わなかった。'),
      tsun: L('{a}「な、何それ……！　{c}とも付き合ってたなんて、聞いてないんだけど！」|{a}は涙目で{b}を睨んだ。「信じてたのに。……ばか」|{a}「べつに、泣いてないし！　ただ、すっごく腹が立ってるだけ！」'),
      gentle: L('{a}「……そっか。{c}のことも、好きなんだね」――{a}は笑おうとして、うまく笑えなかった。|{a}は{b}の手を取ったまま、しばらく黙っていた。「言ってほしかったな。最初に」|{a}「怒ってないよ。……ただ、ちょっとだけ、苦しい」'),
      devoted: L('{a}は、その場に座り込んだ。「私、何か足りなかった……？」|{a}「{b}が好きなら、それでいいって思ってた。でも……{c}もなんて」――{a}の声が震えた。|{a}は{b}の袖を掴んだまま、離せなかった。「捨てないで。……でも、本当のことは教えて」'),
      cool: L('{a}は小さく息を吐いた。「なるほど。{c}とも、ね。……いつから？」|{a}「責めるつもりはない。事実を知りたいだけ」――その目は、少しも笑っていなかった。|{a}は{b}と{c}を順に見て、淡々と言った。「三人で話そう。今ここで」'),
      free: L('{a}「え、待って待って。{c}とも？　まじで？」――{a}は笑ったが、目が笑っていなかった。|{a}は{b}の頬を両手で挟んだ。「ねえ、ちゃんとこっち見て言って」|{a}「……隠されてたのが、いちばんきつい」――いつもの明るい声が、すっかりしぼんでいた。'),
      shy: L('{a}は何も言えずに、その場から逃げ出した。追いかけてきた{b}に、{a}は背を向けたまま「……知ってた、の？　{c}も」と呟いた。|{a}は唇を噛んで、俯いた。言いたいことは山ほどあったのに、一つも声にならなかった。|{a}「わ、私……邪魔、だった……？」――消え入りそうな声だった。'),
      polite: L('{a}「お二人のご関係、私は存じ上げておりませんでした」――{a}は丁寧に、冷たく言った。|{a}は姿勢を正したまま、{b}に向き直った。「せめて、隠さずにいてほしかった」|{a}「……失礼。少し、頭を冷やしてまいります」――{a}の手は、小さく震えていた。')
    },
    repair: L('長い沈黙のあと、{b}は{a}と{c}の前で頭を下げた。「どっちも本気だった。隠してたのは、私が弱かったから｜どちらも本気だった。隠していたのは、私が弱かったからだ｜どちらも本気でした。隠していたのは、私が弱かったからです」――{a}と{c}は顔を見合わせ、やがて、三人で向き合うことを選んだ。|{c}が先に口を開いた。「……私も知らなかった。でも、{b}を嫌いにはなれない｜……私も知らなかった。だが、{b}を嫌いにはなれない｜……私も知りませんでした。でも、{b}を嫌いにはなれません」{a}は少し考えてから頷いた。「なら、もう隠し事はなし。三人で決めよう｜ならば、もう隠し事はなしだ。三人で決めよう｜なら、もう隠し事はなしです。三人で決めましょう」|三人は夜が更けるまで話した。怒鳴り合いも、泣き声もあった。それでも最後に、{a}は{c}に手を差し出した。「……これからは、知ってる同士で｜……これからは、知っている同士でいよう｜……これからは、知っている同士でいましょう」'),
    brk: L('{a}は{b}の言い訳を最後まで聞かずに、背を向けた。「もういい。{c}と幸せになれば｜もういい。{c}と幸せになればいい｜もういいです。{c}と幸せになってください」――それきり、{a}は振り返らなかった。|{a}「隠してたってことは、選べなかったってことでしょ。……私は、選ばれないなら、いらない｜隠していたということは、選べなかったということだろう。……私は、選ばれないなら、いらない｜隠していたということは、選べなかったということでしょう。……私は、選ばれないなら、いりません」――{a}は指輪を外して、{b}の手のひらに置いた。|{a}は{c}に向かって、静かに言った。「あなたのせいじゃない。……でも、もう三人ではいられない｜あなたのせいではない。……だが、もう三人ではいられない｜あなたのせいではありません。……でも、もう三人ではいられません」――{a}は{b}と別れることを選んだ。')
  };
  P.FOUND = FOUND;
  P.EVENTS = [{
    id: 'poly_found', cat: 'conflict', scope: 'pair',
    /* a＝b の恋人、b＝もう一人の恋人（c）がいる人。秘密のまま（known:false）の組で、c もその場にいる */
    when: function (ctx, a, b) {
      if (P.mode(ctx) !== 'secret' || !ctx.pair(a, b).couple) return false;
      var g = P.groupOf(ctx, b, false);
      if (!g || g.known || g.members.indexOf(a.i) < 0) return false;
      return others(ctx, b, a).some(function (c) { return HK.State.here(c) && !ctx.pair(a, c).couple; });
    },
    w: function (ctx, a) { return 0.35 + a.tr.a * 0.3 + a.tr.jealous * 0.4; },
    run: function (ctx, a, b) {
      var c = others(ctx, b, a).filter(function (o) { return HK.State.here(o) && !ctx.pair(a, o).couple; })[0];
      var g = P.groupOf(ctx, b, false), key = gkey(g.members);
      P.install();
      var ra = ctx.R(a, b), ok = ra.aff + ra.trust * 0.5 + a.tr.np * 30 - a.tr.jealous * 30 - a.tr.cp * 10 + ctx.rng() * 30 > 55;
      var t = fill(ctx.pick(FOUND.lead), a, b, c) + fill(ctx.pick(FOUND.react[per(a)]), a, b, c);
      ctx.stress(a, 20); ctx.stress(b, 14);
      var k;
      if (ok) {
        k = 'repair';
        (ctx.flags.polyKnown = ctx.flags.polyKnown || {})[key] = true;
        ctx.mod2(a, b, { ten: 6, trust: -6 }, { trust: 6 }); ctx.mod2(a, c, { ten: 8, aff: 2 }, { ten: 6, aff: 2 });
      } else {
        k = 'brk';
        var pf = ctx.pair(a, b);
        pf.couple = false; pf.brokeAt = ctx.stepIndex; pf.broke = 'found';
        ctx.mod2(a, b, { aff: -18, att: -15, ten: 18, trust: -20 }, { ten: 8 }); ctx.mod(a, c, { ten: 10 });
      }
      t += fill(ctx.pick(FOUND[k]), a, b, c);
      var e = ctx.act2({ actors: [a, b, c], cat: 'conflict', mag: 26, text: t, why: a.name + 'が、' + b.name + 'と' + c.name + 'の関係に気づいた（秘密の恋人の発覚・嫉妬）／' + (k === 'repair' ? '三人で話し合い、隠し事のない関係を選んだ（修復）' : a.name + 'は' + b.name + 'と別れた（破局）') });
      if (e) { e.mark = (e.mark || []).concat(['polyfound'].concat(k === 'repair' ? ['polyrepair'] : [])); }
      return null;
    }
  }];

  /* ---------- 「あり・恋人どうしは険悪」「あり・恋人どうしは仲が良い」（2026-10-26） ----------
     {a}＝恋人どうしの一人（動く人）、{b}＝もう一人、{c}＝二人が愛している人（中心）。中心がその場にいるときだけ。
     険悪：鉢合わせ・口論（嫉妬系）／仲が良い：中心の話で盛り上がる・三人で過ごす（仲良し系）。恋人どうしの二人は恋愛にしない（惹かれは動かさない） */
  var RIVAL = {
    lead: L('{a}が{c}のところへ向かうと、ちょうど{b}が{c}の隣から立ち上がるところだった。二人は一瞬、足を止めた。どちらも、先に目を逸らそうとはしなかった。|{c}を挟んで、{a}と{b}の視線がぶつかった。{c}が何か言いかけたが、二人とも聞いていなかった。|{a}が{c}のために取っておいた席に、{b}が先に座っていた。{a}は黙って、その前に立った。|{a}と{b}は、{c}がどちらと過ごす時間が長いかで言い合いになった。言えば言うほど、空気が悪くなった。|{a}と{b}は、{c}の好きなものをどちらがよく分かっているかで張り合った。どちらも、少しも譲らなかった。'),
    react: {
      proud: L('{a}「また{b}？　{c}の隣は、今日は私の番｜また{b}か。{c}の隣は、今日は私の番だ｜また{b}ですか。{c}の隣は、今日は私の番です」'),
      stern: L('{a}「順番は守ってもらう。{c}を困らせたくないなら、なおさら｜順番は守ってもらう。{c}を困らせたくないなら、なおさらだ｜順番は守っていただきます。{c}を困らせたくないなら、なおさらです」'),
      tsun: L('{a}「べ、別に{b}がいたって気にしないし。……でも、そこは私の席｜別に{b}がいても気にしない。……だが、そこは私の席だ｜べ、別に{b}がいても気にしません。……でも、そこは私の席です」'),
      gentle: L('{a}「……ごめん。今だけは、譲ってほしい｜……すまない。今だけは、譲ってほしい｜……ごめんなさい。今だけは、譲っていただけますか」――穏やかな声の奥に、隠しきれない棘があった。'),
      devoted: L('{a}「{c}のことなら、私のほうが分かってる。邪魔しないで｜{c}のことなら、私のほうが分かっている。邪魔をするな｜{c}のことなら、私のほうが分かっています。邪魔をしないでください」'),
      cool: L('{a}「同じ人を好きになった者どうし、仲良くする理由はない｜＝｜同じ人を好きになった者どうし、仲良くする理由はありません」――{a}の目は、少しも笑っていなかった。'),
      free: L('{a}「えー、また{b}？　ちょっとは遠慮してよ｜また{b}か。少しは遠慮しろ｜また{b}ですか。少しは遠慮してください」――軽い口調のわりに、{a}は一歩も動かなかった。'),
      shy: L('{a}は言い返せずに、唇を噛んだ。{a}「……そこ、私が座りたかった｜……そこは、私が座りたかった｜……そこ、私が座りたかったです」'),
      polite: L('{a}「恐れ入るけど、今は私が{c}と話している｜恐れ入るが、今は私が{c}と話している｜恐れ入りますが、今は私が{c}と話しています」')
    },
    back: L('{b}「先に約束したのは私だけど｜先に約束したのは私だが｜先に約束したのは私ですけど」――{b}も一歩も引かなかった。|{b}は鼻で笑った。{b}「{c}が選ぶことでしょ｜{c}が選ぶことだろう｜{c}が選ぶことでしょう」|{b}「そっちこそ、少しは遠慮したら｜そっちこそ、少しは遠慮したらどうだ｜そちらこそ、少しは遠慮したらどうですか」――二人の声が、少しずつ大きくなった。'),
    end: L('{c}が二人のあいだに割って入った。{c}「二人とも、そこまで｜二人とも、そこまでだ｜お二人とも、そこまでです」――{a}と{b}は、しぶしぶ口をつぐんだ。|{c}は困ったように二人を見比べ、どちらの名前も呼べずに黙り込んだ。{a}と{b}は、それぞれ反対の方向を向いた。|{c}「お願いだから、私の前で喧嘩しないで｜頼むから、私の前で喧嘩をしないでくれ｜お願いですから、私の前で喧嘩しないでください」――{c}の声が震えているのに気づいて、二人はようやく黙った。')
  };
  var FRIEND = {
    lead: L('{a}と{b}は、{c}の寝起きの悪さの話で同時に吹き出した。同じ人を好きになった二人には、分かち合える話がいくらでもあった。|{a}は{b}に、{c}の好きな食べ物をこっそり教えた。{b}はお返しに、{c}が喜ぶ言葉を一つ教えた。|{a}と{b}は、{c}を喜ばせる方法を額を寄せて相談した。{c}は少し離れたところで、不思議そうに二人を見ていた。|{a}と{b}は、{c}を真ん中にして並んで座った。{c}が何か言うたびに、両側から笑い声が返った。|{c}が料理をしているあいだ、{a}と{b}は並んで皿を並べた。三人分の食器が揃うと、{c}は嬉しそうに笑った。|{a}と{b}と{c}は、三人で並んで夜空を見上げた。誰も、誰かを置いていこうとはしなかった。'),
    react: {
      proud: L('{a}「{b}がいると、{c}が笑う回数が増える。……悔しいけど、認める｜{b}がいると、{c}が笑う回数が増える。……悔しいが、認める｜{b}がいると、{c}が笑う回数が増えます。……悔しいですけど、認めます」'),
      stern: L('{a}「{c}を支える者どうし、助け合おう｜＝｜{c}を支える者どうし、助け合いましょう」'),
      tsun: L('{a}「べ、別に{b}と仲良くしたいわけじゃないし。{c}が喜ぶからだし｜別に{b}と仲良くしたいわけではない。{c}が喜ぶからだ｜べ、別に{b}と仲良くしたいわけではありません。{c}が喜ぶからです」'),
      gentle: L('{a}「{b}がいてくれてよかった。一人じゃ、{c}を支えきれなかったと思う｜{b}がいてくれてよかった。一人では、{c}を支えきれなかったと思う｜{b}がいてくれてよかったです。一人では、{c}を支えきれなかったと思います」'),
      devoted: L('{a}「{c}の幸せのためなら、{b}とも手を取り合う｜＝｜{c}の幸せのためなら、{b}とも手を取り合います」'),
      cool: L('{a}「競うより分担したほうが効率がいい。{c}のことは、二人で見よう｜＝｜競うより分担したほうが効率がいいです。{c}のことは、二人で見ましょう」'),
      free: L('{a}「ねえ{b}、今度二人で{c}を驚かせようよ！｜{b}、今度二人で{c}を驚かせよう！｜{b}、今度二人で{c}を驚かせましょう！」'),
      shy: L('{a}「あ、あの……{b}と話すの、ちょっと楽しい｜……{b}と話すのは、少し楽しい｜あ、あの……{b}と話すの、少し楽しいです」'),
      polite: L('{a}「同じ人を想う者として、これからもよろしく｜同じ人を想う者として、これからもよろしく頼む｜同じ人を想う者として、これからもよろしくお願いします」')
    },
    back: L('{b}は少し照れくさそうに笑った。{b}「こっちこそ｜こちらこそ｜こちらこそです」|{b}は{a}の肩を軽く叩いた。{b}「頼りにしてる｜頼りにしている｜頼りにしています」|{b}は何も言わずに頷いて、{a}の隣に座り直した。')
  };
  P.RIVAL = RIVAL; P.FRIEND = FRIEND;
  function rivalWhen(md) {
    return function (ctx, a, b) {
      if (P.mode(ctx) !== md || ctx.flags.polyRivalAt === ctx.stepIndex) return false;
      if (HK.State && (!HK.State.here(a) || !HK.State.here(b))) return false;
      return !!P.rivalsOf(ctx, a, b);
    };
  }
  P.EVENTS.push({
    id: 'poly_rival_feud', label: '同じ人の恋人どうしが鉢合わせて口論', cat: 'conflict', scope: 'pair',
    when: rivalWhen('feud'),
    w: function (ctx, a) { return 0.4 + a.tr.jealous * 0.4 + a.tr.cp * 0.2; },
    run: function (ctx, a, b) {
      var c = P.rivalsOf(ctx, a, b);
      ctx.flags.polyRivalAt = ctx.stepIndex;
      ctx.mod2(a, b, { ten: 6, aff: -3 }, { ten: 5, aff: -2 }); ctx.stress(a, 4); ctx.stress(b, 4); ctx.stress(c, 3);
      var t = fill(ctx.pick(RIVAL.lead), a, b, c) + fill(ctx.pick(RIVAL.react[per(a)]), a, b, c) + fill(ctx.pick(RIVAL.back), a, b, c) + fill(ctx.pick(RIVAL.end), a, b, c);
      return { with: [c], text: t, why: a.name + 'と' + b.name + 'は、どちらも' + c.name + 'の恋人。鉢合わせて口論になった（複数の恋人：恋人どうしは険悪・嫉妬）', mag: 14 };
    }
  }, {
    id: 'poly_rival_warm', label: '同じ人の恋人どうしが打ち解ける', cat: 'bond', scope: 'pair',
    when: rivalWhen('warm'),
    w: function (ctx, a) { return 0.35 + a.tr.np * 0.3 + a.tr.fc * 0.1; },
    run: function (ctx, a, b) {
      var c = P.rivalsOf(ctx, a, b);
      ctx.flags.polyRivalAt = ctx.stepIndex;
      ctx.mod2(a, b, { aff: 4, trust: 3, ten: -3 }, { aff: 4, trust: 3, ten: -3 }); ctx.stress(a, -3); ctx.stress(b, -3); ctx.stress(c, -4);
      var t = fill(ctx.pick(FRIEND.lead), a, b, c) + fill(ctx.pick(FRIEND.react[per(a)]), a, b, c) + fill(ctx.pick(FRIEND.back), a, b, c);
      return { with: [c], text: t, why: a.name + 'と' + b.name + 'は、どちらも' + c.name + 'の恋人。三人で穏やかに過ごした（複数の恋人：恋人どうしも仲が良い・仲良し）', mag: 10 };
    }
  });
})();
