/* 眠りの部屋（set-c-nemuri）の開始前の注意（R18版・全年齢モードでないとき。本体の HK.SoloWarn）
   ・立場で選んだ人・受け攻めの設定から、触れる側（攻め）と眠る側（受け）を決める。攻めを選んだ人は眠る側にしない
   ・体の場面にならない組（二人とも攻めを選んだ・二人とも受けを選んだ・体の関係にしない相手・R18 に参加しない）は、眠っている間も寝顔のそばまでで、
     目を覚ましたあとも心と言葉の段だけになる（warn）。始められない配役は無い */
/* @event-ok 開始前の注意（新しい出来事は無い） */
(function () {
  'use strict';
  var HK = window.HK;
  if (!HK || !HK.SoloWarn || !HK.SoloWarn.add) return;
  HK.SoloWarn.add('set-c-nemuri', function (input, T) {
    var C = T.C, out = [];
    if (C.length < 2) return out;
    var A = C[0], B = C[1], P = HK.Pos;
    var pa = T.pick(0, 'part'), pb = T.pick(1, 'part');
    if (pa === 'sleeper' || pb === 'toucher') { var x = A; A = B; B = x; }
    else if (pa !== 'toucher' && pb !== 'sleeper' && P && P.hardTop && P.hardTop(B, A)) { var y = A; A = B; B = y; }
    var both = T.hard(A, B) && T.hard(B, A), sel = P && P.canTop && !P.canTop(A, B) && !P.canTop(B, A);
    if (both) out.push({ level: 'warn', text: T.nm([A, B]) + 'は二人とも攻めなので、眠っている間も寝顔のそばまでで、体の場面にはなりません（目を覚ましたあとも心と言葉の段だけ）' });
    else if (sel) out.push({ level: 'warn', text: T.nm([A, B]) + 'は二人とも受けなので、体の場面にはなりません（寝顔のそばと、目を覚ましたあとの心と言葉の段だけ）' });
    else if (T.hard(B, A) && (pa === 'sleeper' || pb === 'toucher')) out.push({ level: 'warn', text: B.name + 'は攻めを選んでいるので、眠る側にしても体の場面にはなりません。触れる側にするか、立場をおまかせにしてください' });
    else if (!T.ok(A, B)) out.push({ level: 'warn', text: T.nm([A, B]) + 'は体の関係にならない組なので、寝顔のそばと、目を覚ましたあとの心と言葉の段だけになります' });
    return out;
  });
})();
