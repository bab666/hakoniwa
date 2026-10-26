/* 箱庭シミュレーター: マッサージの配役（施術者を住人かモブで・2人で受ける「カーテン越し」）。全年齢版と同じ内容
   ・役割「施術者」（HK.Roles。env role_therapist：おまかせ＝モブ／住人から／モブ）。1人のときは、施術者はいつもモブ
   ・住人が施術者：もう一人の住人が客。施術者の言い訳と一言は気質から（STAFF_OF で店の施術者の型に当てる・RES_EXCUSE）。
     体に触れる際どい施術は、二人が体の関係になれる組（HK.Pos.okSex・HK.State.r18ok の両方・HK.ngPair でも HK.sexBlocked でもない）だけ。
     なれない組は、普通のマッサージのまま（PLAIN_*。全年齢と同じ書き方）
   ・モブが施術者で住人が2人：二人とも客になり、薄いカーテン一枚を隔てた隣の施術台で受ける（CUR_*・merge）。
     二人の施術はそれぞれ別に進み、カーテン越しに聞こえる音だけが行き来する（数値には効かない）
   {a}＝客 {m}＝施術者。カーテン越しの文は {a}＝聞いている人 {b}＝カーテンの向こうの人。登場人物はすべて成人 */
(function () {
  'use strict';
  var HK = window.HK;
  if (!HK) return;
  function L(s) { return s.split('|'); }
  var C = HK.MassageCast = {};

  /* 住人の施術者の気質 → 店の施術者の型（施術中の一言・言い訳の通りやすさ）。女性のやわらかい型は「女性セラピスト」の一言 */
  C.STAFF_OF = { gentle: 'gentle', polite: 'gentle', devoted: 'gentle', free: 'chara', tsun: 'chara', proud: 'silent', stern: 'silent', cool: 'silent', shy: 'silent' };

  /* ---------- 住人が施術者のとき ---------- */
  C.RES_INTRO = L('{a}は予約した店の施術室に通された。カーテンが開いて現れたのは、施術着姿の{m}だった。{a}「……え、{m}？　ここで働いてたの？｜……え、{m}か？　ここで働いていたのか？｜……え、{m}？　ここで働いていたんですか？」|{a}が受付で名前を書くと、奥から聞き覚えのある声がした。顔を上げると、施術着の{m}が立っていた。知り合いに体を任せることになるとは、思っていなかった。|{a}は口コミで評判のいい施術者を指名した。現れたのは、よく知っている顔だった。{m}は一瞬だけ目を丸くして、それから仕事の顔に戻った。');
  C.RES_GREET = {
    proud: L('{m}「客として来たなら、文句は言わせない。うつ伏せになれ」|{m}「腕は確かだ。黙って横になっていればいい」'),
    stern: L('{m}「知り合いでも、手順は同じです。まず問診から」|{m}「本日の担当です。私情は挟みませんので、ご安心を」'),
    tsun: L('{m}「な、なんでここに来るわけ……。べ、別に嫌じゃないけど。ちゃんとやるから、横になって」|{m}「……来ちゃったものは仕方ないでしょ。ほら、さっさと着替えて」'),
    gentle: L('{m}「来てくれて嬉しいな。今日は、ゆっくりほぐしていって」|{m}「ふふ、びっくりした？　大丈夫、ちゃんと上手いから」'),
    devoted: L('{m}「あ、あの……精一杯、やらせてもらいます。痛かったら、すぐ言ってください」|{m}「指名、ありがとうございます……！　がんばります」'),
    cool: L('{m}「知り合いだからといって、料金は変わりません。どうぞ、横に」|{m}「担当します。施術中の私語は、少なめでお願いします」'),
    free: L('{m}「えっ、うそ、{a}じゃん！　いいよいいよ、サービスしちゃう」|{m}「やっほー。せっかくだし、フルコースでほぐしてあげる」'),
    shy: L('{m}は{a}の顔を見て固まり、それから小さな声で言った。「……た、担当、です。よろしく、お願いします……」|{m}は目を逸らしたまま、タオルを差し出した。「き、着替えたら、呼んでください……」'),
    polite: L('{m}「ようこそお越しくださいました。本日は、誠心誠意務めさせていただきます」|{m}「本日担当いたします。どうぞ、お楽になさってください」')
  };
  /* 言い訳（気づかれたとき）：施術者の気質ごと */
  C.RES_EXCUSE = {
    proud: L('{m}「黙って寝てろ。素人が施術に口を出すな」――{m}は手を止めなかった。言い訳をする気すら、ないようだった。|{m}「ここも筋肉だ。疑うなら、ほかの店に行けばいい」{m}はそう言い捨てて、同じ場所をもう一度押した。|{m}は鼻で笑った。「気のせいだ。凝りがほぐれると、皆そう言う」'),
    stern: L('{m}「骨盤まわりの調整です。教本の手順どおりに行っています」――{m}の口調は、どこまでも事務的だった。|{m}「ご不安なら、施術計画書をお見せします」{m}は手を止めずに言った。計画書が出てくることはなかった。|{m}「反応が出るのは、効いている証拠です。続けます」'),
    tsun: L('{m}「へ、変な意味じゃないから！　ここ、本当にリンパがあるの！」――{m}の耳まで、真っ赤だった。|{m}「か、勘違いしないでよね。仕事なんだから、仕事！」そう言いながら、{m}の手は一度も離れなかった。|{m}「そ、そんな顔で見ないで。……ちゃんとした施術なんだから」'),
    gentle: L('{m}「大丈夫、心配しないで。ここをほぐすと、体がすごく楽になるの」――{m}はいつもと同じ、柔らかい声で言った。|{m}「びっくりさせちゃった？　ごめんね。でも、みんなここで一番ほぐれるんだよ」|{m}「力を抜いて。……信じて、任せてほしいな」{m}の手のひらは、温かかった。'),
    devoted: L('{m}「ご、ごめんなさい！　でも、本当にここが効くって、教わって……」――{m}は真っ赤になりながら、それでも手を止めなかった。|{m}「い、嫌だったら、すぐやめます。……でも、もう少しだけ、続けさせてください」|{m}「ちゃんと勉強したんです。だから……信じてもらえませんか」'),
    cool: L('{m}「この部位にはリンパ節が集まっています。ここを避けると、施術の効果が三割落ちます」――数字まで添えられると、反論しにくかった。|{m}「感覚が過敏になっているのは、血流が改善したからです。想定の範囲内です」|{m}は淡々と答えた。「施術の範囲です。気になるなら、終わってから質問を受けます」'),
    free: L('{m}「えー、大丈夫だって！　ここ、みんな最初びっくりするけど、終わったらすっごい楽になるから！」|{m}「あはは、くすぐったかった？　ごめんごめん。でもこれ、ちゃんとしたやつだよ。たぶん！」|{m}「知り合い割ってことで、特別に念入りにしてるだけだって。ね？」'),
    shy: L('{m}「あ、あの……こ、ここも、施術の……範囲、なので……」――消え入りそうな声だった。|{m}は真っ赤になって俯いた。「ま、マニュアルに、書いてあるので……」|{m}「す、すみません……でも、ここを、流さないと……」{m}の指は、震えていた。'),
    polite: L('{m}「ご不快でしたら申し訳ございません。こちらは、全身の巡りを整えるための手技でございます」|{m}「大変失礼いたしました。ですが、ここを避けますと、施術の効果が十分に得られないのです」|{m}「お客様のお体のためでございます。どうか、今しばらくお任せください」')
  };
  /* 客が主導する組（HK.Pos.order で客が攻め）：際どい施術の手前で、客が手を止めさせる（客は受ける側に回らない） */
  C.RES_TOP_STOP = L('{m}の指が内腿を這い上がりかけたところで、{a}はその手首を掴んだ。「――そこから先は、そっちがされる番｜――そこから先は、そっちがされる番だ｜――そこから先は、そちらがされる番です」{a}はうつ伏せのまま、ゆっくりと体を返した。|際どいところへ滑り込もうとした手を、{a}は迷わず押し戻した。「知り合いに好き勝手される趣味はない｜＝｜知り合いに好き勝手される趣味はありません」{m}の手が、宙で止まった。|{a}は{m}の手つきが変わった瞬間に、身を起こした。「施術はここまで｜施術はここまでだ｜施術はここまでです」――そう言って、{a}は{m}の顔をまっすぐに見た。');
  /* 結末に足す一文（施術のあと、二人がまた顔を合わせる） */
  C.RES_AFTER = L('翌日、{a}は{m}と顔を合わせても、目を合わせられなかった。{m}のほうも、同じだった。|{a}のスマホには、{m}から「次の予約、いつにする？｜次の予約は、いつにする？｜次の予約、いつにしますか？」とだけ届いていた。|{a}はそれからしばらく、{m}の手を見るたびに、施術台の上のことを思い出した。');

  /* ---------- 住人どうしで、体の関係にならない組：普通のマッサージのまま（全年齢と同じ書き方） ---------- */
  C.PLAIN_SEQ = ['問診', '肩', '背中', '腰', '脚', '仕上げ'];
  C.PLAIN_LABEL = { '問診': '受付と問診', '肩': 'うつ伏せで肩と首', '背中': '背中', '腰': '腰', '脚': 'ふくらはぎと足裏', '仕上げ': '仕上げ' };
  C.PLAIN_ACT = {
    '問診': L('{m}は問診票を手に、{a}の向かいに座った。「……知り合いに問診するの、変な感じ｜……知り合いに問診するのは、妙な感じだ｜……知り合いに問診するのは、変な感じですね」二人とも、少しだけ笑った。|{m}は{a}の肩に手を当てて、凝り具合を確かめた。「ああ、これはひどい。いつもこんな姿勢で仕事してるんでしょ｜ああ、これはひどい。いつもこんな姿勢で仕事をしているんだろう｜ああ、これはひどいですね。いつもこんな姿勢で仕事をしているんでしょう」|{m}「痛いところ、ある？｜痛いところは、あるか？｜痛いところは、ありますか？」――{a}が答えるたびに、{m}は真面目な顔で問診票に書き込んだ。'),
    '肩': L('{m}の親指が、{a}の肩甲骨の縁にぐっと沈んだ。「うわ、硬い｜うわ、硬いな｜うわ、硬いですね」――思わず素の声が出ていた。|首筋から肩へ、{m}の手のひらがゆっくりと往復した。{a}は、思っていたよりずっと本格的な手つきに驚いた。|{m}は温めたタオルを{a}の首に当てて、その上から耳の後ろのつぼを押した。'),
    '背中': L('{m}は背骨の両脇を、下から上へ丁寧に押し上げていった。押されるたびに、{a}の口から長い息が漏れた。|「ここ、ずっと張ってたでしょ｜ここは、ずっと張っていただろう｜ここ、ずっと張っていたでしょう」――{m}の手が、{a}自身も気づいていなかった凝りを正確に探り当てた。|{m}は{a}の背中に体重をかけ、ゆっくりと伸ばした。骨が、小さく鳴った。'),
    '腰': L('{m}は{a}の腰に両手を置いて、ゆっくりと円を描いた。「座りっぱなしでしょ。腰が泣いてる｜座りっぱなしだろう。腰が泣いている｜座りっぱなしでしょう。腰が泣いていますよ」|腰骨の上を押されて、{a}は思わず「そこ」と声を上げた。{m}は「でしょ｜だろう｜でしょう」と得意げに笑った。|{m}はタオルを掛け直してから、腰のまわりを念入りにほぐした。手つきは、最後まで仕事のものだった。'),
    '脚': L('ふくらはぎを絞るように揉まれて、{a}は痛いのか気持ちいいのか分からない声を上げた。|{m}は{a}の足裏を親指で押した。「ここ、胃のつぼ。……最近、食べすぎてない？｜ここは、胃のつぼだ。……最近、食べすぎていないか？｜ここ、胃のつぼです。……最近、食べすぎていませんか？」|{m}は膝の裏から足首まで、むくみを流すように手のひらを滑らせた。'),
    '仕上げ': L('{m}は最後に、{a}の肩を両手でぽんと叩いた。「はい、おしまい。起き上がるとき、ゆっくりね｜よし、終わりだ。起き上がるときは、ゆっくりにしろ｜はい、おしまいです。起き上がるときは、ゆっくりにしてくださいね」|{m}は温かいおしぼりを差し出した。「お疲れさま。……知り合いの体って、思ったより緊張するね｜お疲れさま。……知り合いの体というのは、思ったより緊張するな｜お疲れさまでした。……知り合いの体って、思ったより緊張しますね」|仕上げのストレッチで、{a}の背中がぐっと伸びた。{m}は満足そうにうなずいた。')
  };
  /* 「ほとんど」マッサージ：手が際どいところへ行きかけて、止まる */
  C.PLAIN_ALMOST = L('{m}の手が太腿のほうへ上がりかけて、ぴたりと止まった。「……ここは、やめておこうか｜……ここは、やめておこう｜……ここは、やめておきましょうか」{m}はそう言って、ふくらはぎに手を戻した。|オイルを手に取った{m}は、タオルの縁を見て少し迷った。それから、タオルをきっちり掛け直した。「脚はタオルの上から。知り合いだしね｜脚はタオルの上からだ。知り合いだからな｜脚はタオルの上からにします。知り合いですしね」|{m}の指が膝の上へ滑りかけて、慌てたように引っ込んだ。「ご、ごめん。今のは手が滑っただけ｜す、すまない。今のは手が滑っただけだ｜す、すみません。今のは手が滑っただけです」――{a}は、聞かなかったことにした。');
  C.PLAIN_TALK = L('{m}「最近どう？　ちゃんと寝てる？｜最近どうだ？　ちゃんと寝ているか？｜最近どうですか？　ちゃんと寝ていますか？」――施術中の世間話は、いつもの二人の会話と変わらなかった。|{a}は施術台に顔を埋めたまま、「{m}がこんなに上手いとは思わなかった｜＝｜{m}がこんなに上手いとは思いませんでした」と言った。{m}は照れたように笑った。|{m}「ここで働いてること、ほかの人には内緒にしておいて｜ここで働いていることは、ほかの人には内緒にしておいてくれ｜ここで働いていることは、ほかの人には内緒にしておいてください」――{a}は枕に顔を埋めたまま、うなずいた。|{m}は{a}の凝りを見つけるたびに、「ほら、ここも｜ほら、ここもだ｜ほら、ここもです」と得意げに言った。');
  C.PLAIN_END = L('{a}は店を出てから、肩をぐるりと回した。嘘みたいに軽かった。|{a}は次の予約を入れて帰った。指名の欄には、迷わず{m}の名前を書いた。|後日、{a}は「普通にすごく上手かった｜普通に、とても上手かった｜普通に、すごく上手かったです」と、{m}に直接言った。{m}は「普通に、って何｜普通に、とは何だ｜普通に、って何ですか」と笑った。|{a}はその夜、久しぶりに朝まで一度も目を覚まさずに眠った。');

  /* ---------- カーテン越し（モブの施術者・住人が2人とも客） ---------- */
  C.CUR_INTRO = L('{a}と{b}は、二人一緒に予約を入れていた。案内されたのは、薄いカーテン一枚で仕切られた二つの施術台だった。|「ペアコースでご予約のお二人ですね」――受付の声に、{a}と{b}は顔を見合わせた。施術室は一つで、真ん中をカーテンが仕切っているだけだった。|{b}が見つけてきたのは、ペア割のある評判の店だった。「せっかくだから一緒に｜せっかくだから一緒に来い｜せっかくですから一緒にどうですか」と誘われて、{a}も隣の施術台に横になった。間のカーテンは、思っていたよりずっと薄かった。');
  /* カーテンの向こうの様子（{a}＝聞いている人 {b}＝向こうの人） */
  C.CUR_HEAR = {
    chat: L('カーテン越しに、{b}の声がした。「そっち、どう？｜そっちはどうだ？｜そちらはどうですか？」「……普通に、気持ちいい｜＝｜……普通に、気持ちいいです」――{a}はそう答えて、また枕に顔を戻した。|カーテンの向こうから、{b}が施術者と世間話をしている声が聞こえてきた。いつもの{b}の、のんきな声だった。|{a}はカーテンの隙間から、隣の施術台の足元だけを見た。{b}のつま先が、気持ちよさそうに揺れていた。'),
    notice: L('カーテンの向こうで、{b}の声が急に尖った。「……ちょっと待って。今の、何？｜……ちょっと待て。今のは、何だ｜……ちょっと待ってください。今の、何ですか」――{a}は思わず、息を止めて耳を澄ませた。|隣の施術台がきしんで、{b}が身を起こす気配がした。施術者の言い訳する声が、カーテン越しにぼそぼそと聞こえた。'),
    left: L('カーテンの向こうで、{b}が施術台を降りる音がした。「……先に出てる｜……先に出ている｜……先に出ていますね」――短い言葉だけを残して、足音が遠ざかっていった。|{b}の「帰る｜＝｜帰ります」という声がして、隣のブースが急に静かになった。{a}の側の施術は、何事もなかったように続いた。'),
    hot: L('カーテンの向こうから、{b}の押し殺した声が漏れてきた。聞いてはいけないものを聞いた気がして、{a}は枕に顔を押しつけた。|隣の施術台が、規則正しくきしみ始めた。カーテン一枚向こうで何が起きているのか、{a}は考えないようにするのが精一杯だった。|{b}の声が、途中から聞いたことのない高さに変わった。{a}は思わず、カーテンのほうを振り向きかけた。'),
    reverse: L('カーテンの向こうで、何かが倒れる音がした。続いて聞こえたのは、施術者の慌てた声と、楽しげな{b}の声だった。|隣の施術台が大きくきしんだ。「交代｜交代だ｜交代です」という{b}の声と、施術者の情けない声が、カーテン越しに聞こえた。'),
    sleep: L('カーテンの向こうから、{b}の穏やかな寝息が聞こえてきた。|隣が急に静かになった。耳を澄ませると、{b}の規則正しい寝息だけが聞こえた。')
  };
  /* ハプニング「隣のブース」：隣はカーテンの向こうのもう一人（{b}） */
  C.CUR_NEIGHBOR = L('カーテンの向こう、{b}の施術台のほうから、押し殺した声が聞こえてきた。|カーテン一枚向こうで、{b}の施術台がきしむ音と、乱れた息遣いが聞こえた。');
  /* 聞いた人の反応（態度ごと。向こうの声に気づいたときだけ） */
  C.CUR_REACT = {
    proud: L('{a}は「……うるさい店だ」と小さく吐き捨てた。|{a}は聞こえないふりをして、眉間に皺を寄せた。'),
    stern: L('{a}は聞かなかったことにした。聞かなかったことにするには、相当な集中が必要だった。|{a}は目を閉じて、自分の呼吸だけを数え直した。'),
    tsun: L('{a}「な、何やってんのよ、あっちは……」――自分の頬が熱いのには、気づかないふりをした。|{a}は「べ、別に気にしてないし」と、誰に向けるでもなく呟いた。'),
    gentle: L('{a}は「あらあら」と小さく笑った。笑いながら、少しだけ心配になった。|{a}はカーテンのほうに「大丈夫？」と声をかけようとして、やめた。'),
    devoted: L('{a}は「{b}、大丈夫かな……」と、自分のことより先に心配した。|{a}はカーテンの向こうが気になって、施術に集中できなかった。'),
    cool: L('{a}は隣の音から、向こうの施術がどこまで進んだのかを推測した。推測して、少し後悔した。|{a}は「隣も同じ手順か」と、冷静に分析しようとした。'),
    free: L('{a}は思わず吹き出しかけた。「ちょっと、隣、すごいことになってない？」|{a}はカーテンに向かって「おーい」と小声で呼びかけた。返事はなかった。'),
    shy: L('{a}は耳まで真っ赤になって、タオルを頭までかぶった。|{a}は聞こえてくる音に、身を縮めた。自分の声も、向こうに聞こえているのかもしれなかった。'),
    polite: L('{a}は「……失礼いたしました」と、なぜか自分が謝ってしまった。|{a}は聞いてはいけないものを聞いた気がして、そっと両手で耳を塞いだ。')
  };
  C.CUR_END = {
    both: L('その日から、{a}と{b}のペア予約は毎週の決まりごとになった。帰り道、二人は一度も今日の話をしなかった。|店を出た{a}と{b}は、駅まで一言も喋らなかった。改札の前で、どちらからともなく「また来る？｜また来るか？｜また来ますか？」と訊いた。'),
    one: L('店の前で待っていた{a}は、遅れて出てきた{b}の顔を見て、何も訊かなかった。訊かなくても、カーテン越しに大体は聞こえていた。|{a}は帰り道、隣を歩く{b}の顔を何度も盗み見た。{b}は、ずっと前だけを見ていた。'),
    none: L('帰り道、{a}と{b}は「普通にいい店だったね｜普通にいい店だったな｜普通にいい店でしたね」と言い合った。どちらも、カーテンの向こうのことには触れなかった。|{a}と{b}は、駅前の喫茶店で反省会を開いた。話は、最後まで噛み合わなかった。')
  };

  /* ---------- 住人の写し（受け攻め・恋愛対象・縛りを HK.Pos・HK.State で見るため） ---------- */
  C.resident = function (input, i) {
    var c = input.chars[i], pc = (input.perChar && input.perChar[i]) || {};
    var p = { i: i, name: c.name, eg: c.eg, tr: HK.traits(c.eg), gender: c.gender || '', likes: c.likes || '', tone: c.tone || '', fp: c.fp || '', pos: c.pos || '', posLike: c.posLike || '', futa: !!c.futa, memo: c.memo || '',
      ng: Array.isArray(c.loveNG) ? c.loveNG.filter(function (x) { return x >= 0; }) : [], lock: c.loveLock === '' || c.loveLock == null || isNaN(+c.loveLock) ? null : +c.loveLock,
      sexLock: c.sexLock === 'any' || c.sexLock === 'lover' ? c.sexLock : c.sexLock === '' || c.sexLock == null || isNaN(+c.sexLock) ? null : +c.sexLock, pick: pc.pick || {}, rawNoR18: !!c.noR18 };
    if (HK.charFlags) HK.charFlags(c, p, 'massage');
    p.persona = HK.personaOf(p);
    (input.ties || []).forEach(function (t) { if (t && /^(lover|mate|fated)$/.test(t.type) && (t.a === i || t.b === i)) (p.loveSet = p.loveSet || []).push(t.a === i ? t.b : t.a); });
    return p;
  };
  /* 住人どうしの施術で、際どい施術（体の関係）にしてよいか。だめなら理由 */
  C.pairWhy = function (T, Cc) {
    var P = HK.Pos, ST = HK.State;
    if (HK.SAFE_ON || !P || !ST) return '全年齢';
    if (T.rawNoR18 || Cc.rawNoR18 || !ST.r18ok(T) || !ST.r18ok(Cc)) return 'R18に参加しない人がいる';
    if ((HK.ngPair && HK.ngPair(T, Cc)) || (HK.sexBlocked && HK.sexBlocked(T, Cc))) return '恋愛・R18にしない組';
    if (!P.genderOK(T, Cc)) return '恋愛対象が合わない';
    if (!P.okSex(T, Cc)) return '受け攻めの指定が合わない';
    return '';
  };
  /* 配役：{ mode: 'mob'（住人1人）|'res'（住人が施術者）|'curtain'（2人とも客）, ci: 客の番号, ti: 施術者の番号, P: 住人の写し } */
  C.cast = function (input) {
    var n = Math.min(2, (input.chars || []).length);
    if (n < 2 || !HK.Roles) return { mode: 'mob', ci: [0] };
    var P = [C.resident(input, 0), C.resident(input, 1)];
    var S0 = { P: P, env: input.env || {}, rng: HK.rng((((input.seed || 1) * 131) + 7) >>> 0), scen: HK.SCENARIOS.massage };
    var r = HK.Roles.resolve(S0, 'therapist', input);
    if (r.kind === 'res' && r.who && r.who[0]) {
      var t = r.who[0], cl = P[0] === t ? P[1] : P[0];
      return { mode: 'res', ti: t.i, ci: [cl.i], P: P, T: t, CR: cl, picked: (P.filter(function (x) { return (x.pick || {}).therapist === 'yes'; }).length > 0) };
    }
    return { mode: 'curtain', ci: [0, 1], P: P };
  };

  /* ---------- カーテン越し：二人の結果を一つにまとめる ---------- */
  function fmt(t, v) { return String(t).replace(/\{([a-z0-9]+)\}/g, function (m, k) { return v[k] != null ? v[k] : m; }); }
  function blocks(log) {
    var pre = [], out = [], cur = null;
    log.forEach(function (e) {
      if (e.kind === 'step') { cur = { label: e.text, room: e.room, step: e, items: [] }; out.push(cur); return; }
      (cur ? cur.items : pre).push(e);
    });
    return { pre: pre, list: out };
  }
  /* その区切りで起きたこと（カーテンの向こうに聞こえる音） */
  function eventOf(items) {
    var has = function (re) { return items.some(function (e) { return re.test(e.tag || ''); }); };
    if (has(/^(?:立場逆転|逆転)$/)) return 'reverse';
    if (has(/^退店$/)) return 'left';
    if (has(/^(?:陥落|おねだり|延長|暗転)$/) || items.some(function (e) { return e.kind === 'climax'; })) return 'hot';
    if (has(/^気づき$|（拒否/)) return 'notice';
    if (has(/^寝落ち$/)) return 'sleep';
    return '';
  }
  var RANK = { ok: 0, mid: 1, over: 2 };
  C.merge = function (input, A, B, rng) {
    var hA = A.hero, hB = B.hero, nA = hA.name, nB = hB.name;
    /* 同じ文を二度使わない（使い切ったら、また全部から） */
    var used = [];
    var pick = function (a) { var f = a.filter(function (x) { return used.indexOf(x) < 0; }); var x = (f.length ? f : a)[rng.int((f.length ? f : a).length)]; used.push(x); return x; };
    var log = [];
    var push = function (e) { log.push(e); return e; };
    var bA = blocks(A.log), bB = blocks(B.log);
    /* 来店：二人まとめて一つに */
    var whyA = (bA.pre[0] && bA.pre[0].why) || '', whyB = (bB.pre[0] && bB.pre[0].why) || '';
    var intro = push({ kind: 'sys', tag: '来店', text: fmt(pick(C.CUR_INTRO), { a: nA, b: nB }) + ' ' + nA + 'の担当は' + A.staffName + '、' + nB + 'の担当は' + B.staffName + 'だった。', why: nA + '…' + whyA + '／' + nB + '…' + whyB, actors: [hA.i, hB.i], room: 0, floor: 0 });
    intro.v = (bA.pre[0] && bA.pre[0].v) || { r: 0, p: 0, c: 0 };
    bA.pre.slice(1).forEach(function (e) { e.actors = [hA.i]; push(e); });
    bB.pre.slice(1).forEach(function (e) { e.actors = [hB.i]; push(e); });
    /* 区切りを、施術の順（room）でそろえる。延長は施術のあとより前 */
    var keys = [], byKey = {};
    [[bA, 'a'], [bB, 'b']].forEach(function (x) {
      x[0].list.forEach(function (b) {
        if (!byKey[b.label]) { byKey[b.label] = { label: b.label, room: b.room, step: b.step, a: null, b: null }; keys.push(b.label); }
        byKey[b.label][x[1]] = b;
      });
    });
    keys.sort(function (p, q) { var x = byKey[p], y = byKey[q]; return x.room - y.room || (x.label === '施術のあと' ? 1 : 0) - (y.label === '施術のあと' ? 1 : 0); });
    var heard = 0, chatDone = false, goneA = false, goneB = false;
    function hear(listener, other, ev, room) {
      if (!ev || heard >= 4) return;
      var t = fmt(pick(C.CUR_HEAR[ev]), { a: listener.name, b: other.name });
      if (/^(?:hot|notice|reverse)$/.test(ev) && C.CUR_REACT[listener.persona] && rng() < 0.75) t += fmt(pick(C.CUR_REACT[listener.persona]), { a: listener.name, b: other.name });
      push({ kind: 'ev', tag: 'カーテン越し', text: t, why: 'カーテンの向こうの' + other.name + 'の様子が聞こえた', actors: [listener.i], room: room, floor: 0, v: { r: 0, p: 0, c: 0 } });
      heard++;
    }
    keys.forEach(function (k, j) {
      var x = byKey[k];
      push(x.step);
      if (x.a) x.a.items.forEach(function (e) { e.actors = [hA.i]; push(e); });
      if (x.b) x.b.items.forEach(function (e) { e.actors = [hB.i]; push(e); });
      var evA = x.a ? eventOf(x.a.items) : '', evB = x.b ? eventOf(x.b.items) : '';
      /* 向こうがまだ施術台にいるときだけ、こちらの音が聞こえる */
      /* 同じ区切りで二人とも何か起きたら、どちらか一方の音だけ */
      var canA = evA && x.b && !goneB, canB = evB && x.a && !goneA;
      if (canA && canB) { if (rng() < 0.5) canA = false; else canB = false; }
      if (canA) hear(hB, hA, evA, x.room);
      if (canB) hear(hA, hB, evB, x.room);
      if (!chatDone && j === 2 && x.a && x.b && !evA && !evB) { chatDone = true; var Lh = rng() < 0.5 ? hA : hB; hear(Lh, Lh === hA ? hB : hA, 'chat', x.room); }
      if (evA === 'left') goneA = true;
      if (evB === 'left') goneB = true;
    });
    log.forEach(function (e, n) { e.n = n; });
    var turns = [];
    [[A, nA], [B, nB]].forEach(function (x) { (x[0].turns || []).forEach(function (t) { var e = x[0].log[t.n], n = log.indexOf(e); if (n >= 0) turns.push({ n: n, why: x[1] + '：' + t.why }); }); });
    turns.sort(function (p, q) { return p.n - q.n; });
    /* 二人の推移 */
    var hist = [], len = Math.max(A.hist.length, B.hist.length);
    for (var k = 0; k < len; k++) {
      var a = A.hist[Math.min(k, A.hist.length - 1)], b = B.hist[Math.min(k, B.hist.length - 1)];
      hist.push({ n: k, f: 0, r: a.r, p: a.p, c: a.c, hs: [{ r: a.r, p: a.p, c: a.c }, { r: b.r, p: b.p, c: b.c }] });
    }
    /* 結末 */
    var EA = A.ending, EB = B.ending, hot = function (E) { return E.kind === 'over'; };
    var kind = RANK[EA.kind] >= RANK[EB.kind] ? EA.kind : EB.kind;
    var endK = hot(EA) && hot(EB) ? 'both' : hot(EA) || hot(EB) ? 'one' : 'none';
    var ev = endK === 'one' ? (hot(EA) ? { a: nB, b: nA } : { a: nA, b: nB }) : { a: nA, b: nB };
    var lines = [fmt(pick(C.CUR_END[endK]), ev)].concat(EA.lines, EB.lines);
    var short = function (t) { return String(t).split(' ― ')[0]; };
    hA.fate = short(EA.title); hB.fate = short(EB.title);
    hA.fallTitle = ''; hB.fallTitle = '';
    var E = { type: kind, kind: kind, title: 'カーテン越し ― ' + nA + '：' + short(EA.title) + '／' + nB + '：' + short(EB.title), lines: lines };
    var st = function (R, key) { var f = (R.estats || []).filter(function (s) { return s[0] === key; })[0]; return f ? f[1] : ''; };
    var estats = [[nA, short(EA.title)], [nB, short(EB.title)]];
    ['気づいた', '騙された', (HK.SoloKit && HK.SoloKit.W_CL) || '高鳴り'].forEach(function (key) { estats.push([key, nA + ' ' + st(A, key) + '・' + nB + ' ' + st(B, key)]); });
    var res = {};
    for (var p in A) res[p] = A[p];
    res.log = log; res.hist = hist; res.turns = turns; res.ending = E; res.outcome = E.title;
    res.hero = hA; res.heroes = [hA, hB]; res.party = true; res.estats = estats;
    res.advice = A.advice.map(function (s) { return nA + '：' + s; }).concat(B.advice.map(function (s) { return nB + '：' + s; }));
    res.meta = 'カーテン越し・' + A.meta + '／' + B.staffName;
    res.summary = nA + '・' + nB + '：' + E.title;
    res.stepCount = hist.length - 1;
    res.chars = [{ name: nA, i: hA.i }, { name: nB, i: hB.i }];
    return res;
  };
})();
