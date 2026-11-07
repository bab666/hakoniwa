/* 眠りの部屋（set-c-nemuri）の表情の既定と箱庭のタグ（2026-11-07）
   表情：出来事の id → 鍵（HK.DarkKit.face。台詞の頭の印・記録ごとの face が先）。タグ：カードの札と一覧の絞り込み（語彙は本体の js/scen-tags.js の HK.ScenTags.DEF） */
/* @event-ok 表情とタグの登録（新しい出来事は無い） */
(function () {
  'use strict';
  var HK = window.HK;
  if (!HK) return;
  if (HK.DarkKit && HK.DarkKit.face) HK.DarkKit.face('set-c-nemuri', [
    [/^nm_peak$/, 'surprise'], [/^nm_peak_half$/, 'normal'], [/^nm_(post_ng|night_ng)$/, 'sad'], [/^nm_guilt$/, 'sad'],
    [/^nm_confess$/, 'shy'], [/^nm_uzuki$/, 'shy'], [/^nm_day_b$/, 'surprise'], [/^nm_(post_ok|night_ok)$/, 'joy']
  ]);
  if (HK.ScenTags && HK.ScenTags.add) {
    HK.ScenTags.add('set-c-nemuri', ['daily', 'relCore', 'duo']);
    HK.ScenTags.add('set-c-nemuri', ['r18only', 'heat', 'force']);
  }
})();
