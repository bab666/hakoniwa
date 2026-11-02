/* 箱庭シミュレーター: 画面の中のスクロールする箱のスクロールバー（2026-11-02 担当UE。表示だけ）
   ・経過の目次・右の絞り込み・設定の窓の目次・箱庭を選ぶの一覧など、ページの中でスクロールする箱すべてに同じ細いバーを当てる（ページ全体のバーは触らない）
   ・幅 6px、つまみは角丸で --ui-line2（無ければ --line2）、軌道は透明。箱にマウスを載せるとつまみが少し濃く（--ui-line3）、つまみを握ると --ui-muted
   ・Chrome・Safari は ::-webkit-scrollbar で描く（scrollbar-width／scrollbar-color を同じ箱に書くと Chrome は ::-webkit-scrollbar を見なくなるので、
     標準の書き方は ::-webkit-scrollbar の無いブラウザ（Firefox）だけに当てる）
   ・:where() で詳細度を 0 にしているので、個別にバーを隠している箱（切替の横の流れ .rvtabs など scrollbar-width:none・display:none）はそのまま隠れる
   ・index.html（土台）には書かず、ここから <style> を差す（ui-result-style.js と同じ作り）。色はすべて --ui-* の変数（テーマ・配色の切替に付いてくる） */
(function () {
  'use strict';
  if (typeof document === 'undefined' || !document.createElement || document.getElementById('hk-scroll-style')) return;
  var T = 'var(--ui-line2,var(--line2,var(--line)))', TH = 'var(--ui-line3,var(--ui-muted2,var(--muted)))', TA = 'var(--ui-muted,var(--muted))';
  var B = ':where(body *)';
  var css =
    '@supports selector(::-webkit-scrollbar){' +
      B + '::-webkit-scrollbar{width:6px;height:6px;background:transparent}' +
      B + '::-webkit-scrollbar-track{background:transparent}' +
      B + '::-webkit-scrollbar-corner{background:transparent}' +
      B + '::-webkit-scrollbar-button{display:none;width:0;height:0}' +
      B + '::-webkit-scrollbar-thumb{background:' + T + ';border-radius:6px;min-height:24px;min-width:24px}' +
      ':where(body *):hover::-webkit-scrollbar-thumb{background:' + TH + '}' +
      B + '::-webkit-scrollbar-thumb:active{background:' + TA + '}' +
    '}' +
    '@supports not selector(::-webkit-scrollbar){' +
      B + '{scrollbar-width:thin;scrollbar-color:' + T + ' transparent}' +
      ':where(body *):hover{scrollbar-color:' + TH + ' transparent}' +
    '}' +
    /* 経過の目次・右の絞り込み・二人ずつ／住人ごとの一覧：長いときだけスクロールし、バーの分だけ中身がずれないように溝を取っておく */
    '.rvw :is(.rvtoc,.rvrail,.rvlist){scrollbar-gutter:stable;overscroll-behavior:contain}';
  var st = document.createElement('style');
  st.id = 'hk-scroll-style';
  st.textContent = css;
  (document.head || document.documentElement).appendChild(st);
})();
