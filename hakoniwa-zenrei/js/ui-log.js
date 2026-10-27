/* 箱庭シミュレーター: 記録（経過）の見た目にメリハリをつける
   ・区切り（〇日目など）を等幅の見出しに
   ・出来事の種類ごとに、左の帯と種類の札に色をつける（cat-〇〇 / cc-〇〇。箱庭の記録は view.js、ひとりの物語は solo-story-kit.js が付ける）
   ・トラブル（故障・危機・感染など。e.trouble）は赤い枠と「トラブル」の札
   ・死は濃い赤の札、山場（climax）は少し色を敷き、状況の説明は控えめに */
(function () {
  'use strict';
  var C = {
    romance: 'var(--love)', bond: 'var(--partner)', help: 'var(--guard)', conflict: 'var(--enemy)', combat: 'var(--kill)',
    betray: 'var(--obsess)', solo: 'var(--muted)', escape: 'var(--night)', death: 'var(--kill)'
  };
  var css = '';
  /* 区切り（時刻・時期。2026-10-27 から等幅の文字だけ。文字は --ink、地は --paper の同じテーマの組で決める）
     ・変数が効かない端末でも組がずれないよう、文字と地の両方にライトの色を先に書き、変数の色で上書きする
     ・Android の Chrome の「ウェブサイトをダークにする」などで、地と文字の片方だけが自動で塗り替えられて読めなくなる（淡い地に白文字・暗い地に黒文字）のを防ぐため、
       札だけ color-scheme を「only」にして自動の塗り替えを断る（ダークのテーマのときは dark only） */
  css += 'html body .stepblk{border-top:1px dashed var(--line);padding-block:12px}' +
    'html body .stepblk .when{align-self:start;justify-self:start;display:inline-block;font-family:var(--f-num);font-weight:600;font-size:13px;color:#16233B;color:var(--ink,#16233B);-webkit-text-fill-color:currentColor;background:#fff;background:var(--paper,#fff);border:0;border-radius:3px;padding:2px 0;letter-spacing:.06em;line-height:1.6;color-scheme:light only;opacity:1;mix-blend-mode:normal}' +
    '@media (prefers-color-scheme: dark){html:not([data-theme="light"]) body .stepblk .when{color-scheme:dark only}}' +
    'html[data-theme="dark"] body .stepblk .when{color-scheme:dark only}' +
    'html body .stepblk ol{gap:9px}';
  /* 種類の札と左の帯 */
  Object.keys(C).forEach(function (k) {
    var c = C[k];
    css += 'html body .ev .c.cc-' + k + '{color:' + c + ';background:color-mix(in srgb,' + c + ' 13%,transparent);border-color:color-mix(in srgb,' + c + ' 45%,transparent)}' +
      'html body .ev.cat-' + k + ':not(.talk):not(.phase):not(.trouble):not(.death) .evb{border-left:3px solid color-mix(in srgb,' + c + ' 70%,transparent);padding-left:9px}' +
      'html body .ev.talk.cat-' + k + ':not(.trouble) .evb{border-left:3px solid color-mix(in srgb,' + c + ' 70%,transparent)}';
  });
  css += 'html body .ev .c{border-radius:3px;padding:0 5px;font-weight:600}';
  /* 状況の説明：控えめに */
  css += 'html body .ev.phase .evb{font-size:13px;color:var(--muted);border-left:2px dotted var(--line);padding-left:9px}';
  /* 山場 */
  css += 'html body .ev.climax{border-left:0;padding-left:0;margin-left:0}' +
    'html body .ev.climax:not(.trouble):not(.death) .evb{background:var(--bg1);border-left:2px solid var(--hot);border-radius:0 4px 4px 0;padding:6px 10px;font-weight:500}';
  /* 決め手・転機 */
  css += 'html body .ev.key{background:none;padding:0;margin-left:0}' +
    'html body .ev.key .evb{box-shadow:inset 0 0 0 1px var(--ink);background:var(--bg1);border-radius:4px;padding:6px 10px}';
  /* トラブル：赤い枠 */
  css += 'html body .ev.trouble .evb{border:1px solid var(--hot);border-left-width:3px;background:var(--paper);border-radius:4px;padding:7px 11px}' +
    'html body .ev.trouble .evb::before{content:"⚠ トラブル";display:inline-block;font-size:10px;font-weight:700;color:var(--paper);background:var(--hot);border-radius:3px;padding:0 6px;margin-right:6px;vertical-align:1px}' +
    'html body .ev.trouble .c{color:var(--hot);border-color:var(--hot);background:none}';
  /* 死 */
  css += 'html body .ev.death .evb{border:1px solid var(--line2);border-left:3px solid var(--hot);background:var(--bg1);border-radius:4px;padding:7px 11px;color:var(--ink)}' +
    'html body .ev.death .evb::before{content:"✝";font-weight:700;color:var(--hot);margin-right:6px}' +
    'html body .ev.death.trouble .evb::before{content:"✝ 全滅・死";color:var(--paper);background:var(--hot);border-radius:3px;padding:0 6px;font-size:10px}';
  /* 理由の行は、本文と分かれて読めるように */
  css += 'html body .ev .why{margin-top:3px;padding-top:2px;border-top:1px dotted color-mix(in srgb,var(--line) 80%,transparent)}' +
    'html body .ev.phase .why{border-top:0}';
  var st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);
})();
