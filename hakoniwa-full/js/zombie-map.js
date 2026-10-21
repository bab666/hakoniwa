/* 箱庭シミュレーター: ゾンビの街 ― 開始地点と最後の状態のエリアマップ（折りたたみ）
   3×3の街区に、ゾンビの多さ（色の濃さ）・避難所・出口・ヘリの着陸地点と、住人のアイコンを並べる。
   左が開始時、右が最終日の状態。結末の枠の中に <details> で入れる */
(function () {
  'use strict';
  var HK = window.HK;
  if (!HK.Endings || !HK.Endings.zombie) return;
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  var KEY = 'hakoniwa_zmap_open';
  function isOpen() { try { return localStorage.getItem(KEY) !== '0'; } catch (e) { return true; } }
  function tag(f) {
    if (/救助/.test(f)) return ['救助', 'ok'];
    if (/脱出/.test(f)) return ['脱出', 'ok'];
    if (/ゾンビ/.test(f)) return ['ゾンビ', 'z'];
    if (/生き延び/.test(f)) return ['生存', 'ok'];
    return ['死亡', 'dead'];
  }
  function grid(res, M, end) {
    var cells = M.names.map(function (name, i) {
      var z = (end ? M.z1 : M.z0)[i] || 0;
      var badges = [];
      if (M.shelter[i]) badges.push(end && M.fell && M.safe === i ? '避難所（陥落）' : '避難所');
      if (M.exit[i]) badges.push('出口');
      if (end && M.heli === i) badges.push('ヘリ');
      if (end && M.safe === i && !M.fell) badges.push('本当に安全');
      var who = M.chars.map(function (c, k) { return { c: c, k: k }; }).filter(function (o) { return (end ? o.c.l : o.c.s) === i; });
      var people = who.map(function (o) {
        var ch = res.chars[o.k]; if (!ch) return '';
        var t = end ? tag(o.c.f) : null;
        return '<span class="zm-p' + (t ? ' ' + t[1] : '') + '" title="' + esc(ch.name + (t ? '：' + o.c.f : '')) + '">' + HK.Icons.html(ch.name, o.k, 26, t && t[1] !== 'ok' ? 'gone' : '') + (t ? '<i>' + t[0] + '</i>' : '') + '</span>';
      }).join('');
      return '<div class="zm-c"><span class="zm-fog" style="opacity:' + (Math.min(100, z) / 100 * 0.55).toFixed(2) + '"></span>' +
        '<b class="zm-n">' + esc(name) + '</b><span class="zm-z num">ゾンビ ' + z + '</span>' +
        (badges.length ? '<span class="zm-b">' + badges.map(esc).join('・') + '</span>' : '') +
        '<span class="zm-ps">' + people + '</span></div>';
    }).join('');
    return '<figure class="zm-g"><figcaption>' + (end ? '最終日の状態' : '開始時') + '</figcaption><div class="zm-grid">' + cells + '</div></figure>';
  }
  HK.zombieMapHtml = function (res) {
    var M = res.end && res.end.zombie && res.end.zombie.map;
    if (!M || !M.names || !HK.Icons) return '';
    return '<details class="zmap"' + (isOpen() ? ' open' : '') + '>' +
      '<summary>街のマップ（開始地点と最後の状態）</summary>' +
      '<div class="zm-wrap">' + grid(res, M, false) + grid(res, M, true) + '</div>' +
      '<p class="hint">色が濃いほどゾンビが多い。隣り合う区画（上下左右）にしか移動できない。最後の状態では、亡くなった人は倒れた場所、ゾンビになった人は今さまよっている場所に表示。</p></details>';
  };
  document.addEventListener('toggle', function (e) {
    var d = e.target;
    if (d && d.classList && d.classList.contains('zmap')) { try { localStorage.setItem(KEY, d.open ? '1' : '0'); } catch (x) { /* 保存できなくても開閉はできる */ } }
  }, true);
  var base = HK.Endings.zombie;
  HK.Endings.zombie = function (res, X) {
    var o = base(res, X);
    o.after = HK.zombieMapHtml(res);
    return o;
  };
})();
