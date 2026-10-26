/* 箱庭シミュレーター: 無人島 ― 恋を応援する、仲良し系の出来事（全年齢版・R18版の共通）
   設計指針：複数人が絡む恋愛の出来事は、すれ違い系（嫉妬・三角関係）と仲良し系（応援・祝福・ダブルデート）を半々くらいに。
   無人島は恋の出来事の多くがすれ違い系（嫉妬・一方通行）だったので、仲間が恋を応援する場面を足す。点検は hakoniwa-tools/tone-check/group-audit.js
   ・見張りを代わる／食べ物を多めに分ける／焚き火で二人きりにする／同じ作業に組む（想い合っている二人・恋人どうし）
   ・手作りの贈り物で祝福する／冷やかす（恋人どうし）
   ・みんなで海に入る・星を見る（二組ならダブルデート、仲間と一緒でも）／恋の相談／想いが届かなかった仲間を励ます
   {a}＝応援する仲間（恋の相手としては割り込まない）、{b}・{c}＝恋の二人。道具は rel-group.js の HK.RelGroup
   登場人物はすべて成人として扱う */
(function () {
  'use strict';
  var HK = window.HK, isl = HK.SCENARIOS && HK.SCENARIOS.island, G = HK.RelGroup;
  if (!isl || !G) return;
  var L = G.L;
  function R(ctx, a, b) { return ctx.R(a, b); }
  function ev(o) { isl.events.push(o); }
  function W(x) { return function (ctx, a) { return x + a.tr.np * 0.15 + (a.tr.warmth || 0) * 0.12; }; }
  function wish(ctx, b, not) { return G.mutualOf(ctx, b, not) || G.crushOf(ctx, b, not); }

  var T = {
    watch: L('夜の見張りの順番が{b}に回ってくると、{a}は黙って槍を取り上げた。「今夜は私が立つ。{c}のところに行ってきなよ｜今夜は私が立つ。{c}のところに行ってこい｜今夜は私が立ちます。{c}のところに行ってきてください」――{b}は何か言いかけて、結局、小さく頭を下げた。|{a}は{b}と見張りの番を代わった。焚き火のそばで{c}が待っているのを、{a}は知っていたからだ。夜明けまで海を見張りながら、{a}は時々、浜の二つの影を振り返った。|夜中、見張りに立とうとした{b}の肩を、{a}が後ろから押し戻した。「今夜は私。{c}が寒そうにしてた｜今夜は私が立つ。{c}が寒そうにしていた｜今夜は私が立ちます。{c}が寒そうにしていました」――{b}が戻っていくと、{c}は毛布の端を持ち上げて、隣を空けた。'),
    share: L('潮だまりで貝を拾ってきた{a}は、{b}と{c}の器にだけ、こっそり二つずつ多く入れた。{b}が気づいて目を上げると、{a}は唇に指を当てた。二人はその晩、肩を寄せ合って同じ火で貝を焼いた。|{a}は獲れた魚のいちばん脂の乗ったところを切り分けて、{b}と{c}の前に置いた。「二人で食べて。私はさっき味見しすぎた｜二人で食べろ。私はさっき味見をしすぎた｜お二人で食べてください。私はさっき味見をしすぎました」――もちろん嘘だった。{b}と{c}は顔を見合わせてから、一切れを{a}の口に押し込んだ。|食料が乏しい日でも、{a}は{b}と{c}の分の椰子の実を、いちばん甘そうなものから選んで取っておいた。二人が並んで実を割るのを、{a}は少し離れた岩の上から眺めていた。それだけで、空腹が少しまぎれる気がした。'),
    fire: L('その夜、{a}は大きなあくびをして、「先に寝る｜＝｜先に休みます」と言った。ほかの皆も、なぜか一斉に寝床に引き上げた。焚き火の前には、{b}と{c}だけが残された。|{a}は焚き火に太い流木を一本くべてから、「これで朝までもつ｜＝｜これで朝までもちます」と言って立ち上がった。去り際に{b}の肩をぽんと叩いた。火の粉が上がる中、{b}と{c}は少しずつ距離を詰めた。|夕食のあと、{a}は皆を誘って、浜の反対側へ流れ星を探しに行った。誘われなかった{b}と{c}は、焚き火の番として残された。戻ってきた{a}が見たのは、一枚の布にくるまって並んで眠る二人の姿だった。'),
    work: L('翌日の分担を決めるとき、{a}は{b}と{c}を薪拾いの組にした。「二人なら、遠くの森まで行ける｜二人なら、遠くの森まで行けるだろう｜お二人なら、遠くの森まで行けるでしょう」――夕方、二人は約束の倍の薪を抱えて、笑いながら戻ってきた。|{a}は、水汲みの当番表の{b}の隣に、{c}の名前を書き足した。湧き水までの道は、二人で歩くには少し長い。その日、二人が戻ってきたのは、いつもよりずいぶん遅かった。|イカダの材料を集める組を、{a}はくじ引きで決めると言った。{b}と{c}が同じ組になったのは、偶然ではなかった。くじを作ったのは{a}だった。'),
    /* 祝福の贈り物（恋人どうし／結ばれた二人） */
    gift: {
      couple: L('{a}は何日もかけて白い貝殻を二つ選び抜き、細い蔓を通して首飾りを作った。焚き火の前で、{a}はそれを{b}と{c}に一つずつ手渡した。「お揃い。島で一番いい貝だから｜揃いだ。島で一番いい貝だからな｜お揃いです。島で一番いい貝ですから」|{a}は流木を削って、二人掛けの小さな椅子を作った。拠点の端の、夕日がいちばんよく見える場所にそれを据えると、{b}と{c}を手招きした。二人が腰を下ろすと、椅子は少しだけ傾いたが、二人にはちょうどいい幅だった。|{a}は椰子の葉を編んで、{b}と{c}の寝床に小さな屋根をかけた。雨の夜、二人の寝床だけが濡れずに済んだ。翌朝、{b}と{c}は、獲れたての魚を一匹ずつ{a}に差し出した。'),
      bound: L('{b}と{c}の寝床が一つになったことに、皆とっくに気づいていた。{a}は代表して、花を編んだ冠を二つ作った。照れる二人の頭にそれを載せると、浜に小さな拍手が起きた。|{a}は海辺の岩に、{b}と{c}の名前を並べて刻んだ。「救助が来ても、これは残る｜＝｜救助が来ても、これは残ります」――{b}は黙って{a}を抱きしめ、{c}はその上から二人まとめて腕を回した。|{a}は浜で見つけた二枚貝の、ぴったり合う両側を{b}と{c}に一枚ずつ渡した。「片方だけじゃ閉じない貝。……二人みたい｜片方だけでは閉じない貝だ。……二人のようだな｜片方だけでは閉じない貝です。……お二人のようですね」――二人は貝殻を重ねて、照れくさそうに笑った。')
    },
    tease: L('朝、{b}と{c}が同じ方向から歩いてくるのを見て、{a}はにやりと笑った。「おはよう。今日も仲がよろしいことで｜おはよう。今日も仲がよろしいことだ｜おはようございます。今日も仲がよろしいことですね」――{b}は砂を蹴り、{c}は聞こえないふりをした。|{a}は、{b}と{c}が二人で編んだ不格好な籠を手に取って、しげしげと眺めた。「共同作業の成果、ってやつ？｜共同作業の成果、というやつか｜共同作業の成果、というものですか」――{b}が真っ赤になって籠を奪い返し、{c}は笑いをこらえきれずに背を向けた。{a}は、二人の籠がいちばん丈夫なのを知っていた。|浜で{b}が{c}の日焼けした背中に薬草を塗っているのを、{a}は遠くから眺めて口笛を吹いた。{b}が睨むと、{a}は両手を上げて退散した。退散しながら、{a}は二人に聞こえないくらいの声で、「よかったね｜よかったな｜よかったですね」と呟いた。'),
    /* 海・星（{a}・{b}＝恋人どうし。pair＝もう一組 {c}・{d}、group＝仲間 {c}（と {d}）） */
    sea: {
      pair: L('波の穏やかな昼下がり、{a}と{b}、{c}と{d}は、四人で海に入った。誰がいちばん遠くまで泳げるかで競争になり、結局全員で溺れかけて笑った。浜に上がると、二組はそれぞれの相手の髪から海藻を取ってやった。|浅瀬で、{a}と{b}の組と、{c}と{d}の組が、魚の手づかみ勝負をした。{b}が一匹捕まえると、{d}が負けじと二匹捕まえた。その日の夕食の魚は、いつもより少しだけ多かった。|{a}と{b}は、{c}と{d}を誘って入り江まで泳いだ。岩の上に四人で寝転がって、濡れた体を日に干した。誰からともなく、島を出たら四人でまた海に行こうという話になった。'),
      group: L('{c}が「泳ぎに行こう｜泳ぎに行くぞ｜泳ぎに行きましょう」と言い出し、{a}と{b}を海へ引っ張っていった。{c}は二人に思い切り水をかけてから、さっさと沖へ逃げた。{a}と{b}は顔を見合わせて、二人がかりで{c}を追いかけた。|暑い昼下がり、{c}は{a}と{b}を誘って浅瀬に入った。{c}は潜って拾ってきたきれいな貝を、黙って{b}に渡した。それから{c}は、「{a}に渡しなよ｜{a}に渡せ｜{a}に渡してください」と目配せした。{b}は照れながら、それを{a}の手のひらに載せた。|{a}と{b}と{c}は、三人で波打ち際を歩いた。{c}はわざと二人の数歩前を歩き、時々振り返っては、並んで歩く二人をからかった。打ち寄せる波が、三人の足跡を順番に消していった。')
    },
    stars: {
      pair: L('雲のない夜、{a}と{b}、{c}と{d}は、四人で砂浜に寝転んで星を見た。{c}が星座の名前を適当にでっち上げ、{b}がそれにさらに嘘を重ねた。笑い疲れた頃、二組はそれぞれ、相手の手を探して握っていた。|流れ星が一つ落ちた。{a}と{b}、{c}と{d}は、四人とも慌てて目を閉じた。何を願ったのかは、誰も言わなかったが、二組とも相手の顔をちらりと見ていた。|夜の浜で、{a}と{b}の組と{c}と{d}の組は、どちらが先に流れ星を見つけるかを競った。勝った{d}が{c}に抱きつき、負けた{a}と{b}は肩をすくめて笑った。夜風が冷たくなるまで、四人は空を見上げていた。'),
      group: L('{c}は{a}と{b}を誘って、浜で星を見た。三人で並んで寝転ぶと、{c}は「流れ星には、二人の分も願っとく｜流れ星には、二人の分も願っておく｜流れ星には、お二人の分も願っておきます」と言った。{a}と{b}は、空を見上げたまま、そっと指を絡めた。|夜、{c}は焚き火から少し離れた砂の上に、三人分の寝転ぶ場所をならした。{a}と{b}を真ん中に寝かせて、{c}は端に転がった。星の名前を知っている者は誰もいなかったので、三人で勝手に名前をつけた。|{a}と{b}が並んで星を見ているところに、{c}が椰子の実を三つ抱えてやってきた。「お邪魔虫の差し入れ｜邪魔者からの差し入れだ｜お邪魔虫からの差し入れです」――{a}と{b}は笑って、{c}のために間を空けた。')
    },
    soudan: L('岩場で並んで釣り糸を垂らしながら、{b}は{a}に、{c}のことを打ち明けた。{a}は浮きから目を離さずに、最後まで聞いた。魚が一匹かかったのを合図に、{a}は口を開いた。|水汲みの帰り道、{b}は重い甕を下ろして、{a}に相談を持ちかけた。{c}の隣にいると、うまく息ができないのだという。{a}は甕を半分持ってやりながら、少し考えた。|夜、寝床で背中合わせになったとき、{b}が小声で{a}を呼んだ。{c}のことが頭から離れない、と{b}は言った。{a}は寝返りを打って、{b}のほうを向いた。'),
    comfort: {
      two: L('{b}の想いが届かなかった日の夕方、{a}と{d}は{b}を岬の先まで連れ出した。三人で何も言わずに、海に沈む夕日を見た。日が沈みきったとき、{b}がぽつりと「明日も、魚を獲る｜＝｜明日も、魚を獲ります」と言った。|{a}と{d}は、その晩の焚き火で、{b}の好物の貝ばかり焼いた。{b}は、食べきれないほどの貝の山を前に、少しだけ笑った。その夜、三人は火が消えるまで並んで座っていた。|翌朝、{b}が目を覚ますと、寝床の横に、{a}と{d}が集めてきた色とりどりの貝殻が並んでいた。砂の上には、拙い字で「＠＠元気出せ」と書いてあった。{b}は貝殻を一つずつ拾って、大事にしまった。'),
      one: L('{b}の想いが届かなかったその夜、{a}は焚き火の番を代わってもらい、{b}の隣に座った。二人とも、しばらく黙って炎を見ていた。やがて{a}は、焼いた芋を半分に割って、大きいほうを{b}に渡した。|{a}は{b}を誘って、夜明け前の浜を歩いた。空が白んでいくのを、二人で黙って見ていた。朝日が水平線から顔を出したとき、{a}は{b}のほうを向いた。|岩場の陰で膝を抱えている{b}を見つけて、{a}は隣に腰を下ろした。波の音だけが、しばらく二人の間を埋めていた。{a}は{b}の肩に、自分の上着を掛けた。')
    }
  };

  /* 見張りを代わる（a＝仲間、b・c＝想い合っている二人／恋人どうし） */
  ev({
    id: 'is_watch', cat: 'bond', scope: 'pair',
    when: function (ctx, a, b) { var c = G.loveOf(ctx, b, a); return !!c && G.thirdOk(ctx, a, b, c) && G.once(ctx, 'watch', [a, b, c]); },
    w: W(0.45),
    run: function (ctx, a, b) {
      var c = G.loveOf(ctx, b, a); G.mark(ctx, 'watch', [a, b, c]);
      ctx.mod2(b, c, { att: 4, aff: 3, trust: 2 }, { att: 4, aff: 3, trust: 2 }); ctx.mod(b, a, { trust: 4, aff: 3 }); ctx.stress(a, 4); ctx.stress(b, -6);
      return { with: [c], text: ctx.t(ctx.pick(T.watch), a, b, c), why: a.name + 'が、' + b.name + 'と' + c.name + 'のために見張りを代わった（応援・仲良し）', mag: 9 };
    }
  });
  /* 食べ物を多めに分ける */
  ev({
    id: 'is_share', cat: 'bond', scope: 'pair',
    when: function (ctx, a, b) { var c = G.loveOf(ctx, b, a); return !!c && G.thirdOk(ctx, a, b, c) && (a.hp == null || a.hp > 35) && G.once(ctx, 'share', [a, b, c]); },
    w: W(0.4),
    run: function (ctx, a, b) {
      var c = G.loveOf(ctx, b, a); G.mark(ctx, 'share', [a, b, c]);
      if (a.hp != null) a.hp = Math.max(1, a.hp - 2);
      [b, c].forEach(function (x) { if (x.hp != null) x.hp = Math.min(100, x.hp + 1); });
      ctx.mod2(b, c, { aff: 3, att: 3 }, { aff: 3, att: 3 }); ctx.mod(b, a, { aff: 4, trust: 3 }); ctx.mod(c, a, { aff: 3, trust: 2 });
      return { with: [c], text: ctx.t(ctx.pick(T.share), a, b, c), why: a.name + 'が、' + b.name + 'と' + c.name + 'に食べ物を多めに分けた（応援・仲良し）', mag: 8 };
    }
  });
  /* 焚き火で二人きりにする（想い合っている二人が中心。恋人どうしでも） */
  ev({
    id: 'is_fire', cat: 'bond', scope: 'pair',
    when: function (ctx, a, b) { var c = G.loveOf(ctx, b, a); return !!c && G.thirdOk(ctx, a, b, c) && ctx.present().length >= 3 && G.once(ctx, 'fire', [a, b, c]); },
    w: function (ctx, a, b) { var c = G.loveOf(ctx, b, a); return (c && !G.couple(ctx, b, c) ? 0.55 : 0.32) + a.tr.np * 0.12; },
    run: function (ctx, a, b) {
      var c = G.loveOf(ctx, b, a); G.mark(ctx, 'fire', [a, b, c]);
      ctx.mod2(b, c, { att: 5, aff: 3, trust: 3 }, { att: 5, aff: 3, trust: 3 }); ctx.mod(b, a, { trust: 3 });
      return { with: [c], text: ctx.t(ctx.pick(T.fire), a, b, c), why: a.name + 'が、夜の焚き火で' + b.name + 'と' + c.name + 'を二人きりにした（応援・仲良し）', mag: 9 };
    }
  });
  /* 同じ作業に組む（想い合っている二人） */
  ev({
    id: 'is_work', cat: 'bond', scope: 'pair',
    when: function (ctx, a, b) { var c = G.mutualOf(ctx, b, a); return !!c && G.thirdOk(ctx, a, b, c) && G.once(ctx, 'work', [b, c]); },
    w: function (ctx, a) { return 2.2 + a.tr.lead * 0.6 + a.tr.np * 0.3; },
    run: function (ctx, a, b) {
      var c = G.mutualOf(ctx, b, a); G.mark(ctx, 'work', [b, c]);
      ctx.mod2(b, c, { att: 5, trust: 4 }, { att: 5, trust: 4 });
      if (ctx.food != null) ctx.food += 2;
      return { with: [c], text: ctx.t(ctx.pick(T.work), a, b, c), why: a.name + 'が、' + b.name + 'と' + c.name + 'を同じ作業に組んだ（応援・仲良し）', mag: 8 };
    }
  });
  /* 手作りの贈り物で祝福する（恋人どうし／結ばれた二人） */
  ev({
    id: 'is_gift', cat: 'bond', scope: 'pair',
    when: function (ctx, a, b) { var c = G.partnerOf(ctx, b, a); return !!c && G.thirdOk(ctx, a, b, c) && G.once(ctx, 'gift', [b, c]); },
    w: W(0.5),
    run: function (ctx, a, b) {
      var c = G.partnerOf(ctx, b, a), st = G.stage(ctx, b, c); G.mark(ctx, 'gift', [b, c]);
      ctx.mod2(b, c, { aff: 4, att: 2 }, { aff: 4, att: 2 }); ctx.mod2(a, b, { aff: 3 }, { aff: 5, trust: 4 }); ctx.mod2(a, c, { aff: 3 }, { aff: 5, trust: 4 });
      [a, b, c].forEach(function (x) { ctx.stress(x, -6); });
      return { with: [c], text: ctx.t(ctx.pick(T.gift[st === 'bound' ? 'bound' : 'couple']) + G.byPer(ctx, G.BLESS, a), a, b, c), why: a.name + 'が、恋人どうしの' + b.name + 'と' + c.name + 'に手作りの贈り物をして祝福した（祝福・仲良し）', mag: 11 };
    }
  });
  /* 冷やかす（恋人どうし） */
  ev({
    id: 'is_tease', cat: 'bond', scope: 'pair',
    when: function (ctx, a, b) { var c = G.partnerOf(ctx, b, a); return !!c && G.thirdOk(ctx, a, b, c) && G.once(ctx, 'tease', [a, b, c]); },
    w: function (ctx, a) { return 0.3 + a.tr.fc * 0.2; },
    run: function (ctx, a, b) {
      var c = G.partnerOf(ctx, b, a); G.mark(ctx, 'tease', [a, b, c]);
      ctx.mod2(b, c, { att: 3, aff: 2 }, { att: 3, aff: 2 }); ctx.mod2(a, b, { aff: 2 }, { aff: 2, trust: 2 }); ctx.stress(b, -4); ctx.stress(c, -4);
      return { with: [c], text: ctx.t(ctx.pick(T.tease), a, b, c), why: a.name + 'が、恋人どうしの' + b.name + 'と' + c.name + 'を冷やかした（冷やかし・仲良し）', mag: 8 };
    }
  });
  /* 海に入る・星を見る（a・b＝恋人どうし。もう一組がいれば四人で、いなければ仲間と三人・四人で） */
  function company(ctx, a, b) {
    var cd = G.otherCouple(ctx, a, b);
    if (cd && G.pairOk(ctx, cd[0], cd[1])) return { k: 'pair', c: cd[0], d: cd[1] };
    var f = G.here(ctx).filter(function (x) { return G.thirdOk(ctx, x, a, b) && G.thirdOk(ctx, x, b, a); });
    return f.length ? { k: 'group', c: f[0], d: null } : null;
  }
  function outing(id, key, label, w0) {
    ev({
      id: id, cat: 'bond', scope: 'pair',
      when: function (ctx, a, b) { return G.couple(ctx, a, b) && G.pairOk(ctx, a, b) && !!company(ctx, a, b) && ctx.flags[id + 'At'] !== ctx.stepIndex && (key !== 'sea' || (ctx.env.storm || 0) < 75); },
      w: function () { return w0; },
      run: function (ctx, a, b) {
        var m = company(ctx, a, b), c = m.c, d = m.d;
        ctx.flags[id + 'At'] = ctx.stepIndex;
        ctx.mod2(a, b, { att: 3, aff: 3 }, { att: 3, aff: 3 });
        if (d) ctx.mod2(c, d, { att: 2, aff: 3 }, { att: 2, aff: 3 });
        [[a, c], [b, c]].concat(d ? [[a, d], [b, d]] : []).forEach(function (p) { ctx.mod2(p[0], p[1], { aff: 2, trust: 2 }, { aff: 2, trust: 2 }); });
        [a, b, c, d].forEach(function (x) { if (x) ctx.stress(x, -6); });
        var who = m.k === 'pair' ? a.name + 'と' + b.name + '、' + c.name + 'と' + d.name + 'の二組で' : c.name + 'が、恋人どうしの' + a.name + 'と' + b.name + 'と一緒に';
        return { with: d ? [c, d] : [c], text: G.fill(ctx, ctx.pick(T[key][m.k]), a, b, c, d), why: who + label + '（' + (m.k === 'pair' ? 'ダブルデート・' : 'みんなで・') + '仲良し）', mag: 9 };
      }
    });
  }
  outing('is_sea', 'sea', '海に入った', 0.5);
  outing('is_stars', 'stars', '星を見た', 0.5);
  /* 恋の相談（a＝聞く仲間、b＝想っている人、c＝想う相手） */
  ev({
    id: 'is_soudan', cat: 'bond', scope: 'pair',
    when: function (ctx, a, b) { var c = wish(ctx, b, a); return !!c && G.thirdOk(ctx, a, b, c) && G.friendly(ctx, b, a) && G.once(ctx, 'soudan', [a, b, c]); },
    w: function (ctx, a, b) { return 2 + b.tr.honesty * 0.6 + (G.rel(ctx, a, b) ? 0.6 : 0); },
    run: function (ctx, a, b) {
      var c = wish(ctx, b, a); G.mark(ctx, 'soudan', [a, b, c]);
      ctx.mod2(a, b, { trust: 4, aff: 2 }, { trust: 5, aff: 3 }); ctx.mod(b, c, { att: 3 });
      return { with: [c], text: ctx.t(G.relLead(ctx, a, b) + ctx.pick(T.soudan) + G.byPer(ctx, G.CHEER, a), a, b, c), why: b.name + 'が' + a.name + 'に、' + c.name + 'への想いを相談した（恋の相談・仲良し）', mag: 8 };
    }
  });
  /* 想いが届かなかった仲間を励ます（a＝仲間、b＝告げて断られた人。もう一人の仲間 d がいれば三人で） */
  ev({
    id: 'is_comfort', cat: 'bond', scope: 'pair',
    when: function (ctx, a, b) { var x = G.turnedDown(ctx, b); return !!x && x !== a && !G.couple(ctx, a, b) && R(ctx, a, b).att < 40 && G.friendly(ctx, a, b) && G.once(ctx, 'comfort', [a, b]); },
    w: function (ctx, a, b) { return 2.5 + a.tr.np * 0.8 + b.stress / 100; },
    run: function (ctx, a, b) {
      var x = G.turnedDown(ctx, b); G.mark(ctx, 'comfort', [a, b]);
      var d = ctx.present().filter(function (o) { return o !== a && o !== b && o !== x && !G.couple(ctx, o, b) && R(ctx, o, b).att < 40 && G.friendly(ctx, o, b) && G.friendly(ctx, o, a); })[0] || null;
      ctx.mod2(a, b, { aff: 3, trust: 3 }, { aff: 5, trust: 6 }); ctx.stress(b, -14);
      if (d) { ctx.mod2(d, b, { aff: 3, trust: 3 }, { aff: 5, trust: 5 }); ctx.mod2(a, d, { aff: 2 }, { aff: 2 }); }
      var text = G.fill(ctx, G.relLead(ctx, a, b) + ctx.pick(T.comfort[d ? 'two' : 'one']) + G.byPer(ctx, G.COMFORT, a), a, b, null, d);
      return { with: d ? [d] : [], text: text, why: b.name + 'の想いは届かなかった。' + a.name + (d ? 'と' + d.name : '') + 'が励ました（励まし・仲良し）', mag: 10 };
    }
  });
})();
