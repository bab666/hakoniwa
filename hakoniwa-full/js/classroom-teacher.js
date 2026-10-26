/* 箱庭診断: クラスメイトの担任の先生（一人だけ指定できる）と、先生と生徒のイベント
   先生は生徒の輪（派閥・いじめ・テスト）には入らず、毎月いくつかの場面で生徒と関わる。
   先生と生徒の間に恋愛は起きない（惹かれは育たない）。 */
(function () {
  'use strict';
  var HK = window.HK;
  var cls = HK.SCENARIOS.classroom;
  if (!cls) return;
  function R(ctx, a, b) { return ctx.R(a, b); }
  function pk(ctx, arr) { return arr[ctx.rng.int(arr.length)]; }
  function T(ctx, s, t, b) { return ctx.t(s, t, b); }
  function style(t) { return HK.voiceTop(t); } /* CP 厳しい / NP 優しい / A 理詰め / FC 楽しい / AC 気弱 */
  function by(t, map) { return map[style(t)] || map.NP; }

  /* いじめの話題で使う：本体側の状態を直接見る */
  function bully(ctx) { var B = ctx.flags.bully; return B && !B.stopped ? B : null; }
  function note(ctx, s) { (ctx.flags.endNotes = ctx.flags.endNotes || []).push(s); }

  var TE = [
    { id: 'hr', w: function () { return 1; }, run: function (ctx, t) {
      var P = ctx.present();
      var line = by(t, {
        CP: ['{a}「チャイムが鳴ったら席についてること。社会に出たら、それが最低限だよ｜チャイムが鳴ったら席についていること。社会に出たら、それが最低限だ｜チャイムが鳴ったら席についていること。社会に出たら、それが最低限です」', '{a}は朝のホームルームで、提出物の遅れを一人ずつ読み上げた。教室が静まり返った。'],
        NP: ['{a}「おはよう。眠そうな人、今日は無理しなくていいからね｜おはよう。眠そうな者は、今日は無理しなくていい｜おはようございます。眠そうな人、今日は無理しなくていいですからね」', '{a}は朝のホームルームで、全員の顔を一人ずつ見て「よし」と頷いた。'],
        A: ['{a}「今月の予定を三つに整理して話すね｜今月の予定を三つに整理して話す｜今月の予定を三つに整理して話します」黒板にはきっちりした字が並んだ。', '{a}は出席を取りながら、遅刻の傾向をグラフにして見せた。誰も笑わなかった。'],
        FC: ['{a}は朝のホームルームで、昨日見た変な夢の話を五分した。', '{a}「今日の目標！全員一回は笑う！｜今日の目標だ！全員一回は笑え！｜今日の目標です！全員一回は笑いましょう！」教室に微妙な空気が流れた。'],
        AC: ['{a}「あの…静かに…静かにしてもらえると…｜その…静かに…静かにしてもらえると…｜あの…静かに…静かにしていただけると…」声は後ろの席まで届かなかった。', '{a}は連絡事項を読み上げる途中で、二回噛んだ。']
      });
      ctx.act2({ actors: [t], cat: 'bond', fx: function () { P.forEach(function (c) { ctx.mod(c, t, { aff: style(t) === 'CP' ? -1 : 1.5, trust: 1 }); }); }, text: T(ctx, pk(ctx, line), t), why: '担任の気質（' + style(t) + '優位）' });
    } },
    { id: 'scold', w: function (ctx, t) { return t.tr.cp * 1.2; }, run: function (ctx, t) {
      var s = ctx.most(ctx.present(), function (c) { return c.tr.fc * 0.5 + c.tr.impulse * 0.4 + c.tr.aggr * 0.3 + ctx.rng() * 0.4; });
      var back = s.tr.cp > 0.6 ? s.name + '「…そういう言い方、ないと思う｜…そういう言い方は、ないと思う｜…そういう言い方、ないと思います」' : s.tr.ac > 0.6 ? s.name + 'は俯いて「ごめん｜すまない｜すみません」と小さく言った。' : s.name + 'は舌を出して、反省したふりをした。';
      ctx.act2({ actors: [t, s], cat: 'conflict', fx: function () { ctx.mod2(t, s, { ten: 3 }, { ten: s.tr.cp > 0.6 ? 12 : 6, trust: -3 }); }, text: T(ctx, pk(ctx, ['{a}「{b}、廊下に立ってて｜{b}、廊下に立っていろ｜{b}、廊下に立っていてください」', '{a}は{b}の机を指で叩いた。「今、何の時間だと思ってる｜今、何の時間だと思っている｜今、何の時間だと思っているんですか」', '{a}「{b}。放課後、職員室に来て｜{b}。放課後、職員室に来い｜{b}。放課後、職員室に来てください」']), t, s) + back, why: '担任のCP×' + s.name + 'の奔放さ' });
    } },
    { id: 'praise', w: function (ctx, t) { return 0.4 + t.tr.np * 0.8; }, run: function (ctx, t) {
      var s = ctx.most(ctx.present(), function (c) { return ctx.stat(c, 'study') * 0.2 + c.tr.ac * 0.3 + ctx.rng() * 0.6 - Math.max(0, R(ctx, t, c).aff) / 200; });
      ctx.act2({ actors: [t, s], cat: 'help', fx: function () { ctx.mod2(t, s, { aff: 4 }, { aff: 8, trust: 8 }); ctx.stress(s, -8); }, text: T(ctx, pk(ctx, ['{a}は返却したノートの隅に「よく頑張りました」と書いていた。{b}はそのページを何度も見返した。', '{a}「{b}の発表、先生すごく好きだったよ｜{b}の発表、先生はとても好きだった｜{b}の発表、先生はすごく好きでしたよ」{b}は耳まで赤くなった。', '{a}は全員の前で{b}の作文を読み上げた。{b}は机に突っ伏したが、少し笑っていた。', '{a}「最近、頑張ってるね。ちゃんと見てるよ｜最近、頑張っているな。ちゃんと見ている｜最近、頑張っていますね。ちゃんと見ていますよ」{b}「…うん｜…ああ｜…はい」']), t, s), why: '担任のNP（' + Math.round(t.eg.NP) + '）' });
    } },
    { id: 'counsel', w: function (ctx, t) { return ctx.present().some(function (c) { return c.stress > 55; }) ? 0.8 + t.tr.np : 0; }, run: function (ctx, t) {
      var s = ctx.most(ctx.present(), function (c) { return c.stress / 100 + ctx.rng() * 0.2; });
      var open = s.tr.honesty * 0.5 + R(ctx, s, t).trust / 60 + t.tr.np * 0.4 > ctx.rng() * 0.9;
      ctx.act2({ actors: [t, s], cat: 'help', fx: function () { ctx.stress(s, open ? -20 : -5); ctx.mod2(t, s, { aff: 4 }, { trust: open ? 14 : 4, aff: open ? 8 : 2 }); }, text: open ? T(ctx, pk(ctx, ['放課後の空き教室で、{a}は{b}の話を一時間聞いた。{b}「…誰にも言えなかったんだ｜…誰にも言えなかった｜…誰にも言えなかったんです」{a}「言ってくれてありがとう｜言ってくれて、ありがたい｜言ってくださってありがとうございます」', '{a}は{b}に缶のココアを渡した。「先生のおごり。何かあった？｜先生のおごりだ。何かあったか？｜先生のおごりです。何かありましたか？」{b}は少しずつ話し始めた。', '{a}「無理に話さなくていい。でも、先生はここにいるから｜無理に話さなくていい。だが、先生はここにいる｜無理に話さなくていいです。でも、先生はここにいますから」{b}の目から、ぽろっと涙が落ちた。']), t, s) : T(ctx, pk(ctx, ['{a}が「最近どう？｜最近どうだ？｜最近どうですか？」と声をかけた。{b}は「別に、普通｜別に、普通だ｜別に、普通です」とだけ答えた。', '{a}は{b}を呼び止めかけて、やめた。今はまだ、届かない気がした。']), t, s), why: s.name + 'の負担（' + Math.round(s.stress) + '）と担任のNP' });
    } },
    { id: 'question', w: function (ctx) { return 0.6; }, run: function (ctx, t) {
      var s = ctx.most(ctx.present(), function (c) { return c.tr.a * 0.6 + c.tr.honesty * 0.2 + ctx.rng() * 0.5; });
      ctx.act2({ actors: [s, t], cat: 'bond', fx: function () { ctx.mod2(s, t, { trust: 6, aff: 3 }, { aff: 5 }); }, text: T(ctx, pk(ctx, ['授業のあと、{b}が{a}に質問しに来た。{a}は職員室の椅子を一つ出してやった。', '{b}「先生、ここの問題、答えが二つある気がするんだけど｜先生、この問題は、答えが二つある気がするのだが｜先生、ここの問題、答えが二つある気がするんですけど」{a}は解答を見直して「…本当だ｜＝｜…本当ですね」と唸った。', '{b}は放課後、{a}のところに進路の本を借りに来た。', '{b}「先生って、なんで先生になったの｜先生は、なぜ先生になったのか｜先生って、なんで先生になったんですか」{a}は少し考えて「好きな先生がいたから｜好きな先生がいたからだ｜好きな先生がいたからです」と答えた。']), t, s), why: s.name + 'のA（知りたい気持ち）' });
    } },
    { id: 'prank', w: function (ctx) { return ctx.present().some(function (c) { return c.tr.fc > 0.6; }) ? 0.7 : 0.1; }, run: function (ctx, t) {
      var s = ctx.most(ctx.present(), function (c) { return c.tr.fc + c.tr.impulse * 0.5 + ctx.rng() * 0.3; });
      var r = by(t, { CP: '{a}は無言で黒板消しを拾い、「{b}、これは何だ｜＝｜{b}、これは何ですか」と静かに言った。', NP: '{a}は「やったなー｜やったな｜やりましたね」と笑って、粉まみれのまま授業を始めた。', A: '{a}は扉の仕掛けを観察してから「力学的によくできてる｜力学的によくできている｜力学的によくできていますね」と言った。', FC: '{a}は大爆笑して、翌日同じ仕掛けを{b}にやり返した。', AC: '{a}は粉まみれのまま固まって、教室がざわついた。' });
      ctx.act2({ actors: [s, t], cat: 'bond', fx: function () { ctx.mod2(s, t, { aff: 4 }, { aff: style(t) === 'CP' ? -3 : 3, ten: style(t) === 'CP' ? 6 : 0 }); ctx.present().forEach(function (c) { ctx.stress(c, -3); }); }, text: T(ctx, '{b}が教室の扉に黒板消しを仕掛けた。見事に{a}の頭に落ちた。' + r, t, s), why: s.name + 'のFC×担任の気質' });
    } },
    { id: 'nickname', w: function () { return 0.4; }, run: function (ctx, t) {
      var s = ctx.most(ctx.present(), function (c) { return c.tr.fc + c.tr.warmth * 0.5 + ctx.rng() * 0.4; });
      var nick = pk(ctx, ['ちゃん付け', '名字の最初の二文字', '口癖', '好物の名前', '似ている動物']);
      ctx.act2({ actors: [s, t], cat: 'bond', fx: function () { ctx.present().forEach(function (c) { ctx.mod(c, t, { aff: 2 }); }); }, text: T(ctx, '{b}が{a}に「' + nick + '」由来のあだ名をつけた。一週間でクラス中に広まった。' + by(t, { CP: '{a}は「先生って呼んで｜先生と呼べ｜先生と呼んでください」と言ったが、誰も聞いていなかった。', NP: '{a}はまんざらでもなさそうだった。', A: '{a}は「由来を説明して｜由来を説明しろ｜由来を説明してください」と言った。', FC: '{a}は自分でもそのあだ名で名乗り始めた。', AC: '{a}は困ったように笑っていた。' }), t, s), why: s.name + 'のFC・人懐こさ' });
    } },
    { id: 'rumor', w: function () { return 0.35; }, run: function (ctx, t) {
      var s = ctx.most(ctx.present(), function (c) { return c.tr.fc * 0.5 + c.tr.jealous * 0.3 + ctx.rng() * 0.4; });
      ctx.act2({ actors: [s, t], cat: 'bond', fx: function () { ctx.present().forEach(function (c) { ctx.stress(c, -2); }); }, text: T(ctx, pk(ctx, ['「{a}先生、指輪してたらしいよ｜{a}先生が、指輪をしていたらしい｜{a}先生、指輪をしていたらしいですよ」{b}の一言で、教室が朝から大騒ぎになった。', '{b}が「{a}先生が駅前でケーキを三つ買ってた｜{a}先生が駅前でケーキを三つ買っていた｜{a}先生が駅前でケーキを三つ買っていました」と報告した。誰と食べたのか、クラス会議が開かれた。', '{b}は{a}の昔の卒業アルバムを図書室で見つけた。髪型について、学年中に情報が回った。']), t, s), why: 'クラスの噂好き（' + s.name + 'のFC）' });
    } },
    { id: 'sick', w: function (ctx) { return ctx.flags.teacherSick ? 0 : 0.25; }, run: function (ctx, t) {
      ctx.flags.teacherSick = true;
      var s = ctx.most(ctx.present(), function (c) { return c.tr.np + c.tr.lead * 0.5 + ctx.rng() * 0.3; });
      ctx.act2({ actors: [s, t], cat: 'help', fx: function () { ctx.present().forEach(function (c) { ctx.mod(t, c, { aff: 4 }); ctx.mod(c, t, { aff: 3 }); }); ctx.mod(t, s, { aff: 6, trust: 6 }); }, text: T(ctx, '{a}が風邪で三日休んだ。{b}の提案で、クラス全員で寄せ書きを書いた。復帰した{a}は、黒板の前で少し黙ってから「…ありがとう｜…感謝する｜…ありがとうございます」と言った。', t, s), why: s.name + 'のNP・主導性' });
    } },
    { id: 'rebel', w: function (ctx, t) { return ctx.present().some(function (c) { return c.tr.cp > 0.65 && R(ctx, c, t).ten > 15; }) ? 0.9 : 0.15; }, run: function (ctx, t) {
      var s = ctx.most(ctx.present(), function (c) { return c.tr.cp + c.tr.aggr * 0.5 + R(ctx, c, t).ten / 50; });
      var ok = t.tr.np + t.tr.a * 0.5 > 0.8;
      ctx.act2({ actors: [s, t], cat: 'conflict', fx: function () { ctx.mod2(s, t, ok ? { ten: -6, trust: 8 } : { ten: 12, trust: -8 }, ok ? { trust: 6 } : { ten: 8 }); }, text: T(ctx, '{b}「その校則、意味あるの｜その校則に、意味はあるのか｜その校則、意味あるんですか」' + (ok ? '{a}「いい質問だね。じゃあ、意味がないと思う理由を三つ書いて持ってきて｜いい質問だ。では、意味がないと思う理由を三つ書いて持ってこい｜いい質問です。では、意味がないと思う理由を三つ書いて持ってきてください」次の日、{b}は本当に三枚書いてきた。' : '{a}「決まりは決まりだ｜＝｜決まりは決まりです」{b}は教室を出て行った。'), t, s), why: s.name + 'のCP（' + Math.round(s.eg.CP) + '）×担任の' + (ok ? 'NP・A' : 'CP') });
    } },
    { id: 'bullystop', w: function (ctx) { return bully(ctx) ? 1.2 : 0; }, run: function (ctx, t) {
      var B = bully(ctx), bad = ctx.chars[B.by], tg = ctx.chars[B.tg];
      var notice = t.tr.np * 0.5 + t.tr.a * 0.4 + t.tr.cp * 0.3 + B.level * 0.1 > ctx.rng() * 1.1;
      if (!notice) {
        ctx.act2({ actors: [t, tg], cat: 'solo', fx: function () { ctx.mod(tg, t, { trust: -8 }); ctx.stress(tg, 6); }, text: T(ctx, pk(ctx, ['{a}は教室の空気の変化に、気づかなかった。{b}が助けを求める目で見ていたことにも。', '{b}の机の落書きは、{a}が教室に入る前に消されていた。', '{a}は「最近みんな仲いいね｜最近みんな仲がいいな｜最近みんな仲がいいですね」と言った。{b}は笑えなかった。']), t, tg), why: '担任が見落とした（NP・A・CP の合計が届かず）' });
        return;
      }
      var strong = t.tr.cp > 0.55 || t.tr.np > 0.6;
      if (strong) {
        B.stopped = { how: 'teacher', by: t.i, at: ctx.label }; ctx.flags.bullyEnd = ctx.stepIndex;
        note(ctx, 'いじめ：' + bad.name + '→' + tg.name + '（' + B.since + '〜' + ctx.label + '）。担任の' + t.name + 'が止めた。');
      }
      ctx.act2({ actors: [t, bad, tg], cat: 'help', fx: function () { ctx.mod(tg, t, { trust: strong ? 25 : 8, aff: strong ? 15 : 5 }); ctx.mod(bad, t, { ten: strong ? 20 : 6 }); ctx.stress(tg, strong ? -25 : -6); },
        text: strong ? T(ctx, by(t, { CP: '{a}は教室に入るなり、黒板の落書きを指さした。「書いた人は、今ここで名乗り出て｜書いた者は、今ここで名乗り出ろ｜書いた人は、今ここで名乗り出てください」声は低く、誰も目を逸らせなかった。', NP: '{a}は{b}を放課後に呼び、ただ「気づくのが遅くなって、ごめん｜気づくのが遅くなって、すまない｜気づくのが遅くなって、ごめんなさい」と頭を下げた。次の日から、{a}は休み時間も教室にいるようになった。', A: '{a}は日付と出来事を一つずつ確かめ、関わった生徒全員と個別に面談した。一週間で、教室の空気が変わった。', FC: '{a}は授業を潰して「人をからかうこと」についてクラス全員と話し合った。最後に{a}は「先生は、このクラスが好きだからな｜先生は、このクラスが好きだからだ｜先生は、このクラスが好きですからね」と言った。', AC: '{a}は震える声で、それでもはっきり言った。「…やめて。先生は、許さない｜…やめろ。先生は、許さない｜…やめてください。先生は、許しません」' }), t, tg) : T(ctx, '{a}は異変に気づいて声をかけたが、{b}は「大丈夫｜大丈夫だ｜大丈夫です」と首を振った。', t, tg),
        why: '担任の' + (strong ? (t.tr.cp > 0.55 ? 'CP（毅然と叱る）' : 'NP（守ろうとする）') : '気づき（でも踏み込めなかった）') });
    } },
    { id: 'visit', w: function (ctx) { return ctx.chars.some(function (c) { return c.alive && c.out && c.flags.absent; }) ? 1 : 0; }, run: function (ctx, t) {
      var s = ctx.chars.filter(function (c) { return c.alive && c.out && c.flags.absent; })[0];
      var open = t.tr.np * 0.6 + R(ctx, s, t).trust / 60 > ctx.rng() * 0.9;
      ctx.act2({ actors: [t, s], cat: 'help', fx: function () { ctx.stress(s, open ? -18 : -4); ctx.mod(s, t, { trust: open ? 14 : 3, aff: open ? 8 : 0 }); }, text: open ? T(ctx, '{a}が家庭訪問に来た。{b}はドア越しに少しだけ話した。{a}「教室の席、ちゃんと空けてあるから｜教室の席は、きちんと空けてある｜教室の席、ちゃんと空けてありますから」', t, s) : T(ctx, '{a}が家庭訪問に来た。{b}は部屋から出てこなかった。{a}はプリントと、手書きのメモを置いて帰った。', t, s), why: '担任の家庭訪問（NP ' + Math.round(t.eg.NP) + '）' });
    } },
    { id: 'career', w: function (ctx) { return ctx.env.grade === '3' || (ctx.env.grade === 'all' && ctx.present().some(function (c) { return c.grade === 3; })) ? 1 : 0.3; }, run: function (ctx, t) {
      var s = pk(ctx, ctx.present());
      ctx.act2({ actors: [t, s], cat: 'bond', fx: function () { ctx.mod(s, t, { trust: 6 }); }, text: T(ctx, pk(ctx, ['三者面談で、{a}は{b}の親の前で「{b}さんは、人の痛みがわかる子です」と言った。{b}は帰り道、ずっと黙っていた。', '{a}「{b}は何がしたい？｜＝｜{b}は何がしたいですか？」{b}「…わからない｜＝｜…わかりません」{a}「わからないって言えるのは、ちゃんと考えてる証拠だよ｜わからないと言えるのは、きちんと考えている証拠だ｜わからないって言えるのは、ちゃんと考えている証拠ですよ」', '{a}は{b}の志望校の欄を見て、「もう一段上を狙ってみないか｜＝｜もう一段上を狙ってみませんか」と言った。', '{a}は{b}に、自分の大学時代の失敗談を話した。{b}は初めて{a}の前で笑った。']), t, s), why: '進路相談' });
    } },
    { id: 'event', w: function (ctx) { return /9月|10月|11月/.test(ctx.label) ? 1 : 0.1; }, run: function (ctx, t) {
      var s = ctx.most(ctx.present(), function (c) { return c.tr.lead + c.tr.fc * 0.5 + ctx.rng() * 0.4; });
      ctx.act2({ actors: [t, s], cat: 'bond', fx: function () { ctx.present().forEach(function (c) { ctx.mod(c, t, { aff: 3 }); ctx.stress(c, -4); }); }, text: T(ctx, pk(ctx, ['体育祭の教員リレーで、{a}は本気で走ってこけた。クラス全員が笑いながら拍手した。', '文化祭の準備で、{a}は夜八時まで段ボールを切っていた。{b}「先生、帰らなくていいの｜先生、帰らなくていいのか｜先生、帰らなくていいんですか」{a}「…楽しいから｜…楽しいからだ｜…楽しいですから」', '{a}はクラスの出し物の衣装を、なぜか自分で着ることになった。写真は卒業アルバムに載った。', '文化祭の打ち上げで、{a}は全員にジュースを奢った。{b}「先生、太っ腹！｜＝｜先生、太っ腹ですね！」']), t, s), why: '行事での担任' });
    } },
    { id: 'valentine', w: function (ctx) { return ctx.label === '2月' ? 1.5 : 0; }, run: function (ctx, t) {
      var s = ctx.most(ctx.present(), function (c) { return c.tr.np + c.tr.warmth * 0.5 + ctx.rng() * 0.4; });
      ctx.act2({ actors: [s, t], cat: 'bond', fx: function () { ctx.mod2(s, t, { aff: 3 }, { aff: 4 }); }, text: T(ctx, pk(ctx, ['{b}が「クラスから｜クラスからだ｜クラスからです」と言って、{a}に義理チョコを渡した。{a}は職員室で、それを一番目立つ場所に置いた。', '{b}たちは{a}の机に、クラス全員の名前入りのチョコを置いておいた。']), t, s), why: 'バレンタイン（クラスからの感謝）' });
    } },
    { id: 'graduation', w: function (ctx) { return ctx.label === '3月' ? 3 : 0; }, run: function (ctx, t) {
      var fav = ctx.most(ctx.present(), function (c) { return R(ctx, c, t).trust + R(ctx, c, t).aff; });
      ctx.act2({ actors: [t, fav], cat: 'bond', fx: function () { ctx.present().forEach(function (c) { ctx.mod(c, t, { aff: 4 }); }); }, text: T(ctx, by(t, { CP: '最後のホームルームで、{a}は「…以上だ｜＝｜…以上です」と言ったあと、しばらく窓の外を見ていた。{b}が「先生、泣いてる？｜先生、泣いているのか？｜先生、泣いてます？」と言った。「泣いてない｜泣いていない｜泣いていません」', NP: '最後のホームルームで、{a}は一人ずつ名前を呼んで、一言ずつ言葉をかけた。{b}の番で、声が詰まった。', A: '最後のホームルームで、{a}は一年間の記録を読み上げた。最後の行は「楽しかった」だった。', FC: '最後のホームルームで、{a}はクラス全員と写真を撮った。撮り直しは十二回に及んだ。', AC: '最後のホームルームで、{a}は用意した原稿を読もうとして、一行目で泣いた。{b}が「がんばれー｜頑張れ｜頑張ってください」と言った。' }), t, fav), why: '一年の終わり。最も慕っていた生徒：' + fav.name });
    } }
  ];

  function teacherTurn(ctx, s) {
    var t = ctx.teacher;
    if (!t || !t.alive) return;
    var n = 1 + (ctx.present().length > 8 ? 1 : 0) + (ctx.rng() < 0.5 ? 1 : 0);
    var used = {};
    for (var i = 0; i < n; i++) {
      var e = HK.weighted(ctx.rng, TE, function (x) { return used[x.id] ? 0 : x.w(ctx, t); });
      if (!e) break;
      used[e.id] = 1;
      e.run(ctx, t);
      ctx.flush();
    }
  }

  /* いじめ「なし」のときは、陰口・仲間外れ・嫌がらせの小さな出来事も起こさない */
  var HARASS = { c_line_group: 1, c_backbite: 1, c_prank: 1, c_overhear: 1, c_rumor_fight: 1 };
  (HK.MINI.classroom || []).forEach(function (e) {
    if (!HARASS[e.id]) return;
    var w0 = e.w;
    e.w = function (ctx, a, b) { return ctx.env.bully === 'off' ? 0 : w0(ctx, a, b); };
  });

  var setup0 = cls.setup, phase0 = cls.phase, finish0 = cls.finish;
  cls.setup = function (ctx) {
    var t = ctx.chars.filter(function (c) { return c.role === 'teacher'; })[0];
    if (t) {
      ctx.teacher = t; t.flags.teacher = true;
      var base = ctx.present;
      ctx.present = function () { return base.call(this).filter(function (c) { return !c.flags.teacher; }); };
      ctx.chars.forEach(function (c) { if (c !== t) { ctx.R(c, t).att = 0; ctx.R(t, c).att = 0; ctx.R(c, t).trust += 6; } });
    }
    setup0(ctx);
  };
  cls.phase = function (ctx, s, n) {
    phase0(ctx, s, n);
    if (s === 0 && ctx.teacher) ctx.say({ text: '担任は' + ctx.teacher.name + '。' + by(ctx.teacher, { CP: '「一年間、甘やかすつもりはない｜＝｜一年間、甘やかすつもりはありません」と最初に言った。', NP: '「困ったことがあったら、いつでも言ってね｜困ったことがあったら、いつでも言え｜困ったことがあったら、いつでも言ってくださいね」と笑った。', A: '黒板に一年の計画表を書き出した。', FC: '自己紹介でいきなりギターを弾いた。', AC: '自己紹介の声が、少し震えていた。' }) });
    teacherTurn(ctx, s);
  };
  cls.finish = function (ctx) {
    finish0(ctx);
    var t = ctx.teacher;
    if (t) {
      var fav = ctx.most(ctx.present(), function (c) { return R(ctx, c, t).trust + R(ctx, c, t).aff; });
      var foe = ctx.most(ctx.present(), function (c) { return R(ctx, c, t).ten - R(ctx, c, t).aff; });
      t.fate = '担任'; t.fateNote = '一年間クラスを受け持った' + (fav ? '。一番慕っていたのは' + fav.name : '');
      note(ctx, '担任の' + t.name + '：最も慕っていたのは' + (fav ? fav.name : '—') + (foe && R(ctx, foe, t).ten > 25 ? '、最後まで反発していたのは' + foe.name : '') + '。');
    }
    closeYear(ctx);
  };

  /* ===== 結末：一年（一学期だけのときは一学期）の終わり。修了式・卒業式・終業式の段で、恋人・親友・いじめ・不登校・担任を締める ===== */
  var CE_CER = {
    grad: [
      '卒業式の日。体育館に名前が一人ずつ呼ばれ、{n}人は卒業証書を受け取った。式のあと、教室の黒板には誰かが大きく「ありがとう」と書いていた。',
      '三月、卒業式。校歌の最後の一節で、何人かの声が震えた。最後のホームルームが終わると、{n}人はそれぞれの春へ向かって校門を出た。',
      '卒業式が終わり、校庭の桜はまだ三分咲きだった。胸に花をつけた{n}人は、最後にもう一度だけ教室を振り返った。高校生活は、そこで終わった。'
    ],
    mixed: [
      '三月。卒業式で三年生を送り出し、数日後には修了式があった。{n}人それぞれの一年が、同じ体育館で区切りを迎えた。',
      '卒業式の日、校門の前には花束を抱えた三年生が並んだ。在校生はその背中を見送り、自分たちの修了式を待った。学園の一年は、そこで一巡りした。',
      '三月の終わり、卒業する者と進級する者が、最後に同じ廊下ですれ違った。卒業式と修了式が終わり、学園の一年は幕を閉じた。'
    ],
    year: [
      '三月、修了式。通知表を受け取って、{n}人はこの教室で過ごす最後の日を迎えた。来月には、クラス替えが待っている。',
      '修了式の日。最後のホームルームで、黒板の隅の日直の欄が消された。このクラスで過ごした一年は、その日で終わった。',
      '三月の終わり、修了式が済むと、教室の机はがらんとして見えた。{n}人の一年は、春休みの手前で静かに区切りを迎えた。'
    ],
    term: [
      '七月、終業式。体育館は蒸し暑く、校長の話はいつもより長く感じた。通知表を受け取って、{n}人の一学期は終わった。',
      '終業式の日。最後のホームルームで、夏休みの課題の束が配られた。教室の窓から、蝉の声が入ってきた。一学期は、そこで区切りを迎えた。',
      '七月の終わり、終業式が済むと、教室は一気に夏休みの空気になった。{n}人は、それぞれの夏へ散っていった。'
    ]
  };
  var CE_COUPLE = {
    grad: [
      '{a}と{b}は、卒業式のあと校門の前で並んで写真を撮った。制服で会うのは今日が最後でも、二人の関係は続いていく。恋人どうしのまま、二人は卒業した。',
      '{a}と{b}は、誰もいなくなった教室で最後に二人きりになった。「卒業しても、会おうね｜卒業しても、会おう｜卒業しても、会いましょうね」と、どちらからともなく言った。二人は恋人として、次の春へ向かった。',
      '{a}は{b}の制服の第二ボタンを、照れくさそうに受け取った。この一年で恋人になった二人は、手を繋いで校門を出た。'
    ],
    year: [
      '{a}と{b}は、修了式の帰り道を並んで歩いた。春休みに会う日を、二人で何度も確かめ合った。恋人どうしのまま、二人は春休みを迎えた。',
      '{a}と{b}は、この一年で恋人になった。最後のホームルームのあと、二人はいつもの屋上で少しだけ話した。春休みの予定は、もう二人で決めてあった。',
      '{a}と{b}の机は、一年の終わりには自然と近くにあった。クラスの誰もが、二人が付き合っていることを知っていた。二人は恋人のまま、次の春を迎える。'
    ],
    term: [
      '{a}と{b}は、終業式の帰り道に夏祭りの約束をした。一学期のうちに恋人になった二人の夏は、これから始まる。',
      '{a}と{b}は、夏休みの課題を一緒にやる約束をして別れた。恋人どうしになった二人は、校門の前でなかなか手を離さなかった。',
      '{a}と{b}は、終業式のあと誰もいない昇降口で少しだけ話した。恋人になって最初の夏休みが、二人を待っていた。'
    ]
  };
  var CE_FRIEND = {
    grad: [
      '{a}と{b}は、卒業アルバムの寄せ書きのページを互いに埋め合った。この一年で、二人は親友になっていた。進む道は違っても、連絡は続くはずだ。',
      '{a}と{b}は、卒業式のあと最後に二人で購買の前を通った。一年前は名前も知らなかった二人が、今は肩を並べて笑っていた。',
      '{a}は{b}に「卒業しても、たまには会おう｜＝｜卒業しても、たまには会いましょう」と言った。{b}は「当たり前でしょ｜当たり前だ｜当たり前でしょう」と返した。二人の友情は、卒業では終わらなかった。'
    ],
    year: [
      '{a}と{b}は、この一年でいちばんの友達になった。修了式のあと、二人は四月からも変わらずつるもうと、冗談半分に約束した。',
      '{a}と{b}は、最後のホームルームのあとも、なかなか教室を出なかった。一年分の話をしても、まだ話し足りなかった。',
      '{a}と{b}は、春休みに遊ぶ約束をして別れた。一年前に出会ったのは偶然でも、今の二人の仲は偶然ではなかった。'
    ],
    term: [
      '{a}と{b}は、一学期のうちにすっかり仲良くなった。終業式の帰り道、二人は夏休みの予定を三つも立てた。',
      '{a}と{b}は、終業式のあとも教室に残って話し込んだ。四月には他人だった二人が、今は一番の友達になっていた。',
      '{a}は{b}に「夏休み、毎週どこか行こう｜夏休みは、毎週どこかへ行こう｜夏休み、毎週どこか行きましょう」と言った。{b}は笑って頷いた。二人の一学期は、友情で締めくくられた。'
    ]
  };
  var CE_RIVAL = [
    '{a}と{b}は、最後まで張り合ったままだった。最後の日も、二人は目を合わせずに教室を出た。決着は、次の季節に持ち越された。',
    '{a}と{b}の間の溝は、最後まで埋まらなかった。それでも、互いを意識し続けた{span}だったことは、二人とも分かっていた。',
    '{a}は最後の日、{b}の席の前で一瞬だけ立ち止まった。何も言わずに通り過ぎた。二人の対立は、和解しないまま区切りを迎えた。'
  ];
  var CE_BULLY = {
    on: [
      '{b}へのいじめは、最後まで止まらなかった。{a}は最後の日まで態度を変えず、{b}は誰とも目を合わせずに教室を出た。その{span}は、{b}にとって長すぎた。',
      '最後のホームルームの間も、{b}の机の周りだけ空気が冷たかった。{a}が始めたことを、誰も止められないまま{span}が終わった。',
      '{b}は最後の日、誰よりも先に教室を出た。{a}たちの笑い声が、廊下まで追いかけてきた。この教室は、最後まで{b}の居場所にならなかった。'
    ],
    off: [
      '{b}へのいじめは、{c}に止められて終わっていた。最後の日、{b}は少しだけ顔を上げて教室を出た。傷は残っても、{b}の{span}は最悪のままでは終わらなかった。',
      '一度は{b}を苦しめたいじめも、年度の終わりにはもう影を潜めていた。{b}は最後のホームルームで、小さく「ありがとう」と言った。',
      '{a}と{b}の間にあったことは、なかったことにはならない。それでも、いじめが止まってからの{b}は、少しずつ笑うようになっていた。'
    ]
  };
  var CE_ABSENT = [
    '{a}の席は、最後の日まで空いたままだった。机の中には、届けられなかったプリントが溜まっていた。{a}は{s}から、教室に戻らなかった。',
    '{cer}の日も、{a}の名前が呼ばれたとき返事はなかった。担任は通知表を封筒に入れ、「届けておく」とだけ言った。{a}の{span}は、{s}で止まっていた。',
    '{a}は{s}以来、学校に来ていない。{cer}のあとのホームルームで、誰かが{a}の机に寄せ書きの色紙をそっと置いた。届くかどうかは、分からない。'
  ];
  var CE_TIRED = [
    '{a}は{span}の終わり、教室にいないことが増えていた。最後の日はかろうじて登校したが、誰とも話さずに帰った。',
    '{a}の顔色は、{span}の終わりにはすっかり疲れて見えた。春休みが来ることだけが、今の{a}の救いだった。',
    '{a}は最後のホームルームの途中で、保健室へ行った。この{span}で、{a}は少し無理をしすぎていた。'
  ];
  var CE_LONE = [
    '{a}は最後まで、特定の誰かと深く関わることはなかった。それでも窓際の席から見たこの教室の{span}を、{a}は案外気に入っていた。',
    '{a}は{cer}のあと、誰とも寄り道せずに一人で帰った。一人の時間が多い{span}だったが、{a}にとってはそれが楽だった。',
    '{a}は最後の日、自分の机の落書きを消してから教室を出た。親しい友達はできなかったが、この教室を嫌いにはならなかった。'
  ];
  var CE_TEACHER = [
    '担任の{a}は、最後のホームルームで「{span}間、ありがとう｜{span}間、世話になった｜{span}間、ありがとうございました」と頭を下げた。いちばん名残惜しそうにしていたのは、{b}だった。',
    '担任の{a}は、空になった教室で一人、出席簿を閉じた。この{span}でいちばん慕ってくれた{b}の字が、学級日誌に何度も出てきた。',
    '担任の{a}は、生徒たちが帰ったあと黒板を消した。{b}が最後に「また先生のクラスがいい｜＝｜また先生のクラスがいいです」と言っていったのを思い出していた。'
  ];
  var CE_LAST = {
    grad: [
      'こうして、このクラスの高校生活は終わった。教室には、もう誰も戻ってこない。',
      '卒業した{n}人は、それぞれの道へ歩き出した。この教室で過ごした日々は、もう思い出の中にしかない。',
      '校門の前の人影が一人ずつ減っていき、最後には誰もいなくなった。このクラスの物語は、卒業でひとつの終わりを迎えた。'
    ],
    year: [
      'こうして、このクラスの一年は終わった。四月には、また新しい教室が始まる。',
      '春休みが来て、この教室の名簿は役目を終えた。同じ顔ぶれで過ごす一年は、もう二度と来ない。',
      '一年分の出来事を残して、教室の鍵が閉められた。このクラスは、そこで解散になった。'
    ],
    term: [
      'こうして、このクラスの一学期は終わった。二学期には、また同じ教室に{n}人が戻ってくる。',
      '夏休みが始まり、教室は九月まで静かになった。一学期の物語は、ここで一区切りだった。',
      '一学期の出来事を残して、教室の窓が閉められた。このクラスの最初の季節は、そこで幕を閉じた。'
    ]
  };
  function closeYear(ctx) {
    var term = ctx.env.span === 'term', mixed = ctx.env.grade === 'all';
    var S = ctx.chars.filter(function (c) { return c.alive && !c.flags.teacher && c.flags.caged == null; });
    if (!S.length) return;
    var allGrad = !term && S.every(function (c) { return c.grade === 3; });
    var someGrad = !term && S.some(function (c) { return c.grade === 3; });
    var ck = term ? 'term' : allGrad ? 'grad' : mixed && someGrad ? 'mixed' : 'year';
    var lk = term ? 'term' : allGrad ? 'grad' : 'year';
    var label = term ? '終業式' : allGrad ? '卒業式' : ck === 'mixed' ? '卒業式・修了式' : '修了式';
    ctx.label = label;
    ctx.say({ kind: 'step', cat: 'phase', text: label });
    var span = term ? '一学期' : '一年', nIn = S.filter(function (c) { return !c.out; }).length;
    function fill(s, a, b, c) { return ctx.t(s, a, b, c).replace(/\{n\}/g, nIn).replace(/\{span\}/g, span).replace(/\{cer\}/g, label); }
    function say(s, actors, why) { return ctx.say({ text: s, actors: actors || [], mag: 25, why: why ? '結末：' + why : '' }); }
    say(fill(ctx.pick(CE_CER[ck])), [], term ? '一学期の終わり（終業式）' : allGrad ? '三年生の卒業' : ck === 'mixed' ? '卒業と進級' : '一年の終わり（修了式）');
    var used = {}, couples = [], friends = [], rivals = [];
    S.forEach(function (a, i) { S.slice(i + 1).forEach(function (b) {
      var pf = ctx.pair(a, b), ab = R(ctx, a, b), ba = R(ctx, b, a);
      if (pf.couple) couples.push([a, b, Math.min(ab.aff, ba.aff)]);
      else if (Math.min(ab.aff, ba.aff) >= 30) friends.push([a, b, Math.min(ab.aff, ba.aff) + Math.min(ab.trust, ba.trust) * 0.5]);
      if (!pf.couple && Math.min(ab.ten, ba.ten) >= 40) rivals.push([a, b, Math.min(ab.ten, ba.ten)]);
    }); });
    [couples, friends, rivals].forEach(function (l) { l.sort(function (x, y) { return y[2] - x[2]; }); });
    var gradOf = function (a, b) { return term ? 'term' : (a.grade === 3 && b.grade === 3) ? 'grad' : 'year'; };
    /* 一人が複数の組に数えられているとき（古い恋人の印が残っているなど）は、いちばん好意の強い組だけにする */
    var cu = {}; couples = couples.filter(function (p) { if (cu[p[0].i] || cu[p[1].i]) return false; cu[p[0].i] = cu[p[1].i] = 1; return true; });
    couples.slice(0, 3).forEach(function (p) { used[p[0].i] = used[p[1].i] = 1; say(fill(ctx.pick(CE_COUPLE[gradOf(p[0], p[1])]), p[0], p[1]), [p[0], p[1]], '恋人になった二人'); });
    if (couples.length > 3) say('ほかにも、' + couples.slice(3).map(function (p) { return p[0].name + 'と' + p[1].name; }).join('、') + 'が恋人どうしのまま' + (term ? '夏休みを迎えた。' : '一年を終えた。'), [], '恋人になった組');
    var fc = 0;
    friends.forEach(function (p) { if (fc >= 2 || used[p[0].i] || used[p[1].i]) return; fc++; used[p[0].i] = used[p[1].i] = 1; say(fill(ctx.pick(CE_FRIEND[gradOf(p[0], p[1])]), p[0], p[1]), [p[0], p[1]], '親しくなった二人（好意 ' + Math.round(p[2]) + '）'); });
    if (rivals[0]) say(fill(ctx.pick(CE_RIVAL), rivals[0][0], rivals[0][1]), [rivals[0][0], rivals[0][1]], '最後まで続いた対立（緊張 ' + Math.round(rivals[0][2]) + '）');
    var B = ctx.flags.bully;
    if (B && ctx.chars[B.by] && ctx.chars[B.tg]) {
      var ba = ctx.chars[B.by], bt = ctx.chars[B.tg], stopper = B.stopped && B.stopped.by != null ? ctx.chars[B.stopped.by] : null;
      var pool = B.stopped ? CE_BULLY.off.filter(function (l) { return stopper || l.indexOf('{c}') < 0; }) : CE_BULLY.on;
      if (!(bt.out && bt.flags.absent)) { used[bt.i] = 1; say(fill(ctx.pick(pool), ba, bt, stopper), [bt], B.stopped ? 'いじめは止まった' : 'いじめは年度末まで続いた'); }
    }
    S.filter(function (c) { return c.out && c.flags.absent; }).slice(0, 3).forEach(function (c) { used[c.i] = 1; say(fill(ctx.pick(CE_ABSENT), c).replace(/\{s\}/g, c.flags.absent.since), [], c.name + 'は不登校のまま'); });
    S.filter(function (c) { return !used[c.i] && c.fate === '休みがちに'; }).slice(0, 2).forEach(function (c) { used[c.i] = 1; say(fill(ctx.pick(CE_TIRED), c), [c], '負担が大きいまま（' + Math.round(c.stress) + '）'); });
    S.filter(function (c) { if (used[c.i] || c.out) return false; var o = ctx.closest(c); return !o || R(ctx, c, o).aff < 15; }).slice(0, 2).forEach(function (c) { used[c.i] = 1; say(fill(ctx.pick(CE_LONE), c), [c], '親しい相手がいないまま'); });
    var t = ctx.teacher;
    if (t && t.alive) {
      var fav = ctx.most(S.filter(function (c) { return !c.out; }), function (c) { return R(ctx, c, t).trust + R(ctx, c, t).aff; });
      if (fav) say(fill(ctx.pick(CE_TEACHER), t, fav), [t], '担任を一番慕っていた生徒');
    }
    say(fill(ctx.pick(CE_LAST[lk])), [], '');
    /* 結末の題 */
    if (!ctx.flags.outcome) {
      var head = term ? '一学期が終わった' : allGrad ? '卒業' : ck === 'mixed' ? '卒業式と修了式' : '一年が終わった', tail;
      var absent = S.filter(function (c) { return c.out && c.flags.absent; });
      if (B && !B.stopped && ctx.chars[B.tg]) tail = ctx.chars[B.tg].name + 'へのいじめは最後まで止まらなかった';
      else if (couples.length) tail = couples[0][0].name + 'と' + couples[0][1].name + (couples.length > 1 ? 'ほか、恋人が' + couples.length + '組できた' : 'が恋人になった');
      else if (absent.length) tail = absent[0].name + 'は教室に戻らなかった';
      else if (friends.length) tail = friends[0][0].name + 'と' + friends[0][1].name + 'が親友になった';
      else if (rivals.length) tail = rivals[0][0].name + 'と' + rivals[0][1].name + 'は最後まで対立したまま';
      else tail = '大きな事件もなく、それぞれの距離のまま';
      ctx.flags.outcome = head + ' ― ' + tail;
    }
  }
})();
