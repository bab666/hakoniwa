/* 箱庭シミュレーター（R18版のみ）― 愛憎の「衝動で手を出す」（2026-10-29 担当A。設計 2-3 の最後の行：起こす側の性欲が高いと、突き放したあと・複雑のあとに続く）
   ■ 出来事 tie_lh_urge：hate-love-more.js の tie_lh_regret（突き放したあとの戸惑い）・tie_lh_mixed（相手が喜ぶのを見て複雑）のあと（組の印 pf.lhUrge）、
     次の区切りから三つ先までに、愛憎を持つ側（{a}）が衝動のまま相手に手を伸ばし、合意の夜になる。
     起きる条件：起こす側の性欲が強い（HK.Pos.libOf が high）か、性欲＋衝動の目安（HK.Pos.sexDrive）が 0.4 以上（性欲「なし」は起きない：engine の libMul）／
       HK.LoveHate.sexOk（恋愛対象を両方向・受け攻め HK.Pos.okSex・縛り・R18に参加・家族の恋愛：なし）・tie-warm-r18.js の HK.TieWarmR18.ok（描写の設定・クラスメイト除く・
       その場にいる・恋愛やR18にしない相手・性行為の相手の固定）・避けている（HK.Avoid）でない・相手の側にも下地（相手も愛憎・惹かれ 30 以上・夜を過ごした仲・恋人・性欲が強い）。
     文：導入（性別の組 mf／ff／fm × 持つ側が攻めか受けか。3 文以上）→ 最中・山場（thick-sex.js の HK.ThickSex／thick-sex-ero.js の HK.ThickEro。態度9種の喘ぎ・
       男性向けの作風はそちらの部品）→ 受けの事後（hate-love-r18.js の AFTER：受けの態度9種。嫌悪と執着が混ざる）→ 結び（TAIL）。攻め／受けは HK.Pos.order
   ■ きっかけの段（CLAUDE.md の決まり）：場面の記録の直前に、なぜ手を出したか（表の顔の一文・突き放したあと／複雑のあとの衝動・相手が拒まなかった理由。3 文）を別の記録で出す。
     出られない部屋では HK.SexLead（sex-lead-r18.js の EVR.tie_lh_urge → 下の R.urgeLead）が先に足すので、ここでは足さない
   全年齢版にはこのファイルはない。台詞は3本「くだけた常体｜硬い常体｜敬語」。登場人物はすべて成人として扱う */
(function () {
  'use strict';
  var HK = window.HK, LH = HK && HK.LoveHate;
  if (!LH || !HK.COMMON || !LH.R18) return;
  var R = LH.R18;
  function L(s) { return s.split('|'); }
  var PS = ['proud', 'stern', 'tsun', 'gentle', 'devoted', 'cool', 'free', 'shy', 'polite'];
  function ps(c) { var p = HK.personaOf ? HK.personaOf(c) : c.persona; return PS.indexOf(p) >= 0 ? p : 'gentle'; }
  function fill(t, m) { return String(t).replace(/\{(a|b|h|p)\}/g, function (s, k) { var v = m[k]; return v == null ? s : typeof v === 'string' ? v : v.name; }); }
  function pk(ctx, arr) { return HK.Ero && HK.Ero.fresh && ctx.rng && ctx.rng.int ? HK.Ero.fresh(ctx, arr, function (l) { return ctx.pick(l); }) : ctx.pick(arr); }
  function modeOf(A, B) { var P = HK.Pos; if (!P || !P.isF) return 'mf'; if (P.ff && P.ff(A, B)) return 'ff'; return P.isF(A, B) && !P.isF(B, A) ? 'fm' : 'mf'; }
  function order(a, b) { return HK.Pos && HK.Pos.order ? HK.Pos.order(a, b, [a, b]) : [a, b]; }

  /* ---------- 導入（{a}＝攻め、{b}＝受け。top：愛憎を持つ側が攻め／bot：持つ側が受け） ---------- */
  var OPEN = {
    mf: {
      top: L('{a}は、何か言いかけた{b}の手首を掴んで引き寄せた。言葉で片をつけるのは、もう諦めていた。{b}が目を見開いたまま動けずにいるうちに、{a}はその唇を塞いだ。|{a}は、{b}を壁際へ追いやり、逃げ道を腕で塞いだ。睨み返してくる{b}の目が、かえって{a}を煽った。{a}は{b}の首筋に顔を埋め、服の上から腰の線をなぞった。|{a}は、黙って{b}の肩を抱き寄せた。嫌いだと何度も言った相手だった。{b}の体温が伝わったとたん、{a}の中で何かがほどけ、乱暴なほどの口づけになった。'),
      bot: L('{a}は、{b}の襟を掴んで引き寄せ、自分から唇を押しつけた。突き放したのと同じ手だった。{b}が驚いて息を呑むと、{a}は挑むように{b}の胸に体を預けた。|{a}は、{b}の膝の上に断りもなく腰を下ろした。何か言われる前に、{b}の首に腕を回した。逃げられないのは自分のほうだと、{a}は分かっていた。|{a}は、{b}の手を取って、自分の頬に押し当てた。嫌いだと言ったその口で、{b}の名前を呼んだ。{b}の手に力がこもるのを、{a}は目を閉じて待った。')
    },
    ff: {
      top: L('{a}は、{b}の頬を両手で挟んで引き寄せた。言い合いの続きを言わせる気はなかった。柔らかな唇を塞ぐと、{b}の抗議は甘い吐息に変わった。|{a}は{b}を壁に押しつけ、首筋に唇を落とした。{b}の髪の匂いに、苛立ちと同じくらいの熱が込み上げた。服越しに重なった{胸}が、互いの鼓動を伝えた。|{a}は、背を向けた{b}を後ろから抱き寄せた。さっきまでの憎まれ口が嘘のように、腕は離れなかった。{b}がゆっくり振り返ると、二人の唇は自然に重なった。'),
      bot: L('{a}は、{b}の手首を取って、自分の{胸}元へ導いた。挑むような目で{b}を見上げた。触れた指先が熱を持つのを、{a}は見逃さなかった。|{a}は{b}の肩に額を押しつけ、そのまま首筋に唇を寄せた。素直な言葉は一つも出てこなかった。代わりに、{b}の服の裾をぎゅっと握った。|{a}は、{b}の唇を一度だけついばんで、すぐに離れた。嫌いなはずの相手に、自分から仕掛けていた。{b}が追いかけてくるのを、{a}は息を詰めて待った。')
    },
    fm: {
      top: L('{a}は、{b}の胸ぐらを掴んで引き寄せ、噛みつくように唇を重ねた。口では言い負かせない相手だった。{b}を座らせて膝に跨ると、{a}は勝ち誇ったように見下ろした。|{a}は{b}を壁際に追い詰め、胸板に自分の{胸}を押しつけた。{b}が何か言いかけると、指で唇を塞いだ。{a}の目には、苛立ちとは別の熱がともっていた。|{a}は、{b}の肩を押して寝かせ、その上に跨った。嫌いだと言い続けた相手を、見下ろすのは気分がよかった。{a}は{b}のシャツのボタンを一つずつ外していった。'),
      bot: L('{a}は、{b}の手を掴んで自分の腰に回させた。顔を背けたまま、体だけを{b}に預けた。{b}の手に力がこもると、{a}は悔しそうに目を伏せた。|{a}は、{b}のシャツの裾を引いて、自分のほうへ引き寄せた。何も言わなかった。{b}が察して{a}を抱き上げると、{a}は{b}の首にしがみついた。|{a}は、{b}の胸に額を押しつけて、小さく悪態をついた。それから顔を上げ、自分から唇を寄せた。{b}の腕が{a}の背に回るまで、そう時間はかからなかった。')
    }
  };
  /* ---------- きっかけの段（{a}＝手を出した愛憎を持つ側、{b}＝相手。性的な語・体の語・手を繋ぐ・抱きしめる・キスの言い回しは書かない） ---------- */
  var LEAD = R.URGE_LEAD = {
    face: {
      hate: L('{a}は、{b}を嫌っているはずだった。嫌っているはずの相手のことが、一日じゅう頭から離れなかった。|{a}にとって、{b}は顔を見るだけで苛立つ相手だった。その苛立ちが、いつからか別の熱に変わっていた。'),
      love: L('{a}と{b}は、顔を合わせれば喧嘩ばかりしていた。喧嘩の数だけ、{a}は{b}から目を離せなくなっていた。|{a}は、{b}の前でだけはどうしても素直になれなかった。言えなかった言葉が、胸の奥に溜まり続けていた。'),
      peer: L('{a}は、{b}と張り合うことでしか、{b}のそばにいる理由を作れなかった。その理由が、もう足りなくなっていた。|{a}は、{b}に負けたくないと思っていた。負けたくないのか、離れたくないのか、{a}にももう分からなかった。')
    },
    from: {
      regret: L('さっき突き放したばかりの背中が、{a}の目に焼きついていた。謝る言葉の代わりに、体が先に動いた。|言い過ぎたことを、{a}は分かっていた。言葉で取り返せないなら、と{a}は考えるのをやめた。'),
      mixed: L('{b}が嬉しそうに笑った顔を、{a}は振り払えずにいた。嬉しさと苛立ちがもつれたまま、衝動だけが残った。|喜ぶ{b}を見たときの胸のざわつきは、時間が経っても収まらなかった。収まらない熱を、{a}は持て余していた。')
    },
    recv: {
      both: L('{b}も、同じものを抱えていた。拒む理由は、どちらにも残っていなかった。|{b}は驚いた顔をしたが、逃げなかった。{b}のほうも、ずっと同じ距離で足踏みしていた。'),
      warm: L('{b}は戸惑いながらも、{a}を突き放さなかった。前から、{a}の視線には気づいていた。|{b}は、{a}の目の色が変わったことに気づいた。気づいたうえで、その場を動かなかった。')
    }
  };
  R.urgeLead = function (ctx, a, b) {
    var fc = LH.face(ctx, a, b), pf = ctx.pair(a, b), u = pf.lhUrge || {}, both = LH.has(ctx, b, a), m = { a: a, b: b };
    var parts = [pk(ctx, LEAD.face[fc] || LEAD.face.hate), pk(ctx, LEAD.from[u.from === 'mixed' ? 'mixed' : 'regret']), pk(ctx, LEAD.recv[both ? 'both' : 'warm'])];
    return {
      text: parts.map(function (s) { return fill(s, m); }).join(''),
      why: 'きっかけ：' + a.name + 'は' + b.name + 'に愛憎を抱いている（表の顔：' + (LH.FACE_JA[fc] || fc) + '）・' + (u.from === 'mixed' ? b.name + 'の喜ぶ顔への複雑さ' : '突き放したあとの戸惑い') + 'が衝動に変わった・' +
        (both ? b.name + 'も愛憎を抱いていた' : b.name + 'も拒まなかった') + '（' + a.name + 'の性欲：' + ((HK.Pos && HK.Pos.libOf && HK.Pos.libOf(a)) === 'high' ? '強い' : '衝動が勝った') + '）'
    };
  };

  /* ---------- 起きてよい組 ---------- */
  function libOk(ctx, a, b) {
    var P = HK.Pos;
    if (!P) return false;
    if (P.libOf(a) === 'none') return false;
    return P.libOf(a) === 'high' || (P.sexDrive ? P.sexDrive(ctx, a, b) >= 0.4 : false);
  }
  function ready(ctx, a, b) {
    var pf = ctx.pair(a, b), u = pf.lhUrge, W = HK.TieWarmR18;
    if (HK.SAFE_ON || !u || u.done || u.by !== a.i || u.to !== b.i) return false;
    var d = ctx.stepIndex - u.at;
    if (d < 1 || d > 3) return false;
    if (!W || !W.ok || !W.X || !HK.ThickSex || !W.ok(ctx, a, b)) return false;
    if (!LH.has(ctx, a, b) || !LH.sexOk(ctx, a, b) || (HK.Pos && !HK.Pos.okSex(a, b))) return false;
    if (HK.Avoid && HK.Avoid.of && (HK.Avoid.of(ctx, a, b) || HK.Avoid.of(ctx, b, a))) return false;
    if (!libOk(ctx, a, b)) return false;
    var ba = ctx.R(b, a);
    return LH.has(ctx, b, a) || ba.att >= 30 || !!pf.night || !!pf.couple || (HK.Pos && HK.Pos.libOf(b) === 'high');
  }
  HK.addTo(HK.COMMON, {
    id: 'tie_lh_urge', label: '戸惑いが衝動に変わり愛憎の相手に手を出す', cat: 'romance', sex: true, scope: 'pair', r18: true, tie: 'lovehate', noOdd: true, pri: true,
    when: function (ctx, a, b) { return !!b && ready(ctx, a, b); },
    /* 突き放したあと・複雑のあとの続きなので、箱庭の進行役の出来事と同じくらい重くする（pri）。性欲・理性・夜の起こりやすさの倍率は engine.js の act が掛ける */
    w: function (ctx, a, b) { return 1.6 + ((HK.Pos && HK.Pos.sexDrive) ? HK.Pos.sexDrive(ctx, a, b) : 0.3) * 2; },
    run: function (ctx, a, b) {
      if (!ready(ctx, a, b)) return null;
      var pf = ctx.pair(a, b), u = pf.lhUrge, W = HK.TieWarmR18, X = W.X;
      u.done = true; pf.night = true; pf.nights = (pf.nights || 0) + 1; pf.lhMore = (pf.lhMore || 0) + 2;
      var od = order(a, b), A = od[0], B = od[1], mode = modeOf(A, B), role = A === a ? 'top' : 'bot', fc = LH.face(ctx, a, b);
      var op = fill(pk(ctx, (OPEN[mode] || OPEN.mf)[role]), { a: A, b: B });
      var after = fill(pk(ctx, (R.AFTER && R.AFTER[ps(B)]) || R.TAIL) + (R.TAIL ? pk(ctx, R.TAIL) : ''), { a: A, b: B });
      var LW = HK.Lewd, env = ctx.env, low = LW && LW.low(env), short = LW && LW.short(env, ctx.rng), ero = LW && LW.ero(env) && HK.ThickEro, high = LW && LW.high(env);
      var pk0 = function (arr) { return ctx.pick(arr); }, pkF = HK.Ero && HK.Ero.freshPick ? HK.Ero.freshPick(ctx, pk0) : pk0;
      var ET = HK.EroTop, rel = (ET && ET.relOf ? ET.relOf(ctx, A, B) : '') || 'first', text;
      var PSX = X.PEAK_PS[B.persona] || X.PEAK_PS.gentle;
      if (low) text = op + pk(ctx, X.FADE) + after;
      else {
        var tailPs = pk(ctx, PSX), TS = HK.ThickSex;
        if (!short && TS) {
          var tail = tailPs + '\n\n' + (high && HK.ThickEro ? HK.ThickEro.again(ctx, pkF, A, B, !!ero, false) + '\n\n' : '') + after;
          var o = { S: ctx, ctx: ctx, pick: pkF, rng: ctx.rng, a: A, b: B, style: TS.style(A), open: op, after: tail, rel: rel, again: false };
          text = (ero ? HK.ThickEro.scene(o) : TS.scene(o)).text;
        } else if (ero) {
          text = HK.ThickEro.short({ S: ctx, pick: pkF, a: A, b: B, open: op, again: high, after: tailPs + after, rel: rel }).text;
        } else {
          var NG = HK.NoGen && HK.NoGen.on && HK.NoGen.on(A, B);
          var body = NG && HK.NoGen.short ? HK.NoGen.short({ S: ctx, pick: pkF, rng: ctx.rng, a: A, b: B }) : pk(ctx, X.SHORT[mode]) + pk(ctx, X.CLIMB[mode]) + '{b}「{m2}」' + pk(ctx, X.SHORT_END[mode]);
          var again = high && HK.ThickEro ? HK.ThickEro.again(ctx, pkF, A, B, false, true) : '';
          text = op + body + again + tailPs + after;
        }
      }
      if (HK.Ero && HK.Ero.fill) text = HK.Ero.fill(ctx, text, B);
      text = ctx.t(text, A, B);
      if (mode === 'ff' && HK.FF && HK.FF.fix) text = HK.FF.fix(ctx, text, A, B);
      /* きっかけの段（下の say の包みが、場面の記録の直前に出す） */
      ctx._lhLead = R.urgeLead(ctx, a, b);
      ctx.mod2(a, b, { att: 6, aff: 3, ten: -3 }, { att: 6, aff: 2, ten: -2 });
      ctx.stress(a, -6);
      if (HK.Emo && HK.Emo.bump) HK.Emo.bump(ctx, a, { lust: -20 });
      return { cat: 'romance', sex: true, text: text, why: LH.why(ctx, a, b) + '／表の顔：' + (LH.FACE_JA[fc] || fc) + '／' + (u.from === 'mixed' ? '喜ぶ顔への複雑さ' : '突き放したあとの戸惑い') + 'が衝動に変わり、' + a.name + 'から手を出した（' + A.name + 'が攻め）', mag: 24 };
    }
  });
  /* ---------- 場面の記録の直前に、きっかけの記録を足す（cold-fear-r18.js と同じ形。出られない部屋で HK.SexLead が先に足していれば足さない） ---------- */
  if (HK.Ctx && HK.Ctx.prototype.say) HK.wrap(HK.Ctx.prototype, 'say', function (prev) {
    return function (o) {
      var L0 = this._lhLead;
      if (!L0 || !o || o.kind !== 'event' || !this._ev || this._ev.id !== 'tie_lh_urge' || typeof o.text !== 'string' || !o.text) return prev.apply(this, arguments);
      this._lhLead = null;
      var log = this.log, at = log.length, last = log[at - 1];
      if (last && last.tag === 'きっかけ' && last.step === this.stepIndex) return prev.apply(this, arguments);
      var e0 = { n: at, step: this.stepIndex, label: this.label, cat: 'romance', actors: (o.actors || []).map(function (c) { return c.i; }), text: L0.text, why: L0.why, odd: false, mag: 3, kind: 'event', tag: 'きっかけ', lewd: false };
      log.push(e0);
      var eroN = this._eroN === at;
      if (eroN) this._eroN = at + 1;
      var e = prev.apply(this, arguments);
      if (!e || e.skipped) {
        var k = log.indexOf(e0);
        if (k >= 0) { log.splice(k, 1); for (var j = k; j < log.length; j++) if (log[j]) log[j].n = j; }
        if (eroN && this._eroN === at + 1) this._eroN = at;
        return e;
      }
      if (HK.SexLead && HK.SexLead.log) HK.SexLead.log.push({ kind: 'lhurge', ev: 'tie_lh_urge', n: e0.n, scene: e.n, gens: ['lhurge'] });
      return e;
    };
  });
})();
