/* 箱庭診断: ソロR18「これって本当にマッサージですか？」
   施術は少しずつ際どくなる。いつ気づくか、言い訳に騙されるか、快楽に負けるか。
   慎重・冷静（A・慎重さ・ドライさ）なら気づきやすく、素直（AC・NP）なら言い訳に騙されやすい。 */
/* 出来事の一覧の印（hakoniwa-tools/build/event-catalog.js が数える。決まりは docs/reports/2026-10-28/event-catalog.md） */
/* @event-table scen=massage path=MassageMore.INCIDENTS label=施術中のハプニング cat=ハプニング */
/* @event scen=massage id=ms_treat cat=solo label=施術（少しずつ際どく。気づく・言い訳に騙される） */
/* r18:begin */
/* @event scen=massage id=ms_r18 cat=夜 tags=night,mob,force label=施術者に体を開かれていく（題材なので合意のない展開はいつも入） */
/* r18:end */
(function () {
  'use strict';
  var HK = window.HK, K = HK.SoloKit, DG = HK.DG;
  var clamp = HK.clamp;
  function L(s) { return s.split('|'); }

  var STAFF = {
    gentle: { n: '店長', g: 'm', desc: '物腰の柔らかい紳士。言い訳がとにかく丁寧', dec: 0.15 },
    chara: { n: '若いスタッフ', g: 'm', desc: '軽い口調でぐいぐい来る。ボロも出やすい', dec: -0.1 },
    silent: { n: '無口な職人', g: 'm', desc: 'ほとんど喋らない。言い訳もしないので逆に怪しまれにくい', dec: 0.05 },
    lady: { n: '女性セラピスト', g: 'f', desc: '囁くような声で安心させてくる', dec: 0.2 },
    duo: { n: '二人のスタッフ', g: 'm', desc: '二人がかり。手が四本あると気づくのが遅れる', dec: 0.1 }
  };

  /* 施術の段階：[部位, 名前, 部位キー, 強さ, 際どさ] */
  var STAGES = [
    ['問診', '受付と問診', 'all', 4, 0],
    ['肩', 'うつ伏せで肩と首', 'neck', 10, 0],
    ['背中', '背中', 'back', 12, 1],
    ['腰', '腰', 'hips', 14, 1],
    ['脚', '太腿と脚の付け根', 'thigh', 18, 2],
    ['臀部', 'お尻まわり', 'hips', 20, 2],
    ['胸元', '仰向けでデコルテ', 'chest', 22, 3],
    ['下腹', '下腹', 'belly', 24, 3],
    ['特別', '「特別な施術」', 'all', 28, 4],
    ['仕上げ', '仕上げ', 'all', 30, 5]
  ];

  /* 施術の文（段階ごと） */
  var ACT = {
    '問診': L('{m}は問診票をめくった。「＠{m}＠最近、疲れが溜まる場所は？」「＠{m}＠…眠りは浅いほうですか」「＠{m}＠では、最後に、最近いつ…いえ、何でもありません」|問診票の最後の欄には「敏感な部位（複数回答可）」と書かれていた。{a}は首をかしげながら「特になし」に丸をつけた。|{m}は{a}の手首を取って脈を測った。「＠{m}＠緊張していますね。大丈夫、すぐにほぐれますよ」'),
    '肩': L('{m}の指が{a}の肩甲骨の縁に沈んだ。「＠{m}＠かなり凝ってますね」――ここまでは、普通のマッサージだった。|首筋をなぞる指が、思いのほか優しかった。{a}は思わず深い息を吐いた。|{m}は温めたタオルを{a}の首に当て、耳の後ろのつぼをゆっくり押した。'),
    '背中': L('{m}「服、少し失礼しますね」背中の留め具が外された。「＠{m}＠オイルが付くといけないので」|背骨に沿って、温かいオイルが一筋垂らされた。{m}の手のひらが、それを脇腹まで塗り広げた。|{m}の指が背中を下から上へ、何度も往復した。往復するたびに、脇腹に触れる範囲が少しずつ広がっていく。'),
    '腰': L('{m}「腰、だいぶ張ってますね」と言いながら、親指がタオルの縁の下へ潜り込んだ。|{m}は{a}の腰に体重をかけ、ゆっくりと円を描いた。手のひらの位置が、少しずつ下がっていく。|腰骨の内側を押されて、{a}の体がびくりと跳ねた。{m}「ここ、効きますよね」'),
    '脚': L('{m}「脚のむくみ、かなり溜まってますね」足首から膝の裏へ、手のひらがゆっくり滑っていった。思っていたより、上のほうまで。|{m}の手が、足首から膝の上まで何度も往復した。往復するたびに、手の止まる位置が少しずつ上がっていく。|{m}「この辺りのリンパ、しっかり流しておきますね」――{a}はそれが医学用語なのか、言い訳なのか判断がつかなかった。'),
    '臀部': L('{m}「骨盤まわりが凝り固まってます。座り仕事、多いでしょう」腰の下のほうを、手のひらが大きく押し回した。|{m}「ここは骨盤の歪みに直結するので」――そう言われると、拒む理由が見つからなかった。|オイルを足した{m}の手が、腰骨の下をゆっくりなぞった。タオルが少しずつずれていくのを、{a}は気にしないふりをした。'),
    '胸元': L('{m}「では仰向けに。首まわりのリンパを流します」鎖骨をなぞった指が、そこで止まらずに少しだけ下へ滑った。|{m}「呼吸が浅いですね。胸まわりの筋肉も、呼吸に関わるので」――タオル越しに置かれた手のひらが、やけに温かかった。|{m}は{a}の鎖骨の下に親指を当て、ゆっくりと円を描いた。「＠{m}＠ここ、かなり張ってますね」――{a}は天井の一点を見つめた。'),
    '下腹': L('{m}「下腹は冷えが溜まりやすいんです」温かい手のひらが、へその下でゆっくりと円を描いた。|{m}「ここをほぐすと、全身の巡りがよくなります」――{m}の手は、タオルの縁ぎりぎりのところで止まっていた。|おなかの上で、{m}の手がゆっくり往復した。{a}は、自分の鼓動がやけに大きく聞こえる気がした。'),
    '特別': L('{m}は声を落とした。「＠{m}＠ここからは、特別な施術になります。……力を抜いてください」――照明が、ふっと一段暗くなった。|{m}はタオルを畳み直して、静かに言った。「＠{m}＠目を閉じていてくださいね」――{a}は、言われた通りにした。'),
    '仕上げ': L('{m}「仕上げです」――そこから先、{m}の手がどこにあったのか、{a}はよく覚えていない。|{m}は{a}の耳元で囁いた。「＠{m}＠最後まで、全部ほぐしておきますね」――{a}は、頷くことしかできなかった。')
  };
  /* 際どい段の施術の文（R18版）。全年齢版は上の穏やかな文のまま */
  /* r18:begin */
  ACT['脚'] = L('{m}「脚の付け根にリンパ節があるんです。ここを流さないと、むくみが取れなくて」指が内腿を、際どいところまで滑り上がった。|内腿を揉みほぐす手が、膝から付け根まで何度も往復した。往復のたびに、ほんの少しずつ奥へ。|{m}「鼠径部、しっかり流しておきますね」――{a}はそれが医学用語なのか、言い訳なのか判断がつかなかった。');
  ACT['臀部'] = L('{m}「大臀筋が凝り固まってます。座り仕事、多いでしょう」手のひらが{尻}を大きく掴んで、揉みしだいた。|{尻}の丸みに沿ってオイルが塗られ、親指がその谷間すれすれを押し上げた。|{m}「ここは骨盤の歪みに直結するので」――そう言われると、拒む理由が見つからなかった。');
  ACT['胸元'] = L('{m}「では仰向けに。デコルテのリンパを流します」鎖骨から下へ滑った手が、胸の膨らみの縁を何度もなぞった。|{m}「胸の周りの筋肉も、呼吸に関わるので」手のひらが、胸全体を包み込むように回った。|タオルが胸元までずらされた。{m}「ここ、硬くなってますね。…血行の問題です」');
  ACT['下腹'] = L('{m}「下腹は冷えが溜まりやすいんです」温かい手のひらが、へその下でゆっくりと円を描いた。|指先が下腹の奥を探るように押し込まれた。そこを押されると、なぜか体の芯がきゅっと縮んだ。|{m}「ここをほぐすと、全身の巡りがよくなります」――手は、どんどん下へ降りていった。');
  ACT['特別'] = L('{m}は声を落とした。「＠{m}＠ここからは、特別な施術になります。…力を抜いてください」タオルが、完全に取り払われた。|{m}「体の内側の凝りをほぐします」――もう、それはどう考えてもマッサージではなかった。|{m}の指が、誰にも触れさせたことのない場所に、当たり前のように触れた。「＠{m}＠力を抜いて。深呼吸｜力を抜け。深呼吸だ｜力を抜いてください。深呼吸です」');
  ACT['仕上げ'] = L('{m}「仕上げです」――指の動きが、明らかに目的を持ったものに変わった。|{m}は{a}の耳元で囁いた。「＠{m}＠最後まで、全部ほぐしておきますね」|施術台がきしんだ。{m}の手は、{a}がどこで一番声を上げるか、もう全部知っていた。');
  /* r18:end */

  /* 気づいた瞬間 */
  var NOTICE = {
    proud: L('{a}は跳ね起きた。「…おい。これ、マッサージじゃないだろ」|{a}は{m}の手首を掴んだ。「どこ触ってる」|{a}は身を起こし、タオルを肩に引っかけた。「説明しろ。今の手は、どこのリンパだ」'),
    stern: L('{a}は静かに目を開けた。「施術内容について、説明を求めます」|{a}は体を起こしてタオルを掴み直した。「これは、明らかに範囲を超えていますね」|{a}は静かに手を上げ、施術を止めさせた。「一度、確認させてください。今のは何の手技ですか」'),
    tsun: L('{a}「ちょ、ちょっと！今のわざとでしょ！」顔が真っ赤だった。|{a}「べ、別に気持ちよくなんかないけど！今のは絶対おかしい！」|{a}「ねえ！　今の、絶対わざとだよね！？」――耳まで真っ赤だった。'),
    gentle: L('{a}は少し困った顔で、首をかしげた。「あの…これって、本当にマッサージですか？」|{a}「ええと…ごめんなさい、ちょっと確認なんですけど…今のは？」|{a}は首をかしげて、{m}を見上げた。「ねえ、今のって……マッサージの続き、なのよね？」'),
    devoted: L('{a}は唇を噛んで、それでも勇気を出して言った。「あの…今の、普通じゃない…ですよね…？」|{a}は震える声で訊いた。「これも…施術の、一部なんですか…？」|{a}は勇気を振り絞るように、小さく手を挙げた。「あ、あの……質問しても、いいですか……？」'),
    cool: L('{a}は天井を見たまま言った。「リンパ節の位置、そこじゃないですよね」|{a}「この三分間、筋肉に関係のない部位しか触っていませんね」|{a}は目を開けて、淡々と言った。「今の手の位置、施術の説明と合っていませんね」'),
    free: L('{a}「えっ、待って待って、今のマッサージ？絶対違うよね！？」|{a}は吹き出した。「いやいやいや、さすがに無理あるでしょ、それ」|{a}は顔だけ振り返った。「ちょっとちょっと、今のどこ触ったの？　さすがにバレるって」'),
    shy: L('{a}はタオルの端をぎゅっと握った。「あ、あの…そこは…」声が消え入りそうだった。|{a}は真っ赤になって固まった。「こ、これって…ふ、普通なんですか…？」|{a}は体を縮めて、震える声で言った。「い、今の……ま、間違い、ですよね……？」')
  };
  NOTICE.polite = L('{a}は体を起こし、丁寧に尋ねた。「恐れ入りますが、ただいまの施術について、ご説明いただけますか」|{a}「あの……大変申し上げにくいのですが、そちらは施術の範囲外ではないでしょうか」|{a}は姿勢を正して、丁寧に一礼した。「念のため伺います。ただいまの施術は、コースに含まれておりますか」');
  var EXCUSE = L('{m}「よくあるご質問です。ここのリンパは、全身の巡りの要なんですよ」|{m}「皆さん最初は驚かれるんです。でも、効果は保証しますから」|{m}「血行が良くなると、どうしてもそういう感覚になるんです。体が正常に反応している証拠ですよ」|{m}「くすぐったく感じるのは、凝りがほぐれ始めたサインです」|{m}「当店独自のメソッドでして。お客様の体は、ちゃんと応えていますよ」');
  var DECEIVED = {
    proud: L('{a}は「…そういうもんか」と不機嫌そうに横になり直した。|{a}は鼻を鳴らした。「次に変なことしたら、本当に帰るからな」――そう言いながら、また枕に顔を戻した。|{a}は「……ちっ。紛らわしい手つきしやがって」と吐き捨てて、うつ伏せに戻った。'),
    stern: L('{a}は少し考えてから「専門家がそう言うなら」と姿勢を戻した。|{a}は「……承知しました。続けてください」と短く答え、もう一度目を閉じた。|{a}は説明を頭の中で反芻し、矛盾がないことを確かめてから、黙って横になった。'),
    tsun: L('{a}「…ほ、本当でしょうね？」そう言いながら、{a}は大人しく横になった。|{a}「べ、別に疑ってたわけじゃないし！」――言い訳しながら、{a}はタオルを引き上げて横になった。|{a}「……ふ、ふーん。なら、いいけど」{a}はぷいと顔を背けて、また施術台に伏せた。'),
    gentle: L('{a}は「まあ、そうなんですね。失礼しました」と微笑んで、また目を閉じた。|{a}は「あら、ごめんなさいね。早とちりしちゃった」と頬に手を当て、ふたたび力を抜いた。|{a}は「プロの方が言うなら、そうなのね」とうなずいて、穏やかに横になり直した。'),
    devoted: L('{a}は「ご、ごめんなさい、疑って…」と謝って、体の力を抜いた。|{a}は「そ、そうですよね、わたしが変に考えすぎで……」と真っ赤になって、また横になった。|{a}は何度も頭を下げた。「失礼なこと言って、本当にすみません。続けてください」'),
    cool: L('{a}は「…理屈は通っていますね」と呟いて、横になり直した。|{a}は「……一応、筋は通っています」とだけ言って、また天井に目を戻した。|{a}は「反証する材料がありませんね」と淡々と言い、姿勢を戻した。'),
    free: L('{a}は「へえー、そうなんだ！」とあっさり納得した。|{a}は「なーんだ、びっくりした！」と笑って、ごろんと横になり直した。|{a}は「マッサージって奥が深いんだねー」と感心して、また目を閉じた。'),
    shy: L('{a}は「す、すみません…私が変なのかも…」と縮こまって、また横になった。|{a}は「そ、そういうもの、なんですね……」と消え入りそうな声で言って、枕に顔を埋めた。|{a}は耳まで赤くして、こくこくと頷いた。それ以上、何も訊けなかった。')
  };
  DECEIVED.polite = L('{a}は「そうでしたか。不勉強で失礼いたしました」と頭を下げ、また横になった。|{a}は「大変失礼いたしました。どうぞ、お続けください」と、丁寧に詫びて目を閉じた。|{a}は「ご説明、ありがとうございます」と律儀に礼を言ってから、姿勢を戻した。');
  var LEAVE = L('{a}は施術台から降りて、黙って服を着た。「お代は、払わない｜＝｜お代は、払いません」|{a}は「帰る｜＝｜帰ります」とだけ言い、タオルを巻いたまま更衣室へ向かった。|{a}は会計で口コミサイトの名前を口にした。店長の顔色が変わった。');
  var STAY = L('{a}は少し黙ってから、また横になった。「…続けて。ただし、余計なことはしないで｜…続けろ。ただし、余計なことはするな｜…続けてください。ただし、余計なことはしないでください」|{a}は分かっていて、目を閉じた。「…今日だけ、だから｜…今日だけだ｜…今日だけ、ですから」|{a}は{m}の顔を見上げて、何も言わなかった。それが答えだった。');
  var SECRET = L('{a}は気づかないふりをした。耳だけが真っ赤だった。|{a}は何か言いかけて、やめた。恥ずかしくて、言葉にできなかった。|{a}は枕に顔を埋めて、声を殺した。');

  /* 快楽に負けたあとの体位（{ n: 名前, t: 文 }）。全年齢版は暗転して何回姿勢を変えたかだけを数えるので、文のない枠だけ（数はR18版と同じ）。
     R18版は下の r18 のかたまりで差し替える */
  function posSlots(k) { var a = []; for (var i = 0; i < k; i++) a.push({ n: '姿勢' + (i + 1), t: '' }); return a; }
  var POS = posSlots(8), POS_TOP = posSlots(6), POS_TOP_F = posSlots(5), POS_TOP_FF = posSlots(5), POS_FF = posSlots(9);
  /* r18:begin */
  /* 快楽に負けたあと：体位を指定される */
  POS = [
    { n: '正常位', t: '{m}「では、仰向けのまま、脚を開いてください」――{a}は言われるままに、施術台の上で脚を開いた。' },
    { n: '後背位', t: '{m}「四つん這いになって、腰を上げて」――{a}は施術台に手をつき、言われた通りに腰を突き出した。' },
    { n: '騎乗位', t: '{m}が施術台に横になった。「＠{m}＠今度は、{a}さんが上に」――{a}はためらいながら、その上に跨った。' },
    { n: '対面座位', t: '{m}は{a}を抱き起こし、向かい合って膝の上に座らせた。「＠{m}＠首に腕を回して」' },
    { n: '寝バック', t: '{m}「うつ伏せのまま、力を抜いて」――{a}は枕に顔を埋めたまま、背中に重みを感じた。' },
    { n: '側位', t: '{m}は{a}を横向きに寝かせ、後ろから抱きすくめた。「＠{m}＠片脚だけ、上げて」' },
    { n: '立ちバック', t: '{m}「施術台に手をついて、立ったままで」――{a}は膝を震わせながら、言われた姿勢をとった。' },
    { n: '背面座位', t: '{m}は{a}を後ろ向きに膝の上へ座らせた。「＠{m}＠鏡、見てください」――正面の鏡に、知らない顔の自分が映っていた。' }
  ];

  /* 受け攻めの指定で、客（{a}）が攻めのとき */
  POS_TOP = [
    { n: '正常位', t: '{a}は{m}を施術台に仰向けにさせ、脚を開かせた。「＠{a}＠今度は、こっちの番だ｜今度は、こちらの番だ｜今度は、こちらの番です」――{a}は{m}の中へ、ゆっくりと入っていった。' },
    { n: '後背位', t: '{m}は施術台に手をつき、腰を上げた。「＠{m}＠後ろから、どうぞ」――{a}は{m}の腰を掴み、奥まで沈めた。' },
    { n: '騎乗位', t: '{a}は施術台に横になり、{m}の腰を掴んで自分の上に跨がらせた。「＠{a}＠動いていいのは、言われたときだけ｜動いていいのは、言われたときだけだ｜動いていいのは、言われたときだけです」――{a}は下から{m}を突き上げ、{m}の腰が逃げるたびに引き戻した。' },
    { n: '対面座位', t: '{m}は施術台に腰かけた{a}と向かい合い、膝の上に座って、ゆっくりと腰を落とした。「＠{m}＠首に腕を回しても、いいですか」' },
    { n: '立ちバック', t: '{a}は{m}を施術台に手をつかせ、後ろに立った。「＠{a}＠さっきの『力を抜いて』、そのまま返す｜＝｜さっきの『力を抜いて』、そのままお返しします」――{a}は{m}の腰を掴み、後ろから{m}を貫いた。' },
    { n: '側位', t: '{m}は施術台に横向きになり、片脚を上げた。「＠{m}＠この角度だと、楽ですよ」――{a}は{m}を後ろから抱きすくめ、そのまま繋がった。' }
  ];
  /* 客（{a}）が攻めの女性で、施術者が男性のとき（立場逆転のあと） */
  POS_TOP_F = [
    { n: '騎乗位', t: '{a}は{m}を施術台に仰向けにさせ、その腰に跨った。「＠{a}＠動かないで。ペースは、こっちが決める｜動くな。ペースは、こちらが決める｜動かないでください。ペースは、こちらが決めます」――{a}は見下ろしたまま、自分の好きな深さと速さで腰を揺らした。' },
    { n: '手で', t: '{a}は{m}を施術台に座らせ、オイルを手に取った。「＠{a}＠さっきのお返し｜さっきのお返しだ｜さっきのお返しです」――{a}の手が、{m}の{男性器}をゆっくりと扱き上げた。{m}は何度も施術台の縁を掴み直した。' },
    { n: '対面座位', t: '{a}は施術台に腰かけた{m}の膝に跨り、両肩を押さえつけた。「＠{a}＠手は後ろ。触っていいとは言ってない｜手は後ろだ。触っていいとは言っていない｜手は後ろです。触っていいとは言っていません」――{a}は自分のペースで動き、{m}の息が上がっていくのを見下ろしていた。' },
    { n: '背面騎乗', t: '{a}は{m}に背を向けて跨り、ゆっくりと腰を落とした。「＠{a}＠手は、施術台の上｜手は、施術台の上だ｜手は、施術台の上です」――{m}が言われたとおりにすると、{a}は前後に腰を滑らせ始めた。' },
    { n: '焦らし', t: '{a}は{m}の上に跨ったまま、腰を浮かせては止めた。「＠{a}＠さっき、何回『もう少し』って言われたっけ｜さっき、何回『もう少し』と言われたか｜さっき、何回『もう少し』と言われましたか」――{m}は答えられずに、施術台の縁を握りしめた。' }
  ];
  /* 女性どうし（女性セラピストと女性の客）。マッサージの器具は使ってよい */
  POS_TOP_FF = [
    { n: '指で', t: '{a}は{m}を施術台に仰向けにさせ、オイルで濡れた指を二本、{m}の脚のあいだにゆっくりと沈めた。「＠{a}＠さっきの『特別な施術』、こうでしょ？｜さっきの『特別な施術』、こうだろう？｜さっきの『特別な施術』、こうですよね？」――{m}の囁き声が、上ずった。' },
    { n: '器具で', t: '{a}は棚から施術用のハンディマッサージャーを取り、スイッチを入れた。「＠{a}＠本来は肩用、だっけ｜本来は肩用、だったか｜本来は肩用、でしたよね」――振動する先端を押し当てられて、{m}は施術台の上で背中を反らせた。' },
    { n: '脚を絡めて', t: '{a}は{m}の脚を開かせて自分の脚と交差させ、オイルで濡れた熱いところ同士を押しつけた。腰を揺らすのは{a}だけだった。{m}は施術台の縁を握りしめていた。' },
    { n: '口で', t: '{a}は{m}を施術台の端に座らせ、その脚のあいだに顔を寄せた。「＠{a}＠力を抜いて。深呼吸｜力を抜け。深呼吸だ｜力を抜いてください。深呼吸です」――さっき言われた台詞を返しながら、{a}は舌でゆっくりと{m}を追い詰めた。' },
    { n: '胸と指で', t: '{a}は{m}を後ろから抱きすくめ、オイルで濡れた手で胸を包んだ。「＠{a}＠さっきのお返し、全部ね｜さっきのお返しを、全部する｜さっきのお返しを、全部します」――もう片方の手が脚のあいだに滑り込むと、{m}の背中が{a}にもたれかかった。' }
  ];
  POS_FF = [
    { n: '仰向け', t: '{m}「仰向けのまま、脚を開いてください」――{m}は{a}の脚のあいだに膝をつき、オイルで濡れた指を、ゆっくりと二本沈めた。' },
    { n: '四つん這い', t: '{m}「四つん這いになって、腰を上げて」――{m}は後ろから{a}の腰を抱え、指先で中のざらついたところを探り当てた。' },
    { n: '脚を絡めて', t: '{m}は施術台に上がり、{a}と脚を交差させた。「＠{m}＠今度は、わたしも一緒に」――オイルで濡れた肌と肌が、一番熱いところで擦れ合った。' },
    { n: '対面座位', t: '{m}は{a}を抱き起こし、向かい合って膝の上に座らせた。「＠{m}＠首に腕を回して」――胸と胸が重なり、{m}の指が{a}の脚のあいだで動き始めた。' },
    { n: 'うつ伏せ', t: '{m}「うつ伏せのまま、力を抜いて」――{m}は{a}の背中に胸を重ね、後ろから回した指で、{a}の一番敏感なところを転がした。' },
    { n: '側位', t: '{m}は{a}を横向きに寝かせ、後ろから抱きすくめた。「＠{m}＠片脚だけ、上げて」――首筋に唇が、脚のあいだに指が、同時に届いた。' },
    { n: '器具', t: '{m}は施術用のハンディマッサージャーを手に取った。「＠{m}＠本来は肩用なんですけど」――振動する先端が、{a}の一番敏感なところに押し当てられた。' },
    { n: '背面座位', t: '{m}は{a}を後ろ向きに膝の上へ座らせた。「＠{m}＠鏡、見てください」――鏡の中で、{m}の指が{a}の脚のあいだに沈んでいくのが見えた。' },
    { n: '口で', t: '{m}は{a}を施術台の端に座らせ、自分は床に膝をついた。「＠{m}＠最後は、口で流しますね」――温かい舌が、{a}の脚のあいだをゆっくりと舐め上げた。' }
  ];
  /* r18:end */

  /* 一回の結果の中で同じ文を繰り返さない（まだ使っていない文から選び、使い切ったら、いちばん前に使ったものから戻す）。
     run の間だけ K.pick をこれに差し替える（K.tail・K.climax の反応や喘ぎにも効く）。
     借りてきた反応の表（迷宮の罠の反応など）のうち、店に合わない言葉の入った文は、ほかに候補があれば使わない */
  var OFF = /迷宮|魔物|装備|武器|罠|先へ進|次の部屋|床を転げ|壁を殴|壁に背|壁に打ち|壁の方/;
  function freshPick(S, arr) {
    if (!arr || !arr.length) return '';
    var a = arr.filter(function (x) { return typeof x !== 'string' || !OFF.test(x); });
    if (!a.length) a = arr;
    var u = S._fu || (S._fu = []), free = a.filter(function (x) { return u.indexOf(x) < 0; }), t;
    if (free.length) t = free[S.rng.int(free.length)];
    else { var bi = Infinity; a.forEach(function (x) { var j = u.indexOf(x); if (j < bi) { bi = j; t = x; } }); }
    var k = u.indexOf(t); if (k >= 0) u.splice(k, 1);
    u.push(t);
    return t;
  }
  /* 絶頂の文：共通の表（DG.CLIMAX）は一段に三つしかなく、堕ちたあと何度も達すると同じ文が続くので、店の文（M.CLIMAX）を足した表を run の間だけ使う */
  var CLX = null, CLX_SRC = null;
  function climaxTable() {
    var DG = HK.DG, MC = HK.MassageMore && HK.MassageMore.CLIMAX;
    if (!DG || !DG.CLIMAX || !MC) return null;
    if (CLX && CLX_SRC === DG.CLIMAX) return CLX;
    var X = {};
    Object.keys(DG.CLIMAX).forEach(function (p) {
      X[p] = DG.CLIMAX[p].map(function (l, i) { var add = MC[p] && MC[p][i]; return add && add.length ? l.concat(add) : l; });
    });
    CLX_SRC = DG.CLIMAX;
    return (CLX = X);
  }
  function withFresh(f) {
    var kp = K.pick, DG = HK.DG, dc = DG && DG.CLIMAX, cx = climaxTable();
    K.pick = freshPick; if (cx) DG.CLIMAX = cx;
    try { return f(); } finally { K.pick = kp; if (cx) DG.CLIMAX = dc; }
  }

  HK.SCENARIOS.massage = {
    id: 'massage', name: 'これって本当にマッサージですか？', kicker: '1〜2人・R18', solo: true, maxCast: 2, minCast: 1,
    desc: '評判のマッサージ店。施術は少しずつ際どくなる。いつ気づくか、言い訳に騙されるか、快楽に負けるか。※成人キャラクター向け',
    castHint: '1〜2人。1人のときは、施術者は店のスタッフ（モブ）です。2人のときは「施術者」の設定で、住人の一人が施術者になる（もう一人が客）か、二人とも客になってカーテン越しの隣の施術台で受けるかが決まります（おまかせはモブ＝カーテン越し）。住人どうしの施術は、体の関係になれる組だけ際どくなり、なれない組は普通のマッサージのままです。',
    unit: '施術', simulate: function (input) { return withFresh(function () { return play(input); }); },
    derived: ['caution', 'cold', 'honesty', 'impulse'],
    env: [
      { id: 'course', label: 'コース', type: 'select', def: 'oil', options: [{ v: 'normal', label: '整体（60分）' }, { v: 'oil', label: 'アロマオイル（90分）' }, { v: 'lymph', label: '全身リンパ（120分）' }, { v: 'special', label: '「特別コース」（90分）' }] },
      { id: 'staff', label: '店のスタッフ（モブの施術者）', type: 'select', def: 'gentle', options: Object.keys(STAFF).map(function (k) { return { v: k, label: STAFF[k].n + '（' + STAFF[k].desc + '）' }; }) },
      { id: 'shady', label: '店の怪しさ', min: 0, max: 100, def: 60, lo: '健全そう', hi: '看板からして怪しい', desc: '高いほど施術が早く際どくなり、気づかれやすくもなる' },
      { id: 'harsh', label: '施術の過激さ', min: 0, max: 100, def: 55, lo: 'ぎりぎり整体', hi: '隠す気がない' }
      ,{ id: 'desc', label: '行為の描写', type: 'select', def: 'full', options: [{ v: 'full', label: '描写する' }, { v: 'dark', label: '軽め（暗転して回数だけ）' }], desc: '軽めにすると、快楽に負けたあとの行為は暗転し、体位の数と回数だけが分かる' }
    ],
    stats: [
      { id: 'sense', label: '感じやすさ', desc: '高いほど快感が溜まりやすい' },
      { id: 'exp', label: '経験', desc: '高いほど「普通じゃない」に気づきやすく、快楽にも慣れている' }
    ],
    actions: [
      { id: 'relax', label: '全部お任せでリラックス', fit: function (t) { return t.ac * 0.5 + t.warmth * 0.3; } },
      { id: 'chat', label: '施術者と世間話をする', fit: function (t) { return t.warmth * 0.6 + t.fc * 0.3; } },
      { id: 'watch', label: '施術の手順を観察する', fit: function (t) { return t.a * 0.6 + t.caution * 0.4; } },
      { id: 'endure', label: '声を出さずに耐える', fit: function (t) { return t.cp * 0.5 + t.ac * 0.3; } },
      { id: 'enjoy', label: '気持ちよさに身を委ねる', fit: function (t) { return t.fc * 0.6 + t.impulse * 0.3; } }
    ],
    goals: [
      { id: 'heal', label: '肩こりを治したい', fit: function (t) { return t.a * 0.4 + t.ac * 0.3; } },
      { id: 'free', label: 'タダ券があったから来た', fit: function (t) { return t.fc * 0.5 + t.cold * 0.3; } },
      { id: 'suspect', label: '噂の店を確かめに来た', fit: function (t) { return t.cp * 0.5 + t.a * 0.4; } },
      { id: 'polite', label: '失礼のないようにする', fit: function (t) { return t.ac * 0.7 + t.np * 0.2; } },
      { id: 'secret', label: '本当は少し期待している', fit: function (t) { return t.fc * 0.5 + t.honesty * 0.2 + t.ac * 0.2; } }
    ],
    steps: function () { return []; }
  };
  /* 役割「施術者」（mob.js の HK.Roles）：おまかせ＝モブ（店のスタッフ）。住人の欄で「施術者になる」を選んだ人がいれば、その人 */
  if (HK.Roles) HK.Roles.install(HK.SCENARIOS.massage, 'therapist', '施術者', {
    auto: 'mob', yes: '施術者になる', envBefore: 'staff',
    fit: function (c) { var t = c.tr || {}; return 0.3 + (t.cp || 0) * 0.3 + (t.fc || 0) * 0.3 + (t.aggr || 0) * 0.3; },
    desc: '施術者を住人がやるか、店のスタッフ（モブ）がやるかを選びます。住人が施術者なら、もう一人の住人が客になります。モブなら、2人とも客になってカーテン越しの隣の施術台で受けます。住人の欄で「施術者になる」を選んだ人が優先されます（住人が1人のときは、いつもモブ）'
  });

  /* 配役（solo-massage-cast.js）：住人1人＝モブの施術者／住人が施術者／2人とも客（カーテン越し） */
  function play(input) {
    var MC = HK.MassageCast, c = MC ? MC.cast(input) : { mode: 'mob' };
    if (c.mode === 'res') return run(input, { ci: c.ci[0], T: c.T, CR: c.CR, picked: c.picked });
    if (c.mode === 'curtain') {
      var st0 = (input.env && input.env.staff) || 'gentle', rng = HK.rng((((input.seed || 1) * 977) + 3) >>> 0);
      var ks = Object.keys(STAFF).filter(function (k) { return k !== 'duo' && k !== st0; });
      /* カーテン越しの二人は、使った文の覚えを分け合う（並んだ二つの施術で同じ文が続かないように） */
      var share = {};
      var a = run(input, { ci: 0, other: input.chars[1].name, share: share });
      var b = run(input, { ci: 1, seedAdd: 7919, staff: ks[rng.int(ks.length)], other: input.chars[0].name, share: share });
      return MC.merge(input, a, b, rng);
    }
    return run(input);
  }

  /* o：{ ci: 客の番号, T: 住人の施術者（solo-massage-cast.js の写し）, CR: 客の写し, staff: モブの型, seedAdd, other: カーテンの向こうの人 } */
  function run(input, o) {
    o = o || {};
    var S = K.state(input, 'massage');
    if (o.ci || o.seedAdd) {
      if (o.seedAdd) S.rng = HK.rng((((input.seed || 1) + o.seedAdd) >>> 0) || 1);
      S.h = K.hero(S, input.chars[o.ci || 0], (input.perChar && input.perChar[o.ci || 0]) || {}); S.party = [S.h];
    }
    if (o.share) { S._fu = o.share.fu = o.share.fu || []; S._lwShare = o.share.lw = o.share.lw || []; }
    var h = S.h, rng = S.rng, env = S.env;
    h.i = o.ci || 0;
    /* 施術者：住人（TR）なら、気質から店の施術者の型（sk）に当てる（一言・言い訳の通りやすさ）。モブなら設定の型 */
    var MC = HK.MassageCast, TR = o.T || null, CR = o.CR || null;
    var sk = TR ? MC.STAFF_OF[TR.persona] || 'gentle' : STAFF[o.staff] ? o.staff : env.staff;
    if (TR && sk === 'gentle' && HK.Pos && HK.Pos.isF(TR)) sk = 'lady';
    if (!STAFF[sk]) sk = 'gentle';
    var staff = TR ? { n: TR.name, g: HK.Pos ? (HK.Pos.isF(TR) ? 'f' : 'm') : TR.gender === 'f' ? 'f' : 'm', desc: '', dec: STAFF[sk].dec, res: true } : STAFF[sk];
    /* {you}：客から施術者への呼びかけ。モブなら印（mob.js の HK.Mob.addr。台詞では客の二人称になる）、住人なら「あなた」（相手ごとの二人称が効く） */
    S.vars = { m: staff.n, you: TR || !HK.Mob ? 'あなた' : HK.Mob.addr(staff.n, 'さん') };
    /* 住人どうし：体の関係になれる組（HK.Pos.okSex・両方 HK.State.r18ok・HK.ngPair でも HK.sexBlocked でもない）だけ際どい施術にする。
       向きは HK.Pos.order：施術者が攻めなら今までどおり、客が攻めなら際どい施術の手前で客が手を止めさせる（客を受ける側にしない）。
       なれない組は普通のマッサージのまま（plain） */
    var pairWhy = TR ? MC.pairWhy(TR, CR, input.ties) : '', pairOK = !!TR && !pairWhy, pairFix = TR && pairWhy && MC.pairFix || '';
    /* モブの施術者で、客が性行為の相手を「固定した相手だけ」にしている（モブとの場面に出ない：engine.js の noMob）：普通のマッサージのまま */
    var mobNG = !TR && !HK.SAFE_ON && !!h.noMob;
    /* その理由の書き方（R18版だけ。全年齢では mobNG にならない）：[来店の理由, 結末の理由の札, 結末の説明] */
    var mobNgW = ['', '', ''];
    /* r18:begin */
    mobNgW = ['性行為の相手を「固定した相手だけ」にしているので、モブの施術者とは際どい施術にならず、普通のマッサージのまま', '性行為の相手を固定した相手だけにしている', 'は性行為の相手を「固定した相手だけ」にしているので、最後まで普通のマッサージだった。'];
    /* r18:end */
    var tTop = !pairOK || HK.Pos.order(TR, CR, [TR, CR])[0] === TR, plain = (!!TR && !pairOK) || mobNG;
    /* 受け攻め：自分で攻めを選んだ客は、施術者に「される」側に回らない。際どくなった時点で手を止めさせ、帰るか、立場を入れ替える */
    var hardTop = TR ? pairOK && !tTop : !!(HK.Pos && HK.Pos.hardTopNpc(h));
    function cTop() { return TR ? !tTop : !!(HK.Pos && HK.Pos.vsNpc(h, '') === 'top'); }
    /* 客の体に竿がないか（性器を決めた人は性器から。HK.Pos.hasM。決めていなければ性別どおり） */
    var noP = function (c) { return HK.Pos && HK.Pos.genSet && HK.Pos.genSet(c) ? !HK.Pos.hasM(c) : c.gender === 'f'; };
    /* 女性どうし（女性セラピストと竿のない客）：いちもつを前提にした描写を使わない */
    var ff = noP(h) && staff.g === 'f';
    /* ふたなり（HK.Pos.futa。攻め・リバの女性）：施術は女性の客として受け、客が攻めに回る場面だけ男性の体で書く */
    h.futa = !!(input.chars[h.i] && input.chars[h.i].futa);
    var custF = HK.Pos ? HK.Pos.isF(h) : h.gender === 'f', ffTop = ff && custF;
    h.sens = 0.85 + (h.stats.sense - 3) * 0.1;
    var course = env.course;
    var seq = STAGES.slice();
    if (course === 'normal') seq = [STAGES[0], STAGES[1], STAGES[2], STAGES[3], STAGES[4], STAGES[6], STAGES[9]];
    if (course === 'special') seq = [STAGES[0], STAGES[2], STAGES[4], STAGES[5], STAGES[6], STAGES[7], STAGES[8], STAGES[9]];
    if (course === 'lymph') seq = STAGES.slice(0, 8).concat([STAGES[7], STAGES[8], STAGES[9]]);
    S.k = 1.25;
    /* 恋愛対象と違う性別の施術者：際どい施術への抵抗が強い（気づきやすく、騙されにくく、堕ちにくい） */
    var wrong = !TR && (h.likes === 'm' || h.likes === 'f') && staff.g && h.likes !== staff.g;
    var LIKE_L = { m: '男性', f: '女性' }, wrongWhy = wrong ? '恋愛対象は' + LIKE_L[h.likes] + '・施術者は' + (staff.g === 'm' ? '男性' : '女性') : '';
    var wrongShown = 0;
    /* 本人の性別（未指定なら、施術者と同じとみなす） */
    var sx = h.gender === 'f' ? '女' : h.gender === 'm' ? '男' : staff.g === 'f' ? '女' : '男';
    /* 性別が「その他」なら、性別に触れる文は使わない */
    var noSx = h.gender === 'x';
    function fw(arr) { var a2 = noSx ? arr.filter(function (t) { return t.indexOf('{sx}') < 0; }) : arr; return K.fmt(S, K.pick(S, a2.length ? a2 : arr)).replace(/\{sx\}/g, sx); }
    if (wrong) S.k = 1.25 * 0.85;
    S.k *= HK.Dark.f(S, 'fall');   /* 展開の重さ（mood-dial.js）：穏やかほど堕ちが遅い */
    var sus = 0, noticed = false, deceived = 0, stayed = false, left = false, fell = false, asked = false;
    /* 描写を軽めに：快楽に負けたあとは暗転して回数だけ。最中の絶頂は短い一文に */
    /* 描写の有無（lewd-unify.js）：ほのめかす＝軽め（暗転）。設定をそろえる前の入力は「行為の描写」を見る */
    var LWX = HK.Lewd, lcf = LWX && LWX.conf('massage');
    var dark = lcf ? LWX.lv(env) === 'low' : env.desc === 'dark', MD = HK.MassageMore.DARK;
    S.dark = dark;
    var eroOn = !!(lcf && !dark && LWX.ero(env) && HK.Ero && HK.MassageThick && HK.MassageThick.ERO), highOn = !!(lcf && LWX.high(env));
    /* 後半の山場を厚くする段落（solo-massage-lewd.js）。物語とは別の乱数で選ぶ。kindR＝客が受ける組、kindT＝客が主導する組 */
    var ML = !dark && HK.MassageLewd;
    S.lwSeed = input.seed || 1;
    var kindR = ff ? 'ff' : staff.g === 'f' && !noP(h) ? 'lady' : 'recv', kindT = custF ? (staff.g === 'm' ? 'topF' : 'topFF') : 'top';
    function lwc(dom) { return { S: S, h: h, ero: eroOn, dom: dom, fmt: function (t) { return K.fmt(S, t); } }; }
    function lwOn() { return !!(ML && ML.on(S, env)); }
    function logC(list) {
      if (!dark) return K.logClimax(S, list);
      if (!list.length) return;
      var o = K.say(S, { kind: 'climax', tag: K.W_CL, text: K.fmt(S, K.pick(S, MD.climax)) + (list.length > 1 ? '（' + list.length + '回）' : ''), why: h.climax === list.length ? '初めての' + K.W_CL : '' });
      if (!S.flags.firstKey) { S.flags.firstKey = true; K.key(S, o, '最初の' + K.W_CL); }
    }
    var shift = env.shady / 100 * 0.8 + (course === 'special' ? 0.8 : 0);
    var M = HK.MassageMore, sleeping = 0, slept = false, reversed = false, extended = false, hands = 1;
    /* この回に起きるハプニング（2〜3個）を、どの段階で起こすか決めておく */
    var incAt = {};
    var envX = Object.assign({}, env, { staff: sk });
    /* 住人が施術者の回は、研修生（三人目の手）は入らない */
    S.rng.shuffle(M.INCIDENTS.filter(function (x) { return (!x.when || x.when(envX, h)) && (!hardTop || M.TOP_INC.indexOf(x.id) >= 0) && !(TR && x.id === 'trainee'); })).slice(0, 2 + rng.int(2)).forEach(function (x) {
      for (var tries = 0; tries < 8; tries++) { var at = 1 + rng.int(Math.max(1, seq.length - 1)); if (!incAt[at]) { incAt[at] = x; break; } }
    });
    function band(l) { return l < 1.2 ? 0 : l < 2.8 ? 1 : 2; }
    /* 反応の段階（0 こらえる・1 揺らぐ・2 とろける・3 堕ちる）。施術の際どさと堕ち度から決め、一度上がったら下げない。
       上がった施術では、変わり目が分かる一文（M.SHIFT）を足す */
    var ph = 0, DG0 = HK.DG;
    function phUp(bdNow) {
      var sg = K.stage(h), n = Math.max(ph, bdNow >= 1 || sg >= 2 ? 1 : 0, sg >= 3 ? 2 : 0, sg >= 4 ? 3 : 0);
      if (n <= ph) return '';
      ph = n;
      var T = M.SHIFT && (M.SHIFT[h.persona] || M.SHIFT.gentle);
      return T && T[n - 1] ? ' ' + K.fmt(S, K.pick(S, T[n - 1])) : '';
    }
    /* 反応の一文（K.tail と同じ表）。こらえる声（ENDURE）は、こらえる段階のうちだけ。表の段は、今の段階より下げない */
    function tail(p) {
      if (rng() > p) return '';
      var sg = K.stage(h), TL = DG0.TAILS[h.persona] || DG0.TAILS.gentle;
      if (ph === 0 && DG0.ENDURE && DG0.ENDURE[h.persona] && rng() < 0.4) return ' ' + K.fmt(S, K.pick(S, DG0.ENDURE[h.persona]));
      return ' ' + K.fmt(S, K.pick(S, TL[Math.min(TL.length - 1, Math.max(sg, [0, 1, 3, 4][ph]))]));
    }
    function fx(f) {
      if (!f) return;
      if (f.r) h.reason += f.r; if (f.s) sus += f.s; if (f.p) h.pleasure += f.p * h.sens; if (f.c) h.corrupt += f.c * S.k; if (f.sens) h.sens += f.sens;
      if (f.extra) extended = true;
    }

    var introT = TR ? K.fmt(S, K.pick(S, MC.RES_INTRO)) + ' ' + K.fmt(S, K.pick(S, MC.RES_GREET[TR.persona] || MC.RES_GREET.gentle))
      : K.fmt(S, K.pick(S, ['{a}は雑居ビルの三階、「癒しの手」と書かれた扉を押した。受付には{m}が一人。「お待ちしておりました」', '{a}はポイントカードを握りしめて、駅裏のマッサージ店に入った。迎えたのは{m}だった。', '{a}は口コミサイトで星4.8の店を予約した。レビューの八割が「また来ます」だったのが、少しだけ気になった。']));
    var whyP = mobNG ? mobNgW[0] : plain ? '住人どうしの施術（' + pairWhy + '）：際どい施術にはならず、普通のマッサージのまま' + (pairFix ? '。直し方：' + pairFix : '') : '';
    K.say(S, { kind: 'sys', tag: '来店', text: introT, why: '目標：' + h.goal.label + '／' + h.action.label + (TR ? '／施術者は住人の' + TR.name + (o.picked ? '（住人の欄で選んだ）' : '（住人から）') + (plain ? '。' + whyP : hardTop ? '。受け攻めでは客の' + h.name + 'が主導する側' : '') : mobNG ? '／' + whyP : '') });
    K.snap(S, { s: 0 });
    if (plain) return plainRun();
    /* 恋人・番・夫婦・本命・片想いの相手がいる客（R18版だけ。solo-massage-love.js）：施術の段（始まり・最中・堕ちかけ・事後）ごとに、
       その相手を匂わせる台詞を一つずつ（1回の施術で2〜3本まで）。全年齢版・全年齢モードでは出さない */
    var LVM = !HK.SAFE_ON && HK.MassageLove ? HK.MassageLove.setup(S, input, h, o, TR) : null;
    function loveAt(stage) { if (LVM) HK.MassageLove.say(S, LVM, stage); }

    /* 住人どうしで体の関係にならない組・モブとの場面に出ない客：普通のマッサージのまま（施術者の手は、際どいところの手前で止まる）。
       モブの施術者のときは、知り合いを前提にしない文（MC.PLAIN_MOB）を使う */
    function plainRun() {
      var PM = !TR && MC.PLAIN_MOB ? MC.PLAIN_MOB : null;
      MC.PLAIN_SEQ.forEach(function (key, i) {
        S.step = i;
        K.step(S, (i + 1) + '. ' + MC.PLAIN_LABEL[key]);
        K.say(S, { kind: 'ev', tag: key, text: K.fmt(S, K.pick(S, PM && PM.act[key] ? PM.act[key] : MC.PLAIN_ACT[key])) + (rng() < 0.5 ? ' ' + K.fmt(S, K.pick(S, M.REACT[h.persona][0])) : ''), why: '' });
        if (key === '脚' && rng() < 0.65) { var oa = K.say(S, { kind: 'ev', tag: 'ぎりぎり', text: K.fmt(S, K.pick(S, PM ? PM.almost : MC.PLAIN_ALMOST)), why: whyP }); K.key(S, oa, '施術者の手が手前で止まった'); }
        if (rng() < 0.4) K.say(S, { kind: 'ev', tag: '施術者', text: K.fmt(S, K.pick(S, rng() < 0.6 ? (PM ? PM.talk : MC.PLAIN_TALK) : TR && MC.resTalk ? MC.resTalk(sk, 0) : M.STAFF_TALK[sk][0])), why: '' });
        var AB = M.ACT[h.action.id];
        if (AB && rng() < 0.35) K.say(S, { kind: 'ev', tag: h.action.label, text: K.fmt(S, K.pick(S, AB.t[0])), why: '方針「' + h.action.label + '」' });
        h.reason = clamp(h.reason + 1, 0, 100);
        K.snap(S, { s: 0 });
      });
      var E = { type: 'ok', kind: 'ok', title: 'ただのマッサージだった ― ' + staff.n + 'の腕は本物', lines: [] };
      E.lines.push(K.fmt(S, K.pick(S, PM ? PM.end : MC.PLAIN_END)), K.fmt(S, K.pick(S, PM ? PM.end : MC.PLAIN_END)));
      if (h.goal.id === 'heal') E.lines.push(h.name + 'の肩こりは、本当にきれいに治っていた。');
      if (h.goal.id === 'suspect') E.lines.push('噂の店は、少なくとも' + staff.n + 'の施術に限っては、まっとうな店だった。');
      var plainWhy = mobNG ? mobNgW[1] : pairWhy;
      return done(K.finish(S, input, E, [mobNG ? 'モブの施術者で、' + h.name + mobNgW[2] : '住人どうしの施術で、体の関係にならない組（' + pairWhy + '）なので、最後まで普通のマッサージだった。'], { meta: staff.n + (TR ? '（住人）' : '') + '・' + ({ normal: '整体', oil: 'アロマオイル', lymph: '全身リンパ', special: '特別コース' })[course] + 'コース', estats: [['施術者', staff.n], ['施術', '普通のマッサージ'], ['理由', plainWhy]].concat(!mobNG && pairFix ? [['直し方', pairFix]] : []), label3: '施術' }));
    }
    /* 結果の仕上げ：客の番号、住人の施術者（記録の登場人物・名前の色） */
    function done(res) {
      res.hero.i = h.i; res.staffName = staff.n;
      if (TR) {
        res.heroes = [res.hero, { i: TR.i, name: TR.name, eg: TR.eg, memo: TR.memo, persona: TR.persona, tone: TR.tone, top: HK.egoType(TR.eg).top, action: '（施術者）', goal: '—', stats: {}, dev: {}, curses: [], items: [], climax: 0 }];
        res.chars = input.chars.slice(0, 2).map(function (c, i) { return { name: c.name, i: i }; });
        res.log.forEach(function (e) { if (e.kind !== 'step') e.actors = [h.i, TR.i]; });
        /* 住人の施術者の台詞（店のスタッフ用の敬語1本）を3本の台詞に（solo-massage-cast.js の C.res3） */
        if (MC && MC.res3) res.log.forEach(function (e) { if (e && typeof e.text === 'string') e.text = MC.res3(e.text); });
      }
      return res;
    }

    function posTop() { return noMut(ffTop ? POS_TOP_FF : custF && staff.g === 'm' ? POS_TOP_F : POS_TOP); }
    /* 女性どうしで脚を絡めて熱いところを重ねる（対等に繋がる）書き方は、客がリバのときだけ */
    function noMut(arr) {
      var P = HK.Pos, MU = P && P.MUTUAL_RE;
      if (!ff || !MU || (TR ? P.bothRiba(TR, CR) : P.of && P.of(h) === 'riba')) return arr;
      var o = arr.filter(function (x) { return !MU.test(x.t) && !/擦れ合|脚を交差/.test(x.t); });
      return o.length ? o : arr;
    }
    /* 山場の厚い場面（R18版だけ。HK.MassageThick と HK.ThickVM がないときは null） */
    function thick(top) {
      var MT = HK.MassageThick, TV = HK.ThickVM;
      if (HK.SAFE_ON || !MT || !TV) return null;
      /* 描写の長さ：数行で短く（混ぜるなら半分）なら、段落に分けた場面にしない */
      if (lcf && LWX.short(env, rng)) return null;
      var key = top ? (ffTop ? 'topFF' : custF && staff.g === 'm' ? 'topF' : TV.sad(rng, h, null) ? 'topSad' : 'top')
        : ff ? 'fallFF' : staff.g === 'f' && !noP(h) ? 'fallLady' : 'fall';
      var sc = MT[key] && MT[key].length ? K.pick(S, noMut(MT[key])) : null;
      return sc ? { n: sc.n, t: TV.voice(rng, sc.t, h, h), thick: true } : null;
    }
    /* 立場逆転：客が施術者を押し倒す（top＝自分で攻めを選んだ客が、際どい施術を止めたあと） */
    function doReverse(top) {
      reversed = true;
      var orv = K.say(S, { kind: 'sys', tag: '立場逆転', text: K.fmt(S, K.pick(S, top ? M.TOP_REVERSE : M.REVERSE)), why: top ? (TR ? '受け攻め：' + TR.name + 'との組では客が主導する側' : '攻めの指定：触られる側には回らない') + '／FC・攻撃性 ' + Math.round(h.tr.aggr * 100) + '・経験 ' + h.stats.exp : '強気・攻撃性 ' + Math.round(h.tr.aggr * 100) + '・経験 ' + h.stats.exp });
      K.key(S, orv, '施術者を押し倒した');
      var rv = dark ? [K.pick(S, MD.reverse)] : S.rng.shuffle(M.REVERSE_ACT).slice(0, 2);
      rv.forEach(function (t2) { K.say(S, { kind: 'ev', tag: '逆転', lewd: true, text: K.fmt(S, t2), why: '' }); });
      /* 厚く：客が施術者を責めはじめるところを段落で */
      if (!dark && lwOn()) K.say(S, { kind: 'ev', tag: '逆転', lewd: true, text: ML.rev(lwc(true), kindT).replace(/^\n\n/, ''), why: '主導権は客の側' });
      if (top && !dark) {
        var tp = thick(true) || K.pick(S, posTop());
        K.say(S, { kind: 'ev', tag: tp.n, lewd: true, text: K.fmt(S, tp.t), why: '主導権は最後まで客の側' });
      }
      if (!top) { h.pleasure += 30; while (h.pleasure >= 100) K.climax(S); }
      /* まれに、腕を見込まれてスカウトされる。受けるかどうかは性格と店の様子しだい */
      if (M.SCOUT && rng() < 0.05 + h.tr.aggr * 0.08 + (h.stats.exp - 3) * 0.03 + (h.action.id === 'enjoy' ? 0.06 : 0) + (top ? 0.05 : 0)) {
        var acc = h.tr.fc * 0.4 + h.tr.impulse * 0.25 + h.corrupt / 250 + (h.goal.id === 'secret' || h.goal.id === 'free' ? 0.2 : 0) + env.harsh / 500 - h.tr.cp * 0.25 - h.tr.a * 0.2 - h.tr.caution * 0.2 - (env.shady - 50) / 250 - (h.goal.id === 'suspect' || h.goal.id === 'heal' ? 0.2 : 0) + (rng() - 0.5) * 0.4;
        S.flags.scout = acc > 0.55 ? 'yes' : 'no';
        var osc = K.say(S, { kind: 'sys', tag: 'スカウト', text: K.fmt(S, K.pick(S, M.SCOUT)) + ' ' + K.fmt(S, K.pick(S, (S.flags.scout === 'yes' ? M.SCOUT_YES : M.SCOUT_NO)[h.persona] || M.SCOUT_NO.gentle)), why: '施術者を負かした腕を見込まれた（攻撃性・経験 ' + h.stats.exp + '）／' + (S.flags.scout === 'yes' ? '引き受けた（FC・衝動性・堕ち度）' : '断った（CP・A・慎重さ' + (env.shady > 60 ? '・店の怪しさ' : '') + '）') });
        K.key(S, osc, S.flags.scout === 'yes' ? 'スカウトを受けた' : 'スカウトを断った');
      }
    }
    /* 寝落ちの最中の絶頂（list＝K.stim の後回しにした絶頂の文。数だけ使う）。眠っている客は、返事・おねだり・目を開ける描写をしない：
       眠ったまま達する（体だけが跳ねる・寝息が乱れる・短い寝言）か、その拍子に目を覚ます（はっとして状況が分からない）。
       目を覚ますかは、態度（冷静・厳格・強気ほど覚めやすく、穏やか・奔放ほど眠りが深い）と心の強さ（K.will）・慎重さ・続けて達した回数。
       R18版の描写する回は solo-massage-sleep.js（HK.MassageSleep）、描写が軽め・全年齢は M.SLEEP_CL_DARK・M.SLEEP_CL_WAKE_DARK。目を覚ましたら true */
    var WAKE_BASE = { proud: 0.3, stern: 0.35, cool: 0.35, tsun: 0.25, shy: 0.25, polite: 0.2, devoted: 0.15, gentle: 0.1, free: 0.05 };
    function sleepClimax(list) {
      if (!list.length) return false;
      var SZ = !dark && !HK.SAFE_ON ? HK.MassageSleep : null, ero = !!(SZ && lcf && LWX.ero(env));
      /* 組：女性の施術者と女性器のある客／女性の施術者と男性器のある客（女攻め×男）／男性の施術者（客の体を問わない書き方） */
      var hasF = HK.Pos && HK.Pos.genSet && HK.Pos.genSet(h) ? HK.Pos.hasF(h) : h.gender === 'f';
      var grp = kindR === 'ff' ? (hasF ? 'ff' : 'recv') : kindR === 'lady' ? 'lady' : 'recv';
      var w = K.will(h);
      for (var k = 0; k < list.length; k++) {
        var wp = (WAKE_BASE[h.persona] != null ? WAKE_BASE[h.persona] : 0.2) + w * 0.35 + h.tr.caution * 0.15 + k * 0.15;
        var wake = rng() < wp;
        var t = SZ ? SZ.text(S, K, h, grp, wake, ero) : K.fmt(S, K.pick(S, wake ? M.SLEEP_CL_WAKE_DARK : M.SLEEP_CL_DARK));
        var o = K.say(S, { kind: 'climax', tag: K.W_CL, sleep: wake ? 'wake' : 'stay', text: t, why: (wake ? '眠ったまま' + K.W_CL + 'して、その拍子に目を覚ました' : '眠ったまま' + K.W_CL + 'した（目は覚まさなかった）') + '／心の強さ ' + Math.round(w * 100) + '・慎重さ ' + Math.round(h.tr.caution * 100) });
        if (wake) {
          if (!S.flags.firstKey) S.flags.firstKey = true;
          K.key(S, o, '眠ったまま' + K.W_CL + 'して目を覚ました');
          sus += 45;
          /* 目を覚ましたあとに続けて達した分は、ふだんの文 */
          logC(list.slice(k + 1));
          return true;
        }
        if (!S.flags.firstKey) { S.flags.firstKey = true; K.key(S, o, '眠ったまま最初の' + K.W_CL); }
      }
      return false;
    }
    /* 攻めの客：施術が際どくなった時点で手を止めさせ、帰るか、立場を入れ替える */
    function topStop(st) {
      S.flags.noticedAt = S.flags.noticedAt || st[1];
      var o1 = K.say(S, { kind: 'ev', tag: st[0] + '（拒否）', text: K.fmt(S, K.pick(S, TR ? MC.RES_TOP_STOP : M.TOP_STOP)), why: TR ? '受け攻め：' + TR.name + 'との組では、客の' + h.name + 'が主導する側。施術者に触られる側には回らない' : '自分で「攻め」を選んでいる：施術者に触られる側には回らない' });
      K.key(S, o1, st[1] + 'で手を止めさせた');
      var rev = 0.25 + h.tr.fc * 0.3 + h.tr.aggr * 0.3 + (h.stats.exp - 3) * 0.08 + (h.goal.id === 'secret' ? 0.3 : 0) + (h.action.id === 'enjoy' ? 0.2 : 0) - (h.goal.id === 'suspect' || h.goal.id === 'heal' ? 0.15 : 0) - h.tr.caution * 0.2 + (TR ? 0.3 : 0);
      if (rng() < rev) { doReverse(true); return; }
      left = true;
      if (h.goal.id === 'suspect' && !S.flags.evidence && rng() < 0.6) {
        S.flags.evidence = true;
        K.say(S, { kind: 'ev', tag: '証拠集め', text: K.fmt(S, K.pick(S, M.EVIDENCE)), why: '噂を確かめに来た' });
      }
      var ol = K.say(S, { kind: 'sys', tag: '退店', text: K.fmt(S, K.pick(S, M.TOP_LEAVE)) + ' ' + K.fmt(S, K.pick(S, LEAVE)), why: '触られる側に回るつもりはなかった（攻めの指定）' });
      K.key(S, ol, '店を出た');
    }

    for (var i = 0; i < seq.length && !left && !fell; i++) {
      var st = seq[i], lvl = Math.min(5, st[4] + shift * (i / seq.length) * 1.5);
      S.step = i;
      K.step(S, (i + 1) + '. ' + st[1]);
      if (hardTop && lvl >= 2) { topStop(st); break; }
      var power = st[3] * (0.6 + lvl * 0.12) * (env.harsh / 55) * (h.action.id === 'enjoy' ? 1.2 : h.action.id === 'endure' ? 0.85 : 1) * (sk === 'duo' ? 1.2 : 1) * hands * (sleeping ? 1.15 : 1);
      /* 攻めの客は、際どくなる前の普通の施術だけ（絶頂させられる展開にしない） */
      var r = hardTop ? { gain: 0, climaxes: [] } : K.stim(S, power * 1.7, { part: st[2], shame: lvl >= 2, defer: true });
      var text = K.fmt(S, K.pick(S, dark && MD.act[st[0]] ? MD.act[st[0]] : ACT[st[0]])), bd = band(lvl);
      var asleep0 = sleeping > 0;
      if (sleeping) {
        /* 寝ている間：本人の反応のかわりに、寝ている間の様子 */
        K.say(S, { kind: 'ev', tag: st[0] + '（睡眠中）', lewd: lvl >= 3 || r.climaxes.length > 0, text: text + ' ' + K.fmt(S, K.pick(S, M.SLEEP_DUR)), why: '眠っている間に施術が進んだ／快感 ＋' + Math.round(r.gain) });
        /* 眠っている間に達したら、眠ったまま（体だけが跳ねる・寝言）か、その拍子に目を覚ますか。目を覚ましたあとの絶頂は、ふだんの文 */
        var woke = sleepClimax(r.climaxes);
        sleeping--;
        if (woke) sleeping = 0;
        else if (!sleeping) {
          var ow = K.say(S, { kind: 'ev', tag: '目覚め', text: K.fmt(S, K.pick(S, M.SLEEP_WAKE[h.persona])), why: '寝ている間に「' + st[1] + '」まで進んでいた' });
          K.key(S, ow, '寝落ちから目覚めた');
          sus += 45;
        }
      } else {
        /* とろけたあとは、際どさの低い施術でも「明らかにおかしい」段の反応か、堕ち度に合った反応だけ */
        var shiftT = hardTop ? '' : phUp(bd), ri = Math.max(bd, ph >= 2 ? 2 : 0);
        var rx = hardTop ? ' ' + K.fmt(S, K.pick(S, bd ? M.TOP_REACT : M.REACT[h.persona][0])) : dark || (ph < 2 && rng() < 0.65) ? ' ' + K.fmt(S, K.pick(S, M.REACT[h.persona][ri])) : tail(ph >= 2 ? 1 : lvl >= 1 ? 0.55 : 0.2);
        var wrongNow = wrong && lvl >= 2 && M.WRONG && (wrongShown === 0 || rng() < 0.55);
        if (wrongNow) {
          wrongShown++; h.reason += 1; sus += 3;
          rx = ' ' + fw(M.WRONG[h.persona] || M.WRONG.gentle) + (wrongShown > 1 && rng() < 0.5 ? ' ' + fw(M.WRONG_BODY) : '');
        }
        K.say(S, { kind: 'ev', tag: wrongNow ? st[0] + '（拒否反応）' : st[0], lewd: lvl >= 3 || r.climaxes.length > 0, text: text + rx + shiftT, why: (lvl >= 2 ? '際どさ ' + Math.round(lvl) + '／快感 ＋' + Math.round(r.gain) : '') + (wrongNow ? '／' + wrongWhy + '：抵抗が強い' : '') });
        logC(r.climaxes);
        /* 相手を匂わせる台詞：始まり（最初の段）・最中（際どさ 2 以上）・堕ちかけ（とろける段階から）。攻めの客は際どくなる前の始まりだけ */
        if (LVM) {
          if (i === 0) loveAt('start');
          else if (!hardTop && lvl >= 2 && !LVM.done.mid) loveAt('mid');
          else if (!hardTop && ph >= 2) loveAt('fall');
        }
      }
      /* 施術者の一言（眠っている客には話しかけない）。住人の施術者は、その人の口調で言い換える3本の台詞（solo-massage-cast.js の RES_TALK） */
      if (rng() < 0.5 && !asleep0) K.say(S, { kind: 'ev', tag: '施術者', text: K.fmt(S, K.pick(S, TR && MC.resTalk ? MC.resTalk(sk, hardTop ? 0 : bd) : M.STAFF_TALK[sk] ? M.STAFF_TALK[sk][hardTop ? 0 : bd] : M.STAFF_TALK.gentle[hardTop ? 0 : bd])), why: '' });
      /* 方針ごとの小場面 */
      var AB = M.ACT[h.action.id];
      if (!sleeping && AB && rng() < 0.45 && (!hardTop || !bd)) {
        fx(AB.fx[bd]);
        K.say(S, { kind: 'ev', tag: h.action.label, text: K.fmt(S, K.pick(S, AB.t[Math.max(bd, ph >= 2 ? 2 : 0)])), why: '方針「' + h.action.label + '」' });
      }
      /* 寝落ち（お任せでリラックスしている人ほど）。住人の施術者の回は、眠っている人に際どい施術をしないので起きない */
      if (!hardTop && !TR && !sleeping && !slept && !noticed && bd >= 1 && rng() < (h.action.id === 'relax' ? 0.3 : 0.06) + h.tr.cold * 0.12 + h.tr.ac * 0.08) {
        slept = true; sleeping = 1 + rng.int(h.action.id === 'relax' ? 4 : 2);
        var osl = K.say(S, { kind: 'ev', tag: '寝落ち', text: K.fmt(S, K.pick(S, M.SLEEP_IN)), why: 'リラックスしすぎた（ドライさ・AC）' });
        K.key(S, osl, '施術中に眠ってしまった');
      }
      /* ハプニング */
      var inc = incAt[i];
      if (inc && !sleeping) {
        fx(inc.fx);
        /* カーテン越し：隣のブースは、カーテンの向こうのもう一人 */
        var itext = (inc.id === 'neighbor' && o.other ? K.fmt(S, K.pick(S, MC.CUR_NEIGHBOR), { b: o.other }) : K.fmt(S, K.pick(S, inc.t))) + ' ' + K.fmt(S, K.pick(S, inc.r[h.persona]));
        if (inc.also && rng() < 0.6) { itext += ' ' + K.fmt(S, inc.also); hands = 1.25; }
        K.say(S, { kind: 'ev', tag: inc.n, text: itext, why: 'ハプニング「' + inc.n + '」' });
        (S.flags.inc = S.flags.inc || []).push(inc.n);
      }
      /* 立場逆転：強気・奔放で経験のある客が、施術者を押し倒す */
      /* 住人の施術者とは、二人ともリバの組だけ向きを入れ替えてよい */
      if (!reversed && !sleeping && (!TR || HK.Pos.bothRiba(TR, CR)) && (noticed || stayed) && h.corrupt > 25 && ((h.tr.cp > 0.6 && h.tr.np < 0.45) || h.tr.fc > 0.62 || h.tr.aggr > 0.6) && h.stats.exp >= 3 && rng() < 0.22 + h.tr.aggr * 0.3 + (h.stats.exp - 3) * 0.08) {
        doReverse(false);
        break;
      }
      /* 気づくかどうか */
      if (!noticed && !sleeping && lvl >= 1) {
        var eye = h.tr.caution * 0.45 + h.tr.a * 0.35 + h.tr.cold * 0.25 + (h.stats.exp - 3) * 0.08 + (h.action.id === 'watch' ? 0.25 : 0) + (h.goal.id === 'suspect' ? 0.3 : 0);
        if (wrong && lvl >= 2) eye += 0.1;
        var blind = h.tr.ac * 0.3 + h.tr.np * 0.25 + (h.action.id === 'relax' ? 0.2 : 0) + (sk === 'silent' ? 0.15 : 0) + (sk === 'duo' ? 0.1 : 0);
        sus += lvl * 9 * (0.6 + eye - blind * 0.6) + (env.shady - 50) / 12 + h.pleasure / 18;
        if (sus >= 55) {
          noticed = true; S.flags.noticedAt = st[1];
          if (!hardTop && ((h.goal.id === 'secret' && !(wrong && rng() < 0.6)) || (!wrong && h.tr.ac > 0.65 && h.tr.cp < 0.5 && rng() < 0.6))) {
            var os = K.say(S, { kind: 'ev', tag: '気づき', text: K.fmt(S, K.pick(S, SECRET)), why: '「' + st[1] + '」で気づいた。でも言い出せなかった（AC ' + Math.round(h.eg.AC) + '）' });
            K.key(S, os, '気づいたが黙っていた'); stayed = true;
          } else {
            var on = K.say(S, { kind: 'ev', tag: '気づき', text: K.fmt(S, K.pick(S, NOTICE[h.persona])), why: '「' + st[1] + '」で気づいた（慎重さ ' + Math.round(h.tr.caution * 100) + '・A ' + Math.round(h.eg.A) + '・経験 ' + h.stats.exp + '）' });
            K.key(S, on, st[1] + 'で気づいた');
            if (h.goal.id === 'suspect' && !S.flags.evidence && h.tr.a + h.tr.cold + h.tr.caution > 1.3) {
              S.flags.evidence = true;
              K.say(S, { kind: 'ev', tag: '証拠集め', text: K.fmt(S, K.pick(S, M.EVIDENCE)), why: '噂を確かめに来た（A・ドライさ・慎重さ）' });
            }
            var ex = K.fmt(S, K.pick(S, TR ? MC.RES_EXCUSE[TR.persona] || MC.RES_EXCUSE.gentle : EXCUSE));
            var believe = h.tr.ac * 0.45 + h.tr.np * 0.3 + h.tr.honesty * 0.1 - h.tr.a * 0.35 - h.tr.cp * 0.3 - h.tr.cold * 0.2 + staff.dec + h.pleasure / 250 - deceived * 0.25 + rng() * 0.6 - (wrong ? 0.12 : 0);
            if (believe > 0.35) {
              deceived++; noticed = false; sus = 20;
              K.say(S, { kind: 'ev', tag: '言い訳', text: ex + ' ' + K.fmt(S, K.pick(S, DECEIVED[h.persona])), why: '言い訳に騙された（AC・NP・素直さ ＞ A・CP）' });
            } else {
              if (wrong && M.WRONG_NOTDECEIVED) ex += ' ' + fw(M.WRONG_NOTDECEIVED);
              var go = h.tr.cp * 0.5 + h.reason / 120 + h.tr.cold * 0.3 - h.corrupt / 80 - (h.goal.id === 'secret' ? 0.5 : 0) - h.tr.fc * 0.2 + (h.goal.id === 'suspect' ? 0.2 : 0) + (wrong ? 0.06 : 0);
              if (go > 0.55) {
                left = true;
                var ol = K.say(S, { kind: 'sys', tag: '退店', text: ex + ' ' + K.fmt(S, K.pick(S, LEAVE)), why: '言い訳を見抜き、帰ることを選んだ（CP ' + Math.round(h.eg.CP) + '・理性 ' + Math.round(h.reason) + (wrong ? '・' + wrongWhy : '') + '）' });
                K.key(S, ol, '店を出た');
              } else {
                stayed = true;
                var ost = K.say(S, { kind: 'ev', tag: '続行', text: ex + ' ' + (wrong && M.WRONG_STAY ? fw(M.WRONG_STAY) : K.fmt(S, K.pick(S, STAY))), why: '分かっていて、続けさせた（FC・堕ち度）' + (wrong ? '／' + wrongWhy + 'だが、それでも' : '') });
                K.key(S, ost, '分かっていて続けた');
              }
            }
          }
        }
      }
      if (!hardTop && !left && !sleeping && stayed && !asked && h.corrupt > (wrong ? 75 : 55) && rng() < (wrong ? 0.2 : 0.4) + h.tr.fc * 0.3) {
        asked = true;
        K.say(S, { kind: 'ev', tag: 'おねだり', lewd: true, text: K.fmt(S, K.pick(S, ['{a}は自分から{m}の手を掴んで、そこへ導いた。「…もっと、ちゃんと｜…もっと、ちゃんとしろ｜…もっと、ちゃんとしてください」', '{a}は消え入りそうな声で言った。「…最後まで、して｜…最後まで、しろ｜…最後まで、してください」', '{a}「延長って、できる？｜延長はできるか｜延長って、できますか」――声が震えていた。'])), why: '堕ち度 ' + Math.min(100, Math.round(h.corrupt)) });
      }
      if (K.settle(S) && !hardTop) fell = true;
      K.snap(S, { s: sus });
    }

    /* 眠ったまま施術が終わった：このあと延長・陥落が続くなら、その前に目を覚ます（眠っている客に続きをしない） */
    if (sleeping && (fell || (extended && !hardTop && !left && !reversed))) {
      sleeping = 0; sus += 45;
      var owE = K.say(S, { kind: 'ev', tag: '目覚め', text: K.fmt(S, K.pick(S, M.SLEEP_WAKE[h.persona] || M.SLEEP_WAKE.gentle)), why: '寝ている間に施術が最後まで進んでいた' });
      K.key(S, owE, '寝落ちから目覚めた');
    }
    if (extended && !hardTop && !left && !reversed && !fell) {
      S.step = seq.length; K.step(S, '延長');
      var rx2 = K.stim(S, 40, { part: 'all', mult: 1.2, defer: true });
      K.say(S, { kind: 'ev', tag: '延長', lewd: true, text: K.fmt(S, K.pick(S, ['延長の三十分は、それまでの九十分よりずっと長かった。{m}の手はもう、遠慮をしなかった。', '{m}「延長分は、特に念入りに」――{a}は延長を頼んだことを、ほんの少しだけ後悔した。', '延長の間、{a}は時計を見なかった。見る余裕がなかった。'])) + phUp(2) + tail(0.7) + (lwOn() ? ML.ext(lwc(false)) : ''), why: '延長した' });
      logC(rx2.climaxes);
      if (K.settle(S)) fell = true;
    }
    var positions = [];
    if (fell || (asked && !left)) {
      S.step = seq.length;
      K.step(S, '施術のあと');
      var nPos = 2 + rng.int(2) + (h.corrupt >= 100 ? 1 : 0) + (highOn ? 1 : 0);
      /* 客が攻めなら客が主導する体位（女性どうし・女性の客×男性の施術者・男性の体で攻める客）、受けなら施術者が主導する体位 */
      /* 住人の女性の施術者が男性の客を導く（女攻め×男）ときは、跨る・手で・口での体位（solo-massage-thick.js の POS_LADY） */
      var ladyR = !!TR && staff.g === 'f' && !ff, PL = (HK.MassageThick && HK.MassageThick.POS_LADY) || POS;
      var pool = S.rng.shuffle(noMut(cTop() ? posTop() : ff ? POS_FF : ladyR ? PL : POS));
      /* この回（カーテン越しの相手を含む）でまだ使っていない体位の文を先に */
      var uP = S._fu = S._fu || [];
      pool = pool.filter(function (p) { return uP.indexOf(p.t) < 0; }).concat(pool.filter(function (p) { return uP.indexOf(p.t) >= 0; })).slice(0, nPos);
      pool.forEach(function (p) { uP.push(p.t); });
      /* 住人の施術者と客の組：夜の性格（attr-r18.js の HK.Attr.nightText。サド・マゾ・意地悪・甘々・恥じらい）の一文を陥落の段に足す。
         決めていない二人には乱数を使わずに ''。向きは、客が主導する組（cTop）なら客が攻め（2026-10-27 担当HM） */
      var nightIn = '';
      if (TR && !dark && lwOn() && HK.Attr && HK.Attr.nightText) {
        var nT = cTop() ? h : TR, nU = nT === h ? TR : h;
        var nMode = ff ? 'ff' : HK.Pos && HK.Pos.isF(nT) && !HK.Pos.isF(nU) ? 'fm' : 'mf';
        nightIn = HK.Attr.nightText(nT, nU, nMode, function (l) { return K.pick(S, l); }, eroOn);
        if (nightIn) nightIn = ' ' + nightIn.replace(/\{a\}/g, nT.name).replace(/\{b\}/g, nU.name);
      }
      var head = K.say(S, { kind: 'sys', tag: '陥落', text: (wrong && M.WRONG_FALL ? fw(M.WRONG_FALL) : '') + K.fmt(S, K.pick(S, ['{a}の体は、もう{m}の言葉にしか従わなかった。{m}「では、本当の施術を始めましょう」', '{a}は施術台の上で、自分から脚の力を抜いた。{m}は満足そうに微笑んだ。', '{m}「今日はサービスです。最後まで、ゆっくり」――{a}には、断る理由がもう見つからなかった。'])) + nightIn, why: '快楽に負けた（堕ち度 ' + Math.min(100, Math.round(h.corrupt)) + '・理性 ' + Math.round(Math.max(0, h.reason)) + '）' });
      K.key(S, head, '快楽に負けた');
      /* 陥落の文が変わり目を兼ねるので、ここからは段階を上げるだけ（一文は足さない） */
      ph = Math.max(ph, fell ? 3 : 2);
      var custTop = cTop();
      /* 厚く：堕ちた瞬間を段落で（客が主導する組は、体位の場面のほうで厚くする） */
      if (!dark && !custTop && lwOn()) head.text += ML.fall(lwc(false), kindR);
      /* 相手を匂わせる台詞：堕ちかけ（まだなら） */
      loveAt('fall');
      var darkN = 0, c0 = h.climax;
      if (dark) K.say(S, { kind: 'sys', tag: '暗転', lewd: true, text: K.fmt(S, K.pick(S, MD.blackout)), why: '描写：軽め（暗転）' });
      pool.forEach(function (p, j) {
        /* 最後の体位は山場：R18版では段落に分けた厚い場面（solo-massage-thick.js） */
        if (!dark && j === pool.length - 1) { var thp = thick(custTop); if (thp) p = thp; }
        positions.push(p.n);
        var rr = K.stim(S, 34 + j * 6, { part: 'all', mult: 1.3, defer: true });
        if (dark) darkN += rr.climaxes.length;
        else {
          /* 厚く：二つめ以降の体位は盛り上がっていく段落、最後の体位は果てるまでの段落（濃いなら、もう一度）を足す */
          var lw = '', lk = custTop ? kindT : kindR;
          if (j === pool.length - 1) { if (lwOn()) lw = ML.peak(lwc(custTop), lk, highOn); }
          else if (j >= 1 && lwOn()) lw = ML.mid(lwc(custTop), lk);
          /* 男性向け：最初と最後の体位に段落を足す。客が自分から求めた（おねだり）・客が主導するときは ERO、
             流されたときは ERO_SWEPT（R18版の solo-massage-thick.js）。流されたときは、厚い段落を足した体位には重ねない（数行で短くでも男性向けになる） */
          var ex = '', swept = !(asked || custTop);
          if (eroOn && (j === 0 || j === pool.length - 1) && !(swept && (lw || !HK.MassageThick.ERO_SWEPT))) {
            var EK = swept ? HK.MassageThick.ERO_SWEPT : HK.MassageThick.ERO, ek = custTop ? 'top' : ff ? 'ff' : staff.g === 'f' && !noP(h) ? 'lady' : 'recv', d0 = h.eroDom;
            h.eroDom = custTop;
            ex = (p.thick ? '\n\n' : '') + K.fmt(S, HK.Ero.fill(S, K.pick(S, EK[ek]), h));
            h.eroDom = d0;
          }
          K.say(S, { kind: 'ev', tag: p.n, lewd: true, text: K.fmt(S, p.t) + ex + lw + (function (tl) { return lw ? '' : tl; })(rr.climaxes.length || p.thick ? '' : tail(0.8)), why: '体位の指定：' + p.n });
          K.logClimax(S, rr.climaxes);
        }
        /* 落ちすぎた客は、行為の最中に新人の練習台に誘われる（断れない）。返事の声の♡は、描写の作風が「男性向け」のときだけ（_ERO） */
        if ((M.TRAINEE_ASK || (dark && MD.traineeAsk)) && !TR && !S.flags.trainee && j >= 1 && h.corrupt >= 100 && h.climax >= 6 && rng() < 0.55) {
          S.flags.trainee = true;
          var hesi = ['proud', 'stern', 'tsun', 'cool', 'shy', 'polite'].indexOf(h.persona) >= 0 ? rng() < 0.8 : rng() < 0.3;
          var tt = K.fmt(S, K.pick(S, dark ? MD.traineeAsk : ff ? M.TRAINEE_ASK_FF : M.TRAINEE_ASK)) + ' ';
          if (hesi) tt += K.fmt(S, K.pick(S, M.TRAINEE_HESITATE[h.persona] || M.TRAINEE_HESITATE.gentle)) + ' ' + K.fmt(S, K.pick(S, dark ? MD.traineePress : custTop ? (eroOn && M.TRAINEE_PRESS_TOP_ERO || M.TRAINEE_PRESS_TOP) : ff ? (eroOn && M.TRAINEE_PRESS_FF_ERO || M.TRAINEE_PRESS_FF) : (eroOn && M.TRAINEE_PRESS_ERO || M.TRAINEE_PRESS)));
          else tt += K.fmt(S, K.pick(S, (eroOn && M.TRAINEE_YES_ERO && M.TRAINEE_YES_ERO[h.persona]) || M.TRAINEE_YES[h.persona] || M.TRAINEE_YES.gentle));
          h.pleasure += 40; while (h.pleasure >= 100) K.climax(S);
          var otr = K.say(S, { kind: 'sys', tag: '練習台の約束', lewd: true, text: tt, why: '快楽に落ちきった（堕ち度 ' + Math.min(100, Math.round(h.corrupt)) + '・' + K.W_CL + ' ' + h.climax + '回）／もう断れなかった' + (hesi ? '（性格上、返事を渋った）' : '') });
          K.key(S, otr, '新人の練習台になると約束した');
        }
      });
      if (dark) {
        var nC = h.climax - c0;
        K.say(S, { kind: 'climax', tag: '明かりが点いた', text: K.fmt(S, K.pick(S, MD.lightsOn)) + (HK.SAFE_ON ? '――暗闇の中で「次は、こちらの姿勢で」と言われたのは' + positions.length + '回。' + h.name + 'が声を殺しきれなかったのは、' + nC + '回だった。' : '――暗闇の中で指定された体位は' + positions.length + 'つ。' + h.name + 'が達したのは、' + nC + '回だった。'), why: HK.SAFE_ON ? '姿勢を変えた ' + positions.length + '回／声 ' + nC + '回' : '体位 ' + positions.length + 'つ／' + K.W_CL + ' ' + nC + '回' });
      }
    }

    /* 相手を匂わせる台詞：事後（際どい施術を受けて、帰らずに最後までいたとき） */
    if (!left && (fell || asked || stayed || reversed || h.climax > 0)) loveAt('after');
    S.flags.wrong = wrong;
    var E = ending(S, { reversed: reversed, slept: slept, evidence: !!S.flags.evidence, left: left, fell: fell, asked: asked, stayed: stayed, noticed: !!S.flags.noticedAt, deceived: deceived, positions: positions, staff: staff, res: !!TR });
    var adv = [];
    if (deceived) adv.push('言い訳に' + deceived + '回騙された。AC（' + Math.round(h.eg.AC) + '）とNP（' + Math.round(h.eg.NP) + '）の素直さが、疑う気持ちに勝った。');
    if (!S.flags.noticedAt) adv.push('最後まで「普通じゃない」と気づかなかった。慎重さ（' + Math.round(h.tr.caution * 100) + '）とA（' + Math.round(h.eg.A) + '）がもう少し高ければ。');
    else adv.push('気づいたのは「' + S.flags.noticedAt + '」の段階。');
    if (fell) adv.push('快楽に負けたのは、感じやすさ ' + h.stats.sense + '・CP ' + Math.round(h.eg.CP) + 'で、昂りに理性が追いつかなかったから。');
    if (left) adv.push('帰る決断ができたのは、CP（' + Math.round(h.eg.CP) + '）と理性の残り（' + Math.round(h.reason) + '）のおかげ。');
    return done(K.finish(S, input, E, adv, { meta: staff.n + (TR ? '（住人）' : '') + '・' + ({ normal: '整体', oil: 'アロマオイル', lymph: '全身リンパ', special: '特別コース' })[course] + 'コース', estats: [['気づいた', S.flags.noticedAt || '気づかず'], ['騙された', deceived + '回'], [K.W_CL, h.climax + '回'], ['堕ち度', Math.min(100, Math.round(h.corrupt))], ['理性', Math.max(0, Math.round(h.reason))]].concat(positions.length ? [dark ? (HK.SAFE_ON ? ['暗闇の中で姿勢を変えた', positions.length + '回'] : ['暗闇の中の体位', positions.length + 'つ']) : ['指定された体位', positions.join('→')]] : []), label3: '施術' }));
  }

  function ending(S, x) {
    var h = S.h, L0 = [], title, kind, M = HK.MassageMore;
    if (x.reversed && S.flags.scout === 'yes') { kind = 'ok'; title = 'スカウトされた ― 来月から、施術する側に'; L0.push(h.name + 'の初出勤の日、' + x.staff.n + 'は研修資料を一枚も用意していなかった。「教えることなんて、ありませんから」'); }
    else if (x.reversed) { kind = 'ok'; title = '立場逆転 ― 施術されたのは' + x.staff.n + 'のほうだった' + (S.flags.scout === 'no' ? '（スカウトは断った）' : ''); L0.push(x.staff.n + 'は会計のとき、' + h.name + 'から代金を受け取らなかった。「……またのお越しを」声が、少しかすれていた。'); }
    else if (x.left && x.evidence) { kind = 'ok'; title = '潜入成功 ― 証拠を持ち帰った'; L0.push('一週間後、その店の扉には「しばらく休業します」の貼り紙が貼られた。' + h.name + 'の録音が、決め手だった。'); }
    else if (x.slept && !x.noticed) { kind = 'mid'; title = '寝ている間に全部終わっていた ― 何も覚えていない'; L0.push(h.name + 'は「すごくよく眠れた｜＝｜すごくよく眠れました」と言って帰った。体の奥に残る甘いだるさの理由は、最後まで分からなかった。'); }
    else if (x.left) { kind = 'ok'; title = '途中で帰った ― 「' + S.flags.noticedAt + '」で見抜いた'; L0.push(h.name + 'はその日のうちに口コミサイトに長文を書いた。星は一つだった。'); }
    else if (x.fell && S.flags.trainee) { kind = 'over'; title = '新人の練習台になった ― 研修日は毎週水曜'; L0.push(HK.SoloKit.fmt(S, S.rng.pick(M.TRAINEE_END))); }
    else if (x.fell && h.goal.id === 'secret') { kind = 'over'; title = '常連になった ― 毎週水曜、同じ時間に'; L0.push(h.name + 'の予約は、もう三ヶ月先まで埋まっている。指名はいつも' + x.staff.n + 'だった。'); }
    else if (x.fell) { kind = 'over'; title = '快楽に負けた ― ' + (x.positions.length ? (S.dark ? (HK.SAFE_ON ? '暗闇の中で、' + x.positions.length + '回姿勢を変えて' : '暗闇の中で、' + x.positions.length + 'つの体位を') : x.positions.filter(function (v, i, A) { return A.indexOf(v) === i; }).join('、') + 'で') : '延長の三十分で'); L0.push(h.name + 'は帰り道、駅のホームで何度も膝が笑った。財布には、次回割引券が入っていた。'); }
    else if (x.asked) { kind = 'over'; title = '自分からねだった ― 延長料金は払った'; L0.push(h.name + 'は会計のとき、' + x.staff.n + 'と目を合わせられなかった。'); }
    else if (!x.noticed && x.deceived) { kind = 'mid'; title = '騙されたまま ― 「また来ます」'; L0.push(h.name + 'は' + x.deceived + '回疑って、' + x.deceived + '回納得した。体は軽くなった気がした。'); }
    else if (!x.noticed) { kind = 'mid'; title = '最後まで気づかなかった ― 星5のレビューを書いた'; L0.push(h.name + '「すごく丁寧な施術だった。特にリンパのところが効いた｜＝｜すごく丁寧な施術でした。特にリンパのところが効きました」――レビューには「参考になった」が千件ついた。'); }
    else if (x.stayed) { kind = 'mid'; title = '分かっていて、最後まで ― 誰にも言えない90分'; L0.push(h.name + 'は気づいていた。それでも最後まで、施術台から降りなかった。'); }
    else { kind = 'mid'; title = '耐えきった ― 何事もなかった顔で会計した'; L0.push(h.name + 'は最後まで声を出さなかった。会計を済ませて外に出た瞬間、壁に手をついて座り込んだ。'); }
    if ((x.fell || x.asked) && (h.tr.ac > 0.55 || h.tr.np > 0.6) && S.rng() < 0.6) L0.push(S.h.name ? HK.SoloKit.fmt(S, S.rng.pick(x.res ? HK.MassageCast.RES_AFTER : M.CRUSH)) : '');
    if (S.flags.wrong && M.WRONG_END && (x.fell || x.asked || x.stayed)) L0.push(HK.SoloKit.fmt(S, S.rng.pick(M.WRONG_END.filter(function (t) { return t.indexOf('{sx}') < 0; }))));
    if (h.goal.id === 'heal') L0.push(h.name + 'の肩こりは、本当にきれいに治っていた。それが一番、腹立たしかった。');
    if (h.goal.id === 'free') L0.push('タダ券の裏には、小さく「二回目以降は通常料金」と書いてあった。');
    L0.push(HK.SoloKit.fmt(S, S.rng.pick(M.AFTERSHOP[h.persona])));
    L0.push(h.name + '：' + K.W_CL + ' ' + h.climax + '回・堕ち度 ' + Math.min(100, Math.round(h.corrupt)) + '・理性 ' + Math.max(0, Math.round(h.reason)));
    return { type: kind, kind: kind, title: title, lines: L0 };
  }
  /* 並びに無ければ足す（分割読み込みでは目録の並びが中核で先に作られている） */
  if (HK.SCEN_ORDER.indexOf('massage') < 0) HK.SCEN_ORDER.push('massage');
})();
