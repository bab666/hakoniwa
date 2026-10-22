/* 箱庭シミュレーター: 邪神村RTA ― 村のユニークなNPC・殺人バトル・隠し神の双子
   ・ユニークなNPC（権蔵じいさん・おかっぱの子・トメ婆・ツヅミとツバキ・宮司の白峰・女将のサチ・墓守の与作）から3〜4人が登場。
     話しかける／手がかりをくれる／罠から救う／死を予言する／子どもが参加者を連れ去る／墓穴を数える／傷を手当てする／脅す
     参加者が死ぬと誰かが反応し、生贄の儀にも顔を出す
   ・殺人が目標の参加者が3人以上なら、80％で「殺人バトル」ルート：村人を皆殺しにしたあと、殺人者どうしで殺し合って決着する
   ・隠し神の村では、参加者そっくりの村人が現れたり、座敷牢に幽閉されているのに気づくことがある。双子だと分かり、
     連れて逃げる／置いていく／生贄の身代わりにする／殺す／入れ替わられる、で展開が分かれる */
(function () {
  'use strict';
  var HK = window.HK, ST = HK.Story, JS = HK.JASHIN, clamp = HK.clamp;
  if (!ST || !JS || !JS.UNPC_LIST) return;
  var B = JS.BATTLE_T, TW = JS.TWIN_T;
  function pk(S, a) { return ST.pick(S, a); }
  function F(t, m) { return ST.fmt(t, m); }
  function al(p) { return JS.alive(p); }
  function bond(S, a, b) { return JS.REL ? JS.REL.bond(S, a, b) : 0; }
  function edge(S, a, b, lab, cls, from) { if (JS.DRAMA) JS.DRAMA.edge(S, a, b, lab, cls, from); }
  function live(S) { return S.P.filter(function (p) { return al(p) && !p.bound; }); }
  function gainClue(S, p) {
    var k = S.G.clues.map(function (c, j) { return j; }).filter(function (j) { return S.found.indexOf(j) < 0; })[0];
    if (k == null) return '';
    S.found.push(k); p.cnt.clue++;
    return S.G.clues[k].t;
  }
  function M(S, p, extra) { var m = { a: p ? p.name : '', g: S.G.call, v: S.V, s: (S.G.sol || '').split('、')[0] }; for (var k in extra || {}) m[k] = extra[k]; return m; }
  function npc(S, id) { return (S.npcs || []).filter(function (n) { return n.id === id && n.alive; })[0]; }

  /* ---------- 登場 ---------- */
  function arrive(S) {
    var rng = S.rng, pool = JS.UNPC_LIST.slice();
    /* おかっぱの子とトメ婆は出やすい。隠し神の村ではトメ婆が必ずいる（双子のことを知っている） */
    var pick = [], n = 3 + (rng() < 0.4 ? 1 : 0);
    if (S.G.id === 'kamikakushi') pick.push(pool.filter(function (x) { return x.id === 'tome'; })[0]);
    while (pick.length < n) {
      var c = HK.weighted(rng, pool.filter(function (x) { return pick.indexOf(x) < 0; }), function (x) { return x.id === 'miyo' || x.id === 'tome' ? 1.6 : 1; });
      if (!c) break; pick.push(c);
    }
    S.npcs = pick.map(function (d) { return { id: d.id, d: d, alive: true, n: 0 }; });
    S.npcs.forEach(function (x) { ST.say(S, { tag: x.d.name, text: F(pk(S, x.d.greet), M(S, null, { a: '' })), why: x.d.name + '：' + x.d.who }); });
    /* 殺人バトルの予兆 */
    var mur = S.P.filter(function (p) { return p.goal0 && p.goal0.id === 'murder'; });
    S.battlePlan = mur.length >= 3 && rng() < 0.8;
  }

  /* ---------- NPCの一時間 ---------- */
  function tick(S, L0, h) {
    var rng = S.rng;
    if (S.forceEnd) return;
    if (S.battlePlan && !S.battleDone && (h >= 4 || S.murders) && rng() < 0.6) return battle(S, h);
    if (S.G.id === 'kamikakushi' && !S.twin && h >= 6 && rng() < 0.16) twinFind(S, h);
    if (S.twin && S.twin.state === 'swap' && !S.twin.checked) twinSwapCheck(S, h);
    var xs = (S.npcs || []).filter(function (x) { return x.alive; });
    if (!xs.length || rng() > 0.42) return;
    var L1 = live(S); if (!L1.length) return;
    var x = rng.pick(xs), d = x.d, p = HK.weighted(rng, L1, function (q) { return 1 + JS.skill(q, 'talk') + (q.action.id === 'alone' ? 0.8 : 0); });
    x.n++;
    var r = rng(), m = M(S, p);
    /* NPCごとの得意な動き */
    if (d.prophecy && !S.proph && r < 0.35) {
      S.proph = p;
      ST.say(S, { actors: [p], tag: d.name, text: F(pk(S, d.prophecy), m), why: d.name + 'が、' + p.name + 'の死を予言した', mag: 22 });
      return;
    }
    if (d.lure && JS.night(h) && r < 0.5 && p.tr.np + p.tr.ac > 0.9) {
      var lost = rng() < 0.4;
      if (lost) { p.taken = true; p.fate = 'おかっぱの子に連れて行かれた（' + JS.hm(h) + '）'; }
      var c0 = !lost && rng() < 0.6 ? gainClue(S, p) : '';
      ST.say(S, { actors: [p], tag: d.name, kind: lost ? 'climax' : undefined, text: F(pk(S, d.lure), m) + F(pk(S, lost ? d.lure_lost : d.lure_back), m) + (c0 ? '――' + c0 + '。' : ''), why: p.name + 'はおかっぱの子について行った（NP・AC）' + (lost ? '。行方不明になった（失踪）' : c0 ? '。手がかり +1' : ''), mag: lost ? 34 : 16 });
      return;
    }
    if (d.count && r < 0.5) {
      var cnt = Math.max(1, L1.length - (rng() < 0.5 ? 1 : 0));
      L1.forEach(function (q) { q.m.fear = clamp(q.m.fear + 6, 0, 100); });
      ST.say(S, { actors: [p], tag: d.name, text: F(pk(S, d.count), M(S, p, { n: cnt })), why: '墓守は、生きている一行の人数ぶん穴を掘っている（恐怖 +6）', mag: 18 });
      return;
    }
    if (d.heal && p.m.hp < 70 && r < 0.6) {
      p.m.hp = clamp(p.m.hp + 20, 0, 100);
      ST.sayB(S, { actors: [p], tag: d.name, text: F(pk(S, d.heal), m), why: '体力 +20（生贄には、無傷でいてほしいらしい）' }, d.name + 'が' + p.name + 'を手当てした');
      return;
    }
    if (d.curse && r < 0.2 && p.cnt.clue >= 2) {
      p.m.fear = clamp(p.m.fear + 18, 0, 100);
      ST.say(S, { actors: [p], tag: d.name, text: F(pk(S, d.curse), m), why: p.name + 'は手がかりを集めすぎた（恐怖 +18）', mag: 18 });
      return;
    }
    if (d.threat && r < 0.25) {
      S.hostile = clamp(S.hostile + 6, 0, 100);
      ST.say(S, { actors: [p], tag: d.name, text: F(pk(S, d.threat), m), why: '村人の敵意 +6', mag: 16 });
      return;
    }
    if (d.warn && r < 0.3) {
      p.stats.luck = Math.min(6, (p.stats.luck || 3) + 1); p.m.fear = clamp(p.m.fear - 4, 0, 100);
      ST.say(S, { actors: [p], tag: d.name, text: F(pk(S, d.warn), m), why: d.name + 'が、' + p.name + 'を危ないところから引き戻した（運 +1）', mag: 16 });
      return;
    }
    if (r < 0.62) {
      /* 手がかりをくれる（話しかけた人の聞き込みの力） */
      var ok = rng() < 0.3 + JS.skill(p, 'talk') * 0.4 + (p.villager ? 0.2 : 0);
      var c = ok ? gainClue(S, p) : '';
      if (d.id === 'tome' && ok) S.sealBonus = (S.sealBonus || 0) + 0.06;
      ST.say(S, { actors: [p], tag: d.name, text: F(pk(S, d.hint), m) + (c ? '――' + c + '。' : ''), why: d.name + 'が' + p.name + 'に話した' + (c ? '（聞き込みの力。手がかり ' + S.found.length + '/' + S.G.clues.length + '）' : '（意味は、まだ分からない）') + (d.id === 'tome' && ok ? '・対抗策の一節（封じやすくなる）' : ''), mag: c ? 20 : 12 });
      return;
    }
    ST.sayB(S, { actors: [p], tag: d.name, text: F(pk(S, d.idle), m), why: d.who }, d.name + 'が' + p.name + 'に話しかけた');
  }

  /* 参加者が死んだとき：NPCの反応・予言の的中 */
  function onDeath(S, p) {
    var rng = S.rng, xs = (S.npcs || []).filter(function (x) { return x.alive; });
    if (S.proph === p) {
      var miyo = npc(S, 'miyo');
      S.proph = 'hit';
      if (miyo) ST.say(S, { actors: [p], tag: miyo.d.name, text: F(pk(S, miyo.d.proph_hit), M(S, p)), why: 'おかっぱの子の予言が当たった', mag: 24 });
      return;
    }
    if (!xs.length || rng() > 0.4 || S.battleOn) return;
    var x = rng.pick(xs);
    ST.sayB(S, { actors: [], tag: x.d.name, text: F(pk(S, x.d.death), M(S, p)), why: x.d.name + '：' + x.d.who }, x.d.name + 'が' + p.name + 'の死を見ていた');
  }

  /* 生贄の儀に顔を出す */
  function ritualCameo(S) {
    var xs = (S.npcs || []).filter(function (x) { return x.alive; });
    if (!xs.length) return;
    var x = S.rng.pick(xs);
    ST.say(S, { tag: x.d.name, text: F(pk(S, x.d.ritual), M(S, null)), why: x.d.name + '：' + x.d.who });
  }

  /* ---------- 殺人バトル ---------- */
  function weaponOf(p) { var W = JS.GT && JS.GT.WEAPON; return (p.mur && p.mur.x) || (W && (W[p.job] || W.def)) || '刃物'; }
  function battle(S, h) {
    var rng = S.rng, C = JS.core;
    S.battleDone = true; S.battleOn = true;
    var mur = S.P.filter(function (p) { return p.alive && !p.out && p.goal0 && p.goal0.id === 'murder'; });
    mur.forEach(function (p) { p.taken = false; });
    if (mur.length < 2) { S.battleOn = false; return; }
    ST.step(S, '殺人バトル　' + C.label(h));
    mur.forEach(function (p) { p.bound = false; p.goal = p.goal0; });
    var o = ST.say(S, { actors: mur, tag: '殺人バトル', kind: 'climax', text: F(pk(S, B.start), { x: C.names(mur) }) + pk(S, B.plan), why: '殺人を目標にする者が' + mur.length + '人いた。――トンチキルート（80％）', mag: 50 });
    ST.key(S, o, '殺人バトル開幕');
    /* 村人を皆殺しにする */
    var t = F(pk(S, B.massacre), { v: S.V });
    (S.npcs || []).forEach(function (x) { if (x.alive) { x.alive = false; t += F(pk(S, x.d.die), { g: S.G.call }); } });
    t += F(pk(S, B.noVillage), { v: S.V, g: S.G.call });
    S.hostile = 0; S.reporter && (S.reporter.alive = false); S.police && (S.police.alive = false);
    ST.say(S, { actors: mur, tag: '殺人バトル', kind: 'climax', text: t, why: '殺人者たちが手を組み、村人を一人残らず殺した（村人の敵意 0・祭りは開かれない）', mag: 50 });
    /* 巻き込まれる人・隠れる人・実況する人 */
    var others = S.P.filter(function (p) { return al(p) && mur.indexOf(p) < 0; });
    others.forEach(function (q) {
      var r = rng();
      if (q.job === 'streamer') ST.sayB(S, { actors: [q], tag: '殺人バトル', text: F(pk(S, B.stream), { a: q.name }), why: q.name + 'は配信していた' }, q.name + 'は実況していた');
      else if (q.tr.fc > 0.7 && r < 0.3) ST.sayB(S, { actors: [q], tag: '殺人バトル', text: F(pk(S, B.cheer), { a: q.name }), why: 'FCが高すぎた' }, q.name + 'は観戦していた');
      else ST.sayB(S, { actors: [q], tag: '殺人バトル', text: F(pk(S, B.hide), { a: q.name }), why: q.name + 'は隠れた（慎重さ）' }, q.name + 'は隠れた');
    });
    /* 殺し合い */
    var hp = {}; mur.forEach(function (p) { hp[p.i] = 2 + Math.round(JS.skill(p, 'fight') * 3 + (p.stats.stamina || 3) * 0.3); });
    var guard = 0;
    while (mur.filter(al).length > 1 && guard++ < 40) {
      var ms = mur.filter(al);
      var a = HK.weighted(rng, ms, function (p) { return 1 + JS.skill(p, 'fight') * 2 + p.tr.aggr; });
      var b = HK.weighted(rng, ms.filter(function (q) { return q !== a; }), function (q) { return 1 + (a.mur && a.mur.t === q ? 3 : 0) + Math.max(0, -bond(S, a, q)) * 2; });
      if (ms.length === 2 && rng() < 0.12) {
        ms.forEach(function (p) { p.alive = false; p.fate = '殺人バトルで相討ち（' + JS.hm(h + 1) + '）'; });
        edge(S, ms[0], ms[1], '相討ち', 'kill');
        ST.say(S, { actors: ms, tag: '殺人バトル', kind: 'climax', text: F(pk(S, B.double), { a: ms[0].name, b: ms[1].name }), why: '相討ち', mag: 50 });
        break;
      }
      var dm = { a: a.name, b: b.name, x: weaponOf(a), y: weaponOf(b) }; if (dm.x === dm.y) dm.y = 'もう一本の' + dm.y;
      var hitP = 0.5 + (JS.skill(a, 'fight') - JS.skill(b, 'fight')) * 0.4 + (a.stats.luck - b.stats.luck) * 0.03;
      var win = rng() < hitP ? a : b, lose = win === a ? b : a, wm = { a: win.name, b: lose.name, x: weaponOf(win), y: weaponOf(lose) };
      hp[lose.i] -= 1 + (rng() < 0.3 ? 1 : 0);
      var tt = F(pk(S, B.duel), dm) + F(pk(S, B.hit), wm);
      if (hp[lose.i] <= 0) {
        lose.alive = false; lose.fate = '殺人バトルで' + win.name + 'に敗れた（' + JS.hm(h + 1) + '）'; lose.how = win.name + 'に殺されて';
        edge(S, win, lose, '殺害', 'kill', win);
        tt += F(pk(S, B.kill), wm);
        ST.say(S, { actors: [win, lose], tag: '殺人バトル', kind: 'climax', text: tt, why: win.name + 'が' + lose.name + 'を倒した（腕っぷし・運）', mag: 46 });
      } else ST.sayB(S, { actors: [a, b], tag: '殺人バトル', text: tt, why: '殺し合いは続いた' }, a.name + 'と' + b.name + 'がぶつかった');
      /* 隠れていた人が巻き込まれる */
      var hid = others.filter(al);
      if (hid.length && rng() < 0.12) {
        var v = HK.weighted(rng, hid, function (q) { return 1 + (1 - q.tr.caution) + (q.job === 'streamer' ? 1 : 0); });
        v.alive = false; v.fate = '殺人バトルに巻き込まれた（' + JS.hm(h + 1) + '）';
        ST.say(S, { actors: [v], tag: '殺人バトル', kind: 'climax', text: F(pk(S, B.caught), { b: v.name }) + F(pk(S, B.caught_die), { b: v.name }), why: '巻き込まれた', mag: 36 });
      }
    }
    var win0 = mur.filter(al)[0];
    var tend = '';
    if (win0) { win0.fate = '殺人バトルの勝者'; tend = F(pk(S, B.winner), { a: win0.name }); }
    tend += F(pk(S, B.god), { g: S.G.call }) + F(pk(S, B.out), { v: S.V });
    var outs = S.P.filter(function (p) { return al(p) || (p.alive && p.bound); });
    outs.forEach(function (p) { p.bound = false; p.taken = false; p.out = true; p.esc = h + 2; if (!/勝者/.test(p.fate)) p.fate = '生き延びた（' + JS.hm(h + 2) + '）'; });
    var o2 = ST.say(S, { actors: outs, tag: '決着', kind: 'climax', text: tend, why: win0 ? win0.name + 'が最後まで立っていた' : '殺人者は全員倒れた', mag: 52 });
    ST.key(S, o2, win0 ? win0.name + 'が殺人バトルに勝利' : '殺人バトルは相討ち');
    S.titleOverride = '殺人バトル決着――' + (win0 ? '勝者は' + win0.name + '。' : '殺人者は全員倒れた。') + S.V + 'の村人は、一人も残らなかった（生き延びた人 ' + outs.length + '人）';
    S.battleOn = false; S.forceEnd = true;
  }

  /* ---------- 隠し神：双子 ---------- */
  function twinFind(S, h) {
    var rng = S.rng, L1 = live(S).filter(function (p) { return !p.amn || p.amn.back; });
    if (!L1.length) return;
    var x = rng.pick(L1), others = L1.filter(function (q) { return q !== x; });
    var tw = S.twin = { x: x, state: 'found', name: 'もう一人の' + x.name };
    var t = '';
    if (others.length && rng() < 0.5) {
      var b = rng.pick(others);
      t = F(pk(S, TW.seen), { a: x.name, b: b.name }) + '――その夜、' + x.name + 'は神社の裏で、それを見つけた。';
    }
    t += F(pk(S, TW.cell), { a: x.name }) + F(pk(S, TW.voice), { a: x.name }) + F(pk(S, TW.remember), { a: x.name });
    var tome = npc(S, 'tome');
    if (tome) t += F(pk(S, tome.d.twin), { a: x.name, g: S.G.call });
    else t += '村の掲示板の貼り紙の一枚に、' + x.name + 'の生まれた年と、同じ誕生日が書かれていた。――双子だった。';
    var o = ST.say(S, { actors: [x], tag: '双子', kind: 'climax', text: t, why: '隠し神の村：' + x.name + 'には、生まれた晩に隠された双子がいた', mag: 44 });
    ST.key(S, o, x.name + 'の双子が見つかった');
    /* どうするか：本人の気質と、仲間の気質で決まる */
    var tr = x.tr, cold = others.filter(function (q) { return q.tr.cold > 0.65 && q.tr.warmth < 0.4; })[0];
    var w = { rescue: 0.4 + tr.np * 1.2 + tr.warmth * 0.6, leave: 0.2 + tr.caution * 0.8 + tr.cold * 0.5, sacrifice: (cold ? 0.4 + cold.tr.cold * 0.6 : 0) + tr.cold * 0.4 - tr.np * 0.3, kill: tr.aggr * 0.7 + tr.cold * 0.3 - tr.warmth * 0.5 - 0.1, swap: 0.25 + (x.m.fear / 200) };
    var ch = HK.weighted(rng, Object.keys(w), function (k) { return Math.pow(Math.max(0.02, w[k]), 2); });
    var m = { a: x.name, c: cold ? cold.name : '', g: S.G.call };
    if (ch === 'sacrifice' && !cold) m.c = x.name;
    if (ch === 'swap') {
      tw.state = 'swap'; tw.at = h;
      ST.say(S, { actors: [x], tag: '双子', text: x.name + 'は、もう一人の自分に「必ず迎えに来る」と約束して、座敷牢を離れた。' + F(pk(S, TW.choose.swapped), m), why: '――その夜、入れ替わりが起きた（' + x.name + 'の恐怖・隠し神の力）', mag: 30 });
      return;
    }
    tw.state = ch;
    var t2 = F(pk(S, TW.choose[ch]), m), why = { rescue: x.name + 'は双子を連れて逃げることにした（NP・温かさ）', leave: x.name + 'は双子を置いていくことにした（慎重さ・冷たさ）', sacrifice: (cold && cold !== x ? cold.name + 'の提案で、' : '') + '双子を生贄の身代わりにすることになった（冷たさ）', kill: x.name + 'は双子を殺した（攻撃性）' }[ch];
    if (ch === 'kill') { S.deadline = Math.max(h + 4, S.deadline - 4); x.m.fear = clamp(x.m.fear + 20, 0, 100); t2 += F(pk(S, TW.kill_rage), m); why += '。隠し神が怒り、刻限が4時間早まった'; tw.dead = true; }
    if (ch === 'rescue') { x.m.fear = clamp(x.m.fear - 15, 0, 100); }
    if (ch === 'sacrifice') { S.twinSub = true; }
    ST.say(S, { actors: [x].concat(cold && ch === 'sacrifice' ? [cold] : []), tag: '双子', kind: 'climax', text: t2, why: why, mag: 40 });
  }
  function twinSwapCheck(S, h) {
    var tw = S.twin, x = tw.x, rng = S.rng;
    if (h < tw.at + 2) return;
    tw.checked = true;
    var obs = live(S).filter(function (q) { return q !== x; }).sort(function (a, b) { return JS.skill(b, 'obs') + bond(S, b, x) * 0.5 - JS.skill(a, 'obs') - bond(S, a, x) * 0.5; })[0];
    if (obs && rng() < JS.skill(obs, 'obs') * 0.6 + Math.max(0, bond(S, obs, x)) * 0.35) {
      tw.state = 'noticed';
      ST.say(S, { actors: [obs, x], tag: '双子', kind: 'climax', text: F(pk(S, TW.swap_notice), { a: x.name, b: obs.name }), why: obs.name + 'が入れ替わりに気づいた（観察・' + x.name + 'との絆）', mag: 40 });
      return;
    }
    tw.state = 'swapped';
    x.taken = true; x.fate = 'もう一人の自分と入れ替わられ、座敷牢に残された';
    ST.say(S, { actors: [x], tag: '双子', kind: 'climax', text: F(pk(S, TW.swap_miss), { a: x.name }), why: '入れ替わりに、誰も気づかなかった', mag: 40 });
  }
  /* 生贄の身代わり */
  function twinRitual(S) {
    var tw = S.twin;
    if (!S.twinSub || !tw || tw.dead) return null;
    tw.dead = true;
    ST.say(S, { actors: [tw.x], tag: '双子', kind: 'climax', text: F(pk(S, TW.sac_do), { a: tw.x.name }), why: '双子が生贄の身代わりになった（仲間は誰も生贄にならない）', mag: 46 });
    tw.x.notes.push('双子を生贄の身代わりにした');
    return { vic: null };
  }
  /* 結末 */
  function end(S) {
    var tw = S.twin;
    prophEnd(S);
    if (!tw) return;
    var x = tw.x, m = { a: x.name }, t = null;
    if (tw.state === 'rescue') {
      if (x.out && x.alive) { var both = S.rng() < 0.5; t = pk(S, both ? TW.end_both : TW.end_vanish); x.notes.push(both ? '双子と一緒に村を出た' : '双子は村から出られなかった'); }
      else x.notes.push('双子を連れて逃げようとした');
    } else if (tw.state === 'leave') { if (x.out) t = pk(S, TW.end_leave); x.notes.push('双子を置いていった'); }
    else if (tw.state === 'swapped') {
      if (S.P.some(function (p) { return p.out; })) t = pk(S, TW.end_swap);
      x.notes.push('双子と入れ替わられた');
    } else if (tw.state === 'kill' || tw.state === 'sacrifice') { if (x.out) t = pk(S, TW.end_guilt); if (tw.state === 'kill') x.notes.push('双子を殺した'); }
    else if (tw.state === 'noticed') x.notes.push('入れ替わりを見抜いてもらった');
    if (t) ST.say(S, { actors: [x], tag: '双子', kind: 'climax', text: F(t, m), why: '双子の結末', mag: 36 });
  }
  /* 予言が外れた */
  function prophEnd(S) {
    var miyo = (S.npcs || []).filter(function (n) { return n.id === 'miyo'; })[0];
    if (miyo && S.proph && S.proph !== 'hit' && S.proph.out) ST.say(S, { actors: [S.proph], tag: miyo.d.name, text: F(pk(S, miyo.d.proph_miss), { a: S.proph.name }), why: 'おかっぱの子の予言は、外れた――のだろうか' });
  }

  /* 死・生贄の儀にNPCを絡める（ほかのファイルの関数を包む） */
  if (JS.REL && JS.REL.onDeath) { var od = JS.REL.onDeath; JS.REL.onDeath = function (S, p) { od(S, p); onDeath(S, p); }; }
  if (JS.GOALX && JS.GOALX.hijackRitual) {
    var hr = JS.GOALX.hijackRitual;
    JS.GOALX.hijackRitual = function (S, h, vic) { ritualCameo(S); var tw = twinRitual(S); return tw || hr(S, h, vic); };
  }

  JS.UNPC = { arrive: arrive, tick: tick, end: end };
})();
