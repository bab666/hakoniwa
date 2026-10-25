/* 箱庭シミュレーター: 邪神村RTA（ホラー・1〜6人）
   地図にない村に迷い込んだ住人たちが、村に祀られた神の正体を突き止め、対抗策を実行して脱出するまでを追う。
   ・神は50柱。神ごとに5つの手がかりがあり、全部そろうと対抗策が分かる（4つでも、知恵の回る人がいれば推し量れる）
   ・手がかりは種類（観察・知識・聞き込み・霊感・探索）ごとに、気質と職業で見つけやすさが変わる
   ・儀式の刻限までに解けなければ、生贄の儀が始まる。村人に襲われる、祠を壊す、偽情報の記者、仕切りたがる警察官…
   ・何時間で脱出できたかを記録する（RTA）。R18版では solo-jashin-r18.js が夜の出来事を足す */
(function () {
  'use strict';
  var HK = window.HK, ST = HK.Story, JS = HK.JASHIN, clamp = HK.clamp, M = JS && JS.MORE;
  if (!ST || !JS || !JS.GODS || !M) return;
  function L(s) { return s.split('|'); }

  var scen = {
    id: 'jashin', name: '邪神村RTA', kicker: 'ホラー・脱出（1〜6人）', solo: true, maxCast: 6, minCast: 1,
    desc: '地図にない山奥の村に迷い込んだ住人たち。村には得体の知れない神が祀られ、祭りの夜が近づいている。神の正体を示す手がかりを集め、対抗策を突き止めて、生きて村を出られるか。何時間で脱出できたかを記録する。',
    note: '※ホラー表現（死・失踪）を含みます。登場人物は、未成年の職業（高校生・令嬢・幼子）を選んだ人以外は成人として扱います。',
    unit: '時間', simulate: function (input) { return run(input); },
    castHint: '1〜6人で挑みます（多すぎると雰囲気が出ないため6人まで）。「職業」で、手がかりの見つけやすさや、できることが変わります。「目標」（恋人を作る・借金返済のために盗む・誰かを殺す・村の儀式を乗っ取る・儀式で別の神を呼ぶ・事件を解決する など）と職業の組み合わせで、振る舞いや手口が変わります。おまかせなら気質と職業から抽選し、探偵はほとんど「事件を解決する」になります。仲間の失踪や死で緊迫感が高まると、生きて帰りたい人は自分の目標より脱出や村の秘密を優先します。',
    env: [
      { id: 'god', label: '祀られている神', type: 'select', def: 'random', options: [{ v: 'random', label: 'おまかせ' }, { v: 'myth', label: 'おまかせ（神話の神から）' }, { v: 'local', label: 'おまかせ（村だけの神から）' }].concat(JS.GODS.map(function (g) { return { v: g.id, label: g.name }; })) },
      { id: 'hours', label: '儀式までの時間', min: 12, max: 72, def: 36, lo: '半日', hi: '三日', unit: '時間' },
      { id: 'hostile', label: '村人の敵意', min: 0, max: 100, def: 50, lo: '表向きは親切', hi: '隠す気がない' },
      { id: 'ev', label: '怪異の頻度', min: 0, max: 100, def: 55, lo: 'じわじわ', hi: '次から次へ' },
      { id: 'npc', label: '記者と警察官', type: 'select', def: 'random', options: [{ v: 'random', label: 'おまかせ' }, { v: 'both', label: '両方いる' }, { v: 'reporter', label: '記者だけ' }, { v: 'police', label: '警察官だけ' }, { v: 'none', label: 'どちらもいない' }] },
      { id: 'amnesia', label: '記憶を失っている人', min: 0, max: 50, def: 8, lo: 'いない', hi: '二人に一人', unit: '％', desc: '一人ずつ、この確率で記憶を失ったまま参加する' },
      { id: 'tour', label: 'シークレットツアー', type: 'select', def: 'random', options: [{ v: 'random', label: 'おまかせ（約10％）' }, { v: 'yes', label: 'ツアーにする' }, { v: 'no', label: 'ツアーにしない' }] }
    ],
    stats: [
      { id: 'luck', label: '運', desc: '襲われたときに助かる確率、霧の中で道を見つける確率に効く' },
      { id: 'stamina', label: '体力', desc: '襲われたときの抵抗、走って逃げる力、怪我への強さに効く' }
    ],
    perFields: [{ id: 'job', label: '職業', auto: 'おまかせ（気質から）', options: JS.JOBS.map(function (j) { return { id: j.id, label: j.label }; }) }],
    actions: JS.ACTIONS, goals: JS.GOALS, events: []
  };
  HK.SCENARIOS.jashin = scen;
  var at = HK.SCEN_ORDER.indexOf('zombie');
  HK.SCEN_ORDER.splice(at >= 0 ? at + 1 : HK.SCEN_ORDER.length, 0, 'jashin');

  function names(l) { return l.map(function (p) { return p.name; }).join('・'); }
  function jobOf(p) { return JS.JOB[p.job] || JS.JOB.civ; }
  function has(p, list) { return list.split(',').indexOf(p.job) >= 0; }
  /* 調べる力（0〜1くらい） */
  function skill(p, type) {
    var t = p.tr, j = jobOf(p).sk || {}, base = {
      obs: t.a * 0.45 + t.caution * 0.35, lore: t.a * 0.5 + t.cold * 0.1, talk: t.warmth * 0.45 + t.np * 0.2 + t.fc * 0.15,
      spirit: t.ac * 0.15 + t.np * 0.1, explore: t.impulse * 0.3 + t.fc * 0.25 + p.stats.stamina * 0.04, fight: t.cp * 0.2 + t.aggr * 0.2 + p.stats.stamina * 0.06, rite: t.a * 0.15 + t.cp * 0.1
    }[type] || 0;
    var adj = 0;
    if (p.amn && !p.amn.back) adj += type === 'lore' ? -0.15 : type === 'spirit' ? 0.15 : 0;
    if (p.villager && type === 'talk') adj += 0.3;
    if (p.rivalBoost && (type === 'obs' || type === 'lore' || type === 'explore')) adj += 0.08;
    /* 術者（目標で決まる）は儀式と知識に強い。儀式を乗っ取る人は、支度を重ねるほど儀式の力が増す */
    if (p.magic) adj += type === 'rite' ? 0.35 : type === 'lore' ? 0.15 : 0;
    if (p.hj && type === 'rite') adj += p.hj.pow;
    /* 無能：推理・調べる力はほぼゼロ（腕っぷしだけは人並み） */
    if (p.job === 'muno' && type !== 'fight') return clamp((base + adj) * 0.08, 0, 0.1);
    return clamp(base + (j[type] || 0) + adj - p.m.fear / 400, 0, 1.2);
  }
  function resolve(S, p, list, pick, bias) {
    if (pick && pick !== 'auto') for (var i = 0; i < list.length; i++) if (list[i].id === pick) return list[i];
    return HK.weighted(S.rng, list, function (o) { return Math.pow(Math.max(0.03, o.fit(p.tr)), 3) * (o.jobs && has(p, o.jobs) ? bias : 1) * (o.rare || 1); });
  }
  var loopTag = '';
  function label(h) { var t = 16 + h, d = Math.floor(t / 24) + 1, hh = t % 24; return loopTag + d + '日目 ' + hh + ':00（' + h + '時間経過）'; }
  function night(h) { var hh = (16 + h) % 24; return hh >= 19 || hh < 5; }
  function hm(h) { return Math.floor(h) + '時間' + (Math.round((h % 1) * 60) ? Math.round((h % 1) * 60) + '分' : ''); }
  function alive(p) { return p.alive && !p.out && !p.taken; }

  function run(input) {
    var S = ST.state(input, 'jashin'), rng = S.rng, env = S.env, P = S.P;
    /* 結果に「最も心を寄せた相手」とエゴグラムとの比較を出す（solo-story-kit.js） */
    S.egoNotes = true; S.bondFn = function (S0, a, b) { return JS.REL ? JS.REL.bond(S0, a, b) : 0; };
    loopTag = '';
    /* 神と村 */
    var pool = env.god === 'myth' ? JS.GODS.filter(function (g) { return g.myth; }) : env.god === 'local' ? JS.GODS.filter(function (g) { return !g.myth; }) : JS.GODS;
    var G = JS.GOD[env.god] || rng.pick(pool), V = rng.pick(JS.VILLAGES);
    S.G = G; S.V = V; S.found = []; S.fake = 0; S.deadline = env.hours; S.hostile = env.hostile; S.solved = false; S.partial = false; S.hold = 0; S.shrine = 0;
    var tour = env.tour === 'yes' || (env.tour === 'random' && rng() < 0.1), tourT = rng.pick(JS.TOURS);
    var npcs = env.npc === 'random' ? rng.pick(['both', 'reporter', 'police', 'none', 'both', 'reporter']) : env.npc;
    S.reporter = npcs === 'both' || npcs === 'reporter' ? { alive: true, met: 0 } : null;
    S.police = npcs === 'both' || npcs === 'police' ? { alive: true, n: 0 } : null;
    P.forEach(function (p) {
      var pc = (input.perChar && input.perChar[p.i]) || {};
      var jp = (pc.pick || {}).job;
      /* 魔術師は職業から外した（以前のデータはオカルト研究家＋儀式の目標として読む） */
      var legacyMage = jp === 'mage'; if (legacyMage) jp = 'occult';
      p.job = JS.JOB[jp] ? jp : HK.weighted(rng, JS.JOBS.filter(function (j) { return !j.minor && JS.JOB_FIT[j.id]; }), function (j) { return Math.pow(Math.max(0.05, JS.JOB_FIT[j.id](p.tr)), 2.5); }).id;
      p.minor = (JS.JOB[p.job] && JS.JOB[p.job].minor) || '';
      p.jobAuto = !JS.JOB[jp];
      p.action = resolve(S, p, JS.ACTIONS, pc.action, 2.2); p.goal = resolve(S, p, JS.GOALS, pc.goal, 2.2);
      var gAuto = !pc.goal || pc.goal === 'auto';
      if (gAuto && legacyMage) p.goal = JS.GOAL[rng() < 0.6 ? 'ritual' : 'meet'];
      /* 幼子は恋人を作ろうとしない */
      if (p.minor === 'child' && p.goal && p.goal.id === 'love') p.goal = JS.GOAL.escape || p.goal;
      /* 探偵は、おまかせならほとんど「事件を解決する」 */
      else if (gAuto && /^(detective|sleuth|ponkotsu)$/.test(p.job) && rng() < 0.85) p.goal = JS.GOAL.solve;
      p.goal0 = p.goal; p.surv = p.goal.surv != null ? p.goal.surv : 1;
      /* 術を使える人：儀式を企む人・乗っ取る人、神を見たい霊能者・神職・オカルト研究家 */
      p.magic = p.goal.id === 'ritual' || p.goal.id === 'hijack' || (p.goal.id === 'meet' && /^(occult|psychic|priest)$/.test(p.job));
      p.reason = tour ? tourT : HK.weighted(rng, JS.REASONS, function (r) { return Math.pow(Math.max(0.05, r.fit(p.tr)), 2) * (r.jobs.indexOf(p.job) >= 0 ? 4 : 1); }).t;
      p.alive = true; p.out = false; p.taken = false; p.esc = null; p.foresee = !!jobOf(p).foresee;
      p.m = { fear: 8 + p.tr.ac * 12, hp: 55 + p.stats.stamina * 9, clue: 0 };
      p.cnt = { clue: 0, scare: 0, attack: 0, trap: 0 };
      p.roleLabel = jobOf(p).label;
      p.viol = 0; p.bound = false; p.prank = false;
    });
    setupPlus(S);
    JS.REL.setup(S, input);
    if (JS.SPEC) JS.SPEC.setup(S, input);
    /* 役職×役職の特別な出来事（jashin-duo.js） */
    if (JS.DUO) JS.DUO.setup(S);
    var keys = ['fear', 'hp', 'clue'];

    /* ---------- 到着 ---------- */
    ST.step(S, '到着　' + label(0));
    ST.say(S, { kind: 'phase', text: (tour ? '一行は、' + tourT + 'の参加者だった。マイクロバスが止まった先は――' : '') + '山道の先に、地図にない村があった。' + V + '。' + ST.fmt(ST.pick(S, JS.WELCOME), { v: V }) });
    P.forEach(function (p) {
      if (p.amn) return JS.REL.amnArrive(S, p);
      ST.say(S, { actors: [p], tag: '来た理由', text: p.name + '（' + jobOf(p).label + (p.spec ? '・' + HK.Special.LABEL[p.spec] : '') + '）がこの村に来たのは――' + p.reason + '。最初は「' + p.action.label + '」' + (p.goal.secret ? '。目標は、誰にも話さなかった。' : '、目標は「' + p.goal.label + '」。'), why: (p.goal.secret ? '本当の目標「' + p.goal.label + '」（周りには隠している）。' : '') + (tour ? 'シークレットツアー（全員が同じ理由）' : '理由は気質と職業から抽選') + '／職業：' + jobOf(p).label + (p.jobAuto ? '（気質から）' : '') + '・' + jobOf(p).desc });
    });
    ST.say(S, { kind: 'phase', tag: '村の様子', text: G.look + '村人たちは、祀っている神を「' + G.call + '」と呼んでいた。' + (S.ygo ? ST.pick(S, M.YGO_START) : '') });
    arrivePlus(S);
    if (JS.LOOP) JS.LOOP.arrive(S);
    if (JS.GOALX) JS.GOALX.arrive(S);
    if (JS.UNPC) JS.UNPC.arrive(S);
    JS.REL.arrive(S);
    if (S.reporter) ST.say(S, { tag: '記者', text: '民宿には先客がいた。' + JS.REPORTER.name + 'だと名乗る男は、一行を見るなり嬉しそうに手帳を開いた。「いやあ、仲間がいて心強い。この村のことなら、何でも聞いてください」', why: '混乱要素：この記者は偽の情報を持ち込む' });
    if (S.police) ST.say(S, { tag: '警察官', text: '村の駐在所から、制服の警察官が出てきた。「よそ者の方ですね。祭りの間は、私の指示に従ってもらいます」', why: '混乱要素：場を仕切りたがる警察官' });
    if (JS.R18 && JS.R18.on(S)) JS.R18.arrive(S);
    ST.snap(S, keys);

    /* ---------- 時間の流れ（2時間ずつ）。時が巻き戻ったら、到着からもう一周（jashin-loop.js） ---------- */
    var h = 0, end = null;
    for (;;) {
    while (!end) {
      h += 2;
      S.h = h;
      /* 不死・吸血鬼は、死んでも蘇る（jashin-special.js） */
      if (JS.SPEC) JS.SPEC.revive(S);
      var live = P.filter(alive);
      if (!live.length) { end = 'none'; break; }
      if (h >= S.deadline) { end = 'ritual'; break; }
      ST.step(S, label(h));
      ST.budget(S, 3 + Math.ceil(live.length / 2));
      if (rng() < 0.4) ST.say(S, { kind: 'phase', text: ST.fmt(ST.pick(S, night(h) ? JS.ATMOS.night : JS.ATMOS.day), { v: V }) });
      /* 呪い・取り憑き */
      live.forEach(function (p) { tickCurse(S, p, h); });
      /* NPC */
      npcTurn(S, live, h);
      tickPlus(S, P.filter(alive), h);
      JS.REL.tick(S, P.filter(alive), h);
      if (JS.DUO) JS.DUO.tick(S, P.filter(alive), h);
      if (JS.GOALX) JS.GOALX.tick(S, P.filter(alive), h);
      if (JS.GODEV) JS.GODEV.tick(S, P.filter(alive), h);
      if (JS.LOOP) JS.LOOP.tick(S, P.filter(alive), h);
      /* 村の歓迎の宴（一度だけ。酒の強さで過ごし方が変わる。jashin-feast.js） */
      if (JS.FEAST) JS.FEAST.tick(S, P.filter(alive), h);
      /* 住人ごとの一時間 */
      live = P.filter(alive);
      live.forEach(function (p) {
        if (!alive(p) || p.bound) return;
        /* 発狂中は動けない。そのぶん死の罠や村人の襲撃を引きやすい（jashin-special.js） */
        if (JS.SPEC && JS.SPEC.mad(p)) {
          var dg = JS.SPEC.danger(p);
          if (rng() < trapRate(S, p, h) * dg * HK.Dark.f(S, 'kill')) return trap(S, p, P.filter(alive), false);
          if (rng() < (S.hostile / 100) * (night(h) ? 0.16 : 0.05) * dg * (S.shrineRage ? 1.8 : 1) * HK.Dark.f(S, 'raid')) return attack(S, p, live);
          return JS.SPEC.act(S, p);
        }
        /* 渇いた吸血鬼は、ほかのことより先に血を求める */
        if (JS.SPEC && JS.SPEC.act(S, p)) return;
        if (JS.R18 && JS.R18.on(S) && night(h) && JS.R18.night(S, p, P.filter(alive), h)) return;
        if (JS.MUNO && JS.MUNO.act(S, p, h, P.filter(alive))) return;
        var evp = env.ev / 100;
        var r = rng();
        if (rng() < trapRate(S, p, h) * HK.Dark.f(S, 'kill')) return trap(S, p, P.filter(alive), false);
        if (r < evp * 0.25) return S.FX && rng() < 0.5 ? godHorror(S, p) : scare(S, p);
        if (r < evp * 0.25 + 0.05 && !S.shrine && (p.goal.id === 'deny' || p.prank || p.tr.impulse > 0.6 || p.goal.id === 'content' || rng() < 0.15)) return shrine(S, p);
        if (night(h) && rng() < (S.hostile / 100) * 0.16 * (p.action.id === 'alone' || p.goal.id === 'content' ? 1.8 : 1) * (S.shrineRage ? 1.8 : 1) * HK.Dark.f(S, 'raid')) return attack(S, p, live);
        if ((p.goal.id === 'escape' || p.m.fear > 80) && rng() < 0.12) return escape(S, p, h);
        if (JS.GOALX && JS.GOALX.act(S, p, h, P.filter(alive))) return;
        if (JS.MAGE && JS.MAGE.act(S, p, h, P.filter(alive))) return;
        if (S.hold > 0 && rng() < 0.7) return ST.sayB(S, { actors: [p], text: p.name + 'は公民館で待機させられていた。窓の外を、村人が何度も通り過ぎた。', why: '警察官の指示で待機' }, p.name + 'は待機');
        investigate(S, p, h);
      });
      if (S.hold > 0) S.hold--;
      if (S.forceEnd) { end = 'forced'; break; }
      ST.flushShort(S, 'ほかに：');
      /* 手がかりがそろった */
      if (!S.solved && S.found.length >= G.clues.length) solve(S, false);
      else if (!S.solved && S.found.length >= G.clues.length - 1 && S.deadline - h <= 8) {
        var wise = P.filter(alive).sort(function (a, b) { return skill(b, 'lore') - skill(a, 'lore'); })[0];
        if (wise && rng() < skill(wise, 'lore') * 0.9) solve(S, true, wise);
      }
      if (!S.solved && S.found.length >= G.clues.length - 2 && S.deadline - h <= 16) {
        var sl = P.filter(function (q) { return alive(q) && !q.bound && q.job === 'sleuth'; })[0];
        if (sl && rng() < 0.22 + skill(sl, 'obs') * 0.15) { ST.say(S, { actors: [sl], tag: '推理', text: ST.fmt(ST.pick(S, JS.RELT.SLEUTH_INFER), { a: sl.name }), why: '名探偵は、手がかりが二つ足りなくても推理で埋められる', mag: 20 }); solve(S, true, sl); }
      }
      P.forEach(function (p) { if (alive(p)) { p.m.fear = clamp(p.m.fear + (night(h) ? 3 : 1), 0, 100); p.m.clue = p.cnt.clue; } });
      if (JS.SPEC) JS.SPEC.wear(S, P.filter(alive));
      ST.snap(S, keys);
      if (S.solved) { end = 'climax'; break; }
    }
    if (S.alien && (end === 'climax' || end === 'ritual')) JS.LOOP.alienEnd(S, end === 'ritual' ? S.deadline : h);
    else if (end === 'climax') climax(S, h);
    else if (end === 'ritual') ritual(S, S.deadline);
    if (S.rewind && JS.LOOP && JS.LOOP.restart(S)) { h = 0; end = null; loopTag = '二周目 '; continue; }
    break;
    }
    if (JS.SPEC) JS.SPEC.revive(S);
    if (JS.GODEV) JS.GODEV.end(S, end);
    if (JS.UNPC) JS.UNPC.end(S, end);
    P.forEach(function (p) { if (p.goal0) p.goal = p.goal0; });
    return finish(S, input);
  }

  /* ---------- 調べる ---------- */
  var TYPE_JP = { obs: '観察', lore: '知識', talk: '聞き込み', spirit: '霊感', explore: '探索' };
  var FIND_LEAD = {
    obs: L('{a}は、ふと気づいた。|{a}の目が、ある一点で止まった。|{a}は手帳をめくりながら、違和感の正体に気づいた。'),
    lore: L('{a}は古い記録を読み解いた。|{a}は碑文の崩れた文字を、指でなぞりながら読んだ。|{a}は記憶の中の文献と、目の前のものを照らし合わせた。'),
    talk: L('{a}が話しかけると、村の子どもがこっそり教えてくれた。|{a}は民宿の女将と世間話をするうちに、聞き出した。|{a}に心を許した村の若者が、声をひそめて言った。'),
    spirit: L('{a}の背筋に冷たいものが走った。|{a}は目を閉じ、気配を探った。|{a}にだけ、それが見えた。'),
    explore: L('{a}は立ち入りを禁じられた道に、こっそり踏み込んだ。|{a}は夜明け前の村を、一人で歩き回った。|{a}は神社の裏手の藪をかき分けた。')
  };
  function investigate(S, p, h) {
    var rng = S.rng, G = S.G;
    var left = G.clues.filter(function (c, k) { return S.found.indexOf(k) < 0; });
    if (!left.length) return;
    /* 初動の得意な種類を優先して、残っている手がかりから一つ */
    var c = HK.weighted(rng, left, function (x) { return 0.3 + skill(p, x.type) + (x.type === p.action.type ? 0.5 : 0); });
    var nAll = S.P.length, sk = skill(p, c.type), ch = (0.07 + sk * 0.42) * (1.5 - nAll * 0.13) + (p.goal.id === 'truth' ? 0.08 : 0) + (night(h) && c.type === 'spirit' ? 0.08 : 0);
    if (rng() < ch) {
      var k = G.clues.indexOf(c);
      S.found.push(k); p.cnt.clue++;
      if (c.type === 'spirit') p.m.fear = clamp(p.m.fear + 8, 0, 100);
      var o = ST.say(S, { actors: [p], tag: '手がかり ' + S.found.length + '/' + G.clues.length, text: ST.fmt(ST.pick(S, FIND_LEAD[c.type]), { a: p.name }) + c.t + '。', why: TYPE_JP[c.type] + 'の手がかり（' + p.name + 'の' + TYPE_JP[c.type] + 'の力 ' + Math.round(sk * 100) + (jobOf(p).sk && jobOf(p).sk[c.type] ? '・職業の補正あり' : '') + '）', mag: 18 });
      if (S.found.length === 1) ST.key(S, o, '最初の手がかり');
      return;
    }
    /* 空振り。危ない場所に踏み込むほど、恐怖が増える */
    p.m.fear = clamp(p.m.fear + (c.type === 'explore' ? 4 : 2), 0, 100);
    ST.sayB(S, { actors: [p], text: p.name + 'は' + { obs: '村の様子をうかがった', lore: '古い記録を探した', talk: '村人に話を聞こうとした', spirit: '気配を探った', explore: '村を歩き回った' }[p.action.type] + ST.pick(S, L('が、何も分からなかった。|が、村人にはぐらかされた。|が、肝心なところで誰かの視線に気づいて引き返した。|。何かがおかしい気はするのに、言葉にできなかった。')), why: '' }, p.name + 'は空振り');
  }

  /* ---------- 定番の怖い出来事 ---------- */
  function scare(S, p) {
    p.cnt.scare++;
    p.m.fear = clamp(p.m.fear + (p.prank ? 4 : 10) + (p.job === 'psychic' ? 6 : 0) - p.tr.cp * 4, 0, 100);
    var t = ST.fmt(ST.pick(S, JS.SCARE), { a: p.name }) + (p.prank ? ST.fmt(ST.pick(S, M.PRANK_ACT), { a: p.name }) : ST.fmt(ST.pick(S, JS.SCARE_REACT[p.top] || JS.SCARE_REACT.NP), { a: p.name }));
    ST.sayB(S, { actors: [p], tag: '怪異', text: t, why: '恐怖 ' + Math.round(p.m.fear), mag: 10 }, p.name + 'は怪異に遭った');
    if (p.m.fear >= 90 && S.rng() < 0.4 * HK.Dark.f(S, 'madness')) {
      p.panic = true;
      ST.say(S, { actors: [p], tag: '錯乱', text: p.name + 'は悲鳴を上げて民宿を飛び出し、闇の中へ走っていった。', why: '恐怖が限界を超えた（' + Math.round(p.m.fear) + '）', mag: 24 });
      p.action = JS.ACTIONS.filter(function (a) { return a.id === 'alone'; })[0];
    }
  }

  /* ---------- 祠を壊す ---------- */
  function shrine(S, p) {
    var rng = S.rng; S.shrine = 1;
    var fx = HK.weighted(rng, JS.SHRINE_FX, function (f) { return f.w; });
    var t = ST.fmt(ST.pick(S, JS.SHRINE_BREAK), { a: p.name }) + ST.pick(S, JS.SHRINE_SCOLD) + ST.fmt(ST.pick(S, fx.t), { a: p.name });
    if (fx.id === 'curse') p.curse = S.h;
    if (fx.id === 'rage') { S.hostile = clamp(S.hostile + 35, 0, 100); S.shrineRage = true; }
    if (fx.id === 'wake') S.deadline = Math.max(S.h + 4, S.deadline - 8);
    if (fx.id === 'clue') { var k = S.G.clues.map(function (c, i) { return i; }).filter(function (i) { return S.found.indexOf(i) < 0; })[0]; if (k != null) { S.found.push(k); p.cnt.clue++; t += '――' + S.G.clues[k].t + '。'; } }
    if (fx.id === 'possess') p.possessed = true;
    if (fx.id === 'seal') S.sealBonus = 0.12;
    p.m.fear = clamp(p.m.fear + 12, 0, 100);
    var o = ST.say(S, { actors: [p], tag: '祠', text: t, why: '祠を壊した（' + (p.goal.id === 'deny' ? '迷信だと証明したかった' : p.tr.impulse > 0.6 ? '衝動性が高い' : '不運') + '）→ ' + fx.why, mag: 32 });
    ST.key(S, o, p.name + 'が祠を壊した');
  }
  function tickCurse(S, p, h) {
    if (p.curse != null && h - p.curse >= 8 && S.rng() < 0.18 * HK.Dark.f(S, 'kill')) {
      var save = P0(S).filter(function (q) { return alive(q) && q !== p && (q.job === 'priest' || q.job === 'psychic' || q.magic); })[0];
      if (save && S.rng() < 0.6) { p.curse = null; ST.say(S, { actors: [save, p], tag: 'お祓い', text: save.name + 'は' + p.name + 'の首の痣に手を当て、長い祝詞を唱えた。痣は、少しずつ薄れていった。', why: save.name + '（' + jobOf(save).label + '）が呪いを祓った', mag: 18 }); return; }
      die(S, p, '祠の呪いで', L('{a}の首の痣が、ついに喉元まで這い上がった。{a}は声も出せずに崩れ落ちた。|朝、{a}は布団の中で冷たくなっていた。首には、くっきりと手の形の痣が残っていた。'));
    }
    if (p.possessed && S.rng() < 0.12) {
      p.m.fear = clamp(p.m.fear + 5, 0, 100);
      ST.sayB(S, { actors: [p], tag: '憑依', text: p.name + 'は夜中にふらりと起き上がり、神社の方へ歩いていこうとした。仲間が慌てて引き止めた。', why: '取り憑かれている' }, p.name + 'がうろついた');
    }
  }
  function P0(S) { return S.P; }

  /* ---------- 村人に襲われる ---------- */
  function attack(S, p, live) {
    var rng = S.rng; p.cnt.attack++;
    var near = live.filter(function (q) { return q !== p && alive(q) && !q.bound && (p.action.id !== 'alone' || JS.REL.bond(S, q, p) >= 0.7) && JS.REL.near(S, p, q); });
    var helper = near.sort(function (a, b) { return skill(b, 'fight') - skill(a, 'fight'); })[0];
    var def = skill(p, 'fight') + p.stats.luck * 0.05 + (helper ? skill(helper, 'fight') * 0.6 + 0.15 : 0) + (p.goal.id === 'protect' ? 0.05 : 0);
    var t = ST.fmt(ST.pick(S, JS.ATTACK), { a: p.name });
    def = HK.Dark.live(S, def, 'raid');   /* 展開の重さ（mood-dial.js）：抵抗できる見込み */
    if (JS.MAGE && JS.MAGE.defend(S, p, live, t)) return;
    var roll = rng() * 1.1;
    if (p.foresee && roll > def) { p.foresee = false; return ST.say(S, { actors: [p], tag: '予見', text: t + '――しかし{a}は、昼間の占いで見た光景を思い出していた。{a}は一歩早く身をかわし、闇に紛れて逃げ延びた。'.replace(/\{a\}/g, p.name), why: '占い師の予見が、一度だけ危険を避けさせた', mag: 24 }); }
    if (roll < def) {
      p.m.hp = clamp(p.m.hp - 10, 0, 100); p.m.fear = clamp(p.m.fear + 12, 0, 100);
      return ST.say(S, { actors: helper ? [p, helper] : [p], tag: '襲撃', text: t + ST.fmt(ST.pick(S, JS.ATTACK_OK), { a: p.name, b: helper ? helper.name : '仲間' }), why: '抵抗できた（腕っぷし・運' + (helper ? '・' + helper.name + 'の助け' : '') + '）', mag: 22 });
    }
    if (JS.REL.shield(S, p, live, t)) return;
    if (rng() < 0.55) {
      p.taken = true; p.takenAt = S.h;
      var o = ST.say(S, { actors: [p], tag: '連れ去り', text: t + ST.fmt(ST.pick(S, JS.ATTACK_TAKEN), { a: p.name }), why: '村人に連れ去られた（生贄の候補にされた）。儀式の前に対抗策を実行できれば、助け出せる', mag: 34 });
      return ST.key(S, o, p.name + 'が連れ去られた');
    }
    die(S, p, '村人に襲われて', JS.ATTACK_DIE, t);
  }
  function die(S, p, how, pool, pre) {
    p.alive = false; p.fate = '死亡（' + hm(S.h) + '）'; p.how = how;
    var o = ST.say(S, { actors: [p], tag: '死', kind: 'climax', text: (pre || '') + ST.fmt(ST.pick(S, pool), { a: p.name }), why: how + '命を落とした', mag: 46 });
    ST.key(S, o, p.name + 'の死');
    prankReal(S, p);
    JS.REL.onDeath(S, p);
    if (JS.MUNO) JS.MUNO.onDeath(S, p);
  }

  /* ---------- 早い脱出の試み（RTA） ---------- */
  function escape(S, p, h) {
    var ok = S.rng() < 0.04 + Math.min(0.1, (S.fog || 0) * 0.04) + p.stats.luck * 0.025 + (night(h) ? -0.02 : 0.03) + (p.job === 'student' ? 0.02 : 0);
    if (ok && JS.REL.stay(S, p)) return;
    if (ok) {
      p.out = true; p.esc = h - 1 + S.rng() * 2; p.fate = '単独で脱出（' + hm(p.esc) + '）';
      var o = ST.say(S, { actors: [p], tag: '脱出', kind: 'climax', text: ST.fmt(ST.pick(S, JS.ESCAPE_OK), { a: p.name }) + '――' + p.name + 'は仲間を残して村を出た。', why: '運（' + p.stats.luck + '）で抜け道を見つけた。目標「' + p.goal.label + '」', mag: 40 });
      return ST.key(S, o, p.name + 'が単独で脱出（' + hm(p.esc) + '）');
    }
    p.m.fear = clamp(p.m.fear + 8, 0, 100); p.m.hp = clamp(p.m.hp - 4, 0, 100);
    ST.sayB(S, { actors: [p], tag: '脱出失敗', text: ST.fmt(ST.pick(S, JS.ESCAPE_TRY), { a: p.name }), why: '村からは、まだ出られない' }, p.name + 'の脱出は失敗');
  }

  /* ---------- 記者と警察官 ---------- */
  function npcTurn(S, live, h) {
    var rng = S.rng;
    if (S.reporter && S.reporter.alive && rng() < 0.16 && S.reporter.met < 2) {
      S.reporter.met++;
      var tgt = rng.pick(live), line = ST.pick(S, JS.REPORTER.lines);
      var sharp = live.slice().sort(function (a, b) { return skill(b, 'obs') + skill(b, 'lore') - skill(a, 'obs') - skill(a, 'lore'); })[0];
      var debunk = sharp && rng() < (skill(sharp, 'obs') + skill(sharp, 'lore')) * 0.45 + (sharp.job === 'detective' ? 0.25 : sharp.job === 'sleuth' ? 0.4 : sharp.job === 'ponkotsu' ? -0.3 : 0);
      if (tgt.job === 'ponkotsu') debunk = false;
      if (debunk) ST.say(S, { actors: [tgt, sharp], tag: '偽情報', text: '記者が' + tgt.name + 'に耳打ちした。' + line + '――' + sharp.name + 'は首を振った。「その話、どこで聞いたんです？　出典がない。信じない方がいい」', why: sharp.name + 'が偽の情報を見抜いた（観察・知識' + (sharp.job === 'detective' ? '・探偵' : '') + '）', mag: 14 });
      else { S.fake++; ST.say(S, { actors: [tgt], tag: '偽情報', text: '記者が' + tgt.name + 'に耳打ちした。' + line + (tgt.job === 'ponkotsu' ? ST.fmt(ST.pick(S, JS.RELT.PONK_BELIEVE), { a: tgt.name }) : '') + '――一行は、その話を半ば信じてしまった。', why: '偽の情報を信じた（対抗策を実行するときに不利になる）', mag: 14 }); }
    }
    if (S.police && S.police.alive && rng() < 0.2) {
      S.police.n++;
      var line2 = ST.pick(S, JS.POLICE.lines), cop = live.filter(function (q) { return q.job === 'police'; })[0];
      if (/待機/.test(line2)) S.hold = 1;
      if (cop && rng() < 0.6) ST.say(S, { actors: [cop], tag: '警察官', text: '駐在の警察官が言った。' + line2 + '――' + cop.name + 'が警察手帳を見せた。「同業者として言わせてもらいますが、それは悪手です」二人の警察官は、しばらく睨み合った。', why: '仕切りたがる警察官と、住人の警察官の衝突', mag: 12 });
      else ST.say(S, { tag: '警察官', text: '駐在の警察官が言った。' + line2 + (S.hold ? '――一行は、しぶしぶ公民館に集められた。' : ''), why: '場を仕切りたがる警察官' + (S.hold ? '（次の時間は調べにくくなる）' : ''), mag: 10 });
      if (S.police.n >= 3 && night(h) && rng() < 0.4) { S.police.alive = false; ST.say(S, { tag: '警察官', text: '「村長に話をつけてくる」と出ていった駐在の警察官は、それきり戻らなかった。翌朝、駐在所には制帽だけが残されていた。', why: '仕切りたがる警察官の末路', mag: 20 }); }
    }
    if (JS.UNPC) JS.UNPC.tick(S, live, h);
  }

  /* ---------- 対抗策が判明 ---------- */
  function solve(S, partial, who) {
    S.solved = true; S.partial = partial;
    var lead = who || S.P.filter(alive).sort(function (a, b) { return skill(b, 'lore') - skill(a, 'lore'); })[0];
    var o = ST.say(S, { actors: lead ? [lead] : [], tag: '対抗策', text: (lead ? lead.name + 'は集めた手がかりを並べ、顔を上げた。「分かった。この村の神は――' + S.G.name + 'だ」' : '手がかりがそろった。この村の神は、' + S.G.name + 'だ。') + '対抗策は、' + S.G.sol + '。' + (partial ? '（手がかりは一つ足りない。推測で補った）' : ''), why: partial ? '手がかり ' + S.found.length + '/' + S.G.clues.length + '。' + (lead ? lead.name + 'の知識で残りを推し量った' : '') : '手がかりが全部そろった', mag: 36 });
    ST.key(S, o, '対抗策が判明');
  }

  /* クライマックス（洞窟）は jashin-cave.js */
  function climax(S, h) { JS.CAVE.climax(S, h); }
  /* ---------- 刻限：生贄の儀 ---------- */
  function ritual(S, h) {
    ST.step(S, '生贄の儀　' + label(h));
    var rng = S.rng, cand = S.P.filter(function (p) { return p.alive && p.taken; });
    var live = S.P.filter(alive);
    var vic = cand[0] || live.filter(function (p) { return p.villager && rng() < 0.6; })[0] || live.filter(function (p) { return p.goal.id === 'meet' && rng() < 0.5; })[0] || (live.length ? live.slice().sort(function (a, b) { return a.stats.luck + a.stats.stamina - b.stats.luck - b.stats.stamina; })[0] : null);
    ST.say(S, { kind: 'phase', text: '儀式の刻限が来た。村中の提灯に、一斉に火が入った。手がかりは' + S.found.length + '/' + S.G.clues.length + '。対抗策は、分からないままだった。' });
    /* 企む魔術師は、刻限を過ぎても別の神を呼ぶ */
    if (JS.MAGE && JS.MAGE.ritualSummon(S, h) && vic && (!vic.alive || vic.plot)) {
      live = S.P.filter(alive);
      vic = S.P.filter(function (p) { return p.alive && p.taken; })[0] || live.filter(function (p) { return !p.plot; }).sort(function (a, b) { return a.stats.luck - b.stats.luck; })[0] || null;
    }
    if (vic && !vic.alive) vic = null;
    /* 連れ去られていなければ、隠れてやり過ごせることもある（運・慎重さ） */
    if (vic && !vic.taken && rng() < HK.Dark.live(S, vic.stats.luck * 0.07 + vic.tr.caution * 0.25, 'kill')) {
      ST.say(S, { actors: [vic], tag: '隠れる', text: vic.name + 'は床下に潜り込み、息を殺した。松明の明かりが、すぐそばを何度も通り過ぎていった。――生贄の座は、空いたままになった。', why: '運と慎重さで、生贄に選ばれるのを逃れた', mag: 30 });
      vic = null;
    }
    /* 儀式を乗っ取る人（jashin-goals.js）：生贄を止める／自分の手で選び直す */
    if (JS.GOALX) { var hj = JS.GOALX.hijackRitual(S, h, vic); if (hj) { if (hj.skip) { S.fleeBonus = (S.fleeBonus || 0) + (hj.bonus || 0); flee(S, h + 1); return; } if (hj.vic !== undefined) vic = hj.vic; } }
    if (vic && vic.taken && HK.Dark.skip(S, 'kill')) { vic.taken = false; vic.out = true; vic.esc = h; vic.fate = '逃げ延びた（' + hm(h) + '）'; ST.say(S, { actors: [vic], tag: '救出', text: '祭壇へ引き出される直前、' + vic.name + 'の縄がゆるんだ。' + vic.name + 'は松明の列の隙間をすり抜け、闇の中へ転がり出た。そのまま、山道を駆け下りた。', why: '見張りの隙を突いて逃れた（展開の重さ：穏やか）', mag: 30 }); vic = null; }   /* 展開の重さ（mood-dial.js） */
    if (vic) sacrifice(S, vic, h);
    if (JS.CAVE.manifest(S, h, (vic ? 0.32 : 0.15) + S.P.length * 0.03)) return;
    flee(S, h + 1);
  }
  function sacrifice(S, vic, h) {
    if (!vic) return;
    var orig = vic; vic = JS.REL.substitute(S, vic);
    vic.alive = false; vic.taken = false; vic.fate = '生贄（' + hm(h) + '）' + (vic !== orig ? '・' + orig.name + 'の身代わり' : '');
    var r18 = JS.R18 && JS.R18.on(S) ? JS.R18.ritual(S, vic) : null;
    /* r18:begin */
    if (r18 && r18.miko) vic.fate = '神の子を産む巫女になった（' + hm(h) + '）';
    /* r18:end */
    var o = ST.say(S, { actors: [vic], tag: '生贄', kind: 'climax', text: (r18 ? r18.text : vic.name + 'は白い着物を着せられ、祭壇の前に引き出された。' + S.G.rite + '。――' + vic.name + 'の姿は、それきり誰の目にも映らなかった。'), why: vic.name + 'が生贄に選ばれた' + (vic !== orig ? '（' + orig.name + 'の身代わりになった）' : vic.villager ? '（村の出身だった）' : vic.takenAt != null ? '（連れ去られていた）' : '（運と体力が最も低かった）'), mag: 52 });
    ST.key(S, o, vic.name + 'が生贄になった');
  }
  function flee(S, h) {
    var rng = S.rng, ok = [], ng = [];
    S.P.filter(alive).forEach(function (p) {
      if (p.bound) return die(S, p, '縛られたまま', [(p.boundAt || '民宿') + 'に取り残された{a}は、縛られたまま身をよじった。祭り囃子が近づいてきても、もう、どうすることもできなかった。']);
      (rng() < HK.Dark.pick(S, 0.6, 0, -0.2) + HK.Dark.live(S, (S.inCave ? 0.24 : 0.33) + (S.fleeBonus || 0) + (S.fog ? 0.06 : 0) + p.stats.luck * 0.07 + p.stats.stamina * 0.04 - p.m.fear / 400, 'kill') ? ok : ng).push(p);
    });
    /* 逃げ遅れた大事な人のために、引き返す */
    var saved = JS.REL.goBack(S, ng, ok);
    ok.concat(saved).forEach(function (p) {
      if (p.goBackDie) return die(S, p, '引き返して', L('{a}は、二度と霧の中から出てこなかった。'));
      p.out = true; p.esc = h + rng() * 3; p.fate = '逃げ延びた（' + hm(p.esc) + '）';
      if (saved.indexOf(p) < 0) ST.say(S, { actors: [p], tag: '逃走', text: p.name + 'は儀式の混乱に紛れて、山道を転がるように駆け下りた。背後で、村の歌声がいつまでも続いていた。', why: '運と体力で逃げ切った', mag: 30 });
    });
    ng.filter(function (p) { return saved.indexOf(p) < 0; }).forEach(function (p) {
      die(S, p, '儀式の夜に', L('{a}は山道の途中で、村人たちの松明に囲まれた。|{a}は霧の中で道を見失い、気づくと祭壇の前に戻っていた。|{a}の足を、地面から伸びた何かが掴んだ。'));
    });
  }

  /* ---------- 追加：大物のドッキリ・魔術師のたくらみ・イゴーロナク ---------- */
  function setupPlus(S) {
    var rng = S.rng, P = S.P;
    S.FX = JS.FX && JS.FX[S.G.id]; S.trapUsed = []; S.horUsed = [];
    S.ygo = S.G.id === 'ygolonac';
    if (S.ygo) S.hostile = clamp(S.hostile + 20, 0, 100);
    P.forEach(function (p) {
      var t = p.tr;
      if (p.job === 'celeb' && rng() < clamp(0.35 + t.np * 0.3 + t.fc * 0.2 - t.caution * 0.3 - t.a * 0.2, 0.1, 0.9)) { p.prank = true; p.prankOnce = true; }
      if (p.goal.id === 'ritual' && P.length >= 2) {
        var cs = M.COUNTER.filter(function (c) { return c.n !== S.G.name; });
        p.plot = { kills: 0, need: P.length >= 4 && rng() < 0.5 ? 2 : 1, god: rng.pick(cs) };
      }
    });
  }
  function arrivePlus(S) {
    S.P.forEach(function (p) {
      if (p.prank) ST.say(S, { actors: [p], tag: 'ドッキリ？', text: ST.fmt(ST.pick(S, M.PRANK_START), { a: p.name }), why: p.name + '（大物）は、これを誰かが仕込んだドッキリだと思い込んだ（怖がりにくいが、無茶をする）', mag: 14 });
      if (p.plot) ST.say(S, { actors: [p], tag: '企み', text: ST.fmt(ST.pick(S, M.MAGE_HINT), { a: p.name }), why: '儀式を企む' + p.name + 'は、仲間を生贄にして別の神（' + p.plot.god.n + '）を呼ぶつもりでいる（必要な生贄 ' + p.plot.need + '人）。冷たさ・攻撃性が高いほど企む', mag: 12 });
    });
  }
  function prankReal(S, dead) {
    S.P.forEach(function (q) {
      if (!q.prank || !alive(q) || q === dead) return;
      q.prank = false; q.m.fear = clamp(q.m.fear + 30, 0, 100);
      ST.say(S, { actors: [q], tag: 'ドッキリ？', text: ST.fmt(ST.pick(S, M.PRANK_REAL), { a: q.name }), why: dead.name + 'の死で、' + q.name + 'はようやくこれが本物だと悟った（恐怖 +30）', mag: 20 });
    });
  }
  function tickPlus(S, live, h) {
    var rng = S.rng;
    /* 魔術師が、条件を整えるために仲間を殺す */
    live.forEach(function (m) {
      if (!m.plot || !alive(m) || m.bound || m.plot.kills >= m.plot.need) return;
      if (rng() > (night(h) ? 0.16 + (m.plot.ready ? 0.16 : 0) : 0.04 + (m.plot.ready ? 0.04 : 0))) return;
      m.plot.ready = 0;
      var vs = live.filter(function (q) { return q !== m && alive(q) && !q.bound && !JS.REL.spare(S, m, q); });
      if (!vs.length) return;
      var v = HK.weighted(rng, vs, function (q) { return 1 + (q.action.id === 'alone' ? 1.5 : 0) + (5 - q.stats.luck) * 0.2; });
      m.plot.kills++;
      S.killer = m; if (JS.DRAMA) JS.DRAMA.edge(S, m, v, '殺害', 'kill', m);
      die(S, v, '何者かに殺されて', [ST.fmt(ST.pick(S, M.MAGE_KILL), { v: '{a}' })]);
      S.killer = null;
      v.how = '儀式を企む' + m.name + 'に殺されて';
      detectMage(S, m, false);
    });
    /* イゴーロナク：暴力性がじわじわ増す */
    if (S.ygo) live.forEach(function (p) {
      if (!alive(p) || p.bound) return;
      p.viol += 2 + p.tr.aggr * 5 + (night(h) ? 2 : 0) - p.tr.cp * 2 + (p.cnt.clue ? 1 : 0);
      var th = 28 + p.tr.cp * 35;
      if (p.viol < th) return;
      var calm = live.filter(function (q) { return q !== p && alive(q) && (q.job === 'priest' || q.job === 'psychic'); })[0];
      if (calm && rng() < 0.12) { p.viol -= 20; return ST.sayB(S, { actors: [calm, p], text: ST.fmt(ST.pick(S, M.YGO_CALM), { a: p.name, b: calm.name }), why: calm.name + 'が暴力の衝動を鎮めた' }, calm.name + 'が' + p.name + 'を鎮めた'); }
      if (rng() < 0.15) return ST.sayB(S, { actors: [p], tag: '衝動', text: ST.fmt(ST.pick(S, M.YGO_IRRITATE), { a: p.name }), why: '掌の口さまの影響で、暴力性が増している（' + Math.round(p.viol) + '）' }, p.name + 'が苛立っていた');
      var tg = live.filter(function (q) { return q !== p && alive(q); });
      if (!tg.length || rng() > 0.13) return;
      var b = rng.pick(tg);
      if (p.viol > th + 25 && rng() < 0.35 * HK.Dark.f(S, 'kill')) {
        p.viol = th;
        if (JS.DRAMA) JS.DRAMA.edge(S, p, b, '殺害', 'kill', p);
        return die(S, b, p.name + 'に襲われて', [ST.fmt(ST.pick(S, M.YGO_KILL), { a: p.name, b: '{a}' })]);
      }
      b.m.hp = clamp(b.m.hp - 22, 0, 100); b.m.fear = clamp(b.m.fear + 15, 0, 100); p.viol -= 10;
      ST.say(S, { actors: [p, b], tag: '暴力', text: ST.fmt(ST.pick(S, M.YGO_ASSAULT), { a: p.name, b: b.name }), why: '掌の口さま（イゴーロナク）は、心の底の暴力を引き出す。' + p.name + 'の暴力性 ' + Math.round(p.viol + 10) + '（攻撃性が高く、CPが低いほど増えやすい）', mag: 28 });
    });
  }
  /* 魔術師の企みがバレるか。バレたら縛り上げられるか、殺される */
  function detectMage(S, m, openly, by) {
    var rng = S.rng, others = S.P.filter(function (q) { return q !== m && alive(q) && !q.bound; });
    if (!others.length || !m.plot) return false;
    var b = by || others.slice().sort(function (x, y) { return skill(y, 'obs') + (y.job === 'sleuth' ? 0.4 : 0) - skill(x, 'obs') - (x.job === 'sleuth' ? 0.4 : 0); })[0];
    var ch = by ? 1 : openly ? 0.55 + skill(b, 'obs') * 0.3 : skill(b, 'obs') * 0.4 + (b.job === 'detective' ? 0.25 : b.job === 'sleuth' ? 0.4 : 0) + (b.job === 'police' ? 0.1 : 0) + m.plot.kills * 0.08;
    if (rng() > ch) return false;
    if (!by && JS.REL.cover(S, m, b)) return false;
    var angry = others.reduce(function (s0, q) { return s0 + q.tr.aggr + q.tr.cold * 0.5; }, 0) / others.length;
    var t = by ? '' : ST.fmt(ST.pick(S, openly ? M.MAGE_DETECT_OPEN : M.MAGE_DETECT), { a: m.name, b: b.name });
    if (rng() < (0.2 + angry * 0.5) * HK.Dark.f(S, 'grudge') || S.ygo) {
      var o = ST.say(S, { actors: [b, m], tag: '露見', kind: 'climax', text: t + ST.fmt(ST.pick(S, M.MAGE_KILLED), { a: m.name, b: b.name }), why: m.name + 'のたくらみが' + b.name + 'にばれた（観察' + (b.job === 'detective' ? '・探偵' : '') + '）。一行の怒り（攻撃性・冷たさ）で、殺されてしまった', mag: 44 });
      m.alive = false; m.fate = '仲間に殺された（' + hm(S.h) + '）'; if (JS.DRAMA) JS.DRAMA.edge(S, b, m, '制裁', 'kill', b); ST.key(S, o, m.name + 'の正体が露見');
    } else {
      m.bound = true; m.boundAt = S.inCave ? '洞窟の奥' : '民宿'; if (JS.DRAMA) JS.DRAMA.edge(S, b, m, '縛り上げた', 'enemy', b);
      var o2 = ST.say(S, { actors: [b, m], tag: '露見', kind: 'climax', text: t + ST.fmt(ST.pick(S, M.MAGE_BOUND), { a: m.name }), why: m.name + 'のたくらみが' + b.name + 'にばれ、縛り上げられた（もう動けない）', mag: 40 });
      ST.key(S, o2, m.name + 'が縛り上げられた');
    }
    return true;
  }
  /* ---------- 死の罠（神ごとに3つ） ---------- */
  function trapRate(S, p, h) {
    if (!S.FX) return 0;
    return (0.022 + (p.action.id === 'alone' ? 0.025 : 0) + (p.prank ? 0.03 : 0) + (p.goal.id === 'content' ? 0.015 : 0) + (night(h) ? 0.01 : 0) + (p.panic ? 0.02 : 0) + (p.job === 'ponkotsu' ? 0.02 : 0)) * (0.6 + S.env.ev / 125) * (0.6 + S.P.length * 0.08);
  }
  function trap(S, p, live, cave) {
    var rng = S.rng, fx = S.FX; if (!fx) return false;
    var ks = [0, 1, 2].filter(function (k) { return S.trapUsed.indexOf(k) < 0; });
    if (!ks.length) { S.trapUsed = []; ks = [0, 1, 2]; }
    var k = rng.pick(ks), tr = cave ? rng.pick(M.CAVE_TRAP) : fx.traps[k]; if (!cave) S.trapUsed.push(k); p.cnt.trap++;
    var set = ST.fmt(tr.set, { a: p.name, g: S.G.call }); tr = { die: ST.fmt(tr.die, { g: S.G.call }) };
    var helper = live.filter(function (q) { return q !== p && alive(q) && !q.bound && (cave || p.action.id !== 'alone') && JS.REL.near(S, p, q) && rng() < 0.85; }).sort(function (x, y) { return skill(y, 'obs') - skill(x, 'obs'); })[0];
    var av = (skill(p, 'obs') * 0.4 + p.tr.caution * (p.prank ? 0 : 0.25) + p.stats.luck * 0.03 + (helper ? skill(helper, 'obs') * 0.25 : 0)) * (cave ? 0.85 : 1);
    if (p.foresee && rng() > av) { p.foresee = false; p.m.fear = clamp(p.m.fear + 8, 0, 100); ST.say(S, { actors: [p], tag: '予見', text: set + '――しかし' + p.name + 'は、占いで見た光景を思い出し、踏みとどまった。', why: '占い師の予見が、死の罠を一度だけ避けさせた', mag: 22 }); return true; }
    var roll = rng();
    if (roll < av) {
      p.m.fear = clamp(p.m.fear + 10, 0, 100);
      ST.say(S, { actors: helper && roll > av - (helper ? skill(helper, 'obs') * 0.25 : 0) ? [p, helper] : [p], tag: '死の罠', text: set + (helper && roll > av - skill(helper, 'obs') * 0.25 ? ST.fmt(ST.pick(S, M.TRAP_HELP), { a: p.name, b: helper.name }) : ST.fmt(ST.pick(S, M.TRAP_AVOID), { a: p.name })), why: (cave ? '洞窟' : S.G.name) + 'の死の罠を避けた（観察・慎重さ・運' + (helper ? '・' + helper.name + 'の助け' : '') + '）', mag: 24 });
      return true;
    }
    if (rng() < HK.Dark.live(S, 0.4, 'kill') && p.m.hp > 35) {
      p.m.hp = clamp(p.m.hp - 30, 0, 100); p.m.fear = clamp(p.m.fear + 15, 0, 100);
      ST.say(S, { actors: [p], tag: '死の罠', text: set + ST.fmt(ST.pick(S, M.TRAP_HURT), { a: p.name }), why: (cave ? '洞窟' : S.G.name) + 'の死の罠。体力があったので命は拾った', mag: 28 });
      return true;
    }
    die(S, p, (cave ? '洞窟' : S.G.name) + 'の死の罠で', [tr.die.replace(/\{a\}/g, '{a}') + '。'], set + '――');
    return true;
  }
  /* ---------- 神ごとの怪異 ---------- */
  function godHorror(S, p) {
    var rng = S.rng, H = S.FX.horror;
    var ks = H.map(function (x, i) { return i; }).filter(function (i) { return S.horUsed.indexOf(i) < 0; });
    if (!ks.length) return scare(S, p);
    var k = rng.pick(ks); S.horUsed.push(k); p.cnt.scare++;
    p.m.fear = clamp(p.m.fear + (p.prank ? 5 : 13) + (p.job === 'psychic' ? 5 : 0) - p.tr.cp * 4, 0, 100);
    var t = ST.fmt(H[k], { a: p.name }) + (p.prank ? ST.fmt(ST.pick(S, M.PRANK_ACT), { a: p.name }) : '');
    ST.say(S, { actors: [p], tag: '怪異', text: t, why: S.G.call + 'の気配（恐怖 ' + Math.round(p.m.fear) + (p.prank ? '・ドッキリだと思っているので怖がらない' : '') + '）', mag: 16 });
  }
  JS.detectMage = detectMage;

  /* ---------- 結果 ---------- */
  function finish(S, input) {
    var P = S.P, G = S.G;
    P.forEach(function (p) {
      if (!p.fate) p.fate = p.taken ? '行方不明' : p.alive ? '村に残った' : '死亡';
      p.notes.push('職業：' + jobOf(p).label + '・来た理由：' + (p.amn && !p.amn.back ? '（記憶がない）' : p.reason) + (p.amn ? '・記憶喪失' + (p.amn.back ? '（' + JS.hm(p.amn.at) + 'に記憶が戻った）' : '（' + JS.RELT.AMN_NEVER + '）') : ''));
      p.notes.push('初動「' + p.action.label + '」・目標「' + p.goal.label + '」・見つけた手がかり ' + p.cnt.clue + 'つ');
      var bits = [];
      if (p.cnt.scare) bits.push('怪異 ' + p.cnt.scare + '回');
      if (p.cnt.attack) bits.push('襲われた ' + p.cnt.attack + '回');
      if (p.curse != null) bits.push('祠の呪い');
      if (p.possessed) bits.push('取り憑かれた');
      if (p.cnt.r18) bits.push('夜の出来事 ' + p.cnt.r18 + '回');
      if (p.preg) bits.push('疑似妊娠');
      if (p.prankOnce) bits.push('ドッキリだと思い込んでいた');
      if (p.plot) bits.push('儀式のたくらみ（殺した人数 ' + p.plot.kills + '）' + (p.bound ? '・縛り上げられた' : ''));
      if (S.ygo && p.viol > 40) bits.push('暴力性 ' + Math.round(p.viol));
      if (p.cnt.trap) bits.push('死の罠 ' + p.cnt.trap + '回');
      if (p.cnt.magic) bits.push('魔術 ' + p.cnt.magic + '回');
      if (JS.SPEC && JS.SPEC.note(p)) bits.push(JS.SPEC.note(p));
      if (bits.length) p.notes.push(bits.join('・'));
    });
    var out = P.filter(function (p) { return p.out; }), dead = P.filter(function (p) { return !p.alive; });
    var first = out.slice().sort(function (a, b) { return a.esc - b.esc; })[0], last = out.slice().sort(function (a, b) { return b.esc - a.esc; })[0];
    var miko = P.filter(function (p) { return /巫女/.test(p.fate); });
    /* 結末の締め：誰も出られなかった回は、村が一行を呑み込んだ静けさで区切る（脱出した回は、逃げ出す場面がそのまま締めになる） */
    if (!out.length && !S.engulf && !S.titleOverride) {
      var gone = P.filter(function (p) { return p.taken; }), v0 = { v: S.V, g: G.call, n: P.length, l: names(P), t: names(gone), m: names(miko), k: Math.max(1, P.filter(function (p) { return !p.alive; }).length) };
      var EP = miko.length ? [
        '祭りの太鼓が鳴り止むと、村はいつもの静けさを取り戻した。社の奥では、{m}が{g}の巫女として迎えられていた。もう、村の外へ出たいと口にする者はいなかった。',
        '{v}の新しい巫女は、{m}だった。村人たちは何事もなかったように田畑へ戻り、山道の入口には、新しいしめ縄が張られた。',
        '数か月後、{v}を訪ねた行商人は、社の前で静かに微笑む{m}の姿を見かけた。声をかけても、{m}は外の世界のことを何ひとつ覚えていなかった。'
      ] : [
        '夜が明けると、村は何事もなかったように静まり返っていた。{v}の外れの墓地に、名前のない新しい塚が{k}つ増えていた。',
        '一行が戻らないまま、刻限は過ぎた。麓の駐在所に届いた捜索願いは、数日後、「山で道に迷ったもの」として片づけられた。{v}の祭りは、今年も滞りなく終わった。',
        '{v}の村人たちは、翌朝もいつも通り畑に出た。村の外から来た{n}人のことを、誰も口にしなかった。{g}は、また深い眠りについた。'
      ];
      var tx = ST.fmt(ST.pick(S, EP), v0) + (gone.length ? ST.fmt(ST.pick(S, ['{t}の行方は、今も分かっていない。', '{t}を最後に見た者は、誰もいなかった。', '山の奥から、ときどき{t}の名を呼ぶような声が聞こえるという。']), v0) : '');
      ST.step(S, '村の朝');
      ST.say(S, { actors: P, tag: '結末', kind: 'climax', text: tx, why: '誰も' + S.V + 'から出られなかった', mag: 40 });
    }
    var title;
    if (!out.length && S.engulf) title = S.G.call + 'が顕現し、' + S.V + 'は消えた。誰も戻らなかった。――全滅';
    else if (!out.length) title = miko.length ? names(miko) + 'は神の子を産む巫女となった。誰も、' + S.V + 'から出られなかった。――GAME OVER' : '誰も' + S.V + 'から出られなかった。――全滅';
    else if (S.result === 'sealed') title = S.G.name + 'を封じ、' + out.length + '人が' + S.V + 'を脱出（' + hm(last.esc) + '）';
    else title = out.length + '人が' + S.V + 'から逃げ延びた（' + hm(last.esc) + '）。' + S.G.call + 'は、今も村で眠っている';
    if (S.titleOverride) title = S.titleOverride;
    var lines = P.map(function (p) { return p.name + '（' + jobOf(p).label + '）：' + p.fate; });
    lines.push('祀られていた神：' + G.name + '（村での呼び名「' + G.call + '」）');
    lines.push('対抗策：' + G.sol + (S.solved ? '' : '（判明しなかった）'));
    if (first && out.length > 1 && first.esc < last.esc - 2) lines.push('最速の脱出：' + first.name + '（' + hm(first.esc) + '）');
    if (JS.LOOP) {
      if (S.alienEnd) lines = lines.map(function (l) { return l.replace(/^祀られていた神：/, '村人が神だと信じていたもの：'); });
      lines = lines.concat(JS.LOOP.lines(S)); var epi = JS.LOOP.epilogue(S); if (epi) lines.push(epi);
    }
    var rows = P.map(function (p) { return { i: p.i, rank: '', cells: [jobOf(p).label, p.amn && !p.amn.back ? '（記憶がない）' : p.reason.length > 18 ? p.reason.slice(0, 17) + '…' : p.reason, p.cnt.clue + 'つ', Math.round(p.m.fear) + '', p.fate] }; });
    return ST.result(S, input, {
      ending: { title: title, kind: out.length && !miko.length && !S.alienEnd ? 'ok' : 'over', lines: lines },
      estats: [['脱出までの時間', out.length ? hm(last.esc) : '―'], ['生還', out.length + '/' + P.length + '人'], ['死亡・生贄', dead.length + '人'], ['手がかり', S.found.length + '/' + G.clues.length], ['神', G.name]],
      table: { title: '一行の記録', hint: '手がかりの種類：観察・知識・聞き込み・霊感・探索。職業と気質で見つけやすさが変わる。', cols: ['職業', '来た理由', '手がかり', '恐怖', '結末'], rows: rows },
      meters: [{ label: '恐怖', color: '--love' }, { label: '体力', color: '--pine', dash: true }, { label: '手がかり', color: '--accent', max: 5 }],
      relmap: JS.DRAMA ? JS.DRAMA.relmap(S) : null,
      meta: S.V + '・' + G.name + '・刻限' + S.env.hours + '時間',
      summary: '邪神村RTA：' + title
    });
  }
  JS.skill = skill; JS.alive = alive; JS.night = night; JS.hm = hm;
  JS.core = { die: die, sacrifice: sacrifice, flee: flee, names: names, jobOf: jobOf, label: label, trap: trap, L: L };
})();
