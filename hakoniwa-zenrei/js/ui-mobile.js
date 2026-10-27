/* 箱庭シミュレーター: スマホ幅（600px以下）向けの調整
   ・箱庭タブの「箱庭を動かす」の帯（.runbar）を画面の下に固定する（高さ 44px のボタン。箱庭タブを見ているあいだだけ。
     帯が出ているあいだは html に hk-runfix を付け、本文の下・知らせ（.toast）・読み込み失敗の帯（#loadfail）・上へ／下へのボタン（#pagejump）を帯の上へ逃がす）
   ・結果の表（二人の状態・みんなの状態 など）を、住人ごとのカードに組み替える（列の見出しを各欄の上に出す）
   ・箱庭タブの参加表（住人ごとの初動と目標）は欄が多いので、カードにせず表のまま（横スクロール・先頭2列と見出しの固定）にして、高さを抑え、横にスクロールできることを小さく知らせる
   ・タブ・設定の窓・シード欄・結果の札などが画面からはみ出さないようにする */
(function () {
  'use strict';
  var css = '@media (max-width:600px){' +
    /* タブ：等幅3分割＋セーブのアイコンにする整形は index.html の CSS（2026-10-27） */
    /* 見出しは少し小さく、節の間隔は 32px（PC は 48px） */
    'html body h2.sec{font-size:16px;margin-top:32px}html body h2.sec:first-child{margin-top:0}html body details.fold>summary{padding-top:32px}html body details.fold:first-child>summary{padding-top:0}' +
    /* 箱庭タブの参加表：表の形のまま、高さを画面の6割ほどに（index.html の横スクロール・先頭2列と見出しの固定はそのまま） */
    'html body #view-box .tblwrap{max-height:60vh}html body #view-box .tblhint{display:block}' +
    /* 結果の住人ごとの表 → カード */
    'html body #view-result .tblwrap{overflow:visible;max-height:none;border:0;background:none}' +
    'html body #view-result table.per,html body #view-result table.per tbody{display:block;min-width:0;width:100%}' +
    'html body #view-result table.per thead{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0)}' +
    'html body #view-result table.per tr{display:flex;flex-wrap:wrap;gap:8px 10px;align-items:flex-end;padding:10px 12px;margin-bottom:8px;border:1px solid var(--line);border-radius:var(--r);background:var(--surface)}' +
    'html body #view-result table.per td{display:block;position:static!important;border:0!important;padding:0!important;box-shadow:none!important;background:none!important;min-width:0!important;max-width:none!important;width:auto!important;flex:1 1 calc(50% - 10px);text-align:left!important}' +
    'html body #view-result table.per td:nth-child(1){flex:0 0 auto;align-self:center}html body #view-result table.per td:nth-child(2){flex:1 1 100%;align-self:center;font-size:14px}' +
    'html body #view-result table.per td:nth-child(2) b{max-width:none}' +
    'html body #view-result table.per td[data-label]:nth-child(n+3)::before{content:attr(data-label);display:block;font-size:11px;color:var(--muted2,var(--muted));margin-bottom:2px}' +
    'html body #view-result table.per td:nth-child(n+3){flex:1 1 calc(33% - 10px);font-size:15px}' +
    'html body #view-result table.per td:last-child{flex-basis:100%;font-size:13px}' +
    'html body #view-result table.per td select,html body #view-result table.per td input[type=text]{width:100%;max-width:none!important;min-width:0!important}' +
    'html body #view-result table.per tr.off td{opacity:1}html body #view-result table.per tr.off{opacity:.5}' +
    /* 箱庭を動かしたあと、結果の頭から読めるように（描き直しでスクロール位置が引きずられないように） */
    'html{overflow-anchor:none}' +
    /* シード */
    'html body .runbar{gap:8px 10px;padding:12px}html body .runbar input{width:9em;flex:1 1 9em}' +
    /* 「箱庭を動かす」の帯を下に固定（紙の地に上の罫線、ボタンは藍の塗りで高さ 44px。説明の一文は帯では省く。--runfix-h は帯の高さ） */
    'html.hk-runfix{--runfix-h:calc(61px + env(safe-area-inset-bottom,0px))}' +
    'html.hk-runfix body{padding-bottom:var(--runfix-h)}' +
    'html body #view-box>.runbar{position:fixed;left:0;right:0;bottom:0;z-index:15;margin:0;border-radius:0;flex-wrap:nowrap;gap:8px;min-height:var(--runfix-h,61px);padding:8px max(16px,env(safe-area-inset-right,0px)) calc(8px + env(safe-area-inset-bottom,0px)) max(16px,env(safe-area-inset-left,0px));background:var(--paper);color:var(--ink);border-top:1px solid var(--line)}' +
    'html body #view-box>.runbar label{flex:none;font-size:12px;color:var(--muted)}html body #view-box>.runbar .hint,html body #view-box>.runbar .spacer{display:none}' +
    'html body #view-box>.runbar input[type=text]{flex:1 1 auto;width:auto;min-width:0;min-height:44px;background:var(--paper);color:var(--ink);border-color:var(--line)}html body #view-box>.runbar input[type=text]::placeholder{color:var(--muted);opacity:1}html body #view-box>.runbar input[type=text]:focus{outline-color:var(--ink);border-color:var(--ink)}' +
    'html body #view-box>.runbar .btn.primary{flex:none;min-height:44px;padding:0 18px;background:var(--ink);color:var(--paper);border-color:var(--ink)}html body #view-box>.runbar .btn:focus-visible{outline-color:var(--ink)}' +
    'html.hk-runfix .toast{bottom:calc(var(--runfix-h) + 12px)}html.hk-runfix #loadfail{bottom:calc(var(--runfix-h) + 12px)}html.hk-runfix #pagejump{bottom:calc(var(--runfix-h) + 12px)}' +
    /* 結果の札・関係図 */
    'html body span.chip{white-space:normal;max-width:100%}html body .tray svg{min-width:440px}' +
    /* 設定の窓 */
    'html body .gearrow label{max-width:100%;min-width:0}html body .gearrow label select{flex:1 1 auto;min-width:0;max-width:100%}html body .gearrow label>select:only-of-type{width:100%}' +
    '}' +
    /* 「横にスクロールできます」はスマホ幅だけ */
    '.tblhint{display:none;margin:0 0 4px;font-size:12px;color:var(--muted)}';
  var st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);

  /* 表の各欄に、列の見出しを data-label で持たせる */
  function label(root) {
    if (!root) return;
    Array.prototype.forEach.call(root.querySelectorAll('table.per'), function (tb) {
      var hs = Array.prototype.map.call(tb.querySelectorAll('thead th'), function (th) { return th.textContent.trim(); });
      Array.prototype.forEach.call(tb.querySelectorAll('tbody tr'), function (tr) {
        Array.prototype.forEach.call(tr.children, function (td, k) { if (hs[k] && td.getAttribute('data-label') !== hs[k]) td.setAttribute('data-label', hs[k]); });
      });
    });
  }
  /* 箱庭タブの参加表の上に「横にスクロールできます」を出す（表示はスマホ幅だけ。すでにあれば足さない） */
  function hint(root) {
    if (!root) return;
    Array.prototype.forEach.call(root.querySelectorAll('.tblwrap'), function (w) {
      var pv = w.previousElementSibling;
      if (pv && pv.classList.contains('tblhint')) return;
      var p = document.createElement('p');
      p.className = 'tblhint';
      p.textContent = '表は横にスクロールできます →';
      w.parentNode.insertBefore(p, w);
    });
  }
  /* 「箱庭を動かす」の帯を下に固定しているか（箱庭タブを見ていて、帯がある）。html の hk-runfix で、本文の下の余白と、知らせ・ボタンの位置を帯の上へ */
  var root = document.documentElement;
  function runfix(host) {
    var on = !!host && !host.hidden && !!host.querySelector(':scope>.runbar');
    if (root.classList.contains('hk-runfix') !== on) root.classList.toggle('hk-runfix', on);
  }
  /* 箱庭タブ（初動と目標の表）と結果タブ（二人の状態などの表）の両方を見張る。箱庭タブは、タブの切り替え（hidden）も見る */
  function init() {
    ['view-box', 'view-result'].forEach(function (id) {
      var host = document.getElementById(id);
      if (!host) return;
      var run = function () { label(host); if (id === 'view-box') { hint(host); runfix(host); } };
      run();
      if (typeof MutationObserver !== 'undefined') new MutationObserver(run).observe(host, { childList: true, subtree: true });
      if (id === 'view-box' && typeof MutationObserver !== 'undefined') new MutationObserver(function () { runfix(host); }).observe(host, { attributes: true, attributeFilter: ['hidden'] });
    });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
