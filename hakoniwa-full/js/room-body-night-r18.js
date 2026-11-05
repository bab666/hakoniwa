/* 箱庭シミュレーター（R18版のみ）: 出られない部屋の「体の相手と過ごす夜」（2026-11-05 利用者の指示）
   ■ 決まり（docs/reports/2026-10-31/rel-consistency.md の「恋愛と夜の可否は住人の設定で」）
     ・住人の設定「性行為の相手の固定」で互いを（どちらかが相手を）体の相手に選んだ二人（engine.js の HK.bodyPick。free-sex.js の kind 'body'）は、
       恋人でなくても（恋愛にしない相手でも）、夜の起こりやすさ（pos.js の HK.Pos.night・nightK）に応じて体だけの夜を過ごす。100 なら必ず一度は起きる。
     ・「R18にしない相手」・R18に参加しない・受け攻めと恋愛対象が合わない組（HK.bodyOK が偽）は起きない。条件にエッチがある部屋は、部屋の条件の夜（scenario-room.js）に任せる。
     ・場面の文は HK.TieOrder.sexBody（長い場面）。直前のきっかけの段は HK.SexLead が sexBody を包んで差す（「体だけ・関係はそのまま」の一文は sex-lead-r18.js の T.BODY）。
       導入は HK.FreeSex.lead（LEAD_BODY：態度 9 種）。事後は下の AFTER（関係は変わらない。3 文以上）。恋人にはしない（HK.FreeSex.mark）。登場人物はすべて成人として扱う */
/* @event scen=whiteroom id=rb_body_night cat=romance tie=- tags=night cond=住人の設定で体の相手に選んだ二人 label=体の相手と関係はそのままで過ごす夜 */
(function () {
  'use strict';
  var HK = window.HK, scen = HK && HK.SCENARIOS && HK.SCENARIOS.whiteroom;
  if (!HK || !scen || !HK.addTo) return;
  function L(s) { return s.split('|'); }
  function fl(s, a, b) { return String(s || '').replace(/\{a\}/g, a.name).replace(/\{b\}/g, b.name); }
  function free(c) { return !!c && (HK.State ? HK.State.canAct(c) : c.alive !== false) && !c.out && !(c.flags && (c.flags.caged != null || c.flags.cagePair != null || c.flags.down)); }
  var IN = L('照明が一段落ちて、白い部屋に夜が来た。扉は今夜も開かなかった。二人は、言葉少なに同じ毛布の端を引き寄せた。|' +
    '部屋の隅の簡易ベッドは、二人で横になるには狭かった。どちらも、場所を譲ろうとはしなかった。白い壁だけが、二人を見ていた。|' +
    '扉の紙の条件は、まだ満たされていなかった。今夜のことは、条件とは関係がない。それを分かったうえで、二人は灯りの落ちた部屋で向き合った。');
  var AFTER = L('朝が来ても、二人の関係は何も変わっていなかった。{a}はいつもどおりの顔で、{b}に声をかけた。{b}も、いつもどおりに返した。|' +
    '{a}と{b}は、背中合わせで身支度を整えた。昨夜のことを、どちらも口にしなかった。それでいいのだと、二人とも分かっていた。|' +
    '扉はまだ開かないまま、白い部屋に朝の明るさが戻った。{a}と{b}は、昨日までと同じ距離で座り直した。体の距離だけが、少しだけ近いままだった。');
  var FADE = L('――その先のことは、白い部屋だけが知っている。|――灯りが落ちた。二人の息づかいだけが、夜明けまで続いた。');
  function ruleH(ctx) { return (ctx.rules || []).some(function (r) { return r && r.k === 'h'; }); }
  function ok(ctx, a, b) {
    if (!b || HK.SAFE_ON || !ctx.env || !ctx.rules || ruleH(ctx)) return false;
    if (ctx.flags.isOne || ctx.flags.trioCur || !free(a) || !free(b) || (ctx.stepIndex || 0) < 1) return false;
    if (!HK.FreeSex || HK.FreeSex.kind(ctx, a, b) !== 'body' || !HK.State.freeSex(ctx, a, b)) return false;
    var pf = ctx.pair(a, b);
    return pf.rbAt !== ctx.stepIndex && (pf.rbN || 0) < 2;
  }
  var EV = {
    id: 'rb_body_night', label: '体の相手と関係はそのままで過ごす夜', cat: 'romance', sex: true, free: true, r18: true, scope: 'pair', tie: '-', tags: ['night'],
    when: function (ctx, a, b) { return ok(ctx, a, b); },
    /* 夜の起こりやすさ 100 で、まだ夜を過ごしていない二人は、ほかの出来事より先に選ぶ（engine.js の act が nightK・性欲・理性を掛ける） */
    w: function (ctx, a, b) {
      var pf = ctx.pair(a, b), nv = HK.Pos && HK.Pos.night ? HK.Pos.night(ctx) : 50;
      if (nv >= 100 && !pf.rbN) return 400;
      var d = HK.Pos && HK.Pos.sexDrive ? HK.Pos.sexDrive(ctx, a, b) : 0.3;
      return (0.4 + d * 2.2) * (pf.rbN ? 0.4 : 1);
    },
    run: function (ctx, a, b) {
      var od = HK.Pos ? HK.Pos.order(a, b, [a, b]) : [a, b], top = od[0], bot = od[1], TO = HK.TieOrder;
      var pf = ctx.pair(a, b);
      pf.rbAt = ctx.stepIndex; pf.rbN = (pf.rbN || 0) + 1;
      var open = ctx.pick(IN) + HK.FreeSex.lead(ctx, top, bot), after = fl(ctx.pick(AFTER), top, bot);
      var text = TO && TO.sexBody ? TO.sexBody(ctx, top, bot, open, after, { rel: '', place: 'room', fade: ctx.pick(FADE) }) : fl(open + after, top, bot);
      HK.FreeSex.mark(ctx, a, b);
      ctx.stress(a, -4); ctx.stress(b, -4);
      return { cat: 'romance', sex: true, free: true, text: text, why: HK.FreeSex.why(top, bot) + '／' + top.name + 'が攻め', mag: 24 };
    }
  };
  HK.addTo(scen.events, [EV]);
})();
