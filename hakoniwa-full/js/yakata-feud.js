/* 箱庭シミュレーター: 吹雪の館の殺人 ― 探偵どうしの関係と、憎しみ・愛憎（feud-kit.js の部品を使う）
   ・探偵の役割は「名探偵」（ポンコツ探偵はそのまま）
   ・名探偵とポンコツ探偵の顔合わせは、二人の関係で変わる（先輩後輩の向き・ライバル・恋人・親しい・初対面）。名探偵が二人のときも
   ・ライバル・敵対の探偵は、手がかりを奪い合う。敵対している名探偵どうしは、ぶつかり合うこともある
   ・憎しみだけの相手は、殺人騒ぎに紛れて、吹雪の中へ締め出したり、手にかけたりする（事件とは別の、便乗の殺人）
   ・愛憎の二人は、揉めると無理やり唇や体を奪うこともあるが、それ以上に、犯人に狙われた相手を身を挺して守る
   台詞は tone-lines.js（口調ごとの書き下ろし） */
(function () {
  'use strict';
  var HK = window.HK, ST = HK.Story, Y = HK.YAKATA, FD = HK.Feud, clamp = HK.clamp;
  if (!ST || !Y || !FD || !Y.gain) return;
  var TL = HK.TL;
  function alive(p) { return p.alive && !p.gone; }
  function free(S) { return S.P.filter(function (p) { return alive(p) && !p.bound; }); }
  function pk(S, l) { return ST.pick(S, l); }
  function rel(S, a, b, lab, cls) { if (Y.setRel) Y.setRel(S, a, b, cls === 'enemy' ? -0.1 : 0.05, lab, a); }
  function pairs(live, test) {
    var out = [];
    live.forEach(function (a) { live.forEach(function (b) { if (a !== b && test(a, b)) out.push([a, b]); }); });
    return out;
  }

  Y.FEUD = {
    /* 顔合わせ */
    arrive: function (S) {
      var sls = S.P.filter(function (p) { return p.isDet && p.role === 'detective'; }), pks = S.P.filter(function (p) { return p.isDet && p.role === 'ponkotsu'; }), done = {};
      pks.forEach(function (p) {
        var sl = sls.slice().sort(function (a, b) { return FD.ties(S, b, p).length - FD.ties(S, a, p).length; })[0];
        if (!sl) return;
        done[sl.i + '-' + p.i] = 1;
        ST.say(S, { actors: [sl, p], tag: '名探偵とポンコツ探偵', text: FD.duoText(S, sl, p).text, why: sl.name + '（名探偵）と' + p.name + '（ポンコツ探偵）の関係：' + FD.label(S, sl, p), mag: 12 });
      });
      sls.forEach(function (a) {
        sls.forEach(function (b) {
          if (a.i >= b.i || done[a.i + '-' + b.i] || !FD.ties(S, a, b).length) return;
          ST.say(S, { actors: [a, b], tag: '名探偵どうし', text: FD.duoText(S, a, b).text, why: '名探偵が二人。関係：' + FD.label(S, a, b), mag: 12 });
        });
      });
    },
    /* 昼・夕方ごと */
    tick: function (S, day) {
      var live = free(S);
      if (live.length < 2) return;
      obTick(S, live) || hkTick(S, live) || snatch(S, live) || detFight(S, live) || lhClash(S, live, day) || hateMove(S, live, day);
    },
    /* 犯人 c に狙われた tgt を、愛憎の相手が守る。守ったら true */
    guard: function (S, tgt, c) {
      var rng = S.rng, g = free(S).filter(function (q) { return q !== tgt && q !== c && FD.lovehate(S, q, tgt); })[0];
      if (!g || rng() > 0.6) return false;
      var t = '深夜、' + tgt.name + 'の部屋に何者かが忍び込んだ。――廊下で張っていた' + g.name + 'が、その影に飛びかかった。' + TL.line(g, 'LH_GUARD', tgt);
      rel(S, g, tgt, '守った', 'obsess');
      c.m.sus = clamp(c.m.sus + 20, 0, 100);
      if (rng() < HK.Dark.live(S, 0.6 + Y.skill(g, 'fight') * 0.3, 'kill')) {
        var hint = Y.gain(S, g, 'obs');
        ST.key(S, ST.say(S, { actors: [g, tgt], tag: '愛憎', kind: 'climax', text: t + '揉み合いの末、影は窓から吹雪の中へ逃げていった。' + g.name + 'は、' + tgt.name + 'の無事を確かめると、何も言わずに部屋を出ていった。' + (hint ? '――' + hint + '。' : ''), why: '愛憎（' + FD.label(S, g, tgt) + '）。憎んでいても、誰かに奪われるのは許せない――犯行を防いだ（犯人への疑い +20）', mag: 36 }), g.name + 'が' + tgt.name + 'を守った');
        return true;
      }
      g.alive = false; g.fate = tgt.name + 'を守って殺された（' + S.curDay + '日目の夜）';
      ST.key(S, ST.say(S, { actors: [g, tgt], tag: '愛憎', kind: 'climax', text: t + '刃は、' + g.name + 'の胸に深々と刺さった。影は逃げ、' + g.name + 'は' + tgt.name + 'の部屋の前に崩れ落ちた。最後まで、' + tgt.name + 'の名前は呼ばなかった。', why: '愛憎（' + FD.label(S, g, tgt) + '）。身代わりになった', mag: 44 }), g.name + 'が' + tgt.name + 'の身代わりに');
      return true;
    }
  };

  /* 執着（ヤンデレ。obsess-story.js） */
  function obTick(S, live) {
    var r = HK.Obsess && HK.Obsess.storyTick ? HK.Obsess.storyTick(S, live, { rate: 0.2 }) : null;
    if (!r) return false;
    ST.say(S, { actors: r.actors, tag: r.tag, kind: r.kind, text: r.text, why: r.why, mag: r.mag });
    rel(S, r.actors[0], r.actors[1], r.tag, 'obsess');
    return true;
  }
  /* 敵視の出来事（出会ったとき・嫌がらせ・無視・噛み合わない関係・衝突。hate-kit.js） */
  function hkTick(S, live) {
    if (!HK.HateKit) return false;
    var r = HK.HateKit.storyTick(S, live, { rate: 0.22 });
    if (!r) return false;
    ST.say(S, { actors: r.actors, tag: r.cat === 'romance' ? '片恋と嫌悪' : '敵視', text: r.text, why: r.why, mag: r.mag });
    rel(S, r.actors[0], r.actors[1], '敵視', 'enemy');
    return true;
  }
  /* 手がかりの奪い合い */
  function snatch(S, live) {
    var rng = S.rng, ps = pairs(live, function (a, b) { return (a.isDet || b.isDet) && FD.rival(S, a, b); });
    if (!ps.length || rng() > 0.18) return false;
    var pr = rng.pick(ps), a = pr[0], b = pr[1];
    var t = b.name + 'が暖炉の灰をかき分けて何かをつまみ上げた瞬間、' + a.name + 'がその手から、それをかすめ取った。' + TL.line(a, 'CLUE_SNATCH', b);
    rel(S, a, b, '出し抜いた', 'enemy');
    if (rng() < 0.25) {
      ST.say(S, { actors: [a, b], tag: '奪い合い', text: t + b.name + 'は黙って、それを取り返そうと手を伸ばした。奪い合ううちに、それは暖炉の火の中へ落ちた。燃え残りから読み取れることは、もう何もなかった。', why: a.name + 'と' + b.name + '（' + FD.label(S, a, b) + '）の手がかりの奪い合い――台無しになった', mag: 22 });
      return true;
    }
    var g = Y.gain(S, a, 'search');
    t += TL.line(b, 'CLUE_SNATCH_BACK', a);
    ST.say(S, { actors: [a, b], tag: '奪い合い', text: t + (g ? '――' + g + '。' : ''), why: a.name + 'と' + b.name + '（' + FD.label(S, a, b) + '）は張り合って、手がかりを奪い合う' + (g ? '（手がかり +1）' : ''), mag: 20 });
    return true;
  }
  /* 敵対している名探偵どうしの衝突 */
  function detFight(S, live) {
    var rng = S.rng, ps = pairs(live, function (a, b) { return a.role === 'detective' && b.role === 'detective' && a.i < b.i && (FD.level(S, a, b) >= 65 || FD.level(S, b, a) >= 65 || (FD.level(S, a, b) >= 35 && FD.level(S, b, a) >= 35)) && !FD.lovehate(S, a, b); });
    if (!ps.length || rng() > 0.15 || S.detFought) return false;
    S.detFought = true;
    var a = ps[0][0].tr.aggr >= ps[0][1].tr.aggr ? ps[0][0] : ps[0][1], b = a === ps[0][0] ? ps[0][1] : ps[0][0];
    a.m.sus = clamp(a.m.sus + 10, 0, 100); b.m.sus = clamp(b.m.sus + 10, 0, 100);
    rel(S, a, b, '衝突', 'enemy');
    ST.say(S, { actors: [a, b], tag: '名探偵どうし', kind: 'climax', text: '食堂での推理の披露は、二人の名探偵の怒鳴り合いになった。' + TL.line(a, 'DET_FIGHT', b) + a.name + 'は' + b.name + 'の胸ぐらを掴んだ。テーブルの皿が床に落ちて割れた。――一行は、どちらの推理を信じればいいのか、分からなくなった。', why: '敵対している名探偵どうし。推理の主導権をめぐってぶつかった（二人への疑い +10）', mag: 30 });
    return true;
  }
  /* 愛憎の二人が揉める */
  function lhClash(S, live, day) {
    var rng = S.rng, ps = pairs(live, function (a, b) { return FD.lovehate(S, a, b) && a.lhDay !== day; });
    if (!ps.length || rng() > 0.2) return false;
    var pr = rng.pick(ps), a = pr[0].tr.aggr + pr[0].tr.cp >= pr[1].tr.aggr + pr[1].tr.cp ? pr[0] : pr[1], b = a === pr[0] ? pr[1] : pr[0];
    a.lhDay = b.lhDay = day;
    var r = FD.clash(S, a, b, function (l) { return pk(S, l); });
    b.m.fear = clamp(b.m.fear + 6, 0, 100);
    if (r.r18) { a.cnt.r18 = (a.cnt.r18 || 0) + 1; b.cnt.r18 = (b.cnt.r18 || 0) + 1; }
    rel(S, a, b, r.r18 ? '無理やり抱いた' : '唇を奪った', 'obsess');
    ST.say(S, { actors: [a, b], tag: '愛憎', kind: r.r18 ? 'climax' : 'event', text: r.text, why: '愛憎（' + FD.label(S, a, b) + '）。憎しみと執着が、同じだけ育っている', mag: r.r18 ? 30 : 24 });
    return true;
  }
  /* 憎しみだけの相手：殺人騒ぎに紛れて、締め出す・手にかける */
  function hateMove(S, live, day) {
    /* 締め出し・手にかけるのは、敵対の強さの嫌悪（不仲なら、嫌がらせや口論にとどまる） */
    var rng = S.rng, ps = pairs(live, function (a, b) { return FD.hateStrong(S, a, b) && !a.hateDone; });
    if (!ps.length || !S.kills.length) return false;
    var pr = rng.pick(ps), a = pr[0], b = pr[1];
    if (rng() > (0.05 + a.tr.aggr * 0.06 + a.tr.cold * 0.05 + a.m.fear / 1500) * HK.Dark.f(S, 'grudge')) return false;
    a.hateDone = true;
    rel(S, a, b, '憎んでいる', 'enemy');
    var lock = rng() < 0.5;
    var t = lock ? b.name + 'が裏口から薪を取りに出たとき、' + a.name + 'が、その扉に内側から閂をかけた。' + TL.line(a, 'HATE_KILL', b) + '扉の向こうで、' + b.name + 'が何度も扉を叩いた。'
      : '殺人騒ぎで皆が食堂に集まっているあいだに、' + a.name + 'は' + b.name + 'を、誰もいない書斎へ呼び出した。' + TL.line(a, 'HATE_KILL', b);
    var win = lock ? 0.5 - (b.stats.nerve || 3) * 0.03 + a.tr.cold * 0.15 : 0.45 + a.tr.aggr * 0.2 - Y.skill(b, 'fight') * 0.3;
    if (rng() < win) {
      b.alive = false; b.fate = lock ? '吹雪の中に締め出されて凍死した（' + day + '日目）' : a.name + 'に殺された（' + day + '日目・事件とは別の殺人）';
      a.m.sus = clamp(a.m.sus + 22, 0, 100);
      S.extraKills = (S.extraKills || []).concat([{ a: a, b: b }]);
      ST.key(S, ST.say(S, { actors: [a, b], tag: '便乗殺人', kind: 'climax', text: t + (lock ? 'やがて、その音は止んだ。翌朝、扉の外の雪の中で、' + b.name + 'は膝を抱えたまま凍りついていた。' + a.name + 'は、閂を外したのは自分だと名乗り出た。' : a.name + 'は、暖炉の火掻き棒を振り下ろした。――' + a.name + 'は、それを「館の殺人鬼の仕業」に見せかけようとした。'), why: a.name + 'は' + b.name + '（' + FD.label(S, a, b) + '）を憎んでいた。殺人騒ぎに紛れて手にかけた（事件の犯人とは別。' + a.name + 'への疑い +22）', mag: 44 }), a.name + 'が' + b.name + 'を手にかけた');
      return true;
    }
    b.m.fear = clamp(b.m.fear + 15, 0, 100); a.m.sus = clamp(a.m.sus + 12, 0, 100);
    if (HK.HateKit) { HK.HateKit.shift(S, b, a, 30); HK.HateKit.shift(S, a, b, 6); }
    ST.say(S, { actors: [a, b], tag: '殺意', kind: 'climax', text: t + (lock ? 'しばらくして、物音に気づいた執事が閂を外した。雪まみれの' + b.name + 'は、震えながら' + a.name + 'を睨みつけた。' : a.name + 'が振り上げた火掻き棒を、' + b.name + 'は椅子で受け止めた。物音に、一行が駆けつけてきた。'), why: a.name + 'は' + b.name + '（' + FD.label(S, a, b) + '）を殺そうとしたが、失敗した（' + a.name + 'への疑い +12）', mag: 34 });
    return true;
  }
})();
