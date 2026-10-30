/* 箱庭シミュレーター（R18版のみ）: 出られない部屋 ― エッチの回数が多い部屋で、住人の体力を加味する（2026-10-30 担当W2）
   利用者の要望（2026-10-30）：「エッチしないと出られない部屋は、住人の体力も加味するようにしてほしい。回数を多く重ねているとき、
     体力がない人はぐったりとした描写が増えるし、受けが虚ろな表情でぼーっとしてるのをみて、攻めがもう一回したくなるのとかがみたい」
   ■ 体力：部屋の能力値「体力」（scenario-room.js の stats hp。1〜5、既定はランダム・未指定は 3＝ふつう）
   ■ 働く部屋：条件にエッチがあり、その回数が 5 回以上（まとめて進む回もここに入る）
   ■ 疲れ（ctx.flags.stam.load）：条件のエッチが数えられるたびに、組の二人に回数ぶん溜まる（受けは 1.2 倍）。区切りごとに体力に応じて抜ける。
     三人の場面は組ごとに数えるので、真ん中の人（二組に入る人）に先に溜まる。体力の器（1:3／2:5／3:7／4:10／5:14 回ぶん）に対する割合で段階を決める：
     0＝余裕・1＝息が上がる・2＝ぐったり（受けは虚ろ）・3＝足が立たない
   ■ 出来事・段
     ・区切りの始めに、直前の区切りまでエッチをしていた組の「疲れ」の段（rs_tired 相当。理由の欄に〔体力〕）：段階 1 は半分、2 以上は毎回。
       疲れた人の地の文（段階別）と、短く崩れた台詞（3 本・態度9種）。相手の体力が高ければ、余裕の側から気遣う／からかう。二人とも疲れていれば、並んで動けない
     ・段階 3（足が立たない）で、二人の条件が残っていれば「少し休む」区切り（その区切りは、その二人の体の出来事を起こさない。時間は進む。倒れる・死ぬことはない）
     ・rs_again：受けが虚ろ（段階 2 以上）で、攻めにまだ余力があるとき、攻めがそれを見て「もう一回したくなる」。攻めの態度9種の一言のあと、
       攻めの性格・性欲で「堪える／もう一回する／気遣って水を飲ませる」に分岐。もう一回は受けが応じたときだけ（受けが拒めば堪える側に回る。合意のない形にはしない）。
       もう一回の場面は HK.RoomLewd.scene（repeat）で書き、HK.SexLead がその直前に「二度目の理由」のきっかけの段を出す。体の関係の組は HK.Pos.okSex（受け攻め・固定・恋愛対象）
     ・ダイジェストの段（room-lewd.js の digestH。まとめて進んだ回）に、体力の状態を 1 文足す
   ■ 文：虚ろの描写は 男×女（男×男も）・女×女・女攻め×男 で書き分け。台詞は 3 本「くだけた常体｜硬い常体｜敬語」（一人称「私」・二人称「あなた」）。
     部屋の数え上げ（countFlavor）に拾われる触れ合いの言い回しは書かない。体の語は使わない（場面の文は RoomLewd が書く）。
   登場人物はすべて成人として扱う */
/* @event-ok 疲れの段・少し休む段（区切りの始めに出す記録。山から選ぶ出来事ではない）と、ダイジェストの段の体力の 1 文 */
(function () {
  'use strict';
  var HK = window.HK, A = HK && HK.RoomAPI, scen = HK && HK.SCENARIOS && HK.SCENARIOS.whiteroom;
  if (!HK || HK.SAFE_ON || !A || !scen || !A.EV || !HK.addTo) return;
  function L(s) { return s.split('|'); }
  var PS = ['proud', 'stern', 'tsun', 'gentle', 'devoted', 'cool', 'free', 'shy', 'polite'];
  function ps(c) { var p = c && (HK.personaOf ? HK.personaOf(c) : c.persona); return PS.indexOf(p) >= 0 ? p : 'gentle'; }
  function R(ctx, a, b) { return ctx.R(a, b); }
  function hRule(ctx) { return (ctx.rules || []).filter(function (r) { return r.k === 'h'; })[0] || null; }
  function on(ctx) { var S = ctx && ctx.flags && ctx.flags.stam; return !!(S && S.on) && !HK.SAFE_ON; }
  function here(c) { return !!c && c.alive !== false && !c.out && !(c.flags && (c.flags.down || c.flags.knocked || c.flags.caged != null)); }
  var CAP = [9, 4, 6, 9, 13, 20];
  function hpOf(ctx, c) { var v = ctx.stat ? ctx.stat(c, 'hp') : 3; return Math.max(1, Math.min(5, +v || 3)); }
  function capOf(ctx, c) { return CAP[hpOf(ctx, c)]; }
  function recOf(ctx, c) { return (0.2 + hpOf(ctx, c) * 0.2) * Math.max(1, ctx.stepH || 1); }
  function lvOf(ctx, c, extra) {
    var S = ctx.flags.stam, f = ((S.load[c.i] || 0) + (extra || 0)) / capOf(ctx, c);
    return f < 0.45 ? 0 : f < 0.9 ? 1 : f < 1.4 ? 2 : 3;
  }
  function order(a, b) { return HK.Pos && HK.Pos.order ? HK.Pos.order(a, b, [a, b]) : [a, b]; }
  function combo(top, bot) { var P = HK.Pos; return P && P.ff && P.ff(top, bot) ? 'ff' : P && P.isF && P.isF(top, bot) && !P.isF(bot, top) ? 'fm' : 'mf'; }
  HK.RoomStamina = { lv: function (ctx, c) { return on(ctx) ? lvOf(ctx, c) : 0; }, on: on };

  /* ---------- 文 ---------- */
  /* 疲れた人 {a}（相手は {b}）の地の文：段階別 */
  var TIRED = {
    1: L('{a}の息は、さっきからなかなか整わなかった。シーツに片手をついたまま、肩で大きく呼吸している。{b}が何か言っても、{a}の返事は短くなっていた。|{a}は額の汗を拭って、ベッドの端に腰を下ろした。体のあちこちが重く、指先まで熱が残っている。扉の紙の数字を見上げる目も、少しぼんやりしていた。|{a}は水を一口飲んで、長く息を吐いた。まだ動けないほどではないが、さっきより体が重い。{b}に話しかけられて、{a}は少し遅れて顔を上げた。|{a}は枕に背中を預けて、天井を見上げた。汗の引かない額に、前髪が張りついている。{b}の問いかけに、{a}は短い相槌しか返せなかった。|{a}は何度か深呼吸をして、乱れた息を落ち着けようとした。胸の鼓動が、まだ耳の奥で鳴っている。扉の紙の数字を数える気力は、少しずつ削られていた。'),
    2: L('{a}はベッドに沈み込んだまま、しばらく動けなかった。まぶたが重く、気を抜くとそのまま眠ってしまいそうだった。{b}に呼ばれても、{a}は小さく頷くのがやっとだった。|{a}は起き上がろうとして、そのまま座り込んだ。膝に力が入らず、息もまだ上がったままだった。返事をしようとした声は、途中でかすれて消えた。|{a}はシーツにうつ伏せになったまま、ぐったりと動かなかった。眠気と疲れが一度に押し寄せて、頭がうまく回らない。{b}の声が、ずいぶん遠くに聞こえた。|{a}は横になったまま、まばたきの回数ばかり増えていった。気を抜けば、そのまま意識が落ちてしまいそうだった。扉の紙の数字が、ぼやけて二重に見えた。|{a}はシーツの端を握ったまま、ぼんやりと宙を見ていた。体のどこにも力が入らない。{b}が声をかけても、返事は小さな吐息にしかならなかった。'),
    3: L('{a}は、もう自分の足で立てなかった。ベッドの端に指をかけても、体を起こす力が残っていない。呼吸は浅く、目は半分閉じかけていた。|{a}の脚は、立ち上がろうとするたびに震えて崩れた。声を出す元気もなく、{a}はシーツの上で丸くなった。まぶたが、勝手に落ちてくる。|{a}は体を起こそうとして、そのまま横に倒れ込んだ。腕にも脚にも、もう力が残っていない。浅い息だけが、静かな部屋に響いていた。')
  };
  /* 疲れた人の短く崩れた一言（態度9種。段階 1・2 以上） */
  var LINE = {
    1: {
      proud: L('{a}「はぁ……っ、まだ、いける……｜はぁ……っ、まだ、いける……｜はぁ……っ、まだ、いけます……」'),
      stern: L('{a}「……少し、息が上がっただけ｜……少し、息が上がっただけだ｜……少し、息が上がっただけです」'),
      tsun: L('{a}「つ、疲れてなんか……っ、ない……｜疲れてなど……っ、いない……｜つ、疲れてなんか……っ、いません……」'),
      gentle: L('{a}「ちょっと……っ、休憩、したいかも……｜少し……っ、休憩したい……｜ちょっと……っ、休憩、したいです……」'),
      devoted: L('{a}「だ、大丈夫……っ、まだ、平気……｜大丈夫……っ、まだ平気……｜だ、大丈夫です……っ、まだ、平気です……」'),
      cool: L('{a}「……ペース、落とそう｜……ペースを落とそう｜……ペースを、落としましょう」'),
      free: L('{a}「はー……っ、さすがに、きつ……｜はあ……っ、さすがに、きつい……｜はー……っ、さすがに、きついです……」'),
      shy: L('{a}「……っ、ちょっと、だけ……休ませて……｜……っ、少し、だけ……休ませてくれ……｜……っ、ちょっと、だけ……休ませてください……」'),
      polite: L('{a}「……っ、ごめん、少し……息を整えたい｜……っ、すまない、少し息を整えたい｜……っ、すみません、少し……息を整えさせてください」')
    },
    2: {
      proud: L('{a}「……っ、ちょ、待っ……足、動かない……｜……っ、待て……足が動かない……｜……っ、ま、待ってください……足が、動きません……」'),
      stern: L('{a}「……っ、ごめん……立て、ない……｜……っ、すまない……立てない……｜……っ、すみません……立て、ません……」'),
      tsun: L('{a}「……っ、う、うるさ……ちょっと、黙って……｜……っ、うるさい……少し黙れ……｜……っ、う、うるさいです……少し、黙ってください……」'),
      gentle: L('{a}「……っ、ごめ……ねむ、い……｜……っ、すまない……眠い……｜……っ、ごめんなさい……ねむ、いです……」'),
      devoted: L('{a}「……っ、まだ、できる、から……｜……っ、まだ、できる……｜……っ、まだ、できます、から……」'),
      cool: L('{a}「……っ、限界、かも……｜……っ、限界、だ……｜……っ、限界、です……」'),
      free: L('{a}「……っ、もう、むり……｜……っ、もう、無理だ……｜……っ、もう、無理です……」'),
      shy: L('{a}「……っ、も、もう……｜……っ、もう……｜……っ、も、もう……」'),
      polite: L('{a}「……っ、ごめん……少し、だけ……｜……っ、すまない……少しだけ……｜……っ、すみません……少し、だけ……」')
    }
  };
  /* 体力に余裕のある相手 {b}（疲れた人は {a}）：気遣う／からかう */
  var EASY = {
    care: L('{b}はまだ余裕のある顔で、{a}の額の汗を拭ってやった。「無理しなくていいよ。少し休もう｜無理はするな。少し休もう｜無理しなくていいですよ。少し休みましょう」{b}の息は、ほとんど乱れていなかった。|{b}は軽い足取りでテーブルまで行き、水を汲んで戻ってきた。「水、持ってきた。そのまま寝てて｜水を持ってきた。そのまま寝ていろ｜水を持ってきました。そのまま寝ていてください」{a}は、礼を言う元気もなく頷いた。'),
    tease: L('{b}は息ひとつ乱さずに、ぐったりした{a}を見下ろして笑った。「もうへばったの？ まだ先は長いよ｜もうへばったのか。まだ先は長いぞ｜もうへばったんですか？ まだ先は長いですよ」{a}は言い返す元気もなく、枕に顔を埋めた。|{b}は{a}の隣で頬杖をついた。「体力ないなあ。外に出たら、一緒に走り込みでもする？｜体力がないな。外に出たら、一緒に走り込みでもするか｜体力がないですね。外に出たら、一緒に走り込みでもしますか？」{a}は、うめくような声で返事をした。')
  };
  var BOTH = L('{b}も、{a}の隣で仰向けになったまま天井を見ていた。二人とも、しばらく口をきく元気がなかった。扉の紙の数字だけが、二人を見下ろしていた。|{b}も、壁にもたれて座り込んだまま動かなかった。どちらが先に起き上がるか、我慢比べのような沈黙が続いた。扉の紙の残りは、まだあった。|{b}も額の汗を拭いながら、ベッドの端に座り込んでいた。二人とも、次に何を言えばいいのか分からなかった。扉の紙の数字は、ちっとも減った気がしなかった。|{b}もシーツの上に大の字になって、荒い息をついていた。どちらからともなく、小さく笑いがこぼれた。扉の紙のことは、少しだけ忘れていた。');
  var MILD = L('{b}は{a}の様子をちらりと見て、少し間を置くことにした。扉の紙の残りを数えるのは、あとでいい。|{b}は{a}の背中を軽く叩いて、隣に腰を下ろした。扉の紙のほうは、しばらく見ないことにした。|{b}は黙って、{a}の分の水をテーブルから取ってきた。扉の紙を見上げるのは、{a}の息が整ってからでいい。');
  /* 少し休む（{a}＝動けなくなった人、{b}＝相手） */
  var REST = L('{a}がとうとう動けなくなったので、{a}と{b}は少し休むことにした。{b}がシーツを掛け直し、二人は並んで横になった。扉の紙の残りはまだあったが、今は数字を見ないことにした。時計の針だけが進んでいった。|{a}の脚が言うことをきかなくなって、二人はいったん手を止めた。{b}は{a}に水を飲ませてから、明かりの下で目を閉じた。扉の紙の条件は、まだ終わっていない。それでも今は、休むほかなかった。');
  var REST_LINE = L('{b}「少し休もう。焦っても、体がもたないよ｜少し休もう。焦っても、体がもたない｜少し休みましょう。焦っても、体がもちません」|{a}「……ごめん、少しだけ……寝かせて……｜……すまない、少しだけ……寝かせてくれ……｜……すみません、少しだけ……寝かせてください……」');
  /* ダイジェストに足す 1 文（{a}＝いちばん疲れた人、{b}＝相手） */
  var DIG = {
    0: L('回数を重ねても、{a}も{b}も、まだ息に余裕があった。|何度目かのあとでも、{a}は平然とした顔で{b}に水を差し出した。'),
    1: L('回数を重ねるうちに、{a}の息はだんだん整わなくなっていった。|途中から、{a}は終わるたびに肩で大きく息をするようになっていた。'),
    2: L('終わるころには、{a}はぐったりとシーツに沈み、返事もろくにできなくなっていた。|最後のほうの{a}は、目を開けているのもやっとのような顔をしていた。'),
    3: L('最後のほうは、{a}はもう自分で体を起こすこともできなかった。|終わったときには、{a}の脚は震えて、もう少しも力が入らなかった。')
  };
  var DIG_EASY = L('{b}だけは、まだ平然としていた。|{b}の息だけは、ほとんど乱れていなかった。');

  /* 受け {b} が虚ろな表情でぼーっとしている（組の性別ごと。{a}＝攻め） */
  var HAZY = {
    mf: L('{b}はシーツの上に横たわったまま、焦点の合わない目で天井を見つめていた。乱れた髪が頬に張りつき、唇はかすかに開いたままだった。{a}が名前を呼んでも、{b}はぼんやりと瞬きを返すだけだった。|{b}はとろんとした目のまま、{a}の腕にもたれかかっていた。頬は上気して、まつげの先が汗で濡れている。何か言おうとして開いた唇から、言葉の代わりに浅い息だけがこぼれた。'),
    ff: L('{b}は枕に頬を埋めたまま、とろんとした目で{a}を見上げていた。汗に濡れた前髪の下で、まつげがゆっくり上下している。{a}が指先で{b}の頬をなぞっても、{b}は小さく息を漏らすだけで、何も言わなかった。|{b}は{a}の膝に頭を預けるでもなく、シーツの上でぼうっと宙を見ていた。乱れた髪が白い肩に散らばっている。{a}が顔を覗き込むと、{b}は少し遅れて、ふにゃりと笑った。'),
    fm: L('{b}は仰向けのまま、ぼうっと宙を見ていた。肩が大きく上下し、半開きの口からは浅い息がこぼれている。{a}が上から顔を覗き込んでも、{b}の目はなかなか{a}に焦点を結ばなかった。|{b}はシーツに投げ出した腕を動かす気力もなく、虚ろな目で{a}を見上げていた。汗に濡れた前髪が額に張りつき、喉が小さく鳴る。{a}が名前を呼ぶと、{b}は返事の代わりに、ゆっくり一度だけ瞬きをした。')
  };
  /* それを見た攻め {a} の一言（態度9種） */
  var WANT = {
    proud: L('{a}は、その無防備な顔から目が離せなくなった。「……もう、止まれないよ｜……もう、止まれない｜……もう、止まれません」'),
    stern: L('{a}は思わず息を呑んだ。自制しなければと分かっているのに、視線が{b}から外れない。「……いけない。今のは、反則だよ｜……いけない。今のは、反則だ｜……いけません。今のは、反則です」'),
    tsun: L('{a}は慌てて顔を背けた。けれど、耳まで熱くなっているのは隠せなかった。「……な、何その顔。ずるい……｜……何だ、その顔は。ずるい……｜……な、何ですか、その顔。ずるいです……」'),
    gentle: L('{a}は、{b}の頬にかかった髪をそっとよけた。胸の奥が、またじわりと熱くなった。「……かわいい。もう一回、って言ったら怒る？｜……かわいい。もう一回、と言ったら怒るか？｜……かわいいです。もう一回、と言ったら怒りますか？」'),
    devoted: L('{a}は{b}の隣に膝をついて、その顔をじっと見つめた。愛おしさと、もう一度触れたい気持ちが、同時にこみ上げてきた。「……ごめん。もう少しだけ、触れていたい｜……すまない。もう少しだけ、触れていたい｜……ごめんなさい。もう少しだけ、触れていたいです」'),
    cool: L('{a}は表情を変えないまま、{b}をしばらく見下ろしていた。その目の奥にだけ、熱がくすぶっていた。「……その顔は、少し困る｜＝｜……その顔は、少し困ります」'),
    free: L('{a}は{b}の顔を覗き込んで、にやりと笑った。「……ねえ、その顔、反則。もう一回しよっか｜……その顔は反則だ。もう一回するか｜……その顔、反則ですよ。もう一回しませんか」'),
    shy: L('{a}は真っ赤になって、{b}から目を逸らした。それでも、ちらちらと何度も見てしまう。「……あ、あの……そ、その顔……ずるい……｜……その顔は……ずるい……｜……あ、あの……そ、その顔……ずるいです……」'),
    polite: L('{a}は小さく咳払いをして、姿勢を正そうとした。けれど、{b}のとろけた表情から、どうしても目が離せなかった。「……失礼。少し、我慢がきかなくなりそうだ｜＝｜……失礼しました。少し、我慢がきかなくなりそうです」')
  };
  var ENDURE = L('{a}は深く息を吐いて、伸ばしかけた指先を握り込んだ。これ以上は、{b}の体がもたない。{a}はシーツを{b}の肩まで引き上げて、隣に横になった。扉の紙の数字は、まだ残っていた。|{a}は自分の頬を軽く叩いて、{b}から目を逸らした。今は{b}を休ませるのが先だ。{a}は枕を{b}の頭の下に押し込んで、ベッドの端に腰を下ろした。扉の紙の数字は、あとで数えればいい。');
  var ENDURE_LINE = L('{a}「……今は休んで。続きは、またあとで｜……今は休め。続きは、またあとだ｜……今は休んでください。続きは、またあとで」|{a}「……我慢する。ちゃんと寝てて｜……我慢する。ちゃんと寝ていろ｜……我慢します。ちゃんと寝ていてください」');
  var WATER = L('{a}は立ち上がって、テーブルの水差しから水を汲んできた。{b}の背中を支えて起こし、少しずつ水を飲ませる。{b}はこくこくと喉を鳴らして、ようやく少しだけ目に光が戻った。扉の紙の数字は、今は見ないことにした。|{a}は冷たいタオルを絞って、{b}の首筋に当てた。それから水の入ったコップを、{b}の唇まで運んでやる。{b}は半分眠ったまま、それをゆっくり飲み干した。扉の紙のほうは、しばらく放っておくことにした。');
  var WATER_LINE = L('{a}「ゆっくり飲んで。……無理させて、ごめん｜ゆっくり飲め。……無理をさせて、すまない｜ゆっくり飲んでください。……無理をさせて、すみません」|{a}「落ち着くまで、ここにいるから｜落ち着くまで、ここにいる｜落ち着くまで、ここにいますから」');
  var YES = L('{a}が名前を呼ぶと、{b}はぼんやりしたまま、小さく頷いた。「……ん……いい、よ……｜……ああ……いい……｜……ん……いい、です……」扉の紙の数字が、まだ残っていることを、二人とも覚えていた。|{a}が耳元で訊くと、{b}はとろけた目のまま、{a}の首に腕を回した。「……もう一回、だけ……｜……もう一回、だけだ……｜……もう一回、だけ、です……」扉の紙の残りが、二人の背中を押した。');
  var NO = L('{a}が名前を呼ぶと、{b}は弱々しく首を振った。「……ごめ、ん……今は、無理……｜……すまない……今は、無理だ……｜……ごめん、なさい……今は、無理です……」{a}は苦笑して、それ以上は求めなかった。扉の紙の数字は、まだ残っていた。');

  /* ---------- 疲れの記録 ---------- */
  function key(a, b) { return a.i < b.i ? a.i + '-' + b.i : b.i + '-' + a.i; }
  /* 同じ回の中で、同じ文をなるべく繰り返さない */
  function fresh(ctx, arr) {
    var U = ctx.flags.stam.used, c = arr.filter(function (s) { return !U[s]; }), s = ctx.pick(c.length ? c : arr);
    U[s] = 1;
    return s;
  }
  /* 条件のエッチの数が増えた組に、疲れを足す（受けは 1.2 倍） */
  function track(ctx) {
    var S = ctx.flags.stam, P = ctx.flags.prog || {};
    Object.keys(P).forEach(function (k) {
      var v = (P[k] && P[k].act && P[k].act.h) || 0, v0 = S.seen[k] || 0;
      if (v === v0) return;
      S.seen[k] = v;
      if (v < v0) return;
      var ij = k.split('-'), a = ctx.chars[+ij[0]], b = ctx.chars[+ij[1]];
      if (!a || !b) return;
      var o = order(a, b), d = v - v0;
      S.load[o[0].i] = (S.load[o[0].i] || 0) + d;
      S.load[o[1].i] = (S.load[o[1].i] || 0) + d * 1.2;
      S.lastH[a.i] = S.lastH[b.i] = ctx.stepIndex;
      S.mate[a.i] = b.i; S.mate[b.i] = a.i;
    });
  }
  function resting(ctx, c) { var S = ctx.flags.stam; return on(ctx) && c && S.rest[c.i] === ctx.stepIndex; }
  /* 区切りの始め：疲れを抜いてから、直前までエッチをしていた組に、疲れの段・少し休む段を出す */
  function onStep(ctx) {
    var S = ctx.flags.stam, s = ctx.stepIndex || 0;
    if (!s) return;
    ctx.chars.forEach(function (c) { if (S.load[c.i]) S.load[c.i] = Math.max(0, S.load[c.i] - recOf(ctx, c)); });
    var r = hRule(ctx), done = {};
    ctx.chars.forEach(function (c) {
      var m = S.mate[c.i] != null ? ctx.chars[S.mate[c.i]] : null;
      if (!m || done[c.i] || done[m.i] || !here(c) || !here(m) || S.mate[m.i] !== c.i) return;
      if (S.lastH[c.i] == null || s - S.lastH[c.i] > 2) return;
      done[c.i] = done[m.i] = 1;
      var lc = lvOf(ctx, c), lm = lvOf(ctx, m), x = lc >= lm ? c : m, y = x === c ? m : c, lx = Math.max(lc, lm), ly = Math.min(lc, lm);
      /* 疲れの段は、段階 1 は 3 割、2 以上は 6 割。前の区切りにも出した組は、さらに半分 */
      if (lx < 1 || ctx.rng() > (lx === 1 ? 0.3 : 0.6) * (S.tiredAt[key(c, m)] === s - 1 && lx < 3 ? 0.5 : 1)) return;
      S.tiredAt[key(c, m)] = s;
      var tag = '〔体力〕' + x.name + 'の体力 ' + hpOf(ctx, x) + '・疲れ ' + ['余裕', '息が上がる', 'ぐったり', '足が立たない'][lx] + '／' + y.name + 'の体力 ' + hpOf(ctx, y) + '・疲れ ' + ['余裕', '息が上がる', 'ぐったり', '足が立たない'][ly];
      /* 少し休む：同じ組は 3 区切りに一度まで（続けて休むと、条件が時間内に満たせなくなる） */
      var restOk = S.restAt[key(x, y)] == null || s - S.restAt[key(x, y)] >= 3;
      if (lx >= 3 && r && !A.ruleDone(ctx, r, x, y) && restOk) {
        S.rest[x.i] = S.rest[y.i] = s; S.restAt[key(x, y)] = s;
        S.load[x.i] = Math.max(0, (S.load[x.i] || 0) - capOf(ctx, x) * 0.7);
        S.load[y.i] = Math.max(0, (S.load[y.i] || 0) - capOf(ctx, y) * 0.3);
        S.nRest = (S.nRest || 0) + 1;
        ctx.say({ kind: 'event', cat: 'help', actors: [x, y], sex: false, lewd: false, text: ctx.t(fresh(ctx, TIRED[3]) + fresh(ctx, REST) + ctx.pick(REST_LINE), x, y), why: tag + '／少し休む（体力）：' + x.name + 'が動けなくなり、条件が残っていても、この区切りは二人で休んだ', mag: 5 });
        return;
      }
      var easy = ly === 0 && hpOf(ctx, y) >= 4, t = fresh(ctx, TIRED[Math.min(3, lx)]) + ctx.pick(LINE[Math.min(2, lx)][ps(x)]);
      if (easy) t += fresh(ctx, EASY[(y.tr.np || 0) + (ps(y) === 'gentle' || ps(y) === 'devoted' ? 0.4 : 0) >= (y.tr.fc || 0) + (ps(y) === 'free' || ps(y) === 'proud' ? 0.4 : 0) ? 'care' : 'tease']);
      else if (ly >= 1) t += fresh(ctx, BOTH);
      else t += fresh(ctx, MILD);
      ctx.say({ kind: 'event', cat: 'solo', actors: [x, y], sex: false, lewd: false, text: ctx.t(t, x, y), why: tag + (easy ? '（' + y.name + 'は体力に余裕がある）' : ''), mag: 3 });
    });
  }

  /* ---------- 出来事：受けの虚ろな顔を見た攻め（堪える／もう一回／水） ---------- */
  function hazyOk(ctx, a, b) {
    if (!on(ctx) || !here(a) || !here(b) || a.noR18 || b.noR18 || resting(ctx, a) || resting(ctx, b)) return false;
    if (ctx.flags.isOne || ctx.flags.trioCur || (A.trioOnly && A.trioOnly(ctx))) return false;
    var r = hRule(ctx), S = ctx.flags.stam;
    if (!r || A.ruleDone(ctx, r, a, b) || !A.okSex(a, b)) return false;
    var p = ctx.flags.prog && ctx.flags.prog[key(a, b)];
    if (!p || !((p.act || {}).h > 0)) return false;
    if (S.mate[a.i] !== b.i || S.lastH[b.i] == null || ctx.stepIndex - S.lastH[b.i] > 1) return false;
    if (S.hazyAt[key(a, b)] != null && ctx.stepIndex - S.hazyAt[key(a, b)] < 2) return false;
    var o = order(a, b);
    if (o[0] !== a) return false;
    var lb = lvOf(ctx, b), la = lvOf(ctx, a);
    /* 受けが虚ろ（ぐったり以上。体力の低い受けは息が上がった段から）で、攻めはそれより疲れていない */
    return (lb >= 2 || (lb >= 1 && hpOf(ctx, b) <= 2)) && la <= lb && la < 3;
  }
  /* @event scen=whiteroom id=rs_again cat=夜 tie=- tags=night label=虚ろな受けを見た攻めがもう一回したくなる */
  HK.addTo(A.EV, {
    id: 'rs_again', label: '虚ろな受けを見た攻めがもう一回したくなる', tie: '-', tags: ['night'],
    cat: 'romance', sex: true, nightCond: true, scope: 'pair', pri: true, r18: true,
    when: hazyOk,
    w: function (ctx, a, b) { var lib = HK.Pos && HK.Pos.libMul ? HK.Pos.libMul([a]) : 1; return (3.0 + (a.tr.impulse || 0) * 0.8 + R(ctx, a, b).att / 50) * lib; },
    run: function (ctx, a, b) {
      var S = ctx.flags.stam, r = hRule(ctx), cb = combo(a, b);
      S.hazyAt[key(a, b)] = ctx.stepIndex;
      var lib = HK.Pos && HK.Pos.libMul ? HK.Pos.libMul([a]) : 1, t = a.tr, pa = ps(a);
      var wAgain = (0.3 + (t.impulse || 0) * 0.8 + (t.fc || 0) * 0.4 + (A.eager ? A.eager(ctx, a) : 0.3) * 0.6) * lib * (pa === 'free' || pa === 'proud' ? 1.3 : 1);
      var wEndure = 0.3 + (t.caution || 0) * 0.6 + (t.ac || 0) * 0.4 + (t.cp || 0) * 0.3 + (pa === 'stern' || pa === 'polite' || pa === 'shy' ? 0.4 : 0);
      var wWater = 0.2 + (t.np || 0) * 0.9 + (pa === 'gentle' || pa === 'devoted' ? 0.5 : 0);
      var k = HK.weighted(ctx.rng, [['again', wAgain], ['endure', wEndure], ['water', wWater]], function (x) { return x[1]; })[0];
      var pre = fresh(ctx, HAZY[cb]) + ctx.pick(WANT[pa]);
      var lvB = lvOf(ctx, b), tag = '〔体力〕' + b.name + 'の体力 ' + hpOf(ctx, b) + '・疲れ ' + ['余裕', '息が上がる', 'ぐったり', '足が立たない'][lvB] + '／' + a.name + 'の体力 ' + hpOf(ctx, a);
      if (k === 'again') {
        /* 受けが応じるか：段階 3（足が立たない）なら応じない。惹かれ・覚悟・乗り気があれば応じる */
        var yes = lvB < 3 && (R(ctx, b, a).att > 35 || b.flags.resign || (A.willing && A.willing(ctx, a, b, 5)));
        if (yes) {
          S.nAgain = (S.nAgain || 0) + 1;
          ctx.say({ kind: 'event', cat: 'solo', actors: [a, b], sex: false, lewd: false, text: ctx.t(pre + ctx.pick(YES), a, b), why: tag + '／もう一回（体力）：' + b.name + 'の虚ろな顔を見て、' + a.name + 'がもう一回したくなった。' + b.name + 'は応じた', mag: 5 });
          var p = A.prog(ctx, a, b), h0 = p.act.h || 0;
          A.bumpAct(ctx, r, a, b, 1);
          ctx.mod2(a, b, { att: 5 }, { att: 4 });
          var text = HK.RoomLewd.scene(ctx, a, b, 'repeat') + A.cntTag(ctx, r, a, b, p.act.h, (p.act.h || 0) - h0);
          var why = '虚ろな' + b.name + 'を見た' + a.name + 'が、もう一回求めた（二度目の理由：相手のぼうっとした顔に、気持ちが抑えられなかった）';
          if (A.checkExit(ctx, a, b)) return A.exitPair(ctx, a, b, text, why, true);
          return { text: text, why: why, mag: 12 };
        }
        S.nEndure = (S.nEndure || 0) + 1;
        ctx.mod(a, b, { trust: 2 });
        return { cat: 'help', sex: false, lewd: false, text: ctx.t(pre + ctx.pick(NO) + ctx.pick(ENDURE_LINE), a, b), why: tag + '／もう一回したくなったが、' + b.name + 'が首を振ったので堪えた（体力）', mag: 6 };
      }
      if (k === 'water') {
        S.nWater = (S.nWater || 0) + 1;
        S.load[b.i] = Math.max(0, (S.load[b.i] || 0) - 1);
        ctx.mod2(a, b, { trust: 2, aff: 2 }, { trust: 4, aff: 3 });
        return { cat: 'help', sex: false, lewd: false, text: ctx.t(pre + ctx.pick(WATER) + ctx.pick(WATER_LINE), a, b), why: tag + '／虚ろな' + b.name + 'を見た' + a.name + 'が、気遣って水を飲ませた（体力）', mag: 6 };
      }
      S.nEndure = (S.nEndure || 0) + 1;
      ctx.mod(b, a, { trust: 3 });
      return { cat: 'help', sex: false, lewd: false, text: ctx.t(pre + ctx.pick(ENDURE) + ctx.pick(ENDURE_LINE), a, b), why: tag + '／虚ろな' + b.name + 'を見た' + a.name + 'が、もう一回したいのを堪えた（体力）', mag: 6 };
    }
  });

  /* きっかけの段（HK.SexLead）：場面は RoomLewd.scene を通るので部品の包みで拾われる。切れ端が見つからないときの予備に、出来事 id でも登録する */
  if (HK.SexLead && HK.SexLead.EVR) HK.SexLead.EVR.rs_again = function (ctx, o) { return o.sex === true && (o.actors || []).length >= 2 && String(o.text).length >= 80 ? { gen: 'pair', who: o.actors.slice(0, 2) } : null; };

  /* ---------- 休んでいる人は、その区切りの体の出来事に入らない ---------- */
  if (HK.Ctx && HK.Ctx.prototype.bias) HK.wrap(HK.Ctx.prototype, 'bias', function (b0) {
    return function (a, cat, e) { var m = b0.apply(this, arguments); return e && e.sex && this.scen && this.scen.id === 'whiteroom' && resting(this, a) ? 0 : m; };
  });
  if (HK.Ties && typeof HK.Ties.bias === 'function') HK.wrap(HK.Ties, 'bias', function (t0) {
    return function (ctx, a, b, cat, e) { var m = t0.apply(this, arguments); return e && e.sex && ctx && ctx.scen && ctx.scen.id === 'whiteroom' && (resting(ctx, a) || resting(ctx, b)) ? 0 : m; };
  });

  /* ---------- ダイジェストの段に、体力の 1 文 ---------- */
  if (HK.RoomLewd && typeof HK.RoomLewd.digestH === 'function') HK.wrap(HK.RoomLewd, 'digestH', function (d0) {
    return function (ctx, a, b, n) {
      var s = d0.apply(this, arguments);
      if (!on(ctx) || typeof s !== 'string' || !a || !b) return s;
      var S = ctx.flags.stam, k = key(a, b), P = ctx.flags.prog && ctx.flags.prog[k], v = (P && P.act && P.act.h) || 0, d = Math.max(0, v - (S.seen[k] || 0));
      var o = order(a, b), la = lvOf(ctx, o[0], d), lb = lvOf(ctx, o[1], d * 1.2), x = lb >= la ? o[1] : o[0], y = x === o[0] ? o[1] : o[0], lx = Math.max(la, lb);
      var add = ctx.pick(DIG[lx]);
      if (lx >= 2 && Math.min(la, lb) === 0 && hpOf(ctx, y) >= 4) add = add.replace(/。$/, '') + '。' + ctx.pick(DIG_EASY);
      S.nDig = (S.nDig || 0) + 1;
      return s + ctx.t(add, x, y);
    };
  });

  /* ---------- 取り付け（setup のあと。ctx.say を包む） ---------- */
  HK.wrap(scen, 'setup', function (s0) {
    return function (ctx) {
      var res = s0.apply(this, arguments);
      var r = hRule(ctx);
      ctx.flags.stam = { on: !!(r && r.n >= 5) && !HK.SAFE_ON, load: {}, seen: {}, lastH: {}, mate: {}, rest: {}, restAt: {}, tiredAt: {}, used: {}, hazyAt: {} };
      if (!ctx.flags.stam.on) return res;
      var inner = ctx.say, busy = false;
      ctx.say = function (o) {
        var e = inner.apply(this, arguments);
        if (busy || !o) return e;
        busy = true;
        try { if (o.kind === 'step') onStep(ctx); else if (o.kind === 'event') track(ctx); } finally { busy = false; }
        return e;
      };
      return res;
    };
  });
})();
