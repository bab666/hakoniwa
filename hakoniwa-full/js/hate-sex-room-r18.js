/* 箱庭シミュレーター（R18版のみ）: 出られない部屋で、条件「エッチ」の部屋に閉じ込められた敵対する二人（hate_sex）
   2026-10-27（分割読み込みの第3段）：hate-sex-r18.js（中核。HK.HateSex の部品と文）から、出られない部屋に足す出来事だけを分けた（箱庭のかたまり scen-whiteroom。hate-sex-r18.js のすぐ後に読む）。
   登場人物はすべて成人として扱う */
(function () {
  'use strict';
  var HK = window.HK, HS = HK.HateSex;
  if (!HS) return;
  function hateLv(x, a, b) { var H = HK.HateKit; return H && H.level ? H.level(x, a, b) : 0; }
  /* 愛憎を持つ人の相手を、ほかの誰かに取られそうか（2026-10-28 担当LG：利用者の要望「愛憎は、誰かに取られると思ったら自分が手に入れたいと思う気持ちもある」）：
     a か b が愛憎を持ち、その相手に、部屋にいるほかの住人が片想い・本命・恋人・セフレ・夜を過ごした・強く惹かれている（45 以上）。真なら持つ人の名前 */
  function rivalOf(ctx, a, b) {
    var LH = HK.LoveHate, T = HK.Ties;
    if (!LH || !LH.has) return null;
    var hit = null;
    [[a, b], [b, a]].some(function (p) {
      var h = p[0], o = p[1];
      if (!LH.has(ctx, h, o)) return false;
      var z = ctx.present().filter(function (q) { return q !== h && q !== o && ((T && T.from && (T.from(ctx, q, o, 'crush') || T.from(ctx, q, o, 'honmei'))) || (T && T.has && (T.has(ctx, q, o, 'lover') || T.has(ctx, q, o, 'fwb'))) || ctx.pair(q, o).night || ctx.R(q, o).att >= 45); })[0];
      if (z) hit = { h: h, o: o, z: z };
      return !!z;
    });
    return hit;
  }
  HK.HateSex.rivalOf = rivalOf;
  /* ---------- 出られない部屋：条件「エッチ」の部屋で、敵対する二人が ---------- */
  var A = HK.RoomAPI;
  if (A && A.EV && A.K) {
    HK.addTo(A.EV, {
      /* 選ばれやすさは敵対の重み（conflict）で決める（恋愛の重みは、敵対の関係ではほとんど0になるため）。記録には恋愛（romance）として残す */
      id: 'hate_sex', cat: 'conflict', sex: true, force: true, scope: 'pair', pri: true, r18: true,
      when: function (ctx, a, b) {
        if (HK.SAFE_ON || ctx.flags.isOne || ctx.stepIndex < 1 || ctx.flags.trioCur) return false;
        if (a.out || b.out || a.flags.down || b.flags.down || a.flags.cagePair != null || b.flags.cagePair != null) return false;
        var pf = ctx.pair(a, b);
        /* 愛憎の組（hate-love.js）：条件のエッチを済ませたあとでも、部屋にいるあいだはまた起きうる（腐れ縁の二度目） */
        var lhP = HK.LoveHate && HK.LoveHate.any(ctx, a, b) && (pf.hateSex || 0) >= 1 && (pf.hateSex || 0) < 3;   /* 繰り返しすぎないよう、部屋の中では三回まで */
        if (!ctx.rules.some(function (r) { return r.k === 'h' && (lhP || !A.ruleDone(ctx, r, a, b)); })) return false;
        if (pf.hateSexAt != null && ctx.stepIndex - pf.hateSexAt < (lhP ? 3 : 2)) return false;
        if (A.tieWall && A.tieWall(ctx, a, b, 3) >= 999) return false;
        /* 条件のエッチがまだなら部屋の仕掛け（内容のスイッチ「合意のない展開」に関わらず起きる）。済ませたあとの腐れ縁の二度目はスイッチに従う */
        var condLeft = ctx.rules.some(function (r) { return r.k === 'h' && !A.ruleDone(ctx, r, a, b); });
        if (HS.order(ctx, a, b)[0] !== a || !HS.hostile(ctx, a, b, { room: condLeft }) || HS.taken(ctx, a, b)) return false;
        return true;
      },
      w: function (ctx, a, b) {
        /* 条件の順番：条件1を待っている条件2のエッチは起きにくく（×0.15） */
        var rh = ctx.rules.filter(function (q) { return q.k === 'h'; })[0], sw = rh && A.seqWait && A.seqWait(ctx, rh, a, b) ? 0.15 : 1;
        /* 愛憎の相手を取られそうなら、起きやすく（×1.6） */
        return (1.2 + (hateLv(ctx, a, b) + hateLv(ctx, b, a)) / 120 + (a.tr.aggr || 0) + (a.flags.aphro || 0) * 0.3 + ctx.stepIndex / Math.max(1, ctx.stepsTotal)) * (HK.LoveHate ? HK.LoveHate.k(ctx, a, b) : 1) * (rivalOf(ctx, a, b) ? 1.6 : 1) * sw;
      },
      run: function (ctx, a, b) {
        var pf = ctx.pair(a, b), p = A.prog(ctx, a, b), r = ctx.rules.filter(function (q) { return q.k === 'h'; })[0], done0 = !!(r && A.ruleDone(ctx, r, a, b));
        /* 条件の順番（順77）：条件1を待っている条件2のエッチは数えない（A.bumpAct が偽を返す。そのときは「まだ数えない」の一文を足す） */
        var counted = r ? (A.bumpAct ? A.bumpAct(ctx, r, a, b, 1) : (p.act.h = Math.min(r.n, (p.act.h || 0) + 1), true)) : true;
        pf.night = true; pf.nights = (pf.nights || 0) + 1; pf.hateSex = (pf.hateSex || 0) + 1; pf.hateSexAt = ctx.stepIndex;
        ctx.mod2(a, b, { att: 10, aff: 4, ten: -4 }, { att: 12, aff: 5, ten: -6 });
        var rv = rivalOf(ctx, a, b);
        var text = HS.scene(ctx, a, b, { room: !done0 }), why = HS.why(ctx, a, b, { room: !done0 }) + (done0 ? '／条件はもう満たしていたのに、また（腐れ縁）' : '／条件のエッチ') + HS.shieldWhy(HS.lastShield) +
          (rv ? '／愛憎：' + rv.h.name + 'は、' + rv.o.name + 'を' + rv.z.name + 'に取られそうで焦った' : '');
        if (!counted && A.waitNote) return { cat: 'romance', text: text + A.waitNote(ctx, r, a, b), why: why + '／条件の順番：条件1がまだなので数えない', mag: 30 };
        if (A.pairDone(ctx, a, b)) { var ex = A.exitPair(ctx, a, b, text, why, true); ex.cat = 'romance'; return ex; }
        return { cat: 'romance', text: text + (r && r.n > 1 && !done0 ? '（エッチ ' + p.act.h + '/' + r.n + '）' : '') + '扉はまだ開かない。', why: why, mag: 30 };
      }
    });
  }
})();
