/* ヤンデレ監禁の部屋（set-c-kankin）の開始前の注意（R18版だけ。本体の HK.SoloWarn。2026-11-07）
   ・閉じ込める側が攻めにならない組（閉じ込める側が自分で受けを選んでいる・閉じ込められる側が自分で攻めを選んでいる）→ 体の場面は出ず、心の支配と言葉だけの日々になる（warn）
   ・恋愛対象・性行為の相手の固定・R18 にしない相手で、体の関係にならない二人 → 同じく体の場面は出ない（warn）
   ・三人目以降 → 外の人として名前だけ出る（warn） */
/* @event-ok 開始前の注意（新しい出来事は無い） */
(function () {
  'use strict';
  var HK = window.HK;
  if (!HK || !HK.SoloWarn || !HK.SoloWarn.add) return;
  HK.SoloWarn.add('set-c-kankin', function (input, T) {
    var C = T.C, out = [];
    if (C.length < 2) return out;
    var who = function (v) { for (var i = 0; i < C.length; i++) if (T.pick(i, 'part') === v) return C[i]; return null; };
    var A = who('keeper'), B = who('kept');
    if (!A || !B) { var rest = C.filter(function (c) { return T.pick(c.i, 'part') !== 'guest'; }); if (!A) A = rest.filter(function (c) { return c !== B; })[0]; if (!B) B = rest.filter(function (c) { return c !== A; })[0]; }
    if (C.length > 2) out.push({ level: 'warn', text: '閉ざされた部屋の二人は、上の二人（立場を選んだ人が先）です。ほかの人は外の人として名前だけ出ます' });
    if (!A || !B) return out;
    var P = HK.Pos;
    if (P && P.canTop && !P.canTop(A, B)) out.push({ level: 'warn', text: A.name + 'は受けを選んでいるので、閉じ込める側でも体の場面は出ません（心の支配・言葉・鍵と鎖だけの日々になります）' });
    else if (T.hard(B, A)) out.push({ level: 'warn', text: B.name + 'は攻めを選んでいるので、閉じ込められる側として受けにはしません。体の場面は出ず、心の支配・言葉・鍵と鎖だけの日々になります' });
    else if (!T.ok(A, B) || (HK.bodyOK && !HK.bodyOK(A, B))) out.push({ level: 'warn', text: A.name + 'と' + B.name + 'は体の関係にならない二人（恋愛対象・相手の固定・R18 にしない相手）なので、体の場面は出ません' });
    return out;
  });
})();
