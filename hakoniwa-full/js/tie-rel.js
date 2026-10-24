/* 箱庭シミュレーター: 新しい関係（同級生・同僚・上司と部下・執着（信仰）・恩人・親族）の小場面（全エンジン箱庭で共通）
   関係ごとに「ふだんの小場面（向きのある関係は両側の視点）」「関係を保つ出来事」「関係が深まる・変わる出来事」を持つ。
   ・恋に変わる分岐は HK.canLove（両方向）を通した組だけ。執着（信仰）・親族は、さらに「恋愛：あり」（t.love === 'ok'）のときだけ
   ・執着（信仰）は信仰される側の気持ち（t.cold：''／accept／confused／dominate／cherish）で反応を変える。dominate は支配と服従が深まる
   ・信仰する側は、嫌われても突き放されても想いを捨てない（値の減りは ties.js の stiff・floor が抑える）
   ・関係が深まった印は pf.tieGrow[種類] に残す（結末の分類 HK.TieRel.refine が使う） */
(function () {
  'use strict';
  var HK = window.HK;
  function L(s) { return s.split('|'); }
  var TR = (HK.TieRel = {});

  function both(a, b) { return !!(HK.canLove && HK.canLove(a, b) && HK.canLove(b, a)); }
  function grow(ctx, a, b, k) { var pf = ctx.pair(a, b); pf.tieGrow = pf.tieGrow || {}; pf.tieGrow[k] = (pf.tieGrow[k] || 0) + 1; }
  function has(ctx, a, b, ty) { return HK.Ties && HK.Ties.has ? HK.Ties.has(ctx, a, b, ty) : null; }
  /* 発展の分岐に入る見込み（二人の好意と信頼の平均が高いほど） */
  function warmth(ctx, a, b) { var x = ctx.R(a, b), y = ctx.R(b, a); return (x.aff + y.aff + x.trust + y.trust) / 4; }
  function push(ev) { if (HK.COMMON) HK.COMMON.push(ev); }

  /* ---------- 同級生（向きなし） ---------- */
  var CLASSMATE = {
    pat: L('{a}と{b}は、同じクラスだったころの担任の口癖を同時に思い出して、声をそろえて笑った。|{a}「{b}、学生のころから全然変わらない」{b}「それ、褒めてる？」{a}「半分くらいは」|{a}は{b}の字を見て、ノートを借りていたころを思い出した。癖のある字は、あのころのままだった。|{a}と{b}は、卒業アルバムの寄せ書きに誰が何を書いたかで小さく言い合った。どちらの記憶も、少しずつ間違っていた。|{a}は{b}の横顔に、窓際の席に座っていたころの面影を見た。|{a}「同じクラスだったの、もうずいぶん前のことになった」{b}「数えたくない」'),
    keep: L('{a}と{b}は、学生のころのあだ名で互いを呼んでみた。少し照れくさかったが、それだけで肩の力が抜けた。|{a}は{b}が困っているのに気づいて、学生のころと同じように、黙って半分を引き受けた。{b}も、あのころと同じように小さく礼を言った。|{a}「{b}がいると、学生のころに戻ったみたいで落ち着く」{b}「私も。……今がいつなのか、忘れそうになる」|{a}と{b}は、同じクラスにいた顔ぶれの近況を教え合った。知らない話ばかりで、二人とも少し笑った。'),
    clash: L('{a}と{b}は、テストの点で張り合っていたころのように、どちらが先に片づけるかで競い合った。終わってみると、二人とも少し笑っていた。|{b}「学生のころは、{a}に一度も勝てなかった」{a}「今度は私が勝つかもしれない」{b}「言ったな」|{a}と{b}は、昔の文化祭でどちらの案が通ったかを蒸し返して、しばらく言い合いになった。'),
    grow: L('{a}は、学生のころ{b}に言えなかったことを、ようやく口にした。{a}「あのとき、かばってくれてありがとう」{b}はしばらく黙って、それから「覚えてたんだ」と小さく笑った。|{a}と{b}は、卒業してから会わなかった年月の話をした。空白は思ったより短く感じられた。昔の同級生は、いつの間にかいちばん話しやすい相手になっていた。|{b}「同じクラスだったころより、今の{a}のほうがずっと近い気がする」{a}「私も、そう思ってた」'),
    love: L('{a}「学生のころ、私、{b}のことずっと見てた」{b}「……知らなかった」{a}「言わなかったから」――二人のあいだで、昔の教室の空気が少しだけ違う色に変わった。|{b}は{a}の手をとった。{b}「同じクラスだったころには、こんなふうになるなんて思わなかった」{a}は答えのかわりに、その手を握り返した。|{a}は{b}に、卒業式の日に言えなかった言葉があったと打ち明けた。{b}「今なら、聞ける」{a}は少し迷ってから、ずっとしまっていた気持ちを口にした。')
  };
  push({
    id: 'tie_classmate', cat: 'bond', scope: 'pair',
    when: function (ctx, a, b) { return !!has(ctx, a, b, 'classmate'); },
    w: function () { return 1; },
    run: function (ctx, a, b) {
      var ra = ctx.R(a, b), rb = ctx.R(b, a), k;
      var g = warmth(ctx, a, b);
      if (both(a, b) && ra.att > 30 && rb.att > 22 && g > 30 && ctx.rng() < 0.45) k = 'love';
      else if (g > 32 && ctx.rng() < 0.35) k = 'grow';
      else if ((ra.ten > 20 || rb.ten > 20 || a.tr.cp > 0.6) && ctx.rng() < 0.35) k = 'clash';
      else k = ctx.rng() < 0.55 ? 'pat' : 'keep';
      if (k === 'love') { ctx.mod2(a, b, { att: 7, aff: 4 }, { att: 7, aff: 4 }); grow(ctx, a, b, 'classmate'); }
      else if (k === 'grow') { ctx.mod2(a, b, { aff: 6, trust: 6 }, { aff: 6, trust: 6 }); grow(ctx, a, b, 'classmate'); }
      else if (k === 'clash') ctx.mod2(a, b, { ten: 4, aff: 1 }, { ten: 4, trust: 2 });
      else if (k === 'keep') ctx.mod2(a, b, { aff: 3, trust: 4 }, { aff: 3, trust: 4 });
      else ctx.mod2(a, b, { aff: 3, trust: 2 }, { aff: 3, trust: 2 });
      return { cat: k === 'love' ? 'romance' : k === 'clash' ? 'conflict' : 'bond', text: ctx.t(ctx.pick(CLASSMATE[k]), a, b), why: a.name + 'と' + b.name + 'は同級生' + { pat: '：昔の思い出', keep: '：変わらない気安さ', clash: '：昔からの張り合い', grow: '：昔話からの再接近', love: '：昔の同級生が特別な人に' }[k] };
    }
  });

  /* ---------- 同僚（向きなし）：persona.js の tie_colleague（ふだんの小場面）に、保つ・深まる出来事を足す ---------- */
  var COLLEAGUE = {
    keep: L('{a}は{b}の分の作業を、何も言わずに半分引き取った。{b}「助かる。……借りがまた増えた」{a}「職場に戻ったら、まとめて返して」|{a}と{b}は、仕事でやっていたのと同じように、やることを書き出して分担した。段取りが決まると、二人とも少し落ち着いた。|{b}「{a}と同じ職場でよかった。知らない人ばかりだったら、たぶん心が折れてた」{a}「私も、同じことを思ってた」|{a}は{b}の疲れた顔を見て、職場でいつもそうしていたように、温かい飲み物を黙って置いた。'),
    grow: L('{a}と{b}は、職場では一度もしたことのない話をした。家族のこと、昔の夢のこと。同僚という言葉だけでは足りない距離になっていた。|{a}「仕事に戻っても、こうやって話せたらいいな」{b}「なら、まずは昼休みに」――仕事の外での約束は、二人とも初めてだった。|{b}は{a}に、職場では誰にも言えなかった失敗を打ち明けた。{a}は笑わずに聞いて、自分の失敗も一つ話した。'),
    love: L('{a}は{b}の横顔を見て、職場で隣にいたころにはなかった気持ちに気づいた。{a}「{b}、私……同僚のままでいるの、やめたいかもしれない」|{b}は{a}の手に、自分の手を重ねた。仕事の話は、もう出てこなかった。{b}「職場では、{a}のこんな顔、見たことなかった」{a}「{b}の前だけ」|{a}と{b}は、職場で交わしたどの言葉より短い言葉で、互いの気持ちを確かめた。同僚と呼ぶには、もう近すぎた。')
  };
  push({
    id: 'tie_colleague2', cat: 'bond', scope: 'pair',
    when: function (ctx, a, b) { return !!has(ctx, a, b, 'colleague'); },
    w: function () { return 0.6; },
    run: function (ctx, a, b) {
      var ra = ctx.R(a, b), rb = ctx.R(b, a), g = warmth(ctx, a, b), k;
      if (both(a, b) && ra.att > 32 && rb.att > 24 && g > 30 && ctx.rng() < 0.45) k = 'love';
      else if (g > 30 && ctx.rng() < 0.4) k = 'grow';
      else k = 'keep';
      if (k === 'love') { ctx.mod2(a, b, { att: 7, aff: 4 }, { att: 7, aff: 4 }); grow(ctx, a, b, 'colleague'); }
      else if (k === 'grow') { ctx.mod2(a, b, { aff: 6, trust: 6 }, { aff: 6, trust: 5 }); grow(ctx, a, b, 'colleague'); }
      else ctx.mod2(a, b, { trust: 4, aff: 2 }, { trust: 4, aff: 2 });
      return { cat: k === 'love' ? 'romance' : 'bond', text: ctx.t(ctx.pick(COLLEAGUE[k]), a, b), why: a.name + 'と' + b.name + 'は同僚' + { keep: '：いつもの分担', grow: '：仕事の外の顔', love: '：同僚から恋へ' }[k] };
    }
  });

  /* ---------- 上司と部下（{a}=上司 {b}=部下） ---------- */
  var BOSS = {
    a: L('{a}は{b}の報告を最後まで聞いてから、短く頷いた。{a}「よくやった」{b}は背筋を伸ばしたまま、少しだけ口元を緩めた。|{a}は危ない役目を{b}に回さず、黙って自分で引き受けた。部下を守るのが上司の仕事だと思っていた。|{a}は{b}の顔色を見て、手を止めさせた。{a}「{b}、今日はもう休んで。これは指示」|{a}「{b}、判断は任せる。責任は私が取る」{b}は一瞬目を見開いて、それから力強く頷いた。'),
    b: L('{b}は{a}の指示を待たずに、次に要るものを先に揃えておいた。{a}は気づいて、何も言わずに頷いた。|{b}は{a}の背中を見ながら、職場で初めて叱られた日のことを思い出した。あの日から、ずっとこの人の下で働いてきた。|{b}「それは私がやる。{a}は全体を見ていて」{a}は少し驚いて、それから任せた。|{b}は{a}の癖を誰よりも知っていた。考えごとをするとき、決まって腕を組むことも。'),
    clash: L('{b}は初めて{a}の指示に異を唱えた。{a}は眉をひそめたが、最後まで聞いて、{b}の案を採った。|{a}と{b}は進め方で意見が割れた。職場なら{a}の一言で決まるところだが、今は{b}も引かなかった。|{a}「{b}、それは命令違反だ」{b}「分かってる。でも、こっちのほうが{a}を危ない目に遭わせずに済む」'),
    keep: L('{a}は{b}に、仕事のときと同じ調子で「いつもの手順で」と言った。{b}もいつもの調子で応じた。慣れたやり取りが、二人を落ち着かせた。|{b}は{a}の分の食事を、先に取り分けておいた。{a}「部下に気を遣わせる上司って、どうなんだろう」{b}「私がやりたくてやってる」|{a}と{b}は、職場で何度も乗り越えてきた修羅場の話をした。あのときも、二人でどうにかした。'),
    grow: L('{a}は{b}に、上司としてではなく、一人の人として弱音をこぼした。{b}は黙って最後まで聞いた。{b}「肩書きなんて、今はいらないと思う」――二人のあいだの上下が、少しだけ平らになった。|{a}「{b}、今のは命令じゃない。お願い」{b}は驚いて{a}を見て、それから笑った。{b}「お願いなら、喜んで引き受ける」|{b}が{a}の失敗を黙って埋めた。{a}は礼を言ってから、つけ加えた。{a}「職場に戻ったら、{b}を部下じゃなくて、同じ目線の相手として頼りたい」'),
    love: L('{b}は{a}を見つめた。{b}「職場の外では、{a}を上司として見られない」{a}はしばらく黙って、{b}の名前を呼んだ。肩書きのない呼び方だった。|{a}は{b}の髪に触れかけて、手を止めた。{a}「部下にこんなことを思うなんて、上司失格だ」{b}「なら、今だけ上司をやめて」|{a}と{b}は、職場では決して見せない顔で向き合った。指示も報告もない言葉が、二人のあいだに初めて落ちた。')
  };
  push({
    id: 'tie_boss', cat: 'help', scope: 'pair',
    when: function (ctx, a, b) { return !!has(ctx, a, b, 'boss'); },
    w: function () { return 1; },
    run: function (ctx, a, b) {
      var t = has(ctx, a, b, 'boss'), S = ctx.chars[t.a], K = ctx.chars[t.b];
      var rs = ctx.R(S, K), rk = ctx.R(K, S), g = warmth(ctx, S, K), k;
      if (both(S, K) && rk.att > 32 && rs.att > 24 && g > 32 && ctx.rng() < 0.45) k = 'love';
      else if (g > 34 && ctx.rng() < 0.35) k = 'grow';
      else if ((rs.ten > 22 || rk.ten > 22 || K.tr.cp > 0.62) && ctx.rng() < 0.35) k = 'clash';
      else { var x = ctx.rng(); k = x < 0.38 ? 'a' : x < 0.76 ? 'b' : 'keep'; }
      if (k === 'love') { ctx.mod2(S, K, { att: 7, aff: 4 }, { att: 7, aff: 4 }); grow(ctx, S, K, 'boss'); }
      else if (k === 'grow') { ctx.mod2(S, K, { trust: 7, aff: 5 }, { trust: 6, aff: 6 }); grow(ctx, S, K, 'boss'); }
      else if (k === 'clash') ctx.mod2(S, K, { ten: 5, trust: 2 }, { ten: 4, trust: 2 });
      else if (k === 'a') ctx.mod2(S, K, { aff: 2, trust: 2 }, { trust: 5, aff: 3 });
      else if (k === 'b') ctx.mod2(S, K, { trust: 5, aff: 3 }, { aff: 2, trust: 2 });
      else ctx.mod2(S, K, { trust: 4, aff: 2 }, { trust: 4, aff: 2 });
      return { cat: k === 'love' ? 'romance' : k === 'clash' ? 'conflict' : k === 'grow' || k === 'keep' ? 'bond' : 'help', text: ctx.t(ctx.pick(BOSS[k]), S, K), why: S.name + '（上司）と' + K.name + '（部下）' + { a: '：上司の責任', b: '：部下の支え', clash: '：部下の反論', keep: '：いつものやり取り', grow: '：肩書きの外の信頼', love: '：上司と部下を越えて' }[k] };
    }
  });

  /* ---------- 恩人（{a}=恩人 {b}=恩を受けた側） ---------- */
  var BENE = {
    a: L('{a}は{b}が無理をしていないか、何度も気にかけた。昔助けたときから、{b}のことはどうしても放っておけなかった。|{a}「{b}、昔のことなんて、もう気にしなくていいのに」{b}は首を振った。忘れられるはずがなかった。|{a}は{b}が笑っているのを見て、助けてよかったと、あらためて思った。'),
    b: L('{b}は{a}の荷物を、言われる前に持っていた。あの日の恩を思えば、これくらい何でもなかった。|{b}は{a}が眠ったのを確かめてから、そっと上着をかけた。昔、{a}が自分にしてくれたのと同じように。|{b}「{a}がいなかったら、今の私はいない」{a}「大げさすぎ」{b}「大げさじゃない」|{b}は{a}の言葉なら、どんな小さなことでも覚えていた。'),
    keep: L('{a}と{b}は、出会ったころの話をした。{b}は何度でも礼を言い、{a}は何度でも照れくさそうに手を振った。|{b}は{a}を守るように隣に立った。{a}は苦笑いしたが、その場を譲った。|{a}は{b}に、困ったら頼っていいと言った。{b}「頼ってばかりだから、今度は私が」{a}「その気持ちだけで十分」'),
    grow: L('{b}は危ないところで{a}の手を引いた。{a}は息を整えてから、{b}を見た。{a}「……昔と逆になった」{b}「やっと、少しだけ返せた」|{b}は{a}が倒れかけたとき、迷わず肩を貸した。{a}「助けられる日が来るなんて」{b}「ずっと、この日を待ってた」|{a}「もう恩なんて言わないで。{b}は私の大事な人だから」――{b}はうつむいて、しばらく顔を上げられなかった。'),
    love: L('{b}は{a}の手を握った。{b}「最初は恩返しのつもりだった。でも今は、ただ{a}のそばにいたい」{a}は目を伏せて、その手を離さなかった。|{a}は{b}を見て、助けたあの日にはなかった気持ちに気づいた。守る相手だった{b}が、いつの間にか隣に並んでいた。{a}「{b}、私……」その先は、{b}が先に言った。')
  };
  push({
    id: 'tie_benefactor', cat: 'help', scope: 'pair',
    when: function (ctx, a, b) { return !!has(ctx, a, b, 'benefactor'); },
    w: function () { return 1; },
    run: function (ctx, a, b) {
      var t = has(ctx, a, b, 'benefactor'), S = ctx.chars[t.a], K = ctx.chars[t.b];
      var rs = ctx.R(S, K), rk = ctx.R(K, S), g = warmth(ctx, S, K), k;
      var weak = S.stress > 45 || S.hp < 60;
      if (both(S, K) && rk.att > 32 && rs.att > 24 && g > 34 && ctx.rng() < 0.4) k = 'love';
      else if ((g > 34 || weak) && ctx.rng() < (weak ? 0.5 : 0.3)) k = 'grow';
      else { var x = ctx.rng(); k = x < 0.35 ? 'a' : x < 0.78 ? 'b' : 'keep'; }
      if (k === 'love') { ctx.mod2(S, K, { att: 7, aff: 4 }, { att: 7, aff: 4 }); grow(ctx, S, K, 'benefactor'); }
      else if (k === 'grow') { ctx.mod2(S, K, { aff: 7, trust: 8 }, { aff: 4, trust: 4 }); ctx.stress(S, -8); grow(ctx, S, K, 'benefactor'); }
      else if (k === 'a') ctx.mod2(S, K, { aff: 3 }, { aff: 3, trust: 3 });
      else if (k === 'b') ctx.mod2(S, K, { aff: 4, trust: 4 }, { aff: 2 });
      else ctx.mod2(S, K, { aff: 3, trust: 3 }, { aff: 3, trust: 3 });
      return { cat: k === 'love' ? 'romance' : k === 'a' || k === 'b' || k === 'grow' ? 'help' : 'bond', text: ctx.t(ctx.pick(BENE[k]), S, K), why: S.name + '（恩人）と' + K.name + '（恩を受けた側）' + { a: '：恩人の気遣い', b: '：消えない感謝', keep: '：恩でつながる二人', grow: '：恩返し', love: '：恩が恋に変わる' }[k] };
    }
  });

  /* ---------- 親族（向きなし。親子・きょうだいでない） ---------- */
  var REL = {
    pat: L('{a}と{b}は、親戚の集まりでいつも隅の席に並んでいたことを思い出して笑った。|{a}「田舎の家の縁側、覚えてる？」{b}「夏になると、二人でスイカの種を飛ばしてた」|{a}は{b}の仕草に、親族の誰かの面影を見つけた。血のつながりは、こういうところに出るらしい。|{b}「{a}とは、法事くらいでしか会わなかったのに」{a}「こんなところで会うなんて」'),
    keep: L('{a}は{b}の分まで食べ物を取っておいた。親戚の家で、いつもそうしてもらっていたのと同じだった。|{a}と{b}は、家族には言えない愚痴を互いにこぼした。近すぎず遠すぎない親族だから、言えることがあった。|{b}は{a}の寝癖を見て、昔から変わらないと笑った。{a}は少しむくれて、それでも直そうとはしなかった。'),
    grow: L('{a}と{b}は、落ち着いたら一緒に親戚の家へ顔を出そうと約束した。遠い親族だった二人が、家族と呼べる距離になっていた。|{b}「{a}は、私にとっていちばん頼れる家族だ」{a}は照れくさそうに笑って、{b}の背中を軽く叩いた。|{a}は{b}が泣きそうになっているのに気づいて、子どものころのように頭に手を置いた。{a}「大丈夫。親族なんだから、頼っていい」'),
    love: L('{a}は{b}の手を握ったまま、離せなくなった。{a}「親族なのに、こんな気持ちになるなんて」{b}「……私も、同じ」|{b}は{a}を見つめた。親戚の集まりで隣に座っていたころとは、もう違う目だった。{b}「{a}を、家族としてだけ見るのは無理かもしれない」')
  };
  push({
    id: 'tie_relative', cat: 'help', scope: 'pair',
    when: function (ctx, a, b) { return !!has(ctx, a, b, 'relative'); },
    w: function () { return 1; },
    run: function (ctx, a, b) {
      var t = has(ctx, a, b, 'relative'), ra = ctx.R(a, b), rb = ctx.R(b, a), g = warmth(ctx, a, b), k;
      if (t.love === 'ok' && both(a, b) && ra.att > 28 && rb.att > 22 && g > 32 && ctx.rng() < 0.4) k = 'love';
      else if (g > 32 && ctx.rng() < 0.35) k = 'grow';
      else k = ctx.rng() < 0.55 ? 'pat' : 'keep';
      if (k === 'love') { ctx.mod2(a, b, { att: 6, aff: 4 }, { att: 6, aff: 4 }); grow(ctx, a, b, 'relative'); }
      else if (k === 'grow') { ctx.mod2(a, b, { aff: 7, trust: 6 }, { aff: 7, trust: 6 }); grow(ctx, a, b, 'relative'); }
      else if (k === 'keep') ctx.mod2(a, b, { aff: 3, trust: 4 }, { aff: 3, trust: 4 });
      else ctx.mod2(a, b, { aff: 3, trust: 2 }, { aff: 3, trust: 2 });
      return { cat: k === 'love' ? 'romance' : k === 'pat' ? 'bond' : 'help', text: ctx.t(ctx.pick(REL[k]), a, b), why: a.name + 'と' + b.name + 'は親族' + { pat: '：親戚の思い出', keep: '：気安い助け合い', grow: '：家族としての絆', love: '：親族を越えた想い' }[k] };
    }
  });

  /* ---------- 執着（信仰）（{a}=信仰する側 {b}=信仰される側） ---------- */
  var WS = {
    /* 信仰する側のふだん（どの気持ちの相手にも） */
    a: L('{a}は{b}が通ったあとまで、丁寧に片づけて回った。{b}のためにできることなら、どんな小さなことでも嬉しかった。|{a}は{b}の言葉を一つも聞き漏らすまいと、じっと耳を傾けていた。|{a}「{b}のためなら、私は何でもする」――その声には、迷いが一つもなかった。|{a}は{b}の分の食事を先に用意して、自分の分には手をつけなかった。|{a}は{b}を危ないものから遠ざけるように、いつも半歩前に立っていた。'),
    /* 信仰される側の反応（t.cold ごと） */
    back: {
      '': L('{b}は{a}がなぜそこまでしてくれるのか分からず、首をかしげた。{b}「{a}って、誰にでもこうなの？」{a}は答えずに、ただ微笑んだ。|{b}は{a}の視線に気づかないまま、別の話を始めた。{a}はそれでも満ち足りていた。|{b}は{a}の差し出したものを、何の気なしに受け取った。{a}にとっては、それが何よりの恵みだった。'),
      accept: L('{b}は{a}の差し出したものを、当たり前のように受け取った。{b}「ありがとう、{a}」――その一言で、{a}の一日は報われた。|{b}は{a}の頭に手を置いた。{b}「{a}は、本当によく尽くしてくれる」{a}は目を閉じて、その手の重みを確かめた。|{b}は{a}の献身を、静かに受け入れていた。{a}が隣に控えていることが、もう当たり前になっていた。'),
      confused: L('{b}は{a}の献身に、困ったように眉を寄せた。{b}「そこまでしなくていい。……正直、少し重い」{a}は頷いたが、次の日も同じように尽くした。|{b}は{a}から目を逸らした。どう応えればいいのか分からなかった。{a}は、それでも{b}のそばを離れなかった。|{b}「{a}、私はそんな立派な人間じゃない」{a}「知ってる。それでも、{b}がいい」{b}は返す言葉を見つけられなかった。'),
      dominate: L('{b}は{a}に、わざと面倒な用事を言いつけた。{a}は嫌な顔一つせず、むしろ嬉しそうに従った。{b}は、その従順さを確かめるように小さく笑った。|{b}「{a}は、私の言うことなら何でも聞くんだよね」{a}「うん」――ためらいのない返事に、{b}は満足そうに目を細めた。|{b}は{a}に、ほかの誰とも口をきかないよう言いつけた。{a}は黙ってうなずいた。{b}の言葉は、{a}にとって何より重かった。'),
      cherish: L('{b}は{a}の手を取って、その指先の傷に気づいた。{b}「{a}、自分のことも大事にして。お願い」{a}は戸惑って、それからおずおずと頷いた。|{b}は{a}に、自分の分の食事を半分渡した。{b}「{a}が倒れたら、私が困る」{a}は受け取った器を、両手で大事そうに抱えた。|{b}は{a}の名前を、ほかの誰を呼ぶときよりも柔らかく呼んだ。{a}はそのたびに、胸の奥が温かくなった。')
    },
    /* 嫌われても、突き放されても、想いを捨てない */
    spurn: L('{b}は{a}を冷たく突き放した。{a}は少しだけ俯いて、それでも{b}の背中を見送った。{a}「嫌われても、私の想いは変わらない」|{b}に避けられても、{a}は{b}の無事だけを祈っていた。見返りを求めたことは、一度もなかった。|{b}に投げつけられた言葉を、{a}は胸の奥にしまい込んだ。{b}から向けられたものなら、痛みでも手放せなかった。|{b}「もう、私に構わないで」{a}「構わない。でも、離れもしない」――{a}は一歩だけ下がって、そこから{b}を見守り続けた。'),
    /* 関係を保つ（信仰する側の祈り・信仰される側の受け止め） */
    keep: L('{a}は{b}のそばに控え、{b}が何か言う前に必要なものを差し出した。それが{a}にとっての祈りだった。|{a}は夜ごと、{b}の無事を確かめてから眠った。そうしないと、目を閉じられなかった。|{a}は{b}の好きなものを、{b}よりも正確に覚えていた。'),
    /* 発展：気持ちごと（恋にしない） */
    grow: {
      '': L('{b}はようやく、{a}がずっと自分を見ていたことに気づいた。{b}「……いつから？」{a}「最初から」{b}は答えに困って、それでも目を逸らさなかった。|{b}は{a}の献身の理由を、初めて真剣に訊いた。{a}は少し考えてから、「{b}が{b}だから」とだけ答えた。'),
      accept: L('{b}「{a}がいてくれて、私は救われてる」{a}は言葉を失って、ただ深く頭を下げた。信じてきた人に、初めて報われた気がした。|{b}は{a}に、自分の弱さを一つだけ見せた。{a}はそれを、宝物のように受け取った。崇める想いに、守りたいという想いが重なった。'),
      confused: L('{b}は{a}に、もうやめてほしいと言った。{a}は静かに頷いて、それでも最後にこう言った。{a}「やめられない。{b}を想うことは、私の一部だから」|{b}は{a}の重さから逃げるのをやめて、正面から向き合った。{b}「なら、せめて自分を粗末にしないで」{a}は少しだけ迷ってから、その約束を受け入れた。'),
      cherish: L('{b}は{a}を抱き寄せた。{b}「崇められなくていい。{a}が隣にいてくれれば、それでいい」{a}は震える手で、{b}の服の裾を掴んだ。|{b}は{a}に、かしこまらずに名前で呼んでほしいと言った。{a}は何度も口ごもってから、やっと{b}の名前を呼んだ。')
    },
    /* 支配と服従が深まる（dominate） */
    rule: L('{b}は{a}の顎に指をかけて、顔を上げさせた。{b}「{a}は、私のものだよね」{a}「うん。{b}のもの」――答えた瞬間、{a}の中で何かが静かに定まった。|{b}は{a}に、明日の分まで指示を言い渡した。{a}は一つ残らず覚えて、{b}の望むとおりに動いた。{b}の支配が深まるほど、{a}の顔は穏やかになっていった。|{a}は{b}の足もとに膝をついた。{b}は止めなかった。二人のあいだの上下は、もう誰にも崩せないほど固まっていた。|{b}は{a}がほかの誰かに笑いかけたのを咎めた。{a}は青ざめて謝り、二度としないと誓った。{b}はその誓いを、当然のように受け取った。'),
    /* 恋に変わる（t.love === 'ok' のときだけ） */
    love: L('{b}は{a}の手を取った。{b}「崇められるより、隣にいてほしい」{a}は震える声で、{b}の名前を呼んだ。祈るような想いが、恋という形を見つけた。|{a}は{b}に触れられて、息を止めた。ずっと遠くから仰いでいた人が、今は手の届くところにいた。{a}「{b}を、好きになってもいいの？」{b}「とっくに、なってる」|{a}は{b}への想いが、崇めるだけのものではなくなっていることに気づいた。{a}「ごめん。{b}を、ひとりの人として好きになった」{b}は少し驚いて、それから笑って{a}を引き寄せた。')
  };
  push({
    id: 'tie_worship', cat: 'help', scope: 'pair',
    when: function (ctx, a, b) { return !!has(ctx, a, b, 'worship'); },
    w: function () { return 1.15; },
    run: function (ctx, a, b) {
      var t = has(ctx, a, b, 'worship'), S = ctx.chars[t.a], K = ctx.chars[t.b];
      var cold = HK.WORSHIP_BACK && HK.WORSHIP_BACK[t.cold] ? t.cold : '';
      var rs = ctx.R(S, K), rk = ctx.R(K, S), pf = ctx.pair(S, K), k, text;
      var dom = cold === 'dominate' || pf.dominate === K.i;
      var loveOk = t.love === 'ok' && !(HK.tieOptNoLove && HK.tieOptNoLove(t)) && both(S, K) && !dom;
      var cold2 = rk.aff < 0 || rk.ten > 40 || (cold === 'confused' && rk.aff < 15);
      var x = ctx.rng();
      if (loveOk && rs.att > 26 && rk.att > 18 && rk.aff > 25 && x < 0.4) k = 'love';
      else if (dom && x < 0.4) k = 'rule';
      else if (cold2 && x < 0.45) k = 'spurn';
      else if ((rk.aff > 18 || cold === '') && x < 0.6 && ctx.rng() < 0.45) k = 'grow';
      else k = ctx.rng() < 0.3 ? 'keep' : 'pat';
      if (k === 'pat') {
        /* 信仰する側のふだん＋信仰される側の反応 */
        text = ctx.t(ctx.pick(WS.a), S, K);
        if (ctx.rng() < 0.75) text += ctx.t(ctx.pick(WS.back[dom ? 'dominate' : cold]), S, K);
        ctx.mod2(S, K, { aff: 2, trust: 2 }, dom ? { trust: 3 } : cold === 'confused' ? { ten: 2, aff: 1 } : { aff: 3, trust: 2 });
      } else if (k === 'keep') {
        text = ctx.t(ctx.pick(WS.keep), S, K);
        ctx.mod2(S, K, { aff: 3, trust: 3 }, dom ? { trust: 3 } : { aff: 3, trust: 3 });
      } else if (k === 'spurn') {
        text = ctx.t(ctx.pick(WS.spurn), S, K);
        /* 想いは減らない。信仰される側だけが気まずさを抱える */
        ctx.mod2(S, K, { aff: 2, trust: 1 }, { ten: 2, aff: 1 });
        ctx.stress(S, 4);
      } else if (k === 'rule') {
        text = ctx.t(ctx.pick(WS.rule), S, K);
        ctx.mod2(S, K, { trust: 5, aff: 4 }, { trust: 3, aff: 1 });
        grow(ctx, S, K, 'worship_rule');
      } else if (k === 'love') {
        text = ctx.t(ctx.pick(WS.love), S, K);
        ctx.mod2(S, K, { att: 8, aff: 4 }, { att: 8, aff: 5 });
        grow(ctx, S, K, 'worship');
      } else {
        var gk = dom ? 'accept' : cold;
        text = ctx.t(ctx.pick(WS.grow[gk]), S, K);
        ctx.mod2(S, K, { aff: 4, trust: 4 }, cold === 'confused' ? { aff: 5, ten: -4 } : { aff: 6, trust: 6 });
        grow(ctx, S, K, 'worship');
      }
      var why = S.name + 'は' + K.name + 'を信仰している' + (cold && HK.WORSHIP_BACK[cold].short ? '（' + K.name + '：' + HK.WORSHIP_BACK[cold].short + '）' : '');
      why += { pat: '：捧げる日々', keep: '：変わらない祈り', spurn: '：拒まれても揺るがない想い', rule: '：支配と服従が深まる', love: '：信仰が恋に変わる', grow: '：想いが届きはじめる' }[k];
      return { cat: k === 'love' ? 'romance' : k === 'spurn' ? 'conflict' : k === 'rule' ? 'bond' : 'help', text: text, why: why };
    }
  });

  /* ---------- 結末の分類（engine.js の classify から呼んでもらう形。呼ばれなければ使われない） ----------
     cl＝ふつうの分類の結果。新しい関係の組で、上書きしてよい結果のときだけ別の結末を返す（恋人・殺害・破局などは上書きしない） */
  var LABELS = {
    wdevote: { name: '信仰を捧げたまま', cls: 'guard', pol: 1 },
    wsubmit: { name: '支配と服従', cls: 'obsess', pol: 0 },
    repaid: { name: '恩を返した', cls: 'partner', pol: 2 },
    bossbeyond: { name: '上司と部下を越えた', cls: 'partner', pol: 2 },
    classre: { name: '昔の同級生から特別な人へ', cls: 'friend', pol: 2 },
    relbond: { name: '親族として支え合う', cls: 'partner', pol: 2 }
  };
  TR.LABELS = LABELS;
  TR.install = function () { if (HK.LABELS) for (var k in LABELS) if (!HK.LABELS[k]) HK.LABELS[k] = LABELS[k]; };
  var SOFT = /^(friends|partners|guard|strangers|awkward|oneway|obsess|dislike|pining|kinbond|accomplice)$/;
  TR.refine = function (ctx, A, B, pf, cl) {
    if (!cl || !HK.Ties || !SOFT.test(cl.id) || pf.kill || pf.couple) return null;
    TR.install();
    var G = pf.tieGrow || {}, t;
    if ((t = has(ctx, A, B, 'worship'))) {
      var S = ctx.chars[t.a], K = ctx.chars[t.b], rs = ctx.R(S, K);
      if ((pf.dominate === K.i || t.cold === 'dominate') && rs.aff >= 30 && cl.id !== 'pining') return { id: 'wsubmit', dir: S.i };
      if (rs.aff >= 30 && cl.id !== 'pining' && cl.id !== 'partners') return { id: 'wdevote', dir: S.i };
    }
    var ab = ctx.R(A, B), ba = ctx.R(B, A), warm = ab.aff > 22 && ba.aff > 22;
    if ((t = has(ctx, A, B, 'benefactor')) && G.benefactor && warm && /^(friends|partners|guard)$/.test(cl.id)) return { id: 'repaid', dir: t.b };
    if ((t = has(ctx, A, B, 'boss')) && G.boss && warm && ab.trust > 30 && ba.trust > 30 && /^(friends|partners|guard)$/.test(cl.id)) return { id: 'bossbeyond' };
    if (has(ctx, A, B, 'classmate') && G.classmate && ab.aff > 35 && ba.aff > 35 && /^(friends|partners)$/.test(cl.id)) return { id: 'classre' };
    if (has(ctx, A, B, 'relative') && (G.relative || cl.id === 'kinbond') && warm && /^(kinbond|guard|friends|partners)$/.test(cl.id)) return { id: 'relbond' };
    return null;
  };
  TR.pairText = function (ctx, A, B, cl) {
    if (!cl || !LABELS[cl.id]) return null;
    var n = function (i) { return ctx.chars[i].name; }, other = function (i) { return i === A.i ? B.name : A.name; };
    switch (cl.id) {
      case 'wdevote': return n(cl.dir) + 'は最後まで' + other(cl.dir) + 'を信じ、その想いを捧げ続けた。';
      case 'wsubmit': return other(cl.dir) + 'が命じ、' + n(cl.dir) + 'が従う。信仰は、支配と服従の形に固まった。';
      case 'repaid': return n(cl.dir) + 'はようやく恩を返し、' + other(cl.dir) + 'と並んで立てるようになった。';
      case 'bossbeyond': return '上司と部下という肩書きを越えて、互いを頼れる相手になった。';
      case 'classre': return '昔の同級生は、今はいちばん近くにいる特別な人になった。';
      case 'relbond': return '遠い親族だった二人が、家族として互いを支え合う形に落ち着いた。';
    }
    return null;
  };
})();
