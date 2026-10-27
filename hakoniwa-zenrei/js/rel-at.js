/* 箱庭シミュレーター: 箱庭に後から組み込むための小さな部品（恋愛系のかたまり pack-rel の先頭。全年齢版・R18版共通）
   HK.atScen(id, fn)：箱庭 id の本体（HK.SCENARIOS[id]）がもう有れば今すぐ、まだ無ければ、その箱庭のかたまり（scen-<id>）が届いたあとで、
     fn(scen) を一度だけ呼ぶ（HK.Load.onChunk。呼ぶときの通し番号 HK.Load.cur は、呼んだファイルの番号のまま）。
   分割読み込みでは、族の共有の部品（pack-rel）が箱庭の本体（scen-<id>）より先に読まれるので、
   「読み込み時に箱庭へ出来事を足す・関数を包む」部品はこれを使う。出来事の表への追加は HK.addTo（足した順を元のファイルの順に保つ）。
   HK.atEvent／HK.eventAdded：後から足される出来事を包む（下の注記）。
   設計：docs/reports/2026-10-27/chunk-loading-design.md（2-3） */
(function () {
  'use strict';
  var HK = window.HK = window.HK || {};
  if (HK.atScen) return;
  HK.atScen = function (id, fn) {
    var done = false;
    function go() {
      if (done) return;
      var s = HK.SCENARIOS && HK.SCENARIOS[id];
      if (!s || s.stub) return;
      done = true;
      fn(s);
    }
    go();
    if (!done && HK.Load && HK.Load.onChunk) HK.Load.onChunk(go);
  };
  /* HK.atEvent(scen, evId, fn)：箱庭 scen の出来事 evId を包む・書き換えるとき。もう有れば今すぐ fn(ev)、まだ無ければ、
     それを足すファイルが HK.eventAdded(scen, ev) を呼んだときに fn(ev) を呼ぶ。
     分割読み込みで、出来事を足すファイル（HK.atScen で後から足す共有の部品）より、包むファイル（箱庭のかたまり）が先に実行されるときのため。
     元の順（足す→包む）と同じく、足した直後に包む */
  var pend = {};
  HK.atEvent = function (scen, evId, fn) {
    if (!scen || !scen.events) return;
    var ev = scen.events.filter(function (e) { return e && e.id === evId; })[0];
    if (ev) { fn(ev); return; }
    var k = (scen.id || '') + '/' + evId;
    (pend[k] = pend[k] || []).push(fn);
  };
  HK.eventAdded = function (scen, ev) {
    var k = (scen && scen.id || '') + '/' + (ev && ev.id), l = pend[k];
    if (!l) return;
    delete pend[k];
    l.forEach(function (fn) { fn(ev); });
  };
})();
