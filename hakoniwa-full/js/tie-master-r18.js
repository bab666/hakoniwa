/* 箱庭シミュレーター（R18版のみ）: 関係の段階の、合意のない場面（内容のスイッチ「合意のない展開」が入のときだけ。展開の重さが穏やかなら切）
   ・主従：従者が主人を襲う（恨み・抑えきれない執着）。tie_master_r18（関係ごとの場面なので id は tie_ で始める）
   ・下剋上（tie-stage.js の試練 tie_trial）：立場が入れ替わったその場で、下だった側が上だった側を組み敷く（HK.TieMasterR18.overturn）
   起きる条件（MR.ok）：R18版で、内容のスイッチの「合意のない展開」が入・描写の設定がある箱庭（クラスメイトでは起きない）・二人とも R18 に出てよい
   （HK.Pos.okForce：その場にいる・恋愛対象と受け攻めが合う。恋愛対象「なし」は体の関係の相手で）・恋愛対象は両方向（ctx.romanceOk）・
   従者が主を避けていない（HK.Avoid。恨み＝敵視・不仲は避けているのとは別なので起きる）・従者が攻め・主が受けに回れる（MR.dirOk。自分で攻めを選んだ人を受ける側にしない）。
   一回の箱庭で同じ組は一度まで。起きる見込みは MR.plan（一回の箱庭で、ふつう 5 割・重い 7 割ほど。強い動機があればもっと）。記録は性的な場面の印（e.lewd）と理由の〔合意のない展開〕
   甘く書かない：襲う側の歪んだ言い分、受ける側の抵抗・混乱（HK.DarkThick.resist の態度9種）、事後の空白。小説調では♡は使わない。
   最中は性別の組ごと（m＝攻めが男性の体／ff＝女性どうし／fm＝女性の攻めが男性に跨る）、山場は受ける側の態度9種。
   男性向けの作風（2026-10-27）：最中を体の組（mv／ma／ff／fm）の男性向けの文、山場を受ける側の態度9種（HK.HateSex.Force.PEAK）＋嫌がる喘ぎ（♡）、果ては組ごと。
   描写「ほのめかす」は暗転の一文だけ。登場人物はすべて成人として扱う */
(function () {
  'use strict';
  var HK = window.HK;
  if (!HK || HK.SAFE_ON || !HK.COMMON) return;
  function L(s) { return s.split('|'); }
  var PK = ['proud', 'stern', 'tsun', 'gentle', 'devoted', 'cool', 'free', 'shy', 'polite'];
  function per(c) { var k = c && (c.persona || (HK.personaOf && HK.personaOf(c))) || 'gentle'; return PK.indexOf(k) >= 0 ? k : 'gentle'; }
  function isF(c) { return !!(HK.Pos && HK.Pos.isF && HK.Pos.isF(c)); }
  function kindOf(t, b) { return isF(t) ? (isF(b) ? 'ff' : 'fm') : 'm'; }
  function pk(ctx, l) { return HK.Ero && HK.Ero.fresh && ctx.rng.int ? HK.Ero.fresh(ctx.rng, l) : ctx.pick(l); }
  function fl(t, a, b) { return String(t).replace(/\{a\}/g, a.name).replace(/\{b\}/g, b.name); }
  function J(a) { return a.filter(Boolean).join('\n\n'); }
  var MR = HK.TieMasterR18 = {};

  /* 起きてよい組か（top＝襲う側、bot＝襲われる側）
     向き（2026-10-28 担当KD）：以前は HK.Pos.order（その組の向きの癖。おまかせの女性は受けに寄る）で従者が攻めのときだけだったので、
     おまかせの女性の従者×おまかせの男性の主では起きなかった（表示は「あり」）。合意のない場面は襲う側が決まっているので、
     受け攻めの指定で従者が攻め・主が受けに回れる向きがあれば（HK.Pos.orients。自分で攻めを選んだ主・受けを選んだ従者は不可）、
     相手ごとの指定・攻め度で向きが決まる組（HK.Pos.prefer）はその向きどおりのときだけ起こす。
     恋愛対象「なし」の人は「体の関係の相手」で見る（HK.Pos.okForce。合意のない展開の切羽詰まった場面と同じ）。
     従者が主を避けている（HK.Avoid：苦手・避けている・恐怖・無関心・嫌悪と回避型の気質）なら起こさない（ctx.romanceOk の門） */
  MR.dirOk = function (top, bot) {
    var P = HK.Pos;
    if (!P || !P.orients) return true;
    if (!P.orients(top, bot).some(function (o) { return o[0] === top; })) return false;
    var pr = P.prefer ? P.prefer(top, bot) : null;
    return !pr || pr[0] === top;
  };
  MR.ok = function (ctx, top, bot) {
    if (!ctx || !top || !bot || top === bot || HK.SAFE_ON) return false;
    if (!(HK.Content && HK.Content.ok(ctx, 'force'))) return false;
    if (!ctx.env || ctx.env.lewd == null || (ctx.scen && ctx.scen.id === 'classroom')) return false;
    if (top.flags && (top.flags.caged != null || top.flags.cagePair != null) || bot.flags && (bot.flags.caged != null || bot.flags.cagePair != null)) return false;
    var P = HK.Pos;
    if (!(P && P.okForce ? P.okForce(ctx, top, bot) : HK.State && HK.State.pairSex(top, bot))) return false;
    if (ctx.pair(top, bot).kin) return false;
    if (ctx.romanceOk && !ctx.romanceOk([top, bot], { sex: true, force: true })) return false;
    if (!P) return true;
    return P.forceOpen ? P.forceOpen(ctx, [top, bot], function () { return MR.dirOk(top, bot); }) : MR.dirOk(top, bot);
  };
  /* 一回の箱庭で同じ組は一度まで（主従の夜・下剋上の凌辱のどちらか）。下剋上で入れ替わった組も、もう起こさない */
  MR.done = function (ctx, a, b) { var pf = ctx.pair(a, b); return !!(pf.mrDone || pf.mrFlip); };

  var X = {
    dim: L('――その夜、{a}と{b}のあいだで起きたことを、{b}は誰にも話さなかった。|扉が閉まる音がした。それから先のことは、{b}の記憶の中でも途切れ途切れだった。|灯りが消された。{b}が最後に見たのは、見たことのない顔をした{a}だった。'),
    openResent: L('{a}は扉に鍵を掛けると、ゆっくりと振り返った。「ずっと、あなたの言いなりだった。……今夜くらい、私の好きにさせてもらう」――{b}が叱りつけようとした声は、{a}の手のひらに塞がれた。|{a}は{b}の手首を掴んで、壁に押しつけた。何年も頭を下げ続けてきた相手の顔が、{a}のすぐ目の前にあった。「＠{a}＠命令して。いつもみたいに。……聞かないけど」|{b}が{a}の名前を呼んだ。いつもの、命じる声で。{a}は笑って、{b}を床に突き飛ばした。「その声も、今夜で聞き納めだ」'),
    openDesire: L('{a}は{b}の背後に立ち、震える手でその肩を掴んだ。「ずっと我慢してきた。仕えるだけでいいと思ってた。……でも、もう無理」――{b}が振り払おうとしても、{a}の手は離れなかった。|{a}は{b}の足元にひざまずき、それから、ひざまずいたまま{b}の腰を引き寄せた。「あなたの全部が欲しい。従者の分際で、なんて言わないで」|{a}は{b}を押し倒し、その上に覆いかぶさった。崇めるように見下ろす目が、{b}にはいちばん恐ろしかった。「＠{a}＠やっと、手が届いた」'),
    openOver: L('立場が入れ替わったその場で、{a}は{b}の襟首を掴んで引き寄せた。「さっきまで偉そうにしてたのに。……今は、私の番だ」|{a}は膝をついた{b}を見下ろし、その顎を指で持ち上げた。「教わったことは全部返す。体でね」――{b}の顔から、血の気が引いた。|{a}は{b}を床に押し倒し、両手首をまとめて押さえつけた。「上も下も、もう決まった。黙って受け取れ」'),
    feel: L('掴まれた手首が軋んだ。{b}がどれだけもがいても、{a}の体重はびくともしなかった。|服の留め具が一つずつ外されていく。そのたびに、{b}の喉から押し殺した声が漏れた。|{a}の指が肌をなぞるたびに、{b}は身をよじった。逃げ場はどこにもなかった。'),
    body: {
      m: L('{a}は{b}の脚を割り開き、慣らしもしないまま押し入った。{b}の体が跳ね、悲鳴が喉の奥で潰れた。{a}は構わずに腰を沈め、奥まで届かせてから、ゆっくりと動き始めた。|{a}は{b}をうつ伏せに押さえつけ、後ろから無理やり繋がった。{b}の指が床を掻きむしった。{a}は{b}の腰を掴んで引き寄せ、逃げるたびに深く突き入れた。|{a}は{b}の両手を頭の上で押さえたまま、真上から貫いた。{b}が顔を背けると、{a}はその顎を掴んで正面を向かせ、目を逸らさせないまま腰を打ちつけた。'),
      ff: L('{a}は{b}の脚の間に指をねじ込み、濡れてもいないところを容赦なくなぞった。{b}が腰を引こうとすると、{a}は太腿を押さえつけて、さらに奥まで指を沈めた。|{a}は{b}の両手首を片手でまとめ、もう片方の手で{b}の体の奥を探った。{b}が首を振っても、{a}の指は止まらず、執拗に同じところを擦り続けた。|{a}は{b}の脚を肩に担ぎ上げ、閉じようとする腿を押し広げて、そこに舌を這わせた。{b}がどれだけ身をよじっても、{a}は離れなかった。'),
      fm: L('{a}は{b}の胸を押さえつけて跨り、硬くなってしまった{b}のものを、自分の中へ無理やり沈めた。{b}が首を振ると、{a}はその喉元に手を添えて動きを止めさせた。|{a}は{b}の腕を床に縫いとめたまま、腰を落として{b}を呑み込んだ。{b}の体だけが、{b}の意思とは関係なく応えてしまっていた。|{a}は{b}の上で腰を揺らしながら、見下ろして笑った。{b}は歯を食いしばったが、{a}が深く沈むたびに、押し殺した息が漏れた。')
    },
    peak: {
      proud: L('{b}は最後まで{a}を睨み続けた。それでも体は限界を越え、{b}は屈辱に震えながら果てた。|{b}は唇を噛み切りそうなほど噛んで耐えた。けれど最後に漏れた声は、{b}自身にも聞かせたくないものだった。|{b}の悪態は、途中から言葉にならなくなった。体を引きつらせて達したあと、{b}は顔を背けたまま動かなかった。'),
      stern: L('{b}は声ひとつ上げなかった。ただ、最後の瞬間だけ、こらえきれずに背が反った。|{b}は目を閉じて、すべてが終わるのを待った。体が勝手に果てたとき、{b}の目尻から一筋だけ涙がこぼれた。|{b}は息を殺して耐え続けた。その沈黙が崩れたのは、一度きり、体の奥が勝手に跳ねたときだけだった。'),
      tsun: L('{b}「やだ、やだっ……！」――叫んでいた声が、途中から震えに変わった。{b}は泣きながら果て、それきりしゃくり上げるばかりになった。|{b}は{a}を叩こうとした手を押さえつけられたまま、こらえきれずに達した。「……最低」とだけ、かすれた声で言った。|{b}は嫌だと繰り返しながら、最後には体を強ばらせて果てた。悔しさで、涙が止まらなかった。'),
      gentle: L('{b}は「お願い、もうやめて」と繰り返していた。その願いが聞き届けられないまま、体だけが果ててしまった。|{b}はぼろぼろと泣きながら、{a}の名前を呼んだ。責める声ではなかった。それが、かえって痛々しかった。|{b}の体が震えて、限界を越えた。{b}は顔を覆い、何が起きたのか分からないというように、しばらく動けなかった。'),
      devoted: L('{b}は「ごめんなさい」と何度も呟いていた。誰に謝っているのかも分からないまま、体が勝手に果てた。|{b}は抵抗をやめてしまっていた。最後に達したとき、{b}の目はどこも見ていなかった。|{b}は唇を震わせながら耐え、果てたあと、小さく「どうして」とだけ呟いた。'),
      cool: L('{b}は天井の一点を見つめたまま、自分の体が果てるのを他人事のように感じていた。|{b}は呼吸を数えることで正気を保とうとした。数が途切れた瞬間、体だけが限界を越えた。|{b}「……終わったなら、離れて」――果てたあとの声は、驚くほど平坦だった。指先だけが、小さく震えていた。'),
      free: L('{b}は暴れて、叫んで、それでも逃げられなかった。最後に体が跳ねたとき、{b}の叫び声は、ただのかすれた息になっていた。|{b}「冗談でしょ、ねえ……っ」――その声は、果てると同時に途切れた。|{b}はいつもの軽口ひとつ出てこないまま、体を引きつらせて達した。'),
      shy: L('{b}は声を出すこともできずに、ただ震えていた。果てた瞬間でさえ、漏れたのは小さな息だけだった。|{b}は両手で顔を隠そうとして、それすら許されなかった。体が限界を越えたとき、{b}の目から涙があふれた。|{b}は唇を噛んで、喉の奥で声を殺したまま果てた。それきり、身を縮めて動かなくなった。'),
      polite: L('{b}「おやめください、どうか……」――丁寧な言葉は、最後まで崩れなかった。体だけが、それを裏切って果てた。|{b}は乱れた息を必死に整えようとしたが、体の奥が勝手に跳ねた瞬間、すべてが崩れた。|{b}は果てたあと、震える手で襟元を直そうとした。指が言うことを聞かなかった。')
    },
    /* 男性向けの作風：山場を擬音で厚く（♡は使わない）。性別の組ごとに二文以上 */
    peakEro: {
      m: L('ずちゅっ、ずちゅっと濡れた音が、{b}の嗚咽をかき消した。{a}は{b}の腰を掴んだまま奥を何度も抉り、最後に根元まで沈めて、{b}の中に熱を吐き出した。|ぱんっ、ぱんっと肌のぶつかる音だけが部屋に響いた。{a}が奥を突き上げるたびに{b}の体は跳ね、とうとう{b}は声にならない悲鳴を上げて果てた。{a}もそのまま、{b}の奥で果てた。|{a}の腰の動きがいっそう荒くなった。ぐちゅぐちゅと掻き回される音の中で、{b}の体はびくびくと痙攣し、{a}は{b}をきつく押さえつけたまま奥へ注ぎ込んだ。'),
      ff: L('くちゅくちゅと粘ついた音が止まなかった。{a}の指が奥の一点を執拗に押し上げ、{b}は腰を跳ね上げてびくびくと果てた。{a}は指を抜かず、震えが収まるまでそこを擦り続けた。|{a}の舌と指が、{b}のいちばん弱いところを同時に責め立てた。ぴちゃぴちゃと濡れた音の中で、{b}は太腿を痙攣させて達した。|{a}は{b}の中で指を鉤のように曲げ、容赦なく掻き回した。じゅぷっと音を立てて溢れたものが床を濡らし、{b}は背を反らせて果てた。'),
      fm: L('{a}は{b}の上で激しく腰を打ちつけた。ぱちゅっ、ぱちゅっと音が響くたびに{b}のものは根元まで呑み込まれ、とうとう{b}は{a}の中で、こらえきれずに果てた。|{a}が腰を落とすたびに、ぐちゅりと濡れた音がした。{b}は歯を食いしばったが、{a}がきつく締めつけた瞬間、びくびくと腰を跳ねさせて{a}の中に吐き出した。|{a}は{b}の胸に爪を立てて、腰を前後に擦りつけた。じゅぷじゅぷと音を立てて扱き上げられ、{b}は意思とは関係なく、{a}の奥へ熱を放っていた。')
    },
    /* 男性向けの最中（2026-10-27 担当BM）：体の組（mv＝女性器へ／ma＝後ろへ／ff／fm）。{m0}{m1}＝襲われる側の嫌がる喘ぎ、{s:…}＝擬音 */
    bodyEro: {
      mv: L('{a}は{b}を机に押し伏せ、仕立てのいい服の裾を乱暴にたくし上げた。{a}「いつも私を見下ろしてた人の、こんな格好｜いつも私を見下ろしていた人の、こんな格好か｜いつも私を見下ろしていた方の、こんなお姿ですか」――ろくにほぐしもしない{女性器}に、{a}は後ろから{男性器}をねじ込んだ。{s:hit}。{b}「{m0}」|{a}は{b}を主の寝台に押し倒し、閉じようとする膝を割り開いた。{s:hit}。一息に{ナカ}の奥まで突き入れられて、{b}の背中が弓なりに反る。{b}「{m1}」――{a}は{b}の両手首を枕元に押さえつけたまま、仕えてきた年月の分だけ、何度も腰を叩きつけた。|{a}は{b}の片脚を抱え上げ、壁に押しつけたまま下から突き上げた。{s:hit}{s:hit}。爪先立ちになった{b}の{ナカ}が、嫌がるように{a}を締めつける。{b}「{m1}」――{a}「命令してみて。やめろって｜命令してみろ。やめろと｜命令してみてください。やめろ、と」'),
      ma: L('{a}は{b}をうつ伏せに押さえつけ、主の誇りごと服を剥ぎ取った。唾で湿らせた指で{後ろ}をこじ開け、{亀頭}を押し当てる。{s:hit}。{b}「{m0}」――ぎちぎちと押し広げられて、{b}はシーツを握りしめた。|{a}は{b}を机に押し伏せ、背後から{後ろ}の奥まで{男性器}を沈めた。{s:hit}。前に回った手が{b}の{男性器}を握り、嘲るように扱き上げる。{b}「{m1}」――{a}「主人なのに、従者に犯されて硬くしてる｜主人のくせに、従者に犯されて硬くしているのか｜ご主人様なのに、従者に犯されて硬くしていらっしゃいますね」|{a}は{b}の両脚を抱え上げ、真上から{後ろ}を突き下ろした。{s:hit}{s:hit}。奥のしこりを擦り上げられるたびに、{b}の{男性器}から透明な雫がこぼれる。{b}「{m1}」――{b}が顔を背けるたびに、{a}は顎を掴んで自分のほうを向かせた。'),
      ff: L('{a}は{b}を寝台に押し倒し、命じることに慣れた唇を自分の唇で塞いだ。脚のあいだに滑り込んだ指が、{女性器}の割れ目を乱暴になぞる。{s:wet}。{b}「{m0}」――揃えた二本の指が、{b}の{ナカ}に容赦なく沈められた。|{a}は{b}の{胸}を口に含み、{乳首}に歯を立てながら、{ナカ}の一番弱いところを指で抉った。{s:wet}。{b}「{m1}」――{a}「いつもは、私に命令する口なのに｜いつもは、私に命令する口なのにな｜いつもは、私に命令なさるお口なのに」|{a}は{b}の両手首を片手でまとめ、脚のあいだに顔を埋めた。{s:suck}。{陰核}を強く吸い上げられ、{b}の腰が勝手に跳ねる。{b}「{m1}」――仕えてきた手と舌が、主人の体を誰よりもよく知っていた。'),
      fm: L('{a}は{b}を椅子に押さえつけて跨り、{b}の{男性器}を握って無理やり硬くさせた。{s:wet}。{b}「{m0}」――{a}は勝ち誇った顔で、それを自分の{女性器}にあてがい、一気に腰を落とした。|{a}は{b}の胸に爪を立てながら、根元まで咥え込んだ腰を前後に揺すった。{s:wet}。{b}「{m1}」――{a}「ご主人様の、私の中でこんなに硬い｜主人のものが、私の中でこんなに硬い｜ご主人様のものが、私の中でこんなに硬いですよ」|{a}は{b}が達しそうになるたびに腰を止め、根元をきつく握って焦らした。{s:wet}。{b}「{m1}」――{a}「命令すれば？　イかせろって｜命令すればいい。イかせろ、と｜命令なさればいいんですよ。イかせろ、と」')
    },
    after: L('{a}が離れたあとも、{b}はその場から動けなかった。上と下は、もう二度と元には戻らなかった。|{a}は身なりを整えると、何事もなかったように言った。「明日からも、よろしくお願いします」――{b}は返事をしなかった。|{b}は破れた服をかき寄せて、天井を見つめた。さっきまでそこにあったはずの自分の居場所が、どこにも見当たらなかった。'),
    say: L('{a}「いい顔。……ずっと、見たかった」|{a}「声、出していいんですよ。誰も来ませんから」|{a}「あなたが私に教えたんだ。欲しいものは、自分で取れって」')
  };
  MR.X = X;
  /* 本文を組み立てる。kind：'resent'（恨み）／'desire'（執着）／'over'（下剋上） */
  MR.scene = function (ctx, top, bot, kind) {
    var Lw = HK.Lewd, env = ctx.env;
    if (Lw && Lw.low(env)) return fl(pk(ctx, X.dim), top, bot);
    var k = kindOf(top, bot), ero = Lw && Lw.ero(env), short = Lw && Lw.short(env, ctx.rng);
    var voice = HK.DarkThick && HK.DarkThick.resist ? HK.DarkThick.resist(ctx.rng, bot).replace(/\{v\}/g, bot.name).replace(/\{a\}/g, top.name) : '';
    var open = pk(ctx, kind === 'over' ? X.openOver : kind === 'desire' ? X.openDesire : X.openResent);
    /* 男性向け（2026-10-27 担当BM）：最中は体の組の男性向けの文（喘ぎ・擬音）、山場は受ける側の態度9種（hate-sex-r18.js の HK.HateSex.Force.PEAK）＋絶頂の喘ぎ、
       そのあと性別の組の果て（peakEro か Force.FIN）。濃いなら、もう一度（Force.AGAIN）。性器なしの人がいる組は以前の書き方 */
    var HF = HK.HateSex && HK.HateSex.Force, sub = HF ? HF.subOf(top, bot, k) : '';
    if (ero && HF && sub && X.bodyEro[sub]) {
      var pe = HF.pick(ctx, HF.PEAK[per(bot)]) + '{b}「{m2}」', fin = ctx.rng() < 0.5 ? pk(ctx, X.peakEro[k]) : HF.pick(ctx, HF.FIN[sub]);
      var bd = HF.pick(ctx, X.bodyEro[sub]);
      var pe2 = short ? [open, bd + voice, pe + fin] : [open + pk(ctx, X.feel), pk(ctx, X.say), bd, voice, pe, fin].concat(Lw.high(env) ? [HF.pick(ctx, HF.AGAIN)] : [], [pk(ctx, X.after)]);
      return HF.fill(ctx, J(pe2), top, bot, true);
    }
    /* 山場：小説調は受ける側の態度9種、男性向けは性別の組ごとの擬音の段落（態度は直前の抵抗の声で出す。山場を二度重ねない） */
    var peak = ero ? pk(ctx, X.peakEro[k]) : pk(ctx, X.peak[per(bot)]);
    var parts = short ? [open, pk(ctx, X.body[k]) + voice, peak] : [open + pk(ctx, X.feel), pk(ctx, X.say), pk(ctx, X.body[k]), voice, peak, pk(ctx, X.after)];
    var txt = J(parts.map(function (p) { return fl(p, top, bot); }));
    return HF ? HF.fill(ctx, txt, top, bot, ero) : HK.Ero && HK.Ero.fill ? HK.Ero.fill(ctx, txt, bot) : txt;
  };
  function mark() { return HK.Pos && HK.Pos.FORCE_MARK || '〔合意のない展開〕'; }
  /* tie-stage.js の下剋上から（D＝下だった側、U＝上だった側）。条件が合わなければ null。
     同じ組で主従の夜がもう起きていれば起こさない（一回の箱庭で一度まで）。記録は性的な場面の印（HK.EroScene.touch：次の記録＝下剋上の記録に e.lewd） */
  MR.overturn = function (ctx, D, U, t) {
    /* 下剋上で主従が入れ替わった組（このあと tie-stage.js が t.a・t.b を入れ替える）には、主従の夜を起こさない
       （元の主が従者として襲う向きは、内容のスイッチの欄に出した組の向きと逆になるため。凌辱の分岐はこの場の一度だけ） */
    var pf = ctx.pair(D, U), done = MR.done(ctx, D, U);
    if (t && t.type === 'master') pf.mrFlip = true;
    if (done || !MR.ok(ctx, D, U) || ctx.rng() > 0.5) return null;
    pf.mrDone = true;
    var text = '\n\n' + MR.scene(ctx, D, U, 'over');
    if (HK.EroScene && HK.EroScene.touch) HK.EroScene.touch(ctx);
    return { text: text, why: D.name + 'は立場が入れ替わったその場で、' + U.name + 'を無理やり組み敷いた（下剋上）／' + mark() + '内容のスイッチ「合意のない展開」が入' + (HK.Pos && HK.Pos.noneWhy ? HK.Pos.noneWhy(ctx, [D, U], true) : '') };
  };
  /* 主従：従者（{a}）が主人（{b}）を襲う
     起きる見込み（2026-10-28 担当KD。利用者の要望「表示している主従の夜がちゃんと発生するか」）：
     以前は「従者から主への緊張 ten>40・惹かれ att>50・仲：険悪」のどれかが要り、主従の初期値（従→主は信頼55・好意30、緊張・惹かれ 0）では
     ほとんど満たされず、満たしても重み 0.2〜0.5 で、一回の箱庭で 0〜1 割しか起きなかった。
     いまは、組が初めて候補に上がったときに「この回、従者の鬱屈が溢れるか」を決める（展開の重さ ふつう 55%・重い 75%。二人が向き合わないまま終わる・亡くなる回があるので、一回の箱庭で起きるのは 5 割・7 割ほど）。
     溢れる回は、箱庭の前半の区切り（MR.plan の at）から、従者と主が向き合った最初の機会に起きる（従者が動く番でも、主が従者を相手にした番でも）。
     緊張・惹かれ・仲：険悪の強い動機があれば、決めた結果によらず起きうる（以前どおり。仲：険悪は見込みも 2 割上がる）。
     一回の箱庭で同じ組は一度まで（下剋上の凌辱と合わせて）。言い分（恨み／執着）は、強い動機があればそれ、なければ従者の主への好意で決める */
  MR.PROB = { normal: 0.55, dark: 0.75, bad: 0.2 };
  function nSteps(ctx) {
    if (ctx._mrN == null) { var n = 0; try { n = (ctx.scen && ctx.scen.steps ? ctx.scen.steps(ctx.env) : []).length; } catch (e) { n = 0; } ctx._mrN = n || 8; }
    return ctx._mrN;
  }
  /* 従者 S・主 M の組の、この回の見込み（初めて候補に上がったときに一度だけ決める）。
     at：溢れはじめる区切り（箱庭の前半。途中で終わる・亡くなる箱庭でも間に合うように 1〜3 割あたり）。仲：険悪なら見込みを 2 割足す */
  MR.plan = function (ctx, S, M) {
    var pf = ctx.pair(S, M);
    if (pf.mrPlan) return pf.mrPlan;
    var t = HK.Ties && HK.Ties.from(ctx, M, S, 'master');
    var N = nSteps(ctx), p = (HK.Dark && HK.Dark.on(ctx) === 'dark' ? MR.PROB.dark : MR.PROB.normal) + (t && t.cold === 'bad' ? MR.PROB.bad : 0), aff = ctx.R(S, M).aff;
    pf.mrPlan = { on: ctx.rng() < p, at: 1 + Math.floor(ctx.rng() * Math.max(1, N * 0.3)), kind: ctx.rng() < 0.3 + Math.max(0, aff) / 100 ? 'desire' : 'resent' };
    return pf.mrPlan;
  };
  /* 出来事の二人（a が動く人、b が相手）から [従者, 主, 関係] を引く。従者が主に向き合ったときも、主が従者を呼びつけたときも起きうる */
  function roles(ctx, a, b) {
    if (!HK.Ties || !b) return null;
    var t = HK.Ties.from(ctx, b, a, 'master');
    if (t) return [a, b, t];
    t = HK.Ties.from(ctx, a, b, 'master');
    return t ? [b, a, t] : null;
  }
  /* 強い動機（見込みの外でも起きうる）：従者から主への緊張 55 超・惹かれ 65 超・仲：険悪。
     以前の唯一の条件（緊張 40 超・惹かれ 50 超）は、見込みの仕組みができたので、上乗せの分として少し高くした（長い箱庭で上乗せが大きくなりすぎないように） */
  function motive(ctx, S, M, t) { var r = ctx.R(S, M); return r.ten > 55 || r.att > 65 || t.cold === 'bad'; }
  function due(ctx, S, M) { var pl = MR.plan(ctx, S, M); return pl.on && ctx.stepIndex >= pl.at; }
  HK.addTo(HK.COMMON, {
    id: 'tie_master_r18', cat: 'conflict', sex: true, force: true, r18: true, pri: true, noOdd: true, scope: 'pair',
    /* 出来事の一覧の印（夜・合意のない展開。条件は MR.ok の中にあり、when の文字列からは拾えないため。動きには使わない） */
    tags: ['night', 'force'],
    when: function (ctx, a, b) {
      var x = roles(ctx, a, b);
      if (!x || ctx.stepIndex < 1 || MR.done(ctx, x[0], x[1]) || !MR.ok(ctx, x[0], x[1])) return false;
      return due(ctx, x[0], x[1]) || motive(ctx, x[0], x[1], x[2]);
    },
    /* 溢れる回（MR.plan）：二人が向き合った最初の機会にほぼ起きる重み。強い動機だけの回は小さな重み（長い箱庭ほど小さく。どちらも pri の倍率が掛かる） */
    w: function (ctx, a, b) {
      var x = roles(ctx, a, b); if (!x) return 0;
      var S = x[0], M = x[1], r = ctx.R(S, M);
      var k = S.tr.aggr * 0.3 + S.tr.impulse * 0.2 + Math.max(0, r.ten - 40) / 60 + Math.max(0, r.att - 50) / 60 + (x[2].cold === 'bad' ? 0.4 : 0);
      return due(ctx, S, M) ? 60 + k : (0.4 + k) * Math.min(1, 12 / nSteps(ctx));
    },
    run: function (ctx, a, b) {
      var x = roles(ctx, a, b); if (!x) return null;
      var S = x[0], M = x[1], t0 = x[2], r = ctx.R(S, M), pf = ctx.pair(S, M), pl = MR.plan(ctx, S, M);
      var kind = r.att > 50 && r.att > r.ten ? 'desire' : r.ten > 40 || t0.cold === 'bad' ? 'resent' : pl.kind;
      pf.mrAt = ctx.stepIndex; pf.mrDone = true; pf.forced = (pf.forced || 0) + 1;
      var text = MR.scene(ctx, S, M, kind);
      ctx.mod2(S, M, { att: 4, ten: 6 }, { trust: -30, aff: -25, ten: 30 }); ctx.stress(M, 35); ctx.stress(S, 8);
      t0.cold = 'bad';
      return { text: text, mag: 40, lewd: true, sex: true, force: true,
        why: S.name + '（従）が' + M.name + '（主）を無理やり襲った（主従・' + (kind === 'desire' ? '抑えきれない執着' : '積もった恨み') + '）／' + mark() + '内容のスイッチ「合意のない展開」が入' + (HK.Pos && HK.Pos.noneWhy ? HK.Pos.noneWhy(ctx, [S, M], true) : '') };
    }
  });
})();
