/* 箱庭シミュレーター: 物語型R18箱庭（常識改変・サキュバス）の共通部品と結果表示
   ・一人〜数人を、それぞれのメーター（違和感・快感・精の量など）で追いかける
   ・結果は「結末」「比較表」「住人ごとのメーター推移」「記録（人ごとに絞り込める）」で見せる */
(function () {
  'use strict';
  var HK = window.HK, esc = HK.escape;
  var ST = HK.Story = {};

  ST.state = function (input, scenId) {
    var scen = HK.SCENARIOS[scenId], env = {};
    scen.env.forEach(function (e) { env[e.id] = input.env && input.env[e.id] != null ? input.env[e.id] : e.def; });
    var S = { scen: scen, rng: HK.rng(input.seed), env: env, log: [], hist: [], turns: [], recent: [], step: 0, label: '', flags: {} };
    S.P = input.chars.map(function (c, i) {
      var pc = (input.perChar && input.perChar[i]) || {};
      var p = { i: i, lock: c.loveLock === '' || c.loveLock == null || isNaN(+c.loveLock) ? null : +c.loveLock, call: c.call || '', calls: c.calls || null, keigo: c.keigo || null, name: c.name, eg: c.eg, tr: HK.traits(c.eg), top: HK.voiceTop(c), topWhy: HK.voiceTopWhy(c), memo: c.memo || '', gender: c.gender || '', likes: c.likes || '', tone: c.tone || '', fp: c.fp || '', pos: c.pos || '', posLike: c.posLike || '', pick: pc.pick || {}, stats: {}, m: {}, cnt: {}, notes: [], fate: '' };
      p.persona = HK.personaOf(p);
      (scen.stats || []).forEach(function (s) { var v = pc.stats && pc.stats[s.id]; p.stats[s.id] = v == null || v === 'random' ? 1 + S.rng.int(5) : +v; });
      return p;
    });
    return S;
  };
  /* 最近使った文を避けて選ぶ */
  ST.pick = function (S, arr) {
    if (!arr || !arr.length) return '';
    var r = S.recent, t = arr[S.rng.int(arr.length)];
    for (var i = 0; i < 6 && r.indexOf(t) >= 0; i++) t = arr[S.rng.int(arr.length)];
    r.push(t); if (r.length > 60) r.shift();
    return t;
  };
  ST.fmt = function (t, v) { return String(t).replace(/\{(\w+)\}/g, function (m, k) { return v[k] != null ? v[k] : m; }); };
  ST.say = function (S, o) {
    if (S.textFilter && o.text) o.text = S.textFilter(o.text);
    if (S.whyFilter && o.why) o.why = S.whyFilter(o.why);
    /* 「＠……」は村人など住人以外の台詞（口調を変えない）。見えない印（U+2060）に置き換えておく */
    if (o.text && o.text.indexOf('「＠') >= 0) o.text = o.text.replace(/「＠/g, '「\u2060');
    o.n = S.log.length; o.label = S.label; o.kind = o.kind || 'event';
    o.actors = (o.actors || []).map(function (p) { return typeof p === 'number' ? p : p.i; });
    S.log.push(o);
    return o;
  };
  /* 一区切りに全文で載せる数を絞る。あふれた分は短い一行にまとめる（読みやすさのため） */
  ST.budget = function (S, n) { S.room = n; S.short = []; };
  ST.sayB = function (S, o, short, force) {
    if (force || S.room == null || S.room > 0) { if (S.room != null) S.room--; return ST.say(S, o); }
    S.short.push({ t: short, a: o.actors || [] });
    return null;
  };
  ST.flushShort = function (S, head) {
    if (!S.short || !S.short.length) return;
    var who = [];
    S.short.forEach(function (x) { (x.a || []).forEach(function (p) { var i = typeof p === 'number' ? p : p.i; if (who.indexOf(i) < 0) who.push(i); }); });
    ST.say(S, { kind: 'phase', actors: who, text: (head || 'ほかに：') + S.short.map(function (x) { return x.t; }).join('／') });
    S.short = [];
  };
  ST.step = function (S, label) { S.label = label; return ST.say(S, { kind: 'step', text: label }); };
  ST.key = function (S, o, why) { o.key = true; S.turns.push({ n: o.n, why: why || '' }); return o; };
  /* メーターの記録（keys の順で） */
  ST.snap = function (S, keys) {
    S.hist.push({ n: S.log.length, label: S.label, v: S.P.map(function (p) { return keys.map(function (k) { return Math.round(p.m[k] || 0); }); }) });
  };
  ST.result = function (S, input, o) {
    var res = {
      solo: true, story: true, scenId: S.scen.id, seed: input.seed, env: S.env, input: input,
      log: S.log, hist: S.hist, turns: S.turns, ending: o.ending, estats: o.estats || [], table: o.table || null,
      meters: o.meters || [], meta: o.meta || '', relmap: o.relmap || null, heroes: S.P.map(function (p) { return { i: p.i, name: p.name, eg: p.eg, top: p.top, fate: p.fate, role: p.roleLabel || '', notes: p.notes, m: p.m, cnt: p.cnt }; }),
      stepCount: S.hist.length
    };
    res.hero = res.heroes[0];
    res.chars = S.P.map(function (p) { return { name: p.name, i: p.i, alive: true }; });
    res.outcome = o.ending.title;
    res.summary = o.summary || o.ending.title;
    return res;
  };

  /* ======================= 結果表示 ======================= */
  var V = HK.StoryView = {}, keyOnly = false, who = null, lastHost = null, lastRes = null;
  function pc(i) { return 'var(--p' + (i % 30) + ')'; }
  function av(res, i, size) { var h = res.heroes[i]; return h && HK.Icons ? HK.Icons.html(h.name, i, size) : ''; }
  function paint(text, res) {
    var t = esc(text);
    res.heroes.slice().sort(function (a, b) { return b.name.length - a.name.length; }).forEach(function (h) { var n = esc(h.name); if (n) t = t.split(n).join('\u0001' + h.i + '\u0002'); });
    return t.replace(/\u0001(\d+)\u0002/g, function (m, i) { return '<span class="name" style="color:' + pc(+i) + '">' + esc(res.heroes[+i].name) + '</span>'; });
  }
  function chart(res, h) {
    var H = res.hist, M = res.meters, W = 300, Hh = 70;
    if (H.length < 2) return '';
    var n = H.length - 1;
    function x(i) { return 4 + (W - 8) * i / n; }
    return '<svg class="spark" viewBox="0 0 ' + W + ' ' + Hh + '" preserveAspectRatio="none" aria-hidden="true" style="height:70px">' +
      M.map(function (m, k) {
        var mx = m.max || 100;
        return '<polyline fill="none" points="' + H.map(function (p, i) { var v = p.v[h.i] ? p.v[h.i][k] : 0; return x(i).toFixed(1) + ',' + (Hh - 4 - Math.min(1, v / mx) * (Hh - 8)).toFixed(1); }).join(' ') + '" style="stroke:var(' + m.color + ');stroke-width:' + (k ? 1.4 : 2.2) + ';vector-effect:non-scaling-stroke' + (m.dash ? ';stroke-dasharray:4 3' : '') + '"/>';
      }).join('') + '</svg>';
  }
  function card(res, h) {
    var last = res.hist.length ? res.hist[res.hist.length - 1].v[h.i] || [] : [];
    return '<article class="ccard"><div class="hd">' + av(res, h.i, 40) + '<span class="nm">' + esc(h.name) + '</span>' + (h.role ? '<span class="chip">' + esc(h.role) + '</span>' : '') + (h.fate ? '<span class="fate mid">' + esc(h.fate) + '</span>' : '') + '</div>' +
      chart(res, h) + '<div class="sparkleg">' + res.meters.map(function (m, k) { return '<span style="color:var(' + m.color + ')">― ' + esc(m.label) + ' ' + (last[k] != null ? last[k] + (m.unit || '') : '') + '</span>'; }).join('') + '</div>' +
      (h.notes && h.notes.length ? '<ul>' + h.notes.map(function (t) { return '<li>' + paint(t, res) + '</li>'; }).join('') + '</ul>' : '') + '</article>';
  }
  function table(res) {
    var T = res.table;
    if (!T) return '';
    return '<h2 class="sec">' + esc(T.title || '比較') + '</h2>' + (T.hint ? '<p class="hint">' + esc(T.hint) + '</p>' : '') + '<div class="tblwrap"><table class="per"><thead><tr><th></th><th>住人</th>' + T.cols.map(function (c) { return '<th>' + esc(c) + '</th>'; }).join('') + '</tr></thead><tbody>' +
      T.rows.map(function (r) { return '<tr><td>' + esc(r.rank || '') + '</td><td><span class="row" style="flex-wrap:nowrap">' + av(res, r.i, 22) + '<b>' + esc(res.heroes[r.i].name) + '</b></span></td>' + r.cells.map(function (c) { return '<td>' + esc(c) + '</td>'; }).join('') + '</tr>'; }).join('') + '</tbody></table></div>';
  }
  function timeline(res) {
    var groups = [], cur = null, ks = {};
    res.turns.forEach(function (t) { ks[t.n] = 1; });
    res.log.forEach(function (e) {
      if (e.kind === 'step') { cur = { label: e.text, items: [] }; groups.push(cur); return; }
      if (!cur) { cur = { label: '', items: [] }; groups.push(cur); }
      if (who != null && e.actors.length && e.actors.indexOf(who) < 0) return;
      if (keyOnly && !e.key && e.kind !== 'climax' && !(e.mag >= 30)) return;
      cur.items.push(e);
    });
    var html = groups.filter(function (g) { return g.items.length; }).map(function (g) {
      return '<div class="stepblk"><div class="when">' + esc(g.label) + '</div><ol>' + g.items.map(function (e) {
        var avs = e.actors.length ? '<span class="avs">' + e.actors.slice(0, 3).map(function (i) { return av(res, i, 26); }).join('') + '</span>' : '';
        return '<li class="ev' + (e.kind === 'phase' ? ' phase' : '') + (e.kind === 'climax' ? ' climax' : '') + (e.key ? ' key' : '') + (avs ? ' hasav' : '') + (avs && /「/.test(e.text) ? ' talk' : '') + '">' + avs + '<div class="evb">' + (e.tag ? '<span class="c">' + esc(e.tag) + '</span>' : '') + paint(e.text, res) + (e.why ? '<span class="why">' + esc(e.why) + '</span>' : '') + '</div></li>';
      }).join('') + '</ol></div>';
    }).join('');
    return html || '<p class="hint">条件に合う出来事はありません。</p>';
  }
  function bar(res) {
    return '<div class="tlbar">' + res.heroes.map(function (h) { return '<button class="chip whochip" data-st="who" data-i="' + h.i + '" aria-pressed="' + (who === h.i) + '">' + av(res, h.i, 20) + esc(h.name) + '</button>'; }).join('') +
      '<span class="spacer"></span><button class="chip" data-st="key" aria-pressed="' + keyOnly + '">決め手と絶頂だけ</button></div>';
  }

  /* ---------- 関係図（res.relmap があるとき） ---------- */
  var RCLS = { love: '--love', pine: '--pine', night: '--night', obsess: '--obsess', enemy: '--enemy', kill: '--kill', partner: '--partner', friend: '--friend', guard: '--guard', none: '--none' };
  function relSvg(res) {
    var R = res.relmap;
    if (!R || !R.nodes || R.nodes.length < 2) return '';
    var n = R.nodes.length, W = 680, H = n <= 4 ? 360 : n <= 7 ? 440 : 520, cx = W / 2, cy = H / 2 - 6, rr = Math.min(W * 0.36, H / 2 - 62), NR = n > 8 ? 17 : 21;
    var pos = R.nodes.map(function (nd, k) { var a = -Math.PI / 2 + k * 2 * Math.PI / n; return { x: cx + Math.cos(a) * rr * (n === 2 ? 1.1 : 1), y: cy + Math.sin(a) * rr }; });
    var idx = {}; R.nodes.forEach(function (nd, k) { idx[nd.i] = k; });
    var defs = '<defs>' + Object.keys(RCLS).map(function (k) { return '<marker id="rm-' + k + '" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" style="fill:var(' + RCLS[k] + ')"/></marker>'; }).join('') + '</defs>';
    /* 同じ二人の線は一本にまとめ、ラベルを並べる（色は強い関係を優先） */
    var PRI = ['kill', 'love', 'pine', 'night', 'enemy', 'obsess', 'guard', 'partner', 'friend', 'none'], merged = {}, list = [];
    R.edges.forEach(function (e) {
      var k = Math.min(e.a, e.b) + '-' + Math.max(e.a, e.b), m = merged[k];
      if (!m) { m = merged[k] = { a: e.a, b: e.b, labels: [], cls: e.cls, dir: e.dir }; list.push(m); }
      else { if (PRI.indexOf(e.cls) < PRI.indexOf(m.cls)) m.cls = e.cls; if (m.dir !== e.dir) m.dir = m.dir != null && e.dir == null ? m.dir : e.dir != null && m.dir == null ? e.dir : null; }
      if (m.labels.indexOf(e.label) < 0) m.labels.push(e.label);
    });
    list.forEach(function (m) { m.label = m.labels.join('・'); });
    var pairN = {}, edges = '', labs = '';
    list.forEach(function (e) {
      var A = pos[idx[e.a]], B = pos[idx[e.b]];
      if (!A || !B) return;
      var key = Math.min(e.a, e.b) + '-' + Math.max(e.a, e.b), m = pairN[key] = (pairN[key] || 0) + 1;
      var from = e.dir != null && e.dir === e.b ? B : A, to = from === A ? B : A;
      var dx = to.x - from.x, dy = to.y - from.y, L = Math.sqrt(dx * dx + dy * dy) || 1, ux = dx / L, uy = dy / L;
      var bend = (m - 1) * 26 * (m % 2 ? 1 : -1) + (m > 1 ? 0 : 0), nx = -uy, ny = ux;
      var x1 = from.x + ux * (NR + 3), y1 = from.y + uy * (NR + 3), x2 = to.x - ux * (NR + 5), y2 = to.y - uy * (NR + 5);
      /* 円周上の別の丸を避けるため、線は円の中心側へふくらませる */
      var mx = (x1 + x2) / 2, my = (y1 + y2) / 2, pull = n > 3 ? 0.4 : 0.15;
      var qx = mx + (cx - mx) * pull + nx * bend, qy = my + (cy - my) * pull + ny * bend;
      var col = 'var(' + (RCLS[e.cls] || '--none') + ')';
      edges += '<path d="M' + x1.toFixed(1) + ',' + y1.toFixed(1) + ' Q' + qx.toFixed(1) + ',' + qy.toFixed(1) + ' ' + x2.toFixed(1) + ',' + y2.toFixed(1) + '" fill="none" style="stroke:' + col + ';stroke-width:' + (e.cls === 'kill' ? 2.6 : 1.8) + (e.cls === 'none' || e.cls === 'obsess' ? ';stroke-dasharray:5 4' : '') + '"' + (e.dir != null ? ' marker-end="url(#rm-' + (RCLS[e.cls] ? e.cls : 'none') + ')"' : '') + '/>';
      var lx = 0.25 * x1 + 0.5 * qx + 0.25 * x2, ly = 0.25 * y1 + 0.5 * qy + 0.25 * y2;
      labs += '<text x="' + lx.toFixed(1) + '" y="' + (ly + 4).toFixed(1) + '" text-anchor="middle" class="rlab" style="fill:' + col + '">' + esc(e.label) + '</text>';
    });
    var nodes = R.nodes.map(function (nd, k) {
      var P = pos[k], col = pc(nd.i);
      return '<g' + (nd.dead ? ' opacity="0.5"' : '') + '><circle cx="' + P.x.toFixed(1) + '" cy="' + P.y.toFixed(1) + '" r="' + NR + '" style="fill:var(--surface);stroke:' + col + ';stroke-width:3"/>' +
        /* 顔アイコンがあれば丸の中に、なければ頭文字 */
        ((HK.Icons && HK.Icons.url(nd.name) && HK.Icons.svg(nd.name, nd.i, P.x, P.y, NR - 1.5, 'sk' + k)) ||
        '<text x="' + P.x.toFixed(1) + '" y="' + (P.y + 5).toFixed(1) + '" text-anchor="middle" style="fill:' + col + ';font-weight:700;font-size:14px">' + esc(HK.Icons ? HK.Icons.initial(nd.name) : nd.name.charAt(0)) + '</text>') +
        '<text x="' + P.x.toFixed(1) + '" y="' + (P.y + NR + 16).toFixed(1) + '" text-anchor="middle" class="rnm" style="fill:' + col + '">' + esc(nd.name.length > 8 ? nd.name.slice(0, 8) + '…' : nd.name) + (nd.dead ? '（故）' : '') + '</text>' +
        '<text x="' + P.x.toFixed(1) + '" y="' + (P.y + NR + 30).toFixed(1) + '" text-anchor="middle" class="rsub">' + esc(nd.sub || '') + '</text></g>';
    }).join('');
    return '<h2 class="sec">関係図</h2><figure class="trayfig" style="margin:0"><div class="tray"><svg viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="関係図" style="width:100%;height:auto;display:block"><style>.rlab{font-size:12px;font-weight:700;paint-order:stroke;stroke:var(--surface);stroke-width:4px;stroke-linejoin:round}.rnm{font-size:13px;font-weight:700;paint-order:stroke;stroke:var(--surface);stroke-width:3px}.rsub{font-size:10.5px;fill:var(--muted);paint-order:stroke;stroke:var(--surface);stroke-width:3px}</style>' + defs + edges + nodes + labs + '</svg></div>' + (R.note ? '<figcaption><span>' + esc(R.note) + '</span></figcaption>' : '') + '</figure>';
  }
  V.render = function (host, res, opts, histHtml) {
    if (res !== lastRes) { who = null; keyOnly = res.log.length > 260; }
    lastHost = host; lastRes = res;
    var S = HK.SCENARIOS[res.scenId], E = res.ending;
    var envChips = S.env.map(function (e) {
      var v = res.env[e.id], shown = e.type === 'select' ? (e.options.filter(function (o) { return o.v === v; })[0] || {}).label : v + (e.unit || '');
      return '<span class="chip">' + esc(e.label) + '：' + esc(shown) + '</span>';
    }).join('');
    host.innerHTML =
      '<div class="resulthead"><div><h2>' + esc(S.name) + '</h2><div class="meta">シード <span class="num">' + res.seed + '</span>　' + esc(res.meta) + '</div>' + (S.note ? '<div class="meta scnote">' + esc(S.note) + '</div>' : '') + '</div><span class="spacer"></span>' +
      '<div class="row"><button class="btn primary" data-act="reroll">別の運命で動かす</button><button class="btn" data-act="copytext">結果をテキストでコピー</button><button class="btn" data-act="gobox">条件を変える</button></div></div>' +
      '<section class="ending" aria-label="結末"><div class="eyebrow">結末</div><p class="ehead">' + paint(E.title, res) + '</p>' +
      (res.estats.length ? '<dl class="estats">' + res.estats.map(function (s) { return '<div><dt>' + esc(s[0]) + '</dt><dd>' + esc(s[1]) + '</dd></div>'; }).join('') + '</dl>' : '') +
      (E.lines.length ? '<ul class="elines">' + E.lines.map(function (l) { return '<li>' + paint(l, res) + '</li>'; }).join('') + '</ul>' : '') + '</section>' +
      '<div class="uses" style="margin-top:12px">' + envChips + '</div>' +
      table(res) + relSvg(res) +
      '<h2 class="sec">住人ごとの推移</h2><div class="cards">' + res.heroes.map(function (h) { return card(res, h); }).join('') + '</div>' +
      '<h2 class="sec" id="tlhead">記録</h2><div id="stbar">' + bar(res) + '</div><div class="tl" id="sttl">' + timeline(res) + '</div>' + (histHtml || '');
    if (!host._stBound) {
      host._stBound = true;
      host.addEventListener('click', function (ev) {
        var b = ev.target.closest && ev.target.closest('[data-st]');
        if (!b || !lastRes || !lastRes.story) return;
        if (b.getAttribute('data-st') === 'key') keyOnly = !keyOnly;
        else { var i = +b.getAttribute('data-i'); who = who === i ? null : i; }
        var t = host.querySelector('#sttl'), br = host.querySelector('#stbar');
        if (t) t.innerHTML = timeline(lastRes);
        if (br) br.innerHTML = bar(lastRes);
      });
    }
  };
  V.toText = function (res) {
    var S = HK.SCENARIOS[res.scenId], L = [], E = res.ending;
    L.push('【箱庭シミュレーター】' + S.name + '（' + res.meta + '・シード ' + res.seed + '）');
    L.push(''); L.push('■ 結末'); L.push(E.title);
    if (res.estats.length) L.push(res.estats.map(function (x) { return x[0] + ' ' + x[1]; }).join('　'));
    E.lines.forEach(function (l) { L.push('・' + l); });
    if (res.table) { L.push(''); L.push('■ ' + (res.table.title || '比較')); L.push('住人　' + res.table.cols.join('　')); res.table.rows.forEach(function (r) { L.push((r.rank ? r.rank + ' ' : '') + res.heroes[r.i].name + '　' + r.cells.join('　')); }); }
    if (res.relmap && res.relmap.edges.length) { L.push(''); L.push('■ 関係'); var nm = {}; res.relmap.nodes.forEach(function (nd) { nm[nd.i] = nd.name; }); res.relmap.edges.forEach(function (e) { L.push('・' + nm[e.dir != null && e.dir === e.b ? e.b : e.a] + (e.dir != null ? ' → ' : ' × ') + nm[e.dir != null && e.dir === e.b ? e.a : e.b] + '：' + e.label); }); }
    L.push(''); L.push('■ 住人');
    res.heroes.forEach(function (h) { L.push('・' + h.name + (h.role ? '（' + h.role + '）' : '') + '：' + h.fate); h.notes.forEach(function (n) { L.push('　' + n); }); });
    L.push(''); L.push('■ 記録');
    res.log.forEach(function (e) { L.push(e.kind === 'step' ? '― ' + e.text : '　' + (e.tag ? '［' + e.tag + '］' : '') + e.text); });
    return L.join('\n');
  };
  /* 既存の一人用の表示に割り込む */
  function hook() {
    var DV = HK.DView;
    if (!DV || DV._story) return;
    DV._story = true;
    var r0 = DV.render, t0 = DV.toText;
    DV.render = function (host, res, opts, h) { return res && res.story ? V.render(host, res, opts, h) : r0(host, res, opts, h); };
    DV.toText = function (res) { return res && res.story ? V.toText(res) : t0(res); };
  }
  ST.hook = hook;
  hook();
})();
