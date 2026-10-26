/* 箱庭シミュレーター: 結末・後日談・最期の言葉の共通枠 HK.Epilogue
   ■ HK.Epilogue.last(ctx, c, how, killer)：最期の言葉。態度9種 × 死に方（kill 殺された／accident 事故／sacrifice 身代わり／suicide 自ら／disease 病・衰弱）× 3文以上。
     恋人・本命・執着の相手（いなければ、いちばん心を寄せた相手）がいれば、その人への呼びかけつき。手を下したのがその相手なら、その人への言葉
   ■ HK.Epilogue.after(res, c)：一人ごとの「その後」。行く末（生存／脱出／死亡／監禁／堕ち）× 態度9種 × 3文以上に、関係（恋人がいる／失った／一人）か気分の最終値の結びを足す
   ■ HK.Epilogue.pairAfter(res, p)：組ごとの「その後」。結末の関係（恋人・両片想い・名前のない関係・別れ・宿敵・友人・執着）× 二人の気分
   ■ HK.Epilogue.build(res, E)：HK.Endings.build の最後に呼ばれる。E.lines に「その後」を最大 8 行、E.last に最期の言葉を足す。
     箱庭専用の「その後」（無人島の island-after・部屋の三人 room-trio など）がすでに出した人は飛ばす（c.afterDone か、「〇〇のその後――」の行・「その後は「」の行く末）
   ■ 物語型（邪神村・吹雪の館・宇宙船・人狼村）：HK.Story.result から HK.Epilogue.story を呼び、結末の箇条書きに最期の言葉と「その後」を足す
   死の記録には、60% で「――〇〇が最期に遺した言葉：「……」」を足す（R18版の「ほのめかす」の和らげ lewd-unify.js より前に入る）。
   台詞は「〇〇「……」」の形にして、口調の仕上げ（voice.js）を通す */
(function () {
  'use strict';
  var HK = window.HK;
  if (!HK || !HK.Ctx) return;
  var Ctx = HK.Ctx, Emo = HK.Emo;
  function L(s) { return s.split('|'); }
  function safe() { return !!HK.SAFE_ON; }
  function hash(s) { s = String(s); var h = 2166136261; for (var i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return (h >>> 0) / 4294967296; }
  function pickH(arr, key) { return arr && arr.length ? arr[Math.floor(hash(key) * arr.length) % arr.length] : ''; }
  /* 同じ結末の中で、同じ文を二度使わない（used に覚える） */
  function pickU(arr, key, used) {
    if (!arr || !arr.length) return '';
    var k0 = Math.floor(hash(key) * arr.length) % arr.length;
    if (!used) return arr[k0];
    for (var d = 0; d < arr.length; d++) { var t = arr[(k0 + d) % arr.length]; if (!used[t]) { used[t] = 1; return t; } }
    return arr[k0];
  }
  var ATT = ['proud', 'stern', 'tsun', 'gentle', 'devoted', 'cool', 'free', 'shy', 'polite'];
  function att(c) {
    if (Emo && Emo.att) return Emo.att(c);
    return c && ATT.indexOf(c.persona) >= 0 ? c.persona : 'gentle';
  }

  /* ---------- 最期の言葉（「」の中身。{to}＝相手への呼びかけ「〇〇、」か空） ---------- */
  var LW = {
    kill: {
      proud: L('{to}……くそ、こんなところで、終わりかよ|{to}ざまあねえな……あとは、勝手にやれ|{to}覚えてろ……俺は、まだ……'),
      stern: L('{to}……油断した。私の、落ち度だ|{to}あとを、頼む……振り返るな|{to}……悔いは、ない。そう、思わせてくれ'),
      tsun: L('{to}……べつに、痛くなんか、ない|{to}泣くな……泣いたら、許さない|{to}……ばか。こんなときくらい、そばにいろ'),
      gentle: L('{to}……大丈夫。怖くないよ|{to}ありがとう……楽しかった、ね|{to}誰も、恨まないで……お願い'),
      devoted: L('{to}……ごめんなさい。最後まで、役に立てなくて|{to}どうか、生きて……それだけで、いいんです|{to}……みんなは、無事……？'),
      cool: L('{to}……計算違い、か。まあ、いい|{to}……思ったより、静かだな|{to}あとの判断は、任せる……間違えるなよ'),
      free: L('{to}……あはは、ドジったなあ|{to}……もっと、遊びたかった、な|{to}笑ってよ……ほら、いつもみたいに'),
      shy: L('{to}……こわい、です……手、にぎって……|{to}ご、ごめんね……先に、いくね|{to}……ずっと、言えなかった、ことが……'),
      polite: L('{to}……お見苦しいところを、お見せしました|{to}どうか、お元気で……|{to}……今まで、ありがとうございました')
    },
    accident: {
      proud: L('{to}……は、こんな、間抜けな終わり方かよ|{to}来るな……俺のことは、いい|{to}……悪くねえ人生だった、ってことに、しとけ'),
      stern: L('{to}……足を、取られた……すまない|{to}構うな……先へ、進め|{to}……ここまで、か。存外、あっけない'),
      tsun: L('{to}……なによ、その顔……平気だって、言ってる|{to}……こんなの、ずるい……|{to}あんたのせいじゃ、ないから……絶対に'),
      gentle: L('{to}……あれ、なんだか、眠いや|{to}大丈夫、だから……そんな顔、しないで|{to}……空、きれいだね'),
      devoted: L('{to}……私のことは、置いていってください|{to}……みんなが、無事なら……よかった|{to}すみません……最後まで、お手伝い、できなくて'),
      cool: L('{to}……運が、なかったな|{to}……確率の、問題だ。気に、するな|{to}……もう、いい。行け'),
      free: L('{to}……うそ、でしょ……まだ、やりたいこと、いっぱい……|{to}……へへ、ちょっと、休むね|{to}またね……って、言わせてよ'),
      shy: L('{to}……いたい、です……|{to}……ひとりに、しないで……|{to}……ごめんなさい……ありがとう……'),
      polite: L('{to}……申し訳ありません。お先に、失礼いたします|{to}……どうか、私のことはお気になさらず|{to}……皆さんに、よろしくお伝えください')
    },
    sacrifice: {
      proud: L('{to}行け！　ここは、俺が止める|{to}……借りは、返したぞ|{to}振り向くんじゃねえ……走れ'),
      stern: L('{to}これが、私の務めだ|{to}……行け。立ち止まることは、許さん|{to}守れたなら……それでいい'),
      tsun: L('{to}か、勘違いしないでよ……あんたのためじゃ、ないんだから|{to}早く、行きなさいよ……ばか|{to}……ちゃんと生き残らなかったら、許さないから'),
      gentle: L('{to}いいんだ……こうしたかったんだよ|{to}……無事で、よかった|{to}……みんなのこと、頼んだよ'),
      devoted: L('{to}……やっと、お役に立てました|{to}私は、いいんです……どうか、生きてください|{to}……守れて、よかった……'),
      cool: L('{to}……合理的な判断だ。君が生きるほうが、いい|{to}……悪くない、交換だろう|{to}……振り返るな。時間の無駄だ'),
      free: L('{to}へへ……かっこよかった、でしょ？|{to}……行って！　早く！|{to}……あたしの分まで、楽しんでよね'),
      shy: L('{to}……やっと、勇気、出せた……|{to}……こわかった、けど……よかった……|{to}……にげて……おねがい……'),
      polite: L('{to}……どうか、お先に。ここは私が|{to}……お役に立てて、光栄です|{to}……振り返らずに、お進みください')
    },
    suicide: {
      proud: L('{to}……俺の終わりは、俺が決める|{to}止めるなよ……もう、決めたんだ|{to}……誰のせいでも、ねえ'),
      stern: L('{to}……始末は、自分でつける|{to}……許せとは、言わない|{to}これで償いになるとは思わない。だが……'),
      tsun: L('{to}……止めないで。お願いだから|{to}……ほんとは、もっと、ちゃんと……|{to}……ばいばい'),
      gentle: L('{to}……疲れちゃった。ごめんね|{to}……あなたは、生きてね|{to}……ありがとう。もう、いいんだ'),
      devoted: L('{to}……私がいないほうが、きっと……|{to}ごめんなさい……ごめんなさい……|{to}……どうか、忘れてください'),
      cool: L('{to}……結論は、もう出ている|{to}……これが、最善だった|{to}……説明は、残してある'),
      free: L('{to}……もう、いいや|{to}……最後くらい、自分で選ばせてよ|{to}……笑って、見送ってよ'),
      shy: L('{to}……ごめんね……もう、がんばれない……|{to}……さよなら……|{to}……誰にも、言えなかった……'),
      polite: L('{to}……身勝手を、お許しください|{to}……お世話に、なりました|{to}……どうか、お幸せに')
    },
    disease: {
      proud: L('{to}……情けねえな、こんな、ことで|{to}……そんな顔、すんな。俺は、平気だ|{to}……あとは、頼んだぞ'),
      stern: L('{to}……体が、言うことを、聞かん|{to}……看病、感謝する|{to}……私のことは、もう、いい'),
      tsun: L('{to}……べつに、つらくなんか、ない……|{to}……もうちょっと、そこにいて|{to}……看病、下手くそ……でも、ありがと'),
      gentle: L('{to}……あったかいね、その手|{to}……少し、眠るね|{to}……ありがとう。そばにいてくれて'),
      devoted: L('{to}……ご迷惑を、おかけしました|{to}……最後まで、そばに、いてくれて……|{to}……私、ちゃんと、頑張れましたか……？'),
      cool: L('{to}……症状からして、もう長くない|{to}……記録は、残してある。役立てろ|{to}……思ったより、怖くないものだな'),
      free: L('{to}……ねえ、なにか、話してよ|{to}……元気になったら、また……|{to}……あーあ、つまんないの'),
      shy: L('{to}……そばに、いて……|{to}……手、はなさないで……|{to}……ありがとう……うれしかった……'),
      polite: L('{to}……お手を煩わせて、申し訳ありません|{to}……どうか、お体を大事に|{to}……ありがとうございました。本当に')
    }
  };
  /* 相手がいるときだけの言葉（{t}＝「〇〇、」） */
  var LW_TO = {
    proud: L('{t}……お前に会えて、まあ、悪くなかった|{t}……先に行って、待っててやる|{t}……お前だけは、生きろよ'),
    stern: L('{t}……お前と過ごした時間は、悪くなかった|{t}……すまない。約束を、守れなかった|{t}……生きろ。それが、最後の頼みだ'),
    tsun: L('{t}……あんたのこと、ほんとは……|{t}……忘れたら、承知しないから|{t}……最後に、顔、見せて'),
    gentle: L('{t}……会えて、よかった|{t}……笑っていてね。ずっと|{t}……ありがとう。大事に思ってたよ'),
    devoted: L('{t}……あなたに会えて、幸せでした|{t}……どうか、私の分まで|{t}……ずっと、お慕いしていました'),
    cool: L('{t}……君と出会ったのは、計算外だった。いい意味で|{t}……君が生きているなら、それでいい|{t}……最後に見るのが君で、よかった'),
    free: L('{t}……ねえ、楽しかったね|{t}……あたしのこと、忘れないでよ|{t}……また、どこかで'),
    shy: L('{t}……ずっと、そばにいたかった……|{t}……あのね……ありがとう……|{t}……泣かないで……'),
    polite: L('{t}……あなたにお会いできて、本当によかった|{t}……どうか、お幸せに|{t}……ありがとうございました。……さようなら')
  };
  /* 手を下したのが、想う相手だったとき */
  var LW_BETRAY = L('{t}……どうして……|{t}……お前に、なら……|{t}……それでも、恨めないんだ|{t}……そっか。お前だったんだ');
  /* 全年齢では荒い言い回しを和らげる */
  var SOFT = [[/くそ、/g, 'ああ、'], [/ざまあねえな/g, 'かっこ悪いな']];
  function soften(q) { if (!safe()) return q; SOFT.forEach(function (r) { q = q.replace(r[0], r[1]); }); return q; }

  var KIND_SUI = /自ら|命を絶|身を投げ|自害|自分で終わら/, KIND_SAC = /身代わり|かば|庇|盾に|囮|犠牲|生贄|守って|守ろう|足止め/, KIND_DIS = /病|感染|衰弱|飢え|凍え|熱が|発作|寒さ|渇き|脱水|老い|酸素|咳/, KIND_KILL = /刺|撃|殴|斬|噛|襲|殺|銃|刃|致命傷|首を|処刑|手で|絞め|突き落|毒を盛/;
  P_kind.KINDS = ['kill', 'accident', 'sacrifice', 'suicide', 'disease'];
  function P_kind(how, killer) {
    var s = String(how || '');
    if (KIND_SUI.test(s)) return 'suicide';
    if (KIND_SAC.test(s)) return 'sacrifice';
    if (killer || KIND_KILL.test(s)) return 'kill';
    if (KIND_DIS.test(s)) return 'disease';
    return 'accident';
  }
  /* 言葉の宛先：恋人 → 本命 → 執着の相手 → いちばん心を寄せた相手（生きている人だけ） */
  function tieHas(ctx, a, b, re) {
    if (!HK.Ties || !ctx.ties) return false;
    try { return HK.Ties.all(ctx, a, b).some(function (t) { return re.test(t.type); }); } catch (e) { return false; }
  }
  function addressee(ctx, v) {
    var C = (ctx.chars || []).filter(function (o) { return o !== v && o.alive !== false && !o.out; });
    if (!C.length) return null;
    var lov = C.filter(function (o) { return ctx.pair(v, o).couple || tieHas(ctx, v, o, /^(?:lover|spouse|mate|fated)$/); })[0];
    if (lov) return { c: lov, why: 'lover' };
    if (v.honmei != null && ctx.chars[v.honmei] && C.indexOf(ctx.chars[v.honmei]) >= 0) return { c: ctx.chars[v.honmei], why: 'honmei' };
    var ob = C.filter(function (o) { return (v.flags && v.flags.cagePair === o.i) || tieHas(ctx, v, o, /^yan$/); })[0];
    if (ob) return { c: ob, why: 'obsess' };
    var best = null, bv = 55;
    C.forEach(function (o) { var r = ctx.R(v, o); if (r && r.aff > bv) { bv = r.aff; best = o; } });
    return best ? { c: best, why: 'close' } : null;
  }
  function compose(v, kind, to, killer, key) {
    var a = att(v), q;
    if (to && killer && to === killer) q = pickH(LW_BETRAY, key + '|b');
    else if (to && hash(key + '|to') < 0.5) q = pickH(LW_TO[a], key + '|t');
    else q = pickH((LW[kind] || LW.accident)[a], key + '|k');
    q = q.replace(/\{to\}/g, to ? to.name + '、' : '').replace(/\{t\}/g, to ? to.name + '、' : '');
    return soften(q);
  }
  var X = HK.Epilogue = { LW: LW, LW_TO: LW_TO, LW_BETRAY: LW_BETRAY, kind: P_kind, hash: hash };
  X.last = function (ctx, c, how, killer) {
    if (!ctx || !c) return null;
    var kind = P_kind(how, killer), ad = addressee(ctx, c), to = ad ? ad.c : null;
    var q = compose(c, kind, to, killer, (ctx.seed || 0) + '|' + c.name + '|' + (ctx.stepIndex || 0));
    return { q: q, kind: kind, to: to ? to.i : null, line: c.name + '「' + q + '」' };
  };
  /* Ctx.kill を包む：最期の言葉を立て、死の記録に 60% で足す */
  var kill1 = Ctx.prototype.kill;
  Ctx.prototype.kill = function (v, killer, how) {
    var was = !!(v && v.alive);
    var r = kill1.apply(this, arguments);
    if (was && v.alive === false && !v.lastWords) {
      var lw = null;
      try { lw = X.last(this, v, how, killer); } catch (e) { lw = null; }
      if (lw) {
        v.lastWords = lw.line; v.lastTo = lw.to; v.lastKind = lw.kind;
        var pd = this.pending && this.pending[this.pending.length - 1];
        if (pd && pd.kind === 'death' && pd.actors && pd.actors[0] === v && hash((this.seed || 0) + '|lw|' + v.i) < 0.6) {
          pd.text += '　――' + v.name + 'が最期に遺した言葉：「' + lw.q + '」';
          v.lastLogged = true;
        }
      }
    }
    return r;
  };
  /* 結果のまとめ（HK.Emo.summary から）：最期の言葉は住人の覚え書きにも載せる（口調の仕上げを通すため） */
  X.summary = function (ctx, chars) {
    (ctx.chars || []).forEach(function (c, k) {
      var s = chars[k];
      if (!s || !c.lastWords) return;
      s.lastWords = c.lastWords; s.lastTo = c.lastTo; s.lastKind = c.lastKind;
      if (Array.isArray(s.notes)) s.notes.push('最期の言葉：' + c.lastWords);
    });
  };

  /* ---------- 「その後」 ---------- */
  var PLACE = { island: 'あの島', zombie: 'あの街', classroom: 'あの教室', goukon: 'あの店', whiteroom: 'あの部屋', omega: 'あの街', br: 'あの島', trial: 'あの施設', jashin: 'あの村', yakata: 'あの館', ship: 'あの船', jinro: 'あの村' };
  var AF = {
    live: {
      proud: L('{a}は相変わらず偉そうな口をきいていたが、{p}の話になると少しだけ黙った。|{a}は「あんなの大したことなかった｜＝｜あんなの大したことなかったです」と言い張り続けた。|{a}は前よりほんの少しだけ、人の話を聞くようになった。'),
      stern: L('{a}は{p}でのことを教訓として胸に刻み、以前にも増して自分を律した。|{a}は毎朝同じ時間に起き、同じように一日を始めた。それが{a}なりの区切りだった。|{a}は多くを語らなかったが、{p}で学んだことを忘れなかった。'),
      tsun: L('{a}は「別に、いい思い出なんかじゃない｜＝｜別に、いい思い出なんかじゃありません」と言いながら、{p}の話を何度も持ち出した。|{a}はそっけない態度のまま、それでも皆との連絡を絶やさなかった。|{a}は素直じゃないまま、少しだけ素直になった。'),
      gentle: L('{a}はいつもの穏やかさで、{p}でのことを笑い話に変えていった。|{a}は、{p}で出会った人たちのことを、今も大切に思っている。|{a}の周りには、変わらず人が集まった。'),
      devoted: L('{a}は誰かの役に立てたことを、前よりも少しだけ誇らしく思えるようになった。|{a}は{p}で世話になった人たちに、一人ずつ手紙を書いた。|{a}は相変わらず人のために走り回っていたが、自分を休ませることも覚えた。'),
      cool: L('{a}は{p}での出来事を、自分なりに整理して書き残した。|{a}は以前と同じ顔で日常に戻った。ただ、人を見る目は少し変わった。|{a}は「合理的じゃなかったけど、悪くなかった｜合理的ではなかったが、悪くなかった｜合理的ではありませんでしたが、悪くなかったです」と振り返った。'),
      free: L('{a}は{p}でのことを、会う人ごとに面白おかしく話して回った。|{a}は次の楽しいことを探して、もう走り出していた。|{a}は変わらず自由気ままだったが、{p}でのことだけは大事にしまっていた。'),
      shy: L('{a}は{p}でのことを思い出すたび、少しだけ勇気が出るようになった。|{a}は小さな声のままだったが、言いたいことは言えるようになった。|{a}は{p}でのことを、そっと日記に書き留めた。'),
      polite: L('{a}は以前と変わらぬ丁寧さで、{p}で関わった人たちに礼を尽くした。|{a}は「良い経験をさせていただきました」と、穏やかに微笑んだ。|{a}の物腰は変わらなかったが、その目には前にはなかった強さがあった。')
    },
    escape: {
      proud: L('{a}は{p}を出たあと、二度と振り返らなかった。少なくとも、そう見せていた。|{a}は生き延びたことを、自分の腕のおかげだと言い張った。|{a}は外の世界に戻っても、しばらくは壁を背にして眠った。'),
      stern: L('{a}は{p}を出たその日から、元の暮らしを淡々と取り戻していった。|{a}は生き延びた者の務めとして、{p}で起きたことを正確に書き残した。|{a}は{p}を出たあとも、出口の位置を確かめる癖が抜けなかった。'),
      tsun: L('{a}は「もう二度と御免だから｜もう二度と御免だ｜もう二度と御免ですから」と言いながら、{p}のあった方角をときどき見ていた。|{a}は出てこられたことを、誰にも感謝しなかった。心の中では、何度もしていた。|{a}は外に出てすぐ、強がりを言う相手がそばにいないことに気づいた。'),
      gentle: L('{a}は{p}を出たあと、ゆっくり時間をかけて日常に戻っていった。|{a}は外の光の中で、「帰ってこられたね｜帰ってこられたな｜帰ってこられましたね」と小さく笑った。|{a}は{p}から持ち帰った小さなものを、ずっと手元に置いている。'),
      devoted: L('{a}は{p}を出たあとも、残してきた人たちのことを考え続けた。|{a}は助けてくれた人たちに恩を返す方法を、ずっと探している。|{a}は帰り着いた夜、ようやく自分のために泣いた。'),
      cool: L('{a}は{p}を出たあと、起きたことを一つずつ記録にまとめた。|{a}は生還の理由を「運と判断｜運と判断だ｜運と判断です」だと短く答えた。|{a}は外に出ても、しばらく人の多い場所を避けていた。'),
      free: L('{a}は{p}を出た瞬間、大声で笑った。泣いているようにも見えた。|{a}は外に出たその足で、食べたかったものを片っ端から食べに行った。|{a}は「次はもっと楽しいところがいい｜＝｜次はもっと楽しいところがいいです」と言って、空を見上げた。'),
      shy: L('{a}は{p}を出たあと、しばらく誰とも話せなかった。それでも、生きていた。|{a}は外の世界の音に、少しずつ慣れていった。|{a}は帰り道、何度も後ろを振り返った。'),
      polite: L('{a}は{p}を出たあと、関わった人たちに一人ずつ礼を伝えて回った。|{a}は「おかげさまで｜＝｜おかげさまで」と頭を下げ、元の暮らしに戻っていった。|{a}は外に出てからも、{p}で出会った人たちのことを折に触れて思い出した。')
    },
    dead: {
      proud: L('{a}の強気な笑い方を、残された者たちは何度も思い出した。|{a}がいたら何と言ったか――皆、ときどきそれを口にした。|{a}の名前が出るたび、誰かが「あいつらしい｜＝｜あの人らしいです」と苦笑した。'),
      stern: L('{a}の残した言葉を、残された者たちは指針のように大切にした。|{a}が最後まで守ろうとしたものは、確かに誰かに受け継がれた。|{a}の几帳面な字の書き置きは、今も誰かの手元にある。'),
      tsun: L('{a}が素直に言えなかった気持ちは、残された者たちのほうがよく分かっていた。|{a}の憎まれ口が聞こえない静けさに、皆はなかなか慣れなかった。|{a}が隠していた優しさを、皆はあとになって一つずつ知った。'),
      gentle: L('{a}の穏やかな笑顔は、残された者たちの心に長く残った。|{a}のことを思い出すと、なぜか皆、少しだけ優しくなれた。|{a}がいた場所には、いつも誰かが花を置いた。'),
      devoted: L('{a}が尽くしてくれたことを、残された者たちは決して忘れなかった。|{a}の「大丈夫ですか」という声を、皆は何度も思い出した。|{a}が守ろうとした人たちは、{a}の分まで生きようと決めた。'),
      cool: L('{a}の冷静な言葉は、残された者たちが迷ったときの道しるべになった。|{a}が最後に何を考えていたのか、誰にも分からなかった。|{a}の不在は、皆が思っていたよりずっと大きかった。'),
      free: L('{a}の笑い声が聞こえない日々は、ひどく静かだった。|{a}がやりたがっていたことを、残された者たちは代わりに一つずつ叶えた。|{a}のことを話すとき、皆は泣きながら笑った。'),
      shy: L('{a}が小さな声で言っていたことを、皆はあとになって大切に思い出した。|{a}がそっと残したものを、誰かが今も大事に持っている。|{a}のことを、残された者たちはもっと知りたかったと思った。'),
      polite: L('{a}の丁寧な言葉遣いを、残された者たちは懐かしく思い出した。|{a}の礼儀正しいお辞儀を、皆はいつまでも覚えていた。|{a}に返しきれなかった礼を、皆はそれぞれの形で返そうとした。')
    },
    caged: {
      proud: L('{a}は閉じ込められたまま、それでも屈したふりだけはしなかった。|{a}の強がりは、扉の向こうで少しずつ削られていった。|{a}は、いつか必ず出てやると、毎晩自分に言い聞かせた。'),
      stern: L('{a}は閉ざされた部屋で、日付を数えることだけはやめなかった。|{a}は屈せず、ただ静かに機会を待ち続けた。|{a}は自分を保つために、決まった時間に決まったことを繰り返した。'),
      tsun: L('{a}は閉じ込められた部屋で、「平気だから｜平気だ｜平気ですから」と誰にともなく言い続けた。|{a}は差し出される食事を、意地で半分だけ残した。|{a}は泣き言を言わなかった。言えば、負けだと思った。'),
      gentle: L('{a}は閉じ込められたまま、それでも相手に穏やかに話しかけ続けた。|{a}は窓の外の空を見ることを、一日の楽しみにしていた。|{a}の笑顔は、少しずつ薄くなっていった。'),
      devoted: L('{a}は閉じ込められたまま、外の皆が無事でいることだけを願った。|{a}は相手の機嫌をうかがうことに、すっかり慣れてしまった。|{a}は、いつか誰かが迎えに来てくれると信じていた。'),
      cool: L('{a}は閉じ込められた部屋で、逃げ道を探し続けた。|{a}は相手の行動の癖を、ひとつ残らず覚えていった。|{a}は感情を殺し、時を待った。'),
      free: L('{a}は閉じ込められた部屋で、壁に落書きをして日々をやり過ごした。|{a}の明るさは、閉ざされた日々の中で少しずつ失われた。|{a}は外の風の匂いを、何度も夢に見た。'),
      shy: L('{a}は閉じ込められた部屋の隅で、小さくなって過ごした。|{a}は声を上げることもできず、ただ扉の音に怯えていた。|{a}は、外にいる誰かの名前を、毎晩そっと呼んだ。'),
      polite: L('{a}は閉じ込められたまま、礼儀正しさだけは決して手放さなかった。|{a}は丁寧な言葉で、毎日同じお願いを繰り返した。|{a}は静かに、自分が誰であったかを忘れないようにしていた。')
    },
    fallen: {
      proud: L('{a}はすっかり牙を抜かれ、かつての強気は見る影もなかった。|{a}は、あの日々を忘れられなくなったことを、誰にも言えなかった。|{a}は強がりを言いかけては、途中でやめるようになった。'),
      stern: L('{a}が守ってきた規律は、あの日を境に崩れたままだった。|{a}は自分を律する言葉を、もう思い出せなかった。|{a}はかつての自分を恥じながら、それでも元には戻れなかった。'),
      tsun: L('{a}はもう、意地を張ることさえしなくなった。|{a}は「違う｜＝｜違います」と言いかけては、黙ってうつむいた。|{a}の素直さは、望んだのとは違う形で手に入ってしまった。'),
      gentle: L('{a}は穏やかに微笑んだまま、どこか遠くを見るようになった。|{a}は、あの日々のことを、懐かしむような目で語った。|{a}の柔らかさは、前とは違う色を帯びていた。'),
      devoted: L('{a}は尽くす相手を、すっかり取り違えてしまっていた。|{a}は今も、あの声に呼ばれるのを待っている。|{a}は、自分が何を望んでいるのか分からなくなっていた。'),
      cool: L('{a}は自分に何が起きたのかを分析しようとして、そのたびに考えるのをやめた。|{a}の冷静さは、ある一点でだけ、もう働かなくなっていた。|{a}は理屈では割り切れないものを、抱えたまま生きることにした。'),
      free: L('{a}はあの日々を、むしろ楽しかったと笑って話した。|{a}は前よりずっと奔放になり、周りを戸惑わせた。|{a}は、もう一度あの場所に行きたいと、こっそり口にした。'),
      shy: L('{a}は、あの日々のことを思い出しては、ひとりで顔を赤くしていた。|{a}は前よりもっと無口になり、何かを隠すように過ごした。|{a}は、誰にも言えない秘密をひとつ抱えて生きることになった。'),
      polite: L('{a}は変わらず丁寧な言葉を使ったが、その目は前とは違っていた。|{a}は「もう、元には戻れません」と、静かに微笑んだ。|{a}は品のよさを保ったまま、あの日々の名残りを抱えていた。')
    }
  };
  /* 関係の結び（{b}＝相手） */
  var REL = {
    with: L('隣には、いつも{b}がいた。|{b}と並んで歩く姿が、よく見かけられた。|{b}とは、今も変わらず一緒にいる。'),
    lost: L('{b}のいない日々に、まだ慣れることはできなかった。|ふとした瞬間に、{b}の名前を呼びそうになった。|{b}の分まで生きる――それだけを支えにしていた。'),
    deadWith: L('{b}は、今も{a}のことを想い続けている。|{b}は{a}の残したものを、何ひとつ捨てられなかった。|{b}は毎年、{a}を想う日を一日だけ作った。')
  };
  /* 気分の結び（一人のとき。気分の最終値から） */
  var MOOD = {
    calm: L('日々は静かに、元の形を取り戻した。|何もかもが、穏やかに過ぎていった。|それで十分だと、{a}は思った。'),
    joy: L('思い出すたびに、自然と笑みがこぼれた。|その顔は、いつも晴れやかだった。|楽しかった――それが、いちばん素直な感想だった。'),
    grief: L('ただ、ときどき遠くを見る目をした。|心の傷が癒えるには、まだ時間がかかりそうだった。|笑えるようになるまで、長い時間がかかった。'),
    fear: L('夜中にふと目を覚ます癖だけは、抜けなかった。|物音に振り返る癖が、しばらく残った。|安心して眠れるようになるまで、少し時間がかかった。'),
    anger: L('許せないことが、ひとつだけ残っていた。|あのときの悔しさは、まだ消えていなかった。|胸の中の怒りを、うまく手放せずにいた。'),
    shame: L('あのときの自分を、まだ少し恥じていた。|思い出すと、今でも顔が熱くなった。|自分のしたことを、誰にも打ち明けられずにいた。')
  };
  /* 組ごと（{a}{b}。片想いは {x}→{y}） */
  var PAIR = {
    love: L('{a}と{b}は、その後も並んで歩いていた。|{a}と{b}は、あの日のことを二人だけの思い出にした。|{a}と{b}は、今も変わらず互いの隣にいる。'),
    pining: L('{a}と{b}は、その後も互いの言葉を待ち続けた。|{a}と{b}は、何度目かに会ったとき、ようやく同じことを言いかけた。|{a}と{b}の距離は、近いまま、まだ縮まりきらなかった。'),
    oneway: L('{x}は、{y}への想いをそっと抱えたまま過ごした。|{x}は今も、{y}の姿を目で追ってしまう。|{x}の想いが{y}に届く日が来るのかは、まだ分からない。'),
    night: L('{a}と{b}は、名前のない関係のまま、ときどき会った。|{a}と{b}は、あの夜のことに触れないまま、それでも連絡を絶たなかった。|{a}と{b}の関係に名前がつくのは、もう少し先のことになりそうだった。'),
    apart: L('{a}と{b}は、別々の道を歩き始めた。|{a}と{b}は、すれ違っても会釈だけで済ませるようになった。|{a}と{b}が元に戻ることは、なかった。'),
    rival: L('{a}と{b}は、顔を合わせるたびに火花を散らした。|{a}と{b}は、互いを意識しながら、決して歩み寄らなかった。|{a}と{b}の因縁は、まだ終わっていなかった。'),
    friend: L('{a}と{b}は、その後も気の置けない仲だった。|{a}と{b}は、困ったときに真っ先に連絡し合う仲になった。|{a}と{b}は、ときどき集まっては、あの日々の話をした。'),
    obsess: L('{a}と{b}の関係は、どこか歪んだまま続いた。|{a}と{b}は、離れようとしても、結局また引き寄せられた。|{a}と{b}のあいだにあるものを、周りの誰も言い当てられなかった。'),
    /* 腐れ縁（愛憎。hate-love.js）：双方は {a}{b}、片方だけは {x}（愛憎を持つ側）→{y} */
    kusare: L('{a}と{b}は、その後も顔を合わせるたびに憎まれ口を叩き合った。それでも、どちらも相手から離れようとはしなかった。|{a}と{b}は、二度と顔も見たくないと言い合った翌日に、また同じ場所で鉢合わせた。|{a}と{b}の喧嘩は、今もどこかで続いている。周りはもう、止めようともしなかった。'),
    kusare1: L('{x}は今も、{y}の顔を見るたびに悪態をつく。それでいて、{y}の姿が見えないと、なぜか落ち着かなかった。|{x}は、{y}のことなど嫌いだと言い続けた。言い続けるために、何度でも{y}に会いに行った。|{x}が{y}に向ける嫌味は、相変わらず手厳しかった。{y}がそれに慣れてしまったことだけが、{x}には少し不満だった。')
  };
  var PAIR_TINT = {
    joy: L('二人とも、よく笑うようになった。|二人の笑い声が、よく聞こえた。'),
    grief: L('二人のあいだには、まだ消えない悲しみがあった。|二人とも、失ったもののことは口にしなかった。'),
    anger: L('二人のあいだのわだかまりは、すぐには消えなかった。|ときどき、言葉がとげを帯びた。'),
    fear: L('二人とも、あの日の怖さをまだ忘れられずにいた。|二人は、互いが無事であることを何度も確かめ合った。'),
    shame: L('二人とも、あのときのことになると目をそらした。|二人は、あの日のことを笑い話にはできずにいた。')
  };
  var LABEL_G = { lovers: 'love', bonded: 'love', fatedmate: 'love', mated: 'love', pining: 'pining', oneway: 'oneway', night: 'night', vague: 'night', fwbsettle: 'night', breakup: 'apart', fwbend: 'apart', allybreak: 'apart', rivals: 'rival', dislike: 'rival', kinfeud: 'rival', lovehate: 'rival', kusare: 'kusare', kusare1: 'kusare1', awkward: 'apart', friends: 'friend', partners: 'friend', kinbond: 'friend', accomplice: 'friend', guard: 'friend', obsess: 'obsess' };
  var CLS_G = { love: 'love', pine: 'pining', night: 'night', enemy: 'rival', partner: 'friend', friend: 'friend', guard: 'friend', obsess: 'obsess' };
  X.AF = AF; X.REL = REL; X.MOOD = MOOD; X.PAIR = PAIR;
  var GONE = /連れ去|行方不明|神隠し|消えた|取り残|流され|姿をくらま|逃亡|逮捕|取り押さえ|濡れ衣/, CAGED = /監禁|囚われ|閉じ込め|幽閉/, FALLEN = /堕ち|陥落|虜|巫女になった|従者|眷属|堕とされ/, ESC = /脱出|救助|生還|帰還|逃げ延び|街を出|島を出|抜け出|助けを呼びに|イカダ|生き延び/;
  function fateCat(c) {
    var f = String(c.fate || '');
    if (c.alive === false) return 'dead';
    if (c.caged || CAGED.test(f)) return 'caged';
    if (FALLEN.test(f)) return 'fallen';
    if (GONE.test(f)) return '';
    if (ESC.test(f)) return 'escape';
    return 'live';
  }
  X.fateCat = fateCat;
  function topMood(e, th) {
    if (!e) return 'calm';
    var best = 'calm', bv = th;
    ['joy', 'grief', 'fear', 'anger', 'shame', 'lust'].forEach(function (k) { if (k === 'lust' && safe()) return; if (e[k] != null && e[k] >= bv) { bv = e[k]; best = k; } });
    return best;
  }
  function fill(t, m) { return String(t).replace(/\{(\w+)\}/g, function (x, k) { return m[k] != null ? m[k] : x; }); }
  /* 関係：恋人がいる（with）／失った（lost）／一人（alone） */
  function relOf(res, c) {
    var C = res.chars || [];
    if (c.lossOf != null && C[c.lossOf] && C[c.lossOf].alive === false) return { k: 'lost', b: C[c.lossOf] };
    var lov = null, lost = null;
    (res.pairs || []).forEach(function (p) {
      if (p.a !== c.i && p.b !== c.i) return;
      var o = C[p.a === c.i ? p.b : p.a], g = LABEL_G[p.label] || CLS_G[p.cls];
      if (!o) return;
      if (g === 'love' || (p.tie && /^(?:lover|spouse|mate|fated)$/.test(p.tie.type) && g !== 'apart' && g !== 'rival')) { if (o.alive === false) lost = lost || o; else if (/^(?:live|escape)$/.test(fateCat(o))) lov = lov || o; }
      else if (o.alive === false && (g === 'pining' || (g === 'oneway' && p.dir === c.i))) lost = lost || o;
    });
    if (lov) return { k: 'with', b: lov };
    if (lost) return { k: 'lost', b: lost };
    return { k: 'alone', b: null };
  }
  X.after = function (res, c, used) {
    if (!res || !c) return '';
    var fc = fateCat(c);
    if (!fc) return '';
    var a = att(c), seed = String(res.seed != null ? res.seed : ''), p = PLACE[res.scenId] || 'あの場所';
    var base = pickU(AF[fc][a], seed + '|' + c.name + '|' + fc, used), rel = relOf(res, c), tail = '';
    var m = { a: c.name, p: p, b: rel.b ? rel.b.name : '' };
    if (fc === 'dead') { if (rel.k === 'with') tail = pickU(REL.deadWith, seed + c.name + 'dw', used); }
    else if (fc === 'live' || fc === 'escape') {
      if (rel.k === 'lost') tail = pickU(REL.lost, seed + c.name + 'l', used);
      else if (rel.k === 'with') tail = pickU(REL.with, seed + c.name + 'w', used);
      else {
        var md = topMood(c.emo, 20);
        if (md === 'lust') tail = HK.Emo && HK.Emo.AFTER_LUST ? pickU(HK.Emo.AFTER_LUST, seed + c.name + 'm', used) : '';
        else if (md !== 'calm' || !(res.chars || []).some(function (o) { return o.alive === false; })) tail = pickU(MOOD[md] || MOOD.calm, seed + c.name + 'm', used);
      }
    }
    return fill(base + tail, m);
  };
  X.pairAfter = function (res, p, used) {
    var C = res.chars || [], A = C[p.a], B = C[p.b];
    if (!A || !B) return '';
    var g = LABEL_G[p.label] || CLS_G[p.cls];
    if (!g || !PAIR[g]) return '';
    var seed = String(res.seed != null ? res.seed : ''), x = p.dir === p.b ? B : A, y = x === A ? B : A;
    var t = pickU(PAIR[g], seed + '|' + A.name + B.name + g, used);
    var ma = topMood(A.emo, 25), mb = topMood(B.emo, 25), tint = '';
    var tk = ma === 'grief' || mb === 'grief' ? 'grief' : ma === 'anger' || mb === 'anger' ? 'anger' : ma === 'fear' || mb === 'fear' ? 'fear' : ma === 'shame' && mb === 'shame' ? 'shame' : ma === 'joy' && mb === 'joy' ? 'joy' : '';
    if (tk && PAIR_TINT[tk]) tint = pickU(PAIR_TINT[tk], seed + A.name + B.name + tk, used);
    return fill(t + tint, { a: A.name, b: B.name, x: x.name, y: y.name });
  };
  var MAXL = 8;
  /* E.lines にすでにある「〇〇のその後――」「〇〇と〇〇のその後――」の人 */
  function covered(res, E) {
    var C = res.chars || [], done = {};
    var byName = {};
    C.forEach(function (c) { byName[c.name] = c.i; if (c.afterDone || /その後は「/.test(c.fateNote || '')) done[c.i] = 1; });
    (E.lines || []).forEach(function (l) {
      if (typeof l !== 'string') return;
      var m = l.match(/^(.+?)のその後――/);
      if (!m) return;
      var who = m[1];
      if (byName[who] != null) { done[byName[who]] = 1; return; }
      C.forEach(function (c) { if (who.indexOf(c.name) >= 0) done[c.i] = 1; });
    });
    return done;
  }
  X.build = function (res, E) {
    if (!res || !E || !Array.isArray(E.lines) || !Array.isArray(res.chars) || res.solo) return E;
    try {
      var C = res.chars, done = covered(res, E), out = [], used = {};
      /* 組ごと：両方が生きている恋人・強い関係（強さの順に、恋人は優先） */
      var pairs = (res.pairs || []).filter(function (p) {
        var A = C[p.a], B = C[p.b];
        return A && B && A.alive !== false && B.alive !== false && !done[p.a] && !done[p.b] && (LABEL_G[p.label] || CLS_G[p.cls]);
      }).sort(function (x, y) { var lx = (LABEL_G[x.label] || CLS_G[x.cls]) === 'love' ? 1 : 0, ly = (LABEL_G[y.label] || CLS_G[y.cls]) === 'love' ? 1 : 0; return (ly - lx) || (y.intensity - x.intensity); });
      var np = 0;
      pairs.forEach(function (p) {
        if (done[p.a] || done[p.b] || out.length >= MAXL) return;
        var g = LABEL_G[p.label] || CLS_G[p.cls];
        if (g !== 'love' && np >= 2) return;
        var t = X.pairAfter(res, p, used);
        if (!t) return;
        done[p.a] = done[p.b] = 1; np++;
        out.push(C[p.a].name + 'と' + C[p.b].name + 'のその後――' + t);
      });
      /* 一人ずつ：亡くなった人を先に */
      var rest = C.filter(function (c) { return !done[c.i]; });
      rest.sort(function (x, y) { return (x.alive === false ? 0 : 1) - (y.alive === false ? 0 : 1) || x.i - y.i; });
      rest.forEach(function (c) {
        if (out.length >= MAXL) return;
        var t = X.after(res, c, used);
        if (t) { out.push(c.name + 'のその後――' + t); c.afterDone = true; }
      });
      out.forEach(function (l) { E.lines.push(l); });
      /* 最期の言葉（口調の仕上げを通った、住人の覚え書きの行から） */
      var last = [];
      C.forEach(function (c) {
        if (!c.lastWords) return;
        var nt = (c.notes || []).filter(function (n) { return typeof n === 'string' && n.indexOf('最期の言葉：') === 0; })[0];
        last.push({ i: c.i, name: c.name, text: nt ? nt.slice(6) : c.lastWords, at: c.deathLabel || '' });
      });
      if (last.length) {
        var order = {};
        (res.log || []).forEach(function (e, n) { if (e && e.kind === 'death' && e.actors && order[e.actors[0]] == null) order[e.actors[0]] = n; });
        last.sort(function (x, y) { return (order[x.i] == null ? 1e9 : order[x.i]) - (order[y.i] == null ? 1e9 : order[y.i]); });
        E.last = last;
      }
    } catch (e) { /* 後日談の組み立てに失敗しても、結末は出す */ }
    return E;
  };
  X.html = function (E, res, paint) {
    if (!E || !E.last || !E.last.length) return '';
    var esc = HK.escape || function (s) { return String(s); }, P = paint || function (t) { return esc(t); };
    return '<div class="elast"><div class="eyebrow" style="margin-top:12px">最期の言葉</div><ul class="elines">' +
      E.last.map(function (x) { return '<li>' + (x.at ? '<span class="nums" style="color:var(--muted)">' + esc(x.at) + '</span>　' : '') + P(x.text, res) + '</li>'; }).join('') + '</ul></div>';
  };

  /* ---------- 物語型（HK.Story.result から） ---------- */
  var STORY_LW = { jashin: 1, yakata: 1, ship: 1, jinro: 1 };
  function storyAddressee(S, p, input) {
    var P = S.P, live = function (q) { return q && q !== p && q.alive !== false && !q.out && !q.gone && !q.taken; };
    var ts = (input && input.ties) || [];
    for (var k = 0; k < ts.length; k++) {
      var t = ts[k];
      if (!/^(?:lover|spouse|mate|fated)$/.test(t.type)) continue;
      var o = t.a === p.i ? P[t.b] : t.b === p.i ? P[t.a] : null;
      if (live(o)) return o;
    }
    if (p.honmei != null && live(P[p.honmei])) return P[p.honmei];
    for (k = 0; k < ts.length; k++) { var t2 = ts[k]; if (t2.type === 'yan' && t2.a === p.i && live(P[t2.b])) return P[t2.b]; }
    if (S.bondFn) {
      var best = null, bv = 0.55;
      P.forEach(function (q) { if (!live(q)) return; var v = 0; try { v = S.bondFn(S, p, q); } catch (e) { v = 0; } if (v > bv) { bv = v; best = q; } });
      return best;
    }
    return null;
  }
  function storyRel(S, p, input) {
    var P = S.P, ts = (input && input.ties) || [], lov = null, lost = null;
    ts.forEach(function (t) {
      if (!/^(?:lover|spouse|mate|fated)$/.test(t.type)) return;
      var o = t.a === p.i ? P[t.b] : t.b === p.i ? P[t.a] : null;
      if (!o || o === p) return;
      if (o.alive === false) lost = lost || o; else if (/^(?:live|escape)$/.test(fateCat({ alive: true, fate: o.fate || '', caged: !!o.bound }))) lov = lov || o;
    });
    return lov ? { k: 'with', b: lov } : lost ? { k: 'lost', b: lost } : { k: 'alone', b: null };
  }
  X.story = function (S, res, input) {
    if (!S || !res || !S.scen) return;
    if (HK.Emo && HK.Emo.storySummary) HK.Emo.storySummary(S, res);
    if (res.heroes && S.P) S.P.forEach(function (p, k) { if (p && p.alive === false && res.heroes[k]) res.heroes[k].dead = true; });
    if (!STORY_LW[S.scen.id] || !res.ending || !Array.isArray(res.ending.lines)) return;
    try {
      var P = S.P, key0 = P.map(function (p) { return p.name; }).join(',') + '|' + (input && input.seed);
      var dead = P.filter(function (p) { return p && p.alive === false; });
      dead.sort(function (x, y) { return (x._emoDeathN == null ? 1e9 : x._emoDeathN) - (y._emoDeathN == null ? 1e9 : y._emoDeathN); });
      var lastL = [];
      dead.forEach(function (p) {
        var how = (p.how || '') + ' ' + (p.fate || ''), kind = P_kind(how, null), to = storyAddressee(S, p, input);
        var q = compose(p, kind, to, null, key0 + '|' + p.name);
        p.lastWords = p.name + '「' + q + '」';
        var line = p.name + 'が最期に遺した言葉：「' + q + '」';
        if (p._emoDeathN != null && S.log[p._emoDeathN] && typeof S.log[p._emoDeathN].text === 'string' && hash(key0 + '|lw|' + p.i) < 0.6) S.log[p._emoDeathN].text += '　――' + line;
        if (lastL.length < 3) lastL.push(line);
        var h = res.heroes && res.heroes[p.i];
        if (h) h.lastWords = p.lastWords;
      });
      lastL.forEach(function (l) { res.ending.lines.push(l); });
      /* 一人ずつの「その後」（結末の行にもう「〇〇のその後」がある人は飛ばす） */
      var done = {};
      res.ending.lines.forEach(function (l) { if (typeof l !== 'string') return; var m = l.match(/^(.+?)のその後――/); if (m) P.forEach(function (p) { if (m[1].indexOf(p.name) >= 0) done[p.i] = 1; }); });
      var fake = { scenId: S.scen.id, seed: input && input.seed, chars: [], pairs: [] };
      var used = {}, n = 0, order = P.slice().sort(function (x, y) { return (x.alive === false ? 0 : 1) - (y.alive === false ? 0 : 1) || x.i - y.i; });
      order.forEach(function (p) {
        if (!p || done[p.i] || n >= MAXL) return;
        var c = { i: p.i, name: p.name, persona: p.persona, tone: p.tone, fate: p.fate || '', alive: p.alive !== false && !p.dead, emo: p.emo || null, caged: !!p.bound };
        var fc = fateCat(c);
        if (!fc) return;
        var a = att(c), seed = String(fake.seed != null ? fake.seed : ''), pl = PLACE[fake.scenId] || 'あの場所', rel = storyRel(S, p, input);
        var base = pickU(AF[fc][a], seed + '|' + c.name + '|' + fc, used), tail = '';
        if (fc === 'dead') { if (rel.k === 'with') tail = pickU(REL.deadWith, seed + c.name + 'dw', used); }
        else if (fc === 'live' || fc === 'escape') {
          if (rel.k === 'lost') tail = pickU(REL.lost, seed + c.name + 'l', used);
          else if (rel.k === 'with') tail = pickU(REL.with, seed + c.name + 'w', used);
          else { var md = topMood(c.emo, 20); tail = md === 'lust' ? (HK.Emo && HK.Emo.AFTER_LUST ? pickU(HK.Emo.AFTER_LUST, seed + c.name + 'm', used) : '') : md !== 'calm' || !dead.length ? pickU(MOOD[md] || MOOD.calm, seed + c.name + 'm', used) : ''; }
        }
        res.ending.lines.push(c.name + 'のその後――' + fill(base + tail, { a: c.name, p: pl, b: rel.b ? rel.b.name : '' }));
        n++;
      });
    } catch (e) { /* 後日談の組み立てに失敗しても、結末は出す */ }
  };
  /* 物語型の最期の言葉だけを、結末より前に引く（X.story と同じ選び方なので、結末の箇条書きと同じ言葉になる。宇宙船の ship-after.js の弔い） */
  X.storyWords = function (S, p, input) {
    if (!S || !S.P || !p) return '';
    var key0 = S.P.map(function (q) { return q.name; }).join(',') + '|' + (input && input.seed);
    return compose(p, P_kind((p.how || '') + ' ' + (p.fate || ''), null), storyAddressee(S, p, input), null, key0 + '|' + p.name);
  };
})();
