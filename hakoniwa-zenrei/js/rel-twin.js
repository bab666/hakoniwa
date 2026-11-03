/* 箱庭シミュレーター: 関係「双子」（twin）の専用の出来事（2026-10-31 担当TW。利用者の指示「兄弟をベースに、関係性に双子を追加。各種イベントも調整」）
   関係の定義は ties.js の T.twin（like: 'sibling'・家族・恋愛にはならない）。兄弟の出来事は like と各ファイルの表でそのまま双子にも通り、ここは双子らしさの場面だけを持つ。
   ■ エンジン型（どの箱庭でも：HK.COMMON に足す）
       tie_tw_sync   以心伝心：同時に同じことを言う・同じ間で笑う
       tie_tw_sense  相手の不調に、言われる前に気づく
       tie_tw_swap   入れ替わりのいたずら（ほかの住人を騙す。同じ性別の双子だけ）
       tie_tw_cmp    比べられることへの反発（二人のあいだに劣等感・優越の気持ちがあれば、それに寄せる）
       tie_tw_bday   同じ誕生日の話（一組に一度）
       tie_tw_alone  片方に恋人・想う相手ができたときの「置いていかれる」寂しさ（嫉妬ではない。恋愛対象・受け攻めには触れない）
   ■ エンジン型（箱庭ごと：HK.buildPool の包みで、その箱庭の山にだけ足す）
       tie_tw_mob_*  入れ替わりでモブを騙す（合コン・ふたりの日常・オメガバース・ゾンビの街。同じ性別の双子だけ）
       tie_tw_room   出られない部屋：扉のお題を前に「出るなら二人で」
       tie_tw_isle   無人島：二手に分かれて、同じものを持ち帰る
       tie_tw_bite   ゾンビの街：片割れが咬まれたとき
       tie_tw_gk     合コン：双子だと明かして、どっちがどっちか当てられる
   ■ 物語型（HK.RelBad.EXTRA。場面の区切りのたびに、まれに。一回の遊びで最大2回）
       tie_tw_jinro  人狼：片割れを庇う・同じ陣営に見せかける（昼の議論。庇われた側への疑いが少し下がる）
       tie_tw_story  邪神村・吹雪の館・宇宙船・ダンジョンRPG：以心伝心・入れ替わり
   ■ そのほかの調整（ほかのファイル）：殺す部屋の庇い死の相手（room-kill.js の SYM で双子を最優先の 1）、出られない部屋の兄弟姉妹の場面（room-tie-more.js の MATCH）、
       ゾンビの街・無人島の親友のようなきょうだいの場面（rel-kit.js の kind）など。一覧は docs/reports/2026-10-31/twin.md
   台詞は3本（くだけた常体｜硬い常体｜敬語）、一人称は「私」、二人称は「あなた」。台詞は動く人 {a} の態度9種で書き分ける。地の文は1分岐3文以上。
   性的な文は書かない（双子は家族で、恋愛・夜にはならない）。登場人物はすべて成人として扱う。全年齢版にも同じファイルを置く */
/* @event scen=jinro id=tie_tw_jinro cat=help tie=twin label=双子：人狼で片割れを庇い同じ陣営に見せる */
/* @event scen=jashin,yakata,ship,rpg id=tie_tw_story cat=bond tie=twin label=双子：以心伝心と入れ替わりのいたずら */
(function () {
  'use strict';
  var HK = window.HK;
  if (!HK || !HK.COMMON || !HK.addTo || !HK.wrap || !HK.TIES || !HK.TIES.twin) return;
  function L(s) { return s.split('|'); }
  var PK = ['proud', 'stern', 'tsun', 'gentle', 'devoted', 'cool', 'free', 'shy', 'polite'];
  function per(c) { var k = c && (c.persona || (HK.personaOf && HK.personaOf(c))) || 'gentle'; return PK.indexOf(k) >= 0 ? k : 'gentle'; }
  function here(c) { return !!c && (HK.State ? HK.State.here(c) : c.alive !== false) && !(c.flags && (c.flags.caged != null || c.flags.down)); }
  function isTwin(ctx, a, b) { return !!(a && b && a !== b && HK.Ties && HK.Ties.has(ctx, a, b, 'twin')); }
  function sameG(a, b) { return (a.gender || '') === (b.gender || ''); }
  function twOf(ctx, a, b) { var pf = ctx.pair(a, b); return pf._tw || (pf._tw = { at: {}, n: {}, last: -99 }); }
  function cool(ctx, a, b, k, gap, max) {
    var q = twOf(ctx, a, b);
    if (q.last === ctx.stepIndex) return false;
    if (q.at[k] != null && ctx.stepIndex - q.at[k] < gap) return false;
    return (q.n[k] || 0) < (max || 2);
  }
  function mark(ctx, a, b, k) { var q = twOf(ctx, a, b); q.at[k] = ctx.stepIndex; q.n[k] = (q.n[k] || 0) + 1; q.last = ctx.stepIndex; }
  function egoW(a, warm) { var t = a.tr || {}; return warm ? 0.7 + (t.np || 0) * 0.5 + (t.fc || 0) * 0.2 : 0.7 + (t.cp || 0) * 0.4 + (t.ac || 0) * 0.3; }
  /* 態度9種の一言（{a} の台詞）。3本のベース：くだけた常体｜硬い常体｜敬語（＝は左と同じ） */
  function say(tb, a) { return '{a}「' + tb[per(a)] + '」'; }

  /* ================= 台詞の表 ================= */
  var SAY = {
    sync: {
      proud: '真似しないで、こっちが先だった｜真似をするな、こちらが先だった｜真似しないでください、こちらが先でした',
      stern: '……同じことを二人で言っても、意味がない｜＝｜……同じことを二人で言っても、意味がありません',
      tsun: 'べ、別に合わせたわけじゃないから｜べ、別に合わせたわけではない｜べ、別に合わせたわけじゃありませんから',
      gentle: 'また揃ったね。やっぱり双子だ｜また揃ったな。やはり双子だ｜また揃いましたね。やっぱり双子です',
      devoted: 'あなたの考えてること、全部分かる気がする｜あなたの考えていることは、全部分かる気がする｜あなたの考えていること、全部分かる気がします',
      cool: '……いつものこと。驚くほどじゃない｜……いつものことだ。驚くほどではない｜……いつものことです。驚くほどではありません',
      free: 'ハモった！　今日はいいことありそう｜揃ったな！　今日は何かいいことがありそうだ｜揃いましたね！　今日はいいことがありそうです',
      shy: 'あ……また、同じこと言っちゃった……｜あ……また、同じことを言ってしまった……｜あ……また、同じことを言ってしまいました……',
      polite: 'ごめん、言葉がかぶったね。どうぞ、先に｜すまない、言葉が重なった。先に言ってくれ｜失礼しました、言葉が重なってしまいましたね。先に言ってください'
    },
    sense: {
      proud: '顔に出てる。隠しても、私には無駄｜顔に出ている。隠しても、私には無駄だ｜顔に出ていますよ。隠しても、私には無駄です',
      stern: '無理をするな、とは言わない。ただ、黙って倒れるのはやめて｜無理をするな、とは言わない。ただ、黙って倒れるのはやめろ｜無理をするな、とは言いません。ただ、黙って倒れるのはやめてください',
      tsun: '別に心配してないし。……でも、つらいなら言って｜別に心配はしていない。……だが、つらいなら言え｜別に心配してませんけど。……でも、つらいなら言ってください',
      gentle: '朝から、何となく分かってた。少し休もう｜朝から、何となく分かっていた。少し休もう｜朝から、何となく分かっていました。少し休みましょう',
      devoted: 'あなたが苦しいと、私まで苦しい。だから、半分ちょうだい｜あなたが苦しいと、私まで苦しい。だから、半分よこせ｜あなたが苦しいと、私まで苦しいんです。だから、半分ください',
      cool: '歩き方がいつもと違う。座って｜歩き方がいつもと違う。座れ｜歩き方がいつもと違います。座ってください',
      free: 'はい、ばれてまーす。休憩しよ、休憩｜はい、ばれている。休憩しよう、休憩だ｜はい、ばれていますよ。休憩しましょう、休憩',
      shy: 'あの……今日、ちょっと、元気ない……よね？｜あの……今日、少し、元気がない……だろう？｜あの……今日、少し、元気がない……ですよね？',
      polite: '差し出がましいけど、顔色が悪いよ。少し横になって｜差し出がましいが、顔色が悪い。少し横になってくれ｜差し出がましいようですが、顔色が悪いです。少し横になってください'
    },
    swap: {
      proud: '引っかかった。まだまだだね｜引っかかったな。まだまだだ｜引っかかりましたね。まだまだです',
      stern: '……見分けがつかないなら、次からは名札でも付けておく｜＝｜……見分けがつかないなら、次からは名札でも付けておきます',
      tsun: 'ちょっと試しただけ。気づかないほうが悪い｜少し試しただけだ。気づかないほうが悪い｜ちょっと試しただけです。気づかないほうが悪いんですよ',
      gentle: 'ごめんごめん、本当はこっちが私｜すまない、本当はこちらが私だ｜ごめんなさい、本当はこっちが私なんです',
      devoted: '二人でやると、いつも上手くいく。ね？｜二人でやると、いつも上手くいく。そうだろう？｜二人でやると、いつも上手くいくんです。ね？',
      cool: '……三分もった。新記録｜……三分もった。新記録だ｜……三分もちました。新記録です',
      free: '大成功！　ねえ、今の顔、写真に撮りたかった｜大成功だ！　今の顔、写真に撮りたかった｜大成功です！　今の顔、写真に撮りたかったです',
      shy: 'ご、ごめんなさい……ずっと、言い出せなくて……｜す、すまない……ずっと、言い出せなくて……｜ご、ごめんなさい……ずっと、言い出せなくて……',
      polite: '騙してごめん。子どもの頃からの、二人の遊びなんだ｜騙してすまない。子どもの頃からの、二人の遊びなんだ｜騙してすみません。子どもの頃からの、二人の遊びなんです'
    },
    cmp: {
      proud: '比べたいなら勝手に比べれば。私は私｜比べたいなら勝手に比べればいい。私は私だ｜比べたいなら勝手に比べればいいです。私は私です',
      stern: '同じ顔だから同じ人間だと思わないで｜同じ顔だから同じ人間だと思うな｜同じ顔だから同じ人間だと思わないでください',
      tsun: 'ふん、どうせ「そっくりなのに全然違う」って言いたいんでしょ｜ふん、どうせ「そっくりなのに全然違う」と言いたいんだろう｜ふん、どうせ「そっくりなのに全然違う」って言いたいんでしょう',
      gentle: '似てないところもあるんだよ、ちゃんと見れば｜似ていないところもあるんだ、ちゃんと見れば｜似ていないところもあるんですよ、ちゃんと見れば',
      devoted: '比べられるのは慣れてる。……でも、あなたと比べられるのは、ちょっとだけ苦しい｜比べられるのは慣れている。……だが、あなたと比べられるのは、少しだけ苦しい｜比べられるのは慣れています。……でも、あなたと比べられるのは、少しだけ苦しいです',
      cool: 'どっちがどうでも、結果は変わらない｜どちらがどうでも、結果は変わらない｜どちらがどうでも、結果は変わりません',
      free: 'はいはい、どうせ私が残念なほうだよー｜はいはい、どうせ私が残念なほうだ｜はいはい、どうせ私が残念なほうですよ',
      shy: 'あの……私たち、そんなに、違うかな……｜あの……私たちは、そんなに、違うだろうか……｜あの……私たち、そんなに、違いますか……',
      polite: 'よく言われる。でも、二人とも別の人間なんだ｜よく言われる。だが、二人とも別の人間なんだ｜よく言われます。でも、二人とも別の人間なんですよ'
    },
    bday: {
      proud: '今年のケーキは、私が選ぶ番だから｜今年のケーキは、私が選ぶ番だ｜今年のケーキは、私が選ぶ番ですからね',
      stern: '誕生日までに、ここを出る。二人でな｜＝｜誕生日までに、ここを出ます。二人で',
      tsun: '別に、覚えてたわけじゃないから。たまたま思い出しただけ｜別に、覚えていたわけではない。たまたま思い出しただけだ｜別に、覚えていたわけじゃありません。たまたま思い出しただけです',
      gentle: '今年も一緒にお祝いしようね｜今年も一緒に祝おう｜今年も一緒にお祝いしましょうね',
      devoted: '生まれたときから、ずっと同じ日。これからも、ずっと｜生まれたときから、ずっと同じ日だ。これからも、ずっと｜生まれたときから、ずっと同じ日です。これからも、ずっと',
      cool: 'プレゼント、今年は交換にしない？　被るから｜プレゼントは、今年は交換にしないか。被るからな｜プレゼント、今年は交換にしませんか。被るので',
      free: 'ねえ、誕生日なに食べたい？　あ、言わなくていい、同じだから｜誕生日には何が食べたい？　ああ、言わなくていい、同じだからな｜誕生日、何が食べたいですか？　あ、言わなくていいです、同じなので',
      shy: 'あの……誕生日、今年も、一緒にいられるかな……｜あの……誕生日は、今年も、一緒にいられるだろうか……｜あの……誕生日、今年も、一緒にいられますか……',
      polite: '今年もおめでとうを言う相手がいて、よかった｜今年もおめでとうを言う相手がいて、よかった｜今年もおめでとうを言う相手がいて、よかったです'
    },
    alone: {
      proud: 'よかったじゃん。……泣かせたら私が許さないって、伝えといて｜よかったな。……泣かせたら私が許さないと、伝えておけ｜よかったですね。……泣かせたら私が許さないと、伝えておいてください',
      stern: '幸せならそれでいい。……ただ、たまには顔を見せて｜幸せならそれでいい。……ただ、たまには顔を見せろ｜幸せならそれでいいです。……ただ、たまには顔を見せてください',
      tsun: '別に寂しくなんかないし。……ないってば｜別に寂しくなどない。……ないと言っている｜別に寂しくなんかありません。……ないですってば',
      gentle: 'よかったね。……でも、たまには私とも遊んでね｜よかったな。……だが、たまには私とも遊べよ｜よかったですね。……でも、たまには私とも遊んでくださいね',
      devoted: 'あなたが笑ってると嬉しい。なのに、少しだけ胸が痛い｜あなたが笑っていると嬉しい。なのに、少しだけ胸が痛い｜あなたが笑っていると嬉しいです。なのに、少しだけ胸が痛いんです',
      cool: '……隣が一つ空いた。それだけ｜……隣が一つ空いた。それだけだ｜……隣が一つ空きました。それだけです',
      free: 'おめでと！　……で、私の席はまだ残ってる？｜おめでとう！　……で、私の席はまだ残っているか？｜おめでとうございます！　……で、私の席はまだ残っていますか？',
      shy: 'あの……おめでとう。……ちょっとだけ、置いていかれた気がしただけ……｜あの……おめでとう。……少しだけ、置いていかれた気がしただけだ……｜あの……おめでとうございます。……少しだけ、置いていかれた気がしただけです……',
      polite: 'おめでとう。私のことは気にしないで、ちゃんと大事にしてあげて｜おめでとう。私のことは気にせず、ちゃんと大事にしてやってくれ｜おめでとうございます。私のことは気にせず、ちゃんと大事にしてあげてください'
    },
    room: {
      proud: 'どっちか一人なんて選ばない。出るなら二人で｜どちらか一人など選ばない。出るなら二人でだ｜どちらか一人なんて選びません。出るなら二人でです',
      stern: '生まれたのも一緒だった。出るのも一緒にする｜生まれたのも一緒だった。出るのも一緒だ｜生まれたのも一緒でした。出るのも一緒にします',
      tsun: 'あなたを置いていったら、母さんに怒られるからね｜あなたを置いていったら、母に叱られるからな｜あなたを置いていったら、母に叱られますからね',
      gentle: '大丈夫。二人なら、何とかなる。いつもそうだった｜大丈夫だ。二人なら、何とかなる。いつもそうだった｜大丈夫です。二人なら、何とかなります。いつもそうでした',
      devoted: '片方だけ外に出ても、半分しか生きてないのと同じ｜片方だけ外に出ても、半分しか生きていないのと同じだ｜片方だけ外に出ても、半分しか生きていないのと同じです',
      cool: '考えることは同じ。だったら、手分けしよう｜考えることは同じだ。だったら、手分けしよう｜考えることは同じです。だったら、手分けしましょう',
      free: 'よし、双子パワーで扉をこじ開けよう！｜よし、双子の力で扉をこじ開けるぞ！｜よし、双子の力で扉をこじ開けましょう！',
      shy: 'あの……手、離さないで……ね｜あの……手を、離さないで……くれ｜あの……手、離さないで……くださいね',
      polite: 'あなたの考えてること、聞かなくても分かる。私も同じだから｜あなたの考えていることは、聞かなくても分かる。私も同じだからな｜あなたの考えていること、聞かなくても分かります。私も同じですから'
    },
    isle: {
      proud: 'ほらね、私の読みは正しかった。……あなたも同じだったけど｜ほらな、私の読みは正しかった。……あなたも同じだったが｜ほらね、私の読みは正しかったでしょう。……あなたも同じでしたけど',
      stern: '同じものを二つ持ち帰っても、効率が悪い。明日は分担を決める｜＝｜同じものを二つ持ち帰っても、効率が悪いです。明日は分担を決めます',
      tsun: 'べ、別に同じところを探したかったわけじゃないから｜べ、別に同じところを探したかったわけではない｜べ、別に同じところを探したかったわけじゃありませんから',
      gentle: '離れてても、考えることは一緒なんだね｜離れていても、考えることは一緒なんだな｜離れていても、考えることは一緒なんですね',
      devoted: '島の反対側にいても、あなたがどこにいるか分かった気がする｜島の反対側にいても、あなたがどこにいるか分かった気がする｜島の反対側にいても、あなたがどこにいるか分かった気がします',
      cool: '……食料は倍。悪くない結果｜……食料は倍だ。悪くない結果だ｜……食料は倍です。悪くない結果ですね',
      free: 'これ絶対、生まれる前から打ち合わせしてたよね！｜これは絶対、生まれる前から打ち合わせしていたな！｜これ、絶対に生まれる前から打ち合わせしていましたよね！',
      shy: 'あの……一人で歩いてるとき、ずっと、あなたのこと考えてた……｜あの……一人で歩いているとき、ずっと、あなたのことを考えていた……｜あの……一人で歩いているとき、ずっと、あなたのことを考えていました……',
      polite: 'お疲れさま。今日の分は、二人で半分ずつにしよう｜お疲れ。今日の分は、二人で半分ずつにしよう｜お疲れさまでした。今日の分は、二人で半分ずつにしましょう'
    },
    bite: {
      proud: '勝手にいなくならないで。同じ日に生まれたんだから、勝手は許さない｜勝手にいなくなるな。同じ日に生まれたんだ、勝手は許さない｜勝手にいなくならないでください。同じ日に生まれたんですから、勝手は許しません',
      stern: '薬を探す。それまで、絶対に向こうへ行くな｜＝｜薬を探します。それまで、絶対に向こうへ行かないでください',
      tsun: 'ばか、なんで先に咬まれてるの……私を置いていかないでよ｜ばか、なぜ先に咬まれている……私を置いていくな｜ばか、どうして先に咬まれてるんですか……私を置いていかないでください',
      gentle: '大丈夫、ずっとそばにいる。生まれたときから、そうだったでしょ｜大丈夫だ、ずっとそばにいる。生まれたときから、そうだっただろう｜大丈夫です、ずっとそばにいます。生まれたときから、そうだったでしょう',
      devoted: 'あなたがいなくなったら、私も半分になる。だから、行かないで｜あなたがいなくなったら、私も半分になる。だから、行くな｜あなたがいなくなったら、私も半分になります。だから、行かないでください',
      cool: '……傷は浅い。まだ間に合う。そう決めた｜……傷は浅い。まだ間に合う。そう決めた｜……傷は浅いです。まだ間に合います。そう決めました',
      free: 'ねえ、冗談でしょ？　いつもみたいに、入れ替わりのいたずらでしょ？｜おい、冗談だろう？　いつものように、入れ替わりのいたずらだろう？｜ねえ、冗談ですよね？　いつもみたいに、入れ替わりのいたずらですよね？',
      shy: 'やだ……やだよ……一人に、しないで……｜嫌だ……嫌だ……一人に、しないでくれ……｜嫌です……嫌です……一人に、しないでください……',
      polite: '最後まで一緒にいる。それだけは、譲らないから｜最後まで一緒にいる。それだけは、譲らない｜最後まで一緒にいます。それだけは、譲りませんから'
    },
    gk: {
      proud: '当てられたら、一杯おごってあげる｜当てられたら、一杯おごってやる｜当てられたら、一杯おごってあげますよ',
      stern: '外れたら、そっちが二人分払うこと｜外れたら、そちらが二人分払うことだ｜外れたら、そちらが二人分払ってくださいね',
      tsun: '別に、間違えられても気にしないし｜別に、間違えられても気にしない｜別に、間違えられても気にしませんから',
      gentle: 'ふふ、だいたいみんな外れるんだよ｜ふふ、だいたいみんな外れるんだ｜ふふ、だいたいみなさん外れるんですよ',
      devoted: '当てられるのは、世界でこの人だけ｜当てられるのは、世界でこの人だけだ｜当てられるのは、世界でこの人だけなんです',
      cool: 'ヒント。右のほうが、少しだけ無口｜ヒントだ。右のほうが、少しだけ無口だ｜ヒントです。右のほうが、少しだけ無口です',
      free: 'はい、どっちでしょう！　外したら一気だよ！｜さあ、どちらだ！　外したら一気だぞ！｜はい、どちらでしょう！　外したら一気ですよ！',
      shy: 'あの……どっちでも、いいよ……あんまり、見ないで……｜あの……どちらでも、いい……あまり、見ないでくれ……｜あの……どちらでも、いいです……あまり、見ないでください……',
      polite: '改めまして。こっちが私で、あっちが片割れ｜改めて言う。こちらが私で、あちらが片割れだ｜改めてご紹介します。こちらが私で、あちらが片割れです'
    },
    mob: {
      proud: '気づかなかった？　まだまだだね｜気づかなかったか。まだまだだな｜気づきませんでしたか。まだまだですね',
      stern: '……後で、ちゃんと謝りに行く｜＝｜……後で、ちゃんと謝りに行きます',
      tsun: '向こうが勝手に間違えただけだから｜向こうが勝手に間違えただけだ｜向こうが勝手に間違えただけですから',
      gentle: 'ちょっと悪いことしちゃったね。でも、楽しかった｜少し悪いことをしたな。だが、楽しかった｜少し悪いことをしてしまいましたね。でも、楽しかったです',
      devoted: '二人でいると、子どもの頃に戻れる気がする｜二人でいると、子どもの頃に戻れる気がする｜二人でいると、子どもの頃に戻れる気がします',
      cool: '入れ替わり、成功率は相変わらず九割｜入れ替わりの成功率は、相変わらず九割だ｜入れ替わりの成功率は、相変わらず九割です',
      free: 'やった、まだまだ現役！　次は誰を騙す？｜よし、まだまだ現役だ！　次は誰を騙す？｜やった、まだまだ現役です！　次は誰を騙しましょうか？',
      shy: 'し、心臓が、まだどきどきしてる……｜し、心臓が、まだどきどきしている……｜し、心臓が、まだどきどきしています……',
      polite: '後でちゃんと種明かししようね｜後でちゃんと種明かしをしよう｜後でちゃんと種明かしをしましょうね'
    }
  };

  /* ================= 地の文 ================= */
  var NAR = {
    sync: L('{a}と{b}は、同じ瞬間に口を開いた。言いかけた言葉まで、一字一句同じだった。{a}は思わず{b}の顔を見て、それから言った。{say}|' +
      '誰かの冗談に、{a}と{b}は同じ間で吹き出した。笑い方の癖まで、鏡に映したようにそっくりだった。{a}は笑いをこらえながら言った。{say}|' +
      '{a}が何か言おうとすると、{b}が先に頷いた。言葉にする前から、答えは二人のあいだで決まっていた。{a}は少し悔しそうに言った。{say}'),
    sense: L('{b}が何も言わないうちに、{a}は顔色の変化に気づいていた。生まれたときから隣にいた相手の不調は、自分のことのように分かる。{a}は{b}の隣に腰を下ろした。{say}|' +
      '{a}は急に胸騒ぎを覚えて、{b}を探した。{b}は人目のないところで、一人で膝を抱えていた。{a}は黙って水を差し出し、それから言った。{say}|' +
      '{a}は、{b}の笑い方がいつもより少しだけ浅いのに気づいた。ほかの誰も気づかない、ほんのわずかな違いだった。{a}は{b}の袖を引いて、物陰に連れていった。{say}'),
    swap: L('{a}と{b}は、こっそり上着を取り替えた。{a}は{b}の口癖をまねて、{c}に話しかけた。{c}はしばらく気づかず、{b}のつもりで相槌を打っていた。{say}{c}は二人を見比べて、呆れたように笑った。|' +
      '{a}は{b}の髪型をまねて、{c}の前に立った。{b}は少し離れたところで、{a}の癖をまねて腕を組んでいた。{c}が二人を取り違えて呼んだところで、{a}は種明かしをした。{say}'),
    cmp1: L('{c}が二人を見比べて言った。{c}「{b}のほうがしっかりしてるね｜{b}のほうがしっかりしているな｜{b}のほうがしっかりしていますね」{a}の表情が、一瞬だけ曇った。同じ顔で生まれても、比べられるのはいつも中身だった。{say}|' +
      '{c}が、悪気なく言った。{c}「顔はそっくりなのに、性格は全然違うね｜顔はそっくりなのに、性格は全然違うな｜顔はそっくりなのに、性格は全然違いますね」{a}は、子どもの頃から何百回も聞いてきた言葉だと思った。{b}が気づかわしげに{a}を見た。{say}'),
    cmp0: L('子どもの頃から、二人はいつも比べられてきた。テストの点も、背の高さも、大人たちの褒め言葉も。{a}はふとそれを思い出して、{b}に言った。{say}|' +
      '{a}は、{b}がうまくやるのを見て、昔のことを思い出していた。「双子なのに」と言われ続けた日々だった。{a}は小さく息を吐いて言った。{say}'),
    bday: L('{a}は、ふと日付を数えて、もうすぐ二人の誕生日だと気づいた。毎年同じ日に、同じケーキを半分ずつ分けてきた。{a}は{b}に言った。{say}|' +
      '{b}が何気なく日付を口にすると、{a}は顔を上げた。来週は、二人が生まれた日だった。どこにいても、その日だけは一緒に過ごしてきた。{say}'),
    alone: L('{a}は、{b}が{c}と笑い合っているのを、少し離れたところから見ていた。生まれたときからずっと隣にいたのに、今の{b}の隣には{c}がいた。嫉妬ではなかった。ただ、自分だけが置いていかれたような気がした。あとで、{a}は{b}にだけ言った。{say}|' +
      '{b}が{c}の話をするときの顔を、{a}は初めて見た。子どもの頃からどんな顔も知っていたはずなのに、それは知らない顔だった。{a}は、嬉しさと寂しさを同時に飲み込んで言った。{say}'),
    room: L('扉の紙のお題を読んだ{a}と{b}は、顔を見合わせた。二人の答えは、言葉にしなくても同じだった。{a}は{b}の手を取って言った。{say}|' +
      '{a}は、白い壁にもたれて、{b}の肩に頭を預けた。母親のお腹の中にいた頃も、こうして狭い場所に二人きりだったのだろうと思った。{a}は小さく笑って言った。{say}'),
    isle: L('{a}と{b}は、島の反対側を二手に分かれて探った。夕方、焚き火の前に戻った二人は、まったく同じ木の実を、同じ数だけ抱えていた。二人は顔を見合わせて、同時に吹き出した。{say}|' +
      '別々の浜を歩いていたはずの{a}と{b}は、同じ形の流木を拾って戻ってきた。使い道まで同じことを考えていたと分かって、二人は黙り込んだ。やがて{a}が口を開いた。{say}'),
    bite: L('{b}の腕の傷を見た瞬間、{a}は自分の腕まで痛むような気がした。同じ日に生まれた片割れが、今、向こう側へ行こうとしている。{a}は{b}の手を握りしめて、離さなかった。{say}|' +
      '{a}は、咬まれた{b}の額に自分の額を押し当てた。子どもの頃、熱を出した{b}にそうしたのと同じだった。{b}の熱は、あの頃よりずっと高かった。{say}'),
    gk: L('自己紹介で{a}と{b}が双子だと明かすと、席が一気に沸いた。どっちがどっちか当ててみて、と言われて、二人は同じ角度で首をかしげた。{a}は笑って言った。{say}|' +
      '向かいの席の人が、{a}と{b}の顔を何度も見比べた。二人が同じタイミングでグラスを置いたので、テーブルに笑いが起きた。{a}はすました顔で言った。{say}'),
    mob: L('{a}と{b}は、{mob}の前で入れ替わってみることにした。{a}は{b}の名前を名乗り、{b}は{a}の癖をまねて隣に立った。{mob}は二人の顔を何度も見比べたが、とうとう最後まで気づかなかった。{say}|' +
      '{mob}に呼び止められた{a}は、とっさに{b}のふりをした。少し遅れて来た{b}も、すぐに{a}のふりを始めた。{mob}が首をかしげて去っていくと、二人は物陰で顔を見合わせた。{say}')
  };
  /* 劣等感・優越の気持ちがあるときの一文（比べられる場面に足す） */
  var ESTEEM = {
    inferior: L('{a}は昔から、何をしても{b}の一歩後ろにいる気がしていた。|{a}の胸には、子どもの頃からの引け目が、また小さく疼いた。'),
    superior: L('{a}は内心、いつも自分のほうが上だと思ってきた。|{a}は、比べられるたびに、自分が勝っていると信じてきた。')
  };
  var MOB = { goukon: '店員', futari: '行きつけの店の店員', omega: '施設の職員', zombie: '通りすがりの生存者' };

  /* ================= 出来事を作る ================= */
  function fill(ctx, s, a, b, c, extra) {
    var t = s.replace('{say}', extra.say || '');
    if (extra.mob) t = t.split('{mob}').join(extra.mob);
    return ctx.t(t, a, b, c);
  }
  function why(a, b, w) {
    var lab = HK.tieLabel ? HK.tieLabel(HK.Ties.has(HK._twCtx, a, b, 'twin')) : '双子';
    return a.name + 'と' + b.name + 'は' + (lab || '双子') + '：' + w;
  }
  function thirdOf(ctx, a, b) { return ctx.others(a).filter(function (o) { return o !== b && here(o) && !isTwin(ctx, a, o); }); }
  /* b の恋人・想う相手（a 以外）。恋人になった組（couple）か、恋人・片想い・本命などの関係 */
  function loveOf(ctx, b, a) {
    var L0 = ctx.chars.filter(function (o) { return o !== a && o !== b && o.alive !== false && here(o); });
    for (var i = 0; i < L0.length; i++) {
      var o = L0[i];
      if (ctx.pair(b, o).couple) return o;
      if (HK.Ties.has(ctx, b, o, 'lover') || HK.Ties.has(ctx, b, o, 'mate') || HK.Ties.has(ctx, b, o, 'fated') || HK.Ties.from(ctx, b, o, 'crush') || HK.Ties.from(ctx, b, o, 'honmei')) return o;
    }
    return null;
  }
  function esteemOf(ctx, a, b) {
    if (HK.Ties.from && HK.Ties.from(ctx, a, b, 'inferior')) return 'inferior';
    if (HK.Ties.from && HK.Ties.from(ctx, a, b, 'superior')) return 'superior';
    return '';
  }
  function base(ctx, a, b) { return isTwin(ctx, a, b) && here(a) && here(b) && !ctx.pair(a, b).couple; }

  var COMMON = [
    { id: 'tie_tw_sync', label: '双子が同時に同じことを言う', tie: 'twin', cat: 'bond', scope: 'pair', noOdd: true,
      when: function (ctx, a, b) { return HK.Ties.has(ctx, a, b, 'twin') && base(ctx, a, b) && cool(ctx, a, b, 'sync', 4, 2); },
      w: function (ctx, a) { return 1.6 * egoW(a, true); },
      run: function (ctx, a, b) {
        mark(ctx, a, b, 'sync'); ctx.mod2(a, b, { aff: 4, trust: 3 }, { aff: 4, trust: 3 });
        return { text: fill(ctx, ctx.pick(NAR.sync), a, b, null, { say: say(SAY.sync, a) }), why: why(a, b, '以心伝心（同じことを同時に言う）') };
      } },
    { id: 'tie_tw_sense', label: '双子が片割れの不調に先に気づく', tie: 'twin', cat: 'help', scope: 'pair', noOdd: true,
      when: function (ctx, a, b) { return HK.Ties.has(ctx, a, b, 'twin') && base(ctx, a, b) && ((b.stress || 0) >= 35 || (b.hp != null && b.hp < 65)) && cool(ctx, a, b, 'sense', 4, 2); },
      w: function (ctx, a) { return 2.0 * egoW(a, true); },
      run: function (ctx, a, b) {
        mark(ctx, a, b, 'sense'); ctx.mod2(a, b, { aff: 3, trust: 4 }, { aff: 5, trust: 6 }); ctx.stress(b, -8);
        return { text: fill(ctx, ctx.pick(NAR.sense), a, b, null, { say: say(SAY.sense, a) }), why: why(a, b, '片割れの不調に、言われる前に気づいた') };
      } },
    { id: 'tie_tw_swap', label: '双子が入れ替わってほかの住人を騙す', tie: 'twin', cat: 'bond', scope: 'pair', noOdd: true,
      when: function (ctx, a, b) { return HK.Ties.has(ctx, a, b, 'twin') && base(ctx, a, b) && sameG(a, b) && thirdOf(ctx, a, b).length > 0 && cool(ctx, a, b, 'swap', 6, 1); },
      w: function (ctx, a) { var t = a.tr || {}; return 1.2 * (0.6 + (t.fc || 0) * 0.7 + (t.cp || 0) * 0.2); },
      run: function (ctx, a, b) {
        var c = ctx.pick(thirdOf(ctx, a, b));
        mark(ctx, a, b, 'swap'); ctx.mod2(a, b, { aff: 3 }, { aff: 3 }); ctx.mod(c, a, { ten: 2, aff: 1 }); ctx.mod(c, b, { aff: 1 });
        return { with: [c], text: fill(ctx, ctx.pick(NAR.swap), a, b, c, { say: say(SAY.swap, a) }), why: why(a, b, '入れ替わりのいたずら（' + c.name + 'を騙す）') };
      } },
    { id: 'tie_tw_cmp', label: '双子が比べられて反発する', tie: 'twin', cat: 'conflict', scope: 'pair', noOdd: true,
      when: function (ctx, a, b) { return HK.Ties.has(ctx, a, b, 'twin') && base(ctx, a, b) && cool(ctx, a, b, 'cmp', 6, 2); },
      w: function (ctx, a, b) { var t = a.tr || {}; return (esteemOf(ctx, a, b) ? 2.0 : 1.0) * (0.6 + (t.jealous || 0) * 0.6 + (t.ac || 0) * 0.3 + (t.cp || 0) * 0.2); },
      run: function (ctx, a, b) {
        var cs = thirdOf(ctx, a, b), c = cs.length ? ctx.pick(cs) : null, es = esteemOf(ctx, a, b);
        var s = ctx.pick(c ? NAR.cmp1 : NAR.cmp0);
        if (es) s = s.replace('{say}', ctx.pick(ESTEEM[es]) + '{say}');
        mark(ctx, a, b, 'cmp'); ctx.mod2(a, b, { ten: 4, aff: es === 'superior' ? -1 : 1 }, { ten: 3 }); ctx.stress(a, 4);
        var o = { text: fill(ctx, s, a, b, c, { say: say(SAY.cmp, a) }), why: why(a, b, '比べられることへの反発' + (es ? '（' + (es === 'inferior' ? '劣等感' : '優越') + '）' : '')) };
        if (c) o.with = [c];
        return o;
      } },
    { id: 'tie_tw_bday', label: '双子が同じ誕生日を思い出す', tie: 'twin', cat: 'bond', scope: 'pair', noOdd: true,
      when: function (ctx, a, b) { return HK.Ties.has(ctx, a, b, 'twin') && base(ctx, a, b) && ctx.stepIndex >= 2 && !ctx.pair(a, b)._twBday && cool(ctx, a, b, 'bday', 99, 1); },
      w: function (ctx, a) { return 0.9 * egoW(a, true); },
      run: function (ctx, a, b) {
        mark(ctx, a, b, 'bday'); ctx.pair(a, b)._twBday = true; ctx.mod2(a, b, { aff: 4, trust: 2 }, { aff: 4, trust: 2 });
        return { text: fill(ctx, ctx.pick(NAR.bday), a, b, null, { say: say(SAY.bday, a) }), why: why(a, b, '同じ誕生日') };
      } },
    { id: 'tie_tw_alone', label: '双子の片方の恋に置いていかれる寂しさ', tie: 'twin', cat: 'bond', scope: 'pair', noOdd: true,
      when: function (ctx, a, b) { return HK.Ties.has(ctx, a, b, 'twin') && base(ctx, a, b) && !!loveOf(ctx, b, a) && cool(ctx, a, b, 'alone', 8, 1); },
      w: function (ctx, a) { var t = a.tr || {}; return 1.6 * (0.6 + (t.ac || 0) * 0.5 + (t.np || 0) * 0.3); },
      run: function (ctx, a, b) {
        var c = loveOf(ctx, b, a);
        mark(ctx, a, b, 'alone'); ctx.mod2(a, b, { aff: 2, ten: 2 }, { aff: 3, trust: 2 }); ctx.stress(a, 3);
        return { with: [c], text: fill(ctx, ctx.pick(NAR.alone), a, b, c, { say: say(SAY.alone, a) }), why: why(a, b, '片割れの恋に、置いていかれた気がした（嫉妬ではない寂しさ）') };
      } }
  ];
  /* 箱庭ごと（その箱庭の山にだけ足す） */
  var POOL = {
    whiteroom: [{ id: 'tie_tw_room', label: '双子が出るなら二人でと手を取る', tie: 'twin', cat: 'help', scope: 'pair', noOdd: true,
      when: function (ctx, a, b) { return HK.Ties.has(ctx, a, b, 'twin') && base(ctx, a, b) && cool(ctx, a, b, 'room', 6, 1); },
      w: function (ctx, a) { return 1.8 * egoW(a, true); },
      run: function (ctx, a, b) {
        mark(ctx, a, b, 'room'); ctx.mod2(a, b, { trust: 6, aff: 3 }, { trust: 6, aff: 3 }); ctx.stress(a, -4); ctx.stress(b, -4);
        return { text: fill(ctx, ctx.pick(NAR.room), a, b, null, { say: say(SAY.room, a) }), why: why(a, b, '出るなら二人で') };
      } }],
    island: [{ id: 'tie_tw_isle', label: '双子が別々に探して同じものを持ち帰る', tie: 'twin', cat: 'bond', scope: 'pair', noOdd: true,
      when: function (ctx, a, b) { return HK.Ties.has(ctx, a, b, 'twin') && base(ctx, a, b) && cool(ctx, a, b, 'isle', 6, 1); },
      w: function (ctx, a) { return 1.6 * egoW(a, true); },
      run: function (ctx, a, b) {
        mark(ctx, a, b, 'isle'); ctx.mod2(a, b, { aff: 4, trust: 3 }, { aff: 4, trust: 3 });
        if (ctx.food != null) ctx.food = Math.min(100, ctx.food + 4);
        return { text: fill(ctx, ctx.pick(NAR.isle), a, b, null, { say: say(SAY.isle, a) }), why: why(a, b, '離れていても考えることは同じ') };
      } }],
    zombie: [{ id: 'tie_tw_bite', label: '双子の片割れが咬まれて手を離さない', tie: 'twin', cat: 'help', scope: 'pair', noOdd: true, tags: ['death'],
      when: function (ctx, a, b) { return HK.Ties.has(ctx, a, b, 'twin') && base(ctx, a, b) && !!(b.z && b.z.bitten) && !(a.z && a.z.bitten) && cool(ctx, a, b, 'bite', 99, 1); },
      w: function () { return 3.0; },
      run: function (ctx, a, b) {
        mark(ctx, a, b, 'bite'); ctx.mod2(a, b, { aff: 5, trust: 5 }, { aff: 6, trust: 6 }); ctx.stress(a, 10);
        return { text: fill(ctx, ctx.pick(NAR.bite), a, b, null, { say: say(SAY.bite, a) }), why: why(a, b, '片割れが咬まれた') };
      } }],
    goukon: [{ id: 'tie_tw_gk', label: '双子だと明かしてどっちがどっちか当てられる', tie: 'twin', cat: 'bond', scope: 'pair', noOdd: true,
      when: function (ctx, a, b) { return HK.Ties.has(ctx, a, b, 'twin') && base(ctx, a, b) && cool(ctx, a, b, 'gk', 99, 1); },
      w: function (ctx, a) { return 1.8 * egoW(a, true); },
      run: function (ctx, a, b) {
        mark(ctx, a, b, 'gk'); ctx.mod2(a, b, { aff: 3 }, { aff: 3 });
        return { text: fill(ctx, ctx.pick(NAR.gk), a, b, null, { say: say(SAY.gk, a) }), why: why(a, b, '合コンで双子だと明かす') };
      } }]
  };
  /* モブを騙す入れ替わり（モブのいる箱庭だけ） */
  Object.keys(MOB).forEach(function (sid) {
    (POOL[sid] = POOL[sid] || []).push({ id: 'tie_tw_mob_' + sid, label: '双子が入れ替わってモブを騙す', tie: 'twin', cat: 'bond', scope: 'pair', noOdd: true, tags: ['mob'],
      when: function (ctx, a, b) { return HK.Ties.has(ctx, a, b, 'twin') && base(ctx, a, b) && sameG(a, b) && cool(ctx, a, b, 'mob', 8, 1); },
      w: function (ctx, a) { var t = a.tr || {}; return 1.0 * (0.6 + (t.fc || 0) * 0.7); },
      run: function (ctx, a, b) {
        mark(ctx, a, b, 'mob'); ctx.mod2(a, b, { aff: 3 }, { aff: 3 });
        return { text: fill(ctx, ctx.pick(NAR.mob), a, b, null, { say: say(SAY.mob, a), mob: MOB[ctx.scen.id] || '通りすがりの人' }), why: why(a, b, '入れ替わりのいたずら（' + (MOB[ctx.scen.id] || '通りすがりの人') + 'を騙す）') };
      } });
  });
  /* why の関係名（「双子の姉妹」など）を引くための ctx（run の中だけ） */
  COMMON.concat([].concat.apply([], Object.keys(POOL).map(function (k) { return POOL[k]; }))).forEach(function (e) {
    var r0 = e.run;
    e.run = function (ctx) { var p = HK._twCtx; HK._twCtx = ctx; try { return r0.apply(this, arguments); } finally { HK._twCtx = p; } };
  });
  HK.addTo(HK.COMMON, COMMON);
  HK.wrap(HK, 'buildPool', function (bp0) { return function (sc) {
    var p = bp0.apply(this, arguments), x = sc && POOL[sc.id];
    if (!x) return p;
    var ex = sc.exclude || [];
    return p.concat(x.filter(function (e) { return ex.indexOf(e.id) < 0; }));
  }; });
  HK.TwinEv = { COMMON: COMMON, POOL: POOL, SAY: SAY, NAR: NAR };

  /* ================= 物語型（邪神村・吹雪の館・宇宙船・ダンジョンRPG・人狼） ================= */
  var ST = HK.Story;
  var RB = HK.RelBad = HK.RelBad || {};
  RB.EXTRA = RB.EXTRA || [];
  var STORY_SCEN = { jashin: '村', yakata: '館', ship: '船内', rpg: 'ダンジョン', jinro: '村' };
  var SKIP = /クライマックス|生贄|罰ゲーム|結末|エピローグ|解決|脱出|最後|真相/;
  function freeS(p) { return !!p && p.alive !== false && !p.out && !p.taken && !p.bound && !p.fallen && !p.captor && !p.locked; }
  var SN = {
    sync: L('{place}で手分けして調べていた{a}と{b}は、戻ってくるなり同じ言葉を口にした。見つけた手がかりまで、同じものだった。周りの視線を集めて、{a}は肩をすくめた。{say}|' +
      '{a}が言いかけたことを、{b}が先に言った。{place}の薄暗がりの中でも、片割れの考えは手に取るように分かった。{a}は小さく頷いて言った。{say}'),
    swap: L('{a}と{b}は、{place}の暗がりで上着を取り替えた。{c}は二人を取り違えたまま、しばらく話し込んでいた。気づいた{c}が目を丸くすると、{a}が種明かしをした。{say}|' +
      '{a}は{b}のふりをして、{c}の前に立った。{c}は最後まで気づかず、{b}のつもりで用件を伝えて去っていった。{a}は{b}と顔を見合わせて言った。{say}'),
    jinro: L('議論の輪で{b}に疑いの目が向いたとき、{a}が前に出た。生まれたときから隣にいた片割れの嘘なら、誰より先に見抜ける。{a}は輪を見回して言った。{say}|' +
      '{a}は、{b}の隣に立って、まっすぐ前を見た。同じ顔が二つ並ぶと、輪の空気が少し変わった。{a}は静かに言った。{say}'),
    jinroW: L('{a}は、{b}を庇いながら、胸の奥で別のことを考えていた。この夜、二人は同じ側に立ってはいなかった。それでも、同じ顔で並んでいれば、誰も疑わないはずだった。{say}|' +
      '{a}は、{b}と同じ陣営だと言わんばかりに、片割れの肩に手を置いた。本当の陣営を知っているのは、自分だけだった。{a}は笑顔のまま言った。{say}')
  };
  var SSAY = {
    jinro: {
      proud: 'この子の嘘なら、私には一発で分かる。今のは嘘じゃない｜こいつの嘘なら、私には一発で分かる。今のは嘘ではない｜この人の嘘なら、私には一目で分かります。今のは嘘じゃありません',
      stern: '疑うなら、まず私を疑って。二人で一組だから｜疑うなら、まず私を疑え。二人で一組だ｜疑うなら、まず私を疑ってください。二人で一組ですから',
      tsun: '別に庇ってるわけじゃない。事実を言ってるだけ｜別に庇っているわけではない。事実を言っているだけだ｜別に庇ってるわけじゃありません。事実を言っているだけです',
      gentle: '大丈夫。この子は村の味方だよ。私が保証する｜大丈夫だ。こいつは村の味方だ。私が保証する｜大丈夫です。この人は村の味方ですよ。私が保証します',
      devoted: 'この人を吊るなら、私も一緒に吊って｜この人を吊るなら、私も一緒に吊れ｜この人を吊るなら、私も一緒に吊ってください',
      cool: '同じ顔で、同じ答え。それが答え｜同じ顔で、同じ答えだ。それが答えだ｜同じ顔で、同じ答えです。それが答えです',
      free: 'ちょっと待って、双子の勘を信じてよ！｜ちょっと待て、双子の勘を信じろ！｜ちょっと待ってください、双子の勘を信じてください！',
      shy: 'あの……この子、そんなこと、しない……と思う……｜あの……こいつは、そんなことは、しない……と思う……｜あの……この人、そんなこと、しない……と思います……',
      polite: '少しだけ聞いて。生まれたときから見てきた人のことは、分かるから｜少しだけ聞いてくれ。生まれたときから見てきた人のことは、分かるんだ｜少しだけ聞いてください。生まれたときから見てきた人のことは、分かりますから'
    },
    sync: SAY.sync, swap: SAY.swap
  };
  function storyTwins(S) {
    var P = S.P || [], ties = (S.input && S.input.ties) || S.ties || (HK.Sib && HK.Sib._cur && HK.Sib._cur.ties) || [];
    return ties.filter(function (t) { return t && t.type === 'twin' && t.noev !== 'off' && P[t.a] && P[t.b]; });
  }
  function storyTick(S, label) {
    var sid = S.scen && S.scen.id;
    if (!ST || !STORY_SCEN[sid] || SKIP.test(label || '') || (S._twN || 0) >= 2) return;
    /* 双子のいない回では乱数を引かない（ほかの回の結果を変えない） */
    var tw = storyTwins(S).filter(function (t) { return freeS(S.P[t.a]) && freeS(S.P[t.b]); });
    if (!tw.length || S.rng() >= (sid === 'jinro' ? 0.5 : 0.15)) return;
    var t = tw[Math.floor(S.rng() * tw.length)], a = S.P[t.a], b = S.P[t.b];
    if (S.rng() < 0.5) { var x = a; a = b; b = x; }
    var used = S._twUsed = S._twUsed || {}, k;
    var day = sid === 'jinro' && /昼/.test(label || '');
    if (sid === 'jinro') { if (!day || used.jinro >= 2) return; k = 'jinro'; }
    else {
      var opts = ['sync', 'swap'].filter(function (q) { return !used[q]; });
      if (!opts.length) return;
      k = opts[Math.floor(S.rng() * opts.length)];
    }
    var cs = (S.P || []).filter(function (q) { return q !== a && q !== b && freeS(q); });
    if (k === 'swap' && (!cs.length || (a.gender || '') !== (b.gender || ''))) { if (used.sync) return; k = 'sync'; }
    var c = k === 'swap' ? cs[Math.floor(S.rng() * cs.length)] : null;
    used[k] = (used[k] || 0) + 1; S._twN = (S._twN || 0) + 1;
    var wolfSplit = k === 'jinro' && (a.role === 'wolf') !== (b.role === 'wolf');
    var nar = k === 'jinro' ? (wolfSplit && a.role === 'wolf' ? SN.jinroW : SN.jinro) : SN[k];
    var pick = ST.pick ? function (arr) { return ST.pick(S, arr); } : function (arr) { return arr[Math.floor(S.rng() * arr.length)]; };
    var line = '{a}「' + SSAY[k][per(a)] + '」';
    var txt = pick(nar).replace('{say}', line).split('{place}').join(STORY_SCEN[sid]).replace(/\{(a|b|c)\}/g, function (m0, q) { var p = q === 'a' ? a : q === 'b' ? b : c; return p ? p.name : m0; });
    /* 人狼：庇われた側への疑いが少し下がる */
    if (k === 'jinro') (S.P || []).forEach(function (q) { if (q !== a && q !== b && q.sus && q.sus[b.i] != null) q.sus[b.i] = Math.max(0, q.sus[b.i] - 6); });
    var lab = HK.Sib && HK.Sib.tieLabel ? HK.Sib.tieLabel({ type: 'twin', a: a.i, b: b.i }, a, b) || '双子' : '双子';
    var w = { sync: '以心伝心', swap: '入れ替わりのいたずら（' + (c ? c.name : '') + 'を騙す）', jinro: wolfSplit ? '片割れを庇って、同じ陣営に見せかける' : '片割れを庇う' }[k];
    ST.say(S, { actors: c ? [a, b, c] : [a, b], tag: lab, text: txt, why: a.name + 'と' + b.name + '：' + w + '（' + lab + '）' });
  }
  if (ST) HK.addTo(RB.EXTRA, [storyTick]);
})();
