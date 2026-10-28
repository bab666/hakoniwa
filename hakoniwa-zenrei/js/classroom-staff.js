/* 箱庭診断: クラスメイトの先生どうし（職員室）・担任の負荷・危ない生徒を気にかける・3年生の卒業の判定（2026-10-28 担当KB）
   classroom-teacher.js の先生の名簿（ctx.teachers・t.homeroom・t.flags.sub・ctx.teacherOf・HK.ClassTeach）を使う。
   ・職員室：先生が二人以上いる月に 0〜1 回。生徒の相談（うちの○○が）・方針の違いでぶつかる・愚痴と励まし・進路会議（3年）・行事の分担・
     ベテランと新任（年齢の差が 8 以上）・負荷を抱えた先生を支える／責める。気質で書き分け、信頼・緊張が動く。先生どうしの恋愛は足さない（ふつうの仕組みのまま）
   ・担任の負荷：受け持ちの生徒の死（心中を含む）・心中の未遂・長引く不登校・何か月も続くいじめで、担任（副担任は半分）に大きなストレス。
     その場で自責の場面、翌月に態度の変化（CP 厳しくなる／NP 抱え込む／AC 崩れかける／A 記録に追われる／FC 空回り）。
     重なると休職（その月から場にいない t.out。代わりの先生はモブ、副担任がいれば引き継ぐ）。死ネタの重さ「穏やか」では休職まではいかない
   ・気にかける：負担が大きい・遅刻や保健室が続く・いじめの標的・成績が落ちた生徒に、担任が声をかける（廊下・保健室・家庭訪問・親に連絡）。
     届けば負担と「足の重さ」（不登校の手前の段）が下がる。届かないと反発
   ・3年生の卒業：9月から、出席日数（不登校の月）・成績（学力と、テストの最下位の回数）・問題行動（いじめの加害で停学）を見て、
     危ない人に担任が「このままだと」と声をかけ、補習・面談に応えれば持ち直す。2月の判定で、一クラスに多くて一人が卒業できない（flags.ryu.fail）。
     卒業式（classroom-life.js）・行く末（scenario-classroom.js）・結末（classroom-teacher.js の closeYear）に反映する。先生がいなければ担任はモブ */
(function () {
  'use strict';
  var HK = window.HK;
  var cls = HK.SCENARIOS.classroom;
  if (!cls || !HK.ClassTeach) return;
  var CT = HK.ClassTeach;
  var S = HK.ClassStaff = { off: {} };   /* off：点検で仕組みを一つずつ止めて比べるための印（care など。ふだんは空） */
  function R(ctx, a, b) { return ctx.R(a, b); }
  function here(c) { return HK.State.here(c); }
  function style(t) { return HK.voiceTop(t); }
  function by(t, map) { return map[style(t)] || map.NP; }
  function note(ctx, s) { (ctx.flags.endNotes = ctx.flags.endNotes || []).push(s); }
  function T(ctx, s, a, b, c) { return ctx.t(s, a, b, c); }
  /* 先生のストレスは ctx.k（出来事ごとの揺らぎ）を掛けずに足す */
  function strain(t, v) { t.stress = HK.clamp(t.stress + v, 0, 100); }
  function mild(ctx) { return !!(HK.Dark && HK.Dark.on(ctx, 'kill') === 'mild'); }
  function staffHere(ctx) { return (ctx.teachers || []).filter(here); }
  /* 学年の受け持ち（担任。休職していれば代わりの副担任）：場にいる人 */
  function homeroom(ctx, g) { return CT.teachersOf(ctx, g)[0] || null; }
  function isMain(t) { return !t.flags.sub || t.flags.acting; }
  function rl(t) { return CT.role(t); }
  function gradeOf(ctx, c) { return CT.gradeOf(ctx, c); }
  function stu(c) { return !!c && !c.flags.teacher; }
  function bullyOn(ctx) { var B = ctx.flags.bully; return B && !B.stopped ? B : null; }
  function names(l) { return l.map(function (c) { return c.name; }).join('・'); }

  /* ======================= 危ない生徒の見立て ======================= */
  /* 気にかける目安（0 から。0.6 以上を「危ない」とみる）と、その理由 */
  function risk(ctx, c) {
    var r = 0, why = [], B = bullyOn(ctx);
    if (c.stress > 50) { r += (c.stress - 50) / 30; why.push('負担 ' + Math.round(c.stress)); }
    if (c.flags.slump) { r += c.flags.slump * 0.45; why.push('遅刻・保健室が続く'); }
    if (B && B.tg === c.i) { r += 0.5 + B.level * 0.15; why.push('いじめの標的'); }
    if (c.flags.testLow && ctx.stat(c, 'study') <= 2) { r += 0.35; why.push('成績が落ちた'); }
    if (c.flags.returned) { r += 0.15; why.push('休んだあと戻ってきた'); }
    return { r: r, why: why };
  }

  /* ======================= 気にかける（担任→危ない生徒） ======================= */
  /* {a}＝先生 {b}＝生徒。hall 廊下で呼び止める・nurse 保健室・home 家庭訪問・parent 親に連絡 */
  var CARE = {
    hall: {
      CP: '廊下で、{a}が{b}を呼び止めた。「最近、提出物が遅れてる。何かあったなら、言って｜最近、提出物が遅れている。何かあったなら、言え｜最近、提出物が遅れています。何かあったなら、言ってください」声は厳しかったが、{a}の目は{b}から離れなかった。',
      NP: '休み時間、{a}は廊下ですれ違った{b}に声をかけた。「顔色、よくないね。ちょっと話そうか｜顔色がよくないな。少し話そう｜顔色、よくないですね。ちょっと話しましょうか」{a}はそのまま、空いている教室の扉を開けた。',
      A: '{a}は廊下で{b}を呼び止め、小テストの点の移り変わりを見せた。「先月から下がってる。理由を一緒に考えたい｜先月から下がっている。理由を一緒に考えたい｜先月から下がっています。理由を一緒に考えたいんです」責める調子ではなかった。',
      FC: '{a}は廊下で{b}の肩を叩いた。「元気ない顔してる！購買のプリン、おごるから付き合って｜元気のない顔をしている！購買のプリンをおごるから付き合え｜元気のない顔をしてますね！購買のプリン、おごりますから付き合ってください」{b}は面食らったまま、{a}のあとについていった。',
      AC: '{a}は廊下で{b}を見かけて、三回ためらってから声をかけた。「あの…最近、大丈夫？｜その…最近、大丈夫か｜あの…最近、大丈夫ですか？」声は小さかったが、{b}の足は止まった。'
    },
    nurse: {
      CP: '{a}は保健室のベッドの横に立ったまま、{b}に言った。「誰に何をされたのか、全部話して。先生が片をつける｜誰に何をされたのか、全部話せ。先生が片をつける｜誰に何をされたのか、全部話してください。先生が片をつけます」保健の先生が、黙ってカーテンを引いた。',
      NP: '{a}は保健室に顔を出し、ベッドの{b}の横に腰を下ろした。「教室がしんどいなら、しばらくここにいていい｜教室がつらいなら、しばらくここにいていい｜教室がしんどいなら、しばらくここにいていいですよ」保健の先生と目を合わせて、{a}は小さく頷いた。',
      A: '{a}は保健室で、{b}が来た日と時間を書き出していた。「来る日に決まりがある。何の授業のあとか、分かる？｜来る日に決まりがある。何の授業のあとか、分かるか｜来る日に決まりがあります。何の授業のあとか、分かりますか」{b}は、紙の上の日付をじっと見た。',
      FC: '{a}は保健室にトランプを持ってきた。「先生も一回サボる！｜先生も一回サボるぞ！｜先生も一回サボります！」{b}は呆れながら、カードを一枚引いた。',
      AC: '{a}は保健室の前を、何度も行ったり来たりしていた。ようやく中に入ると、ベッドの{b}に「…隣、いい？｜…隣、いいか｜…隣、いいですか」とだけ聞いた。'
    },
    home: {
      CP: '{a}は夕方、{b}の家を訪ねた。親の前で、{a}は{b}に「明日は、八時二十分に校門で待ってる｜明日は、八時二十分に校門で待っている｜明日は、八時二十分に校門で待っています」と告げた。言い方は固かったが、それは約束だった。',
      NP: '{a}は夕方、{b}の家を訪ねた。手土産の焼き菓子を渡して、親とは天気の話しかしなかった。帰り際、{a}は{b}に「来られる日に来ればいいから｜来られる日に来ればいい｜来られる日に来ればいいですから」と言った。',
      A: '{a}は{b}の家を訪ね、親と三人で一週間の時間割を見直した。無理のない通い方が、紙の上に一つずつ並んだ。{b}は、それを自分の部屋の壁に貼った。',
      FC: '{a}は{b}の家を訪ねて、なぜか飼い犬とすっかり仲良くなった。親は笑い、{b}もつられて少しだけ笑った。帰り際、{a}は犬に「また来る」と言うように手を振った。',
      AC: '{a}は{b}の家の前で、インターホンを押すまでに五分かかった。玄関に出てきた{b}に、{a}は「…顔が見たかっただけ｜…顔が見たかっただけだ｜…顔が見たかっただけです」と言った。'
    },
    parent: {
      CP: '{a}は{b}の親に電話をかけ、最近の様子を包み隠さず伝えた。遅刻の回数も、授業中の様子も、一つも省かなかった。電話を切ったあと、{a}はしばらく受話器を見つめていた。',
      NP: '{a}は{b}の親に電話をかけた。責める言葉は一つも使わず、最近疲れているように見えるとだけ伝えた。電話の向こうで、親は長いこと黙っていた。',
      A: '{a}は{b}の親と面談の日を決め、欠席と遅刻の記録を一枚にまとめて渡した。親は、その紙を何度も読み返した。{b}は、その晩の食卓でそれを知った。',
      FC: '{a}は{b}の親に電話をかけたつもりが、気づけば三十分、{b}の小さいころの話を聞いていた。最後に一言だけ、学校での様子を伝えた。',
      AC: '{a}は{b}の親に電話をかけようとして、受話器を二回置いた。三回目に、ようやく番号を最後まで押した。話せたのは、ほんの数分だった。'
    }
  };
  var CARE_OK = [
    '{b}は少し黙ってから、「…ほんとは、ちょっとしんどかった｜…本当は、少しつらかった｜…本当は、ちょっとしんどかったです」と言った。それだけで、{b}の肩から力が抜けたように見えた。',
    '{b}は最初は首を振っていたが、やがてぽつりぽつりと話しはじめた。話し終えるころには、{b}の顔色は少しだけよくなっていた。',
    '{b}は「ありがとう｜すまない、助かる｜ありがとうございます」と小さく言った。次の日から、{b}は朝のホームルームに間に合うようになった。'
  ];
  var CARE_OK_P = ['翌日、{b}のほうから{a}のところへ来た。「家で、言われた｜家で、言われた｜家で、言われました」{b}はそう言って、少しだけ話をしていった。'];
  /* 届かない：CP・攻撃性の高い生徒は反発、ほかははぐらかす */
  var CARE_NG_HOT = [
    '{b}は「放っといて｜放っておいてくれ｜放っておいてください」と言って、{a}に背を向けた。{a}の差し出した手は、行き場をなくした。',
    '{b}は「先生には関係ない｜先生には関係ない｜先生には関係ありません」と言い捨てた。その日から、{b}は{a}と目を合わせなくなった。'
  ];
  var CARE_NG_HOT_P = ['翌日、{b}は{a}を睨んだ。「親に言うなんて、最低｜親に言うなど、最低だ｜親に言うなんて、最低です」{a}は何か言いかけて、やめた。'];
  var CARE_NG = [
    '{b}は「大丈夫｜大丈夫だ｜大丈夫です」と笑ってみせた。{a}はそれ以上踏み込めなかった。笑顔の奥にあるものは、分からないままだった。',
    '{b}は曖昧に頷いただけで、何も話さなかった。{a}は「いつでも来ていいから｜いつでも来ていい｜いつでも来ていいですから」と言うしかなかった。'
  ];
  var CARE_LAB = { hall: '廊下で呼び止めた', nurse: '保健室で', home: '家庭訪問', parent: '親に連絡' };
  function care(ctx) {
    if (S.off && S.off.care) return;
    staffHere(ctx).forEach(function (t) {
      if (!isMain(t) || t.flags.caredAt === ctx.stepIndex) return;
      var sc = CT.scopeOf(ctx, t), best = null, bv = 0.6, bw = null;
      /* 同じ生徒には、声をかけてから 3 か月は続けて声をかけない（同じ場面が月ごとに並ばないように） */
      sc.forEach(function (c) { if (c.flags.caredAt != null && ctx.stepIndex - c.flags.caredAt < 3) return; var k = risk(ctx, c); if (k.r > bv) { bv = k.r; best = c; bw = k.why; } });
      if (!best) return;
      var p = 0.3 + t.tr.np * 0.35 + t.tr.a * 0.15 - (t.stress > 70 ? 0.2 : 0) + (t.flags.mode === 'hold' ? 0.1 : 0);
      if (ctx.rng() > p) return;
      t.flags.caredAt = ctx.stepIndex; best.flags.caredAt = ctx.stepIndex;
      var c = best, B = bullyOn(ctx), sl = c.flags.slump || 0;
      var m = B && B.tg === c.i ? (ctx.rng() < 0.6 ? 'nurse' : 'hall') : sl >= 2 ? (ctx.rng() < 0.5 ? 'home' : 'parent') : sl >= 1 && ctx.rng() < 0.3 ? 'parent' : 'hall';
      var st = style(t);
      var ok = 0.3 + R(ctx, c, t).trust / 70 + c.tr.honesty * 0.2 + t.tr.np * 0.2 + t.tr.a * 0.1 - c.tr.cp * 0.15 - (t.flags.mode === 'harsh' ? 0.15 : 0) +
        (st === 'NP' && c.tr.ac > 0.6 ? 0.1 : 0) - (st === 'CP' && c.tr.ac > 0.6 ? 0.1 : 0) + (st === 'FC' && c.tr.fc > 0.6 ? 0.1 : 0) > ctx.rng() * 1.1;
      var hot = c.tr.cp > 0.55 || c.tr.aggr > 0.55;
      var tail = ok ? (m === 'parent' ? CARE_OK_P[0] : ctx.pick(CARE_OK)) : hot ? (m === 'parent' ? CARE_NG_HOT_P[0] : ctx.pick(CARE_NG_HOT)) : ctx.pick(CARE_NG);
      ctx.act2({ actors: [t, c], cat: ok ? 'help' : hot ? 'conflict' : 'help', mag: ok ? 10 : 6,
        fx: function () {
          if (ok) { ctx.stress(c, -(10 + t.tr.np * 6)); c.flags.slump = Math.max(0, sl - 1); ctx.mod(c, t, { trust: 10, aff: 5 }); ctx.mod(t, c, { aff: 3 }); }
          else if (hot) { ctx.mod(c, t, { ten: 10, trust: -6 }); ctx.stress(c, 3); }
          else ctx.mod(c, t, { trust: -2 });
        },
        text: T(ctx, CARE[m][st] || CARE[m].NP, t, c) + T(ctx, tail, t, c),
        why: rl(t) + 'が気にかけた：' + c.name + '（' + bw.join('・') + '）。' + CARE_LAB[m] + '（' + st + '）。' + (ok ? '届いた' : hot ? '反発された' : 'はぐらかされた') });
    });
  }

  /* ======================= 職員室（先生どうし） ======================= */
  /* {a}・{b}＝先生 {c}＝話題の生徒 */
  var CONSULT_A2 = {
    CP: '{a}は職員会議のあと、{b}を呼び止めた。「うちの{c}、注意しても聞かない。あなたならどうする？｜うちの{c}は、注意しても聞かない。あなたならどうする？｜うちの{c}、注意しても聞かないんです。あなたならどうしますか？」',
    NP: '{a}は帰り支度をしていた{b}に、遠慮がちに声をかけた。「ちょっといい？うちの{c}が、最近一人でいることが多くて｜少しいいか。うちの{c}が、最近一人でいることが多い｜ちょっといいですか？うちの{c}が、最近一人でいることが多いんです」',
    A: '{a}は{b}の机に、小テストの点の一覧を置いた。「うちの{c}の点、この三回で急に落ちてる。理由が分からない｜うちの{c}の点は、この三回で急に落ちている。理由が分からない｜うちの{c}の点、この三回で急に落ちています。理由が分かりません」',
    FC: '{a}は{b}の隣の椅子にどさっと座った。「聞いてよ、うちの{c}がさ、全然話してくれないの｜聞いてくれ、うちの{c}が全然話してくれないんだ｜聞いてくださいよ、うちの{c}が全然話してくれないんです」',
    AC: '{a}は{b}の机に付箋を一枚貼っていった。あとで{b}が声をかけると、{a}はようやく口を開いた。「うちの{c}のこと、私だけじゃ、分からなくて…｜うちの{c}のことが、私だけでは分からない…｜うちの{c}のこと、私だけでは、分からないんです…」'
  };
  var CONSULT_A = {
    CP: '職員室で、{a}は湯呑みを置くなり{b}に言った。「うちの{c}、最近たるんでる。どう締めたらいいと思う？｜うちの{c}は最近たるんでいる。どう締めればいいと思う？｜うちの{c}、最近たるんでいます。どう締めたらいいと思いますか？」',
    NP: '放課後の職員室で、{a}は{b}の机に寄った。「うちの{c}のことなんだけど、最近ずっと元気がなくて｜うちの{c}のことだが、最近ずっと元気がない｜うちの{c}のことなんですけど、最近ずっと元気がなくて」',
    A: '{a}は出席簿の写しを{b}に見せた。「うちの{c}、遅刻が先月から三割増えてる。原因に心当たりは？｜うちの{c}は、遅刻が先月から三割増えている。原因に心当たりは？｜うちの{c}、遅刻が先月から三割増えています。原因に心当たりはありますか？」',
    FC: '{a}はコーヒーを二つ淹れて、一つを{b}に渡した。「ねえ、うちの{c}がさ、最近笑わないんだよね｜なあ、うちの{c}が最近笑わないんだ｜あの、うちの{c}が最近笑わないんですよね」',
    AC: '{a}は{b}の机の横で、しばらく言い出せずに立っていた。「あの……うちの{c}のことで、相談しても、いい？｜その……うちの{c}のことで、相談してもいいか｜あの……うちの{c}のことで、相談してもいいですか」'
  };
  var CONSULT_B2 = {
    CP: '{b}は少し考えてから言った。「一度、きちんと線を引いて見せたほうがいい。話を聞くのはそのあと｜一度、きちんと線を引いて見せたほうがいい。話を聞くのはそのあとだ｜一度、きちんと線を引いて見せたほうがいいです。話を聞くのはそのあとです」{a}は、その言葉を手帳に書き留めた。',
    NP: '{b}は湯呑みを二つ用意して、{a}の話を最後まで聞いた。「一人で抱えないで。私も、廊下で声をかけてみる｜一人で抱えるな。私も、廊下で声をかけてみる｜一人で抱えないでください。私も、廊下で声をかけてみます」{a}はほっとした顔をした。',
    A: '{b}は{a}の話を聞きながら、紙に図を描いた。友達の輪、部活、家。「どこから崩れたかが分かれば、手の打ちようがある｜どこから崩れたかが分かれば、手の打ちようがある｜どこから崩れたかが分かれば、手の打ちようがあります」{a}は、その紙を受け取った。',
    FC: '{b}は「じゃあ今度、一緒に昼休みの教室をのぞきに行こう！｜では今度、一緒に昼休みの教室をのぞきに行こう！｜じゃあ今度、一緒に昼休みの教室をのぞきに行きましょう！」と言った。{a}は、思わず笑ってしまった。',
    AC: '{b}は何度か言いかけてから、「私なら、手紙を書くかも…｜私なら、手紙を書くかもしれない…｜私なら、手紙を書くかもしれません…」と言った。{a}は、その考えを持ち帰った。'
  };
  var CONSULT_B = {
    CP: '{b}は書類から目を上げずに答えた。「甘やかさないこと。決まりは決まり、話はそこから聞く｜甘やかさないことだ。決まりは決まり、話はそこから聞け｜甘やかさないことです。決まりは決まり、話はそこから聞いてください」{a}は少しむっとしたが、メモを取った。',
    NP: '{b}は椅子をこちらに向けた。「一回、放課後に二人で話してみたら。責めるためじゃなくて、聞くために｜一度、放課後に二人で話してみたらどうだ。責めるためではなく、聞くために｜一度、放課後に二人で話してみたらどうですか。責めるためではなく、聞くために」{a}は頷いて、少し肩の力を抜いた。',
    A: '{b}は付箋に三つ書き出した。家のこと、友達のこと、成績のこと。「順番に一つずつ確かめれば、どこかに当たる｜順番に一つずつ確かめれば、どこかに当たる｜順番に一つずつ確かめれば、どこかに当たります」{a}はその付箋を手帳に貼った。',
    FC: '{b}は笑って言った。「じゃあ今度、その子の好きなものの話から入ってみたら？｜では今度、その生徒の好きなものの話から入ってみたらどうだ｜じゃあ今度、その子の好きなものの話から入ってみたらどうですか」{a}は「それ、いいかも｜それは、いいかもしれない｜それ、いいかもしれません」と言った。',
    AC: '{b}は少し考えてから、「私も、去年同じことで悩んだよ…｜私も、去年同じことで悩んだ…｜私も、去年同じことで悩みました…」と小さく言った。二人はしばらく、同じ書類の山を前に黙っていた。'
  };
  /* 方針の違い：{a}＝CP の先生、{b}＝相手。相手の気質で書き分ける（相手も CP なら CP） */
  var CLASH = {
    CP: '職員会議で、{a}と{b}の意見がぶつかった。{a}「規則を緩めたら、示しがつかない｜規則を緩めたら、示しがつかない｜規則を緩めたら、示しがつきません」{b}「緩めるんじゃない、変えるんだ｜緩めるのではない、変えるんだ｜緩めるんじゃありません、変えるんです」どちらも一歩も引かず、会議は予定を三十分過ぎて終わった。',
    NP: '{a}「生徒に寄り添うのはいい。でも、線を引かないのは優しさじゃない｜生徒に寄り添うのはいい。だが、線を引かないのは優しさではない｜生徒に寄り添うのはいいです。でも、線を引かないのは優しさではありません」{b}「線の外にいる子を、誰が拾うの｜線の外にいる生徒を、誰が拾うんだ｜線の外にいる子を、誰が拾うんですか」職員室が、一瞬静かになった。',
    A: '{a}が「罰を重くすれば、違反は減る｜罰を重くすれば、違反は減る｜罰を重くすれば、違反は減ります」と言うと、{b}は去年の記録を出して反論した。数字の上では、{b}の言うことが正しかった。{a}は黙って腕を組んだ。',
    FC: '{b}が文化祭の企画に「＠＠全員仮装」を出すと、{a}は即座に却下した。{b}「楽しいことも、教育でしょう｜楽しいことも、教育だろう｜楽しいことも、教育でしょう」{a}「楽しいだけなら、学校はいらない｜楽しいだけなら、学校はいらない｜楽しいだけなら、学校はいりません」二人の間の空気は、その日いっぱい冷えたままだった。',
    AC: '{a}は{b}のクラスの騒がしさを、職員会議の場で名指しした。{b}は何も言い返せず、俯いたまま手帳を握りしめた。会議のあと、{b}は誰とも話さずに帰った。'
  };
  /* CP のいない組の行き違い（{c}＝話題の生徒） */
  var CLASH_SOFT = [
    '{a}と{b}は、{c}への接し方で意見が割れた。{a}はもう少し待ちたいと言い、{b}は今すぐ親に連絡すべきだと言った。結論は、翌週に持ち越された。',
    '{a}と{b}は、学年の行事の進め方で話がかみ合わなかった。どちらも生徒のためを思っていたが、思い描く形が違った。打ち合わせは、気まずい沈黙で終わった。'
  ];
  var VENT_A2 = {
    CP: '{a}は職員室の窓を開けて、冷たい空気を吸い込んだ。「厳しくするのが、正しいと思ってた。今は分からない｜厳しくするのが、正しいと思っていた。今は分からない｜厳しくするのが、正しいと思っていました。今は分かりません」{b}は、その横に並んだ。',
    NP: '{a}は{b}の前で、珍しく笑顔を作らなかった。「みんなに優しくしたいのに、手が足りない｜みんなに優しくしたいのに、手が足りない｜みんなに優しくしたいのに、手が足りないんです」',
    A: '{a}は手帳を閉じて、{b}に言った。「計画どおりに進んだことが、今月は一つもない｜計画どおりに進んだことが、今月は一つもない｜計画どおりに進んだことが、今月は一つもありません」',
    FC: '{a}は職員室の椅子をくるくる回しながら言った。「たまには、誰かに褒められたい！｜たまには、誰かに褒められたいぞ！｜たまには、誰かに褒められたいです！」',
    AC: '{a}は{b}にだけ聞こえる声で言った。「教室に入る前、毎朝、足がすくむの…｜教室に入る前、毎朝、足がすくむ…｜教室に入る前、毎朝、足がすくむんです…」'
  };
  var VENT_A = {
    CP: '{a}は職員室の自販機の前で、珍しく溜め息をついた。「言っても言っても、伝わらない｜言っても言っても、伝わらない｜言っても言っても、伝わりません」',
    NP: '{a}は職員室で、冷めたコーヒーを手にしたまま動かなかった。「全員を見てるつもりでも、こぼれる子がいる｜全員を見ているつもりでも、こぼれる生徒がいる｜全員を見ているつもりでも、こぼれる子がいるんです」',
    A: '{a}は採点の手を止めて、眼鏡を外した。「やるべきことを並べたら、一日が三十時間でも足りない｜やるべきことを並べたら、一日が三十時間でも足りない｜やるべきことを並べたら、一日が三十時間でも足りません」',
    FC: '{a}は机に突っ伏した。「もう無理！今日は何もしたくない！｜もう無理だ！今日は何もしたくない！｜もう無理です！今日は何もしたくありません！」',
    AC: '{a}は誰もいなくなった職員室で、{b}にだけ小さくこぼした。「私、向いてないのかも…｜私は、向いていないのかもしれない…｜私、向いていないのかもしれません…」'
  };
  var VENT_B2 = {
    CP: '{b}は「あなたが倒れたら、あのクラスはどうなるの。今日は帰って｜あなたが倒れたら、あのクラスはどうなる。今日は帰れ｜あなたが倒れたら、あのクラスはどうなりますか。今日は帰ってください」と言った。{a}は、黙って鞄を手に取った。',
    NP: '{b}は{a}の肩に、そっと手を置いた。「ちゃんと見てるよ。あなたが頑張ってること｜きちんと見ている。あなたが頑張っていることは｜ちゃんと見ていますよ。あなたが頑張っていること」{a}は、うつむいたまま小さく頷いた。',
    A: '{b}は「来週の補習、半分引き受ける｜来週の補習は、半分引き受ける｜来週の補習、半分引き受けます」と言って、予定表に自分の名前を書き込んだ。{a}は、深く頭を下げた。',
    FC: '{b}は引き出しからお菓子の袋を出して、{a}の机にどさっと置いた。「全部食べていいよ！｜全部食べていいぞ！｜全部食べていいですよ！」{a}は、こらえきれずに笑った。',
    AC: '{b}はしばらく黙っていたが、帰り際に「明日も、いますから｜明日も、いる｜明日も、いますから」とだけ言った。{a}には、その一言がありがたかった。'
  };
  var VENT_B = {
    CP: '{b}は「弱音を吐く暇があったら、明日の準備をしたほうがいい｜弱音を吐く暇があれば、明日の準備をしろ｜弱音を吐く暇があったら、明日の準備をしたほうがいいですよ」とだけ言った。突き放すような声だったが、{b}はその日、{a}が帰るまで職員室に残っていた。',
    NP: '{b}は何も言わずに、{a}の机に温かい缶コーヒーを置いた。「今日はもう帰ろう。続きは明日、一緒にやるから｜今日はもう帰ろう。続きは明日、一緒にやる｜今日はもう帰りましょう。続きは明日、一緒にやりますから」{a}は、少しだけ笑った。',
    A: '{b}は{a}の仕事を一覧にして、半分に赤い線を引いた。「これは来週でいい。これは私がやる｜これは来週でいい。これは私がやる｜これは来週でいいです。これは私がやります」{a}の肩から、少し力が抜けた。',
    FC: '{b}は「よし、今日は飲みに行こう！｜よし、今日は飲みに行くぞ！｜よし、今日は飲みに行きましょう！」と言って、{a}の鞄を勝手に持った。その夜、{a}は久しぶりに声を出して笑った。',
    AC: '{b}は何と言えばいいか分からず、「…私も、同じだよ｜…私も、同じだ｜…私も、同じです」とだけ言った。{a}には、それで十分だった。'
  };
  /* 進路会議（3年。{a}＝3年の担任 {b}＝ほかの先生 {c}＝生徒） */
  var CAREER_A = {
    CP: '進路会議で、{a}は{c}の資料を配った。「この成績で今の志望校は厳しい。現実を見せるべきだと思う｜この成績で今の志望校は厳しい。現実を見せるべきだ｜この成績で今の志望校は厳しいです。現実を見せるべきだと思います」',
    NP: '進路会議で、{a}は{c}の資料を配った。「本人は、まだ迷ってる。急かしたくない｜本人は、まだ迷っている。急かしたくない｜本人は、まだ迷っています。急かしたくないんです」',
    A: '進路会議で、{a}は{c}の模試の結果を三年分の表にして配った。「伸び方から見て、あと二か月で届く｜伸び方から見て、あと二か月で届く｜伸び方から見て、あと二か月で届きます」',
    FC: '進路会議で、{a}は{c}の資料を配るなり言った。「この子、絶対面白いことやるよ。大学でも、どこでも｜この生徒は、きっと面白いことをやる。大学でも、どこでもだ｜この子、絶対面白いことをやりますよ。大学でも、どこでも」',
    AC: '進路会議で、{a}は{c}の資料を配る手が少し震えていた。「私の見立てが、合ってるか、自信がなくて…｜私の見立てが合っているか、自信がない…｜私の見立てが、合っているか、自信がありません…」'
  };
  var CAREER_B = [
    '{b}は「本人の話を、もう一度聞いてからにしよう｜本人の話を、もう一度聞いてからにしよう｜本人の話を、もう一度聞いてからにしましょう」と返した。会議は、{c}の面談の日取りを決めて終わった。',
    '{b}は資料に目を通してから、「推薦の枠、まだ一つ残ってる｜推薦の枠は、まだ一つ残っている｜推薦の枠、まだ一つ残っていますよ」と言った。{a}は、その場で願書の締め切りを確かめた。',
    '{b}は腕を組んで、しばらく考えていた。やがて「親御さんとの面談に、私も同席する｜親御さんとの面談には、私も同席する｜親御さんとの面談に、私も同席します」と言った。{a}は、少しほっとした顔をした。'
  ];
  /* 行事の分担（{a}・{b}＝先生 {v}＝行事） */
  var DUTY_A = {
    CP: '{v}の分担を決める打ち合わせで、{a}は「警備と時間の管理は私が持つ｜警備と時間の管理は私が持つ｜警備と時間の管理は私が持ちます」と真っ先に言った。',
    NP: '{v}の分担を決める打ち合わせで、{a}は誰もやりたがらない救護係を引き受けた。',
    A: '{v}の分担を決める打ち合わせで、{a}はその場で分担表を作り、全員の空き時間を書き込んだ。',
    FC: '{v}の分担を決める打ち合わせで、{a}は「じゃあ私、仮装リレーの司会！｜では私は、仮装リレーの司会をやる！｜では私、仮装リレーの司会をやります！」と手を挙げた。',
    AC: '{v}の分担を決める打ち合わせで、{a}は気づけば、余った係を三つ押しつけられていた。'
  };
  var DUTY_B = {
    CP: '{b}は「それなら当日の段取りは任せる｜それなら当日の段取りは任せる｜それなら当日の段取りはお任せします」と頷いた。打ち合わせは、予定より早く終わった。',
    NP: '{b}は「手が足りなくなったら呼んで｜手が足りなくなったら呼べ｜手が足りなくなったら呼んでください」と言った。{a}は、その一言で少し気が楽になった。',
    A: '{b}は分担表の穴を一つ見つけて、黙って自分の名前を書き足した。{a}はそれに気づいて、小さく頭を下げた。',
    FC: '{b}は「私も混ぜて！｜私も混ぜろ！｜私も混ぜてください！」と身を乗り出した。打ち合わせは、いつの間にか出し物の相談になっていた。',
    AC: '{b}は余った係を、そっと半分引き受けた。{a}が礼を言うと、{b}は照れたように首を振った。'
  };
  /* ベテランと新任（{a}＝年上 {b}＝年下） */
  var VET_A = {
    CP: '{a}は新任の{b}の学級通信を読んで、赤ペンで三か所直した。「生徒は、大人の言葉の隙を見てる｜生徒は、大人の言葉の隙を見ている｜生徒は、大人の言葉の隙を見ていますよ」',
    NP: '{a}は{b}に、自分が若いころに失敗した話をした。「一年目は、全部うまくいかなくて当たり前｜一年目は、全部うまくいかなくて当たり前だ｜一年目は、全部うまくいかなくて当たり前ですよ」',
    A: '{a}は{b}に、二十年分の行事の記録をまとめたファイルを貸した。どのページも付箋だらけだった。',
    FC: '{a}は{b}を昼休みの職員室の将棋に誘った。「授業より、こういうので覚えることのほうが多い｜授業より、こういうことで覚えることのほうが多い｜授業より、こういうことで覚えることのほうが多いんですよ」',
    AC: '{a}は{b}に何か言いたそうにしては、結局「無理しないでね｜無理はするな｜無理しないでくださいね」とだけ言った。'
  };
  var VET_B = {
    CP: '{b}は素直に頷けず、「やり方は、自分で決める｜やり方は、自分で決める｜やり方は、自分で決めます」と言った。{a}は苦笑いして、それ以上は何も言わなかった。',
    NP: '{b}は深く頭を下げた。その日の帰り道、{b}は{a}の言葉を何度も思い出していた。',
    A: '{b}はその場でメモを取り、翌日には自分のやり方に組み込んでいた。{a}は、その早さに少し驚いた。',
    FC: '{b}は「先輩、それもっと早く言ってよ｜先輩、それはもっと早く言え｜先輩、それもっと早く言ってくださいよ」と笑った。{a}もつられて笑った。',
    AC: '{b}は「…はい｜…ああ｜…はい」と小さく答えた。帰り道、{b}はそのことをずっと考えていた。'
  };
  /* 負荷を抱えた先生（{a}）を、ほかの先生（{b}）が支える／責める */
  var SUPPORT = {
    CP: '{b}は{a}に「明日も教壇に立つのが、今のあなたの仕事だ｜明日も教壇に立つのが、今のあなたの仕事だ｜明日も教壇に立つのが、今のあなたの仕事です」と言った。厳しい言い方だったが、{a}はその言葉にすがるようにして、翌朝も学校に来た。',
    NP: '{b}は、職員室で一人残っていた{a}の隣に椅子を引いた。「あなたのせいじゃない。一人で抱えないで｜あなたのせいではない。一人で抱えるな｜あなたのせいじゃありません。一人で抱えないでください」{a}は、しばらく顔を上げられなかった。',
    A: '{b}は{a}の代わりに、保護者への報告書の下書きを書いてきた。「事実だけ並べれば、自分を責める行は要らない｜事実だけ並べれば、自分を責める行は要らない｜事実だけ並べれば、自分を責める行は要りません」{a}はその紙を両手で受け取った。',
    FC: '{b}は{a}を無理やり昼食に連れ出した。何の話もしなかった。ただ、{a}がひと口でも食べるのを見届けてから、職員室に戻った。',
    AC: '{b}は何も言えず、{a}の机にそっと付箋を貼っていった。「＠＠いつでも代わります」とだけ書いてあった。{a}はその付箋を、手帳の表紙の裏に貼った。'
  };
  var BLAME = [
    '{b}は職員会議で、{a}の対応の遅れをはっきり指摘した。「気づく機会は、何度もあったはず｜気づく機会は、何度もあったはずだ｜気づく機会は、何度もあったはずです」誰も{a}をかばわなかった。{a}はその夜、眠れなかった。',
    '{b}は{a}に「担任が気づかなくて、誰が気づくの｜担任が気づかなくて、誰が気づくんだ｜担任が気づかなくて、誰が気づくんですか」と言った。正論だった。だからこそ、{a}には何も言い返せなかった。'
  ];

  function pickOther(ctx, L, a, fn) { var o = L.filter(function (x) { return x !== a; }); return o.length ? (fn ? ctx.most(o, fn) : ctx.rng.pick(o)) : null; }
  function ageGap(a, b) { return a.age && b.age ? a.age - b.age : 0; }
  var KINDS = [
    { id: 'support', lab: '支える・責める', w: function (ctx, L) { return L.some(function (t) { return t.flags.tb && ctx.stepIndex - t.flags.tb.fresh <= 1; }) ? 3 : 0; }, run: function (ctx, L) {
      var a = ctx.most(L.filter(function (t) { return t.flags.tb && ctx.stepIndex - t.flags.tb.fresh <= 1; }), function (t) { return t.stress / 100; });
      var b = pickOther(ctx, L, a, function (t) { return t.tr.np + t.tr.cp * 0.5 + Math.max(0, R(ctx, t, a).aff) / 60; });
      if (!a || !b) return false;
      var blame = style(b) === 'CP' && R(ctx, b, a).aff < 25 && ctx.rng() < 0.55;
      ctx.act2({ actors: [b, a], cat: blame ? 'conflict' : 'help', mag: 12,
        fx: function () { if (blame) { strain(a, 10); ctx.mod2(a, b, { ten: 12, trust: -6 }, { ten: 4 }); } else { strain(a, -(12 + b.tr.np * 5)); ctx.mod2(a, b, { trust: 10, aff: 6 }, { aff: 4, trust: 3 }); } },
        text: T(ctx, blame ? ctx.pick(BLAME) : by(b, SUPPORT), a, b),
        why: '職員室：' + (blame ? b.name + 'が' + a.name + 'を責めた（' + b.name + 'のCP）' : b.name + 'が、負荷を抱えた' + a.name + 'を支えた（' + style(b) + '）') + '。' + a.name + 'のストレス ' + Math.round(a.stress) });
      return true;
    } },
    { id: 'consult', lab: '生徒の相談', w: function (ctx, L) { return 1; }, run: function (ctx, L) {
      var pair = null;
      L.forEach(function (t) { if (!isMain(t)) return; CT.scopeOf(ctx, t).forEach(function (c) { var k = risk(ctx, c).r + ctx.rng() * 0.3 - (ctx.flags.staffTalk === c.i ? 1 : 0); if (!pair || k > pair.k) pair = { t: t, c: c, k: k }; }); });
      if (!pair) return false;
      ctx.flags.staffTalk = pair.c.i;
      var a = pair.t, c = pair.c, b = pickOther(ctx, L, a, function (t) { return Math.max(0, R(ctx, a, t).trust) / 60 + t.tr.np * 0.3 + t.tr.a * 0.3; });
      if (!b) return false;
      var cold = style(b) === 'CP' && style(a) !== 'CP';
      ctx.act2({ actors: [a, b], cat: cold ? 'conflict' : 'help', mag: 6,
        fx: function () { ctx.mod2(a, b, { trust: cold ? 2 : 6, aff: cold ? -1 : 3, ten: cold ? 4 : 0 }, { trust: 3 }); if (!cold) strain(a, -6); a.flags.advised = ctx.stepIndex; },
        text: T(ctx, by(a, ctx.rng() < 0.5 ? CONSULT_A : CONSULT_A2) + by(b, ctx.rng() < 0.5 ? CONSULT_B : CONSULT_B2), a, b, c),
        why: '職員室：' + a.name + 'が受け持ちの' + c.name + 'のことを' + b.name + 'に相談した（' + style(a) + '×' + style(b) + '）' });
      return true;
    } },
    { id: 'clash', lab: '方針の違い', w: function (ctx, L) { var m = 0; L.forEach(function (t) { m = Math.max(m, t.tr.cp); }); return m > 0.6 ? 0.8 : 0.3; }, run: function (ctx, L) {
      var a = ctx.most(L, function (t) { return t.tr.cp + t.tr.aggr * 0.3; }), b = pickOther(ctx, L, a, function (t) { return Math.abs(t.tr.cp - a.tr.cp) * 0.4 + R(ctx, a, t).ten / 60 + ctx.rng() * 0.3; });
      if (!b) return false;
      var hard = style(a) === 'CP', c = null;
      if (!hard) { var sc = CT.scopeOf(ctx, a); c = sc.length ? ctx.rng.pick(sc) : null; }
      var txt = hard ? by(b, CLASH) : ctx.pick(c ? CLASH_SOFT : CLASH_SOFT.slice(1));
      ctx.act2({ actors: [a, b], cat: 'conflict', mag: 10,
        fx: function () { ctx.mod2(a, b, { ten: 10, trust: -3 }, { ten: hard && style(b) === 'AC' ? 6 : 10, trust: -3 }); if (hard && style(b) === 'AC') strain(b, 10); },
        text: T(ctx, txt, a, b, c),
        why: '職員室：' + a.name + 'と' + b.name + 'の方針の違い（' + style(a) + '×' + style(b) + '）' });
      return true;
    } },
    { id: 'vent', lab: '愚痴と励まし', w: function (ctx, L) { return L.some(function (t) { return t.stress > 40; }) ? 1.2 : 0.3; }, run: function (ctx, L) {
      var a = ctx.most(L, function (t) { return t.stress / 100; }), b = pickOther(ctx, L, a, function (t) { return Math.max(0, R(ctx, a, t).aff) / 60 + t.tr.np * 0.4 + ctx.rng() * 0.2; });
      if (!b) return false;
      var cold = style(b) === 'CP';
      ctx.act2({ actors: [a, b], cat: 'help', mag: 6,
        fx: function () { strain(a, cold ? -3 : -10); ctx.mod2(a, b, { trust: cold ? 2 : 6, aff: cold ? 1 : 5 }, { aff: 3 }); },
        text: T(ctx, by(a, ctx.rng() < 0.5 ? VENT_A : VENT_A2) + by(b, ctx.rng() < 0.5 ? VENT_B : VENT_B2), a, b),
        why: '職員室：' + a.name + 'の愚痴（ストレス ' + Math.round(a.stress) + '）と、' + b.name + 'の' + (cold ? '叱咤' : '励まし') + '（' + style(b) + '）' });
      return true;
    } },
    { id: 'career', lab: '進路会議', w: function (ctx, L) { return /10月|11月|12月|1月/.test(ctx.label) && L.some(function (t) { return t.homeroom === 3 && isMain(t) && CT.scopeOf(ctx, t).length; }) ? 1.3 : 0; }, run: function (ctx, L) {
      var a = L.filter(function (t) { return t.homeroom === 3 && isMain(t); })[0];
      var sc = a ? CT.scopeOf(ctx, a) : [], b = pickOther(ctx, L, a);
      if (!a || !b || !sc.length) return false;
      var c = sc.filter(function (x) { return x.flags.ryu && !x.flags.ryu.fail; })[0] || ctx.most(sc, function (x) { return (5 - ctx.stat(x, 'study')) / 5 + ctx.rng() * 0.6; });
      ctx.act2({ actors: [a, b], cat: 'bond', mag: 5,
        fx: function () { ctx.mod2(a, b, { trust: 5 }, { trust: 4 }); },
        text: T(ctx, by(a, CAREER_A) + ctx.pick(CAREER_B), a, b, c),
        why: '職員室：進路会議（3年の' + rl(a) + 'の' + a.name + '。話題は' + c.name + '）' });
      return true;
    } },
    { id: 'duty', lab: '行事の分担', w: function (ctx) { return /5月|6月|9月|10月/.test(ctx.label) ? 0.9 : 0; }, run: function (ctx, L) {
      var a = ctx.most(L, function (t) { return t.tr.lead + ctx.rng() * 0.5; }), b = pickOther(ctx, L, a);
      if (!b) return false;
      var v = /5月|6月/.test(ctx.label) ? '体育祭' : '文化祭';
      ctx.act2({ actors: [a, b], cat: 'bond', mag: 5,
        fx: function () { ctx.mod2(a, b, { trust: 4, aff: 3 }, { trust: 4, aff: 3 }); if (style(a) === 'AC') strain(a, 5); },
        text: T(ctx, by(a, DUTY_A) + by(b, DUTY_B), a, b).replace(/\{v\}/g, v),
        why: '職員室：' + v + 'の分担（' + style(a) + '×' + style(b) + '）' });
      return true;
    } },
    { id: 'veteran', lab: 'ベテランと新任', w: function (ctx, L) { return L.some(function (a) { return L.some(function (b) { return ageGap(a, b) >= 8; }); }) ? 0.7 : 0; }, run: function (ctx, L) {
      var prs = [];
      L.forEach(function (a) { L.forEach(function (b) { if (ageGap(a, b) >= 8) prs.push([a, b]); }); });
      if (!prs.length) return false;
      var pr = ctx.rng.pick(prs), a = pr[0], b = pr[1], rub = style(b) === 'CP';
      ctx.act2({ actors: [a, b], cat: rub ? 'conflict' : 'help', mag: 6,
        fx: function () { if (rub) ctx.mod2(b, a, { ten: 6 }, { ten: 2 }); else ctx.mod2(b, a, { trust: 8, aff: 4 }, { aff: 4 }); },
        text: T(ctx, by(a, VET_A) + by(b, VET_B), a, b),
        why: '職員室：ベテランの' + a.name + '（' + a.age + '歳）と、新任の' + b.name + '（' + b.age + '歳）' });
      return true;
    } }
  ];
  function staffRoom(ctx) {
    var L = staffHere(ctx);
    if (L.length < 2) return;
    var hot = KINDS[0].w(ctx, L) > 0;
    if (!hot && ctx.rng() > 0.55) return;
    var used = {}, last = ctx.flags.staffLast = ctx.flags.staffLast || {};
    for (var k = 0; k < 3; k++) {
      var e = HK.weighted(ctx.rng, KINDS, function (x) { return used[x.id] ? 0 : x.w(ctx, L) * (x.id !== 'support' && last[x.id] != null && ctx.stepIndex - last[x.id] <= 3 ? 0.3 : 1); });
      if (!e) return;
      used[e.id] = 1;
      if (e.run(ctx, L)) { last[e.id] = ctx.stepIndex; ctx.flush(); return; }
    }
  }

  /* ======================= 担任の負荷 ======================= */
  /* 受け持ちの生徒のことで先生（{a}）が自分を責める場面。{b}＝生徒（亡くなった人は名前だけ。場面の登場人物には入れない） */
  var SELF = {
    death: {
      CP: '{b}の訃報を受けた夜、{a}は職員室の明かりを消さなかった。机の上には、{b}の出さなかったプリントが一枚だけ残っていた。{a}は、それを何度も読み返した。',
      NP: '{a}は{b}の葬儀から戻ると、職員室の自分の席で動けなくなった。「私が、もっと…｜＝｜＝」その先は、言葉にならなかった。',
      A: '{a}は{b}のことを、四月から順に書き出そうとした。いつ、何を見落としたのか。ノートは三冊になったが、答えは見つからなかった。',
      FC: '{a}は、{b}の席が空いたままの教室で、翌日も教壇に立った。いつもの冗談は、一つも出てこなかった。授業が終わると、{a}は誰よりも早く教室を出た。',
      AC: '{a}は{b}の訃報を聞いてから、夜眠れなくなった。目を閉じると、教室の空いた席が浮かんだ。朝が来るのが、怖かった。'
    },
    attempt: {
      CP: '{b}が屋上の柵を越えかけたと聞いて、{a}はその日のうちに{b}の家へ向かった。玄関で、{a}は言葉を探したまま立ち尽くした。帰り道、{a}は自分の手が震えているのに気づいた。',
      NP: '{a}は{b}の一件を聞いた夜、一睡もできなかった。翌朝、{a}は誰よりも早く学校に来て、{b}の席の前に立った。「気づけなかった｜気づけなかった｜気づけませんでした」と、{a}は小さく呟いた。',
      A: '{a}は{b}の一件を、校長への報告書にまとめた。書き終えたあと、{a}は自分がいつから何も食べていないのか思い出せなかった。窓の外は、もう暗かった。',
      FC: '{a}は{b}の一件のあと、職員室で笑わなくなった。冗談を言いかけては、途中でやめた。{a}の机の上の家族写真だけが、変わらず笑っていた。',
      AC: '{a}は{b}の一件を聞いて、職員用のトイレで吐いた。それから三日、{a}の声は教室の後ろまで届かなかった。夜になると、何度も目が覚めた。'
    },
    absent: {
      CP: '{a}は、{b}の空いた席を毎朝見ないようにしていた。それでも出席簿の{b}の欄に印をつけるたび、ペンが止まった。{a}は、去年までの自分のやり方を初めて疑った。',
      NP: '{a}は{b}の家に電話をかけ続けたが、出るのはいつも親だった。「私の何が、いけなかったんだろう｜私の何が、いけなかったのか｜私の何が、いけなかったんでしょう」職員室で、{a}は誰にともなく言った。',
      A: '{a}は{b}が休みはじめた日から遡って、自分の言葉を一つずつ思い出そうとした。どこで間違えたのかは分からなかった。眠れない夜が続いた。',
      FC: '{a}は{b}の席に、毎朝プリントを一枚ずつ置いた。積み重なった紙の厚みを見るたびに、{a}の笑顔はぎこちなくなった。冗談の数は、目に見えて減った。',
      AC: '{a}は{b}の親からの電話に、三十分頭を下げ続けた。受話器を置いたあと、{a}はしばらく椅子から立ち上がれなかった。その夜も、なかなか眠れなかった。'
    },
    bully: {
      CP: '{b}へのいじめが何か月も続いていたと知って、{a}は拳を机に打ちつけた。気づけなかったのは、自分の教室のことだった。その夜、{a}は保護者への謝罪文を三度書き直した。',
      NP: '{a}は{b}の親の前で、深く頭を下げた。「気づくのが、遅すぎた｜＝｜気づくのが、遅すぎました」その日から、{a}は家に帰っても眠れなくなった。',
      A: '{a}は{b}へのいじめの経緯を、日付の順に並べた。最初の兆しは、何か月も前の学級日誌にもう書かれていた。{a}は、その一行を見落とした自分を許せなかった。',
      FC: '{a}は{b}の件の保護者対応のあと、駐車場の車の中でしばらく動けなかった。翌朝、{a}はいつもより大きな声でホームルームを始めた。その声は、少し上ずっていた。',
      AC: '{a}は{b}の件で保護者に呼び出され、何も言い返せずに頭を下げ続けた。家に帰ってから、{a}は朝まで眠れなかった。翌日、{a}は二時間目まで職員室から出てこなかった。'
    }
  };
  /* 同じ学年の担任がもう自分を責める場面に出た月の、副担任（または引き継いだ先生）の場面（{a}＝先生） */
  var SUB_SELF = [
    '{a}も、受け持ちのクラスの出来事を一人で抱えていた。職員室では平気な顔をしていたが、帰りの電車で何度も窓に額をつけた。',
    '{a}は、担任の後ろで黙って頭を下げた。自分にも、もっとできることがあったはずだった。その夜、{a}はなかなか眠れなかった。'
  ];
  var KLAB = { death: '死', shinju: '心中', attempt: '心中の未遂', absent: '長引く不登校', bully: '何か月も続いたいじめ' };
  /* 態度の変化（負荷のあとの月に一度。{b}＝受け持ちの生徒の一人） */
  var MODE = {
    harsh: ['{a}は前よりも厳しくなった。遅刻一回で放課後に呼び出し、提出物は一日でも遅れれば受け取らなかった。{b}たちは、{a}の目がどこか張りつめているのに気づいていた。',
      '{a}は、ささいな私語にも授業を止めるようになった。教室の空気は日に日に固くなった。{b}は、{a}が何かを取り戻そうとしているように見えた。'],
    hold: ['{a}は毎晩、最後まで職員室に残るようになった。生徒一人ひとりの様子をノートに書き込み、休みの日も電話を手放さなかった。{b}は、{a}の目の下の隈が日に日に濃くなるのを見ていた。',
      '{a}は、誰に何を頼まれても断らなくなった。昼休みも生徒の相談に使い、弁当はいつも冷めたままだった。{b}は、{a}が笑う回数が減ったことに気づいた。'],
    crisis: ['{a}は朝のホームルームで、生徒の顔を見られなくなった。連絡事項を読み上げる声は震え、途中で黙り込むことが増えた。{b}が「先生、大丈夫？｜先生、大丈夫か｜先生、大丈夫ですか」と聞くと、{a}は笑ってごまかした。',
      '{a}は、授業の途中で教科書を持ったまま固まることが増えた。廊下ですれ違っても、{a}はもう目を合わせなかった。{b}は、声をかけるべきか迷ったまま通り過ぎた。'],
    over: ['{a}は、受け持ちの生徒全員の欠席・遅刻・成績を毎日表にするようになった。表は日ごとに細かくなり、{a}が家に帰る時間は遅くなった。{b}には、{a}が何かに追われているように見えた。',
      '{a}は、生徒との面談を一人ずつ記録に残すようになった。質問は丁寧だったが、どこか尋問のようだった。{b}は、{a}が答えを探して焦っているのを感じた。'],
    hollow: ['{a}の冗談は、どこか空回りするようになった。笑い声の上がらない教室で、{a}だけが笑っていた。{b}はその横顔から、目をそらした。',
      '{a}は、前より大きな声で笑うようになった。けれど、授業が終わって教室を出るときの背中は小さく見えた。{b}は、それを誰にも言わなかった。']
  };
  var MODE_OF = { CP: 'harsh', NP: 'hold', AC: 'crisis', A: 'over', FC: 'hollow' };
  var MODE_LAB = { harsh: '厳しさが増した', hold: '一人で抱え込むようになった', crisis: '崩れかけている', over: '記録に追われるようになった', hollow: '明るさが空回りするようになった' };
  /* 休職（{a}＝先生 {b}＝受け持ちの生徒の一人 {s}＝月） */
  var LEAVE = [
    '{a}が、{s}から休職することになった。朝のホームルームで、学年主任が短くそれを伝えた。代わりに来た先生は、教卓の上の{a}の名札をそっと伏せた。',
    '{s}のある朝、{a}は学校に来なかった。しばらく休むと、学年主任が告げた。教室の誰もが、理由に心当たりがあった。',
    '{a}の机の上が、ある日きれいに片づいていた。{s}から休職したと聞かされたとき、{b}は{a}の最後の授業を思い出そうとした。うまく思い出せなかった。'
  ];
  var TAKEOVER = '副担任の{a}が、担任を引き継いだ。最初のホームルームで、{a}は{b}の名前を出さずに「しばらく、私がこのクラスを見る｜しばらく、私がこのクラスを見る｜しばらく、私がこのクラスを見ます」とだけ言った。教室は静かだった。';

  /* 受け持ちの先生（担任は満額、副担任は半分）に負荷を積む */
  function load(ctx, hits, c, kind, v) {
    var g = gradeOf(ctx, c);
    staffHere(ctx).forEach(function (t) {
      if (t.homeroom !== g) return;
      var x = (hits[t.i] = hits[t.i] || { t: t, l: [] });
      x.l.push({ c: c, kind: kind, v: isMain(t) ? v : Math.round(v / 2) });
    });
  }
  function burdenStep(ctx) {
    if (!(ctx.teachers || []).length) return;
    var hits = {}, B = bullyOn(ctx);
    ctx.chars.forEach(function (c) {
      if (!stu(c)) return;
      if (c.alive === false && !c.flags.tbDead) { c.flags.tbDead = 1; load(ctx, hits, c, /心中/.test(c.deathHow || c.fateNote || '') ? 'shinju' : 'death', 40); return; }
      if (c.alive && c.out && c.flags.absent && (c.flags.absent.deep || c.flags.absent.months >= 1) && c.flags.tbAbs !== c.flags.absent.since) { c.flags.tbAbs = c.flags.absent.since; load(ctx, hits, c, 'absent', 28); }
    });
    /* 心中の未遂（執着の暴走で、相手が引き止めた。全年齢の「二人だけの世界」は数えない） */
    var from = ctx._tbLog || 0;
    for (var i = from; i < ctx.log.length; i++) {
      var e = ctx.log[i];
      if (!e || e.kind !== 'event' || !/心中に誘い/.test(e.why || '')) continue;
      (e.actors || []).forEach(function (k) { var c = ctx.chars[k]; if (stu(c) && c.alive && c.flags.tbAtt !== ctx.stepIndex) { c.flags.tbAtt = ctx.stepIndex; load(ctx, hits, c, 'attempt', 25); } });
    }
    ctx._tbLog = ctx.log.length;
    if (B && !B.tbLong && ctx.stepIndex - B.start >= 3) { B.tbLong = 1; var tg = ctx.chars[B.tg]; if (stu(tg)) load(ctx, hits, tg, 'bully', 25); }
    var shown = {};
    Object.keys(hits).map(function (k) { return hits[k]; }).sort(function (x, y) { return (isMain(y.t) ? 1 : 0) - (isMain(x.t) ? 1 : 0) || x.t.i - y.t.i; }).forEach(function (x) {
      var t = x.t, sum = 0, worst = null, again = !!shown[t.homeroom];
      shown[t.homeroom] = 1;
      x.l.forEach(function (h) { sum += h.v; if (!worst || h.v > worst.v) worst = h; });
      sum = Math.min(45, sum);
      strain(t, sum);
      var tb = t.flags.tb = t.flags.tb || { n: 0, fresh: -9, list: [], heavy: 0 };
      tb.n += x.l.length; tb.fresh = ctx.stepIndex;
      x.l.forEach(function (h) { var w = h.c.name + 'の' + KLAB[h.kind]; if (tb.list.indexOf(w) < 0) tb.list.push(w); if (h.kind === 'death' || h.kind === 'shinju') tb.heavy++; });
      if (!t.flags.mode) { t.flags.mode = MODE_OF[style(t)] || 'hold'; t.flags.modeAt = ctx.stepIndex; }
      var c = worst.c, dead = c.alive === false, kk = worst.kind === 'shinju' ? 'death' : worst.kind;
      ctx.act2({ actors: dead || again ? [t] : [t, c], cat: 'solo', mag: 14 + worst.v / 3,
        text: T(ctx, again ? ctx.pick(SUB_SELF) : by(t, SELF[kk]), t, c),
        why: rl(t) + 'の負荷：受け持ちの' + names(x.l.map(function (h) { return h.c; })) + 'の' + x.l.map(function (h) { return KLAB[h.kind]; }).filter(function (v, j, a) { return a.indexOf(v) === j; }).join('・') + '（ストレス +' + sum + '→' + Math.round(t.stress) + '）' });
      t.flags.tbNote = '受け持ちの' + tb.list.slice(0, 3).join('、') + 'のことで、自分を責め続けていた';
      leaveCheck(ctx, t, 1);
    });
  }
  /* 休職するか。重なった負荷（二度以上、または生徒の死）とストレスの高さで。死ネタの重さ「穏やか」では休職しない */
  function leaveCheck(ctx, t, fresh) {
    if (mild(ctx) || !here(t) || !t.flags.tb || t.flags.leave) return;
    var tb = t.flags.tb;
    if (!((tb.n >= 2 && t.stress >= 70) || (tb.n >= 3 && t.stress >= 60) || (tb.heavy && t.stress >= 80))) return;
    var p = (fresh ? 0.35 : 0.15) + t.tr.ac * 0.45 + (t.flags.mode === 'hold' ? 0.15 : 0) - t.tr.cp * 0.15;
    if (ctx.rng() > p) return;
    var sc = CT.scopeOf(ctx, t), b = sc.length ? ctx.most(sc, function (c) { return R(ctx, c, t).trust / 60 + R(ctx, c, t).aff / 80; }) : null;
    var lab = (ctx.env.grade === 'all' ? t.homeroom + '年の' : '') + rl(t);
    ctx.act2({ actors: [t], cat: 'solo', mag: 30,
      fx: function () { sc.forEach(function (c) { if (R(ctx, c, t).trust > 20) ctx.stress(c, 5); }); },
      text: T(ctx, ctx.pick(b ? LEAVE : LEAVE.slice(0, 2)), t, b).replace(/\{s\}/g, ctx.label),
      why: rl(t) + 'の負荷：休職（' + tb.list.slice(0, 3).join('・') + '。ストレス ' + Math.round(t.stress) + '）' });
    t.flags.leave = { since: ctx.label, at: ctx.stepIndex };
    t.out = true;
    t.fate = '休職';
    t.fateNote = ctx.label + 'から休職した。' + (tb.list.length ? '受け持ちの' + tb.list.slice(0, 3).join('、') + 'のことで、自分を責め続けていた' : '');
    t.outLabel = lab + '・休職';
    note(ctx, lab + 'の' + t.name + 'は、' + ctx.label + 'から休職した（' + tb.list.slice(0, 3).join('・') + '）。');
    /* 同じ学年の副担任が引き継ぐ（いなければ、代わりの先生はモブ） */
    var subs = CT.teachersOf(ctx, t.homeroom).filter(function (u) { return u !== t; });
    if (t.flags.sub && !t.flags.acting) { /* 副担任の休職：担任はそのまま */ }
    else if (subs.length && !isMain(subs[0])) {
      var s = subs[0];
      s.flags.acting = true;
      ctx.act2({ actors: [s], cat: 'help', mag: 10, fx: function () { strain(s, 8); }, text: T(ctx, TAKEOVER, s, t), why: '担任の' + t.name + 'の休職で、副担任の' + s.name + 'が担任を引き継いだ' });
    } else note(ctx, lab + 'の代わりは、ほかの学年の先生（モブ）が受け持った。');
    ctx.flush();
  }
  /* 負荷のあとの月：態度の変化の場面（一度）と、抱え込み（NP）の積もり・重なったままの休職 */
  function burdenFollow(ctx) {
    staffHere(ctx).forEach(function (t) {
      if (!t.flags.mode) return;
      if (t.flags.mode === 'hold') strain(t, 2);
      if (!t.flags.modeShown && t.flags.modeAt < ctx.stepIndex) {
        t.flags.modeShown = true;
        var sc = CT.scopeOf(ctx, t), b = sc.length ? ctx.rng.pick(sc) : null, md = t.flags.mode;
        if (b) ctx.act2({ actors: [t, b], cat: md === 'harsh' ? 'conflict' : 'solo', mag: 10,
          fx: function () { if (md === 'harsh') sc.forEach(function (c) { ctx.mod(c, t, { ten: 4 }); ctx.stress(c, 3); }); else strain(t, md === 'crisis' ? 6 : 4); },
          text: T(ctx, ctx.pick(MODE[md]), t, b), why: rl(t) + 'の負荷：態度の変化（' + style(t) + '。' + MODE_LAB[md] + '）' });
      }
      if (t.flags.tb && ctx.stepIndex - t.flags.tb.fresh >= 1) leaveCheck(ctx, t, 0);
    });
  }

  /* ======================= 3年生の卒業の判定 ======================= */
  function g3(ctx, c) { return stu(c) && c.alive && gradeOf(ctx, c) === 3; }
  /* 卒業が危ない度合い（出席・成績・問題行動）と、いちばん大きい理由 */
  function ryuRisk(ctx, c) {
    var B = ctx.flags.bully, m = c.flags.missM || 0;
    var att = m >= 3 ? 2 : m >= 2 ? 1.2 : m >= 1 ? 0.5 : 0;
    var low = Math.min(2, c.flags.testLow || 0), st = ctx.stat(c, 'study');
    var stu0 = (st <= 2 ? 0.6 : 0) + (st <= 1 ? 0.3 : 0) + low * 0.5 + (c.flags.exam === false ? 0.4 : 0);
    /* いじめの加害：先生に止められた（停学）・最後の段階までいった人がいちばん重い */
    var beh = !B ? 0 : B.by === c.i && (B.level >= 4 || (B.stopped && B.stopped.how === 'teacher')) ? 1.6 : B.by === c.i && B.level >= 3 ? 1.1 : B.join && B.join.indexOf(c.i) >= 0 && B.level >= 3 ? 0.5 : 0;
    var top = att >= stu0 && att >= beh ? 'att' : stu0 >= beh ? 'study' : 'beh';
    return { r: att + stu0 + beh, top: top, beh: beh };
  }
  var RYU_WHY = { att: '出席日数', study: '成績', beh: '問題行動（いじめの加害で停学）' };
  /* 判定の文の「{w}が足りなかった」の{w}・声をかける文の「{w}の表」の{w}・行く末の「〜で卒業できなかった」 */
  var RYU_SHORT = { att: '出席日数', study: '単位', beh: '停学で休んだぶんの単位' };
  var RYU_WARN = { att: '出席日数', study: '成績', beh: '停学の記録と単位' };
  var RYU_FAIL = { att: '出席日数が足りず', study: '成績（単位）が足りず', beh: 'いじめの加害で停学になり、単位が足りず' };
  /* {a}＝担任 {b}＝生徒 */
  var WARN = {
    CP: '{a}は{b}を進路指導室に呼び、成績表を机に置いた。「このままだと、卒業できない。分かってる？｜このままでは、卒業できない。分かっているのか｜このままだと、卒業できません。分かっていますか」{b}は、表の赤い数字から目を離せなかった。',
    NP: '{a}は放課後、{b}と二人きりの教室で向き合った。「このままだと、卒業が危ない。でも、まだ間に合う｜このままでは、卒業が危ない。だが、まだ間に合う｜このままだと、卒業が危ないです。でも、まだ間に合います」{a}は、補習の予定表をそっと差し出した。',
    A: '{a}は{b}に、卒業に要る{w}の数字と、今の数字を並べて見せた。「差はこれだけ。毎週ここを埋めれば届く｜差はこれだけだ。毎週ここを埋めれば届く｜差はこれだけです。毎週ここを埋めれば届きます」{b}は、その紙を黙って受け取った。',
    FC: '{a}は{b}を呼び出して、わざと明るく言った。「このままだと、来年も先生と一緒だよ？それはそれで楽しいけど｜このままでは、来年も先生と一緒だぞ。それはそれで楽しいが｜このままだと、来年も先生と一緒ですよ？それはそれで楽しいですけど」{b}は笑えなかった。',
    AC: '{a}は{b}に、何度も言葉を選びながら切り出した。「その…このままだと、卒業が、難しくて…｜その…このままでは、卒業が難しい…｜その…このままだと、卒業が、難しいんです…」最後のほうは、ほとんど聞き取れなかった。{b}は、それでも意味を分かってしまった。'
  };
  var WARN_ABS = '{a}は{b}の家に、卒業に要る出席日数と今の日数を書いた手紙を届けた。最後の行には、「＠＠まだ間に合う」と一言だけ添えてあった。返事は来なかったが、手紙が捨てられた様子もなかった。';
  var WARN_MOB = '{a}は担任に呼び出された。{w}の表を前に、担任は、このままでは卒業できないと静かに告げた。{a}は、廊下に出てからしばらく動けなかった。';
  var WARN_MOB_ABS = '{a}の家に、担任から手紙が届いた。卒業に要る出席日数と、今の日数が並べて書いてあった。封筒は、何日も机の上に置かれたままだった。';
  var FOLLOW_OK = [
    '放課後の補習で、{b}は{a}の出したプリントを最後まで解いた。{a}は丸を一つずつつけながら、「先週より、ずっといい｜先週より、ずっといい｜先週より、ずっといいです」と言った。{b}は、少しだけ胸を張った。',
    '{b}は朝の七時半に登校して、{a}の補習に出た。眠そうな目のまま、{b}は一度も休まなかった。{a}は、その出席の印を一つずつ確かめた。',
    '{a}との面談で、{b}は自分から来月の目標を書いた。小さな字だったが、消しゴムの跡はなかった。{a}は、その紙を出席簿に挟んだ。'
  ];
  var FOLLOW_NG = [
    '{b}は補習をすっぽかした。{a}は誰もいない教室で、二人分のプリントを前に三十分待った。日が傾いても、扉は開かなかった。',
    '{b}は補習の途中で鞄を持って立ち上がった。{a}「待って、あと一問だけ｜待て、あと一問だけだ｜待ってください、あと一問だけ」{b}は振り返らなかった。',
    '{b}は面談で「どうせ無理｜どうせ無理だ｜どうせ無理です」と言った。{a}は、返す言葉を探しているうちに時間切れになった。廊下の時計の音だけが響いていた。'
  ];
  var FOLLOW_MOB = {
    ok: ['{a}は担任の補習に毎週出るようになった。プリントの赤い丸が、少しずつ増えていった。廊下で会うと、担任は黙って頷いてみせた。',
      '{a}は放課後の図書室で、担任に出された課題を最後まで終わらせた。提出に行くと、担任は珍しく笑った。{a}は、少しだけ照れくさかった。'],
    ng: ['{a}は担任の補習を、また休んだ。机の上の課題は、手つかずのまま積まれていった。担任の溜め息が、職員室の外まで聞こえた。',
      '{a}は補習の教室の前まで来て、引き返した。扉の向こうで、担任が一人で待っているのが分かっていた。それでも、足は動かなかった。']
  };
  var FOLLOW_ABS = { ok: '{a}は{b}の家に、補習のプリントを届けた。翌週、プリントは全部解かれて、郵便受けに返ってきた。{a}はそれを、職員室で何度も見返した。', ng: '{a}は{b}の家に、補習のプリントを届けた。玄関の前に置いたプリントは、次の週もそのままだった。{a}は、その上に新しい一枚を重ねた。' };
  var JUDGE_FAIL = {
    CP: '二月の職員会議で、{b}の卒業判定が議題に上った。{a}は、決まりは決まりだと自ら告げた。{w}は足りなかった。それでもその夜、{a}は{b}の家の前まで行って、インターホンを押せずに引き返した。',
    NP: '二月の職員会議で、{b}の卒業判定が議題に上った。{a}は最後まで{b}の名前を挙げて食い下がったが、{w}の不足は覆らなかった。会議のあと、{a}は一人で長いこと窓の外を見ていた。',
    A: '二月の職員会議で、{b}の卒業判定が議題に上った。{a}は救う道を三つ用意していたが、どれも規則の壁を越えられなかった。{w}が、あと少しだけ足りなかった。',
    FC: '二月の職員会議で、{b}の卒業判定が議題に上った。{a}はいつもの軽口を一度も叩かず、頭を下げ続けた。それでも、{w}の不足は覆らなかった。',
    AC: '二月の職員会議で、{b}の卒業判定が議題に上った。{a}は何か言おうとして、言えないまま会議が終わった。{w}が足りない、という結論だけが残った。'
  };
  var JUDGE_PASS = '二月の職員会議で、{b}の卒業がぎりぎりで認められた。{a}は会議室を出ると、廊下で小さく拳を握った。結果を聞いた{b}は、その場にしゃがみこんだ。';
  var JUDGE_MOB = { fail: '二月、{a}は担任に呼ばれ、卒業できないことを告げられた。{w}が、最後まで足りなかった。帰り道、{a}は一度も顔を上げなかった。', failAbs: '二月、{a}の家に、卒業できないことを知らせる通知が届いた。{w}が足りなかった。封筒は、開けられないまま机の上に置かれた。', pass: '二月、{a}の卒業がぎりぎりで決まった。担任から知らされたとき、{a}は思わず天井を仰いだ。それから、少しだけ泣いた。' };
  var MARCH = '卒業式の翌日、{a}は{b}を空き教室に呼んだ。「来年も、私が見る。一緒にやり直そう｜来年も、私が見る。一緒にやり直そう｜来年も、私が見ます。一緒にやり直しましょう」{b}は黙って頷いた。窓の外では、まだ桜が咲き残っていた。';

  function ryuOn(ctx) { return ctx.env.span !== 'term'; }
  function ryuTrack(ctx) {
    if (!ryuOn(ctx)) return;
    ctx.chars.forEach(function (c) { if (g3(ctx, c) && c.out && c.flags.absent && (c.flags.absent.deep || c.flags.absent.months >= 1)) c.flags.missM = (c.flags.missM || 0) + 1; });
  }
  function ryuMonth(ctx) {
    if (!ryuOn(ctx)) return;
    var lab = ctx.label, G = ctx.chars.filter(function (c) { return g3(ctx, c); });
    if (!G.length) return;
    /* 9月〜1月：危ない人に、担任が声をかける（一クラスで同時に二人まで） */
    if (/^(9|10|11|12|1)月$/.test(lab)) {
      var watched = G.filter(function (c) { return c.flags.ryu; }).length;
      G.slice().sort(function (x, y) { return ryuRisk(ctx, y).r - ryuRisk(ctx, x).r; }).forEach(function (c) {
        if (c.flags.ryu || watched >= 2) return;
        var k = ryuRisk(ctx, c);
        if (k.r < 1.8) return;
        watched++;
        c.flags.ryu = { r: k.r, top: k.top, beh: k.beh, since: lab, at: ctx.stepIndex, effort: 0, tries: 0 };
        var t = ctx.teacherOf ? ctx.teacherOf(c) : null, w = RYU_WARN[k.top], abs = c.out;
        var why = '卒業が危うい：' + c.name + '（' + RYU_WHY[k.top] + '。出席を欠いた月 ' + (c.flags.missM || 0) + '・学力 ' + ctx.stat(c, 'study') + '・最下位 ' + (c.flags.testLow || 0) + '回）。声をかけたのは' + (t ? rl(t) + 'の' + t.name : '担任（モブ）');
        if (t) ctx.act2({ actors: abs ? [t] : [t, c], cat: 'help', mag: 12, fx: function () { if (!abs) { ctx.stress(c, 8); ctx.mod(c, t, { trust: 3 }); } }, text: T(ctx, abs ? WARN_ABS : by(t, WARN), t, c).replace(/\{w\}/g, w), why: why });
        else ctx.act2({ actors: abs ? [] : [c], cat: 'solo', mag: 10, fx: function () { if (!abs) ctx.stress(c, 8); }, text: T(ctx, abs ? WARN_MOB_ABS : WARN_MOB, c).replace(/\{w\}/g, w), why: why });
      });
    }
    /* 声をかけた次の月から2月まで：補習・面談に応えるか */
    if (/^(10|11|12|1|2)月$/.test(lab)) G.forEach(function (c) {
      var Y = c.flags.ryu;
      if (!Y || Y.fail || Y.at >= ctx.stepIndex || ctx.rng() > 0.65) return;
      var t = ctx.teacherOf ? ctx.teacherOf(c) : null, abs = c.out;
      var p = 0.25 + c.tr.a * 0.25 + c.tr.ac * 0.2 + Math.max(0, t ? R(ctx, c, t).trust : 0) / 120 + (t ? t.tr.np * 0.15 + t.tr.cp * 0.1 : 0) - c.tr.fc * 0.15 - c.stress / 300 - (Y.beh ? 0.1 : 0);
      if (abs) p *= 0.5;
      var ok = ctx.rng() < p;
      Y.tries++; if (ok) Y.effort++;
      var why = '卒業が危うい：' + c.name + 'の補習・面談（' + (ok ? '応えた' : '応えなかった') + '。' + Y.effort + '/' + Y.tries + '）。見ていたのは' + (t ? rl(t) + 'の' + t.name : '担任（モブ）');
      if (t && abs) ctx.act2({ actors: [t], cat: 'help', mag: 6, text: T(ctx, ok ? FOLLOW_ABS.ok : FOLLOW_ABS.ng, t, c), why: why });
      else if (t) ctx.act2({ actors: [t, c], cat: ok ? 'help' : 'conflict', mag: 6, fx: function () { if (ok) { ctx.stress(c, -4); ctx.mod(c, t, { trust: 6, aff: 3 }); } else { ctx.stress(c, 3); ctx.mod(t, c, { ten: 3 }); } }, text: T(ctx, ctx.pick(ok ? FOLLOW_OK : FOLLOW_NG), t, c), why: why });
      else if (!abs) ctx.act2({ actors: [c], cat: 'solo', mag: 5, fx: function () { ctx.stress(c, ok ? -3 : 3); }, text: T(ctx, ctx.pick(ok ? FOLLOW_MOB.ok : FOLLOW_MOB.ng), c), why: why });
    });
    /* 2月：卒業の判定。一クラス（3年生）で多くて一人 */
    if (lab === '2月') {
      var cand = G.filter(function (c) { return c.flags.ryu && !c.flags.ryu.done; }).map(function (c) {
        var Y = c.flags.ryu, k = ryuRisk(ctx, c);
        return { c: c, s: Math.max(Y.r, k.r) - Y.effort + (c.out ? 0.6 : 0), top: k.r >= Y.r ? k.top : Y.top };
      }).sort(function (x, y) { return y.s - x.s; });
      var failed = false;
      cand.forEach(function (o) {
        var c = o.c, Y = c.flags.ryu, t = ctx.teacherOf ? ctx.teacherOf(c) : null, abs = c.out;
        Y.done = true;
        var fail = !failed && o.s >= 1.5 && ctx.rng() < Math.min(0.7, 0.2 + (o.s - 1.5) * 0.3);
        if (fail) { failed = true; Y.fail = true; Y.top = o.top; Y.whyText = RYU_FAIL[o.top].replace(/ず$/, 'なかった'); }
        var w = RYU_SHORT[o.top];
        var why = '卒業が危うい：' + c.name + 'の判定（' + (fail ? '卒業できない。' + RYU_WHY[o.top] : '卒業が認められた') + '。補習に応えた ' + Y.effort + '/' + Y.tries + '）。' + (t ? rl(t) + 'の' + t.name : '担任（モブ）');
        if (t) ctx.act2({ actors: [t], cat: 'solo', mag: fail ? 20 : 10, fx: function () { strain(t, fail ? 6 + t.tr.np * 6 : -6); if (fail) t.flags.tbNote = (t.flags.tbNote ? t.flags.tbNote + '。' : '') + '受け持ちの' + c.name + 'を、卒業させてやれなかった'; },
          text: T(ctx, fail ? by(t, JUDGE_FAIL) : JUDGE_PASS, t, c).replace(/\{w\}/g, w), why: why });
        else ctx.act2({ actors: abs ? [] : [c], cat: 'solo', mag: fail ? 18 : 8, fx: function () { if (!abs) ctx.stress(c, fail ? 15 : -10); }, text: T(ctx, fail ? (abs ? JUDGE_MOB.failAbs : JUDGE_MOB.fail) : JUDGE_MOB.pass, c).replace(/\{w\}/g, w), why: why });
        if (fail) { ctx.stress(c, 15); note(ctx, c.name + 'は' + RYU_FAIL[o.top] + '、卒業できなかった（' + Y.since + 'から担任が気にかけていた。補習に応えたのは ' + Y.effort + '/' + Y.tries + '）。'); }
      });
    }
    /* 3月：卒業式（classroom-life.js）のあと、卒業できなかった人に担任が声をかける */
    if (lab === '3月') G.forEach(function (c) {
      if (!(c.flags.ryu && c.flags.ryu.fail) || c.out) return;
      var t = ctx.teacherOf ? ctx.teacherOf(c) : null;
      if (!t || ctx.env.grade !== 'all') return;   /* 3年生だけのクラスでは、担任は持ち上がらないので書かない */
      ctx.act2({ actors: [t, c], cat: 'help', mag: 10, fx: function () { ctx.mod(c, t, { trust: 8 }); ctx.stress(c, -6); }, text: T(ctx, MARCH, t, c), why: rl(t) + 'と、卒業できなかった' + c.name });
    });
  }
  S.finish = function (ctx) {
    ctx.chars.forEach(function (c) {
      var Y = c.flags.ryu;
      if (!Y || !Y.fail || !c.alive) return;
      c.fate = '留年';
      c.fateNote = RYU_FAIL[Y.top] + '、卒業できなかった' + (c.out && c.flags.absent ? '（' + c.flags.absent.since + 'から学校に来ていない）' : Y.effort ? '。補習には最後まで出た' : '');
    });
  };

  /* ======================= 組み込み ======================= */
  var phase1 = cls.phase, after1 = cls.after;
  cls.phase = function (ctx, s, n) {
    var hasT = (ctx.teachers || []).length > 0;
    /* 負荷のあとの態度の変化・休職は、月のはじめ（その月の先生の場面より前） */
    if (hasT && s > 0) { burdenFollow(ctx); ctx.flush(); }
    phase1(ctx, s, n);
    if (hasT) { care(ctx); ctx.flush(); staffRoom(ctx); ctx.flush(); }
    ryuMonth(ctx); ctx.flush();
  };
  cls.after = function (ctx, s, n) {
    after1(ctx, s, n);
    ryuTrack(ctx);
    burdenStep(ctx); ctx.flush();
  };
  S.risk = risk;
  S.ryuRisk = ryuRisk;
})();
