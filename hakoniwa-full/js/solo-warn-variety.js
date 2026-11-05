/* エロバラエティ番組（R18版のみ）：受け攻めから見た開始前の注意（solo-warn.js の HK.SoloWarn。2026-11-05 担当SW）
   本番の決まり（solo-variety.js の hTop・hTopN・grpOk、solo-variety-extra.js・solo-variety-plus.js）：
   ・攻めの出演者（HK.Pos.hardTop。アシスタント・スタッフには hardTopNpc）は、企画でも罰ゲームでも責められる側にならない。
     責められる企画はアシスタントを責める側でこなし、責められる耐久には乗らず別枠で参加する。受ける罰ゲームは出ない
   ・住人どうしで組む企画は、組める組（HK.Pos.okSex）だけ。組めない人はアシスタントと組む
   ・攻めの人がいると、みんなでの性的な罰ゲーム（grpOk）は出ない */
/* @event-ok 開始前の注意（新しい出来事は無い） */
(function () {
  'use strict';
  var HK = window.HK;
  if (!HK || !HK.SoloWarn) return;
  HK.SoloWarn.add('variety', function (input, T) {
    var P = HK.Pos;
    if (!P) return [];
    var C = T.C, out = [];
    var tops = C.filter(function (c) { return T.hard(c) || T.top(c); });
    if (!tops.length) return out;
    out.push({ level: 'warn', text: '攻めの出演者（' + T.nm(tops) + '）は、企画でも罰ゲームでも責められる側になりません。責められる企画はアシスタントを責める側でこなし、責められる耐久には別枠で参加します（挿入されることはありません）' });
    if (tops.length === C.length) out.push({ level: 'warn', text: '全員が攻めなので、出演者どうしで組む企画はアシスタントが相手になり、みんなでの罰ゲームはありません' });
    else out.push({ level: 'warn', text: '攻めの出演者がいるので、みんなでの性的な罰ゲームはありません' });
    return out;
  });
})();
