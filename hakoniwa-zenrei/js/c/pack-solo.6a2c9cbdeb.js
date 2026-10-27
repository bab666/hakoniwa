;
/* ==== js/solo-massage-cast.js ==== */
HK.Load.def(116,'js/solo-massage-cast.js',function(){
(function(){
'use strict';
var HK=window.HK;
if(!HK)return;
function L(s){return s.split('|');}
var C=HK.MassageCast={};
C.STAFF_OF={gentle:'gentle',polite:'gentle',devoted:'gentle',free:'chara',tsun:'chara',proud:'silent',stern:'silent',cool:'silent',shy:'silent'};
C.RES_INTRO=L('{a}は予約した店の施術室に通された。カーテンが開いて現れたのは、施術着姿の{m}だった。{a}「……え、{m}？　ここで働いてたの？｜……え、{m}か？　ここで働いていたのか？｜……え、{m}？　ここで働いていたんですか？」|{a}が受付で名前を書くと、奥から聞き覚えのある声がした。顔を上げると、施術着の{m}が立っていた。知り合いに体を任せることになるとは、思っていなかった。|{a}は口コミで評判のいい施術者を指名した。現れたのは、よく知っている顔だった。{m}は一瞬だけ目を丸くして、それから仕事の顔に戻った。');
C.RES_GREET={
proud:L('{m}「客として来たなら、文句は言わせない。うつ伏せになれ」|{m}「腕は確かだ。黙って横になっていればいい」'),
stern:L('{m}「知り合いでも、手順は同じです。まず問診から」|{m}「本日の担当です。私情は挟みませんので、ご安心を」'),
tsun:L('{m}「な、なんでここに来るわけ……。べ、別に嫌じゃないけど。ちゃんとやるから、横になって」|{m}「……来ちゃったものは仕方ないでしょ。ほら、さっさと着替えて」'),
gentle:L('{m}「来てくれて嬉しいな。今日は、ゆっくりほぐしていって」|{m}「ふふ、びっくりした？　大丈夫、ちゃんと上手いから」'),
devoted:L('{m}「あ、あの……精一杯、やらせてもらいます。痛かったら、すぐ言ってください」|{m}「指名、ありがとうございます……！　がんばります」'),
cool:L('{m}「知り合いだからといって、料金は変わりません。どうぞ、横に」|{m}「担当します。施術中の私語は、少なめでお願いします」'),
free:L('{m}「えっ、うそ、{a}じゃん！　いいよいいよ、サービスしちゃう」|{m}「やっほー。せっかくだし、フルコースでほぐしてあげる」'),
shy:L('{m}は{a}の顔を見て固まり、それから小さな声で言った。「……た、担当、です。よろしく、お願いします……」|{m}は目を逸らしたまま、タオルを差し出した。「き、着替えたら、呼んでください……」'),
polite:L('{m}「ようこそお越しくださいました。本日は、誠心誠意務めさせていただきます」|{m}「本日担当いたします。どうぞ、お楽になさってください」')
};
C.RES_EXCUSE={
proud:L('{m}「黙って寝てろ。素人が施術に口を出すな」――{m}は手を止めなかった。言い訳をする気すら、ないようだった。|{m}「ここも筋肉だ。疑うなら、ほかの店に行けばいい」{m}はそう言い捨てて、同じ場所をもう一度押した。|{m}は鼻で笑った。「気のせいだ。凝りがほぐれると、皆そう言う」'),
stern:L('{m}「骨盤まわりの調整です。教本の手順どおりに行っています」――{m}の口調は、どこまでも事務的だった。|{m}「ご不安なら、施術計画書をお見せします」{m}は手を止めずに言った。計画書が出てくることはなかった。|{m}「反応が出るのは、効いている証拠です。続けます」'),
tsun:L('{m}「へ、変な意味じゃないから！　ここ、本当にリンパがあるの！」――{m}の耳まで、真っ赤だった。|{m}「か、勘違いしないでよね。仕事なんだから、仕事！」そう言いながら、{m}の手は一度も離れなかった。|{m}「そ、そんな顔で見ないで。……ちゃんとした施術なんだから」'),
gentle:L('{m}「大丈夫、心配しないで。ここをほぐすと、体がすごく楽になるの」――{m}はいつもと同じ、柔らかい声で言った。|{m}「びっくりさせちゃった？　ごめんね。でも、みんなここで一番ほぐれるんだよ」|{m}「力を抜いて。……信じて、任せてほしいな」{m}の手のひらは、温かかった。'),
devoted:L('{m}「ご、ごめんなさい！　でも、本当にここが効くって、教わって……」――{m}は真っ赤になりながら、それでも手を止めなかった。|{m}「い、嫌だったら、すぐやめます。……でも、もう少しだけ、続けさせてください」|{m}「ちゃんと勉強したんです。だから……信じてもらえませんか」'),
cool:L('{m}「この部位にはリンパ節が集まっています。ここを避けると、施術の効果が三割落ちます」――数字まで添えられると、反論しにくかった。|{m}「感覚が過敏になっているのは、血流が改善したからです。想定の範囲内です」|{m}は淡々と答えた。「施術の範囲です。気になるなら、終わってから質問を受けます」'),
free:L('{m}「えー、大丈夫だって！　ここ、みんな最初びっくりするけど、終わったらすっごい楽になるから！」|{m}「あはは、くすぐったかった？　ごめんごめん。でもこれ、ちゃんとしたやつだよ。たぶん！」|{m}「知り合い割ってことで、特別に念入りにしてるだけだって。ね？」'),
shy:L('{m}「あ、あの……こ、ここも、施術の……範囲、なので……」――消え入りそうな声だった。|{m}は真っ赤になって俯いた。「ま、マニュアルに、書いてあるので……」|{m}「す、すみません……でも、ここを、流さないと……」{m}の指は、震えていた。'),
polite:L('{m}「ご不快でしたら申し訳ございません。こちらは、全身の巡りを整えるための手技でございます」|{m}「大変失礼いたしました。ですが、ここを避けますと、施術の効果が十分に得られないのです」|{m}「お客様のお体のためでございます。どうか、今しばらくお任せください」')
};
C.RES_TOP_STOP=L('{m}の指が内腿を這い上がりかけたところで、{a}はその手首を掴んだ。「――そこから先は、そっちがされる番｜――そこから先は、そっちがされる番だ｜――そこから先は、そちらがされる番です」{a}はうつ伏せのまま、ゆっくりと体を返した。|際どいところへ滑り込もうとした手を、{a}は迷わず押し戻した。「知り合いに好き勝手される趣味はない｜＝｜知り合いに好き勝手される趣味はありません」{m}の手が、宙で止まった。|{a}は{m}の手つきが変わった瞬間に、身を起こした。「施術はここまで｜施術はここまでだ｜施術はここまでです」――そう言って、{a}は{m}の顔をまっすぐに見た。');
C.RES_AFTER=L('翌日、{a}は{m}と顔を合わせても、目を合わせられなかった。{m}のほうも、同じだった。|{a}のスマホには、{m}から「次の予約、いつにする？｜次の予約は、いつにする？｜次の予約、いつにしますか？」とだけ届いていた。|{a}はそれからしばらく、{m}の手を見るたびに、施術台の上のことを思い出した。');
C.PLAIN_SEQ=['問診','肩','背中','腰','脚','仕上げ'];
C.PLAIN_LABEL={'問診':'受付と問診','肩':'うつ伏せで肩と首','背中':'背中','腰':'腰','脚':'ふくらはぎと足裏','仕上げ':'仕上げ'};
C.PLAIN_ACT={
'問診':L('{m}は問診票を手に、{a}の向かいに座った。「……知り合いに問診するの、変な感じ｜……知り合いに問診するのは、妙な感じだ｜……知り合いに問診するのは、変な感じですね」二人とも、少しだけ笑った。|{m}は{a}の肩に手を当てて、凝り具合を確かめた。「ああ、これはひどい。いつもこんな姿勢で仕事してるんでしょ｜ああ、これはひどい。いつもこんな姿勢で仕事をしているんだろう｜ああ、これはひどいですね。いつもこんな姿勢で仕事をしているんでしょう」|{m}「痛いところ、ある？｜痛いところは、あるか？｜痛いところは、ありますか？」――{a}が答えるたびに、{m}は真面目な顔で問診票に書き込んだ。'),
'肩':L('{m}の親指が、{a}の肩甲骨の縁にぐっと沈んだ。「うわ、硬い｜うわ、硬いな｜うわ、硬いですね」――思わず素の声が出ていた。|首筋から肩へ、{m}の手のひらがゆっくりと往復した。{a}は、思っていたよりずっと本格的な手つきに驚いた。|{m}は温めたタオルを{a}の首に当てて、その上から耳の後ろのつぼを押した。'),
'背中':L('{m}は背骨の両脇を、下から上へ丁寧に押し上げていった。押されるたびに、{a}の口から長い息が漏れた。|「ここ、ずっと張ってたでしょ｜ここは、ずっと張っていただろう｜ここ、ずっと張っていたでしょう」――{m}の手が、{a}自身も気づいていなかった凝りを正確に探り当てた。|{m}は{a}の背中に体重をかけ、ゆっくりと伸ばした。骨が、小さく鳴った。'),
'腰':L('{m}は{a}の腰に両手を置いて、ゆっくりと円を描いた。「座りっぱなしでしょ。腰が泣いてる｜座りっぱなしだろう。腰が泣いている｜座りっぱなしでしょう。腰が泣いていますよ」|腰骨の上を押されて、{a}は思わず「そこ」と声を上げた。{m}は「でしょ｜だろう｜でしょう」と得意げに笑った。|{m}はタオルを掛け直してから、腰のまわりを念入りにほぐした。手つきは、最後まで仕事のものだった。'),
'脚':L('ふくらはぎを絞るように揉まれて、{a}は痛いのか気持ちいいのか分からない声を上げた。|{m}は{a}の足裏を親指で押した。「ここ、胃のつぼ。……最近、食べすぎてない？｜ここは、胃のつぼだ。……最近、食べすぎていないか？｜ここ、胃のつぼです。……最近、食べすぎていませんか？」|{m}は膝の裏から足首まで、むくみを流すように手のひらを滑らせた。'),
'仕上げ':L('{m}は最後に、{a}の肩を両手でぽんと叩いた。「はい、おしまい。起き上がるとき、ゆっくりね｜よし、終わりだ。起き上がるときは、ゆっくりだ｜はい、おしまいです。起き上がるときは、ゆっくりどうぞ」|{m}は温かいおしぼりを差し出した。「お疲れさま。……知り合いの体って、思ったより緊張するね｜お疲れさま。……知り合いの体というのは、思ったより緊張するな｜お疲れさまでした。……知り合いの体って、思ったより緊張しますね」|仕上げのストレッチで、{a}の背中がぐっと伸びた。{m}は満足そうにうなずいた。')
};
C.PLAIN_ALMOST=L('{m}の手が太腿のほうへ上がりかけて、ぴたりと止まった。「……ここは、やめておこうか｜……ここは、やめておこう｜……ここは、やめておきましょうか」{m}はそう言って、ふくらはぎに手を戻した。|オイルを手に取った{m}は、タオルの縁を見て少し迷った。それから、タオルをきっちり掛け直した。「脚はタオルの上から。知り合いだしね｜脚はタオルの上からだ。知り合いだからな｜脚はタオルの上からにします。知り合いですしね」|{m}の指が膝の上へ滑りかけて、慌てたように引っ込んだ。「ご、ごめん。今のは手が滑っただけ｜す、すまない。今のは手が滑っただけだ｜す、すみません。今のは手が滑っただけです」――{a}は、聞かなかったことにした。');
C.PLAIN_TALK=L('{m}「最近どう？　ちゃんと寝てる？｜最近どうだ？　ちゃんと寝ているか？｜最近どうですか？　ちゃんと寝ていますか？」――施術中の世間話は、いつもの二人の会話と変わらなかった。|{a}は施術台に顔を埋めたまま、「{m}がこんなに上手いとは思わなかった｜＝｜{m}がこんなに上手いとは思いませんでした」と言った。{m}は照れたように笑った。|{m}「ここで働いてること、ほかの人には内緒にしておいて｜ここで働いていることは、ほかの人には内緒にしておいてくれ｜ここで働いていることは、ほかの人には内緒にしておいてください」――{a}は枕に顔を埋めたまま、うなずいた。|{m}は{a}の凝りを見つけるたびに、「ほら、ここも｜ほら、ここもだ｜ほら、ここもです」と得意げに言った。');
C.PLAIN_END=L('{a}は店を出てから、肩をぐるりと回した。嘘みたいに軽かった。|{a}は次の予約を入れて帰った。指名の欄には、迷わず{m}の名前を書いた。|後日、{a}は「普通にすごく上手かった｜普通に、とても上手かった｜普通に、すごく上手かったです」と、{m}に直接言った。{m}は「普通に、って何｜普通に、とは何だ｜普通に、って何ですか」と笑った。|{a}はその夜、久しぶりに朝まで一度も目を覚まさずに眠った。');
C.PLAIN_MOB={
act:{
'問診':L('{m}は問診票を挟んだボードを手に、{a}の向かいに腰を下ろした。「今日はどこがつらい？｜今日はどこがつらい？｜今日はどちらがおつらいですか？」事務的な声だったが、目は真剣だった。{a}が首と腰を指さすと、{m}は小さくうなずいた。|{m}は{a}の肩に手を当てて、凝り具合を確かめた。「ああ、これはひどい。いつも同じ姿勢で仕事してるでしょ｜ああ、これはひどい。いつも同じ姿勢で仕事をしているだろう｜ああ、これはひどいですね。いつも同じ姿勢でお仕事をされているでしょう」{a}は苦笑いで認めた。|{m}「痛いところ、ある？｜痛いところは、あるか？｜痛いところは、ありますか？」――{a}が答えるたびに、{m}は問診票に細かく書き込んだ。書き終えると、{m}は施術台のタオルを整えて{a}を促した。'),
'仕上げ':L('{m}は最後に、{a}の肩を両手でぽんと叩いた。「はい、おしまい。起き上がるとき、ゆっくりね｜よし、終わりだ。起き上がるときは、ゆっくりでいい｜はい、おしまいです。起き上がるときは、ゆっくりどうぞ」{a}は言われたとおり、ゆっくり体を起こした。|{m}は温かいおしぼりを差し出した。「お疲れさま。水分、多めにとってね｜お疲れさま。水分は多めにとるように｜お疲れさまでした。お水を多めにとってくださいね」{a}は受け取ったおしぼりで顔を拭き、深く息をついた。|仕上げのストレッチで、{a}の背中がぐっと伸びた。{m}は満足そうにうなずいて、カーテンを開けた。')
},
almost:L('{m}の手が太腿のほうへ上がりかけて、ぴたりと止まった。{m}は何事もなかったようにタオルを掛け直し、ふくらはぎに手を戻した。{a}は、知らずに詰めていた息を吐いた。|オイルを手に取った{m}は、{a}の顔をちらりと見てから、タオルの上から脚を流しはじめた。「今日は、ここまでにしておくね｜今日は、ここまでにしておく｜今日は、ここまでにしておきますね」{a}が何のことか訊く前に、施術は次へ進んでいた。|{m}の指が膝の上で一瞬だけ迷い、そのまま膝の裏へと滑っていった。{a}は気のせいだと思うことにした。手つきは、最後まで仕事のものだった。'),
talk:L('{m}「お仕事、忙しいの？　肩がそう言ってる｜仕事は忙しいのか？　肩がそう言っている｜お仕事、お忙しいんですか？　肩がそう言っていますよ」施術中の世間話に、{a}は少しずつ肩の力を抜いた。|{a}が「上手だね｜上手だな｜お上手ですね」と言うと、{m}は「よく言われる｜よく言われる｜よく言われます」と、照れもせずに笑った。手は一度も止まらなかった。|{m}「眠くなったら、寝ちゃっていいからね｜眠くなったら、寝てしまっていい｜眠くなったら、お休みになってくださいね」{a}は返事の代わりに、長い息を吐いた。'),
end:L('{a}は店を出てから、肩をぐるりと回した。嘘みたいに軽かった。|{a}は次の予約を入れて帰った。指名の欄には、迷わず{m}の名前を書いた。|{a}はその夜、久しぶりに朝まで一度も目を覚まさずに眠った。|帰り道、{a}は噂の店がただの腕のいい店だったことに、少しだけ拍子抜けした。')
};
C.CUR_INTRO=L('{a}と{b}は、二人一緒に予約を入れていた。案内されたのは、薄いカーテン一枚で仕切られた二つの施術台だった。|「ペアコースでご予約のお二人ですね」――受付の声に、{a}と{b}は顔を見合わせた。施術室は一つで、真ん中をカーテンが仕切っているだけだった。|{b}が見つけてきたのは、ペア割のある評判の店だった。「せっかくだから一緒に｜せっかくだから一緒に来い｜せっかくですから一緒にどうですか」と誘われて、{a}も隣の施術台に横になった。間のカーテンは、思っていたよりずっと薄かった。');
C.CUR_HEAR={
chat:L('カーテン越しに、{b}の声がした。「そっち、どう？｜そっちはどうだ？｜そちらはどうですか？」「……普通に、気持ちいい｜＝｜……普通に、気持ちいいです」――{a}はそう答えて、また枕に顔を戻した。|カーテンの向こうから、{b}が施術者と世間話をしている声が聞こえてきた。いつもの{b}の、のんきな声だった。|{a}はカーテンの隙間から、隣の施術台の足元だけを見た。{b}のつま先が、気持ちよさそうに揺れていた。'),
notice:L('カーテンの向こうで、{b}の声が急に尖った。「……ちょっと待って。今の、何？｜……ちょっと待て。今のは、何だ｜……ちょっと待ってください。今の、何ですか」――{a}は思わず、息を止めて耳を澄ませた。|隣の施術台がきしんで、{b}が身を起こす気配がした。施術者の言い訳する声が、カーテン越しにぼそぼそと聞こえた。'),
left:L('カーテンの向こうで、{b}が施術台を降りる音がした。「……先に出てる｜……先に出ている｜……先に出ていますね」――短い言葉だけを残して、足音が遠ざかっていった。|{b}の「帰る｜＝｜帰ります」という声がして、隣のブースが急に静かになった。{a}の側の施術は、何事もなかったように続いた。'),
hot:L('カーテンの向こうから、{b}の押し殺した声が漏れてきた。聞いてはいけないものを聞いた気がして、{a}は枕に顔を押しつけた。|隣の施術台が、規則正しくきしみ始めた。カーテン一枚向こうで何が起きているのか、{a}は考えないようにするのが精一杯だった。|{b}の声が、途中から聞いたことのない高さに変わった。{a}は思わず、カーテンのほうを振り向きかけた。'),
reverse:L('カーテンの向こうで、何かが倒れる音がした。続いて聞こえたのは、施術者の慌てた声と、楽しげな{b}の声だった。|隣の施術台が大きくきしんだ。「交代｜交代だ｜交代です」という{b}の声と、施術者の情けない声が、カーテン越しに聞こえた。'),
sleep:L('カーテンの向こうから、{b}の穏やかな寝息が聞こえてきた。|隣が急に静かになった。耳を澄ませると、{b}の規則正しい寝息だけが聞こえた。')
};
C.CUR_NEIGHBOR=L('カーテンの向こう、{b}の施術台のほうから、押し殺した声が聞こえてきた。|カーテン一枚向こうで、{b}の施術台がきしむ音と、乱れた息遣いが聞こえた。');
C.CUR_REACT={
proud:L('{a}は「……うるさい店だ」と小さく吐き捨てた。|{a}は聞こえないふりをして、眉間に皺を寄せた。'),
stern:L('{a}は聞かなかったことにした。聞かなかったことにするには、相当な集中が必要だった。|{a}は目を閉じて、自分の呼吸だけを数え直した。'),
tsun:L('{a}「な、何やってんのよ、あっちは……」――自分の頬が熱いのには、気づかないふりをした。|{a}は「べ、別に気にしてないし」と、誰に向けるでもなく呟いた。'),
gentle:L('{a}は「あらあら」と小さく笑った。笑いながら、少しだけ心配になった。|{a}はカーテンのほうに「大丈夫？」と声をかけようとして、やめた。'),
devoted:L('{a}は「{b}、大丈夫かな……」と、自分のことより先に心配した。|{a}はカーテンの向こうが気になって、施術に集中できなかった。'),
cool:L('{a}は隣の音から、向こうの施術がどこまで進んだのかを推測した。推測して、少し後悔した。|{a}は「隣も同じ手順か」と、冷静に分析しようとした。'),
free:L('{a}は思わず吹き出しかけた。「ちょっと、隣、すごいことになってない？」|{a}はカーテンに向かって「おーい」と小声で呼びかけた。返事はなかった。'),
shy:L('{a}は耳まで真っ赤になって、タオルを頭までかぶった。|{a}は聞こえてくる音に、身を縮めた。自分の声も、向こうに聞こえているのかもしれなかった。'),
polite:L('{a}は「……失礼いたしました」と、なぜか自分が謝ってしまった。|{a}は聞いてはいけないものを聞いた気がして、そっと両手で耳を塞いだ。')
};
C.CUR_END={
both:L('その日から、{a}と{b}のペア予約は毎週の決まりごとになった。帰り道、二人は一度も今日の話をしなかった。|店を出た{a}と{b}は、駅まで一言も喋らなかった。改札の前で、どちらからともなく「また来る？｜また来るか？｜また来ますか？」と訊いた。'),
one:L('店の前で待っていた{a}は、遅れて出てきた{b}の顔を見て、何も訊かなかった。訊かなくても、カーテン越しに大体は聞こえていた。|{a}は帰り道、隣を歩く{b}の顔を何度も盗み見た。{b}は、ずっと前だけを見ていた。'),
none:L('帰り道、{a}と{b}は「普通にいい店だったね｜普通にいい店だったな｜普通にいい店でしたね」と言い合った。どちらも、カーテンの向こうのことには触れなかった。|{a}と{b}は、駅前の喫茶店で反省会を開いた。話は、最後まで噛み合わなかった。')
};
C.resident=function(input,i){
var c=input.chars[i],pc=(input.perChar&&input.perChar[i])||{};
var p={i:i,name:c.name,eg:c.eg,tr:HK.traits(c.eg),gender:c.gender||'',likes:c.likes||'',tone:c.tone||'',fp:c.fp||'',pos:c.pos||'',posLike:c.posLike||'',futa: !!c.futa,memo:c.memo||'',
ng:Array.isArray(c.loveNG)?c.loveNG.filter(function(x){return x>=0;}):[],lock:HK.lockFirst(c.loveLock),locks:HK.parseLocks(c.loveLock),
sexLock:HK.sexLockOf(c.sexLock),pick:pc.pick||{},rawNoR18: !!c.noR18};
if(HK.charFlags)HK.charFlags(c,p,'massage');
p.persona=HK.personaOf(p);
(input.ties||[]).forEach(function(t){if(t&& /^(lover|mate|fated)$/.test(t.type)&&(t.a===i||t.b===i))(p.loveSet=p.loveSet||[]).push(t.a===i?t.b:t.a);});
return p;
};
C.pairWhy=function(T,Cc){
var P=HK.Pos,ST=HK.State;
if(HK.SAFE_ON|| !P|| !ST)return'全年齢';
if(T.rawNoR18||Cc.rawNoR18|| !ST.r18ok(T)|| !ST.r18ok(Cc))return'R18に参加しない人がいる';
if((HK.ngPair&&HK.ngPair(T,Cc))||(HK.sexBlocked&&HK.sexBlocked(T,Cc)))return'恋愛・R18にしない組';
if(!P.genderOK(T,Cc))return'恋愛対象が合わない';
if(!P.okSex(T,Cc))return'受け攻めの指定が合わない';
return'';
};
C.cast=function(input){
var n=Math.min(2,(input.chars||[]).length);
if(n<2|| !HK.Roles)return{mode:'mob',ci:[0]};
var P=[C.resident(input,0),C.resident(input,1)];
if(HK.kinNG)HK.kinNG(P,input.ties);
if(HK.fearNG)HK.fearNG(P,input.ties);
var S0={P:P,env:input.env||{},rng:HK.rng((((input.seed||1)*131)+7)>>>0),scen:HK.SCENARIOS.massage};
var r=HK.Roles.resolve(S0,'therapist',input);
if(r.kind==='res'&&r.who&&r.who[0]){
var t=r.who[0],cl=P[0]===t?P[1]:P[0];
return{mode:'res',ti:t.i,ci:[cl.i],P:P,T:t,CR:cl,picked:(P.filter(function(x){return(x.pick||{}).therapist==='yes';}).length>0)};
}
return{mode:'curtain',ci:[0,1],P:P};
};
function fmt(t,v){return String(t).replace(/\{([a-z0-9]+)\}/g,function(m,k){return v[k]!=null?v[k]:m;});}
function blocks(log){
var pre=[],out=[],cur=null;
log.forEach(function(e){
if(e.kind==='step'){cur={label:e.text,room:e.room,step:e,items:[]};out.push(cur);return;}
(cur?cur.items:pre).push(e);
});
return{pre:pre,list:out};
}
function eventOf(items){
var has=function(re){return items.some(function(e){return re.test(e.tag||'');});};
if(has(/^(?:立場逆転|逆転)$/))return'reverse';
if(has(/^退店$/))return'left';
if(has(/^(?:陥落|おねだり|延長|暗転)$/)||items.some(function(e){return e.kind==='climax';}))return'hot';
if(has(/^気づき$|（拒否/))return'notice';
if(has(/^寝落ち$/))return'sleep';
return'';
}
var RANK={ok:0,mid:1,over:2};
C.merge=function(input,A,B,rng){
var hA=A.hero,hB=B.hero,nA=hA.name,nB=hB.name;
var used=[];
var pick=function(a){var f=a.filter(function(x){return used.indexOf(x)<0;});var x=(f.length?f:a)[rng.int((f.length?f:a).length)];used.push(x);return x;};
var log=[];
var push=function(e){log.push(e);return e;};
var bA=blocks(A.log),bB=blocks(B.log);
var whyA=(bA.pre[0]&&bA.pre[0].why)||'',whyB=(bB.pre[0]&&bB.pre[0].why)||'';
var intro=push({kind:'sys',tag:'来店',text:fmt(pick(C.CUR_INTRO),{a:nA,b:nB})+' '+nA+'の担当は'+A.staffName+'、'+nB+'の担当は'+B.staffName+'だった。',why:nA+'…'+whyA+'／'+nB+'…'+whyB,actors:[hA.i,hB.i],room:0,floor:0});
intro.v=(bA.pre[0]&&bA.pre[0].v)||{r:0,p:0,c:0};
bA.pre.slice(1).forEach(function(e){e.actors=[hA.i];push(e);});
bB.pre.slice(1).forEach(function(e){e.actors=[hB.i];push(e);});
var keys=[],byKey={};
[[bA,'a'],[bB,'b']].forEach(function(x){
x[0].list.forEach(function(b){
if(!byKey[b.label]){byKey[b.label]={label:b.label,room:b.room,step:b.step,a:null,b:null};keys.push(b.label);}
byKey[b.label][x[1]]=b;
});
});
keys.sort(function(p,q){var x=byKey[p],y=byKey[q];return x.room-y.room||(x.label==='施術のあと'?1:0)-(y.label==='施術のあと'?1:0);});
var heard=0,chatDone=false,goneA=false,goneB=false;
function hear(listener,other,ev,room){
if(!ev||heard>=4)return;
var t=fmt(pick(C.CUR_HEAR[ev]),{a:listener.name,b:other.name});
if(/^(?:hot|notice|reverse)$/.test(ev)&&C.CUR_REACT[listener.persona]&&rng()<0.75)t+=fmt(pick(C.CUR_REACT[listener.persona]),{a:listener.name,b:other.name});
push({kind:'ev',tag:'カーテン越し',text:t,why:'カーテンの向こうの'+other.name+'の様子が聞こえた',actors:[listener.i],room:room,floor:0,v:{r:0,p:0,c:0}});
heard++;
}
keys.forEach(function(k,j){
var x=byKey[k];
push(x.step);
if(x.a)x.a.items.forEach(function(e){e.actors=[hA.i];push(e);});
if(x.b)x.b.items.forEach(function(e){e.actors=[hB.i];push(e);});
var evA=x.a?eventOf(x.a.items):'',evB=x.b?eventOf(x.b.items):'';
var canA=evA&&x.b&& !goneB,canB=evB&&x.a&& !goneA;
if(canA&&canB){if(rng()<0.5)canA=false;else canB=false;}
if(canA)hear(hB,hA,evA,x.room);
if(canB)hear(hA,hB,evB,x.room);
if(!chatDone&&j===2&&x.a&&x.b&& !evA&& !evB){chatDone=true;var Lh=rng()<0.5?hA:hB;hear(Lh,Lh===hA?hB:hA,'chat',x.room);}
if(evA==='left')goneA=true;
if(evB==='left')goneB=true;
});
log.forEach(function(e,n){e.n=n;});
var turns=[];
[[A,nA],[B,nB]].forEach(function(x){(x[0].turns||[]).forEach(function(t){var e=x[0].log[t.n],n=log.indexOf(e);if(n>=0)turns.push({n:n,why:x[1]+'：'+t.why});});});
turns.sort(function(p,q){return p.n-q.n;});
var hist=[],len=Math.max(A.hist.length,B.hist.length);
for(var k=0;k<len;k++){
var a=A.hist[Math.min(k,A.hist.length-1)],b=B.hist[Math.min(k,B.hist.length-1)];
hist.push({n:k,f:0,r:a.r,p:a.p,c:a.c,hs:[{r:a.r,p:a.p,c:a.c},{r:b.r,p:b.p,c:b.c}]});
}
var EA=A.ending,EB=B.ending,hot=function(E){return E.kind==='over';};
var kind=RANK[EA.kind]>=RANK[EB.kind]?EA.kind:EB.kind;
var endK=hot(EA)&&hot(EB)?'both':hot(EA)||hot(EB)?'one':'none';
var ev=endK==='one'?(hot(EA)?{a:nB,b:nA}:{a:nA,b:nB}):{a:nA,b:nB};
var lines=[fmt(pick(C.CUR_END[endK]),ev)].concat(EA.lines,EB.lines);
var short=function(t){return String(t).split(' ― ')[0];};
hA.fate=short(EA.title);hB.fate=short(EB.title);
hA.fallTitle='';hB.fallTitle='';
var E={type:kind,kind:kind,title:'カーテン越し ― '+nA+'：'+short(EA.title)+'／'+nB+'：'+short(EB.title),lines:lines};
var st=function(R,key){var f=(R.estats||[]).filter(function(s){return s[0]===key;})[0];return f?f[1]:'';};
var estats=[[nA,short(EA.title)],[nB,short(EB.title)]];
['気づいた','騙された',(HK.SoloKit&&HK.SoloKit.W_CL)||'高鳴り'].forEach(function(key){estats.push([key,nA+' '+st(A,key)+'・'+nB+' '+st(B,key)]);});
var res={};
for(var p in A)res[p]=A[p];
res.log=log;res.hist=hist;res.turns=turns;res.ending=E;res.outcome=E.title;
res.hero=hA;res.heroes=[hA,hB];res.party=true;res.estats=estats;
res.advice=A.advice.map(function(s){return nA+'：'+s;}).concat(B.advice.map(function(s){return nB+'：'+s;}));
res.meta='カーテン越し・'+A.meta+'／'+B.staffName;
res.summary=nA+'・'+nB+'：'+E.title;
res.stepCount=hist.length-1;
res.chars=[{name:nA,i:hA.i},{name:nB,i:hB.i}];
return res;
};
})();
});
;
/* ==== js/solo-massage.js ==== */
HK.Load.def(117,'js/solo-massage.js',function(){
(function(){
'use strict';
var HK=window.HK,K=HK.SoloKit,DG=HK.DG;
var clamp=HK.clamp;
function L(s){return s.split('|');}
var STAFF={
gentle:{n:'店長',g:'m',desc:'物腰の柔らかい紳士。言い訳がとにかく丁寧',dec:0.15},
chara:{n:'若いスタッフ',g:'m',desc:'軽い口調でぐいぐい来る。ボロも出やすい',dec: -0.1},
silent:{n:'無口な職人',g:'m',desc:'ほとんど喋らない。言い訳もしないので逆に怪しまれにくい',dec:0.05},
lady:{n:'女性セラピスト',g:'f',desc:'囁くような声で安心させてくる',dec:0.2},
duo:{n:'二人のスタッフ',g:'m',desc:'二人がかり。手が四本あると気づくのが遅れる',dec:0.1}
};
var STAGES=[
['問診','受付と問診','all',4,0],
['肩','うつ伏せで肩と首','neck',10,0],
['背中','背中','back',12,1],
['腰','腰','hips',14,1],
['脚','太腿と脚の付け根','thigh',18,2],
['臀部','お尻まわり','hips',20,2],
['胸元','仰向けでデコルテ','chest',22,3],
['下腹','下腹','belly',24,3],
['特別','「特別な施術」','all',28,4],
['仕上げ','仕上げ','all',30,5]
];
var ACT={
'問診':L('{m}は問診票をめくった。「最近、疲れが溜まる場所は？」「…眠りは浅いほうですか」「では、最後に、最近いつ…いえ、何でもありません」|問診票の最後の欄には「敏感な部位（複数回答可）」と書かれていた。{a}は首をかしげながら「特になし」に丸をつけた。|{m}は{a}の手首を取って脈を測った。「緊張していますね。大丈夫、すぐにほぐれますよ」'),
'肩':L('{m}の指が{a}の肩甲骨の縁に沈んだ。「かなり凝ってますね」――ここまでは、普通のマッサージだった。|首筋をなぞる指が、思いのほか優しかった。{a}は思わず深い息を吐いた。|{m}は温めたタオルを{a}の首に当て、耳の後ろのつぼをゆっくり押した。'),
'背中':L('{m}「服、少し失礼しますね」背中の留め具が外された。「オイルが付くといけないので」|背骨に沿って、温かいオイルが一筋垂らされた。{m}の手のひらが、それを脇腹まで塗り広げた。|{m}の指が背中を下から上へ、何度も往復した。往復するたびに、脇腹に触れる範囲が少しずつ広がっていく。'),
'腰':L('{m}「腰、だいぶ張ってますね」と言いながら、親指がタオルの縁の下へ潜り込んだ。|{m}は{a}の腰に体重をかけ、ゆっくりと円を描いた。手のひらの位置が、少しずつ下がっていく。|腰骨の内側を押されて、{a}の体がびくりと跳ねた。{m}「ここ、効きますよね」'),
'脚':L('{m}「脚のむくみ、かなり溜まってますね」足首から膝の裏へ、手のひらがゆっくり滑っていった。思っていたより、上のほうまで。|{m}の手が、足首から膝の上まで何度も往復した。往復するたびに、手の止まる位置が少しずつ上がっていく。|{m}「この辺りのリンパ、しっかり流しておきますね」――{a}はそれが医学用語なのか、言い訳なのか判断がつかなかった。'),
'臀部':L('{m}「骨盤まわりが凝り固まってます。座り仕事、多いでしょう」腰の下のほうを、手のひらが大きく押し回した。|{m}「ここは骨盤の歪みに直結するので」――そう言われると、拒む理由が見つからなかった。|オイルを足した{m}の手が、腰骨の下をゆっくりなぞった。タオルが少しずつずれていくのを、{a}は気にしないふりをした。'),
'胸元':L('{m}「では仰向けに。首まわりのリンパを流します」鎖骨をなぞった指が、そこで止まらずに少しだけ下へ滑った。|{m}「呼吸が浅いですね。胸まわりの筋肉も、呼吸に関わるので」――タオル越しに置かれた手のひらが、やけに温かかった。|{m}は{a}の鎖骨の下に親指を当て、ゆっくりと円を描いた。「ここ、かなり張ってますね」――{a}は天井の一点を見つめた。'),
'下腹':L('{m}「下腹は冷えが溜まりやすいんです」温かい手のひらが、へその下でゆっくりと円を描いた。|{m}「ここをほぐすと、全身の巡りがよくなります」――{m}の手は、タオルの縁ぎりぎりのところで止まっていた。|おなかの上で、{m}の手がゆっくり往復した。{a}は、自分の鼓動がやけに大きく聞こえる気がした。'),
'特別':L('{m}は声を落とした。「ここからは、特別な施術になります。……力を抜いてください」――照明が、ふっと一段暗くなった。|{m}はタオルを畳み直して、静かに言った。「目を閉じていてくださいね」――{a}は、言われた通りにした。'),
'仕上げ':L('{m}「仕上げです」――そこから先、{m}の手がどこにあったのか、{a}はよく覚えていない。|{m}は{a}の耳元で囁いた。「最後まで、全部ほぐしておきますね」――{a}は、頷くことしかできなかった。')
};
var NOTICE={
proud:L('{a}は跳ね起きた。「…おい。これ、マッサージじゃないだろ」|{a}は{m}の手首を掴んだ。「どこ触ってる」|{a}は身を起こし、タオルを肩に引っかけた。「説明しろ。今の手は、どこのリンパだ」'),
stern:L('{a}は静かに目を開けた。「施術内容について、説明を求めます」|{a}は体を起こしてタオルを掴み直した。「これは、明らかに範囲を超えていますね」|{a}は静かに手を上げ、施術を止めさせた。「一度、確認させてください。今のは何の手技ですか」'),
tsun:L('{a}「ちょ、ちょっと！今のわざとでしょ！」顔が真っ赤だった。|{a}「べ、別に気持ちよくなんかないけど！今のは絶対おかしい！」|{a}「ねえ！　今の、絶対わざとだよね！？」――耳まで真っ赤だった。'),
gentle:L('{a}は少し困った顔で、首をかしげた。「あの…これって、本当にマッサージですか？」|{a}「ええと…ごめんなさい、ちょっと確認なんですけど…今のは？」|{a}は首をかしげて、{m}を見上げた。「ねえ、今のって……マッサージの続き、なのよね？」'),
devoted:L('{a}は唇を噛んで、それでも勇気を出して言った。「あの…今の、普通じゃない…ですよね…？」|{a}は震える声で訊いた。「これも…施術の、一部なんですか…？」|{a}は勇気を振り絞るように、小さく手を挙げた。「あ、あの……質問しても、いいですか……？」'),
cool:L('{a}は天井を見たまま言った。「リンパ節の位置、そこじゃないですよね」|{a}「この三分間、筋肉に関係のない部位しか触っていませんね」|{a}は目を開けて、淡々と言った。「今の手の位置、施術の説明と合っていませんね」'),
free:L('{a}「えっ、待って待って、今のマッサージ？絶対違うよね！？」|{a}は吹き出した。「いやいやいや、さすがに無理あるでしょ、それ」|{a}は顔だけ振り返った。「ちょっとちょっと、今のどこ触ったの？　さすがにバレるって」'),
shy:L('{a}はタオルの端をぎゅっと握った。「あ、あの…そこは…」声が消え入りそうだった。|{a}は真っ赤になって固まった。「こ、これって…ふ、普通なんですか…？」|{a}は体を縮めて、震える声で言った。「い、今の……ま、間違い、ですよね……？」')
};
NOTICE.polite=L('{a}は体を起こし、丁寧に尋ねた。「恐れ入りますが、ただいまの施術について、ご説明いただけますか」|{a}「あの……大変申し上げにくいのですが、そちらは施術の範囲外ではないでしょうか」|{a}は姿勢を正して、丁寧に一礼した。「念のため伺います。ただいまの施術は、コースに含まれておりますか」');
var EXCUSE=L('{m}「よくあるご質問です。ここのリンパは、全身の巡りの要なんですよ」|{m}「皆さん最初は驚かれるんです。でも、効果は保証しますから」|{m}「血行が良くなると、どうしてもそういう感覚になるんです。体が正常に反応している証拠ですよ」|{m}「くすぐったく感じるのは、凝りがほぐれ始めたサインです」|{m}「当店独自のメソッドでして。お客様の体は、ちゃんと応えていますよ」');
var DECEIVED={
proud:L('{a}は「…そういうもんか」と不機嫌そうに横になり直した。|{a}は鼻を鳴らした。「次に変なことしたら、本当に帰るからな」――そう言いながら、また枕に顔を戻した。|{a}は「……ちっ。紛らわしい手つきしやがって」と吐き捨てて、うつ伏せに戻った。'),
stern:L('{a}は少し考えてから「専門家がそう言うなら」と姿勢を戻した。|{a}は「……承知しました。続けてください」と短く答え、もう一度目を閉じた。|{a}は説明を頭の中で反芻し、矛盾がないことを確かめてから、黙って横になった。'),
tsun:L('{a}「…ほ、本当でしょうね？」そう言いながら、{a}は大人しく横になった。|{a}「べ、別に疑ってたわけじゃないし！」――言い訳しながら、{a}はタオルを引き上げて横になった。|{a}「……ふ、ふーん。なら、いいけど」{a}はぷいと顔を背けて、また施術台に伏せた。'),
gentle:L('{a}は「まあ、そうなんですね。失礼しました」と微笑んで、また目を閉じた。|{a}は「あら、ごめんなさいね。早とちりしちゃった」と頬に手を当て、ふたたび力を抜いた。|{a}は「プロの方が言うなら、そうなのね」とうなずいて、穏やかに横になり直した。'),
devoted:L('{a}は「ご、ごめんなさい、疑って…」と謝って、体の力を抜いた。|{a}は「そ、そうですよね、わたしが変に考えすぎで……」と真っ赤になって、また横になった。|{a}は何度も頭を下げた。「失礼なこと言って、本当にすみません。続けてください」'),
cool:L('{a}は「…理屈は通っていますね」と呟いて、横になり直した。|{a}は「……一応、筋は通っています」とだけ言って、また天井に目を戻した。|{a}は「反証する材料がありませんね」と淡々と言い、姿勢を戻した。'),
free:L('{a}は「へえー、そうなんだ！」とあっさり納得した。|{a}は「なーんだ、びっくりした！」と笑って、ごろんと横になり直した。|{a}は「マッサージって奥が深いんだねー」と感心して、また目を閉じた。'),
shy:L('{a}は「す、すみません…私が変なのかも…」と縮こまって、また横になった。|{a}は「そ、そういうもの、なんですね……」と消え入りそうな声で言って、枕に顔を埋めた。|{a}は耳まで赤くして、こくこくと頷いた。それ以上、何も訊けなかった。')
};
DECEIVED.polite=L('{a}は「そうでしたか。不勉強で失礼いたしました」と頭を下げ、また横になった。|{a}は「大変失礼いたしました。どうぞ、お続けください」と、丁寧に詫びて目を閉じた。|{a}は「ご説明、ありがとうございます」と律儀に礼を言ってから、姿勢を戻した。');
var LEAVE=L('{a}は施術台から降りて、黙って服を着た。「お代は、払わない｜＝｜お代は、払いません」|{a}は「帰る｜＝｜帰ります」とだけ言い、タオルを巻いたまま更衣室へ向かった。|{a}は会計で口コミサイトの名前を口にした。店長の顔色が変わった。');
var STAY=L('{a}は少し黙ってから、また横になった。「…続けて。ただし、余計なことはしないで｜…続けろ。ただし、余計なことはするな｜…続けてください。ただし、余計なことはしないでください」|{a}は分かっていて、目を閉じた。「…今日だけ、だから｜…今日だけだ｜…今日だけ、ですから」|{a}は{m}の顔を見上げて、何も言わなかった。それが答えだった。');
var SECRET=L('{a}は気づかないふりをした。耳だけが真っ赤だった。|{a}は何か言いかけて、やめた。恥ずかしくて、言葉にできなかった。|{a}は枕に顔を埋めて、声を殺した。');
function posSlots(k){var a=[];for(var i=0;i<k;i++)a.push({n:'姿勢'+(i+1),t:''});return a;}
var POS=posSlots(8),POS_TOP=posSlots(6),POS_TOP_F=posSlots(5),POS_TOP_FF=posSlots(5),POS_FF=posSlots(9);
var OFF= /迷宮|魔物|装備|武器|罠|先へ進|次の部屋|床を転げ|壁を殴|壁に背|壁に打ち|壁の方/;
function freshPick(S,arr){
if(!arr|| !arr.length)return'';
var a=arr.filter(function(x){return typeof x!=='string'|| !OFF.test(x);});
if(!a.length)a=arr;
var u=S._fu||(S._fu=[]),free=a.filter(function(x){return u.indexOf(x)<0;}),t;
if(free.length)t=free[S.rng.int(free.length)];
else{var bi=Infinity;a.forEach(function(x){var j=u.indexOf(x);if(j<bi){bi=j;t=x;}});}
var k=u.indexOf(t);if(k>=0)u.splice(k,1);
u.push(t);
return t;
}
var CLX=null,CLX_SRC=null;
function climaxTable(){
var DG=HK.DG,MC=HK.MassageMore&&HK.MassageMore.CLIMAX;
if(!DG|| !DG.CLIMAX|| !MC)return null;
if(CLX&&CLX_SRC===DG.CLIMAX)return CLX;
var X={};
Object.keys(DG.CLIMAX).forEach(function(p){
X[p]=DG.CLIMAX[p].map(function(l,i){var add=MC[p]&&MC[p][i];return add&&add.length?l.concat(add):l;});
});
CLX_SRC=DG.CLIMAX;
return(CLX=X);
}
function withFresh(f){
var kp=K.pick,DG=HK.DG,dc=DG&&DG.CLIMAX,cx=climaxTable();
K.pick=freshPick;if(cx)DG.CLIMAX=cx;
try{return f();}finally{K.pick=kp;if(cx)DG.CLIMAX=dc;}
}
HK.SCENARIOS.massage={
id:'massage',name:'これって本当にマッサージですか？',kicker:'1〜2人・R18',solo:true,maxCast:2,minCast:1,
desc:'評判のマッサージ店。施術は少しずつ際どくなる。いつ気づくか、言い訳に騙されるか、快楽に負けるか。※成人キャラクター向け',
castHint:'1〜2人。1人のときは、施術者は店のスタッフ（モブ）です。2人のときは「施術者」の設定で、住人の一人が施術者になる（もう一人が客）か、二人とも客になってカーテン越しの隣の施術台で受けるかが決まります（おまかせはモブ＝カーテン越し）。住人どうしの施術は、体の関係になれる組だけ際どくなり、なれない組は普通のマッサージのままです。',
unit:'施術',simulate:function(input){return withFresh(function(){return play(input);});},
derived:['caution','cold','honesty','impulse'],
env:[
{id:'course',label:'コース',type:'select',def:'oil',options:[{v:'normal',label:'整体（60分）'},{v:'oil',label:'アロマオイル（90分）'},{v:'lymph',label:'全身リンパ（120分）'},{v:'special',label:'「特別コース」（90分）'}]},
{id:'staff',label:'店のスタッフ（モブの施術者）',type:'select',def:'gentle',options:Object.keys(STAFF).map(function(k){return{v:k,label:STAFF[k].n+'（'+STAFF[k].desc+'）'};})},
{id:'shady',label:'店の怪しさ',min:0,max:100,def:60,lo:'健全そう',hi:'看板からして怪しい',desc:'高いほど施術が早く際どくなり、気づかれやすくもなる'},
{id:'harsh',label:'施術の過激さ',min:0,max:100,def:55,lo:'ぎりぎり整体',hi:'隠す気がない'}
,{id:'desc',label:'行為の描写',type:'select',def:'full',options:[{v:'full',label:'描写する'},{v:'dark',label:'軽め（暗転して回数だけ）'}],desc:'軽めにすると、快楽に負けたあとの行為は暗転し、体位の数と回数だけが分かる'}
],
stats:[
{id:'sense',label:'感じやすさ',desc:'高いほど快感が溜まりやすい'},
{id:'exp',label:'経験',desc:'高いほど「普通じゃない」に気づきやすく、快楽にも慣れている'}
],
actions:[
{id:'relax',label:'全部お任せでリラックス',fit:function(t){return t.ac*0.5+t.warmth*0.3;}},
{id:'chat',label:'施術者と世間話をする',fit:function(t){return t.warmth*0.6+t.fc*0.3;}},
{id:'watch',label:'施術の手順を観察する',fit:function(t){return t.a*0.6+t.caution*0.4;}},
{id:'endure',label:'声を出さずに耐える',fit:function(t){return t.cp*0.5+t.ac*0.3;}},
{id:'enjoy',label:'気持ちよさに身を委ねる',fit:function(t){return t.fc*0.6+t.impulse*0.3;}}
],
goals:[
{id:'heal',label:'肩こりを治したい',fit:function(t){return t.a*0.4+t.ac*0.3;}},
{id:'free',label:'タダ券があったから来た',fit:function(t){return t.fc*0.5+t.cold*0.3;}},
{id:'suspect',label:'噂の店を確かめに来た',fit:function(t){return t.cp*0.5+t.a*0.4;}},
{id:'polite',label:'失礼のないようにする',fit:function(t){return t.ac*0.7+t.np*0.2;}},
{id:'secret',label:'本当は少し期待している',fit:function(t){return t.fc*0.5+t.honesty*0.2+t.ac*0.2;}}
],
steps:function(){return[];}
};
if(HK.Roles)HK.Roles.install(HK.SCENARIOS.massage,'therapist','施術者',{
auto:'mob',yes:'施術者になる',envBefore:'staff',
fit:function(c){var t=c.tr||{};return 0.3+(t.cp||0)*0.3+(t.fc||0)*0.3+(t.aggr||0)*0.3;},
desc:'施術者を住人がやるか、店のスタッフ（モブ）がやるかを選びます。住人が施術者なら、もう一人の住人が客になります。モブなら、2人とも客になってカーテン越しの隣の施術台で受けます。住人の欄で「施術者になる」を選んだ人が優先されます（住人が1人のときは、いつもモブ）'
});
function play(input){
var MC=HK.MassageCast,c=MC?MC.cast(input):{mode:'mob'};
if(c.mode==='res')return run(input,{ci:c.ci[0],T:c.T,CR:c.CR,picked:c.picked});
if(c.mode==='curtain'){
var st0=(input.env&&input.env.staff)||'gentle',rng=HK.rng((((input.seed||1)*977)+3)>>>0);
var ks=Object.keys(STAFF).filter(function(k){return k!=='duo'&&k!==st0;});
var share={};
var a=run(input,{ci:0,other:input.chars[1].name,share:share});
var b=run(input,{ci:1,seedAdd:7919,staff:ks[rng.int(ks.length)],other:input.chars[0].name,share:share});
return MC.merge(input,a,b,rng);
}
return run(input);
}
function run(input,o){
o=o||{};
var S=K.state(input,'massage');
if(o.ci||o.seedAdd){
if(o.seedAdd)S.rng=HK.rng((((input.seed||1)+o.seedAdd)>>>0)||1);
S.h=K.hero(S,input.chars[o.ci||0],(input.perChar&&input.perChar[o.ci||0])||{});S.party=[S.h];
}
if(o.share){S._fu=o.share.fu=o.share.fu||[];S._lwShare=o.share.lw=o.share.lw||[];}
var h=S.h,rng=S.rng,env=S.env;
h.i=o.ci||0;
var MC=HK.MassageCast,TR=o.T||null,CR=o.CR||null;
var sk=TR?MC.STAFF_OF[TR.persona]||'gentle':STAFF[o.staff]?o.staff:env.staff;
if(TR&&sk==='gentle'&&HK.Pos&&HK.Pos.isF(TR))sk='lady';
if(!STAFF[sk])sk='gentle';
var staff=TR?{n:TR.name,g:HK.Pos?(HK.Pos.isF(TR)?'f':'m'):TR.gender==='f'?'f':'m',desc:'',dec:STAFF[sk].dec,res:true}:STAFF[sk];
S.vars={m:staff.n,you:TR|| !HK.Mob?'あなた':HK.Mob.addr(staff.n,'さん')};
var pairWhy=TR?MC.pairWhy(TR,CR):'',pairOK= !!TR&& !pairWhy;
var mobNG= !TR&& !HK.SAFE_ON&& !!h.noMob;
var mobNgW=['','',''];
var tTop= !pairOK||HK.Pos.order(TR,CR,[TR,CR])[0]===TR,plain=(!!TR&& !pairOK)||mobNG;
var hardTop=TR?pairOK&& !tTop: !!(HK.Pos&&HK.Pos.hardTopNpc(h));
function cTop(){return TR? !tTop: !!(HK.Pos&&HK.Pos.vsNpc(h,'')==='top');}
var noP=function(c){return HK.Pos&&HK.Pos.genSet&&HK.Pos.genSet(c)? !HK.Pos.hasM(c):c.gender==='f';};
var ff=noP(h)&&staff.g==='f';
h.futa= !!(input.chars[h.i]&&input.chars[h.i].futa);
var custF=HK.Pos?HK.Pos.isF(h):h.gender==='f',ffTop=ff&&custF;
h.sens=0.85+(h.stats.sense-3)*0.1;
var course=env.course;
var seq=STAGES.slice();
if(course==='normal')seq=[STAGES[0],STAGES[1],STAGES[2],STAGES[3],STAGES[4],STAGES[6],STAGES[9]];
if(course==='special')seq=[STAGES[0],STAGES[2],STAGES[4],STAGES[5],STAGES[6],STAGES[7],STAGES[8],STAGES[9]];
if(course==='lymph')seq=STAGES.slice(0,8).concat([STAGES[7],STAGES[8],STAGES[9]]);
S.k=1.25;
var wrong= !TR&&(h.likes==='m'||h.likes==='f')&&staff.g&&h.likes!==staff.g;
var LIKE_L={m:'男性',f:'女性'},wrongWhy=wrong?'恋愛対象は'+LIKE_L[h.likes]+'・施術者は'+(staff.g==='m'?'男性':'女性'):'';
var wrongShown=0;
var sx=h.gender==='f'?'女':h.gender==='m'?'男':staff.g==='f'?'女':'男';
var noSx=h.gender==='x';
function fw(arr){var a2=noSx?arr.filter(function(t){return t.indexOf('{sx}')<0;}):arr;return K.fmt(S,K.pick(S,a2.length?a2:arr)).replace(/\{sx\}/g,sx);}
if(wrong)S.k=1.25*0.85;
S.k*=HK.Dark.f(S,'fall');
var sus=0,noticed=false,deceived=0,stayed=false,left=false,fell=false,asked=false;
var LWX=HK.Lewd,lcf=LWX&&LWX.conf('massage');
var dark=lcf?LWX.lv(env)==='low':env.desc==='dark',MD=HK.MassageMore.DARK;
S.dark=dark;
var eroOn= !!(lcf&& !dark&&LWX.ero(env)&&HK.Ero&&HK.MassageThick&&HK.MassageThick.ERO),highOn= !!(lcf&&LWX.high(env));
var ML= !dark&&HK.MassageLewd;
S.lwSeed=input.seed||1;
var kindR=ff?'ff':staff.g==='f'&& !noP(h)?'lady':'recv',kindT=custF?(staff.g==='m'?'topF':'topFF'):'top';
function lwc(dom){return{S:S,h:h,ero:eroOn,dom:dom,fmt:function(t){return K.fmt(S,t);}};}
function lwOn(){return!!(ML&&ML.on(S,env));}
function logC(list){
if(!dark)return K.logClimax(S,list);
if(!list.length)return;
var o=K.say(S,{kind:'climax',tag:K.W_CL,text:K.fmt(S,K.pick(S,MD.climax))+(list.length>1?'（'+list.length+'回）':''),why:h.climax===list.length?'初めての'+K.W_CL:''});
if(!S.flags.firstKey){S.flags.firstKey=true;K.key(S,o,'最初の'+K.W_CL);}
}
var shift=env.shady/100*0.8+(course==='special'?0.8:0);
var M=HK.MassageMore,sleeping=0,slept=false,reversed=false,extended=false,hands=1;
var incAt={};
var envX=Object.assign({},env,{staff:sk});
S.rng.shuffle(M.INCIDENTS.filter(function(x){return(!x.when||x.when(envX,h))&&(!hardTop||M.TOP_INC.indexOf(x.id)>=0)&& !(TR&&x.id==='trainee');})).slice(0,2+rng.int(2)).forEach(function(x){
for(var tries=0;tries<8;tries++){var at=1+rng.int(Math.max(1,seq.length-1));if(!incAt[at]){incAt[at]=x;break;}}
});
function band(l){return l<1.2?0:l<2.8?1:2;}
var ph=0,DG0=HK.DG;
function phUp(bdNow){
var sg=K.stage(h),n=Math.max(ph,bdNow>=1||sg>=2?1:0,sg>=3?2:0,sg>=4?3:0);
if(n<=ph)return'';
ph=n;
var T=M.SHIFT&&(M.SHIFT[h.persona]||M.SHIFT.gentle);
return T&&T[n-1]?' '+K.fmt(S,K.pick(S,T[n-1])):'';
}
function tail(p){
if(rng()>p)return'';
var sg=K.stage(h),TL=DG0.TAILS[h.persona]||DG0.TAILS.gentle;
if(ph===0&&DG0.ENDURE&&DG0.ENDURE[h.persona]&&rng()<0.4)return' '+K.fmt(S,K.pick(S,DG0.ENDURE[h.persona]));
return' '+K.fmt(S,K.pick(S,TL[Math.min(TL.length-1,Math.max(sg,[0,1,3,4][ph]))]));
}
function fx(f){
if(!f)return;
if(f.r)h.reason+=f.r;if(f.s)sus+=f.s;if(f.p)h.pleasure+=f.p*h.sens;if(f.c)h.corrupt+=f.c*S.k;if(f.sens)h.sens+=f.sens;
if(f.extra)extended=true;
}
var introT=TR?K.fmt(S,K.pick(S,MC.RES_INTRO))+' '+K.fmt(S,K.pick(S,MC.RES_GREET[TR.persona]||MC.RES_GREET.gentle))
:K.fmt(S,K.pick(S,['{a}は雑居ビルの三階、「癒しの手」と書かれた扉を押した。受付には{m}が一人。「お待ちしておりました」','{a}はポイントカードを握りしめて、駅裏のマッサージ店に入った。迎えたのは{m}だった。','{a}は口コミサイトで星4.8の店を予約した。レビューの八割が「また来ます」だったのが、少しだけ気になった。']));
var whyP=mobNG?mobNgW[0]:plain?'住人どうしの施術（'+pairWhy+'）：際どい施術にはならず、普通のマッサージのまま':'';
K.say(S,{kind:'sys',tag:'来店',text:introT,why:'目標：'+h.goal.label+'／'+h.action.label+(TR?'／施術者は住人の'+TR.name+(o.picked?'（住人の欄で選んだ）':'（住人から）')+(plain?'。'+whyP:hardTop?'。受け攻めでは客の'+h.name+'が主導する側':''):mobNG?'／'+whyP:'')});
K.snap(S,{s:0});
if(plain)return plainRun();
var LVM= !HK.SAFE_ON&&HK.MassageLove?HK.MassageLove.setup(S,input,h,o,TR):null;
function loveAt(stage){if(LVM)HK.MassageLove.say(S,LVM,stage);}
function plainRun(){
var PM= !TR&&MC.PLAIN_MOB?MC.PLAIN_MOB:null;
MC.PLAIN_SEQ.forEach(function(key,i){
S.step=i;
K.step(S,(i+1)+'. '+MC.PLAIN_LABEL[key]);
K.say(S,{kind:'ev',tag:key,text:K.fmt(S,K.pick(S,PM&&PM.act[key]?PM.act[key]:MC.PLAIN_ACT[key]))+(rng()<0.5?' '+K.fmt(S,K.pick(S,M.REACT[h.persona][0])):''),why:''});
if(key==='脚'&&rng()<0.65){var oa=K.say(S,{kind:'ev',tag:'ぎりぎり',text:K.fmt(S,K.pick(S,PM?PM.almost:MC.PLAIN_ALMOST)),why:whyP});K.key(S,oa,'施術者の手が手前で止まった');}
if(rng()<0.4)K.say(S,{kind:'ev',tag:'施術者',text:K.fmt(S,K.pick(S,rng()<0.6?(PM?PM.talk:MC.PLAIN_TALK):M.STAFF_TALK[sk][0])),why:''});
var AB=M.ACT[h.action.id];
if(AB&&rng()<0.35)K.say(S,{kind:'ev',tag:h.action.label,text:K.fmt(S,K.pick(S,AB.t[0])),why:'方針「'+h.action.label+'」'});
h.reason=clamp(h.reason+1,0,100);
K.snap(S,{s:0});
});
var E={type:'ok',kind:'ok',title:'ただのマッサージだった ― '+staff.n+'の腕は本物',lines:[]};
E.lines.push(K.fmt(S,K.pick(S,PM?PM.end:MC.PLAIN_END)),K.fmt(S,K.pick(S,PM?PM.end:MC.PLAIN_END)));
if(h.goal.id==='heal')E.lines.push(h.name+'の肩こりは、本当にきれいに治っていた。');
if(h.goal.id==='suspect')E.lines.push('噂の店は、少なくとも'+staff.n+'の施術に限っては、まっとうな店だった。');
var plainWhy=mobNG?mobNgW[1]:pairWhy;
return done(K.finish(S,input,E,[mobNG?'モブの施術者で、'+h.name+mobNgW[2]:'住人どうしの施術で、体の関係にならない組（'+pairWhy+'）なので、最後まで普通のマッサージだった。'],{meta:staff.n+(TR?'（住人）':'')+'・'+({normal:'整体',oil:'アロマオイル',lymph:'全身リンパ',special:'特別コース'})[course]+'コース',estats:[['施術者',staff.n],['施術','普通のマッサージ'],['理由',plainWhy]],label3:'施術'}));
}
function done(res){
res.hero.i=h.i;res.staffName=staff.n;
if(TR){
res.heroes=[res.hero,{i:TR.i,name:TR.name,eg:TR.eg,memo:TR.memo,persona:TR.persona,tone:TR.tone,top:HK.egoType(TR.eg).top,action:'（施術者）',goal:'—',stats:{},dev:{},curses:[],items:[],climax:0}];
res.chars=input.chars.slice(0,2).map(function(c,i){return{name:c.name,i:i};});
res.log.forEach(function(e){if(e.kind!=='step')e.actors=[h.i,TR.i];});
}
return res;
}
function posTop(){return noMut(ffTop?POS_TOP_FF:custF&&staff.g==='m'?POS_TOP_F:POS_TOP);}
function noMut(arr){
var P=HK.Pos,MU=P&&P.MUTUAL_RE;
if(!ff|| !MU||(TR?P.bothRiba(TR,CR):P.of&&P.of(h)==='riba'))return arr;
var o=arr.filter(function(x){return!MU.test(x.t)&& !/擦れ合|脚を交差/.test(x.t);});
return o.length?o:arr;
}
function thick(top){
var MT=HK.MassageThick,TV=HK.ThickVM;
if(HK.SAFE_ON|| !MT|| !TV)return null;
if(lcf&&LWX.short(env,rng))return null;
var key=top?(ffTop?'topFF':custF&&staff.g==='m'?'topF':TV.sad(rng,h,null)?'topSad':'top')
:ff?'fallFF':staff.g==='f'&& !noP(h)?'fallLady':'fall';
var sc=MT[key]&&MT[key].length?K.pick(S,noMut(MT[key])):null;
return sc?{n:sc.n,t:TV.voice(rng,sc.t,h,h),thick:true}:null;
}
function doReverse(top){
reversed=true;
var orv=K.say(S,{kind:'sys',tag:'立場逆転',text:K.fmt(S,K.pick(S,top?M.TOP_REVERSE:M.REVERSE)),why:top?(TR?'受け攻め：'+TR.name+'との組では客が主導する側':'攻めの指定：触られる側には回らない')+'／FC・攻撃性 '+Math.round(h.tr.aggr*100)+'・経験 '+h.stats.exp:'強気・攻撃性 '+Math.round(h.tr.aggr*100)+'・経験 '+h.stats.exp});
K.key(S,orv,'施術者を押し倒した');
var rv=dark?[K.pick(S,MD.reverse)]:S.rng.shuffle(M.REVERSE_ACT).slice(0,2);
rv.forEach(function(t2){K.say(S,{kind:'ev',tag:'逆転',lewd:true,text:K.fmt(S,t2),why:''});});
if(!dark&&lwOn())K.say(S,{kind:'ev',tag:'逆転',lewd:true,text:ML.rev(lwc(true),kindT).replace(/^\n\n/,''),why:'主導権は客の側'});
if(top&& !dark){
var tp=thick(true)||K.pick(S,posTop());
K.say(S,{kind:'ev',tag:tp.n,lewd:true,text:K.fmt(S,tp.t),why:'主導権は最後まで客の側'});
}
if(!top){h.pleasure+=30;while(h.pleasure>=100)K.climax(S);}
if(M.SCOUT&&rng()<0.05+h.tr.aggr*0.08+(h.stats.exp-3)*0.03+(h.action.id==='enjoy'?0.06:0)+(top?0.05:0)){
var acc=h.tr.fc*0.4+h.tr.impulse*0.25+h.corrupt/250+(h.goal.id==='secret'||h.goal.id==='free'?0.2:0)+env.harsh/500-h.tr.cp*0.25-h.tr.a*0.2-h.tr.caution*0.2-(env.shady-50)/250-(h.goal.id==='suspect'||h.goal.id==='heal'?0.2:0)+(rng()-0.5)*0.4;
S.flags.scout=acc>0.55?'yes':'no';
var osc=K.say(S,{kind:'sys',tag:'スカウト',text:K.fmt(S,K.pick(S,M.SCOUT))+' '+K.fmt(S,K.pick(S,(S.flags.scout==='yes'?M.SCOUT_YES:M.SCOUT_NO)[h.persona]||M.SCOUT_NO.gentle)),why:'施術者を負かした腕を見込まれた（攻撃性・経験 '+h.stats.exp+'）／'+(S.flags.scout==='yes'?'引き受けた（FC・衝動性・堕ち度）':'断った（CP・A・慎重さ'+(env.shady>60?'・店の怪しさ':'')+'）')});
K.key(S,osc,S.flags.scout==='yes'?'スカウトを受けた':'スカウトを断った');
}
}
function topStop(st){
S.flags.noticedAt=S.flags.noticedAt||st[1];
var o1=K.say(S,{kind:'ev',tag:st[0]+'（拒否）',text:K.fmt(S,K.pick(S,TR?MC.RES_TOP_STOP:M.TOP_STOP)),why:TR?'受け攻め：'+TR.name+'との組では、客の'+h.name+'が主導する側。施術者に触られる側には回らない':'自分で「攻め」を選んでいる：施術者に触られる側には回らない'});
K.key(S,o1,st[1]+'で手を止めさせた');
var rev=0.25+h.tr.fc*0.3+h.tr.aggr*0.3+(h.stats.exp-3)*0.08+(h.goal.id==='secret'?0.3:0)+(h.action.id==='enjoy'?0.2:0)-(h.goal.id==='suspect'||h.goal.id==='heal'?0.15:0)-h.tr.caution*0.2+(TR?0.3:0);
if(rng()<rev){doReverse(true);return;}
left=true;
if(h.goal.id==='suspect'&& !S.flags.evidence&&rng()<0.6){
S.flags.evidence=true;
K.say(S,{kind:'ev',tag:'証拠集め',text:K.fmt(S,K.pick(S,M.EVIDENCE)),why:'噂を確かめに来た'});
}
var ol=K.say(S,{kind:'sys',tag:'退店',text:K.fmt(S,K.pick(S,M.TOP_LEAVE))+' '+K.fmt(S,K.pick(S,LEAVE)),why:'触られる側に回るつもりはなかった（攻めの指定）'});
K.key(S,ol,'店を出た');
}
for(var i=0;i<seq.length&& !left&& !fell;i++){
var st=seq[i],lvl=Math.min(5,st[4]+shift*(i/seq.length)*1.5);
S.step=i;
K.step(S,(i+1)+'. '+st[1]);
if(hardTop&&lvl>=2){topStop(st);break;}
var power=st[3]*(0.6+lvl*0.12)*(env.harsh/55)*(h.action.id==='enjoy'?1.2:h.action.id==='endure'?0.85:1)*(sk==='duo'?1.2:1)*hands*(sleeping?1.15:1);
var r=hardTop?{gain:0,climaxes:[]}:K.stim(S,power*1.7,{part:st[2],shame:lvl>=2,defer:true});
var text=K.fmt(S,K.pick(S,dark&&MD.act[st[0]]?MD.act[st[0]]:ACT[st[0]])),bd=band(lvl);
if(sleeping){
K.say(S,{kind:'ev',tag:st[0]+'（睡眠中）',lewd:lvl>=3||r.climaxes.length>0,text:text+' '+K.fmt(S,K.pick(S,M.SLEEP_DUR)),why:'眠っている間に施術が進んだ／快感 ＋'+Math.round(r.gain)});
logC(r.climaxes);
sleeping--;
if(!sleeping){
var ow=K.say(S,{kind:'ev',tag:'目覚め',text:K.fmt(S,K.pick(S,M.SLEEP_WAKE[h.persona])),why:'寝ている間に「'+st[1]+'」まで進んでいた'});
K.key(S,ow,'寝落ちから目覚めた');
sus+=45;
}
}else{
var shiftT=hardTop?'':phUp(bd),ri=Math.max(bd,ph>=2?2:0);
var rx=hardTop?' '+K.fmt(S,K.pick(S,bd?M.TOP_REACT:M.REACT[h.persona][0])):dark||(ph<2&&rng()<0.65)?' '+K.fmt(S,K.pick(S,M.REACT[h.persona][ri])):tail(ph>=2?1:lvl>=1?0.55:0.2);
var wrongNow=wrong&&lvl>=2&&M.WRONG&&(wrongShown===0||rng()<0.55);
if(wrongNow){
wrongShown++;h.reason+=1;sus+=3;
rx=' '+fw(M.WRONG[h.persona]||M.WRONG.gentle)+(wrongShown>1&&rng()<0.5?' '+fw(M.WRONG_BODY):'');
}
K.say(S,{kind:'ev',tag:wrongNow?st[0]+'（拒否反応）':st[0],lewd:lvl>=3||r.climaxes.length>0,text:text+rx+shiftT,why:(lvl>=2?'際どさ '+Math.round(lvl)+'／快感 ＋'+Math.round(r.gain):'')+(wrongNow?'／'+wrongWhy+'：抵抗が強い':'')});
logC(r.climaxes);
if(LVM){
if(i===0)loveAt('start');
else if(!hardTop&&lvl>=2&& !LVM.done.mid)loveAt('mid');
else if(!hardTop&&ph>=2)loveAt('fall');
}
}
if(rng()<0.5)K.say(S,{kind:'ev',tag:'施術者',text:K.fmt(S,K.pick(S,M.STAFF_TALK[sk]?M.STAFF_TALK[sk][hardTop?0:bd]:M.STAFF_TALK.gentle[hardTop?0:bd])),why:''});
var AB=M.ACT[h.action.id];
if(!sleeping&&AB&&rng()<0.45&&(!hardTop|| !bd)){
fx(AB.fx[bd]);
K.say(S,{kind:'ev',tag:h.action.label,text:K.fmt(S,K.pick(S,AB.t[Math.max(bd,ph>=2?2:0)])),why:'方針「'+h.action.label+'」'});
}
if(!hardTop&& !TR&& !sleeping&& !slept&& !noticed&&bd>=1&&rng()<(h.action.id==='relax'?0.3:0.06)+h.tr.cold*0.12+h.tr.ac*0.08){
slept=true;sleeping=1+rng.int(h.action.id==='relax'?4:2);
var osl=K.say(S,{kind:'ev',tag:'寝落ち',text:K.fmt(S,K.pick(S,M.SLEEP_IN)),why:'リラックスしすぎた（ドライさ・AC）'});
K.key(S,osl,'施術中に眠ってしまった');
}
var inc=incAt[i];
if(inc&& !sleeping){
fx(inc.fx);
var itext=(inc.id==='neighbor'&&o.other?K.fmt(S,K.pick(S,MC.CUR_NEIGHBOR),{b:o.other}):K.fmt(S,K.pick(S,inc.t)))+' '+K.fmt(S,K.pick(S,inc.r[h.persona]));
if(inc.also&&rng()<0.6){itext+=' '+K.fmt(S,inc.also);hands=1.25;}
K.say(S,{kind:'ev',tag:inc.n,text:itext,why:'ハプニング「'+inc.n+'」'});
(S.flags.inc=S.flags.inc||[]).push(inc.n);
}
if(!reversed&& !sleeping&&(!TR||HK.Pos.bothRiba(TR,CR))&&(noticed||stayed)&&h.corrupt>25&&((h.tr.cp>0.6&&h.tr.np<0.45)||h.tr.fc>0.62||h.tr.aggr>0.6)&&h.stats.exp>=3&&rng()<0.22+h.tr.aggr*0.3+(h.stats.exp-3)*0.08){
doReverse(false);
break;
}
if(!noticed&& !sleeping&&lvl>=1){
var eye=h.tr.caution*0.45+h.tr.a*0.35+h.tr.cold*0.25+(h.stats.exp-3)*0.08+(h.action.id==='watch'?0.25:0)+(h.goal.id==='suspect'?0.3:0);
if(wrong&&lvl>=2)eye+=0.1;
var blind=h.tr.ac*0.3+h.tr.np*0.25+(h.action.id==='relax'?0.2:0)+(sk==='silent'?0.15:0)+(sk==='duo'?0.1:0);
sus+=lvl*9*(0.6+eye-blind*0.6)+(env.shady-50)/12+h.pleasure/18;
if(sus>=55){
noticed=true;S.flags.noticedAt=st[1];
if(!hardTop&&((h.goal.id==='secret'&& !(wrong&&rng()<0.6))||(!wrong&&h.tr.ac>0.65&&h.tr.cp<0.5&&rng()<0.6))){
var os=K.say(S,{kind:'ev',tag:'気づき',text:K.fmt(S,K.pick(S,SECRET)),why:'「'+st[1]+'」で気づいた。でも言い出せなかった（AC '+Math.round(h.eg.AC)+'）'});
K.key(S,os,'気づいたが黙っていた');stayed=true;
}else{
var on=K.say(S,{kind:'ev',tag:'気づき',text:K.fmt(S,K.pick(S,NOTICE[h.persona])),why:'「'+st[1]+'」で気づいた（慎重さ '+Math.round(h.tr.caution*100)+'・A '+Math.round(h.eg.A)+'・経験 '+h.stats.exp+'）'});
K.key(S,on,st[1]+'で気づいた');
if(h.goal.id==='suspect'&& !S.flags.evidence&&h.tr.a+h.tr.cold+h.tr.caution>1.3){
S.flags.evidence=true;
K.say(S,{kind:'ev',tag:'証拠集め',text:K.fmt(S,K.pick(S,M.EVIDENCE)),why:'噂を確かめに来た（A・ドライさ・慎重さ）'});
}
var ex=K.fmt(S,K.pick(S,TR?MC.RES_EXCUSE[TR.persona]||MC.RES_EXCUSE.gentle:EXCUSE));
var believe=h.tr.ac*0.45+h.tr.np*0.3+h.tr.honesty*0.1-h.tr.a*0.35-h.tr.cp*0.3-h.tr.cold*0.2+staff.dec+h.pleasure/250-deceived*0.25+rng()*0.6-(wrong?0.12:0);
if(believe>0.35){
deceived++;noticed=false;sus=20;
K.say(S,{kind:'ev',tag:'言い訳',text:ex+' '+K.fmt(S,K.pick(S,DECEIVED[h.persona])),why:'言い訳に騙された（AC・NP・素直さ ＞ A・CP）'});
}else{
if(wrong&&M.WRONG_NOTDECEIVED)ex+=' '+fw(M.WRONG_NOTDECEIVED);
var go=h.tr.cp*0.5+h.reason/120+h.tr.cold*0.3-h.corrupt/80-(h.goal.id==='secret'?0.5:0)-h.tr.fc*0.2+(h.goal.id==='suspect'?0.2:0)+(wrong?0.06:0);
if(go>0.55){
left=true;
var ol=K.say(S,{kind:'sys',tag:'退店',text:ex+' '+K.fmt(S,K.pick(S,LEAVE)),why:'言い訳を見抜き、帰ることを選んだ（CP '+Math.round(h.eg.CP)+'・理性 '+Math.round(h.reason)+(wrong?'・'+wrongWhy:'')+'）'});
K.key(S,ol,'店を出た');
}else{
stayed=true;
var ost=K.say(S,{kind:'ev',tag:'続行',text:ex+' '+(wrong&&M.WRONG_STAY?fw(M.WRONG_STAY):K.fmt(S,K.pick(S,STAY))),why:'分かっていて、続けさせた（FC・堕ち度）'+(wrong?'／'+wrongWhy+'だが、それでも':'')});
K.key(S,ost,'分かっていて続けた');
}
}
}
}
}
if(!hardTop&& !left&& !sleeping&&stayed&& !asked&&h.corrupt>(wrong?75:55)&&rng()<(wrong?0.2:0.4)+h.tr.fc*0.3){
asked=true;
K.say(S,{kind:'ev',tag:'おねだり',lewd:true,text:K.fmt(S,K.pick(S,['{a}は自分から{m}の手を掴んで、そこへ導いた。「…もっと、ちゃんと｜…もっと、ちゃんとしろ｜…もっと、ちゃんとしてください」','{a}は消え入りそうな声で言った。「…最後まで、して｜…最後まで、しろ｜…最後まで、してください」','{a}「延長って、できる？｜延長はできるか｜延長って、できますか」――声が震えていた。'])),why:'堕ち度 '+Math.min(100,Math.round(h.corrupt))});
}
if(K.settle(S)&& !hardTop)fell=true;
K.snap(S,{s:sus});
}
if(extended&& !hardTop&& !left&& !reversed&& !fell){
S.step=seq.length;K.step(S,'延長');
var rx2=K.stim(S,40,{part:'all',mult:1.2,defer:true});
K.say(S,{kind:'ev',tag:'延長',lewd:true,text:K.fmt(S,K.pick(S,['延長の三十分は、それまでの九十分よりずっと長かった。{m}の手はもう、遠慮をしなかった。','{m}「延長分は、特に念入りに」――{a}は延長を頼んだことを、ほんの少しだけ後悔した。','延長の間、{a}は時計を見なかった。見る余裕がなかった。']))+phUp(2)+tail(0.7)+(lwOn()?ML.ext(lwc(false)):''),why:'延長した'});
logC(rx2.climaxes);
if(K.settle(S))fell=true;
}
var positions=[];
if(fell||(asked&& !left)){
S.step=seq.length;
K.step(S,'施術のあと');
var nPos=2+rng.int(2)+(h.corrupt>=100?1:0)+(highOn?1:0);
var ladyR= !!TR&&staff.g==='f'&& !ff,PL=(HK.MassageThick&&HK.MassageThick.POS_LADY)||POS;
var pool=S.rng.shuffle(noMut(cTop()?posTop():ff?POS_FF:ladyR?PL:POS));
var uP=S._fu=S._fu||[];
pool=pool.filter(function(p){return uP.indexOf(p.t)<0;}).concat(pool.filter(function(p){return uP.indexOf(p.t)>=0;})).slice(0,nPos);
pool.forEach(function(p){uP.push(p.t);});
var head=K.say(S,{kind:'sys',tag:'陥落',text:(wrong&&M.WRONG_FALL?fw(M.WRONG_FALL):'')+K.fmt(S,K.pick(S,['{a}の体は、もう{m}の言葉にしか従わなかった。{m}「では、本当の施術を始めましょう」','{a}は施術台の上で、自分から脚の力を抜いた。{m}は満足そうに微笑んだ。','{m}「今日はサービスです。最後まで、ゆっくり」――{a}には、断る理由がもう見つからなかった。'])),why:'快楽に負けた（堕ち度 '+Math.min(100,Math.round(h.corrupt))+'・理性 '+Math.round(Math.max(0,h.reason))+'）'});
K.key(S,head,'快楽に負けた');
ph=Math.max(ph,fell?3:2);
var custTop=cTop();
if(!dark&& !custTop&&lwOn())head.text+=ML.fall(lwc(false),kindR);
loveAt('fall');
var darkN=0,c0=h.climax;
if(dark)K.say(S,{kind:'sys',tag:'暗転',lewd:true,text:K.fmt(S,K.pick(S,MD.blackout)),why:'描写：軽め（暗転）'});
pool.forEach(function(p,j){
if(!dark&&j===pool.length-1){var thp=thick(custTop);if(thp)p=thp;}
positions.push(p.n);
var rr=K.stim(S,34+j*6,{part:'all',mult:1.3,defer:true});
if(dark)darkN+=rr.climaxes.length;
else{
var lw='',lk=custTop?kindT:kindR;
if(j===pool.length-1){if(lwOn())lw=ML.peak(lwc(custTop),lk,highOn);}
else if(j>=1&&lwOn())lw=ML.mid(lwc(custTop),lk);
var ex='',swept= !(asked||custTop);
if(eroOn&&(j===0||j===pool.length-1)&& !(swept&&(lw|| !HK.MassageThick.ERO_SWEPT))){
var EK=swept?HK.MassageThick.ERO_SWEPT:HK.MassageThick.ERO,ek=custTop?'top':ff?'ff':staff.g==='f'&& !noP(h)?'lady':'recv',d0=h.eroDom;
h.eroDom=custTop;
ex=(p.thick?'\n\n':'')+K.fmt(S,HK.Ero.fill(S,K.pick(S,EK[ek]),h));
h.eroDom=d0;
}
K.say(S,{kind:'ev',tag:p.n,lewd:true,text:K.fmt(S,p.t)+ex+lw+(function(tl){return lw?'':tl;})(rr.climaxes.length||p.thick?'':tail(0.8)),why:'体位の指定：'+p.n});
K.logClimax(S,rr.climaxes);
}
if((M.TRAINEE_ASK||(dark&&MD.traineeAsk))&& !TR&& !S.flags.trainee&&j>=1&&h.corrupt>=100&&h.climax>=6&&rng()<0.55){
S.flags.trainee=true;
var hesi=['proud','stern','tsun','cool','shy','polite'].indexOf(h.persona)>=0?rng()<0.8:rng()<0.3;
var tt=K.fmt(S,K.pick(S,dark?MD.traineeAsk:ff?M.TRAINEE_ASK_FF:M.TRAINEE_ASK))+' ';
if(hesi)tt+=K.fmt(S,K.pick(S,M.TRAINEE_HESITATE[h.persona]||M.TRAINEE_HESITATE.gentle))+' '+K.fmt(S,K.pick(S,dark?MD.traineePress:custTop?(eroOn&&M.TRAINEE_PRESS_TOP_ERO||M.TRAINEE_PRESS_TOP):ff?(eroOn&&M.TRAINEE_PRESS_FF_ERO||M.TRAINEE_PRESS_FF):(eroOn&&M.TRAINEE_PRESS_ERO||M.TRAINEE_PRESS)));
else tt+=K.fmt(S,K.pick(S,(eroOn&&M.TRAINEE_YES_ERO&&M.TRAINEE_YES_ERO[h.persona])||M.TRAINEE_YES[h.persona]||M.TRAINEE_YES.gentle));
h.pleasure+=40;while(h.pleasure>=100)K.climax(S);
var otr=K.say(S,{kind:'sys',tag:'練習台の約束',lewd:true,text:tt,why:'快楽に落ちきった（堕ち度 '+Math.min(100,Math.round(h.corrupt))+'・'+K.W_CL+' '+h.climax+'回）／もう断れなかった'+(hesi?'（性格上、返事を渋った）':'')});
K.key(S,otr,'新人の練習台になると約束した');
}
});
if(dark){
var nC=h.climax-c0;
K.say(S,{kind:'climax',tag:'明かりが点いた',text:K.fmt(S,K.pick(S,MD.lightsOn))+(HK.SAFE_ON?'――暗闇の中で「次は、こちらの姿勢で」と言われたのは'+positions.length+'回。'+h.name+'が声を殺しきれなかったのは、'+nC+'回だった。':'――暗闇の中で指定された体位は'+positions.length+'つ。'+h.name+'が達したのは、'+nC+'回だった。'),why:HK.SAFE_ON?'姿勢を変えた '+positions.length+'回／声 '+nC+'回':'体位 '+positions.length+'つ／'+K.W_CL+' '+nC+'回'});
}
}
if(!left&&(fell||asked||stayed||reversed||h.climax>0))loveAt('after');
S.flags.wrong=wrong;
var E=ending(S,{reversed:reversed,slept:slept,evidence: !!S.flags.evidence,left:left,fell:fell,asked:asked,stayed:stayed,noticed: !!S.flags.noticedAt,deceived:deceived,positions:positions,staff:staff,res: !!TR});
var adv=[];
if(deceived)adv.push('言い訳に'+deceived+'回騙された。AC（'+Math.round(h.eg.AC)+'）とNP（'+Math.round(h.eg.NP)+'）の素直さが、疑う気持ちに勝った。');
if(!S.flags.noticedAt)adv.push('最後まで「普通じゃない」と気づかなかった。慎重さ（'+Math.round(h.tr.caution*100)+'）とA（'+Math.round(h.eg.A)+'）がもう少し高ければ。');
else adv.push('気づいたのは「'+S.flags.noticedAt+'」の段階。');
if(fell)adv.push('快楽に負けたのは、感じやすさ '+h.stats.sense+'・CP '+Math.round(h.eg.CP)+'で、昂りに理性が追いつかなかったから。');
if(left)adv.push('帰る決断ができたのは、CP（'+Math.round(h.eg.CP)+'）と理性の残り（'+Math.round(h.reason)+'）のおかげ。');
return done(K.finish(S,input,E,adv,{meta:staff.n+(TR?'（住人）':'')+'・'+({normal:'整体',oil:'アロマオイル',lymph:'全身リンパ',special:'特別コース'})[course]+'コース',estats:[['気づいた',S.flags.noticedAt||'気づかず'],['騙された',deceived+'回'],[K.W_CL,h.climax+'回'],['堕ち度',Math.min(100,Math.round(h.corrupt))],['理性',Math.max(0,Math.round(h.reason))]].concat(positions.length?[dark?(HK.SAFE_ON?['暗闇の中で姿勢を変えた',positions.length+'回']:['暗闇の中の体位',positions.length+'つ']):['指定された体位',positions.join('→')]]:[]),label3:'施術'}));
}
function ending(S,x){
var h=S.h,L0=[],title,kind,M=HK.MassageMore;
if(x.reversed&&S.flags.scout==='yes'){kind='ok';title='スカウトされた ― 来月から、施術する側に';L0.push(h.name+'の初出勤の日、'+x.staff.n+'は研修資料を一枚も用意していなかった。「教えることなんて、ありませんから」');}
else if(x.reversed){kind='ok';title='立場逆転 ― 施術されたのは'+x.staff.n+'のほうだった'+(S.flags.scout==='no'?'（スカウトは断った）':'');L0.push(x.staff.n+'は会計のとき、'+h.name+'から代金を受け取らなかった。「……またのお越しを」声が、少しかすれていた。');}
else if(x.left&&x.evidence){kind='ok';title='潜入成功 ― 証拠を持ち帰った';L0.push('一週間後、その店の扉には「しばらく休業します」の貼り紙が貼られた。'+h.name+'の録音が、決め手だった。');}
else if(x.slept&& !x.noticed){kind='mid';title='寝ている間に全部終わっていた ― 何も覚えていない';L0.push(h.name+'は「すごくよく眠れた｜＝｜すごくよく眠れました」と言って帰った。体の奥に残る甘いだるさの理由は、最後まで分からなかった。');}
else if(x.left){kind='ok';title='途中で帰った ― 「'+S.flags.noticedAt+'」で見抜いた';L0.push(h.name+'はその日のうちに口コミサイトに長文を書いた。星は一つだった。');}
else if(x.fell&&S.flags.trainee){kind='over';title='新人の練習台になった ― 研修日は毎週水曜';L0.push(HK.SoloKit.fmt(S,S.rng.pick(M.TRAINEE_END)));}
else if(x.fell&&h.goal.id==='secret'){kind='over';title='常連になった ― 毎週水曜、同じ時間に';L0.push(h.name+'の予約は、もう三ヶ月先まで埋まっている。指名はいつも'+x.staff.n+'だった。');}
else if(x.fell){kind='over';title='快楽に負けた ― '+(x.positions.length?(S.dark?(HK.SAFE_ON?'暗闇の中で、'+x.positions.length+'回姿勢を変えて':'暗闇の中で、'+x.positions.length+'つの体位を'):x.positions.filter(function(v,i,A){return A.indexOf(v)===i;}).join('、')+'で'):'延長の三十分で');L0.push(h.name+'は帰り道、駅のホームで何度も膝が笑った。財布には、次回割引券が入っていた。');}
else if(x.asked){kind='over';title='自分からねだった ― 延長料金は払った';L0.push(h.name+'は会計のとき、'+x.staff.n+'と目を合わせられなかった。');}
else if(!x.noticed&&x.deceived){kind='mid';title='騙されたまま ― 「また来ます」';L0.push(h.name+'は'+x.deceived+'回疑って、'+x.deceived+'回納得した。体は軽くなった気がした。');}
else if(!x.noticed){kind='mid';title='最後まで気づかなかった ― 星5のレビューを書いた';L0.push(h.name+'「すごく丁寧な施術だった。特にリンパのところが効いた｜＝｜すごく丁寧な施術でした。特にリンパのところが効きました」――レビューには「参考になった」が千件ついた。');}
else if(x.stayed){kind='mid';title='分かっていて、最後まで ― 誰にも言えない90分';L0.push(h.name+'は気づいていた。それでも最後まで、施術台から降りなかった。');}
else{kind='mid';title='耐えきった ― 何事もなかった顔で会計した';L0.push(h.name+'は最後まで声を出さなかった。会計を済ませて外に出た瞬間、壁に手をついて座り込んだ。');}
if((x.fell||x.asked)&&(h.tr.ac>0.55||h.tr.np>0.6)&&S.rng()<0.6)L0.push(S.h.name?HK.SoloKit.fmt(S,S.rng.pick(x.res?HK.MassageCast.RES_AFTER:M.CRUSH)):'');
if(S.flags.wrong&&M.WRONG_END&&(x.fell||x.asked||x.stayed))L0.push(HK.SoloKit.fmt(S,S.rng.pick(M.WRONG_END.filter(function(t){return t.indexOf('{sx}')<0;}))));
if(h.goal.id==='heal')L0.push(h.name+'の肩こりは、本当にきれいに治っていた。それが一番、腹立たしかった。');
if(h.goal.id==='free')L0.push('タダ券の裏には、小さく「二回目以降は通常料金」と書いてあった。');
L0.push(HK.SoloKit.fmt(S,S.rng.pick(M.AFTERSHOP[h.persona])));
L0.push(h.name+'：'+K.W_CL+' '+h.climax+'回・堕ち度 '+Math.min(100,Math.round(h.corrupt))+'・理性 '+Math.max(0,Math.round(h.reason)));
return{type:kind,kind:kind,title:title,lines:L0};
}
if(HK.SCEN_ORDER.indexOf('massage')<0)HK.SCEN_ORDER.push('massage');
})();
});
;
/* ==== js/solo-saimin.js ==== */
HK.Load.def(173,'js/solo-saimin.js',function(){
(function(){
'use strict';
var HK=window.HK,SM=HK.SAIMIN,ST=HK.Story,clamp=HK.clamp;
if(!SM|| !ST)return;
function L(s){return s.split('|');}
function freshPick(S,arr){
if(!arr|| !arr.length)return'';
var u=S._fu||(S._fu=[]),free=arr.filter(function(x){return u.indexOf(x)<0;}),t;
if(free.length)t=free[S.rng.int(free.length)];
else{var bi=Infinity;arr.forEach(function(x){var j=u.indexOf(x);if(j<bi){bi=j;t=x;}});}
var k=u.indexOf(t);if(k>=0)u.splice(k,1);
u.push(t);
return t;
}
var W_CL='放心',W_SENS='高いほど暗示が体に効きやすく、放心しやすい';
function withFresh(f){var sp=ST.pick;ST.pick=freshPick;try{return f();}finally{ST.pick=sp;}}
var scen={
id:'saimin',name:'催眠',kicker:'1〜2人・R18',solo:true,maxCast:2,minCast:1,
desc:'同僚・恋人・友人・恨みを持った相手・ストーカーの誰かに催眠をかけられる。かかるのか、かかったらどこまでしてしまうのか、どんな暗示に弱いのか。終わったあと、怒るのか、通報するのか、やり返すのか、堕ちるのか、困惑するのか、受け入れるのか。数日後の二人も描く。※成人キャラクター向け',
note:'※登場人物はすべて成人として扱います。',
unit:'コマ',simulate:function(input){return withFresh(function(){return run(input);});},
check:function(input){
var n=Math.min(2,(input.chars||[]).length),pc=input.perChar||[];
for(var i=0;i<n;i++)if(((pc[i]&&pc[i].pick)||{}).role!=='hypno')return'';
return n?'催眠：かけられる側の住人が一人もいません。住人の役割で「かけられる側」を選ぶか、おまかせにしてください'+(n===1?'（1人のときは、その人がかけられる側になり、かける側はモブになります）':''):'';
},
castHint:'1〜2人（かける側とかけられる側で合わせて二人まで）。1人のときは、かける側はモブ（「かける相手」「かける人の性別」の設定で決まる）になります。2人のときは片方が「かける側」になり、もう片方に催眠をかけます（関係は「既存の関係」から決まります）。役割を決めなければ、2人目がかける側になります。全員を「かける側」にすると、かけられる人がいないので始められません。',
env:[
{id:'who',label:'かける相手',type:'select',def:'random',desc:'催眠をかける人と、かけられる人の関係。おまかせ以外を選ぶと、住人2人に関係があっても、この設定が優先されます。おまかせのときは二人の関係から決まります（関係がなければランダム）',options:[{v:'random',label:'おまかせ（人ごとにランダム）'},{v:'colleague',label:'仕事の同僚'},{v:'lover',label:'恋人'},{v:'friend',label:'友人'},{v:'grudge',label:'恨みを持った相手'},{v:'stalker',label:'ストーカー'}]},
{id:'hsex',label:'かける人の性別',type:'select',def:'random',desc:'1人のとき（かける側がモブ）だけ。おまかせなら、かけられる人の恋愛対象に合わせる',options:[{v:'random',label:'おまかせ'},{v:'m',label:'男性'},{v:'f',label:'女性'}]},
{id:'method',label:'かけ方',type:'select',def:'random',options:[{v:'random',label:'おまかせ'},{v:'pendulum',label:'振り子'},{v:'app',label:'催眠アプリ'},{v:'voice',label:'囁き声'},{v:'aroma',label:'甘い香り'},{v:'snap',label:'指パッチン'},{v:'audio',label:'催眠音声'},{v:'book',label:'古い本の呪文'}]},
{id:'skill',label:'催眠の腕',min:0,max:100,def:55,lo:'素人',hi:'達人',desc:'高いほど深くかけられ、相手の弱い暗示を見抜いて選ぶ'},
{id:'rounds',label:'暗示の数',min:2,max:8,def:5,lo:'2回',hi:'8回',unit:'回'},
{id:'mode',label:'暗示の方向',type:'select',def:'mix',options:[{v:'mix',label:'おまかせ'},{v:'lewd',label:'エッチなものだけ'},{v:'peace',label:'平和なものだけ'}]},
{id:'erase',label:'終わったあとの記憶',type:'select',def:'random',options:[{v:'random',label:'かける相手しだい'},{v:'keep',label:'消さない'},{v:'erase',label:'消そうとする'}]},
{id:'ev',label:'ハプニングの頻度',min:0,max:100,def:45,lo:'たまに',hi:'頻繁'},
{id:'lewd',label:'描写の濃さ',type:'select',def:'mid',options:[{v:'low',label:'ぼかす'},{v:'mid',label:'ほどほど'},{v:'high',label:'濃いめ'}]}
],
stats:[
{id:'sugg',label:'かかりやすさ',desc:'高いほど深くかかる。エゴグラムのAC・FCが高い、A・CPが低い人もかかりやすい'},
{id:'sens',label:'感じやすさ',desc:W_SENS}
],
perFields:[{id:'role',label:'役割',auto:'おまかせ',options:[{id:'target',label:'かけられる側'},{id:'hypno',label:'かける側'}]}],
actions:[
{id:'trust',label:'素直に身を任せる',fit:function(t){return t.ac*0.5+t.np*0.4;}},
{id:'doubt',label:'疑ってかかる',fit:function(t){return t.a*0.6+t.caution*0.4;}},
{id:'fun',label:'面白がる',fit:function(t){return t.fc*0.8+0.1;}}
],
goals:[
{id:'none',label:'何も考えていない',fit:function(t){return t.fc*0.4+t.ac*0.3;}},
{id:'safe',label:'自分を守る',fit:function(t){return t.cp*0.5+t.caution*0.5;}},
{id:'curious',label:'催眠に興味がある',fit:function(t){return t.a*0.4+t.fc*0.4;}}
],
events:[]
};
if(HK.Ero&&HK.Ero.OPT)scen.env.push(HK.Ero.OPT);
HK.SCENARIOS.saimin=scen;
if(HK.SCEN_ORDER.indexOf('saimin')<0)HK.SCEN_ORDER.push('saimin');
var TIEMAP={teacher:'colleague',mentor:'colleague',lover:'lover',mate:'lover',fated:'lover',fwb:'lover',colleague:'colleague',senpai:'colleague',master:'colleague',friend:'friend',best:'friend',childhood:'friend',buddy:'friend',acq:'friend',almost:'friend',enemy:'grudge',rival:'grudge',ex:'grudge',crush:'stalker',classmate:'friend',boss:'colleague',benefactor:'friend',worship:'friend',fond:'friend',blind:'stalker'};
var FATE={confused:'困惑したまま、答えを出せなかった',dazed:'放心して、しばらく何も手につかなかった',accept:'戸惑いながらも受け入れた',peace:'頭が良くなって喜んだ',forget:'何も覚えていない',body:'体だけが覚えている',angry:'激怒した',report:'通報した',revenge:'やり返した',counter:'逆催眠をかけた',sweet:'照れながら許した',shy:'恥ずかしくて避けた',fall:'快楽に堕ちた（自分からねだる）',couple:'恋人になった',depend:'憎みながら離れられない',laugh:'かからずに笑い飛ばした',noticed:'見破った'};
function resolve(S,p,list,pick){
if(pick&&pick!=='auto')for(var i=0;i<list.length;i++)if(list[i].id===pick)return list[i];
return HK.weighted(S.rng,list,function(o){return Math.pow(Math.max(0.02,o.fit(p.tr)),3);});
}
function dot(w,tr){var s=0;for(var k in w)s+=w[k]*(tr[k]||0);return s;}
function nm(S,p){return p.h;}
function run(input){
var S=ST.state(input,'saimin'),rng=S.rng,env=S.env,P=S.P,lew=env.lewd||'mid',skill=env.skill/100;
var V=HK.Voice;
S.gate= !HK.SAFE_ON&&lew!=='low'&& !!HK.Content&& !HK.Content.ok(S,'force');
P.forEach(function(p){var pk=(input.perChar&&input.perChar[p.i]&&input.perChar[p.i].pick||{}).role;p.role=pk==='hypno'?'hypno':'target';});
if(P.length>2)P=S.P=P.slice(0,2);
var HY=P.filter(function(p){return p.role==='hypno';})[0]||null;
if(HY&&P.length===1){HY.role='target';HY=null;}
if(!HY&&P.length===2){
var pk1=function(p){return(input.perChar&&input.perChar[p.i]&&input.perChar[p.i].pick||{}).role;};
HY=pk1(P[1])!=='target'?P[1]:pk1(P[0])!=='target'?P[0]:P[1];
HY.role='hypno';
}
P.forEach(function(p){if(p!==HY)p.role='target';});
var T=P.filter(function(p){return p.role==='target';});
var keys=['depth','plea','fall','resist'];
if(HY){HY.roleLabel='かける側';HY.m={depth:0,plea:0,fall:0,resist:0};HY.cnt={ok:0,tries:0};}
T.forEach(function(p){
var pc=(input.perChar&&input.perChar[p.i])||{};
p.action=resolve(S,p,scen.actions,pc.action);p.goal=resolve(S,p,scen.goals,pc.goal);
var ty=null,famL='',kinNo=false;
if(HY){
var tt=(input.ties||[]).filter(function(t){return(t.a===HY.i&&t.b===p.i)||(t.a===p.i&&t.b===HY.i);})[0];
if(tt&&tt.type==='yan'){
var accepts=tt.cold==='accept'||tt.cold==='mutual',fears=tt.cold==='afraid'||tt.cold==='hate';
ty=accepts?'lover':tt.a===HY.i?'stalker':fears?'grudge':'friend';
}else if(tt&&HK.TIES[tt.type]&&HK.TIES[tt.type].family){
kinNo= !!(HK.tieNoLove&&HK.tieNoLove(tt));
ty= !kinNo&&rng()<0.5?'lover':'friend';
var FD=HK.TIES[tt.type];
famL=(FD.dir?(tt.a===HY.i?FD.roleA:FD.roleB):FD.label)||FD.label||'';
if(HK.Sib&&HK.Sib.isSibTie(tt)){var sw=HK.Sib.word(p,HY,'plain',{tie:tt});if(sw)famL=(HK.Sib.isStep(tt)?'義理の':'')+sw;}
}else if(tt)ty=tt.type==='crush'?(tt.a===HY.i?'stalker':'friend'):TIEMAP[tt.type]||TIEMAP[(HK.TIES[tt.type]||{}).like];
if(env.who!=='random'&&SM.TYPES[env.who]){
ty=env.who;
var noLv=kinNo||(HK.canLove&& !(HK.canLove(HY,p)&&HK.canLove(p,HY)));
if(ty==='lover'&&noLv)ty='friend';
else if(ty==='stalker'&&(kinNo||(HK.canLove&& !HK.canLove(HY,p))))ty='grudge';
}
}
if(!ty)ty=env.who!=='random'&&SM.TYPES[env.who]?env.who:rng.pick(Object.keys(SM.TYPES));
if(S.gate&& !HY&&env.who==='random'&&(ty==='grudge'||ty==='stalker'))ty=rng.pick(['colleague','friend','lover']);
if(!HY){
var hs=env.hsex==='m'||env.hsex==='f'?env.hsex:null;
if(!hs)hs=p.likes==='f'?'f':p.likes==='m'?'m':(p.gender==='m'||p.gender==='f')&&rng()<0.4?'f':'m';
p.hf=hs==='f';
}
if(HY&&HK.ngPair&&HK.ngPair(HY,p)&&(ty==='lover'||ty==='stalker'))ty=ty==='lover'?'friend':'colleague';
p.ty=ty;p.T=famL&&ty==='friend'?Object.assign({},SM.TYPES[ty],{label:famL}):SM.TYPES[ty];
p.hc=HY||null;p.h=HY?HY.name:ST.fmt(rng.pick(p.hf&&p.T.namesF?p.T.namesF:p.T.names),{a:p.name});
p.hm=HY?null:{name:p.h,gender:p.hf?'f':'m',persona:'gentle',mob:true,mobRole:ty==='stalker'||ty==='grudge'?'guest':'street'};
if(p.hm&&p.hf)p.hm.tone='gentle';
p.mk=env.method!=='random'&&SM.METHODS[env.method]?env.method:rng.pick(Object.keys(SM.METHODS));
p.M=SM.METHODS[p.mk];
p.bad=ty==='grudge'||ty==='stalker';
var Pz=HK.Pos;
var mobNo= !HY&& !HK.SAFE_ON&&(!!(HK.State&& !HK.State.mobSexOk(p))|| !!(Pz&& !Pz.genderOK(p,p.hm)));
var resNo= !!HY&& !HK.SAFE_ON&&(!!(HK.ngPair&&HK.ngPair(HY,p))|| !!(HK.sexBlocked&&HK.sexBlocked(HY,p)));
p.noForce=S.gate&&(ty==='grudge'||ty==='stalker');
p.consent=S.gate&& !p.noForce;
p.noSex= !!(Pz&&HY&& !Pz.okSex(HY,p))||kinNo||mobNo||resNo||p.noForce;
p.aTop= !!(Pz&& !p.noSex&&(HY?Pz.order(HY,p,[HY,p])[0]===p:Pz.vsNpc(p,'')==='top'));
p.ff= !!(Pz&&(HY?Pz.ff(HY,p):p.hf&&Pz.isF(p)));
var hFem=HY? !!(Pz&&Pz.isF(HY)): !!p.hf;
p.fm= !!(Pz&& !p.noSex&& !p.ff&& !p.aTop&&hFem&&(!HY||(HK.FM&&HK.FM.on&&HK.FM.on(HY,p))||Pz.order(HY,p,[HY,p])[0]===HY));
p.aTopLast=p.aTop;
p.peaceOnly=env.mode==='mix'&&rng()<({friend:0.3,colleague:0.15,lover:0.1}[ty]||0);
p.sens=0.6+(p.stats.sens||3)*0.18;
p.sus=clamp(0.2+(p.stats.sugg||3)*0.08+p.tr.ac*0.25+p.tr.fc*0.15+p.tr.np*0.08-p.tr.a*0.2-p.tr.cp*0.2+dot(p.M.aff,p.tr)+p.T.trust*0.15+skill*0.15+(p.action.id==='trust'?0.12:p.action.id==='doubt'? -0.15:0.04)+(p.goal.id==='safe'? -0.08:0),0.02,0.98);
p.aff={};
Object.keys(SM.SUG).forEach(function(k){var g=SM.SUG[k];p.aff[k]=dot(g.aff,p.tr)-dot(g.res,p.tr)+(rng()-0.5)*0.25;});
p.weak=Object.keys(p.aff).filter(function(k){return okSug(p,k,env);}).sort(function(a,b){return p.aff[b]-p.aff[a];}).slice(0,2);
p.m={depth:0,plea:0,fall:0,resist:Math.round(clamp((p.tr.cp*0.5+p.tr.a*0.4+(p.goal.id==='safe'?0.15:0))*100*(HK.Attr?2-HK.Attr.willK(p):1),5,95))};
p.cnt={ok:0,part:0,ng:0,climax:0,lewd:0,shame:0,smart:0,ev:0};
p.used={};p.got=[];p.maxDepth=0;
p.roleLabel='かけられる側（'+p.T.label+(p.hf?'・女性':'')+'・'+p.M.name+'）';
});
function say(p,o,short,force){
o.actors=HY?[p,HY]:[p];
if(typeof o.text==='string'&&o.text.indexOf('{you}')>=0)o.text= !HY&&p.hm&&HK.Mob?HK.Mob.you(o.text,p.hm,p.ty==='lover'?'':'さん'):o.text.replace(/\{you\}/g,'あなた');
if(typeof o.text==='string')o.text=o.text.replace(new RegExp(HK.reEsc(p.name)+'(は|が|も)'+HK.reEsc(p.name)+'(の|に)','g'),p.name+'$1自分$2');
if(HK.FM&& !HK.SAFE_ON&&p.fm&&(HY||p.hm)&&typeof o.text==='string'){
var fps=o.text.split('\n\n');
fps[0]=HK.FM.fixWith({pick:function(a){return ST.pick(S,a);}},fps[0],HY||p.hm,p.name);
o.text=fps.join('\n\n');
}
if(HK.FM&& !HK.SAFE_ON&&p.aTop&& !p.ff&&HK.Pos&&HK.Pos.isF(p)&&(HY? !HK.Pos.isF(HY): !p.hf)&&typeof o.text==='string')
o.text=(function(ps){
ps[0]=HK.FM.fixWith({pick:function(a){return ST.pick(S,a);}},ps[0],p,p.h);
return ps.join('\n\n');
})(o.text.split('\n\n'));
return ST.sayB(S,o,short,force);
}
function wake(p){
p.woke=true;
var o=say(p,{tag:'目覚め',text:ST.fmt(ST.pick(S,L('{a}がはっと目を見開いた。目の前に{h}の顔があった。自分の格好を見下ろして、{a}は息を呑んだ。|{a}の瞳に、急に光が戻った。{a}は「……え。{you}、何してるの｜……え。{you}、何をしているんだ｜……え。{you}、何をしているんですか」と後ずさった。|{a}は跳ね起きた。体はまだ火照っているのに、頭だけが冷えていた。')),{a:p.name,h:p.h})+(SM.RESIST_SAY[p.persona]?p.name+ST.pick(S,SM.RESIST_SAY[p.persona]):''),why:'催眠が浅くなって、途中で目を覚ました（深さ '+Math.round(p.m.depth)+'）',mag:35},'',true);
ST.key(S,o,p.name+'が途中で目を覚ました');
if(p.cnt.lewd>=1&&lew!=='low'&&SM.afterSnap&& !p.snapDone){
p.wokeMid=true;p.snapDone=true;
var sr=snapThick(S,p,SM.afterSnap(wrapS(S,p),p));
var o2=say(p,{tag:sr.tag,text:sr.text,why:sr.why,mag:40,kind:sr.k==='swept'?'climax':'event'},'',true);
ST.key(S,o2,p.name+'：'+{swept:'我に返っても流された',report:'その場で通報した',flee:'逃げ出した'}[sr.k]);
}
}
function fresh(p,list){
var u=p._said=p._said||{},f=list.filter(function(x){return!u[x];});
var x=ST.pick(S,f.length?f:list);u[x]=1;return x;
}
function tq(p){return V&&SM.TRANCE[p.persona]&&rng()<0.45?p.name+fresh(p,topVoice(p,'TRANCE',tranceL(p))):'';}
function cmdText(p,g){
var c0=ST.fmt(ST.pick(S,cmdOf(p,g)),{h:'私',a:p.name}).replace(/^「|」$/g,'');
var c=(p.hc?'':'\u2060')+c0;
if(!SM.CMD_FRAME)return p.h+'は'+(S.rng()<0.5?'低い声で':'耳元で')+'「'+c+'」と囁いた。';
return ST.fmt(ST.pick(S,SM.CMD_FRAME),{h:p.h,a:p.name}).replace('{c}',c);
}
function rsUp(p){
var r0=p.rs||0,n=Math.max(r0,p.m.fall>=55||(p.cnt.climax>=3&&p.m.fall>=40)?2:0,p.m.fall>=25||p.cnt.climax>=1?1:0);
if(n<=r0)return'';
p.rs=n;
var T=SM.SHIFT&&(SM.SHIFT[p.persona]||SM.SHIFT.gentle);
return T&& !p.aTop?ST.fmt(ST.pick(S,T[n-1]),{a:p.name,h:p.h}):'';
}
function tranceL(p){var TS=SM.TRANCE_ST&&SM.TRANCE_ST[p.persona];return TS?TS[Math.min(TS.length-1,p.rs||0)]:SM.TRANCE[p.persona];}
ST.step(S,'導入');
ST.budget(S,2*T.length);
T.forEach(function(p){
var v={a:p.name,h:p.h};
var t=ST.fmt(ST.pick(S,p.T.intro),v)+(p.consent&&SM.CONSENT?ST.fmt(ST.pick(S,SM.CONSENT.filter(function(x){return!(p.noR18||p.noSex)|| !/エッチ/.test(x);})),v):'')+ST.fmt(ST.pick(S,p.M.intro),v);
say(p,{tag:p.T.label,text:t,why:'催眠をかけるのは'+p.h+'（'+p.T.label+(p.hf?'・女性':'')+'）。'+ST.fmt(p.T.motive,v)+(p.consent?'／始める前に、二人で同意していた（内容のスイッチ「合意のない展開」が切）':p.noForce?'／内容のスイッチ「合意のない展開」が切なので、いたずらの暗示だけ':'')});
var o=say(p,{tag:'診断',text:p.name+'のかかりやすさは'+Math.round(p.sus*100)+'％。弱い暗示は「'+p.weak.map(function(k){return SM.SUG[k].label;}).join('」「')+'」。',why:'AC・FCが高いほど、A・CPが低いほどかかりやすい／'+p.M.name+'との相性・'+p.h+'への警戒の薄さ・方針「'+p.action.label+'」'},'',true);
ST.key(S,o,p.name+'のかかりやすさ');
});
ST.snap(S,keys);
ST.step(S,'誘導');
ST.budget(S,Math.max(2,T.length));
T.forEach(function(p){
var v={a:p.name,h:p.h},tries=0;
while(tries<3&&p.m.depth<40){tries++;p.m.depth=clamp(p.m.depth+2+p.sus*30+rng()*14-p.m.resist*0.14,0,100);}
p.maxDepth=p.m.depth;
if(HY)HY.cnt.tries++;
if(p.m.depth<40){
p.failed=true;
var o=say(p,{tag:'かからない',text:ST.fmt(ST.pick(S,SM.INDUCE.fail),v)+(SM.RESIST_SAY[p.persona]?p.name+ST.pick(S,SM.RESIST_SAY[p.persona]):''),why:p.name+'はかからなかった（深さ '+Math.round(p.m.depth)+'・三回試した）／警戒心 '+p.m.resist,mag:30},'',true);
ST.key(S,o,p.name+'は催眠にかからなかった');
return;
}
if(HY)HY.cnt.ok++;
var deep=p.m.depth>=70;
say(p,{tag:deep?'深くかかった':'かかった',text:ST.fmt(ST.pick(S,deep?SM.INDUCE.deep:SM.INDUCE.light),v),why:p.name+'の深さ '+Math.round(p.m.depth)+'（'+tries+'回目で）',mag:20},p.name+'は'+(deep?'深く':'')+'かかった',true);
});
ST.snap(S,keys);
for(var r=0;r<env.rounds;r++){
if(!T.some(function(p){return!p.failed&& !p.woke;}))break;
ST.step(S,'暗示'+(r+1));
S.step=r;
ST.budget(S,2);
T.forEach(function(p){
if(p.failed||p.woke)return;
var v={a:p.name,h:p.h};
if(rng()<env.ev/100*0.45){
var e=HK.weighted(rng,SM.EVENTS,function(x){return(EV_NG[x.id]&&(p.aTop||p.noSex)?0:1)/(1+(p.used['ev_'+x.id]||0)*3)*(x.id==='battery'&&p.mk!=='app'&&p.mk!=='aroma'?0.2:1);});
p.used['ev_'+e.id]=(p.used['ev_'+e.id]||0)+1;p.cnt.ev++;
var fx=e.fx;
if(fx.depth)p.m.depth=clamp(p.m.depth+fx.depth,0,100);
if(fx.fall)p.m.fall=clamp(p.m.fall+fx.fall*HK.Dark.f(S,'fall'),0,100);
if(fx.record)p.recorded=true;
if(fx.aware)p.halfAware=true;
if(fx.guilt)p.guilt=true;
say(p,{tag:'ハプニング',text:ST.fmt(ST.pick(S,e.t),v),why:fx.depth?'深さ '+(fx.depth>0?'+':'')+fx.depth+'（'+Math.round(p.m.depth)+'）':''},p.name+'：ハプニング');
if(p.m.depth<22)return wake(p);
}
var ks=Object.keys(SM.SUG).filter(function(k){return okSug(p,k,env)&&(p.used[k]||0)<2;});
if(!ks.length)return;
var k=HK.weighted(rng,ks,function(k2){
var g=SM.SUG[k2];
return(p.T.pick[k2]||0.5)*(1+skill*2*Math.max(0,p.aff[k2]))/(1+(p.used[k2]||0)*2)*(g.req<=p.m.depth+15?1:0.35);
});
p.used[k]=(p.used[k]||0)+1;
var g=SM.SUG[k];
var score=p.m.depth-g.req+p.aff[k]*70+p.m.fall*0.25+(p.stats.sugg||3)*3+rng()*30-15-p.m.resist*0.1;
var res=score>=8?'full':score>= -10?'part':'ng';
var t=cmdText(p,g),why='暗示「'+g.label+'」（必要な深さ '+g.req+'・今の深さ '+Math.round(p.m.depth)+'・'+p.name+'との相性 '+(p.aff[k]>=0.15?'◎':p.aff[k]>=0?'○':'△')+'）';
var mag=15;
if(res==='ng'){
p.cnt.ng++;p.m.depth=clamp(p.m.depth-14-Math.max(0,-p.aff[k])*30,0,100);p.m.resist=clamp(p.m.resist+6,0,100);
var late=p.rs>=1&&SM.RESIST_LATE,RSY=late&&SM.RESIST_SAY_LATE?SM.RESIST_SAY_LATE[p.persona]||SM.RESIST_SAY_LATE.gentle:SM.RESIST_SAY[p.persona];
t+=ST.fmt(ST.pick(S,late?SM.RESIST_LATE:SM.RESIST),v)+(RSY&&rng()<0.5?p.name+ST.pick(S,RSY):'');
why+=late?'：その暗示だけは拒んだ':'：拒んだ';
}else{
var full=res==='full',f=g.fx;
if(full){p.cnt.ok++;p.got.push(k);}else p.cnt.part++;
if(g.lewd)p.cnt.lewd++;
if(f.smart&&full)p.cnt.smart++;
if(f.shame)p.cnt.shame+=f.shame;
if(f.trig&&full)p.trigger=true;
var aTop=p.aTop;
var vk=full?(lew==='low'&&g.softFull?'softFull':vkey(p,g,'full')):vkey(p,g,'part');
var body=ST.pick(S,bodyL(S,p,'sug.'+k+'.'+ekey(p,vk),g[vk]));
var fb=lew==='low'&&g.lewd&&full?ST.fmt(ST.pick(S,SM.SUG_LOW),v):eF(S,p,ST.fmt(body,v));
t+=fb;
t+=tq(p);
p.m.plea=clamp(p.m.plea+(f.plea||0)*p.sens*(full?1:0.5),0,120);
p.m.fall=clamp(p.m.fall+(f.fall||0)*(full?1:0.45)*HK.Dark.f(S,'fall'),0,100);
var cl=full?(f.climax||0):0;
if(p.m.plea>=100){cl++;p.m.plea=30;}
var big=full&&g.lewd&&SM.bigScene?SM.bigScene(S,p,fb,vk,cl):null;
if(big){t=t.replace(fb,big);if(!cl)cl=1;}
var thick= !big&&full&&g.lewd&&(cl?rng()<0.85:rng()<0.3)&&HK.Thick4&&HK.Thick4.ok(S,lew)?thickSug(S,p,fb,vk):null;
if(thick){t=t.replace(fb,thick);if(!cl)cl=1;}
if(cl){
p.cnt.climax+=cl;p.m.fall=clamp(p.m.fall+cl*3*HK.Dark.f(S,'fall'),0,100);
if(lew!=='low'&&eroOn(S)&& !aTop){if(!big&& !/\{m2\}/.test(body))t+=p.name+'「'+HK.Ero.moan(S,p,2)+'」';}
else if(!thick&& !big&&lew!=='low'&&V&&V.CLIMAX[p.persona])t+=p.name+(aTop&&SM.CLIMAX_TOP?fresh(p,topVoice(p,'CLIMAX',[])):'「'+fresh(p,topL(p,V.CLIMAX[p.persona]))+'」');
why+='／'+W_CL+' '+cl+'回';
}
p.m.depth=clamp(p.m.depth+(full?5: -5),0,100);
why+=full?'：受け入れた':'：半分だけ受け入れた';
if(full&&g.snap&&lew!=='low'&&SM.SNAP&&rng()<g.snap*(1.2-p.m.fall/100)){
var snk=p.ff?(aTop?'SNAP_FF_TOP':'SNAP_FF'):p.fm&&SM.SNAP_FM?'SNAP_FM':aTop&&SM.SNAP_TOP_F&&HK.Pos&&HK.Pos.isF(p)?'SNAP_TOP_F':aTop&&SM.SNAP_TOP?'SNAP_TOP':'SNAP';
t+=eF(S,p,ST.fmt(ST.pick(S,eL(S,snk,SM[snk])),v))+(SM.RESIST_SAY[p.persona]&&rng()<0.5?p.name+ST.pick(S,SM.RESIST_SAY[p.persona]):'');
p.woke=true;p.wokeCum=true;p.m.depth=0;p.aTopLast=aTop;
why+='／'+snapWord(p)+'催眠が解けた（快楽堕ち '+Math.round(p.m.fall)+'）';
mag=40;
}
if(!p.woke&&g.lewd&&lew!=='low'&&SM.midSnap&&SM.midSnapOk(k)&&p.cnt.lewd>=2&&rng()<(0.03+(full?0:0.05)+p.m.resist/1000+Math.max(0,40-p.m.depth)/500)*(1.1-p.m.fall/100)){
t+=SM.midSnap(wrapS(S,p),p,k);
p.woke=true;p.wokeMid=true;p.m.depth=0;p.aTopLast=aTop;
why+='／行為の最中に我に返った（快楽堕ち '+Math.round(p.m.fall)+'・抵抗 '+Math.round(p.m.resist)+'）';
}
if(!p.woke)t+=rsUp(p);
mag=p.wokeCum||p.wokeMid?40:full?(g.lewd?30:18):16;
}
p.maxDepth=Math.max(p.maxDepth,p.m.depth);
var o=say(p,{tag:g.label,text:t,why:why,mag:mag,kind:res==='full'&&g.lewd?'climax':'event'},p.name+'×「'+g.label+'」＝'+{full:'受け入れた',part:'半分',ng:'拒んだ'}[res],res==='full'&&(p.cnt.ok===1||k==='buzama'||k==='smart'));
if(o&&res==='full'&&p.cnt.ok===1)ST.key(S,o,p.name+'が最初に受け入れた暗示');
if(o&&(p.wokeCum||p.wokeMid)&& !p.snapDone){
ST.key(S,o,p.name+(p.wokeMid?'が行為の最中に我に返った':'が'+snapWord(p)+'我に返った'));
p.snapDone=true;
if(SM.afterSnap){
var sr=snapThick(S,p,SM.afterSnap(wrapS(S,p),p));
var o2=say(p,{tag:sr.tag,text:sr.text,why:sr.why,mag:40,kind:sr.k==='swept'?'climax':'event'},'',true);
ST.key(S,o2,p.name+'：'+{swept:'我に返っても流された',report:'その場で通報した',flee:'逃げ出した'}[sr.k]);
}
}
if(p.m.depth<22&& !p.wokeCum&& !p.wokeMid)wake(p);
});
ST.flushShort(S,'ほかに：');
ST.snap(S,keys);
}
if(T.some(function(p){return!p.failed&& !p.woke;}))ST.step(S,'解除');
ST.budget(S,2);
T.forEach(function(p){
if(p.failed||p.woke)return;
var v={a:p.name,h:p.h};
var want=env.erase==='keep'?0:env.erase==='erase'?1:p.T.erase;
if(rng()<want){
var ok=rng()<p.m.depth/100+0.1;
p.erased=ok?'full':'part';
say(p,{tag:'記憶の消去',text:ST.fmt('{h}は最後に囁いた。「目が覚めたら、今夜のことは全部忘れている」',v)+(ok?ST.fmt('{a}は静かに目を閉じた。',v):ST.fmt('{a}のまぶたが、一瞬だけ震えた。',v)),why:ok?'深さ '+Math.round(p.m.depth)+'：記憶は消えた':'深さが足りず、記憶は消えきらなかった'},p.name+'の記憶を'+(ok?'消した':'消し損ねた'));
}else{
say(p,{tag:'解除',text:ST.fmt(ST.pick(S,L('{h}が三つ数えて指を鳴らすと、{a}はゆっくりと目を開けた。|{h}は「はい、おしまい」と手を叩いた。{a}の瞳に、少しずつ光が戻ってきた。|{h}は{a}の額に手を当てて、「起きて」と言った。')),v),why:'記憶は消さなかった'},p.name+'の催眠を解いた');
}
});
ST.flushShort(S,'ほかに：');
ST.step(S,'その後');
ST.budget(S,3);
T.forEach(function(p){
var route=after(S,p);
p.route=route;p.fate=FATE[route];
var v={a:p.name,h:p.h};
var snapK=SM.SNAP_AFTER&&((route==='report'&&p.reportedNow)||(route==='fall'&&p.swept))?((p.ff&&SM.SNAP_AFTER_FF&&SM.SNAP_AFTER_FF[route])?'SNAP_AFTER_FF':(p.fm&&SM.SNAP_AFTER_FM&&SM.SNAP_AFTER_FM[route])?'SNAP_AFTER_FM':(p.aTop&&SM.SNAP_AFTER_TOP&&SM.SNAP_AFTER_TOP[route])?'SNAP_AFTER_TOP':'SNAP_AFTER'):null;
var soft=(lew==='low'||(!p.failed&& !p.cnt.lewd))&&SM.AFTER_SOFT&&SM.AFTER_SOFT[route];
var afK=snapK||(soft?'AFTER_SOFT':(p.aTop&&SM.AFTER_TOP&&SM.AFTER_TOP[route])?'AFTER_TOP':'AFTER');
var afE=afK==='AFTER'&&p.ff?'AFTER_FF':afK==='AFTER'&&p.fm?'AFTER_FM':afK==='AFTER'&&p.aTop?'AFTER_TOP':afK;
var afL= !p.failed&&p.cnt.lewd&& !soft?eL(S,afE+'.'+route,SM[afK][route]):SM[afK][route];
if(soft&&route==='report'&&(p.ty==='stalker'||p.ty==='grudge')&&SM.AFTER_SOFT.reportX)afL=SM.AFTER_SOFT.reportX;
var t=eF(S,p,ST.fmt(ST.pick(S,afL),v));
var mood={angry:'angry',report:'angry',revenge:'angry',counter:'angry',sweet:'sweet',couple:'sweet',fall:'fall',depend:'fall',confused:'confused',dazed:'dazed',accept:'accept',body:null}[route];
if(mood&&SM.AFTER_SAY[mood]&&SM.AFTER_SAY[mood][p.persona])t+=p.name+ST.pick(S,p.aTop&&SM.AFTER_SAY_TOP&&SM.AFTER_SAY_TOP[mood]?(SM.AFTER_SAY_TOP[mood][p.persona]||SM.AFTER_SAY_TOP[mood].gentle):topL(p,SM.AFTER_SAY[mood][p.persona]));
if((route==='fall'||route==='depend')&&SM.bigFall){var bf=SM.bigFall(S,p,route);if(bf){t+=bf;p.bigFell=true;}}
if(HK.Attr&&p.m.fall>=40&&route!=='laugh'&&route!=='noticed')t+=HK.Attr.hold(function(l){return ST.pick(S,l);},p,'saimin');
if(p.trigger&&(route==='forget'||route==='body')&&rng()<0.6)t+=ST.fmt('――数日後、会議中に誰かが何気なく「おやすみ」と言った。{a}は理由も分からないまま、机の下で膝を震わせた。',v);
var o=say(p,{tag:'結末',text:t,why:whyAfter(p,route),mag:40},'',true);
ST.key(S,o,p.name+'：'+p.fate);
});
if(SM.EPI){
ST.step(S,'後日談');
ST.budget(S,T.length);
T.forEach(function(p){
var e=epilogue(S,p);
if(!e)return;
say(p,{tag:'後日談',text:e.text,why:e.why,mag:e.sex?35:25,kind:e.sex?'climax':'event'},'',true);
});
}
var res=finish(S,input,T,HY);
return lew==='low'?softWords(res):res;
}
var SOFTW=[[/快楽堕ち/g,'ハマり度'],[/快楽に/g,'暗示に'],[/ねだる/g,'せがむ'],[/快楽/g,'心地よさ'],[/堕ちた/g,'ハマった'],[/堕ち/g,'ハマり'],[/快感/g,'ふわふわ'],[/絶頂/g,'放心']];
function softWords(o){
if(typeof o==='string'){SOFTW.forEach(function(w){o=o.replace(w[0],w[1]);});return o;}
if(Array.isArray(o)){for(var i=0;i<o.length;i++)o[i]=softWords(o[i]);return o;}
if(o&&typeof o==='object')Object.keys(o).forEach(function(k){if(k!=='id'&&k!=='kind'&&k!=='type'&&k!=='color')o[k]=softWords(o[k]);});
return o;
}
function first(g,ks){for(var i=0;i<ks.length;i++)if(g[ks[i]])return ks[i];return null;}
function thickSug(S,p,fb,vk){
var kind= /咥え|口いっぱい|喉の奥/.test(fb)?'kneel': /押し入|貫|沈め|呑み込|跨|奥まで|注ぎ|繋が/.test(fb)?'in':null;
if(!kind)return null;
var me=p,hc=p.hc||p.hm||{name:p.h,gender:p.ff||p.hf?'f':'m'};
if(p.ff)kind='ff';
var top= /Top/.test(vk)||p.aTop,dom=top?me:hc,sub=top?hc:me;
if(!top&&kind==='kneel'&&HK.Pos&&HK.Pos.hardTop&&HK.Pos.hardTop(me,hc))return null;
return HK.Thick4.scene(S,{dom:dom,sub:sub,kind:kind,lead:fb,sad:HK.Thick4.rollSad(S,dom,sub),
after:ST.pick(S,['{a}の目には、まだ暗示の靄がかかっていた。','自分が何をしたのか、{a}が知るのはもう少しあとのことだ。','{h}は、まだとろんとしたままの{a}の目を覗き込み、満足げに息をついた。']).replace(/\{a\}/g,p.name).replace(/\{h\}/g,p.h)});
}
function snapThick(S,p,sr){
if(!sr||sr.k!=='swept'|| !HK.Thick4|| !HK.Thick4.ok(S,S.env.lewd||'mid')||S.rng()>0.5)return sr;
var hc=p.hc||p.hm||{name:p.h,gender:p.ff||p.hf?'f':'m'},top=p.aTopLast,dom=top?p:hc,sub=top?hc:p;
var sc=HK.Thick4.scene(S,{dom:dom,sub:sub,kind:p.ff?'ff':'in',lead:sr.text.replace(/[^。」]*「[^」]*」$/,''),sad:HK.Thick4.rollSad(S,dom,sub),
after:ST.fmt(ST.pick(S,['正気のまま流されたことを、{a}はもう言い訳できなかった。','{a}は天井を見上げたまま、自分の選んだことの重さを噛みしめていた。']),{a:p.name})});
if(sc)sr.text=sc;
return sr;
}
function vkey(p,g,kind){
if(p.fm&&g.lewd){
if(kind==='part')return g.fmPart?'fmPart':(g.fm||g.fmOk)&&g.part?'part':null;
return g.fm?'fm':g.fmOk&&g.full?'full':null;
}
if(kind==='part'){
if(p.ff&&p.aTop)return first(g,['ffTopPart','partTop','ffPart','part']);
if(p.ff)return first(g,['ffPart','part']);
return p.aTop&&g.partTop?'partTop':'part';
}
if(!g.lewd)return p.aTop&&g.fullTop?'fullTop':'full';
if(p.ff)return p.aTop?(g.ffTop?'ffTop':g.ffOk&&g.topOk&&g.full?'full':null):(g.ff?'ff':g.ffOk&&g.full?'full':null);
if(p.aTop)return g.fullTop?'fullTop':g.topOk&&g.full?'full':null;
return'full';
}
function variant(p,g,kind){var k=vkey(p,g,kind);return k?g[k]:null;}
function eroOn(S){return!!(HK.Ero&&HK.Ero.on(S));}
function ekey(p,k){
if(p.fm&&(k==='full'||k==='part'))return k==='full'?'fm':'fmPart';
if(k==='full'&&p.ff)return p.aTop?'ffTop':'ff';
if(k==='full'&&p.aTop)return'fullTop';
if(k==='part'&&p.ff)return p.aTop?'ffTopPart':'ffPart';
if(k==='part'&&p.aTop)return'partTop';
return k;
}
function eL(S,key,arr){return HK.Ero?HK.Ero.L(S,'saimin',key,arr):arr;}
var A_MALE= /\{a\}の(?:根元|亀頭|竿|裏筋|鈴口|カリ|先走り|ちんぽ|肉棒|ペニス|陰茎|睾丸|\{男性器\}|\{亀頭\})|\{a\}(?:は|が)[^。「」{]{0,30}(?:射精|精を(?:吐き出|放))/;
function bodyL(S,p,key,arr){
var L0=eL(S,key,arr);
if(p.aTop|| !HK.Pos||HK.Pos.hasM(p))return L0;
var ok=(L0||[]).filter(function(t){return!A_MALE.test(t);}).concat(HK.Pos.hasF(p)?eL(S,key+'F',[])||[]:[]);
return ok.length?ok:L0;
}
function eF(S,p,t){
if(!eroOn(S))return t;
t=String(t).replace(/\{hm([012])\}/g,function(m,n){
var q=p.hc||p.hm||{persona:'gentle'},d=q.eroDom;
if(q.mob)q.mobTop=p.aTop?false:'serv';
q.eroDom= !p.aTop&& +n<2;
var s=HK.Ero.moan(S,q,+n);q.eroDom=d;return s;
});
return HK.Ero.fill(S,t,p);
}
function wrapS(S,p){
return{rng:S.rng,pick:function(a){return ST.pick(S,a);},fmt:function(t,v){return eF(S,p,ST.fmt(t,v));},
alt:function(key,arr){return eL(S,key,arr);},
cv:function(q,top){return eroOn(S)&& !top?HK.Ero.moan(S,q,2):null;}};
}
function cmdOf(p,g){return(p.ff&&g.cmdFF)||(p.fm&&g.cmdFM)||(p.aTop&&g.cmdTop)||g.cmd;}
function topL(p,list){return HK.R18M&&HK.R18M.topLines?HK.R18M.topLines(p,list):list;}
function topVoice(p,key,list){
if(!p.aTop)return topL(p,list);
var T=key==='CLIMAX'&&(p.ff||(HK.Pos&&HK.Pos.isF&&HK.Pos.isF(p)))&&SM.CLIMAX_TOP_FF?SM.CLIMAX_TOP_FF:SM[key+'_TOP'];
if(!T)return topL(p,list);
return Array.isArray(T)?T:(T[p.persona]||T.gentle);
}
function snapWord(p){return p.ff||(p.aTop&&HK.Pos&&HK.Pos.isF&&HK.Pos.isF(p))?'達した拍子に':p.aTop?'中に注いだ瞬間に':'中に出された熱で';}
var EV_NG={beg:1,mark:1};
function okSug(p,k,env){
var g=SM.SUG[k];
if(p.noSex&&g.lewd)return false;
if(env.lewd!=='low'&&g.lewd&& !variant(p,g,'full'))return false;
if(g.notLover&&p.ty==='lover')return false;
if(g.need&&((p.got||[]).filter(function(x){return SM.SUG[x]&&SM.SUG[x].lewd;}).length<g.need))return false;
if(g.bad&& !p.bad)return false;
if(env.lewd==='low')return!g.lewd;
if((env.mode==='peace'||p.peaceOnly)&&g.lewd)return false;
if(env.mode==='lewd'&& !g.lewd&& !p.noSex)return false;
if(g.peace&&(p.ty==='grudge'||p.ty==='stalker')&&env.mode!=='peace')return false;
if(p.peaceOnly&&k==='freeze')return false;
return true;
}
var EPI_GROUP={forget:'erased',body:'body',angry:'neg',report:'report',revenge:'turn',counter:'turn',shy:'neg',confused:'mid',dazed:'mid',accept:'warm',sweet:'warm',couple:'couple',peace:'peace',fall:'fall',depend:'depend'};
function temperOf(p){
var ps=p.persona;
if(ps==='proud'||ps==='stern'||ps==='tsun')return'bold';
if(ps==='cool')return'cool';
if(ps==='free')return'free';
return'soft';
}
var EPI_MOOD={erased:'forgot',body:'forgot',neg:'cold',report:'cold',turn:'cold',fail:'cold',mid:'wobble',warm:'warm',couple:'warm',peace:'peace',fall:'warm',depend:'wobble'};
function epilogue(S,p){
var route=p.route,grp=p.failed?'fail':EPI_GROUP[route]||'neg';
var rel=p.ty==='lover'?'close':p.bad?'bad':'near',tmp=temperOf(p);
var mood=p.failed?(route==='laugh'?'forgot':'cold'):EPI_MOOD[grp]||'cold';
var v={a:p.name,h:p.h,place:p.T!==SM.TYPES[p.ty]?'家':(SM.PLACE&&SM.PLACE[p.ty])||'いつもの場所',who:(SM.WHO&&SM.WHO[p.ty])||p.h};
var soft=(S.env.lewd==='low'||(!p.failed&& !p.cnt.lewd))&&SM.EPI_SOFT&&SM.EPI_SOFT[grp];
var lst=soft?SM.EPI_SOFT[grp]:SM.EPI[grp]||SM.EPI.neg;
var t=ST.fmt(ST.pick(S,lst),v);
var RL=SM.EPI_REL&&SM.EPI_REL[rel]&&SM.EPI_REL[rel][mood];
if(RL)t+=ST.fmt(ST.pick(S,RL),v);
if(p.erased==='part'&&grp!=='erased'&&grp!=='body'&&SM.EPI_PART)t+=ST.fmt(ST.pick(S,SM.EPI_PART),v);
var TT=SM.EPI_TEMPER&&SM.EPI_TEMPER[tmp]&&SM.EPI_TEMPER[tmp][mood];
if(TT)t+=ST.fmt(ST.pick(S,TT),v);
var SY=SM.EPI_SAY&&SM.EPI_SAY[mood];
if(SY&&SY[p.persona])t+=p.name+ST.pick(S,topL(p,SY[p.persona]));
var why=(p.failed?'催眠にかからなかった':grp==='erased'||grp==='body'?(p.erased==='full'?'記憶は消された':'記憶は消えかけていた'):p.erased==='part'?'記憶はところどころ欠けていた':'記憶は残っていた')+
'／関係：'+p.T.label+'／気質：'+{bold:'強気',soft:'やわらか',cool:'冷静',free:'奔放'}[tmp]+'／結末：'+p.fate;
var sex=false;
if(SM.epiSex&& !soft&& !p.failed&& !p.noSex&&p.cnt.lewd&&S.env.lewd!=='low'&& !HK.SAFE_ON){
var ex=SM.epiSex(wrapS(S,p),p,route);
if(ex){t+='\n\n'+ex.text;why+='／'+ex.why;sex=true;p.cnt.climax+=ex.climax||0;}
}
return{text:t,why:why,sex:sex};
}
function after(S,p){
var rng=S.rng,t=p.tr,fall=p.m.fall/100;
if(p.failed){
var w0={laugh:t.fc*0.6+t.np*0.3+(p.ty==='friend'||p.ty==='lover'?0.4:0),noticed:t.a*0.6+t.caution*0.3,angry:t.cp*0.6+(p.bad?0.3:0),report:(t.cp*0.4+t.a*0.4)*(p.ty==='stalker'?1.8:p.ty==='grudge'?1.3:0.5),counter:Math.max(0,t.a+t.cp-t.ac-0.6)};
return pickW(rng,w0);
}
var lewdN=p.cnt.lewd,remember=p.woke|| !p.erased||(p.erased==='part'&&rng()<0.6);
if(p.cnt.smart&&lewdN===0)return'peace';
if(!remember)return fall>=0.65?'body':'forget';
var w={
angry:(t.cp*0.6+(1-fall)*0.6+(p.bad?0.3:0)-(p.ty==='lover'?0.5:0))*(p.cnt.shame?1.3:1),
report:(t.cp*0.4+t.a*0.4)*(1-fall)*({stalker:1.6,colleague:1.3,grudge:1.2,friend:0.6,lover:0.08}[p.ty])*(p.recorded?1.3:1),
revenge:(t.aggr*0.6+t.cp*0.3)*(p.ty==='grudge'?1.5:p.bad?1.1:0.6)*(1-fall*0.6),
counter:(t.a*0.6+t.cp*0.3)*(p.woke?1.4:0.5)*(1-fall*0.5),
sweet:(p.ty==='lover'?1.2:0)+(p.ty==='lover'?t.np*0.4+fall*0.5:0),
shy:t.ac*0.7*(1-fall*0.4),
fall:Math.pow(fall,2)*2.2,
couple:(p.ty==='friend'||p.ty==='colleague')&&fall>0.25&&fall<0.75?(t.np+t.fc)*0.5:0,
depend:p.bad&&fall>0.55?fall*1.3:0,
confused:(t.ac*0.35+t.np*0.25+t.caution*0.2+Math.max(0,0.45-Math.abs(fall-0.4)))*({lover:0.7,friend:1.25,colleague:1.15,grudge:0.7,stalker:0.6}[p.ty]||1)*(p.halfAware||p.guilt?1.3:1)*(1-t.cp*0.4),
dazed:((p.cnt.climax>=3?0.55:p.cnt.climax>=1?0.35:0.12)+p.maxDepth/260+fall*0.3)*(1-t.cp*0.5)*(p.wokeCum||p.swept?1.25:1)*(lewdN?1:0.6),
accept:(t.np*0.45+t.fc*0.2+fall*0.3+({lover:0.45,friend:0.3,colleague:0.2}[p.ty]||0))*(p.bad?(fall>0.5?0.45:0):1)*(1-t.cp*0.4)
};
if(p.consent){w.report*=0.15;w.angry*=0.6;w.revenge*=0.4;w.counter*=0.5;w.accept*=1.4;w.confused*=1.15;}
if(p.cnt.smart&&lewdN<=1)w.peace=0.6;
if(p.noSex){w.couple=0;w.fall=0;w.depend=0;}
if(p.reportedNow)return'report';
if(p.swept){w.angry*=0.15;w.report=0;w.revenge*=0.2;w.counter=0;w.shy*=0.4;w.fall=w.fall*2+1;if(p.bad)w.depend=(w.depend||0)+0.8;w.accept*=1.3;w.dazed*=1.2;w.confused*=0.7;}
w.fall*=HK.Dark.f(S,'fall');if(w.depend)w.depend*=HK.Dark.f(S,'fall');
if(p.fled){w.shy+=0.4;w.angry+=0.2;w.fall*=0.5;w.sweet*=0.5;w.confused+=0.3;w.accept*=0.5;}
if(p.noSex&& !p.cnt.lewd)w.accept*=0.6;
if(HK.Attr&&p.will){var wk=HK.Attr.willK(p);if(wk<1){w.fall=0;w.depend=0;w.counter*=1.3;}else if(wk>1){w.fall*=wk*wk;if(w.depend)w.depend*=wk;}}
return pickW(rng,w);
}
function pickW(rng,w){
var ks=Object.keys(w).filter(function(k){return w[k]>0;});
if(!ks.length)return'forget';
return HK.weighted(rng,ks,function(k){return Math.pow(w[k],2);});
}
function whyAfter(p,route){
var t=p.tr,bits=[];
if(route==='forget'||route==='body')bits.push(p.erased==='full'?'記憶は消された':'記憶は消えかけていた');
else if(p.failed)bits.push('催眠にかからなかった');
else bits.push(p.woke?(p.wokeCum||p.wokeMid?(p.wokeMid?'行為の最中に我に返った':snapWord(p)+'我に返った')+(p.swept?'。それでも流された':p.reportedNow?'。その場で通報した':p.fled?'。逃げ出した':''):'途中で目を覚ました'):p.erased?'記憶は消えきらなかった':'記憶は消されなかった');
bits.push('快楽堕ち '+Math.round(p.m.fall));
bits.push({confused:'AC・NP・慎重さと、ほどほどの堕ち',dazed:'深さ '+Math.round(p.maxDepth)+'・'+W_CL+' '+p.cnt.climax+'回',accept:'NP・FCと、'+p.T.label+'への情',angry:'CP '+Math.round(p.eg.CP),report:'CP・A（正義感と冷静さ）',revenge:'攻撃性とCP',counter:'A・CP（冷静さと意志の強さ）',sweet:'相手が恋人・NP',shy:'AC '+Math.round(p.eg.AC),fall:'快楽に呑まれた',couple:'NP・FCと、ほどよい堕ち',depend:'憎しみと快楽',laugh:'FC・NP',noticed:'A・慎重さ',peace:'平和な暗示だけだった',forget:'',body:'体に暗示が残った'}[route]||'');
if(p.recorded)bits.push('録画されていた');
if(p.consent)bits.push('合意の上の催眠プレイ');
return bits.filter(Boolean).join('／');
}
function finish(S,input,T,HY){
T.forEach(function(p){
p.notes.push('かけた人：'+p.h+'（'+p.T.label+'・'+p.M.name+'）・かかりやすさ '+Math.round(p.sus*100)+'％・最大の深さ '+Math.round(p.maxDepth));
if(!p.failed)p.notes.push('受け入れた暗示：'+(p.got.length?p.got.map(function(k){return SM.SUG[k].label;}).filter(function(x,i,a){return a.indexOf(x)===i;}).join('・'):'なし')+'（半分 '+p.cnt.part+'・拒んだ '+p.cnt.ng+'）'+(p.cnt.climax?'・'+W_CL+' '+p.cnt.climax+'回':''));
p.notes.push('弱い暗示：'+p.weak.map(function(k){return SM.SUG[k].label;}).join('・')+'・快楽堕ち '+Math.round(p.m.fall)+(p.trigger?'・合図の言葉が残った':'')+(p.recorded?'・録画された':''));
});
if(HY){HY.fate=T.length+'人中'+HY.cnt.ok+'人にかけた';HY.notes.push('催眠をかけた相手：'+T.map(function(p){return p.name+'（'+(p.failed?'かからず':p.fate)+'）';}).join('、'));}
var one=T.length===1?T[0]:null;
var hit=T.filter(function(p){return!p.failed;});
var ET=SM.END_TITLE||{};
var title=one?(one.failed?one.name+'は'+one.h+'の催眠にかからなかった。':one.name+'は'+one.h+'（'+one.T.label+'）の催眠にかかった。')+'結末'+(ET[one.route]?'「'+ET[one.route]+'」':'')+'：'+one.fate+'。'
:'催眠にかかったのは'+T.length+'人中'+hit.length+'人。'+T.map(function(p){return p.name+'＝'+p.fate;}).join('、')+'。';
var lines=T.map(function(p){return p.name+'：'+p.h+'（'+p.T.label+'）に'+p.M.name+'で――'+(p.failed?'かからなかった':'最大の深さ '+Math.round(p.maxDepth)+'・暗示 '+p.cnt.ok+'/'+(p.cnt.ok+p.cnt.part+p.cnt.ng))+'→'+p.fate;});
var top=hit.slice().sort(function(a,b){return b.m.fall-a.m.fall;})[0];
if(top&&T.length>1)lines.push('いちばん堕ちたのは'+top.name+'（快楽堕ち '+Math.round(top.m.fall)+'）');
var rows=T.slice().sort(function(a,b){return b.maxDepth-a.maxDepth;}).map(function(p){
return{i:p.i,rank:'',cells:[p.T.label,p.M.name,Math.round(p.sus*100)+'％',String(Math.round(p.maxDepth)),p.failed?'—':p.cnt.ok+'/'+(p.cnt.ok+p.cnt.part+p.cnt.ng),String(p.cnt.climax),String(Math.round(p.m.fall)),p.fate]};
});
var sumOk=T.reduce(function(s,p){return s+p.cnt.ok;},0),sumCl=T.reduce(function(s,p){return s+p.cnt.climax;},0);
return ST.result(S,input,{
ending:{title:title,kind:hit.length?'over':'ok',lines:lines},
estats:one?[['かかりやすさ',Math.round(one.sus*100)+'％'],['最大の深さ',String(Math.round(one.maxDepth))],['受け入れた暗示',one.cnt.ok+'個'],[W_CL,one.cnt.climax+'回']]:[['かかった人',hit.length+'/'+T.length+'人'],['受け入れた暗示',sumOk+'個'],[W_CL,sumCl+'回'],['いちばん堕ちた',top?top.name:'—']],
table:{title:'催眠の結果',hint:'深さ40でかかり、70で深くかかる。暗示は「受け入れた／全部」。快楽堕ちが高いほど、終わったあとに怒るより求めてしまう。',cols:['かけた人','かけ方','かかりやすさ','最大の深さ','暗示',W_CL,'堕ち','結末'],rows:rows},
meters:[{label:'深さ',color:'--accent'},{label:'快感',color:'--pine',dash:true},{label:'快楽堕ち',color:'--love'},{label:'警戒心',color:'--warn',dash:true}],
meta:T.map(function(p){return p.T.label;}).filter(function(x,i,a){return a.indexOf(x)===i;}).join('・')+'・暗示'+S.env.rounds+'回',
summary:'催眠：'+T.map(function(p){return p.name+'='+p.fate;}).join('、')
});
}
})();
});
;
/* ==== js/solo-locker-more.js ==== */
HK.Load.def(175,'js/solo-locker-more.js',function(){
(function(){
'use strict';
var HK=window.HK,LK=HK.LOCKER;
if(!LK)return;
function add(arr,s){if(arr)Array.prototype.push.apply(arr,s.split('|'));}
add(LK.INTRO,'気がつくと、{a}は冷たいスチールの壁に背中を押しつけられていた。正面には{b}の顔。息がかかるほど近い。足元の通気口から、甘い匂いの霧が這い上がってきた。|鈍い頭痛とともに目を開けると、真っ暗だった。肩も、胸も、膝も、全部が{b}に触れていた。「……{b}？」「……うん。たぶん、ロッカーの中｜……ああ。おそらく、ロッカーの中だ｜……はい。たぶん、ロッカーの中です」|{a}が身じろぎすると、同時に{b}も身じろぎした。二人は向かい合わせのまま、縦長の箱の中に閉じ込められていた。どこかで、しゅう、とガスの抜ける音がした。|目覚めて最初に感じたのは、{b}の体温だった。それから、甘ったるい桃色の匂い。扉の細い隙間から、白い光が一本だけ差し込んでいた。|「……近い｜＝｜……近いです」「……こっちの台詞｜……こちらの台詞だ｜……こちらの台詞です」――ロッカーの中で目を覚ました{a}と{b}は、互いの鼻先が触れそうな距離で、同時に顔を赤くした。|{a}は夢だと思った。けれど、頬に当たる{b}の吐息は、やけに熱くて、やけに本物だった。');
add(LK.SPEAKER,'扉の外から、くぐもった声がした。「お目覚めかな。そのガスは、時間が経つほど効いてくる。急ぎたまえ」|スピーカーから、場違いに明るいジングルが流れた。「媚薬ロッカー、スタート！　仲良くね！」|天井の小さな液晶に、カウントダウンが表示された。その下に一行だけ。『理性は大切に』|ロッカーの内側に、手書きの貼り紙があった。「出口は一つ。ガスは止まらない。健闘を祈る」|スピーカーの向こうで、誰かが笑いをこらえている気配がした。「それでは、ごゆっくり」|機械的な女性の声が告げた。「ガス濃度、上昇を開始します。ご気分が悪くなった場合も、そのままお待ちください」');
add(LK.BIND.both,'二人の手首は、それぞれ背中で結束バンドに締められていた。動けば動くほど、胸と胸が擦れ合う。|手錠の鎖が、二人の間でつながれていた。{a}が腕を引けば、{b}の腕も引き寄せられた。|両手は後ろ手に、ふわふわの毛皮つきの手錠で拘束されていた。ふざけた見た目のくせに、びくともしない。|二人とも、手首をロッカーの奥の金具にベルトで固定されていた。身動きできるのは、腰から下だけだった。');
add(LK.BIND.one,'{a}の手首だけが、ロッカーの天井近くのバーに吊るされていた。{b}が少し動くたびに、{a}の体が無防備に揺れた。|{a}は後ろ手に手錠をかけられていた。{b}の手だけが、自由に動いた。|拘束されているのは{a}だけだった。それも、ちょうど{b}の腰の高さで、両手首をまとめて。|{a}の両手は、革のベルトで背中にまとめられていた。「なんで、こっちだけ……｜なぜ、こちらだけ……｜どうして、こちらだけなんですか……」――{b}の手は、自由なままだった。');
add(LK.BIND.none,'縛られてはいなかった。けれど、腕を下ろすと、どうしても{b}の腰に手が当たってしまう。|拘束はない。代わりに、身をよじる隙間もない。二人は気をつけの姿勢のまま、正面から密着していた。|両手は自由だった。ただ、狭すぎて、自分の顔を掻くのにも{b}の胸を押しのけなければならなかった。|手は動かせた。だからこそ、どこに置けばいいのか、二人とも分からなかった。');
var G={};
LK.GIMMICK.forEach(function(g){G[g.id]=g;});
if(G.cuff){
add(G.cuff.try,'{a}は手首をひねり、手錠の隙間から指を抜こうとした。|{a}は{b}の背中越しに、{b}の手錠の鍵穴を探った。二人の頬がぴったりとくっついた。|{a}は手錠の鎖をロッカーの角に何度も打ちつけた。|{a}は靴の中に隠していた細い針金を、つま先で器用に引っぱり出した。');
add(G.cuff.ok,'手錠の片方がするりと抜けた。{a}は思わず声を上げそうになって、{b}に口を塞がれた。|カチャン、と金属音が響いた。ようやく、手首が軽くなった。|鍵穴の奥で、何かが噛み合う手応えがあった。手錠が、音もなく開いた。|手首に赤い痕を残して、手錠が外れた。{a}は痺れた指を、何度も握っては開いた。');
add(G.cuff.ng,'指先が{b}の腰に触れてしまい、{a}は驚いて針金を取り落とした。|ガスのせいで指がうまく動かない。鍵穴が、何重にもぶれて見えた。|手錠が手首に食い込んだだけだった。{a}は小さく呻いた。|あと少しというところで、{b}が身じろぎした。その拍子に、針金がどこかへ消えた。');
}
if(G.code){
add(G.code.try,'{a}はダイヤルを回しながら、ぶつぶつと数字を唱えた。|{a}は貼り紙のヒントを、{b}の肩越しに何度も読み返した。「二人が初めて会った日……？｜二人が初めて会った日……か？｜二人が初めて会った日……でしょうか？」|{a}は思いつく限りの記念日を、片っ端からダイヤルに打ち込んだ。|{a}は目を閉じて、ダイヤルが噛み合う手応えを指先で探った。');
add(G.code.ok,'最後の数字を合わせた瞬間、ロックが外れる重い音がした。|「……開いた｜＝｜……開きました」{a}は自分でも信じられないという顔をした。|四つの数字が揃い、ダイヤル錠がぱちんと弾けた。|ダイヤルを一つずらした途端、扉の内側で歯車が回り出した。');
add(G.code.ng,'{a}は数字を一つ間違えた。ブザーが鳴り、ガスの噴き出す音が強くなった。|数字の6と9を見間違えた。ガスで、目の焦点が合わない。|{a}がダイヤルを回すたびに、肘が{b}の胸に当たった。三回目で、数字を忘れた。|「違う｜＝｜違います」「じゃあこれ｜ではこれだ｜ではこれです」「それも違う｜＝｜それも違います」――二人の言い合いの間にも、ガスは濃くなっていった。');
}
if(G.puzzle){
add(G.puzzle.try,'{a}はからくり箱を胸の前で抱え、板を一枚ずつ指で押していった。|{a}は箱を{b}に持たせ、自分は後ろから手を回して板をずらした。|{a}はからくり箱を耳に当て、中で何かが転がる音を聞いた。|{a}は箱をひっくり返し、底の模様の向きを確かめた。');
add(G.puzzle.ok,'かちん、と軽い音がして、箱の引き出しがせり出した。中には、小さな銀色の鍵。|最後の板が滑った瞬間、箱が花のように開いた。|{a}は息を詰めて最後の板を押した。箱の中から、鍵が転がり落ちた。|「これだ｜＝｜これです」――箱の隠し引き出しから、鍵が顔をのぞかせた。');
add(G.puzzle.ng,'板を押しすぎて、最初からやり直しになった。|箱が手から滑り、二人の太腿の間に挟まった。取ろうとすると、どうしても際どいところに手が入った。|からくり箱は、何度やっても同じところで止まった。|{a}は手順を思い出そうとしたが、{b}の吐息がうなじにかかって、頭が真っ白になった。');
}
if(G.vent){
add(G.vent.try,'{a}は爪先立ちになり、通気口のネジに指をかけた。体ごと{b}に預ける格好になった。|{a}は{b}の肩に足をかけ、通気口に手を伸ばした。|{a}はベルトのバックルをドライバー代わりにして、ネジを回し始めた。|{a}は通気口の格子に指を差し込み、力任せに引っぱった。');
add(G.vent.ok,'最後のネジが、ころりと落ちた。カバーを外すと、奥にレバーが見えた。|格子が外れ、冷たい空気が一筋流れ込んだ。その奥に、開閉レバーがあった。|ネジが外れた瞬間、通気口の奥から非常灯の緑の光が漏れた。|{a}の指が、ついに通気口の奥のレバーに届いた。');
add(G.vent.ng,'バックルがネジ山から滑り、甲高い音が響いた。|背伸びした{a}の体が{b}の上でずり落ち、二人して変な声を出した。|通気口から、ガスが顔に直接吹きつけてきた。{a}は咳き込んで、手を離した。|ネジは一本だけ回った。残りの三本は、溶接されたように動かなかった。');
}
if(G.riddle){
add(G.riddle.try,'スピーカーが問いかけた。「パンはパンでも、食べられないパンはなーんだ」|液晶に、三つの数字と一つの空欄が表示された。「\u2060空欄に入る数を答えよ」|スピーカーが、やけに色っぽい声でなぞなぞを読み上げた。|「二人の好きなものの頭文字をつなげよ」――液晶の文字が、ガスでにじんで見えた。');
add(G.riddle.ok,'「……フライパン」{a}が答えると、ロッカーのどこかで錠が外れた。|スピーカーが拍手の効果音を流した。「お見事」|{a}の答えに、液晶が緑色に光った。|「正解です」――機械的な声が、なぜか少し悔しそうに聞こえた。');
add(G.riddle.ng,'{a}が答える直前、{b}が太腿を擦り寄せてきた。答えは、甘い吐息になって消えた。|「不正解。ガス濃度を上げます」――スピーカーの声が、楽しそうだった。|{a}は答えを思いついたのに、口から出たのは{b}の名前だった。|二人で同時に別の答えを言ってしまい、どちらも無効になった。|{a}は答えを口にしかけて、{b}の吐息が首にかかった瞬間に言葉を失った。スピーカーが「時間切れ」と告げた。|{a}の声は甘い霧で掠れていて、機械には聞き取ってもらえなかった。|{a}は自信満々に答えたが、液晶は赤く光った。「……今の、絶対合ってたのに｜……今のは、絶対に合っていたはずだ｜……今のは、絶対に合っていたはずです」');
}
if(G.kiss){
add(G.kiss.try,'扉のセンサーが点滅した。『キス、残り三十秒』|液晶にハートマークが表示された。『唇を重ねてください。照れは認識しません』|ロッカーの内側に、唇の形をしたセンサーが二つ並んでいた。|スピーカーが告げた。「キスで開きます。なお、ほっぺは不可」');
add(G.kiss.ok,'センサーのハートが満タンになり、扉のロックが外れた。二人の唇は、それでもまだ離れなかった。|三十秒のカウントが終わっても、二人は唇を重ねたままだった。扉は、とっくに開いていた。|「認証完了」の声が、ずいぶん遠くに聞こえた。|ピッ、と軽い音がした。扉が開いたことに、二人が気づいたのは少し後だった。');
add(G.kiss.ng,'二人は唇を寄せては離れ、を三回繰り返した。センサーは一度も反応しなかった。|キスの途中で{b}が笑ってしまい、カウントがリセットされた。|「……やっぱり無理｜……やはり無理だ｜……やっぱり無理です」――{a}は真っ赤な顔で、顔をそむけた。|二十九秒目で、{a}の息が続かなくなった。');
}
if(LK.PLOT&&LK.PLOT.hide){
add(LK.PLOT.hide.cuff,'{a}は自分の手錠の鍵を、そっと口の中に隠した。|{a}は拾った針金を、わざと通気口の隙間に落とした。');
add(LK.PLOT.hide.code,'{a}はヒントの紙を、こっそり裏返した。|{a}は正しい数字が分かっていたのに、一つだけずらしておいた。');
add(LK.PLOT.hide.puzzle,'{a}は箱の最後の板を、知らないふりで押さえつけていた。|{a}はからくり箱を、わざと足元の奥に蹴りやった。');
add(LK.PLOT.hide.vent,'{a}は「届かない｜＝｜届きません」と言いながら、わざと背伸びしなかった。|{a}は外したネジを、もう一度こっそり締め直した。');
add(LK.PLOT.hide.riddle,'{a}は答えを言いかけた{b}の口を、自分の唇で塞いだ。|{a}は「たぶん違う｜おそらく違う｜たぶん違います」と言って、{b}の正しい答えを止めた。');
add(LK.PLOT.hide.kiss,'{a}はキスの途中で、わざと少しだけ唇をずらした。|{a}は「もう一回｜もう一回だ｜もう一回お願いします」と言って、カウントが終わる直前に離れた。');
}
add(LK.QUIET,'どちらかの喉が、ごくりと鳴った。二人とも、それが自分ではないふりをした。|{a}は目をつぶった。見なければ平気だと思った。かえって、{b}の匂いと体温だけがはっきりした。|ロッカーの外で、時計の秒針がやけに大きく聞こえた。|{b}の髪が、{a}の頬をくすぐった。払いのける手すら、自由にならなかった。|二人は互いの肩に額をのせたまま、じっと嵐が過ぎるのを待った。過ぎる気配はなかった。|{a}は話題を探して、「……今日、何食べた？｜……今日、何を食べた？｜……今日、何を食べましたか？」と訊いた。{b}は答えられなかった。|汗が一筋、{a}のこめかみから首へ伝った。{b}の視線が、それを追いかけた。|狭い箱の中で、二人の膝がぶつかった。どちらも、膝を引かなかった。|{a}はわざと難しいことを考えようとした。九九の七の段で、三回間違えた。|{b}が小さく咳払いをした。その振動が、密着した胸を通して{a}に伝わった。');
add(LK.KISS_OK,'「早く終わらせよう｜早く終わらせるぞ｜早く終わらせましょう」と言ったのは{a}だった。唇が触れた瞬間、二人ともその言葉を忘れた。|{b}は目を閉じて、少しだけ顎を上げた。{a}は、ゆっくりと唇を重ねた。|二人の唇が触れた。三十秒は、思っていたよりずっと長くて、思っていたよりずっと短かった。|「数えてて｜数えていろ｜数えていてください」と{a}が言った。{b}は数えるのを、十二で忘れた。');
add(LK.OUTSIDE,'ロッカーの外で、何かが倒れる音がした。その衝撃で、扉のロックが外れた。|「点検でーす」――作業着の男が、何も知らずに扉を開けた。そして、すぐに閉めた。|ガスの噴き出す音が、ぷすん、と止まった。続いて、扉のロックが外れる音がした。|停電だった。電子錠が、非常モードで一斉に解除された。');
add(LK.SURGE,'ガスの噴き出し口が、一斉に開いた。視界が一瞬で桃色に染まった。|スピーカーが「ボーナスタイム！」と叫び、ガスの勢いが倍になった。|ロッカーごと誰かに運ばれているらしい。揺れるたびに、二人の体が擦れ合った。|天井から、ぽたり、と甘い雫が落ちてきた。それが{a}の首筋を伝うと、{a}は思わず声を漏らした。|ロッカーの中の温度が急に上がった。汗で、服が肌に張りついた。|足元の床が振動し始めた。止まる気配はなかった。|照明が赤く点滅した。警告音が、なぜか鼓動と同じリズムだった。|扉の隙間がわずかに狭まり、二人はさらに押しつけられた。');
add(LK.CALM,'ガスの噴き出しが、一瞬だけ止まった。二人は大きく息を吐き、顔を見合わせた。|{a}は{b}の肩に額を押しつけて、ゆっくり十数えた。少しだけ、頭がはっきりした。|{b}が「大丈夫、大丈夫｜大丈夫、大丈夫だ｜大丈夫です。大丈夫ですから」と小さく繰り返した。その声で、{a}は少し落ち着いた。|扉の隙間から、外の冷たい空気がすっと入ってきた。|{a}は自分の太腿をつねった。痛みで、ほんの少しだけ正気が戻った。|二人は示し合わせたように、同時に深呼吸した。三回目で、同時に笑ってしまった。');
var A=LK.ACT;
add(LK.ACCEPT,'{b}は{a}の手を、振りほどくどころか、もっと強く自分に押しあてた。|{b}は小さく息を吐いて、{a}の肩に頬を預けた。それが答えだった。|{b}は黙って目を閉じた。睫毛が、小刻みに震えていた。|{b}の手が、{a}の背中にそっと回された。|{b}は「……ずるい｜＝｜……ずるいです」と呟いて、自分から{a}に唇を寄せた。|{b}の体から、ふっと力が抜けた。');
add(LK.REFUSE,'{b}は首を振った。「だめ。今は、だめ｜だめだ。今は、だめだ｜だめです。今は、だめです」|{b}は{a}の胸に手をついて、わずかに距離を取った。「……ガスのせいだよ｜……ガスのせいだ｜……ガスのせいです」|{b}は{a}の手首を、自分の腰からそっと外した。「出てから。ね｜出てからだ。いいな｜ね。出てからにしましょう」|{b}は唇を引き結び、{a}から顔をそむけた。耳まで真っ赤だった。|{b}は「こら｜＝｜いけませんよ」と小さく叱って、{a}の額を指で弾いた。|{b}は深く息を吸って、「先に、仕掛け｜先に、仕掛けだ｜先に、仕掛けです」とだけ言った。');
add(LK.PASSIVE,'{b}は止めようと口を開いたが、出てきたのは甘い吐息だけだった。|{b}は{a}の服を掴んで押し返そうとして、逆に引き寄せてしまった。|{b}の「やめて」は、どんどん小さくなっていった。|{b}は目を閉じた。拒む理由を探しているうちに、拒むのを忘れた。');
var AS=LK.ACCEPT_SAY;
add(AS.proud,'「……文句は、出てから聞く」|「……好きにしろ。どうせ、こっちも同じだ」|「止まれないなら、止まらなくていい」|「……後で後悔しても知らねえぞ」');
add(AS.stern,'「……わかった。もう、拒まない」|「……こうなった以上、半端にはしない」|「……誰にも言うな。それだけだ」|「……正直に言う。私も、限界だった」');
add(AS.tsun,'「し、仕方ないから！　今だけだから！」|「……ばか。もっと早く言いなさいよ」|「ちょ、ちょっとだけなら……いいけど……」|「べ、別にあんたのためじゃないし……ガスのせいだし……」');
add(AS.gentle,'「大丈夫。わたしも、同じ気持ちだから」|「無理しないで。……ほら、こっち」|「ゆっくりね。ゆっくり」|「いいよ。……全部、受け止めてあげる」');
add(AS.devoted,'「ずっと、こうしてほしかったんです……」|「あなたが望むなら、何でも」|「離さないで、ください……」|「わ、私で……いいんですか……？」');
add(AS.cool,'「……もう、取り繕うのはやめる」|「……隠しても無駄だな。お互いに」|「……来いよ。こっちも、余裕がない」|「……今だけは、何も考えないことにする」');
add(AS.free,'「ちょうど同じこと考えてた！」|「ねえ、もっとくっつこ？」|「どうせなら楽しもうよ、ね？」|「いいよいいよ、全部ガスのせいにしちゃお！」');
add(AS.shy,'「は、恥ずかしい、けど……いや、じゃない、です……」|「……う、うん……」|「め、目、つぶってて、ください……」|「や、やさしく、なら……」');
add(AS.polite,'「……では、失礼して」|「わたくしでよろしければ……」|「……お気持ち、確かに受け取りました」|「どうか、お手柔らかに……」');
var RS=LK.REFUSE_SAY;
add(RS.proud,'「離れろ。……今は、それが一番マシだ」|「勘違いするな。お前が嫌なわけじゃない」|「手を出したら、出た後でぶん殴る」|「……集中しろ。出口が先だ」');
add(RS.stern,'「待て。……ここで流されたら、二人とも後悔する」|「手を引け。今のお前は、お前じゃない」|「……気持ちは分かる。だが、今じゃない」|「深呼吸しろ。私も、そうする」');
add(RS.tsun,'「な、何考えてんのよ！　出てからにしなさいよ！」|「ば、ばかばか！　今そういう空気じゃないでしょ！」|「……あとで、ちゃんと言ってくれたら、考える……」|「触らないで！　……い、嫌なわけじゃ、ないけど……」');
add(RS.gentle,'「ね、ちょっとだけ我慢しよう。一緒に」|「つらいね。でも、出てからにしよ？」|「大丈夫、すぐ出られるから。ね」|「手、繋ごうか。それだけにしよう」');
add(RS.devoted,'「あ、あなたのためにも……今は、だめです……」|「わ、私、耐えますから……一緒に……」|「ほ、本当は……でも、だめです……っ」|「出たら……その時は、ちゃんと……」');
add(RS.cool,'「落ち着け。今動いても、何もいいことはない」|「……ガスが言わせてるだけだ。分かってるだろ」|「手を止めろ。……先に出口だ」|「それは、ここを出てから考えよう」');
add(RS.free,'「だーめ！　出るまでおあずけ！」|「ちょ、くすぐったいって！　今は脱出優先！」|「あとで！　あとでね！」|「もー、ガスに負けすぎ！」');
add(RS.shy,'「ま、まって、まってください……っ」|「い、今は……こわい、です……」|「そ、そういうのは……出て、から……」|「……っ、だ、だめ……」');
add(RS.polite,'「恐れ入りますが、今はご辛抱ください」|「お気持ちは嬉しいのですが……ここでは」|「申し訳ありません。今は、仕掛けを優先させてください」|「……後ほど、改めて」');
add(LK.ONE.help,'{b}は発情した{a}の髪を撫でて、「もう少し、もう少し｜もう少しだ、もう少しだ｜もう少しです、もう少しです」と言い聞かせた。|{b}は{a}の手を握って、自分の胸に当てさせた。「ほら、深呼吸。一緒に｜ほら、深呼吸しろ。一緒にだ｜ほら、一緒に深呼吸しましょう」|{b}は{a}の熱い額に自分の額を合わせて、冷ますようにじっとしていた。|{b}は{a}の耳元で、落ち着いた声で数を数え続けた。');
add(LK.ONE.tempted,'{b}は首を振って正気を保とうとした。けれど、{a}の潤んだ目を見たら、首を振るのをやめてしまった。|{a}の甘い声を聞いているうちに、{b}の呼吸も浅くなっていった。|{b}は「だめ、だめ｜だめだ、だめだ｜だめです、だめです」と言いながら、{a}の頬に触れた手を離せなかった。|{a}の熱が、密着した体越しに{b}にもうつっていった。');
add(LK.SERVANT.hold,'{a}は主の肩越しに壁を睨みつけ、ひたすら呼吸を数えていた。|{a}は自分の腕に爪を立て、主から意識を逸らそうとした。「……失礼なことは、しない｜＝｜……失礼を、いたしません」|{a}は額に脂汗を浮かべながら、主の体に触れないよう、ぎりぎりのところで腰を引き続けた。|{a}「お願い、私を見ないで。……目が合ったら、耐えられない｜頼む、私を見るな。……目が合えば、耐えられない｜どうか、私を見ないでください。……目が合えば、耐えられません」');
add(LK.SERVANT.break,'{a}は低く呻いて、主の首筋に顔を埋めた。「ごめん……もう……｜すまない……もう……｜申し訳、ありません……もう……」|{a}の手が、震えながら主の腰を引き寄せた。「叱るのは、後でいくらでも聞くから｜叱責は、後でいくらでも受ける｜お叱りは、後でいくらでも受けます」|「……もう、無理｜……もう、無理だ｜……もう、無理です」――{a}は主の唇を、許しも得ずに奪った。|{a}は主の名前を、初めて敬称をつけずに呼んだ。');
add(LK.SERVANT.order,'{b}は{a}の耳元で囁いた。「よく我慢したね。……ご褒美｜よく耐えた。……褒美だ｜よく耐えましたね。……ご褒美です」|{b}は{a}の頬に手を添え、「顔を上げて。私を見て｜顔を上げろ。私を見ろ｜顔を上げてください。私を見てください」と言った。{a}の目から、最後の理性が消えた。|{b}は「いいよ｜許す｜許します」とだけ言った。それで十分だった。|{b}は{a}の手を取り、自分の腰に導いた。「命令。触って｜命令だ。触れろ｜命令です。触れてください」');
add(LK.PLOT.reveal,'{a}は{b}の耳元で囁いた。「ガス、止める方法も知ってるよ。……止めないけど｜ガスを止める方法も知っている。……止めないが｜ガスを止める方法も知っています。……止めませんけど」|{a}は悪びれもせずに言った。「鍵、最初から持ってたんだ｜鍵は、最初から持っていた｜鍵、最初から持っていたんです」|{a}は甘い霧の中で、{b}の手を握った。「ずっと、二人きりになりたかった｜＝｜ずっと、二人きりになりたかったんです」|{a}は悪びれもせずに、この部屋を借りたのは自分だと白状した。|{a}は{b}の唇に指を当てた。「大声出さないで。……誰も来ないから｜大声を出すな。……誰も来ない｜大声を出さないでください。……誰も来ませんから」|{a}は「怒った？｜怒ったか？｜怒りましたか？」と小首をかしげた。その目は、少しも反省していなかった。');
add(LK.PLOT.push,'{a}は{b}が目を覚ます前から、{b}の胸に頬を寄せていた。|{a}は「怖い｜＝｜怖いです」と言って{b}にしがみついた。その声は、少しも怖がっていなかった。|{a}は自分からガスの噴き出し口に顔を向け、深く息を吸った。|{a}は{b}の手を取って、そっと自分の腰に回させた。');
var B=LK.BED;
add(B.timeout,'ブザーとともに扉が開いた。外の部屋の真ん中には、清潔なシーツの大きなベッドが一つ。二人は顔を見合わせることもなく、そちらへ歩いた。|時間切れのアナウンスが流れ、ロックが外れた。けれど二人の足は、出口とは逆の方へ向かった。|扉が勝手に開いた。外の空気は冷たかった。二人の体は、少しも冷めなかった。|制限時間が過ぎ、ロッカーの扉がゆっくりと開いた。二人はもつれ合ったまま、外の床に崩れ落ちた。');
add(B.start,'扉が開くと同時に、二人は互いの手を掴んだ。どちらから、というのは分からなかった。|外に出た二人の目に入ったのは、出口の扉ではなく、部屋の隅の大きなベッドだった。|外に出られた安堵は、一秒ももたなかった。二人はロッカーの扉が閉まるのも待たずに、唇を重ねた。|二人はよろめきながらロッカーを出た。外の部屋は静かで、ベッドが一つだけ置かれていた。|扉が開いた。二人は顔を見合わせ、それから同時に、出口ではない方へ一歩踏み出した。|ロッカーから出た瞬間、{a}は{b}の腕を掴んで引き寄せた。もう、狭い箱の言い訳は要らなかった。');
var F=LK.AFTER;
add(F.clean,'外の空気を吸った瞬間、二人は膝から崩れ落ちた。そして、なぜか大笑いした。|二人は出口の前で一度だけ振り返った。ロッカーは、何事もなかったように静かだった。|「お疲れ｜＝｜お疲れさまです」「……お疲れ｜＝｜……お疲れさまです」――二人はそれだけ言って、別々の方向に歩き出した。少しだけ、名残惜しそうに。|扉を出た瞬間、{a}は{b}の背中をばしんと叩いた。「よく耐えた！｜＝｜よく耐えましたね！」「そっちこそ｜そちらこそだ｜そちらこそです」');
add(F.near,'二人は無言で出口に向かった。並んで歩く手が、一度だけ触れて、すぐに離れた。|{b}は「……あの時、止めてくれてありがとう｜……あの時、止めてくれて感謝する｜……あの時、止めてくださってありがとうございます」と小さく言った。{a}は聞こえないふりをした。|外に出た{a}は、自分の手のひらをじっと見つめた。さっき{b}に触れかけた手だった。|「さっきのは、なかったことに｜さっきのは、なかったことにする｜さっきのは、なかったことにしましょう」「……うん｜……ああ｜……はい」――二人とも、なかったことにはできそうになかった。');
add(F.awkward,'帰り道、二人は三歩ずつ距離を空けて歩いた。でも、同じ駅で降りた。|{b}は乱れた襟元を直しながら、{a}と目を合わせないまま「……ガスって怖いね｜……ガスとは怖いものだ｜……ガスって怖いですね」と言った。|外に出た二人は、同時に「さっきのは」と言いかけて、同時に黙った。|翌日、二人はいつも通りに挨拶をした。ただ、少しだけ声が上ずっていた。');
add(F.angry,'{b}は振り返りもせずに出口へ向かった。「……二度と顔を見せないで｜……二度と顔を見せるな｜……二度と顔を見せないでください」|{b}は乱れた服を整え、{a}を睨みつけた。「ガスのせいにしたら、許さないから｜ガスのせいにしたら、許さない｜ガスのせいにしたら、許しませんから」|外に出るなり、{b}は{a}のすねを思い切り蹴った。「これで勘弁してあげる｜これで勘弁してやる｜これで勘弁してあげます」|{b}は一言も口をきかなかった。ただ、別れ際に{a}の頬を軽く叩いていった。');
add(F.plotwin,'{a}は眠る{b}の寝顔を見ながら、次はどの部屋を借りようか考えていた。|{a}は{b}の髪に口づけて、小さく「計画通り｜計画通りだ｜計画通りです」と呟いた。|{a}は{b}が眠ったのを確かめてから、ロッカーの中に隠していた鍵を、そっとゴミ箱に捨てた。|{a}は満ち足りた顔で天井を見上げた。{b}がいつ真相に気づくかは、また別の話だ。');
add(F.plotfail,'{a}は扉が開いた瞬間、心の中で舌打ちした。こんなに早く開くはずじゃなかった。|{b}は{a}の手から鍵を取り上げた。「……最初から持ってたよね、これ｜……最初から持っていたな、これ｜……これ、最初から持っていましたよね」|{a}の計画は、{b}の理性の前にあっさり崩れた。{a}は帰り道、ずっと黙っていた。|{b}は{a}をじっと見た。「……次は、普通に誘って｜……次は、普通に誘え｜……次は、普通に誘ってください」');
add(F.rescue,'ロックが外れたのは、時間切れぎりぎりだった。二人とも、ほとんど意識が朦朧としていた。|扉が開いても、二人はしばらく動けなかった。ガスの名残が、まだ体の芯に燻っていた。|二人は這うようにしてロッカーから出た。床の冷たさが、ありがたかった。|時間切れのブザーが鳴り響いた。扉の向こうでは、救急セットを抱えたスタッフが待っていた。');
function L(s){return s.split('|');}
LK.LOCKED=['{a}は{b}の肩を押し返した。「……ごめん。心に決めた人がいるから｜……すまない。心に決めた人がいる｜……ごめんなさい。心に決めた人がいるんです」','{a}は自分の腕に爪を立てて耐えた。「だめ……あの人以外とは、だめなんだ……｜だめだ……あの人以外とは、だめなんだ……｜だめです……あの人以外とは、だめなんです……」','{a}は{b}から顔を背けたまま言った。「触れたら、きっと後悔する。……好きな人がいるんだ｜触れたら、きっと後悔する。……好きな人がいる｜触れたら、きっと後悔します。……好きな人がいるんです」','{a}は唇を噛んで、熱をやり過ごした。頭の中には、ここにいない一人の顔だけがあった。'];
LK.FC={
inside:{
cold:L('触れ方も、匂いも、いつもと同じだった。違うのは、{c}の胸の奥だけだった。――{o}にとっては、ただのいつもの相手。{c}はそれを知っていて、目を閉じた。|{o}は慣れた手つきで{c}の服を乱した。{c}は、慣れた手つきだと思ってしまう自分が嫌だった。'),
pulse:L('{o}はいつものように{c}を抱き寄せて、それから一瞬、手を止めた。媚薬のせいにしては、胸がうるさすぎた。|{o}は{c}の名前を呼んだ。いつもより優しい声だったことに、{o}自身は気づいていなかった。'),
mutual:L('暗いロッカーの中で、二人は同じことを考えていた。――こんな時でも、相手にとって自分は体だけなんだろうな、と。|{c}が「いつもの、だから｜いつもの、だ｜いつもの、ですから」と囁くと、{o}も「うん、いつもの｜ああ、いつものだ｜はい、いつものです」と返した。二人とも、嘘をついていた。')
},
end:{
cold:L('外に出たあと、{o}は「助かったね｜助かったな｜助かりましたね」と笑った。{c}は、ロッカーの中で言いかけた言葉を、もう一度飲み込んだ。|{o}はいつもどおり、「じゃ、また連絡する｜では、また連絡する｜では、また連絡します」と手を振った。{c}は、それだけで少し泣きそうになった。'),
pulse:L('帰り道、{o}は何度も{c}の方を振り返った。今夜のことが、ただの「いつもの」だったのか、{o}にはもう分からなくなっていた。|{o}はその夜、初めて{c}に「無事に帰れた？｜無事に帰れたか？｜無事に帰れましたか？」とメッセージを送った。'),
mutual:L('扉が開くと、二人は何事もなかったように服を直した。「……いつもの、だったね｜……いつもの、だったな｜……いつもの、でしたね」「うん、いつもの｜ああ、いつものだ｜はい、いつものです」――どちらも、本当のことは言わなかった。|帰り道、{c}は何度も口を開きかけて、そのたびに閉じた。{o}も同じだった。二人の「好き」は、今夜も言葉にならなかった。|{o}は別れ際、「媚薬のせいだから、気にしないで｜媚薬のせいだ、気にするな｜媚薬のせいですから、気にしないでください」と笑った。{c}も「分かってる｜分かっている｜分かっています」と笑った。――二人とも、そのせいにしたかった。|ロッカーを出たあと、{c}がとうとう言った。「媚薬のせいじゃなくて。……ずっと、好きだった｜媚薬のせいではない。……ずっと、好きだった｜媚薬のせいじゃないんです。……ずっと、好きでした」{o}は目を丸くして、それから笑った。「なんだ、私だけじゃなかったんだ｜なんだ、私だけではなかったのか｜なんだ、私だけじゃなかったんですね」|二人は扉が開いたあとも、しばらく手を離さなかった。「……あのさ｜……あのな｜……あの」「……うん｜……ああ｜……はい」――言葉は、それで足りた。')
}
};
LK.REL={
first:{
lover:L('恋人どうしなのに、こんな場所で、こんなに切羽詰まって触れ合うのは初めてだった。|{b}は、{a}のことなら何でも知っているつもりだった。こんなに余裕のない顔は、知らなかった。'),
crush:L('{c}は、ずっとこうしたかった。ガスのせいにできる今しか、手を伸ばせなかった。|{o}は気づいていなかった。触れ合った瞬間、{c}の心臓が、ガスとは関係なく跳ねたことに。'),
mutual:L('{a}は、ガスのせいにして手を伸ばした。{b}も、ガスのせいにしてそれに応えた。本当は二人とも、ずっと前からこうしたかった。|{a}は、これが最初で最後だと思っていた。{b}も、まったく同じことを考えていた。相手にとって自分は何でもない――二人とも、そう信じ込んでいた。|触れた瞬間、{b}の心臓が跳ねた。{a}の心臓も、同じように跳ねていた。密着した胸ごしでは、どちらの鼓動なのか、もう分からなかった。|「……ガスの、せいだから｜……ガスの、せいだ｜……ガスの、せいですから」と{a}が言った。「うん、ガスのせい｜ああ、ガスのせいだ｜はい、ガスのせいです」と{b}も返した。二人とも、相手にではなく、自分に言い聞かせていた。'),
friend:L('いつもの友達の距離が、たった数分で溶けてなくなった。|昨日まで冗談を言い合っていた相手だった。冗談の続きのように、二人は触れ合った。'),
almost:L('ずっと曖昧にしてきた一線を、ガスはあっさりと越えさせた。|どちらも、言わずにおいた言葉があった。言葉より先に、体が答えを出してしまった。'),
tension:L('いつもなら、ここで喧嘩になる距離だった。今は、喧嘩の言葉がひとつも出てこなかった。|大嫌いなはずの相手の体温が、どうしてこんなに心地いいのか。{b}には分からなかった。'),
ex:L('別れてから一度も触れなかった相手だった。{a}は、{b}の弱いところをまだ覚えていた。|どちらも、昔のことは口にしなかった。口にしなくても、体の方が覚えていた。'),
stranger:L('名前しか知らない相手だった。それなのに、体の方が先に相手を覚えていった。|出会って一時間もたたない相手に、{a}は自分から触れていた。ガスのせいだと、何度も心の中で繰り返した。'),
fwb:L('慣れた体だった。ただ、こんな狭い場所で、こんなに切羽詰まって求め合うのは初めてだった。|いつもの相手、いつもの手順。なのに、ガスのせいで、いつもの何倍も熱かった。'),
master:L('主と従者の線引きが、甘い霧の中でにじんでいった。|{a}は、自分が誰に触れているのかを、一瞬だけ忘れた。')
},
after:{
lover:L('帰り道、二人はいつもより強く手を繋いでいた。|次は、ガスなしで。そんな約束を、二人は目だけで交わした。'),
crush:L('{c}は結局、気持ちを言えなかった。それでも、{o}の体温だけは、しばらく忘れられそうになかった。|別れ際、{o}は少しだけ長く{c}を見ていた。{c}は、それに気づかないふりをした。'),
mutual:L('外に出ると、二人は同時に「忘れて｜忘れろ｜忘れてください」と言った。それから、同時に黙り込んだ。忘れてほしくないのは、二人とも同じだった。|別れ際、{a}は「さっきのは……」と言いかけた。{b}は続きを聞くのが怖くて、「わかってる｜わかっている｜わかっています」と遮った。{a}は、何もわかっていない{b}の背中を、黙って見送った。|{b}は「今日のこと、気にしないで｜今日のことは、気にするな｜今日のこと、気にしないでください」と笑ってみせた。{a}は、気にしているのは自分だけなのだと思った。帰り道、{b}もまったく同じことを考えていた。|駅の前で、{a}は意を決して「好きな人、いる？｜好きな人は、いるか？｜好きな人は、いますか？」と聞いた。{b}は「……いるよ。片想いだけど｜……いる。片想いだが｜……いますよ。片想いですけど」と答えた。{a}は笑って頷いた――それが自分のことだとは、思いもしないで。'),
friend:L('翌日、二人はいつも通りに冗談を言い合った。ただ、目が合うと、どちらも一瞬だけ黙った。|友達に戻れるかどうかは、まだ分からなかった。戻りたいのかどうかも。'),
almost:L('帰り道、二人の肩は、何度も触れては離れた。曖昧なままの関係に、今夜ひとつだけ答えが出た気がした。|{a}は何か言いかけて、やめた。{b}は、その続きをずっと待っていた。'),
tension:L('外に出た途端、二人はいつもの調子で言い合いを始めた。ただ、どちらの声にも、いつもの棘がなかった。|次に会ったとき、どんな顔をすればいいのか、二人とも分からなかった。睨み合うには、少し近づきすぎた。'),
ex:L('よりを戻す、という言葉は、どちらの口からも出なかった。ただ、別れ際の手は、なかなか離れなかった。|二人は駅で別れた。振り返ったのは、{b}の方だけだった。'),
stranger:L('連絡先を交換したのは、出口の前だった。どちらから言い出したのかは、覚えていなかった。|名前しか知らなかった相手のことを、{a}は帰り道ずっと考えていた。'),
fwb:L('いつもの関係で片づけるには、今夜は少し熱すぎた。|次の約束は、いつもより早く決まった。'),
master:L('主従の距離は、扉を出た瞬間に元に戻った。ただ、従者の頬の赤みだけが、しばらく消えなかった。|主は何も言わなかった。それが一番の許しだと、従者には分かっていた。')
}
};
LK.REL.pure={
lover:L('帰り道、{a}と{b}は指先だけを絡めて歩いた。ロッカーの中で、最後まで触れずに耐えてくれた相手の手だった。それだけで、二人には十分に温かかった。|外に出ると、{b}は「守ってくれて、ありがとう｜守ってくれて、感謝する｜守ってくださって、ありがとうございます」と言った。{a}は照れくさそうに笑って、{b}の肩に上着をかけた。恋人どうしの距離は、ロッカーに入る前よりも少しだけ近くなっていた。|{a}は「今日のことで、もっと好きになった｜今日のことで、もっと好きになった｜今日のことで、もっと好きになりました」と小さく言った。{b}は返事の代わりに、{a}の手をぎゅっと握った。二人の帰り道は、いつもより少しだけ長かった。'),
crush:L('別れ際、{c}は意を決して「ずっと、あなたのことが好きだった｜＝｜ずっと、あなたのことが好きでした」と打ち明けた。苦しいはずなのに、最後まで自分を気づかってくれた{c}の横顔を、{o}は思い出していた。{o}の答えは、小さな頷きだった。|{o}は、ロッカーの中で一度も自分に触れようとしなかった{c}のことを、帰り道ずっと考えていた。苦しそうなのに、最後まで{o}のことばかり気にしていた。{o}の胸の中で、何かが静かに動き始めていた。|数日後、{o}のほうから{c}を食事に誘った。「あのときのお礼がしたい｜あのときの礼がしたい｜あのときのお礼がしたいんです」――{c}は耳まで赤くなって頷いた。片想いは、もう片方だけのものではなくなりかけていた。'),
almost:L('外に出ると、{a}は「さっきは、ありがとう｜さっきは、助かった｜さっきは、ありがとうございました」と言った。{b}は首を振り、それから少しだけ迷って、{a}の手を取った。曖昧なままだった二人の関係に、ようやく名前がついた。|帰り道、二人の肩は何度も触れては離れた。ロッカーの中では触れずに耐えたぶん、今は隣にいたかった。{b}の「付き合おう｜付き合ってくれ｜付き合ってください」という一言に、{a}は笑って頷いた。'),
friend:L('翌日、二人はいつも通りに冗談を言い合った。ただ{a}は、ロッカーの中で最後まで気づかってくれた{b}の顔を、なかなか忘れられなかった。友達のままでいられるかどうか、{a}にはもう自信がなかった。|外に出てから、{b}は「気づかってくれて、ありがとう｜気づかってくれて、感謝する｜気づかってくださって、ありがとうございます」と言った。{a}は「当たり前のことをしただけ｜当然のことをしただけだ｜当たり前のことをしただけです」と笑った。その笑顔を見て、{b}の胸が少しだけ高鳴った。'),
stranger:L('連絡先を交換したのは、出口の前だった。苦しいはずなのに、最後まで気づかってくれた相手のことが、{a}は少し気になっていた。次に会う約束は、どちらからともなく決まった。|名前しか知らなかった相手のことを、{b}は帰り道ずっと考えていた。あの狭い箱の中で、{a}は一度も{b}を困らせなかった。また会いたい、と{b}は思った。'),
tension:L('外に出た途端、二人はいつもの調子で言い合いを始めた。ただ{b}は知っていた。ロッカーの中で、{a}が一度も自分に手を伸ばさなかったことを。大嫌いなはずの相手を、{b}は少しだけ見直していた。|{a}は「借りができたなんて、思ってないから｜借りができたとは、思っていない｜借りができたとは、思っていませんから」とそっぽを向いた。{b}は鼻で笑ったが、その頬はわずかに赤かった。睨み合うには、二人は少し近づきすぎていた。'),
ex:L('別れ際、{a}は「昔より、優しくなったね｜昔より、優しくなったな｜昔より、優しくなりましたね」と言った。ロッカーの中で、{b}は最後まで{a}を気づかっていた。よりを戻す、という言葉が、二人の喉元まで出かかっていた。|二人は駅で別れた。触れずに耐えた時間のぶんだけ、昔の気持ちがゆっくり戻ってきていた。振り返ったのは、二人とも同時だった。'),
master:L('主従の距離は、扉を出た瞬間に元に戻った。ただ、ロッカーの中で互いを気づかい合った時間のことを、二人とも忘れられそうになかった。{u}と{d}のあいだに、忠誠とは別の想いが芽生えていた。|{u}は{d}に「よく耐えてくれた｜＝｜よく耐えてくださいました」と言った。{d}は深く頭を下げたが、その胸の高鳴りは、忠誠だけでは説明がつかなかった。主と従者は、少しだけ違う目で互いを見るようになった。')
};
LK.MUT={
inside:L('{a}は「こんなことになって、ごめん｜こんなことになって、すまない｜こんなことになって、ごめんなさい」と言った。同じ瞬間に、{b}も「ごめん｜すまない｜ごめんなさい」と言っていた。二人とも、相手は迷惑がっているのだと思い込んでいた。|{a}は何か言いかけて、口を閉じた。{b}も、同じように口を閉じた。暗がりの中で、二人とも「今のは聞かれなかったことにしよう｜今のは聞かれなかったことにする｜今のは聞かれなかったことにしましょう」と思っていた。|「……嫌だったら、言って｜……嫌だったら、言え｜……嫌だったら、言ってください」と{a}が囁いた。嫌なはずがなかった。{b}はただ、{a}の方こそ嫌なのだろうと思って、返事ができなかった。|{b}は、{a}の鼓動が速いことに気づいた。ガスのせいだ、と{b}は思った。{b}の鼓動がもっと速いことに、{a}もまた気づいていた――ガスのせいだと思いながら。|狭い箱の中で、二人の手が同時に動いて、同時に止まった。{a}は「ごめん｜すまない｜ごめんなさい」と手を引き、{b}も慌てて手を引いた。触れたかったのは、二人とも同じだった。|{a}は息を詰めて、{b}から顔を背けた。こんな顔を見られたら、気持ちが全部ばれてしまう。{b}もまた、同じ理由で、反対側の壁を見つめていた。'),
end:{
told:L('後日、{a}は「あの日のこと、本当はガスのせいじゃない｜あの日のことは、本当はガスのせいではない｜あの日のこと、本当はガスのせいじゃないんです」と打ち明けた。{b}は目を丸くして、「……それ、こっちの台詞｜……それは、こちらの台詞だ｜……それ、こちらの台詞です」と笑った。お互いの片想いに気づくまで、二人はずいぶん遠回りをした。|「迷惑だったよね｜迷惑だっただろう｜迷惑でしたよね」と{a}が謝ると、{b}は首を振った。「ずっとこうなりたかったのは、私の方｜ずっとこうなりたかったのは、私の方だ｜ずっとこうなりたかったのは、私の方です」――{a}が同じ言葉を返すまで、三秒もかからなかった。|{a}と{b}は、それぞれ同じ友人に「好きな人と閉じ込められた｜＝｜好きな人と閉じ込められました」と相談していた。友人が吹き出した理由を、二人は数日後に知った。その日、二人はやっと付き合い始めた。'),
miss:L('外に出た二人は、「大変だったね｜大変だったな｜大変でしたね」とだけ言い合って別れた。相手は何とも思っていない――二人とも、そう信じたままだった。片想いは二本とも、まだ届いていない。|{a}は帰り道、「何もなくてよかった｜＝｜何もなくてよかったです」と自分に言い聞かせた。{b}も同じ言葉を、別の道で呟いていた。本当は何かあってほしかったのも、二人とも同じだった。|{b}は、{a}が一度もこちらを見なかったのが、少しだけ寂しかった。{a}が目をそらしていたのは、見たら気持ちがあふれそうだったからだ。二人がそれを知るのは、もう少し先のことになる。')
}
};
LK.CUFF1={
try:L('{a}は{b}の手首をそっと掴んで、手錠の鍵穴を覗き込んだ。|{a}はロッカーの床に落ちていたヘアピンを拾い、{b}の手錠の鍵穴に差し込んだ。|{a}は{b}の背中越しに、{b}の手錠の鍵穴を探った。二人の頬がぴったりとくっついた。|{a}は{b}の手錠の鎖を、ロッカーの角に何度も打ちつけた。|{a}は{b}の手錠に顔を近づけ、鍵穴の形を指先で確かめた。|{a}は自分の靴紐の金具を外し、{b}の手錠の鍵穴をこじった。'),
ok:L('かちり、と小さな音がした。{b}の手錠が外れた。|{b}は手首を擦りながら、ようやく自由になった両手を見つめた。|鍵穴の奥で、何かが噛み合う手応えがあった。{b}の手錠が、音もなく開いた。|手首に赤い痕を残して、{b}の手錠が外れた。{b}は痺れた指を、何度も握っては開いた。'),
ng:L('{a}の指からヘアピンが滑り、{b}の足元に落ちた。拾い直そうと屈むと、{b}の太腿に顔が埋まった。|金具が鍵穴の中で引っかかって、抜けなくなった。{a}は冷や汗をかいた。|{b}の手首に食い込んだ手錠を見て、{a}は思わず手を止めた。「……痛くない？｜……痛くないか？｜……痛くないですか？」|鍵穴に届いたと思った瞬間、ガスが濃くなって指先が震えた。|{b}が身じろぎするたびに、鍵穴がずれた。{a}は小さく舌打ちした。|ガスのせいで指がうまく動かない。鍵穴が、何重にもぶれて見えた。')
};
LK.FADE=L('――その先は、ロッカーの扉の隙間からも見えなかった。|――そこから先のことを、二人は誰にも話していない。|――扉の細い隙間から、甘い霧だけが漏れていた。|――ロッカーがかすかに軋んだ。それ以上は、誰にも分からない。');
LK.KISS_MID=L('夢中で唇を重ねているうちに、扉のセンサーが「認証完了」と告げた。二人がそれに気づいたのは、ずいぶん後だった。|唇が重なったまま三十秒が過ぎ、扉のロックが外れる音がした。二人とも、すぐには離れられなかった。');
LK.PLOT.caught=L('{b}は見ていた。{a}が、仕掛けを解くふりをして、わざと手を止めたところを。|「……わざとでしょ｜……わざとだろう｜……わざとでしょう」――{b}の低い声に、{a}の肩がびくりと跳ねた。|{b}は、{a}の靴の下から覗く鍵の端に気づいた。{a}は、気づかれたことに気づいた。');
LK.PLOT.react={
soft:L('{b}は怒ろうとして、怒れなかった。ガスのせいなのか、そうでないのか、自分でも分からなかった。|{b}は長いため息をついた。「……出たら、ちゃんと説明してもらうから｜……出たら、きちんと説明してもらう｜……出たら、ちゃんと説明してもらいますから」|{b}は呆れたように笑った。その頬は、ガスのせいだけではなく赤かった。'),
mad:L('{b}の顔から、すっと熱が引いた。「……最低｜……最低だ｜……最低です」|{b}は{a}の胸を押し返した。「出たら、覚えておいて｜出たら、覚えておけ｜出たら、覚えておいてください」|{b}は黙って{a}を睨みつけた。媚薬の熱より、怒りの方が勝っていた。')
};
add(LK.OUTSIDE,'ガスのタンクが空になり、非常用の換気扇が回り始めた。続いて、扉のロックがかちりと外れた。|扉の向こうで、誰かが「ここ、開かないんだけど」と言った。乱暴に引っぱられた扉が、あっけなく開いた。');
})();
});
;
/* ==== js/solo-locker-bed.js ==== */
HK.Load.def(176,'js/solo-locker-bed.js',function(){
(function(){
'use strict';
var HK=window.HK,LK=HK.LOCKER;
if(!LK)return;
var ST=HK.Story;
function pick(S,arr){return LK.pick?LK.pick(S,arr):ST.pick(S,arr);}
function L(s){return s.split('|');}
var SOFT={
invite:{
quiet:L('ロッカーの中では、ずっと理性を保っていた{q}だった。その{q}が、外に出たとたん{o}の手をそっと握った。「……もう少しだけ、一緒にいて｜……もう少しだけ、一緒にいろ｜……もう少しだけ、一緒にいてください」|「先にどうぞ｜先に行け｜お先にどうぞ」と出口を譲ったのは{q}の方だった。けれど{o}が一歩踏み出す前に、{q}は{o}の袖を指先でつまんでいた。「……やっぱり、まだ帰らないで｜……やはり、まだ帰るな｜……やっぱり、まだ帰らないでください」|一番おとなしかった{q}が、部屋の奥のベッドに腰かけて、{o}に向かって小さく手招きした。耳まで赤かった。'),
eager:L('{q}は外に出るなり、{o}を正面から抱きしめた。「……ずっと、こうしたかった｜＝｜……ずっと、こうしたかったんです」――二人は、出口に背を向けた。|{q}は「もう無理｜もう無理だ｜もう無理です」とだけ言って、{o}の手を引いた。出口の方には、一度も目を向けなかった。|{q}は{o}の手を握ったまま、部屋の奥のベッドへ歩いていった。{o}は、その手を振りほどかなかった。'),
stop:L('{o}は「……帰ろう。今なら、まだ戻れる｜……帰るぞ。今なら、まだ戻れる｜……帰りましょう。今なら、まだ戻れます」と出口へ向かいかけた。その手を、{q}が後ろから掴んだ。「戻らなくて、いい｜＝｜戻らなくて、いいです」――{o}の足は、それきり出口に向かなかった。|「ガスのせいだから、もう出よう｜ガスのせいだ、もう出るぞ｜ガスのせいですから、もう出ましょう」と言ったのは{o}だった。{q}は何も言わずに、{o}を抱き寄せた。{o}は、もう出口を見なかった。|{o}が出口のドアノブに手をかけたところで、{q}が小さく名前を呼んだ。振り返った{o}は、そのまま動けなくなった。'),
order:L('{q}はベッドに腰かけ、従者である{o}を見上げた。「来て。……今度は、我慢しなくていいよ｜来い。……今度は、我慢しなくていい｜来てください。……今度は、我慢しなくていいです」|{q}は{o}の手を取った。「よく我慢したね。……今夜は、そばにいて｜よく耐えた。……今夜は、そばにいろ｜よく耐えましたね。……今夜は、そばにいてください」――{o}は、深く頭を下げてから従った。|{q}は、ずっと耐えていた{o}の頬に手を添えた。「もういいよ。……命令、隣にいて｜もういい。……命令だ、隣にいろ｜もういいです。……命令です、隣にいてください」')
},
label:{quiet:'おとなしかった方から誘う',eager:'待ちきれずに',stop:'帰ろうとして引き戻される',order:'主の命令'},
fade:L('――そこから先は、二人だけの秘密になった。|――部屋の明かりが消えたあとのことは、二人だけが知っている。|――その夜のことを、二人は誰にも話していない。'),
morning:L('翌朝、二人は少しだけ照れくさそうに目を逸らした。ガスの甘い匂いは、もうどこにも残っていなかった。|朝の光の中で、{b}は{a}の肩にもたれたまま、しばらく黙っていた。「……昨日のこと、覚えてる？｜……昨日のことを、覚えているか？｜……昨日のこと、覚えていますか？」「全部｜全部だ｜全部です」|朝、目を覚ました{a}は、隣で眠る{b}の寝顔を見て、そっと笑った。|部屋を出たのは、すっかり明るくなってからだった。二人は並んで歩きながら、一度も手を離さなかった。')
};
LK.bed=function(S,o){
var rng=S.rng,x=o.x,y=o.y,A=o.A,B=o.B;
var quiet=A.cnt.make<B.cnt.make?A:B.cnt.make<A.cnt.make?B:(A.m.reason>=B.m.reason?A:B),loud=quiet.o;
var q,oo,kind;
if(o.master&&o.servant&&o.servant.cnt.hold>=1&&rng()<0.6){q=o.master;oo=o.servant;kind='order';}
else if(!o.plotter&&rng()<0.08+((quiet.cnt.refuse+quiet.cnt.hold)*0.25+quiet.tr.ac*0.3)*0.7){q=quiet;oo=loud;kind='quiet';}
else if(!o.plotter&&rng()<0.25){q=loud;oo=quiet;kind='stop';}
else{q=o.plotter||loud;oo=q.o;kind='eager';}
var t1=(o.how==='timeout'?LK.BED.timeout[0]:'')+ST.fmt(pick(S,SOFT.invite[kind]),{q:q.name,o:oo.name});
var o3=ST.say(S,{actors:[A,B],tag:'ベッドへ',text:t1,why:{quiet:'ロッカーの中でいちばんおとなしかった'+q.name+'から誘った',eager:q.name+'が待ちきれなかった'+(o.plotter===q?'（思惑どおり）':''),stop:oo.name+'は帰ろうとしたが、'+q.name+'が引き止めた',order:'主の'+q.name+'が、耐えた従者に許しを与えた'}[kind],mag:40});
ST.key(S,o3,kind==='quiet'?'おとなしかった'+q.name+'から誘った':'部屋から出ずに二人きりに');
ST.say(S,{actors:[A,B],tag:'二人きりの夜',text:pick(S,SOFT.fade),why:'関係：'+o.REL_LABEL[o.rel],mag:45,kind:'climax'});
ST.say(S,{actors:[A,B],tag:'翌朝',text:ST.fmt(pick(S,SOFT.morning),{a:x.name,b:y.name}),why:'媚薬が切れるまで、二人は部屋を出なかった',mag:30});
return[SOFT.label[kind]];
};
})();
});
;
/* ==== js/locker-ties.js ==== */
HK.Load.def(177,'js/locker-ties.js',function(){
(function(){
'use strict';
var HK=window.HK,LK=HK.LOCKER,ST=HK.Story;
if(!LK|| !ST)return;
function L(s){return s.split('|');}
var NEW={colleague:1,classmate:1,boss:1,worship:1,benefactor:1,relative:1};
var ROM= /^(lover|mate|fated|fwb|crush|almost|ex)$/;
var LABEL={colleague:'同僚',classmate:'同級生',boss:'上司と部下',worship:'執着（信仰）',benefactor:'恩人',relative:'親族'};
var PAT={
colleague:L('{a}は狭いロッカーの中で{b}と肩をぶつけ、思わず苦笑した。{a}「職場の外で{b}とこんなに近いのは、初めてだ｜＝｜職場の外で{b}とこんなに近いのは、初めてです」|{a}と{b}は、閉じ込められたと分かった瞬間、同時に扉の継ぎ目を確かめ始めた。いつもの仕事と同じ、無駄のない分担だった。|{a}「明日の仕事、間に合うかな｜明日の仕事に間に合うだろうか｜明日の仕事、間に合うでしょうか」――こんな状況でまず仕事の心配をする{a}に、{b}は呆れたように息をついた。|{b}は暗がりの中で、{a}の匂いが職場ですれ違うときと同じだと気づいて、なぜか落ち着かなくなった。'),
classmate:L('{a}「こういうの、学生のころの肝試しを思い出す｜こういう状況は、学生のころの肝試しを思い出す｜こういうの、学生のころの肝試しを思い出します」――{a}が囁くと、{b}は暗がりの中で小さく吹き出した。|同じクラスだったころは、ほとんど話したこともない二人だった。それが今、肩が触れ合う距離で閉じ込められている。|{b}は{a}の横顔を見て、学生のころと変わらない癖――困ると眉を寄せる癖に気づいた。|{a}「{b}、昔からこういうとき、妙に落ち着いてたよね｜{b}は昔から、こういうとき妙に落ち着いていたな｜{b}は昔から、こういうとき妙に落ち着いていましたね」{b}「{a}が騒ぎすぎだっただけ｜{a}が騒ぎすぎていただけだ｜{a}が騒ぎすぎていただけです」'),
relative:L('{a}「親戚の集まりで、二人で押し入れに隠れたことがあったな｜＝｜親戚の集まりで、二人で押し入れに隠れたことがありましたね」――{a}が言うと、{b}は「あれは{a}が出られなくしたんでしょ｜あれは{a}が出られなくしたのだろう｜あれは{a}が出られなくしたんでしょう」と笑った。|{a}と{b}は、親族だからこその遠慮のなさで、狭いロッカーの中の場所を取り合った。|{b}は、子どものころから知っている{a}の声を聞いて、少しだけ落ち着いた。|{a}「このことは、親族の誰にも言わない。約束ね｜このことは、親族の誰にも言わない。約束だ｜このことは、親族の誰にも言いません。約束です」{b}「言えるわけない｜言えるわけがない｜言えるわけがありません」'),
boss:{
u:L('{u}は狭いロッカーの中で、まず{d}の顔色を確かめた。{u}「怪我はない？　落ち着いて、一つずつ確かめよう｜怪我はないか。落ち着け、一つずつ確かめよう｜お怪我はありませんか。落ち着いて、一つずつ確かめましょう」――職場で指示を出すときと同じ声だった。|{u}は、部下の前で取り乱すわけにはいかない、と背筋を伸ばした。背筋を伸ばしたせいで、{d}との距離がさらに縮まった。|{u}は{d}を扉から遠い側に寄せ、自分が通気口の前に立った。いつも現場で、危ない役を先に引き受けるのと同じだった。'),
d:L('{d}は反射的に{u}の指示を待った。待ってから、ここが職場ではないことに気づいて、少しだけ恥ずかしくなった。|{d}「ごめん、つい職場の癖で｜すまない、つい職場の癖が出た｜すみません、つい職場の癖で」――{d}は狭い中で姿勢を正そうとして、{u}の胸に額をぶつけた。|{d}は、上司の前で弱音は吐けないと思った。けれど暗がりの中で{u}の手が肩に置かれると、張り詰めていたものが少しだけ緩んだ。')
},
benefactor:{
u:L('{u}は、{d}が真っ青になっているのに気づいて、肩を叩いた。{u}「前にも言ったでしょ。一人で抱えなくていい｜前にも言ったはずだ。一人で抱えなくていい｜前にも言ったはずです。一人で抱えなくていいんですよ」|{u}は、昔{d}を助けたときのことを思い出していた。あのときも、{d}はこんなふうに震えていた。|{u}「{d}、落ち着いて。こういうのは、焦ったほうが負けだから｜{d}、落ち着け。こういうのは、焦ったほうが負けだ｜{d}、落ち着いてください。こういうのは、焦ったほうが負けです」――{u}は、恩を着せるようなことは一度も言わなかった。'),
d:L('{d}は、{u}だけは何があっても無事に外へ出すと心に決めた。あの日{u}に救われた借りを、まだ返せていなかった。|{d}「{u}、今度は私の番。ここから出す｜{u}、今度は私の番だ。ここから出す｜{u}、今度は私の番です。ここから出します」――{d}は、震える指で扉の仕掛けに手を伸ばした。|{d}は、狭い中で{u}の体を気遣い、少しでも{u}のほうに空間を作ろうと身を縮めた。')
},
worship:{
u:L('{u}は狭いロッカーの中で、真っ先に{d}を自分の腕でかばった。{u}「{d}には、指一本触れさせない。……ガスにも｜＝｜{d}には、指一本触れさせません。……ガスにだって、触れさせません」|{u}は、{d}と同じ空気を吸っていることに、恐れ多さで息が浅くなった。こんな場所でも、{d}は{u}にとって特別な人だった。|{u}「{d}が無事なら、私はどうなってもいい｜＝｜{d}が無事なら、私はどうなってもいいんです」――{u}は本気だった。暗がりの中でも、その目は{d}だけを見ていた。'),
'':L('{d}は、{u}がなぜここまで自分をかばうのか分からず、首をかしげた。{d}「{u}、そんなに気を遣わなくていいのに｜{u}、そんなに気を遣わなくていい｜{u}、そんなに気を遣わなくていいんですよ」|{d}は、{u}がずっと自分の方を見ていることに気づいたが、暗くて不安なのだろうと思った。|{d}は何も知らないまま、{u}の肩に寄りかかった。{u}の体が、石のように固まった。'),
accept:L('{d}は{u}の視線を、いつものように静かに受け止めた。{d}「大丈夫。{u}がいるなら、何とかなる｜大丈夫だ。{u}がいるなら、何とかなる｜大丈夫です。{u}がいるなら、何とかなります」|{d}は、自分を崇めるような{u}の目にも、もう慣れていた。慣れたうえで、それを拒まなかった。|{d}は{u}の手をそっと握った。{u}が息を呑むのも、{d}にはいつものことだった。'),
confused:L('{d}は、ガスより{u}のまっすぐすぎる視線のほうが息苦しかった。{d}「{u}、そんなふうに見ないで。……私は、そんな立派な人じゃない｜{u}、そんなふうに見るな。……私は、そんな立派な人間ではない｜{u}、そんなふうに見ないでください。……私は、そんな立派な人ではありません」|{d}は{u}にかばわれるたびに、申し訳なさで胸が重くなった。これほどの想いに、どう返せばいいのか分からなかった。|{d}は{u}から少しでも離れようとしたが、狭いロッカーには逃げ場がなかった。'),
dominate:L('{d}は狭いロッカーの中で、当然のように{u}に命じた。{d}「{u}、扉を調べて。私はここで待ってる｜{u}、扉を調べろ。私はここで待っている｜{u}、扉を調べてください。私はここで待っています」――{u}は、迷わず従った。|{d}は{u}を見つめて、薄く笑った。{d}「こんなところでも、私のために動けるよね、{u}｜こんなところでも、私のために動けるだろう、{u}｜{u}、こんなところでも、私のために動けますよね」|{d}は{u}の肩に手を置き、そこを足場のように扱った。{u}は、それを光栄なことのように受け入れた。'),
cherish:L('{d}は{u}に、かばうのをやめさせようとした。{d}「{u}も、自分を大事にして。……私にとって、{u}は大切な人だから｜{u}も、自分を大事にしろ。……私にとって、{u}は大切な人だ｜{u}も、自分を大事にしてください。……私にとって、{u}は大切な人なんです」|{d}は{u}の震える手を包んだ。崇められるより、隣で同じように怖がってほしかった。|{d}は、自分より先に{u}の具合を確かめた。{u}は、そんなことをしてもらう資格はないと首を振った。')
}
};
var KEEP={
colleague:L('{a}は扉の仕掛けを読み上げ、{b}が手早く試した。{a}「次｜次だ｜次をお願いします」{b}「了解｜了解した｜了解です」――職場と同じ呼吸で、二人は黙々と手を動かした。|{b}がうまくいかずに苛立つと、{a}は「仕事で詰まったときと同じ。一回休もう｜仕事で詰まったときと同じだ。一度休もう｜仕事で詰まったときと同じです。一回休みましょう」と言った。{b}は、言われたとおりに深呼吸した。|{a}「{b}がいて助かった。職場でも、いつもそう思ってる｜{b}がいて助かった。職場でも、いつもそう思っている｜{b}がいて助かりました。職場でも、いつもそう思っています」{b}「……今、それを言う？｜……今、それを言うのか｜……今、それを言うんですか」――言いながら、{b}の声は少し和らいでいた。'),
classmate:L('二人は、学生のころの思い出話で気を紛らわせた。同じ先生の口癖を、同時に真似して笑った。|{a}「試験の前、{b}のノートに何度も助けられた｜＝｜試験の前、{b}のノートに何度も助けられました」{b}「知ってる。返ってこなかったから｜知っている。返ってこなかったからな｜知っています。返ってこなかったので」――暗がりの中で、二人は笑い合った。|{b}が不安そうに黙ると、{a}は学生のころに流行った歌を小さく口ずさんだ。{b}も、いつの間にか一緒に口ずさんでいた。'),
relative:L('{a}は親族の誰かの困った話をして、{b}を笑わせた。笑っているあいだだけ、ガスの甘さを忘れられた。|{b}が不安そうに黙ると、{a}は「出たら、親戚に話せない話が一つ増える｜出たら、親戚に話せない話が一つ増えるな｜出たら、親戚に話せない話が一つ増えますね」と言った。{b}は小さく笑った。|{a}と{b}は、子どものころの呼び名で互いを呼んだ。それだけで、狭いロッカーが少しだけ広く感じられた。'),
boss:L('{u}は{d}の手順を黙って見守り、うまくいくと短く「いい判断｜いい判断だ｜いい判断です」と言った。{d}は、職場で褒められたときと同じように頬を緩めた。|{d}は、{u}が額に汗を浮かべているのに気づき、自分の袖でそっと拭った。{u}「……助かる｜……助かった｜……助かります」――立場が逆になったような、小さなやりとりだった。|{u}「責任は私が取る。{d}は、思うとおりにやって｜責任は私が取る。{d}は、思うとおりにやれ｜責任は私が取ります。{d}は、思うとおりにやってください」――{d}は頷いた。現場でいつも背中を押してくれた言葉だった。|{d}「{u}の指示があれば、どんな現場でもやれる気がする。……ここでも｜{u}の指示があれば、どんな現場でもやれる気がする。……ここでもだ｜{u}の指示があれば、どんな現場でもやれる気がします。……ここでもです」{u}は照れくさそうに目を逸らした。'),
benefactor:L('{d}は{u}が楽な姿勢を取れるよう、自分が窮屈な体勢を引き受けた。{u}「無理しないで｜無理をするな｜無理しないでください」{d}「このくらい、させて｜このくらいはさせてくれ｜このくらい、させてください」|{u}は{d}の手が震えているのに気づき、上から包んだ。{u}「大丈夫。前も、どうにかなったでしょ｜大丈夫だ。前も、どうにかなっただろう｜大丈夫です。前も、どうにかなったでしょう」――{d}は、あの日と同じように頷いた。|{d}「{u}には、返しきれないほどの恩がある｜＝｜{u}には、返しきれないほどの恩があります」{u}「返さなくていい。{d}が元気なら、それで十分｜返さなくていい。{d}が元気なら、それで十分だ｜返さなくていいんです。{d}が元気なら、それで十分です」'),
worship:{
'':L('{u}は{d}の足元を何度も確かめ、{d}が楽に立てるよう体をずらし続けた。{d}は、{u}の気遣いをただの親切だと思って、素直に礼を言った。|{u}は、{d}の髪についた埃を、息を詰めて払った。{d}「ありがとう、{u}｜感謝する、{u}｜ありがとうございます、{u}」――その一言で、{u}は十分だった。|{d}がふらつくと、{u}は自分の体を壁にしてそれを受け止めた。{d}は何も知らずに、{u}の胸に体を預けた。'),
accept:L('{u}は{d}の前に膝をつき、ほどけた靴紐を結び直した。{d}は、それを当たり前のように受け入れ、{u}の頭にそっと手を置いた。|{d}「{u}、ありがとう｜{u}、感謝する｜{u}、ありがとうございます」――{d}がそう言うたびに、{u}の背筋が伸びた。{d}は、それをよく知っていた。|{u}は{d}のために通気口の前を空け続けた。{d}は、捧げられたものを拒まずに受け取った。それが二人のいつもの形だった。'),
confused:L('{u}は{d}の代わりに、ガスの濃いほうへ身を寄せた。{d}「やめて、{u}。そこまでしなくていい｜やめろ、{u}。そこまでしなくていい｜やめてください、{u}。そこまでしなくていいんです」――{u}は、それでもやめなかった。|{d}は、{u}の献身を受け取るたびに、戸惑いを隠せなかった。それでも、{u}が差し出した水だけは、黙って受け取った。|{u}「{d}が困るなら、私は離れる｜＝｜{d}が困るなら、私は離れます」{d}「……離れなくていい。ただ、自分のことも考えて｜……離れなくていい。ただ、自分のことも考えろ｜……離れなくていいです。ただ、自分のことも考えてください」'),
dominate:L('{d}「{u}、もっと急いで｜{u}、もっと急げ｜{u}、もっと急いでください」――{d}の命令に、{u}は指先を傷つけながらも手を早めた。{d}は満足そうに目を細めた。|{d}は{u}に自分の上着を持たせ、仕掛けを解かせ、そのあいだずっと見つめていた。{u}は、使われることに喜びを感じていた。|{d}「よくできたね、{u}｜よくやった、{u}｜よくできましたね、{u}」――たった一言のねぎらいで、{u}の疲れは消えた。{d}は、それをよく分かっていて言った。'),
cherish:L('{d}は{u}の手を取り、汗ばんだ指を自分のハンカチで拭いた。{d}「{u}も、ちゃんと休んで｜{u}も、ちゃんと休め｜{u}も、ちゃんと休んでください」――{u}は、恐れ多さに言葉を失った。|{u}が{d}をかばおうとすると、{d}はその腕を引いて、隣に並ばせた。{d}「並んで。そのほうが、私は安心する｜並べ。そのほうが、私は安心する｜並んでください。そのほうが、私は安心します」|{d}は{u}に寄りかかって目を閉じた。{d}「{u}がいてくれてよかった｜＝｜{u}がいてくれてよかったです」――{u}は、この言葉を一生忘れないと思った。')
}
};
var DEV={
colleague:{
rom:L('{a}は暗がりの中で、{b}の手を探し当てた。{a}「職場では言えなかったけど……{b}のこと、ずっと気になってた｜職場では言えなかったが……{b}のことが、ずっと気になっていた｜職場では言えませんでしたが……{b}のことが、ずっと気になっていました」{b}は、その手を離さなかった。|仕事仲間としてしか見ていなかったはずの{b}の横顔から、{a}は目が離せなくなっていた。ガスのせいだと言い訳するのも、難しかった。|{b}「ここを出たら、仕事抜きで食事に行こう｜＝｜ここを出たら、仕事抜きで食事に行きましょう」――{b}がそう言うと、{a}は暗がりの中で、ゆっくりと頷いた。'),
plain:L('{a}「ここを出たら、{b}と組む仕事をもっと増やしたい｜＝｜ここを出たら、{b}と組む仕事をもっと増やしたいです」{b}「同じことを考えてた｜同じことを考えていた｜同じことを考えていました」――二人の信頼は、狭いロッカーの中で一段深くなった。|{b}は、{a}の判断に迷わず従った。従ってみて、自分がどれほど{a}を信頼していたか、初めて気づいた。|二人は、職場では一度も話したことのない本音を、暗がりの中で打ち明け合った。明日からの仕事は、きっと少し変わる。')
},
classmate:{
rom:L('{a}「実は学生のころ、{b}のことが好きだった｜＝｜実は学生のころ、{b}のことが好きでした」――暗がりの中の告白に、{b}は息を呑んだ。{b}「……今さら言うの、ずるい｜……今さら言うのは、ずるいぞ｜……今さら言うのは、ずるいです」|昔話の途中で、二人の言葉が途切れた。同じクラスにいたころには気づかなかった気持ちが、狭い暗がりの中で形になっていった。|{b}は{a}の肩に頭を預けた。{b}「学生のころ、こうしてみたかった｜＝｜学生のころ、こうしてみたかったんです」――{a}は、その頭をそっと抱き寄せた。'),
plain:L('{a}「卒業してから、ずっと連絡しなくてごめん｜卒業してから、ずっと連絡しなくてすまない｜卒業してから、ずっと連絡しなくてすみません」{b}「お互いさま｜お互いさまだ｜お互いさまです」――途切れていた時間が、ロッカーの中で少しずつ埋まっていった。|二人は、学生のころにはできなかった話をした。今の暮らしのこと、うまくいかなかったこと。昔よりずっと近くに、互いを感じた。|{b}「ここを出たら、同級生の誰かを誘って、また集まろう｜＝｜ここを出たら、同級生の誰かを誘って、また集まりましょう」{a}「その前に、二人で一回｜その前に、二人で一度だ｜その前に、二人で一回会いましょう」――約束は、すんなりと決まった。')
},
boss:{
rom:L('{d}「職場の外でなら……{u}を、上司としてじゃなく見てもいい？｜職場の外でなら……{u}を、上司としてではなく見てもいいか｜職場の外でなら……{u}を、上司としてではなく見てもいいですか」――{u}は答える代わりに、{d}の手を握った。上司と部下の線が、静かに消えた。|{u}は、部下として見てきたはずの{d}を、いつの間にか一人の人として見ていた。暗がりの中で、その気持ちはもう隠せなかった。|{u}「仕事のことは、ここでは忘れる｜＝｜仕事のことは、ここでは忘れます」――そう言った{u}の声は、職場では一度も聞いたことのない柔らかさだった。{d}は、その声に頬を熱くした。'),
plain:L('{u}は、仕掛けの手順を{d}に任せた。{u}「ここでは、{d}のほうが上手い。指示をちょうだい｜ここでは、{d}のほうが上手い。指示をくれ｜ここでは、{d}のほうが上手です。指示をください」――職場の外で、二人は初めて対等に並んだ。|{d}「{u}も、怖いときは怖いって言っていい｜{u}も、怖いときは怖いと言っていい｜{u}も、怖いときは怖いと言っていいんですよ」――{u}は少し驚いて、それから小さく笑った。{u}「……実は、少し怖い｜＝｜……実は、少し怖いです」|立場を外した二人は、仕事の愚痴を言い合って笑った。職場に戻っても、この信頼はきっと変わらない。')
},
benefactor:{
rom:L('{d}は、恩を返したい気持ちが、いつの間にか別の想いに変わっていたことに気づいた。{d}「{u}。……恩だけじゃない。{u}が好き｜{u}。……恩だけではない。{u}が好きだ｜{u}。……恩だけではありません。{u}が好きです」|{u}は、助けたあの日から{d}を見守ってきた。見守るだけのつもりだった気持ちが、暗がりの中で揺れていた。|{d}「恩返しが終わっても、{u}のそばにいたい｜＝｜恩返しが終わっても、{u}のそばにいたいです」――{u}は、答えの代わりに{d}の手を強く握った。'),
plain:L('{d}は、{u}が手こずっていた仕掛けを、自分から引き受けて進めてみせた。{d}「あの日の借り、少しだけ返せた｜あの日の借りを、少しだけ返せた｜あの日の借りを、少しだけ返せました」――{u}は、誇らしそうに笑った。|{d}はガスの濃いほうへ自分が移り、{u}を通気口の前に押しやった。そのまま扉の仕掛けに取りついた。{d}「今度は、私が{u}を守る番｜今度は、私が{u}を守る番だ｜今度は、私が{u}を守る番です」|{u}「もう十分に返してもらった｜＝｜もう十分に返してもらいました」{d}「まだ全然。一生かけて返す｜まだ全然だ。一生かけて返す｜まだ全然です。一生かけて返します」――{d}は言いながら、仕掛けの手順を一つ先へ進めた。恩は、二人を結ぶ絆に変わっていた。')
},
relative:{
rom:L('{a}は、親族として見てきたはずの{b}に、それ以上の想いを抱いていたことを認めた。{a}「親戚の集まりで会うたびに、本当は……｜＝｜親戚の集まりで会うたびに、本当は……思っていました」{b}は、黙って{a}の手を握り返した。|子どものころから知っている相手だった。だからこそ、今まで言えなかった。{b}「……{a}だから、ずっと黙ってた｜……{a}だからこそ、ずっと黙っていた｜……{a}だから、ずっと黙っていました」|{a}と{b}は、親族には決して言えない気持ちを、暗がりの中で確かめ合った。'),
plain:L('{a}「何があっても、{b}は私の家族だよ｜何があっても、{b}は私の家族だ｜何があっても、{b}は私の家族です」――{b}は暗がりの中で、少しだけ泣きそうになった。|二人は、亡くなった祖父母や、親族の昔話をした。同じ人たちを覚えているというだけで、心強かった。|{b}「出たら、久しぶりに二人で実家のほうへ顔を出そう｜＝｜出たら、久しぶりに二人で実家のほうへ顔を出しましょう」{a}「みんな驚くだろうね｜みんな驚くだろうな｜みんな驚くでしょうね」――家族としての絆が、静かに結び直された。')
},
worship:{
romWarm:L('{d}は、崇めるような{u}の目を、一人の人として見つめ返した。{d}「{u}。私は神様じゃなくて、{u}の隣にいたい｜{u}。私は神ではなく、{u}の隣にいたい｜{u}。私は神様ではなく、{u}の隣にいたいんです」――{u}の信仰は、そのまま恋に変わった。|{u}は、祈るように{d}の手に額を当てた。{d}はその手を引き寄せ、{u}の頬に触れた。崇める想いと恋しい想いが、もう区別できなかった。|{d}「{u}の想いは、ちゃんと届いてる。……私も、同じ気持ちで返したい｜{u}の想いは、確かに届いている。……私も、同じ気持ちで返したい｜{u}の想いは、ちゃんと届いています。……私も、同じ気持ちで返したいです」――{u}は、信じられないものを見るように{d}を見つめた。'),
romConfused:L('重荷だと思っていた{u}の想いに、{d}は初めて胸の高鳴りを覚えた。{d}「……困る。{u}のことを、こんなふうに思うなんて｜……困る。{u}のことを、こんなふうに思うとは｜{u}のことを、こんなふうに思うなんて……困ります」|{d}は戸惑いながらも、{u}の手を振り払わなかった。{u}が自分だけを見ていることが、怖さより嬉しさに変わりはじめていた。|{u}「{d}を困らせるなら、この想いは胸にしまう｜＝｜{d}を困らせるなら、この想いは胸にしまいます」{d}「しまわなくていい。……しまわないで｜しまわなくていい。……しまうな｜しまわなくていいです。……しまわないでください」'),
romUnaware:L('{d}は、{u}の献身がただの親切ではなかったことに、ようやく気づいた。{d}「{u}……ずっと、そんなふうに私を？｜{u}……ずっと、そんなふうに私を見ていたのか｜{u}……ずっと、そんなふうに私を見ていたんですか」――{u}は、否定しなかった。|{d}は、自分を見る{u}の目に込められたものを、初めて正面から受け止めた。驚きのあとに来たのは、不思議な温かさだった。|{u}「気づかれなくてよかった。でも、気づかれて、もっとよかった｜気づかれなくてよかった。だが、気づかれて、もっとよかった｜気づかれなくてよかったです。でも、気づかれて、もっとよかったです」――{d}は、{u}の告白に頬を染めた。'),
dom:L('{d}は{u}の顎に指をかけ、こちらを向かせた。{d}「{u}は私のもの。そうでしょ？｜{u}は私のものだ。そうだろう｜{u}は私のものです。そうでしょう？」{u}「……{d}のもの。最初から｜……{d}のものだ。最初から｜……最初から、{d}のものです」――{u}の目に、迷いはひとつもなかった。|{d}「ここを出ても、私の言うことだけを聞いて｜ここを出ても、私の言うことだけを聞け｜ここを出ても、私の言うことだけを聞いてください」――{u}は深く頷いた。命じられることが、{u}にとって何よりの救いだった。|{d}は{u}に、跪くよう命じた。狭いロッカーの中で、{u}はためらわずに膝を折った。支配する者と従う者の形が、より深く刻まれた。'),
plainWarm:L('{u}は、{d}のために生きると改めて心に誓った。{d}は、その誓いを黙って受け取り、{u}の髪を撫でた。|{d}「{u}がそうしたいなら、そばにいて｜{u}がそうしたいなら、そばにいろ｜{u}がそうしたいなら、そばにいてください」――{u}にとって、それは何よりの許しだった。信仰は、静かに深まった。|{u}は、{d}が笑うのを見るためだけに、仕掛けに向かい続けた。{d}は、その背中に小さく「ありがとう｜感謝する｜ありがとうございます」と言った。'),
plainConfused:L('{d}は{u}に、もっと自分を大事にしてほしいと伝えた。{u}は頷いたが、想いが変わることはなかった。{d}は、その頑なさに少しだけ笑った。|{d}は、{u}の想いを重荷だと思っていた自分を、少しだけ恥じた。返せなくても、受け取ることはできるのかもしれない。|{u}「{d}が私を遠ざけても、私は{d}を想い続ける｜＝｜{d}が私を遠ざけても、私は{d}を想い続けます」――{d}は困った顔のまま、それでも{u}の隣を離れなかった。'),
plainUnaware:L('{d}は、{u}がいつも自分の味方でいてくれることに、改めて感謝した。その想いの深さには、まだ気づいていなかった。|{u}は、{d}を守れたことだけで満たされていた。{d}が何も知らなくても、{u}の想いは少しも揺らがなかった。|{d}「{u}って、本当に頼りになる｜{u}は、本当に頼りになる｜{u}は、本当に頼りになります」――{u}は笑ってみせた。それ以上の言葉は、胸の奥にしまった。')
}
};
var DEV_TAG={colleague:'深まる信頼',classmate:'昔話から再接近',boss:'職場の外で対等に',benefactor:'恩返し',relative:'家族の絆',worship:'揺らがない信仰'};
var KEEP_TAG={colleague:'息の合う同僚',classmate:'同級生の昔話',boss:'上司と部下の信頼',benefactor:'恩と気遣い',relative:'親族の気安さ',worship:'捧げる想い'};
var PAT_TAG={colleague:'仕事仲間',classmate:'同級生',boss:'上司と部下',benefactor:'恩人',relative:'親族',worship:'信仰'};
var STEADY=L('拒まれても、{u}の目から{d}への想いは消えなかった。{u}「{d}がそう望むなら、そうする。……想うことだけは、許してほしい｜{d}がそう望むなら、そうする。……想うことだけは、許してくれ｜{d}がそう望むなら、そうします。……想うことだけは、許してください」|{u}は押し返された手を、胸の前でそっと握った。{d}に嫌われても、{u}にとって{d}が特別であることは変わらなかった。|{u}は{d}の冷たい言葉を、黙って受け止めた。どんな言葉をかけられても、{u}の信仰は少しも揺らがなかった。|{u}「{d}が私をどう思っても、私は{d}を想い続ける｜＝｜{d}が私をどう思っても、私は{d}を想い続けます」――その声は静かで、どこまでもまっすぐだった。');
var SV={
hold:L('{a}は、熱に浮かされた体を必死に{b}から遠ざけた。{a}「{b}に、こんな形で触れるわけにはいかない｜＝｜{b}に、こんな形で触れるわけにはいきません」|{a}は唇を噛んで耐えた。崇める相手を、ガスのせいで汚すことだけは、どうしても許せなかった。|{a}は{b}の足元に視線を落としたまま、拳を握りしめた。{a}「{b}が許すまで、私は何もしない｜＝｜{b}が許すまで、私は何もしません」'),
break:L('{a}は、震える手で{b}の指先に口づけた。{a}「許して。……もう、こらえきれない｜許してくれ。……もう、こらえきれない｜許してください。……もう、こらえきれません」|{a}は{b}の名前を、祈るように何度も呼んだ。崇めるだけだった想いが、熱に押されて溢れ出した。|{a}の理性が、とうとう尽きた。{a}は恐る恐る{b}の手を取り、自分の頬に当てた。'),
order:{
dom:L('{b}は{a}を見つめて、冷たく笑った。{b}「我慢しなくていい。……命令。私に触れて｜我慢しなくていい。……命令だ。私に触れろ｜我慢しなくていいです。……命令です。私に触れてください」|{b}は{a}の顎を指で持ち上げた。{b}「{a}は、私の言うとおりにすればいい。来て｜{a}は、私の言うとおりにすればいい。来い｜{a}は、私の言うとおりにすればいいんです。来てください」|{b}「よく耐えたね、{a}。ご褒美をあげる。……ほら、言われたとおりにして｜よく耐えた、{a}。褒美をやる。……ほら、言われたとおりにしろ｜よく耐えましたね、{a}。ご褒美をあげます。……ほら、言われたとおりにしてください」'),
warm:L('{b}は{a}の頬に手を添えた。{b}「もう、我慢しなくていい。{a}なら、いい｜もう、我慢しなくていい。{a}なら、構わない｜もう、我慢しなくていいです。{a}なら、いいんです」|{b}は{a}の手を取り、自分の頬に導いた。{b}「{a}の想いは、知ってる。……触れて｜{a}の想いは、知っている。……触れろ｜{a}の想いは、知っています。……触れてください」|{b}「許す。{a}が触れたいなら、私も、そうしてほしい｜＝｜許します。{a}が触れたいなら、私も、そうしてほしいです」――{a}の目から、最後のためらいが消えた。'),
confused:L('{b}は迷った末に、{a}の手をそっと握った。{b}「……苦しそうな{a}を、見ていられない。今だけ、いい｜……苦しそうな{a}を、見ていられない。今だけなら、構わない｜……苦しそうな{a}を、見ていられません。今だけ、いいです」|{b}は戸惑いながら、{a}の名前を呼んだ。{b}「こんなの、どうしていいか分からない。でも……触れていい｜こんなことは、どうしていいか分からない。だが……触れていい｜こんなの、どうしていいか分かりません。でも……触れていいです」|{b}「私は、{a}が思うような人じゃない。それでもいいなら……｜私は、{a}が思うような人間ではない。それでもいいなら……｜私は、{a}が思うような人ではありません。それでもいいなら……どうぞ」――{a}は、震えながら頷いた。'),
unaware:L('{b}は、苦しそうな{a}を見かねて言った。{b}「我慢しないで、{a}。……私なら、平気だから｜我慢するな、{a}。……私なら、平気だ｜我慢しないでください、{a}。……私なら、平気ですから」|{b}は何も知らないまま、{a}の手を取った。{b}「つらいなら、つかまって｜つらいなら、つかまれ｜つらいなら、つかまってください」――{a}の中で、何かが音を立てて切れた。|{b}「{a}、そんなに耐えなくていい｜＝｜{a}、そんなに耐えなくていいんですよ」――その一言が{a}にとってどれほどの許しなのか、{b}はまだ知らなかった。')
}
};
var FIRST={
colleague:L('明日も職場で顔を合わせる相手だった。そのことを考える余裕は、もう二人のどちらにもなかった。|いつも隣で仕事をしている相手の体温を、{a}は初めて知った。|仕事仲間の線を越えた瞬間、{b}は、自分が思っていたほど驚いていないことに驚いた。'),
classmate:L('同じクラスだったころには、指先すら触れたことがなかった。その相手に、{a}は今、自分から触れていた。|学生のころの{b}の面影が、暗がりの中で一瞬だけ重なって、すぐに消えた。|昔話をしていた唇が、昔話の続きのように重なった。'),
boss:L('職場では、決して越えてはいけないはずの線だった。{u}と{d}は、ガスの熱の中でそれを越えた。|{d}は、いつも職場で背中を見ている{u}の顔が、こんなに近くにあることが信じられなかった。|上司と部下という肩書きは、狭いロッカーの中では何の役にも立たなかった。'),
worship:L('{u}は、崇めてきた{d}に触れている自分が信じられなかった。指先が、祈るように震えていた。|{d}に触れることは、{u}にとって何より恐れ多く、何より望んでいたことだった。|{u}の触れ方は、どこまでも恭しかった。{d}は、その恭しさに息を詰めた。'),
benefactor:L('恩を返したいと思い続けてきた相手だった。こんな形になるとは、{d}は思ってもいなかった。|{u}は、昔助けた{d}が、もう守られるだけの相手ではないことを、体温で思い知った。|恩人と、恩を受けた側。その距離が、ガスの熱の中で一度に溶けた。'),
relative:L('親族として過ごしてきた長い時間が、たった数分で塗り替えられていった。|子どものころから知っている相手なのに、こんな顔は一度も見たことがなかった。|親戚の誰にも言えない秘密が、ロッカーの暗がりの中で一つ増えた。')
};
var AFTER={
colleague:L('翌日、二人は職場でいつも通りに挨拶をした。目が合った一瞬だけ、どちらも言葉に詰まった。|{a}は帰り道、明日からどんな顔で仕事をすればいいのか、ずっと考えていた。|次の打ち合わせの席で、二人は隣に座った。誰も気づかなかったが、二人の肩は少しだけ近かった。'),
classmate:L('外に出た二人は、同級生の誰にもこの話はしないと誓い合った。それから、照れくさそうに笑った。|学生のころの思い出に、とんでもない続きができてしまった。{b}は、次の同窓会が少し怖くなった。|別れ際、{a}は「また連絡する｜＝｜また連絡します」と言った。学生のころには言えなかった一言だった。'),
boss:L('翌朝、{d}はいつも通りに{u}へ報告を上げた。{u}の返事は、いつもより一拍遅かった。|職場に戻った二人は、上司と部下の顔に戻った。ただ、書類を受け渡す指先だけが、ぎこちなかった。|{u}は「今日のことは、仕事とは関係ない｜＝｜今日のことは、仕事とは関係ありません」と言った。{d}は、その言葉の意味を一晩じゅう考えた。'),
worship:L('{u}は外に出ても、{d}の一歩後ろを歩いた。触れてしまった指先を、宝物のように握りしめて。|{d}は、{u}の想いが少しも変わっていないことに気づいた。むしろ、前より深くなっていた。|{u}は「{d}のためなら、何度でも｜{d}のためなら、何度でもやる｜{d}のためなら、何度でもします」とだけ言った。その目に、迷いはなかった。'),
benefactor:L('帰り道、{d}は「また恩が増えた気がする｜＝｜また恩が増えた気がします」と笑った。{u}は「数えなくていい｜＝｜数えなくていいです」と返した。|{u}は、守ってきたはずの{d}の背中が、思っていたより大きいことに気づいた。|恩人と、恩を受けた側。その関係に、今夜もう一つ、名前のない何かが加わった。'),
relative:L('次の親族の集まりで、二人は少しだけ離れて座った。それでも目が合うと、どちらも先にそらした。|二人は、この日のことを親族の誰にも話さないと決めた。決めたことが、二人をかえって近づけた。|{a}は帰り道、子どものころの{b}の顔と、今日の{b}の顔を、何度も思い比べた。')
};
if(LK.REL)Object.keys(FIRST).forEach(function(k){LK.REL.first[k]=FIRST[k];LK.REL.after[k]=AFTER[k];});
var ENDL={
colleague:{rom:L('{a}と{b}は、職場の誰にも内緒で、仕事のあとに会う約束をした。|仕事仲間だった二人の関係に、新しい名前がつきかけていた。|{a}は翌日、職場で{b}の姿を探している自分に気づいた。'),bond:L('{a}と{b}は、職場でいちばん息の合う二人になった。|ロッカーで組んだ二人は、次の仕事でも自然と同じ組になった。|{a}は「次の仕事も、{b}と組みたい｜＝｜次の仕事も、{b}と組みたいです」と、自分から言い出した。')},
classmate:{rom:L('同窓会の案内が届いたとき、{a}と{b}は、二人で行くと返事をした。|学生のころに言えなかったことを、二人はやっと言い合えた。|{b}は、学生のころの自分に「待っていてよかった｜＝｜待っていてよかったです」と言ってやりたかった。'),bond:L('途切れていた同級生の縁が、ロッカーの中で結び直された。|二人は、月に一度は会う約束をした。学生のころより、ずっと気楽な仲だった。|{a}と{b}は、昔話のできる数少ない相手を、もう一度見つけた。')},
boss:{rom:L('職場の外で、{u}と{d}は名前で呼び合うようになった。|{d}は、{u}の「おつかれさま」に、前とは違う響きを聞くようになった。|上司と部下の二人は、職場の誰にも言えない約束を一つ交わした。'),bond:L('職場に戻った{u}は、{d}に大きな仕事を任せるようになった。|{d}は、{u}を上司としてだけでなく、一人の人として信頼するようになった。|上司と部下の二人のあいだに、職場の外でしか生まれない信頼が残った。')},
benefactor:{rom:L('恩人と、恩を受けた側。二人の関係は、恋人と呼ぶほうが近いものに変わった。|{d}はもう「恩返し」とは言わなかった。代わりに「一緒にいたい｜＝｜一緒にいたいです」と言った。|{u}は、守るだけだった相手に、守られる日が来るとは思っていなかった。'),bond:L('{d}は、また一つ{u}への恩を返した。{u}は「もう十分｜もう十分だ｜もう十分です」と笑った。|恩人と、恩を受けた側。二人の縁は、前よりずっと対等なものになった。|{u}は、助けた相手に助けられる日が来たことを、誇らしく思った。')},
relative:{rom:L('二人は、親族の誰にも言えない関係になった。|次の親戚の集まりで、二人はテーブルの下でそっと手を繋いだ。|子どものころから知っている相手を、{a}は初めて「好きな人」と呼んだ。'),bond:L('二人は、親族の中でいちばん頼れる相手どうしになった。|次の親戚の集まりで、二人は並んで座り、ロッカーの話で笑い合った。|{a}は、何かあったらまず{b}に連絡しようと決めた。')},
worship:{
rom:L('{u}の信仰は、恋に変わった。崇める想いは、少しも減らなかった。|{d}は、{u}の想いに、自分の想いで応えると決めた。|崇める者と崇められる者は、隣を歩く二人になった。それでも{u}は、{d}を見るたびに、祈るような目をした。'),
dom:L('{u}は、ロッカーを出てからも、{d}の言葉一つで動いた。それを、何より幸せだと思っていた。|{d}の支配は、前より深くなった。{u}の服従もまた、前より深くなった。|{d}が「来て｜来い｜来てください」と言えば、{u}はどこへでも行く。二人の形は、もう変わらなかった。'),
bond:L('{u}の想いは、ロッカーに閉じ込められる前と、少しも変わらなかった。|何があっても、{u}にとって{d}が特別な人であることは揺らがなかった。|{u}は、これからも{d}を想い続ける。それだけは、誰にも変えられなかった。')
}
};
function grp(c){return c==='accept'||c==='cherish'?'warm':c==='confused'?'confused':c==='dominate'?'dom':'unaware';}
function cap(s){return s.charAt(0).toUpperCase()+s.slice(1);}
function vars(nt,a,b){return{a:a.name,b:b.name,u:nt.u.name,d:nt.d.name};}
function noLoveOf(t){
if(t.type==='relative')return HK.tieNoLove?HK.tieNoLove(t):t.love!=='ok';
if(t.type==='worship')return HK.tieOptNoLove?HK.tieOptNoLove(t):t.love!=='ok';
return false;
}
var NT=LK.TIES={
LABEL:LABEL,
setup:function(S,A,B,tieL){
var t=(tieL||[]).filter(function(x){return NEW[x.type];})[0];
if(!t)return null;
var D=HK.TIES&&HK.TIES[t.type]||{},u=S.P[t.a],d=S.P[t.b];
if(!u|| !d||u===d)return null;
if(!D.dir){u=A;d=B;}
var romTie=tieL.some(function(x){return ROM.test(x.type);});
var cold=t.type==='worship'?t.cold||'':'';
var nt={type:t.type,t:t,u:u,d:d,dir: !!D.dir,cold:cold,g:grp(cold),love:t.love==='ok',noLove: !romTie&&noLoveOf(t)&&cold!=='dominate',dom:t.type==='worship'&&cold==='dominate',bond:0,pats:0,kept:false,dev:'',rom:false,steady:0,label:LABEL[t.type]};
nt.nlWhy=t.type==='relative'?'親族（恋愛にしない関係）':'恋愛に発展しない信仰（執着）';
return nt;
},
role:function(nt,p){
if(!nt|| !nt.dir)return'';
var R={boss:['上司','部下'],worship:['信仰する側','信仰される側'],benefactor:['恩人','恩を受けた側']}[nt.type];
return R?'（'+(p===nt.u?R[0]:R[1])+'）':'';
},
romOK:function(nt,ngP){
if(ngP||nt.noLove)return false;
if(nt.type==='worship'&& !nt.love)return false;
if(LK.loveOK)return LK.loveOK(nt.u,nt.d);
return!HK.canLove||(HK.canLove(nt.u,nt.d)&&HK.canLove(nt.d,nt.u));
},
wake:function(S,nt){
var rng=S.rng,P0=PAT[nt.type],side= !nt.dir?null:nt.type==='worship'?(rng()<0.5?'u':nt.cold):(rng()<0.5?'u':'d');
var arr=side==null?P0:P0[side]||P0.u,a=side==='u'||side==null?nt.u:nt.d;
if(side==null&&rng()<0.5)a=nt.d;
var b=a===nt.u?nt.d:nt.u;
nt.pats++;nt.patSide=side;
return ST.say(S,{actors:[a,b],tag:PAT_TAG[nt.type],text:ST.fmt(LK.pick(S,arr),vars(nt,a,b)),why:'二人の関係：'+nt.label+(nt.type==='worship'?'（'+(HK.WORSHIP_BACK&&HK.WORSHIP_BACK[nt.cold]?HK.WORSHIP_BACK[nt.cold].label:'')+'）':nt.dir?'（'+a.name+'の側から）':''),mag:12});
},
turn:function(S,nt,c){
if(c.pair.conn)return null;
var rng=S.rng,u=nt.u,d=nt.d;
if(!nt.dev&&c.turn>=3&&(nt.kept||c.turn>=5)&&rng()<0.4){
var k,pool,why,eff=null,D0=DEV[nt.type];
if(nt.dom){k='dom';pool=D0.dom;}
else if(NT.romOK(nt,c.ngP)&&rng()<(nt.type==='worship'?0.75:0.55)){k='rom';pool=nt.type==='worship'?D0['rom'+cap(nt.g)]:D0.rom;}
else{k='plain';pool=nt.type==='worship'?D0['plain'+cap(nt.g)]:D0.plain;}
nt.dev=k;
if(k==='rom'){nt.rom=true;u.m.heat=Math.min(100,u.m.heat+6);d.m.heat=Math.min(100,d.m.heat+6);why='関係が恋に変わった（'+nt.label+(nt.type==='worship'?'・恋愛に発展：する':'')+'）';}
else if(k==='dom'){nt.domDeep=true;u.m.reason=Math.max(0,u.m.reason-6);why=d.name+'は'+u.name+'の信仰を利用して、支配を深めた（'+u.name+'の理性 -6）';}
else{
nt.bond+=2;u.m.reason=Math.min(100,u.m.reason+6);d.m.reason=Math.min(100,d.m.reason+6);
if(nt.type==='benefactor')eff={prog:12};
why={colleague:'仕事仲間としての信頼が深まった',classmate:'昔話から、途切れていた縁が結び直された',boss:'職場の外で、二人は対等に並んだ',benefactor:d.name+'が恩を返した（仕掛けが進んだ）',relative:'家族としての絆が結び直された',worship:u.name+'の想いは揺らがない'}[nt.type]+'（理性 +6）';
}
var a0=nt.dir?u:rng()<0.5?u:d,b0=a0===u?d:u;
var o=ST.sayB(S,{actors:nt.dir?[u,d]:[a0,b0],tag:k==='rom'?'恋に変わる':k==='dom'?'支配と服従':DEV_TAG[nt.type],text:ST.fmt(LK.pick(S,pool),vars(nt,a0,b0)),why:why,mag:22},u.name+'と'+d.name+'：'+(k==='rom'?'恋に変わる':DEV_TAG[nt.type]),true);
if(o)ST.key(S,o,u.name+'と'+d.name+'の関係が'+(k==='rom'?'恋に変わった':k==='dom'?'支配と服従に深まった':'深まった'));
return eff;
}
if(!nt.kept&&c.turn>=1&&rng()<0.35){
nt.kept=true;nt.bond++;
var arr=nt.type==='worship'?KEEP.worship[nt.cold]||KEEP.worship['']:KEEP[nt.type];
var ru=nt.dom?0:4,rd=nt.type==='boss'?5:4;
u.m.reason=Math.min(100,u.m.reason+ru);d.m.reason=Math.min(100,d.m.reason+rd);
var a1=nt.dir?u:rng()<0.5?u:d,b1=a1===u?d:u;
ST.sayB(S,{actors:nt.dir?[u,d]:[a1,b1],tag:KEEP_TAG[nt.type],text:ST.fmt(LK.pick(S,arr),vars(nt,a1,b1)),why:'いつもの関係を確かめ合った（'+nt.label+'／理性 '+u.name+' +'+ru+'・'+d.name+' +'+rd+'）',mag:14},u.name+'と'+d.name+'：'+KEEP_TAG[nt.type]);
return null;
}
if(nt.pats<2&&c.turn>=2&&rng()<0.22){
var P0=PAT[nt.type],side= !nt.dir?null:nt.patSide==='u'?(nt.type==='worship'?nt.cold:'d'):'u';
var arr2=side==null?P0:P0[side]||P0.u,a2=side==='u'||side==null?(rng()<0.5||nt.dir?u:d):d,b2=a2===u?d:u;
nt.pats++;
ST.sayB(S,{actors:[a2,b2],tag:PAT_TAG[nt.type],text:ST.fmt(LK.pick(S,arr2),vars(nt,a2,b2)),why:'二人の関係：'+nt.label,mag:10},a2.name+'と'+b2.name+'：'+PAT_TAG[nt.type]);
}
return null;
},
urge:function(nt,a){
var v=nt.rom?0.12:0;
if(nt.type==='boss')v-=0.05;
return v;
},
accW:function(nt,a,b){
var v=(nt.rom?0.2:0)+nt.bond*0.03;
if(nt.type==='worship')v+=b===nt.u?0.45:{warm:0.25,confused: -0.1,dom:0.2,unaware:0.05}[nt.g];
else if(nt.type==='benefactor')v+=b===nt.d?0.15:0.05;
else v+={colleague:0.05,classmate:0.08,boss:0,relative:0.05}[nt.type]||0;
return v;
},
ordTh:function(nt){return nt.dom?(nt.domDeep?0.2:0.4):nt.g==='warm'?(nt.rom?0.5:0.7):nt.g==='confused'?1.0:1.1;},
sv:function(nt){return{hold:SV.hold,break:SV.break,order:SV.order[nt.g]||SV.order.warm};},
refused:function(S,nt,a,b){
if(nt.type!=='worship'||a!==nt.u||b!==nt.d||nt.steady>=2||S.rng()>0.75)return'';
nt.steady++;
a.m.reason=Math.min(100,a.m.reason+4);
return ST.fmt(LK.pick(S,STEADY),vars(nt,a,b));
},
plotSoft:function(nt,po){return!!(nt&&nt.type==='worship'&&po===nt.u);},
afterNote:function(S,nt,outcome,plotter){
if(nt.type!=='worship')return'';
var hurt=nt.d.cnt.refuse>0||outcome==='angry'||(outcome==='plotfail'&&plotter===nt.u);
if(!hurt||nt.steady>=3)return'';
nt.steady++;
return ST.fmt(LK.pick(S,STEADY),vars(nt,nt.u,nt.d));
},
endLine:function(S,nt){
var E=ENDL[nt.type],k=nt.rom?'rom':nt.dom&&nt.domDeep?'dom':nt.bond>=1||nt.type==='worship'?'bond':null;
if(!k|| !E[k])return'';
var a=nt.dir||S.rng()<0.5?nt.u:nt.d;
return ST.fmt(LK.pick(S,E[k]),vars(nt,a,a===nt.u?nt.d:nt.u));
},
fate:function(nt,p){return p.broke?'崇める相手に手を伸ばしてしまった':p.ordered?(nt.dom?'命じられるままに身を委ねた':'許されて触れた'):p.cnt.hold?'最後まで崇める相手に触れなかった':'想いを捧げ続けた';},
tone:function(nt,rng){return nt.dom&& !nt.love?'rough':nt.rom||nt.type==='worship'?'sweet':rng()<0.5?'rough':'sweet';},
COUNT:function(){
var n=0;
function add(x){if(Array.isArray(x))n+=x.length;else if(x&&typeof x==='object')Object.keys(x).forEach(function(k){add(x[k]);});}
[PAT,KEEP,DEV,STEADY,SV,FIRST,AFTER,ENDL].forEach(add);
return n;
}
};
})();
});
;
/* ==== js/locker-crowd.js ==== */
HK.Load.def(178,'js/locker-crowd.js',function(){
(function(){
'use strict';
var HK=window.HK,LK=HK.LOCKER,ST=HK.Story;
var W_CL='高鳴り';
if(!LK|| !ST)return;
var clamp=HK.clamp;
function L(s){return s.split('|');}
var CW=LK.CROWD={};
CW.INTRO1=L('目を覚ますと、{a}は狭いロッカーの中に一人で立っていた。肩も背中も、冷たい金属の壁にぴたりと触れている。天井の小さな穴から、甘ったるい桃色の霧がしゅうしゅうと噴き出していた。|暗闇の中で、{a}は自分の息の音だけを聞いていた。手を伸ばすと、すぐに冷たい壁に触れる。鼻をくすぐる甘い匂いに気づいたのは、そのあとだった。|がしゃん、と扉の閉まる音で、{a}は我に返った。人ひとりがやっと入れる幅のロッカーだった。足元の通気口から、桃色の霧が細くたなびいている。');
CW.BIND1={
cuff:L('{a}の両手は、背中で手錠につながれていた。鎖はロッカーの内側のフックに引っかけられている。|{a}の手首には、柔らかい革の手錠が巻かれていた。後ろ手のままでは、扉に触れることもできない。|{a}の両手は、頭の上のフックに手錠でまとめられていた。体をひねるたび、鎖がちゃりと鳴った。'),
none:L('手足は自由だった。けれど、肘を曲げるだけで壁に当たるほど狭い。|拘束はされていなかった。ただ、しゃがむことさえできない狭さだった。|{a}の手は自由だった。扉を押してみたが、外から鍵がかかっているのか、びくともしない。')
};
CW.SPEAKER1=L('どこかのスピーカーから、加工された声が響いた。「ようこそ、媚薬ロッカーへ。今回のお客様はお一人。誰にも頼れないぶん、どうぞ存分に楽しんで」|スピーカーがざらりと鳴った。「仕掛けを解けば扉は開く。ガスは五分ごとに濃くなる。一人きりで、どこまで耐えられるかな」|天井のスピーカーが、くすくすと笑った。「お相手はいない。だから、何をしても誰にも見られない。……運が悪ければ、見回りの人には見られるけど」');
CW.GAS1_SOFT=[
L('甘い香りが鼻の奥にまとわりつく。{a}の頬が、じわりと熱を帯びてきた。|{a}は額に浮いた汗を、肩でぬぐった。狭い箱の中が、急に暑くなった気がする。|{a}は袖で額を拭った。狭い箱の中の空気が、少しずつ重くなっていく。'),
L('{a}の呼吸が浅くなった。甘ったるい匂いのせいで、頭の芯がぼんやりする。|{a}はこめかみを押さえた。熱っぽさが、首の後ろからじわじわ広がってくる。|{a}は換気口のほうへ顔を向けて、少しでも冷たい空気を探した。'),
L('{a}の視界がゆっくり揺れた。立っているのがやっとだった。|{a}は壁に額を押し当てた。ひんやりした金属だけが、意識をつなぎとめてくれる。|{a}は奥歯を噛みしめた。熱に浮かされたような頭で、それでも出口のことを考えた。'),
L('{a}は熱にうなされたように、ぐったりと壁にもたれかかった。|{a}の意識が、ときどき途切れそうになる。それでも{a}は、自分の頬を叩いて目を開けた。|{a}は額の汗を拭うこともできず、ただ浅い息を繰り返した。')
];
CW.ENDURE1={
proud:L('{a}は舌打ちして、ロッカーの壁を拳で殴った。「……ふざけんな。こんなガスに、負けてたまるか」|{a}は歯を食いしばった。「誰が見てるか知らねえが、思いどおりになってやるかよ」|{a}は額を壁に打ちつけた。鈍い痛みで、熱を無理やり追い払った。'),
stern:L('{a}は目を閉じ、ゆっくりと呼吸を数えた。「……一、二、三。乱れるな」|{a}は背筋を伸ばし、熱に揺れる体を意志だけで押さえつけた。「この程度で、己を見失うものか」|{a}は拳を握りしめ、爪が手のひらに食い込む痛みに意識を集めた。'),
tsun:L('{a}はぶんぶんと首を振った。「べ、別に、なんともないし！　ただ暑いだけだし！」|{a}は自分の頬をぺちんと叩いた。「しゃんとしなさいよ、私！」|{a}は壁を睨みつけた。「こんなので、どうにかなるわけないでしょ！」'),
gentle:L('{a}は胸に手を当てて、ゆっくりと息を吐いた。「大丈夫、大丈夫……落ち着こうね」|{a}は自分に言い聞かせるように、小さく子守唄を口ずさんだ。|{a}は「焦らない、焦らない」と呟いて、扉の継ぎ目に指を添えた。'),
devoted:L('{a}は唇を結んで、じっと耐えた。「がまん。がまん、しなきゃ」|{a}は大切な人の顔を思い浮かべて、ぎゅっと目を閉じた。「……ちゃんと、帰らなきゃ」|{a}は震える膝に力を込めた。「まだ、大丈夫です……まだ……」'),
cool:L('{a}は浅い呼吸を意識して整えた。「……ガスの濃度は上がる一方。なら、体温が上がりきる前に出るだけだ」|{a}は頭の中で円周率を唱え始めた。三桁目あたりで、また体の熱がぶり返した。|{a}は「これは薬の作用だ。気持ちじゃない」と、小さく声に出して確かめた。'),
free:L('{a}は「あーもう、あっつい！」と叫んで、ロッカーの中でじたばたした。叫ぶと少しだけ楽になった。|{a}は好きな歌を大声で歌い始めた。サビのところで、声が裏返った。|{a}は「よーし、こうなったら耐久チャレンジ！」と自分で宣言した。'),
shy:L('{a}は真っ赤な顔で、壁に額を押しつけた。「だ、誰も見てない……でも、だめ……」|{a}は自分の腕で自分を抱きしめ、小さく縮こまった。|{a}はぎゅっと目をつぶって、心の中で何度も「出たら帰る、出たら帰る」と繰り返した。'),
polite:L('{a}は小さく咳払いをした。「いけませんね。気を確かに持たなくては」|{a}は乱れかけた襟元を、きちんと整え直した。|{a}は深く息を吐いた。「取り乱すわけには、まいりません」')
};
CW.ENDURE1_BOUND=L('手錠の鎖が、{a}の身じろぎに合わせてちゃりちゃりと鳴った。手が使えないぶん、熱の逃がし場所がどこにもない。|{a}は後ろ手のまま、壁に背中を押しつけた。冷たい金属だけが、わずかな救いだった。|{a}は鎖を引っ張ってみた。フックはびくともしなかった。それでも、何かしていないと気が変になりそうだった。');
CW.QUIET1=L('{a}は浅い呼吸を繰り返しながら、扉の隙間から差す一筋の光を見つめていた。|{a}は耳を澄ませた。聞こえるのは、ガスの噴き出す音と、自分の心臓の音だけだった。|{a}はじっと動かずに、次の手を考えた。考えることがあるうちは、まだ大丈夫だった。');
CW.SURGE1=L('換気口から、ひときわ濃いガスが噴き出した。{a}は思わずむせて、壁に手をついた。|ロッカーががたんと揺れた。{a}の体が壁に押しつけられ、ガスが顔にまともにかかった。|照明が消えた。真っ暗な箱の中で、甘い匂いだけがいっそう濃くなった。');
CW.CALM1=L('通気口から、少しだけ冷たい空気が流れ込んだ。{a}は深呼吸をして、わずかに理性を取り戻した。|{a}は自分の唇を噛んで、痛みで正気を保とうとした。|ガスの噴き出す音が、しばらく止まった。{a}はその隙に、ゆっくりと呼吸を整えた。');
CW.FIND={
calm:L('外から足音が近づいてきた。「＠誰か入ってますかー？」――{mr}の声だった。扉が開き、{a}は外の空気を胸いっぱいに吸い込んだ。|がちゃがちゃと鍵の回る音がして、扉が開いた。懐中電灯を持った{mr}が、目を丸くしていた。「＠……え、人？　大丈夫ですか」|館内の見回りをしていた{mr}が、ロッカーの中の物音に気づいた。合鍵で扉が開くと、甘い霧がふわりと廊下へ流れ出た。'),
hot:L('扉が開いた瞬間、{a}はほとんど倒れ込むようにして外へ出た。受け止めたのは、{mr}だった。「＠わ、熱い。大丈夫ですか」|「＠誰かいますかー」――{mr}が扉を開けると、真っ赤な顔の{a}がずるずると崩れ落ちてきた。{m}は慌てて{a}の肩を支えた。|合鍵で扉を開けた{mr}は、漏れ出した甘い霧に思わず咳き込んだ。中では{a}が、熱に浮かされた目でこちらを見上げていた。')
};
CW.HELP=L('{m}は何も聞かずに、自販機で買った冷たい水を差し出した。{a}はそれを一気に飲み干して、ようやく息をついた。|{m}は{a}を廊下のベンチに座らせ、窓を全開にした。「＠しばらく風に当たっていてください。何があったのか、聞かないでおきます」|{m}は上着を脱いで{a}の肩にかけた。「＠医務室、行きます？」――{a}は首を横に振るのが精一杯だった。');
CW.ASK_NO=L('{a}は{m}の袖を掴みかけて、その手を自分で引っ込めた。「……なんでもない。水、もらえる？」|{a}の視線に気づいた{m}は、困ったように笑って一歩下がった。「＠今のあなたに何かするのは、ずるい気がするので」|{a}は熱っぽい目で{m}を見上げたが、{m}は首を振って、そっと{a}の肩を押し戻した。「＠ガスが抜けるまで、ここで待ってます」');
CW.END1={
clean:L('{a}は扉を押し開けて、外の廊下に転がり出た。一人きりで耐えきった達成感と、ひどい疲れが同時に押し寄せた。|扉が開いた。{a}は壁に手をついて、ゆっくりと外へ出た。誰にも会わなかったのは、たぶん幸運だった。|ロックの外れる音を聞いた瞬間、{a}は全身の力が抜けた。這うようにして外に出ると、廊下の空気がやけに冷たく感じた。'),
found:L('{a}は{m}に支えられて、廊下の端まで歩いた。お礼を言うと、{m}は「＠お大事に」とだけ言って去っていった。|水を飲み終えた{a}は、深々と頭を下げた。{m}は手を振って、見回りに戻っていった。名前を聞きそびれたことに気づいたのは、ずいぶんあとだった。|{m}が呼んだ係の人に付き添われて、{a}は建物の外へ出た。夜風に当たると、ようやく頭がはっきりしてきた。'),
luck:L('扉の向こうで、何かが外れる音がした。ガスのタンクが空になったらしい。{a}は恐る恐る扉を押して、外へ出た。|館内放送が流れた。「設備点検のため、全てのロックを解除します」――{a}は耳を疑いながら、開いた扉から外へ出た。|突然、ロッカーの扉がひとりでに開いた。{a}はしばらく呆然としてから、そろそろと外へ足を出した。'),
timeout:L('ブザーが鳴り、扉がひとりでに開いた。{a}はその場にへたり込み、しばらく立ち上がれなかった。|時間切れを告げる音とともに、ロックが外れた。{a}は扉にもたれたまま、ずるずると外へ滑り出た。|スピーカーが「お疲れさまでした」と言った。扉が開いても、{a}はしばらく動けなかった。')
};
CW.INTRO_G=L('目を覚ますと、{all}は薄暗い用具倉庫の中にいた。壁際に、人が入れるほどのロッカーがずらりと並んでいる。扉には小さな覗き窓。天井の穴から、甘ったるい桃色の霧がしゅうしゅうと噴き出していた。|「……どこ、ここ｜……ここは、どこだ｜……ここは、どこですか」――誰かの声が、金属の壁越しにくぐもって聞こえた。{all}は、古い倉庫のロッカーに、ばらばらに押し込まれていた。足元から、甘い霧が細くたなびいている。|がしゃん、がしゃんと、扉の閉まる音が続けざまに響いた。{all}が気づいたときには、倉庫に並ぶロッカーの中に閉じ込められていた。');
CW.BIND_G={
both:L('全員の両手が、背中で手錠につながれていた。|どのロッカーの中でも、全員が後ろ手に手錠をかけられていた。鎖が鳴るたび、隣の箱からも同じ音が返ってきた。|手首には、全員そろって柔らかい革の手錠。身じろぎするたびに、隣にいる誰かと体が擦れ合った。'),
one:L('どのロッカーでも、一人だけが手錠につながれていた。|手錠をかけられているのは、ロッカーごとに一人ずつ。残りの人の手は自由だった。|それぞれのロッカーで、誰か一人の両手だけが、頭の上のフックにまとめられていた。'),
none:L('拘束はされていなかった。ただ、どのロッカーも狭すぎて、腕を上げることすらままならない。|手足は自由だった。けれど、少しでも動けば、同じ箱の誰かと必ずどこかが触れ合ってしまう。|手錠はない。そのかわり、ロッカーには人が詰め込まれすぎていた。')
};
CW.SPEAKER_G=L('どこかのスピーカーから、加工された声が響いた。「ようこそ、媚薬ロッカーへ。今回は大勢でのご来場、ありがとう。ロッカーは、仕掛けが解ければ全部一斉に開く。……誰と一緒に閉じ込められたかは、運次第」|スピーカーがざらりと鳴った。「ガスは五分ごとに濃くなる。隣の箱の声は、よく聞こえるように作ってある。せいぜい、仲良くね」|天井のスピーカーが、くすくすと笑った。「仕掛けは一つずつ。誰かが解けば、全員が出られる。誰と誰がくっついているかは……出てからのお楽しみ」');
CW.LAY={
pair:L('{a}と{b}は、同じロッカーに押し込まれていた。胸と胸が触れ合うほど近い。|{a}が身じろぎすると、すぐそばで{b}の息がかかった。同じ箱の中だった。|{a}の背中に、{b}の体温がぴたりと貼りついていた。二人で一つのロッカーだった。'),
trio:L('{a}は、{b}と{c}のあいだに挟まれていた。大きめのロッカーとはいえ、三人では身動きもできない。|三人用の掃除用具入れに、{a}・{b}・{c}がぎゅうぎゅうに押し込まれていた。真ん中の{a}は、前にも後ろにも逃げ場がない。|{a}の右肩には{b}が、左肩には{c}が押しつけられていた。三人の体温が、狭い箱の中で混ざり合った。'),
alone:L('{a}は一人だけ、端のロッカーに入れられていた。隣から、誰かの息づかいが壁越しに聞こえてくる。|{a}のロッカーには、ほかに誰もいなかった。幸運なのか、そうでないのか、まだ分からない。|{a}は一人きりの狭いロッカーで、隣の壁をこんこんと叩いた。返事のように、向こうからも叩き返す音がした。')
};
CW.SHIFT=L('ロッカーががくんと傾いた。三人の体が一斉にずれて、今度は{a}が{b}と{c}のあいだに押し込まれた。|{b}が足を踏み替えた拍子に、三人の並びががらりとずれた。真ん中に来たのは、{a}だった。|照明が一瞬消えて、誰かがよろけた。明かりが戻ると、{a}が{b}と{c}に挟まれていた。');
CW.SURGE_G=L('換気口から、ひときわ濃いガスが噴き出した。あちこちのロッカーから、同時にむせる声が上がった。|倉庫全体が大きく揺れた。どのロッカーの中でも、体と体がさらに強く押しつけられた。|照明が消えた。真っ暗な倉庫の中で、あちこちから浅い息づかいだけが聞こえた。');
CW.CALM_G=L('倉庫の高窓から、冷たい夜風が流れ込んだ。あちこちのロッカーで、ほっと息をつく音がした。|「深呼吸！　みんな、深呼吸！｜深呼吸だ！　みんな、深呼吸しろ！｜深呼吸です！　みんな、深呼吸してください！」――誰かの声につられて全員が息を吸い、わずかに理性が戻った。|ガスの噴き出す音が、しばらく止まった。誰からともなく、ロッカー越しに「大丈夫？｜大丈夫か｜大丈夫ですか」と声を掛け合った。');
CW.QUIET_G=L('倉庫の中は静かだった。どのロッカーからも、浅い呼吸の音だけが聞こえていた。|誰も口をきかなかった。ガスの噴き出す音だけが、規則正しく続いていた。|ロッカーの覗き窓が、甘い霧で白く曇っていった。');
CW.J={
pressed:L('{a}の覗き窓から、向かいのロッカーが見えた。{b}と{c}が、隙間もないほど体を寄せ合っている。仕方ないことだと分かっていても、{a}は目を逸らせなかった。|「そっち、狭くない？｜そっちは、狭くないか｜そちら、狭くないですか」――{a}が{b}に声をかけると、答えたのは{c}だった。「大丈夫、くっついてるから｜大丈夫だ、くっついているからな｜大丈夫です、くっついていますから」。{a}の胸に、小さな棘が刺さった。|{a}は、{b}が{c}と同じロッカーに入れられていると知って、急に落ち着かなくなった。ガスのせいだ、と自分に言い聞かせても、胸のざわつきは収まらなかった。'),
hear:L('壁の向こうから、{b}の押し殺した声が聞こえた。{c}の名前を呼んでいる。{a}は思わず、ロッカーの壁に拳を押し当てた。胸の奥が、ガスとは違う熱でちりちりと焼けた。|隣のロッカーが、かたかたと小さく揺れていた。中にいるのは{b}と{c}だ。{a}は耳を塞ぎたいのに、どうしても聞き耳を立ててしまう自分が嫌だった。|「{b}……？」――{a}が壁越しに呼びかけると、隣の物音がぴたりと止まった。返事の代わりに聞こえたのは、{c}の小さな笑い声だった。{a}は唇を噛んだ。'),
watch:L('同じ箱に押し込まれた{a}は、逃げることもできずに、{b}と{c}のそれを一番近くで見ているしかなかった。|{a}の肩越しに、{b}の手が{c}の頬に触れた。{a}は気づかないふりをしたが、握りしめた拳は震えていた。|{b}が{c}にもたれかかるたび、{a}の胸がきゅっと痛んだ。「……ずるい｜……ずるいぞ｜……ずるいです」と、声にならない声が漏れた。'),
rival:L('「{b}、大丈夫？｜{b}、大丈夫か｜{b}、大丈夫ですか」――{a}と{c}の声が、ほとんど同時に飛んだ。二人は一瞬黙り込み、互いの気配を探った。|{a}が{b}を励ますと、すかさず{c}も声を張り上げた。{b}を挟んで、見えない張り合いが始まった。|{a}は、{c}が{b}を気にかける声の調子に気づいた。たぶん、向こうも同じことに気づいている。狭い倉庫の空気が、ガスとは別の意味で重くなった。'),
lost:L('{b}が{c}の名前を呼ぶ声は、{a}が一度も聞いたことのない響きをしていた。{a}は静かに目を閉じた。ああ、そういうことか、と思った。|{a}は壁越しに、{b}と{c}が小さく笑い合うのを聞いた。その笑い声に、{a}の入る隙間はどこにもなかった。|覗き窓の向こうで、{b}は{c}だけを見ていた。{a}はそっと窓から目を離した。ガスの熱より、胸の痛みのほうがずっと重かった。')
};
CW.J.envy=L('隣のロッカーから、{b}と{c}のひそひそ声が聞こえてくる。一人で熱をこらえている{a}には、それが妬ましくてたまらなかった。|覗き窓の向こうで、{b}と{c}が寄り添っていた。{a}は、自分だけが取り残されたような気がして、唇を尖らせた。|{b}と{c}のロッカーだけ、なんだか楽しそうだった。{a}は壁を軽く蹴った。「いいなー、そっちは｜いいな、そっちは｜いいですね、そちらは」――声には、隠しきれない妬みがにじんでいた。');
CW.J_TAG={pressed:'やきもち',hear:'嫉妬',watch:'嫉妬',rival:'取り合い',lost:'失恋',envy:'やっかみ'};
CW.J_WHY={pressed:'が別の人と同じロッカーに押し込まれているのを見て、やきもちを焼いた',hear:'が隣のロッカーで別の人と触れ合う気配に、嫉妬した',watch:'が同じロッカーで別の人と唇を重ねるのを、すぐそばで見て嫉妬した',rival:'を想う人がもう一人いると気づいて、張り合った',lost:'の気持ちが別の人に向いていると悟って、失恋した',envy:'たちが寄り添う気配に、取り残された気がして妬ましくなった'};
CW.JSAY={
proud:L('「ちぇ。勝手にしろ」|「ふざけんな……そいつに、触んな」|「……別に。どうでもいい」'),
stern:L('「今は、脱出が先だ」|「……見苦しいぞ、私」|「……気にしていない。していない、はずだ」'),
tsun:L('「べ、別に、気にしてないし！」|「……ばか。ばかばか」|「な、なによ、楽しそうにしちゃって」'),
gentle:L('「……ううん、仕方ないよね」|「……大丈夫。大丈夫だから」|「そうか。そうだよね」'),
devoted:L('「……わたしじゃ、だめなのかな」|「我慢、しなきゃ」|「……いいんです。わたしは、平気ですから」'),
cool:L('「……合理的に考えれば、気にする理由はない。……ない、はずだ」|「……くだらない」|「……ガスのせいだ。そういうことにしておく」'),
free:L('「えー……なにそれ、ずるくない？」|「……あー、もやもやするー！」|「ちぇー、つまんないの」'),
shy:L('「き、聞こえてないふり、聞こえてないふり」|「……う、うう……」|「……い、いいな……」'),
polite:L('「……失礼。少し、取り乱しました」|「……お邪魔は、いたしません」|「……お気になさらず。わたくしは、大丈夫です」')
};
CW.W={
cheer:L('{a}が壁越しに声を張り上げた。「{b}も{c}も、がんばれ！　もうすぐ出られるから！｜{b}も{c}も、踏ん張れ！　もうすぐ出られるぞ！｜{b}も{c}も、がんばってください！　もうすぐ出られますから！」――向こうのロッカーから、ほっとしたような笑い声が返ってきた。|「そっちの二人、生きてるー？｜そっちの二人、生きているか｜そちらのお二人、生きていますか」――{a}の呑気な声に、{b}と{c}が同時に吹き出した。張りつめていた空気が、少しだけ緩んだ。|{a}は覗き窓越しに、{b}と{c}に向かって親指を立てた。言葉はなくても、「大丈夫」と伝わった気がした。'),
relay:L('{a}が見つけたヒントを、{b}が隣のロッカーへ叫んで伝え、{c}がそれを仕掛けに打ち込んだ。三人がかりの伝言ゲームで、仕掛けが少し進んだ。|「四桁目、たぶん7！｜四桁目は、たぶん7だ！｜四桁目、たぶん7です！」――{a}の声に、{b}が「了解！｜了解した！｜了解です！」と返し、{c}が手を伸ばした。ばらばらのロッカーにいても、息はぴったりだった。|{b}が読み上げた手がかりに、{a}と{c}が壁越しに答えを出し合った。三人で考えると、ガスのことを少しだけ忘れられた。'),
reassure:L('「{b}、気にしなくていいからね。ガスのせいなんだから｜{b}、気にしなくていい。ガスのせいなのだから｜{b}、気にしなくていいですからね。ガスのせいなんですから」――{a}の声が、壁越しに届いた。{b}の肩から力が抜けるのを、すぐ隣の{c}も感じていた。|{a}は覗き窓越しに、{b}に向かって笑ってみせた。「{c}と一緒なら安心。ちゃんと出てきてね｜{c}と一緒なら安心だ。ちゃんと出てこい｜{c}と一緒なら安心です。ちゃんと出てきてくださいね」――{c}も、照れくさそうに頷いた。|{b}が「ごめんね。{c}と密着しちゃってて｜すまない。{c}と密着してしまっている｜すみません。{c}と密着してしまっているんです」と謝ると、{a}は笑った。「謝ることじゃないよ。二人とも、無事に出よう｜謝ることではない。二人とも、無事に出よう｜謝ることじゃないですよ。お二人とも、無事に出ましょう」'),
tease:L('「ねえ、誰か今くしゃみした？｜おい、誰か今くしゃみをしたか｜あの、どなたか今くしゃみしましたか」「してない！｜していない！｜してません！」「した！｜＝｜しました！」――{a}と{b}と{c}の言い合いに、あちこちのロッカーから笑い声が上がった。|{a}が「出たらみんなで冷たいもの食べに行こう｜出たらみんなで冷たいものを食べに行こう｜出たらみんなで冷たいものを食べに行きましょう」と言うと、{b}が「かき氷！」、{c}が「アイス！」と即答した。三人とも、少しだけ元気が出た。|{a}がしりとりを始めると、{b}と{c}も壁越しに乗ってきた。熱で言葉がおかしくなるたびに、三人で笑い転げた。'),
bless:L('隣のロッカーから、{b}の「……好き｜……好きだ｜……好きです」という小さな声が聞こえた。{a}は思わず、壁越しに拍手を送った。「おめでとう！　出たら、ちゃんと聞かせてよね｜おめでとう！　出たら、ちゃんと聞かせてもらうぞ｜おめでとうございます！　出たら、ちゃんと聞かせてくださいね」|{b}と{c}の距離が縮まったことに、{a}はとっくに気づいていた。「いいじゃない、二人とも。おめでとう｜いいじゃないか、二人とも。おめでとう｜いいですね、お二人とも。おめでとうございます」――壁越しの声は、心からうれしそうだった。|{a}は覗き窓越しに、寄り添う{b}と{c}を見て、そっと微笑んだ。「……お似合いだよ、ほんとに｜……本当に、お似合いだ｜……本当に、お似合いです」'),
kind:L('すぐ隣で{b}と{c}が身を寄せ合っても、{a}は目を閉じて、二人の肩をそっと抱き寄せた。「……いいよ。見てないから｜……いい。見ていないからな｜……いいですよ。見ていませんから」|{a}は、寄り添う{b}と{c}のために、体をずらして少しだけ隙間を作った。「ごゆっくり。狭いけどね｜ごゆっくり。狭いがな｜狭いですけど、ごゆっくりどうぞ」|{b}と{c}の様子に気づいた{a}は、くすっと笑って、壁のほうを向いた。「出たら、ちゃんと教えてね｜出たら、ちゃんと教えろ｜出たら、ちゃんと教えてくださいね」'),
trio:L('三人は、狭いロッカーの中で額を寄せ合った。「三人一緒でよかった｜＝｜三人一緒でよかったです」と{a}が言うと、{b}と{c}も小さく笑った。|{a}は、右と左から押しつけられる{b}と{c}の手を、片方ずつ握った。三人分の鼓動が、手のひらから伝わってきた。|「この狭さにも、もう慣れたね｜この狭さにも、もう慣れたな｜この狭さにも、もう慣れましたね」――{b}の言葉に、{a}と{c}が同時に吹き出した。笑うたびに、三人の体が一緒に揺れた。')
};
CW.W_TAG={cheer:'応援',relay:'伝言リレー',reassure:'励まし',tease:'笑い合う',bless:'祝福',kind:'見守る',trio:'寄り添う三人'};
CW.W_WHY={cheer:'が、別のロッカーの二人を励ました',relay:'たちが、ロッカー越しに手がかりを伝え合った（仕掛けが進む）',reassure:'が、別の人とくっついている恋人を気遣った',tease:'が、ロッカー越しに冗談を言い合った',bless:'が、距離の縮まった二人を祝った',kind:'が、同じロッカーで寄り添う二人を見守った',trio:'は、三人で寄り添って熱をやり過ごした'};
CW.T3={
touch:L('三人は、どちらからともなく互いの背中に腕を回した。誰の心臓の音なのか、もう分からなかった。|{a}は{b}と{c}をまとめて抱き寄せた。三人分の体温で、ロッカーの中はますます熱くなった。|{b}が{a}の肩に頬をのせ、{c}がその背中にもたれた。三人は、そのまましばらく動かなかった。'),
kiss:L('{a}は{b}に、{b}は{c}に、{c}は{a}に。三人は狭い箱の中で、順番に唇を重ねた。|{a}が{b}の唇を塞ぐと、{c}が待ちきれずに{a}の頬に口づけた。三人の息が、熱く混ざり合った。|三人は額を寄せ合い、誰からともなく唇を寄せた。誰と誰が触れているのか、途中から分からなくなった。')
};
CW.END_G={
open:L('仕掛けが解けると、倉庫中のロッカーが一斉に開いた。{all}はふらふらと外へ出て、互いの無事を確かめ合った。|ロックの外れる音が、あちこちで重なった。全員が倉庫の床に座り込み、しばらく誰も口をきかなかった。やがて、誰かが笑い出した。|扉が開くと、冷たい空気が倉庫に流れ込んだ。{all}は顔を見合わせて、ほっと息をついた。'),
luck:L('外から足音が聞こえた。「＠誰か入ってますかー？」――見回りの人の合鍵で、ロッカーが次々と開いた。|倉庫の照明がぱっと点き、館内放送が流れた。「設備点検のため、全てのロックを解除します」――{all}は顔を見合わせた。|ガスのタンクが空になったのか、ロッカーの扉が一斉にひとりでに開いた。'),
timeout:L('ブザーが鳴り、ロッカーの扉が一斉に開いた。時間切れだった。{all}は這うようにして外へ出た。|時間切れを告げる音とともに、全部のロックが外れた。誰もが、しばらく立ち上がれなかった。|スピーカーが「お疲れさまでした」と告げ、扉が次々と開いた。倉庫の床に、ぐったりした体が並んだ。')
};
CW.MOOD={
warm:L('帰り道、{all}は肩を並べて歩いた。ロッカーの中のことは、誰もからかわなかった。|「次は、普通の場所で集まろうね｜次は、普通の場所で集まろう｜次は、普通の場所で集まりましょうね」――誰かの言葉に、全員が苦笑いで頷いた。|{all}は、近くのコンビニで冷たい飲み物を買って乾杯した。散々な夜だったが、なぜか悪くない気分だった。'),
jeal:L('倉庫を出たあとも、{a}は{b}の顔をまっすぐに見られなかった。胸のもやもやは、ガスが抜けても消えなかった。|{a}は一人だけ先に倉庫を出た。{b}が誰と一緒だったかを、思い出したくなかった。|帰り道、{a}は{b}の隣を歩いた。何か言いたいのに、言葉にすると嫉妬になりそうで、黙っていた。'),
lost:L('{a}は笑って「おめでとう｜＝｜おめでとうございます」と言った。言えた自分を、少しだけ褒めてやりたかった。|{a}は、並んで歩く{b}と{c}の背中を見送った。失恋の痛みは、ガスよりもずっと長く残りそうだった。|{a}はその夜、一人で少しだけ泣いた。それから、次の朝には、いつもの顔で{b}に挨拶をした。')
};
var ROMT= /^(lover|mate|fated|fwb|crush|almost|ex|master|honmei|yan|worship)$/;
function tiesOf(S,a,b){return(S.ties||[]).filter(function(t){return(t.a===a.i&&t.b===b.i)||(t.a===b.i&&t.b===a.i);});}
function has(S,a,b,re,dir){return tiesOf(S,a,b).some(function(t){return re.test(t.type)&&(!dir||t.a===a.i);});}
function noLoveTie(S,a,b){
var tl=tiesOf(S,a,b);
if(tl.some(function(t){return/^(lover|mate|fated|fwb|crush|almost|ex|master)$/.test(t.type);}))return false;
return tl.some(function(t){return(HK.tieNoLove&&HK.tieNoLove(t))||(t.type==='worship'&&HK.tieOptNoLove&&HK.tieOptNoLove(t));});
}
function okLove(a,b){return!!(a&&b&&a!==b)&&(LK.loveOK?LK.loveOK(a,b):HK.canLove(a,b)&&HK.canLove(b,a));}
function canAct(S,a,b){
if(!a|| !b||a===b)return false;
if(HK.Pos&& !HK.Pos.okSex(a,b))return false;
if(HK.ngPair&&HK.ngPair(a,b)&& !freeOk(S,a,b))return false;
if(HK.sexBlocked&&HK.sexBlocked(a,b))return false;
if(!(okLove(a,b)||freeOk(S,a,b))||noLoveTie(S,a,b))return false;
if(!HK.SAFE_ON&& !(HK.State.r18ok(a)&&HK.State.r18ok(b)))return false;
return true;
}
function freeOk(S,a,b){return!!(HK.State.freeSex&&HK.State.freeSex(S,a,b));}
LK.crowdOk=canAct;
function interest(S,a,b){
if(!okLove(a,b)||noLoveTie(S,a,b))return false;
if(a.honmei===b.i||a.secret===b.i)return true;
return tiesOf(S,a,b).some(function(t){return/^(lover|mate|fated|almost|fwb)$/.test(t.type)||(/^(crush|yan)$/.test(t.type)&&t.a===a.i);});
}
function hardTop(p){return!!(HK.Pos&&HK.Pos.hardTop(p));}
function isF(p){return!!(HK.Pos&&HK.Pos.isF(p));}
function modeOf(t,u){return isF(t)&&isF(u)?'ff':isF(t)?'fm':'ins';}
function loyal(S,a,b){return S.P.some(function(q){return q!==a&&q!==b&&has(S,a,q,/^(lover|mate|fated)$/)&&okLove(a,q);});}
function desperate(p){return!!(HK.honmeiDesperate&&HK.honmeiDesperate(null,p));}
function stage(p){return p.m.heat>=85?3:p.m.heat>=60?2:p.m.heat>=35?1:0;}
function setup(input){
var S=ST.state(input,'locker'),env=S.env;
S.ties=(HK.Story&&HK.Story.tiesOk?HK.Story.tiesOk(S.P,input.ties):input.ties||[]);
S.lew=env.lewd||'mid';
S.R18= !HK.SAFE_ON&&S.lew!=='low';
var LX=HK.Lewd,lcf=LX&&LX.conf('locker');
S.eroOn= !!(lcf&&HK.Ero&&HK.Ero.on(S)&&HK.ThickEro&&S.R18);
S.pk=function(arr){return LK.pick(S,arr);};
S.P.forEach(function(p){
p.m={heat:0,reason:clamp(70+p.tr.cp*15+(p.stats.gaman||3)*3,40,100),plea:0,esc:0};
p.cnt={make:0,refuse:0,accept:0,climax:0,solve:0,hold:0,self:0,jeal:0,warm:0};
p.sens=(0.6+(6-(p.stats.gaman||3))*0.1-p.tr.cp*0.15)*(0.7+S.rng()*0.7);
var pc=(input.perChar&&input.perChar[p.i])||{};
p.action=pickFit(S,LK.SCEN.actions,pc.action,p);p.goal=pickFit(S,LK.SCEN.goals,pc.goal,p);
});
return S;
}
function pickFit(S,list,id,p){if(id&&id!=='auto')for(var i=0;i<list.length;i++)if(list[i].id===id)return list[i];return HK.weighted(S.rng,list,function(o){return Math.pow(Math.max(0.02,o.fit(p.tr)),3);});}
function soft(arr,p){if(!p|| !p.noR18|| !arr|| !arr.filter)return arr;var f=arr.filter(function(l){return!/喘ぎ|発情|濡れ|疼/.test(l);});return f.length?f:arr;}
function gasStep(S,p,mate){
var before=Math.max(stage(p),p.gasShown||0),env=S.env;
p.m.heat=clamp(p.m.heat+(4+env.dose*0.1+S.rng()*4)*p.sens,0,100);
p.m.reason=clamp(p.m.reason-(3+p.m.heat*0.13-(p.stats.gaman||3)*0.7-p.tr.cp*2),0,100);
var after=stage(p);
if(after<=before)return;
p.gasShown=after;
var sf=p.noR18||HK.SAFE_ON,pool;
if(mate&&canAct(S,p,mate))pool=(sf&&LK.GAS_SOFT?LK.GAS_SOFT:LK.GAS)[after];
else pool=(sf?CW.GAS1_SOFT:CW.GAS1)[after];
ST.sayB(S,{actors:[p],tag:['','火照り','発情','限界'][after],text:ST.fmt(S.pk(pool),{a:p.name,b:mate?mate.name:''}),why:p.name+'の発情 '+Math.round(p.m.heat)+'・理性 '+Math.round(p.m.reason)+'（我慢 '+p.stats.gaman+'）',mag:after*6},p.name+'の発情が進んだ',after>=3);
}
function gimmickChain(S){
var g=[],rng=S.rng,others=LK.GIMMICK.filter(function(x){return!x.bind&& !x.lewd;});
if(S.bind!=='none')g.push(LK.GIMMICK.filter(function(x){return x.bind;})[0]);
var first=rng.pick(others);g.push(first);
if(rng()<0.5+S.env.diff/200)g.push(rng.pick(others.filter(function(x){return x!==first;})));
return g;
}
function gLines(arr,mate){var f=arr.filter(function(l){return!/二人/.test(l)&&(mate||l.indexOf('{b}')<0);});return f.length?f:['{a}は、仕掛けにもう一度手を伸ばした。'];}
function solveStep(S,G,workers,lewdNow){
if(!G|| !workers.length)return false;
var env=S.env,rng=S.rng;
var wk=workers.slice().sort(function(x,y){return(y.stats.dex*G.dex+y.tr.a*5*G.brain)-(x.stats.dex*G.dex+x.tr.a*5*G.brain);})[0];
var pw=10+(wk.stats.dex||3)*6*G.dex+wk.tr.a*30*G.brain+rng()*28+Math.min(3,workers.length)*6-G.diff*0.25-env.diff*0.2-(lewdNow?14:0)-wk.m.heat*0.12;
S.prog=clamp(S.prog+Math.max(4,pw),0,100);
var ok=S.prog>=100,mate=wk.mates&&wk.mates.length?wk.mates[0]:null,v={a:wk.name,b:mate?mate.name:''};
ST.sayB(S,{actors:[wk],tag:G.name,text:ST.fmt(S.pk(soft(gLines(G.try,mate),wk)),v)+ST.fmt(S.pk(soft(gLines(ok?G.ok:G.ng,mate),wk)),v),why:'進み具合 '+Math.round(S.prog)+'％（'+wk.name+'の器用さ '+wk.stats.dex+(G.brain>0.5?'・A':'')+(lewdNow?'・いちゃついていて集中できない':'')+'）',mag:ok?22:10},wk.name+'：'+G.name+' '+Math.round(S.prog)+'％',ok);
if(ok)wk.cnt.solve++;
return ok;
}
function moan(S,p,top,mode,ero,o){
if(!S.R18||S.lew==='low')return'';
if(ero&&S.eroOn){var d0=p.eroDom;p.eroDom= !!top;var m=HK.Ero.moan(S,p,top?1:2);p.eroDom=d0;return p.name+'「'+m+'」';}
var V=HK.Voice,l=top?(LK.TOPV&&LK.TOPV.moan&&LK.TOPV.moan[mode||'ins']&&(LK.TOPV.moan[mode||'ins'][p.persona]||LK.TOPV.moan[mode||'ins'].gentle)):V&&V.CLIMAX&&(V.CLIMAX[p.persona]||V.CLIMAX.gentle);
if(HK.Moan&&HK.Moan.say){var mv=HK.Moan.say(S,p,top?'top':'climax',{hush:true,novel:true,force: !!(o&&o.force)},l&&l.length?l:null);return mv?p.name+'「'+mv+'」':'';}
return l&&l.length?p.name+'「'+S.pk(l)+'」':'';
}
function climaxBy(S,p,partner,top){
var R=LK.CROWD_R18;
if(!R|| !S.R18)return'';
var T=top?R.TCL:R.PCL,l=T&&(T[p.persona]||T.gentle);
return l?ST.fmt(S.pk(l),{a:p.name,b:partner?partner.name:''}):'';
}
function bumpClimax(p){p.cnt.climax++;p.m.plea=25;p.m.heat=clamp(p.m.heat-12,0,100);p.m.reason=clamp(p.m.reason+6,0,100);}
function names(list){return list.map(function(p){return p.name;}).join('・');}
function soloRun(input){
var S=setup(input),rng=S.rng,env=S.env,A=S.P[0],R=LK.CROWD_R18,pk=S.pk,Pos=HK.Pos;
S.bind=env.bind==='random'?rng.pick(['both','one','none','both']):env.bind;
A.bound=S.bind!=='none';
A.mates=[];
var keys=['heat','reason','plea','esc'],gim=gimmickChain(S),gi=0,escaped=false,escTurn= -1,how='',outcome='clean',mob=null;
S.prog=0;
var v={a:A.name};
ST.step(S,'閉じ込められた');
ST.budget(S,3);
ST.say(S,{actors:[A],tag:'目覚め',text:ST.fmt(pk(CW.INTRO1),v)+ST.fmt(pk(CW.BIND1[A.bound?'cuff':'none']),v)+(HK.Attr&&HK.Attr.raceIntro?HK.Attr.raceIntro([A],'trapped',S):''),why:'一人きり／拘束：'+(A.bound?'あり':'なし')});
ST.say(S,{kind:'phase',text:pk(CW.SPEAKER1)+'（仕掛け：'+gim.map(function(g){return g.name;}).join('→')+'）'});
ST.snap(S,keys);
var selfOk= !!(R&&S.R18&&HK.State.r18ok(A));
var body=Pos&&Pos.genSet&&Pos.genSet(A)?(Pos.hasM(A)?'m':Pos.hasF(A)?'f':'x'):Pos&& !Pos.isF(A)&&(A.gender==='m'||(Pos.futa&&Pos.futa(A)))?'m':A.gender==='f'?'f':'x';
var finder=env.finder||'random';
for(var turn=0;turn<env.turns&& !escaped;turn++){
ST.step(S,((turn+1)*5)+'分');
S.step=turn;
ST.budget(S,3);
var logAt=S.log.length,lewdNow=false;
A.selfNow=false;
if(rng()<env.ev/100*0.45){
var calm=rng()<0.3;
if(calm){A.m.reason=clamp(A.m.reason+12,0,100);A.m.heat=clamp(A.m.heat-6,0,100);}
else A.m.heat=clamp(A.m.heat+10,0,100);
ST.sayB(S,{actors:[A],tag:calm?'一息':'ハプニング',text:ST.fmt(pk(calm?CW.CALM1:CW.SURGE1),v),why:calm?'理性 +12':'発情 +10'},calm?'少しだけ正気に戻った':'ガスが濃くなった');
}
gasStep(S,A,null);
if(A.rest>0)A.rest--;
else{
var urge=A.m.heat/100+A.tr.impulse*0.3+A.tr.fc*0.15-A.m.reason/130-A.tr.cp*0.12+(A.goal&&A.goal.id==='want'?0.12:A.goal&&A.goal.id==='out'? -0.08:0);
if(selfOk&&A.m.heat>=50&&urge>0.3+rng()*0.3){
lewdNow=true;
if(A.bound){
A.cnt.hold++;
if(A.cnt.hold<=2)ST.sayB(S,{actors:[A],tag:'生殺し',text:ST.fmt(pk(R.SELF_BOUND),v),why:'手錠のせいで、自分に触れることもできない（発情 '+Math.round(A.m.heat)+'）',mag:20},A.name+'は身をよじった');
A.m.plea=clamp(A.m.plea+15,0,90);
}else if(S.lew==='low'){
A.cnt.self++;bumpClimax(A);A.rest=1+rng.int(2);
ST.sayB(S,{actors:[A],tag:'一人で',text:ST.fmt(pk(R.SELF_LOW),v),why:A.name+'は、誰もいないのを確かめて自分を慰めた（発情 '+Math.round(A.m.heat)+'）',mag:22,kind:'climax'},A.name+'は一人で',true);
}else{
var st0=A.selfSt||0,t;
A.selfNow=true;
if(st0<2){
t=ST.fmt(pk(R.SELF[body][st0]),v);
A.selfSt=st0+1;A.m.plea=clamp(A.m.plea+30+20*st0,0,95);
ST.sayB(S,{actors:[A],tag:st0?'一人で':'我慢の限界',text:t,why:A.name+'の発情 '+Math.round(A.m.heat)+'・理性 '+Math.round(A.m.reason)+'：誰もいないロッカーで、とうとう自分の体に手を伸ばした',mag:20+st0*4,kind:'climax'},A.name+'は自分に触れた',st0===0);
}else{
t=ST.fmt(pk(R.SELF[body][2]),v);
if(S.eroOn)t+=HK.Ero.fill(S,ST.fmt(pk(R.SELF_ERO[body]),v),A);
t+=moan(S,A,false)+ST.fmt(pk(R.SELF_CL[A.persona]||R.SELF_CL.gentle),v);
A.selfSt=0;A.cnt.self++;bumpClimax(A);A.m.heat=clamp(A.m.heat-14,0,100);A.rest=1+rng.int(2);
ST.key(S,ST.sayB(S,{actors:[A],tag:'一人で果てる',text:t,why:A.name+'は一人きりのロッカーで果てた（'+A.cnt.self+'回目。熱が少し引いた）',mag:30,kind:'climax'},'',true),A.name+'は一人で果てた');
}
}
}else if(A.m.heat>=35&&urge>0.2+rng()*0.3&&(A.cnt.hold<2||rng()<0.25)){
A.cnt.hold++;A.m.reason=clamp(A.m.reason+4,0,100);
ST.sayB(S,{actors:[A],tag:'一人で耐える',text:ST.fmt(pk(A.bound?CW.ENDURE1_BOUND:CW.ENDURE1[A.persona]||CW.ENDURE1.gentle),v),why:A.name+'は熱をやり過ごそうとした（理性 +4／'+(HK.PERSONA[A.persona]||{}).label+'）',mag:14},A.name+'は耐えた',A.cnt.hold===1);
}
}
var G=gim[gi];
if(G&&S.prog<100&&A.m.reason>8&& !lewdNow&&(G.bind|| !A.bound)){
if(solveStep(S,G,[A],lewdNow)){
if(G.bind)A.bound=false;
gi++;S.prog=0;
if(gi>=gim.length){escaped=true;escTurn=turn;how='solve';}
}
}
var pf=finder==='none'?0:finder==='mob'?0.12+turn*0.05:0.01+(A.stats.luck||3)*0.01+(turn>=env.turns/2?0.04:0);
if(!escaped&&turn>=2&&rng()<pf){escaped=true;escTurn=turn;how='found';mob=found(S,A,body);outcome=mob.outcome;}
if(!escaped&&finder!=='mob'&&turn>=3&&rng()<0.004+(A.stats.luck||3)*0.003){escaped=true;escTurn=turn;how='luck';}
A.m.esc=Math.round((gi+S.prog/100)/gim.length*100);A.m.plea=clamp(A.m.plea,0,100);
ST.flushShort(S,'ほかに：');
if(S.log.length===logAt)ST.say(S,{kind:'phase',actors:[A.i],text:ST.fmt(pk(CW.QUIET1),v)});
ST.snap(S,keys);
}
if(!escaped){how='timeout';escTurn=env.turns;}
ST.step(S,how==='timeout'?'時間切れ':how==='found'?'見つかった':'脱出');
ST.budget(S,4);
var mins=(escTurn+1)*5,relief=A.cnt.self>0;
if(how!=='found'){
outcome=how==='timeout'?'timeout':how==='luck'?'luck':relief?'relief':'clean';
var tE=ST.fmt(pk(CW.END1[how==='timeout'?'timeout':how==='luck'?'luck':'clean']),v);
if(relief&&R&&R.END_RELIEF)tE+=ST.fmt(pk(R.END_RELIEF),v);
ST.key(S,ST.say(S,{actors:[A],tag:{timeout:'時間切れ',luck:'幸運',relief:'一人で脱出',clean:'無事に脱出'}[outcome],text:tE,why:'耐えた回数 '+A.cnt.hold+(relief?'・一人で果てた回数 '+A.cnt.self:'')+'・発情 '+Math.round(A.m.heat),mag:30}),'結末');
}
var mobN=mob&&mob.m?mob.m.full:'';
A.fate={clean:'一人で耐えきって脱出',relief:'一人で慰めて、どうにか脱出',luck:'幸運に助けられた',timeout:relief?'一人で何度も果てながら、時間切れまで耐えた':'時間切れまで耐えた',found:'見回りの人に助けられた',mob:'見つけてくれた人と一線を越えた',forced:'見つけた人に強引に抱かれた'}[outcome];
A.notes.push('発情 '+Math.round(A.m.heat)+'・理性 '+Math.round(A.m.reason)+'・'+W_CL+' '+A.cnt.climax+'回');
A.notes.push('耐えた '+A.cnt.hold+'回'+(A.cnt.self?'・一人で '+A.cnt.self+'回':'')+(A.cnt.solve?'・仕掛けを解いた '+A.cnt.solve+'回':''));
var title={clean:mins+'分で、一人で脱出した。誰にも何も起きなかった。',relief:mins+'分で脱出。ロッカーの中で何があったかは、誰も知らない。',luck:mins+'分で、思いがけず扉が開いた。',timeout:'制限時間内に脱出できず、扉は時間切れで開いた。',found:mins+'分、'+mobN+'に見つけてもらって外へ出た。',mob:mins+'分、見つけてくれた'+mobN+'と、そのまま一線を越えた。',forced:mins+'分、見つけた'+mobN+'に、熱に浮かされたまま抱かれた。'}[outcome];
var lines=[A.name+'：'+A.fate,'仕掛け：'+gim.map(function(g,i){return g.name+(i<gi?'（解除）':'');}).join('→')];
return ST.result(S,input,{
ending:{title:title,kind:outcome==='clean'||outcome==='found'?'ok':'over',lines:lines},
estats:[['脱出まで',how==='timeout'?'時間切れ':mins+'分'],['人数','1人'],['耐えた',A.cnt.hold+'回'],[W_CL,A.cnt.climax+'回']],
table:{title:'一人の状態',hint:'発情が高く理性が低いほど、耐えきれなくなる。',cols:['発情','理性','耐えた',W_CL,'解いた','結末'],rows:[{i:A.i,rank:'',cells:[Math.round(A.m.heat)+'',Math.round(A.m.reason)+'',String(A.cnt.hold),String(A.cnt.climax),String(A.cnt.solve),A.fate]}]},
meters:[{label:'発情',color:'--love'},{label:'理性',color:'--accent'},{label:'快感',color:'--pine',dash:true},{label:'脱出',color:'--partner',dash:true}],
meta:'1人・拘束'+(S.bind==='none'?'なし':'あり')+'・媚薬'+env.dose,
summary:'媚薬ロッカー：'+title
});
}
function found(S,A,body){
var rng=S.rng,pk=S.pk,R=LK.CROWD_R18,Pos=HK.Pos;
var mg=A.likes==='m'||A.likes==='f'?A.likes:rng()<0.5?'m':'f';
var m=HK.Mob?HK.Mob.make(S,{gender:mg,role:rng.pick(['警備員','清掃員','管理人','夜勤の係員'])}):{name:'見回りの人',gender:mg,tr:{},mob:true};
m.persona=HK.personaOf?HK.personaOf(m):'gentle';
m.full=m.name;m.name=m.name.replace(/^.*の/,'');
var v={a:A.name,m:m.name,mr:m.full},hot=A.m.heat>=60,caught=A.selfNow&&R&&R.CAUGHT&&S.R18;
var t=ST.fmt(pk(caught?R.CAUGHT:CW.FIND[hot?'hot':'calm']),v),outcome='found',tag='見つかった',why=m.name+'が見回りでロッカーに気づいた',mag=24,kind='event',tags=null;
var sexOk=hot&&R&&S.R18&&(HK.Mob?HK.Mob.sexOk(A):HK.State.mobSexOk(A))&&A.likes!=='none'&&(!Pos||Pos.genderOK(A,m));
if(sexOk){
var def=isF(A)&&mg==='m'?'bottom': !isF(A)&&mg==='f'?'top':rng()<0.5?'top':'bottom';
var side=Pos?Pos.vsNpc(A,def)||def:def;
if(Pos&&Pos.hardTopNpc(A))side='top';
var want=A.m.heat/100+A.tr.fc*0.3+(A.tr.impulse||0)*0.3-A.tr.cp*0.3-A.m.reason/150+(A.goal&&A.goal.id==='want'?0.15:0);
if(A.honmei!=null||HK.lockAny(A)||typeof A.sexLock==='number')want-=desperate(A)&&A.m.heat>85?0.1:0.45;
var force=HK.Content&&HK.Content.on(S.env,'force','locker');
if(want>0.55&&rng()<0.7*HK.Dark.f(S,'fall')){
var top=side==='top'?A:m,bot=side==='top'?m:A,md=modeOf(top,bot),vv={a:top.name,b:bot.name};
t+=ST.fmt(pk(R.ASK),v)+ST.fmt(pk(R.MOB_SEX[md]),vv);
if(S.eroOn)t+=HK.ThickEro.fill(S,ST.fmt(pk(R.MOB_ERO[md]),vv),top,bot);
t+=side==='top'?moan(S,A,true,md,true)+climaxBy(S,A,m,true):moan(S,A,false,md,true)+climaxBy(S,A,m,false);
t+=ST.fmt(pk(R.MOB_AFTER),v);
bumpClimax(A);outcome='mob';tag='求めた';kind='climax';mag=34;
why=A.name+'は熱に耐えきれず、自分から'+m.name+'に頼んだ（合意・'+(side==='top'?A.name+'が攻め':m.name+'が攻め')+'）';
}else if(want<=0.55&&force&&side==='bottom'&& !(Pos&&Pos.hardTopNpc(A))&&rng()<0.45*HK.Dark.f(S,'assault')){
var mdF=modeOf(m,A),vF={a:m.name,b:A.name};
t+=ST.fmt(pk(R.FORCE[mdF]),vF)+ST.fmt(pk(R.FREACT[A.persona]||R.FREACT.gentle),{a:A.name,m:m.name});
if(S.eroOn)t+=HK.ThickEro.fill(S,ST.fmt(pk(R.FORCE_ERO[mdF]),vF)+(R.FREACT_ERO?' '+ST.fmt(pk(R.FREACT_ERO[A.persona]||R.FREACT_ERO.gentle),vF):''),m,A);
t+=moan(S,A,false,mdF,false,{force:true})+climaxBy(S,A,m,false)+ST.fmt(pk(R.FORCE_AFTER),v);
bumpClimax(A);outcome='forced';tag='強引に';kind='climax';mag=34;tags=['force'];
why=m.name+'が、動けない'+A.name+'に無理やり手を出した（合意のない展開：内容のスイッチが入）';
}else t+=ST.fmt(pk(CW.ASK_NO),v)+ST.fmt(pk(CW.HELP),v);
}else if(hot)t+=ST.fmt(pk(CW.HELP),v);
if(outcome==='found')t+=ST.fmt(pk(hot?CW.END1.found:CW.END1.found.filter(function(l){return!/水/.test(l);})),v);
t=t.split(m.name+'「').join(m.name+'「＠');
var o={actors:[A],tag:tag,text:t,why:why,mag:mag,kind:kind};
if(tags)o.tags=tags;
ST.key(S,ST.say(S,o),'結末');
return{m:m,outcome:outcome};
}
function groupRun(input){
var S=setup(input),rng=S.rng,env=S.env,P=S.P,pk=S.pk,R=LK.CROWD_R18,Pos=HK.Pos;
var keys=['heat','reason','plea','esc'];
S.cj=0;S.cw=0;S.blessed={};
var lay=env.layout&&env.layout!=='random'?env.layout:rng()<0.5?'big':'split';
var pool=P.slice(),lockers=[];
for(var i=pool.length-1;i>0;i--){var j=rng.int(i+1),tmp=pool[i];pool[i]=pool[j];pool[j]=tmp;}
while(pool.length){var k=lay==='big'?(pool.length===4?3:Math.min(3,pool.length)):(pool.length===1?1:2);lockers.push({m:pool.splice(0,k),lv: -1,n:lockers.length+1});}
lockers.forEach(function(Lk){Lk.m.forEach(function(p){p.L=Lk;p.mates=Lk.m.filter(function(q){return q!==p;});});Lk.mid=Lk.m[0];});
P.forEach(function(p){
if(P.some(function(q){return q!==p&&interest(S,p,q);}))return;
var c=P.filter(function(q){return q!==p&&okLove(p,q)&& !noLoveTie(S,p,q);});
if(c.length&&rng()<0.5)p.secret=rng.pick(c).i;
});
S.bind=env.bind==='random'?rng.pick(['both','one','none','both']):env.bind;
P.forEach(function(p){p.bound=S.bind==='both';});
if(S.bind==='one')lockers.forEach(function(Lk){if(Lk.m.length<2)return;var c=Lk.m.filter(function(p){return!(HK.Pos&&HK.Pos.hardTopIn(p,Lk.m));});if(c.length)rng.pick(c).bound=true;});
var gim=gimmickChain(S),gi=0,escaped=false,escTurn= -1,how='';
S.prog=0;
var vall={all:names(P)};
ST.step(S,'閉じ込められた');
ST.budget(S,3+lockers.length);
ST.say(S,{actors:P,tag:'目覚め',text:ST.fmt(pk(CW.INTRO_G),vall)+pk(CW.BIND_G[S.bind])+(HK.Attr&&HK.Attr.raceIntro?HK.Attr.raceIntro(P,'trapped',S):''),why:P.length+'人・ロッカー '+lockers.length+'台（'+lockers.map(function(Lk){return names(Lk.m);}).join('／')+'）・拘束：'+{both:'全員',one:'ロッカーごとに一人',none:'なし'}[S.bind]});
ST.say(S,{kind:'phase',text:pk(CW.SPEAKER_G)+'（仕掛け：'+gim.map(function(g){return g.name;}).join('→')+'）'});
lockers.forEach(function(Lk){
var m=Lk.m,t=m.length===1?ST.fmt(pk(CW.LAY.alone),{a:m[0].name}):m.length===2?ST.fmt(pk(CW.LAY.pair),{a:m[0].name,b:m[1].name}):ST.fmt(pk(CW.LAY.trio),{a:m[0].name,b:m[1].name,c:m[2].name});
ST.say(S,{actors:m,tag:'ロッカー'+Lk.n,text:t,why:m.length===1?'一人きり':m.length===2?'二人で一つのロッカー':'三人が一つのロッカーに（真ん中は'+m[0].name+'）'});
});
ST.snap(S,keys);
for(var turn=0;turn<env.turns&& !escaped;turn++){
ST.step(S,((turn+1)*5)+'分');
S.step=turn;
ST.budget(S,3+Math.ceil(lockers.length/2));
var logAt=S.log.length;
S.lewdNow=false;
if(rng()<env.ev/100*0.5){
var trios=lockers.filter(function(Lk){return Lk.m.length===3&& !Lk.trioIn;}),r0=rng();
if(trios.length&&r0<0.3){
var Lt=rng.pick(trios),nm=rng.pick(Lt.m.filter(function(p){return p!==Lt.mid;}));
Lt.mid=nm;
var ot=Lt.m.filter(function(p){return p!==nm;});
ST.sayB(S,{actors:[nm].concat(ot),tag:'押し合い',text:ST.fmt(pk(CW.SHIFT),{a:nm.name,b:ot[0].name,c:ot[1].name}),why:'ロッカーが揺れて、真ん中に挟まれる人が'+nm.name+'に替わった'},nm.name+'が真ん中に');
}else{
var calm=r0<0.55;
P.forEach(function(p){if(calm){p.m.reason=clamp(p.m.reason+12,0,100);p.m.heat=clamp(p.m.heat-6,0,100);p.rxCool=true;}else p.m.heat=clamp(p.m.heat+10,0,100);});
ST.sayB(S,{actors:P,tag:calm?'一息':'ハプニング',text:pk(calm?CW.CALM_G:CW.SURGE_G),why:calm?'全員の理性 +12':'全員の発情 +10'},calm?'少しだけ正気に戻った':'ガスが濃くなった');
}
}
P.forEach(function(p){gasStep(S,p,p.mates.length?rng.pick(p.mates):null);});
if(rng()<0.42)cross(S,lockers,gim[gi]);
var lo=lockers.slice().sort(function(){return rng()-0.5;});
lo.forEach(function(Lk){
if(Lk.m.length===1)aloneTurn(S,Lk.m[0]);
else if(Lk.m.length===2)pairTurn(S,Lk,turn);
else trioTurn(S,Lk,turn);
});
var G=gim[gi];
if(G&&S.prog<100){
var busy=function(p){return p.L.conn||p.L.trioNow;};
var workers=P.filter(function(p){return p.m.reason>10&& !busy(p)&&(G.bind|| !p.bound);});
if(solveStep(S,G,workers,S.lewdNow))S.prog=100;
}
if(S.prog>=100){
if(G&&G.bind)P.forEach(function(p){p.bound=false;});
gi++;S.prog=0;
if(gi>=gim.length){escaped=true;escTurn=turn;how='solve';}
}
if(!escaped&&turn>=2&&rng()<0.004+P.reduce(function(s,p){return s+(p.stats.luck||3);},0)/P.length*0.0035){escaped=true;escTurn=turn;how='luck';}
P.forEach(function(p){p.m.esc=Math.round((gi+S.prog/100)/gim.length*100);p.m.plea=clamp(p.m.plea,0,100);});
ST.flushShort(S,'ほかに：');
if(S.log.length===logAt)ST.say(S,{kind:'phase',actors:P.map(function(p){return p.i;}),text:pk(CW.QUIET_G)});
ST.snap(S,keys);
}
if(!escaped){how='timeout';escTurn=env.turns;}
ST.step(S,how==='timeout'?'時間切れ':'脱出');
ST.budget(S,6);
var mins=(escTurn+1)*5;
ST.key(S,ST.say(S,{actors:P,tag:{solve:'全員で脱出',luck:'幸運',timeout:'時間切れ'}[how],text:ST.fmt(pk(CW.END_G[how==='solve'?'open':how]),vall),why:'仕掛け '+gi+'／'+gim.length+'・嫉妬系 '+S.cj+'・仲良し系 '+S.cw,mag:26}),'結末');
lockers.forEach(function(Lk){
if(Lk.m.length<2||Lk.lv<0)return;
if(Lk.m.length===3&&Lk.trioIn){
var tq=Lk.trioNames;
if(HK.Poly)HK.Poly.storyReg(S,Lk.m);
ST.say(S,{actors:Lk.m,tag:'三人の秘密',text:ST.fmt(pk(R&&S.R18&&Lk.trioSex?R.AFTER3_END:CW.T3_END),{a:tq[0],b:tq[1],c:tq[2]}),why:'三人の場面：同じロッカーの三人は、ロッカーの中のことを三人だけの秘密にした（仲良し）'});
return;
}
var x=Lk.top||Lk.m[0],y=Lk.bot||Lk.m[1],AF=LK.AFTER,ak=Lk.sexIn&&AF.awkwardSex?'awkwardSex':Lk.refusedHard?'angry':'awkward';
var aft=AF[ak].filter(function(l){return!/嗜め/.test(l)||x.cnt.refuse+y.cnt.refuse>0;});
ST.say(S,{actors:[x,y],tag:{awkwardSex:'気まずい朝',angry:'怒り',awkward:'気まずい脱出'}[ak],text:ST.fmt(pk(aft.length?aft:AF.awkward),{a:x.name,b:y.name}),why:'ロッカー'+Lk.n+'の二人：いちばん進んだのは「'+actLabel(Lk,Lk.lv)+'」'});
});
var lostP=P.filter(function(p){return p.lostTo;})[0],jealP=P.filter(function(p){return p.cnt.jeal>=1&&p.jealOf!=null;})[0];
if(lostP){var lb=P[lostP.lostTo[0]],lc=P[lostP.lostTo[1]];ST.say(S,{actors:[lostP,lb,lc],tag:'失恋のあと',text:ST.fmt(pk(CW.MOOD.lost),{a:lostP.name,b:lb.name,c:lc.name}),why:'三人の場面：'+lostP.name+'は、'+lb.name+'と'+lc.name+'のことを受け止めた（失恋）'});}
else if(jealP&&S.cj<S.cw){
var jb=P[jealP.jealOf],jc=jb.mates.filter(function(q){return q!==jealP;})[0];
ST.say(S,{actors:jc?[jealP,jb,jc]:[jealP,jb],tag:'嫉妬のあと',text:ST.fmt(pk(CW.MOOD.jeal),{a:jealP.name,b:jb.name}),why:(jc?'三人の場面：'+jb.name+'が'+jc.name+'と同じロッカーだったことへの、':'')+jealP.name+'の嫉妬は、ガスが抜けても残った'});
}else ST.say(S,{actors:P,tag:'帰り道',text:ST.fmt(pk(CW.MOOD.warm),vall),why:'みんなで帰った（ロッカー越しに励まし合った回数 '+S.cw+'）'});
P.forEach(function(p){
var Lk=p.L,f;
if(Lk.m.length===1)f=p.cnt.self?'一人のロッカーで、一人で慰めた':'一人のロッカーで耐えきった';
else if(Lk.trioIn)f=Lk.trioSex?'三人で熱を分け合った':'三人で寄り添った';
else if(Lk.sexIn)f=(Lk.top===p?'ロッカーの中で相手を抱いた':'ロッカーの中で相手に身を委ねた');
else if(p.cnt.accept>=1)f='流された';
else if(p.cnt.make>=1&&p.cnt.refuse===0)f='先に手を伸ばした';
else if(p.cnt.refuse>=1)f='最後まで嗜めた';
else if(p.cnt.hold)f='触れずに耐え抜いた';
else f=p.m.reason>30?'理性を保ちきった':'ぎりぎりで踏みとどまった';
if(p.lostTo)f+='・失恋した';
else if(p.cnt.jeal)f+='・嫉妬した';
if(p.cnt.warm>=2)f+='・みんなを励ました';
p.fate=f;
p.roleLabel='ロッカー'+Lk.n+(Lk.m.length===1?'（一人）':'（'+names(Lk.m)+'）');
p.notes.push('発情 '+Math.round(p.m.heat)+'・理性 '+Math.round(p.m.reason)+'・'+W_CL+' '+p.cnt.climax+'回');
p.notes.push('仕掛けた '+p.cnt.make+'回・応じた '+p.cnt.accept+'回・嗜めた '+p.cnt.refuse+'回'+(p.cnt.hold?'・耐えた '+p.cnt.hold+'回':'')+(p.cnt.solve?'・仕掛けを解いた '+p.cnt.solve+'回':'')+(p.cnt.jeal?'・嫉妬 '+p.cnt.jeal+'回':''));
});
var far=lockers.filter(function(Lk){return Lk.sexIn||Lk.trioSex;});
var title=(how==='timeout'?'制限時間内に脱出できず、ロッカーは時間切れで開いた。':mins+'分で、'+P.length+'人とも外へ出た。')+(far.length?far.map(function(Lk){return names(Lk.trioSex?Lk.m:[Lk.top,Lk.bot]);}).join('と、')+'は、ロッカーの中で'+(far.some(function(Lk){return Lk.trioSex;})?'熱を分け合った。':'一線を越えた。'):lockers.some(function(Lk){return Lk.lv>=0;})?'ロッカーの中のことは、みんなガスのせいにした。':'誰も、一線は越えなかった。');
var lines=P.map(function(p){return p.name+'：'+p.fate;});
lines.push('ロッカー：'+lockers.map(function(Lk){return names(Lk.m)+(Lk.lv>=0?'（'+actLabel(Lk,Lk.lv)+'）':'');}).join('／'));
lines.push('仕掛け：'+gim.map(function(g,i){return g.name+(i<gi?'（解除）':'');}).join('→')+(how==='luck'?'（外から開いた）':''));
lines.push('ロッカー越しの出来事：すれ違い '+S.cj+'回・励まし合い '+S.cw+'回');
var rows=P.map(function(p){return{i:p.i,rank:'',cells:['ロッカー'+p.L.n,Math.round(p.m.heat)+'',Math.round(p.m.reason)+'',String(p.cnt.make),String(p.cnt.refuse),String(p.cnt.climax),String(p.cnt.solve),p.fate]};});
return ST.result(S,input,{
ending:{title:title,kind:far.length?'over':'ok',lines:lines},
estats:[['脱出まで',how==='timeout'?'時間切れ':mins+'分'],['人数',P.length+'人'],['ロッカー',lockers.length+'台'],[W_CL,P.reduce(function(s,p){return s+p.cnt.climax;},0)+'回']],
table:{title:'みんなの状態',hint:'同じロッカーの人とくっつく。発情が高く理性が低いほど手を出しやすい。',cols:['場所','発情','理性','仕掛けた','嗜めた',W_CL,'解いた','結末'],rows:rows},
meters:[{label:'発情',color:'--love'},{label:'理性',color:'--accent'},{label:'快感',color:'--pine',dash:true},{label:'脱出',color:'--partner',dash:true}],
meta:P.length+'人・ロッカー'+lockers.length+'台・拘束'+{both:'あり',one:'一人ずつ',none:'なし'}[S.bind]+'・媚薬'+env.dose,
summary:'媚薬ロッカー：'+title
});
}
CW.T3_END=L('ロッカーを出た三人は、顔を見合わせて小さく笑った。「……今のは、三人だけの秘密ね｜……今のは、三人だけの秘密だ｜……今のは、三人だけの秘密ですよ」|三人は並んで倉庫を出た。誰からともなく、手を繋いでいた。|{a}が「また三人で」と言いかけて、慌てて口をつぐんだ。{b}と{c}は、聞こえないふりをして笑った。');
function actLabel(Lk,lv){var k=['touch','kiss','grope','oral','sex'][lv];if(Lk.trioIn)return lv>=2?'三人で':lv===1?'キス':'寄り添う';var ff=Lk.ff;return ff&&LK.FF_ACT&&LK.FF_ACT[k]&&LK.FF_ACT[k].label||(LK.ACT[k]||{}).label||'';}
function aloneTurn(S,p){
var rng=S.rng,R=LK.CROWD_R18,pk=S.pk,v={a:p.name};
if(p.rest>0){p.rest--;return;}
var urge=p.m.heat/100+p.tr.impulse*0.3+p.tr.fc*0.15-p.m.reason/130-p.tr.cp*0.12;
if(R&&S.R18&&HK.State.r18ok(p)&& !p.bound&&p.m.heat>=60&&urge>0.4+rng()*0.3){
var body=HK.Pos&&HK.Pos.genSet&&HK.Pos.genSet(p)?(HK.Pos.hasM(p)?'m':HK.Pos.hasF(p)?'f':'x'):HK.Pos&& !HK.Pos.isF(p)&&(p.gender==='m'||(HK.Pos.futa&&HK.Pos.futa(p)))?'m':p.gender==='f'?'f':'x';
var t=ST.fmt(pk(R.SELF[body][1]),v)+ST.fmt(pk(R.SELF[body][2]),v);
if(S.eroOn)t+=HK.Ero.fill(S,ST.fmt(pk(R.SELF_ERO[body]),v),p);
t+=moan(S,p,false)+ST.fmt(pk(R.SELF_CL[p.persona]||R.SELF_CL.gentle),v);
p.cnt.self++;bumpClimax(p);p.m.heat=clamp(p.m.heat-14,0,100);p.rest=2;S.lewdNow=true;
ST.sayB(S,{actors:[p],tag:'一人で果てる',text:t,why:p.name+'は一人きりのロッカーで、隣に聞こえないよう声を殺して果てた（発情 '+Math.round(p.m.heat)+'）',mag:26,kind:'climax'},p.name+'は一人で',p.cnt.self===1);
}else if(p.m.heat>=40&&urge>0.25+rng()*0.3&&p.cnt.hold<3){
p.cnt.hold++;p.m.reason=clamp(p.m.reason+4,0,100);
ST.sayB(S,{actors:[p],tag:'一人で耐える',text:ST.fmt(pk(p.bound?CW.ENDURE1_BOUND:CW.ENDURE1[p.persona]||CW.ENDURE1.gentle),v),why:p.name+'は一人きりのロッカーで熱をやり過ごした（理性 +4）',mag:12},p.name+'は耐えた');
}
}
function hands(arr,a,b){
var r=arr.filter(function(l){return!(a.bound&& /\{a\}の(手|指)/.test(l))&& !(b.bound&&(/\{b\}の(手|指)/.test(l)|| /\{b\}は[^。「]*(手で|手を|指で|手首を|両手)/.test(l)));});
return r.length?r:arr;
}
function hb(arr,tp,bt){return arr.filter(function(l){return!(/^H:/.test(l)&&tp.bound)&& !(/^B:/.test(l)&&bt.bound);}).map(function(l){return l.replace(/^[HB]:/,'');});}
function contPool(k,tp,bt){var C=LK.CONT,m=modeOf(tp,bt);return hb((C[m][k]||[]).concat(C.any[k]||[]),tp,bt);}
function say2(S,p,T){var l=T[p.persona]||T.gentle;return p.name+S.pk(l);}
function holdPair(S,a,b,reason){
a.cnt.hold++;a.m.reason=clamp(a.m.reason+3,0,100);a.m.plea=clamp(a.m.plea+8,0,90);
if(a.cnt.hold>3&&S.rng()<0.5)return;
var t=a.tr,sc={solve:t.cp*0.6+t.a*0.3,care:t.np*0.85,shy:t.ac*0.85,joke:t.fc*0.8,endure:0.5};
var ty=Object.keys(sc).reduce(function(x,k){return sc[k]>sc[x]?k:x;},'endure'),C=LK.CLASH;
ST.sayB(S,{actors:[a,b],tag:C.tag[ty],text:ST.fmt(S.pk(C.hold[ty]),{a:a.name,b:b.name})+(S.rng()<0.5?ST.fmt(S.pk(C.reply),{a:a.name,b:b.name}):''),why:a.name+'は発情していた（'+Math.round(a.m.heat)+'）が、'+reason+'ので、手は出さなかった',mag:16},a.name+'は手を出さずに耐えた',a.cnt.hold===1);
}
function whyNot(S,a,b){
var n=b.name;
if(!HK.SAFE_ON&&(a.noR18||b.noR18))return(a.noR18?a:b).name+'はR18に参加しない';
if(HK.ngPair&&HK.ngPair(a,b))return n+'とは恋愛・R18にしない組な';
if(HK.sexBlocked&&HK.sexBlocked(a,b))return n+'とは体の関係にならない組な';
if(noLoveTie(S,a,b))return n+'とは恋愛にしない関係な';
if(HK.Pos&& !HK.Pos.okSex(a,b))return n+'とは受け攻めの向きか恋愛対象が合わない';
return n+'とは恋愛にならない組な';
}
function relW(S,a,b,side){
var tl=tiesOf(S,a,b),w=0;
tl.forEach(function(t){
var ty=t.type,mine=t.a===a.i;
var v=side==='urge'?{lover:0.15,mate:0.15,fated:0.15,fwb:0.2,almost:0.1,crush:mine?0.2:0,rival: -0.1,bad: -0.1,enemy: -0.1}[ty]:{lover:0.5,mate:0.5,fated:0.5,fwb:0.45,almost:0.3,crush:mine?0.45: -0.05,rival: -0.3,bad: -0.3,enemy: -0.3,ex:0.05}[ty];
if(v!=null&&Math.abs(v)>Math.abs(w))w=v;
});
if(!tl.length)w=side==='urge'?0: -0.1;
if(a.secret===b.i)w+=side==='urge'?0.15:0.3;
if(a.honmei===b.i)w+=0.15;
return w;
}
function pairTurn(S,Lk,turn){
var rng=S.rng,pk=S.pk,x=Lk.m[0],y=Lk.m[1],V=HK.Voice,Pos=HK.Pos;
Lk.ff= !!(Pos&&Pos.ff(x,y));
if(Lk.conn){contTurn(S,Lk);S.lewdNow=true;return;}
if(Lk.rest>0){Lk.rest--;return;}
var order=rng()<0.5?[x,y]:[y,x];
for(var k=0;k<order.length;k++){
var a=order[k],b=a===x?y:x;
var urge=(a.goal&&a.goal.id==='want'?0.12:a.goal&&a.goal.id==='out'? -0.08:0)+(a.action&&a.action.id==='flow'?0.08:a.action&&a.action.id==='solve'? -0.06:0)+a.m.heat/100+a.tr.impulse*0.35+a.tr.fc*0.15-a.m.reason/130-a.tr.cp*0.12+relW(S,a,b,'urge');
if(a.honmei!=null&&a.honmei!==b.i)urge-=desperate(a)?0.05:0.3;
if(loyal(S,a,b))urge-=desperate(a)?0.05:0.25;
if(urge<0.36+rng()*0.3)continue;
if(!canAct(S,a,b)){holdPair(S,a,b,whyNot(S,a,b));return;}
var fr=freeOk(S,a,b);
if(fr&&Lk.m.some(function(q){return q!==a&&q!==b&&(HK.lockTo(a,q)||HK.lockTo(b,q));})&&rng()>0.3)continue;
var lvMax=Math.min(LK.MAXLV||4,4);
if(a.bound&&b.bound)lvMax=Math.min(lvMax,1);
var lv=Math.min(Lk.lv+(relW(S,a,b,'acc')>=0.45&&Lk.lv>=0&&rng()<0.5?2:1),lvMax);
var ord=Pos?Pos.order(a,b,lv===4?Pos.fbFor(a,b):[a,b]):[a,b],tp=ord[0],bt=ord[1];
if(tp.bound&&lv>=2)lv=Math.min(lv,1);
if(lv<=Lk.lv){
if(a.bound&&b.bound&&Lk.lv>=1&&(Lk.nama||0)<2&&rng()<0.5){
Lk.nama=(Lk.nama||0)+1;S.lewdNow=true;
var ed=LK.TOPV&&LK.TOPV.edge&&(LK.TOPV.edge[tp.persona]||LK.TOPV.edge.gentle);
ST.sayB(S,{actors:[tp,bt],tag:'生殺し',text:ST.fmt(pk(LK.NAMA),{a:tp.name,b:bt.name})+(ed&&S.R18?tp.name+'「'+pk(ed)+'」':''),why:'二人とも手錠のまま発情（'+Math.round(a.m.heat)+'・'+Math.round(b.m.heat)+'）',mag:22},'二人は生殺し');
}
return;
}
a.cnt.make++;
var w=b.m.heat/100+relW(S,b,a,'acc')+b.tr.np*0.15+b.tr.ac*0.1-b.tr.cp*0.25-b.m.reason/160+(rng()-0.5)*0.3;
if(b.honmei!=null&&b.honmei!==a.i)w-=desperate(b)?0.05:0.35;
if(loyal(S,b,a))w-=desperate(b)?0.05:0.3;
var resp=w>0.55?'accept':w>0.32?'passive':'refuse';
var key=['touch','kiss','grope','oral','sex'][lv],act=LK.ACT[key],md=modeOf(tp,bt),ff=md==='ff';
var FFA=ff&&LK.FF_ACT&&LK.FF_ACT[key],FMA= !FFA&&key==='sex'&&md==='fm'&&LK.FM_ACT&&LK.FM_ACT.sex;
var lead=lv<=1?a:tp,other=lead===a?b:a,swap=lead!==a;
var actPool=FFA?(lead.bound?FFA.bound:FFA.t):FMA?(lead.bound?FMA.bound:FMA.t):key==='sex'?(lead.bound?act.boundTop:act.t):(lead.bound?act.bound:act.t);
if(!actPool|| !actPool.length)actPool=act.t;
var vA={a:lead.name,b:other.name},vT={a:a.name,b:b.name};
var t=swap?ST.fmt(pk(LK.TEMPT),vT):ST.fmt(pk(hands(actPool,lead,other)),vA);
if(resp==='refuse'){
b.cnt.refuse++;a.m.reason=clamp(a.m.reason+6,0,100);
var lateR=b.rxLv>=1&& !b.rxCool&&LK.REFUSE_LATE;
t+=ST.fmt(pk(hands(lateR?LK.REFUSE_LATE:LK.REFUSE,a,b)),vT)+(rng()<0.7?say2(S,b,lateR&&LK.REFUSE_SAY_LATE?LK.REFUSE_SAY_LATE:LK.REFUSE_SAY):'');
if(b.cnt.refuse>=2&&lv>=2)Lk.refusedHard=true;
ST.sayB(S,{actors:[a,b],tag:'嗜めた',text:t,why:a.name+'が「'+actLabel(Lk,lv)+'」を仕掛けた（発情 '+Math.round(a.m.heat)+'）／'+b.name+'は嗜めた（理性 '+Math.round(b.m.reason)+'・CP）',mag:18},b.name+'が嗜めた');
return;
}
b.cnt.accept++;Lk.lv=lv;Lk.lastAct=turn;S.lewdNow=true;b.rxLv=Math.max(b.rxCool?0:b.rxLv||0,resp==='accept'?2:1);b.rxCool=false;
var eroNow=resp==='accept';
if(swap)t+=ST.fmt(pk(LK.TAKE[tp.bound?'bound':'free']),vT)+ST.fmt(pk(hands(actPool,tp,bt)),{a:tp.name,b:bt.name});
else t+=ST.fmt(pk(hands((resp==='accept'?LK.ACCEPT:LK.PASSIVE).filter(function(l){return(lead===tp&&md==='ins')|| !/受け入れ/.test(l);}),a,b)),vT)+(resp==='accept'&&rng()<0.6?say2(S,b,LK.ACCEPT_SAY):'');
var gain=[15,20,30,40,50][lv];
tp.m.plea+=gain*tp.sens*0.8;bt.m.plea+=gain*bt.sens;
a.m.heat=clamp(a.m.heat+4,0,100);b.m.heat=clamp(b.m.heat+8,0,100);
if(lv===4){Lk.sexIn=true;Lk.conn=true;Lk.top=tp;Lk.bot=bt;Lk.done=false;Lk.hushed=false;Lk.lowT=0;t+=ST.fmt(pk(ff&&LK.FF_ACT?LK.FF_ACT.tease:md==='fm'&&LK.FM_ACT?LK.FM_ACT.tease:LK.TEASE),{a:tp.name,b:bt.name});}
else{Lk.top=tp;Lk.bot=bt;}
if(S.lew==='low'&&lv>=3)t=ST.fmt(pk(actPool),{a:tp.name,b:bt.name}).replace(/。.*$/,'。')+pk(LK.FADE||['――その先は、ロッカーの扉の隙間からも見えなかった。']);
else if(S.eroOn&&eroNow&&lv>=3&&LK.ERO_ACT&&LK.ERO_ACT[lv]){
var eg=lv===3?lead:tp,er=lv===3?other:bt;
var eroL=ff&&LK.ERO_ACT_FF&&LK.ERO_ACT_FF[lv]?LK.ERO_ACT_FF[lv]:lv===4&&modeOf(eg,er)==='fm'&&LK.ERO_ACT_FM?LK.ERO_ACT_FM[4]:lv===3&& !ff&& !isF(er)&&LK.ERO_ACT_MB?LK.ERO_ACT_MB[3]:LK.ERO_ACT[lv];
if(lv===3&&ff&& !(LK.ERO_ACT_FF&&LK.ERO_ACT_FF[3]))eroL=null;
if(eroL)t+=HK.ThickEro.fill(S,pk(eroL),eg,er).replace(/\{a\}/g,eg.name).replace(/\{b\}/g,er.name);
}
if(lv===4){tp.m.plea=Math.min(tp.m.plea,55);bt.m.plea=Math.min(bt.m.plea,60);}
if(bt.m.plea>=100&&lv<4){if(HK.Pos&&HK.Pos.hardTop(bt,tp))bt.m.plea=95;else{t+=moan(S,bt,false,md,eroNow)+climaxBy(S,bt,tp,false);bumpClimax(bt);}}
var ld=fr&& !Lk.freeLed?HK.FreeSex.lead(S,a,b):'';
var said=ST.sayB(S,{actors:[a,b],tag:fr?'体だけ・'+actLabel(Lk,lv).replace(/キス|口づけ/g,'唇'):actLabel(Lk,lv),text:ld+t,why:(fr?HK.FreeSex.why(a,b)+'／':'')+a.name+'が「'+actLabel(Lk,lv)+'」を仕掛けた（発情 '+Math.round(a.m.heat)+'）／'+b.name+'は'+(swap?'誘いに乗って、自分から動いた':resp==='accept'?'乗った':'流された')+'（ロッカー'+Lk.n+'・'+b.name+'の発情 '+Math.round(b.m.heat)+'）',mag:18+lv*5,kind:'climax'},a.name+'→'+b.name+'：'+actLabel(Lk,lv),lv>=3);
if(ld&&said)Lk.freeLed=true;
if(lv===4&& !Lk.keySex){Lk.keySex=true;var o2=S.log[S.log.length-1];if(o2)ST.key(S,o2,'ロッカー'+Lk.n+'で'+(ff?'肌を重ねた':'繋がった'));}
if(fr&&lv===4&& !Lk.freeMark){Lk.freeMark=true;HK.FreeSex.mark(S,a,b);HK.FreeSex.jealous(S,a,b);}
return;
}
}
function contTurn(S,Lk){
var rng=S.rng,pk=S.pk,tp=Lk.top,bt=Lk.bot,C=LK.CONT,V=HK.Voice,ph,vv={a:tp.name,b:bt.name},md=modeOf(tp,bt);
if(Lk.done)ph='after';
else{
bt.m.plea+=(14+rng()*12)*bt.sens;tp.m.plea+=(10+rng()*10)*tp.sens;
Lk.m.forEach(function(p){p.m.heat=clamp(p.m.heat+3,0,100);});
ph=bt.m.plea>=100||tp.m.plea>=100?'climax': !Lk.hushed&&rng()<0.3?'hush':bt.m.plea>=70?'edge':'move';
if(S.lew==='low'){ph=Lk.lowT?'climax':'move';Lk.lowT=1;}
}
var t=S.lew==='low'?pk(C.low):ST.fmt(pk(contPool(ph,tp,bt)),vv);
if(ph==='hush'){Lk.hushed=true;var hl=S.lew!=='low'&&rng()<0.65&&LK.TOPV&&LK.TOPV.hush&&(LK.TOPV.hush[tp.persona]||LK.TOPV.hush.gentle);if(hl)t+=tp.name+'「'+pk(hl)+'」';}
else if(ph==='edge'&&S.lew!=='low'&&V&&V.EDGE&&V.EDGE[bt.persona]&&rng()<0.6)t+=bt.name+'「'+pk(V.EDGE[bt.persona])+'」';
else if(ph==='climax'){
var cb=climaxBy(S,bt,tp,false),ct=climaxBy(S,tp,bt,true);
if(cb&&ct)t=moan(S,bt,false,md,true)+cb+moan(S,tp,true,md,true)+ct;
bumpClimax(bt);bumpClimax(tp);Lk.done=true;
}else if(ph==='after'){Lk.conn=false;Lk.done=false;Lk.rest=1+rng.int(2);Lk.m.forEach(function(p){p.m.reason=clamp(p.m.reason+8,0,100);p.rxCool=true;});}
var tag=md==='ff'&&ph==='move'?'肌を重ねたまま':C.tag[ph];
ST.sayB(S,{actors:[tp,bt],tag:tag,text:t,why:{move:'繋がったまま、狭い箱の中で',hush:'外の物音に、二人とも動きを止めた',edge:bt.name+'が限界に近い',climax:'ロッカーの中で、二人とも果てた',after:'一度果てて、少しだけ正気が戻った（理性 +8）'}[ph]+'（ロッカー'+Lk.n+'・快感 '+tp.name+' '+Math.round(Math.min(100,tp.m.plea))+'・'+bt.name+' '+Math.round(Math.min(100,bt.m.plea))+'）',mag:ph==='climax'?34:18,kind:'climax'},tp.name+'と'+bt.name+'：'+tag,ph==='climax');
}
function trioPairs(m){return[[m[0],m[1]],[m[0],m[2]],[m[1],m[2]]];}
function touchOk(S,a,b){
if(!a|| !b||a===b)return false;
if(HK.Pos&&HK.Pos.genderOK&& !HK.Pos.genderOK(a,b))return false;
if(HK.ngPair&&HK.ngPair(a,b))return false;
if(HK.sexBlocked&&HK.sexBlocked(a,b))return false;
if(noLoveTie(S,a,b)||(a.minor||'')!==(b.minor||''))return false;
if(!HK.SAFE_ON&& !(HK.State.r18ok(a)&&HK.State.r18ok(b)))return false;
return true;
}
function trioPlan(S,m){
var ok=trioPairs(m).map(function(pr){return canAct(S,pr[0],pr[1]);});
if(ok[0]&&ok[1]&&ok[2])return{all:true};
for(var i=0;i<3;i++){
var h=m[i],r=m.filter(function(c){return c!==h;});
if(canAct(S,h,r[0])&&canAct(S,h,r[1])&&touchOk(S,r[0],r[1]))return{all:false,hub:h};
}
return null;
}
function trioOk(S,m){
if(!trioPlan(S,m))return false;
if(m.some(function(p){return S.P.some(function(q){return m.indexOf(q)<0&&has(S,p,q,/^(lover|mate|fated)$/)&&okLove(p,q);});}))return false;
return m.every(function(p){return p.honmei==null||(m.some(function(q){return q.i===p.honmei;})&&desperate(p));});
}
function trioShape(S,m){
var Pos=HK.Pos,pl=trioPlan(S,m);
if(!pl)return null;
if(!pl.all){
var h=pl.hub,xy=m.filter(function(c){return c!==h;}),x=xy[0],y=xy[1];
var ox=Pos?Pos.order(h,x,[h,x]):[h,x],oy=Pos?Pos.order(h,y,[h,y]):[h,y],ht=(ox[0]===h?1:0)+(oy[0]===h?1:0);
if(ht===2)return{p:'oneTwo',t:h,m:x,u:y,hub:true};
if(ht===0)return{p:'twoOne',t:x,m:y,u:h,hub:true};
var up=ox[0]===h?y:x,dn=ox[0]===h?x:y;
if(modeOf(up,h)==='fm')return null;
return{p:'sandwich',t:up,m:h,u:dn,hub:true};
}
var es=trioPairs(m).map(function(pr){return Pos?Pos.order(pr[0],pr[1],pr):pr;});
var tops=function(c){return es.filter(function(e){return e[0]===c;}).length;};
var T2=m.filter(function(c){return tops(c)===2;})[0],B0=m.filter(function(c){return tops(c)===0;})[0];
if(T2&&B0){
var M=m.filter(function(c){return c!==T2&&c!==B0;})[0],ks=['oneTwo','twoOne','sandwich'];
if(HK.Pos&&HK.Pos.hardTop(M,T2))ks=['twoOne'];
if(modeOf(T2,M)==='fm')ks=ks.filter(function(x){return x!=='sandwich';});
if(!ks.length)ks=['oneTwo'];
var p=S.rng.pick(ks);
return p==='oneTwo'?{p:p,t:T2,m:M,u:B0}:p==='twoOne'?{p:p,t:T2,m:M,u:B0}:{p:p,t:T2,m:M,u:B0};
}
return null;
}
function trioTurn(S,Lk,turn){
var rng=S.rng,pk=S.pk,m=Lk.m,R=LK.CROWD_R18;
Lk.trioNow=false;
if(Lk.rest>0){Lk.rest--;return;}
var heat=m.reduce(function(s,p){return s+p.m.heat;},0)/3,reason=m.reduce(function(s,p){return s+p.m.reason;},0)/3;
var lead=m.slice().sort(function(p,q){return(q.m.heat/100+q.tr.impulse*0.3+q.tr.fc*0.15-q.m.reason/130)-(p.m.heat/100+p.tr.impulse*0.3+p.tr.fc*0.15-p.m.reason/130);})[0];
var urge=lead.m.heat/100+lead.tr.impulse*0.35+lead.tr.fc*0.15-lead.m.reason/130-lead.tr.cp*0.12;
if(urge<0.36+rng()*0.3)return;
var others=m.filter(function(p){return p!==lead;});
if(trioOk(S,m)){
var willing=others.every(function(p){return p.m.heat/100+p.tr.np*0.15+p.tr.fc*0.15-p.m.reason/160+relW(S,p,lead,'acc')*0.5>0.3;});
if(!willing){holdPair(S,lead,others[0],'同じロッカーの'+names(others)+'の気持ちが、まだ追いついていなかった');return;}
var lvMax=Math.min(LK.MAXLV||4,4),nx=Math.min(Lk.lv+1,lvMax>=2?2:lvMax);
if(Lk.trioSex){
if(Lk.lingered)return;
Lk.lingered=true;
var sp0=Lk.trioShape;
if(R&&S.R18)ST.sayB(S,{actors:m,tag:'三人の名残',text:ST.fmt(pk(R.AFTER3),{t:sp0.t.name,m:sp0.m.name,u:sp0.u.name}),why:'三人の場面：媚薬はまだ効いていたが、三人とも体が先に限界だった（仲良し）'},'三人は寄り添っていた');
return;
}
if(nx<=Lk.lv&& !(nx>=2&&S.R18&&R))return;
Lk.trioIn=true;Lk.lv=Math.max(Lk.lv,nx);Lk.trioNames=[lead.name,others[0].name,others[1].name];S.lewdNow=true;
m.forEach(function(p){p.cnt.accept++;});lead.cnt.make++;
if(nx<2|| !(R&&S.R18)){
var k=nx>=1?'kiss':'touch';
ST.sayB(S,{actors:[lead].concat(others),tag:nx>=1?'三人でキス':'三人で寄り添う',text:ST.fmt(pk(CW.T3[k]),{a:lead.name,b:others[0].name,c:others[1].name}),why:'三人の場面：三人とも互いに想い合える組で、熱に浮かされて寄り添った（'+lead.name+'から・仲良し）',mag:20},'三人が'+(nx>=1?'唇を重ねた':'寄り添った'),Lk.lv===0);
S.cw++;lead.cnt.warm++;
return;
}
var sp=trioShape(S,m);
if(!sp)return;
Lk.trioSex=true;Lk.trioShape=sp;Lk.lv=4;Lk.trioNow=true;
ST.key(S,ST.say(S,{actors:[sp.t,sp.m,sp.u],tag:'三人で',text:trioScene(S,sp),why:(sp.hub?'三人の場面：同じロッカーの三人のうち、'+{oneTwo:sp.t.name,twoOne:sp.u.name,sandwich:sp.m.name}[sp.p]+'が二人の両方と体の関係になれる組だった（中心のある三人。二人どうしは直接は繋がらない。受け攻め：':'三人の場面：同じロッカーの三人とも、互いに体の関係になれる組だった（受け攻め：')+{oneTwo:sp.t.name+'が二人を',twoOne:sp.t.name+'と'+sp.m.name+'が'+sp.u.name+'を',sandwich:sp.t.name+'→'+sp.m.name+'→'+sp.u.name}[sp.p]+'・仲良し）'+(S.trioNight?'／夜の性格：'+S.trioNight:''),mag:36,kind:'climax'}),'ロッカー'+Lk.n+'の三人');
S.cw++;
Lk.rest=1;
return;
}
var pairs=trioPairs(m).filter(function(pr){return canAct(S,pr[0],pr[1]);}).filter(function(pr){return pr.indexOf(lead)>=0;});
if(!pairs.length){var o=rng.pick(others);holdPair(S,lead,o,whyNot(S,lead,o));return;}
var pr=rng.pick(pairs),b=pr[0]===lead?pr[1]:pr[0],c=m.filter(function(p){return p!==lead&&p!==b;})[0];
var w=b.m.heat/100+relW(S,b,lead,'acc')+b.tr.np*0.15-b.tr.cp*0.25-b.m.reason/160+(rng()-0.5)*0.3;
if(b.honmei!=null&&b.honmei!==lead.i)w-=desperate(b)?0.05:0.35;
if(lead.honmei!=null&&lead.honmei!==b.i&& !desperate(lead))return;
if((loyal(S,lead,b)||loyal(S,b,lead))&&S.rng()<0.75)return;
if(Lk.lv>=1&&((Lk.pairN||0)>=2||rng()<0.5))return;
lead.cnt.make++;
if(w<0.32){
b.cnt.refuse++;
ST.sayB(S,{actors:[lead,b],tag:'嗜めた',text:ST.fmt(pk(LK.ACT.touch.t),{a:lead.name,b:b.name})+ST.fmt(pk(LK.REFUSE),{a:lead.name,b:b.name}),why:lead.name+'が手を伸ばした（発情 '+Math.round(lead.m.heat)+'）／'+b.name+'は、すぐそばに'+c.name+'がいるので嗜めた',mag:16},b.name+'が嗜めた');
return;
}
b.cnt.accept++;S.lewdNow=true;Lk.pairN=(Lk.pairN||0)+1;
var lv=Math.min(Lk.lv+1,1);
Lk.lv=Math.max(Lk.lv,lv);Lk.top=lead;Lk.bot=b;
var t=ST.fmt(pk(hands(LK.ACT[lv?'kiss':'touch'][lead.bound?'bound':'t'],lead,b)),{a:lead.name,b:b.name});
var jl=interest(S,c,b)?b:interest(S,c,lead)?lead:null;
if(jl){
var other=jl===b?lead:b;
t+=ST.fmt(pk(CW.J.watch),{a:c.name,b:jl.name,c:other.name})+c.name+pk(CW.JSAY[c.persona]||CW.JSAY.gentle);
c.cnt.jeal++;c.jealOf=jl.i;c.m.reason=clamp(c.m.reason-4,0,100);S.cj++;
ST.sayB(S,{actors:[c,jl,other],tag:'嫉妬',text:t,why:'三人の場面：'+c.name+'は、'+jl.name+CW.J_WHY.watch,mag:20},c.name+'が嫉妬した',true);
}else{
t+=ST.fmt(pk(CW.W.kind),{a:c.name,b:lead.name,c:b.name});
c.cnt.warm++;S.cw++;
ST.sayB(S,{actors:[c,lead,b],tag:'見守る',text:t,why:'三人の場面：'+c.name+CW.W_WHY.kind+'（仲良し）',mag:18},c.name+'は二人を見守った',true);
}
}
function trioScene(S,sp){
var R=LK.CROWD_R18,pk=S.pk,r={t:sp.t,m:sp.m,u:sp.u},vv={t:sp.t.name,m:sp.m.name,u:sp.u.name};
var out=ST.fmt(pk(R.OPEN3),vv)+ST.fmt(pk(R.SHAPE3[sp.p]),vv);
var prs=sp.p==='oneTwo'?[[sp.t,sp.m,sp.u],[sp.t,sp.u,sp.m]]:sp.p==='twoOne'?[[sp.t,sp.u,sp.m],[sp.m,sp.u,sp.t]]:[[sp.t,sp.m,sp.u],[sp.m,sp.u,sp.t]];
var nUsed={},nLab=[];
S.trioNight='';
prs.forEach(function(z){
out+=ST.fmt(pk(R.TP[modeOf(z[0],z[1])]),{a:z[0].name,b:z[1].name,c:z[2].name});
if(!LK.nightLine)return;
var uT=nUsed['a'+z[0].i],uB=nUsed['b'+z[1].i];
if(uT&&uB)return;
var mo=modeOf(z[0],z[1]),nr=LK.nightLine(S,z[0],z[1],'deep',{mode:mo==='ins'?'mf':mo,only:uT?'bot':uB?'top':undefined});
if(!nr|| !nr.text)return;
out+=nr.text;nLab.push(nr.label);nUsed['a'+z[0].i]=nUsed['b'+z[1].i]=true;
});
S.trioNight=nLab.join('・');
if(S.eroOn&&HK.ThickEro&&HK.ThickEro.trioFill){
var tops=sp.p==='oneTwo'?[sp.t]:[sp.t,sp.m],bots=sp.p==='oneTwo'?[sp.m,sp.u]:sp.p==='twoOne'?[sp.u]:[sp.m,sp.u];
var pen=tops.every(function(c){return!isF(c);})&&R.TRIO_ERO.pen[sp.p];
var soft=(sp.p==='twoOne'||sp.hub)&&R.TRIO_ERO.softU?R.TRIO_ERO.softU[sp.p]||R.TRIO_ERO.soft:R.TRIO_ERO.soft;
out+=HK.ThickEro.trioFill(S,ST.fmt(pk(pen||soft),vv),r);
}
var recv=sp.p==='oneTwo'?[[sp.m,sp.t],[sp.u,sp.t]]:sp.p==='twoOne'?[[sp.u,sp.t]]:[[sp.u,sp.m],[sp.m,sp.t]];
var tops2=sp.p==='oneTwo'?[[sp.t,sp.m]]:sp.p==='twoOne'?[[sp.t,sp.u],[sp.m,sp.u]]:[[sp.t,sp.m]];
recv.forEach(function(z){out+=moan(S,z[0],false,modeOf(z[1],z[0]),true)+climaxBy(S,z[0],z[1],false);bumpClimax(z[0]);});
tops2.forEach(function(z){out+=moan(S,z[0],true,modeOf(z[0],z[1]),true)+climaxBy(S,z[0],z[1],true);bumpClimax(z[0]);});
out+=ST.fmt(pk(R.CL3),vv);
return out;
}
function cross(S,lockers,G){
var rng=S.rng,pk=S.pk,P=S.P,J=[],W=[];
P.forEach(function(a){
P.forEach(function(b){
if(a===b|| !interest(S,a,b))return;
var bm=b.mates.filter(function(c){return c!==a;});
if(b.L!==a.L&&bm.length){
var c=rng.pick(bm);
if(b.L.lv>=1&&(b.L.top===c||b.L.bot===c||b.L.trioIn))J.push({k:okLove(b,c)&&interest(S,b,c)&& !a.lostTo&&rng()<0.4?'lost':'hear',a:a,b:b,c:c});
else J.push({k:'pressed',a:a,b:b,c:c});
}
P.forEach(function(c){if(c!==a&&c!==b&&interest(S,c,b)&&a.L!==b.L&&c.L!==b.L&&a.i<c.i)J.push({k:'rival',a:a,b:b,c:c});});
});
});
lockers.forEach(function(Y){
if(Y.m.length<2)return;
var outs=P.filter(function(a){return a.L!==Y;});
if(!outs.length)return;
var b=Y.m[0],c=Y.m[1];
outs.forEach(function(a){
W.push({k:'cheer',a:a,b:b,c:c});
Y.m.forEach(function(bb){if(has(S,a,bb,/^(lover|mate|fated)$/)&&okLove(a,bb))W.push({k:'reassure',a:a,b:bb,c:Y.m.filter(function(q){return q!==bb;})[0]});});
});
if(Y.m.length===2&&Y.lv>=1)outs.forEach(function(a){if(!interest(S,a,b)&& !interest(S,a,c)&& !a.L.sexIn&&a.L.lv<1)J.push({k:'envy',a:a,b:b,c:c});});
if(Y.m.length===2&&Y.lv>=1&&okLove(b,c)&&(interest(S,b,c)||interest(S,c,b))&& !S.blessed[Y.n])outs.forEach(function(a){if(!interest(S,a,b)&& !interest(S,a,c))W.push({k:'bless',a:a,b:b,c:c,Y:Y});});
});
if(lockers.length>=2){
var pool=P.slice(),three=[];
while(three.length<3&&pool.length)three.push(pool.splice(rng.int(pool.length),1)[0]);
if(three.length===3){
W.push({k:'tease',a:three[0],b:three[1],c:three[2]});
if(G&& !G.bind&&S.prog<90&&new Set(three.map(function(p){return p.L;})).size>=2)W.push({k:'relay',a:three[0],b:three[1],c:three[2]});
}
}
lockers.forEach(function(Y){if(Y.m.length===3&& !Y.trioIn&&Y.m.every(function(p){return p.m.reason>20;}))W.push({k:'trio',a:Y.mid,b:Y.m.filter(function(p){return p!==Y.mid;})[0],c:Y.m.filter(function(p){return p!==Y.mid;})[1]});});
var pJ=J.length?clamp(0.5+(S.cw-S.cj)*0.25,0.15,0.95):0;
if(!W.length)pJ=J.length?1:0;
if(!J.length&& !W.length)return;
if(!J.length&&S.cw-S.cj>=1&&rng()<0.75)return;
if(rng()<pJ){
var e=rng.pick(J),a=e.a,v={a:a.name,b:e.b.name,c:e.c.name};
a.cnt.jeal++;if(e.k!=='envy')a.jealOf=e.b.i;a.m.reason=clamp(a.m.reason-4,0,100);S.cj++;
if(e.k==='lost')a.lostTo=[e.b.i,e.c.i];
ST.sayB(S,{actors:[a,e.b,e.c],tag:CW.J_TAG[e.k],text:ST.fmt(pk(CW.J[e.k]),v)+(S.rng()<0.7?a.name+pk(CW.JSAY[a.persona]||CW.JSAY.gentle):''),why:'三人の場面：'+a.name+'は、'+e.b.name+CW.J_WHY[e.k]+'（嫉妬）',mag:20},a.name+'が'+CW.J_TAG[e.k],e.k==='lost');
}else{
var w=rng.pick(W),v2={a:w.a.name,b:w.b.name,c:w.c.name};
[w.a,w.b,w.c].forEach(function(p){p.m.reason=clamp(p.m.reason+4,0,100);});
w.a.cnt.warm++;S.cw++;
if(w.k==='relay')S.prog=clamp(S.prog+12+S.rng()*10,0,99);
if(w.k==='bless')S.blessed[w.Y.n]=true;
ST.sayB(S,{actors:[w.a,w.b,w.c],tag:CW.W_TAG[w.k],text:ST.fmt(pk(CW.W[w.k]),v2),why:'三人の場面：'+w.a.name+CW.W_WHY[w.k]+'（三人の理性 +4・仲良し）',mag:16},w.a.name+'：'+CW.W_TAG[w.k],w.k==='bless');
}
}
LK.crowd=function(input){return input.chars.length<=1?soloRun(input):groupRun(input);};
})();
});
;
/* ==== js/solo-locker.js ==== */
HK.Load.def(179,'js/solo-locker.js',function(){
(function(){
'use strict';
var HK=window.HK,LK=HK.LOCKER,ST=HK.Story,clamp=HK.clamp;
var W_CL='高鳴り';
if(!LK|| !ST)return;
var W_SEXL='心に決めた相手を';
var scen={
id:'locker',name:'媚薬ロッカー',kicker:'1〜6人・R18',solo:true,maxCast:6,minCast:1,
note:'※登場人物はすべて成人として扱います。',
unit:'コマ',simulate:function(input){return run(input);},
castHint:'1〜6人。2人のときが本筋で、二人の関係（恋人・主従・ライバルなど）は「既存の関係」から決まります。まれに、自分から望んで閉じ込められている人がいます（役割で指定もできます。2人のときだけ）。1人なら一人きりのロッカー、3人以上なら倉庫のロッカーに二人ずつ・三人ずつ分かれて閉じ込められます。',
env:[
{id:'bind',label:'拘束',type:'select',def:'random',options:[{v:'random',label:'おまかせ'},{v:'both',label:'二人とも手錠'},{v:'one',label:'片方だけ手錠'},{v:'none',label:'拘束なし'}]},
{id:'dose',label:'媚薬の濃さ',min:0,max:100,def:65,lo:'ほのか',hi:'理性が飛ぶ'},
{id:'diff',label:'仕掛けの難しさ',min:0,max:100,def:50,lo:'簡単',hi:'激ムズ'},
{id:'turns',label:'制限時間',min:6,max:14,def:12,lo:'30分',hi:'70分',desc:'5分ごとに区切る。時間切れになると扉は開くが……'},
{id:'ev',label:'ハプニングの頻度',min:0,max:100,def:45,lo:'たまに',hi:'頻繁'},
{id:'layout',label:'ロッカーの分け方（3人以上）',type:'select',def:'random',options:[{v:'random',label:'おまかせ'},{v:'big',label:'大きなロッカーに三人ずつ'},{v:'split',label:'二人ずつ別のロッカーに'}],desc:'3人以上のとき、誰と誰が同じロッカーになるかは運しだい。余った人は一人のロッカーに'},
{id:'finder',label:'見回りの人（1人のとき）',type:'select',def:'random',options:[{v:'random',label:'おまかせ（運しだい）'},{v:'mob',label:'来る'},{v:'none',label:'来ない（自力で出る）'}],desc:'1人のとき、外から扉を開けてくれる人が来るか'},
{id:'lewd',label:'描写の濃さ',type:'select',def:'mid',options:[{v:'low',label:'ぼかす'},{v:'mid',label:'ほどほど'},{v:'high',label:'濃いめ'}]}
],
stats:[
{id:'gaman',label:'我慢',desc:'高いほど媚薬に耐え、理性が長くもつ'},
{id:'dex',label:'器用さ',desc:'高いほど仕掛けを解くのが早い（謎解きはエゴグラムのAも効く）'},
{id:'luck',label:'運',desc:'高いほど、外から扉が開くなどの幸運が起きやすい'}
],
actions:[
{id:'solve',label:'脱出に集中する',fit:function(t){return t.a*0.5+t.cp*0.4;}},
{id:'calm',label:'相手を落ち着かせる',fit:function(t){return t.np*0.8;}},
{id:'flow',label:'流れに任せる',fit:function(t){return t.fc*0.5+t.ac*0.4;}}
],
goals:[
{id:'out',label:'一刻も早く出る',fit:function(t){return t.cp*0.5+t.caution*0.5;}},
{id:'safe',label:'相手を守る',fit:function(t){return t.np*0.7;}},
{id:'want',label:'本当は少し期待している',fit:function(t){return t.fc*0.4+t.impulse*0.4;}}
],
perFields:[{id:'role',label:'役割',auto:'おまかせ（まれに自分から閉じ込められている）',options:[{id:'normal',label:'巻き込まれた'},{id:'plotter',label:'自分から望んで閉じ込められた'}]}],
events:[]
};
HK.SCENARIOS.locker=scen;
LK.SCEN=scen;
if(HK.SCEN_ORDER.indexOf('locker')<0)HK.SCEN_ORDER.push('locker');
var LV=['touch','kiss','grope','oral','sex'];
var REL={lover:'lover',mate:'lover',fated:'lover',fwb:'fwb',master:'master',crush:'crush',friend:'friend',best:'friend',childhood:'friend',buddy:'friend',senpai:'friend',colleague:'colleague',classmate:'classmate',boss:'boss',worship:'worship',fond:'friend',blind:'worship',benefactor:'benefactor',relative:'relative',acq:'friend',almost:'almost',rival:'tension',bad:'tension',enemy:'tension',ex:'ex',sibling:'friend'};
var REL_LABEL={lover:'恋人',fwb:'セフレ',master:'主従',crush:'片想い',mutual:'両片想い',friend:'知り合い',almost:'友達以上恋人未満',tension:'険悪',ex:'元恋人',stranger:'初対面',colleague:'同僚',classmate:'同級生',boss:'上司と部下',worship:'執着（信仰）',benefactor:'恩人',relative:'親族'};
var LK_HATE_LEAD=['狭いロッカーの中で、{b}は{a}の胸に、そっと額を預けた。','{b}は、触れ合った{a}の手を、そのまま握ろうとした。','{b}は、熱に浮かされた目で、{a}の顔を見上げた。'];
function run(input){
if(input&&input.chars&&input.chars.length!==2&&LK.crowd)return LK.crowd(input);
var S=ST.state(input,'locker'),rng=S.rng,env=S.env,P=S.P,lew=env.lewd||'mid',V=HK.Voice;
var A=P[0],B=P[1];
var pk=function(arr){return LK.pick(S,arr);};
var soft=function(arr,p){if(!p|| !p.noR18|| !arr|| !arr.filter)return arr;var f=arr.filter(function(l){return!/喘ぎ|発情|濡れ|疼/.test(typeof l==='string'?l:l.t||'');});return f.length?f:arr;};
if(!B){B=A;}
var PRIO=['mate','fated','lover','master','worship','blind','fwb','ex','crush','yan','almost','best','buddy','childhood','rival','enemy','bad','senpai','mentor','teacher','benefactor','boss','fond','colleague','classmate','friend','acq','relative','pparent','parent','sibprot','sibling','sibclose','sibbad'];
var pr=function(t){var k=PRIO.indexOf(t.type);return k<0?999:k;};
var tieL=(input.ties||[]).filter(function(t){return(t.a===A.i&&t.b===B.i)||(t.a===B.i&&t.b===A.i);}).sort(function(x,y){return pr(x)-pr(y);});
var tie=tieL[0];
var rel=tie?REL[tie.type]||REL[(HK.TIES[tie.type]||{}).like]||'friend':'stranger';
var RL=Object.assign({},REL_LABEL);
if(tie&&rel==='friend'&& !/^(friend|acq)$/.test(tie.type)&&HK.TIES[tie.type])RL.friend=HK.TIES[tie.type].label;
if(tie&&HK.Sib&&HK.Sib.isSibTie(tie)&&HK.tieLabel){var sibL=HK.tieLabel(tie,P);if(sibL)RL[rel]=sibL;}
var master=null,servant=null,crusher=null;
var mtie=tieL.filter(function(t){return t.type==='master';})[0];
if(mtie){master=P[mtie.a];servant=P[mtie.b];}
var crushL=tieL.filter(function(t){return t.type==='crush';});
if(crushL.length)crusher=P[crushL[0].a];
var NT=LK.TIES,nt=NT?NT.setup(S,A,B,tieL):null,svW=false,SV=LK.SERVANT;
if(!mtie&&nt&&nt.type==='worship'){servant=nt.u;master=nt.d;svW=true;SV=NT.sv(nt);}
var mutualCrush=crushL.length>1&&crushL.some(function(t){return t.a!==crushL[0].a;});
if(rel==='crush'&&mutualCrush)rel='mutual';
var fwbAll=tieL.some(function(t){return t.type==='fwb';});
var intimate=fwbAll||rel==='lover';
var fcKind=fwbAll&&crusher?(crushL.length>1?'mutual':crushL[0].cold?'cold':'pulse'):null;
var plotter=null;
P.forEach(function(p){var pk=(input.perChar&&input.perChar[p.i]&&input.perChar[p.i].pick||{}).role;if(pk==='plotter')plotter=p;});
if(!plotter&&rng()<0.1)plotter=crusher||(rng()<0.5?A:B);
var ngP= !!(HK.ngPair&&HK.ngPair(A,B))&& !(HK.lockSexOnly&&HK.lockSexOnly(A,B));
var tieNL= !ngP&& !!(nt&&nt.noLove),nlWhy=tieNL?nt.nlWhy:'';
var famT=tieL.some(function(t){return/^(lover|mate|fated|fwb|crush|almost|ex|master)$/.test(t.type);})?null:tieL.filter(function(t){return HK.tieNoLove&&HK.tieNoLove(t);})[0];
if(famT){tieNL=true;nlWhy=((HK.tieLabel&&HK.tieLabel(famT,P))||(HK.TIES[famT.type]||{}).label||'家族')+'（恋愛にしない関係）';}
if(tieNL)ngP=true;
var r18No= !ngP&&(A.noR18?A:B.noR18?B:null)||null;
var loveNo= !!(r18No&&LK.loveOK&&LK.loveOK(A,B));
var sexP= !ngP&& !!(r18No||(HK.sexNG&&HK.sexNG(A,B))),sexWho=sexP?(r18No||(HK.sexLockOut(A,B)?A:B)):null;
var sexWhy= !sexP?'':r18No?r18No.name+'はR18に参加しない':sexWho.name+'は、'+W_SEXL+(function(){var nm=(sexWho.sexLocks||(typeof sexWho.sexLock==='number'?[sexWho.sexLock]:[])).map(function(k){return input.chars[k]&&input.chars[k].name;}).filter(Boolean);return nm.length?nm.join('・')+'に':'ほかの人に';})()+'決めている';
if(ngP||r18No)plotter=null;
var bind=env.bind==='random'?rng.pick(['both','one','none','both']):env.bind;
P.forEach(function(p){
var o=p===A?B:A;
p.o=o;
p.bound=bind==='both';
p.m={heat:plotter===p?25:0,reason:clamp(70+p.tr.cp*15+p.stats.gaman*3,40,100),plea:0,esc:0};
p.cnt={make:0,refuse:0,accept:0,climax:0,solve:0,hold:0};
var pc=(input.perChar&&input.perChar[p.i])||{};
p.action=pick(scen.actions,pc.action,p);p.goal=pick(scen.goals,pc.goal,p);
p.roleLabel=(plotter===p?'自分から閉じ込められた人':'閉じ込められた人')+'・'+RL[rel]+(svW||(nt&& !mtie)?NT.role(nt,p):servant===p?'（従者）':master===p?'（主）':'');
p.sens=(0.6+(6-(p.stats.gaman||3))*0.1-p.tr.cp*0.15)*(0.7+rng()*0.7);
});
function pick(list,id,p){if(id&&id!=='auto')for(var i=0;i<list.length;i++)if(list[i].id===id)return list[i];return HK.weighted(rng,list,function(o){return Math.pow(Math.max(0.02,o.fit(p.tr)),3);});}
var boundOne=null;
var Pos=HK.Pos,clash= !!(Pos&&Pos.clash(A,B))||tieNL|| !!r18No,ff= !!(Pos&&Pos.ff(A,B)),R18= !HK.SAFE_ON;
if(!S.ties)S.ties=(HK.Story&&HK.Story.tiesOk?HK.Story.tiesOk(S.P,input.ties):input.ties||[]);
var HSX=R18&&HK.HateSex,hateP= !!(HSX&&rel==='tension'&& !ngP&& !clash&&HSX.hostile(S,A,B));
var LHo=HK.LoveHate,lhAny= !!(LHo&& !ngP&&LHo.any(S,A,B));
function hardTop(p){return!!(Pos&&Pos.hardTop(p,p&&p.o));}
if(bind==='one'){
boundOne=plotter?plotter.o:rng()<0.5?A:B;
if(hardTop(boundOne)){if(!hardTop(boundOne.o))boundOne=boundOne.o;else{bind='both';boundOne=null;A.bound=B.bound=true;}}
if(boundOne)boundOne.bound=true;
}
var keys=['heat','reason','plea','esc'];
var gimmicks=[];
if(bind!=='none')gimmicks.push(LK.GIMMICK.filter(function(g){return g.bind;})[0]);
var others=LK.GIMMICK.filter(function(g){return!g.bind&& !(ngP&&g.lewd);});
var first=rng.pick(others);gimmicks.push(first);
if(rng()<0.5+env.diff/200)gimmicks.push(rng.pick(others.filter(function(g){return g!==first;})));
var gi=0,prog=0,escaped=false,escTurn= -1,how='';
var pair={level: -1,sexIn:false,acts:0,refusedHard:false};
var v0={a:A.name,b:B.name};
function bindLines(){var l=LK.BIND[bind],c=l.filter(function(x){return/手錠/.test(x);});return bind==='none'|| !c.length?l:c;}
ST.step(S,'閉じ込められた');
ST.budget(S,3);
ST.say(S,{actors:[A,B],tag:'目覚め',text:ST.fmt(pk(LK.INTRO),v0)+ST.fmt(pk(bindLines()),boundOne?{a:boundOne.name,b:boundOne.o.name}:v0)+(HK.Attr&&HK.Attr.raceIntro?HK.Attr.raceIntro([A,B],'trapped',S):''),why:'二人の関係：'+RL[rel]+'／拘束：'+{both:'二人とも',one:boundOne?boundOne.name+'だけ':'',none:'なし'}[bind]});
ST.say(S,{kind:'phase',text:pk(LK.SPEAKER)+'（仕掛け：'+gimmicks.map(function(g){return g.name;}).join('→')+'）'});
var plotPush=plotter?LK.PLOT.push.filter(function(l){return!((clash||(hardTop(plotter.o)&& !hardTop(plotter)))&& /胸に押し当て|腰に回させ|任せて/.test(l));}):[];
if(nt)NT.wake(S,nt);
if(plotter){var o=ST.say(S,{actors:[plotter],tag:'思惑',text:ST.fmt(pk(plotPush.length?plotPush:LK.PLOT.push),{a:plotter.name,b:plotter.o.name}),why:plotter.name+'は、自分から望んでここにいる'+(rel==='mutual'?'（'+plotter.o.name+'への片想い。実は向こうも同じ）':crusher===plotter?'（'+plotter.o.name+'への片想い）':''),mag:20});ST.key(S,o,plotter.name+'の思惑');}
ST.snap(S,keys);
function stage(p){return p.m.heat>=85?3:p.m.heat>=60?2:p.m.heat>=35?1:0;}
function topV(p,k){
var T=LK.TOPV&&LK.TOPV[k];
if(T&&k==='moan')T=T[ff?'ff':Pos&&Pos.isF(p)?'fm':'ins'];
return T?T[p.persona]||T.gentle:null;
}
var LX=HK.Lewd,lcf=LX&&LX.conf('locker'),eroOn= !!(lcf&&HK.Ero&&HK.Ero.on(S)&&HK.ThickEro&&lew!=='low'),eroNow=false;
function moan(p,top,open){
if(eroOn&&eroNow){var d0=p.eroDom;p.eroDom= !!top;var m=HK.Ero.moan(S,p,top?1:2);p.eroDom=d0;return p.name+'「'+m+'」';}
var l=lew==='low'|| !V?null:top?topV(p,'moan'):V.CLIMAX[p.persona];
if(lew!=='low'&&HK.Moan&&HK.Moan.say){var mv=HK.Moan.say(S,p,top?'top':'climax',{hush: !open,novel:true,top:top?null:p.o},l&&l.length?l:null);return mv?p.name+'「'+mv+'」':'';}
return l&&l.length?p.name+'「'+pk(l)+'」':'';
}
function say2(p,T){var l=T[p.persona]||T.gentle;return p.name+pk(l);}
function climax(p,t,top){p.cnt.climax++;p.m.plea=25;p.m.heat=clamp(p.m.heat-10,0,100);return t+moan(p,top);}
function canHands(p){return!p.bound;}
function actLabel(lv){var k=LV[lv];return ff&&LK.FF_ACT&&LK.FF_ACT[k]&&LK.FF_ACT[k].label||LK.ACT[k].label;}
function clashType(p){
var t=p.tr,sc={solve:t.cp*0.6+t.a*0.3+(p.goal&&p.goal.id==='out'?0.2:0)+(p.action&&p.action.id==='solve'?0.15:0),care:t.np*0.85+(p.goal&&p.goal.id==='safe'?0.2:0),shy:t.ac*0.85,joke:t.fc*0.8,endure:0.5};
return Object.keys(sc).reduce(function(x,k){return sc[k]>sc[x]?k:x;},'endure');
}
function holdClash(a,b){
a.cnt.hold++;a.m.reason=clamp(a.m.reason+3,0,100);a.m.plea=clamp(a.m.plea+8,0,90);
if(a.cnt.hold>3&&rng()<0.5)return;
var ty=clashType(a),C=LK.CLASH;
ST.sayB(S,{actors:[a,b],tag:C.tag[ty],text:ST.fmt(pk(C.hold[ty]),{a:a.name,b:b.name})+(rng()<0.5?ST.fmt(pk(C.reply),{a:a.name,b:b.name}):''),why:a.name+(a.noR18?'は媚薬で火照っていた（':'は発情していた（')+Math.round(a.m.heat)+'）が、'+b.name+(ngP?'とは'+(tieNL?nlWhy+'の二人':'恋愛・R18にしない組')+'なので、手は出さなかった（':sexP?'とは体の関係にならない（'+sexWhy+'）ので、手は出さなかった（':'とは受け攻めの向きが合わない二人なので、手は出さなかった（')+{solve:'CP・A',care:'NP',shy:'AC',joke:'FC',endure:'我慢'}[ty]+'）',mag:16},a.name+'は手を出さずに耐えた',a.cnt.hold===1);
}
function fmPair(t,u){return!!(Pos&& !ff&&Pos.isF(t)&& !Pos.isF(u));}
function hands(arr,a,b){
var r=arr.filter(function(l){return!(a.bound&& /\{a\}の(手|指)/.test(l))&& !(b.bound&&(/\{b\}の(手|指)/.test(l)|| /\{b\}は[^。「]*(手で|手を|指で|手首を|両手)/.test(l)));});
return r.length?r:arr;
}
function hb(arr,tp,bt){return arr.filter(function(l){return!(/^H:/.test(l)&&tp.bound)&& !(/^B:/.test(l)&&bt.bound);}).map(function(l){return l.replace(/^[HB]:/,'');});}
function contPool(k,tp,bt){var C=LK.CONT,m=ff?'ff':fmPair(tp,bt)?'fm':'ins';return hb((C[m][k]||[]).concat(C.any[k]||[]),tp,bt);}
function startConn(tp){pair.conn=true;pair.top=tp;pair.bot=tp.o;pair.rounds=(pair.rounds||0)+1;pair.done=false;pair.hushed=false;pair.lowT=0;}
function contTurn(){
var tp=pair.top,bt=pair.bot,C=LK.CONT,ph,vv={a:tp.name,b:bt.name};
if(pair.done)ph='after';
else{
bt.m.plea+=(14+rng()*12)*bt.sens;tp.m.plea+=(10+rng()*10)*tp.sens;
P.forEach(function(p){p.m.heat=clamp(p.m.heat+3,0,100);});
ph=bt.m.plea>=100||tp.m.plea>=100?'climax': !pair.hushed&&rng()<0.3?'hush':bt.m.plea>=70?'edge':'move';
if(lew==='low'){ph=pair.lowT?'climax':'move';pair.lowT=1;}
}
var t=lew==='low'?pk(C.low):ST.fmt(pk(contPool(ph,tp,bt)),vv);
if(ph==='hush'){
pair.hushed=true;bt.m.reason=clamp(bt.m.reason+4,0,100);
var hl=lew!=='low'&&rng()<0.65&&topV(tp,'hush');
if(hl)t+=tp.name+'「'+pk(hl)+'」';
}else if(ph==='edge'&&lew!=='low'&&V&&V.EDGE&&V.EDGE[bt.persona]&&rng()<0.6)t+=bt.name+'「'+pk(V.EDGE[bt.persona])+'」';
else if(ph==='climax'){t=climax(tp,climax(bt,t),true);pair.done=true;}
else if(ph==='after'){pair.conn=false;pair.done=false;pair.rest=1+rng.int(2);P.forEach(function(p){p.m.reason=clamp(p.m.reason+8,0,100);p.rxCool=true;});}
var tag=ff&&ph==='move'?'肌を重ねたまま':C.tag[ph];
ST.sayB(S,{actors:[tp,bt],tag:tag,text:t,why:{move:'繋がったまま、狭い箱の中で',hush:'外の物音に、二人とも動きを止めた',edge:bt.name+'が限界に近い',climax:'ロッカーの中で、二人とも果てた',after:'一度果てて、少しだけ正気が戻った（理性 +8）'}[ph]+'（快感 '+tp.name+' '+Math.round(Math.min(100,tp.m.plea))+'・'+bt.name+' '+Math.round(Math.min(100,bt.m.plea))+'）',mag:ph==='climax'?34:18,kind:'climax'},tp.name+'と'+bt.name+'：'+tag,ph==='climax');
}
function plotEvent(){
var po=plotter.o,caught=(plotter.sabotage||0)>=1&&rng()<0.15+po.tr.a*0.3;
if(!caught&&rng()>0.18)return;
pair.plotShown=true;
var soft=(!caught&&({lover:1,almost:1,fwb:1,mutual:1}[rel]||crusher===po||po.m.heat>=65))|| !!(nt&&NT.plotSoft(nt,po)),v={a:plotter.name,b:po.name};
var rv=(caught?LK.PLOT.caught:LK.PLOT.reveal).filter(function(l){return!plotter.bound|| !/手を|指を/.test(l);});
if(soft)po.m.heat=clamp(po.m.heat+8,0,100);else{po.m.reason=clamp(po.m.reason+15,0,100);plotter.sabotage=99;pair.plotMad=true;}
ST.key(S,ST.sayB(S,{actors:[plotter,po],tag:caught?'見抜かれた':'打ち明けた',text:ST.fmt(pk(rv),v)+ST.fmt(pk(LK.PLOT.react[soft?'soft':'mad']),v),why:caught?po.name+'は、'+plotter.name+'の細工に気づいた（A）':plotter.name+'は、自分から仕組んだことを打ち明けた',mag:26},'',true),caught?plotter.name+'の細工がばれた':plotter.name+'が仕組んだと打ち明けた');
}
for(var turn=0;turn<env.turns&& !escaped;turn++){
ST.step(S,((turn+1)*5)+'分');
S.step=turn;
ST.budget(S,3);
var logAt=S.log.length;
var surgeL=r18No?LK.SURGE.filter(function(l){return!/擦れ合|声を漏ら|覆いかぶさ/.test(l);}):LK.SURGE;
if(rng()<env.ev/100*0.5){
var calm=rng()<0.3;
if(calm)P.forEach(function(p){p.m.reason=clamp(p.m.reason+12,0,100);p.m.heat=clamp(p.m.heat-6,0,100);p.rxCool=true;});
else P.forEach(function(p){p.m.heat=clamp(p.m.heat+10,0,100);});
ST.sayB(S,{actors:[A,B],tag:calm?'一息':'ハプニング',text:ST.fmt(pk(calm?LK.CALM:surgeL),v0),why:calm?'理性 +12':'二人とも発情 +10'},calm?'少しだけ正気に戻った':'ガスが濃くなった');
}
P.forEach(function(p){
var before=Math.max(stage(p),p.gasShown||0);
p.m.heat=clamp(p.m.heat+(4+env.dose*0.1+rng()*4)*p.sens,0,100);
p.m.reason=clamp(p.m.reason-(3+p.m.heat*0.13-(p.stats.gaman||3)*0.7-p.tr.cp*2),0,100);
var after=stage(p);
if(after>before)p.gasShown=after;
if(after>before)ST.sayB(S,{actors:[p],tag:(p.noR18?['','火照り','めまい','限界']:['','火照り','発情','限界'])[after],text:ST.fmt(pk(((p.noR18|| !LK.GAS)&&LK.GAS_SOFT?LK.GAS_SOFT:LK.GAS)[after]),{a:p.name,b:p.o.name}),why:p.name+(p.noR18?'の火照り ':'の発情 ')+Math.round(p.m.heat)+'・理性 '+Math.round(p.m.reason)+'（我慢 '+p.stats.gaman+'）',mag:after*6},p.name+(p.noR18?'の火照りが増した':'の発情が進んだ'),after>=3);
});
if(HK.HateKit&&rng()<0.3){
if(!S.ties)S.ties=(HK.Story&&HK.Story.tiesOk?HK.Story.tiesOk(S.P,input.ties):input.ties||[]);
S.hkSpace='cramped';
var HKt=HK.HateKit,hp=HKt.pairs(S,[A,B])[0];
var lhH=lhAny?(LHo.has(S,A,B)?A:LHo.has(S,B,A)?B:null):null;
if(lhH&&rng()<0.6){
var kr=LHo.kamau(S,lhH,lhH.o,null);
ST.sayB(S,{actors:[lhH,lhH.o],tag:'愛憎',text:kr.text,why:kr.why},lhH.name+'が'+lhH.o.name+'に構った');
}else if(hp){
var hr=hp.st==='love'?HKt.loveGap(S,hp.a,hp.b,ST.fmt(pk(LK_HATE_LEAD),{a:hp.a.name,b:hp.b.name})):hp.st==='hate'?HKt.quarrel(S,hp.a,hp.b):HKt.style(hp.a)==='active'?HKt.harass(S,hp.a,hp.b):HKt.snub(S,hp.a,hp.b);
hp.a.m.reason=clamp(hp.a.m.reason+6,0,100);
if(hp.st==='love')hp.b.m.heat=clamp(hp.b.m.heat+4,0,100);
ST.sayB(S,{actors:[hp.a,hp.b],tag:hp.st==='love'?'片恋と嫌悪':'敵視',text:hr.text,why:hr.why+'（'+hp.a.name+'の理性 +6）'},hp.a.name+'と'+hp.b.name+'が揉めた');
}
}
if(plotter&& !pair.plotShown&&turn>=2&& !pair.conn)plotEvent();
if(rel==='mutual'&&LK.MUT&& !pair.mutShown&&turn>=1&& !pair.conn&&rng()<0.4){
pair.mutShown=true;
var mf=rng()<0.5?A:B;
ST.sayB(S,{actors:[A,B],tag:'両片想い',text:ST.fmt(pk(LK.MUT.inside),{a:mf.name,b:mf.o.name}),why:'両片想い：二人とも相手を想っているのに、相手は自分を何とも思っていないと思い込んでいる',mag:14},A.name+'と'+B.name+'がすれ違った');
}
if(nt){var ntE=NT.turn(S,nt,{turn:turn,pair:pair,ngP:ngP});if(ntE&&ntE.prog&&gimmicks[gi]&& !gimmicks[gi].lewd)prog=clamp(prog+ntE.prog,0,99);}
var lewdNow=false;
var order=rng()<0.5?[A,B]:[B,A];
if(pair.conn){contTurn();lewdNow=true;order=[];}
else if(pair.rest>0){pair.rest--;order=[];}
for(var k=0;k<order.length;k++){
var a=order[k],b=a.o;
var urge=(a.goal&&a.goal.id==='want'?0.12:a.goal&&a.goal.id==='out'? -0.08:0)+(a.action&&a.action.id==='flow'?0.08:a.action&&a.action.id==='solve'? -0.06:0)+a.m.heat/100+a.tr.impulse*0.35+a.tr.fc*0.15-a.m.reason/130-a.tr.cp*0.12+(plotter===a?0.45:0)+({lover:0.15,fwb:0.2,almost:0.1,crush:crusher===a?0.2:0,mutual:0.2,tension: -0.1}[rel]||0)+(fwbAll&&rel!=='fwb'?0.2:0)+(crusher===a&&rel!=='crush'&&rel!=='mutual'?0.15:0);
if(hateP&&HSX.order(S,a,b)[0]===a)urge+=0.35;
if(lhAny&& !clash&&LHo.has(S,a,b))urge+=0.2;
if(nt)urge+=NT.urge(nt,a);
if(a.honmei!=null&&a.honmei!==b.i)urge-=HK.honmeiDesperate&&HK.honmeiDesperate(null,a)?0.05:0.3;
if(servant===a&&plotter!==a){
var order2= !clash&& !a.ordered&&master.m.heat>70&&master.tr.cp+master.tr.fc>(svW?NT.ordTh(nt):0.8)&&rng()<0.5;
if(order2){a.ordered=true;a.m.reason=0;ST.sayB(S,{actors:[a,b],tag:svW?(nt.dom?'命令':'許し'):'主の許し',text:ST.fmt(pk(SV.order),{a:a.name,b:b.name}),why:(svW?'信仰される側の':'主の')+b.name+'も発情していた（'+Math.round(b.m.heat)+'）',mag:26},b.name+'が'+(svW&&nt.dom?'命じた':'許しを与えた'),true);urge+=0.6;}
else if(urge>0.4&&a.m.reason>8+a.tr.ac*10){
a.cnt.hold++;a.m.reason=clamp(a.m.reason-6,0,100);
if(a.cnt.hold<=2)ST.sayB(S,{actors:[a,b],tag:svW?'崇める相手に触れない':'耐える従者',text:ST.fmt(pk(SV.hold),{a:a.name,b:b.name}),why:(svW?'信仰（崇める相手には、許されるまで触れない':'主への忠誠（CP')+'・理性 '+Math.round(a.m.reason)+'）',mag:20},a.name+'は耐えた',a.cnt.hold===1);
continue;
}else if(urge>0.4&&clash){holdClash(a,b);continue;}
else if(urge>0.4&& !a.broke){a.broke=true;ST.key(S,ST.sayB(S,{actors:[a,b],tag:'理性が切れた',text:ST.fmt(pk(SV.break.filter(function(l){return!hardTop(b)|| !/押しつけ/.test(l);})),{a:a.name,b:b.name}),why:a.name+'の理性が尽きた（耐えた回数 '+a.cnt.hold+'）',mag:34},'',true),a.name+(svW?'が崇める相手に手を伸ばした':'が主に手を出した'));urge+=0.3;}
}
if(a.m.heat>=70&&b.m.heat<40&&urge>0.5&&rng()<0.6){
var kind=b.tr.np>0.6?'give':b.m.heat>25||b.tr.fc>0.6?'tempted':'help';
if(kind==='give'&&(clash||hardTop(a)))kind='help';
if(kind==='tempted'&&(ngP||r18No))kind='help';
if(kind==='tempted')b.m.heat=clamp(b.m.heat+15,0,100);
var onePool=soft(LK.ONE[kind].filter(function(l){return!ngP|| !/抱き寄せ|胸に当て|額を合わせ|耳元/.test(l);}),a);
var tt=ST.fmt(pk(hands(onePool.length?onePool:LK.ONE[kind],a,b)),{a:a.name,b:b.name});
if(kind==='give'){a.m.plea+=50;if(a.m.plea>=100)tt=climax(a,tt);pair.acts++;lewdNow=true;}
ST.sayB(S,{actors:[a,b],tag:{help:'なだめる',give:'手で楽に',tempted:'つられる'}[kind],text:tt,why:a.name+(a.noR18?'だけが媚薬で火照っていた（':'だけが発情していた（')+Math.round(a.m.heat)+' 対 '+Math.round(b.m.heat)+'）／'+b.name+'の'+(kind==='give'?'NP':kind==='tempted'?'揺らぎ':'冷静さ'),mag:18},b.name+'が'+a.name+'を'+{help:'なだめた',give:'手で楽にした',tempted:'つられかけた'}[kind]);
continue;
}
if(HK.lockOut(a,b)){urge-=0.45;if(urge>0.3&& !a.lockSaid){a.lockSaid=true;ST.sayB(S,{actors:[a,b],tag:'心に決めた人',text:ST.fmt(pk(LK.LOCKED||['{a}は{b}の肩を押し返した。「……ごめん。心に決めた人がいるから｜……すまない。心に決めた人がいる｜……ごめんなさい。心に決めた人がいるんです」']),{a:a.name,b:b.name}),why:a.name+'は恋愛の相手を決めている（'+b.name+'ではない）',mag:18});continue;}}
if(urge<0.36+rng()*0.3)continue;
if(clash){holdClash(a,b);continue;}
var lv=Math.min(pair.level+(intimate&&pair.level>=0&&rng()<0.5?2:1),LK.MAXLV||4);
if(!canHands(a)&& !canHands(b)&&lv>=2){
var nm=Pos?Pos.order(a,b,[a,b]):[a,b];
pair.nama=(pair.nama||0)+1;
if(pair.nama>2&&rng()<0.5)break;
var ed=a===nm[0]?topV(a,'edge'):V&&V.EDGE&&V.EDGE[a.persona];
ST.sayB(S,{actors:[a,b],tag:'生殺し',text:ST.fmt(pk(LK.NAMA),{a:nm[0].name,b:nm[1].name})+(ed&&lew!=='low'?a.name+'「'+pk(ed)+'」':''),why:'二人とも拘束されたまま発情（'+Math.round(a.m.heat)+'・'+Math.round(b.m.heat)+'）',mag:24},'二人は生殺し');
a.m.plea=clamp(a.m.plea+20,0,95);b.m.plea=clamp(b.m.plea+20,0,95);lewdNow=true;
break;
}
if(pair.sexIn&&lv===4){
var tq=pair.top,bq=pair.bot;
if((pair.rounds||0)>=2||lew==='low'){
if(pair.lingerAt!=null&&turn-pair.lingerAt<2||rng()<0.5)continue;
pair.lingerAt=turn;lewdNow=true;
ST.sayB(S,{actors:[tq,bq],tag:LK.CONT.tag.linger,text:ST.fmt(pk(contPool('linger',tq,bq)),{a:tq.name,b:bq.name}),why:'媚薬はまだ効いていたが、体の方が先に限界だった'},tq.name+'と'+bq.name+'は寄り添っていた');
break;
}
var wq=b.m.heat/100+({lover:0.5,fwb:0.45,almost:0.3}[rel]||0.1)-b.m.reason/160+(rng()-0.5)*0.3+(lhAny?0.3:0);
if(wq<0.4){a.m.reason=clamp(a.m.reason+6,0,100);continue;}
startConn(tq);lewdNow=true;pair.acts++;
ST.sayB(S,{actors:[tq,bq],tag:LK.CONT.tag.again,text:ST.fmt(pk(contPool('again',tq,bq)),{a:tq.name,b:bq.name}),why:'一度果てても、媚薬の熱は引かなかった（'+a.name+'の発情 '+Math.round(a.m.heat)+'）',mag:28,kind:'climax'},tq.name+'と'+bq.name+'：もう一度',true);
break;
}
if(lv<=pair.level&&pair.lastAct!=null&&turn-pair.lastAct<2&&rng()<0.7)continue;
var act=LK.ACT[LV[lv]];
a.cnt.make++;
var w=b.m.heat/100+({lover:0.5,fwb:0.45,almost:0.3,crush:crusher===b?0.45: -0.05,mutual:0.45,friend:0,tension: -0.3,ex:0.05,stranger: -0.1,master:servant===b?0.35:0.2}[rel]||0)+b.tr.np*0.15+b.tr.ac*0.1-b.tr.cp*0.25-b.m.reason/160+(plotter===b?0.8:0)+(fwbAll&&rel!=='fwb'?0.35:0)+(fcKind==='mutual'?0.2:0)+(crusher===b&&rel!=='crush'&&rel!=='mutual'?0.2:0)+(rng()-0.5)*0.3;
if(HK.lockOut(b,a))w-=0.5;
if(lhAny&&LHo.has(S,b,a))w+=0.25;
if(nt)w+=NT.accW(nt,a,b);
var resp=w>0.55?'accept':w>0.32?'passive':'refuse';
var aTop= !Pos||Pos.order(a,b,LV[lv]==='sex'?Pos.fbFor(a,b):[a,b])[0]===a;
var swap=R18&& !aTop&&((lv>=2&&(hardTop(b)||ff))||(lv===4&&(b.bound||fmPair(b,a)))||(hardTop(b)&&b.bound));
var ax=swap?b:a,bx=swap?a:b,axTop=swap||aTop;
var FFA=ff&&LK.FF_ACT&&LK.FF_ACT[LV[lv]];
var FMA= !FFA&&LV[lv]==='sex'&&axTop&&fmPair(ax,bx)&&LK.FM_ACT&&LK.FM_ACT.sex;
var actPool=FFA?(ax.bound?FFA.bound:FFA.t):FMA?(ax.bound?FMA.bound:FMA.t):LV[lv]==='sex'?(ax.bound?(axTop?act.boundTop:act.bound):(axTop?act.t:act.ride)):(ax.bound?act.bound:act.t);
var noriAct= !swap&& !FFA&&LV[lv]==='sex'&& !aTop&& !b.bound&&Pos&&Pos.nori(a)&&rng()<0.6&&(a.bound?act.noriBound:act.nori);
if(noriAct)actPool=noriAct;
var vA={a:ax.name,b:bx.name},vT={a:a.name,b:b.name};
var t=swap?ST.fmt(pk(LK.TEMPT),vT):ST.fmt(pk(actPool),vA);
var hateNow=hateP&& !swap&&aTop&&resp!=='accept'&&b.m.heat>=15;
if(hateNow)resp='passive';
if(resp==='refuse'){
b.cnt.refuse++;a.m.reason=clamp(a.m.reason+6,0,100);
var lateR=b.rxLv>=1&& !b.rxCool&&LK.REFUSE_LATE;
t+=ST.fmt(pk(hands(lateR?LK.REFUSE_LATE:LK.REFUSE,a,b)),{a:a.name,b:b.name})+(rng()<0.7?say2(b,lateR&&LK.REFUSE_SAY_LATE?LK.REFUSE_SAY_LATE:LK.REFUSE_SAY):'');
if(b.cnt.refuse>=2&&lv>=2)pair.refusedHard=true;
if(nt)t+=NT.refused(S,nt,a,b);
ST.sayB(S,{actors:[a,b],tag:'嗜めた',text:t,why:a.name+'が「'+actLabel(lv)+'」を仕掛けた（発情 '+Math.round(a.m.heat)+'）／'+b.name+(lateR?'は、そこから先だけ止めた（さっきは応じていた／理性 ':'は嗜めた（理性 ')+Math.round(b.m.reason)+'・CP）',mag:18},b.name+'が嗜めた',pair.acts===0);
continue;
}
b.cnt.accept++;pair.level=lv;pair.acts++;pair.lastAct=turn;lewdNow=true;
var rxNow=resp==='accept'?2:1,rx0=b.rxCool?0:b.rxLv||0,giveIn= !swap&&b.cnt.refuse>0&& !b.gaveIn&&LK.GIVEIN;
var rxText= !swap&&resp==='passive'&&rx0>=2?'accept':resp;
b.rxLv=Math.max(rx0,rxNow);b.rxCool=false;if(giveIn)b.gaveIn=true;
eroNow=resp==='accept';
if(swap)t+=ST.fmt(pk(LK.TAKE[b.bound?'bound':'free']),vT)+ST.fmt(pk(actPool),vA);
else if(hateNow)t+=HSX.react(S,a,b,lv);
else t+=(giveIn?ST.fmt(pk(hands(giveIn,a,b)),{a:a.name,b:b.name}):'')+ST.fmt(pk(hands((rxText==='accept'?LK.ACCEPT:LK.PASSIVE).filter(function(x){return(aTop&& !ff&& !fmPair(a,b))|| !/受け入れ/.test(x);}),a,b)),{a:a.name,b:b.name})+(resp==='accept'&&rng()<0.6?say2(b,LK.ACCEPT_SAY):'');
if(R18&&lew!=='low'&&LV[lv]==='kiss'&&HK.Moan&&HK.Moan.pick&& !bx.noR18&&rng()<0.6)t+=bx.name+'「'+HK.Moan.pick(S,bx,'k0',{})+'」';
var RF=LK.REL&&LK.REL.first[rel];
if(pair.acts===1&&RF&&rng()<0.75)t+=ST.fmt(pk(RF),{a:a.name,b:b.name,c:(crusher||a).name,o:(crusher||a).o.name,u:nt?nt.u.name:'',d:nt?nt.d.name:''});
var gain=[15,20,30,40,50][lv];
ax.m.plea+=gain*ax.sens*0.8;bx.m.plea+=gain*bx.sens;
a.m.heat=clamp(a.m.heat+4,0,100);b.m.heat=clamp(b.m.heat+8,0,100);
var tp=axTop?ax:bx;
if(lv===4){pair.sexIn=true;startConn(tp);t+=ST.fmt(pk(ff&&LK.FF_ACT?LK.FF_ACT.tease:fmPair(tp,tp.o)&&LK.FM_ACT?LK.FM_ACT.tease:LK.TEASE),{a:tp.name,b:tp.o.name});}
if(lv>=3&&fcKind&&LK.FC&& !pair.fcShown){pair.fcShown=true;t+=ST.fmt(pk(LK.FC.inside[fcKind]),{c:crusher.name,o:crusher.o.name});}
if(lew==='low'&&lv>=3)t=ST.fmt(pk(actPool),vA).replace(/。.*$/,'。')+pk(LK.FADE||['――その先は、ロッカーの扉の隙間からも見えなかった。']);
else if(eroOn&&eroNow&&lv>=3&&LK.ERO_ACT&&LK.ERO_ACT[lv]){
var eg=lv===3?ax:tp,er=lv===3?bx:tp.o;
var eroL=ff&&LK.ERO_ACT_FF&&LK.ERO_ACT_FF[lv]?LK.ERO_ACT_FF[lv]:lv===4&&fmPair(eg,er)&&LK.ERO_ACT_FM?LK.ERO_ACT_FM[4]:lv===3&& !ff&&Pos&& !Pos.isF(er)&&LK.ERO_ACT_MB?LK.ERO_ACT_MB[3]:LK.ERO_ACT[lv];
t+=HK.ThickEro.fill(S,pk(eroL),eg,er).replace(/\{a\}/g,eg.name).replace(/\{b\}/g,er.name);
}
if(nt&&NT.r18Act&&R18&&lew!=='low'&&lv===4&& !nt.r18In){nt.r18In=true;t+=NT.r18Act(S,nt,tp,tp.o,{moan:moan});}
var nightL='';
if(R18&&lew!=='low'&&LK.nightLine&&lv>=1&&(lv===4? !pair.nightDeep: !pair.nightEarly)){
var nT=lv===4?tp:ax,nB=lv===4?tp.o:bx;
var nR=LK.nightLine(S,nT,nB,lv===4?'deep':'early',{mode:ff?'ff':fmPair(nT,nB)?'fm':'mf'});
if(nR&&nR.text){t+=nR.text;nightL=nR.label;if(lv===4)pair.nightDeep=true;else pair.nightEarly=true;}
}
if(R18&&lew!=='low'&&LK.nightLight&&(lv===1||lv===2)&&pair.nightEarly&& !nightL&& !hateNow&&rng()<0.5){
var nLt=LK.nightLight(S,ax,bx,{});
if(nLt&&nLt.text){t+=nLt.text;nightL=nLt.label;}
}
if(lv===4){ax.m.plea=Math.min(ax.m.plea,55);bx.m.plea=Math.min(bx.m.plea,60);}
if(bx.m.plea>=100){if(hardTop(bx))bx.m.plea=95;else t=climax(bx,t,!axTop);}
var topC=tp.cnt.climax;
if(ax.m.plea>=100)t=climax(ax,t,axTop);
if(pair.conn&&tp.cnt.climax>topC)pair.done=true;
var G=gimmicks[gi];
if(G&&G.lewd&&lv>=1){prog=100;t+=ST.fmt(pk(lv>=2&&LK.KISS_MID?LK.KISS_MID:G.ok),{a:a.name,b:b.name});}
eroNow=false;
var o2=ST.sayB(S,{actors:[a,b],tag:actLabel(lv),text:t,why:a.name+'が「'+actLabel(lv)+'」を仕掛けた（発情 '+Math.round(a.m.heat)+'）／'+b.name+'は'+(swap?'誘いに乗って、自分から動いた（'+(hardTop(b)?'攻め':'動く側')+'）':resp==='accept'?'乗った':hateNow?'口では嫌がったが、拒みきらなかった':'流された')+'（関係：'+RL[rel]+'・'+b.name+'の発情 '+Math.round(b.m.heat)+'）'+(nightL?'／夜の性格：'+nightL:''),mag:18+lv*5,kind:'climax'},a.name+'→'+b.name+'：'+actLabel(lv),lv>=3||pair.acts===1);
if(o2&&pair.acts===1)ST.key(S,o2,'最初に手を出したのは'+a.name);
if(o2&&lv===4&& !pair.keySex){pair.keySex=true;ST.key(S,o2,ff?'ロッカーの中で肌を重ねた':'ロッカーの中で繋がった');}
break;
}
var G2=gimmicks[gi];
if(G2&&prog<100){
var workers=P.filter(function(p){return p!==plotter&&p.m.reason>10&& !(G2.bind?false:p.bound);});
if(plotter&&(plotter.sabotage||0)<2&& !pair.conn&&rng()<0.4){
ST.sayB(S,{actors:[plotter],tag:'細工',text:ST.fmt(pk(LK.PLOT.hide[G2.id]||LK.PLOT.hide.code),{a:plotter.name,b:plotter.o.name}),why:plotter.name+'は脱出したくない',mag:16},plotter.name+'は仕掛けを妨害した');
prog=Math.max(0,prog-15);plotter.sabotage=(plotter.sabotage||0)+1;
}
if(pair.conn&& !G2.lewd){}
else if(workers.length&& !G2.lewd){
var free=G2.bind&&bind==='one'?workers.filter(function(p){return!p.bound;}):[];
var GT=free.length&&LK.CUFF1?LK.CUFF1:G2;
if(free.length)workers=free;
var wk=workers.slice().sort(function(x,y){return(y.stats.dex*G2.dex+y.tr.a*5*G2.brain)-(x.stats.dex*G2.dex+x.tr.a*5*G2.brain);})[0];
var pw=10+(wk.stats.dex||3)*6*G2.dex+wk.tr.a*30*G2.brain+rng()*28+workers.length*6-G2.diff*0.25-env.diff*0.2-(lewdNow?14:0)-wk.m.heat*0.12;
prog=clamp(prog+Math.max(4,pw),0,100);
var ok=prog>=100;
ST.sayB(S,{actors:[wk],tag:G2.name,text:ST.fmt(pk(soft(GT.try,wk)),{a:wk.name,b:wk.o.name})+ST.fmt(pk(soft(ok?GT.ok:GT.ng,wk)),{a:wk.name,b:wk.o.name}),why:'進み具合 '+Math.round(prog)+'％（'+wk.name+'の器用さ '+wk.stats.dex+(G2.brain>0.5?'・A':'')+(lewdNow?'・いちゃついていて集中できない':'')+'）',mag:ok?22:10},wk.name+'：'+G2.name+' '+Math.round(prog)+'％',ok);
if(ok)wk.cnt.solve++;
}else if(G2.lewd&&rng()<0.05+(A.m.heat+B.m.heat)/450+({lover:0.3,fwb:0.25,almost:0.2,tension: -0.15}[rel]||0)){
prog=100;
ST.sayB(S,{actors:[A,B],tag:G2.name,text:ST.fmt(pk(pair.conn||pair.level>=2?LK.KISS_MID:LK.KISS_DUTY&&(r18No||(HK.Pos&&HK.Pos.genderOK&& !HK.Pos.genderOK(A,B)))?LK.KISS_DUTY:LK.KISS_OK),v0),why:'脱出のためにキスをした（'+(r18No?r18No.name+'はR18に参加しないので、事務的に。火照り ':'発情 ')+Math.round(A.m.heat)+'・'+Math.round(B.m.heat)+'）',mag:24},'',true);
}else if(G2.lewd&& !pair.conn&&rng()<0.3){
ST.sayB(S,{actors:[A,B],tag:G2.name,text:ST.fmt(pk(G2.try),v0)+ST.fmt(pk(G2.ng),v0),why:'キスしないと開かない'},'キスの扉は開かないまま');
}
}
if(prog>=100){
if(G2&&G2.bind){P.forEach(function(p){p.bound=false;});}
gi++;prog=0;
if(gi>=gimmicks.length){escaped=true;escTurn=turn;how='solve';}
}
if(!escaped&&turn>=2&&rng()<0.005+((A.stats.luck||3)+(B.stats.luck||3))*0.0035){
escaped=true;escTurn=turn;how='luck';
ST.sayB(S,{actors:[A,B],tag:'幸運',text:pk(LK.OUTSIDE),why:'二人の運（'+A.stats.luck+'・'+B.stats.luck+'）'},'',true);
}
P.forEach(function(p){p.m.esc=Math.round((gi+prog/100)/gimmicks.length*100);p.m.plea=clamp(p.m.plea,0,100);});
ST.flushShort(S,'ほかに：');
if(S.log.length===logAt)ST.say(S,{kind:'phase',actors:[A.i,B.i],text:ST.fmt(pk(LK.QUIET),rng()<0.5?v0:{a:B.name,b:A.name})});
ST.snap(S,keys);
}
if(!escaped){how='timeout';escTurn=env.turns;}
ST.step(S,how==='timeout'?'時間切れ':'脱出');
ST.budget(S,6);
var both=A.m.heat>=60&&B.m.heat>=60;
var plotOk=plotter&& !pair.plotMad&&(pair.sexIn||(plotter.o.m.heat>=50&&plotter.o.cnt.refuse<=1));
var bed=(both&&A.m.heat+B.m.heat>=140&&(A.cnt.accept+B.cnt.accept>=1||(A.m.heat>=85&&B.m.heat>=85))&& !pair.refusedHard&&rng()<0.85)||(plotter&&plotOk&&rng()<0.8);
if(bed&& !plotter&&Math.max(A.m.reason,B.m.reason)>18&&(A.tr.cp+B.tr.cp)/2+rng()*0.6>0.75&& !(lhAny&&rng()<0.6))bed=false;
if(!bed&&R18&&lhAny&&pair.sexIn&& !clash&& !pair.refusedHard&&LHo.sexOk(S,A,B)&&rng()<0.5)bed=true;
if(servant&&servant.cnt.hold>=2&& !servant.broke&&master.m.heat<70)bed=false;
var endure=bed&&clash;
if(endure)bed=false;
var outcome,bedLabels=[];
if(bed){
outcome='bed';
var x=plotter||(A.cnt.make>=B.cnt.make?A:B),y=x.o;
if(HK.Pos&&HK.Pos.order(x,y,[x,y])[0]!==x){y=x;x=x.o;}
var vv={a:x.name,b:y.name};
var tone=nt?NT.tone(nt,rng):rel==='tension'||rel==='ex'?'rough':rel==='lover'||rel==='almost'||rel==='crush'||rel==='mutual'?'sweet':rng()<0.5?'rough':'sweet';
eroNow=eroOn&& !plotter;
bedLabels=LK.bed(S,{short: !!(lcf&&LX.short(env,rng)),ero:eroNow,A:A,B:B,x:x,y:y,rel:rel,tone:tone,how:how,plotter:plotter,servant:svW?null:servant,master:svW?null:master,nt:nt,lew:lew,dose:env.dose,pair:pair,moan:function(p,top){return moan(p,top,true);},REL_LABEL:RL,ff:ff});
A.cnt.climax+=2+rng.int(3);B.cnt.climax+=2+rng.int(3);
}else if(endure){
outcome='endure';
var ke=A.m.reason>=B.m.reason?A:B,tye=clashType(ke);
ST.key(S,ST.say(S,{actors:[A,B],tag:'耐え抜いた',text:(how==='timeout'?LK.BED.timeout[0].replace(/そこには、大きなベッドが置かれていた。$/,''):'')+ST.fmt(pk(LK.CLASH.bed[tye]),{a:ke.name,b:ke.o.name}),why:(r18No?'二人とも媚薬で火照っていた（':'二人とも発情していた（')+Math.round(A.m.heat)+'・'+Math.round(B.m.heat)+'）が、'+(tieNL?nlWhy+'の二人なので':sexP?'体の関係にならない二人（'+sexWhy+'）なので':'受け攻めの向きが合わない二人なので')+'、ベッドには行かなかった（'+ke.name+'の理性 '+Math.round(ke.m.reason)+'）',mag:30}),'結末');
}else{
outcome=how==='timeout'?'rescue':plotter&& !plotOk?'plotfail':pair.refusedHard&&pair.acts>=1&& !pair.sexIn?'angry':pair.acts>=1?'awkward':(A.cnt.make+B.cnt.make)>0||(clash&&A.cnt.hold+B.cnt.hold>0)?'near':'clean';
var who0=outcome==='angry'?(A.cnt.refuse>=B.cnt.refuse?B:A):outcome==='plotfail'?plotter:outcome==='near'?(A.cnt.make+A.cnt.hold>=B.cnt.make+B.cnt.hold?A:B):pair.sexIn&&pair.top?pair.top:A;
var AF=LK.AFTER,ak=pair.sexIn&&outcome==='awkward'&&AF.awkwardSex?'awkwardSex':pair.sexIn&&outcome==='rescue'&&AF.rescueSex?'rescueSex':outcome;
var aft=AF[ak].filter(function(l){return(A.cnt.refuse+B.cnt.refuse>0|| !/嗜め/.test(l))&&(ak!=='rescueSex'||(ff? !/繋が/.test(l): !/脚を絡め合った/.test(l))&&(pair.conn|| !/まだ(繋が|脚を絡め)/.test(l)));});
var tA=ST.fmt(pk(aft.length?aft:AF[outcome]),{a:who0.name,b:who0.o.name});
var RA=LK.REL&&LK.REL.after[rel];
if(RA&&pair.acts>=1&&outcome!=='angry'&&outcome!=='plotfail'&&rng()<0.7)tA+=ST.fmt(pk(RA),{a:who0.name,b:who0.o.name,c:(crusher||A).name,o:(crusher||A).o.name,u:nt?nt.u.name:'',d:nt?nt.d.name:''});
if(nt)tA+=NT.afterNote(S,nt,outcome,plotter);
if(plotter&&plotOk&&pair.acts>=1)tA+=ST.fmt(pk(AF.plotwin.filter(function(l){return!/ベッド|眠|寝顔/.test(l);})),{a:plotter.name,b:plotter.o.name});
ST.key(S,ST.say(S,{actors:[A,B],tag:{clean:'無事に脱出',near:'踏みとどまった',awkward:'気まずい脱出',angry:'怒りの脱出',plotfail:'計画失敗',rescue:'時間切れ'}[outcome],text:tA,why:'手を出した回数 '+pair.acts+'・嗜めた回数 '+(A.cnt.refuse+B.cnt.refuse)+'・発情 '+Math.round(A.m.heat)+'／'+Math.round(B.m.heat),mag:30}),'結末');
}
P.forEach(function(p){
var f;
if(plotter===p)f=outcome==='bed'?'相手をモノにした':pair.sexIn&&outcome!=='plotfail'?'ロッカーの中で相手をモノにした':pair.acts>=1&&outcome!=='plotfail'?'少しだけ思いを遂げた':'計画が空回りした';
else if(svW&&servant===p)f=NT.fate(nt,p);
else if(servant===p)f=p.broke?'主に手を出してしまった':p.ordered?'主の許しで身を委ねた':p.cnt.hold?'主に手を出さず耐えきった':'主に身を委ねた';
else if(clash&&(p.cnt.hold||outcome==='endure'))f='触れずに耐え抜いた';
else if(p.cnt.make>=2&&p.cnt.make===p.o.cnt.make&&p.o!==plotter&&p.o!==servant)f='一緒に堕ちた';
else if(p.cnt.make>=2&&p.cnt.make>p.o.cnt.make)f='先に堕ちた';
else if(p.cnt.refuse>=2&&outcome!=='bed'&& !p.cnt.accept)f='最後まで嗜めた';
else if(p.cnt.refuse>=1&&p.cnt.accept>=1)f='嗜めきれずに流された';
else if(p.cnt.accept>=1)f='流された';
else f=p.m.reason>30?'理性を保ちきった':'ぎりぎりで踏みとどまった';
p.fate=f+(outcome==='bed'?'・ベッドで激しく':'');
p.notes.push('発情 '+Math.round(p.m.heat)+'・理性 '+Math.round(p.m.reason)+'・'+W_CL+' '+p.cnt.climax+'回');
p.notes.push('仕掛けた '+p.cnt.make+'回・応じた '+p.cnt.accept+'回・嗜めた '+p.cnt.refuse+'回'+(p.cnt.hold?'・耐えた '+p.cnt.hold+'回':'')+(p.cnt.solve?'・仕掛けを解いた '+p.cnt.solve+'回':''));
});
var mins=(escTurn+1)*5;
var title={bed:(how==='timeout'?'時間切れで扉が開いたが、':mins+'分で脱出したが、')+'二人は部屋を出ずにベッドへ直行した。',clean:mins+'分で無事に脱出。何も起きなかった。',near:mins+'分で脱出。危ない瞬間はあったが、二人は踏みとどまった。',awkward:mins+'分で脱出。'+(pair.sexIn?'ロッカーの中で'+(ff?'肌を重ねた':'一線を越えた')+'ことは、ガスのせいにした。':'ロッカーの中のことは、ガスのせいにした。'),angry:mins+'分で脱出。'+(A.cnt.refuse>=B.cnt.refuse?A.name:B.name)+'の怒りは収まらなかった。',plotfail:mins+'分で脱出。'+(plotter?plotter.name:'')+'の計画は空回りした。',rescue:'制限時間内に脱出できず、扉は時間切れで開いた。'+(pair.conn?'そのとき二人は、まだ'+(ff?'肌を重ねたままだった。':'繋がったままだった。'):pair.sexIn?'ロッカーの中で何があったかは、二人だけが知っている。':''),endure:(how==='timeout'?'時間切れで扉が開いた。':mins+'分で脱出。')+'目の前のベッドには目もくれず、二人は媚薬が抜けるまで耐え抜いた。'}[outcome];
var lines=P.map(function(p){return p.name+'：'+p.fate;});
lines.push('仕掛け：'+gimmicks.map(function(g,i){return g.name+(i<gi?'（解除）':'');}).join('→')+(how==='luck'?'（外から開いた）':''));
if(pair.level>=0)lines.push('ロッカーの中でいちばん進んだのは「'+actLabel(pair.level)+'」');
if(bedLabels.length)lines.push('ベッドでは：'+bedLabels.join('→'));
if(fcKind&&LK.FC)lines.push(ST.fmt(pk(LK.FC.end[fcKind]),{c:crusher.name,o:crusher.o.name}));
if(nt){var ntL=NT.endLine(S,nt);if(ntL)lines.push(ntL);}
if(lhAny&&pair.acts>=1&&pair.level>=1)lines.push((LHo.mutual(S,A,B)?A.name+'と'+B.name+'：腐れ縁（愛憎）。口では嫌い合いながら、結局また触れ合ってしまう':(LHo.has(S,A,B)?A:B).name+'→'+(LHo.has(S,A,B)?B:A).name+'：腐れ縁（愛憎）。口では嫌いながら、構わずにいられない'));
var heldNo=loveNo&&(A.cnt.hold+B.cnt.hold>0||outcome==='endure')&&outcome!=='angry'&&outcome!=='plotfail';
if(rel==='mutual'&&LK.MUT)lines.push(ST.fmt(pk(LK.MUT.end[outcome==='bed'||heldNo||(pair.acts>=1&&outcome!=='angry'&&outcome!=='plotfail')?'told':'miss']),v0));
var RP=heldNo&&rel!=='mutual'&&LK.REL&&LK.REL.pure&&LK.REL.pure[rel];
if(RP&&rng()<0.6)lines.push(ST.fmt(pk(RP),{a:A.name,b:B.name,c:(crusher||A).name,o:(crusher||A).o.name,u:master?master.name:A.name,d:servant?servant.name:B.name}));
var rows=P.map(function(p){return{i:p.i,rank:'',cells:[Math.round(p.m.heat)+'',Math.round(p.m.reason)+'',String(p.cnt.make),String(p.cnt.refuse),String(p.cnt.climax),String(p.cnt.solve),p.fate]};});
return ST.result(S,input,{
ending:{title:title,kind:outcome==='clean'?'ok':'over',lines:lines},
estats:[['脱出まで',how==='timeout'?'時間切れ':mins+'分'],['関係',RL[rel]],['受け入れた',pair.acts+'回'],[W_CL,(A.cnt.climax+B.cnt.climax)+'回']],
table:{title:'二人の状態',hint:'発情が高く理性が低いほど手を出しやすい。乗るか嗜めるかは関係と性格しだい。',cols:['発情','理性','仕掛けた','嗜めた',W_CL,'解いた','結末'],rows:rows},
meters:[{label:'発情',color:'--love'},{label:'理性',color:'--accent'},{label:'快感',color:'--pine',dash:true},{label:'脱出',color:'--partner',dash:true}],
meta:RL[rel]+'・拘束'+{both:'あり',one:'片方',none:'なし'}[bind]+'・媚薬'+env.dose,
summary:'媚薬ロッカー：'+title
});
}
})();
});
;
/* ==== js/solo-massage-data.js ==== */
HK.Load.def(270,'js/solo-massage-data.js',function(){
(function(){
'use strict';
var HK=window.HK;
function L(s){return s.split('|');}
var M=HK.MassageMore={};
M.REACT={
proud:[
L('{a}は腕を組むように枕を抱え、「もっと強くていい」と言い放った。|{a}は「下手だったら金は払わないからな」と釘を刺した。|{a}はほぐれていく肩に、不本意そうに鼻を鳴らした。'),
L('{a}は眉間に皺を寄せた。「……おい、今のは何だ」|{a}は施術台の縁を掴んで、跳ねそうになる腰を押さえつけた。|{a}は「くすぐったいだけだ」と、誰も訊いていないのに言った。|{a}の舌打ちに、かすかに甘い息が混じった。'),
L('{a}は歯を食いしばった。「……っ、ふざけた店だ」それでも、起き上がらなかった。|{a}は罵ろうとして口を開き、出てきた声に自分で驚いた。|{a}は枕を拳で殴った。殴った手が、震えていた。|{a}「……覚えてろよ」――誰に言ったのか、{a}自身にも分からなかった。')
],
stern:[
L('{a}は背筋を伸ばしたまま、礼儀正しく「お願いします」と頭を下げた。|{a}は施術の手順を、黙って頭の中で確認していた。|{a}は肩の力を抜くよう言われて、抜き方が分からず困った。'),
L('{a}は深く息を吸い、乱れかけた呼吸を整え直した。|{a}は「……そこは、施術範囲ですか」と小さく確認した。|{a}は拳を握って、反応を表に出すまいとした。|{a}の耳だけが、少しずつ赤くなっていった。'),
L('{a}は唇を固く結んだ。声を出さないことだけが、最後の規律だった。|{a}は「……っ、失礼」と、漏れた声を咳払いでごまかした。|{a}は目を閉じて、規律の言葉を心の中で繰り返した。三度目で、続きを忘れた。|{a}の握りしめた拳が、ゆっくりとほどけていった。')
],
tsun:[
L('{a}は「べ、別に疲れてないけど、せっかくだから」と言い訳しながら横になった。|{a}は「痛くしたら怒るから」と念を押した。|{a}は気持ちよさそうな顔を、慌てて枕に押しつけて隠した。'),
L('{a}は「い、今のはくすぐったかっただけ！」と誰にともなく言った。|{a}は足の指をきゅっと丸めた。「……何でもないってば」|{a}は「ちょっと、変なとこ触ってない？」と言いかけて、言えなかった。|{a}は真っ赤な顔で、施術台の穴に顔を埋めた。'),
L('{a}「ば、ばか、そこはっ……」――続きは声にならなかった。|{a}は「気持ちよくなんかない」と三回言った。三回とも、声が裏返った。|{a}はタオルの端を噛んで、涙目で耐えた。|{a}は「……もう、好きにすれば」と小さく言って、顔を背けた。')
],
gentle:[
L('{a}は「よろしくお願いしますね」とにっこり笑って、ふわりと力を抜いた。|{a}は「あら、上手」と感心したように息をついた。|{a}は施術中、ずっと気持ちよさそうに目を細めていた。'),
L('{a}は「あらあら……ずいぶん、念入りなのね」と困ったように笑った。|{a}は頬に手を当てた。「最近のマッサージって、こういう感じなのかしら」|{a}は少しだけ身をよじって、「くすぐったいわ」と微笑んだ。|{a}の穏やかな呼吸が、ほんの少しだけ乱れた。'),
L('{a}「あ……もう、だめよ、そんな……」――言葉とは裏腹に、{a}は拒まなかった。|{a}は困った顔のまま、そっと目を閉じた。「……仕方のない人ね」|{a}は乱れた呼吸のまま、「お手柔らかに、ね」と囁いた。|{a}の微笑みが、少しずつ蕩けていった。')
],
devoted:[
L('{a}は「よろしくお願いします！」と勢いよく頭を下げて、施術台に頭をぶつけた。|{a}は「あの、汗くさかったらごめんなさい」と先に謝った。|{a}は施術者の手が疲れないか、ずっと気にしていた。'),
L('{a}は「だ、大丈夫です、ちょっとびっくりしただけで」と言った。|{a}は声を出したら失礼だと思って、両手で口を押さえた。|{a}は「わたしの体、変じゃないですか……？」と小さく訊いた。|{a}は唇を噛んで、震えをこらえた。'),
L('{a}は「ご、ごめんなさい、声、出ちゃって」と泣きそうな声で謝った。|{a}は我慢しようとして、我慢の仕方を忘れた。|{a}は「せっかくやってもらってるのに」と、拒めない理由を自分で増やしていった。|{a}はぎゅっと目をつぶって、「ちゃんと、受けます」と言った。')
],
cool:[
L('{a}は施術の圧と部位を、黙って記憶していた。|{a}は「肩甲挙筋ですね」と、凝っている筋肉の名前を言い当てた。|{a}は時計の秒針の音を数えながら、静かに目を閉じていた。'),
L('{a}は「……その部位にリンパ節はありません」と冷静に指摘した。声だけが、少し上ずっていた。|{a}は自分の心拍が上がっていることに気づき、原因を考えた。考えたくなかった。|{a}は無表情を保ったまま、足の指だけが反り返った。|{a}は「興味深い手技ですね」と言った。皮肉のつもりだった。'),
L('{a}は分析しようとして、分析の言葉が出てこなかった。|{a}「……想定外、です」それだけ言うのが精一杯だった。|{a}の冷静な顔の下で、呼吸だけが勝手に速くなっていった。|{a}は天井の染みを数えて正気を保とうとした。七つ目で分からなくなった。')
],
free:[
L('{a}は「うわー、きもちいー」と遠慮なく声を出した。|{a}は「先生、上手だね」と施術者を褒めちぎった。|{a}は施術台の上で、半分寝ながら鼻歌を歌っていた。'),
L('{a}は「ちょ、そこくすぐったい！あははっ」と足をばたつかせた。|{a}は「今のなんかやばくない？」と笑った。笑い声が、途中で甘く溶けた。|{a}は「えー、そこまでやるの？」と言いながら、少しわくわくしていた。|{a}は正直に「今の、気持ちよかった」と言った。'),
L('{a}「やば、やばいって、これ……っ」――笑う余裕は、もうなかった。|{a}は「もう、どうにでもなれ」と大の字になった。|{a}は施術台の端を掴んで、遠慮のない声を上げた。|{a}「ねえ、これ、ほんとにマッサージ？……まあ、いっか」')
],
shy:[
L('{a}は紙パンツ一枚になるのに、更衣室で五分かかった。|{a}は施術者と目が合うたびに、慌てて目を逸らした。|{a}は「よ、よろしく、お願いします……」と消え入りそうな声で言った。'),
L('{a}はタオルの下で、そっと太腿を閉じた。|{a}は「ひゃっ」と声を上げてしまい、耳まで真っ赤になった。|{a}は恥ずかしくて、施術台の穴から床ばかり見ていた。|{a}は「す、すみません、くすぐったくて……」と謝った。'),
L('{a}は顔を両手で覆った。指の隙間から、熱い息が漏れた。|{a}は「み、見ないでください……」と、見えるはずもない施術者に頼んだ。|{a}は小さく震えながら、言われるままに力を抜いた。|{a}は恥ずかしさで泣きそうになりながら、それでも「やめて」とは言えなかった。')
]
};
M.REACT.polite=[
L('{a}は「本日はよろしくお願いいたします」と丁寧に頭を下げてから、横になった。|{a}は「とてもお上手ですね」と、施術者を丁寧に褒めた。|{a}は「お手数をおかけします」と、何度も礼を言った。'),
L('{a}は「あの……失礼ですが、そちらも施術の範囲でしょうか」と、控えめに尋ねた。|{a}は「く、くすぐったいです」と言って、慌てて口元を押さえた。|{a}は丁寧な言葉を探しているうちに、息が乱れた。|{a}は「お、お気遣いなく」と言った。何に対してなのか、自分でも分からなかった。'),
L('{a}「そ、そこは……いけません、そんな……」――丁寧な言葉遣いだけは、最後まで崩れなかった。|{a}は「申し訳ありません、声が……」と謝りながら、また声を上げた。|{a}は「どうか、お手柔らかに……」と、震える声でお願いした。|{a}は「……お、お続けください」と言ってしまって、真っ赤になった。')
];
M.SHIFT={
proud:[
L('{a}の不機嫌な声に、本人の知らない震えが混じり始めた。|{a}はまだ睨むつもりでいた。けれど、睨むはずの目がもう潤んでいた。'),
L('{a}の悪態が、いつの間にか途切れがちになっていた。代わりに漏れるのは、熱い息ばかりだった。|{a}は「やめろ」と言うのを、いつからかやめていた。'),
L('{a}はもう、命令口調で「もっと」と言うことしか考えていなかった。|{a}の強がりは、とうとう一言も出てこなくなった。')
],
stern:[
L('{a}の整えていた呼吸が、ひとつ、またひとつと数を外れ始めた。|{a}の規律正しい沈黙に、小さなほころびができた。'),
L('{a}の握りしめていた拳が、いつの間にかシーツの上でほどけていた。|{a}は規律の言葉を思い出そうとして、もう思い出そうともしなくなった。'),
L('{a}は、自分が何を守ろうとしていたのか、もう思い出せなかった。|{a}の背筋はもう伸びていなかった。施術台に預けた体は、{m}の手の形に柔らかくなっていた。')
],
tsun:[
L('{a}の「くすぐったいだけ」の声が、だんだん言い訳らしく聞こえなくなってきた。|{a}は否定の言葉を探しながら、それを口にするのが少しずつ遅れるようになった。'),
L('{a}の「違う」は、もう語尾が甘く溶けていた。|{a}は否定するのをやめて、真っ赤な顔をタオルに埋めたまま、されるに任せていた。'),
L('{a}はとうとう、「……もっと」と自分から言ってしまった。言い直しは、しなかった。|{a}の意地は、すっかりほどけていた。残っているのは、正直な体だけだった。')
],
gentle:[
L('{a}の穏やかな微笑みが、ほんの少しだけ形を崩した。|{a}の「あらあら」に、困った色より熱っぽい色が混じり始めた。'),
L('{a}の微笑みは、もう困ったものではなく、とろんとしたものに変わっていた。|{a}は困ったふりをするのも、いつからかやめていた。'),
L('{a}は、{m}の手を自分から受け入れるように、そっと体を開いた。|{a}の柔らかな声は、もうすっかり甘い声だけになっていた。')
],
devoted:[
L('{a}の「ごめんなさい」に、謝っている以外の響きが混じり始めた。|{a}はこらえようとして、こらえ方が少しずつ分からなくなってきた。'),
L('{a}はもう、声を出したことを謝らなくなっていた。|{a}の震えは、怖さのせいではなくなっていた。'),
L('{a}は「ちゃんと、受けます」と言った。今度は、自分から望んでいる声だった。|{a}は{m}の手に、体ごとすがりつくように身を預けた。')
],
cool:[
L('{a}の冷静な声の端に、本人にも説明のつかない上ずりが出始めた。|{a}の分析は、少しずつ文になりきらないまま途切れるようになった。'),
L('{a}は分析するのを、いつの間にかやめていた。考えるより先に、体が答えていた。|{a}の無表情が、とうとう保てなくなった。'),
L('{a}は、理屈で説明できないものに抗う理由を、もう探さなかった。|{a}の目から、観察者の光が消えた。そこにあるのは、ただ溺れていく人の目だった。')
],
free:[
L('{a}の笑い声に、ときどき笑いではない息が混じるようになった。|{a}の軽口が、ひとつ、またひとつと途中で途切れ始めた。'),
L('{a}はもう、笑ってごまかすのをやめていた。|{a}の「やばい」は、冗談の声ではなくなっていた。'),
L('{a}は「もう、どうにでもして」と言って、本当に全部を投げ出した。|{a}は遠慮のない声で、もっと、と何度もねだった。')
],
shy:[
L('{a}の小さな声が、恥ずかしさとは別の理由で震え始めた。|{a}は太腿を閉じようとして、その力が少しずつ続かなくなってきた。'),
L('{a}は顔を覆ったまま、もう体を隠そうとはしなくなっていた。|{a}の「やめて」は、とうとう一度も出てこなかった。'),
L('{a}は恥ずかしさで泣きそうなまま、自分から{m}の手に体を寄せた。|{a}は消え入りそうな声で、それでもはっきりと「……もっと」と言った。')
],
polite:[
L('{a}の丁寧な言葉の合間に、言葉にならない息が挟まるようになった。|{a}は礼を言おうとして、その礼が少しずつ遅れるようになった。'),
L('{a}の敬語は崩れなかった。ただ、その敬語で口にするのが、拒む言葉ではなくなっていた。|{a}は「お手柔らかに」と言うのを、いつからかやめていた。'),
L('{a}は「……どうか、最後まで」と、丁寧に、はっきりとお願いした。|{a}は乱れた息のまま、{m}の手をそっと自分の体へ導いた。')
]
};
M.STAFF_TALK={
gentle:[
L('{m}「お痛みがあったら、遠慮なくおっしゃってくださいね」|{m}「お仕事、大変なんでしょう。肩がそう言っています」|{m}「温度はいかがですか。少しオイルを温めますね」'),
L('{m}「少し際どいところを失礼しますね。すべて施術の一環ですので」|{m}「ご安心ください。皆さま、ここで一番ほぐれるんです」|{m}「呼吸を止めないで。そう、お上手です」'),
L('{m}「大丈夫。体が正直に反応しているだけです。恥ずかしいことではありませんよ」|{m}「ここからは、当店の秘伝の手技になります」|{m}「お声は出していただいて構いません。防音ですので」')
],
chara:[
L('{m}「お客さん、めっちゃ凝ってますね！デスクワーク？」|{m}「今日はいい天気っすね〜。あ、痛かったら言ってください！」|{m}「オイル、ちょっと冷たいっすよ。はい、いきまーす」'),
L('{m}「ここ、ぶっちゃけみんな好きなんすよね」|{m}「あれ、今ちょっと声出ました？かわいいっすね」|{m}「力抜いて抜いて〜。そうそう、上手っす」'),
L('{m}「ここまで来たら、最後までいっちゃいましょっか」|{m}「店長には内緒っすよ？サービスなんで」|{m}「うわ、すご。めっちゃ反応いいっすね、お客さん」')
],
silent:[
L('{m}は一言も喋らずに、黙々と肩を押した。|{m}は無言でうなずき、タオルの位置を直した。|{m}の大きな手が、迷いなく凝りを探り当てた。'),
L('{m}は無言のまま、手を少しずつ下へずらしていった。|{m}は{a}の反応を見ても、表情一つ変えなかった。|{m}は「…ん」とだけ言った。それが相槌なのかどうかも分からなかった。'),
L('{m}は何も言わない。言わないからこそ、{a}は何をされるのか分からなかった。|{m}が初めて口を開いた。「……力、抜け」|{m}は黙ったまま、{a}が一番声を上げる場所だけを正確に押し続けた。')
],
lady:[
L('{m}「はい、ゆっくり息を吐いて……そう、とても上手」|{m}「今日はたくさん頑張ったのね。ここで全部置いていって」|{m}は耳元で囁いた。「いい香りでしょう。ラベンダーなの」'),
L('{m}「大丈夫。わたしに全部任せて」|{m}「ふふ、ここ、弱いのね」|{m}「目を閉じて。何も考えなくていいのよ」'),
L('{m}「いい子ね。もっと力を抜いて」|{m}「我慢しなくていいの。声、聞かせて」|{m}「……可愛い。もう少しだけ、ね？」')
],
duo:[
L('{m}の片方が肩を、もう片方が脚を、同時に揉み始めた。|「お客様、四つの手で同時にほぐしますね」――二人の声がぴったり揃っていた。|二人のスタッフは目配せだけで、次に揉む場所を決めていた。'),
L('上半身と下半身を同時に責められて、{a}はどこに意識を向ければいいのか分からなくなった。|「こっちもいいですか」「どうぞ」――二人は{a}の頭越しに、まるで料理の相談のように話した。|片方の手が胸元へ、もう片方の手が内腿へ。{a}の逃げ場はどこにもなかった。'),
L('二人がかりで押さえられ、{a}はもう身をよじることもできなかった。|「交代しましょうか」「まだ大丈夫」――{a}の意見は、誰も訊かなかった。|四本の手が、{a}の弱いところを分担して責め続けた。')
]
};
M.ACT={
chat:{t:[
L('{a}は{m}と天気や仕事の話をした。思いのほか話が弾んだ。|{a}は{m}に、行きつけのラーメン屋の話をした。{m}は熱心に聞いてくれた。|{a}は{m}に、最近ハマっているドラマの話をした。{m}は相づちが上手だった。'),
L('{m}の質問が、少しずつ個人的になっていった。「恋人はいらっしゃるんですか」|{a}は話し続けることで、際どい手つきから気を逸らそうとした。話題が、途切れがちになった。|{a}は「この仕事、長いの？｜この仕事は長いのか｜この仕事、長いんですか」と訊いた。{m}の答えは、少しはぐらかすようだった。'),
L('{a}は何か話そうとして、話す内容をすっかり忘れていた。|「それで、さっきの話の続きは？」――{m}に訊かれても、{a}はもう答えられなかった。|{a}の相づちは、もう「うん」と「はい」だけになっていた。')
],fx:[{r:2},{s:6},{r: -4}]},
watch:{t:[
L('{a}は施術者の手順を薄目で観察していた。ここまでは教科書通りだった。|{a}は壁の資格証を読んだ。発行元の団体名に、聞き覚えがなかった。|{a}はオイルの瓶のラベルを横目で確かめた。成分表は、普通のアロマオイルだった。'),
L('{a}は施術台の横に、なぜか潤滑ゼリーのボトルが置いてあるのに気づいた。|{a}は施術時間の表示が「延長あり」になっていることに気づいた。|{a}は{m}の手が、施術の説明にない場所で止まる回数を数え始めた。'),
L('{a}は観察を続けようとした。けれど、目の焦点が合わなかった。|{a}は手順を記憶しようとして、自分の声で数を数え損ねた。|{a}は{m}の手の動きを追おうとして、追う前に目を閉じてしまった。')
],fx:[{s:8},{s:14},{r: -3}]},
endure:{t:[
L('{a}は声を出さないと決めて、ぐっと奥歯を噛んだ。|{a}は「何をされても声を出さない｜＝｜何をされても声を出しません」と心の中で三回唱えた。|{a}は呼吸の回数を数えて、気を紛らわせようとした。'),
L('{a}は声を殺すかわりに、施術台の脚を握りしめた。|{a}は我慢するほど、感覚が鋭くなっていくことに気づいた。|{a}は枕の端を噛んで、声を飲み込んだ。'),
L('{a}は我慢した。我慢した分だけ、体の奥に熱が溜まっていった。|{a}の噛みしめた唇から、とうとう細い声が漏れた。|{a}は我慢の限界が近いことを、自分でも分かっていた。')
],fx:[{r:3},{p:6},{p:12}]},
enjoy:{t:[
L('{a}は肩の力を抜き、気持ちよさに身を任せた。|{a}は「そこそこ、そこ｜そこだ、そこ｜そこです、そこ」と遠慮なくリクエストした。|{a}は「あー、そこ最高｜ああ、そこは最高だ｜あー、そこ最高です」と、とろけた声を出した。'),
L('{a}は際どいところに触れられても、「まあいいか｜＝｜まあ、いいでしょう」と力を抜いた。|{a}は自分から、少しだけ脚を開いた。|{a}は際どい手つきに、くすりと笑って身を任せた。'),
L('{a}は気持ちいいことを、隠そうともしなかった。|{a}は「もっと」と言った。言ってから、自分で少し笑った。|{a}は{m}の手に、自分から体を押しつけた。')
],fx:[{p:5},{p:9,c:3},{p:12,c:5}]},
relax:{t:[
L('{a}は温かい手の感触に、うとうとし始めた。|{a}は全部を任せて、深く息を吐いた。|{a}はアロマの香りに包まれて、ふっと肩の力を抜いた。'),
L('{a}は何かおかしいと思いかけたが、心地よさにまぶたが重くなった。|{a}は半分眠りながら、くすぐったさに小さく身じろいだ。|{a}はうとうとしながら、手の位置がおかしいことに気づかないふりをした。'),
L('{a}は夢うつつのまま、甘い声を漏らした。|{a}は眠っているのか起きているのか、自分でも分からなかった。|{a}の体は、眠りと快感のあいだをふわふわと漂っていた。')
],fx:[{r:1},{s: -5},{p:8}]}
};
M.SLEEP_IN=L('{a}は、いつの間にか眠ってしまった。|{a}のまぶたが落ちた。{m}の手の温かさだけが、遠くに残った。|{a}は温かいタオルに包まれて、すうっと眠りに落ちた。');
M.SLEEP_DUR=L('眠っている{a}の体に、{m}の手が触れ続けた。{a}は夢の中で、何度か甘い声を上げた。|{a}は夢を見ていた。誰かに抱きしめられて、とろけるような夢だった。|眠る{a}の呼吸が、少しずつ浅く、速くなっていった。');
M.SLEEP_WAKE={
proud:L('{a}は目を覚ました瞬間、自分の格好を見て絶句した。「……何を、した」'),
stern:L('{a}は目を覚まし、状況を三秒で把握して、静かに青ざめた。'),
tsun:L('{a}は飛び起きた。「ね、寝てた！？ねえ、寝てる間に何したの！？」'),
gentle:L('{a}はゆっくり目を開けた。「あら……わたし、眠っちゃってたのね。……あら？」'),
devoted:L('{a}は目を覚まして、慌てて謝った。「ご、ごめんなさい、寝ちゃって……え、あれ……？」'),
cool:L('{a}は目を覚まし、体の状態から、寝ている間に何が行われたかを逆算した。'),
free:L('{a}は目を覚まして伸びをした。「ふあ……あれ、なんか体すっごいスッキリしてる。……え、なんで？」'),
shy:L('{a}は目を覚まして、タオルがずれていることに気づき、声にならない悲鳴を上げた。')
};
M.INCIDENTS=[
{id:'phone',n:'電話',t:L('施術の途中で、{a}の携帯が鳴った。職場からだった。{m}は手を止めずに「どうぞ、出てください」と言った。'),r:{
proud:L('{a}は「後でかけ直す」とだけ言って切った。切る直前、語尾が跳ねた。'),stern:L('{a}は業務連絡を最後まで平静な声でこなした。電話を切ったあと、長い息を吐いた。'),
tsun:L('{a}「な、何でもない！ちょっとストレッチしてるだけ！」――相手に何も訊かれていないのに言った。'),gentle:L('{a}は「ええ、ええ……ん、っ、大丈夫よ」と答えた。電話の相手は少し心配そうだった。'),
devoted:L('{a}は電話の相手に「はい、はいっ」と返事をするたび、声が上ずった。'),cool:L('{a}は「今、手が離せないので」と事実だけを伝えて切った。嘘ではなかった。'),
free:L('{a}「あ、もしもし？今マッサージ中〜。……ん、っ、何でもない！あはは」'),shy:L('{a}は電話に出られず、震える指で着信を切った。あとで何て言い訳しよう、と泣きたくなった。'),polite:L('{a}は「はい、承知しました、のちほど……っ、折り返します」と、丁寧に電話を切った。')},fx:{r: -5,s:4}},
{id:'neighbor',n:'隣のブース',t:L('薄い仕切りの向こう、隣のブースから、押し殺した甘い声が聞こえてきた。|隣のブースから、施術台のきしむ音と、誰かの荒い息遣いが聞こえた。'),r:{
proud:L('{a}は「……どういう店だ、ここは」と低く唸った。'),stern:L('{a}は聞こえないふりをした。聞こえないふりをするには、集中が必要だった。'),
tsun:L('{a}は「と、隣の人、すごい声出してるね」と言って、自分の頬の熱さに気づいた。'),gentle:L('{a}は「あらあら、お隣さん、気持ちよさそうね」と微笑んだ。'),
devoted:L('{a}は「わ、わたしも、あんな声出ちゃうのかな……」と不安になった。'),cool:L('{a}は隣のブースの声から、この店の施術内容をおおよそ推測した。'),
free:L('{a}は「隣、盛り上がってるね〜」と言って、{m}と顔を見合わせて笑った。'),shy:L('{a}は耳まで真っ赤になって、タオルで顔を隠した。'),polite:L('{a}は「お隣の方、その……お元気そうですね」と、気まずそうに言った。')},fx:{s:10,c:3}},
{id:'aroma',n:'特製アロマ',when:function(env){return env.course!=='normal';},t:L('{m}「今日は特製のアロマをお試しください」――甘い香りのオイルが肌に垂らされた瞬間、触れられた場所がじんと熱を持った。|{m}は小瓶を取り出した。「血行促進のブレンドです」――塗られた場所が、じわじわと熱く、敏感になっていった。'),r:{
proud:L('{a}「……何を混ぜた」{m}は笑って答えなかった。'),stern:L('{a}は成分表示を求めたが、出てきたのは手書きのラベルだった。'),
tsun:L('{a}「な、なんか熱いんだけど！？変なの入ってない！？」'),gentle:L('{a}「あら、いい香り……でも、なんだか体が熱いわね」'),
devoted:L('{a}は「いい香りですね」と言った。言い終わる前に、肌がぞくりと粟立った。'),cool:L('{a}は香りの成分を推測しようとして、推測より先に体が反応した。'),
free:L('{a}「わ、これすごい！めっちゃぽかぽかする！」'),shy:L('{a}は肌の火照りに戸惑って、身を縮めた。'),polite:L('{a}は「あの、こちらは何が配合されているのでしょうか」と尋ねた。返事より先に、肌が熱くなった。')},fx:{sens:0.15,c:4}},
{id:'towel',n:'ホットアイマスク',t:L('{m}は{a}の目元に、温かいアイマスクを乗せた。「目の疲れも取りましょうね」――視界が消えて、手の感触だけが鮮明になった。'),r:{
proud:L('{a}は「外すぞ」と言いかけて、温かさに負けた。'),stern:L('{a}は見えなくなった分、触れられる場所に意識が集中してしまった。'),
tsun:L('{a}「べ、別に見えなくても平気だし」――次に触れられた瞬間、大きく跳ねた。'),gentle:L('{a}は「まあ、気持ちいい」と言って、ますます無防備になった。'),
devoted:L('{a}は見えない不安で、施術者の手を探してしまった。'),cool:L('{a}は視覚を奪われ、次にどこを触られるか予測できなくなった。'),
free:L('{a}「わ、真っ暗！どこ触られるかわかんないの、ドキドキするね」'),shy:L('{a}は見えないことで、かえって恥ずかしさが少しだけ和らいだ。'),polite:L('{a}は「お気遣いありがとうございます」と言った。見えなくなった分、触れられる感覚が鮮明になった。')},fx:{s: -12,p:8}},
{id:'trainee',n:'研修生',when:function(env){return env.staff!=='duo';},t:L('{m}「今日は研修生が見学に入りますが、よろしいですか」――返事をする前に、カーテンの向こうから若いスタッフが入ってきた。'),r:{
proud:L('{a}は「見世物じゃない」と吐き捨てた。研修生はメモを取る手を止めなかった。'),stern:L('{a}は「……教育のためなら」と承諾した。後悔は、十分後にやってきた。'),
tsun:L('{a}「べ、別にいいけど！じろじろ見ないでよね！」'),gentle:L('{a}は「どうぞどうぞ、しっかり覚えてね」と研修生に微笑んだ。'),
devoted:L('{a}は「研修のお役に立てるなら」と、断れなかった。'),cool:L('{a}は研修生が手順をメモしているのを見て、この手技が「マニュアル化」されていることを知った。'),
free:L('{a}「いいよいいよ〜。ギャラリーいたほうが燃えるし」'),shy:L('{a}は二人分の視線に、タオルの下で縮こまった。'),polite:L('{a}は「研修でしたら、どうぞ」と承諾してしまった。断り方が分からなかった。')},fx:{r: -6,c:4},also:'研修生が「次、私がやってもいいですか」と言い、{m}が頷いた。手が、もう一組増えた。'},
{id:'mirror',n:'鏡',t:L('仰向けになると、天井が鏡張りになっていることに気づいた。そこには、施術台の上の自分が全部映っていた。'),r:{
proud:L('{a}は鏡の中の自分を睨みつけた。睨む顔が、思っていたよりずっと蕩けていた。'),stern:L('{a}は目を閉じた。閉じても、さっき見た自分の顔が消えなかった。'),
tsun:L('{a}「な、何この天井！？聞いてない！」――目を逸らしても、鏡はどこにでもあった。'),gentle:L('{a}は鏡に映る自分を見て、「あら、こんな顔してたのね」と頬を染めた。'),
devoted:L('{a}は鏡に映る自分の姿が恥ずかしくて、両手で顔を覆った。'),cool:L('{a}は鏡に映る自分の反応を、他人のもののように観察してしまった。'),
free:L('{a}は鏡に向かって手を振った。それから、映っている自分の格好に気づいて吹き出した。'),shy:L('{a}は鏡を見た瞬間、全身が真っ赤になって固まった。'),polite:L('{a}は鏡の中の自分と目が合い、「し、失礼しました」と、なぜか自分に謝った。')},fx:{r: -5,c:5}},
{id:'react',n:'体の反応を指摘される',t:L('{m}「……あら。体のほうは、もう正直ですね」――{m}は{a}の体の変化を、わざわざ言葉にした。|{m}「ここ、こんなになってますよ。血行がよくなった証拠です」'),r:{
proud:L('{a}「黙ってやれ」――顔が、耳まで赤かった。'),stern:L('{a}は「生理現象です」と言い切った。言い切った声が、少し震えていた。'),
tsun:L('{a}「ち、ちが、これはっ……そういうのじゃないから！」'),gentle:L('{a}は「もう、恥ずかしいこと言わないで」と、困ったように笑った。'),
devoted:L('{a}は「ご、ごめんなさい、すみません……」と、なぜか謝った。'),cool:L('{a}は「血行とは無関係です」と冷静に返した。体のほうは、冷静ではなかった。'),
free:L('{a}「あはは、ばれた？だって気持ちいいんだもん」'),shy:L('{a}は恥ずかしさで、声も出せずに震えた。'),polite:L('{a}は「お、お見苦しいところを……」と、消え入りそうな声で謝った。')},fx:{r: -7,c:6}},
{id:'extend',n:'延長の提案',t:L('{m}「お時間ですが……もう少し、ほぐしておきましょうか。延長は30分からです」'),r:{
proud:L('{a}は「……三十分だけだ」と言った。言ってから、自分の返事に驚いた。'),stern:L('{a}は時計を見て、予定を確認して、それでも「お願いします」と言っていた。'),
tsun:L('{a}「べ、別に延長したいわけじゃないけど、肩、まだ凝ってるし」'),gentle:L('{a}は「せっかくだから、お願いしようかしら」と微笑んだ。'),
devoted:L('{a}は「せっかく勧めてもらったので」と断れなかった。'),cool:L('{a}は料金表を見て、延長料金の計算をして、それでも頷いた。'),
free:L('{a}「するする！なんなら一時間！」'),shy:L('{a}は小さく、こくりと頷いた。'),polite:L('{a}は「では……お言葉に甘えて」と、丁寧に頭を下げた。')},fx:{c:6,extra:true}},
{id:'cloth',n:'紙パンツ',t:L('{m}「紙パンツ、少しずらしますね。オイルが付くので」――気づいたときには、紙パンツはもう脚の付け根まで下ろされていた。|{a}は施術の途中で、紙パンツが破れていることに気づいた。{m}は「よくあることです」と言った。'),r:{
proud:L('{a}は「好きにしろ」と吐き捨てた。'),stern:L('{a}は「……戻してください」と言った。戻されなかった。'),
tsun:L('{a}「ちょ、ちょっと！ずらしすぎでしょ！」'),gentle:L('{a}は「あらあら」と言っただけで、直さなかった。'),
devoted:L('{a}は恥ずかしさをこらえて、何も言わなかった。'),cool:L('{a}は「オイルは関係ないですよね」と言った。答えはなかった。'),
free:L('{a}「もう全部脱いじゃう？」{m}は少しだけ驚いた顔をした。'),shy:L('{a}はタオルを必死に引き寄せた。'),polite:L('{a}は「あの、恐れ入りますが、戻していただけますか」と言った。戻されなかった。')},fx:{r: -4,c:4}},
{id:'voice',n:'声が漏れる',t:L('{a}の口から、自分でも聞いたことのない声が漏れた。施術室が、一瞬しんとした。|大きな声が出た。{a}は自分の口を両手で塞いだが、もう遅かった。'),r:{
proud:L('{a}は「……今のは、咳だ」と言い張った。'),stern:L('{a}は「失礼しました」と頭を下げた。顔は上げられなかった。'),
tsun:L('{a}「い、今の聞こえなかったよね！？聞こえなかったって言って！」'),gentle:L('{a}は「あら……まあ」と、自分の声に自分で驚いて笑った。'),
devoted:L('{a}は「ご、ごめんなさい、ごめんなさい」と何度も謝った。'),cool:L('{a}は数秒黙ったあと、「……続けてください」とだけ言った。'),
free:L('{a}「わ、今のすっごい声出た！あはは！」'),shy:L('{a}は恥ずかしさで、そのまま消えてしまいたかった。'),polite:L('{a}は「た、大変失礼いたしました」と言って、両手で顔を覆った。')},fx:{r: -6,c:5}}
];
M.REVERSE=L('{a}は不意に起き上がり、{m}の手首を掴んで施術台に引き倒した。「{you}、さっきから好き勝手してくれたね。今度はこっちの番｜{you}、さっきから好き勝手やってくれたな。今度はこちらの番だ｜{you}、さっきから好き勝手してくれましたね。今度はこちらの番です」|{a}は{m}の耳元で囁いた。「ねえ、交代しよっか｜交代しよう｜交代しましょうか」――そう言って、{m}を施術台に押し倒した。|{a}は{m}の腕を引いて、自分の上に倒れ込ませ、そのまま体勢を入れ替えた。「マッサージ、教えてあげる｜マッサージを教えてやる｜マッサージ、教えてあげます」');
M.EVIDENCE=L('{a}はタオルの陰で、ポケットの録音ボタンをそっと押した。|{a}は施術室の間取りと、壁の時計の位置を頭に刻み込んだ。|{a}は{m}の言い訳を、一語一句覚えておくことにした。');
M.CRUSH=L('{a}は帰り際、{m}の名札をそっと盗み見た。|{a}は会計のとき、「次も、同じ人で｜次も、同じ人で頼む｜次も、同じ人でお願いします」と言った。|{a}は{m}の手の温かさを、帰りの電車でもずっと思い出していた。');
M.AFTERSHOP={
proud:L('店を出た{a}は、肩をぐるりと回した。「……肩だけは、軽くなった」|{a}は帰り道、何度も店の看板を振り返って舌打ちした。'),
stern:L('{a}は帰宅後、手帳に「本日、不覚」とだけ書いた。|{a}は帰りの電車で背筋を伸ばして座り、一度も目を閉じなかった。'),
tsun:L('{a}は「二度と行かない」と三回呟いて、ポイントカードを財布の一番奥にしまった。|{a}は帰り道、思い出しては「ばか」と呟いて、一人で赤くなった。'),
gentle:L('{a}は帰りにケーキを買って、「今日は頑張ったわね、わたし」と自分を労った。|{a}は家に着くなり、ソファでとろけるように眠った。'),
devoted:L('{a}は帰り道、「わたし、ちゃんとできてたかな」と、なぜか施術者の心配をしていた。|{a}は家に帰ってから、恥ずかしさが遅れてやってきて、布団の中で転げ回った。'),
cool:L('{a}は帰宅後、今日の出来事を時系列でメモにまとめた。三行目で手が止まった。|{a}は帰りのコンビニで水を買い、一気に飲み干した。思っていたより、喉が渇いていた。'),
free:L('{a}は帰り道、友達に「すごい店あった」とだけ送った。詳細は訊かれても言わなかった。|{a}は帰り道、スキップしかけて、膝が笑って転びかけた。'),
shy:L('{a}は帰り道、うつむいたまま早足で歩いた。誰にも顔を見られたくなかった。|{a}は家に帰ってすぐ、シャワーを浴びた。浴びても、触れられた感覚は消えなかった。')
};
M.SLEEP_WAKE.polite=L('{a}は目を覚まし、はっと身を起こした。「た、大変失礼いたしました、眠ってしまって……あの、この格好は……？」');
M.AFTERSHOP.polite=L('{a}は店を出てから振り返り、律儀に一礼した。それから、早足で駅へ向かった。|{a}は帰宅後、「本日はありがとうございました」と書きかけた口コミを、そっと消した。');
M.WRONG={
proud:L('{a}は肘で{m}の手を払った。「おい、待て。……{sx}相手に何してんだ」|{a}は背中をこわばらせた。（ふざけんな……{sx}の私が、こんなところ触られて感じるわけねえだろ……）|{a}は歯を食いしばった。気持ちいいはずがない、と自分に言い聞かせながら。'),
stern:L('{a}は体を固くした。「……待ってくれ。{sx}の私に、それは本当に必要な施術なのか」|{a}は眉間に深い皺を寄せた。（{sx}の私に、そういう意味で触れるはずがない。……これは施術だ）|{a}は拳を握りしめ、呼吸を数えて耐えた。反応してしまう自分が、許せなかった。'),
tsun:L('{a}「ちょ、ちょっと！？　{sx}にそんなとこ触る施術とか、聞いてないんだけど！？」|{a}は真っ赤になって身をよじった。「や、やだってば！　そういうの、違うから！」|{a}（ありえない……っ、{sx}の私が、なんでこんなので……！）'),
gentle:L('{a}は困ったように身を引いた。「あの……ごめんなさい、そういうのは、ちょっと……」|{a}は笑顔を作ろうとして、うまくいかなかった。（{sx}の私に、変な意味でするはずない……よね……）|{a}はタオルを胸元に引き寄せた。「……少し、怖いです」'),
devoted:L('{a}は震えながら首を振った。「ご、ごめんなさい……そ、そこは……」|{a}は涙目になって、必死に脚を閉じようとした。|{a}（{sx}の私にこんなことするなんて、きっと施術なんだ……そう、施術……っ）'),
cool:L('{a}は低い声で言った。「……手を止めてくれ。そっちの趣味はない」|{a}は無表情を保とうとしたが、首筋まで赤くなっていた。（{sx}の私が、ここで反応するのは……想定外だ）|{a}は{m}の手首を掴んで、静かに押し戻した。'),
free:L('{a}「いやいやいや、待って！？　{sx}相手にそれはナシでしょ！」|{a}は笑ってごまかそうとして、笑えなかった。「……え、本気？」|{a}「ちょっと、それは無理無理！」――{a}は施術台の端まで逃げた。'),
shy:L('{a}は小さく悲鳴を上げて、体を丸めた。「や……っ、そ、そんなところ……」|{a}は顔を枕に押しつけたまま、ずっと首を横に振っていた。|{a}（{sx}の私に、そんなつもりで触るわけない……っ、でも、声が……）'),
polite:L('{a}は身を起こした。「恐れ入りますが、わたくし、そういったご趣味には……」|{a}は丁寧に、しかしはっきりと{m}の手を退けた。「ご遠慮いたします」|{a}は唇を結んだまま、肩を小刻みに震わせていた。（{sx}のわたくしに、まさかそのような意図はないはず……）')
};
M.WRONG_BODY=L('嫌悪と戸惑いの奥で、{a}の体は正直に熱を帯びていった。|{a}は「{sx}の私が、こんなことで感じるはずがない｜＝｜{sx}の私が、こんなことで感じるはずがありません」と頭の中で何度も繰り返した。それでも、腰が勝手に跳ねた。|「違う、これは違う｜＝｜違います、これは違います」――{a}の否定とは裏腹に、肌は粟立っていた。|{a}は目を固く閉じた。相手の顔を見なければ、まだ言い訳ができる気がした。');
M.WRONG_NOTDECEIVED=L('{a}は首を振った。「リンパだろうと何だろうと、そこは無理｜リンパだろうと何だろうと、そこは無理だ｜リンパだろうと何だろうと、そこは無理です」|{a}は言い訳を最後まで聞かなかった。「{you}、そういう問題じゃない｜{you}、そういう問題ではない｜{you}、そういう問題ではありません」');
M.WRONG_STAY=L('{a}は長い沈黙のあと、目を閉じた。「……{sx}の私に、変な意味でするはずがない。だから、これは、ただのマッサージ｜……{sx}の私に、変な意味でするはずがない。だから、これは、ただのマッサージだ｜……{sx}の私に、変な意味でするはずがありません。だから、これは、ただのマッサージです」――自分に言い聞かせる声だった。|{a}は「……今日だけ。誰にも言わない｜……今日だけだ。誰にも言わない｜……今日だけです。誰にも言いません」と呟いて、横になり直した。相手のことは、考えないことにした。');
M.WRONG_FALL=L('{sx}の自分が、こんなふうに乱されるなんて。{a}の中で、何かが音を立てて崩れた。|{a}は、自分が何に抵抗していたのか、もう思い出せなかった。|「ちが……っ、こんなの、ちが……っ」――{a}の抗議は、途中から甘い声に変わった。');
M.WRONG_END=L('{a}は帰り道、「あれはただのマッサージだった｜＝｜あれはただのマッサージでした」と何度も呟いた。何の言い訳にもならなかった。|その夜、{a}は自分の好みが分からなくなって、なかなか眠れなかった。|{a}はスマホの検索履歴を、三回消した。');
M.SCOUT=L('{m}は乱れた息のまま、施術台の上から{a}を見上げた。「……お客様。うちで、働いてみませんか」|ぐったりした{m}は、震える手で名刺を差し出した。「その指……才能です。本気で、スカウトさせてください」|{m}は額の汗を拭いながら、真顔で言った。「こんなにされたのは初めてです。……来月から、施術する側に回りませんか」');
M.SCOUT_YES={
proud:L('{a}は名刺を受け取って、鼻で笑った。「いいぜ。客どもを全員、骨抜きにしてやる」'),
stern:L('{a}はしばらく名刺を見つめてから、短く答えた。「……やるからには、本気で学ぶ」'),
tsun:L('{a}「べ、別に向いてるとか思ってないけど！　……時給、いくら？」'),
gentle:L('{a}は少し照れたように笑った。「わたしで役に立てるなら……やってみようかな」'),
devoted:L('{a}「わ、私なんかで、よければ……！　一生懸命、覚えます……！」'),
cool:L('{a}は名刺を裏返して、条件を確かめた。「……悪くない話だ。研修はいつからだ」'),
free:L('{a}「え、ほんと！？　やるやる！　毎日こんなことできるの最高じゃん！」'),
shy:L('{a}は真っ赤になって俯いたまま、名刺をぎゅっと握りしめた。「……は、はい……」'),
polite:L('{a}は名刺を両手で受け取り、深々と頭を下げた。「謹んで、お受けいたします」')
};
M.SCOUT_NO={
proud:L('{a}は名刺を指で弾き返した。「客の方が性に合ってんだよ。……また来てやる」'),
stern:L('{a}は首を横に振った。「本業がある。……今日のことは、忘れてくれ」'),
tsun:L('{a}「は、はぁ！？　やるわけないでしょ！」――名刺は、こっそりポケットにしまった。'),
gentle:L('{a}は困ったように笑った。「ごめんなさい。わたしは、される方が好きみたい」'),
devoted:L('{a}「お、お気持ちは嬉しいんですけど……私には、とても……」'),
cool:L('{a}は名刺を突き返した。「店の評判を考えたら、関わらない方が利口だ」'),
free:L('{a}「えー、仕事にしたら楽しくなくなっちゃうもん。客で来るね！」'),
shy:L('{a}は首をぶんぶん横に振った。「む、むり、むりです……っ」'),
polite:L('{a}は丁重に名刺を押し戻した。「身に余るお話ですが、ご辞退申し上げます」')
};
M.TRAINEE_YES={
proud:L('{a}「……っ、好きに、しろ……っ」――それは、ほとんど懇願だった。'),
stern:L('{a}「……っ、わかった……引き受ける……っ」'),
tsun:L('{a}「し、仕方ない、から……っ、なって、あげる……」'),
gentle:L('{a}「……はい。わたしで、よければ……」'),
devoted:L('{a}「なります……っ、なりますから……」'),
cool:L('{a}「……ああ。……なる。なるから……っ」'),
free:L('{a}「なるなるっ……！　毎週、来る……」'),
shy:L('{a}「は、はい……っ、なり、ます……」'),
polite:L('{a}「つ、謹んで……お引き受け、いたします……」')
};
M.TRAINEE_HESITATE={
proud:L('{a}「ふ、ざけ……っ、誰が……っ」'),
stern:L('{a}「……そ、それは……少し、考えさせて……」'),
tsun:L('{a}「だ、誰がそんなの……っ、なるわけ……っ」'),
gentle:L('{a}「え、ええと……それは、その……」'),
devoted:L('{a}「わ、私なんかで、いいんでしょうか……っ」'),
cool:L('{a}「……今、それを訊くのは……卑怯、だろ……」'),
free:L('{a}「えー、どうしよっかなー……っ、ん……っ」'),
shy:L('{a}「え、あ、あの……っ、そ、それは……っ」'),
polite:L('{a}「そ、そのようなお話は、また改めて……っ」')
};
M.TRAINEE_END=L('{a}の名前は、新人研修のマニュアルの「協力者」の欄に載った。|新人の一人が「{a}さんのおかげで合格できました」と頭を下げた。{a}は、どこを褒められたのか訊けなかった。');
M.TOP_INC=['phone','neighbor','aroma','towel','mirror'];
M.TOP_REACT=L('{a}は{m}の手の位置を、横目で確かめた。まだ、ぎりぎり施術の範囲だった。|{a}は「そこまでなら｜そこまでならいい｜そこまでなら、いいです」と小さく釘を刺した。{m}の手が、わずかに止まった。|{a}は眉ひとつ動かさず、ずれかけたタオルの位置だけを直した。|{a}は「次に手が下がったら起きる｜＝｜次に手が下がったら起きます」と、心の中で決めていた。');
M.TOP_STOP=L('{m}の指が、内腿を這い上がりかけた。その手首を、{a}はうつ伏せのまま後ろ手に掴んだ。「――そこから先は、{you}に頼んでない｜――そこから先は、{you}に頼んでいない｜――そこから先は、{you}に頼んでいません」|際どいところへ滑り込もうとした手を、{a}は迷わず払いのけた。「触られて喜ぶ趣味はない｜＝｜触られて喜ぶ趣味はありません」|{a}は{m}の手が「リンパ」の範囲を外れた瞬間に、身を起こした。「施術はここまで。……触られる側は、性に合わない｜施術はここまでだ。……触られる側は、性に合わない｜施術はここまでです。……触られる側は、性に合いません」|{m}の手つきが変わったのを、{a}は見逃さなかった。指が届く前に、{a}は膝を立てて体を返していた。「で、{you}、今のは何の施術？｜で、{you}、今のは何の施術だ｜で、{you}、今のは何の施術ですか」');
M.TOP_REVERSE=L('{a}は掴んだ手首を引き、体勢を入れ替えて{m}を施術台に押さえつけた。「そんなに触りたいなら、触られる側の気持ちも知っておくといい｜＝｜そんなに触りたいなら、触られる側の気持ちも知っておくといいですよ」|{a}は施術台から降り、代わりに{m}をそこへ寝かせた。「交代。今度は、{you}が力を抜く番｜交代だ。今度は、{you}が力を抜く番だ｜交代です。今度は、{you}が力を抜く番です」|{a}はオイルの瓶を取り上げ、{m}の手首ごと施術台に縫いとめた。「ここからは、こっちが施術する｜ここからは、こちらが施術する｜ここからは、こちらが施術します」');
M.TOP_LEAVE=L('{a}は{m}の手を施術台の縁に戻させ、タオルを巻き直した。|{a}は{m}の手首を離すと、何事もなかったように起き上がった。|{a}は「延長はいらない｜＝｜延長はいりません」と言い捨てて、施術台を降りた。');
M.DARK={
climax:L('――{a}は、声を殺しきれなかった。|――{a}の指先が、施術台の縁を強く掴んだ。|――{a}の背中が、小さく跳ねた。|――{a}は枕に顔を埋めて、肩を震わせた。|――{a}のつま先が、きゅっと丸まった。'),
act:{
'特別':L('{m}は声を落とした。「ここからは、特別な施術になります。……力を抜いてください」――照明が、ふっと一段暗くなった。|{m}はタオルを畳み直して、静かに言った。「目を閉じていてくださいね」――{a}は、言われた通りにした。'),
'仕上げ':L('{m}「仕上げです」――そこから先、{m}の手がどこにあったのか、{a}はよく覚えていない。|{m}は{a}の耳元で囁いた。「最後まで、全部ほぐしておきますね」――{a}は、頷くことしかできなかった。')
},
reverse:L('――{a}は{m}を施術台に押さえつけ、照明のスイッチを切った。暗闇の中から、{m}の上ずった声だけが聞こえていた。|――{a}は{m}の耳元で「今度はこっちの番｜今度はこちらの番だ｜今度はこちらの番です」と囁くと、カーテンを閉めた。しばらくのあいだ、施術室からは{m}の声しか聞こえなかった。'),
blackout:L('{m}が、施術室の明かりを落とした。「では、本当の施術を始めましょう」――暗闇の中で、{a}は自分から手を伸ばしていた。|カーテンが閉められ、照明が消えた。{m}の「次は、こちらの姿勢で」という声だけが、何度も聞こえた。|{m}は扉の札を「施術中」に裏返し、鍵をかけた。――そこから先は、時計の針の音しか覚えていない。'),
lightsOn:L('明かりが点いたとき、{a}はシーツにくるまったまま、天井を見上げていた。|明かりが点くと、施術台のシーツはぐしゃぐしゃになっていた。{a}は顔を上げられなかった。|カーテンが開いたとき、窓の外はもう暗かった。'),
traineeAsk:L('暗闇の中で、{m}の囁き声がした。「……新人の練習台に、なってくれませんか」|{m}は動きを止めずに、耳元で言った。「来週から研修があるんです。{a}さんに、お願いしたくて」'),
traineePress:L('{m}「返事は？」――一拍置いて、暗闇の中から上ずった声が聞こえた。「……う、うん……っ｜……あ、ああ……っ｜……は、はい……っ」{a}は何度も頷いていた。|{m}「聞こえませんでした」――しばらくして、{a}の震える声がした。「……な、なる……｜＝｜……なり、ます……」')
};
})();
});
HK.Load.done('pack-solo', '6a2c9cbdeb', 1);
