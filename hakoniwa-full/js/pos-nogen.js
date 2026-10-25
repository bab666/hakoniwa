/* 箱庭シミュレーター: 性器なし（attr.js の genital = 'none'）の人の体の場面（R18版のみ。pos-fm.js のあと、persona-final.js より前に読む）
   利用者の決まり：無性器の人は、受けのとき口（口内）まで。攻めのときは指と玩具だけ（挿入・ノット・射精の文を出さない）。
   モブ・魔物・村人・獲物が相手でも同じ。無性器どうしの組は、口と指・玩具だけ。HK.Pos.okSex は変えない（組み立て側が形を選ぶ）。
   ■ 形（HK.NoGen.kind(攻め, 受け)）：受けが none → 'oral'（{a} が {b} の口を使う。{a} の体：m 男性器あり／f 女性器だけ／x なし）
                                     攻めが none → 'hand'（{a} の指と玩具。{b} の体：f 女性器あり／m 男性器だけ＝後ろを指・玩具で）
   ■ HK.NoGen.scene(o)：一場面ぶんの段落（{a}{b} のまま返す。o = { pick, rng, S, a, b, ero, open, after }）。
     thick-sex.js の T.scene・thick-sex-ero.js の X.scene・r18-thick.js の R18M.sex・omega-thick.js の TK.body・solo-thick4.js の Thick4.scene から呼ぶ
   ■ 取りこぼし対策：どの箱庭の結果も最後に見直し、none の人の場面に挿入・射精・性器の語が残っていれば、
     その文を口・指・玩具の文に差し替える（HK.NoGen.review。pos-ff.js の FF.fix と同じやり方）
   ■ 山場（果てる）は受けの態度9種 × 3文以上。男性向けの作風は最中・山場とも 3 文以上
   登場人物はすべて成人として扱う */
(function () {
  'use strict';
  var HK = window.HK;
  if (!HK || !HK.Pos) return;
  var P = HK.Pos;
  function L(s) { return s.split('|'); }
  var NG = HK.NoGen = {};

  /* ---------- 判定 ---------- */
  NG.on = function (a, b) { return !HK.SAFE_ON && !!((a && P.noGen(a)) || (b && P.noGen(b))); };
  /* T＝攻め、U＝受け */
  NG.kind = function (T, U) { if (HK.SAFE_ON) return ''; if (U && P.noGen(U)) return 'oral'; if (T && P.noGen(T)) return 'hand'; return ''; };
  /* 体の書き分け：m 竿あり／f 女性器あり／x なし（指と舌）／c 人でない相手（触手・魔物など。モブの見直しだけ） */
  NG.bodyOf = function (c) { if (c && c._kind) return c._kind; if (!c || P.noGen(c)) return 'x'; return P.hasF(c) ? 'f' : 'm'; };

  /* ---------- 小説調 ---------- */
  var OPEN = L('{a}は{b}の顎を指で持ち上げ、ゆっくりと唇を重ねた。舌先で歯列をなぞり、閉じようとする唇を少しずつこじ開けていく。|{a}は{b}を膝の上に引き寄せ、唇を塞いだ。逃げようとする舌を絡め取り、息継ぎの隙も与えない。|{a}は{b}の唇を親指でなぞり、「口、開けて」と囁いた。{b}が戸惑いながら唇を開くと、{a}はそこへ深く口づけた。|{a}は{b}の頬を両手で包み、確かめるように何度も唇を重ねた。重ねるたびに、口づけは深く、長くなっていった。|{a}は{b}を壁際に追いつめ、顎を掴んで上を向かせた。「口だけで、どこまで乱れるか見せて」|{a}は{b}の首筋に唇を這わせながら、ゆっくりと耳たぶ、頬、唇へと上っていった。{b}の唇が、待ちきれないように開いた。');
  var OPEN_H = L('{a}は{b}をベッドに横たえ、首筋から胸、脇腹へと指先を滑らせていった。触れるたびに、{b}の肌が粟立つ。|{a}は{b}の背中に回り、耳たぶを甘噛みしながら、服の中へ両手を差し入れた。|{a}は枕元に玩具をいくつか並べてから、{b}の手首に口づけた。「今夜は、これと指で」|{a}は{b}の服を一枚ずつ脱がせ、露わになった肌に唇と指を這わせていった。急ぐ様子は、少しもなかった。|{a}は{b}の両手首を片手でまとめ、もう片方の手でシャツのボタンを一つずつ外していった。「動かないで。全部、こっちでする」|{a}は{b}を背中から抱きすくめ、指先だけで鎖骨をなぞった。それだけで、{b}の呼吸が浅くなった。');
  /* 口（{b} が none）。{a} の体ごと */
  var BODY_O = {
    x: L('{a}は{b}の口に指を二本差し入れ、舌の上をゆっくりと撫でた。{b}が指に吸いつくと、{a}は喉の手前まで指を沈めては引き、また沈めた。|{a}は{b}の舌を自分の舌で絡め取り、唇の裏、上顎、舌の付け根と、口の中を隅々まで舐め尽くした。溢れた唾液が{b}の顎を伝った。|{a}は{b}の唇に指を這わせ、開いた口の中で指先を遊ばせた。舌を挟み、上顎をくすぐり、{b}が息を乱すたびに、もう一本指を増やした。|{a}は{b}の舌を指でつまんで引き出し、そこへ自分の唇を重ねた。吸われるたびに、{b}の肩が小さく跳ねた。|{a}は{b}の唇を親指で割り開き、濡れた指先で舌の裏をなぞった。{b}が反射的に指へ吸いつくと、{a}は満足そうに目を細めた。'),
    m: L('{a}は{b}の髪を撫でながら、熱く硬くなったものを{b}の唇に押し当てた。{b}がおずおずと口を開くと、{a}はゆっくりと腰を進め、舌の上を滑らせた。|{a}は{b}の頭をそっと押さえ、口いっぱいに自分の熱を含ませた。浅く、深く、{b}の唇が形をなぞるたびに、{a}の息が荒くなった。|{a}は{b}の前に立ち、顎を持ち上げて熱を咥えさせた。{b}の舌が裏側をなぞると、{a}は髪を撫でる指にわずかに力を込めた。|{a}は{b}を跪かせ、唇の端に熱を擦りつけた。{b}が観念したように口を開くと、{a}はゆっくりと舌の上へ滑り込ませた。|{a}は{b}の頬を両手で包み、口の中を確かめるように、浅く、ゆっくりと動いた。{b}の喉が鳴るたびに、{a}は髪を撫でて落ち着かせた。'),
    c: L('{a}は{b}の唇をこじ開けるように潜り込み、舌に幾重にも絡みついた。{b}が息を吸おうとするたびに、口の中をぬるりと撫で回される。|{a}は{b}の頬を包むように絡みつき、開いた口の中へゆっくりと入り込んだ。舌の裏、上顎と、{b}の口の中を確かめるように這い回る。|{a}は{b}の口元にまとわりつき、甘い粘液を舌の上に垂らした。{b}が思わず飲み下すと、そのたびに体の芯が熱くなっていった。'),
    f: L('{a}は{b}の頭を抱き寄せ、自分の脚のあいだへ導いた。{b}の舌が熱いところに触れると、{a}の太ももが小さく震えた。|{a}は{b}の顎を持ち上げ、自分の濡れた指を咥えさせてから、その唇を脚のあいだへ導いた。「同じように、舐めて」|{a}は{b}の頭を太ももで挟み込み、ゆっくりと腰を揺らした。{b}の舌が動くたびに、{a}の吐息が甘く乱れた。|{a}は{b}の顔を跨ぐように膝をつき、ゆっくりと腰を下ろした。「舌、出して」――言われるまま伸ばした{b}の舌を、{a}は自分の熱でふさいだ。|{a}は{b}の唇を指で開かせ、自分の胸の先を含ませた。それから少しずつ下へ、{b}の唇を導いていった。')
  };
  /* 指と玩具（{a} が none）。{b} の体ごと。m は後ろを指・玩具で */
  var BODY_H = {
    f: L('{a}は{b}の脚を開かせ、熱く濡れたところを指の腹でゆっくりとなぞった。{b}の腰が浮いたところで、指を一本、静かに沈めていく。|{a}は細身の玩具の電源を入れ、震える先端を{b}の一番敏感なところに押し当てた。強さを一段上げるたびに、{b}の膝が跳ねた。|{a}は{b}の脚のあいだに顔を寄せ、舌と指を交互に使って、{b}の弱いところを探り当てていった。|{a}は張り型をゆっくりと{b}の中へ沈め、角度を変えながら、いちばん反応のいい場所だけを撫で続けた。|{a}は{b}を背中から抱え、片手で胸の先を、もう片方の指で脚のあいだを同時に撫でた。{b}は{a}の腕の中で、何度も身をよじった。|{a}は小さなローターを{b}の下着の中に滑り込ませ、強さを一段ずつ上げていった。{b}が脚を閉じようとするたびに、{a}は膝でそれを押し開いた。'),
    m: L('{a}は指にたっぷりと香油を垂らし、{b}の後ろの窄まりを円を描くように撫でた。息を吐いた瞬間を狙って、指先をそっと沈めていく。|{a}は{b}をうつ伏せにさせ、後ろを指で丁寧にほぐしてから、細身の玩具をゆっくりと押し当てた。震える玩具の先端が、内側の弱いところを探り当てる。|{a}は{b}の後ろに沈めた指を曲げ、腹側のしこりを押し上げた。{b}の腰が跳ね、逃げようとする体を{a}はもう片方の手で抱き寄せた。|{a}は{b}の後ろに小さな振動する玩具を収め、強さを一段ずつ上げながら、{b}の熱くなった前を掌で包み込んだ。|{a}は{b}を横向きに抱き、背中から回した指で後ろをゆっくりとほぐしていった。{b}が肩越しに振り返るたびに、{a}は首筋に口づけて黙らせた。|{a}は{b}の膝を立てさせ、香油で濡らした玩具を後ろへ少しずつ収めていった。震えを一段強くするたびに、{b}の爪先が丸まった。'),
    c: L('{a}は{b}の体のつくりを一つずつ確かめるように、指先で敏感なところを探り当てていった。|{a}は{b}の震える器官を指でなぞり、反応のいいところだけを何度も撫で続けた。|{a}は{b}を押さえ込んだまま、指と玩具で弱いところを順番に責め立てた。'),
    /* 二人とも none（受けの口と、肌・胸を指と玩具で） */
    x: L('{a}は{b}の背中に指を這わせ、肩甲骨のくぼみ、脇腹、腰のくびれと、弱いところを一つずつ確かめていった。|{a}は{b}の胸の先に小さな玩具を押し当て、震えに合わせてもう片方を指先で転がした。{b}の背中がしなる。|{a}は{b}の口に指を含ませたまま、もう片方の手で脇腹から内腿までを、ゆっくりと撫で下ろしていった。|{a}は{b}の首筋に唇を這わせながら、震える玩具で胸の先と鎖骨のくぼみを交互になぞった。')
  };
  var FEEL_O = L('{a}が唇を離した一瞬だけ、{b}は浅く息を吸った。すぐにまた塞がれ、口の中を掻き回される。\n\n{b}「{mb}」|{b}の口の端から、こらえきれない声と唾液がこぼれた。舌を弄ばれるたびに、背中がぞくりと震える。\n\n{b}「{mb}」|口の中だけを責められているのに、{b}の体は芯から熱くなっていった。舌の付け根を撫でられるたびに、膝が勝手に擦り合わさる。\n\n{b}「{mb}」|{a}は{b}の胸の先を指でつまみながら、口の中をゆっくりと味わった。二か所から同時に送り込まれる痺れに、{b}の目が潤んだ。\n\n{b}「{mb}」|上顎をくすぐられるたびに、{b}の背筋に甘い痺れが走った。口の中にこんなに感じるところがあるなんて、知らなかった。\n\n{b}「{mb}」|{b}は息をするのも忘れて、{a}に口の中を明け渡していた。唇が離れるたびに、自分から追いかけてしまう。\n\n{b}「{mb}」');
  var FEEL_H = L('指が動くたびに、{b}の内側がきゅっと締まった。自分の体がこんなふうに反応するなんて、{b}は知らなかった。\n\n{b}「{mb}」|玩具の震えが体の芯に響き、{b}の太ももが勝手に震えた。止めてほしいのか、もっとほしいのか、もう分からない。\n\n{b}「{mb}」|{a}は{b}の反応を一つずつ確かめるように、指の角度と速さを変えていった。指先が弱いところをかすめるたびに、{b}の声が跳ねる。\n\n{b}「{mb}」|{a}は玩具を押し当てたまま、空いた手で{b}の胸の先を転がした。逃げ場のない痺れに、{b}は{a}の腕にしがみついた。\n\n{b}「{mb}」|{a}の指が弱いところを見つけるたびに、そこだけを何度も撫でられた。{b}の膝が震え、爪先がシーツを掻いた。\n\n{b}「{mb}」|焦らすように浅いところだけを撫でられ、{b}は思わず{a}の手首を掴んだ。止めたいのか、押しつけたいのか、自分でも分からなかった。\n\n{b}「{mb}」');
  /* 果てる：受けの態度9種 × 3文以上 */
  var CLIMAX_O = {
    proud: L('{b}は最後まで{a}を睨み上げていたが、口の中を深く掻き回された瞬間、その目から力が抜けた。肩を震わせ、悔しそうに喉を鳴らした。|「こんな、ので……」と言いかけた唇を、{a}はまた塞いだ。{b}は拳を握りしめたまま、口だけで追い詰められて体を跳ねさせた。|{b}は噛みつくように{a}に歯を立てかけたが、それも長くは続かなかった。舌の付け根を撫でられた瞬間、{b}は背を反らして震えた。'),
    stern: L('{b}は乱れまいと目を閉じていたが、喉の手前を撫でられた瞬間、こらえていた息がほどけた。体が一度大きく震え、それからゆっくりと力が抜けた。|{b}は最後まで声を殺そうとした。けれど口を塞がれたまま胸の先をつままれると、背筋が弓なりにしなった。|「……もう、十分だ」と言おうとした口を、{a}は深い口づけで塞いだ。{b}の指がシーツを掴み、長く震えた。'),
    tsun: L('「べ、別に、口だけで、なんて……」――言い終わる前に、{b}は{a}の腕にしがみついて震えていた。|{b}は真っ赤な顔で{a}を睨んだが、舌を吸われた瞬間に目を潤ませ、膝をがくがくと震わせた。|{b}は「ばか」と言おうとして、その言葉ごと口の中を掻き回された。体がびくんと跳ね、{b}は{a}の胸を力なく叩いた。'),
    gentle: L('{b}は{a}の背中に腕を回し、口づけを受け止めたまま、ふわりと体を震わせた。とろけた目で、{a}を見上げる。|{b}は{a}の頬を撫でながら、口の中を満たされる感覚にうっとりと目を細めた。小さな震えが、指先まで広がっていった。|{b}は「ん……」と甘く喉を鳴らし、{a}に身を預けたまま達した。唇の端が、満たされたように緩んでいた。'),
    devoted: L('{b}は{a}を見上げたまま、懸命に舌を動かし続けた。{a}の息が乱れるのを感じた瞬間、{b}自身の体も震えた。|{b}は「もっと、ください」とせがむように口を開き、満たされた瞬間、うれしそうに体を震わせた。|{b}は{a}の手に頬をすり寄せ、口の中の熱を一滴もこぼすまいとした。そのまま、小さく痙攣して崩れた。'),
    cool: L('{b}は表情を変えまいとしていたが、口の中を執拗に撫でられ続けるうちに、瞳の焦点がぼやけていった。最後に小さく息を呑み、肩を震わせた。|「……口だけで、こうなるのか」――他人事のように呟いた{b}の声は、途中で甘く崩れた。|{b}は自分の反応を観察するように目を伏せていたが、舌の付け根を押さえられた瞬間、思考ごと体を震わせた。'),
    free: L('{b}は「それ、すき」と笑って自分から舌を差し出し、{a}に吸われた瞬間、声を上げて体を跳ねさせた。|{b}は{a}の首に腕を回し、夢中で口づけを返した。そのまま、肩を揺らして笑いながら震えた。|{b}は「口だけでこんな……やば」と息を弾ませ、言い終わる前に{a}にしがみついて震えた。'),
    shy: L('{b}は真っ赤な顔をシーツに隠そうとしたが、{a}の指に顎を戻された。口の中を撫でられたまま、{b}は小さく震えて目を潤ませた。|{b}は声を漏らすまいと唇を閉じかけたが、{a}に舌を吸われて、ほどけるように体を震わせた。|「は、はずかしい……」と呟いた口に、{a}の指が滑り込んだ。{b}はぎゅっと目を閉じたまま、小さく、長く震えた。'),
    polite: L('{b}は「お、お許しください……」と途切れ途切れに言いながら、口を塞がれたまま震えた。|{b}は乱れた襟元を直そうとした手を{a}に取られ、深く口づけられた。丁寧な言葉は、甘い吐息に溶けて消えた。|{b}は最後まで姿勢を正そうとしていたが、喉の手前を撫でられた瞬間、ふっと力が抜けて{a}の胸に崩れた。')
  };
  var CLIMAX_H = {
    proud: L('{b}は「指なんかで……」と吐き捨てた直後、{a}に弱いところを押し上げられて背を反らした。悔しげに唇を噛んだまま、体だけが正直に震えた。|{b}は最後まで{a}を睨んでいたが、玩具の強さを上げられた瞬間に目を見開き、シーツを握りしめて達した。|{b}は声を噛み殺そうとして失敗した。{a}の指が同じ場所を正確に撫で続け、{b}は腰を跳ね上げて果てた。'),
    stern: L('{b}は「……っ、止め、ろ」と命じかけたが、その声ごと崩れた。{a}の指を締めつけたまま、{b}は長く震えた。|{b}は姿勢を崩すまいと耐えていた。けれど{a}が玩具を押し当てたまま指を曲げると、背筋が大きくしなった。|{b}の眉間の皺がほどけたのは、最後の一瞬だった。{a}の指に追い上げられ、{b}は声もなく達した。'),
    tsun: L('「ゆ、指だけで、イくわけ……っ」――言い終わる前に、{b}は{a}の手首を掴んだまま震えていた。|{b}は真っ赤な顔で「ばか」と言い、次の瞬間、玩具の震えに腰を跳ねさせて達した。|{b}は顔を背けたまま、{a}の指をきつく締めつけた。ぎゅっと閉じた目の端に、涙が滲んでいた。'),
    gentle: L('{b}は{a}の名前を呼びながら、指の動きに合わせてゆっくりと昇りつめた。震えが収まるまで、{a}は手を止めずに撫で続けた。|{b}は「そこ……」と囁き、{a}の肩に顔を埋めて達した。とろけた吐息が、{a}の首筋にかかった。|玩具のやわらかな震えに包まれて、{b}は{a}の手を握ったまま、甘く長く震えた。'),
    devoted: L('{b}は「イっても、いいですか」と訊き、{a}が頷いた瞬間に達した。うれしそうに、{a}の手に頬をすり寄せた。|{b}は{a}の指に身を任せたまま、健気に体を揺らした。最後に名前を呼んで、小さく崩れた。|{b}は{a}を見上げたまま、玩具の震えに何度も小さく達した。そのたびに、「ありがとう、ございます」と息を震わせた。'),
    cool: L('{b}は冷静な顔を保とうとしていたが、指の角度が変わった瞬間に息を詰まらせた。数える余裕もないまま、体が震えた。|「……想定より、早い」――そう呟いた{b}の声は、玩具の震えに途中で崩れた。|{b}は目を閉じ、自分の反応を確かめるように息を整えていた。けれど最後の一押しで、思考ごと白く弾けた。'),
    free: L('{b}は「やば、それ、やばい」と笑いながら、{a}の指に合わせて自分から体を揺らし、声を上げて達した。|{b}は玩具を押し当てられた瞬間に「待って待って」と笑い、言い終わる前に体を跳ねさせた。|{b}は{a}にしがみつき、「もっと」とせがんだ。二度目の波は、一度目よりも早かった。'),
    shy: L('{b}は枕で顔を隠したまま、{a}の指に追い上げられて小さく震えた。枕の向こうから、か細い声が漏れた。|{b}は「見ないで……」と言いながら、玩具の震えに耐えきれず、真っ赤な顔で達した。|{b}は声を殺そうとして{a}の肩に顔を押しつけ、そのまま、ぎゅっと体を強張らせて果てた。'),
    polite: L('{b}は「は、はしたない声を……」と詫びながら、{a}の指の動きに合わせて達した。|{b}は最後まで言葉を崩すまいとしたが、玩具の強さを上げられた瞬間、「申し訳、ございませ……」と言いかけて震えた。|{b}は乱れた呼吸を整えようとしたが、{a}がもう一度弱いところを撫でると、丁寧な言葉は甘い声に溶けた。')
  };
  /* 口の場面で {a} が果てる（{a} の体ごと） */
  var FIN_O = {
    c: L('{a}は最後に{b}の口の中で大きく脈打ち、甘い粘液を溢れさせてから、ゆっくりと離れていった。|{a}は{b}の舌に絡みついたまま震え、やがて満ち足りたように力を緩めた。|{a}が離れたあとも、{b}の口の中には甘い痺れが残っていた。'),
    m: L('{a}は低く息を詰め、{b}の口の中で果てた。{b}は喉を鳴らして、こぼさないように受け止めた。|{a}は{b}の髪を撫でる指に力を込め、口の中で熱を弾けさせた。{b}の喉が、こくりと動いた。|{a}は最後に深く息を吐き、{b}の唇からゆっくりと熱を引いた。濡れた唇が、名残惜しそうに開いたままだった。'),
    f: L('{a}は{b}の舌に熱いところを押しつけたまま、太ももを震わせて達した。|{a}は{b}の髪に指を絡め、腰を小さく揺らしながら、甘い声を上げて果てた。|{b}の舌の動きに追い立てられて、{a}は短く声を上げて達した。それから{b}の顔を、そっと離した。'),
    x: L('{a}は最後に深く口づけ、震える{b}の舌をそっと解放した。|{a}は{b}の口から指を抜き、濡れた指先を自分の唇でぬぐった。|{a}は{b}の舌をもう一度だけ吸ってから、ゆっくりと唇を離した。二人の唇のあいだに、細い糸が光った。|{a}は{b}の額に額を合わせ、乱れた息が落ち着くのを待った。口の中には、まだ{a}の指の感触が残っていた。')
  };
  var AFTER = L('{a}は{b}の唇を親指で拭い、汗ばんだ前髪をかき上げた。{b}はしばらく、ぼんやりと天井を見ていた。|二人は毛布にくるまったまま、しばらく何も言わなかった。{b}の呼吸だけが、少しずつ落ち着いていった。|{a}は{b}の背中をゆっくりと撫で、乱れた呼吸が静まるのを待った。|{b}は{a}の胸に額を預け、「……ずるい」と小さく呟いた。|{a}は{b}の手を取り、指先に一つずつ口づけた。{b}はくすぐったそうに笑い、それから目を閉じた。|{b}は乱れた髪を直しながら、{a}の顔をまともに見られなかった。{a}はそれを面白そうに眺めていた。');
  /* 台詞の差し替え（話し手の役ごと） */
  var SAY = {
    oralA: L('口、開けて|舌、出して|こっち、見て|上手……そのまま|もっと、ちゃんと咥えて'),
    handA: L('力、抜いて|ここ、いいでしょ|指、増やすね|強くするよ|もう少し、我慢して'),
    B: L('ん、ぅ……っ|は、ぁ……っ|や、ぁ……っ|ん……っ、ふ……')
  };

  /* ---------- 男性向け（擬音・♡） ---------- */
  var E_BODY_O = {
    c: L('{a}は{b}の口にぬるりと潜り込み、喉の手前で何度もうねった。{s:suck}――{b}「{mb}」――口の端から甘い粘液がとろとろと溢れる。|{a}は{b}の舌に絡みつき、ちゅうちゅうと吸い上げた。{s:suck}。{b}「{mb}」|{a}は{b}の口いっぱいに広がって、上顎をくすぐるように撫で回した。{s:suck}――{b}「{mb}」'),
    x: L('{a}は{b}の口に指を二本突っ込み、舌を挟んでぐちゅぐちゅと掻き回した。{s:suck}――{b}「{mb}」――唾液が糸を引いて顎を伝う。|{a}は{b}の頭を抱え込み、舌をじゅるじゅると吸い上げた。{s:suck}。{b}の目がとろんと潤み、口の端から甘い声がこぼれる。{b}「{mb}」|{a}は{b}の唇を指でこじ開け、「ほら、べーってして♡」と囁いた。差し出された舌を、{a}はちゅうちゅうと音を立てて吸った。{b}「{mb}」'),
    m: L('{a}は{b}の顎を掴んで口を開かせ、熱く硬いものを喉の手前まで押し込んだ。{s:suck}――{b}「{mb}」――{b}の喉が、咥えたままきゅうっと締まる。|{a}は{b}の髪を掴み、口の中を何度も行き来させた。{s:suck}――「ほら、もっと吸って♡」――{b}「{mb}」|{a}は{b}の頬を押し上げるように熱を擦りつけ、「えっちな顔」と笑った。{s:suck}。{b}「{mb}」'),
    f: L('{a}は{b}の顔に跨り、とろとろに濡れたところを唇に押しつけた。{s:wet}――「ほら、ちゃんと舐めて♡」――{b}「{mb}」|{a}は{b}の頭を太ももで挟み込み、舌が動くたびに甘い声を漏らした。{s:suck}――{b}「{mb}」|{a}は{b}の舌に自分を擦りつけながら、「上手、もっと♡」と腰を揺らした。{s:wet}。{b}「{mb}」')
  };
  var E_BODY_H = {
    c: L('{a}は{b}の敏感な器官を指でくりくりと撫で回した。{b}の体がびくびくと跳ねる。|{a}は{b}のつくりを確かめるように、震える玩具を押し当てて回した。{b}が身をよじる。|{a}は{b}の弱いところを指でとんとんと叩き、反応するたびに笑った。'),
    f: L('{a}は{b}の脚を大きく開かせ、とろとろのところに指を二本沈めた。{s:wet}――「ほら、すぐ吸いついてくる♡」――{b}「{mb}」|{a}は震える玩具を{b}の一番敏感なところに押しつけ、強さを最大まで上げた。{s:wet}――{b}「{mb}」|{a}は{b}の中に沈めた指をくいっと曲げ、ざらついたところをとんとんと叩いた。{s:wet}。{b}「{mb}」'),
    m: L('{a}は香油をまぶした指を{b}の後ろにぬぷっと沈め、腹側のしこりをぐりぐりと押し上げた。{s:wet}――{b}「{mb}」|{a}は{b}を四つん這いにさせ、後ろに細い玩具をゆっくり押し込んで、スイッチを入れた。ヴヴヴ……と震えが響き、{b}「{mb}」|{a}は{b}の後ろを指でくちゅくちゅとほぐしながら、「いい声で鳴いて♡」と耳元で囁いた。{b}「{mb}」'),
    x: L('{a}は{b}の胸の先に玩具を二つ押し当て、同時にスイッチを入れた。ヴヴヴ……と震えが走り、{b}「{mb}」|{a}は{b}の口に指を突っ込んだまま、もう片方の手で胸の先をくりくりと転がした。{s:suck}――{b}「{mb}」|{a}は{b}の耳を舐めながら、震える玩具を脇腹から内腿へ這わせていった。{b}「{mb}」')
  };
  var E_CLIMAX_O = L('{b}「{mbc}」――口の中をぐちゅぐちゅに掻き回されたまま、{b}は体をびくびくと跳ねさせた。口だけで、イかされた。|{b}の目がとろんと上を向き、舌を突き出したまま体が痙攣した。{b}「{mbc}」――{a}は満足そうに、その舌をもう一度吸った。|{b}「{mbc}」――{a}に舌を吸われた瞬間、{b}の全身ががくがくと震えた。とろけきった顔で、口の端からよだれが垂れていた。');
  var E_CLIMAX_H = L('{b}「{mbc}」――{a}の指をきゅうきゅうに締めつけたまま、{b}は体をがくがくと跳ねさせて達した。|玩具の震えに追い立てられ、{b}の背中が大きく反った。{b}「{mbc}」――{a}は止めずに、もう一段強さを上げた。|{a}が弱いところを指でとんとんと叩くたびに、{b}の体がびくびくと跳ねた。{b}「{mbc}」――何度目か分からない絶頂だった。');

  /* 感覚遮断穴：壁の向こうの none の人の体（口が届かないので、肌を指・舌・玩具で撫でるところまで） */
  var WALL_B = L('{a}の指が、壁から突き出た{b}の内腿をゆっくりと撫で上げた。触れてほしいところには何もないのに、肌だけが熱を帯びていく。|{a}は{b}の腰のくびれを両手でなぞり、汗ばんだ肌に舌を這わせた。見えない向こう側で、{b}の腰が小さく揺れた。|{a}は震える玩具を{b}の腰骨から内腿へと滑らせ、敏感な肌を何度も往復させた。壁の向こうから、押し殺した声が漏れた。|{a}は{b}の太腿に唇を押し当て、柔らかい肌に何度も吸いついた。赤い痕が、一つずつ増えていった。');
  var WALL_C = L('壁の向こうで、{b}の腰がびくんと跳ねた。肌を撫でられただけなのに、{b}は声を殺したまま震えていた。|{a}の指が内腿の付け根をなぞった瞬間、{b}の脚ががくがくと震えた。壁の向こうで、短い悲鳴のような声が上がった。|撫でられ続けた肌が限界を迎えたように、{b}の腰が大きく波打った。{a}は満足そうに、震える太腿を撫でた。|{a}が膝の裏から腰までを一息に撫で上げると、{b}の体は壁の向こうで弓なりに反った。');
  NG.POOLS = { OPEN: OPEN, OPEN_H: OPEN_H, BODY_O: BODY_O, BODY_H: BODY_H, FEEL_O: FEEL_O, FEEL_H: FEEL_H, CLIMAX_O: CLIMAX_O, CLIMAX_H: CLIMAX_H, FIN_O: FIN_O, AFTER: AFTER, SAY: SAY, E_BODY_O: E_BODY_O, E_BODY_H: E_BODY_H, E_CLIMAX_O: E_CLIMAX_O, E_CLIMAX_H: E_CLIMAX_H, WALL_B: WALL_B, WALL_C: WALL_C };

  var ATT = ['proud', 'stern', 'tsun', 'gentle', 'devoted', 'cool', 'free', 'shy', 'polite'];
  function att(c) {
    if (!c) return 'gentle';
    if (ATT.indexOf(c.persona) >= 0) return c.persona;
    var p = HK.personaOf && (c.tone || c.eg || c.tr) ? HK.personaOf(c) : c.persona;
    if (ATT.indexOf(p) >= 0) return p;
    var b = c.tone && HK.toneOpt ? HK.toneOpt(c.tone, 'base') : null;
    return ATT.indexOf(b) >= 0 ? b : 'gentle';
  }
  NG.att = att;
  function rint(o, n) { var r = o && (o.rng || (o.S && o.S.rng)); if (r && r.int) return r.int(n); if (typeof r === 'function') return Math.floor(r() * n); return Math.floor(Math.random() * n); }
  /* 喘ぎ（stage 1 最中・2 果てる）。男性向けは ero-kit の HK.Ero.moan、小説調は thick-sex の T.moan */
  /* 体の中・奥を思わせる喘ぎ（「奥まで」「なか、いっぱい」など）は使わない */
  var MOAN_NG = /奥|おく|ナカ|なか|中に|中で|中、|いっぱい|入って|挿れ|出して|注い|孕|種/;
  function moan(o, pick, who, st) {
    var S = o.S || (o.rng && o.rng.int ? { rng: o.rng } : null), t = '';
    for (var i = 0; i < 8; i++) {
      if (o.ero && HK.Ero && HK.Ero.moan && S && S.rng && S.rng.int) t = HK.Ero.moan(S, who, st, { deep: false });
      else if (HK.ThickSex && HK.ThickSex.moan) t = HK.ThickSex.moan(pick, who, st >= 2);
      if (t && !MOAN_NG.test(t)) return t;
    }
    return st >= 2 ? (o.ero ? 'あ、あぁっ♡♡　だめ、きちゃう……っ♡♡' : 'あ……っ、だめ、きちゃう……っ') : (o.ero ? 'ん、ぁ……♡　そこ、だめ……♡' : 'ん……っ、ふ、ぁ……');
  }
  function sfx(o, pick, t) {
    return t.replace(/\{s:(\w+)\}/g, function (m, k) { var l = (HK.Ero && HK.Ero.SFX && HK.Ero.SFX[k]) || ['……っ']; return pick(l); });
  }
  /* 一場面ぶん。o = { pick, rng, S, a: 攻め, b: 受け, ero, open, after }。{a}{b} のまま返す */
  NG.scene = function (o) {
    var a = o.a, b = o.b, k = o.kind || NG.kind(a, b) || 'oral', base = o.pick || function (arr) { return arr[rint(o, arr.length)]; };
    var pick = HK.Ero && HK.Ero.freshPick ? HK.Ero.freshPick(o.S || o.rng, base) : base;
    var ab = NG.bodyOf(a), bb = NG.bodyOf(b), at = att(b), out = [];
    if (k === 'wall') {
      out.push(pick(WALL_B));
      out.push('{b}「' + moan(o, pick, b, 2) + '」' + pick(WALL_C));
      return { text: out.join('\n\n'), mode: k, kind: k };
    }
    var mb = function () { return moan(o, pick, b, 1); }, mbc = function () { return moan(o, pick, b, 2); };
    var put = function (t) { return sfx(o, pick, t).replace(/\{mbc\}/g, mbc).replace(/\{mb\}/g, mb); };
    if (o.open !== false) out.push(o.open || pick(k === 'oral' ? OPEN : OPEN_H));
    if (o.ero) {
      out.push(put(pick(k === 'oral' ? E_BODY_O[ab] || E_BODY_O.x : E_BODY_H[bb] || E_BODY_H.x)));
      out.push(put(pick(k === 'oral' ? E_CLIMAX_O : E_CLIMAX_H)));
    } else {
      out.push(pick(k === 'oral' ? BODY_O[ab] || BODY_O.x : BODY_H[bb] || BODY_H.x));
      out.push(put(pick(k === 'oral' ? FEEL_O : FEEL_H)));
      out.push('{b}「' + mbc() + '」' + pick((k === 'oral' ? CLIMAX_O : CLIMAX_H)[at] || CLIMAX_O.gentle));
    }
    if (k === 'oral') out.push(pick(FIN_O[ab] || FIN_O.x));
    if (o.after !== false) out.push(o.after || pick(AFTER));
    return { text: out.join('\n\n'), mode: k, kind: k };
  };
  /* 一続きの短い文（一段落）で欲しいとき */
  NG.short = function (o) {
    var a = o.a, b = o.b, k = o.kind || NG.kind(a, b) || 'oral', base = o.pick || function (arr) { return arr[rint(o, arr.length)]; };
    if (k === 'wall') { var pw = HK.Ero && HK.Ero.freshPick ? HK.Ero.freshPick(o.S || o.rng, base) : base; return pw(WALL_B) + pw(WALL_C); }
    var pick = HK.Ero && HK.Ero.freshPick ? HK.Ero.freshPick(o.S || o.rng, base) : base;
    var ab = NG.bodyOf(a), bb = NG.bodyOf(b), at = att(b);
    var body = pick(k === 'oral' ? BODY_O[ab] || BODY_O.x : BODY_H[bb] || BODY_H.x), cl = pick((k === 'oral' ? CLIMAX_O : CLIMAX_H)[at] || CLIMAX_O.gentle);
    return body + cl;
  };

  /* 名前を埋めた一場面（r18-thick.js・solo-r18-moan.js の R18M.sex から。x＝攻め・y＝受け、opt.short なら短く） */
  NG.text = function (S, x, y, opt) {
    opt = opt || {};
    var od = P.order(x, y, [x, y]); x = od[0]; y = od[1];
    var ero = !!(HK.Ero && HK.Ero.on && HK.Ero.on(S)), t;
    if (opt.short) t = NG.short({ S: S, rng: S && S.rng, a: x, b: y });
    else t = NG.scene({ S: S, rng: S && S.rng, a: x, b: y, ero: ero, after: opt.after === false ? false : null }).text;
    if (ero && HK.Ero.fill) t = HK.Ero.fill(S, t, y);
    return t.replace(/\{a\}/g, x.name).replace(/\{b\}/g, y.name);
  };

  /* ---------- 見直し（取りこぼし対策） ---------- */
  /* 性的でない言い回しは判定の前に消す（pos-audit.js の NONSEX と同じ考え方） */
  var NONSEX = /迎え入れるように[^。]{0,4}(?:両腕|腕)|(?:巣|群れ|社会|輪)で(?:ひとつ|一つ)にな|(?:手|掌|両手|腕|指|毛布|布団|胸)の(?:中|奥)(?:で|に|へ|から)?|腰を振(?:って|りながら)踊|の(?:一つ|ひとつ)に(?:な|数え)|(?:島|森|山|洞窟|洞穴|谷|村|路地|廊下|建物|屋敷|館|店|倉庫|船|艦|基地|通路|坑道|神殿|祠|社|遺跡|迷宮|森の|林|藪|茂み|浜|岩場|棚|引き出し|押し入れ|クローゼット|鞄|カバン|袋|胸|心|記憶|目|瞳|頭)の(?:奥|中)|奥(?:の部屋|の間|の院|座敷|歯|義|様|さん|手|地|深い|ゆかし)|釣り竿|物干し竿|竿竹|ヤドカリ|カリカリ|カリスマ|影が(?:一つ|ひとつ)に|一物の|腹に一物|白濁した(?:湯|水|液|霧|空)|犯人|犯行|犯罪|上達|到達|配達|伝達|達成|発達|通達|熟達|調達|速達|先達|一貫|貫徹|貫通|貫禄|突き止め|突き当た|突き放|突き返|突き出|突き抜け|(?:拳|腕|手|杖|旗|剣|槍)を(?:天に)?突き上げ|(?:電話|回線|通信|無線|話|気持ち|心|記憶|縁|手)が繋が|繋がり(?:のある|を感じ|が深|がある)|(?:洞窟|森|遺跡|施設|地下|迷宮|神殿)の最奥|(?:情報|知識|映像|光|風|水|空気|お茶|茶|酒|視線|注目|愛情|力|魔力|毒)(?:が|を)?[^。]{0,4}(?:注がれ|流れ込|注ぎ)|注がれた(?:お茶|茶|酒|水|コーヒー|紅茶|スープ|グラス|杯)|(?:お茶|茶|酒|水|コーヒー|紅茶|スープ)を注/g;
  /* 本文が性的な場面か（はっきりした語だけで見る。「奥」「抱」「腰」など、ふだんの文にも出る語では決めない） */
  var SEXT = /突き続け|脚を開かせ|押し倒|組み敷|押し殺した声|声が漏れ|甘い声|エッチ|イカせ|イかせ|イった|イっちゃ|イっ(?:て|た)|イく|イき|果て(?:た|て|る(?!し)|ない)(?!し)|喘|挿れ|挿入|舐め(?:回|上げ|取|られ|させ)|愛撫|達し(?:た|て|そう)|体を重ね|♡|濡れ(?:た|て)(?:ところ|奥|そこ|中|秘)|とろとろ|蜜が|蜜を|搾り|脈打|ノット|種付け|孕ま|白濁|中に出|咥え|しゃぶ|射精|精液|絶頂|快感|快楽|抱き潰|抱いた|抱かれ|犯され|犯し(?:た|て)|貫かれ|貫い|突き上げられ|跨[っがりる]|腰を(?:振|打ちつけ|打ち付け|沈め|落と|揺ら)|乳首|胸の先|脚のあいだ|脚の間|秘所|膣|ちんぽ|おまんこ|嬌声|甘い声|根元まで|媚薬|扱かれ|扱い(?:た|て)|しごか|勃|硬くなった|熱く張りつめ|昂り|一つにな|ひとつにな|繋がっ|最奥|奥まで(?:突|沈|貫|届|入|埋)|奥を(?:突|抉|擦)|締めつけ|締め付け/;
  var MALE = P.MALE_RE;
  /* 射精・打ちつける音の擬音（ero-kit.js の SFX.cum・hit）も、none の人の場面では使わない */
  var MALE2 = /熱を押し当て|出すな(?:よ)?(?:……|っ|」)|出していい|出して(?:ちょうだい|ください)|どぷ|びゅる|びゅく|びゅー|ぱんっ|ばちゅ|どちゅ|ぱちゅ|ずちゅ|竿|裏筋|カリ首|玉袋|おちんちん|吐精|射精|精を(?:吐|放|注)|熱を(?:吐き出|放|注ぎ)|注ぎ込|注がれ|注いだ|子種|種付け|孕|搾り取|搾精/;
  var FEM = /膣|まんこ|蜜壺|蜜壷|秘裂|秘所|秘部|陰部|割れ目|子宮|愛液|陰核|クリトリス|クリを|クリが|花芯|蜜口|秘花|陰唇|潮を(?:噴|吹)|潮が(?:噴|吹)|潮吹/;
  var INS = /挿れ|挿入|貫|突き入|突き上げ|突き込|腰を(?:打ちつけ|打ち付け|沈め|落と|振|叩きつけ|使)|繋が[っりるれ]|抜き差し|ピストン|ノット|結腸|中に出|中出し|奥に(?:出|注|放|吐)|一つにな|ひとつにな|迎え入れ|咥え込|呑み込ん|飲み込ん|根元まで|最奥|奥まで|奥を(?:突|抉|叩|打|穿|擦|責|押し上げ)|奥へ|奥に届|中を(?:突|抉|掻き回|擦|穿)|ナカ|穿|(?:奥|中)(?:に|まで|へ)[^。、]{0,6}入っ|全部、?入|律動|打ちつけ|打ち付け|突かれ|突いて|突く|一突き|沈め|沈み込|揺さぶ|(?:奥|中|ナカ)で(?:果て|弾け|脈打)|(?:中|奥)に[^。、]{0,8}(?:吐き出|放っ|放た|出し|出され)|抜こうと|抜けそう|抜けかけ|引き抜|腰を引|腰を(?:前後|上下)(?:に|させ|へ)/;
  /* 体の内側（受けの体の中）を書いた語。口・喉・心・部屋など、体の中でない「中・奥」は除く */
  var INNER = /(?<!口の|喉の|心の|胸の|頭の|腕の|部屋の|布団の|毛布の|闇の|夢の|目の|瞳の|体の|森の|箱の|壁の|人の|水の|湯の|声の|記憶の|ベッドの|車の|店の|家の|町の|村の|洞窟の|迷宮の|檻の|籠の|穴の|闇|暗がりの|霧の|袋の|服の|下着の|スカートの|シャツの|手の|掌の|指の|口|頭|心|胸|山|森|背|夜|喉|目|腕|部屋|箱|家|店|町|街|村|途|最|真ん|世の|水|夢|闇の|霧|雨|空|日|年|話の|文の|列の|群れの|人ごみの|人混みの|輪の|皆の|みんなの|仲間の|二人の|三人の|その|この|あの|どの)(?:中|奥)(?:が|を|で|まで|へ|、|に(?!は))|内側|入り口|入口|締めつけ|締め付け|締め上げ|搾|形に馴染|形を覚え|当たって|当たる|擦り上げ|ざらつ/;
  var TOOL = /指|玩具|張り型|張形|ディルド|バイブ|ローター|器具|舌/;
  var ORAL = /口の中|口内|口に|口を|喉|咥え(?!込)|しゃぶ|唇/;
  var STRONG = /奥まで|最奥|奥を|奥に|奥へ|根元まで|中に出|繋が|貫|ナカ/;
  /* 文が none の人の場面にふさわしくないか。top＝none の人が攻め */
  NG.bad = function (sen, top, sexy) {
    if (sexy === false) return false;
    var s = String(sen).replace(NONSEX, '＿');
    if (MALE.test(s) || MALE2.test(s) || FEM.test(s)) return true;
    /* 受けの none の人から精を採った量（常識改変の「12ml」など）は書かない */
    if (!top && /\d+\s*ml|\d+ミリ/.test(s)) return true;
    if (INS.test(s) || INNER.test(s)) {
      if (top && TOOL.test(s)) return false;
      if (!top && ORAL.test(s) && !STRONG.test(s.replace(/喉の奥|口の奥|口の中/g, '＿'))) return false;
      return true;
    }
    return false;
  };
  /* その人の体を、男性器・女性器のある体で書いた文か（none の人に使う） */
  NG.own = function (sen, nm) {
    var e = nm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    return new RegExp(e + '(?:の|自身の)(?:もの|モノ|昂り|先端|根元)(?:が|を|は(?!な)|で(?!は|す|あ)|に(?!な|し|す)|から)').test(sen) ||
      new RegExp(e + 'の前(?:を|が)[^。]{0,10}(?:扱|握|しご|擦|包|咥|舐)').test(sen) ||
      new RegExp(e + '(?:は|が|も)[^。「」]{0,30}?(?:扱かれ|しごかれ|根元を(?:締め|握)られ|勃起|愛液を|潮を吹|蜜を溢れ|蜜を垂ら)').test(sen) ||
      new RegExp(e + '(?:の|自身の)[^。、「」]{0,10}?(?:硬く|固く|張りつめ|張り詰め|反り返|勃ち上が|そそり立|濡れた奥|濡れそぼ|愛液)').test(sen);
  };
  /* 性的な場面か：はっきりした語が二つ以上か、それだけで性的と分かる語が一つ */
  var VSTRONG = /ちんぽ|ちんこ|ペニス|陰茎|肉棒|男根|亀頭|精液|中出し|フェラ|裏筋|鈴口|先走り|膣|まんこ|蜜壺|秘裂|割れ目に|花芯|愛液|前立腺|クリを|クリが|媚薬|射精|果てそう|果てる(?!こと|まで|とも|と思)|精液|挿れ|挿入|絶頂|♡|喘|イく|イっ|イか|ちんぽ|膣|秘所|おまんこ|ノット|種付け|中に出|果て(?:た|て)|咥え|しゃぶ|愛撫|舐め(?:回|上げ|られ|させ)|快感|快楽|犯され|貫かれ/;
  /* 一つでも挿入・性器の場面と分かる語 */
  var EXPL = /の奥を(?:突|抉|擦|叩)|腰を落とし[^。]{0,16}(?:揺ら|沈|呑|咥|繋|動|擦)|(?:の|が)(?:中|奥|ナカ)で(?:果て|弾け|脈打)|熱が[^。]{0,10}(?:中|奥)で|(?:喉|奥|中)(?:の奥)?まで迎え入れ|扱かれ|搾られ|果て続け|\d+ml|採取|根元まで|での繋がり|(?:ゆっくりと|上から|深く|自分から|正確に|静かに|そのまま)腰を落と|打ちつけ(?:始め|た|て|る)|打ち付け|奥まで(?:沈|押し入|突|貫|届|埋|呑|入|暴|犯)|奥まで、?[^。]{0,12}(?:沈め|突き入|押し入)|器官を[^。]{0,16}沈め|体の奥まで(?:探|潜|入|届|這)|小刻みに奥を突|押し入っ|押し入れられ|腰を(?:沈め|打ちつけ|打ち付け|振)|深く(?:腰を|沈め|突|貫)|突き上げ|繋がった|繋がって|繋がり合|深く繋が|繋がると|先走り|竿|花芯|挿れ|貫い|貫か|中に出|注がれ|注ぎ込|ナカ|膣|秘所|射精|精液|ちんぽ|肉棒|ねじ込|搾り取|扱き(?:上げ|ながら|続け|立て)|扱いて|扱いた|しごい|しごか|抜き差し|ピストン|子宮|結腸/;
  NG.ownStrict = function (t, nm) {
    var e = nm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    return new RegExp(e + '(?:の|自身の)(?:もの|モノ)(?:が|を|は|で|に)(?=[^。]{0,16}(?:包|握|扱|しご|咥|舐|擦|撫|吸|脈|硬|張|反り|跳|震|弾|放|濡|勃|根元|先|跨|呑|沈|迎え))').test(String(t).replace(NONSEX, '＿'));
  };
  NG.sexS = function (x) { var c = String(x).replace(NONSEX, '＿'); return VSTRONG.test(c) || EXPL.test(c) || SEXT.test(c) || FEM.test(c) || MALE.test(c); };
  NG.sexy = function (t) {
    var c = String(t).replace(NONSEX, '＿');
    if (VSTRONG.test(c) || EXPL.test(c) || FEM.test(c) || MALE.test(c)) return true;
    var m = c.match(new RegExp(SEXT.source, 'g'));
    return !!(m && m.length >= 2);
  };
  /* 住人でない相手（モブ・魔物など）の呼び方を文から拾う */
  var MOB_W = /巨体|触手|スライム|生命体|オーク|ゴブリン|魔物|獲物|客たち|客|男たち|男|村人たち|村人|神|インキュバス|サキュバス|淫魔|悪魔|看守|施術師|マッサージ師|スタッフ|相手/;
  /* 箱庭が用意した相手（宇宙船の星の生命体・サキュバスの獲物・常識改変の客）の名前 */
  var MOBN = null;
  function mobNames() {
    if (MOBN) return MOBN;
    MOBN = [];
    try { var SB = HK.SUCCUBUS; if (SB && SB.PREY) Object.keys(SB.PREY).forEach(function (k) { if (SB.PREY[k] && SB.PREY[k].name) MOBN.push(SB.PREY[k].name); }); } catch (e) { }
    try { var KH = HK.KAIHEN; if (KH && KH.SIT) Object.keys(KH.SIT).forEach(function (k) { (KH.SIT[k].npc || []).forEach(function (nm) { if (nm) MOBN.push(nm); }); }); } catch (e) { }
    try { var SH = HK.SHIP; if (SH && SH.LIFE) SH.LIFE.forEach(function (x) { if (x && x.name) MOBN.push(x.name); }); } catch (e) { }
    MOBN.sort(function (a, b) { return b.length - a.length; });
    return MOBN;
  }
  function mobName(t) {
    t = String(t);
    var l = mobNames(), best = null, bi = Infinity;
    l.forEach(function (nm) { var i = t.indexOf(nm); if (i >= 0 && i < bi) { bi = i; best = nm; } });
    if (best) return best;
    var m = t.match(MOB_W); return m ? m[0] : '相手';
  }
  function hasMob(t) { t = String(t); return MOB_W.test(t) || mobNames().some(function (nm) { return t.indexOf(nm) >= 0; }); }
  /* 文の分け方：「」の中の句点で切らない。改行は一つの区切りとして残す（つなげ直すと元の本文に戻る） */
  function sents(t) {
    t = String(t);
    var out = [], cur = '', d = 0;
    for (var i = 0; i < t.length; i++) {
      var ch = t[i];
      if (ch === '\n') {
        if (cur) { out.push(cur); cur = ''; }
        if (out.length && /^\n+$/.test(out[out.length - 1])) out[out.length - 1] += ch; else out.push(ch);
        d = 0; continue;
      }
      cur += ch;
      if (ch === '「') d++;
      else if (ch === '」') { if (d > 0) d--; if (d === 0 && !/[、と――っ。！？]/.test(t[i + 1] || '') && t[i + 1] !== undefined && /^[^「]{0,14}「/.test(cur)) { out.push(cur); cur = ''; } }
      else if (d === 0 && /[。！？]/.test(ch) && !/[」。！？]/.test(t[i + 1] || '')) { out.push(cur); cur = ''; }
    }
    if (cur) out.push(cur);
    return out;
  }
  NG.sents = sents;
  function kindOf(sen) {
    if (/果て|達し|イ[っかく]|絶頂|弾け|射精|注|吐き出|放っ/.test(sen)) return 'climax';
    if (/翌朝|朝にな|終わった|事後|身支度|熱が引|余韻/.test(sen)) return 'after';
    if (/押し倒|脱が|唇を奪|ボタン|ホック|服を|下着/.test(sen)) return 'open';
    return 'body';
  }
  NG.stat = { n: 0, whole: 0 };
  var SOLO = { hole: 1, kaihen: 1, saimin: 1, massage: 1, succubus: 1, variety: 1 };
  /* 一つの文を差し替える（{a}＝攻め・{b}＝受けの名前で埋めて返す） */
  function replaceSen(ctx, sen, k, A, B, aName, bName, used) {
    NG.stat.n++;
    var ab = NG.bodyOf(A), bb = NG.bodyOf(B), at = B && B.name ? att(B) : 'gentle', arr;
    var q = sen.match(/^([^「」。]{0,12})「([^」]*)」[。]?$/);
    if (q) {
      /* 台詞だけの文：話し手の役で言い換える */
      var spk = q[1], isB = bName && spk.indexOf(bName) >= 0;
      var l = isB ? SAY.B : SAY[k === 'oral' ? 'oralA' : 'handA'];
      return spk + '「' + ctx.pick(l) + '」';
    }
    var kd = kindOf(sen);
    if (k === 'wall') arr = kd === 'climax' ? WALL_C : WALL_B;
    else if (kd === 'climax') arr = (k === 'oral' ? CLIMAX_O : CLIMAX_H)[at] || CLIMAX_O.gentle;
    else if (kd === 'after') arr = AFTER;
    else if (kd === 'open') arr = k === 'oral' ? OPEN : OPEN_H;
    else arr = k === 'oral' ? BODY_O[ab] || BODY_O.x : BODY_H[bb] || BODY_H.x;
    var cand = arr.filter(function (x) { return !used[x]; }), c2 = cand.length ? cand : arr;
    var r = HK.Ero && HK.Ero.fresh && ctx.S ? HK.Ero.fresh(ctx.S, c2, ctx.pick) : ctx.pick(c2);
    used[r] = 1;
    return r.replace(/\{a\}/g, aName).replace(/\{b\}/g, bName);
  }
  /* 本文 text を見直す。cs＝住人（input.chars）、Ns＝none の住人 */
  NG.fixText = function (ctx, text, cs, Ns) {
    if (typeof text !== 'string' || !text) return text;
    var hit = Ns.filter(function (n) { return n.name && text.indexOf(n.name) >= 0; });
    if (!hit.length) return text;
    var sexy = NG.sexy(text), out = text;
    /* 性的な場面でない本文は変えない（「島の奥まで」「釣り竿」のような、ふだんの文を書き換えない）。
       ただし「〇〇のものを包んだ・握った」のように、none の人を竿のある体で書いた文だけは直す */
    if (!sexy && !hit.some(function (N) { return NG.ownStrict(text, N.name); })) return text;
    var named = cs.filter(function (c) { return c.name && text.indexOf(c.name) >= 0; });
    hit.forEach(function (N) {
      var others = named.filter(function (c) { return c !== N && c.name.indexOf(N.name) < 0 && N.name.indexOf(c.name) < 0; });
      var whole = others.length <= 1, list = sents(out), bad = [], roles = [];
      /* その人が場面に加わっているか：名前の出る文のどれかが性的な文（名前が出てくるだけの人の場面にはしない） */
      /* 一人ずつの場面が中心の箱庭（感覚遮断穴・常識改変・催眠・マッサージ・サキュバス・バラエティ）は、名前が出れば本人の場面 */
      if (!((others.length === 0 || SOLO[ctx.scen]) && sexy) && !list.concat(String(out).split(/(?<=[。！？\n])/)).some(function (x) { return x.indexOf(N.name) >= 0 && (NG.sexS(x) || NG.ownStrict(x, N.name)); })) return;
      list.forEach(function (sen, i) {
        if (/^\n+$/.test(sen) || (!whole && sen.indexOf(N.name) < 0)) return;
        /* N の名前がなく、ほかの none の住人の名前がある文は、その人の見直しに任せる */
        if (sen.indexOf(N.name) < 0 && others.some(function (c) { return P.noGen(c) && sen.indexOf(c.name) >= 0; })) return;
        var inS = others.filter(function (c) { return sen.indexOf(c.name) >= 0; }), Q = inS.length === 1 ? inS[0] : whole && others.length === 1 ? others[0] : null;
        /* 体の関係になれない組（P.okSex が通らない）の相手は、住人ではなくモブとして書く */
        if (Q && !P.okSex(N, Q)) Q = null;
        var top;
        if (Q) { var o = P.order(N, Q, [N, Q]); top = o[0] === N; }
        /* モブが相手：攻め指定（モブには受けでない）なら攻め。文の中で none の人が自分から挿れる書き方なら攻めとして扱う */
        else top = P.hardTopNpc(N) || new RegExp(N.name + '(?:は|が)[^。「」]{0,30}?(?:貫い|突き入れ(?!られ)|挿れ(?!られ)|腰を(?:振っ|打ちつけ)(?!られ)|中に出し|射精し|注ぎ込ん|沈めて|沈めた|押し入っ|ねじ込ん)').test(sen);
        var own = sexy ? NG.own(String(sen).replace(NONSEX, '＿'), N.name) : NG.ownStrict(sen, N.name);
        roles[i] = { top: top, Q: Q };
        if (own || NG.bad(sen, top, sexy)) bad.push(i);
      });
      if (!bad.length) return;
      /* 相手：悪い文に名前が出る住人。出ないときは、悪い文にモブ・魔物の語があればモブ、なければ本文のもう一人 */
      var badTxt = bad.map(function (i) { return list[i]; }).join(''), named2 = others.filter(function (c) { return badTxt.indexOf(c.name) >= 0; });
      /* 悪い文に名前がなければ、性的な文に名前が出る住人（一人だけのとき）。それもなければモブ・魔物が相手 */
      var sexTxt = list.filter(function (x) { return SEXT.test(String(x).replace(NONSEX, '＿')); }).join(''), named3 = others.filter(function (c) { return sexTxt.indexOf(c.name) >= 0; });
      var Q = named2.length ? named2[0] : hasMob(badTxt) ? null : named3.length === 1 ? named3[0] : null;
      if (Q && !P.okSex(N, Q)) Q = null;
      var top;
      if (Q) top = P.order(N, Q, [N, Q])[0] === N;
      else top = P.hardTopNpc(N) || bad.some(function (i) { return roles[i].top && !roles[i].Q; });
      var A, B, aName, bName, k;
      if (Q) { A = top ? N : Q; B = top ? Q : N; aName = A.name; bName = B.name; k = NG.kind(A, B) || (top ? 'hand' : 'oral'); }
      else {
        var mn = mobName(list.slice(bad[0], bad[bad.length - 1] + 1).join('')), mn0 = mobName(out);
        if (mn === '相手' && mn0 !== '相手') mn = mn0;
        /* 人の男性（客・獲物・村人など）は竿のある体、人でない相手は c、何か分からない相手は指と舌（x） */
        var mk = mn === '相手' ? 'x' : /触手|スライム|魔物|蔦|植物|生命体|巨体|蝶|竜|虫|獣|エイ|クラゲ|粘液|群れ/.test(mn) || (HK.SHIP && HK.SHIP.LIFE && HK.SHIP.LIFE.some(function (x) { return x && x.name === mn; })) ? 'c' : 'm';
        var mob = { name: '', gender: 'm', _kind: mk };
        if (top) { A = N; B = mob; aName = N.name; bName = mn; k = 'hand'; }
        else { A = mob; B = N; aName = mn; bName = N.name; k = 'oral'; }
      }
      /* 感覚遮断穴で none の人が受けるとき：壁の向こうは口が届かないので、肌を撫でるところまで */
      if (ctx.scen === 'hole' && B === N) k = 'wall';
      var fill = function (t) { return t.replace(/\{a\}/g, aName).replace(/\{b\}/g, bName); };
      /* 場面そのもの（悪い文が二つ以上・長い場面）は、最初と最後の悪い文のあいだを、口・指と玩具の場面にまとめて差し替える */
      if (sexy && (bad.length >= 2 || text.length >= 200)) {
        NG.stat.whole++;
        var i0 = bad[0], i1 = bad[bad.length - 1], pre = list.slice(0, i0).join(''), suf = list.slice(i1 + 1).join('');
        var para = /\n\n/.test(list.slice(i0, i1 + 1).join('')) || /\n\n/.test(text) && list.slice(i0, i1 + 1).join('').length > 150;
        var mid;
        if (para) {
          mid = NG.scene({ S: ctx.S, pick: ctx.pick, rng: ctx.S.rng, a: A, b: B, kind: k, ero: ctx.ero, open: /\S/.test(pre) ? false : null, after: /\S/.test(suf) ? false : null }).text;
          if (ctx.ero && HK.Ero && HK.Ero.fill) mid = HK.Ero.fill(ctx.S, mid, B);
          mid = fill(mid);
          if (/\S/.test(pre) && !/\n$/.test(pre)) mid = '\n\n' + mid;
          if (/\S/.test(suf) && !/^\n/.test(suf)) mid += '\n\n';
        } else {
          mid = fill(NG.short({ S: ctx.S, pick: ctx.pick, rng: ctx.S.rng, a: A, b: B, kind: k }));
        }
        out = pre + mid + suf;
        return;
      }
      var used = {};
      bad.forEach(function (i) { var R = roles[i], A2 = A, B2 = B, k2 = k, an = aName, bn = bName; if (R.Q && R.Q !== Q) { A2 = R.top ? N : R.Q; B2 = R.top ? R.Q : N; an = A2.name; bn = B2.name; k2 = NG.kind(A2, B2) || (R.top ? 'hand' : 'oral'); } list[i] = replaceSen(ctx, list[i], k2, A2, B2, an, bn, used); });
      out = list.join('');
    });
    return out;
  };
  NG.review = function (res, input) {
    if (HK.SAFE_ON || !res || !input) return res;
    var cs = P.withIdx(input.chars || []), Ns = cs.filter(function (c) { return P.noGen(c); });
    if (!Ns.length) return res;
    var rng = HK.rng ? HK.rng(((input.seed || 1) * 4513 + 71) >>> 0) : null;
    var S = { rng: rng || { int: function (n) { return Math.floor(Math.random() * n); } } };
    var ero = !!(input.env && input.env.style === 'ero');
    /* 同じ回の本文にもう出ている文（箱庭の山場で使った文）は、差し替えの候補から外す */
    var big = (res.log || []).map(function (e) { return e && typeof e.text === 'string' ? e.text : ''; }).join('\n');
    var seg = function (x) { var l = String(x).split(/\{[^}]+\}/), b = ''; l.forEach(function (y) { if (y.length > b.length) b = y; }); return b.length >= 8 ? b : ''; };
    var rp = function (a) { return a[rng ? rng.int(a.length) : Math.floor(Math.random() * a.length)]; };
    var ctx = { S: S, ero: ero, scen: input.scenId || '', pick: function (a) { var f = a.filter(function (x) { var k = typeof x === 'string' ? seg(x) : ''; return !k || big.indexOf(k) < 0; }); var r = rp(f.length ? f : a); if (typeof r === 'string') big += '\n' + r.replace(/\{[^}]+\}/g, '|'); return r; } };
    (res.log || []).forEach(function (e) { if (e && typeof e.text === 'string') { var t0 = e.text; e.text = NG.fixText(ctx, e.text, cs, Ns); if (NG.debug && t0 !== e.text) NG.debug.push({ before: t0, after: e.text }); } });
    if (res.ending && Array.isArray(res.ending.lines)) res.ending.lines = res.ending.lines.map(function (l) { return typeof l === 'string' ? NG.fixText(ctx, l, cs, Ns) : l; });
    (res.chars || []).forEach(function (c) { if (c && typeof c.fateNote === 'string') c.fateNote = NG.fixText(ctx, c.fateNote, cs, Ns); });
    return res;
  };

  var sim0 = HK.simulate;
  if (!sim0) return;
  HK.simulate = function (input) {
    var res = sim0.apply(this, arguments);
    try { NG.review(res, input); } catch (err) { /* 見直しに失敗しても結果は返す */ }
    return res;
  };
  for (var k in sim0) if (Object.prototype.hasOwnProperty.call(sim0, k)) HK.simulate[k] = sim0[k];
})();
