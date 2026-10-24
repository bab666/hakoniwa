/* 箱庭シミュレーター: 宇宙船漂流記 ― 特殊役職（不死・吸血鬼）（special.js の組み込み。全年齢版も同じ）
   ・死んだ不死・吸血鬼は、次の月のはじめに蘇る（船の外で行方不明になった・連れ去られた人は戻らない。全滅したあとは蘇らない）
   ・特殊役職の人は、ストレスの高い月が続くと発狂して動けなくなる（仲の良い人が落ち着かせるまで）
   ・吸血鬼は月に一度、人の血を吸う（船の上は時間の流れが単調なので、ひと月を三日分として数える）
   ship.js の月の流れから SH.SPEC.setup・SH.SPEC.month を呼ぶ */
(function () {
  'use strict';
  var HK = window.HK, SH = HK.SHIP, SP = HK.Special, ST = HK.Story;
  if (!SH || !SP || !ST) return;
  function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }
  function full(p) { return 70 + ((p.stats && p.stats.hp) || 3) * 6; }
  function adapter(S) {
    var A = S.spA;
    if (!A) A = S.spA = {
      rng: S.rng, all: S.P, env: S.env, scenId: 'ship',
      r18: !HK.SAFE_ON && (S.env.slewd || 0) > 0, lewd: clamp((S.env.slewd || 0) / 100, 0.15, 0.85),
      alive: function (p) { return !!p.alive; },
      here: function (p) { return !p.away && !p.gone; },
      say: function (o) { var r = ST.say(S, o); if (o.key && r) ST.key(S, r, o.key); return r; },
      hp: function (p) { return p.m.hp; },
      setHp: function (p, v) { p.m.hp = clamp(v, 0, full(p)); },
      full: full,
      stress: function (p) { return Math.max(p.m.st || 0, p.m.fear || 0); },
      addStress: function (p, v) { p.m.st = clamp((p.m.st || 0) + v, 0, 100); },
      rel: function (a, b) { var w = SH.bond ? SH.bond(S, a, b) : 0; return { love: w >= 0.95, w: w }; },
      revive: function (p) {
        p.alive = true; p.fate = '';
        var k = S.deaths.indexOf(p); if (k >= 0) S.deaths.splice(k, 1);
      },
      kill: function (p, how, text) {
        p.alive = false; p.fate = '死亡（' + S.m + 'か月目・' + how.replace(/で$|に$/, '') + '）';
        S.deaths.push(p);
        var o = ST.say(S, { actors: [p], tag: '死', kind: 'climax', text: text, why: how + '命を落とした', mag: 40 });
        ST.key(S, o, p.name + 'の死');
      },
      zombie: function () { return false; }
    };
    A.nowH = (S.m || 0) * 72;
    return A;
  }
  SH.SPEC = {
    setup: function (S, input) {
      SP.setup(adapter(S), S.P, function (p) { return input.perChar && input.perChar[p.i]; });
      S.P.forEach(function (p) { if (p.spec) p.roleLabel += '・' + SP.LABEL[p.spec]; });
    },
    /* 月のはじめ：蘇り → 発狂中の人の番 → 渇いた吸血鬼 → 精神の摩耗 */
    month: function (S) {
      if (!S.P.some(function (p) { return p.spec; })) return;
      var A = adapter(S);
      if (!S.wipeBy) SP.revive(A);
      S.P.forEach(function (p) {
        if (!p.spec || !p.alive || p.away) return;
        if (p.mad) { SP.madTurn(A, p); return; }
        SP.vampTurn(A, p);
        SP.wear(A, p, { base: 65 });
      });
    },
    note: function (p) { return SP.endNote(p); }
  };
})();
