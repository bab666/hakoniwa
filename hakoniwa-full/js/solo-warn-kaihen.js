/* 常識改変（R18版のみ）：受け攻めから見た開始前の注意（solo-warn.js の HK.SoloWarn。2026-11-05 担当SW）
   本番の決まり（solo-kaihen.js の役割・serve・okPair・canStage）：
   ・役割は住人の欄、おまかせなら理性的な人（A＋CP が高い順に半分）が施す側、残りが受ける側
   ・施す側が攻め（モブの客には HK.Pos.vsNpc）：客を抱く・攻める施術だけ（受け入れる施術・口で受け止める施術はしない）。モブの舞台にも連れていかれない
   ・受ける側（客の住人）は、住人の施す側に組める組（HK.Pos.okSex）のときだけ施術される。モブの施す側はいない。攻めの客は、自分が主導する施術だけ
   ・正気の人が攻めなら、無理やり施術台に乗せられない
   ・攻めどうしは組めない。モブの客がいない（モブなし・客の多さ 0）で組める住人の組が一つも無ければ、誰も施術できないので始めない */
/* @event-ok 開始前の注意（新しい出来事は無い） */
(function () {
  'use strict';
  var HK = window.HK;
  if (!HK || !HK.SoloWarn) return;
  function sum(c) { var e = c.eg || {}; return (+e.A || 0) + (+e.CP || 0); }
  HK.SoloWarn.add('kaihen', function (input, T) {
    var P = HK.Pos;
    if (!P) return [];
    var C = T.C, env = T.env, out = [];
    var tops = C.filter(T.top);
    if (!tops.length) return out;
    /* 役割（おまかせは A＋CP の高い順に半分が施す側。正気の人の設定は見ない目安） */
    var order = C.slice().sort(function (a, b) { return sum(b) - sum(a); }), nG = C.length === 1 ? 1 : Math.ceil(C.length / 2);
    var role = function (c) { var r = T.pick(c.i, 'role'); return r === 'giver' || r === 'taker' || r === 'out' ? r : order.indexOf(c) < nG ? 'giver' : 'taker'; };
    var noGuest = env.mob === 'off' || +env.npc <= 0;
    var anyPair = false;
    for (var i = 0; i < C.length; i++) for (var j = i + 1; j < C.length; j++) if (T.ok(C[i], C[j])) anyPair = true;
    if (noGuest && !anyPair) return [{ level: 'block', text: (C.length > 1 ? '攻めどうしなど、組める住人の組がなく、' : '') + 'モブの客もいないので、施術の相手がいません。場の設定でモブの客を出すか、受けかリバ、おまかせの住人を入れてください' }];
    var g = tops.filter(function (c) { return role(c) === 'giver'; }), t = tops.filter(function (c) { return role(c) === 'taker'; }), o = tops.filter(function (c) { return role(c) === 'out'; });
    if (g.length) out.push({ level: 'warn', text: '施す側の攻めの住人（' + T.nm(g) + '）は、客を抱く・攻める施術だけをします（受け入れる側にはなりません）' });
    if (t.length) {
      var lone = t.filter(function (c) { return !C.some(function (x) { return x !== c && role(x) === 'giver' && T.ok(x, c); }); });
      var ok2 = t.filter(function (c) { return lone.indexOf(c) < 0; });
      if (ok2.length) out.push({ level: 'warn', text: '受ける側の攻めの住人（' + T.nm(ok2) + '）は、施す側の住人に施術されても、自分が主導する側です' });
      if (lone.length) out.push({ level: 'warn', text: T.nm(lone) + '（攻め）は受ける側ですが、組める施す側の住人がいないので、施術されません（受ける側の住人は、住人の施す側だけが施術します）' });
    }
    if (o.length) out.push({ level: 'warn', text: '正気の攻めの住人（' + T.nm(o) + '）は、無理やり施術台に乗せられません' });
    if (C.length > 1 && !anyPair) out.push({ level: 'warn', text: '攻めどうしは組めないので、住人どうしの施術はありません（施す側はモブの客だけを相手にします）' });
    return out;
  });
})();
