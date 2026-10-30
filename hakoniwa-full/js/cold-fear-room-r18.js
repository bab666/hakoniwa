/* 箱庭シミュレーター（R18版のみ）: 出られない部屋の条件「エッチ」で、恐れられる側が、自分を恐れる相手に迫って条件を満たす（cf_room_r18。2026-10-30 担当FS）
   利用者の指示（2026-10-30）：「恐怖関係に対して、体の関係がもてないと表示されるが、体の関係自由で性欲があれば恋愛はオフでもエッチはできて欲しい。無理矢理迫られる形にはなるはず」
   ・入口：関係「恐怖」（{b} が {a} を恐れる）の二人が、条件「エッチ」の部屋にいる。判定は pos.js の HK.Pos.fearPairOK（内容のスイッチ「合意のない展開」が入・
     恐れられる側の性欲が「なし」でない・性行為の相手の固定・一途・R18に参加しない・恋愛対象（体の関係の相手）で止まらない・恐れられる側が攻め、恐れる側が受けに回れる）。
     恐怖がまだ続いている（cold-fear.js の HK.ColdFear.fearOn。憎悪・見下しなどに変わったら起きない）・迫る側も相手を恐れる／無関心な組・迫る側が相手を避けている組では起きない。
     「一人しか出られない」部屋・三人の場面でだけ数える部屋・「相手は一人だけ」と決めた人の相手以外では起きない
   ・形は必ず、恐れられる側（{a}＝攻め）が恐れる側（{b}＝受け）に無理やり迫る。恐れる側から誘う・乗り気になる場面にはしない（合意のない展開の印 P.FORCE_MARK を理由に書く）
   ・数え方：一回の場面で条件のエッチを一回数える（条件の回数が残っていれば、二区切り以上あけて、また迫る）。満たせば扉が開く（夜の関係にはしない：exitPair の night は偽）
   ・起きたあと：恋愛には進まない（noLove はそのまま。惹かれ・恋人・告白にならない）。恐れる側の緊張が上がり、信頼・好意が下がり、恐怖が深まる（HK.ColdFear の deep）
   ・文：cold-fear-r18.js の R.scene（部屋の始まり・事後 openRoom／afterRoom、受ける側の態度9種の一言・山場、性別の組ごとの最中、男性向けの最中と山場）。
     直前に「きっかけ」の段（R.leadRoom：扉の条件・相手の怯え／恐怖で体がすくみ、命じられると従う。二度目は二度目の理由）を別の記録で出す
   登場人物はすべて成人として扱う */
(function () {
  'use strict';
  var HK = window.HK, A = HK && HK.RoomAPI;
  if (!HK || HK.SAFE_ON || !A || !A.EV || !A.K || !HK.addTo) return;
  function hRule(ctx) { return ctx.rules.filter(function (q) { return q.k === 'h'; })[0] || null; }
  function mark() { return (HK.Pos && HK.Pos.FORCE_MARK) || '〔合意のない展開〕'; }
  /* a が恐れられる側で、b に迫れるか（恐怖がまだ続いている組だけ） */
  function okPair(ctx, a, b) {
    var P = HK.Pos, CF = HK.ColdFear;
    if (!P || !P.fearPairOK || !CF || !CF.pairOf) return false;
    var d = P.fearPairOK(ctx, a, b);
    if (!d || d[0] !== a) return false;
    var p = CF.pairOf(ctx, b, a);
    if (!p || !CF.fearOn(p) || CF.pairOf(ctx, a, b)) return false;
    if (HK.Avoid && HK.Avoid.of && HK.Avoid.of(ctx, a, b)) return false;
    return true;
  }
  HK.addTo(A.EV, {
    id: 'cf_room_r18', label: '出られない部屋で恐れる相手に条件のエッチを迫られる', tie: 'fear', tags: ['night', 'force'],
    cat: 'conflict', sex: true, force: true, scope: 'pair', pri: true, r18: true,
    when: function (ctx, a, b) {
      if (HK.SAFE_ON || ctx.flags.isOne || ctx.stepIndex < 1 || ctx.flags.trioCur || (A.trioOnly && A.trioOnly(ctx))) return false;
      if (a.out || b.out || a.flags.down || b.flags.down || a.flags.cagePair != null || b.flags.cagePair != null) return false;
      var r = hRule(ctx);
      if (!r || A.ruleDone(ctx, r, a, b)) return false;
      if (A.exclOther && (A.exclOther(ctx, a, b) || A.exclOther(ctx, b, a))) return false;
      var pf = ctx.pair(a, b);
      if (pf.cfRoomAt != null && ctx.stepIndex - pf.cfRoomAt < 2) return false;
      /* 迫る側に焦りか気性の荒さがあるか、時間が三割を過ぎた */
      if (!(a.stress > 30 || (a.tr.aggr || 0) > 0.6 || ctx.stepIndex / Math.max(1, ctx.stepsTotal) > 0.3)) return false;
      return okPair(ctx, a, b);
    },
    w: function (ctx, a, b) {
      var r = hRule(ctx), sw = r && A.seqWait && A.seqWait(ctx, r, a, b) ? 0.15 : 1;
      return (2.2 + (a.stress || 0) / 50 + (a.tr.aggr || 0) + 1.5 * ctx.stepIndex / Math.max(1, ctx.stepsTotal)) * sw;
    },
    run: function (ctx, a, b) {
      var T = a, H = b, R = HK.ColdFear.R18, CF = HK.ColdFear, r = hRule(ctx), pf = ctx.pair(T, H), p = A.prog(ctx, T, H);
      var n0 = pf.cfRoom || 0, cp = CF.pairOf(ctx, H, T);
      var counted = r ? A.bumpAct(ctx, r, T, H, 1) : true;
      pf.cfRoom = n0 + 1; pf.cfRoomAt = ctx.stepIndex; pf.forced = (pf.forced || 0) + 1;
      /* 恐怖が深まる（恋愛には進まない。夜の関係の印は付けない） */
      CF.raw(ctx, H, T, { ten: 24, trust: -22, aff: -18 }); ctx.stress(H, 22);
      ctx.mod(T, H, { ten: 4 });
      if (cp) { cp.deep = (cp.deep || 0) + 1; if (!cp.st || cp.st === 'eased') cp.st = 'deep'; CF.endNote(ctx, cp, 'deep'); CF.note(ctx, cp, 'force'); }
      var text = R.scene(ctx, T, H, 'fear', { room: true });
      ctx._cfLead = R.leadRoom(ctx, T, H, n0);
      var why = T.name + 'が、自分を恐れる' + H.name + 'に、扉の条件「エッチ」を満たすために迫った／' + mark() + '内容のスイッチ「合意のない展開」が入' +
        (HK.Pos && HK.Pos.noneWhy ? HK.Pos.noneWhy(ctx, [T, H], true) : '') + '／恐怖の変化：' + H.name + 'は怯えて逆らえず応じたが、' + T.name + 'への恐怖はいっそう深まった（恋愛にはならない）';
      if (!counted && A.waitNote) return { text: text + A.waitNote(ctx, r, T, H), why: why + '／条件の順番：条件1がまだなので数えない', mag: 30, lewd: true, sex: true, force: true };
      if (A.pairDone(ctx, T, H)) { var ex = A.exitPair(ctx, T, H, text, why, false); ex.lewd = true; ex.sex = true; ex.force = true; return ex; }
      return { text: text + (r && r.n > 1 ? '（エッチ ' + p.act.h + '/' + r.n + '）' : '') + '扉はまだ開かない。', why: why, mag: 30, lewd: true, sex: true, force: true };
    }
  });
})();
