/* 箱庭シミュレーター（R18版のみ）― 愛憎の二人が揉めて、無理やり体を重ねる描写（feud-kit.js の HK.Feud.clash が使う）
   邪神村RTA・吹雪の館で使う。それぞれの「夜の出来事（R18）」が0のとき、全年齢モードのときは起きない
   全年齢版ではこのファイルは読み込まれない。登場人物はすべて成人として扱う */
(function () {
  'use strict';
  var HK = window.HK, ST = HK.Story, FD = HK.Feud;
  if (!FD || !ST) return;
  function L(s) { return s.split('|'); }
  var OPEN = L('{a}は{b}の手首を掴んで、壁に押しつけた。{b}が身をよじるほど、{a}の指は深く食い込んだ。|{a}は{b}を床に組み伏せ、抗う腕を頭の上で押さえつけた。|{a}は{b}の襟元を掴み、そのまま布団の上に投げ出した。|{a}は{b}の胸ぐらを掴んで引き寄せ、言い返す口を噛みつくように塞いだ。|{a}は{b}を壁際に追い詰め、逃げ道を塞ぐように両腕をついた。睨み合う距離が、息のかかるほど近くなった。');
  FD.r18On = function (S) {
    if (HK.SAFE_ON) return false;
    var id = S.scen && S.scen.id, JS = HK.JASHIN, Y = HK.YAKATA;
    if (id === 'jashin') return !!(JS && JS.R18 && JS.R18.on(S));
    if (id === 'yakata') return Y && Y.R18 ? Y.R18.on(S) : true;
    return false;
  };
  FD.r18Clash = function (S, a, b) {
    var R = HK.R18M, o = HK.Pos ? HK.Pos.order(a, b, [a, b]) : [a, b], X = o[0], Y = o[1];
    /* 押さえ込む側・抗う側も向きに合わせる（自分で攻めを選んだ人は、押さえ込まれる側にしない） */
    var t = ST.fmt(ST.pick(S, OPEN), { a: X.name, b: Y.name });
    if (!R) return t;
    /* 描写の作風「男性向け」：合意の山場（storyEroSex）に流さず、無理やりの書き方のまま組む（story-lewd.js の X.storyForceSex。第6ラウンド）。
       性器なしの人がいる組は null なので、以前の文 */
    var LW = HK.Lewd, fx = LW && LW.storyForceSex && LW.storyEro && LW.storyEro(S) ? LW.storyForceSex(S, X, Y) : null;
    if (fx) return t + R.resist(S, X, Y, { endure: false }) + fx;
    return t + R.resist(S, X, Y, { endure: false }) + R.sex(S, X, Y, { mood: 'rough', fore: false, short: true });
  };
  /* 女性どうしの揉み合い（feud-kit.js の ffClash）も、作風「男性向け」のときは上と同じ組み立てにする（以前は小説調の FF の文のまま）。
     条件は feud-kit.js の clash と同じ（唇・体に踏み込める組・強引な側が攻め・夜の出来事が0でない・体を奪ってよい組・設定の愛憎なら表の顔が嫌悪系 FD.forceOk） */
  var clash0 = FD.clash;
  FD.clash = function (S, a, b, pick) {
    var LW = HK.Lewd, Pz = HK.Pos;
    if (LW && LW.storyEro && LW.storyForceSex && Pz && Pz.ff(a, b) && LW.storyEro(S) && !(HK.NoGen && HK.NoGen.on(a, b)) && FD.touchOk(S, a, b) && Pz.order(a, b, [a, b])[0] === a && FD.r18On(S) && FD.bodyOk(S, a, b) && (!FD.forceOk || FD.forceOk(S, a, b))) {
      var t = a.name + 'と' + b.name + 'の口論は、いつの間にか怒鳴り合いになっていた。' + HK.TL.line(a, 'LH_CLASH', b);
      return { text: t + FD.r18Clash(S, a, b) + HK.TL.line(a, 'LH_AFTER', b), r18: true, touch: true };
    }
    return clash0.apply(this, arguments);
  };
})();
