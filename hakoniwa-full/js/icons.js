/* 箱庭シミュレーター: キャラアイコン
   画像は読み込んだ時点で 128px 四方に切り抜き・縮小して保存する（重い画像をそのまま持たない）。
   アイコンがない人は、キャラ色のパステル丸にイニシャルを出す。結果側は名前で引く */
(function () {
  'use strict';
  var HK = window.HK, esc = HK.escape;
  var IC = HK.Icons = {};
  var map = {}, imgs = {}, cols = {};
  var SIZE = 128;
  function okCol(v) { return typeof v === 'string' && /^#[0-9a-fA-F]{6}$/.test(v); }
  /* イメージカラー（名前で引く）。並び替えや結果画面でも、その人の色で枠を描く */
  IC.colors = function (chars) { cols = {}; (chars || []).forEach(function (c) { if (c && okCol(c.color)) cols[c.name] = c.color; }); };
  IC.color = function (name) { return cols[name] || ''; };
  function colVar(name, i) { return cols[name] || 'var(--p' + ((i || 0) % 30) + ')'; }

  IC.set = function (chars) {
    map = {};
    IC.colors(chars);
    (chars || []).forEach(function (c) {
      if (!c.icon) return;
      map[c.name] = c.icon;
      if (!imgs[c.icon]) { var im = new Image(); im.decoding = 'async'; im.src = c.icon; imgs[c.icon] = im; }
    });
  };
  IC.url = function (name) { return map[name] || ''; };
  /* 書き出し画像用：読み込み済みの画像だけ返す（未完了ならイニシャルで描く） */
  IC.img = function (name) {
    var u = map[name], im = u && imgs[u];
    return im && im.complete && im.naturalWidth ? im : null;
  };
  function initial(name) { var s = String(name || '?').trim(); return s ? Array.from(s)[0] : '?'; }
  IC.initial = initial;

  /* HTML のアイコン。size は px、i はキャラ色の番号 */
  IC.html = function (name, i, size, extra) {
    var u = map[name], s = size || 28;
    return '<span class="av' + (extra ? ' ' + extra : '') + '" data-p="' + ((i || 0) % 30) + '" style="--c:' + colVar(name, i) + ';width:' + s + 'px;height:' + s + 'px;font-size:' + Math.round(s * 0.46) + 'px" title="' + esc(name) + '">' +
      (u ? '<img src="' + u + '" alt="" loading="lazy" decoding="async" width="' + s + '" height="' + s + '">' : '<b aria-hidden="true">' + esc(initial(name)) + '</b>') + '</span>';
  };

  /* SVG（関係図）のアイコン */
  IC.svg = function (name, i, x, y, r, uid) {
    var u = map[name], col = colVar(name, i);
    if (!u) return null;
    var id = 'avc' + uid;
    return '<clipPath id="' + id + '"><circle cx="' + x.toFixed(1) + '" cy="' + y.toFixed(1) + '" r="' + r + '"/></clipPath>' +
      '<image href="' + u + '" x="' + (x - r).toFixed(1) + '" y="' + (y - r).toFixed(1) + '" width="' + r * 2 + '" height="' + r * 2 + '" clip-path="url(#' + id + ')" preserveAspectRatio="xMidYMid slice"/>' +
      '<circle cx="' + x.toFixed(1) + '" cy="' + y.toFixed(1) + '" r="' + r + '" style="fill:none;stroke:' + col + '"/>';
  };

  /* ファイル → 正方形に切り抜いた小さな画像（data URL） */
  IC.fromFile = function (file) {
    return new Promise(function (ok, ng) {
      if (!file || !/^image\//.test(file.type)) { ng(new Error('type')); return; }
      if (file.size > 15 * 1024 * 1024) { ng(new Error('size')); return; }
      var url = URL.createObjectURL(file), im = new Image();
      im.onload = function () {
        var w = im.naturalWidth, h = im.naturalHeight, side = Math.min(w, h);
        // 縦長の立ち絵は顔が上にあることが多いので、上寄りで切り抜く
        var sx = (w - side) / 2, sy = h > w ? Math.min((h - side) * 0.12, h - side) : (h - side) / 2;
        var cv = document.createElement('canvas'); cv.width = cv.height = SIZE;
        var cx = cv.getContext('2d');
        cx.imageSmoothingEnabled = true; cx.imageSmoothingQuality = 'high';
        cx.fillStyle = '#ffffff'; cx.fillRect(0, 0, SIZE, SIZE); // 透過画像がJPEGで黒くならないように
        cx.drawImage(im, sx, sy, side, side, 0, 0, SIZE, SIZE);
        URL.revokeObjectURL(url);
        var out = cv.toDataURL('image/webp', 0.86);
        if (out.indexOf('data:image/webp') !== 0) out = cv.toDataURL('image/jpeg', 0.86); // 古いSafari
        cv.width = cv.height = 0;
        ok(out);
      };
      im.onerror = function () { URL.revokeObjectURL(url); ng(new Error('decode')); };
      im.src = url;
    });
  };
})();
