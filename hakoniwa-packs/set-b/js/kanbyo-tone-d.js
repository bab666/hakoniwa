/* 看病の部屋の台詞・その4の口調の書き下ろし（両方のビルド。kanbyo-text-g.js の台詞のうち、辞書だけでは味が出ない口調だけ。2026-11-05）
   形は kanbyo-tone.js と同じ：F3('くだけ｜硬い｜敬語', 書き下ろし)。点検：tone-feel.js --scen=set-b-kanbyo（全 49 口調で違和感 3% 以下） */
(function () {
  'use strict';
  var HK = window.HK;
  if (!HK || !HK.Load || !HK.Load.toneData) return;
  function F3(t, out) { return t.split('｜').map(function (s) { return [s, out]; }); }
  function T(tone, rows) { HK.Load.toneData(tone, { F: [].concat.apply([], rows) }); }
  var Q = {
    ashita: '明日も来る。何か欲しいものがあったら連絡して｜明日も来る。欲しいものがあれば連絡しろ｜明日も来ます。欲しいものがあったら連絡してください'
  };
  T('kansai', [F3(Q.ashita, '明日も来るで。なんか欲しいもんあったら連絡してや')]);
  /* ギャルの「でしょ」が辞書で「っしょ」（チャラい口調の語尾）になる（2026-11-05 報告） */
  var DSHO = 'でしょ。分かった？｜だろう。分かったか｜でしょう。分かりましたか';
  T('gyaru', [F3(Q.ashita, '明日も来るし。欲しいもんあったらマジ連絡して'), F3(DSHO, 'でしょー。わかった？マジで')]);
  T('darui', [F3(Q.ashita, '……明日も来る。なんかあったら、連絡')]);
  T('noja', [F3(Q.ashita, '明日も来るぞ。欲しいものがあれば知らせるのじゃ')]);
  var TABE = 'ちゃんと食べた？｜ちゃんと食べたか｜ちゃんと食べましたか';
  T('genki', [F3(TABE, 'ちゃんと食べましたかー？')]);
  T('otaku', [F3(TABE, 'ちゃんと食べましたかな？')]);
  T('kansai', [F3(TABE, 'ちゃんと食べたん？')]);
})();
