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

  /* 箱庭の設定：三人以上での条件達成 */
  scen.env.splice(4, 0, { id: 'multi', label: '三人以上で一緒に満たす', type: 'select', def: 'note', options: [
    { v: 'note', label: '扉の紙の裏に但し書きがある（見つけたら使える）' },
    { v: 'open', label: '最初から紙に書いてある' },
    { v: 'no', label: '認めない（二人ずつだけ）' }
  ], desc: '「三人以上で同時にした場合、全員がそれぞれ満たしたものとみなす」。回数が一回でも、三人の場面一度で全員分が数えられます' });

  function allowed(ctx) { return (ctx.env.multi || 'note') !== 'no' && !ctx.flags.isOne && A.hasPairRule(ctx); }
  function pairRules(ctx) { return ctx.rules.filter(function (r) { var t = K[r.k].type; return t === 'act' || t === 'word'; }); }
  function maxLvl(ctx) { return ctx.rules.reduce(function (m, r) { return K[r.k].type === 'act' ? Math.max(m, K[r.k].lvl) : m; }, 2); }
  function hasH(ctx) { return ctx.rules.some(function (r) { return r.k === 'h'; }); }
  function free(c) { return !c.out && !c.flags.down; }
  function pairsOf(g) { var o = []; for (var i = 0; i < g.length; i++) for (var j = i + 1; j < g.length; j++) o.push([g[i], g[j]]); return o; }
  function done3(ctx, g) { return pairsOf(g).every(function (p) { return A.pairDone(ctx, p[0], p[1]); }); }
  function family(ctx, a, b) { return A.tieWall(ctx, a, b, 3) >= 999; }
  function okSex(a, b) { return !HK.Pos || HK.Pos.okSex(a, b); }
  /* 体の関係の形：三人の全組が体の関係を持てるなら全員で、そうでなければ二人の両方と持てる一人を中心に（つながらない二人は直接は触れ合わない）。どれも無理なら null */
  function sexShape(g, hubOnly) {
    if (!hubOnly && okSex(g[0], g[1]) && okSex(g[0], g[2]) && okSex(g[1], g[2])) return { sg: g, hubOnly: false };
    for (var i = 0; i < 3; i++) {
      var h = g[i], r = g.filter(function (c) { return c !== h; });
      if (okSex(h, r[0]) && okSex(h, r[1])) return { sg: [h].concat(r), hubOnly: true };
    }
    return null;
  }
  /* きっかけごとの形。取り合われた人・誘われた人が中心のきっかけでは、その人が中心になれなければ成り立たない */
  function shapeFor(ctx, g, kind) {
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
    ctx.flags.multiKnown = (ctx.env.multi || 'note') === 'open';
    ctx.flags.trios = []; ctx.flags.trioHL = {};
  };
  scen.phase = function (ctx, s, n) {
    phase0(ctx, s, n);
    if (s === 0 && ctx.flags.multiKnown && allowed(ctx) && ctx.present().length >= 3)
      ctx.say({ text: '紙の一番下には、小さな字で但し書きがあった。「\u2060※三人以上で同時に行った場合、参加者全員がそれぞれ条件を満たしたものとみなす」' });
  };

  /* ---------- 但し書きを見つける ---------- */
  var FIND = L('{a}は扉の紙を何度も読み返しているうちに、裏面に小さな字の但し書きがあることに気づいた。「\u2060※三人以上で同時に行った場合、参加者全員がそれぞれ条件を満たしたものとみなす」|{a}は紙を照明に透かして、裏に印刷された一文を読み上げた。「\u2060三人以上で同時に行った場合、参加者全員が条件を満たしたものとみなす……だって」|{a}が紙の端をめくると、折り込まれていた部分に続きがあった。「\u2060※複数人での同時達成も可」――部屋の空気が、少し変わった。');
  var FIND_REACT = {
    fc: L('{b}が「え、じゃあ一回で済むじゃん」と身を乗り出した。|{b}は「一石三鳥ってこと？」と笑った。'),
    ac: L('{b}は顔を真っ赤にして、紙から目を逸らした。|{b}は聞こえなかったふりをして、膝を抱え直した。'),
    cp: L('{b}は「冗談じゃない」と吐き捨てたが、紙から目を離さなかった。|{b}は「……選択肢の一つとしては、覚えておく」とだけ言った。'),
    np: L('{b}は「それなら、誰も置いていかなくて済むね」と小さく言った。|{b}は全員の顔を順番に見て、「無理はしないで」と言った。'),
    cold: L('{b}は「合理的ではある」と頷いた。|{b}は黙って、残り時間を計算し直した。')
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
    if (!x.flags.excl || x.flags.exclOpen) return false;
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
      /* 部屋に残る誰かの恋人を連れていく組み合わせは選ばない */
      if (ctx.present().some(function (o) { return g.indexOf(o) < 0 && g.some(function (x) { var t = HK.Ties ? HK.Ties.get(ctx, x, o) : null; return (t && /lover|fwb/.test(t.type)) || ctx.pair(x, o).couple; }); })) return;
      var cands = [];
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
    return { p: ctx.pick(['sandwich', 'sandwich', 'twoOne', 'oneTwo']), t: Tn, m: M, u: Bn };
  }
  /* {t}=上 {m}=真ん中 {u}=下。oneTwo：{t}が{m}と{u}を抱く／twoOne：{t}と{m}が{u}を抱く／sandwich：{t}が{m}を、{m}が{u}を／ring：{t}→{m}→{u}→{t} */
  var SEX = {
    sandwich: L('{m}は{u}の奥まで沈みながら、後ろから{t}に貫かれた。前と後ろから同時に押し寄せる熱に、{m}の声が途切れ途切れになった。|{u}を組み敷いた{m}の腰を、{t}が後ろから掴んで引き寄せた。{m}が{u}を突き上げるたびに、{t}も{m}の奥を突いた。三人の動きは、いつの間にか一つのリズムになっていた。|{t}に後ろから抱かれた{m}は、そのまま{u}の中に入っていった。一番声を上げていたのは、挟まれた{m}だった。'),
    twoOne: L('{u}は{t}に後ろから貫かれながら、{m}にしがみついた。途中で{t}と{m}が入れ替わり、{u}は休む間もなく二人を受け入れ続けた。|{t}と{m}は、{u}を前と後ろから挟むようにして交互に抱いた。{u}は二人の名前を交互に呼びながら、何度も達した。|{u}は{t}の上に跨って腰を落とし、振り返って{m}の首に腕を回した。{t}が果てると、今度は{m}が後ろから{u}の中に入ってきた。'),
    oneTwo: L('{t}は{m}と{u}を並べて寝かせ、交互に抱いた。自分の番を待つ間、{m}と{u}は互いの手を握り合っていた。|{t}が{m}の奥を突いている間、{u}は{t}の背中に口づけを落とし続けた。それから{t}は、待ちきれずに腰を揺らしていた{u}の中に入っていった。|{t}は{m}を抱き、{u}を抱き、また{m}に戻った。二人分の甘い声が、白い部屋の中で重なり合った。'),
    ring: L('三人は、輪のように繋がった。{t}が{m}を抱き、{m}が{u}を抱き、そして{u}が{t}を抱いた。誰が誰を抱いているのか、途中から誰にも分からなくなった。|{t}は{m}の中に、{m}は{u}の中に、{u}は{t}の中に――三人は順番に組み合わせを変えながら、何度も互いを求め合った。')
  };
  var SOFT = {
    kiss: L('三人は額を寄せ合い、順番に唇を重ねた。{a}と{b}、{b}と{c}、{c}と{a}――最後の一回は、三人同時に唇を寄せようとして、鼻がぶつかって笑ってしまった。|{a}は{b}に、{b}は{c}に、{c}は{a}に。三人は輪になって、一周ずつキスを回した。'),
    hug: L('三人は輪になって、互いの背中に腕を回した。誰かの鼓動が、三人分まとめて伝わってきた。|{a}が{b}と{c}をまとめて抱き寄せた。三人分の体温で、白い部屋が少しだけ暖かくなった。'),
    hand: L('三人は輪になって、手を繋いだ。{a}の右手は{b}と、左手は{c}と。|{a}を真ん中に、三人は手を繋いで並んで座った。'),
    lap: L('{a}は{b}の膝に頭を乗せ、{c}の膝に脚を預けた。三人は、そのまましばらく黙っていた。|{b}と{c}が並んで座り、その膝の上に{a}が寝転がった。「贅沢すぎる」と{a}が笑った。'),
    love: L('三人は向かい合って、順番に「好き」と言い合った。{a}から{b}へ、{b}から{c}へ、{c}から{a}へ。言い終わったあと、三人とも照れて目を逸らした。'),
    honne: L('三人は輪になって座り、一人ずつ本音を打ち明けた。誰か一人を選べなかったこと、それでいいと思えたこと。'),
    praise: L('三人は順番に、残りの二人のいいところを言い合った。言われるたびに、誰かが顔を覆った。')
  };
  var OPEN = {
    hub: L('{x}と{y}の視線が、同時に{h}に向いた。{h}は二人の顔を見比べて、長いこと黙っていた。「……選べない。だったら、三人で」|{x}と{y}は、どちらが{h}の相手をするかで言い争いになりかけた。{h}が二人の手を同時に取った。「喧嘩するくらいなら、三人でしよう」|{h}は「どっちかを選んだら、もう一人を置いていくことになる」と言った。それから、紙の但し書きを指さした。'),
    invite: L('{x}と{y}は顔を見合わせ、部屋の隅で膝を抱えていた{h}に手を差し出した。「一人だけ置いていくのは、なしにしよう」|{x}は{y}の手を握ったまま、{h}の方を振り返った。「{h}も、一緒に」――{y}も、黙って頷いた。|二人で出たら、{h}は一人きりでこの部屋に残る。{x}と{y}は同じことを考えていた。「……三人で、出よう」'),
    free: L('{h}が「三人の方が早くない？」と笑った。誰も、反対しなかった。|{h}は残りの二人の手を引いて、ベッドの真ん中に座らせた。「せっかくだし、みんなで」'),
    late: L('時間がない。三人は顔を見合わせ、言葉少なに決めた。「……三人で、一回で終わらせよう」|照明が暗くなっていく中で、三人は誰からともなく身を寄せ合った。'),
    warm: L('この部屋で過ごすうちに、三人の距離はすっかり縮まっていた。{h}が但し書きを指さすと、残りの二人は顔を見合わせて、小さく笑った。|「誰と誰が、とかじゃなくてさ」と{h}が言った。「三人で、ってのはどう？」――二人は少し考えて、頷いた。')
  };
  var CLIMAX3 = L('三人はほとんど同時に果てて、そのまま折り重なるようにベッドに沈んだ。|最後に誰が果てたのか、三人とも覚えていなかった。乱れたシーツの上で、三人分の荒い息だけが聞こえていた。|終わったあと、三人は川の字になって寝転がった。真ん中の誰かが、両側の手を握っていた。');

  /* ---------- 三人の場面 ---------- */
  /* 三人のエッチ：前戯→本番→見所→絶頂→余韻（文は room-trio-lines.js） */
  function sexScene(ctx, g, kind, sp, hubOnly, first) {
    var X = HK.TrioLines, V = HK.Voice, pf = function (arr) { return ctx.pick(arr); };
    var r = { h: g[0], x: g[1], y: g[2], t: sp.t, m: sp.m, u: sp.u };
    /* 受ける側の役（recv）に、自分で攻めを選んだ人を置かない */
    var hard = function (c) { return !!(c && HK.Pos && HK.Pos.hardTop(c)); };
    var sTop = function (k) { var c = g.slice().sort(function (p, q) { return q.tr[k] - p.tr[k]; })[0]; return c.tr[k] > 0.55 ? c : null; };
    var recvOK = function (o) { return !o.recv || !o.recv.split(' ').some(function (k) { return hard(k === 's' ? sTop(o.who) : r[k]); }); };
    /* 女性どうしで繋がる組があれば、挿入の描写を使わない（白い部屋の木箱の玩具はよい） */
    var E = { oneTwo: [[sp.t, sp.m], [sp.t, sp.u]], twoOne: [[sp.t, sp.u], [sp.m, sp.u]], sandwich: [[sp.t, sp.m], [sp.m, sp.u]], ring: [[sp.t, sp.m], [sp.m, sp.u], [sp.u, sp.t]] }[sp.p];
    var ffE = HK.Pos ? E.filter(function (e) { return HK.Pos.ff(e[0], e[1]); })[0] : null;
    var PEN = /奥まで沈|深く沈|腰を沈|腰を落と|繋が|貫|突い|突き|突く|突か|中に入|入って|熱を吐き出|腰を打ちつけ|果てて.*中|最奥|迎え入れ|受け入れ|挿れ|挿入|抜き差し|根元|穿|口に含/;
    var penOK = function (l) { return !ffE || !PEN.test(l); };
    var ok = function (o) { return (!o.kinds || o.kinds.split(' ').indexOf(kind) >= 0) && (!o.shapes || o.shapes.split(' ').indexOf(sp.p) >= 0) && recvOK(o); };
    var noHub = function (l) { return (!hubOnly || !/同時に触れ合|抱きしめ合/.test(l)) && penOK(l); };
    if (!X) return ctx.pick(SEX[sp.p]).replace(/\{t\}/g, sp.t.name).replace(/\{m\}/g, sp.m.name).replace(/\{u\}/g, sp.u.name) + ctx.pick(CLIMAX3);
    var out = [];
    /* 前戯（初回だけ） */
    if (first) {
      var wm = X.WARM.filter(ok), w = ctx.pick(wm.length ? wm : X.WARM.filter(recvOK)), wl = w.t.filter(noHub);
      out.push(X.fill(ctx.pick(wl.length ? wl : w.t), r));
    }
    /* 本番 */
    var ml = ffE && X.MAIN_FF ? X.MAIN_FF[sp.p].concat(ctx.flags.toolbox ? X.TOY_FF[sp.p] || [] : []) : X.MAIN[sp.p].filter(noHub);
    out.push(X.fill(ctx.pick(ml.length ? ml : X.MAIN[sp.p]), r));
    if (V && ctx.rng() < 0.75) out.push(X.fill(V.line(pf, sp.u.persona, ctx.rng() < 0.5 ? 'edge' : 'climax', 'b').replace(/\{b\}/g, '{u}').replace(/\{a\}/g, '{t}'), r));
    /* 見所：一つか二つ */
    var top = function (k, th) { var c = g.slice().sort(function (p, q) { return q.tr[k] - p.tr[k]; })[0]; return c.tr[k] > th ? c : null; };
    var hl = X.HL.filter(function (o) { return ok(o) && (!o.who || top(o.who, 0.55)) && o.t.every(penOK); });
    var n = first ? (ctx.rng() < 0.6 ? 2 : 1) : 1, used = [];
    for (var k = 0; k < n && hl.length; k++) {
      var o = HK.weighted(ctx.rng, hl, function (z) { return (z.kinds ? 2.2 : 1) * (z.shapes ? 1.6 : 1) * (z.who ? 1.3 : 1) / (1 + (ctx.flags.trioHL[z.id] || 0) * 2); });
      hl.splice(hl.indexOf(o), 1);
      ctx.flags.trioHL[o.id] = (ctx.flags.trioHL[o.id] || 0) + 1;
      var rr = Object.assign({}, r); if (o.who) rr.s = top(o.who, 0.55);
      out.push(X.fill(ctx.pick(o.t), rr));
      used.push(o.tag);
      if (o.id === 'sync') r.synced = true;
    }
    if (sp.p === 'sandwich' && V && ctx.rng() < 0.6) out.push(X.fill(V.line(pf, sp.m.persona, 'climax', 'b').replace(/\{b\}/g, '{m}').replace(/\{a\}/g, '{t}'), r));
    /* 絶頂と余韻 */
    if (!r.synced) out.push(ctx.pick(X.CLIMAX));
    if (ctx.rng() < (first ? 0.7 : 0.4)) out.push(X.fill(ctx.pick(X.AFTER), r));
    ctx.flags.lastTrioTags = used;
    var txt3 = out.join('');
    if (ffE && HK.FF) txt3 = HK.FF.fix(ctx, txt3, ffE[0], ffE[1], { tools: !!ctx.flags.toolbox });
    return txt3;
  }
  function scene(ctx, g, kind, first, nPresent) {
    var h = g[0], x = g[1], y = g[2], V = HK.Voice, pf = function (arr) { return ctx.pick(arr); };
    var op = OPEN[kind].filter(function (l) { return nPresent === 3 || !/一人きり/.test(l); });
    var txt = first ? ctx.t(ctx.pick(op).replace(/\{h\}/g, '\u0001').replace(/\{x\}/g, '\u0002').replace(/\{y\}/g, '\u0003'), h, x, y).replace(/\u0001/g, h.name).replace(/\u0002/g, x.name).replace(/\u0003/g, y.name)
      : (HK.TrioLines ? HK.TrioLines.fill(ctx.pick(HK.TrioLines.ROUND2), { h: h, x: x, y: y }) : ctx.t('三人は、もう一度身を寄せ合った。', h, x, y));
    var rk = pairRules(ctx), sex = rk.some(function (r) { return r.k === 'h'; });
    if (sex) {
      /* 体の関係を持てない二人（攻め×攻めなど）は直接は繋がらない：両方と持てる一人を中心にする */
      var sh = shapeFor(ctx, g, kind);
      if (sh) txt += sexScene(ctx, sh.sg, kind, shape(ctx, sh.sg, sh.hubOnly), sh.hubOnly, first, nPresent);
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
    var n = Math.min.apply(null, pairsOf(g).map(function (pr) { return A.prog(ctx, pr[0], pr[1]).act[r.k] || 0; }));
    return '（三人で' + K[r.k].noun + ' ' + n + '/' + r.n + '）';
  }

  /* 三人（以上）で出る */
  T.exitGroup = function (ctx, g, text, why, night, kind) {
    g.forEach(function (c) {
      c.out = true; c.fate = '脱出';
      c.fateNote = g.filter(function (o) { return o !== c; }).map(function (o) { return o.name; }).join('と') + 'と、' + kn(g.length) + 'で部屋を出た';
      c.flags.trio = g.map(function (o) { return o.i; });
    });
    pairsOf(g).forEach(function (pr) { ctx.mod2(pr[0], pr[1], { trust: 8, aff: 4 }, { trust: 8, aff: 4 }); if (night && okSex(pr[0], pr[1])) ctx.pair(pr[0], pr[1]).night = true; });
    var ex = { group: g.map(function (c) { return c.i; }), label: ctx.label, trio: true, night: !!night, kind: kind || 'warm' };
    (ctx.flags.exits = ctx.flags.exits || []).push(ex);
    ctx.flags.trios.push(ex);
    return { cat: 'escape', mag: 40, text: text + '扉の鍵が外れる音がした。' + nm3(g) + 'は、' + kn(g.length) + 'そろって部屋を出た。', why: why };
  };

  /* 「一人だけ」と決めた人を、三人に誘う（説得）。折れれば、次から三人の場面に入れる */
  EV.push({
    id: 'trio_persuade', cat: 'romance', scope: 'pair', pri: true,
    when: function (ctx, a, b) {
      if (!allowed(ctx) || !ctx.flags.multiKnown || ctx.present().length < 3 || !free(a) || !free(b) || ctx.flags.trioCur) return false;
      if (!b.flags.excl || b.flags.exclOpen || (b.flags.persuadeAt === ctx.stepIndex) || (b.flags.persuadeN || 0) >= 3) return false;
      if (ctx.stepIndex - (b.flags.partnerAt || 0) < 1) return false;
      var third = ctx.present().filter(function (c) { return c !== a && c !== b && free(c) && HK.canLove(b, c); })[0];
      if (!third) return false;
      return a.i === b.flags.partner ? A.eager(ctx, a) > 0.45 || a.tr.np > 0.6 : A.eager(ctx, a) > 0.55 && R(ctx, a, b).att > 15;
    },
    w: function (ctx, a, b) { return 0.5 + A.eager(ctx, a) + (a.i === b.flags.partner ? 0.5 : 0); },
    run: function (ctx, a, b) {
      var isP = a.i === b.flags.partner;
      var c = ctx.present().filter(function (x) { return x !== a && x !== b && free(x) && HK.canLove(b, x); }).sort(function (x, y) { return R(ctx, b, y).att - R(ctx, b, x).att; })[0];
      b.flags.persuadeAt = ctx.stepIndex; b.flags.persuadeN = (b.flags.persuadeN || 0) + 1;
      var ch = 0.2 + R(ctx, b, a).trust / 110 + R(ctx, b, a).att / 130 + A.eager(ctx, b) * 0.4 - b.tr.cp * 0.3 + (isP ? 0.15 : 0) + b.stress / 300 + (b.flags.persuadeN - 1) * 0.1 + Math.max(0, R(ctx, b, c).att) / 150;
      var ok = ctx.rng() < ch;
      var t = ctx.t(ctx.pick(isP ? [
        '{a}は{b}の手を取った。{a}「三人で、なんて……{b}が嫌ならやめる。でも、{c}を一人にしておけないんだ」',
        '{a}は{b}の耳元で囁いた。{a}「私は{b}が一番だよ。それは変わらない。……{c}も、一緒にいてほしい」',
        '{a}「{b}が決めたことは分かってる。でも、このままじゃ{c}だけ出られない」'
      ] : [
        '{a}が{b}の前に座り込んだ。{a}「{b}が一人だけって決めてるのは知ってる。でも、三人なら早く出られる」',
        '{a}は{b}に頭を下げた。{a}「お願い。邪魔はしない。端っこにいさせてくれるだけでいいから」',
        '{a}「ねえ{b}、決め事って、たまには破ってもいいと思う」'
      ]), a, b, c);
      if (ok) {
        b.flags.exclOpen = true;
        ctx.mod2(b, a, { trust: 4, att: 3 }, { trust: 4, att: 3 });
        t += ctx.t(ctx.pick([
          '{b}は長いこと黙っていた。それから、{a}の顔を見ずに小さく頷いた。{b}「……{a}がそこまで言うなら」',
          '{b}はため息をついた。{b}「……今回だけ。それに、{a}が隣にいるなら」',
          '{b}は{c}の方をちらりと見て、目を伏せた。{b}「……分かった。仲間外れは、させたくない」'
        ]), a, b, c);
        return { text: t, why: a.name + 'が、「相手は一人だけ」と決めていた' + b.name + 'を説得した（' + (isP ? '決めた相手からの頼み・' : '') + '信頼・惹かれ）。' + b.name + 'は三人に加わってもいいと思い始めた', mag: 16, with: c ? [c] : [] };
      }
      ctx.mod2(b, a, { ten: 4 }, { ten: 2 });
      t += ctx.t(ctx.pick([
        '{b}は首を振った。{b}「最初に言ったよね。他の人とは無理」',
        '{b}は{a}の手をそっと外した。{b}「……ごめん。そこは、譲れない」',
        '{b}は黙って、壁の方を向いてしまった。'
      ]), a, b, c);
      return { text: t, why: b.name + 'は「相手は一人だけ」という決め事を曲げなかった（CP・積極性の低さ）', mag: 10, with: c ? [c] : [] };
    }
  });
  EV.push({
    id: 'trio', cat: 'romance', scope: 'pair', pri: true,
    when: function (ctx, a, b) {
      if (!allowed(ctx) || !ctx.flags.multiKnown || ctx.present().length < 3 || !free(a) || !free(b)) return false;
      if (ctx.flags.trioCur) return false;
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
      var refuser = g.filter(function (c) { return c.tr.cp > 0.72 && A.eager(ctx, c) < 0.35 && pl.kind !== 'late'; })[0];
      if (refuser) {
        refuser.flags.trioNo = true;
        g.forEach(function (c) { if (c !== refuser) ctx.mod(refuser, c, { ten: 6 }); });
        return { cat: 'conflict', text: ctx.t(ctx.pick(['{a}は「三人で、なんて絶対に無理」と首を振った。話は、そこで終わった。', '{a}は但し書きの紙を裏返して、「見なかったことにする」と言った。', '{a}「私は、するなら一人とだけ。それは譲れない」']), refuser), why: refuser.name + 'のCP（' + Math.round(refuser.eg.CP) + '）：三人でという形には頷けなかった', mag: 12, with: g.filter(function (c) { return c !== refuser; }) };
      }
      /* 「一人だけ」と決めていた人が加わるなら、気持ちが変わったことを一言はさむ（説得されていれば、その場面がすでにある） */
      var turn = g.filter(function (c) { return c.flags.excl && !c.flags.exclOpen; }).map(function (c) {
        c.flags.exclOpen = true;
        var late = c.stress > 70 && ctx.stepIndex >= ctx.stepsTotal * 0.7;
        return ctx.t(ctx.pick(late ? ['{a}は、「他の人とは無理」と言った自分を思い出した。けれど、もう時間がなかった。', '{a}は唇を噛んだ。最初の決め事より、ここを出ることの方が大事になっていた。']
          : ['{a}は、「相手は一人だけ」と言ったときのことを思い出した。あれから何時間も経って、気持ちは少しずつ変わっていた。', '{a}は、自分で決めたはずの線を、もう一度見直していた。この部屋で過ごした時間が、それを書き換えていた。']), c);
      }).join('');
      ctx.flags.trioCur = { g: g.map(function (c) { return c.i; }), kind: pl.kind };
      g.forEach(function (c) { c.flags.partner = null; });
      count(ctx, g);
      pairsOf(g).forEach(function (pr) { ctx.mod2(pr[0], pr[1], { att: 8, aff: 5, trust: 4 }, { att: 8, aff: 5, trust: 4 }); });
      ctx.present().filter(function (o) { return g.indexOf(o) < 0; }).forEach(function (o) { g.forEach(function (c) { ctx.mod(o, c, { ten: 3 }); }); ctx.stress(o, 5); });
      var text = turn + scene(ctx, g, pl.kind, true, ctx.present().length);
      var why = { hub: g[1].name + 'と' + g[2].name + 'がどちらも' + g[0].name + 'に惹かれていた。' + g[0].name + 'は選ばなかった', invite: g[1].name + 'と' + g[2].name + 'は、' + g[0].name + 'を一人で残したくなかった', free: '三人とも積極的だった（' + g.map(function (c) { return Math.round(A.eager(ctx, c) * 100); }).join('・') + '）', late: '残り時間への焦り。三人なら一度で済む', warm: '三人とも、互いに打ち解けていた' }[pl.kind] + '／但し書き：三人以上で同時なら全員分';
      if (ctx.flags.lastTrioTags && ctx.flags.lastTrioTags.length) { why += '／見所：' + ctx.flags.lastTrioTags.join('・'); ctx.flags.lastTrioTags = null; }
      if (done3(ctx, g)) { ctx.flags.trioCur = null; return T.exitGroup(ctx, g, text, why, hasH(ctx), pl.kind); }
      return { text: text + progText(ctx, g) + '扉はまだ開かない。', why: why, mag: 30, with: g.filter(function (c) { return c !== a && c !== b; }) };
    }
  });
  /* 二回目以降（回数が多い条件のとき） */
  EV.push({
    id: 'trio_more', cat: 'romance', scope: 'solo', pri: true,
    when: function (ctx, a) { var c = ctx.flags.trioCur; return !!c && c.g.indexOf(a.i) >= 0 && c.g.every(function (i) { return free(ctx.chars[i]); }); },
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
  T.BOND_LABEL = { marry: '三人婚', secret: '三人だけの秘密の関係', jealous: '三人のうち一人が揺れている', forget: 'なかったことにした' };
  var BOND_TEXT = {
    marry: L('部屋を出てしばらくして、{a}・{b}・{c}は一緒に暮らし始めた。誰か一人を選ぶ必要は、もうなかった。|半年後、三人は揃いの指輪をはめていた。形のない約束だったが、三人にはそれで十分だった。|三人はそれからも、休みのたびに同じ部屋に集まった。いつの間にか、そこが三人の家になっていた。'),
    secret: L('部屋を出たあとも、三人はときどき集まった。それが何という関係なのか、誰も名前をつけなかった。|三人のグループチャットは、外から見ればただの友達同士だった。夜にだけ、少しだけ違う会話が流れた。'),
    jealous: L('部屋を出たあと、{a}は二人が並んで歩く背中を、少しだけ寂しそうに見ていた。三人の形は、まだ定まっていなかった。|三人はそれからも会ったが、誰か一人が先に帰る夜が増えていった。'),
    forget: L('部屋を出た三人は、あの部屋でのことを一度も口にしなかった。それが、三人の出した答えだった。|三人は外で別れるとき、「じゃあ、また」とだけ言った。また、があるのかは分からなかった。')
  };
  scen.finish = function (ctx) {
    finish0(ctx);
    (ctx.flags.trios || []).forEach(function (ex) {
      var g = ex.group.map(function (i) { return ctx.chars[i]; });
      var bd = T.bond(ctx, g);
      ex.bond = bd; ex.bondLabel = T.BOND_LABEL[bd];
      var lone = bd === 'jealous' ? g.slice().sort(function (p, q) { var s = function (c) { return g.reduce(function (t, o) { return o === c ? t : t + R(ctx, o, c).aff; }, 0); }; return s(p) - s(q); })[0] : g[0];
      var order = [lone].concat(g.filter(function (c) { return c !== lone; }));
      g.forEach(function (c) { c.fateNote += '。その後は「' + ex.bondLabel + '」'; });
      ctx.say({ kind: 'event', cat: 'romance', actors: g, text: ctx.t(ctx.pick(BOND_TEXT[bd]), order[0], order[1], order[2] || order[1]), why: '部屋を出たあとの三人：三人のあいだの好意と緊張から', mag: 20 });
    });
  };
})();
