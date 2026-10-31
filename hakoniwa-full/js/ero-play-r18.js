/* @event-ok 既にある山場（出られない部屋・媚薬ロッカー・オメガバース・合コン／無人島／ゾンビの共通の夜）に、前立腺・結腸・乳首・喉奥の段を差し込む（2026-10-31 担当E1） */
/* 箱庭シミュレーター（R18版のみ）: プレイ幅の増強 ― 前立腺いじり・結腸責め（奥）・乳首責め・イラマチオ（喉奥）の段（HK.EroPlay）
   ■ 何をするか：共通の山場（thick-sex.js の HK.ThickSex.scene・thick-sex-ero.js の HK.ThickEro.scene・omega-thick-kit.js の HK.TKC.body）が
     最後に呼ぶ「種族のプレイの差し込み口」HK.Attr.raceWeave(段落の配列, 攻め, 受け, pick, 段の番号) を HK.wrap で包み、
     前戯の段のあと・繋がる段のあとに新しい段落を差し込み、果てる段の頭に一文を足す。媚薬ロッカーのベッド（solo-locker-bed.js）は
     HK.Attr.racePlay（fore／mid／climax）を包んで同じ段を差す。既存の文は消さない。
   ■ どのプレイが出るか（設定は足さない。今ある設定だけで決める。対応表は docs/reports/2026-10-31/ero-play.md）：
     ・夜の性格の種類（HK.Attr.nightKind：sadist／maso／mean／sweet／shy。無ければ A.nightOf から）と、態度（HK.Attr.nightAtt：
       proud／stern／tsun／gentle／devoted／cool／free／shy／polite。夜の性格で選んだ態度か、気質から）の二軸で、
       起こりやすさ・プレイの種類・攻めの進め方（manner）・受けの反応（react）・受けの台詞を書き分ける。
     ・夜の主導（誘い受け・襲い受け）・性欲の強さ・関係（恋人・体だけ）・描写の濃さ・その場の熱（媚薬ロッカー・発情）・同じ夜の二度目以降 で起こりやすさが上がる。
     ・解剖：前立腺は受けに男性器があり女性器がないとき（男×男・ふたなり×男・女攻め×男）。結腸は攻めに男性器があり、受けが男性器だけのとき（後ろで繋がる）。
       乳首は全部の組（男×女・女×女・女攻め×男・男×男）。喉奥は攻めに男性器があるとき（男×女・男×男・ふたなり×女・男）。女性器の受けに結腸は書かない。
     ・合意：喉奥と結腸は、受けの夜の性格が mean（強がり）のときは合意の場面では起こさない。shy は怖がりながら頷く形。
       合意のない場面（HK.Pos.forcing() の中）では、内容のスイッチ「合意のない展開」が入で、攻めの夜の性格が sadist のときだけ、強いられる喉奥の段を出す（ほかのプレイは出さない）。
       「暴力をともなう性描写」が切なら痛めつける文（押さえつける・乱暴に掴む）を足さない。
     ・一回の場面に 1〜2 種。同じ二人の続く場面では、前の場面と同じプレイを選ばない。
     ・どの段にも「きっかけの一文」（誰が言い出したか・その理由＝夜の性格・主導・性欲・関係・熱・二度目）を入れる。
   ■ 乱数：本筋の乱数（ctx.rng）は使わない（入力の seed・二人の名前・場面の番号から作る別の乱数）。差し込まない回の結果は、これまでとまったく同じ
   ■ 入口（一人用・物語型の担当が使う）：
     HK.EroPlay.plan(T, U, o) … { keys:[…], init:'a'|'b', why } か null（o = { ero, scen, force, heat:'drug'|'omega'|'', rel, nth, lewd, rng }）
     HK.EroPlay.build(T, U, plan, o) … { fore:[段落], mid:[段落], peak:'' }（{a}＝攻め・{b}＝受け のまま。喘ぎは埋めてある）
     HK.EroPlay.weave(arr, T, U, idx, o) … 段落の配列 arr に差し込む（idx = { fore, mid, climax }。plan と build を中で呼ぶ）。差し込んだ plan を返す
     HK.EroPlay.paint(t, T, U, ph) … {a}{b} を ph（'ab'／'TU'／'name'）に合わせて置き換える
     HK.EroPlay.SCEN … 段を差し込む箱庭の id（一人用・物語型を足すときはここに足す）。HK.EroPlay.log … 配列を入れると記録（計測・点検用）
   全年齢版にはこのファイルはない。登場人物はすべて成人として扱う */
(function () {
  'use strict';
  var HK = window.HK;
  if (!HK || !HK.Attr) return;
  function L(s) { return s.split('|'); }
  var EP = HK.EroPlay = HK.EroPlay || {};
  EP.SCEN = { whiteroom: 1, locker: 1, omega: 1, goukon: 1, island: 1, zombie: 1 };
  EP.log = null;
  var ATTS = ['proud', 'stern', 'tsun', 'gentle', 'devoted', 'cool', 'free', 'shy', 'polite'];
  var KINDS = ['sadist', 'maso', 'mean', 'sweet', 'shy'];

  /* ---------- 夜の性格の二軸（E4 の窓口が無いときは同じ意味の代替） ---------- */
  function kindOf(a, b) {
    var A = HK.Attr;
    if (A.nightKind) return A.nightKind(a, b) || '';
    var v = A.nightOf ? A.nightOf(a, b) : '';
    return KINDS.indexOf(v) >= 0 ? v : '';
  }
  function attOf(a, b) {
    var A = HK.Attr;
    if (A.nightAtt) { var w = A.nightAtt(a, b); if (ATTS.indexOf(w) >= 0) return w; }
    var v = A.nightOf ? A.nightOf(a, b) : '';
    if (ATTS.indexOf(v) >= 0) return v;
    var p = HK.personaOf ? HK.personaOf(a) : a && a.persona;
    return ATTS.indexOf(p) >= 0 ? p : 'gentle';
  }
  /* 相手に合わせる（相手の嗜好に付き合っている）：E4 の窓口 HK.Attr.nightAccom。無ければ生の値が 'match' */
  function accomOf(a, b) {
    var A = HK.Attr;
    if (HK.SAFE_ON || !a) return false;
    if (A.nightAccom) return !!A.nightAccom(a, b);
    var v = (b && b.i != null && a.nightFor && a.nightFor[b.i]) || a.night || (a.src && a.src.night) || '';
    return v === 'match' && !!kindOf(a, b);
  }
  EP.kindOf = kindOf; EP.attOf = attOf; EP.accomOf = accomOf;
  /* 攻めの進め方の列：夜の性格の種類（sadist・mean・sweet・shy）か、態度 */
  function mKey(T, U) { var k = kindOf(T, U); return k && k !== 'maso' ? k : attOf(T, U); }
  /* 受けの反応の列：夜の性格の種類（maso・sweet・shy・mean。sadist の受けは強がりの mean）か、態度 */
  function rKey(U, T) { if (accomOf(U, T)) return attOf(U, T); var k = kindOf(U, T); return k === 'sadist' ? 'mean' : k || attOf(U, T); }
  EP.mKey = mKey; EP.rKey = rKey;

  /* ---------- 文 ---------- */
  /* {a}＝攻め {b}＝受け {mb}＝受けの喘ぎ（最中） {md}＝奥を突かれた喘ぎ {mg}＝喉を塞がれた声（「」込み） {s:…}＝擬音（男性向け） {bust}＝胸の語 {spot}＝責める場所 */
  var D = {};
  D.pros = {
    fore: {
      mm: {
        n: L('{a}は濡らした指を{b}の{後ろ}にあてがい、ゆっくりと沈めていった。浅いところを探るように指の腹を曲げると、ある一点で{b}の腰がびくりと跳ねた。{a}はそこを覚えるように、同じ場所をもう一度、そっと押し上げた。|' +
          '{a}は{b}の{男性器}を片手で緩く扱きながら、もう片方の指で{後ろ}の内側を探っていった。指の第二関節まで沈めたところで、こりこりとした膨らみが指先に触れる。そこを撫でた途端、{b}の{男性器}の先から、とろりと{先走り}がこぼれた。|' +
          '{a}は二本の指で{b}の{後ろ}をほぐしながら、内壁の向こうにある{前立腺}を探し当てた。指の腹で円を描くように撫でると、{b}の膝がシーツの上で勝手に開いていく。声を噛み殺そうとする{b}の喉が、小さく震えた。'),
        e: L('{a}はローションをたっぷり絡めた指を、{b}の{後ろ}にぬぷりと沈めた。{s:wet}。くいっと指を曲げた瞬間、{b}の腰がびくんっと跳ね上がる。{a}は見つけたしこりを、指の腹でぐりぐりと押し潰した。|' +
          '{a}は{b}の{男性器}をしゃぶりながら、指を二本{後ろ}に咥えさせた。{s:suck}。{前立腺}をとんとんと叩くたびに、口の中の{男性器}がびくびくと跳ねて{先走り}を溢れさせる。{a}は咥えたまま、指の動きだけを速めていった。')
      },
      fm: {
        n: L('{a}は{b}の脚のあいだに身を沈め、{男性器}に唇を寄せながら、濡らした指を{b}の{後ろ}へ滑らせた。戸惑う{b}をなだめるように、指はゆっくりと奥を探っていく。やがて指先が小さな膨らみを捉えると、{b}の{男性器}が{a}の唇の中で大きく脈打った。|' +
          '{a}は{b}に脚を開かせ、内腿に口づけながら、細い指を一本ずつ{後ろ}に沈めていった。指の腹がある場所をかすめるたび、{b}の喉から押し殺した声がこぼれる。{a}は顔を上げ、{b}の表情が変わる場所を確かめるように、何度もそこを撫でた。'),
        e: L('{a}は{b}の{男性器}をじゅぽじゅぽとしゃぶりながら、指を{後ろ}にぬるりと沈めた。{s:suck}。指先が{前立腺}を探り当てた瞬間、{b}の{男性器}が口の中でびくんっと跳ねる。{a}は咥えたまま目を細め、そこばかりを指で押し上げた。|' +
          '{a}は{b}の脚を大きく開かせ、ひくつく{後ろ}に指を二本沈めた。{s:wet}。くいくいと指を曲げて{前立腺}を押し上げると、{b}の{男性器}の先から{先走り}がとぷとぷと溢れ出した。{a}は楽しそうに、同じ場所を何度も叩いた。')
      }
    },
    out: {
      n: L('{a}が指を引き抜くと、{b}は名残惜しそうに小さく息をこぼした。|指が抜けていく感触に、{b}の腰がもう一度だけ小さく震えた。'),
      e: L('{a}が指をずるりと引き抜くと、{b}の{後ろ}が物足りなさそうにひくついた。|ちゅぽっと指が抜けると、{b}は切なげに腰をくねらせた。')
    },
    mid: {
      mm: {
        n: L('{a}は{b}の腰の角度を少し変えさせ、浅いところをゆっくりと擦り上げた。指で覚えた場所を、今度は{男性器}の張り出したところで正確に抉っていく。突かれるたびに{b}の{男性器}が揺れ、触れられてもいないのに{先走り}を滴らせた。|' +
          '{a}は奥まで沈めるのをやめ、入口近くの一点だけを狙って、短く腰を揺らし始めた。{b}の内側がそのたびにきゅうっと締まり、背中が弓なりに反る。{b}の声は、さっきまでとはまるで違う、上ずった響きに変わっていた。'),
        e: L('{a}は{b}の腰を抱え直し、{亀頭}のカリで{前立腺}をごりごりと擦り上げた。{s:hit}。一突きごとに{b}の{男性器}がぶるんっと揺れ、{先走り}がシーツに糸を引く。{b}「{mb}」|' +
          '{a}は浅いところで小刻みに腰を揺らし、{前立腺}だけをとちゅとちゅと執拗に叩いた。{s:wet}。{b}の目は焦点を失い、半開きの口から涎がこぼれていく。{b}「{mb}」')
      },
      fm: {
        n: L('{a}は{b}の上でゆっくりと腰を沈めながら、後ろ手に伸ばした指を、もう一度{b}の{後ろ}へ潜り込ませた。腰を揺らすのに合わせて、指先が内側の膨らみを押し上げる。前と後ろを同時に責められて、{b}は{a}の下でどうしようもなく身をよじった。|' +
          '{a}は{b}に跨ったまま上体を倒し、{b}の脚のあいだへ指を滑り込ませた。{a}の{ナカ}に包まれたまま、{後ろ}の弱いところを指で撫でられて、{b}の腰が勝手に浮く。{a}はその反応を見下ろしながら、腰と指の動きをわざとずらしてみせた。'),
        e: L('{a}は{b}の{男性器}を{ナカ}に咥え込んだまま、後ろに回した指で{前立腺}をぐりぐりと押し潰した。{s:wet}。前も後ろも逃げ場がなくなり、{b}の腰ががくがくと震える。{b}「{mb}」|' +
          '{a}は腰をくねらせながら、{b}の{後ろ}に沈めた指をくいっと曲げた。{s:wet}。中で{男性器}がびくびくと膨らむのを、{a}は締めつけで受け止めて笑った。{b}「{mb}」')
      }
    },
    peak: {
      mm: {
        n: L('{b}は前に一度も触れられないまま、後ろだけで限界へ押し上げられていった。腰の奥から、知らない熱がせり上がってくる。|弱いところを擦られるのと同時に、{a}の手が{b}の{男性器}を包み込んだ。前と後ろから押し寄せる熱に、{b}はもう抗えなかった。'),
        e: L('{前立腺}をごりゅごりゅと潰され続け、{b}の{男性器}は触られてもいないのにびくびくと跳ね上がった。{b}は後ろだけで、{精液}をとろとろと押し出していく。|{a}が{前立腺}を抉るのと同時に、{b}の{男性器}をぎゅっと扱き上げた。前と後ろの快感が一気に弾け、{b}の頭の中が真っ白に塗りつぶされる。')
      },
      fm: {
        n: L('{a}の指が弱いところを押し上げた瞬間、{b}の腰がひときわ大きく跳ねた。{a}の{ナカ}に包まれたまま、{b}はなすすべもなく限界へ追い立てられていった。|{a}は腰を沈めきったまま、指で後ろの膨らみをゆっくりと撫で続けた。前と後ろから同時に押し寄せる熱に、{b}の喉が震えた。'),
        e: L('{a}が{前立腺}をぐりっと押し潰した瞬間、{b}の{男性器}が{a}の{ナカ}で大きく脈打った。{b}は指一本で、あっけなく限界まで押し上げられた。|{a}は締めつけながら、指で{前立腺}をとんとんと叩き続けた。前も後ろもぐちゃぐちゃにされて、{b}は{a}の下でがくがくと腰を震わせた。')
      }
    },
    /* 夜の性格の種類ごとの攻めの進め方（態度の列は共通の GEN_M） */
    m: {
      sadist: L('{a}は{b}が声を上げるたびに、わざと同じ場所ばかりを執拗に責め立てた。ここが弱いのだと分からせるように、逃げようとする腰を引き戻す。|{a}は{b}の耳元で、どこが感じるのかを一つずつ言わせるまで、その場所を責める手を止めなかった。'),
      mean: L('{a}はその場所に触れては離れ、{b}が腰を揺らしてねだるまで、わざと焦らし続けた。|{a}は弱いところのすぐ脇ばかりをなぞり、肝心なところには触れてやらなかった。'),
      sweet: L('{a}は{b}の顔色を確かめながら、少しでも強張ればすぐに力を緩めた。痛くないか、と囁く声はひどく優しかった。|{a}は{b}が息を詰めるたびに動きを止め、落ち着くのを待ってから、またそっと撫でた。'),
      shy: L('{a}はおそるおそる指を動かし、{b}の反応が大きくなるたびに、驚いたように手を止めた。|{a}は耳まで赤くしながら、それでも{b}の感じる場所を、確かめるように何度も探った。')
    },
    r: {
      maso: L('{b}はもっと強くと言うように、自分から腰を押しつけていった。|{b}は涙目になりながら、それでもやめないでほしいと首を振った。'),
      sweet: L('{b}は{a}の名前を何度も呼びながら、委ねるように体の力を抜いた。|{b}は{a}の背に腕を回し、感じるままに素直な声をこぼした。'),
      shy: L('{b}は真っ赤になった顔を腕で隠し、声を必死に飲み込もうとした。|{b}は知らない感覚に怯えたように、小さく首を振りながら{a}の腕にしがみついた。'),
      mean: L('{b}は悪態をつこうとして、こぼれた甘い声に自分で唇を噛んだ。|{b}は平気な顔を取り繕おうとしたが、跳ねる腰がすべてを裏切っていた。')
    },
    say: {
      maso: L('{b}「そこ、もっと……もっと強くして｜そこを、もっと……もっと強くしろ｜そこを、もっと……もっと強くしてください」'),
      sweet: L('{b}「そこ、気持ちいい……あなただから、全部いい｜そこが、気持ちいい……あなただから、全部いい｜そこ、気持ちいいです……あなただから、全部いいんです」'),
      shy: L('{b}「や、そこ……変になるから……｜や、そこは……変になる……｜や、そこは……変になってしまいます……」'),
      mean: L('{b}「べ、別に……そんなとこ、感じてない……っ｜べ、別に……そんなところ、感じていない……っ｜べ、別に……そんなところ、感じていません……っ」')
    },
    spot: '{b}の弱いところ'
  };
  D.colon = {
    mid: {
      mm: {
        n: L('{a}は{b}の腰を抱え込み、行き止まりのように感じる奥の、そのさらに先へとゆっくり体重をかけた。固く閉じていた最奥が、少しずつ{a}の{男性器}の形に押し開かれていく。{b}の喉から、息とも声ともつかない音が漏れた。|' +
          '{a}は根元まで沈めたまま動きを止め、{b}の奥がほどけるのをじっと待った。やがて抵抗が緩んだ瞬間、{亀頭}が{結腸}の入口をくぐり抜ける。{b}の体が、雷に打たれたように大きく跳ねた。|' +
          '{a}は{b}の脚を肩に担ぎ上げ、真上から深く体を沈めた。いつもなら届かない場所を、{a}の先端がこつこつとノックする。そのたびに、{b}の下腹がひくひくと痙攣した。'),
        e: L('{a}は{b}の腰を掴んで引き寄せ、行き止まりの奥をぐぽっとこじ開けた。{s:hit}。{結腸}の入口に{亀頭}がずっぽりとハマり、{b}の下腹がぴくぴくと痙攣する。{b}「{md}」|' +
          '{a}は根元まで沈めたまま、奥の奥をぐりぐりと抉った。{s:wet}。{結腸}をこじ開けられるたびに、{b}の目がとろんと焦点を失っていく。{b}「{md}」|' +
          '{a}は{b}をうつ伏せにさせ、上から体重をかけて{結腸}までどちゅどちゅと抜き差しした。{s:hit}。奥を突き抜かれるたびに、{b}の{男性器}からぴゅっぴゅっと透明な汁が飛び散る。{b}「{md}」')
      }
    },
    peak: {
      mm: {
        n: L('奥の奥を揺さぶられ続けて、{b}の意識は、どこまでが自分の体なのか分からないほど溶けていた。そのまま、深いところから大きな波がせり上がってくる。|{a}が最奥で動きを止めた瞬間、{b}の内側がうねるように{a}を締めつけた。このまま奥だけで果ててしまう――{b}がそう悟った時には、もう遅かった。'),
        e: L('{結腸}をぐぽぐぽと出入りされ、{b}はもう、イっているのかいないのかも分からなくなっていた。{b}の{男性器}からは、とろとろと{精液}が垂れ流しになっていく。|{a}が{結腸}の奥にぴったりと{亀頭}をハメたまま、腰をぐりぐりと押しつけた。{b}の下腹がびくびくと痙攣し、頭の中で何かがぷつりと焼き切れた。')
      }
    },
    m: {
      sadist: L('{a}は{b}の顎を掴んで顔を上げさせ、いまどこまで入っているのかを、一つずつ言葉で教え込んだ。|{a}は{b}が逃げようとするたびに腰を引き戻し、奥の奥まで自分を刻みつけた。'),
      mean: L('{a}は入口で止まり、{b}が泣きそうな声でねだるまで、最後の一押しをくれてやらなかった。|{a}は奥に届く寸前で引いては、また寄せて、{b}が焦れるのを楽しんでいた。'),
      sweet: L('{a}は少し進むたびに{b}の髪を撫で、苦しくないかと何度も確かめた。{b}が息を詰めると、すぐに動きを止めて待った。|{a}は{b}の呼吸に合わせて、ほんの少しずつ、奥への距離を縮めていった。'),
      shy: L('{a}は自分のしていることに戸惑うように、ほんの少し進んでは、{b}の顔色をうかがった。|{a}は震える声で大丈夫かと訊きながら、それでも奥へ進むのをやめられなかった。')
    },
    r: {
      maso: L('{b}はもっと奥まで欲しいと、自分から{a}の腰に脚を絡めて引き寄せた。|{b}は苦しさと快感の境目で、それでも嬉しそうに目を潤ませた。'),
      sweet: L('{b}は{a}にしがみついたまま、怖いくらいの深さを、まるごと受け止めようとした。|{b}は小さく頷き、{a}を迎え入れるように、そっと息を吐いて体を開いた。'),
      shy: L('{b}はあまりの深さに怯え、{a}の肩に顔を埋めて小さく震えた。|{b}はかすれた声で、そんなところまで、と呟いたきり、言葉を失った。'),
      mean: L('{b}は歯を食いしばって睨み返したが、奥を揺らされるたびに、その目がとろけていった。|{b}は悪態をつこうと口を開いたが、出てきたのは甘く濡れた声だけだった。')
    },
    say: {
      maso: L('{b}「もっと奥まで……あなたで、いっぱいにして｜もっと奥まで……あなたで、いっぱいにしろ｜もっと奥まで……あなたで、いっぱいにしてください」'),
      sweet: L('{b}「大丈夫……あなたなら、奥まで来ていいよ｜大丈夫だ……あなたなら、奥まで来ていい｜大丈夫です……あなたなら、奥まで来てください」'),
      shy: L('{b}「そ、そんな奥……こわい……｜そ、そんな奥まで……こわい……｜そ、そんな奥まで……こわいです……」'),
      mean: L('{b}「調子に、乗って……っ、そんな奥、まで……｜調子に乗るな……っ、そんな奥まで……｜調子に乗らないで……っ、そんな奥まで……」')
    },
    /* 「暴力をともなう性描写」が入のときだけ、sadist の攻めに足す一文 */
    rough: L('{a}は{b}の両手首をまとめて押さえつけ、許しを請う声さえ、奥への一突きで黙らせた。'),
    spot: '{b}の奥'
  };
  D.nip = {
    fore: {
      mf: {
        n: L('{a}は{b}の{bust}を手のひらで包み込み、指先で{乳首}の周りをゆっくりとなぞった。肝心なところには触れないまま、円を描く指が少しずつ中心へ近づいていく。やっと先端を摘ままれた瞬間、{b}の背中が小さく跳ねた。|' +
          '{a}は{b}の{乳首}に唇を寄せ、舌先で転がすように舐め上げた。もう片方は指の腹でこりこりと捏ねられ、{b}の息が乱れていく。硬く尖った先端を軽く吸われるたびに、{b}の腰が浮いた。'),
        e: L('{a}は{b}の{bust}を鷲掴みにし、ぷっくりと勃った{乳首}をきゅっと摘まみ上げた。くりくりと指先で転がされ、{b}の腰がびくびくと跳ねる。{b}「{mb}」|' +
          '{a}は{b}の{乳首}にしゃぶりつき、じゅるじゅると音を立てて吸い上げた。{s:suck}。もう片方の{乳首}は指でかりかりと引っかかれ、{b}の背中が弓なりに反り返る。{b}「{mb}」')
      },
      mm: {
        n: L('{a}は{b}の胸板に手を這わせ、小さな{乳首}を指先で探り当てた。最初はくすぐったそうに身をよじっていた{b}が、何度も擦られるうちに、息を詰めるようになっていく。尖りはじめた先端を爪の先でかすめると、{b}の喉から甘い声がこぼれた。|' +
          '{a}は{b}の胸に顔を寄せ、{乳首}を唇で挟んで、舌先でゆっくりと転がした。そんなところで、と戸惑う{b}の声が、すぐに乱れた息に変わっていく。{a}はもう片方を指で摘まみ、同じ速さで捏ね続けた。'),
        e: L('{a}は{b}の胸板の{乳首}を両手でかりかりと引っかいた。最初は平気そうだった{b}の腰が、だんだんびくびくと跳ね始める。{b}「{mb}」|' +
          '{a}は{b}の{乳首}にちゅうっと吸いつき、舌でれろれろと舐め回した。{s:suck}。じんじんと熱を持った{乳首}を甘噛みされ、{b}の{男性器}から{先走り}がとろりとこぼれる。{b}「{mb}」')
      },
      fm: {
        n: L('{a}は{b}の上に覆いかぶさり、{b}の胸に唇を落として、{乳首}を舌先でつついた。柔らかく吸われるたびに、{b}の胸が大きく上下する。{a}は{b}の顔を上目遣いに見上げながら、もう片方を指でそっと摘まんだ。|' +
          '{a}は{b}に跨ったまま、両手の指先で{b}の{乳首}を同時に撫で上げた。くすぐったさに笑いかけた{b}の声が、途中で甘く裏返る。{a}は楽しそうに目を細め、尖った先端をきゅっと摘まんだ。'),
        e: L('{a}は{b}に跨り、{b}の{乳首}を両手でくにくにと捏ね回した。{b}の{男性器}が{a}の下でびくびくと跳ね、{先走り}が溢れ出す。{b}「{mb}」|' +
          '{a}は{b}の{乳首}をぺろりと舐め上げ、ちゅぱちゅぱと音を立てて吸いついた。{s:suck}。もう片方を指先でぴんっと弾かれ、{b}の腰がシーツから浮き上がる。{b}「{mb}」')
      },
      ff: {
        n: L('{a}は{b}の{bust}に頬を寄せ、柔らかな膨らみの先の{乳首}を、唇でそっと挟んだ。同じ体だからこそ分かる触れ方で、{a}は先端をゆっくりと舌で転がす。{b}の指が、{a}の髪の中で強く握り込まれた。|' +
          '{a}は{b}の背後から腕を回し、両方の{乳首}を指先で同時に摘まんだ。耳元に息を吹きかけながら、くりくりと捏ねる指を止めない。{b}は{a}の腕の中で、逃げ場もなく身を震わせた。'),
        e: L('{a}は{b}の{bust}をむにゅむにゅと揉みしだき、{乳首}に吸いついた。{s:suck}。じゅるっと吸われては離され、ぷるんと揺れる先端を、また舌で弾かれる。{b}「{mb}」|' +
          '{a}は{b}の{乳首}を両手の指でつまみ、きゅうっと引っぱっては離した。{b}の腰がそのたびにびくんと跳ね、脚のあいだから{愛液}がとろりと伝う。{b}「{mb}」')
      }
    },
    /* 受けが自分で触る（繋がる段のあと）：受けの体（f＝女性の体・m＝それ以外） */
    self: {
      f: {
        n: L('揺さぶられながら、{b}は無意識に自分の{乳首}へ指を伸ばしていた。さっき教え込まれた触れ方で先端を摘まむと、体の奥がきゅっと締まる。そのことに気づいた{a}が、小さく息を呑んだ。|' +
          '{b}は{a}の手を取り、自分の胸の先へと導いた。触れてほしい場所を自分から教えるように、{a}の指に自分の指を重ねる。{a}がそこを摘まむと、{b}の体が応えるように震えた。'),
        e: L('{b}は揺さぶられながら、自分で{乳首}をくりくりと弄り始めた。{a}に見られていると分かっていても、指が止まらない。{b}「{mb}」|' +
          '{b}は自分の{bust}を両手で寄せ上げ、尖った{乳首}を{a}の口元へ差し出した。{a}がそれをじゅるっと吸い上げた瞬間、{b}の体がびくびくと跳ねる。{b}「{mb}」')
      },
      m: {
        n: L('{a}に揺さぶられながら、{b}は気づけば自分の{乳首}を指で捏ねていた。さっきまで{a}に弄られていた場所が、じんじんと疼いて止まらない。その手つきを見て、{a}は口の端を上げた。|' +
          '{b}は{a}の手首を掴み、もう一度自分の胸へ引き戻した。言葉にできない代わりに、触れてほしい場所を指で示す。{a}がそこを強く摘まむと、{b}の腰が大きく跳ねた。'),
        e: L('{b}は揺さぶられながら、自分の{乳首}をかりかりと引っかき始めた。{乳首}で感じる体にされてしまったことを、{b}の指が白状していた。{b}「{mb}」|' +
          '{b}は自分の{乳首}をぎゅっと摘まみ上げ、腰をびくびくと震わせた。{a}に弄られすぎて、もう触れただけで甘い痺れが走る。{b}「{mb}」')
      }
    },
    /* 胸だけで先に果てる（果てる段の頭） */
    peak: {
      f: {
        n: L('{a}が{乳首}を強く吸い上げた瞬間、{b}の体が小さく震えた。胸の先だけで、{b}は一度、軽く果ててしまっていた。|{乳首}を捏ねられ続けた{b}は、触れられているところとは別の場所から、ふわりと浮くような波に攫われた。その余韻が引かないうちに、本当の山場が押し寄せてくる。'),
        e: L('{a}に{乳首}をぎゅうっと引っぱられた瞬間、{b}は胸だけでびくびくっと甘イキした。とろけた顔のまま、{b}の腰がきゅんきゅんと痙攣を繰り返す。|{乳首}をかりかりと弄られ続けて、{b}の腰がかくかくと勝手に揺れ出した。{b}は{乳首}だけでイかされて、だらしなく舌を覗かせた。')
      },
      m: {
        n: L('{乳首}をきゅっと摘ままれた瞬間、{b}の腰がびくりと跳ねた。胸だけで達しかけた自分に、{b}は信じられないという顔をした。|{a}が{b}の{乳首}を甘く噛んだ。それだけで{b}の体がびくびくと脈打ち、波が一気に高くなった。'),
        e: L('{乳首}をきゅっと捻り上げられた瞬間、{b}の腰がびゅくっと跳ねた。{b}は胸だけでイかされたことに、真っ赤になって震えた。|{a}に{乳首}をじゅるっと吸われ、{b}の腰ががくがくと跳ね上がった。触られてもいないのに、体の奥からとろけるような痺れが溢れ出す。')
      }
    },
    m: {
      sadist: L('{a}は赤く腫れるまで{乳首}を責め立て、{b}がどんな顔をしているのかを、わざと言葉にして聞かせた。|{a}は{b}が身をよじるたびに先端を強く摘まみ直し、逃げることを許さなかった。'),
      mean: L('{a}は{乳首}のすぐ周りばかりをなぞり、{b}がねだるまで、先端には触れてやらなかった。|{a}は触れるか触れないかの指先で、{b}の胸の先をかすめては離した。'),
      sweet: L('{a}は{b}の表情を見つめながら、一番気持ちよさそうな強さを探すように、そっと触れ方を変えていった。|{a}は{b}がくすぐったそうにするとすぐに手を緩め、ゆっくりと時間をかけて慣らしていった。'),
      shy: L('{a}はおそるおそる指先を伸ばし、{b}が小さく声を漏らすたびに、慌てて手を止めた。|{a}は顔を真っ赤にしながら、それでも胸の先から目を離せずにいた。')
    },
    r: {
      maso: L('{b}はもっと強く摘まんでほしいと、自分から胸を差し出した。|{b}は痛いくらいの刺激にさえ、うっとりと目を細めた。'),
      sweet: L('{b}は{a}の頭を胸に抱き寄せ、されるがままに甘い息をこぼした。|{b}は恥ずかしそうに笑いながらも、{a}の触れ方に素直に応えた。'),
      shy: L('{b}は真っ赤になって胸元を隠そうとし、その手を{a}にそっとどけられた。|{b}は小さな声で、見ないで、と繰り返した。'),
      mean: L('{b}はくすぐったいだけだと言い張ったが、尖った先端がそれを裏切っていた。|{b}は唇を噛んで睨みつけたが、胸を弄られるたびに肩が跳ねた。')
    },
    say: {
      maso: L('{b}「もっと、強く……つねって｜もっと強く……つねれ｜もっと、強く……つねってください」'),
      sweet: L('{b}「あなたに触られると、そこ、すごく気持ちいい……｜あなたに触られると、そこがすごく気持ちいい……｜あなたに触られると、そこがすごく気持ちいいです……」'),
      shy: L('{b}「そ、そんなとこ……見ないで……｜そ、そんなところ……見ないでくれ……｜そ、そんなところ……見ないでください……」'),
      mean: L('{b}「くすぐったいだけだし……っ、調子に乗らないで｜くすぐったいだけだ……っ、調子に乗るな｜くすぐったいだけです……っ、調子に乗らないでください」')
    },
    spot: '{b}の胸の先'
  };
  D.throat = {
    core: {
      f: {
        n: L('{a}は膝をついた{b}の頬に、熱く張りつめた{男性器}をあてがった。{b}が唇を開くと、{a}はその後頭部に手を添えて、ゆっくりと奥へ進めていく。喉の入口を押し広げられて、{b}の目尻に涙が滲んだ。{mg}|' +
          '{b}は{a}の脚のあいだに跪き、{男性器}を根元まで呑み込もうと、自分から喉を開いた。息が詰まるほど深く迎え入れたまま、{b}は上目遣いに{a}を見上げる。喉の奥がひくひくと締まるたびに、{a}の息が乱れた。{mg}'),
        e: L('{a}は{b}の頭を両手で包み、{男性器}を喉の奥までずぶずぶと沈めた。{s:suck}。喉の奥をごりゅっと擦られるたびに、{b}の目から涙がぽろぽろとこぼれる。{mg}|' +
          '{b}は{a}の{男性器}を自分から喉奥まで咥え込み、ぐぽっ、ぐぽっと頭を前後させた。{s:suck}。涎と涙でぐちゃぐちゃの顔のまま、{b}は{a}を見上げて喉を締めつける。{mg}')
      },
      m: {
        n: L('{a}は寝台の縁に腰かけ、脚のあいだに膝をついた{b}の髪を梳くように撫でた。{b}が{男性器}を口に含むと、{a}は少しずつ、喉の奥へと腰を進める。{b}の喉が苦しげに鳴り、目尻から一筋、涙がこぼれた。{mg}|' +
          '{a}は{b}を仰向けに寝かせ、寝台の端から頭を少し落とさせた。まっすぐに伸びた喉へ、{a}の{男性器}がゆっくりと沈んでいく。{b}の喉が、{a}の形をなぞるように上下した。{mg}'),
        e: L('{a}は{b}の髪に指を絡めて引き寄せ、喉の奥まで{男性器}を沈めた。{s:suck}。えずくように震える喉の締めつけに、{a}は気持ちよさそうに息を吐く。{mg}|' +
          '{a}は仰向けにした{b}の喉へ、上から{男性器}をずっぽりと沈めた。{s:suck}。{b}の喉が{a}の形に膨らみ、苦しげな音が漏れる。{mg}')
      }
    },
    /* 合意のない場面（「合意のない展開」が入・攻めが sadist・HK.Pos.forcing() の中だけ） */
    force: {
      n: L('{a}は顔を背ける{b}の顎を掴み、{男性器}を喉の奥まで押し込んだ。{b}の手が{a}の腿を押し返したが、{a}は構わずに腰を進める。息を奪われた{b}の目から、涙がぼろぼろとこぼれた。{mg}|' +
        '{a}は{b}をその場に跪かせ、拒む唇を割って喉の奥を塞いだ。押し返そうとする舌さえ、{a}にとっては快楽の一部でしかなかった。{b}は苦しげに喉を鳴らすことしかできなかった。{mg}'),
      e: L('{a}は顔を背ける{b}の顎を掴み、{男性器}を喉奥までずぶりと押し込んだ。{s:suck}。押し返そうとする手をものともせず、{a}は喉の締めつけを味わうように腰を揺らす。{mg}|' +
        '{a}は{b}を跪かせ、拒む唇をこじ開けて喉奥までずっぽりと塞いだ。{s:suck}。息のできない{b}の喉が、{a}の{男性器}をぎゅうぎゅうと締めつける。{mg}')
    },
    end: {
      n: L('{a}がようやく腰を引くと、{b}は濡れた唇で大きく息を吸い込み、小さく咳き込んだ。|引き抜かれた瞬間、{b}は濡れた唇を震わせ、肩で荒く息をした。'),
      e: L('{a}がずるりと引き抜くと、{b}の唇と{男性器}のあいだに、涎がねっとりと糸を引いた。|{b}はけほけほと咳き込みながらも、とろけた目で{a}を見上げた。')
    },
    m: {
      sadist: L('{a}は{b}の後頭部を押さえたまま、喉が自分の形を覚えるまで離さなかった。苦しげに潤む目を見下ろして、{a}は満足そうに息を吐いた。|{a}はえずく{b}に、まだ半分しか入っていないと低く告げた。'),
      mean: L('{a}は奥まで入れる寸前で腰を止め、{b}が自分から呑み込みにくるのを、意地悪く待った。|{a}は浅いところで出し入れを繰り返し、{b}が焦れて喉を開くまで、決して奥へは進まなかった。'),
      sweet: L('{a}は{b}の髪を撫でながら、少しでも苦しそうなら、すぐに腰を引いた。{b}が頷くのを待ってから、またゆっくりと進めていく。|{a}は{b}の目に涙が浮かんだのを見て、すぐに動きを止めた。大丈夫だと{b}が目で伝えるまで、ただ頬を撫で続けた。'),
      shy: L('{a}は自分のしていることに頬を染め、{b}が少しでもむせると、慌てて腰を引いた。|{a}は苦しくないかと何度も小声で訊きながら、そっと腰を進めた。')
    },
    r: {
      maso: L('{b}は涙を浮かべながらも、もっと奥までと言うように、自分から頭を押しつけた。|{b}は苦しさに震えながら、{a}の脚にすがりついて離れなかった。'),
      sweet: L('{b}は{a}の手に自分の手を重ね、苦しさごと受け止めるように目を閉じた。|{b}は{a}が気持ちよさそうに息を吐くのを聞いて、嬉しそうに喉を締めた。'),
      shy: L('{b}は怯えたように{a}の服の裾を握りしめ、小さく震えながら、それでも唇を離さなかった。|{b}は苦しさよりも恥ずかしさで、耳まで真っ赤に染めていた。'),
      mean: L('{b}は噛みついてやるとでも言いたげに{a}を睨み上げたが、喉を塞がれて声にならなかった。|{b}は悔しげに眉を寄せたまま、それでも喉の奥を締めつける反応だけは止められなかった。')
    },
    /* 合意の台詞（段の頭。受けが求める／応える） */
    say: {
      maso: L('{b}「あなたので……喉の奥まで、いっぱいにして｜あなたので……喉の奥まで、いっぱいにしろ｜あなたので……喉の奥まで、いっぱいにしてください」'),
      sweet: L('{b}「いいよ、奥まで……あなたが気持ちいいなら｜いい、奥まで来い……あなたが気持ちいいなら｜いいですよ、奥まで……あなたが気持ちいいなら」'),
      shy: L('{b}「が、がんばる……でも、ゆっくりにして……｜が、頑張る……だが、ゆっくりにしてくれ……｜が、頑張ります……でも、ゆっくりにしてください……」')
    },
    rough: L('{a}は{b}の髪を掴み、逃げようとする頭を何度も引き戻した。'),
    spot: '{b}の喉'
  };
  /* 態度（夜の性格の種類が無いとき）の攻めの進め方・受けの反応・受けの台詞（{spot}＝プレイごとの場所） */
  var GEN_M = {
    proud: L('{a}は勝ち誇ったように笑い、{spot}を自分の思うままに責め立てた。|{a}は{b}の乱れぶりを見下ろして、自分の腕前を確かめるように{spot}を責め続けた。'),
    stern: L('{a}は表情ひとつ変えずに、力を抜け、とだけ命じて、{spot}を淡々と責め続けた。|{a}は短く指示を出しながら、決めた手順どおりに{spot}を責めていった。'),
    tsun: L('{a}はそっけない顔のまま、それでも{b}の反応だけは見逃さずに、{spot}を責め続けた。|{a}は仕方なさそうな顔をしながら、誰よりも丁寧に{spot}を可愛がった。'),
    gentle: L('{a}は穏やかに{b}の髪を撫でながら、{spot}をゆっくりと愛でた。|{a}は急かすことなく、{b}の呼吸が整うのを待っては、また{spot}に触れた。'),
    devoted: L('{a}は{b}が少しでも気持ちよくなれるようにと、ひたむきに{spot}へ尽くした。|{a}は{b}の声ひとつひとつを宝物のように受け止めながら、{spot}を丁寧に愛した。'),
    cool: L('{a}は{b}の反応を観察するように見つめ、どこをどうすれば崩れるのかを確かめながら{spot}を責めた。|{a}は冷静な目のまま、一番効く強さと速さを見極めて{spot}を責め続けた。'),
    free: L('{a}は遊ぶように{spot}を弄り、{b}が跳ねるたびに楽しそうに笑った。|{a}は思いつくままに触れ方を変え、{b}の反応を面白がるように{spot}を責めた。'),
    polite: L('{a}は失礼します、と小さく断ってから、礼儀正しいほど丁寧な手つきで{spot}に触れた。|{a}は{b}に一つずつ許しを得るようにしながら、{spot}を丁寧に責めていった。')
  };
  var GEN_R = {
    proud: L('{b}は余裕のあるふりをしようとしたが、{spot}を責められるたびに、その顔が崩れていった。|{b}は負けを認めたくないとばかりに睨み返したが、体は正直に震えていた。'),
    stern: L('{b}は声を殺そうと唇を引き結んだが、{spot}を責められるうちに、その堅い表情がほどけていった。|{b}は乱れまいと呼吸を整えようとして、そのたびに失敗した。'),
    tsun: L('{b}は気持ちよくなんかないと言い張りながら、{spot}を責められるたびに甘い声を漏らした。|{b}はそっぽを向いたまま、それでも{a}の手を振り払おうとはしなかった。'),
    gentle: L('{b}は穏やかに息を吐き、{spot}から広がる熱に身を委ねていった。|{b}は{a}の名前を小さく呼び、されるがままに体を預けた。'),
    devoted: L('{b}は{a}が望むならと、苦しいほどの快感さえ健気に受け止めた。|{b}は自分のことよりも{a}が満足しているかを気にして、何度も{a}の顔を見上げた。'),
    cool: L('{b}は冷静さを保とうと自分の反応を分析しかけて、その思考ごと快感に押し流されていった。|{b}の澄ました顔は、{spot}を責められるうちに少しずつ崩れていった。'),
    free: L('{b}は楽しそうに息を弾ませ、もっととねだるように体を揺らした。|{b}は恥じらうこともなく、感じるままに声を上げた。'),
    polite: L('{b}は乱れた声のあとで、すみません、と律儀に謝った。|{b}は丁寧な言葉遣いを崩すまいとして、途中で言葉にならなくなった。')
  };
  var GEN_SAY = {
    proud: L('{b}「この程度で……私が、崩れるとでも……っ｜この程度で……私が崩れるとでも……っ｜この程度で……私が、崩れるとでもお思いですか……っ」'),
    stern: L('{b}「……っ、そこは……いや、続けて……｜……っ、そこは……いや、続けろ……｜……っ、そこは……いえ、続けてください……」'),
    tsun: L('{b}「べ、別に……気持ちよくなんか、ないし……っ｜べ、別に……気持ちよくなどない……っ｜べ、別に……気持ちよくなんか、ありません……っ」'),
    gentle: L('{b}「ん……あなたの触れ方、好き……｜ん……あなたの触れ方が、好きだ……｜ん……あなたの触れ方、好きです……」'),
    devoted: L('{b}「あなたが気持ちいいなら……私は、なんでも……｜あなたが気持ちいいなら……私はなんでもする……｜あなたが気持ちいいのでしたら……私は、なんでも……」'),
    cool: L('{b}「……おかしい。こんなはずじゃ、ないのに……っ｜……おかしい。こんなはずでは、ないのに……っ｜……おかしいです。こんなはずでは、ないのに……っ」'),
    free: L('{b}「あはっ、それ、すごい……もっとやって｜はは、それはすごい……もっとやれ｜あはっ、それ、すごいです……もっとやってください」'),
    polite: L('{b}「ご、ごめん……声、抑えられない……｜す、すまない……声が、抑えられない……｜す、すみません……声が、抑えられないんです……」')
  };
  /* 喉奥の合意の台詞（態度の列。受けが応える） */
  var THROAT_SAY_ATT = {
    proud: L('{b}「……いいよ。私がどこまで呑めるか、見せてあげる｜……いい。私がどこまで呑めるか、見せてやる｜……いいですよ。私がどこまで呑めるか、お見せします」'),
    stern: L('{b}「……分かった。奥まで、来て｜……分かった。奥まで来い｜……分かりました。奥まで、来てください」'),
    tsun: L('{b}「し、仕方ないから……今日だけだよ｜し、仕方ない……今日だけだ｜し、仕方ないですから……今日だけですよ」'),
    gentle: L('{b}「……いいよ。ゆっくり、奥まで来て｜……いい。ゆっくり奥まで来てくれ｜……いいですよ。ゆっくり、奥まで来てください」'),
    devoted: L('{b}「あなたが気持ちよくなれるなら、喉の奥まで使って｜あなたが気持ちよくなれるなら、喉の奥まで使え｜あなたが気持ちよくなれるのでしたら、喉の奥までお使いください」'),
    cool: L('{b}「……やってみる。苦しくなったら、合図するから｜……やってみる。苦しくなったら合図する｜……やってみます。苦しくなったら、合図しますので」'),
    free: L('{b}「いいよ、奥まで来て。どこまで入るか試してみよ｜いいぞ、奥まで来い。どこまで入るか試してみよう｜いいですよ、奥まで来てください。どこまで入るか試してみましょう」'),
    polite: L('{b}「じゃあ……いくね。奥まで、来て｜では……失礼する。奥まで来てくれ｜では……失礼いたします。奥まで、いらしてください」')
  };

  /* ---------- きっかけの一文 ---------- */
  var WANT_A = {
    pros: '{b}の{後ろ}の奥にある、いちばん弱いところを探り当てること',
    colon: 'いつもは届かない{b}の奥の奥まで、深く繋がること',
    nip: '{b}の{乳首}を、時間をかけて可愛がること',
    throat: '{b}の喉の奥まで、自分の{男性器}を呑み込ませること'
  };
  var WANT_B = {
    pros: '{後ろ}の奥の弱いところを、{a}に暴いてもらうこと',
    colon: 'いつもは届かない奥の奥まで、{a}に満たされること',
    nip: '{乳首}を、{a}にじっくり責めてもらうこと',
    throat: '{a}の{男性器}を、喉の奥まで受け入れること'
  };
  var WHY = {
    sadist: L('{a}の中で、{b}をもっと乱れさせたいという欲が、静かに頭をもたげた。|{a}は、{b}が崩れていく顔をもっと見たくなった。'),
    mean: L('{a}は、{b}がどこまで我慢できるのか、意地悪く試してみたくなった。|{a}は、{b}をもう少し困らせてやりたくなった。'),
    sweet: L('{a}は、{b}をもっと深く気持ちよくしてやりたかった。|{a}は、{b}がまだ知らない気持ちよさを教えてやりたかった。'),
    shy: L('{a}はずっと気になっていたことを、勇気を振り絞って口にした。|{a}は真っ赤になりながら、小さな声で切り出した。'),
    maso: L('{b}は、{a}にもっと深く支配されたくて、たまらなかった。|{b}は、自分をめちゃくちゃにしてほしいと、目で訴えていた。'),
    sweetB: L('{b}は、{a}にならどこまでも委ねていいと思えた。|{b}は、{a}が喜ぶことなら何でもしてあげたかった。'),
    lead: L('今夜の{b}は、自分から欲しいものをねだるつもりでいた。|{b}は自分から{a}の手を取り、続きの形を決めた。'),
    lib: L('{x}の熱は、ふつうの交わりだけでは収まりそうになかった。|一度や二度では、{x}の欲はとても満たされそうになかった。'),
    lover: L('恋人どうしの気安さが、{x}の背中を押した。|恋人の前だからこそ、{x}は隠していた望みを口にできた。'),
    casual: L('体だけの関係の気楽さが、{x}を大胆にさせた。|遠慮のいらない相手だからこそ、{x}は望みをそのまま口にした。'),
    drug: L('媚薬の熱が、{x}のためらいをすっかり溶かしていた。|媚薬に浮かされた頭では、{x}はもう恥ずかしさを思い出せなかった。'),
    omega: L('発情の熱に浮かされて、{x}はもう遠慮を忘れていた。|発情の熱にあてられて、{x}の望みは隠しようもなくなっていた。'),
    again: L('一度目で{b}の弱いところを知った{a}は、今度は最初からそこを狙った。|二度目の{a}は、一度目よりもずっと大胆だった。'),
    att: L('{a}は、{b}の反応がいちばん大きく変わる場所に、とうに気づいていた。|{a}は、{b}のまだ知らない顔を見てみたくなった。'),
    force: L('{a}は、抗う{b}を見下ろして、まずその口を塞ぐことにした。|{a}は、拒む言葉ごと{b}の口を塞いでしまうことにした。')
  };
  /* 相手に付き合う人（相手に合わせる）：きっかけの一文と、終わったあとの一言 */
  var ACCOM = {
    whyT: L('{b}がそれを望んでいるのを知っていたから、{a}はあえて強く責めることにした。|{a}自身がそこまで望んでいたわけではない。ただ、{b}が欲しがるのなら付き合ってやろうと思った。'),
    whyU: L('{b}は自分から望んだわけではなかったが、{a}がそれを欲しているのならと、小さく頷いた。|乗り気ではなかった。それでも{b}は、{a}の望みに付き合うことにした。'),
    inT: L('責める手つきとは裏腹に、{a}の目はどこか、いつもの{a}のままだった。|{a}は{b}の求める強さを探るように、ひとつずつ手加減を外していった。'),
    inU: L('{b}は乗り気ではなかったが、{a}が満足そうなのを見て、拒まずに受け入れ続けた。|{b}は戸惑いを隠しきれないまま、それでも{a}の望むようにさせた。'),
    endT: L('{a}「……これで満足？　あなたが望んだんだからね｜……これで満足か。あなたが望んだことだ｜……これでご満足ですか。あなたが望まれたことですよ」|{a}「こういうのが好きなんでしょ。……付き合ってあげる｜こういうのが好きなんだろう。……付き合ってやる｜こういうのがお好きなんでしょう。……お付き合いします」'),
    endU: L('{b}「……これで、満足？｜……これで満足か｜……これで、ご満足ですか」|{b}「あなたが望むなら、まあ……いいけど｜あなたが望むなら……まあ、いい｜あなたが望むのでしたら……まあ、構いませんけど」')
  };
  var ASK_A = L('{a}が{b}に求めたのは、{want}だった。|{a}は{b}の耳元で、続きの望みを囁いた――{want}を。');
  var ASK_B = L('{b}が{a}にねだったのは、{want}だった。|{b}は自分から、{want}を願い出た。');
  var MORE = L('それだけでは終わらなかった。|{a}の手は、そこで止まらなかった。');

  /* ---------- 乱数（本筋の乱数は使わない） ---------- */
  var RUN = { seed: '', n: 0, last: {}, cnt: {}, env: null, scen: '', used: {} };
  function hstr(s) { var h = 2166136261; for (var i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }
  function mkRng(key) {
    var h = hstr(key) || 1;
    var r = function () { h = (Math.imul(h ^ (h >>> 15), 2246822507) + 0x6D2B79F5) >>> 0; h ^= h >>> 13; return (h >>> 8) / 16777216; };
    r.int = function (m) { return Math.floor(r() * m); };
    r.pick = function (a) { return a[r.int(a.length)]; };
    return r;
  }
  EP.rngFor = function (T, U) { RUN.n++; return mkRng(RUN.seed + '|' + RUN.n + '|' + (T && T.name) + '|' + (U && U.name)); };
  /* 一回の結果の中で同じ文を続けない */
  function pickF(R, arr) {
    if (!arr || !arr.length) return '';
    var free = arr.filter(function (x) { return !RUN.used[x]; });
    var x = (free.length ? free : arr)[R.int((free.length ? free : arr).length)];
    RUN.used[x] = 1;
    return x;
  }
  if (HK.simulate && HK.wrap) HK.wrap(HK, 'simulate', function (sim0) {
    var f = function (input) {
      var prev = { nc: RUN.nc, seed: RUN.seed, n: RUN.n, last: RUN.last, cnt: RUN.cnt, env: RUN.env, scen: RUN.scen, used: RUN.used, pend: RUN.pend };
      RUN.seed = String(input && input.seed != null ? input.seed : ''); RUN.n = 0; RUN.last = {}; RUN.cnt = {}; RUN.used = {}; RUN.pend = null;
      RUN.env = (input && input.env) || {}; RUN.scen = (input && input.scenId) || ''; RUN.nc = input && input.chars ? input.chars.length : 0;
      try { return sim0.apply(this, arguments); } finally { for (var k in prev) RUN[k] = prev[k]; }
    };
    for (var ks in sim0) if (Object.prototype.hasOwnProperty.call(sim0, ks)) f[ks] = sim0[ks];
    f._eroPlay = true;
    return f;
  });

  /* ---------- 体と設定 ---------- */
  function P() { return HK.Pos; }
  function hasM(c) { var Q = P(); return Q && Q.hasM ? Q.hasM(c) : (c && c.gender) === 'm'; }
  function hasF(c) { var Q = P(); return Q && Q.hasF ? Q.hasF(c) : (c && c.gender) === 'f'; }
  function fBody(c) { var Q = P(); return Q && Q.isFBody ? Q.isFBody(c) : (c && c.gender) === 'f'; }
  function lib(c) { var Q = P(); return Q && Q.libOf ? Q.libOf(c) : ''; }
  function ct(tag) { return !!(HK.Content && HK.Content.on && HK.Content.on(RUN.env, tag, RUN.scen)); }
  /* 体の組（場面の mode：mf／fm／ff）からプレイの組を決める。mm＝攻めが男性器を持ち受けが男性器だけ */
  function combo(T, U, mode) {
    if (mode === 'ff') return 'ff';
    if (mode === 'fm') return 'fm';
    return hasM(U) && !hasF(U) ? 'mm' : 'mf';
  }
  /* プレイが体の上で成り立つか */
  function anatOk(key, T, U, mode) {
    var c = combo(T, U, mode);
    if (key === 'nip') return true;
    if (key === 'pros') return (c === 'mm' && hasM(T)) || (c === 'fm' && hasM(U) && !hasF(U));
    if (key === 'colon') return c === 'mm' && hasM(T);
    if (key === 'throat') return (c === 'mm' || c === 'mf') && hasM(T);
    return false;
  }
  EP.anatOk = anatOk;
  var W_KIND_T = {
    sadist: { throat: 3, colon: 3, nip: 2, pros: 1 }, mean: { nip: 2.5, pros: 2, throat: 0.8, colon: 0.8 },
    sweet: { pros: 2.5, nip: 2, throat: 0.3, colon: 0.5 }, shy: { nip: 1.5, pros: 1, throat: 0.3, colon: 0.3 }
  };
  var W_KIND_U = {
    maso: { throat: 2.5, colon: 2.5, nip: 1.5, pros: 1.2 }, sweet: { pros: 1.5, nip: 1.5, throat: 1.2, colon: 1 },
    shy: { throat: 0.4, colon: 0.4, nip: 1.3, pros: 1 }, mean: { throat: 0, colon: 0.6, nip: 1, pros: 1 }
  };
  /* 態度（夜の性格の種類が無いとき）の向き不向き */
  var W_ATT_T = {
    proud: { throat: 1.6, colon: 1.4 }, stern: { throat: 1.4, colon: 1.2 }, tsun: { nip: 1.3 }, gentle: { pros: 1.4, nip: 1.3, throat: 0.6, colon: 0.7 },
    devoted: { pros: 1.3, nip: 1.4, throat: 0.6 }, cool: { pros: 1.6, colon: 1.2 }, free: { nip: 1.4, throat: 1.2 }, shy: { throat: 0.4, colon: 0.4, nip: 1.3 }, polite: { pros: 1.2, nip: 1.2, throat: 0.7 }
  };
  var W_ATT_U = {
    proud: { throat: 0.8 }, stern: {}, tsun: { throat: 0.6, nip: 1.2 }, gentle: { pros: 1.2 }, devoted: { throat: 1.5, colon: 1.3 },
    cool: { pros: 1.3 }, free: { throat: 1.3, colon: 1.2, nip: 1.2 }, shy: { throat: 0.4, colon: 0.4, nip: 1.3 }, polite: {}
  };
  var P_KIND_T = { sadist: 1.8, mean: 1.5, sweet: 1.3, shy: 0.8 };
  var P_KIND_U = { maso: 1.8, sweet: 1.2, shy: 0.8, mean: 0.9 };
  var P_ATT = { proud: 1.15, free: 1.2, devoted: 1.1, cool: 1.05, shy: 0.85, stern: 1, tsun: 1, gentle: 1, polite: 0.95 };
  EP.BASE = 0.15;

  /* その場面で差し込むプレイを決める。o = { mode, ero, force, heat, rel, nth, lewd, R } */
  EP.plan = function (T, U, o) {
    o = o || {};
    if (HK.SAFE_ON || !T || !U || T === U) return null;
    if (HK.NoGen && HK.NoGen.on && HK.NoGen.on(T, U)) return null;
    var R = o.R || EP.rngFor(T, U), mode = o.mode || 'mf';
    var kT = kindOf(T, U), kU = kindOf(U, T), aT = attOf(T, U), aU = attOf(U, T);
    /* 合意のない場面：強いられる喉奥だけ（スイッチ「合意のない展開」・攻めが sadist・攻めに男性器） */
    if (o.force) {
      if (kT !== 'sadist' || !ct('force') || !anatOk('throat', T, U, mode)) return null;
      if (R() >= 0.45) return null;
      return { keys: ['throat'], init: 'a', force: true, why: ['force'], kT: kT, kU: kU, aT: aT, aU: aU, mode: mode };
    }
    var p = EP.BASE;
    p *= kT ? (P_KIND_T[kT] || 1) : (P_ATT[aT] || 1);
    p *= kU ? (P_KIND_U[kU === 'sadist' ? 'mean' : kU] || 1) : (P_ATT[aU] || 1);
    var why = [];
    var ldU = P().leadOf ? P().leadOf(U) : '';
    if (ldU === 'sasoi' || ldU === 'osoi') { p *= 1.4; why.push('lead'); }
    var lx = null;
    [T, U].forEach(function (c) { var l = lib(c); if (l === 'high') { p *= 1.3; lx = lx || c; } else if (l === 'low') p *= 0.6; });
    if (lx) why.push('lib');
    if (o.rel === 'lover' || o.rel === 'casual') { p *= 1.25; why.push(o.rel); }
    if (o.heat) { p *= 1.3; why.push(o.heat); }
    if (o.nth >= 2) { p *= 1.25; why.push('again'); }
    if (o.lewd === 'high') p *= 1.4;
    if (R() >= Math.min(0.75, p)) return null;
    /* プレイの重み */
    var pk = [T.name, U.name].join('\u0001'), last = RUN.last[pk] || [];
    var cand = ['pros', 'colon', 'nip', 'throat'].filter(function (k) { return anatOk(k, T, U, mode) && last.indexOf(k) < 0 && !(k === 'throat' && o.place === 'locker'); });
    var wt = function (k) {
      var w = { pros: 1, colon: 0.7, nip: 0.8, throat: 0.8 }[k];
      if (kT) w *= (W_KIND_T[kT] || {})[k] != null ? W_KIND_T[kT][k] : 1; else w *= (W_ATT_T[aT] || {})[k] != null ? W_ATT_T[aT][k] : 1;
      var uk = kU === 'sadist' ? 'mean' : kU;
      if (uk) w *= (W_KIND_U[uk] || {})[k] != null ? W_KIND_U[uk][k] : 1; else w *= (W_ATT_U[aU] || {})[k] != null ? W_ATT_U[aU][k] : 1;
      /* 結腸：恋人・体だけの関係で性欲が強いと起こりやすい */
      if (k === 'colon' && (o.rel === 'lover' || o.rel === 'casual') && lx) w *= 2.5;
      if (k === 'nip' && fBody(U) && U.bust === 'l') w *= 1.3;
      if (k === 'throat' && o.lewd === 'high') w *= 1.3;
      return w;
    };
    cand = cand.filter(function (k) { return wt(k) > 0; });
    if (!cand.length) return null;
    var pickW = function (list) { var s = 0; list.forEach(function (k) { s += wt(k); }); var x = R() * s; for (var i = 0; i < list.length; i++) { x -= wt(list[i]); if (x < 0) return list[i]; } return list[list.length - 1]; };
    var keys = [pickW(cand)];
    var rest = cand.filter(function (k) { return k !== keys[0]; });
    if (rest.length && R() < (kT === 'sadist' || kU === 'maso' ? 0.4 : 0.22)) keys.push(pickW(rest));
    /* 並び：喉奥・乳首（前戯）→ 前立腺 → 結腸 */
    var ORD = { throat: 0, nip: 1, pros: 2, colon: 3 };
    keys.sort(function (x, y) { return ORD[x] - ORD[y]; });
    /* 言い出す人：受けが maso／sweet か主導を握っていれば受け、そうでなければ攻め */
    var init = accomOf(U, T) ? 'a' : kU === 'maso' || ldU === 'sasoi' || ldU === 'osoi' || (kU === 'sweet' && R() < 0.5) || (!kU && (aU === 'free' || aU === 'devoted') && R() < 0.4) ? 'b' : 'a';
    return { keys: keys, init: init, why: why, kT: kT, kU: kU, aT: aT, aU: aU, mode: mode, lx: lx, accT: accomOf(T, U), accU: accomOf(U, T) };
  };

  /* ---------- 文を組む ---------- */
  function moan(R, U, T, kind, ero, deep) {
    var M = HK.Moan, fb = function () { return kind === 'climax' ? 'あ、ぁ……っ' : 'ん、ぅ……っ'; };
    var t = M && M.say ? M.say(R, U, kind, { novel: !ero, top: T, deep: !!deep }, fb) : fb();
    return t || fb();
  }
  /* 喉を塞がれた声：喘ぎの仮名を「ん・ぐ・ぅ」に崩す（区切りの記号・♡ はそのまま） */
  EP.muffle = function (s, R) {
    var out = '', n = 0, KS = ['ん', 'ぐ', 'ぅ', 'ん', 'ぶ'];
    String(s || '').replace(/⁠/g, '').split('').forEach(function (ch) {
      if (/[っッ]/.test(ch)) out += 'っ';
      else if (/[ぁ-ゖァ-ヺ一-龠々]/.test(ch)) { if (n < 7) out += KS[(n + (R ? R.int(2) : 0)) % KS.length]; n++; }
      else if (/[ー〜]/.test(ch)) { if (n < 7) out += ch; }
      else out += ch;
    });
    out = out.replace(/(……){2,}/g, '……').replace(/^[、。]+/, '');
    return /[んぐぅぶ]/.test(out) ? out : 'んぐ……っ';
  };
  if (HK.Moan && !HK.Moan.muffle) HK.Moan.muffle = function (s, R) { return EP.muffle(s, R); };
  function sfx(R, k) { var l = HK.Ero && HK.Ero.SFX && HK.Ero.SFX[k]; return l && l.length ? l[R.int(l.length)] : '……っ'; }
  function fill(t, R, T, U, ero, spot) {
    return String(t)
      .replace(/\{spot\}/g, spot || '{b}の体')
      .replace(/\{bust\}/g, function () { var w = HK.Attr.bustWord ? HK.Attr.bustWord(U, function (l) { return pickF(R, l); }) : ''; return w || '{胸}'; })
      .replace(/\{mb\}/g, function () { return moan(R, U, T, 'mid', ero, false); })
      .replace(/\{md\}/g, function () { return moan(R, U, T, 'mid', ero, true); })
      .replace(/\{mg\}/g, function () { return '{b}「' + EP.muffle(moan(R, U, T, 'mid', ero, true), R) + '」'; })
      .replace(/\{s:(\w+)\}/g, function (m, k) { return ero ? sfx(R, k) : ''; })
      .replace(/。。/g, '。');
  }
  function gl(tbl, k) { return tbl && tbl[k]; }
  /* 攻めの進め方・受けの反応・受けの台詞（夜の性格の種類があればプレイごとの文、なければ態度の文） */
  function manner(R, key, T, U, o) {
    var d = D[key], mk = mKey(T, U), l = gl(d.m, mk) || GEN_M[mk] || GEN_M.gentle, t = pickF(R, l);
    if (kindOf(T, U) === 'sadist' && d.rough && ct('violence') && !accomOf(T, U)) t += pickF(R, d.rough);
    if (accomOf(T, U)) t += pickF(R, ACCOM.inT);
    return t;
  }
  function react(R, key, T, U) {
    var d = D[key], rk = rKey(U, T), l = (!accomOf(U, T) && gl(d.r, rk)) || GEN_R[rk] || GEN_R.gentle;
    return pickF(R, l) + (accomOf(U, T) ? pickF(R, ACCOM.inU) : '');
  }
  function sayOf(R, key, T, U) {
    var d = D[key], rk = rKey(U, T), l = gl(d.say, rk);
    if (!l && key === 'throat') l = THROAT_SAY_ATT[rk];
    if (!l) l = GEN_SAY[rk] || GEN_SAY.gentle;
    return pickF(R, l);
  }
  function trigger(R, plan, key, T, U) {
    var src;
    if (plan.force) src = 'force';
    else if (plan.init === 'b') src = plan.kU === 'maso' ? 'maso' : plan.kU === 'sweet' ? 'sweetB' : plan.why.indexOf('lead') >= 0 ? 'lead' : '';
    else src = plan.kT && WHY[plan.kT] && plan.kT !== 'maso' ? plan.kT : '';
    /* 種類で決まらなければ、その場の理由（主導・性欲・関係・熱・二度目）。それも無ければ態度から */
    if (!src) { var w = plan.why.filter(function (x) { return WHY[x]; }); src = w.length ? w[R.int(w.length)] : 'att'; }
    var x = plan.init === 'b' ? '{b}' : (src === 'lib' && plan.lx === U ? '{b}' : '{a}');
    var t = pickF(R, WHY[src]).replace(/\{x\}/g, x);
    if (plan.force) return t;
    if (plan.accT) t = pickF(R, ACCOM.whyT);
    var want = (plan.init === 'b' ? WANT_B : WANT_A)[key];
    t += pickF(R, plan.init === 'b' ? ASK_B : ASK_A).replace('{want}', want);
    if (plan.accU) t += pickF(R, ACCOM.whyU);
    return t;
  }
  /* プレイごとの段 → { fore:[], mid:[], peak:'' } */
  EP.build = function (T, U, plan, o) {
    o = o || {};
    var R = o.R || EP.rngFor(T, U), ero = !!o.ero, st = ero ? 'e' : 'n', c = combo(T, U, plan.mode), out = { fore: [], mid: [], peak: '' };
    var uf = fBody(U) ? 'f' : 'm', first = true;
    var head = function (key) { var t = first ? trigger(R, plan, key, T, U) : pickF(R, MORE); first = false; return t; };
    var F = function (t, key) { return fill(t, R, T, U, ero, D[key] && D[key].spot); };
    var hasQ = function (t) { return /\{b\}「/.test(t); };
    /* 媚薬ロッカーの中（o.place）では寝台・シーツの文を使わない */
    var pk = function (arr) { if (o.place === 'locker') { var f0 = arr.filter(function (x) { return !/寝台|シーツ/.test(x); }); if (f0.length) arr = f0; } return pickF(R, arr); };
    plan.keys.forEach(function (key) {
      if (key === 'throat') {
        var d = D.throat, core = plan.force ? pickF(R, d.force[st]) : pk(d.core[c === 'mm' ? 'm' : uf][st]);
        var line = plan.force ? '' : sayOf(R, 'throat', T, U);
        var t = head(key) + line + core + manner(R, key, T, U, o) + react(R, key, T, U) + pickF(R, d.end[st]);
        out.fore.push(F(t, key));
      } else if (key === 'nip') {
        var dn = D.nip, cf = dn.fore[c] || dn.fore.mf;
        var tn = head(key) + pk(cf[st]) + manner(R, key, T, U, o) + react(R, key, T, U);
        if (!hasQ(tn)) tn += '{b}「{mb}」';
        tn += sayOf(R, 'nip', T, U);
        out.fore.push(F(tn, key));
        if (R() < 0.5) out.mid.push(F(pk(dn.self[uf][st]), key));
        if (R() < 0.4 && !out.peak) out.peak = F(pickF(R, dn.peak[uf][st]), key);
      } else if (key === 'pros') {
        var dp = D.pros, k2 = c === 'fm' ? 'fm' : 'mm';
        var tp = head(key) + pk(dp.fore[k2][st]) + manner(R, key, T, U, o) + react(R, key, T, U);
        if (!hasQ(tp)) tp += '{b}「{mb}」';
        tp += sayOf(R, 'pros', T, U) + pickF(R, dp.out[st]);
        out.fore.push(F(tp, key));
        out.mid.push(F(pk(dp.mid[k2][st]), key));
        out.peak = F(pickF(R, dp.peak[k2][st]), key);
      } else if (key === 'colon') {
        var dc = D.colon;
        var tc = head(key) + pk(dc.mid.mm[st]) + manner(R, key, T, U, o) + react(R, key, T, U);
        if (!hasQ(tc)) tc += '{b}「{md}」';
        tc += sayOf(R, 'colon', T, U);
        out.mid.push(F(tc, key));
        out.peak = F(pickF(R, dc.peak.mm[st]), key);
      }
    });
    /* 相手に付き合った人の、終わったあとの一言（最後の段の終わり） */
    if (plan.accT || plan.accU) {
      var lst = out.mid.length ? out.mid : out.fore;
      if (lst.length) lst[lst.length - 1] += fill(pickF(R, plan.accU ? ACCOM.endU : ACCOM.endT), R, T, U, ero);
    }
    return out;
  };
  /* {a}{b} を差し込む先の書き方に合わせる（ab＝{a}{b} のまま／TU＝{T}{U}／name＝名前） */
  EP.paint = function (t, T, U, ph) {
    if (ph === 'TU') return t.replace(/\{a\}/g, '{T}').replace(/\{b\}/g, '{U}');
    if (ph === 'name') return t.replace(/\{a\}/g, T.name).replace(/\{b\}/g, U.name);
    return t;
  };
  function rec(T, U, plan, o, built) {
    var pk = [T.name, U.name].join('\u0001');
    if (plan) RUN.last[pk] = plan.keys.slice();
    if (!EP.log) return;
    var Q = P();
    EP.log.push({
      scen: RUN.scen, t: T.name, u: U.name, keys: plan ? plan.keys.slice() : [], init: plan ? plan.init : '', why: plan ? plan.why.slice() : [], force: !!(plan && plan.force),
      kT: kindOf(T, U), kU: kindOf(U, T), aT: attOf(T, U), aU: attOf(U, T), mode: o.mode, combo: combo(T, U, o.mode), ero: !!o.ero, src: o.src || '',
      anat: plan ? plan.keys.every(function (k) { return anatOk(k, T, U, o.mode); }) : true,
      uHasF: hasF(U), uHasM: hasM(U), tHasM: hasM(T), hardTopU: !!(Q && Q.hardTop && Q.hardTop(U, T)),
      trig: built ? built.fore.concat(built.mid).length > 0 : false,
      text: built ? built.fore.concat(built.mid).concat([built.peak]).join('\n') : ''
    });
  }
  function ctxOpt(T, U, mode, ero, src) {
    var ET = HK.EroTop, pk = [T.name, U.name].sort().join('\u0001');
    RUN.cnt[pk] = (RUN.cnt[pk] || 0) + 1;
    var Q = P(), env = RUN.env || {}, sc = RUN.sc || {}, arm = HK.AfterReply ? HK.AfterReply.mode : '';
    var o = {
      mode: mode, ero: ero, src: src,
      force: !!(sc.force || (Q && Q.forcing && Q.forcing())),
      rel: ET && ET.relOf ? ET.relOf(null, T, U) : '',
      heat: RUN.scen === 'locker' || arm === 'aphro' ? 'drug' : RUN.scen === 'omega' ? 'omega' : '',
      nth: RUN.cnt[pk], lewd: HK.Lewd && HK.Lewd.lv ? HK.Lewd.lv(env) : env.lewd
    };
    /* 差さない場面：慰めの夜（o.soft）・敵対／恐怖の二人の合意のある場面・部屋の条件で仕方なく（恋人どうし以外） */
    var hostile = !!(Q && ((Q.hostile && Q.hostile(T, U)) || (Q.fearOf && (Q.fearOf(T, U) || Q.fearOf(U, T)))));
    if (sc.soft || (!o.force && hostile) || (arm === 'des' && o.rel !== 'lover')) o.skip = true;
    return o;
  }
  /* 段落の配列に差し込む。idx = { fore, mid, climax }（fore は番号の配列でもよい：空でない最後のもの） */
  EP.weave = function (arr, T, U, idx, o) {
    if (!arr || !idx || HK.SAFE_ON || !T || !U) return null;
    o = o || {};
    var ok = function (j) { return j != null && j >= 0 && j < arr.length && typeof arr[j] === 'string' && !!arr[j].trim(); };
    var fi = idx.fore; if (Array.isArray(fi)) fi = fi.filter(ok).pop();
    var bi = idx.mid, ci = idx.climax;
    if (!ok(fi) || !ok(bi) || !ok(ci) || !(fi < bi && bi < ci)) return null;
    var R = o.R || EP.rngFor(T, U);
    var o2 = {}; for (var k in o) o2[k] = o[k]; o2.R = R;
    var plan = o2.skip ? null : EP.plan(T, U, o2);
    if (!plan) { rec(T, U, null, o2, null); return null; }
    var b = EP.build(T, U, plan, o2), ph = o.ph || 'ab';
    if (b.peak) arr[ci] = EP.paint(b.peak, T, U, ph) + arr[ci];
    if (b.mid.length) arr.splice.apply(arr, [bi + 1, 0].concat(b.mid.map(function (t) { return EP.paint(t, T, U, ph); })));
    if (b.fore.length) arr.splice.apply(arr, [fi + 1, 0].concat(b.fore.map(function (t) { return EP.paint(t, T, U, ph); })));
    rec(T, U, plan, o2, b);
    return plan;
  };
  EP.on = function () { return !HK.SAFE_ON && !!EP.SCEN[RUN.scen]; };

  /* ---------- 取り付け：共通の山場の差し込み口（raceWeave）と、媚薬ロッカーのベッド（racePlay） ---------- */
  function phOf(arr) { var s = arr.join(''); return /\{T\}|\{U\}/.test(s) ? 'TU' : /\{a\}|\{b\}/.test(s) ? 'ab' : 'name'; }
  /* 山場の部品の呼び出しの間だけ、その場面の印（合意のない場面 opt.force・慰めの夜 o.soft）を覚える */
  function scWrap(obj, key, get) {
    if (!obj || !obj[key] || obj[key]._eroPlaySc) return;
    HK.wrap(obj, key, function (f0) {
      var f = function () {
        var prev = RUN.sc; RUN.sc = get.apply(null, arguments) || {};
        try { return f0.apply(this, arguments); } finally { RUN.sc = prev; }
      };
      for (var k in f0) if (Object.prototype.hasOwnProperty.call(f0, k)) f[k] = f0[k];
      f._eroPlaySc = true;
      return f;
    });
  }
  function install() {
    var A = HK.Attr;
    scWrap(HK.ThickSex, 'scene', function (opt) { return { force: !!(opt && opt.force) }; });
    scWrap(HK.ThickEro, 'scene', function (opt) { return { force: !!(opt && opt.force) }; });
    scWrap(HK.TKC, 'body', function (T, U, o) { return { force: !!(o && o.force), soft: !!(o && o.soft) }; });
    if (A.raceWeave && !A.raceWeave._eroPlay) HK.wrap(A, 'raceWeave', function (rw0) {
      var f = function (arr, T, U, pick, idx, o) {
        var r = rw0.apply(this, arguments);
        if (!EP.on() || !Array.isArray(arr)) return r;
        try {
          var ph = phOf(arr);
          if (ph === 'name') return r;   /* 物語型（名前を埋めた段落。r18-thick.js）はここでは差さない */
          var mode = o && /^(?:mf|fm|ff)$/.test(o.mode || '') ? o.mode : 'mf';
          var co = ctxOpt(T, U, mode, !!(o && o.ero), ph === 'TU' ? 'tkc' : o && o.ero ? 'ero' : 'thick');
          co.ph = ph;
          EP.weave(arr, T, U, idx, co);
        } catch (e) { if (EP.log) EP.log.push({ err: String(e && e.stack || e) }); }
        return r;
      };
      f._eroPlay = true;
      return f;
    });
    if (A.racePlay && !A.racePlay._eroPlay) HK.wrap(A, 'racePlay', function (rp0) {
      var f = function (T, U, kind, pick, o) {
        var r = rp0.apply(this, arguments);
        /* raceWeave からの呼び出し（o._night あり）・ロッカー以外は何もしない */
        if ((o && o._night) || RUN.scen !== 'locker' || !EP.on() || !T || !U) return r;
        try {
          if (kind === 'fore') {
            var mode = o && /^(?:mf|fm|ff)$/.test(o.mode || '') ? o.mode : 'mf';
            var ero = !!(HK.Lewd && HK.Lewd.ero && HK.Lewd.ero(RUN.env));
            var co = ctxOpt(T, U, mode, ero, 'locker'), R = EP.rngFor(T, U);
            co.R = R;
            RUN.pend = null;
            var plan = co.skip ? null : EP.plan(T, U, co);
            if (!plan) { rec(T, U, null, co, null); return r; }
            var b = EP.build(T, U, plan, co);
            rec(T, U, plan, co, b);
            RUN.pend = { T: T, U: U, b: b };
            return r + (b.fore.length ? '\n\n' + EP.paint(b.fore.join('\n\n'), T, U, 'name') + '\n\n' : '');
          }
          var pd = RUN.pend;
          if (!pd || pd.T !== T || pd.U !== U) return r;
          /* ロッカーのベッドは果てる段の文が先に来るので、山場の頭の一文も繋がる段の終わりに置く */
          if (kind === 'mid') { RUN.pend = null; var ml = pd.b.mid.concat(pd.b.peak ? [pd.b.peak] : []); return r + (ml.length ? '\n\n' + EP.paint(ml.join('\n\n'), T, U, 'name') + '\n\n' : ''); }
        } catch (e) { if (EP.log) EP.log.push({ err: String(e && e.stack || e) }); }
        return r;
      };
      f._eroPlay = true;
      return f;
    });
    /* 媚薬ロッカーの中で繋がったとき（solo-locker.js が一組に一回だけ呼ぶ LK.nightLine の deep）：その段の後ろに差す。
       狭いロッカーの中なので、寝台・シーツの文と喉奥は使わない */
    var LK = HK.LOCKER;
    if (LK && LK.nightLine && !LK.nightLine._eroPlay) HK.wrap(LK, 'nightLine', function (nl0) {
      var f = function (S, top, bot, stage, opt) {
        var r = nl0.apply(this, arguments);
        if (stage !== 'deep' || RUN.scen !== 'locker' || RUN.nc !== 2 || !EP.on() || !top || !bot || top.bound || (HK.Pos && HK.Pos.hardTop && HK.Pos.hardTop(bot, top))) return r;
        try {
          var mode = opt && /^(?:mf|fm|ff)$/.test(opt.mode || '') ? opt.mode : 'mf';
          var ero = !!(HK.Lewd && HK.Lewd.ero && HK.Lewd.ero(RUN.env));
          var co = ctxOpt(top, bot, mode, ero, 'locker-in'), R = EP.rngFor(top, bot);
          co.R = R; co.place = 'locker';
          var plan = co.skip ? null : EP.plan(top, bot, co);
          if (!plan) { rec(top, bot, null, co, null); return r; }
          var b = EP.build(top, bot, plan, co);
          rec(top, bot, plan, co, b);
          var t = b.fore.concat(b.mid).concat(b.peak ? [b.peak] : []).join('\n\n');
          if (!t) return r;
          return { text: ((r && r.text) || '') + '\n\n' + EP.paint(t, top, bot, 'name'), label: (r && r.label) || '' };
        } catch (e) { if (EP.log) EP.log.push({ err: String(e && e.stack || e) }); }
        return r;
      };
      f._eroPlay = true;
      return f;
    });
    /* 三人・四人の場面（trio-talk-r18.js の HK.Trio3.begin → 組み立て。出られない部屋の三人・ロッカーの大人数など）：
       いちばん初めの組（攻め→受け）に、前戯の段・最中の段の文として足す（名前を埋めた文） */
    var T3 = HK.Trio3;
    if (T3 && T3.begin && !T3.begin._eroPlay) HK.wrap(T3, 'begin', function (bg0) {
      var f = function (S, sp, o) {
        var c = bg0.apply(this, arguments);
        if (!c || typeof c.text !== 'function' || !EP.on()) return c;
        var tx0 = c.text;
        c.text = function () {
          if (!this._eroPlay) {
            this._eroPlay = true;
            try {
              var e = this.E && this.E[0], T = e && e[0], U = e && e[1], Q = P();
              if (T && U && !(Q && Q.hardTop && Q.hardTop(U, T))) {
                var mode = Q && Q.isF ? (Q.isF(T, U) ? (Q.isF(U, T) ? 'ff' : 'fm') : 'mf') : 'mf';
                var co = ctxOpt(T, U, mode, !!this.ero, 'trio');
                co.R = EP.rngFor(T, U);
                if (RUN.scen === 'locker') co.place = 'locker';
                var plan = co.skip ? null : EP.plan(T, U, co);
                if (!plan) rec(T, U, null, co, null);
                else {
                  var b = EP.build(T, U, plan, co), self = this;
                  rec(T, U, plan, co, b);
                  b.fore.forEach(function (t) { self.add('fore', EP.paint(t, T, U, 'name'), 1, ''); });
                  b.mid.concat(b.peak ? [b.peak] : []).forEach(function (t) { self.add('mid', EP.paint(t, T, U, 'name'), 1, ''); });
                }
              }
            } catch (er) { if (EP.log) EP.log.push({ err: String(er && er.stack || er) }); }
          }
          return tx0.apply(this, arguments);
        };
        return c;
      };
      f._eroPlay = true;
      return f;
    });
  }
  install();
  if (HK.Load && HK.Load.onChunk) HK.Load.onChunk(install);
  EP.D = D; EP.GEN_M = GEN_M; EP.GEN_R = GEN_R; EP.GEN_SAY = GEN_SAY; EP.THROAT_SAY_ATT = THROAT_SAY_ATT; EP.WHY = WHY;
})();
