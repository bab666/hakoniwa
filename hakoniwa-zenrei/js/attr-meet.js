/* 箱庭シミュレーター attr-meet: 体の特徴・目につく特徴（自由入力）への「初対面の反応」と、目につく特徴に触れる関係の場面（全年齢版・R18版共通。attr-race.js の次に読む）
   ■ HK.Attr.meetLine(a, b, owner, pick, opt)：b が a の特徴（体の特徴 A.featsOf・その他の種族の名前・目につく特徴 A.looksOf）に初めて気づく一文と、
       b の態度（HK.personaOf の 9 種）で書き分けた反応（じっと見る・思わず口に出す・見ないふり・褒める・怖がる・珍しがる）の台詞、
       a の態度で書き分けた返し（嫌がる・照れる・慣れている）の台詞。特徴は A.featPick（連続させない決まり）で一つだけ選ぶ。
       opt = { intro: 導入の扱い（人ごとに 1 文）, not: 使わない鍵の配列, notCat: 使わない分類 }。出せなければ乱数を使わずに ''（特徴の無い人）
   ■ HK.Attr.meetScene(list, owner, pick)：特徴のある人 1 人につき、まだ知り合いでない別の 1 人が気づく場面を、最大 2 組、1 組ずつ別の記録で出す
       （同じ分類の特徴を二組続けない。導入 raceIntro で触れた特徴は使わない）。出した組の数を返す
       ・A.raceIntro を包む：導入のある箱庭（zombie-core・無人島・出られない部屋・邪神村・宇宙船・吹雪の館・ロッカー）は、導入の記録のすぐあとに出す（呼び出し側は変えない）
       ・合コン・クラスメイトは scenarios-a.js の最初の場面から、オメガバースは運命の番の出会い（scenario-omega.js）から meetLine を呼ぶ
   ■ HK.Attr.looksLine(c, o, kind, owner, pick)：目につく特徴のふだんの一文（kind＝look／touch／hold。attr.js の A.LOOKS_FL。連続させない決まりに従う）
   ■ HK.Attr.looksTalk(a, b, owner, pick)：親友・恋人・片想いの二人で、目につく特徴に触れる短い場面（「その髪飾り、似合ってる」など）。
       A.daily（tie-rel.js のふだんの場面）を包み、bond の出来事の後ろに 1 割で足す
   ■ HK.Attr.meetLog：点検用（配列を入れると { kind: 'meet'|'talk', who, by, feat, at } を記録する）
   特徴も目につく特徴も無い人には乱数を使わない（決めていない人の結果は、これまでと変わらない）。性的な表現は使わない。登場人物はすべて成人として扱う */
(function () {
  'use strict';
  var HK = window.HK, A = HK && HK.Attr;
  if (!A || !A.featPick || !A.featKeys) return;
  function L(s) { return s.split('|'); }
  function fill(t, v) { return t.replace(/\{(\w+)\}/g, function (m, k) { return v[k] != null ? v[k] : m; }); }
  function noteOf(c) { return (c && (c.raceNote || (c.src && c.src.raceNote))) || ''; }
  A.meetLog = null;

  /* ---------- 特徴ごとの「気づく」一文（{a}＝特徴のある人、{b}＝気づく人）。g＝反応の組（see 見て気づく／hear 音／touch 手触り／heal 傷の治り）、
     w＝反応の文で使う呼び名、cat＝分類（同じ分類を二組続けない）、scary＝怖がられやすい特徴 ---------- */
  var FEAT = {
    ear: { g: 'see', w: '耳', cat: 'beast', n: L('{a}の頭の上で、獣の耳がぴくりと動いた。{b}の目が、そこに吸い寄せられた。|{a}の獣の耳が、{b}の声のするほうへくるりと向いた。{b}は思わず言葉を止めた。|{b}は、{a}の髪のあいだから立ち上がった獣の耳に気づいて、目を瞬かせた。') },
    tail: { g: 'see', w: '尻尾', cat: 'beast', n: L('{a}の後ろで、ふさふさとした尻尾がゆらりと揺れた。{b}の視線が、それを追いかけた。|{b}は、{a}が腰を下ろすときに尻尾を器用に脇へ寄せたのを見て、目を丸くした。|{a}の尻尾の先が、{b}の足首をかすめた。振り向いた{b}は、そこで初めて尻尾に気づいた。') },
    fang: { g: 'see', w: '牙', cat: 'fang', scary: true, n: L('{a}が名乗って笑ったとき、口元に小さな牙がのぞいた。{b}は、一瞬だけ息を止めた。|{b}は、{a}の唇の端からのぞく白い牙に気づいた。|{a}があくびを噛み殺したとき、鋭い牙が白く光った。{b}の目が、そこで止まった。') },
    horn: { g: 'see', w: '角', cat: 'horn', scary: true, n: L('{b}は、{a}の髪のあいだから伸びる角に気づいて、思わず見上げた。|{a}が軽く会釈すると、角の先が灯りを受けて光った。{b}の目が、そこで止まった。|{a}は戸口をくぐるとき、角がぶつからないように少し首を傾けた。{b}は、その仕草で初めて角に気づいた。') },
    wing: { g: 'see', w: '翼', cat: 'wing', n: L('{a}の背中で、畳まれた翼がかすかに動いた。{b}は目を瞬かせた。|{b}の足元に、羽が一枚ひらりと落ちた。顔を上げると、{a}の背に翼があった。|{a}が伸びをすると、背中の翼が音もなく広がった。{b}は、ぽかんとそれを見上げた。') },
    trans: { g: 'see', w: '透けた体', cat: 'trans', scary: true, n: L('{b}は、{a}の肩越しに、向こうの壁がうっすらと透けて見えることに気づいた。|{a}の指先が、灯りの下でかすかに透けていた。{b}は二度、目をこすった。|{a}の足元には、影が落ちていなかった。{b}は、それに気づいて足を止めた。') },
    cold: { g: 'touch', w: '手', cat: 'cold', n: L('挨拶の握手をしたとき、{b}は{a}の手の冷たさに驚いた。|{a}の手が、{b}の手にふと触れた。氷のような冷たさに、{b}は思わず手を引きかけた。|{a}から差し出された手を取った瞬間、{b}の指先がひやりとした。') },
    eye: { g: 'see', w: '瞳', cat: 'eye', scary: true, n: L('{a}の瞳が、薄暗がりの中でかすかに光った。{b}は、それが灯りの照り返しではないと気づいた。|{b}は、{a}と目が合った瞬間、その瞳が淡く光っていることに気づいた。|暗がりに入ったとき、{a}の瞳だけがぼんやりと光って見えた。{b}は息をのんだ。') },
    drive: { g: 'hear', w: '駆動音', cat: 'drive', n: L('{a}が振り向いたとき、首の奥で小さな駆動音が鳴った。{b}は耳を疑った。|{b}は、{a}の関節がかすかにきしむ音を聞きつけた。動きも、どこか正確すぎた。|{a}の背中のあたりから、冷却の排気が細く漏れた。{b}は、その音のほうを振り返った。') },
    immortal: { g: 'heal', w: '傷', cat: 'immortal', n: L('{a}は割れた破片で指先を切ったが、気にも留めなかった。{b}が見ているうちに、傷は跡形もなく塞がった。|{a}の腕の擦り傷が、話しているうちに薄く消えていった。{b}はそれに気づいて、言葉を失った。|{a}の手の甲に走った赤い線が、{b}の目の前で、すっと閉じていった。') },
    note: { g: 'see', w: '姿', cat: 'note', n: L('{b}は、{a}の{note}らしい姿に気づいて、思わず見つめた。|{a}の{note}らしいしぐさが、{b}の目を引いた。|{b}は、{a}が{note}であることに、挨拶を交わしてから気づいた。') },
    look: { g: 'see', w: '{feat}', cat: 'looks', n: L('{b}の目は、{a}の{feat}に吸い寄せられた。|{b}は、{a}の{feat}に気づいて、少しだけ目を留めた。|挨拶を交わしたとき、{b}は{a}の{feat}に目を奪われた。|{a}が顔を上げたとき、{b}は{a}の{feat}に気づいた。') }
  };
  A.MEET_FEAT = FEAT;
  /* 理由書きの呼び名（「〜に気づいた」に続く名詞） */
  var WHY_LAB = { ear: '獣の耳', trans: '透けた体', cold: '冷たい肌', eye: '光る瞳', drive: '駆動音', immortal: '傷の治り' };

  /* ---------- 気づいた側（{b}）の反応：組（see／hear／touch／heal）× 態度（9 種）。r＝返しの向き（p 好意・好奇心／n 戸惑い・怖れ・突き放し） ---------- */
  function R(r, s) { return L(s).map(function (t) { return { r: r, t: t }; }); }
  var REACT = {
    see: {
      free: R('p', '{b}は思わず声を上げた。{b}「え、すごい！ 初めて見た｜おお、すごいな。初めて見た｜え、すごいですね！ 初めて見ました」|{b}は目を輝かせて身を乗り出した。{b}「わあ、きれい！ もっとよく見せて｜おお、きれいだな。もっとよく見せてくれ｜わあ、きれいですね！ もっとよく見せてください」'),
      cool: R('p', '{b}は表情を変えずに、それをじっと観察した。{b}「なるほど。興味深い｜なるほど。興味深いな｜なるほど。興味深いですね」|{b}は一度だけそちらに目をやり、何事もなかったように視線を戻した。もっとも、その一度はずいぶん長かった。{b}「……失礼。少し見入ってしまった｜＝｜……失礼しました。少し見入ってしまいました」'),
      proud: R('n', '{b}はそれをちらりと見て、ふんと鼻を鳴らした。{b}「変わってる｜変わっているな｜変わってますね」|{b}は気にしていないふりをしたが、目だけは何度もそちらに戻っていた。{b}「……別に、見てない｜……別に、見ていない｜……別に、見てません」'),
      tsun: R('p', '{b}は慌てて目を逸らした。{b}「べ、別に珍しくなんかない｜べ、別に珍しくなどない｜べ、別に珍しくなんかありません」|{b}は、しばらく黙ってから口を開いた。{b}「……それ、ちょっとだけ、いいと思う｜……それは、少しだけ、いいと思う｜……それ、ちょっとだけ、いいと思います」言ってから、言わなければよかったという顔をした。'),
      gentle: R('p', '{b}は、ふわりと笑った。{b}「素敵だね｜素敵だな｜素敵ですね」|{b}は目を細めて、それを眺めた。{b}「よく似合ってる｜よく似合っている｜よく似合ってますね」'),
      polite: R('p', '{b}は丁寧に会釈しながらも、それに目を留めた。{b}「失礼。とても印象的だったから、つい｜失礼。とても印象的だったので、つい見てしまった｜失礼しました。とても印象的だったので、つい見てしまいました」|{b}は少し迷ってから、言葉を選んで口にした。{b}「きれいだと思う。気を悪くしたら、ごめん｜きれいだと思う。気を悪くしたら、すまない｜きれいだと思います。お気を悪くされたら、ごめんなさい」'),
      stern: R('n', '{b}は一瞬だけそちらに目をやり、すぐに視線を正面へ戻した。{b}「人の見た目を、じろじろ見るものじゃない｜人の見た目を、じろじろ見るものではない｜人の見た目を、じろじろ見るものではありませんね」|{b}は眉ひとつ動かさなかった。{b}「気にしない。よろしく｜気にしない。よろしく頼む｜気にしません。よろしくお願いします」'),
      shy: R('p', '{b}は、見てはいけないものを見たように頬を赤くした。{b}「あ、ご、ごめん。じっと見ちゃって｜す、すまない。じっと見てしまった｜あ、ご、ごめんなさい。じっと見てしまいました」|{b}は目を逸らそうとして、また見てしまった。{b}「……きれい｜……きれいだ｜……きれいです」'),
      devoted: R('p', '{b}は、ぱっと顔を明るくした。{b}「きれい……。ごめん、見とれてた｜きれいだ……。すまない、見とれていた｜きれいです……。すみません、見とれてました」|{b}は胸の前で手を合わせた。{b}「すてき。あとで、もう少しだけ見せて｜すてきだ。あとで、もう少しだけ見せてくれ｜すてきです。あとで、もう少しだけ見せてください」')
    },
    /* 怖がられやすい特徴（牙・角・透ける体・光る瞳）：穏やか・恥じらい・健気の人は、まず怖がる */
    scary: {
      shy: R('n', '{b}は、びくりと肩をすくめた。{b}「こ、怖くない……怖くない｜こ、怖くない……怖くない｜こ、怖くないです……怖くないです」|{b}は思わず一歩下がり、近くの人の陰に半分隠れた。{b}「ご、ごめん。ちょっと、びっくりして｜す、すまない。少し、驚いて｜ご、ごめんなさい。ちょっと、びっくりしてしまって……」'),
      gentle: R('n', '{b}は一瞬たじろいだが、すぐに笑顔を作り直した。{b}「ごめん、少し驚いただけ｜すまない、少し驚いただけだ｜ごめんなさい、少し驚いただけです」|{b}は小さく息をのんで、それから困ったように笑った。{b}「びっくりした。でも、もう平気｜驚いた。だが、もう平気だ｜びっくりしました。でも、もう平気です」'),
      devoted: R('n', '{b}は小さく息をのんで、一歩下がった。{b}「あ……ごめん。失礼だった｜あ……すまない。失礼だった｜あ……すみません。失礼でした」|{b}は怖さを隠すように、ぎゅっと手を握りしめた。{b}「だ、大丈夫。怖くない｜だ、大丈夫だ。怖くない｜だ、大丈夫です。怖くありません」')
    },
    hear: {
      free: R('p', '{b}は耳をそばだてた。{b}「今の音、なに？ もう一回聞かせて｜今の音は何だ。もう一度聞かせてくれ｜今の音、なんですか？ もう一回聞かせてください」|{b}は目を輝かせて、{a}の周りをぐるりと回った。{b}「機械の体なの？ すごい！｜機械の体なのか。すごいな｜機械の体なんですか？ すごいです！」'),
      proud: R('n', '{b}は怪訝そうに{a}を見た。{b}「……今、何か鳴った？｜……今、何か鳴ったか｜……今、何か鳴りましたか？」|{b}は眉をひそめた。{b}「機械か。どうりで愛想がない｜機械か。どうりで愛想がないわけだ｜機械ですか。どうりで愛想がないわけです」'),
      tsun: R('p', '{b}は、聞こえなかったふりをした。それでも、耳だけは{a}のほうを向いていた。{b}「べ、別に気にしてない｜べ、別に気にしていない｜べ、別に気にしてません」'),
      cool: R('p', '{b}は興味深そうに、{a}の首元を見つめた。{b}「駆動音……機械の体？｜駆動音……機械の体か｜駆動音……機械の体ですか？」|{b}は{a}の動きを目で追った。{b}「動きに無駄がない。よくできてる｜動きに無駄がない。よくできている｜動きに無駄がありませんね。よくできています」'),
      polite: R('p', '{b}は丁寧に尋ねた。{b}「失礼。今の音は、あなたの？｜失礼。今の音は、あなたのものか｜失礼ですが、今の音は、あなたのですか？」'),
      stern: R('n', '{b}は表情を変えずに頷いた。{b}「機械の体か。務めが果たせるなら、それでいい｜＝｜機械の体ですか。務めが果たせるなら、それで構いません」'),
      gentle: R('p', '{b}は目をぱちぱちさせて、{a}の動きを見つめた。{b}「人形みたいに、きれい｜人形のように、きれいだ｜お人形みたいに、きれいですね」'),
      shy: R('n', '{b}は、びくりと音のほうを見た。{b}「あ、あの……今の音……｜あ、あの……今の音は……｜あ、あの……今の音は……」'),
      devoted: R('p', '{b}は心配そうに{a}を見上げた。{b}「どこか、具合が悪いの？｜どこか、具合が悪いのか｜どこか、具合が悪いんですか？」')
    },
    touch: {
      free: R('p', '{b}は目を丸くした。{b}「冷たっ！ 大丈夫？｜冷たいな。大丈夫か｜冷たっ！ 大丈夫ですか？」'),
      proud: R('n', '{b}は眉をひそめた。{b}「手、冷たすぎ｜手が冷たすぎる｜手、冷たすぎませんか」'),
      tsun: R('p', '{b}はぱっと手を離して、それから小声で言った。{b}「……べ、別に、いやだったわけじゃない｜……べ、別に、いやだったわけではない｜……べ、別に、いやだったわけじゃありません」'),
      cool: R('p', '{b}は手を離さずに、その冷たさを確かめるように少しだけ握った。{b}「体温が低い体質？｜体温が低い体質か｜体温が低い体質ですか？」'),
      polite: R('p', '{b}は、驚きを顔に出さないように微笑んだ。{b}「冷えてる。何か温かいものを｜冷えているな。何か温かいものを用意しよう｜冷えていますね。何か温かいものをお持ちしましょう」'),
      stern: R('n', '{b}は握手の手をそのまま離した。{b}「冷えた手だ。体は大事にしろ｜冷えた手だ。体は大事にしろ｜冷えた手ですね。体は大事にしてください」'),
      gentle: R('p', '{b}はとっさに、{a}の手を両手で包み込んだ。{b}「冷えてる。少し温めよう｜冷えているな。少し温めよう｜冷えてますね。少し温めましょう」'),
      shy: R('n', '{b}は驚いて手を引きかけ、慌てて握り直した。{b}「ご、ごめん。びっくりして｜す、すまない。驚いた｜ご、ごめんなさい。びっくりしました」'),
      devoted: R('p', '{b}は{a}の手を離さなかった。{b}「冷たい。私の手で温まるといいけど｜冷たいな。私の手で温まるといいが｜冷たいです。私の手で温まるといいんですけど」')
    },
    heal: {
      free: R('p', '{b}は目を見開いた。{b}「え、今の、治った？ どうなってるの？｜今のは、治ったのか。どうなっている｜え、今の、治りました？ どうなってるんですか？」'),
      proud: R('n', '{b}は目を細めた。{b}「……化け物じみてる｜……化け物じみているな｜……化け物じみてますね」'),
      tsun: R('p', '{b}は、顔をしかめて目を逸らした。{b}「べ、別に心配なんてしてない｜べ、別に心配などしていない｜べ、別に心配なんてしてません」'),
      cool: R('p', '{b}は、傷のあった場所をじっと見つめた。{b}「この治り方は、ふつうじゃない｜この治り方は、ふつうではないな｜この治り方は、ふつうではありませんね」'),
      polite: R('p', '{b}はハンカチを差し出しかけて、手を止めた。{b}「もう、塞がってる｜もう、塞がっているな｜もう、塞がっていますね」'),
      stern: R('n', '{b}は一度だけ頷いた。{b}「頑丈なのはいい。だが、無茶はするな｜＝｜頑丈なのはいいことです。ですが、無茶はしないでください」'),
      gentle: R('p', '{b}は思わず{a}の手を取った。{b}「痛くない？ 大丈夫？｜痛くないか。大丈夫か｜痛くないですか？ 大丈夫ですか？」'),
      shy: R('n', '{b}は、青ざめて口元を押さえた。{b}「い、今、傷が……消えた……｜い、今、傷が……消えた……｜い、今、傷が……消えました……」'),
      devoted: R('p', '{b}は{a}の手を両手で包んだ。{b}「治っても、痛いのは同じでしょう？｜治っても、痛いのは同じだろう｜治っても、痛いのは同じでしょう？」')
    }
  };
  A.MEET_REACT = REACT;

  /* ---------- 気づかれた側（{a}）の返し：態度の組（hard 強気・意地っ張り・厳格／soft 恥じらい・健気／easy 穏やか・奔放・敬語・冷静）× 反応の向き（p／n） ---------- */
  var BACK = {
    p: {
      hard: L('{a}はそっぽを向いた。{a}「……珍しがられるのは、慣れてる｜……珍しがられるのには、慣れている｜……珍しがられるのには、慣れてます」|{a}は小さく肩をすくめただけだった。{a}「よく言われる｜よく言われる｜よく言われます」|{a}は少しだけ口の端を上げた。{a}「見る目はあるみたい｜見る目はあるようだな｜見る目はあるみたいですね」'),
      soft: L('{a}は頬を赤くして、うつむいた。{a}「あ、あんまり見ないで……｜あ、あまり見ないでくれ……｜あ、あんまり見ないでください……」|{a}は照れくさそうに笑った。{a}「そう言ってもらえると、うれしい｜そう言ってもらえると、うれしい｜そう言ってもらえると、うれしいです」'),
      easy: L('{a}は慣れた様子で笑った。{a}「よく言われる｜よく言われる｜よく言われます」|{a}は楽しそうに目を細めた。{a}「最初はみんな、そういう顔をする｜最初は誰でも、そういう顔をする｜最初は皆さん、そういう顔をされます」|{a}はくすりと笑った。{a}「気になるなら、あとでゆっくり話そう｜気になるなら、あとでゆっくり話そう｜気になるなら、あとでゆっくりお話ししましょう」')
    },
    n: {
      hard: L('{a}は冷ややかに目を細めた。{a}「どう思われても、構わない｜どう思われようと、構わない｜どう思われても、構いません」|{a}は鼻で笑った。{a}「見せ物じゃない｜見せ物ではない｜見せ物じゃありません」'),
      soft: L('{a}は、体を隠すように身をすくめた。{a}「ご、ごめん。驚かせて｜す、すまない。驚かせた｜ご、ごめんなさい。驚かせてしまって……」|{a}は寂しそうに笑った。{a}「慣れてるから、平気｜慣れているから、平気だ｜慣れてますから、平気です」'),
      easy: L('{a}は気にした様子もなく、やわらかく笑った。{a}「大丈夫。噛みついたりしない｜大丈夫だ。噛みついたりはしない｜大丈夫です。噛みついたりしませんから」|{a}は穏やかに首を振った。{a}「気にしないで。慣れてるから｜気にしなくていい。慣れている｜気にしないでください。慣れてますから」')
    }
  };
  /* 不死の人の返し（傷の治りを見られたとき） */
  var BACK_HEAL = L('{a}は、何でもないように手を振った。{a}「平気。すぐ治るから｜平気だ。すぐ治る｜平気です。すぐ治りますから」|{a}は、塞がった傷跡を袖で隠した。{a}「昔から、こうなんだ｜昔から、こうなのだ｜昔から、こうなんです」|{a}は少しだけ寂しそうに笑った。{a}「死ねない体なの。気味が悪いでしょう？｜死ねない体だ。気味が悪いだろう｜死ねない体なんです。気味が悪いでしょう？」');
  A.MEET_BACK = BACK;
  var TIER = { proud: 'hard', tsun: 'hard', stern: 'hard', shy: 'soft', devoted: 'soft', gentle: 'easy', free: 'easy', polite: 'easy', cool: 'easy' };

  function persona(c) { var p = c && (c.persona || (HK.personaOf ? HK.personaOf(c) : '')); return HK.PERSONA && HK.PERSONA[p] ? p : 'gentle'; }
  function catOf(k) { return !k ? '' : k.indexOf('look:') === 0 ? 'looks' : FEAT[k] ? FEAT[k].cat : k; }
  function infoOf(k) { return !k ? null : k.indexOf('look:') === 0 ? FEAT.look : FEAT[k] || null; }
  function mlog(kind, a, b, k, owner) { if (A.meetLog) A.meetLog.push({ kind: kind, who: a.name, by: b ? b.name : '', feat: k, at: owner && Array.isArray(owner.log) ? owner.log.length : -1 }); }
  function ownerOf(o) { return o && typeof o === 'object' ? o : A.curOwner && typeof A.curOwner === 'object' ? A.curOwner : null; }

  /* ---------- 初対面の反応の一場面 ---------- */
  A.meetLine = function (a, b, owner, pick, opt) {
    if (!a || !b || a === b || !a.name || !b.name) return '';
    opt = opt || {};
    var not = opt.not || [], notCat = opt.notCat || '';
    if (!A.featKeys(a).length) return '';
    owner = ownerOf(owner);
    var pk = A.racePick(pick || owner);
    var k = A.featPick(owner, a, { kind: 'meet', pick: pk, peek: true, intro: !!opt.intro, keys: function (x) { return not.indexOf(x) < 0 && (!notCat || catOf(x) !== notCat); } });
    var inf = infoOf(k);
    if (!inf) return '';
    var g = inf.g, pb = persona(b), pa = persona(a);
    var tbl = g === 'see' && inf.scary && REACT.scary[pb] ? REACT.scary[pb] : (REACT[g][pb] || REACT[g].gentle);
    var fp = owner && A.raceFresh ? A.raceFresh(owner, pk) : pk;
    var re = pk(tbl);
    var back = g === 'heal' && pk([0, 1]) ? fp(BACK_HEAL) : fp(BACK[re.r][TIER[pa] || 'easy']);
    var feat = k.indexOf('look:') === 0 ? k.slice(5) : '';
    var v = { a: a.name, b: b.name, note: noteOf(a), feat: feat };
    v.w = fill(inf.w, v);
    var s = fill(fp(inf.n), v) + fill(re.t, v) + fill(back, v);
    A.featUse(owner, a, k, { kind: 'meet', intro: !!opt.intro });
    mlog('meet', a, b, k, owner);
    return s;
  };

  /* ---------- 二人がもとから知り合いか（関係のある二人には「初めて気づく」場面を出さない） ---------- */
  var curIn = null;
  function idx(c) { return c && typeof c.i === 'number' ? c.i : c && c.src && typeof c.src.i === 'number' ? c.src.i : null; }
  function known(owner, a, b) {
    if (A.samePair && A.samePair(a, b)) return true;
    var L0 = null;
    if (owner && owner.tiesAll && HK.Ties && HK.Ties.all) L0 = HK.Ties.all(owner, a, b);
    else {
      var ia = idx(a), ib = idx(b), src = owner && Array.isArray(owner.ties) ? owner.ties : curIn && Array.isArray(curIn.ties) ? curIn.ties : [];
      if (ia == null || ib == null) return false;
      L0 = src.filter(function (t) { return t && ((t.a === ia && t.b === ib) || (t.a === ib && t.b === ia)); });
    }
    return (L0 || []).some(function (t) { return t && t.type !== 'noobs'; });
  }
  function here(c) {
    if (!c || c.alive === false || (c.flags && c.flags.caged != null) || c.out) return false;
    return HK.State && HK.State.here && c.flags ? HK.State.here(c) : true;
  }
  /* 記録に出す（エンジン型は ctx.say、物語型は HK.Story.say）。o.look：attr-look.js の見た目の一文を重ねない */
  function emit(owner, a, b, text, k) {
    var why = '初対面：' + b.name + 'が' + a.name + 'の' + (k.indexOf('look:') === 0 ? k.slice(5) : k === 'note' ? noteOf(a) + 'らしさ' : WHY_LAB[k] || A.featLabel(k)) + 'に気づいた（' + b.name + 'の態度「' + ((HK.PERSONA[persona(b)] || {}).label || '') + '」）';
    if (typeof owner.present === 'function' && typeof owner.say === 'function') return owner.say({ kind: 'event', cat: 'bond', actors: [b, a], text: text, why: why, look: true, meet: true });
    if (HK.Story && HK.Story.say && Array.isArray(owner.log)) return HK.Story.say(owner, { actors: [b, a], tag: '初対面', text: text, why: why, look: true, meet: true });
    return null;
  }
  /* 特徴のある人 1 人につき、知り合いでない別の 1 人が気づく場面（最大 max 組。既定 2）。opt.not[名前] = 使わない鍵の配列 */
  function cands(list, owner, not) {
    return list.filter(function (c) {
      if (!here(c)) return false;
      var ks = A.featKeys(c).filter(function (k) { return (not[c.name] || []).indexOf(k) < 0; });
      return ks.length && list.some(function (o) { return o !== c && here(o) && !known(owner, c, o); });
    });
  }
  A.meetScene = function (list, owner, pick, opt) {
    owner = ownerOf(owner);
    opt = opt || {};
    if (!owner || !Array.isArray(owner.log)) return 0;
    list = (list || []).filter(Boolean);
    var not = opt.not || {}, max = opt.max || 2, done = 0, used = [], lastCat = '';
    var C = cands(list, owner, not);
    if (!C.length) return 0;
    var pk = A.racePick(pick || owner);
    while (done < max) {
      var C2 = C.filter(function (c) { return used.indexOf(c) < 0; });
      if (!C2.length) break;
      var a = C2.length === 1 ? C2[0] : pk(C2);
      used.push(a);
      var bs = list.filter(function (o) { return o !== a && here(o) && !known(owner, a, o); });
      if (!bs.length) continue;
      var b = bs.length === 1 ? bs[0] : pk(bs);
      var t = A.meetLine(a, b, owner, pk, { intro: true, not: not[a.name] || [], notCat: lastCat });
      if (!t) continue;
      var k = (owner._featLast || {})[a.name];
      lastCat = catOf(k && k.feat);
      emit(owner, a, b, t, (k && k.feat) || '');
      done++;
    }
    return done;
  };

  /* ---------- 導入（A.raceIntro）を包む：導入の記録のすぐあとに、初対面の反応の場面を出す ---------- */
  if (A.raceIntro && !A.raceIntro._meet) {
    var ri0 = A.raceIntro;
    A.raceIntro = function (list, mood, pk, max) {
      var own = pk && typeof pk === 'object' && Array.isArray(pk.log) ? pk : null;
      var r0 = own ? own.log.length : 0, before = {};
      if (own) (list || []).forEach(function (c) { if (c && c.name) before[c.name] = (own._featLast || {})[c.name]; });
      var s = ri0.apply(this, arguments);
      if (!own || !list || list.length < 2) return s;
      /* 導入で触れた特徴は使わない（導入が連続の決まりに記録した鍵。記録されていない種族の文で名前が出た人は、種族の特徴をすべて外す） */
      var not = {};
      list.forEach(function (c) {
        if (!c || !c.name) return;
        var l = (own._featLast || {})[c.name];
        if (l && l !== before[c.name] && l.at === r0) not[c.name] = [l.feat];
        else if (s && s.indexOf(c.name) >= 0) not[c.name] = A.featsOf(c).concat(A.featKeys(c).filter(function (k) { return k === 'note'; }));
      });
      if (cands(list.filter(Boolean), own, not).length) own._meetPend = { list: list.slice(), not: not, n: r0 };
      return s;
    };
    A.raceIntro._meet = true;
  }
  /* 導入の記録を書き終えたら（記録が増えたら）、待っていた初対面の場面を出す。区切り（step）の記録では待つ */
  function flush(owner, e) {
    var p = owner && owner._meetPend;
    if (!p || !Array.isArray(owner.log) || owner.log.length <= p.n || (e && e.kind === 'step')) return;
    delete owner._meetPend;
    A.meetScene(p.list, owner, null, { not: p.not });
  }
  if (HK.Ctx && HK.Ctx.prototype.say && !HK.Ctx.prototype.say._meet) {
    var cs0 = HK.Ctx.prototype.say;
    HK.Ctx.prototype.say = function (o) {
      try { talkHook(this, o, null); } catch (x) { /* 飾りが失敗しても出来事は出す */ }
      var e = cs0.apply(this, arguments);
      if (this._meetPend) { try { flush(this, o); } catch (x) { delete this._meetPend; } }
      return e;
    };
    HK.Ctx.prototype.say._meet = true;
    HK.Ctx.prototype.say._attrLook = cs0._attrLook;
  }
  if (HK.Story && HK.Story.say && !HK.Story.say._meet) {
    var ss0 = HK.Story.say;
    HK.Story.say = function (S, o) {
      try { if (S && typeof S === 'object') talkHook(S, o, S.P || []); } catch (x) { /* 同上 */ }
      var e = ss0.apply(this, arguments);
      if (S && S._meetPend) { try { flush(S, o); } catch (x) { delete S._meetPend; } }
      return e;
    };
    HK.Story.say._meet = true;
    HK.Story.say._attrLook = ss0._attrLook;
  }
  /* 物語型で S.ties を持たない箱庭のために、実行中の入力（関係）を覚えておく */
  if (HK.simulate && !HK.simulate._meet) {
    var sim0 = HK.simulate;
    HK.simulate = function (input) { var prev = curIn; curIn = input || null; try { return sim0.apply(this, arguments); } finally { curIn = prev; } };
    for (var sk in sim0) if (Object.prototype.hasOwnProperty.call(sim0, sk)) HK.simulate[sk] = sim0[sk];
    HK.simulate._meet = true;
  }

  /* ---------- 目につく特徴のふだんの一文 ---------- */
  /* attr.js の A.LOOKS_FL に文を足す（{c}＝その人、{o}＝相手、{feat}＝目につく特徴。「{c}の{feat}が／に」の形で、どの語でも崩れない短い文） */
  if (A.LOOKS_FL && !A.LOOKS_FL._meet) {
    [['look', '{c}が笑うと、{feat}がいっそう目を引いた。|{o}は、{c}の{feat}を見るたびに、少しだけ得をした気分になった。|灯りの加減で、{c}の{feat}がいつもと違って見えた。'],
      ['touch', '{o}の目の前で、{c}の{feat}がかすかに揺れた。|{c}が顔を寄せると、{feat}がすぐそこにあった。'],
      ['hold', '{o}は腕の中の{c}の{feat}を、いとおしそうに眺めた。|抱き寄せると、{c}の{feat}が{o}の目のすぐ下にあった。']
    ].forEach(function (x) { if (A.LOOKS_FL[x[0]]) A.LOOKS_FL[x[0]] = A.LOOKS_FL[x[0]].concat(L(x[1])); });
    A.LOOKS_FL._meet = true;
  }
  A.looksLine = function (c, o, kind, owner, pick) {
    if (!c || !A.looksOf(c).length) return '';
    var k = A.featPick(owner, c, { kind: kind || 'look', pick: pick, keys: ['looks'] });
    return k ? A.featText(c, k, kind || 'look', pick, o, owner) : '';
  };

  /* ---------- 目につく特徴に触れる関係の場面（{x}＝特徴のある人、{y}＝触れる人） ---------- */
  var TALK = {
    friend: L('{y}は、{x}の{feat}を見て笑った。{y}「それ、やっぱり似合ってる｜それは、やっぱり似合っている｜それ、やっぱり似合ってますね」{x}「急に何｜急に何だ｜急になんですか」――そう言いながら、{x}はまんざらでもなさそうだった。|{y}「あなたの{feat}、遠くからでもすぐ分かる｜あなたの{feat}は、遠くからでもすぐ分かる｜あなたの{feat}、遠くからでもすぐ分かります」{x}は呆れたように笑った。|{x}が{feat}を気にしていると、{y}がさりげなく言った。{y}「気にしなくていい。私は好き｜気にしなくていい。私は好きだ｜気にしなくていいですよ。私は好きです」|{y}は人混みの向こうに{x}の{feat}を見つけて、手を振った。{y}「すぐ分かった｜すぐに分かった｜すぐ分かりました」'),
    lover: L('{y}は{x}の{feat}を、愛おしそうに見つめた。{y}「ここ、好き｜ここが、好きだ｜ここ、好きです」{x}は照れくさそうに目を伏せた。|{x}「この{feat}、変じゃない？｜この{feat}は、変じゃないか｜この{feat}、変じゃないですか？」{y}「変じゃない。私の好きなところ｜変じゃない。私の好きなところだ｜変じゃないです。私の好きなところです」|{y}は{x}の{feat}を眺めて、満足そうに笑った。誰よりも近くで見られるのは、自分だけだった。{y}「ずっと見ていられる｜＝｜ずっと見ていられます」|{x}は、{y}の視線が自分の{feat}に止まっているのに気づいた。{x}「また見てる｜また見ているな｜また見てますね」{y}「見てる。好きだから｜見ている。好きだからな｜見てます。好きですから」'),
    crush: L('{y}は、気づけばまた{x}の{feat}を目で追っていた。{x}に振り向かれて、慌てて視線を逸らした。{x}「何？｜何だ｜何ですか？」{y}「な、なんでもない｜な、何でもない｜な、なんでもないです」|{y}は勇気を出して言った。{y}「その{feat}、素敵だと思う｜その{feat}は、素敵だと思う｜その{feat}、素敵だと思います」{x}は少し驚いて、それから笑った。{y}にとっては、それだけで十分だった。|{y}は{x}の{feat}を、こっそり覚えていた。遠くからでも、すぐに{x}を見つけられるように。{y}「……今日も、見つけた｜＝｜……今日も、見つけました」|{y}は{x}と話しているあいだ、{x}の{feat}ばかり見ていた。話の中身は、半分も覚えていなかった。{y}「え、あ、うん｜え、あ、ああ｜え、あ、はい」'),
    /* 特徴のある側（{x}）が片想いをしていて、相手（{y}）に何気なく褒められる */
    crushed: L('{y}「その{feat}、いいね｜その{feat}は、いいな｜その{feat}、いいですね」何気ない一言だった。{x}はその日一日、その言葉を何度も思い返した。|{y}は{x}の{feat}に目を留めて、ふっと笑った。{y}「あなたらしい｜あなたらしいな｜あなたらしいですね」{x}は、うまく返事ができなかった。')
  };
  A.LOOKS_TALK = TALK;
  var FRIEND = /^(best|childhood|buddy|sibclose|almost)$/, LOVER = /^(lover|mate|fated)$/;
  function tiesOf(owner, a, b) {
    if (owner && owner.tiesAll && HK.Ties && HK.Ties.all) return HK.Ties.all(owner, a, b);
    var ia = idx(a), ib = idx(b), src = owner && Array.isArray(owner.ties) ? owner.ties : curIn && Array.isArray(curIn.ties) ? curIn.ties : [];
    return ia == null || ib == null ? [] : src.filter(function (t) { return t && ((t.a === ia && t.b === ib) || (t.a === ib && t.b === ia)); });
  }
  /* x（特徴のある人）と y の関係の種類：lover／crush（y→x の片想い）／crushed（x→y の片想い）／friend／'' */
  function talkKind(owner, x, y) {
    var ts = tiesOf(owner, x, y), ix = idx(x), iy = idx(y), k = '';
    var pf = owner && typeof owner.pair === 'function' ? owner.pair(x, y) : null;
    if ((pf && pf.couple) || (iy != null && Array.isArray(x.loveSet) && x.loveSet.indexOf(iy) >= 0) || ts.some(function (t) { return LOVER.test(t.type) || (t.type === 'fiance' && t.couple); })) return 'lover';
    ts.forEach(function (t) { if (!k && t.type === 'crush') k = t.a === iy && t.b === ix ? 'crush' : t.a === ix && t.b === iy ? 'crushed' : ''; });
    if (k) return k;
    return ts.some(function (t) { return FRIEND.test(t.type); }) ? 'friend' : '';
  }
  A.looksTalk = function (a, b, owner, pick) {
    owner = ownerOf(owner);
    if (!a || !b || a === b) return '';
    var who = [a, b].filter(function (x) { return A.looksOf(x).length; });
    if (!who.length) return '';
    var pk = A.racePick(pick || owner);
    var x = who.length > 1 ? pk(who) : who[0], y = x === a ? b : a, kind = talkKind(owner, x, y);
    if (!kind) return '';
    var k = A.featPick(owner, x, { kind: 'talk', pick: pk, keys: ['looks'] });
    if (!k) return '';
    var fp = owner && A.raceFresh ? A.raceFresh(owner, pk) : pk;
    mlog('talk', x, y, k, owner);
    if (owner) { var tc = owner._looksTalk || (owner._looksTalk = {}), tk = pairKey(a, b); tc[tk] = (tc[tk] || 0) + 1; }
    return fill(fp(TALK[kind]), { x: x.name, y: y.name, feat: k.slice(5) });
  };
  /* 関係の二人のふだんの出来事（エンジン型：bond／help／romance の二人の出来事、物語型：穏やかな札の二人の場面）のあとに、1 割で関係の場面を足す。
     夜・媚薬・事件・死などの出来事には足さない。足したら attr-look.js の見た目の一文は重ねない（o.look） */
  var TALK_OK = /看病|治療|娯楽|共同作業|晩酌|当番|打ち明け話|寄り添う|^関係$|休憩|協力|一行|酒の席|雑談|日常|食事|散歩|談笑|朝|昼|夕/;
  var TALK_NG = /夜|媚薬|凌辱|襲|殺|死|挿入|愛撫|口で|さわる|発情|儀式|結末|後日談|継承|証言|推理|逮捕|処刑|投票|事件|隠蔽|工作|真相|喪失|恋敵|失恋|別れ|浮気|監禁|暴走|執着|嫉妬|R18|夜這い|寸止め|絶頂|喧嘩|ケンカ|口論/;
  /* 同じ二人の関係の場面は、一回の結果の中で 2 回まで（同じ話が続かないように） */
  function pairKey(a, b) { return a.name < b.name ? a.name + '\u0001' + b.name : b.name + '\u0001' + a.name; }
  function talkFull(owner, a, b) { return !!(owner && owner._looksTalk && owner._looksTalk[pairKey(a, b)] >= 2); }
  function talkHook(owner, o, P) {
    if (!o || o.look || o.sex || o.meet || o.lewd || typeof o.text !== 'string' || o.text.length < 20 || !o.actors || o.actors.length !== 2) return;
    var acts = o.actors.map(function (x) { return typeof x === 'number' ? (P || [])[x] : x; }), a = acts[0], b = acts[1];
    if (!a || !b || a === b || !here(a) || !here(b) || (!A.looksOf(a).length && !A.looksOf(b).length)) return;
    if (P) { if (typeof o.tag !== 'string' || !TALK_OK.test(o.tag) || TALK_NG.test(o.tag) || TALK_NG.test(o.text.slice(0, 40))) return; }
    else if (!/^(?:bond|help|romance)$/.test(o.cat || '') || (o.kind || 'event') !== 'event' || TALK_NG.test((o.why || '') + o.text.slice(0, 40))) return;
    if (!talkKind(owner, a, b) || talkFull(owner, a, b) || typeof owner.rng !== 'function' || owner.rng() >= 0.1) return;
    var t = A.looksTalk(a, b, owner);
    if (t) { o.text = o.text.replace(/\s+$/, '') + t; o.look = true; }
  }
  /* tie-rel.js のふだんの場面（A.daily）：関係の二人のどちらかに目につく特徴があれば、1 割で関係の場面を足す（足したときは見た目の一文を重ねない） */
  if (A.daily && !A.daily._meet) {
    var daily0 = A.daily;
    A.daily = function (ctx, a, b, r, cat) {
      if (r && typeof r.text === 'string' && a && b && /^(?:bond|help)$/.test(r.cat || cat || '') && (A.looksOf(a).length || A.looksOf(b).length) && talkKind(ctx, a, b) && !talkFull(ctx, a, b)) {
        if (ctx.rng() < 0.1) { var t = A.looksTalk(a, b, ctx); if (t) { r.text += t; return r; } }
      }
      return daily0.apply(this, arguments);
    };
    A.daily._meet = true;
  }
})();
