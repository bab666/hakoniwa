/* 調教の地下室（set-c-chokyo）の開始前の注意（本体の HK.SoloWarn。全年齢モードでは本体が何も出さない）
   ・調教師に「受け」を選んだ人・奴隷に「攻め」を選んだ人・体の関係にならない組（恋愛対象・R18 にしない相手・性器なし・身内）は、体に触れない心の躾けだけになる（warn）
   ・地下室に来たわけ「やむを得ぬ事情でやってきた」の説明（warn）
   ・二人とも攻めを選んだ組は、調教師が決まらないので始められない（block）
   ・立場（調教師A・奴隷A・調教師B・奴隷B）の重なり、3 人・5 人以上、組の片方だけを選んで残りがいない配役は始められない（block） */
/* @event-ok 開始前の注意（新しい出来事は無い） */
(function () {
  'use strict';
  var HK = window.HK;
  if (!HK || !HK.SoloWarn || !HK.SoloWarn.add) return;
  HK.SoloWarn.add('set-c-chokyo', function (input, T) {
    var C = T.C, out = [], P = HK.Pos;
    if (C.length < 2) return out;
    var part = function (i) { return T.pick(i, 'part'); };
    var V = { trainer: 'At', slave: 'As', trainerA: 'At', slaveA: 'As', trainerB: 'Bt', slaveB: 'Bs' }, got = {};
    C.forEach(function (c, i) { var v = V[part(i)]; if (v) got[v] = (got[v] || []).concat([c]); });
    var dup = Object.keys(got).filter(function (k) { return got[k].length > 1; });
    if (dup.length) out.push({ level: 'block', text: '同じ立場（' + dup.map(function (k) { return { At: '調教師A', As: '奴隷A', Bt: '調教師B', Bs: '奴隷B' }[k]; }).join('・') + '）を二人が選んでいます。立場は一人ずつにしてください' });
    if (C.length === 3 || C.length > 4) out.push({ level: 'block', text: '調教の地下室は、調教師と奴隷の組を一つか二つ置く箱庭です。参加は 2 人か 4 人にしてください（今は ' + C.length + ' 人）' });
    var nAuto = C.filter(function (c, i) { return !V[part(i)]; }).length;
    var nT = (got.At || []).length + (got.Bt || []).length, nS = (got.As || []).length + (got.Bs || []).length;
    if (nAuto === 0 && nS === 0) out.push({ level: 'block', text: '全員が調教師を選んでいます。調教師と奴隷を組にしてください' });
    else if (nAuto === 0 && nT === 0) out.push({ level: 'block', text: '全員が奴隷を選んでいます。調教師と奴隷を組にしてください' });
    else if (C.length === 4) ['A', 'B'].forEach(function (k) { var t = (got[k + 't'] || []).length, s0 = (got[k + 's'] || []).length; if (t + s0 === 1 && nAuto === 0) out.push({ level: 'block', text: '組' + k + 'の' + (t ? '奴隷' : '調教師') + 'がいません。調教師' + k + 'と奴隷' + k + 'をそろえてください' }); });
    if (C.length === 2 && (got.Bt || got.Bs) && !out.length) out.push({ level: 'warn', text: '2 人のときは組 B は作れないので、組 A として扱います' });
    if (out.some(function (x) { return x.level === 'block'; })) return out;
    var X = C[0], Y = C[1], A = X, B = Y;
    if (part(0) === 'slave' || part(0) === 'slaveA' || part(1) === 'trainer' || part(1) === 'trainerA') { A = Y; B = X; }
    var hard = function (c, o) { return T.hard(c, o); }, bottomOnly = function (c, o) { return P && P.of && P.of(c, o) === 'bottom' && P.canTop && !P.canTop(c, o); };
    if (C.length === 2 && hard(X, Y) && hard(Y, X)) return [{ level: 'block', text: X.name + 'と' + Y.name + 'は二人とも攻めを選んでいるので、調教の地下室は始められません。どちらかを受けかリバ、おまかせにしてください' }];
    if (C.length === 2 && (part(0) || part(1))) {
      if (bottomOnly(A, B)) out.push({ level: 'warn', text: A.name + 'は受けを選んでいるので、調教師になっても体には触れません（言葉・姿勢・待たせることだけの心の躾けになり、夜の場面は起きません）' });
      if (hard(B, A)) out.push({ level: 'warn', text: B.name + 'は攻めを選んでいるので、奴隷になっても体を躾けられません（心の躾けだけになり、夜の場面は起きません）' });
    }
    if (C.length === 2 && !T.ok(X, Y)) out.push({ level: 'warn', text: X.name + 'と' + Y.name + 'は恋愛対象・受け攻めの組み合わせで体の関係にならないので、体に触れない心の躾けだけになります' });
    if (T.env.show === 'pair' && C.length < 4) out.push({ level: 'warn', text: 'お披露目の仕方「奴隷どうし」は組が二つのときだけです。今はおまかせになります' });
    if (T.env.origin === 'captured') out.push({ level: 'warn', text: '「やむを得ぬ事情でやってきた」奴隷は、借金の肩代わり・身内の代わり・行き場を失ったなどの事情で自分から地下室に来た人です。本当は帰りたいので、調教と並行して手がかりを集めて脱出を目指します（お披露目会の前に脱出に成功すると、その夜で終わります）。夜の場面は本音が「止めない」まで来てから' });
    return out;
  });
})();
