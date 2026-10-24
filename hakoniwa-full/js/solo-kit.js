/* 箱庭診断: 一人用R18箱庭の共通部品（快楽・理性・堕ち度・絶頂・記録）
   エロトラップダンジョンの数値の考え方と、態度（DG.PERSONA）の台詞を共有する */
(function () {
  'use strict';
  var HK = window.HK, DG = HK.DG;
  var clamp = HK.clamp;
  var K = HK.SoloKit = {};

  K.hero = function (S, src, pc) {
    var rng = S.rng, scen = S.scen;
    var h = {
      i: 0, name: src.name, eg: src.eg, memo: src.memo || '', tr: HK.traits(src.eg),
      stats: {}, hp: 100, pleasure: 0, sens: 1, corrupt: 0, climax: 0, dev: {}, curses: [], items: [], cloth: 4,
      gender: src.gender || '', likes: src.likes || '', tone: src.tone || '', fp: src.fp || '', pos: src.pos || ''
    };
    if (HK.charFlags) HK.charFlags(src, h, scen && scen.id);
    /* いちばん強い因子（同点なら、この回の中で一つに決める。core.js の HK.egoType） */
    h.top = HK.egoType(src.eg).top;
    h.reason = clamp(55 + h.eg.A * 1.1 + h.eg.CP * 0.9, 40, 100);
    h.persona = HK.personaOf(h);
    (scen.stats || []).forEach(function (s) { var v = pc.stats && pc.stats[s.id]; h.stats[s.id] = v == null || v === 'random' ? 1 + rng.int(5) : +v; });
    function resolve(list, p) {
      if (!list || !list.length) return { id: '', label: '' };
      if (p && p !== 'auto') for (var k = 0; k < list.length; k++) if (list[k].id === p) return list[k];
      return HK.weighted(rng, list, function (o) { return Math.pow(Math.max(0.02, o.fit(h.tr)), 3); });
    }
    h.action = resolve(scen.actions, pc.action); h.goal = resolve(scen.goals, pc.goal);
    h.autoAction = !pc.action || pc.action === 'auto'; h.autoGoal = !pc.goal || pc.goal === 'auto';
    return h;
  };

  K.state = function (input, scenId) {
    var scen = HK.SCENARIOS[scenId], env = {};
    scen.env.forEach(function (e) { env[e.id] = input.env && input.env[e.id] != null ? input.env[e.id] : e.def; });
    var S = { scen: scen, rng: HK.rng(input.seed), env: env, log: [], hist: [], turns: [], recent: [], flags: {}, cnt: {}, q: [], step: 0, label: '' };
    S.h = K.hero(S, input.chars[0], (input.perChar && input.perChar[0]) || {});
    S.party = [S.h];
    return S;
  };

  K.pick = function (S, arr) {
    var r = S.recent, t = arr[S.rng.int(arr.length)];
    for (var i = 0; i < 6 && r.indexOf(t) >= 0; i++) t = arr[S.rng.int(arr.length)];
    r.push(t); if (r.length > 24) r.shift();
    return t;
  };
  K.fmt = function (S, str, vars) {
    var v = vars || {};
    return String(str).replace(/\{([a-z]+)\}/g, function (m, k) {
      if (k === 'a') return S.h.name;
      if (v[k] != null) return v[k];
      if (S.vars && S.vars[k] != null) return S.vars[k];
      return m;
    });
  };
  K.say = function (S, o) {
    o.n = S.log.length; o.room = S.step; o.floor = 0;
    o.v = { r: Math.round(Math.max(0, S.h.reason)), p: Math.round(S.h.pleasure), c: Math.round(S.h.corrupt) };
    S.log.push(o);
    return o;
  };
  K.step = function (S, label) { S.label = label; return K.say(S, { kind: 'step', text: label }); };
  K.key = function (S, o, why) { o.key = true; S.turns.push({ n: o.n, why: why }); };
  K.stage = function (h) { return h.corrupt < 20 ? 0 : h.corrupt < 40 ? 1 : h.corrupt < 60 ? 2 : h.corrupt < 80 ? 3 : 4; };
  K.will = function (h) { return clamp(h.tr.cp * 0.35 + h.tr.a * 0.25 + h.reason / 100 * 0.4, 0, 1); };
  K.tail = function (S, p, noBody) {
    var h = S.h, sg = K.stage(h);
    if (S.rng() > (p == null ? 0.45 : p)) return '';
    if (!noBody && DG.ENDURE && sg <= 2 && S.rng() < 0.4) return ' ' + K.fmt(S, K.pick(S, DG.ENDURE[h.persona]));
    return ' ' + K.fmt(S, K.pick(S, DG.TAILS[h.persona][sg]));
  };
  K.moan = function (S) { return '「' + K.pick(S, DG.MOAN[S.h.persona]) + '」'; };

  /* 刺激：power は罠の強さに相当。opt: {part, mind, shame, hidden(記録しない絶頂), mult} 戻り値：増えた快感 */
  K.stim = function (S, power, opt) {
    opt = opt || {};
    var h = S.h, rng = S.rng;
    var part = opt.part || 'all';
    var dev = part === 'all' ? 0 : h.dev[part] || 0;
    /* 刺激の強さ：マッサージの「施術の過激さ」（harsh）・感覚遮断穴の「向こう側の過激さ」（wild）。ほかは今までどおり lewd */
    var lew = S.env.harsh != null ? S.env.harsh : S.env.wild != null ? S.env.wild : S.env.lewd != null ? S.env.lewd : 55;
    var gain = power * (0.55 + lew / 100 * 0.9) * h.sens * (1 + dev * 0.13) * (opt.mult || 1) * rng.range(0.8, 1.2);
    var w = K.will(h);
    gain *= 1.12 - w * 0.42;
    if (opt.mind) gain *= 1.15 - h.tr.cold * 0.35;
    if (opt.shame) h.reason -= 2 + h.tr.ac * 4;
    h.pleasure += gain;
    h.reason -= gain * (0.13 + (opt.mind ? 0.08 : 0)) * (1 - w * 0.45) * (S.k || 1);
    if (part !== 'all') h.dev[part] = Math.min(10, (h.dev[part] || 0) + 1);
    else DG.PART_ORDER.forEach(function (k) { h.dev[k] = Math.min(10, (h.dev[k] || 0) + 0.25); });
    var out = [];
    while (h.pleasure >= 100 && out.length < 4) out.push(K.climax(S, { silent: opt.defer || opt.silent }));
    return { gain: gain, climaxes: out };
  };
  K.climax = function (S, opt) {
    var h = S.h, rng = S.rng;
    h.climax++;
    var w = K.will(h);
    var gainC = 4.5 + h.climax * 1.25 + h.tr.fc * 4 + h.tr.ac * 3 - h.tr.cp * 3;
    h.corrupt += Math.max(3, gainC * 1.4) * (S.k || 1);
    h.reason -= (4 + h.climax) * (1 - w * 0.4) * (S.k || 1);
    h.sens += 0.05;
    h.pleasure = 15 + rng.int(20);
    var text = (rng() < 0.5 ? K.moan(S) : '') + K.fmt(S, K.pick(S, DG.CLIMAX[h.persona][K.stage(h)]));
    if (opt && opt.silent) return text;
    var o = K.say(S, { kind: 'climax', tag: '絶頂', text: text, why: h.climax === 1 ? '初めての絶頂' : h.climax + '回目' });
    if (h.climax === 1) K.key(S, o, '最初の絶頂');
    return text;
  };
  /* 後回しにした絶頂を、原因の文のあとに並べる */
  K.logClimax = function (S, list) {
    list.forEach(function (text) {
      var o = K.say(S, { kind: 'climax', tag: '絶頂', text: text, why: S.h.climax === 1 ? '初めての絶頂' : '' });
      if (S.h.climax === 1 && !S.flags.firstKey) { S.flags.firstKey = true; K.key(S, o, '最初の絶頂'); }
    });
  };
  K.settle = function (S) {
    var h = S.h;
    h.reason = clamp(h.reason, -5, 100);
    if (h.reason < 50) h.corrupt += (50 - h.reason) / 8 * (S.k || 1);
    if (h.pleasure > 70) h.corrupt += 1.2 * (S.k || 1);
    h.corrupt = clamp(h.corrupt, 0, 100); h.pleasure = clamp(h.pleasure, 0, 100); h.sens = clamp(h.sens, 0.6, 3.5);
    if (h.reason <= 0) h.corrupt = 100;
    if (h.corrupt >= 100) { h.fallen = true; return true; }
    return false;
  };
  K.snap = function (S, extra) {
    var h = S.h, o = { n: S.log.length, f: 0, r: Math.round(Math.max(0, h.reason)), p: Math.round(h.pleasure), c: Math.round(h.corrupt), hp: Math.round(h.hp) };
    if (extra) for (var k in extra) o[k] = extra[k];
    S.hist.push(o);
  };
  K.finish = function (S, input, E, advice, extra) {
    var h = S.h;
    var hero = {
      i: 0, name: h.name, eg: h.eg, memo: h.memo, top: h.top, persona: h.persona, tone: h.tone, stats: h.stats, tr: h.tr,
      action: h.action.label, goal: h.goal.label, goalId: h.goal.id, autoAction: h.autoAction, autoGoal: h.autoGoal,
      reason: Math.max(0, Math.round(h.reason)), pleasure: Math.round(h.pleasure), corrupt: Math.round(h.corrupt), hp: Math.round(h.hp),
      sens: Math.round(h.sens * 100) / 100, climax: h.climax, dev: h.dev, cloth: h.cloth, curses: [], items: [], fate: E.kind === 'over' ? '陥落' : '', fallTitle: '', fallText: ''
    };
    var res = {
      solo: true, scenId: S.scen.id, seed: input.seed, env: S.env, input: input, hero: hero, heroes: [hero], party: false, noGear: true,
      log: S.log, hist: S.hist, turns: S.turns, cnt: S.cnt, ending: E, advice: advice, stepCount: S.hist.length - 1, mids: [], boss: '', themeLabel: S.scen.name, reached: 1, floors: 1
    };
    if (extra) for (var k in extra) res[k] = extra[k];
    res.outcome = E.title;
    res.summary = h.name + '：' + E.title;
    res.chars = [{ name: h.name, i: 0 }];
    return res;
  };
})();
