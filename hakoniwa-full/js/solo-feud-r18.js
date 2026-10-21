/* 箱庭シミュレーター（R18版のみ）― 愛憎の二人が揉めて、無理やり体を重ねる描写（feud-kit.js の HK.Feud.clash が使う）
   邪神村RTA・吹雪の館で使う。それぞれの「夜の出来事（R18）」が0のとき、全年齢モードのときは起きない
   全年齢版ではこのファイルは読み込まれない。登場人物はすべて成人として扱う */
(function () {
  'use strict';
  var HK = window.HK, ST = HK.Story, FD = HK.Feud;
  if (!FD || !ST) return;
  function L(s) { return s.split('|'); }
  var OPEN = L('{a}は{b}の手首を掴んで、壁に押しつけた。{b}が身をよじるほど、{a}の指は深く食い込んだ。|{a}は{b}を床に組み伏せ、抗う腕を頭の上で押さえつけた。|{a}は{b}の襟元を掴み、そのまま布団の上に投げ出した。');
  FD.r18On = function (S) {
    if (HK.SAFE_ON) return false;
    var id = S.scen && S.scen.id, JS = HK.JASHIN, Y = HK.YAKATA;
    if (id === 'jashin') return !!(JS && JS.R18 && JS.R18.on(S));
    if (id === 'yakata') return Y && Y.R18 ? Y.R18.on(S) : true;
    return false;
  };
  FD.r18Clash = function (S, a, b) {
    var R = HK.R18M, o = HK.Pos ? HK.Pos.order(a, b, [a, b]) : [a, b], X = o[0], Y = o[1];
    var t = ST.fmt(ST.pick(S, OPEN), { a: a.name, b: b.name });
    if (!R) return t;
    return t + R.resist(S, a, b, { endure: false }) + R.sex(S, X, Y, { mood: 'rough', fore: false, short: true });
  };
})();
