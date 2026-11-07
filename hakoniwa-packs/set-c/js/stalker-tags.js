/* 君と僕の一か月（set-c-stalker）の表情の既定と箱庭のタグ（R18版だけ。2026-11-07）
   表情：出来事の id → 鍵（HK.DarkKit.face。台詞の頭の印 → 記録ごとの e.dkf → この既定 → 気分 の順）。
   タグ：語彙は本体の js/scen-tags.js の HK.ScenTags.DEF。ふたり向け・関係重視・合意なしあり（内容のスイッチ）・妊娠の描写（内容のスイッチ）・夜の温度 */
/* @event-ok 表情とタグ（新しい出来事は無い） */
(function () {
  'use strict';
  var HK = window.HK;
  if (!HK) return;
  var ID = 'set-c-stalker';
  if (HK.DarkKit && HK.DarkKit.face) HK.DarkKit.face(ID, [
    [/^st_(notice|realize)$/, 'surprise'],
    [/^st_br_(unaware|report)$/, 'fear'],
    [/^st_br_meet$/, 'angry'],
    [/^st_br_drawn$/, 'shy'],
    [/^st_reveal$/, 'fear'],
    [/^st_confront$/, 'angry'],
    [/^st_drawn_deep$/, 'shy'],
    [/^st_(b_lock|b_alone|b_dream)$/, 'fear'],
    [/^st_(g_lover|d_rival)$/, 'jealous'],
    [/^st_(m_gift|d_meal|d_clean)$/, 'joy'],
    [/^st_(repel_step|b_police|b_record)$/, 'normal']
  ]);
  if (HK.ScenTags && HK.ScenTags.add) HK.ScenTags.add(ID, ['duo', 'relCore', 'force', 'preg', 'heat']);
})();
