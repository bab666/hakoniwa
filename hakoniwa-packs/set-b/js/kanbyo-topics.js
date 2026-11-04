/* 看病の部屋の「話題」（住人に登録した語の出来事。本体の topics.js）の上限（両方のビルド。kanbyo.js のあとに読む。2026-11-04）
   同居生活で利用者が見つけた「設定した話題の出来事が出すぎる」への備え：看病の部屋では、話題の出来事は 1 日 1 件まで。
   その日すでに話題の出来事（理由の欄が「…の話題（…）」の出来事と、雑談に話題の一文が添わったもの「…／話題：…」）が出ていれば、本体の箱庭ごとの倍率（HK.Topics.SCEN_K）をその日の残りは 0 にする（倍率をこの部屋の遊びのときだけ記録を見る読み出しにする）。
   計測（関係の制限のある二人＝擬似親子・敬愛・愛憎・親子・きょうだい・親戚 × 7 日 × 100 回、話題 6 件）：話題の出来事は全体の 3〜4%（上限の前も 15% を大きく下回る）。
   病気の間は本体の出来事をほとんど混ぜない（kanbyo.js の actRate）ので、関係の制限で部屋の出来事が弾かれて話題が穴埋めになることはない（部屋の出来事は関係を問わない文の表を持つ） */
/* @event-ok 話題の出来事の上限（新しい出来事ではない） */
(function () {
  'use strict';
  var HK = window.HK;
  var ID = 'set-b-kanbyo';
  if (!HK || !HK.SCENARIOS || !HK.SCENARIOS[ID] || !HK.wrap || !HK.Topics || !HK.Topics.SCEN_K) return;
  var TP = HK.Topics, scen = HK.SCENARIOS[ID];
  /* その日の記録に話題の出来事があるか（記録の長さで覚えておき、増えた分だけ見る） */
  function usedToday(ctx) {
    var St = ctx && ctx._kbTp, L = ctx && ctx.log;
    if (!St || !L) return false;
    for (var i = St.seen; i < L.length; i++) if (L[i] && /の話題（|／話題：/.test(L[i].why || '')) St.used = true;
    St.seen = L.length;
    return St.used;
  }
  /* 本体の箱庭ごとの倍率を、今回している遊び（HK._curCtx）がこの部屋で、その日すでに話題が出ていれば 0 に（同じ区切りの中の二件目も止まる） */
  var k0 = TP.SCEN_K[ID];
  Object.defineProperty(TP.SCEN_K, ID, { configurable: true, enumerable: true,
    get: function () { var c = HK._curCtx; if (!c || !c.scen || c.scen.id !== ID) return k0 == null ? 1 : k0; return usedToday(c) ? 0 : (k0 == null ? 1 : k0); },
    set: function (v) { k0 = v; } });
  HK.wrap(scen, 'phase', function (orig) {
    return function (ctx, s, n) {
      var d = Math.floor(s / 3), St = ctx._kbTp = ctx._kbTp || { day: -1, seen: 0, used: false };
      if (St.day !== d) { St.day = d; St.seen = (ctx.log || []).length; St.used = false; }
      return orig.apply(this, arguments);
    };
  });
})();
