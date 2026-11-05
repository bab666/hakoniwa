/* サキュバスの一夜（R18版のみ）：受け攻めから見た開始前の注意（solo-warn.js の HK.SoloWarn。2026-11-05 担当SW）
   本番の決まり（solo-succubus.js の sTop・hTop、solo-succubus-rival.js、solo-succubus-target.js）：
   ・攻めのサキュバス（HK.Pos.hardTopNpc）は、街の獲物（モブ）を抱いて精を吸う（抱かれて搾る側にならない）。ライバルのサキュバスとの吸い合いでも上
   ・標的（人間）の住人とサキュバスの住人は、体の関係になれる組（HK.Pos.okSex ほか）だけ。攻めどうしは話すだけ・断られるだけ
   ・複数人は別々に狩るので、全員が攻めでも狩りはそれぞれ進む（住人どうしの体の場面が無いだけ）。止める配役は無い */
/* @event-ok 開始前の注意（新しい出来事は無い） */
(function () {
  'use strict';
  var HK = window.HK;
  if (!HK || !HK.SoloWarn) return;
  HK.SoloWarn.add('succubus', function (input, T) {
    var P = HK.Pos;
    if (!P) return [];
    var C = T.C, out = [];
    var role = function (c) { return T.pick(c.i, 'role') || 'hunt'; };
    var H = C.filter(function (c) { return role(c) === 'hunt'; }), TG = C.filter(function (c) { return role(c) === 'target'; });
    var hTop = H.filter(T.top);
    if (hTop.length) out.push({ level: 'warn', text: '攻めのサキュバス（' + T.nm(hTop) + '）は、獲物を抱いて精を吸います（抱かれる側にはなりません）' });
    var clash = [];
    TG.forEach(function (t) { H.forEach(function (h) { if (T.hard(h, t) && T.hard(t, h)) clash.push(h.name + 'と' + t.name); }); });
    if (clash.length) out.push({ level: 'warn', text: '攻めどうしのサキュバスと標的（' + clash.join('・') + '）は体の関係にならず、話すだけ・断られるだけです' });
    if (H.length > 1 && hTop.length === H.length) out.push({ level: 'warn', text: '全員が攻めなので、サキュバスの住人どうしで体を重ねることはありません（それぞれ街の獲物を狩ります）' });
    return out;
  });
})();
