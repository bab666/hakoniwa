/* 箱庭シミュレーター: 邪神村RTA ― 表の職業×目標で変わる振る舞い
   ・目標：恋人を作る／借金返済のために盗む／誰かを殺す／村の儀式を乗っ取る／事件を解決する（ほかに儀式で別の神を呼ぶ＝jashin-mage.js）
   ・同じ目標でも、職業で手口が変わる（医師の殺人は毒、警察官の盗みは見回りのふり、神職の乗っ取りは宮司から祝詞を教わる …）
   ・緊迫感：失踪・死・殺人事件・刻限の近さ・村人の敵意で上がる。上がるほど、生きて帰りたい人は自分の目標を後回しにして、
     村からの脱出や村の秘密を暴くことを優先する（生還を望まない目標＝儀式で別の神を呼ぶ・神を見る・自暴自棄の殺人は、ほとんど揺るがない）
   ・怖さが限界に近いときは、目標の行動を控える */
(function () {
  'use strict';
  var HK = window.HK, ST = HK.Story, JS = HK.JASHIN, clamp = HK.clamp;
  if (!ST || !JS || !JS.GT) return;
  var T = JS.GT;
  function pk(S, a) { return ST.pick(S, a); }
  function F(t, m) { return ST.fmt(t, m); }
  function al(p) { return JS.alive(p); }
  function bond(S, a, b) { return JS.REL ? JS.REL.bond(S, a, b) : 0; }
  function setRel(S, a, b, d, lab, from) { if (JS.DRAMA) JS.DRAMA.setRel(S, a, b, d, lab, from); }
  function edge(S, a, b, lab, cls, from) { if (JS.DRAMA) JS.DRAMA.edge(S, a, b, lab, cls, from); }
  function canLove(a, b) { return !HK.canLove || (HK.canLove(a, b) && HK.canLove(b, a)); }
  function jobT(map, p) { return map[p.job] || map.def; }
  function note(p, s) { if (p.notes.indexOf(s) < 0) p.notes.push(s); }
  var PERSONAL = { love: 1, steal: 1, murder: 1, hijack: 1, content: 1, solve: 1, deny: 1, find: 1, meet: 1, ritual: 1 };

  /* ---------- 緊迫感 ---------- */
  function tension(S, h) {
    var dead = S.P.filter(function (p) { return !p.alive && !p.out; }).length, lost = S.P.filter(function (p) { return p.taken; }).length;
    var mur = (S.cases || []).filter(function (c) { return c.killer; }).length + (S.murders || 0);
    var v = dead * 18 + lost * 14 + mur * 12 + (S.vmurder ? 8 : 0) + h / Math.max(8, S.deadline) * 25 + (S.hostile - 30) / 3;
    S.tension = clamp(v, 0, 100);
    S.tenseCause = mur ? 'murder' : dead ? 'dead' : lost ? 'lost' : 'uneasy';
    return S.tension;
  }

  function tick(S, live, h) {
    var rng = S.rng, t = tension(S, h);
    /* 緊迫感が段階を越えたときの空気 */
    var lv = t >= 80 ? 3 : t >= 55 ? 2 : t >= 30 ? 1 : 0;
    if (lv > (S.tenseLv || 0)) {
      S.tenseLv = lv;
      var pool = lv === 3 ? T.TENSE.edge : T.TENSE[S.tenseCause];
      ST.say(S, { kind: 'phase', tag: '緊迫', text: pk(S, pool), why: '緊迫感 ' + Math.round(t) + '（' + { murder: '仲間の中に殺人者がいるかもしれない', dead: '仲間が死んだ', lost: '仲間が消えた', uneasy: '刻限と村人の敵意' }[S.tenseCause] + '）。生きて帰りたい人ほど、自分の目標より脱出や村の秘密を優先する' });
    }
    /* 目標を後回しにする／戻す */
    live.forEach(function (p) {
      if (!al(p) || p.bound || !p.goal0 || !PERSONAL[p.goal0.id]) return;
      var surv = p.surv != null ? p.surv : 1;
      if (p.goal === p.goal0) {
        var ch = Math.pow(t / 100, 1.6) * surv * (0.45 + p.tr.caution * 0.4 + p.m.fear / 220) * 0.55;
        if (rng() > ch) return;
        var ng = p.m.fear > 60 || p.tr.caution > 0.6 ? 'escape' : p.tr.a > 0.55 ? 'truth' : p.tr.np > 0.6 ? 'protect' : 'escape';
        var b = p.love && p.love.t || p.mur && p.mur.t || null;
        p.goal = JS.GOAL[ng];
        ST.sayB(S, { actors: [p], tag: '優先', text: F(pk(S, T.DROP[p.goal0.id] || T.DROP.def), { a: p.name, b: b ? b.name : '' }), why: '緊迫感 ' + Math.round(t) + '。' + p.name + 'は目標「' + p.goal0.label + '」を後回しにして、「' + p.goal.label + '」を優先した（生きて帰りたい気持ち・慎重さ・恐怖）' }, p.name + 'は目標を後回しにした');
      } else if (rng() < 0.12 * (1 - t / 100) && p.m.fear < 55) {
        p.goal = p.goal0;
        ST.sayB(S, { actors: [p], text: F(pk(S, T.BACK), { a: p.name }), why: p.name + 'は、目標「' + p.goal0.label + '」に戻った（緊迫感が和らいだ）' }, p.name + 'は目標に戻った');
      }
    });
  }

  /* ---------- 到着：隠した目標の気配 ---------- */
  function arrive(S) {
    var rng = S.rng;
    S.P.forEach(function (p) {
      var g = p.goal.id;
      if (g === 'steal') { p.debt = (3 + Math.floor(rng() * 18)) * 10; p.loot = 0; ST.sayB(S, { actors: [p], tag: '借金', text: F(pk(S, T.DEBT), { a: p.name, x: p.debt * 10 + '万円' }), why: p.name + 'の本当の目標は「借金返済のために盗む」（衝動・CPの低さ）' }, p.name + 'には借金があった'); }
      if (g === 'murder') setupMurder(S, p);
      if (g === 'hijack') { p.hj = { pow: 0, prep: 0 }; ST.sayB(S, { actors: [p], tag: '企み', text: F(pk(S, T.HJ_HINT), { a: p.name }), why: p.name + 'の本当の目標は「村の儀式を乗っ取る」（' + JS.core.jobOf(p).label + 'として近づく）' }, p.name + 'は祭りに興味津々だった'); }
    });
  }

  /* ---------- 一時間ぶんの行動（行動したら true） ---------- */
  function act(S, p, h, live) {
    var g = p.goal.id, rng = S.rng;
    if (!PERSONAL[g] || p.bound) return false;
    /* 怖さが限界に近いと、生きて帰りたい人は目標の行動を控える */
    if (p.m.fear > 75 && (p.surv || 1) > 0.5 && rng() < 0.55) return false;
    if (g === 'love') return love(S, p, h, live);
    if (g === 'steal') return steal(S, p, h, live);
    if (g === 'murder') return murder(S, p, h, live);
    if (g === 'hijack') return hijackPrep(S, p, h);
    if (g === 'solve') return solve(S, p, h);
    return false;
  }

  /* ---------- 恋人を作る ---------- */
  function love(S, p, h, live) {
    var rng = S.rng;
    if (rng() > 0.5 * (ST.romK ? ST.romK(S) : 1)) return false;
    var L0 = p.love || (p.love = { t: null, pt: 0, tries: 0 });
    if (L0.done) return false;
    if (!L0.t || !al(L0.t)) {
      var cs = live.filter(function (q) { return q !== p && !q.bound && canLove(p, q) && !(HK.Avoid && HK.Avoid.of(S, p, q)) && (!HK.Poly || HK.Poly.storyCan(S, p, q)) && !(S.ties || []).some(function (t) { return ((t.a === p.i && t.b === q.i) || (t.a === q.i && t.b === p.i)) && HK.tieNoLove(t); }) && !(L0.no && L0.no.indexOf(q.i) >= 0); });
      if (!cs.length) return false;
      L0.t = HK.weighted(rng, cs, function (q) { return 1 + Math.max(0, bond(S, p, q)) * 2 + q.tr.warmth; }); L0.pt = 0;
      ST.sayB(S, { actors: [p, L0.t], tag: '恋', text: F(pk(S, T.LOVE_PICK), { a: p.name, b: L0.t.name }), why: p.name + 'の目標は「恋人を作る」（FC・NP・衝動）' }, p.name + 'は' + L0.t.name + 'が気になっていた');
      return true;
    }
    var b = L0.t, m = { a: p.name, b: b.name };
    /* 避けている相手には、自分から口説かない・告白しない（avoid-kit.js の HK.Avoid。2026-10-28） */
    if (HK.Avoid && HK.Avoid.of(S, p, b)) { L0.t = null; L0.pt = 0; return false; }
    if (L0.pt >= 2 && bond(S, p, b) >= 0.3) {
      /* 告白 */
      /* 複数の恋人「なし」で、どちらかに別の恋人がいる組は実らない（HK.Poly.storyCan） */
      var ok = (!HK.Poly || HK.Poly.storyCan(S, p, b)) && rng() < 0.25 + bond(S, b, p) * 0.5 + b.tr.fc * 0.15 + b.tr.np * 0.1 - b.tr.cp * 0.15 - (hasLover(S, b) ? 0.35 : 0) + (S.tension > 50 ? 0.1 : 0);
      var t = F(pk(S, T.LOVE_CONFESS), m) + F(pk(S, ok ? T.LOVE_OK : T.LOVE_FAIL), m);
      if (ok) {
        L0.done = true; if (!(S.ties || []).some(function (t) { return t.type === 'lover' && ((t.a === p.i && t.b === b.i) || (t.a === b.i && t.b === p.i)); })) S.ties.push({ a: p.i, b: b.i, type: 'lover' }); setRel(S, p, b, 0.4, '恋人'); edge(S, p, b, '恋人になった', 'love');
        p.m.fear = clamp(p.m.fear - 15, 0, 100); b.m.fear = clamp(b.m.fear - 12, 0, 100);
        /* 恋が叶うと、二人で生きて帰ることが目標になる */
        p.goal = p.goal0 = JS.GOAL.protect; p.surv = 1;
        note(p, b.name + 'と恋人になった');
      } else { L0.pt = 0; L0.tries++; (L0.no = L0.no || []).push(b.i); L0.t = null; setRel(S, p, b, -0.05, '気まずい'); p.m.fear = clamp(p.m.fear + 6, 0, 100); }
      var o = ST.say(S, { actors: [p, b], tag: '告白', kind: 'climax', text: t, why: ok ? p.name + 'の想いが届いた（' + b.name + 'の気持ち・FC）。目標が「' + JS.GOAL.protect.label + '」に変わった' : b.name + 'には届かなかった（' + (hasLover(S, b) ? '恋人がいた' : hasLover(S, p) ? p.name + 'には恋人がいた' : 'CP・気持ちが足りない') + '）', mag: 34 });
      if (ok) ST.key(S, o, p.name + 'と' + b.name + 'が恋人に');
      return true;
    }
    /* 口説く（職業で手口が変わる） */
    var yes = rng() < 0.4 + bond(S, b, p) * 0.4 + b.tr.warmth * 0.2 + p.tr.fc * 0.1 - (hasLover(S, b) ? 0.3 : 0) - b.tr.cp * 0.1;
    var t2 = F(pk(S, jobT(T.LOVE_JOB, p)), m) + F(pk(S, yes ? T.LOVE_YES : T.LOVE_NO), m);
    if (yes) { L0.pt++; setRel(S, p, b, 0.18, 'いい雰囲気', p); } else setRel(S, p, b, -0.03, null);
    var riv = S.P.filter(function (c) { return al(c) && c !== p && c !== b && (hasTie(S, c, b, 'lover,mate,fated,crush') || bond(S, c, b) >= 0.8); })[0];
    if (riv && yes && rng() < 0.5) { t2 += F(pk(S, T.LOVE_RIVAL), { a: p.name, b: b.name, c: riv.name }); setRel(S, riv, p, -0.25, '恋敵', riv); }
    ST.sayB(S, { actors: [p, b].concat(riv && yes ? [riv] : []), tag: '恋', text: t2, why: p.name + '（' + JS.core.jobOf(p).label + '）なりの口説き方。' + (yes ? b.name + 'もまんざらでもない' : b.name + 'はつれない') }, p.name + 'が' + b.name + 'に近づいた');
    return true;
  }
  function ties(S, a, b) { return (S.ties || []).filter(function (t) { return (t.a === a.i && t.b === b.i) || (t.a === b.i && t.b === a.i); }); }
  function hasTie(S, a, b, list) { return ties(S, a, b).some(function (t) { return list.split(',').indexOf(t.type) >= 0; }); }
  function hasLover(S, b) { return S.P.some(function (c) { return c !== b && al(c) && hasTie(S, c, b, 'lover,mate,fated'); }); }

  /* ---------- 借金返済のために盗む ---------- */
  function steal(S, p, h, live) {
    var rng = S.rng;
    if (rng() > (JS.night(h) ? 0.4 : 0.22)) return false;
    var ST0 = T.STEAL, keys = Object.keys(ST0);
    var others = live.filter(function (q) { return q !== p && !q.bound; });
    var k = HK.weighted(rng, keys, function (x) {
      var o = ST0[x]; if (o.party && !others.length) return 0;
      return (o.v / 20 + 0.6) * (1 - o.risk * p.tr.caution) * (o.sacred ? (p.tr.impulse + (1 - p.tr.ac)) * 0.4 : 1) * (S.stolen && S.stolen[x] ? 0.2 : 1);
    });
    var o = ST0[k], b = o.party ? HK.weighted(rng, others, function (q) { return 1 + Math.max(0, -bond(S, p, q)) * 2; }) : null;
    var m = { a: p.name, b: b ? b.name : '', g: S.G.call };
    var t = (T.STEAL_JOB[p.job] ? F(T.STEAL_JOB[p.job], m) : '') + F(pk(S, o.t), m);
    var caught = rng() < o.risk - JS.skill(p, 'explore') * 0.3 + (JS.night(h) ? -0.08 : 0.05) + (p.job === 'streamer' ? 0.1 : 0);
    (S.stolen = S.stolen || {})[k] = 1;
    if (caught && !o.party) {
      S.hostile = clamp(S.hostile + 10, 0, 100); p.m.hp = clamp(p.m.hp - 18, 0, 100); p.m.fear = clamp(p.m.fear + 15, 0, 100);
      t += F(pk(S, T.STEAL_VILLAGE), m);
      ST.say(S, { actors: [p], tag: '盗み', text: t, why: p.name + 'は' + o.n + 'を盗もうとして、村人に見つかった（村人の敵意 +10）', mag: 26 });
      return true;
    }
    if (caught && o.party) {
      var w = b;
      t += F(pk(S, T.STEAL_PARTY), m);
      setRel(S, w, p, -0.45, '盗人', w); edge(S, w, p, '財布を盗まれた', 'enemy', w);
      if (w.job === 'police') { t += F(pk(S, T.STEAL_COP), m); p.bound = true; p.boundUntil = h + 4; p.boundAt = '駐在所'; }
      ST.say(S, { actors: [p, w], tag: '盗み', text: t, why: p.name + 'は仲間の財布に手を出し、' + w.name + 'に見つかった' + (p.bound ? '（警察官の' + w.name + 'に手錠をかけられた）' : ''), mag: 28 });
      return true;
    }
    p.loot = (p.loot || 0) + o.v;
    t += pk(S, T.STEAL_OK).replace(/\{a\}/g, p.name);
    var why = p.name + 'は' + o.n + 'を盗んだ（借金 ' + p.debt * 10 + '万円のうち、返せそうなのは ' + Math.min(p.loot, p.debt) * 10 + '万円）';
    if (o.clue && rng() < o.clue) { var c = gainClue(S, p); if (c) { t += pk(S, T.STEAL_CLUE) + c + '。'; why += '。盗んだ品から、村の秘密の手がかりが出てきた'; } }
    if (o.sacred) { S.hostile = clamp(S.hostile + 20, 0, 100); S.shrineRage = true; S.deadline = Math.max(h + 4, S.deadline - 4); t += F(pk(S, T.STEAL_RAGE), m); why += '。御神体を盗んだ（村人の敵意 +20・刻限が4時間早まった）'; }
    if (p.loot >= p.debt) { t += F(pk(S, T.STEAL_DONE), m); p.goal = p.goal0 = JS.GOAL.escape; why += '。借金を返せるだけ集まった。あとは生きて帰るだけ（目標が「' + JS.GOAL.escape.label + '」に）'; note(p, '借金を返せるだけ盗んだ'); }
    var oo = ST.say(S, { actors: [p], tag: '盗み', text: t, why: why, mag: o.sacred ? 34 : 18 });
    if (o.sacred) ST.key(S, oo, p.name + 'が御神体を盗んだ');
    return true;
  }
  function gainClue(S, p) {
    var k = S.G.clues.map(function (c, j) { return j; }).filter(function (j) { return S.found.indexOf(j) < 0; })[0];
    if (k == null) return '';
    S.found.push(k); p.cnt.clue++;
    return S.G.clues[k].t;
  }

  /* ---------- 誰かを殺す ---------- */
  function setupMurder(S, p) {
    var rng = S.rng, others = S.P.filter(function (q) { return q !== p; });
    /* 殺さない（attr.js の HK.Attr.noKillPair）相手は、ほかに狙える人がいれば狙わない（same-story.js） */
    if (HK.SameStory && HK.SameStory.spare) others = HK.SameStory.spare(S, p, others);
    if (!others.length) return;
    var en = others.filter(function (q) { return bond(S, p, q) < -0.15; })[0];
    var fam = others.filter(function (q) { return hasTie(S, p, q, 'mate,parent,sibling,twin,lover'); })[0];
    var why, t;
    if (en) { t = en; why = 'grudge'; }
    else if (p.tr.ac > 0.6 && p.tr.np < 0.5) { t = rng.pick(others); why = 'despair'; }
    else if (fam && p.tr.cold > 0.6 && rng() < 0.5) { t = fam; why = 'money'; }
    else if (p.tr.cold > 0.7 && rng() < 0.4) { t = rng.pick(others); why = 'thrill'; }
    else { t = others.slice().sort(function (a, b) { return bond(S, p, a) - bond(S, p, b); })[0]; why = 'past'; }
    p.mur = { t: t, why: why, prep: 0, tries: 0 };
    if (why === 'despair' || why === 'thrill') p.surv = 0.25;
    var wpn = T.WEAPON[p.job] || T.WEAPON.def;
    p.mur.x = wpn;
    ST.sayB(S, { actors: [p], tag: '殺意', text: F(pk(S, T.MURDER_HINT), { a: p.name, b: t.name }), why: p.name + 'の本当の目標は「誰かを殺す」――' + F(T.MURDER_WHY[why], { b: t.name, r: JS.REL && JS.REL.relLabel ? (JS.REL.relLabel(S, p, t) || '因縁') : '因縁' }) + '（冷たさ・攻撃性）' }, p.name + 'は' + t.name + 'を見ていた');
  }
  function murder(S, p, h, live) {
    var rng = S.rng, M0 = p.mur;
    if (S.battlePlan && !S.battleDone) return false;   /* 殺人バトルの前は、まだ手を出さない（jashin-npc.js） */
    if (!M0 || M0.done) return false;
    var b = M0.t;
    if (!b || !al(b)) {
      /* 狙った相手が先に死んだ。自暴自棄なら別の誰かへ */
      if (M0.why === 'despair' || M0.why === 'thrill') { var nb = live.filter(function (q) { return q !== p && !q.bound; }); if (!nb.length) return false; if (HK.SameStory && HK.SameStory.spare) nb = HK.SameStory.spare(S, p, nb); M0.t = b = rng.pick(nb); }
      else { M0.done = true; p.goal = p.goal0 = JS.GOAL.escape; ST.sayB(S, { actors: [p], text: p.name + 'は、手を下すまでもなく' + (b ? b.name : '狙った相手') + 'が死んだことを知った。複雑な顔をしていた。', why: '狙っていた相手が先に死んだ（目標が「' + JS.GOAL.escape.label + '」に）' }, p.name + 'の殺意は行き場を失った'); return true; }
    }
    var m = { a: p.name, b: b.name, x: M0.x };
    if (M0.prep < 1 || rng() < 0.35 - M0.prep * 0.1) {
      if (rng() > 0.5) return false;
      M0.prep++;
      ST.sayB(S, { actors: [p], tag: '殺意', text: F(pk(S, T.MURDER_PREP), m), why: p.name + 'は、' + b.name + 'を殺す支度をしている（凶器：' + M0.x + '）' }, p.name + 'は何かを隠し持っていた');
      return true;
    }
    /* 相手が一人のとき・夜を狙う */
    var alone = b.action.id === 'alone' || b.despair || JS.night(h);
    if ((!alone && rng() > 0.25) || rng() > 0.55) return false;
    M0.tries++;
    var ok = rng() < 0.4 + JS.skill(p, 'fight') * 0.3 + (JS.night(h) ? 0.12 : 0) + (p.job === 'doctor' || p.job === 'police' ? 0.12 : 0) - b.stats.luck * 0.03 - JS.skill(b, 'obs') * 0.15;
    var t = F(pk(S, jobT(T.MURDER_DO, p)), m);
    if (!ok) {
      b.m.hp = clamp(b.m.hp - 20, 0, 100); b.m.fear = clamp(b.m.fear + 30, 0, 100);
      setRel(S, b, p, -0.7, '殺されかけた', b); edge(S, p, b, '殺そうとした', 'enemy', p);
      ST.say(S, { actors: [p, b], tag: '殺人未遂', kind: 'climax', text: t + F(pk(S, T.MURDER_FAIL), m), why: b.name + 'は、' + p.name + 'の手を逃れた（運・観察）。' + b.name + 'は' + p.name + 'を疑っている', mag: 38 });
      if (rng() < 0.55) detect(S, p, true, b);
      return true;
    }
    M0.done = true; S.murders = (S.murders || 0) + 1;
    S.killer = p; edge(S, p, b, '殺害', 'kill', p);
    var mdN = S.log.length;
    JS.core.die(S, b, '何者かに殺されて', T.MURDER_DEATH, t + '――');
    if (HK.SameStory && HK.SameStory.mark) HK.SameStory.mark(S, mdN, HK.SameStory.note(S, p, b));
    S.killer = null;
    b.how = p.name + 'に殺されて';
    (S.cases || []).forEach(function (c) { if (c.killer === p && c.v === b) c.kind = 'murder'; });
    note(p, b.name + 'を殺した（' + M0.x + '）');
    var desp = M0.why === 'despair';
    ST.sayB(S, { actors: [p], tag: '殺人', text: F(pk(S, desp ? T.MURDER_AFTER.despair : T.MURDER_AFTER.def), m), why: p.name + 'は目標を果たした（' + F(T.MURDER_WHY[M0.why], { b: b.name, r: '恨み' }) + '）' }, p.name + 'は手を洗った');
    if (desp && rng() < 0.45) {
      p.bound = true; p.boundAt = '土蔵';
      ST.say(S, { actors: [p], tag: '自首', kind: 'climax', text: F(pk(S, T.MURDER_SURRENDER), m), why: '自暴自棄の殺人。' + p.name + 'は逃げる気もなかった', mag: 36 });
    } else { p.goal = p.goal0 = JS.GOAL.escape; p.surv = desp ? 0.3 : 1; }
    return true;
  }
  /* 殺人がばれる。縛られるか、裁かれる */
  function detect(S, m, openly, by) {
    var rng = S.rng, others = S.P.filter(function (q) { return q !== m && al(q) && !q.bound; });
    if (!others.length || !m.mur || m.bound) return false;
    var b = by || others.slice().sort(function (x, y) { return JS.skill(y, 'obs') - JS.skill(x, 'obs'); })[0];
    var ch = by ? 1 : JS.skill(b, 'obs') * 0.4 + (b.goal.id === 'solve' ? 0.2 : 0) + (b.job === 'sleuth' ? 0.3 : b.job === 'detective' ? 0.2 : 0);
    if (rng() > ch) return false;
    if (!by && JS.REL.cover && JS.REL.cover(S, m, b)) return false;
    var angry = others.reduce(function (s0, q) { return s0 + q.tr.aggr + q.tr.cold * 0.5; }, 0) / others.length;
    var t = openly && by ? '' : F(pk(S, T.MURDER_DETECT), { a: m.name, b: b.name, x: m.mur.x, v: m.mur.t ? m.mur.t.name : '' });
    /* 殺さない相手なら、裁かずに縛り上げる */
    if ((rng() < 0.15 + angry * 0.4 || S.ygo) && !(HK.SameStory && HK.SameStory.nk && HK.SameStory.nk(S, b, m))) {
      m.alive = false; m.fate = '仲間に裁かれた（' + JS.hm(S.h) + '）'; edge(S, b, m, '制裁', 'kill', b);
      var o = ST.say(S, { actors: [b, m], tag: '露見', kind: 'climax', text: t + F(pk(S, T.MURDER_KILLED), { a: m.name, b: b.name }), why: m.name + 'の殺人が' + b.name + 'にばれた。一行の怒りは止まらなかった', mag: 42 });
      ST.key(S, o, m.name + 'の殺人が露見');
    } else {
      m.bound = true; m.boundAt = '土蔵'; edge(S, b, m, '縛り上げた', 'enemy', b);
      var o2 = ST.say(S, { actors: [b, m], tag: '露見', kind: 'climax', text: t + F(pk(S, T.MURDER_BOUND), { a: m.name }), why: m.name + 'の殺人が' + b.name + 'にばれ、縛り上げられた', mag: 38 });
      ST.key(S, o2, m.name + 'が縛り上げられた');
    }
    return true;
  }

  /* ---------- 村の儀式を乗っ取る：支度 ---------- */
  function hijackPrep(S, p, h) {
    var rng = S.rng, H = p.hj || (p.hj = { pow: 0, prep: 0 });
    if (rng() > 0.35 || H.prep >= 4) return false;
    H.prep++;
    var r = rng(), t, why;
    if (r < 0.45) { H.pow += 0.12; t = F(pk(S, jobT(T.HJ_PREP, p)), { a: p.name }); why = '儀式の手順を学んだ（儀式の力 +）'; if (rng() < 0.3) { var c = gainClue(S, p); if (c) { t += '――' + c + '。'; why += '・手がかり +1'; } } }
    else if (r < 0.7) {
      H.pow += 0.18; t = F(pk(S, T.HJ_TOOL), { a: p.name }); why = '祭具に細工をした（儀式の力 ++）';
      if (rng() < 0.2) { S.hostile = clamp(S.hostile + 8, 0, 100); why += '。村人に気づかれかけた（敵意 +8）'; }
    } else { S.hostile = clamp(S.hostile - 6, 0, 100); t = F(pk(S, T.HJ_VILLAGE), { a: p.name }); why = '村人に取り入った（敵意 -6）'; }
    ST.sayB(S, { actors: [p], tag: '乗っ取り', text: t, why: p.name + '（' + JS.core.jobOf(p).label + '）は、村の儀式を乗っ取る支度をしている：' + why }, p.name + 'は祭りの支度を手伝っていた');
    return true;
  }
  function hijacker(S) { return S.P.filter(function (p) { return p.goal0 && p.goal0.id === 'hijack' && al(p) && !p.bound && !p.taken; })[0]; }
  function hjPower(S, p) { return 0.2 + (p.hj ? p.hj.pow : 0) + JS.skill(p, 'rite') * 0.3 + JS.skill(p, 'lore') * 0.12; }
  /* 乗っ取って皆を救うか、自分が祭主になるか（温かさ・仲間との絆） */
  function hjIntent(S, p) {
    var others = S.P.filter(function (q) { return q !== p && q.alive; });
    var avg = others.length ? others.reduce(function (s0, q) { return s0 + bond(S, p, q); }, 0) / others.length : 0;
    return p.tr.warmth * 0.6 + avg * 0.6 + p.tr.np * 0.2 - p.tr.cold * 0.4 > 0.2 ? 'save' : 'rule';
  }
  /* 刻限の生贄の儀で乗っ取る：{skip, bonus} … 生贄なしで逃げる／{vic} … 生贄を差し替える／null … 何もしない */
  function hijackRitual(S, h, vic) {
    var rng = S.rng, p = hijacker(S);
    if (!p) return null;
    var m = { a: p.name, g: S.G.call }, t = F(pk(S, T.HJ_TRY), m), pw = hjPower(S, p);
    if (rng() > pw) {
      t += F(pk(S, T.HJ_FAIL), m);
      ST.say(S, { actors: [p], tag: '乗っ取り', kind: 'climax', text: t, why: p.name + 'は儀式の乗っ取りに失敗した（成功の見込み ' + Math.round(pw * 100) + '％）。偽の祭主として、生贄にされる', mag: 44 });
      note(p, '村の儀式を乗っ取ろうとして失敗した');
      return { vic: p };
    }
    var it = hjIntent(S, p);
    if (it === 'save') {
      t += F(pk(S, T.HJ_SAVE), m);
      var o = ST.say(S, { actors: [p], tag: '乗っ取り', kind: 'climax', text: t, why: p.name + 'は儀式を乗っ取り、神を帰した（成功の見込み ' + Math.round(pw * 100) + '％・仲間を思う気持ち）。生贄は出ず、逃げやすくなる', mag: 50 });
      ST.key(S, o, p.name + 'が儀式を乗っ取った');
      note(p, '村の儀式を乗っ取り、神を帰した');
      return { skip: true, bonus: 0.3 };
    }
    var cands = S.P.filter(function (q) { return q !== p && al(q); }).sort(function (a, b) { return bond(S, p, a) - bond(S, p, b); });
    var nv = cands[0] || null;
    t += F(pk(S, T.HJ_RULE), m) + (nv ? F(pk(S, T.HJ_PICK), { a: p.name, b: nv.name }) : '');
    p.out = true; p.esc = h + 1; p.fate = '村に残り、新しい祭主になった';
    var o2 = ST.say(S, { actors: [p].concat(nv ? [nv] : []), tag: '乗っ取り', kind: 'climax', text: t + F(pk(S, T.HJ_STAY), m), why: p.name + 'は儀式を乗っ取り、自分が祭主になった（冷たさ）。生贄は' + p.name + 'が選んだ' + (nv ? '（' + nv.name + '：いちばん絆の薄い相手）' : ''), mag: 50 });
    ST.key(S, o2, p.name + 'が新しい祭主に');
    note(p, '村の儀式を乗っ取り、祭主になった');
    if (nv) edge(S, p, nv, '生贄に選んだ', 'kill', p);
    return { vic: nv };
  }
  /* 洞窟の封印の儀で乗っ取る：成功率の増減を返す */
  function hijackCave(S, live) {
    var rng = S.rng, p = live.filter(function (q) { return q.goal0 && q.goal0.id === 'hijack' && !q.bound; })[0];
    if (!p || rng() > 0.75) return 0;
    var it = hjIntent(S, p), m = { a: p.name, g: S.G.call };
    if (it === 'save') {
      ST.say(S, { actors: [p], tag: '乗っ取り', kind: 'climax', text: F(pk(S, T.HJ_CAVE_SAVE), m), why: p.name + 'は封印の儀を乗っ取り、神の力を自分の手に収めようとした（皆を救うため・成功率 +' + Math.round(hjPower(S, p) * 40) + '％）', mag: 40 });
      note(p, '封印の儀を乗っ取った');
      return hjPower(S, p) * 0.4;
    }
    var others = live.filter(function (q) { return q !== p; });
    var b = others.slice().sort(function (x, y) { return JS.skill(y, 'obs') - JS.skill(x, 'obs'); })[0];
    var t = F(pk(S, T.HJ_CAVE_RULE), m);
    if (b && rng() < JS.skill(b, 'obs') * 0.5 + (b.goal.id === 'solve' ? 0.15 : 0) + (b.job === 'priest' || b.job === 'folk' ? 0.2 : 0)) {
      p.bound = true; p.boundAt = '洞窟の奥'; edge(S, b, p, '止めた', 'enemy', b);
      ST.say(S, { actors: [p, b], tag: '乗っ取り', kind: 'climax', text: t + F(pk(S, T.HJ_CAVE_STOP), { a: p.name, b: b.name }) + '一行は' + p.name + 'を岩に縛りつけた。', why: b.name + 'が乗っ取りに気づいて止めた（観察）', mag: 40 });
      return 0;
    }
    ST.say(S, { actors: [p], tag: '乗っ取り', kind: 'climax', text: t, why: p.name + 'は封印の儀を、自分が神を従える儀式にすり替えた（冷たさ・成功率 -25％）', mag: 42 });
    note(p, '封印の儀を自分のためにすり替えた');
    return -0.25;
  }

  /* ---------- 事件を解決する ---------- */
  function solve(S, p, h) {
    var rng = S.rng, open = (S.cases || []).filter(function (c) { return !c.done; });
    if (rng() > (open.length ? 0.35 : 0.12)) return false;
    if (open.length) { open[0].prog = (open[0].prog || 0) + 1; ST.sayB(S, { actors: [p], tag: '捜査', text: F(pk(S, T.SOLVE_LOOK), { a: p.name }), why: p.name + 'の目標は「事件を解決する」（' + open[0].v.name + 'の死を調べている。推理が当たりやすくなる）' }, p.name + 'は現場を調べた'); return true; }
    return false;
  }

  JS.GOALX = { tick: tick, arrive: arrive, act: act, detect: detect, hijackRitual: hijackRitual, hijackCave: hijackCave, tension: tension };
})();
