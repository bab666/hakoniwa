/* 箱庭シミュレーター view: 結果（関係図・ペア・住人・時系列・履歴）の描画 */
(function () {
  'use strict';
  var HK = window.HK, esc = HK.escape;
  var V = (HK.View = {});
  var CLS_VAR = { love: '--love', pine: '--pine', night: '--night', obsess: '--obsess', enemy: '--enemy', kill: '--kill', partner: '--partner', friend: '--friend', guard: '--guard', none: '--none' };
  /* 関係図の線の形（仕様 5）：色がなくても種類が分かるように、太さ・破線・矢印・× で描き分ける（色は「フル」のときだけ関係の色。ほかは藍） */
  var LINE_W = { love: 3.5, obsess: 3.5, partner: 2, friend: 1.2, pine: 1.2, guard: 1.5, enemy: 1.5, kill: 2.5, night: 1.2, none: 1 };
  var LINE_DASH = { enemy: '5 4', kill: '6 4', night: '2 4' };
  /* 凡例の並びと名前（恋人と執着は同じ線） */
  var LEG = [['love', '恋人・執着'], ['partner', '相棒'], ['friend', '友人'], ['pine', '片想い'], ['guard', '守護'], ['enemy', '敵対'], ['kill', '殺害'], ['night', '一夜']];
  var tl = { who: [], keyOnly: false, cat: 'all', lewd: false };
  var lastRes = null, lastHost = null, lastOpts = null;

  function pc(i) { return 'var(--p' + (i % 30) + ')'; }
  function dot(i) { return '<span class="dot" style="background:' + pc(i) + '"></span>'; }
  function av(res, i, size, extra) { var c = res.chars[i]; return c ? HK.Icons.html(c.name, i, size, extra) : ''; }

  /* 本文中のキャラ名に色をつける */
  function paint(text, res, seg) {
    /* 山場の長い描写は段落（改行）で区切ってある。長い文は段落と台詞で改行する（HK.fmtLong。記録の seg があれば台詞の塊を seg から取る） */
    var list = res.chars.map(function (c) { return { n: esc(c.name), i: c.i }; }).sort(function (a, b) { return b.n.length - a.n.length; });
    var t = esc(HK.fmtLong ? HK.fmtLong(text, res.chars.map(function (c) { return c.name; }), seg) : text).replace(/\n/g, '<br>');
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

  /* ---------- 重要な出来事（転機・情事・死亡。--hot の赤で示す。表示だけで記録は変えない） ---------- */
  /* ターン番号（区切りの通し番号。T01〜） */
  function tno(step) { return step == null || isNaN(step) ? '' : 'T' + (step < 9 ? '0' : '') + (step + 1); }
  /* 組の転機：決め手（p.key）のうち、関係の節目の札（付き合い始めた・別れたなど）のある出来事、なければ動きの大きい出来事。他人のまま・変化なしの組は持たない */
  function turnOf(p, res) {
    if (!p.key || !p.key.length || p.label === 'strangers' || p.cls === 'none') return null;
    var best = null, bs = -1;
    p.key.forEach(function (n) {
      var e = res.log[n];
      if (!e) return;
      var sc = (e.mark && e.mark.length ? 1000 : 0) + Math.abs(e.mag || 0);
      if (sc > bs) { bs = sc; best = n; }
    });
    return best;
  }
  /* 結果ごとに一度だけ数える：組ごとの転機（tp）と、全体でいちばん大きい転機（top） */
  var hotMemo = typeof WeakMap === 'function' ? new WeakMap() : null;
  function hotInfo(res) {
    var H = hotMemo && hotMemo.get(res);
    if (H) return H;
    H = { tp: {}, top: null };
    var bs = -1;
    res.pairs.forEach(function (p) {
      var n = turnOf(p, res);
      if (n == null) return;
      H.tp[n] = 1;
      var e = res.log[n], sc = (e.mark && e.mark.length ? 1000 : 0) + Math.abs(e.mag || 0);
      if (sc > bs || (sc === bs && n < H.top)) { bs = sc; H.top = n; }
    });
    if (hotMemo) hotMemo.set(res, H);
    return H;
  }
  /* 情事（エロシーン）は R18 版で全年齢モードでないときだけ */
  function lewdHot(e) { return !HK.SAFE_ON && !!HK.lewdEvent && HK.lewdEvent(e); }
  function isHot(e, H) { return e.kind === 'death' || !!(e.mark && e.mark.length) || !!H.tp[e.n] || lewdHot(e); }
  /* 重要な出来事の種類（担当HZ 2026-10-28。表示だけ）：死亡＞情事＞転機＞目標＞トラブル の順で一つに決める。li に hot-○○ と data-hot を付け、
     index.html の時系列の節が細い枠（藍のみ・キャラ色は線の種類、フルは種類ごとの薄い背景と左の縁）を描く。.hot（赤の点・太字）は今までどおり 死亡・情事・転機 だけ */
  var HOT_ORDER = ['death', 'lewd', 'turn', 'goal', 'trouble'];
  var HOT_NAME = { death: '死亡', turn: '転機', goal: '目標', trouble: 'トラブル' };
  var HOT_TIP = { death: '死亡・全滅・陥落', turn: '組の転機・関係の節目（付き合い始めた・別れた など）', goal: '条件達成・扉が開いた・脱出・勝利など、箱庭の目標', trouble: '襲撃・故障・危機などの大きなトラブル' };
  /* r18:begin */
  HOT_NAME.lewd = '情事'; HOT_TIP.lewd = '情事（R18 の場面）';
  /* r18:end */
  var HOT_GOAL = /脱出|抜け出|救(?:っ|い|出|助)|成功|勝利|撃破|討伐|踏破|生還|帰還|達成|優勝|解決|判明|手がかり|真相|回避/;
  var HOT_DEATH = /^(?:死|全滅|弔い|処刑|殉|最期|陥落|発狂)/;
  function hotKind(e, H) {
    if (!e || e.kind === 'step' || e.kind === 'phase') return '';
    if (e.kind === 'death') return 'death';
    if (lewdHot(e)) return 'lewd';
    if ((e.mark && e.mark.length) || H.tp[e.n]) return 'turn';
    if (e.goal || e.goalExit || (e.cat === 'escape' && (e.mag || 0) >= 40)) return 'goal';
    if (e.trouble || (e.cat === 'combat' && Math.abs(e.mag || 0) >= 25)) return 'trouble';
    return '';
  }
  /* ひとり用の記録（dungeon-view.js の #dgtl・solo-story-kit.js の #sttl）：決め手（key）・山場（climax）・死・トラブルの印のある出来事だけ */
  V.hotKindSolo = function (e, res) {
    if (!e || e.kind === 'step' || e.kind === 'phase') return '';
    var tag = String(e.tag || ''), dead = HOT_DEATH.test(tag);
    if (!(e.key || e.kind === 'climax' || e.trouble || dead)) return '';
    if (dead) return 'death';
    if (lewdHot(e)) return 'lewd';
    var why = '';
    if (e.key && res && res.turns) res.turns.forEach(function (t) { if (t.n === e.n) why += t.why || ''; });
    if (HOT_GOAL.test(tag + ' ' + why)) return 'goal';
    if (e.trouble) return 'trouble';
    return 'turn';
  };
  /* 時系列の見出しの凡例：その結果に出る種類だけ。フルは色の小さな四角、藍のみ・キャラ色は線の種類の見本（index.html の .hotleg .hk） */
  function hotLegendOf(seen) {
    var ks = HOT_ORDER.filter(function (k) { return seen[k] && HOT_NAME[k]; });
    if (!ks.length) return '';
    return '<span class="hotleg" role="note" aria-label="重要な出来事の見分け方"><span class="hkl">重要</span>' + ks.map(function (k) {
      return '<span class="hk" data-hot="' + k + '" title="' + esc(HOT_TIP[k]) + '"><i aria-hidden="true"></i>' + esc(HOT_NAME[k]) + '</span>';
    }).join('') + '</span>';
  }
  V.hotLegendSolo = function (res) {
    var seen = {};
    (res && res.log || []).forEach(function (e) { var k = V.hotKindSolo(e, res); if (k) seen[k] = 1; });
    return hotLegendOf(seen);
  };

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
  /* 関係図の時点（最終／開始時／転機。view-map.js の HK.MapView.atRes）：その時点の結果。最終・時点の記録がない結果はそのまま */
  function atOf(res) { return HK.MapView && HK.MapView.atRes ? HK.MapView.atRes(res) : res; }
  function mapSvg(res) {
    res = atOf(res);
    /* 派閥の囲み・線の絞り込み・間引き（view-map.js）。なければ従来どおり楕円に並べる */
    var MV = HK.MapView;
    /* 絞り込み（全員／派閥ごと／個人ごと）：絞った人だけの結果 R で描き、丸の番号・色は元の番号（orig）に戻す */
    var sub = MV && MV.subset ? MV.subset(res) : null, R = sub ? MV.subRes(res, sub) : res;
    var orig = function (k) { return sub ? sub[k] : k; };
    var n = R.chars.length, big = n > 12;
    var focus = tl.who.length === 1 ? (sub ? (sub.indexOf(tl.who[0]) < 0 ? null : sub.indexOf(tl.who[0])) : tl.who[0]) : null;
    var LY = MV ? MV.layout(R, big, mapLayout) : mapLayout(n, big), W = LY.W, H = LY.H, NR = LY.NR, pos = LY.pos;
    var defs = '<defs>' + Object.keys(CLS_VAR).map(function (k) {
      return '<marker id="ar-' + k + '" viewBox="0 0 10 10" refX="9" refY="5" markerUnits="userSpaceOnUse" markerWidth="11" markerHeight="11" orient="auto-start-reverse"><path d="M1.5,1.5 L9,5 L1.5,8.5" fill="none" style="stroke:var(' + CLS_VAR[k] + ');stroke-width:1.6;stroke-linecap:round;stroke-linejoin:round"/></marker>';
    }).join('') + '</defs>';
    /* 住人の丸と、その下の名前・結末の文字が占める範囲 */
    var nameFs = big ? 11 : 13, fateFs = big ? 9 : 11;
    var shortName = function (c) { return c.name.length > (big ? 6 : 8) ? c.name.slice(0, big ? 6 : 8) + '…' : c.name; };
    var boxes = R.chars.map(function (c, i) {
      var P = pos[i], w = Math.max(NR * 2 + 4, tw(shortName(c), nameFs), tw(c.fate || '', fateFs)) + 6;
      return { x1: P.x - w / 2, x2: P.x + w / 2, y1: P.y - NR - 3, y2: P.y + LY.below - 2 };
    });
    var edges = '', labels = '', placed = (LY.taken || []).slice(), xmarks = [];
    var pairs = R.pairs.filter(function (p) { return p.label !== 'strangers'; });
    var faint = [];
    if (MV) { var pk = MV.pick(R, pairs, focus, big, LY); pairs = pk.draw.concat(pk.faint); faint = pk.faint; }
    else if (big) {
      /* 大人数では、強い関係と意外な関係だけを描く（選択中の人物の線は全部） */
      pairs = pairs.filter(function (p) { return p.cls !== 'friend' && p.cls !== 'none' && p.label !== 'awkward' || p.surprise || (focus != null && (p.a === focus || p.b === focus)); })
        .sort(function (a, b) { return (b.surprise - a.surprise) || (b.intensity - a.intensity); });
      var keep = pairs.slice(0, 70);
      if (focus != null) pairs.forEach(function (p) { if ((p.a === focus || p.b === focus) && keep.indexOf(p) < 0) keep.push(p); });
      pairs = keep;
    }
    /* 強い関係から先にラベルの場所を取る（薄い点線は最後に） */
    pairs = pairs.slice().sort(function (a, b) { return ((faint.indexOf(a) >= 0) - (faint.indexOf(b) >= 0)) || (b.surprise - a.surprise) || (b.intensity - a.intensity); });
    var labSkip = 0;
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
      /* 間引いた線は、細い点線だけ（ラベル・矢印なし） */
      if (faint.indexOf(p) >= 0) { edges += '<path d="M' + s0.x.toFixed(1) + ',' + s0.y.toFixed(1) + ' Q' + c.x.toFixed(1) + ',' + c.y.toFixed(1) + ' ' + s1.x.toFixed(1) + ',' + s1.y.toFixed(1) + '" fill="none" class="efaint" style="stroke:var(' + CLS_VAR[p.cls] + ');stroke-width:1;opacity:' + (faded ? 0.08 : 0.32) + '" stroke-dasharray="2 4"/>'; return; }
      var wdt = LINE_W[p.cls] || 1.2, dash = LINE_DASH[p.cls];
      var col = 'var(' + CLS_VAR[p.cls] + ')';
      var straight = Math.abs(c.x - (from.x + to.x) / 2) < 0.5 && Math.abs(c.y - (from.y + to.y) / 2) < 0.5;
      var d = straight ? 'M' + s0.x.toFixed(1) + ',' + s0.y.toFixed(1) + ' L' + s1.x.toFixed(1) + ',' + s1.y.toFixed(1)
        : 'M' + s0.x.toFixed(1) + ',' + s0.y.toFixed(1) + ' Q' + c.x.toFixed(1) + ',' + c.y.toFixed(1) + ' ' + s1.x.toFixed(1) + ',' + s1.y.toFixed(1);
      edges += '<path d="' + d + '" fill="none" class="rl ' + p.cls + '" style="stroke:' + col + ';stroke-width:' + wdt + ';opacity:' + (faded ? 0.15 : 0.9) + '"' + (dash ? ' stroke-dasharray="' + dash + '"' : '') + (p.dir != null ? ' marker-end="url(#ar-' + p.cls + ')"' : '') + '/>';
      /* 殺害：線の中ほどに × */
      if (p.cls === 'kill') {
        var xm = qpt(s0, c, s1, 0.5);
        edges += '<path d="M' + (xm.x - 5).toFixed(1) + ',' + (xm.y - 5).toFixed(1) + ' L' + (xm.x + 5).toFixed(1) + ',' + (xm.y + 5).toFixed(1) + ' M' + (xm.x + 5).toFixed(1) + ',' + (xm.y - 5).toFixed(1) + ' L' + (xm.x - 5).toFixed(1) + ',' + (xm.y + 5).toFixed(1) + '" fill="none" class="rx" style="stroke:' + col + ';stroke-width:2.2;stroke-linecap:round;opacity:' + (faded ? 0.15 : 1) + '"/>';
        xmarks.push({ x1: xm.x - 7, x2: xm.x + 7, y1: xm.y - 7, y2: xm.y + 7 });
      }
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
          xmarks.forEach(function (o) { ov += overlap(bx, o) * 2; });
          linePts.forEach(function (q2) { if (q2.e !== ei && q2.x > bx.x1 && q2.x < bx.x2 && q2.y > bx.y1 && q2.y < bx.y2) ov += 25; });
          if (bx.x1 < 2 || bx.x2 > W - 2 || bx.y1 < 2 || bx.y2 > H - 2) ov += 500;
          ov += si && !shortEdge ? 4 : 0;
          if (ov < bo) { bo = ov; best = bx; }
          if (ov === 0) return true;
        }
        return false;
      });
      /* ほかのラベルとどうしても重なるときは、弱いほうのラベルを省く（線は残す） */
      if (MV && placed.some(function (o) { return overlap(best, o) > 0; })) { labSkip++; return; }
      placed.push(best);
      labels += '<text x="' + best.cx.toFixed(1) + '" y="' + (best.cy + labFs * 0.36).toFixed(1) + '" text-anchor="middle" class="elab" style="fill:' + col + ';opacity:' + (faded ? 0.2 : 1) + '">' + esc(txt) + '</text>';
    });
    var st8 = nodeStates(res);
    var nodes = R.chars.map(function (c, k) {
      var P = pos[k], i = orig(k), ns = st8[i] || '', dead = ns === 'gone';
      var sel = tl.who.indexOf(i) >= 0;
      var sw = sel ? (big ? 4 : 5) : ns === 'bold' ? (big ? 2.5 : 3) : (big ? 1.3 : 1.5);
      return '<g class="node' + (ns ? ' ' + ns : '') + '" data-act="node" data-i="' + i + '" tabindex="0" role="button" aria-label="' + esc(c.name) + 'の経過を絞り込む' + (ns === 'gone' ? '（死亡）' : ns === 'dash' ? '（離脱）' : '') + '" style="cursor:pointer">' +
        '<circle cx="' + P.x.toFixed(1) + '" cy="' + P.y.toFixed(1) + '" r="' + NR + '" class="nodebg" style="--c:' + pc(i) + ';stroke:' + pc(i) + ';stroke-width:' + sw + ';opacity:' + (dead ? 0.45 : 1) + '"' + (ns === 'dash' ? ' stroke-dasharray="4 3"' : '') + '/>' +
        (HK.Icons.url(c.name) ? '<g style="opacity:' + (dead ? 0.45 : 1) + (dead ? ';filter:grayscale(1)' : '') + '">' + HK.Icons.svg(c.name, i, P.x, P.y, NR - 1.5, i) + '</g>' :
        '<text x="' + P.x.toFixed(1) + '" y="' + (P.y + (big ? 4 : 6)).toFixed(1) + '" text-anchor="middle" style="fill:' + pc(i) + ';font-weight:700;font-size:' + (big ? 12 : 17) + 'px;opacity:' + (dead ? 0.45 : 1) + '">' + esc(HK.Icons.initial(c.name)) + '</text>') +
        '<text x="' + P.x.toFixed(1) + '" y="' + (P.y + NR + (big ? 13 : 19)).toFixed(1) + '" text-anchor="middle" class="nlab" style="fill:var(--ink);font-size:' + nameFs + 'px;font-weight:600">' + esc(shortName(c)) + '</text>' +
        '<text x="' + P.x.toFixed(1) + '" y="' + (P.y + NR + (big ? 25 : 35)).toFixed(1) + '" text-anchor="middle" class="nlab" style="fill:var(--muted);font-size:' + fateFs + 'px">' + esc(c.fate) + '</text></g>';
    }).join('');
    var out = '<svg viewBox="0 0 ' + W.toFixed(0) + ' ' + H.toFixed(0) + '" role="img" aria-label="関係図"><style>.nodebg{fill:var(--surface);fill:color-mix(in srgb,var(--c) 16%,var(--surface))}.elab{font-size:' + labFs + 'px;font-weight:700;paint-order:stroke;stroke:var(--sand);stroke-width:4px;stroke-linejoin:round}.nlab{paint-order:stroke;stroke:var(--sand);stroke-width:3.5px;stroke-linejoin:round}</style>' + defs + (LY.under || '') + edges + nodes + labels + (LY.over || '') + '</svg>';
    if (MV) MV.drawn(res, { lines: pairs.length - faint.length, faint: faint.length, labels: placed.length - (LY.taken || []).length, labSkip: labSkip });
    return out;
  }

  /* 住人の丸の状態（元の番号ごと）：gone＝死亡（薄い丸）、dash＝離脱（破線の輪。最後の区切りで場にいない）、bold＝生存して主導（リーダー・派閥の長）。どれでもなければ '' */
  function nodeStates(res) {
    var H = res.history, last = H && H.length ? H[H.length - 1].alive : null, lead = {};
    if (HK.MapView && HK.MapView.groups) HK.MapView.groups(res).forEach(function (g) { lead[g.leader] = 1; });
    return res.chars.map(function (c, i) {
      if (c.alive === false) return 'gone';
      if (last && last[i] === false) return 'dash';
      return c.leader || lead[i] ? 'bold' : '';
    });
  }
  /* 関係図の凡例：この結果にある線の種類だけ（線の形は図と同じ）と、丸の輪の意味 */
  function mapLegend(res) {
    res = atOf(res);
    var has = {};
    res.pairs.forEach(function (p) { if (p.label !== 'strangers') has[p.cls === 'obsess' ? 'love' : p.cls] = 1; });
    var items = LEG.filter(function (x) { return has[x[0]]; }).map(function (x) {
      var k = x[0], w = LINE_W[k], col = 'var(' + CLS_VAR[k] + ')', dash = LINE_DASH[k];
      var ln = '<line x1="1" y1="5" x2="' + (k === 'pine' ? 21 : 25) + '" y2="5" style="stroke:' + col + ';stroke-width:' + w + '"' + (dash ? ' stroke-dasharray="' + dash + '"' : '') + '/>';
      if (k === 'pine') ln += '<path d="M17,1.5 L22,5 L17,8.5" fill="none" style="stroke:' + col + ';stroke-width:1.4;stroke-linecap:round;stroke-linejoin:round"/>';
      if (k === 'kill') ln += '<path d="M9.5,1.5 L16.5,8.5 M16.5,1.5 L9.5,8.5" fill="none" style="stroke:' + col + ';stroke-width:1.6;stroke-linecap:round"/>';
      return '<span class="leg"><svg width="26" height="10" viewBox="0 0 26 10" aria-hidden="true">' + ln + '</svg>' + esc(x[1]) + '</span>';
    }).join('');
    var st8 = nodeStates(res), sk = {};
    st8.forEach(function (s) { sk[s] = 1; });
    var ring = [sk.bold ? '太い輪＝生存して主導' : '', sk.dash ? '破線の輪＝離脱' : '', sk.gone ? '薄い丸＝死亡' : ''].filter(Boolean).join(' · ');
    return (items ? '<div class="mapleg">' + items + '</div>' : '') + (ring ? '<span class="mapring">' + ring + '</span>' : '');
  }

  /* view-map.js が使う部品 */
  V._map = { tw: tw, overlap: overlap, pc: pc, fateCls: fateCls, av: av, hot: hotInfo, turnOf: turnOf, tno: tno, legend: mapLegend };

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
    /* 転機の印（--hot）：その出来事の区切りの位置に、細い縦線と点 */
    var tk = sparkTurn(p, res), mk = '';
    if (tk) mk = '<line x1="' + X(tk.i).toFixed(1) + '" x2="' + X(tk.i).toFixed(1) + '" y1="2" y2="' + (H - 2) + '" class="sparkhot" style="stroke:var(--hot);stroke-width:1;stroke-dasharray:2 2;vector-effect:non-scaling-stroke"/>' +
      '<circle cx="' + X(tk.i).toFixed(1) + '" cy="' + Y(s[tk.i][0]).toFixed(1) + '" r="3.4" class="sparkhot" style="fill:var(--hot)"/>';
    return '<svg class="spark" viewBox="0 0 ' + W + ' ' + H + '" preserveAspectRatio="none" aria-hidden="true">' +
      '<line x1="0" x2="' + W + '" y1="' + mid + '" y2="' + mid + '" style="stroke:var(--line);stroke-width:1"/>' +
      line(2, 'stroke:var(--enemy);stroke-width:1.3;stroke-dasharray:3 3;vector-effect:non-scaling-stroke') +
      line(0, 'stroke:' + pc(p.a) + ';stroke-width:2;vector-effect:non-scaling-stroke') +
      line(1, 'stroke:' + pc(p.b) + ';stroke-width:2;vector-effect:non-scaling-stroke') +
      '<circle cx="' + X(n - 1) + '" cy="' + Y(last[0]) + '" r="2.6" style="fill:' + pc(p.a) + '"/>' +
      '<circle cx="' + X(n - 1) + '" cy="' + Y(last[1]) + '" r="2.6" style="fill:' + pc(p.b) + '"/>' + mk + '</svg>';
  }
  /* 組の転機が推移グラフの何点目か（p.series は区切りごとの記録 res.history と同じ並び。空きの点は詰めて描くので数え直す） */
  function sparkTurn(p, res) {
    var n = turnOf(p, res), e = n != null ? res.log[n] : null;
    if (!e || e.step == null) return null;
    var raw = p.series || [], hs = res.history || [], hi = -1;
    for (var k = 0; k < hs.length; k++) if (hs[k] && hs[k].step === e.step) { hi = k; break; }
    if (hi < 0) hi = Math.min(e.step, raw.length - 1);
    if (hi < 0 || !raw[hi]) return null;
    var idx = 0;
    for (var j = 0; j < hi; j++) if (raw[j]) idx++;
    return { i: idx, n: n, e: e };
  }

  function tieName(t, res) {
    var D = HK.TIES[t.type];
    if (!D) return '';
    /* きょうだい：性別・年齢で「姉弟」「兄妹（庇護）」に言い換え、上の人が分かれば「美咲が姉の姉弟（庇護）」（sib-word.js） */
    var sl = HK.Sib ? HK.Sib.resLabel(t, res) : '';
    if (sl) { var el = HK.Sib.resElder(t, res); return el ? el.who.name + 'が' + el.word + 'の' + sl : sl; }
    return D.dir ? res.chars[t.a].name + 'が' + D.roleA + 'の' + D.label : D.label;
  }
  /* 札（組の見出し）に出す関係名 */
  function tieChip(t, res) { return (HK.Sib && HK.Sib.resLabel(t, res)) || t.label; }

  function pairCard(p, res) {
    var A = res.chars[p.a], B = res.chars[p.b], L = res.log;
    /* 見出しの二人は攻め×受けの順（pair-name.js） */
    var po = HK.pairIdx ? HK.pairIdx(res, p) : [p.a, p.b];
    var tieLabel = p.tie ? tieName(p.tie, res) : '';
    var pred = p.tie
      ? (p.surprise ? 'もともと<b>「' + esc(tieLabel) + '」</b>だったのに「' + esc(p.name) + '」に変わった。' : 'もともと：<b>' + esc(tieLabel) + '</b>　相性予想：' + esc(p.base.kindLabel))
      : p.surprise
      ? '相性予想は<b>「' + esc(p.base.kindLabel) + '」</b>だったのに「' + esc(p.name) + '」に落ち着いた。'
      : '相性予想：<b>' + esc(p.base.kindLabel) + '</b>';
    var notes = p.base.notes.length ? '<br>' + p.base.notes.map(esc).join('／') : '';
    var tp = turnOf(p, res), tk = sparkTurn(p, res);
    var keys = p.key.map(function (n) {
      var e = L[n];
      /* エロシーンは概要だけ（全文は経過で読める） */
      var body = HK.lewdEvent && HK.lewdBrief && HK.lewdEvent(e) ? '<span class="brief">' + esc(HK.lewdBrief(e)) + '</span>' : paint(e.text, res);
      return '<li' + (n === tp ? ' class="hot"' : '') + '><span class="st">' + (tno(e.step) ? '<b class="tn">' + tno(e.step) + '</b>' : '') + esc(e.label) + '</span>' + body + (e.why ? '<span class="why">' + esc(e.why) + '</span>' : '') + '</li>';
    }).join('');
    var r = p.rel;
    return '<article class="pcard' + (p.surprise ? ' sur' : '') + '">' +
      '<div class="hd"><span class="avpair">' + av(res, po[0], 34) + av(res, po[1], 34) + '</span><span class="nm">' + esc(res.chars[po[0]].name) + ' × ' + esc(res.chars[po[1]].name) + '</span>' + (p.tie ? '<span class="tiechip">' + esc(tieChip(p.tie, res)) + ' →</span>' : '') + '<span class="lbl ' + p.cls + '">' + esc(p.name) + '</span>' + (p.surprise ? '<span class="surtag">意外</span>' : '') + '</div>' +
      '<div class="txt">' + paint(p.text, res) + '</div>' +
      '<div class="pred">' + pred + notes + '</div>' +
      spark(p, res) +
      '<div class="sparkleg"><span style="color:' + pc(p.a) + '">― ' + esc(A.name) + '→' + esc(B.name) + ' 好意</span><span style="color:' + pc(p.b) + '">― ' + esc(B.name) + '→' + esc(A.name) + ' 好意</span><span style="color:var(--enemy)">┄ 緊張</span>' + (tk ? '<span class="sparkhot">● ' + tno(tk.e.step) + ' 転機</span>' : '') + '</div>' +
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

  /* 結果の箱庭。セーブを開くとき、一覧に出していない箱庭（scenario-futari.js の SCENARIOS_HIDDEN）や今は無い箱庭の結果でも落ちないように */
  function scenOf(res) { return HK.SCENARIOS[res.scenId] || (HK.SCENARIOS_HIDDEN || {})[res.scenId] || { id: res.scenId, name: String(res.scenId || '箱庭'), env: [], stats: [] }; }
  function charCard(c, res) {
    var stats = Object.keys(c.stats || {}).map(function (k) {
      var def = (scenOf(res).stats || []).filter(function (s) { return s.id === k; })[0];
      return (def ? def.label : k) + c.stats[k];
    }).join('・');
    var odd = c.odd.map(function (n) {
      var e = res.log[n];
      return '<div class="oddl">らしくない瞬間　<span class="nums">' + esc(e.label) + '</span>　' + paint(e.text, res) + '</div>';
    }).join('');
    return '<article class="ccard"><div class="hd">' + av(res, c.i, 40, c.alive === false ? 'gone' : '') + '<span class="nm">' + esc(c.name) + '</span><span class="fate ' + fateCls(c.fate) + '">' + esc(c.fate) + '</span></div>' +
      (c.fateNote ? '<div class="sub">' + paint(c.fateNote, res) + '</div>' : '') +
      (HK.Emo && HK.Emo.html ? HK.Emo.html(c) : '') +
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
    var ks = keySet(res), H = hotInfo(res), groups = [], cur = null;
    /* 似た派閥の出来事が続くときは畳む（factions.js の HK.Factions.foldSet。表示だけ。人で絞り込んでいるときは畳まない） */
    var fold = res.factions && HK.Factions && HK.Factions.foldSet && !tl.who.length ? HK.Factions.foldSet(res) : null;
    res.log.forEach(function (e) {
      if (e.kind === 'step') { cur = { label: e.label, step: e.step, items: [] }; groups.push(cur); return; }
      if (!cur) { cur = { label: '', step: null, items: [] }; groups.push(cur); }
      if (tl.who.length) {
        var all = tl.who.every(function (w) { return e.actors.indexOf(w) >= 0; });
        if (!all) return;
      }
      if (tl.keyOnly && !(ks[e.n] || e.kind === 'death' || e.odd || e.mag >= 25 || e.goal || e.goalExit || (e.mark && e.mark.length) || isHot(e, H))) return;
      if (tl.cat !== 'all' && e.cat !== tl.cat && e.kind !== 'death') return;
      if (tl.lewd && !HK.lewdEvent(e)) return;
      if (fold && fold[e.n] && !isHot(e, H)) { if (!cur.fold) { cur.fold = { fold: [] }; cur.items.push(cur.fold); } cur.fold.fold.push(e); return; }
      cur.items.push(e);
    });
    var html = groups.filter(function (g) { return g.items.length; }).map(function (g) {
      /* 左の列：ターン番号（Mono）と局面名。重要な出来事のある区切りは番号を赤に */
      var tn = tno(g.step), gh = g.items.some(function (e) { return !e.fold && isHot(e, H); });
      var when = '<div class="when' + (gh ? ' hot' : '') + '">' + (tn ? '<span class="tn">' + tn + '</span>' + (g.label ? '<span class="ph">' + esc(g.label) + '</span>' : '') : esc(g.label)) + '</div>';
      return '<div class="stepblk' + (gh ? ' hasHot' : '') + '">' + when + '<ol>' + g.items.map(function (e) {
        if (e.fold) return '<li class="ev phase facfold"><details><summary style="cursor:pointer;color:var(--muted);font-size:12px">似た派閥の動き ' + e.fold.length + '件（続くので畳んでいます）</summary><ol style="padding-bottom:0">' + e.fold.map(evLi).join('') + '</ol></details></li>';
        return evLi(e);
      }).join('') + '</ol></div>';
    }).join('');
    return html || '<p class="hint">条件に合う出来事はありません。</p>';
    function evLi(e) {
      var hot = isHot(e, H), hk = hotKind(e, H);
      var cls = 'ev' + (e.kind === 'event' && e.cat ? ' cat-' + e.cat : '') + (e.trouble ? ' trouble' : '') + (e.kind === 'phase' ? ' phase' : '') + (e.kind === 'death' ? ' death' : '') + (ks[e.n] ? ' key' : '') + (hot ? ' hot' : '') + (e.goal || e.goalExit ? ' goal' : '') + (e.goalExit ? ' exit' : '') + (hk ? ' hot-' + hk : '');
      var chip = e.kind === 'event' ? '<span class="c cc-' + esc(e.cat) + '">' + esc(HK.CAT_NAME[e.cat] || e.cat) + '</span>' : '';
      /* 出られない部屋：条件を満たした・扉が開いた出来事の札 */
      if (e.goal || e.goalExit) chip = (e.goal || []).map(function (g) { return '<span class="goalb">条件達成：' + esc(g) + '</span>'; }).join('') + (e.goalExit ? '<span class="goalb exitb">扉が開いた</span>' : '') + chip;
      /* 決定的な関係の節目（付き合い始めた・別れた・浮気）の札（engine.js の markRel） */
      if (e.mark && e.mark.length) chip = e.mark.map(function (m) { return '<span class="markb mark-' + esc(m) + '">' + esc((HK.MARK_NAME || {})[m] || m) + '</span>'; }).join('') + chip;
      /* 台詞・地の文・引用の区分（voice-seg.js の e.seg）：台詞行の話し手の顔を先頭に。発話のある出来事を吹き出しにする（名詞の引用だけなら吹き出しにしない） */
      var sg = HK.Seg ? HK.Seg.of(e, res) : null, lead = sg ? HK.Seg.speakers(sg).filter(function (i) { return res.chars[i]; })[0] : null;
      var who = (lead != null ? [lead] : []).concat((e.actors || []).filter(function (i) { return i !== lead; })).slice(0, 3);
      var avs = who.length ? '<span class="avs">' + who.map(function (i) { return av(res, i, 26); }).join('') + '</span>' : '';
      /* 会話は吹き出しにせず、「」の引用だけ少し太く（.q） */
      var talk = !!(avs && e.kind === 'event' && (sg ? HK.Seg.talk(sg) : /「/.test(e.text)));
      var body = paint(e.text, res, sg);
      if (talk) body = body.replace(/「[^「」]*」/g, '<span class="q">$&</span>');
      return '<li class="' + cls + (avs ? ' hasav' : '') + (talk ? ' talk' : '') + '"' + (hk ? ' data-hot="' + hk + '"' : '') + '>' + avs + '<div class="evb">' + chip + body + (e.odd ? '<span class="oddb">らしくない</span>' : '') + (e.why ? '<span class="why">' + esc(e.why) + '</span>' : '') + '</div></li>';
    }
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
    var all = !tl.keyOnly && !tl.lewd && tl.cat === 'all';
    return '<div class="tlbar" role="group" aria-label="時系列の絞り込み"><button class="chip" data-act="tlall" aria-pressed="' + all + '">すべて</button>' +
      '<button class="chip" data-act="keyonly" aria-pressed="' + tl.keyOnly + '" title="転機・死亡・関係の節目・決め手など、重要な出来事だけ"><i class="hotdot" aria-hidden="true"></i>重要のみ</button>' + sel +
      (HK.lewdFilterOn && HK.lewdFilterOn(res.log) ? '<button class="chip" data-act="lewdonly" aria-pressed="' + !!tl.lewd + '">エロシーンだけ</button>' : '') +
      '<span class="tlsep" aria-hidden="true"></span>' + who + (tl.who.length ? '<button class="btn small ghost" data-act="whoclear">絞り込みを解除</button>' : '') + '</div>';
  }

  /* 見出しの横の凡例：この結果に出る重要な出来事の種類だけ（情事は R18 版で全年齢モードでないときだけ） */
  function hotLegend(res) {
    var H = hotInfo(res), seen = {};
    res.log.forEach(function (e) { var k = hotKind(e, H); if (k) seen[k] = 1; });
    return hotLegendOf(seen);
  }

  /* ---------- 全体 ---------- */
  V.resetFilter = function () { tl = { who: [], keyOnly: false, cat: 'all', lewd: false }; };

  V.render = function (host, res, opts) {
    var fresh = res && res !== lastRes;
    lastRes = res; lastHost = host; lastOpts = opts || {};
    if (fresh && !res.solo) { var sc0 = HK.SCENARIOS[res.scenId]; if (sc0 && sc0.longRun && sc0.longRun(res.env)) tl.keyOnly = true; }
    if (!res) { host.innerHTML = emptyState(lastOpts); return; }
    if (res.solo && HK.DView) { HK.DView.render(host, res, lastOpts, historyBlock(lastOpts.history || [])); return; }
    var scen = scenOf(res);
    var envChips = (scen.env || []).concat(HK.GLOBAL_ENV || []).map(function (e) {
      var v = (res.env || {})[e.id];
      var shown = e.type === 'select' ? ((e.options || []).filter(function (o) { return o.v === v; })[0] || {}).label : v + (e.unit || '');
      /* その設定ができる前にセーブした結果（値が無い・今は無い選択肢）は、その欄を出さない */
      if (v == null || shown == null) return '';
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
      (HK.MapView ? HK.MapView.classChart(res) : '') +
      '<h2 class="sec mapsec">関係図' + (HK.MapView && HK.MapView.atBar ? HK.MapView.atBar(res) : '') + '</h2><figure class="trayfig">' + (function () { var sv = mapSvg(res); return (HK.MapView ? '<div id="mapbar">' + HK.MapView.bar(res) + '</div>' : '') + '<div class="tray" id="map">' + sv + '</div>'; })() + '<figcaption><div class="maplegs">' + mapLegend(res) + '</div><div class="mapcap"><span>住人の丸を押すと、その人の経過に絞り込めます。＊は意外な組み合わせ。矢印は気持ちや行為の向き。</span><span>砂箱 57×72×7cm</span></div></figcaption></figure>' +
      factionBlock(res) +
      (sur.length ? '<h2 class="sec">意外な組み合わせ</h2><p class="hint">エゴグラム上の相性予想と、箱庭での結末が食い違ったペアです。解釈の掘りどころ。</p><div class="cards">' + sur.map(function (p) { return pairCard(p, res); }).join('') + '</div>' : '') +
      '<h2 class="sec">関係の結末</h2><div class="cards">' + rest.slice(0, limit).map(function (p) { return pairCard(p, res); }).join('') + '</div>' +
      (rest.length > limit ? '<div class="more"><button class="btn" data-act="showall">残り' + (rest.length - limit) + '組を表示</button></div>' : '') +
      (strangers ? '<p class="hint" style="margin-top:8px">ほかに「他人のまま」の組が' + strangers + '組あります。住人の丸を押すと、その人の関係だけを図で追えます。</p>' : '') +
      '<h2 class="sec">住人ごとの読み解き</h2><div class="cards">' + res.chars.map(function (c) { return charCard(c, res); }).join('') + '</div>' +
      '<h2 class="sec" id="tlhead">時系列' + hotLegend(res) + '</h2>' + (scen.longRun && scen.longRun(res.env) ? '<p class="hint">長期間のため、最初は重要な出来事だけの短縮版で表示しています。「すべて」を押すと全部見られます。</p>' : '') + '<div id="tlbar">' + tlBar(res) + '</div><div class="tl" id="tl">' + timeline(res) + '</div>' +
      historyBlock(lastOpts.history || []);
    host.innerHTML = html;
  };

  V.refreshTimeline = function () {
    if (!lastRes || !lastHost) return;
    var m = lastHost.querySelector('#map'), b = lastHost.querySelector('#tlbar'), t = lastHost.querySelector('#tl');
    if (m) m.innerHTML = mapSvg(lastRes);
    var mb = lastHost.querySelector('#mapbar');
    if (mb && HK.MapView) mb.innerHTML = HK.MapView.bar(lastRes);
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
  V.toggleLewd = function () { tl.lewd = !tl.lewd; V.refreshTimeline(); };
  V.setCat = function (c) { tl.cat = c; V.refreshTimeline(); };
  /* 「すべて」：種類・重要のみ・エロシーンだけを外す（住人の絞り込みはそのまま） */
  V.showAllKinds = function () { tl.keyOnly = false; tl.lewd = false; tl.cat = 'all'; V.refreshTimeline(); };
  document.addEventListener('click', function (ev) {
    var t = ev.target && ev.target.closest && ev.target.closest('[data-act="tlall"]');
    if (t && lastRes) V.showAllKinds();
  });

  /* ---------- 結末 ---------- */
  function endingBlock(res) {
    if (!HK.Endings) return '';
    var E = HK.Endings.build(res);
    /* 体の関係にならない組の但し書き（出られない部屋）：見出しのすぐ下に帯で（ui-env.js の HK.NgBand.ending。記録を読むだけ） */
    var ngb = HK.NgBand && HK.NgBand.ending ? HK.NgBand.ending(res, E) : '';
    /* 全体の転機（いちばん大きい組の転機）を概要の最後に赤で */
    var top = hotInfo(res).top, te = top != null ? res.log[top] : null;
    var tst = te && tno(te.step) ? '<div class="tpstat"><dt>転機</dt><dd class="hot">' + tno(te.step) + '</dd>' + (te.label ? '<dd class="tplab">' + esc(te.label) + '</dd>' : '') + '</div>' : '';
    return '<section class="ending" aria-label="結末"><div class="eyebrow">結末</div><p class="ehead">' + paint(E.headline, res) + '</p>' +
      (E.stats.length || tst ? '<dl class="estats">' + E.stats.map(function (s) { return '<div><dt>' + esc(s[0]) + '</dt><dd>' + esc(s[1]) + '</dd></div>'; }).join('') + tst + '</dl>' : '') + ngb +
      (E.lines.length ? '<ul class="elines">' + E.lines.map(function (l) { return '<li>' + paint(l, res) + '</li>'; }).join('') + '</ul>' : '') +
      (HK.Epilogue && HK.Epilogue.html ? HK.Epilogue.html(E, res, paint) : '') + (E.after || '') + '</section>';
  }

  /* ---------- 派閥 ---------- */
  /* 派閥の印（関係図の囲み・クラスの表と同じ番号の形。view-map.js の HK.MapView.fmark）。図に無い派閥（過去の派閥）は印なし */
  function facMark(res, leader) {
    var MV = HK.MapView, k = MV && MV.fidx ? MV.fidx(res, leader) : -1;
    return k < 0 ? null : { k: k, mark: MV.fmark(k), cls: MV.fcls(k), col: MV.fcol(k) };
  }
  function groupChips(g, res, regime) {
    var fm = facMark(res, g.leader);
    return '<span class="fgroup' + (regime === 'dictator' ? ' dict' : '') + (fm ? ' fg ' + fm.cls : '') + '"' + (fm ? ' style="--fc:' + fm.col + '"' : '') + '><b>' + (fm ? fm.mark : '') + av(res, g.leader, 20) + esc(res.chars[g.leader].name) + '派</b>' +
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
        (x.groups.length ? x.groups.map(function (g) { var fm = facMark(res, g.leader); return (fm ? fm.mark : '') + esc(res.chars[g.leader].name) + '派（' + g.members.length + '）'; }).join('　') + (x.loners.length ? '　無所属' + x.loners.length : '') : '') + '</li>';
    }).join('');
    /* 派閥の決め方・リーダーの決め方（factions.js の facMode・facLead。選んでいない結果は今までどおり） */
    var fm = (res.env || {}).facMode, fl = (res.env || {}).facLead;
    var hint = fm === 'none' ? '派閥は生まれない設定。' : fm === 'fix' ? '「仲間とみなす」グループをそのまま派閥にする設定（抜ける・鞍替え・解散は起きず、死亡・退場だけ反映。仲間のグループが無ければ自動）。' : F.min + '人以上いるときだけ派閥が生まれる設定。人を引っぱる気質（CP・A高／AC低）の人物と、その人への信頼が揃うと輪ができる。';
    if (fl && fl !== 'auto' && fm !== 'none') hint += 'リーダーは派閥の中で' + fl + 'が最も高い人（交代しない）。';
    return '<h2 class="sec">派閥</h2><p class="hint">' + hint + '</p>' +
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
    var scen = scenOf(res), L = [];
    L.push('【箱庭シミュレーター】' + scen.name + '（シード ' + res.seed + '）');
    if (HK.Endings) {
      var E = HK.Endings.build(res);
      L.push('');
      L.push('■ 結末');
      L.push(E.headline);
      if (E.stats.length) L.push(E.stats.map(function (s) { return s[0] + ' ' + s[1]; }).join('／'));
      E.lines.forEach(function (l) { L.push('・' + l); });
      (E.last || []).forEach(function (x) { L.push('・最期の言葉　' + x.text); });
    }
    L.push('');
    L.push('■ 住人の結末');
    res.chars.forEach(function (c) { L.push('・' + c.name + '：' + c.fate + (c.fateNote ? '（' + c.fateNote + '）' : '')); });
    /* 派閥の一覧と、クラスメイトの学年・クラスの一覧（view-map.js） */
    if (HK.MapView) HK.MapView.textLines(res).forEach(function (l) { L.push(l); });
    L.push('');
    L.push('■ 関係');
    res.pairs.forEach(function (p) {
      L.push('・' + (HK.pairName ? HK.pairName(res, p) : res.chars[p.a].name + '×' + res.chars[p.b].name) + '：' + p.name + (p.surprise ? '［意外］' : '') + '　' + p.text);
      p.key.forEach(function (n) { var e = res.log[n]; L.push('　　' + e.label + '　' + (HK.lewdEvent && HK.lewdBrief && HK.lewdEvent(e) ? HK.lewdBrief(e) : e.text)); });
    });
    L.push('');
    L.push('■ 時系列');
    var nmList = res.chars.map(function (c) { return c.name; });
    res.log.forEach(function (e) {
      if (e.kind === 'step') L.push('― ' + e.label);
      else L.push('　' + (HK.fmtLong ? HK.fmtLong(e.text, nmList) : e.text));
    });
    return L.join('\n');
  };
})();
