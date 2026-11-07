/* 追加パック「闇の過激セット」：「調教の地下室」の箱庭のタグと、出来事の id → 表情の既定（2026-11-07。語彙は本体の js/scen-tags.js の HK.ScenTags.DEF）
   R18版だけのパックなので r18 の印で挟まない。表情の鍵は HK.DarkKit.face（kit-dark-face.js）。大事な台詞は文の頭の印が先 */
(function () {
  'use strict';
  var HK = window.HK;
  if (!HK) return;
  if (HK.ScenTags && HK.ScenTags.add) HK.ScenTags.add('set-c-chokyo', ['closed', 'relCore', 'duo', 'r18only', 'force', 'heat', 'night', 'will']);
  if (HK.DarkKit && HK.DarkKit.face) HK.DarkKit.face('set-c-chokyo', [
    [/^ck_(punish|escape_fail)$/, 'angry'], [/^ck_(reward|escape)$/, 'joy'], [/^ck_(care|dep_up|want|sens_up|debut_prep|debut|lead)$/, 'shy'],
    [/^ck_(cold|crack_up|giveup)$/, 'sad'], [/^ck_(intro|clue)$/, 'normal'], [/^ck_(letgo|auction)$/, 'surprise'], [/^ck_jo$/, 'jealous'], [/^ck_slip$/, 'smile_lover']
  ]);
})();
