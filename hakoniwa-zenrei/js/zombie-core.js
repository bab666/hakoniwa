/* 箱庭シミュレーター: ゾンビの街 ― 本体（準備・移動・群れとの遭遇・感染と発症・飢え・絶望・最終日）
   住人は9つのエリアのどこかからランダムに始まり、同じエリアにいる者どうしだけが関わり合う。
   咬まれた者は、体力と運しだいの時間ののちにゾンビになる。ゾンビになった住人は、気質と関係しだいで
   手当たり次第に人を襲うか、愛着のある相手だけを追いかける */
(function () {
  'use strict';
  var HK = window.HK, Z = HK.ZB;
  var PARTS = ['朝', '昼', '夕方', '夜'];
  function L(s) { return s.split('|'); }
  function names(list) { return list.map(function (c) { return c.name; }).join('・'); }
  function AR(ctx, i) { return ctx.zb.A[i]; }
  function an(ctx, i) { return ctx.zb.A[i].name; }
  function inArea(ctx, i) { return ctx.present().filter(function (o) { return o.z.area === i; }); }
  /* 咬まれて一人で離れた人（z.alone）は、同じエリアにいても一行とは別行動（一緒に数えない） */
  function here(ctx, c) { if (c.z.alone) return []; return ctx.present().filter(function (o) { return o !== c && o.z.area === c.z.area && !o.z.alone; }); }
  function tieT(ctx, a, b) { var t = HK.Ties && HK.Ties.get(ctx, a, b); return t ? (t.like || t.type) : ''; }
  function day(ctx) { return Math.floor(ctx.stepIndex / 4) + 1; }
  function part(ctx) { return ctx.stepIndex % 4; }
  function lastDay(ctx) { return day(ctx) >= ctx.env.days; }
  function luck(ctx, c) { return ctx.stat(c, 'luck'); }
  function wname(c) { return c.weapon ? c.weapon.name : '素手'; }
  Z.inArea = inArea; Z.here = here; Z.an = an; Z.day = day; Z.part = part; Z.names = names;

  var scen = {
    id: 'zombie', name: 'ゾンビの街', kicker: 'サバイバル・パニック',
    desc: 'ゾンビのはびこる街で7日間を生き延びる。開始地点はランダムで、街は9つのエリア。咬まれれば、いつかは向こう側へ。食料の奪い合い、錯綜する噂、狂人・宗教家・軍人・迷子の子。舞台は日本か、銃の出回る海外の街か。',
    note: '※死・自死・殺人の描写を含みます。',
    unit: '日', perUnit: 4, preRel: 2, lethal: true, maxCast: 20,
    derived: ['caution', 'aggr', 'warmth', 'cold'],
    exclude: ['lighten', 'tease', 'compliment', 'glance', 'lecture'],
    catBias: { romance: 0.75, combat: 1.1, betray: 1.1 },
    decay: 0.97, miniShare: 0.9, actRate: 0.45,
    env: [
      { id: 'region', label: '舞台', type: 'select', def: 'jp', options: [{ v: 'jp', label: '日本の地方都市' }, { v: 'us', label: '海外の街（銃が出回っている）' }] },
      { id: 'days', label: '生き延びる日数', min: 3, max: 10, def: 7, lo: '3日', hi: '10日', unit: '日' },
      { id: 'outbreak', label: 'ゾンビの多さ', min: 0, max: 100, def: 50, lo: 'まばら', hi: '街を埋め尽くす', desc: '多いほど群れに出くわしやすく、咬まれやすい。日を追うごとに増えていく' },
      { id: 'turn', label: '発症までの早さ', min: 0, max: 100, def: 50, lo: '数日もつ', hi: '数時間で', desc: '咬まれてからゾンビになるまで。実際には本人の体力と運でも変わる' },
      { id: 'rumor', label: '情報の錯綜', min: 0, max: 100, def: 55, lo: 'ほぼ正確', hi: 'デマだらけ', desc: 'SNS・ラジオ・人づての噂にデマが混ざる割合。安全な地区や救助の場所も、信じたものが本当とは限らない' },
      { id: 'npc', label: 'NPCの出現', min: 0, max: 100, def: 55, lo: 'ほぼ出ない', hi: '次々に現れる', desc: '狂人・宗教家・軍人・迷子の子・医者・略奪者など、住人以外の生存者' },
      { id: 'end', label: '最終日', type: 'select', def: 'heli', options: [{ v: 'heli', label: '救助ヘリが来る（着陸地点は噂しだい）' }, { v: 'none', label: '救助は来ない（生き延びるだけ）' }, { v: 'burn', label: '街ごと焼き払われる（脱出するしかない）' }] }
    ],
    stats: [
      { id: 'hp', label: '体力', desc: '格闘・飢えへの強さ。咬まれてから発症するまでの長さにも効く' },
      { id: 'luck', label: '運', desc: '咬まれにくさ・物資の見つけやすさ・脱出の成功率。発症までの長さにも効く' }
    ],
    perFields: [
      { id: 'fam', label: '家族', auto: 'いない（設定しなければ）', options: [{ id: 'none', label: 'いない' }, { id: 'in', label: '街のどこかにいる' }, { id: 'out', label: '街の外にいる' }] }
    ],
    actions: [
      { id: 'hole', label: '立てこもる', fit: function (t) { return t.caution; }, bias: { solo: 1.3, combat: 0.7 } },
      { id: 'loot', label: '物資を探して回る', fit: function (t) { return t.a * 0.5 + t.fc * 0.3 + 0.1; }, bias: { help: 1.2 } },
      { id: 'seek', label: '知り合いを探す', fit: function (t) { return t.warmth; }, bias: { bond: 1.5, help: 1.3 } },
      { id: 'info', label: '情報を集める', fit: function (t) { return t.a * 0.6 + t.caution * 0.3; }, bias: { solo: 1.2 } },
      { id: 'hunt', label: 'ゾンビを狩る', fit: function (t) { return t.aggr; }, bias: { combat: 1.6 } }
    ],
    goals: [
      { id: 'live', label: 'とにかく生き延びる', fit: function (t) { return t.caution * 0.6 + t.cold * 0.4; } },
      { id: 'escape', label: '街を出る', fit: function (t) { return t.a * 0.5 + t.lead * 0.3 + t.fc * 0.2; }, bias: { escape: 1.8 } },
      { id: 'family', label: '家族と合流する', fit: function (t) { return t.np * 0.6 + t.ac * 0.3; }, bias: { help: 1.3 } },
      { id: 'protect', label: '大切な人を守る', fit: function (t) { return t.np; }, bias: { help: 2 }, needsFocus: true },
      { id: 'chaos', label: 'この混乱を利用する', fit: function (t) { return t.cold * 0.5 + t.aggr * 0.5 - t.np * 0.4; }, bias: { betray: 2, combat: 1.4, help: 0.5 } }
    ],
    steps: function (env) { var s = []; for (var d = 1; d <= env.days; d++) PARTS.forEach(function (p) { s.push(d + '日目・' + p); }); return s; },
    othersFor: function (ctx, a) { if (a.z && a.z.alone) return []; return ctx.present().filter(function (c) { return c !== a && c.z && a.z && c.z.area === a.z.area && !c.z.alone; }); },
    longRun: function (env) { return env.days >= 6; },
    setup: function (ctx) { setup(ctx); },
    phase: function (ctx, s, n) { phase(ctx, s, n); },
    after: function (ctx, s, n) { after(ctx, s, n); },
    end: function (ctx) { return ctx.present().length === 0 && ctx.stepIndex > 0; },
    finish: function (ctx) { finish(ctx); },
    events: []
  };
  HK.SCENARIOS.zombie = scen;
  var ti = HK.SCEN_ORDER.indexOf('trial');
  if (ti < 0) ti = HK.SCEN_ORDER.indexOf('br');
  if (ti < 0) ti = HK.SCEN_ORDER.indexOf('island');
  if (ti >= 0) HK.SCEN_ORDER.splice(ti + 1, 0, 'zombie'); else HK.SCEN_ORDER.push('zombie');
  Z.scen = scen;

  /* ======================= 準備 ======================= */
  function setup(ctx) {
    var rng = ctx.rng, env = ctx.env, reg = env.region === 'us' ? 'us' : 'jp';
    var base = 18 + env.outbreak * 0.62;
    var zb = ctx.zb = {
      reg: reg, A: Z.AREAS[reg].map(function (a, i) { return { i: i, name: a.name, def: a, z: HK.clamp(base * a.danger * (0.8 + rng() * 0.4), 3, 100), food: Math.round(a.food * 10 + rng() * 3), loot: a.loot, bar: 0, fallen: false, seen: {} }; }),
      npcs: [], zpc: [], net: 8 + rng.int(9), stats: { bites: 0, turned: 0, putdown: 0, npcDead: 0, escaped: 0 },
      safe: -1, heli: -1, fallAt: -1, rumors: {}, moves: []
    };
    /* 本当に安全な場所：避難所（いずれ落ちることもある）か、どこにもないか */
    var r0 = rng();
    zb.safe = r0 < 0.55 ? 5 : r0 < 0.8 ? 7 : -1;
    if (zb.safe >= 0 && rng() < 0.55) zb.fallAt = (2 + rng.int(Math.max(2, env.days - 2))) * 4 + rng.int(4);
    if (env.end === 'heli') zb.heli = rng.pick([5, 7, 2, 8]);
    ctx.place = '街';
    var W = Z.WEAPONS[reg];
    ctx.chars.forEach(function (c) {
      c.hp = 62 + ctx.stat(c, 'hp') * 7;
      c.weapon = Z.weapon(rng.pick(W.start));
      if (reg === 'us' && !c.weapon.gun && rng() < 0.18) c.weapon = Z.weapon(rng.pick([['拳銃', 7, 1, 1], ['リボルバー', 7, 1, 1]]));
      var z = c.z = { area: rng.int(9), food: 1 + rng.int(3), bitten: null, aware: false, decided: false, turnAt: -1, wound: -1, hunger: 0, know: {}, safe: null, heliAt: null, family: null, moved: false, path: [], kills: 0, believe: {} };
      z.start = z.area; z.path.push(z.area);
      /* 家族 */
      var fp = (c.pick || {}).fam, kin = ctx.chars.filter(function (o) { var t = tieT(ctx, c, o); return o !== c && (t === 'parent' || t === 'sibling'); })[0];
      if (kin) z.family = { pc: kin.i, rel: tieT(ctx, c, kin) === 'sibling' || /^sib/.test((HK.Ties.get(ctx, c, kin) || {}).type || '') ? 'きょうだい' : '家族', state: 'ok' };
      else if (fp === 'none') z.family = null;
      else if (fp === 'in' || fp === 'out') {
        var inside = fp === 'in';
        z.family = { rel: rng.pick(Z.FAMILY), inside: inside, area: inside ? rng.int(9) : -1, state: 'ok', known: true };
      }
      if (c.goal.id === 'family' && !z.family) c.goal = scen.goals[c.tr.cold > 0.55 ? 0 : 1];
      if (c.goal.id === 'family' && z.family && z.family.pc != null) { c.focus = ctx.chars[z.family.pc]; }
    });
  }

  /* ======================= 区切りごと ======================= */
  function phase(ctx, s, n) {
    var zb = ctx.zb, rng = ctx.rng;
    zb.moves = [];
    ctx.present().forEach(function (c) { c.z.moved = false; });
    if (s === 0) { intro(ctx); ctx.present().forEach(function (a) { ctx.present().forEach(function (b) { if (a !== b && a.z.area === b.z.area) ctx.pair(a, b).zmet = true; }); }); pacts(ctx); }
    if (s > 0 && part(ctx) === 0) morning(ctx);
    if (zb.fallAt === s && zb.safe >= 0) shelterFalls(ctx);
    Z.spawnNPC(ctx);
    moveAll(ctx);
    pacts(ctx);
    hordes(ctx);
    Z.escapes(ctx);
    Z.npcStep(ctx);
    zombiesAct(ctx);
  }
  function after(ctx, s, n) {
    ctx.present().forEach(function (c) { if (c.hp <= 0) ctx.kill(c, null, '傷と疲労が重なって'); });
    ctx.flush();
    infection(ctx);
    wounds(ctx);
    if (part(ctx) === 3) { hunger(ctx); despair(ctx); }
    ctx.present().forEach(function (c) { ctx.stress(c, 0.5 + (part(ctx) === 3 ? 2 : 0) + (here(ctx, c).length ? -1.5 : 1.5)); });
    if (s === n - 1) finale(ctx);
    ctx.flush();
  }

  function intro(ctx) { Z.intro(ctx); }

  /* 朝：ゾンビが増え、電波が途絶え、家族の消息が動く */
  function morning(ctx) {
    var zb = ctx.zb, rng = ctx.rng, d = day(ctx);
    zb.A.forEach(function (A) { A.z = HK.clamp(A.z * (1.05 + ctx.env.outbreak / 900) + 2 + rng() * 4, 0, 100); A.bar = Math.max(0, A.bar - 0.05); });
    var t = d + '日目の朝。';
    if (ctx.stepIndex === zb.net || (ctx.stepIndex > zb.net && !zb.netDown)) { zb.netDown = true; t += 'スマホの電波が、ついに消えた。もう誰とも連絡は取れない。'; }
    else if (!zb.netDown && rng() < 0.4) t += rng.pick(['ラジオは同じ避難の呼びかけを繰り返している。', 'SNSのタイムラインは、悲鳴と祈りとデマで埋まっていた。', '遠くで、ヘリのローター音が聞こえた気がした。']);
    else t += rng.pick(['街のどこかで、火事の煙が上がっている。', '昨日より、呻き声が近い。', '朝なのに、鳥の声が一つもしない。']);
    if (lastDay(ctx)) t += ctx.env.end === 'heli' ? '今日、救助が来る――そういう噂だった。' : ctx.env.end === 'burn' ? '上空を、爆撃機らしき影が旋回していた。' : '最後の一日だ。';
    ctx.say({ text: t });
    /* 家族の消息 */
    ctx.present().forEach(function (c) {
      var f = c.z.family;
      if (!f || f.pc != null || f.state !== 'ok') return;
      var risk = f.inside ? AR(ctx, f.area).z / 100 * 0.18 : 0.04;
      if (rng() < risk) f.state = rng() < 0.55 ? 'zombie' : 'dead';
      if (zb.netDown || rng() > 0.45) return;
      var k = f.state === 'ok' ? (rng() < 0.75 ? 'ok' : 'silent') : rng() < 0.6 ? 'bad' : 'silent';
      if (k === 'ok' && f.inside && rng() < 0.3) { var na = rng.pick(Z.adj(f.area)); f.area = na; }
      var raw = rng.pick(Z.FAMILY_NEWS[k]);
      var txt = ctx.t(raw, c).replace(/\{f\}/g, /\{a\}/.test(raw) ? f.rel : c.name + 'の' + f.rel).replace(/\{place\}/g, f.inside ? an(ctx, f.area) : '街の外の避難所');
      if (k === 'bad') { f.heard = true; ctx.stress(c, 22); }
      ctx.act2({ actors: [c], cat: 'solo', text: txt, why: '家族との連絡（電波が生きているうち）', mag: k === 'bad' ? 20 : 6 });
      Z.goalShift(ctx, c, k === 'bad' ? 'familyBad' : null);
    });
  }
  function shelterFalls(ctx) {
    var zb = ctx.zb, A = AR(ctx, zb.safe);
    A.fallen = true; A.z = Math.min(100, A.z + 55);
    var P = inArea(ctx, zb.safe);
    ctx.say({ kind: 'event', cat: 'phase', actors: P, text: A.name + 'が落ちた。' + (zb.reg === 'us' ? '州兵のバリケード' : 'バリケード') + 'の内側で、誰かが発症したのだ。' + (P.length ? names(P) + 'は、悲鳴の中を逃げ出すしかなかった。' : '安全な場所は、もうどこにもないのかもしれない。'), why: '安全だった場所も、いつかは落ちる', mag: 30 });
    P.forEach(function (c) { ctx.stress(c, 15); });
    zb.safe = -1;
  }

  /* ======================= 移動 ======================= */
  function exitArea(ctx, c) {
    var ex = [];
    ctx.zb.A.forEach(function (A, i) { if (A.def.exit) ex.push(i); });
    return ex.sort(function (x, y) { return Z.dist(c.z.area, x) - Z.dist(c.z.area, y); })[0];
  }
  function foodArea(ctx, c) {
    var best = c.z.area, bv = -1;
    ctx.zb.A.forEach(function (A, i) { var v = A.food * 2 - Z.dist(c.z.area, i) * 3 - A.z / 10; if (v > bv) { bv = v; best = i; } });
    return best;
  }
  /* 本人の目的地 */
  function destOf(ctx, c) {
    var z = c.z, g = c.goal.id, f = z.family;
    if (z.cult != null) { var np = ctx.zb.npcs[z.cult]; if (np && np.alive) return np.area; }
    if (z.alone) return z.area;
    if (Z.cureDest) { var cd = Z.cureDest(ctx, c); if (cd != null) return cd; }
    /* 執着している相手を探す（obsess-install.js） */
    if (Z.obsDest) { var od = Z.obsDest(ctx, c); if (od != null) return od; }
    /* はぐれた大切な人を探す（zombie-seek.js） */
    if (Z.seekDest && g === 'seek') { var sd = Z.seekDest(ctx, c); if (sd != null) return sd; }
    if (ctx.env.end === 'burn' && (z.know.burn || day(ctx) >= ctx.env.days - 1)) return exitArea(ctx, c);
    if (lastDay(ctx) && z.heliAt != null) return z.heliAt;
    if (g === 'escape') return exitArea(ctx, c);
    if (g === 'family' && f) {
      if (f.pc != null) { var k = ctx.chars[f.pc]; return k.alive && !k.out ? k.z.area : z.area; }
      if (f.inside && !f.found) return f.area;
      if (!f.inside) return exitArea(ctx, c);
    }
    if (g === 'protect' && c.focus && c.focus.alive && !c.focus.out) return c.focus.z.area;
    if (z.drug && !z.drugDone && z.bitten) { var h = 3; return h; }
    if (z.food <= 0 && c.z.hunger >= 1) return foodArea(ctx, c);
    if (z.safe != null && z.safe !== z.area) return z.safe;
    if (c.action.id === 'loot' && AR(ctx, z.area).food <= 1) return foodArea(ctx, c);
    /* 行くあてがなければ、避難所をめざす（避難所が落ちたと知るまで） */
    var sh = ctx.zb.A.filter(function (A) { return A.def.shelter; })[0];
    if (sh && sh.fallen) z.noShelter = true;
    if (sh && !z.noShelter && (c.action.id !== 'hole' || AR(ctx, z.area).z > 55) && (g === 'live' || g === 'protect' || g === 'family')) return sh.i;
    /* ここが危なすぎるなら、隣のましな場所へ */
    if (AR(ctx, z.area).z > 62) return Z.adj(z.area).sort(function (x, y) { return AR(ctx, x).z - AR(ctx, y).z; })[0];
    if (c.action.id === 'seek') {
      var want = ctx.chars.filter(function (o) { return o !== c && o.alive && !o.out && (ctx.R(c, o).aff > 35 || tieT(ctx, c, o)); }).sort(function (x, y) { return ctx.R(c, y).aff - ctx.R(c, x).aff; })[0];
      if (want) return want.z.area;
    }
    return z.area;
  }
  Z.destOf = destOf;
  /* 同じエリアで手を組んでいる者どうしをまとめる */
  function groups(ctx) {
    var P = ctx.present(), par = {};
    P.forEach(function (c) { par[c.i] = c.i; });
    function f(x) { while (par[x] !== x) x = par[x] = par[par[x]]; return x; }
    P.forEach(function (a) {
      P.forEach(function (b) {
        if (a.i >= b.i || a.z.area !== b.z.area || a.z.alone || b.z.alone || a.z.cult != null || b.z.cult != null) return;
        var pf = ctx.pair(a, b), t = tieT(ctx, a, b), TD = t ? HK.TIES[t] : null;
        if (pf.allied || (TD && TD.pol > 0) || (ctx.R(a, b).trust > 14 && ctx.R(b, a).trust > 14 && ctx.R(a, b).ten < 50)) par[f(a.i)] = f(b.i);
      });
    });
    var G = {};
    P.forEach(function (c) { var r = f(c.i); (G[r] = G[r] || []).push(c); });
    return Object.keys(G).map(function (k) { return G[k]; });
  }
  Z.groups = groups;
  function moveAll(ctx) {
    var rng = ctx.rng, night = part(ctx) === 3, lines = [];
    groups(ctx).forEach(function (g) {
      var lead = ctx.most(g, function (c) { return c.tr.lead + (c.goal.id === 'escape' || c.goal.id === 'family' ? 0.2 : c.goal.id === 'obsess' ? 0.35 : c.goal.id === 'seek' ? 0.3 : 0); });
      var gd = destOf(ctx, lead);
      /* 行き先の違う仲間は、別行動を選ぶことがある */
      var go = g.slice();
      if (g.length > 1) g.forEach(function (c) {
        if (c === lead) return;
        var d = destOf(ctx, c);
        if (d !== gd && d !== c.z.area && (c.goal.id === 'family' || c.goal.id === 'protect' || c.goal.id === 'obsess' || c.goal.id === 'seek' || (c.goal.id === 'escape' && rng() < 0.4)) && rng() < (c.goal.id === 'obsess' || (Z.seekBold && Z.seekBold(ctx, c)) ? 0.85 : c.goal.id === 'seek' ? 0.6 : 0.55) - ctx.R(c, lead).aff / 250) {
          go.splice(go.indexOf(c), 1);
          moveOne(ctx, [c], d, lines);
          ctx.act2({ actors: [c, lead], cat: 'solo', fx: function () { ctx.mod2(c, lead, { trust: -3 }, { trust: -2, ten: 3 }); }, text: ctx.t(ctx.pick(['{a}は「ここで別れる」と言った。{b}が止める前に、{a}はもう背中を向けていた。', '{a}は{b}たちに頭を下げて、一人で' + an(ctx, Z.step(c.z.area === d ? lead.z.area : c.z.path[c.z.path.length - 1], d)) + 'の方へ歩き出した。', '「行かなきゃいけない場所がある」――{a}は{b}の制止を振り切った。']), c, lead), why: c.name + 'の目標「' + c.goal.label + '」が、群れの行き先と違った' });
        }
      });
      if (!go.length || gd === lead.z.area) return;
      /* 夜は動かない（執着している相手を探している人は、夜でも出ていくことがある） */
      /* 探している相手が執着・信仰の相手なら、夜でも危険を顧みずに出ていく（zombie-seek.js） */
      if (night && rng() < (lead.goal.id === 'obsess' ? 0.35 : Z.seekBold && Z.seekBold(ctx, lead) ? 0.2 : lead.goal.id === 'seek' ? 0.6 : 0.75) && AR(ctx, lead.z.area).z < 70) return;
      moveOne(ctx, go, gd, lines);
    });
    if (lines.length) ctx.say({ kind: 'phase', cat: 'phase', text: '移動：' + lines.join('／') });
    meetings(ctx);
  }
  function moveOne(ctx, g, dest, lines) {
    var from = g[0].z.area, to = Z.step(from, dest);
    if (to === from) return;
    g.forEach(function (c) { c.z.area = to; c.z.moved = true; c.z.path.push(to); });
    lines.push(names(g) + ' ' + an(ctx, from) + '→' + an(ctx, to));
  }
  /* 動いた先で、別の住人と出会う（全員が動き終わってから） */
  function meetings(ctx) {
    var P = ctx.present();
    P.forEach(function (a) {
      if (!a.z.moved) return;
      var there = P.filter(function (o) { return o !== a && o.z.area === a.z.area && !ctx.pair(a, o).zmet; });
      if (!there.length) return;
      var b = ctx.most(there, function (o) { return Math.abs(ctx.R(a, o).aff) + ctx.R(a, o).att + (tieT(ctx, a, o) ? 50 : 0); });
      there.forEach(function (o) { ctx.pair(a, o).zmet = true; });
      var to = a.z.area, t0 = tieT(ctx, a, b), TD = t0 ? HK.TIES[t0] : null;
      /* 敵視している相手と、同じエリアで出会ったとき（hate-kit.js）：嫌悪の強さ・性格・相手の気持ちで反応が変わる */
      if (HK.HateKit) {
        var HKt = HK.HateKit, la = HKt.level(ctx, a, b), lb = HKt.level(ctx, b, a);
        if (la >= 35 || lb >= 35) {
          var hx = la >= lb ? a : b, hy = hx === a ? b : a, hm = HKt.meet(ctx, hx, hy, an(ctx, to) + 'で、');
          (ctx.pair(hx, hy).hkMet = ctx.pair(hx, hy).hkMet || {})[hx.i] = 1;
          return ctx.act2({ actors: [hx, hy], cat: hm.cat, text: hm.text, why: hm.why, mag: hm.mag });
        }
      }
      if (Z.reunion) { var rr = Z.reunion(ctx, a, b, to); if (rr) return ctx.act2(rr); }
      var kind = TD && TD.pol > 0 ? 'kin' : ctx.R(a, b).ten > 35 || (TD && TD.pol < 0) ? 'bad' : ctx.R(a, b).aff + ctx.R(b, a).aff > 40 ? 'good' : 'new';
      var T = {
        kin: ['{a}は' + an(ctx, to) + 'で{b}の姿を見つけた。生きていた――{a}は駆け寄って、{b}の肩を掴んだ。', '{a}と{b}は、' + an(ctx, to) + 'で互いに武器を向けかけて、同時に名前を呼んだ。'],
        good: [an(ctx, to) + 'の物陰から現れたのは、{b}だった。{a}は構えた' + wname(a) + 'を、ゆっくり下ろした。', '{a}は' + an(ctx, to) + 'で、見覚えのある顔を見つけた。{b}だ。知った顔がこんなに嬉しいとは思わなかった。'],
        new: ['{a}は' + an(ctx, to) + 'で、{b}と出くわした。生きている人間を見るのは、半日ぶりだった。', an(ctx, to) + 'の暗がりから、{b}が両手を上げて出てきた。「噛まれてない。人間だ」', '{a}が' + an(ctx, to) + 'に着くと、先に{b}がいた。{b}は' + wname(b) + 'を握ったまま、{a}をじっと見ていた。'],
        bad: ['{a}は' + an(ctx, to) + 'で{b}と鉢合わせた。どちらも、武器を下ろさなかった。', an(ctx, to) + 'にいたのは{b}だった。{a}は舌打ちをこらえた。よりによって、こいつか。']
      }[kind];
      ctx.act2({ actors: [a, b], cat: kind === 'bad' ? 'conflict' : 'bond', fx: function () { if (kind === 'bad') ctx.mod2(a, b, { ten: 6 }, { ten: 6 }); else ctx.mod2(a, b, { aff: kind === 'new' ? 3 : 8, trust: kind === 'new' ? 5 : 8 }, { aff: kind === 'new' ? 3 : 8, trust: kind === 'new' ? 5 : 8 }); },
        text: ctx.t(ctx.pick(T), a, b), why: { kin: '再会（' + (TD ? TD.label : '') + '）', good: '再会（好意）', new: '居合わせた', bad: 'もともとの緊張' }[kind], mag: kind === 'kin' ? 16 : 8 });
    });
  }

  /* 同じ場所に居合わせた者どうしが、生き延びるために手を組む */
  var PACT = L('{a}と{b}は、どちらからともなく「一緒に行こう」と言った。ひとりでいるよりは、ましだった。|{a}は{b}に、見張りを交代でやらないかと持ちかけた。{b}は少し迷ってから頷いた。|{a}と{b}は、無言で背中を合わせた。言葉より先に、生き延びるための同盟ができていた。|{b}は{a}を信用していなかった。それでも、夜をひとりで越すよりはいいと、{a}の差し出した手を取った。');
  function pacts(ctx) { Z.pacts(ctx); }

  /* ======================= 群れとの遭遇 ======================= */
  var HORDE = {
    open: L('{area}の角を曲がった瞬間、呻き声の壁にぶつかった。|{area}で、割れた窓から何十本もの腕が伸びてきた。|{area}の静けさは罠だった。物陰から、ゾンビの群れがあふれ出した。|{who}の足音に、{area}じゅうのゾンビが一斉に顔を上げた。|{area}に、どこからか腐臭が流れ込んできた。気づいたときには、通りの両側から群れが迫っていた。'),
    night: L('夜の{area}で、懐中電灯の光が、こちらを向いた無数の白い目を照らした。|真っ暗な{area}で、すぐ近くから呻き声がした。一つではなかった。|夜の{area}に、ガラスの割れる音が響いた。バリケードが破られたのだ。'),
    flee: L('{who}は振り返らずに走り、どうにか群れをまいた。|{who}は非常階段を駆け上がり、扉に鍵をかけて息をひそめた。|{who}は車の下に潜り込み、足音が遠ざかるまで息を止めていた。'),
    fight: L('{who}は武器を構え、群れの先頭から一体ずつ頭を潰していった。|{who}は狭い通路に群れを誘い込み、入口で迎え撃った。|{who}は背中合わせになって、群れが途切れるまで武器を振るい続けた。'),
    loud: L('銃声が響き渡り、{area}じゅうのゾンビが音の方へ集まってきた。|{w}の轟音が、遠くの群れまで呼び寄せてしまった。')
  };
  function power(c) { return (c.weapon ? c.weapon.pow : 0) * 5 + c.hp * 0.25 + c.tr.aggr * 12 + c.tr.a * 6; }
  function hordes(ctx) {
    var rng = ctx.rng, tm = [0.8, 0.7, 1.0, 1.35][part(ctx)];
    groups(ctx).forEach(function (g) {
      g = g.filter(function (c) { return c.alive && !c.out; });
      if (!g.length) return;
      var A = AR(ctx, g[0].z.area);
      var moved = g.some(function (c) { return c.z.moved; });
      var p = HK.clamp(A.z / 100 * tm * (moved ? 1.3 : 0.75) * (1 - A.bar * 0.6) * (g.some(function (c) { return c.action.id === 'hunt'; }) ? 1.3 : 1) * 0.5, 0, 0.8);
      if (rng() > p) return;
      hordeEvent(ctx, g, A);
    });
  }
  Z.hordeEvent = function (ctx, g, A) { return hordeEvent(ctx, g, A); };
  function hordeEvent(ctx, g, A) {
    var rng = ctx.rng, zb = ctx.zb, who = names(g);
    var t = ctx.pick(part(ctx) === 3 && rng() < 0.6 ? HORDE.night : HORDE.open).replace(/\{area\}/g, A.name).replace(/\{who\}/g, who);
    var pw = g.reduce(function (s, c) { return s + power(c); }, 0) / Math.sqrt(g.length), threat = A.z * (0.6 + rng() * 0.8) * (part(ctx) === 3 ? 1.25 : 1);
    var fight = g.some(function (c) { return c.action.id === 'hunt' || c.tr.aggr > 0.6; }) && pw + rng() * 30 > threat * 0.8;
    var why = A.name + 'のゾンビの多さ（' + Math.round(A.z) + '）' + (part(ctx) === 3 ? '・夜' : '');
    var actors = g.slice(), mag = 18;
    if (fight) {
      t += ctx.pick(HORDE.fight).replace(/\{who\}/g, who);
      A.z = Math.max(0, A.z - 8 - pw / 10);
      g.forEach(function (c) { c.z.kills += 1 + rng.int(3); });
      var gun = g.filter(function (c) { return c.weapon && c.weapon.loud; })[0];
      if (gun) { t += ctx.pick(HORDE.loud).replace(/\{area\}/g, A.name).replace(/\{w\}/g, gun.weapon.name); A.z = Math.min(100, A.z + 14); }
      why += '／' + who + 'の戦う力（武器・攻撃性）';
    } else {
      t += ctx.pick(HORDE.flee).replace(/\{who\}/g, who);
      why += '／逃げるしかなかった';
    }
    /* 誰かが咬まれる・倒れる */
    var risk = HK.clamp(A.z / 100 * 0.2 * (fight ? 0.8 : 1) * (part(ctx) === 3 ? 1.25 : 1), 0.03, 0.6);
    if (rng() < risk) {
      var v = HK.weighted(rng, g, function (c) { return 1.2 / (0.6 + luck(ctx, c) * 0.25 + (c.weapon ? c.weapon.pow : 0) * 0.04) * (c.hp < 50 ? 1.4 : 1) * (c.z.bitten ? 0.6 : 1); });
      var res = victim(ctx, g, v, A);
      t += res.text; why += '／' + res.why; mag = res.mag;
      res.with.forEach(function (x) { if (actors.indexOf(x) < 0) actors.push(x); });
    } else if (rng() < 0.3) {
      var hurt = rng.pick(g);
      hurt.hp -= 8 + rng.int(10); if (hurt.z.wound < 0) hurt.z.wound = ctx.stepIndex;
      var hurtDead = hurt.hp <= 0 ? hurt : null;
      t += ctx.t(rng.pick(['逃げる途中で、{a}はガラスで腕を深く切った。', '{a}は転んで、足首をひねった。傷口から血が止まらない。', '{a}の肩を、ゾンビの爪がかすめた。咬まれてはいない――はずだ。']), hurt);
      why += '／' + hurt.name + 'が負傷（化膿すると危ない）';
    }
    g.forEach(function (c) { if (c.alive) ctx.stress(c, 8); });
    ctx.act2({ actors: actors.filter(function (c) { return c; }), cat: fight ? 'combat' : 'escape', text: t, why: why, mag: mag });
    if (typeof hurtDead !== 'undefined' && hurtDead && hurtDead.alive) { ctx.kill(hurtDead, null, A.name + 'で負った傷が元で'); ctx.flush(); }
  }
  /* 群れに捕まったのが誰か、ほかの者がどう動いたか */
  var VIC = {
    bite: L('――{v}の悲鳴が上がった。腕に、くっきりと歯形が残っていた。|――{v}は足首を掴まれて転び、ふくらはぎに歯を立てられた。|――{v}の首元に、生ぬるい息がかかった。振り払ったときには、もう肩口を咬まれていた。'),
    scratch: L('――{v}は群れの中を抜けるとき、どこかを引っかかれた気がした。暗くて、よく見えなかった。'),
    eaten: L('――{v}は群れの中に引きずり込まれた。伸ばした手は、誰にも届かなかった。|――{v}は転んだ。起き上がる前に、群れが覆いかぶさった。'),
    save: L('――{s}は{v}の前に飛び出し、{v}の代わりに腕を咬まれた。「行け！」|――{s}は{v}を扉の内側へ突き飛ばし、自分は外に残った。扉の向こうで、{s}の叫び声が途切れた。'),
    shut: L('――{x}は、{v}がまだ外にいるのを見て、それでも扉を閉めて鍵をかけた。扉を叩く{v}の声が、すぐに悲鳴に変わった。|――{x}は{v}の手を振りほどいて、一人で非常口へ走った。'),
    bait: L('――{x}は、すぐ後ろにいた{v}の背中を、群れの方へ突き飛ばした。そのあいだに、{x}は逃げ切った。|――{x}は{v}の足を引っかけた。倒れた{v}に群れが群がる隙に、{x}は姿を消した。')
  };
  function victim(ctx, g, v, A) {
    var rng = ctx.rng, out = { text: '', why: '', mag: 28, with: [] };
    var others = g.filter(function (o) { return o !== v; });
    /* 関係ならではの動き（上司が残る・恩返し・信仰する側が盾になる・支配する側が囮を命じる・親族が引き戻す。zombie-bonds.js） */
    if (Z.tieVictim) { var tv = Z.tieVictim(ctx, g, v, A); if (tv) return tv; }
    /* 身代わり：Vを想う者が前に出る */
    var saver = others.filter(function (o) { return ctx.R(o, v).aff > 45 && o.tr.np > 0.5; }).sort(function (x, y) { return ctx.R(y, v).aff - ctx.R(x, v).aff; })[0];
    if (saver && rng() < 0.18 + saver.tr.np * 0.3) {
      var dies = rng() < 0.45;
      ctx.pair(saver, v).sacrifice = saver.i;
      ctx.mod(v, saver, { aff: 30, trust: 30, att: 8 });
      out.text = ctx.pick(VIC.save).replace(/\{s\}/g, saver.name).replace(/\{v\}/g, v.name);
      out.why = saver.name + 'の' + v.name + 'への想い（好意 ' + Math.round(ctx.R(saver, v).aff) + '）とNP';
      if (dies && /外に残った/.test(out.text)) ctx.kill(saver, null, v.name + 'をかばって、群れに呑まれた');
      else infect(ctx, saver, 'horde', true);
      out.mag = 40; return out;
    }
    /* 見捨てる・囮にする */
    var cold = others.filter(function (o) { return o.tr.cold + o.tr.aggr * 0.5 > 0.95 && ctx.R(o, v).aff < 25; })[0];
    if (cold && rng() < (0.22 + (cold.goal.id === 'chaos' ? 0.25 : 0) + ctx.R(cold, v).ten / 200) * HK.Dark.f(ctx, 'grudge')) {
      var bait = cold.tr.aggr > 0.55 && (ctx.R(cold, v).ten > 30 || cold.goal.id === 'chaos') && rng() < 0.55;
      out.text = ctx.pick(bait ? VIC.bait : VIC.shut).replace(/\{x\}/g, cold.name).replace(/\{v\}/g, v.name);
      out.why = cold.name + 'のドライさ（' + Math.round(cold.tr.cold * 100) + '）' + (bait ? 'と攻撃性。' + v.name + 'への緊張 ' + Math.round(ctx.R(cold, v).ten) : '');
      out.with = [cold];
      ctx.pair(cold, v)[bait ? 'bait' : 'abandoned'] = cold.i;
      others.forEach(function (o) { if (o !== cold) ctx.mod(o, cold, { trust: -25, ten: 20 }); });
      if (bait || rng() < 0.55) ctx.kill(v, bait ? cold : null, bait ? cold.name + 'にゾンビの群れへ突き飛ばされた' : cold.name + 'に扉の外へ締め出され、群れに呑まれた');
      else { infect(ctx, v, 'horde', true); v.z.leftBy = cold.i; }
      ctx.mod(v, cold, { aff: -40, trust: -60, ten: 40 });
      out.mag = 45; return out;
    }
    if (v.hp < 40 && rng() < 0.35 * HK.Dark.f(ctx, 'kill') || rng() < 0.06 * HK.Dark.f(ctx, 'kill')) {
      out.text = ctx.pick(VIC.eaten).replace(/\{v\}/g, v.name);
      out.why = v.name + 'の体力の消耗（' + Math.max(0, Math.round(v.hp)) + '）と運';
      ctx.kill(v, null, A.name + 'でゾンビの群れに呑まれた');
      out.mag = 40; return out;
    }
    var scratch = rng() < 0.22;
    out.text = ctx.pick(scratch ? VIC.scratch : VIC.bite).replace(/\{v\}/g, v.name);
    out.why = v.name + 'の運（' + luck(ctx, v) + '）';
    infect(ctx, v, 'horde', !scratch);
    return out;
  }
  Z.victim = victim;

  /* ======================= 感染と発症 ======================= */
  function infect(ctx, c, by, aware) {
    if (!c.alive || c.z.bitten) return;
    var speed = 1.7 - ctx.env.turn / 100 * 1.4;
    var dur = Math.max(1, Math.round((1.5 + ctx.stat(c, 'hp') * 0.7 + luck(ctx, c) * 0.6) * speed + ctx.rng() * 3));
    c.z.bitten = { at: ctx.stepIndex, by: by }; c.z.turnAt = ctx.stepIndex + dur; c.z.aware = !!aware; c.z.decided = false;
    ctx.zb.stats.bites++;
    ctx.stress(c, aware ? 30 : 5);
    if (Z.onInfect) Z.onInfect(ctx, c, by, aware);
  }
  Z.infect = infect;
  var BITE = {
    fever: L('{a}は、水を飲もうとして手が震えていることに気づいた。肩の小さな傷が、熱を持って脈打っていた。|{a}の耳の奥で、低い耳鳴りが止まらなかった。腕の引っかき傷を見て、すべてを理解した。|{a}は急に寒気がして、毛布を二枚重ねた。それでも震えは止まらなかった。足首の傷が、黒く変色していた。|{a}は、自分の爪の色がおかしいことに気づいた。思い当たる傷は、ひとつしかなかった。|{a}の額が、焼けるように熱い。袖をまくると、いつのまにか腕に小さな引っかき傷があり、まわりが黒ずんでいた。――あのときだ。|{a}は、指先の感覚がなくなっていることに気づいた。首筋の小さな傷が、脈打つように疼いていた。'),
    hide: L('{a}は咬み跡を、袖の上から押さえた。誰にも言わない。言えば、どうなるか分かっている。|{a}は傷口に包帯を巻き、「ガラスで切った」と言った。声は落ち着いていた。|{a}は咬み跡を隠したまま、いつもより少しだけ明るく振る舞った。'),
    tell: L('{a}は袖をまくって、咬み跡を見せた。「咬まれた。……ごめん」|{a}は皆の前で、静かに言った。「たぶん、もう長くない」'),
    leave: L('{a}は、眠っている{b}の顔をしばらく見つめてから、音を立てずに出ていった。置き手紙には「ありがとう」とだけあった。|「先に行ってて。すぐ追いつくから」――{a}は{b}にそう言って、反対の方向へ歩き出した。追いつくつもりは、なかった。|{a}は{b}に咬み跡を見せずに、「一人で行きたいところがある」とだけ言った。{b}は何も聞かずに頷いた。'),
    promise: L('{a}は{b}の手を取り、自分の額に当てさせた。「その時が来たら、お前がやってくれ。ほかの誰でもなく」|{a}は{b}に、自分の武器を握らせた。「私が私じゃなくなったら、迷わないで」――{b}は答えられなかった。'),
    suicide: L('{a}は、まだ自分が自分であるうちに、終わらせることにした。最後に書いたメモには、誰かの名前が一つだけあった。|{a}は皆から離れた部屋で、静かに目を閉じた。ゾンビになって誰かを襲うくらいなら――それが{a}の選んだ最後だった。'),
    suicide1: L('{a}は、まだ自分が自分であるうちに、終わらせることにした。最後に書いたメモには、誰かの名前が一つだけあった。|{a}はひとりきりの部屋で、静かに目を閉じた。ゾンビになって誰かを襲うくらいなら――それが{a}の選んだ最後だった。'),
    shinju: L('{a}は{b}に咬み跡を見せた。{b}は泣かなかった。「じゃあ、一緒に行こう」――二人は手を繋いだまま、屋上の縁に立った。|「お前のいない世界で生き延びて、何になる」{b}はそう言って、{a}の手を握った。朝、二人は寄り添ったまま冷たくなっていた。|{a}と{b}は、最後の夜を二人きりで過ごした。残った薬を分け合って飲み、互いの名前を呼びながら眠った。'),
    cut: L('{a}は噂を信じた。ベルトで二の腕をきつく縛り、{w}を振り上げた。|「切り落とせば助かるかもしれない」――{a}は歯を食いしばり、自分の腕に{w}を当てた。')
  };
  function infection(ctx) {
    var s = ctx.stepIndex;
    ctx.present().forEach(function (c) {
      var z = c.z;
      if (!z.bitten || !c.alive || c.out) return;
      if (z.dkAt !== z.bitten.at) { z.dkAt = z.bitten.at; if (HK.Dark.on(ctx) === 'mild' && ctx.rng() < 0.75) { z.bitten = null; z.turnAt = -1; if (z.aware) ctx.act2({ actors: [c], cat: 'solo', text: ctx.t('{a}の咬み跡は赤く腫れたが、熱は出なかった。……どうやら、感染はしなかったらしい。', c), why: '傷が浅かった（展開の重さ：穏やか）', mag: 18 }); return; } }   /* 展開の重さ（mood-dial.js） */
      if (!z.aware && s >= z.turnAt - 1) { z.aware = true; ctx.act2({ actors: [c], cat: 'solo', text: ctx.t(ctx.pick(BITE.fever), c), why: '気づかないうちに感染していた（引っかき傷）', mag: 20 }); }
      if (z.aware && !z.decided && s > z.bitten.at - 1) { z.decided = true; decide(ctx, c); }
      if (Z.shinjuCheck && c.alive && !c.out && Z.shinjuCheck(ctx, c)) return;
      if (c.alive && !c.out && s >= z.turnAt) turn(ctx, c);
    });
  }
  /* 咬まれたと知ったとき、どうするか */
  function decide(ctx, c) {
    var rng = ctx.rng, mates = here(ctx, c), z = c.z;
    var close = mates.slice().sort(function (x, y) { return (ctx.R(c, y).aff + ctx.R(y, c).aff) - (ctx.R(c, x).aff + ctx.R(x, c).aff); })[0];
    var lover = mates.filter(function (o) { var pf = ctx.pair(c, o); return (pf.couple || tieT(ctx, c, o) === 'lover' || (ctx.R(c, o).att > 55 && ctx.R(o, c).att > 55)) && ctx.R(o, c).aff > 55; })[0];
    var opts = [];
    if (mates.length) {
      opts.push(['hide', (1 - c.tr.honesty) * 0.9 + c.tr.cold * 0.3 + (c.goal.id === 'chaos' ? 0.4 : 0)]);
      opts.push(['tell', c.tr.honesty * 0.8 + (close ? ctx.R(c, close).trust / 120 : 0)]);
      opts.push(['leave', c.tr.np * 0.7 + c.tr.cp * 0.2 + (close ? ctx.R(c, close).aff / 200 : 0)]);
      if (close && ctx.R(c, close).trust > 40) opts.push(['promise', c.tr.cp * 0.4 + c.tr.a * 0.4 + ctx.R(c, close).trust / 150]);
      if (lover && (lover.tr.ac + lover.tr.jealous + lover.tr.np * 0.5 > 1.2 || ctx.R(lover, c).aff > 80)) opts.push(['shinju', 0.5 + lover.tr.ac * 0.4 + ctx.R(lover, c).aff / 200]);
    }
    opts.push(['suicide', (c.tr.cp * 0.3 + c.tr.a * 0.25 + c.tr.cold * 0.2) * (mates.length ? 0.45 : 0.75) + c.stress / 700]);
    if (z.know.cut && c.weapon && c.weapon.pow >= 3) opts.push(['cut', 0.4 + c.tr.impulse * 0.4]);
    if (z.know.drug && !z.drugDone) opts.push(['drug', 0.5 + c.tr.a * 0.3]);
    if (!mates.length) opts.push(['wait', 0.6 + c.tr.ac * 0.3]);
    if (Z.biteOpts) Z.biteOpts(ctx, c, opts, mates, close, lover);
    var pick = HK.weighted(rng, opts, function (o) { return Math.pow(Math.max(0.02, o[1]), 2); })[0];
    var LBL = { hide: '隠す', tell: '打ち明ける', leave: '仲間から離れる', promise: 'その時は頼むと託す', shinju: '恋人と心中する', suicide: 'ゾンビになる前に終わらせる', cut: '腕を切り落とす', drug: '病院の薬に賭ける', wait: '一人で待つ' };
    if (Z.BITE_LABEL) for (var lk in Z.BITE_LABEL) LBL[lk] = Z.BITE_LABEL[lk];
    var why = c.name + 'は咬まれたと知って「' + LBL[pick] + '」を選んだ（' + HK.egoType(c.eg).top + '優位の気質' + (lover && pick === 'shinju' ? '・' + lover.name + 'の想い' : '') + '）';
    switch (pick) {
      case 'hide':
        z.hiding = true;
        ctx.act2({ actors: [c], cat: 'solo', text: ctx.t(ctx.pick(BITE.hide), c), why: why, mag: 18 });
        break;
      case 'tell':
        ctx.act2({ actors: [c].concat(mates), cat: 'solo', text: ctx.t(ctx.pick(BITE.tell), c), why: why, mag: 22 });
        Z.groupReaction(ctx, c);
        break;
      case 'leave':
        z.alone = true;
        var na = Z.adj(z.area).sort(function (x, y) { return inArea(ctx, x).length - inArea(ctx, y).length; })[0];
        var lvr = lover && Z.loveLeave ? lover : null;
        ctx.act2({ actors: [c, lvr || close], cat: 'solo', fx: function () { ctx.mod(lvr || close, c, { aff: 8 }); }, text: lvr ? Z.loveLeave(ctx, c, lvr) : Z.leaveLetter && ctx.rng() < 0.8 ? Z.leaveLetter(ctx, c, close, mates) : ctx.t(ctx.pick(BITE.leave), c, close), why: why + (lvr ? '／恋人の' + lvr.name + 'には、何も言わずに' : ''), mag: 26 });
        z.area = na; z.path.push(na);
        break;
      case 'promise':
        ctx.pair(c, close).promise = c.i;
        ctx.act2({ actors: [c, close], cat: 'romance', fx: function () { ctx.mod2(c, close, { trust: 10, aff: 6 }, { trust: 10, aff: 8 }); ctx.stress(close, 20); }, text: ctx.t(ctx.pick(BITE.promise), c, close), why: why, mag: 26 });
        break;
      case 'shinju':
        ctx.pair(c, lover).shinju = true;
        ctx.act2({ actors: [c, lover], cat: 'romance', text: ctx.t(ctx.pick(BITE.shinju), c, lover), why: why, mag: 55 });
        ctx.kill(c, null, lover.name + 'と心中した（咬まれていた）');
        ctx.kill(lover, null, '咬まれた' + c.name + 'と心中した');
        break;
      case 'suicide':
        /* 残していく誰かを、一人にできない */
        var dep = mates.filter(function (o) { return ctx.R(c, o).aff > 55 && o.stress > 50 && ctx.R(o, c).aff > 40; })[0];
        if (dep && c.tr.ac + c.tr.np + c.tr.jealous > 1.4 && ctx.rng() < 0.4) {
          if (dep.tr.caution * 0.5 + dep.tr.aggr * 0.4 > ctx.rng()) {
            ctx.pair(c, dep).zmercyTry = c.i;
            ctx.act2({ actors: [c, dep], cat: 'betray', fx: function () { ctx.mod2(c, dep, { ten: 10 }, { ten: 30, trust: -35 }); }, text: ctx.t('{a}は咬み跡を押さえながら、{b}の首に手をかけた。「一人で残していけない」――{b}は{a}の手を振りほどいた。{a}は泣きながら、ひとりで部屋を出ていった。', c, dep), why: why + '／' + dep.name + 'を残していけない（AC・NP・執着）が、' + dep.name + 'は抵抗した', mag: 45 });
            ctx.kill(c, null, 'ゾンビになる前に、自ら命を絶った');
            break;
          }
          ctx.pair(c, dep).zmercy = c.i;
          ctx.act2({ actors: [c, dep], cat: 'death', text: ctx.t('{a}は{b}の寝顔を見下ろした。「一人で残していけない。ごめん」――朝、二人は並んで冷たくなっていた。', c, dep), why: why + '／' + dep.name + 'を一人にできない想い（好意 ' + Math.round(ctx.R(c, dep).aff) + '）', mag: 55 });
          ctx.kill(dep, c, '「一人で残していけない」と言う' + c.name + 'の手で');
          ctx.kill(c, null, dep.name + 'を道連れに、ゾンビになる前に命を絶った');
          break;
        }
        ctx.act2({ actors: [c], cat: 'solo', text: ctx.t(ctx.pick(mates.length ? BITE.suicide : BITE.suicide1), c), why: why, mag: 40 });
        ctx.kill(c, null, 'ゾンビになる前に、自ら命を絶った');
        break;
      case 'cut':
        var ok = ctx.rng() < HK.Dark.live(ctx, 0.3 + luck(ctx, c) * 0.04, 'kill') && ctx.stepIndex - z.bitten.at <= 2;
        c.hp -= 30; z.wound = ctx.stepIndex;
        var tc = ctx.t(ctx.pick(BITE.cut), c).replace(/\{w\}/g, wname(c));
        if (c.hp <= 0) { ctx.act2({ actors: [c], cat: 'solo', text: tc + '出血が止まらなかった。', why: why, mag: 40 }); ctx.kill(c, null, '咬まれた腕を自分で切り落とし、失血で'); break; }
        if (ok) { z.bitten = null; z.turnAt = -1; z.cut = true; }
        ctx.act2({ actors: [c], cat: 'solo', text: tc + (ok ? '……熱は、翌朝には引いていた。噂は本当だったのかもしれない。' : '痛みで気を失いかけながら、{a}は傷口を焼いた。それでも、熱は引かなかった。'.replace(/\{a\}/g, c.name)), why: why + '／噂「' + Z.RUMORS.filter(function (r) { return r.id === 'cut'; })[0].t + '」' + (ok ? '（間に合った）' : '（手遅れだった）'), mag: 38 });
        break;
      case 'drug':
        z.drug = true;
        ctx.act2({ actors: [c], cat: 'solo', text: ctx.t('{a}は、病院に発症を遅らせる薬があるという噂に賭けることにした。', c), why: why, mag: 12 });
        break;
      default:
        if (Z.biteRun && Z.biteRun(ctx, c, pick, why, mates, close, lover)) break;
        ctx.act2({ actors: [c], cat: 'solo', text: ctx.t(ctx.pick((Z.BITTEN_ALONE || ['{a}は一人きりの部屋で、咬み跡を眺めて夜を待った。']).map(function (x) { return x.replace(/\{area\}/g, an(ctx, z.area)); })), c), why: why, mag: 15 });
    }
  }
  /* ゾンビになる */
  function turn(ctx, c, quiet) {
    var zb = ctx.zb, rng = ctx.rng, z = c.z;
    var bestT = null, bv = 90;
    ctx.chars.forEach(function (o) {
      if (o === c || !o.alive || o.out) return;
      var v = ctx.R(c, o).aff + ctx.R(c, o).att + (['lover', 'parent', 'sibling'].indexOf(tieT(ctx, c, o)) >= 0 ? 40 : 0);
      if (v > bv) { bv = v; bestT = o; }
    });
    var bond = bestT && (c.tr.jealous > 0.5 || c.tr.ac > 0.6 || c.tr.np > 0.65 || bv > 140) && rng() < 0.75;
    c.alive = false; c.hp = 0; c.diedAt = ctx.stepIndex; c.fate = 'ゾンビ化'; c.deathLabel = ctx.label;
    var src = z.bitten && typeof z.bitten.by === 'number' ? ctx.chars[z.bitten.by].name + 'に咬まれた傷から' : z.bitten && z.bitten.npc ? z.bitten.npc + 'に咬まれた傷から' : '咬まれた傷から';
    c.deathHow = src + 'ゾンビになった';
    c.fateNote = ctx.label + '、' + an(ctx, z.area) + 'で' + c.deathHow + (bond ? '。' + bestT.name + 'を探してさまよっている' : '');
    zb.stats.turned++;
    var zp = { i: c.i, area: z.area, type: bond ? 'bond' : 'wild', target: bond ? bestT.i : null, down: false, at: ctx.stepIndex };
    zb.zpc.push(zp);
    ctx.pending = ctx.pending || [];
    ctx.pending.push({ kind: 'death', cat: 'death', actors: [c], text: c.name + '　ゾンビ化　―― ' + an(ctx, z.area) + 'で、' + (bond ? bestT.name + 'の名前を呼ぶような呻き声を上げて' : '人の言葉をなくして'), mag: 60 });
    ctx.chars.forEach(function (o) { if (o.alive && o !== c && ctx.R(o, c).aff > 35) { ctx.stress(o, ctx.R(o, c).aff * 0.4); o.flags.grief = c.i; } });
    ctx.flush();
    var mates = inArea(ctx, z.area);
    if (mates.length && !quiet) {
      var t = z.hiding ? ctx.t('隠していた咬み跡が、{a}の体を内側から変えた。{a}の目から光が消え、そばにいた仲間の方へ、ぎこちなく首を回した。', c)
        : ctx.t(ctx.pick(['{a}の呼吸が止まった。数秒後、{a}の指がぴくりと動いた。目を開けた{a}は、もう{a}ではなかった。', '{a}は苦しげに咳き込み、それから動かなくなった。次に顔を上げたとき、{a}の口からこぼれたのは、言葉ではなく呻き声だった。']), c);
      ctx.act2({ actors: [c].concat(mates), cat: 'death', text: t, why: '発症（咬まれてから ' + (ctx.stepIndex - (z.bitten ? z.bitten.at : ctx.stepIndex)) + ' 区切り。体力' + ctx.stat(c, 'hp') + '・運' + luck(ctx, c) + '）' + (bond ? '／' + bestT.name + 'への愛着が強く、その人だけを追うゾンビになった' : ''), mag: 30 });
      zombieAttack(ctx, zp, true);
    }
  }
  Z.turn = turn;

  /* ======================= ゾンビになった住人 ======================= */
  var ZA = {
    put: L('{d}は、{z}だったものの前に立った。「……ごめん」――{w}が振り下ろされ、{z}はもう二度と動かなかった。|{d}は{z}の目を見ないようにして、引き金を引いた。銃声のあと、{d}はしばらくその場から動けなかった。|{d}は{z}を抱きしめるようにして押さえ込み、自分の手で終わらせた。{d}の肩は、ずっと震えていた。'),
    promise: L('{d}は約束を守った。{z}が目を開ける前に、{w}を振り下ろした。「その時は、お前が」――あの声が、耳から離れなかった。|{d}は、{z}がゾンビとして立ち上がるのを待たなかった。それが、{z}との最後の約束だった。'),
    hesitate: L('{v}は{z}を見て、動けなくなった。「……{z}？　分かるか、私だよ」――返事の代わりに、{z}が{v}に飛びかかった。|{v}は{z}の顔に、まだ{z}の面影を探してしまった。その一瞬の迷いで、腕を掴まれた。'),
    bite: L('{z}の歯が、{v}の腕に食い込んだ。|{z}は{v}に覆いかぶさり、首筋に咬みついた。|{v}は{z}を振りほどいたが、手首にはくっきりと歯形が残っていた。'),
    eat: L('{z}は{v}に飛びかかり、床に引きずり倒した。助けに入れる者は、誰もいなかった。|{z}の重みの下で、{v}は最後まで{z}の名前を呼んでいた。'),
    flee: L('{v}は{z}の腕をすり抜け、扉の向こうへ逃げ込んだ。扉を叩く音が、朝まで続いた。|{v}は泣きながら走った。後ろから聞こえる足音が、{z}のものだと分かっていた。'),
    seek: L('{z}は、{t}のいる方角へ、迷わずに歩き続けていた。|{z}は{t}がかつて通った道を、なぞるように歩いていた。'),
    see: L('{v}は通りの向こうに、{z}の姿を見つけた。服も髪型も、最後に会ったときのままだった。顔だけが、違っていた。|{v}は、ガラス越しに{z}と目が合った。{z}は、{v}を見ても何も感じていないようだった。')
  };
  function zfill(t, m) { return t.replace(/\{(\w+)\}/g, function (x, k) { return m[k] != null ? m[k] : x; }); }
  function zombiesAct(ctx) {
    var rng = ctx.rng, zb = ctx.zb;
    zb.zpc.forEach(function (zp) {
      if (zp.down || zp.at === ctx.stepIndex) return;
      var c = ctx.chars[zp.i], T = zp.target != null ? ctx.chars[zp.target] : null;
      if (zp.type === 'bond' && T && T.alive && !T.out) {
        if (T.z.area !== zp.area) {
          zp.area = Z.step(zp.area, T.z.area);
          if (rng() < 0.25) ctx.act2({ actors: [c, T], cat: 'phase', text: zfill(ctx.pick(ZA.seek), { z: c.name, t: T.name }), why: c.name + 'はゾンビになっても、' + T.name + 'への愛着だけが残っていた' });
        }
        if (T.z.area === zp.area && rng() < 0.75) return zombieAttack(ctx, zp, false);
      } else {
        if (zp.type === 'bond') zp.type = 'wild';
        if (Z.pairMove && Z.pairMove(ctx, zp)) { /* 並んでさまよう相手についていく */ }
        else if (rng() < 0.45) zp.area = rng.pick(Z.adj(zp.area));
        if (inArea(ctx, zp.area).length && rng() < 0.45) return zombieAttack(ctx, zp, false);
      }
      /* 変わり果てた姿を見かける */
      var v = inArea(ctx, zp.area).filter(function (o) { return ctx.R(o, c).aff > 30; })[0];
      if (v && rng() < 0.3) { ctx.stress(v, 14); ctx.act2({ actors: [v, c], cat: 'solo', text: (Z.pairSee && Z.pairSee(ctx, v, c, zp)) || (Z.loverSee && Z.loverSee(ctx, v, c)) || zfill(ctx.pick(ZA.see), { v: v.name, z: c.name }), why: v.name + 'の' + c.name + 'への好意（' + Math.round(ctx.R(v, c).aff) + '）', mag: 18 }); }
    });
  }
  function zombieAttack(ctx, zp, first) {
    var rng = ctx.rng, zb = ctx.zb, c = ctx.chars[zp.i];
    var P = inArea(ctx, zp.area);
    if (!P.length) return;
    var T = zp.target != null && P.indexOf(ctx.chars[zp.target]) >= 0 ? ctx.chars[zp.target] : HK.weighted(rng, P, function (o) { return 1 + ctx.R(c, o).aff / 60; });
    /* 恋人がその場にいれば、恋人の前に現れる。恋人の気質で態度が変わる */
    if (Z.loverZombie && !zp.loveDone) {
      var lv0 = P.filter(function (o) { return Z.isLover(ctx, o, c); })[0];
      if (lv0) { T = lv0; if (Z.loverZombie(ctx, zp, T, P)) return; }
    }
    if (Z.crushZombie && Z.crushZombie(ctx, zp, P)) return;
    /* とどめを刺す者 */
    var prom = P.filter(function (o) { return ctx.pair(o, c).promise === c.i; })[0];
    var d = prom || ctx.most(P, function (o) { return o.tr.cp * 0.4 + o.tr.a * 0.3 + o.tr.cold * 0.35 + o.tr.aggr * 0.2 + (o.weapon ? o.weapon.pow * 0.05 : 0) - Math.max(0, ctx.R(o, c).aff) / 110; });
    var will = d.tr.cp * 0.4 + d.tr.a * 0.3 + d.tr.cold * 0.35 + d.tr.aggr * 0.2 + (d.weapon ? d.weapon.pow * 0.05 : 0) - Math.max(0, ctx.R(d, c).aff) / 110 + (prom ? 0.45 : 0);
    var actors = [c].concat(P);
    if (will > 0.42 + rng() * 0.5 && !(d === T && first && rng() < 0.4)) {
      zp.down = true; zb.stats.putdown++;
      ctx.pair(d, c).putdown = d.i;
      var t = zfill(ctx.pick(prom ? ZA.promise : ZA.put), { d: d.name, z: c.name, w: wname(d) });
      ctx.stress(d, 12 + Math.max(0, ctx.R(d, c).aff) * 0.4);
      c.fateNote += '。最後は' + d.name + 'の手で眠らされた';
      ctx.act2({ actors: actors, cat: 'combat', text: t, why: d.name + 'の決断（CP・A・ドライさ' + (prom ? '・約束' : '') + '）／' + c.name + 'への好意 ' + Math.round(ctx.R(d, c).aff), mag: 40 });
      return;
    }
    var hes = ctx.R(T, c).aff > 45, t2 = hes ? zfill(ctx.pick(ZA.hesitate), { v: T.name, z: c.name }) : '';
    var r = rng() - (hes ? 0.15 : 0) + (T.weapon ? T.weapon.pow * 0.02 : 0) + luck(ctx, T) * 0.03;
    var why = (zp.type === 'bond' && zp.target === T.i ? 'ゾンビになった' + c.name + 'は、' + T.name + 'だけを追ってきた' : 'ゾンビになった' + c.name + 'は、目の前にいた' + T.name + 'を襲った') + (hes ? '／' + T.name + 'の迷い（好意 ' + Math.round(ctx.R(T, c).aff) + '）' : '');
    if (r < 0.22 && Z.riseTogether && rng() < Z.riseChance(ctx, zp, T)) {
      /* 喰われるかわりに、その場でゾンビになって一緒にさまよう */
      ctx.pair(T, c).zbite = c.i;
      Z.riseTogether(ctx, zp, T, { pre: t2 });
    } else if (r < 0.22) {
      ctx.pair(T, c).zkill = c.i;
      ctx.act2({ actors: actors, cat: 'death', text: t2 + zfill(ctx.pick(ZA.eat), { v: T.name, z: c.name }), why: why, mag: 50 });
      ctx.kill(T, c, 'ゾンビになった' + c.name + 'に喰い殺された');
    } else if (r < 0.62) {
      ctx.pair(T, c).zbite = c.i;
      ctx.act2({ actors: actors, cat: 'combat', text: t2 + zfill(ctx.pick(ZA.bite), { v: T.name, z: c.name }), why: why, mag: 40 });
      infect(ctx, T, c.i, true);
    } else {
      var fi = Z.fleeInfect ? Z.fleeInfect(ctx, zp, T, hes) : '';
      ctx.act2({ actors: actors, cat: 'escape', text: t2 + zfill(ctx.pick(ZA.flee), { v: T.name, z: c.name }) + fi, why: why + '／' + T.name + 'の運と武器' + (fi ? '／逃げ切ったが、感染していた' : ''), mag: fi ? 32 : 24 });
      ctx.stress(T, 15);
      if (zp.type === 'bond' && T.alive) { var na = rng.pick(Z.adj(T.z.area)); T.z.area = na; T.z.path.push(na); }
    }
  }
  Z.zombieAttack = zombieAttack;

  /* ======================= 傷・飢え・絶望 ======================= */
  function wounds(ctx) {
    ctx.present().forEach(function (c) {
      var z = c.z;
      if (z.wound < 0 || z.bitten) return;
      var age = ctx.stepIndex - z.wound;
      if (age >= 2 && !z.fever && ctx.rng() < 0.1 + ctx.stat(c, 'hp') * 0.03) { z.wound = -1; return; }
      if (age >= 4 && ctx.rng() < 0.3 * HK.Dark.f(ctx, 'kill')) {
        c.hp -= 4 + ctx.rng.int(6); ctx.stress(c, 5);
        if (!z.fever) { z.fever = true; ctx.act2({ actors: [c], cat: 'solo', text: ctx.t(ctx.pick(Z.FESTER || ['{a}の傷口が赤く腫れ、熱を持ち始めた。']), c), why: '負傷から ' + age + ' 区切り、手当てができていない', mag: 15 }); }
        if (c.hp <= 0) ctx.kill(c, null, '傷口からの感染症で、高熱にうなされたまま');
      }
    });
  }
  function hunger(ctx) {
    var rng = ctx.rng;
    ctx.present().forEach(function (c) {
      var z = c.z;
      if (z.food > 0) { z.food--; z.hunger = Math.max(0, z.hunger - 1); return; }
      z.hunger++;
      c.hp -= (5 + z.hunger * 5 - ctx.stat(c, 'hp')) * HK.Dark.f(ctx, 'wipe');
      ctx.stress(c, 6 + z.hunger * 3);
      if (z.hunger === 2 || (z.hunger >= 3 && rng() < 0.4)) ctx.act2({ actors: [c], cat: 'solo', text: ctx.t(rng.pick(Z.HUNGER || ['{a}の手持ちの食料は、もう何もない。水だけで、また一日が終わった。']), c), why: '食料が尽きて ' + z.hunger + ' 日目', mag: 10 });
      if (c.hp <= 0) ctx.kill(c, null, '飢えと渇きで倒れた');
    });
  }
  var DESP = {
    stop: L('{a}が窓枠に足をかけたとき、{b}が後ろから抱きついて引きずり下ろした。「勝手に終わるな」――{a}は{b}の腕の中で、声を上げて泣いた。|{b}は、{a}が手にしていた薬の瓶を取り上げた。何も言わずに、ただ隣に座った。'),
    alone: L('{a}は、もう走れなかった。誰もいない{area}の片隅で、{a}は自分で自分を終わらせた。|{a}は最後に、空を見上げた。どこにも、ヘリの音はしなかった。|{a}の残したメモには、「ごめん、もう無理だった」とだけ書かれていた。'),
    group: L('{a}は、皆が眠っている間に部屋を抜け出した。朝、{a}は非常階段の踊り場で見つかった。もう息はなかった。|{a}は見張りの交代の時間になっても、戻ってこなかった。屋上の柵の外に、{a}の靴がそろえて置いてあった。'),
    take: L('「一人で置いていけない」――{a}は眠っている{b}の上に、そっと覆いかぶさった。そして、自分も後を追った。|{a}は{b}の手を握り、「先に行って。すぐ行くから」と言った。{b}が目を閉じたあと、{a}は約束を守った。'),
    fail: L('{a}は{b}を手にかけようとした。{b}は目を覚まし、{a}を突き飛ばした。「何するんだよ！」――{a}は自分の手を見つめて、崩れ落ちた。')
  };
  function despair(ctx) {
    var rng = ctx.rng;
    ctx.present().forEach(function (c) {
      if (!c.alive || c.out) return;
      var mates = here(ctx, c), grief = c.flags.grief != null;
      var risk = (c.stress - 76) / 100 + (c.z.bitten && c.z.aware ? 0.06 : 0) + (grief ? 0.05 : 0) + (c.z.family && c.z.family.heard ? 0.04 : 0) - c.tr.fc * 0.06 - c.tr.np * 0.03 - c.tr.cp * 0.03;
      if (!mates.length) risk *= 1.4;
      if (risk <= 0 || rng() > risk * 0.35 * HK.Dark.f(ctx, 'kill')) return;
      /* 一人では置いていけない */
      var dep = mates.filter(function (o) { return ctx.R(c, o).aff > 45 && (o.stress > 40 || (o.z.bitten && o.z.aware) || tieT(ctx, c, o) === 'parent' || tieT(ctx, c, o) === 'lover'); })[0];
      if (dep && c.tr.ac + c.tr.np + c.tr.jealous > 1.2 && rng() < 0.7) {
        var resist = dep.tr.caution * 0.5 + dep.tr.aggr * 0.4 + (dep.stress < 75 ? 0.2 : 0) > rng();
        if (resist) {
          ctx.pair(c, dep).zmercyTry = c.i;
          ctx.act2({ actors: [c, dep], cat: 'betray', fx: function () { ctx.mod2(c, dep, { ten: 10 }, { ten: 35, trust: -40 }); }, text: ctx.t(ctx.pick(DESP.fail), c, dep), why: c.name + 'の「一人では置いていけない」（AC・NP）／' + dep.name + 'が抵抗した', mag: 38 });
          c.stress = Math.min(100, c.stress + 10);
          return;
        }
        ctx.pair(c, dep).zmercy = c.i;
        ctx.act2({ actors: [c, dep], cat: 'death', text: ctx.t(ctx.pick(DESP.take), c, dep), why: c.name + 'の絶望（焦り ' + Math.round(c.stress) + '）と、' + dep.name + 'を一人にできない想い（好意 ' + Math.round(ctx.R(c, dep).aff) + '）', mag: 55 });
        ctx.kill(dep, c, '「一人では置いていけない」と言う' + c.name + 'の手で');
        ctx.kill(c, null, dep.name + 'を道連れに、自ら命を絶った');
        return;
      }
      /* 誰かが止める */
      var st = mates.filter(function (o) { return ctx.R(o, c).aff > 30; }).sort(function (x, y) { return ctx.R(y, c).aff - ctx.R(x, c).aff; })[0];
      if (st && rng() < HK.Dark.live(ctx, st.tr.np * 0.6 + ctx.R(st, c).aff / 150, 'kill')) {
        c.stress = Math.max(0, c.stress - 35);
        ctx.act2({ actors: [c, st], cat: 'help', fx: function () { ctx.mod2(c, st, { aff: 12, trust: 15 }, { aff: 8, trust: 6 }); }, text: ctx.t(ctx.pick(DESP.stop), c, st), why: c.name + 'の追い詰められ方（焦り ' + Math.round(c.stress + 35) + '）／' + st.name + 'が止めた（好意 ' + Math.round(ctx.R(st, c).aff) + '・NP）', mag: 35 });
        return;
      }
      ctx.act2({ actors: [c].concat(mates), cat: 'death', text: ctx.t(ctx.pick(mates.length ? DESP.group : DESP.alone), c).replace(/\{area\}/g, an(ctx, c.z.area)), why: c.name + 'の追い詰められ方（焦り ' + Math.round(c.stress) + '）' + (grief ? '・大切な人を失った' : '') + (mates.length ? '' : '・ひとりきり'), mag: 45 });
      ctx.kill(c, null, '絶望の果てに、自ら命を絶った');
    });
  }

  /* ======================= 最終日 ======================= */
  function finale(ctx) {
    var zb = ctx.zb, env = ctx.env, P = ctx.present();
    if (env.end === 'heli') {
      var at = zb.heli, got = P.filter(function (c) { return c.z.area === at && c.z.keep == null; });
      ctx.say({ text: '最終日の夜明け前。ローター音が、' + an(ctx, at) + 'の上空に近づいてきた。' });
      if (got.length) {
        got.forEach(function (c) { c.out = true; c.fate = '救助された'; c.fateNote = an(ctx, at) + 'から救助ヘリで街を出た'; });
        ctx.say({ kind: 'event', cat: 'escape', actors: got, text: names(got) + 'は、' + an(ctx, at) + 'に降りてきたヘリに飛び乗った。眼下の街が、ゆっくりと遠ざかっていった。', why: '救助ヘリの着陸地点（' + an(ctx, at) + '）にいた', mag: 50 });
      }
      var miss = ctx.present();
      if (miss.length) ctx.say({ kind: 'event', cat: 'phase', actors: miss, text: names(miss) + 'は、遠ざかるローター音を、' + miss.map(function (c) { return an(ctx, c.z.area); }).filter(function (v, i, a) { return a.indexOf(v) === i; }).join('や') + 'で聞いていた。' + (miss.some(function (c) { return c.z.heliAt != null && c.z.heliAt !== at; }) ? '信じていた噂の場所は、違っていた。' : ''), why: '救助ヘリの場所を知らなかった／デマを信じていた', mag: 25 });
    } else if (env.end === 'burn') {
      ctx.say({ text: '最終日の夜。空が白く光った。' });
      P.forEach(function (c) { ctx.kill(c, null, '街ごと焼き払われた'); });
      ctx.flush();
    }
    ctx.present().forEach(function (c) { c.fate = '生き延びた'; c.fateNote = env.days + '日目の夜明けを、' + an(ctx, c.z.area) + 'で迎えた' + (c.z.keep != null ? '。閉じ込めた' + ctx.chars[c.z.keep].name + 'のそばで、これからも暮らしていく' : ''); });
  }
  function finish(ctx) {
    var zb = ctx.zb;
    ctx.chars.forEach(function (c) { if (c.alive && !c.out && c.fate !== '生き延びた') { c.fate = '生き延びた'; } });
    var notes = [];
    notes.push('安全な場所の真相：' + (zb.safeOrig != null && zb.safeOrig >= 0 ? an(ctx, zb.safeOrig) + 'は本当に安全だった' + (zb.fallAt >= 0 && zb.fallAt <= ctx.stepIndex ? '（' + Math.floor(zb.fallAt / 4 + 1) + '日目に落ちた）' : '') : '街に安全な場所はなかった'));
    if (ctx.env.end === 'heli') notes.push('救助ヘリの着陸地点：' + an(ctx, zb.heli));
    ctx.flags.endNotes = notes;
    var esc = ctx.chars.filter(function (c) { return c.out; });
    ctx.flags.outcome = esc.length + ctx.present().length ? '生存 ' + (esc.length + ctx.present().length) + '/' + ctx.chars.length + '人' : '全滅';
    ctx.flags.zombie = {
      map: { names: zb.A.map(function (A) { return A.name; }), z0: zb.z0 || [], z1: zb.A.map(function (A) { return Math.round(A.z); }), shelter: zb.A.map(function (A) { return !!A.def.shelter; }), exit: zb.A.map(function (A) { return !!A.def.exit; }), safe: zb.safeOrig, fell: zb.fallAt >= 0 && zb.fallAt <= ctx.stepIndex, heli: ctx.env.end === 'heli' ? zb.heli : -1,
        chars: ctx.chars.map(function (c) { var zp = zb.zpc.filter(function (z) { return z.i === c.i; })[0]; return { s: c.z.start, l: zp && !zp.down ? zp.area : c.z.area, f: c.fate || '' }; }) },
      reg: zb.reg, stats: zb.stats, days: ctx.env.days,
      zpc: zb.zpc.map(function (z) { return { i: z.i, type: z.type, target: z.target, down: z.down, area: an(ctx, z.area) }; }),
      npcs: zb.npcs.map(function (n) { return { name: n.name, type: n.type, alive: n.alive, note: n.note || '' }; }),
      chars: ctx.chars.map(function (c) { return { start: an(ctx, c.z.start), last: an(ctx, c.z.area), weapon: wname(c), kills: c.z.kills, bitten: !!c.z.bitten, family: c.z.family ? (c.z.family.pc != null ? null : c.z.family.rel + '：' + ({ ok: c.z.family.found ? '合流できた' : '最後に聞いた限りでは無事', zombie: c.z.family.found ? 'ゾンビになっていた' : c.z.family.heard ? '最後の連絡は悪い知らせだった' : '安否不明', dead: c.z.family.found ? '亡くなっていた' : c.z.family.heard ? '最後の連絡は悪い知らせだった' : '安否不明' }[c.z.family.state] || '')) : null }; })
    };
  }
  var setup0 = setup;
  setup = function (ctx) { setup0(ctx); ctx.zb.safeOrig = ctx.zb.safe; ctx.zb.z0 = ctx.zb.A.map(function (A) { return Math.round(A.z); }); };
  scen.setup = function (ctx) { setup(ctx); };
})();
