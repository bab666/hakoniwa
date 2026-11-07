/* ヤンデレ監禁の部屋（set-c-kankin）の表情の既定と箱庭のタグ（R18版だけ。2026-11-07）
   表情：出来事の id → 鍵（HK.DarkKit.face。台詞の頭の印・記録ごとの表情（kankin.js の faceOf）が先）。
   タグ：本体の js/scen-tags.js の語彙（閉じ込め・ふたり向け・関係重視・死ネタあり・R18 専用） */
/* @event-ok 表情の既定とタグ（新しい出来事は無い） */
(function () {
  'use strict';
  var HK = window.HK;
  if (!HK || !HK.DarkKit) return;
  HK.DarkKit.face('set-c-kankin', [
    [/^kk_(a_hyohen|dark4|caught)$/, 'angry'],
    [/^kk_dark1$/, 'jealous'],
    [/^kk_(beg|escape|search|oshioki)$/, 'fear'],
    [/^kk_(confess|fall2)$/, 'shy'],
    [/^kk_(fall3|end_kyoizon|end_broken)$/, 'smile_lover'],
    [/^kk_(lie_found|end_escape|end_rescue|end_shinju|back)$/, 'sad'],
    [/^kk_(gift|lie_hold)$/, 'joy'],
    [/^kk_(test|dark2|dark3)$/, 'surprise']
  ]);
  if (HK.ScenTags && HK.ScenTags.add) HK.ScenTags.add('set-c-kankin', ['closed', 'duo', 'relCore', 'death', 'r18only']);
})();
