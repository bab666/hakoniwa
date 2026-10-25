/* 箱庭シミュレーター notice: TOPの「仕様上のご注意」のポップアップ（index.html の #notice）。
   開く：data-act="notice-open"／閉じる：data-act="notice-close"・背景クリック・Esc。中身は index.html に書いてある（R18版と全年齢版で一行だけ違う） */
(function () {
  'use strict';
  var last = null;
  function box() { return document.getElementById('notice'); }
  function open() {
    var m = box(); if (!m) return;
    last = document.activeElement;
    m.hidden = false;
    var c = m.querySelector('[data-act="notice-close"]'); if (c) c.focus();
  }
  function close() {
    var m = box(); if (!m || m.hidden) return;
    m.hidden = true;
    if (last && last.focus) last.focus();
    last = null;
  }
  document.addEventListener('click', function (ev) {
    var t = ev.target.closest && ev.target.closest('[data-act="notice-open"],[data-act="notice-close"]');
    if (t) { ev.preventDefault(); if (t.getAttribute('data-act') === 'notice-open') open(); else close(); return; }
    var m = box();
    if (m && !m.hidden && ev.target === m) close();
  });
  document.addEventListener('keydown', function (ev) {
    var m = box();
    if (ev.key === 'Escape' && m && !m.hidden) { ev.preventDefault(); close(); }
  });
  window.HK = window.HK || {};
  window.HK.Notice = { open: open, close: close };
})();
