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
      rng: S.rng, all: S.P, env: S.env, scenId: 'yakata',
      r18: !!(Y.R18 && Y.R18.on(S)), lewd: clamp((S.env.ylewd || 0) / 100, 0.15, 0.85),
      alive: function (p) { return !!p.alive; },
      here: function (p) { return !p.gone; },
      say: function (o) {
        var a0 = o.actors[0];
        var kk = o.tag === '蘇生' ? S.kills.filter(function (k) { return k.v === a0 && !k.revived; })[0] : null;
        if (kk) o.text += NOTE[Math.floor(S.rng() * NOTE.length)].replace(/\{a\}/g, a0.name);
        var r = o.short && S.room != null ? ST.sayB(S, o, o.short) : ST.say(S, o);
        if (o.key && r) ST.key(S, r, o.key);
        /* 殺された人が蘇った：犯人の反応と、探偵が証言から手がかりを拾う（推理にも残す） */
        if (kk) { kk.revived = true; a0.spRevealed = true; reactRevive(S, a0); }
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
  /* 犯人の反応（冷たい人は平然を装い、衝動的な人は動揺し、ほかは確かめに行く） */
  var CUL = {
    cold: ['{c}は、眉ひとつ動かさなかった。ただ、カップを持つ指先だけが白くなっていた。', '{c}は「よかった」とだけ言った。その声は、ほかの誰よりも落ち着いていた。', '{c}は窓の外の吹雪に目をやったまま、{a}のほうを一度も見なかった。'],
    shaken: ['{c}の手から、持っていたものが床に落ちた。{c}は慌てて拾い上げ、「驚いて」とだけ言った。', '{c}の顔から、さっと血の気が引いた。誰よりも早く、{c}はその場を離れた。', '{c}は「嘘だろ」と呟きかけて、口をつぐんだ。その一言を、何人かが聞いていた。'],
    check: ['夜更け、{c}は{a}の部屋の前で長いこと立ち止まっていた。足音に気づいて、{c}は何も言わずに去った。', '{c}は、{a}に「本当に何も覚えていないのか」と、二度も確かめた。', '{c}は、蘇った{a}の首筋の傷を、じっと見つめていた。その目は、心配しているようには見えなかった。']
  };
  var CLUE = ['{a}の話を聞いた{d}は、手帳に何かを書き足した。――{t}', '{d}は{a}に、襲われた時刻と場所を繰り返し尋ねた。――{t}', '「顔は見ていない。でも、匂いだけは覚えている」{a}の一言で、{d}は一つの線を引いた。――{t}'];
  function reactRevive(S, a) {
    var rng = S.rng, c = S.cul, F = function (t, v) { return ST.fmt(t, v); };
    if (c && c !== a && c.alive && !c.gone && !c.bound) {
      var t = c.tr || {}, k = (t.cold || 0) > 0.55 ? 'cold' : (t.impulse || 0) > 0.5 ? 'shaken' : 'check';
      c.m.sus = clamp((c.m.sus || 0) + (k === 'shaken' ? 18 : k === 'check' ? 10 : 4), 0, 100);
      ST.say(S, { actors: [c, a], tag: '動揺', text: F(CUL[k][Math.floor(rng() * CUL[k].length)], { a: a.name, c: c.name }), why: '殺したはずの' + a.name + 'が蘇った（' + c.name + 'の反応：' + { cold: '平然を装う', shaken: '動揺する', check: '確かめに行く' }[k] + '）', mag: 24 });
    }
    var ds = Y.investigators ? Y.investigators(S).filter(function (d) { return d !== a && d !== c; }) : [];
    if (ds.length && Y.gainClue && rng() < 0.6) {
      var d = ds[0], tc = Y.gainClue(S, d, 'witness');
      if (tc) ST.say(S, { actors: [d, a], tag: '手がかり', text: F(CLUE[Math.floor(rng() * CLUE.length)], { a: a.name, d: d.name, t: tc }), why: '蘇った' + a.name + 'の証言', mag: 22 });
    }
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
