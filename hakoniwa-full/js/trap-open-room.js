/* 箱庭シミュレーター: 出られない部屋 ―― 閉じ込められた直後の初動の反応（2026-10-28 担当ME）
   共通の部品 HK.TrapOpen（trap-open.js。かたまり pack-trap）を、目覚めの区切り（scen.phase の s === 0）の最後に差す。
   扉の紙の文（scenario-room.js）・お題の様子（room-games.js）・三人の但し書き（room-trio.js）のあと、住人が動く前（関係の小場面の [序盤] より前）に1段だけ。
   scenario-room.js は直接書き換えず、HK.wrap で包む（このファイルは箱庭のかたまり scen-whiteroom の、room-games.js・room-trio.js より後ろ）。
   関係の値は ctx.mod で小さく動かす（型ごとに動く／動かない。理由の欄に「初動の反応：〇〇（系統）」と動いた値）。信頼する相手に安心したときは焦りも少し下げる。
   記録：ctx.flags.trapOpen に [{ sys, key, a, b, moved }]（点検・計測用）。全年齢版にも同じファイルを置く */
/* 出来事の一覧の印（hakoniwa-tools/build/event-catalog.js が数える。決まりは docs/reports/2026-10-28/event-catalog.md） */
/* @event scen=whiteroom id=to_room_pal cat=bond tie=friend,best,buddy,childhood,colleague,classmate,comrade,acq label=閉じ込められた直後：友人と協力を誓い合う */
/* @event scen=whiteroom id=to_room_love cat=bond tie=lover,mate,fated,spouse,fiance,almost,fwb label=閉じ込められた直後：恋人と互いを支える */
/* @event scen=whiteroom id=to_room_ex cat=bond tie=ex label=閉じ込められた直後：元恋人と気まずくなる */
/* @event scen=whiteroom id=to_room_crush cat=bond tie=crush,honmei,fond label=閉じ込められた直後：片想いの相手に動揺する */
/* @event scen=whiteroom id=to_room_host cat=conflict tie=bad,enemy,sibbad label=閉じ込められた直後：不仲の相手に苛立つ */
/* @event scen=whiteroom id=to_room_rival cat=bond tie=rival label=閉じ込められた直後：ライバルと脱出を競う */
/* @event scen=whiteroom id=to_room_rank cat=bond tie=senpai,mentor,teacher,boss,benefactor label=閉じ込められた直後：目上の人と一緒で緊張する */
/* @event scen=whiteroom id=to_room_master cat=bond tie=master,abuse label=閉じ込められた直後：従う側が主の指示を待つ */
/* @event scen=whiteroom id=to_room_kin cat=bond tie=parent,pparent,sibling,sibprot,sibclose,stepsib,relative label=閉じ込められた直後：家族と気安く声をかけ合う */
/* @event scen=whiteroom id=to_room_avoid cat=conflict tie=fear,apathy,bad,enemy,crush,yan,abuse label=閉じ込められた直後：苦手な相手と一緒で憂鬱になる */
/* @event scen=whiteroom id=to_room_obsess cat=bond tie=yan,worship,blind label=閉じ込められた直後：想う相手をじっと見つめる */
/* @event scen=whiteroom id=to_room_emo cat=bond tie=- label=閉じ込められた直後：相手への気持ちで動揺・安心する */
/* @event scen=whiteroom id=to_room_per cat=bond tie=- label=閉じ込められた直後：性格どうしで仕切る・怯える */
/* @event scen=whiteroom id=to_room_rnd cat=bond tie=- label=閉じ込められた直後：握手を求める・扉を叩く */
(function () {
  'use strict';
  var HK = window.HK, scen = HK.SCENARIOS && HK.SCENARIOS.whiteroom;
  if (!scen || !HK.wrap) return;
  function free(c) { return HK.State && HK.State.canAct ? HK.State.canAct(c) : !!c && c.alive !== false && !c.out; }
  function run(ctx) {
    var T = HK.TrapOpen;
    if (!T || ctx.flags.trapOpen) return;
    ctx.flags.trapOpen = [];
    var P = ctx.present().filter(free);
    if (P.length < 2) return;
    var X = T.mk(ctx, 'room', P, { seed: ctx.seed, all: ctx.chars });
    /* ctx.mod は出来事の中（act2）で使う作り（_touched・_mag）。区切りの頭で使うので、ここだけ空の入れ物を貸して、あとで戻す */
    var t0 = ctx._touched, m0 = ctx._mag;
    ctx._touched = {}; ctx._mag = 0;
    T.make(X).forEach(function (e) {
      var note = '';
      if (e.eff) {
        if (e.eff.ab) ctx.mod(e.a, e.b, e.eff.ab);
        if (e.eff.ba) ctx.mod(e.b, e.a, e.eff.ba);
        note = T.effNote(e.a, e.b, e.eff);
      }
      if (e.calmA) { ctx.stress(e.a, -5); note = (note ? note + '・' : '') + e.a.name + 'の焦り -5'; }
      ctx.say({ kind: 'event', cat: e.cat || 'bond', actors: e.actors, text: e.text, why: T.whyOf(e, note), mag: 8 });
      ctx.flags.trapOpen.push({ sys: e.sys, key: e.key, a: e.a.i, b: e.b ? e.b.i : null, moved: !!e.eff });
    });
    ctx._touched = t0; ctx._mag = m0;
    T.lastRun = ctx.flags.trapOpen;
  }
  HK.wrap(scen, 'phase', function (ph0) {
    return function (ctx, s, n) {
      var r = ph0 ? ph0.apply(this, arguments) : undefined;
      if (s === 0) run(ctx);
      return r;
    };
  });
})();
