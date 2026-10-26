/* 箱庭シミュレーター: 状況で変わる一人称（怒ったとき・恋人ができてから）（2026-10-26 順10・85。全年齢版・R18版共通）
   住人の設定 fpAngry（怒ったときの一人称）・fpLover（恋人になってからの一人称）。空欄なら変えない（欄・保存・書き出しは attr.js）。
   ■ 記録を作るとき（エンジン型の Ctx.say・物語型の HK.Story.say）に、この欄を持つ住人の、その時点の状態を記録に印として残す（e._fpx = { 番号: 'a' | 'l' }）
     ・怒り（'a'）：気分（emotion.js の HK.Emo）の怒りが強いとき。いちばん強い気分が怒り（35 以上）か、怒りが 50 以上。
       言い争い・戦い・裏切りの出来事（エンジン型の cat、物語型の札）に出ている人は、怒りが 20 以上で足りる（腹を立てたまま口論している場面）。
       気分を持たない箱庭（ソロの箱庭など）では変わらない
     ・恋人（'l'）：恋人・夫婦がいる間（エンジン型は HK.Poly.lovers、物語型は HK.Poly.storyLovers）。別れたり、恋人が亡くなったりしたら元に戻る
     ・両方なら怒りを優先する
   ■ voice.js の processResult が記録を整えるとき（V.fpSwap）、印のある住人の一人称（p.fp）を、その記録の間だけ差し替える。
     相手ごとの一人称（fpFor）が決まっている相手に話しかける台詞では、そちらが優先する（voice.js の processText が p.fp をさらに差し替えるため）。
     印は整えたあとで消す（保存には残さない） */
(function () {
  'use strict';
  var HK = window.HK, V = HK && HK.Voice;
  if (!HK || !V) return;
  function word(v) { return typeof v === 'string' ? v.replace(/[「」『』{}<>\s⁠-⁤]/g, '').slice(0, 8) : ''; }
  /* 怒りが強いか（HK.Emo の気分）。fight：言い争い・戦い・裏切りの出来事に、その人が出ているか（そのときは怒りが 20 以上で足りる） */
  function angry(c, fight) {
    var e = c && c.emo;
    if (!e || !HK.Emo) return false;
    return (e.anger || 0) >= 50 || HK.Emo.mood(c) === 'anger' || (fight && (e.anger || 0) >= 20);
  }
  var FIGHT_CAT = /^(?:conflict|combat|betray)$/, FIGHT_TAG = /喧嘩|ケンカ|口論|嫉妬|対立|裏切|襲|戦い|戦闘|処刑|告発|疑い|責め|詰め寄|罵/;
  function mark(e, chars, loversOf) {
    if (!e || e.skipped || typeof e.text !== 'string' || e.text.indexOf('「') < 0 || !chars) return;
    var x = null, fightEv = e.kind !== 'step' && (FIGHT_CAT.test(e.cat || '') || FIGHT_TAG.test(e.tag || ''));
    chars.forEach(function (c, k) {
      if (!c || c.alive === false || !(c.fpAngry || c.fpLover)) return;
      var i = c.i != null ? c.i : k, st = '';
      if (c.fpAngry && angry(c, fightEv && (e.actors || []).indexOf(i) >= 0)) st = 'a';
      else if (c.fpLover) { var L0 = []; try { L0 = loversOf(c) || []; } catch (err) { L0 = []; } if (L0.length) st = 'l'; }
      if (st) (x = x || {})[i] = st;
    });
    if (x) e._fpx = x;
  }
  /* エンジン型（emotion.js が気分を立てたあとの記録に付ける。emotion.js より後に読む） */
  if (HK.Ctx && HK.Ctx.prototype.say) {
    var say0 = HK.Ctx.prototype.say;
    HK.Ctx.prototype.say = function (o) {
      var e = say0.apply(this, arguments), ctx = this;
      try { mark(e, ctx.chars, function (c) { return HK.Poly && HK.Poly.lovers ? HK.Poly.lovers(ctx, c).filter(function (o2) { return o2.alive !== false; }) : []; }); } catch (err) { /* 印が付けられなくても記録は残す */ }
      return e;
    };
  }
  /* 物語型（邪神村・吹雪の館・宇宙船など） */
  if (HK.Story && HK.Story.say) {
    var ss0 = HK.Story.say;
    HK.Story.say = function (S, o) {
      var e = ss0.apply(this, arguments);
      try { if (S && S.P) mark(e, S.P, function (c) { return HK.Poly && HK.Poly.storyLovers ? HK.Poly.storyLovers(S, c) : []; }); } catch (err) { /* 同上 */ }
      return e;
    };
  }
  /* voice.js の processResult から：記録 e の印に合わせて、話し手の一人称を差し替える。戻すための関数を返す（差し替えがなければ null） */
  V.fpSwap = function (people, e) {
    var x = e && e._fpx;
    if (!x) return null;
    delete e._fpx;
    var saved = [];
    Object.keys(x).forEach(function (k) {
      var p = people[+k];
      if (!p) return;
      var w = x[k] === 'a' ? word(p.fpAngry) : x[k] === 'l' ? word(p.fpLover) : '';
      if (!w) return;
      saved.push([p, p.fp]);
      p.fp = w;
    });
    return saved.length ? function () { saved.forEach(function (s) { s[0].fp = s[1]; }); } : null;
  };
})();
