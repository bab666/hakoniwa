/* 箱庭シミュレーター: 両片想い（お互いに想っているのに、相手は自分を何とも思っていないと思い込んでいる二人）
   関係「片想い」の想われる側の気持ちを「実は想っている（両片想い）」にした二人や、どちらからも片想いを設定した二人に起きる出来事。
   相手にされていない片想い（unreq.js）と同じく、合コン・教室・無人島・出られない部屋・ゾンビの街で起きる。
   目が合ってそらす／言いかけてやめる／相手の優しさを別の誰かへの好意と勘違いする／同じ人に恋の相談をする／冗談めかして言って流される、
   を重ねたあと、どちらかが告白して実る（重ねるほど起きやすい）。ほかの誰かが近づいて焦って告白する展開もある（合コンでは起きやすく、踏み切るのは2割ほど、控え目どうしなら1割ほど）。{a}{b}=両片想いの二人、{c}=巻き込まれる人
   ・設定の「両片想い」は、箱庭に渡す前に向きを逆にした片想い二本に開く（HK.Ties.expand。pining-core.js）
   分割読み込み：このファイルは恋愛系のかたまり（pack-rel。ゾンビの街の出来事の表に足すため）、開く包みは中核の pining-core.js */
(function () {
  'use strict';
  var HK = window.HK;
  if (!HK || !HK.Ties) return;
  function L(s) { return s.split('|'); }
  function fill(t, m) { return t.replace(/\{(\w+)\}/g, function (x, k) { return m[k] != null ? m[k] : x; }); }
  function alive(c) { return c && c.alive !== false && !c.out; }

  /* 設定の「両片想い」を開く包み（HK.simulate）は、どの箱庭でも要るので中核の pining-core.js にある */

  var P = HK.Pining = {};
  P.is = function (ctx, a, b) { return alive(a) && alive(b) && HK.Ties.pining(ctx, a, b); };
  /* 二人のどちらとも親しい第三者（相談相手） */
  function confidant(ctx, a, b) {
    var best = null, bv = 15;
    ctx.chars.forEach(function (c) {
      if (c === a || c === b || !alive(c)) return;
      var v = Math.min(ctx.R(a, c).trust + ctx.R(a, c).aff, ctx.R(b, c).trust + ctx.R(b, c).aff) / 2;
      if (v > bv) { bv = v; best = c; }
    });
    return best;
  }
  /* b に近づく第三者（b を恋愛の相手にできる人。惹かれの強い人ほど） */
  function suitor(ctx, a, b) {
    var best = null, bv = -1;
    ctx.chars.forEach(function (c) {
      if (c === a || c === b || !alive(c) || !HK.canLove(c, b) || ctx.pair(c, b).couple) return;
      var v = ctx.R(c, b).att + ctx.R(c, b).aff * 0.3;
      if (v > bv) { bv = v; best = c; }
    });
    return best;
  }
  function anyOther(ctx, a, b) { var l = ctx.chars.filter(function (c) { return c !== a && c !== b && alive(c); }); return l.length ? l[ctx.rng.int ? ctx.rng.int(l.length) : Math.floor(ctx.rng() * l.length)] : null; }
  var WHY = function (a, b) { return a.name + 'と' + b.name + 'は両片想い（お互いに想っているのに、相手は何とも思っていないと思い込んでいる）'; };

  var D = P.TEXT = {
    /* 目が合って、そらす */
    glance: {
      goukon: L('{a}と{b}は、乾杯のたびに目が合った。そのたびに、どちらも先にグラスへ視線を落とした。|{a}が{b}の方を見ると、{b}は慌てて隣の人との話に戻った。その少しあと、{b}が{a}を見ると、{a}はメニューを読むふりをしていた。|{a}は{b}の笑い声がするたびに、そちらを見ないように気をつけていた。{b}も、まったく同じことをしていた。'),
      classroom: L('{a}は授業中、斜め前の{b}の背中ばかり見ていた。{b}が振り向いた瞬間、{a}は黒板を睨みつけた。{b}も、すぐに前を向いた。|廊下ですれ違うとき、{a}と{b}はどちらも目を逸らした。すれ違ってから、どちらも少しだけ振り返った。|{a}と{b}は、窓ガラスに映った相手と目が合った。二人とも、何事もなかったように教科書をめくった。'),
      island: L('火の向こうで、{a}と{b}の目が合った。{a}は薪をくべるふりをして、{b}は海の方を向いた。|{a}は浜で魚を捌く{b}の横顔を見ていた。{b}が顔を上げると、{a}は急に空模様を気にしはじめた。|{a}と{b}は、同じ椰子の実に同時に手を伸ばした。指が触れて、どちらも慌てて手を引っ込めた。'),
      whiteroom: L('白い部屋では、目を逸らす場所がなかった。{a}と{b}は何度も目が合っては、どちらも壁の継ぎ目を数えるふりをした。|{a}は{b}の寝顔を見ていた。{b}が目を開けたので、{a}は慌てて扉の紙を読み返した。|{a}と{b}は、壁を背に並んで座っていた。肩が触れそうで触れない距離を、どちらも動かなかった。'),
      zombie: L('見張りの交代のとき、{a}と{b}の目が合った。「……異常なし｜＝｜……異常ありません」「……うん｜……ああ｜……はい」――言いたいことは、それではなかった。|{a}は物資を分ける{b}の手元ばかり見ていた。{b}が顔を上げると、{a}は窓の外の通りを確かめるふりをした。|暗い部屋で、{a}と{b}は同じ毛布の端を掴んでいた。どちらも、手を離さなかった。どちらも、何も言わなかった。'),
      any: L('{a}と{b}は目が合うたびに、どちらも先に逸らした。|{a}は{b}を見ていた。{b}も{a}を見ていた。ただ、二人とも、相手が見ていないときにだけ見ていた。')
    },
    /* 言いかけて、やめる */
    almost: L('{a}「あのさ、{b}……」――{b}「なに？｜何だ？｜何ですか？」――{a}「……いや、なんでもない｜……いや、何でもない｜……いえ、何でもありません」――{b}は「そっか｜そうか｜そうですか」と笑った。少しだけ、期待していた自分に呆れながら。|{b}が「{a}って、好きな人いるの？｜{a}には、好きな人がいるのか？｜{a}って、好きな人はいるんですか？」と訊いた。{a}は「……いるよ｜……いる｜……います」とだけ答えた。{b}は「そっか｜そうか｜そうですか」と言ったきり、その相手が自分だとは思いもしなかった。|{a}は{b}と二人きりになった。言うなら今だと思った。{b}も同じことを考えていた。結局、二人で天気の話をして終わった。|{a}「{b}はさ、私のこと――」――そこで邪魔が入った。{a}はほっとして、{b}はがっかりした。どちらも、相手の顔は見ていなかった。|{a}と{b}は同時に「あの」と言った。「先にどうぞ」「いや、そっちが｜いや、そちらが先だ｜いえ、そちらが先です」――譲り合っているうちに、言いたかったことは喉の奥に戻っていった。'),
    /* 相手の優しさを、別の誰かへの好意と勘違いする（{c}） */
    misread: L('{b}が{c}と楽しそうに話しているのを見て、{a}は「やっぱりそうか｜＝｜やっぱりそうですか」と一人で納得した。{b}がそのとき話していたのは、{a}のことだった。|{a}は{c}の相談に乗っていた。それを遠くから見た{b}は、二人はお似合いだと思って、そっと胸の奥に蓋をした。|{b}は{c}に、{a}の好きなものをこっそり訊いていた。それを見た{a}は、{b}は{c}が好きなのだと思い込んだ。|{a}は{b}が{c}の隣に座るのを見て、自分の入る隙間はないと思った。{b}は{a}の隣に座る勇気がなくて、{c}の隣に逃げただけだった。'),
    /* 同じ人に、恋の相談をする（{c}が気づく） */
    consult: L('{a}は{c}に、{b}のことが好きだと打ち明けた。「でも、向こうは何とも思ってないから｜だが、向こうは何とも思っていない｜でも、向こうは何とも思っていませんから」――その日の夕方、{c}は{b}からまったく同じ相談をされた。{c}は天を仰いだ。|{c}は、{a}と{b}の両方から「内緒の相談」をされていた。中身は同じだった。{c}は二人の顔を交互に見て、深くため息をついた。|{b}は{c}に「{a}って、好きな人いると思う？｜{a}に、好きな人はいると思うか？｜{a}って、好きな人がいると思いますか？」と訊いた。{c}はつい昨日、{a}から同じ質問をされたばかりだった。'),
    consultHint: L('{c}は「……二人とも、もう少し周りを見たら？｜……二人とも、もう少し周りを見たらどうだ｜……二人とも、もう少し周りを見たらどうですか」とだけ言った。|{c}は何も言わなかった。ただ、次の席替えで{a}と{b}を隣にした。|{c}は「自分で確かめなよ｜自分で確かめろ｜自分で確かめてください」と、{a}の背中を押した。'),
    /* 相手が誰かと親しくしているのを見て、胸がざわつく（どちらも） */
    jealous: L('{b}が{c}に笑いかけるのを見て、{a}は胸の奥がちくりとした。その夜、{a}が{c}と話し込んでいるのを見た{b}も、同じ痛みを味わっていた。|{a}は{c}と肩を並べる{b}を見て、黙って席を外した。{b}はその背中を目で追いかけて、自分が何かしたのかと悩んだ。|{a}は{b}が{c}のことを褒めるたびに、少しずつ口数が減った。{b}は、{a}の機嫌が悪いのは自分のせいだと思い込んでいた。'),
    /* 冗談めかして言って、冗談として流される */
    joke: L('{a}は冗談めかして「{b}のこと、好きかもな｜{b}のことが、好きかもしれない｜{b}のこと、好きかもしれません」と言った。{b}は「はいはい」と笑って流した。笑った{b}の耳が赤かったことに、{a}は気づかなかった。|{b}が「{a}と付き合う人は幸せだろうな｜＝｜{a}と付き合う人は幸せでしょうね」と言った。{a}は「じゃあ{b}が付き合ってよ｜では{b}が付き合ってくれ｜じゃあ{b}が付き合ってください」と返して、二人とも笑った。笑いが途切れたあとの沈黙が、少し長かった。|{a}が「好きだよ｜好きだ｜好きです」と言った。直前の話の流れで、それは{b}の作った料理のことになった。{a}は訂正しなかった。'),
    /* 告白（実る） */
    confessAt: {
      goukon: '店を出たあと、駅までの道で、{a}は立ち止まった。',
      classroom: '放課後の誰もいない教室で、{a}は{b}を呼び止めた。',
      island: '夜の浜辺で、波の音にまぎれるように、{a}は口を開いた。',
      whiteroom: '扉の紙を見つめたまま、{a}は小さな声で言った。',
      zombie: '「明日、生きてるか分からないから｜明日、生きているか分からないから｜明日、生きているか分かりませんから」――{a}はそう前置きして、{b}の目を見た。',
      any: '二人きりになったとき、{a}はとうとう口を開いた。'
    },
    confess: L('「ずっと好きだった。……迷惑なら、忘れて｜ずっと好きだった。……迷惑なら、忘れてくれ｜ずっと好きでした。……迷惑なら、忘れてください」――{b}は目を丸くして、それから、泣きそうな顔で笑った。「……こっちの台詞なんだけど｜……こちらの台詞だ｜……こちらの台詞なんですけど」|「好きだ｜＝｜好きです」――{a}がそう言うと、{b}は長いあいだ黙っていた。「……なんで先に言うの。ずっと言おうと思ってたのに｜……なぜ先に言う。ずっと言おうと思っていたのに｜……どうして先に言うんですか。ずっと言おうと思っていたんですよ」|「{b}のことが好き｜{b}のことが好きだ｜{b}のことが好きです」――言い終わる前に、{b}も「好き｜好きだ｜好きです」と言っていた。二人の声が重なって、どちらが先だったのか分からなかった。|{a}は「好きなんだ｜好きなのだ｜好きなんです」と言った。{b}は「知らなかった｜＝｜知りませんでした」と言った。「……私も、ずっと、そうだったのに｜……私も、ずっと、そうだったのだが｜……私も、ずっと、そうだったんです」|「振られるのは分かってる。でも、言わないと後悔するから｜振られるのは分かっている。だが、言わないと後悔する｜振られるのは分かっています。でも、言わないと後悔しますから」――{b}は首を振った。「振らないよ。……ずっと、待ってた｜振らない。……ずっと、待っていた｜振りません。……ずっと、待っていました」'),
    /* ほかの誰か（{c}）が、{b}に近づく。それを見た{a}が焦る */
    approach: {
      goukon: L('{c}が席を替わって{b}の隣に座り、「このあと、二人で飲み直さない？｜このあと、二人で飲み直さないか？｜このあと、二人で飲み直しません？」と声を潜めた。{b}は曖昧に笑っていた。グラスを持つ{a}の手に、力がこもった。|{c}は{b}に連絡先を訊いていた。{b}がスマホを取り出すのを、{a}は向かいの席から黙って見ていた。|「{b}さんって、彼氏とか彼女とかいるの？｜{b}さんには、彼氏や彼女はいるのか？｜{b}さんって、彼氏とか彼女とかいるんですか？」――{c}がそう訊くのが、{a}の耳にも届いた。{b}が「いないよ｜いない｜いません」と答えると、{c}は「じゃあ立候補しようかな｜では立候補しようか｜じゃあ立候補しましょうか」と笑った。'),
      classroom: L('昼休み、{c}が{b}を廊下に呼び出したという噂が、{a}の耳に入った。「告白されたらしいよ」――{a}は、弁当の味がしなくなった。|{c}が{b}を、文化祭を一緒に回ろうと誘っていた。{b}が「考えとく｜考えておく｜考えておきます」と答えるのを、{a}は少し離れた席で聞いていた。'),
      island: L('{c}は、{b}のために一番大きな貝を採ってきて、照れくさそうに差し出した。{b}が礼を言って笑うのを、{a}は焚き火の向こうから見ていた。|夜の浜辺で、{c}が{b}の隣に腰を下ろすのが見えた。二人の影は、{a}が思っていたよりずっと近かった。'),
      whiteroom: L('{c}が{b}の肩に上着をかけて、「寒くない？｜寒くないか？｜寒くないですか？」と囁いた。白い部屋では、その声は{a}にもはっきり聞こえた。|{c}は「ここを出たら、ご飯でも行こうよ｜ここを出たら、ご飯でも行こう｜ここを出たら、ご飯でも行きましょう」と{b}を誘った。{b}は「いいね｜いいな｜いいですね」と頷いた。{a}は壁を見つめたまま、拳を握った。'),
      zombie: L('{c}は「私が守るから｜私が守る｜私が守ります」と言って、{b}の隣で見張りを買って出た。{b}が「ありがとう｜＝｜ありがとうございます」と笑うのを、{a}は暗がりから見ていた。|{c}が{b}の怪我の手当てをしていた。指先がやけに優しく見えて、{a}は目を逸らした。'),
      any: L('{c}が{b}に親しげに話しかけ、{b}も笑って応えていた。{a}は、その様子から目を離せなかった。|{c}は{b}を二人きりに誘った。{b}がすぐに断らなかったのを、{a}は見てしまった。')
    },
    /* 焦って告白（{c}が割って入る前に） */
    rush: L('{a}は立ち上がり、{b}の腕を掴んだ。「ちょっと、いい？｜少し、いいか？｜ちょっと、いいですか？」――人のいないところまで連れ出して、{a}は息を吸った。「……ほかの人のところに行かないで。好きなんだ、ずっと｜……ほかの人のところに行くな。好きなんだ、ずっと｜……ほかの人のところに行かないでください。ずっと、好きだったんです」――{b}は呆然として、それから、耳まで赤くなった。「……今それ言う？　こっちは、ずっと言えなかったのに｜……今それを言うのか。こちらは、ずっと言えなかったのに｜……今それを言うんですか？　こちらは、ずっと言えなかったんですよ」|{a}は{c}と{b}のあいだに割って入った。「ごめん、{b}は先約があるから｜すまない、{b}は先約がある｜ごめんなさい、{b}は先約がありますから」――{b}が「え？」と見上げると、{a}は目を逸らしたまま言った。「……私が、誘うつもりだったから。ずっと前から｜……私が、誘うつもりだった。ずっと前から｜……ずっと前から、私が誘うつもりだったんです」――{b}は少し黙って、「……遅いよ｜……遅い｜……遅いです」と笑った。その目は、少し潤んでいた。|{c}が離れた隙に、{a}は{b}の隣に滑り込んだ。「さっきの、行くの？｜さっきのに、行くのか？｜さっきの、行くんですか？」「……どうしようかなって｜……どうしようかと考えている｜……どうしようかなと思っています」「行かないでほしい。……好きだから｜行かないでほしい。……好きだからだ｜行かないでほしいです。……好きですから」――{b}は手元のグラスを見つめたまま、小さく言った。「それ、こっちがずっと言いたかったやつ｜それは、こちらがずっと言いたかったことだ｜それ、こちらがずっと言いたかったことです」'),
    /* 焦ったけれど、言えなかった */
    stall: L('{a}は何か言おうとして、結局、グラスの中身を飲み干しただけだった。{b}は、{a}が引き止めてくれないことに、少しだけ傷ついていた。|{a}は「よかったじゃん｜よかったな｜よかったですね」と笑ってみせた。{b}も「でしょ｜だろう｜でしょう」と笑った。二人とも、ひどく下手な笑い方だった。|{a}はその場を離れた。{b}は{c}の話に相槌を打ちながら、去っていく{a}の背中ばかり見ていた。'),
    after: L('お互いに「何とも思われていない」と思い込んでいた時間を数えて、二人は同時に吹き出した。|{c}は、ようやくくっついた二人を見て、「長かった……｜＝｜長かったです……」と心の底から呟いた。|{a}と{b}は、それまでのすれ違いを一つずつ答え合わせした。どれも、全部、勘違いだった。')
  };
  function sc(ctx, tbl) { return tbl[ctx.scen.id] || tbl.any; }
  function bump(ctx, a, b) { var pf = ctx.pair(a, b); pf.pn = (pf.pn || 0) + 1; return pf; }
  function mk(id, cat, w, when, run) { return { id: id, cat: cat, scope: 'pair', mini: true, sig: true, when: when, w: w, run: run }; }

  var LIST = P.EVENTS = [
    mk('pn_glance', 'romance', function (ctx, a) { return 1.8 + a.tr.ac * 0.5; },
      function (ctx, a, b) { return P.is(ctx, a, b) && (ctx.pair(a, b).pnGl || 0) < 3; },
      function (ctx, a, b) {
        var pf = bump(ctx, a, b); pf.pnGl = (pf.pnGl || 0) + 1;
        ctx.mod2(a, b, { att: 3 }, { att: 3 });
        return { text: fill(ctx.pick(sc(ctx, D.glance)), { a: a.name, b: b.name }), why: WHY(a, b) };
      }),
    mk('pn_almost', 'romance', function (ctx, a) { return 1.5 + a.tr.honesty * 0.4 + a.tr.ac * 0.4; },
      function (ctx, a, b) { return P.is(ctx, a, b) && (ctx.pair(a, b).pnAl || 0) < 2; },
      function (ctx, a, b) {
        var pf = bump(ctx, a, b); pf.pnAl = (pf.pnAl || 0) + 1;
        ctx.stress(a, 4); ctx.stress(b, 4); ctx.mod2(a, b, { att: 3 }, { att: 3 });
        return { text: fill(ctx.pick(D.almost), { a: a.name, b: b.name }), why: WHY(a, b) + '／どちらも、あと一言が言えなかった', mag: 18 };
      }),
    mk('pn_misread', 'romance', function (ctx, a) { return 1.2 + a.tr.ac * 0.4 + a.tr.jealous * 0.4; },
      function (ctx, a, b) { return P.is(ctx, a, b) && !ctx.pair(a, b).pnMr && !!anyOther(ctx, a, b); },
      function (ctx, a, b) {
        var c = confidant(ctx, a, b) || anyOther(ctx, a, b), pf = bump(ctx, a, b); pf.pnMr = true;
        ctx.stress(a, 8);
        return { text: fill(ctx.pick(D.misread), { a: a.name, b: b.name, c: c.name }), why: WHY(a, b) + '／' + a.name + 'は、' + b.name + 'の想う相手を' + c.name + 'だと勘違いした', mag: 20, with: [c] };
      }),
    mk('pn_jealous', 'romance', function (ctx, a) { return 1.0 + a.tr.jealous * 0.6; },
      function (ctx, a, b) { return P.is(ctx, a, b) && !ctx.pair(a, b).pnJe && !!anyOther(ctx, a, b) && (!HK.Obsess || !HK.Obsess.jealOk || HK.Obsess.jealOk(ctx, a, b)); },
      function (ctx, a, b) {
        var c = anyOther(ctx, a, b), pf = bump(ctx, a, b); pf.pnJe = true;
        ctx.stress(a, 6); ctx.stress(b, 6); ctx.mod2(a, b, { att: 2 }, { att: 2 });
        return { text: fill(ctx.pick(D.jealous), { a: a.name, b: b.name, c: c.name }), why: WHY(a, b) + '／どちらも、相手が' + c.name + 'を想っていると思い込んだ', mag: 18, with: [c] };
      }),
    mk('pn_consult', 'bond', function () { return 1.4; },
      function (ctx, a, b) { return P.is(ctx, a, b) && !ctx.pair(a, b).pnCo && !!confidant(ctx, a, b); },
      function (ctx, a, b) {
        var c = confidant(ctx, a, b), pf = bump(ctx, a, b), m = { a: a.name, b: b.name, c: c.name };
        pf.pnCo = true; pf.pnHint = ctx.rng() < 0.6;
        ctx.mod(a, c, { trust: 5 }); ctx.mod(b, c, { trust: 5 });
        return { text: fill(ctx.pick(D.consult), m) + (pf.pnHint ? fill(ctx.pick(D.consultHint), m) : ''), why: WHY(a, b) + '／' + c.name + 'だけが、二人の気持ちを知ってしまった', mag: 24, with: [c] };
      }),
    mk('pn_joke', 'romance', function (ctx, a) { return 1.0 + a.tr.fc * 0.5; },
      function (ctx, a, b) { return P.is(ctx, a, b) && !ctx.pair(a, b).pnJo; },
      function (ctx, a, b) {
        var pf = bump(ctx, a, b); pf.pnJo = true;
        ctx.mod2(a, b, { att: 4 }, { att: 4 });
        return { text: fill(ctx.pick(D.joke), { a: a.name, b: b.name }), why: WHY(a, b) + '／本気の言葉が、冗談として流れていった', mag: 18 };
      }),
    /* ほかの誰かが近づいて、焦って告白する（合コンでは特に起きやすい）。合コン一回で、この展開になるのは2割ほど（近づかれるのが4割強、そこで踏み切るのが半分弱）、控え目どうしなら1割ほど */
    mk('pn_rival', 'romance', function (ctx) { return ctx.scen.id === 'goukon' ? 4 : 0.8; },
      function (ctx, a, b) { return P.is(ctx, a, b) && !ctx.pair(a, b).pnRv && !!suitor(ctx, a, b); },
      function (ctx, a, b) {
        var pf = bump(ctx, a, b), c = suitor(ctx, a, b), m = { a: a.name, b: b.name, c: c.name };
        pf.pnRv = true;
        ctx.mod(c, b, { att: 6 }); ctx.stress(a, 10);
        var shy = function (x) { return x.tr.ac > 0.6 && x.tr.fc < 0.45; };
        var p = shy(a) && shy(b) ? 0.22 : shy(a) ? 0.33 : 0.46;
        var open = fill(ctx.pick(sc(ctx, D.approach)), m);
        if (ctx.rng() < p && HK.canLove(a, b) && HK.canLove(b, a) && (!HK.Poly || HK.Poly.canTry(ctx, a, b))) {
          pf.couple = true; pf.pnDone = true;
          ctx.mod2(a, b, { att: 14, aff: 12, trust: 10 }, { att: 14, aff: 12, trust: 10 });
          ctx.stress(a, -14); ctx.stress(b, -10);
          return { text: open + fill(ctx.pick(D.rush), m), why: WHY(a, b) + '／' + c.name + 'が' + b.name + 'に近づいたのを見て、' + a.name + 'は焦って想いを口にした。両片想いが、両想いになった', mag: 44, with: [c] };
        }
        ctx.stress(b, 6);
        return { text: open + fill(ctx.pick(D.stall), m), why: WHY(a, b) + '／' + c.name + 'が' + b.name + 'に近づいた。' + a.name + 'は焦ったが、言えなかった' + (shy(a) ? '（控え目な性格）' : ''), mag: 26, with: [c] };
      }),
    /* 告白：すれ違いを重ねるほど、背中を押されているほど起きやすい */
    mk('pn_confess', 'romance', function (ctx, a, b) { var pf = ctx.pair(a, b); return 0.4 + (pf.pn || 0) * 0.6 + (pf.pnHint ? 1.2 : 0) + a.tr.honesty * 0.4 + a.tr.impulse * 0.3 + a.stress / 200; },
      function (ctx, a, b) { var pf = ctx.pair(a, b); return P.is(ctx, a, b) && (pf.pn || 0) >= 2 && HK.canLove(a, b) && HK.canLove(b, a) && (!HK.Poly || HK.Poly.canTry(ctx, a, b)); },
      function (ctx, a, b) {
        var pf = ctx.pair(a, b), c = confidant(ctx, a, b), m = { a: a.name, b: b.name, c: c ? c.name : '' };
        pf.couple = true; pf.pnDone = true;
        ctx.mod2(a, b, { att: 14, aff: 12, trust: 10 }, { att: 14, aff: 12, trust: 10 });
        ctx.stress(a, -10); ctx.stress(b, -10);
        var aft = D.after.filter(function (t) { return c || t.indexOf('{c}') < 0; });
        return { text: fill(sc(ctx, D.confessAt), m) + fill(ctx.pick(D.confess), m) + fill(ctx.pick(aft), m), why: WHY(a, b) + '／すれ違いを' + (pf.pn || 0) + '回重ねて、' + a.name + 'が先に言った。両片想いが、ようやく両想いになった', mag: 44, with: c && pf.pnCo ? [c] : null };
      })
  ];

  ['goukon', 'classroom', 'island', 'whiteroom'].forEach(function (id) { if (HK.addMini) HK.addMini(id, LIST); });
  /* ゾンビの街：同じエリアにいる者どうしの出来事として足す */
  /* ゾンビの街にも混ぜる。写しは今（元の順の位置で）作り、足すのはゾンビの街の本体（scen-zombie）が有るとき（HK.atScen。分割読み込みでは後から届く）。
     足す位置は HK.addTo で元のファイルの順に保つ */
  var ZC = LIST.map(function (e) { var e2 = {}; for (var k in e) e2[k] = e[k]; e2.mini = false; return e2; });
  HK.atScen('zombie', function () { var Z = HK.ZB; if (Z && Z.scen) HK.addTo(Z.scen.events, ZC); });
})();
/* @labels（出来事の一覧の表示名。工場で作る出来事に付ける。1 行に「id=表示名」、id の * は何にでも当たる。hakoniwa-tools/build/event-catalog.js が読む）
   pn_glance=両片想いの二人の目が合ってそらす
   pn_almost=両片想いの二人があと一言を言えない
   pn_misread=相手の優しさを別の人への好意と勘違い
   pn_jealous=両片想いの相手が誰かと親しくて妬く
   pn_consult=同じ人に恋の相談をする
   pn_joke=本気の言葉が冗談として流れる
   pn_rival=ほかの人が近づいて焦る
   pn_confess=両片想いがついに告白で実る
*/
