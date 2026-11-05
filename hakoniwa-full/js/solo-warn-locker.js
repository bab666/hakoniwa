/* 媚薬ロッカー（R18版のみ）：受け攻めから見た開始前の注意（solo-warn.js の HK.SoloWarn。2026-11-05 担当SW）
   本番の決まり（solo-locker.js の hardTop・bind、locker-crowd.js の canAct・見回り）：
   ・攻めの住人（HK.Pos.hardTop）は、片方だけの手錠の側にならない（二人とも攻めなら二人とも手錠）。相手にイかされる側・受け止める側にもならない
   ・1人のときは一人きりのロッカー。見回りの人（モブ）に見つかったとき、攻めの住人（HK.Pos.hardTopNpc）は攻める側
   ・攻めどうし（HK.Pos.okSex が偽）は、同じロッカーでも手を出し合わない（脱出だけ）。組の成り立ちは locker-note.js の帯にも出る */
/* @event-ok 開始前の注意（新しい出来事は無い） */
(function () {
  'use strict';
  var HK = window.HK;
  if (!HK || !HK.SoloWarn) return;
  HK.SoloWarn.add('locker', function (input, T) {
    var P = HK.Pos;
    if (!P) return [];
    var C = T.C, out = [];
    var tops = C.filter(function (c) { return T.hard(c) || T.top(c); });
    if (!tops.length) return out;
    if (C.length === 1) { out.push({ level: 'warn', text: C[0].name + '（攻め）は一人きりのロッカーで耐えるか慰めます。見回りの人に見つかっても、攻める側です' }); return out; }
    out.push({ level: 'warn', text: '攻めの住人（' + T.nm(tops) + '）は、片方だけの手錠をかけられる側にも、相手にイかされる側にもなりません' });
    if (tops.length === C.length) out.push({ level: 'warn', text: '全員が攻めなので、同じロッカーになっても手を出し合わず、脱出するだけです' + (C.length === 2 ? '（二人とも手錠になります）' : '') });
    return out;
  });
})();
