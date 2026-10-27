/* 箱庭シミュレーター: 画面の上の部分（2026-10-27 のデザインの適用。結果には影響しない）
   ・箱庭タブの一覧の上に絞り込みの札（すべて／日常／極限／ひとり用／R-18 のみ）。表示だけで、選んだ箱庭・保存には触らない（選んだカードは絞り込んでも出す）。
     カードの HTML は ui.js（ui-box-draw.js が箱庭ごとに1回だけ作る）のまま。札の行はカードの一覧（.scens）の直前に別の要素として置き、カードには .fltoff を付け外しするだけ
     分類：極限＝下の EXTREME、ひとり用＝solo の箱庭（極限を除く）、日常＝それ以外、R-18 のみ＝R18 の札のカード（.scen.adult。R18版だけ）。数が 0 の札は出さない
   ・工程タブに、住人の数（住人）と選んだ箱庭の名前（箱庭）を小さく添える
   ・年齢モードの切り替え（safe.js が .brand に足す .agemode）をヘッダーのチップの列（#agemode-slot）へ、「R18モード」の札はフッターのリンクの列へ移す */
(function () {
  'use strict';
  var HK = window.HK;
  if (!HK || typeof document === 'undefined') return;
  var EXTREME = ['island', 'zombie', 'jashin', 'yakata', 'rpg', 'jinro', 'ship', 'br', 'trial', 'dungeon'];
  var CATS = [['all', 'すべて'], ['daily', '日常'], ['extreme', '極限'], ['solo', 'ひとり用'], ['r18', 'R-18 のみ']];
  var cur = 'all';
  var css = '.scfilt{display:flex;flex-wrap:wrap;gap:6px;margin:0 0 12px}' +
    '.scfilt .fn{font-family:var(--f-num);font-size:11px;margin-left:4px;opacity:.85}' +
    '#view-box .scens>.fltoff{display:none!important}' +
    '.tab .tabn{font-family:var(--f-num);font-size:11px;font-weight:400;color:var(--muted2);margin-left:8px;max-width:11em;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}' +
    '.tab .tabn:empty{display:none}@media (max-width:600px){.tab .tabn{display:none}}' +
    '#agemode-slot{display:contents}#agemode-slot .agemode{margin:0}' +
    '.foot-links .agenow{display:inline-flex;align-items:center;min-height:36px;padding:0 12px;border:1px solid var(--ink);border-radius:var(--r,4px);color:var(--ink);font-family:var(--f-num);font-size:11px;font-weight:600;letter-spacing:.08em}';
  var st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);

  function meta(id) { return (HK.SCENARIOS && HK.SCENARIOS[id]) || (HK.Load && HK.Load.meta && HK.Load.meta(id)) || null; }
  function catOf(card) {
    var inp = card.querySelector('input[name="scen"]');
    if (!inp) return null;
    var id = inp.value, m = meta(id) || {}, ex = EXTREME.indexOf(id) >= 0, so = !ex && !!m.solo;
    return { all: true, extreme: ex, solo: so, daily: !ex && !so, r18: card.classList.contains('adult') };
  }
  /* 札の行とカードの出し入れ */
  function filt() {
    var box = document.getElementById('view-box'), grid = box && box.querySelector('.scens');
    if (!grid) return;
    var cards = [], info = [], n = {}, ad = null;
    Array.prototype.forEach.call(grid.children, function (c) {
      if (!c.classList || !c.classList.contains('scen')) return;
      if (c.classList.contains('r18link')) { ad = c; return; }
      var k = catOf(c);
      if (!k) return;
      cards.push(c); info.push(k);
      CATS.forEach(function (x) { if (k[x[0]]) n[x[0]] = (n[x[0]] || 0) + 1; });
    });
    if (!n[cur]) cur = 'all';
    var html = CATS.filter(function (x) { return x[0] === 'all' || n[x[0]]; }).map(function (x) {
      return '<button type="button" class="chip" data-scflt="' + x[0] + '" aria-pressed="' + (cur === x[0]) + '">' + x[1] + (x[0] === 'all' ? '<span class="fn">' + (n.all || 0) + '</span>' : '') + '</button>';
    }).join('');
    var row = grid.previousElementSibling;
    if (!row || !row.classList.contains('scfilt')) {
      row = document.createElement('div'); row.className = 'scfilt'; row.setAttribute('role', 'group'); row.setAttribute('aria-label', '箱庭の絞り込み');
      grid.parentNode.insertBefore(row, grid);
    }
    if (row.getAttribute('data-h') !== html) { row.innerHTML = html; row.setAttribute('data-h', html); }
    cards.forEach(function (c, i) {
      var off = cur !== 'all' && !info[i][cur] && !c.classList.contains('on');
      if (c.classList.contains('fltoff') !== off) c.classList.toggle('fltoff', off);
    });
    if (ad && ad.classList.contains('fltoff') !== (cur !== 'all')) ad.classList.toggle('fltoff', cur !== 'all');
  }
  /* 工程タブに添える数・名前 */
  function put(id, t) {
    var b = document.getElementById(id);
    if (!b) return;
    var s = b.querySelector('.tabn');
    if (!s) { s = document.createElement('small'); s.className = 'tabn'; b.appendChild(s); }
    if (s.textContent !== t) s.textContent = t;
  }
  function tabs() {
    var S = HK.UI && HK.UI.state ? HK.UI.state() : null;
    if (!S) return;
    put('tab-cast', S.chars && S.chars.length ? S.chars.length + '人' : '');
    var m = S.scenId ? meta(S.scenId) : null;
    put('tab-box', m && m.name ? m.name : '');
  }
  /* 年齢モードの切り替え・札の置き場 */
  function age() {
    var slot = document.getElementById('agemode-slot'), box = document.querySelector('header.top .brand > .agemode');
    if (slot && box) slot.appendChild(box);
    var now = document.querySelector('#agemode-slot .agemode .now'), fl = document.querySelector('.site-foot .foot-links');
    if (now && fl) { now.classList.add('agenow'); fl.insertBefore(now, fl.firstChild); }
  }
  var raf = 0;
  function sync() { raf = 0; age(); tabs(); filt(); }
  function later() { if (!raf) raf = (window.requestAnimationFrame || setTimeout)(sync); }
  document.addEventListener('click', function (ev) {
    var b = ev.target && ev.target.closest && ev.target.closest('[data-scflt]');
    if (!b) return;
    cur = b.getAttribute('data-scflt') || 'all';
    filt();
  });
  function init() {
    sync();
    var main = document.querySelector('main');
    if (main && window.MutationObserver) new MutationObserver(later).observe(main, { childList: true, subtree: true });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
