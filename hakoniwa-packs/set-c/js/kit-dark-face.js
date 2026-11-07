/* Cセット（闇の過激セット）の共通部品：表情の既定（R18版だけ。2026-11-07。本体の HK.Face（face.js）の上に乗せる）
   ■ HK.DarkKit（DK。kit-dark.js と同じ入れ物）
     ・DK.face(ID, [[出来事の id の正規表現か文字列, 鍵], …])：部屋の出来事の id → 表情の鍵の既定を HK.Face.addTag(…, 'ev') で登録する。
       鍵は HK.Face.KEYS（normal・surprise・joy・sad・angry・shy・fear・jealous・smile_lover・smile_family）。喘ぎの鍵（moan_1〜4）は本体が決めるので登録しない。
       ID は作り手の控え（どの部屋の登録か）で、表の引き方には使わない（id は部屋の頭字で始めて、ほかの部屋と重ねない）。登録した数を返す
     ・記録ごとの表情（DK.say の o.face → e.dkf = { 住人の番号: 鍵 }）：計器の段で決めた表情（恐怖が高い受けは fear、
       深く堕ちた受けは smile_lover など。決め方は部屋が持つ）。HK.Face.of を包み、書いた人の印（〈照れ〉など）が無い台詞で、
       話し手が e.dkf にある人ならその鍵を返す（出来事の id の既定・気分より先。印より後）。保存済みの記録には書き足さない（e.dkf は作ったときに付く）
   文は持たない。 */
(function () {
  'use strict';
  var HK = window.HK;
  if (!HK) return;
  var DK = HK.DarkKit = HK.DarkKit || {};
  var MOAN = /^moan_/;
  DK.face = function (ID, rules) {
    var F = HK.Face, n = 0;
    if (!F || !F.addTag) return 0;
    (rules || []).forEach(function (r) {
      if (!r || r[0] == null || F.KEYS.indexOf(r[1]) < 0 || MOAN.test(r[1])) throw new Error('HK.DarkKit.face(' + ID + ')：表情の鍵が違います: ' + (r && r[1]));
      F.addTag(r[0], r[1], 'ev'); n++;
    });
    return n;
  };
  /* e.dkf を読む（印のある台詞はそのまま本体に任せる） */
  if (HK.Face && HK.Face.of && HK.wrap && !HK.Face._dkWrapped) {
    HK.Face._dkWrapped = true;
    HK.wrap(HK.Face, 'of', function (of0) {
      return function (e, k, res) {
        if (!e || !e.dkf || typeof e.text !== 'string' || !HK.Seg) return of0.apply(this, arguments);
        var sg = HK.Seg.of(e, res || []), qs = (sg || []).filter(function (x) { return x && x.t !== 'n'; }), x = qs[k];
        if (!x || x.t === 'm' || x.face || (Array.isArray(e.fc) && e.fc[k]) || !(x.who >= 0)) return of0.apply(this, arguments);
        var v = e.dkf[x.who];
        return v && HK.Face.KEYS.indexOf(v) >= 0 && !MOAN.test(v) ? v : of0.apply(this, arguments);
      };
    });
  }
})();
