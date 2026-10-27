/* 箱庭シミュレーター view-map: 関係図の派閥の囲み・線の絞り込みと間引き、クラスメイトの「学年・クラス」の図
   view.js の mapSvg から呼ばれる（HK.MapView.layout / pick / drawn / subset / subRes）。結果画面の図の上のチップ（data-act="mapf"）と
   絞り込みのプルダウン（data-act="mapsub"：全員／派閥ごと／個人ごと＝その人と直接の関係がある人。スマホで大人数の図が見づらいときに）もここで受ける */
(function () {
  'use strict';
  var HK = window.HK, esc = HK.escape, V = HK.View;
  if (!V || !V._map) return;
  var U = V._map, tw = U.tw;
  var M = (HK.MapView = {});

  /* ---------- 状態（結果ごとに初期化） ---------- */
  /* 既定（auto）：12人以上は「派閥の中は描かない＋恋愛・対立・家族と立場」。11人以下は線が少ないので、これまでどおり全部描く */
  var st = { res: null, mode: 'auto', inner: false, stat: null, sub: 'all' };
  function few(res) { return res.chars.length < 12; }
  /* 絞り込み中は、元の結果（res._base）を鍵にする（絞った結果は描くたびに作り直すので） */
  function S(res) { var b = res._base || res; if (st.res !== b) st = { res: b, mode: 'auto', inner: few(b), stat: null, sub: 'all' }; return st; }
  /* 派閥の色（住人の色と別にして、派閥どうしを見分けやすく） */
  /* 色は index.html の --fc0〜--fc5（白黒それぞれ。色の量が「藍のみ／キャラ色」なら藍） */
  var FCOL = ['var(--fc0,#e8590c)', 'var(--fc1,#1c7ed6)', 'var(--fc2,#2b8a3e)', 'var(--fc3,#ae3ec9)', 'var(--fc4,#c92a2a)', 'var(--fc5,#0c8599)'];
  function fcol(res, g) { var k = M.groups(res).indexOf(g); return FCOL[(k < 0 ? 0 : k) % FCOL.length]; }
  var cache = typeof WeakMap === 'function' ? new WeakMap() : null;
  function memo(res, key, fn) {
    if (!cache) return fn();
    var o = cache.get(res);
    if (!o) { o = {}; cache.set(res, o); }
    if (!(key in o)) o[key] = fn();
    return o[key];
  }

  /* ---------- 派閥（なければ、関係のラベルで同じ人に集まる塊） ---------- */
  var HUB_CLS = { guard: 1, partner: 1 };
  function famTie(p) { var D = p.tie && HK.TIES && HK.TIES[p.tie.type]; return !!(D && D.family); }
  M.groups = function (res) {
    return memo(res, 'groups', function () {
      var n = res.chars.length, out = [];
      if (n < 3) return out;
      var F = res.factions, src = null;
      if (F) {
        if (F.final && F.final.groups && F.final.groups.length) src = F.final;
        else if (F.hist && F.hist.length && F.hist[F.hist.length - 1].groups.length) src = F.hist[F.hist.length - 1];
      }
      if (src) {
        src.groups.forEach(function (g) {
          var mem = g.members.filter(function (m) { return res.chars[m]; });
          if (mem.length < 2) return;
          out.push({ leader: g.leader, members: mem, name: res.chars[g.leader].name + '派', kind: 'faction', dict: src.regime === 'dictator' });
        });
        return out;
      }
      if (F || n < 8) return out;
      /* 派閥のない箱庭：「庇護と依存」「相棒」「共犯」などが3本以上集まる人を中心に、輪として囲む */
      var links = res.chars.map(function () { return []; });
      res.pairs.forEach(function (p) {
        if (!HUB_CLS[p.cls] || p.label === 'kinbond' || famTie(p)) return;
        links[p.a].push({ o: p.b, v: p.intensity }); links[p.b].push({ o: p.a, v: p.intensity });
      });
      var hubs = res.chars.map(function (c, i) { return i; }).filter(function (i) { return links[i].length >= 3; })
        .sort(function (a, b) { return links[b].length - links[a].length || a - b; });
      var taken = {};
      hubs.forEach(function (h) {
        if (taken[h] || out.length >= 4) return;
        var mem = links[h].slice().sort(function (x, y) { return y.v - x.v; }).map(function (x) { return x.o; }).filter(function (o) { return !taken[o]; });
        if (mem.length < 3) return;
        taken[h] = 1; mem.forEach(function (o) { taken[o] = 1; });
        out.push({ leader: h, members: [h].concat(mem), name: res.chars[h].name + 'の輪', kind: 'ring' });
      });
      return out;
    });
  };
  /* 図で囲むか：少人数で、ほぼ全員が一つの派閥なら、囲んでも意味がないので従来の並べ方 */
  function hullOn(res) {
    var G = M.groups(res), n = res.chars.length;
    return G.length > 0 && !(n < 12 && G.length === 1 && G[0].members.length >= n - 1);
  }
  function groupOf(res) {
    return memo(res, 'gof', function () {
      var g = {};
      M.groups(res).forEach(function (G, k) { G.members.forEach(function (m) { g[m] = k; }); });
      return g;
    });
  }

  /* ---------- 線の種類 ---------- */
  var ROLE = { teacher: 1, boss: 1, master: 1, mentor: 1, benefactor: 1, parent: 1, pparent: 1, senpai: 1 };
  /* ---------- 絞り込み（プルダウン）：全員／派閥ごと／個人ごと ---------- */
  /* 個人：その人と、直接の関係がある人（強い順に11人まで。恋愛・家族は優先） */
  var SUB_MAX = 12;
  function around(res, i) {
    var cand = [];
    res.pairs.forEach(function (p) {
      if (p.label === 'strangers' || (p.a !== i && p.b !== i)) return;
      var o = p.a === i ? p.b : p.a;
      if (!res.chars[o]) return;
      var D = p.tie && HK.TIES && HK.TIES[p.tie.type], fam = !!(D && D.family);
      var w = (p.cls === 'love' ? 1000 : 0) + (fam ? 800 : 0) + (p.cls === 'enemy' || p.cls === 'kill' || p.cls === 'obsess' ? 400 : 0) + (p.surprise ? 200 : 0) + (p.intensity || 0);
      var had = cand.filter(function (c) { return c.o === o; })[0];
      if (had) had.w = Math.max(had.w, w); else cand.push({ o: o, w: w });
    });
    cand.sort(function (x, y) { return y.w - x.w || x.o - y.o; });
    return [i].concat(cand.slice(0, SUB_MAX - 1).map(function (c) { return c.o; })).sort(function (a, b) { return a - b; });
  }
  /* いま選ばれている絞り込みの住人（元の番号の配列）。全員なら null */
  M.subset = function (res) {
    var s = S(res), v = s.sub || 'all', G = M.groups(res);
    if (v === 'all' || res.chars.length < 3) return null;
    var m = /^g:(\d+)$/.exec(v);
    if (m) { var g = G[+m[1]]; return g && g.members.length >= 2 ? g.members.slice().sort(function (a, b) { return a - b; }) : null; }
    m = /^p:(\d+)$/.exec(v);
    if (m && res.chars[+m[1]]) { var out = around(res, +m[1]); return out.length >= 2 ? out : null; }
    return null;
  };
  /* 絞った人だけの結果（番号を詰め直す。res._base に元の結果、res._orig[k] に元の番号） */
  M.subRes = function (res, sub) {
    var map = {}; sub.forEach(function (i, k) { map[i] = k; });
    var chars = sub.map(function (i) { return res.chars[i]; });
    var pairs = [];
    res.pairs.forEach(function (p) {
      if (map[p.a] == null || map[p.b] == null) return;
      var q = Object.create(p); q.a = map[p.a]; q.b = map[p.b]; q.dir = p.dir != null && map[p.dir] != null ? map[p.dir] : (p.dir == null ? p.dir : null);
      pairs.push(q);
    });
    var F = null, G = M.groups(res);
    if (G.length && G[0].kind === 'faction') {
      var gs = [];
      G.forEach(function (g) {
        if (map[g.leader] == null) return;
        var mem = g.members.filter(function (m) { return map[m] != null; }).map(function (m) { return map[m]; });
        if (mem.length >= 2) gs.push({ leader: map[g.leader], members: mem, regime: g.dict ? 'dictator' : undefined });
      });
      F = { final: { groups: gs.map(function (g) { return { leader: g.leader, members: g.members }; }), regime: gs.some(function (g) { return g.regime; }) ? 'dictator' : undefined } };
    }
    var r2 = Object.create(res);
    r2.chars = chars; r2.pairs = pairs; r2.factions = F; r2._base = res; r2._orig = sub;
    return r2;
  };
  /* 絞り込みの選択肢 */
  function subSelect(res) {
    var s = S(res), G = M.groups(res), ring = G.length && G[0].kind === 'ring';
    var o = '<option value="all"' + (s.sub === 'all' ? ' selected' : '') + '>全員（' + res.chars.length + '人）</option>';
    if (G.length) {
      o += '<optgroup label="' + (ring ? 'まとまりごと' : '派閥ごと') + '">' + G.map(function (g, k) {
        return '<option value="g:' + k + '"' + (s.sub === 'g:' + k ? ' selected' : '') + '>' + esc(g.name) + '（' + g.members.length + '人）</option>';
      }).join('') + '</optgroup>';
    }
    o += '<optgroup label="個人ごと（その人と、直接の関係がある人）">' + res.chars.map(function (c, i) {
      return '<option value="p:' + i + '"' + (s.sub === 'p:' + i ? ' selected' : '') + '>' + esc(c.name) + '</option>';
    }).join('') + '</optgroup>';
    return '<label class="mapsub"><span class="hint" style="margin:0">絞り込み：</span><select data-act="mapsub" aria-label="関係図の絞り込み">' + o + '</select></label>';
  }
  function subNote(res) {
    var sub = M.subset(res), s = S(res);
    if (!sub) return '';
    var m = /^p:(\d+)$/.exec(s.sub || '');
    if (m) return res.chars[+m[1]].name + 'と、直接の関係がある' + (sub.length - 1) + '人だけを表示' + (sub.length >= SUB_MAX ? '（強い関係から' + (SUB_MAX - 1) + '人まで）' : '') + '。';
    var g = M.groups(res)[+(/^g:(\d+)$/.exec(s.sub) || [])[1]];
    return (g ? g.name : '選んだまとまり') + 'の' + sub.length + '人だけを表示。';
  }

  function tags(p) {
    var t = {};
    if (p.cls === 'love' || p.cls === 'pine' || p.cls === 'night') t.love = 1;
    if (p.cls === 'obsess') { t.love = 1; t.obsess = 1; }
    if (p.cls === 'enemy' || p.cls === 'kill') t.enemy = 1;
    if (p.label === 'kinbond' || p.label === 'kinfeud' || famTie(p)) t.kin = 1;
    if (p.tie && ROLE[p.tie.type]) { t.role = 1; if (p.tie.type !== 'senpai') t.kin = 1; }
    /* 仲間（グループの「仲間」）：ほかの印がなければ、線の絞り込みが「全部」のときだけ薄い線で出す */
    if (p.tie && p.tie.comrade) t.comrade = 1;
    return t;
  }
  var MODES = [
    { id: 'all', label: '全部' },
    { id: 'love', label: '恋愛だけ' },
    { id: 'enemy', label: '対立だけ' },
    { id: 'kin', label: '家族・立場だけ' }
  ];
  function inMode(p, mode, cross, small) {
    var t = tags(p);
    if (mode === 'all' || (mode === 'auto' && small)) return true;
    if (mode === 'love') return !!t.love;
    if (mode === 'enemy') return !!t.enemy;
    if (mode === 'kin') return !!(t.kin || t.role);
    /* 既定：恋愛・対立・執着・家族と立場（先輩後輩は除く）。派閥と派閥をまたぐ線は、友人以外ならすべて */
    return !!(t.love || t.enemy || t.kin) || (cross && p.cls !== 'friend' && p.cls !== 'none');
  }

  /* 図に描く線を選ぶ：派閥の中は省く・種類で絞る・大人数では一人あたり強い順に4本まで（残りは薄い点線） */
  M.pick = function (res, pairs, focus, big) {
    var hasG = hullOn(res), s = S(res), gof = hasG ? groupOf(res) : {}, small = few(res);
    /* 一つの派閥だけに絞っているときは、派閥の中の線を省くと何も残らないので描く */
    var gOnly = !!(res._base && /^g:/.test(s.sub || ''));
    var draw = [], faint = [], hidden = { inner: 0, kind: 0, thin: 0, comrade: 0 }, mates = [];
    var cand = [];
    pairs.forEach(function (p) {
      var ga = gof[p.a], gb = gof[p.b], same = ga != null && ga === gb, cross = ga != null && gb != null && ga !== gb;
      var mine = focus != null && (p.a === focus || p.b === focus);
      /* 仲間だけの線（恋愛・対立・家族・立場の印がない）：既定では省き、「全部」のときは薄い線 */
      var tg = tags(p);
      if (tg.comrade && !tg.love && !tg.enemy && !tg.kin && !tg.role && (p.cls === 'friend' || p.cls === 'none' || p.cls === 'partner' || p.label === 'strangers' || p.label === 'friends' || p.label === 'partners')) {
        if (s.mode === 'all' && mates.length < 40) mates.push(p); else hidden.comrade++;
        return;
      }
      if (mine) { if (s.mode === 'auto' || inMode(p, s.mode, cross, small)) cand.push({ p: p, must: true }); else hidden.kind++; return; }
      /* 派閥の中は描かない（恋人・両片想いなど、はっきりした恋愛の線だけは残す） */
      if (same && !s.inner && !gOnly && !(p.cls === 'love' && s.mode !== 'enemy' && s.mode !== 'kin')) { hidden.inner++; return; }
      if (!inMode(p, s.mode, cross, small)) { hidden.kind++; return; }
      cand.push({ p: p });
    });
    /* 恋人などの線を先に、あとは意外さ・強さの順 */
    cand.sort(function (x, y) { return (!!y.must - !!x.must) || ((y.p.cls === 'love') - (x.p.cls === 'love')) || (y.p.surprise - x.p.surprise) || (y.p.intensity - x.p.intensity); });
    var cap = big || res.chars.length >= 12 ? 4 : 99, deg = {};
    cand.forEach(function (x) {
      var p = x.p, da = deg[p.a] || 0, db = deg[p.b] || 0;
      if (x.must || (da < cap && db < cap)) { draw.push(p); deg[p.a] = da + 1; deg[p.b] = db + 1; return; }
      /* 間引いた線：恋愛・対立・家族だけ薄い点線で残し、ほかは省く */
      var t = tags(p);
      if ((t.love || t.enemy || t.kin) && faint.length < 40) faint.push(p); else hidden.thin++;
    });
    s.stat = { hidden: hidden, hasG: hasG, mates: mates.length };
    return { draw: draw, faint: faint.concat(mates) };
  };
  M.drawn = function (res, d) { var s = S(res); s.drawn = d; };

  /* ---------- 配置：派閥ごとの塊＋残りを外周に ---------- */
  M.layout = function (res, big, base) {
    var n = res.chars.length, G = M.groups(res);
    var B = base(n, big);
    if (!G.length || n < 3) return B;
    if (!hullOn(res)) return B;
    var NR = B.NR, below = B.below, lw = B.lw;
    var sp = big ? 86 : 112, R0 = big ? 80 : 104, vis = (below - NR) / 2;
    var halfW = lw / 2 + 4, halfH = (below + NR) / 2 + 2;
    var pos = new Array(n), gof = groupOf(res);
    /* 派閥の中：リーダーを真ん中に、残りを同心円に */
    var circ = G.map(function (g) {
      var rest = g.members.filter(function (m) { return m !== g.leader; }), local = {}, k = 0, ring = 1, maxR = 0;
      local[g.leader] = { x: 0, y: 0 };
      while (k < rest.length) {
        var cap = Math.max(1, Math.floor(2 * Math.PI * ring * R0 / sp)), take = Math.min(cap, rest.length - k);
        for (var j = 0; j < take; j++) {
          var a = -Math.PI / 2 + (j / take) * Math.PI * 2 + (ring % 2 ? 0 : Math.PI / take);
          local[rest[k + j]] = { x: Math.cos(a) * ring * R0, y: Math.sin(a) * ring * R0 * 0.92 };
        }
        maxR = ring * R0; k += take; ring++;
      }
      return { g: g, local: local, r: maxR + Math.max(halfW, halfH) + 12, x: 0, y: 0 };
    });
    /* 派閥の円どうしを、重ならないように押し広げる（簡単な力学配置） */
    var order = circ.slice().sort(function (a, b) { return b.r - a.r; });
    order.forEach(function (c, k) {
      if (!k) return;
      var a = -Math.PI / 2 + k * 2.39996;
      c.x = Math.cos(a) * (order[0].r + c.r + 30); c.y = Math.sin(a) * (order[0].r + c.r + 30) * 0.8;
    });
    for (var it = 0; it < 80; it++) {
      for (var i = 0; i < circ.length; i++) for (var j = i + 1; j < circ.length; j++) {
        var A = circ[i], Bc = circ[j], dx = Bc.x - A.x, dy = Bc.y - A.y, d = Math.sqrt(dx * dx + dy * dy) || 0.01, need = A.r + Bc.r + 56;
        if (d < need) { var push = (need - d) / 2; A.x -= dx / d * push; A.y -= dy / d * push; Bc.x += dx / d * push; Bc.y += dy / d * push; }
      }
      circ.forEach(function (c) { c.x *= 0.97; c.y *= 0.95; });
    }
    for (var it2 = 0; it2 < 20; it2++) {
      for (var i2 = 0; i2 < circ.length; i2++) for (var j2 = i2 + 1; j2 < circ.length; j2++) {
        var A2 = circ[i2], B2 = circ[j2], dx2 = B2.x - A2.x, dy2 = B2.y - A2.y, d2 = Math.sqrt(dx2 * dx2 + dy2 * dy2) || 0.01, need2 = A2.r + B2.r + 56;
        if (d2 < need2) { var push2 = (need2 - d2) / 2; A2.x -= dx2 / d2 * push2; A2.y -= dy2 / d2 * push2; B2.x += dx2 / d2 * push2; B2.y += dy2 / d2 * push2; }
      }
    }
    circ.forEach(function (c) { Object.keys(c.local).forEach(function (m) { pos[+m] = { x: c.x + c.local[m].x, y: c.y + c.local[m].y - vis }; }); });
    /* 無所属の人：外周に、いちばん強い関係の相手の方角へ寄せて並べる */
    var lone = res.chars.map(function (c, i) { return i; }).filter(function (i) { return gof[i] == null; });
    var cx = 0, cy = 0, tot = 0;
    circ.forEach(function (c) { cx += c.x * c.r; cy += c.y * c.r; tot += c.r; });
    cx /= tot; cy /= tot;
    var Rall = 0;
    circ.forEach(function (c) { Rall = Math.max(Rall, Math.sqrt(Math.pow(c.x - cx, 2) + Math.pow(c.y - cy, 2)) + c.r); });
    if (lone.length) {
      var Rl = Math.max(Rall + halfH + 26, lone.length * sp / (2 * Math.PI));
      var want = lone.map(function (i) {
        var best = null, bv = -1;
        res.pairs.forEach(function (p) {
          if (p.label === 'strangers' || (p.a !== i && p.b !== i)) return;
          var o = p.a === i ? p.b : p.a;
          if (gof[o] == null || p.intensity <= bv) return;
          bv = p.intensity; best = o;
        });
        return { i: i, a: best != null ? Math.atan2(pos[best].y + vis - cy, pos[best].x - cx) : null };
      });
      var known = want.filter(function (w) { return w.a != null; }).sort(function (x, y) { return x.a - y.a; });
      var unk = want.filter(function (w) { return w.a == null; });
      /* 方角の決まらない人は、決まった人のあいだに均等に挟む */
      var seq = [];
      if (!known.length) seq = unk;
      else {
        var per = unk.length / known.length, u = 0, acc = 0;
        known.forEach(function (w) { seq.push(w); acc += per; while (u < unk.length && acc >= 1) { seq.push(unk[u++]); acc -= 1; } });
        while (u < unk.length) seq.push(unk[u++]);
      }
      var L = seq.length, off = 0;
      if (known.length) {
        var sx = 0, sy = 0;
        seq.forEach(function (w, k) { if (w.a == null) return; var d = w.a - (2 * Math.PI * k / L); sx += Math.cos(d); sy += Math.sin(d); });
        off = Math.atan2(sy, sx);
      } else off = -Math.PI / 2;
      seq.forEach(function (w, k) {
        var a = off + 2 * Math.PI * k / L;
        pos[w.i] = { x: cx + Math.cos(a) * Rl, y: cy + Math.sin(a) * Rl - vis };
      });
      /* 外周の人どうし・派閥の円と重ならないように少しずつ離す */
      for (var it3 = 0; it3 < 40; it3++) {
        lone.forEach(function (i) {
          var P = pos[i];
          for (var j = 0; j < n; j++) {
            if (j === i || !pos[j]) continue;
            var Q = pos[j], ox = 2 * halfW + 6 - Math.abs(P.x - Q.x), oy = 2 * halfH + 4 - Math.abs(P.y - Q.y);
            if (ox > 0 && oy > 0) {
              var mv = gof[j] == null ? 0.5 : 1;
              if (ox < oy) P.x += (P.x >= Q.x ? 1 : -1) * ox * mv; else P.y += (P.y >= Q.y ? 1 : -1) * oy * mv;
            }
          }
          /* 派閥の円（上側は名札の分も）の外へ出す */
          circ.forEach(function (c) {
            var dx = P.x - c.x, dy = P.y + vis - c.y, d = Math.sqrt(dx * dx + dy * dy) || 0.01, need = c.r + halfH + 10 + (dy < 0 ? 24 * Math.min(1, -dy / d * 1.5) : 0);
            if (d < need) { P.x += dx / d * (need - d); P.y += dy / d * (need - d); }
          });
        });
      }
    }
    /* 全体を枠に収める（派閥の名札の分も） */
    var x1 = 1e9, y1 = 1e9, x2 = -1e9, y2 = -1e9;
    function ext(a, b, c, d) { x1 = Math.min(x1, a); y1 = Math.min(y1, b); x2 = Math.max(x2, c); y2 = Math.max(y2, d); }
    pos.forEach(function (P) { ext(P.x - halfW, P.y - NR - 4, P.x + halfW, P.y + below); });
    var hl = circ.map(function (c) { return { c: c, txt: c.g.name + (c.g.dict ? '（独裁）' : '') + '　リーダー：' + res.chars[c.g.leader].name + '・' + c.g.members.length + '人' }; });
    hl.forEach(function (h) { var w = tw(h.txt, 12) + 16; ext(h.c.x - h.c.r, h.c.y - h.c.r - 26, h.c.x + h.c.r, h.c.y + h.c.r); ext(h.c.x - w / 2, h.c.y - h.c.r - 26, h.c.x + w / 2, h.c.y); });
    var pad = 14, W = Math.max(big ? 860 : 640, x2 - x1 + pad * 2), H = y2 - y1 + pad * 2;
    var tx = pad - x1 + (W - (x2 - x1 + pad * 2)) / 2, ty = pad - y1;
    pos = pos.map(function (P) { return { x: P.x + tx, y: P.y + ty }; });
    var under = '', over = '', taken = [];
    hl.forEach(function (h) {
      var c = h.c, col = fcol(res, c.g), X = c.x + tx, Y = c.y + ty, hw = tw(h.txt, 12) / 2 + 4;
      taken.push({ x1: X - hw, x2: X + hw, y1: Y - c.r - 22, y2: Y - c.r - 2 });
      under += '<circle class="fhull" cx="' + X.toFixed(1) + '" cy="' + Y.toFixed(1) + '" r="' + c.r.toFixed(1) + '" style="--c:' + col + ';stroke:' + col + '"' + (c.g.kind === 'ring' ? ' stroke-dasharray="7 5"' : '') + '/>';
      over += '<text class="fhlab" x="' + X.toFixed(1) + '" y="' + (Y - c.r - 8).toFixed(1) + '" text-anchor="middle" style="fill:' + col + '">' + esc(h.txt) + '</text>';
      var L0 = pos[c.g.leader];
      over += '<g aria-hidden="true"><circle cx="' + (L0.x + NR * 0.78).toFixed(1) + '" cy="' + (L0.y - NR * 0.78).toFixed(1) + '" r="7.5" style="fill:' + col + ';stroke:var(--sand);stroke-width:1.5"/><text x="' + (L0.x + NR * 0.78).toFixed(1) + '" y="' + (L0.y - NR * 0.78 + 3.6).toFixed(1) + '" text-anchor="middle" style="fill:var(--paper,#fff);font-size:10px;font-weight:700">★</text></g>';
    });
    return { W: W, H: H, NR: NR, below: below, lw: lw, pos: pos, under: under, over: over, taken: taken, groups: G };
  };

  /* ---------- 図の上のチップと注記 ---------- */
  M.bar = function (res) {
    var s = S(res), n = res.chars.length;
    if (n < 3) return '';
    var hasG = hullOn(res);
    var chips = MODES.map(function (m) {
      return '<button class="chip" data-act="mapf" data-m="' + m.id + '" aria-pressed="' + (s.mode === m.id) + '">' + esc(m.label) + '</button>';
    }).join('') + (hasG && !/^g:/.test(s.sub || '') ? '<button class="chip" data-act="mapf" data-m="inner" aria-pressed="' + !!s.inner + '">派閥の中も見る</button>' : '');
    var h = s.stat ? s.stat.hidden : null, d = s.drawn || {};
    var now = s.mode === 'auto' ? (few(res) ? '全部の線' : '恋愛・対立・家族と立場の線' + (hasG && !/^g:/.test(s.sub || '') ? '（派閥どうしの線も。派閥の中は恋人などだけ）' : '')) : (MODES.filter(function (m) { return m.id === s.mode; })[0] || {}).label + 'の線';
    var parts = [];
    if (d.lines != null) parts.push('線' + d.lines + '本');
    if (d.faint) parts.push('薄い点線' + d.faint + '本（一人あたり強い順に4本まで）');
    if (h && h.inner && hasG && !s.inner && !/^g:/.test(s.sub || '')) parts.push('派閥の中の' + h.inner + '本は省略');
    if (h && h.kind) parts.push('ほかの種類' + h.kind + '本は非表示');
    if (h && h.thin) parts.push('弱い' + h.thin + '本は省略');
    if (s.stat && s.stat.mates) parts.push('仲間の薄い線' + s.stat.mates + '本');
    else if (h && h.comrade) parts.push('仲間の線' + h.comrade + '本は「全部」で薄く表示');
    if (d.labSkip) parts.push('重なるラベル' + d.labSkip + '個は省略');
    var sn = subNote(res);
    return '<div class="mapbar">' + subSelect(res) + '</div><div class="mapbar"><span class="hint" style="margin:0">線：</span>' + chips +
      (s.mode !== 'auto' || s.inner !== few(res) ? '<button class="btn small ghost" data-act="mapf" data-m="auto">既定に戻す</button>' : '') + '</div>' +
      '<p class="hint mapnote">' + esc(sn) + 'いまは' + esc(now) + 'を表示。' + esc(parts.join('・')) + (parts.length ? '。' : '') + (hasG ? '丸の囲みは派閥（★がリーダー）。' : '') + '</p>';
  };
  document.addEventListener('change', function (ev) {
    var t = ev.target.closest && ev.target.closest('select[data-act="mapsub"]');
    if (!t || !st.res) return;
    st.sub = t.value || 'all';
    V.refreshTimeline();
  });
  document.addEventListener('click', function (ev) {
    var t = ev.target.closest && ev.target.closest('[data-act="mapf"]');
    if (!t || !st.res) return;
    var m = t.getAttribute('data-m');
    if (m === 'inner') st.inner = !st.inner;
    else if (m === 'auto') { st.mode = 'auto'; st.inner = few(st.res); }
    else st.mode = st.mode === m ? 'auto' : m;
    V.refreshTimeline();
  });

  /* ---------- 学年・クラスの図（クラスメイト） ---------- */
  function lovers(res) {
    var L = {};
    res.pairs.forEach(function (p) {
      if (p.cls !== 'love' || p.label === 'pining') return;
      (L[p.a] = L[p.a] || []).push(p.b); (L[p.b] = L[p.b] || []).push(p.a);
    });
    return L;
  }
  function roster(res) {
    var all = res.env && res.env.grade === 'all', inp = res.input || {}, per = inp.perChar || [];
    var teachers = [], st2 = [];
    res.chars.forEach(function (c, i) {
      var pk = per[i] || {}, role = pk.role || '';
      if (role === 'teacher' || c.fate === '担任') { teachers.push(i); return; }
      var g = c.grade != null ? +c.grade : all ? (+((pk.pick || {}).grade) || 2) : (+(res.env && res.env.grade) || 2);
      st2.push({ i: i, g: g, k: (pk.pick || {}).klass || (pk.pick || {}).cls || '' });
    });
    var grades = all ? [1, 2, 3] : [+(res.env && res.env.grade) || 2];
    return { all: all, teachers: teachers, students: st2, grades: grades };
  }
  M.classChart = function (res) {
    if (res.scenId !== 'classroom' || !res.chars.length) return '';
    var R = roster(res), G = M.groups(res), gof = groupOf(res), LV = lovers(res);
    var tName = R.teachers.map(function (i) { return res.chars[i].name; }).join('・');
    function cell(i) {
      var c = res.chars[i], fg = gof[i] != null ? G[gof[i]] : null, lv = LV[i] || [];
      var ring = fg ? fcol(res, fg) : 'transparent';
      var st3 = c.outLabel && c.outLabel !== c.fate ? c.outLabel : '';
      return '<li class="kcell' + (fg ? ' inf' : '') + '" style="--fc:' + ring + '" title="' + esc(c.name + (fg ? '（' + fg.name + (fg.leader === i ? '・リーダー' : '') + '）' : '') + (lv.length ? '　恋人：' + lv.map(function (o) { return res.chars[o].name; }).join('・') : '')) + '">' +
        '<span class="kav' + (lv.length ? ' lv' : '') + '">' + U.av(res, i, 34, c.alive === false ? 'gone' : '') + (fg && fg.leader === i ? '<i class="kstar" style="background:' + ring + '">★</i>' : '') + '</span>' +
        '<span class="kname">' + esc(c.name) + '</span>' +
        '<span class="fate ' + U.fateCls(c.fate || '') + '">' + esc(c.fate || '―') + '</span>' + (st3 ? '<span class="ksub">' + esc(st3) + '</span>' : '') +
        (lv.length ? '<span class="klv">♥ ' + esc(lv.map(function (o) { return res.chars[o].name; }).join('・')) + '</span>' : '') + '</li>';
    }
    var frames = R.grades.map(function (g) {
      var list = R.students.filter(function (s) { return s.g === g; });
      /* 派閥ごとにまとめて並べる（リーダーが先頭） */
      list.sort(function (a, b) {
        var ga = gof[a.i] == null ? 99 : gof[a.i], gb = gof[b.i] == null ? 99 : gof[b.i];
        if (ga !== gb) return ga - gb;
        var la = ga < 99 && G[ga].leader === a.i ? 0 : 1, lb = gb < 99 && G[gb].leader === b.i ? 0 : 1;
        return la - lb || a.i - b.i;
      });
      var klasses = {};
      list.forEach(function (s) { (klasses[s.k || ''] = klasses[s.k || ''] || []).push(s); });
      var ks = Object.keys(klasses);
      if (!ks.length) ks = [''];
      var body = ks.map(function (k) {
        var l = klasses[k] || [];
        return '<div class="kroom"><div class="khd">' + (k ? esc(k) : (R.all ? '1クラス' : 'クラス')) + (!R.all && tName ? '<span class="kt">担任：' + esc(tName) + '</span>' : '') + '<span class="kn">' + l.length + '人</span></div>' +
          (l.length ? '<ul class="kgrid">' + l.map(function (s) { return cell(s.i); }).join('') + '</ul>' : '<p class="hint" style="margin:6px 0">この学年の住人はいません。</p>') + '</div>';
      }).join('');
      return '<section class="kgrade"><h3>' + (R.all ? g + '年生' : '高校' + g + '年') + '</h3>' + body + '</section>';
    }).join('');
    var legend = (G.length ? G.map(function (g) { return '<span class="kleg"><i style="border-color:' + fcol(res, g) + '"></i>' + esc(g.name) + '</span>'; }).join('') : '') +
      (Object.keys(LV).length ? '<span class="kleg"><b class="klvm">♥</b>恋人</span>' : '');
    return '<h2 class="sec">学年・クラス</h2><div class="panel kpanel">' +
      (R.all ? '<p class="hint" style="margin:0 0 8px">学園全体（1〜3年生）。縁の色は派閥、♥は恋人。</p>' +
        (R.teachers.length ? '<div class="kteach">担任' + R.teachers.map(function (i) { return '<span>' + U.av(res, i, 24) + esc(res.chars[i].name) + '</span>'; }).join('') + '</div>' : '') : '<p class="hint" style="margin:0 0 8px">縁の色は派閥、♥は恋人。</p>') +
      '<div class="kframes">' + frames + '</div><div class="klegend">' + legend + '</div></div>';
  };

  /* ---------- テキスト書き出し ---------- */
  M.textLines = function (res) {
    var L = [], G = M.groups(res), nm = function (i) { return res.chars[i].name; };
    if (G.length) {
      L.push('');
      L.push(G[0].kind === 'ring' ? '■ 関係のまとまり' : '■ 派閥');
      G.forEach(function (g) { L.push('・' + g.name + (g.dict ? '（独裁）' : '') + '：リーダー ' + nm(g.leader) + '／メンバー ' + g.members.filter(function (m) { return m !== g.leader; }).map(nm).join('・')); });
      var gof = groupOf(res), lone = res.chars.filter(function (c) { return gof[c.i] == null; }).map(function (c) { return c.name; });
      if (lone.length && G[0].kind !== 'ring') L.push('・無所属：' + lone.join('・'));
    }
    if (res.scenId === 'classroom' && res.chars.length) {
      var R = roster(res);
      L.push('');
      L.push('■ 学年・クラス' + (R.all ? '（学園全体）' : ''));
      if (R.teachers.length) L.push('・担任：' + R.teachers.map(nm).join('・'));
      R.grades.forEach(function (g) {
        var l = R.students.filter(function (s) { return s.g === g; });
        L.push('・' + (R.all ? g + '年生' : '高校' + g + '年') + '（1クラス・' + l.length + '人）：' + (l.length ? l.map(function (s) { var c = res.chars[s.i]; return c.name + '（' + (c.fate || '―') + '）'; }).join('、') : 'なし'));
      });
    }
    return L;
  };

  /* ---------- 見た目（index.html は書き換えないので、ここで足す） ---------- */
  var css = '.fhull{fill:var(--surface);fill:color-mix(in srgb,var(--c) 9%,transparent);stroke-width:1.6;stroke-opacity:.55}' +
    '.fhlab{font-size:12px;font-weight:700;paint-order:stroke;stroke:var(--sand);stroke-width:4px;stroke-linejoin:round}' +
    '.mapbar{display:flex;flex-wrap:wrap;gap:6px;align-items:center;margin:0 0 6px}.mapnote{margin:0 0 6px;font-size:11px}' +
    '.mapsub{display:inline-flex;align-items:center;gap:6px;max-width:100%}.mapsub select{max-width:min(100%,320px);font-size:13px;padding:4px 6px}' +
    '.kpanel{padding:12px}.kframes{display:grid;gap:10px;grid-template-columns:repeat(auto-fit,minmax(280px,1fr))}' +
    '.kgrade{border:1px solid var(--line);border-radius:var(--r-card,6px);background:var(--bg1,var(--bg));padding:8px 10px;min-width:0}.kgrade h3{margin:0 0 6px;font-size:14px}' +
    '.kroom+.kroom{margin-top:8px}.khd{display:flex;gap:8px;align-items:baseline;font-size:12px;color:var(--muted);margin-bottom:6px;flex-wrap:wrap}.khd .kn{margin-left:auto}.khd .kt{color:var(--ink);font-weight:600}' +
    '.kgrid{list-style:none;margin:0;padding:0;display:grid;gap:6px;grid-template-columns:repeat(auto-fill,minmax(82px,1fr))}' +
    '.kcell{display:flex;flex-direction:column;align-items:center;gap:2px;padding:6px 3px 5px;border-radius:var(--r,4px);background:var(--paper,var(--surface));border:1px solid var(--line);text-align:center;min-width:0}' +
    '.kcell.inf{border-color:var(--fc);box-shadow:inset 0 0 0 1.5px var(--fc)}' +
    '.kav{position:relative;display:inline-flex;border-radius:50%}.kav.lv{box-shadow:0 0 0 2px var(--surface),0 0 0 4px var(--love)}' +
    '.kstar{position:absolute;right:-5px;top:-5px;width:15px;height:15px;border-radius:50%;color:var(--paper,#fff);font-size:9px;font-style:normal;line-height:15px;text-align:center}' +
    '.kname{font-size:12px;font-weight:600;max-width:100%;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.kcell .fate{font-size:10px;padding:0 5px}' +
    '.ksub{font-size:10px;color:var(--muted2,var(--muted))}.klv{font-size:10px;color:var(--love);max-width:100%;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}' +
    '.kteach{display:flex;flex-wrap:wrap;gap:10px;align-items:center;font-size:12px;color:var(--muted);margin:0 0 8px}.kteach span{display:inline-flex;align-items:center;gap:4px;color:var(--ink);font-weight:600}' +
    '.klegend{display:flex;flex-wrap:wrap;gap:12px;margin-top:8px;font-size:11px;color:var(--muted2,var(--muted))}.kleg{display:inline-flex;align-items:center;gap:4px}' +
    '.kleg i{display:inline-block;width:12px;height:12px;border-radius:3px;border:2px solid}.klvm{color:var(--love)}';
  function addCss() {
    if (document.getElementById('hk-view-map-css')) return;
    var el = document.createElement('style'); el.id = 'hk-view-map-css'; el.textContent = css;
    (document.head || document.documentElement).appendChild(el);
  }
  if (document.head) addCss(); else document.addEventListener('DOMContentLoaded', addCss);
})();
