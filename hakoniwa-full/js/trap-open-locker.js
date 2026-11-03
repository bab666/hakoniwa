/* 箱庭シミュレーター: 媚薬ロッカー ―― 閉じ込められた直後の初動の反応（2026-10-28 担当ME）
   共通の部品 HK.TrapOpen（trap-open.js。かたまり pack-trap）を、ロッカーに閉じ込められた直後に差す。solo-locker.js・locker-crowd.js は書き換えず、HK.Story を包む：
   ・二人のロッカー：「閉じ込められた」の区切りで、スピーカーの声（kind:'phase'）を書いた直後（関係ごとの反応 locker-ties.js の NT.wake・自分から閉じ込められた人の思惑より前）
   ・三人以上（倉庫のロッカー）：ロッカー割りの文のあと、最初のメーターの記録（HK.Story.snap）の直前。同じロッカーの組だけを選ぶ
   ・一人のときは出さない
   ・NT.wake が関係の反応を書く組（同僚・同級生・上司と部下・信仰・恩人・親族）には、関係の系統を使わない（同じ内容を二度言わない）
   ・手錠の人は、手を使う型（握手・拳を合わせる・壁を叩く 等）の動く側にしない
   関係の値を持たない物語型なので、値の動きをメーターに小さく写す：安心・噛み合う（信頼・好意の増）→理性 +2／苛立ち・嫌悪（緊張の増・好意の減）→理性 -2／惹かれ→発情（全年齢は火照り）+3。
   R18版だけ、ときどきガスの気配に身構える一文を足す（R18に参加しない人には使わない。描写「ぼかす」のときは足さない）。
   種：HK.Story.state を包んで S.toSeed に覚える（箱庭の乱数 S.rng は使わない）。記録：S.flags.trapOpen。全年齢版にも同じファイルを置く */
/* 出来事の一覧の印（hakoniwa-tools/build/event-catalog.js が数える。決まりは docs/reports/2026-10-28/event-catalog.md） */
/* @event scen=locker id=to_lk_pal cat=bond tie=friend,best,buddy,childhood,comrade,acq label=閉じ込められた直後：友人と協力を誓い合う */
/* @event scen=locker id=to_lk_love cat=bond tie=lover,mate,fated,spouse,fiance,almost,fwb label=閉じ込められた直後：恋人と互いを支える */
/* @event scen=locker id=to_lk_ex cat=bond tie=ex label=閉じ込められた直後：元恋人と気まずくなる */
/* @event scen=locker id=to_lk_crush cat=bond tie=crush,honmei,fond label=閉じ込められた直後：片想いの相手に動揺する */
/* @event scen=locker id=to_lk_host cat=conflict tie=bad,enemy,sibbad label=閉じ込められた直後：不仲の相手に苛立つ */
/* @event scen=locker id=to_lk_rival cat=bond tie=rival label=閉じ込められた直後：ライバルと脱出を競う */
/* @event scen=locker id=to_lk_rank cat=bond tie=senpai,mentor,teacher label=閉じ込められた直後：目上の人と一緒で緊張する */
/* @event scen=locker id=to_lk_master cat=bond tie=master,abuse label=閉じ込められた直後：従う側が主の指示を待つ */
/* @event scen=locker id=to_lk_kin cat=bond tie=parent,pparent,sibling,sibprot,sibclose,twin,stepsib label=閉じ込められた直後：家族と気安く声をかけ合う */
/* @event scen=locker id=to_lk_avoid cat=conflict tie=fear,apathy,bad,enemy,crush,yan,abuse label=閉じ込められた直後：苦手な相手と一緒で憂鬱になる */
/* @event scen=locker id=to_lk_obsess cat=bond tie=yan,blind label=閉じ込められた直後：想う相手をじっと見つめる */
/* @event scen=locker id=to_lk_emo cat=bond tie=- label=閉じ込められた直後：相手への気持ちで動揺・安心する */
/* @event scen=locker id=to_lk_per cat=bond tie=- label=閉じ込められた直後：性格どうしで仕切る・怯える */
/* @event scen=locker id=to_lk_rnd cat=bond tie=- label=閉じ込められた直後：握手を求める・扉を叩く */
(function () {
  'use strict';
  var HK = window.HK, ST = HK.Story;
  if (!ST || !HK.wrap) return;
  /* locker-ties.js（LK.TIES）が閉じ込められたときの反応を書く関係 */
  var NTT = { colleague: 1, classmate: 1, boss: 1, worship: 1, benefactor: 1, relative: 1 };
  var W_HEAT = '火照り';
  /* r18:begin */
  W_HEAT = '発情';
  /* r18:end */
  function isLk(S) { return !!(S && S.scen && S.scen.id === 'locker' && S.P && S.flags); }
  function clamp(v) { return v < 0 ? 0 : v > 100 ? 100 : v; }
  function here(p) { return !HK.State || !HK.State.here || HK.State.here(p); }
  /* 関係の値の動き → メーター */
  function meter(p, d, out) {
    if (!d || !p || !p.m) return;
    var r = 0, h = 0;
    if ((d.trust || 0) > 0 || (d.aff || 0) > 0) r += 2;
    if ((d.ten || 0) > 0 || (d.aff || 0) < 0) r -= 2;
    if ((d.att || 0) > 0) h += 3;
    if (r) { p.m.reason = clamp(p.m.reason + r); out.push(p.name + 'の理性 ' + (r > 0 ? '+' : '') + r); }
    if (h) { p.m.heat = clamp(p.m.heat + h); out.push(p.name + 'の' + (p.noR18 || HK.SAFE_ON ? '火照り' : W_HEAT) + ' +' + h); }
  }
  function run(S) {
    var T = HK.TrapOpen;
    if (!T || S.flags.trapOpen) return;
    S.flags.trapOpen = [];
    var P = S.P.filter(here);
    if (P.length < 2) return;
    var groups = null, skipT = null;
    if (S.P.length === 2) skipT = NTT;
    else {
      /* 倉庫のロッカー（locker-crowd.js が p.L に入れたロッカー）：二人以上のロッカーだけ */
      groups = [];
      P.forEach(function (p) { if (p.L && p.L.m && p.L.m.length >= 2 && groups.indexOf(p.L.m) < 0) groups.push(p.L.m); });
      groups = groups.map(function (g) { return g.filter(here); }).filter(function (g) { return g.length >= 2; });
    }
    var plotter = S.P.length === 2 ? P.filter(function (p) { return /^自分から/.test(p.roleLabel || ''); })[0] || null : null;
    var X = T.mk(S, 'locker', P, { seed: S.toSeed, all: S.P, groups: groups, skipT: skipT, plotter: plotter, hands: function (p) { return !p.bound; } });
    var es = T.make(X), lew = S.env && S.env.lewd;
    es.forEach(function (e, i) {
      var out = [];
      if (e.eff) { meter(e.a, e.eff.ab, out); meter(e.b, e.eff.ba, out); }
      var note = e.eff ? T.effNote(e.a, e.b, e.eff) : '';
      if (out.length) note = (note ? note + '（' : '') + out.join('・') + (note ? '）' : '');
      var text = e.text;
      /* R18版：二人のロッカーの最後の段に、ガスの気配に身構える一文（R18に参加しない人・ぼかすときは足さない） */
      if (i === es.length - 1 && e.sys !== 'group' && T.GAS && !HK.SAFE_ON && lew !== 'low' && X.rng() < 0.35) {
        var who = [e.a, e.b].filter(function (c) { return c && !c.noR18; });
        if (who.length) text += T.pickGas(X, who[X.rng.int(who.length)]);
      }
      ST.say(S, { actors: e.actors, tag: '初動の反応', text: text, why: T.whyOf(e, note), mag: 8 });
      S.flags.trapOpen.push({ sys: e.sys, key: e.key, a: e.a.i, b: e.b ? e.b.i : null, moved: !!e.eff });
    });
    T.lastRun = S.flags.trapOpen;
  }
  /* 種を覚える（媚薬ロッカーだけ） */
  HK.wrap(ST, 'state', function (st0) {
    return function (input, scenId) {
      var S = st0.apply(this, arguments);
      if (S && scenId === 'locker') S.toSeed = input && input.seed;
      return S;
    };
  });
  /* 二人：スピーカーの声を書いた直後 */
  HK.wrap(ST, 'say', function (say0) {
    return function (S, o) {
      var e = say0.apply(this, arguments);
      if (o && o.kind === 'phase' && isLk(S) && S.P.length === 2 && S.label === '閉じ込められた' && !S.flags.trapOpen) run(S);
      return e;
    };
  });
  /* 三人以上：ロッカー割りのあと、最初のメーターの記録の直前 */
  HK.wrap(ST, 'snap', function (snap0) {
    return function (S) {
      if (isLk(S) && S.P.length >= 3 && !(S.hist && S.hist.length) && !S.flags.trapOpen) run(S);
      return snap0.apply(this, arguments);
    };
  });
})();
