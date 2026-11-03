/* 箱庭シミュレーター: 出られない部屋 ― 条件のあとの「気まずい時間」（両ビルド共通。2026-10-30 担当W1）
   利用者の要望：「同僚とかはキスとかエッチした後なら顔を合わせられないとかほしい。思い出しちゃうとか。気まずい時間」
   ■ 出来事 rm_awk（条件のあとの気まずい時間）
     ・起きる組：恋人でない二人（恋人・夫婦・番・許嫁・本命・片想い・セフレ・主従・執着・歪んだ関係などの関係がある組は除く）で、
       関係が 職場（同僚・上司と部下・先輩後輩）／学校（同級生）／教える立場（教師と生徒・師弟）／友人（友人・親友・相棒・幼馴染・友達以上恋人未満・知人）／
       ライバル／元恋人／家族（親子・擬似親子・きょうだい・親族。「恋愛：あり」の組だけ）／関係なし（初対面）。二人ともその場にいて動ける（HK.State.canAct・部屋を出ていない・監禁されていない）
     ・きっかけ：この二人の条件のキス・ハグ（R18版ではエッチ・夜も）が 1 回以上あり、その回数が増えた区切りか次の区切り（まとめて進んだときは、ダイジェストのあとに 1 回）
     ・回数：一回の箱庭で 2 回まで、同じ組は 1 回まで
     ・書き分け：恋愛が芽生えている（HK.canLove を両方向・惹かれ 35 以上）なら甘い気まずさ（sweet）、ないなら乾いた気まずさ（dry）。
       関係ごとの書き出し → 型（「忘れて」「忘れられるわけ、ない」の往復／目を合わせられない／わざと事務的に話す／片方だけ平気）→ 結び。台詞は話し手の態度9種
     ・結末（room-end-vary.js）は pf.awk（'sweet'／'dry'）を見て、気まずさの続きの締めを選ぶ
   台詞は3本「くだけた常体｜硬い常体｜敬語」（一人称は「私」、二人称は「あなた」）。エッチのあとの一文は r18 の印の中。登場人物はすべて成人として扱う */
(function () {
  'use strict';
  var HK = window.HK, scen = HK.SCENARIOS && HK.SCENARIOS.whiteroom, RA = HK.RoomAPI;
  if (!scen || !RA || !HK.addTo) return;
  function L(s) { return s.split('|'); }
  var PK = ['proud', 'stern', 'tsun', 'gentle', 'devoted', 'cool', 'free', 'shy', 'polite'];
  function per(c) { var k = HK.Poly && HK.Poly.per ? HK.Poly.per(c) : 'gentle'; return PK.indexOf(k) >= 0 ? k : 'gentle'; }
  function key(a, b) { return a.i < b.i ? a.i + '-' + b.i : b.i + '-' + a.i; }

  /* ---------- 関係 ---------- */
  var GRP = {
    colleague: 'work', boss: 'work', senpai: 'work', classmate: 'school', teacher: 'rank', mentor: 'rank',
    friend: 'friend', best: 'friend', buddy: 'friend', childhood: 'friend', almost: 'friend', acq: 'friend', noobs: 'friend',
    rival: 'rival', ex: 'ex',
    parent: 'family', pparent: 'family', sibling: 'family', sibprot: 'family', sibclose: 'family', twin: 'family', sibbad: 'family', stepsib: 'family', relative: 'family'
  };
  var FAM = { parent: 1, pparent: 1, sibling: 1, sibprot: 1, sibclose: 1, twin: 1, sibbad: 1, stepsib: 1, relative: 1 };
  var TIE_LIST = Object.keys(GRP).join(',');
  /* 二人の関係のまとまり（起きない組は null） */
  function grpOf(ctx, a, b) {
    var l = HK.Ties && HK.Ties.all ? HK.Ties.all(ctx, a, b) : [], g = null, fam = null;
    for (var i = 0; i < l.length; i++) {
      var t = l[i];
      if (!t || !t.type) continue;
      if (!GRP[t.type]) return null;
      if (FAM[t.type]) { if (!(HK.tieLoveOK && HK.tieLoveOK(t))) return null; fam = 'family'; }
      else if (!g) g = GRP[t.type];
    }
    return fam || g || 'stranger';
  }
  /* 動ける人か（door：扉が開く予約のある二人。部屋を出る印 out はもう付いているので見ない） */
  function free(c, door) { return !!c && c.alive !== false && (door || ((HK.State && HK.State.canAct ? HK.State.canAct(c) : true) && !c.out)) && !(c.flags && (c.flags.caged != null || c.flags.cagePair != null || c.flags.down)); }
  function actN(ctx, a, b, k) { var p = RA.prog(ctx, a, b); return (p && p.act && p.act[k]) || 0; }
  /* この二人の条件の触れ合いの回数（キス・ハグ。R18版はエッチと夜も） */
  function touchN(ctx, a, b) {
    var n = actN(ctx, a, b, 'kiss') + actN(ctx, a, b, 'hug');
    if (!HK.SAFE_ON) { var pf = ctx.pair(a, b); n += actN(ctx, a, b, 'h') + (pf.night ? 1 : 0); }
    return n;
  }
  /* いちばん重い触れ合い（文の {w}） */
  function whatOf(ctx, a, b) {
    if (!HK.SAFE_ON && (actN(ctx, a, b, 'h') || ctx.pair(a, b).night)) return 'h';
    return actN(ctx, a, b, 'kiss') ? 'kiss' : 'hug';
  }
  var WORD = { h: 'こと', kiss: 'キス', hug: 'ハグ' }, WORD_A = { kiss: 'さっきのキスのあと', hug: 'さっきのハグのあと' }, WORD_B = { kiss: 'キスをした', hug: '抱き合った' };
  function sweetOf(ctx, a, b) {
    if (!(HK.canLove && HK.canLove(a, b) && HK.canLove(b, a))) return false;
    var r1 = ctx.R(a, b), r2 = ctx.R(b, a);
    return (r1.att + r2.att) / 2 >= 35 && r1.att >= 25 && r2.att >= 25;
  }
  /* 回数が増えた区切りを覚える（増えた区切りとその次だけ起こしやすい） */
  function fresh(ctx, a, b) {
    var S = ctx.flags.awkSeen = ctx.flags.awkSeen || {}, k = key(a, b), n = touchN(ctx, a, b), st = ctx.stepIndex || 0, o = S[k];
    if (!o || n > o.n) S[k] = o = { n: n, st: st };
    return n > 0 && st - o.st <= 1;
  }

  /* ---------- 文（{a}{b}＝二人、{w}＝キス／ハグ／こと） ---------- */
  var INTRO = {
    work: {
      sweet: L('{a}と{b}は、{wA}、互いに背を向けて座っていた。職場で毎日見ている横顔が、急に知らない人のもののように見えた。|{a}は扉の紙を、意味もなく何度も読み返していた。隣の{b}の気配がするだけで、さっきの{w}を思い出してしまう。'),
      dry: L('{a}と{b}は、{wA}、示し合わせたように部屋の端と端に離れた。週明けに職場でどんな顔をすればいいのか、どちらにも分からなかった。|職場の顔で接するには、さっきの{w}は近すぎた。{a}も{b}も、しばらく自分の靴先ばかり見ていた。')
    },
    school: {
      sweet: L('{a}と{b}は、{wA}、壁際に並んで座ったまま黙りこんだ。いつもの教室での距離が、もうどこにも見つからなかった。|{a}は膝を抱えて、隣の{b}の方を見ないようにしていた。教室で何度も見てきた顔なのに、今は直視できなかった。'),
      dry: L('{a}と{b}は、さっきの{w}を口にしないまま、部屋の端と端に座った。次に教室で顔を合わせたら、どんな顔をすればいいのか。|同じ教室で過ごしてきた二人にとって、さっきの{w}はあまりに場違いだった。{a}も{b}も、しばらく口を開かなかった。')
    },
    rank: {
      sweet: L('{a}と{b}は、{wA}、教える側と教わる側の線がどこにあったのか分からなくなっていた。視線がぶつかるたびに、どちらも慌てて目を逸らした。|いつもなら向かい合って話す二人が、今は同じ壁を見つめていた。さっきの{w}が、二人の立場を少しだけ溶かしてしまった。'),
      dry: L('{a}と{b}は、{wA}、いつもの立場の言葉づかいに必死で戻ろうとしていた。それが、かえって部屋の空気をぎこちなくした。|さっきの{w}は、立場の上でも下でも、口にできることではなかった。{a}も{b}も、しばらく黙りこんでいた。')
    },
    friend: {
      sweet: L('{a}と{b}は、{wA}、いつものように笑おうとして、うまく笑えなかった。いつもの冗談が、喉の手前で止まってしまう。|長い付き合いのはずの{b}の顔が、{wA}、違って見えた。{a}は、自分の頬が熱いのに気づかないふりをした。'),
      dry: L('{a}と{b}は、さっきの{w}を冗談にしようとして、二人とも失敗した。気心の知れた仲のはずなのに、何を話せばいいのか分からなかった。|{a}と{b}は、{wA}、互いに少しだけ距離をとって座った。友人の距離に戻るのが、思ったより難しかった。')
    },
    rival: {
      sweet: L('{a}と{b}は、{wA}、張り合う言葉が一つも出てこなかった。いつもなら先に憎まれ口を叩くはずの{a}が、黙って壁を見ていた。|さっきの{w}で、張り合うための言葉がどこかへ消えてしまった。{a}も{b}も、勝ち負けの話を持ち出せずにいた。'),
      dry: L('{a}と{b}は、さっきの{w}をなかったことにするように、互いにそっぽを向いた。勝ち負けの話にすり替えようとして、どちらも言葉に詰まった。|よりによってライバルと{wB}ことが、{a}にはどうにも癪だった。{b}も同じ顔をして、壁際に座りこんでいた。')
    },
    ex: {
      sweet: L('{a}と{b}は、{wA}、昔と同じ間の取り方をしている自分に気づいた。終わったはずの気持ちが、まだどこかに残っていた。|さっきの{w}は、別れる前のことを嫌になるほど思い出させた。{a}は{b}の横顔を見て、慌てて目を伏せた。'),
      dry: L('{a}と{b}は、{wA}、示し合わせたように離れて座った。別れた相手に触れた感触は、思い出したくない記憶まで連れてきた。|元恋人とのさっきの{w}は、懐かしさよりも気まずさの方が大きかった。{a}も{b}も、昔の話だけは避けていた。')
    },
    family: {
      sweet: L('{a}と{b}は、{wA}、互いの顔を見られなくなっていた。家族として何年も見てきた顔なのに、今はまるで別人のようだった。|{wA}、{a}は{b}の呼び方さえ迷うようになった。家族の距離と、そうでない距離のあいだで、二人は黙りこんだ。'),
      dry: L('{a}と{b}は、さっきの{w}は、家族の誰にも言えないと思った。同じ部屋にいるのに、二人のあいだの空気だけがひどく重かった。|家族のはずの二人が、{wA}、他人よりもぎこちなく座っていた。{a}も{b}も、いつもの家族の会話を思い出せなかった。')
    },
    stranger: {
      sweet: L('{a}と{b}は、{wA}、まだ互いの名前を呼ぶのにさえ照れていた。会ったばかりの相手なのに、目が合うたびに胸の奥がざわついた。|会ったばかりの相手と{wB}ことが、今になって恥ずかしくなってきた。{a}は{b}の方をちらりと見て、すぐに目を逸らした。'),
      dry: L('{a}と{b}は、{wA}、気まずさをごまかすように部屋の反対側に離れた。会ったばかりの相手と、何を話せばいいのか分からなかった。|名前しか知らない相手と{wB}ことが、二人の口を重くしていた。{a}も{b}も、しばらく壁ばかり見ていた。')
    }
  };
  /* 「忘れて」（{a}。態度9種） */
  var FORGET = {
    proud: L('{a}「さっきのは、条件だったから。……忘れて｜さっきのは、条件だったからだ。……忘れろ｜さっきのは、条件でしたから。……忘れてください」'),
    stern: L('{a}「さっきのことは、なかったことにしよう｜さっきのことは、なかったことにする｜さっきのことは、なかったことにしましょう」'),
    tsun: L('{a}「か、勘違いしないで。さっきのは……忘れて｜か、勘違いするな。さっきのは……忘れろ｜か、勘違いしないでください。さっきのは……忘れてください」'),
    gentle: L('{a}「……さっきのは、忘れて。困らせたくないから｜……さっきのは、忘れてくれ。困らせたくない｜……さっきのは、忘れてください。困らせたくないので」'),
    devoted: L('{a}「私のせいで嫌な思いをさせたなら……忘れて｜私のせいで嫌な思いをさせたなら……忘れてくれ｜私のせいで嫌な思いをさせたなら……忘れてください」'),
    cool: L('{a}「さっきのは、出るための手順。それ以上の意味はない｜さっきのは、出るための手順だ。それ以上の意味はない｜さっきのは、出るための手順です。それ以上の意味はありません」'),
    free: L('{a}「あはは、さっきのは……うん、忘れて！｜はは、さっきのは……まあ、忘れてくれ！｜あはは、さっきのは……ええと、忘れてください！」'),
    shy: L('{a}「さ、さっきのは……わ、忘れて……｜さ、さっきのは……わ、忘れてくれ……｜さ、さっきのは……わ、忘れてください……」'),
    polite: L('{a}「さっきのことは、どうか忘れて｜さっきのことは、どうか忘れてくれ｜さっきのことは、どうか忘れてください」')
  };
  /* 甘い気まずさの返事（{b}。忘れられない） */
  var REPLY_S = {
    proud: L('{b}「忘れろって言われて、忘れられるわけないでしょ｜忘れろと言われて、忘れられるわけがない｜忘れろと言われて、忘れられるわけがないでしょう」'),
    stern: L('{b}「……無理。そんな器用なことはできない｜……無理だ。そんな器用なことはできない｜……無理です。そんな器用なことはできません」'),
    tsun: L('{b}「ふ、ふん。忘れるに決まってる。……たぶん｜ふ、ふん。忘れるに決まっている。……たぶんな｜ふ、ふん。忘れるに決まっています。……たぶん」'),
    gentle: L('{b}「忘れられるわけ、ないよ｜忘れられるわけが、ないだろう｜忘れられるわけ、ないでしょう」'),
    devoted: L('{b}「忘れたくない。……だめ？｜忘れたくない。……駄目か｜忘れたくありません。……だめですか」'),
    cool: L('{b}「記憶は、意思では消せない｜＝｜記憶は、意思では消せません」'),
    free: L('{b}「えー、無理。だって、ちょっと嬉しかったもん｜無理だな。正直、少し嬉しかった｜無理です。だって、ちょっと嬉しかったので」'),
    shy: L('{b}「わ、私も……忘れられない、かも……｜わ、私も……忘れられない、かもしれない……｜わ、私も……忘れられない、かもしれません……」'),
    polite: L('{b}「ごめん、それはできそうにない｜すまないが、それはできそうにない｜申し訳ありませんが、それはできそうにありません」')
  };
  /* 乾いた気まずさの返事（{b}。忘れたことにする） */
  var REPLY_D = {
    proud: L('{b}「言われなくても、とっくに忘れた｜言われなくとも、とうに忘れた｜言われなくても、とうに忘れました」'),
    stern: L('{b}「分かった。この話は、ここまで｜分かった。この話は、ここまでだ｜分かりました。この話は、ここまでです」'),
    tsun: L('{b}「べ、別に最初から気にしてないし｜べ、別に最初から気にしていない｜べ、別に最初から気にしていません」'),
    gentle: L('{b}「うん。……お互い、そうしよう｜ああ。……お互い、そうしよう｜はい。……お互い、そうしましょう」'),
    devoted: L('{b}「あなたがそう言うなら、そうする｜あなたがそう言うなら、そうする｜あなたがそう言うなら、そうします」'),
    cool: L('{b}「了解。記録には残さない｜了解だ。記録には残さない｜了解です。記録には残しません」'),
    free: L('{b}「オッケー、もう忘れた！｜分かった、もう忘れた！｜分かりました、もう忘れました！」'),
    shy: L('{b}「う、うん……そ、そうする……｜あ、ああ……そ、そうする……｜は、はい……そ、そうします……」'),
    polite: L('{b}「うん。なかったことにしよう｜ああ。なかったことにしよう｜ええ。なかったことにしましょう」')
  };
  /* わざと事務的に（{a}。態度9種） */
  var BIZ = {
    proud: L('{a}「残りの条件を確認する。次も、手早く済ませるよ｜残りの条件を確認する。次も、手早く済ませる｜残りの条件を確認します。次も、手早く済ませましょう」'),
    stern: L('{a}「状況を整理する。条件はあと少し。私情は挟まない｜状況を整理する。条件はあと少しだ。私情は挟まない｜状況を整理します。条件はあと少しです。私情は挟みません」'),
    tsun: L('{a}「つ、次の段取りの話をするよ。ほかの話はしないから｜つ、次の段取りの話をする。ほかの話はしない｜つ、次の段取りの話をします。ほかの話はしませんから」'),
    gentle: L('{a}「ええと……次のことを、相談しておこう｜ええと……次のことを、相談しておこう｜ええと……次のことを、相談しておきましょう」'),
    devoted: L('{a}「あなたの負担にならないように、手順を決めておこう｜＝｜あなたの負担にならないように、手順を決めておきましょう」'),
    cool: L('{a}「進み具合を共有する。残りの条件と、残り時間｜進み具合を共有する。残りの条件と、残り時間だ｜進み具合を共有します。残りの条件と、残り時間です」'),
    free: L('{a}「よし、反省会！ ……じゃなくて、作戦会議！｜よし、反省会だ！ ……ではなく、作戦会議だ！｜よし、反省会です！ ……じゃなくて、作戦会議です！」'),
    shy: L('{a}「つ、次は……ど、どうすればいいか、決めておこう……｜＝｜つ、次は……ど、どうすればいいか、決めておきましょう……」'),
    polite: L('{a}「それじゃあ、残りの条件について確認させて｜それでは、残りの条件について確認させてくれ｜それでは、残りの条件について確認させてください」')
  };
  var T = {
    eyes: {
      sweet: L('{a}は{b}の方を見ようとして、目が合いそうになるたびに慌てて逸らした。{b}も同じことをしているのに気づいて、二人は同時に赤くなった。|{b}が何か言いかけるたびに、{a}はさっきのことを思い出して黙りこんだ。話しかけようとした言葉は、何度も喉の奥で止まった。'),
      dry: L('{a}と{b}は、一度も目を合わせなかった。視線がぶつかりそうになると、どちらも壁のしみを数えるふりをした。|沈黙が長くなるほど、さっきのことが部屋の真ん中に居座っているようだった。{a}は咳払いを一つしたが、何も言えなかった。')
    },
    bizLead: L('{a}は、わざと事務的な口調で切り出した。|{a}は咳払いを一つして、事務連絡のような声を出した。'),
    bizAfter: {
      sweet: L('{b}も同じ調子で答えたが、二人とも声が少し上ずっていた。|{b}は頷いて答えたが、その耳は真っ赤だった。'),
      dry: L('{b}も同じ温度で相槌を打った。事務的な話をしているあいだだけは、さっきのことを考えずに済んだ。|{b}も淡々と答えた。二人とも、必要以上に丁寧な言葉を選んでいた。')
    },
    /* 片方だけ平気（{a}＝平気な側、{b}＝気まずい側） */
    ones: {
      sweet: L('{a}は何事もなかったように、{b}に話しかけた。{b}だけが、さっきのことを思い出しては、そのたびに言葉に詰まった。{a}「どうしたの、顔が赤いよ｜どうした、顔が赤いぞ｜どうしたんですか、顔が赤いですよ」{b}「……誰のせいだと思ってるの｜……誰のせいだと思っている｜……誰のせいだと思っているんですか」|' +
        '{a}はもう平気な顔で、残りの条件の数を数えていた。{b}は膝を抱えたまま、{a}の横顔から目を離せなかった。平気そうに見えるのが、少しだけ悔しかった。'),
      dry: L('{a}は平気な顔で伸びをして、いつも通りに話しかけた。{b}だけが、さっきのことを引きずって、まともに返事ができなかった。{b}「……よく平気でいられるね｜……よく平気でいられるな｜……よく平気でいられますね」{a}「条件だったから｜条件だったからな｜条件でしたから」|' +
        '{a}は肩をすくめて、もう別の話をしていた。{b}は相槌を打ちながら、自分だけが気にしているのが馬鹿らしくなった。それでも、さっきの感触はなかなか消えなかった。')
    },
    /* 扉が開く直前（条件がそろったところ） */
    doorClose: {
      sweet: L('どちらも、扉の紙の数字がそろったことに、しばらく気づかなかった。|扉の鍵が外れる小さな音に、二人は同時に顔を上げた。'),
      dry: L('扉の鍵が外れる音が、気まずい沈黙をようやく破った。|二人とも、扉の紙の数字がそろったことに気づくまで、少し時間がかかった。')
    },
    close: {
      sweet: L('それから二人は、肩が触れそうで触れない距離のまま、しばらく黙って座っていた。|気まずいのに、なぜか離れたいとは思わなかった。|部屋の空気は気まずいまま、少しだけ甘かった。'),
      dry: L('それから二人は、必要なこと以外はほとんど話さなかった。|気まずい沈黙は、次の出来事が起きるまで続いた。|白い部屋は、さっきより少しだけ狭く感じられた。')
    }
  };
  var H_ADD = null;
  /* r18:begin */
  /* エッチ（夜）のあとの一文 */
  WORD_A.h = 'さっき一線を越えてから'; WORD_B.h = '一線を越えた';
  H_ADD = {
    sweet: L('まだ肌に残る相手の熱が、{a}の考えをたびたび途切れさせた。|服の下に残る痕に気づくたびに、{b}はそっと襟元を押さえた。'),
    dry: L('体にはまだ、さっきの熱がわずかに残っていた。|乱れたシーツが目に入るたびに、どちらも黙って視線を外した。')
  };
  /* r18:end */
  var CALM = { free: 1, cool: 1, proud: 1, stern: 1 };

  /* 気まずい時間の文と効果（{text, why}）。a・b の印（pf.awk・pf.awkDone）と、一回の箱庭の回数（ctx.flags.awkN）を進める */
  var JA = { work: '職場', school: '同級生', rank: '教える立場', friend: '友人', rival: 'ライバル', ex: '元恋人', family: '家族', stranger: '初対面' };
  function compose(ctx, a, b, door) {
    var pf = ctx.pair(a, b), g = grpOf(ctx, a, b) || 'stranger', mood = sweetOf(ctx, a, b) ? 'sweet' : 'dry', w = whatOf(ctx, a, b);
    pf.awkDone = true; pf.awk = mood; ctx.flags.awkN = (ctx.flags.awkN || 0) + 1;
    var r = ctx.rng(), biz = g === 'work' || g === 'rank' || g === 'school' ? 0.32 : 0.15, x = a, y = b, mode;
    var pa = per(a), pb = per(b), contrast = !!CALM[pa] !== !!CALM[pb];
    if (door) mode = r < 0.55 ? 'forget' : 'eyes';
    else if (r < 0.4) mode = 'forget';
    else if (r < 0.4 + biz) mode = 'biz';
    else if (r < (contrast ? 0.85 : 0.75) + (biz - 0.15) / 2) mode = 'ones';
    else mode = 'eyes';
    if (mode === 'ones' && CALM[pb] && !CALM[pa]) { x = b; y = a; }
    var parts = [ctx.pick(INTRO[g][mood])];
    if (w === 'h' && H_ADD) parts.push(ctx.pick(H_ADD[mood]));
    if (mode === 'forget') parts.push(ctx.pick(FORGET[per(x)]), ctx.pick((mood === 'sweet' ? REPLY_S : REPLY_D)[per(y)]));
    else if (mode === 'biz') parts.push(ctx.pick(T.bizLead), ctx.pick(BIZ[per(x)]), ctx.pick(T.bizAfter[mood]));
    else parts.push(ctx.pick(T[mode][mood]));
    parts.push(ctx.pick((door ? T.doorClose : T.close)[mood]));
    var text = parts.join('').replace(/\{wA\}/g, WORD_A[w]).replace(/\{wB\}/g, WORD_B[w]).replace(/\{w\}/g, WORD[w]).replace(/\{a\}/g, x.name).replace(/\{b\}/g, y.name);
    if (mood === 'sweet') ctx.mod2(a, b, { att: 3, ten: 3 }, { att: 3, ten: 3 });
    else ctx.mod2(a, b, { ten: 5, aff: -1 }, { ten: 5, aff: -1 });
    ctx.stress(a, 3); ctx.stress(b, 3);
    return { text: text, why: 'さっきの' + (w === 'h' ? '夜' : WORD[w]) + 'のあと、' + JA[g] + 'の二人が顔を合わせられない（' + (mood === 'sweet' ? '甘い気まずさ' : '乾いた気まずさ') + '）' };
  }
  /* 起こしてよい組か（時期は問わない） */
  function okPair(ctx, a, b, door) {
    if (!a || !b || a === b || !free(a, door) || !free(b, door)) return false;
    if ((ctx.flags.awkN || 0) >= 2) return false;
    var pf = ctx.pair(a, b);
    if (pf.couple || pf.awkDone || pf.fwb) return false;
    return !!grpOf(ctx, a, b) && touchN(ctx, a, b) > 0;
  }

  HK.addTo(scen.events, {
    id: 'rm_awk', label: '条件のあとの気まずい時間', cat: 'bond', scope: 'pair', tie: TIE_LIST,
    when: function (ctx, a, b) { return okPair(ctx, a, b) && fresh(ctx, a, b); },
    w: function () { return 6; },
    run: function (ctx, a, b) { var o = compose(ctx, a, b); return { text: o.text, why: o.why, mag: 7 }; }
  });

  /* ---------- 条件を満たして扉が開く直前（まとめて進んだダイジェストのあと・最後の一回のあと） ----------
     扉が開く予約（ctx.flags.doorQ）のある二人の出来事が記録に出たとき、扉の区切りの行より前に、気まずい時間を別の記録として一つ差す。
     条件がキス・ハグ・エッチで、まとめて進んだ（2 回以上の条件）なら必ず、1 回の条件なら 6 割。部屋の動き（scenario-room.js の setup の ctx.say の包み）の外側を包む */
  function doorPair(ctx, o) {
    var Q = ctx.flags.doorQ;
    if (!Q || !Q.length || ctx.flags.doorBusy || !o || o.kind === 'step' || o.kind === 'phase') return null;
    var A = (o.actors || []).map(function (c) { return typeof c === 'number' ? c : c && c.i; });
    for (var i = 0; i < Q.length; i++) {
      var g = (Q[i].g || []).filter(function (c, j, s) { return c && s.indexOf(c) === j; });
      if (g.length === 2 && g.every(function (c) { return A.indexOf(c.i) >= 0; })) return g;
    }
    return null;
  }
  var TOUCH_K = { kiss: 1, hug: 1, h: 1 };
  HK.wrap(scen, 'setup', function (orig) {
    return function (ctx) {
      var r = orig.apply(this, arguments);
      var say1 = ctx.say;
      ctx.say = function (o) {
        var g = null;
        try { g = doorPair(ctx, o); } catch (e) { g = null; }
        if (!g) return say1.call(this, o);
        var a = g[0], b = g[1], rule = (ctx.rules || []).filter(function (x) { return TOUCH_K[x.k]; })[0];
        if (!rule || (rule.k === 'h' && HK.SAFE_ON) || !okPair(ctx, a, b, true) || ctx.rng() >= (rule.n > 1 ? 1 : 0.6)) return say1.call(this, o);
        /* 出来事を記録してから（扉はまだ開けない）、気まずい時間を記録し、その記録で扉の区切りへ進む */
        ctx.flags.doorBusy = true;
        var e;
        try { e = say1.call(this, o); } finally { ctx.flags.doorBusy = false; }
        var c = compose(ctx, a, b, true);
        say1.call(this, { kind: 'event', cat: 'bond', cageOk: true, actors: [a, b], text: c.text, why: '脱出の直前：' + c.why, mag: 7 });
        return e;
      };
      return r;
    };
  });
})();
