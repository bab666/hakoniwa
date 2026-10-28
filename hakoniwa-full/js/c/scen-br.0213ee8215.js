;
/* ==== js/mini-extra-b-br.js ==== */
HK.Load.def(154,'js/mini-extra-b-br.js',function(){
(function(){
'use strict';
var E=window.HK.E;
window.HK.addMini('br',[
E('b_dawn','solo','s+','.3+np*.1','','as:-3','{a}は朝焼けを見て、まだ生きていることに安堵した。|{a}は夜明けの冷たい空気を、深く吸い込んだ。|{a}は鳥の声で目を覚まして、一瞬だけここがどこか忘れた。|{a}は朝日に照らされた島の景色が、皮肉なほど美しいと思った。|{a}は夜明けまで生き延びたことを、指を折って数えた。|{a}は朝露で喉を潤した。'),
E('b_ammo','solo','s+','a*.4+aggr*.3','','as:-2','{a}は残りの弾数を、何度も数え直した。|{a}は武器の手入れを、丁寧に行った。|{a}は刃物を、石で研いだ。|{a}は即席の武器を、拾った鉄パイプで作った。|{a}は武器を手放さないように、手首に紐で結んだ。|{a}は武器を構えたまま、うとうとしかけた。'),
E('b_rival_spot','conflict','p','a*.3+caution*.3','allies<1','ab:ten6','{a}は遠くの崖の上に、{b}の姿を見つけた。|{a}は{b}が武器を持って歩いているのを、木陰から見ていた。|{a}は{b}の居場所を、地図に書き込んだ。|{a}は{b}が誰かと一緒にいるのを見て、警戒を強めた。|{a}は{b}が通った跡を、追うべきか迷った。|{a}は{b}の背中を、武器の照準越しに見つめた。'),
E('b_offer','bond','p+','warmth*.4+np*.3','allies<1&ten<35','ab:trust5;ba:trust5','{a}は{b}に、両手を上げて近づいた。|{a}は{b}に「水を分けるから、話を聞いて｜水を分けるから、話を聞いてくれ｜水を分けますから、話を聞いてください」と言った。|{a}は{b}に、自分の武器を地面に置いて見せた。|{a}は{b}に、一緒に脱出の方法を探そうと持ちかけた。|{a}は{b}に、昔のクラスの話をして警戒を解いた。|{a}は{b}に「私は誰も殺してない｜私は誰も殺していない｜私は誰も殺していません」と言った。'),
E('b_betray_think','betray','s','cold*.4+aggr*.3','step>3','as:-2','{a}は、同盟相手が眠ったら終わらせるつもりだった。|{a}は、最後の二人になったときのことを考えていた。|{a}は誰を最後に残すべきかを、冷静に計算していた。|{a}は仲間の背中を見ながら、武器の位置を確かめた。|{a}は誰を利用できるかを、頭の中でリストにしていた。|{a}は情を捨てると、心の中で決めた。'),
E('b_team_split_food','help','p+','np*.4+warmth*.2','allies>0','ba:aff4;ab:aff3','{a}は{b}と、最後の缶詰を半分ずつ分けた。|{a}は{b}に、一番いいところを譲った。|{a}は{b}が食べるのを見届けてから、自分の分を食べた。|{a}は{b}に、甘いものを残しておいた。|{a}は{b}と、空腹を紛らわすために料理の話をした。|{a}は{b}に、昔食べた一番美味しいものの話をさせた。'),
E('b_hide_together','romance','p','att/50+caution*.2','allies>0&att>25','ab:att5,trust4;ba:att5,trust4','{a}と{b}は、狭い押し入れの中で息を殺していた。体が触れ合っていた。|{a}は{b}の口を手で塞いで、足音が遠ざかるのを待った。|{a}と{b}は、暗闇の中で互いの手を握っていた。|{a}は{b}を自分の背中に隠して、物陰に身を潜めた。|{a}と{b}は、心臓の音が聞こえる距離で隠れていた。|{a}は{b}の震えを止めるように、肩を抱いた。'),
E('b_wounded_ally','help','p+','np*.5+aff/60','allies>0&B.hp<60','ba:aff7,trust7;bhp:8','{a}は{b}の傷を、自分のシャツを裂いて縛った。|{a}は{b}が意識を失わないように、話しかけ続けた。|{a}は{b}を背負って、安全な場所まで運んだ。|{a}は{b}のために、薬を探しに危険な場所へ向かった。|{a}は{b}の手を握って「死なないで｜死ぬな｜死なないでください」と言った。|{a}は{b}の額の汗を拭いながら、夜を明かした。'),
E('b_promise_ally','bond','p+','honesty*.3+np*.3','allies>0','ab:trust7,aff4;ba:trust7,aff4','{a}は{b}と、最後の二人になっても殺し合わないと誓った。|{a}は{b}と、一緒に首輪を外す方法を見つけようと約束した。|{a}は{b}に「どちらかが死んだら、残った方が家族に伝える｜＝｜どちらかが死んだら、残った方が家族に伝えます」と言った。|{a}は{b}と、互いの家族の名前を教え合った。|{a}は{b}と、生き残ったら必ず会おうと約束した。|{a}は{b}に、自分の最後の言葉を預けた。'),
E('b_hunted','solo','s+','caution*.4+stress/120','','as:7','{a}は誰かに追われている気配を感じて、何時間も走り続けた。|{a}は自分の足跡を消しながら、慎重に進んだ。|{a}は追跡者をまくために、わざと遠回りをした。|{a}は振り返るたびに、誰かの影を見た気がした。|{a}は追手から逃れるために、冷たい川を渡った。|{a}は気配が消えるまで、木の上で動かなかった。'),
E('b_killer_rep','conflict','s','kills*.5+aggr*.3','kills>0','gab:ten3;as:-2','{a}が人を殺したという噂が、生き残りの間に広まっていた。|{a}は自分を恐れる視線を、肌で感じていた。|{a}は誰かが自分を見て逃げ出すのを見た。|{a}は「殺人者」と呼ばれるのを、聞いてしまった。|{a}はもう誰も自分に近づかないことを悟った。|{a}は自分の名前が恐怖とともに囁かれているのを知った。'),
E('b_ally_romance2','romance','p+','att/50+np*.2','allies>0&att>30','ab:att6;ba:att6','{a}は{b}の寝顔に、そっと上着をかけた。|{a}は{b}が笑ったのを見て、ここが戦場だということを一瞬忘れた。|{a}は{b}の手を握ったまま、眠りに落ちた。|{a}は{b}に「あなたがいるから、まだ戦える｜＝｜あなたがいるから、まだ戦えます」と言った。|{a}は{b}の頬についた泥を、指で拭った。|{a}は{b}に、生きて帰ったら伝えたいことがあると言った。'),
E('b_scared_child','help','p+','np*.6','B.stress>50','ba:aff7,trust7;bs:-10','{a}は震えて動けない{b}の手を引いて、物陰に連れて行った。|{a}は{b}に「大丈夫、私がいるよ｜大丈夫だ、私がいる｜大丈夫です、私がいます」と言った。|{a}は泣きじゃくる{b}を、胸に抱き寄せた。|{a}は{b}が落ち着くまで、そばを離れなかった。|{a}は{b}の代わりに、見張りを引き受けた。|{a}は{b}に、子どもの頃に聞いた子守唄を歌った。'),
E('b_radio','escape','s+','a*.4+fc*.2','','as:-2','{a}は拾った無線機から、主催者たちの会話を聞いた。|{a}はラジオから、外の世界のニュースが流れているのに気づいた。|{a}は無線で、他の生き残りと交信しようとした。|{a}は主催者の通信の周波数を、メモに書き留めた。|{a}は無線から聞こえる笑い声に、怒りを覚えた。|{a}は無線を通して、誰かの助けを求める声を聞いた。'),
E('b_spare_kid','help','p','np*.5-aggr*.3','allies<1','ba:aff8,trust5;ab:aff3','{a}は武器を向けてきた{b}に、自分の食料を投げ渡した。|{a}は{b}に、自分の隠れ家を譲った。|{a}は{b}に、安全な場所を教えて立ち去った。|{a}は{b}の命乞いに、黙って頷いた。|{a}は{b}が逃げるのを、追わなかった。|{a}は{b}に「あなたは生きて｜あなたは生きろ｜あなたは生きてください」と言った。'),
E('b_shout_name','solo','s+','np*.3+fc*.3','','as:4','{a}は森の中で、友達の名前を叫んで探した。|{a}は「誰かいない？｜誰かいないか｜誰かいませんか？」と叫んで、すぐに後悔した。|{a}は返事のない呼びかけを、何度も繰り返した。|{a}は自分の声が、誰かを呼び寄せてしまう危険を忘れていた。|{a}は誰かの名前を呼びながら、涙が止まらなかった。|{a}は叫び声の後の沈黙に、背筋が凍った。'),
E('b_photo','solo','s+','np*.3+ac*.3','','as:3','{a}は財布の中の家族写真を、何度も見返した。|{a}はクラスの集合写真を、ポケットの中で握りしめていた。|{a}は誰かと撮ったプリクラを、そっと胸に当てた。|{a}は写真の中の笑顔を、もう一度見たいと思った。|{a}は写真の裏に、何かを書き残した。|{a}は写真を見て、生きて帰る理由を思い出した。'),
E('b_vengeance_plan','conflict','p','griev*.5+cold*.3','griev>0','ab:ten8','{a}は{b}が仲間を殺したと信じて、罠を仕掛けた。|{a}は{b}の通りそうな道に、待ち伏せの準備をした。|{a}は{b}の行動パターンを、執拗に観察した。|{a}は{b}の居場所を、他の生き残りに聞いて回った。|{a}は{b}を殺す方法を、何通りも考えた。|{a}は{b}への復讐だけを、生きる理由にしていた。'),
E('b_ally_skill','bond','p+','a*.3+#agi*.06','allies>0','ab:trust4;ba:trust4','{a}は{b}に、音を立てずに歩く方法を教えた。|{a}は{b}と、互いの得意なことを活かした役割分担を決めた。|{a}は{b}の器用さに、何度も助けられた。|{a}は{b}に、武器の扱い方を教えた。|{a}は{b}と、敵の動きを予測する練習をした。|{a}は{b}に、応急手当の仕方を教えた。'),
E('b_bluff','conflict','p+','cold*.3+a*.3+fc*.2','allies<1','ba:ten6;bs:5','{a}は空の銃を構えて、{b}を威嚇した。|{a}は「仲間が周りにいるよ｜仲間が周りにいる｜仲間が周りにいます」と嘘をついて、{b}を追い払った。|{a}は{b}に、自分が何人も殺したと言った。嘘だった。|{a}は{b}に、毒を持っていると思わせた。|{a}は{b}の前で、わざと余裕のある笑みを浮かべた。|{a}は{b}に、禁止エリアの偽の情報を教えた。'),
E('b_cooking','bond','p+','np*.3+fc*.3','allies>0','ab:aff4;ba:aff4','{a}は{b}と、民家の台所で即席の料理を作った。|{a}は{b}に、缶詰を温めて出した。|{a}は{b}と、見つけたお菓子を分け合った。|{a}は{b}に、まともな食事を作ると約束した。|{a}は{b}と、焚き火で芋を焼いた。|{a}は{b}に、手料理を振る舞って「うまい｜＝｜おいしいです」と言わせた。'),
E('b_rule','solo','s+','a*.4+cp*.3','','as:-3','{a}は「夜は動かない、水場には近づかない｜＝｜夜は動かない、水場には近づかないことです」と、自分のルールを決めた。|{a}は生き残るための三か条を、心の中で唱えた。|{a}は誰も信じないと、決めていた。|{a}は一度決めた隠れ家を、二日以上使わないと決めた。|{a}は武器を持った相手には近づかないと決めた。|{a}は誰かを殺す前に、必ず三秒数えると決めていた。'),
E('b_ghost','solo','s+','stress/80+ac*.2','step>4','as:6','{a}は死んだはずの誰かの声を、聞いた気がした。|{a}は森の中で、誰かの影が手招きするのを見た。|{a}は夢と現実の区別が、つかなくなっていた。|{a}は自分の名前を呼ぶ声に、振り返った。誰もいなかった。|{a}は死んだ友達と、話をしている気がした。|{a}は自分がもう死んでいるのではないかと思った。'),
E('b_rescue_try','help','p+','np*.5+cp*.3','B.hp<50','ba:aff7,trust7;ahp:-6','{a}は{b}が襲われているのを見て、迷わず飛び込んだ。|{a}は{b}を助けるために、自分の身を危険にさらした。|{a}は{b}を襲っていた誰かに、石を投げつけた。|{a}は{b}の盾になって、傷を負った。|{a}は{b}を連れて、命からがら逃げ出した。|{a}は{b}に「怪我はない？｜怪我はないか｜怪我はありませんか？」と、自分の傷より先に訊いた。'),
E('b_ruthless','conflict','p','cold*.5+aggr*.4','allies<1&step>2','ab:ten8;ba:ten6','{a}は武器を持たない{b}を見ても、躊躇しなかった。|{a}は{b}に「あなたが生きてる意味はない｜あなたが生きている意味はない｜あなたが生きている意味はありません」と言った。|{a}は{b}の命乞いを、聞かないふりをした。|{a}は{b}の背中に、照準を合わせた。|{a}は{b}が逃げる方向を、冷静に読んだ。|{a}は{b}の仲間を先に始末しようと考えた。'),
E('b_last_words','solo','s+','1-hp/100+np*.2','hp<40','as:4','{a}は自分の傷を見て、残された時間が少ないことを悟った。|{a}は血で、木の幹に誰かへの言葉を書いた。|{a}は最期に会いたい人の顔を、思い浮かべた。|{a}は自分の死に場所を、自分で選ぼうと思った。|{a}は空を見上げて、きれいだと思った。|{a}は「まだやり残したことがある｜＝｜まだやり残したことがあります」と呟いた。'),
E('b_cooperate_kill','betray','p','cold*.4+aggr*.3','allies>0&step>3','ab:trust2;ba:trust2','{a}は{b}と、共通の敵を倒す計画を立てた。|{a}は{b}と、他の生き残りを罠にかける作戦を練った。|{a}は{b}に、強い武器を持つ相手から先に倒そうと持ちかけた。|{a}は{b}と、手分けして標的を追い詰めた。|{a}は{b}に「生き残るには、こうするしかない｜＝｜生き残るには、こうするしかありません」と言った。|{a}は{b}の手を汚させたくなくて、自分が前に出た。'),
E('b_forgive','help','p+','np*.5+a*.2','ten>40','ab:ten-12;ba:ten-10,trust5','{a}は自分を傷つけた{b}を、許すことにした。|{a}は{b}に「あなたも怖かったんでしょ｜あなたも怖かったんだろ｜あなたも怖かったんでしょう」と言った。|{a}は{b}が自分を襲った理由を、理解しようとした。|{a}は{b}に、もう恨んでいないと告げた。|{a}は{b}の武器を、そっと地面に置かせた。|{a}は{b}に「ここで殺し合っても、何も残らないよ｜ここで殺し合っても、何も残らない｜ここで殺し合っても、何も残りません」と言った。'),
E('b_count','solo','s+','a*.4+cold*.2','step>2','as:2','{a}は残りの人数と、自分が最後に残る確率を計算した。|{a}は誰がまだ生きているかを、放送で整理した。|{a}は残りの生存者の武器を、推測していた。|{a}は自分が殺さずに済む方法を、まだ探していた。|{a}は残り時間と禁止エリアの広がりを、計算していた。|{a}は誰と誰が組んでいるかを、地図の上で整理した。'),
E('b_hug','romance','p','att/40+np*.2','att>40&ratt>30','ab:att6,aff5;ba:att6,aff5','{a}は再会した{b}を、何も言わずに抱きしめた。|{a}は{b}の背中に腕を回して、震えが止まるまで離さなかった。|{a}は{b}の肩に顔を埋めて、生きていてよかったと言った。|{a}は{b}を抱き寄せて、髪に顔を埋めた。|{a}は{b}の体温を確かめるように、強く抱いた。|{a}は{b}を抱きしめたまま、夜明けまで動かなかった。'),
E('b_wrong_target','conflict','p','impulse*.4+stress/100','stress>45','ab:ten5;ba:ten8,trust-8','{a}は物音に驚いて、{b}に武器を向けてしまった。|{a}は{b}を敵と見間違えて、石を投げた。|{a}は{b}が自分を狙っていると思い込んだ。|{a}は{b}の差し出した手を、罠だと疑った。|{a}は{b}の声を聞き間違えて、逃げ出した。|{a}は{b}が裏切ったと思い込んで、問い詰めた。'),
E('b_supply_drop','conflict','s','aggr*.4+fc*.3','step>2','as:3;ahp:5','{a}は主催者が投下した物資を、危険を承知で取りに行った。|{a}は広場に置かれた補給物資に、誰よりも早く駆けつけた。|{a}は補給物資を巡って、誰かと鉢合わせしかけた。|{a}は罠かもしれない物資を、遠くから観察していた。|{a}は補給物資の中身が、空だったことに絶望した。|{a}は物資を持ち帰る途中で、誰かの視線を感じた。'),
E('b_ally_fight','conflict','p+','cp*.4+stress/100','allies>0&ten>20','ab:ten6;ba:ten6','{a}は{b}と、次にどこへ向かうかで言い争った。|{a}は{b}が勝手に動いたことを責めた。|{a}は{b}に「あなたのせいで見つかるところだった｜＝｜あなたのせいで見つかるところでした」と言った。|{a}は{b}の判断を信用できなくなっていた。|{a}は{b}と、食料の分け方で揉めた。|{a}は{b}に「足手まとい｜足手まといだ｜足手まといです」と言ってしまった。'),
E('b_play_dead','solo','s+','a*.4+caution*.4','','as:5','{a}は誰かが近づいてきたとき、死んだふりをしてやり過ごした。|{a}は血のついた服を着て、倒れているふりをした。|{a}は地面に伏せて、息を止めた。|{a}は自分の上を誰かが通り過ぎるまで、動かなかった。|{a}は死体の横に並んで、死体のふりをした。|{a}は息を殺しすぎて、気を失いかけた。'),
E('b_spy_ally','betray','p','cold*.4+a*.3','allies>0','ab:trust-5','{a}は{b}が眠っている間に、その鞄の中身を調べた。|{a}は{b}が隠し持っている武器を、こっそり確かめた。|{a}は{b}の本当の目的を、探ろうとした。|{a}は{b}が誰かと連絡を取っていないか、監視していた。|{a}は{b}の言葉の裏を、いつも考えていた。|{a}は{b}の弱点を、ノートに書き留めていた。'),
E('b_mercy_ask','solo','s+','ac*.4+np*.3','hp<60','as:6','{a}は「殺さないで｜殺すな｜殺さないでください」と、誰もいない森に向かって呟いた。|{a}は生き残るためなら、何でもすると誓った。|{a}は武器を捨てて、白旗を上げようか迷った。|{a}は誰かに見つかったら、命乞いをしようと決めていた。|{a}は自分の弱さが、恥ずかしかった。|{a}は助けを求める声を、喉の奥で押し殺した。'),
E('b_hold_hands','romance','p+','att/50+warmth*.2','allies>0&att>30','ab:att5,trust4;ba:att5,trust4','{a}は{b}と、手を繋いだまま森を抜けた。|{a}は{b}の手を引いて、禁止エリアから逃げ出した。|{a}は{b}の手を握って「離さないでよ｜離すなよ｜離さないでくださいね」と言った。|{a}は{b}と、繋いだ手から勇気をもらっていた。|{a}は{b}の手の冷たさを、自分の手で温めた。|{a}は{b}と手を繋いだまま、星を見上げた。'),
E('b_strategy','escape','p+','a*.5+lead*.2','allies>0','ab:trust5;ba:trust5','{a}は{b}と、禁止エリアの進行を予測して移動ルートを決めた。|{a}は{b}と、主催者の監視の目を逃れる方法を考えた。|{a}は{b}と、最後の局面での動き方を話し合った。|{a}は{b}に、生き残りの数が減ったときの作戦を伝えた。|{a}は{b}と、首輪の爆破範囲について推理した。|{a}は{b}と、島の地形を利用した罠を考えた。'),
E('b_regret','solo','s+','np*.4+honesty*.3','','as:5','{a}は昔、誰かに言えなかった謝罪の言葉を思い出していた。|{a}は誰かにもっと優しくすればよかったと後悔した。|{a}は教室で無視していた誰かのことを、今になって思い出した。|{a}は最後に親と喧嘩したまま家を出たことを、悔やんだ。|{a}は伝えられなかった想いを、胸の奥で反芻した。|{a}はもう一度、普通の日に戻りたいと願った。'),
E('b_noise_make','conflict','s','fc*.3+impulse*.3','','as:4;gab:ten1','{a}は空き缶を蹴飛ばして、大きな音を立ててしまった。|{a}はくしゃみを堪えきれなかった。|{a}は足を滑らせて、枯れ枝を盛大に踏み折った。|{a}はお腹の音が大きすぎて、隠れ場所がばれるかと思った。|{a}は落としたペットボトルが、坂を転がっていくのを見送った。|{a}は眠りながら、寝言を言ってしまった。'),
E('b_save_enemy','help','p','np*.6-cold*.2','allies<1&B.hp<50','ba:aff8,trust6;bhp:6','{a}は倒れている{b}を見つけて、迷った末に手当てをした。|{a}は敵だった{b}に、水を飲ませた。|{a}は{b}の傷を縛って、立ち去った。|{a}は{b}を安全な場所まで運んだ。|{a}は{b}に「借りは返さなくていいよ｜借りは返さなくていい｜借りは返さなくていいです」と言った。|{a}は{b}に、自分の包帯を投げ渡した。'),
E('b_light','solo','s+','fc*.3+np*.2','','as:-3','{a}は夜空の星を見上げて、ここがどこでも星は同じだと思った。|{a}は月明かりの下で、自分の影を見つめた。|{a}は蛍の光を見つけて、少しだけ心が軽くなった。|{a}は遠くの灯台の光を、希望のように見つめた。|{a}は朝日が昇るのを見て、もう一日生きようと思った。|{a}は焚き火の炎を見つめて、家の暖炉を思い出した。'),
E('b_question','bond','p+','honesty*.3+a*.2','allies>0','ab:trust4;ba:trust4','{a}は{b}に「もし最後の二人になったら、どうする？｜もし最後の二人になったら、どうする｜もし最後の二人になったら、どうしますか？」と訊いた。|{a}は{b}に、なぜ自分を信じたのかを訊いた。|{a}は{b}に、ここに来る前に何をしていたかを訊いた。|{a}は{b}に、一番会いたい人は誰かを訊いた。|{a}は{b}に、誰かを殺したことがあるかを訊いた。|{a}は{b}に、生き残ったら最初に何をしたいかを訊いた。'),
E('b_trade','bond','p+','a*.3+warmth*.2','allies<1&ten<30','ab:trust3;ba:trust3','{a}は{b}と、水と包帯を交換する取引をした。|{a}は{b}に、禁止エリアの情報と食料を交換しようと持ちかけた。|{a}は{b}と、互いを見逃すという約束を交わした。|{a}は{b}に、武器の弾と引き換えに地図を渡した。|{a}は{b}と、次に会うまでは敵対しないと決めた。|{a}は{b}に、安全な水場の場所を教える代わりに食料をもらった。'),
E('b_curse_org','escape','g','cp*.4+aggr*.3','','gab:trust2','{a}は監視カメラに向かって、主催者への呪いの言葉を吐いた。|{a}は首輪に向かって「絶対に許さない｜＝｜絶対に許しません」と叫んだ。|{a}は放送に向かって、石を投げつけた。|{a}は「こんなゲーム、終わらせてやる｜＝｜こんなゲーム、終わらせてみせます」と宣言した。|{a}は主催者の旗を、引きずり下ろした。|{a}は壁に、主催者への怒りを書き殴った。'),
E('b_child_memory','solo','s+','np*.3+ac*.3','','as:3','{a}は子どもの頃に遊んだ公園のことを、なぜか思い出していた。|{a}は母親に読んでもらった絵本の一節を、口ずさんだ。|{a}は初めて自転車に乗れた日のことを思い出した。|{a}は小学生の頃の夏休みの匂いを、思い出した。|{a}は誰かに褒められた記憶を、一つずつ数えた。|{a}は子どもの頃の自分に、今の自分を見せたくないと思った。'),
E('b_watch_over','help','p','np*.5+aff/60','aff>35','ab:aff4;as:3','{a}は遠くから、{b}が無事かどうかを見守っていた。|{a}は{b}に気づかれないように、その後をついて行った。|{a}は{b}に近づこうとする誰かを、遠くから牽制した。|{a}は{b}の隠れ家の周りに、こっそり罠を仕掛けて守った。|{a}は{b}が生きていることを、放送のたびに確かめていた。|{a}は{b}のために、食料を置いて立ち去った。'),
E('b_fatigue','solo','s+','stress/100+.1','step>3','as:3;ahp:-2','{a}は眠気と疲労で、立っているのがやっとだった。|{a}は足の裏の豆が潰れて、歩くたびに痛んだ。|{a}は空腹と疲れで、判断が鈍っていた。|{a}はもう走れないと思った。|{a}は自分の手が震えて、武器をうまく握れなかった。|{a}は一瞬だけ、すべてを投げ出したくなった。')
]);
})();
});
;
/* ==== js/incidents-br.js ==== */
HK.Load.def(405,'js/incidents-br.js',function(){
(function(){
'use strict';
var HK=window.HK;
HK.INCIDENTS=HK.INCIDENTS||{};
function R(ctx,a,b){return ctx.R(a,b);}
function names(list){return list.map(function(c){return c.name;}).join('・');}
function hurt(ctx,c,v,how){c.hp-=v;if(c.hp<=0&&c.alive)ctx.kill(c,null,how);}
function without(list,x){return list.filter(function(c){return x.indexOf?x.indexOf(c)<0:c!==x;});}
function fav(ctx,a,pool){
var best=null,bv=25;
pool.forEach(function(o){if(o===a)return;var r=R(ctx,a,o),v=r.aff*0.6+r.att;if(v>bv){bv=v;best=o;}});
return best;
}
HK.INCIDENTS.br=[
{
id:'vote',min:3,from:2,
w:function(){return 1.2;},
run:function(ctx){
var P=ctx.present(),votes={},ballots=[];
ctx.incident('放送：「特別ゲーム。生存者全員で投票し、最多票の一名を処刑する。白票は本人の首輪を作動させる」');
P.forEach(function(a){
var pick=ctx.most(ctx.others(a),function(o){var r=R(ctx,a,o);return r.ten-r.aff*0.6-r.trust*0.3+(a.flags.revenge===o.i?60:0);});
votes[pick.i]=(votes[pick.i]||0)+1;
ballots.push({a:a,b:pick});
});
var top=ctx.most(P,function(c){return(votes[c.i]||0)*10;});
var max=votes[top.i];
var tied=P.filter(function(c){return votes[c.i]===max;});
if(ballots.length<=8)ctx.say({text:'開票：'+ballots.map(function(x){return x.a.name+'→'+x.b.name;}).join('、')});
else ctx.say({text:'開票：'+P.filter(function(c){return votes[c.i];}).sort(function(x,y){return votes[y.i]-votes[x.i];}).slice(0,5).map(function(c){return c.name+' '+votes[c.i]+'票';}).join('、')+(P.length>5?'ほか':'')});
var shown=0;
ballots.forEach(function(x){
var r=R(ctx,x.a,x.b);
if(r.aff>20&&shown++ <6)ctx.act2({actors:[x.a,x.b],cat:'betray',odd:true,fx:function(){ctx.mod(x.b,x.a,{trust: -30,ten:25,aff: -15});},
text:ctx.t('{a}は、好意を持っていたはずの{b}の名前を書いていた。',x.a,x.b),why:'生き残るための計算。'+x.a.name+'の'+(x.a.tr.cold>0.55?'ドライさ':'恐怖')});
else ctx.act2({actors:[x.a,x.b],cat:'conflict',fx:function(){ctx.mod(x.b,x.a,{ten:10,trust: -8});},text:'',why:''});
});
if(tied.length>1){
ctx.say({text:'同票。'+names(tied)+'の首輪から電流が流れた。'});
tied.forEach(function(c){hurt(ctx,c,28,'投票ゲームの電流で');});
}else{
ctx.kill(top,null,'投票ゲームで処刑された（'+max+'票）');
P.forEach(function(o){
if(o===top|| !o.alive||R(ctx,o,top).aff<35)return;
ballots.forEach(function(x){if(x.b===top&&x.a!==o){ctx.k=1;ctx.mod(o,x.a,{ten:20,aff: -12});o.flags.revenge=x.a.i;}});
});
}
}
},
{
id:'dilemma',min:2,
run:function(ctx){
var P=ctx.present(),rng=ctx.rng;
var a=rng.pick(P),b=ctx.most(ctx.others(a),function(o){return Math.abs(R(ctx,a,o).aff)+R(ctx,a,o).ten;});
ctx.incident('放送：「'+a.name+'と'+b.name+'は別々の部屋へ。『信じる』か『裏切る』か、ボタンを一つ押せ」');
function choose(x,y){var r=R(ctx,x,y);return r.trust+x.tr.np*40-x.tr.cold*30-(x.goal.id==='last'?25:0)+rng()*30*(0.5+ctx.chaos)>25;}
var ca=choose(a,b),cb=choose(b,a);
var txt,why;
if(ca&&cb){
txt='二人とも『信じる』を押した。扉が開き、二人分の水と食料が置かれていた。';
ctx.act2({actors:[a,b],cat:'bond',mag:15,fx:function(){a.hp=Math.min(100,a.hp+15);b.hp=Math.min(100,b.hp+15);ctx.mod2(a,b,{trust:25,aff:10},{trust:25,aff:10});},text:txt,why:'互いの信頼（'+Math.round(R(ctx,a,b).trust)+'／'+Math.round(R(ctx,b,a).trust)+'）'});
}else if(!ca&& !cb){
ctx.act2({actors:[a,b],cat:'betray',fx:function(){hurt(ctx,a,30,'信頼ゲームの罰で');hurt(ctx,b,30,'信頼ゲームの罰で');ctx.mod2(a,b,{ten:15},{ten:15});},
text:'二人とも『裏切る』を押した。両方の首輪が鳴った。',why:'互いに相手を信じきれなかった'});
}else{
var tr=ca?b:a,vi=ca?a:b;
ctx.act2({actors:[tr,vi],cat:'betray',mag:20,fx:function(){tr.hp=Math.min(100,tr.hp+20);hurt(ctx,vi,40,tr.name+'に裏切られた信頼ゲームで');ctx.mod(vi,tr,{trust: -60,ten:40,aff: -25});vi.flags.revenge=tr.i;},
text:ctx.t('{a}は『裏切る』を、{b}は『信じる』を押した。',tr,vi),why:tr.name+'のドライさ（'+Math.round(tr.tr.cold*100)+'）／'+vi.name+'の'+(vi.tr.np>0.55?'NP':'信頼')});
}
}
},
{
id:'roulette',min:2,from:3,
run:function(ctx){
var P=ctx.rng.shuffle(ctx.present()).slice(0,4),rng=ctx.rng;
ctx.incident('放送：「'+names(P)+'は体育館へ。弾は一発、六つの穴。順番に引き金を引け」');
var first=ctx.most(P,function(c){return c.tr.cp*0.5+c.tr.fc*0.5+c.tr.cold*0.3;});
ctx.act2({actors:[first],cat:'solo',text:ctx.t('最初に銃を取ったのは{a}だった。',first),why:first.name+'の'+(first.tr.cp>first.tr.fc?'CP（自分で決めたい）':'FC（どうせなら先に）')});
var order=[first].concat(P.filter(function(c){return c!==first;}));
var left=6;
for(var t=0;t<8;t++){
var cur=order[t%order.length];
if(!cur.alive)continue;
var sub=ctx.most(P.filter(function(o){return o!==cur&&o.alive;}),function(o){return R(ctx,o,cur).aff/100+o.tr.np*0.5;});
var shooter=cur;
if(sub&&R(ctx,sub,cur).aff>45&&sub.tr.np>0.55&&rng()<0.6){
shooter=sub;
ctx.act2({actors:[sub,cur],cat:'help',mag:20,fx:function(){ctx.mod2(sub,cur,{aff:5},{aff:20,trust:20,att:10});},
text:ctx.t('{b}の番で、{a}が銃を奪った。「代わる｜代わろう｜代わります」',sub,cur),why:sub.name+'のNPと'+cur.name+'への好意（'+Math.round(R(ctx,sub,cur).aff)+'）'});
}
if(rng()<1/left){ctx.kill(shooter,null,'ロシアンルーレットの'+(7-left)+'発目で');break;}
left--;
ctx.say({text:shooter.name+'、空砲。'});
if(left<=1)break;
}
P.forEach(function(c){if(c.alive)c.stress=HK.clamp(c.stress+18,0,100);});
}
},
{
id:'confession',min:2,from:1,
run:function(ctx){
var P=ctx.present(),picks={};
if(P.length>10)P=ctx.rng.shuffle(P).slice(0,10);
ctx.incident('放送：「紙に一番大切な人の名前を書け。両想いだった二人には、救急箱と食料を与える」');
P.forEach(function(a){picks[a.i]=fav(ctx,a,ctx.others(a));});
var done={};
P.forEach(function(a){
var b=picks[a.i];
if(!b){ctx.act2({actors:[a],cat:'solo',text:ctx.t('{a}の紙は白紙だった。',a),why:a.name+'に、名前を書くほどの相手がいなかった'});return;}
if(done[a.i])return;
if(picks[b.i]===a){
done[a.i]=done[b.i]=1;
ctx.pair(a,b).confessed[a.i]=ctx.pair(a,b).confessed[b.i]=true;
ctx.act2({actors:[a,b],cat:'romance',mag:25,fx:function(){a.hp=Math.min(100,a.hp+20);b.hp=Math.min(100,b.hp+20);ctx.mod2(a,b,{att:14,aff:10,trust:12},{att:14,aff:10,trust:12});},
text:ctx.t('{a}と{b}の名前が並んで読み上げられた。互いの名前を書いていた。',a,b),why:'両想い（惹かれ '+Math.round(R(ctx,a,b).att)+'／'+Math.round(R(ctx,b,a).att)+'）'});
}else{
var c=picks[b.i];
ctx.act2({actors:[a,b],cat:'romance',fx:function(){ctx.mod(b,a,{att:b.tr.np>0.5?6:2,ten:b.tr.cold>0.6?4:0});ctx.stress(a,12);if(c){ctx.mod(a,c,{ten:12});ctx.pair(a,c).jealous++;}},
text:ctx.t('{a}は{b}の名前を書いた。'+(c?'{b}が書いたのは{c}だった。':'{b}の紙は白紙だった。'),a,b,c),why:'一方通行の想いが、全員の前で明かされた'});
}
});
}
},
{
id:'crate',min:2,
run:function(ctx){
var P=ctx.present();
ctx.incident('放送：「分校の屋上に救急箱を一つ置いた。一人分だ」');
var claim=ctx.most(P,function(c){return c.tr.aggr*0.6+c.tr.cold*0.4+(100-c.hp)/200;});
var rival=ctx.most(ctx.others(claim),function(o){return o.tr.aggr+(100-o.hp)/150;});
var giver=ctx.most(P,function(c){return c.tr.np-c.tr.cold*0.5;});
if(giver&&giver.tr.np>0.65&&giver!==claim){
var weak=P.slice().sort(function(x,y){return x.hp-y.hp;})[0];
if(weak!==giver){
ctx.act2({actors:[giver,weak],cat:'help',mag:15,fx:function(){weak.hp=Math.min(100,weak.hp+35);ctx.mod2(giver,weak,{aff:5},{aff:18,trust:18});},
text:ctx.t('救急箱を手にした{a}は、それを自分には使わず{b}に投げ渡した。',giver,weak),why:giver.name+'のNP（'+Math.round(giver.eg.NP)+'）'});
return;
}
}
if(rival&&rival.tr.aggr>0.5){
var r=ctx.fight(claim,rival,{lethality:0.6});
ctx.act2({actors:[claim,rival],cat:'combat',fx:function(){if(r.winner)r.winner.hp=Math.min(100,r.winner.hp+30);},
text:ctx.t('屋上で{a}と{b}が鉢合わせた。',claim,rival)+r.text,why:'物資の奪い合い。'+(r.why||'')});
}else{
ctx.act2({actors:[claim],cat:'solo',fx:function(){claim.hp=Math.min(100,claim.hp+30);ctx.others(claim).forEach(function(o){ctx.mod(o,claim,{ten:4});});},
text:ctx.t('救急箱は{a}が持ち去った。',claim),why:claim.name+'の攻撃性・ドライさ'});
}
}
},
{
id:'hostage',min:3,from:2,
run:function(ctx){
var P=ctx.present(),rng=ctx.rng;
var v=rng.pick(P);
ctx.incident('放送：「'+v.name+'を灯台に拘束した。日没までに誰も来なければ首輪を作動させる」');
var res=ctx.most(ctx.others(v),function(o){return Math.max(0,R(ctx,o,v).aff)/60+o.tr.np*0.5+(o.focus===v?1:0)-o.tr.caution*0.3;});
var score=Math.max(0,R(ctx,res,v).aff)/60+res.tr.np*0.5+(res.focus===v?1:0)-res.tr.caution*0.3;
if(score>0.55){
ctx.act2({actors:[res,v],cat:'help',mag:25,fx:function(){hurt(ctx,res,20,v.name+'を助けに灯台へ向かって');ctx.mod2(res,v,{aff:6},{aff:22,trust:25,att:10});},
text:ctx.t('日没の十分前、灯台の扉を蹴破ったのは{a}だった。',res,v),why:res.name+'の'+(res.focus===v?'目標（'+v.name+'を守る）':'NPと'+v.name+'への好意')});
}else{
ctx.kill(v,null,'灯台で、誰にも助けられないまま');
ctx.others(v).forEach(function(o){if(o.alive&&R(ctx,o,v).aff>35)ctx.act2({actors:[o,v],cat:'solo',fx:function(){ctx.stress(o,25);},text:ctx.t('{a}は灯台の方角を見ないようにしていた。',o,v),why:o.name+'の慎重さが、'+v.name+'への好意（'+Math.round(R(ctx,o,v).aff)+'）に勝った'});});
}
}
},
{
id:'dinner',min:3,
run:function(ctx){
var P=ctx.present(),rng=ctx.rng;
ctx.incident('放送：「食堂に人数分の食事を用意した。一皿だけ、毒が入っている」');
var taster=ctx.most(P,function(c){return c.tr.np*0.6+c.tr.fc*0.3+(c.goal.id==='save'?0.5:0);});
var forcer=ctx.most(P,function(c){return c.tr.cp*(1-c.tr.np);});
var meek=ctx.most(ctx.others(forcer),function(o){return o.tr.ac;});
var tasterUsed=taster;
if(forcer.tr.cp>0.7&&forcer.tr.np<0.4&&meek&&meek.tr.ac>0.6){
tasterUsed=meek;
ctx.act2({actors:[forcer,meek],cat:'conflict',fx:function(){ctx.mod(meek,forcer,{ten:20,trust: -15});},
text:ctx.t('「あなたが先に食べなよ｜あなたが先に食え｜あなたが先に食べてください」{a}は{b}の前に皿を押しやった。{b}は逆らわなかった。',forcer,meek),why:forcer.name+'のCP高・NP低／'+meek.name+'のAC（'+Math.round(meek.eg.AC)+'）'});
}else{
ctx.act2({actors:[taster],cat:'help',fx:function(){ctx.others(taster).forEach(function(o){ctx.mod(o,taster,{trust:6,aff:4});});},
text:ctx.t('「毒見なら私がやる｜＝｜毒見なら私がやります」{a}が真っ先にスプーンを取った。',taster),why:taster.name+'のNP・FC'});
}
var poisoned=rng.pick(P);
var nose=ctx.most(ctx.others(poisoned),function(o){return o.tr.a;});
if(nose&&rng()<nose.tr.a*0.55){
ctx.act2({actors:[nose,poisoned],cat:'help',mag:15,fx:function(){ctx.mod(poisoned,nose,{trust:18,aff:10});},
text:ctx.t('{b}が口をつける直前、{a}がその皿を払い落とした。「匂いが違う｜＝｜匂いが違います」',nose,poisoned),why:nose.name+'のA（'+Math.round(nose.eg.A)+'）：観察力'});
}else{
ctx.act2({actors:[poisoned],cat:'solo',fx:function(){hurt(ctx,poisoned,poisoned===tasterUsed?55:45,'毒入りの皿を引いて');},text:ctx.t('毒の皿を引いたのは{a}だった。',poisoned),why:'偶然'});
}
}
},
{
id:'zone',from:2,
run:function(ctx){
var P=ctx.present();
if(P.length<2)return;
var a=ctx.rng.pick(P);
var b=ctx.most(ctx.others(a),function(o){return R(ctx,a,o).ten+R(ctx,a,o).att;});
ctx.incident('放送：「'+a.name+'の潜伏地点を禁止エリアに指定する」');
var r=R(ctx,a,b);
if(r.ten>35&&a.tr.aggr>0.45){
var f=ctx.fight(a,b);
ctx.act2({actors:[a,b],cat:'combat',text:ctx.t('追い出された{a}は、逃げた先で{b}と出くわした。',a,b)+f.text,why:'強制移動。積もった緊張（'+Math.round(r.ten)+'）。'+f.why});
}else{
ctx.act2({actors:[a,b],cat:r.att>30?'romance':'bond',fx:function(){ctx.mod2(a,b,{trust:8,att:4},{trust:6,att:4});},
text:ctx.t('追い出された{a}は、逃げた先で{b}と出くわした。{b}は黙って、隠れ家の奥を空けた。',a,b),why:b.name+'の側に敵意がなかった'});
}
}
}
];
})();
});
;
HK.Load.def(405.5,'tone:scen-br',function(){
HK.Load.toneData("mixed",{"O":{
"匂いが違う":"匂いが違います。嗅いでみてよ"}});
HK.Load.toneData("noja",{"F":[
["どちらかが死んだら、残った方が家族に伝える","どちらかが果てたら、残った者が家の者に伝えるのじゃ",1],
["まだやり残したことがある","まだやり残したことがあるのじゃ",1],
["夜は動かない、水場には近づかない","夜は動かぬ、水場には近づかぬ",1]],
"O":{
"匂いが違う":"匂いが違うぞ"}});
HK.Load.toneData("kansai",{"F":[
["どちらかが死んだら、残った方が家族に伝える","どっちかが死んだら、残ったほうが家族に伝えよな",1],
["こんなゲーム、終わらせてやる","こんなゲーム、終わらせたる",1],
["お前が先に食え","あんたが先に食べ",1]],
"O":{
"匂いが違う":"匂いがちゃう"}});
HK.Load.toneData("mukuchi",{"F":[
["どちらかが死んだら、残った方が家族に伝える","……どっちか死んだら、残ったほうが伝える",1]],
"O":{
"匂いが違う":"……匂い、違う"}});
HK.Load.toneData("polite",{"O":{
"匂いが違う":"匂いが違います"}});
HK.Load.toneData("gentleman",{"F":[
["あなたが先に食え","君が先に食べたまえ",1]],
"O":{
"匂いが違う":"匂いが違うね"}});
HK.Load.toneData("yankee",{"F":[
["お前が生きている意味はない","お前が生きてる意味なんかねえ",1]]});
HK.Load.toneData("tsun",{"F":[
["どちらかが死んだら、残った方が家族に伝える","どっちかが死んだら、残ったほうが家族に伝える。……約束よ",1],
["夜は動かない、水場には近づかない","夜は動かない、水場には近づかない。……分かった？",1]]});
HK.Load.toneData("tsun_n",{"F":[
["どちらかが死んだら、残った方が家族に伝える","どちらかが死んだら、残った方が家族に伝える",1],
["夜は動かない、水場には近づかない","夜は動かない。水場には近づかない",1]]});
HK.Load.toneData("gentle",{"F":[
["お前が先に食え","きみが先に食べて"]]});
HK.Load.toneData("ane",{"F":[
["こんなゲーム、終わらせてやる","こんなゲーム、終わらせてみせるわ",1]]});
HK.Load.toneData("devoted_p",{"F":[
["お前が先に食え","あなたが先に食べて",1]]});
HK.Load.toneData("free",{"F":[
["どちらかが死んだら、残った方が家族に伝える","どっちかが死んだら、残ったほうが家族に伝える！　約束！",1],
["夜は動かない、水場には近づかない","夜は動かない、水場には近づかない！　約束ね！",1]]});
HK.Load.toneData("usan",{"F":[
["どちらかが死んだら、残った方が家族に伝える","どちらかが死んだら、残った方が家族に伝えるのさ。約束だよ",1],
["夜は動かない、水場には近づかない","夜は動かない、水場には近づかない。それが長生きのコツさ",1]]});
HK.Load.toneData("ojou",{"F":[
["誰かいないか","どなたか、いらっしゃいませんの？",1]]});
HK.Load.toneData("gyaru",{"F":[
["どちらかが死んだら、残った方が家族に伝える","どっちか死んだら、残ったほうが家族に伝えるって約束ね",1],
["夜は動かない、水場には近づかない","夜は動かない、水場には近づかない！　これ鉄則ね！",1],
["お前が生きている意味はない","あんたが生きてる意味とか、ないし",1],
["こんなゲーム、終わらせてやる","こんなゲーム、終わらせてやるし"],
["お前が先に食え","あんたが先に食べなよ"],
["お前も怖かったんだろ","あんたも怖かったんでしょ"],
["水を分けるから、話を聞いてくれ","水分けるから、話聞いてよ"],
["誰かいないか","誰かいないの？"]]});
HK.Load.toneData("chara",{"F":[
["匂いが違う","匂いが違くね？"],
["お前が先に食え","あんたが先に食えって"],
["夜は動かない、水場には近づかない","夜は動かない、水場には近づかない。これ鉄則な"],
["お前が生きている意味はない","あんたが生きてる意味とかねーし"],
["お前も怖かったんだろ","あんたも怖かったんだろ"],
["水を分けるから、話を聞いてくれ","水分けるからさ、話聞いてくんね？"],
["誰かいないか","誰かいねーの？"]]});
HK.Load.toneData("genki",{"F":[
["お前が先に食え","先に食べてください！",1],
["夜は動かない、水場には近づかない","夜は動きません、水場には近づきません！",1],
["こんなゲーム、終わらせてやる","こんなゲーム、終わらせちゃいます！",1]]});
HK.Load.toneData("darui",{"F":[
["どちらかが死んだら、残った方が家族に伝える","……どっちか死んだら、残ったほうが家族に伝える",1]]});
HK.Load.toneData("sondai",{"F":[
["こんなゲーム、終わらせてやる","こんなゲーム、終わらせてやろう",1]]});
HK.Load.toneData("god",{"F":[
["水を分けるから、話を聞いてくれ","水を分けてやる。ゆえに、話を聞け",1]]});
});
HK.Load.done('scen-br', '0213ee8215', 1);
