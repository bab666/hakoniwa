/* 認識阻害の部屋（set-c-ninshiki）の開始前の注意（R18版・全年齢モードでないとき。本体の HK.SoloWarn。表は docs/reports/2026-11-07/ninshiki-design.md）
   ・する側（場の設定「する側」：おまかせ／住人／モブ／触手）と、住人ごとの欄「立場」（力を使う側／受ける側／周りの人）から、注意と始められない配役を出す
   ・攻めを選んだ人は受ける側にしない。体の場面にならない組は、触れ合いが肩や手まで（触れ方の段 0）と心の段だけになる（warn）
   ・始められない配役（block）：受ける側になれる人がいない（全員が「力を使う側」か「周りの人」） */
/* @event-ok 開始前の注意（新しい出来事は無い） */
(function () {
  'use strict';
  var HK = window.HK;
  if (!HK || !HK.SoloWarn || !HK.SoloWarn.add) return;
  HK.SoloWarn.add('set-c-ninshiki', function (input, T) {
    var C = T.C, out = [], P = HK.Pos, ak = T.env.actor || 'auto';
    if (!C.length) return out;
    var parts = C.map(function (c, i) { return T.pick(i, 'part'); });
    var tgt = C.filter(function (c, i) { return parts[i] !== 'user' && parts[i] !== 'guest'; });
    if (!tgt.length) { out.push({ level: 'block', text: '受ける側になれる人がいません。だれか一人の「立場」を「受ける側」かおまかせにしてください' }); return out; }
    out.push({ level: 'warn', text: '受ける側は、違和感が線を越えたらその場を離れます（離れる・断る・人に知らせる）。夜の場面は、前もって許していた二人（恋人・体の相手・両片想い）か、気づいたうえで乗り気になった人にだけ起きます' });
    var res = ak === 'res' || (ak === 'auto' && C.length >= 2);
    if (ak === 'res' && C.length < 2) out.push({ level: 'warn', text: 'する側を「住人」にするには二人以上が要ります。一人のときは、する側はモブになります' });
    if (res && C.length >= 2) {
      var ui = parts.indexOf('user'), ti = parts.indexOf('target');
      var A = ui >= 0 ? C[ui] : C.filter(function (c, i) { return i !== ti && parts[i] !== 'guest'; })[0];
      var B = ti >= 0 ? C[ti] : C.filter(function (c) { return c !== A && parts[C.indexOf(c)] !== 'guest'; })[0];
      if (!A || !B) return out;
      if (ui < 0 && ti < 0 && P && P.hardTop && P.hardTop(B, A)) { var x = A; A = B; B = x; }
      if (T.hard(A, B) && T.hard(B, A)) out.push({ level: 'warn', text: T.nm([A, B]) + 'は二人とも攻めなので、触れ合いは肩や手までで、夜の場面にはなりません' });
      else if (P && P.canTop && !P.canTop(A, B) && !P.canTop(B, A)) out.push({ level: 'warn', text: T.nm([A, B]) + 'は二人とも受けなので、触れ合いは肩や手までで、夜の場面にはなりません' });
      else if (T.hard(B, A) && ti >= 0) out.push({ level: 'warn', text: B.name + 'は攻めを選んでいるので、受ける側にしても夜の場面にはなりません。力を使う側にするか、立場をおまかせにしてください' });
      else if (!T.ok(A, B)) out.push({ level: 'warn', text: T.nm([A, B]) + 'は体の関係にならない組なので、触れ合いは肩や手までで、心の段だけになります' });
    } else {
      var b = tgt[0];
      if (T.top(b)) out.push({ level: 'warn', text: b.name + 'はモブ・触手の相手には攻めに回る設定なので、触れ合いは肩や手までで、夜の場面にはなりません' });
    }
    return out;
  });
})();
