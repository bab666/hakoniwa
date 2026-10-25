/* 箱庭シミュレーター: 合コンのモブの参加者（全年齢版も同じ）
   環境値「モブの参加者」（mobs：0〜4人。既定は0人で、0人のときは今までと同じ結果）で、住人ではない参加者を同じ席に座らせる。
   ・モブは HK.Mob.make で作り、住人の一覧（ctx.chars）には入れない（関係図・結果の住人にも出ない。結果の終わりに「同じ席にいたモブ」として書く）
   ・モブは恋愛・夜・R18の相手にならない：住人との関係の値を持たず、出来事の登場人物（actors）にも入らない。
     念のため、恋愛対象「なし」・恋愛相手の固定（誰でもない）・R18に参加しない、を付けておく（HK.canLove・HK.Pos.okSex がどちらの向きでも通らない）
   ・モブの気質（盛り上げ役・世話焼き・空気を読まない・誰にでも愛想がいい・食べに来ただけ・酒豪）で振る舞いが変わる。
     盛り上げ役・世話焼きは住人どうしの仲を取り持ち（橋渡し）、愛想のいいモブは住人の想い人に話しかけて嫉妬を煽り（当て馬）、
     空気を読まないモブはいい雰囲気の二人に割って入る（邪魔）。どれも、動くのは住人どうしの関係だけ
   ・出てくる場面：乾杯・自己紹介・話題・席替え・王様ゲーム（モブが王様／モブに命令）・酔い（酔いつぶれたモブの介抱・住人への水）・カラオケ・帰り際 */
(function () {
  'use strict';
  var HK = window.HK;
  var gk = HK && HK.SCENARIOS && HK.SCENARIOS.goukon;
  if (!gk || !HK.Mob) return;
  function L(s) { return s.split('|'); }

  /* 同席の理由（{n}=名字） */
  var ROLES = [
    { id: 'friend', full: '幹事の友達の{n}' }, { id: 'kazu', full: '数合わせで呼ばれた{n}' }, { id: 'kohai', full: '幹事の会社の後輩の{n}' },
    { id: 'doki', full: '幹事の大学の同期の{n}' }, { id: 'tobi', full: '飛び入りで来た{n}' }
  ];

  /* 気質 */
  var KINDS = {
    moriage: { label: '盛り上げ役', part: '橋渡し', fit: function (t) { return t.fc * 0.6 + t.lead * 0.3; } },
    sewa: { label: '世話焼き', part: '橋渡し', fit: function (t) { return t.np * 0.7 + t.warmth * 0.2; } },
    kuuki: { label: '空気を読まない', part: '邪魔', fit: function (t) { return t.fc * 0.4 + t.impulse * 0.4 - t.a * 0.3 + 0.2; } },
    aiso: { label: '誰にでも愛想がいい', part: '当て馬', fit: function (t) { return t.warmth * 0.5 + t.ac * 0.2 + t.fc * 0.2; } },
    mokumoku: { label: '食べに来ただけ', part: '', fit: function (t) { return t.cold * 0.5 + t.caution * 0.3; } },
    zaru: { label: '酒豪', part: '', fit: function (t) { return t.cp * 0.3 + t.a * 0.2 + 0.15; } }
  };
  var KIND_IDS = Object.keys(KINDS);

  /* ---------- 文 ---------- */
  /* {m}=モブの名字 {M}=同席の理由つき {a}{b}=住人 */
  var INTRO = {
    moriage: L('{m}は「はい、トップバッターいきます！」と誰より先に立ち上がり、名前と好きな食べ物と特技を一息で言い切った。拍手が起きた。|{m}は自己紹介の順番を勝手に決め、自分の番では「今日は皆さんの引き立て役です」と胸を張った。'),
    sewa: L('{m}は自己紹介を手短に済ませると、「取り皿、足りてます？」と全員の前に皿を配り始めた。|{m}は「幹事に頼まれて来ました。今日は裏方です」と笑い、おしぼりを人数分そろえた。'),
    kuuki: L('{m}は自己紹介で、最近別れた恋人の話を五分した。誰も止められなかった。|{m}は「趣味は人間観察です」と言って、全員の顔を順番にじっと見た。'),
    aiso: L('{m}は一人ひとりの名前を一度で覚え、もう「〇〇さん」と呼び分けていた。|{m}は誰の自己紹介にも「えー、すごい！」と目を丸くした。たぶん全部本心だった。'),
    mokumoku: L('{m}は名前だけ言って座り、お通しの小鉢を丁寧に食べ始めた。|{m}は「タダ飯と聞いて来ました」と正直に言い、なぜか少し好感を持たれた。'),
    zaru: L('{m}は自己紹介の前にジョッキを一つ空け、「では改めまして」と二杯目を頼んだ。|{m}は「お酒はたしなむ程度です」と言った。その時点で三杯目だった。')
  };
  /* ふだんの振る舞い（住人 {a}・{b} と） */
  var DO = {
    moriage: L('{m}が「はい、{a}の今の話に拍手！」と手を叩いた。つられて全員が拍手し、{a}は照れくさそうに頭をかいた。|話が途切れかけたところで、{m}が「じゃあ次、{a}の番ね！」と無茶振りをした。{a}がなんとか答えると、場が一段明るくなった。|{m}はタンバリンもないのに、手拍子だけで{a}の話を盛り上げ続けた。'),
    sewa: L('{m}は{a}の取り皿に、黙ってサラダと唐揚げを取り分けた。{a}は小さく頭を下げた。|{m}は{a}のグラスが空く前に「次、何にします？」とメニューを差し出した。{a}は少し肩の力が抜けたようだった。|{m}は{a}の話を「それで？それで？」と最後まで聞いた。{a}は気づけば、いつもより多く喋っていた。'),
    kuuki: L('{m}が{a}に「で、前の恋人とはなんで別れたんですか？」と真顔で訊いた。空気が止まった。|{m}は{a}の話の途中で「それ、オチあります？」と言った。{a}の笑顔が少し固まった。|{m}は{a}に「さっきから全然食べてないですね。緊張してます？」と大きな声で訊いた。{a}は箸を持ち直した。'),
    aiso: L('{m}は{a}の話に、誰よりも大きくうなずいていた。{a}はつい、いつもより饒舌になった。|{m}は「{a}さんの話、もっと聞きたい」と身を乗り出した。{a}はまんざらでもなさそうだった。|{m}は{a}の時計を褒め、靴を褒め、最後に笑い方を褒めた。{a}は「褒めすぎ」と笑った。'),
    mokumoku: L('{m}は唐揚げの最後の一個を、黙って{a}の皿に移した。この夜、{m}が自分から動いたのはその一回だけだった。|沈黙が落ちた瞬間、{m}がぼそっと「この店、出汁がうまいですね」と言った。なぜか{a}が吹き出し、つられて全員が笑った。|{m}は焼き鳥の串を外す係を黙々とこなしていた。{a}が「ありがとう」と言うと、{m}は小さくうなずいただけだった。'),
    zaru: L('{m}が「{a}さん、いける口でしょ」と日本酒を注いだ。{a}は断りきれずに、お猪口を空けた。|{m}は{a}に飲み比べを持ちかけた。三杯目で{a}の顔が赤くなり、{m}の顔色は最後まで変わらなかった。|{m}は{a}のグラスが空くたびに「おかわり、いっときます？」と店員を呼んだ。')
  };
  /* 空気を読まないモブのあとで、別の住人がかばう */
  var COVER = L('{b}がすかさず「そういえばこの店の唐揚げ、すごくないですか」と話を変えた。{a}は助かったという顔で{b}を見た。|{b}が「はいはい、その話はまた今度！」と笑って流した。{a}は{b}に、目だけで礼を言った。|{b}が{a}のグラスに飲み物を注ぎ足して、さりげなく話題を引き取った。');
  /* 橋渡し（{a} が {b} に惹かれている） */
  var WING = {
    moriage: L('{m}が「ねえ、{a}と{b}って、さっきから話が合いすぎじゃない？」と大声で言った。{a}と{b}は同時に「そんなことない」と言い、その揃い方にまた冷やかされた。|{m}は「{a}、{b}の隣空いてるよ」と言って、{a}の背中を押した。{a}は文句を言いながらも、その席に座った。|{m}は{a}と{b}の共通点を勝手に三つ数え上げ、「もう運命でしょ」と締めくくった。二人とも笑ったが、目が合うと少し黙った。'),
    sewa: L('{m}はトイレに立つついでに、{a}に「{b}さん、さっきの映画の話、すごく楽しそうでしたよ」と耳打ちした。戻ってきた{a}は、自分から{b}に映画の話を振った。|{m}は大皿を取り分けるふりをして、{a}と{b}の間の席を空けた。気づいたときには、二人は肩が触れそうな距離に座っていた。|{m}は{b}に「{a}さん、ああ見えて聞き上手なんですよ」とさりげなく言った。{b}はそれから、{a}の顔を見て話すようになった。')
  };
  /* 当て馬（{m} が {b} に話しかけ、{b} に惹かれている {a} が妬く）。{b} の返し方は気質で */
  var ATE = L('{m}が{b}に「よかったら、あとで連絡先聞いてもいいですか」と言った。|{m}は{b}の隣に移って、{b}の話にばかり笑っていた。|{m}が{b}のグラスに自分のグラスを当てて、「{b}さんと飲むの、楽しいな」と言った。|{m}が{b}に「今度、二人でその店行きましょうよ」と誘った。');
  var ATE_RE = {
    CP: L('{b}は「今日はそういうのはなしで」とあっさり断った。|{b}は「そういうのは間に合ってます」と、きっぱり線を引いた。'),
    NP: L('{b}は「ありがとう、でもまたみんなでね」とやわらかくかわした。|{b}は笑って受け流し、そのまま{a}のほうにも話を振った。'),
    A: L('{b}は「考えておきます」とだけ言って、話題を変えた。|{b}は丁寧に礼を言い、それ以上は何も言わなかった。'),
    FC: L('{b}は「えー、どうしようかな」とノリで返し、笑ってごまかした。|{b}は「じゃあ三十年後にね」と冗談にして流した。'),
    AC: L('{b}は困ったように笑い、ちらりと{a}のほうを見た。|{b}は返事に詰まって、助けを求めるように{a}を見た。')
  };
  var ATE_JEAL = L('{a}は、そのやりとりから目を離せなかった。手元のグラスの氷が、すっかり溶けていた。|{a}の箸が止まった。自分でも驚くほど、胸の奥がざわついていた。|{a}は聞こえないふりをして、聞き耳を立てていた。|{a}は、なぜか急に飲むペースが上がった。');
  /* 邪魔（いい雰囲気の {a}・{b} に割って入る） */
  var SPOIL = L('{a}と{b}がいい雰囲気になりかけたところで、{m}が「ねえ、二人で何の話？」と割って入った。二人は顔を見合わせて、少し笑った。|{a}が{b}に何か言いかけたとき、{m}が「すみません、店員さーん！」と手を挙げた。言いかけた言葉は、そのまま飲み込まれた。|{m}は{a}と{b}の間にぐいっと座り込み、「ここ、いちばん楽しそうな席だから」と言った。二人は少しだけ、名残惜しそうだった。|{a}と{b}が二人で話し込んでいると、{m}が「はい、内緒話禁止ー！」と大声を出した。{b}は苦笑いし、{a}は小さくため息をついた。');
  /* 席替え */
  var SEAT_WING = L('{m}が「席替えは私が決めます」と仕切り、{a}を{b}の隣に座らせた。偶然を装っていたが、誰が見ても偶然ではなかった。|{m}は割り箸のくじに細工をして、{a}と{b}を隣どうしにした。{a}だけがそれに気づいて、{m}をにらんだ。|{m}は「{a}はそっち、{b}はその隣」とさっさと指をさした。二人とも黙って従った。');
  var SEAT_SPOIL = L('{m}は席替えのどさくさで、{a}と{b}の間に座った。本人に悪気はまったくなかった。|{m}は「ここ空いてる！」と、{a}と{b}の間に滑り込んだ。');
  var SEAT_PLAIN = L('{m}は席替えのたびに、いちばん端の席を選んだ。|{m}は「どこでもいいです」と言って、空いた席に収まった。|席替えのあと、{m}はなぜか店員と一番仲良くなっていた。');
  /* 王様ゲーム：モブが王様（住人への、色っぽくない命令） */
  var KG_ONE = L('一発ギャグ|ものまね|好きな歌のサビを歌う|自分のチャームポイントを3つ言う|子どもの頃のあだ名を発表|語尾に「にゃん」をつけて3分過ごす|変顔で写真を撮られる|黒歴史を一つ告白');
  var KG_TWO = L('あっち向いてホイで勝負|指相撲|手押し相撲|お互いの似顔絵を描き合う|一緒に変顔で写真');
  var KG_ONE_RE = {
    FC: L('{a}はノリノリでやりきった。拍手がいちばん大きかったのは、王様の{m}だった。|{a}は全力でやった。{m}がお腹を抱えて笑った。'),
    AC: L('{a}は真っ赤になりながら、小さな声でやりきった。{m}は「かわいいー！」と囃した。|{a}は消え入りそうな声でやった。{m}が先に照れていた。'),
    CP: L('{a}は「くだらない」と言いながら、律儀にやった。{m}は満足そうにうなずいた。|{a}は眉間にしわを寄せたまま、完璧にこなした。{m}のほうが圧倒された。'),
    NP: L('{a}は「しょうがないなあ」と笑ってやった。場がほっこりした。|{a}は王様の{m}に付き合うように、楽しそうにやった。'),
    A: L('{a}は淡々とやりきった。かえって面白かった。|{a}は一度手順を確認してから、正確にやった。{m}が「真面目か」と突っ込んだ。')
  };
  var KG_TWO_RE = L('{a}と{b}は本気で勝負した。勝ったほうが、なぜか王様の{m}とハイタッチした。|{a}と{b}のぎこちなさに、全員が爆笑した。|{a}と{b}は思ったより息が合っていて、{m}が「仲良しか」と突っ込んだ。');
  /* 王様ゲーム：橋渡しのモブが、くじを見て仕組む */
  var KG_WING = L('王様は{m}。割り箸の番号をこっそり見比べてから、「{a}と{b}で、10秒見つめ合う！」と言った。{a}は先に目を逸らしかけて、{b}に「まだ五秒」と笑われた。|王様は{m}。「{a}と{b}で、お互いのいいところを3つずつ言う！」――言い終わるころには、二人とも耳まで赤かった。|王様は{m}。「{a}と{b}で、名前を呼び捨てで呼び合う！」{a}が{b}の名前を呼ぶと、囃し立てる声が少しだけ静かになった。');
  /* 王様ゲーム：住人の王様の命令がモブに当たる */
  var KG_MOB = {
    moriage: L('王様は{a}。命令が当たったのは{m}で、一発ギャグを三連発して場を最高潮にした。|王様は{a}。{m}は「ものまね」の命令に、頼まれてもいない二人目まで披露した。'),
    sewa: L('王様は{a}。{m}は「全員の飲み物を当てる」という命令を、一つも外さずにこなした。|王様は{a}。命令を受けた{m}は、なぜか全員の空いた皿を片づけてから席に戻った。'),
    kuuki: L('王様は{a}。命令を受けた{m}は、一発ギャグを頼まれたのに五分の漫談をした。誰も止めなかった。|王様は{a}。「黒歴史を一つ」と言われた{m}は、三つ話した。三つ目で{a}が「もういい」と止めた。'),
    aiso: L('王様は{a}。「王様を全力で褒める」という命令に、{m}は一分間{a}を褒め続けた。{a}は途中から耐えられずに笑い出した。|王様は{a}。{m}は命令どおりに歌い、最後に「{a}さんに捧げます」と付け足した。'),
    mokumoku: L('王様は{a}。命令を受けた{m}は、無表情のまま完璧なものまねをした。一拍おいて、全員が崩れ落ちた。|王様は{a}。「一発ギャグ」と言われた{m}は、長い沈黙のあと「……以上です」と言った。それがいちばんウケた。'),
    zaru: L('王様は{a}。罰ゲームの一気を、{m}は三回連続で引き受けた。顔色は変わらなかった。|王様は{a}。{m}は「次の一杯、私が全員分おごります」と勝手に命令を上書きした。')
  };
  /* 酔ったモブ（気質ごと）と、介抱する住人 */
  var DRUNK = {
    moriage: L('{m}は酔って声がさらに大きくなり、隣の部屋から店員が様子を見に来た。立ち上がろうとして、そのまま座布団に崩れ落ちた。|{m}は「もう一回乾杯しよう！」を十分おきに言い続け、五回目の乾杯でグラスを持ったまま動かなくなった。'),
    sewa: L('{m}は酔っても皿を片づけ続け、最後は重ねた皿を抱えたまま眠りかけた。|{m}は全員の帰り道を心配しているうちに、自分がいちばん立てなくなっていた。'),
    kuuki: L('{m}は酔うとさらに空気を読まなくなり、店員を名札の名前で呼び始めたあたりで、ろれつが回らなくなった。|{m}は誰も頼んでいない恋愛相談を始め、話の途中でテーブルに突っ伏した。'),
    aiso: L('{m}は酔うと誰彼かまわず肩を組み、最後は店員とも肩を組んで、そのままよろけた。|{m}は「みんな大好き！」と全員と握手して回り、最後の一人の前で足がもつれた。'),
    mokumoku: L('{m}は静かに飲み続け、気づけばテーブルに突っ伏して寝ていた。|{m}は一言も喋らないまま顔だけが真っ赤になり、立ち上がろうとして壁に手をついた。'),
    zaru: L('さすがの{m}も、八杯目を過ぎたあたりで目が据わり、箸を二回落とした。|{m}は日本酒の一升瓶を抱いたまま「まだいける」と言い張り、そのまま寝息を立て始めた。')
  };
  var CARE1 = L('{a}が{m}の前に水を置き、背中をさすった。「今日はもう帰りましょう」|{a}が{m}の鞄と上着をまとめて、店の外まで肩を貸した。|{a}が{m}の代わりに、タクシーを呼んだ。');
  var CARE2 = L('{a}と{b}が両側から{m}を支えて、店の外まで連れ出した。「せーの」の掛け声が、妙に揃っていた。|{a}が{m}の肩を支え、{b}が水と荷物を持った。言葉を交わさなくても、役割が自然に決まっていた。|{a}と{b}は二人がかりで{m}をタクシーに乗せ、走り去るのを見送ってから、顔を見合わせて笑った。');
  /* 酔った住人を、モブが気にかける */
  var WATER = L('{m}が{a}の前に、黙って水のグラスを置いた。{a}は少し顔を上げた。|{m}は{a}のグラスを、こっそりウーロン茶にすり替えた。|{m}が「{a}さん、一回お手洗い行きましょ」と声をかけて、{a}を連れ出した。');
  /* カラオケ */
  var KARA = {
    wing: L('{m}が「次、{a}と{b}でデュエットね！」と勝手に曲を入れた。{a}は抗議しかけたが、イントロが流れると{b}の隣でマイクを握った。|{m}は{a}と{b}のために、昔のラブソングを入れた。二人は照れながら最後まで歌った。'),
    plain: L('{m}はマイクを離さず、十八番を三曲続けて歌った。|{m}はタンバリン係に徹し、誰の歌にも全力で合いの手を入れた。|{m}は一曲も歌わず、ずっと唐揚げを頼んでいた。|{m}の選んだ演歌で、なぜか全員が肩を組んだ。')
  };
  /* 帰り際（結果の終わり） */
  var BYE = {
    moriage: L('{M}は「また集まろうね！」と全員に手を振り、最後まで声が大きかった。|{M}は最後に全員で写真を撮り、店の前で一人だけ逆方向に帰っていった。'),
    sewa: L('{M}は忘れ物がないか個室を確かめてから、最後に店を出た。|{M}は全員がタクシーや電車に乗るのを見届けてから、一人で歩いて帰った。'),
    kuuki: L('{M}は帰り際、「今日、誰が一番モテてたか発表します」と言いかけて、幹事に止められた。|{M}は最後に「楽しかったです、また呼んでください」と言った。たぶん、もう呼ばれない。'),
    aiso: L('{M}は全員と連絡先を交換して帰った。誰とも、それ以上にはならなかった。|{M}は店の前で一人ひとりに「今日はありがとう」と言って回り、終電に走っていった。'),
    mokumoku: L('{M}は会計のときだけ現れ、きっちり割り勘分を払って静かに帰った。|{M}は「ごちそうさまでした」とだけ言って、誰より先に駅へ向かった。'),
    zaru: L('{M}は「もう一軒」と言い残して、一人で夜の街へ消えていった。|{M}は最後まで顔色を変えずに、全員分の会計を計算して帰っていった。')
  };
  var BYE_DRUNK = L('{M}は最後、誰かに肩を借りてタクシーに押し込まれた。|{M}は店の前のベンチで、しばらく夜風に当たってから帰った。|{M}は駅の階段で一度座り込み、幹事に引きずられるようにして改札を抜けた。|{M}はコンビニで水を買い、それを飲み干してから、ふらふらと帰っていった。|{M}は翌朝、自分がどうやって帰ったのかを覚えていなかった。');
  var BYE_WING = L('{M}は、{a}と{b}が並んで店を出ていくのを見送って、小さくガッツポーズをした。|{M}は帰りの電車で、{a}と{b}の背中を思い出して一人で満足そうに笑った。');
  var BYE_ATE = L('{M}は最後まで、自分が{a}の背中を押したことに気づいていなかった。|{M}は帰り道、「{b}さん、脈なしだったなあ」と一人でつぶやいた。その隣を、{a}と{b}が歩いていた。');

  /* ---------- 共通の道具 ---------- */
  function count(ctx) { var n = Math.round(+(ctx.env && ctx.env.mobs) || 0); return Math.max(0, Math.min(4, n)); }
  function list(ctx) { return (ctx && ctx.gkMob) || []; }
  /* まだ席にいるモブ（酔いつぶれて先に帰ったモブは除く） */
  function here(ctx) { return list(ctx).filter(function (m) { return !m.gone; }); }
  function fill(ctx, t, m, a, b) { return ctx.t(t.replace(/\{M\}/g, m.full).replace(/\{m\}/g, m.name), a, b); }
  function top(c) { return HK.voiceTop ? HK.voiceTop(c) : HK.egoType(c.eg).top; }
  function why(m, s) { return 'モブ（' + m.full + '・' + KINDS[m.kind].label + '）' + (s ? '：' + s : '') + '。モブは住人ではなく、恋愛・夜の相手にならない'; }
  /* 恋愛の出来事にしてよい住人の組（両方向で恋愛対象・その場にいる・恋愛にしない組でない・家族でない） */
  function loveOk(ctx, a, b) { return HK.State.pairLove(a, b) && !HK.ngPair(a, b) && !ctx.pair(a, b).kin && ctx.romanceOk([a, b]); }
  /* {a} が {b} に惹かれている組（橋渡し・当て馬・邪魔の相手） */
  function crushPairs(ctx, min) {
    var P = ctx.present(), out = [];
    P.forEach(function (a) { P.forEach(function (b) { if (a !== b && !ctx.pair(a, b).couple && ctx.R(a, b).att >= min && loveOk(ctx, a, b)) out.push([a, b]); }); });
    return out;
  }
  function pickPair(ctx, L, fn) { return HK.weighted(ctx.rng, L, fn || function (p) { return 0.2 + ctx.R(p[0], p[1]).att / 50; }); }
  function deed(m, k, a, b) { m.deeds.push({ k: k, a: a.i, b: b ? b.i : null }); }

  /* ---------- 準備：モブを作る ---------- */
  function makeMobs(ctx, n) {
    var rng = ctx.rng, P = ctx.chars, used = {}, kinds = {}, roles = rng.shuffle(ROLES), out = [];
    var gm = P.filter(function (c) { return c.gender === 'm'; }).length, gf = P.filter(function (c) { return c.gender === 'f'; }).length;
    for (var k = 0; k < n; k++) {
      /* 男女の数が揃うように（合コンなので）。揃っていれば半々 */
      var g = gm < gf ? 'm' : gf < gm ? 'f' : rng() < 0.5 ? 'm' : 'f';
      if (g === 'm') gm++; else gf++;
      var m = null;
      for (var t = 0; t < 8; t++) {
        m = HK.Mob.make(ctx, { gender: g });
        var nm = m.name;
        if (!used[nm] && !P.some(function (c) { return c.name.indexOf(nm) >= 0 || nm.indexOf(c.name) >= 0; })) break;
      }
      used[m.name] = 1;
      /* 気質はモブどうしで重ならないように（気質の種類はモブの最大人数より多い） */
      var kd = HK.weighted(rng, KIND_IDS.filter(function (id) { return !kinds[id]; }), function (id) { return Math.max(0.05, KINDS[id].fit(m.tr) + 0.25); }) || 'moriage';
      kinds[kd] = 1;
      var role = roles[k % roles.length];
      /* 恋愛・夜・R18の相手にしない印（HK.canLove・HK.Pos.okSex・HK.State.r18ok がどれも通らない） */
      m.likes = 'none'; m.lock = -1; m.noR18 = true; m.noMob = true; m.mob = true;
      m.kind = kd; m.roleId = role.id; m.full = role.full.replace('{n}', m.name);
      m.flags = { drunk: 0 }; m.stats = { drink: kd === 'zaru' ? 5 : 1 + rng.int(4) }; m.deeds = []; m.acts = 0; m.said = {};
      out.push(m);
    }
    return out;
  }

  var setup0 = gk.setup;
  gk.setup = function (ctx) {
    setup0.apply(this, arguments);
    var n = count(ctx);
    ctx.gkMob = [];
    if (!n) return;
    ctx.gkMob = makeMobs(ctx, n);
    /* 同じ席にはモブもいるので、住人が二人だけでも「皆」「誰か」の文を使ってよい */
    ctx.few = function () { return false; };
    ctx.pick = function (arr) {
      var r = this._recent || (this._recent = []), t = this.rng.pick(arr);
      if (arr && arr.length > 1 && typeof t === 'string') {
        for (var i = 0; i < 4 && r.indexOf(t) >= 0; i++) t = this.rng.pick(arr);
        r.push(t); if (r.length > 40) r.shift();
      }
      return t;
    };
  };

  /* ---------- 出来事 ---------- */
  function emit(ctx, o) { return ctx.act2(o); }
  /* ふだんの振る舞い */
  function plain(ctx, m) {
    var P = ctx.present(); if (!P.length) return null;
    var a = HK.weighted(ctx.rng, P, function (c) { return m.kind === 'zaru' ? 0.4 + ctx.stat(c, 'drink') / 3 : m.kind === 'kuuki' ? 0.4 + c.tr.ac : 1; });
    /* 同じモブが同じ文を繰り返さないように */
    var src = DO[m.kind].filter(function (t) { return !m.said[t]; }), line = ctx.pick(src.length ? src : DO[m.kind]);
    m.said[line] = 1;
    var text = fill(ctx, line, m, a);
    if (m.kind === 'kuuki') {
      var cov = ctx.most(P.filter(function (c) { return c !== a; }), function (c) { return c.tr.np * 0.6 + c.tr.warmth * 0.3 + (ctx.R(c, a).aff + 50) / 200; });
      if (cov) {
        return emit(ctx, { actors: [cov, a], cat: 'bond', text: text + fill(ctx, ctx.pick(COVER), m, a, cov),
          fx: function () { ctx.stress(a, 5); ctx.mod2(cov, a, { aff: 3 }, { aff: 5, trust: 4 }); }, why: why(m, '空気を読まない一言を、' + cov.name + 'のNP（面倒見）がかばった'), mag: 6 });
      }
      return emit(ctx, { actors: [a], cat: 'solo', text: text, fx: function () { ctx.stress(a, 6); }, why: why(m, '空気を読まない一言'), mag: 4 });
    }
    return emit(ctx, { actors: [a], cat: 'solo', text: text, why: why(m, KINDS[m.kind].label + 'らしく'), mag: 3,
      fx: function () {
        if (m.kind === 'zaru') a.flags.drunk = HK.clamp((a.flags.drunk || 0) + 10 * (6 - ctx.stat(a, 'drink')) / 3, 0, 100);
        else if (m.kind === 'moriage') { P.forEach(function (c) { ctx.stress(c, -2); }); ctx.stress(a, -3); }
        else ctx.stress(a, -4);
      } });
  }
  /* 橋渡し：{a}→{b} の惹かれを後押しする */
  function wing(ctx, m, src) {
    var L = crushPairs(ctx, 18); if (!L.length) return null;
    var p = pickPair(ctx, L), a = p[0], b = p[1];
    var e = emit(ctx, { actors: [a, b], cat: 'romance', text: fill(ctx, ctx.pick(src || WING[m.kind] || WING.moriage), m, a, b),
      fx: function () { ctx.mod2(a, b, { att: 6, aff: 2 }, { att: 4, aff: 2 }); }, why: why(m, KINDS[m.kind].part === '橋渡し' ? '橋渡し役。' + a.name + 'の惹かれ（' + Math.round(ctx.R(a, b).att) + '）に気づいて、二人をくっつけようとした' : '二人をくっつけようとした'), mag: 8 });
    if (e) deed(m, 'wing', a, b);
    return e;
  }
  /* 当て馬：{m} が {b} に近づき、{b} に惹かれている {a} が妬く */
  function ateuma(ctx, m) {
    var L = crushPairs(ctx, 25); if (!L.length) return null;
    var p = pickPair(ctx, L, function (p) { return 0.2 + ctx.R(p[0], p[1]).att / 40 + p[0].tr.jealous; }), a = p[0], b = p[1];
    var tb = top(b), re = ATE_RE[tb] || ATE_RE.NP;
    var text = fill(ctx, ctx.pick(ATE), m, a, b) + fill(ctx, ctx.pick(re), m, a, b) + fill(ctx, ctx.pick(ATE_JEAL), m, a, b);
    var e = emit(ctx, { actors: [a, b], cat: 'romance', text: text,
      fx: function () { ctx.mod(a, b, { att: 7 }); ctx.stress(a, 6); if (tb === 'AC' || tb === 'NP') ctx.mod(b, a, { att: 3, aff: 2 }); },
      why: why(m, '当て馬。' + b.name + 'に話しかけたことで、' + a.name + 'の嫉妬（' + Math.round(a.tr.jealous * 100) + '）と惹かれに火がついた。' + b.name + 'の返しは' + tb), mag: 9 });
    if (e) deed(m, 'ate', a, b);
    return e;
  }
  /* 邪魔：いい雰囲気の二人に割って入る */
  function spoil(ctx, m, src) {
    var L = crushPairs(ctx, 30).filter(function (p) { return p[0].i < p[1].i && ctx.R(p[1], p[0]).att >= 25; }); if (!L.length) return null;
    var p = pickPair(ctx, L), a = p[0], b = p[1];
    var e = emit(ctx, { actors: [a, b], cat: 'romance', text: fill(ctx, ctx.pick(src || SPOIL), m, a, b),
      fx: function () { ctx.mod2(a, b, { att: -2, ten: 2 }, { att: -2 }); ctx.stress(a, 4); }, why: why(m, 'お邪魔虫。惹かれ合う二人（' + Math.round(ctx.R(a, b).att) + '／' + Math.round(ctx.R(b, a).att) + '）の間に悪気なく割って入った'), mag: 6 });
    if (e) deed(m, 'spoil', a, b);
    return e;
  }
  function act(ctx, m) {
    m.acts++;
    var r = ctx.rng(), e = null, part = KINDS[m.kind].part;
    if (part === '橋渡し' && r < 0.5) e = wing(ctx, m);
    else if (part === '当て馬' && r < 0.55) e = ateuma(ctx, m);
    else if (part === '邪魔' && r < 0.45) e = spoil(ctx, m);
    else if (m.kind === 'zaru' && r < 0.4) {
      var dr = ctx.present().filter(function (c) { return (c.flags.drunk || 0) > 55; });
      if (dr.length) {
        var a = ctx.rng.pick(dr);
        e = emit(ctx, { actors: [a], cat: 'help', text: fill(ctx, ctx.pick(WATER), m, a), fx: function () { a.flags.drunk = HK.clamp(a.flags.drunk - 12, 0, 100); ctx.stress(a, -3); }, why: why(m, '酒に強いぶん、酔った' + a.name + 'に気づいた'), mag: 4 });
      }
    }
    return e || plain(ctx, m);
  }
  /* その段で動くモブ（動いた回数が少ない人ほど出やすい） */
  function actors(ctx, k) {
    var M = here(ctx), out = [];
    while (out.length < k && M.length) {
      var m = HK.weighted(ctx.rng, M, function (x) { return 1 / (1 + x.acts); });
      out.push(m); M.splice(M.indexOf(m), 1);
    }
    return out;
  }

  /* 乾杯・自己紹介 */
  function intro(ctx) {
    var M = list(ctx);
    var nm = M.map(function (m) { return m.full; });
    ctx.say({ text: (nm.length > 1 ? nm.slice(0, -1).join('、') + 'と、' + nm[nm.length - 1] : nm[0]) + 'も、同じテーブルについていた。' });
  }
  function selfIntro(ctx) {
    list(ctx).forEach(function (m) { ctx.say({ text: fill(ctx, ctx.pick(INTRO[m.kind]), m) }); });
  }
  /* 席替え */
  function seat(ctx) {
    var M = list(ctx), w = M.filter(function (m) { return KINDS[m.kind].part === '橋渡し'; }), s = M.filter(function (m) { return m.kind === 'kuuki'; });
    if (w.length && ctx.rng() < 0.6 && wing(ctx, ctx.rng.pick(w), SEAT_WING)) return;
    if (s.length && ctx.rng() < 0.6 && spoil(ctx, ctx.rng.pick(s), SEAT_SPOIL)) return;
    var m = ctx.rng.pick(M);
    ctx.say({ text: fill(ctx, ctx.pick(SEAT_PLAIN), m) });
  }
  /* 王様ゲーム（モブが王様／住人の王様の命令がモブに当たる） */
  function kingRounds(ctx) {
    var P = ctx.present(), M = list(ctx), rng = ctx.rng;
    if (!P.length) return;
    if (P.length < 3) ctx.say({ text: '割り箸のくじが回ってきた。「王様だーれだ！」' });
    var rounds = M.length >= 3 ? 2 : 1;
    var order = rng.shuffle(M);
    for (var r = 0; r < rounds; r++) {
      var m = order[r % order.length];
      if (rng() < 0.55) {
        /* モブが王様 */
        if (KINDS[m.kind].part === '橋渡し' && rng() < 0.6) {
          var e = wing(ctx, m, KG_WING);
          if (e) { e.why = why(m, '王様ゲームの王様。くじを見て、惹かれている二人を組ませた'); continue; }
        }
        if (P.length >= 2 && rng() < 0.4) {
          var two = rng.shuffle(P).slice(0, 2), a = two[0], b = two[1];
          emit(ctx, { actors: [a, b], cat: 'bond', text: '王様は' + m.name + '。「⁠' + a.name + 'と' + b.name + 'で' + rng.pick(KG_TWO) + '！」' + fill(ctx, ctx.pick(KG_TWO_RE), m, a, b),
            fx: function () { ctx.mod2(a, b, { aff: 3 }, { aff: 3 }); ctx.stress(a, -2); ctx.stress(b, -2); }, why: why(m, '王様ゲームの王様。色っぽくない命令'), mag: 4 });
        } else {
          var c = rng.pick(P), tc = top(c);
          emit(ctx, { actors: [c], cat: 'solo', text: '王様は' + m.name + '。「⁠' + c.name + 'が' + rng.pick(KG_ONE) + '！」' + fill(ctx, ctx.pick(KG_ONE_RE[tc] || KG_ONE_RE.NP), m, c),
            fx: function () { ctx.stress(c, 4); ctx.others(c).forEach(function (o) { ctx.mod(o, c, { aff: 2 }); }); }, why: why(m, '王様ゲームの王様。' + c.name + 'の反応は' + tc), mag: 4 });
        }
      } else {
        /* 住人の王様の命令が、モブに当たる */
        var k = ctx.most(P, function (x) { return x.tr.fc * 0.4 + x.tr.lead * 0.3 + ctx.rng() * 0.5; });
        emit(ctx, { actors: [k], cat: 'bond', text: fill(ctx, ctx.pick(KG_MOB[m.kind]), m, k),
          fx: function () { P.forEach(function (x) { ctx.stress(x, -3); }); }, why: why(m, '王様ゲームで命令が当たった。応じ方は' + KINDS[m.kind].label + 'らしく'), mag: 4 });
      }
    }
  }
  /* 酔いつぶれたモブと、介抱する住人（二人で介抱すると、その二人の仲が深まる） */
  function drunkMob(ctx) {
    var M = here(ctx).filter(function (m) { return m.flags.drunk > 55; });
    if (!M.length) return false;
    var m = ctx.most(M, function (x) { return x.flags.drunk / 100; }), P = ctx.present();
    if (!P.length) return false;
    m.gone = true;
    var head = fill(ctx, ctx.pick(DRUNK[m.kind]), m);
    var cs = P.slice().sort(function (x, y) { return (y.tr.np * 0.7 + y.tr.warmth * 0.3) - (x.tr.np * 0.7 + x.tr.warmth * 0.3); });
    var a = cs[0], b = cs[1] && cs[1].tr.np > 0.4 && ctx.rng() < 0.6 ? cs[1] : null;
    if (b) {
      emit(ctx, { actors: [a, b], cat: 'bond', text: head + fill(ctx, ctx.pick(CARE2), m, a, b),
        fx: function () { ctx.mod2(a, b, { aff: 5, trust: 4 }, { aff: 5, trust: 4 }); }, why: why(m, '酔いつぶれた（酔い ' + Math.round(m.flags.drunk) + '）。' + a.name + 'と' + b.name + 'のNP（面倒見）で、二人がかりの介抱に'), mag: 7 });
    } else {
      emit(ctx, { actors: [a], cat: 'help', text: head + fill(ctx, ctx.pick(CARE1), m, a),
        fx: function () { ctx.stress(a, 2); ctx.others(a).forEach(function (o) { ctx.mod(o, a, { aff: 2, trust: 2 }); }); }, why: why(m, '酔いつぶれた（酔い ' + Math.round(m.flags.drunk) + '）。' + a.name + 'のNP（面倒見）'), mag: 5 });
    }
    return true;
  }
  function karaoke(ctx) {
    var M = here(ctx); if (!M.length) return;
    var m = ctx.rng.pick(M);
    if (KINDS[m.kind].part === '橋渡し' && ctx.rng() < 0.6 && wing(ctx, m, KARA.wing)) return;
    ctx.say({ text: fill(ctx, ctx.pick(KARA.plain), m) });
  }

  /* ---------- 組み込み ---------- */
  var phase0 = gk.phase;
  gk.phase = function (ctx, s, n) {
    phase0.apply(this, arguments);
    var M = list(ctx);
    if (!M.length) return;
    ctx.flush();
    var lab = ctx.label || '';
    if (s === 0) intro(ctx);
    if (s === 1) selfIntro(ctx);
    if (s === 2) actors(ctx, M.length >= 3 ? 2 : 1).forEach(function (m) { act(ctx, m); });
    if (s === 1 || s === 3) actors(ctx, 1).forEach(function (m) { act(ctx, m); });
    if (s === 3) seat(ctx);
    if (s === 4) { if (ctx.env.kingsgame === 'yes') kingRounds(ctx); else actors(ctx, 1).forEach(function (m) { act(ctx, m); }); }
    if (s >= 5) {
      if (!drunkMob(ctx) && ctx.rng() < 0.6) actors(ctx, 1).forEach(function (m) { act(ctx, m); });
      if (/カラオケ/.test(lab)) karaoke(ctx);
    }
    ctx.flush();
  };
  var after0 = gk.after;
  gk.after = function (ctx) {
    after0.apply(this, arguments);
    list(ctx).forEach(function (m) {
      var gain = ctx.env.alcohol / 100 * (6 - m.stats.drink) * (2 + ctx.rng() * 4);
      m.flags.drunk = HK.clamp(m.flags.drunk + gain, 0, 100);
    });
  };
  var finish0 = gk.finish;
  gk.finish = function (ctx) {
    finish0.apply(this, arguments);
    var M = list(ctx);
    if (!M.length) return;
    var C = ctx.chars, tg = ctx.flags.together || [];
    function home(i, j) { return tg.some(function (t) { return (t.a === i && t.b === j) || (t.a === j && t.b === i); }) || ctx.pair(C[i], C[j]).couple; }
    var notes = (ctx.flags.endNotes = ctx.flags.endNotes || []);
    notes.push('同じ席にいたモブ（住人ではない）：' + M.map(function (m) { return m.full + '（' + KINDS[m.kind].label + (KINDS[m.kind].part ? '・' + KINDS[m.kind].part : '') + '）'; }).join('、'));
    M.forEach(function (m) {
      var won = m.deeds.filter(function (d) { return (d.k === 'wing' || d.k === 'ate') && d.b != null && home(d.a, d.b); })[0], t;
      if (m.gone) t = fill(ctx, ctx.pick(BYE_DRUNK), m);
      else if (won && won.k === 'wing') t = fill(ctx, ctx.pick(BYE_WING), m, C[won.a], C[won.b]);
      else if (won) t = fill(ctx, ctx.pick(BYE_ATE), m, C[won.a], C[won.b]);
      else if (m.flags.drunk > 85 && m.kind !== 'zaru') t = fill(ctx, ctx.pick(BYE_DRUNK), m);
      else t = fill(ctx, ctx.pick(BYE[m.kind]), m);
      notes.push(t);
    });
  };

  HK.GoukonMob = { count: count, list: list, KINDS: KINDS };
})();
