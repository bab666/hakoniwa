/* 箱庭シミュレーター: 「不具合の記録」の窓（2026-11-04。late。記録そのものは中核の ui-guard.js の HK.Guard）
   右上の「表示」のメニューのいちばん下に「不具合の記録（n 件）」を出し、押すと窓で記録を見せる。
   窓：記録の文（新しい順。ブラウザ・画面・版つき）・「コピー」・「記録を消す」・「画面をもう一度表示する」。
   不具合を知らせてもらうときに、この文を貼ってもらう（スマホでも PC でも同じ） */
(function () {
  'use strict';
  var HK = window.HK;
  if (!HK || !HK.Guard || typeof document === 'undefined') return;
  var G = HK.Guard, esc = HK.escape || function (s) { return String(s).replace(/[&<>"']/g, function (c) { return '&#' + c.charCodeAt(0) + ';'; }); };
  var css = '.hkerr .gearbody{display:grid;gap:12px;align-content:start}.hkerr pre{margin:0;padding:10px 12px;max-height:50vh;max-height:50dvh;overflow:auto;white-space:pre-wrap;word-break:break-all;' +
    'font:12px/1.6 var(--f-num,ui-monospace,Menlo,Consolas,monospace);background:var(--ui-soft,var(--bg1,#f4f5f7));border-radius:8px;-webkit-user-select:text;user-select:text}' +
    '.hkerr .hkerr-b{display:flex;flex-wrap:wrap;align-items:center;gap:8px}.hkerr p{margin:0;font-size:13px}' +
    '.uidm-err .btn{min-height:36px}';
  var st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);

  /* ---------- 表示のメニューの行 ---------- */
  function label() { var n = G.list().length; return '不具合の記録' + (n ? '（' + n + '件）' : ''); }
  function row() {
    var m = document.getElementById('uidisp-menu');
    if (!m) return null;
    var r = m.querySelector('.uidm-err');
    if (!r) {
      r = document.createElement('div');
      r.className = 'uidm-row uidm-err';
      r.innerHTML = '<span class="uidm-h">不具合</span><button type="button" class="btn small" data-hkerr="open"></button><span class="uidm-note">画面が真っ白になった・動かないときの記録です。知らせるときにコピーして貼ってください</span>';
      m.appendChild(r);
    }
    r.querySelector('[data-hkerr]').textContent = label();
    return r;
  }

  /* ---------- 窓 ---------- */
  var ov = null, opener = null;
  function body() {
    return '<p>このブラウザで起きた画面のエラーと、画面が空になったことの記録です（' + G.list().length + '件。新しい 40 件まで。住人の名前や設定は入りません）。</p>' +
      '<pre id="hkerr-text" tabindex="0">' + esc(G.text()) + '</pre>' +
      '<div class="hkerr-b"><button type="button" class="btn primary" data-hkerr="copy">コピー</button><button type="button" class="btn" data-hkerr="redraw">画面をもう一度表示する</button><button type="button" class="btn ghost" data-hkerr="clear">記録を消す</button></div>';
  }
  function open(from) {
    close();
    opener = from || document.activeElement;
    ov = document.createElement('div');
    ov.className = 'gearov tipov hkerr';
    ov.innerHTML = '<div class="gearbox" role="dialog" aria-modal="true" aria-labelledby="hkerr-title" tabindex="-1"><div class="gearhd"><h2 id="hkerr-title">不具合の記録</h2><button type="button" class="btn small" data-hkerr="close">閉じる</button></div><div class="gearbody">' + body() + '</div></div>';
    document.body.appendChild(ov);
    if (HK.Modal) HK.Modal.lock(ov);
    document.addEventListener('keydown', onKey, true);
    var bx = ov.querySelector('.gearbox'); if (bx) try { bx.focus({ preventScroll: true }); } catch (e) { bx.focus(); }
  }
  function close() {
    if (!ov) return;
    var o = ov; ov = null; o.remove();
    if (HK.Modal) HK.Modal.unlock(o);
    document.removeEventListener('keydown', onKey, true);
    if (opener && opener.focus) try { opener.focus({ preventScroll: true }); } catch (e) { /* 何もしない */ }
    opener = null;
  }
  function onKey(e) { if (e.key === 'Escape') { e.stopPropagation(); close(); } }
  function copy(b) {
    var txt = G.text(), done = function (ok) { b.textContent = ok ? 'コピーしました' : 'コピーできませんでした（上の文を長押しで選んでください）'; };
    var fb = function () {
      var pre = document.getElementById('hkerr-text'), ok = false;
      try { var r = document.createRange(); r.selectNodeContents(pre); var s = window.getSelection(); s.removeAllRanges(); s.addRange(r); ok = document.execCommand('copy'); } catch (e) { ok = false; }
      done(ok);
    };
    try { if (navigator.clipboard && navigator.clipboard.writeText) { navigator.clipboard.writeText(txt).then(function () { done(true); }, fb); return; } } catch (e) { /* 下で */ }
    fb();
  }
  document.addEventListener('click', function (e) {
    if (e.target.closest && e.target.closest('[data-uidisp]')) { setTimeout(row, 0); return; }
    if (ov && e.target === ov) { close(); return; }
    var b = e.target.closest && e.target.closest('[data-hkerr]');
    if (!b) return;
    var a = b.getAttribute('data-hkerr');
    if (a === 'open') open(b);
    else if (a === 'close') close();
    else if (a === 'copy') copy(b);
    else if (a === 'clear') { G.clear(); var bd = ov && ov.querySelector('.gearbody'); if (bd) bd.innerHTML = body(); row(); }
    else if (a === 'redraw') { close(); if (HK.UI && HK.UI.refresh) HK.UI.refresh(); G.check(); }
  });
  row();
  HK.GuardView = { open: open, close: close };
})();
