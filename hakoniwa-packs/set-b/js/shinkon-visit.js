/* 新婚部屋：他の住人（参加者の三人目から・名簿の登場しない住人。shinkon.js の outsideOf）の訪れ（両方のビルド。2026-11-03 利用者のフィードバック「他の住人を出すにチェックを入れると、関係性のある知り合いなどが
   遊びに来たり、出かけたり、連絡がきたりするイベントが発生するように。元恋人とかだとヤキモチエッチが発生したりする」）
   ■ HK.ShinkonVisit（VI）
     ・VI.cls(ctx, a, g)：新婚の二人の一人 a と、他の住人 g の関係の種類。fam（家族）／pfam（擬似親子）／known（友人・親友・幼なじみ・相棒・恩人）／weak（知人）／
       work（同僚・上司・先輩後輩）／school（同級生・先生・師弟）／ex（元恋人）。恋人・片想い・執着・不仲・敵対・主従などの関係は訪れの相手にしない（null）
     ・VI.word(ctx, a, g)：a から見た g の呼び名（友人・きょうだい・同僚・先輩 など）
     ・VI.roll(ctx, S, day, part)：その区切りの訪れを一つ決める { kind, host, other, g, cls }。kind：visit 遊びに来る／out 一緒に出かける／contact 連絡が来る。
       来る人は、生きていて閉じ込められていない人だけ（HK.State.here を、出番の外の「留守」の印 gone を外して確かめる）
     ・VI.follow(ctx, S, v)：恋愛にしてよい二人のとき、訪れのあとの三人の場面（bless 祝福・からかい＝仲良し系／jeal ヤキモチ＝すれ違い系）。元恋人は必ずヤキモチ、
       ほかは相手の嫉妬深さで決める（半々くらいになるように）
   ■ 文：{a}＝訪れの相手と関係のある人（迎える人・出かける人・連絡を受ける人）、{b}＝その連れ合い、{g}＝他の住人、{gl}＝{a} から見た {g} の呼び名。
     {b} と {g} が知り合いかどうかは決めない書き方（初対面・久しぶり の文は {a} と {g} のあいだだけ）。家事・料理をする言い回しは書かない。
     台詞は3本（一人称「私」・二人称「あなた」）。登場人物はすべて成人として扱う */
/* @event scen=set-b-shinkon id=sk_visit cat=bond tie=- label=他の住人が家に遊びに来る */
/* @event scen=set-b-shinkon id=sk_visit_out cat=bond tie=- label=他の住人と一緒に出かける */
/* @event scen=set-b-shinkon id=sk_visit_contact cat=bond tie=- label=他の住人から連絡が来る */
/* @event scen=set-b-shinkon id=sk_visit_bless cat=romance tie=- label=訪れた住人が二人を祝福する */
/* @event scen=set-b-shinkon id=sk_visit_jeal cat=romance tie=- label=訪れた住人にヤキモチを焼く */
(function () {
  'use strict';
  var HK = window.HK;
  if (!HK) return;
  function L(s) { return s.split('|'); }
  var CLS = { parent: 'fam', sibling: 'fam', sibprot: 'fam', sibclose: 'fam', twin: 'fam', stepsib: 'fam', relative: 'fam', pparent: 'pfam',
    friend: 'known', best: 'known', buddy: 'known', childhood: 'known', benefactor: 'known', acq: 'weak',
    colleague: 'work', boss: 'work', senpai: 'work', classmate: 'school', teacher: 'school', mentor: 'school', ex: 'ex' };
  /* 訪れの相手にしない関係（どれか一つでもあれば出さない） */
  var NG = /^(lover|spouse|mate|fated|fiance|fwb|crush|almost|honmei|yan|enemy|bad|sibbad|rival|abuse|master|worship|apathy|fear|noobs)$/;
  var WORD = { parent: '家族', sibling: 'きょうだい', sibprot: 'きょうだい', sibclose: 'きょうだい', twin: 'きょうだい', stepsib: 'きょうだい', relative: '親戚', pparent: '家族同然の人',
    friend: '友人', best: '親友', buddy: '相棒', childhood: '幼なじみ', benefactor: '恩人', acq: '知り合い', colleague: '同僚', boss: '職場の人', classmate: '同級生', ex: '元恋人' };
  function ties(ctx, a, g) { return HK.Ties && HK.Ties.all ? HK.Ties.all(ctx, a, g) || [] : []; }
  var VI = HK.ShinkonVisit = {};
  VI.cls = function (ctx, a, g) {
    var tl = ties(ctx, a, g), best = null, ORD = ['ex', 'fam', 'pfam', 'known', 'work', 'school', 'weak'];
    if (!tl.length) return null;
    if (tl.some(function (t) { return NG.test(t.type) || t.cold === 'fear' || t.cold === 'apathy'; })) return null;
    tl.forEach(function (t) { var c = CLS[t.type]; if (c && (!best || ORD.indexOf(c) < ORD.indexOf(best))) best = c; });
    if (HK.Ties.apathy && (HK.Ties.apathy(ctx, a, g) || HK.Ties.apathy(ctx, g, a))) return null;
    return best;
  };
  VI.word = function (ctx, a, g) {
    var tl = ties(ctx, a, g);
    for (var i = 0; i < tl.length; i++) {
      var t = tl[i];
      if (t.type === 'senpai') return t.a === a.i ? '後輩' : '先輩';
      if (t.type === 'teacher') return t.a === a.i ? '教え子' : '先生';
      if (t.type === 'mentor') return t.a === a.i ? '弟子' : '師匠';
      if (WORD[t.type]) return WORD[t.type];
    }
    return '知り合い';
  };
  /* ---------- 文 ---------- */
  VI.T = {
    visit: {
      fam: L('休みの日、{a}の{gl}の{g}が、手みやげの果物を提げて二人の家を訪ねてきた。{g}は部屋を見回して、「ちゃんと暮らしてるね｜ちゃんと暮らしているな｜ちゃんと暮らしていますね」と笑った。{b}も話に加わって、居間はいつになくにぎやかになった。|{a}の{gl}の{g}が、近くまで来たからと顔を出した。{g}は{a}の顔を見るなり、「元気そうでよかった｜元気そうでよかった｜元気そうでよかったです」と目を細めた。長居はせずに帰っていったが、{a}はしばらく玄関から離れなかった。'),
      pfam: L('{a}にとって家族同然の{g}が、様子を見にやってきた。{g}は二人の暮らしぶりを確かめるように部屋を見て回り、満足そうにうなずいた。{b}は少し緊張しながらも、{g}の話に耳を傾けた。|{g}がふらりと訪ねてきて、{a}の好物のお菓子を置いていった。{a}は「子ども扱いしないで｜子ども扱いするな｜子ども扱いしないでください」とむくれたが、その顔はまんざらでもなさそうだった。'),
      known: L('{a}の{gl}の{g}が、新しい家を見たいと遊びに来た。{g}は部屋をあちこち見て回り、「いい家だね｜いい家だな｜いい家ですね」と何度も言った。{a}と{g}の昔話に、{b}も笑いながら耳を傾けた。|休みの午後、{a}の{gl}の{g}がふらりと遊びに来た。三人でテレビゲームを始めると、気づけば外は暗くなっていた。{g}は「また来る｜また来る｜また来ます」と言って、上機嫌で帰っていった。'),
      weak: L('{a}の知り合いの{g}が、借りていた本を返しに立ち寄った。玄関先で少し立ち話をしただけだったが、{g}は二人の暮らしぶりに感心したように帰っていった。|近くに用事があったという{g}が、{a}に挨拶をしに顔を出した。{b}も玄関まで出てきて、三人でしばらく世間話をした。'),
      work: L('{a}の{gl}の{g}が、仕事の書類を届けるついでに家に寄った。玄関先のつもりが、{b}にすすめられて上がっていき、結局一時間ほど話し込んだ。|休みの日に、{a}の{gl}の{g}が遊びに来た。職場では見られない{a}の顔に、{g}は「家だとこんな感じなんだ｜家だとこんな感じなのか｜家だとこんな感じなんですね」と面白がった。'),
      school: L('{a}の{gl}の{g}が、近くに来たついでだと言って顔を出した。{a}と{g}は昔の話で盛り上がり、{b}はその話を楽しそうに聞いていた。|{a}の{gl}の{g}が、二人の家に遊びに来た。{g}が持ってきた古い写真を囲んで、三人は夕方まで笑い通しだった。'),
      ex: L('{a}の元恋人の{g}が、近くまで来たからと、わざわざ顔を出した。{g}は「元気そうで安心した｜元気そうで安心した｜元気そうで安心しました」と言って、{a}にだけ分かる昔話を一つした。{b}は笑顔で相づちを打ちながら、二人の会話の間合いをじっと見ていた。|{a}の元恋人の{g}が、預けたままだった荷物を受け取りに来た。玄関先の短いやりとりだったが、{a}と{g}のあいだには、二人にしか分からない空気があった。')
    },
    out: L('{a}は{gl}の{g}に誘われて、昼から買い物に出かけた。帰ってきた{a}の手には、{b}へのおみやげの袋が一つ増えていた。|{a}は{gl}の{g}と、久しぶりにお昼を食べに出かけた。{a}は帰ってくるなり、{g}から聞いた話を{b}に一つずつ話して聞かせた。|{a}は{gl}の{g}に呼ばれて、少しだけ出かけていった。家に残った{b}は、{a}の帰りを待ちながら、静かな部屋でひと息ついた。'),
    contact: {
      fam: L('{a}のスマホに、{gl}の{g}から連絡が届いた。「ちゃんと食べてる？｜ちゃんと食べているか｜ちゃんと食べていますか」という一言に、{a}は苦笑いしながら返事を打った。|夜、{a}の{gl}の{g}から電話がかかってきた。他愛のない話ばかりだったが、電話を切った{a}の顔は、どこかほっとしていた。'),
      known: L('{a}のスマホに、{gl}の{g}から写真つきの連絡が届いた。{a}は画面を{b}にも見せて、「相変わらずだ｜相変わらずだ｜相変わらずです」と笑った。|夜、{gl}の{g}から{a}に電話がかかってきた。長電話になりかけたところで、{a}は「また今度、うちにも来て｜また今度、うちにも来てくれ｜また今度、うちにも来てください」と言って電話を切った。'),
      work: L('休みの日の昼、{a}のスマホに{gl}の{g}から仕事の連絡が届いた。{a}は短く返事をしてから、{b}に「ごめん、もう終わった｜すまない、もう終わった｜ごめんなさい、もう終わりました」と謝った。|{a}の{gl}の{g}から、差し入れのお礼の連絡が届いた。{a}はうれしそうに、その文面を{b}にも読み上げた。'),
      ex: L('夜、{a}のスマホに元恋人の{g}から連絡が届いた。用件は他愛のないものだったが、{a}は少し迷ってから、短い返事だけを送った。|{a}のスマホが鳴り、画面に元恋人の{g}の名前が出た。{a}は{b}の前でそのまま電話に出て、手短に用件を済ませた。')
    },
    bless: L('{g}は帰りぎわ、{a}と{b}を並べて見て、「二人とも、幸せそうでなにより｜二人とも、幸せそうでなによりだ｜お二人とも、幸せそうでなによりです」と笑った。{a}と{b}は顔を見合わせて、少し照れた。|{g}は二人の仲のよさをさんざんからかってから、「末永くお幸せに｜末永く幸せにな｜末永くお幸せに」と手を振った。{b}は耳まで赤くなり、{a}はその横で小さく笑った。|{g}がこっそり{b}に耳打ちした。「{a}のこと、よろしく｜{a}のことを、よろしく頼む｜{a}のこと、よろしくお願いします」――{b}は背筋を伸ばして、大きくうなずいた。'),
    jeal: L('{g}が帰ったあと、{b}はなんとなく口数が少なかった。{a}が理由を聞くと、{b}は「……楽しそうだったね｜……楽しそうだったな｜……楽しそうでしたね」とだけ言って、そっぽを向いた。|{a}と{g}の笑い声を聞きながら、{b}の胸の奥が小さくちくりと痛んだ。{b}は、自分がヤキモチを焼いていることに気づいて、少しだけ恥ずかしくなった。'),
    /* 元恋人から連絡が来た夜（来ていないので「帰ったあと」は書かない） */
    jealExC: L('{a}のスマホに元恋人の{g}の名前が出たときから、{b}は口数が少なくなった。{a}が電話を置くと、{b}はそっぽを向いたまま「……まだ連絡を取り合ってるんだ｜……まだ連絡を取り合っているのか｜……まだ連絡を取り合っているんですね」とつぶやいた。|{a}が元恋人の{g}と短く話すあいだ、{b}はずっと聞こえないふりをしていた。電話が終わると、{b}は{a}の袖をつかんで、自分のほうを向かせた。「今、誰のことを考えてる？｜今、誰のことを考えている｜今、誰のことを考えていますか」'),
    jealEx: L('{g}が帰ったあとも、{b}の胸のもやもやは消えなかった。{a}と{g}が交わした短い目くばせが、頭から離れない。{b}は「元恋人って、あんなに親しげなもの？｜元恋人とは、あんなに親しげなものか｜元恋人って、あんなに親しげなものなんですか」と、思わず口にしていた。|{b}は{a}の袖をつかんで離さなかった。{g}との昔の話をしていた{a}の顔が、自分の知らない顔に見えて、悔しかった。{b}のヤキモチに気づいた{a}は、困ったように、でも少しうれしそうに笑った。')
  };
  function here(c) { if (!c) return false; var g0 = c.gone; c.gone = false; var ok = HK.State && HK.State.here ? HK.State.here(c) : c.alive !== false; c.gone = g0; return ok; }
  VI.here = here;
  /* その区切りの訪れ（part：d 日中／n 夜） */
  VI.roll = function (ctx, S, day, part) {
    if (!S.G || !S.G.length) return null;
    var p = part === 'd' ? (day.hol ? 0.42 : 0.12) : 0.22;
    if (ctx.rng() > p) return null;
    var cands = [];
    S.G.forEach(function (g) {
      if (!here(g)) return;
      [S.A, S.B].forEach(function (a) {
        var c = VI.cls(ctx, a, g); if (!c) return;
        var b = a === S.A ? S.B : S.A, pa = a === S.A ? day.pa : day.pb, pb = a === S.A ? day.pb : day.pa;
        var n = (S.gUsed && S.gUsed[g.i]) || 0, dw = 1 / (1 + n);
        /* 遊びに来る：二人とも家にいる日（夜は休日の夜だけ）。出かける：迎える人が出張でない日中。連絡：いつでも（出張先でも） */
        if (!pa.trip && !pb.trip && (part === 'd' ? pa.home.d && pb.home.d : day.hol)) cands.push({ kind: 'visit', host: a, other: b, g: g, cls: c, w: (c === 'ex' ? 0.7 : 1.2) * dw });
        if (part === 'd' && !pa.trip && day.hol && c !== 'ex') cands.push({ kind: 'out', host: a, other: b, g: g, cls: c, w: 0.7 * dw });
        if (part === 'n') cands.push({ kind: 'contact', host: a, other: b, g: g, cls: c, w: 0.9 * dw });
      });
    });
    if (!cands.length) return null;
    var v = HK.weighted(ctx.rng, cands, function (x) { return x.w; });
    S.gUsed = S.gUsed || {}; S.gUsed[v.g.i] = (S.gUsed[v.g.i] || 0) + 1;
    return v;
  };
  VI.text = function (ctx, v) {
    var T = VI.T, arr;
    if (v.kind === 'out') arr = T.out;
    else if (v.kind === 'contact') arr = T.contact[v.cls === 'pfam' ? 'fam' : v.cls === 'school' || v.cls === 'weak' ? 'known' : v.cls] || T.contact.known;
    else arr = T.visit[v.cls] || T.visit.known;
    if (HK.relFilter) { var f = HK.relFilter(ctx, arr, v.host, v.g); if (f && f.length) arr = f; }
    return arr[Math.floor(ctx.rng() * arr.length)];
  };
  /* 訪れのあとの三人の場面：遊びに来た・連絡が来た（元恋人）ときだけ。恋愛にしてよい二人のとき */
  VI.follow = function (ctx, S, v) {
    if (!S.love || (v.kind !== 'visit' && !(v.kind === 'contact' && v.cls === 'ex'))) return null;
    var b = v.other, j = (b.tr && b.tr.jealous) || 0.4;
    if (v.cls === 'ex') return ctx.rng() < 0.85 ? (v.kind === 'contact' ? 'jealExC' : 'jealEx') : null;
    if (v.kind !== 'visit' || ctx.rng() < 0.35) return null;
    return ctx.rng() < 0.2 + j * 0.6 ? 'jeal' : 'bless';
  };
})();
