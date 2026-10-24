/* 箱庭シミュレーター: 喪失（仲の良い人を亡くしたあとの心の傷）の共通部品
   ・住人が死んだとき、その人と仲の良かった住人（恋人・番・親友・きょうだい・幼なじみなどの関係、または好意・信頼が高い人）に、
     大きなストレスと喪失の状態（c.flags.loss = { who, name, rel, at, lv, lv0, type, ... }）を付ける。
     もとからある c.flags.grief（亡くした人の番号）は、まだ付いていなければ付ける（小イベントの「griev」やゾンビの街の絶望が拾う）
   ・強さ（lv）は関係の深さ×性格。性格の型（エゴグラムのいちばん強い因子）：
       NP 深く沈む／AC 自分を責める／CP 表に出さず抱え込む（あとで一人で崩れる）／FC 空元気／A 淡々として、あとから崩れる
   ・その後の区切りで、喪失の状態に応じた独り言・出来事（遺品・名前を呼ぶ・眠れない・口癖・無茶）が出る。区切りごとに少しずつ薄れ、
     慰める側の出来事（慰める人の性格で変わる）でも薄れる。引きずっている人のふだんの出来事にも、ときどき一言が混ざる
   ・engine.js には触らず、箱庭の phase／after を包み、出来事を足す（G.install）。組み込みはこのファイルの最後 */
(function () {
  'use strict';
  var HK = window.HK, SC = HK && HK.SCENARIOS;
  if (!SC) return;
  var G = HK.Grief = {};
  function L(s) { return s.split('|'); }
  function fill(t, m) { return String(t).replace(/\{(\w+)\}/g, function (x, k) { return m[k] != null ? m[k] : x; }); }
  function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }

  /* ---------- 性格の型 ---------- */
  var TYPE_OF = { CP: 'hold', NP: 'sink', A: 'flat', FC: 'bright', AC: 'blame' };
  var TYPE_NAME = { hold: '表に出さず抱え込む', sink: '深く沈む', flat: '淡々として、あとから崩れる', bright: '空元気でごまかす', blame: '自分を責める' };
  /* 沈み方の深さ（NP・AC は深く、A は最初は浅く見える） */
  var MULT = { sink: 1.2, blame: 1.2, hold: 1.05, bright: 0.95, flat: 0.9 };
  function typeOf(c) { var t = HK.egoType ? HK.egoType(c.eg).top : 'NP'; return TYPE_OF[t] || 'sink'; }
  G.TYPE_NAME = TYPE_NAME;

  /* ---------- 関係の深さ（o から見た v） ---------- */
  var TIE_W = {
    lover: 60, mate: 65, fated: 55, parent: 60, pparent: 55, sibprot: 60, sibclose: 55, sibling: 45, best: 50, buddy: 45,
    childhood: 42, almost: 40, mentor: 35, teacher: 30, master: 30, friend: 22, senpai: 15, colleague: 12, ex: 18, fwb: 12, acq: 5, rival: 8
  };
  function relWord(type, mine) {
    switch (type) {
      case 'lover': return '恋人';
      case 'mate': return '番';
      case 'fated': return '運命の相手';
      case 'parent': case 'pparent': return '家族';
      case 'sibprot': case 'sibclose': case 'sibling': return 'きょうだい';
      case 'best': return '親友';
      case 'buddy': return '相棒';
      case 'childhood': return '幼なじみ';
      case 'almost': return '特別な人';
      case 'crush': case 'yan': return '想い人';
      case 'mentor': return mine ? '弟子' : '師匠';
      case 'teacher': return mine ? '教え子' : '先生';
      case 'master': return mine ? '従者' : '主';
      case 'friend': return '友だち';
      default: return '';
    }
  }
  G.depth = function (ctx, o, v, opt) {
    var best = 0, rel = '';
    (HK.Ties ? HK.Ties.all(ctx, o, v) : []).forEach(function (t) {
      var w = TIE_W[t.type] || 0, mine = t.a === o.i;
      if (t.type === 'crush' || t.type === 'yan') w = mine ? 40 : 12;
      if (w > best) { best = w; rel = relWord(t.type, mine) || rel; }
    });
    var pf = ctx.pair(o, v);
    if (pf.couple && best < 55) { best = 55; rel = '恋人'; }
    var key = o.i < v.i ? o.i + '-' + v.i : v.i + '-' + o.i;
    if ((pf.amagami || (ctx.om && ctx.om.bonded && ctx.om.bonded[key])) && best < 65) { best = 65; rel = '番'; }
    if (o.lock === v.i && best < 50) { best = 50; rel = rel || 'ただ一人と決めた人'; }
    var r = ctx.R(o, v);
    var d = best + Math.max(0, r.aff) * 0.55 + Math.max(0, r.trust) * 0.25 + Math.max(0, r.att) * 0.2 - Math.max(0, r.ten - 50) * 0.3;
    if (r.aff < 0) d *= 0.4;
    if (!rel) rel = r.aff >= 50 || r.trust >= 55 ? '大切な' + ((opt && opt.mate) || '仲間') : ((opt && opt.mate) || '仲間');
    return { d: d, rel: rel };
  };

  /* ======================= 文 ======================= */
  /* {a} 残された人／{b} 亡くなった人／{rel} {a}から見た{b}の続き柄（「恋人の{b}」の形で使う）／{item} 遺品／{spot} 場所 */
  var REACT = {
    sink: L('{a}は{b}の名前を何度も呼んだ。返事がないと分かっても、呼ぶのをやめられなかった。やがて声はかすれ、{a}はその場に膝をついて泣き崩れた。|{rel}の{b}がもういないと聞いた瞬間、{a}の顔から血の気が引いた。{a}「嘘だ。さっきまで、隣にいた」――そう言ったきり、{a}は両手で顔を覆った。肩の震えは、いつまでも止まらなかった。|{a}は{item}を胸に抱いたまま、声を上げて泣いた。誰が肩に手を置いても、{a}は顔を上げなかった。その夜、{a}は一口も食べられなかった。'),
    blame: L('{a}「私のせいだ。私が、もっと早く気づいていれば」――{a}は何度も同じことを繰り返した。誰が違うと言っても、{a}は首を横に振るばかりだった。握りしめた拳に、爪が食い込んでいた。|{b}を失ったと知った{a}は、誰とも目を合わせなくなった。{a}「あのとき、私が代わっていれば」――小さな声が、{spot}にぽつりと落ちた。{a}はそのまま、膝を抱えて動かなくなった。|{a}は{b}が最後に言った言葉を、何度も思い返した。あのとき引き止めていれば、と考えるたびに、胸の奥がきしんだ。{a}はその晩、一睡もできなかった。'),
    hold: L('{a}は{b}の死を聞いても、顔色ひとつ変えなかった。{a}「……分かった。やるべきことをやろう」――そう言って、{a}は黙々と次の段取りを始めた。ただ、その手は一度だけ、小さく震えていた。|泣き崩れる周りをよそに、{a}は{b}の荷物を静かにまとめた。{a}「泣くのは、全部終わってからでいい」――誰に言うでもない声だった。その背中は、いつもより少しだけ硬く見えた。|{a}は{rel}の{b}のことを、誰にも何も言わなかった。いつもどおりに動き、いつもどおりに食事をとった。ただ、{item}だけは、誰にも触らせなかった。'),
    bright: L('{a}「大丈夫、大丈夫。{b}なら、きっと笑って許してくれる」――{a}はやけに明るい声でそう言った。その笑顔は、誰の目にも引きつって見えた。{a}は一人になると、すぐに唇を噛んだ。|{a}は{b}を失った夜も、いつもどおり冗談を言った。誰も笑わなかったが、{a}は話すのをやめなかった。黙ってしまえば、何かが崩れてしまいそうだった。|{a}「ほら、元気出そう。{b}が見たら、怒る」――{a}は皆の背中を順番に叩いて回った。誰より声を張っていたのは、{a}自身だった。夜になって、{a}の寝床からは、押し殺した嗚咽が漏れていた。'),
    flat: L('{a}は{b}の死を、驚くほど落ち着いて受け止めた。何が起きたのかを確かめ、やるべきことを順に片付け、次にすべきことを皆に伝えた。{a}自身でさえ、まだ何も感じていなかった。|{a}「……そうか。分かった」――{a}はそれだけ言って、{b}の荷物を整理した。手つきは丁寧で、迷いがなかった。泣いていない自分を、{a}はどこか遠くから眺めていた。|{a}は{rel}の{b}がいなくなったことを、ひとつの事実として書き留めるように飲み込んだ。{a}「今は、残った者のことを考える」――その声には、少しの揺れもなかった。けれど{a}は、その夜、明け方まで目を開けたままだった。')
  };
  /* 引きずる（深い deep／半ば mid／薄れてきた late）。A の deep は「淡々としている」頃、崩れたあとは mid から */
  var BEAT = {
    sink: {
      deep: L('{a}は{item}を、ずっと手放さなかった。眠るときも胸に抱いたままで、ときどき顔をうずめていた。{b}の匂いが、まだ少しだけ残っている気がした。|{a}は{spot}で、ふいに{b}の名前を呼んだ。振り返っても、そこには誰もいなかった。{a}はしばらく口を開けたまま立ち尽くし、それから静かに泣いた。|{a}は食事にほとんど手をつけなかった。{a}「{b}の分も、ちゃんと食べないといけないのに」――そう言いながら、手はまた止まった。目の前の食べ物は、すっかり冷めていた。'),
      mid: L('誰かの笑い声を聞いた拍子に、{a}は{b}の笑い方を思い出した。こらえようとしたが、涙が勝手にこぼれた。{a}は袖で目元をぬぐって、何もなかったふりをした。|{a}は{b}が好きだったものを見つけて、思わず手に取った。{a}「これ、{b}に見せたかった」――言ってから、もう見せる相手がいないことに気づいた。{a}はそれを、そっと元の場所に戻した。|{a}は夜中に目を覚まして、隣に手を伸ばした。そこにあるのは、冷たい空気だけだった。{a}は毛布を頭までかぶり、朝が来るのを待った。'),
      late: L('{a}は{item}を、ようやく荷物の奥にしまった。捨てることは、まだできなかった。{a}「もう少しだけ、そばに置いておく」|{a}は{b}の話を、少しだけ笑って話せるようになった。それでも話の終わりには、決まって声が小さくなった。{a}は上を見上げて、小さく息を吐いた。|{a}は{spot}を通るたびに、足を止めるのが癖になっていた。{b}がよく立っていた場所だった。{a}は一度だけ目を閉じてから、また歩き出した。')
    },
    blame: {
      deep: L('{a}は眠れない夜を過ごしていた。目を閉じるたびに、{b}の最後の姿がまぶたの裏に浮かんだ。{a}「ごめん。ごめん」――誰もいない暗がりで、{a}は謝り続けた。|{a}は{b}を失ったときのことばかり考えていた。あのとき別の道を選んでいれば、と何度も頭の中でやり直した。どの道を選んでも、{b}は戻ってこなかった。|{a}は食事をほとんど口にしなくなった。{a}「私だけ、普通に食べていいはずがない」――止められても、{a}は聞かなかった。頬は日に日にこけていった。'),
      mid: L('{a}は誰かに名前を呼ばれるたび、びくりと肩を震わせた。{b}の声に似ていた気がしたからだ。違うと分かると、{a}はまた黙ってうつむいた。|{a}は{item}を握りしめて、{spot}の隅に座っていた。{a}「私が生き残って、どうするんだ」――つぶやきは、誰の耳にも届かなかった。{a}は膝に額をつけたまま、しばらく動かなかった。|{a}は誰かが嫌な役を引き受けようとすると、必ず先に手を挙げた。{a}「私が行く。もう誰も、私の代わりにさせない」――その目は、どこか自分を投げ出しているように見えた。周りは、{a}を一人にしないように気をつけた。'),
      late: L('{a}は{b}の夢を見た。夢の中の{b}は、何も責めずに笑っていた。目が覚めたとき、{a}は久しぶりに少しだけ泣けた。|{a}は{b}に宛てて、言えなかったことを小声で並べた。謝る言葉の合間に、ありがとうがひとつ混ざった。{a}はそこで言葉を切って、深く息を吸った。|{a}はまだ、自分を許せてはいなかった。それでも{b}の分まで生きなければ、と考えるようになった。{a}は顔を上げて、皆のいるほうへ戻っていった。')
    },
    hold: {
      deep: L('{a}は今日も、誰より早く起きて誰より遅くまで働いた。{b}がやっていた分の仕事まで、黙って引き受けていた。休めと言われても、{a}は首を振るだけだった。|{a}は{b}の名前が出るたびに、さりげなく話題を変えた。表情は少しも崩れなかった。ただ、その夜の{a}は、いつまでも寝床に戻ってこなかった。|{a}は{item}を、誰にも見られないようにしまっていた。人前では一度も出さなかった。夜、皆が寝静まったあとにだけ、{a}はそれを取り出して長いこと眺めていた。'),
      mid: L('{a}は{b}がよく言っていた言葉を、口の中で繰り返した。{a}「『無理は、しないこと』……か」――自分で言っておいて、{a}は小さく苦笑した。その無理をしているのは、{a}自身だった。|誰かが{b}の思い出話を始めると、{a}は黙って席を立った。{spot}で一人になってから、{a}は壁に手をついて長く息を吐いた。戻ってきたときには、もういつもの顔に戻っていた。|{a}は皆に指示を出す途中で、ふと言葉を止めた。{b}に相談するつもりで、振り返りかけていた。{a}「……いや、いい。続ける」'),
      late: L('{a}は{b}のやり方を、自分のやり方に少しずつ取り入れていた。前の{a}なら、決してしなかったやり方だった。{a}「{b}なら、こうした」――そう言ったときの声は、少しだけ柔らかかった。|{a}は{b}の荷物から、まだ使えるものを皆に分けた。{a}「{b}も、そうしろと言うはずだ」――最後に{item}だけを残して、{a}は荷物を閉じた。その手つきは、前よりずっと穏やかだった。|{a}は{spot}に、{b}のための小さな目印を作った。誰にも言わずに、毎日そこを通るようにしていた。{a}は目印の前で短く頭を下げ、いつもの仕事に戻った。')
    },
    bright: {
      deep: L('{a}は今日も、誰より大きな声で笑っていた。{a}「平気、平気。私がしょげてたら、{b}に笑われる」――その目の下には、濃い隈ができていた。笑い声は、ときどき不自然に途切れた。|{a}は{b}の口癖を、わざと大げさに真似してみせた。皆が少し笑うと、{a}も笑った。けれど次の瞬間、{a}は急に黙り込み、くるりと背を向けた。|{a}は一人になる時間を、とにかく作らないようにしていた。誰かの隣に座り、誰かの手伝いをして、ひっきりなしに話し続けた。夜、皆が寝静まると、{a}は毛布の中で声を殺して泣いた。'),
      mid: L('{a}は{b}の好きだった歌を、鼻歌で口ずさんでいた。途中で歌詞が出てこなくなって、{a}は首をかしげた。{a}「……そこ、いつも{b}が歌ってたところだ」――そのまま、歌は止まった。|冗談を言った{a}は、いつものように隣を見た。そこで突っ込みを入れてくれるはずの{b}は、もういなかった。{a}は笑顔のまま固まり、それからゆっくり視線を落とした。|{a}は{item}を手に取って、わざとおどけて見せた。{a}「見て、{b}の忘れ物。取りに来ないなら、私がもらう」――誰も何も言えなかった。{a}は笑ったまま、それを強く握りしめていた。'),
      late: L('{a}の笑い声に、少しずつ本当の明るさが戻ってきた。{b}の話をするときも、もう無理に声を張らなくなった。{a}「{b}がいたら、今の、絶対に笑ってた」|{a}は{b}の口癖を、今度は自然に口にしていた。言ってから気づいて、{a}は小さく吹き出した。{a}「うつってた。いつの間にか」|{a}は{spot}で、{b}の分まで遠くを眺めた。{a}「そっちは、退屈してない？」――答えはなかったが、{a}は少しだけ笑えた。それから、皆のところへ駆け戻っていった。')
    },
    flat: {
      deep: L('{a}は{b}のことについて、事実だけを淡々と皆に伝えた。いつ、どこで、何が起きたのか。話し終えた{a}は、次の予定の確認に移った。|{a}は{b}が使っていた物を、きっちり整理した。{a}「残された物は、無駄にしない。それが一番いい」――手つきは正確で、手早かった。周りのほうが、かえって{a}の顔を見られなかった。|{a}はいつもどおりの時間に起き、いつもどおりにやるべきことをこなした。{b}がいない以外は、何も変わらない一日だった。{a}は、それをおかしいとも思わなかった。'),
      mid: L('{a}は考え事の途中で、ふと{b}の意見を聞きたくなった。答えはもう返ってこないと分かっていて、{a}はしばらく黙り込んだ。{a}「……計算どおりには、いかないものだ」|{a}は{b}のいた場所を、つい目で確かめてしまう癖がついた。そこが空いていると分かるたびに、胸の奥が小さく痛んだ。{a}は目元を押さえ、深く息をついた。|{a}は眠れない夜に、{b}と交わした会話を一つずつ思い出した。どれも、ありふれたやりとりだった。そのありふれたことが、もう二度とないのだと、{a}はようやく分かった。'),
      late: L('{a}は{b}のことを、落ち着いて話せるようになっていた。{a}「{b}がいたから、私はここまで来られた」――淡々とした声だったが、そこにはちゃんと温度があった。聞いていた者も、黙ってうなずいた。|{a}は{item}を、手入れしてから大事にしまった。{a}「これは、持っていく」――迷いのない声だった。{a}にとってそれは、もう悲しみだけの品ではなかった。|{a}は{spot}で、しばらく{b}のことを考えていた。泣きはしなかったが、急ぐこともしなかった。日が傾くころ、{a}は静かに立ち上がった。')
    }
  };
  /* A：淡々としていた人が、あとから崩れる */
  var CRASH = L('{a}は何気なく{item}を見つけて、手を止めた。その瞬間、それまで押し込めていたものが、一度にあふれ出した。{a}「……{b}」――{a}はその場に座り込み、子どものように泣きじゃくった。|誰かが{b}の名前を口にしたとき、{a}の手から持っていたものが滑り落ちた。{a}は拾おうとして、そのまま動けなくなった。{a}「今になって、どうして」――震える声で、{a}は何度も同じことを言った。|{a}は夜中に飛び起きた。夢の中で、{b}が{a}を呼んでいた。{a}は暗がりの中で自分の腕を抱き、初めて声を上げて泣いた。');
  /* CP：抱え込んでいた人が、一人きりで崩れる */
  var BREAK = L('一人きりになった{spot}で、{a}はついに膝をついた。{a}「……どうして、置いていった」――ずっと飲み込んできた言葉が、ようやく声になった。{a}は誰にも見られないまま、長いあいだ泣いた。|{a}は{item}を握りしめたまま、壁にもたれて座り込んだ。張りつめていた糸が、ぷつりと切れたようだった。{a}の目から、こらえていた涙がとめどなく流れた。|皆の前ではいつもどおりだった{a}が、ふと姿を消した。探しに行った先で、{a}は{b}の名前を呼びながら、声を殺して泣いていた。{a}「すまない。少しだけ、このままでいたい」');
  /* 少しだけ前を向く（喪失が薄れてきたとき、一度だけ） */
  var ACCEPT = {
    sink: L('{a}は{spot}で、{b}のために静かに手を合わせた。{a}「ずっと泣いてばかりで、ごめん。もう少しだけ、ちゃんと生きてみる」――顔を上げた{a}の目に、ほんの少しだけ光が戻っていた。{a}はもう一度だけ深く頭を下げてから、皆のところへ戻った。|{a}は{b}の分まで食べると決めて、久しぶりに出されたものを残さず食べた。{a}「おいしい。……{b}にも、食べさせたかった」――涙はこぼれたが、手は止まらなかった。食べ終えた{a}は、小さく「ごちそうさま」と言った。|{a}は{item}に、小さく「おやすみ」と言ってから眠った。その夜、{a}は久しぶりに朝まで目を覚まさなかった。起きたとき、{a}の顔は少しだけ穏やかだった。'),
    blame: L('{a}は{b}に向かって、初めて「ありがとう」と言った。ずっと謝ることしかできなかった口から出た、別の言葉だった。{a}はそれで、少しだけ肩の力が抜けた。|{a}「{b}は、私に生きてほしかったんだと思う」――{a}はぽつりとそう言った。自分を許したわけではなかった。それでも、前を向く理由にはなった。|嫌な役を、{a}はもう自分だけで背負わなくなった。{a}「一緒に行こう。一人では行かない」――{b}を失ってから、{a}が初めて口にした言葉だった。隣にいた者は、黙ってうなずいた。'),
    hold: L('{a}は皆の前で、初めて{b}の話をした。短く、言葉少なだったが、声は最後まで崩れなかった。話し終えた{a}の顔は、少しだけ軽くなって見えた。|{a}は引き受けすぎていた仕事を、ようやく人に任せた。{a}「{b}にも、よく言われていた。一人で抱えすぎだと」――そう言って、{a}は珍しく自分から休んだ。その寝顔は、久しぶりに穏やかだった。|{a}は{item}を、誰の目にも見える場所に置いた。もう隠しておく必要はなかった。{a}「{b}も、ここにいればいい」'),
    bright: L('{a}は{b}の話をしながら、心から笑った。笑いながら少しだけ泣いて、また笑った。{a}「ちゃんと泣けた。……やっと」|{a}は{b}の口癖で、皆を笑わせた。今度の笑い声は、誰の耳にも本物に聞こえた。{a}「{b}の分も、私が笑っておく」|{a}はもう、一人になる時間を怖がらなくなった。{spot}で静かに座り、{b}のことを思い出す時間を持つようになった。戻ってきた{a}の笑顔は、前よりずっと自然だった。'),
    flat: L('{a}は{b}について、自分なりの区切りをつけた。{a}「悲しいのは、ちゃんと大切だったからだ」――そう言葉にできて、{a}は小さくうなずいた。それは、{a}にとって何より確かな答えだった。|{a}は{b}の残したやり方を、皆に教え始めた。{a}「{b}のやり方は、残しておく価値がある」――{b}の名前を出しても、もう声は揺れなかった。教わる者たちは、{b}の名前ごと、そのやり方を覚えていった。|{a}は{b}のいない日々を、ひとつずつ数えるのをやめた。代わりに、{b}と過ごした日のことを、ときどき思い出すことにした。{a}の表情は、前よりもやわらかくなっていた。')
  };
  /* 無茶をする（どこでも起きる文／生き残りの箱庭の文は opt.reckless） */
  var RECKLESS = L('{a}は休めと言われても、聞こうとしなかった。ふらつく足で、{b}がやっていたことにまで手を伸ばした。倒れる寸前まで、{a}は手を止めなかった。|{a}は{b}を失ってから、自分の身を守ることをやめてしまったように見えた。危ないと言われることにも、ためらわずに踏み込んでいった。{a}「怖くない。もう、怖いものなんてない」|{a}は食べることも眠ることも忘れて、ただ体を動かし続けた。じっとしていると、{b}のことしか考えられなかった。{a}の顔色は、見るたびに悪くなっていった。');
  var STOP = L('{c}が{a}の腕を強くつかんだ。{c}「一人で行かせない。{b}も、そんなことは望んでいない」|気づいた{c}が、黙って{a}の前に立ちふさがった。{a}はしばらく{c}を睨んでいたが、やがて力なくうなだれた。|{c}は{a}を追いかけて、無理やり連れ戻した。{c}「あなたまでいなくなったら、私はどうすればいい」');
  /* 慰める（{a} 慰める人／{b} 残された人／{d} 亡くなった人）。慰める人の性格の型で変わる。shared：慰める人も同じ人を亡くしている */
  var COMFORT = {
    hold: L('{a}は{b}の前に立ち、まっすぐに目を見た。{a}「{d}の分まで生きる。それが、残った者の役目だ」――厳しい言葉だったが、{a}の手は{b}の肩にしっかりと置かれていた。{b}はその重みに、少しだけ背筋を伸ばした。|{a}は{b}に、小さな仕事をひとつ任せた。{a}「手を動かしていれば、少しは楽になる。私もそうしてきた」――{b}は黙ってうなずき、言われたことをこなした。終わったとき、{b}の顔色はわずかに戻っていた。|{a}は{b}が食事を抜こうとするのを、許さなかった。{a}「食べて。{d}が見ていたら、同じことを言うはずだ」――{b}は渋々、手を伸ばした。{a}は{b}が食べ終わるまで、そばを離れなかった。'),
    sink: L('{a}は何も言わずに、{b}を抱きしめた。{b}の体は、驚くほど冷えていた。{a}の腕の中で、{b}はようやく声を上げて泣いた。|{a}は温かい飲み物を用意して、{b}の手に持たせた。{a}「無理に話さなくていい。そばにいる」――{b}は両手でそれを包み、少しずつ口をつけた。湯気の向こうで、{b}の目がにじんだ。|{a}は{b}の隣に座り、{d}の思い出をひとつずつ聞いた。{b}が言葉に詰まるたび、{a}は黙って背中をさすった。話し終えたとき、{b}は少しだけ楽な顔をしていた。'),
    flat: L('{a}は{b}に、眠れているかどうかを静かに尋ねた。{a}「今日は、私が代わる。少し横になって」――{b}が断ろうとしても、{a}は譲らなかった。その日、{b}は久しぶりに長く眠った。|{a}は{b}の話を、最後まで口を挟まずに聞いた。{a}「{b}のせいじゃない。あの状況では、誰にも止められなかった」――落ち着いた声で、{a}は一つずつ理由を挙げた。{b}は唇を噛んで、小さくうなずいた。|{a}は{b}の顔色を見て、黙って負担の軽い役目に入れ替えた。{a}「しばらくは、これでいい。急がなくていい」――{b}が礼を言いかけると、{a}は首を振った。それ以上、二人とも何も言わなかった。'),
    bright: L('{a}は{b}の隣にどかっと座り、{d}の失敗談を話し始めた。{a}「覚えてる？　あのとき{d}が――」――{b}は最初こそ黙っていたが、やがて泣きながら吹き出した。二人はしばらく、{d}の話で笑って泣いた。|{a}は{b}の手を引いて、{spot}まで連れ出した。{a}「じっとしていると、気持ちまで沈む」――{b}は渋々ついてきたが、少しだけ顔を上げた。{a}はそれ以上何も言わず、隣で一緒に深呼吸をした。|{a}は{b}の目の前で、{d}の口癖を真似してみせた。{b}は一瞬あっけにとられ、それから小さく笑った。{a}「ほら、笑えた。{d}も、きっとそっちのほうがいい」'),
    blame: L('{a}は何を言えばいいのか分からず、ただ{b}の隣に座った。{a}「……うまく言えない。でも、ここにいる」――それだけ言うと、{a}も一緒に泣いた。二人はしばらく、肩を寄せ合っていた。|{a}はそっと{b}の袖を引いた。{a}「一人で泣かないで。私も、ここにいる」――{b}は驚いたように{a}を見て、それから小さくうなずいた。袖をつかむ{a}の指は、少しだけ震えていた。|{a}は{b}が眠れるまで、小さな声で話しかけ続けた。何を話したのかは、{b}もあとでよく覚えていなかった。ただ、{a}の声がずっとそばにあったことだけは覚えていた。'),
    shared: L('{a}と{b}は、{d}の話をしながら一緒に泣いた。{a}「{d}がいないと、静かすぎる」――{b}は涙をぬぐいながら、何度もうなずいた。同じ人を失った者どうしにしか分からない沈黙が、二人のあいだに流れた。|{a}は{b}に、{d}が最後に笑っていたときのことを話した。{b}も、自分の知っている{d}の話をした。二人の知らない{d}が、少しずつつながっていった。|{a}は{b}の手を握った。{a}「{d}のこと、私たちは忘れない。だから、二人で生き延びる」――{b}は強く握り返した。二人の手は冷えていたが、握り合ったところだけは温かかった。')
  };
  /* 慰められた人の受け止め方（残された人の型） */
  var ANSWER = {
    sink: L('{b}はしゃくり上げながら、{a}の服の裾をつかんで離さなかった。|{b}は泣き腫らした目で、「ありがとう」とだけ言った。|{b}はようやく、小さく息を吐いた。'),
    blame: L('{b}「……でも、私が」――言いかけた{b}の言葉を、{a}は首を振って止めた。|{b}は何度も謝ろうとして、そのたびに言葉を飲み込んだ。|{b}は少しだけ、自分を責める言葉を口にしなくなった。'),
    hold: L('{b}「……大丈夫だ。もう、大丈夫」――そう言った{b}の声は、少しだけ震えていた。|{b}は表情を変えなかったが、{a}の手を振り払いはしなかった。|{b}は短く「すまない」と言って、目を伏せた。'),
    bright: L('{b}「やだな、泣かせないで」――{b}は笑いながら、目元をぬぐった。|{b}はいつもの軽口を言いかけて、途中で声を詰まらせた。|{b}は照れくさそうに笑ったが、その笑顔は前より自然だった。'),
    flat: L('{b}は少し考えてから、「そうかもしれない」と静かに答えた。|{b}は黙ってうなずき、{a}の言葉を胸の中で繰り返した。|{b}「……ありがとう。少し、整理できた」')
  };
  /* ふだんの出来事に混ざる一言（{a} 残された人／{b} 亡くなった人） */
  var ASIDE = {
    sink: L('{a}「{b}がいたら……」――そうつぶやいて、{a}は少し目を伏せた。|{a}はふと隣を見て、そこに{b}がいないことを思い出した。|{a}「{b}にも、見せたかった」――声が少しだけ震えた。'),
    blame: L('{a}「{b}がいたら、もっとうまくやれた」――{a}は小さく唇を噛んだ。|{a}は一瞬、{b}の名前を呼びかけて、口をつぐんだ。|{a}の顔が、ほんの一瞬だけ曇った。{b}のことを思い出したようだった。'),
    hold: L('{a}は{b}ならどうしたかを、口には出さずに考えていた。|{a}は一度だけ{b}のいた場所に目をやり、すぐに視線を戻した。|{a}「……{b}なら、こう言った」'),
    bright: L('{a}「{b}がいたら、絶対に茶化してた」――{a}は笑ったが、声が少しだけかすれた。|{a}は{b}の口癖をつい口にして、それから黙った。|{a}は笑いながら、{b}のいない隣に話しかけそうになった。'),
    flat: L('{a}は手を止めて、{b}がいた頃のことを一瞬だけ思い返した。|{a}「{b}なら、もっと早く気づいていた」|{a}は{b}の分まで数えかけて、静かに数え直した。')
  };
  var DEF_ITEMS = L('{b}の上着|{b}が使っていた物|{b}の靴');
  var DEF_SPOTS = L('部屋の隅|窓辺|いつもの場所');

  /* ======================= 仕組み ======================= */
  function ok(c) { return c && c.alive && !c.out && !c.mad && !(c.flags && c.flags.caged != null); }
  function lossOf(c) { var l = c && c.flags && c.flags.loss; return l && !l.done ? l : null; }
  G.of = lossOf;
  function stage(l) {
    if (l.type === 'flat') return l.calm ? 'deep' : l.lv >= 28 ? 'mid' : 'late';
    return l.lv >= 55 ? 'deep' : l.lv >= 28 ? 'mid' : 'late';
  }
  function vars(ctx, l, opt, extra) {
    var dn = l.name, items = opt.items || DEF_ITEMS, spots = opt.spots || DEF_SPOTS;
    var m = { b: dn, d: dn, rel: l.rel };
    m.item = fill(ctx.pick(items), { b: dn });
    m.spot = fill(ctx.pick(spots), { b: dn });
    for (var k in extra) m[k] = extra[k];
    return m;
  }
  function why(a, l, what) {
    return a.name + 'は、' + (l.rel ? l.rel + 'の' : '') + l.name + 'を失った（喪失：' + TYPE_NAME[l.type] + '・深さ ' + Math.round(l.lv) + '）' + (what ? '／' + what : '');
  }
  function addStress(c, v) { c.stress = clamp((c.stress || 0) + v, 0, 100); }

  /* 亡くなった人を見つけて、仲の良かった人に喪失を付ける */
  function scan(ctx, s, n, opt) {
    var seen = ctx.flags.gfSeen || (ctx.flags.gfSeen = {});
    /* 生き返った人（ゾンビの街の治療など）は、もう一度亡くなったときにまた数える */
    ctx.chars.forEach(function (v) { if (v.alive && seen[v.i]) delete seen[v.i]; });
    var dead = ctx.chars.filter(function (v) { return !v.alive && !v.out && !seen[v.i]; });
    if (!dead.length) return;
    var react = [];
    dead.forEach(function (v) {
      seen[v.i] = 1;
      ctx.chars.forEach(function (o) {
        if (o === v || !ok(o)) return;
        var dp = G.depth(ctx, o, v, opt);
        if (dp.d < (opt.min || 40)) return;
        var cur = lossOf(o), type = cur ? cur.type : typeOf(o);
        var lv = clamp(dp.d * MULT[type], 30, 100);
        var l = { who: v.i, name: v.name, rel: dp.rel, at: s, lv: lv, lv0: lv, type: type, last: s, aside: -9, comfortAt: -9, others: [], reckless: 0 };
        if (type === 'flat') { l.calm = true; l.crashAt = s + (opt.crash || 2) + (ctx.rng() < 0.5 ? 1 : 0); }
        if (cur && cur.lv >= lv) { cur.others.push(v.name); cur.lv = Math.min(100, cur.lv + 10); cur.lv0 = Math.max(cur.lv0, cur.lv); l = cur; }
        else {
          if (cur) { l.others = cur.others.concat([cur.name]); l.lv = l.lv0 = Math.min(100, lv + 8); l.calm = cur.calm; l.crashAt = cur.crashAt; l.broke = cur.broke; }
          o.flags.loss = l;
        }
        addStress(o, lv * (type === 'flat' ? 0.25 : type === 'hold' ? 0.4 : 0.5));
        if (o.flags.grief == null) o.flags.grief = v.i;
        if (l.who === v.i) react.push({ o: o, l: l });
      });
    });
    react.sort(function (x, y) { return y.l.lv - x.l.lv; });
    react.slice(0, opt.reactMax || 3).forEach(function (x) {
      var o = x.o, l = x.l;
      ctx.act2({ actors: [o], cat: 'solo', text: fill(ctx.pick(REACT[l.type]), vars(ctx, l, opt, { a: o.name })), why: why(o, l, '知らせを受けて'), mag: 18 + l.lv / 5 });
    });
  }
  function beat(ctx, o, l, opt) {
    l.last = ctx.stepIndex;
    addStress(o, 3);
    return { text: fill(ctx.pick(BEAT[l.type][stage(l)]), vars(ctx, l, opt, { a: o.name })), why: why(o, l, stage(l) === 'late' ? '少しずつ薄れてきた' : 'まだ引きずっている'), mag: 8 + l.lv / 8 };
  }
  function comfort(ctx, a, b, opt) {
    var l = lossOf(b), al = lossOf(a), shared = al && al.who === l.who;
    var key = shared ? 'shared' : typeOf(a);
    var spots = (opt.spots || DEF_SPOTS).filter(function (x) { return x.indexOf('{b}') < 0; });
    var m = vars(ctx, l, { items: opt.items, spots: spots.length ? spots : DEF_SPOTS }, { a: a.name, b: b.name, d: l.name });
    var t = fill(ctx.pick(COMFORT[key]), m) + fill(ctx.pick(ANSWER[l.type]), m);
    l.comfortAt = ctx.stepIndex; l.last = ctx.stepIndex; l.comforts = (l.comforts || 0) + 1;
    l.lv = Math.max(0, l.lv - (shared ? 8 : 6));
    if (l.type === 'flat' && l.calm) l.crashAt = Math.min(l.crashAt, ctx.stepIndex + 1);
    addStress(b, -10);
    ctx.mod(b, a, { trust: 6, aff: 5 }); ctx.mod(a, b, { aff: 3 });
    return { text: t, why: a.name + 'が、' + l.name + 'を失った' + b.name + 'に寄り添った（慰める側：' + (shared ? '同じ人を亡くした者どうし' : TYPE_NAME[key] + 'の型') + '／' + b.name + '：' + TYPE_NAME[l.type] + '・深さ ' + Math.round(l.lv) + '）', mag: 14 };
  }
  function nearFriend(ctx, o, except) {
    var best = null, bv = 15;
    ctx.others(o).forEach(function (c) { if (!ok(c) || c === except) return; var v = ctx.R(c, o).aff + c.tr.np * 20 + ctx.rng() * 10; if (v > bv) { bv = v; best = c; } });
    return best;
  }
  /* 区切りの終わり：崩れる・強制の一場面・薄れる */
  function tick(ctx, s, n, opt) {
    var beats = 0, comforts = 0;
    ctx.chars.forEach(function (o) {
      var l = lossOf(o);
      if (l && ctx.chars[l.who] && ctx.chars[l.who].alive) { l.done = true; return; }
      if (!l || !ok(o) || l.at === s) return;
      var t = null;
      if (l.type === 'flat' && l.calm && s >= l.crashAt) {
        l.calm = false; l.lv = Math.min(100, l.lv + 15); l.lv0 = Math.max(l.lv0, l.lv); l.last = s; addStress(o, 25);
        t = { text: fill(ctx.pick(CRASH), vars(ctx, l, opt, { a: o.name })), why: why(o, l, '淡々としていた分、あとから崩れた'), mag: 25 };
      } else if (l.type === 'hold' && !l.broke && l.lv >= 40 && (o.stress >= 65 || s - l.at >= 4) && ctx.rng() < 0.5) {
        l.broke = true; l.last = s; addStress(o, -10);
        t = { text: fill(ctx.pick(BREAK), vars(ctx, l, opt, { a: o.name })), why: why(o, l, '人前では抱え込んでいたものが、一人のときに崩れた'), mag: 22 };
      } else if (!l.accepted && !l.calm && l.lv < Math.max(24, l.lv0 * 0.5) && s - l.at >= Math.max(3, (n - l.at) * 0.5)) {
        l.accepted = true; l.last = s;
        t = { text: fill(ctx.pick(ACCEPT[l.type]), vars(ctx, l, opt, { a: o.name })), why: why(o, l, '少しだけ前を向いた'), mag: 15 };
      } else if (comforts < 1 && l.lv >= 45 && s - l.comfortAt >= 3 && (l.comforts || 0) < 4 && ctx.rng() < 0.35) {
        var c = nearFriend(ctx, o, null);
        if (c && !(lossOf(c) && lossOf(c).who !== l.who && lossOf(c).lv > 60)) { comforts++; var r = comfort(ctx, c, o, opt); ctx.act2({ actors: [c, o], cat: 'help', text: r.text, why: r.why, mag: r.mag }); }
      } else if (beats < 2 && l.lv >= 30 && s - l.last >= (l.lv >= 60 ? 2 : 3) && ctx.rng() < 0.55) {
        beats++; t = beat(ctx, o, l, opt);
      }
      if (t) ctx.act2({ actors: [o], cat: 'solo', text: t.text, why: t.why, mag: t.mag });
      /* ストレスが抜けきらない */
      addStress(o, l.lv / 20);
      /* 薄れる（残りの区切り、または opt.span の区切りで、はじめの深さの6割ほど）。淡々としているあいだは薄れない */
      if (!l.calm) l.lv = Math.max(0, l.lv - Math.max(1.5, l.lv0 * 0.6 / Math.max(2, Math.min(n - l.at, opt.span || 99))));
      if (l.lv <= 6 && l.accepted) l.done = true;
    });
  }

  /* 引きずっている人のふだんの出来事に、ときどき一言 */
  var SKIP_CAT = /^(?:romance|lewd|sex|death|combat|betray)$/;
  function aside(ctx, a, r, cat) {
    if (!r || typeof r.text !== 'string' || !r.text) return r;
    if (SKIP_CAT.test(r.cat || cat || '')) return r;
    var l = lossOf(a);
    if (!l || l.lv < 25 || l.calm || ctx.stepIndex - l.at < 1 || ctx.stepIndex - l.aside < 3 || (l.asides || 0) >= 6 || r.text.indexOf(l.name) >= 0) return r;
    if (ctx.rng() > 0.08 + l.lv / 500) return r;
    l.aside = ctx.stepIndex; l.asides = (l.asides || 0) + 1;
    r.text += fill(ctx.pick(ASIDE[l.type]), { a: a.name, b: l.name });
    r.why = (r.why ? r.why + '／' : '') + a.name + 'は、まだ' + l.name + 'のことを引きずっている（喪失：' + TYPE_NAME[l.type] + '）';
    return r;
  }
  var MINE = [];
  var bp0 = HK.buildPool;
  HK.buildPool = function (scen) {
    var pool = bp0.apply(this, arguments);
    if (!scen || !scen.griefKit) return pool;
    return pool.map(function (e) {
      /* 慰める出来事には受け止め方の文が入っているので、二人の出来事の反応（pair-react.js）を重ねない */
      var pr = e && Object.getPrototypeOf(e);
      if (pr && MINE.indexOf(pr) >= 0) return pr;
      if (!e || typeof e.run !== 'function' || /^gf_/.test(e.id || '') || e.r18 || SKIP_CAT.test(e.cat || '')) return e;
      var w = Object.create(e);
      w.run = function (ctx, a) { return aside(ctx, a, e.run.apply(this, arguments), e.cat); };
      return w;
    });
  };

  G.install = function (scen, opt) {
    if (!scen || !scen.events || scen.griefKit) return;
    scen.griefKit = opt = opt || {};
    var ph0 = scen.phase, af0 = scen.after;
    scen.phase = function (ctx, s, n) { var r = ph0 ? ph0.apply(this, arguments) : undefined; ctx.flush(); scan(ctx, s, n, opt); return r; };
    scen.after = function (ctx, s, n) { var r = af0 ? af0.apply(this, arguments) : undefined; ctx.flush(); scan(ctx, s, n, opt); tick(ctx, s, n, opt); return r; };
    var n0 = scen.events.length;
    scen.events.push({
      id: 'gf_think', cat: 'solo', scope: 'solo', noOdd: true,
      when: function (ctx, a) { var l = lossOf(a); return !!l && l.lv >= 15 && ctx.stepIndex - l.last >= 2; },
      w: function (ctx, a) { return (0.4 + lossOf(a).lv / 30) * (opt.w || 1); },
      run: function (ctx, a) { return beat(ctx, a, lossOf(a), opt); }
    });
    scen.events.push({
      id: 'gf_reckless', cat: 'solo', scope: 'solo', noOdd: true,
      when: function (ctx, a) { var l = lossOf(a); return !!l && l.lv >= 50 && !l.calm && l.reckless < 2 && l.type !== 'flat' && ctx.stepIndex - l.at >= 1; },
      w: function (ctx, a) { var l = lossOf(a); return (0.2 + a.tr.impulse * 0.8 + (l.type === 'blame' || l.type === 'bright' ? 0.4 : 0)) * (opt.w || 1); },
      run: function (ctx, a) {
        var l = lossOf(a), c = nearFriend(ctx, a, null);
        l.reckless++; l.last = ctx.stepIndex; addStress(a, 5);
        var list = opt.reckless ? RECKLESS.concat(opt.reckless) : RECKLESS;
        var t = fill(ctx.pick(list), vars(ctx, l, opt, { a: a.name }));
        if (c) { t += fill(ctx.pick(STOP), { a: a.name, b: l.name, c: c.name }); ctx.mod(a, c, { trust: 5 }); ctx.mod(c, a, { aff: 3 }); }
        return { text: t, why: why(a, l, '自分を大事にできなくなっている') + (c ? '／' + c.name + 'が止めた' : ''), mag: 16, with: c ? [c] : null };
      }
    });
    scen.events.push({
      id: 'gf_comfort', cat: 'help', scope: 'pair', noOdd: true,
      when: function (ctx, a, b) {
        var l = lossOf(b);
        if (!l || l.lv < 20 || l.who === a.i || ctx.stepIndex - l.comfortAt < 3 || (l.comforts || 0) >= 4 || !ok(b)) return false;
        var la = lossOf(a); if (la && la.who !== l.who && la.lv > 60) return false;
        return ctx.R(a, b).aff > 5;
      },
      w: function (ctx, a, b) { return (0.3 + a.tr.np * 0.9 + Math.max(0, ctx.R(a, b).aff) / 100) * (lossOf(b).lv / 70) * (opt.w || 1); },
      run: function (ctx, a, b) { return comfort(ctx, a, b, opt); }
    });
    MINE = MINE.concat(scen.events.slice(n0));
  };

  /* ======================= 箱庭ごとの組み込み ======================= */
  var SURVIVE = L('{a}は誰にも告げずに、一番危ない役目を引き受けた。{a}「どうなってもいい。今はそれでいい」――そのつぶやきを聞いた者は、背筋が冷たくなった。{a}は無事に戻ったが、その顔には何の色も浮かんでいなかった。');
  /* ゾンビの街は一日が四つの区切り（朝・昼・夕方・夜）なので、A の人が崩れるのは一日あまりあと */
  G.install(SC.zombie, {
    crash: 5, span: 20,
    items: L('{b}が使っていた懐中電灯|{b}の上着|{b}の腕時計|{b}が最後まで持っていた鞄'),
    spots: L('バリケードの陰|見張り台|隠れ家の屋上|崩れた非常階段'),
    reckless: SURVIVE.concat(L('{a}は武器も持たずに、{b}を失った場所へ一人で向かおうとした。{a}「{b}を、置いてきたままにできない」――外にはまだ、呻き声がいくつも響いていた。{a}の足は、それでも止まらなかった。|{a}はわざと物音を立てて、ゾンビの群れのほうへ歩いていった。まるで、自分から見つかろうとしているようだった。寸前で引き返したのは、ほとんど偶然だった。|{a}は見張りの番を、何日も続けて誰にも譲らなかった。眠らずに暗がりを見つめる目は、どこか焦点が合っていなかった。{a}「来るなら来ればいい。私が全部、相手をする」'))
  });
  G.install(SC.island, {
    items: L('{b}が編んだ籠|{b}の上着|{b}が拾った貝殻|{b}の靴'),
    spots: L('浜辺|焚き火のそば|岩場|見晴らしのいい丘'),
    reckless: SURVIVE.concat(L('{a}は荒れた海に、一人で漁に出ようとした。{a}「じっとしていると、{b}のことばかり考える」――波は、岩場を白く洗っていた。引き止められなければ、{a}は本当に沖へ出ていた。|{a}は誰も行かない崖の上まで、食べ物を探しに登っていった。足場の悪い斜面を、{a}はほとんど確かめもせずに進んだ。戻ってきた{a}の腕は、擦り傷だらけだった。|{a}は{b}が最後に向かった森の奥へ、何度も一人で入っていった。何かを探しているようでもあり、何かから逃げているようでもあった。{a}は夕暮れまで戻らなかった。'))
  });
  G.install(SC.classroom, {
    mate: 'クラスメイト', span: 6,
    items: L('{b}に借りたままのノート|{b}の机に置かれた花|{b}と撮った写真|{b}のシャープペン'),
    spots: L('教室の窓際|屋上|いつもの帰り道|{b}の空いた席の前')
  });
  G.install(SC.whiteroom, {
    span: 24,
    items: L('{b}の上着|{b}が壁に刻んだ印|{b}の靴'),
    spots: L('部屋の隅|白い壁の前|ベッドの端|扉の前')
  });
  /* オメガバースは半月ごとの区切りで長いので、半年ほどで薄れる */
  G.install(SC.omega, {
    span: 12,
    items: L('{b}の匂いが残る服|{b}の上着|{b}と撮った写真|{b}のマグカップ'),
    spots: L('窓辺|部屋の隅|二人でよく座ったベンチ|ベランダ')
  });
  /* 全年齢版だけの箱庭（R18版にはない） */
  G.install(SC.br, {
    items: L('{b}の上着|{b}が持っていた地図|{b}の水筒'),
    spots: L('岩陰|廃屋の陰|茂みの奥|崖の上'),
    reckless: SURVIVE, reactMax: 2
  });
  G.install(SC.trial, {
    items: L('{b}の上着|{b}の部屋の鍵|{b}が使っていたペン'),
    spots: L('ホテルの廊下|{b}の部屋の前|食堂の隅|ロビーのソファ'),
    reactMax: 2
  });
})();
