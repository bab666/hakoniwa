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
        CP: ['{a}「チャイムが鳴ったら席についていること。社会に出たら、それが最低限だ」', '{a}は朝のホームルームで、提出物の遅れを一人ずつ読み上げた。教室が静まり返った。'],
        NP: ['{a}「おはよう。眠そうな人、今日は無理しなくていいからね」', '{a}は朝のホームルームで、全員の顔を一人ずつ見て「よし」と頷いた。'],
        A: ['{a}「今月の予定を三つに整理して話します」黒板にはきっちりした字が並んだ。', '{a}は出席を取りながら、遅刻の傾向をグラフにして見せた。誰も笑わなかった。'],
        FC: ['{a}は朝のホームルームで、昨日見た変な夢の話を五分した。', '{a}「今日の目標！全員一回は笑う！」教室に微妙な空気が流れた。'],
        AC: ['{a}「あの…静かに…静かにしてもらえると…」声は後ろの席まで届かなかった。', '{a}は連絡事項を読み上げる途中で、二回噛んだ。']
      });
      ctx.act2({ actors: [t], cat: 'bond', fx: function () { P.forEach(function (c) { ctx.mod(c, t, { aff: style(t) === 'CP' ? -1 : 1.5, trust: 1 }); }); }, text: T(ctx, pk(ctx, line), t), why: '担任の気質（' + style(t) + '優位）' });
    } },
    { id: 'scold', w: function (ctx, t) { return t.tr.cp * 1.2; }, run: function (ctx, t) {
      var s = ctx.most(ctx.present(), function (c) { return c.tr.fc * 0.5 + c.tr.impulse * 0.4 + c.tr.aggr * 0.3 + ctx.rng() * 0.4; });
      var back = s.tr.cp > 0.6 ? s.name + '「…そういう言い方、ないと思います」' : s.tr.ac > 0.6 ? s.name + 'は俯いて「すみません」と小さく言った。' : s.name + 'は舌を出して、反省したふりをした。';
      ctx.act2({ actors: [t, s], cat: 'conflict', fx: function () { ctx.mod2(t, s, { ten: 3 }, { ten: s.tr.cp > 0.6 ? 12 : 6, trust: -3 }); }, text: T(ctx, pk(ctx, ['{a}「{b}、廊下に立ってなさい」', '{a}は{b}の机を指で叩いた。「今、何の時間だと思ってる」', '{a}「{b}。放課後、職員室に来なさい」']), t, s) + back, why: '担任のCP×' + s.name + 'の奔放さ' });
    } },
    { id: 'praise', w: function (ctx, t) { return 0.4 + t.tr.np * 0.8; }, run: function (ctx, t) {
      var s = ctx.most(ctx.present(), function (c) { return ctx.stat(c, 'study') * 0.2 + c.tr.ac * 0.3 + ctx.rng() * 0.6 - Math.max(0, R(ctx, t, c).aff) / 200; });
      ctx.act2({ actors: [t, s], cat: 'help', fx: function () { ctx.mod2(t, s, { aff: 4 }, { aff: 8, trust: 8 }); ctx.stress(s, -8); }, text: T(ctx, pk(ctx, ['{a}は返却したノートの隅に「よく頑張りました」と書いていた。{b}はそのページを何度も見返した。', '{a}「{b}の発表、先生すごく好きだったよ」{b}は耳まで赤くなった。', '{a}は全員の前で{b}の作文を読み上げた。{b}は机に突っ伏したが、少し笑っていた。', '{a}「最近、頑張ってるね。ちゃんと見てるよ」{b}「…はい」']), t, s), why: '担任のNP（' + Math.round(t.eg.NP) + '）' });
    } },
    { id: 'counsel', w: function (ctx, t) { return ctx.present().some(function (c) { return c.stress > 55; }) ? 0.8 + t.tr.np : 0; }, run: function (ctx, t) {
      var s = ctx.most(ctx.present(), function (c) { return c.stress / 100 + ctx.rng() * 0.2; });
      var open = s.tr.honesty * 0.5 + R(ctx, s, t).trust / 60 + t.tr.np * 0.4 > ctx.rng() * 0.9;
      ctx.act2({ actors: [t, s], cat: 'help', fx: function () { ctx.stress(s, open ? -20 : -5); ctx.mod2(t, s, { aff: 4 }, { trust: open ? 14 : 4, aff: open ? 8 : 2 }); }, text: open ? T(ctx, pk(ctx, ['放課後の空き教室で、{a}は{b}の話を一時間聞いた。{b}「…誰にも言えなかったんです」{a}「言ってくれてありがとう」', '{a}は{b}に缶のココアを渡した。「先生のおごり。何かあった？」{b}は少しずつ話し始めた。', '{a}「無理に話さなくていい。でも、先生はここにいるから」{b}の目から、ぽろっと涙が落ちた。']), t, s) : T(ctx, pk(ctx, ['{a}が「最近どう？」と声をかけた。{b}は「別に、普通です」とだけ答えた。', '{a}は{b}を呼び止めかけて、やめた。今はまだ、届かない気がした。']), t, s), why: s.name + 'の負担（' + Math.round(s.stress) + '）と担任のNP' });
    } },
    { id: 'question', w: function (ctx) { return 0.6; }, run: function (ctx, t) {
      var s = ctx.most(ctx.present(), function (c) { return c.tr.a * 0.6 + c.tr.honesty * 0.2 + ctx.rng() * 0.5; });
      ctx.act2({ actors: [s, t], cat: 'bond', fx: function () { ctx.mod2(s, t, { trust: 6, aff: 3 }, { aff: 5 }); }, text: T(ctx, pk(ctx, ['授業のあと、{b}が{a}に質問しに来た。{a}は職員室の椅子を一つ出してやった。', '{b}「先生、ここの問題、答えが二つある気がするんですけど」{a}は解答を見直して「…本当だ」と唸った。', '{b}は放課後、{a}のところに進路の本を借りに来た。', '{b}「先生って、なんで先生になったんですか」{a}は少し考えて「好きな先生がいたから」と答えた。']), t, s), why: s.name + 'のA（知りたい気持ち）' });
    } },
    { id: 'prank', w: function (ctx) { return ctx.present().some(function (c) { return c.tr.fc > 0.6; }) ? 0.7 : 0.1; }, run: function (ctx, t) {
      var s = ctx.most(ctx.present(), function (c) { return c.tr.fc + c.tr.impulse * 0.5 + ctx.rng() * 0.3; });
      var r = by(t, { CP: '{a}は無言で黒板消しを拾い、「{b}、これは何だ」と静かに言った。', NP: '{a}は「やったなー」と笑って、粉まみれのまま授業を始めた。', A: '{a}は扉の仕掛けを観察してから「力学的によくできてる」と言った。', FC: '{a}は大爆笑して、翌日同じ仕掛けを{b}にやり返した。', AC: '{a}は粉まみれのまま固まって、教室がざわついた。' });
      ctx.act2({ actors: [s, t], cat: 'bond', fx: function () { ctx.mod2(s, t, { aff: 4 }, { aff: style(t) === 'CP' ? -3 : 3, ten: style(t) === 'CP' ? 6 : 0 }); ctx.present().forEach(function (c) { ctx.stress(c, -3); }); }, text: T(ctx, '{b}が教室の扉に黒板消しを仕掛けた。見事に{a}の頭に落ちた。' + r, t, s), why: s.name + 'のFC×担任の気質' });
    } },
    { id: 'nickname', w: function () { return 0.4; }, run: function (ctx, t) {
      var s = ctx.most(ctx.present(), function (c) { return c.tr.fc + c.tr.warmth * 0.5 + ctx.rng() * 0.4; });
      var nick = pk(ctx, ['ちゃん付け', '名字の最初の二文字', '口癖', '好物の名前', '似ている動物']);
      ctx.act2({ actors: [s, t], cat: 'bond', fx: function () { ctx.present().forEach(function (c) { ctx.mod(c, t, { aff: 2 }); }); }, text: T(ctx, '{b}が{a}に「' + nick + '」由来のあだ名をつけた。一週間でクラス中に広まった。' + by(t, { CP: '{a}は「先生と呼びなさい」と言ったが、誰も聞いていなかった。', NP: '{a}はまんざらでもなさそうだった。', A: '{a}は「由来を説明しなさい」と言った。', FC: '{a}は自分でもそのあだ名で名乗り始めた。', AC: '{a}は困ったように笑っていた。' }), t, s), why: s.name + 'のFC・人懐こさ' });
    } },
    { id: 'rumor', w: function () { return 0.35; }, run: function (ctx, t) {
      var s = ctx.most(ctx.present(), function (c) { return c.tr.fc * 0.5 + c.tr.jealous * 0.3 + ctx.rng() * 0.4; });
      ctx.act2({ actors: [s, t], cat: 'bond', fx: function () { ctx.present().forEach(function (c) { ctx.stress(c, -2); }); }, text: T(ctx, pk(ctx, ['「{a}先生、指輪してたらしいよ」{b}の一言で、教室が朝から大騒ぎになった。', '{b}が「{a}先生が駅前でケーキを三つ買ってた」と報告した。誰と食べたのか、クラス会議が開かれた。', '{b}は{a}の昔の卒業アルバムを図書室で見つけた。髪型について、学年中に情報が回った。']), t, s), why: 'クラスの噂好き（' + s.name + 'のFC）' });
    } },
    { id: 'sick', w: function (ctx) { return ctx.flags.teacherSick ? 0 : 0.25; }, run: function (ctx, t) {
      ctx.flags.teacherSick = true;
      var s = ctx.most(ctx.present(), function (c) { return c.tr.np + c.tr.lead * 0.5 + ctx.rng() * 0.3; });
      ctx.act2({ actors: [s, t], cat: 'help', fx: function () { ctx.present().forEach(function (c) { ctx.mod(t, c, { aff: 4 }); ctx.mod(c, t, { aff: 3 }); }); ctx.mod(t, s, { aff: 6, trust: 6 }); }, text: T(ctx, '{a}が風邪で三日休んだ。{b}の提案で、クラス全員で寄せ書きを書いた。復帰した{a}は、黒板の前で少し黙ってから「…ありがとう」と言った。', t, s), why: s.name + 'のNP・主導性' });
    } },
    { id: 'rebel', w: function (ctx, t) { return ctx.present().some(function (c) { return c.tr.cp > 0.65 && R(ctx, c, t).ten > 15; }) ? 0.9 : 0.15; }, run: function (ctx, t) {
      var s = ctx.most(ctx.present(), function (c) { return c.tr.cp + c.tr.aggr * 0.5 + R(ctx, c, t).ten / 50; });
      var ok = t.tr.np + t.tr.a * 0.5 > 0.8;
      ctx.act2({ actors: [s, t], cat: 'conflict', fx: function () { ctx.mod2(s, t, ok ? { ten: -6, trust: 8 } : { ten: 12, trust: -8 }, ok ? { trust: 6 } : { ten: 8 }); }, text: T(ctx, '{b}「その校則、意味あるんですか」' + (ok ? '{a}「いい質問だ。じゃあ、意味がないと思う理由を三つ書いて持ってきなさい」次の日、{b}は本当に三枚書いてきた。' : '{a}「決まりは決まりだ」{b}は教室を出て行った。'), t, s), why: s.name + 'のCP（' + Math.round(s.eg.CP) + '）×担任の' + (ok ? 'NP・A' : 'CP') });
    } },
    { id: 'bullystop', w: function (ctx) { return bully(ctx) ? 1.2 : 0; }, run: function (ctx, t) {
      var B = bully(ctx), bad = ctx.chars[B.by], tg = ctx.chars[B.tg];
      var notice = t.tr.np * 0.5 + t.tr.a * 0.4 + t.tr.cp * 0.3 + B.level * 0.1 > ctx.rng() * 1.1;
      if (!notice) {
        ctx.act2({ actors: [t, tg], cat: 'solo', fx: function () { ctx.mod(tg, t, { trust: -8 }); ctx.stress(tg, 6); }, text: T(ctx, pk(ctx, ['{a}は教室の空気の変化に、気づかなかった。{b}が助けを求める目で見ていたことにも。', '{b}の机の落書きは、{a}が教室に入る前に消されていた。', '{a}は「最近みんな仲いいね」と言った。{b}は笑えなかった。']), t, tg), why: '担任が見落とした（NP・A・CP の合計が届かず）' });
        return;
      }
      var strong = t.tr.cp > 0.55 || t.tr.np > 0.6;
      if (strong) {
        B.stopped = { how: 'teacher', by: t.i, at: ctx.label }; ctx.flags.bullyEnd = ctx.stepIndex;
        note(ctx, 'いじめ：' + bad.name + '→' + tg.name + '（' + B.since + '〜' + ctx.label + '）。担任の' + t.name + 'が止めた。');
      }
      ctx.act2({ actors: [t, bad, tg], cat: 'help', fx: function () { ctx.mod(tg, t, { trust: strong ? 25 : 8, aff: strong ? 15 : 5 }); ctx.mod(bad, t, { ten: strong ? 20 : 6 }); ctx.stress(tg, strong ? -25 : -6); },
        text: strong ? T(ctx, by(t, { CP: '{a}は教室に入るなり、黒板の落書きを指さした。「書いた者は、今ここで名乗り出なさい」声は低く、誰も目を逸らせなかった。', NP: '{a}は{b}を放課後に呼び、ただ「気づくのが遅くなって、ごめん」と頭を下げた。次の日から、{a}は休み時間も教室にいるようになった。', A: '{a}は日付と出来事を一つずつ確かめ、関わった生徒全員と個別に面談した。一週間で、教室の空気が変わった。', FC: '{a}は授業を潰して「人をからかうこと」についてクラス全員と話し合った。最後に{a}は「先生は、このクラスが好きだからな」と言った。', AC: '{a}は震える声で、それでもはっきり言った。「…やめなさい。先生は、許しません」' }), t, tg) : T(ctx, '{a}は異変に気づいて声をかけたが、{b}は「大丈夫です」と首を振った。', t, tg),
        why: '担任の' + (strong ? (t.tr.cp > 0.55 ? 'CP（毅然と叱る）' : 'NP（守ろうとする）') : '気づき（でも踏み込めなかった）') });
    } },
    { id: 'visit', w: function (ctx) { return ctx.chars.some(function (c) { return c.alive && c.out && c.flags.absent; }) ? 1 : 0; }, run: function (ctx, t) {
      var s = ctx.chars.filter(function (c) { return c.alive && c.out && c.flags.absent; })[0];
      var open = t.tr.np * 0.6 + R(ctx, s, t).trust / 60 > ctx.rng() * 0.9;
      ctx.act2({ actors: [t, s], cat: 'help', fx: function () { ctx.stress(s, open ? -18 : -4); ctx.mod(s, t, { trust: open ? 14 : 3, aff: open ? 8 : 0 }); }, text: open ? T(ctx, '{a}が家庭訪問に来た。{b}はドア越しに少しだけ話した。{a}「教室の席、ちゃんと空けてあるから」', t, s) : T(ctx, '{a}が家庭訪問に来た。{b}は部屋から出てこなかった。{a}はプリントと、手書きのメモを置いて帰った。', t, s), why: '担任の家庭訪問（NP ' + Math.round(t.eg.NP) + '）' });
    } },
    { id: 'career', w: function (ctx) { return ctx.env.grade === '3' ? 1 : 0.3; }, run: function (ctx, t) {
      var s = pk(ctx, ctx.present());
      ctx.act2({ actors: [t, s], cat: 'bond', fx: function () { ctx.mod(s, t, { trust: 6 }); }, text: T(ctx, pk(ctx, ['三者面談で、{a}は{b}の親の前で「{b}さんは、人の痛みがわかる子です」と言った。{b}は帰り道、ずっと黙っていた。', '{a}「{b}は何がしたい？」{b}「…わかりません」{a}「わからないって言えるのは、ちゃんと考えてる証拠だよ」', '{a}は{b}の志望校の欄を見て、「もう一段上を狙ってみないか」と言った。', '{a}は{b}に、自分の大学時代の失敗談を話した。{b}は初めて{a}の前で笑った。']), t, s), why: '進路相談' });
    } },
    { id: 'event', w: function (ctx) { return /9月|10月|11月/.test(ctx.label) ? 1 : 0.1; }, run: function (ctx, t) {
      var s = ctx.most(ctx.present(), function (c) { return c.tr.lead + c.tr.fc * 0.5 + ctx.rng() * 0.4; });
      ctx.act2({ actors: [t, s], cat: 'bond', fx: function () { ctx.present().forEach(function (c) { ctx.mod(c, t, { aff: 3 }); ctx.stress(c, -4); }); }, text: T(ctx, pk(ctx, ['体育祭の教員リレーで、{a}は本気で走ってこけた。クラス全員が笑いながら拍手した。', '文化祭の準備で、{a}は夜八時まで段ボールを切っていた。{b}「先生、帰らなくていいんですか」{a}「…楽しいから」', '{a}はクラスの出し物の衣装を、なぜか自分で着ることになった。写真は卒業アルバムに載った。', '文化祭の打ち上げで、{a}は全員にジュースを奢った。{b}「先生、太っ腹！」']), t, s), why: '行事での担任' });
    } },
    { id: 'valentine', w: function (ctx) { return ctx.label === '2月' ? 1.5 : 0; }, run: function (ctx, t) {
      var s = ctx.most(ctx.present(), function (c) { return c.tr.np + c.tr.warmth * 0.5 + ctx.rng() * 0.4; });
      ctx.act2({ actors: [s, t], cat: 'bond', fx: function () { ctx.mod2(s, t, { aff: 3 }, { aff: 4 }); }, text: T(ctx, pk(ctx, ['{b}が「クラスから」と言って、{a}に義理チョコを渡した。{a}は職員室で、それを一番目立つ場所に置いた。', '{b}たちは{a}の机に、クラス全員の名前入りのチョコを置いておいた。']), t, s), why: 'バレンタイン（クラスからの感謝）' });
    } },
    { id: 'graduation', w: function (ctx) { return ctx.label === '3月' ? 3 : 0; }, run: function (ctx, t) {
      var fav = ctx.most(ctx.present(), function (c) { return R(ctx, c, t).trust + R(ctx, c, t).aff; });
      ctx.act2({ actors: [t, fav], cat: 'bond', fx: function () { ctx.present().forEach(function (c) { ctx.mod(c, t, { aff: 4 }); }); }, text: T(ctx, by(t, { CP: '最後のホームルームで、{a}は「…以上だ」と言ったあと、しばらく窓の外を見ていた。{b}が「先生、泣いてます？」と言った。「泣いてない」', NP: '最後のホームルームで、{a}は一人ずつ名前を呼んで、一言ずつ言葉をかけた。{b}の番で、声が詰まった。', A: '最後のホームルームで、{a}は一年間の記録を読み上げた。最後の行は「楽しかった」だった。', FC: '最後のホームルームで、{a}はクラス全員と写真を撮った。撮り直しは十二回に及んだ。', AC: '最後のホームルームで、{a}は用意した原稿を読もうとして、一行目で泣いた。{b}が「がんばれー」と言った。' }), t, fav), why: '一年の終わり。最も慕っていた生徒：' + fav.name });
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
    if (s === 0 && ctx.teacher) ctx.say({ text: '担任は' + ctx.teacher.name + '。' + by(ctx.teacher, { CP: '「一年間、甘やかすつもりはない」と最初に言った。', NP: '「困ったことがあったら、いつでも言ってね」と笑った。', A: '黒板に一年の計画表を書き出した。', FC: '自己紹介でいきなりギターを弾いた。', AC: '自己紹介の声が、少し震えていた。' }) });
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
  };
})();
