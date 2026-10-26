/* 箱庭シミュレーター: 邪神村RTA ― 探偵どうしの関係と、憎しみ・愛憎（feud-kit.js の部品を使う）
   ・探偵は「名探偵」にまとめた（以前の「探偵」の指定は名探偵として読む）
   ・名探偵とポンコツ探偵の顔合わせは、二人の関係で変わる（先輩後輩の向き・ライバル・恋人・親しい・初対面）。名探偵が二人のときも
   ・ライバル・敵対の探偵は、手がかりを奪い合う。敵対している名探偵どうしは、ぶつかり合うこともある
   ・憎しみだけの相手は、村人に生贄として差し出したり、人目のないところで手にかけたりする
   ・愛憎の二人は、揉めると無理やり唇や体を奪うこともあるが、それ以上に、相手が危ないときは身を挺して守る
     愛憎の欄（tie.lh）を設定した組は、それに従う（片方だけなら、持つ側だけが揉めながら構い、守る）。
     唇・体に踏み込むのは、恋愛対象と受け攻めの合う組だけ（feud-kit.js の HK.Feud.clash）。
     同じ二人の「構う」（hate-love.js）と「揉める」は、同じ区切り（4時間）のうちに重ねない
   台詞は tone-lines.js（口調ごとの書き下ろし） */
(function () {
  'use strict';
  var HK = window.HK, ST = HK.Story, JS = HK.JASHIN, FD = HK.Feud, clamp = HK.clamp;
  if (!ST || !JS || !JS.REL || !FD) return;
  var TL = HK.TL;

  /* ---------- 探偵は名探偵にまとめる ---------- */
  if (JS.JOB && JS.JOB.detective) {
    JS.JOBS = JS.JOBS.filter(function (j) { return j.id !== 'detective'; });
    JS.JOB.detective = JS.JOB.sleuth;   /* 以前の指定は名探偵として読む */
    var sc = HK.SCENARIOS && HK.SCENARIOS.jashin;
    (sc && sc.perFields || []).forEach(function (f) { if (f.id === 'job') f.options = f.options.filter(function (o) { return o.id !== 'detective'; }); });
  }
  var DET = { sleuth: 1, ponkotsu: 1 };
  function isDet(p) { return !!DET[p.job]; }
  function A(S) { return S.P.filter(function (p) { return JS.alive(p) && !p.bound; }); }
  function edge(S, a, b, lab, cls) { if (JS.DRAMA) JS.DRAMA.edge(S, a, b, lab, cls, a); }
  function pk(S, l) { return ST.pick(S, l); }

  /* 以前の「探偵」を名探偵に読み替える（準備のあと、到着の前） */
  var setup0 = JS.REL.setup;
  JS.REL.setup = function (S, input) {
    S.P.forEach(function (p) { if (p.job === 'detective') p.job = 'sleuth'; });
    return setup0.apply(this, arguments);
  };

  /* ---------- 顔合わせ：関係で変わる ---------- */
  var arrive0 = JS.REL.arrive;
  JS.REL.arrive = function (S) {
    /* もとの顔合わせ（ポンコツ探偵の「先輩」固定の掛け合い）は、関係で選び直す */
    var RT = JS.RELT, banter = RT.PONK_BANTER;
    RT.PONK_BANTER = [''];
    arrive0.apply(this, arguments);
    RT.PONK_BANTER = banter;
    var sls = S.P.filter(function (p) { return p.job === 'sleuth'; }), pks = S.P.filter(function (p) { return p.job === 'ponkotsu'; }), done = {};
    pks.forEach(function (p) {
      /* 関係のある名探偵を優先 */
      var sl = sls.slice().sort(function (a, b) { return FD.ties(S, b, p).length - FD.ties(S, a, p).length; })[0];
      if (!sl) return;
      done[sl.i + '-' + p.i] = 1;
      var d = FD.duoText(S, sl, p);
      ST.say(S, { actors: [sl, p], tag: '名探偵とポンコツ探偵', text: d.text, why: sl.name + '（名探偵）と' + p.name + '（ポンコツ探偵）の関係：' + FD.label(S, sl, p), mag: 12 });
    });
    /* 名探偵が二人以上：関係があれば顔合わせ */
    sls.forEach(function (a) {
      sls.forEach(function (b) {
        if (a.i >= b.i || done[a.i + '-' + b.i] || !FD.ties(S, a, b).length) return;
        var d = FD.duoText(S, a, b);
        ST.say(S, { actors: [a, b], tag: '名探偵どうし', text: d.text, why: '名探偵が二人。関係：' + FD.label(S, a, b), mag: 12 });
      });
    });
  };

  /* ---------- 毎時：奪い合い・ぶつかり合い・憎しみ・愛憎 ---------- */
  var tick0 = JS.REL.tick;
  JS.REL.tick = function (S, live, h) {
    tick0.apply(this, arguments);
    live = A(S);
    if (live.length < 2) return;
    obTick(S, live) || hkTick(S, live, h) || snatch(S, live, h) || detFight(S, live, h) || lhClash(S, live, h) || hateMove(S, live, h);
  };
  /* 執着（ヤンデレ。obsess-story.js） */
  function obTick(S, live) {
    var r = HK.Obsess && HK.Obsess.storyTick ? HK.Obsess.storyTick(S, live, { rate: 0.12 }) : null;
    if (!r) return false;
    ST.say(S, { actors: r.actors, tag: r.tag, kind: r.kind, text: r.text, why: r.why, mag: r.mag });
    edge(S, r.actors[0], r.actors[1], r.tag, 'obsess');
    return true;
  }
  /* 敵視の出来事（出会ったとき・嫌がらせ・無視・噛み合わない関係・衝突。hate-kit.js） */
  function hkTick(S, live, h) {
    if (!HK.HateKit) return false;
    var r = HK.HateKit.storyTick(S, live, { rate: 0.1 + (JS.night(h) ? 0.03 : 0), lhSkip: function (a, b) { return lhNear(S, a, b, h); } });
    if (!r) return false;
    if (r.lh) FD.lhMark(S, r.actors[0], r.actors[1], h);
    ST.say(S, { actors: r.actors, tag: r.cat === 'romance' ? '片恋と嫌悪' : '敵視', text: r.text, why: r.why, mag: r.mag });
    edge(S, r.actors[0], r.actors[1], '敵視', 'enemy');
    return true;
  }
  function pairs(S, live, test) {
    var out = [];
    live.forEach(function (a) { live.forEach(function (b) { if (a !== b && test(a, b)) out.push([a, b]); }); });
    return out;
  }

  /* 手がかりの奪い合い（ライバル・敵対・愛憎の、どちらかが探偵の二人） */
  function snatch(S, live, h) {
    var rng = S.rng, ps = pairs(S, live, function (a, b) { return (isDet(a) || isDet(b)) && FD.rival(S, a, b); });
    if (!ps.length || rng() > 0.09 || S.found.length >= S.G.clues.length) return false;
    var pr = rng.pick(ps), a = pr[0], b = pr[1];
    a.rivalBoost = b.rivalBoost = 2;
    var t = b.name + 'が床下の古い箱に手を伸ばした瞬間、' + a.name + 'が横からそれをさらった。' + TL.line(a, 'CLUE_SNATCH', b);
    edge(S, a, b, '出し抜いた', 'enemy');
    if (rng() < 0.3) {
      ST.say(S, { actors: [a, b], tag: '奪い合い', text: t + b.name + 'は黙って、箱の端を掴み返した。二人が引っ張り合ううちに、中の古文書は真っ二つに裂けた。読める部分は、ほとんど残っていなかった。', why: a.name + 'と' + b.name + '（' + FD.label(S, a, b) + '）の手がかりの奪い合い――台無しになった', mag: 22 });
      return true;
    }
    var g = JS.GODEV ? JS.GODEV.giveClue(S, a) : '';
    t += TL.line(b, 'CLUE_SNATCH_BACK', a);
    ST.say(S, { actors: [a, b], tag: '奪い合い', text: t + (g ? a.name + 'は、勝ち誇ったように中身を読み上げた' + g : ''), why: a.name + 'と' + b.name + '（' + FD.label(S, a, b) + '）は張り合って、手がかりを奪い合う' + (g ? '（手がかり +1）' : ''), mag: 20 });
    return true;
  }
  /* 敵対している名探偵どうしの衝突 */
  function detFight(S, live, h) {
    var rng = S.rng, C = JS.core, ps = pairs(S, live, function (a, b) { return a.job === 'sleuth' && b.job === 'sleuth' && a.i < b.i && (FD.level(S, a, b) >= 65 || FD.level(S, b, a) >= 65 || (FD.level(S, a, b) >= 35 && FD.level(S, b, a) >= 35)) && !FD.lovehate(S, a, b); });
    if (!ps.length || rng() > 0.05 || S.detFought) return false;
    S.detFought = true;
    var pr = ps[0], a = pr[0].tr.aggr >= pr[1].tr.aggr ? pr[0] : pr[1], b = a === pr[0] ? pr[1] : pr[0];
    var t = '推理の食い違いは、とうとう怒鳴り合いになった。' + TL.line(a, 'DET_FIGHT', b);
    edge(S, a, b, '衝突', 'enemy');
    if (rng() < 0.12 + a.tr.aggr * 0.15 && !(HK.SameStory && HK.SameStory.nk && HK.SameStory.nk(S, a, b))) {   /* 殺さない相手（HK.Attr.noKillPair）は、揉み合っても殺さない */
      C.die(S, b, '推理の食い違いから' + a.name + 'と揉み合いになって', [t + a.name + 'が突き飛ばした先に、民宿の急な階段があった。{a}は、首をあり得ない方向に曲げて、階段の下に横たわっていた。']);
      return true;
    }
    a.m.hp = clamp(a.m.hp - 12, 0, 100); b.m.hp = clamp(b.m.hp - 15, 0, 100);
    S.hostile = clamp(S.hostile + 4, 0, 100);
    ST.say(S, { actors: [a, b], tag: '名探偵どうし', kind: 'climax', text: t + '掴み合いになった二人を、仲間が必死で引き剥がした。二人とも、それから口をきかなくなった。――村人たちは、その様子をにやにやと眺めていた。', why: '敵対している名探偵どうし。推理の主導権をめぐってぶつかった（村人の敵意 +4）', mag: 30 });
    return true;
  }
  /* 同じ二人の愛憎の出来事（構う・揉める）が、この4時間のうちにあったか */
  function lhNear(S, a, b, h) { var t = FD.lhLast(S, a, b); return t != null && h - t < 4; }
  /* 愛憎の二人：揉めて、無理やり奪う。愛憎を抱く側（FD.lhFrom）が強引な側。双方なら、気の強いほう */
  function lhClash(S, live, h) {
    var rng = S.rng, ps = pairs(S, live, function (a, b) { return FD.lhFrom(S, a, b) && (a.lhAt == null || h - a.lhAt > 8) && !lhNear(S, a, b, h); });
    if (!ps.length || rng() > 0.06 + (JS.night(h) ? 0.03 : 0)) return false;
    var pr = rng.pick(ps), a = !FD.lhFrom(S, pr[1], pr[0]) ? pr[0] : pr[0].tr.aggr + pr[0].tr.cp >= pr[1].tr.aggr + pr[1].tr.cp ? pr[0] : pr[1], b = a === pr[0] ? pr[1] : pr[0];
    a.lhAt = b.lhAt = h;
    FD.lhMark(S, a, b, h);
    var r = FD.clash(S, a, b, function (l) { return pk(S, l); });
    a.m.fear = clamp(a.m.fear - 4, 0, 100); b.m.fear = clamp(b.m.fear + 6, 0, 100);
    if (r.r18) { a.cnt.r18 = (a.cnt.r18 || 0) + 1; b.cnt.r18 = (b.cnt.r18 || 0) + 1; }
    edge(S, a, b, r.r18 ? '無理やり抱いた' : r.touch === false ? '揉み合った' : '唇を奪った', r.touch === false ? 'enemy' : 'obsess');
    ST.say(S, { actors: [a, b], tag: '愛憎', kind: r.r18 ? 'climax' : 'event', text: r.text, why: '愛憎（' + FD.label(S, a, b) + '）。' + FD.lhWhy(S, a, b) + (r.touch === false ? '（恋愛対象・受け攻めが合わないので、口論と掴み合いまで）' : ''), mag: r.r18 ? 30 : 24 });
    return true;
  }
  /* 憎しみだけの相手：生贄に差し出す・手にかける */
  function hateMove(S, live, h) {
    var rng = S.rng, C = JS.core, night = JS.night(h);
    /* 生贄に差し出す・手にかけるのは、敵対の強さの嫌悪（不仲なら、嫌がらせや口論にとどまる） */
    /* 殺さない組は、生贄に差し出す・手にかけることをしない（same-story.js） */
    var ps = pairs(S, live, function (a, b) { return FD.hateStrong(S, a, b) && !b.taken && !(HK.SameStory && HK.SameStory.nk && HK.SameStory.nk(S, a, b)); });
    if (!ps.length) return false;
    var pr = rng.pick(ps), a = pr[0], b = pr[1];
    var urge = 0.012 + a.tr.aggr * 0.025 + a.tr.cold * 0.02 + a.m.fear / 2500 + (night ? 0.01 : 0) + (S.ygo ? (a.viol || 0) / 2000 : 0) + (h > S.deadline * 0.6 ? 0.012 : 0);
    if (rng() > urge || a.hateDone) return false;
    a.hateDone = true;
    edge(S, a, b, '憎んでいる', 'enemy');
    if (rng() < 0.55) {
      /* 村人に生贄として差し出す */
      var t = '夜更け、' + a.name + 'は一人で村長の家を訪ねた。' + TL.line(a, 'HATE_OFFER', b) + '村長は、皺だらけの顔で、ゆっくりと笑った。「＠よう言うてくださった」';
      if (rng() < 0.55 - b.tr.caution * 0.2 - b.stats.luck * 0.03) {
        b.taken = true; b.takenAt = h;
        a.notes.push(b.name + 'を、生贄として村人に差し出した');
        var o = ST.say(S, { actors: [a, b], tag: '差し出す', kind: 'climax', text: t + 'その夜、' + b.name + 'の部屋に、提灯を持った村人たちがやってきた。' + b.name + 'は、最後まで、誰が自分を売ったのか知らなかった。', why: a.name + 'は' + b.name + '（' + FD.label(S, a, b) + '）を憎んでいる。生贄として村人に差し出した――連れ去られた（儀式の前に対抗策を実行できれば、助け出せる）', mag: 40 });
        ST.key(S, o, a.name + 'が' + b.name + 'を村人に売った');
        return true;
      }
      b.m.fear = clamp(b.m.fear + 12, 0, 100);
      ST.say(S, { actors: [a, b], tag: '差し出す', text: t + 'しかし、その夜、村人たちが来たとき、' + b.name + 'は部屋にいなかった。' + b.name + 'は、戻ってきた' + a.name + 'の顔を、黙って見つめていた。', why: a.name + 'は' + b.name + 'を村人に売ろうとしたが、' + b.name + 'は勘づいていた（慎重さ・運）', mag: 30 });
      return true;
    }
    /* 人目のないところで手にかける */
    var t2 = a.name + 'は、' + b.name + 'を「話がある｜＝｜お話があります」と神社の裏手へ呼び出した。' + TL.line(a, 'HATE_KILL', b);
    var win = 0.45 + a.tr.aggr * 0.2 + JS.skill(a, 'fight') * 0.2 - JS.skill(b, 'fight') * 0.2 - b.stats.luck * 0.02;
    if (rng() < win) {
      a.mur = { x: '石', t: b };
      S.killer = a;
      C.die(S, b, a.name + 'に、神社の裏で殴り殺されて', [t2 + a.name + 'の手には、拾った石が握られていた。{a}が振り向く前に、石は振り下ろされた。――翌朝、' + a.name + 'は、誰よりも早く「' + b.name + 'がいない」と騒いだ。']);
      var cs = S.cases[S.cases.length - 1]; if (cs && cs.v === b) cs.kind = 'murder';
      return true;
    }
    a.m.hp = clamp(a.m.hp - 15, 0, 100); b.m.hp = clamp(b.m.hp - 10, 0, 100); b.m.fear = clamp(b.m.fear + 15, 0, 100);
    if (HK.HateKit) { HK.HateKit.shift(S, b, a, 30); HK.HateKit.shift(S, a, b, 6); }
    ST.say(S, { actors: [a, b], tag: '殺意', kind: 'climax', text: t2 + a.name + 'が振り上げた石を、' + b.name + 'は寸前で受け止めた。もみ合いの末、' + a.name + 'は石を取り落とした。二人は、荒い息のまま睨み合った。', why: a.name + 'は' + b.name + '（' + FD.label(S, a, b) + '）を殺そうとしたが、返り討ちにされかけた', mag: 34 });
    return true;
  }

  /* ---------- 愛憎の二人：相手が危ないときは、身を挺して守る ---------- */
  var shield0 = JS.REL.shield;
  JS.REL.shield = function (S, p, live, t0) {
    var rng = S.rng, g = live.filter(function (q) { return q !== p && JS.alive(q) && !q.bound && FD.lhFrom(S, q, p); })[0];
    if (!g || rng() > 0.75) return shield0.apply(this, arguments);
    var t = t0 + g.name + 'が、' + p.name + 'と襲ってきた者のあいだに割って入った。' + TL.line(g, 'LH_GUARD', p);
    edge(S, g, p, '守った', 'obsess');
    if (rng() < 0.55 + JS.skill(g, 'fight') * 0.3 + g.stats.stamina * 0.04) {
      g.m.hp = clamp(g.m.hp - 20, 0, 100);
      ST.key(S, ST.say(S, { actors: [g, p], tag: '愛憎', kind: 'climax', text: t + g.name + 'は、相手が逃げ出すまで、殴る手を止めなかった。振り返った' + g.name + 'は、' + p.name + 'の無事を確かめると、舌打ちをしてそっぽを向いた。', why: '愛憎（' + FD.label(S, g, p) + '）。憎んでいても、誰かに奪われるのは許せない――撃退した', mag: 36 }), g.name + 'が' + p.name + 'を守った');
      return true;
    }
    ST.say(S, { actors: [g, p], tag: '愛憎', kind: 'climax', text: t, why: '愛憎（' + FD.label(S, g, p) + '）。身を挺して守った', mag: 36 });
    JS.core.die(S, g, p.name + 'を守って', ['{a}は、' + p.name + 'の前に立ちはだかったまま倒れた。最後に{a}が見ていたのは、' + p.name + 'の顔だった。']);
    return true;
  };
})();
