/* 認識阻害の部屋（set-c-ninshiki）の表情の既定と箱庭のタグ（2026-11-07）
   表情：出来事の id → 鍵（HK.DarkKit.face。台詞の頭の印・記録ごとの face が先）。タグ：カードの札と一覧の絞り込み（語彙は本体の js/scen-tags.js の HK.ScenTags.DEF）。
   合意のない展開の札（force）は付けない：夜の場面は、前もって許していた二人と、気づいたうえで乗り気の人だけ（電車の部屋と同じ扱い） */
/* @event-ok 表情とタグの登録（新しい出来事は無い） */
(function () {
  'use strict';
  var HK = window.HK;
  if (!HK) return;
  if (HK.DarkKit && HK.DarkKit.face) HK.DarkKit.face('set-c-ninshiki', [
    [/^ns_wake$/, 'surprise'], [/^ns_peak$/, 'surprise'], [/^ns_refuse$/, 'angry'], [/^ns_(leave|report)$/, 'fear'], [/^ns_avoid$/, 'sad'],
    [/^ns_(confess|face)$/, 'sad'], [/^ns_move_guilt$/, 'sad'], [/^ns_stay$/, 'shy'], [/^ns_back$/, 'shy'], [/^ns_reverse$/, 'angry'], [/^ns_selfnote$/, 'shy']
  ]);
  if (HK.ScenTags && HK.ScenTags.add) {
    HK.ScenTags.add('set-c-ninshiki', ['daily', 'relCore', 'solo1', 'duo']);
    HK.ScenTags.add('set-c-ninshiki', ['r18only', 'heat', 'mobnight']);
  }
})();
