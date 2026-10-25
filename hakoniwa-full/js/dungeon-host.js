/* 箱庭シミュレーター（R18版のみ）: エロトラップダンジョン ― 主催者の役（迷宮を造った人）
   環境値「主催者」（HK.Roles：おまかせ＝なし／住人から／モブ／なし）と、住人ごとの欄「主催者になる／ならない」。
   ・おまかせ・なしは今までどおり（主催者は出てこない。物語の乱数にも触れない）
   ・住人の主催者は挑戦者にならない。観察室の水晶から挑戦者を眺めて、態度に合わせて品評し、ときどき手を出す
     （罠を強める／お気に入りを助ける／声でからかう）。挑戦者は途中で「主催者が仲間だった」と気づくことがある
   ・住人の主催者と挑戦者の体の場面は、HK.Pos.okSex（受け攻め・恋愛対象）と HK.Pos.order の向き（攻めを選んだ人は受けない）、
     HK.State.r18ok（二人とも）、HK.ngPair・HK.sexBlocked を通る組だけ。通らない組には品評・助ける・からかう（性的でない文）だけ
   ・モブの主催者（迷宮の主を名乗る誰か）は、品評と罠・助け舟だけ（体には触れない）
   ・最低人数：住人が一人だけなら、その人は挑戦者のまま（主催者はなしにする）。主催者も4人の枠に数える
   ・結末に主催者の一行を足す。文は物語とは別の乱数で選ぶ
   {h}＝主催者 {a}＝挑戦者 {n}＝挑戦者たち。体の場面は dungeon-tempt.js（DG.TEMPT）の組ごとの文・態度9種の山場を使う。登場人物はすべて成人として扱う */
(function () {
  'use strict';
  var HK = window.HK, DG = HK && HK.DG;
  if (!DG || !HK.SCENARIOS || !HK.SCENARIOS.dungeon || !HK.Roles) return;
  function L(s) { return s.split('|'); }
  var ROLE = { allowMob: true, allowNone: true, auto: 'none', yes: '主催者になる', mob: { given: true },
    desc: '迷宮を造った主催者を、住人がやるか・モブがやるか・なしにするかを選びます。住人の主催者は挑戦せず、観察室から挑戦者を眺めて品評し、ときどき罠を強めたり、お気に入りを助けたりします。住人が一人だけのときは主催者を置きません',
    fit: function (c) { var t = c.tr || HK.traits(c.eg); return 0.3 + t.fc * 0.5 + t.cp * 0.3 + (t.lead || 0) * 0.3; } };
  HK.Roles.install(HK.SCENARIOS.dungeon, 'host', '主催者', ROLE);

  var T = {
    intro: {
      res: L('迷宮の最奥には、誰も知らない小部屋がある。壁一面の水晶に、{n}の姿が映し出されていた。それを眺めながら頬杖をついているのは、この迷宮を一から組み上げた主催者――{h}だった。|{n}が入り口の扉をくぐった瞬間、迷宮のどこかで小さな鈴が鳴った。{h}は読みかけの設計図を閉じ、観察用の水晶に灯をともした。仲間が自分の迷宮に挑みに来たことを、{h}だけが知っていた。|罠の配置も、魔物の巣の場所も、すべて{h}が決めたものだった。{h}は観察室の椅子に深く腰かけ、水晶に映る{n}の顔を一人ずつ確かめた。挑戦者たちはまだ、この迷宮の主催者が誰なのかを知らない。'),
      mob: L('入り口の石板には、主催者の名が刻まれていた。――{h}。{n}が足を踏み入れると、どこからともなく愉快そうな声が響いた。「ようこそ。私の迷宮を、存分に味わっていってくれ」|{n}の頭上で、ぱちりと水晶の目が開いた。「挑戦者が来たか。私は{h}、この迷宮の主催者だ」声は通路の奥から反響して、どこから聞こえるのか分からなかった。|迷宮の壁には、ところどころに小さな水晶が埋め込まれていた。それが主催者である{h}の目だと、{n}はすぐに気づいた。見られている――その感覚は、最初の部屋に入る前から肌にまとわりついていた。')
    },
    /* 品評：主催者の態度9種（性的な語を使わない） */
    comment: {
      proud: L('{h}は水晶に映る{a}を見下ろして、鼻を鳴らした。{h}「その程度の罠で足が止まるのか。造ったこっちが拍子抜けだ」{h}は次の部屋の仕掛けを、黙って一段きつく組み直した。|{h}は腕を組んだまま、水晶の中の{a}をじっと睨んでいた。{h}「いい顔をするじゃないか。もっと見せろ」口では文句を言いながら、{h}は一度も目を逸らさなかった。|{a}が罠をすり抜けるのを見て、{h}は舌打ちした。{h}「ちっ、勘のいい奴だ」{h}は手元の図面に、乱暴に赤い印をつけた。'),
      stern: L('{h}は背筋を伸ばしたまま、水晶に映る{a}の足運びを見つめていた。{h}「踏み込みが甘い。あれでは次の階で捕まる」{h}は記録帳に、短く注意書きを書き加えた。|{h}は{a}の様子を、試験官のような目で検分していた。{h}「規則どおりに進めば、抜けられるように造ってある」それでも{a}が罠に足を取られると、{h}の眉がわずかに寄った。|{h}「……悪くない」{h}は罠を避けた{a}を見て、一言だけ呟いた。それ以上は何も言わず、{h}は次の部屋の仕掛けを点検し直した。'),
      tsun: L('{h}は水晶の前で頬杖をついて、{a}をにらんでいた。{h}「べ、別に心配なんかしてないし。罠に引っかかればいいのに」そう言いながら、{h}の指は落ち着きなく机を叩いていた。|{h}「ふん、{a}のくせに、なかなかやるじゃない」{h}はぷいと顔を背けた。けれど横目は、ずっと水晶のほうを追いかけていた。|{a}が罠に足を取られると、{h}は思わず腰を浮かせた。{h}「……っ、今のは、仕掛けの具合を見ただけだから」誰もいない観察室で、{h}は誰にともなく言い訳をした。'),
      gentle: L('{h}は温かいお茶を手に、水晶に映る{a}を眺めていた。{h}「あらあら、大変そう。でも、{a}ならきっと大丈夫」{h}は湯気の向こうで、のんびりと目を細めた。|{h}は{a}が罠に驚く顔を見て、くすくすと笑った。{h}「ごめんね、その仕掛け、ちょっと意地悪だったかしら」{h}は次の部屋の罠を、ほんの少しだけ緩めておいた。|{h}「がんばって、{a}」{h}は水晶に向かって、小さく手を振った。届くはずのない声援を、{h}は何度も繰り返した。'),
      devoted: L('{h}は両手を胸の前で握りしめて、水晶の中の{a}を見守っていた。{h}「無理しないで……でも、ちゃんと最後まで見届けるから」{h}は{a}が次の部屋へ進むまで、瞬きも忘れていた。|{h}は{a}のために用意した仕掛けの一覧を、何度も読み返していた。{h}「喜んでもらえるかな。がんばって造ったんだ」水晶の中の{a}は、そんなことを知る由もなかった。|{h}「{a}、そこ、右の床は踏まないで……」{h}は届かない声で、ひとつひとつ罠の場所を教えていた。自分で仕掛けたものなのに、{h}はそれを忘れてしまったかのようだった。'),
      cool: L('{h}は水晶に映る{a}の動きを、淡々と記録帳に書き留めていた。{h}「反応速度、想定より二割速い。罠の発動を少し早めるべきだな」{h}の声には、何の感情もこもっていなかった。|{h}は{a}の表情の変化を、指で数えるように観察していた。{h}「面白い。理性が削れるときは、まず視線が泳ぐのか」{h}はペン先で、次の項目に印をつけた。|{h}「{a}は慎重すぎる。もう少し大胆なら、もっと良い記録が取れるのに」{h}は水晶の角度を変えて、{a}を正面から捉えた。観察室には、ペンを走らせる音だけが響いていた。'),
      free: L('{h}は水晶にかじりつくようにして、{a}の姿を追っていた。{h}「わ、今の見た！？めっちゃいい反応！」誰もいない観察室で、{h}は一人で手を叩いて喜んだ。|{h}「次はあの罠に引っかかってくれないかな～」{h}は足をぶらぶらさせながら、水晶の中の{a}に期待の目を向けた。{a}がそれを避けると、{h}は大げさに天井を仰いだ。|{h}は{a}が部屋を抜けるたびに、手元の板に丸をつけていた。{h}「よし、次はもっと面白いの出しちゃおう」{h}の頭の中では、もう新しい仕掛けの案が三つも四つも回っていた。'),
      shy: L('{h}は水晶を指の隙間から覗いて、{a}の姿を追っていた。{h}「み、見てるだけ……見てるだけだから……」それでも{a}が罠に驚くたびに、{h}は自分のことのように肩をすくめた。|{h}は観察室の隅で膝を抱え、小さな声で呟いた。{h}「{a}に、こんなの造ったって知られたら……」頬を赤くしながらも、{h}は水晶から目を離せなかった。|{h}「ご、ごめんね、{a}……」{h}は罠の作動を知らせる鈴が鳴るたびに、小さく謝った。謝りながらも、{h}は次の仕掛けの準備をやめなかった。'),
      polite: L('{h}は姿勢を正して、水晶に映る{a}に会釈した。{h}「ようこそお越しくださいました。次のお部屋も、心を込めてご用意しております」その声は、客を迎える宿の主人のように穏やかだった。|{h}は{a}の様子を見て、丁寧に記録帳を繰った。{h}「お疲れのようですね。少し休めるお部屋をご用意いたしましょうか」そう言いながら、{h}は次の罠の目盛りを確かめていた。|{h}「お見事です、{a}様」{h}は罠を抜けた{a}に、水晶越しに小さく拍手を送った。その笑顔は、どこまでも礼儀正しかった。')
    },
    /* 品評に添える、水晶の中の挑戦者の様子 */
    tail: {
      calm: L('{a}は、まだ涼しい顔で通路を歩いていた。|{a}の足取りは、まだしっかりとしていた。|{a}は地図を確かめながら、慎重に次の部屋をうかがっていた。'),
      heat: L('{a}は頬を上気させて、壁に手をついていた。|{a}の息は浅く、足取りもどこか危うかった。|{a}は何度も首を振って、ぼんやりしかける意識を払っていた。'),
      top: L('{a}は罠の残骸を踏み越えて、平然と次の部屋へ向かっていた。|{a}は壊した仕掛けを振り返りもせず、水晶のほうをちらりと睨んだ。|{a}の目は、迷宮そのものを品定めするように鋭かった。')
    },
    /* 罠を強める（攻めの挑戦者には効かない） */
    boost: {
      b: L('{h}は手元の盤に並ぶ目盛りのひとつを、そっと押し上げた。次の瞬間、{a}の足元で、眠っていたはずの罠がもう一度光を放った。{h}「せっかく来たんだ、もう少し付き合ってもらおう」|{h}「ちょっと物足りないな」{h}が水晶を指で弾くと、{a}のいる部屋の空気が甘く淀んだ。止まっていた仕掛けが息を吹き返し、{a}の体にふたたび絡みついた。|{h}は{a}が罠を抜けかけたところで、壁の奥の歯車を一段回した。逃げ道だった扉がゆっくりと閉じ、部屋の罠がもう一巡、{a}を狙って動き出した。水晶の前で、{h}は満足そうに頷いた。'),
      top: L('{h}は目盛りを押し上げて、{a}の足元の罠をもう一度動かした。けれど{a}は飛び出した仕掛けを素手で掴み、壁から引き剥がして放り捨てた。水晶越しに睨み返されて、{h}は思わず目盛りから手を離した。|{h}が歯車を回すと、{a}のいる部屋の罠が一斉に起き上がった。{a}はそれを一つずつ踏み砕き、最後に壁の水晶を指さした。{a}「見てるんだろう。次はそっちに行くぞ」|{h}は罠の勢いを上げたが、{a}は眉ひとつ動かさなかった。暴れる仕掛けを片手で押さえつけ、{a}は逆にその造りを確かめ始めた。{h}「……造り直しだな、あれは」')
    },
    /* お気に入りを助ける：捕らわれたとき（cap）／危うくなったとき（cool） */
    save: {
      cap: L('水晶の中で{a}が捕らわれたのを見て、{h}は思わず立ち上がった。{h}は迷わず盤の非常の札を引き、巣の仕掛けを止めた。拘束がほどけた{a}は、何が起きたのか分からないまま、床に膝をついた。|{h}「……それはやりすぎだ」{h}は唇を噛んで、{a}を捕らえた魔物を呼び戻す笛を吹いた。魔物は名残惜しそうに{a}を放し、壁の向こうへ引っ込んでいった。|{h}は観察室を飛び出し、隠し通路を駆け下りた。{a}を閉じ込めていた檻の鍵を外から開け、姿を見られる前にまた物陰へ消えた。{a}が振り返ったときには、そこには誰もいなかった。'),
      cool: L('{h}は{a}の様子を見て、眉を寄せた。{h}「少し、休ませてあげないと」{h}が盤の札を一枚裏返すと、{a}の行く先に、冷たい泉の湧く小部屋が現れた。|{h}は罠の目盛りを、{a}の部屋の分だけそっと下げた。甘く淀んでいた空気がすっと澄み、{a}はようやく深く息をついた。{h}は、自分でも理由の分からない安堵を覚えた。|{h}「{a}には、ここで終わってほしくないんだ」{h}は迷宮の通路に、冷たい風を一筋だけ送り込んだ。火照った頬を撫でる風に、{a}は少しだけ正気を取り戻した。')
    },
    /* 声でからかう（姿は見せない） */
    tease: L('通路の壁の中から、楽しげな声が響いた。「さっきの顔、とてもよかったよ、{a}」{a}は耳まで赤くなって、声のしたほうを睨みつけた。|{a}が休もうと腰を下ろすと、すぐそばの水晶が瞬いた。「休憩？いいね、ここからだとよく見える」{a}は慌てて立ち上がり、水晶に外套を被せた。|天井から、ひらりと一枚の紙が落ちてきた。そこには、{a}がさっき罠にかかったときの様子が、細かく書きつけられていた。最後の行には「次も期待している」とあり、{a}は紙を握りつぶした。'),
    /* 主催者が仲間だと気づく */
    discover: L('{n}が辿り着いた小部屋の壁には、迷宮の設計図が何枚も貼られていた。図面の隅に書き込まれた癖のある字に、見覚えがあった。――{h}の字だ。|通路に響いた声は、聞き慣れたものだった。{n}が水晶を覗き込むと、その向こうで、{h}が気まずそうに手を振っていた。この迷宮を造った主催者は、仲間の{h}だったのだ。|隠し扉の向こうから、慌てた足音が聞こえた。{n}が扉をこじ開けると、観察用の水晶の前で、{h}が固まっていた。{h}「……あー。ばれちゃったか」'),
    /* 気づいた挑戦者の反応（挑戦者の態度9種） */
    react: {
      proud: L('{a}「{h}、お前の仕業か。あとで覚えてろよ」|{a}は拳を鳴らした。「出たら、真っ先に{h}を殴りに行く」|{a}「道理で、底意地の悪い罠ばかりだと思った」'),
      stern: L('{a}は深いため息をついた。「{h}。説明してもらうぞ」|{a}「仲間を罠に掛けるとは、感心しないな、{h}」|{a}は眉間を押さえた。「……あとで、{h}には話がある」'),
      tsun: L('{a}「は、はあ！？{h}が造ったの！？最っ低！」|{a}は真っ赤になって叫んだ。「{h}、全部見てたってこと！？」|{a}「べ、別に驚いてないし。{h}ならやりそうだと思ってたし」'),
      gentle: L('{a}は目を丸くしてから、困ったように笑った。「まあ、{h}だったの」|{a}「{h}ったら、こんなに大がかりなものを造ってたのね」|{a}は頬に手を当てた。「どうりで、どこか優しい罠だと思ったわ、{h}」'),
      devoted: L('{a}「{h}が……？でも、{h}が造ったなら、最後まで行かなきゃ」|{a}は胸に手を当てた。「{h}が、ずっと見ててくれたんだね」|{a}「{h}の迷宮なら、ちゃんと踏破してみせるから」'),
      cool: L('{a}は目を細めた。「なるほど。罠の癖が、{h}の考え方そのものだ」|{a}「{h}か。なら、次の部屋の配置も読める」|{a}は小さく頷いた。「主催者が{h}だと分かれば、攻め方も変わる」'),
      free: L('{a}「えっ、{h}なの！？すごい、全部{h}が造ったの！？」|{a}は手を叩いて笑った。「{h}、次の罠どんなの！？教えて！」|{a}「なあんだ、{h}かあ。じゃあ遠慮なく楽しんじゃお」'),
      shy: L('{a}は顔を覆った。「{h}に、全部見られてたなんて……」|{a}「う、うそ……{h}が……？」|{a}は消え入りそうな声で呟いた。「も、もう、{h}の顔見られない……」'),
      polite: L('{a}は目を見開いてから、静かに頭を下げた。「{h}さんでしたか。……あとで、お話を伺っても？」|{a}「{h}さんのご趣味だったのですね。存じませんでした」|{a}「なるほど、{h}さんが。……少々、驚きました」')
    },
    /* 関係が近い（恋人・想い人など）／険悪な相手が主催者だったとき */
    reactLove: L('{h}を見る{a}の目には、怒りよりも先に、ほっとしたような色が浮かんでいた。|{a}は一瞬むっとしてから、{h}らしいと小さく笑った。|{a}は、{h}にずっと見られていたのだと思うと、急に顔が熱くなった。'),
    reactBad: L('{a}の目つきが険しくなった。{h}にだけは、弱みを見せたくなかった。|{a}「よりによって{h}か」――声には、隠しきれない棘があった。|{a}は{h}のいるほうを睨みつけ、二度と隙を見せないと決めた。'),
    /* 主催者が自分から降りてくる（体の場面の導入）。{a}＝主催者 {b}＝挑戦者。lead＝主催者が攻め／offer＝主催者が受け */
    sex: {
      lead: L('{b}が小部屋で息を整えていると、壁の一部が音もなく開いた。現れたのは、この迷宮の主催者――{a}だった。{a}「ずっと見てたんだ。そんな顔で歩かれたら、我慢できない」{a}は{b}の顎に指をかけ、熱を帯びた目を覗き込んだ。|隠し扉から出てきた{a}は、壁にもたれる{b}の前で足を止めた。{a}「罠の続き、私が直接してあげようか」低い声が耳元で囁き、{a}の手が{b}の腰を引き寄せた。{b}の喉が、小さく鳴った。|{a}は観察室を出て、{b}のいる部屋へまっすぐ降りてきた。{a}「主催者として、挑戦者の具合を確かめに来た」冗談めかした口調とは裏腹に、{a}の指は{b}の外套の留め具を迷いなく外していった。'),
      offer: L('{b}が休んでいると、隠し扉から{a}がそっと顔を出した。{a}「……水晶越しに見てたら、私のほうがおかしくなっちゃった」{a}は{b}の隣に座り込み、火照った額を{b}の肩に押しつけた。|壁の奥から現れた{a}は、気まずそうに笑ってから、{b}の前に膝をついた。{a}「造った罠より、{b}のほうがずっと危ない」{a}は{b}の手を取り、自分の頬に押し当てた。|{a}は、{b}の前に姿を見せるつもりはなかった。けれど気づけば隠し扉を開け、{b}の袖を握りしめていた。{a}「お願い。少しだけ、そばにいさせて」')
    },
    refuse: L('{b}は{a}の手首を掴んで、静かに押し戻した。{b}「やめておこう。今は、迷宮の熱に流されたくない」{a}は少しだけ寂しそうに笑って、隠し扉の向こうへ戻っていった。|{b}は首を横に振り、{a}との間に一歩分の距離を取った。{b}「出てからなら、ちゃんと話を聞く」{a}は「……そっか」とだけ答えて、深く頭を下げた。|{b}は差し出された手を取らなかった。{b}「主催者が挑戦者に手を出すのは、反則だろう」{a}は肩をすくめて引き下がり、観察室へ続く階段を上っていった。'),
    fade: L('{b}は、差し出された{a}の手を取った。二人は隠し扉の向こうへ消え、しばらく戻ってこなかった。{b}が通路に戻ってきたとき、その頬はまだほんのりと赤かった。|{b}が小さく頷くと、{a}は{b}の手を引いて、観察室へ続く階段を上っていった。扉が閉まり、水晶の灯がひとつ消えた。迷宮の通路には、しばらく誰の足音も響かなかった。|{a}は{b}を抱き寄せたまま、隠し扉を後ろ手に閉めた。その向こうで何があったのかは、迷宮の壁だけが知っている。戻ってきた{b}の外套は、留め具がひとつ掛け違えられていた。'),
    after: L('事が済むと、{a}は{b}の乱れた髪を指で梳いた。{a}「続きは、迷宮を出てからね」{a}は隠し扉の向こうへ戻り、{b}はしばらく壁にもたれたまま動けなかった。|{b}が息を整えるあいだ、{a}は黙って外套を掛けてやった。{a}「……主催者失格だな、これは」苦笑いを残して、{a}はまた水晶の前へ戻っていった。|二人はしばらく、何も言わずに寄り添っていた。やがて{a}は名残惜しそうに{b}から離れ、隠し扉の取っ手に手をかけた。{a}「最後まで見てるから。がんばって」'),
    /* 結末に足す一行 */
    end: {
      resClear: L('迷宮の出口で{n}を待っていたのは、主催者の{h}だった。{h}は照れくさそうに頭をかいて、「踏破、おめでとう」と言った。差し出された手を握るかどうか、{n}は少しだけ迷った。|地上に戻った{n}のもとへ、{h}が駆け寄ってきた。{h}「全部見てた。……すごかったよ」主催者の顔と仲間の顔が、{h}の中でまだうまく混ざっていなかった。|{h}は迷宮の設計図を丸めて、{n}に手渡した。{h}「次は、もっと難しいのを造っておく」{n}は、それを受け取るべきか本気で悩んだ。'),
      resFall: L('水晶の前で、主催者の{h}は長いあいだ黙り込んでいた。迷宮に呑まれていく{n}の姿を、{h}は最後まで見届けた。{h}「……造りすぎた、かな」|{h}は迷宮の最奥へ降りていき、堕ちた{n}の前に立った。主催者として迎えるべきか、仲間として連れ戻すべきか、{h}にはまだ決められなかった。水晶の灯だけが、二つの答えのあいだで揺れていた。|{h}は観察室の灯を一つずつ落としていった。最後の水晶に映る{n}は、もう出口のほうを見ていなかった。{h}はしばらく、消えた水晶の前から動けなかった。'),
      resHidden: L('最後まで、{n}は主催者の正体に気づかなかった。{h}も、それを明かすつもりはなかった。迷宮の設計図は、{h}の机の引き出しにしまわれたままだ。|{h}は何食わぬ顔で、迷宮から戻った{n}を出迎えた。主催者の正体は、{h}だけの秘密になった。水晶に残った記録を、{h}はときどき一人で見返している。|{n}が主催者の正体を知るのは、もう少し先のことになる。{h}は迷宮の入り口に鍵をかけ、何もなかったような顔で家路についた。その鞄の中では、次の迷宮の設計図が出番を待っていた。'),
      mobClear: L('迷宮の主催者、{h}の声が、最後にもう一度だけ響いた。「見事だ。また挑みに来るといい」{n}が振り返ったとき、入り口の石板の名は消えていた。|{n}が地上に出ると、どこからか拍手が聞こえた。主催者の{h}は、最後まで姿を見せなかった。「次の迷宮で待っている」――そんな書き置きだけが、出口の石に残されていた。|主催者の{h}は、踏破した{n}の名を迷宮の壁に刻ませた。それが称賛なのか、次の罠への招待状なのかは分からなかった。{n}は一度だけ振り返り、それから二度と振り返らなかった。'),
      mobFall: L('主催者の{h}は、堕ちた{n}を迷宮の新しい住人として迎え入れた。{h}「ようこそ。ここはもう、君たちの家だ」水晶の灯は、ひとつ、またひとつと消えていった。|{h}の満足げな笑い声が、迷宮の隅々まで長く響いた。{n}の姿は、主催者の記録帳の最後の頁に書き加えられた。次の頁は、まだ白いままだった。|主催者の{h}は、水晶に映る{n}を眺めながら、新しい罠の設計図を広げた。挑戦者のいなくなった迷宮は、次の客を待って静まり返った。{h}の指先だけが、楽しげに図面の上を滑っていた。')
    }
  };
  DG.HOST = T;

  /* ---------- 小道具 ---------- */
  var P = function () { return HK.Pos; };
  function R(S) { return S.hostR; }
  function pk(S, arr) {
    var U = S.hostUse = S.hostUse || {}, free = [], i, t, r = R(S);
    for (i = 0; i < arr.length; i++) if (!U[arr[i]]) free.push(arr[i]);
    if (free.length) t = free[r.int(free.length)];
    else { t = arr[0]; for (i = 1; i < arr.length; i++) if (U[arr[i]] < U[t]) t = arr[i]; }
    S.hostUseN = (S.hostUseN || 0) + 1; U[t] = S.hostUseN;
    return t;
  }
  function nm(s, m) { return s.replace(/\{(a|b|h|n|t|u|ev)\}/g, function (x, k) { return m[k] != null ? m[k] : x; }); }
  function names(l) { return l.map(function (x) { return x.name; }).join('・'); }
  function sayAs(S, h, o) { var prev = S.h; S.h = h; var e = DG.say(S, o); S.h = prev; return e; }
  function freeOf(S) { return S.party.filter(function (x) { return !x.fallen && !x.captor && x.corrupt < 100 && x.reason > 0; }); }
  function isTop(h) { return !!(DG.isTop && DG.isTop(h)); }
  function hasCurse(h, id) { return h.curses && h.curses.indexOf(id) >= 0; }
  function pn(S, s) { (S.partyNotes = S.partyNotes || []).push(s); }
  /* 住人どうしの体の関係（主催者×挑戦者）：受け攻め・恋愛対象（okSex）、R18（両方）、恋愛・R18にしない相手、性行為の相手の固定 */
  function sexOk(a, b) {
    if (!a || !b || a === b || !P()) return false;
    if (!HK.State || !HK.State.r18ok(a) || !HK.State.r18ok(b)) return false;
    if (HK.ngPair && HK.ngPair(a, b)) return false;
    if (HK.sexBlocked && HK.sexBlocked(a, b)) return false;
    if (HK.State.pairSex && !HK.State.pairSex(a, b)) return false;
    return P().okSex(a, b);
  }
  function loveOk(a, b) { return HK.State && HK.State.pairLove ? HK.State.pairLove(a, b) : !!(HK.canLove && HK.canLove(a, b) && HK.canLove(b, a)); }
  /* 主催者と挑戦者の関係（登録した関係から） */
  var NEAR = /^(lover|mate|fated|spouse|almost|crush|fwb|best|childhood|buddy|sibclose|worship)$/, BAD = /^(rival|enemy|bad|sibbad|ex)$/;
  function tieOf(S, x) {
    var o = { near: false, bad: false, w: 0 };
    (S.ties || []).forEach(function (t) {
      if (!((t.a === S.host.i && t.b === x.i) || (t.b === S.host.i && t.a === x.i))) return;
      if (NEAR.test(t.type) && (t.type !== 'crush' || t.a === S.host.i)) { o.near = true; o.w += 1; }
      if (BAD.test(t.type)) { o.bad = true; o.w -= 0.8; }
    });
    return o;
  }

  /* ---------- 主催者を決める（物語の乱数に触れない） ---------- */
  DG.hostSetup = function (S, input) {
    var chars = (input && input.chars) || [], env = (input && input.env) || {};
    var src = env[HK.Roles.envId('host')] || 'auto';
    S.host = null;
    /* おまかせ＝なし：住人の欄で「主催者になる」を選んだ人がいなければ、何もしない */
    var anyYes = chars.some(function (c, i) { var pc = input.perChar && input.perChar[i]; return pc && pc.pick && pc.pick.host === 'yes'; });
    if (src === 'none' || (src === 'auto' && !anyYes)) return -1;
    var rng = HK.rng(((+input.seed || 0) * 131 + 7919) >>> 0);
    var list = chars.map(function (c, i) { var x = {}; for (var k in c) x[k] = c[k]; x.i = i; x.tr = HK.traits(c.eg); return x; });
    var r = HK.Roles.resolve({ rng: rng, env: env, chars: list }, 'host', input, ROLE);
    /* 住人が一人だけなら、その人は挑戦者のまま（主催者はなし） */
    if (r.kind === 'res' && chars.length < 2) r = { kind: 'none', who: [], mob: null };
    if (r.kind === 'none') return -1;
    var h;
    if (r.kind === 'res') {
      var c = chars[r.who[0].i];
      h = { i: r.who[0].i, name: c.name, eg: c.eg, tr: HK.traits(c.eg), gender: c.gender || '', likes: c.likes || '', tone: c.tone || '', fp: c.fp || '', pos: c.pos || '', posLike: c.posLike || '', futa: !!c.futa,
        ng: Array.isArray(c.loveNG) ? c.loveNG.filter(function (x) { return x >= 0; }) : [], lock: c.loveLock === '' || c.loveLock == null || isNaN(+c.loveLock) ? null : +c.loveLock, calls: c.calls || {} };
      var sl = c.sexLock; h.sexLock = sl === 'any' || sl === 'lover' ? sl : sl == null || sl === '' || isNaN(+sl) ? null : +sl;
      if (HK.charFlags) HK.charFlags(c, h, 'dungeon');
      h.kind = 'res';
    } else { h = r.mob; h.i = -1; h.kind = 'mob'; h.tr = h.tr || HK.traits(h.eg); }
    h.persona = HK.personaOf(h);
    h.climax = 0;
    S.host = h; S.hostR = HK.rng(((+input.seed || 0) * 37 + 104729) >>> 0);
    S.hostN = 0; S.hostLast = -99; S.hostSex = 0; S.hostKnown = h.kind === 'mob';
    return h.kind === 'res' ? h.i : -1;
  };

  /* お気に入り：関係の近い人、なければ相性のいい人（モブの主催者は気まぐれ） */
  function fav(S) {
    var h = S.host, best = null, bv = -9;
    S.party.forEach(function (x) {
      var v = h.kind === 'res' ? tieOf(S, x).w + (HK.baseCompat ? HK.baseCompat(h, x).aff / 100 : 0) : x === S.party[0] ? 0.2 : 0;
      v += R(S)() * 0.2;
      if (v > bv) { bv = v; best = x; }
    });
    return best;
  }

  DG.hostStart = function (S) {
    var h = S.host; if (!h) return;
    S.hostFav = fav(S);
    /* 関係の恋人（恋人だけ、の相手）：主催者と挑戦者のあいだにも写す（dungeon-tempt.js の loveSet と同じ） */
    if (h.kind === 'res') (S.ties || []).forEach(function (t) {
      if (!/^(lover|mate|fated|spouse)$/.test(t.type)) return;
      var o = t.a === h.i ? t.b : t.b === h.i ? t.a : null, x = o == null ? null : S.party.filter(function (p) { return p.i === o; })[0];
      if (!x) return;
      (h.loveSet = h.loveSet || []).push(x.i); (x.loveSet = x.loveSet || []).push(h.i);
    });
    var o = sayAs(S, S.party[0], { kind: 'sys', tag: '主催者', text: nm(pk(S, T.intro[h.kind]), { h: h.name, n: names(S.party) }), why: h.kind === 'res' ? '主催者：' + h.name + '（住人。挑戦はしない）／お気に入り：' + S.hostFav.name : '主催者：' + h.name + '（モブ）' });
    DG.key(S, o, '主催者' + h.name + 'の迷宮');
  };

  /* 主催者が仲間だと気づく（住人の主催者だけ） */
  function discover(S, how) {
    var h = S.host;
    if (S.hostKnown || h.kind !== 'res') return null;
    S.hostKnown = true;
    var F = S.party.filter(function (x) { return !x.fallen; });
    if (!F.length) return null;
    var t = nm(pk(S, T.discover), { h: h.name, n: names(F) });
    F.slice(0, 3).forEach(function (x) {
      t += ' ' + nm(pk(S, T.react[x.persona] || T.react.gentle), { a: x.name, h: h.name });
      var tt = tieOf(S, x);
      if (tt.near && loveOk(x, h)) t += nm(pk(S, T.reactLove), { a: x.name, h: h.name });
      else if (tt.bad) t += nm(pk(S, T.reactBad), { a: x.name, h: h.name });
    });
    var o = sayAs(S, F[0], { kind: 'ev', tag: '主催者の正体', text: t, why: how || '迷宮の主催者が仲間だと気づいた' });
    DG.key(S, o, '主催者が' + h.name + 'だと気づいた');
    pn(S, 'この迷宮の主催者が' + h.name + 'だと、' + names(F) + 'は途中で気づいた。');
    return o;
  }

  function comment(S, x) {
    var h = S.host, top = isTop(x), heat = x.pleasure >= 45 || x.corrupt >= 45;
    var t = nm(pk(S, T.comment[h.persona] || T.comment.gentle), { h: h.name, a: x.name }) + nm(pk(S, T.tail[top ? 'top' : heat ? 'heat' : 'calm']), { a: x.name });
    sayAs(S, x, { kind: 'ev', tag: '主催者', text: t, why: h.name + 'の品評（態度「' + (HK.PERSONA[h.persona] ? HK.PERSONA[h.persona].label : h.persona) + '」）' });
  }

  function boost(S, x) {
    var h = S.host, top = isTop(x);
    S.h = x;
    if (top) {
      sayAs(S, x, { kind: 'ev', tag: '主催者の罠', text: nm(pk(S, T.boost.top), { h: h.name, a: x.name }), why: h.name + 'が罠を強めたが、' + x.name + 'は自分で攻めを選んでいるので、罠を壊して退けた' });
      x.reason += 2;
      return;
    }
    var ev = { id: 'host_boost', name: h.name + 'が強めた罠', kind: 'trap', themes: null, part: 'any', power: 9 + S.env.trap / 10, o: {}, texts: [] };
    DG.stim(S, ev, 1);
    sayAs(S, x, { kind: 'ev', tag: '主催者の罠', text: nm(pk(S, T.boost.b), { h: h.name, a: x.name }), why: h.name + 'が' + x.name + 'の部屋の罠を強めた（快感 ' + Math.round(x.pleasure) + '）' });
    DG.flushQ(S);
    if (DG.settle(S)) DG.fallHero(S, x);
  }

  function save(S, x) {
    var h = S.host, cap = !!x.captor;
    if (cap) { x.captor = null; x.bossCapture = false; x.hp = Math.max(x.hp, 30); x.reason += 4; }
    else { x.pleasure = Math.max(0, x.pleasure - 25); x.reason += 8; }
    sayAs(S, x, { kind: 'ev', tag: '主催者の助け舟', text: nm(pk(S, T.save[cap ? 'cap' : 'cool']), { h: h.name, a: x.name }), why: h.name + 'がお気に入りの' + x.name + 'を' + (cap ? '捕らわれたところから助けた' : '休ませた') });
    pn(S, '主催者の' + h.name + 'は、お気に入りの' + x.name + 'にこっそり助け舟を出した。');
  }

  function tease(S, x) {
    x.reason -= 3 + x.tr.ac * 4;
    sayAs(S, x, { kind: 'ev', tag: '主催者の声', text: nm(pk(S, T.tease), { h: S.host.name, a: x.name }), why: S.host.name + 'が声でからかった（AC ' + Math.round(x.eg.AC) + '）' });
  }

  /* 描写の文だけを選ぶ（dungeon-tempt.js と同じ組み立て） */
  function voice(S, s, bot, top) { var TV = HK.ThickVM; return TV ? TV.voice(R(S), s, bot, top) : s.replace(/\{v[a-z0-9]+\}/g, '……っ'); }
  function eroFill(S, s, who, dom) {
    var E = HK.Ero; if (!E) return s.replace(/\{s:\w+\}。?|「\{m\d\}」――/g, '');
    var d0 = who.eroDom; if (dom) who.eroDom = true;
    var out = E.fill({ rng: R(S) }, s, who); who.eroDom = d0; return out;
  }
  function combo(t, u) { var tf = P().isF(t), uf = P().isF(u); return tf ? (uf ? 'ff' : 'fm') : (uf ? 'mf' : 'mm'); }
  function spend(S, h, top) { h.climax = (h.climax || 0) + 1; if (h.corrupt != null) { h.corrupt += (top ? 2 : 3.5) * (S.k || 1); h.pleasure = 14 + S.hostR.int(16); } }

  /* 住人の主催者が降りてくる。体の場面にするのは、点検を通る組だけ */
  function sexCand(S) {
    var h = S.host;
    if (HK.SAFE_ON || h.kind !== 'res' || S.hostSex || !DG.TEMPT) return [];
    return freeOf(S).filter(function (x) { return (x.pleasure >= 40 || x.corrupt >= 45 || hasCurse(x, 'heat')) && sexOk(h, x); });
  }
  function descend(S, x) {
    var h = S.host, TT = DG.TEMPT, r = R(S);
    var o = P().order(h, x, [h, x]), t = o[0], u = o[1], lead = t === h;
    var M = { a: h.name, b: x.name, t: t.name, u: u.name, ev: '罠' };
    var intro = nm(pk(S, T.sex[lead ? 'lead' : 'offer']), M);
    var tt = tieOf(S, x), love = loveOk(h, x);
    var want = x.corrupt / 90 + x.pleasure / 160 + x.tr.fc * 0.25 + (tt.near ? 0.45 : 0) - (tt.bad ? 0.5 : 0) - x.tr.cp * 0.3 - Math.max(0, x.reason) / 250 + r() * 0.4;
    S.hostSex = 1;
    var why0 = h.name + 'が観察室から降りてきた（' + x.name + 'の快感 ' + Math.round(x.pleasure) + '・堕ち度 ' + Math.round(x.corrupt) + '）';
    if (want <= 0.55) {
      x.reason += 3;
      sayAs(S, x, { kind: 'ev', tag: '主催者', text: intro + '\n\n' + nm(pk(S, T.refuse), M), why: why0 + ' → ' + x.name + 'は断った' });
      return;
    }
    var X = HK.Lewd, cf = X && X.conf('dungeon');
    var low = (cf && X.lv(S.env) === 'low') || S.env.trap < 15;
    var thick = !low && (S.env.lewdLen === 'thick' || (S.env.lewdLen === 'mix' && r() < 0.5) || !cf);
    var ero = !low && cf && X.ero(S.env) && !!HK.Ero;
    var cb = combo(t, u), parts = [];
    if (low) parts.push(intro, nm(pk(S, T.fade), M));
    else {
      parts.push(intro + ' ' + nm(pk(S, TT.yield), M));
      parts.push(nm(voice(S, pk(S, TT.act[cb]), u, t), M));
      var cl = voice(S, pk(S, TT.climax[u.persona] || TT.climax.gentle), u, t);
      if (ero) { cl += ' ' + eroFill(S, pk(S, TT.ero[cb]), u, false); cl += ' ' + eroFill(S, pk(S, TT.eroTop[cb === 'ff' || cb === 'fm' ? 'f' : 'm']), t, true); }
      cl += ' ' + pk(S, TT.topFin[cb]);
      parts.push(nm(cl, M));
      parts.push(nm(pk(S, T.after), M));
    }
    spend(S, x, x === t); spend(S, h, h === t);
    x.reason -= 4;
    S.hostSex = 2;
    var ev = sayAs(S, x, { kind: 'ev', tag: '主催者', text: parts.join(thick || low ? '\n\n' : ' '), why: why0 + ' → ' + x.name + 'は応じた（' + t.name + 'が攻め）' + (love ? '' : '／恋愛にはしない組') });
    DG.key(S, ev, h.name + 'が' + x.name + 'のもとへ降りてきた');
    pn(S, '主催者の' + h.name + 'は一度だけ観察室を降り、' + x.name + 'と肌を重ねた。');
    S.hostSexWith = x.name;
    S.h = x;
    if (DG.settle(S)) DG.fallHero(S, x);
  }

  /* 一部屋ごと：新しい階では品評、ときどき手を出す */
  DG.hostRoom = function (S, hit) {
    var h = S.host; if (!h || S.over) return;
    var r = R(S), F = freeOf(S);
    var live = S.party.filter(function (x) { return !x.fallen; });
    if (!live.length) return;
    /* 住人の主催者：後半の階に入ると、気づくことがある */
    if (h.kind === 'res' && !S.hostKnown && S.floor >= Math.ceil(S.floors / 2) && r() < 0.35) { discover(S, '迷宮の後半で、主催者の手がかりを見つけた'); return; }
    if (S.hostFl !== S.floor) {
      S.hostFl = S.floor;
      if (F.length && r() < 0.65) { comment(S, (hit && F.indexOf(hit.h) >= 0 && r() < 0.6) ? hit.h : F[r.int(F.length)]); return; }
    }
    if ((S.hostN || 0) >= 4 || S.log.length - S.hostLast < 6 || r() > 0.24) return;
    var fv = S.hostFav && !S.hostFav.fallen ? S.hostFav : null, t = h.tr;
    var opts = [];
    if (fv && (fv.captor && !fv.bossCapture || fv.pleasure >= 70 || fv.corrupt >= 75)) opts.push(['save', 0.6 + t.np * 0.8 + (h.persona === 'gentle' || h.persona === 'devoted' ? 0.5 : 0), fv]);
    var bt = F.filter(function (x) { return !(HK.ngPair && HK.ngPair(h, x)); });
    if (bt.length) opts.push(['boost', 0.4 + t.fc * 0.5 + t.cp * 0.3 + (h.kind === 'mob' ? 0.4 : 0) + (/proud|tsun|cool|free/.test(h.persona) ? 0.3 : 0), bt[r.int(bt.length)]]);
    if (F.length) opts.push(['tease', 0.3 + t.fc * 0.4 + t.ac * 0.2, F[r.int(F.length)]]);
    var sc = sexCand(S);
    if (sc.length) opts.push(['sex', 0.25 + t.fc * 0.3 + (1 - t.cp) * 0.1, sc[r.int(sc.length)]]);
    var pickd = HK.weighted(r, opts, function (o) { return o[1]; });
    if (!pickd) return;
    S.hostN = (S.hostN || 0) + 1; S.hostLast = S.log.length;
    /* 声・助け舟・降りてくる：住人の主催者なら、ここで正体が知れることがある */
    if (h.kind === 'res' && !S.hostKnown && (pickd[0] === 'sex' || r() < 0.4)) discover(S, pickd[0] === 'sex' ? '主催者が自分から姿を見せた' : '聞き覚えのある声・見覚えのある手口で気づいた');
    if (pickd[0] === 'save') save(S, pickd[2]);
    else if (pickd[0] === 'boost') boost(S, pickd[2]);
    else if (pickd[0] === 'tease') tease(S, pickd[2]);
    else descend(S, pickd[2]);
  };

  /* 結末に主催者の一行を足す */
  var end0 = DG.ending;
  DG.ending = function (S) {
    var E = end0(S), h = S.host;
    if (!h || !E || !Array.isArray(E.lines)) return E;
    var clear = S.over === 'clear', P0 = S.party;
    var who = clear ? P0.filter(function (x) { return !x.fallen; }) : P0.filter(function (x) { return x.fallen; });
    if (!who.length) who = P0;
    var key = h.kind === 'mob' ? (clear ? 'mobClear' : 'mobFall') : !S.hostKnown ? 'resHidden' : clear ? 'resClear' : 'resFall';
    E.lines.push(nm(pk(S, T.end[key]), { h: h.name, n: names(who) }));
    if (h.kind === 'res' && S.hostSex === 2 && S.hostSexWith) E.lines.push('主催者の' + h.name + 'は、一度だけ観察室を降りて' + S.hostSexWith + 'と肌を重ねた。' + (S.hostKnown ? '' : 'そのとき見た顔のことを、' + S.hostSexWith + 'は誰にも話していない。'));
    return E;
  };
  var fin0 = DG.finish;
  DG.finish = function (S, input) {
    var res = fin0(S, input), h = S.host;
    if (!h) return res;
    res.host = { name: h.name, kind: h.kind, i: h.i, known: !!S.hostKnown };
    res.summary += '／主催者：' + h.name + (h.kind === 'mob' ? '（モブ）' : '');
    /* 住人の主催者も、結果の住人一覧に入れる（入力の並びのまま） */
    if (h.kind === 'res') {
      var seen = {};
      res.chars = res.chars.concat([{ name: h.name, i: h.i }]).filter(function (c) { if (seen[c.i]) return false; seen[c.i] = 1; return true; }).sort(function (a, b) { return a.i - b.i; });
    }
    return res;
  };
})();
