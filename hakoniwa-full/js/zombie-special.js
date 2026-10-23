/* 箱庭シミュレーター: ゾンビの街 ― 特殊役職（不死・吸血鬼）（special.js の組み込み）
   ・不死／吸血鬼は、死んでも次の区切りの頭に蘇る。咬まれてゾンビになっても、やがて人に戻って起き上がる
   ・特殊役職の人は、ストレスの高い時間が続くと発狂して動けなくなる（同じエリアの仲の良い人が落ち着かせるまで）
   ・吸血鬼は三日に一度、同じエリアにいる人の血を吸う（ゾンビ・咬まれた人の血は吸えない） */
(function () {
  'use strict';
  var HK = window.HK, Z = HK.ZB, SP = HK.Special;
  if (!Z || !Z.scen || !SP) return;
  var LOVE = /^(lover|mate|fated|almost|fwb)$/;
  var BACK = ['{a}の濁った目に、少しずつ光が戻っていった。腐りかけていた肌が張りを取り戻し、{a}は自分の手を見つめて呟いた。「……戻って、きた？」', 'ゾンビの群れの中で、{a}の足が止まった。{a}は激しく咳き込み、黒い血を吐き出した。次に顔を上げたとき、{a}は人間の目をしていた。'];
  function adapter(ctx) {
    var A = ctx.spA;
    if (!A) A = ctx.spA = {
      rng: ctx.rng, all: ctx.chars,
      r18: !HK.SAFE_ON && (ctx.env.zlewd != null || !!(HK.Lewd && HK.Lewd.conf('zombie'))) && Z.loveLv(ctx) !== 'off', lewd: Z.loveLv(ctx) === 'high' ? 0.55 : 0.3,
      alive: function (c) { return !!c.alive; },
      here: function (c) { return !c.out; },
      near: function (a, b) { return a.z && b.z && a.z.area === b.z.area; },
      say: function (o) {
        var e = ctx.act2({ actors: o.actors, cat: o.tag === '吸血' || o.tag === '凶行' ? 'combat' : 'solo', text: o.text, why: o.why, mag: o.mag || 0 });
        return e;
      },
      hp: function (c) { return c.hp; },
      setHp: function (c, v) { c.hp = Math.max(0, Math.min(c.hpMax || 100, v)); },
      full: function (c) { return c.hpMax || 100; },
      stress: function (c) { return c.stress; },
      addStress: function (c, v) { c.stress = Math.max(0, Math.min(100, c.stress + v)); },
      rel: function (a, b) {
        var t = HK.Ties && HK.Ties.get(ctx, a, b), r = ctx.R(a, b);
        return { love: !!((t && LOVE.test(t.type || '')) || ctx.pair(a, b).couple), w: Math.max(-1, Math.min(1, r.aff / 80)) };
      },
      relMod: function (b, a, how) { ctx.mod(b, a, how === '力ずく' ? { trust: -25, aff: -15 } : how === '催眠' ? { trust: -6 } : { aff: 6, trust: 6 }); },
      reviveText: function (c) { return c.spWasZ ? BACK[Math.floor(ctx.rng() * BACK.length)].replace(/\{a\}/g, c.name) : null; },
      revive: function (c) {
        var zb = ctx.zb;
        c.spWasZ = c.fate === 'ゾンビ化';
        if (c.spWasZ) {
          /* ゾンビになっていた体が人に戻る：群れの記録から外す */
          zb.zpc = zb.zpc.filter(function (z) { return z.i !== c.i; });
        }
        c.alive = true; c.fate = ''; c.fateNote = ''; c.deathHow = ''; c.diedAt = null; c.killedBy = null;
        c.z.bitten = null; c.z.turnAt = -1; c.z.aware = false; c.z.decided = false; c.z.wound = -1; c.z.hiding = false;
      },
      kill: function (c, how, text, by) {
        ctx.act2({ actors: by ? [by, c] : [c], cat: 'death', text: text, why: how + '命を落とした', mag: 40 });
        ctx.kill(c, by || null, how);
      },
      zombie: function (c) { return !!(c.z && c.z.bitten); }
    };
    A.nowH = ctx.stepIndex * 6;
    return A;
  }
  var sc = Z.scen, setup0 = sc.setup, phase0 = sc.phase, after0 = sc.after, finish0 = sc.finish, end0 = sc.end;
  /* 全員が倒れても、蘇る人が残っていれば続ける */
  sc.end = function (ctx) { return end0(ctx) && !ctx.chars.some(function (c) { return c.spec && !c.alive && !c.spNoRev && !c.spGone && !c.out; }); };
  sc.setup = function (ctx) {
    setup0(ctx);
    ctx.chars.forEach(function (c) { c.hpMax = c.hp; });
    SP.setup(adapter(ctx), ctx.chars, function (c) { return { pick: c.pick }; });
  };
  sc.phase = function (ctx, s, n) {
    var A = adapter(ctx);
    if (s > 0) SP.revive(A);
    phase0(ctx, s, n);
    ctx.flush();
    ctx.present().forEach(function (c) {
      if (!c.alive || c.out) return;
      if (c.mad) SP.madTurn(A, c);
      else if (c.spec === 'vampire') SP.vampTurn(A, c);
    });
  };
  sc.after = function (ctx, s, n) {
    after0(ctx, s, n);
    var A = adapter(ctx);
    ctx.present().forEach(function (c) { SP.wear(A, c, { base: 64, lim: 26 }); });
    /* 最後の区切りで死んだ不死も、結末の前に起き上がる */
    if (s === n - 1) SP.revive(A);
  };
  sc.finish = function (ctx) {
    finish0(ctx);
    ctx.chars.forEach(function (c) { var t = SP.endNote(c); if (t) c.fateNote = (c.fateNote ? c.fateNote + '／' : '') + t; });
  };
})();
