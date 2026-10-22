/* 箱庭シミュレーター: 吹雪の館の殺人 ― 特殊役職（不死・吸血鬼）（special.js の組み込み）
   ・殺された不死・吸血鬼は、遺体が見つかったあと（朝・昼・夕方の頭）に蘇る。犯人の顔は見ていないので、事件の謎は残る
   ・特殊役職の人は、恐怖の高い時間が続くと発狂して動けなくなる（仲の良い人が落ち着かせるまで）。発狂中は犯人に狙われやすい
   ・吸血鬼は三日に一度、夜に人の血を吸う */
(function () {
  'use strict';
  var HK = window.HK, Y = HK.YAKATA, SP = HK.Special, ST = HK.Story;
  if (!Y || !SP || !ST) return;
  function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }
  var NOTE = ['{a}は、自分を殺した相手の顔を覚えていなかった。暗がりで、背後から襲われたのだ。', '{a}は首をさすりながら言った。「……誰にやられたのかは、分からない」'];
  function adapter(S, h) {
    var A = S.spA;
    if (!A) A = S.spA = {
      rng: S.rng, all: S.P,
      r18: !!(Y.R18 && Y.R18.on(S)), lewd: clamp((S.env.ylewd || 0) / 100, 0.15, 0.85),
      alive: function (p) { return !!p.alive; },
      here: function (p) { return !p.gone; },
      say: function (o) {
        var a0 = o.actors[0];
        if (o.tag === '蘇生' && S.kills.some(function (k) { return k.v === a0; })) o.text += NOTE[Math.floor(S.rng() * NOTE.length)].replace(/\{a\}/g, a0.name);
        var r = o.short && S.room != null ? ST.sayB(S, o, o.short) : ST.say(S, o);
        if (o.key && r) ST.key(S, r, o.key);
        return r;
      },
      hp: function (p) { return p.hpS == null ? 100 : p.hpS; },
      setHp: function (p, v) { p.hpS = clamp(v, 0, 100); },
      full: function () { return 100; },
      stress: function (p) { return p.m.fear; },
      addStress: function (p, v) { p.m.fear = clamp(p.m.fear + v, 0, 100); },
      rel: function (a, b) { return { love: Y.cat(S, a, b) === 'love', w: Y.bond(S, a, b) }; },
      revive: function (p) { p.alive = true; p.fate = ''; },
      kill: function (p, how, text, by) {
        p.alive = false; p.fate = how + '死亡（' + S.curDay + '日目）';
        if (by) (S.extraKills = S.extraKills || []).push({ a: by, b: p });
        var o = ST.say(S, { actors: by ? [by, p] : [p], tag: '死', kind: 'climax', text: text, why: how + '命を落とした', mag: 40 });
        ST.key(S, o, p.name + 'の死');
      },
      zombie: function () { return false; }
    };
    A.nowH = h;
    return A;
  }
  function hourOf(day, ph) { return (day - 1) * 24 + ({ night: 22, morning: 8, noon: 12, eve: 17 }[ph] || 0); }
  Y.SPEC = {
    setup: function (S, input) {
      SP.setup(adapter(S, 0), S.P, function (p) { return input.perChar && input.perChar[p.i]; });
      S.P.forEach(function (p) { if (p.spec) p.roleLabel += '・' + SP.LABEL[p.spec]; });
    },
    /* 夜：渇いた吸血鬼が動く */
    night: function (S, day) {
      var A = adapter(S, hourOf(day, 'night'));
      S.P.forEach(function (p) { if (p.alive && !p.gone && !p.bound && !p.mad) SP.vampTurn(A, p); });
    },
    /* 朝・昼・夕方の頭：蘇り・発狂中の人の番・渇き */
    revive: function (S, day, ph) {
      var A = adapter(S, hourOf(day, ph || 'morning'));
      SP.revive(A);
      S.P.forEach(function (p) {
        if (!p.alive || p.gone || p.bound) return;
        if (p.mad) SP.madTurn(A, p);
        else if (p.spec === 'vampire') SP.vampTurn(A, p);
      });
    },
    /* 場面の終わり：特殊役職の精神の摩耗 */
    wear: function (S, day, ph) {
      var A = adapter(S, hourOf(day, ph));
      S.P.forEach(function (p) { if (p.alive && !p.gone) SP.wear(A, p, { base: 60, lim: 20 }); });
    },
    danger: function (p) { return SP.danger(p); },
    note: function (p) { return SP.endNote(p); }
  };
})();
