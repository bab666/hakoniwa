/* 箱庭診断: 出られない部屋 ―― お互いを知る（質問して交流する）
   ・行動「相手のことを質問する」：穏やか（NP・あたたかさ）な人ほど選びやすく、聞き方もやわらかい
   ・答えるかどうかは、相手の正直さ・信頼・質問の深さ・聞き方で決まる。答えてもらえないと気まずくなる
   ・答えられなかった質問に、あとから自分で答えに来ることもある
   ・条件に「本音を打ち明け合う」があれば、深い質問への答えは本音として数える */
(function () {
  'use strict';
  var HK = window.HK, scen = HK.SCENARIOS && HK.SCENARIOS.whiteroom;
  if (!scen) return;
  function R(ctx, a, b) { return ctx.R(a, b); }
  function T(ctx, s, a, b) { return ctx.t(s, a, b); }

  scen.actions = scen.actions.concat([
    { id: 'askq', label: '相手のことを質問する', fit: function (t) { return t.np * 0.5 + t.warmth * 0.4 + t.honesty * 0.1; }, bias: { bond: 1.8, romance: 1.1, solo: 0.6 } }
  ]);

  /* 質問：[問い, 答えの例（|区切り）, 深さ 0〜2, 恋愛寄りか] */
  var Q = [
    ['好きな食べ物って何？', '{b}「…卵焼き。甘いやつ」|{b}「ラーメン。夜中に食べるのが一番うまい」|{b}「白いご飯。おかずはいらない」', 0],
    ['休みの日は何してるの？', '{b}「寝てる。ひたすら寝てる」|{b}「散歩。知らない道を歩くのが好きで」|{b}「録りためたドラマを一気に見る」', 0],
    ['子どもの頃の夢って何だった？', '{b}「宇宙飛行士。…笑うなよ」|{b}「パン屋さん。今でもちょっと思ってる」|{b}「なかった。だから今もちょっと探してる」', 0],
    ['動物で例えたら、自分は何だと思う？', '{b}「…猫かな。気が向いたときだけ寄っていく」|{b}「ナマケモノ」|{b}「犬。たぶん、しっぽ振ってるのばれてる」', 0],
    ['最近、いちばん笑ったことは？', '{b}「…今。この状況」|{b}「駅で、鳩に本気で追いかけられてる人を見た」|{b}「自分の寝言で起きたこと」', 0],
    ['人に言えない趣味とかある？', '{b}「…昔のアイドルのライブ映像を見ながら、全部の振り付けを踊れる」|{b}「知らない人の家の間取り図を眺めること」|{b}「…ぬいぐるみに名前つけて話しかけてる」', 1],
    ['最近、泣いたのっていつ？', '{b}「先週。映画で。動物が出てくるやつはずるい」|{b}「…覚えてない。泣き方を忘れたのかもしれない」|{b}「ここで目が覚めたとき。…少しだけ」', 1],
    ['初恋っていつだった？', '{b}「小学校の、図書室の先生」|{b}「…それ、今聞く？」と言いながら、{b}は中学のときの話をした|{b}「まだ、かもしれない」', 1, true],
    ['どんな人がタイプ？', '{b}「…ちゃんと話を聞いてくれる人」|{b}「一緒にいて、黙ってても平気な人」|{b}「笑うと目がなくなる人」と言って、{b}は{a}から目を逸らした', 1, true],
    ['今、いちばん怖いことって何？', '{b}「…ここから出られないこと。じゃなくて、出たあと、ここでのことを忘れちゃうこと」|{b}「誰にも必要とされなくなること」|{b}「…自分が、何もできないまま終わること」', 2],
    ['後悔してることってある？', '{b}「親に、ちゃんとありがとうって言えてない」|{b}「一人だけ、謝りそびれてる人がいる」|{b}「…あのとき、行かないでって言えばよかった」', 2],
    ['ここを出たら、最初に誰に会いたい？', '{b}「…家族。いや、飼ってる猫」|{b}「誰にも。一人で、ちゃんと眠りたい」|{b}「…それは、出てから言う」', 2, true],
    ['正直、私のことどう思ってる？', '{b}「…思ってたより、ずっといい人」|{b}「最初は苦手だった。今は、そうでもない」|{b}「それは、答えたら負けな気がする」と言いながら、{b}の耳は赤かった', 2, true]
  ];
  /* 聞き方（a の気質で） */
  function askLine(ctx, a, q) {
    var t = a.tr;
    if (t.np > 0.62 || t.warmth > 0.62) return ctx.pick(['{a}「よかったら、聞いてもいい？　' + q + '」', '{a}は少し考えてから、やわらかく訊いた。「答えたくなかったらいいんだけど……' + q + '」', '{a}「ねえ、暇つぶしに。' + q + '」']);
    if (t.cp > 0.65 || t.aggr > 0.6) return ctx.pick(['{a}「' + q + '　答えろよ、暇なんだから」', '{a}は前置きもなく訊いた。「' + q + '」']);
    if (t.fc > 0.62) return ctx.pick(['{a}「はい質問タイム！　' + q + '」', '{a}「じゃーん、第一問。' + q + '」']);
    if (t.ac > 0.62) return ctx.pick(['{a}「あ、あの……' + q + '」', '{a}は何度か口を開けては閉じて、ようやく訊いた。「……' + q + '」']);
    return ctx.pick(['{a}「' + q + '」', '{a}は{b}の隣に座って、訊いた。「' + q + '」']);
  }
  /* 答えないときの言い方（b のいちばん強い因子で） */
  var NOPE = {
    CP: ['{b}「答える義理はない」', '{b}「それを聞いてどうする」'],
    NP: ['{b}「…それは、またいつかね」と、{b}は困ったように笑った。', '{b}「ごめん。それは、まだ言えない」'],
    A: ['{b}「それ、今の状況に関係ある？」', '{b}「その質問には答えないことにしてる」'],
    FC: ['{b}「ひみつー」', '{b}「当ててみて。当たったら教える」'],
    AC: ['{b}は俯いて、黙ってしまった。', '{b}「……ごめん、それはちょっと」']
  };
  /* 気まずさの後始末（a の気質で） */
  function awkward(ctx, a, b) {
    if (a.tr.np > 0.6 || a.tr.warmth > 0.6) return ctx.pick(['{a}「あ、ごめん。変なこと聞いた」{a}はすぐに話題を変えた。それでも、しばらく部屋の空気は硬かった。', '{a}「いいよ、無理に答えなくて」二人の間に、少しだけ長い沈黙が落ちた。']);
    if (a.tr.fc > 0.6) return ctx.pick(['{a}「…はい、じゃあ次の質問！」誰も笑わなかった。', '{a}「ちぇー」とおどけてみせたが、そのあとの沈黙は{a}にもごまかせなかった。']);
    return ctx.pick(['沈黙が落ちた。白い壁が、やけに白く見えた。', '{a}は「そう」とだけ言って、壁の方を向いた。時計の音だけが聞こえた。', '気まずい空気のまま、二人とも扉の紙を読み直すふりをした。']);
  }

  /* a が b について知ったこと（向きつき） */
  function know(ctx, a, b) { var pf = ctx.pair(a, b); pf.known = pf.known || {}; return (pf.known[a.i] = pf.known[a.i] || {}); }
  function honneRule(ctx) { return (ctx.rules || []).filter(function (r) { return r.k === 'honne'; })[0]; }
  function countHonne(ctx, a, b, who) {
    var r = honneRule(ctx), p = ctx.flags.prog && ctx.flags.prog[a.i < b.i ? a.i + '-' + b.i : b.i + '-' + a.i];
    if (!r || !p) return false;
    var k = 'honne' + who.i;
    if ((p.said[k] || 0) >= r.n) return false;
    p.said[k] = (p.said[k] || 0) + 1;
    return true;
  }

  scen.events.push({
    id: 'r_ask', cat: 'bond', scope: 'pair', pri: true,
    when: function (ctx, a, b) { return !ctx.flags.isOne || ctx.present().length > 1; },
    w: function (ctx, a, b) {
      var k = know(ctx, a, b), n = Object.keys(k).length;
      return Math.max(0.05, ((a.action && a.action.id === 'askq') ? 3.2 : 0.45) + a.tr.np * 0.7 + a.tr.warmth * 0.7 + (a.goal && a.goal.id === 'know' ? 1 : 0) - n * 0.12);
    },
    run: function (ctx, a, b) {
      var rng = ctx.rng, k = know(ctx, a, b), rab = R(ctx, a, b), rba = R(ctx, b, a);
      /* 打ち解けているほど深い質問をする */
      var depthMax = rba.trust > 30 || rab.aff > 35 ? 2 : rba.trust > 8 ? 1 : 0;
      var pool = Q.filter(function (q, i) { return !k[i] && q[2] <= depthMax && (!q[3] || HK.canLove(a, b) || q[2] < 2); });
      if (!pool.length) pool = Q.filter(function (q, i) { return !k[i]; });
      if (!pool.length) return null;
      var q = ctx.pick(pool), qi = Q.indexOf(q);
      var soft = (a.tr.np + a.tr.warmth) / 2;
      var p = 0.62 + b.tr.honesty * 0.2 + rba.trust / 120 + rba.aff / 220 + soft * 0.2 - q[2] * 0.2 - b.tr.cold * 0.2 - rba.ten / 180 - (a.tr.cp > 0.65 || a.tr.aggr > 0.6 ? 0.12 : 0);
      var ask = T(ctx, askLine(ctx, a, q[0]), a, b);
      if (rng() < p) {
        k[qi] = 1;
        var ans = T(ctx, ctx.pick(q[1].split('|')), a, b);
        var deep = q[2] >= 2, rom = !!q[3];
        var dA = { aff: 4 + q[2] * 2, trust: 3 + q[2] * 2, ten: -3 }, dB = { aff: 3 + q[2] * 2, trust: 4 + q[2] * 3, ten: -4 };
        if (rom && HK.canLove(a, b)) { dA.att = 3 + q[2] * 2; dB.att = 2 + q[2]; }
        ctx.mod2(a, b, dA, dB); ctx.stress(a, -4); ctx.stress(b, -3 - q[2] * 2);
        var tail = deep ? ctx.pick(['{a}は「教えてくれて、ありがとう」と言った。', '{a}は何も言わずに頷いた。それで十分だった。', '話したあと、{b}の肩から少しだけ力が抜けていた。']) :
          ctx.pick(['{a}「意外」{b}「よく言われる」', '{a}は思わず笑った。', '{a}「わかる」と言って、自分の話もした。', '']);
        var hn = deep && countHonne(ctx, a, b, b) ? '（' + b.name + 'の本音として数えられた）' : '';
        return { cat: rom && rab.att > 30 ? 'romance' : 'bond', text: ask + ans + T(ctx, tail, a, b) + hn, why: a.name + 'の聞き方（NP・あたたかさ）と' + b.name + 'の正直さ・' + a.name + 'への信頼（' + Math.round(rba.trust) + '）', mag: 6 + q[2] * 4 };
      }
      /* 答えてもらえない */
      var top = HK.voiceTop(b), nope = T(ctx, ctx.pick(NOPE[top] || NOPE.AC), a, b);
      var playful = top === 'FC' && q[2] === 0;
      ctx.mod2(a, b, { ten: playful ? 1 : 5 + q[2] * 3, aff: playful ? 1 : -1 }, { ten: playful ? 0 : 4 + q[2] * 2 });
      ctx.stress(a, playful ? 0 : 4); ctx.stress(b, playful ? 0 : 3);
      if (q[2] >= 1 && b.tr.np + b.tr.honesty > 0.9) { b.flags.owe = b.flags.owe || {}; b.flags.owe[a.i] = qi; }
      return { cat: playful ? 'bond' : 'conflict', text: ask + nope + (playful ? T(ctx, ctx.pick(['{a}「ずるい」{b}は楽しそうに笑っていた。', '結局、その日のうちに{a}は三回当てようとして、三回外した。']), a, b) : T(ctx, awkward(ctx, a, b), a, b)),
        why: b.name + 'は答えなかった（質問の深さ ' + q[2] + '・' + b.name + 'の正直さとドライさ・緊張）', mag: 5 };
    }
  });
  /* 答えられなかった質問に、あとから答えに来る */
  scen.events.push({
    id: 'r_answer_later', cat: 'bond', scope: 'pair', pri: true,
    when: function (ctx, a, b) { return a.flags.owe && a.flags.owe[b.i] != null && R(ctx, a, b).trust > -5; },
    w: function (ctx, a, b) { return 0.4 + a.tr.np * 0.5 + a.tr.honesty * 0.4 + R(ctx, a, b).aff / 100; },
    run: function (ctx, a, b) {
      var qi = a.flags.owe[b.i], q = Q[qi];
      delete a.flags.owe[b.i];
      know(ctx, b, a)[qi] = 1;
      var ans = ctx.pick(q[1].split('|'));
      ctx.mod2(a, b, { trust: 8, aff: 5, ten: -8 }, { trust: 10, aff: 8, ten: -10 });
      var hn = q[2] >= 2 && countHonne(ctx, a, b, a) ? '（' + a.name + 'の本音として数えられた）' : '';
      return { text: T(ctx, ctx.pick(['{a}は{b}の隣に座って、ぽつりと言った。「さっきの質問。…答える」', '{a}「さっきは、ごめん。ちゃんと答えたい」']), a, b) + ctx.t(ans, b, a) + T(ctx, ctx.pick(['{b}は黙って聞いていた。', '{b}「…ありがとう。話してくれて」', '']), a, b) + hn,
        why: a.name + 'のNP・正直さ（答えなかった質問に、あとから答えた）', mag: 12 };
    }
  });

  /* 結果のまとめに「どれだけ知り合えたか」を残す */
  var fin0 = scen.finish;
  scen.finish = function (ctx) {
    var r = fin0 ? fin0.apply(this, arguments) : undefined;
    var C = ctx.chars, notes = (ctx.flags.endNotes = ctx.flags.endNotes || []);
    for (var i = 0; i < C.length; i++) for (var j = i + 1; j < C.length; j++) {
      var a = C[i], b = C[j], kn = ctx.pair(a, b).known || {}, na = Object.keys(kn[a.i] || {}).length, nb = Object.keys(kn[b.i] || {}).length;
      if (na + nb >= 3) notes.push(a.name + 'と' + b.name + 'は、部屋の中でお互いのことを' + (na + nb) + 'つ知った。');
    }
    return r;
  };
})();
