/* 箱庭シミュレーター: 両片想い ― 設定の「両片想い」（と夫婦・義理のきょうだい）を、箱庭に渡す前に向きを逆にした片想い二本に開く（HK.Ties.expand）
   どの箱庭でも要るので中核に置く。出来事（pining.js）は恋愛系のかたまり（pack-rel）。読み込みの順は pining.js のすぐ前（包む順を変えない） */
(function () {
  'use strict';
  var HK = window.HK;
  if (!HK || !HK.Ties) return;
  /* 設定の「両片想い」を開いてから箱庭に渡す */
  if (HK.simulate && !HK.simulate._pining) {
    var sim0 = HK.simulate;
    HK.simulate = function (input) {
      if (input && input.ties && input.ties.some(function (t) { return t && ((t.type === 'crush' && t.cold === 'mutual') || t.type === 'spouse' || t.type === 'stepsib' || t.type === 'twin'); })) {
        var o = {}; for (var k in input) o[k] = input[k];
        o.ties = HK.Ties.expand(input.ties);
        arguments[0] = o;
      }
      return sim0.apply(this, arguments);
    };
    HK.simulate._pining = true;
  }
})();
