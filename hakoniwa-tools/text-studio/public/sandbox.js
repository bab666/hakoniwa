/* 箱庭テキスト工房：試し読み用のページ（iframe の中）で動く部品。window.STUDIO から呼ぶ
   ・info()       … 箱庭・口調・態度の一覧
   ・events(id)   … 箱庭の出来事の一覧（共通／箱庭の／小イベント／ハプニング）と、試しに回したときの起きた回数
   ・run(opt)     … 一回シミュレーションして、記録（口調の言い換え前の文 raw つき）を返す
   ・batch(opt)   … 何回も回して、出てきた文（言い換え前）を集める
   ・voice(text, people) … 一つの文を、話し手の口調で言い換えて見せる */
(function () {
  'use strict';
  var HK = window.HK;
  if (!HK || !HK.simulate) { window.STUDIO = { error: 'HK が読み込めませんでした' }; return; }
  var V = HK.Voice;
  var errors = [];
  window.addEventListener('error', function (e) { errors.push(String(e.message || e)); });

  /* 口調の言い換えの前の文を残す */
  if (V && V.processResult && !V.processResult._studio) {
    var pr = V.processResult;
    V.processResult = function (res) {
      try {
        (res && res.log || []).forEach(function (e) { if (e && typeof e.text === 'string' && e.raw == null) e.raw = e.text; });
        var E = res && (res.ending || res.end);
        if (E && Array.isArray(E.lines)) E.rawLines = E.lines.slice();
        if (E && typeof E.text === 'string') E.rawText = E.text;
      } catch (err) { /* 記録の形が違っても続ける */ }
      return pr.apply(this, arguments);
    };
    V.processResult._studio = true;
  }

  /* 出来事が起きた回数を数える（箱庭ごと） */
  var CUR = { scen: '' }, COUNT = {};
  function poolOf(id) {
    var sc = HK.SCENARIOS[id]; if (!sc) return [];
    var ex = sc.exclude || [], out = [];
    (HK.COMMON || []).forEach(function (e) { if (ex.indexOf(e.id) < 0) out.push({ kind: '共通', e: e }); });
    (Array.isArray(sc.events) ? sc.events : []).forEach(function (e) { out.push({ kind: 'この箱庭', e: e }); });
    ((HK.MINI && HK.MINI[id]) || []).forEach(function (e) { if (ex.indexOf(e.id) < 0) out.push({ kind: '小イベント', e: e }); });
    ((HK.INCIDENTS && HK.INCIDENTS[id]) || []).forEach(function (e) { out.push({ kind: 'ハプニング', e: e }); });
    return out;
  }
  function wrapRun(e) {
    if (!e || typeof e.run !== 'function' || e.run._studio) return;
    var r0 = e.run;
    e.run = function () { var k = CUR.scen + '\u0001' + e.id; COUNT[k] = (COUNT[k] || 0) + 1; return r0.apply(this, arguments); };
    e.run._studio = true;
  }
  (HK.SCEN_ORDER || []).forEach(function (id) { poolOf(id).forEach(function (x) { wrapRun(x.e); }); });

  function envDefaults(sc) {
    var env = {};
    (HK.GLOBAL_ENV || []).concat(sc.env || []).forEach(function (e) { env[e.id] = e.def != null ? e.def : (e.options && e.options[0] ? e.options[0].v : (e.min != null ? e.min : '')); });
    return env;
  }
  function rnd(s) { var x = s >>> 0 || 1; return function () { x = (x * 1103515245 + 12345) % 2147483648; return x / 2147483648; }; }

  function mkInput(o) {
    var sc = HK.SCENARIOS[o.scenId];
    var env = envDefaults(sc);
    Object.keys(o.env || {}).forEach(function (k) { env[k] = o.env[k]; });
    var r = rnd(o.seed * 7 + 3);
    var chars = (o.chars || []).map(function (c, i) {
      var eg = c.eg || { CP: Math.round(r() * 20), NP: Math.round(r() * 20), A: Math.round(r() * 20), FC: Math.round(r() * 20), AC: Math.round(r() * 20) };
      return { name: c.name || ('住人' + (i + 1)), eg: eg, memo: '', gender: c.gender || '', likes: c.likes || '', tone: c.tone || '', fp: c.fp || '', pos: c.pos || '', color: '', call: '', calls: {}, keigo: {}, loveLock: '', futa: !!c.futa };
    });
    var perChar = chars.map(function () { return { action: 'auto', goal: 'auto', stats: {}, weapon: '', pick: {}, role: '' }; });
    return { scenId: o.scenId, seed: o.seed, env: env, chars: chars, perChar: perChar, ties: o.ties || [] };
  }

  function run(o) {
    var input = mkInput(o);
    CUR.scen = o.scenId;
    var res;
    try { res = HK.simulate(input); }
    catch (e) { return { error: String(e && e.stack || e), input: input }; }
    finally { CUR.scen = ''; }
    var log = (res.log || []).map(function (e) { return { text: e.text, raw: e.raw != null ? e.raw : e.text, step: e.step, label: e.label, cat: e.cat, kind: e.kind, why: e.why || '', actors: e.actors }; });
    var E = res.ending || res.end, ending = null;
    if (E) ending = { lines: E.lines || (E.text ? [E.text] : []), raw: E.rawLines || (E.rawText ? [E.rawText] : E.lines || []) };
    var notes = (res.chars || []).map(function (c) { return c && c.fateNote; }).filter(Boolean);
    return { log: log, ending: ending, notes: notes, chars: input.chars.map(function (c) { return { name: c.name, gender: c.gender, tone: c.tone, pos: c.pos }; }), env: input.env };
  }

  var NAMES = ['アキラ', 'ミナト', 'ユキノ', 'カオル', 'ハルカ', 'レンジ', 'ツバサ', 'シオン'];
  /* 何回も回す。口調は順番に、性別は男・女・おまかせの順に割り振る */
  function batch(o) {
    var sc = HK.SCENARIOS[o.scenId], tones = HK.TONE_KEYS || [], ti = o.toneOffset || 0;
    var n = Math.max(sc.minCast || 2, Math.min(sc.maxCast || 6, o.cast || 6));
    var texts = [], fails = [], before = Object.assign({}, COUNT);
    for (var s = 0; s < o.n; s++) {
      var chars = [];
      for (var i = 0; i < n; i++) {
        var g = o.genders && o.genders.length ? o.genders[(i + s) % o.genders.length] : (i % 3 === 0 ? 'm' : i % 3 === 1 ? 'f' : '');
        chars.push({ name: NAMES[i % NAMES.length], gender: g, tone: o.tone || tones[(ti++) % tones.length], pos: o.pos ? o.pos[(i + s) % o.pos.length] : '' });
      }
      var env = Object.assign({}, o.env || {});
      if (o.hot) (sc.env || []).forEach(function (e, k) {
        if (e.max != null && /lewd|dose|shady|heat|npc|prey|depth|skill|monsters|pleasure|traffic|ev$/.test(e.id)) env[e.id] = e.max;
        else if (e.options && e.options.some(function (x) { return x.v === 'high'; }) && /lewd/.test(e.id)) env[e.id] = 'high';
        else if (e.options && e.options.length > 1 && !/lewd|^mode$/.test(e.id) && (s + k) % 2) env[e.id] = e.options[(s + k) % e.options.length].v;
        if (e.id === 'mode' && e.options && e.options.some(function (x) { return x.v === 'lewd'; })) env[e.id] = 'lewd';
      });
      var r = run({ scenId: o.scenId, seed: 12345 + (o.seed0 || 0) + s * 101, env: env, chars: chars });
      if (r.error) { fails.push(r.error); continue; }
      r.log.forEach(function (e) { if (typeof e.raw === 'string') texts.push(e.raw); if (e.why) texts.push(e.why); });
      if (r.ending) r.ending.raw.forEach(function (l) { if (typeof l === 'string') texts.push(l); });
      r.notes.forEach(function (l) { texts.push(l); });
    }
    var counts = {};
    Object.keys(COUNT).forEach(function (k) { var d = COUNT[k] - (before[k] || 0); if (d > 0 && k.indexOf(o.scenId + '\u0001') === 0) counts[k.split('\u0001')[1]] = d; });
    return { texts: texts, fails: fails, eventCounts: counts, runs: o.n };
  }

  function events(id) {
    return poolOf(id).map(function (x) { var e = x.e; return { id: e.id, kind: x.kind, cat: e.cat || '', scope: e.scope || '', once: e.once }; });
  }

  function info() {
    var tones = (HK.TONE_KEYS || []).map(function (k) { var t = HK.toneInfo ? HK.toneInfo(k) : HK.PERSONA[k]; return { key: k, label: t ? t.label : k, group: t && t.group || '' }; });
    var personas = (HK.PERSONA_KEYS || Object.keys(HK.PERSONA || {})).map(function (k) { return { key: k, label: HK.PERSONA[k].label }; });
    var scens = (HK.SCEN_ORDER || []).map(function (id) {
      var sc = HK.SCENARIOS[id];
      return { id: id, name: sc.name, solo: !!sc.simulate, minCast: sc.minCast || 2, maxCast: sc.maxCast || 8,
        env: (HK.GLOBAL_ENV || []).concat(sc.env || []).map(function (e) { return { id: e.id, label: e.label, min: e.min, max: e.max, def: e.def, options: e.options ? e.options.map(function (x) { return { v: x.v, label: x.label || x.l || String(x.v) }; }) : null }; }),
        nEvents: sc.simulate ? 0 : poolOf(id).length };
    });
    return { tones: tones, personas: personas, scens: scens, safe: !!HK.SAFE_ON, safeBuild: !!HK.SAFE_BUILD, errors: errors.slice() };
  }

  /* 一つの文を、口調ごとに言い換えて見せる。people: [{name, tone, gender, fp}] */
  function voice(text, people) {
    if (!V || !V.processResult) return text;
    /* 本番と同じく、結果まるごとの仕上げ（processResult）を通す */
    var chars = people.map(function (p) { return { name: p.name, fp: p.fp || '', gender: p.gender || '', tone: p.tone || '', eg: { CP: 10, NP: 10, A: 10, FC: 10, AC: 10 }, call: '', calls: {}, keigo: {} }; });
    var res = { log: [{ text: text, actors: chars.map(function (c, i) { return i; }), kind: 'event', cat: 'bond' }], chars: chars.map(function (c) { return { persona: HK.personaOf ? HK.personaOf(c) : 'gentle' }; }) };
    try { V.processResult(res, { chars: chars, env: {} }); return res.log[0].text; } catch (e) { return '（言い換えに失敗：' + e.message + '）'; }
  }

  window.STUDIO = { info: info, events: events, run: run, batch: batch, voice: voice, errors: errors };
  if (window.parent && window.parent !== window && window.parent.onSandboxReady) window.parent.onSandboxReady(window.STUDIO);
})();
