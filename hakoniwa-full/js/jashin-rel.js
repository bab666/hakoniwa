/* 箱庭シミュレーター: 邪神村RTA ― 住人どうしの関係・記憶喪失・名探偵とポンコツ探偵
   ・関係（恋人・家族・親友・敵対など）で、かばう・見捨てる・助けに行く・身代わりになる・後を追う…が変わる
   ・一定の確率で、記憶を失ったまま参加する人がいる。記憶が戻ると、本当の理由が分かる（村の出身・前の祭りの生き残り・仲間を誘い込んだ手先…）
   ・名探偵は、仲間の死や村の殺人事件を推理で解く。ポンコツ探偵は、的外れな推理で邪魔をする（たまに当たる） */
(function () {
  'use strict';
  var HK = window.HK, ST = HK.Story, JS = HK.JASHIN, clamp = HK.clamp, T = JS && JS.RELT;
  if (!ST || !JS || !T) return;

  var LOVE = 'lover,mate,fated,almost,fwb', FAMILY = 'sibling,sibprot,sibclose,sibbad,parent,pparent,relative', CLOSE = 'best,buddy,childhood,friend,mentor,master,teacher,senpai,colleague,classmate,boss,benefactor,worship,fond,blind', BAD = 'enemy,rival,bad';
  var W = { lover: 1, mate: 1, fated: 1, almost: 0.8, fwb: 0.45, sibling: 0.8, sibprot: 0.95, sibclose: 0.9, parent: 0.95, pparent: 0.9, best: 0.75, buddy: 0.8, childhood: 0.7, friend: 0.5, mentor: 0.6, master: 0.6, teacher: 0.5, senpai: 0.4, colleague: 0.3, classmate: 0.4, boss: 0.45, benefactor: 0.6, relative: 0.6, worship: 0.85, fond: 0.55, blind: 0.75, acq: 0.1, ex: 0.3, rival: -0.3, enemy: -0.7 , sibbad: -0.15, bad: -0.4 };
  function inList(t, l) { return l.split(',').indexOf(t) >= 0; }
  function tiesOf(S, a, b) { return (S.ties || []).filter(function (t) { return (t.a === a.i && t.b === b.i) || (t.a === b.i && t.b === a.i); }); }
  /* a から b への近さ（-1〜1）。片想いは想う側からだけ強い */
  function bond(S, a, b) {
    var best = 0, neg = 0;
    tiesOf(S, a, b).forEach(function (t) {
      var w = t.type === 'crush' ? (t.a === a.i ? 0.85 : 0.15) : W[t.type] != null ? W[t.type] : 0.1;
      /* 一方的な敵視：相手の側は、相手の気持ちで（なんとも思っていない・ふつう・友人・愛している） */
      if ((t.type === 'enemy' || t.type === 'bad') && t.cold && t.a !== a.i) w = { none: 0, normal: 0.1, friend: 0.5, love: 0.9 }[t.cold] || 0;
      if (t.type === 'master' && t.b === a.i) w = 0.85; /* 従は主を守る */
      if (t.type === 'parent' || t.type === 'pparent' || t.type === 'sibprot') w = t.a === a.i ? w : w - 0.15;
      if (w > best) best = w; if (w < neg) neg = w;
    });
    var base = best > 0 ? best + neg * 0.3 : neg;
    var k = a.i < b.i ? a.i + '-' + b.i : b.i + '-' + a.i;
    return Math.max(-1, Math.min(1.2, base + ((S.relD && S.relD[k]) || 0)));
  }
  /* 関係の分類（文の選び分け用） */
  function cat(S, a, b) {
    var l = tiesOf(S, a, b).map(function (t) { return t; }), c = '';
    l.forEach(function (t) {
      if ((t.type === 'enemy' || t.type === 'bad') && t.cold && t.a !== a.i) { var bk = { love: 'love', friend: 'close' }[t.cold] || ''; if (['love', 'family', 'crush', 'close', 'ex', 'bad', ''].indexOf(bk) < ['love', 'family', 'crush', 'close', 'ex', 'bad', ''].indexOf(c || '')) c = bk; return; }
      var k = inList(t.type, LOVE) ? 'love' : inList(t.type, FAMILY) ? 'family' : t.type === 'crush' ? (t.a === a.i ? 'crush' : '') : t.type === 'ex' ? 'ex' : inList(t.type, BAD) ? 'bad' : inList(t.type, CLOSE) ? 'close' : '';
      var order = ['love', 'family', 'crush', 'close', 'ex', 'bad', ''];
      if (order.indexOf(k) < order.indexOf(c || '')) c = k;
    });
    return c;
  }
  /* 両片想い：どちらからも片想い（向きを逆にした crush が二本）。both は恋人になったあとも true、mutual は恋人になる前だけ */
  function both(S, a, b) { var ts = tiesOf(S, a, b); return ts.some(function (t) { return t.type === 'crush' && t.a === a.i; }) && ts.some(function (t) { return t.type === 'crush' && t.a === b.i; }); }
  function mutual(S, a, b) { return both(S, a, b) && !tiesOf(S, a, b).some(function (t) { return inList(t.type, 'lover,mate,fated'); }); }
  function ED(S, a, b, lab, cls, from) { if (JS.DRAMA) JS.DRAMA.edge(S, a, b, lab, cls, from); }
  function A(S) { return S.P.filter(function (p) { return JS.alive(p) && !p.bound; }); }
  function pickT(S, pool, v) { return ST.fmt(ST.pick(S, pool), v); }

  /* ---------- 準備 ---------- */
  function setup(S, input) {
    var rng = S.rng, n = S.P.length;
    /* 恋愛・R18にしない組（HK.ngPair）には、恋愛の関係（恋人・セフレ・片想いなど）を当てない（ties.js と同じ） */
    S.ties = (input.ties || []).filter(function (t) { return t.a !== t.b && t.a < n && t.b < n && t.a >= 0 && t.b >= 0 && !(HK.ngPair(S.P[t.a], S.P[t.b]) && /^(lover|fwb|mate|fated|crush|almost|ex|yan)$/.test(t.type)); });
    S.cases = []; S.relCnt = 0;
    var rate = (S.env.amnesia == null ? 8 : S.env.amnesia) / 100;
    S.P.forEach(function (p) {
      if (rng() >= rate) return;
      var partner = S.P.filter(function (q) { return q !== p && bond(S, q, p) >= 0.5; })[0];
      var ws = [['normal', 0.4], ['villager', 0.18], ['survivor', 0.15], ['lure', n >= 2 ? 0.12 : 0], ['ghost', 0.07], ['tie', partner ? 0.3 : 0]];
      var truth = HK.weighted(rng, ws, function (w) { return w[1]; })[0];
      p.amn = { truth: truth, real: p.reason, asked: 0, back: false, partner: partner };
    });
  }
  function arrive(S) {
    var rng = S.rng, done = {}, k = 0;
    S.P.forEach(function (p) {
      if (p.job === 'sleuth') ST.say(S, { actors: [p], tag: '名探偵', text: pickT(S, T.SLEUTH_START, { a: p.name }), why: p.name + 'は名探偵。仲間の死や村の殺人事件を推理で解き、儀式のたくらみも見抜きやすい', mag: 12 });
      if (p.job === 'ponkotsu') {
        var sl = S.P.filter(function (q) { return q.job === 'sleuth' || q.job === 'detective'; })[0];
        ST.say(S, { actors: sl ? [p, sl] : [p], tag: 'ポンコツ探偵', text: pickT(S, T.PONK_START, { a: p.name }) + (sl ? pickT(S, T.PONK_BANTER, { a: p.name, b: sl.name }) : ''), why: p.name + 'はポンコツ探偵。的外れな推理で仲間を疑ったり、証拠を台無しにしたりする（たまに当たる）', mag: 12 });
      }
    });
    /* 関係の紹介（三組まで） */
    S.P.forEach(function (a) {
      S.P.forEach(function (b) {
        if (a.i >= b.i || k >= 3) return;
        var c = cat(S, a, b); if (!c || done[a.i + '-' + b.i]) return;
        var x = a, y = b;
        if (c === 'crush') { var t = tiesOf(S, a, b).filter(function (q) { return q.type === 'crush'; })[0]; if (t && t.a === b.i) { x = b; y = a; } }
        if (a.amn || b.amn) return;
        done[a.i + '-' + b.i] = 1; k++;
        if (c === 'crush' && mutual(S, a, b)) return ST.sayB(S, { actors: [x, y], tag: '関係', text: pickT(S, T.INTRO.mutual, { a: x.name, b: y.name }), why: '関係：' + relLabel(S, a, b) + '（お互いに想っているのに、どちらも自分の片想いだと思っている）' }, x.name + 'と' + y.name);
        ST.sayB(S, { actors: [x, y], tag: '関係', text: pickT(S, T.INTRO[c], { a: x.name, b: y.name }), why: '関係：' + tiesOf(S, a, b).map(function (t) { return HK.Sib && HK.Sib.isSibTie(t) && HK.tieLabel ? HK.tieLabel(t) : HK.TIES[t.type] ? HK.TIES[t.type].label : t.type; }).join('・') }, x.name + 'と' + y.name);
      });
    });
  }
  function amnArrive(S, p) {
    ST.say(S, { actors: [p], tag: '記憶喪失', text: pickT(S, T.AMN_START, { a: p.name }) + '最初は「' + p.action.label + '」、目標は「' + p.goal.label + '」。', why: p.name + '（' + JS.core.jobOf(p).label + '）は記憶を失っている。本当の理由は、記憶が戻ったときに分かる（知識の手がかりに弱く、霊感は鋭い）', mag: 16 });
  }

  /* ---------- 毎時の動き ---------- */
  function tick(S, live, h) {
    var rng = S.rng, night = JS.night(h);
    /* 誤解で縛られていた人の解放 */
    S.P.forEach(function (p) {
      if (p.bound && p.boundUntil != null && h >= p.boundUntil && JS.alive(p)) {
        p.bound = false; p.boundUntil = null;
        ST.sayB(S, { actors: [p], tag: '誤解', text: p.name + 'の縄が解かれた。疑いは、結局ただの思い込みだった。' + p.name + 'は、しばらく誰とも口をきかなかった。', why: '誤解が解けた' }, p.name + 'が解放された');
      }
    });
    live = A(S);
    amnTick(S, live, h);
    /* 夜に寄り添う */
    if (night && rng() < 0.18) {
      var pairs = [];
      live.forEach(function (a) { live.forEach(function (b) { if (a.i < b.i) { var c = cat(S, a, b); if (c === 'love' || c === 'family' || c === 'close') pairs.push([a, b, c]); else if (c === 'crush' && mutual(S, a, b)) pairs.push([a, b, 'mutual']); } }); });
      if (pairs.length) {
        var pr = rng.pick(pairs), x = rng() < 0.5 ? pr[0] : pr[1], y = x === pr[0] ? pr[1] : pr[0];
        x.m.fear = clamp(x.m.fear - 6, 0, 100); y.m.fear = clamp(y.m.fear - 10, 0, 100);
        ST.sayB(S, { actors: [x, y], tag: '寄り添う', text: pickT(S, T.COMFORT[pr[2]], { a: x.name, b: y.name }), why: pr[2] === 'mutual' ? '両片想いの二人は、寄り添うと恐怖が和らぐ（どちらも、相手は自分を何とも思っていないと思い込んでいる）' : '関係のある二人は、寄り添うと恐怖が和らぐ' }, x.name + 'と' + y.name + 'が寄り添った');
      }
    }
    /* 張り合う・ぶつかる */
    if (rng() < 0.1) {
      var bads = [];
      live.forEach(function (a) { live.forEach(function (b) { if (a.i < b.i && cat(S, a, b) === 'bad') bads.push([a, b]); }); });
      if (bads.length) {
        var bp = rng.pick(bads), rival = tiesOf(S, bp[0], bp[1]).some(function (t) { return t.type === 'rival'; });
        if (rival && rng() < 0.5) { bp[0].rivalBoost = bp[1].rivalBoost = 2; ST.sayB(S, { actors: bp, tag: '張り合い', text: pickT(S, T.RIVAL, { a: bp[0].name, b: bp[1].name }), why: 'ライバルどうしは張り合って、手がかりを見つけやすくなる' }, bp[0].name + 'と' + bp[1].name + 'が張り合った'); }
        else if (S.relMade !== bp[0].i + '-' + bp[1].i && (S.found.length >= 3 || rng() < 0.25)) { S.relMade = bp[0].i + '-' + bp[1].i; ST.sayB(S, { actors: bp, tag: '休戦', text: pickT(S, T.MAKEUP, { a: bp[0].name, b: bp[1].name }), why: '命がかかって、一時休戦した' }, bp[0].name + 'と' + bp[1].name + 'が休戦'); }
        else { bp.forEach(function (p) { p.m.fear = clamp(p.m.fear + 4, 0, 100); }); S.hostile = clamp(S.hostile + 3, 0, 100); ST.sayB(S, { actors: bp, tag: '口論', text: pickT(S, T.QUARREL, { a: bp[0].name, b: bp[1].name }), why: '仲の悪い二人がぶつかった（村人に隙を見せる）' }, bp[0].name + 'と' + bp[1].name + 'が口論'); }
      }
    }
    /* 連れ去られた大事な人を助けに行く */
    S.P.forEach(function (v) {
      if (!v.alive || !v.taken) return;
      var rs = live.filter(function (q) { return q !== v && bond(S, q, v) >= 0.7; }).sort(function (a, b) { return bond(S, b, v) - bond(S, a, v); });
      var r = rs[0];
      if (!r || rng() > (night ? 0.3 : 0.12)) return;
      var sk = JS.skill(r, 'fight') * 0.5 + JS.skill(r, 'explore') * 0.4 + r.stats.luck * 0.03;
      var t = pickT(S, T.RESCUE, { a: v.name, b: r.name }), roll = rng();
      if (roll < sk) { ED(S, r, v, '救出', 'guard', r); v.taken = false; v.takenAt = null; r.m.hp = clamp(r.m.hp - 10, 0, 100); var o = ST.say(S, { actors: [r, v], tag: '救出', kind: 'climax', text: t + pickT(S, T.RESCUE_OK, { a: v.name, b: r.name }), why: r.name + 'は' + v.name + 'を助けに行った（関係：' + relLabel(S, r, v) + '／腕っぷし・探索・運）', mag: 34 }); ST.key(S, o, r.name + 'が' + v.name + 'を救出'); return; }
      if (roll > 0.85) { r.taken = true; r.takenAt = h; ST.say(S, { actors: [r, v], tag: '救出', kind: 'climax', text: t + ST.fmt(T.RESCUE_FAIL[0], { a: v.name, b: r.name }), why: r.name + 'も捕まった', mag: 32 }); return; }
      r.m.fear = clamp(r.m.fear + 10, 0, 100);
      ST.sayB(S, { actors: [r, v], tag: '救出', text: t + '――' + r.name + 'は見張りに見つかり、命からがら逃げ帰った。' + v.name + 'を助けることはできなかった。', why: '救出に失敗' }, r.name + 'の救出は失敗');
    });
    caseTick(S, A(S), h);
    villageMurder(S, A(S), h);
    ponkTick(S, A(S), h);
    live.forEach(function (p) { if (p.rivalBoost) p.rivalBoost--; });
    if (JS.DRAMA) JS.DRAMA.tick(S, A(S), h);
  }
  function relLabel(S, a, b) {
    var bo = both(S, a, b), l = tiesOf(S, a, b).filter(function (t) { return !(bo && t.type === 'crush'); }).map(function (t) { return HK.Sib && HK.Sib.isSibTie(t) && HK.tieLabel ? HK.tieLabel(t) : HK.TIES[t.type] ? HK.TIES[t.type].label : t.type; });
    if (bo) l.unshift('両片想い');
    /* 同じ関係が二度足されていても（恋人になる出来事が重なったときなど）、一度だけ書く */
    l = l.filter(function (x, i) { return l.indexOf(x) === i; });
    return l.join('・') || 'なし';
  }

  /* ---------- 記憶喪失 ---------- */
  function amnTick(S, live, h) {
    var rng = S.rng;
    live.forEach(function (p) {
      var a = p.amn; if (!a || a.back) return;
      var pt = a.partner && JS.alive(a.partner) && !a.partner.bound ? a.partner : null;
      if (pt && rng() < 0.12) { a.asked++; ST.sayB(S, { actors: [pt, p], tag: '記憶', text: pickT(S, T.AMN_ASK, { a: p.name, b: pt.name }), why: pt.name + '（' + relLabel(S, pt, p) + '）が記憶を呼び戻そうとした' }, pt.name + 'が' + p.name + 'に話しかけた'); }
      if ((a.truth === 'villager' || a.truth === 'ghost') && !a.called && rng() < 0.1) { a.called = true; ST.sayB(S, { actors: [p], tag: '記憶', text: pickT(S, T.AMN_CALL, { a: p.name }), why: '村人は、' + p.name + 'を知っているらしい' }, '村人が' + p.name + 'に声をかけた'); }
      if (rng() < 0.035 + S.found.length * 0.015 + a.asked * 0.04 + p.m.fear / 1500) recover(S, p, h);
    });
  }
  function recover(S, p, h) {
    var rng = S.rng, a = p.amn; a.back = true; a.at = h;
    var b = a.partner || rng.pick(S.P.filter(function (q) { return q !== p; }).concat([p]));
    var t = pickT(S, T.AMN_BACK, { a: p.name }) + pickT(S, T.AMN_TRUTH[a.truth], { a: p.name, b: b.name, r: a.real, g: S.G.call });
    var why = p.name + 'の記憶が戻った。', clue = 0;
    if (a.truth === 'villager') { p.villager = true; why += 'この村の出身だった（村人と話しやすいが、生贄に選ばれやすい）'; if (rng() < 0.5) clue = 1; }
    if (a.truth === 'survivor') { p.m.fear = clamp(p.m.fear + 15, 0, 100); clue = 1; why += '前の祭りの生き残りだった（神の弱点を覚えていた）'; }
    if (a.truth === 'tie') { p.m.fear = clamp(p.m.fear - 10, 0, 100); if (JS.alive(b)) b.m.fear = clamp(b.m.fear - 10, 0, 100); why += b.name + 'との関係（' + relLabel(S, p, b) + '）を思い出した'; }
    if (a.truth === 'normal') why += '来た理由を思い出しただけだった';
    if (a.truth === 'lure') {
      var atone = p.tr.warmth * 0.5 + p.tr.cp * 0.3 + (a.partner ? 0.2 : 0) > 0.4 + rng() * 0.3;
      if (atone) { t += pickT(S, T.AMN_ATONE, { a: p.name }); clue = 1; p.goal = JS.GOALS.filter(function (g) { return g.id === 'protect'; })[0] || p.goal; why += '仲間を誘い込んだ手先だった。温かさ・CPが高く、償うことを選んだ'; }
      else {
        var vs = A(S).filter(function (q) { return q !== p && bond(S, p, q) < 0.5; });
        var v = vs.length ? rng.pick(vs) : null;
        p.traitor = true;
        t += pickT(S, T.AMN_BETRAY, { a: p.name, b: v ? v.name : '仲間の一人' });
        if (v) { v.taken = true; v.takenAt = h; ED(S, p, v, '裏切り', 'enemy', p); }
        why += '仲間を誘い込んだ手先だった。記憶が戻ると、村の側についた' + (v ? '（' + v.name + 'が連れ去られた）' : '');
      }
    }
    if (a.truth === 'ghost') clue = 2;
    var added = [];
    for (var i = 0; i < clue; i++) { var k = S.G.clues.map(function (c, j) { return j; }).filter(function (j) { return S.found.indexOf(j) < 0; })[0]; if (k != null) { S.found.push(k); p.cnt.clue++; added.push(S.G.clues[k].t); } }
    if (added.length) t += '――' + added.join('。') + '。';
    p.reason = a.real;
    var o = ST.say(S, { actors: JS.alive(b) && b !== p ? [p, b] : [p], tag: '記憶', kind: 'climax', text: t, why: why + (added.length ? '（手がかり +' + added.length + '）' : ''), mag: 38 });
    ST.key(S, o, p.name + 'の記憶が戻った');
    if (a.truth === 'ghost') {
      p.alive = false; p.fate = '霧の中に消えた（もとから死んでいた・' + JS.hm(h) + '）';
      ST.say(S, { actors: [p], tag: '記憶', kind: 'climax', text: pickT(S, T.AMN_GHOST_END, { a: p.name }), why: p.name + 'は、前の祭りの生贄だった', mag: 40 });
    }
  }

  /* ---------- 殺人事件と探偵 ---------- */
  function onDeath(S, p) {
    var rng = S.rng, live = A(S);
    /* 事件になる死（魔術師の仕業・村人に殺された） */
    var killer = S.killer; S.killer = null;
    if (killer) S.cases.push({ v: p, type: 'mage', killer: killer, h: S.h });
    else if (/村人に襲われて/.test(p.how || '')) S.cases.push({ v: p, type: 'village', h: S.h });
    /* 関係のある人の反応（二人まで） */
    var rel = live.filter(function (q) { return q !== p && cat(S, q, p); }).sort(function (a, b) { return Math.abs(bond(S, b, p)) - Math.abs(bond(S, a, p)); }).slice(0, 2);
    rel.forEach(function (q) {
      var c = cat(S, q, p), bd = bond(S, q, p);
      q.m.fear = clamp(q.m.fear + (c === 'love' ? 25 : c === 'family' ? 20 : c === 'bad' ? 4 : 12), 0, 100);
      /* 遺体の残らない死（穴・塵・闇に引きずり込まれた など）では、亡骸を抱く文の代わりに、名前を呼ぶ・遺品を抱く文（engine.js の HK.State.noBody） */
      var G0 = HK.State && HK.State.noBody(p) && T.GRIEF_NB ? T.GRIEF_NB : T.GRIEF;
      var t = pickT(S, (c === 'crush' && mutual(S, q, p) ? G0.mutual : G0[c]) || G0.close, { a: p.name, b: q.name }), why = q.name + 'と' + p.name + 'の関係：' + relLabel(S, q, p);
      /* 後を追う（仇討ち・絶望） */
      if (bd >= 0.75 && !S.inCave && /村人|何者か/.test(p.how || '') && rng() < q.tr.aggr * 0.5 + q.tr.impulse * 0.3) {
        t += pickT(S, T.REVENGE, { b: q.name });
        if (rng() < JS.skill(q, 'fight') + 0.15) { t += pickT(S, T.REVENGE_OK, { b: q.name }); S.hostile = clamp(S.hostile - 8, 0, 100); q.m.hp = clamp(q.m.hp - 20, 0, 100); ST.say(S, { actors: [q, p], tag: '仇討ち', kind: 'climax', text: t, why: why + '。攻撃性・衝動性が高く、仇を討ちに行った（腕っぷしで生還）', mag: 36 }); }
        else { ST.say(S, { actors: [q, p], tag: '仇討ち', kind: 'climax', text: t, why: why + '。仇を討ちに行ったが、帰らなかった', mag: 36 }); JS.core.die(S, q, p.name + 'の仇を討ちに行って', [pickT(S, T.REVENGE_DIE, { b: '{a}' })]); }
        return;
      }
      if (bd >= 0.75 && rng() < q.tr.ac * 0.3 + (1 - q.tr.cp) * 0.15) {
        q.despair = true; q.action = JS.ACTIONS.filter(function (x) { return x.id === 'alone'; })[0] || q.action;
        t += pickT(S, T.DESPAIR, { b: q.name }); why += '。絶望して、一人で動くようになった';
      }
      ST.say(S, { actors: [q, p], tag: '喪失', text: t, why: why, mag: c === 'love' || c === 'family' ? 30 : 16 });
    });
  }
  function caseTick(S, live, h) {
    var rng = S.rng;
    S.cases = S.cases.filter(function (c) {
      if (c.done) return false;
      if (c.type === 'mage' && (!c.killer.alive || c.killer.bound)) return false;
      /* 探偵役：名探偵→探偵→「事件を解決する」が目標の人 */
      var sl = live.filter(function (q) { return q.job === 'sleuth'; })[0] || live.filter(function (q) { return q.job === 'detective'; })[0] || live.filter(function (q) { return q.goal && q.goal.id === 'solve' && !q.bound; })[0];
      if (!sl || h - c.h < 2) return true;
      var ch = (sl.job === 'sleuth' ? 0.4 : 0.15) + JS.skill(sl, 'obs') * 0.3 + (sl.goal && sl.goal.id === 'solve' ? 0.15 : 0) + (c.prog || 0) * 0.08;
      if (rng() > ch) { if (!c.looked) { c.looked = 1; ST.sayB(S, { actors: [sl], tag: '捜査', text: pickT(S, (HK.State && HK.State.bodyless(T.SLEUTH_CASE, c.v)) || T.SLEUTH_CASE, { a: sl.name }), why: sl.name + 'が' + c.v.name + 'の死を調べている' }, sl.name + 'が現場を調べた'); } return true; }
      c.done = true;
      var vs = c.v.i != null ? c.v.name + 'さん' : c.v.name, t = pickT(S, T.SLEUTH_SOLVE, { a: sl.name, v: c.v.name, vs: vs });
      if (c.type === 'mage') {
        if (c.killer === sl) return false;
        if (c.kind === 'murder' && JS.GOALX) {
          ST.say(S, { actors: [sl, c.killer], tag: '推理', kind: 'climax', text: t + pickT(S, JS.GT.SLEUTH_MURDER, { a: sl.name, c: c.killer.name }), why: sl.name + 'が、' + c.v.name + '殺しの犯人（' + c.killer.name + '）を推理で突き止めた', mag: 42 });
          JS.GOALX.detect(S, c.killer, true, sl);
          return false;
        }
        ST.say(S, { actors: [sl, c.killer], tag: '推理', kind: 'climax', text: t + pickT(S, T.SLEUTH_MAGE, { a: sl.name, c: c.killer.name }), why: sl.name + '（' + JS.core.jobOf(sl).label + '）が、' + c.v.name + '殺しの犯人を推理で突き止めた', mag: 42 });
        JS.detectMage(S, c.killer, true, sl);
        return false;
      }
      var added = gainClue(S, sl);
      S.hostile = clamp(S.hostile - 10, 0, 100);
      var o = ST.say(S, { actors: [sl], tag: '推理', kind: 'climax', text: t + pickT(S, T.SLEUTH_VILLAGE, { a: sl.name, v: c.v.name, vs: vs }) + (added ? pickT(S, T.SLEUTH_GAIN, { a: sl.name }) + added + '。' : ''), why: sl.name + 'が' + c.v.name + 'の死の真相を暴いた（村人の敵意 -10' + (added ? '・手がかり +1' : '') + '）', mag: 40 });
      ST.key(S, o, sl.name + 'が事件を解決');
      return false;
    });
  }
  function gainClue(S, p) {
    var k = S.G.clues.map(function (c, j) { return j; }).filter(function (j) { return S.found.indexOf(j) < 0; })[0];
    if (k == null) return '';
    S.found.push(k); p.cnt.clue++;
    return S.G.clues[k].t;
  }
  /* 村で起きる殺人事件（一度だけ） */
  function villageMurder(S, live, h) {
    var rng = S.rng;
    if (S.vmurder || h < 6 || rng() > 0.05 + S.hostile / 2000) return;
    S.vmurder = true;
    S.hostile = clamp(S.hostile + 15, 0, 100);
    var c = { v: { name: '殺された村人' }, type: 'village', h: h };
    var o = ST.say(S, { kind: 'phase', tag: '殺人事件', text: ST.pick(S, T.MURDER), why: '村で殺人事件が起きた。よそ者が疑われ、村人の敵意が上がる（+15）。名探偵なら真相を暴ける', mag: 30 });
    ST.key(S, o, '村で殺人事件');
    S.cases.push(c); S.vcase = c;
  }
  /* ポンコツ探偵の迷推理 */
  function ponkTick(S, live, h) {
    var rng = S.rng;
    live.forEach(function (p) {
      if (p.job !== 'ponkotsu' || rng() > (S.cases.length ? 0.22 : 0.12)) return;
      var sl = live.filter(function (q) { return q !== p && (q.job === 'sleuth' || q.job === 'detective'); })[0];
      var others = live.filter(function (q) { return q !== p; });
      var r = rng(), o;
      if (r < 0.3 && others.length) {
        /* 的外れな犯人指名。仲の悪い相手ほど疑う */
        var c = HK.weighted(rng, others, function (q) { return 1 + (bond(S, p, q) < 0 ? 3 : 0) - (bond(S, p, q) > 0.6 ? 0.8 : 0); });
        var mage = S.cases.filter(function (x) { return x.type === 'mage'; })[0], hit = mage && mage.killer === c;
        var t = pickT(S, T.PONK_WRONG, { a: p.name, c: c.name });
        if (hit) { ST.say(S, { actors: [p, c], tag: '迷推理', kind: 'climax', text: t + '――理由はめちゃくちゃだった。けれど、犯人は本当に' + c.name + 'だった。', why: 'ポンコツ探偵の推理が、たまたま当たった', mag: 36 }); JS.detectMage(S, c, true, p); return; }
        if (sl && rng() < 0.7) return ST.sayB(S, { actors: [sl, p, c], tag: '迷推理', text: t + pickT(S, T.SLEUTH_TIDY, { a: sl.name, b: p.name, c: c.name }), why: sl.name + 'が迷推理を即座に否定した' }, sl.name + 'が' + p.name + 'の推理を否定');
        var avgA = others.reduce(function (s0, q) { return s0 + q.tr.a; }, 0) / others.length, fear = others.reduce(function (s0, q) { return s0 + q.m.fear; }, 0) / others.length;
        if (rng() < 0.15 + fear / 250 - avgA * 0.3 + (S.cases.length ? 0.15 : 0)) {
          c.bound = true; c.boundUntil = h + 6; c.boundAt = '土蔵';
          o = ST.say(S, { actors: [p, c], tag: '迷推理', kind: 'climax', text: t + pickT(S, T.PONK_WRONG_BELIEVE, { a: p.name, c: c.name }), why: '恐怖で判断が鈍っていた一行は、ポンコツ探偵を信じた（' + c.name + 'は6時間縛られる）', mag: 30 });
          return ST.key(S, o, c.name + 'が誤って縛られた');
        }
        return ST.sayB(S, { actors: [p, c], tag: '迷推理', text: t + pickT(S, T.PONK_WRONG_LAUGH, { a: p.name, c: c.name }), why: '誰も信じなかった' }, p.name + 'が' + c.name + 'を疑った');
      }
      if (r < 0.48 && S.found.length) {
        if (sl && rng() < 0.4) return ST.sayB(S, { actors: [sl, p], tag: '迷推理', text: pickT(S, T.PONK_RUIN, { a: p.name }) + pickT(S, T.SLEUTH_TIDY, { a: sl.name, b: p.name, c: p.name }).split('。').slice(-3).join('。'), why: sl.name + 'が荒らされた現場を立て直した' }, sl.name + 'が現場を立て直した');
        S.found.pop();
        return ST.say(S, { actors: [p], tag: '迷推理', text: pickT(S, T.PONK_RUIN, { a: p.name }), why: 'ポンコツ探偵が手がかりを台無しにした（手がかり -1）', mag: 18 });
      }
      if (r < 0.65) { S.hostile = clamp(S.hostile + 10, 0, 100); return ST.sayB(S, { actors: [p], tag: '迷推理', text: pickT(S, T.PONK_LOUD, { a: p.name }), why: '村人の前で騒いだ（村人の敵意 +10）' }, p.name + 'が騒いだ'); }
      if (r < 0.82) {
        var b = others.length ? rng.pick(others) : p;
        ST.sayB(S, { actors: [p, b], tag: '迷推理', text: pickT(S, T.PONK_TRAP, { a: p.name, b: b.name }), why: 'ポンコツ探偵が危ない場所に踏み込んだ' }, p.name + 'が暴走');
        return JS.core.trap(S, rng() < 0.6 ? p : b, live, false);
      }
      var g = gainClue(S, p);
      if (g) { var o2 = ST.say(S, { actors: [p], tag: '迷推理', text: pickT(S, T.PONK_LUCKY, { a: p.name, b: (others[0] || p).name }) + '――' + g + '。', why: 'ポンコツ探偵の迷推理が、たまたま当たった（手がかり +1）', mag: 22 }); ST.key(S, o2, p.name + 'の迷推理が当たった'); }
    });
  }

  /* ---------- 襲撃・罠・逃走での関係 ---------- */
  /* そばにいるか（大事な相手ほど、そばにいる） */
  function near(S, p, q) { var b = bond(S, q, p); return S.rng() < (b < 0 ? 0.25 : 0.45 + b * 0.45); }
  /* 身を挺してかばう。かばったら true */
  function shield(S, p, live, t0) {
    var rng = S.rng;
    var gs = live.filter(function (q) { return q !== p && JS.alive(q) && !q.bound && bond(S, q, p) >= 0.6; }).sort(function (a, b) { return bond(S, b, p) - bond(S, a, p); });
    var g = gs[0];
    if (!g || rng() > bond(S, g, p) * 0.55 + g.tr.warmth * 0.15 + (g.job === 'manager' ? 0.15 : 0)) {
      /* 見捨てる人も、その場にいる人だけ（名簿は区切りの初めに作ったものなので、脱出・連れ去り・縛られた人をここで外す） */
      var ab = live.filter(function (q) { return q !== p && JS.alive(q) && !q.bound && bond(S, q, p) < 0; })[0];
      if (ab && rng() < 0.3) ST.sayB(S, { actors: [ab, p], tag: '見捨てる', text: pickT(S, T.ABANDON, { a: p.name, b: ab.name }), why: ab.name + 'と' + p.name + 'の関係：' + relLabel(S, ab, p) + '（助けなかった）' }, ab.name + 'は' + p.name + 'を見捨てた');
      return false;
    }
    var t = t0 + pickT(S, T.SHIELD, { a: p.name, b: g.name }), why = g.name + 'が' + p.name + 'をかばった（関係：' + relLabel(S, g, p) + '）';
    if (rng() < JS.skill(g, 'fight') + g.stats.stamina * 0.06) {
      g.m.hp = clamp(g.m.hp - 20, 0, 100); p.m.fear = clamp(p.m.fear + 8, 0, 100);
      ED(S, g, p, 'かばった', 'guard', g);
    var o = ST.say(S, { actors: [g, p], tag: 'かばう', kind: 'climax', text: t + pickT(S, T.SHIELD_OK, { a: p.name, b: g.name }), why: why + '――撃退した', mag: 34 }); ST.key(S, o, g.name + 'が' + p.name + 'をかばった');
      return true;
    }
    ST.say(S, { actors: [g, p], tag: 'かばう', kind: 'climax', text: t, why: why, mag: 34 });
    ED(S, g, p, 'かばって死んだ', 'guard', g);
    JS.core.die(S, g, p.name + 'をかばって', [pickT(S, T.SHIELD_DIE, { a: p.name, b: '{a}' })]);
    return true;
  }
  /* 大事な人を置いて、一人では逃げられない */
  function stay(S, p) {
    var b = A(S).filter(function (q) { return q !== p && bond(S, p, q) >= 0.7; })[0] || S.P.filter(function (q) { return q !== p && q.alive && q.taken && bond(S, p, q) >= 0.7; })[0];
    if (!b || S.rng() > 0.55 + p.tr.warmth * 0.3) return false;
    /* 連れ去られたままの人は場にいないので、記録の登場人物にせず、専用の文にする */
    var tk = !!b.taken && T.STAY_TAKEN;
    ST.sayB(S, { actors: tk ? [p] : [p, b], tag: '残る', text: pickT(S, tk ? T.STAY_TAKEN : T.STAY, { a: p.name, b: b.name }), why: p.name + 'は' + b.name + '（' + relLabel(S, p, b) + '）を置いて逃げられなかった' }, p.name + 'は残った');
    return true;
  }
  /* 生贄の身代わり */
  function substitute(S, vic) {
    if (!vic) return vic;
    var rng = S.rng, cs = A(S).filter(function (q) { return q !== vic && bond(S, q, vic) >= 0.8; }).sort(function (a, b) { return bond(S, b, vic) - bond(S, a, vic); });
    var q = cs[0];
    if (!q || rng() > 0.2 + q.tr.warmth * 0.35 + (q.goal.id === 'protect' ? 0.15 : 0)) return vic;
    var o = ST.say(S, { actors: [q, vic], tag: '身代わり', kind: 'climax', text: pickT(S, T.SUBST, { a: vic.name, b: q.name }), why: q.name + 'が' + vic.name + '（' + relLabel(S, q, vic) + '）の身代わりになった（温かさ）', mag: 44 });
    ST.key(S, o, q.name + 'が身代わりに'); ED(S, q, vic, '身代わり', 'guard', q);
    /* 身代わりで解き放たれた人は、そのまま逃がす（連れ去られていた人が、あとの「逃走」の場面に出ないように） */
    if (vic.taken) { vic.out = true; vic.esc = S.h; vic.fate = '身代わりのおかげで逃げ延びた（' + JS.hm(S.h) + '）'; }
    vic.taken = false;
    return q;
  }
  /* 逃げるとき、逃げ遅れた大事な人のために引き返す */
  function goBack(S, failed, ok) {
    var rng = S.rng, saved = [];
    failed.forEach(function (p) {
      var b = ok.filter(function (q) { return bond(S, q, p) >= 0.75 && saved.indexOf(q) < 0; })[0];
      if (!b || rng() > 0.35 + b.tr.warmth * 0.3) return;
      var t = pickT(S, T.GOBACK, { a: p.name, b: b.name });
      if (rng() < 0.45 + b.stats.stamina * 0.04) { saved.push(p); ED(S, b, p, '引き返して救った', 'guard', b); ST.say(S, { actors: [b, p], tag: '引き返す', kind: 'climax', text: t + pickT(S, T.GOBACK_OK, { a: p.name, b: b.name }), why: b.name + 'が' + p.name + '（' + relLabel(S, b, p) + '）を助けに戻った――二人とも逃げ延びた', mag: 38 }); }
      else { b.goBackDie = true; ST.say(S, { actors: [b, p], tag: '引き返す', kind: 'climax', text: t + pickT(S, T.GOBACK_DIE, { a: p.name, b: b.name }), why: b.name + 'は' + p.name + 'を助けに戻り、帰らなかった', mag: 38 }); }
    });
    return saved;
  }
  /* 洞窟の前の告白 */
  function confess(S, live) {
    var rng = S.rng, done = 0;
    live.forEach(function (a) {
      live.forEach(function (b) {
        if (done || a === b) return;
        var ts = tiesOf(S, a, b);
        /* もう恋人（番）になっている二人は、告白しない */
        if (ts.some(function (t) { return t.type === 'lover' || t.type === 'mate' || t.type === 'fated'; })) return;
        /* 避けている人は自分から告白しない。友達以上・元恋人の二人は、片方だけが避けているなら避けていない側から（avoid-kit.js の HK.Avoid。2026-10-28） */
        var AV = HK.Avoid, ab = !!(AV && AV.of(S, a, b)), ba = !!(AV && AV.of(S, b, a));
        var ok = !ab && ts.some(function (t) { return (t.type === 'crush' && t.a === a.i) || ((t.type === 'almost' || t.type === 'ex') && (ba || a.i < b.i)); });
        if (!ok || rng() > 0.55) return;
        done = 1; a.m.fear = clamp(a.m.fear - 10, 0, 100); b.m.fear = clamp(b.m.fear - 6, 0, 100);
        /* 両片想いでも、複数の恋人「なし」でどちらかに別の恋人がいれば恋人にはならない（HK.Poly.storyCan） */
        if (mutual(S, a, b) && (!HK.Poly || HK.Poly.storyCan(S, a, b))) {
          b.m.fear = clamp(b.m.fear - 6, 0, 100);
          S.ties.push({ a: a.i, b: b.i, type: 'lover', born: true }); if (JS.DRAMA) JS.DRAMA.setRel(S, a, b, 0.2, '恋人');
          return ST.say(S, { actors: [a, b], tag: '告白', text: pickT(S, T.CONFESS_MUTUAL, { a: a.name, b: b.name }), why: '関係：両片想い。死を前にして想いを口にし、ようやく通じた（どちらも、自分の片想いだと思っていた）', mag: 32 });
        }
        ST.say(S, { actors: [a, b], tag: '告白', text: pickT(S, ts.some(function (t) { return t.type === 'ex'; }) && T.CONFESS_EX ? T.CONFESS_EX : T.CONFESS, { a: a.name, b: b.name }), why: '関係：' + relLabel(S, a, b) + '。死を前にして、想いを口にした', mag: 30 });
      });
    });
  }
  /* 魔術師をかばう（見つけたのが大事な人だった） */
  function cover(S, m, b) {
    if (bond(S, b, m) < 0.75 || S.rng() > 0.6) return false;
    ST.say(S, { actors: [b, m], tag: '隠蔽', text: pickT(S, T.COVER, { a: m.name, b: b.name }), why: b.name + 'は' + m.name + '（' + relLabel(S, b, m) + '）のたくらみに気づいたが、黙っていた', mag: 26 });
    return true;
  }
  /* 魔術師が生贄に選ばない相手（大事な人） */
  function spare(S, m, v) { return bond(S, m, v) >= 0.6; }

  JS.REL = { setup: setup, arrive: arrive, amnArrive: amnArrive, tick: tick, onDeath: onDeath, near: near, shield: shield, stay: stay, substitute: substitute, goBack: goBack, confess: confess, cover: cover, spare: spare, bond: bond, cat: cat, mutual: mutual };
})();
