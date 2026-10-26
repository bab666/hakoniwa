/* 箱庭シミュレーター: ダンジョンRPG ― 特殊役職（不死・吸血鬼）（special.js の組み込み）
   ・倒れたまま助からなかった不死・吸血鬼は、次の階に下りる前に起き上がる（魔術師に攫われているあいだは戻らない）
   ・特殊役職の人は、傷と深さで心がすり減ると発狂して動けなくなる（戦わない）。仲の良い仲間が落ち着かせるまで戻らない
   ・吸血鬼は三日に一度（地下では一階およそ半日）、仲間の血を吸う。全年齢の箱庭なので、性的な場面にはしない */
(function () {
  'use strict';
  var HK = window.HK, SP = HK.Special;
  if (!SP) return;
  var LOVE = /^(lover|mate|fated|almost|fwb)$/, FAM = /^(sibling|sibprot|sibclose|parent|pparent|relative)$/, CLOSE = /^(best|buddy|childhood|friend|mentor|master|teacher|senpai|colleague|classmate|boss|benefactor|worship|fond|blind)$/, BAD = /^(enemy|rival|bad|sibbad)$/;
  function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }
  function tie(S, a, b) {
    var t = (S.ties || []).filter(function (x) { return (x.a === a.i && x.b === b.i) || (x.a === b.i && x.b === a.i); })[0];
    return t ? t.type : '';
  }
  function adapter(S, floor) {
    var A = S.spA;
    if (!A) A = S.spA = {
      rng: S.rng, all: S.P, r18: false, env: S.env, scenId: 'rpg',
      alive: function (p) { return !!(p.alive || p.captive); },
      here: function (p) { return !p.captive; },
      say: function (o) { var r = HK.Story.say(S, o); if (o.key && r) HK.Story.key(S, r, o.key); return r; },
      hp: function (p) { return Math.round(p.hp / p.mhp * 100); },
      setHp: function (p, v) { p.hp = clamp(Math.round(p.mhp * v / 100), 0, p.mhp); if (p.hp <= 0 && p.alive) { p.alive = false; p.down++; } },
      full: function () { return 100; },
      stress: function (p) { return p.rs || 0; },
      addStress: function (p, v) { p.rs = clamp((p.rs || 0) + v, 0, 100); },
      rel: function (a, b) { var t = tie(S, a, b); return { love: LOVE.test(t), w: LOVE.test(t) ? 1 : FAM.test(t) ? 0.8 : CLOSE.test(t) ? 0.55 : BAD.test(t) ? -0.5 : 0.1 }; },
      revive: function (p) { p.alive = true; p.fate = ''; },
      kill: function (p, how, text) { p.alive = false; p.hp = 0; p.fate = how + '倒れ、二度と起き上がらなかった'; HK.Story.say(S, { actors: [p], tag: '死', kind: 'climax', text: text, why: how + '命を落とした', mag: 40 }); },
      zombie: function () { return false; }
    };
    A.nowH = floor * 12;
    return A;
  }
  HK.RPG_SPEC = {
    setup: function (S, input) {
      S.ties = S.ties || (HK.Story && HK.Story.tiesOk ? HK.Story.tiesOk(S.P, input.ties) : input.ties || []);
      SP.setup(adapter(S, 0), S.P, function (p) { return input.perChar && input.perChar[p.i]; });
    },
    label: function (p) { return p.spec ? '・' + SP.LABEL[p.spec] : ''; },
    /* 階の頭：蘇り・発狂中の人の番・渇いた吸血鬼 */
    floor: function (S, floor) {
      var A = adapter(S, floor);
      SP.revive(A);
      S.P.forEach(function (p) {
        if (!p.alive) return;
        A.addStress(p, 3);
        if (p.mad) SP.madTurn(A, p);
        else if (p.spec === 'vampire') SP.vampTurn(A, p);
        else SP.wear(A, p, { base: 55, lim: 22 });
      });
    },
    revive: function (S, floor) { SP.revive(adapter(S, floor)); },
    /* 傷を負うと心もすり減る */
    hurt: function (p, d) { if (p.spec) p.rs = clamp((p.rs || 0) + d * 0.9 + (p.alive ? 0 : 20), 0, 100); },
    note: function (p) { return SP.endNote(p); }
  };
})();
