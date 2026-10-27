/* 箱庭シミュレーター: 合コンの「住人どうしの関係」が「全員初対面として扱う」（env.rel が fresh）のとき、合コンに渡す前に関係を外す（全年齢版も同じ）
   2026-10-27（分割読み込みの第3段）：goukon-rel.js（箱庭のかたまり scen-goukon）から、HK.simulate の包みだけを中核に分けた。
   中核のほかの HK.simulate の包み（scenario-futari・pos・persona-final など。素の代入で包む）との順を、全部を元の順で読んだときと同じにするため */
(function () {
  'use strict';
  var HK = window.HK;
  if (!HK) return;
  /* ---------- 全員初対面：合コンに渡す前に関係を外す ---------- */
  /* 残す関係：恋人の記録に関わるもの（恋人・番・運命の番・夫婦・許嫁・歪んだ関係）と、恋愛にしない決まり（無関心・恐怖） */
  var KEEP_FRESH = /^(lover|mate|fated|spouse|fiance|abuse|apathy|fear)$/;
  function freshInput(input) {
    var ts = input.ties || [], out = [], chars = null;
    ts.forEach(function (t) {
      if (!t) return;
      if (KEEP_FRESH.test(t.type)) { out.push(t); return; }
      /* 家族（恋愛：なし）：関係は外し、互いを「恋愛・R18にしない相手」に入れる */
      var D = HK.TIES[t.type];
      if (D && D.family && HK.tieNoLove && HK.tieNoLove(t) && t.a !== t.b) {
        chars = chars || (input.chars || []).map(function (c) { var x = {}; for (var k in c) x[k] = c[k]; x.loveNG = Array.isArray(c.loveNG) ? c.loveNG.slice() : []; return x; });
        var A = chars[t.a], B = chars[t.b];
        if (A && B) { if (A.loveNG.indexOf(t.b) < 0) A.loveNG.push(t.b); if (B.loveNG.indexOf(t.a) < 0) B.loveNG.push(t.a); }
      }
    });
    var o = {}; for (var k2 in input) o[k2] = input[k2];
    o.ties = out;
    if (chars) o.chars = chars;
    return o;
  }
  var sim0 = HK.simulate;
  if (sim0) {
    HK.simulate = function (input) {
      if (input && input.scenId === 'goukon' && input.env && input.env.rel === 'fresh' && input.ties && input.ties.length) input = freshInput(input);
      return sim0.call(this, input);
    };
    for (var k in sim0) if (Object.prototype.hasOwnProperty.call(sim0, k)) HK.simulate[k] = sim0[k];
  }
})();
