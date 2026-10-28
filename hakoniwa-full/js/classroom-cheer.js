/* 箱庭シミュレーター: クラスメイト ― 恋を応援する、仲良し系の出来事（全年齢版・R18版の共通）
   設計指針：複数人が絡む恋愛の出来事は、すれ違い系（嫉妬・三角関係）と仲良し系（応援・祝福・ダブルデート）を半々くらいに。
   クラスメイトはすれ違い系に寄っていたので、友達が恋を応援する場面を足す。点検は hakoniwa-tools/tone-check/group-audit.js
   ・告白の練習に付き合う／席替えで隣にする／文化祭でペアにする／二人きりにする／チョコ作りを手伝う（片想い・想い合っている二人）
   ・付き合い始めた二人を冷やかして祝福する／噂から守る（恋人どうし）
   ・ダブルデート（放課後・夏祭り・冬の街）／想いが届かなかった友達を励ます／恋の相談
   {a}＝応援する友達（恋の相手としては割り込まない）、{b}・{c}＝恋の二人。道具は rel-group.js の HK.RelGroup
   登場人物はすべて成人として扱う */
(function () {
  'use strict';
  var HK = window.HK, scen = HK.SCENARIOS && HK.SCENARIOS.classroom, G = HK.RelGroup;
  if (!scen || !G) return;
  var L = G.L;
  function R(ctx, a, b) { return ctx.R(a, b); }
  function stu(c) { return !!c && c.role !== 'teacher'; }
  function mon(ctx) { return String(ctx.label || ''); }
  function inMon(ctx, list) { return list.indexOf(mon(ctx)) >= 0; }
  /* 片想い・想い合っている相手（恋人でない） */
  function wish(ctx, b, not) { var c = G.mutualOf(ctx, b, not) || G.crushOf(ctx, b, not); return stu(c) ? c : null; }
  function lover(ctx, b, not) { var c = G.partnerOf(ctx, b, not); return stu(c) ? c : null; }
  function ok3(ctx, a, b, c) { return stu(a) && stu(b) && stu(c) && G.thirdOk(ctx, a, b, c); }
  function ev(o) { scen.events.push(o); }
  function W(x) { return function (ctx, a) { return x * (0.6 + a.tr.np * 0.4 + (a.tr.warmth || 0) * 0.4); }; }

  var T = {
    practice: L('放課後の空き教室で、{a}は{c}の役を引き受けた。{b}は三回噛んで、四回目でやっと最後まで言えた。{a}は拍手をして、「今の、本番でもいける｜今のなら、本番でもいける｜今のなら、本番でもいけます」と親指を立てた。|{b}が{c}に想いを伝えたいと打ち明けると、{a}は黙って黒板の前に立った。「はい、私を{c}だと思って｜よし、私を{c}だと思え｜では、私を{c}だと思ってください」――{b}は笑い出してしまい、練習は三回やり直しになった。それでも帰る頃には、{b}の声はもう震えていなかった。|屋上へ続く階段の踊り場で、{a}は{b}の告白の練習に付き合った。{a}が{c}の口癖を真似すると、{b}は真っ赤になって{a}の肩を叩いた。最後に{a}は、「大丈夫。ちゃんと伝わる｜大丈夫だ。ちゃんと伝わる｜大丈夫です。ちゃんと伝わります」と言った。'),
    seat: L('月初めの席替えで、くじの箱を持っていたのは{a}だった。{a}は箱を振るふりをして、{b}の番に一枚だけ別のくじを渡した。黒板に名前が書かれると、{b}の隣の席は{c}だった。|席替えの日、{a}は{c}の隣の席を引き当てると、何食わぬ顔で{b}にくじを差し出した。「これ、交換してあげる｜これを交換してやる｜これ、交換してさしあげます」――{b}が目を丸くしているうちに、{a}はもう自分の荷物をまとめていた。|{a}は担任に「目が悪いので前に行きたい｜目が悪いので、前に行きたい｜目が悪いので、前に行きたいです」と申し出て、空いた席に{b}を押し込んだ。そこは{c}の隣だった。休み時間、二人がぎこちなく教科書を見せ合っているのを、{a}は前の席から振り返って確かめた。'),
    fest: L('文化祭の係決めで、{a}は買い出し係の欄に{b}と{c}の名前を並べて書いた。「二人とも、荷物持ちに向いてそうだから｜二人とも、荷物持ちに向いていそうだからな｜お二人とも、荷物持ちに向いていそうですから」――{b}は抗議しかけて、{c}が笑っているのに気づいてやめた。|お化け屋敷の脅かし役は、二人一組だった。{a}は名簿を見て、迷わず{b}と{c}を同じ暗がりに組んだ。本番中、暗幕の向こうから、二人の小さな笑い声が何度も漏れてきた。|後夜祭のフォークダンスで、{a}は輪の順番をこっそり入れ替えた。曲が終わる直前、{b}の手を取ったのは{c}だった。輪の外で、{a}は満足そうに腕を組んでいた。'),
    alone: L('放課後の日直は{b}と{c}だった。手伝うと言っていた{a}は、「急用を思い出した｜＝｜急用を思い出しました」と言って教室を出ていった。廊下の角で振り返ると、二人が並んで黒板を消しているのが見えた。|雨の昇降口で、{a}は自分の傘を{c}に押しつけた。「私、もう一本あるから。{b}と帰って｜私はもう一本ある。{b}と帰れ｜私はもう一本ありますから、{b}と帰ってください」――もちろん、もう一本などなかった。{a}は鞄を頭に乗せて、雨の中を駆けていった。|三人で帰るはずだった道で、{a}は急に「本屋に寄っていく｜＝｜本屋に寄っていきます」と言い出した。{b}と{c}が一緒に行くと言いかけると、{a}は首を振って手を振った。二人きりの帰り道は、いつもより少しだけ遠回りになった。'),
    choco: L('バレンタインの前の晩、{b}は{a}の家の台所を借りて、{c}に渡すチョコを作った。湯煎の温度を間違えて二回やり直し、三回目でやっと艶が出た。{a}は余った分をつまみながら、「これなら大丈夫｜これなら大丈夫だ｜これなら大丈夫です」と太鼓判を押した。|{a}は{b}に、ラッピングのリボンの結び方を教えた。不器用な{b}の指が何度も絡まるのを、{a}は笑いながらほどいてやった。できあがった小さな箱を、{b}は{c}の名前を書いたカードと一緒に、大事そうに鞄にしまった。|バレンタインの朝、{a}は{c}の靴箱の前で見張りに立った。{b}がチョコを入れ終えるまで、誰も近づけないように。走って戻ってきた{b}と、{a}は無言でハイタッチをした。'),
    koibana: L('帰り道の河川敷で、{b}は{a}にだけ、{c}のことが気になっていると打ち明けた。{a}は草をちぎって投げながら、最後まで黙って聞いた。それから、{b}の背中を一つ叩いた。|昼休みの屋上で、{b}は弁当の卵焼きをつつきながら、{c}の話ばかりしていた。{a}は途中で箸を置いて、「それ、もう好きってことだと思う｜それはもう、好きということだと思う｜それはもう、好きということだと思います」と言った。{b}は卵焼きを喉に詰まらせかけた。|放課後の図書室の隅で、{b}は小声で{a}に相談した。{c}にどう話しかければいいのか、分からないのだという。{a}は参考書を閉じて、作戦会議を始めた。'),
    /* 付き合い始めた二人（恋人）と、結ばれた二人（恋人で、夜を過ごした） */
    bless: {
      couple: L('{b}と{c}が付き合い始めたという噂は、昼休みのうちにクラス中に広まった。{a}は二人の机に、購買のパンを一つずつ置いた。冷やかしの言葉を探しているうちに、先に口から出たのは祝いの言葉だった。|朝、{b}と{c}が並んで教室に入ってくると、{a}はわざとらしく口笛を吹いた。{b}が睨むと、{a}は両手を上げて笑った。それから、二人にだけ聞こえる声で言った。|{a}は黒板の隅に、小さな相合傘を描いた。{b}は慌てて消しに走り、{c}はそれを見て吹き出した。消し終えた{b}と、隣の{c}に、{a}は向き直った。'),
      bound: L('{b}と{c}の間の空気が、最近また少し変わった。{a}はそれに気づいたが、何も訊かなかった。昼休み、二人の分の席を並べて取っておいてから、一言だけ言った。|{b}と{c}が同じマフラーを半分ずつ巻いて登校してきた朝、{a}は眠そうな顔のまま二人を見比べた。教室の誰もが見て見ぬふりをする中で、{a}だけが二人の前に立った。|放課後、{b}と{c}が当たり前のように同じ道を帰っていくのを、{a}は窓から見送った。翌朝、{a}は二人の机に、小さなお守りを一つずつ置いた。手に取った二人に、{a}は笑いかけた。')
    },
    guard: L('{b}と{c}のことを面白がって噂する声が、廊下から聞こえてきた。{a}は教室の戸を開けて、「人の恋路を笑うと、馬に蹴られるよ｜人の恋路を笑う者は、馬に蹴られるぞ｜人の恋路を笑う人は、馬に蹴られますよ」と言った。噂はそれきり、ぴたりと止んだ。|昼休み、{b}と{c}が中庭のベンチで弁当を広げているのを、{a}は窓際の席から眺めていた。誰かが冷やかしに行こうとすると、{a}はさりげなく話題を変えて引き止めた。二人の昼休みは、最後まで二人だけのものだった。|担任の見回りが近づいてくるのに気づいて、{a}はわざと大きな声で{b}と{c}に数学の質問をした。手を繋いでいた二人は、慌てて教科書を開いた。担任が通り過ぎると、三人は顔を見合わせて吹き出した。'),
    /* ダブルデート（{a}・{b}＝恋人どうし、{c}・{d}＝もう一組） */
    double: {
      summer: L('夏祭りの夜、{a}と{b}、{c}と{d}は、四人で屋台を回った。金魚すくいで{a}と{c}が本気の勝負を始め、{b}と{d}は呆れながら綿あめを分け合った。花火が上がる頃には、二組とも自然に手を繋いでいた。|浴衣姿の{c}と{d}を見つけて、{a}と{b}は手を振った。四人で河原に座って、打ち上げ花火を見上げた。帰り道、{b}は{d}に、「また来年も四人で｜また来年も四人でな｜また来年も、四人で来ましょうね」と小指を差し出した。|夏祭りの境内で、{a}と{b}は{c}と{d}にばったり会った。誰が言い出したのでもなく、四人で射的の列に並んだ。景品のぬいぐるみは、二組で一つずつ分けた。'),
      winter: L('寒い週末、{a}と{b}は{c}と{d}と、駅前のイルミネーションを見に行った。写真を撮り合ううちに、四人ともすっかり鼻が赤くなった。最後は二組に分かれて、それぞれの帰り道を歩いた。|雪の降った放課後、{a}と{b}の組と、{c}と{d}の組は、校庭で雪合戦をした。気づけば組は崩れて、恋人を盾にする者まで出た。最後は四人で雪の上に倒れ込んで、白い息を吐きながら笑った。|{a}と{b}は、{c}と{d}を誘って、駅前のたい焼き屋に寄った。四人で並んでかじりながら、どちらの組が先に付き合い始めたかで言い合いになった。帰り道、四人の吐く息が白く重なった。'),
      day: L('放課後、{a}と{b}は{c}と{d}を誘って、駅前のファミレスに寄った。ドリンクバーの前で、どちらの組が先に付き合い始めたかで言い合いになった。帰り道、四人の影が並んで長く伸びていた。|テスト明けの放課後、{a}と{b}、{c}と{d}の四人はゲームセンターでプリクラを撮った。四人で一枚、二人ずつで一枚。{b}は二人で撮ったほうを、こっそり生徒手帳に挟んだ。|日曜日、{a}と{b}は{c}と{d}と、四人で映画を観に行った。感想がきれいに二組で割れて、帰りの喫茶店で延々と言い合った。最後には、次に観る映画まで四人で決めていた。')
    },
    /* 想いが届かなかった友達を励ます（{a}・{d}＝友達、{b}＝告げて断られた人） */
    comfort: {
      two: L('放課後、{a}と{d}は両側から{b}の腕を取って、駅前のたい焼き屋まで連れていった。三人で並んで食べているうちに、{b}がぽつりと「言えただけ、よかった｜言えただけでも、よかった｜言えただけでも、よかったです」と言った。{a}と{d}は顔を見合わせて、黙って{b}の背中を叩いた。|{b}の想いが届かなかったと知った夜、{a}と{d}は{b}を公園に呼び出した。三人でブランコに座って、どうでもいい話ばかりした。帰り際、{b}はやっと少し笑った。|{a}と{d}は{b}をカラオケに連れ出して、明るい曲ばかり入れた。{b}が三曲目で泣き出すと、二人は歌うのをやめて、両側から肩を寄せた。最後の一曲は、三人で声を張り上げて歌った。'),
      one: L('想いが届かなかった次の日、{b}は昼休みになっても机に突っ伏したままだった。{a}は何も言わずに、{b}の机にいちご牛乳を置いた。{b}が顔を上げると、{a}は隣の椅子を引いて座った。|放課後の教室に、{b}が一人で残っていた。{a}は忘れ物を取りに来たふりをして、{b}の前の席に腰を下ろした。窓の外が暗くなるまで、{a}は{b}の話を黙って聞いていた。|{a}は帰り道、{b}を遠回りの河川敷に誘った。土手に並んで座ると、{b}は膝に顔を埋めた。{a}は川面を眺めたまま、{b}が顔を上げるのを待った。')
    }
  };

  /* 告白の練習に付き合う（a＝友達、b＝想っている人、c＝想う相手） */
  ev({
    id: 'cc_practice', label: '告白の練習に付き合う', cat: 'bond', scope: 'pair',
    when: function (ctx, a, b) { var c = wish(ctx, b, a); return !!c && ok3(ctx, a, b, c) && G.once(ctx, 'practice', [a, b, c]); },
    w: W(2.4),
    run: function (ctx, a, b) {
      var c = wish(ctx, b, a); G.mark(ctx, 'practice', [a, b, c]);
      ctx.mod2(a, b, { trust: 4, aff: 3 }, { trust: 5, aff: 3 }); ctx.mod(b, c, { att: 3 }); ctx.stress(b, -6);
      return { with: [c], text: ctx.t(G.relLead(ctx, a, b) + ctx.pick(T.practice) + G.byPer(ctx, G.CHEER, a), a, b, c), why: a.name + 'が、' + b.name + 'の' + c.name + 'への告白の練習に付き合った（応援・仲良し）', mag: 10 };
    }
  });
  /* 席替えで隣にする（4月・9月・1月の席替え。a＝友達、b・c＝想い合っている／片想い） */
  ev({
    id: 'cc_seat', label: '席替えで想い人の隣にしてあげる', cat: 'bond', scope: 'pair',
    when: function (ctx, a, b) { if (!inMon(ctx, ['4月', '5月', '9月', '11月', '1月'])) return false; var c = wish(ctx, b, a); return !!c && ok3(ctx, a, b, c) && G.once(ctx, 'seat', [b, c]); },
    w: W(2.4),
    run: function (ctx, a, b) {
      var c = wish(ctx, b, a); G.mark(ctx, 'seat', [b, c]);
      ctx.mod2(b, c, { att: 4, aff: 3, trust: 2 }, { att: 3, aff: 3, trust: 2 }); ctx.mod(b, a, { trust: 3, aff: 2 });
      return { with: [c], text: ctx.t(ctx.pick(T.seat), a, b, c), why: a.name + 'が、席替えで' + b.name + 'を' + c.name + 'の隣にした（応援・仲良し）', mag: 8 };
    }
  });
  /* 文化祭でペアにする（9月・10月。恋人どうしでも、想い合っている二人でも） */
  ev({
    id: 'cc_fest', label: '文化祭で想い人と同じ係にする', cat: 'bond', scope: 'pair',
    when: function (ctx, a, b) { if (!inMon(ctx, ['9月', '10月'])) return false; var c = lover(ctx, b, a) || wish(ctx, b, a); return !!c && ok3(ctx, a, b, c) && G.once(ctx, 'fest', [b, c]); },
    w: W(1.6),
    run: function (ctx, a, b) {
      var c = lover(ctx, b, a) || wish(ctx, b, a); G.mark(ctx, 'fest', [b, c]);
      ctx.mod2(b, c, { att: 4, aff: 4 }, { att: 4, aff: 4 }); ctx.mod2(a, b, { aff: 2 }, { aff: 3, trust: 2 });
      return { with: [c], text: ctx.t(ctx.pick(T.fest), a, b, c), why: a.name + 'が、文化祭で' + b.name + 'と' + c.name + 'を同じ組にした（応援・仲良し）', mag: 10 };
    }
  });
  /* 二人きりにする（想い合っている二人） */
  ev({
    id: 'cc_alone', label: '想い合う二人を二人きりにする', cat: 'bond', scope: 'pair',
    when: function (ctx, a, b) { var c = G.mutualOf(ctx, b, a); return stu(c) && ok3(ctx, a, b, c) && G.once(ctx, 'alone', [a, b, c]); },
    w: W(2.4),
    run: function (ctx, a, b) {
      var c = G.mutualOf(ctx, b, a); G.mark(ctx, 'alone', [a, b, c]);
      ctx.mod2(b, c, { att: 5, trust: 3 }, { att: 5, trust: 3 }); ctx.mod(b, a, { trust: 3 });
      return { with: [c], text: ctx.t(ctx.pick(T.alone), a, b, c), why: a.name + 'が、' + b.name + 'と' + c.name + 'を二人きりにした（応援・仲良し）', mag: 9 };
    }
  });
  /* バレンタインのチョコ作りを手伝う（2月） */
  ev({
    id: 'cc_choco', label: 'バレンタインのチョコ作りを手伝う', cat: 'bond', scope: 'pair',
    when: function (ctx, a, b) { if (mon(ctx) !== '2月') return false; var c = lover(ctx, b, a) || wish(ctx, b, a); return !!c && ok3(ctx, a, b, c) && G.once(ctx, 'choco', [a, b]); },
    w: W(2.4),
    run: function (ctx, a, b) {
      var c = lover(ctx, b, a) || wish(ctx, b, a); G.mark(ctx, 'choco', [a, b]);
      ctx.mod2(a, b, { aff: 4, trust: 3 }, { aff: 4, trust: 4 }); ctx.mod(c, b, { att: 3, aff: 2 });
      return { with: [c], text: ctx.t(ctx.pick(T.choco), a, b, c), why: a.name + 'が、' + b.name + 'の' + c.name + 'へのチョコ作りを手伝った（応援・仲良し）', mag: 9 };
    }
  });
  /* 恋の相談（a＝聞く友達、b＝想っている人、c＝想う相手） */
  ev({
    id: 'cc_koibana', label: '帰り道の河川敷で恋の相談', cat: 'bond', scope: 'pair',
    when: function (ctx, a, b) { var c = wish(ctx, b, a); return !!c && ok3(ctx, a, b, c) && G.friendly(ctx, b, a) && G.once(ctx, 'koibana', [a, b, c]); },
    w: function (ctx, a, b) { return 2 + b.tr.honesty * 0.6 + (G.rel(ctx, a, b) === 'best' ? 0.8 : 0); },
    run: function (ctx, a, b) {
      var c = wish(ctx, b, a); G.mark(ctx, 'koibana', [a, b, c]);
      ctx.mod2(a, b, { trust: 4, aff: 2 }, { trust: 5, aff: 3 }); ctx.mod(b, c, { att: 2 });
      return { with: [c], text: ctx.t(G.relLead(ctx, a, b) + ctx.pick(T.koibana) + G.byPer(ctx, G.CHEER, a), a, b, c), why: b.name + 'が' + a.name + 'に、' + c.name + 'への想いを相談した（恋の相談・仲良し）', mag: 8 };
    }
  });
  /* 付き合い始めた二人を冷やかして祝福する（恋人どうし） */
  ev({
    id: 'cc_bless', label: '恋人になった二人を祝福する', cat: 'bond', scope: 'pair',
    when: function (ctx, a, b) { var c = lover(ctx, b, a); return !!c && ok3(ctx, a, b, c) && G.once(ctx, 'bless', [a, b, c]); },
    w: W(0.08),
    run: function (ctx, a, b) {
      var c = lover(ctx, b, a), st = G.stage(ctx, b, c); G.mark(ctx, 'bless', [a, b, c]);
      ctx.mod2(b, c, { aff: 3, att: 2 }, { aff: 3, att: 2 }); ctx.mod2(a, b, { aff: 3 }, { aff: 4, trust: 3 }); ctx.mod2(a, c, { aff: 2 }, { aff: 3 });
      return { with: [c], text: ctx.t(ctx.pick(T.bless[st === 'bound' ? 'bound' : 'couple']) + G.byPer(ctx, G.BLESS, a), a, b, c), why: a.name + 'が、恋人どうしの' + b.name + 'と' + c.name + 'を冷やかしつつ祝福した（祝福・仲良し）', mag: 10 };
    }
  });
  /* 噂から守る・見守る（恋人どうし） */
  ev({
    id: 'cc_guard', label: '噂される恋人たちをそっと守る', cat: 'bond', scope: 'pair',
    when: function (ctx, a, b) { var c = lover(ctx, b, a); return !!c && ok3(ctx, a, b, c) && ctx.present().length >= 4 && G.once(ctx, 'guard', [b, c]); },
    w: W(0.06),
    run: function (ctx, a, b) {
      var c = lover(ctx, b, a); G.mark(ctx, 'guard', [b, c]);
      ctx.mod2(a, b, { aff: 2 }, { trust: 5, aff: 3 }); ctx.mod(c, a, { trust: 4, aff: 2 }); ctx.stress(b, -5); ctx.stress(c, -5);
      return { with: [c], text: ctx.t(ctx.pick(T.guard), a, b, c), why: a.name + 'が、恋人どうしの' + b.name + 'と' + c.name + 'をそっと見守った（見守り・仲良し）', mag: 8 };
    }
  });
  /* ダブルデート（a・b＝恋人どうし、c・d＝もう一組の恋人どうし。季節で場所を変える） */
  function other(ctx, a, b) { var cd = G.otherCouple(ctx, a, b); return cd && stu(cd[0]) && stu(cd[1]) && G.pairOk(ctx, cd[0], cd[1]) ? cd : null; }
  ev({
    id: 'cc_double', label: '二組で放課後を過ごす', cat: 'bond', scope: 'pair',
    when: function (ctx, a, b) { return stu(a) && stu(b) && G.couple(ctx, a, b) && G.pairOk(ctx, a, b) && !!other(ctx, a, b) && ctx.flags.ccDoubleAt !== ctx.stepIndex; },
    w: function () { return 0.35; },
    run: function (ctx, a, b) {
      var cd = other(ctx, a, b), c = cd[0], d = cd[1], m = mon(ctx);
      ctx.flags.ccDoubleAt = ctx.stepIndex;
      var k = inMon(ctx, ['7月', '8月']) ? 'summer' : inMon(ctx, ['12月', '1月', '2月']) ? 'winter' : 'day';
      ctx.mod2(a, b, { att: 2, aff: 3 }, { att: 2, aff: 3 }); ctx.mod2(c, d, { att: 2, aff: 3 }, { att: 2, aff: 3 });
      [[a, c], [a, d], [b, c], [b, d]].forEach(function (p) { ctx.mod2(p[0], p[1], { aff: 2, trust: 2 }, { aff: 2, trust: 2 }); });
      [a, b, c, d].forEach(function (x) { ctx.stress(x, -5); });
      return { with: [c, d], text: G.fill(ctx, ctx.pick(T.double[k]), a, b, c, d), why: a.name + 'と' + b.name + '、' + c.name + 'と' + d.name + 'の二組で過ごした（' + m + '・ダブルデート・仲良し）', mag: 10 };
    }
  });
  /* 想いが届かなかった友達を励ます（a＝友達、b＝告げて断られた人。もう一人の友達 d がいれば三人で） */
  ev({
    id: 'cc_comfort', label: '想いが届かなかった友人を励ます', cat: 'bond', scope: 'pair',
    when: function (ctx, a, b) { var x = G.turnedDown(ctx, b); return stu(a) && stu(b) && !!x && x !== a && !G.couple(ctx, a, b) && R(ctx, a, b).att < 40 && G.friendly(ctx, a, b) && G.once(ctx, 'comfort', [a, b]); },
    w: function (ctx, a, b) { return 2.5 + a.tr.np * 0.8 + b.stress / 100; },
    run: function (ctx, a, b) {
      var x = G.turnedDown(ctx, b); G.mark(ctx, 'comfort', [a, b]);
      var d = ctx.present().filter(function (o) { return o !== a && o !== b && o !== x && stu(o) && !G.couple(ctx, o, b) && R(ctx, o, b).att < 40 && G.friendly(ctx, o, b) && G.friendly(ctx, o, a); })[0] || null;
      ctx.mod2(a, b, { aff: 3, trust: 3 }, { aff: 5, trust: 6 }); ctx.stress(b, -14);
      if (d) { ctx.mod2(d, b, { aff: 3, trust: 3 }, { aff: 5, trust: 5 }); ctx.mod2(a, d, { aff: 2 }, { aff: 2 }); }
      var text = G.fill(ctx, G.relLead(ctx, a, b) + ctx.pick(T.comfort[d ? 'two' : 'one']) + G.byPer(ctx, G.COMFORT, a), a, b, null, d);
      return { with: d ? [d] : [], text: text, why: b.name + 'の想いは届かなかった。' + a.name + (d ? 'と' + d.name : '') + 'が励ました（励まし・仲良し）', mag: 10 };
    }
  });
})();
