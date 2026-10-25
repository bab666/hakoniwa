/* 箱庭シミュレーター: 関係「歪んだ関係」の場面（全エンジン箱庭で共通。全年齢版も同じ）
   {a}＝支配する側、{b}＝支配される側、{c}＝気づいた周りの人
   ・内容のスイッチ「DVなど歪んだ関係」（abuse）が入：束縛・暴言・物に当たる／手を上げる・謝って優しくなる（繰り返し）・支配される側の反応・周りが気づいて間に入る・離れる決心
   ・切（全年齢版・全年齢モードも）：すれ違いの多い恋人として、軽い場面だけ（やきもち・口げんか・仲直り）
   ・支配される側の気持ち（t.cold）：''＝離れられない（まだ好き）／fear＝怯えている／flee＝逃げ出したい
   ・離れる決心をしたら、二人は恋人ではなくなる（pair.couple を外し、pair.abFree）。以後この場面は出ない
   関係ごとの場面なので、id は tie_ で始める（全体の設定「関係性イベント：出さない」で外れる） */
(function () {
  'use strict';
  var HK = window.HK;
  if (!HK || !HK.COMMON) return;
  function L(s) { return s.split('|'); }
  function own(ctx) { return ctx && ctx.scen && /^(zombie|whiteroom|omega)$/.test(ctx.scen.id) ? 0.4 : 1; }
  function tieOf(ctx, a, b) { return HK.Ties && HK.Ties.has ? HK.Ties.has(ctx, a, b, 'abuse') : null; }
  function here(ctx) { return ctx.present ? ctx.present() : ctx.chars; }
  var X = {
    /* ---- 重い場面（スイッチが入のとき） ---- */
    control: L('{a}は{b}のスマホを取り上げ、履歴を一件ずつ確かめた。「この名前、誰？」――{b}は、答える前に謝っていた。|{a}は{b}が誰かと話すたびに、あとで「何を話したの」と一言ずつ確かめた。{b}は、だんだん誰とも話さなくなった。|{a}「俺がいないところで、勝手に動くな」――{b}は頷いた。頷かないと、あとが長いことを知っていた。|{a}は{b}の着る服を選び、{b}が選んだ服は「似合わない」と言って脱がせた。{b}は、もう自分で選ばなくなっていた。'),
    verbal: L('{a}「お前みたいなのと一緒にいてやれるの、俺くらいだよ」――{b}は笑おうとして、うまく笑えなかった。|{a}は皆の前で、{b}の失敗をわざと大きな声で話した。{b}は俯いたまま、何も言い返さなかった。|{a}「なんでそんなこともできないの？　何回言わせるの」――{b}の声は、だんだん小さくなっていった。|{a}は{b}が何か言いかけるたびに、ため息で遮った。{b}は、話すのをやめた。'),
    violence: L('{a}は壁を拳で殴った。すぐそばにいた{b}は、肩をすくめたまま動けなかった。|{a}は{b}の腕を、跡が残るほど強く掴んだ。「どこ行くの」――{b}は「どこにも」と答えた。|{a}が手を振り上げた瞬間、{b}は目をつむった。手は、{b}の顔のすぐ横の扉を叩いた。|{a}は{b}の持っていたものを床に叩きつけた。{b}は黙って、散らばった破片を拾い集めた。'),
    honey: L('{a}は{b}を抱きしめて、何度も謝った。「ごめん、本当にごめん。お前がいないと駄目なんだ」――{b}は、その腕の中で目を閉じた。|{a}はその夜、{b}の好きなものを買ってきて、別人のように優しく笑った。{b}は「やっぱり、本当は優しい人なんだ」と思った。|{a}「もう二度としない。約束する」――{b}はその約束を、前にも聞いたことがあった。それでも、頷いた。'),
    stay: L('{b}は、{a}の機嫌が悪いのは自分のせいだと思っていた。「私がちゃんとしてれば」――そう言って、腕の痣を袖で隠した。|{b}は周りに「大丈夫、あの人、本当は優しいから」と笑ってみせた。その笑顔は、少しも笑っていなかった。|{b}は{a}の顔色をうかがいながら、言われる前にお茶を淹れた。そうしていれば、今日は穏やかに過ごせる。'),
    fear: L('{b}は{a}の足音が近づくだけで、体を固くした。|{b}は{a}の前では、言葉を選び、笑う場所を選び、息をする間合いまで選んでいた。|{a}が名前を呼んだ。{b}はびくりと肩を震わせ、「なに？」と、できるだけ明るい声で返した。'),
    flee: L('{b}は、{a}が眠ったのを確かめてから、こっそり荷物をまとめ始めた。手が震えて、うまく畳めなかった。|{b}は{a}の目を盗んで、出口までの道を何度も頭の中でなぞった。|{b}は小さな声で、自分に言い聞かせた。「次に手を上げたら、出ていく」――それを言うのは、もう三度目だった。'),
    notice: L('{c}は、{b}の袖口からのぞく痣に気づいた。「……それ、どうしたの」――{b}は「ぶつけただけ」と笑った。{c}は笑わなかった。|{c}は、{a}がいるときだけ{b}が無口になることに気づいていた。{c}「{b}、何かあったら、ちゃんと言って」|{c}は{a}が席を外した隙に、{b}の手を握った。「一人で抱えなくていいから」――{b}の目に、初めて涙がにじんだ。'),
    step: L('{c}は{a}と{b}のあいだに割って入った。「やめなよ。今のは、ただの喧嘩じゃない」――{a}は舌打ちして、その場を離れた。|{a}が{b}に詰め寄ったとき、{c}が{b}の前に立った。{c}「{b}に話があるなら、まず私を通して」|{c}は{b}の肩を抱いて、{a}から引き離した。{a}「関係ないだろ」{c}「関係ある。{b}は、私の大事な人だから」'),
    free: L('{b}は{a}の前に立ち、震える声で言った。「もう、あなたとは一緒にいられない」――{a}は何か言いかけたが、{b}はもう目を逸らさなかった。|{b}は{c}に支えられながら、{a}に別れを告げた。{a}がどんなに謝っても、{b}はもう頷かなかった。|{b}「好きだった。でも、もう怖いほうが大きい」――{b}はそれだけ言って、{a}に背を向けた。'),
    /* ---- 軽い場面（スイッチが切のとき。すれ違いの多い恋人） ---- */
    lJeal: L('{a}は{b}が誰かと楽しそうに話しているのを見て、露骨に不機嫌になった。「……べつに。楽しそうだったね」|{a}「どこ行ってたの？　連絡くらいしてよ」――{b}は「ごめん」と言いながら、少しだけ息苦しさを覚えた。|{a}は{b}の予定を全部知りたがった。{b}は、それが愛情なのか心配性なのか、分からなくなっていた。'),
    lFight: L('{a}と{b}は、些細なことで言い合いになった。{a}の言葉はいつも少しだけ強すぎて、{b}はいつも先に黙った。|{a}は{b}の言うことを最後まで聞かずに、「でもさ」と遮った。{b}は、言いたかったことを飲み込んだ。|{a}と{b}は、同じことでまた揉めた。結局、謝ったのは今回も{b}のほうだった。'),
    lMake: L('{a}は気まずそうに{b}の隣に座り、「さっきは言いすぎた」と呟いた。{b}は少し迷ってから、{a}の手を握った。|{a}は{b}の好きな飲み物を黙って差し出した。仲直りの合図だと、{b}には分かった。|{b}「ちゃんと話そう。私の話も、最後まで聞いて」{a}は少し驚いて、それから小さく頷いた。')
  };
  HK.COMMON.push({
    id: 'tie_abuse', cat: 'conflict', scope: 'pair',
    when: function (ctx, a, b) { var t = tieOf(ctx, a, b); return !!t && !ctx.pair(a, b).abFree; },
    w: function (ctx) { return 1.4 * own(ctx); },
    run: function (ctx, a, b) {
      var t = tieOf(ctx, a, b), A = ctx.chars[t.a], B = ctx.chars[t.b], pf = ctx.pair(A, B), st = t.cold || '';
      var heavy = !!(HK.Content && HK.Content.ok(ctx, 'abuse')), rng = ctx.rng, k, C = null, lab = '歪んだ関係';
      if (!heavy) {
        var x0 = rng();
        k = x0 < 0.4 ? 'lJeal' : x0 < 0.75 ? 'lFight' : 'lMake';
        if (k === 'lMake') ctx.mod2(A, B, { aff: 3, ten: -4 }, { aff: 3, ten: -4 }); else ctx.mod2(A, B, { ten: 3 }, { ten: 4, trust: -2 });
        return { cat: k === 'lMake' ? 'bond' : 'conflict', text: ctx.t(ctx.pick(X[k]), A, B), why: A.name + 'と' + B.name + '（すれ違いの多い恋人）' + { lJeal: '：やきもち・束縛気味', lFight: '：言い合い', lMake: '：仲直り' }[k] + '／重い場面は「内容のスイッチ」の「DVなど歪んだ関係」で入れられます', mag: 8 };
      }
      pf.abN = (pf.abN || 0) + 1;
      var friends = here(ctx).filter(function (c) { return c !== A && c !== B && ctx.R(c, B).aff > 10; });
      C = friends.sort(function (x, y) { return (y.tr.np + ctx.R(y, B).aff / 100) - (x.tr.np + ctx.R(x, B).aff / 100); })[0] || null;
      /* 離れる決心：逃げ出したい・怯えている人が、何度も傷ついたあと、支えてくれる人がいれば */
      var freeP = (st === 'flee' ? 0.3 : st === 'fear' ? 0.15 : 0.05) + (pf.abSeen ? 0.15 : 0) + Math.min(0.2, (pf.abN - 3) * 0.04);
      if (pf.abN >= 3 && (C || st === 'flee') && rng() < freeP) k = 'free';
      else if (C && rng() < 0.28) k = pf.abSeen && rng() < 0.55 ? 'step' : 'notice';
      else {
        var x = rng();
        k = x < 0.26 ? 'control' : x < 0.48 ? 'verbal' : x < 0.62 ? 'violence' : x < 0.8 ? 'honey' : st === 'flee' ? 'flee' : st === 'fear' ? 'fear' : 'stay';
      }
      var text = ctx.t(ctx.pick(X[k]).replace(/\{c\}/g, C ? C.name : '仲間'), A, B);
      if (k === 'control') { ctx.mod2(A, B, { att: 2 }, { ten: 5, trust: -3 }); ctx.stress(B, 6); }
      else if (k === 'verbal') { ctx.mod2(A, B, { ten: 2 }, { aff: -4, ten: 6 }); ctx.stress(B, 8); }
      else if (k === 'violence') { ctx.mod2(A, B, { ten: 4 }, { aff: -6, trust: -6, ten: 10 }); ctx.stress(B, 12); }
      else if (k === 'honey') { ctx.mod2(A, B, { att: 3 }, { att: st ? 2 : 5, aff: st ? 2 : 5, ten: -3 }); ctx.stress(B, -4); }
      else if (k === 'stay' || k === 'fear' || k === 'flee') ctx.stress(B, k === 'stay' ? 3 : 6);
      else if (k === 'notice' || k === 'step') { pf.abSeen = true; ctx.mod2(B, C, { trust: 8, aff: 5 }, { aff: 4 }); if (k === 'step') ctx.mod2(A, C, { ten: 10 }, { ten: 8, trust: -6 }); ctx.stress(B, -5); }
      else if (k === 'free') {
        pf.abFree = true; pf.couple = false;
        ctx.mod2(B, A, { att: -30, aff: -15, ten: 6 }, { ten: 8 }); ctx.stress(B, -10);
        if (C) ctx.mod2(B, C, { trust: 10, aff: 6 }, { aff: 5, trust: 4 });
      }
      if (HK.Emo && /^(?:control|verbal|violence|fear|flee)$/.test(k)) HK.Emo.bump(ctx, B, { fear: k === 'violence' ? 30 : 16, grief: 6 }, A.name + 'との歪んだ関係');   /* 気分（emotion.js） */
      var whyK = { control: '：束縛', verbal: '：暴言', violence: '：物に当たる・手を上げる', honey: '：謝って優しくなる（繰り返し）', stay: '：離れられない', fear: '：怯えている', flee: '：逃げ出したい', notice: '：' + (C ? C.name : '周り') + 'が気づいた', step: '：' + (C ? C.name : '周り') + 'が間に入った', free: '：' + B.name + 'が離れる決心をした（恋人ではなくなった）' }[k];
      var back = HK.ABUSE_BACK && HK.ABUSE_BACK[st] ? HK.ABUSE_BACK[st].short : '';
      return { cat: k === 'honey' ? 'romance' : k === 'notice' || k === 'step' || k === 'free' ? 'help' : 'conflict', with: C && /notice|step|free/.test(k) ? [C] : null, text: text, why: A.name + '（支配する側）と' + B.name + '（支配される側・' + back + '）の' + lab + whyK, mag: k === 'free' ? 22 : k === 'violence' || k === 'step' ? 16 : 10 };
    }
  });
})();
