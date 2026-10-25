/* 箱庭診断: 合コン／〇〇しないと出られない部屋／クラスメイト */
(function () {
  'use strict';
  var HK = window.HK;
  HK.SCENARIOS = HK.SCENARIOS || {};
  HK.SCEN_ORDER = HK.SCEN_ORDER || [];
  function R(ctx, a, b) { return ctx.R(a, b); }
  function names(list) { return list.map(function (c) { return c.name; }).join('・'); }
  function add(s) { HK.SCENARIOS[s.id] = s; HK.SCEN_ORDER.push(s.id); }
  /* 合コン：恋愛の起こりやすさ（既定の50で1、0で0、100で2） */
  function gRom(ctx) { return (ctx.env.romance == null ? 50 : ctx.env.romance) / 50; }
  function gTaken(ctx, a) { return ctx.chars.some(function (c) { return c !== a && ctx.pair(a, c).couple; }); }
  /* 二股（合コンの中で交際相手が二人になる）まわり。
     関係の設定で恋人・番・運命の番にしてある二人（gTie）は「設定どおりの恋人」。
     恋人を設定で二人以上にしてある人（gMulti）は、二人目ができても二股とは見ない（なりにくくもしない） */
  function gTie(ctx, x, y) { var T = HK.Ties; return !!(T && T.has && (T.has(ctx, x, y, 'lover') || T.has(ctx, x, y, 'mate') || T.has(ctx, x, y, 'fated'))); }
  function gMulti(ctx, x) { var n = 0; ctx.chars.forEach(function (o) { if (o !== x && gTie(ctx, x, o)) n++; }); return n >= 2; }
  /* x に y 以外の交際相手がいるか */
  function gOther(ctx, x, y) { return ctx.chars.some(function (o) { return o !== x && o !== y && ctx.pair(x, o).couple; }); }
  /* a と b が恋人になると、どちらかに二人目の交際相手ができる（設定で恋人を複数にしてある人は除く） */
  function gSecond(ctx, a, b) { return (gOther(ctx, a, b) && !gMulti(ctx, a)) || (gOther(ctx, b, a) && !gMulti(ctx, b)); }
  /* 二人目の交際相手ができる経路を通す割合（目安：今の半分〜3分の1） */
  var G_SECOND_PASS = 0.4;
  /* a と b の両方を恋人にしている人（c）。二人とも関係の設定で c の恋人にしてあるなら対象外 */
  function gShared(ctx, a, b) {
    var L = ctx.chars.filter(function (c) { return c !== a && c !== b && c.alive && !c.out && ctx.pair(a, c).couple && ctx.pair(b, c).couple && !(gTie(ctx, a, c) && gTie(ctx, b, c)); });
    return L[0] || null;
  }
  /* a の恋人（c）の、もう一人の恋人（b）。同じ組では二回まで、続けては起こさない */
  function gRivalOf(ctx, a) {
    if (!a.alive || a.out) return null;
    var hit = null;
    ctx.chars.forEach(function (b) {
      if (hit || b === a || !b.alive || b.out) return;
      var pf = ctx.pair(a, b);
      if ((pf.gTwo || 0) >= 2 || (pf.gTwoAt != null && ctx.stepIndex <= pf.gTwoAt + 1)) return;
      var c = gShared(ctx, a, b);
      if (c) hit = { b: b, c: c };
    });
    return hit;
  }
  /* 嫉妬の出かた（a が c の、もう一人の恋人 b に向ける）：嫉妬・執着、CP、衝動性で強まり、NP で和らぐ。AC が高いと内にこもる */
  function gHeat(a) { return a.tr.jealous * 0.55 + a.tr.cp * 0.35 + a.tr.impulse * 0.2 - a.tr.np * 0.2; }
  function gTwoKind(a, b) {
    var h = gHeat(a);
    if (a.tr.ac > 0.62 && h < 0.6) return 'sulk';
    if (h > 0.58 && gHeat(b) > 0.45) return 'grab';
    if (h > 0.46) return 'press';
    return 'spar';
  }
  var G_TWO = {
    /* さや当て：笑顔のまま牽制し合う */
    spar: [
      '{a}は{b}の隣に座り直して、にこやかにグラスを差し出した。{a}「{c}とは、いつから？」{b}「今日から」――二人は笑顔のまま、音を立てずにグラスを触れ合わせた。',
      '{a}と{b}は、{c}を挟んで同じタイミングで取り皿を差し出した。{a}「どうぞ、お先に」{b}「いえ、そちらこそ」声は柔らかいのに、二人の目はまったく笑っていなかった。',
      '{a}は{b}に聞こえるように、{c}の好きな食べ物を注文した。{b}はそれに張り合うように、{c}の好きな曲の話を始めた。テーブルの上で、静かな点の取り合いが続いた。'
    ],
    /* 取り合い：二人とも引かない */
    grab: [
      '{a}が{c}の右腕を取ると、{b}がすかさず左腕を取った。{a}「{c}は、私と帰る」{b}「決めるのは{c}だ」二人に挟まれて、{c}は身動きが取れなくなった。',
      '{a}は{c}の肩を抱き寄せて、{b}をまっすぐ見た。{b}は一歩も引かずに、{c}の手を握った。{a}「先に付き合ったのは、私」{b}「順番は関係ない」二人の声が、だんだん大きくなっていった。',
      '{a}と{b}は、{c}の隣の席を巡って立ったまま睨み合った。周りの会話が、一つずつ止まっていった。{b}「座るなら、どうぞ」{a}「遠慮はしない」'
    ],
    /* 問い詰める：c に向かう */
    press: [
      '{a}は{c}を廊下に呼び出した。{a}「{b}とも付き合ってるって、本当？」{c}が言葉を探すあいだ、{a}は腕を組んだまま一度も目を逸らさなかった。',
      '{a}はグラスを置いて、{c}に向き直った。{a}「私と{b}、どっちが本気か答えて」テーブルの向こうで、{b}も箸を止めて{c}の答えを待っていた。',
      'トイレから戻った{c}を、{a}が席の手前で待っていた。{a}「さっき{b}に、私に向けるのと同じ顔をしてた」声は低く、少しも震えていなかった。'
    ],
    /* 内にこもる：何も言えずに見ている */
    sulk: [
      '{a}は、{c}と{b}が笑い合うのを向かいの席から見ていた。何か言おうとして、言葉の代わりにウーロン茶を一口飲んだ。グラスを握る指先だけが、白くなっていた。',
      '{b}が{c}の耳元で何か囁いた。{a}はそれに気づかないふりをして、メニューを何度もめくった。同じページを、もう三度は見ていた。',
      '{a}「楽しそう」――{a}はそれだけ言って、{c}と{b}から目を逸らした。その一言のほかは、誰とも話さなかった。{a}の前の料理は、ほとんど手つかずのまま冷めていった。'
    ]
  };
  /* 板挟みになった c の反応 */
  var G_TWO_C = {
    soothe: [
      '{c}は二人の顔を交互に見た。{c}「どっちも大事だから、喧嘩はしないでほしい」その言葉で、空気はかえって冷たくなった。',
      '{c}は慌てて二人のグラスにビールを注ぎ足した。{c}「ほら、今日は楽しく飲もう」笑ったのは、{c}だけだった。',
      '{c}は二人の間に割って入って、両方の手を握った。{c}「ちゃんと話すから、今はやめよう」{a}も{b}も、その手を握り返さなかった。'
    ],
    shrink: [
      '{c}は小さくなった。{c}「ごめん、ごめん」誰に向けた「ごめん」なのか、{c}自身にも分からなかった。',
      '{c}はおろおろと二人の顔を見比べた。言い訳を言いかけては飲み込み、結局何も言えなかった。その沈黙が、二人の苛立ちをさらに煽った。',
      '{c}は耳まで赤くして、グラスの縁ばかり見ていた。{c}「こんなつもりじゃなかった」{a}も{b}も、その言葉を信じてはいなかった。'
    ],
    dodge: [
      '{c}は笑って、話題を王様ゲームに切り替えようとした。誰もそれには乗らなかった。{c}だけが、何事もない顔でスマホをいじっていた。',
      '{c}は肩をすくめた。{c}「今日はそういう話、なしにしない？」はぐらかされたのは、{a}にも{b}にも分かった。',
      '{c}は涼しい顔をしていた。{c}「どっちとも付き合ってる。何か問題？」テーブルが一瞬で静まり返り、{a}と{b}は初めて同じ顔をした。'
    ]
  };
  /* 問い詰めたあと、その場で別れる */
  var G_TWO_END = [
    '{a}は長いため息をついた。{a}「もういい。{b}と、どうぞお幸せに」そう言って、{a}は{c}の手を離した。',
    '{a}はグラスに残った酒を飲み干した。{a}「別れよう。二番目でいるのは、無理」{c}は、引き止める言葉を見つけられなかった。',
    '{a}はしばらく黙っていたが、やがて静かに立ち上がった。{a}「今日で終わりにする」その一言だけを残して、{a}は席を移った。'
  ];
  /* 告白しかけて踏みとどまる（二人目の交際相手になりかけたとき） */
  var G_HOLD = {
    self: [
      '{a}は{b}に何か言いかけて、口をつぐんだ。スマホの待ち受けには、恋人の写真がまだ残っていた。{a}「……なんでもない」{a}は笑って、グラスを持ち直した。',
      '{a}は{b}を店の外に誘い出したところで、足を止めた。{a}「ごめん。今の私が言っていいことじゃなかった」{b}はその意味を察して、黙って頷いた。',
      '{a}は{b}への言葉を、喉の奥で何度か転がした。けれど、恋人の顔が先に浮かんだ。{a}はその言葉を、ビールと一緒に飲み込んだ。'
    ],
    other: [
      '{a}が想いを告げると、{b}は少し困ったように笑った。{b}「ありがとう。でも、私には付き合ってる人がいる」{a}は頷いて、ぎこちなくグラスを空けた。',
      '{a}の言葉を、{b}は最後まで聞いてから首を振った。{b}「その気持ちは嬉しい。でも、恋人を裏切ることはできない」{b}の声は、思ったよりずっと穏やかだった。',
      '{a}が想いを口にしかけたところで、{b}がそっと手を上げて止めた。{b}「それ以上は、聞かないでおく。恋人がいるから」{a}は伸ばしかけた手を、テーブルの下に戻した。'
    ]
  };
  /* 結末：合コンのあとで恋人が二人になっていたとき（{a}＝前からの恋人、{b}＝二股の人、{c}＝新しい恋人） */
  var GC_TWO = {
    rage: [
      '翌朝、{a}のスマホに、{b}と{c}が一緒に帰る写真が届いた。{a}はすぐに{b}へ電話をかけた。{a}「説明して」三人の関係は、その朝から一気にこじれ始めた。',
      '{a}は、{b}が{c}と店を出ていくのを見ていた。その夜、{a}から{b}へのメッセージは二十件を超えた。最後の一件には、「{c}にも会わせて」とあった。',
      '次の週末、{a}は{c}を呼び出した。{a}「{b}は私の恋人。手を引いて」{c}「それは{b}が決めること」三人のグループチャットは、その日から修羅場になった。'
    ],
    cold: [
      '{a}は、{b}が{c}と帰っていったことを翌日の噂で知った。{a}は泣きもせず、怒りもしなかった。その日のうちに、{a}は{b}に別れのメッセージを送った。',
      '{a}は、{b}と{c}が並んで歩いていく後ろ姿を、改札の向こうから見送った。{a}「分かった」誰にともなく呟いて、次の朝、{a}は{b}の連絡先を消した。',
      '{b}から「昨日はごめん」とメッセージが届いた。{a}が返したのは、「{c}とお幸せに」の一言だけだった。それきり、{a}から連絡が来ることはなかった。'
    ],
    ache: [
      '{a}は、{b}が{c}と帰ったことに気づいていた。それでも翌朝、{a}は何も知らないふりをして「おはよう」と送った。返事を待つあいだ、{a}は何度もスマホを伏せては、また表に返した。',
      '{a}は一人で終電に乗り、窓に映る自分の顔をぼんやり見ていた。{b}の隣にいたのが{c}だったことを、何度も思い出した。問い詰める勇気は、まだ湧かなかった。',
      '{a}は{b}に「楽しかった？」とだけ送った。{c}のことは、一言も書かなかった。既読がついたまま、返事はなかなか来なかった。'
    ],
    both: [
      '{b}には、この夜のうちに恋人が二人になっていた。{a}と{c}は、互いの存在を知ったまま、それぞれの電車に乗った。どちらも、{b}を手放すつもりはなかった。',
      '{a}と{c}は、どちらも{b}の恋人として店を出た。駅前で三人の足が止まり、気まずい沈黙が流れた。{b}「また連絡する」{b}は二人に、まったく同じ言葉を言った。',
      '翌日から、{b}のスマホには{a}と{c}のメッセージが交互に届くようになった。二人とも、相手より先に返事が来るかを気にしていた。{b}の二股は、合コンの夜をまたいで続いていくことになった。'
    ]
  };
  var WALK_LOVE = [
    '改札の前で、{a}が足を止めた。「また会いたい。今度は、二人で」――{b}は笑って頷いた。その場で、次の約束が決まった。',
    '駅までの道で、{a}の手の甲が何度も{b}の手に触れた。三度目で、{b}のほうから指を絡めた。「……付き合う？」「うん」',
    '終電を一本見送って、{a}と{b}はホームのベンチで話し込んだ。次の電車が来る前に、二人は恋人になっていた。',
    '「今日のこと、酔ってたからって忘れないでね」と{b}が言った。{a}は「忘れない。ちゃんと付き合いたい」と返した。'
  ];
  var G_CONFESS = [
    'トイレから戻る廊下で、{a}は{b}を呼び止めた。「今日、来てよかった。……{b}に会えたから」',
    '店の外の自販機の前で、{a}は{b}に向き直った。「酔った勢いって思われてもいい。好きになった」',
    '席替えのあと、{a}はテーブルの下で{b}の指先に触れた。「このあと、ちゃんと言いたいことがある。……好き、かもしれない」',
    '{a}は{b}のグラスに自分のグラスを当てて、小さな声で言った。「初対面でこんなこと言うの、変かな。……付き合ってほしい」',
    '盛り上がる声に紛れて、{a}は{b}の耳元に口を寄せた。「さっきから、{b}のことしか見てない」',
    '取り皿を渡すふりをして、{a}は{b}にだけ聞こえる声で言った。「次は、二人で会いたい。……恋人になってほしい」'
  ];
  var G_YES = [
    '{b}は一瞬目を丸くして、それから笑った。「……同じこと、考えてた」',
    '{b}は返事の代わりに、{a}の指をきゅっと握り返した。',
    '{b}は耳まで赤くして頷いた。「じゃあ、今日から、ね」',
    '{b}はスマホを差し出した。「連絡先、一番上にピン留めしといて」'
  ];
  var G_NO = [
    '{b}は困ったように笑った。「今日会ったばかりだし……まずは友達から、じゃだめ？」',
    '{b}は「酔ってるでしょ」と笑って、{a}の額を指でつついた。',
    '{b}は少し黙ってから、「ごめん」と小さく言った。'
  ];

  /* 合コンの結末：お開き（一次会で解散）／終電で解散（二次会まで）。最後に「お開きのあと」（二次会まで行ったら「終電のあと」）の段で、誰が誰と帰ったか・一人で帰った人を締める */
  var GC_OPEN = {
    yes: [
      '終電のアナウンスが流れ、カラオケの部屋の明かりが落ちた。{n}人の合コンは、駅前のロータリーで解散になった。最後に誰かが「楽しかった」と言い、何人かが頷いた。',
      '二次会のカラオケは、最後の一曲を歌い切って終わった。終電間際の改札の前で、幹事が「今日はありがとう」と頭を下げた。それで、この夜の合コンはお開きになった。',
      '終電の時刻が近づいて、誰からともなく上着を手に取った。カラオケ店の前で写真を一枚だけ撮った。{n}人の夜は、そこで解散になった。'
    ],
    no: [
      '「じゃあ、そろそろ」という幹事の一言で、一次会がお開きになった。店の前の歩道で、{n}人は軽く手を振り合った。二次会の話は、誰も言い出さなかった。',
      '会計を済ませて店の外に出ると、夜風が少し冷たかった。二次会には行かず、合コンはその場で解散になった。それぞれの帰り道が、店の前で分かれた。',
      '店員がラストオーダーを告げに来て、宴はそこで締めになった。暖簾をくぐって外に出ると、通りはもう静かだった。{n}人の合コンは、そこで終わった。'
    ]
  };
  var GC_PAIR = {
    keep: [
      '{a}と{b}は、最初から決まっていたように同じタクシーに乗った。恋人どうしの二人にとって、この合コンは少し長い寄り道だった。次の週末の約束は、もう決まっていた。',
      '{a}と{b}は並んで店を出て、同じ部屋に帰っていった。周りに冷やかされても、二人は手を離さなかった。恋人のまま、二人の夜は終わった。',
      '{b}の上着を{a}が持って、二人は一緒にタクシーを拾った。合コンの席では他人のふりをしていたが、帰り道はいつもの恋人どうしだった。二人の関係は、何も変わらなかった。'
    ],
    lover: [
      '{a}と{b}は、同じタクシーで夜の街に消えた。次の朝には、二人は恋人どうしとして同じ駅に向かっていた。合コンで生まれた恋は、そのまま続いていくことになった。',
      '{a}と{b}は二人で店を出て、それきり戻らなかった。朝が来るころ、二人は「付き合おう」と言い合っていた。この合コンは、二人にとって始まりの夜になった。',
      '{a}と{b}を乗せたタクシーのテールランプが、角を曲がって見えなくなった。あの夜をきっかけに、二人は付き合い始めた。グループチャットには、あとで二人の写真が貼られた。'
    ],
    fwb: [
      '{a}と{b}は同じタクシーに乗って帰った。恋人にはならなかったが、「またね」の約束だけが残った。二人は、名前のつかない関係に落ち着いた。',
      '{a}と{b}は、店を出たあと同じ部屋で夜を明かした。朝になっても、二人は「好き」とは言わなかった。それでも連絡は、ときどき続くことになった。',
      '{a}と{b}の夜は、恋人の夜ではなかった。次に会う約束は、決めないまま別れた。二人のあいだには、気楽で曖昧な関係だけが残った。'
    ],
    forget: [
      '{a}と{b}は同じタクシーに乗った。けれど次の朝、二人はその夜のことを口にしなかった。合コンの記憶は、二人のあいだでだけ曖昧なまま閉じられた。',
      '{a}と{b}の夜は、一度きりで終わった。翌朝のメッセージは、短い「おつかれ」だけだった。二人はそれきり、元の他人に戻った。',
      '{a}と{b}は、店を出たあと同じ部屋に帰った。朝の光の中で、二人は目を合わせずに身支度をした。あの夜は、なかったことになった。'
    ],
    unsure: [
      '{a}と{b}は同じタクシーで帰った。あの夜が何だったのか、二人ともまだ言葉にできていない。連絡先の一番上には、互いの名前が残った。',
      '{a}と{b}の夜は明けた。「これって何なんだろうね」と言い合ったが、答えは出なかった。二人の関係は、まだ決まらないまま続いていく。',
      '{a}と{b}は、朝の駅で別れた。次の約束をするかどうか、二人とも決めかねていた。合コンの夜の続きは、まだ書きかけのままだった。'
    ],
    walkLove: [
      '駅まで一緒に歩いた{a}と{b}は、改札の前で恋人になっていた。それぞれの電車に乗ってからも、メッセージは途切れなかった。二人の恋は、合コンの帰り道から始まった。',
      '{a}と{b}は、帰り道の途中で想いを確かめ合った。家に着くまで、二人は電話をつないだままだった。二人にとって、今夜は付き合い始めた日になった。',
      '終電の窓越しに、{a}は{b}に手を振った。{b}も、ホームから大きく振り返した。恋人になったばかりの二人の夜は、そこで静かに終わった。'
    ],
    couple: [
      '店の中で想いを伝え合った{a}と{b}は、手を繋いで駅に向かった。改札の前で、二人はなかなか手を離せなかった。恋人どうしになった二人は、次の約束をしてから別れた。',
      '{a}と{b}は、皆に冷やかされながら二人で帰っていった。合コンの席で始まった恋は、駅までの道でもう当たり前の顔をしていた。二人の帰り道は、恋人の帰り道だった。',
      '{a}と{b}は同じ方向の電車に乗った。並んで吊り革につかまり、降りる駅までずっと話していた。この夜の合コンは、二人が恋人になった夜として残った。'
    ],
    walk: [
      '{a}と{b}は同じ方向の電車に乗った。恋人にはならなかったが、また会う理由はできた。降りる駅で、二人は少しだけ名残惜しそうに手を振った。',
      '{a}と{b}は駅まで一緒に歩いた。その先の約束はまだないが、連絡先は交換した。二人にとって、悪くない夜の終わりだった。',
      '{a}と{b}は改札の前で「またね」と言い合った。友達以上かどうかは、まだ分からない。二人の合コンは、静かな余韻を残して終わった。'
    ]
  };
  var GC_SOLO = {
    crash: [
      '{a}は最後まで酔いが抜けず、誰かの肩を借りてタクシーに乗せられた。翌朝のことは、ほとんど覚えていなかった。グループチャットの写真で、{a}は自分の醜態を知った。',
      '{a}は店の前でしゃがみ込んだまま、しばらく立てなかった。結局、幹事が家の前まで送り届けた。{a}の合コンは、酔いつぶれて終わった。',
      '{a}はタクシーの中で眠ってしまった。運転手に起こされたとき、もう家の前だった。誰と何を話したのか、{a}の記憶は途中で途切れていた。'
    ],
    leave: [
      '{a}は解散の声と同時に、まっすぐ駅へ向かった。目標どおり、誰とも寄り道しなかった。家に着くと、{a}はすぐに靴を脱いでソファに倒れ込んだ。',
      '{a}は「おつかれ」とだけ言って、誰よりも早く改札を抜けた。電車の中で、{a}はやっと肩の力を抜いた。{a}にとって、合コンは無事に終わった仕事だった。',
      '{a}は二次会の誘いをかわして、一人で帰った。帰り道のコンビニで、好きなアイスを買った。{a}の夜は、それでちょうどよかった。'
    ],
    jilt: [
      '{a}は、{b}がほかの人と帰っていくのを、改札の向こうから見送った。声をかけるきっかけは、最後まで来なかった。{a}は一人で電車に乗った。',
      '{a}は{b}の後ろ姿が見えなくなるまで、駅の前に立っていた。スマホを開いて、送りかけたメッセージを消した。{a}の合コンは、片想いのまま終わった。',
      '{a}は、{b}と最後に交わした会話を思い返しながら帰った。{b}の隣にいたのは、自分ではなかった。{a}は終電の窓に額をつけて、目を閉じた。'
    ],
    alone: [
      '{a}は一人で電車に乗った。窓に映る自分の顔が、少しだけ赤かった。誰とも帰らなかったが、悪い夜ではなかった。',
      '{a}は駅で皆と別れて、一人で家路についた。今夜交換した連絡先を、ひとつずつ眺めた。次につながるかどうかは、まだ分からない。',
      '{a}は帰り道、コンビニで水を一本買った。今夜の会話を思い出して、一人で小さく笑った。{a}の合コンは、そこで終わった。'
    ]
  };
  var GC_LAST = {
    love: [
      'こうして、この夜の合コンは{k}組の恋人を残して終わった。',
      'あの夜の合コンから、{k}組の恋人が生まれた。グループチャットはしばらく、その話題で持ちきりになった。',
      'この合コンは、{k}組の恋が始まった夜として、皆の記憶に残った。'
    ],
    pair: [
      '恋人は生まれなかったが、一緒に帰った組はあった。この夜の合コンは、それぞれに少しずつ何かを残して終わった。',
      '誰が誰と帰ったのか、翌日のグループチャットで小さな噂になった。それも、この合コンの締めくくりだった。',
      'この夜の合コンは、恋人こそ生まれなかったものの、次の約束をいくつか残して終わった。'
    ],
    none: [
      '結局、誰も誰とも帰らなかった。グループチャットに残った集合写真だけが、この夜の名残になった。',
      'この夜の合コンは、誰とも結ばれないまま幕を閉じた。翌日、幹事から「また飲もう」とだけメッセージが届いた。',
      '全員がそれぞれの電車で帰り、合コンは何事もなく終わった。恋は始まらなかったが、それもまた一つの結末だった。'
    ]
  };
  /* 結末：合コンのあとで恋人が二人になっていた人（二股）。二人とも関係の設定で恋人にしてある場合は出さない */
  function gCloseTwo(ctx, P, T) {
    P.forEach(function (b) {
      var ps = P.filter(function (o) { return o !== b && ctx.pair(b, o).couple; });
      if (ps.length < 2 || ps.every(function (o) { return gTie(ctx, b, o); })) return;
      var nt = null;
      T.forEach(function (t) { if (t.newLove && (t.a === b.i || t.b === b.i)) nt = ctx.chars[t.a === b.i ? t.b : t.a]; });
      var a, c, k;
      if (nt && ps.indexOf(nt) >= 0) {
        c = nt;
        /* 前からの恋人：設定の恋人を優先、いなければ嫉妬の強い方 */
        var rest = ps.filter(function (o) { return o !== c; }).sort(function (x, y) { return (gTie(ctx, b, y) - gTie(ctx, b, x)) || (gHeat(y) - gHeat(x)); });
        a = rest[0];
        var h = gHeat(a);
        k = h > 0.58 ? 'rage' : !gTie(ctx, a, b) && (a.tr.cold > 0.55 || (h > 0.42 && a.tr.np < 0.4)) ? 'cold' : 'ache';
      } else {
        /* 合コンの中でできた恋人を {c} に、もう一人を {a} に（二人とも設定の恋人という組は出さない） */
        c = ps.filter(function (o) { return !gTie(ctx, b, o); })[0];
        a = ps.filter(function (o) { return o !== c; })[0]; k = 'both';
      }
      var why = '結末：' + b.name + 'には恋人が二人（' + a.name + '・' + c.name + '）。二股の夜のあと／' + a.name + 'の嫉妬・執着 ' + Math.round(a.tr.jealous * 100) + '・CP ' + Math.round(a.eg.CP);
      if (k === 'cold') {
        var pf = ctx.pair(a, b);
        pf.couple = false; pf.gTwoBroke = true;
        a.fateNote = (a.fateNote || '') + '。' + b.name + 'とは別れた';
        why += '。' + a.name + 'は別れを選んだ';
      } else if (k === 'rage') why += '。' + a.name + 'は黙っていなかった';
      else if (k === 'ache') why += '。' + a.name + 'は問い詰められずにいる';
      b.fateNote = (b.fateNote || '') + (k === 'cold' ? '。' + a.name + 'に振られた' : '。恋人が二人になった');
      ctx.say({ kind: 'event', cat: 'conflict', text: ctx.t(ctx.pick(GC_TWO[k]), a, b, c), actors: [a, b, c], mag: 26, why: why });
    });
  }
  function gClose(ctx, P, used) {
    var T = (ctx.flags.together || []).filter(function (t) { return ctx.chars[t.a] && ctx.chars[t.b]; });
    var second = ctx.env.second === 'yes';
    ctx.label = second ? '終電のあと' : 'お開きのあと';
    ctx.say({ kind: 'step', cat: 'phase', text: ctx.label });
    /* 人数には、同じ席にいたモブ（goukon-mob.js）も数える */
    ctx.say({ text: ctx.pick(GC_OPEN[second ? 'yes' : 'no']).replace(/\{n\}/g, P.length + (ctx.gkMob ? ctx.gkMob.length : 0)), mag: 25, why: '結末：' + (second ? '二次会のあと、終電で解散' : '一次会でお開き') });
    var loves = 0, kinds = [];
    T.forEach(function (t) {
      var a = ctx.chars[t.a], b = ctx.chars[t.b], pf = ctx.pair(a, b), k;
      if (t.night) k = t.outc === 'keep' ? 'keep' : t.outc === 'fwb' ? 'fwb' : t.outc === 'forget' ? 'forget' : (t.outc === 'lover' || pf.couple) ? 'lover' : 'unsure';
      else k = t.walk ? 'walkLove' : pf.couple ? 'couple' : 'walk';
      if (k === 'lover' || k === 'walkLove' || k === 'couple') loves++;
      kinds.push(k);
      ctx.say({ text: ctx.t(ctx.pick(GC_PAIR[k]), a, b), actors: [a, b], mag: 25, why: '結末：一緒に帰った二人（' + { keep: 'もとから恋人', lover: '恋人になった', fwb: '恋人ではない関係', forget: 'なかったことに', unsure: 'まだ決まらない', walkLove: '帰り道で恋人に', couple: '店で恋人に', walk: '一緒に帰っただけ' }[k] + '）' });
    });
    gCloseTwo(ctx, P, T);
    var solos = P.filter(function (c) { return !used[c.i]; }), shown = solos.slice(0, 4), rest = solos.slice(4);
    shown.forEach(function (c) {
      var cr = ctx.crush(c, 45), k, b = null;
      if (c.fate === '潰れた') k = 'crash';
      else if (cr && used[cr.i]) { k = 'jilt'; b = cr; }
      else if (c.goal && c.goal.id === 'leave') k = 'leave';
      else k = 'alone';
      ctx.say({ text: ctx.t(ctx.pick(GC_SOLO[k]), c, b), actors: [c], mag: 25, why: '結末：一人で帰った（' + { crash: '酔いつぶれた', jilt: (b ? b.name : '') + 'はほかの人と帰った', leave: '目標「早く帰りたい」', alone: '誰とも帰らなかった' }[k] + '）' });
    });
    if (rest.length) ctx.say({ text: names(rest) + 'も、それぞれの電車で帰っていった。誰の手にも、今夜交換した連絡先が少しずつ残っていた。', actors: rest, mag: 25 });
    var lk = loves ? 'love' : T.length ? 'pair' : 'none';
    ctx.say({ text: ctx.pick(GC_LAST[lk]).replace(/\{k\}/g, loves === 1 ? '一' : loves === 2 ? '二' : loves === 3 ? '三' : String(loves)), mag: 25, why: '結末：恋人になった組 ' + loves + '／一緒に帰った組 ' + T.length });
    /* 結末の題 */
    if (!ctx.flags.outcome) {
      var head = second ? '合コンは終電で解散' : '合コンはお開き', tail;
      if (!T.length) tail = '誰も誰とも帰らなかった';
      else {
        var LV = { lover: 1, walkLove: 1, couple: 1 }, lp = T.filter(function (t, i) { return LV[kinds[i]]; });
        var nmOf = function (l) { return l.slice(0, 2).map(function (t) { return ctx.chars[t.a].name + 'と' + ctx.chars[t.b].name; }).join('、') + (l.length > 2 ? 'ほか' : ''); };
        if (lp.length) tail = nmOf(lp) + 'が恋人になった';
        else if (kinds.every(function (k) { return k === 'keep'; })) tail = nmOf(T) + '（恋人どうし）が一緒に帰った';
        else tail = nmOf(T) + (kinds.every(function (k) { return k !== 'walk'; }) ? 'が同じタクシーで帰った' : 'が一緒に帰った');
      }
      ctx.flags.outcome = head + ' ― ' + tail;
    }
  }

  /* ======================= 合コン ======================= */
  add({
    id: 'goukon', name: '合コン', kicker: '恋愛・社交',
    desc: '居酒屋の個室で一晩。酒が回るほど本音と衝動が出る。最後に誰と帰ったかで決着。',
    unit: '時刻', preRel: 0, lethal: false,
    /* 恋愛が主役の箱庭：恋愛の出来事を多めに */
    catBias: { romance: 1.7 },
    derived: ['impulse', 'honesty', 'warmth', 'jealous'],
    env: [
      { id: 'alcohol', label: '酒の進み', min: 0, max: 100, def: 55, lo: 'ソフドリ', hi: '飲み放題の暴走' },
      { id: 'mood', label: '場の空気', min: 0, max: 100, def: 55, lo: 'しらけ', hi: '盛り上がり' },
      { id: 'second', label: '二次会', type: 'select', def: 'yes', options: [{ v: 'yes', label: 'カラオケまで行く' }, { v: 'no', label: '一次会で解散' }] },
      { id: 'kingsgame', label: '王様ゲーム', type: 'select', def: 'yes', options: [{ v: 'yes', label: 'やる' }, { v: 'no', label: 'やらない' }] },
      /* 住人ではない参加者（goukon-mob.js）。0人なら今までと同じ */
      { id: 'mobs', label: 'モブの参加者', min: 0, max: 4, def: 0, lo: 'なし', hi: '4人', unit: '人', desc: '幹事の友達・数合わせなど、住人ではない参加者。席を埋めて会話や王様ゲームに加わり、二人の仲を取り持ったり、当て馬になったり、割って入ったりするが、誰の恋人にも夜の相手にもならない' }
    ],
    stats: [
      { id: 'drink', label: '酒の強さ', desc: '低いほど早く酔い、衝動性が上がる' },
      { id: 'looks', label: '見た目の自信', desc: '高いほど相手の第一印象（惹かれ）が上がる' }
    ],
    actions: [
      { id: 'watch', label: '端の席で様子見', fit: function (t) { return t.caution; }, bias: { solo: 1.8, romance: 0.7, bond: 0.8 } },
      { id: 'mc', label: '幹事として場を回す', fit: function (t) { return t.lead * 0.6 + t.warmth * 0.4; }, bias: { bond: 1.6, conflict: 1.2 } },
      { id: 'seat', label: '狙いの相手の隣を確保', fit: function (t) { return t.impulse * 0.6 + t.honesty * 0.4; }, bias: { romance: 1.8 } },
      { id: 'eat', label: '食べることに集中', fit: function (t) { return t.cold * 0.5 + t.fc * 0.3; }, bias: { solo: 1.5, romance: 0.6 } }
    ],
    goals: [
      { id: 'lover', label: '恋人を作る', fit: function (t) { return t.honesty * 0.5 + t.ac * 0.3; }, bias: { romance: 1.8 } },
      { id: 'friends', label: '友達を増やす', fit: function (t) { return t.warmth; }, bias: { bond: 1.6, romance: 0.7 } },
      { id: 'takehome', label: '誰かを持ち帰る', fit: function (t) { return t.impulse * 0.7 + t.cold * 0.3; }, bias: { romance: 2.2, bond: 0.7 } },
      { id: 'leave', label: '早く帰りたい', fit: function (t) { return t.cold * 0.6 + t.caution * 0.2; }, bias: { solo: 2, bond: 0.6, romance: 0.4 } },
      { id: 'cupid', label: '誰かの恋を応援する', fit: function (t) { return t.np * 0.8; }, bias: { help: 2 }, needsFocus: true }
    ],
    steps: function (env) {
      var s = ['19:00 乾杯', '19:40 自己紹介', '20:20 盛り上がり', '21:00 席替え', '21:40 王様ゲーム', '22:20 一次会終了'];
      if (env.kingsgame === 'no') s[4] = '21:40 宴たけなわ';
      if (env.second === 'yes') s.push('23:00 二次会・カラオケ', '24:00 終電');
      else s.push('22:40 店の前');
      return s;
    },
    setup: function (ctx) {
      ctx.place = '居酒屋の個室';
      /* 出会いを求めて来た場なので、最初から少し惹かれ合っている（恋愛の起こりやすさで増減） */
      var rf = gRom(ctx);
      ctx.chars.forEach(function (c) {
        c.flags.drunk = 0; c.baseTr = JSON.parse(JSON.stringify(c.tr));
        ctx.others(c).forEach(function (o) { if (HK.canLove(o, c)) ctx.R(o, c).att = HK.clamp(ctx.R(o, c).att + (ctx.stat(c, 'looks') - 3) * 6 + (8 + ctx.rng() * 16) * rf, 0, 100); });
      });
    },
    phase: function (ctx, s) {
      var P = ctx.present(), rng = ctx.rng;
      if (s === 0) ctx.say({ text: names(P) + 'がグラスを合わせた。' + (ctx.env.mood > 60 ? '最初から妙に空気がいい。' : ctx.env.mood < 35 ? '乾杯の声が少しだけ揃わなかった。' : '') });
      if (s === 3 && P.length > 2) {
        var sh = rng.shuffle(P);
        for (var i = 0; i + 1 < sh.length; i += 2) {
          ctx.R(sh[i], sh[i + 1]).att += 4; ctx.R(sh[i + 1], sh[i]).att += 4;
        }
        ctx.say({ text: '席替え。' + sh.map(function (c) { return c.name; }).join('、') + 'の順に座り直した。' });
      }
      if (s === 4 && ctx.env.kingsgame === 'yes' && P.length >= 2) {
        var two = rng.shuffle(P).slice(0, 2), a = two[0], b = two[1];
        /* 恋愛・R18にしない組（HK.ngPair）は組ませない。組める二人がいなければ王様ゲームの命令は出さない */
        if (HK.ngPair(a, b)) { var okp = []; P.forEach(function (x, i) { P.slice(i + 1).forEach(function (y) { if (!HK.ngPair(x, y)) okp.push([x, y]); }); }); if (!okp.length) return; var pr = okp[rng.int(okp.length)]; a = pr[0]; b = pr[1]; }
        var lines = ['見つめ合って10秒', 'ポッキーゲーム', '相手のいいところを3つ言う'];
        var order = rng.pick(lines);
        ctx.k = 1; ctx._mag = 0; ctx._touched = {};
        var shyA = a.tr.ac > 0.6, shyB = b.tr.ac > 0.6;
        ctx.mod2(a, b, { att: shyA ? 12 : 7 }, { att: shyB ? 12 : 7 });
        var txt = '王様の命令で、' + a.name + 'と' + b.name + 'が「' + order + '」をすることになった。';
        if (a.tr.cp > 0.7 || b.tr.cp > 0.7) { txt += (a.tr.cp > b.tr.cp ? a.name : b.name) + 'は最後まで渋い顔をしていた。'; ctx.mod2(a, b, { ten: 6 }, { ten: 6 }); }
        else if (shyA || shyB) txt += (shyA ? a.name : b.name) + 'の耳が赤い。';
        else txt += '二人とも案外ノリノリだった。';
        var e = ctx.say({ kind: 'event', cat: 'romance', actors: [a, b], text: txt, why: '王様ゲーム（ランダム）。反応はCP・ACで分かれる', mag: ctx._mag });
        ctx.pair(a, b).moments.push({ n: e.n, mag: e.mag });
      }
    },
    after: function (ctx) {
      ctx.present().forEach(function (c) {
        c.stress = HK.clamp(c.stress + 3 + c.tr.ac * 6 - c.tr.fc * 2 + (ctx.crush(c, 50) ? 2 : 0), 0, 100);
        var gain = ctx.env.alcohol / 100 * (6 - ctx.stat(c, 'drink')) * (2 + ctx.rng() * 4);
        c.flags.drunk = HK.clamp(c.flags.drunk + gain, 0, 100);
        c.tr.impulse = HK.clamp(c.baseTr.impulse + c.flags.drunk / 220);
        c.tr.honesty = HK.clamp(c.baseTr.honesty + c.flags.drunk / 260);
        c.tr.a = HK.clamp(c.baseTr.a - c.flags.drunk / 300);
      });
    },
    finish: function (ctx) {
      var P = ctx.present(), used = {}, rng = ctx.rng, out = [];
      /* 夜のあと（全年齢でも出る短い一文） */
      var SOFT_END = {
        keep: ['朝、二人は何事もなかったように並んで歯を磨いた。', '翌朝、二人はいつもより少し長く、玄関でキスをした。'],
        lover: ['朝、二人は「ちゃんと付き合おう」と言い合った。', '翌朝の二人は、もう恋人の顔をしていた。'],
        fwb: ['朝、二人は「またね」とだけ言って別れた。恋人ではない「また」だった。', '二人とも、「好き」とは言わなかった。'],
        forget: ['翌朝、二人は昨夜のことをなかったことにした。', '朝になると、二人は他人の顔に戻っていた。'],
        unsure: ['連絡先だけは交換した。その先は、まだ決まっていない。', '「これって何なんだろうね」――答えは、まだ出ていない。']
      };
      function tieHas(a, b, t) { return HK.Ties && HK.Ties.has ? HK.Ties.has(ctx, a, b, t) : false; }
      function nightOutcome(ctx, a, b, fwb) {
        var pf = ctx.pair(a, b), ab = R(ctx, a, b), ba = R(ctx, b, a), mutual = Math.min(ab.aff, ba.aff), dry = (a.tr.cold + b.tr.cold) / 2;
        if (fwb) return 'fwb';
        /* 恋愛はしないが体の関係は許されている二人（engine.js の HK.lockSexOnly）：一夜の関係で、恋人にはならない */
        if (HK.lockSexOnly && HK.lockSexOnly(a, b)) return tieHas(a, b, 'fwb') ? 'fwb' : 'forget';
        if (tieHas(a, b, 'lover') || tieHas(a, b, 'mate')) return 'keep';
        if (pf.couple) return 'lover';
        var imp = (a.tr.impulse + b.tr.impulse) / 2, warm = (a.tr.warmth + b.tr.warmth) / 2;
        /* 好意が深く、二人とも誠実寄りなら恋人に。ドライさ・衝動の強さが勝てば、なかったことに */
        /* どちらかにもう交際相手がいれば（二股になる）、恋人になるのは一部だけ。残りは答えを出さないまま */
        if (mutual >= 46 - rf * 8 && Math.min(ab.att, ba.att) >= 58 - rf * 8 && warm > 0.36) return !gSecond(ctx, a, b) || rng() < G_SECOND_PASS ? 'lover' : 'unsure';
        if (mutual < 26 || dry > 0.56 || (tieHas(a, b, 'rival') && mutual < 36) || (imp > 0.72 && mutual < 36)) return 'forget';
        return 'unsure';
      }
      var rf = gRom(ctx), cand = [];
      for (var i = 0; i < P.length; i++) for (var j = i + 1; j < P.length; j++) {
        var a = P[i], b = P[j], ab = R(ctx, a, b), ba = R(ctx, b, a);
        var v = Math.min(ab.att, ba.att) + Math.min(ab.aff, ba.aff) * 0.5 + (ctx.pair(a, b).couple ? 30 : 0);
        cand.push({ a: a, b: b, v: v });
      }
      cand.sort(function (x, y) { return y.v - x.v; });
      cand.forEach(function (c) {
        /* 恋愛はしないが体の関係は許されている二人は、恋愛相手の固定を外して恋愛対象の向きだけを見る（帰るなら、お持ち帰りの夜だけ） */
        var so = HK.lockSexOnly && HK.lockSexOnly(c.a, c.b), ca = so ? Object.assign({}, c.a, { lock: null }) : c.a, cb = so ? Object.assign({}, c.b, { lock: null }) : c.b;
        if (used[c.a.i] || used[c.b.i] || c.v < 55 - rf * 20 || !HK.canLove(ca, cb) || !HK.canLove(cb, ca)) return;
        /* 家族（きょうだい・親子・親族など）で「恋愛：なし」の二人は、一緒に帰る組・お持ち帰りにしない */
        if (ctx.pair(c.a, c.b).kin) return;
        if (so && !(HK.Pos && HK.Pos.okSex(c.a, c.b))) return;
        used[c.a.i] = used[c.b.i] = 1;
        var imp = (c.a.tr.impulse + c.b.tr.impulse) / 2;
        var night = so || (imp > 0.55 && rng() < imp * 0.9);
        if (night) ctx.pair(c.a, c.b).night = true;
        c.a.fate = c.b.fate = night ? 'お持ち帰り' : '一緒に帰った';
        var tg = { a: c.a.i, b: c.b.i, night: night };
        (ctx.flags.together = ctx.flags.together || []).push(tg);
        c.a.fateNote = c.b.name + 'と' + (night ? '同じ部屋に帰った' : '同じ方向の電車に乗った');
        c.b.fateNote = c.a.name + 'と' + (night ? '同じ部屋に帰った' : '同じ方向の電車に乗った');
        ctx.k = 1; ctx._mag = 0; ctx._touched = {};
        ctx.mod2(c.a, c.b, { att: 10, aff: 6 }, { att: 10, aff: 6 });
        /* R18版：お持ち帰りのあとの夜（solo-goukon-night.js。全年齢版・全年齢モードでは null） */
        /* その夜のあと、二人はどうなるか（恋人／セフレ／なかったことに／まだ答えが出ない）。数値で決まり、関係にも反映する */
        var fwbNow = night && !ctx.pair(c.a, c.b).couple && !tieHas(c.a, c.b, 'lover') && !tieHas(c.a, c.b, 'mate') && HK.FWB && HK.FWB.decide(ctx, c.a, c.b);
        var outc = night ? nightOutcome(ctx, c.a, c.b, fwbNow) : null;
        if (outc) { var on = { keep: '恋人どうしの夜を過ごした', lover: 'そのまま付き合うことになった', fwb: '恋人ではない関係に落ち着いた', forget: '翌朝、なかったことにした', unsure: '関係はまだ決まっていない' }[outc]; c.a.fateNote += '。' + on; c.b.fateNote += '。' + on; }
        var gn = night && HK.GoukonNight ? HK.GoukonNight(ctx, c.a, c.b, outc) : null;
        var wasCouple = !!ctx.pair(c.a, c.b).couple;
        if (outc === 'lover' || outc === 'keep') ctx.pair(c.a, c.b).couple = true;
        /* 一緒に帰っただけの二人も、想いが通じ合っていれば帰り道で付き合うことに */
        var walkLove = !night && !ctx.pair(c.a, c.b).couple && Math.min(R(ctx, c.a, c.b).aff, R(ctx, c.b, c.a).aff) >= 36 - rf * 6 && Math.min(R(ctx, c.a, c.b).att, R(ctx, c.b, c.a).att) >= 50 - rf * 6;
        /* どちらかにもう交際相手がいれば（二股になる）、帰り道で付き合うのは一部だけ */
        if (walkLove && gSecond(ctx, c.a, c.b) && rng() >= G_SECOND_PASS) walkLove = false;
        tg.outc = outc; tg.walk = walkLove; tg.newLove = !wasCouple && (outc === 'lover' || walkLove);
        if (walkLove) { ctx.pair(c.a, c.b).couple = true; c.a.fateNote += '。帰り道で付き合うことになった'; c.b.fateNote += '。帰り道で付き合うことになった'; }
        if (outc === 'forget') ctx.pair(c.a, c.b).forgot = true;
        var e = ctx.say({ kind: 'event', cat: 'romance', actors: [c.a, c.b], text: night ? c.a.name + 'と' + c.b.name + 'は、店を出たあと同じタクシーに乗った。' + (gn ? gn.text : 'その先のことは、二人しか知らない。') + (gn ? '' : (function () {
          /* 受け攻めの指定どおりの「翌朝」 */
          var tb = HK.Pos ? HK.Pos.order(c.a, c.b, [c.a, c.b]) : [c.a, c.b];
          return ctx.t(rng.pick(['――翌朝、{b}は少しだけ腰をかばうように歩いていた。{a}はそれに気づいて、黙って{b}の荷物を持った。', '――翌朝、{a}の背中には{b}の爪の痕が残っていた。{b}は目を合わせずに「……強すぎ」とだけ言った。', '――翌朝、{b}は{a}のシャツを着たまま、ベッドから起き上がれずにいた。', '――翌朝、{a}は先に起きて、まだ眠っている{b}の髪をそっと撫でた。']), tb[0], tb[1]);
        })()) + (!gn && outc ? rng.pick(SOFT_END[outc]) : '') : c.a.name + 'と' + c.b.name + 'は駅まで一緒に歩いた。' + (walkLove ? ctx.t(rng.pick(WALK_LOVE), c.a, c.b) : (ctx.pair(c.a, c.b).couple ? '繋いだ手を、改札の前でなかなか離せなかった。' : '改札で別れるのに少し時間がかかった。')), why: '互いの惹かれ（' + Math.round(Math.min(R(ctx, c.a, c.b).att, R(ctx, c.b, c.a).att)) + '）' + (night ? 'と酔いによる衝動性' : '') + (gn ? '／夜：' + gn.label : outc ? '／その後：' + { keep: '恋人のまま', lover: '恋人になる', fwb: 'セフレに落ち着く', forget: 'なかったことにする', unsure: 'まだ答えが出ない' }[outc] : ''), mag: 25 });
        ctx.pair(c.a, c.b).moments.push({ n: e.n, mag: 25 });
        if (fwbNow) {
          HK.FWB.mark(ctx, c.a, c.b);
          var e2 = ctx.say({ kind: 'event', cat: 'romance', actors: [c.a, c.b], text: '翌朝。' + HK.FWB.after(ctx, c.a, c.b), why: '二人とも「恋人より気楽な関係」寄り（ドライさ・衝動性）', mag: 15 });
          ctx.pair(c.a, c.b).moments.push({ n: e2.n, mag: 15 });
        }
      });
      P.forEach(function (c) {
        if (used[c.i]) return;
        if (c.flags.drunk > 88) { c.fate = '潰れた'; c.fateNote = '最後は誰かに肩を借りて帰った'; }
        else { c.fate = '一人で帰った'; c.fateNote = c.goal.id === 'leave' ? '目標どおり、さっさと帰った' : '終電の窓に映る自分の顔を見ていた'; }
        out.push(c);
      });
      gClose(ctx, P, used);
    },
    events: [
      {
        id: 'drink', cat: 'solo', scope: 'solo',
        w: function (ctx, a) { return ctx.env.alcohol / 100 * (0.4 + a.tr.fc * 0.5 + a.stress / 120); },
        run: function (ctx, a) {
          a.flags.drunk = HK.clamp(a.flags.drunk + 12 * (6 - ctx.stat(a, 'drink')) / 3, 0, 100);
          return { text: ctx.t(a.flags.drunk > 70 ? '{a}の呂律が怪しくなってきた。' : '{a}のグラスがまた空になった。', a), why: '酒の強さ ' + ctx.stat(a, 'drink') + '／酔い ' + Math.round(a.flags.drunk) };
        }
      },
      {
        id: 'nurse', cat: 'help', scope: 'pair',
        when: function (ctx, a, b) { return b.flags.drunk > 55; },
        w: function (ctx, a, b) { return a.tr.np * 1.3; },
        run: function (ctx, a, b) {
          ctx.mod2(a, b, { aff: 3, att: 3 }, { aff: 10, trust: 10, att: 6 });
          return { text: ctx.t('{a}は酔った{b}に水を渡し、上着を取ってやった。', a, b), why: a.name + 'のNP（' + Math.round(a.eg.NP) + '）と' + b.name + 'の酔い' };
        }
      },
      {
        id: 'contact', cat: 'romance', scope: 'pair',
        when: function (ctx, a, b) { return R(ctx, a, b).att > 25 && !ctx.pair(a, b).contact; },
        w: function (ctx, a) { return 0.4 + a.tr.honesty * 0.8; },
        run: function (ctx, a, b) {
          var rb = R(ctx, b, a);
          ctx.pair(a, b).contact = true;
          if (rb.att < 12 && b.tr.cold > 0.6) {
            ctx.mod(a, b, { att: -4 });
            return { text: ctx.t('{a}が連絡先を聞いた。{b}は「あとでグループに貼っといて」とかわした。', a, b), why: b.name + 'のドライさ、' + a.name + 'への関心の薄さ' };
          }
          ctx.mod2(a, b, { att: 6, trust: 3 }, { att: 6, trust: 3 });
          return { text: ctx.t('{a}と{b}が連絡先を交換した。', a, b), why: a.name + 'の積極性（本音の出やすさ）' };
        }
      },
      {
        id: 'wingman', cat: 'help', scope: 'pair',
        when: function (ctx, a, b) { var c = ctx.crush(b, 45); return c && c !== a && c.alive && !c.out && !HK.ngPair(b, c); },
        w: function (ctx, a, b) { return (a.tr.np * 0.7 + a.tr.fc * 0.3) * (a.focus === b ? 2.5 : 1); },
        run: function (ctx, a, b) {
          var c = ctx.crush(b, 45);
          ctx.mod(b, a, { trust: 8, aff: 5 });
          ctx.mod2(b, c, { att: 6 }, { att: 7, aff: 4 });
          if (R(ctx, a, c).att > 35) { ctx.mod(a, c, { att: 4 }); ctx.stress(a, 12); }
          return { with: [c], text: ctx.t('{a}はさりげなく席を立ち、{b}と{c}を二人きりにした。', a, b, c), why: a.name + 'のNP' + (R(ctx, a, c).att > 35 ? '。ただし' + a.name + '自身も' + c.name + 'が気になっていた' : '') };
        }
      },
      {
        id: 'outside', cat: 'romance', scope: 'pair',
        when: function (ctx, a, b) { return R(ctx, a, b).att > 35 && R(ctx, b, a).att > 20; },
        w: function (ctx, a) { return 0.3 + a.tr.impulse * 0.9; },
        run: function (ctx, a, b) {
          ctx.mod2(a, b, { att: 9, trust: 5, aff: 4 }, { att: 9, trust: 5, aff: 4 });
          return { text: ctx.t('「ちょっと外の空気吸ってくる」と言った{a}に、{b}がついてきた。戻ってくるまで十五分かかった。', a, b), why: '互いの惹かれと' + a.name + 'の衝動性' };
        }
      },
      {
        /* 告白：通じれば、その場で恋人に */
        id: 'g_confess', cat: 'romance', scope: 'pair',
        when: function (ctx, a, b) { var pf = ctx.pair(a, b); return ctx.stepIndex >= 2 && HK.canLove(a, b) && !pf.couple && !pf.gconf && !pf.kin && !gTaken(ctx, a) && R(ctx, a, b).att > 44 - gRom(ctx) * 12; },
        w: function (ctx, a, b) { return (0.4 + a.tr.honesty * 0.7 + a.tr.impulse * 0.4 + R(ctx, a, b).att / 100) * (a.goal.id === 'lover' ? 1.8 : 1); },
        run: function (ctx, a, b) {
          var d = gRom(ctx), rb = R(ctx, b, a), pf = ctx.pair(a, b);
          var yes = HK.canLove(b, a) && !gTaken(ctx, b) && (b.lock == null || b.lock === a.i) && rb.att > 36 - d * 10 && rb.aff > 8 - d * 6;
          pf.gconf = true;
          if (yes) { pf.couple = true; ctx.mod2(a, b, { att: 8, aff: 10, trust: 6 }, { att: 8, aff: 10, trust: 6 }); }
          else { ctx.mod2(a, b, { att: -3 }, { aff: 2 }); ctx.stress(a, 10); }
          return { text: ctx.t(ctx.pick(G_CONFESS) + ctx.pick(yes ? G_YES : G_NO), a, b), why: a.name + 'の惹かれ（' + Math.round(R(ctx, a, b).att) + '）と本音の出やすさ。' + b.name + 'の惹かれ（' + Math.round(rb.att) + '）・好意（' + Math.round(rb.aff) + '）' + (yes ? '。その場で恋人に' : ''), mag: yes ? 26 : 16 };
        }
      },
      {
        /* 二股：同じ人（c）の恋人どうしになった a と b が、互いに嫉妬する（さや当て・取り合い・問い詰める・黙って耐える）。c は板挟みになる。
           二人とも関係の設定で c の恋人にしてある場合（恋人を複数にした円満な関係）は起きない */
        /* 相手（b）は場の誰でもよいわけではないので、一人で起こす出来事にして中で選ぶ */
        id: 'g_two', cat: 'conflict', scope: 'solo', pri: true,
        when: function (ctx, a) { return !!gRivalOf(ctx, a); },
        w: function (ctx, a) { return 0.8 + a.tr.jealous * 1.8 + a.tr.cp * 0.6 + a.tr.impulse * 0.3; },
        run: function (ctx, a) {
          var rv = gRivalOf(ctx, a), b = rv.b, c = rv.c, pf = ctx.pair(a, b), pc = ctx.pair(a, c), rc = R(ctx, a, c);
          var k = gTwoKind(a, b), h = gHeat(a);
          pf.gTwo = (pf.gTwo || 0) + 1; pf.gTwoAt = ctx.stepIndex;
          ctx.mod2(a, b, { ten: 8 + h * 14, aff: -4 - h * 6 }, { ten: 6 + gHeat(b) * 12, aff: -3 });
          ctx.mod(a, c, { trust: k === 'sulk' ? -4 : -7, ten: k === 'press' || k === 'grab' ? 8 : 3 });
          ctx.stress(a, k === 'sulk' ? 14 : 9); ctx.stress(c, 12);
          if (HK.Obsess && HK.Obsess.feed) HK.Obsess.feed(ctx, a, c, 4 + Math.round(h * 6));
          var ck = c.tr.np > 0.55 && c.tr.np >= c.tr.cold ? 'soothe' : c.tr.cold > 0.55 || c.tr.ac < 0.3 ? 'dodge' : 'shrink';
          var t = ctx.pick(G_TWO[k]) + ctx.pick(G_TWO_C[ck]);
          /* 問い詰めた側が、その場で別れを選ぶことがある（合コンの中でできた恋人どうしのときだけ）。好意・信頼・NP で踏みとどまり、嫉妬・CP で切る */
          var keep = rc.aff * 0.8 + rc.trust * 0.4 + a.tr.np * 35 + a.tr.ac * 10 - a.tr.cp * 25 - a.tr.jealous * 35 - (ck === 'dodge' ? 15 : 0) + 15;
          var end = k === 'press' && !gTie(ctx, a, c) && keep < ctx.rng() * 100;
          if (end) { pc.couple = false; pc.gTwoBroke = true; ctx.mod2(a, c, { aff: -14, ten: 10 }, { aff: -4, ten: 6 }); t += ctx.pick(G_TWO_END); }
          var KN = { spar: '笑顔のさや当て', grab: c.name + 'の取り合い', press: c.name + 'を問い詰めた', sulk: '何も言えずに見ていた' }, CN = { soothe: 'なだめようとした（NP）', shrink: '縮こまった', dodge: 'はぐらかした（ドライさ）' };
          return { text: ctx.t(t, a, b, c), with: [b, c], mag: end ? 32 : 24,
            why: '二股：' + c.name + 'の恋人が二人（' + a.name + '・' + b.name + '）。' + a.name + 'の嫉妬・執着 ' + Math.round(a.tr.jealous * 100) + '・CP ' + Math.round(a.eg.CP) + '・AC ' + Math.round(a.eg.AC) + '→' + KN[k] + '／' + c.name + 'は' + CN[ck] + (end ? '／' + a.name + 'はその場で別れを選んだ' : '') };
        }
      },
      {
        id: 'phone', cat: 'solo', scope: 'solo',
        w: function (ctx, a) { return a.tr.cold * 0.6 * (1.2 - ctx.env.mood / 100); },
        run: function (ctx, a) {
          ctx.others(a).forEach(function (o) { ctx.mod(o, a, { aff: -3 }); });
          return { text: ctx.t('{a}はテーブルの下でスマホを見ていた。', a), why: a.name + 'のドライさと場の空気' };
        }
      },
      {
        id: 'monopolize', cat: 'conflict', scope: 'pair',
        when: function (ctx, a, b) { var c = ctx.crush(b, 40); return c && c !== a; },
        w: function (ctx, a) { return a.tr.fc * a.tr.cp * 1.4; },
        run: function (ctx, a, b) {
          var c = ctx.crush(b, 40);
          ctx.mod(a, c, { att: 3 });
          ctx.mod(b, a, { ten: 12, aff: -6 });
          return { with: [c], text: ctx.t('{a}が{c}との会話を独占した。{b}は相槌を打つしかなかった。', a, b, c), why: a.name + 'のFC×CP（自分が中心にいたい）' };
        }
      }
    ]
  });

  /* ======================= クラスメイト ======================= */
  var MONTHS = ['4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月', '1月', '2月', '3月'];
  add({
    id: 'classroom', name: 'クラスメイト', kicker: '日常・一年間',
    desc: '同じクラスで過ごす一年。テスト、体育祭、文化祭、修学旅行。行事ごとに関係が動く。',
    unit: '月', preRel: 4, lethal: false, factions: true, maxCast: 30,
    derived: ['warmth', 'lead', 'jealous', 'caution'],
    env: [
      { id: 'grade', label: '学年', type: 'select', def: '2', options: [{ v: '1', label: '高校1年' }, { v: '2', label: '高校2年（修学旅行あり）' }, { v: '3', label: '高校3年（受験）' }, { v: 'all', label: '学園全体（学年は住人ごと・先輩後輩あり）' }], desc: '学園全体にすると、住人ごとの「学年」で1〜3年生が混ざる。上級生と下級生は先輩・後輩になり、後輩は先輩に敬語で「〜先輩」と呼ぶ（呼び方や敬語を自分で決めた人はそのまま）' },
      { id: 'climate', label: 'クラスの雰囲気', min: 0, max: 100, def: 55, lo: '荒れている', hi: '仲がいい' },
      { id: 'faction', label: '派閥が生まれる人数', min: 3, max: 8, def: 4, lo: '3人から', hi: '8人から', unit: '人以上', desc: 'この人数を下回ると派閥には分かれない。上回っても、引っぱる人や信頼がなければ生まれない' },
      { id: 'bully', label: 'いじめ', type: 'select', def: 'auto', options: [{ v: 'auto', label: 'あり（気質と雰囲気しだい）' }, { v: 'high', label: 'あり（起きやすい）' }, { v: 'off', label: 'なし' }], desc: '「なし」にすると、いじめも陰口・嫌がらせの小さな出来事も起きない' },
      { id: 'span', label: '期間', type: 'select', def: 'year', options: [{ v: 'year', label: '一年間' }, { v: 'term', label: '一学期だけ' }] }
    ],
    perFields: [{ id: 'grade', label: '学年（学園全体のとき）', auto: 'おまかせ（2年）', options: [{ id: '1', label: '1年生' }, { id: '2', label: '2年生' }, { id: '3', label: '3年生' }] }],
    /* 学園全体：住人ごとの学年を決め、学年の違う二人を先輩・後輩にする（台詞の敬語と「〜先輩」の呼び方も） */
    extraTies: function (ctx, input) {
      var all = ctx.env.grade === 'all';
      ctx.chars.forEach(function (c) { c.grade = all ? (+((c.pick || {}).grade) || 2) : (+ctx.env.grade || 2); });
      if (!all) return [];
      var out = [], has = {};
      (input.ties || []).forEach(function (t) { has[Math.min(t.a, t.b) + '-' + Math.max(t.a, t.b)] = 1; });
      ctx.chars.forEach(function (a) { ctx.chars.forEach(function (b) {
        if (a.grade <= b.grade || a.role === 'teacher' || b.role === 'teacher') return;
        if (!has[Math.min(a.i, b.i) + '-' + Math.max(a.i, b.i)]) out.push({ a: a.i, b: b.i, type: 'senpai' });
        var y = input.chars[b.i];
        if (y && !y.call && !(y.calls && y.calls[a.name])) { y.calls = Object.assign({}, y.calls || {}); y.calls[a.name] = a.name + '先輩'; }
        if (y && !(y.keigo && Object.keys(y.keigo).length)) { y.keigoSenpai = y.keigoSenpai || {}; y.keigoSenpai[a.name] = 1; }
      }); });
      input.chars.forEach(function (y) { if (y.keigoSenpai) { y.keigo = Object.assign({}, y.keigo || {}, y.keigoSenpai); delete y.keigoSenpai; } });
      return out;
    },
    stats: [
      { id: 'study', label: '学力', desc: 'テストの順位に影響' },
      { id: 'sport', label: '運動', desc: '体育祭の活躍に影響' }
    ],
    actions: [
      { id: 'talky', label: '自分から話しかけまくる', fit: function (t) { return t.warmth; }, bias: { bond: 1.7 } },
      { id: 'club', label: '部活に打ち込む', fit: function (t) { return t.fc * 0.5 + t.a * 0.3; }, bias: { solo: 1.5 } },
      { id: 'rep', label: '委員長に立候補する', fit: function (t) { return t.lead; }, bias: { conflict: 1.3, help: 1.3 } },
      { id: 'window', label: '窓際の席でひとり', fit: function (t) { return t.cold * 0.6 + t.ac * 0.4; }, bias: { solo: 2, bond: 0.6 } }
    ],
    goals: [
      { id: 'lover', label: '恋人を作る', fit: function (t) { return t.honesty * 0.5 + t.fc * 0.4; }, bias: { romance: 1.9 } },
      { id: 'peace', label: '平穏に過ごす', fit: function (t) { return t.ac * 0.6 + t.caution * 0.4; }, bias: { conflict: 0.5, solo: 1.3 } },
      { id: 'center', label: 'クラスの中心になる', fit: function (t) { return t.lead * 0.6 + t.fc * 0.4; }, bias: { bond: 1.4, conflict: 1.3 } },
      { id: 'beat', label: '誰かに勝つ', fit: function (t) { return t.cp * 0.6 + t.aggr * 0.4; }, bias: { conflict: 1.8 }, needsFocus: true },
      { id: 'watch', label: '誰かを見守る', fit: function (t) { return t.np; }, bias: { help: 2, romance: 1.2 }, needsFocus: true }
    ],
    steps: function (env) { return env.span === 'term' ? MONTHS.slice(0, 4) : MONTHS.slice(); },
    setup: function (ctx) {
      ctx.place = '教室';
      ctx.chars.forEach(function (a) { ctx.others(a).forEach(function (b) { ctx.R(a, b).ten = HK.clamp(ctx.R(a, b).ten + (50 - ctx.env.climate) / 8, 0, 100); }); });
    },
    phase: function (ctx, s, n) {
      var P = ctx.present(), rng = ctx.rng, m = ctx.label;
      var e;
      if (s === 0) ctx.say({ text: ctx.env.grade === 'all' ? '始業式。' + [1, 2, 3].map(function (g) { var l = P.filter(function (c) { return c.grade === g; }); return l.length ? g + '年生の' + names(l) : ''; }).filter(Boolean).join('、') + '。同じ学園での一年が始まった。' : '始業式。' + names(P) + 'は同じクラスになった。' });
      if (m === '5月' || m === '12月') {
        var rank = P.map(function (c) { return { c: c, v: ctx.stat(c, 'study') * 10 + rng() * 25 + c.tr.a * 10 }; }).sort(function (x, y) { return y.v - x.v; });
        var top = rank[0].c, bot = rank[rank.length - 1].c;
        ctx.say({ text: (m === '5月' ? '中間' : '期末') + 'テストの結果が出た。トップは' + top.name + '、最下位は' + bot.name + '。' });
        P.forEach(function (c) { if (c !== top && c.tr.cp > 0.6) { ctx.k = 1; ctx.R(c, top).ten += 8; } });
        P.forEach(function (c) { if (c.grade === 3) c.stress = HK.clamp(c.stress + 10, 0, 100); });
      }
      var P2 = P.filter(function (c) { return c.grade === 2; });
      if (m === '11月' && P2.length >= 2) {
        var sh = rng.shuffle(P2);
        ctx.say({ text: (P2.length < P.length ? '二年生の' : '') + '修学旅行。消灯後、部屋のあちこちで話し声が続いた。' });
        for (var i = 0; i + 1 < sh.length; i += 2) {
          ctx.k = 1; ctx._mag = 0; ctx._touched = {};
          var a = sh[i], b = sh[i + 1];
          ctx.mod2(a, b, { trust: 8, att: 4 }, { trust: 8, att: 4 });
          var ab = R(ctx, a, b);
          e = ctx.say({ kind: 'event', cat: ab.att > 35 && ctx.romanceOk([a, b]) ? 'romance' : 'bond', actors: [a, b], text: ab.att > 35 && ctx.romanceOk([a, b]) ? a.name + 'と' + b.name + 'は、旅館の廊下の自販機の前で偶然二人になった。' : a.name + 'と' + b.name + 'は同じ布団の列で、眠くなるまで話した。', why: '修学旅行の夜（ランダムな組み合わせ）', mag: ctx._mag });
          ctx.pair(a, b).moments.push({ n: e.n, mag: e.mag });
        }
      }
      if (HK.ClassLife) HK.ClassLife.month(ctx, s, n);
    },
    after: function (ctx, s, n) { if (HK.ClassLife) HK.ClassLife.after(ctx, s, n); },
    finish: function (ctx) {
      if (HK.ClassLife) HK.ClassLife.finish(ctx);
      ctx.present().forEach(function (c) {
        var g = c.grade === 3;
        if (c.stress > 75) { c.fate = '休みがちに'; c.fateNote = '三学期は教室にいないことが増えた'; }
        else { c.fate = g ? '卒業' : '進級'; c.fateNote = g ? '卒業式の日、' + (ctx.closest(c) ? ctx.closest(c).name + 'と写真を撮った' : '一人で校門を出た') : (ctx.closest(c) ? ctx.closest(c).name + 'と同じクラスになりたいと思っている' : '春休みを待っている'); }
      });
    },
    events: [
      {
        id: 'studytogether', cat: 'bond', scope: 'pair',
        w: function (ctx, a, b) { return 0.2 + Math.abs(ctx.stat(a, 'study') - ctx.stat(b, 'study')) * 0.12 + a.tr.np * 0.3; },
        run: function (ctx, a, b) {
          var teach = ctx.stat(a, 'study') >= ctx.stat(b, 'study');
          ctx.mod2(a, b, { aff: 5, trust: 4 }, { aff: 5, trust: teach ? 8 : 3, att: teach ? 4 : 0 });
          return { text: ctx.t(teach ? '放課後、{a}が{b}に数学を教えた。{b}の方が先に問題を解き終えて、{a}が悔しがった。' : '{a}は{b}にノートを借りた。字が思ったより丁寧だった。', a, b), why: '学力差（' + ctx.stat(a, 'study') + '／' + ctx.stat(b, 'study') + '）' };
        }
      },
      {
        id: 'rumor', cat: 'betray', scope: 'pair',
        when: function (ctx, a, b) { return R(ctx, a, b).ten > 25 || ctx.pair(a, b).jealous > 0; },
        w: function (ctx, a) { return a.tr.jealous * 0.8 * (1.2 - ctx.env.climate / 100) - 0.15; },
        run: function (ctx, a, b) {
          ctx.others(b).forEach(function (o) { if (o !== a) ctx.mod(o, b, { aff: -4, ten: 4 }); });
          ctx.stress(b, 20);
          var found = ctx.rng() < 0.4 + b.tr.a * 0.3;
          if (found) ctx.mod(b, a, { ten: 30, aff: -25, trust: -35 });
          return { text: ctx.t('{b}についての妙な噂がクラスに流れた。出どころは{a}だった。' + (found ? '{b}はそれを突き止めた。' : '{b}はまだ知らない。'), a, b), why: a.name + 'の嫉妬・執着（' + Math.round(a.tr.jealous * 100) + '）と、クラスの雰囲気' };
        }
      },
      {
        id: 'lunch', cat: 'bond', scope: 'pair',
        w: function (ctx, a, b) { return 0.3 + a.tr.warmth * 0.5 + Math.max(0, R(ctx, a, b).aff) / 100; },
        run: function (ctx, a, b) {
          ctx.mod2(a, b, { aff: 5, trust: 3 }, { aff: 5, trust: 3 });
          return { text: ctx.t(ctx.pick(['昼休み、{a}と{b}は屋上で弁当を食べた。', '{a}が購買の最後の焼きそばパンを{b}に譲った。']), a, b), why: '日常の積み重ね' };
        }
      },
      {
        id: 'skip', cat: 'bond', scope: 'pair',
        when: function (ctx, a, b) { return R(ctx, a, b).aff > 15; },
        w: function (ctx, a, b) { return a.tr.fc * b.tr.fc * 1.2 * (1 - a.tr.ac); },
        run: function (ctx, a, b) {
          ctx.mod2(a, b, { aff: 8, att: 5, trust: 6 }, { aff: 8, att: 5, trust: 6 });
          return { text: ctx.t('{a}が{b}を誘って五限をサボった。河川敷で、何をするでもなく時間を潰した。', a, b), why: '二人ともFC高・AC低' };
        }
      },
      {
        id: 'rivalry', cat: 'conflict', scope: 'pair',
        w: function (ctx, a, b) { return a.tr.cp * 0.6 * (a.focus === b ? 2.5 : 0.6) + (b.tr.cp > 0.6 ? 0.2 : 0); },
        run: function (ctx, a, b) {
          var win = ctx.rng() < 0.5 + (ctx.stat(a, 'study') - ctx.stat(b, 'study')) * 0.08;
          ctx.mod2(a, b, { ten: 8, att: 3 }, { ten: 8, att: 3 });
          if (!win) ctx.stress(a, 10);
          return { text: ctx.t(win ? '小テストで{a}が{b}に勝った。{a}はわざわざ点数を見せに行った。' : '{a}はまた{b}に負けた。答案を握りしめた手に力が入った。', a, b), why: a.name + 'のCP（負けず嫌い）' + (a.focus === b ? '。' + b.name + 'を目標にしている' : '') };
        }
      },
      {
        id: 'club', cat: 'solo', scope: 'solo',
        w: function (ctx, a) { return 0.3 + a.tr.fc * 0.3 + (a.action.id === 'club' ? 0.6 : 0); },
        run: function (ctx, a) {
          ctx.stress(a, -12);
          return { text: ctx.t('{a}は部活に打ち込んでいた。教室にいる時間は少なかった。', a), why: '初動「' + a.action.label + '」' };
        }
      }
    ]
  });

  /* 合コンで、すでに交際相手がいる人が二人目の交際相手を作る経路をなりにくくする（設定で恋人を複数にしてある人は除く）。
     共通の告白（confess）は、二股になるときは一部だけ通し、残りは踏みとどまる／断られる文にする。
     片想い・両片想い・セフレからの告白（u_confess・pn_rival・pn_confess・fc_slip）は、二股になるときは起こりにくく */
  var G_COUPLE_W = { u_confess: 1, pn_rival: 1, pn_confess: 1, fc_slip: 1 };
  var bp0 = HK.buildPool;
  if (bp0) HK.buildPool = function (scen) {
    var pool = bp0.apply(this, arguments);
    if (!scen || scen.id !== 'goukon') return pool;
    return pool.map(function (e) {
      if (!e || e.scope !== 'pair') return e;
      if (e.id === 'confess') {
        var w = Object.create(e);
        w.run = function (ctx, a, b) {
          if (!b || !gSecond(ctx, a, b) || ctx.rng() < G_SECOND_PASS) return e.run.apply(this, arguments);
          var p = ctx.pair(a, b), self = gOther(ctx, a, b) && !gMulti(ctx, a);
          if (p.confessed) p.confessed[a.i] = true;
          ctx.stress(a, 6); ctx.mod2(a, b, { att: -2 }, { trust: 3 });
          return { text: ctx.t(ctx.pick(G_HOLD[self ? 'self' : 'other']), a, b), why: (self ? a.name : b.name) + 'にはもう恋人がいる。二股にはならなかった（' + a.name + 'の惹かれ ' + Math.round(R(ctx, a, b).att) + '）', mag: 14 };
        };
        return w;
      }
      if (G_COUPLE_W[e.id] && typeof e.w === 'function') {
        var w2 = Object.create(e);
        w2.w = function (ctx, a, b) { var v = e.w.apply(this, arguments); return b && gSecond(ctx, a, b) ? v * G_SECOND_PASS : v; };
        return w2;
      }
      return e;
    });
  };
})();
