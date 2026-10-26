/* 箱庭シミュレーター: ゾンビの街 ― 新しい関係（同級生・同僚・上司と部下・執着（信仰）・恩人・親族）の出来事
   ・関係ごとのふだんの小場面（向きのある関係は両側の視点）、関係を保つ出来事、関係を発展させる出来事
     （恋愛してよい組なら恋に変わる分岐。信仰は「恋愛に発展：する」のときだけ恋、支配なら支配と服従が深まる。恩人は恩返し、上司と部下は職場の外での対等な信頼、同級生は昔話からの再接近、親族は家族としての絆）
   ・信仰する側は、突き放されても囮にされても想いを捨てない
   ・群れに捕まったとき（zombie-core.js の victim から Z.tieVictim）：上司が部下を逃がすために残る／恩を受けた側が命を張って恩を返す／
     信仰する側が盾になる／信仰を利用して支配している側が囮を命じる／親族が力ずくで引き戻す */
(function () {
  'use strict';
  var HK = window.HK, Z = HK.ZB, RK = HK.RelKit;
  if (!Z || !Z.scen || !RK) return;
  var EV = Z.scen.events, L = RK.L;
  function fill(t, m) { return String(t).replace(/\{(\w+)\}/g, function (x, k) { return m[k] != null ? m[k] : x; }); }
  function tie(ctx, a, b, type) { return HK.Ties && HK.Ties.has(ctx, a, b, type); }
  function ok(c) { return c && c.alive && !c.out && c.z && !c.z.alone; }
  /* 恋愛に発展してよい組か（恋愛の可否・恋愛相手の固定・家族・信仰の「恋愛に発展しない」を通す） */
  function loveOk(ctx, x, y, t) {
    if (!HK.canLove || !HK.canLove(x, y) || !HK.canLove(y, x)) return false;
    if (!ctx.romanceOk([x, y]) || RK.noRomance(ctx, x, y)) return false;
    if (t && HK.tieOptNoLove && HK.tieOptNoLove(t)) return false;
    if ((x.lock != null && x.lock !== y.i) || (y.lock != null && y.lock !== x.i)) return false;
    return true;
  }
  function grown(ctx, a, b, aff, trust) { return ctx.R(a, b).aff > aff && ctx.R(b, a).aff > aff && ctx.R(a, b).trust > trust && ctx.R(b, a).trust > trust; }
  /* 深まった関係が恋に変わる確率：惹かれが強いほど、すでに一度深まっているほど高い */
  function loveP(ctx, a, b, before) { var m = Math.max(ctx.R(a, b).att, ctx.R(b, a).att); return (before ? 0.4 : 0.12) + HK.clamp(m / 100, 0, 0.4); }
  function att(ctx, a, b, v) { return ctx.R(a, b).att > v || ctx.R(b, a).att > v; }

  var T = {
    cm: {
      pat: L('{a}と{b}は、見張りの合間に学生のころの話をした。誰が何をやらかしたか、二人ともよく覚えていた。|{a}は{b}に、同じクラスだった誰かの名前を挙げて「生きてると思う？｜生きていると思うか｜生きていると思いますか」と訊いた。{b}は少し黙ってから、「生きてる｜生きている｜生きています」と答えた。|{a}「学生のころ、避難訓練なんて真面目にやってなかったな｜学生のころ、避難訓練など真面目にやっていなかったな｜学生のころ、避難訓練なんて真面目にやっていませんでした」――{b}は「今なら満点が取れる｜＝｜今なら満点が取れます」と笑った。'),
      keep: L('{a}は{b}の分の水を、黙って取り分けておいた。学生のころ、弁当を分け合ったのと同じ手つきだった。|{a}と{b}は、昔の席順みたいに並んで眠った。どちらかが寝返りを打つたび、もう一人が目を開けて確かめた。|{a}は、{b}が学生のころから暗い場所を苦手にしていたのを覚えていた。夜の見回りは、いつも{a}が先に立った。'),
      grow: L('{a}は{b}に、学生のころ言えなかったことを打ち明けた。{a}「本当は、もっと{b}と話したかった｜＝｜本当は、もっと{b}と話したかったです」――{b}は驚いた顔をしてから、「同じことを思ってた｜同じことを思っていた｜同じことを思っていました」と言った。|{a}と{b}は、卒業してからの年月を埋めるように話し続けた。気づけば、学生のころより近くにいた。'),
      love: L('{a}は{b}の横顔を見ながら、学生のころの淡い気持ちを思い出していた。あの頃は言えなかった。{a}「……今なら、言ってもいいかな｜……今なら、言ってもいいだろうか｜……今なら、言ってもいいでしょうか」――{b}は答える代わりに、{a}の手を握った。|{a}と{b}は、昔話の途中で黙り込んだ。目が合ったまま、どちらも視線を外さなかった。同級生のままでいるには、二人とも近づきすぎていた。')
    },
    co: {
      pat: L('{a}と{b}は、職場の当番表みたいに見張りの順番を決めた。決めるのに一分もかからなかった。|{a}は物資の数を数えて、{b}に伝えた。{b}「了解。じゃあ明日の分はこう割り振る｜了解した。では明日の分はこう割り振る｜承知しました。では明日の分はこう割り振ります」――仕事の打ち合わせと、何も変わらなかった。|{a}「職場の誰が一番うまく生き延びてると思う？｜職場の誰が一番うまく生き延びていると思うか｜職場の誰が一番うまく生き延びていると思いますか」――{b}は即答で、同じ名前を挙げた。'),
      keep: L('{a}は疲れきった{b}の見張りを、黙って代わった。{a}「貸しにしとく｜貸しにしておく｜貸しにしておきます」――職場でよく交わした言葉だった。|{a}と{b}は、残り少ない食料をきっちり半分にした。どちらも相手の分を多くしようとして、少し揉めた。'),
      grow: L('{a}は{b}に、職場では見せたことのない弱音をこぼした。{b}は笑わずに聞いて、{a}の肩に手を置いた。仕事仲間という言葉では、もう足りなかった。|{a}と{b}は、仕事の話をしなくなった。代わりに、子どものころの話や、本当にやりたかったことを話した。'),
      love: L('{a}は、職場で毎日見ていたはずの{b}の顔を、初めて見るような気がした。{a}「仕事のときより、今の{b}のほうがいい｜＝｜仕事のときより、今の{b}のほうがいいです」――言ってから、{a}は自分の言葉に赤くなった。|{a}と{b}は、肩を寄せ合って夜を越した。同僚の距離では、もう眠れなかった。')
    },
    boss: {
      patA: L('{a}は{b}に短く指示を出した。{a}「右の通路を確認して。三分で戻って｜右の通路を確認。三分で戻れ｜右の通路を確認してください。三分で戻ってください」――{b}は返事より先に動いていた。|{a}は{b}の報告を聞きながら、地図に印を足していった。職場でも、この街でも、二人のやり方は変わらなかった。|{a}は、{b}の顔色が悪いことに気づいて、何も言わずに休憩を指示した。'),
      patB: L('{b}は{a}の指示を待たずに、次に要るものを用意していた。長年の仕事で身についた癖だった。|{b}は{a}の背中を見ながら歩いた。どんな現場でも、この背中についていけば何とかなる。そう思わせる上司だった。|{b}「{a}、物資の残りは三日分｜{a}、物資の残りは三日分だ｜{a}、物資の残りは三日分です」――報告を受けた{a}は、小さくうなずいた。'),
      keepA: L('{a}は自分の分の食料を、さりげなく{b}の側に寄せた。{a}「上の人間は、腹が減っても平気なもんだよ｜上の人間は、腹が減っても平気なものだ｜上の人間は、お腹が空いても平気なものです」|{a}は夜中に起き出して、{b}の毛布をかけ直した。職場では、決して見せない顔だった。'),
      keepB: L('{b}は{a}の手の傷に気づいて、黙って手当てをした。{a}「大げさだよ｜大げさだ｜大げさです」――{b}「上司に倒れられたら困る｜＝｜上司に倒れられたら困ります」|{b}は、{a}が無理をしすぎないよう、見張りの順番をこっそり入れ替えた。'),
      grow: L('{a}は{b}に言った。{a}「もう職場じゃない。上も下もない｜もう職場ではない。上も下もない｜もう職場ではありません。上も下もありません」――{b}は少し迷ってから、初めて{a}を肩書きなしで呼んだ。|{b}が{a}の判断に、初めて真っ向から異を唱えた。{a}は黙って聞き、それから{b}の案を採った。{a}「{b}のほうが正しい｜＝｜{b}のほうが正しいです」――二人のあいだで、何かが変わった。|{a}と{b}は、職場では一度もしなかった話をした。仕事を離れたら、二人はこんなにも話が合った。'),
      love: L('{a}は{b}を見つめて、言葉を探した。{a}「部下として見られなくなった。……困ったことに｜＝｜困ったことに……部下として見られなくなりました」――{b}は笑って、{a}の手を取った。|{b}は{a}の肩にもたれた。{a}は払いのけなかった。職場の外で、二人はただの二人になっていた。')
    },
    ws: {
      patA: L('{a}は自分の食料を削って、{b}の分を多くした。{a}「{b}が食べてくれれば、それでいい｜＝｜{b}が食べてくれれば、それでいいんです」|{a}は夜通し、{b}の眠る部屋の前に座って見張りを続けた。誰に頼まれたわけでもなかった。|{a}は{b}の言葉を、一言も聞き漏らすまいとしていた。{b}が何気なく言ったことまで、{a}は大切に覚えていた。|{a}は手に入れたばかりの武器を、{b}に差し出した。{a}「{b}が持っているほうが、私は安心できる｜＝｜{b}が持っているほうが、私は安心できます」'),
      patB: {
        '': L('{b}は、なぜか自分の荷物がいつも整っていることに首をかしげた。{a}が毎晩直していることには、まだ気づいていなかった。|{b}は{a}がいつも近くにいることを、ただの偶然だと思っていた。'),
        accept: L('{b}は{a}の差し出した水を、礼を言って受け取った。{a}はそれだけで、満ち足りた顔をした。|{b}は{a}の献身を、静かに受け入れていた。{b}「{a}がいてくれて、助かってる｜{a}がいてくれて、助かっている｜{a}がいてくれて、助かっています」'),
        confused: L('{b}は、また自分の分だけ多い食料を見て、困った顔をした。{b}「{a}、こういうのはやめてほしい｜{a}、こういうことはやめてくれ｜{a}、こういうのはやめてください」――{a}は笑って首を振るだけだった。|{b}は{a}の視線の重さに、ときどき息苦しさを覚えた。それでも、{a}を突き放すことはできなかった。'),
        dominate: L('{b}は{a}に、一番危ない見回りを命じた。{a}は迷わずうなずいた。{b}にとって{a}は、都合のいい駒だった。|{b}は{a}の持ってきた食料を、礼も言わずに取り上げた。{a}はそれを、当然のことのように見ていた。'),
        cherish: L('{b}は{a}の分の食料を、{a}の前に押し戻した。{b}「{a}も食べて。私のために倒れられたら、困る｜{a}も食べろ。私のために倒れられたら、困る｜{a}も食べてください。私のために倒れられたら、困ります」|{b}は、自分を守ろうとする{a}の手を握った。{b}「{a}が無事でいることが、私には一番大事だ｜＝｜{a}が無事でいることが、私には一番大事です」')
      },
      keep: L('{a}は{b}の靴紐を結び直し、上着のほつれを繕った。{b}が気づく前に、すべて済ませていた。|{a}は{b}が眠りにつくまで、そばで祈るように手を組んでいた。|{a}は{b}の通る道の瓦礫を、先回りして片付けておいた。'),
      love: L('{b}は、自分を崇めるように見つめる{a}の頬に、そっと手を添えた。{b}「{a}、崇めるんじゃなくて、隣にいてほしい｜{a}、崇めるのではなく、隣にいてほしい｜{a}、崇めるのではなく、隣にいてください」――{a}は信じられないという顔で、{b}の手に自分の手を重ねた。|{a}は{b}の前でひざまずこうとして、{b}に引き止められた。{b}は{a}を立たせて、そのまま抱き寄せた。崇拝は、ゆっくりと恋に変わっていった。'),
      dominate: L('{b}は{a}に命じた。{b}「私以外の言うことは聞くな｜＝｜私以外の言うことは聞かないでください」――{a}は迷わずうなずいた。その従順さに、{b}は満足そうに笑った。|{b}は{a}の忠誠を試すように、無理な命令を重ねた。{a}はひとつも拒まなかった。支配と服従は、日ごとに深くなっていった。'),
      cherish: L('{b}は{a}に、自分のために命を投げ出すようなことはしないでほしいと頼んだ。{a}は長いあいだ黙っていたが、やがて小さくうなずいた。{a}「{b}が望むなら、生きる｜＝｜{b}が望むなら、生きます」|{b}は{a}と並んで座り、自分の弱さを打ち明けた。{a}は初めて、{b}をただの人として見た。それでも、想いは少しも揺らがなかった。'),
      confused: L('{b}は{a}を突き放そうとした。{b}「私は、{a}が思うような人間じゃない｜私は、{a}が思うような人間ではない｜私は、{a}が思うような人間ではありません」――{a}は首を振った。{a}「それでも、{b}は私の光だ｜＝｜それでも、{b}は私の光です」|{b}は{a}に、自分を崇めるのはやめてほしいと言った。{a}は静かに聞いてから、それでもいつもと同じように{b}の水を汲んできた。'),
      grow: L('{a}は{b}を守るためなら、何でもすると誓った。{b}は困ったように笑ったが、その誓いを拒まなかった。|{a}は{b}の役に立てた日には、眠る前に小さく祈った。{a}にとって、{b}のそばにいることが信仰そのものだった。'),
      firm: L('{b}に冷たく突き放されても、{a}の想いは少しも揺らがなかった。{a}「{b}がどう思っていてもいい。私は、{b}を信じている｜＝｜{b}がどう思っていても構いません。私は、{b}を信じています」|{a}は{b}に怒鳴られても、黙って頭を下げた。そして次の朝も、いつもと同じように{b}の分の水を汲んできた。'),
      firmBait: L('{b}に囮にされたことを、{a}は少しも恨んでいなかった。{a}「{b}の役に立てたなら、それでいい｜＝｜{b}の役に立てたなら、それでいいんです」――その言葉に、嘘はひとつもなかった。|{a}は群れに咬まれかけた腕をさすりながら、{b}の隣に戻った。{a}「次も、{b}のためなら行く｜＝｜次も、{b}のためなら行きます」')
    },
    bn: {
      patA: L('{a}は{b}の様子を、何かと気にかけていた。{a}「無理はしないで。せっかく拾った命なんだから｜無理はするな。せっかく拾った命だ｜無理はしないでください。せっかく拾った命です」|{a}は{b}に、生き延びるための知恵を一つずつ教えた。かつて{b}を助けた日と同じように。'),
      patB: L('{b}は{a}の荷物を、当然のように自分が背負った。{b}「{a}に受けた恩に比べれば、こんなもの｜{a}に受けた恩に比べれば、こんなものは何でもない｜{a}に受けた恩に比べれば、こんなもの何でもありません」|{b}は、{a}が少しでも休めるよう、見張りを率先して引き受けた。|{b}は{a}の好みを覚えていて、見つけた食料の中から{a}の好きなものを取り分けた。'),
      keep: L('{a}「もう恩は返してもらったよ｜もう恩は返してもらった｜もう恩は返してもらいました」――{b}は首を振った。{b}「まだ、全然足りない｜まだ、まったく足りない｜まだ、全然足りません」|{b}が差し出した缶詰を、{a}は半分だけ受け取った。{a}「残りは{b}が食べる。それが、私への恩返しだ｜＝｜残りは{b}が食べてください。それが、私への恩返しです」'),
      grow: L('{b}は{a}が群れに囲まれかけたとき、迷わず飛び込んで{a}を引きずり出した。{b}「あの日の借りを、ようやく返せた｜＝｜あの日の借りを、ようやく返せました」――{a}は息を切らしながら、{b}の肩を抱いた。|{b}は、熱を出した{a}を一晩じゅう看病した。{a}が目を開けると、{b}は泣き笑いの顔をしていた。{b}「今度は、私が助ける番だった｜＝｜今度は、私が助ける番でした」|{a}は{b}に言った。{a}「もう、恩人と恩を受けた側じゃない。対等な仲間だ｜もう、恩人と恩を受けた側ではない。対等な仲間だ｜もう、恩人と恩を受けた側ではありません。対等な仲間です」――{b}は少し迷ってから、その言葉を受け取った。'),
      love: L('{b}は、感謝だけでは説明のつかない気持ちに気づいていた。{b}「{a}のそばにいたいのは、恩のためだけじゃない｜{a}のそばにいたいのは、恩のためだけではない｜{a}のそばにいたいのは、恩のためだけではありません」――{a}は、驚いたように{b}を見つめ返した。|{a}は、恩を返そうと必死な{b}の手を止めた。{a}「もういい。恩じゃなくて、{b}自身にそばにいてほしい｜もういい。恩ではなく、{b}自身にそばにいてほしい｜もういいんです。恩ではなく、{b}自身にそばにいてほしいんです」')
    },
    rl: {
      pat: L('{a}と{b}は、親戚の誰がどこにいるはずだったかを指折り数えた。半分も数えないうちに、二人とも黙り込んだ。|{a}「祖母の家のほう、無事だと思う？｜祖母の家のほうは、無事だと思うか｜祖母の家のほうは、無事だと思いますか」――{b}は答えられずに、遠くの煙を見つめた。|{a}と{b}は、最後に親族みんなで集まった日の話をした。誰が何を持ってきて、誰が酔いつぶれたか。笑っているうちに、二人とも目が赤くなった。'),
      fam: L('{a}は{b}に、{f}の消息を尋ねた。{b}も同じことを訊こうとしていた。親族どうし、案じている顔は同じだった。|{a}は、{f}と最後に連絡が取れたときのことを{b}に話した。{b}は黙って聞いて、{a}の肩を抱いた。'),
      keep: L('{a}は{b}の擦り傷に、子どものころのように絆創膏を貼ってやった。{b}「いつまで子ども扱いする気？｜いつまで子ども扱いする気だ｜いつまで子ども扱いするつもりですか」――そう言いながら、{b}は嬉しそうだった。|{a}と{b}は、親族の誰かに会えたときのために、伝言を書いて壁に貼った。二人の名前を、並べて書いた。'),
      grow: L('{a}は{b}に言った。{a}「親戚なんて、年に一度会うだけだと思ってた。……今は、{b}がいてくれてよかった｜親戚など、年に一度会うだけだと思っていた。……今は、{b}がいてくれてよかった｜親戚なんて、年に一度会うだけだと思っていました。……今は、{b}がいてくれてよかったです」――{b}は黙って、{a}の背中を叩いた。|{a}と{b}は、生き延びたら親族みんなで集まろうと約束した。誰が残っているかは分からなかった。それでも、二人は約束をやめなかった。'),
      love: L('{a}は{b}を見つめて、ふと言葉を失った。親戚として見てきたはずの顔が、今は違って見えた。|{a}と{b}は、親族の誰にも言えない気持ちを抱えたまま、肩を寄せ合っていた。')
    }
  };

  /* ---------- 同級生・同僚（向きのない関係） ---------- */
  function flatEv(id, type, key, label) {
    EV.push({
      id: id, cat: 'bond', scope: 'pair',
      when: function (ctx, a, b) { return !!tie(ctx, a, b, type) && RK.cool(ctx, a, b, id, 2); },
      w: function (ctx, a, b) { return 1 + (a.tr.np + a.tr.fc) * 0.3; },
      run: function (ctx, a, b) {
        RK.mark(ctx, a, b, id);
        var t = tie(ctx, a, b, type), rng = ctx.rng, P = T[key], pf = ctx.pair(a, b), k;
        if (grown(ctx, a, b, 35, 30) && RK.cool(ctx, a, b, id + 'G', 8) && rng() < 0.45) {
          RK.mark(ctx, a, b, id + 'G');
          k = loveOk(ctx, a, b, t) && rng() < loveP(ctx, a, b, pf['_zb_' + key]) ? 'love' : 'grow';
        } else k = rng() < 0.4 ? 'keep' : 'pat';
        if (k === 'love') ctx.mod2(a, b, { att: 8, aff: 5 }, { att: 8, aff: 5 });
        else if (k === 'grow') { pf['_zb_' + key] = (pf['_zb_' + key] || 0) + 1; var la = loveOk(ctx, a, b, t) ? 3 : 0; ctx.mod2(a, b, { aff: 7, trust: 8, att: la }, { aff: 7, trust: 8, att: la }); }
        else if (k === 'keep') { ctx.mod2(a, b, { aff: 3, trust: 4 }, { aff: 3, trust: 4 }); ctx.stress(b, -4); }
        else ctx.mod2(a, b, { aff: 2, trust: 2 }, { aff: 2, trust: 2 });
        return { cat: k === 'love' ? 'romance' : k === 'keep' ? 'help' : 'bond', text: ctx.t(ctx.pick(P[k]), a, b),
          why: a.name + 'と' + b.name + 'は' + label + ({ pat: '', keep: '／いつもの距離で支え合う', grow: '／' + (key === 'cm' ? '昔話から距離が縮まった' : '仕事の外で信頼が深まった') + '（好意・信頼が高い）', love: '／親しさが恋に変わった（惹かれ）' }[k]) };
      }
    });
  }
  flatEv('zb_classmate', 'classmate', 'cm', '同級生');
  flatEv('zb_colleague', 'colleague', 'co', '同僚');

  /* ---------- 上司と部下 ---------- */
  EV.push({
    id: 'zb_boss', cat: 'bond', scope: 'pair',
    when: function (ctx, a, b) { return !!tie(ctx, a, b, 'boss') && RK.cool(ctx, a, b, 'zb_boss', 2); },
    w: function (ctx, a, b) { return 1 + a.tr.cp * 0.3 + a.tr.np * 0.2; },
    run: function (ctx, a, b) {
      RK.mark(ctx, a, b, 'zb_boss');
      var t = tie(ctx, a, b, 'boss'), A = ctx.chars[t.a], B = ctx.chars[t.b], rng = ctx.rng, pf = ctx.pair(A, B), k;
      if (grown(ctx, A, B, 30, 40) && RK.cool(ctx, A, B, 'zb_bossG', 8) && rng() < 0.45) {
        RK.mark(ctx, A, B, 'zb_bossG');
        k = loveOk(ctx, A, B, t) && rng() < loveP(ctx, A, B, pf._zb_boss) ? 'love' : 'grow';
      } else if (rng() < 0.4) k = a === A ? 'keepA' : 'keepB';
      else k = a === A ? 'patA' : 'patB';
      if (k === 'love') ctx.mod2(A, B, { att: 8, aff: 5 }, { att: 8, aff: 5 });
      else if (k === 'grow') { pf._zb_boss = (pf._zb_boss || 0) + 1; var lb = loveOk(ctx, A, B, t) ? 3 : 0; ctx.mod2(A, B, { aff: 6, trust: 10, ten: -4, att: lb }, { aff: 7, trust: 8, ten: -4, att: lb }); }
      else if (k === 'keepA') { ctx.mod2(A, B, { aff: 3 }, { trust: 5, aff: 3 }); ctx.stress(B, -5); }
      else if (k === 'keepB') { ctx.mod2(A, B, { trust: 5, aff: 3 }, { aff: 2 }); A.hp = Math.min(100, A.hp + 3); }
      else ctx.mod2(A, B, { trust: 3 }, { trust: 4 });
      return { cat: k === 'love' ? 'romance' : /^keep/.test(k) ? 'help' : 'bond', text: ctx.t(ctx.pick(T.boss[k]), A, B),
        why: A.name + '（上司）と' + B.name + '（部下）' + ({ patA: '：上司として指示を出し、部下を守る', patB: '：部下として上司を立てる', keepA: '：部下を気づかう', keepB: '：上司を支える', grow: '：職場の外で、対等な信頼に変わった（好意・信頼が高い）', love: '：上下の関係が恋に変わった（惹かれ）' }[k]) };
    }
  });

  /* ---------- 執着（信仰） ---------- */
  EV.push({
    id: 'zb_worship', cat: 'help', scope: 'pair',
    when: function (ctx, a, b) { return !!tie(ctx, a, b, 'worship') && RK.cool(ctx, a, b, 'zb_worship', 2); },
    w: function (ctx, a, b) { var t = tie(ctx, a, b, 'worship'); return t.a === a.i ? 1.1 + a.tr.ac * 0.3 + a.tr.np * 0.2 : 0.6; },
    run: function (ctx, a, b) {
      RK.mark(ctx, a, b, 'zb_worship');
      var t = tie(ctx, a, b, 'worship'), A = ctx.chars[t.a], B = ctx.chars[t.b], rng = ctx.rng, cold = t.cold || '', pf = ctx.pair(A, B), k, txt;
      var rb = ctx.R(B, A);
      /* 突き放されても、囮にされても、想いを捨てない */
      if ((pf.zbBait && !pf.zbBaitSeen) || ((rb.ten > 30 || rb.aff < 0 || cold === 'confused' || cold === 'dominate') && RK.cool(ctx, A, B, 'zb_wsFirm', 6) && rng() < 0.3)) {
        var bait = pf.zbBait && !pf.zbBaitSeen;
        if (bait) pf.zbBaitSeen = true;
        RK.mark(ctx, A, B, 'zb_wsFirm');
        ctx.mod(A, B, { aff: 3, trust: 3 });
        ctx.stress(A, 4);
        return { cat: 'solo', text: ctx.t(ctx.pick(bait ? T.ws.firmBait : T.ws.firm), A, B), why: A.name + 'は' + B.name + 'を信仰している。' + (bait ? '囮にされても' : '冷たくされても') + '、その想いは揺らがない' };
      }
      if (grown(ctx, A, B, 20, 20) && RK.cool(ctx, A, B, 'zb_wsG', 7) && rng() < 0.4) {
        RK.mark(ctx, A, B, 'zb_wsG');
        if (cold === 'dominate') k = 'dominate';
        else if (t.love === 'ok' && loveOk(ctx, A, B, t) && rb.aff > 25 && (att(ctx, A, B, 6) || rb.aff > 45) && rng() < 0.6) k = 'love';
        else k = cold === 'cherish' ? 'cherish' : cold === 'confused' ? 'confused' : 'grow';
      } else k = rng() < 0.35 ? 'keep' : a === A ? 'patA' : 'patB';
      if (k === 'love') ctx.mod2(A, B, { att: 10, aff: 4 }, { att: 10, aff: 8 });
      else if (k === 'dominate') { pf.zbDom = (pf.zbDom || 0) + 1; ctx.mod2(A, B, { trust: 4 }, { trust: 5, aff: -2 }); ctx.stress(A, 6); }
      else if (k === 'cherish') { ctx.mod2(A, B, { aff: 5, trust: 5 }, { aff: 8, trust: 6 }); ctx.stress(A, -10); }
      else if (k === 'confused') { ctx.mod2(A, B, { aff: 2 }, { ten: 4, aff: 2 }); }
      else if (k === 'grow') ctx.mod2(A, B, { aff: 5, trust: 5 }, { aff: 4, trust: 4 });
      else if (k === 'keep') ctx.mod2(A, B, { aff: 3, trust: 3 }, { trust: cold === 'dominate' ? 1 : 3, aff: cold === 'cherish' || cold === 'accept' ? 3 : 1 });
      else if (k === 'patB') ctx.mod2(A, B, { aff: 2 }, { aff: cold === 'dominate' ? 0 : 2 });
      else ctx.mod2(A, B, { aff: 2, trust: 2 }, { trust: 2 });
      txt = k === 'patB' ? (T.ws.patB[cold] || T.ws.patB['']) : T.ws[k];
      return { cat: k === 'love' ? 'romance' : k === 'dominate' ? 'conflict' : k === 'patB' || k === 'confused' ? 'bond' : 'help', text: ctx.t(ctx.pick(txt), A, B),
        why: A.name + 'は' + B.name + 'を信仰している' + (cold && HK.WORSHIP_BACK && HK.WORSHIP_BACK[cold] ? '（' + B.name + 'は' + HK.WORSHIP_BACK[cold].short + '）' : '') + ({ patA: '：すべてを捧げようとする', patB: '：信仰される側から見た' + A.name, keep: '：変わらない献身', love: '：「恋愛に発展：する」の組。崇拝が恋に変わった', dominate: '：信仰を利用した支配と服従が深まった', cherish: '：大切に思う相手が、生きてほしいと願った', confused: '：重荷に感じる相手が突き放そうとしても、想いは変わらない', grow: '：献身が深まった' }[k]) };
    }
  });

  /* ---------- 恩人 ---------- */
  EV.push({
    id: 'zb_benefactor', cat: 'help', scope: 'pair',
    when: function (ctx, a, b) { return !!tie(ctx, a, b, 'benefactor') && RK.cool(ctx, a, b, 'zb_bene', 2); },
    w: function (ctx, a, b) { var t = tie(ctx, a, b, 'benefactor'); return t.b === a.i ? 1 + a.tr.ac * 0.3 : 0.7 + a.tr.np * 0.3; },
    run: function (ctx, a, b) {
      RK.mark(ctx, a, b, 'zb_bene');
      var t = tie(ctx, a, b, 'benefactor'), A = ctx.chars[t.a], B = ctx.chars[t.b], rng = ctx.rng, pf = ctx.pair(A, B), k;
      var need = A.hp < 70 || A.stress > 45 || ctx.zb.A[A.z.area].z > 40;
      if (need && RK.cool(ctx, A, B, 'zb_beneG', 7) && rng() < 0.45) {
        RK.mark(ctx, A, B, 'zb_beneG');
        k = loveOk(ctx, A, B, t) && rng() < loveP(ctx, A, B, pf.zbRepaid) ? 'love' : 'grow';
      } else k = rng() < 0.35 ? 'keep' : a === A ? 'patA' : 'patB';
      if (k === 'love') ctx.mod2(A, B, { att: 8, aff: 5 }, { att: 8, aff: 5 });
      else if (k === 'grow') { pf.zbRepaid = (pf.zbRepaid || 0) + 1; var lr = loveOk(ctx, A, B, t) ? 3 : 0; ctx.mod2(A, B, { aff: 8, trust: 10, att: lr }, { aff: 4, trust: 6, att: lr }); A.hp = Math.min(100, A.hp + 6); ctx.stress(A, -8); }
      else if (k === 'keep') ctx.mod2(A, B, { aff: 3, trust: 2 }, { aff: 3, trust: 3 });
      else if (k === 'patB') { ctx.mod2(A, B, { aff: 2, trust: 3 }, { aff: 2 }); ctx.stress(A, -3); }
      else ctx.mod2(A, B, { aff: 2 }, { trust: 3, aff: 2 });
      return { cat: k === 'love' ? 'romance' : 'help', text: ctx.t(ctx.pick(T.bn[k]), A, B),
        why: A.name + '（恩人）と' + B.name + '（恩を受けた側）' + ({ patA: '：恩人は相手を気にかける', patB: '：恩を返そうとする', keep: '：恩は簡単には消えない', grow: '：恩返し（' + A.name + 'が弱っていた／危ない場所だった）。関係が対等に近づいた', love: '：恩返しの先で、感謝が恋に変わった（惹かれ）' }[k]) };
    }
  });

  /* ---------- 親族 ---------- */
  EV.push({
    id: 'zb_relative', cat: 'bond', scope: 'pair',
    when: function (ctx, a, b) { return !!tie(ctx, a, b, 'relative') && RK.cool(ctx, a, b, 'zb_rel', 2); },
    w: function (ctx, a, b) { return 0.8 + a.tr.np * 0.3; },
    run: function (ctx, a, b) {
      RK.mark(ctx, a, b, 'zb_rel');
      var t = tie(ctx, a, b, 'relative'), rng = ctx.rng, pf = ctx.pair(a, b), k, m = { f: '' };
      var fam = a.z.family && a.z.family.pc == null ? a.z.family : b.z.family && b.z.family.pc == null ? b.z.family : null;
      if (grown(ctx, a, b, 35, 40) && RK.cool(ctx, a, b, 'zb_relG', 8) && rng() < 0.45) {
        RK.mark(ctx, a, b, 'zb_relG');
        k = HK.tieFamLove && HK.tieFamLove(t) && loveOk(ctx, a, b, null) && rng() < loveP(ctx, a, b, pf._zb_rel) ? 'love' : 'grow';
      } else if (rng() < 0.35) k = 'keep';
      else k = fam && rng() < 0.6 ? 'fam' : 'pat';
      if (k === 'fam') m.f = (fam === a.z.family ? a.name : b.name) + 'の' + fam.rel;
      if (k === 'love') ctx.mod2(a, b, { att: 7, aff: 4 }, { att: 7, aff: 4 });
      else if (k === 'grow') { pf._zb_rel = (pf._zb_rel || 0) + 1; var lf = HK.tieFamLove && HK.tieFamLove(t) && loveOk(ctx, a, b, null) ? 3 : 0; ctx.mod2(a, b, { aff: 7, trust: 9, att: lf }, { aff: 7, trust: 9, att: lf }); }
      else if (k === 'keep') { ctx.mod2(a, b, { aff: 3, trust: 4 }, { aff: 3, trust: 4 }); ctx.stress(b, -4); }
      else { ctx.mod2(a, b, { aff: 3, trust: 3 }, { aff: 3, trust: 3 }); ctx.stress(a, 2); ctx.stress(b, 2); }
      return { cat: k === 'love' ? 'romance' : k === 'keep' ? 'help' : 'bond', text: ctx.t(fill(ctx.pick(T.rl[k]), m), a, b),
        why: a.name + 'と' + b.name + 'は親族' + ({ pat: '：家族の消息を案じ合う', fam: '：家族の消息を案じ合う', keep: '：いざとなれば助け合う', grow: '：家族としての絆が深まった（好意・信頼が高い）', love: '：「恋愛：あり」の親族。想いが変わった（惹かれ）' }[k]) };
    }
  });

  /* ======================= 群れに捕まったとき ======================= */
  var VT = {
    decoy: L('――{d}は{w}に命じた。{d}「囮になって｜囮になれ｜囮になってください」――{w}は一瞬もためらわず、群れの前へ飛び出していった。{d}はその背中を振り返りもせずに逃げた。|――{d}は{w}の背中を押して、短く言った。{d}「行って。私が逃げるまで、引きつけて｜行け。私が逃げるまで、引きつけろ｜行ってください。私が逃げるまで、引きつけてください」――{w}は黙ってうなずき、わざと大きな音を立てて走り出した。'),
    shield: L('――{w}は{v}の前に身を投げ出した。{w}「{v}には、指一本触れさせない｜＝｜{v}には、指一本触れさせません」|――{w}は{v}に伸びた腕の前へ、迷わず自分の体を差し出した。{w}にとって、{v}を守ること以上に大事なことはなかった。'),
    bene: L('――{w}は{v}に伸びた腕の前へ飛び込んだ。{w}「あの日の恩、ここで返す｜あの日の恩を、ここで返す｜あの日の恩、ここでお返しします」|――{w}は{v}を突き飛ばして、自分が群れの前に残った。{w}「{v}に助けてもらった命だ。使いどころは、ここしかない｜＝｜{v}に助けてもらった命です。使いどころは、ここしかありません」'),
    boss: L('――{w}は{v}の背中を押した。{w}「先に行って。ここは私が食い止める｜先に行け。ここは私が食い止める｜先に行ってください。ここは私が食い止めます」――{v}が振り返ったときには、{w}はもう群れのほうを向いていた。|――{w}は{v}を扉の内側へ押し込んだ。{w}「部下を逃がすのが、上の人間の仕事だから｜部下を逃がすのが、上の人間の仕事だ｜部下を逃がすのが、上の人間の仕事です」'),
    rel: L('――{w}は{v}の襟首を掴んで、力任せに引き戻した。{w}「親族を、こんなところで死なせはしない｜＝｜親族を、こんなところで死なせはしません」――二人はもつれ合うように転がり、群れの手からかろうじて逃れた。|――{w}は{v}の腕を掴んで、群れの中から引きずり出した。{w}「離さないで。家族に会うまで、絶対に離さないで｜離すな。家族に会うまで、絶対に離すな｜離さないでください。家族に会うまで、絶対に離さないでください」')
  };
  var OUT = {
    die: L('{w}の声は、すぐに群れの呻き声に呑まれた。|{w}の姿は、群れの向こうに消えた。それきり、戻ってこなかった。'),
    bite: L('戻ってきた{w}の腕には、くっきりと歯形が残っていた。|{w}の肩に、ゾンビの歯が深く食い込んでいた。それでも{w}は、最後まで退かなかった。'),
    hurt: L('{w}は傷だらけで戻ってきた。それでも{w}は、無事な姿を確かめて、ほっとしたように息をついた。|{w}はしばらくして、足を引きずりながら戻ってきた。咬まれては、いなかった。')
  };
  var DEC_OUT = {
    bite: L('戻ってきた{w}の腕には、歯形が残っていた。{w}「役に立てた｜＝｜役に立てました」――{w}はそれだけ言って、{d}に笑いかけた。'),
    hurt: L('{w}は血まみれで戻ってきた。それでも{d}の無事を確かめると、{w}はほっとしたように息をついた。')
  };
  var REL_HURT = L('{w}の腕には擦り傷ができていたが、咬まれてはいなかった。|{w}は{v}の無事を確かめてから、ようやく自分の傷に気づいた。');
  var BOSS_HURT = L('{w}はしばらくして、足を引きずりながら戻ってきた。{w}「部下を置いて、上の人間だけ逃げられない｜部下を置いて、上の人間だけ逃げるわけにはいかない｜部下を置いて、上の人間だけ逃げるわけにはいきません」');
  function outcome(ctx, w, v, kind, A, out, m) {
    var rng = ctx.rng, r = rng(), die = kind === 'rel' ? 0 : kind === 'decoy' ? 0.2 : 0.16, bite = kind === 'rel' ? 0.12 : 0.45;
    if (r < die) {
      out.text += fill(ctx.pick(OUT.die), m);
      ctx.pair(w, v).sacrifice = w.i;
      ctx.kill(w, null, kind === 'decoy' ? v.name + 'の命令で囮になり、群れに呑まれた' : v.name + 'をかばって、' + A.name + 'で群れに呑まれた');
      return 'die';
    }
    if (r < bite) { out.text += fill(ctx.pick(kind === 'decoy' ? DEC_OUT.bite : OUT.bite), m); Z.infect(ctx, w, 'horde', true); return 'bite'; }
    w.hp -= 10 + rng.int(10); if (w.z.wound < 0) w.z.wound = ctx.stepIndex;
    out.text += fill(ctx.pick(kind === 'decoy' ? DEC_OUT.hurt : kind === 'boss' ? BOSS_HURT : kind === 'rel' ? REL_HURT : OUT.hurt), m);
    return 'hurt';
  }
  Z.tieVictim = function (ctx, g, v, A) {
    var rng = ctx.rng, H = HK.Ties;
    if (!H) return null;
    var others = g.filter(function (o) { return o !== v && o.alive && !o.out && !o.z.bitten && !o.z.alone; });
    if (!others.length) return null;
    var out = { text: '', why: '', mag: 40, with: [] }, w = null, kind = '', d = null;
    /* 信仰を利用して支配している側（v）が、信仰する側に囮を命じる */
    others.forEach(function (o) { var t = !w && H.from(ctx, o, v, 'worship'); if (t && t.cold === 'dominate' && rng() < 0.6) { w = o; kind = 'decoy'; d = v; } });
    /* 信仰する側が盾になる */
    if (!w) others.forEach(function (o) { var t = !w && H.from(ctx, o, v, 'worship'); if (t && t.cold !== 'dominate' && rng() < 0.55 + o.tr.ac * 0.2) { w = o; kind = 'shield'; } });
    /* 恩を受けた側が、命を張って恩を返す */
    if (!w) others.forEach(function (o) { if (!w && H.from(ctx, v, o, 'benefactor') && ctx.R(o, v).aff > 30 && rng() < 0.4 + o.tr.np * 0.2) { w = o; kind = 'bene'; } });
    /* 上司が、部下を逃がすために残る */
    if (!w) others.forEach(function (o) { if (!w && H.from(ctx, o, v, 'boss') && ctx.R(o, v).trust > 20 && rng() < 0.25 + o.tr.np * 0.25 + o.tr.cp * 0.15) { w = o; kind = 'boss'; } });
    /* 親族が力ずくで引き戻す */
    if (!w) others.forEach(function (o) { if (!w && H.has(ctx, o, v, 'relative') && ctx.R(o, v).aff > 20 && rng() < 0.3 + o.tr.np * 0.2) { w = o; kind = 'rel'; } });
    if (!w) return null;
    var m = { w: w.name, v: v.name, d: d ? d.name : '' };
    out.text = fill(ctx.pick(VT[kind]), m);
    out.with = [w];
    var res = outcome(ctx, w, v, kind, A, out, m);
    if (kind === 'decoy') {
      ctx.pair(w, v).zbBait = (ctx.pair(w, v).zbBait || 0) + 1;
      ctx.mod(v, w, { trust: 4 });
      ctx.mod(w, v, { trust: 2 });
      g.forEach(function (o) { if (o !== w && o !== v && o.alive) ctx.mod(o, v, { trust: -15, ten: 12 }); });
      out.why = v.name + 'は' + w.name + 'の信仰を利用して支配している。群れに捕まりかけた' + v.name + 'は、' + w.name + 'に囮を命じた（' + w.name + '：' + { die: '群れに呑まれた', bite: '咬まれた', hurt: 'けがをして戻った' }[res] + '）';
    } else {
      ctx.mod(v, w, { aff: kind === 'rel' ? 12 : 22, trust: kind === 'rel' ? 15 : 25, att: kind === 'shield' || kind === 'bene' ? 4 : 0 });
      if (kind === 'bene') ctx.pair(w, v).zbRepaid = (ctx.pair(w, v).zbRepaid || 0) + 1;
      if (kind === 'rel') { v.hp -= 4 + rng.int(6); }
      ctx.stress(v, res === 'die' ? 30 : 10);
      out.why = { shield: w.name + 'は' + v.name + 'を信仰している。迷わず盾になった', bene: w.name + 'は恩人の' + v.name + 'に、命を張って恩を返した', boss: '上司の' + w.name + 'が、部下の' + v.name + 'を逃がすために残った', rel: '親族の' + w.name + 'が、' + v.name + 'を力ずくで引き戻した' }[kind] + '（' + w.name + '：' + { die: '群れに呑まれた', bite: '咬まれた', hurt: kind === 'rel' ? '二人とも逃げ延びた' : 'けがをして戻った' }[res] + '）';
    }
    out.mag = res === 'die' ? 45 : 36;
    return out;
  };
})();
