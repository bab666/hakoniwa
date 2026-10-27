/* 箱庭シミュレーター: 記録（経過）の見た目の補い
   見た目の本体は index.html の「時系列」の規則（仕様 6：左にターン番号と局面名、1本のレールと点、種類の札は Mono の藍の枠だけ、
   転機・情事・死亡だけ --hot の赤）。2026-10-27 から種類ごとの色の帯・札の色は使わない（色は重要な出来事だけ）。
   ここでは、区切り（時刻・時期）の文字が端末の自動の塗り替えで読めなくなるのを防ぐ */
(function () {
  'use strict';
  /* 区切り（時刻・時期）：文字は --ink、地は --paper の同じテーマの組で決める
     ・変数が効かない端末でも組がずれないよう、文字と地の両方にライトの色を先に書き、変数の色で上書きする
     ・Android の Chrome の「ウェブサイトをダークにする」などで、地と文字の片方だけが自動で塗り替えられて読めなくなる（淡い地に白文字・暗い地に黒文字）のを防ぐため、
       区切りだけ color-scheme を「only」にして自動の塗り替えを断る（ダークのテーマのときは dark only）
     ・重要な出来事のある区切りの赤（.when.hot など）は index.html の規則のほうが強いので、ここでは色を上書きしない */
  var css = 'html body .stepblk .when{color:#16233B;color:var(--ink,#16233B);-webkit-text-fill-color:currentColor;background:#fff;background:var(--paper,#fff);color-scheme:light only;opacity:1;mix-blend-mode:normal}' +
    '@media (prefers-color-scheme: dark){html:not([data-theme="light"]) body .stepblk .when{color-scheme:dark only}}' +
    'html[data-theme="dark"] body .stepblk .when{color-scheme:dark only}';
  var st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);
})();
