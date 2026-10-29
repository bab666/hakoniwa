/* @event-ok 男性向けの夜の性格の一文を各1本足した（2026-10-29 担当MR） */
/* 箱庭シミュレーター: 住人の属性（attr.js）の R18 の部分（R18版のみ。r18-thick.js より後に読む）
   ■ 夜の性格（HK.Attr.nightOf）を、山場の組み立てに効かせる
     ・型（style）に優先：thick-sex.js の T.scene・thick-sex-ero.js の X.scene（opt.style）、r18-thick.js の R18M.sex（HK.FF.styleOf）
       sadist → rough、mean → tease、sweet → gentle、shy → clumsy（HK.Attr.STYLE）。オメガの山場（omega-thick.js の HK.TKC.body）は sadist で乱暴な抱き方に
     ・始まりの段落のすぐあとに、夜の性格の一文を差し込む（攻め＝{a} の sadist・mean・sweet・shy／受け＝{b} の maso・shy・sweet）。
       男×女（mf：{a} が男性。受けの性別は問わない書き方）・女×女（ff）・女攻め×男（fm：{a} が跨る）で書き分ける。小説調は3文以上、男性向けは2文以上
     ・maso は受け攻めを変えない：受けに回ったときの崩れ方だけ（攻めを選んだ人はそもそも受けにならない。受けが攻め指定の組には何も足さない）。
       R18M.sex では、maso の受けを「気が強い」扱いにしない（すぐに崩れる書き方）
   ■ 心の強さ（strong）の「体は堕ちても心は折れない」文：常識改変・感覚遮断穴・エロトラップダンジョン
   ■ 胸（bust）の差し替え語の一文（HK.Attr.bustLine。体の感触の段に、体格・種族の一文と並べて候補にする）
   ■ 夜の性格を喘ぎの呼び出しに渡す（2026-10-27 担当HM）：HK.Moan.say・HK.Moan.pick（moan-engine.js）・HK.Ero.moan（ero-kit.js）を呼ぶとき、
     話し手の夜の性格（A.nightOf(話し手, 相手)）を o.night／ctx.night に入れる。相手は o.top／ctx.top か、いま組み立てている山場の二人
     （thick-sex.js・thick-sex-ero.js の scene、r18-thick.js の R18M.sex、omega-thick.js の TKC.body の包みで覚える）。
     夜の性格を決めていない人には何も足さない（乱数も使わない）。喘ぎの選び方に夜の性格を効かせる受け口は moan-engine.js 側（night を見て鍵を選ぶ）
   ■ 物語型・一人用の箱庭（HK.Story.say を通る記録）で、住人二人の性的な場面に夜の性格の文が入っていなければ、一文を足す（PAIR_NET。2026-10-27 担当HM）。
     催眠・常識改変・サキュバスなど、山場を自前で組む箱庭では、体格・身長の差・胸・体の特徴の一文（A.pairLine）も足す（FEAT_NET）。
     感覚遮断穴（本人は壁の向こうで相手を知らない）・媚薬ロッカー（solo-locker-bed.js が自分で入れる）には足さない
   ■ 点検用：HK.Attr.log に配列を入れると、差し込んだ夜の性格を { who, role: 'a'|'b', night, a, b } で記録する（pos-audit の V5）。
     HK.Attr.moanLog に配列を入れると、喘ぎの呼び出しごとに { who, night } を記録する（setting-audit.js の night.moan）
   登場人物はすべて成人として扱う */
(function () {
  'use strict';
  var HK = window.HK, A = HK && HK.Attr;
  if (!A) return;
  function L(s) { return s.split('|'); }
  A.log = null;

  /* ---------- 心は折れない（strong） ---------- */
  A.HOLD.kaihen = L('{c}の体は、改変された世界の熱にすっかり馴染んでいた。それでも{c}は、自分が何者なのかを一度も手放さなかった。|改変度がどれほど上がっても、{c}の目だけは醒めていた。体は流されても、心までは書き換えさせなかった。|{c}は震える息を整え、心の中で自分の名前を繰り返した。この世界が何を当たり前と言おうと、自分の心だけは自分のものだった。|{c}の体は、もう周りと同じように応えてしまう。けれど{c}は、それをおかしいと思う心を、最後まで握りしめていた。');
  A.HOLD.hole = L('{c}の体は、壁の向こうから押し寄せた感覚にすっかり崩されていた。それでも{c}は、震える指を握りしめて、心だけは明け渡さなかった。|腰はまだ熱に震えていた。それでも{c}の目は、最後まで自分のものだった。体が何を覚えてしまっても、折れたのは体だけだった。|{c}はへたり込んだまま、深く息を吸った。何度達しても、壁の穴に戻りたいとは、一度も思わなかった。|体は正直に崩れ落ちた。けれど{c}は、乱れた息の合間に小さく笑った。「……心までは、あげない」');
  A.HOLD.dungeon = L('{c}の体は快楽に堕ちきっていた。それでも、その奥の小さな火だけは、最後まで消えなかった。|{c}の体は、もう迷宮の熱に逆らえなかった。けれど{c}の心は、体とは別の場所で、静かに出口を探し続けていた。|堕ちたのは体だけだった。{c}は熱に霞む目の奥で、仲間の名前と、地上の空の色を覚えていた。|{c}はとろけきった体を持て余しながらも、心の中でだけは膝をつかなかった。いつか必ず、ここを出る――その誓いだけが残っていた。');

  /* ---------- 胸の一文（{bw} は HK.Attr.bustWord） ---------- */
  var BUST_B = L('{a}の掌が、{b}の{bw}をそっと包み込んだ。|{b}の{bw}が、乱れた息に合わせて上下した。|{a}は{b}の{bw}に顔をうずめ、そこで深く息をついた。');
  var BUST_A = L('{a}の{bw}が、{b}の肌の上でやわらかく形を変えた。|{a}が身をかがめると、{bw}が{b}の胸元をかすめた。|{a}の{bw}に、{b}の視線が吸い寄せられた。');
  A.bustLine = function (a, b, pick) {
    var wb = A.bustWord(b, pick), wa = !wb && A.bustWord(a, pick);
    if (!wb && !wa) return '';
    return pick(wb ? BUST_B : BUST_A).replace(/\{a\}/g, a.name).replace(/\{b\}/g, b.name).replace(/\{bw\}/g, wb || wa);
  };

  /* ---------- 夜の性格の一文（{a}＝攻め・{b}＝受け） ---------- */
  var TOP = {
    sadist: {
      mf: L('{a}は{b}の髪を掴んで顔を上げさせ、逃げ道をふさぐように覆いかぶさった。{a}「目、逸らすな。どんな顔になるか、全部見ててやる」見下ろす目は、楽しげに細められていた。|{a}は{b}の両手首をまとめて掴み、頭の上で敷布に押さえつけた。振りほどこうとする力を、{a}はわざと少しだけ待ってから封じた。{a}「抵抗してるつもりか。……かわいいな」|{a}は{b}の腰を指が食い込むほど強く引き寄せ、首筋に歯を立てた。赤い跡がひとつ残るたびに、{a}の口元に満足げな笑みが浮かんだ。{a}「痛いか？　でも、離してほしいとは言わないんだな」|{a}は{b}を乱暴に敷布へ転がし、起き上がろうとする肩を片手で押し戻した。{a}「誰が起きていいって言った？　今夜は、こっちが決める」'),
      fm: L('{a}は{b}の胸を片手で押さえつけ、上から見下ろして唇の端を吊り上げた。{a}「動かないで。動いたら、最初からやり直しにするから」{b}の喉が、ごくりと鳴った。|{a}は{b}の髪を掴んで顔を仰向かせ、噛みつくように口づけた。息継ぎを許したのは、{b}の目が潤み始めてからだった。|{a}は{b}の両手首を敷布に縫いとめ、その上から体重をかけて見下ろした。{a}「ほら、全然逃げられない。……どうしてほしいか、言ってごらん」'),
      ff: L('{a}は{b}の髪を指に絡めて引き、白い喉をあらわにさせた。そこへゆっくりと歯を立てると、{b}の肩がびくりと跳ねた。{a}「いい声。もっと聞かせて」|{a}は{b}の手首を頭の上でまとめて押さえ、もう片方の手の指先で、鎖骨から下へ意地悪くなぞっていった。{a}「隠さないで。全部、見せて」|{a}は{b}を敷布に押し倒し、膝で脚を割って逃げられないようにした。見下ろす{a}の目は、獲物を前にしたように光っていた。')
    },
    mean: {
      mf: L('{a}はわざと触れてほしいところを避けて、内腿や脇腹ばかりを指先でなぞった。{b}が焦れて身をよじるたびに、{a}は喉の奥で笑った。{a}「どうした？　言ってくれなきゃ、分からないな」|{a}は{b}の耳元で、これから何をするかを一つずつ囁いた。言葉にされるたびに{b}の顔は赤くなり、{a}はそれを眺めて楽しんでいた。|{a}は{b}が気持ちよさそうに目を閉じかけるたびに、手を止めた。{a}「まだだよ。ちゃんとお願いできたら、続けてあげる」{b}は唇を噛んで、{a}を睨んだ。'),
      fm: L('{a}は{b}の上に跨ったまま、わざと腰を浮かせて焦らした。{b}が手を伸ばすと、その手をぴしゃりと払いのける。{a}「だめ。今夜は、こっちの番」|{a}は{b}の胸元に指を這わせながら、耳元で甘く意地悪な言葉を囁き続けた。{b}が何か言い返そうとするたびに、唇を指でふさいだ。|{a}は{b}の目をまっすぐ覗き込んだまま、触れるか触れないかの距離で動きを止めた。{a}「我慢できなくなったら、ちゃんと言うのよ」'),
      ff: L('{a}は{b}の肌を指先でなぞり、いちばん触れてほしいところの手前で、わざと引き返した。{a}「ここ？　……ううん、まだ教えてあげない」|{a}は{b}の耳たぶを甘噛みしながら、さっきの声を真似してみせた。{b}が真っ赤になって顔を背けると、{a}は楽しそうに笑った。|{a}は{b}が焦れて腰を浮かせるのを待ってから、指をそっと離した。{a}「欲しがってる顔、かわいい。もう少しだけ見せて」')
    },
    sweet: {
      mf: L('{a}は{b}の頬を両手で包み、何度も何度も口づけた。{a}「大丈夫。ゆっくりするから、つらかったら言って」{b}の強張っていた肩から、少しずつ力が抜けていった。|{a}は{b}を胸に抱き寄せ、髪を撫でながら名前を呼び続けた。触れる手つきのひとつひとつが、宝物を扱うようにやさしかった。|{a}は{b}の指に自分の指を絡め、手の甲に唇を落とした。{a}「好きだよ。……何回でも言う」{b}は照れくさそうに目を伏せた。'),
      fm: L('{a}は{b}の上で身をかがめ、額に、まぶたに、唇にと、順番にやさしい口づけを落とした。{a}「あなたの顔、ずっと見てたい」|{a}は{b}の手を取って自分の頬に当てさせ、くすぐったそうに笑った。{a}「あったかい。……ねえ、もっと触って」|{a}は{b}の胸に耳を当てて、早くなった鼓動をしばらく聞いていた。それから顔を上げて、とろけるように笑った。'),
      ff: L('{a}は{b}の髪を耳にかけ、こめかみにそっと唇を寄せた。{a}「かわいい。……ほんとに、かわいい」囁くたびに、{b}の頬が熱を帯びていった。|{a}は{b}を抱きしめたまま、背中をゆっくりと撫で下ろした。急ぐことなんて何もないと、手のひらが言っていた。|{a}は{b}と額を合わせ、指を絡めた。{a}「怖くない？」{b}が小さく首を振ると、{a}は安心したように目を細めた。')
    },
    shy: {
      mf: L('{a}は自分から誘ったくせに、{b}と目が合うたびに顔を真っ赤にした。{a}「……あんまり、見ないで。照れるから」それでも手だけは、{b}を離さなかった。|{a}はおずおずと{b}の服に手をかけ、ボタンをひとつ外すたびに息を詰めた。耳まで赤くなった顔を、{b}の肩口に隠すようにして。|{a}は{b}の肌に触れながら、「ここ、いい？」と消え入りそうな声で何度も確かめた。{b}が頷くたびに、{a}は恥ずかしそうに、それでも嬉しそうに笑った。'),
      fm: L('{a}は{b}の上に跨ったものの、見上げてくる視線に耐えきれず、両手で{b}の目を覆った。{a}「……見ちゃだめ。いまの顔、見られたくない」|{a}は消え入りそうな声で「わたしが、するから」と言い、震える指で{b}の頬に触れた。耳の先まで真っ赤だった。|{a}は{b}の胸に手をついて体を起こすたびに、恥ずかしさで唇を噛んだ。それでも、やめようとはしなかった。'),
      ff: L('{a}は{b}の肌に指を伸ばしかけては引っ込め、三度目でようやく触れた。{a}「……ごめん、慣れてなくて」赤くなった頬を、{b}がそっと撫でた。|{a}は{b}の首筋に顔をうずめたまま、なかなか顔を上げられなかった。{a}「恥ずかしい……けど、やめたくない」|{a}は{b}の手を取って、自分の胸元へ導いた。そうしておきながら、自分のほうが恥ずかしそうに目をぎゅっと閉じていた。')
    }
  };
  var BOT = {
    maso: {
      mf: L('{a}の手つきが荒くなるほど、{b}の体はかえって熱を帯びていった。腰を掴む指の強さに、{b}は息を震わせて、自分からもっと身を差し出した。|{b}は首筋に歯を立てられた瞬間、甘く息を詰めた。痛いはずなのに、もっと強くてもいいと、潤んだ目が訴えていた。|{b}は手首を押さえつけられて、ようやく安心したように力を抜いた。{b}「……もっと、ちゃんと捕まえてて」{a}は小さく笑って、その手首を握り直した。'),
      fm: L('{b}は胸を押さえつけられ、動けないまま喉を鳴らした。見下ろされるほどに、{b}の目はとろりと潤んでいった。|{a}が爪を立てると、{b}の背中がびくりと跳ねた。{b}は痛みに顔をしかめるどころか、もっと、とねだるように{a}を見上げた。|{b}は意地悪く焦らされるほど嬉しそうに息を乱し、次の命令を一つずつ待った。言うことを聞くたびに、{b}の息は甘くなっていった。'),
      ff: L('{b}は髪を引かれて喉をそらし、ぞくりと背中を震わせた。乱暴にされるほど、{b}の吐息は甘く濡れていった。|{b}は手首を押さえられたまま、{a}を見上げて唇を舐めた。{b}「……やめないで。もっと、強く」|{a}の指が肌に爪の跡を残すたびに、{b}は小さく震えて、自分から体を差し出した。痛みと熱の区別が、もうついていないようだった。')
    },
    shy: {
      mf: L('{b}は服をはだけられるたびに腕で体を隠そうとして、そのたびに{a}にやさしく手をほどかれた。{b}「……あんまり、見ないで」耳まで真っ赤だった。|{b}は声が漏れるたびに手の甲で口を押さえ、恥ずかしさに目をぎゅっと閉じた。それでも、{a}の腕からは逃げなかった。|{b}は灯りを消してほしいと小さな声で頼んだ。{a}が少しだけ灯りを落とすと、{b}はほっとしたように、{a}の胸に顔をうずめた。'),
      fm: L('{b}は見下ろしてくる{a}の視線に耐えきれず、腕で顔を覆った。{a}がその腕をそっとどけると、真っ赤な顔があらわになった。|{b}は自分の声に驚いて口元を押さえ、恥ずかしそうに目を逸らした。{a}は面白がって、その指を一本ずつ外していった。|{b}は{a}の素肌が触れるたびに肩を跳ねさせ、どこを見ればいいのか分からないように視線をさまよわせた。'),
      ff: L('{b}は胸元を両腕で隠したまま、消え入りそうな声で「……恥ずかしい」と呟いた。{a}はその腕に、ひとつずつ口づけを落とした。|{b}はシーツを引き寄せて顔まで隠そうとした。{a}がその端をそっとめくると、{b}は真っ赤な顔で{a}を睨んだ。|{b}は甘い声がこぼれるたびに唇を噛んで、恥ずかしさに首を振った。それでも、絡めた指をほどこうとはしなかった。')
    },
    sweet: {
      mf: L('{b}は{a}の首に腕を回して、甘えるように頬をすり寄せた。{b}「もっと、ぎゅってして」{a}は言われたとおりに、腕に力をこめた。|{b}は{a}の名前を何度も呼んで、そのたびに嬉しそうに笑った。触れられるところすべてで、好きだと伝えようとしているようだった。|{b}は{a}の手を取って自分の頬に当て、目を細めた。{b}「この手、好き」――それだけで、{a}の手つきはいっそうやさしくなった。'),
      fm: L('{b}は{a}の腰に手を添えて、見上げながら何度も「かわいい」と囁いた。{a}が照れて睨むと、{b}は嬉しそうに笑った。|{b}は{a}の髪を撫で、汗ばんだ額にそっと口づけた。{b}「無理しないで。……ずっと、こうしてたい」|{b}は{a}の手のひらに唇を押し当て、指の一本一本に口づけていった。甘やかすような仕草に、{a}の頬がゆるんだ。'),
      ff: L('{b}は{a}の背中に腕を回し、子猫のように胸元へ頬をすり寄せた。{b}「すき。……すき」何度も繰り返す声が、とろけていた。|{b}は{a}の指を自分の指でつかまえて、離さなかった。{b}「手、つないでて。そのほうが、安心する」|{b}は{a}の頬にちゅっと口づけて、照れたように笑った。それから、もう一度、今度は唇に。')
    }
  };
  /* 男性向けの作風（HK.Ero.on）のとき */
  var TOP_E = {
    sadist: {
      mf: L('{a}は{b}の髪をわし掴みにして顔を上げさせ、とろけかけた顔をじっくり眺めた。{a}「ほら、もうこんな顔になってる。……どこまで崩れるか、試してやるよ｜ほら、もうこんな顔だ。……どこまで崩れるか、試してやる｜ほら、もうこんなお顔ですね。……どこまで崩れるか、試してさしあげます」|{a}は{b}の両手首を片手でまとめて押さえつけ、空いた手で尻をぱしんと叩いた。跳ねた腰を、{a}は逃がさず引き戻した。{a}「いい音。もう一回、鳴らしてやろうか」|{a}は{b}の両手首を片手でまとめて頭の上に押さえつけ、空いた手で顎を掴んだ。逸らそうとする視線を、{a}は無理やり自分のほうへ向けさせた。'),
      fm: L('{a}は{b}の胸板に爪を立て、赤い線を引きながら見下ろした。{a}「ねえ、もう我慢できないって顔。……許すまで、絶対にイっちゃだめよ」|{a}は{b}の顎を掴んで上を向かせ、唾液の糸を引くほど深く口づけた。{a}「情けない顔。もっと見せて、ほら♡」|{a}は{b}の喉元に手のひらを置き、軽く体重をかけて見下ろした。逃げられないと分かった{b}の目が、とろりと揺れるのを、{a}は楽しげに眺めた。'),
      ff: L('{a}は{b}の髪を引いて喉をそらさせ、首筋にちゅうっと吸いついて赤い痕を刻んだ。{a}「ほら、印。これでもう、私のもの♡」|{a}は{b}の両手首をまとめて押さえ、濡れた指先で胸の先をきゅっとつまみ上げた。{a}「声、我慢しなくていいよ。……我慢できないんでしょ？」|{a}は{b}の顎をくいっと持ち上げ、目を逸らすことを許さなかった。{b}の頬が赤く染まっていくのを、{a}は唇の端を吊り上げて見つめた。')
    },
    mean: {
      mf: L('{a}は{b}の一番弱いところの手前で指を止め、にやにやと笑った。{a}「欲しいなら、ちゃんとおねだりしろよ。……ほら、言えるだろ？」|{a}は{b}の耳に唇を寄せ、いやらしい言葉をわざとゆっくり囁いた。{b}の体がびくびく跳ねるのを、{a}は楽しそうに眺めていた。|{a}は{b}の耳元に唇を寄せ、触れるか触れないかの距離で息だけを吹きかけた。{b}がたまらず身をよじると、{a}は満足そうに喉で笑った。'),
      fm: L('{a}は{b}の上に跨ったまま、腰をくねらせて焦らし続けた。{a}「まだだめ。ちゃんと『お願いします』って言えたら、ね♡」|{a}は{b}の胸を指先でくすぐるように撫で、反応するたびにくすくす笑った。{a}「すぐ顔に出るの、ほんとに分かりやすい」|{a}は{b}の{乳首}を指先でかすめては離れ、かすめては離れを繰り返した。{b}の腰が浮くたびに、{a}はわざと動きを止めてみせた。'),
      ff: L('{a}は{b}の内腿を指でなぞり、あとちょっとのところでわざと引き返した。{a}「ここ、触ってほしい？　……だーめ♡」|{a}は{b}の耳たぶを甘噛みしながら、さっきの声を真似して囁いた。{a}「『もっと』って言ってたよね？　もう一回、聞かせて」|{a}は{b}の脚のあいだに指を這わせ、濡れているのを確かめてから、わざとその手を引っ込めた。{b}の恨めしげな目に、{a}はくすくすと笑った。')
    },
    sweet: {
      mf: L('{a}は{b}をぎゅうっと抱きしめ、顔じゅうにちゅっ、ちゅっと口づけの雨を降らせた。{a}「かわいい、ほんとかわいい。……全部、大事にするから」|{a}は{b}の髪を撫でながら、「好き」「かわいい」と何度も囁いた。囁かれるたびに、{b}の体はとろとろにほどけていった。|{a}は{b}の指に自分の指を一本ずつ絡め、手の甲に何度も口づけた。とろけた目で見つめられて、{b}の胸の奥がきゅうっと締めつけられた。'),
      fm: L('{a}は{b}の胸にぴったり体を重ね、甘えるように頬をすり寄せた。{a}「好き。だいすき♡　……今日は、いっぱい気持ちよくしてあげる」|{a}は{b}の手を取り、指を一本ずつ絡めて恋人つなぎにした。{a}「離さないでね。最後まで、ずっと」|{a}は{b}の首に腕を回し、鼻先を擦り合わせて甘えた。とろんとした目で見つめられて、{b}の体からすっかり力が抜けていった。'),
      ff: L('{a}は{b}をぎゅっと抱きしめて、おでこに、ほっぺに、唇にと、ちゅっちゅと口づけを落とした。{a}「かわいい♡　世界でいちばん、かわいい」|{a}は{b}の指に自分の指を絡めて、甘い声で名前を呼んだ。{a}「大好きだよ。……とろとろになるまで、可愛がってあげる」|{a}は{b}の頬を両手で包んで、とろけるような目で見つめた。何度も名前を呼びながら唇を重ねるたびに、{b}の体から力が抜けていった。')
    },
    shy: {
      mf: L('{a}は真っ赤な顔で{b}の服に手をかけ、ボタンを外すたびに「ご、ごめん」と謝った。それでも手は止まらず、熱だけがどんどん上がっていった。|{a}は{b}と目が合うたびに顔を逸らしながら、それでも触れる指先には夢中だった。{a}「み、見ないで……恥ずかしくて、死にそう」|{a}は{b}に触れた手が震えているのに気づいて、ますます赤くなった。それでも指は離れず、ぎこちなく{b}の肌をなぞり続けた。'),
      fm: L('{a}は{b}の上に跨ったまま、両手で顔を覆ってぷるぷる震えた。{a}「こ、こんな格好、恥ずかしすぎる……っ♡」それでも腰は、{b}から離れようとしなかった。|{a}は耳まで真っ赤にしながら、震える指で{b}の胸をなぞった。{a}「わ、わたしが……するから。見てるだけでいいから……っ」|{a}は{b}の胸に手をついて腰を落としかけ、恥ずかしさに途中で固まった。真っ赤な顔のまま、{a}はそれでもゆっくりと腰を沈めていった。'),
      ff: L('{a}は{b}の胸に触れた自分の指を見て、ぼっと顔を赤くした。{a}「さ、触っちゃった……♡」それなのに、指は勝手に動き続けていた。|{a}は{b}の首筋に顔をうずめたまま、恥ずかしさに小さく唸った。{a}「顔、見せられない……でも、やめたくないよぉ」|{a}は{b}の唇に触れた瞬間、ぱっと顔を離して両手で頬を押さえた。それなのに、すぐにまた吸い寄せられるように口づけていた。')
    }
  };
  var BOT_E = {
    maso: {
      mf: L('{b}は髪を乱暴に掴まれた瞬間、ぞくぞくっと背中を震わせた。痛いくらいの力に、潤んだ目がもっと、もっととねだっていた。|{b}は尻をぱしんと叩かれるたびに腰を跳ねさせ、そのたびに体の奥をきゅんと疼かせた。叩かれた跡が赤くなるほど、{b}の顔はとろけていった。|{b}は押さえつけられた手首に力を込められるたび、甘く喉を鳴らした。強くされるほど、{b}の体は素直にとろけていった。'),
      fm: L('{b}は胸を爪でなぞられるたびにびくびく震え、情けない声を漏らした。罵られるほど、{b}の体は正直に熱くなっていった。|{b}は首筋に歯を立てられて、甘い声を上げた。自分から首を差し出すように、もっと強くとねだっていた。|{b}は爪の痕をなぞられるたびに体を跳ねさせ、もっと、と言うように胸を差し出した。痛みと熱の境目が、もう分からなくなっていた。'),
      ff: L('{b}は髪をくいっと引かれて喉をそらし、ぞくぞくと震えた。乱暴にされるほど、脚のあいだはどんどん濡れていった。|{b}は手首を押さえつけられたまま、とろけた目で{a}を見上げた。いじめられるほど嬉しそうな顔に、{a}の口元がつり上がった。|{b}は首筋に歯を立てられた瞬間、甘い悲鳴を上げて{a}にしがみついた。痕が残るほど強く吸われるたびに、{b}の膝ががくがくと震えた。')
    },
    shy: {
      mf: L('{b}は服をはだけられるたびに真っ赤になって腕で体を隠し、そのたびに{a}にやさしく腕をどかされた。恥ずかしがるほど、肌はどんどん敏感になっていった。|{b}は声が漏れるたびに両手で口をふさぎ、涙目でふるふると首を振った。それでも体だけは、正直にびくびく跳ねていた。|{b}は声が漏れそうになるたびに手の甲で口を押さえ、そのたびに{a}にその手をどかされた。真っ赤な顔のまま、{b}はとうとう声を隠せなくなった。'),
      fm: L('{b}は{a}に見下ろされて、どこを見ればいいのか分からずに目をぎゅっと閉じた。真っ赤な顔が、かえって{a}を煽った。|{b}は自分の情けない声に驚いて口を押さえ、耳まで赤くなった。{a}がその手をどけると、{b}は顔を背けて震えた。|{b}は跨られた重みに息を詰め、どこに手を置けばいいのか分からずにシーツを握りしめた。{a}がその手を取って自分の腰に導くと、{b}の耳まで真っ赤になった。'),
      ff: L('{b}は胸を隠した腕をそっとほどかれ、ぼっと顔を赤くした。恥ずかしさで潤んだ目が、かえって{a}をそそった。|{b}は甘い声がこぼれるたびに枕に顔を押しつけて、ふるふると震えた。耳の先まで、真っ赤だった。|{b}は{a}の視線から逃げるように枕に顔を埋めた。けれど背中を撫でられるたびに、小さな声が枕の隙間からこぼれていった。')
    },
    sweet: {
      mf: L('{b}は{a}の首にぎゅっと腕を回して、甘えるように何度もキスをせがんだ。とろけた顔で名前を呼ぶたびに、{a}の腕にも力がこもった。|{b}は{a}の胸に頬をすり寄せて、「すき」「すき」と繰り返した。蕩けきった声が、甘く部屋に溶けていった。|{b}は{a}の胸に頬をくっつけて、鼓動を聞くように目を閉じた。とろけた声で名前を呼ばれるたびに、{a}は何度でも口づけを返した。'),
      fm: L('{b}は{a}の腰に腕を回して引き寄せ、汗ばんだ額に何度も口づけた。甘やかすように撫でられて、{a}の体からとろりと力が抜けた。|{b}は{a}の手を取って指を絡め、見上げながらとろけるように笑った。その顔を見ただけで、{a}の胸がきゅんと疼いた。|{b}は{a}の背中をゆっくりと撫で下ろし、甘やかすように抱きしめた。{a}がとろりと身を預けると、{b}はうれしそうに微笑んだ。'),
      ff: L('{b}は{a}の背中にぎゅっと抱きついて、子猫みたいに胸元へ頬をすり寄せた。「すき」と囁く声が、とろとろに甘かった。|{b}は{a}の指を自分の指でつかまえて、ちゅっと口づけた。甘えきった瞳に見上げられて、{a}は思わず息を呑んだ。|{b}は{a}の手を取って自分の頬に当て、うっとりと目を細めた。触れられるたびに、甘い吐息が{a}の指先をくすぐった。')
    }
  };
  A.NIGHT_POOLS = { TOP: TOP, BOT: BOT, TOP_E: TOP_E, BOT_E: BOT_E };

  /* 夜の性格の一文（{a}{b} のまま）。T＝攻め・U＝受け、mode：mf／fm／ff。どちらにも夜の性格がなければ、乱数を使わずに '' */
  /* only：'top'＝攻めの文だけ／'bot'＝受けの文だけ（三人の場面で、受けの崩れ方を攻めごとに繰り返さないために） */
  A.nightText = function (T, U, mode, pick, ero, only) {
    if (!T || !U || HK.SAFE_ON) return '';
    var nt = only === 'bot' ? '' : A.nightOf(T, U), nb = only === 'top' ? '' : A.nightOf(U, T);
    if (!TOP[nt] && !BOT[nb]) return '';
    /* 受けが攻め指定の組（向きの決まらない組）には足さない（自分で攻めを選んだ人を受けにしない） */
    if (HK.Pos && HK.Pos.hardTop && HK.Pos.hardTop(U, T)) return '';
    var m = mode === 'ff' || mode === 'fm' ? mode : 'mf', out = '', labels = [];
    if (TOP[nt]) { out += pick(((ero ? TOP_E : TOP)[nt] || TOP[nt])[m]); labels.push(T.name + '＝' + NAME[nt] + (A.STYLE[nt] ? '（抱き方：' + (STYLE_JP[A.STYLE[nt]] || A.STYLE[nt]) + '）' : '')); if (A.log) A.log.push({ who: T.name, role: 'a', night: nt, a: T.name, b: U.name }); }
    if (BOT[nb]) { out += pick(((ero ? BOT_E : BOT)[nb] || BOT[nb])[m]); labels.push(U.name + '＝' + NAME[nb]); if (A.log) A.log.push({ who: U.name, role: 'b', night: nb, a: T.name, b: U.name }); }
    if (out) mark(out, labels);
    return out;
  };
  /* 記録の理由書きに「夜の性格：〇〇＝サド（抱き方：荒い）」を足す（利用者が、夜の性格が効いたことを確かめられるように）。
     差し込んだ文の、名前の印を含まない一片で記録を見つける */
  var NAME = {}; A.NIGHT.forEach(function (x) { NAME[x[0]] = x[1]; });
  var STYLE_JP = { rough: '荒い', tease: '焦らす', gentle: '優しい', clumsy: '不慣れ' };
  var marks = [];
  /* いま組み立てている山場の二人（喘ぎの呼び出しに渡す夜の性格の相手を引くため） */
  var pairNow = null;
  function mark(text, labels) {
    var frag = text.split(/\{[a-zA-Z]+\}|\n/).filter(function (x) { return x.length >= 8; }).sort(function (x, y) { return y.length - x.length; })[0];
    if (!frag) return;
    marks.push({ frag: frag.slice(0, 24), label: labels.join('・'), n: 0 });
    if (marks.length > 12) marks.shift();
  }
  function tag(o) {
    if (!marks.length || !o || typeof o.text !== 'string') return;
    for (var i = 0; i < marks.length; i++) {
      if (o.text.indexOf(marks[i].frag) >= 0) { o.why = (o.why ? o.why + '／' : '') + '夜の性格：' + marks[i].label; marks.splice(i, 1); return; }
    }
    marks.forEach(function (x) { x.n++; });
    marks = marks.filter(function (x) { return x.n < 6; });
  }
  if (HK.Ctx && HK.Ctx.prototype.say && !HK.Ctx.prototype.say._attrNight) {
    var cs0 = HK.Ctx.prototype.say;
    HK.Ctx.prototype.say = function (o) { tag(o); return cs0.apply(this, arguments); };
    HK.Ctx.prototype.say._attrNight = true;
  }
  /* HK.Story.say・R18M.sex・TKC.body の包み直しは HK.wrap（物語型の箱庭のかたまりが後から届いても、包む順は元のファイルの順） */
  if (HK.Story && HK.Story.say && !HK.Story.say._attrNight) HK.wrap(HK.Story, 'say', function (ss0) {
    var f = function (S, o) { netFill(S, o); tag(o); return ss0.apply(this, arguments); };
    f._attrNight = true;
    return f;
  });
  /* 一人用の箱庭の記録（solo-kit.js の HK.SoloKit.say：マッサージ・感覚遮断穴）にも、夜の性格の印を理由書きに足す（2026-10-27 担当HM） */
  if (HK.SoloKit && HK.SoloKit.say && !HK.SoloKit.say._attrNight) HK.wrap(HK.SoloKit, 'say', function (ks0) {
    var f = function (S, o) { tag(o); return ks0.apply(this, arguments); };
    f._attrNight = true;
    return f;
  });
  /* 段落の最初（始まり）のすぐあとに差し込む */
  function after1(text, ins) {
    if (!ins) return text;
    var i = text.indexOf('\n\n');
    return i < 0 ? text + '\n\n' + ins : text.slice(0, i) + '\n\n' + ins + text.slice(i);
  }
  function fresh(S, base) { return HK.Ero && HK.Ero.freshPick ? HK.Ero.freshPick(S, base) : base; }
  function names(t, T, U) { return t.replace(/\{a\}/g, T.name).replace(/\{b\}/g, U.name); }

  /* ---------- 組み立ての包み ---------- */
  /* thick-sex.js（小説調の厚い山場）と thick-sex-ero.js（男性向けの厚い山場）：型を夜の性格で上書きし、始まりのあとに一文 */
  function wrapScene(obj, ero) {
    if (!obj || !obj.scene || obj.scene._attr) return;
    var sc0 = obj.scene;
    obj.scene = function (opt) {
      if (!opt || !opt.a || !opt.b) return sc0.apply(this, arguments);
      var nt = A.nightOf(opt.a, opt.b), nb = A.nightOf(opt.b, opt.a);
      if (!nt && !nb) return sc0.apply(this, arguments);
      var o = {}; Object.keys(opt).forEach(function (k) { o[k] = opt[k]; });
      o.style = A.styleFor(nt, opt.style);
      var pn0 = pairNow, r;
      pairNow = [opt.a, opt.b];
      try { r = sc0.call(this, o); } finally { pairNow = pn0; }
      if (!r || typeof r.text !== 'string') return r;
      var pk = ero ? fresh(o.S, o.pick) : fresh(o.rng, o.pick);
      r.text = after1(r.text, A.nightText(o.a, o.b, r.mode, pk, ero));
      return r;
    };
    obj.scene._attr = true;
  }
  wrapScene(HK.ThickSex, false);
  wrapScene(HK.ThickEro, true);

  /* r18-thick.js の R18M.sex：型（HK.FF.styleOf）と崩れ方（isStrong）を、いま組み立てている二人で見る */
  var R = HK.R18M, cur = null;
  if (HK.FF && HK.FF.styleOf && !HK.FF.styleOf._attr) {
    var so0 = HK.FF.styleOf;
    HK.FF.styleOf = function (a) { var b = so0.apply(this, arguments); return cur && a === cur[0] ? A.styleFor(A.nightOf(cur[0], cur[1]), b) : b; };
    HK.FF.styleOf._attr = true;
  }
  if (R && R.isStrong && !R.isStrong._attr) {
    var is0 = R.isStrong;
    R.isStrong = function (y) { if (cur && y === cur[1] && A.nightOf(cur[1], cur[0]) === 'maso') return false; return is0.apply(this, arguments); };
    R.isStrong._attr = true;
  }
  if (R && R.sex && !R.sex._attr) HK.wrap(R, 'sex', function (sx0) {
    var f = function (S, x, y, opt) {
      if (!x || !y || HK.SAFE_ON) return sx0.apply(this, arguments);
      var od = HK.Pos ? HK.Pos.order(x, y, [x, y]) : [x, y], T = od[0], U = od[1];
      var nt = A.nightOf(T, U), nb = A.nightOf(U, T);
      if (!nt && !nb) return sx0.apply(this, arguments);
      var o = {}; Object.keys(opt || {}).forEach(function (k) { o[k] = opt[k]; });
      /* 甘々の攻め：その場の勢いの夜は、恋人の夜の書き方に */
      if (nt === 'sweet' && (!o.mood || o.mood === 'plain')) o.mood = 'love';
      var prev = cur, pn0 = pairNow, r;
      cur = [T, U]; pairNow = [T, U];
      try { r = sx0.call(this, S, x, y, o); } finally { cur = prev; pairNow = pn0; }
      if (typeof r !== 'string' || o.short) return r;
      var P0 = HK.Pos, mode = P0 && P0.isF(T) && P0.isF(U) ? 'ff' : P0 && P0.isF(T) && (U.gender || (U.src && U.src.gender)) === 'm' ? 'fm' : 'mf';
      var ero = !!(HK.Ero && HK.Ero.on && HK.Ero.on(S));
      return after1(r, names(A.nightText(T, U, mode, fresh(S, null), ero), T, U));
    };
    f._attr = true;
    return f;
  });
  /* omega-thick.js の HK.TKC.body（オメガバース・漂流記・ゾンビの山場）：サドの攻めは乱暴な抱き方に、始まりのあとに一文（{T}{U} のまま） */
  var TK = HK.TKC;
  if (TK && TK.body && !TK.body._attr) HK.wrap(TK, 'body', function (tb0) {
    var f = function (T, U, o) {
      if (!T || !U || !o) return tb0.apply(this, arguments);
      var nt = A.nightOf(T, U), nb = A.nightOf(U, T);
      if (!nt && !nb) return tb0.apply(this, arguments);
      var kd = TK.kind(T, U, o.flav), o2 = {};
      Object.keys(o).forEach(function (k) { o2[k] = o[k]; });
      if (nt === 'sadist' && kd !== 'ff' && kd !== 'ride') o2.rough = true;
      var pn0 = pairNow, r;
      pairNow = [T, U];
      try { r = tb0.call(this, T, U, o2); } finally { pairNow = pn0; }
      if (typeof r !== 'string') return r;
      var t = A.nightText(T, U, kd === 'ff' ? 'ff' : kd === 'ride' ? 'fm' : 'mf', fresh(o.rng, o.pick), false);
      return after1(r, t.replace(/\{a\}/g, '{T}').replace(/\{b\}/g, '{U}'));
    };
    f._attr = true;
    return f;
  });

  /* ---------- 夜の性格を喘ぎの呼び出しに渡す（2026-10-27 担当HM） ----------
     相手：o.top／ctx.top（moan-engine.js の HK.Moan.say の o.top と同じ人）か、いま組み立てている山場の二人（pairNow）のもう一人。
     渡すのは写し（呼ぶ側の o・ctx は書き換えない）。夜の性格を決めていない人（nightOf が ''）は、そのまま渡す */
  A.moanLog = null;
  function partnerOf(who, o) {
    var t = o && typeof o === 'object' ? o.top : null;
    if (t && t !== who && t.name !== who.name) return t;
    if (pairNow) { if (pairNow[0] === who || (pairNow[0] && pairNow[0].name === who.name)) return pairNow[1]; if (pairNow[1] === who || (pairNow[1] && pairNow[1].name === who.name)) return pairNow[0]; }
    return null;
  }
  function withNight(who, o, log) {
    if (!who || !who.name || HK.SAFE_ON) return o;
    var nt = (o && typeof o === 'object' && o.night) || A.nightOf(who, partnerOf(who, o));
    if (log && A.moanLog) A.moanLog.push({ who: who.name, night: nt || '' });
    if (!nt || (o && typeof o === 'object' && o.night === nt)) return o;
    var c = {};
    if (o && typeof o === 'object') { for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) c[k] = o[k]; }
    else if (o) c.deep = true;
    c.night = nt;
    return c;
  }
  var MN = HK.Moan;
  /* 点検の記録（A.moanLog）は、喘ぎのエンジンに届く最後の呼び出し（HK.Moan.pick）でだけ取る */
  if (MN && MN.pick && !MN.pick._night) HK.wrap(MN, 'pick', function (pk0) { var f = function (S, who, key, ctx) { return pk0.call(this, S, who, key, withNight(who, ctx, true)); }; f._night = true; return f; });
  /* HK.Moan.say の o を写しても、その中の HK.Moan.pick の ctx（moan-engine.js が o から組み直す）には night が入らないので、pick の包みがもう一度入れる */
  if (MN && MN.say && !MN.say._night) HK.wrap(MN, 'say', function (sy0) { var f = function (S, who, kind, o, old) { return sy0.call(this, S, who, kind, withNight(who, o), old); }; f._night = true; return f; });
  if (HK.Ero && HK.Ero.moan && !HK.Ero.moan._night) HK.wrap(HK.Ero, 'moan', function (em0) { var f = function (S, who, st, ctx) { return em0.call(this, S, who, st, withNight(who, ctx)); }; f._night = true; return f; });

  /* ---------- 物語型・一人用の箱庭の住人二人の性的な場面（PAIR_NET・FEAT_NET。2026-10-27 担当HM） ----------
     HK.Story.say を通る記録のうち、性的な場面の印があり（o.lewd・HK.EroScene.hit）、登場人物が住人ちょうど二人で、
     二人の名前が並ぶ性的な文がある記録に、夜の性格の一文（A.nightText）が入っていなければ足す。向きは HK.Pos.order（{a}＝攻め・{b}＝受け）。
     FEAT_NET の箱庭では、体格・身長の差・胸・体の特徴の一文（A.pairLine の touch）も足す（どれも決めていなければ乱数を使わずに ''）。
     段落があれば最初の段落のあと、なければ二人の名前が並ぶ最初の性的な文のあと（「」の外）に置く */
  var NET_SKIP = { hole: 1, locker: 1 }, leadFr = null;
  var FEAT_NET = { saimin: 1, kaihen: 1, succubus: 1, variety: 1 };
  var NET_SEX = /抱き潰|エッチ|イカせ|イかせ|イった|イっ|果て|喘|挿れ|挿入|舐め|愛撫|達し|体を重ね|肌を重ね|腰を(?:振|沈|打ち|揺|落と|突き|使)|跨[っがりるら]|繋がっ|繋がり|奥まで|最奥|射精|白濁|中に出|交わ|抱いた|抱かれ|貫/;
  function netWho(S, a) { return typeof a === 'number' ? (S.P || [])[a] : a; }
  function netPair(S, o) {
    if (!o || typeof o.text !== 'string' || HK.SAFE_ON || o.kind === 'step' || o.kind === 'phase') return null;
    var id = S && S.scen && S.scen.id;
    if (!id || NET_SKIP[id] || !Array.isArray(S.P)) return null;
    if (!(o.lewd === true || (HK.EroScene && HK.EroScene.hit(S, o)))) return null;
    var acts = (o.actors || []).map(function (a) { return netWho(S, a); }).filter(function (c, i, l) { return c && c.name && S.P.indexOf(c) >= 0 && l.indexOf(c) === i; });
    if (acts.length !== 2 || (o.actors || []).length !== 2) return null;
    var a = acts[0], b = acts[1];
    if (HK.State && (!HK.State.r18ok(a) || !HK.State.r18ok(b))) return null;
    var both = o.text.replace(/「[^」]*」/g, '「」').split(/[。！？\n]/).some(function (x) { return x.indexOf(a.name) >= 0 && x.indexOf(b.name) >= 0 && NET_SEX.test(x); });
    return both ? [a, b] : null;
  }
  /* 差し込む位置：段落があれば最初の段落のあと。なければ、二人の名前が並ぶ最初の性的な文の終わり（「」の外の 。） */
  function netInsert(text, ins, a, b) {
    if (!ins) return text;
    if (text.indexOf('\n\n') >= 0) return after1(text, ins);
    var depth = 0, st = 0;
    for (var i = 0; i < text.length; i++) {
      var ch = text[i];
      if (ch === '「') depth++;
      else if (ch === '」' && depth > 0) depth--;
      else if (depth === 0 && /[。！？]/.test(ch)) {
        var sen = text.slice(st, i + 1);
        if (sen.indexOf(a.name) >= 0 && sen.indexOf(b.name) >= 0 && NET_SEX.test(sen)) return text.slice(0, i + 1) + ins + text.slice(i + 1);
        st = i + 1;
      }
    }
    return text + ins;
  }
  function netFill(S, o) {
    var pr = netPair(S, o);
    if (!pr) return;
    var P0 = HK.Pos, od = P0 ? P0.order(pr[0], pr[1], pr) : pr, T = od[0], U = od[1];
    if (P0 && P0.okSex && !P0.okSex(T, U)) return;
    var id = S.scen.id, pk = fresh(S, null), add = '';
    /* 夜の性格：記録の文に、もう夜の性格の一文（山場の組み立ての包みが入れたもの）があれば足さない */
    var has = marks.some(function (m) { return o.text.indexOf(m.frag) >= 0; });
    if (!has && (A.nightOf(T, U) || A.nightOf(U, T))) {
      var mode = P0 && P0.isF(T) && P0.isF(U) ? 'ff' : P0 && P0.isF(T) && (U.gender || (U.src && U.src.gender)) === 'm' ? 'fm' : 'mf';
      var ero = !!(HK.Ero && HK.Ero.on && HK.Ero.on(S));
      add += names(A.nightText(T, U, mode, pk, ero), T, U);
    }
    if (FEAT_NET[id] && A.pairLine) add += A.pairLine(T, U, 'touch', pk, S) || '';
    /* 夜の主導（pos-lead-r18.js の HK.PosLead.text。誘い受け・襲い受け）：合意のない展開の記録には足さない。主導の文がもう入っていれば足さない */
    var PL = HK.PosLead;
    if (P0 && PL && PL.text && PL.NARR && PL.of && PL.of(T, U) && String(o.why || '').indexOf(P0.FORCE_MARK || '〔合意のない展開〕') < 0) {
      if (!leadFr) { leadFr = []; var walk = function (v) { if (typeof v === 'string') { var f = v.split(/\{[^}]*\}/).filter(function (x) { return x.length >= 8; })[0]; if (f) leadFr.push(f.slice(0, 16)); } else if (Array.isArray(v)) v.forEach(walk); else if (v && typeof v === 'object') Object.keys(v).forEach(function (k) { walk(v[k]); }); }; walk(PL.NARR); }
      if (!leadFr.some(function (f) { return o.text.indexOf(f) >= 0; })) {
        var lmode = P0.isF(T) && P0.isF(U) ? 'ff' : P0.isF(T) && (U.gender || (U.src && U.src.gender)) === 'm' ? 'fm' : 'mf';
        add = names(PL.text(T, U, lmode, pk), T, U) + add;
      }
    }
    if (add) o.text = netInsert(o.text, add, T, U);
  }
  A.netFill = netFill;
})();
