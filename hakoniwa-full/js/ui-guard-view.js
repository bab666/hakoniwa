/* 箱庭シミュレーター: 「不具合の記録」の窓（2026-11-04。late。記録そのものは中核の ui-guard.js の HK.Guard）
   右上の「表示」のメニューのいちばん下に「不具合の記録（n 件）」を出し、押すと窓で記録を見せる。
   窓：記録の文（新しい順。ブラウザ・画面・版つき）・「コピー」・「記録を消す」・「画面をもう一度表示する」。
   不具合を知らせてもらうときに、この文を貼ってもらう（スマホでも PC でも同じ）
   2026-11-04 追記：「Safari の表示を軽くする（真っ白・飛びの対策）：自動／入／切」のスイッチを、表示のメニューの「不具合」の行の上と、この窓の中に置く
   （HK.Guard.safe。自動＝iPhone・iPad の Safari 16〜18 だけ入。切り替えはすぐ当たり、このブラウザに残る。safari-scroll.md の 8） */
(function () {
  'use strict';
  var HK = window.HK;
  if (!HK || !HK.Guard || typeof document === 'undefined') return;
  var G = HK.Guard, esc = HK.escape || function (s) { return String(s).replace(/[&<>"']/g, function (c) { return '&#' + c.charCodeAt(0) + ';'; }); };
  var css = '.hkerr .gearbody{display:grid;gap:12px;align-content:start}.hkerr pre{margin:0;padding:10px 12px;max-height:50vh;max-height:50dvh;overflow:auto;white-space:pre-wrap;word-break:break-all;' +
    'font:12px/1.6 var(--f-num,ui-monospace,Menlo,Consolas,monospace);background:var(--ui-soft,var(--bg1,#f4f5f7));border-radius:8px;-webkit-user-select:text;user-select:text}' +
    '.hkerr .hkerr-b{display:flex;flex-wrap:wrap;align-items:center;gap:8px}.hkerr p{margin:0;font-size:13px}' +
    '.uidm-err .btn{min-height:36px}.hkerr .hksafe{display:flex;flex-wrap:wrap;align-items:center;gap:6px 10px}.hkerr .hksafe b{font-size:13px}';
  var st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);

  /* ---------- Safari の表示を軽くする（自動／入／切） ---------- */
  var SF = G.safe;
  function safeNote() {
    if (!SF) return '';
    var m = SF.mode(), on = SF.on();
    return (m === 'auto' ? '自動：この端末では' + (SF.legacy ? '入（Safari 16〜18）' : '切') : on ? '入にしています' : '切にしています') +
      '。入にすると、上に止まる切替をやめるなど、画面が真っ白になる・位置が飛ぶのを避ける表示にします';
  }
  function safeSeg(pre) {
    if (!SF) return '';
    var m = SF.mode(), b = function (k, t) { return '<button type="button" data-hksafe="' + k + '" aria-pressed="' + (m === k) + '">' + t + '</button>'; };
    return '<div class="uiseg" role="group" aria-label="Safari の表示を軽くする' + (pre || '') + '">' + b('auto', '自動') + b('on', '入') + b('off', '切') + '</div>';
  }
  function safeRow(m) {
    if (!SF) return;
    var r = m.querySelector('.uidm-safe');
    if (!r) {
      r = document.createElement('div');
      r.className = 'uidm-row uidm-safe';
      var e = m.querySelector('.uidm-err');
      m.insertBefore(r, e || null);
    }
    r.innerHTML = '<span class="uidm-h">Safari の表示を軽くする</span>' + safeSeg() + '<span class="uidm-note">真っ白・飛びの対策。' + esc(safeNote()) + '</span>';
  }
  function safeSync() {
    var m = document.getElementById('uidisp-menu'); if (m) safeRow(m);
    var w = ov && ov.querySelector('.hksafe'); if (w) w.innerHTML = safeBox();
  }
  function safeBox() { return '<b>Safari の表示を軽くする（真っ白・飛びの対策）</b>' + safeSeg('（記録の窓）') + '<p>' + esc(safeNote()) + '</p>'; }

  /* ---------- 表示のメニューの行 ---------- */
  function label() { var n = G.list().length; return '不具合の記録' + (n ? '（' + n + '件）' : ''); }
  function row() {
    var m = document.getElementById('uidisp-menu');
    if (!m) return null;
    var r = m.querySelector('.uidm-err');
    if (!r) {
      r = document.createElement('div');
      r.className = 'uidm-row uidm-err';
      r.innerHTML = '<span class="uidm-h">不具合</span><button type="button" class="btn small" data-hkerr="open"></button><span class="uidm-note">画面が真っ白になった・動かない・スクロールで飛んだときの記録です。知らせるときにコピーして貼ってください</span>';
      m.appendChild(r);
    }
    r.querySelector('[data-hkerr]').textContent = label();
    safeRow(m);
    return r;
  }

  /* ---------- 窓 ---------- */
  var ov = null, opener = null;
  function body() {
    return '<p>このブラウザで起きた画面のエラー・画面が空になったこと・読み込めなかったデータ・操作なしのスクロールや位置の飛びの記録です（' + G.list().length + '件。新しい 40 件まで。住人の名前や設定は入りません）。</p>' +
      (SF ? '<div class="hksafe">' + safeBox() + '</div>' : '') +
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
    var sb = e.target.closest && e.target.closest('[data-hksafe]');
    if (sb && SF) {
      SF.set(sb.getAttribute('data-hksafe'));
      safeSync();
      var pre = ov && document.getElementById('hkerr-text'); if (pre) pre.textContent = G.text();
      if (HK.UI && HK.UI.toast) HK.UI.toast('Safari の表示を軽くする：' + ({ auto: '自動', on: '入', off: '切' })[SF.mode()] + (SF.on() ? '（有効）' : '（無効）'));
      return;
    }
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
