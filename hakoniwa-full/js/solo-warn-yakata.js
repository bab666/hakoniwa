/* 吹雪の館の殺人（R18版のみ）：受け攻めから見た開始前の注意（solo-warn.js の HK.SoloWarn。2026-11-05 担当SW）
   本番の決まり（solo-yakata-r18.js の媚薬の夜）：
   ・攻めの住人（HK.Pos.hardTopNpc）は、館の使用人に抱かれる側にならず、攻める側。乱交（HK.Pos.hardTopIn の人を除く）にも入らない
   ・住人どうしの夜は組める組（HK.Pos.okSex）だけ。攻めどうしは住人どうしの夜にならない（一人で悶えるか、使用人を相手にする） */
/* @event-ok 開始前の注意（新しい出来事は無い） */
(function () {
  'use strict';
  var HK = window.HK;
  if (!HK || !HK.SoloWarn) return;
  HK.SoloWarn.add('yakata', function (input, T) {
    var P = HK.Pos;
    if (!P) return [];
    var C = T.C, out = [];
    var tops = C.filter(T.top);
    if (!tops.length) return out;
    out.push({ level: 'warn', text: '媚薬の夜、攻めの住人（' + T.nm(tops) + '）は館の使用人に抱かれる側にならず、攻める側です。乱交にも入りません' });
    if (tops.length === C.length) out.push({ level: 'warn', text: '全員が攻めなので、住人どうしの媚薬の夜は起きません（一人で悶えるか、使用人を相手にします）' });
    return out;
  });
})();
