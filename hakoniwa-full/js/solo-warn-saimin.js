/* 催眠（R18版のみ）：受け攻めから見た開始前の注意（solo-warn.js の HK.SoloWarn。2026-11-05 担当SW）
   本番の決まり（solo-saimin.js の p.aTop・p.solo、solo-saimin-sex.js の fullTop）：
   ・かけられる側が攻め（住人どうしは HK.Pos.order、モブのかける側には HK.Pos.vsNpc）：暗示で、自分から相手を抱く側になる
     （イかされる・動けなくされる・責められる暗示はかからない）
   ・住人どうしで攻めどうし（HK.Pos.okSex が偽で、向きだけが決まらない組）：体を重ねる暗示はかからず、感度・発情などの暗示だけ
   ・全員を「かける側」にした配役は、元の scen.check が止める（ここでは足さない） */
/* @event-ok 開始前の注意（新しい出来事は無い） */
(function () {
  'use strict';
  var HK = window.HK;
  if (!HK || !HK.SoloWarn) return;
  HK.SoloWarn.add('saimin', function (input, T) {
    var P = HK.Pos;
    if (!P) return [];
    var C = T.C.slice(0, 2), out = [];
    if (C.length === 1) {
      if (P.vsNpc(C[0], '') === 'top') out.push({ level: 'warn', text: C[0].name + '（攻め）は、かけられても抱かれる側にならず、暗示で自分から相手を抱く側になります（イかされる・動けなくされる暗示はかかりません）' });
      return out;
    }
    var role = function (c) { return T.pick(c.i, 'role'); };
    var a = C[0], b = C[1];
    if (T.hard(a, b) && T.hard(b, a)) { out.push({ level: 'warn', text: T.nm(C) + 'は攻めどうしなので、体を重ねる暗示はかからず、感度・発情などの暗示だけになります' }); return out; }
    if (!T.ok(a, b)) return out;
    /* かける側：役割で選んだ人、なければ2人目（かけられる側を選んだ人は除く） */
    var hy = role(a) === 'hypno' ? a : role(b) === 'hypno' ? b : role(b) !== 'target' ? b : a, tg = hy === a ? b : a;
    if (P.order(hy, tg, [hy, tg])[0] === tg) out.push({ level: 'warn', text: 'かけられる側の' + tg.name + (T.hard(tg, hy) ? '（攻め）' : '（この組では攻めの向き）') + 'は、暗示で自分から' + hy.name + 'を抱く側になります（イかされる・動けなくされる暗示はかかりません）' });
    return out;
  });
})();
