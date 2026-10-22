/* 箱庭シミュレーター: 口調「mystic」の語尾の付け替え（名前・一人称・見本・派生元は tone-registry.js） */
(function () {
  'use strict';
  var HK = window.HK, V = HK && HK.Voice;
  if (!V || !HK.toneFinish) return;
  function conv(q, who) { return q; }
  HK.toneFinish('mystic', conv);
})();
