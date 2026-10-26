/* 箱庭シミュレーター: 出られない部屋 ― 恋を応援する、仲良し系の出来事（全年齢版・R18版の共通）
   設計指針：複数人が絡む恋愛の出来事は、すれ違い系（嫉妬・三角関係）と仲良し系（応援・祝福・ダブルデート）を半々くらいに。
   出られない部屋は三人の場面のすれ違い（選ばなかった・頷けなかった）が多かったので、部屋に残る人が二人を応援する場面を足す。
   点検は hakoniwa-tools/tone-check/group-audit.js
   ・場所を譲る（扉の条件ごとに書き出しを変える）／背中を押す（態度9種）／差し入れ・毛布を譲る／恋の相談
   ・恋人どうしを冷やかす／恋人どうし二組の軽い会話（ダブルデート相当）
   ・条件を満たして出ていく二人を送り出す（態度9種。扉が開いた直後に、残る人の一言）
   ・先に出た二人が外で待っている（残った人どうしで励まし合う。出た二人は名前だけで、出来事の顔ぶれには入れない）
   「一人しか出られない」「誰かを殺す（気絶させる）」部屋では起こさない。
   {a}＝応援する人（恋の相手としては割り込まない）、{b}・{c}＝恋の二人。道具は rel-group.js の HK.RelGroup
   登場人物はすべて成人として扱う */
(function () {
  'use strict';
  var HK = window.HK, scen = HK.SCENARIOS && HK.SCENARIOS.whiteroom, G = HK.RelGroup;
  if (!scen || !G) return;
  var L = G.L;
  function R(ctx, a, b) { return ctx.R(a, b); }
  function ev(o) { scen.events.push(o); }
  /* 応援の場面を起こしてよい部屋か（一人しか出られない・誰かを殺す部屋では起こさない） */
  function calm(ctx) { return !!(ctx.rules && !ctx.flags.isOne && !ctx.flags.oneCond && !ctx.rules.some(function (r) { return r.k === 'kill' || r.k === 'one'; })); }
  /* 文の書き分けに使う条件：二人でする条件（行為・言葉）を先に、なければ飲み切る条件 */
  function rk(ctx) {
    var K = HK.ROOM_KINDS || {}, r = (ctx.rules || []).filter(function (x) { var T = K[x.k]; return T && (T.type === 'act' || T.type === 'word'); })[0];
    if (r) return r.k;
    return (ctx.rules || []).some(function (x) { var T = K[x.k]; return T && T.type === 'consume'; }) ? 'drink' : 'other';
  }
  function W(x) { return function (ctx, a) { return x + a.tr.np * 0.15 + (a.tr.warmth || 0) * 0.1; }; }

  var LEAD = {
    hand: L('扉の条件は、手を繋ぐこと。{b}の手が、{c}の手のすぐそばで、さっきから迷っていた。|{b}と{c}は並んで座っていたが、二人の手の間には、まだ指一本ぶんの隙間があった。'),
    hug: L('扉の条件は、ハグ。{b}と{c}は、さっきから一歩近づいては、また離れていた。|{b}は{c}の前で両腕を広げかけて、そのまま頭をかいてごまかした。'),
    lap: L('扉の条件は、膝枕。{c}は正座したまま、{b}が来るのを待っていた。|{b}は{c}の膝をちらりと見ては、慌てて目を逸らしていた。'),
    kiss: L('扉の条件は、キス。{b}と{c}は、さっきから目が合うたびに逸らしていた。|{b}は{c}の唇から目を逸らそうとして、かえって何度も見てしまっていた。'),
    h: L('扉の紙の条件を、{b}と{c}はもう何度も読み返していた。|{b}と{c}は、条件のことを口に出せないまま、ベッドの端と端に座っていた。'),
    love: L('扉の条件は、「好き」と言い合うこと。{b}は口を開きかけては、{a}のほうをちらりと見た。|{b}は{c}の前で「す」まで言いかけて、咳払いでごまかした。'),
    honne: L('扉の条件は、本音を打ち明け合うこと。{b}も{c}も、ほかの人のいる前では口が重かった。|{b}は{c}に本音を言いかけては、{a}の視線に気づいて黙り込んだ。'),
    praise: L('扉の条件は、相手のいいところを言うこと。{b}は{c}の前で、ずっともじもじしていた。|{b}は{c}のいいところなら百でも言えたが、本人を前にすると一つも出てこなかった。'),
    drink: L('テーブルには、まだ飲み切れていない瓶が並んでいた。{b}と{c}は、並んで次の一本に手を伸ばしたところだった。|{b}と{c}は、残りの本数を数えては、顔を見合わせてため息をついていた。'),
    other: L('{b}と{c}は、扉の紙の前で、さっきから何やら小声で相談していた。|{b}と{c}は並んで座り、ときどき肩が触れるたびに、どちらからともなく笑っていた。')
  };
  var T = {
    space: L('{a}は部屋の隅まで下がって、壁のほうを向いて座り込んだ。「私は壁のしみを数えてるから、ごゆっくり｜私は壁のしみを数えている。ごゆっくり｜私は壁のしみを数えていますから、どうぞごゆっくり」――{b}と{c}は顔を見合わせて、それから少しだけ笑った。|{a}は自分の毛布を広げて、部屋の真ん中に即席の衝立を作った。「見ない、聞かない、覚えてない。約束する｜見ない、聞かない、覚えていない。約束する｜見ません、聞きません、覚えていません。約束します」――衝立の向こうで、{b}が小さく「ありがとう｜＝｜ありがとうございます」と言うのが聞こえた。|{a}は扉の紙をもう一度読んでから、黙って部屋の反対側に移った。両耳を指でふさいで、わざとらしく鼻歌を歌い始めた。その鼻歌があまりに下手で、{b}と{c}の緊張はどこかへ消えてしまった。'),
    pushLead: L('{b}は、{c}のほうを見ては、扉の紙に目を戻していた。{a}はその様子を、しばらく黙って見ていた。やがて{a}は立ち上がり、{b}の隣にしゃがみ込んだ。|{b}がまた{c}から目を逸らしたのを見て、{a}は小さくため息をついた。それから{b}の肩を、軽く指でつついた。{b}が振り向くと、{a}は{c}のほうへ顎をしゃくった。|部屋の時計の針が、また一つ進んだ。{b}は{c}の隣で、膝の上の手を握ったり開いたりしていた。見かねた{a}が、{b}の耳元に顔を寄せた。'),
    share: L('差し入れの箱に、温かい飲み物が二つだけ入っていた。{a}はそれを、迷わず{b}と{c}に渡した。「私はさっき水を飲んだから｜私はさっき水を飲んだ｜私はさっき水をいただきましたから」――二人は一口ずつ飲んでから、残りを{a}に返した。|{a}は、自分の分の毛布を{b}と{c}に譲った。二人は一枚の毛布を半分ずつ使い、もう一枚を{a}の膝に掛け返した。三人の間に、しばらく静かな時間が流れた。|照明が落ちて部屋が冷えてくると、{a}は{b}と{c}の背中に、自分の上着を掛けた。「二人がくっついてれば、それで足りるでしょ｜二人がくっついていれば、それで足りるだろう｜お二人がくっついていれば、それで足りるでしょう」――{b}は照れて{c}から離れかけ、{c}がそれを引き戻した。'),
    koibana: L('{b}は{a}の袖を引いて、部屋の隅まで連れていった。{c}に聞こえないように、小さな声で、{c}への気持ちを打ち明けた。{a}はちらりと{c}のほうを見てから、{b}に向き直った。|眠れない夜、{b}は隣の{a}にだけ聞こえる声で言った。もし相手が{c}なら、扉の条件も怖くない気がする、と。{a}は天井を見たまま、少し笑った。|{a}と{b}は、壁際に並んで膝を抱えていた。{b}の視線が何度も{c}に向かうのを、{a}は見逃さなかった。{a}が肘でつつくと、{b}は観念したように、{c}への気持ちを話し始めた。'),
    tease: L('{b}と{c}が並んで座っているのを見て、{a}は扉の紙を指さした。「その調子なら、条件なんてすぐだね｜その調子なら、条件などすぐだな｜その調子なら、条件なんてすぐですね」――{b}は枕を投げ、{c}はそれを笑って受け止めた。|{a}は差し入れの箱から菓子を一つ取り出して、{b}と{c}の間に置いた。「はい、二人の分。半分こで｜ほら、二人の分だ。半分ずつ食え｜はい、お二人の分です。半分ずつ召し上がってください」――二人が律儀に半分に割るのを見て、{a}は声を殺して笑った。|{b}が{c}の肩にもたれて眠っているのを見て、{a}はそっと毛布を掛けてやった。目を覚ましていた{c}が、唇の前に指を立てた。{a}も同じ仕草を返して、足音を忍ばせて離れた。'),
    /* 恋人どうし二組（{a}・{b}、{c}・{d}） */
    double: L('{a}と{b}、{c}と{d}は、部屋の真ん中で輪になって座った。どちらの組が先に扉を開けるか、という話になり、{c}が「負けたほうが、外で甘いものをおごる｜＝｜負けたほうが、外で甘いものをおごります」と言い出した。{b}は真っ赤になり、{d}は笑い転げた。|退屈しのぎに、{a}と{b}は{c}と{d}としりとりを始めた。二組とも、気づけば相手の名前ばかり答えに入れようとしていた。四人とも笑いすぎて、しりとりは十回も続かなかった。|{a}と{b}の組は、{c}と{d}の組に、差し入れの箱のお菓子を半分分けた。お返しに、{d}は二人のために毛布を一枚譲った。白い部屋の中で、そこだけ少し賑やかだった。'),
    /* 先に出た二人（{d}・{e}）が外で待っている。{a}＝残った人、{b}・{c}＝残った恋の二人 */
    wait: L('扉の向こうから、かすかに{d}の声が聞こえた気がした。先に出た{d}と{e}は、きっと外で待っている。{a}は{b}と{c}を振り返って、「私たちも、あとに続こう｜＝｜私たちも、あとに続きましょう」と言った。|{a}は扉の下の隙間に、そっと耳を当てた。それから振り返って、{b}と{c}に笑ってみせた。「{d}たち、外で待ってるって。……二人とも、焦らなくていいからね｜{d}たちは、外で待っているそうだ。……二人とも、焦らなくていい｜{d}たちは、外で待っているそうです。……お二人とも、焦らなくていいですからね」|先に出ていった{d}と{e}の毛布が、部屋の隅に畳まれたまま残っていた。{a}はそれを{b}と{c}の肩に掛けてやった。「外に出たら、{d}と{e}も一緒に、みんなでご飯を食べよう｜外に出たら、{d}と{e}も一緒に、皆で飯を食おう｜外に出たら、{d}と{e}も一緒に、皆さんでご飯を食べましょう」'),
    /* 送り出す（{a}＝残る人、{b}・{c}＝出ていく二人） */
    sendLead: L('扉の向こうに光が差した。{b}と{c}が並んで敷居をまたぐ前に、{a}が声をかけた。|{b}と{c}が扉に手をかけたとき、{a}は二人の背中に向かって手を振った。|開いた扉の前で、{b}と{c}は一度だけ部屋を振り返った。壁際の{a}と、目が合った。'),
    /* 外で待っていた二人（{d}・{e}）と、あとから出た二人（{b}・{c}） */
    reunion: L('扉の外では、先に出た{d}と{e}が待っていた。{d}は二人を見るなり、「遅い！｜遅いぞ！｜遅いですよ！」と笑った。四人はしばらく、廊下の明かりの下で、互いの無事を確かめ合った。|廊下に出ると、{d}と{e}が壁にもたれて座っていた。{e}が立ち上がって、{b}と{c}に手を振った。四人は顔を見合わせて、誰からともなく笑い出した。|外の廊下には、{d}と{e}が並んで待っていた。{b}と{c}が繋いだ手を見て、{d}は黙って親指を立てた。{e}は「おかえり｜＝｜おかえりなさい」と言った。')
  };
  /* 背中を押す（a が、条件の前で迷う b に。態度9種） */
  var PUSH = {
    proud: L('{a}「いつまでぐずぐずしてる。{c}は、とっくに覚悟の決まった顔だ｜いつまでぐずぐずしている。{c}は、とうに覚悟の決まった顔だ｜いつまでぐずぐずしているんですか。{c}さんは、とうに覚悟の決まった顔ですよ」|{a}は{b}の背中を押した。「ほら。扉は、二人で開けるものなんだから｜ほら。扉は二人で開けるものだ｜ほら。扉は、お二人で開けるものですよ」'),
    stern: L('{a}「条件は条件。だけど、相手が{c}でよかったと、私は思う｜条件は条件だ。だが、相手が{c}でよかったと私は思う｜条件は条件です。けれど、相手が{c}でよかったと、私は思います」|{a}は静かに言った。「迷うのは、{c}を大事に思っている証拠。なら、大丈夫｜迷うのは、{c}を大事に思っている証拠だ。なら、大丈夫だ｜迷うのは、{c}を大事に思っている証拠です。なら、大丈夫です」'),
    tsun: L('{a}「べ、別に二人のためじゃないし。私が早く出たいだけだから、さっさとして｜別に二人のためではない。私が早く出たいだけだ。さっさとしろ｜別にお二人のためではありません。私が早く出たいだけです。早くしてください」|{a}は顔を背けたまま言った。「……{c}、さっきから{b}のことばっかり見てる。気づいてないの、{b}だけ｜……{c}は、さっきから{b}のことばかり見ている。気づいていないのは{b}だけだ｜……{c}さんは、さっきから{b}さんのことばかり見ています。気づいていないのは{b}さんだけです」'),
    gentle: L('{a}「焦らなくていいよ。時間はまだある。{c}も、きっと同じ気持ち｜焦らなくていい。時間はまだある。{c}も、きっと同じ気持ちだ｜焦らなくていいですよ。時間はまだあります。{c}さんも、きっと同じ気持ちです」|{a}は{b}の肩にそっと手を置いた。「{c}となら、きっと怖くない｜＝｜{c}となら、きっと怖くありません」'),
    devoted: L('{a}「二人が出られるなら、私は最後でいい。だから、遠慮しないで｜二人が出られるなら、私は最後でいい。だから遠慮するな｜お二人が出られるなら、私は最後でかまいません。ですから、遠慮しないでください」|{a}は二人のために、床のクッションを並べ直した。「せめて、これくらいはさせて｜せめて、これくらいはさせてくれ｜せめて、これくらいはさせてください」'),
    cool: L('{a}「合理的に考えて、二人が最初に出るのが一番早い。……それに、似合ってる｜合理的に考えて、二人が最初に出るのが一番早い。……それに、似合っている｜合理的に考えて、お二人が最初に出るのが一番早いです。……それに、お似合いです」|{a}は時計を見上げた。「残り時間から逆算すると、今がちょうどいい頃合い｜残り時間から逆算すると、今がちょうどいい頃合いだ｜残り時間から逆算すると、今がちょうどいい頃合いです」'),
    free: L('{a}「いけいけ！ 私、ちゃんと目をつぶってるから！｜行け行け！ 私はちゃんと目をつぶっている！｜行け行けです！ 私はちゃんと目をつぶっていますから！」|{a}は二人の手を取って、無理やり重ねた。「はい、これで半分クリア！｜よし、これで半分は済んだ！｜はい、これで半分クリアです！」'),
    shy: L('{a}「わ、私、あっち向いてる……！ が、がんばって……｜私は、あちらを向いている……！ が、頑張れ……｜わ、私、あちらを向いています……！ が、頑張ってください……」|{a}は真っ赤な顔で、両手で目を覆った。「ど、どうぞ……！ 私のことは、気にしないで｜ど、どうぞ……！ 私のことは気にするな｜ど、どうぞ……！ 私のことは、お気になさらないでください」'),
    polite: L('{a}「二人の邪魔はしない。どうぞ、ゆっくりして｜二人の邪魔はしない。ゆっくりしてくれ｜お二人のお邪魔はいたしません。どうぞ、ごゆっくりなさってください」|{a}は一礼して、部屋の隅に下がった。「何かあれば、呼んで｜何かあれば呼んでくれ｜何かあれば、お呼びください」')
  };
  /* 送り出す一言（a＝残る人。態度9種） */
  var SEND = {
    proud: L('{a}「さっさと行け。……外で、ちゃんと待ってなよ｜さっさと行け。……外で、きちんと待っていろ｜さっさと行ってください。……外で、ちゃんと待っていてくださいね」|{a}「振り返るな。……おめでとう、二人とも｜＝｜振り返らないでください。……おめでとうございます、お二人とも」'),
    stern: L('{a}「おめでとう。外に出ても、互いを大事にすること｜おめでとう。外に出ても、互いを大事にしろ｜おめでとうございます。外に出ても、互いを大事にしてください」|{a}は二人に向かって、小さく頷いた。「よくやった。……あとは任せて｜よくやった。……あとは任せろ｜よくやりました。……あとは任せてください」'),
    tsun: L('{a}「べ、別に寂しくないし。早く行けば？ ……おめでと｜別に寂しくなどない。早く行け。……おめでとう｜別に寂しくなどありません。早く行ってください。……おめでとうございます」|{a}は腕を組んでそっぽを向いた。「外で、いちゃいちゃしすぎないように｜外で、いちゃつきすぎるな｜外で、いちゃいちゃしすぎないでくださいね」'),
    gentle: L('{a}「おめでとう。外で、二人で美味しいもの食べてね｜おめでとう。外で、二人でうまいものでも食べてくれ｜おめでとうございます。外で、お二人で美味しいものを食べてくださいね」|{a}は二人の手を一度ずつ握った。「先に行ってて。すぐ追いつくから｜先に行っていてくれ。すぐに追いつく｜先に行っていてください。すぐに追いつきますから」'),
    devoted: L('{a}「本当によかった……。私のことは気にしないで、行って｜本当によかった……。私のことは気にするな。行け｜本当によかったです……。私のことは気にせず、行ってください」|{a}は涙ぐみながら、二人を扉まで送った。「二人が笑ってるのが、いちばん嬉しい｜二人が笑っているのが、いちばん嬉しい｜お二人が笑っているのが、いちばん嬉しいです」'),
    cool: L('{a}「おめでとう。……外の空気がどんなだったか、あとで教えて｜おめでとう。……外の空気がどうだったか、あとで教えてくれ｜おめでとうございます。……外の空気がどうだったか、あとで教えてください」|{a}は二人を見送りながら、扉の紙に目をやった。「一組、達成。……似合ってたよ｜一組、達成だ。……似合っていた｜一組、達成です。……お似合いでした」'),
    free: L('{a}「いってらっしゃーい！ 外でお祝いの準備しといてね！｜行ってこい！ 外で祝いの準備をしておけよ！｜いってらっしゃい！ 外でお祝いの準備をしておいてくださいね！」|{a}は両手をぶんぶん振った。「お幸せにー！ 結婚式には呼んでよ！｜お幸せに！ 結婚式には呼べよ！｜お幸せに！ 結婚式にはお招きくださいね！」'),
    shy: L('{a}「お、おめでとう……。そ、外で、待っててくれたら、うれしい｜お、おめでとう……。外で待っていてくれたら、うれしい｜お、おめでとうございます……。外で待っていてくださったら、うれしいです」|{a}は小さく手を振った。「……い、いってらっしゃい｜……い、行ってこい｜……い、いってらっしゃいませ」'),
    polite: L('{a}「おめでとう。外でも、どうか幸せに｜おめでとう。外でも、どうか幸せになってくれ｜おめでとうございます。外の世界でも、どうかお幸せになってください」|{a}は深く一礼した。「お先にどうぞ。二人の門出を、心からお祝いする｜先に行ってくれ。二人の門出を、心から祝う｜お先にどうぞ。お二人の門出を、心からお祝い申し上げます」')
  };

  /* 場所を譲る（a＝残る人、b・c＝恋人どうし／想い合っている二人） */
  ev({
    id: 'rm_space', cat: 'bond', scope: 'pair',
    when: function (ctx, a, b) { if (!calm(ctx)) return false; var c = G.loveOf(ctx, b, a); return !!c && G.thirdOk(ctx, a, b, c) && G.once(ctx, 'space', [a, b, c]); },
    w: W(0.35),
    run: function (ctx, a, b) {
      var c = G.loveOf(ctx, b, a); G.mark(ctx, 'space', [a, b, c]);
      ctx.mod2(b, c, { att: 4, trust: 3, ten: -2 }, { att: 4, trust: 3, ten: -2 }); ctx.mod(b, a, { trust: 3, aff: 2 }); ctx.stress(b, -5); ctx.stress(c, -5);
      return { with: [c], text: ctx.t(ctx.pick(LEAD[rk(ctx)]) + ctx.pick(T.space), a, b, c), why: a.name + 'が、' + b.name + 'と' + c.name + 'に場所を譲った（応援・仲良し）', mag: 9 };
    }
  });
  /* 背中を押す（a＝残る人、b＝迷っている人、c＝その相手） */
  ev({
    id: 'rm_push', cat: 'bond', scope: 'pair',
    when: function (ctx, a, b) { if (!calm(ctx)) return false; var c = G.loveOf(ctx, b, a); return !!c && G.thirdOk(ctx, a, b, c) && G.once(ctx, 'push', [a, b]); },
    w: function (ctx, a, b) { return 0.3 + a.tr.np * 0.15 + a.tr.fc * 0.1 + b.stress / 300; },
    run: function (ctx, a, b) {
      var c = G.loveOf(ctx, b, a); G.mark(ctx, 'push', [a, b]);
      ctx.mod(b, c, { att: 4, trust: 2 }); ctx.mod2(a, b, { aff: 2 }, { trust: 4, aff: 3 }); ctx.stress(b, -8);
      return { with: [c], text: ctx.t(ctx.pick(T.pushLead) + G.byPer(ctx, PUSH, a), a, b, c), why: a.name + 'が、' + c.name + 'を前に迷う' + b.name + 'の背中を押した（応援・仲良し）', mag: 9 };
    }
  });
  /* 差し入れ・毛布を譲る */
  ev({
    id: 'rm_share', cat: 'bond', scope: 'pair',
    when: function (ctx, a, b) { if (!calm(ctx)) return false; var c = G.loveOf(ctx, b, a); return !!c && G.thirdOk(ctx, a, b, c) && G.once(ctx, 'share', [a, b, c]); },
    w: W(0.26),
    run: function (ctx, a, b) {
      var c = G.loveOf(ctx, b, a); G.mark(ctx, 'share', [a, b, c]);
      ctx.mod2(b, c, { aff: 3, att: 3 }, { aff: 3, att: 3 }); ctx.mod(b, a, { aff: 4, trust: 3 }); ctx.mod(c, a, { aff: 3, trust: 3 }); ctx.stress(b, -4); ctx.stress(c, -4);
      return { with: [c], text: ctx.t(ctx.pick(T.share), a, b, c), why: a.name + 'が、' + b.name + 'と' + c.name + 'に自分の分を譲った（応援・仲良し）', mag: 8 };
    }
  });
  /* 恋の相談（a＝聞く人、b＝想っている人、c＝想う相手） */
  ev({
    id: 'rm_koibana', cat: 'bond', scope: 'pair',
    when: function (ctx, a, b) { if (!calm(ctx)) return false; var c = G.mutualOf(ctx, b, a) || G.crushOf(ctx, b, a); return !!c && G.thirdOk(ctx, a, b, c) && G.friendly(ctx, b, a) && G.once(ctx, 'koibana', [a, b, c]); },
    w: function (ctx, a, b) { return 1.6 + b.tr.honesty * 0.5 + (G.rel(ctx, a, b) ? 0.5 : 0); },
    run: function (ctx, a, b) {
      var c = G.mutualOf(ctx, b, a) || G.crushOf(ctx, b, a); G.mark(ctx, 'koibana', [a, b, c]);
      ctx.mod2(a, b, { trust: 4, aff: 2 }, { trust: 5, aff: 3 }); ctx.mod(b, c, { att: 3 });
      return { with: [c], text: ctx.t(G.relLead(ctx, a, b) + ctx.pick(T.koibana) + G.byPer(ctx, G.CHEER, a), a, b, c), why: b.name + 'が' + a.name + 'に、' + c.name + 'への想いを相談した（恋の相談・仲良し）', mag: 8 };
    }
  });
  /* 冷やかす（恋人どうし） */
  ev({
    id: 'rm_tease', cat: 'bond', scope: 'pair',
    when: function (ctx, a, b) { if (!calm(ctx)) return false; var c = G.partnerOf(ctx, b, a); return !!c && G.thirdOk(ctx, a, b, c) && G.once(ctx, 'tease', [a, b, c]); },
    w: function (ctx, a) { return 0.22 + a.tr.fc * 0.2; },
    run: function (ctx, a, b) {
      var c = G.partnerOf(ctx, b, a); G.mark(ctx, 'tease', [a, b, c]);
      ctx.mod2(b, c, { att: 3, aff: 2 }, { att: 3, aff: 2 }); ctx.mod2(a, b, { aff: 2 }, { aff: 2, trust: 2 }); ctx.stress(b, -4); ctx.stress(c, -4);
      return { with: [c], text: ctx.t(ctx.pick(T.tease), a, b, c), why: a.name + 'が、恋人どうしの' + b.name + 'と' + c.name + 'を冷やかした（冷やかし・仲良し）', mag: 8 };
    }
  });
  /* 恋人どうし二組の軽い会話（a・b、c・d） */
  ev({
    id: 'rm_double', cat: 'bond', scope: 'pair',
    when: function (ctx, a, b) { if (!calm(ctx) || !G.couple(ctx, a, b) || !G.pairOk(ctx, a, b) || ctx.flags.rmDoubleAt === ctx.stepIndex) return false; var cd = G.otherCouple(ctx, a, b); return !!cd && G.pairOk(ctx, cd[0], cd[1]); },
    w: function () { return 0.4; },
    run: function (ctx, a, b) {
      var cd = G.otherCouple(ctx, a, b), c = cd[0], d = cd[1];
      ctx.flags.rmDoubleAt = ctx.stepIndex;
      ctx.mod2(a, b, { att: 2, aff: 3 }, { att: 2, aff: 3 }); ctx.mod2(c, d, { att: 2, aff: 3 }, { att: 2, aff: 3 });
      [[a, c], [a, d], [b, c], [b, d]].forEach(function (p) { ctx.mod2(p[0], p[1], { aff: 2, trust: 2 }, { aff: 2, trust: 2 }); });
      [a, b, c, d].forEach(function (x) { ctx.stress(x, -6); });
      return { with: [c, d], text: G.fill(ctx, ctx.pick(T.double), a, b, c, d), why: a.name + 'と' + b.name + '、' + c.name + 'と' + d.name + 'の二組で、部屋の中で笑い合った（ダブルデート・仲良し）', mag: 9 };
    }
  });
  /* 先に出た二人の組（出た記録 ctx.flags.exits のうち、二人とも出ていった組） */
  function gonePair(ctx, upto) {
    var ex = ctx.flags.exits || [], C = ctx.chars;
    for (var i = Math.min(upto == null ? ex.length : upto, ex.length) - 1; i >= 0; i--) {
      var x = ex[i]; if (!x || x.group || x.how || x.stay != null || x.a == null || x.b == null || x.a === x.b) continue;
      var d = C[x.a], e = C[x.b];
      if (d && e && d.out && e.out && d.alive !== false && e.alive !== false) return [d, e];
    }
    return null;
  }
  /* 先に出た二人が外で待っている（a＝残った人、b・c＝残った恋の二人） */
  ev({
    id: 'rm_wait', cat: 'bond', scope: 'pair',
    when: function (ctx, a, b) { if (!calm(ctx) || !gonePair(ctx)) return false; var c = G.loveOf(ctx, b, a); return !!c && G.thirdOk(ctx, a, b, c) && G.once(ctx, 'wait', [a, b, c]); },
    w: W(0.9),
    run: function (ctx, a, b) {
      var c = G.loveOf(ctx, b, a), de = gonePair(ctx); G.mark(ctx, 'wait', [a, b, c]);
      ctx.mod2(b, c, { att: 3, trust: 3 }, { att: 3, trust: 3 }); ctx.mod2(a, b, { aff: 2, trust: 2 }, { aff: 3, trust: 3 }); [a, b, c].forEach(function (x) { ctx.stress(x, -6); });
      return { with: [c], text: G.fill(ctx, ctx.pick(T.wait), a, b, c, de[0], de[1]), why: '先に出た' + de[0].name + 'と' + de[1].name + 'が外で待っている。' + a.name + 'が、残った' + b.name + 'と' + c.name + 'を励ました（応援・仲良し）', mag: 8 };
    }
  });

  /* 送り出す：二人が条件を満たして扉をくぐった直後に、残る人の一言（扉が開いた記録 ctx.flags.exits を見張る）。
     先に出た二人がいれば、外で待っていた場面も足す。出ていった二人は、同じ区切りのうちだけ顔ぶれに入れる */
  function sendoff(ctx) {
    var ex = ctx.flags.exits || [], from = ctx.flags.rcSeen || 0;
    if (ex.length <= from) return;
    ctx.flags.rcSeen = ex.length;
    if (!calm(ctx)) return;
    for (var i = from; i < ex.length; i++) {
      var x = ex[i]; if (!x || x.group || x.how || x.stay != null || x.a == null || x.b == null || x.a === x.b) continue;
      var b = ctx.chars[x.a], c = ctx.chars[x.b];
      if (!b || !c || !b.out || !c.out) continue;
      var pf = ctx.pair(b, c);
      if (pf.forced != null || !G.loveOk(b, c) || !(pf.couple || (R(ctx, b, c).att > 25 && R(ctx, c, b).att > 25))) continue;
      var rest = G.here(ctx).filter(function (a) { return a !== b && a !== c && !G.couple(ctx, a, b) && !G.couple(ctx, a, c) && R(ctx, a, b).att < 40 && R(ctx, a, c).att < 40 && (G.friendly(ctx, a, b) || G.friendly(ctx, a, c)) && R(ctx, a, b).ten < 40 && R(ctx, a, c).ten < 40; });
      var a = rest.sort(function (p, q) { return (R(ctx, q, b).aff + R(ctx, q, c).aff) - (R(ctx, p, b).aff + R(ctx, p, c).aff); })[0];
      if (a && ctx.rng() < 0.5) {
        ctx.mod(a, b, { aff: 3 }); ctx.mod(a, c, { aff: 3 }); ctx.stress(a, -4);
        ctx.pending.push({ kind: 'event', cat: 'bond', actors: [a, b, c], text: ctx.t(ctx.pick(T.sendLead) + G.byPer(ctx, SEND, a), a, b, c), why: b.name + 'と' + c.name + 'が条件を満たして部屋を出た。残る' + a.name + 'が送り出した（送り出し・仲良し）', mag: 10 });
      }
      var de = gonePair(ctx, i);
      if (de && de.indexOf(b) < 0 && de.indexOf(c) < 0 && ctx.rng() < 0.6)
        ctx.pending.push({ kind: 'event', cat: 'bond', actors: [b, c], text: G.fill(ctx, ctx.pick(T.reunion), null, b, c, de[0], de[1]), why: '先に出た' + de[0].name + 'と' + de[1].name + 'が、外で' + b.name + 'と' + c.name + 'を待っていた（再会・仲良し）', mag: 8 });
    }
  }
  var setup0 = scen.setup;
  scen.setup = function (ctx) {
    var r = setup0 ? setup0.apply(this, arguments) : undefined;
    var say0 = ctx.say;
    ctx.flags.rcSeen = 0;
    ctx.say = function () { var e = say0.apply(this, arguments); sendoff(ctx); return e; };
    return r;
  };
})();
