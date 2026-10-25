/* 箱庭シミュレーター: 媚薬ロッカー ― 一人のとき・三人以上のとき（全年齢版も同じ）
   ・一人：媚薬の満ちるロッカーに一人きり。耐える（全年齢・R18に参加しない人）か、一人で慰める（R18版。文は locker-crowd-r18.js）。
     見回りの人（モブ）に見つけてもらう・自力で出る・時間切れ。モブとの体の場面は HK.State.mobSexOk（HK.Mob.sexOk）を通し、
     向きは HK.Pos.vsNpc・hardTopNpc で決める。同意のない場面は内容のスイッチ（HK.Content.on(env, 'force', 'locker')）が入のときだけ
   ・三人以上：用具倉庫に並ぶロッカーに、二人ずつ・三人ずつ・一人で押し込まれる。誰と誰がくっつくかは運しだい。
     同じロッカーの二人は、二人のときの文（LK.ACT・LK.CONT など）で手を出す・嗜める。三人のロッカーは、三人とも互いに
     体の関係になれる組（HK.Pos.okSex・HK.State.r18ok・HK.ngPair・HK.sexBlocked・HK.canLove を両方向）のときだけ三人の場面に。
     ロッカー越しの嫉妬・失恋・取り合い（すれ違い系）と、応援・伝言・励まし・祝福（仲良し系）は、半々くらいになるように選ぶ
   ・二人のときは solo-locker.js の本筋のまま（このファイルは LK.crowd を足すだけ） */
(function () {
  'use strict';
  var HK = window.HK, LK = HK.LOCKER, ST = HK.Story;
  /* 表・数の見出しの言葉（全年齢版は「高鳴り」） */
  var W_CL = '高鳴り';
  /* r18:begin */
  W_CL = '絶頂';
  /* r18:end */
  if (!LK || !ST) return;
  var clamp = HK.clamp;
  function L(s) { return s.split('|'); }
  var CW = LK.CROWD = {};

  /* ======================= 一人のとき（全年齢でも使う文） ======================= */
  CW.INTRO1 = L('目を覚ますと、{a}は狭いロッカーの中に一人で立っていた。肩も背中も、冷たい金属の壁にぴたりと触れている。天井の小さな穴から、甘ったるい桃色の霧がしゅうしゅうと噴き出していた。|暗闇の中で、{a}は自分の息の音だけを聞いていた。手を伸ばすと、すぐに冷たい壁に触れる。鼻をくすぐる甘い匂いに気づいたのは、そのあとだった。|がしゃん、と扉の閉まる音で、{a}は我に返った。人ひとりがやっと入れる幅のロッカーだった。足元の通気口から、桃色の霧が細くたなびいている。');
  CW.BIND1 = {
    cuff: L('{a}の両手は、背中で手錠につながれていた。鎖はロッカーの内側のフックに引っかけられている。|{a}の手首には、柔らかい革の手錠が巻かれていた。後ろ手のままでは、扉に触れることもできない。|{a}の両手は、頭の上のフックに手錠でまとめられていた。体をひねるたび、鎖がちゃりと鳴った。'),
    none: L('手足は自由だった。けれど、肘を曲げるだけで壁に当たるほど狭い。|拘束はされていなかった。ただ、しゃがむことさえできない狭さだった。|{a}の手は自由だった。扉を押してみたが、外から鍵がかかっているのか、びくともしない。')
  };
  CW.SPEAKER1 = L('どこかのスピーカーから、加工された声が響いた。「ようこそ、媚薬ロッカーへ。今回のお客様はお一人。誰にも頼れないぶん、どうぞ存分に楽しんで」|スピーカーがざらりと鳴った。「仕掛けを解けば扉は開く。ガスは五分ごとに濃くなる。一人きりで、どこまで耐えられるかな」|天井のスピーカーが、くすくすと笑った。「お相手はいない。だから、何をしても誰にも見られない。……運が悪ければ、見回りの人には見られるけど」');
  /* r18:begin */
  /* ガスの効き（一人）。{b} を使わない */
  CW.GAS1 = [
    L('甘い香りが鼻の奥にまとわりつく。{a}の頬が、じわりと熱を帯びてきた。|{a}は額に浮いた汗を、肩でぬぐった。狭い箱の中が、急に暑くなった気がする。|{a}は息を浅く吸った。吸うたびに、甘ったるい霧が喉の奥に溜まっていく。'),
    L('{a}の呼吸が浅くなった。服が肌に擦れるだけで、背筋がぞくりとする。|{a}は壁にもたれた。触れている金属の冷たさが、やけに気持ちよかった。|{a}は無意識に太腿をすり合わせていた。気づいて、慌ててやめた。'),
    L('{a}の頭がぼうっとしてきた。体の奥が熱く脈打ち、一人なのが、かえってつらかった。|{a}は唇を噛んだ。誰もいないのに、誰かに触れてほしくてたまらない。|{a}の膝が小さく震えた。壁に押しつけた背中から、熱が逃げていかない。'),
    L('{a}の理性は、ほとんど溶けかけていた。漏れる息が、自分でも驚くほど甘い。|{a}はロッカーの壁に額を押し当てた。熱に浮かされて、もう何も考えられない。|{a}の体は、隅々まで火照りきっていた。指先がひとりでに、服の裾を探っていた。')
  ];
  /* r18:end */
  /* R18に参加しない人・全年齢：火照り・めまい・息苦しさだけで書く */
  CW.GAS1_SOFT = [
    L('甘い香りが鼻の奥にまとわりつく。{a}の頬が、じわりと熱を帯びてきた。|{a}は額に浮いた汗を、肩でぬぐった。狭い箱の中が、急に暑くなった気がする。|{a}は袖で額を拭った。狭い箱の中の空気が、少しずつ重くなっていく。'),
    L('{a}の呼吸が浅くなった。甘ったるい匂いのせいで、頭の芯がぼんやりする。|{a}はこめかみを押さえた。熱っぽさが、首の後ろからじわじわ広がってくる。|{a}は換気口のほうへ顔を向けて、少しでも冷たい空気を探した。'),
    L('{a}の視界がゆっくり揺れた。立っているのがやっとだった。|{a}は壁に額を押し当てた。ひんやりした金属だけが、意識をつなぎとめてくれる。|{a}は奥歯を噛みしめた。熱に浮かされたような頭で、それでも出口のことを考えた。'),
    L('{a}は熱にうなされたように、ぐったりと壁にもたれかかった。|{a}の意識が、ときどき途切れそうになる。それでも{a}は、自分の頬を叩いて目を開けた。|{a}は額の汗を拭うこともできず、ただ浅い息を繰り返した。')
  ];
  /* 一人で耐える（態度9種）。全年齢版・R18に参加しない人・その気にならない人 */
  CW.ENDURE1 = {
    proud: L('{a}は舌打ちして、ロッカーの壁を拳で殴った。「……ふざけんな。こんなガスに、負けてたまるか」|{a}は歯を食いしばった。「誰が見てるか知らねえが、思いどおりになってやるかよ」|{a}は額を壁に打ちつけた。鈍い痛みで、熱を無理やり追い払った。'),
    stern: L('{a}は目を閉じ、ゆっくりと呼吸を数えた。「……一、二、三。乱れるな」|{a}は背筋を伸ばし、熱に揺れる体を意志だけで押さえつけた。「この程度で、己を見失うものか」|{a}は拳を握りしめ、爪が手のひらに食い込む痛みに意識を集めた。'),
    tsun: L('{a}はぶんぶんと首を振った。「べ、別に、なんともないし！　ただ暑いだけだし！」|{a}は自分の頬をぺちんと叩いた。「しゃんとしなさいよ、私！」|{a}は壁を睨みつけた。「こんなので、どうにかなるわけないでしょ！」'),
    gentle: L('{a}は胸に手を当てて、ゆっくりと息を吐いた。「大丈夫、大丈夫……落ち着こうね」|{a}は自分に言い聞かせるように、小さく子守唄を口ずさんだ。|{a}は「焦らない、焦らない」と呟いて、扉の継ぎ目に指を添えた。'),
    devoted: L('{a}は唇を結んで、じっと耐えた。「がまん。がまん、しなきゃ」|{a}は大切な人の顔を思い浮かべて、ぎゅっと目を閉じた。「……ちゃんと、帰らなきゃ」|{a}は震える膝に力を込めた。「まだ、大丈夫です……まだ……」'),
    cool: L('{a}は浅い呼吸を意識して整えた。「……ガスの濃度は上がる一方。なら、体温が上がりきる前に出るだけだ」|{a}は頭の中で円周率を唱え始めた。三桁目あたりで、また体の熱がぶり返した。|{a}は「これは薬の作用だ。気持ちじゃない」と、小さく声に出して確かめた。'),
    free: L('{a}は「あーもう、あっつい！」と叫んで、ロッカーの中でじたばたした。叫ぶと少しだけ楽になった。|{a}は好きな歌を大声で歌い始めた。サビのところで、声が裏返った。|{a}は「よーし、こうなったら耐久チャレンジ！」と自分で宣言した。'),
    shy: L('{a}は真っ赤な顔で、壁に額を押しつけた。「だ、誰も見てない……でも、だめ……」|{a}は自分の腕で自分を抱きしめ、小さく縮こまった。|{a}はぎゅっと目をつぶって、心の中で何度も「出たら帰る、出たら帰る」と繰り返した。'),
    polite: L('{a}は小さく咳払いをした。「いけませんね。気を確かに持たなくては」|{a}は乱れかけた襟元を、きちんと整え直した。|{a}は深く息を吐いた。「取り乱すわけには、まいりません」')
  };
  CW.ENDURE1_BOUND = L('手錠の鎖が、{a}の身じろぎに合わせてちゃりちゃりと鳴った。手が使えないぶん、熱の逃がし場所がどこにもない。|{a}は後ろ手のまま、壁に背中を押しつけた。冷たい金属だけが、わずかな救いだった。|{a}は鎖を引っ張ってみた。フックはびくともしなかった。それでも、何かしていないと気が変になりそうだった。');
  CW.QUIET1 = L('{a}は浅い呼吸を繰り返しながら、扉の隙間から差す一筋の光を見つめていた。|{a}は耳を澄ませた。聞こえるのは、ガスの噴き出す音と、自分の心臓の音だけだった。|{a}はじっと動かずに、次の手を考えた。考えることがあるうちは、まだ大丈夫だった。');
  CW.SURGE1 = L('換気口から、ひときわ濃いガスが噴き出した。{a}は思わずむせて、壁に手をついた。|ロッカーががたんと揺れた。{a}の体が壁に押しつけられ、ガスが顔にまともにかかった。|照明が消えた。真っ暗な箱の中で、甘い匂いだけがいっそう濃くなった。');
  CW.CALM1 = L('通気口から、少しだけ冷たい空気が流れ込んだ。{a}は深呼吸をして、わずかに理性を取り戻した。|{a}は自分の唇を噛んで、痛みで正気を保とうとした。|ガスの噴き出す音が、しばらく止まった。{a}はその隙に、ゆっくりと呼吸を整えた。');
  /* 見回りの人（{m}）に見つけてもらう */
  CW.FIND = {
    calm: L('外から足音が近づいてきた。「＠誰か入ってますかー？」――{mr}の声だった。扉が開き、{a}は外の空気を胸いっぱいに吸い込んだ。|がちゃがちゃと鍵の回る音がして、扉が開いた。懐中電灯を持った{mr}が、目を丸くしていた。「＠……え、人？　大丈夫ですか」|館内の見回りをしていた{mr}が、ロッカーの中の物音に気づいた。合鍵で扉が開くと、甘い霧がふわりと廊下へ流れ出た。'),
    hot: L('扉が開いた瞬間、{a}はほとんど倒れ込むようにして外へ出た。受け止めたのは、{mr}だった。「＠わ、熱い。大丈夫ですか」|「＠誰かいますかー」――{mr}が扉を開けると、真っ赤な顔の{a}がずるずると崩れ落ちてきた。{m}は慌てて{a}の肩を支えた。|合鍵で扉を開けた{mr}は、漏れ出した甘い霧に思わず咳き込んだ。中では{a}が、熱に浮かされた目でこちらを見上げていた。')
  };
  CW.HELP = L('{m}は何も聞かずに、自販機で買った冷たい水を差し出した。{a}はそれを一気に飲み干して、ようやく息をついた。|{m}は{a}を廊下のベンチに座らせ、窓を全開にした。「＠しばらく風に当たっていてください。何があったのか、聞かないでおきます」|{m}は上着を脱いで{a}の肩にかけた。「＠医務室、行きます？」――{a}は首を横に振るのが精一杯だった。');
  /* その気になりかけたが踏みとどまる／モブが断る */
  CW.ASK_NO = L('{a}は{m}の袖を掴みかけて、その手を自分で引っ込めた。「……なんでもない。水、もらえる？」|{a}の視線に気づいた{m}は、困ったように笑って一歩下がった。「＠今のあなたに何かするのは、ずるい気がするので」|{a}は熱っぽい目で{m}を見上げたが、{m}は首を振って、そっと{a}の肩を押し戻した。「＠ガスが抜けるまで、ここで待ってます」');
  CW.END1 = {
    clean: L('{a}は扉を押し開けて、外の廊下に転がり出た。一人きりで耐えきった達成感と、ひどい疲れが同時に押し寄せた。|扉が開いた。{a}は壁に手をついて、ゆっくりと外へ出た。誰にも会わなかったのは、たぶん幸運だった。|ロックの外れる音を聞いた瞬間、{a}は全身の力が抜けた。這うようにして外に出ると、廊下の空気がやけに冷たく感じた。'),
    found: L('{a}は{m}に支えられて、廊下の端まで歩いた。お礼を言うと、{m}は「＠お大事に」とだけ言って去っていった。|水を飲み終えた{a}は、深々と頭を下げた。{m}は手を振って、見回りに戻っていった。名前を聞きそびれたことに気づいたのは、ずいぶんあとだった。|{m}が呼んだ係の人に付き添われて、{a}は建物の外へ出た。夜風に当たると、ようやく頭がはっきりしてきた。'),
    luck: L('扉の向こうで、何かが外れる音がした。ガスのタンクが空になったらしい。{a}は恐る恐る扉を押して、外へ出た。|館内放送が流れた。「設備点検のため、全てのロックを解除します」――{a}は耳を疑いながら、開いた扉から外へ出た。|突然、ロッカーの扉がひとりでに開いた。{a}はしばらく呆然としてから、そろそろと外へ足を出した。'),
    timeout: L('ブザーが鳴り、扉がひとりでに開いた。{a}はその場にへたり込み、しばらく立ち上がれなかった。|時間切れを告げる音とともに、ロックが外れた。{a}は扉にもたれたまま、ずるずると外へ滑り出た。|スピーカーが「お疲れさまでした」と言った。扉が開いても、{a}はしばらく動けなかった。')
  };

  /* ======================= 三人以上のとき ======================= */
  CW.INTRO_G = L('目を覚ますと、{all}は薄暗い用具倉庫の中にいた。壁際に、人が入れるほどのロッカーがずらりと並んでいる。扉には小さな覗き窓。天井の穴から、甘ったるい桃色の霧がしゅうしゅうと噴き出していた。|「……どこ、ここ」――誰かの声が、金属の壁越しにくぐもって聞こえた。{all}は、古い倉庫のロッカーに、ばらばらに押し込まれていた。足元から、甘い霧が細くたなびいている。|がしゃん、がしゃんと、扉の閉まる音が続けざまに響いた。{all}が気づいたときには、倉庫に並ぶロッカーの中に閉じ込められていた。');
  CW.BIND_G = {
    both: L('全員の両手が、背中で手錠につながれていた。|どのロッカーの中でも、全員が後ろ手に手錠をかけられていた。鎖が鳴るたび、隣の箱からも同じ音が返ってきた。|手首には、全員そろって柔らかい革の手錠。身じろぎするたびに、隣にいる誰かと体が擦れ合った。'),
    one: L('どのロッカーでも、一人だけが手錠につながれていた。|手錠をかけられているのは、ロッカーごとに一人ずつ。残りの人の手は自由だった。|それぞれのロッカーで、誰か一人の両手だけが、頭の上のフックにまとめられていた。'),
    none: L('拘束はされていなかった。ただ、どのロッカーも狭すぎて、腕を上げることすらままならない。|手足は自由だった。けれど、少しでも動けば、同じ箱の誰かと必ずどこかが触れ合ってしまう。|手錠はない。そのかわり、ロッカーには人が詰め込まれすぎていた。')
  };
  CW.SPEAKER_G = L('どこかのスピーカーから、加工された声が響いた。「ようこそ、媚薬ロッカーへ。今回は大勢でのご来場、ありがとう。ロッカーは、仕掛けが解ければ全部一斉に開く。……誰と一緒に閉じ込められたかは、運次第」|スピーカーがざらりと鳴った。「ガスは五分ごとに濃くなる。隣の箱の声は、よく聞こえるように作ってある。せいぜい、仲良くね」|天井のスピーカーが、くすくすと笑った。「仕掛けは一つずつ。誰かが解けば、全員が出られる。誰と誰がくっついているかは……出てからのお楽しみ」');
  CW.LAY = {
    pair: L('{a}と{b}は、同じロッカーに押し込まれていた。胸と胸が触れ合うほど近い。|{a}が身じろぎすると、すぐそばで{b}の息がかかった。同じ箱の中だった。|{a}の背中に、{b}の体温がぴたりと貼りついていた。二人で一つのロッカーだった。'),
    /* {a}＝真ん中 */
    trio: L('{a}は、{b}と{c}のあいだに挟まれていた。大きめのロッカーとはいえ、三人では身動きもできない。|三人用の掃除用具入れに、{a}・{b}・{c}がぎゅうぎゅうに押し込まれていた。真ん中の{a}は、前にも後ろにも逃げ場がない。|{a}の右肩には{b}が、左肩には{c}が押しつけられていた。三人の体温が、狭い箱の中で混ざり合った。'),
    alone: L('{a}は一人だけ、端のロッカーに入れられていた。隣から、誰かの息づかいが壁越しに聞こえてくる。|{a}のロッカーには、ほかに誰もいなかった。幸運なのか、そうでないのか、まだ分からない。|{a}は一人きりの狭いロッカーで、隣の壁をこんこんと叩いた。返事のように、向こうからも叩き返す音がした。')
  };
  /* 三人のロッカーで、真ん中の人が入れ替わる（{a}＝新しく真ん中に来た人） */
  CW.SHIFT = L('ロッカーががくんと傾いた。三人の体が一斉にずれて、今度は{a}が{b}と{c}のあいだに押し込まれた。|{b}が足を踏み替えた拍子に、三人の並びががらりとずれた。真ん中に来たのは、{a}だった。|照明が一瞬消えて、誰かがよろけた。明かりが戻ると、{a}が{b}と{c}に挟まれていた。');
  CW.SURGE_G = L('換気口から、ひときわ濃いガスが噴き出した。あちこちのロッカーから、同時にむせる声が上がった。|倉庫全体が大きく揺れた。どのロッカーの中でも、体と体がさらに強く押しつけられた。|照明が消えた。真っ暗な倉庫の中で、あちこちから浅い息づかいだけが聞こえた。');
  CW.CALM_G = L('倉庫の高窓から、冷たい夜風が流れ込んだ。あちこちのロッカーで、ほっと息をつく音がした。|「深呼吸！　みんな、深呼吸！」――誰かの声につられて全員が息を吸い、わずかに理性が戻った。|ガスの噴き出す音が、しばらく止まった。誰からともなく、ロッカー越しに「大丈夫？」と声を掛け合った。');
  CW.QUIET_G = L('倉庫の中は静かだった。どのロッカーからも、浅い呼吸の音だけが聞こえていた。|誰も口をきかなかった。ガスの噴き出す音だけが、規則正しく続いていた。|ロッカーの覗き窓が、甘い霧で白く曇っていった。');

  /* ---------- ロッカー越しの出来事（三人の場面） ----------
     すれ違い系（J）：{a}＝胸を痛める人、{b}＝{a}の想う相手、{c}＝{b}のそばにいる人
     仲良し系（W）：{a}・{b}・{c} の三人 */
  CW.J = {
    pressed: L('{a}の覗き窓から、向かいのロッカーが見えた。{b}と{c}が、隙間もないほど体を寄せ合っている。仕方ないことだと分かっていても、{a}は目を逸らせなかった。|「そっち、狭くない？」――{a}が{b}に声をかけると、答えたのは{c}だった。「大丈夫、くっついてるから」。{a}の胸に、小さな棘が刺さった。|{a}は、{b}が{c}と同じロッカーに入れられていると知って、急に落ち着かなくなった。ガスのせいだ、と自分に言い聞かせても、胸のざわつきは収まらなかった。'),
    hear: L('壁の向こうから、{b}の押し殺した声が聞こえた。{c}の名前を呼んでいる。{a}は思わず、ロッカーの壁に拳を押し当てた。胸の奥が、ガスとは違う熱でちりちりと焼けた。|隣のロッカーが、かたかたと小さく揺れていた。中にいるのは{b}と{c}だ。{a}は耳を塞ぎたいのに、どうしても聞き耳を立ててしまう自分が嫌だった。|「{b}……？」――{a}が壁越しに呼びかけると、隣の物音がぴたりと止まった。返事の代わりに聞こえたのは、{c}の小さな笑い声だった。{a}は唇を噛んだ。'),
    watch: L('同じ箱に押し込まれた{a}は、逃げることもできずに、{b}と{c}のそれを一番近くで見ているしかなかった。|{a}の肩越しに、{b}の手が{c}の頬に触れた。{a}は気づかないふりをしたが、握りしめた拳は震えていた。|{b}が{c}にもたれかかるたび、{a}の胸がきゅっと痛んだ。「……ずるい」と、声にならない声が漏れた。'),
    rival: L('「{b}、大丈夫？」――{a}と{c}の声が、ほとんど同時に飛んだ。二人は一瞬黙り込み、互いの気配を探った。|{a}が{b}を励ますと、すかさず{c}も声を張り上げた。{b}を挟んで、見えない張り合いが始まった。|{a}は、{c}が{b}を気にかける声の調子に気づいた。たぶん、向こうも同じことに気づいている。狭い倉庫の空気が、ガスとは別の意味で重くなった。'),
    lost: L('{b}が{c}の名前を呼ぶ声は、{a}が一度も聞いたことのない響きをしていた。{a}は静かに目を閉じた。ああ、そういうことか、と思った。|{a}は壁越しに、{b}と{c}が小さく笑い合うのを聞いた。その笑い声に、{a}の入る隙間はどこにもなかった。|覗き窓の向こうで、{b}は{c}だけを見ていた。{a}はそっと窓から目を離した。ガスの熱より、胸の痛みのほうがずっと重かった。')
  };
  /* 想う相手はいないが、隣のロッカーで寄り添う二人（{b}{c}）が妬ましい */
  CW.J.envy = L('隣のロッカーから、{b}と{c}のひそひそ声が聞こえてくる。一人で熱をこらえている{a}には、それが妬ましくてたまらなかった。|覗き窓の向こうで、{b}と{c}が寄り添っていた。{a}は、自分だけが取り残されたような気がして、唇を尖らせた。|{b}と{c}のロッカーだけ、なんだか楽しそうだった。{a}は壁を軽く蹴った。「いいなー、そっちは」――声には、隠しきれない妬みがにじんでいた。');
  CW.J_TAG = { pressed: 'やきもち', hear: '嫉妬', watch: '嫉妬', rival: '取り合い', lost: '失恋', envy: 'やっかみ' };
  CW.J_WHY = { pressed: 'が別の人と同じロッカーに押し込まれているのを見て、やきもちを焼いた', hear: 'が隣のロッカーで別の人と触れ合う気配に、嫉妬した', watch: 'が同じロッカーで別の人と唇を重ねるのを、すぐそばで見て嫉妬した', rival: 'を想う人がもう一人いると気づいて、張り合った', lost: 'の気持ちが別の人に向いていると悟って、失恋した', envy: 'たちが寄り添う気配に、取り残された気がして妬ましくなった' };
  /* 胸を痛めた人のひとこと（態度9種） */
  CW.JSAY = {
    proud: L('「ちぇ。勝手にしろ」|「ふざけんな……そいつに、触んな」|「……別に。どうでもいい」'),
    stern: L('「今は、脱出が先だ」|「……見苦しいぞ、私」|「……気にしていない。していない、はずだ」'),
    tsun: L('「べ、別に、気にしてないし！」|「……ばか。ばかばか」|「な、なによ、楽しそうにしちゃって」'),
    gentle: L('「……ううん、仕方ないよね」|「……大丈夫。大丈夫だから」|「そうか。そうだよね」'),
    devoted: L('「……わたしじゃ、だめなのかな」|「我慢、しなきゃ」|「……いいんです。わたしは、平気ですから」'),
    cool: L('「……合理的に考えれば、気にする理由はない。……ない、はずだ」|「……くだらない」|「……ガスのせいだ。そういうことにしておく」'),
    free: L('「えー……なにそれ、ずるくない？」|「……あー、もやもやするー！」|「ちぇー、つまんないの」'),
    shy: L('「き、聞こえてないふり、聞こえてないふり」|「……う、うう……」|「……い、いいな……」'),
    polite: L('「……失礼。少し、取り乱しました」|「……お邪魔は、いたしません」|「……お気になさらず。わたくしは、大丈夫です」')
  };
  CW.W = {
    cheer: L('{a}が壁越しに声を張り上げた。「{b}も{c}も、がんばれ！　もうすぐ出られるから！」――向こうのロッカーから、ほっとしたような笑い声が返ってきた。|「そっちの二人、生きてるー？」――{a}の呑気な声に、{b}と{c}が同時に吹き出した。張りつめていた空気が、少しだけ緩んだ。|{a}は覗き窓越しに、{b}と{c}に向かって親指を立てた。言葉はなくても、「大丈夫」と伝わった気がした。'),
    relay: L('{a}が見つけたヒントを、{b}が隣のロッカーへ叫んで伝え、{c}がそれを仕掛けに打ち込んだ。三人がかりの伝言ゲームで、仕掛けが少し進んだ。|「四桁目、たぶん7！」――{a}の声に、{b}が「了解！」と返し、{c}が手を伸ばした。ばらばらのロッカーにいても、息はぴったりだった。|{b}が読み上げた手がかりに、{a}と{c}が壁越しに答えを出し合った。三人で考えると、ガスのことを少しだけ忘れられた。'),
    reassure: L('「{b}、気にしなくていいからね。ガスのせいなんだから」――{a}の声が、壁越しに届いた。{b}の肩から力が抜けるのを、すぐ隣の{c}も感じていた。|{a}は覗き窓越しに、{b}に向かって笑ってみせた。「{c}と一緒なら安心。ちゃんと出てきてね」――{c}も、照れくさそうに頷いた。|{b}が「ごめんね。{c}と密着しちゃってて」と謝ると、{a}は笑った。「謝ることじゃないよ。二人とも、無事に出よう」'),
    tease: L('「ねえ、誰か今くしゃみした？」「してない！」「した！」――{a}と{b}と{c}の言い合いに、あちこちのロッカーから笑い声が上がった。|{a}が「出たらみんなで冷たいもの食べに行こう」と言うと、{b}が「かき氷！」、{c}が「アイス！」と即答した。三人とも、少しだけ元気が出た。|{a}がしりとりを始めると、{b}と{c}も壁越しに乗ってきた。熱で言葉がおかしくなるたびに、三人で笑い転げた。'),
    bless: L('隣のロッカーから、{b}の「……好き」という小さな声が聞こえた。{a}は思わず、壁越しに拍手を送った。「おめでとう！　出たら、ちゃんと聞かせてよね」|{b}と{c}の距離が縮まったことに、{a}はとっくに気づいていた。「いいじゃない、二人とも。おめでとう」――壁越しの声は、心からうれしそうだった。|{a}は覗き窓越しに、寄り添う{b}と{c}を見て、そっと微笑んだ。「……お似合いだよ、ほんとに」'),
    /* 同じ三人のロッカーで、二人が寄り添う。{a}＝見守る三人目 */
    kind: L('すぐ隣で{b}と{c}が身を寄せ合っても、{a}は目を閉じて、二人の肩をそっと抱き寄せた。「……いいよ。見てないから」|{a}は、寄り添う{b}と{c}のために、体をずらして少しだけ隙間を作った。「ごゆっくり。狭いけどね」|{b}と{c}の様子に気づいた{a}は、くすっと笑って、壁のほうを向いた。「出たら、ちゃんと教えてね」'),
    /* 三人のロッカーが、仲よくくっついている */
    trio: L('三人は、狭いロッカーの中で額を寄せ合った。「三人一緒でよかった」と{a}が言うと、{b}と{c}も小さく笑った。|{a}は、右と左から押しつけられる{b}と{c}の手を、片方ずつ握った。三人分の鼓動が、手のひらから伝わってきた。|「この狭さにも、もう慣れたね」――{b}の言葉に、{a}と{c}が同時に吹き出した。笑うたびに、三人の体が一緒に揺れた。')
  };
  CW.W_TAG = { cheer: '応援', relay: '伝言リレー', reassure: '励まし', tease: '笑い合う', bless: '祝福', kind: '見守る', trio: '寄り添う三人' };
  CW.W_WHY = { cheer: 'が、別のロッカーの二人を励ました', relay: 'たちが、ロッカー越しに手がかりを伝え合った（仕掛けが進む）', reassure: 'が、別の人とくっついている恋人を気遣った', tease: 'が、ロッカー越しに冗談を言い合った', bless: 'が、距離の縮まった二人を祝った', kind: 'が、同じロッカーで寄り添う二人を見守った', trio: 'は、三人で寄り添って熱をやり過ごした' };
  /* 三人とも互いに想い合える三人のロッカー（全年齢：寄り添う・唇を重ねるまで） */
  CW.T3 = {
    touch: L('三人は、どちらからともなく互いの背中に腕を回した。誰の心臓の音なのか、もう分からなかった。|{a}は{b}と{c}をまとめて抱き寄せた。三人分の体温で、ロッカーの中はますます熱くなった。|{b}が{a}の肩に頬をのせ、{c}がその背中にもたれた。三人は、そのまましばらく動かなかった。'),
    kiss: L('{a}は{b}に、{b}は{c}に、{c}は{a}に。三人は狭い箱の中で、順番に唇を重ねた。|{a}が{b}の唇を塞ぐと、{c}が待ちきれずに{a}の頬に口づけた。三人の息が、熱く混ざり合った。|三人は額を寄せ合い、誰からともなく唇を寄せた。誰と誰が触れているのか、途中から分からなくなった。')
  };
  CW.END_G = {
    open: L('仕掛けが解けると、倉庫中のロッカーが一斉に開いた。{all}はふらふらと外へ出て、互いの無事を確かめ合った。|ロックの外れる音が、あちこちで重なった。全員が倉庫の床に座り込み、しばらく誰も口をきかなかった。やがて、誰かが笑い出した。|扉が開くと、冷たい空気が倉庫に流れ込んだ。{all}は顔を見合わせて、ほっと息をついた。'),
    luck: L('外から足音が聞こえた。「＠誰か入ってますかー？」――見回りの人の合鍵で、ロッカーが次々と開いた。|倉庫の照明がぱっと点き、館内放送が流れた。「設備点検のため、全てのロックを解除します」――{all}は顔を見合わせた。|ガスのタンクが空になったのか、ロッカーの扉が一斉にひとりでに開いた。'),
    timeout: L('ブザーが鳴り、ロッカーの扉が一斉に開いた。時間切れだった。{all}は這うようにして外へ出た。|時間切れを告げる音とともに、全部のロックが外れた。誰もが、しばらく立ち上がれなかった。|スピーカーが「お疲れさまでした」と告げ、扉が次々と開いた。倉庫の床に、ぐったりした体が並んだ。')
  };
  CW.MOOD = {
    warm: L('帰り道、{all}は肩を並べて歩いた。ロッカーの中のことは、誰もからかわなかった。|「次は、普通の場所で集まろうね」――誰かの言葉に、全員が苦笑いで頷いた。|{all}は、近くのコンビニで冷たい飲み物を買って乾杯した。散々な夜だったが、なぜか悪くない気分だった。'),
    jeal: L('倉庫を出たあとも、{a}は{b}の顔をまっすぐに見られなかった。胸のもやもやは、ガスが抜けても消えなかった。|{a}は一人だけ先に倉庫を出た。{b}が誰と一緒だったかを、思い出したくなかった。|帰り道、{a}は{b}の隣を歩いた。何か言いたいのに、言葉にすると嫉妬になりそうで、黙っていた。'),
    lost: L('{a}は笑って「おめでとう」と言った。言えた自分を、少しだけ褒めてやりたかった。|{a}は、並んで歩く{b}と{c}の背中を見送った。失恋の痛みは、ガスよりもずっと長く残りそうだった。|{a}はその夜、一人で少しだけ泣いた。それから、次の朝には、いつもの顔で{b}に挨拶をした。')
  };

  /* ======================= 判定 ======================= */
  var ROMT = /^(lover|mate|fated|fwb|crush|almost|ex|master|honmei|yan|worship)$/;
  function tiesOf(S, a, b) { return (S.ties || []).filter(function (t) { return (t.a === a.i && t.b === b.i) || (t.a === b.i && t.b === a.i); }); }
  function has(S, a, b, re, dir) { return tiesOf(S, a, b).some(function (t) { return re.test(t.type) && (!dir || t.a === a.i); }); }
  /* 恋愛にしない関係（家族の「恋愛：なし」・信仰の「恋愛に発展：しない」） */
  function noLoveTie(S, a, b) {
    var tl = tiesOf(S, a, b);
    if (tl.some(function (t) { return /^(lover|mate|fated|fwb|crush|almost|ex|master)$/.test(t.type); })) return false;
    return tl.some(function (t) { return (HK.tieNoLove && HK.tieNoLove(t)) || (t.type === 'worship' && HK.tieOptNoLove && HK.tieOptNoLove(t)); });
  }
  function okLove(a, b) { return !!(a && b && a !== b) && HK.canLove(a, b) && HK.canLove(b, a); }
  /* 同じロッカーの二人が手を出し合ってよいか：受け攻め・恋愛対象（HK.Pos.okSex）・恋愛・R18にしない相手（HK.ngPair）・
     体の関係の縛り（HK.sexBlocked）・恋愛（HK.canLove を両方向）・R18に参加しない（HK.State.r18ok。全年齢は見ない） */
  function canAct(S, a, b) {
    if (!a || !b || a === b) return false;
    if (HK.Pos && !HK.Pos.okSex(a, b)) return false;
    if (HK.ngPair && HK.ngPair(a, b) && !freeOk(S, a, b)) return false;
    if (HK.sexBlocked && HK.sexBlocked(a, b)) return false;
    /* 恋愛相手を固定し、性行為の相手を「誰とでも可」にした人と、固定外の相手（HK.State.freeSex。free-sex.js）は、恋愛（HK.canLove）を見ずに体の関係だけ */
    if (!(okLove(a, b) || freeOk(S, a, b)) || noLoveTie(S, a, b)) return false;
    if (!HK.SAFE_ON && !(HK.State.r18ok(a) && HK.State.r18ok(b))) return false;
    return true;
  }
  function freeOk(S, a, b) { return !!(HK.State.freeSex && HK.State.freeSex(S, a, b)); }
  LK.crowdOk = canAct;
  /* a が b を想っている（関係の恋人・片想いなど、またはこの回だけの「気になる相手」）。恋愛は両方向で通る組だけ */
  function interest(S, a, b) {
    if (!okLove(a, b) || noLoveTie(S, a, b)) return false;
    if (a.honmei === b.i || a.secret === b.i) return true;
    return tiesOf(S, a, b).some(function (t) { return /^(lover|mate|fated|almost|fwb)$/.test(t.type) || (/^(crush|yan)$/.test(t.type) && t.a === a.i); });
  }
  function hardTop(p) { return !!(HK.Pos && HK.Pos.hardTop(p)); }
  function isF(p) { return !!(HK.Pos && HK.Pos.isF(p)); }
  function modeOf(t, u) { return isF(t) && isF(u) ? 'ff' : isF(t) ? 'fm' : 'ins'; }
  /* 恋人（恋人・番・運命の番）がほかにいる人：その恋人以外とは、手を出す・応じるのを踏みとどまりやすい */
  function loyal(S, a, b) { return S.P.some(function (q) { return q !== a && q !== b && has(S, a, q, /^(lover|mate|fated)$/) && okLove(a, q); }); }
  function desperate(p) { return !!(HK.honmeiDesperate && HK.honmeiDesperate(null, p)); }
  function stage(p) { return p.m.heat >= 85 ? 3 : p.m.heat >= 60 ? 2 : p.m.heat >= 35 ? 1 : 0; }

  /* ======================= 共通の部品 ======================= */
  function setup(input) {
    var S = ST.state(input, 'locker'), env = S.env;
    S.ties = input.ties || [];
    S.lew = env.lewd || 'mid';
    S.R18 = !HK.SAFE_ON && S.lew !== 'low';
    var LX = HK.Lewd, lcf = LX && LX.conf('locker');
    S.eroOn = !!(lcf && HK.Ero && HK.Ero.on(S) && HK.ThickEro && S.R18);
    S.pk = function (arr) { return LK.pick(S, arr); };
    S.P.forEach(function (p) {
      p.m = { heat: 0, reason: clamp(70 + p.tr.cp * 15 + (p.stats.gaman || 3) * 3, 40, 100), plea: 0, esc: 0 };
      p.cnt = { make: 0, refuse: 0, accept: 0, climax: 0, solve: 0, hold: 0, self: 0, jeal: 0, warm: 0 };
      p.sens = (0.6 + (6 - (p.stats.gaman || 3)) * 0.1 - p.tr.cp * 0.15) * (0.7 + S.rng() * 0.7);
      var pc = (input.perChar && input.perChar[p.i]) || {};
      p.action = pickFit(S, LK.SCEN.actions, pc.action, p); p.goal = pickFit(S, LK.SCEN.goals, pc.goal, p);
    });
    return S;
  }
  function pickFit(S, list, id, p) { if (id && id !== 'auto') for (var i = 0; i < list.length; i++) if (list[i].id === id) return list[i]; return HK.weighted(S.rng, list, function (o) { return Math.pow(Math.max(0.02, o.fit(p.tr)), 3); }); }
  /* R18に参加しない人の文から、性的な言い回しの候補を外す */
  function soft(arr, p) { if (!p || !p.noR18 || !arr || !arr.filter) return arr; var f = arr.filter(function (l) { return !/喘ぎ|発情|濡れ|疼/.test(l); }); return f.length ? f : arr; }
  function gasStep(S, p, mate) {
    var before = Math.max(stage(p), p.gasShown || 0), env = S.env;
    p.m.heat = clamp(p.m.heat + (4 + env.dose * 0.1 + S.rng() * 4) * p.sens, 0, 100);
    p.m.reason = clamp(p.m.reason - (3 + p.m.heat * 0.13 - (p.stats.gaman || 3) * 0.7 - p.tr.cp * 2), 0, 100);
    var after = stage(p);
    if (after <= before) return;
    p.gasShown = after;
    var sf = p.noR18 || HK.SAFE_ON, pool;
    /* 相手の名前を出すガスの文は、その相手と体の関係になれる組だけ（恋愛対象に合わない相手を意識させない） */
    if (mate && canAct(S, p, mate)) pool = (sf && LK.GAS_SOFT ? LK.GAS_SOFT : LK.GAS)[after];
    else pool = (sf ? CW.GAS1_SOFT : CW.GAS1)[after];
    ST.sayB(S, { actors: [p], tag: ['', '火照り', '発情', '限界'][after], text: ST.fmt(S.pk(pool), { a: p.name, b: mate ? mate.name : '' }), why: p.name + 'の発情 ' + Math.round(p.m.heat) + '・理性 ' + Math.round(p.m.reason) + '（我慢 ' + p.stats.gaman + '）', mag: after * 6 }, p.name + 'の発情が進んだ', after >= 3);
  }
  function gimmickChain(S) {
    var g = [], rng = S.rng, others = LK.GIMMICK.filter(function (x) { return !x.bind && !x.lewd; });
    if (S.bind !== 'none') g.push(LK.GIMMICK.filter(function (x) { return x.bind; })[0]);
    var first = rng.pick(others); g.push(first);
    if (rng() < 0.5 + S.env.diff / 200) g.push(rng.pick(others.filter(function (x) { return x !== first; })));
    return g;
  }
  /* 仕掛けの文：相手の名前（{b}）や「二人」を使う文は、相手のいない人に使わない */
  function gLines(arr, mate) { var f = arr.filter(function (l) { return !/二人/.test(l) && (mate || l.indexOf('{b}') < 0); }); return f.length ? f : ['{a}は、仕掛けにもう一度手を伸ばした。']; }
  function solveStep(S, G, workers, lewdNow) {
    if (!G || !workers.length) return false;
    var env = S.env, rng = S.rng;
    var wk = workers.slice().sort(function (x, y) { return (y.stats.dex * G.dex + y.tr.a * 5 * G.brain) - (x.stats.dex * G.dex + x.tr.a * 5 * G.brain); })[0];
    var pw = 10 + (wk.stats.dex || 3) * 6 * G.dex + wk.tr.a * 30 * G.brain + rng() * 28 + Math.min(3, workers.length) * 6 - G.diff * 0.25 - env.diff * 0.2 - (lewdNow ? 14 : 0) - wk.m.heat * 0.12;
    S.prog = clamp(S.prog + Math.max(4, pw), 0, 100);
    var ok = S.prog >= 100, mate = wk.mates && wk.mates.length ? wk.mates[0] : null, v = { a: wk.name, b: mate ? mate.name : '' };
    ST.sayB(S, { actors: [wk], tag: G.name, text: ST.fmt(S.pk(soft(gLines(G.try, mate), wk)), v) + ST.fmt(S.pk(soft(gLines(ok ? G.ok : G.ng, mate), wk)), v), why: '進み具合 ' + Math.round(S.prog) + '％（' + wk.name + 'の器用さ ' + wk.stats.dex + (G.brain > 0.5 ? '・A' : '') + (lewdNow ? '・いちゃついていて集中できない' : '') + '）', mag: ok ? 22 : 10 }, wk.name + '：' + G.name + ' ' + Math.round(S.prog) + '％', ok);
    if (ok) wk.cnt.solve++;
    return ok;
  }
  /* 喘ぎ：男性向けで相手が応じているときは HK.Ero、ほかは口調ごとの声。top＝攻めとして果てる */
  function moan(S, p, top, mode, ero) {
    if (!S.R18 || S.lew === 'low') return '';
    /* 攻めが果てる声は、主導権を握った側の声（崩れる段階の「負けでいい」のような声を攻めに使わない） */
    if (ero && S.eroOn) { var d0 = p.eroDom; p.eroDom = !!top; var m = HK.Ero.moan(S, p, top ? 1 : 2); p.eroDom = d0; return p.name + '「' + m + '」'; }
    var V = HK.Voice, l = top ? (LK.TOPV && LK.TOPV.moan && LK.TOPV.moan[mode || 'ins'] && (LK.TOPV.moan[mode || 'ins'][p.persona] || LK.TOPV.moan[mode || 'ins'].gentle)) : V && V.CLIMAX && (V.CLIMAX[p.persona] || V.CLIMAX.gentle);
    return l && l.length ? p.name + '「' + S.pk(l) + '」' : '';
  }
  /* 果てる文（態度9種）：受ける側は R.PCL、攻めは R.TCL。{a}＝果てる人 {b}＝相手 */
  function climaxBy(S, p, partner, top) {
    var R = LK.CROWD_R18;
    if (!R || !S.R18) return '';
    var T = top ? R.TCL : R.PCL, l = T && (T[p.persona] || T.gentle);
    return l ? ST.fmt(S.pk(l), { a: p.name, b: partner ? partner.name : '' }) : '';
  }
  function bumpClimax(p) { p.cnt.climax++; p.m.plea = 25; p.m.heat = clamp(p.m.heat - 12, 0, 100); p.m.reason = clamp(p.m.reason + 6, 0, 100); }
  function names(list) { return list.map(function (p) { return p.name; }).join('・'); }

  /* ======================= 一人のとき ======================= */
  function soloRun(input) {
    var S = setup(input), rng = S.rng, env = S.env, A = S.P[0], R = LK.CROWD_R18, pk = S.pk, Pos = HK.Pos;
    S.bind = env.bind === 'random' ? rng.pick(['both', 'one', 'none', 'both']) : env.bind;
    A.bound = S.bind !== 'none';
    A.mates = [];
    var keys = ['heat', 'reason', 'plea', 'esc'], gim = gimmickChain(S), gi = 0, escaped = false, escTurn = -1, how = '', outcome = 'clean', mob = null;
    S.prog = 0;
    var v = { a: A.name };
    ST.step(S, '閉じ込められた');
    ST.budget(S, 3);
    ST.say(S, { actors: [A], tag: '目覚め', text: ST.fmt(pk(CW.INTRO1), v) + ST.fmt(pk(CW.BIND1[A.bound ? 'cuff' : 'none']), v), why: '一人きり／拘束：' + (A.bound ? 'あり' : 'なし') });
    ST.say(S, { kind: 'phase', text: pk(CW.SPEAKER1) + '（仕掛け：' + gim.map(function (g) { return g.name; }).join('→') + '）' });
    ST.snap(S, keys);
    /* 一人で慰められるか（R18版・描写あり・R18に参加する人）。手錠のあいだはできない */
    var selfOk = !!(R && S.R18 && HK.State.r18ok(A));
    var body = Pos && Pos.genSet && Pos.genSet(A) ? (Pos.hasM(A) ? 'm' : Pos.hasF(A) ? 'f' : 'x') : Pos && !Pos.isF(A) && (A.gender === 'm' || (Pos.futa && Pos.futa(A))) ? 'm' : A.gender === 'f' ? 'f' : 'x';
    var finder = env.finder || 'random';
    for (var turn = 0; turn < env.turns && !escaped; turn++) {
      ST.step(S, ((turn + 1) * 5) + '分');
      S.step = turn;
      ST.budget(S, 3);
      var logAt = S.log.length, lewdNow = false;
      A.selfNow = false;
      if (rng() < env.ev / 100 * 0.45) {
        var calm = rng() < 0.3;
        if (calm) { A.m.reason = clamp(A.m.reason + 12, 0, 100); A.m.heat = clamp(A.m.heat - 6, 0, 100); }
        else A.m.heat = clamp(A.m.heat + 10, 0, 100);
        ST.sayB(S, { actors: [A], tag: calm ? '一息' : 'ハプニング', text: ST.fmt(pk(calm ? CW.CALM1 : CW.SURGE1), v), why: calm ? '理性 +12' : '発情 +10' }, calm ? '少しだけ正気に戻った' : 'ガスが濃くなった');
      }
      gasStep(S, A, null);
      /* 一人の葛藤：慰める（R18）／耐える */
      if (A.rest > 0) A.rest--;
      else {
        var urge = A.m.heat / 100 + A.tr.impulse * 0.3 + A.tr.fc * 0.15 - A.m.reason / 130 - A.tr.cp * 0.12 + (A.goal && A.goal.id === 'want' ? 0.12 : A.goal && A.goal.id === 'out' ? -0.08 : 0);
        if (selfOk && A.m.heat >= 50 && urge > 0.3 + rng() * 0.3) {
          lewdNow = true;
          if (A.bound) {
            A.cnt.hold++;
            if (A.cnt.hold <= 2) ST.sayB(S, { actors: [A], tag: '生殺し', text: ST.fmt(pk(R.SELF_BOUND), v), why: '手錠のせいで、自分に触れることもできない（発情 ' + Math.round(A.m.heat) + '）', mag: 20 }, A.name + 'は身をよじった');
            A.m.plea = clamp(A.m.plea + 15, 0, 90);
          } else if (S.lew === 'low') {
            A.cnt.self++; bumpClimax(A); A.rest = 1 + rng.int(2);
            ST.sayB(S, { actors: [A], tag: '一人で', text: ST.fmt(pk(R.SELF_LOW), v), why: A.name + 'は、誰もいないのを確かめて自分を慰めた（発情 ' + Math.round(A.m.heat) + '）', mag: 22, kind: 'climax' }, A.name + 'は一人で', true);
          } else {
            var st0 = A.selfSt || 0, t;
            A.selfNow = true;
            if (st0 < 2) {
              t = ST.fmt(pk(R.SELF[body][st0]), v);
              A.selfSt = st0 + 1; A.m.plea = clamp(A.m.plea + 30 + 20 * st0, 0, 95);
              ST.sayB(S, { actors: [A], tag: st0 ? '一人で' : '我慢の限界', text: t, why: A.name + 'の発情 ' + Math.round(A.m.heat) + '・理性 ' + Math.round(A.m.reason) + '：誰もいないロッカーで、とうとう自分の体に手を伸ばした', mag: 20 + st0 * 4, kind: 'climax' }, A.name + 'は自分に触れた', st0 === 0);
            } else {
              t = ST.fmt(pk(R.SELF[body][2]), v);
              if (S.eroOn) t += HK.Ero.fill(S, ST.fmt(pk(R.SELF_ERO[body]), v), A);
              t += moan(S, A, false) + ST.fmt(pk(R.SELF_CL[A.persona] || R.SELF_CL.gentle), v);
              A.selfSt = 0; A.cnt.self++; bumpClimax(A); A.m.heat = clamp(A.m.heat - 14, 0, 100); A.rest = 1 + rng.int(2);
              ST.key(S, ST.sayB(S, { actors: [A], tag: '一人で果てる', text: t, why: A.name + 'は一人きりのロッカーで果てた（' + A.cnt.self + '回目。熱が少し引いた）', mag: 30, kind: 'climax' }, '', true), A.name + 'は一人で果てた');
            }
          }
        } else if (A.m.heat >= 35 && urge > 0.2 + rng() * 0.3 && (A.cnt.hold < 2 || rng() < 0.25)) {
          A.cnt.hold++; A.m.reason = clamp(A.m.reason + 4, 0, 100);
          ST.sayB(S, { actors: [A], tag: '一人で耐える', text: ST.fmt(pk(A.bound ? CW.ENDURE1_BOUND : CW.ENDURE1[A.persona] || CW.ENDURE1.gentle), v), why: A.name + 'は熱をやり過ごそうとした（理性 +4／' + (HK.PERSONA[A.persona] || {}).label + '）', mag: 14 }, A.name + 'は耐えた', A.cnt.hold === 1);
        }
      }
      /* 仕掛け */
      var G = gim[gi];
      if (G && S.prog < 100 && A.m.reason > 8 && !lewdNow && (G.bind || !A.bound)) {
        if (solveStep(S, G, [A], lewdNow)) {
          if (G.bind) A.bound = false;
          gi++; S.prog = 0;
          if (gi >= gim.length) { escaped = true; escTurn = turn; how = 'solve'; }
        }
      }
      /* 見回りの人に見つけてもらう（おまかせ：運しだい／見回りが来る：時間の半ばまでに／誰も来ない：来ない） */
      var pf = finder === 'none' ? 0 : finder === 'mob' ? 0.12 + turn * 0.05 : 0.01 + (A.stats.luck || 3) * 0.01 + (turn >= env.turns / 2 ? 0.04 : 0);
      if (!escaped && turn >= 2 && rng() < pf) { escaped = true; escTurn = turn; how = 'found'; mob = found(S, A, body); outcome = mob.outcome; }
      if (!escaped && finder !== 'mob' && turn >= 3 && rng() < 0.004 + (A.stats.luck || 3) * 0.003) { escaped = true; escTurn = turn; how = 'luck'; }
      A.m.esc = Math.round((gi + S.prog / 100) / gim.length * 100); A.m.plea = clamp(A.m.plea, 0, 100);
      ST.flushShort(S, 'ほかに：');
      if (S.log.length === logAt) ST.say(S, { kind: 'phase', actors: [A.i], text: ST.fmt(pk(CW.QUIET1), v) });
      ST.snap(S, keys);
    }
    if (!escaped) { how = 'timeout'; escTurn = env.turns; }
    ST.step(S, how === 'timeout' ? '時間切れ' : how === 'found' ? '見つかった' : '脱出');
    ST.budget(S, 4);
    var mins = (escTurn + 1) * 5, relief = A.cnt.self > 0;
    if (how !== 'found') {
      outcome = how === 'timeout' ? 'timeout' : how === 'luck' ? 'luck' : relief ? 'relief' : 'clean';
      var tE = ST.fmt(pk(CW.END1[how === 'timeout' ? 'timeout' : how === 'luck' ? 'luck' : 'clean']), v);
      if (relief && R && R.END_RELIEF) tE += ST.fmt(pk(R.END_RELIEF), v);
      ST.key(S, ST.say(S, { actors: [A], tag: { timeout: '時間切れ', luck: '幸運', relief: '一人で脱出', clean: '無事に脱出' }[outcome], text: tE, why: '耐えた回数 ' + A.cnt.hold + (relief ? '・一人で果てた回数 ' + A.cnt.self : '') + '・発情 ' + Math.round(A.m.heat), mag: 30 }), '結末');
    }
    var mobN = mob && mob.m ? mob.m.full : '';
    A.fate = { clean: '一人で耐えきって脱出', relief: '一人で慰めて、どうにか脱出', luck: '幸運に助けられた', timeout: relief ? '一人で何度も果てながら、時間切れまで耐えた' : '時間切れまで耐えた', found: '見回りの人に助けられた', mob: '見つけてくれた人と一線を越えた', forced: '見つけた人に強引に抱かれた' }[outcome];
    A.notes.push('発情 ' + Math.round(A.m.heat) + '・理性 ' + Math.round(A.m.reason) + '・' + W_CL + ' ' + A.cnt.climax + '回');
    A.notes.push('耐えた ' + A.cnt.hold + '回' + (A.cnt.self ? '・一人で ' + A.cnt.self + '回' : '') + (A.cnt.solve ? '・仕掛けを解いた ' + A.cnt.solve + '回' : ''));
    var title = { clean: mins + '分で、一人で脱出した。誰にも何も起きなかった。', relief: mins + '分で脱出。ロッカーの中で何があったかは、誰も知らない。', luck: mins + '分で、思いがけず扉が開いた。', timeout: '制限時間内に脱出できず、扉は時間切れで開いた。', found: mins + '分、' + mobN + 'に見つけてもらって外へ出た。', mob: mins + '分、見つけてくれた' + mobN + 'と、そのまま一線を越えた。', forced: mins + '分、見つけた' + mobN + 'に、熱に浮かされたまま抱かれた。' }[outcome];
    var lines = [A.name + '：' + A.fate, '仕掛け：' + gim.map(function (g, i) { return g.name + (i < gi ? '（解除）' : ''); }).join('→')];
    return ST.result(S, input, {
      ending: { title: title, kind: outcome === 'clean' || outcome === 'found' ? 'ok' : 'over', lines: lines },
      estats: [['脱出まで', how === 'timeout' ? '時間切れ' : mins + '分'], ['人数', '1人'], ['耐えた', A.cnt.hold + '回'], [W_CL, A.cnt.climax + '回']],
      table: { title: '一人の状態', hint: '発情が高く理性が低いほど、耐えきれなくなる。', cols: ['発情', '理性', '耐えた', W_CL, '解いた', '結末'], rows: [{ i: A.i, rank: '', cells: [Math.round(A.m.heat) + '', Math.round(A.m.reason) + '', String(A.cnt.hold), String(A.cnt.climax), String(A.cnt.solve), A.fate] }] },
      meters: [{ label: '発情', color: '--love' }, { label: '理性', color: '--accent' }, { label: '快感', color: '--pine', dash: true }, { label: '脱出', color: '--partner', dash: true }],
      meta: '1人・拘束' + (S.bind === 'none' ? 'なし' : 'あり') + '・媚薬' + env.dose,
      summary: '媚薬ロッカー：' + title
    });
  }
  /* 見回りの人（モブ）に見つかる。体の場面は HK.Mob.sexOk（R18に参加しない・恋人だけ・全年齢）を通し、向きは HK.Pos.vsNpc */
  function found(S, A, body) {
    var rng = S.rng, pk = S.pk, R = LK.CROWD_R18, Pos = HK.Pos;
    var mg = A.likes === 'm' || A.likes === 'f' ? A.likes : rng() < 0.5 ? 'm' : 'f';
    var m = HK.Mob ? HK.Mob.make(S, { gender: mg, role: rng.pick(['警備員', '清掃員', '管理人', '夜勤の係員']) }) : { name: '見回りの人', gender: mg, tr: {}, mob: true };
    m.persona = HK.personaOf ? HK.personaOf(m) : 'gentle';
    /* 名前は「警備員の朝比奈」。最初だけ役目つきで、あとは苗字だけで呼ぶ */
    m.full = m.name; m.name = m.name.replace(/^.*の/, '');
    var v = { a: A.name, m: m.name, mr: m.full }, hot = A.m.heat >= 60, caught = A.selfNow && R && R.CAUGHT && S.R18;
    var t = ST.fmt(pk(caught ? R.CAUGHT : CW.FIND[hot ? 'hot' : 'calm']), v), outcome = 'found', tag = '見つかった', why = m.name + 'が見回りでロッカーに気づいた', mag = 24, kind = 'event', tags = null;
    /* モブとの体の場面：R18版で描写あり・その人がモブとの場面に出られる・恋愛対象に合う相手 */
    var sexOk = hot && R && S.R18 && (HK.Mob ? HK.Mob.sexOk(A) : HK.State.mobSexOk(A)) && A.likes !== 'none' && (!Pos || Pos.genderOK(A, m));
    if (sexOk) {
      var def = isF(A) && mg === 'm' ? 'bottom' : !isF(A) && mg === 'f' ? 'top' : rng() < 0.5 ? 'top' : 'bottom';
      var side = Pos ? Pos.vsNpc(A, def) || def : def;
      if (Pos && Pos.hardTopNpc(A)) side = 'top';
      var want = A.m.heat / 100 + A.tr.fc * 0.3 + (A.tr.impulse || 0) * 0.3 - A.tr.cp * 0.3 - A.m.reason / 150 + (A.goal && A.goal.id === 'want' ? 0.15 : 0);
      /* 本命・恋愛相手・体の相手を決めている人は踏みとどまりやすい（耐えがたいほどの熱なら妥協する） */
      if (A.honmei != null || A.lock != null || typeof A.sexLock === 'number') want -= desperate(A) && A.m.heat > 85 ? 0.1 : 0.45;
      var force = HK.Content && HK.Content.on(S.env, 'force', 'locker');
      if (want > 0.55 && rng() < 0.7 * HK.Dark.f(S, 'fall')) {
        var top = side === 'top' ? A : m, bot = side === 'top' ? m : A, md = modeOf(top, bot), vv = { a: top.name, b: bot.name };
        t += ST.fmt(pk(R.ASK), v) + ST.fmt(pk(R.MOB_SEX[md]), vv);
        if (S.eroOn) t += HK.ThickEro.fill(S, ST.fmt(pk(R.MOB_ERO[md]), vv), top, bot);
        t += side === 'top' ? moan(S, A, true, md, true) + climaxBy(S, A, m, true) : moan(S, A, false, md, true) + climaxBy(S, A, m, false);
        t += ST.fmt(pk(R.MOB_AFTER), v);
        bumpClimax(A); outcome = 'mob'; tag = '求めた'; kind = 'climax'; mag = 34;
        why = A.name + 'は熱に耐えきれず、自分から' + m.name + 'に頼んだ（合意・' + (side === 'top' ? A.name + 'が攻め' : m.name + 'が攻め') + '）';
      } else if (want <= 0.55 && force && side === 'bottom' && !(Pos && Pos.hardTopNpc(A)) && rng() < 0.45 * HK.Dark.f(S, 'raid')) {
        var mdF = modeOf(m, A), vF = { a: m.name, b: A.name };
        t += ST.fmt(pk(R.FORCE[mdF]), vF) + ST.fmt(pk(R.FREACT[A.persona] || R.FREACT.gentle), { a: A.name, m: m.name });
        if (S.eroOn) t += HK.ThickEro.fill(S, ST.fmt(pk(R.FORCE_ERO[mdF]), vF), m, A);
        t += moan(S, A, false, mdF, false) + climaxBy(S, A, m, false) + ST.fmt(pk(R.FORCE_AFTER), v);
        bumpClimax(A); outcome = 'forced'; tag = '強引に'; kind = 'climax'; mag = 34; tags = ['force'];
        why = m.name + 'が、動けない' + A.name + 'に無理やり手を出した（合意のない展開：内容のスイッチが入）';
      } else t += ST.fmt(pk(CW.ASK_NO), v) + ST.fmt(pk(CW.HELP), v);
    } else if (hot) t += ST.fmt(pk(CW.HELP), v);
    /* 水を差し出していない（熱の引いた人）ときは、水の出てくる結びを使わない */
    if (outcome === 'found') t += ST.fmt(pk(hot ? CW.END1.found : CW.END1.found.filter(function (l) { return !/水/.test(l); })), v);
    /* 見回りの人の台詞・喘ぎは、住人の口調に変えない（「＠」の印） */
    t = t.split(m.name + '「').join(m.name + '「＠');
    var o = { actors: [A], tag: tag, text: t, why: why, mag: mag, kind: kind };
    if (tags) o.tags = tags;
    ST.key(S, ST.say(S, o), '結末');
    return { m: m, outcome: outcome };
  }

  /* ======================= 三人以上のとき ======================= */
  function groupRun(input) {
    var S = setup(input), rng = S.rng, env = S.env, P = S.P, pk = S.pk, R = LK.CROWD_R18, Pos = HK.Pos;
    var keys = ['heat', 'reason', 'plea', 'esc'];
    S.cj = 0; S.cw = 0; S.blessed = {};
    /* ロッカー割り：大きなロッカー（三人ずつ）か、二人ずつ。余りは一人 */
    var lay = env.layout && env.layout !== 'random' ? env.layout : rng() < 0.5 ? 'big' : 'split';
    var pool = P.slice(), lockers = [];
    for (var i = pool.length - 1; i > 0; i--) { var j = rng.int(i + 1), tmp = pool[i]; pool[i] = pool[j]; pool[j] = tmp; }
    while (pool.length) { var k = lay === 'big' ? (pool.length === 4 ? 3 : Math.min(3, pool.length)) : (pool.length === 1 ? 1 : 2); lockers.push({ m: pool.splice(0, k), lv: -1, n: lockers.length + 1 }); }
    lockers.forEach(function (Lk) { Lk.m.forEach(function (p) { p.L = Lk; p.mates = Lk.m.filter(function (q) { return q !== p; }); }); Lk.mid = Lk.m[0]; });
    /* この回だけの「気になる相手」：関係で想う相手のいない人の一部が、恋愛として通る相手を一人気にしている */
    P.forEach(function (p) {
      if (P.some(function (q) { return q !== p && interest(S, p, q); })) return;
      var c = P.filter(function (q) { return q !== p && okLove(p, q) && !noLoveTie(S, p, q); });
      if (c.length && rng() < 0.5) p.secret = rng.pick(c).i;
    });
    /* 拘束 */
    S.bind = env.bind === 'random' ? rng.pick(['both', 'one', 'none', 'both']) : env.bind;
    P.forEach(function (p) { p.bound = S.bind === 'both'; });
    if (S.bind === 'one') lockers.forEach(function (Lk) { if (Lk.m.length < 2) return; var c = Lk.m.filter(function (p) { return !(HK.Pos && HK.Pos.hardTopIn(p, Lk.m)); }); if (c.length) rng.pick(c).bound = true; });
    var gim = gimmickChain(S), gi = 0, escaped = false, escTurn = -1, how = '';
    S.prog = 0;
    var vall = { all: names(P) };
    ST.step(S, '閉じ込められた');
    ST.budget(S, 3 + lockers.length);
    ST.say(S, { actors: P, tag: '目覚め', text: ST.fmt(pk(CW.INTRO_G), vall) + pk(CW.BIND_G[S.bind]), why: P.length + '人・ロッカー ' + lockers.length + '台（' + lockers.map(function (Lk) { return names(Lk.m); }).join('／') + '）・拘束：' + { both: '全員', one: 'ロッカーごとに一人', none: 'なし' }[S.bind] });
    ST.say(S, { kind: 'phase', text: pk(CW.SPEAKER_G) + '（仕掛け：' + gim.map(function (g) { return g.name; }).join('→') + '）' });
    lockers.forEach(function (Lk) {
      var m = Lk.m, t = m.length === 1 ? ST.fmt(pk(CW.LAY.alone), { a: m[0].name }) : m.length === 2 ? ST.fmt(pk(CW.LAY.pair), { a: m[0].name, b: m[1].name }) : ST.fmt(pk(CW.LAY.trio), { a: m[0].name, b: m[1].name, c: m[2].name });
      ST.say(S, { actors: m, tag: 'ロッカー' + Lk.n, text: t, why: m.length === 1 ? '一人きり' : m.length === 2 ? '二人で一つのロッカー' : '三人が一つのロッカーに（真ん中は' + m[0].name + '）' });
    });
    ST.snap(S, keys);

    for (var turn = 0; turn < env.turns && !escaped; turn++) {
      ST.step(S, ((turn + 1) * 5) + '分');
      S.step = turn;
      ST.budget(S, 3 + Math.ceil(lockers.length / 2));
      var logAt = S.log.length;
      S.lewdNow = false;
      /* ハプニング：ガスが濃くなる／一息つく／三人のロッカーで真ん中が入れ替わる */
      if (rng() < env.ev / 100 * 0.5) {
        var trios = lockers.filter(function (Lk) { return Lk.m.length === 3 && !Lk.trioIn; }), r0 = rng();
        if (trios.length && r0 < 0.3) {
          var Lt = rng.pick(trios), nm = rng.pick(Lt.m.filter(function (p) { return p !== Lt.mid; }));
          Lt.mid = nm;
          var ot = Lt.m.filter(function (p) { return p !== nm; });
          ST.sayB(S, { actors: [nm].concat(ot), tag: '押し合い', text: ST.fmt(pk(CW.SHIFT), { a: nm.name, b: ot[0].name, c: ot[1].name }), why: 'ロッカーが揺れて、真ん中に挟まれる人が' + nm.name + 'に替わった' }, nm.name + 'が真ん中に');
        } else {
          var calm = r0 < 0.55;
          P.forEach(function (p) { if (calm) { p.m.reason = clamp(p.m.reason + 12, 0, 100); p.m.heat = clamp(p.m.heat - 6, 0, 100); p.rxCool = true; } else p.m.heat = clamp(p.m.heat + 10, 0, 100); });
          ST.sayB(S, { actors: P, tag: calm ? '一息' : 'ハプニング', text: pk(calm ? CW.CALM_G : CW.SURGE_G), why: calm ? '全員の理性 +12' : '全員の発情 +10' }, calm ? '少しだけ正気に戻った' : 'ガスが濃くなった');
        }
      }
      P.forEach(function (p) { gasStep(S, p, p.mates.length ? rng.pick(p.mates) : null); });
      /* ロッカー越しの出来事（嫉妬系と仲良し系を半々くらいに） */
      if (rng() < 0.42) cross(S, lockers, gim[gi]);
      /* ロッカーごとに */
      var lo = lockers.slice().sort(function () { return rng() - 0.5; });
      lo.forEach(function (Lk) {
        if (Lk.m.length === 1) aloneTurn(S, Lk.m[0]);
        else if (Lk.m.length === 2) pairTurn(S, Lk, turn);
        else trioTurn(S, Lk, turn);
      });
      /* 仕掛け */
      var G = gim[gi];
      if (G && S.prog < 100) {
        var busy = function (p) { return p.L.conn || p.L.trioNow; };
        var workers = P.filter(function (p) { return p.m.reason > 10 && !busy(p) && (G.bind || !p.bound); });
        if (solveStep(S, G, workers, S.lewdNow)) S.prog = 100;
      }
      if (S.prog >= 100) {
        if (G && G.bind) P.forEach(function (p) { p.bound = false; });
        gi++; S.prog = 0;
        if (gi >= gim.length) { escaped = true; escTurn = turn; how = 'solve'; }
      }
      if (!escaped && turn >= 2 && rng() < 0.004 + P.reduce(function (s, p) { return s + (p.stats.luck || 3); }, 0) / P.length * 0.0035) { escaped = true; escTurn = turn; how = 'luck'; }
      P.forEach(function (p) { p.m.esc = Math.round((gi + S.prog / 100) / gim.length * 100); p.m.plea = clamp(p.m.plea, 0, 100); });
      ST.flushShort(S, 'ほかに：');
      if (S.log.length === logAt) ST.say(S, { kind: 'phase', actors: P.map(function (p) { return p.i; }), text: pk(CW.QUIET_G) });
      ST.snap(S, keys);
    }
    if (!escaped) { how = 'timeout'; escTurn = env.turns; }

    /* ---------- 結末 ---------- */
    ST.step(S, how === 'timeout' ? '時間切れ' : '脱出');
    ST.budget(S, 6);
    var mins = (escTurn + 1) * 5;
    ST.key(S, ST.say(S, { actors: P, tag: { solve: '全員で脱出', luck: '幸運', timeout: '時間切れ' }[how], text: ST.fmt(pk(CW.END_G[how === 'solve' ? 'open' : how]), vall), why: '仕掛け ' + gi + '／' + gim.length + '・嫉妬系 ' + S.cj + '・仲良し系 ' + S.cw, mag: 26 }), '結末');
    /* ロッカーごとの「その後」 */
    lockers.forEach(function (Lk) {
      if (Lk.m.length < 2 || Lk.lv < 0) return;
      if (Lk.m.length === 3 && Lk.trioIn) {
        var tq = Lk.trioNames;
        /* 恋人どうしがそろった三人は、恋人たちの組として記録する（poly.js） */
        if (HK.Poly) HK.Poly.storyReg(S, Lk.m);
        ST.say(S, { actors: Lk.m, tag: '三人の秘密', text: ST.fmt(pk(R && S.R18 && Lk.trioSex ? R.AFTER3_END : CW.T3_END), { a: tq[0], b: tq[1], c: tq[2] }), why: '三人の場面：同じロッカーの三人は、ロッカーの中のことを三人だけの秘密にした（仲良し）' });
        return;
      }
      var x = Lk.top || Lk.m[0], y = Lk.bot || Lk.m[1], AF = LK.AFTER, ak = Lk.sexIn && AF.awkwardSex ? 'awkwardSex' : Lk.refusedHard ? 'angry' : 'awkward';
      var aft = AF[ak].filter(function (l) { return !/嗜め/.test(l) || x.cnt.refuse + y.cnt.refuse > 0; });
      ST.say(S, { actors: [x, y], tag: { awkwardSex: '気まずい朝', angry: '怒り', awkward: '気まずい脱出' }[ak], text: ST.fmt(pk(aft.length ? aft : AF.awkward), { a: x.name, b: y.name }), why: 'ロッカー' + Lk.n + 'の二人：いちばん進んだのは「' + actLabel(Lk, Lk.lv) + '」' });
    });
    /* 胸を痛めた人・祝った人 */
    /* 結びの一つ：失恋した人がいればその後を。嫉妬が残った人は、すれ違いの方が少なかった回だけ。ほかは仲間たちの帰り道 */
    var lostP = P.filter(function (p) { return p.lostTo; })[0], jealP = P.filter(function (p) { return p.cnt.jeal >= 1 && p.jealOf != null; })[0];
    if (lostP) { var lb = P[lostP.lostTo[0]], lc = P[lostP.lostTo[1]]; ST.say(S, { actors: [lostP, lb, lc], tag: '失恋のあと', text: ST.fmt(pk(CW.MOOD.lost), { a: lostP.name, b: lb.name, c: lc.name }), why: '三人の場面：' + lostP.name + 'は、' + lb.name + 'と' + lc.name + 'のことを受け止めた（失恋）' }); }
    else if (jealP && S.cj < S.cw) {
      var jb = P[jealP.jealOf], jc = jb.mates.filter(function (q) { return q !== jealP; })[0];
      ST.say(S, { actors: jc ? [jealP, jb, jc] : [jealP, jb], tag: '嫉妬のあと', text: ST.fmt(pk(CW.MOOD.jeal), { a: jealP.name, b: jb.name }), why: (jc ? '三人の場面：' + jb.name + 'が' + jc.name + 'と同じロッカーだったことへの、' : '') + jealP.name + 'の嫉妬は、ガスが抜けても残った' });
    } else ST.say(S, { actors: P, tag: '帰り道', text: ST.fmt(pk(CW.MOOD.warm), vall), why: 'みんなで帰った（ロッカー越しに励まし合った回数 ' + S.cw + '）' });
    /* 一人ずつ */
    P.forEach(function (p) {
      var Lk = p.L, f;
      if (Lk.m.length === 1) f = p.cnt.self ? '一人のロッカーで、一人で慰めた' : '一人のロッカーで耐えきった';
      else if (Lk.trioIn) f = Lk.trioSex ? '三人で熱を分け合った' : '三人で寄り添った';
      else if (Lk.sexIn) f = (Lk.top === p ? 'ロッカーの中で相手を抱いた' : 'ロッカーの中で相手に身を委ねた');
      else if (p.cnt.accept >= 1) f = '流された';
      else if (p.cnt.make >= 1 && p.cnt.refuse === 0) f = '先に手を伸ばした';
      else if (p.cnt.refuse >= 1) f = '最後まで嗜めた';
      else if (p.cnt.hold) f = '触れずに耐え抜いた';
      else f = p.m.reason > 30 ? '理性を保ちきった' : 'ぎりぎりで踏みとどまった';
      if (p.lostTo) f += '・失恋した';
      else if (p.cnt.jeal) f += '・嫉妬した';
      if (p.cnt.warm >= 2) f += '・みんなを励ました';
      p.fate = f;
      p.roleLabel = 'ロッカー' + Lk.n + (Lk.m.length === 1 ? '（一人）' : '（' + names(Lk.m) + '）');
      p.notes.push('発情 ' + Math.round(p.m.heat) + '・理性 ' + Math.round(p.m.reason) + '・' + W_CL + ' ' + p.cnt.climax + '回');
      p.notes.push('仕掛けた ' + p.cnt.make + '回・応じた ' + p.cnt.accept + '回・嗜めた ' + p.cnt.refuse + '回' + (p.cnt.hold ? '・耐えた ' + p.cnt.hold + '回' : '') + (p.cnt.solve ? '・仕掛けを解いた ' + p.cnt.solve + '回' : '') + (p.cnt.jeal ? '・嫉妬 ' + p.cnt.jeal + '回' : ''));
    });
    var far = lockers.filter(function (Lk) { return Lk.sexIn || Lk.trioSex; });
    var title = (how === 'timeout' ? '制限時間内に脱出できず、ロッカーは時間切れで開いた。' : mins + '分で、' + P.length + '人とも外へ出た。') + (far.length ? far.map(function (Lk) { return names(Lk.trioSex ? Lk.m : [Lk.top, Lk.bot]); }).join('と、') + 'は、ロッカーの中で' + (far.some(function (Lk) { return Lk.trioSex; }) ? '熱を分け合った。' : '一線を越えた。') : lockers.some(function (Lk) { return Lk.lv >= 0; }) ? 'ロッカーの中のことは、みんなガスのせいにした。' : '誰も、一線は越えなかった。');
    var lines = P.map(function (p) { return p.name + '：' + p.fate; });
    lines.push('ロッカー：' + lockers.map(function (Lk) { return names(Lk.m) + (Lk.lv >= 0 ? '（' + actLabel(Lk, Lk.lv) + '）' : ''); }).join('／'));
    lines.push('仕掛け：' + gim.map(function (g, i) { return g.name + (i < gi ? '（解除）' : ''); }).join('→') + (how === 'luck' ? '（外から開いた）' : ''));
    lines.push('ロッカー越しの出来事：すれ違い ' + S.cj + '回・励まし合い ' + S.cw + '回');
    var rows = P.map(function (p) { return { i: p.i, rank: '', cells: ['ロッカー' + p.L.n, Math.round(p.m.heat) + '', Math.round(p.m.reason) + '', String(p.cnt.make), String(p.cnt.refuse), String(p.cnt.climax), String(p.cnt.solve), p.fate] }; });
    return ST.result(S, input, {
      ending: { title: title, kind: far.length ? 'over' : 'ok', lines: lines },
      estats: [['脱出まで', how === 'timeout' ? '時間切れ' : mins + '分'], ['人数', P.length + '人'], ['ロッカー', lockers.length + '台'], [W_CL, P.reduce(function (s, p) { return s + p.cnt.climax; }, 0) + '回']],
      table: { title: 'みんなの状態', hint: '同じロッカーの人とくっつく。発情が高く理性が低いほど手を出しやすい。', cols: ['場所', '発情', '理性', '仕掛けた', '嗜めた', W_CL, '解いた', '結末'], rows: rows },
      meters: [{ label: '発情', color: '--love' }, { label: '理性', color: '--accent' }, { label: '快感', color: '--pine', dash: true }, { label: '脱出', color: '--partner', dash: true }],
      meta: P.length + '人・ロッカー' + lockers.length + '台・拘束' + { both: 'あり', one: '一人ずつ', none: 'なし' }[S.bind] + '・媚薬' + env.dose,
      summary: '媚薬ロッカー：' + title
    });
  }
  CW.T3_END = L('ロッカーを出た三人は、顔を見合わせて小さく笑った。「……今のは、三人だけの秘密ね」|三人は並んで倉庫を出た。誰からともなく、手を繋いでいた。|{a}が「また三人で」と言いかけて、慌てて口をつぐんだ。{b}と{c}は、聞こえないふりをして笑った。');
  function actLabel(Lk, lv) { var k = ['touch', 'kiss', 'grope', 'oral', 'sex'][lv]; if (Lk.trioIn) return lv >= 2 ? '三人で' : lv === 1 ? 'キス' : '寄り添う'; var ff = Lk.ff; return ff && LK.FF_ACT && LK.FF_ACT[k] && LK.FF_ACT[k].label || (LK.ACT[k] || {}).label || ''; }

  /* ---------- 一人のロッカー（三人以上のときの余り） ---------- */
  function aloneTurn(S, p) {
    var rng = S.rng, R = LK.CROWD_R18, pk = S.pk, v = { a: p.name };
    if (p.rest > 0) { p.rest--; return; }
    var urge = p.m.heat / 100 + p.tr.impulse * 0.3 + p.tr.fc * 0.15 - p.m.reason / 130 - p.tr.cp * 0.12;
    if (R && S.R18 && HK.State.r18ok(p) && !p.bound && p.m.heat >= 60 && urge > 0.4 + rng() * 0.3) {
      var body = HK.Pos && HK.Pos.genSet && HK.Pos.genSet(p) ? (HK.Pos.hasM(p) ? 'm' : HK.Pos.hasF(p) ? 'f' : 'x') : HK.Pos && !HK.Pos.isF(p) && (p.gender === 'm' || (HK.Pos.futa && HK.Pos.futa(p))) ? 'm' : p.gender === 'f' ? 'f' : 'x';
      var t = ST.fmt(pk(R.SELF[body][1]), v) + ST.fmt(pk(R.SELF[body][2]), v);
      if (S.eroOn) t += HK.Ero.fill(S, ST.fmt(pk(R.SELF_ERO[body]), v), p);
      t += moan(S, p, false) + ST.fmt(pk(R.SELF_CL[p.persona] || R.SELF_CL.gentle), v);
      p.cnt.self++; bumpClimax(p); p.m.heat = clamp(p.m.heat - 14, 0, 100); p.rest = 2; S.lewdNow = true;
      ST.sayB(S, { actors: [p], tag: '一人で果てる', text: t, why: p.name + 'は一人きりのロッカーで、隣に聞こえないよう声を殺して果てた（発情 ' + Math.round(p.m.heat) + '）', mag: 26, kind: 'climax' }, p.name + 'は一人で', p.cnt.self === 1);
    } else if (p.m.heat >= 40 && urge > 0.25 + rng() * 0.3 && p.cnt.hold < 3) {
      p.cnt.hold++; p.m.reason = clamp(p.m.reason + 4, 0, 100);
      ST.sayB(S, { actors: [p], tag: '一人で耐える', text: ST.fmt(pk(p.bound ? CW.ENDURE1_BOUND : CW.ENDURE1[p.persona] || CW.ENDURE1.gentle), v), why: p.name + 'は一人きりのロッカーで熱をやり過ごした（理性 +4）', mag: 12 }, p.name + 'は耐えた');
    }
  }

  /* ---------- 二人のロッカー（二人のときの文を使う） ---------- */
  function hands(arr, a, b) {
    var r = arr.filter(function (l) { return !(a.bound && /\{a\}の(手|指)/.test(l)) && !(b.bound && (/\{b\}の(手|指)/.test(l) || /\{b\}は[^。「]*(手で|手を|指で|手首を|両手)/.test(l))); });
    return r.length ? r : arr;
  }
  function hb(arr, tp, bt) { return arr.filter(function (l) { return !(/^H:/.test(l) && tp.bound) && !(/^B:/.test(l) && bt.bound); }).map(function (l) { return l.replace(/^[HB]:/, ''); }); }
  function contPool(k, tp, bt) { var C = LK.CONT, m = modeOf(tp, bt); return hb((C[m][k] || []).concat(C.any[k] || []), tp, bt); }
  function say2(S, p, T) { var l = T[p.persona] || T.gentle; return p.name + S.pk(l); }
  function holdPair(S, a, b, reason) {
    a.cnt.hold++; a.m.reason = clamp(a.m.reason + 3, 0, 100); a.m.plea = clamp(a.m.plea + 8, 0, 90);
    if (a.cnt.hold > 3 && S.rng() < 0.5) return;
    var t = a.tr, sc = { solve: t.cp * 0.6 + t.a * 0.3, care: t.np * 0.85, shy: t.ac * 0.85, joke: t.fc * 0.8, endure: 0.5 };
    var ty = Object.keys(sc).reduce(function (x, k) { return sc[k] > sc[x] ? k : x; }, 'endure'), C = LK.CLASH;
    ST.sayB(S, { actors: [a, b], tag: C.tag[ty], text: ST.fmt(S.pk(C.hold[ty]), { a: a.name, b: b.name }) + (S.rng() < 0.5 ? ST.fmt(S.pk(C.reply), { a: a.name, b: b.name }) : ''), why: a.name + 'は発情していた（' + Math.round(a.m.heat) + '）が、' + reason + 'ので、手は出さなかった', mag: 16 }, a.name + 'は手を出さずに耐えた', a.cnt.hold === 1);
  }
  function whyNot(S, a, b) {
    var n = b.name;
    if (!HK.SAFE_ON && (a.noR18 || b.noR18)) return (a.noR18 ? a : b).name + 'はR18に参加しない';
    if (HK.ngPair && HK.ngPair(a, b)) return n + 'とは恋愛・R18にしない組な';
    if (HK.sexBlocked && HK.sexBlocked(a, b)) return n + 'とは体の関係にならない組な';
    if (noLoveTie(S, a, b)) return n + 'とは恋愛にしない関係な';
    if (HK.Pos && !HK.Pos.okSex(a, b)) return n + 'とは受け攻めの向きか恋愛対象が合わない';
    return n + 'とは恋愛にならない組な';
  }
  function relW(S, a, b, side) {
    var tl = tiesOf(S, a, b), w = 0;
    tl.forEach(function (t) {
      var ty = t.type, mine = t.a === a.i;
      var v = side === 'urge' ? { lover: 0.15, mate: 0.15, fated: 0.15, fwb: 0.2, almost: 0.1, crush: mine ? 0.2 : 0, rival: -0.1, bad: -0.1, enemy: -0.1 }[ty] : { lover: 0.5, mate: 0.5, fated: 0.5, fwb: 0.45, almost: 0.3, crush: mine ? 0.45 : -0.05, rival: -0.3, bad: -0.3, enemy: -0.3, ex: 0.05 }[ty];
      if (v != null && Math.abs(v) > Math.abs(w)) w = v;
    });
    if (!tl.length) w = side === 'urge' ? 0 : -0.1;
    if (a.secret === b.i) w += side === 'urge' ? 0.15 : 0.3;
    if (a.honmei === b.i) w += 0.15;
    return w;
  }
  function pairTurn(S, Lk, turn) {
    var rng = S.rng, pk = S.pk, x = Lk.m[0], y = Lk.m[1], V = HK.Voice, Pos = HK.Pos;
    Lk.ff = !!(Pos && Pos.ff(x, y));
    if (Lk.conn) { contTurn(S, Lk); S.lewdNow = true; return; }
    if (Lk.rest > 0) { Lk.rest--; return; }
    var order = rng() < 0.5 ? [x, y] : [y, x];
    for (var k = 0; k < order.length; k++) {
      var a = order[k], b = a === x ? y : x;
      var urge = (a.goal && a.goal.id === 'want' ? 0.12 : a.goal && a.goal.id === 'out' ? -0.08 : 0) + (a.action && a.action.id === 'flow' ? 0.08 : a.action && a.action.id === 'solve' ? -0.06 : 0) + a.m.heat / 100 + a.tr.impulse * 0.35 + a.tr.fc * 0.15 - a.m.reason / 130 - a.tr.cp * 0.12 + relW(S, a, b, 'urge');
      /* 本命がほかにいる人は、一途に踏みとどまる（媚薬の熱が限界なら妥協する） */
      if (a.honmei != null && a.honmei !== b.i) urge -= desperate(a) ? 0.05 : 0.3;
      if (loyal(S, a, b)) urge -= desperate(a) ? 0.05 : 0.25;
      if (urge < 0.36 + rng() * 0.3) continue;
      if (!canAct(S, a, b)) { holdPair(S, a, b, whyNot(S, a, b)); return; }
      /* 体だけの関係の組：固定した恋人が同じロッカーにいれば手を出しにくい（×0.3） */
      var fr = freeOk(S, a, b);
      if (fr && Lk.m.some(function (q) { return q !== a && q !== b && (q.i === a.lock || q.i === b.lock); }) && rng() > 0.3) continue;
      var lvMax = Math.min(LK.MAXLV || 4, 4);
      if (a.bound && b.bound) lvMax = Math.min(lvMax, 1);
      var lv = Math.min(Lk.lv + (relW(S, a, b, 'acc') >= 0.45 && Lk.lv >= 0 && rng() < 0.5 ? 2 : 1), lvMax);
      /* 攻めが手錠のままなら、キスまで */
      var ord = Pos ? Pos.order(a, b, lv === 4 ? Pos.fbFor(a, b) : [a, b]) : [a, b], tp = ord[0], bt = ord[1];
      if (tp.bound && lv >= 2) lv = Math.min(lv, 1);
      if (lv <= Lk.lv) {
        if (a.bound && b.bound && Lk.lv >= 1 && (Lk.nama || 0) < 2 && rng() < 0.5) {
          Lk.nama = (Lk.nama || 0) + 1; S.lewdNow = true;
          var ed = LK.TOPV && LK.TOPV.edge && (LK.TOPV.edge[tp.persona] || LK.TOPV.edge.gentle);
          ST.sayB(S, { actors: [tp, bt], tag: '生殺し', text: ST.fmt(pk(LK.NAMA), { a: tp.name, b: bt.name }) + (ed && S.R18 ? tp.name + '「' + pk(ed) + '」' : ''), why: '二人とも手錠のまま発情（' + Math.round(a.m.heat) + '・' + Math.round(b.m.heat) + '）', mag: 22 }, '二人は生殺し');
        }
        return;
      }
      a.cnt.make++;
      var w = b.m.heat / 100 + relW(S, b, a, 'acc') + b.tr.np * 0.15 + b.tr.ac * 0.1 - b.tr.cp * 0.25 - b.m.reason / 160 + (rng() - 0.5) * 0.3;
      if (b.honmei != null && b.honmei !== a.i) w -= desperate(b) ? 0.05 : 0.35;
      if (loyal(S, b, a)) w -= desperate(b) ? 0.05 : 0.3;
      var resp = w > 0.55 ? 'accept' : w > 0.32 ? 'passive' : 'refuse';
      var key = ['touch', 'kiss', 'grope', 'oral', 'sex'][lv], act = LK.ACT[key], md = modeOf(tp, bt), ff = md === 'ff';
      var FFA = ff && LK.FF_ACT && LK.FF_ACT[key], FMA = !FFA && key === 'sex' && md === 'fm' && LK.FM_ACT && LK.FM_ACT.sex;
      /* 低い段階は仕掛けた人がそのまま動く。愛撫から先は攻めが動く（受けから誘ったときは、誘う→攻めが応じる） */
      var lead = lv <= 1 ? a : tp, other = lead === a ? b : a, swap = lead !== a;
      var actPool = FFA ? (lead.bound ? FFA.bound : FFA.t) : FMA ? (lead.bound ? FMA.bound : FMA.t) : key === 'sex' ? (lead.bound ? act.boundTop : act.t) : (lead.bound ? act.bound : act.t);
      if (!actPool || !actPool.length) actPool = act.t;
      var vA = { a: lead.name, b: other.name }, vT = { a: a.name, b: b.name };
      var t = swap ? ST.fmt(pk(LK.TEMPT), vT) : ST.fmt(pk(hands(actPool, lead, other)), vA);
      if (resp === 'refuse') {
        b.cnt.refuse++; a.m.reason = clamp(a.m.reason + 6, 0, 100);
        var lateR = b.rxLv >= 1 && !b.rxCool && LK.REFUSE_LATE;
        t += ST.fmt(pk(hands(lateR ? LK.REFUSE_LATE : LK.REFUSE, a, b)), vT) + (rng() < 0.7 ? say2(S, b, lateR && LK.REFUSE_SAY_LATE ? LK.REFUSE_SAY_LATE : LK.REFUSE_SAY) : '');
        if (b.cnt.refuse >= 2 && lv >= 2) Lk.refusedHard = true;
        ST.sayB(S, { actors: [a, b], tag: '嗜めた', text: t, why: a.name + 'が「' + actLabel(Lk, lv) + '」を仕掛けた（発情 ' + Math.round(a.m.heat) + '）／' + b.name + 'は嗜めた（理性 ' + Math.round(b.m.reason) + '・CP）', mag: 18 }, b.name + 'が嗜めた');
        return;
      }
      b.cnt.accept++; Lk.lv = lv; Lk.lastAct = turn; S.lewdNow = true; b.rxLv = Math.max(b.rxCool ? 0 : b.rxLv || 0, resp === 'accept' ? 2 : 1); b.rxCool = false;
      var eroNow = resp === 'accept';
      if (swap) t += ST.fmt(pk(LK.TAKE[tp.bound ? 'bound' : 'free']), vT) + ST.fmt(pk(hands(actPool, tp, bt)), { a: tp.name, b: bt.name });
      else t += ST.fmt(pk(hands((resp === 'accept' ? LK.ACCEPT : LK.PASSIVE).filter(function (l) { return (lead === tp && md === 'ins') || !/受け入れ/.test(l); }), a, b)), vT) + (resp === 'accept' && rng() < 0.6 ? say2(S, b, LK.ACCEPT_SAY) : '');
      var gain = [15, 20, 30, 40, 50][lv];
      tp.m.plea += gain * tp.sens * 0.8; bt.m.plea += gain * bt.sens;
      a.m.heat = clamp(a.m.heat + 4, 0, 100); b.m.heat = clamp(b.m.heat + 8, 0, 100);
      if (lv === 4) { Lk.sexIn = true; Lk.conn = true; Lk.top = tp; Lk.bot = bt; Lk.done = false; Lk.hushed = false; Lk.lowT = 0; t += ST.fmt(pk(ff && LK.FF_ACT ? LK.FF_ACT.tease : md === 'fm' && LK.FM_ACT ? LK.FM_ACT.tease : LK.TEASE), { a: tp.name, b: bt.name }); }
      else { Lk.top = tp; Lk.bot = bt; }
      if (S.lew === 'low' && lv >= 3) t = ST.fmt(pk(actPool), { a: tp.name, b: bt.name }).replace(/。.*$/, '。') + pk(LK.FADE || ['――その先は、ロッカーの扉の隙間からも見えなかった。']);
      else if (S.eroOn && eroNow && lv >= 3 && LK.ERO_ACT && LK.ERO_ACT[lv]) {
        var eg = lv === 3 ? lead : tp, er = lv === 3 ? other : bt;
        var eroL = ff && LK.ERO_ACT_FF && LK.ERO_ACT_FF[lv] ? LK.ERO_ACT_FF[lv] : lv === 4 && modeOf(eg, er) === 'fm' && LK.ERO_ACT_FM ? LK.ERO_ACT_FM[4] : lv === 3 && !ff && !isF(er) && LK.ERO_ACT_MB ? LK.ERO_ACT_MB[3] : LK.ERO_ACT[lv];
        if (lv === 3 && ff && !(LK.ERO_ACT_FF && LK.ERO_ACT_FF[3])) eroL = null;
        if (eroL) t += HK.ThickEro.fill(S, pk(eroL), eg, er).replace(/\{a\}/g, eg.name).replace(/\{b\}/g, er.name);
      }
      if (lv === 4) { tp.m.plea = Math.min(tp.m.plea, 55); bt.m.plea = Math.min(bt.m.plea, 60); }
      if (bt.m.plea >= 100 && lv < 4) { if (HK.Pos && HK.Pos.hardTop(bt, tp)) bt.m.plea = 95; else { t += moan(S, bt, false, md, eroNow) + climaxBy(S, bt, tp, false); bumpClimax(bt); } }
      /* 体だけの関係：最初に手を出したときに「恋ではない」一文（free-sex.js） */
      /* 札も恋愛の札（キス・口づけ）にしない（恋愛の出来事として数えない） */
      var ld = fr && !Lk.freeLed ? HK.FreeSex.lead(S, a, b) : '';
      var said = ST.sayB(S, { actors: [a, b], tag: fr ? '体だけ・' + actLabel(Lk, lv).replace(/キス|口づけ/g, '唇') : actLabel(Lk, lv), text: ld + t, why: (fr ? HK.FreeSex.why(a, b) + '／' : '') + a.name + 'が「' + actLabel(Lk, lv) + '」を仕掛けた（発情 ' + Math.round(a.m.heat) + '）／' + b.name + 'は' + (swap ? '誘いに乗って、自分から動いた' : resp === 'accept' ? '乗った' : '流された') + '（ロッカー' + Lk.n + '・' + b.name + 'の発情 ' + Math.round(b.m.heat) + '）', mag: 18 + lv * 5, kind: 'climax' }, a.name + '→' + b.name + '：' + actLabel(Lk, lv), lv >= 3);
      if (ld && said) Lk.freeLed = true;
      if (lv === 4 && !Lk.keySex) { Lk.keySex = true; var o2 = S.log[S.log.length - 1]; if (o2) ST.key(S, o2, 'ロッカー' + Lk.n + 'で' + (ff ? '肌を重ねた' : '繋がった')); }
      if (fr && lv === 4 && !Lk.freeMark) { Lk.freeMark = true; HK.FreeSex.mark(S, a, b); HK.FreeSex.jealous(S, a, b); }
      return;
    }
  }
  function contTurn(S, Lk) {
    var rng = S.rng, pk = S.pk, tp = Lk.top, bt = Lk.bot, C = LK.CONT, V = HK.Voice, ph, vv = { a: tp.name, b: bt.name }, md = modeOf(tp, bt);
    if (Lk.done) ph = 'after';
    else {
      bt.m.plea += (14 + rng() * 12) * bt.sens; tp.m.plea += (10 + rng() * 10) * tp.sens;
      Lk.m.forEach(function (p) { p.m.heat = clamp(p.m.heat + 3, 0, 100); });
      ph = bt.m.plea >= 100 || tp.m.plea >= 100 ? 'climax' : !Lk.hushed && rng() < 0.3 ? 'hush' : bt.m.plea >= 70 ? 'edge' : 'move';
      if (S.lew === 'low') { ph = Lk.lowT ? 'climax' : 'move'; Lk.lowT = 1; }
    }
    var t = S.lew === 'low' ? pk(C.low) : ST.fmt(pk(contPool(ph, tp, bt)), vv);
    if (ph === 'hush') { Lk.hushed = true; var hl = S.lew !== 'low' && rng() < 0.65 && LK.TOPV && LK.TOPV.hush && (LK.TOPV.hush[tp.persona] || LK.TOPV.hush.gentle); if (hl) t += tp.name + '「' + pk(hl) + '」'; }
    else if (ph === 'edge' && S.lew !== 'low' && V && V.EDGE && V.EDGE[bt.persona] && rng() < 0.6) t += bt.name + '「' + pk(V.EDGE[bt.persona]) + '」';
    else if (ph === 'climax') {
      /* 果てる声は果てる文の前に。受け→攻めの順に、態度ごとの果てる文で書く（R18版。ないときは二人の果てる文のまま） */
      var cb = climaxBy(S, bt, tp, false), ct = climaxBy(S, tp, bt, true);
      if (cb && ct) t = moan(S, bt, false, md, true) + cb + moan(S, tp, true, md, true) + ct;
      bumpClimax(bt); bumpClimax(tp); Lk.done = true;
    } else if (ph === 'after') { Lk.conn = false; Lk.done = false; Lk.rest = 1 + rng.int(2); Lk.m.forEach(function (p) { p.m.reason = clamp(p.m.reason + 8, 0, 100); p.rxCool = true; }); }
    var tag = md === 'ff' && ph === 'move' ? '肌を重ねたまま' : C.tag[ph];
    ST.sayB(S, { actors: [tp, bt], tag: tag, text: t, why: { move: '繋がったまま、狭い箱の中で', hush: '外の物音に、二人とも動きを止めた', edge: bt.name + 'が限界に近い', climax: 'ロッカーの中で、二人とも果てた', after: '一度果てて、少しだけ正気が戻った（理性 +8）' }[ph] + '（ロッカー' + Lk.n + '・快感 ' + tp.name + ' ' + Math.round(Math.min(100, tp.m.plea)) + '・' + bt.name + ' ' + Math.round(Math.min(100, bt.m.plea)) + '）', mag: ph === 'climax' ? 34 : 18, kind: 'climax' }, tp.name + 'と' + bt.name + '：' + tag, ph === 'climax');
  }

  /* ---------- 三人のロッカー ---------- */
  function trioPairs(m) { return [[m[0], m[1]], [m[0], m[2]], [m[1], m[2]]]; }
  /* 三人とも互いに体の関係になれる・想い合える組で、本命がいる人はその本命もこの三人の中にいて、熱が限界のときだけ */
  function trioOk(S, m) {
    if (!trioPairs(m).every(function (pr) { return canAct(S, pr[0], pr[1]); })) return false;
    /* 恋人がこの三人の外にいる人は、三人の場面に加わらない */
    if (m.some(function (p) { return S.P.some(function (q) { return m.indexOf(q) < 0 && has(S, p, q, /^(lover|mate|fated)$/) && okLove(p, q); }); })) return false;
    return m.every(function (p) { return p.honmei == null || (m.some(function (q) { return q.i === p.honmei; }) && desperate(p)); });
  }
  /* 三人の上下：攻めが二人を抱く（oneTwo）／二人の攻めが一人を（twoOne）／真ん中が前を抱き、後ろから抱かれる（sandwich） */
  function trioShape(S, m) {
    var Pos = HK.Pos, es = trioPairs(m).map(function (pr) { return Pos ? Pos.order(pr[0], pr[1], pr) : pr; });
    var tops = function (c) { return es.filter(function (e) { return e[0] === c; }).length; };
    var T2 = m.filter(function (c) { return tops(c) === 2; })[0], B0 = m.filter(function (c) { return tops(c) === 0; })[0];
    if (T2 && B0) {
      var M = m.filter(function (c) { return c !== T2 && c !== B0; })[0], ks = ['oneTwo', 'twoOne', 'sandwich'];
      /* 真ん中の人が自分で攻めを選んでいれば、受けに回る形（oneTwo・sandwich）にしない */
      if (HK.Pos && HK.Pos.hardTop(M, T2)) ks = ['twoOne'];
      /* 前を抱きながら後ろから抱かれる形（sandwich）は、後ろの人が跨る組（女性の攻め×男性）では起こらない */
      if (modeOf(T2, M) === 'fm') ks = ks.filter(function (x) { return x !== 'sandwich'; });
      if (!ks.length) ks = ['oneTwo'];
      var p = S.rng.pick(ks);
      return p === 'oneTwo' ? { p: p, t: T2, m: M, u: B0 } : p === 'twoOne' ? { p: p, t: T2, m: M, u: B0 } : { p: p, t: T2, m: M, u: B0 };
    }
    return null;
  }
  function trioTurn(S, Lk, turn) {
    var rng = S.rng, pk = S.pk, m = Lk.m, R = LK.CROWD_R18;
    Lk.trioNow = false;
    if (Lk.rest > 0) { Lk.rest--; return; }
    var heat = m.reduce(function (s, p) { return s + p.m.heat; }, 0) / 3, reason = m.reduce(function (s, p) { return s + p.m.reason; }, 0) / 3;
    var lead = m.slice().sort(function (p, q) { return (q.m.heat / 100 + q.tr.impulse * 0.3 + q.tr.fc * 0.15 - q.m.reason / 130) - (p.m.heat / 100 + p.tr.impulse * 0.3 + p.tr.fc * 0.15 - p.m.reason / 130); })[0];
    var urge = lead.m.heat / 100 + lead.tr.impulse * 0.35 + lead.tr.fc * 0.15 - lead.m.reason / 130 - lead.tr.cp * 0.12;
    if (urge < 0.36 + rng() * 0.3) return;
    var others = m.filter(function (p) { return p !== lead; });
    if (trioOk(S, m)) {
      var willing = others.every(function (p) { return p.m.heat / 100 + p.tr.np * 0.15 + p.tr.fc * 0.15 - p.m.reason / 160 + relW(S, p, lead, 'acc') * 0.5 > 0.3; });
      if (!willing) { holdPair(S, lead, others[0], '同じロッカーの' + names(others) + 'の気持ちが、まだ追いついていなかった'); return; }
      var lvMax = Math.min(LK.MAXLV || 4, 4), nx = Math.min(Lk.lv + 1, lvMax >= 2 ? 2 : lvMax);
      if (Lk.trioSex) {
        /* 三人の場面のあと：名残だけ */
        if (Lk.lingered) return;
        Lk.lingered = true;
        var sp0 = Lk.trioShape;
        if (R && S.R18) ST.sayB(S, { actors: m, tag: '三人の名残', text: ST.fmt(pk(R.AFTER3), { t: sp0.t.name, m: sp0.m.name, u: sp0.u.name }), why: '三人の場面：媚薬はまだ効いていたが、三人とも体が先に限界だった（仲良し）' }, '三人は寄り添っていた');
        return;
      }
      if (nx <= Lk.lv && !(nx >= 2 && S.R18 && R)) return;
      Lk.trioIn = true; Lk.lv = Math.max(Lk.lv, nx); Lk.trioNames = [lead.name, others[0].name, others[1].name]; S.lewdNow = true;
      m.forEach(function (p) { p.cnt.accept++; }); lead.cnt.make++;
      if (nx < 2 || !(R && S.R18)) {
        var k = nx >= 1 ? 'kiss' : 'touch';
        ST.sayB(S, { actors: [lead].concat(others), tag: nx >= 1 ? '三人でキス' : '三人で寄り添う', text: ST.fmt(pk(CW.T3[k]), { a: lead.name, b: others[0].name, c: others[1].name }), why: '三人の場面：三人とも互いに想い合える組で、熱に浮かされて寄り添った（' + lead.name + 'から・仲良し）', mag: 20 }, '三人が' + (nx >= 1 ? '唇を重ねた' : '寄り添った'), Lk.lv === 0);
        S.cw++; lead.cnt.warm++;
        return;
      }
      var sp = trioShape(S, m);
      if (!sp) return;
      Lk.trioSex = true; Lk.trioShape = sp; Lk.lv = 4; Lk.trioNow = true;
      ST.key(S, ST.say(S, { actors: [sp.t, sp.m, sp.u], tag: '三人で', text: trioScene(S, sp), why: '三人の場面：同じロッカーの三人とも、互いに体の関係になれる組だった（受け攻め：' + { oneTwo: sp.t.name + 'が二人を', twoOne: sp.t.name + 'と' + sp.m.name + 'が' + sp.u.name + 'を', sandwich: sp.t.name + '→' + sp.m.name + '→' + sp.u.name }[sp.p] + '・仲良し）', mag: 36, kind: 'climax' }), 'ロッカー' + Lk.n + 'の三人');
      S.cw++;
      Lk.rest = 1;
      return;
    }
    /* 三人のうち二人だけが手を出し合える：キスまで。三人目の反応（嫉妬か、見守るか） */
    var pairs = trioPairs(m).filter(function (pr) { return canAct(S, pr[0], pr[1]); }).filter(function (pr) { return pr.indexOf(lead) >= 0; });
    if (!pairs.length) { var o = rng.pick(others); holdPair(S, lead, o, whyNot(S, lead, o)); return; }
    var pr = rng.pick(pairs), b = pr[0] === lead ? pr[1] : pr[0], c = m.filter(function (p) { return p !== lead && p !== b; })[0];
    /* 三人目がR18に参加しない・恋愛・R18にしない相手がいる狭い箱では、寄り添うだけ */
    var w = b.m.heat / 100 + relW(S, b, lead, 'acc') + b.tr.np * 0.15 - b.tr.cp * 0.25 - b.m.reason / 160 + (rng() - 0.5) * 0.3;
    if (b.honmei != null && b.honmei !== lead.i) w -= desperate(b) ? 0.05 : 0.35;
    if (lead.honmei != null && lead.honmei !== b.i && !desperate(lead)) return;
    if ((loyal(S, lead, b) || loyal(S, b, lead)) && S.rng() < 0.75) return;
    /* 三人目がいる箱で、二人だけの触れ合いを何度も繰り返さない */
    if (Lk.lv >= 1 && ((Lk.pairN || 0) >= 2 || rng() < 0.5)) return;
    lead.cnt.make++;
    if (w < 0.32) {
      b.cnt.refuse++;
      ST.sayB(S, { actors: [lead, b], tag: '嗜めた', text: ST.fmt(pk(LK.ACT.touch.t), { a: lead.name, b: b.name }) + ST.fmt(pk(LK.REFUSE), { a: lead.name, b: b.name }), why: lead.name + 'が手を伸ばした（発情 ' + Math.round(lead.m.heat) + '）／' + b.name + 'は、すぐそばに' + c.name + 'がいるので嗜めた', mag: 16 }, b.name + 'が嗜めた');
      return;
    }
    b.cnt.accept++; S.lewdNow = true; Lk.pairN = (Lk.pairN || 0) + 1;
    var lv = Math.min(Lk.lv + 1, 1);
    Lk.lv = Math.max(Lk.lv, lv); Lk.top = lead; Lk.bot = b;
    var t = ST.fmt(pk(hands(LK.ACT[lv ? 'kiss' : 'touch'][lead.bound ? 'bound' : 't'], lead, b)), { a: lead.name, b: b.name });
    /* 三人目：想っている相手なら嫉妬、そうでなければ見守る */
    var jl = interest(S, c, b) ? b : interest(S, c, lead) ? lead : null;
    if (jl) {
      var other = jl === b ? lead : b;
      t += ST.fmt(pk(CW.J.watch), { a: c.name, b: jl.name, c: other.name }) + c.name + pk(CW.JSAY[c.persona] || CW.JSAY.gentle);
      c.cnt.jeal++; c.jealOf = jl.i; c.m.reason = clamp(c.m.reason - 4, 0, 100); S.cj++;
      ST.sayB(S, { actors: [c, jl, other], tag: '嫉妬', text: t, why: '三人の場面：' + c.name + 'は、' + jl.name + CW.J_WHY.watch, mag: 20 }, c.name + 'が嫉妬した', true);
    } else {
      t += ST.fmt(pk(CW.W.kind), { a: c.name, b: lead.name, c: b.name });
      c.cnt.warm++; S.cw++;
      ST.sayB(S, { actors: [c, lead, b], tag: '見守る', text: t, why: '三人の場面：' + c.name + CW.W_WHY.kind + '（仲良し）', mag: 18 }, c.name + 'は二人を見守った', true);
    }
  }
  /* 三人の場面（R18）：はじめ→上下の形→二人ずつの最中→（男性向け）→一人ずつ果てる→結び */
  function trioScene(S, sp) {
    var R = LK.CROWD_R18, pk = S.pk, r = { t: sp.t, m: sp.m, u: sp.u }, vv = { t: sp.t.name, m: sp.m.name, u: sp.u.name };
    var out = ST.fmt(pk(R.OPEN3), vv) + ST.fmt(pk(R.SHAPE3[sp.p]), vv);
    /* 二人ずつ：oneTwo は t→m・t→u、twoOne は t→u・m→u、sandwich は t→m・m→u。{c}＝残りの一人 */
    var prs = sp.p === 'oneTwo' ? [[sp.t, sp.m, sp.u], [sp.t, sp.u, sp.m]] : sp.p === 'twoOne' ? [[sp.t, sp.u, sp.m], [sp.m, sp.u, sp.t]] : [[sp.t, sp.m, sp.u], [sp.m, sp.u, sp.t]];
    prs.forEach(function (z) { out += ST.fmt(pk(R.TP[modeOf(z[0], z[1])]), { a: z[0].name, b: z[1].name, c: z[2].name }); });
    if (S.eroOn && HK.ThickEro && HK.ThickEro.trioFill) {
      var tops = sp.p === 'oneTwo' ? [sp.t] : [sp.t, sp.m], bots = sp.p === 'oneTwo' ? [sp.m, sp.u] : sp.p === 'twoOne' ? [sp.u] : [sp.m, sp.u];
      var pen = tops.every(function (c) { return !isF(c); }) && R.TRIO_ERO.pen[sp.p];
      out += HK.ThickEro.trioFill(S, ST.fmt(pk(pen || R.TRIO_ERO.soft), vv), r);
    }
    /* 果てる：受ける人から順に（真ん中の sandwich は受ける側として） */
    var recv = sp.p === 'oneTwo' ? [[sp.m, sp.t], [sp.u, sp.t]] : sp.p === 'twoOne' ? [[sp.u, sp.t]] : [[sp.u, sp.m], [sp.m, sp.t]];
    var tops2 = sp.p === 'oneTwo' ? [[sp.t, sp.m]] : sp.p === 'twoOne' ? [[sp.t, sp.u], [sp.m, sp.u]] : [[sp.t, sp.m]];
    recv.forEach(function (z) { out += moan(S, z[0], false, modeOf(z[1], z[0]), true) + climaxBy(S, z[0], z[1], false); bumpClimax(z[0]); });
    tops2.forEach(function (z) { out += moan(S, z[0], true, modeOf(z[0], z[1]), true) + climaxBy(S, z[0], z[1], true); bumpClimax(z[0]); });
    out += ST.fmt(pk(R.CL3), vv);
    return out;
  }

  /* ---------- ロッカー越しの出来事 ---------- */
  function cross(S, lockers, G) {
    var rng = S.rng, pk = S.pk, P = S.P, J = [], W = [];
    P.forEach(function (a) {
      P.forEach(function (b) {
        if (a === b || !interest(S, a, b)) return;
        var bm = b.mates.filter(function (c) { return c !== a; });
        if (b.L !== a.L && bm.length) {
          var c = rng.pick(bm);
          if (b.L.lv >= 1 && (b.L.top === c || b.L.bot === c || b.L.trioIn)) J.push({ k: okLove(b, c) && interest(S, b, c) && !a.lostTo && rng() < 0.4 ? 'lost' : 'hear', a: a, b: b, c: c });
          else J.push({ k: 'pressed', a: a, b: b, c: c });
        }
        P.forEach(function (c) { if (c !== a && c !== b && interest(S, c, b) && a.L !== b.L && c.L !== b.L && a.i < c.i) J.push({ k: 'rival', a: a, b: b, c: c }); });
      });
    });
    lockers.forEach(function (Y) {
      if (Y.m.length < 2) return;
      var outs = P.filter(function (a) { return a.L !== Y; });
      if (!outs.length) return;
      var b = Y.m[0], c = Y.m[1];
      outs.forEach(function (a) {
        W.push({ k: 'cheer', a: a, b: b, c: c });
        Y.m.forEach(function (bb) { if (has(S, a, bb, /^(lover|mate|fated)$/) && okLove(a, bb)) W.push({ k: 'reassure', a: a, b: bb, c: Y.m.filter(function (q) { return q !== bb; })[0] }); });
      });
      /* やっかみ：触れ合った二人を、外のロッカーの人が妬む（その二人のどちらも想っていない人） */
      if (Y.m.length === 2 && Y.lv >= 1) outs.forEach(function (a) { if (!interest(S, a, b) && !interest(S, a, c) && !a.L.sexIn && a.L.lv < 1) J.push({ k: 'envy', a: a, b: b, c: c }); });
      /* 祝福：距離の縮まった、想い合える二人 */
      if (Y.m.length === 2 && Y.lv >= 1 && okLove(b, c) && (interest(S, b, c) || interest(S, c, b)) && !S.blessed[Y.n]) outs.forEach(function (a) { if (!interest(S, a, b) && !interest(S, a, c)) W.push({ k: 'bless', a: a, b: b, c: c, Y: Y }); });
    });
    if (lockers.length >= 2) {
      var pool = P.slice(), three = [];
      while (three.length < 3 && pool.length) three.push(pool.splice(rng.int(pool.length), 1)[0]);
      if (three.length === 3) {
        W.push({ k: 'tease', a: three[0], b: three[1], c: three[2] });
        if (G && !G.bind && S.prog < 90 && new Set(three.map(function (p) { return p.L; })).size >= 2) W.push({ k: 'relay', a: three[0], b: three[1], c: three[2] });
      }
    }
    lockers.forEach(function (Y) { if (Y.m.length === 3 && !Y.trioIn && Y.m.every(function (p) { return p.m.reason > 20; })) W.push({ k: 'trio', a: Y.mid, b: Y.m.filter(function (p) { return p !== Y.mid; })[0], c: Y.m.filter(function (p) { return p !== Y.mid; })[1] }); });
    /* 嫉妬系と仲良し系：少ない方を選びやすく（半々くらいに） */
    var pJ = J.length ? clamp(0.5 + (S.cw - S.cj) * 0.25, 0.15, 0.95) : 0;
    if (!W.length) pJ = J.length ? 1 : 0;
    if (!J.length && !W.length) return;
    /* すれ違いの種がなく、仲良し系がすでに多い回は、ロッカー越しの出来事を控える */
    if (!J.length && S.cw - S.cj >= 1 && rng() < 0.75) return;
    if (rng() < pJ) {
      var e = rng.pick(J), a = e.a, v = { a: a.name, b: e.b.name, c: e.c.name };
      a.cnt.jeal++; if (e.k !== 'envy') a.jealOf = e.b.i; a.m.reason = clamp(a.m.reason - 4, 0, 100); S.cj++;
      if (e.k === 'lost') a.lostTo = [e.b.i, e.c.i];
      ST.sayB(S, { actors: [a, e.b, e.c], tag: CW.J_TAG[e.k], text: ST.fmt(pk(CW.J[e.k]), v) + (S.rng() < 0.7 ? a.name + pk(CW.JSAY[a.persona] || CW.JSAY.gentle) : ''), why: '三人の場面：' + a.name + 'は、' + e.b.name + CW.J_WHY[e.k] + '（嫉妬）', mag: 20 }, a.name + 'が' + CW.J_TAG[e.k], e.k === 'lost');
    } else {
      var w = rng.pick(W), v2 = { a: w.a.name, b: w.b.name, c: w.c.name };
      [w.a, w.b, w.c].forEach(function (p) { p.m.reason = clamp(p.m.reason + 4, 0, 100); });
      w.a.cnt.warm++; S.cw++;
      if (w.k === 'relay') S.prog = clamp(S.prog + 12 + S.rng() * 10, 0, 99);
      if (w.k === 'bless') S.blessed[w.Y.n] = true;
      ST.sayB(S, { actors: [w.a, w.b, w.c], tag: CW.W_TAG[w.k], text: ST.fmt(pk(CW.W[w.k]), v2), why: '三人の場面：' + w.a.name + CW.W_WHY[w.k] + '（三人の理性 +4・仲良し）', mag: 16 }, w.a.name + '：' + CW.W_TAG[w.k], w.k === 'bless');
    }
  }

  LK.crowd = function (input) { return input.chars.length <= 1 ? soloRun(input) : groupRun(input); };
})();
