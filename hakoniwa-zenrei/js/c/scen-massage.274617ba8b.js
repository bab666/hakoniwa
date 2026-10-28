;
/* ==== js/solo-massage-cast.js ==== */
HK.Load.def(128,'js/solo-massage-cast.js',function(){
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
'背中':L('{m}は背骨の両脇を、下から上へ丁寧に押し上げていった。押されるたびに、{a}の口から長い息が漏れた。|「＠{m}＠ここ、ずっと張ってたでしょ｜ここは、ずっと張っていただろう｜ここ、ずっと張っていたでしょう」――{m}の手が、{a}自身も気づいていなかった凝りを正確に探り当てた。|{m}は{a}の背中に体重をかけ、ゆっくりと伸ばした。骨が、小さく鳴った。'),
'腰':L('{m}は{a}の腰に両手を置いて、ゆっくりと円を描いた。「座りっぱなしでしょ。腰が泣いてる｜座りっぱなしだろう。腰が泣いている｜座りっぱなしでしょう。腰が泣いていますよ」|腰骨の上を押されて、{a}は思わず「そこ」と声を上げた。{m}は「でしょ｜だろう｜でしょう」と得意げに笑った。|{m}はタオルを掛け直してから、腰のまわりを念入りにほぐした。手つきは、最後まで仕事のものだった。'),
'脚':L('ふくらはぎを絞るように揉まれて、{a}は痛いのか気持ちいいのか分からない声を上げた。|{m}は{a}の足裏を親指で押した。「ここ、胃のつぼ。……最近、食べすぎてない？｜ここは、胃のつぼだ。……最近、食べすぎていないか？｜ここ、胃のつぼです。……最近、食べすぎていませんか？」|{m}は膝の裏から足首まで、むくみを流すように手のひらを滑らせた。'),
'仕上げ':L('{m}は最後に、{a}の肩を両手でぽんと叩いた。「はい、おしまい。起き上がるとき、ゆっくりね｜よし、終わりだ。起き上がるときは、ゆっくりだ｜はい、おしまいです。起き上がるときは、ゆっくりどうぞ」|{m}は温かいおしぼりを差し出した。「お疲れさま。……知り合いの体って、思ったより緊張するね｜お疲れさま。……知り合いの体というのは、思ったより緊張するな｜お疲れさまでした。……知り合いの体って、思ったより緊張しますね」|仕上げのストレッチで、{a}の背中がぐっと伸びた。{m}は満足そうにうなずいた。')
};
C.PLAIN_ALMOST=L('{m}の手が太腿のほうへ上がりかけて、ぴたりと止まった。「……ここは、やめておこうか｜……ここは、やめておこう｜……ここは、やめておきましょうか」{m}はそう言って、ふくらはぎに手を戻した。|オイルを手に取った{m}は、タオルの縁を見て少し迷った。それから、タオルをきっちり掛け直した。「脚はタオルの上から。知り合いだしね｜脚はタオルの上からだ。知り合いだからな｜脚はタオルの上からにします。知り合いですしね」|{m}の指が膝の上へ滑りかけて、慌てたように引っ込んだ。「ご、ごめん。今のは手が滑っただけ｜す、すまない。今のは手が滑っただけだ｜す、すみません。今のは手が滑っただけです」――{a}は、聞かなかったことにした。');
C.RES_TALK={
gentle:[L('{m}「痛かったら、遠慮なく言ってね｜痛かったら、遠慮なく言ってくれ｜痛かったら、遠慮なく言ってくださいね」|{m}「仕事、大変なんでしょう。肩がそう言ってる｜仕事が大変なんだろう。肩がそう言っている｜お仕事、大変なんでしょう。肩がそう言っていますよ」|{m}「オイル、少し温めておくね｜オイルを少し温めておく｜オイル、少し温めておきますね」')],
chara:[L('{m}「すごく凝ってるね。デスクワーク？｜すごく凝っているな。デスクワークか？｜すごく凝ってますね。デスクワークですか？」|{m}「今日はいい天気だね。あ、痛かったら言って！｜今日はいい天気だな。痛かったら言え｜今日はいい天気ですね。あ、痛かったら言ってください！」|{m}「オイル、ちょっと冷たいよ。はい、いくね｜オイルが少し冷たいぞ。いくぞ｜オイル、ちょっと冷たいですよ。はい、いきますね」')],
silent:[L('{m}は一言も喋らずに、黙々と肩を押した。|{m}は無言でうなずき、タオルの位置を直した。|{m}の手が、迷いなく凝りを探り当てた。{m}「……ここ｜……ここだ｜……ここですね」')],
lady:[L('{m}「はい、ゆっくり息を吐いて……そう、とても上手｜ゆっくり息を吐け……そう、上手だ｜はい、ゆっくり息を吐いてください……そう、とても上手です」|{m}「今日はたくさん頑張ったんだね。ここで全部置いていって｜今日はよく頑張ったな。ここで全部置いていけ｜今日はたくさん頑張ったんですね。ここで全部置いていってください」|{m}は耳元で囁いた。「＠{m}＠いい香りでしょう。ラベンダーなの｜いい香りだろう。ラベンダーだ｜いい香りでしょう。ラベンダーなんです」')]
};
C.resTalk=function(sk,band){var T=C.RES_TALK[sk]||C.RES_TALK.gentle;return T[band]||T[0];};
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
HK.Load.def(129,'js/solo-massage.js',function(){
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
'問診':L('{m}は問診票をめくった。「＠{m}＠最近、疲れが溜まる場所は？」「＠{m}＠…眠りは浅いほうですか」「＠{m}＠では、最後に、最近いつ…いえ、何でもありません」|問診票の最後の欄には「敏感な部位（複数回答可）」と書かれていた。{a}は首をかしげながら「特になし」に丸をつけた。|{m}は{a}の手首を取って脈を測った。「＠{m}＠緊張していますね。大丈夫、すぐにほぐれますよ」'),
'肩':L('{m}の指が{a}の肩甲骨の縁に沈んだ。「＠{m}＠かなり凝ってますね」――ここまでは、普通のマッサージだった。|首筋をなぞる指が、思いのほか優しかった。{a}は思わず深い息を吐いた。|{m}は温めたタオルを{a}の首に当て、耳の後ろのつぼをゆっくり押した。'),
'背中':L('{m}「服、少し失礼しますね」背中の留め具が外された。「＠{m}＠オイルが付くといけないので」|背骨に沿って、温かいオイルが一筋垂らされた。{m}の手のひらが、それを脇腹まで塗り広げた。|{m}の指が背中を下から上へ、何度も往復した。往復するたびに、脇腹に触れる範囲が少しずつ広がっていく。'),
'腰':L('{m}「腰、だいぶ張ってますね」と言いながら、親指がタオルの縁の下へ潜り込んだ。|{m}は{a}の腰に体重をかけ、ゆっくりと円を描いた。手のひらの位置が、少しずつ下がっていく。|腰骨の内側を押されて、{a}の体がびくりと跳ねた。{m}「ここ、効きますよね」'),
'脚':L('{m}「脚のむくみ、かなり溜まってますね」足首から膝の裏へ、手のひらがゆっくり滑っていった。思っていたより、上のほうまで。|{m}の手が、足首から膝の上まで何度も往復した。往復するたびに、手の止まる位置が少しずつ上がっていく。|{m}「この辺りのリンパ、しっかり流しておきますね」――{a}はそれが医学用語なのか、言い訳なのか判断がつかなかった。'),
'臀部':L('{m}「骨盤まわりが凝り固まってます。座り仕事、多いでしょう」腰の下のほうを、手のひらが大きく押し回した。|{m}「ここは骨盤の歪みに直結するので」――そう言われると、拒む理由が見つからなかった。|オイルを足した{m}の手が、腰骨の下をゆっくりなぞった。タオルが少しずつずれていくのを、{a}は気にしないふりをした。'),
'胸元':L('{m}「では仰向けに。首まわりのリンパを流します」鎖骨をなぞった指が、そこで止まらずに少しだけ下へ滑った。|{m}「呼吸が浅いですね。胸まわりの筋肉も、呼吸に関わるので」――タオル越しに置かれた手のひらが、やけに温かかった。|{m}は{a}の鎖骨の下に親指を当て、ゆっくりと円を描いた。「＠{m}＠ここ、かなり張ってますね」――{a}は天井の一点を見つめた。'),
'下腹':L('{m}「下腹は冷えが溜まりやすいんです」温かい手のひらが、へその下でゆっくりと円を描いた。|{m}「ここをほぐすと、全身の巡りがよくなります」――{m}の手は、タオルの縁ぎりぎりのところで止まっていた。|おなかの上で、{m}の手がゆっくり往復した。{a}は、自分の鼓動がやけに大きく聞こえる気がした。'),
'特別':L('{m}は声を落とした。「＠{m}＠ここからは、特別な施術になります。……力を抜いてください」――照明が、ふっと一段暗くなった。|{m}はタオルを畳み直して、静かに言った。「＠{m}＠目を閉じていてくださいね」――{a}は、言われた通りにした。'),
'仕上げ':L('{m}「仕上げです」――そこから先、{m}の手がどこにあったのか、{a}はよく覚えていない。|{m}は{a}の耳元で囁いた。「＠{m}＠最後まで、全部ほぐしておきますね」――{a}は、頷くことしかできなかった。')
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
if(rng()<0.4)K.say(S,{kind:'ev',tag:'施術者',text:K.fmt(S,K.pick(S,rng()<0.6?(PM?PM.talk:MC.PLAIN_TALK):TR&&MC.resTalk?MC.resTalk(sk,0):M.STAFF_TALK[sk][0])),why:''});
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
var WAKE_BASE={proud:0.3,stern:0.35,cool:0.35,tsun:0.25,shy:0.25,polite:0.2,devoted:0.15,gentle:0.1,free:0.05};
function sleepClimax(list){
if(!list.length)return false;
var SZ= !dark&& !HK.SAFE_ON?HK.MassageSleep:null,ero= !!(SZ&&lcf&&LWX.ero(env));
var hasF=HK.Pos&&HK.Pos.genSet&&HK.Pos.genSet(h)?HK.Pos.hasF(h):h.gender==='f';
var grp=kindR==='ff'?(hasF?'ff':'recv'):kindR==='lady'?'lady':'recv';
var w=K.will(h);
for(var k=0;k<list.length;k++){
var wp=(WAKE_BASE[h.persona]!=null?WAKE_BASE[h.persona]:0.2)+w*0.35+h.tr.caution*0.15+k*0.15;
var wake=rng()<wp;
var t=SZ?SZ.text(S,K,h,grp,wake,ero):K.fmt(S,K.pick(S,wake?M.SLEEP_CL_WAKE_DARK:M.SLEEP_CL_DARK));
var o=K.say(S,{kind:'climax',tag:K.W_CL,sleep:wake?'wake':'stay',text:t,why:(wake?'眠ったまま'+K.W_CL+'して、その拍子に目を覚ました':'眠ったまま'+K.W_CL+'した（目は覚まさなかった）')+'／心の強さ '+Math.round(w*100)+'・慎重さ '+Math.round(h.tr.caution*100)});
if(wake){
if(!S.flags.firstKey)S.flags.firstKey=true;
K.key(S,o,'眠ったまま'+K.W_CL+'して目を覚ました');
sus+=45;
logC(list.slice(k+1));
return true;
}
if(!S.flags.firstKey){S.flags.firstKey=true;K.key(S,o,'眠ったまま最初の'+K.W_CL);}
}
return false;
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
var asleep0=sleeping>0;
if(sleeping){
K.say(S,{kind:'ev',tag:st[0]+'（睡眠中）',lewd:lvl>=3||r.climaxes.length>0,text:text+' '+K.fmt(S,K.pick(S,M.SLEEP_DUR)),why:'眠っている間に施術が進んだ／快感 ＋'+Math.round(r.gain)});
var woke=sleepClimax(r.climaxes);
sleeping--;
if(woke)sleeping=0;
else if(!sleeping){
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
if(rng()<0.5&& !asleep0)K.say(S,{kind:'ev',tag:'施術者',text:K.fmt(S,K.pick(S,TR&&MC.resTalk?MC.resTalk(sk,hardTop?0:bd):M.STAFF_TALK[sk]?M.STAFF_TALK[sk][hardTop?0:bd]:M.STAFF_TALK.gentle[hardTop?0:bd])),why:''});
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
if(sleeping&&(fell||(extended&& !hardTop&& !left&& !reversed))){
sleeping=0;sus+=45;
var owE=K.say(S,{kind:'ev',tag:'目覚め',text:K.fmt(S,K.pick(S,M.SLEEP_WAKE[h.persona]||M.SLEEP_WAKE.gentle)),why:'寝ている間に施術が最後まで進んでいた'});
K.key(S,owE,'寝落ちから目覚めた');
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
var nightIn='';
if(TR&& !dark&&lwOn()&&HK.Attr&&HK.Attr.nightText){
var nT=cTop()?h:TR,nU=nT===h?TR:h;
var nMode=ff?'ff':HK.Pos&&HK.Pos.isF(nT)&& !HK.Pos.isF(nU)?'fm':'mf';
nightIn=HK.Attr.nightText(nT,nU,nMode,function(l){return K.pick(S,l);},eroOn);
if(nightIn)nightIn=' '+nightIn.replace(/\{a\}/g,nT.name).replace(/\{b\}/g,nU.name);
}
var head=K.say(S,{kind:'sys',tag:'陥落',text:(wrong&&M.WRONG_FALL?fw(M.WRONG_FALL):'')+K.fmt(S,K.pick(S,['{a}の体は、もう{m}の言葉にしか従わなかった。{m}「では、本当の施術を始めましょう」','{a}は施術台の上で、自分から脚の力を抜いた。{m}は満足そうに微笑んだ。','{m}「今日はサービスです。最後まで、ゆっくり」――{a}には、断る理由がもう見つからなかった。']))+nightIn,why:'快楽に負けた（堕ち度 '+Math.min(100,Math.round(h.corrupt))+'・理性 '+Math.round(Math.max(0,h.reason))+'）'});
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
/* ==== js/solo-massage-data.js ==== */
HK.Load.def(302,'js/solo-massage-data.js',function(){
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
L('{m}の質問が、少しずつ個人的になっていった。「＠{m}＠恋人はいらっしゃるんですか」|{a}は話し続けることで、際どい手つきから気を逸らそうとした。話題が、途切れがちになった。|{a}は「この仕事、長いの？｜この仕事は長いのか｜この仕事、長いんですか」と訊いた。{m}の答えは、少しはぐらかすようだった。'),
L('{a}は何か話そうとして、話す内容をすっかり忘れていた。|「＠{m}＠それで、さっきの話の続きは？」――{m}に訊かれても、{a}はもう答えられなかった。|{a}の相づちは、もう「うん」と「はい」だけになっていた。')
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
M.SLEEP_CL_DARK=L('――眠ったままの{a}の肩が、小さく跳ねた。寝息がひとつ乱れて、またすぐに静かになった。{a}は、目を覚まさなかった。|――眠る{a}の指先が、タオルの端をきゅっと握った。浅くなった寝息が、しばらくしてゆっくりと戻っていった。{a}の寝顔は、少しも変わらなかった。|――{a}の背中が、眠ったまま小さく震えた。唇から短い息がこぼれ、それきりまた深い寝息に戻った。');
M.SLEEP_CL_WAKE_DARK=L('――眠っていた{a}の体が、大きく跳ねた。その拍子に、{a}ははっと目を開けた。{a}「……え？　今、何……｜……ん？　今のは、何だ……｜……え？　今のは、何ですか……」――自分がどこにいるのか、すぐには分からなかった。|――{a}の肩がびくりと跳ね、{a}は弾かれたように目を覚ました。心臓だけが、ひどく速く打っていた。{a}「……私、寝てた……？｜……私は、寝ていたのか……？｜……私、眠っていたんですか……？」');
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
;
HK.Load.def(302.5,'tone:scen-massage',function(){
HK.Load.toneData("mixed",{"F":[
["あらあら、お隣さん、気持ちよさそうね","おやおや、お隣さん、気持ちよさそうですね。いいなあ"],
["説明しろ。今の手は、どこのリンパだ","説明してください。今の手、どこのリンパですか",1]]});
HK.Load.toneData("noja",{"F":[
["べ、別にいいけど！じろじろ見ないでよね！","べ、別に構わぬが！　じろじろ見るでないぞ！"],
["べ、別に疲れてないけど、せっかくだから","べ、別に疲れてはおらぬが、せっかくじゃから",1],
["……何でもないってば","……何でもないと言うておろう",1],
["な、なんか熱いんだけど！？変なの入ってない！？","な、なにやら熱いのじゃが！？変なものが入っておらぬか！？",1],
["……ちょっと待て。今のは、何だ","……待て待て。今のは、何じゃ",1],
["この仕事は長いのか","この仕事、長いのかのう？",1],
["お疲れさま。……知り合いの体というのは、思ったより緊張するな","ご苦労じゃった。……知り合いの体というのは、思うたより緊張するものじゃのう",1],
["ちょっとちょっと、今のどこ触ったの？　さすがにバレるって","これこれ、今どこを触ったのじゃ？　さすがに露見するぞ",1]]});
HK.Load.toneData("kansai",{"F":[
["べ、別にいいけど！じろじろ見ないでよね！","べ、別にええけど！じろじろ見んといてや！"],
["勘違いしないでよね、仕事なんだから！","勘違いせんといてや、仕事なんやから！",1],
["……ちょっと待って。今の、何？","……ちょっ、待って。今の、何なん？",1]]});
HK.Load.toneData("mukuchi",{"F":[
["あら、ごめんなさいね。早とちりしちゃった","……ごめん。早とちり",1],
["せっかくだから、お願いしようかしら","……せっかく、だし。……お願い",1]]});
HK.Load.toneData("gentleman",{"F":[
["ば、ばか、そこはっ……","こ、こら、そこはっ……"],
["この仕事は長いのか","この仕事は、長いのかね",1],
["お疲れさま。……知り合いの体というのは、思ったより緊張するな","お疲れさま。……知り合いの体というのは、思いのほか緊張するものだね",1],
["一度、確認させてください。今のは何の手技ですか","一度、確かめさせてくれたまえ。今のは何という手技なのかね",1],
["……ちょっと待て。今のは、何だ","……少し待ちたまえ。今のは、何だね",1],
["…続けろ。ただし、余計なことはするな","…続けたまえ。ただし、余計なことはしないように",1]]});
HK.Load.toneData("ane",{"F":[
["あらあら、お隣さん、気持ちよさそうね","あらあら、お隣さん、気持ちよさそうね",1],
["今日は頑張ったわね、わたし","今日は頑張ったわね、私",1],
["あら、ごめんなさいね。早とちりしちゃった","あら、ごめんなさいね。早とちりしちゃったわ",1]]});
HK.Load.toneData("chara",{"F":[
["あ、もしもし？今マッサージ中〜。……ん、っ、何でもない！あはは","あ、もしもしー？　今マッサージ中〜。……ん、っ、なんでもない！　あはは",1],
["マッサージって奥が深いんだねー","マッサージって、マジ奥深いんだね〜",1]]});
HK.Load.toneData("darui",{"F":[
["あらあら、お隣さん、気持ちよさそうね","……お隣さん、気持ちよさそう。……へえ",1]]});
HK.Load.toneData("devoted_p",{"F":[
["ご、ごめんなさい、すみません……","ご、ごめん、ごめんなさい……"]]});
HK.Load.toneData("gentle",{"F":[
["あらあら、お隣さん、気持ちよさそうね","お隣さん、気持ちよさそうだね",1]]});
HK.Load.toneData("gentle_n",{"F":[
["あら、こんな顔してたのね","おや、こんな顔してたんだね"],
["あらあら、お隣さん、気持ちよさそうね","隣の人、気持ちよさそうだね",1],
["今日は頑張ったわね、わたし","今日はよく頑張ったね、自分",1]]});
HK.Load.toneData("gyaru",{"F":[
["また来ます","また来るね"],
["ああ、これはひどい。いつもこんな姿勢で仕事してるんでしょ","うわ、これヤバ。いつもこんな姿勢で仕事してんでしょ",1],
["ああ、これはひどい。いつも同じ姿勢で仕事してるでしょ","うわ、これヤバ。いつも同じ姿勢で仕事してるっしょ",1]]});
HK.Load.toneData("hero",{"F":[
["あ、もしもし？今マッサージ中〜。……ん、っ、何でもない！あはは","あ、もしもし？　今マッサージ中だ！　……ん、っ、何でもねえ！　ははっ",1],
["この仕事は長いのか","この仕事、長いのか？",1],
["……ちょっと待て。今のは、何だ","……ちょっと待て。今の、何だ？",1]]});
HK.Load.toneData("kohai",{"F":[
["本日はありがとうございました","今日はありがとうございましたっ……じゃなくて、ありがとうっす"],
["念のため伺います。ただいまの施術は、コースに含まれておりますか","念のため聞いとくっす。今の施術って、コースに入ってるっすか？",1],
["大変失礼いたしました。どうぞ、お続けください","うわ、すんません！　どうぞ、続けてくださいっす",1],
["……ちょっと待ってください。今の、何ですか","……ちょ、待ってくださいっす。今の、何っすか",1],
["ご説明、ありがとうございます","説明、ありがとうございまっす",1]]});
HK.Load.toneData("mystic",{"F":[
["……ちょっと待て。今のは、何だ","……少し待っておくれ。今のは、何だい？",1],
["そっちはどうだ？","そっちはどうだい？",1],
["今度はこちらの番だ","ふふ、今度はこちらの番だよ",1]]});
HK.Load.toneData("ojou",{"F":[
["ああ、これはひどいですね。いつもこんな姿勢で仕事をしているんでしょう","まあ、これはひどいですわね。いつもこんな姿勢でお仕事をなさっているのでしょう",1],
["ああ、これはひどいですね。いつも同じ姿勢でお仕事をされているでしょう","まあ、これはひどいですわね。いつも同じ姿勢でお仕事をなさっているのでしょう",1]]});
HK.Load.toneData("tsun_n",{"F":[
["べ、別にいいけど！じろじろ見ないでよね！","べ、別にいいけど！じろじろ見るなよ！"]]});
HK.Load.toneData("usan",{"F":[
["あら、こんな顔してたのね","へえ、こんな顔してたんだねえ"],
["あらあら、お隣さん、気持ちよさそうね","お隣さん、気持ちよさそうだねえ"]]});
HK.Load.toneData("yankee",{"F":[
["べ、別にいいけど！じろじろ見ないでよね！","べ、別にいいけど！じろじろ見んなよ！"],
["まあ、気持ちいい","おお、気持ちいい"],
["今日は頑張ったわね、わたし","今日は頑張ったな、私"],
["な、何この天井！？聞いてない！","な、何だこの天井！？　聞いてねえ！",1],
["あらあら、お隣さん、気持ちよさそうね","おいおい、お隣さん、気持ちよさそうじゃねえか",1],
["……ちょっと待て。今のは、何だ","……ちょっと待てよ。今の、何だよ",1],
["この仕事は長いのか","この仕事、長えのか？",1]]});
HK.Load.toneData("sondai",{"F":[
["ああ、これはひどい。いつも同じ姿勢で仕事をしているだろう","ほう、これはひどい。いつも同じ姿勢で仕事をしているのだろう",1],
["ああ、これはひどい。いつもこんな姿勢で仕事をしているんだろう","ほう、これはひどい。いつもこんな姿勢で仕事をしているのだろうね",1],
["お疲れさま。……知り合いの体というのは、思ったより緊張するな","ご苦労。……知り合いの体というのは、思いのほか緊張するものだね",1]]});
HK.Load.toneData("god",{"F":[
["この仕事は長いのか","この務め、長いのか",1],
["ああ、これはひどい。いつもこんな姿勢で仕事をしているんだろう","ほう、これはひどい。常にこのような姿勢で務めておるのであろう",1],
["ああ、これはひどい。いつも同じ姿勢で仕事をしているだろう","ほう、これはひどい。常に同じ姿勢で務めておるのであろう",1],
["お疲れさま。……知り合いの体というのは、思ったより緊張するな","大儀であった。……見知った者の体というのは、思いのほか気を張るものだな",1],
["一度、確認させてください。今のは何の手技ですか","待て。今のは何の手技か、申してみよ",1]]});
HK.Load.toneData("keigo_flat",{"F":[
["……ちょっと待ってください。今の、何ですか","……待ってください。今のは、何ですか",1]]});
HK.Load.toneData("ronkyaku",{"F":[
["お疲れさま。……知り合いの体というのは、思ったより緊張するな","お疲れさま。……知り合いの体というのは、思ったより緊張するものだな",1]]});
HK.Load.toneData("chara_down",{"F":[
["念のため伺います。ただいまの施術は、コースに含まれておりますか","一応聞きますけど。今のって、コースに入ってるやつですー？",1],
["……ちょっと待ってください。今の、何ですか","……ちょっと待ってください。今の、何です？",1]]});
});
HK.Load.done('scen-massage', '274617ba8b', 1);
