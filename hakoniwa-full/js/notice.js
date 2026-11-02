/* 箱庭シミュレーター notice: TOPの「仕様上のご注意」のポップアップ（index.html の #notice）。
   開く：data-act="notice-open"／閉じる：data-act="notice-close"・背景クリック・Esc。中身は index.html に書いてある（R18版と全年齢版で一行だけ違う） */
(function () {
  'use strict';
  var last = null;
  function box() { return document.getElementById('notice'); }
  /* 題名と「閉じる」を固定し、箇条書きだけをスクロールする形に組み直す（初めて開くとき一度だけ。見た目は ui-modal.js。2026-11-02 担当UG） */
  function shape(m) {
    var bx = m.querySelector('.modal-box');
    if (!bx || bx.querySelector('.nobody')) return;
    var h = bx.querySelector('.notice-title'), c = bx.querySelector('[data-act="notice-close"]'), row = c && c.closest('.row');
    var body = document.createElement('div'); body.className = 'nobody';
    Array.prototype.slice.call(bx.childNodes).forEach(function (n) { if (n !== h && n !== row) body.appendChild(n); });
    bx.appendChild(body);
    if (row) { row.className = 'nofoot'; row.removeAttribute('style'); bx.appendChild(row); }
  }
  function open() {
    var m = box(); if (!m) return;
    last = document.activeElement;
    shape(m);
    m.hidden = false;
    if (window.HK && window.HK.Modal) window.HK.Modal.lock(m);
    var c = m.querySelector('[data-act="notice-close"]'); if (c) c.focus();
  }
  function close() {
    var m = box(); if (!m || m.hidden) return;
    m.hidden = true;
    if (window.HK && window.HK.Modal) window.HK.Modal.unlock(m);
    if (last && last.focus) try { last.focus({ preventScroll: true }); } catch (e) { last.focus(); }
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
