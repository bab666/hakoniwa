/* 箱庭シミュレーター: 吹雪の館の殺人（2〜10人）
   吹雪の山で遭難した一行が、地図にない館に辿り着く。館の中で殺人が起き、探偵役が推理で犯人を追う。
   ・探偵（ポンコツ探偵）を1〜4人。助手は探偵のバディになる
   ・館の主を決めなければNPCで、最初の犠牲者になる。決めていれば、最初の犠牲者は動機から決まる
   ・犯人（＋共犯）と動機は抽選。探偵が犯人のこともあり、そのときは助手やほかの人が探偵を引き継ぐ
   ・現場と手口とトリックは約100通り。痕跡を見つけられるかは、探偵役と犯人の能力のぶつかり合い
   ・結末：逮捕／自殺／吹雪の中へ逃走／探偵を襲う／濡れ衣／逃げおおせる … */
(function () {
  'use strict';
  var HK = window.HK, ST = HK.Story, Y = HK.YAKATA, clamp = HK.clamp;
  if (!ST || !Y || !Y.TRICKS || !Y.MOTIVES) return;
  var T = Y.T;
  function pk(S, a) { return ST.pick(S, a); }
  function F(t, m) { return ST.fmt(t, m); }

  var scen = {
    id: 'yakata', name: '吹雪の館の殺人', kicker: 'ミステリー（2〜10人）', solo: true, minCast: 2, maxCast: 10,
    desc: '吹雪の山で遭難した一行が辿り着いた、地図にない館。電話線は切れ、橋は落ちた。その夜、最初の死体が見つかる――。探偵役は推理で犯人を追い、犯人は痕跡を消して逃げ切ろうとする。犯人・動機・現場・トリックは毎回ちがう。',
    note: '※殺人の描写を含みます。登場人物はすべて成人として扱います。',
    unit: '日', simulate: function (input) { return run(input); },
    castHint: '2人から遊べます。「役割」で探偵（ポンコツ探偵も可）を1〜4人決めてください。決めなければ、いちばん推理力の高い人が探偵になります。助手は探偵のバディになります。館の主を決めなければ、館の主は登場人物ではない人物で、最初の犠牲者になります。犯人と動機は毎回抽選です（探偵が犯人のことも）。',
    env: [
      { id: 'days', label: '吹雪が止むまで', min: 2, max: 5, def: 3, lo: '2日', hi: '5日', unit: '日' },
      { id: 'serial', label: '連続殺人の起きやすさ', min: 0, max: 100, def: 50, lo: '一人だけ', hi: '次々に', desc: '高いほど、犯人は証拠を掴んだ人や探りを入れてきた人を口封じに殺しやすく、理由なく次を狙うこともある' },
      { id: 'hard', label: 'トリックの難しさ', min: 0, max: 100, def: 50, lo: '単純', hi: '難解' },
      { id: 'acc', label: '共犯者', type: 'select', def: 'random', options: [{ v: 'random', label: 'おまかせ' }, { v: 'yes', label: 'いる' }, { v: 'no', label: 'いない（単独犯）' }] },
      { id: 'motive', label: '動機', type: 'select', def: 'random', options: [{ v: 'random', label: 'おまかせ' }].concat(Y.MOTIVES.map(function (m) { return { v: m.id, label: m.cat + '：' + m.label }; })) }
    ],
    stats: [{ id: 'wit', label: '推理力', desc: '手がかりの見つけやすさ・推理の正確さ。犯人なら痕跡の消し方のうまさ' }, { id: 'nerve', label: '度胸', desc: '恐怖への強さ・腕っぷし。追い詰められたときの動きに効く' }],
    perFields: [{ id: 'role', label: '役割', auto: 'おまかせ（ゲストの職業を気質から）', groups: true, options: Y.ROLES.map(function (r) { return { id: r.id, label: r.label, group: r.group }; }) },
      /* 犯人になったときの動機（順22）。犯人に選ばれた人の動機は、その人の欄 > 全体の設定「動機」 > 抽選 */
      { id: 'motive', label: '犯人になったら（動機）', auto: 'おまかせ（全体の設定・抽選）', groups: true, options: Y.MOTIVES.map(function (m) { return { id: m.id, label: m.label, group: m.cat }; }) }].concat(HK.DGK ? [HK.DGK.KNOW] : []),
    actions: [], goals: [], events: []
  };
  HK.SCENARIOS.yakata = scen;
  var at = HK.SCEN_ORDER.indexOf('jashin');
  /* 並びに無ければ足す（分割読み込みでは目録の並びが中核で先に作られている） */
  if (HK.SCEN_ORDER.indexOf('yakata') < 0) HK.SCEN_ORDER.splice(at >= 0 ? at + 1 : HK.SCEN_ORDER.length, 0, 'yakata');

  /* ---------- 関係 ---------- */
  var W = { lover: 1, mate: 1, fated: 1, almost: 0.8, fwb: 0.45, sibling: 0.8, sibprot: 0.95, sibclose: 0.9, parent: 0.95, pparent: 0.9, best: 0.75, buddy: 0.8, childhood: 0.7, friend: 0.5, mentor: 0.6, master: 0.6, teacher: 0.5, senpai: 0.4, colleague: 0.3, classmate: 0.4, boss: 0.45, benefactor: 0.6, relative: 0.6, worship: 0.85, fond: 0.55, blind: 0.75, acq: 0.1, ex: 0.3, rival: -0.3, enemy: -0.7 , sibbad: -0.15, bad: -0.4 };
  function ties(S, a, b) { return a && b && a.i != null && b.i != null ? S.ties.filter(function (t) { return (t.a === a.i && t.b === b.i) || (t.a === b.i && t.b === a.i); }) : []; }
  function bond(S, a, b) {
    var best = 0, neg = 0;
    ties(S, a, b).forEach(function (t) { var w = t.type === 'crush' ? (t.a === a.i ? 0.85 : 0.15) : W[t.type] != null ? W[t.type] : 0.1; if ((t.type === 'enemy' || t.type === 'bad') && t.cold && t.a !== a.i) w = { none: 0, normal: 0.1, friend: 0.5, love: 0.9 }[t.cold] || 0; if (w > best) best = w; if (w < neg) neg = w; });
    var base = best > 0 ? best + neg * 0.3 : neg;
    /* 館で深まった（こじれた）分を足す */
    return clamp(base + ((S.relD && S.relD[rk(a, b)]) || 0), -1, 1.2);
  }
  function rk(a, b) { return a.i < b.i ? a.i + '-' + b.i : b.i + '-' + a.i; }
  function pq(S, key, p, m) { var t = Y.PQ[key]; return F(pk(S, t[p.persona] || t.gentle), m); }
  function hasTie(S, a, b, list) { return ties(S, a, b).some(function (t) { return list.split(',').indexOf(t.type) >= 0; }); }
  /* 家族（きょうだい・親子・親族など）で「恋愛：なし」の二人（ties.js の HK.tieNoLove）。「恋愛：あり」の家族・擬似親子はほかの組と同じ */
  function kinNo(S, a, b) { return ties(S, a, b).some(function (t) { return !!(HK.tieNoLove && HK.tieNoLove(t)); }); }
  function cat(S, a, b) { var w = bond(S, a, b); if (w <= -0.2) return 'bad'; if (hasTie(S, a, b, 'lover,mate,fated,almost,crush,fwb')) return 'love'; if (hasTie(S, a, b, 'sibling,sibprot,sibclose,sibbad,parent,pparent')) return 'family'; return w >= 0.3 ? 'close' : ''; }
  /* 両片想い：どちらからも片想いがある二人（恋人になったら外れる） */
  function crushTo(S, a, b) { return S.ties.some(function (t) { return t.type === 'crush' && t.a === a.i && t.b === b.i; }); }
  function pining(S, a, b) { return !!(a && b && a !== b && a.i != null && b.i != null) && crushTo(S, a, b) && crushTo(S, b, a) && !hasTie(S, a, b, 'lover,mate,fated'); }
  function relLabel(S, a, b) {
    var both = a && b && crushTo(S, a, b) && crushTo(S, b, a), one = false;
    return ties(S, a, b).map(function (t) { if (both && t.type === 'crush') { if (one) return null; one = true; return '両片想い'; } return HK.tieLabel ? HK.tieLabel(t) : HK.TIES && HK.TIES[t.type] ? HK.TIES[t.type].label : t.type; }).filter(function (x) { return x; }).join('・');
  }

  /* ---------- 能力 ---------- */
  function role(p) { return Y.ROLE[p.role] || Y.ROLE.civ; }
  function skill(p, type) {
    var t = p.tr, w = (p.stats.wit || 3), n = (p.stats.nerve || 3);
    var base = { obs: t.a * 0.45 + t.caution * 0.3, lore: t.a * 0.5, talk: t.warmth * 0.4 + t.np * 0.2 + t.fc * 0.1, med: t.a * 0.15, search: t.impulse * 0.25 + t.fc * 0.2 + n * 0.03, spirit: t.ac * 0.15 + t.np * 0.1, fight: t.cp * 0.2 + t.aggr * 0.2 + n * 0.06, hide: t.a * 0.2 + t.cold * 0.3 + (1 - t.honesty) * 0.3 + t.caution * 0.15 }[type] || 0;
    var bonus = (role(p).sk || {})[type] || 0;
    if (type === 'obs' || type === 'lore' || type === 'hide') bonus += (w - 3) * 0.06;
    if (p.acting) bonus += p.acting;
    if (type === 'med' && p.kn) bonus += p.kn * 0.22;
    return clamp(base + bonus - (type !== 'hide' ? p.m.fear / 500 : 0), 0, 1.3);
  }
  function alive(p) { return p.alive && !p.gone; }
  function names(l) { return l.map(function (p) { return p.name; }).join('・'); }
  function inv(S) { return S.P.filter(function (p) { return alive(p) && p.isDet && !p.bound; }); }
  function label(day, ph) { return day + '日目・' + ph; }
  /* 蘇った不死・吸血鬼（yakata-special.js の k.revived）は被害者から外す（順167）。いちばん新しい「蘇っていない」事件。なければ最後の事件 */
  function lastDead(S) { for (var i = S.kills.length - 1; i >= 0; i--) if (!S.kills[i].revived) return S.kills[i]; return S.kills[S.kills.length - 1]; }
  /* 推理・捜査の文の「被害者」：最初の被害者が蘇っていれば、蘇っていない被害者の名前 */
  function vicName(S) { var k0 = S.kills[0]; if (!k0 || !k0.revived) return S.v1.name; var k = lastDead(S); return k && !k.revived ? k.v.name : S.v1.name; }
  Y.lastDead = lastDead;

  function run(input) {
    var S = ST.state(input, 'yakata'), rng = S.rng, env = S.env, P = S.P;
    /* 結果に「最も心を寄せた相手」とエゴグラムとの比較を出す（solo-story-kit.js） */
    S.egoNotes = true; S.bondFn = bond;
    /* 恋愛・R18にしない組（HK.ngPair）には、恋愛の関係（恋人・セフレ・片想いなど）を当てない（ties.js と同じ） */
    S.ties = (input.ties || []).filter(function (t) { return t.a !== t.b && t.a < P.length && t.b < P.length && !(HK.ngPair(P[t.a], P[t.b]) && /^(lover|fwb|mate|fated|crush|almost|ex|yan)$/.test(t.type)); });
    S.M = rng.pick(Y.MANSIONS); S.kills = []; S.pool = []; S.need = 4; S.fake = 0; S.framed = null; S.over = null; S.notes = [];
    /* ---------- 役割 ---------- */
    P.forEach(function (p) {
      var pc = (input.perChar && input.perChar[p.i]) || {}, want = (pc.pick || {}).role;
      p.role = Y.ROLE[want] ? want : HK.weighted(rng, Object.keys(Y.AUTO), function (k) { return Math.pow(Math.max(0.05, Y.AUTO[k](p.tr)), 2.5); });
      p.picked = !!Y.ROLE[want];
      p.alive = true; p.gone = false; p.bound = false; p.isDet = p.role === 'detective' || p.role === 'ponkotsu';
      p.m = { fear: 10 + p.tr.ac * 10, sus: 15, clue: 0 }; p.cnt = { clue: 0, act: 0 }; p.buddies = [];
      p.roleLabel = role(p).label;
      /* 検死の知識（deathgame-kit.js）。医師はもともと専門家 */
      if (HK.DGK) HK.DGK.init(rng, p, { knMin: p.role === 'doctor' ? 2 : 0 });
    });
    var dets = P.filter(function (p) { return p.isDet; });
    if (!dets.length) {
      var best = P.filter(function (p) { return p.role !== 'host'; }).sort(function (a, b) { return (b.tr.a + (b.stats.wit || 3) * 0.1) - (a.tr.a + (a.stats.wit || 3) * 0.1); })[0] || P[0];
      best.role = 'detective'; best.isDet = true; best.roleLabel = '名探偵'; best.autoDet = true; S.notes.push('探偵役が決められていなかったので、推理力のいちばん高い' + best.name + 'が名探偵になった');
    } else if (dets.length > 4) {
      dets.slice(4).forEach(function (p) { p.isDet = false; p.role = 'civ'; p.roleLabel = '一般人'; });
      S.notes.push('探偵は4人までなので、5人目以降は一般人として参加した');
    }
    dets = P.filter(function (p) { return p.isDet; });
    /* 助手は探偵のバディに（関係の深い探偵を優先） */
    P.filter(function (p) { return p.role === 'assistant'; }).forEach(function (a) {
      var d = dets.slice().sort(function (x, y) { return (bond(S, a, y) * 3 - y.buddies.length) - (bond(S, a, x) * 3 - x.buddies.length); })[0];
      if (d) { a.buddy = d; d.buddies.push(a); }
    });
    /* 館の主 */
    var hosts = P.filter(function (p) { return p.role === 'host'; });
    hosts.slice(1).forEach(function (p) { p.role = 'heir'; p.roleLabel = '館の主の親族'; });
    S.host = hosts[0] || { name: rng.pick(Y.HOSTS), npc: true, alive: true, i: null, tr: HK.traits({ CP: 16, NP: 6, A: 14, FC: 8, AC: 6 }), m: {}, cnt: {} };

    /* ---------- 犯人と動機 ---------- */
    var cands = P.slice();
    var cul = HK.weighted(rng, cands, function (p) {
      var t = p.tr, w = 0.5 + t.cold * 0.8 + t.aggr * 0.5 - t.warmth * 0.5 + (1 - t.honesty) * 0.4;
      w *= p.role === 'detective' ? 0.15 : p.role === 'ponkotsu' ? 0.2 : p.role === 'assistant' ? 0.6 : p.role === 'host' || p.role === 'heir' || p.role === 'butler' ? 1.3 : 1;
      return Math.max(0.05, w);
    });
    /* 三角関係：犯人が片想いしている相手に、恋人がいる */
    var tri = [];
    P.forEach(function (x) { if (x !== cul && S.ties.some(function (t) { return t.type === 'crush' && t.a === cul.i && t.b === x.i; })) P.forEach(function (v) { if (v !== cul && v !== x && hasTie(S, x, v, 'lover,mate,fated,almost')) tri.push({ x: x, v: v }); }); });
    /* R18版：快楽殺人の起きやすさ（solo-yakata-r18.js が決める。'yes'=快楽殺人にする 'no'=選ばない） */
    /* 動機の決まり方（順22）：犯人の欄「犯人になったら（動機）」 > 全体の設定「動機」 > 抽選 */
    var ownMot = Y.MOTIVE[(((input.perChar && input.perChar[cul.i]) || {}).pick || {}).motive] || null;
    var setMot = ownMot || Y.MOTIVE[env.motive] || null;
    S.motSrc = ownMot ? '（' + cul.name + 'の欄で指定した動機）' : Y.MOTIVE[env.motive] ? '（全体の設定で指定した動機）' : '';
    var pz = !setMot && Y.R18 && Y.R18.pleasure ? Y.R18.pleasure(S, env, cul) : null;
    var mot = setMot || (pz === 'yes' && Y.MOTIVE.pleasure) || HK.weighted(rng, Y.MOTIVES, function (m) {
      var w = Math.max(0.05, m.fit(cul.tr)) * (m.jobs && m.jobs.split(',').indexOf(cul.role) >= 0 ? 3 : 1);
      if (m.tie) w *= P.some(function (q) { return q !== cul && hasTie(S, cul, q, m.tie); }) ? 3 : 0.25;
      if (S.host.npc && !m.host) w *= 0.08;
      if (m.pair && P.length < 3) w *= 0.1;
      if (m.id === 'framesuicide') w *= 0.4;
      if (m.triangle) w *= tri.length && !S.host.npc ? 12 : 0;
      if (m.id === 'pleasure') w *= pz === 'no' ? 0 : 0.7;
      if (m.id === 'split' || m.id === 'accident') w *= 0.6;
      return w;
    });
    S.cul = cul; S.mot = mot; cul.isCul = !mot.nobody;
    if (cul.isDet) { cul.fakeDet = true; cul.isDet = false; }
    /* 共犯 */
    var wantAcc = !mot.nobody && env.acc === 'yes' || (env.acc === 'random' && P.length >= 4 && rng() < (mot.pair ? 0.85 : 0.3));
    if (mot.pair && P.length >= 3 && !mot.nobody) wantAcc = env.acc !== 'no';
    if (wantAcc && P.length >= 3) {
      var ac = P.filter(function (q) { return q !== cul && !q.isDet; }).sort(function (a, b) { return (bond(S, b, cul) + b.tr.cold * 0.3 + (mot.id === 'loyal' && (b.role === 'host' || hasTie(S, cul, b, 'master')) ? 1 : 0)) - (bond(S, a, cul) + a.tr.cold * 0.3 + (mot.id === 'loyal' && (a.role === 'host' || hasTie(S, cul, a, 'master')) ? 1 : 0)); })[0];
      if (ac) { S.acc = ac; ac.isAcc = true; }
    }
    /* 最初の犠牲者 */
    var pool = P.filter(function (q) { return q !== cul && q !== S.acc; });
    /* 殺さない（attr.js の HK.Attr.noKillPair）相手は、ほかに狙える人がいれば最初の犠牲者にしない（same-story.js） */
    if (HK.SameStory && HK.SameStory.spare) pool = HK.SameStory.spare(S, cul, pool);
    var v1;
    var tr0 = mot.triangle && tri.length ? rng.pick(tri) : null;
    if (S.host.npc) v1 = S.host;
    else if (tr0) v1 = tr0.v;
    else {
      v1 = HK.weighted(rng, pool, function (q) {
        var w = 1;
        if (mot.tie && hasTie(S, cul, q, mot.tie)) w *= 8;
        if (mot.id === 'revenge' || mot.id === 'impulse') w *= 1 + Math.max(0, -bond(S, cul, q)) * 6;
        if (mot.id === 'inherit' && (q.role === 'host')) w *= 10;
        if (mot.id === 'blackmail' && /reporter|lawyer|streamer/.test(q.role)) w *= 5;
        if (mot.id === 'jealous' && (q.role === cul.role || hasTie(S, cul, q, 'rival,ex,crush'))) w *= 6;
        if (mot.id === 'defense') w *= 1 + q.tr.aggr * 3;
        if (q.isDet) w *= mot.id === 'fame' ? 0.5 : 0.25;
        return w;
      }) || pool[0];
    }
    if (!v1) v1 = S.host;
    S.v1 = v1;
    S.x = tr0 ? tr0.x : mot.triangle ? rng.pick(pool.filter(function (q) { return q !== v1; })) || S.acc : mot.id === 'mistake' ? rng.pick(pool.filter(function (q) { return q !== v1; }).concat(S.host.npc ? [S.host] : [])) : S.acc;
    S.planned = (mot.serial || 0) + (env.serial > 70 ? 1 : 0);
    /* 探偵が犯人なら、ほかの誰かが探偵役を引き継ぐ */
    if (!inv(S).length) successor(S, null, true);
    S.cnt0 = 0;

    /* 特殊役職（不死・吸血鬼）（yakata-special.js） */
    if (Y.SPEC) Y.SPEC.setup(S, input);

    /* ---------- 到着 ---------- */
    ST.step(S, '1日目・夕方');
    ST.say(S, { kind: 'phase', text: pk(S, T.ARRIVE) + '館の名は、' + S.M + '。' + (S.host.npc ? F(pk(S, T.HOST_NPC), { h: S.host.name }) : F(pk(S, T.HOST_PC), { h: S.host.name, m: S.M })) + pk(S, T.SEAL) + (HK.Attr && HK.Attr.raceIntro ? HK.Attr.raceIntro(P, 'trapped', S) : '') });
    arrive(S);
    if (Y.FEUD) Y.FEUD.arrive(S);
    ST.snap(S, ['fear', 'sus', 'clue']);

    /* ---------- 夜ごとに ---------- */
    for (var day = 1; day <= env.days + 1 && !S.over; day++) {
      ST.step(S, label(day, '夜'));
      ST.budget(S, 4);
      ST.say(S, { kind: 'phase', text: pk(S, T.NIGHT) });
      S.curDay = day;
      nightScenes(S, day);
      if (Y.SPEC) Y.SPEC.night(S, day);
      if (day === 1) murder(S, S.v1, day, true);
      else if (day <= env.days && !(Y.R18 && Y.R18.on(S) && (Y.R18.night(S, day) || (Y.R18.extra && Y.R18.extra(S, day))))) nightMurder(S, day);
      ST.flushShort(S, 'ほかに：');
      if (S.over) break;
      if (day > env.days) break;
      /* 朝：発見 */
      ST.step(S, label(day + 1, '朝'));
      ST.budget(S, 4);
      discover(S, day + 1);
      if (Y.SPEC) Y.SPEC.revive(S, day + 1, 'morning');
      ST.flushShort(S, 'ほかに：');
      if (S.over) break;
      /* 昼と夕方：捜査 */
      ['昼', '夕方'].forEach(function (ph, k) {
        if (S.over) return;
        ST.step(S, label(day + 1, ph));
        ST.budget(S, 4 + Math.ceil(P.length / 3));
        if (Y.SPEC) Y.SPEC.revive(S, day + 1, k ? 'eve' : 'noon');
        investigate(S);
        others(S);
        /* 職業の捜査・職業×職業の出来事（yakata-jobs.js・yakata-jobs-pair.js） */
        if (Y.JOBS) Y.JOBS.tick(S, day + 1, k);
        if (Y.FEUD) Y.FEUD.tick(S, day + 1);
        bondTick(S);
        flirt(S, k ? 'evening' : 'day');
        culpritMove(S);
        ST.flushShort(S, 'ほかに：');
        deduce(S, day >= env.days && k === 1);
        P.forEach(function (p) { if (alive(p)) { p.m.fear = clamp(p.m.fear + 2, 0, 100); p.m.clue = p.cnt.clue; } });
        if (Y.SPEC) Y.SPEC.wear(S, day + 1, k ? 'eve' : 'noon');
        ST.snap(S, ['fear', 'sus', 'clue']);
      });
    }
    if (!S.over) finale(S);
    return finish(S, input);
  }


  /* ---------- 到着の場面（同じ文が全員分並ばないよう、まとめて語る） ---------- */
  function join(l) { var n = l.map(function (p) { return p.name + '（' + p.roleLabel + '）'; }); return n.length <= 2 ? n.join('と') : n.slice(0, -1).join('・') + 'と' + n[n.length - 1]; }
  function arrive(S) {
    var rng = S.rng, P = S.P, A = Y.ARR, done = [];
    /* 関係のある人どうしは、一緒にやってきたグループ */
    var seen = {};
    P.forEach(function (p0) {
      if (seen[p0.i]) return;
      var g = [p0], k = 0; seen[p0.i] = 1;
      while (k < g.length) { var q = g[k++]; P.forEach(function (r) { if (!seen[r.i] && ties(S, q, r).length) { seen[r.i] = 1; g.push(r); } }); }
      if (g.length < 2) return;
      var rel = [];
      g.forEach(function (a) { g.forEach(function (b) { if (a.i < b.i && ties(S, a, b).length) rel.push(a.name + 'と' + b.name + '（' + relLabel(S, a, b) + '）'); }); });
      var c = cat(S, g[0], g[1]), first = ties(S, g[0], g[1])[0], kind = first && first.type === 'crush' ? 'crush' : c || 'close';
      if (g.length > 2) kind = g.some(function (a) { return g.some(function (b) { return a !== b && bond(S, a, b) < -0.2; }); }) ? 'mixed' : 'many';
      var x = g[0], y = g[1];
      if (kind === 'crush' && pining(S, x, y)) kind = 'pining';
      if (kind === 'crush' && first.a === g[1].i) { x = g[1]; y = g[0]; }
      ST.say(S, { actors: g, tag: '一行', text: F(pk(S, A.GROUP[kind]), { n: join(g), a: x.name, b: y.name }), why: '関係のある人どうしで、一緒にやってきた：' + rel.join('／') });
      g.forEach(function (p) { done.push(p); });
    });
    /* 探偵役・館の人は、一人ずつ（性格で言い回しが変わる） */
    P.forEach(function (p) {
      var pool = A.ROLE[p.role];
      if (!pool || p.role === 'assistant' && p.buddy) return;
      var t = F(pk(S, pool[p.top] || pool.all || pool.A || pool[Object.keys(pool)[0]]), { a: p.name });
      var bud = p.buddies && p.buddies.filter(function (b) { return b.role === 'assistant'; });
      if (bud && bud.length) t += F(pk(S, bud.length > 1 ? A.BUDDY.filter(function (l) { return !/「/.test(l); }) : A.BUDDY), { a: p.name, b: bud.map(function (b) { return b.name; }).join('と'), sensei: sensei(bud[0], p) });
      ST.say(S, { actors: [p].concat(bud || []), tag: p.roleLabel, text: p.name + '（' + p.roleLabel + '）' + t, why: '役割：' + p.roleLabel + (p.autoDet ? '（推理力から）' : p.picked ? '（指定）' : '（気質から）') + '・' + role(p).desc + (bud && bud.length ? '／助手（バディ）：' + bud.map(function (b) { return b.name; }).join('・') : '') });
      done.push(p); (bud || []).forEach(function (b) { done.push(b); });
    });
    /* それ以外の人は、性格（いちばん強い因子）ごとに一文でまとめる */
    var rest = P.filter(function (p) { return done.indexOf(p) < 0; }), byTop = {};
    rest.forEach(function (p) { (byTop[p.top] = byTop[p.top] || []).push(p); });
    Object.keys(byTop).forEach(function (k) {
      var l = byTop[k];
      ST.say(S, { actors: l, tag: '到着', text: F(pk(S, l.length > 1 ? A.MOOD_MANY[k] || A.MOOD_MANY.AC : A.MOOD[k] || A.MOOD.AC), { n: join(l) }), why: l.map(function (p) { return p.name + '：' + p.roleLabel + (p.picked ? '（指定）' : '（気質から）'); }).join('／') + '。言い回しはいちばん強い因子（' + k + '）から' });
    });
    /* 芸能人の思い込み */
    P.forEach(function (p) {
      if (p.role === 'celeb' && rng() < 0.55 + p.tr.fc * 0.3 - p.tr.caution * 0.3) { p.prank = true; ST.sayB(S, { actors: [p], tag: '企画？', text: F(Y.T.CELEB[0], { a: p.name }), why: '芸能人は、これをマーダーミステリーの企画だと思い込んだ（怖がらない）' }, p.name + 'は企画だと思った'); }
    });
    S.notes.forEach(function (n) { ST.say(S, { kind: 'phase', text: '※' + n }); });
  }

  /* ---------- 殺人 ---------- */
  function pickTrick(S) {
    var rng = S.rng, used = S.kills.map(function (k) { return k.trick; }), hard = S.env.hard / 50 + 1;
    return HK.weighted(rng, Y.TRICKS.filter(function (t) { return used.indexOf(t) < 0; }), function (t) { return 1 / (1 + Math.abs(t.diff - hard)) * (Y.JOBS ? Y.JOBS.trickW(S, t) : 1); });
  }
  function fmtV(S, v) {
    var rng = S.rng, inn = S.P.filter(function (q) { return alive(q) && q !== S.cul && q !== v; });
    return { v: v.name, c: S.cul.name, b: inn.length ? rng.pick(inn).name : '館の使用人', x: S.x ? S.x.name : '誰か', h: S.host.name };
  }
  function murder(S, v, day, first) {
    var tr = pickTrick(S), m = fmtV(S, v);
    var k = { v: v, trick: tr, day: day, m: m, nk: HK.SameStory && HK.SameStory.note ? HK.SameStory.note(S, S.cul, v) : '' };
    S.kills.push(k);
    v.alive = false; v.fate = '殺された（' + day + '日目の夜・' + tr.place + '）';
    /* 手がかり：最初の事件は3つ＋動機、次からは1つずつ */
    var cs = tr.clues.map(function (c) { return { type: c.type, t: F(c.t, m), kill: k }; });
    if (first) { cs.forEach(function (c) { S.pool.push(c); }); S.pool.push({ type: S.mot.clue.split(':')[0], t: F(S.mot.clue.slice(S.mot.clue.indexOf(':') + 1), m), motive: true }); }
    else { var c1 = S.rng.pick(cs); c1.extra = true; S.pool.push(c1); }
    if (S.mot.sloppy && first) S.sloppy = true;
  }
  function nightMurder(S, day) {
    var rng = S.rng, c = S.cul, sv = S.env.serial / 100;
    if (!alive(c) || c.bound || S.mot.nobody) return;
    var found = S.pool.filter(function (x) { return x.found && !x.fake; }).length;
    var live = S.P.filter(function (q) { return alive(q) && q !== c && q !== S.acc; });
    if (!live.length) return;
    if (S.forceTgt) { var ft = S.forceTgt; S.forceTgt = null; if (alive(ft) && !HK.Dark.skip(S, 'kill')) { S.nextWhy = S.forceWhy; murder(S, ft, day, false); S.kills[S.kills.length - 1].why = S.nextWhy; S.newKill = true; return; } }
    /* 危ない相手：証拠を多く掴んでいる人・探りを入れてきた人・探偵 */
    var danger = function (q) { return q.cnt.clue * 2 + (q.approached ? 3 : 0) + (q.isDet ? 1.5 : 0) + (S.mot.triangle && q === S.x ? -5 : 0); };
    var top = live.slice().sort(function (a, b) { return danger(b) - danger(a); })[0];
    var threat = danger(top) >= 2 || found >= S.need - 1 || c.m.sus > 60;
    var plan = S.kills.length - 1 < S.planned;
    var ch = plan ? 0.45 + sv * 0.4 : threat ? (0.08 + sv * 0.72) * (0.6 + c.tr.aggr * 0.3 + c.tr.cold * 0.3) : sv * 0.25;
    if (live.length === 1) ch *= 0.5;
    ch *= HK.Dark.pick(S, 0.2, 1, 1.8, 'kill');   /* 展開の重さ（mood-dial.js） */
    if (S.kills.length >= 5 || rng() > ch) return;
    /* 狙い：追い詰められていれば口封じ。計画どおりなら次の獲物。口封じに共犯も */
    var tgt, why;
    if (threat && (!plan || rng() < 0.6)) { tgt = top; why = top.approached ? '探りを入れてきた' + top.name + 'の口を封じた' : top.cnt.clue ? '証拠を掴んでいた' + top.name + 'の口を封じた' : '探偵の' + top.name + 'を消そうとした'; }
    else if (S.acc && alive(S.acc) && rng() < 0.15 + S.cul.tr.cold * 0.2) { tgt = S.acc; why = '共犯の' + S.acc.name + 'の口を封じた'; }
    else { tgt = HK.weighted(rng, live, function (q) { return (1 + Math.max(0, -bond(S, c, q)) * 3 - Math.max(0, bond(S, c, q)) * 0.8 - (S.mot.triangle && q === S.x ? 0.9 : 0)) * (Y.SPEC ? Y.SPEC.danger(q) : 1); }); why = plan ? '最初から次の獲物を決めていた（動機「' + S.mot.label + '」）' : '連続殺人（起きやすさ ' + S.env.serial + '）'; }
    if (!tgt) return;
    /* 殺さない相手は、ほかに狙える人がいれば避ける（いなければ、やむを得ず。発見の理由書きに添える） */
    if (HK.SameStory && HK.SameStory.nk && HK.SameStory.nk(S, c, tgt)) {
      var nkAlt = HK.SameStory.spare(S, c, live).filter(function (q) { return q !== tgt && !HK.SameStory.nk(S, c, q); });
      if (nkAlt.length) { tgt = nkAlt.sort(function (a, b) { return danger(b) - danger(a); })[0]; why += '（殺さないと決めた相手を避けて、' + tgt.name + 'を狙った）'; }
    }
    S.nextWhy = why;
    /* 占い師の予見・バディの守り */
    var seer = S.P.filter(function (q) { return alive(q) && q.role === 'seer' && q !== c; })[0];
    if (seer && rng() < 0.3) { ST.say(S, { actors: [seer, tgt], tag: '予見', text: F(pk(S, T.SEER), { a: seer.name, b: tgt.name }) + '一行は、' + tgt.name + 'の部屋の前で夜通し見張りをした。', why: '占い師の予見で、犯行を防いだ', mag: 24 }); c.m.sus = clamp(c.m.sus + 8, 0, 100); return; }
    /* 愛憎の相手は、身を挺して守る（yakata-feud.js） */
    if (Y.FEUD && Y.FEUD.guard(S, tgt, c)) return;
    /* 閉じ込められた人（濡れ衣・推理の誤り：bound）・発狂中の人は、守りに入れない */
    var guard = (tgt.isDet ? tgt.buddies.filter(alive) : S.P.filter(function (q) { return alive(q) && q !== c && q !== tgt && bond(S, q, tgt) >= 0.75; })).filter(function (q) { return !q.bound && !q.mad; })[0];
    if (guard && rng() < 0.45) {
      if (rng() < skill(guard, 'fight') + 0.25) {
        c.m.sus = clamp(c.m.sus + 25, 0, 100);
        var hint = gain(S, guard, 'obs');
        ST.say(S, { actors: [guard, tgt], tag: '夜襲', kind: 'climax', text: '深夜、' + tgt.name + 'の部屋に何者かが忍び込んだ。' + F(pk(S, T.BUDDY_SAVE), { a: tgt.name, b: guard.name }) + '影は窓から逃げていった。' + (hint ? '――' + hint + '。' : ''), why: guard.name + 'が' + tgt.name + 'を守った（' + (tgt.isDet ? 'バディ' : '関係：' + relLabel(S, guard, tgt)) + '）', mag: 34 });
        return;
      }
      ST.say(S, { actors: [guard, tgt], tag: '夜襲', kind: 'climax', text: '深夜、' + tgt.name + 'の部屋に何者かが忍び込んだ。' + F(pk(S, T.BUDDY_SAVE), { a: tgt.name, b: guard.name }), why: guard.name + 'が' + tgt.name + 'をかばった', mag: 34 });
      tgt = guard;
    }
    murder(S, tgt, day, false);
    S.kills[S.kills.length - 1].why = S.nextWhy;
    S.newKill = true;
  }
  /* 夜の場面（寄り添う・閉じこもる） */
  function nightScenes(S, day) {
    /* 閉じ込められている人（濡れ衣・推理の誤り：bound）は、寄り添う・閉じこもる場面に出さない */
    var rng = S.rng, live = S.P.filter(function (q) { return alive(q) && !q.bound; });
    var pairs = [];
    /* 寄り添うのは、避けていない側から（一人目が寄り添う側。お互いに避けている二人は寄り添わない。avoid-kit.js の HK.Avoid。2026-10-28） */
    live.forEach(function (a) { live.forEach(function (b) { if (a.i < b.i && cat(S, a, b) === 'love') { var ld = HK.Avoid ? HK.Avoid.lead(S, a, b) : [a, b]; if (ld) pairs.push(ld); } }); });
    /* 向きの決まらない組（HK.Pos.okSex でない二人）は、寄り添って夜を過ごさず、交代で見張って明かす */
    if (pairs.length && rng() < 0.5) { var pr = rng.pick(pairs); pr.forEach(function (p) { p.m.fear = clamp(p.m.fear - 8, 0, 100); }); ST.sayB(S, { actors: pr, tag: '夜', text: pining(S, pr[0], pr[1]) && T.PINE_NIGHT && (!HK.Pos || HK.Pos.okSex(pr[0], pr[1])) ? F(pk(S, T.PINE_NIGHT), { a: pr[0].name, b: pr[1].name }) : pr[0].name + 'と' + pr[1].name + (HK.Pos && !HK.Pos.okSex(pr[0], pr[1]) ? 'は、同じ部屋で交代に見張りをしながら夜を明かした。扉の向こうの物音に、二人で耳を澄ませた。' : 'は、同じ部屋で夜を明かした。互いの体温だけが、確かなものだった。'), why: '関係：' + relLabel(S, pr[0], pr[1]) + (HK.Avoid && HK.Avoid.of(S, pr[1], pr[0]) ? '／' + HK.Avoid.note(S, pr[1], pr[0]) : '') }, pr[0].name + 'と' + pr[1].name + 'が寄り添った'); }
    var sc = live.filter(function (p) { return p.m.fear > 60; })[0];
    if (sc && rng() < 0.5) { sc.locked = true; ST.sayB(S, { actors: [sc], tag: '恐怖', text: F(pk(S, T.PANIC), { a: sc.name }), why: '恐怖 ' + Math.round(sc.m.fear) }, sc.name + 'は閉じこもった'); }
    flirt(S, 'night');
  }
  /* ---------- 恋人どうしのいちゃつき（順23。日常キットの館の場面 HK.Daily.storyLove：談話室・暖炉の前・客室・雪の中庭） ----------
     恋人・夫婦（恋人に開く）・運命の番・番と、互いに本命の二人だけ。HK.canLove を両方向・恋愛にしない組（ngPair）・恋愛なしの家族は除く。
     死んだ人・閉じ込められた人・発狂中・部屋に閉じこもった人は出さない。一回に4場面まで */
  function loverPairs(S) {
    var live = S.P.filter(function (p) { return alive(p) && !p.bound && !p.mad && !p.locked; }), out = [];
    live.forEach(function (a) {
      live.forEach(function (b) {
        if (a.i >= b.i) return;
        if (!(hasTie(S, a, b, 'lover,mate,fated') || (a.honmei === b.i && b.honmei === a.i))) return;
        if (kinNo(S, a, b) || (HK.ngPair && HK.ngPair(a, b)) || (HK.canLove && !(HK.canLove(a, b) && HK.canLove(b, a)))) return;
        out.push([a, b]);
      });
    });
    return out;
  }
  function flirt(S, time) {
    if (!HK.Daily || !HK.Daily.storyLove || (S.flirtN || 0) >= 4) return;
    var ps = loverPairs(S), rng = S.rng;
    if (!ps.length || rng() > 0.3) return;
    var pr = rng.pick(ps), x = rng() < 0.5 ? pr[0] : pr[1], y = x === pr[0] ? pr[1] : pr[0];
    var r = HK.Daily.storyLove(S, 'yakata', x, y, time);
    if (!r) return;
    S.flirtN = (S.flirtN || 0) + 1;
    x.m.fear = clamp(x.m.fear - 6, 0, 100); y.m.fear = clamp(y.m.fear - 6, 0, 100);
    setRel(S, x, y, 0.05);
    ST.sayB(S, { actors: [x, y], tag: '恋人', text: r.text, why: '恋人どうしの、つかの間の時間（' + r.label + '・関係：' + (relLabel(S, x, y) || '本命どうし') + '）。二人の恐怖が少し和らいだ' }, x.name + 'と' + y.name + 'が寄り添った');
  }

  /* ---------- 発見 ---------- */
  function discover(S, day) {
    var rng = S.rng, k = S.kills[S.kills.length - 1];
    if (!k || k.found) { if (S.drugNight !== S.curDay) ST.say(S, { kind: 'phase', text: pk(S, T.MORNING.slice(0, 2)) + 'この夜は、何も起きなかった。' }); return; }
    k.found = true;
    /* 見つけるのは、閉じ込められていない人（閉じ込められた人が現場で悲鳴を上げない） */
    var live = S.P.filter(alive), free = live.filter(function (q) { return !q.bound; }), finder = rng.pick(free.filter(function (q) { return !q.isCul; }).concat(free.length ? free : live)) || live[0];
    var t = F(pk(S, T.FIND), { a: finder.name, p: k.trick.place }) + F(k.trick.scene, k.m) + '――死因は、' + k.trick.method + 'だった。';
    var o = ST.say(S, { actors: k.v.i != null ? [finder, k.v] : [finder], tag: '事件', kind: 'climax', text: t, why: (S.kills.length === 1 ? '最初の事件' : S.kills.length + '人目の犠牲者' + (k.why ? '：' + k.why + '……犯人の' + S.cul.name + 'が' : '')) + '（現場：' + k.trick.place + '・手口：' + k.trick.method + '・トリックの難しさ ' + k.trick.diff + '）' + (k.nk || ''), mag: 50 });
    ST.key(S, o, k.v.name + 'の死');
    live.forEach(function (p) { p.m.fear = clamp(p.m.fear + (p.prank ? 4 : 18) - (p.stats.nerve || 3) * 2, 0, 100); });
    /* 芸能人の思い込みが解ける */
    live.filter(function (p) { return p.prank; }).forEach(function (p) { if (S.kills.length === 1 && !p.sawBody) { p.sawBody = 1; ST.sayB(S, { actors: [p], tag: '企画？', text: F(Y.T.CELEB[1], { a: p.name }), why: 'まだ企画だと思っている' }, p.name + 'は企画だと思っていた'); }
      if (S.kills.length >= 2 || rng() < 0.5) { p.prank = false; p.m.fear = clamp(p.m.fear + 25, 0, 100); ST.sayB(S, { actors: [p], tag: '企画？', text: F(pk(S, T.CELEB_REAL), { a: p.name }), why: '本物の事件だと悟った' }, p.name + 'が悟った'); } });
    /* 関係のある人の反応 */
    /* 閉じ込められている人は、亡骸のそばで悲しむ場面に出さない */
    if (k.v.i != null) live.forEach(function (q) {
      if (q.bound) return;
      var c = cat(S, q, k.v); if (!c || c === 'close' && rng() < 0.5) return;
      if (c === 'bad') q.m.sus = clamp(q.m.sus + 15, 0, 100);
      q.m.fear = clamp(q.m.fear + (c === 'love' ? 20 : 10), 0, 100);
      ST.say(S, { actors: [q, k.v], tag: '喪失', text: F(pk(S, (c === 'love' && pining(S, q, k.v) && T.GRIEF.pining) || T.GRIEF[c] || T.GRIEF.close), { b: q.name, v: k.v.name }), why: '関係：' + relLabel(S, q, k.v) + (pining(S, q, k.v) ? '（どちらも想いを伝えられないままだった）' : '') + (c === 'bad' ? '（仲が悪かったので、疑いが向いた）' : '') + (q.isCul ? '。……' + q.name + 'が犯人だ' : ''), mag: c === 'love' ? 30 : 18 });
    });
    /* 探偵が死んだら引き継ぐ */
    if (k.v.isDet && !inv(S).length) successor(S, k.v, false);
    /* 犯人のアリバイ工作 */
    /* 濡れ衣で閉じ込められていた人は、新しい事件で疑いが晴れる */
    S.P.forEach(function (q) { if (alive(q) && q.bound && q.fate === '濡れ衣を着せられた' && S.kills.length > 1) { q.bound = false; q.fate = ''; q.m.sus = 10; ST.say(S, { actors: [q], tag: '潔白', text: q.name + 'が閉じ込められている間に、事件が起きた。' + q.name + 'の疑いは晴れ、納屋の扉が開けられた。', why: '濡れ衣が晴れた', mag: 26 }); } });
    if (alive(S.cul) && !S.mot.nobody) ST.sayB(S, { actors: [S.cul], tag: '証言', text: F(pk(S, T.ALIBI), { c: S.cul.name, v: k.v.name }), why: '犯人の工作（' + S.cul.name + 'が犯人）' }, S.cul.name + 'の証言');
  }
  /* 助手から探偵への呼び方：キャラ設定で呼び方を決めていればそれ、なければ「先生」（役割の呼び名は既定値で、利用者の呼び方を上書きしない） */
  function sensei(as, det) {
    if (!as || !det) return '先生';
    var own = (as.calls && as.calls[det.name]) || as.call;
    var c = own && HK.Voice && HK.Voice.callFor ? HK.Voice.callFor(as, det) : null;
    return c || '先生';
  }
  Y.sensei = sensei;
  function successor(S, dead, silent) {
    var rng = S.rng, live = S.P.filter(function (q) { return alive(q) && !q.isCul && !q.isAcc && !q.bound; });
    var s = (dead ? dead.buddies : []).filter(function (q) { return alive(q) && !q.isCul && !q.isAcc; })[0] || live.filter(function (q) { return q.role === 'assistant' && (!q.buddy || q.buddy === dead || !alive(q.buddy)); })[0] || live.sort(function (a, b) { return (skill(b, 'obs') + skill(b, 'lore')) - (skill(a, 'obs') + skill(a, 'lore')); })[0];
    if (!s) return null;
    s.isDet = true; s.heir = true; s.roleLabel = s.roleLabel + '→探偵';
    if (!silent) { var o = ST.say(S, { actors: dead ? [s, dead] : [s], tag: '継承', kind: 'climax', text: F(pk(S, dead && (s.buddy === dead || (dead.buddies || []).indexOf(s) >= 0) ? T.SUCCEED : T.SUCCEED.filter(function (l) { return !/\{sensei\}/.test(l); })), { a: s.name, d: dead ? dead.name : '探偵', sensei: sensei(s, dead) }), why: s.name + 'が探偵役を引き継いだ' + (dead && dead.buddies.indexOf(s) >= 0 ? '（' + dead.name + 'のバディ）' : '（推理力）'), mag: 36 }); ST.key(S, o, s.name + 'が探偵を継いだ'); }
    else S.lateHeir = s;
    return s;
  }

  /* ---------- 捜査 ---------- */
  function conceal(S, c) {
    var h = S.mot.nobody ? skill(S.v1.i != null ? S.v1 : S.cul, 'hide') : skill(S.cul, 'hide');
    return clamp(h * 0.27 + (c && c.kill ? c.kill.trick.diff * 0.07 : 0.1) + (S.acc ? 0.05 : 0) - (S.sloppy ? 0.15 : 0) + 0.05 + (S.env.hard - 50) / 250 + (Y.JOBS ? Y.JOBS.conceal(S, c) : 0), 0, 0.75);
  }
  function gain(S, p, pref) {
    var left = S.pool.filter(function (c) { return !c.found && !c.lost && !c.fake; });
    if (!left.length) return '';
    var c = left.filter(function (x) { return x.type === pref; })[0] || left[0];
    c.found = true; c.by = p; p.cnt.clue++; S.cul.m.sus = clamp(S.cul.m.sus + 12, 0, 100);
    return c.t;
  }
  function investigate(S) {
    var rng = S.rng;
    if (S.lateHeir) { var h = S.lateHeir; S.lateHeir = null; ST.say(S, { actors: [h], tag: '探偵役', text: S.cul.name + 'の推理は、どこか事件から目を逸らさせようとしているように聞こえた。' + h.name + 'は手帳を開いた。「……私が、調べる｜＝｜……私が、調べます」', why: (S.cul.fakeDet ? '探偵の' + S.cul.name + 'が犯人なので、' : '') + h.name + 'が探偵役になった', mag: 30 }); }
    inv(S).filter(function (d) { return !d.mad; }).forEach(function (d) {
      if (!alive(d)) return;
      var left = S.pool.filter(function (c) { return !c.found && !c.lost; });
      if (!left.length) return;
      var c = HK.weighted(rng, left, function (x) { return 0.3 + skill(d, x.type === 'spirit' ? 'spirit' : x.type); });
      var bud = d.buddies.filter(function (b) { return alive(b) && !b.bound; })[0];
      var sk = skill(d, c.type), ch = (0.16 + sk * 0.55 + (bud ? 0.14 : 0)) * (1 - conceal(S, c)) * (d.role === 'ponkotsu' ? 0.45 : 1) * (S.drugNight === S.curDay && d.drugged ? 0.5 : 1);
      if (d.role === 'ponkotsu' && rng() < 0.35) return ponk(S, d);
      if (c.fake) ch = 0.25 + sk * 0.4;
      if (rng() < ch) {
        if (c.fake) return fakeFound(S, d, c, bud);
        c.found = true; c.by = d; d.cnt.clue++; if (bud) bud.cnt.clue += 0.5;
        S.cul.m.sus = clamp(S.cul.m.sus + 12, 0, 100);
        var n = S.pool.filter(function (x) { return x.found; }).length;
        var o = ST.say(S, { actors: bud ? [d, bud] : [d], tag: '手がかり ' + n + '/' + S.need, text: F(pk(S, T.INV[c.type] || T.INV.obs), { a: d.name, v: vicName(S) }) + '――' + c.t + '。', why: d.name + 'の' + { obs: '観察', lore: '知識', talk: '聞き込み', med: '検視', search: '捜索', spirit: '霊感' }[c.type] + '（' + Math.round(sk * 100) + '）' + (bud ? '＋バディ' + bud.name : '') + ' 対 犯人の隠蔽（' + Math.round(conceal(S, c) * 100) + '）', mag: 22 });
        if (n === 1) ST.key(S, o, '最初の手がかり');
        /* 読み違い：本物の手がかりを、別の人を指すものだと思い込む */
        var inno = S.P.filter(function (q) { return alive(q) && q !== d && q !== S.cul && !q.bound; });
        if (inno.length && rng() < 0.16 * (1.2 - skill(d, 'obs')) + (d.role === 'ponkotsu' ? 0.2 : 0)) {
          var mb = S.fakeB && alive(S.fakeB) ? S.fakeB : inno.sort(function (a, b) { return b.m.sus - a.m.sus; })[0];
          c.misread = mb; mb.m.sus = clamp(mb.m.sus + 12, 0, 100);
          ST.sayB(S, { actors: [d, mb], tag: '読み違い', text: F(pk(S, T.MISREAD), { a: d.name, b: mb.name }), why: d.name + 'は手がかりを読み違えた（観察 ' + Math.round(skill(d, 'obs') * 100) + '）。推理が' + mb.name + 'の方へずれていく' }, d.name + 'の読み違い');
        }
        if (alive(S.cul) && !S.mot.nobody && rng() < 0.2 + d.tr.impulse * 0.2) approach(S, d);
        return;
      }
      if (bud && S.rng() < 0.25) ST.sayB(S, { actors: [bud, d], tag: 'バディ', text: F(pk(S, T.BUDDY), { sensei: sensei(bud, d), a: d.name, b: bud.name }), why: bud.name + 'は' + d.name + 'の助手' }, bud.name + 'が' + d.name + 'を手伝った');
      ST.sayB(S, { actors: [d], text: F(pk(S, T.INV[c.type] || T.INV.obs), { a: d.name, v: vicName(S) }).replace(/。$/, '') + pk(S, T.MISS), why: '犯人の隠蔽（' + Math.round(conceal(S, c) * 100) + '）が上回った' }, d.name + 'は空振り');
    });
  }

  /* 偽の証拠を見つけた：見破れるか */
  function fakeFound(S, d, c, bud) {
    var rng = S.rng, n0 = S.pool.filter(function (x) { return x.found && !x.fake; }).length;
    var see = skill(d, 'obs') * 0.55 + (bud ? 0.1 : 0) + (d.role === 'prof' || d.role === 'doctor' ? 0.1 : 0) - (c.cun || 0.5) * 0.35 - (d.role === 'ponkotsu' ? 0.3 : 0) - (Y.JOBS ? Y.JOBS.fake(S) : 0);
    var t = F(pk(S, T.INV[c.type] || T.INV.obs), { a: d.name, v: vicName(S) }) + '――' + c.t + '。';
    if (rng() < see) {
      c.found = true; c.fake = false; c.exposed = true; c.t = c.t + '――ただし、それは偽装だった'; d.cnt.clue++;
      S.cul.m.sus = clamp(S.cul.m.sus + 15, 0, 100); if (c.b) c.b.m.sus = clamp(c.b.m.sus - 15, 0, 100);
      return ST.say(S, { actors: bud ? [d, bud] : [d], tag: '偽装を見破る', kind: 'climax', text: t + F(pk(S, T.FAKE_SEEN), { a: d.name, b: c.b ? c.b.name : '誰か' }), why: d.name + 'は偽の証拠を見破った（観察 ' + Math.round(skill(d, 'obs') * 100) + ' 対 犯人の狡猾さ ' + Math.round((c.cun || 0.5) * 100) + '）。偽装そのものが、犯人への手がかりになった', mag: 34 });
    }
    c.found = true; c.by = d;
    if (c.b) c.b.m.sus = clamp(c.b.m.sus + 22, 0, 100);
    var n = S.pool.filter(function (x) { return x.found; }).length;
    return ST.say(S, { actors: bud ? [d, bud] : [d], tag: '手がかり ' + n + '/' + S.need, text: t, why: '……これは犯人の' + S.cul.name + 'が仕込んだ偽の証拠だ。' + d.name + 'は見抜けなかった。推理が' + (c.b ? c.b.name : '別の人') + 'の方へずれていく', mag: 26 });
  }
  /* 犯人に探りを入れる（あとで狙われやすくなる） */
  function approach(S, a) {
    var c = S.cul;
    if (!alive(c) || a === c || a.approached) return;
    a.approached = true;
    ST.say(S, { actors: [a, c], tag: '探り', text: F(pk(S, T.APPROACH), { a: a.name, c: c.name }) + F(pk(S, T.APPROACH_REACT), { a: a.name, c: c.name }), why: a.name + 'は' + c.name + 'を怪しんで、探りを入れた（犯人に目をつけられた）', mag: 24 });
  }
  /* ポンコツ探偵 */
  function ponk(S, d) {
    var rng = S.rng, live = S.P.filter(function (q) { return alive(q) && q !== d; });
    if (!live.length) return;
    var r = rng();
    if (r < 0.2) { var g = gain(S, d, 'search'); if (g) return ST.say(S, { actors: [d], tag: '迷推理', text: F(pk(S, T.PONK_LUCKY), { a: d.name, b: rng.pick(live).name }) + '――' + g + '。', why: 'ポンコツ探偵の迷推理が、たまたま当たった', mag: 22 }); }
    if (r < 0.45) { var f = S.pool.filter(function (c) { return c.found && !c.lost; }); if (f.length) { f[f.length - 1].lost = true; f[f.length - 1].found = false; return ST.say(S, { actors: [d], tag: '迷推理', text: F(T.PONK[1], { a: d.name }), why: 'ポンコツ探偵が手がかりを台無しにした', mag: 16 }); } }
    var b = HK.weighted(rng, live, function (q) { return 1 + Math.max(0, -bond(S, d, q)) * 3; });
    b.m.sus = clamp(b.m.sus + 10, 0, 100);
    ST.sayB(S, { actors: [d, b], tag: '迷推理', text: F(rng() < 0.6 ? T.PONK[0] : T.PONK[2], { a: d.name, b: b.name }), why: '的外れな推理（' + b.name + 'への疑いが少し上がった）' }, d.name + 'が' + b.name + 'を疑った');
  }
  /* 探偵役以外の動き（職業ごと） */
  function others(S) {
    var rng = S.rng, v = lastDead(S);
    if (v && v.revived) v = null;
    S.P.filter(function (p) { return alive(p) && !p.isDet && !p.bound && !p.mad; }).forEach(function (p) {
      if (rng() > 0.3) return;
      var r = p.role, g, why = '';
      var mk = function (pool, type, tag, w) { if (p.isCul) return false; g = gain(S, p, type); if (!g) return false; ST.say(S, { actors: [p], tag: tag, text: F(pk(S, pool), { a: p.name, v: v ? v.v.name : '' }) + '――' + g + '。', why: w, mag: 20 }); return true; };
      if (r === 'doctor' && !p.did && v) { p.did = 1; if (p.isCul) return ST.sayB(S, { actors: [p], tag: '検視', text: p.name + 'は検視を買って出た。「死因は見たとおり｜死因は見たとおりだ｜死因は見たとおりです」――それ以上は、何も言わなかった。', why: '医師が犯人なので、検視をごまかした' }, p.name + 'の検視'); if (mk(T.DOCTOR, 'med', '検視', '医師の検視')) return; }
      if ((r === 'psychic' || r === 'mage') && v && rng() < 0.6) {
        if (r === 'mage' && rng() < 0.3) { p.m.sus = clamp(p.m.sus + 12, 0, 100); return ST.sayB(S, { actors: [p], tag: '降霊', text: F(pk(S, T.MAGE), { a: p.name, v: v.v.name }) + F(pk(S, T.MAGE_SUS), { a: p.name }), why: '魔術師は怪しまれた' }, p.name + 'の降霊'); }
        if (mk(r === 'mage' ? T.MAGE : T.PSYCHIC, 'spirit', r === 'mage' ? '降霊' : '霊視', '死者の声（霊感）')) return;
        S.cul.m.sus = clamp(S.cul.m.sus + 10, 0, 100);
        return ST.sayB(S, { actors: [p], tag: '霊視', text: F(pk(S, r === 'mage' ? T.MAGE : T.PSYCHIC), { a: p.name, v: v.v.name }), why: '死者は犯人の方を指した（犯人への疑い +10）' }, p.name + 'の霊視');
      }
      if (r === 'streamer' && rng() < 0.5 && mk(T.STREAM, 'search', '映像', '回しっぱなしのカメラ')) return;
      if (r === 'police' && rng() < 0.6) { if (p.isCul) return; if (mk(T.POLICE, 'talk', '取り調べ', '警察官の取り調べ')) return; }
      if ((r === 'prof' || r === 'occult' || r === 'lawyer' || r === 'writer') && rng() < 0.35 && mk(L2(p.name + 'は、ふと口にした。「待って。これ、おかしくない？｜待て。これは、おかしくないか｜待ってください。これ、おかしくないですか？」'), 'lore', '気づき', role(p).label + 'の知識')) return;
      if (r === 'priest' && rng() < 0.5) { S.P.filter(alive).forEach(function (q) { q.m.fear = clamp(q.m.fear - 6, 0, 100); }); return ST.sayB(S, { actors: [p], tag: '弔い', text: p.name + 'は' + (v ? v.v.name : '死者') + 'のために祈りを捧げた。張りつめていた空気が、少しだけゆるんだ。', why: '神職が場を鎮めた（全員の恐怖 -6）' }, p.name + 'が祈った'); }
      if (alive(S.cul) && !S.mot.nobody && p !== S.cul && !p.isAcc && (p.cnt.clue > 0 || p.role === 'police' || p.role === 'reporter') && S.cul.m.sus > 25 && rng() < 0.35) return approach(S, p);
      /* 関係から：かばう・疑う */
      if (!p.isCul && alive(S.cul) && bond(S, p, S.cul) >= 0.75 && rng() < 0.4) {
        var f = S.pool.filter(function (c) { return !c.found && !c.lost; })[0];
        if (f) { f.lost = true; p.knew = true; return ST.say(S, { actors: [p, S.cul], tag: '隠蔽', text: F(pk(S, T.COVER), { b: p.name, c: S.cul.name }), why: p.name + 'は' + S.cul.name + '（' + relLabel(S, p, S.cul) + '）が犯人だと気づいて、かばった（手がかりが一つ失われた）', mag: 30 }); }
      }
      var foe = S.P.filter(function (q) { return alive(q) && q !== p && bond(S, p, q) < -0.2; })[0];
      if (foe && rng() < 0.4) { foe.m.sus = clamp(foe.m.sus + 8, 0, 100); return ST.sayB(S, { actors: [p, foe], tag: '疑心', text: F(pk(S, T.SUSPECT), { a: p.name, b: foe.name }), why: '関係：' + relLabel(S, p, foe) }, p.name + 'は' + foe.name + 'を疑った'); }
      if (p.m.fear > 55 && rng() < 0.4) ST.sayB(S, { actors: [p], tag: '恐怖', text: F(pk(S, T.PANIC), { a: p.name }), why: '恐怖 ' + Math.round(p.m.fear) }, p.name + 'が怯えた');
    });
  }
  function L2(s) { return [s]; }
  /* 犯人と共犯の動き */
  function culpritMove(S) {
    var rng = S.rng, c = S.cul;
    if (!alive(c) || c.bound || S.mot.nobody) return;
    if (medFake(S, c)) return;
    var found = S.pool.filter(function (x) { return x.found; }).length;
    var r = rng(), live = S.P.filter(function (q) { return alive(q) && q !== c && q !== S.acc; });
    /* 証拠を消す（見つかる前の手がかりを潰す） */
    if (r < 0.25 + skill(c, 'hide') * 0.2) {
      var left = S.pool.filter(function (x) { return !x.found && !x.lost && !x.fake; });
      if (left.length > 1 && rng() < skill(c, 'hide') * 0.6 + (S.acc ? 0.15 : 0)) { left[0].lost = true; return ST.sayB(S, { actors: S.acc ? [c, S.acc] : [c], tag: '隠滅', text: F(pk(S, T.DESTROY), { c: c.name }), why: '犯人の証拠隠滅（手がかりが一つ失われた）' + (S.acc ? '・共犯' + S.acc.name + 'の手伝い' : '') }, c.name + 'の隠滅'); }
    }
    /* 狡猾な犯人は、証拠を偽装して罪をなすりつける */
    var cun = skill(c, 'hide') + c.tr.a * 0.3 + c.tr.cold * 0.2;
    if (r < 0.75 && live.length && cun > 0.7 && rng() < (cun - 0.6) * 0.5 && S.pool.filter(function (x) { return x.fake; }).length < 2) {
      var fb = S.fakeB && alive(S.fakeB) ? S.fakeB : HK.weighted(rng, live.filter(function (q) { return !q.isDet; }).concat(live.filter(function (q) { return q.isDet && rng() < 0.2; })), function (q) { return 1 + q.m.sus / 25 + Math.max(0, -bond(S, c, q)) * 2; });
      if (fb) {
        S.fakeB = fb;
        S.pool.push({ type: rng.pick(['obs', 'search', 'talk']), t: F(pk(S, T.FAKE), { b: fb.name, v: S.v1.name }), fake: true, b: fb, cun: cun });
        return ST.sayB(S, { actors: [c, fb], tag: '偽装', text: F(pk(S, T.FAKE_PLANT), { c: c.name, b: fb.name }), why: c.name + 'は狡猾だった（隠しごとの力・A・ドライさ）。' + fb.name + 'に罪を着せる偽の証拠を仕込んだ' }, c.name + 'が偽の証拠を仕込んだ');
      }
    }
    /* 罪を着せる（追い詰められているほど） */
    if (r < 0.55 && live.length && (found >= 2 || rng() < 0.3)) {
      var b = HK.weighted(rng, live.filter(function (q) { return !q.isDet; }).concat(live.filter(function (q) { return q.isDet; }).slice(0, 0)), function (q) { return 1 + q.m.sus / 30 + Math.max(0, -bond(S, c, q)) * 2; }) || live[0];
      if (!b) return;
      b.m.sus = clamp(b.m.sus + 18, 0, 100); S.framed = b; S.fake++;
      return ST.sayB(S, { actors: [c, b], tag: '工作', text: F(pk(S, T.FRAME), { c: c.name, b: b.name, v: S.v1.name }), why: '犯人が' + b.name + 'に罪を着せようとした（推理を誤らせる）' }, c.name + 'が' + b.name + 'を陥れた');
    }
  }

  /* 検死の知識を使った偽装：死亡推定時刻や死因をごまかして、アリバイを作る（一度だけ）。
     知識で上回る人がいれば見破られることがある。慎重な犯人は、見破られるのを恐れて諦める */
  function medFake(S, c) {
    var rng = S.rng, k = S.kills[S.kills.length - 1];
    if (S.medFake || !k || !k.found || skill(c, 'med') < 0.35 || rng() > 0.55) return false;
    S.medFake = true;
    var live = S.P.filter(function (q) { return alive(q) && q !== c && q !== S.acc && !q.bound; });
    var ex = live.slice().sort(function (a, b) { return skill(b, 'med') - skill(a, 'med'); })[0];
    var strong = ex && skill(ex, 'med') >= skill(c, 'med') - 0.05;
    if (strong && c.tr.caution > 0.55 && rng() < 0.6) {
      ST.sayB(S, { actors: [c, ex], tag: '断念', text: c.name + 'は検視を買って出ようとして、口をつぐんだ。' + ex.name + 'が、すでに遺体の前に膝をついていた。', why: c.name + 'の慎重さ（' + Math.round(c.tr.caution * 100) + '）。検視の腕で上回る' + ex.name + 'を警戒して、偽装を諦めた（' + c.name + 'が犯人）' }, c.name + 'は偽装を諦めた');
      return true;
    }
    var fb = HK.weighted(rng, live.filter(function (q) { return !q.isDet; }).concat(live), function (q) { return 1 + q.m.sus / 25 + Math.max(0, -bond(S, c, q)) * 2; });
    var clue = { type: 'med', t: '死亡推定時刻は夜中の二時ごろ。その時刻に一人でいたのは、' + (fb ? fb.name : '誰か') + 'だけだった', fake: true, b: fb, cun: skill(c, 'med') + c.tr.a * 0.3 };
    S.pool.push(clue);
    c.m.sus = clamp(c.m.sus - 15, 0, 100); if (fb) fb.m.sus = clamp(fb.m.sus + 12, 0, 100);
    var o = ST.say(S, { actors: fb ? [c, fb] : [c], tag: '偽の検視', text: c.name + 'は手慣れた様子で' + k.v.name + 'の遺体を調べた。「死後硬直から見て、亡くなったのは夜中の二時ごろだね｜死後硬直から見て、死んだのは夜中の二時ごろだ｜死後硬直から見て、亡くなったのは夜中の二時ごろですね」――その時刻、' + c.name + 'は皆と一緒に広間にいた。', why: c.name + 'の検視の知識（' + (HK.DGK ? HK.DGK.KNOW_LABEL[c.kn] : '') + '）を使った偽装。死亡推定時刻をずらして、自分のアリバイを作った（' + c.name + 'が犯人）', mag: 22 });
    if (ex && rng() < 0.25 + (skill(ex, 'med') - skill(c, 'med')) * 0.8 + ex.tr.a * 0.2) {
      clue.found = true; clue.fake = false; clue.exposed = true; clue.by = ex; clue.t = '死亡推定時刻の申告は嘘だった。' + k.v.name + 'が亡くなったのは、' + c.name + 'が一人でいた時間だった'; ex.cnt.clue++;
      c.m.sus = clamp(c.m.sus + 30, 0, 100); if (fb) fb.m.sus = clamp(fb.m.sus - 12, 0, 100);
      ST.say(S, { actors: [ex, c], tag: '偽装を見破る', kind: 'climax', text: ex.name + 'が首を振った。「違う。死斑はもう固定されてる。顎の硬直も進みすぎだ。亡くなったのは、もっと早い。……どうして嘘をつくの、' + c.name + '｜違う。死斑はもう固定されている。顎の硬直も進みすぎだ。死んだのは、もっと早い。……なぜ嘘をつく、' + c.name + '｜違います。死斑はもう固定されています。顎の硬直も進みすぎです。亡くなったのは、もっと早い時刻です。……' + c.name + '、どうして嘘をつくんですか」', why: ex.name + 'の検視の知識が、' + c.name + 'の偽装を見破った（検視 ' + Math.round(skill(ex, 'med') * 100) + ' 対 ' + Math.round(skill(c, 'med') * 100) + '）', mag: 30 });
    }
    return true;
  }

  /* ---------- 推理 ---------- */
  function deduce(S, last) {
    var rng = S.rng, ds = inv(S).filter(function (d) { return !d.mad; });
    if (!ds.length || S.over) return;
    var real = S.pool.filter(function (x) { return x.found && !x.fake && !x.misread; }).length;
    var bad = S.pool.filter(function (x) { return x.found && (x.fake || x.misread); });
    var found = real + bad.length;
    var d = ds.slice().sort(function (a, b) { return (skill(b, 'obs') + skill(b, 'lore') + (b.role === 'ponkotsu' ? -1 : 0)) - (skill(a, 'obs') + skill(a, 'lore') + (a.role === 'ponkotsu' ? -1 : 0)); })[0];
    var lost = S.pool.filter(function (x) { return x.lost; }).length;
    var enough = found >= Math.min(S.need, S.pool.length - lost), partial = found >= S.need - 1 && rng() < skill(d, 'lore') * 0.5 + (last ? 0.25 : 0);
    var ponkGo = d.role === 'ponkotsu' && rng() < (last ? 0.6 : 0.12);
    if (!enough && !partial && !ponkGo) return;
    /* 偽の証拠や読み違いを抱えたまま推理すると、別の人を指してしまう */
    var misled = found ? bad.length / found : 0;
    var wrong = (enough ? 0.04 + S.fake * 0.04 : partial ? 0.22 + S.fake * 0.06 : 0.8) + misled * (1.1 - skill(d, 'obs') * 0.5) - skill(d, 'obs') * 0.05;
    if (d.role === 'ponkotsu') wrong += 0.3;
    /* 犯人の嘘のうまさ（職業と正直さ。yakata-jobs.js） */
    if (Y.JOBS) wrong += Y.JOBS.deduce(S);
    if (bad.length) { var cnt = {}; bad.forEach(function (x) { var b = x.fake ? x.b : x.misread; if (b && alive(b)) cnt[b.i] = (cnt[b.i] || 0) + 1; }); var bi = Object.keys(cnt).sort(function (a, b) { return cnt[b] - cnt[a]; })[0]; S.misTarget = bi != null ? S.P[+bi] : null; }
    var wr = rng() < clamp(wrong, 0, 0.95);
    /* なすりつけが通っていれば、正しい推理の一部が、なすりつけられた人へ向く（yakata-frame.js） */
    if (!wr && (enough || partial) && Y.frameTry && Y.frameTry(S, d, partial && !enough)) return;
    showdown(S, d, wr, partial && !enough);
  }
  function showdown(S, d, wrong, partial) {
    var rng = S.rng, c = S.cul, live = S.P.filter(alive);
    if (!S.noStep) ST.step(S, '推理');
    S.noStep = false;
    var bud = d.buddies.filter(alive)[0];
    var t = F(pk(S, T.SHOW), { d: d.name });
    if (S.mot.nobody && !wrong) {
      /* 被害者の自作自演：犯人はいない */
      S.over = 'nobody';
      var o0 = ST.say(S, { actors: [d, c], tag: '真相', kind: 'climax', text: t + '「この事件に、犯人はいない。' + S.v1.name + 'は、自ら命を絶った。――' + c.name + 'に、罪を着せるために｜＝｜この事件に、犯人はいません。' + S.v1.name + 'さんは、自ら命を絶った。――' + c.name + 'さんに、罪を着せるために」', why: '動機「' + S.mot.label + '」。' + d.name + 'の推理（手がかり ' + found(S) + '/' + S.need + '）', mag: 54 });
      ST.key(S, o0, '真相：自作自演');
      return;
    }
    var target = wrong ? (S.misTarget && alive(S.misTarget) && S.misTarget !== d && !S.misTarget.bound ? S.misTarget : S.framed && alive(S.framed) && S.framed !== d ? S.framed : live.filter(function (q) { return q !== c && q !== d && !q.isAcc; }).sort(function (a, b) { return b.m.sus - a.m.sus; })[0]) : c;
    if (!target) { target = c; wrong = false; }
    if (wrong) {
      target.bound = true; target.fate = '濡れ衣を着せられた';
      var o = ST.say(S, { actors: [d, target], tag: '推理', kind: 'climax', text: t + F(pk(S, T.ACCUSE), { d: d.name, c: target.name, v: vicName(S) }) + F(pk(S, T.WRONG), { d: d.name, b: target.name }) + target.name + 'は、納屋に閉じ込められた。', why: d.name + 'の推理は外れた（' + (target === S.misTarget ? '偽の証拠や読み違えた手がかりをもとに推理を進めた' : partial ? '手がかりが足りないまま推し量った' : d.role === 'ponkotsu' ? 'ポンコツ探偵' : '犯人の工作に引っかかった') + '）。本当の犯人は' + c.name, mag: 46 });
      ST.key(S, o, d.name + 'の推理が外れた');
      S.wrongOnce = (S.wrongOnce || 0) + 1;
      if (S.wrongOnce >= 2 || S.env.days <= 2) S.over = 'wrong';
      return;
    }
    var o2 = ST.say(S, { actors: [d, c], tag: '推理', kind: 'climax', text: t + pq(S, 'ACCUSE', d, { d: d.name, c: c.name }) + '――' + S.kills.map(function (k) { return truthOf(S, k); }).join('') + F(S.mot.why, fmtV(S, S.v1)), why: d.name + 'の推理' + (partial ? '（手がかりが一つ足りないのを、推理で埋めた）' : '') + '・手がかり ' + found(S) + '/' + S.need, mag: 54 });
    ST.key(S, o2, d.name + 'が犯人を言い当てた');
    var conf = F(pk(S, S.mot.confess), { x: S.x ? S.x.name : '' });
    /* 犯人がもう死んでいる（ほかの人に殺された・吸血鬼に襲われたなど）ときは、本人は語れない。遺品の走り書きで動機が明かされる */
    if (!alive(c)) {
      ST.say(S, { actors: [d, c], tag: '遺品', text: pk(S, [c.name + 'の遺品の手帳から、走り書きが見つかった。', c.name + 'の部屋の暖炉の灰の中に、燃え残った便箋があった。', c.name + 'の上着の内ポケットに、折りたたんだ紙が入っていた。']) + '――「' + conf.replace(/^「|」$/g, '') + '」', why: '動機：' + S.mot.cat + '「' + S.mot.label + '」' + (S.motSrc || '') + '（犯人の' + c.name + 'は、すでに亡くなっていた）', mag: 40 });
      reveal(S, c, d);
      S.over = 'dead';
      return;
    }
    ST.say(S, { actors: [c], tag: '告白', text: c.name + '「' + conf.replace(/^「|」$/g, '') + '」', why: '動機：' + S.mot.cat + '「' + S.mot.label + '」' + (S.motSrc || ''), mag: 40 });
    if (S.acc && alive(S.acc)) { S.acc.bound = true; S.acc.fate = '共犯として捕まった'; ST.say(S, { actors: [S.acc, c], tag: '共犯', text: S.acc.name + 'は、うなだれた。「……私も、手を貸した｜＝｜……私も、手を貸しました」', why: S.acc.name + 'は共犯だった（' + (relLabel(S, S.acc, c) || '協力者') + '）', mag: 30 }); }
    reveal(S, c, d);
    /* 犯人の最後の動き */
    var t2 = c.tr, n = c.stats.nerve || 3;
    var ws = { arrest: 0.4 + t2.cp * 0.3 + t2.ac * 0.3, suicide: 0.1 + t2.ac * 0.3 + (/mercy|despair|framesuicide/.test(S.mot.id) ? 0.5 : 0) + (S.mot.id === 'loyal' ? 0.3 : 0), flee: t2.impulse * 0.5 + t2.fc * 0.2 + n * 0.04, attack: t2.aggr * 0.5 + t2.cold * 0.3 + (/fame|experiment|despair/.test(S.mot.id) ? 0.4 : 0) };
    if (S.mot.id === 'split') ws.attack += 0.3;
    ws.suicide *= HK.Dark.endings(S, 'kill'); ws.attack *= HK.Dark.endings(S, 'kill');   /* 展開の重さ：悪い結末（自害・探偵を襲う） */
    var e = HK.weighted(rng, Object.keys(ws), function (k) { return Math.pow(Math.max(0.03, ws[k]), 2); });
    /* 殺さない相手（探偵）は、襲いかけても手を止める */
    if (e === 'attack' && HK.SameStory && HK.SameStory.nk && HK.SameStory.nk(S, c, d)) {
      c.bound = true; c.fate = '探偵を襲いかけ、自分で手を止めた'; S.over = 'arrest';
      return ST.say(S, { actors: [c, d], tag: '結末', kind: 'climax', text: F(pk(S, T.END_ATTACK), { c: c.name, d: d.name }) + '――振り上げた手は、' + d.name + 'の目の前で止まった。' + c.name + 'は、そのまま膝をついた。翌朝、吹雪が止み、' + c.name + 'は警察に引き渡された。', why: c.name + 'は探偵を襲いかけたが、殺さないと決めた相手だった（殺さないの指定）', mag: 46 });
    }
    if (e === 'attack') {
      var stop = live.filter(function (q) { return q !== c && q !== d && !q.bound; }).sort(function (a, b) { return skill(b, 'fight') + (d.buddies.indexOf(b) >= 0 ? 0.3 : 0) - skill(a, 'fight') - (d.buddies.indexOf(a) >= 0 ? 0.3 : 0); })[0];
      var ta = F(pk(S, T.END_ATTACK), { c: c.name, d: d.name });
      if (stop && rng() < HK.Dark.live(S, skill(stop, 'fight') + 0.35 + (d.buddies.indexOf(stop) >= 0 ? 0.15 : 0), 'kill')) {
        c.bound = true; c.fate = '探偵を襲い、取り押さえられた';
        S.over = 'arrest';
        return ST.say(S, { actors: [c, d, stop], tag: '結末', kind: 'climax', text: ta + F(pk(S, T.END_ATTACK_STOP), { b: stop.name, c: c.name, d: d.name }) + '翌朝、吹雪が止み、' + c.name + 'は警察に引き渡された。', why: c.name + 'は探偵を襲った（攻撃性・ドライさ）。' + stop.name + 'が止めた' + (d.buddies.indexOf(stop) >= 0 ? '（バディ）' : ''), mag: 50 });
      }
      d.alive = false; d.fate = '推理の場で犯人に殺された';
      ST.say(S, { actors: [c, d], tag: '結末', kind: 'climax', text: ta + F(pk(S, T.END_ATTACK_KILL), { d: d.name }), why: c.name + 'は探偵を襲った。止められなかった', mag: 52 });
      if (live.filter(function (q) { return q !== c && q !== d && alive(q) && !q.bound; }).length && rng() < 0.6) { c.bound = true; c.fate = '探偵を殺し、取り押さえられた'; S.over = 'arrest'; ST.say(S, { actors: [c], tag: '結末', text: '残された者たちが、一斉に' + c.name + 'に飛びかかった。' + c.name + 'は、ようやく動きを止めた。', why: '多勢に無勢' }); return; }
      c.gone = true; c.fate = '探偵を殺して、吹雪の中へ消えた'; S.over = 'flee';
      return ST.say(S, { actors: [c], tag: '結末', kind: 'climax', text: c.name + 'は血に濡れたまま、吹雪の中へ消えていった。', why: '誰も追えなかった', mag: 46 });
    }
    if (e === 'suicide') {
      var lov = live.filter(function (q) { return q !== c && alive(q) && !q.bound && (hasTie(S, q, c, 'lover,mate,fated,parent,sibprot') || bond(S, q, c) >= 0.85); })[0];
      if (lov && rng() < 0.5 + lov.tr.np * 0.3) { c.bound = true; c.fate = '逮捕された（' + lov.name + 'に止められた）'; S.over = 'arrest'; return ST.say(S, { actors: [c, lov], tag: '結末', kind: 'climax', text: pq(S, 'SUICIDE', c, { c: c.name }) + F(pk(S, Y.STOPLOVE), { b: lov.name, c: c.name }) + '翌朝、吹雪の止んだ館に、警察が到着した。', why: c.name + 'は命を絶とうとしたが、' + lov.name + '（' + (relLabel(S, lov, c) || '深まった絆') + '）が止めた', mag: 52 }); }
    }
    if (e === 'suicide') { c.alive = false; c.fate = '自ら命を絶った'; S.over = 'suicide'; return ST.say(S, { actors: [c, d], tag: '結末', kind: 'climax', text: pq(S, 'SUICIDE', c, { c: c.name }) + F(rng() < 0.5 ? '次の瞬間、{c}は隠し持っていた小瓶をあおった。誰も、止められなかった。' : '{c}は窓を開け放ち、吹雪の中へ身を投げた。下は、底の見えない崖だった。', { c: c.name }), why: c.name + 'は、裁かれる前に自ら終わらせた', mag: 50 }); }
    if (e === 'flee') { c.gone = true; c.fate = '吹雪の中へ姿をくらました'; S.over = 'flee'; return ST.say(S, { actors: [c], tag: '結末', kind: 'climax', text: pq(S, 'FLEE', c, { c: c.name }) + F(pk(S, T.END_FLEE), { c: c.name }), why: c.name + 'は逃げた（衝動性・FC）', mag: 48 }); }
    c.bound = true; c.fate = '逮捕された'; S.over = 'arrest';
    ST.say(S, { actors: [c], tag: '結末', kind: 'climax', text: F(pk(S, T.END_ARREST), { c: c.name }), why: c.name + 'は観念した', mag: 46 });
  }
  /* 自作自演のときは、仕掛けたのは被害者自身 */
  function truthOf(S, k) {
    var m = {}; for (var x in k.m) m[x] = k.m[x]; if (S.mot.nobody) m.c = k.v.name;
    var t = F(k.trick.truth, m);
    /* 殺されたあとに蘇った不死・吸血鬼（yakata-special.js で k.revived）：真相の語りにも、蘇ったことを添える */
    if (k.revived && k.v) t += pk(S, ['もっとも、' + k.v.name + 'はそのあと、何事もなかったように起き上がったのだが。', '――その' + k.v.name + 'が、翌朝には息を吹き返していたことを除けば。', '殺したはずの' + k.v.name + 'が蘇ったことが、計画の唯一の誤算だった。']);
    return t;
  }
  Y.truthOf = truthOf;
  Y.gainClue = function (S, p, pref) { return gain(S, p, pref); };
  Y.investigators = function (S) { return inv(S).filter(function (d) { return !d.mad; }); };
  function found(S) { return S.pool.filter(function (x) { return x.found; }).length; }


  /* ---------- 犯人が明かされたときの、親しい人の反応 ---------- */
  function reveal(S, c, d) {
    var rng = S.rng, n = 0;
    var qs = S.P.filter(function (q) { return alive(q) && q !== c && !q.isAcc && !q.knew && q !== d || (q === d && c.buddy === d); })
      .filter(function (q) { return Math.abs(bond(S, q, c)) >= 0.3 || (c.buddies || []).indexOf(q) >= 0 || c.buddy === q; })
      .sort(function (a, b) { return Math.abs(bond(S, b, c)) - Math.abs(bond(S, a, c)); });
    qs.slice(0, 3).forEach(function (q) {
      var k = (c.buddies || []).indexOf(q) >= 0 ? 'buddy' : c.buddy === q && Y.REVEAL.buddyRev ? 'buddyRev' : c.buddy === q ? 'buddy' : pining(S, q, c) && Y.REVEAL.pining ? 'pining' : S.ties.some(function (t) { return t.type === 'crush' && t.a === q.i && t.b === c.i; }) ? 'crush' : hasTie(S, q, c, 'lover,mate,fated,almost,fwb') ? 'love' : hasTie(S, q, c, 'sibling,sibprot,sibclose,sibbad,parent,pparent') ? 'family' : bond(S, q, c) < 0 ? 'bad' : !ties(S, q, c).length ? 'trust' : 'close';
      q.m.fear = clamp(q.m.fear + (k === 'bad' ? 0 : 20), 0, 100);
      /* 犯人がもう亡くなっているとき（遺品で明かされた）は、犯人を場面の登場人物にしない */
      ST.say(S, { actors: alive(c) ? [q, c] : [q], tag: '動揺', text: F(pk(S, Y.REVEAL[k]),{ b: q.name, c: c.name, sensei: sensei(q, c) }), why: q.name + 'は真相を知らなかった（' + (relLabel(S, q, c) || (S.relLab && S.relLab[rk(q, c)]) || '館で深まった関係') + '）', mag: k === 'bad' ? 20 : 36 });
    });
    /* 犯人が同一人物だったときの、もう一人の反応（same-story.js） */
    if (HK.SameStory && HK.SameStory.reveal) HK.SameStory.reveal(S, c, d);
  }

  /* ---------- 吹雪の館で深まる関係 ---------- */
  function setRel(S, a, b, d, lab, dir) {
    S.relD = S.relD || {}; S.relLab = S.relLab || {}; S.relDir = S.relDir || {};
    var k = rk(a, b);
    S.relD[k] = clamp((S.relD[k] || 0) + d, -1, 1); if (lab) S.relLab[k] = lab;
    if (dir) S.relDir[k] = dir.i; else delete S.relDir[k];
  }
  function bondTick(S) {
    var rng = S.rng, live = S.P.filter(function (p) { return alive(p) && !p.bound; });
    if (live.length < 2 || rng() > 0.65) return;
    var B = Y.BOND, last = lastDead(S);
    if (last && last.revived) last = null;
    var opts = [];
    live.forEach(function (a) {
      live.forEach(function (b) {
        if (a === b) return;
        var w = bond(S, a, b), lover = hasTie(S, a, b, 'lover,mate,fated');
        if (a.i < b.i) {
          if (w < -0.1) { opts.push([a, b, 'quarrel', 0.6]); opts.push([a, b, 'makeup', 0.25 + a.tr.np * 0.3]); }
          else { opts.push([a, b, 'talk', 0.5 + a.tr.np * 0.3 + b.tr.np * 0.3]); opts.push([a, b, 'team', (a.isDet || b.isDet) ? 0.2 : 0.4]); }
          if (last && last.v.i != null && bond(S, a, last.v) >= 0.3 && bond(S, b, last.v) >= 0.3) opts.push([a, b, 'shared', 1.2]);
          if (pining(S, a, b) && B.pine) opts.push([a, b, 'pine', 0.7]);
        }
        if (w >= -0.1 && b.m.fear > 45) opts.push([a, b, 'protect', 0.4 + a.tr.np * 0.5]);
        if (w >= 0.3 && !lover && !kinNo(S, a, b) && !(HK.Avoid && HK.Avoid.of(S, a, b)) && (!HK.canLove || HK.canLove(a, b)) && (!HK.Poly || HK.Poly.storyCan(S, a, b)) && !S.confessed) opts.push([a, b, 'confess', 0.3 + a.tr.fc * 0.4 + w * 0.5]);
        if (b === S.cul && a !== S.cul && skill(a, 'obs') > 0.5) opts.push([a, b, 'distrust', 0.4]);
      });
    });
    if (!opts.length) return;
    var o = HK.weighted(rng, opts, function (x) { return x[3]; }), a = o[0], b = o[1], k = o[2];
    var pin = (k === 'confess' || k === 'pine') && pining(S, a, b) && B.pconfess;
    var m = { a: a.name, b: b.name, v: last ? last.v.name : '' }, t = F(pk(S, k === 'confess' && pin ? B.pconfess : B[k]), m), why = '';
    if (k === 'pine') { setRel(S, a, b, 0.05); why = '両片想い：どちらも、相手は自分を何とも思っていないと思い込んでいる'; }
    if (k === 'talk') { setRel(S, a, b, 0.15, '打ち解けた'); why = '夜の語らいで、距離が縮まった'; }
    if (k === 'protect') { setRel(S, a, b, 0.2, '信頼', a); b.m.fear = clamp(b.m.fear - 12, 0, 100); why = a.name + 'は怯える' + b.name + 'を放っておけなかった（NP）'; }
    if (k === 'team') { setRel(S, a, b, 0.15, '協力'); why = '二人で調べるうちに、息が合ってきた'; }
    if (k === 'shared') { setRel(S, a, b, 0.2, '支え合う'); why = '同じ人を失った者どうし'; }
    if (k === 'quarrel') { setRel(S, a, b, -0.15, '険悪'); a.m.sus = clamp(a.m.sus + 5, 0, 100); b.m.sus = clamp(b.m.sus + 5, 0, 100); why = '疑心暗鬼が、二人の仲をこじらせた'; }
    if (k === 'makeup') { setRel(S, a, b, 0.3, '和解'); why = '命がかかって、意地を張るのをやめた'; }
    if (k === 'distrust') { setRel(S, a, b, -0.2, '不信', a); b.m.sus = clamp(b.m.sus + 8, 0, 100); why = a.name + 'の観察眼が、' + b.name + 'の綻びを捉えた' + (b === S.cul ? '（……' + b.name + 'は犯人だ）' : ''); }
    if (k === 'confess') {
      S.confessed = true;
      var yes = pin || rng() < 0.25 + bond(S, b, a) * 0.5 + b.tr.warmth * 0.2;
      t += F(pk(S, pin ? B.pyes : yes ? B.yes : B.no), m);
      if (yes) { S.ties.push({ a: a.i, b: b.i, type: 'lover', born: true }); setRel(S, a, b, 0.2, '恋人'); why = pin ? '両片想いが、吹雪の館でやっと通じた（どちらも、自分だけの片想いだと思っていた）' : '吹雪の館で、恋が実った'; }
      else { S.ties.push({ a: a.i, b: b.i, type: 'crush', born: true }); setRel(S, a, b, -0.05, '片想い', a); why = '想いは届かなかった'; }
      if (a === S.cul || b === S.cul) why += '（……' + S.cul.name + 'は犯人だ）';
      var o2 = ST.say(S, { actors: [a, b], tag: '想いを告げる', kind: 'climax', text: t, why: why, mag: 32 }); ST.key(S, o2, a.name + 'が' + b.name + 'に告白'); return;
    }
    ST.sayB(S, { actors: [a, b], tag: '関係', text: t, why: why + '（' + a.name + '×' + b.name + '）' }, a.name + 'と' + b.name);
  }

  /* ---------- 関係図 ---------- */
  function relmap(S) {
    var P = S.P, edges = [], seen = {};
    function add(a, b, label, cls, dir) { var k = rk(P[a], P[b]) + label; if (seen[k]) return; seen[k] = 1; edges.push({ a: a, b: b, label: label, cls: cls, dir: dir }); }
    var CLS = { lover: 'love', sibbad: 'enemy', bad: 'enemy', mate: 'love', fated: 'love', almost: 'love', fwb: 'night', crush: 'pine', enemy: 'enemy', rival: 'enemy', ex: 'obsess', buddy: 'partner', best: 'friend', friend: 'friend', childhood: 'friend', sibling: 'guard', sibprot: 'guard', sibclose: 'guard', parent: 'guard', pparent: 'guard', master: 'partner', mentor: 'partner', teacher: 'partner', senpai: 'friend', colleague: 'friend', classmate: 'friend', boss: 'partner', benefactor: 'guard', relative: 'guard', worship: 'guard', fond: 'friend', blind: 'guard', acq: 'none' };
    S.ties.forEach(function (t) {
      /* 両片想い（逆向きの片想いもある）は、向きのない「両片想い」一本にまとめる */
      if (t.type === 'crush' && crushTo(S, P[t.b], P[t.a])) return add(Math.min(t.a, t.b), Math.max(t.a, t.b), (t.born ? '★' : '') + '両片想い', 'pine', null);
      var lab = HK.tieLabel ? HK.tieLabel(t) : HK.TIES && HK.TIES[t.type] ? HK.TIES[t.type].label : t.type; add(t.a, t.b, (t.born ? '★' : '') + lab, CLS[t.type] || 'friend', t.type === 'crush' || (HK.TIES && HK.TIES[t.type] && HK.TIES[t.type].dir) ? t.a : null); });
    Object.keys(S.relLab || {}).forEach(function (k) {
      var ab = k.split('-'), a = +ab[0], b = +ab[1], lab = S.relLab[k];
      if (lab === '恋人' || lab === '片想い') return;
      var cls = /険悪/.test(lab) ? 'enemy' : /不信/.test(lab) ? 'obsess' : /信頼|支え合う|和解/.test(lab) ? 'guard' : /協力/.test(lab) ? 'partner' : 'friend';
      add(a, b, '★' + lab, cls, S.relDir[k] != null ? S.relDir[k] : null);
    });
    S.P.forEach(function (p) { if (p.buddy && !ties(S, p, p.buddy).length) add(p.i, p.buddy.i, '助手', 'partner', p.i); });
    S.kills.forEach(function (k) { if (k.v.i != null && !S.mot.nobody) add(S.cul.i, k.v.i, '殺害', 'kill', S.cul.i); });
    if (S.acc) add(S.acc.i, S.cul.i, '共犯', 'kill', null);
    return {
      nodes: P.map(function (p) { return { i: p.i, name: p.name, sub: p.roleLabel + (p.isCul ? '・犯人' : p.isAcc ? '・共犯' : ''), dead: !p.alive, fate: p.fate }; }),
      edges: edges, note: '★は館で生まれた・変わった関係。矢印は気持ちや行為の向き。' + (S.host.npc ? '館の主（' + S.host.name + '）は図に入っていない。' : '')
    };
  }
  /* ---------- 吹雪が止んだ（解けなかった） ---------- */
  function finale(S) {
    var c = S.cul;
    ST.step(S, '吹雪が止んだ朝');
    if (!inv(S).length && alive(c)) {
      S.over = 'free';
      ST.say(S, { actors: [c], tag: '結末', kind: 'climax', text: '探偵役は、もう誰も残っていなかった。' + F(pk(S, T.END_FREE), { c: c.name, m: S.M }), why: '犯人は探偵役をすべて退けた', mag: 50 });
      return;
    }
    S.over = S.wrongOnce ? 'wrong' : 'escape';
    if (S.mot.nobody) { S.over = 'nobody_x'; ST.say(S, { kind: 'phase', tag: '結末', text: '吹雪が止み、警察が到着した。事件は、' + c.name + 'の犯行として処理された。――真相は、' + S.v1.name + 'の自作自演だった。', why: '誰も真相にたどり着けなかった' }); return; }
    if (alive(c)) ST.say(S, { actors: [c], tag: '結末', kind: 'climax', text: F(pk(S, T.END_ESCAPE), { c: c.name }), why: '手がかり ' + found(S) + '/' + S.need + '。犯人は逃げおおせた', mag: 50 });
  }

  /* ---------- 結果 ---------- */
  function finish(S, input) {
    var P = S.P, c = S.cul, mot = S.mot;
    P.forEach(function (p) {
      if (!p.fate) p.fate = alive(p) ? (p.bound ? '拘束された' : '生き延びた') : p.gone ? '行方不明' : '死亡';
      p.notes.push('役割：' + p.roleLabel + (p.buddy ? '（' + p.buddy.name + 'のバディ）' : '') + (p.isCul ? '・犯人' : p.isAcc ? '・共犯' : ''));
      p.notes.push('見つけた手がかり ' + p.cnt.clue + 'つ・恐怖 ' + Math.round(p.m.fear) + (HK.DGK && p.kn ? '・検死の知識：' + HK.DGK.KNOW_LABEL[p.kn] : ''));
      if (Y.SPEC && Y.SPEC.note(p)) p.notes.push(Y.SPEC.note(p));
    });
    var titles = {
      arrest: c.name + 'が犯人だった。――逮捕', dead: c.name + 'が犯人だった。――真相が明かされたとき、もうこの世にいなかった', suicide: c.name + 'が犯人だった。――自ら命を絶った', flee: c.name + 'が犯人だった。――吹雪の中へ消えた',
      wrong: S.mot.nobody ? '推理は外れた。' + c.name + 'は、' + S.v1.name + 'の仕組んだ罠にはまった' : '推理は外れた。真犯人の' + c.name + 'は逃げおおせた', escape: '事件は解かれなかった。犯人の' + c.name + 'は、何食わぬ顔で館を去った', free: '探偵役は全滅した。' + c.name + 'の完全犯罪', nobody: '犯人はいなかった。――' + S.v1.name + 'の自作自演'
    };
    titles.nobody_x = '事件は' + c.name + 'の犯行として処理された。真相は、' + S.v1.name + 'の自作自演';
    if (false) titles.nobody = '事件は' + c.name + 'の犯行として処理された。真相は、' + S.v1.name + 'の自作自演';
    var title = titles[S.over] || titles.escape;
    var lines = P.map(function (p) { return p.name + '（' + p.roleLabel + '）：' + p.fate; });
    if (S.host.npc) lines.push(S.host.name + '（館の主）：' + (S.host.fate || '生き延びた'));
    lines.push('動機：' + mot.cat + '「' + mot.label + '」――' + F(mot.why, fmtV(S, S.v1)));
    S.kills.forEach(function (k, i) { lines.push((i + 1) + '人目：' + k.v.name + '（' + k.trick.place + '・' + k.trick.method + '）――' + truthOf(S, k)); });
    if (S.acc) lines.push('共犯：' + S.acc.name);
    (S.extraKills || []).forEach(function (x) { lines.push('事件とは別の殺人：' + x.a.name + 'が、憎んでいた' + x.b.name + 'を手にかけた'); });
    /* 蘇った不死・吸血鬼は被害者から外す（順167） */
    var rows = P.map(function (p) { return { i: p.i, rank: '', cells: [p.roleLabel, p.isCul ? '犯人' : p.isAcc ? '共犯' : S.kills.some(function (k) { return k.v === p && !k.revived; }) ? '被害者' : S.kills.some(function (k) { return k.v === p; }) ? '蘇った' + (p.isDet ? '探偵役' : '') : p.isDet ? '探偵役' : '',p.cnt.clue ? Math.round(p.cnt.clue) + 'つ' : '―', Math.round(p.m.sus) + '', p.fate] }; });
    /* 助手と、結びついた探偵（点検の state-audit.js が、助手の「先生」の向きを確かめるのに使う） */
    var buddyMap = {}; S.P.forEach(function (p) { if (p.role === 'assistant' && p.buddy) buddyMap[p.i] = p.buddy.i; });
    var res0 = ST.result(S, input, {
      ending: { title: title, kind: /arrest|suicide|nobody|dead/.test(S.over) ? 'ok' : 'over', lines: lines },
      estats: [['犯人', c.name + (S.acc ? '（共犯：' + S.acc.name + '）' : '')], ['動機', mot.label], ['犠牲者', S.kills.filter(function (k) { return !k.revived; }).length + '人' + (S.kills.some(function (k) { return k.revived; }) ? '（ほかに蘇った人 ' + S.kills.filter(function (k) { return k.revived; }).length + '）' : '')], ['手がかり', found(S) + '/' + S.need], ['館', S.M]],
      table: { title: '館にいた人々', hint: '疑い：一行からの疑いの強さ。犯人は痕跡が見つかるほど上がり、罪を着せられた人も上がる。', cols: ['役割', '立場', '手がかり', '疑い', '結末'], rows: rows },
      meters: [{ label: '恐怖', color: '--love' }, { label: '疑い', color: '--enemy', dash: true }, { label: '手がかり', color: '--accent', max: 4 }],
      relmap: relmap(S),
      meta: S.M + '・吹雪' + S.env.days + '日',
      summary: '吹雪の館の殺人：' + title
    });
    res0.yakataBuddy = buddyMap;
    return res0;
  }
  Y.cat = cat; Y.showdown = showdown; Y.kinNo = kinNo;
  Y.gain = gain; Y.inv = inv;
  Y.skill = skill; Y.bond = bond; Y.setRel = setRel; Y.relLabel = relLabel; Y.alive = alive; Y.pining = pining;
})();
