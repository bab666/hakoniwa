/* 箱庭シミュレーター: 宇宙船漂流記（2〜8人）
   故障して漂流する宇宙船。閉ざされた船の中で、船員たちは役割を分け合い、新しい星を探して一年を過ごす。
   ・一か月ずつ進む。星に辿り着けるかは毎月の運（星の見つかりやすさ・航海士の腕）。辿り着けない月は、船での暮らし・故障・宇宙での未知との遭遇
   ・辿り着ける星は一つだけ。星は「資源」「生命体（0〜3種）」「文明」の組み合わせ（それぞれ約30種・ship-res.js / ship-life.js / ship-civ.js）。
     辿り着いたあとは、着陸して探索する。成功するたびに、その項目が段階的に明らかになる（手がかり → 詳細 → 最深部）。
     詳細まで分かると珍しい物品を持ち帰り、最深部まで分かるとレポートを書く。失敗すると怪我をし、死ぬこともある
   ・船の状態（船体・動力・生命維持・食料・士気）。故障で削れ、尽きると船員が弱って死ぬ。資源の物品は船を直すのにも使える
   ・役割：船長・エンジニア・航海士・船医・科学者・生物学者・通信士・保安員・料理人
   ・R18版では、船員どうしの夜、星の花粉、異星の生き物、文明の儀式の場面がある（ship-r18.js）。
     受け攻めは HK.Pos で決め、自分で「攻め」を選んだ人を受ける側にしない。女性どうしは女性どうしの描写にする */
(function () {
  'use strict';
  var HK = window.HK, ST = HK.Story, SH = HK.SHIP = HK.SHIP || {};
  /* 文の表（ship-res / ship-life / ship-civ / ship-text）がそろっていなければ、箱庭を出さない */
  if (!ST || !SH.RES || !SH.LIFE || !SH.CIV || !SH.T) return;
  function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }
  function L(s) { return s.split('|'); }

  /* ---------- 役割 ---------- */
  var ROLES = [
    { id: 'captain', label: '船長', sk: { talk: 0.2, survive: 0.2, lead: 0.4 }, fit: function (t) { return t.lead * 0.6 + t.cp * 0.4; }, desc: '船の舵取りと、皆のまとめ役' },
    { id: 'engineer', label: 'エンジニア', sk: { repair: 0.5 }, fit: function (t) { return t.a * 0.6 + t.caution * 0.4; }, desc: '故障を直す。船の命綱' },
    { id: 'pilot', label: '航海士', sk: { nav: 0.5, survive: 0.1 }, fit: function (t) { return t.a * 0.4 + t.impulse * 0.3 + t.fc * 0.2; }, desc: '星図を読み、新しい星を探す' },
    { id: 'doctor', label: '船医', sk: { med: 0.55 }, fit: function (t) { return t.np * 0.5 + t.a * 0.4; }, desc: '怪我や病気を治す' },
    { id: 'scientist', label: '科学者', sk: { sci: 0.5, repair: 0.1 }, fit: function (t) { return t.a * 0.7 + t.cold * 0.2; }, desc: '星の資源を調べ、レポートを書く' },
    { id: 'biologist', label: '生物学者', sk: { bio: 0.55, sci: 0.15 }, fit: function (t) { return t.a * 0.4 + t.fc * 0.3 + t.np * 0.2; }, desc: '異星の生命体を調べる' },
    { id: 'comms', label: '通信士', sk: { talk: 0.45, nav: 0.2 }, fit: function (t) { return t.warmth * 0.5 + t.a * 0.3; }, desc: '信号を拾い、異星の文明と言葉を交わす' },
    { id: 'security', label: '保安員', sk: { fight: 0.5, survive: 0.3 }, fit: function (t) { return t.aggr * 0.5 + t.cp * 0.3 + t.caution * 0.2; }, desc: '危険から皆を守る' },
    { id: 'cook', label: '料理人', sk: { cook: 0.6, survive: 0.1 }, fit: function (t) { return t.np * 0.5 + t.fc * 0.4; }, desc: '乏しい食料で皆を支える' }
  ];
  var ROLE = {}; ROLES.forEach(function (r) { ROLE[r.id] = r; });
  SH.ROLES = ROLES;

  var R18ON = !!SH.R18;
  var scen = {
    id: 'ship', name: '宇宙船漂流記', kicker: 'SF・サバイバル（2〜8人）', solo: true, minCast: 2, maxCast: 8,
    desc: '故障した宇宙船で漂流する一年。閉ざされた船の中で役割を分け合い、新しい星を探す。星には資源・生命体・文明があり、探検するほど正体が明らかになる。辿り着けるのは、ただ一つの星だけ。',
    note: '※死の描写を含みます。',
    unit: '月', simulate: function (input) { return run(input); },
    castHint: '2〜8人。「役割」で船長・エンジニア・航海士・船医・科学者・生物学者・通信士・保安員・料理人を決められます（決めなければ気質から）。',
    env: [
      { id: 'find', label: '星の見つかりやすさ', min: 0, max: 100, def: 40, lo: 'ほとんど見つからない', hi: 'すぐ見つかる', desc: '毎月、星に辿り着けるかどうかの運。航海士と通信士の腕でも上がる' },
      { id: 'danger', label: '宇宙の過酷さ', min: 0, max: 100, def: 45, lo: '穏やか', hi: '過酷', desc: '故障や事故、探索の危険の起きやすさ' },
      { id: 'supply', label: '積んでいる物資', min: 0, max: 100, def: 50, lo: 'ぎりぎり', hi: '潤沢', desc: '食料と修理部品の量' },
      { id: 'contact', label: '未知との遭遇', min: 0, max: 100, def: 50, lo: 'めったにない', hi: 'たびたび', desc: '漂流中に、不思議なものに出会う頻度' }
    ].concat(R18ON ? [{ id: 'slewd', label: '夜の出来事（R18）', min: 0, max: 100, def: 40, lo: '起きない', hi: 'たびたび', desc: '船員どうしの夜、星の花粉、異星の生き物、文明の儀式の起きやすさ' }] : []),
    stats: [{ id: 'hp', label: '体力', desc: '怪我や飢え、探索の危険への強さ' }, { id: 'tech', label: '技術', desc: '修理・航法・調査の腕' }],
    perFields: [{ id: 'role', label: '役割', auto: 'おまかせ（気質から）', options: ROLES.map(function (r) { return { id: r.id, label: r.label }; }) }],
    actions: [], goals: [], events: []
  };
  HK.SCENARIOS.ship = scen;
  var at = HK.SCEN_ORDER.indexOf('island');
  HK.SCEN_ORDER.splice(at >= 0 ? at + 1 : HK.SCEN_ORDER.length, 0, 'ship');

  /* ---------- 関係 ---------- */
  var W = { lover: 1, mate: 1, fated: 1, almost: 0.8, fwb: 0.45, sibling: 0.8, sibprot: 0.95, sibclose: 0.9, parent: 0.95, pparent: 0.9, best: 0.75, buddy: 0.8, childhood: 0.7, friend: 0.5, mentor: 0.6, master: 0.6, teacher: 0.5, senpai: 0.4, colleague: 0.3, acq: 0.1, ex: 0.3, rival: -0.3, enemy: -0.7, sibbad: -0.15, bad: -0.4 };
  var LOVE = /^(lover|mate|fated|almost|fwb|crush)$/, FAMILY = /^(sibling|sibprot|sibclose|sibbad|parent|pparent)$/;
  function rk(a, b) { return a.i < b.i ? a.i + '-' + b.i : b.i + '-' + a.i; }
  function ties(S, a, b) { return S.ties.filter(function (t) { return (t.a === a.i && t.b === b.i) || (t.a === b.i && t.b === a.i); }); }
  function bond(S, a, b) {
    var best = 0, neg = 0;
    ties(S, a, b).forEach(function (t) { var w = t.type === 'crush' ? (t.a === a.i ? 0.85 : 0.15) : W[t.type] != null ? W[t.type] : 0.1; if (w > best) best = w; if (w < neg) neg = w; });
    return clamp((best > 0 ? best + neg * 0.3 : neg) + (S.relD[rk(a, b)] || 0), -1, 1.2);
  }
  function lover(S, a, b) { return ties(S, a, b).some(function (t) { return LOVE.test(t.type); }) || (S.relD[rk(a, b)] || 0) > 0.6; }
  function family(S, a, b) { return ties(S, a, b).some(function (t) { return FAMILY.test(t.type); }); }
  function setRel(S, a, b, d) { var k = rk(a, b); S.relD[k] = clamp((S.relD[k] || 0) + d, -1, 1); }

  /* ---------- 能力 ---------- */
  function role(p) { return ROLE[p.role] || ROLE.captain; }
  function skill(p, type) {
    var t = p.tr, tech = (p.stats.tech || 3), base = {
      repair: t.a * 0.35 + t.caution * 0.2 + tech * 0.05, nav: t.a * 0.35 + t.fc * 0.1 + tech * 0.04, med: t.np * 0.25 + t.a * 0.2,
      sci: t.a * 0.45 + tech * 0.04, bio: t.a * 0.25 + t.fc * 0.2 + t.np * 0.1, talk: t.warmth * 0.4 + t.np * 0.2, fight: t.aggr * 0.3 + t.cp * 0.2 + (p.stats.hp || 3) * 0.04,
      survive: t.caution * 0.3 + t.cp * 0.15 + (p.stats.hp || 3) * 0.04, cook: t.np * 0.3 + t.fc * 0.2, lead: t.lead * 0.5
    }[type] || 0.2;
    return clamp(base + ((role(p).sk || {})[type] || 0) - (p.m.hp < 40 ? 0.1 : 0), 0, 1.3);
  }
  function alive(p) { return p.alive; }
  function live(S) { return S.P.filter(alive); }
  function best(S, type, ex) { return live(S).filter(function (p) { return !ex || ex.indexOf(p) < 0; }).sort(function (a, b) { return skill(b, type) - skill(a, type); })[0]; }
  function names(l) { return l.map(function (p) { return p.name; }).join(l.length > 2 ? '・' : 'と'); }
  function pk(S, a) { return ST.pick(S, a); }
  function F(t, m) { return ST.fmt(t, m || {}); }

  /* ---------- 星を作る ---------- */
  var GREEK = ['α', 'β', 'γ', 'δ', 'ε', 'ζ', 'η', 'θ'];
  function makePlanet(S) {
    var rng = S.rng, T = SH.RES || [], LF = SH.LIFE || [], CV = SH.CIV || [];
    var res = rng.pick(T), civ = rng.pick(CV), n = rng() < 0.22 ? 0 : rng() < 0.55 ? 1 : rng() < 0.75 ? 2 : 3;
    var life = [], pool = LF.slice();
    for (var k = 0; k < n && pool.length; k++) { var x = pool.splice(rng.int(pool.length), 1)[0]; life.push({ d: x, st: 0 }); }
    var name = 'ケプラー' + (100 + rng.int(900)) + GREEK[rng.int(GREEK.length)];
    var rare = clamp(Math.round((res.rare + civ.rare + (life.length ? Math.max.apply(null, life.map(function (l) { return l.d.rare; })) : 1)) / 3 + (life.length >= 3 ? 0.6 : life.length === 2 ? 0.3 : 0)), 1, 5);
    return { name: name, res: { d: res, st: 0 }, civ: { d: civ, st: 0 }, life: life, rare: rare, at: 0 };
  }
  function stars(n) { return '★★★★★'.slice(0, n) + '☆☆☆☆☆'.slice(0, 5 - n); }
  /* 探索の対象：まだ分かっていないものほど選ばれやすい */
  function targets(S) {
    var Pn = S.planet, out = [{ kind: 'res', o: Pn.res }].concat(Pn.life.map(function (l) { return { kind: 'life', o: l }; }));
    if (Pn.civ.d.state !== 'none' || Pn.civ.st < 3) out.push({ kind: 'civ', o: Pn.civ });
    return out.filter(function (x) { return x.o.st < 3; });
  }
  var STAGE = ['', 'hint', 'detail', 'deep'], LIFE_STAGE = ['', 'look', 'habit', 'deep'];
  var KIND_JP = { res: '資源', life: '生命体', civ: '文明' };
  var USE_JP = { hull: '船体の修理', power: '動力', o2: '生命維持', food: '食料', med: '薬', none: '研究' };
  var LIFE_JP = { friendly: '人懐っこい', neutral: '無関心', hostile: '攻撃的', symbiotic: '共生する', parasite: '寄生する', plant: '植物・菌類' };
  var CIV_JP = { none: '文明なし', ruins: '遺跡', primitive: '素朴な文明', living: '現役の文明', advanced: '高度文明', transcendent: '理解を超えた存在' };

  function run(input) {
    var S = ST.state(input, 'ship'), rng = S.rng, env = S.env, P = S.P, T = SH.T;
    S.ties = (input.ties || []).filter(function (t) { return t.a !== t.b && t.a < P.length && t.b < P.length; });
    S.relD = {}; S.items = []; S.reports = []; S.planet = null; S.deaths = [];
    var sup = env.supply / 100;
    S.ship = { hull: 85, power: 75 + sup * 15, o2: 85, food: 45 + sup * 45, morale: 60 };
    /* ---------- 役割 ---------- */
    var taken = {};
    P.forEach(function (p) {
      var want = (((input.perChar && input.perChar[p.i]) || {}).pick || {}).role;
      p.alive = true; p.m = { hp: 70 + (p.stats.hp || 3) * 6, fear: 15 + p.tr.ac * 10, find: 0 }; p.cnt = { find: 0, item: 0, report: 0, fix: 0 }; p.notes = p.notes || [];
      if (ROLE[want]) { p.role = want; p.picked = true; taken[want] = (taken[want] || 0) + 1; }
    });
    /* おまかせは、まだ誰もいない大事な役割から気質で埋める */
    var order = ['captain', 'engineer', 'pilot', 'doctor', 'scientist', 'biologist', 'comms', 'security', 'cook'];
    P.filter(function (p) { return !p.role; }).forEach(function (p) {
      var open = order.filter(function (r) { return !taken[r]; });
      var list = open.length ? open : order;
      var r = list.slice().sort(function (x, y) { return ROLE[y].fit(p.tr) - ROLE[x].fit(p.tr) + (open.length ? (list.indexOf(x) - list.indexOf(y)) * 0.04 : 0); })[0];
      p.role = r; taken[r] = (taken[r] || 0) + 1;
    });
    P.forEach(function (p) { p.roleLabel = ROLE[p.role].label; });
    var keys = ['hp', 'fear', 'find'];

    ST.step(S, '漂流のはじまり');
    ST.say(S, { kind: 'phase', text: pk(S, L('警報が鳴り止んだとき、船はもう航路を外れていた。主機関は沈黙し、救難信号に応える声はない。|小惑星帯をかすめた衝撃で、船は航路を失った。窓の外には、見知らぬ星座だけが広がっていた。|ワープの失敗で、船は星図にない宙域に投げ出された。帰り道は、もう分からなかった。')) + names(P) + 'は、新しい星を探して漂い続けることに決めた。' });
    P.forEach(function (p) { ST.sayB(S, { actors: [p], tag: p.roleLabel, text: p.name + '（' + p.roleLabel + '）――' + ROLE[p.role].desc + '。', why: '役割：' + p.roleLabel + (p.picked ? '（指定）' : '（気質から）') }, p.name + 'は' + p.roleLabel); });
    ST.snap(S, keys);

    for (var m = 1; m <= 12; m++) {
      S.m = m;
      if (!live(S).length) break;
      ST.step(S, m + 'か月目');
      ST.budget(S, 4 + Math.ceil(live(S).length / 2));
      if (rng() < 0.35) ST.say(S, { kind: 'phase', text: pk(S, T.MONTH) });
      if (!S.planet) {
        searchPlanet(S, m);
        if (!S.planet && rng() < env.contact / 100 * 0.45) space(S);
      } else if (S.planet.at < m) explore(S, m);
      if (rng() < 0.22 + env.danger / 100 * 0.35) trouble(S);
      shipLife(S);
      if (R18ON && r18on(S)) nightR18(S);
      upkeep(S, m);
      ST.flushShort(S, 'ほかに：');
      ST.snap(S, keys);
    }
    return finish(S, input);
  }

  /* ---------- 星を探す ---------- */
  function searchPlanet(S, m) {
    var rng = S.rng, nav = best(S, 'nav'), com = best(S, 'talk', nav ? [nav] : []);
    var ch = 0.01 + S.env.find / 100 * 0.14 + (nav ? skill(nav, 'nav') * 0.05 : 0) + (com ? skill(com, 'talk') * 0.02 : 0) + (S.ship.power > 40 ? 0.02 : -0.02);
    if (rng() >= ch) {
      if (rng() < 0.5) ST.sayB(S, { kind: 'phase', text: pk(S, SH.T.DRIFT), why: 'この月は、星に辿り着けなかった（運 ' + Math.round(ch * 100) + '%）' }, '星は見つからない');
      return;
    }
    var Pn = S.planet = makePlanet(S); Pn.at = m;
    var a = nav || live(S)[0];
    var o = ST.say(S, { actors: [a], tag: '星を発見', kind: 'climax', text: F(pk(S, SH.T.FOUND), { a: a.name, x: Pn.name }) + F(pk(S, SH.T.ARRIVE), { x: Pn.name }) + ' ' + Pn.res.d.sky + ' ' + (Pn.civ.d.sky || ''), why: m + 'か月目に、星に辿り着いた（運 ' + Math.round(ch * 100) + '%・' + a.name + 'の航法）。珍しさ ' + stars(Pn.rare) + '（まだ探索していないので、中身は分からない）', mag: 40 });
    ST.key(S, o, Pn.name + 'を発見した');
    a.cnt.find++;
  }

  /* ---------- 星を探索する ---------- */
  function team(S, kind) {
    var lead = kind === 'res' ? best(S, 'sci') : kind === 'life' ? best(S, 'bio') : best(S, 'talk');
    var esc = best(S, 'fight', [lead]), out = [lead];
    if (esc && live(S).length > 2 && S.rng() < 0.75) out.push(esc);
    if (live(S).length > 4 && S.rng() < 0.4) { var x = live(S).filter(function (p) { return out.indexOf(p) < 0; }); if (x.length) out.push(S.rng.pick(x)); }
    return out.filter(Boolean);
  }
  function explore(S, m) {
    var rng = S.rng, Pn = S.planet, nEx = live(S).length >= 4 && rng() < 0.5 ? 2 : 1;
    for (var e = 0; e < nEx; e++) {
      var tg = targets(S);
      if (!tg.length) { if (e === 0) ST.sayB(S, { kind: 'phase', text: Pn.name + 'の調査は、もう終わっていた。一行は物資を補給し、船を整えて過ごした。', why: '' }, '補給の月'); S.ship.food = clamp(S.ship.food + 8, 0, 100); return; }
      var x = HK.weighted(rng, tg, function (q) { return 1.3 - q.o.st * 0.35; });
      var tm = team(S, x.kind);
      if (!tm.length) return;
      var a = tm[0], d = x.o.d, stg = x.o.st + 1;
      var sk = skill(a, x.kind === 'res' ? 'sci' : x.kind === 'life' ? 'bio' : 'talk') + tm.slice(1).reduce(function (s0, q) { return s0 + skill(q, 'survive') * 0.3; }, 0);
      var diff = 0.35 + d.rare * 0.07 + stg * 0.08 + (x.kind === 'life' && d.kind === 'hostile' ? 0.12 : 0) + (x.kind === 'civ' && d.state === 'advanced' ? 0.08 : 0) + S.env.danger / 100 * 0.12;
      var ok = sk + rng() * 0.55 >= diff;
      var t = F(pk(S, SH.T.LAND), { a: a.name, x: Pn.name }) + (tm.length > 1 ? names(tm.slice(1)) + 'も同行した。' : '');
      var lab = KIND_JP[x.kind] + (x.kind === 'life' ? '「' + (x.o.st ? d.name : '未知の生命体') + '」' : '');
      if (ok) {
        x.o.st = stg;
        var key = x.kind === 'life' ? LIFE_STAGE[stg] : STAGE[stg];
        t += F(d[key], { a: a.name, x: Pn.name });
        a.cnt.find++; a.m.find++;
        if (stg === 2) {
          if (x.kind !== 'res' && d.good) t += F(d.good, { a: a.name, x: Pn.name });
          if (d.item) { S.items.push({ name: d.item, desc: d.itemDesc || '', by: a.name, kind: x.kind }); a.cnt.item++; t += '――' + a.name + 'は「' + d.item + '」を船に持ち帰った。'; useItem(S, d, x.kind); }
        }
        var o = ST.say(S, { actors: tm, tag: '探索：' + lab, text: t, why: KIND_JP[x.kind] + 'の調査に成功（' + ['', '手がかり', '詳細', '最深部'][stg] + 'まで判明）／' + a.name + 'の' + (x.kind === 'res' ? '科学' : x.kind === 'life' ? '生物学' : '交渉') + 'の腕 ' + Math.round(sk * 100) + '・難しさ ' + Math.round(diff * 100), mag: stg === 3 ? 34 : 22 });
        if (stg === 3) {
          var wr = best(S, x.kind === 'life' ? 'bio' : 'sci') || a;
          S.reports.push({ title: d.report, by: wr.name }); wr.cnt.report++;
          ST.say(S, { actors: [wr], tag: 'レポート', text: wr.name + 'は、船に戻るとすぐに端末へ向かった。何日もかけて、レポート『' + d.report + '』を書き上げた。', why: KIND_JP[x.kind] + 'の最深部まで明らかになった' });
          ST.key(S, o, d.name + 'の正体が明らかになった');
        } else if (stg === 1 && x.kind === 'life') ST.key(S, o, '生命体「' + d.name + '」を見つけた');
        if (R18ON && r18on(S) && x.kind === 'life' && rng() < S.env.slewd / 100 * 0.35) alienR18(S, a, d);
      } else {
        var hurt = 12 + rng.int(18) + (x.kind === 'life' && d.kind === 'hostile' ? 8 : 0);
        var dead = rng() < 0.03 + S.env.danger / 100 * 0.2 + d.rare * 0.02 + (x.kind === 'life' && d.kind === 'hostile' ? 0.08 : 0);
        var v = tm.length > 1 && rng() < 0.4 ? tm[1] : a;
        if (dead) { die(S, v, Pn.name + 'の' + KIND_JP[x.kind] + 'の調査中に', t + F(d.death, { v: v.name, w: (tm.filter(function (q) { return q !== v; })[0] || { name: '仲間' }).name, x: Pn.name })); continue; }
        a.m.hp = clamp(a.m.hp - hurt, 1, 100); a.m.fear = clamp(a.m.fear + 10, 0, 100);
        t += F(x.kind === 'res' ? d.trouble : d.bad, { a: a.name, x: Pn.name });
        ST.say(S, { actors: tm, tag: '探索失敗', text: t, why: lab + 'の調査に失敗（' + a.name + 'の体力 -' + hurt + '）', mag: 20 });
        heal(S, a);
      }
      if (rng() < 0.4) ST.sayB(S, { actors: tm, text: F(pk(S, SH.T.BACK), { a: a.name, x: Pn.name }), why: '' }, names(tm) + 'が帰船');
    }
  }
  /* 持ち帰った資源で、船を直す */
  function useItem(S, d, kind) {
    if (kind !== 'res' || !d.use || d.use === 'none') return;
    var sp = S.ship, k = { hull: 'hull', power: 'power', o2: 'o2', food: 'food' }[d.use];
    if (k) sp[k] = clamp(sp[k] + 25, 0, 100);
    if (d.use === 'med') live(S).forEach(function (p) { p.m.hp = clamp(p.m.hp + 15, 0, 100); });
  }

  /* ---------- 船の故障 ---------- */
  function trouble(S) {
    var rng = S.rng, tr = rng.pick(SH.T.TROUBLE), fx = best(S, 'repair');
    if (!fx) return;
    var ok = skill(fx, 'repair') + rng() * 0.5 >= 0.45 + S.env.danger / 100 * 0.25;
    var t = tr.intro;
    if (ok) {
      fx.cnt.fix++;
      t += F(tr.ok, { a: fx.name });
      ST.say(S, { actors: [fx], tag: '故障：' + tr.name, text: t, why: fx.name + 'が直した（修理の腕 ' + Math.round(skill(fx, 'repair') * 100) + '）', mag: 18 });
      return;
    }
    var sp = S.ship, dmg = 15 + rng.int(15);
    if (tr.stat === 'crew') live(S).forEach(function (p) { p.m.hp = clamp(p.m.hp - 8, 1, 100); });
    else if (sp[tr.stat] != null) sp[tr.stat] = clamp(sp[tr.stat] - dmg, 0, 100);
    S.ship.morale = clamp(S.ship.morale - 6, 0, 100);
    if (rng() < 0.06 + S.env.danger / 100 * 0.32) {
      var v = rng.pick(live(S)), w = live(S).filter(function (q) { return q !== v; })[0];
      return die(S, v, tr.name + 'で', t + F(tr.ng, { a: fx.name }) + F(tr.death, { v: v.name, w: w ? w.name : '仲間' }));
    }
    ST.say(S, { actors: [fx], tag: '故障：' + tr.name, text: t + F(tr.ng, { a: fx.name }), why: '修理に失敗（' + ({ hull: '船体', power: '動力', o2: '生命維持', food: '食料', crew: '全員の体力' }[tr.stat] || '') + 'が減った）', mag: 22 });
  }

  /* ---------- 宇宙での遭遇 ---------- */
  function space(S) {
    var rng = S.rng, en = rng.pick(SH.T.SPACE), a = best(S, rng() < 0.5 ? 'sci' : 'nav') || live(S)[0];
    var ok = skill(a, 'sci') * 0.5 + skill(a, 'nav') * 0.5 + rng() * 0.6 >= 0.5;
    var t = en.intro;
    if (ok) {
      t += F(en.ok, { a: a.name });
      if (en.item) { S.items.push({ name: en.item, desc: en.itemDesc || '', by: a.name, kind: 'space' }); a.cnt.item++; t += '――「' + en.item + '」を手に入れた。'; }
      var o = ST.say(S, { actors: [a], tag: '未知との遭遇：' + en.name, text: t, why: a.name + 'の判断（科学・航法）', mag: 26 });
      return ST.key(S, o, en.name + 'に出会った');
    }
    if (en.death && rng() < 0.15 + S.env.danger / 100 * 0.15) { var v = rng.pick(live(S)); return die(S, v, en.name + 'に遭遇して', t + F(en.ng, { a: a.name }) + F(en.death, { v: v.name, w: a === v ? '仲間' : a.name })); }
    S.ship.hull = clamp(S.ship.hull - 10, 0, 100); a.m.hp = clamp(a.m.hp - 10, 1, 100);
    ST.say(S, { actors: [a], tag: '未知との遭遇：' + en.name, text: t + F(en.ng, { a: a.name }), why: '対応を誤った（船体 -10）', mag: 22 });
  }

  /* ---------- 船での暮らし ---------- */
  function shipLife(S) {
    var rng = S.rng, L0 = live(S), sp = S.ship, T = SH.T;
    if (!L0.length) return;
    /* 役割の日常 */
    var r = rng.pick(L0);
    if (T.ROLE[r.role]) ST.sayB(S, { actors: [r], tag: r.roleLabel, text: F(pk(S, T.ROLE[r.role]), { a: r.name }), why: r.roleLabel + 'の仕事' }, r.name + 'は' + r.roleLabel + 'の仕事');
    /* 料理人の食事 */
    var ck = L0.filter(function (p) { return p.role === 'cook'; })[0];
    if (ck && rng() < 0.5) { sp.morale = clamp(sp.morale + 6 + skill(ck, 'cook') * 6, 0, 100); ST.sayB(S, { actors: [ck], tag: '食事', text: F(pk(S, T.MEAL), { a: ck.name }), why: '料理人の腕で士気が上がった' }, ck.name + 'の料理'); }
    /* 二人の関係（閉ざされた船の中で） */
    if (L0.length >= 2) {
      var pr = rng.shuffle(L0.slice()).slice(0, 2), a = pr[0], b = pr[1], w = bond(S, a, b);
      var fever = (100 - sp.morale) / 100 + (a.tr.aggr + b.tr.aggr) * 0.2 - w * 0.4;
      var kind = w < -0.15 && rng() < 0.4 ? 'makeup' : rng() < fever * 0.5 ? 'bad' : (lover(S, a, b) || (w > 0.4 && HK.Pos && HK.Pos.okSex(a, b) && !family(S, a, b) && rng() < 0.4)) && rng() < 0.5 ? 'love' : 'good';
      var pool = { good: T.PAIR_GOOD, bad: T.PAIR_BAD, love: T.PAIR_LOVE, makeup: T.MAKEUP }[kind];
      setRel(S, a, b, { good: 0.12, bad: -0.15, love: 0.15, makeup: 0.25 }[kind]);
      if (kind === 'bad') sp.morale = clamp(sp.morale - 4, 0, 100);
      ST.sayB(S, { actors: [a, b], tag: { good: '絆', bad: '衝突', love: '想い', makeup: '仲直り' }[kind], text: F(pk(S, pool), { a: a.name, b: b.name }), why: kind === 'bad' ? '閉ざされた船の息苦しさ（士気 ' + Math.round(sp.morale) + '）' : '関係の近さ ' + Math.round(w * 100) }, a.name + 'と' + b.name);
    }
    /* 孤独・病気 */
    var lo = L0.filter(function (p) { return p.m.fear > 55 || p.tr.ac > 0.6; })[0];
    if (lo && rng() < 0.3) { lo.m.fear = clamp(lo.m.fear + 4, 0, 100); ST.sayB(S, { actors: [lo], tag: '孤独', text: F(pk(S, T.LONELY), { a: lo.name }), why: '' }, lo.name + 'は宇宙の静けさに沈んだ'); }
    if (rng() < 0.12 + S.env.danger / 100 * 0.08) {
      var sk = rng.pick(L0); sk.m.hp = clamp(sk.m.hp - 12, 1, 100);
      ST.sayB(S, { actors: [sk], tag: '病気', text: F(pk(S, T.SICK), { a: sk.name }), why: '体力 -12' }, sk.name + 'が体調を崩した');
      heal(S, sk);
    }
  }
  function heal(S, p) {
    var dr = live(S).filter(function (q) { return q !== p && q.role === 'doctor'; })[0];
    if (!dr || S.rng() > 0.7) return;
    p.m.hp = clamp(p.m.hp + 10 + skill(dr, 'med') * 15, 0, 100);
    ST.sayB(S, { actors: [dr, p], tag: '治療', text: F(pk(S, SH.T.HEAL), { a: dr.name, b: p.name }), why: '船医の手当て' }, dr.name + 'が' + p.name + 'を手当てした');
  }

  /* ---------- 毎月の消耗 ---------- */
  function upkeep(S, m) {
    var sp = S.ship, L0 = live(S), rng = S.rng;
    sp.food = clamp(sp.food - L0.length * 0.8 - 1.5 + (S.planet && S.planet.at < m ? 3 : 0), 0, 100);
    sp.o2 = clamp(sp.o2 - 2 - (sp.power < 25 ? 6 : 0), 0, 100);
    sp.power = clamp(sp.power - 3, 0, 100);
    sp.morale = clamp(sp.morale - 2 + (S.planet ? 3 : 0), 0, 100);
    L0.forEach(function (p) {
      if (sp.food <= 0) p.m.hp -= 12;
      if (sp.o2 < 15) p.m.hp -= 10;
      if (sp.hull <= 0) p.m.hp -= 15;
      p.m.fear = clamp(p.m.fear + (sp.morale < 30 ? 4 : 1), 0, 100);
      p.m.hp = clamp(p.m.hp + (sp.food > 20 ? 4 : 0), 0, 100);
    });
    var cause = sp.food <= 0 ? '飢えで' : sp.o2 < 15 ? '空気が尽きかけて' : sp.hull <= 0 ? '壊れかけた船の中で' : '';
    L0.forEach(function (p) {
      if (p.m.hp > 0 || !p.alive) return;
      die(S, p, cause || '衰弱して', p.name + 'は、' + (cause || '衰弱して') + '静かに息を引き取った。');
    });
    if (sp.food < 15 && sp.food > 0 && rng() < 0.5) ST.sayB(S, { kind: 'phase', text: '食料の残りが、目に見えて少なくなっていた。配給が、また減らされた。', why: '食料 ' + Math.round(sp.food) }, '食料が乏しい');
  }

  /* ---------- 死 ---------- */
  function die(S, v, how, text) {
    if (!v || !v.alive) return;
    v.alive = false; v.fate = '死亡（' + S.m + 'か月目・' + how.replace(/で$|に$/, '') + '）';
    S.deaths.push(v);
    var o = ST.say(S, { actors: [v], tag: '死', kind: 'climax', text: text, why: how + '命を落とした', mag: 46 });
    ST.key(S, o, v.name + 'の死');
    S.ship.morale = clamp(S.ship.morale - 12, 0, 100);
    var g = live(S).filter(function (q) { return bond(S, q, v) >= 0.4; }).sort(function (a, b) { return bond(S, b, v) - bond(S, a, v); })[0];
    live(S).forEach(function (q) { q.m.fear = clamp(q.m.fear + 10 + Math.max(0, bond(S, q, v)) * 15, 0, 100); });
    if (g) ST.say(S, { actors: [g, v], tag: '弔い', text: F(pk(S, SH.T.GRIEF), { a: g.name, v: v.name }), why: g.name + 'と' + v.name + 'の関係' });
  }

  /* ---------- R18 ---------- */
  function r18on(S) { return R18ON && !HK.SAFE_ON && (S.env.slewd || 0) > 0; }
  function bodyFor(S, a, b) {
    var Pz = HK.Pos, o = Pz.order(a, b, [a, b]), t = o[0], u = o[1];
    if (Pz.hardTop(u)) return '';
    var R = SH.R18, pool = Pz.isF(t) && Pz.isF(u) ? R.ff : Pz.isF(t) ? R.ride : R.pen;
    return F(pk(S, pool), { t: t.name, u: u.name });
  }
  function nightR18(S) {
    var rng = S.rng, L0 = live(S), R = SH.R18;
    if (L0.length < 2 || rng() > S.env.slewd / 100 * 0.45) return;
    var pairs = [];
    L0.forEach(function (a) { L0.forEach(function (b) { if (a.i < b.i && HK.Pos.okSex(a, b) && !family(S, a, b) && (lover(S, a, b) || bond(S, a, b) > 0.25 || rng() < 0.15)) pairs.push([a, b]); }); });
    if (!pairs.length) return;
    var pr = HK.weighted(rng, pairs, function (x) { return 0.3 + Math.max(0, bond(S, x[0], x[1])) + (lover(S, x[0], x[1]) ? 1 : 0); }), a = pr[0], b = pr[1];
    var civ = S.planet && S.planet.civ.st >= 1 && /primitive|living|advanced|transcendent/.test(S.planet.civ.d.state) && rng() < 0.25;
    var pol = S.planet && S.planet.life.some(function (l) { return l.st >= 1 && l.d.kind === 'plant'; }) && rng() < 0.35;
    var open = F(pk(S, civ ? R.civ : pol ? R.pollen : R.open), { a: a.name, b: b.name });
    var body = bodyFor(S, a, b);
    if (!body) return;
    setRel(S, a, b, 0.2);
    a.cnt.r18 = (a.cnt.r18 || 0) + 1; b.cnt.r18 = (b.cnt.r18 || 0) + 1;
    var o = ST.say(S, { actors: [a, b], tag: civ ? '儀式の夜' : pol ? '花粉の夜' : '夜', kind: 'climax', text: open + body + F(pk(S, R.after), { a: a.name, b: b.name }), why: (civ ? '文明の歓迎の儀式' : pol ? '星の花粉にあてられた' : '閉ざされた船の夜') + '／関係の近さ ' + Math.round(bond(S, a, b) * 100), mag: 30 });
    if (!S.r18Key) { S.r18Key = true; ST.key(S, o, a.name + 'と' + b.name + 'の夜'); }
  }
  /* 異星の生き物：自分で攻めを選んだ人は、手懐けて主導権を握る */
  function alienR18(S, a, d) {
    var R = SH.R18, top = HK.Pos && HK.Pos.hardTop(a);
    if (!/friendly|symbiotic|parasite|plant/.test(d.kind)) return;
    ST.say(S, { actors: [a], tag: '異星の生き物', kind: 'climax', text: F(pk(S, top ? R.alienTop : R.alien), { a: a.name }), why: d.name + '（' + LIFE_JP[d.kind] + '）' + (top ? '／自分で攻めを選んでいるので、主導権を握った' : ''), mag: 28 });
  }

  /* ---------- 結果 ---------- */
  function lineOf(lab, o, key, extra) {
    var d = o.d, st = o.st;
    if (!st) return lab + '：？（未調査）';
    return lab + '：' + d.name + extra + '――' + ['', '手がかりのみ', '詳細まで判明', '最深部まで判明'][st];
  }
  function finish(S, input) {
    var P = S.P, Pn = S.planet, L0 = live(S);
    P.forEach(function (p) {
      if (!p.fate) p.fate = '生還';
      p.notes.push('役割：' + p.roleLabel + (p.picked ? '（指定）' : '（気質から）'));
      var bits = [];
      if (p.cnt.find) bits.push('発見・調査の成功 ' + p.cnt.find + '回');
      if (p.cnt.item) bits.push('持ち帰った物品 ' + p.cnt.item + 'つ');
      if (p.cnt.report) bits.push('レポート ' + p.cnt.report + '本');
      if (p.cnt.fix) bits.push('修理 ' + p.cnt.fix + '回');
      if (p.cnt.r18) bits.push('夜の出来事 ' + p.cnt.r18 + '回');
      if (bits.length) p.notes.push(bits.join('・'));
    });
    var reveal = 0, total = 0;
    if (Pn) { [Pn.res, Pn.civ].concat(Pn.life).forEach(function (o) { reveal += o.st; total += 3; }); }
    var pct = total ? Math.round(reveal / total * 100) : 0;
    var title = !L0.length ? '全滅 ― 船は誰も乗せないまま漂い続けた' : Pn ? Pn.name + 'に辿り着いた ― 珍しさ' + stars(Pn.rare) + '・判明度 ' + pct + '%' : '星は見つからなかった ― 一年の漂流';
    var lines = P.map(function (p) { return p.name + '（' + p.roleLabel + '）：' + p.fate; });
    var END = SH.T.END || {};
    lines.push(F(pk(S, !L0.length ? END.wiped : Pn ? END.found : END.none), { x: Pn ? Pn.name : '' }));
    if (Pn) {
      lines.push('星：' + Pn.name + '（珍しさ' + stars(Pn.rare) + '）');
      lines.push(lineOf('資源', Pn.res, 'res', Pn.res.st >= 2 ? '（' + USE_JP[Pn.res.d.use] + '・珍しさ' + stars(Pn.res.d.rare) + '）' : ''));
      if (Pn.life.length) Pn.life.forEach(function (l, k) { lines.push(lineOf('生命体' + (Pn.life.length > 1 ? (k + 1) : ''), l, 'life', l.st >= 2 ? '（' + LIFE_JP[l.d.kind] + '・珍しさ' + stars(l.d.rare) + '）' : '')); });
      else lines.push('生命体：いなかった');
      lines.push(lineOf('文明', Pn.civ, 'civ', Pn.civ.st >= 2 ? '（' + CIV_JP[Pn.civ.d.state] + '・珍しさ' + stars(Pn.civ.d.rare) + '）' : ''));
    }
    if (S.items.length) lines.push('持ち帰った物品：' + S.items.map(function (x) { return x.name; }).join('、'));
    if (S.reports.length) lines.push('書き上げたレポート：' + S.reports.map(function (x) { return '『' + x.title + '』（' + x.by + '）'; }).join('、'));
    var sp = S.ship;
    lines.push('船の状態：船体 ' + Math.round(sp.hull) + '・動力 ' + Math.round(sp.power) + '・生命維持 ' + Math.round(sp.o2) + '・食料 ' + Math.round(sp.food) + '・士気 ' + Math.round(sp.morale));
    var rows = P.map(function (p) { return { i: p.i, rank: '', cells: [p.roleLabel, p.cnt.find + '回', p.cnt.item + 'つ', p.cnt.report + '本', p.fate] }; });
    return ST.result(S, input, {
      ending: { title: title, kind: L0.length && Pn ? 'ok' : 'over', lines: lines },
      estats: [['星', Pn ? Pn.name : '―'], ['珍しさ', Pn ? stars(Pn.rare) : '―'], ['判明度', Pn ? pct + '%' : '―'], ['物品', S.items.length + 'つ'], ['レポート', S.reports.length + '本'], ['生還', L0.length + '/' + P.length + '人']],
      table: { title: '船員', hint: '調査：星の探索で成功した回数。', cols: ['役割', '調査', '物品', 'レポート', '結末'], rows: rows },
      meters: [{ label: '体力', color: '--accent' }, { label: '不安', color: '--enemy', dash: true }, { label: '発見', color: '--love', max: 6 }],
      meta: (Pn ? Pn.name : '星なし') + '・12か月',
      summary: '宇宙船漂流記：' + title
    });
  }
  SH.skill = skill; SH.bond = bond;
})();
