/* 箱庭シミュレーター: 女性どうしの体の関係の描写（R18版）
   いちもつを前提にした描写（挿入・射精など）を使わず、指・舌・肌の重ね方で書く。
   {a}=動く側（受け攻めの指定があれば攻め）、{b}=受ける側。
   道具（玩具）は、その箱庭が許すとき（opt.tools）だけ使う：オメガバース・出られない部屋の木箱など。
   使い方：HK.FF.scene(ctx, a, b, mode, opt) … mode は 'will'（望んで）/'des'（仕方なく）/'aphro'（媚薬）/'repeat'（二度目以降）/'speed'（拘束して）
           HK.FF.lead(ctx, st, opt) … 書き出し（opt.repeat=二度目以降／opt.speed=急ぐ場面／それ以外は型ごとの open）
           HK.FF.after(ctx, mode) … 事後（will/des/aphro）。HK.FF.afterMode(mood) で R18M の気分から選ぶ
           HK.FF.pick(ctx, kind, st, opt) … kind は 'open'/'body'/'climax'/'after'/'toy'/'repeat'。st は room-lewd.js と同じ型（rough/gentle/tease/playful/clinical/clumsy）
           HK.FF.fix(ctx, text, a, b, opt) … 男性の体を前提にした文が混じっていたら、女性どうしの文に差し替える（取りこぼし対策） */
(function () {
  'use strict';
  var HK = window.HK;
  if (!HK) return;
  function L(s) { return s.split('|'); }

  var OPEN = {
    rough: L('{a}は{b}の手首を掴んでベッドに押し倒し、逃げ場を塞ぐように覆いかぶさった。「黙って感じてればいいから」|{a}は{b}を壁に押しつけ、噛みつくように唇を奪った。片手はもう、{b}の服の中に滑り込んでいた。|{a}は{b}のブラウスのボタンを、待ちきれないように引きちぎった。{b}が抗議する前に、その口は塞がれていた。'),
    gentle: L('{a}は{b}の頬に手を添えて、額をこつんと合わせた。「嫌だったら、すぐ言ってね」|{a}は{b}の髪を耳にかけ、首筋にそっと唇を落とした。{b}の肩から、少しずつ力が抜けていった。|{a}は{b}の服を一枚ずつ、確かめるように脱がせた。肌が出るたびに、そこへ口づけた。'),
    tease: L('{a}は{b}をベッドの縁に座らせ、自分は膝をついて見上げた。「どこから触ってほしい？　言えたら、してあげる」|{a}は{b}の太ももを指先でなぞり、肝心なところの手前で止めた。{b}が息を詰めるたびに、{a}は楽しそうに笑った。|{a}は下着の上から、{b}の一番敏感なところを爪の先でかすめた。それだけで、{b}の腰が跳ねた。'),
    playful: L('{a}は笑いながら{b}に抱きつき、二人そろってベッドに倒れ込んだ。「ね、競争しよ。先に声出したほうが負け」|{a}は{b}の鎖骨にキスマークを一つ付けて、「ほら、お揃いにして」と自分の首を差し出した。|{a}と{b}は、どちらが先に脱がせるかでじゃれ合った。気づけば二人とも、何も着ていなかった。'),
    clinical: L('{a}は「力を抜いて」とだけ言って、{b}を仰向けに寝かせた。迷いのない手つきだった。|{a}は{b}の反応を確かめるように、肌の上を順番に指でたどっていった。|{a}は照明を落とし、{b}の隣に横になった。「顔を見ないほうが、楽でしょう」'),
    clumsy: L('{a}は{b}のホックを外そうとして、三回失敗した。二人で顔を見合わせて、小さく吹き出した。|{a}は「女の子とするの、初めてで……」と打ち明けた。{b}は「私も」と笑って、{a}の手を自分の胸に導いた。|{a}と{b}は、どちらが先に触れるかで一分ほど見つめ合った。先に手を伸ばしたのは、{a}だった。')
  };
  var BODY = {
    rough: L('{a}は{b}の脚を大きく開かせ、指を二本、ためらいなく沈めた。奥を掻くように動かすと、{b}の背中がしなった。|{a}は{b}の胸の先を甘噛みしながら、濡れたところを指で激しく掻き回した。{b}の声は、もう言葉になっていなかった。|{a}は{b}の太ももを押さえつけたまま、そこへ顔を埋め、舌で容赦なく責め立てた。|{a}は{b}の脚を自分の脚と交差させ、互いの一番熱いところを擦り合わせるように、腰を強く押しつけた。'),
    gentle: L('{a}は{b}の表情を一つずつ確かめながら、指をゆっくりと沈めていった。{b}が息を呑んだ場所を、{a}は何度でも優しく撫でた。|{a}は{b}の胸に頬を寄せ、先端を唇で含みながら、指先でそっと花芯を転がした。|{a}は{b}の脚のあいだに顔を寄せ、舌でゆっくりと、溶かすように舐め上げた。{b}の指が、{a}の髪に絡んだ。|{a}と{b}は向かい合って脚を絡め、ゆっくりと腰を揺らした。肌と肌が、熱を分け合うように擦れ合った。'),
    tease: L('{a}は{b}の一番欲しいところだけを、わざと避け続けた。内ももばかりを撫でられて、{b}は涙目で腰を浮かせた。|{a}は{b}が達しそうになるたびに指を止め、「まだだめ」と囁いた。それを三度繰り返した。|{a}は舌先で{b}の花芯をつつくように弄び、{b}が「お願い」と言うまで、それ以上はしなかった。|{a}は{b}の中に指を一本だけ入れて、動かさずに待った。焦れた{b}は、自分から腰を揺らし始めた。'),
    playful: L('{a}と{b}は上になったり下になったりしながら、互いの弱いところを探し合った。笑い声は、いつの間にか甘い声に変わっていた。|{a}は「ここ？　ここ？」と確かめながら指を動かし、{b}の反応がいい場所を見つけるたびに嬉しそうにした。|{a}は{b}と脚を絡めて、互いの熱いところを重ね合わせた。どちらが先に音を上げるか、二人とも負けず嫌いだった。|{a}は{b}の胸に顔を埋めて「やわらかい」と笑い、そのまま指で{b}を追い詰めていった。|{a}は{b}の耳たぶを甘噛みしては「ここ弱いでしょ」と笑い、指先で胸の先と脚のあいだを交互にくすぐった。笑い声が、だんだん途切れがちになった。'),
    clinical: L('{a}は{b}の反応がいい場所だけを、一定のリズムで正確に撫で続けた。{b}の呼吸が、少しずつ浅くなっていった。|{a}は指を二本揃えて、{b}の中のざらついたところを、迷いなく押し上げた。|{a}は無駄口を叩かず、舌と指で{b}だけを確実に追い上げていった。|{a}は{b}の脚を開かせて膝を固定し、舌の先だけで同じ場所を、同じ速さで、何度もなぞった。{b}の太ももが、小刻みに震えはじめた。'),
    clumsy: L('{a}は加減が分からず、{b}に「もうちょっと、優しく」と言われては謝った。それでも、{b}の声はだんだん甘くなっていった。|{a}と{b}は手探りで、互いの気持ちいいところを教え合った。何度か噛み合わず、そのたびに照れ笑いした。|{a}は{b}に「どこがいい？」と真剣に訊き、教えられたとおりに、丁寧すぎるほど丁寧に指を動かした。|{a}は{b}の脚のあいだにおそるおそる顔を寄せ、「こう……？」と確かめながら舌を這わせた。{b}が息を呑むたびに、{a}は少しずつ大胆になった。')
  };
  var CLIMAX = {
    rough: L('{a}が指を深く押し込んだ瞬間、{b}は背中を大きく反らせて達した。{a}は、{b}が震え終わるまで手を止めなかった。|{b}が「もう無理」と泣いても、{a}は止まらなかった。二度、三度と、{b}は続けざまに達した。|{a}は{b}の首筋に歯を立てたまま、{b}を最後まで追い詰めた。{b}の体が、がくがくと震えた。|{a}は{b}の脚を押さえつけたまま花芯を強く吸い上げた。{b}は腰を跳ね上げ、悲鳴のような声を上げて達した。'),
    gentle: L('{b}は{a}の名前を呼びながら、小さく震えて達した。{a}は{b}が落ち着くまで、ずっと抱きしめていた。|二人は脚を絡めたまま、ほとんど同時に達した。重なった鼓動が、なかなか静まらなかった。|{b}の体がふっと強張り、それからゆっくりとほどけた。{a}は{b}の額に、そっと口づけた。|{a}の指がやさしく奥を押し上げた瞬間、{b}は{a}の肩に顔を埋めて、長く、甘く震えた。'),
    tease: L('散々焦らされたあと、{a}がようやく触れてほしい場所に触れると、{b}はひとたまりもなく達した。|{a}が「いいよ」と囁いた瞬間、{b}は堰を切ったように達した。|{b}は{a}の指をきつく締めつけながら、声にならない声を上げて果てた。|{a}が「もう一回お願いして」と囁くと、{b}は涙声でお願いした。その言葉の途中で、{b}は達してしまった。'),
    playful: L('先に声を上げたのは{b}だった。「今の、なし……！」と言いながら、{b}はもう一度達した。|二人は笑いながら、ほとんど同時に果てた。シーツの上で、しばらく肩で息をしていた。|{b}が達したあと、今度は{b}が{a}に飛びかかった。{a}も、すぐに笑っていられなくなった。|{a}が「くすぐったい？」と笑った瞬間、{b}の笑い声が甘い悲鳴に変わった。{b}は{a}にしがみついたまま、何度も震えた。'),
    clinical: L('{b}は{a}の指の動きに合わせて、短く震えて達した。{a}は表情を変えずに、それを見届けた。|{a}が一番弱いところを押し上げた瞬間、{b}はシーツを握りしめて達した。|{a}は{b}が達する寸前で一拍だけ指を止め、それから同じ場所を正確に押し上げた。{b}は声を詰まらせて、長く痙攣した。|{a}の舌が同じ速さを崩さないまま、{b}を最後まで追い上げた。{b}が達しても、{a}は震えが収まるまで顔を上げなかった。'),
    clumsy: L('{b}は驚いたような顔で達し、それから恥ずかしそうに顔を覆った。{a}は「今の、私が？」と嬉しそうに訊いた。|二人とも、途中で何度も笑ってしまった。それでも最後には、{b}は{a}の腕の中で小さく震えていた。|{a}が指の角度を変えた拍子に、{b}は不意を打たれたように達した。二人とも一瞬きょとんとして、それから笑い出した。|{b}は{a}の名前を呼びながら、{a}の拙い指の動きで達した。{a}は{b}が落ち着くまで、ぎこちなく背中を撫でていた。')
  };
  var AFTER = {
    will: L('{a}は{b}の汗ばんだ前髪を指で払って、「かわいかった」と囁いた。{b}は{a}の胸に顔を埋めた。|二人は毛布にくるまって、指を絡めたまま、しばらく何も言わなかった。|{b}は{a}の首に腕を回して、「次は、私がする番」と言った。'),
    des: L('{a}は黙って毛布を{b}に掛け、自分は床に散らばった服を拾った。|二人は背中合わせで身支度を整えた。どちらも、相手の顔を見なかった。|{a}は「忘れていいから」と言った。{b}は「……忘れられるわけない」と返した。'),
    aphro: L('熱が引いたあと、二人はしばらく顔を見られなかった。部屋には、まだ甘い匂いが残っていた。|正気に戻った{a}は、{b}の首筋の痕を見て、頭を抱えた。|{b}は「……全部、薬のせいだから」と言った。{a}は「うん」とだけ答えた。')
  };
  var TOY = L('{a}は木箱から取り出した細身の玩具の電源を入れ、震える先端を{b}の一番敏感なところに押し当てた。|{a}は双頭の玩具の片側を自分に、もう片側を{b}にあてがい、二人をひとつにつないだ。動くたびに、二人分の甘い声が重なった。|{a}は小さなローターを{b}の下着の中に滑り込ませ、強さを一段ずつ上げていった。|{a}は張り型を手に取り、{b}の濡れたところにゆっくりと沈めていった。');
  var REPEAT = L('{a}と{b}は、もう一度互いを抱き寄せた。さっきよりも、触れ方に遠慮がなかった。|{a}は{b}の脚を開かせ、さっき覚えたばかりの弱いところを、迷いなく攻めた。|{a}と{b}は脚を絡め、今度はゆっくりと、互いの熱を確かめ合った。|{a}は前の夜を思い出させるように、{b}の首筋の同じ場所に唇を落とした。{b}の体は、それだけで覚えていた。');
  var SPEED = L('{a}は動けない{b}の脚のあいだに膝をつき、指と舌で手早く{b}を追い上げた。|{a}は縛った{b}の胸元を開き、「すぐ終わらせるから」と言って指を滑り込ませた。|{a}は時間を惜しむように{b}の下着を引き下ろし、迷いなく指を沈めた。|{a}は{b}を壁際に立たせたまま、スカートの中に手を差し入れ、耳元で「声、我慢して」と囁いた。');

  var POOLS = { open: OPEN, body: BODY, climax: CLIMAX, after: AFTER, toy: { all: TOY }, repeat: { all: REPEAT }, speed: { all: SPEED } };
  /* 二人が対等に繋がる描写（双頭の玩具・貝合わせ・上下の入れ替わり）は、二人ともリバのときだけ。それ以外の組では候補から外す */
  var MUTUAL_RE = HK.Pos && HK.Pos.MUTUAL_RE ? HK.Pos.MUTUAL_RE : /双頭の玩具|双頭ディルド|貝合わせ|擦り合わせ|擦りつけ合|擦り付け合|重ね合わせ|上になったり下になったり|入れ替わ/;
  var MUT_SEX = /上に|下に|腰|跨|喘|果て|♡|肌を|繋が|舐|指|奥|胸|脚|熱|濡れ|攻め|受け|組み敷|押し倒/;
  function noMutual(arr, riba) { if (riba) return arr; var r = arr.filter(function (s) { return !MUTUAL_RE.test(s); }); return r.length ? r : arr; }
  /* R18版は、同じ回の中で使った文を避ける（ero-kit.js の HK.Ero.fresh。元の選び方は ctx.pick） */
  function pickArr(ctx, arr) { var base = function (a) { return ctx && ctx.pick ? ctx.pick(a) : a[Math.floor(Math.random() * a.length)]; }; return ctx && HK.Ero && HK.Ero.fresh ? HK.Ero.fresh(ctx.S || ctx, arr, base) : base(arr); }
  function fill(ctx, s, a, b) {
    if (ctx && ctx.t) return ctx.t(s, a, b);
    return s.replace(/\{a\}/g, a.name).replace(/\{b\}/g, b.name);
  }
  function styleOf(a) {
    var t = (a && a.tr) || {};
    if ((t.aggr || 0) > 0.62 || (t.cp || 0) > 0.7) return 'rough';
    if ((t.cold || 0) > 0.6) return 'clinical';
    if ((t.fc || 0) > 0.62) return 'playful';
    if ((t.ac || 0) > 0.62) return 'clumsy';
    if ((t.a || 0) > 0.6) return 'tease';
    return 'gentle';
  }
  /* FF.fix で差し替える文の候補：元の文の役目で段を選ぶ */
  function sentenceKind(sen, st, drug, riba, opt) {
    if (/果て|達し|イ[っか]|絶頂/.test(sen)) return CLIMAX[st] || CLIMAX.gentle;
    if (/縛|拘束|動けな/.test(sen)) return SPEED;
    if (/もう一度|もう一回|二度目|再び/.test(sen)) return noMutual(REPEAT, riba);
    if (/翌朝|朝にな|終わった|事後|身支度|熱が引/.test(sen)) return AFTER[drug ? 'aphro' : 'will'];
    if (/押し倒|脱が|唇を奪|ボタン|ホック|服を/.test(sen)) return OPEN[st] || OPEN.gentle;
    if (opt && opt.tools && /玩具|道具|木箱/.test(sen)) return noMutual(TOY, riba);
    return noMutual(BODY[st] || BODY.gentle, riba);
  }
  var FF = HK.FF = {
    POOLS: POOLS,
    styleOf: styleOf,
    pick: function (ctx, kind, st, opt) {
      if (kind === 'after') return pickArr(ctx, AFTER[(opt && opt.mode) || st] || AFTER.will);
      var P = POOLS[kind] || BODY, arr = P[st] || P.all || P.gentle;
      if (kind === 'body' && opt && opt.tools && pickArr(ctx, [0, 0, 1]) === 1) arr = TOY;
      return pickArr(ctx, noMutual(arr, opt && opt.riba));
    },
    /* 書き出し：二度目以降なら repeat、急ぐ場面（opt.speed）なら speed（縛る文は opt.bind のときだけ）、それ以外は型ごとの open。
       r18-thick（邪神村・吹雪の館の山場）・R18M の女性どうし・FF.fix から使う */
    lead: function (ctx, st, opt) {
      opt = opt || {};
      if (opt.repeat) return pickArr(ctx, noMutual(REPEAT, opt.riba));
      if (opt.speed) { var sp = SPEED.filter(function (s) { return opt.bind || !/縛/.test(s); }); return pickArr(ctx, sp.length ? sp : SPEED); }
      return pickArr(ctx, OPEN[st] || OPEN.gentle);
    },
    /* 事後：mode は 'will'（望んで）/'des'（仕方なく・揉み合いのあと）/'aphro'（媚薬） */
    after: function (ctx, mode) { return pickArr(ctx, AFTER[mode] || AFTER.will); },
    /* 気分（R18M の mood）から事後の mode */
    afterMode: function (mood) { return mood === 'drug' ? 'aphro' : mood === 'rough' ? 'des' : 'will'; },
    /* 一場面ぶん。a/b は指定どおりに並べ替える（自分で攻めを選んだ人は必ず a） */
    scene: function (ctx, a, b, mode, opt) {
      opt = opt || {};
      var o = HK.Pos ? HK.Pos.order(a, b, [a, b]) : [a, b], A = o[0], B = o[1];
      var st = opt.st || styleOf(A), out = [];
      if (mode === 'repeat') out.push(pickArr(ctx, REPEAT));
      else if (mode === 'speed') out.push(pickArr(ctx, SPEED));
      else out.push(pickArr(ctx, OPEN[st] || OPEN.gentle));
      var riba = HK.Pos && HK.Pos.bothRiba && HK.Pos.bothRiba(A, B);
      out.push(opt.tools && pickArr(ctx, [0, 1]) ? pickArr(ctx, noMutual(TOY, riba)) : pickArr(ctx, noMutual(BODY[st] || BODY.gentle, riba)));
      out.push(pickArr(ctx, CLIMAX[st] || CLIMAX.gentle));
      if (AFTER[mode]) out.push(pickArr(ctx, AFTER[mode]));
      return out.map(function (s) { return fill(ctx, s, A, B); }).join('') + (opt.dash ? '――' : '');
    },
    /* 取りこぼし対策：男性の体を前提にした文を、女性どうしの文に差し替える */
    fix: function (ctx, text, a, b, opt) {
      var RE = HK.Pos && HK.Pos.MALE_RE;
      if (!RE || typeof text !== 'string' || !RE.test(text)) return text;
      /* 性器なしの人がいる組は pos-nogen.js が口・指と玩具の文に直す */
      if (HK.NoGen && HK.NoGen.on(a, b)) return text;
      var o = HK.Pos.order(a, b, [a, b]), A = o[0], B = o[1], st = (opt && opt.st) || styleOf(A), riba = HK.Pos.bothRiba && HK.Pos.bothRiba(A, B);
      var drug = /媚薬|薬の|甘い匂い|発情/.test(text), used = {};
      return text.replace(/[^。！？」]*(?:「[^」]*」[^。！？」]*)*[。！？]?/g, function (sen) {
        if (!sen || !RE.test(sen)) return sen;
        /* 差し替える文の役目（書き出し・縛った場面・二度目・事後・果てる・最中）に合わせて、その段の文を使う */
        var arr = sentenceKind(sen, st, drug, riba, opt), cand = arr.filter(function (x) { return !used[x]; }), r = pickArr(ctx, cand.length ? cand : arr);
        used[r] = 1;
        return fill(ctx, r, A, B);
      });
    },
    /* 二人が対等に繋がる文（双頭の玩具・貝合わせ・上下の入れ替わり）を、リバ同士でない組では指・舌の文に差し替える */
    fixMutual: function (ctx, text, a, b, opt) {
      if (typeof text !== 'string' || !MUTUAL_RE.test(text)) return text;
      var o = HK.Pos.order(a, b, [a, b]), A = o[0], B = o[1], st = (opt && opt.st) || styleOf(A);
      return text.replace(/[^。！？」\n]*(?:「[^」]*」[^。！？」\n]*)*[。！？]?/g, function (sen) {
        if (!sen || !MUTUAL_RE.test(sen)) return sen;
        /* 「入れ替わ」は、ふつうの文（見張りの番を入れ替わる など）にも出るので、体の描写の文のときだけ直す */
        if (/入れ替わ/.test(sen) && !MUT_SEX.test(sen) && !/双頭|貝合わせ|擦り|重ね合わせ|上になったり|ところ同士|ところを重ね/.test(sen)) return sen;
        return fill(ctx, pickArr(ctx, noMutual(/果て|達し|イ[っか]|絶頂/.test(sen) ? (CLIMAX[st] || CLIMAX.gentle) : (BODY[st] || BODY.gentle), false)), A, B);
      });
    }
  };

  /* どの箱庭の結果も最後に一度見直す：女性の体どうしの組（リバ同士を除く）の二人が出る文に、対等な繋がりの描写が残っていれば直す */
  var sim0 = HK.simulate;
  if (!sim0) return;
  HK.simulate = function (input) {
    var res = sim0.apply(this, arguments);
    try {
      var P = HK.Pos, cs = P.withIdx((input && input.chars) || []);
      var Fs = cs.filter(function (c) { return P.isFBody ? P.isFBody(c) : P.isF(c); });
      if (Fs.length < 2 || !res) return res;
      var pairs = [];
      for (var i = 0; i < Fs.length; i++) for (var j = i + 1; j < Fs.length; j++) if (!(P.bothRiba && P.bothRiba(Fs[i], Fs[j])) && P.okSex(Fs[i], Fs[j]) && !(HK.ngPair && HK.ngPair(Fs[i], Fs[j])) && !(HK.sexBlocked && HK.sexBlocked(Fs[i], Fs[j])) && !(P.isMaleTop && (P.isMaleTop(Fs[i], Fs[j]) || P.isMaleTop(Fs[j], Fs[i])))) pairs.push([Fs[i], Fs[j]]);
      if (!pairs.length) return res;
      var rng = HK.rng ? HK.rng(((input.seed || 1) * 6007 + 29) >>> 0) : null;
      var ctx = { pick: function (a) { return a[rng ? rng.int(a.length) : Math.floor(Math.random() * a.length)]; } };
      var items = (res.log || []).slice();
      if (res.ending && Array.isArray(res.ending.lines)) res.ending.lines.forEach(function (l, i) { items.push({ _end: i, text: l }); });
      items.forEach(function (e) {
        if (!e || typeof e.text !== 'string' || !MUTUAL_RE.test(e.text)) return;
        for (var k = 0; k < pairs.length; k++) {
          var p = pairs[k];
          if (e.text.indexOf(p[0].name) >= 0 && e.text.indexOf(p[1].name) >= 0) e.text = FF.fixMutual(ctx, e.text, p[0], p[1]);
        }
        if (e._end != null) res.ending.lines[e._end] = e.text;
      });
    } catch (err) { /* 見直しに失敗しても結果は返す */ }
    return res;
  };
  for (var k in sim0) if (Object.prototype.hasOwnProperty.call(sim0, k)) HK.simulate[k] = sim0[k];
})();
