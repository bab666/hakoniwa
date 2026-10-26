/* 箱庭シミュレーター: 項目ごとの折りたたみ
   各タブ（住人／箱庭と環境／経過と結末）を描き直すたびに、見出し（h2.sec）から次の見出しまでを
   <details> にまとめて、押すと開閉できるようにする。開閉の状態は見出しごとに覚えておく（この画面を開いているあいだ＋ブラウザに保存）。
   結果では「関係の結末」「住人ごとの読み解き」を最初は閉じておく。
   class="nofold" の要素は折りたたみの中に入れない（節を閉じても見えたまま）。 */
(function () {
  'use strict';
  var HK = window.HK;
  var CLOSED = { '関係の結末': 1, '住人ごとの読み解き': 1 };
  var KEY = HK && HK.STORE ? HK.STORE.key('hakoniwa_fold_v1') : 'hakoniwa_fold_v1', state = {};   /* 鍵は版ごと（safe.js の HK.STORE） */
  try { state = JSON.parse(localStorage.getItem(KEY) || '{}') || {}; } catch (e) { state = {}; }
  function save() { try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) { /* 保存できなくても開閉はできる */ } }
  function norm(t) { return String(t || '').replace(/[\d０-９\/／\s　]+/g, '').slice(0, 30); }

  function fold(host) {
    if (!host) return;
    var kids = Array.prototype.slice.call(host.children);
    if (!kids.some(function (k) { return k.tagName === 'H2' && k.classList.contains('sec'); })) return;
    var tab = host.id, cur = null;
    kids.forEach(function (el) {
      if (el.tagName === 'H2' && el.classList.contains('sec')) {
        var title = norm(el.textContent.replace(/？/g, '')), k = tab + ':' + title;
        var d = document.createElement('details');
        d.className = 'fold';
        if (el.id) { d.id = 'fold-' + el.id; }
        var open = state[k] != null ? state[k] : !(tab === 'view-result' && CLOSED[title]);
        if (open) d.open = true;
        var s = document.createElement('summary');
        host.insertBefore(d, el);
        s.appendChild(el);
        d.appendChild(s);
        d.addEventListener('toggle', function () { state[k] = d.open; save(); });
        cur = d;
        return;
      }
      /* nofold（「箱庭を動かす」の帯など）は折りたたみに入れず、その節の details の直後に残す（閉じても見えるように）。後に続くものも details の外に置く */
      if (el.classList && el.classList.contains('nofold')) { cur = null; return; }
      if (cur) cur.appendChild(el);
    });
  }
  HK.Fold = { apply: fold };

  function watch(id) {
    var host = document.getElementById(id);
    if (!host || typeof MutationObserver === 'undefined') return;
    var busy = false;
    new MutationObserver(function () {
      if (busy) return;
      busy = true;
      try { fold(host); } finally { busy = false; }
    }).observe(host, { childList: true });
    fold(host);
  }
  function init() { if (typeof document === 'undefined' || typeof document.getElementById !== 'function') return; ['view-cast', 'view-box', 'view-result'].forEach(watch); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
