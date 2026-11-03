/* 新婚部屋：元の関係が分かる出来事と「元○○」の扱い（両方のビルド。2026-11-03 利用者の追加の指示「関係性の出来事をもっと増やす」「結婚しないはずの関係は元○○の扱い」）
   ■ HK.ShinkonPast（PS）
     ・PS.exOf(ties, ai, bi)：二人の関係（入力の ties）に「結婚しないはずの関係」（EXK：恐怖（「恋愛：あり」を選んだときだけ）・敵対・主従・ライバル・不仲・愛憎）があり、恋人・夫婦などの関係が無く、
       ほかに「恋愛：なし」の関係（家族・無関心・信仰など）も「恋愛：なし」を選んだ関係も無ければ { k, x }（x＝恐怖なら怖がっていた人・主従なら主の番号）。
       shinkon.js が HK.simulate の包みで、元の関係のまま（keep）遊ぶ二人のこの関係を外して夫婦にする（恋愛にしてよい二人だけ。入力は書き換えず写しで動かす）
     ・PS.info(ctx, S, a, b)：二人の元の関係のまとめ { past: { k: 関係の鍵, x }, exr: { k, x, y, fm（恐怖：calm もう怖くない／still まだ少し） } }。
       元の関係のまま遊ぶ二人は入力の関係（なれそめで上書きしても、上書きする前の関係）から、なれそめを選んだ二人はなれそめ（幼なじみ・元ライバル・元同僚 など）から
     ・PS.intro(ctx, S, a, b)：元○○の二人の導入（地の文＋「まさか私たちが結婚するなんて……」＋相手の返事。態度 9 種 × 関係ごと。恐怖は もう怖くない／まだ少し）
     ・PS.roll(ctx, S, day)・PS.run(ctx, S, day, part)：元の関係が分かる出来事（関係ごとに 4 種）と、元○○らしい出来事（4 種）を、日中・夜に一つ（HK.relFilter で関係に合う文だけ）
   文は shinkon-past-text.js（HK.ShinkonPastText）。登場人物はすべて成人として扱う */
/* @event scen=set-b-shinkon id=sk_ex_intro cat=romance tie=- cond=元ライバル・元不仲などで結婚した二人 label=まさか私たちが結婚するなんて */
/* @event scen=set-b-shinkon id=sk_ex_rival cat=romance tie=rival label=元ライバルの夫婦の張り合い（4種） */
/* @event scen=set-b-shinkon id=sk_ex_bad cat=romance tie=bad label=元不仲の夫婦のつい出る意地（4種） */
/* @event scen=set-b-shinkon id=sk_ex_enemy cat=romance tie=enemy label=元敵どうしの夫婦の昔の名残（4種） */
/* @event scen=set-b-shinkon id=sk_ex_fear cat=romance tie=fear label=怖かった相手に少しずつ慣れる（4種） */
/* @event scen=set-b-shinkon id=sk_ex_lovehate cat=romance tie=lovehate label=憎まれ口を叩き合う夫婦（4種） */
/* @event scen=set-b-shinkon id=sk_ex_master cat=romance tie=master label=元主従の夫婦の対等の練習（4種） */
/* @event scen=set-b-shinkon id=sk_past_friend cat=bond tie=friend label=友人どうしの昔の話（4種） */
/* @event scen=set-b-shinkon id=sk_past_childhood cat=bond tie=childhood label=幼なじみの子どものころの話（4種） */
/* @event scen=set-b-shinkon id=sk_past_classmate cat=bond tie=classmate label=同級生だった教室の話（4種） */
/* @event scen=set-b-shinkon id=sk_past_work cat=bond tie=colleague label=同じ職場の二人の仕事の話（4種） */
/* @event scen=set-b-shinkon id=sk_past_senpai cat=bond tie=senpai label=先輩と後輩の昔の話（4種） */
/* @event scen=set-b-shinkon id=sk_past_mentor cat=bond tie=mentor label=師匠と弟子の修業の話（4種） */
/* @event scen=set-b-shinkon id=sk_past_pfam cat=bond tie=pparent label=家族同然に過ごした二人の昔の話（4種） */
/* @event scen=set-b-shinkon id=sk_past_ex cat=romance tie=ex label=一度別れた二人の昔の話（4種） */
/* @event scen=set-b-shinkon id=sk_past_crush cat=romance tie=crush label=片想いだったころの話（4種） */
/* @event scen=set-b-shinkon id=sk_past_almost cat=romance tie=almost label=両片想いだったころの話（4種） */
/* @event scen=set-b-shinkon id=sk_past_lover cat=romance tie=lover label=恋人だったころの話（4種） */
/* @event scen=set-b-shinkon id=sk_past_fiance cat=romance tie=fiance label=許嫁だったころの話（4種） */
(function () {
  'use strict';
  var HK = window.HK;
  if (!HK) return;
  var PS = HK.ShinkonPast = {};
  function TX() { return HK.ShinkonPastText || {}; }
  function SK() { return HK.Shinkon; }
  /* ---------- 元○○（結婚しないはずの関係） ---------- */
  var EXK = ['fear', 'enemy', 'master', 'rival', 'bad', 'lovehate'];
  var EXNAME = { rival: '元ライバル', bad: '元不仲', enemy: '元敵どうし', fear: '元恐怖（怖かった相手）', lovehate: '元愛憎', master: '元主従' };
  var WAS = { rival: 'ライバルだった', bad: '顔を合わせればけんかばかりだった', enemy: '敵どうしだった', lovehate: '憎まれ口ばかり叩き合っていた', master: '主従だった', fear: '怖かった' };
  var LOVE_T = /^(lover|spouse|fiance|mate|fated|ex|crush|almost|fwb|honmei|yan|abuse)$/;
  PS.EXK = EXK; PS.EXNAME = EXNAME;
  function between(ties, ai, bi) { return (ties || []).filter(function (t) { return t && ((t.a === ai && t.b === bi) || (t.a === bi && t.b === ai)); }); }
  PS.exOf = function (ties, ai, bi) {
    var mine = between(ties, ai, bi), ex = null;
    if (!mine.length) return null;
    for (var k = 0; k < EXK.length && !ex; k++) ex = mine.filter(function (t) { return t.type === EXK[k]; })[0] || null;
    if (!ex) return null;
    for (var i = 0; i < mine.length; i++) {
      var t = mine[i];
      if (LOVE_T.test(t.type)) return null;
      /* 恐怖・無関心は自動の「恋愛：なし」（恐れる側は恋愛にも夜にもならない。本体の state S20・sexgate の決まり）。恐怖は「恋愛：あり」を選んだときだけ元○○にする */
      if (t.type === 'fear' && t.love !== 'ok') return null;
      if (t.love === 'no') return null;
      if (EXK.indexOf(t.type) < 0 && HK.tieLoveDefault && HK.tieLoveDefault(t) === 'no' && !((HK.TIES[t.type] || {}).loveSoft)) return null;
    }
    return { k: ex.type, x: ex.type === 'fear' || ex.type === 'master' ? ex.a : ai };
  };
  /* ---------- 元の関係のまとめ ---------- */
  var CLS = { friend: 'friend', best: 'friend', buddy: 'friend', comrade: 'friend', childhood: 'childhood', classmate: 'classmate', teacher: 'mentor', mentor: 'mentor', senpai: 'senpai',
    colleague: 'work', boss: 'work', pparent: 'pfam', benefactor: 'pfam', ex: 'ex', crush: 'crush', almost: 'almost', lover: 'lover', spouse: 'lover', mate: 'lover', fiance: 'fiance' };
  var ORD = ['fiance', 'almost', 'crush', 'ex', 'lover', 'pfam', 'mentor', 'senpai', 'work', 'classmate', 'childhood', 'friend'];
  var DIR = { senpai: 1, mentor: 1, teacher: 1, pparent: 1, benefactor: 1, crush: 1, boss: 1 };
  PS.NAME = { friend: '友人', childhood: '幼なじみ', classmate: '同級生', work: '同じ職場', senpai: '先輩と後輩', mentor: '師弟', pfam: '家族同然', ex: '元恋人', crush: '片想いから', almost: '両片想いから', lover: '恋人から', fiance: '許嫁' };
  /* なれそめ（shinkon-data.js の REL）の番号 → 元の関係の鍵（1 元ライバルは元○○） */
  var NARE = { 0: 'childhood', 2: 'crush', 3: 'work', 5: 'pfam', 6: 'ex', 9: 'lover' };
  PS.clsOf = function (ties, ai, bi) {
    var mine = between(ties, ai, bi), best = null, bi0 = 99;
    mine.forEach(function (t) {
      var k = CLS[t.type]; if (t.type === 'crush' && t.cold === 'mutual') k = 'almost';
      if (!k) return;
      var o = ORD.indexOf(k);
      if (o < bi0) { bi0 = o; best = { k: k, x: DIR[t.type] ? t.a : null }; }
    });
    return best;
  };
  function key(a, b) { return a.i < b.i ? a.i + '-' + b.i : b.i + '-' + a.i; }
  PS.info = function (ctx, S, a, b) {
    var C = S.pastC = S.pastC || {}, kk = key(a, b);
    if (C[kk]) return C[kk];
    var inp = ctx.input || {}, orig = inp._skOrig || inp.ties || [], X = (ctx._skEx || {})[kk], r = { past: null, exr: null };
    var first = (a === S.A0 || a === S.B0) && (b === S.A0 || b === S.B0);
    if (X) r.exr = { k: X.k, x: ctx.chars[X.x] === b ? b : a };
    else if (first && !S.keep && S.rel === 1) r.exr = { k: 'rival', x: ctx.rng() < 0.5 ? a : b, nare: true };
    if (r.exr) {
      r.exr.y = r.exr.x === a ? b : a;
      if (r.exr.k === 'fear') { var t = r.exr.x.tr || {}; r.exr.fm = ctx.rng() < 0.45 + (t.fc || 0.5) * 0.2 + (1 - (t.ac || 0.5)) * 0.2 ? 'calm' : 'still'; }
    }
    var pc = S.keep ? PS.clsOf(orig, a.i, b.i) : first && NARE[S.rel] ? { k: NARE[S.rel], x: null } : !first ? PS.clsOf(orig, a.i, b.i) : null;
    if (pc) r.past = { k: pc.k, x: pc.x != null ? (ctx.chars[pc.x] === b ? b : a) : null };
    return (C[kk] = r);
  };
  function F(ctx, t, a, b, ex) { return t ? SK().fill(ctx, t, a, b, ex) : ''; }
  function P(ctx, arr, a, b) { return SK().pickT(ctx, arr, a, b); }
  /* ---------- 元○○の導入（「まさか私たちが結婚するなんて……」） ---------- */
  PS.intro = function (ctx, S, a, b) {
    var I = PS.info(ctx, S, a, b), X = I.exr, T = TX();
    if (!X || !S.wed) return null;
    var x = X.x, y = X.y, k = X.k, per = SK().per;
    var nar = P(ctx, (T.EXNARR || {})[k], x, y), say, ans, why;
    if (k === 'fear') {
      say = P(ctx, ((T.FEAR || {})[X.fm] || {})[per(x)] || ((T.FEAR || {})[X.fm] || {}).gentle, x, y);
      ans = P(ctx, (T.FEARANS || {})[X.fm], y, x);
      why = '新婚部屋：まさか私たちが結婚するなんて（' + EXNAME[k] + '・' + x.name + 'は' + (X.fm === 'calm' ? 'もう怖くない' : 'まだ少し怖い') + '）';
    } else {
      var sp = ctx.rng() < 0.5 ? x : y, ot = sp === x ? y : x;
      say = P(ctx, (T.EXSAY || {})[per(sp)] || (T.EXSAY || {}).gentle, sp, ot);
      ans = P(ctx, (T.EXANS || {})[per(ot)] || (T.EXANS || {}).gentle, ot, sp);
      say = say ? F(ctx, say, sp, ot, { was: WAS[k] }) : '';
      ans = ans ? F(ctx, ans, ot, sp) : '';
      why = '新婚部屋：まさか私たちが結婚するなんて（' + EXNAME[k] + (X.nare ? '・なれそめ' : '') + '・' + sp.name + 'から）';
      var tx0 = F(ctx, nar, x, y) + (say ? '\n\n' + say + ans : '');
      return ctx.act2({ actors: [sp, ot], cat: 'romance', text: tx0, why: why, fx: function () { ctx.mod2(sp, ot, { aff: 3, att: 3 }, { aff: 3, att: 3 }); } });
    }
    var tx = F(ctx, nar, x, y) + (say ? '\n\n' + F(ctx, say, x, y) + F(ctx, ans, y, x) : '');
    return ctx.act2({ actors: [x, y], cat: 'romance', text: tx, why: why, fx: function () { ctx.mod2(x, y, { aff: 3, trust: X.fm === 'calm' ? 4 : 1 }, { aff: 3, att: 2 }); } });
  };
  /* ---------- 日中・夜の出来事 ---------- */
  var EXP = { kyoso: 'd', mushi: 'n', sunao: 'd', kuse: 'd', nareru: 'n' };
  var PP = { yobi: 'd', yaku: 'n', chijin: 'd', kenka: 'n' };
  var KN = { kyoso: '張り合う', mushi: '昔を蒸し返す', sunao: '素直になれない', kuse: '昔の癖', nareru: '慣れていく', yobi: '昔の呼び方', yaku: '昔の約束', chijin: '共通の知り合い・昔の場所', kenka: '昔のけんか' };
  PS.roll = function (ctx, S, day) {
    if (day.sick || day.apart || day.sea || day.bday || day.vday || day.wday) return;
    var I = PS.info(ctx, S, S.A, S.B), U = S.pastUsed = S.pastUsed || {}, T = TX(), c = [];
    if (I.exr && S.wed) Object.keys((T.EXEV || {})[I.exr.k] || {}).forEach(function (k) { if (!U['ex:' + I.exr.k + ':' + k]) c.push({ t: 'ex', k: k, w: 1.2 }); });
    if (I.past) Object.keys((T.PAST || {})[I.past.k] || {}).forEach(function (k) { if (!U['p:' + I.past.k + ':' + k + ':' + key(S.A, S.B)]) c.push({ t: 'past', k: k, w: 1 }); });
    if (!c.length || ctx.rng() > 0.42) return;
    var p = HK.weighted(ctx.rng, c, function (x) { return x.w; });
    day.pastEv = { t: p.t, k: p.k, part: p.t === 'ex' ? EXP[p.k] : PP[p.k], I: I };
  };
  PS.run = function (ctx, S, day, part) {
    var E = day.pastEv, T = TX();
    if (!E || E.part !== part || E.done || day.sick || day.apart) return;
    E.done = true;
    var I = E.I, U = S.pastUsed = S.pastUsed || {}, a, b, arr, why, tie;
    if (E.t === 'ex') {
      var X = I.exr; a = X.x; b = X.y;
      if (X.k !== 'fear' && X.k !== 'master' && ctx.rng() < 0.5) { a = X.y; b = X.x; }
      arr = ((T.EXEV || {})[X.k] || {})[E.k]; U['ex:' + X.k + ':' + E.k] = 1;
      why = '新婚部屋：' + EXNAME[X.k] + 'の二人（' + KN[E.k] + '）';
    } else {
      var Q = I.past; a = Q.x || (ctx.rng() < 0.5 ? S.A : S.B); b = a === S.A ? S.B : S.A;
      arr = ((T.PAST || {})[Q.k] || {})[E.k]; U['p:' + Q.k + ':' + E.k + ':' + key(S.A, S.B)] = 1;
      why = '新婚部屋：元の関係（' + PS.NAME[Q.k] + '・' + KN[E.k] + '）'; tie = Q.k;
    }
    var t = P(ctx, arr, a, b);
    if (!t) return;
    var rom = SK().ROM.test(t), re = { text: '', odd: false };
    var e = ctx.act2({ actors: [a, b], cat: S.love && (rom || E.t === 'ex') ? 'romance' : 'bond', text: F(ctx, t, a, b) + re.text, odd: re.odd, why: why,
      fx: function () { ctx.mod2(a, b, { aff: 2, trust: 2, att: S.love ? 1 : 0 }, { aff: 2, trust: 2, att: S.love ? 1 : 0 }); } });
    if (e) { S.pastN = (S.pastN || 0) + 1; if (re.odd) S.odd++; }
  };
})();
