/* 箱庭シミュレーター: 邪神村RTA ― 特殊役職（不死・吸血鬼）と発狂（special.js の組み込み）
   ・不死／吸血鬼は、死んでも次の二時間の頭に蘇る（連れ去り・神隠しのような行方不明は戻らない）
   ・この村では、特殊役職でなくても全員が発狂しうる。恐怖の高い時間が続くと精神が摩耗し、発狂する（十通り・性格でなりやすさが違う）。
     発狂した人は、仲の良い人が落ち着かせるまで動けず、村人の襲撃や死の罠を引きやすい
   ・吸血鬼は三日に一度、人の血を吸う */
(function () {
  'use strict';
  var HK = window.HK, JS = HK.JASHIN, SP = HK.Special;
  if (!JS || !SP) return;
  function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }
  function adapter(S) {
    var A = S.spA;
    if (A) { A.nowH = S.h || 0; return A; }
    A = S.spA = {
      rng: S.rng, all: S.P, nowH: S.h || 0,
      r18: !!(JS.R18 && JS.R18.on(S)), lewd: clamp((S.env.jlewd || 0) / 100, 0.15, 0.85),
      alive: function (p) { return !!p.alive; },
      here: function (p) { return !p.out && !p.taken; },
      say: function (o) {
        var r = o.short && S.room != null ? HK.Story.sayB(S, o, o.short) : HK.Story.say(S, o);
        if (o.key && r) HK.Story.key(S, r, o.key);
        return r;
      },
      hp: function (p) { return p.m.hp; },
      setHp: function (p, v) { p.m.hp = clamp(v, 0, 100); },
      full: function () { return 100; },
      stress: function (p) { return p.m.fear; },
      addStress: function (p, v) { p.m.fear = clamp(p.m.fear + v, 0, 100); },
      rel: function (a, b) { return { love: JS.REL.cat(S, a, b) === 'love', w: JS.REL.bond(S, a, b) }; },
      revive: function (p) { p.alive = true; p.fate = ''; p.how = ''; p.taken = false; },
      kill: function (p, how, text) { JS.core.die(S, p, how, [text]); },
      zombie: function () { return false; }
    };
    return A;
  }
  JS.SPEC = {
    setup: function (S, input) {
      SP.setup(adapter(S), S.P, function (p) { return input.perChar && input.perChar[p.i]; });
      S.P.forEach(function (p) { if (p.spec) p.roleLabel = (p.roleLabel || '') + '・' + SP.LABEL[p.spec]; });
    },
    /* 二時間の頭：蘇り */
    revive: function (S) { SP.revive(adapter(S)); },
    /* 二時間の終わり：精神の摩耗（全員） */
    wear: function (S, live) {
      var A = adapter(S);
      live.forEach(function (p) { SP.wear(A, p, { all: true, zealot: true, base: 55, lim: 20 }); });
    },
    danger: function (p) { return SP.danger(p); },
    mad: function (p) { return SP.isMad(p); },
    /* 住人の番：発狂中・渇いた吸血鬼。行動を使ったら true */
    act: function (S, p) {
      var A = adapter(S);
      if (p.mad) return SP.madTurn(A, p);
      return SP.vampTurn(A, p);
    },
    note: function (p) { var n = SP.endNote(p); if (p.mad && !p.spec) n = '発狂（' + p.mad.label + '）したまま'; return n; }
  };
})();
