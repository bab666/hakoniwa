/* 箱庭シミュレーター: 執着（ヤンデレ）の共通部品（関係の値で動く箱庭で使う。組み込みは obsess-install.js）
   ■ 執着度（a が b にどれだけ執着しているか。0〜100、向きがある）
     ・関係「執着（ヤンデレ）」を設定した二人は 55 から始まる
     ・設定していなくても、好きな相手が誰かと親しくするたびに嫉妬が積もり、執着度が上がる（嫉妬・執着の気質が高いほど速い）
       35 を越えると「執着が芽生えた」として、この部品の出来事が起き始める
     ・関係「執着なし」を重ねた二人、恋愛：なしの血縁、恋愛の起こりやすさ 0、恋愛相手を別の人に固定した人、恋愛の成り立たない組では、嫉妬も執着も生まれない
   ■ 段階：35〜59 重い（尽くす・詮索・縋る）／60〜79 束縛（監視・束縛・恋敵への牽制・自傷のほのめかし）／80〜 暴走（監禁・恋敵への危害・心中）
   ■ 型（エゴグラムから）：devote 献身／bind 束縛／purge 排除／depend 依存
   ■ 執着される側の気持ち：unaware 気づいていない／afraid 怖がっている／hate 嫌っている／accept 受け入れている／mutual 共依存
     設定した気持ち（関係「執着」の相手の気持ち）があればそれを、なければ関係の値から決める
   ■ 暴走の重さ：R18版は監禁（体の関係を含む）・恋敵への危害・心中まで。全年齢版はほのめかす程度で、死には至らない
     性的な場面は、受け攻めの指定（HK.Pos.order）どおりの向きで書き、攻めに設定した人が受ける側になることはない
   箱庭ごとの文は HK.Obsess.PACK[箱庭のid]（obsess-omega.js など）で足す */
(function () {
  'use strict';
  var HK = window.HK;
  if (!HK) return;
  var clamp = HK.clamp, O = HK.Obsess = HK.Obsess || {};
  O.PACK = O.PACK || {};
  function L(s) { return s.split('|'); }
  function R(ctx, a, b) { return ctx.R(a, b); }
  var SAFE = function () { return !!HK.SAFE_ON; };

  /* ---------- 関係 ---------- */
  function tieAll(ctx, a, b) { return HK.Ties ? HK.Ties.all(ctx, a, b) : []; }
  O.yanTie = function (ctx, a, b) { var l = tieAll(ctx, a, b); for (var i = 0; i < l.length; i++) if (l[i].type === 'yan' && l[i].a === a.i) return l[i]; return null; };
  O.noTie = function (ctx, a, b) { return tieAll(ctx, a, b).some(function (t) { return HK.TIES[t.type] && HK.TIES[t.type].noObsess; }); };
  /* 嫉妬も執着も生まれない組か（嫉妬の出来事からも呼ぶ） */
  O.blocked = function (ctx, a, b) {
    if (!a || !b || a === b) return true;
    if (O.noTie(ctx, a, b)) return true;
    var pf = ctx.pair(a, b);
    if (pf.kin) return true;
    if (ctx.env && ctx.env.romance === 0) return true;
    if (a.lock != null && a.lock !== b.i) return true;
    /* 無関心な人・恐れている人は、その相手に嫉妬も執着もしない（ties.js） */
    if (HK.Ties && HK.Ties.apathy && (HK.Ties.apathy(ctx, a, b) || HK.Ties.fears(ctx, a, b))) return true;
    /* 相手が自分を恐れている・無関心でも、関係「執着」の想いは一方的に続く（恋愛・夜には進まない：noLove は HK.Pos・HK.canLove が見る） */
    var y0 = O.yanTie(ctx, a, b), nl = y0 && HK.noLovePair && HK.noLovePair(a, b);
    var a1 = nl ? Object.assign({}, a, { noLove: null }) : a, b1 = nl ? Object.assign({}, b, { noLove: null }) : b;
    /* 関係「執着」を設定した組は恋愛対象の違いを越えるが、先生・未成年・恋愛相手の固定は越えない */
    if (!pf.couple && !HK.canLove(a1, b1) && !(y0 && HK.canLove(Object.assign({}, a1, { likes: '' }), b1))) return true;
    if (HK.Pos && HK.Pos.clash && HK.Pos.clash(a1, b1)) return true;
    return false;
  };
  /* 嫉妬してよいか：a が c（好きな相手）のことで嫉妬する */
  O.jealOk = function (ctx, a, c) { return !(c && O.blocked(ctx, a, c)); };

  /* ---------- 執着度 ---------- */
  function st(ctx, a, b) {
    var pf = ctx.pair(a, b), m = pf.ob = pf.ob || {};
    if (!m[a.i]) {
      var y = O.yanTie(ctx, a, b);
      m[a.i] = { lv: y ? 55 + (y.cold === 'mutual' ? 8 : y.cold === 'hate' ? 6 : 0) : 0, set: !!y, seen: y ? 2 : 0, at: -9, climax: null, cage: null };
    }
    return m[a.i];
  }
  O.state = st;
  O.why = function (ctx, a, b) { return why(ctx, a, b, st(ctx, a, b)); };
  O.level = function (ctx, a, b) { return O.blocked(ctx, a, b) ? 0 : st(ctx, a, b).lv; };
  O.stage = function (lv) { return lv >= 80 ? 3 : lv >= 60 ? 2 : lv >= 35 ? 1 : 0; };
  /* 関係「執着（ヤンデレ）」を設定していない組の想いは、嫉妬どまり（NAT_CAP まで。執着の出来事・結末は 35 から）。
     その上へ行くのは、嫉妬深い人がとても強く惹かれていて、気持ちが高まったまれな場合だけ（組ごとに一度だけ決める） */
  O.NAT_CAP = 34;
  O.surgeOk = function (a, att) { return (a.tr.jealous || 0) >= 0.7 && att >= 70; };
  O.SURGE_P = 0.2;
  O.add = function (ctx, a, b, d) {
    if (O.blocked(ctx, a, b) || !b.alive) return 0;
    /* pace：区切りの少ない箱庭（合コン・一年間のクラス）ほど速く積もる（O.install の opt.pace） */
    var kit = ctx.scen && ctx.scen.obsessKit, s = st(ctx, a, b), k = d > 0 ? (0.55 + a.tr.jealous * 0.9) * ((kit && kit.pace) || 1) : 1;
    if (d > 0) k *= HK.Dark.pace(ctx);   /* 展開の重さ（mood-dial.js）：穏やかほど執着がゆっくり積もる */
    /* 型を選んだ執着：想いの差（feud-kit.js の HK.Gap）が大きいほど速く積もる（型がおまかせなら今までどおり） */
    if (d > 0 && HK.Gap && O.subOf(ctx, a, b)) k *= 1 + 0.5 * HK.Gap.of(ctx, a, b);
    var nv = clamp(s.lv + d * k, 0, 100);
    if (d > 0 && !s.set && nv > O.NAT_CAP) {
      if (s.surge == null) s.surge = (O.surgeOk(a, R(ctx, a, b).att) || (HK.Dark.on(ctx) === 'dark' && (a.tr.jealous || 0) >= 0.5 && R(ctx, a, b).att >= 60)) && ctx.rng() < O.SURGE_P * HK.Dark.f(ctx, 'cage');
      if (!s.surge) nv = Math.max(s.lv, Math.min(nv, O.NAT_CAP));
    }
    s.lv = nv;
    return s.lv;
  };
  /* 嫉妬の出来事から呼ぶ：a が c を想っていて、c が誰かと親しくした */
  O.feed = function (ctx, a, c, d) { if (c && R(ctx, a, c).att >= 30) O.add(ctx, a, c, d || 6); };

  /* 同じ場にいるか（ゾンビの街のように、出来事が同じエリアの人どうしでしか起きない箱庭） */
  /* 監禁している・されている二人は、いつも同じ場所にいる */
  function near(ctx, a, b) { return (a.flags.cagePair != null && a.flags.cagePair === b.i) || !ctx.scen.othersFor || ctx.others(a).indexOf(b) >= 0; }
  O.near = near;
  /* その場にいない人（死んだ・部屋を出た・行方不明・連れ去られた・気絶）は、執着の出来事に出さない。監禁中の二人は、その場にいる扱い */
  function away(c) { return !c || c.alive === false || c.out || c.gone || c.taken || !!(c.flags && c.flags.knocked); }
  O.away = away;
  /* a の執着先（いちばん執着度の高い相手。35 未満なら null） */
  O.target = function (ctx, a, min) {
    var best = null, bv = min == null ? 35 : min;
    ctx.chars.forEach(function (o) {
      if (o === a || away(o) || away(a) || !near(ctx, a, o)) return;
      /* 監禁のさなかの人は、その相手どうしでしか執着の出来事を起こさない（別の人に二重に囲われない） */
      if ((a.flags.cagePair != null && a.flags.cagePair !== o.i) || (o.flags.cagePair != null && o.flags.cagePair !== a.i)) return;
      var pf = ctx.pair(a, o);
      if (!pf.ob || !pf.ob[a.i]) { if (!O.yanTie(ctx, a, o)) return; }
      var v = O.level(ctx, a, o);
      if (v >= bv) { bv = v; best = o; }
    });
    return best;
  };
  /* b に執着している人（いちばん重い人） */
  O.obsessorOf = function (ctx, b) {
    var best = null, bv = 34;
    ctx.chars.forEach(function (o) { if (o === b || away(o) || away(b) || !near(ctx, b, o)) return; if ((b.flags.cagePair != null && b.flags.cagePair !== o.i) || (o.flags.cagePair != null && o.flags.cagePair !== b.i)) return; var v = (ctx.pair(o, b).ob && ctx.pair(o, b).ob[o.i]) || O.yanTie(ctx, o, b) ? O.level(ctx, o, b) : 0; if (v > bv) { bv = v; best = o; } });
    return best;
  };

  /* ---------- 型と相手の気持ち ---------- */
  /* 関係「執着」で選んだ型（x は箱庭の ctx か、物語型の S。選んでいなければ ''） */
  var SUB = { devote: 'devote', bind: 'bind', purge: 'purge', dep: 'depend', depend: 'depend', hatelove: 'hatelove' };
  O.subOf = function (x, a, b) {
    if (!x || !a || !b) return '';
    var l = x.R && x.pair ? tieAll(x, a, b) : (x.ties || []).filter(function (t) { return (t.a === a.i && t.b === b.i) || (t.a === b.i && t.b === a.i); });
    for (var i = 0; i < l.length; i++) if (l[i].type === 'yan' && l[i].a === a.i && l[i].sub && SUB[l[i].sub]) return SUB[l[i].sub];
    return '';
  };
  /* 型：関係で選んだ型（O.subOf）を優先し、なければ気質から。x・b を渡さないときは気質だけで決める（今までどおり） */
  O.type = function (a, x, b) {
    var sb = x && b ? O.subOf(x, a, b) : '';
    if (sb) return sb;
    var t = a.tr, s = {
      devote: t.np * 0.85 + t.ac * 0.25,
      bind: t.cp * 0.85 + t.lead * 0.3,
      purge: t.aggr * 0.85 + (1 - t.np) * 0.35,
      depend: t.ac * 0.7 + (1 - t.fc) * 0.35 + (1 - t.a) * 0.2
    }, best = 'devote';
    Object.keys(s).forEach(function (k) { if (s[k] > s[best]) best = k; });
    return best;
  };
  O.TYPE_NAME = { devote: '献身', bind: '束縛', purge: '排除', depend: '依存', hatelove: '愛憎' };
  O.stance = function (ctx, b, a) {
    var y = O.yanTie(ctx, a, b);
    if (y && y.cold) return y.cold;
    var r = R(ctx, b, a);
    if (r.att > 48 && r.aff > 30) return 'mutual';
    if (r.aff < -12) return 'hate';
    if (r.ten > 42) return 'afraid';
    if (r.aff > 30 && r.trust > 20) return 'accept';
    return 'unaware';
  };
  /* b の近くにいる恋敵（b が惹かれている・付き合っている a 以外の人） */
  /* 関係の設定で恋人（番）にした二人か */
  function setLover(ctx, x, y) { var T0 = HK.Ties; return !!(T0 && (T0.has(ctx, x, y, 'lover') || T0.has(ctx, x, y, 'mate') || T0.has(ctx, x, y, 'fated'))); }
  /* 恋人が複数いる（関係の設定で恋人・番）とき、a は b のことで c を恋敵と見ない：
     a と b が恋人で、c も b の恋人（同じ人の恋人どうし）か、c も a の恋人（a の恋人どうしが親しい）とき */
  O.coLove = function (ctx, a, b, c) { return !!(a && b && c && setLover(ctx, a, b) && (setLover(ctx, c, b) || setLover(ctx, a, c))); };
  O.rival = function (ctx, a, b) {
    var best = null, bv = 40;
    ctx.chars.forEach(function (c) {
      if (c === a || c === b || away(c) || !near(ctx, a, c)) return;
      if (O.coLove(ctx, a, b, c)) return;
      var r = R(ctx, b, c), v = r.att + r.aff * 0.5 + (ctx.pair(b, c).couple ? 60 : 0);
      if (v > bv) { bv = v; best = c; }
    });
    return best;
  };

  /* ---------- 文 ---------- */
  O.TEXT = {
    /* 芽生え（嫉妬が執着に変わった） */
    seed: L('{c}と笑う{b}を見たとき、{a}の中で何かが静かに形を変えた。――あの笑顔は、自分だけに向いていればいい。|{a}は気づくと、{b}がどこで誰といるかを、いつも目で追うようになっていた。|{b}が{c}の名前を口にするたび、{a}の胸の奥で何かが軋んだ。それはもう、ただの嫉妬ではなかった。'),
    /* 重い：型ごと */
    devote: L('{a}は{b}の好きなものを全部覚えていた。頼まれてもいないのに、それが毎日{b}の手元に届いた。|{a}「{b}のためなら、なんでもするよ。……なんでも｜{b}のためなら、なんでもする。……なんでもだ｜{b}のためなら、なんでもします。……なんでもです」|{a}は{b}が困る前に、全部片づけておいた。{b}が誰かに頼る必要なんて、ないように。'),
    bind: L('{a}「さっき、誰と話してた？｜さっき、誰と話していた？｜さっき、誰と話していたんですか？」{b}が答えるまで、{a}は目を逸らさなかった。|{a}は{b}の一日の予定を、本人よりも正確に把握していた。|{a}「どこ行くの。……一人で？　本当に？｜どこへ行く。……一人でか？　本当にか？｜どこへ行くんですか。……一人で？　本当にですか？」'),
    purge: L('{b}に話しかけた相手を、{a}は黙って見つめていた。相手はそれきり、{b}に近づかなくなった。|{a}は{b}の隣の席を、誰にも譲らなかった。|{a}「{b}に近づく理由、ある？｜{b}に近づく理由があるのか？｜{b}に近づく理由が、ありますか？」{a}の笑顔に、相手は言葉を失った。'),
    depend: L('{a}「行かないで。……{b}がいないと、どうしていいか分からない｜行くな。……{b}がいないと、どうしていいか分からない｜行かないでください。……{b}がいないと、どうしていいか分かりません」|{a}は{b}の袖を、離そうとしなかった。|{a}は{b}から返事がないだけで、目に見えて落ち着きをなくした。'),
    /* 束縛 */
    devote2: L('{a}は{b}の持ち物を、いつのまにか全部把握していた。なくした物は、{a}がいつも先に見つけた。|{b}の行く先々に、{a}が「偶然」いた。|{a}「{b}のことは、私が一番わかってる。だから、ほかの人はいらないよね｜{b}のことは、私が一番わかっている。だから、ほかの人間はいらないだろう｜{b}のことは、私が一番わかっています。だから、ほかの人はいりませんよね」'),
    bind2: L('{a}は{b}の持ち物を勝手に確かめ、知らない名前を見つけるたびに問い詰めた。|{a}「今日はどこにも行かないで。約束して｜今日はどこにも行くな。約束しろ｜今日はどこにも行かないでください。約束してください」それは頼みではなく、命令だった。|{a}は{b}が誰と何分話したかまで数えていた。'),
    purge2: L('{a}は{c}を呼び出し、低い声で告げた。「{b}に近づくな｜＝｜{b}に近づかないでください」|{c}の持ち物が、いつのまにか壊されていた。{c}は{a}の視線に気づいて、背筋が冷えた。|{a}は{c}についての良くない噂を、さりげなく{b}の耳に入れた。'),
    /* 愛憎（関係「執着」の型で選んだときだけ）：探す・守ると、責める・試す・傷つける言葉が同じ人から出る */
    hatelove: L('{a}は{b}の姿が見えなくなると、黙って探しに出た。見つけると、何も言わずに隣に立った。「……勝手にいなくならないで。腹が立つから｜……勝手にいなくなるな。腹が立つ｜……勝手にいなくならないでください。腹が立ちますから」|{b}が危ない目に遭いかけたとき、{a}は誰より先に飛び出して{b}をかばった。そのあとで、{a}は{b}を睨んだ。「守ってやったなんて、思わないで｜守ってやったなどと、思うな｜守ってあげたなんて、思わないでください」|{a}は{b}の言葉尻を捕まえて、静かに責めた。「そういうところが、本当に嫌い｜そういうところが、本当に嫌いだ｜そういうところが、本当に嫌いです」――それでも、{a}は{b}のそばを離れなかった。|{a}は{b}に、わざと答えにくいことを訊いた。「私と{b}の大事なもの、どっちを選ぶ？｜私と{b}の大事なもの、どちらを選ぶ？｜私と{b}の大事なもの、どちらを選びますか？」答えを待つ{a}の目は、試すようで、すがるようでもあった。'),
    hatelove2: L('{a}は{b}の腕を掴んで引き戻した。「どこへ行く気？　……行かせない。憎くて仕方ないのに、いなくなるのはもっと許せない｜どこへ行く気だ？　……行かせない。憎くて仕方ないのに、いなくなるのはもっと許せない｜どこへ行く気ですか？　……行かせません。憎くて仕方ないのに、いなくなるのはもっと許せません」|{a}は{b}の古傷になっている失敗を、わざと皆の前で口にした。{b}が顔をこわばらせると、{a}は満足そうに、そして少しだけ苦しそうに笑った。|{a}「私のことだけ考えて苦しめばいい｜＝｜私のことだけ考えて苦しめばいいんです」――そう言い捨てた夜、{a}は{b}の部屋の前で、朝まで座り込んでいた。|{a}は{b}をかばって傷を負い、手当てしようとした{b}の手を払いのけた。「触らないで。……優しくされると、憎めなくなる｜触るな。……優しくされると、憎めなくなる｜触らないでください。……優しくされると、憎めなくなります」'),
    depend2: L('{a}「{b}に捨てられたら、生きてる意味なんてない｜{b}に捨てられたら、生きている意味などない｜{b}に捨てられたら、生きている意味なんてありません」{a}の手首には、新しい傷があった。|{a}は{b}が少し離れただけで泣き崩れ、{b}は戻るしかなかった。|{a}「ねえ、私だけ見てて。……じゃないと、何するか分からない｜私だけを見ていろ。……でないと、何をするか分からない｜ねえ、私だけ見ていてください。……でないと、何をするか分かりません」'),
    /* 執着される側の反応 */
    r_unaware: L('{b}は{a}の気遣いを、ただの優しさだと思っていた。|{b}「いつもありがとう、{a}｜{a}、いつも感謝している｜{a}、いつもありがとうございます」{b}の無邪気な笑顔に、{a}は満足そうに目を細めた。'),
    r_afraid: L('{b}は{a}の視線を感じるたび、肩をこわばらせるようになった。|{b}は{a}を避けて遠回りした。気づいた{a}の表情が、すっと消えた。|{b}「……{a}、少し、距離を置かせて｜……{a}、少し、距離を置かせてくれ｜……{a}、少し、距離を置かせてください」その言葉が、{a}をさらに追い詰めた。'),
    r_hate: L('{b}「いい加減にして。気持ち悪い｜いい加減にしろ。気持ち悪い｜いい加減にしてください。気持ち悪いです」{a}は笑ったまま、その言葉を胸にしまい込んだ。|{b}は{a}の差し出した物を、受け取らずに通り過ぎた。'),
    r_confused: L('{b}は{a}の差し出した手を、払いのけることも握り返すこともできずにいた。「……どうしたらいいのか、分からないんだ｜……どうすればいいのか、分からない｜……どうしたらいいのか、分からないんです」|{b}は{a}の重さに気づいていた。それでも、昔からの情が邪魔をして、突き放す言葉が出てこなかった。|{b}「やめてほしい、とは思う。でも……{a}を一人にするのも、怖い｜やめてほしい、とは思う。だが……{a}を一人にするのも、怖い｜やめてほしい、とは思います。でも……{a}を一人にするのも、怖いんです」――{b}自身、どちらが本心か分からなかった。'),
    r_accept: L('{b}は{a}の重さを知っていて、それでも手を取った。「……私にしか、{a}は止められないから｜……私にしか、{a}は止められないからだ｜……私にしか、{a}は止められませんから」|{b}「大丈夫。どこにも行かないよ｜大丈夫だ。どこにも行かない｜大丈夫です。どこにも行きません」その一言で、{a}の目に光が戻った。'),
    r_mutual: L('{a}が{b}を縛り、{b}もまた{a}を手放せなかった。二人の世界は、二人だけで閉じていった。|{b}「私以外を見たら、許さないから｜私以外を見たら、許さない｜私以外を見たら、許しませんから」{a}は嬉しそうに頷いた。どちらがどちらを縛っているのか、もう分からなかった。'),
    r_calm: L('{b}は{a}を正面から見て、ゆっくり言った。「心配しなくていい。ちゃんと、ここにいる｜＝｜心配なさらないでください。ちゃんと、ここにいます」{a}の肩から、少しだけ力が抜けた。|{b}は{a}の手を握り、話を最後まで聞いた。{a}の目に、ようやく涙がにじんだ。'),
    /* 暴走：監禁 */
    /* 監禁は「どこに閉じ込めたか」を必ず書く（{where}＝箱庭ごとの場所。O.where） */
    cage: L('{a}は{b}を{where}に連れ込み、外から鍵をかけた。{a}は{b}を監禁したのだった。「ここなら、誰にも邪魔されないね｜ここなら、誰にも邪魔されない｜ここなら、誰にも邪魔されませんね」|目を覚ますと、{b}は{where}に閉じ込められていて、手首は柔らかな布で縛られていた。枕元で、{a}が微笑んでいた。「おはよう。もう、どこにも行かなくていいよ｜おはよう。もう、どこにも行かなくていい｜おはようございます。もう、どこにも行かなくていいんですよ」|{a}は{b}の持ち物を全部取り上げた。「{b}、外の世界なんて、もういらないでしょう？｜{b}、外の世界など、もういらないだろう？｜{b}、外の世界なんて、もういりませんよね？」そう言って{a}は{b}を{where}へ閉じ込めた。「{b}のことは私が守る。だから……ここで一緒に暮らそう｜{b}のことは私が守る。だから……ここで一緒に暮らすんだ｜{b}のことは私が守ります。だから……ここで一緒に暮らしましょう」'),
    cage_s: L('{a}は{b}を空き部屋に誘い込み、扉の前に立ちふさがった。「……今日は、ここにいて｜……今日は、ここにいろ｜……今日は、ここにいてください」|{a}は{b}の手を離さず、「もうどこにも行かせない｜＝｜もうどこにも行かせません」とだけ言った。{b}は、その目が笑っていないことに気づいた。'),
    cageDay: L('{a}は毎日、{b}のために食事を運んだ。{b}が一口食べるたび、{a}は幸せそうに笑った。|{b}が窓の外を見ていると、{a}は静かにカーテンを閉めた。|{a}は{b}の髪を梳きながら、子守唄のように名前を呼び続けた。'),
    escape: L('{b}は{a}が眠ったすきに、震える手で鍵を外し、外へ逃げ出した。|{b}はわずかな隙を見逃さなかった。{a}の腕をすり抜け、扉の外へ走った。'),
    rescue: L('{c}は{b}の姿が見えないことに気づき、探し回った末に閉ざされた扉を見つけた。扉を破ると、そこに{b}と{a}がいた。|{c}が扉を叩き続けた。{a}は観念したように、{b}の手を離した。'),
    release: L('{a}は泣きながら、{b}の手首の布をほどいた。「……ごめん。ごめんね｜……すまない。すまない｜……ごめんなさい。ごめんなさい」|{b}が何も言わずに{a}を抱きしめると、{a}は子どものように泣いて、扉の鍵を開けた。'),
    /* 暴走：恋敵への危害 */
    harm: L('{a}は{c}を人気のない場所に呼び出した。数時間後、{c}は血まみれで見つかった。{a}は{b}の隣で、何事もなかったように笑っていた。|{c}は背後から突き飛ばされ、階段の下で動けなくなった。振り返ると、{a}が見下ろしていた。|{a}は{c}の飲み物に、何かを混ぜた。{c}はその夜、ひどく苦しんだ。'),
    harm_s: L('{a}は{c}を呼び出し、「{b}に二度と近づかないで｜{b}に二度と近づくな｜{b}に二度と近づかないでください」と迫った。その声の冷たさに、{c}は震え上がった。|{c}の机には、「{b}に近づくな｜＝｜{b}に近づかないでください」と書かれた紙が何度も入れられた。字は、{a}のものによく似ていた。'),
    harmKill: L('{a}は{c}を呼び出し、二度と戻らせなかった。{a}は{b}のもとに帰ってくると、「もう大丈夫だよ｜もう大丈夫だ｜もう大丈夫ですよ」と囁いた。|{c}の最期の言葉を聞いたのは、{a}だけだった。{a}は手を洗い、{b}を迎えに行った。'),
    /* 暴走：心中 */
    shinju: L('{a}は{b}の手を引き、高い場所の縁に立った。「一緒なら、怖くないよね｜一緒なら、怖くないだろう｜一緒なら、怖くありませんよね」――二人の姿は、そのまま見えなくなった。|{a}は{b}に最後の口づけをして、用意していた薬を二人分、静かに飲み干した。|{a}「生まれ変わっても、私だけのものでいて｜生まれ変わっても、私だけのものでいろ｜生まれ変わっても、私だけのものでいてください」――{a}は{b}を抱きしめたまま、目を閉じた。'),
    shinjuFail: L('{a}は{b}の手を引き、高い場所の縁に立った。だが{b}は、{a}の腕を強く引き戻した。「……生きて。私と一緒に｜……生きろ。私と一緒に｜……私と一緒に、生きてください」{a}は崩れ落ちて泣いた。|{a}が用意した薬を、{b}は床に叩きつけた。「そんなことのために、一緒にいたいんじゃない｜そんなことのために、一緒にいたいわけではない｜そんなことのために、一緒にいたいんじゃありません」'),
    shinju_s: L('{a}は{b}の手を引いて、屋上の柵の前に立った。「……ねえ、このまま二人で消えちゃおうか｜……このまま二人で消えてしまおうか｜……ねえ、このまま二人で消えてしまいましょうか」{b}が強く手を握り返すと、{a}はようやく我に返った。|{a}は{b}の肩にもたれて、「二人だけの世界に行けたらいいのに｜二人だけの世界に行けたらいいのだが｜二人だけの世界に行けたら、いいのですが」と呟いた。{b}は答えられず、ただ手を握っていた。')
  };
  /* r18:begin */
  /* 監禁中の夜（R18）：向きは受け攻めの指定どおり。T＝攻めになる人、U＝受けになる人 */
  O.CAGE_NIGHT = {
    /* 執着する側が攻め */
    top: L('{a}は縛ったままの{b}の体を、確かめるように撫でた。「全部、私のものだよ｜全部、私のものだ｜全部、私のものです」――抗う声は、やがて甘く崩れていった。|夜ごと、{a}は{b}を抱いた。名前を呼ぶまで、許してもらえなかった。|{a}は{b}の首筋に何度も痕を残した。「誰が見ても、私のものだって分かるように｜誰が見ても、私のものだと分かるようにする｜誰が見ても、私のものだと分かるようにします」'),
    /* 執着する側が受け（攻めに設定した人を受けの位置にはしない） */
    bottom: L('{a}は動けない{b}の上に跨り、自分から腰を落とした。「……ね、気持ちいいでしょ？　私じゃなきゃ、だめになって｜……どうだ、気持ちいいだろう？　私でなければ、だめになれ｜……ね、気持ちいいでしょう？　私じゃなきゃ、だめになってください」|{a}は毎晩、{b}の体に自分を刻み込むように身を委ねた。{b}が果てるたび、{a}は満たされた顔で{b}の胸に頬を寄せた。|{a}は{b}をベッドに縛ったまま、自分から{b}を受け入れた。「逃げられないのは、私のほうなのかもね｜逃げられないのは、私のほうなのかもしれない｜逃げられないのは、私のほうなのかもしれませんね」')
  };
  /* r18:end */
  /* 箱庭ごとの文（PACK）があれば 65% でそちらを使う。PACK の key が only なら共通の文は使わない */
  /* noC：恋敵がいないとき（{c} を含む文を使わない） */
  function T(ctx, key, noC) {
    var p = O.PACK[ctx.scen && ctx.scen.id], own = p && p[key], base = O.TEXT[key] || (O.CAGE_NIGHT || {})[key];
    var ok = function (l) { return (l || []).filter(function (x) { return !noC || x.indexOf('{c}') < 0; }); };
    own = ok(own); base = ok(base);
    var arr = own.length ? (base.length && !(p.only && p.only.indexOf(key) >= 0) && ctx.rng() < 0.35 ? base : own) : base;
    return arr.length ? ctx.pick(arr) : '';
  }
  O.text = T;
  /* 文の差し込み（{a}{b}{c} のほか、箱庭ごとの fill があればそれも） */
  /* 監禁した場所（{where}）。箱庭ごとの文（PACK[id].where：文字列か function(ctx, a, b)）があればそれを使う */
  O.where = function (ctx, a, b) {
    var p = O.PACK[ctx.scen && ctx.scen.id], w = p && p.where;
    if (typeof w === 'function') w = w(ctx, a, b);
    return w || '誰も来ない部屋';
  };
  function F(ctx, txt, a, b, c) {
    if (txt && txt.indexOf('{where}') >= 0) txt = txt.split('{where}').join(O.where(ctx, a, b));
    var s = ctx.t(txt, a, b, c), k = ctx.scen && ctx.scen.obsessKit;
    return k && k.fill ? k.fill(ctx, s, a, b, c) : s;
  }
  O.fill = F;

  /* ---------- 出来事 ---------- */
  function cool(ctx, s, n) { var kit = ctx.scen && ctx.scen.obsessKit, c = kit && kit.cool != null ? kit.cool : 2; return ctx.stepIndex - s.at >= Math.min(n || 2, c); }
  function why(ctx, a, b, s) { var sb = O.subOf(ctx, a, b), g = sb && HK.Gap ? HK.Gap.why(ctx, a, b) : ''; return a.name + 'の' + b.name + 'への執着（' + Math.round(s.lv) + '・' + O.TYPE_NAME[O.type(a, ctx, b)] + '型' + (g ? '・' + g : '') + '）'; }

  /* 嫉妬が積もる（関係を設定していなくても）：好きな相手が恋敵と親しいと、区切りごとに少しずつ。O.install が箱庭の after に足す */
  O.tick = function (ctx) {
    var kit = ctx.scen && ctx.scen.obsessKit, k = (kit && kit.tick) || 1;
    /* 監禁していた人が亡くなった・いなくなったら、閉じ込められていた人は外に出る */
    ctx.chars.forEach(function (b) {
      if (b.flags.caged == null) return;
      var a = ctx.chars[b.flags.caged];
      if (a && a.alive && !a.out) return;
      var pf = a ? ctx.pair(a, b) : null;
      if (pf) { pf.captive = null; pf.captiveEnded = pf.captiveEnded || 'gone'; var s = pf.ob && pf.ob[a.i]; if (s) { s.cage = null; s.climax = null; } }
      if (a) delete a.flags.cagePair;
      delete b.flags.cagePair; delete b.flags.caged;
    });
    ctx.chars.forEach(function (a) {
      if (!a.alive || a.out) return;
      var b = ctx.crush ? ctx.crush(a, 42) : null;
      if (!b || !near(ctx, a, b) || O.blocked(ctx, a, b) || !O.rival(ctx, a, b)) return;
      O.add(ctx, a, b, (1.5 + a.tr.jealous * 4) * k);
    });
  };
  /* 執着が芽生えた場面（執着度が 35 を越えて最初の出来事。関係で「執着」を設定した二人にはない） */
  function seed(ctx, a, b, s) {
    var c = O.rival(ctx, a, b);
    s.seen = 1;
    if (c) ctx.mod(a, c, { ten: 10, aff: -6 });
    return { with: c ? [b, c] : [b], cat: 'conflict', text: F(ctx, T(ctx, 'seed', !c), a, b, c), why: a.name + 'の嫉妬・執着（' + Math.round(a.tr.jealous * 100) + '）。' + (c ? b.name + 'と' + c.name + 'の近さに、' : '') + '想いが執着に変わった', mag: 22 };
  }

  /* 執着する側の行動（段階・型ごと） */
  O.act = function (ctx, a, opt) {
    opt = opt || {};
    var b = O.target(ctx, a);
    if (!b) return null;
    var s = st(ctx, a, b), stg = O.stage(s.lv), ty = O.type(a, ctx, b), c = O.rival(ctx, a, b);
    if (!cool(ctx, s)) return null;
    s.at = ctx.stepIndex;
    if (!s.seen) return seed(ctx, a, b, s);
    if (s.cage) return O.cageTick(ctx, a, b, s, opt);
    /* 型を選んだ執着は、想いの差（HK.Gap）が大きいと束縛の段階のうちから暴走しうる */
    var gp = HK.Gap && O.subOf(ctx, a, b) ? HK.Gap.of(ctx, a, b) : 0;
    if ((stg >= 3 || (stg >= 2 && s.lv >= 70 && (HK.Dark.on(ctx) === 'dark' || gp >= 0.6))) && !s.climax) { var cl = O.climax(ctx, a, b, s, ty, c, opt); if (cl) return cl; }
    var key = stg >= 2 ? ty + '2' : ty;
    if (key === 'purge2' && !c) key = 'bind2';
    var txt = T(ctx, key, !c);
    if (!txt) return null;
    var dB = stg >= 2 ? { ten: 8, aff: -2 } : { att: 2, ten: 3 };
    ctx.mod(a, b, { att: 3 });
    ctx.mod(b, a, dB);
    if (key === 'purge2' && c) { ctx.mod(c, a, { ten: 14, aff: -10 }); ctx.mod(a, c, { ten: 10 }); ctx.stress(c, 8); }
    if (ty === 'depend' && stg >= 2) { ctx.stress(a, 10); ctx.stress(b, 8); }
    if (ty === 'hatelove') { ctx.mod(b, a, { ten: 4, aff: -2 }); ctx.stress(b, stg >= 2 ? 8 : 4); }
    O.add(ctx, a, b, 3 + a.tr.jealous * 2);
    return { with: c && /\{c\}/.test(txt) ? [b, c] : [b], cat: stg >= 2 || ty === 'hatelove' ? 'conflict' : 'romance', text: F(ctx, txt, a, b, c), why: why(ctx, a, b, s), mag: 10 + stg * 8 };
  };

  /* 執着される側の反応 */
  O.react = function (ctx, b) {
    var a = O.obsessorOf(ctx, b);
    if (!a) return null;
    var s = st(ctx, a, b);
    if (s.cage || !cool(ctx, s, 1)) return null;
    var stn = O.stance(ctx, b, a), ty = O.type(a, ctx, b), key, d;
    /* 落ち着かせる（NP・Aが高い人は、拒むより先に向き合う） */
    if ((stn === 'accept' || stn === 'unaware') && b.tr.np + b.tr.a * 0.5 > 1.0 && ctx.rng() < 0.5) { key = 'r_calm'; d = -12; ctx.mod2(a, b, { trust: 8 }, { trust: 4 }); }
    else if (stn === 'mutual') { key = 'r_mutual'; d = 6; ctx.mod2(a, b, { att: 6, aff: 4 }, { att: 6, aff: 4 }); }
    else if (stn === 'accept') { key = 'r_accept'; d = ty === 'devote' || ty === 'depend' ? -6 : 3; ctx.mod2(a, b, { aff: 5 }, { aff: 3, att: 4 }); ctx.stress(b, 5); }
    else if (stn === 'hate') { key = 'r_hate'; d = ty === 'devote' ? 4 : 12; ctx.mod2(a, b, { ten: 8 }, { ten: 10, aff: -6 }); ctx.stress(a, 10); }
    else if (stn === 'confused') { key = 'r_confused'; d = ty === 'devote' ? 2 : 6; ctx.mod2(a, b, { att: 2 }, { ten: 4, aff: 2 }); ctx.stress(b, 8); }
    else if (stn === 'afraid') { key = 'r_afraid'; d = ty === 'devote' ? 3 : 9; ctx.mod2(a, b, { ten: 6 }, { ten: 8 }); ctx.stress(b, 10); }
    else { key = 'r_unaware'; d = 2; ctx.mod2(a, b, { att: 2 }, { aff: 3 }); }
    s.at = ctx.stepIndex;
    O.add(ctx, a, b, d);
    return { with: [a], cat: key === 'r_hate' || key === 'r_afraid' ? 'conflict' : 'romance', text: F(ctx, T(ctx, key), a, b), why: b.name + 'の気持ち（' + { unaware: '気づいていない', afraid: '怖がっている', hate: '嫌っている', confused: '困惑している', accept: '受け入れている', mutual: '共依存' }[stn] + '）と' + a.name + 'の執着（' + Math.round(s.lv) + '）', mag: 10 };
  };

  /* 暴走：監禁・恋敵への危害・心中のどれか（箱庭ごとに opt で止められる） */
  O.climax = function (ctx, a, b, s, ty, c, opt) {
    var safe = SAFE(), stn = O.stance(ctx, b, a), opts = [];
    if (HK.Dark.skip(ctx, 'cage')) return null;   /* 展開の重さ：穏やかでは、暴走をまれに見送る */
    /* 型を選んだ執着：想いの差が大きいほど、監禁・恋敵への危害に傾く（HK.Gap.k。おまかせの型では 1） */
    var gk = HK.Gap && O.subOf(ctx, a, b) ? HK.Gap.k(ctx, a, b) : 1;
    if (opt.cage !== false) opts.push(['cage', (ty === 'bind' ? 3 : ty === 'devote' || ty === 'hatelove' ? 2 : 1.4) * HK.Dark.f(ctx, 'cage') * gk]);
    if (opt.harm !== false && c) opts.push(['harm', (ty === 'purge' ? 3.5 : ty === 'hatelove' ? 1.8 : ty === 'bind' ? 1.4 : 0.6) * HK.Dark.f(ctx, 'harm') * HK.Dark.pick(ctx, 0.6, 1, 1.6) * gk]);
    /* 心中の起こりやすさは箱庭ごとに opt.shinjuW で下げられる（出られない部屋は 0.35） */
    if (opt.shinju !== false) opts.push(['shinju', (ty === 'depend' ? 3 : stn === 'mutual' ? 2.2 : ty === 'hatelove' ? 1.5 : 0.7) * (opt.shinjuW == null ? 1 : opt.shinjuW) * HK.Dark.f(ctx, 'shinju') * HK.Dark.pick(ctx, 0.6, 1, 1.6)]);
    /* 箱庭ごとの暴走（opt.more → [[id, 重み, run(ctx, a, b, s, ty, c)], ...]） */
    var more = opt.more ? opt.more(ctx, a, b, s, ty, c, safe) || [] : [];
    more.forEach(function (m) { if (m[1] > 0) opts.push(m); });
    if (!opts.length) return null;
    var hit = HK.weighted(ctx.rng, opts, function (o) { return o[1]; }), pick = hit[0];
    s.climax = pick;
    var pf = ctx.pair(a, b);
    if (hit[2]) { var mr = hit[2](ctx, a, b, s, ty, c); if (mr) return mr; s.climax = null; return null; }
    if (pick === 'cage') {
      /* 全年齢版は、その場で引き止めるだけ（閉じ込めたまま日が過ぎることはない） */
      if (safe) { s.climax = null; s.lv = clamp(s.lv - 12, 0, 100); }
      else { s.cage = { from: ctx.stepIndex, n: 0 }; pf.captive = { by: a.i }; a.flags.cagePair = b.i; b.flags.cagePair = a.i; b.flags.caged = a.i; }
      if (HK.Emo) { HK.Emo.bump(ctx, b, { fear: safe ? 25 : 45 }, a.name + 'の執着'); HK.Emo.bump(ctx, a, safe ? { anger: 15 } : { lust: 25, anger: 10 }); }   /* 気分（emotion.js）：閉じ込められた側は恐れ、執着する側は火照り（R18版だけ） */
      ctx.mod(b, a, { ten: 20, trust: -12 }); ctx.stress(b, 20);
      return { with: [b], cat: 'conflict', text: F(ctx, T(ctx, safe ? 'cage_s' : 'cage'), a, b), why: why(ctx, a, b, s) + '。執着が暴走した', mag: 45 };
    }
    if (pick === 'harm') {
      var lethal = !safe && opt.lethal !== false && (ty === 'purge' || (ty === 'hatelove' && gk > 1.6)) && s.lv >= 90 && ctx.rng() < 0.35 * HK.Dark.f(ctx, 'kill') * gk;
      /* 憎悪を持っても殺さない相手（attr.js の HK.Attr.spare）なら、命までは奪わない */
      if (lethal && HK.Attr && HK.Attr.spare && HK.Attr.spare(ctx, c, a)) lethal = false;
      /* 恋敵に向いたあとも、執着そのものは続く（次の暴走もありうる） */
      s.climax = null; s.lv = clamp(s.lv - 10, 0, 100);
      ctx.mod(c, a, { ten: 35, aff: -30, trust: -30 }); ctx.mod(b, a, { ten: 12, trust: -10 });
      if (lethal && ctx.kill) { ctx.kill(c, a, b.name + 'に執着する' + a.name + 'の手で'); ctx.pair(a, c).obHarm = true; return { with: [b, c], cat: 'kill', text: F(ctx, T(ctx, 'harmKill'), a, b, c), why: why(ctx, a, b, s) + '。恋敵の' + c.name + 'を排除した', mag: 60 }; }
      if (!safe) { c.hp = Math.max(1, (c.hp || 100) - 40); ctx.stress(c, 25); }
      ctx.pair(a, c).obHarm = true;
      return { with: [b, c], cat: 'conflict', text: F(ctx, T(ctx, safe ? 'harm_s' : 'harm'), a, b, c), why: why(ctx, a, b, s) + '。恋敵の' + c.name + 'に矛先が向いた', mag: 45 };
    }
    /* 心中：共依存か、執着される側が抵抗できなければ。全年齢版・死なない箱庭では未遂 */
    var resist = stn === 'mutual' ? 0.15 : stn === 'accept' ? 0.45 : stn === 'confused' ? 0.6 : 0.75;
    resist += b.tr.np * 0.15 + b.tr.a * 0.1;
    resist = HK.Dark.live(ctx, resist, 'shinju');
    if (safe || opt.lethal === false || ctx.rng() < resist || (HK.Attr && HK.Attr.spare && HK.Attr.spare(ctx, b, a))) {
      ctx.mod2(a, b, { trust: 10, att: 6 }, { ten: 14, att: 4 }); ctx.stress(a, 20); ctx.stress(b, 25);
      s.lv = clamp(s.lv - 25, 0, 100); s.climax = null;
      return { with: [b], cat: 'conflict', text: F(ctx, T(ctx, safe ? 'shinju_s' : 'shinjuFail'), a, b), why: why(ctx, a, b, s) + (safe ? '。「二人だけの世界」に誘い、' : '。心中に誘い、') + b.name + 'が引き止めた', mag: 45 };
    }
    pf.shinju = { by: a.i };
    if (ctx.kill) { ctx.kill(b, a, a.name + 'との心中で'); ctx.kill(a, null, b.name + 'との心中で'); }
    return { with: [b], cat: 'kill', text: F(ctx, T(ctx, 'shinju'), a, b), why: why(ctx, a, b, s) + '。' + (stn === 'mutual' ? '二人とも、それを望んでいた' : b.name + 'は逃げきれなかった'), mag: 70 };
  };

  /* 監禁のあいだ：日々の様子・夜（R18）・逃走・救出・解放 */
  O.cageTick = function (ctx, a, b, s, opt) {
    s.cage.n++;
    var safe = SAFE(), c = null;
    /* 救出：b を大事に思う人が気づく */
    ctx.chars.forEach(function (o) { if (!c && o !== a && o !== b && !away(o) && near(ctx, a, o) && R(ctx, o, b).aff + R(ctx, o, b).trust > 55 && ctx.rng() < 0.25 + s.cage.n * 0.08) c = o; });
    var end = null;
    if (c) end = 'rescue';
    else if (ctx.rng() < 0.12 + b.tr.caution * 0.15 + b.tr.aggr * 0.1 + s.cage.n * 0.05) end = 'escape';
    else if (O.stance(ctx, b, a) !== 'mutual' && s.cage.n >= 2 && ctx.rng() < 0.18 + a.tr.np * 0.15) end = 'release';
    if (end) {
      var days = s.cage.n;
      s.cage = null; ctx.pair(a, b).captiveEnded = end; ctx.pair(a, b).captive = null; delete a.flags.cagePair; delete b.flags.cagePair; delete b.flags.caged;
      if (end === 'rescue') { ctx.mod(c, a, { ten: 25, aff: -20, trust: -25 }); ctx.mod2(b, c, { trust: 20, aff: 15 }, { aff: 8 }); }
      ctx.mod(b, a, { ten: 15, trust: -15 }); s.lv = clamp(s.lv - (end === 'release' ? 25 : 10), 0, 100); s.climax = null;
      return { with: c ? [b, c] : [b], cat: end === 'rescue' ? 'help' : 'conflict', text: F(ctx, T(ctx, end, !c), a, b, c), why: a.name + (SAFE() ? 'の囲い込み（' : 'による監禁（') + days + '区切りで終わった）', mag: 30 };
    }
    /* 監禁の夜：受け入れている・共依存でなければ「合意のない展開」（内容のスイッチ）が入のときだけ */
    var stn0 = O.stance(ctx, b, a);
    var night = !safe && opt.night !== false && (stn0 === 'mutual' || stn0 === 'accept' || (!HK.Content || HK.Content.ok(ctx, 'force'))) && ctx.romanceOk([a, b]) && HK.Pos && HK.Pos.okSex && HK.Pos.okSex(a, b) && ctx.rng() < 0.55;
    if (night) {
      var ord = HK.Pos.order(a, b), top = ord[0] === a;
      ctx.pair(a, b).night = true;
      ctx.mod2(a, b, { att: 6 }, { att: 4, ten: 6 });
      return { with: [b], cat: 'romance', sex: true, text: F(ctx, T(ctx, top ? 'top' : 'bottom'), a, b), why: a.name + 'による監禁の夜（執着 ' + Math.round(s.lv) + (stn0 === 'mutual' ? '・共依存' : stn0 === 'accept' ? '・受け入れている' : '') + '）', mag: 30 };
    }
    ctx.mod(b, a, { ten: 4 }); ctx.stress(b, 6);
    return { with: [b], cat: 'conflict', text: F(ctx, T(ctx, 'cageDay'), a, b), why: a.name + (SAFE() ? 'の囲い込み（' : 'による監禁（') + s.cage.n + '区切り目）', mag: 15 };
  };

  /* ---------- 結末の分類（engine.js の classify から） ---------- */
  O.classify = function (ctx, A, B, pf) {
    if (pf.shinju) return { id: 'shinju', dir: pf.shinju.by };
    if (pf.captive) return { id: 'captive', dir: pf.captive.by };
    var m = pf.ob;
    if (!m) return null;
    var la = m[A.i] ? m[A.i].lv : 0, lb = m[B.i] ? m[B.i].lv : 0;
    if (Math.max(la, lb) >= 60 && !O.blocked(ctx, la >= lb ? A : B, la >= lb ? B : A)) return { id: la >= 60 && lb >= 60 ? 'codep' : 'yandere', dir: la >= lb ? A.i : B.i };
    return null;
  };
  O.pairText = function (ctx, A, B, cl) {
    var x = cl.dir != null ? ctx.chars[cl.dir] : A, y = x === A ? B : A, s = (ctx.pair(A, B).ob || {})[x.i] || {};
    var safe = SAFE();
    switch (cl.id) {
      case 'shinju': return x.name + 'は' + y.name + 'を誰にも渡さないまま、二人で逝くことを選んだ。';
      case 'captive': return safe ? x.name + 'は' + y.name + 'をそばから離さず、外の世界から遠ざけたまま終わった。' : x.name + 'は' + y.name + 'を閉じ込めたまま、外の世界から隠し続けている。';
      case 'codep': return '互いが互いを縛り、二人だけで閉じた関係になった。';
      case 'yandere': return x.name + 'から' + y.name + 'への想いは、執着になった' + (ctx.pair(A, B).captiveEnded ? (safe ? '（囲い込みは' : '（監禁は') + { rescue: '救い出されて', escape: y.name + 'が逃げ出して', release: x.name + 'が手を離して', gone: '二人が離ればなれになって' }[ctx.pair(A, B).captiveEnded] + '終わった）' : '') + '。' + (s.lv >= 80 ? 'もう、誰にも止められない。' : '');
    }
    return null;
  };
  if (HK.LABELS) {
    HK.LABELS.shinju = { name: '心中', cls: 'kill', pol: -2 };
    HK.LABELS.captive = { name: SAFE() ? '囲い込み' : '監禁', cls: 'obsess', pol: -1 };
    HK.LABELS.yandere = { name: '執着', cls: 'obsess', pol: 0 };
    HK.LABELS.codep = { name: '共依存', cls: 'obsess', pol: 0 };
  }

  /* ---------- 箱庭に組み込む ---------- */
  O.install = function (scen, opt) {
    if (!scen || !scen.events || scen.obsessKit) return;
    scen.obsessKit = opt = opt || {};
    var W = opt.w || 1;
    var after0 = scen.after;
    scen.after = function (ctx) { var r = after0 ? after0.apply(this, arguments) : undefined; O.tick(ctx); if (opt.after) opt.after(ctx); return r; };
    scen.events.push({
      /* 執着は箱庭の進行役のイベント（pri）と同じ扱い：設定した執着が、ほかの出来事に埋もれないように */
      id: 'ob_act', cat: 'conflict', noOdd: true, pri: true,
      when: function (ctx, a) { return !!O.target(ctx, a); },
      w: function (ctx, a) { var b = O.target(ctx, a), s = st(ctx, a, b); return W * (s.cage ? 4 : 1 + s.lv / 30) * (opt.wAct || 1); },
      run: function (ctx, a) { var r = O.act(ctx, a, opt); if (r && opt.decorate) r = opt.decorate(ctx, a, r) || r; return r; }
    });
    scen.events.push({
      id: 'ob_react', cat: 'bond', noOdd: true,
      when: function (ctx, b) { return !!O.obsessorOf(ctx, b); },
      w: function () { return W * 1.6; },
      run: function (ctx, b) { return O.react(ctx, b); }
    });
    if (opt.extra) opt.extra.forEach(function (e) { scen.events.push(e); });
  };
})();
