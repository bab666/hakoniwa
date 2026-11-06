/* 箱庭シミュレーター: 画面の上の部分（2026-10-27 のデザインの適用。結果には影響しない）
   ・箱庭を選ぶ窓（#bxpick）の一覧の上に、タグの絞り込みの札（複数選択。2026-11-07 に 5 分類から変えた。語・判定・選択の残し方は late の scen-tags.js の HK.ScenTags。PC の上の一覧と同じ選択）。
     表示だけで、選んだ箱庭・保存には触らない（選んだカードは絞り込んでも出す）。カードの HTML は ui.js（ui-box-draw.js が箱庭ごとに1回だけ作る）のまま。
     札の行はカードの一覧（.scens）の直前に別の要素として置き、カードには .fltoff を付け外しするだけ
   ・工程タブに、住人の数（住人）と選んだ箱庭の名前（箱庭）を小さく添える
   ・年齢モードの切り替え（safe.js が .brand に足す .agemode）をヘッダーのチップの列（#agemode-slot）へ、「R18モード」の札はフッターのリンクの列へ移す */
(function () {
  'use strict';
  var HK = window.HK;
  if (!HK || typeof document === 'undefined') return;
  var css = '.scfilt{display:flex;flex-wrap:wrap;gap:6px;margin:0 0 12px}' +
    '.scfilt .fn{font-family:var(--f-num);font-size:11px;margin-left:4px;opacity:.85}' +
    '#view-box .scens>.fltoff{display:none!important}' +
    '.tab .tabn{font-family:var(--f-num);font-size:11px;font-weight:400;color:var(--muted2);margin-left:8px;max-width:11em;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}' +
    '.tab .tabn:empty{display:none}@media (max-width:600px){.tab .tabn{display:none}}' +
    '#agemode-slot{display:contents}#agemode-slot .agemode{margin:0}' +
    '.foot-links .agenow{display:inline-flex;align-items:center;min-height:36px;padding:0 12px;border:1px solid var(--ink);border-radius:var(--r,4px);color:var(--ink);font-family:var(--f-num);font-size:11px;font-weight:600;letter-spacing:.08em}';
  var st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);

  function meta(id) { return (HK.SCENARIOS && HK.SCENARIOS[id]) || (HK.Load && HK.Load.meta && HK.Load.meta(id)) || null; }
  /* 札の行とカードの出し入れ（2026-11-07：5 分類の札をタグの絞り込みに。札の語・判定・残し方は late の scen-tags.js の HK.ScenTags。読む前は札の行を出さない） */
  function filt() {
    var box = document.getElementById('view-box'), grid = box && box.querySelector('.scens'), TG = HK.ScenTags;
    if (!grid) return;
    var cards = [], ids = [], ad = [];
    Array.prototype.forEach.call(grid.children, function (c) {
      if (!c.classList || !c.classList.contains('scen')) return;
      var inp = c.querySelector('input[name="scen"]');
      if (!inp) { if (c.classList.contains('r18link')) ad.push(c); return; }
      cards.push(c); ids.push(inp.value);
    });
    var row = grid.previousElementSibling, any = !!(TG && TG.sel().length);
    if (!row || !row.classList.contains('scfilt')) {
      row = document.createElement('div'); row.className = 'scfilt'; row.setAttribute('role', 'region'); row.setAttribute('aria-label', '箱庭の絞り込み');
      grid.parentNode.insertBefore(row, grid);
    }
    var html = TG ? TG.bar(ids) : '';
    row.hidden = !html;
    if (row.getAttribute('data-h') !== html) { row.innerHTML = html; row.setAttribute('data-h', html); }
    cards.forEach(function (c, i) {
      var off = !!TG && !TG.match(ids[i]) && !c.classList.contains('on');
      if (c.classList.contains('fltoff') !== off) c.classList.toggle('fltoff', off);
    });
    /* 全年齢版の R-18版の案内のカードは、絞っていないときだけ（「箱庭を追加」はいつも） */
    ad.forEach(function (c) { if (c.classList.contains('fltoff') !== any) c.classList.toggle('fltoff', any); });
  }
  HK.ScenFilter = { sync: function () { filt(); } };
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
  function init() {
    sync();
    var main = document.querySelector('main');
    if (main && window.MutationObserver) new MutationObserver(later).observe(main, { childList: true, subtree: true });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
