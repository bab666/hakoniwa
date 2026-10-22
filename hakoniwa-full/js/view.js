/* 箱庭シミュレーター view: 結果（関係図・ペア・住人・時系列・履歴）の描画 */
(function () {
  'use strict';
  var HK = window.HK, esc = HK.escape;
  var V = (HK.View = {});
  var CLS_VAR = { love: '--love', pine: '--pine', night: '--night', obsess: '--obsess', enemy: '--enemy', kill: '--kill', partner: '--partner', friend: '--friend', guard: '--guard', none: '--none' };
  var tl = { who: [], keyOnly: false, cat: 'all' };
  var lastRes = null, lastHost = null, lastOpts = null;

  function pc(i) { return 'var(--p' + (i % 30) + ')'; }
  function dot(i) { return '<span class="dot" style="background:' + pc(i) + '"></span>'; }
  function av(res, i, size, extra) { var c = res.chars[i]; return c ? HK.Icons.html(c.name, i, size, extra) : ''; }

  /* 本文中のキャラ名に色をつける */
  function paint(text, res) {
    var t = esc(text);
    var list = res.chars.map(function (c) { return { n: esc(c.name), i: c.i }; }).sort(function (a, b) { return b.n.length - a.n.length; });
    if (!list.length) return t;
    var re = new RegExp(list.map(function (x) { return x.n.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }).join('|'), 'g');
    return t.replace(re, function (m) {
      for (var k = 0; k < list.length; k++) if (list[k].n === m) return '<span class="name" style="color:' + pc(list[k].i) + '">' + m + '</span>';
      return m;
    });
  }

  function fateCls(f) {
    if (/死亡|ゾンビ|心中/.test(f)) return 'dead';
    if (/脱出|救助|優勝|生還|帰った|お持ち帰り|進級|卒業|生き延びた/.test(f)) return 'ok';
    return 'mid';
  }

  /* ---------- 関係図 ---------- */
  /* 文字幅の目安（全角=1、半角=0.55） */
  function tw(str, px) { var w = 0; for (var i = 0; i < str.length; i++) w += str.charCodeAt(i) < 256 ? 0.58 : 1; return w * px; }
  function overlap(a, b) {
    var x = Math.min(a.x2, b.x2) - Math.max(a.x1, b.x1), y = Math.min(a.y2, b.y2) - Math.max(a.y1, b.y1);
    return x > 0 && y > 0 ? x * y : 0;
  }
  /* 住人を楕円に並べる。人数に応じて図を広げ、名前と結末の文字が隣と重ならない間隔をとる */
  function mapLayout(n, big) {
    var NR = big ? 16 : 26, below = big ? 44 : 64, lw = big ? 74 : 100;
    var rx, ry;
    if (n <= 2) { rx = 150; ry = 0; }
    else if (n === 3) { rx = 190; ry = 120; }
    else { rx = Math.max(big ? 360 : 235, n * (big ? 13.5 : 22)); ry = Math.max(big ? 250 : 150, n * (big ? 10.5 : 19.5)); }
    var padT = NR + 16, padB = below + 14, padX = lw / 2 + 16;
    var W = Math.max(big ? 860 : 640, 2 * rx + 2 * padX), H = 2 * ry + padT + padB;
    var cx = W / 2, cy = padT + ry;
    var pos = [];
    for (var i = 0; i < n; i++) {
      var a = -Math.PI / 2 + (i / n) * Math.PI * 2 + (n === 2 ? Math.PI / 2 : 0);
      pos.push({ x: cx + Math.cos(a) * rx, y: cy + Math.sin(a) * ry });
    }
    return { W: W, H: H, NR: NR, below: below, lw: lw, pos: pos };
  }
  function qpt(p0, c, p1, t) { var u = 1 - t; return { x: u * u * p0.x + 2 * u * t * c.x + t * t * p1.x, y: u * u * p0.y + 2 * u * t * c.y + t * t * p1.y }; }
  /* 線がほかの住人の丸や名前の上を通るとき、少し曲げて避ける */
  function route(A, B, L, ia, ib, boxes) {
    var mx = (A.x + B.x) / 2, my = (A.y + B.y) / 2, dx = B.x - A.x, dy = B.y - A.y, len = Math.sqrt(dx * dx + dy * dy) || 1;
    var nx = -dy / len, ny = dx / len;
    function clear(c) {
      var worst = 1e9;
      for (var k = 1; k < 20; k++) {
        var p = qpt(A, c, B, k / 20);
        for (var j = 0; j < boxes.length; j++) {
          if (j === ia || j === ib) continue;
          var bx = boxes[j], ex = Math.max(bx.x1 - p.x, 0, p.x - bx.x2), ey = Math.max(bx.y1 - p.y, 0, p.y - bx.y2);
          var d = Math.sqrt(ex * ex + ey * ey);
          if (d < worst) worst = d;
        }
      }
      return worst;
    }
    var best = { x: mx, y: my }, bv = clear(best);
    if (bv >= 6) return best;
    [34, -34, 60, -60, 90, -90].forEach(function (o) {
      if (bv >= 6) return;
      var c = { x: mx + nx * o, y: my + ny * o }, v = clear(c);
      if (v > bv + 2) { bv = v; best = c; }
    });
    return best;
  }
  function mapSvg(res) {
    var n = res.chars.length, big = n > 12;
    var LY = mapLayout(n, big), W = LY.W, H = LY.H, NR = LY.NR, pos = LY.pos;
    var focus = tl.who.length === 1 ? tl.who[0] : null;
    var defs = '<defs>' + Object.keys(CLS_VAR).map(function (k) {
      return '<marker id="ar-' + k + '" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" style="fill:var(' + CLS_VAR[k] + ')"/></marker>';
    }).join('') + '</defs>';
    /* 住人の丸と、その下の名前・結末の文字が占める範囲 */
    var nameFs = big ? 11 : 13, fateFs = big ? 9 : 11;
    var shortName = function (c) { return c.name.length > (big ? 6 : 8) ? c.name.slice(0, big ? 6 : 8) + '…' : c.name; };
    var boxes = res.chars.map(function (c, i) {
      var P = pos[i], w = Math.max(NR * 2 + 4, tw(shortName(c), nameFs), tw(c.fate || '', fateFs)) + 6;
      return { x1: P.x - w / 2, x2: P.x + w / 2, y1: P.y - NR - 3, y2: P.y + LY.below - 2 };
    });
    var edges = '', labels = '', placed = [];
    var pairs = res.pairs.filter(function (p) { return p.label !== 'strangers'; });
    if (big) {
      /* 大人数では、強い関係と意外な関係だけを描く（選択中の人物の線は全部） */
      pairs = pairs.filter(function (p) { return p.cls !== 'friend' && p.cls !== 'none' && p.label !== 'awkward' || p.surprise || (focus != null && (p.a === focus || p.b === focus)); })
        .sort(function (a, b) { return (b.surprise - a.surprise) || (b.intensity - a.intensity); });
      var keep = pairs.slice(0, 70);
      if (focus != null) pairs.forEach(function (p) { if ((p.a === focus || p.b === focus) && keep.indexOf(p) < 0) keep.push(p); });
      pairs = keep;
    }
    /* 強い関係から先にラベルの場所を取る */
    pairs = pairs.slice().sort(function (a, b) { return (b.surprise - a.surprise) || (b.intensity - a.intensity); });
    var labFs = big ? 11 : 12;
    var linePts = [];
    pairs.forEach(function (p, ei) {
      var fromI = p.a, toI = p.b;
      if (p.dir != null && p.dir === p.b) { fromI = p.b; toI = p.a; }
      var from = pos[fromI], to = pos[toI];
      var c = route(from, to, LY, fromI, toI, boxes);
      /* 丸の縁から縁まで（曲げた線は、制御点の方向で縁を決める） */
      var R = NR + 3;
      /* 下向きに出る線は、自分の名前・結末の文字の下から出す */
      function edgePt(P, Q, r, bx) {
        var dx = Q.x - P.x, dy = Q.y - P.y, l = Math.sqrt(dx * dx + dy * dy) || 1, ux = dx / l, uy = dy / l, d = r;
        if (uy > 0.15) {
          var tx = ux > 0 ? (bx.x2 - P.x) / ux : ux < 0 ? (bx.x1 - P.x) / ux : 1e9, ty = (bx.y2 - P.y) / uy;
          d = Math.max(r, Math.min(tx, ty) + 2);
        }
        return { x: P.x + ux * d, y: P.y + uy * d };
      }
      var s0 = edgePt(from, c, R, boxes[fromI]), s1 = edgePt(to, c, R + 3, boxes[toI]);
      for (var lk = 1; lk < 24; lk++) { var lp = qpt(s0, c, s1, lk / 24); lp.e = ei; linePts.push(lp); }
      var faded = focus != null && p.a !== focus && p.b !== focus;
      var wdt = 1.5 + Math.min(3, p.intensity / 160);
      var col = 'var(' + CLS_VAR[p.cls] + ')';
      var straight = Math.abs(c.x - (from.x + to.x) / 2) < 0.5 && Math.abs(c.y - (from.y + to.y) / 2) < 0.5;
      var d = straight ? 'M' + s0.x.toFixed(1) + ',' + s0.y.toFixed(1) + ' L' + s1.x.toFixed(1) + ',' + s1.y.toFixed(1)
        : 'M' + s0.x.toFixed(1) + ',' + s0.y.toFixed(1) + ' Q' + c.x.toFixed(1) + ',' + c.y.toFixed(1) + ' ' + s1.x.toFixed(1) + ',' + s1.y.toFixed(1);
      edges += '<path d="' + d + '" fill="none" style="stroke:' + col + ';stroke-width:' + wdt.toFixed(1) + ';opacity:' + (faded ? 0.15 : 0.9) + '"' + (p.cls === 'enemy' || p.cls === 'kill' ? ' stroke-dasharray="6 4"' : '') + (p.dir != null ? ' marker-end="url(#ar-' + p.cls + ')"' : '') + '/>';
      /* ラベル：線の上で、丸・名前・ほかのラベルと重ならない場所を探す */
      var txt = p.name + (p.surprise ? '＊' : ''), lw = tw(txt, labFs) + 8, lh = labFs + 6;
      var best = null, bo = 1e9, shortEdge = Math.sqrt(Math.pow(s1.x - s0.x, 2) + Math.pow(s1.y - s0.y, 2)) < lw + 18;
      [0.5, 0.42, 0.58, 0.34, 0.66, 0.27, 0.73, 0.2, 0.8].some(function (t) {
        var q = qpt(s0, c, s1, t);
        var shifts = shortEdge ? [[lw / 2 + 7, 0], [-lw / 2 - 7, 0], [0, 0]] : [[0, 0], [0, lh * 0.9], [0, -lh * 0.9], [lw / 2 + 5, 0], [-lw / 2 - 5, 0]];
        for (var si = 0; si < shifts.length; si++) {
          var ox = shifts[si][0], oy = shifts[si][1];
          var bx = { x1: q.x - lw / 2 + ox, x2: q.x + lw / 2 + ox, y1: q.y - lh / 2 + oy, y2: q.y + lh / 2 + oy, cx: q.x + ox, cy: q.y + oy };
          var ov = 0;
          boxes.forEach(function (o) { ov += overlap(bx, o) * 3; });
          placed.forEach(function (o) { ov += overlap(bx, o) * 2; });
          linePts.forEach(function (q2) { if (q2.e !== ei && q2.x > bx.x1 && q2.x < bx.x2 && q2.y > bx.y1 && q2.y < bx.y2) ov += 25; });
          if (bx.x1 < 2 || bx.x2 > W - 2 || bx.y1 < 2 || bx.y2 > H - 2) ov += 500;
          ov += si && !shortEdge ? 4 : 0;
          if (ov < bo) { bo = ov; best = bx; }
          if (ov === 0) return true;
        }
        return false;
      });
      placed.push(best);
      labels += '<text x="' + best.cx.toFixed(1) + '" y="' + (best.cy + labFs * 0.36).toFixed(1) + '" text-anchor="middle" class="elab" style="fill:' + col + ';opacity:' + (faded ? 0.2 : 1) + '">' + esc(txt) + '</text>';
    });
    var nodes = res.chars.map(function (c, i) {
      var P = pos[i], dead = !c.alive;
      var sel = tl.who.indexOf(i) >= 0;
      return '<g class="node" data-act="node" data-i="' + i + '" tabindex="0" role="button" aria-label="' + esc(c.name) + 'の経過を絞り込む" style="cursor:pointer">' +
        '<circle cx="' + P.x.toFixed(1) + '" cy="' + P.y.toFixed(1) + '" r="' + NR + '" class="nodebg" style="--c:' + pc(i) + ';stroke:' + pc(i) + ';stroke-width:' + (sel ? 5 : big ? 2 : 3) + ';opacity:' + (dead ? 0.6 : 1) + '"' + (dead ? ' stroke-dasharray="4 3"' : '') + '/>' +
        (HK.Icons.url(c.name) ? '<g style="opacity:' + (dead ? 0.55 : 1) + (dead ? ';filter:grayscale(1)' : '') + '">' + HK.Icons.svg(c.name, i, P.x, P.y, NR - 1.5, i) + '</g>' :
        '<text x="' + P.x.toFixed(1) + '" y="' + (P.y + (big ? 4 : 6)).toFixed(1) + '" text-anchor="middle" style="fill:' + pc(i) + ';font-weight:700;font-size:' + (big ? 12 : 17) + 'px">' + esc(HK.Icons.initial(c.name)) + '</text>') +
        '<text x="' + P.x.toFixed(1) + '" y="' + (P.y + NR + (big ? 13 : 19)).toFixed(1) + '" text-anchor="middle" class="nlab" style="fill:var(--ink);font-size:' + nameFs + 'px;font-weight:600">' + esc(shortName(c)) + '</text>' +
        '<text x="' + P.x.toFixed(1) + '" y="' + (P.y + NR + (big ? 25 : 35)).toFixed(1) + '" text-anchor="middle" class="nlab" style="fill:var(--muted);font-size:' + fateFs + 'px">' + esc(c.fate) + '</text></g>';
    }).join('');
    return '<svg viewBox="0 0 ' + W.toFixed(0) + ' ' + H.toFixed(0) + '" role="img" aria-label="関係図"><style>.nodebg{fill:var(--surface);fill:color-mix(in srgb,var(--c) 16%,var(--surface))}.elab{font-size:' + labFs + 'px;font-weight:700;paint-order:stroke;stroke:var(--sand);stroke-width:4px;stroke-linejoin:round}.nlab{paint-order:stroke;stroke:var(--sand);stroke-width:3.5px;stroke-linejoin:round}</style>' + defs + edges + nodes + labels + '</svg>';
  }

  /* ---------- ペアの推移グラフ ---------- */
  function spark(p, res) {
    var s = p.series.filter(Boolean), n = s.length;
    if (!n) return '';
    var W = 300, H = 54, mid = 27;
    var X = function (i) { return n === 1 ? W / 2 : 4 + i * (W - 8) / (n - 1); };
    var Y = function (v) { return mid - v / 100 * 23; };
    function line(idx, style) {
      return '<polyline fill="none" points="' + s.map(function (v, i) { return X(i).toFixed(1) + ',' + Y(v[idx]).toFixed(1); }).join(' ') + '" style="' + style + '"/>';
    }
    var last = s[n - 1];
    return '<svg class="spark" viewBox="0 0 ' + W + ' ' + H + '" preserveAspectRatio="none" aria-hidden="true">' +
      '<line x1="0" x2="' + W + '" y1="' + mid + '" y2="' + mid + '" style="stroke:var(--line);stroke-width:1"/>' +
      line(2, 'stroke:var(--enemy);stroke-width:1.3;stroke-dasharray:3 3;vector-effect:non-scaling-stroke') +
      line(0, 'stroke:' + pc(p.a) + ';stroke-width:2;vector-effect:non-scaling-stroke') +
      line(1, 'stroke:' + pc(p.b) + ';stroke-width:2;vector-effect:non-scaling-stroke') +
      '<circle cx="' + X(n - 1) + '" cy="' + Y(last[0]) + '" r="2.6" style="fill:' + pc(p.a) + '"/>' +
      '<circle cx="' + X(n - 1) + '" cy="' + Y(last[1]) + '" r="2.6" style="fill:' + pc(p.b) + '"/></svg>';
  }

  function tieName(t, res) {
    var D = HK.TIES[t.type];
    if (!D) return '';
    return D.dir ? res.chars[t.a].name + 'が' + D.roleA + 'の' + D.label : D.label;
  }

  function pairCard(p, res) {
    var A = res.chars[p.a], B = res.chars[p.b], L = res.log;
    var tieLabel = p.tie ? tieName(p.tie, res) : '';
    var pred = p.tie
      ? (p.surprise ? 'もともと<b>「' + esc(tieLabel) + '」</b>だったのに「' + esc(p.name) + '」に変わった。' : 'もともと：<b>' + esc(tieLabel) + '</b>　相性予想：' + esc(p.base.kindLabel))
      : p.surprise
      ? '相性予想は<b>「' + esc(p.base.kindLabel) + '」</b>だったのに「' + esc(p.name) + '」に落ち着いた。'
      : '相性予想：<b>' + esc(p.base.kindLabel) + '</b>';
    var notes = p.base.notes.length ? '<br>' + p.base.notes.map(esc).join('／') : '';
    var keys = p.key.map(function (n) {
      var e = L[n];
      return '<li><span class="st">' + esc(e.label) + '</span>' + paint(e.text, res) + (e.why ? '<span class="why">' + esc(e.why) + '</span>' : '') + '</li>';
    }).join('');
    var r = p.rel;
    return '<article class="pcard' + (p.surprise ? ' sur' : '') + '">' +
      '<div class="hd"><span class="avpair">' + av(res, p.a, 34) + av(res, p.b, 34) + '</span><span class="nm">' + esc(A.name) + ' × ' + esc(B.name) + '</span>' + (p.tie ? '<span class="tiechip">' + esc(p.tie.label) + ' →</span>' : '') + '<span class="lbl ' + p.cls + '">' + esc(p.name) + '</span>' + (p.surprise ? '<span class="surtag">意外</span>' : '') + '</div>' +
      '<div class="txt">' + paint(p.text, res) + '</div>' +
      '<div class="pred">' + pred + notes + '</div>' +
      spark(p, res) +
      '<div class="sparkleg"><span style="color:' + pc(p.a) + '">― ' + esc(A.name) + '→' + esc(B.name) + ' 好意</span><span style="color:' + pc(p.b) + '">― ' + esc(B.name) + '→' + esc(A.name) + ' 好意</span><span style="color:var(--enemy)">┄ 緊張</span></div>' +
      '<div class="nums">' + esc(A.name) + '→ 好意' + r.ab.aff + ' 信頼' + r.ab.trust + ' 惹かれ' + r.ab.att + ' 緊張' + r.ab.ten + '<br>' + esc(B.name) + '→ 好意' + r.ba.aff + ' 信頼' + r.ba.trust + ' 惹かれ' + r.ba.att + ' 緊張' + r.ba.ten + '</div>' +
      (keys ? '<ul class="keys">' + keys + '</ul>' : '') +
      '<div><button class="btn small" data-act="pairfilter" data-a="' + p.a + '" data-b="' + p.b + '">この二人の経過を見る</button></div>' +
      '</article>';
  }

  function tieNotes(c, res) {
    return res.pairs.filter(function (p) { return p.tie && (p.a === c.i || p.b === c.i); }).map(function (p) {
      var o = res.chars[p.a === c.i ? p.b : p.a];
      return o.name + 'とは、もともと「' + tieName(p.tie, res) + '」。結末は「' + p.name + '」' + (p.surprise ? '（意外）' : '') + '。';
    });
  }

  function charCard(c, res) {
    var stats = Object.keys(c.stats || {}).map(function (k) {
      var def = (HK.SCENARIOS[res.scenId].stats || []).filter(function (s) { return s.id === k; })[0];
      return (def ? def.label : k) + c.stats[k];
    }).join('・');
    var odd = c.odd.map(function (n) {
      var e = res.log[n];
      return '<div class="oddl">らしくない瞬間　<span class="nums">' + esc(e.label) + '</span>　' + paint(e.text, res) + '</div>';
    }).join('');
    return '<article class="ccard"><div class="hd">' + av(res, c.i, 40, c.alive === false ? 'gone' : '') + '<span class="nm">' + esc(c.name) + '</span><span class="fate ' + fateCls(c.fate) + '">' + esc(c.fate) + '</span></div>' +
      (c.fateNote ? '<div class="sub">' + paint(c.fateNote, res) + '</div>' : '') +
      '<div class="sub">' + esc(c.type) + '　初動「' + esc(c.action) + '」　目標「' + esc(c.goal) + '」' + (stats ? '　' + esc(stats) : '') + (c.weapon ? '　武器「' + esc(c.weapon) + '」' : '') + '</div>' +
      '<ul>' + tieNotes(c, res).concat(c.notes).map(function (t) { return '<li>' + paint(t, res) + '</li>'; }).join('') + '</ul>' + odd + '</article>';
  }

  /* ---------- 時系列 ---------- */
  function keySet(res) {
    var s = {};
    res.pairs.forEach(function (p) { p.key.forEach(function (n) { s[n] = 1; }); });
    return s;
  }
  function timeline(res) {
    var ks = keySet(res), groups = [], cur = null;
    res.log.forEach(function (e) {
      if (e.kind === 'step') { cur = { label: e.label, items: [] }; groups.push(cur); return; }
      if (!cur) { cur = { label: '', items: [] }; groups.push(cur); }
      if (tl.who.length) {
        var all = tl.who.every(function (w) { return e.actors.indexOf(w) >= 0; });
        if (!all) return;
      }
      if (tl.keyOnly && !(ks[e.n] || e.kind === 'death' || e.odd || e.mag >= 25 || e.goal || e.goalExit)) return;
      if (tl.cat !== 'all' && e.cat !== tl.cat && e.kind !== 'death') return;
      cur.items.push(e);
    });
    var html = groups.filter(function (g) { return g.items.length; }).map(function (g) {
      return '<div class="stepblk"><div class="when">' + esc(g.label) + '</div><ol>' + g.items.map(function (e) {
        var cls = 'ev' + (e.kind === 'event' && e.cat ? ' cat-' + e.cat : '') + (e.trouble ? ' trouble' : '') + (e.kind === 'phase' ? ' phase' : '') + (e.kind === 'death' ? ' death' : '') + (ks[e.n] ? ' key' : '') + (e.goal || e.goalExit ? ' goal' : '') + (e.goalExit ? ' exit' : '');
        var chip = e.kind === 'event' ? '<span class="c cc-' + esc(e.cat) + '">' + esc(HK.CAT_NAME[e.cat] || e.cat) + '</span>' : '';
        /* 出られない部屋：条件を満たした・扉が開いた出来事の札 */
        if (e.goal || e.goalExit) chip = (e.goal || []).map(function (g) { return '<span class="goalb">条件達成：' + esc(g) + '</span>'; }).join('') + (e.goalExit ? '<span class="goalb exitb">扉が開いた</span>' : '') + chip;
        var who = (e.actors || []).slice(0, 3);
        var avs = who.length ? '<span class="avs">' + who.map(function (i) { return av(res, i, 26); }).join('') + '</span>' : '';
        return '<li class="' + cls + (avs ? ' hasav' : '') + (avs && e.kind === 'event' && /「/.test(e.text) ? ' talk' : '') + '">' + avs + '<div class="evb">' + chip + paint(e.text, res) + (e.odd ? '<span class="oddb">らしくない</span>' : '') + (e.why ? '<span class="why">' + esc(e.why) + '</span>' : '') + '</div></li>';
      }).join('') + '</ol></div>';
    }).join('');
    return html || '<p class="hint">条件に合う出来事はありません。</p>';
  }
  function tlBar(res) {
    var who = res.chars.map(function (c) {
      return '<button class="chip whochip" data-act="who" data-i="' + c.i + '" aria-pressed="' + (tl.who.indexOf(c.i) >= 0) + '">' + av(res, c.i, 20) + esc(c.name) + '</button>';
    }).join('');
    var cats = ['all', 'romance', 'bond', 'help', 'conflict', 'combat', 'betray', 'solo', 'escape'];
    var used = {};
    res.log.forEach(function (e) { used[e.cat] = 1; });
    var sel = '<select id="tlcat" aria-label="種類で絞り込む">' + cats.filter(function (c) { return c === 'all' || used[c]; }).map(function (c) {
      return '<option value="' + c + '"' + (tl.cat === c ? ' selected' : '') + '>' + (c === 'all' ? 'すべての種類' : HK.CAT_NAME[c]) + '</option>';
    }).join('') + '</select>';
    return '<div class="tlbar">' + who + (tl.who.length ? '<button class="btn small ghost" data-act="whoclear">絞り込みを解除</button>' : '') +
      '<span class="spacer"></span>' + sel + '<button class="chip" data-act="keyonly" aria-pressed="' + tl.keyOnly + '">決め手と転機だけ</button></div>';
  }

  /* ---------- 全体 ---------- */
  V.resetFilter = function () { tl = { who: [], keyOnly: false, cat: 'all' }; };

  V.render = function (host, res, opts) {
    var fresh = res && res !== lastRes;
    lastRes = res; lastHost = host; lastOpts = opts || {};
    if (fresh && !res.solo) { var sc0 = HK.SCENARIOS[res.scenId]; if (sc0 && sc0.longRun && sc0.longRun(res.env)) tl.keyOnly = true; }
    if (!res) { host.innerHTML = emptyState(lastOpts); return; }
    if (res.solo && HK.DView) { HK.DView.render(host, res, lastOpts, historyBlock(lastOpts.history || [])); return; }
    var scen = HK.SCENARIOS[res.scenId];
    var envChips = scen.env.concat(HK.GLOBAL_ENV).map(function (e) {
      var v = res.env[e.id];
      var shown = e.type === 'select' ? (e.options.filter(function (o) { return o.v === v; })[0] || {}).label : v + (e.unit || '');
      return '<span class="chip">' + esc(e.label) + '：' + esc(shown) + '</span>';
    }).join('');
    var sur = res.pairs.filter(function (p) { return p.surprise; });
    var rest = res.pairs.filter(function (p) { return !p.surprise; });
    var strangers = rest.filter(function (p) { return p.label === 'strangers'; }).length;
    rest = rest.filter(function (p) { return p.label !== 'strangers'; });
    if (sur.length > 12 && !lastOpts.showAll) sur = sur.slice(0, 12);
    var limit = lastOpts.showAll ? Math.min(rest.length, 120) : (res.chars.length > 12 ? 9 : 6);
    var html =
      '<div class="resulthead"><div><h2>' + esc(scen.name) + '</h2><div class="meta">シード <span class="num">' + res.seed + '</span>　' + Math.ceil(res.stepCount / (scen.perUnit || 1)) + esc(scen.unit === '月' ? 'か月' : scen.unit === '日' ? '日' : scen.unit === '時間' ? '時間' : '区切り') + '経過' + (res.outcome ? '　' + esc(res.outcome) : '') + '</div>' + (scen.note ? '<div class="meta scnote">' + esc(scen.note) + '</div>' : '') + '</div><span class="spacer"></span>' +
      '<div class="row"><button class="btn primary" data-act="reroll">別の運命で動かす</button><button class="btn" data-act="copytext">結果をテキストでコピー</button><button class="btn" data-act="gobox">条件を変える</button></div></div>' +
      endingBlock(res) +
      '<div class="uses" style="margin-top:12px">' + envChips + '</div>' +
      '<h2 class="sec">関係図</h2><figure class="trayfig"><div class="tray" id="map">' + mapSvg(res) + '</div><figcaption><span>住人の丸を押すと、その人の経過に絞り込めます。＊は意外な組み合わせ。矢印は気持ちや行為の向き。</span><span>砂箱 57×72×7cm</span></figcaption></figure>' +
      factionBlock(res) +
      (sur.length ? '<h2 class="sec">意外な組み合わせ</h2><p class="hint">エゴグラム上の相性予想と、箱庭での結末が食い違ったペアです。解釈の掘りどころ。</p><div class="cards">' + sur.map(function (p) { return pairCard(p, res); }).join('') + '</div>' : '') +
      '<h2 class="sec">関係の結末</h2><div class="cards">' + rest.slice(0, limit).map(function (p) { return pairCard(p, res); }).join('') + '</div>' +
      (rest.length > limit ? '<div class="more"><button class="btn" data-act="showall">残り' + (rest.length - limit) + '組を表示</button></div>' : '') +
      (strangers ? '<p class="hint" style="margin-top:8px">ほかに「他人のまま」の組が' + strangers + '組あります。住人の丸を押すと、その人の関係だけを図で追えます。</p>' : '') +
      '<h2 class="sec">住人ごとの読み解き</h2><div class="cards">' + res.chars.map(function (c) { return charCard(c, res); }).join('') + '</div>' +
      '<h2 class="sec" id="tlhead">時系列</h2>' + (scen.longRun && scen.longRun(res.env) ? '<p class="hint">長期間のため、最初は重要な出来事だけの短縮版で表示しています。「決め手と転機だけ」を外すと全部見られます。</p>' : '') + '<div id="tlbar">' + tlBar(res) + '</div><div class="tl" id="tl">' + timeline(res) + '</div>' +
      historyBlock(lastOpts.history || []);
    host.innerHTML = html;
  };

  V.refreshTimeline = function () {
    if (!lastRes || !lastHost) return;
    var m = lastHost.querySelector('#map'), b = lastHost.querySelector('#tlbar'), t = lastHost.querySelector('#tl');
    if (m) m.innerHTML = mapSvg(lastRes);
    if (b) b.innerHTML = tlBar(lastRes);
    if (t) t.innerHTML = timeline(lastRes);
  };
  V.toggleWho = function (i) {
    var k = tl.who.indexOf(i);
    if (k >= 0) tl.who.splice(k, 1); else tl.who.push(i);
    V.refreshTimeline();
  };
  V.setWho = function (arr) { tl.who = arr.slice(); V.refreshTimeline(); };
  V.toggleKey = function () { tl.keyOnly = !tl.keyOnly; V.refreshTimeline(); };
  V.setCat = function (c) { tl.cat = c; V.refreshTimeline(); };

  /* ---------- 結末 ---------- */
  function endingBlock(res) {
    if (!HK.Endings) return '';
    var E = HK.Endings.build(res);
    return '<section class="ending" aria-label="結末"><div class="eyebrow">結末</div><p class="ehead">' + paint(E.headline, res) + '</p>' +
      (E.stats.length ? '<dl class="estats">' + E.stats.map(function (s) { return '<div><dt>' + esc(s[0]) + '</dt><dd>' + esc(s[1]) + '</dd></div>'; }).join('') + '</dl>' : '') +
      (E.lines.length ? '<ul class="elines">' + E.lines.map(function (l) { return '<li>' + paint(l, res) + '</li>'; }).join('') + '</ul>' : '') + (E.after || '') + '</section>';
  }

  /* ---------- 派閥 ---------- */
  function groupChips(g, res, regime) {
    return '<span class="fgroup' + (regime === 'dictator' ? ' dict' : '') + '"><b>' + av(res, g.leader, 20) + esc(res.chars[g.leader].name) + '派</b>' +
      g.members.filter(function (m) { return m !== g.leader; }).map(function (m) { return '<span>' + av(res, m, 20) + esc(res.chars[m].name) + '</span>'; }).join('') + '</span>';
  }
  function factionBlock(res) {
    var F = res.factions;
    if (!F) return '';
    var R = HK.Factions.REGIME, h = F.hist;
    var last = h.length ? h[h.length - 1] : null;
    var ever = h.some(function (x) { return x.groups.length; });
    var peak = h.reduce(function (m, x) { return x.groups.length > (m ? m.groups.length : -1) ? x : m; }, null);
    var head;
    if (!last) head = '派閥が動く前に終わった。';
    else if (!ever) head = '派閥は一度も生まれなかった。' + (last.reason ? last.reason + '。' : '');
    else head = '最終的な体制：<b>' + esc(R[last.regime]) + '</b>' + (last.reason ? '。' + esc(last.reason) : '') + (last.regime === 'none' ? '' : '');
    var now = last && last.groups.length ? '<div class="frow">' + last.groups.map(function (g) { return groupChips(g, res, last.regime); }).join('') +
      (last.loners.length ? '<span class="fgroup lone"><b>無所属</b>' + last.loners.map(function (m) { return '<span>' + av(res, m, 20) + esc(res.chars[m].name) + '</span>'; }).join('') + '</span>' : '') + '</div>' : '';
    var rows = h.map(function (x) {
      return '<li><span class="st">' + esc(x.label) + '</span><span class="rg">' + esc(R[x.regime]) + '</span>' +
        (x.groups.length ? x.groups.map(function (g) { return esc(res.chars[g.leader].name) + '派（' + g.members.length + '）'; }).join('　') + (x.loners.length ? '　無所属' + x.loners.length : '') : '') + '</li>';
    }).join('');
    return '<h2 class="sec">派閥</h2><p class="hint">' + F.min + '人以上いるときだけ派閥が生まれる設定。人を引っぱる気質（CP・A高／AC低）の人物と、その人への信頼が揃うと輪ができる。</p>' +
      '<div class="panel fpanel"><p class="fhead">' + head + '</p>' + now +
      (ever && peak && peak !== last ? '<p class="hint" style="margin:8px 0 0">最も分裂したのは' + esc(peak.label) + '（' + esc(R[peak.regime]) + '）。</p>' : '') +
      (rows ? '<ol class="fhist">' + rows + '</ol>' : '') + '</div>';
  }

  function emptyState() {
    return '<div class="empty panel"><div class="t">箱庭はまだ空っぽです</div><p>住人と箱庭を選んで「箱庭を動かす」を押すと、ここに関係図・ペアごとの結末・時系列が並びます。</p><button class="btn primary" data-act="run">いまの条件で動かす</button></div>' + historyBlock(lastOpts.history || []);
  }

  function historyBlock(h) {
    if (!h.length) return '';
    return '<h2 class="sec">これまでの箱庭</h2><p class="hint">同じ条件とシードで再現します。名簿は書き換えません。</p><div class="hist">' + h.map(function (it, k) {
      var d = new Date(it.t);
      var when = (d.getMonth() + 1) + '/' + d.getDate() + ' ' + ('0' + d.getHours()).slice(-2) + ':' + ('0' + d.getMinutes()).slice(-2);
      return '<button class="btn" data-act="hist" data-k="' + k + '"><span class="when">' + when + '</span><b>' + esc(it.scenName) + '</b><span>' + esc(it.names) + '</span><span class="nums">シード ' + it.seed + '</span>' + (it.summary ? '<span class="hint" style="margin:0">' + esc(it.summary) + '</span>' : '') + '</button>';
    }).join('') + '</div>';
  }

  /* テキスト書き出し */
  V.toText = function (res) {
    if (res.solo && HK.DView) return HK.DView.toText(res);
    var scen = HK.SCENARIOS[res.scenId], L = [];
    L.push('【箱庭シミュレーター】' + scen.name + '（シード ' + res.seed + '）');
    if (HK.Endings) {
      var E = HK.Endings.build(res);
      L.push('');
      L.push('■ 結末');
      L.push(E.headline);
      if (E.stats.length) L.push(E.stats.map(function (s) { return s[0] + ' ' + s[1]; }).join('／'));
      E.lines.forEach(function (l) { L.push('・' + l); });
    }
    L.push('');
    L.push('■ 住人の結末');
    res.chars.forEach(function (c) { L.push('・' + c.name + '：' + c.fate + (c.fateNote ? '（' + c.fateNote + '）' : '')); });
    L.push('');
    L.push('■ 関係');
    res.pairs.forEach(function (p) {
      L.push('・' + res.chars[p.a].name + '×' + res.chars[p.b].name + '：' + p.name + (p.surprise ? '［意外］' : '') + '　' + p.text);
      p.key.forEach(function (n) { L.push('　　' + res.log[n].label + '　' + res.log[n].text); });
    });
    L.push('');
    L.push('■ 時系列');
    res.log.forEach(function (e) {
      if (e.kind === 'step') L.push('― ' + e.label);
      else L.push('　' + e.text);
    });
    return L.join('\n');
  };
})();
