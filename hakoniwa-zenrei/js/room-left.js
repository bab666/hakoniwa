/* 出られない部屋：最後に取り残された人の結末（両ビルド共通）
   時間切れ（または残りが一人になって部屋が閉じたあと）に、まだ部屋の中にいる人（生きていて、外に出ていない人。
   攻め×攻めで組めなかった人・気絶した人・自分から残った人も含む。監禁中の二人と、亡くなった人は含めない）の結末を一つ選んで、記録の最後に書く。
   ■ 結末（id）
     alone   孤独：部屋に残ったまま過ごす。気分（HK.Emo）と態度9種で書き分け、二人以上なら過ごし方（友人・攻め×攻めの気まずさ・敵視）も
     friend  仲の良い人が助けに来る：外に出た人のうち、中の誰かと恋人・本命・親友・相棒・執着などの仲の人が、扉を外から開ける方法を調べて戻ってくる
     rescue  警察・救助隊：喜び（態度9種）と、出ていった人に愛憎・敵視・執着を向けている人の誓い
     loop    ループ：扉から飛び出すと、廊下の先はまた白い部屋だった（実際に繰り返しはしない）
   ■ HK.RoomLeft.decide(ctx)：scenario-room.js の finish から。残った人を確かめ、結末を選んで ctx.flags.roomLeft に置く（まだ書かない）
     HK.RoomLeft.write(ctx)：room-know.js の結末の締めのあとに。記録を書き、行く末（fate・fateNote）・気分・外に出たかを直す
     結果の res.end.room.left に { id, title, who, by, vows, stayed, rescued } が入り、endings.js の E.whiteroom が「なお、あとから…」を書く */
(function () {
  'use strict';
  var HK = window.HK;
  if (!HK) return;
  function L(s) { return s.split('|'); }
  function nm(list) { return list.map(function (c) { return c.name; }).join('・'); }
  function fill(t, o) { return String(t).replace(/\{(\w+)\}/g, function (m, k) { return o[k] != null ? o[k] : m; }); }
  /* U（{文: 1}）を渡すと、その記録の中でまだ使っていない文から選ぶ */
  function pk(ctx, arr, U) {
    var k = Math.floor(ctx.rng() * arr.length) % arr.length;
    if (U) { for (var d = 0; d < arr.length; d++) if (!U[arr[(k + d) % arr.length]]) { k = (k + d) % arr.length; break; } U[arr[k]] = 1; }
    return arr[k];
  }
  function att(c) { return HK.Emo && HK.Emo.att ? HK.Emo.att(c) : 'gentle'; }
  function mood(c) { return HK.Emo && HK.Emo.mood ? HK.Emo.mood(c) : 'calm'; }
  function bump(ctx, c, d, why) { if (HK.Emo && HK.Emo.bump) HK.Emo.bump(ctx, c, d, why); }
  function ties(ctx, a, b) { return HK.Ties ? HK.Ties.all(ctx, a, b) : []; }
  function tieFrom(ctx, a, b, re) { return ties(ctx, a, b).some(function (t) { return re.test(t.type) && (!HK.TIES[t.type] || !HK.TIES[t.type].dir || t.a === a.i); }); }
  function love2(a, b) { return HK.canLove(a, b) && HK.canLove(b, a); }
  function hate(ctx, a, b) { return HK.HateKit ? HK.HateKit.level(ctx, a, b) : 0; }
  function obs(ctx, a, b) { return HK.Obsess && HK.Obsess.level ? HK.Obsess.level(ctx, a, b) : 0; }
  function darkOn(ctx) { return HK.Dark ? HK.Dark.on(ctx) : 'normal'; }

  /* ---------- 文 ---------- */
  var T = {};
  /* 孤独：態度ごと（{a}） */
  T.alone = {
    proud: L('{a}は扉の前に腰を下ろし、「出してくれと頼むつもりはない」と誰にともなく言った。|{a}は白い壁を拳で一度だけ叩いて、それきり叩かなかった。負けを認めたくなかった。|{a}は部屋のまんなかで胡座をかき、「この部屋のほうが先に音を上げる」と言い張った。'),
    stern: L('{a}は残った食べ物を数え直し、一日に食べる量を決めた。|{a}は壁に爪で線を引き、過ぎた時間を数えはじめた。|{a}は眠る時間と起きる時間を決めて、決めたとおりに過ごした。そうしていないと、崩れそうだった。'),
    tsun: L('{a}は「別に、一人のほうが気楽だし」と言って、毛布を頭までかぶった。|{a}は閉じた扉に向かって「戻ってこなくていいから」と言い、それから長いこと黙った。|{a}は誰もいない部屋で、「寂しくなんかない」と二度言った。'),
    gentle: L('{a}は空になった部屋を見回して、「静かだね」と小さく笑った。|{a}は出ていった人たちが無事に帰れたことを、扉に向かって祈った。|{a}はベッドの端に座り、外の天気を想像して時間をやり過ごした。'),
    devoted: L('{a}は「みんな、ちゃんと帰れたかな」とそればかり気にしていた。自分のことは、あとまわしだった。|{a}は散らかった部屋を片づけて、誰かがいつ戻ってきてもいいようにした。|{a}は出ていった人の名前を、一人ずつ数えるように呼んだ。'),
    cool: L('{a}は扉と壁の継ぎ目を、端から順に調べなおした。感傷にひたる時間は、もったいなかった。|{a}は「条件を満たせる相手がいない以上、待つしかない」と短くまとめ、目を閉じた。|{a}は扉の紙を読み返し、まだ読み落としがないかを確かめ続けた。'),
    free: L('{a}は「貸し切りだ」と笑って、ベッドの上で大の字になった。笑い声は、すぐに途切れた。|{a}は壁に落書きをはじめた。扉の紙の横に、出ていった人たちの似顔絵が並んだ。|{a}はしりとりの相手がいないことに気づいて、一人で続けた。'),
    shy: L('{a}は部屋の隅で膝を抱え、物音がするたびに扉を見た。|{a}は誰もいない部屋で、ようやく声を出して泣いた。|{a}は小さな声で、出ていった人たちに言えなかったことを一つずつ口にした。'),
    polite: L('{a}は乱れた毛布を丁寧にたたみ直し、背筋を伸ばして扉の前に座った。|{a}は「待つのは、慣れておりますから」と、誰にともなく微笑んだ。|{a}は時間を決めて食事をとり、きちんと手を合わせた。それが{a}の保ち方だった。')
  };
  /* 孤独：ほかにも残った人がいるとき（態度ごと、{a}） */
  T.aloneWith = {
    proud: L('{a}は「どうせすぐ開く」と言い張り、扉の前の場所を誰にも譲らなかった。|{a}は弱音を吐く者がいれば鼻で笑った。いちばん吐きたかったのは、{a}自身だった。|{a}は壁にもたれて腕を組み、残った顔ぶれを見渡した。「泣き言は聞かないからな」'),
    stern: L('{a}は残った食べ物を人数分に分け、一日に食べる量を決めた。|{a}は壁に爪で線を引き、過ぎた時間を数えはじめた。|{a}は眠る順番と見張りの順番を決めて、決めたとおりに守らせた。'),
    tsun: L('{a}は「別に、心細くなんかないし」と言いながら、誰かの隣から離れなかった。|{a}は毛布を頭までかぶって、「寝る」とだけ言った。毛布の中から、ときどき鼻をすする音がした。|{a}は閉じた扉に向かって「戻ってこなくていいから」と言い、それから長いこと黙った。'),
    gentle: L('{a}は「大丈夫、きっと誰か来るよ」と、残った人たちに笑いかけた。|{a}は出ていった人たちが無事に帰れたことを、扉に向かって祈った。|{a}はベッドの端に座り、外の天気の話をして時間をやり過ごした。'),
    devoted: L('{a}は自分の分の水を、隣の人の前にそっと置いた。|{a}は眠れない人の背中を、朝までさすっていた。|{a}は「先に出た人たち、ちゃんと帰れたかな」とそればかり気にしていた。'),
    cool: L('{a}は扉と壁の継ぎ目を、端から順に調べなおした。感傷にひたる時間は、もったいなかった。|{a}は「条件を満たせる組がない以上、待つしかない」と短くまとめ、目を閉じた。|{a}は扉の紙を読み返し、まだ読み落としがないかを確かめ続けた。'),
    free: L('{a}は「延長戦だ」と笑って、ベッドの上で大の字になった。笑い声は、すぐに途切れた。|{a}は壁に落書きをはじめた。扉の紙の横に、出ていった人たちの似顔絵が並んだ。|{a}はしりとりを始めた。三周目で、答える声がなくなった。'),
    shy: L('{a}は部屋の隅で膝を抱え、物音がするたびに扉を見た。|{a}は毛布の中で、声を殺して泣いた。|{a}は小さな声で、出ていった人たちに言えなかったことを一つずつ口にした。'),
    polite: L('{a}は乱れた毛布を丁寧にたたみ直し、背筋を伸ばして扉の前に座った。|{a}は「お互い、気を落とさずにまいりましょう」と、残った人たちに微笑んだ。|{a}は時間を決めて食事をとり、きちんと手を合わせた。それが{a}の保ち方だった。')
  };
  /* 孤独：気分の結び（{a}。喜びの気分は、取り残された場面では平静の結びにする） */
  T.aloneMood = {
    grief: L('ときどき、{a}の肩が小さく震えた。|{a}の目元は、ずっと赤いままだった。|{a}は思い出したように泣いて、泣き疲れて眠った。'),
    anger: L('{a}の胸の中では、置いていかれた悔しさがまだ燃えていた。|{a}は閉じた扉を睨みつけ、出ていった人の名前を噛みしめた。|{a}は壁を蹴りかけて、やめた。怒りの行き場はなかった。'),
    fear: L('照明が落ちるたびに、{a}は息を詰めた。|{a}は自分の呼吸の音さえ怖がるようになった。|{a}は扉に背中をつけて眠った。そうしないと眠れなかった。'),
    calm: L('白い部屋の時間は、音もなく過ぎていった。|{a}の息づかいは、思ったより落ち着いていた。部屋で過ごした時間は、悪いものばかりではなかった。|扉の紙の文字は、変わらずそこにあった。{a}はそれを、もう読まなかった。')
  };
  /* 孤独：二人以上が残ったときの過ごし方（{L}＝残った人、{a}{b}＝その中の二人） */
  T.aloneGroup = {
    friend: L('{L}は、残った食べ物を等分に分けあって、交代で眠った。一人きりでないことが、せめてもの救いだった。|{a}と{b}は背中を合わせて座り、知っている歌を順番にうたった。|{L}は昔話を一つずつ披露しあった。笑い声が、ときどき白い壁に跳ね返った。'),
    awk: L('扉の紙の条件を、{a}と{b}はどうしても満たせなかった。二人とも、相手に身を任せる側にはなれなかった。ベッドの両端に座ったまま、気まずい時間だけが流れた。|{a}と{b}は「どっちも譲らないなら、仕方ない｜どちらも譲らないなら、仕方ない｜どちらも譲らないなら、仕方ありません」と苦笑した。どちらも攻めたい側で、そこだけはどうにもならなかった。|{a}と{b}は、条件の話を避けるようになった。目が合うと、どちらからともなく扉の紙を見た。'),
    enemy: L('{a}と{b}は、部屋の対角線のいちばん遠いところに陣取った。狭い部屋で、それが精いっぱいの距離だった。|{a}と{b}は口をきかなかった。差し入れの箱を開けるときだけ、相手の手の位置を睨んだ。|{a}が何か言えば、{b}が言い返した。白い部屋に、言い争いの声だけが響いた。'),
    plain: L('{L}は、互いの名前のほかはほとんど何も知らないまま、同じ壁にもたれて時間をやり過ごした。|{L}は、ぽつりぽつりと身の上話をした。話が尽きると、また黙った。|{L}は交代で扉を調べ、交代で眠った。誰が言い出したわけでもなかった。')
  };
  /* 仲の良い人が助けに来る：調べた方法（{r}＝助けに来た人） */
  T.method = L(
    '{r}は白い部屋のことを何日も調べた。古い掲示板の書き込みをたどって、扉の外側にある小さな操作盤と、そこに打ち込む番号を突き止めた。|' +
    '{r}は、扉の紙と同じ紙を扱う業者を探し当てた。問い詰めて聞き出したのは、外から鍵を外す手順だった。|' +
    '{r}は、外へ出るときに見た廊下の配電盤を覚えていた。白い部屋の照明と鍵は、同じ線でつながっていた。{r}はその線を、迷わず切った。|' +
    '{r}は、同じ部屋から戻った人を探して話を聞いて回った。「外の紙に、条件を満たしたと書き込めばいい」――半信半疑で書き込んだ文字に、扉は応えた。|' +
    '{r}は扉の外側の壁に、内側と同じ紙が貼られているのを見つけた。条件の欄の下に小さく「外からは、名前を呼べば開く」とあった。{r}は、中にいる人の名前を呼んだ。'
  );
  /* 仲の良い人が助けに来る：関係ごと（{r}＝助けに来た人、{x}＝中にいた相手） */
  T.reunion = {
    lover: L('扉が開いた瞬間、{x}は{r}の腕の中に飛び込んでいた。{r}「遅くなって、ごめん｜遅くなって、すまない｜遅くなって、ごめんなさい」――{x}は首を振るだけで、声にならなかった。|{r}は部屋に踏み込むなり、{x}を強く抱きしめた。「一人にして、ごめん。もう離れないから｜一人にして、すまない。もう離れない｜一人にして、ごめんなさい。もう離れませんから」|{x}が顔を上げると、{r}が息を切らして立っていた。{r}「迎えに来た｜＝｜迎えに来ました」――二人は額を合わせて、しばらく動かなかった。'),
    crush: L('{r}は{x}の前で立ち止まり、言いかけた言葉を一度飲み込んだ。「……{x}を置いてきたこと、ずっと後悔してた｜……{x}を置いてきたことを、ずっと後悔していた｜……{x}を置いてきたこと、ずっと後悔していました」|{r}「あの部屋を出てから、{x}のことばかり考えてた｜あの部屋を出てから、{x}のことばかり考えていた｜あの部屋を出てから、{x}のことばかり考えていました」――{x}は驚いた顔で、それでも差し出された手を取った。|{r}は照れ隠しのように「たまたま方法を見つけただけ｜たまたま方法を見つけただけだ｜たまたま方法を見つけただけです」と言った。{x}には、それが嘘だとすぐに分かった。'),
    obsess: L('{r}は{x}の手首を掴んで、部屋の外へ引き出した。「もう二度と、離さない。どこにも行かせない｜＝｜もう二度と、離しません。どこにも行かせません」|{r}は{x}の顔をじっと見つめ、「迎えに来られるのは、私だけだった｜＝｜迎えに来られるのは、私だけでした」と微笑んだ。その指は、{x}の手を痛いほど握っていた。|{r}「{x}がいない外の世界なんて、意味がなかった｜{x}がいない外の世界など、意味がなかった｜{x}がいない外の世界なんて、意味がありませんでした」――{r}は{x}の肩を抱き寄せ、もう放すつもりはなかった。'),
    friend: L('{r}「待たせた！｜＝｜お待たせしました！」――扉の向こうから聞き慣れた声がして、{x}は思わず笑った。泣き笑いだった。|{r}は{x}の背中を何度も叩いた。「一人で残すわけないだろ｜一人で残すわけがないだろう｜一人で残すわけがないでしょう」|{r}は扉を押さえたまま手を伸ばした。{x}がその手を掴むと、{r}は「約束どおり｜約束どおりだ｜約束どおりです」とだけ言った。')
  };
  T.friendEnd = L('{L}は{r}に手を引かれて、白い部屋を出た。振り返ると、扉はもうただの壁になっていた。|外の空気は、思ったより温かかった。{L}は{r}に何度も礼を言い、{r}は照れくさそうに頭をかいた。|廊下の先には、ちゃんと出口があった。{L}は{r}と並んで、外の光の中へ歩き出した。');
  /* 警察・救助隊：はじまり（{L}＝残った人、{O}＝外に出た人） */
  T.rescueOpen = {
    report: L('数日後、扉の向こうが騒がしくなった。{O}の届け出を受けた救助隊が、ついに白い部屋を見つけ出したのだ。扉は外側から焼き切られた。|部屋を出た{O}の証言をもとに、警察が建物を捜索していた。重い音がして、扉が外からこじ開けられた。|「誰かいますか！」――扉の向こうから知らない声がした。{O}が伝えた場所を、救助隊がしらみつぶしに探していたのだった。'),
    none: L('数日後、扉の向こうで足音がした。行方不明の届け出を受けた警察が、白い部屋にたどり着いたのだ。扉は外から焼き切られた。|突然、扉の外で金属を削る音がした。救助隊が、何日もかけてこの部屋を探し当てたのだった。|壁の向こうで、犬の吠える声がした。捜索隊の照明が、扉の隙間から差し込んだ。')
  };
  /* 警察・救助隊：喜び（態度ごと、{a}） */
  T.joy = {
    proud: L('{a}は救助隊員の手を借りずに立ち上がり、「遅い」と言った。その声は、少しだけ震えていた。|{a}は胸を張って部屋を出た。外に出たとたん、膝から力が抜けた。|{a}は「待ってやってたんだ」と言い張りながら、毛布を受け取った。'),
    stern: L('{a}は救助隊員に、閉じ込められていた時間と残りの食料を正確に伝えた。報告を終えると、ようやく深く息を吐いた。|{a}は一礼して部屋を出た。外の光に目を細め、しばらく動けなかった。|{a}は差し出された水を一口飲んで、「助かりました」とだけ言った。'),
    tsun: L('{a}は「べ、別に、もう少しで自分で出られたし」と言いながら、救助隊員の袖を離さなかった。|{a}はそっぽを向いたまま毛布にくるまり、誰にも見えないように涙を拭った。|{a}は「来るのが遅いんだけど」と文句を言った。顔は、ぐしゃぐしゃに笑っていた。'),
    gentle: L('{a}は救助隊員の顔を見るなり、「来てくださって、ありがとう」と何度も頭を下げた。|{a}は外の空気を吸い込んで、「帰れるんだね」と泣きながら笑った。|{a}は救助隊員の手を握って、しばらく離さなかった。'),
    devoted: L('{a}は自分のことより先に、「先に出た人たちは無事ですか」と尋ねた。無事だと聞くと、その場に座り込んだ。|{a}は救助隊員に深く頭を下げ、「本当に、本当にありがとうございます」と繰り返した。|{a}は毛布を受け取ると、まず隣にいた人の肩にかけた。'),
    cool: L('{a}は救助隊員に状況を短く説明し、それから、誰にも聞こえない声で「助かった」とつぶやいた。|{a}は外の時計を見て、閉じ込められていた時間を確かめた。手が、少しだけ震えていた。|{a}は表情を変えずに部屋を出た。救急車の中で、ようやく目を閉じた。'),
    free: L('{a}は「出られた！」と叫んで、救助隊員に抱きついた。隊員は困った顔で、それでも背中を叩いてくれた。|{a}は部屋を飛び出して、外の空に向かって大声で笑った。|{a}は「まずはラーメン！」と言って、救助隊員を笑わせた。'),
    shy: L('{a}は声も出せずに泣きだした。救助隊員が毛布をかけてくれるまで、震えが止まらなかった。|{a}は救助隊員の後ろに隠れるようにして、そっと部屋を出た。外の光が、まぶしかった。|{a}は小さな声で「ありがとう」と言った。三度目で、ようやく隊員に届いた。'),
    polite: L('{a}は乱れた服を整えてから、救助隊員に深々と頭を下げた。「お手数をおかけしました」|{a}は「ご迷惑をおかけしました」と丁寧に礼を述べた。それから、こらえきれずに涙をこぼした。|{a}は背筋を伸ばして部屋を出た。外に出たところで、ようやく小さく息をついた。')
  };
  T.rescueEnd = L('{L}は救急車に乗せられ、白い部屋のある建物をあとにした。|{L}は毛布にくるまって、夜明け前の街を見た。どこにでもある、見覚えのある景色だった。|{L}が振り返ると、白い部屋の扉は、立ち入り禁止の黄色いテープで覆われていた。');
  /* 誓い（{a}＝誓う人、{b}＝外に出た相手） */
  T.vow = {
    hate: L('{a}は救急車の窓から街を見ながら、{b}の顔を思い浮かべた。「……借りは、必ず返す｜＝｜……借りは、必ず返します」|毛布にくるまった{a}は、小さな声で言った。「{b}のことは、絶対に許さない。どこにいても、見つけ出す｜＝｜{b}のことは、絶対に許しません。どこにいても、見つけ出します」|{a}は救助隊員に{b}の名前を尋ねられ、「覚えておいて｜覚えておけ｜覚えておいてください」とだけ答えた。その目は笑っていなかった。'),
    obsess: L('{a}は外の光の中で、まっさきに{b}の姿を探した。いなかった。「……いいよ。今度は、私が迎えに行くから｜……いい。今度は、私が迎えに行く｜……いいですよ。今度は、私が迎えに行きますから」|{a}は{b}の名前を、何度も口の中で繰り返した。「どこに行っても、必ず見つける。もう二度と、離れない｜＝｜どこに行っても、必ず見つけます。もう二度と、離れません」|{a}は救急車の中で、{b}のことだけを考えていた。「待っててね。すぐに会いに行く｜待っていろ。すぐに会いに行く｜待っていてくださいね。すぐに会いに行きます」'),
    lovehate: L('{a}は{b}の出ていった扉を思い出し、唇を噛んだ。「好きだった。だから、置いていったことは許さない｜＝｜好きでした。だから、置いていったことは許しません」|{a}「{b}に会ったら、まず一発殴る。それから……それから、のことは、そのとき考える｜＝｜{b}に会ったら、まず一発殴ります。それから……それから、のことは、そのとき考えます」|{a}は{b}への想いと恨みを、どちらも捨てられないまま外に出た。「必ず、もう一度会う｜＝｜必ず、もう一度会います」'),
    abandon: L('{a}は、自分を置いて出ていった{b}の背中を忘れていなかった。「あのときの顔、一生覚えてるから｜あのときの顔は、一生覚えている｜あのときの顔、一生覚えていますから」|{a}は「{b}は、振り返りもしなかった｜＝｜{b}は、振り返りもしませんでした」とだけ言って、拳を握った。「次に会ったら、ただじゃおかない｜次に会ったら、ただではおかない｜次に会ったら、ただではおきません」|{a}は外に出ると、まず{b}の連絡先を探した。礼を言うためでは、なかった。')
  };
  /* ループ（{L}＝残った人） */
  T.loopOpen = L('突然、鍵の外れる音が響いた。条件は満たしていない。それでも扉は、細く開いていた。{L}は迷わず飛び出した。|照明が一度だけまたたき、扉がひとりでに開いた。{L}は考えるより先に、外の廊下へ駆け出していた。|がちゃり、と音がして、扉が開いた。{L}は振り返らずに、白い廊下を走った。');
  T.loopHall = L('廊下はまっすぐで、どこまでも白かった。突き当たりの扉を押し開けると――そこは、白い部屋だった。扉には一枚の紙。見覚えのある文字が並んでいた。|走っても走っても、廊下の景色は変わらなかった。ようやく見つけた扉の先には、ベッドと、テーブルと、条件の紙。最初に目を覚ましたときと、何もかも同じ部屋だった。|角を曲がると、扉が一つだけあった。開けると、白い部屋だった。壁の時計は、目覚めたときと同じ時刻を指していた。');
  T.loopReact = {
    proud: L('{a}は「冗談だろ」と笑おうとして、笑えなかった。|{a}は扉の紙を引き剥がそうとして、手を止めた。紙には、まだ誰も触れた跡がなかった。|{a}は「何度でもやってやる」と言った。その声は、白い壁に吸い込まれた。'),
    stern: L('{a}は壁を見た。自分で刻んだはずの線は、一本も残っていなかった。|{a}は時計を見つめたまま、数え直すべきものが何なのか分からなくなった。|{a}は深呼吸をして、規則正しく、最初の一時間を数えはじめた。'),
    tsun: L('{a}は「……は？」とだけ言って、その場にへたりこんだ。|{a}は「こんなの、ぜんぜん怖くないし」と言った。声が、裏返っていた。|{a}は扉の紙を睨みつけた。紙は、何も言い返さなかった。'),
    gentle: L('{a}は小さく笑った。「……また、はじめからだね」|{a}はベッドの端に座り、何も言わずに扉の紙を見つめた。|{a}は「夢、だったのかな」とつぶやいた。答える人はいなかった。'),
    devoted: L('{a}はとっさに、出ていった人たちの名前を呼んだ。返事はなかった。|{a}は「みんなは、ちゃんと外に出られたよね」と自分に言い聞かせた。|{a}は部屋を見回して、誰かの忘れ物を探した。何も、なかった。'),
    cool: L('{a}は「記憶の混乱か、部屋の仕掛けか」と冷静に言った。手のひらは、汗で濡れていた。|{a}は扉の紙を一字ずつ読み、前と同じだと確かめてから、目を閉じた。|{a}は廊下の距離を思い出そうとした。何歩走ったのか、どうしても思い出せなかった。'),
    free: L('{a}は「おかわり、ってこと？」と笑った。笑い声だけが、いつまでも響いていた。|{a}はベッドに飛び込んで、「二周目は上手くやるから」と言った。|{a}は扉に向かって「もう一回！」と叫んだ。扉は、静かに閉まっていた。'),
    shy: L('{a}は声も出せずに、扉の前で立ち尽くした。|{a}は部屋の隅で膝を抱え、目を閉じた。開けたら、何かが変わっている気がした。|{a}は震える手で、扉の紙に触れた。紙は、まだ新しかった。'),
    polite: L('{a}は「……失礼しました」と小さく言って、白い部屋に戻った。誰に謝ったのかは、{a}にも分からなかった。|{a}は乱れた息を整え、いつものように背筋を伸ばした。それしか、できることがなかった。|{a}は丁寧に扉を閉めた。閉める必要は、なかったのかもしれない。')
  };
  T.loopEnd = L('扉の紙の文字が、ゆっくりと浮かび上がった。白い部屋の、最初の一時間がはじまる。|どこかで、鍵のかかる音がした。白い部屋は、何事もなかったかのように静まり返っていた。|照明が、目覚めたときと同じ明るさに戻った。――最初から、だろうか。');
  /* その後（結末の行の「〇〇のその後――」。部屋に残った人だけ。{a}） */
  T.after = {
    alone: L('{a}がその後どうなったのかを、知る人はいない。白い部屋の扉は、今も閉じたままだという。|{a}のいた白い部屋の話は、いつのまにか噂話のひとつになった。|{a}はまだ、あの白い部屋で扉が開くのを待っているのかもしれない。'),
    loop: L('{a}の姿を、外で見た人はいない。ただ、白い部屋の夢を見たという人の話に、ときどき{a}の名前が出てくる。|{a}は今も、白い部屋の最初の一時間にいるのかもしれない。|{a}がその後どうなったのかは、誰にも分からない。扉の紙だけが、変わらずそこにある。')
  };
  var TITLE = { alone: '最後まで部屋に残った', friend: '仲の良い人が助けに来た', rescue: '救助隊に助け出された', loop: '白い部屋に戻った（？）' };

  /* ---------- 残った人と、外にいる人 ---------- */
  function insideOf(ctx) {
    return ctx.chars.filter(function (c) {
      if (c.alive === false || c.out || c.gone || c.taken) return false;
      var f = c.flags || {};
      return f.caged == null && f.cagePair == null;
    });
  }
  function outsideOf(ctx) { return ctx.chars.filter(function (c) { return c.alive !== false && c.out && /脱出/.test(c.fate || ''); }); }
  /* o（外）から x（中）への絆：lover／crush／obsess／friend と強さ。敵視していれば null */
  function bondOf(ctx, o, x) {
    if (hate(ctx, o, x) >= 45) return null;
    var pf = ctx.pair(o, x), r = ctx.R(o, x);
    if ((pf.couple || tieFrom(ctx, o, x, /^(?:lover|spouse|mate|fated)$/)) && love2(o, x)) return { k: 'lover', s: 100 };
    if (obs(ctx, o, x) >= 35 || (HK.Obsess && HK.Obsess.yanTie && HK.Obsess.yanTie(ctx, o, x))) return { k: 'obsess', s: 90 };
    if (tieFrom(ctx, o, x, /^(?:honmei|crush)$/) && HK.canLove(o, x)) return { k: 'crush', s: 80 };
    if (tieFrom(ctx, o, x, /^(?:best|buddy|childhood|sibclose|sibling|sibprot|parent|pparent|mentor|master|benefactor)$/)) return { k: 'friend', s: 70 };
    if (r.aff >= 45 && r.trust >= 25) return { k: r.att >= 50 && love2(o, x) ? 'crush' : 'friend', s: 40 + Math.min(40, r.aff - 45 + r.trust / 3) };
    return null;
  }
  /* x（中）が、外に出た o に向けている想い：hate／obsess／lovehate／abandon */
  function vowOf(ctx, x, o) {
    var r = ctx.R(x, o), hl = hate(ctx, x, o);
    var grab = (ctx.flags.exits || []).some(function (e) { return e.how === 'grab' && e.a === o.i; });
    if (obs(ctx, x, o) >= 35) return 'obsess';
    if ((tieFrom(ctx, x, o, /^ex$/) || r.att >= 40) && hl >= 30) return 'lovehate';
    if (hl >= 50 || tieFrom(ctx, x, o, /^enemy$/)) return 'hate';
    if (grab && r.trust < 0) return 'abandon';
    return null;
  }

  var RL = HK.RoomLeft = { T: T, TITLE: TITLE };
  RL.decide = function (ctx) {
    ctx.flags.roomLeft = null;
    var inside = insideOf(ctx);
    if (!inside.length) return null;
    var outs = outsideOf(ctx), dk = darkOn(ctx);
    /* 助けに来られる人：外にいて、中の誰かと強い絆がある人（いちばん強い組） */
    var best = null;
    outs.forEach(function (o) { inside.forEach(function (x) { var b = bondOf(ctx, o, x); if (b && (!best || b.s > best.s)) best = { r: o, x: x, k: b.k, s: b.s }; }); });
    var stress = inside.reduce(function (t, c) { return t + (c.stress || 0); }, 0) / inside.length;
    var uncanny = dk === 'mild' ? 0.4 : dk === 'dark' ? 1.6 : 1;
    var W = {
      alone: 40 * (1 + stress / 250) * (inside.length === 1 ? 1.1 : 1),
      rescue: 38 * (outs.length ? 1.25 : 1) * (inside.some(function (c) { return c.flags && c.flags.knocked; }) ? 1.2 : 1),
      friend: best ? 55 * best.s / 100 : 0,
      loop: 10 * uncanny
    };
    var tot = 0, k;
    for (k in W) tot += W[k];
    var x = ctx.rng() * tot, id = 'alone';
    for (k in W) { x -= W[k]; if (x < 0) { id = k; break; } }
    var o = { id: id, title: TITLE[id], who: inside.map(function (c) { return c.i; }), outs: outs.map(function (c) { return c.i; }), by: [], vows: [], stayed: inside.filter(function (c) { return c.flags && c.flags.stayed; }).map(function (c) { return c.i; }), rescued: id === 'friend' || id === 'rescue', cand: best ? best.k : '' };
    if (id === 'friend') { o.by = [best.r.i]; o.to = best.x.i; o.bond = best.k; }
    ctx.flags.roomLeft = o;
    return o;
  };

  /* ---------- 書く ---------- */
  function persons(ctx, L0, key, U) {
    var out = [];
    L0.slice(0, 3).forEach(function (c) { out.push(fill(pk(ctx, T[key][att(c)] || T[key].gentle, U), { a: c.name })); });
    return out.join('');
  }
  function groupKind(ctx, a, b) {
    if (hate(ctx, a, b) >= 50 || hate(ctx, b, a) >= 50) return 'enemy';
    /* 攻め×攻め（エッチの条件で組めなかった二人。全年齢では書かない） */
    if (!HK.SAFE_ON && (ctx.rules || []).some(function (r) { return r.k === 'h'; }) && HK.Pos && HK.Pos.clash && HK.Pos.clash(a, b) && HK.Pos.hardTop(a, b) && HK.Pos.hardTop(b, a)) return 'awk';
    var r1 = ctx.R(a, b), r2 = ctx.R(b, a);
    if ((r1.aff + r2.aff) / 2 >= 25) return 'friend';
    return 'plain';
  }
  function moodKey(c) { var m = mood(c); return T.aloneMood[m] ? m : 'calm'; }
  RL.write = function (ctx) {
    var o = ctx.flags.roomLeft;
    if (!o) return;
    var C = ctx.chars, G = o.who.map(function (i) { return C[i]; }).filter(function (c) { return c && c.alive !== false && !c.out; });
    if (!G.length) { ctx.flags.roomLeft = null; return; }
    o.who = G.map(function (c) { return c.i; });
    var LN = nm(G), outs = o.outs.map(function (i) { return C[i]; }), parts = [], actors = G.slice(), why = '', U = {};
    if (o.id === 'alone') {
      if (G.length >= 2) {
        var a = G[0], b = G[1];
        for (var i = 0; i < G.length; i++) for (var j = i + 1; j < G.length; j++) { var gk0 = groupKind(ctx, G[i], G[j]); if (gk0 === 'awk' || gk0 === 'enemy') { a = G[i]; b = G[j]; } }
        var gk = groupKind(ctx, a, b);
        parts.push(fill(pk(ctx, T.aloneGroup[gk]), { L: LN, a: a.name, b: b.name }));
        why = '残った人どうしの仲（' + { friend: '仲がいい', awk: '攻め×攻めで条件を満たせない', enemy: '敵視している', plain: '親しくない' }[gk] + '）';
      }
      G.slice(0, 3).forEach(function (c) {
        var mk = moodKey(c);
        var TA = G.length > 1 ? T.aloneWith : T.alone;
        parts.push(fill(pk(ctx, TA[att(c)] || TA.gentle, U), { a: c.name }) + fill(pk(ctx, T.aloneMood[mk], U), { a: c.name }));
        bump(ctx, c, mk === 'anger' ? { anger: 8, grief: 10 } : { grief: 18, fear: 8 }, '部屋に取り残された');
      });
      why = '結末：取り残された人の結末（孤独）' + (why ? '／' + why : '') + '／気分：' + G.slice(0, 3).map(function (c) { return c.name + ((HK.Emo && HK.Emo.NAME) ? HK.Emo.NAME[moodKey(c)] : ''); }).join('・');
    } else if (o.id === 'friend') {
      var r = C[o.by[0]], x = C[o.to];
      parts.push('部屋を出たあと、' + fill(pk(ctx, T.method), { r: r.name }));
      parts.push(fill(pk(ctx, T.reunion[o.bond] || T.reunion.friend), { r: r.name, x: x.name }));
      parts.push(fill(pk(ctx, T.friendEnd), { L: LN, r: r.name }));
      actors = [r].concat(G);
      G.forEach(function (c) { bump(ctx, c, { joy: c === x ? 45 : 30, fear: -30, grief: -15 }, r.name + 'が助けに来た'); });
      bump(ctx, r, { joy: 30 }, x.name + 'を助け出した');
      ctx.mod2(r, x, { trust: 15, aff: 10 }, { trust: 20, aff: 15 });
      why = '結末：取り残された人の結末（' + r.name + 'が助けに来た）／' + r.name + 'から' + x.name + 'への' + { lover: '恋人としての想い', crush: '想い', obsess: '執着', friend: '友情・絆' }[o.bond];
    } else if (o.id === 'rescue') {
      parts.push(fill(pk(ctx, outs.length ? T.rescueOpen.report : T.rescueOpen.none), { L: LN, O: nm(outs.slice(0, 3)) }));
      parts.push(persons(ctx, G, 'joy', U));
      G.forEach(function (c) { bump(ctx, c, { joy: 40, fear: -30 }, '救助隊が来た'); });
      /* 出ていった人への誓い（穏やかでは少なく、重いでは多く） */
      var pv = Math.min(1, 0.85 * (HK.Dark ? HK.Dark.f(ctx, 'spite') : 1));
      G.forEach(function (c) {
        if (o.vows.length >= 2) return;
        var best = null;
        outs.forEach(function (t) { var k = vowOf(ctx, c, t); if (k && !best) best = { t: t, k: k }; });
        if (!best || ctx.rng() >= pv) return;
        o.vows.push({ a: c.i, b: best.t.i, k: best.k });
        parts.push(fill(pk(ctx, T.vow[best.k]), { a: c.name, b: best.t.name }));
        bump(ctx, c, best.k === 'obsess' ? { anger: 10, joy: 5 } : { anger: 30 }, best.t.name + 'への誓い');
      });
      parts.push(fill(pk(ctx, T.rescueEnd), { L: LN }));
      why = '結末：取り残された人の結末（救助隊）' + (o.vows.length ? '／' + o.vows.map(function (v) { return C[v.a].name + 'から' + C[v.b].name + 'へ：' + { hate: '敵視', obsess: '執着', lovehate: '愛憎', abandon: '置いていかれた恨み' }[v.k]; }).join('、') : '');
    } else {
      parts.push(fill(pk(ctx, T.loopOpen), { L: LN }));
      parts.push(pk(ctx, T.loopHall));
      parts.push(persons(ctx, G, 'loopReact', U));
      parts.push(pk(ctx, T.loopEnd));
      G.forEach(function (c) { bump(ctx, c, { fear: 35 }, '白い部屋に戻った'); });
      why = '結末：取り残された人の結末（ループ）';
    }
    /* 行く末 */
    G.forEach(function (c) {
      var st = o.stayed.indexOf(c.i) >= 0;
      if (o.id === 'friend') { c.fate = '脱出'; c.fateNote = (st ? '条件を満たしたが自分から残り、' : '') + 'あとから' + C[o.by[0]].name + 'に助け出された'; c.out = true; }
      else if (o.id === 'rescue') { c.fate = '脱出'; c.fateNote = (st ? '条件を満たしたが自分から残り、' : '') + 'あとから救助隊に助け出された'; c.out = true; }
      else if (o.id === 'loop') { c.fate = '白い部屋に戻った（？）'; c.fateNote = '開いた扉から飛び出したが、廊下の先はまた白い部屋だった'; }
    });
    ctx.flags.outcome = (ctx.flags.outcome || '') + '（' + TITLE[o.id] + '）';
    ctx.say({ kind: 'event', cat: 'phase', cageOk: true, actors: actors, text: parts.join(''), why: why, mag: 30 });
  };

  /* ---------- 結末の行（endings.js の E.whiteroom から） ---------- */
  /* 「なお、あとから…」の一文。X は endings.js の道具（X.nm・X.names） */
  RL.note = function (res, X) {
    var o = res && res.end && res.end.room && res.end.room.left;
    if (!o || !o.who || !o.who.length) return '';
    var who = X.names(o.who), base = (o.outs || []).length > 0;
    if (o.id === 'friend') return 'なお、あとから' + X.nm(o.by[0]) + 'が戻ってきて、' + who + 'を助け出した。';
    if (o.id === 'rescue') return base ? 'なお、あとから' + who + 'も救助隊に助け出された。' : 'なお、' + who + 'は、あとから救助隊に助け出された。';
    if (o.id === 'loop') return 'なお、' + who + 'は開いた扉から飛び出したが、廊下の先はまた白い部屋だった……。';
    /* 今はない結末（古いセーブ・共有の結果）は、題名だけを出す */
    if (o.id !== 'alone' && o.title) return 'なお、' + who + '：' + o.title + '。';
    return 'なお、' + who + 'は最後まで部屋に残った。';
  };
  /* 部屋に残った人の「その後」（救い出された人は epilogue.js の「脱出」のその後に任せる） */
  RL.afterLines = function (res) {
    var o = res && res.end && res.end.room && res.end.room.left;
    /* 今はない結末（古いセーブ・共有の結果）は、その後を書かない */
    if (!o || o.rescued || !TITLE[o.id] || !o.who) return [];
    var C = res.chars || [], key = o.id === 'loop' ? 'loop' : 'alone', out = [];
    o.who.forEach(function (i, k) {
      var c = C[i];
      if (!c) return;
      var arr = T.after[key], h = HK.Emo && HK.Emo.hash ? HK.Emo.hash(String(res.seed) + '|left|' + c.name) : 0;
      out.push(c.name + 'のその後――' + fill(arr[(Math.floor(h * arr.length) + k) % arr.length], { a: c.name }));
    });
    return out;
  };
})();
