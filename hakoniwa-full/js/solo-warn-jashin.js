/* 邪神村RTA（R18版のみ）：受け攻めから見た開始前の注意（solo-warn.js の HK.SoloWarn。2026-11-05 担当SW）
   本番の決まり（solo-jashin-r18.js・solo-jashin-r18-god.js・solo-jashin-r18-climax.js）：
   ・攻めの住人（HK.Pos.hardTopNpc。canReceive が偽）は、村人の夜這い・神・眷属・生贄の儀で抱かれる側にならず、はねのけるか攻める側に回る。疑似妊娠もしない
   ・住人どうしの夜は、組める組（HK.Pos.okSex）だけ。攻めは抱く側
   ・攻めどうしは住人どうしの夜にならない（村人・神の夜だけ） */
/* @event-ok 開始前の注意（新しい出来事は無い） */
(function () {
  'use strict';
  var HK = window.HK;
  if (!HK || !HK.SoloWarn) return;
  HK.SoloWarn.add('jashin', function (input, T) {
    var P = HK.Pos;
    if (!P) return [];
    var C = T.C, out = [];
    var tops = C.filter(T.top);
    if (!tops.length) return out;
    out.push({ level: 'warn', text: '攻めの住人（' + T.nm(tops) + '）は、村人・神・眷属の夜や生贄の儀でも抱かれる側にならず、はねのけるか攻める側に回ります（疑似妊娠もしません）' });
    if (C.length > 1 && tops.length === C.length) out.push({ level: 'warn', text: '全員が攻めなので、住人どうしの夜は起きません（村人・神の夜だけです）' });
    return out;
  });
})();
