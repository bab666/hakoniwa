/* 箱庭シミュレーター（R18版のみ）: 無人島とゾンビの街の夜 ― 恋愛相手の固定・師弟・兄貴分の口調などを使う
   ・無人島に「島の夜（R18）」の設定を足す（描かない／ほのめかす／描写する）
   ・ゾンビの街は「恋人たちの夜（R18）」の設定に従う
   ・家族（親子・きょうだい）と教師と生徒の組では、こうした展開は起きない
   ・受け攻めの指定に従う（{x}=攻め、{y}=受け）
   全年齢モードでは、この出来事は使わない（r18 の印で safe.js が外す） */
(function () {
  'use strict';
  var HK = window.HK, RK = HK.RelKit;
  if (!RK) return;
  var L = RK.L, fill = RK.fill;
  function order(a, b) { return HK.Pos ? HK.Pos.order(a, b, [a, b]) : [a, b]; }
  function okPair(ctx, a, b) { return HK.canLove(a, b) && HK.canLove(b, a) && !RK.noRomance(ctx, a, b) && !HK.lockBlocks(a, b); }
  function has(ctx, a, b, t) { return HK.Ties && HK.Ties.has(ctx, a, b, t); }
  /* どんな二人の夜か */
  function kindOf(ctx, a, b) {
    if (RK.lockedTo(a, b) || RK.lockedTo(b, a)) return 'lock';
    if (RK.exact(ctx, a, b, 'mentor')) return 'mentor';
    if (has(ctx, a, b, 'fwb')) return 'fwb';
    if (ctx.pair(a, b).couple || has(ctx, a, b, 'lover') || has(ctx, a, b, 'mate')) return 'lover';
    return 'new';
  }
  function ready(ctx, a, b, k) {
    var ra = ctx.R(a, b), rb = ctx.R(b, a);
    if (k === 'lover' || k === 'fwb') return ra.att > 30 && rb.att > 30;
    if (k === 'lock') return ra.att > 38 && rb.att > 38;
    if (k === 'mentor') return ra.att > 42 && rb.att > 42 && ra.trust > 30;
    return ra.att > 58 && rb.att > 58 && ra.aff > 30 && rb.aff > 30;
  }
  var ANIKI = L('「力抜け。……大丈夫だ、全部任せとけ」|「怖かったら言え。やめてやるから」――そう言いながら、{x}の手は優しかった。|「無理すんな。……今夜くらい、甘えていい」');

  /* ======================= 無人島 ======================= */
  var isl = HK.SCENARIOS.island;
  if (isl) {
    isl.env.push({ id: 'ilewd', label: '島の夜（R18）', type: 'select', def: 'fade', options: [{ v: 'off', label: '描かない' }, { v: 'fade', label: 'ほのめかす' }, { v: 'high', label: '描写する' }], desc: '恋人・セフレ・恋愛相手を決めた相手・惹かれ合った二人の夜。家族と教師と生徒の組では起きません' });
    var I = {
      ask: {
        lover: L('焚き火が小さくなった頃、{a}は{b}の手を引いて、岩陰の寝床へ連れていった。|{a}は{b}の耳元で囁いた。「……今夜は、二人で寝よう」|満月の浜辺で、{a}は{b}を後ろから抱きしめた。'),
        fwb: L('{a}は{b}の寝床に潜り込んだ。「寒いから」――理由は、それで十分だった。|水浴びから戻った{b}を、{a}は黙って見つめた。{b}は小さく笑って、{a}の隣に座った。'),
        lock: L('{a}はずっと胸にしまっていた言葉を、焚き火の前でようやく口にした。「……あなたしか、見てなかった」|{a}は{b}の手を取った。震えていた。ずっと、この手だけを想っていた。'),
        mentor: L('稽古のあと、{a}は{b}の手首を掴んだまま離さなかった。師と弟子の距離が、ふっと崩れた。|{a}は{b}に言った。「……教えられないことが、一つだけある」――{b}は目を逸らさなかった。'),
        new: L('嵐の夜、狭い洞窟で、{a}と{b}は肩を寄せ合っていた。雷が鳴るたびに、距離が縮んだ。|夜の浜で、{a}と{b}の視線がぶつかった。どちらからともなく、唇が重なった。')
      },
      fade: L('波の音が、二人の息遣いをかき消した。――その先は、星だけが見ていた。|焚き火の明かりが、重なった二つの影を岩壁に映していた。|洞窟の奥で、二人の体温が混ざり合った。外の嵐の音は、もう聞こえなかった。|椰子の葉の寝床が、夜更けまで小さく鳴っていた。'),
      high: {
        fore: L('{x}は{y}の日焼けした肩に唇を落とし、潮の味のする肌をゆっくりと舐め上げた。|{x}は{y}を椰子の葉の寝床に横たえ、濡れた服を一枚ずつ剥がしていった。|波打ち際で、{x}は{y}を砂の上に押し倒した。寄せる波が、二人の脚を濡らした。'),
        insert: L('{x}はゆっくりと{y}の中に沈んだ。{y}は砂を掴み、声を殺しきれずに{x}の名前を呼んだ。|{y}は{x}の首にしがみつき、自分から腰を沈めた。焚き火の熱より、ずっと熱かった。|{x}が奥まで届いた瞬間、{y}は背中を反らせて、波の音に混じる声を漏らした。'),
        mid: L('潮騒に合わせるように、{x}は{y}を深く揺さぶった。|{y}は{x}の背中に爪を立て、何度も「もっと」とねだった。|洞窟の壁に、二人の荒い息だけが反響していた。'),
        end: L('{x}は{y}の奥で果て、そのまま砂の上で{y}を抱きしめた。|{y}が先に達し、{x}もすぐにその後を追った。夜明けまで、二人は離れなかった。|果てたあとも、二人は波の音を聞きながら、互いの鼓動を数えていた。')
      },
      /* 女性どうし：挿入の描写を使わず、指・舌・脚を絡めて（島の夜らしく、砂・潮・焚き火の中で） */
      ffHigh: {
        insert: L('{x}は{y}の脚のあいだに指を滑り込ませ、潮で濡れたのとは違う熱を確かめた。{y}は砂を掴み、声を殺しきれずに{x}の名前を呼んだ。|{x}は焚き火の明かりの中で{y}の膝を割り、そこへ顔を埋めた。舌が這うたびに、{y}の踵が砂を掻いた。|{x}と{y}は椰子の葉の寝床で脚を交差させ、互いの一番熱いところを重ね合わせた。焚き火の熱より、ずっと熱かった。'),
        mid: L('潮騒に合わせるように、{x}は{y}の中で指をゆっくりと動かした。|{y}は{x}の背中に爪を立て、何度も「もっと」とねだった。|洞窟の壁に、二人の荒い息だけが反響していた。'),
        end: L('{x}の指が弱いところを押し上げた瞬間、{y}は背中を反らせて達した。{x}はそのまま砂の上で{y}を抱きしめた。|{y}が先に達し、脚を絡めたままの{x}も、すぐにその後を追った。夜明けまで、二人は離れなかった。|達したあとも、二人は波の音を聞きながら、互いの鼓動を数えていた。')
      },
      after: {
        lover: L('朝、{a}と{b}は同じ毛布の中で目を覚ました。救助なんて、来なくてもいい気がした。|{a}は{b}の髪についた砂を払った。「……誰にも言うなよ」「言わないよ」'),
        fwb: L('朝になると、{a}は何事もなかったように漁に出た。{b}も、何も言わなかった。|{a}と{b}は、昨夜のことには触れずに朝食をとった。目だけが、何度も合った。'),
        lock: L('朝、{a}は{b}の寝顔を見つめて、静かに泣いた。ずっと、この人だけを想ってきた。|{b}は{a}の手を握って言った。「待たせて、ごめん」'),
        mentor: L('翌朝の稽古は、どこかぎこちなかった。それでも{b}の構えは、昨日より少しだけ柔らかかった。|{a}は{b}に、何も教えなかった。{b}も、何も訊かなかった。'),
        new: L('翌朝、{a}と{b}は互いの顔をまともに見られなかった。島に、新しい噂が一つ増えた。|朝の浜辺で、{a}は{b}の隣に座った。昨日までより、少しだけ近かった。')
      }
    };
    isl.events.push({
      id: 'ir18_night', cat: 'romance', scope: 'pair', r18: true,
      when: function (ctx, a, b) {
        if ((ctx.env.ilewd || 'fade') === 'off' || !okPair(ctx, a, b)) return false;
        var pf = ctx.pair(a, b);
        if ((pf.irN || 0) >= 2 || (pf.irAt != null && ctx.stepIndex - pf.irAt < 6)) return false;
        return ready(ctx, a, b, kindOf(ctx, a, b));
      },
      w: function (ctx, a, b) { var k = kindOf(ctx, a, b); return 0.5 + (ctx.R(a, b).att + ctx.R(b, a).att) / 120 + a.tr.fc * 0.2 + a.tr.impulse * 0.2 + (k === 'lock' ? 1 : 0) + (ctx.env.storm > 60 ? 0.3 : 0); },
      run: function (ctx, a, b) {
        if (!RK.lockedTo(a, b) && RK.lockedTo(b, a)) { var sw = a; a = b; b = sw; }
        var pf = ctx.pair(a, b), k = kindOf(ctx, a, b), lv = ctx.env.ilewd || 'fade', o = order(a, b);
        pf.irN = (pf.irN || 0) + 1; pf.irAt = ctx.stepIndex; pf.night = true;
        if (k === 'lock' || k === 'lover' || k === 'new') pf.couple = pf.couple || k !== 'new' || ctx.rng() < 0.5;
        ctx.mod2(a, b, { att: 8, aff: 6, trust: 4 }, { att: 8, aff: 6, trust: 4 });
        ctx.stress(a, -10); ctx.stress(b, -10);
        var v = { a: a.name, b: b.name, x: o[0].name, y: o[1].name };
        var t = fill(ctx.pick(I.ask[k]), v);
        if (lv === 'high') t += ['fore', 'insert', 'mid', 'end'].map(function (s) { var H = HK.Pos && HK.Pos.ff(o[0], o[1]) && I.ffHigh[s] ? I.ffHigh : I.high; return fill(ctx.pick(H[s]), v); }).join('');
        else t += ctx.pick(I.fade);
        if (RK.tone(o[0]) === 'aniki' && ctx.rng() < 0.6) t += o[0].name + fill(ctx.pick(ANIKI), v);
        t += fill(ctx.pick(I.after[k]), v);
        return { text: t, why: '島の夜（' + ({ lock: a.name + 'が想い続けた相手', mentor: '師弟の一線', fwb: 'セフレ', lover: '恋人', new: '惹かれ合った二人' })[k] + '／惹かれ ' + Math.round(ctx.R(a, b).att) + '・' + Math.round(ctx.R(b, a).att) + '）', mag: 24 };
      }
    });
  }

  /* ======================= ゾンビの街 ======================= */
  var Z = HK.ZB;
  if (Z && Z.scen && Z.loveLv) {
    var ZT = {
      ask: {
        lock: L('{a}は{b}の手を握った。「いつ死ぬか分からないなら、言っておく。……ずっと、あなただけだった」|崩れかけた部屋で、{a}は{b}に想いを打ち明けた。答えの代わりに、{b}は{a}を抱きしめた。'),
        mentor: L('見張りの交代のとき、{a}は{b}の手首を掴んだまま離さなかった。師と弟子の距離が、ふっと崩れた。|{a}は{b}の傷の手当てをしながら、ふと手を止めた。「……生きていてくれて、よかった」')
      },
      fade: L('外では、ゾンビの呻き声がしていた。二人は息を殺して、互いの体温だけを確かめ合った。|暗い部屋で、二人の影が重なった。――明日の保証は、どこにもなかった。'),
      high: {
        fore: L('{x}は{y}の服を、一枚ずつ確かめるように脱がせた。咬み跡がないか確かめるたびに、唇を落とした。|{x}は{y}を毛布の上に押し倒し、首筋に何度も口づけた。'),
        insert: L('{x}はゆっくりと{y}の中に入った。{y}は声を殺そうとして、殺しきれずに{x}の肩に噛みついた。|{y}は自分から{x}を迎え入れた。「……生きてる。ちゃんと、生きてる」'),
        end: L('{x}は{y}の奥で果てた。外の呻き声は、いつの間にか遠ざかっていた。|二人は果てたあとも、夜明けまで抱き合っていた。')
      },
      ffHigh: {
        insert: L('{x}は{y}の脚のあいだに指を沈め、ゆっくりと動かした。{y}は声を殺そうとして、殺しきれずに{x}の肩に噛みついた。|{y}は自分から{x}の手を取り、熱いところへ導いた。「……生きてる。ちゃんと、生きてる」'),
        end: L('{y}は{x}の指をきつく締めつけて達した。外の呻き声は、いつの間にか遠ざかっていた。|二人は達したあとも、脚を絡めたまま夜明けまで抱き合っていた。')
      },
      after: {
        lock: L('朝、{a}は{b}の寝顔を見つめた。この人だけを想って、ここまで生き延びてきた。'),
        mentor: L('翌朝、{a}は{b}に何も言わなかった。それでも、背中を預ける距離が、少しだけ近くなっていた。')
      }
    };
    Z.scen.events.push({
      id: 'zr18_night', cat: 'romance', scope: 'pair', r18: true,
      when: function (ctx, a, b) {
        if (Z.loveLv(ctx) === 'off' || !okPair(ctx, a, b) || (Z.isLover && Z.isLover(ctx, a, b))) return false;
        var k = kindOf(ctx, a, b);
        if (k !== 'lock' && k !== 'mentor') return false;
        if (Z.part(ctx) < 1) return false;
        var pf = ctx.pair(a, b);
        if ((pf.zr18 || 0) >= 2 || (pf.zr18At != null && ctx.stepIndex - pf.zr18At < 6)) return false;
        return ready(ctx, a, b, k);
      },
      w: function (ctx, a, b) { return 1 + (a.stress + b.stress) / 120 + ctx.R(a, b).att / 90; },
      run: function (ctx, a, b) {
        if (!RK.lockedTo(a, b) && RK.lockedTo(b, a)) { var sw2 = a; a = b; b = sw2; }
        var pf = ctx.pair(a, b), k = kindOf(ctx, a, b), lv = Z.loveLv(ctx), o = order(a, b);
        pf.zr18 = (pf.zr18 || 0) + 1; pf.zr18At = ctx.stepIndex; pf.night = true; if (k === 'lock') pf.couple = true;
        ctx.mod2(a, b, { att: 8, aff: 8, trust: 6 }, { att: 8, aff: 8, trust: 6 });
        a.stress = Math.max(0, a.stress - 12); b.stress = Math.max(0, b.stress - 12);
        var v = { a: a.name, b: b.name, x: o[0].name, y: o[1].name };
        var t = fill(ctx.pick(ZT.ask[k]), v) + (lv === 'high' ? ['fore', 'insert', 'end'].map(function (s) { var H = HK.Pos && HK.Pos.ff(o[0], o[1]) && ZT.ffHigh[s] ? ZT.ffHigh : ZT.high; return fill(ctx.pick(H[s]), v); }).join('') : ctx.pick(ZT.fade));
        if (RK.tone(o[0]) === 'aniki' && ctx.rng() < 0.6) t += o[0].name + fill(ctx.pick(ANIKI), v);
        return { text: t + fill(ctx.pick(ZT.after[k]), v), why: (k === 'lock' ? a.name + 'が想い続けた相手' : '師弟の一線') + '（' + Z.day(ctx) + '日目の夜）', mag: 26 };
      }
    });
    /* 恋人の夜：攻めが兄貴・姉貴分なら、一言足す */
    if (Z.LOVE && Z.LOVE.nightHigh) {
      var nh = Z.LOVE.nightHigh;
      Z.LOVE.nightHigh = function (ctx, a, b) {
        var t = nh.apply(this, arguments), o = order(a, b);
        if (RK.tone(o[0]) === 'aniki' && ctx.rng() < 0.5) t += o[0].name + fill(ctx.pick(ANIKI), { x: o[0].name, y: o[1].name });
        return t;
      };
    }
  }
})();
