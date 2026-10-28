/* 箱庭シミュレーター: 媚薬ロッカー ― 三人以上の回で、扉が開いたあとのベッド（R18版のみ。2026-10-27 担当HL）
   locker-crowd.js の groupRun が、全員が外へ出たあとに LK.crowdBed(S, lockers, how, api) を呼ぶ（全年齢版・全年齢モードでは呼ばない）。一回に一組だけ。
   ・三人のロッカー：三人とも組める三人（api.trioOk：受け攻め・恋愛対象・恋愛やR18にしない相手・R18に参加しない・性行為の相手の固定・性欲「なし」を見る）で、
     ロッカーの中で三人の場面があった（寄り添う・唇を重ねる・三人で）か、媚薬の熱が限界の三人は、倉庫の奥の仮眠室のベッドへ（3P）
   ・三人で来た回の二人のロッカー（二人＋一人）：二人の熱が残っていれば（二人のときと同じ条件）ベッドへ。残りの一人が三人とも組める三人で、熱があって乗り気なら加わる（3P）。
     そうでなければ、一人は先に倉庫を出て、二人きりで（solo-locker-bed.js の LK.bed）。ほかに恋人のいる人の二人は、二人きりのベッドへは行かない
   ・3P の形は locker-crowd.js の trioShape（oneTwo 攻め一人×受け二人／twoOne 攻め二人×受け一人／sandwich 真ん中が前を抱き、後ろから抱かれる）。
     三人ともリバを選んだ三人は、半分ほど輪（ring：{t}→{m}→{u}→{t}。三人とも抱き、抱かれる）
   ・文：誘い（待ちきれずに／おとなしかった人から／二人に加わる／口では嫌がりながら）・脱がせる・形ごとの始まり・二人ずつの最中（ins 男性の体の攻め／
     fm 女性の攻め×男性／ff 女性どうし／性器なしの人がいる組は ngOral・ngHand）・攻めの一言（態度9種）・受けの山場（態度9種）・
     男性向けの山場（形ごと、攻めが全員男性の体なら pen、ほかは soft。各3文）・果て（locker-crowd-r18.js の PCL・TCL：態度9種）・結び・翌朝（甘く／ぎこちなく／ふつう）
   登場人物はすべて成人として扱う。台詞は3本のベース「くだけた常体｜硬い常体｜敬語」（一人称は「私」、二人称は「あなた」）。体の語は印（lewd-words.js） */
(function () {
  'use strict';
  var HK = window.HK, LK = HK.LOCKER, ST = HK.Story;
  if (!LK || !ST) return;
  function L(s) { return s.split('|'); }
  var PS = ['proud', 'stern', 'tsun', 'gentle', 'devoted', 'cool', 'free', 'shy', 'polite'];
  function ps(c) { var p = c && (c.persona || (HK.personaOf && HK.personaOf(c))); return PS.indexOf(p) >= 0 ? p : 'gentle'; }
  var TB = LK.TRIO_BED = {};

  /* ---------- 誘い（{q}＝誘う人、{x}{y}＝残りの二人） ---------- */
  TB.INVITE = {
    eager: L('扉が開いた瞬間、{q}は{x}と{y}の手首を片方ずつ掴んだ。倉庫の奥に、仮眠用の大きなベッドが見えていた。「……三人とも、まだ終わってないよね｜……三人とも、まだ終わっていないだろう｜……三人とも、まだ終わっていませんよね」――誰も、首を横に振らなかった。|{q}は外の空気をひと息吸っただけで、すぐに{x}と{y}を振り返った。熱に潤んだ目が、倉庫の奥の古いベッドを指していた。{x}と{y}は顔を見合わせ、黙ってそのあとに続いた。|三人は並んでロッカーを出たが、出口へ向かう者はいなかった。{q}が{x}の腰と{y}の肩を抱き寄せ、そのまま倉庫の奥の仮眠室へ歩き出した。「待てない｜待てない｜待てません」――{q}の声は、ひどく掠れていた。'),
    quiet: L('ロッカーの中でいちばん落ち着いていたのは{q}だった。その{q}が、外へ出るなり{x}と{y}の袖を同時につまんだ。「……あそこ、ベッドがある｜……あそこに、ベッドがある｜……あそこに、ベッドがあります」――耳まで真っ赤だった。|「先に出て｜先に出ろ｜先に出てください」と出口を譲ったのは{q}だった。けれど{x}と{y}が一歩踏み出す前に、{q}は二人の手を後ろから握っていた。「……やっぱり、三人で残ろう｜……やはり、三人で残ろう｜……やっぱり、三人で残りましょう」|{q}は倉庫の奥の仮眠室の扉を開けて、二人を振り返った。何も言わなかった。言わなくても、{x}と{y}にはそれで十分だった。'),
    /* 二人（{x}{y}）がベッドへ向かい、もう一人（{q}）が加わる */
    join: L('{x}と{y}が倉庫の奥のベッドへ向かうのを、{q}は少し離れて見ていた。やがて{q}は二人に追いつき、背中に声をかけた。「……私も、いい？｜……私も、いいか？｜……私も、いいですか？」――{x}と{y}は顔を見合わせ、どちらも首を横に振らなかった。|隣のロッカーから聞こえていた声を、{q}はずっと覚えていた。ベッドに倒れ込む{x}と{y}の前で、{q}は自分のシャツのボタンに指をかけた。「一人で帰るなんて、無理｜一人で帰るなど、無理だ｜一人で帰るなんて、無理です」|ベッドの端から声をかけたのは{x}だった。「一緒に、来る？｜一緒に、来るか？｜一緒に、来ますか？」――{q}は一瞬だけ迷い、それから黙って頷いた。'),
    /* 敵対・愛憎のある三人：口では嫌がりながら */
    rough: L('「勘違いしないで。ガスのせいだから｜勘違いするな。ガスのせいだ｜勘違いしないでください。ガスのせいですから」――{q}はそう吐き捨てながら、{x}と{y}を倉庫の奥のベッドへ押しやった。誰も、本気では逆らわなかった。|外に出ても、三人は睨み合ったままだった。先に目を逸らしたのが誰だったのかは分からない。次の瞬間には、{q}が{x}の襟と{y}の手首を同時に掴み、二人を引きずるようにして倉庫の奥のベッドへ倒れ込んでいた。|「あなたたちとなんて、冗談じゃない｜あなたたちとなど、冗談ではない｜あなたたちとなんて、冗談じゃありません」――口ではそう言いながら、{q}の手は{x}と{y}の手首を離さなかった。三人の足は、出口とは反対の、仮眠室のベッドへ向かっていた。')
  };
  TB.INVITE_LB = { eager: '待ちきれずに', quiet: 'おとなしかった人から誘う', join: '二人に加わる', rough: '口では嫌がりながら' };
  /* 時間切れで扉が開いたとき（誘いの前に） */
  TB.TIMEOUT = L('ブザーが鳴り、ロッカーが一斉に開いた。時間切れだった。倉庫の奥の仮眠室には、古いけれど大きなベッドが置かれていた。|時間切れを告げる音とともに、ロックが外れた。這い出した三人の目に、倉庫の奥の仮眠用のベッドが映った。|スピーカーが「お疲れさまでした」と告げ、扉が開いた。倉庫の奥に、誰かが寝泊まりしていたらしい仮眠室があった。');
  /* 二人きりのベッドへ：残りの一人（{c}）が先に出る（{a}{b}＝ベッドへ行く二人） */
  TB.LEAVE = L('{c}は、{a}と{b}の様子に気づくと、黙って背を向けた。「……先に帰るね｜……先に帰る｜……先に帰りますね」――倉庫の扉が閉まる音を、二人はほとんど聞いていなかった。|{c}は二人の顔を見比べて、小さく肩をすくめた。「ごゆっくり｜ごゆっくり｜どうぞ、ごゆっくりなさってください」――そう言い残して、{c}は一人で倉庫を出ていった。|「外で待ってる。……いや、やっぱり帰る｜外で待っている。……いや、やはり帰る｜外で待っています。……いえ、やっぱり帰ります」――{c}はそれだけ言って、振り返らずに倉庫を出た。残された{a}と{b}の目に、奥の仮眠室のベッドが映った。');

  /* ---------- 脱がせる・形ごとの始まり（{t}{m}{u}） ---------- */
  TB.STRIP = L('ロッカーの中で乱れた服を、三人はもどかしげに脱ぎ捨てた。三人分の服が、次々と床に落ちていった。|{t}が{m}のシャツをはだけさせるあいだに、{u}は自分から服を脱ぎ捨てていた。古いベッドが、三人分の重みでぎしりと鳴った。|ロッカーの中では、満足に脱ぐこともできなかった。三人はその分を取り返すように、もどかしげに互いの服を剥ぎ取った。');
  TB.OPEN = {
    oneTwo: L('{t}は{m}と{u}を並べて仰向けにさせ、その間に膝をついた。どちらから先に、と迷うふりをして、{t}は二人の脚を交互に撫で上げた。|{t}は{m}を抱き寄せて唇を奪い、空いた手で{u}の腰を引き寄せた。{m}と{u}は、{t}の腕の中で自分の番を待ちわびた。|ベッドの真ん中に陣取ったのは{t}だった。右に{m}、左に{u}――{t}は二人の首筋に順番に口づけを落とし、どちらの吐息も逃さなかった。'),
    twoOne: L('{u}はベッドの真ん中に寝かされ、{t}と{m}に両側から挟まれた。四本の手が、{u}の肌の上を好き勝手に這い回った。|{t}が{u}の唇を塞ぐあいだに、{m}は{u}の脚のあいだへ顔を寄せた。{u}は、どちらに応えればいいのか分からないまま身をよじった。|{t}が{u}の耳元で「今度は、逃げ場がないね｜今度は、逃げ場がないな｜今度は、逃げ場がありませんね」と囁き、{m}がその反対の耳を甘く噛んだ。{u}の体から、すっかり力が抜けた。'),
    sandwich: L('{m}は{u}をベッドに押し倒し、その{m}の背中に{t}が覆いかぶさった。真ん中の{m}だけが、前と後ろの二人の熱を同時に受け止めていた。|{t}は{m}を後ろから抱きすくめ、{m}はそのまま{u}の上に体を沈めた。真ん中の{m}は、前と後ろの熱に挟まれて息を詰めた。|{u}が{m}を引き寄せ、{t}が{m}の腰を後ろから引き戻した。真ん中の{m}は、二人のあいだで逃げ場をなくした。'),
    ring: L('三人はベッドの上で輪になった。{t}は{m}に、{m}は{u}に、{u}は{t}に手を伸ばした。誰が誰を抱いているのか、すぐに分からなくなった。|{u}が「順番、決めなくていいよね｜順番は、決めなくていいな｜順番、決めなくていいですよね」と笑うと、{t}と{m}も笑った。三人は互いに抱き、抱かれる形で、輪のように繋がっていった。|三人とも、抱く側にも抱かれる側にも回れた。だから誰も遠慮しなかった。{t}が{m}を、{m}が{u}を、{u}が{t}を――三人の体は、ひとつの輪になった。')
  };

  /* ---------- 二人ずつの最中（{a}＝攻め {b}＝受け {c}＝残りの一人） ---------- */
  TB.TP = {
    ins: L('{a}は{b}の脚を抱え上げ、{c}の見ている前で、ゆっくりと奥まで沈めた。{b}は{c}の視線を感じて、喉を反らした。|{a}が腰を打ちつけるたびに、古いベッドが軋んだ。{b}の上げる声に、すぐそばの{c}の吐息が重なった。|{a}は{b}をうつ伏せにさせ、後ろから深く繋がった。顔を上げた{b}の目の前で、{c}が息を詰めてそれを見ていた。'),
    fm: L('{a}は{b}の腰に跨り、{b}の{男性器}を自分の{ナカ}へ導いた。{a}がゆっくりと腰を沈めるのを、{c}がすぐそばで見つめていた。|{a}は{b}の上で腰をくねらせ、根元まで呑み込んだまま動きを止めた。{b}が息を詰めるのを、{c}がすぐそばで見下ろしていた。|{a}は{b}の胸に両手をついて、自分の好きな深さで腰を落とした。{c}が「……すごい顔してる｜……すごい顔をしているな｜……すごい顔、していますね」と囁くと、{b}は腕で顔を隠した。'),
    ff: L('{a}は{b}の脚のあいだに指を沈め、{c}の目の前でゆっくりとかき回した。{b}は{c}の視線から逃げるように、シーツに顔を埋めた。|{a}は{b}の{胸}に唇を寄せながら、濡れた{女性器}を指の腹でなぞった。{b}の腰が浮くたびに、{c}が小さく息を呑んだ。|{a}は{b}と脚を絡め、熱いところどうしを擦り合わせた。{c}の熱っぽい視線に気づいて、{b}はいっそう声を上げた。'),
    /* 性器なしの人がいる組（pos-nogen.js）：受けが性器なし＝受けは口まで／攻めが性器なし＝指と玩具だけ */
    ngOral: L('{b}は{a}の脚のあいだに顔を埋め、唇と舌で熱心に奉仕した。{c}は、その様子をすぐそばで見ていた。|{a}は{b}の頬を両手で包み、その口に自分の熱を委ねた。{b}は喉を鳴らして応え、{c}の視線にも気づかなかった。|{b}の唇が、{a}の一番熱いところをゆっくりと包み込んだ。{a}が息を詰めるのを、{c}が熱っぽい目で見つめていた。'),
    ngHand: L('{a}は指を絡めるようにして、{b}の一番弱いところを探り当てた。{b}が声を上げるたびに、{c}が小さく息を呑んだ。|{a}はベッドの脇の引き出しから玩具を見つけ出し、{b}の体にそっと押し当てた。{b}の腰が跳ねるのを、{c}が目を丸くして見ていた。|{a}の指が、{b}の熱いところをゆっくりと、何度も往復した。{c}が「……声、我慢しなくていいのに｜……声は、我慢しなくていいのに｜……声、我慢しなくていいのに」と言うと、{b}はシーツを噛んだ。')
  };

  /* ---------- 攻めの一言（態度9種。{a}＝攻め） ---------- */
  TB.TOP = {
    proud: L('{a}「二人まとめて、相手してあげる｜二人まとめて、相手をしてやる｜お二人まとめて、お相手しますよ」|{a}「どっちが先にねだるか、見ものだね｜どちらが先にねだるか、見ものだな｜どちらが先にねだるか、見ものですね」|{a}「逃げられると思わないで｜逃げられると思うな｜逃げられると思わないでください」'),
    stern: L('{a}「……二人とも、力を抜いて｜……二人とも、力を抜け｜……お二人とも、力を抜いてください」|{a}「痛かったら、すぐに言って｜痛ければ、すぐに言え｜痛かったら、すぐに言ってください」|{a}「順番は守る。……守れたら、だけど｜順番は守る。……守れたら、の話だが｜順番は守ります。……守れたら、ですが」'),
    tsun: L('{a}「か、勘違いしないで。二人とも放っておけないだけだから｜か、勘違いするな。二人とも放っておけないだけだ｜か、勘違いしないでください。お二人とも放っておけないだけですから」|{a}「べ、別に、三人がよかったわけじゃないし｜べ、別に、三人がよかったわけではない｜べ、別に、三人がよかったわけじゃありません」|{a}「……そんな顔、二人して見せないでよ｜……そんな顔を、二人して見せるな｜……そんな顔、お二人して見せないでください」'),
    gentle: L('{a}「大丈夫。二人とも、ちゃんと可愛がるから｜大丈夫だ。二人とも、きちんと可愛がる｜大丈夫です。お二人とも、ちゃんと可愛がりますから」|{a}「二人とも、すごく綺麗｜二人とも、とても綺麗だ｜お二人とも、とても綺麗です」|{a}「ゆっくりでいいよ。夜は長いから｜ゆっくりでいい。夜は長い｜ゆっくりでいいですよ。夜は長いですから」'),
    devoted: L('{a}「二人とも、私が全部満たしてあげる｜二人とも、私が全部満たしてやる｜お二人とも、私が全部満たして差し上げます」|{a}「どっちも、大事にしたい｜どちらも、大事にしたい｜どちらも、大事にしたいんです」|{a}「……もっと、私を欲しがって｜……もっと、私を欲しがれ｜……もっと、私を欲しがってください」'),
    cool: L('{a}「二人同時なら、効率がいい｜＝｜お二人同時なら、効率がいいですね」|{a}「反応の違いを、比べてみたい｜＝｜反応の違いを、比べてみたいですね」|{a}「声、我慢しなくていい。ここなら誰も来ない｜声は、我慢しなくていい。ここなら誰も来ない｜声、我慢しなくていいですよ。ここなら誰も来ません」'),
    free: L('{a}「三人とか、最高じゃん！｜三人とは、最高だな！｜三人なんて、最高ですね！」|{a}「ほら、二人ともこっち来て｜ほら、二人ともこっちに来い｜ほら、お二人ともこっちに来てください」|{a}「朝まで、いっぱい遊ぼうね｜朝まで、たっぷり遊ぼう｜朝まで、いっぱい遊びましょうね」'),
    shy: L('{a}「さ、三人って、どうすればいいのか分からないけど……っ｜さ、三人というのは、どうすればいいのか分からないが……っ｜さ、三人って、どうすればいいのか分かりませんけど……っ」|{a}「い、痛くない……？｜い、痛くないか……？｜い、痛くないですか……？」|{a}「そ、そんなに見られたら、恥ずかしい……｜そ、そんなに見られると、恥ずかしい……｜そ、そんなに見られたら、恥ずかしいです……」'),
    polite: L('{a}「じゃあ、二人とも、失礼するね｜では、二人とも、失礼する｜では、お二人とも、失礼いたします」|{a}「辛くなったら、すぐに教えて｜辛くなったら、すぐに教えろ｜お辛くなったら、すぐにお教えください」|{a}「無理はしないでね｜無理はするな｜どうか、ご無理はなさらずに」')
  };

  /* 攻めの一言（相手が一人のとき：twoOne・sandwich・輪。態度9種。{a}＝攻め） */
  TB.TOP1 = {
    proud: L('{a}「もっと、ねだってみて｜もっと、ねだってみろ｜もっと、ねだってみてください」|{a}「逃がさないから｜逃がさない｜逃がしませんよ」|{a}「声、聞かせて｜声を、聞かせろ｜声、聞かせてください」'),
    stern: L('{a}「……力を抜いて｜……力を抜け｜……力を抜いてください」|{a}「痛かったら、すぐに言って｜痛ければ、すぐに言え｜痛かったら、すぐに言ってください」|{a}「……もう、止められない｜＝｜……もう、止められません」'),
    tsun: L('{a}「か、勘違いしないで。放っておけないだけだから｜か、勘違いするな。放っておけないだけだ｜か、勘違いしないでください。放っておけないだけですから」|{a}「べ、別に、あなたがいいわけじゃないし｜べ、別に、あなたがいいわけではない｜べ、別に、あなたがいいわけじゃありません」|{a}「……そんな顔、見せないでよ｜……そんな顔を、見せるな｜……そんな顔、見せないでください」'),
    gentle: L('{a}「大丈夫。ちゃんと可愛がるから｜大丈夫だ。きちんと可愛がる｜大丈夫です。ちゃんと可愛がりますから」|{a}「すごく綺麗｜とても綺麗だ｜とても綺麗です」|{a}「ゆっくりでいいよ。夜は長いから｜ゆっくりでいい。夜は長い｜ゆっくりでいいですよ。夜は長いですから」'),
    devoted: L('{a}「私が全部満たしてあげる｜私が全部満たしてやる｜私が全部満たして差し上げます」|{a}「大事にしたい｜＝｜大事にしたいんです」|{a}「……もっと、私を欲しがって｜……もっと、私を欲しがれ｜……もっと、私を欲しがってください」'),
    cool: L('{a}「二人がかりなら、すぐ崩れるね｜二人がかりなら、すぐに崩れるな｜二人がかりなら、すぐに崩れますね」|{a}「反応が、さっきより正直になった｜＝｜反応が、さっきより正直になりましたね」|{a}「声、我慢しなくていい。ここなら誰も来ない｜声は、我慢しなくていい。ここなら誰も来ない｜声、我慢しなくていいですよ。ここなら誰も来ません」'),
    free: L('{a}「三人とか、最高じゃん！｜三人とは、最高だな！｜三人なんて、最高ですね！」|{a}「ほら、もっとこっち来て｜ほら、もっとこっちに来い｜ほら、もっとこっちに来てください」|{a}「朝まで、いっぱい遊ぼうね｜朝まで、たっぷり遊ぼう｜朝まで、いっぱい遊びましょうね」'),
    shy: L('{a}「さ、三人って、どうすればいいのか分からないけど……っ｜さ、三人というのは、どうすればいいのか分からないが……っ｜さ、三人って、どうすればいいのか分かりませんけど……っ」|{a}「い、痛くない……？｜い、痛くないか……？｜い、痛くないですか……？」|{a}「そ、そんなに見られたら、恥ずかしい……｜そ、そんなに見られると、恥ずかしい……｜そ、そんなに見られたら、恥ずかしいです……」'),
    polite: L('{a}「じゃあ、失礼するね｜では、失礼する｜では、失礼いたします」|{a}「辛くなったら、すぐに教えて｜辛くなったら、すぐに教えろ｜お辛くなったら、すぐにお教えください」|{a}「無理はしないでね｜無理はするな｜どうか、ご無理はなさらずに」')
  };

  /* ---------- 受けの山場（態度9種。{a}＝二人から求められる受け、{b}{c}＝その二人） ---------- */
  TB.HL = {
    proud: L('「調子に、乗らないで……っ｜調子に、乗るな……っ｜調子に、乗らないでください……っ」――{a}は{b}を睨みつけようとしたが、{c}に耳を噛まれて、言葉が甘く崩れた。|{a}は最後まで主導権を手放すまいとしていた。けれど二人がかりで責められて、強がりはすぐに喘ぎに変わった。|「二人がかりなんて、卑怯……っ｜二人がかりとは、卑怯だ……っ｜二人がかりなんて、卑怯です……っ」――{a}の悪態は、途中から自分でも何を言っているのか分からなくなった。'),
    stern: L('{a}は唇を固く結び、声を漏らすまいと耐えていた。けれど{b}と{c}に同時に触れられた瞬間、堪えていたものが一気に崩れた。|「……っ、二人とも、待って｜……っ、二人とも、待て｜……っ、お二人とも、待ってください」――{a}の制止は、誰にも聞き入れられなかった。|{a}はシーツを握りしめ、乱れた呼吸を整えようとした。整える暇など、二人は与えてくれなかった。'),
    tsun: L('「べ、別に、三人がいいなんて言ってない……っ｜べ、別に、三人がいいなどとは言っていない……っ｜べ、別に、三人がいいなんて言ってません……っ」――言い終わる前に、{a}の声は甘く裏返った。|{a}は真っ赤な顔をそむけたまま、{b}と{c}の手を振り払おうとした。振り払ったはずの手を、気づけば自分から握り返していた。|「見ないで、ってば……っ｜見るな、と言っている……っ｜見ないでください、ってば……っ」――{a}は顔を枕に埋めたが、隠しきれない声が二人の耳に届いていた。'),
    gentle: L('{a}は{b}と{c}の髪を両手で撫でながら、とろけた声をこぼした。「……二人とも、欲張りだね｜……二人とも、欲張りだな｜……お二人とも、欲張りですね」|{a}は二人分の熱を、まるごと受け止めるように腕を広げた。幸せそうな吐息が、何度も漏れた。|{a}は、{b}にも{c}にも同じだけ応えようとした。そのやさしさのせいで、{a}がいちばん先に追いつめられていった。'),
    devoted: L('「全部、受け止めるから……っ｜全部、受け止める……っ｜全部、受け止めますから……っ」――{a}は二人にすがりつき、求められるままに体を委ねた。|{a}は{b}の名前を呼び、すぐに{c}の名前も呼んだ。どちらの名前を呼ぶ声も、同じくらい切実だった。|{a}の目尻から、涙がひと粒こぼれた。苦しいのではなかった。二人に同時に求められることが、嬉しくてたまらなかった。'),
    cool: L('{a}は最初こそ冷静に二人を観察していた。けれど{b}と{c}の手が同時に弱いところに触れた瞬間、その表情があっけなく崩れた。|「……っ、計算外……｜＝｜……っ、計算外です……」――{a}の声は、自分でも驚くほど震えていた。|{a}はいつもの淡々とした顔を保とうとした。保とうとするほど、二人は面白がって{a}を責め立てた。'),
    free: L('「やば、二人同時とか、無理……っ！｜まずい、二人同時は、無理だ……っ！｜まずいです、二人同時なんて、無理……っ！」――{a}は笑うように声を上げ、それから本気で喘ぎ始めた。|{a}は遠慮なく声を上げ、{b}と{c}を交互に引き寄せた。三人の中で、いちばん楽しそうだった。|「もっと、二人とも、もっと……っ｜もっとだ、二人とも、もっと……っ｜もっと、お二人とも、もっと……っ」――{a}のねだる声に、二人はさらに熱を上げた。'),
    shy: L('{a}は両手で顔を覆ったまま、二人の熱に震えていた。指の隙間から漏れる声は、消え入りそうに小さかった。|「ふ、二人とも、見ないで……っ｜ふ、二人とも、見るな……っ｜ふ、お二人とも、見ないでください……っ」――{a}は耳まで真っ赤にして、シーツに顔を埋めた。|{a}は恥ずかしさで泣きそうになりながら、それでも二人の手を離さなかった。'),
    polite: L('「……っ、二人とも、そんなに、されたら……っ｜……っ、二人とも、そんなにされては……っ｜……っ、お二人とも、そんなに、されたら……っ」――{a}の丁寧な言葉は、途中で甘く途切れた。|{a}は最後まで行儀よく振る舞おうとした。二人がかりで乱されて、そのたしなみはすっかりほどけてしまった。|「ごめん……っ、もう……｜すまない……っ、もう……｜申し訳、ありません……っ、もう……」――{a}は二人に詫びるように、震える声をこぼした。')
  };

  /* ---------- 男性向けの山場（{mt1}{mm1}{mu1} など＝その役の人の喘ぎ。{s:…}＝擬音）。pen＝攻めが全員男性の体のとき、soft＝それ以外（指・舌・唇で） ---------- */
  TB.ERO = {
    pen: {
      oneTwo: L('{t}は{m}の奥を突き上げてから引き抜き、そのまま隣の{u}の{ナカ}へ沈めた。{s:hit}。{m}「{mm1}」{u}「{mu1}」――待たされたほうも突かれているほうも、同じくらい蕩けた声を上げた。|{t}は{m}と{u}を並べて四つん這いにさせ、交互に根元まで繋がった。{s:hit}。{u}「{mu2}」――抜かれるたびにねだるように腰を揺らす二人を、{t}は満足げに見下ろした。|{t}が{m}の腰を掴んで打ちつけるあいだ、{u}は自分から{t}の背中にすがりついて、次の番をねだった。{s:hit}。{m}「{mm2}」――ベッドが壊れそうなほど軋んだ。'),
      twoOne: L('{t}が後ろから{u}を突き上げるたび、{u}の体が前の{m}へ押し出された。{s:hit}。{u}「{mu1}」――前と後ろから同時に求められて、{u}の頭は真っ白になった。|{t}と{m}は、{u}を挟んで交互に腰を打ちつけた。{s:hit}。{u}「{mu2}」――片方が抜けば、もう片方がすぐに奥を埋めた。{u}に休む間はなかった。|{u}は{t}の上に跨らされ、下から深く突き上げられた。{s:hit}。{u}「{mu1}」――{t}が果てると、今度は{m}が後ろから{u}の奥を埋めた。{u}は二人のあいだで何度も果てた。'),
      sandwich: L('{m}が{u}の奥へ沈むのと同時に、{t}が{m}を後ろから貫いた。{s:hit}。{m}「{mm1}」{u}「{mu1}」――一突きごとに、三人分の体が一つの波のように揺れた。|{t}が腰を打ちつけるたび、その勢いのまま{m}が{u}を突き上げた。{s:hit}。{m}「{mm2}」――前と後ろの熱に挟まれて、真ん中の{m}の声はもう言葉になっていなかった。|{t}に後ろから揺さぶられながら、{m}は{u}の奥を夢中で穿った。{s:hit}。{u}「{mu1}」{m}「{mm1}」――三人の汗が混ざり合い、シーツをぐっしょりと濡らした。'),
      ring: L('{t}が{m}を、{m}が{u}を、{u}が{t}を――三人は輪のように繋がったまま、互いの腰を揺らした。{s:hit}。{t}「{mt1}」{m}「{mm1}」{u}「{mu1}」――誰の声なのか、もう誰にも聞き分けられなかった。|一人が突けば、その勢いが輪を伝って次の一人へ返ってきた。{s:hit}。{m}「{mm2}」――抱く熱と抱かれる熱が、三人の体の中をぐるぐると巡った。|三人は繋がる相手を何度も入れ替えながら、果てても果てても求め合った。{s:hit}。{u}「{mu2}」――媚薬の熱は、まだ少しも引いていなかった。')
    },
    soft: {
      oneTwo: L('{t}は{m}と{u}を並べて寝かせ、指と舌で二人を交互に責め立てた。{s:wet}。{m}「{mm1}」{u}「{mu1}」――二人分の甘い声が、仮眠室の天井に跳ね返った。|{t}の片手が{m}の脚のあいだを、もう片方の手が{u}の脚のあいだを、同じ速さでかき回した。{s:wet}。{m}「{mm2}」――どちらが先に崩れるかを、{t}は楽しむように見比べていた。|{t}は{u}の{乳首}を舌で転がしながら、{m}の奥を指で探った。{s:suck}。{u}「{mu1}」{m}「{mm1}」――{m}と{u}は、それぞれシーツを握りしめて耐えた。'),
      twoOne: L('{t}は{u}の脚のあいだに顔を埋め、{m}は{u}の{胸}に吸いついた。{s:suck}。{u}「{mu2}」――上と下を同時に責められて、{u}は声を殺すことも忘れた。|{t}の指が{u}の奥を探るあいだ、{m}の舌が{u}の首筋から胸へと降りていった。{s:wet}。{u}「{mu1}」――二人がかりの愛撫に、{u}の膝はもう閉じられなかった。|{t}と{m}は、{u}の体を左右から挟んで、指を交互に沈めた。{s:wet}。{u}「{mu1}」――どちらの指なのかも分からないまま、{u}は何度も腰を跳ねさせた。'),
      sandwich: L('{t}の指が後ろから{m}を責めるのに合わせて、{m}の指が{u}の奥を探った。{s:wet}。{m}「{mm1}」{u}「{mu1}」――一列に重なった三人の体が、同じ波で揺れた。|{t}に耳を食まれながら、{m}は{u}の{胸}に舌を這わせた。{s:suck}。{m}「{mm1}」――責められる熱と責める熱が、真ん中の{m}の中でひとつに混ざった。|{m}が{u}の脚のあいだに指を沈めるたび、後ろの{t}が{m}の腰を引き寄せて同じ深さを返した。{s:wet}。{u}「{mu1}」{m}「{mm2}」――前と後ろの熱に挟まれて、{m}の声はもう言葉になっていなかった。'),
      ring: L('三人は輪になって、互いの一番熱いところに指を伸ばした。{s:wet}。{t}「{mt1}」{m}「{mm1}」{u}「{mu1}」――責めているのか責められているのか、三人とももう分からなかった。|{t}の舌が{m}を、{m}の指が{u}を、{u}の唇が{t}を――三人の愛撫は、途切れることなく輪を巡った。{s:wet}。{m}「{mm2}」――誰かが震えれば、その震えがすぐに隣へ伝わった。|三人は抱く側と抱かれる側を何度も入れ替えながら、互いの体を貪った。{s:suck}。{u}「{mu2}」――媚薬の熱は、まだ少しも引いていなかった。')
    }
  };

  /* ---------- 結び・翌朝・ぼかす ---------- */
  TB.CL = L('最後に誰が果てたのか、三人とも覚えていなかった。乱れたシーツの上で、三人分の荒い息だけが重なっていた。|一人が達すると、その震えが隣の二人に伝わって、三人はほとんど続けざまに果てた。古いベッドが、最後にひときわ大きく軋んだ。|三人は名前を呼びながら、ばらばらに、けれど同じ場所で果てた。三人分の荒い息は、しばらく整わなかった。');
  TB.MORNING = {
    sweet: L('朝、目を覚ますと、三人は一枚の毛布にくるまっていた。真ん中の{h}が、両側の手を握ったまま眠っていた。|{u}が「……三人だけの秘密、だね｜……三人だけの秘密、だな｜……三人だけの秘密、ですね」と囁くと、{t}と{m}は照れくさそうに頷いた。窓の外は、もう明るかった。|倉庫を出たのは、すっかり日が昇ってからだった。三人は並んで歩きながら、ときどき顔を見合わせて笑った。'),
    rough: L('朝になると、三人は互いに目を合わせようとしなかった。誰かが「……ガスのせいだから｜……ガスのせいだ｜……ガスのせいですから」と言い、誰も否定しなかった。|{t}は乱れた服を乱暴に直し、{m}と{u}に背を向けた。「今夜のことは、忘れて｜今夜のことは、忘れろ｜今夜のことは、忘れてください」――その耳は、赤いままだった。|三人は口をきかないまま倉庫を出た。それでも分かれ道まで、誰も一人で先に行こうとはしなかった。'),
    plain: L('朝の光の中で、三人はしばらく天井を見上げていた。誰かが「……すごかった｜……すごかったな｜……すごかったです」と言って、三人で吹き出した。|三人とも、服を探すのが面倒になって、しばらく裸のまま寝転がっていた。甘い匂いは、もうどこにも残っていなかった。|{u}は二人の寝息を聞きながら、そっと目を閉じた。ロッカーに閉じ込められたことが、少しだけ、悪くない夜に思えた。')
  };
  TB.MORNING_LB = { sweet: '翌朝、三人だけの秘密に', rough: '翌朝、ガスのせいにした', plain: '翌朝、三人で笑った' };
  TB.FADE = L('――そこから先は、三人だけの秘密になった。|――仮眠室の明かりが消えたあとのことは、三人だけが知っている。|――その夜のことを、三人は誰にも話していない。');

  /* 二人きりのベッド（LK.bed）に渡す関係（solo-locker.js と同じ寄せ方） */
  var REL = { lover: 'lover', mate: 'lover', fated: 'lover', fwb: 'fwb', master: 'master', crush: 'crush', friend: 'friend', best: 'friend', childhood: 'friend', buddy: 'friend', senpai: 'friend', colleague: 'colleague', classmate: 'classmate', boss: 'boss', worship: 'worship', fond: 'friend', blind: 'worship', benefactor: 'benefactor', relative: 'relative', acq: 'friend', almost: 'almost', rival: 'tension', bad: 'tension', enemy: 'tension', ex: 'ex', sibling: 'friend' };
  var REL_LABEL = { lover: '恋人', fwb: 'セフレ', master: '主従', crush: '片想い', mutual: '両片想い', friend: '知り合い', almost: '友達以上恋人未満', tension: '険悪', ex: '元恋人', stranger: '初対面', colleague: '同僚', classmate: '同級生', boss: '上司と部下', worship: '執着（信仰）', benefactor: '恩人', relative: '親族' };
  var PRIO = ['mate', 'fated', 'lover', 'master', 'worship', 'blind', 'fwb', 'ex', 'crush', 'yan', 'almost', 'best', 'buddy', 'childhood', 'rival', 'enemy', 'bad'];

  function pick(S, arr) { return LK.pick ? LK.pick(S, arr) : ST.pick(S, arr); }
  function avg(m) { return m.reduce(function (s, p) { return s + p.m.heat; }, 0) / m.length; }
  function pairsOf(m) { return [[m[0], m[1]], [m[0], m[2]], [m[1], m[2]]]; }
  /* ほかに恋人（恋人・番・運命の番）のいる人がいる二人（二人きりのベッドへは行かない） */
  function loyalOut(S, api, a, b) { return S.P.some(function (q) { return q !== a && q !== b && [a, b].some(function (c) { return api.tiesOf(S, c, q).some(function (t) { return /^(lover|mate|fated)$/.test(t.type); }) && api.okLove(c, q); }); }); }
  function hostileIn(S, api, m) { return pairsOf(m).some(function (pr) { return api.tiesOf(S, pr[0], pr[1]).some(function (t) { return /^(rival|enemy|bad)$/.test(t.type); }); }); }
  function lhIn(S, api, m) { return pairsOf(m).some(function (pr) { return api.lhHas(S, pr[0], pr[1]) || api.lhHas(S, pr[1], pr[0]); }); }
  function sweetIn(S, api, m) { return pairsOf(m).some(function (pr) { return api.tiesOf(S, pr[0], pr[1]).some(function (t) { return /^(lover|mate|fated|almost|crush)$/.test(t.type); }) || api.interest(S, pr[0], pr[1]); }); }
  /* 扉が開いたあとの喘ぎ（声を殺さなくてよい場面。solo-locker.js の moan(p, top, true) と同じ） */
  function moan(S, p, top) {
    if (S.lew === 'low') return '';
    if (S.eroOn && HK.Ero) { var d0 = p.eroDom; p.eroDom = !!top; var m = HK.Ero.moan(S, p, top ? 1 : 2); p.eroDom = d0; return p.name + '「' + m + '」'; }
    var V = HK.Voice, T = LK.TOPV && LK.TOPV.moan, mode = 'ins';
    var l = top ? (T && T[mode] && (T[mode][p.persona] || T[mode].gentle)) : V && V.CLIMAX && (V.CLIMAX[p.persona] || V.CLIMAX.gentle);
    if (HK.Moan && HK.Moan.say) { var mv = HK.Moan.say(S, p, top ? 'top' : 'climax', { hush: false, novel: true, top: null }, l && l.length ? l : null); return mv ? p.name + '「' + mv + '」' : ''; }
    return l && l.length ? p.name + '「' + pick(S, l) + '」' : '';
  }
  /* 果てる文（locker-crowd-r18.js の PCL・TCL：態度9種）。ベッドの場面なので、ロッカー・壁・狭い箱の文は外す（全部外れたら元のまま） */
  var NOTBED = /ロッカー|壁|狭い|箱/;
  function climaxBy(S, api, p, partner, top) {
    var R = LK.CROWD_R18, T = R && (top ? R.TCL : R.PCL), l = T && (T[p.persona] || T.gentle);
    if (!l) return api.climaxBy(S, p, partner, top);
    var f = l.filter(function (x) { return !NOTBED.test(x); });
    return ST.fmt(pick(S, f.length ? f : l), { a: p.name, b: partner ? partner.name : '' });
  }
  /* 二人ずつの最中の文の組（性器なしの人がいる組は口・指と玩具） */
  function tpKey(api, a, b) {
    if (HK.NoGen && HK.NoGen.on && HK.NoGen.on(a, b)) return HK.NoGen.kind(a, b) === 'hand' ? 'ngHand' : 'ngOral';
    return api.modeOf(a, b);
  }

  /* ---------- 三人のベッド ---------- */
  function trioBed(S, api, sp, kind, how, q) {
    var rng = S.rng, m3 = [sp.t, sp.m, sp.u], vv = { t: sp.t.name, m: sp.m.name, u: sp.u.name, h: (sp.h || sp.m).name }, labels = [TB.INVITE_LB[kind]];
    var xy = m3.filter(function (c) { return c !== q; });
    var t1 = (how === 'timeout' ? pick(S, TB.TIMEOUT) : '') + ST.fmt(pick(S, TB.INVITE[kind]), { q: q.name, x: xy[0].name, y: xy[1].name });
    var shapeLb = { oneTwo: sp.t.name + 'が二人を', twoOne: sp.t.name + 'と' + sp.m.name + 'が' + sp.u.name + 'を', sandwich: sp.t.name + '→' + sp.m.name + '→' + sp.u.name, ring: '輪（' + sp.t.name + '→' + sp.m.name + '→' + sp.u.name + '→' + sp.t.name + '）' }[sp.p];
    var whyBase = '三人の場面：' + (sp.hub ? (sp.h || sp.m).name + 'が二人の両方と体の関係になれる組だった（中心のある三人：直接の行為ができる組は二つで、残りの二人は同じ場にいても触れ合わない）' : '三人とも、受け攻め・恋愛対象・縛りの合う組だった') + '（受け攻め：' + shapeLb + '）';
    var o1 = ST.say(S, { actors: m3, tag: '三人でベッドへ', text: t1, why: { eager: q.name + 'が待ちきれなかった', quiet: 'ロッカーの中でいちばん落ち着いていた' + q.name + 'から誘った', join: xy[0].name + 'と' + xy[1].name + 'がベッドへ向かい、別のロッカーだった' + q.name + 'が加わった', rough: '敵対していた三人だが、媚薬の熱には逆らえなかった（口では嫌がりながら）' }[kind] + '／発情 ' + m3.map(function (p) { return Math.round(p.m.heat); }).join('・'), mag: 40 });
    ST.key(S, o1, '三人でベッドへ');
    if (S.lew === 'low') {
      ST.say(S, { actors: m3, tag: '三人の夜', text: pick(S, TB.FADE), why: whyBase, mag: 45, kind: 'climax' });
      m3.forEach(function (p) { api.bumpClimax(p); });
      return labels;
    }
    /* 脱がせる→形ごとの始まり→二人ずつの最中（攻めの一言を一つ）→受けの山場 */
    var prs = sp.p === 'oneTwo' ? [[sp.t, sp.m, sp.u], [sp.t, sp.u, sp.m]] : sp.p === 'twoOne' ? [[sp.t, sp.u, sp.m], [sp.m, sp.u, sp.t]] : sp.p === 'sandwich' ? [[sp.t, sp.m, sp.u], [sp.m, sp.u, sp.t]] : [[sp.t, sp.m, sp.u], [sp.m, sp.u, sp.t], [sp.u, sp.t, sp.m]];
    /* 三人の場面の組み立て（trio-talk-r18.js の HK.Trio3。2026-10-28 担当JC）：段ごとに文を置き、攻め→受け→もう一人の台詞の応酬・擬音（男性向け）・
       誰の体がどうなっているかの一文を足して、描写の長さに合わせて文の量をそろえる。記録は今までどおり「三人の夜」（前戯〜最中）と「三人の絶頂」（山場・事後）に分ける */
    var hub0 = sp.hub ? (sp.h || sp.m) : null;
    var T3 = HK.Trio3 && !HK.SAFE_ON ? HK.Trio3.begin(S, sp, { env: S.env, ero: !!S.eroOn, apart: hub0 ? [m3.filter(function (c) { return c !== hub0; })] : [], first: true }) : null;
    var t2 = '', t3 = '', put = function (st, t, pri) { if (!t) return; if (T3) T3.add(st, t, pri); else if (st === 'peak' || st === 'after') t3 += t; else t2 += t; };
    /* 描写の長さが「短く」なら、始まり・二人ずつの最中・二人目からの果てる文も削ってよい文にする */
    var sh3 = !!(T3 && T3.len === 'short');
    put('fore', ST.fmt(pick(S, TB.STRIP), vv), sh3 ? 3 : 2);
    put('fore', ST.fmt(pick(S, TB.OPEN[sp.p]), vv), sh3 ? 2 : 1);
    var used = {};
    prs.forEach(function (z, i) {
      var k = tpKey(api, z[0], z[1]), pool = TB.TP[k].filter(function (l) { return !used[l]; }), l = pick(S, pool.length ? pool : TB.TP[k]);
      used[l] = 1;
      put(i ? 'mid' : 'in', ST.fmt(l, { a: z[0].name, b: z[1].name, c: z[2].name }), i === 0 && !sh3 ? 1 : i <= 1 ? 2 : 3);
      if (i === 0) put('in', ST.fmt(pick(S, (sp.p === 'oneTwo' ? TB.TOP : TB.TOP1)[ps(z[0])]), { a: z[0].name }), 3);
    });
    /* 受けの山場（態度9種）：二人から同時に求められる人（twoOne の {u}・sandwich の {m}・三人とも組める oneTwo と輪はどちらか） */
    var hr = sp.p === 'twoOne' ? sp.u : sp.p === 'sandwich' ? sp.m : sp.p === 'ring' ? rng.pick(m3) : !sp.hub ? rng.pick([sp.m, sp.u]) : null;
    if (hr) { var hb = m3.filter(function (c) { return c !== hr; }); put('mid', ST.fmt(pick(S, TB.HL[ps(hr)]), { a: hr.name, b: hb[0].name, c: hb[1].name }), 2); }
    /* 男性向けの山場（形ごと。攻めが全員男性の体なら pen） */
    if (S.eroOn && HK.ThickEro && HK.ThickEro.trioFill) {
      var tops = sp.p === 'oneTwo' ? [sp.t] : sp.p === 'ring' ? m3 : [sp.t, sp.m];
      var ngAny = !!(HK.NoGen && HK.NoGen.on && prs.some(function (z) { return HK.NoGen.on(z[0], z[1]); }));
      var pen = !ngAny && tops.every(function (c) { return !api.isF(c); });
      put('mid', HK.ThickEro.trioFill(S, ST.fmt(pick(S, TB.ERO[pen ? 'pen' : 'soft'][sp.p]), vv), { t: sp.t, m: sp.m, u: sp.u }), 2);
    }
    /* 果てる：受ける人から順に（攻めは最後）。輪は三人とも受ける側として */
    var recv = sp.p === 'oneTwo' ? [[sp.m, sp.t], [sp.u, sp.t]] : sp.p === 'twoOne' ? [[sp.u, sp.t]] : sp.p === 'sandwich' ? [[sp.u, sp.m], [sp.m, sp.t]] : [[sp.m, sp.t], [sp.u, sp.m], [sp.t, sp.u]];
    var tops2 = sp.p === 'oneTwo' ? [[sp.t, sp.m]] : sp.p === 'twoOne' ? [[sp.t, sp.u], [sp.m, sp.u]] : sp.p === 'sandwich' ? [[sp.t, sp.m]] : [];
    recv.forEach(function (z, zi) { put('peak', moan(S, z[0], false) + climaxBy(S, api, z[0], z[1], false), zi && sh3 ? 2 : 1); api.bumpClimax(z[0]); });
    tops2.forEach(function (z) { put('peak', moan(S, z[0], true) + climaxBy(S, api, z[0], z[1], true), sh3 ? 3 : T3 && T3.len === 'mix' ? 2 : 1); api.bumpClimax(z[0]); });
    put('after', pick(S, TB.CL), 2);
    if (T3) { var o3 = T3.render(); t2 = o3.fore + o3.in + o3.mid; t3 = o3.peak + o3.after; }
    ST.say(S, { actors: m3, tag: '三人の夜', text: t2, why: whyBase + '・仮眠室のベッドで', mag: 46, kind: 'climax' });
    labels.push({ oneTwo: '攻め一人が二人を', twoOne: '攻め二人が一人を', sandwich: '真ん中を挟んで', ring: '輪になって' }[sp.p]);
    ST.say(S, { actors: m3, tag: '三人の絶頂', text: t3, why: '媚薬が切れるまで、三人は仮眠室を出なかった', mag: 46, kind: 'climax' });
    /* 一夜のうちに、もう一、二度ずつ */
    m3.forEach(function (p) { p.cnt.climax += 1 + rng.int(2); });
    var tone = hostileIn(S, api, m3) || lhIn(S, api, m3) ? 'rough' : sweetIn(S, api, m3) ? 'sweet' : rng() < 0.5 ? 'sweet' : 'plain';
    ST.say(S, { actors: m3, tag: '翌朝（三人）', text: ST.fmt(pick(S, TB.MORNING[tone]), vv), why: tone === 'sweet' && !sweetIn(S, api, m3) ? '三人とも、悪くない朝を迎えた' : { sweet: '三人とも、互いに惹かれ合っていた', rough: '敵対・愛憎のある三人だった', plain: '三人とも、悪くない夜だったと思っていた' }[tone], mag: 30 });
    labels.push(TB.MORNING_LB[tone]);
    return labels;
  }

  /* ---------- 二人きりのベッド（三人で来た回で、三人にならないとき。{c}＝先に出る一人） ---------- */
  function pairBed(S, api, Lk, AB, how, c) {
    var rng = S.rng, A = AB[0], B = AB[1], x = A.cnt.make >= B.cnt.make ? A : B, y = x === A ? B : A;
    if (HK.Pos && HK.Pos.order(x, y, [x, y])[0] !== x) { var tmp = x; x = y; y = tmp; }
    if (c) ST.say(S, { actors: [c, A, B], tag: '先に帰る', text: ST.fmt(pick(S, TB.LEAVE), { a: A.name, b: B.name, c: c.name }), why: c.name + 'は、' + A.name + 'と' + B.name + 'の様子に気づいて、先に倉庫を出た（三人の場面にはならない組）', mag: 16 });
    var tl = api.tiesOf(S, A, B).slice().sort(function (p, q) { var i = PRIO.indexOf(p.type), j = PRIO.indexOf(q.type); return (i < 0 ? 999 : i) - (j < 0 ? 999 : j); }), tie = tl[0];
    var rel = tie ? REL[tie.type] || REL[(HK.TIES[tie.type] || {}).like] || 'friend' : 'stranger';
    var tone = rel === 'tension' || rel === 'ex' ? 'rough' : rel === 'lover' || rel === 'almost' || rel === 'crush' ? 'sweet' : rng() < 0.5 ? 'rough' : 'sweet';
    var LX = HK.Lewd, lcf = LX && LX.conf('locker');
    A.o = B; B.o = A;
    var labels;
    try {
      labels = LK.bed(S, { short: !!(lcf && LX.short(S.env, rng)), ero: !!S.eroOn, A: A, B: B, x: x, y: y, rel: rel, tone: tone, how: how, plotter: null, servant: null, master: null, nt: null, lew: S.lew, dose: S.env.dose, pair: { sexIn: !!(Lk.sexIn && Lk.m.length === 2), level: Lk.lv, conn: false }, moan: function (p, top) { return moan(S, p, top); }, REL_LABEL: REL_LABEL, ff: !!(HK.Pos && HK.Pos.ff(x, y)) });
    } finally { delete A.o; delete B.o; }
    A.cnt.climax += 2 + rng.int(3); B.cnt.climax += 2 + rng.int(3);
    return labels || [];
  }
  /* 二人のときのベッドと同じ条件（二人とも熱 60 以上・合わせて 140 以上・一度は応じた（または二人とも 85 以上））で、合意の上で手を出し合える二人 */
  function hotPair(S, api, x, y) { return api.consentOk(S, x, y) && x.m.heat >= 60 && y.m.heat >= 60 && x.m.heat + y.m.heat >= 140 && (x.cnt.accept + y.cnt.accept >= 1 || (x.m.heat >= 85 && y.m.heat >= 85)); }
  /* 三人のロッカーの中で、ベッドへ行ける二人（いちばん熱い組。ほかに恋人のいる人の組は除く） */
  function bestPair(S, api, m) {
    var c = pairsOf(m).filter(function (pr) { return hotPair(S, api, pr[0], pr[1]) && !loyalOut(S, api, pr[0], pr[1]); });
    c.sort(function (p, q) { return (q[0].m.heat + q[1].m.heat) - (p[0].m.heat + p[1].m.heat); });
    return c[0] || null;
  }
  function ringOf(S, sp, m) {
    if (sp.hub || !HK.Pos || !HK.Pos.bothRiba || !pairsOf(m).every(function (pr) { return HK.Pos.bothRiba(pr[0], pr[1]); }) || S.rng() >= 0.5) return sp;
    return { p: 'ring', t: sp.t, m: sp.m, u: sp.u };
  }

  /* ---------- 呼び出し口：lockers のうち一組をベッドへ（なければ null）→ { Lk, who, labels } ----------
     三人の場面（3P）の決まりは pos.js の HK.Pos.trioPlan（api.trioOk・api.trioShape が使う）：住人の「三人の場面（3P）：しない」の人は加わらない、
     直接の行為ができる組が一つ以下・形が作れないときは三人にせず、ベッドへ行ける二人がいれば二人きりの場面に落とす（三人で来た回だけ） */
  LK.crowdBed = function (S, lockers, how, api) {
    if (HK.SAFE_ON || !api) return null;
    var rng = S.rng, P = S.P, best = null;
    lockers.forEach(function (Lk) {
      var m = Lk.m, c = null, hv = avg(m);
      if (Lk.refusedHard) return;
      if (m.length === 3) {
        /* 三人とも組める三人で、ロッカーの中で三人の場面があったか、熱が限界の三人 */
        if (hv >= 60 && (Lk.trioIn || hv >= 80) && !m.some(function (p) { return p.m.heat < 45; }) && api.trioOk(S, m)) c = { k: 'trio', Lk: Lk, m: m, hv: hv };
        else if (P.length === 3) { var bp = bestPair(S, api, m); if (bp) c = { k: 'pair', Lk: Lk, m: bp, hv: avg(bp) }; }
      } else if (m.length === 2 && P.length === 3 && hotPair(S, api, m[0], m[1])) c = { k: 'pair', Lk: Lk, m: m, hv: hv };
      if (c && (!best || c.hv > best.hv)) best = c;
    });
    if (!best) return null;
    var m = best.m;
    /* 起こりやすさ：二人のときと同じ 0.85 に、性欲の強さの倍率（HK.Pos.libMul）。理性の残った人がいれば、踏みとどまることも（愛憎のある組は踏みとどまりにくい） */
    var lm = HK.Pos && HK.Pos.libMul ? HK.Pos.libMul(m) : 1;
    if (rng() >= Math.min(0.97, 0.85 * lm)) return null;
    var rmax = Math.max.apply(null, m.map(function (p) { return p.m.reason; })), cp = m.reduce(function (s, p) { return s + p.tr.cp; }, 0) / m.length;
    var lhAny = pairsOf(m.length === 3 ? m : [m[0], m[1], m[1]]).some(function (pr) { return pr[0] !== pr[1] && (api.lhHas(S, pr[0], pr[1]) || api.lhHas(S, pr[1], pr[0])); });
    if (rmax > 18 && cp + rng() * 0.6 > 0.75 && !(lhAny && rng() < 0.6)) return null;
    if (best.k === 'trio') {
      var sp = api.trioShape(S, m);
      /* 形が作れない三人は、二人の場面に落とす（三人で来た回だけ） */
      if (!sp) { var bp2 = P.length === 3 && bestPair(S, api, m); if (!bp2 || !LK.bed) return null; return { Lk: best.Lk, who: bp2, labels: pairBed(S, api, best.Lk, bp2, how, m.filter(function (p) { return bp2.indexOf(p) < 0; })[0]) }; }
      sp = ringOf(S, sp, m);
      /* 誘う人：中心のある三人は中心の人（残りの二人は触れ合わないので）。ほかは熱のいちばん高い人か、いちばん落ち着いていた人 */
      var kind = hostileIn(S, api, m) || lhIn(S, api, m) ? 'rough' : 'eager', q = sp.h || m.slice().sort(function (a, b) { return b.m.heat - a.m.heat; })[0];
      if (kind === 'eager' && !sp.h) { var qq = m.slice().sort(function (a, b) { return (b.m.reason + b.tr.ac * 20) - (a.m.reason + a.tr.ac * 20); })[0]; if (rng() < 0.3 + qq.tr.ac * 0.3) { kind = 'quiet'; q = qq; } }
      return { Lk: best.Lk, who: m, labels: trioBed(S, api, sp, kind, how, q) };
    }
    var cc = P.filter(function (p) { return m.indexOf(p) < 0; })[0];
    /* 二人＋一人（別のロッカーだった一人）：三人とも組める三人で、熱があって乗り気なら加わる */
    if (cc && best.Lk.m.length === 2 && cc.m.heat >= 55 && api.trioOk(S, P) && cc.m.heat / 100 + cc.tr.fc * 0.2 + cc.tr.np * 0.1 - cc.m.reason / 160 + (m.some(function (p) { return api.interest(S, cc, p) || api.lhHas(S, cc, p); }) ? 0.25 : 0) > 0.35 && rng() < 0.6) {
      var sp2 = api.trioShape(S, P);
      if (sp2) return { Lk: best.Lk, who: P.slice(), labels: trioBed(S, api, ringOf(S, sp2, P), 'join', how, cc) };
    }
    /* ほかに恋人のいる人の二人は、二人きりのベッドへは行かない */
    if (loyalOut(S, api, m[0], m[1]) || !LK.bed) return null;
    return { Lk: best.Lk, who: m.slice(), labels: pairBed(S, api, best.Lk, m, how, cc) };
  };
})();
