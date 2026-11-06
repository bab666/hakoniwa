/* 箱庭シミュレーター: 折れ線のグラフの部品（HK.Chart。2026-11-06）
   HK.Chart.line(series, opt) → SVG を入れた <figure> の HTML の文字列（結末のカードの after などに入れる。hakoniwa-packs/README.md）
     series：[{ name: 凡例の名前, values: [数 か null（その点を飛ばす）], max: その線の上限, unit: 単位, col: 色の CSS の変数名 }]（2 本まで。2 本目は右の目盛り）
     opt：{ w 幅（既定 320）, h 高さ（既定 110）, max 左の目盛りの上限, labels 横の目盛りの文字, cols 線の色の CSS の変数名の並び, aria 読み上げの名前, caption 図の下の一行 }
   見た目は迷宮の推移（dungeon-view.js の gauge）と同じ：枠 .dggauge・目盛りは 0／半分／上限の 3 本・凡例は figcaption の .legend。
   色はすべて CSS の変数（--accent・--love・--line・--muted）なので、ダークの見た目にもそのまま合う。線は vector-effect:non-scaling-stroke（幅を変えても太さが同じ） */
(function () {
  'use strict';
  var HK = window.HK;
  if (!HK) return;
  var esc = HK.escape || function (s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); };
  var COLS = ['--accent', '--love'];
  function num(v) { return typeof v === 'number' && isFinite(v) ? v : null; }
  /* 目盛りの上限を切りのよい数に（12 → 20、130 → 200、4300 → 5000） */
  function nice(m) {
    if (!(m > 0)) return 1;
    var p = Math.pow(10, Math.floor(Math.log(m) / Math.LN10)), f = m / p;
    return (f <= 1 ? 1 : f <= 2 ? 2 : f <= 5 ? 5 : 10) * p;
  }
  /* 目盛りの数の書き方（1 万以上は「万」） */
  function fmt(v, unit) {
    var s = v >= 10000 && v % 1000 === 0 ? (v / 10000) + '万' : String(Math.round(v * 10) / 10);
    return s + (unit || '');
  }
  function colOf(c) { c = String(c || ''); return /^--[a-z0-9-]+$/i.test(c) ? 'var(' + c + ')' : 'var(--accent)'; }
  HK.Chart = {
    line: function (series, opt) {
      opt = opt || {};
      var S = (series || []).filter(function (s) { return s && Array.isArray(s.values); }).slice(0, 2);
      var n = S.reduce(function (m, s) { return Math.max(m, s.values.length); }, 0);
      if (!S.length || n < 2) return '';
      var W = Math.max(160, +opt.w || 320), H = Math.max(60, +opt.h || 110), two = S.length > 1;
      var pl = 36, pr = two ? 44 : 10, pt = 8, pb = 18, iw = W - pl - pr, ih = H - pt - pb;
      /* 線ごとの上限：左（1 本目）は opt.max か線の max、右（2 本目）は線の max。無ければ値から切りのよい数 */
      var mx = S.map(function (s, k) {
        var v = num(k === 0 && opt.max != null ? +opt.max : s.max != null ? +s.max : null);
        if (v != null && v > 0) return v;
        return nice(s.values.reduce(function (m, x) { x = num(x); return x != null && x > m ? x : m; }, 0));
      });
      var x = function (i) { return pl + iw * i / (n - 1); };
      var y = function (v, k) { return pt + ih * (1 - Math.max(0, Math.min(mx[k], v)) / mx[k]); };
      var cols = S.map(function (s, k) { return colOf(s.col || (opt.cols && opt.cols[k]) || COLS[k]); });
      var g = [0, 0.5, 1].map(function (f) {
        var yy = (pt + ih * (1 - f)).toFixed(1);
        return '<line x1="' + pl + '" x2="' + (W - pr) + '" y1="' + yy + '" y2="' + yy + '" stroke="var(--line)" stroke-width="1" vector-effect="non-scaling-stroke"/>' +
          '<text x="' + (pl - 5) + '" y="' + (+yy + 3.5) + '" text-anchor="end" font-size="10" fill="var(--muted)">' + esc(fmt(mx[0] * f, S[0].unit)) + '</text>' +
          (two ? '<text x="' + (W - pr + 5) + '" y="' + (+yy + 3.5) + '" text-anchor="start" font-size="10" fill="var(--muted)">' + esc(fmt(mx[1] * f, S[1].unit)) + '</text>' : '');
      }).join('');
      /* 横の目盛り：多ければ間引く（最初と最後は必ず） */
      var L = Array.isArray(opt.labels) ? opt.labels : [], step = Math.max(1, Math.ceil(n / Math.max(2, Math.floor(iw / 48))));
      var xl = L.length ? L.slice(0, n).map(function (t, i) {
        if (t == null || !(i === 0 || i === n - 1 || (i % step === 0 && n - 1 - i >= step))) return '';
        return '<text x="' + x(i).toFixed(1) + '" y="' + (H - 5) + '" text-anchor="' + (i === 0 ? 'start' : i === n - 1 ? 'end' : 'middle') + '" font-size="10" fill="var(--muted)">' + esc(t) + '</text>';
      }).join('') : '';
      var lines = S.map(function (s, k) {
        var d = '', pen = false;
        for (var i = 0; i < n; i++) { var v = num(s.values[i]); if (v == null) { pen = false; continue; } d += (pen ? 'L' : 'M') + x(i).toFixed(1) + ' ' + y(v, k).toFixed(1); pen = true; }
        return d ? '<path d="' + d + '" fill="none" stroke="' + cols[k] + '" stroke-width="2" stroke-linejoin="round" stroke-linecap="round" vector-effect="non-scaling-stroke"' + (k ? ' stroke-dasharray="5 3"' : '') + '/>' : '';
      }).join('');
      var aria = opt.aria || S.map(function (s) { return s.name; }).join('と') + 'の推移';
      var leg = S.map(function (s, k) { return '<span><i style="background:' + cols[k] + '"></i>' + esc(s.name || '') + (two ? (k ? '（右の目盛り）' : '（左の目盛り）') : '') + '</span>'; }).join('') + (opt.caption ? '<span>' + esc(opt.caption) + '</span>' : '');
      return '<figure class="dggauge hkchart"><svg viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="' + esc(aria) + '">' + g + xl + lines + '</svg><figcaption class="legend">' + leg + '</figcaption></figure>';
    }
  };
})();
