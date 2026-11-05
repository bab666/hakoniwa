/* マッサージ（R18版のみ）：受け攻めから見た開始前の注意（solo-warn.js の HK.SoloWarn。2026-11-05 担当SW）
   本番の決まり（solo-massage.js の hardTop・topStop・doReverse、solo-massage-cast.js の C.cast）：
   ・施術者がモブ（1人のとき・2人ともカーテン越しの客のとき）：攻めの客（HK.Pos.hardTopNpc）も、ふつうの施術は受ける（触られる側）。
     際どくなったところで手を止めさせ、店を出るか、施術者を押し倒して攻める側に回る。挿入される場面は無い
   ・住人が施術者：向き（HK.Pos.order）で客が先に立つ組は上と同じ。施術者が攻めなら客は受ける側。攻めどうし（HK.Pos.okSex が偽）は普通のマッサージのまま */
/* @event-ok 開始前の注意（新しい出来事は無い） */
(function () {
  'use strict';
  var HK = window.HK;
  if (!HK || !HK.SoloWarn) return;
  var STOP = 'ふつうの施術は受けます（触られる側）。際どくなったところで施術者の手を止め、店を出るか、施術者を押し倒して攻める側に回ります（挿入はされません）';
  HK.SoloWarn.add('massage', function (input, T) {
    var P = HK.Pos;
    if (!P) return [];
    var C = T.C.slice(0, 2), out = [];
    var MC = HK.MassageCast, cast = C.length === 2 && MC && MC.cast ? MC.cast(input) : { mode: 'mob' };
    if (cast.mode !== 'res') {
      var tops = C.filter(T.top);
      if (tops.length) out.push({ level: 'warn', text: 'この箱庭では、攻めの住人（' + T.nm(tops) + '）も' + STOP });
      return out;
    }
    var a = C[0], b = C[1];
    if (!T.ok(a, b)) {
      if (T.hard(a, b) && T.hard(b, a)) out.push({ level: 'warn', text: T.nm(C) + 'は攻めどうしで体の関係にならないので、施術は最後まで普通のマッサージです' });
      return out;
    }
    /* 施術者を住人から選ぶとき：客が攻めの向きなら、施術者の手を止める */
    var tc = C.filter(function (c) { var o = c === a ? b : a; return T.hard(c, o); });
    tc.forEach(function (c) {
      var o = c === a ? b : a;
      if (cast.picked && cast.T && cast.T.i === c.i) return;   /* 攻めの人が施術者：客を攻める側で施術する（いつもの流れ） */
      out.push({ level: 'warn', text: c.name + '（攻め）が' + (cast.picked ? '客なので' : '客になったときは') + '、施術者の' + o.name + 'からふつうの施術は受けますが、際どくなったところで手を止め、店を出るか、' + o.name + 'を押し倒して攻める側に回ります（挿入はされません）' });
    });
    return out;
  });
})();
