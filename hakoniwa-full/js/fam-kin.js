/* 箱庭シミュレーター: 家族の関係（きょうだい・親子・親族など）の恋愛の扱いを、物語型の箱庭（solo-story-kit.js の HK.Story.state を使う箱庭）にそろえる
   ・「恋愛：なし」（ties.js の HK.tieNoLove）の二人は、恋愛・R18にしない相手（キャラの設定 loveNG と同じ ng）として扱う。
     これで HK.ngPair・HK.canLove・HK.sexBlocked・HK.Pos.okSex を通る判定（告白・夜・R18の場面・恋人の結末）に、どの箱庭でも乗らない
   ・「恋愛：あり」の家族・擬似親子（loveOK）は、ほかの組と同じ条件で恋愛・夜・R18・恋人の結末に進む
   ・エンジン型の箱庭（engine.js）は ctx.pair(a, b).kin で見るので、ここでは触らない */
(function () {
  'use strict';
  var HK = window.HK;
  /* P：住人（i と ng を持つ）、ties：入力の関係。恋愛：なしの家族の二人を、互いの ng に足す */
  HK.kinNG = function (P, ties) {
    if (!P || !HK.tieNoLove) return;
    (ties || []).forEach(function (t) {
      if (!t || t.a === t.b || !HK.tieNoLove(t)) return;
      var a = P[t.a], b = P[t.b];
      if (!a || !b || a === b) return;
      if (!Array.isArray(a.ng)) a.ng = [];
      if (!Array.isArray(b.ng)) b.ng = [];
      if (a.ng.indexOf(b.i) < 0) a.ng.push(b.i);
      if (b.ng.indexOf(a.i) < 0) b.ng.push(a.i);
    });
  };
  /* 関係「無関心」「恐怖」の二人は、互いの noLove に入れる（engine.js の HK.noLovePair：恋愛にも体の関係にもならない。エンジン型は ties.js の HK.Ties.after） */
  HK.fearNG = function (P, ties) {
    if (!P) return;
    (ties || []).forEach(function (t) {
      if (!t || t.a === t.b || (t.type !== 'apathy' && t.type !== 'fear')) return;
      var a = P[t.a], b = P[t.b];
      if (!a || !b || a === b) return;
      [[a, b], [b, a]].forEach(function (q) { var l = q[0].noLove = Array.isArray(q[0].noLove) ? q[0].noLove : []; if (l.indexOf(q[1].i) < 0) l.push(q[1].i); });
    });
  };
  var ST = HK.Story;
  if (ST && ST.state && !ST.state._kin) {
    var st0 = ST.state;
    ST.state = function (input, scenId) {
      var S = st0.apply(this, arguments);
      HK.kinNG(S && S.P, input && input.ties);
      HK.fearNG(S && S.P, input && input.ties);
      return S;
    };
    ST.state._kin = true;
  }
})();
