/* 箱庭シミュレーター: 女性が攻め・男性が受けの体の関係の描写（R18版）
   自分で「攻め」を選んだ女性と、受けに回る男性の組は「女性上位」で書く：女性が押し倒し、跨り、自分で導き、腰を使って相手を責める。
   男性は「される」側（組み敷かれる・焦らされる・搾り取られる）。女性を「入れられる・突かれる・押し倒される」側の主語にしない。
   {a}=女性（攻め）、{b}=男性（受け）。地の文だけ（台詞は各箱庭のものを使う）。
   使い方：HK.FM.on(a, b) … 二人が女性攻め×男性受けの組か（並べ替え後に a が女性の攻め）
           HK.FM.scene(ctx, a, b, opt) … 一場面ぶん（押し倒す→跨って繋がる→果てる→事後。opt.after=false で事後を省く）
           HK.FM.pick(ctx, kind, st) … kind は 'open'/'body'/'climax'/'after'
           HK.FM.fix(ctx, text, a, b) … 男性が攻める前提の文（女性が「入れる」、男性が「跨る・突く・押し倒す」）を、女性上位の文に差し替える
   どの箱庭の結果も、最後に HK.simulate の結果を一度だけ見直して、女性攻め×男性受けの二人が出る文を直す */
(function () {
  'use strict';
  var HK = window.HK;
  if (!HK || !HK.Pos) return;
  function L(s) { return s.split('|'); }
  var P = HK.Pos;

  var OPEN = {
    rough: L('{a}は{b}の胸を突いてベッドに倒し、逃げようとする手首を頭の上でまとめて押さえつけた。「動いていいって、誰が言った？」|{a}は{b}を壁際に追い詰め、膝で脚を割って、耳元で低く笑った。「今夜は、好きにさせてもらう」|{a}は{b}の襟元を掴んで引き寄せ、噛みつくように唇を奪った。そのまま体重をかけて、{b}を仰向けに倒した。|{a}は{b}の上に馬乗りになり、シャツのボタンを一つずつ、わざと乱暴に外していった。「抵抗しても、無駄だから」'),
    gentle: L('{a}は{b}の肩をそっと押して仰向けにさせ、その上に静かに跨った。「嫌だったら、止めてね」|{a}は{b}の頬に手を添えて、上から何度も唇を重ねた。{b}の体から、少しずつ力が抜けていった。|{a}は{b}の手を取って自分の頬に当て、それから静かに{b}をベッドに横たえた。「今日は、私にさせて」|{a}は{b}の胸に耳を当てて、速くなった鼓動をしばらく聞いていた。それから、そっと{b}の上に跨った。'),
    tease: L('{a}は{b}を仰向けに寝かせ、腰の上に座ったまま、わざとゆっくり服のボタンを外していった。「まだ触っちゃだめ」|{a}は{b}の脚の間に膝をつき、熱くなったところを指先でなぞっては離した。{b}が身をよじるのを、楽しそうに眺めていた。|{a}は{b}の耳たぶを甘噛みしながら、ベルトの金具を指先でもてあそんだ。外しそうで、なかなか外さなかった。|{a}は{b}を座らせたまま膝の上に跨り、唇が触れる寸前で止めた。「キスしたい？　……まだ、あげない」'),
    playful: L('{a}は笑いながら{b}に飛びついて押し倒し、そのままお腹の上に陣取った。「はい、捕まえた。今日はこっちが上ね」|{a}は{b}の上に跨ると、「どっちが先に声出すか、勝負しよ」といたずらっぽく笑った。|{a}は{b}の脇腹をくすぐって転がし、笑い崩れたところで上に乗った。「油断したね」|{a}は「じゃんけんで負けたほうが下ね」と言い、勝ったあとで「やっぱり最初から決まってた」と笑って{b}を押し倒した。'),
    clinical: L('{a}は「仰向けに」とだけ言って、{b}をベッドに寝かせた。迷いのない手つきで、{b}の反応を一つずつ確かめていった。|{a}は{b}の手首をベッドの柵に軽く縛り、「これで動けない」と淡々と告げた。|{a}は{b}の服を手際よく脱がせ、脈を確かめるように首筋に指を当てた。「緊張してる。……すぐ、ほどける」|{a}は照明を一段落とし、{b}を仰向けにさせてから、表情を変えずにその腰の上へ跨った。'),
    clumsy: L('{a}は{b}の上に跨ろうとして、バランスを崩して胸に倒れ込んだ。二人で顔を見合わせて、小さく吹き出した。|{a}は「上になるの、初めてで……」と打ち明けた。{b}は「好きにしていいよ」と笑って、{a}の腰に手を添えた。|{a}は{b}を押し倒すつもりで勢いをつけすぎ、二人そろってベッドに倒れ込んだ。「……い、今のは、押し倒したことにして」|{a}は{b}のベルトを外すのに手間取って、「ちょっと待って」と真っ赤になった。{b}は笑って、自分で外した。')
  };
  var BODY = {
    rough: L('{a}は{b}の手首を押さえつけたまま、自分で{b}のものを導いて、一気に腰を落とした。{b}の喉から、押し殺した声が漏れた。|{a}は{b}に跨ったまま、容赦なく腰を打ちつけた。{b}が何か言いかけるたびに、締めつけを強くして黙らせた。|{a}は{b}が果てそうになるたびに腰を止め、髪を掴んで顔を上げさせた。「勝手にイったら、許さないから」|{a}は{b}の肩を押さえつけたまま、根元まで呑み込んでは腰を引き上げ、休む間を与えずに責め立てた。「まだ、へばらないで」'),
    gentle: L('{a}は{b}の表情を確かめながら、ゆっくりと腰を沈めていった。根元まで繋がると、{a}は{b}の額に自分の額を合わせた。|{a}は{b}の上で、波のようにゆっくりと腰を揺らした。{b}の手が、すがるように{a}の腰を掴んだ。|{a}は{b}の胸に手をついて、少しずつ深さを変えながら、{b}の一番弱い角度を探していった。|{a}は{b}と指を絡めたまま、ゆっくりと腰を上下させた。目が合うたびに、{a}ははにかむように微笑んだ。'),
    tease: L('{a}は{b}のものを入り口に押し当てたまま、なかなか腰を落とさなかった。「欲しいなら、ちゃんと言って」|{a}は浅いところだけで何度も腰を揺らし、{b}が腰を浮かせるたびに、ひょいと逃げた。{b}は涙目で{a}を見上げた。|{a}は{b}をぎりぎりまで追い詰めては動きを止め、それを何度も繰り返した。{b}はシーツを握りしめて震えていた。|{a}は{b}を根元まで呑み込んだまま、ぴたりと動きを止めた。中だけをきゅうっと締めて、{b}が腰を浮かせるのを眺めていた。'),
    playful: L('{a}は{b}の上で弾むように腰を動かしながら、「ここ？　それとも、こっち？」と笑って角度を変えた。|{a}は{b}の上で腰を回し、{b}が声を上げるたびに「はい、一点」と数えた。|{a}は{b}の胸に指で落書きをしながら、ゆっくりと腰を沈めては浮かせた。{b}は笑う余裕を、すぐになくした。|{a}は{b}の上で腰を前後に揺らしながら、「今の顔、もう一回」とせがんだ。顔を背けられると、{a}はわざと深く腰を落とした。'),
    clinical: L('{a}は{b}の反応を観察しながら、一定のリズムで正確に腰を使った。{b}の呼吸が浅くなるのを、{a}は数えていた。|{a}は{b}が一番強く反応した深さだけを、迷いなく繰り返した。{b}の腰が、勝手に跳ねた。|{a}は{b}の胸に手を置いて心拍を確かめ、「まだ余裕あるね」と言って、腰の動きを一段速めた。|{a}は締めつける強さを少しずつ変え、{b}の息が詰まる加減を見つけると、そこから一度も外さなかった。'),
    clumsy: L('{a}は加減が分からず、何度か浅く外しては照れ笑いした。それでも、繋がった瞬間、二人とも息を止めた。|{a}は{b}の上でぎこちなく腰を揺らした。{b}に「そのまま」と言われて、少しずつ自信がついていった。|{a}は自分で動くたびに真っ赤になりながら、それでも止めなかった。{b}の声が、だんだん甘くなっていった。|{a}は腰の動かし方を探るように、浅く、深く、何度も試した。{b}が息を呑んだところで、「……ここ？」と嬉しそうに訊いた。')
  };
  var CLIMAX = {
    rough: L('{a}は最後まで手首を離さず、{b}を果てさせた。{b}が震えている間も、{a}は腰を止めなかった。|{a}は{b}の顎を掴んで目を合わせさせたまま、深く腰を落とした。{b}は{a}の名前を呼びながら果てた。|{a}は{b}を根元まで呑み込んだまま中をきつく締め上げ、逃げ場のない快感で{b}を果てさせた。{a}は乱れた髪をかき上げ、満足そうに見下ろした。|{a}は{b}が「もう」と言いかけるたびに腰を止め、三度目にようやく許した。{b}は{a}の下で、声も出せずに果てた。'),
    gentle: L('{a}が深く腰を沈めた瞬間、{b}は{a}の背中にしがみついて果てた。{a}は{b}の髪を撫でながら、自分も小さく震えた。|二人は額を合わせたまま、ほとんど同時に果てた。{a}は{b}の上から降りず、しばらくそのまま抱きしめていた。|{a}は{b}の名前を呼びながら、ゆっくりと深く腰を沈めた。{b}はその奥で果て、{a}も甘く震えて{b}の胸に崩れ落ちた。|{a}の中が波打つように締まり、{b}はたまらず{a}の腰を抱き寄せて果てた。{a}は{b}の額に、そっと口づけた。'),
    tease: L('{a}がようやく許した瞬間、{b}は堰を切ったように果てた。{a}は満足そうに、{b}の汗ばんだ額に口づけた。|「いいよ、出して」――{a}の囁きと同時に、{b}は声にならない声を上げて果てた。|{a}は「あと十秒、我慢できたら」と囁いて、数え終わる前に深く腰を落とした。{b}はひとたまりもなく果てた。|{a}が最後に根元まで呑み込んできつく締めつけると、焦らされ続けた{b}は堰を切ったように果てた。{a}はその震えを、目を細めて味わっていた。'),
    playful: L('{b}が先に果てた。{a}は「勝った」と笑って、{b}の胸の上に倒れ込んだ。|二人は笑い声と喘ぎ声を混ぜながら、{a}の腰の動きに合わせて一緒に果てた。|{a}が「せーの」と言って深く腰を落とすと、{b}は本当にそれで果ててしまった。{a}は自分も震えながら吹き出した。|{a}が先に達して{b}の上で崩れ、その締めつけで{b}もすぐに果てた。「引き分け」と{a}は笑った。'),
    clinical: L('{a}は{b}が限界を迎える瞬間を見極めて、そこで深く腰を落とした。{b}はなすすべもなく果てた。|{a}は{b}が果てたのを確かめてから、ようやく自分も力を抜いた。「記録更新」と、小さく呟いた。|{a}は{b}の呼吸がいちばん浅くなった瞬間に、正確に腰を落とした。{b}は声を詰まらせて果て、{a}も小さく息を吐いて震えた。|{a}は{b}が果てる瞬間まで表情を変えなかった。果てたのを見届けてから、ようやく自分の震えを許した。'),
    clumsy: L('{a}の動きが止まらなくなったとき、{b}は{a}の腰を抱いて果てた。{a}は「できた……」と、泣きそうな顔で笑った。|最後は二人とも何が何だか分からないまま、{a}は{b}の上で、{b}と一緒に果てた。顔を見合わせて、もう一度笑った。|{a}が夢中で腰を揺らしているうちに、{b}が先に果てた。{a}は「えっ、もう？」と目を丸くして、それから嬉しそうに笑った。|{a}は自分が達した拍子に腰を深く落としてしまい、{b}もそれで果てた。二人して、しばらく顔を上げられなかった。')
  };
  /* 事後（女性の攻めが主導したまま終わる。{b} を「抱いた」側にしない） */
  var AFTER = {
    rough: L('{a}は{b}の上から降りると、乱れた髪をかき上げて「悪くなかった」とだけ言った。{b}はまだ、息を整えられずにいた。|{a}は果てたばかりの{b}の顎を指で持ち上げ、「次も、私が上だから」と笑った。|{a}は{b}の胸に指で円を描きながら、まだ震えている{b}の顔を、満足そうに眺めていた。'),
    gentle: L('{a}は{b}の胸に頬を預け、まだ速い鼓動を聞きながら目を閉じた。{b}の手が、{a}の背中をゆっくりと撫でた。|{a}は{b}の隣に寝転がり、汗ばんだ前髪を指で払ってやった。「……重くなかった？」|{a}は毛布を引き寄せて二人の肩までかけ、{b}の腕の中にそっと潜り込んだ。'),
    tease: L('{a}は{b}の耳元で「よく我慢できました」と囁き、ご褒美のように軽く唇を重ねた。|{a}は脱力した{b}を見下ろして、「また焦らしてほしくなったら、言って」と笑った。|{a}は{b}の唇を指でなぞり、「今の顔、しばらく忘れられない」と目を細めた。'),
    playful: L('{a}は{b}の胸の上に寝そべったまま、「今日はこっちの勝ちね」と得意げに言った。|{a}は{b}の腕を枕にして、「次は何で勝負する？」と楽しそうに訊いた。|{a}と{b}は汗だくのまま顔を見合わせ、どちらからともなく吹き出した。'),
    clinical: L('{a}は手早く身なりを整え、{b}の額の汗をタオルで拭った。「水、飲んで」|{a}は{b}の脈を確かめるように手首に触れ、「落ち着いた」と小さく頷いた。|{a}は{b}の隣に横になり、天井を見たまま「……思っていたより、よかった」と呟いた。'),
    clumsy: L('{a}は{b}の胸に顔を埋めたまま、「……ちゃんと、できてた？」と小さく訊いた。{b}は答える代わりに、{a}の頭を撫でた。|{a}は終わってから急に恥ずかしくなって、毛布を頭までかぶった。|{a}は{b}の手を握り、「次は、もっと上手くなるから」と真っ赤な顔で言った。')
  };
  var POOLS = { open: OPEN, body: BODY, climax: CLIMAX, after: AFTER };
  function pickArr(ctx, arr) { return ctx && ctx.pick ? ctx.pick(arr) : arr[Math.floor(Math.random() * arr.length)]; }
  function fill(s, A, B) { return s.replace(/\{a\}/g, A.name).replace(/\{b\}/g, B.name); }
  function src(c, k) { return c ? (c[k] != null && c[k] !== '' ? c[k] : (c.src && c.src[k]) || '') : ''; }
  function isM(c) { return src(c, 'gender') === 'm'; }
  var styleOf = HK.FF && HK.FF.styleOf ? HK.FF.styleOf : function () { return 'gentle'; };

  /* 女性の攻めが「入れる」側の書き方（跨る・腰を落とす書き方なら女性上位として正しい） */
  var TOP_PEN = /奥まで入れ|入れたまま|中に入れ|突き上げ|突いた|深く突|注ぎ込|中に出し|背後から|後ろから|壁に向かって立たせ|四つん這い|脚を抱え上げ|片脚を抱え|突き入れ|押し入|貫い|貫き|貫かれ|奥を突|奥まで突|奥まで沈め|深く沈め|中に入って|中へ入って|注ぎ込|中に出|中に吐き|ねじ込|一気に貫|穿|後ろから突|突き上げ|腰を打ちつけ|犯し|抱き潰/;
  var RIDE = /跨|腰を落と|腰を沈め|上で腰|自分の中に|自分で導|導い|騎乗/;
  /* 男性の受けが「攻める」書き方、または「入れられる」書き方 */
  var BOT_ACT = /跨|腰を沈め|腰を落と|覆いかぶさ|押し倒|組み敷|貫|突き|突か|押し入|挿れ|抱き潰|犯し|犯さ|背後から|後ろから|四つん這い|脚を抱え上げ|片脚を抱え|繋が[っりる]|奥まで|壁に向かって立たせ|膝の上に乗せ|膝の上で/;

  /* 性的な場面か（推理や喧嘩の「押し倒す」などは直さない） */
  /* 性的な場面の文か（「腰を抱えて」「後ろから」「洞窟の奥まで」「中に入った」のような、ふつうの文には反応しないように絞る） */
  /* 「押し入」は「部屋に村人たちが押し入った」のような文にも出るので数えない（2026-10-26。邪神村の裏切りの文が性的な文に差し替わっていた） */
  var SEXCTX = /穿[っちつ]|注ぎ込|貫[いかきく]|突き上げ|突き入|奥を突|奥まで突|奥まで沈|挿[れ入]|エッチ|繋が[っりる]|果て|喘|舐め|愛撫|達し|体を重ね|肌を重ね|腰を(?:振|打ち|沈|落と|揺ら|動か|使|くねら)|中に(?:出|注|吐)|犯し|犯さ|イ[かっカッ]|跨|交わ|貪/;
  /* 記録全体が性的な場面か（戦い・吸血・事件の「貫く」「突き上げる」「腰を落とす」だけでは数えない） */
  var SEXSURE = /挿[れ入]|繋が[っりる]|エッチ|果て|喘|愛撫|体を重ね|肌を重ね|腰を(?:振|打ち|沈め|揺ら|使)|中に(?:出|注|吐)|イ[かっ]|イカせ|イッ|抱き潰|交わ|♡|\{(?:男性器|女性器|ナカ|精液)\}/;
  /* 「」の中の句点で切らないように、文に分ける */
  function sentences(t) {
    var out = [], cur = '', d = 0;
    for (var i = 0; i < t.length; i++) {
      var ch = t.charAt(i); cur += ch;
      if (ch === '「') d++; else if (ch === '」' && d > 0) d--;
      if (d === 0 && /[。！？]/.test(ch)) { out.push(cur); cur = ''; }
    }
    if (cur) out.push(cur);
    return out;
  }

  var FM = HK.FM = {
    POOLS: POOLS,
    /* 女性の攻め×男性の受けの組なら、[女性, 男性] を返す */
    pair: function (a, b) {
      if (!a || !b || a === b) return null;
      var o = P.order(a, b, [a, b]);
      /* 性器なしの人がいる組は、ここで跨る文に直さない（pos-nogen.js の口・指と玩具の文にする） */
      return P.isF(o[0], o[1]) && P.isTop(o[0], o[1]) && isM(o[1]) && P.okSex(o[0], o[1]) && !(P.noGen && (P.noGen(o[0]) || P.noGen(o[1]))) ? o : null;
    },
    on: function (a, b) { return !!FM.pair(a, b); },
    pick: function (ctx, kind, st) { var Pl = POOLS[kind] || BODY; return pickArr(ctx, Pl[st] || Pl.gentle); },
    scene: function (ctx, a, b, opt) {
      var o = FM.pair(a, b) || [a, b], A = o[0], B = o[1], st = (opt && opt.st) || styleOf(A);
      return [OPEN, BODY, CLIMAX].concat(opt && opt.after === false ? [] : [AFTER]).map(function (Pl) { return fill(pickArr(ctx, Pl[st] || Pl.gentle), A, B); }).join('');
    },
    fix: function (ctx, text, a, b) {
      var o = FM.pair(a, b);
      return o ? FM.fixWith(ctx, text, o[0], o[1].name) : text;
    },
    /* 相手が名前だけ（モブ・客）のとき：A は女性の攻め、bn は男性の相手の名前（呼ぶ側で確かめること） */
    fixWith: function (ctx, text, A, bn) {
      if (HK.SAFE_ON || !A || !bn || typeof text !== 'string' || (P.noGen && P.noGen(A)) || !SEXCTX.test(text.replace(/「[^」]*」/g, ''))) return text;
      /* 性的な場面の記録だけ直す：「貫く」「突き上げる」など戦い・事件の文にも出る語だけで、はっきりした語（SEXSURE）のない記録は直さない */
      if (!SEXSURE.test(text.replace(/「[^」]*」/g, ''))) return text;
      /* 二人が同じ文に出て、その文がはっきり性的な文になっている記録だけ（結末の「その後」のように、片方とモブの場面と、二人の別の文が並ぶ記録は直さない） */
      if (!sentences(text).some(function (sen) { var b0 = sen.replace(/「[^」]*」/g, ''); return b0.indexOf(A.name) >= 0 && b0.indexOf(bn) >= 0 && SEXSURE.test(b0); })) return text;
      var B = { name: bn }, st = styleOf(A), an = A.name, anR = HK.reEsc(an), bnR = HK.reEsc(bn), last = '', used = {};
      var reA = new RegExp(anR + '(?:は|が|も)'), reB = new RegExp(bnR + '(?:は|が|も)'), inB = new RegExp(bnR + 'の(?:中|奥|後ろ|ナカ|\\{ナカ\\}|\\{後ろ\\})'), partA = new RegExp(anR + 'の(?:もの|モノ|昂り|先端|根元|竿|ちんぽ|肉棒|ペニス|\\{男性器\\}|\\{亀頭\\})');
      var changed = false;
      /* 段落に分けた山場で、すでに女性上位（跨る・腰を落とす・呑み込む）の書き方になっている段落は直さない */
      if (text.indexOf('\n\n') >= 0) {
        var paras = text.split('\n\n'), hit = paras.some(function (p) { return RIDE.test(p) && p.indexOf(an) >= 0; });
        /* 女性上位で組み立てた山場なら、直すのは書き出し（最初の段落）だけ */
        if (hit) return paras.map(function (p, i) { return i === 0 && !(RIDE.test(p) && p.indexOf(an) >= 0) ? FM.fixWith(ctx, p, A, bn) : p; }).join('\n\n');
      }
      var out = sentences(text).map(function (sen) {
        if (!sen) return sen;
        var body = sen.replace(/「[^」]*」/g, '');
        var ia = body.search(reA), ib = body.search(reB), subj = ia >= 0 && (ib < 0 || ia < ib) ? 'a' : ib >= 0 ? 'b' : last;
        if (ia >= 0 || ib >= 0) last = subj;
        var bad = SEXCTX.test(body) && ((subj === 'a' && TOP_PEN.test(body) && !RIDE.test(body)) || (subj === 'b' && BOT_ACT.test(body)) || inB.test(body) || partA.test(body));
        if (!bad) return sen;
        changed = true;
        var kind = /果て|達し|イ[っかきく]|絶頂|注ぎ|中に出/.test(body) ? 'climax' : 'body';
        var Pl = POOLS[kind][st] || POOLS[kind].gentle, cand = Pl.filter(function (x) { return !used[x]; }), pickS = pickArr(ctx, cand.length ? cand : Pl);
        used[pickS] = 1;
        return fill(pickS, A, B);
      }).join('');
      return changed ? out : text;
    }
  };

  /* どの箱庭の結果も最後に一度見直す：一つの文に、女性の攻めと男性の受けの組の二人が出ていれば直す */
  var sim0 = HK.simulate;
  if (!sim0) return;
  HK.simulate = function (input) {
    var res = sim0.apply(this, arguments);
    /* 全年齢モードでは見直さない（性的な文に差し替えないため） */
    if (HK.SAFE_ON) return res;
    try {
      var cs = P.withIdx((input && input.chars) || []);
      var F = cs.filter(function (c) { return P.isF(c) && (P.isTop(c) || P.hasFor(c)); }), M = cs.filter(isM);
      if (!F.length || !M.length || !res) return res;
      var pairs = [];
      /* 恋愛・R18にしない組（キャラの設定 loveNG：相手の番号）と、恋愛相手を別の人に固定している組は、そもそも性的な場面にならないので直さない */
      /* 固定は番号一つ・番号の並びのどちらでも（engine.js の HK.parseLocks。[-1] は「誰とも」） */
      var lk = function (c) { var L = HK.parseLocks ? HK.parseLocks(c.loveLock) : []; return L.length ? L : null; };
      /* 恋愛相手を別の人に固定している組も同じ */
      /* 恋愛：なしの家族・無関心・恐怖の二人（関係）も、体の関係にならない組なので直さない（2026-10-26） */
      var tieNG = function (ix, iy) { return ((input && input.ties) || []).some(function (t) { return t && ((t.a === ix && t.b === iy) || (t.a === iy && t.b === ix)) && ((HK.tieNoLove && HK.tieNoLove(t)) || t.type === 'apathy' || t.type === 'fear'); }); };
      var ng = function (x, y) { var ix = cs.indexOf(x), iy = cs.indexOf(y); return (Array.isArray(x.loveNG) && x.loveNG.indexOf(iy) >= 0) || (Array.isArray(y.loveNG) && y.loveNG.indexOf(ix) >= 0) || (lk(x) != null && lk(x).indexOf(iy) < 0) || (lk(y) != null && lk(y).indexOf(ix) < 0) || tieNG(ix, iy); };
      F.forEach(function (f) { M.forEach(function (m) { if (FM.on(f, m) && !ng(f, m) && !(P.isMaleTop && P.isMaleTop(f, m))) pairs.push([f, m]); }); });
      if (!pairs.length) return res;
      var rng = HK.rng ? HK.rng(((input.seed || 1) * 7919 + 17) >>> 0) : null;
      var ctx = { pick: function (a) { return a[rng ? rng.int(a.length) : Math.floor(Math.random() * a.length)]; } };
      var items = (res.log || []).slice();
      if (res.ending && Array.isArray(res.ending.lines)) res.ending.lines.forEach(function (l, i) { items.push({ _end: i, text: l }); });
      /* 二人がその記録に出ているか。出来事の記録に登場人物の番号（actors）があれば、二人ともそこにいるときだけ。
         結末の行など番号のないものは名前で見る（カタカナの名前は、前後がカタカナなら別の語の一部として数えない：「ブラッドオレンジ」の「レンジ」など） */
      var KATA = /[ァ-ヺー]/;
      var hasName = function (t, n) {
        if (!n) return false;
        for (var i = t.indexOf(n); i >= 0; i = t.indexOf(n, i + 1)) {
          if (KATA.test(n.charAt(0)) && KATA.test(t.charAt(i - 1))) continue;
          if (KATA.test(n.charAt(n.length - 1)) && KATA.test(t.charAt(i + n.length))) continue;
          return true;
        }
        return false;
      };
      var both = function (e, x, y) {
        var ac = Array.isArray(e.actors) ? e.actors.filter(function (v) { return typeof v === 'number'; }) : [];
        if (ac.length) return ac.indexOf(cs.indexOf(x)) >= 0 && ac.indexOf(cs.indexOf(y)) >= 0 && hasName(e.text, x.name) && hasName(e.text, y.name);
        return hasName(e.text, x.name) && hasName(e.text, y.name);
      };
      items.forEach(function (e) {
        if (!e || typeof e.text !== 'string') return;
        for (var k = 0; k < pairs.length; k++) {
          var p = pairs[k];
          if (both(e, p[0], p[1])) { e.text = FM.fix(ctx, e.text, p[0], p[1]); }
        }
        if (e._end != null) res.ending.lines[e._end] = e.text;
      });
    } catch (err) { /* 見直しに失敗しても結果は返す */ }
    return res;
  };
  for (var k in sim0) if (Object.prototype.hasOwnProperty.call(sim0, k)) HK.simulate[k] = sim0[k];
})();
