/* 箱庭シミュレーター: スマホ幅（600px以下）向けの調整
   ・住人ごとの初動と目標の表と、結果の表（二人の状態・みんなの状態 など）を、住人ごとのカードに組み替える（列の見出しを各欄の上に出す）
   ・タブ・設定の窓・シード欄・結果の札などが画面からはみ出さないようにする */
(function () {
  'use strict';
  var css = '@media (max-width:600px){' +
    /* タブ：4つとも1画面に収める */
    'html body .tabs{gap:0}html body .tab{padding:10px 8px 9px;font-size:13px}html body .tab b{margin-right:3px}' +
    /* 見出しは少し小さく */
    'html body h2.sec{font-size:18px}html body details.fold>summary{padding-top:22px}' +
    /* 住人ごとの表 → カード */
    'html body .tblwrap{overflow:visible;max-height:none;border:0;background:none}' +
    'html body table.per,html body table.per tbody{display:block;min-width:0;width:100%}' +
    'html body table.per thead{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0)}' +
    'html body table.per tr{display:flex;flex-wrap:wrap;gap:8px 10px;align-items:flex-end;padding:10px 12px;margin-bottom:8px;border:1px solid var(--line);border-radius:var(--r);background:var(--surface)}' +
    'html body table.per td{display:block;position:static!important;border:0!important;padding:0!important;box-shadow:none!important;background:none!important;min-width:0!important;max-width:none!important;width:auto!important;flex:1 1 calc(50% - 10px);text-align:left!important}' +
    'html body table.per td:nth-child(1){flex:0 0 auto;align-self:center}html body table.per td:nth-child(2){flex:1 1 60%;align-self:center;font-size:14px}' +
    'html body table.per td:nth-child(2) b{max-width:none}' +
    'html body table.per td[data-label]:nth-child(n+3)::before{content:attr(data-label);display:block;font-size:11px;color:var(--muted);margin-bottom:2px}' +
    /* 住人ごとの初動と目標の表（箱庭タブ）だけ、3・4列目（初動・目標の選択）を全幅に。結果の表（数字）は2列ずつ */
    'html body #view-box table.per td:nth-child(3),html body #view-box table.per td:nth-child(4){flex-basis:100%}' +
    'html body #view-result table.per td:nth-child(2){flex:1 1 100%}' +
    'html body #view-result table.per td:nth-child(n+3){flex:1 1 calc(33% - 10px);font-size:15px}' +
    'html body #view-result table.per td:last-child{flex-basis:100%;font-size:13px}' +
    'html body table.per td select,html body table.per td input[type=text]{width:100%;max-width:none!important;min-width:0!important}' +
    'html body table.per tr.off td{opacity:1}html body table.per tr.off{opacity:.5}' +
    /* シード */
    'html body .runbar{gap:8px 10px;padding:12px}html body .runbar input{width:9em;flex:1 1 9em}' +
    /* 結果の札・関係図 */
    'html body span.chip{white-space:normal;max-width:100%}html body .tray svg{min-width:440px}' +
    /* 設定の窓 */
    'html body .gearrow label{max-width:100%;min-width:0}html body .gearrow label select{flex:1 1 auto;min-width:0;max-width:100%}html body .gearrow label>select:only-of-type{width:100%}' +
    '}';
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
  /* 箱庭タブ（初動と目標の表）と結果タブ（二人の状態などの表）の両方を見張る */
  function init() {
    ['view-box', 'view-result'].forEach(function (id) {
      var host = document.getElementById(id);
      if (!host) return;
      label(host);
      if (typeof MutationObserver !== 'undefined') new MutationObserver(function () { label(host); }).observe(host, { childList: true, subtree: true });
    });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
