/* エロトラップダンジョン（R18版のみ）：受け攻めから見た開始前の注意（solo-warn.js の HK.SoloWarn。2026-11-05 担当SW）
   本番の決まり（dungeon.js の DG.isTop、dungeon-topfall.js）：
   ・攻めの挑戦者（HK.Pos.hardTopNpc）は、罠・魔物・仲間に挿入される側にならない。罠や魔物を壊す・組み伏せるか、触手や魔物に体を責められ・搾られる（挿入・後ろは無し）
   ・仲間が襲われるのを見て堕ちると、仲間に手を出す・加勢する側になる（体の関係になれる組だけ）
   ・攻めどうし（HK.Pos.okSex が偽）は仲間どうしの場面にならない */
/* @event-ok 開始前の注意（新しい出来事は無い） */
(function () {
  'use strict';
  var HK = window.HK;
  if (!HK || !HK.SoloWarn) return;
  HK.SoloWarn.add('dungeon', function (input, T) {
    var P = HK.Pos;
    if (!P) return [];
    var C = T.C, out = [];
    var tops = C.filter(T.top);
    if (!tops.length) return out;
    out.push({ level: 'warn', text: '攻めの挑戦者（' + T.nm(tops) + '）は、罠や魔物に挿入されません。罠を壊す・魔物を組み伏せるか、触手や魔物に体を責められ・搾られます' + (C.length > 1 ? '。仲間が襲われるのを見て、手を出す側に回ることがあります' : '') });
    if (C.length > 1 && tops.length === C.length) out.push({ level: 'warn', text: '全員が攻めなので、仲間どうしの場面はありません' });
    return out;
  });
})();
