/* 箱庭シミュレーター: 邪神村RTA ― 神ごとの固有イベント（しくみ）
   ・どの神にも、必ず固有のイベントがある（起きるかどうかは、時刻・経過時間・人の動き・運しだい）
   ・ふつうの固有イベントは E(神のid, {...}) で足す（jashin-godev-data-a.js / -b.js）。
     tag=見出し／t=night・day・any／from=何時間目から／p=2時間ごとの確率／max=回数／who=選ばれやすい人／
     sk=試す力（obs・lore・talk・spirit・explore・fight・rite）／d=難しさ／pre・ok・ng=文（| 区切り）／
     okE・ngE・e=結果（fear・hp・die・dt・clue・taken・hostile・deadline・bonus・flag・fearAll）
   ・凝ったしくみの神は SP[神のid] = { tick, cave, manifest, end }（jashin-godev-sp-a.js / -b.js）
   ・洞窟（jashin-cave.js）と顕現にも、神ごとの場面を差し込める
   {a}=選ばれた住人 {b}=そばにいる別の住人 {g}=村での神の呼び名 {v}=村の名 */
(function () {
  'use strict';
  var HK = window.HK, ST = HK.Story, JS = HK.JASHIN, clamp = HK.clamp;
  if (!ST || !JS) return;
  var EV = {}, SP = {};
  function L(s) { return s ? s.split('|') : []; }
  function E(id, d) {
    d.pre = L(d.pre); d.ok = L(d.ok); d.ng = L(d.ng); if (d.dt) d.dt = L(d.dt);
    ['okE', 'ngE', 'e'].forEach(function (k) { if (d[k] && d[k].dt) d[k].dt = L(d[k].dt); });
    (EV[id] = EV[id] || []).push(d); d.k = id + ':' + EV[id].length;
  }
  var TYPE_JP = { obs: '観察', lore: '知識', talk: '聞き込み', spirit: '霊感', explore: '探索', fight: '腕っぷし', rite: '儀式' };

  /* 選ばれやすい人 */
  var WHO = {
    any: function () { return 1; },
    alone: function (p) { return p.action.id === 'alone' ? 3.5 : 1; },
    imp: function (p) { return 0.3 + p.tr.impulse * 2 + p.tr.fc; },
    brave: function (p) { return 0.3 + p.tr.cp + p.tr.aggr + p.stats.stamina * 0.15; },
    warm: function (p) { return 0.3 + p.tr.warmth * 2 + p.tr.np; },
    scared: function (p) { return 0.3 + p.m.fear / 30; },
    wise: function (p) { return 0.3 + p.tr.a * 2; },
    spirit: function (p) { return 0.3 + JS.skill(p, 'spirit') * 3; },
    f: function (p) { return p.gender === 'f' ? 4 : p.gender === 'm' ? 0.25 : 1; },
    m: function (p) { return p.gender === 'm' ? 4 : p.gender === 'f' ? 0.25 : 1; },
    cold: function (p) { return 0.3 + p.tr.cold * 2 + p.tr.impulse; },
    loud: function (p) { return 0.3 + p.tr.fc * 1.5 + p.tr.impulse * 1.5 - p.tr.caution; },
    weak: function (p) { return 0.3 + (6 - p.stats.stamina) * 0.3 + (6 - p.stats.luck) * 0.2; }
  };
  function pickWho(S, who, live) {
    var f = typeof who === 'function' ? who : WHO[who || 'any'] || WHO.any;
    var c = live.filter(function (p) { return JS.alive(p) && !p.bound; });
    if (!c.length) return null;
    return HK.weighted(S.rng, c, function (p) { return Math.max(0.02, f(p, S)); });
  }
  function other(S, a, live) {
    var c = live.filter(function (q) { return q !== a && JS.alive(q) && !q.bound; });
    if (!c.length) return null;
    return HK.weighted(S.rng, c, function (q) { return 0.4 + Math.max(0, JS.REL.bond(S, q, a)); });
  }
  function fmt(S, t, a, b) { return ST.fmt(t, { a: a ? a.name : '', b: b ? b.name : '仲間', d: S.gdDead || '見知らぬ誰か', g: S.G.call, v: S.V, n: S.G.name }); }
  function pk(S, arr, a, b) { return arr && arr.length ? end(fmt(S, ST.pick(S, arr), a, b)) : ''; }
  /* 文の終わりに句点がなければ足す */
  function end(t) { return !t || /[。」』）！？…―]$/.test(t) ? t : t + '。'; }
  /* 残っている手がかりを一つ渡す */
  function giveClue(S, p) {
    var k = S.G.clues.map(function (c, i) { return i; }).filter(function (i) { return S.found.indexOf(i) < 0; })[0];
    if (k == null) return '';
    S.found.push(k); if (p) { p.cnt.clue++; }
    return '――' + S.G.clues[k].t + '。';
  }
  /* 結果を当てはめる。死んだら true */
  function apply(S, E0, a, b, live, text, tag, why, mag) {
    var rng = S.rng, C = JS.core;
    E0 = E0 || {};
    if (E0.fear) a.m.fear = clamp(a.m.fear + E0.fear, 0, 100);
    if (E0.hp) a.m.hp = clamp(a.m.hp + E0.hp, 0, 100);
    if (E0.fearAll) live.forEach(function (q) { if (JS.alive(q)) q.m.fear = clamp(q.m.fear + E0.fearAll, 0, 100); });
    if (E0.hostile) S.hostile = clamp(S.hostile + E0.hostile, 0, 100);
    if (E0.deadline) S.deadline = Math.max(S.h + 4, S.deadline + E0.deadline);
    if (E0.bonus) S.gBonus = (S.gBonus || 0) + E0.bonus;
    if (E0.flag) S.gf[E0.flag] = (S.gf[E0.flag] || 0) + 1;
    if (E0.clue) { var ct = giveClue(S, a); if (ct) { text += ct; why += '（手がかり ' + S.found.length + '/' + S.G.clues.length + '）'; } }
    if (E0.die && rng() < E0.die) {
      C.die(S, a, S.G.call + 'の' + tag + 'で', E0.dt || ['{a}は、それきり動かなくなった。'], text);
      return true;
    }
    if (E0.taken && rng() < E0.taken) {
      a.taken = true; a.takenAt = S.h;
      var o = ST.say(S, { actors: [a], tag: tag, kind: 'climax', text: text + (E0.tt ? pk(S, L(E0.tt), a, b) : ''), why: why + '（連れ去られた。対抗策を実行できれば助け出せる）', mag: mag + 8 });
      ST.key(S, o, a.name + 'が連れ去られた');
      return true;
    }
    ST.say(S, { actors: b && E0.both !== false && text.indexOf(b.name) >= 0 ? [a, b] : [a], tag: tag, text: text, why: why, mag: mag });
    return false;
  }
  /* ふつうの固有イベントを一つ起こす */
  function run(S, d, live, h) {
    var rng = S.rng, a = pickWho(S, d.who, live);
    if (!a) return false;
    var b = other(S, a, live);
    if (d.needB && !b) return false;
    var dead = S.P.filter(function (p) { return !p.alive && !p.ithFake && !p.yogFlung; });
    S.gdDead = dead.length ? dead[dead.length - 1].name : null;
    var pre = pk(S, d.pre, a, b), why = d.why || S.G.call + 'の固有の出来事';
    if (!d.sk) { apply(S, d.e, a, b, live, pre + pk(S, d.ok, a, b), d.tag, why, d.mag || 24); if (d.after) d.after(S, a, true, b); return true; }
    var hp = d.help && b && JS.REL.near(S, a, b) ? b : null;
    var ch = d.chance ? clamp(d.chance(S, a, hp), 0.08, 0.92) : clamp(JS.skill(a, d.sk) + 0.35 - (d.d == null ? 0.4 : d.d) + (hp ? JS.skill(hp, d.sk) * 0.3 : 0) + a.stats.luck * 0.02, 0.08, 0.92);
    var ok = rng() < ch;
    var w2 = why + '（' + a.name + 'の' + (d.skLabel || TYPE_JP[d.sk] + 'の力') + (hp ? '・' + hp.name + 'の助け' : '') + '：' + Math.round(ch * 100) + '％→' + (ok ? '成功' : '失敗') + '）';
    var t = pre + pk(S, ok ? d.ok : d.ng, a, hp || b);
    apply(S, ok ? d.okE : d.ngE, a, hp || b, live, t, d.tag, w2, (d.mag || 24) + (ok ? 0 : 6));
    if (d.after) d.after(S, a, ok, hp || b);
    return true;
  }

  function tick(S, live, h) {
    if (!live.length || !S.G) return;
    S.gev = S.gev || {}; S.gf = S.gf || {};
    var rng = S.rng, sp = SP[S.G.id];
    if (sp && sp.tick && sp.tick(S, live, h)) return;
    var defs = EV[S.G.id] || [], mul = 0.7 + S.env.ev / 150, night = JS.night(h);
    for (var i = 0; i < defs.length; i++) {
      var d = defs[i], n = S.gev[d.k] || 0;
      if (n >= (d.max || 1) || h < (d.from || 0)) continue;
      if (d.t === 'night' && !night) continue;
      if (d.t === 'day' && night) continue;
      if (d.need && !d.need(S, live, h)) continue;
      if (rng() > d.p * mul) continue;
      if (run(S, d, live.filter(JS.alive), h)) { S.gev[d.k] = n + 1; return; }
    }
  }
  /* 洞窟：対抗策の前に、神ごとの場面を差し込む。{bonus, rite, t, okT, ngT} */
  function cave(S, live, rite) {
    S.gf = S.gf || {};
    var sp = SP[S.G.id], r = (sp && sp.cave && sp.cave(S, live, rite)) || {};
    var b = S.gBonus || 0;
    if (b) { r.bonus = (r.bonus || 0) + b; r.why = (r.why ? r.why + '・' : '') + '村で起きた出来事' + (b > 0 ? '（有利）' : '（不利）'); }
    return r;
  }
  function manifest(S, h, pm) { var sp = SP[S.G.id]; return sp && sp.manifest ? sp.manifest(S, h, pm) : null; }
  function endHook(S, how) { var sp = SP[S.G.id]; if (sp && sp.end) sp.end(S, how); }

  JS.GODEV = { E: E, EV: EV, SP: SP, L: L, WHO: WHO, pickWho: pickWho, other: other, fmt: fmt, pk: pk, giveClue: giveClue, apply: apply, run: run, tick: tick, cave: cave, manifest: manifest, end: endHook };
})();
