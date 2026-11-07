/* 調教の地下室（set-c-chokyo）の開始前の注意（本体の HK.SoloWarn。全年齢モードでは本体が何も出さない）
   ・調教師に「受け」を選んだ人・奴隷に「攻め」を選んだ人・体の関係にならない組（恋愛対象・R18 にしない相手・性器なし・身内）は、体に触れない心の躾けだけになる（warn）
   ・地下室に来たわけ「捕まえられてきた」は、体には触れない心の躾けと脱出劇だけ（warn）
   ・二人とも攻めを選んだ組は、調教師が決まらないので始められない（block） */
/* @event-ok 開始前の注意（新しい出来事は無い） */
(function () {
  'use strict';
  var HK = window.HK;
  if (!HK || !HK.SoloWarn || !HK.SoloWarn.add) return;
  HK.SoloWarn.add('set-c-chokyo', function (input, T) {
    var C = T.C, out = [], P = HK.Pos;
    if (C.length < 2) return out;
    var part = function (i) { return T.pick(i, 'part'); };
    var idx = [0, 1, 2].filter(function (i) { return C[i] && /^(trainer|slave)$/.test(part(i)); });
    C.forEach(function (c, i) { if (idx.length < 2 && idx.indexOf(i) < 0 && !/^(slave2|guest)$/.test(part(i))) idx.push(i); });
    if (idx.length < 2) return out;
    var X = C[idx[0]], Y = C[idx[1]], A = X, B = Y;
    if (part(idx[0]) === 'slave' || part(idx[1]) === 'trainer') { A = Y; B = X; }
    var hard = function (c, o) { return T.hard(c, o); }, bottomOnly = function (c, o) { return P && P.of && P.of(c, o) === 'bottom' && P.canTop && !P.canTop(c, o); };
    if (hard(X, Y) && hard(Y, X)) return [{ level: 'block', text: X.name + 'と' + Y.name + 'は二人とも攻めを選んでいるので、調教の地下室は始められません。どちらかを受けかリバ、おまかせにしてください' }];
    if (part(idx[0]) || part(idx[1])) {
      if (bottomOnly(A, B)) out.push({ level: 'warn', text: A.name + 'は受けを選んでいるので、調教師になっても体には触れません（言葉・姿勢・待たせることだけの心の躾けになり、夜の場面は起きません）' });
      if (hard(B, A)) out.push({ level: 'warn', text: B.name + 'は攻めを選んでいるので、奴隷になっても体を躾けられません（心の躾けだけになり、夜の場面は起きません）' });
    }
    if (!T.ok(X, Y)) out.push({ level: 'warn', text: X.name + 'と' + Y.name + 'は恋愛対象・受け攻めの組み合わせで体の関係にならないので、体に触れない心の躾けだけになります' });
    if (T.env.origin === 'captured') out.push({ level: 'warn', text: '「捕まえられてきた」では、奴隷は脱出を目指します。体には触れない心の躾けと脱出劇だけで、夜の場面・お披露目会・競りは起きません' });
    return out;
  });
})();
