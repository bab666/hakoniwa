/* 君と僕の一か月（set-c-stalker）の開始前の注意（R18 版・全年齢モードでないとき。本体の HK.SoloWarn）
   ・見つめる側（攻め）にした人が自分で「受け」を選んでいる、見つめられる側にした人が自分で「攻め」を選んでいる、恋愛対象・性行為の相手の固定が合わない
     → 二人の夜は起きず、見つめる・気づく・向き合うの心の駆け引きだけになる（warn）。ひとりの夜（見つめる側が耽る夜）も、二人が体の関係にしてよい組のときだけ
   ・二人とも自分で「攻め」を選んでいる → 見つめる側の割り振りに関わらず、二人の夜は起きない（warn）
   始められない配役は無い（体の場面が無くても一か月は進む） */
/* @event-ok 開始前の注意（新しい出来事は無い） */
(function () {
  'use strict';
  var HK = window.HK;
  if (!HK || !HK.SoloWarn || !HK.SoloWarn.add) return;
  HK.SoloWarn.add('set-c-stalker', function (input, T) {
    var C = T.C, out = [];
    if (C.length < 2) return out;
    var side = function (c) { return T.pick(c.i, 'part'); };
    var A = null, B = null;
    C.slice(0, Math.min(C.length, 5)).forEach(function (c) { if (!A && side(c) === 'stalker') A = c; if (!B && side(c) === 'target') B = c; });
    var top2 = C.filter(function (c) { return side(c) !== 'guest'; }).slice(0, 2);
    if (top2.length < 2) return out;
    if (!A) A = top2[0] === B ? top2[1] : top2[0];
    if (!B) B = top2[0] === A ? top2[1] : top2[0];
    var P = HK.Pos;
    if (T.hard(A, B) && T.hard(B, A)) { out.push({ level: 'warn', text: T.nm([A, B]) + 'は二人とも攻めなので、二人の夜は起きません（見つめる・気づく・向き合うの駆け引きだけになります）' }); return out; }
    if (T.hard(B, A)) out.push({ level: 'warn', text: B.name + 'は攻めなので、見つめられる側にすると二人の夜は起きません（' + B.name + 'を見つめる側にすると、受けの' + A.name + 'との夜が起きることがあります）' });
    else if (P && P.canTop && !P.canTop(A, B)) out.push({ level: 'warn', text: A.name + 'は受けなので、見つめる側にすると二人の夜は起きません（立場を入れ替えると、夜が起きることがあります）' });
    else if (!T.ok(A, B)) out.push({ level: 'warn', text: T.nm([A, B]) + 'は恋愛対象・受け攻めの組み合わせで体の関係にならないので、夜の場面は起きません（心の駆け引きだけになります）' });
    return out;
  });
})();
