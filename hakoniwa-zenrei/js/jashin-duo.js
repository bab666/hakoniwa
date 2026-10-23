/* 箱庭シミュレーター: 邪神村RTA ― 役職×役職の特別な出来事（協力 100・因縁 100）
   特定の役職の二人がそろっていると、短い出来事が起きる（その組み合わせがいる回の三回に一回くらい）。
   ・敵対していない二人：協力（ally）。敵対している二人：因縁（foe）
   ・成否は二人の能力（出来事ごとに決まった調べる力）の合計で決まる。成功すると劇的に進み、失敗すると決裂する
   ・種類：手がかりを得る（clue）／手がかりを守る・失う（lose）／死の危険（death：失敗するとどちらかが死ぬ）／
     死の回避（save：成功すると、次の村人の襲撃を一度だけかわせる）／救出（rescue：連れ去られた仲間を取り戻す）／
     関係（bond：好感度が大きく上下）／R18版だけの夜（r18）
   文は jashin-duo-data.js（全年齢版・R18版共通）と jashin-duo-r18.js（R18版のみ）。
   {a}{b}＝二人 {x}＝連れ去られた仲間 {v}＝死ぬ人 {w}＝生き残る人 {t}＝攻め {u}＝受け */
(function () {
  'use strict';
  var HK = window.HK, JS = HK.JASHIN, ST = HK.Story;
  if (!JS || !ST) return;
  function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }
  var RATE = 0.42;
  var TAG = { clue: '手がかり', lose: '手がかりの危機', death: '死線', save: '予感', rescue: '救出', bond: '二人', r18: '夜' };
  var SK = { obs: '観察', lore: '知識', talk: '聞き込み', spirit: '霊感', explore: '探索', fight: '腕っぷし', rite: '作法' };
  function jobL(id) { var j = JS.JOB && JS.JOB[id]; return j ? j.label : id; }
  function hostile(S, a, b) { return JS.REL.cat(S, a, b) === 'bad' || JS.REL.cat(S, b, a) === 'bad' || JS.REL.bond(S, a, b) < -0.15 || JS.REL.bond(S, b, a) < -0.15; }
  function free(p) { return JS.alive(p) && !p.bound && !p.mad; }
  function r18on(S) { return !!(JS.R18 && JS.R18.on(S)); }
  function rel(S, a, b, d, lab) { if (JS.DRAMA && JS.DRAMA.setRel) JS.DRAMA.setRel(S, a, b, d, lab); }
  function edge(S, a, b, lab, cls) { if (JS.DRAMA) JS.DRAMA.edge(S, a, b, lab, cls, a); }

  JS.DUO = {
    /* 到着のあと：そろっている組み合わせの出来事を、三回に一回くらいの割合で予定に入れる */
    setup: function (S) {
      var rng = S.rng, P = S.P, EV = JS.DUO_EV || [];
      S.duoQ = [];
      EV.forEach(function (e) {
        if (e.type === 'r18' && !r18on(S)) return;
        var cands = [];
        P.forEach(function (a) {
          if (a.job !== e.a) return;
          P.forEach(function (b) {
            if (b === a || b.job !== e.b) return;
            if ((e.mode === 'foe') !== hostile(S, a, b)) return;
            if (e.type === 'r18' && !(HK.Pos && HK.Pos.okSex(a, b))) return;
            cands.push([a, b]);
          });
        });
        if (!cands.length || rng() > RATE) return;
        var pr = cands[Math.floor(rng() * cands.length)];
        /* 早く脱出する回も多いので、序盤（2〜10時間）に置く */
        var at = Math.min(S.deadline - 2, 2 + 2 * Math.floor(rng() * 5));
        S.duoQ.push({ e: e, a: pr[0], b: pr[1], at: at, done: false });
      });
      S.duoQ.sort(function (x, y) { return x.at - y.at; });
    },
    /* 二時間ごと：予定の時刻を過ぎた出来事を一つずつ */
    tick: function (S, live, h) {
      var fired = 0;
      (S.duoQ || []).forEach(function (q) {
        if (q.done || h < q.at || fired >= 2) return;
        var e = q.e, a = q.a, b = q.b;
        if (!JS.alive(a) || !JS.alive(b)) { if (!a.alive || !b.alive || h > q.at + 12) q.done = true; return; }
        if (!free(a) || !free(b) || (e.mode === 'foe') !== hostile(S, a, b)) { if (h > q.at + 8) q.done = true; return; }
        var x = null;
        if (e.type === 'rescue') {
          /* 連れ去られた仲間がいればその人。いなければ、いま連れ去られかけている三人目（失敗すると本当に連れ去られる） */
          x = S.P.filter(function (p) { return p !== a && p !== b && p.alive && p.taken; })[0] || S.P.filter(function (p) { return p !== a && p !== b && JS.alive(p); })[0];
          if (!x) { if (h > q.at + 8) q.done = true; return; }
        }
        if (e.type === 'lose' && !S.found.length) { if (h > q.at + 16) q.done = true; return; }
        q.done = true; fired++;
        fire(S, q, x, h);
      });
    }
  };

  function fire(S, q, x, h) {
    var rng = S.rng, e = q.e, a = q.a, b = q.b, foe = e.mode === 'foe';
    var sa = JS.skill(a, e.s1), sb = JS.skill(b, e.s2), sum = sa + sb, roll = sum + (rng() - 0.5) * 0.5;
    var ok = roll >= (foe ? 1.1 : 1.0);
    if (JS.DUO.onFire) JS.DUO.onFire(e, ok);
    var m = { a: a.name, b: b.name, x: x ? x.name : '' };
    var t = ST.fmt(e.intro, m), why = jobL(a.job) + '×' + jobL(b.job) + (foe ? '（敵対している二人）' : '（協力できる二人）') + '／' + (ok ? '成功' : '失敗') + '：' + SK[e.s1] + '＋' + SK[e.s2] + 'の合計 ' + Math.round(sum * 100);
    var actors = x ? [a, b, x] : [a, b], mag = 22, key = '';
    var lab = foe ? (ok ? '好敵手' : '決裂') : (ok ? '信頼' : '決裂');
    switch (e.type) {
      case 'clue':
        if (ok) {
          var k = S.G.clues.map(function (c, i) { return i; }).filter(function (i) { return S.found.indexOf(i) < 0; })[0];
          var body = ST.fmt(e.ok, m);
          if (k != null) { S.found.push(k); a.cnt.clue++; t += body + S.G.clues[k].t + '。'; why += '／手がかり ' + S.found.length + '/' + S.G.clues.length; }
          else t += body.replace(/――$/, '');
          rel(S, a, b, foe ? 0.3 : 0.2, lab);
        } else { t += ST.fmt(e.ng, m); rel(S, a, b, -0.3, lab); }
        break;
      case 'lose':
        if (ok) { t += ST.fmt(e.ok, m); [a, b].forEach(function (p) { p.m.fear = clamp(p.m.fear - 8, 0, 100); }); rel(S, a, b, foe ? 0.35 : 0.25, lab); }
        else {
          t += ST.fmt(e.ng, m);
          if (!S.solved && S.found.length) { S.found.pop(); why += '／手がかりを一つ失った（' + S.found.length + '/' + S.G.clues.length + '）'; }
          rel(S, a, b, -0.35, lab);
        }
        break;
      case 'death':
        if (ok) { t += ST.fmt(e.ok, m); rel(S, a, b, foe ? 0.45 : 0.35, foe ? '死線を越えた' : '戦友'); mag = 30; [a, b].forEach(function (p) { p.m.fear = clamp(p.m.fear + 6, 0, 100); }); }
        else {
          /* 腕っぷしと運の弱いほうが命を落とす */
          var luck = function (p) { return JS.skill(p, 'fight') + p.stats.luck * 0.05 + rng() * 0.3; };
          var v = luck(a) < luck(b) ? a : b, w = v === a ? b : a;
          var txt = ST.fmt(e.ng, { a: a.name, b: b.name, v: v.name, w: w.name });
          w.m.fear = clamp(w.m.fear + 20, 0, 100);
          JS.core.die(S, v, jobL(a.job) + '×' + jobL(b.job) + 'の出来事（' + (foe ? '因縁' : '協力') + '・失敗）で', [txt], t);
          return;
        }
        break;
      case 'save':
        if (ok) { t += ST.fmt(e.ok, m); a.foresee = true; b.foresee = true; rel(S, a, b, foe ? 0.35 : 0.3, lab); why += '／二人とも、次の村人の襲撃を一度だけかわせる'; }
        else { t += ST.fmt(e.ng, m); [a, b].forEach(function (p) { p.m.hp = clamp(p.m.hp - 12, 0, 100); p.m.fear = clamp(p.m.fear + 12, 0, 100); }); rel(S, a, b, -0.25, lab); }
        break;
      case 'rescue':
        if (ok) {
          t += ST.fmt(e.ok, m); x.taken = false; x.m.fear = clamp(x.m.fear - 10, 0, 100);
          rel(S, a, b, foe ? 0.45 : 0.35, lab); rel(S, x, a, 0.25); rel(S, x, b, 0.25);
          edge(S, a, x, '救った', 'guard'); mag = 32; key = a.name + 'と' + b.name + 'が' + x.name + 'を救い出した';
        } else {
          t += ST.fmt(e.ng, m); [a, b].forEach(function (p) { p.m.fear = clamp(p.m.fear + 10, 0, 100); }); rel(S, a, b, -0.35, lab);
          if (!x.taken) { x.taken = true; x.takenAt = h; why += '／' + x.name + 'は村人に連れ去られた'; }
          key = x.name + 'が連れ去られた';
        }
        break;
      case 'bond':
        t += ST.fmt(ok ? e.ok : e.ng, m);
        rel(S, a, b, ok ? (foe ? 0.6 : 0.5) : -0.5, ok ? (foe ? '好敵手' : '固い絆') : '決裂');
        mag = 24;
        break;
      case 'r18':
        var Pz = HK.Pos, o = Pz.order(a, b, [a, b]);
        if (!Pz.okSex(a, b) || Pz.hardTop(o[1])) return;
        var mm = { a: a.name, b: b.name, t: o[0].name, u: o[1].name };
        /* 組ごとの文のあとに、協力／因縁ごとの空気・明け方・断られたあとを足して、一本道にしない（R18版の jashin-duo-r18.js） */
        var X = JS.DUO_R18X && JS.DUO_R18X[foe ? 'foe' : 'ally'];
        t = ST.fmt(e.intro, mm) + (X && S.rng() < 0.5 ? ST.fmt(ST.pick(S, X.intro), mm) : '') + ST.fmt(ok ? e.ok : e.ng, mm) + (X ? ST.fmt(ST.pick(S, ok ? X.after : X.ng), mm) : '');
        if (ok) { a.cnt.r18 = (a.cnt.r18 || 0) + 1; b.cnt.r18 = (b.cnt.r18 || 0) + 1; rel(S, a, b, foe ? 0.35 : 0.6, foe ? '歪んだ関係' : '一夜'); if (!foe) edge(S, a, b, '一夜', 'love'); }
        else rel(S, a, b, -0.5, '決裂');
        mag = 30; key = ok ? a.name + 'と' + b.name + 'の夜' : '';
        break;
    }
    var out = ST.say(S, { actors: actors, tag: (foe ? '因縁・' : '協力・') + TAG[e.type], text: t, why: why, mag: mag + (ok ? 6 : 0) });
    if (key && out) ST.key(S, out, key);
  }
})();
