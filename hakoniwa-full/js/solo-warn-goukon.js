/* 合コン（R18版のみ）：受け攻めから見た開始前の注意（solo-warn.js の HK.SoloWarn。2026-11-05 担当SW）
   本番の決まり（HK.canLove・HK.Pos.okSex、solo-goukon-night.js）：お持ち帰りの夜は、組める組だけ（攻めは抱く側）。
   攻めどうし（向きの決まらない組）は恋人にも夜の相手にもならない。全員が攻めなら、飲み会と会話だけで終わる（止めはしない） */
/* @event-ok 開始前の注意（新しい出来事は無い） */
(function () {
  'use strict';
  var HK = window.HK;
  if (!HK || !HK.SoloWarn) return;
  HK.SoloWarn.add('goukon', function (input, T) {
    var P = HK.Pos;
    if (!P) return [];
    var C = T.C;
    if (C.length < 2 || !C.every(function (c) { return T.hard(c); })) return [];
    return [{ level: 'warn', text: '全員が攻めなので、恋人にもお持ち帰りの相手にもなりません（攻めどうしは組めません）。受けかリバ、おまかせの住人を入れると、夜まで進みます' }];
  });
})();
