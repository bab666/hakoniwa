/* 箱庭シミュレーター: ゾンビの街 ― 開始地点と最後の状態のエリアマップ（折りたたみ）
   3×3の街区を地図らしく描く（下地は inline SVG：歪めた区画・道路の格子・港側の海・出口の道・区画の記号・地名のラベル・ゾンビの濃さ）。
   住人は「ピン」（涙滴形の頭に丸いアイコン、先端が地点、足元に影）で、SVG の上に HTML を % 座標で重ねる。
   Safari は SVG の foreignObject で位置ずれ・切れが出るので使わない（ピンは HK.Icons.html をそのまま使う HTML）。
   区画の並びは 0 1 2 / 3 4 5 / 6 7 8 のまま（上下左右の隣が見た目でも隣。zombie-data.js の Z.adj と同じ）。
   形の揺らぎは区画番号から決める固定の値（乱数は使わない。開始時と最終の2枚で同じ形）。
   左が開始時、右が最終日の状態。結末の枠の中に <details> で入れる */
(function () {
  'use strict';
  var HK = window.HK;
  if (!HK.Endings || !HK.Endings.zombie) return;
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  /* 鍵は版ごと（safe.js の HK.STORE。このファイルは safe.js より先に読むので、使うときに決める） */
  function KEY() { return HK.STORE ? HK.STORE.key('hakoniwa_zmap_open') : 'hakoniwa_zmap_open'; }
  function isOpen() { try { return localStorage.getItem(KEY()) !== '0'; } catch (e) { return true; } }
  function tag(f) {
    if (/救助/.test(f)) return ['救助', 'ok', '救'];
    if (/脱出/.test(f)) return ['脱出', 'ok', '脱'];
    if (/ゾンビ/.test(f)) return ['ゾンビ', 'z', 'ゾ'];
    if (/生き延び/.test(f)) return ['生存', 'ok', '生'];
    return ['死亡', 'dead', '死'];
  }

  /* ---------- 図の寸法（viewBox の単位。右と下は海のぶん広い） ---------- */
  var X0 = 16, Y0 = 16, CW = 92, CH = 104, SEA = 40, ROAD = 4.5;
  var VW = X0 + CW * 3 + SEA, VH = Y0 + CH * 3 + SEA;
  function f1(v) { return Math.round(v * 10) / 10; }
  function pt(p) { return f1(p[0]) + ',' + f1(p[1]); }
  /* 固定の揺らぎ（-a/2〜a/2） */
  function jit(n, a) { return ((n * 7919) % 11 / 10 - 0.5) * a; }
  /* 道路の交差点（4×4）。内側は大きく、外周は少しだけずらす */
  var JN = [];
  (function () {
    for (var r = 0; r < 4; r++) {
      JN[r] = [];
      for (var c = 0; c < 4; c++) {
        var ic = c > 0 && c < 3, ir = r > 0 && r < 3;
        JN[r][c] = [X0 + c * CW + (ic ? jit(r * 4 + c + 3, 10) : jit(r * 4 + c + 17, 4)), Y0 + r * CH + (ir ? jit(r * 4 + c + 29, 10) : jit(r * 4 + c + 41, 4))];
      }
    }
  })();
  function add(a, b) { return [a[0] + b[0], a[1] + b[1]]; }
  function toward(a, b, d) { var dx = b[0] - a[0], dy = b[1] - a[1], l = Math.sqrt(dx * dx + dy * dy) || 1; return [a[0] + dx / l * d, a[1] + dy / l * d]; }
  /* 区画の形：交差点の四角を道幅だけ内に寄せ、角を区画ごとに決めた量だけ落とす */
  var BLK = [0, 1, 2, 3, 4, 5, 6, 7, 8].map(function (i) {
    var r = Math.floor(i / 3), c = i % 3;
    var q = [add(JN[r][c], [ROAD, ROAD]), add(JN[r][c + 1], [-ROAD, ROAD]), add(JN[r + 1][c + 1], [-ROAD, -ROAD]), add(JN[r + 1][c], [ROAD, -ROAD])];
    var pts = [];
    q.forEach(function (p, k) {
      var ch = [0, 6, 11][(i * 5 + k * 3 + 1) % 3];
      if (!ch) { pts.push(p); return; }
      pts.push(toward(p, q[(k + 3) % 4], ch), toward(p, q[(k + 1) % 4], ch));
    });
    var L = Math.max(q[0][0], q[3][0]), R = Math.min(q[1][0], q[2][0]), T = Math.max(q[0][1], q[1][1]), B = Math.min(q[2][1], q[3][1]);
    return { pts: pts, d: pts.map(pt).join(' '), L: L, R: R, T: T, B: B, cx: (L + R) / 2, w: R - L, h: B - T };
  });
  /* 名前を地名のように1〜2行に折る（括弧・中黒・「の」・よくある語尾の前で） */
  function lines(name) {
    var s = String(name || ''), a = Array.from(s), m, k;
    if (a.length <= 6) return [s];
    if ((m = s.match(/^(.+?)([（(].*)$/))) return [m[1], m[2]];
    if ((k = s.indexOf('・')) > 0 && k < s.length - 1) return [s.slice(0, k + 1), s.slice(k + 1)];
    if ((m = s.match(/^(.+?)(モール|通り|地区|病院|事務所|住宅街|住宅地|パーク|公園|センター)$/))) return [m[1], m[2]];
    if ((k = s.indexOf('の')) > 0 && k < s.length - 2) return [s.slice(0, k + 1), s.slice(k + 1)];
    var h = Math.ceil(a.length / 2);
    return [a.slice(0, h).join(''), a.slice(h).join('')];
  }
  /* 区画の定義（med・guns・shelter・exit）。結果には名前しか無いので、地域の表から名前で引く */
  function defs(res, M) {
    var Z = HK.ZB || {}, A = Z.AREAS || {}, reg = res.end.zombie.reg, list = A[reg] || [];
    return M.names.map(function (n, i) {
      var d = list[i] && list[i].name === n ? list[i] : null;
      Object.keys(A).forEach(function (k) { if (!d) d = (A[k] || []).filter(function (x) { return x.name === n; })[0] || null; });
      return d || { name: n, exit: M.exit[i] ? '出口' : '' };
    });
  }
  function exitKind(d) {
    var e = String(d.exit || '');
    if (/船|海|沖/.test(e)) return 'sea';
    if (/線路|電車|鉄道/.test(e)) return 'rail';
    return 'road';
  }

  /* ---------- 区画の記号（薄い下地の印。描きすぎない） ---------- */
  function symbol(d, b) {
    var n = d.name || '', x = b.cx, y = b.T + b.h * 0.6, o = '';
    if (d.med) return '<path class="zm-sym zm-med" d="M' + f1(x - 3.5) + ' ' + f1(y - 11) + 'h7v7.5h7.5v7h-7.5v7.5h-7v-7.5h-7.5v-7h7.5z"/>';
    if (d.guns) {
      var s = [];
      for (var k = 0; k < 10; k++) { var rr = k % 2 ? 5 : 12, an = -Math.PI / 2 + k * Math.PI / 5; s.push(f1(x + Math.cos(an) * rr) + ',' + f1(y + Math.sin(an) * rr)); }
      return '<polygon class="zm-sym" points="' + s.join(' ') + '"/>';
    }
    if (d.shelter) return '<path class="zm-sym" d="M' + f1(x - 13) + ' ' + f1(y - 2) + 'L' + f1(x) + ' ' + f1(y - 13) + 'L' + f1(x + 13) + ' ' + f1(y - 2) + 'v14h-26z"/><rect class="zm-ground" x="' + f1(x - 3) + '" y="' + f1(y + 4) + '" width="6" height="8"/>';
    if (/公園|パーク/.test(n)) {
      [[-24, -8], [-12, 4], [2, -12], [16, 2], [26, -10], [-30, 10], [8, 12], [22, 16], [-18, 18]].forEach(function (p, k) { o += '<circle class="zm-tree" cx="' + f1(x + p[0]) + '" cy="' + f1(y + p[1]) + '" r="' + (k % 3 ? 3.2 : 4.4) + '"/>'; });
      return o + '<ellipse class="zm-pond" cx="' + f1(x - 2) + '" cy="' + f1(y + 2) + '" rx="8" ry="4.5"/>';
    }
    if (/モール/.test(n)) return '<rect class="zm-sym zm-bld" x="' + f1(x - 22) + '" y="' + f1(y - 12) + '" width="44" height="22" rx="2"/><path class="zm-symln" d="M' + f1(x - 22) + ' ' + f1(y - 1) + 'h44M' + f1(x) + ' ' + f1(y - 12) + 'v22"/>';
    if (/商店|ダイナー|通り/.test(n)) {
      for (var j = 0; j < 6; j++) o += '<rect class="zm-sym zm-bld" x="' + f1(x - 33 + j * 11) + '" y="' + f1(y - 4) + '" width="8.5" height="8" rx="1"/>';
      return o;
    }
    if (/住宅/.test(n)) {
      [[-26, -10], [-12, -12], [4, -10], [18, -12], [-20, 4], [-4, 6], [12, 4], [26, 6]].forEach(function (p) { o += '<rect class="zm-sym zm-bld" x="' + f1(x + p[0] - 4) + '" y="' + f1(y + p[1] - 3.5) + '" width="8" height="7" rx="1"/>'; });
      return o;
    }
    if (/ダウンタウン|駅/.test(n)) {
      [[-24, -12, 14, 12], [-6, -14, 10, 16], [8, -10, 16, 10], [-20, 4, 12, 10], [0, 6, 18, 9]].forEach(function (p) { o += '<rect class="zm-sym zm-bld" x="' + f1(x + p[0]) + '" y="' + f1(y + p[1]) + '" width="' + p[2] + '" height="' + p[3] + '" rx="1"/>'; });
      return o;
    }
    if (/港/.test(n)) {
      [[-24, -10], [-12, -10], [0, -10], [-24, 0], [-12, 0], [12, 4]].forEach(function (p) { o += '<rect class="zm-sym zm-bld" x="' + f1(x + p[0]) + '" y="' + f1(y + p[1]) + '" width="10" height="6" rx="0.5"/>'; });
      return o;
    }
    return '';
  }

  /* ---------- 下地（SVG） ---------- */
  function base(res, M, D, end, cap) {
    var o = '<svg class="zm-svg" viewBox="0 0 ' + VW + ' ' + VH + '" width="' + VW + '" height="' + VH + '" role="img" aria-label="' + esc('街の地図（' + cap + '）') + '" focusable="false">';
    o += '<rect class="zm-land" x="0" y="0" width="' + VW + '" height="' + VH + '"/>';
    /* 港のある角（右下）は海。岸は波打つ線で、街の縁の少し外を回る */
    var seaI = D.map(function (d, i) { return M.exit[i] && exitKind(d) === 'sea' ? i : -1; }).filter(function (i) { return i >= 0; })[0];
    var hasSea = seaI === 8 || (seaI == null && /港/.test(M.names[8] || ''));
    if (hasSea) {
      var xc = JN[3][3][0] + 11, yb = JN[3][3][1] + 11, ya = JN[1][3][1] + CH * 0.42, xa = JN[3][1][0] + CW * 0.42;
      /* 岸：右の縁から入り、街の縁に沿って下り、角を丸く回って下の縁へ（ゆるい弧で少し波打たせる。線は交差させない） */
      var ym = (ya + yb) / 2, xm = (xa + xc) / 2;
      o += '<path class="zm-sea" d="M' + VW + ' ' + f1(ya) + 'Q' + f1(xc + 4) + ' ' + f1(ya + 1) + ' ' + f1(xc) + ' ' + f1(ya + 16) +
        'Q' + f1(xc - 5) + ' ' + f1(ym) + ' ' + f1(xc) + ' ' + f1(yb - 20) + 'Q' + f1(xc) + ' ' + f1(yb) + ' ' + f1(xc - 20) + ' ' + f1(yb) +
        'Q' + f1(xm) + ' ' + f1(yb + 5) + ' ' + f1(xa + 16) + ' ' + f1(yb) + 'Q' + f1(xa + 1) + ' ' + f1(yb + 1) + ' ' + f1(xa) + ' ' + VH + 'L' + VW + ' ' + VH + 'Z"/>';
      [[VW - 13, ya + 40], [VW - 15, yb - 8], [xa + 40, VH - 9], [VW - 34, VH - 6]].forEach(function (p) { o += '<path class="zm-wave" d="M' + f1(p[0] - 6) + ' ' + f1(p[1]) + 'q1.5 -2.4 3 0t3 0t3 0t3 0"/>'; });
      o += '<text class="zm-sealb" x="' + f1(VW - 8) + '" y="' + f1(VH - 10) + '">海</text>';
    }
    /* 街の地面（道路の色）：外周の交差点を太い丸い線で囲み、外側に細い縁取り */
    var ring = [];
    for (var c = 0; c < 4; c++) ring.push(JN[0][c]);
    for (var r = 1; r < 4; r++) ring.push(JN[r][3]);
    for (c = 2; c >= 0; c--) ring.push(JN[3][c]);
    for (r = 2; r >= 1; r--) ring.push(JN[r][0]);
    var rd = ring.map(pt).join(' ');
    o += '<polygon class="zm-edge" points="' + rd + '"/><polygon class="zm-ground zm-gring" points="' + rd + '"/>';
    /* 出口の道（街の外へ）。陸の出口は区画の上か左から縁まで、海の出口は桟橋から沖へ点線の航路 */
    D.forEach(function (d, i) {
      if (!M.exit[i]) return;
      var b = BLK[i], k = exitKind(d), rr = Math.floor(i / 3), cc = i % 3;
      if (k === 'sea' && i === 8 && hasSea) {
        o += '<rect class="zm-pier" x="' + f1(b.R - 2) + '" y="' + f1(b.T + b.h * 0.3) + '" width="20" height="3.2"/><rect class="zm-pier" x="' + f1(b.L + b.w * 0.5) + '" y="' + f1(b.B - 2) + '" width="3.2" height="20"/>';
        o += '<path class="zm-route" d="M' + f1(b.R + 18) + ' ' + f1(b.T + b.h * 0.3 + 1.6) + 'Q' + f1(VW - 8) + ' ' + f1(b.B) + ' ' + f1(VW - 5) + ' ' + f1(VH - 22) + '"/>';
        o += '<path class="zm-arrow" d="M' + f1(VW - 9.5) + ' ' + f1(VH - 26) + 'L' + f1(VW - 5) + ' ' + f1(VH - 20) + 'L' + f1(VW - 1.5) + ' ' + f1(VH - 26.5) + '"/>';
        return;
      }
      var up = rr === 0 || (rr !== 2 && cc !== 0 && cc !== 2), left = !up && cc === 0, x, y, d1;
      if (up || rr === 2) {
        x = b.L + b.w * 0.27; y = up ? b.T : b.B;
        d1 = 'M' + f1(x) + ' ' + f1(y) + 'V' + (up ? 0 : VH);
      } else {
        y = b.T + b.h * 0.3; x = left ? b.L : b.R;
        d1 = 'M' + f1(x) + ' ' + f1(y) + 'H' + (left ? 0 : VW);
      }
      if (k === 'rail') o += '<path class="zm-rail" d="' + d1 + '"/><path class="zm-railt" d="' + d1 + '"/>';
      else o += '<path class="zm-hwy" d="' + d1 + '"/><path class="zm-hwyc" d="' + d1 + '"/>';
      var ex = up || rr === 2 ? f1(x) : (left ? 2 : VW - 2), ey = up ? 2 : rr === 2 ? VH - 2 : f1(y);
      if (up) o += '<path class="zm-arrow" d="M' + f1(x - 4.5) + ' 7.5L' + f1(x) + ' 2.5L' + f1(x + 4.5) + ' 7.5"/>';
      o += '<text class="zm-exlb" x="' + f1((up || rr === 2 ? x : ex) + 7) + '" y="' + (up ? 10.5 : f1(ey - 3)) + '">' + esc(k === 'rail' ? '線路・街の外へ' : '街の外へ') + '</text>';
    });
    /* 中の道路（上下左右の移動路）：中央線の点線 */
    var cl = '';
    [1, 2].forEach(function (r) { cl += 'M' + JN[r].map(pt).join('L'); });
    [1, 2].forEach(function (c) { cl += 'M' + [0, 1, 2, 3].map(function (r) { return pt(JN[r][c]); }).join('L'); });
    o += '<path class="zm-cl" d="' + cl + '"/>';
    /* 区画：地面 → 記号 → ゾンビの濃さ → 群れの点 → 地名 → 札 */
    D.forEach(function (d, i) {
      var b = BLK[i], z = (end ? M.z1 : M.z0)[i] || 0;
      o += '<polygon class="zm-blk" points="' + b.d + '"/>' + symbol(d, b);
      if (z > 0) o += '<polygon class="zm-fog" points="' + b.d + '" style="fill-opacity:' + (Math.min(100, z) / 100 * 0.5).toFixed(2) + '"/>';
      var nc = z >= 30 ? Math.min(5, Math.floor((z - 15) / 15)) : 0;
      [[0.14, 0.62], [0.86, 0.66], [0.2, 0.9], [0.8, 0.9], [0.5, 0.52]].slice(0, nc).forEach(function (p, k) {
        var gx = b.L + b.w * p[0] + jit(i * 5 + k, 4), gy = b.T + b.h * p[1];
        o += '<circle class="zm-zd" cx="' + f1(gx) + '" cy="' + f1(gy) + '" r="1.5"/><circle class="zm-zd" cx="' + f1(gx + 3.4) + '" cy="' + f1(gy + 1.2) + '" r="1.3"/><circle class="zm-zd" cx="' + f1(gx + 1.2) + '" cy="' + f1(gy + 3.6) + '" r="1.3"/>';
      });
      var badges = [], fell = false;
      if (M.shelter[i]) { fell = end && M.fell && M.safe === i; badges.push(fell ? '避難所（陥落）' : '避難所'); }
      if (M.exit[i]) badges.push('出口');
      if (end && M.heli === i) badges.push('ヘリ');
      if (end && M.safe === i && !M.fell) badges.push('本当に安全');
      var ty = b.T + 13;
      if (badges.length) {
        var bt = badges.join('・'), bl = Array.from(bt).length, fs = Math.min(8, (b.w - 8) / bl), bw = bl * fs + 6;
        o += '<g class="zm-bdg' + (fell ? ' fell' : '') + '"><rect x="' + f1(b.L + 2) + '" y="' + f1(b.T - 4.5) + '" width="' + f1(bw) + '" height="' + f1(fs + 4) + '" rx="2"/>' +
          '<text x="' + f1(b.L + 5) + '" y="' + f1(b.T - 4.5 + fs + 1.1) + '" style="font-size:' + f1(fs) + 'px">' + esc(bt) + '</text></g>';
        ty = b.T + 18;
      }
      var ls = lines(d.name);
      ls.forEach(function (l, k) {
        var fz = Math.min(10.5, (b.w - 6) / Math.max(1, Array.from(l).length));
        o += '<text class="zm-nm" x="' + f1(b.cx) + '" y="' + f1(ty + k * 11.5) + '"' + (fz < 10.5 ? ' style="font-size:' + f1(fz) + 'px"' : '') + '>' + esc(l) + '</text>';
      });
      o += '<text class="zm-zc" x="' + f1(b.cx) + '" y="' + f1(ty + ls.length * 11.5 - 1) + '">ゾンビ ' + z + '</text>';
    });
    return o + '</svg>';
  }

  /* ---------- 住人のピン（HTML を % 座標で重ねる） ---------- */
  function pins(res, M, end) {
    var by = [[], [], [], [], [], [], [], [], []];
    M.chars.forEach(function (c, k) { var a = end ? c.l : c.s; if (res.chars[k] && by[a]) by[a].push(k); });
    var o = '';
    by.forEach(function (ks, i) {
      var n = ks.length;
      if (!n) return;
      var b = BLK[i], rows = n <= 3 ? 1 : n <= 8 ? 2 : 3, per = Math.ceil(n / rows), sm = rows > 1;
      var sp = Math.min(22, (b.w - 18) / Math.max(1, per - 1 + (rows > 1 ? 0.5 : 0)));
      /* 後ろの段（上）から描いて、手前の段（下）が上に重なるように */
      for (var row = rows - 1; row >= 0; row--) {
        var part = ks.slice(row * per, row * per + per), m = part.length, tipY = b.B - (end ? 13 : 7) - row * (sm ? 15 : 17), off = rows > 1 ? (row % 2 ? sp / 4 : -sp / 4) : 0;
        part.forEach(function (k, j) {
          var ch = res.chars[k], mc = M.chars[k], t = end ? tag(mc.f) : null;
          var x = b.cx + (j - (m - 1) / 2) * sp + off;
          var col = t && t[1] !== 'ok' ? 'var(--enemy)' : (HK.Icons.color && HK.Icons.color(ch.name)) || 'var(--p' + (k % 30) + ')';
          var av = HK.Icons.html(ch.name, k, 26, t && t[1] !== 'ok' ? 'gone' : '').replace(/ title="[^"]*"/, '');
          o += '<span class="zm-pin' + (t ? ' ' + t[1] : '') + (sm ? ' sm' : '') + (t && row === 0 ? ' lo' : '') + '" style="left:' + (x / VW * 100).toFixed(2) + '%;top:' + (tipY / VH * 100).toFixed(2) + '%;--pc:' + col + '" title="' + esc(ch.name + (t ? '：' + mc.f : '')) + '">' +
            av + (t ? '<i data-s="' + t[2] + '"><b>' + t[0] + '</b></i>' : '') + '</span>';
        });
      }
    });
    return o;
  }
  function map(res, M, D, end) {
    var cap = end ? '最終日の状態' : '開始時';
    return '<figure class="zm-g"><figcaption>' + cap + '</figcaption><div class="zm-map" style="--ar:' + (VH / VW * 100).toFixed(3) + '%">' + base(res, M, D, end, cap) + pins(res, M, end) + '</div></figure>';
  }
  HK.zombieMapHtml = function (res) {
    var M = res.end && res.end.zombie && res.end.zombie.map;
    if (!M || !M.names || !HK.Icons) return '';
    var D = defs(res, M);
    return '<details class="zmap"' + (isOpen() ? ' open' : '') + '>' +
      '<summary>街のマップ（開始地点と最後の状態）</summary>' +
      '<div class="zm-wrap">' + map(res, M, D, false) + map(res, M, D, true) + '</div>' +
      '<p class="hint">区画の色が濃いほど、点々（群れ）が多いほどゾンビが多い。道でつながった上下左右の区画にしか移動できない。ピンは住人のいた場所。最後の状態では、亡くなった人（破線のピン）は倒れた場所、ゾンビになった人（斜線のピン）は今さまよっている場所に立っている。札は救助・脱出・生存・死亡・ゾンビ（図が狭いときは頭の1文字）。</p></details>';
  };
  document.addEventListener('toggle', function (e) {
    var d = e.target;
    if (d && d.classList && d.classList.contains('zmap')) { try { localStorage.setItem(KEY(), d.open ? '1' : '0'); } catch (x) { /* 保存できなくても開閉はできる */ } }
  }, true);
  var baseEnd = HK.Endings.zombie;
  HK.Endings.zombie = function (res, X) {
    var o = baseEnd(res, X);
    o.after = HK.zombieMapHtml(res);
    return o;
  };
})();
