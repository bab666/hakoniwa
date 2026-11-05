/* 箱庭シミュレーター: 今日から同居生活の「長い回の後半の出来事」（両ビルド。かたまり scen-futari。futari-days.js より後に読む。2026-11-05 担当TF）
   申し送り（docs/reports/2026-11-05/train-futari-playtest-2.md・playthrough-body.md）：30 日の回の後半が、甘い日常の短い文と暮らしの一幕だけで平坦。
   後半（14 日以上の回の、半分を過ぎた日から）に、関係・季節・設定から変化が出る出来事を 5 種、一回の遊びでそれぞれ一度ずつ足す。
   ・引っ越しの話（ft_l_move）：同居の終わり・続け方の話。ぎこちない二人／打ち解けた二人／恋人で文を分ける
   ・家族の訪問（ft_l_visit）：住人の家族（血縁の二人なら親戚）が家に寄る
   ・近所づきあい（ft_l_neigh）：暮らし方（二人だけの家・古い家の留守番／シェアハウス）ごと
   ・同居のひと月（ft_l_month）：28 日以上の回の 24 日目から。ぎこちない二人／打ち解けた二人／恋人
   ・仕事の繁忙期（ft_l_busy）：平日の昼・夕方。忙しさのすれ違いと、山を越えた日
   台詞は3本「くだけた常体｜硬い常体｜敬語」（一人称は「私」、二人称は「あなた」）。家事・料理の主語は書かない（家事をしない設定の人がいるため）。登場人物はすべて成人として扱う */
/* @event scen=futari id=ft_l_move cat=bond tie=- cond=14日以上の回の後半 label=同居の終わりと続け方の引っ越しの話 */
/* @event scen=futari id=ft_l_visit cat=bond tie=- cond=14日以上の回の後半 label=住人の家族が同居の家に寄る */
/* @event scen=futari id=ft_l_neigh cat=bond tie=- cond=14日以上の回の後半 label=同居の家の近所づきあい */
/* @event scen=futari id=ft_l_month cat=bond tie=- cond=28日以上の回の24日目から label=同居を始めてひと月の節目 */
/* @event scen=futari id=ft_l_busy cat=bond tie=- cond=14日以上の回の後半の平日 label=住人の仕事の繁忙期と山を越えた日 */
(function () {
  'use strict';
  var HK = window.HK, FC = HK && HK.FutariCore;
  if (!FC || !FC.ev) return;
  var L = FC.L;
  function H() { return HK.FutariHouse || null; }
  function hs(ctx) { return ctx.ft && ctx.ft.house; }
  function inHouse(ctx, a, b) { return !!b && FC.sameHome(ctx, a, b) && FC.together(ctx, a, b) && !FC.onTrip(ctx, a) && !FC.onTrip(ctx, b) && !a.gone && !b.gone; }
  function homeN(ctx) { return H() && H().homeName ? H().homeName(ctx) : '自宅'; }
  /* 後半：14 日以上の回の、半分を過ぎた日から */
  function late(ctx) { var f = ctx.ft; return f.days >= 14 && f.day >= Math.round(f.days * 0.5); }
  function done(ctx, k) { return !!(ctx.ft.lateDone && ctx.ft.lateDone[k]); }
  function mark(ctx, k) { (ctx.ft.lateDone = ctx.ft.lateDone || {})[k] = ctx.ft.day; ctx.ft.lateDay = ctx.ft.day; }
  /* 後半の出来事は一日に一つまで */
  function today(ctx) { return ctx.ft.lateDay === ctx.ft.day; }
  /* 二人の間柄：恋人（lover）／打ち解けた（warm）／まだぎこちない（stiff） */
  function mood(ctx, a, b) {
    if (FC.couple(ctx, a, b)) return 'lover';
    var aw = H() && H().awk && FC.stOf(ctx, a, b).awk != null ? H().awk(ctx, a, b) : 50;
    return aw < 45 || FC.st(ctx, a, b) >= 1 ? 'warm' : 'stiff';
  }
  /* 三人以上の家では「二人で住んでいる」「二人の名前」の文を出さない */
  function many(ctx, l) { return ctx.chars.length >= 3 ? l.filter(function (t) { return !/二人で住ん|二人で一組|二人の名前|二人の家の鍵/.test(t); }) : l; }
  function livKey(ctx) { var h = hs(ctx); return h && h.reason === 'house' ? 'house' : ctx.ft.liv === 'share' ? 'share' : 'cohab'; }

  /* ======================= 文 ======================= */
  var MOVE = {
    stiff: L('{a}は、居間のテーブルに不動産屋のチラシを置いたままにしていた。{b}はそれを見て、この暮らしにも終わりがあることを思い出した。|' +
      '{a}と{b}は、同居が終わったあとのことを、初めて具体的に話した。荷物の運び出しの段取りを決めるうちに、なぜか二人とも口数が減った。|' +
      '[en]{b}は、{a}が段ボールを一つだけ組み立てているのを見かけた。{b}「もう準備？｜もう準備か｜もう準備ですか」{a}「念のため｜念のためだ｜念のためです」――段ボールは、その日は空のままだった。'),
    warm: L('{a}と{b}は、同居の期限が来たらどうするかを話した。{a}「このまま住んでもいいかもね｜このまま住んでもいいかもしれない｜このまま住んでもいいかもしれませんね」――{b}はすぐには返事をしなかったが、首を横には振らなかった。|' +
      '{a}は、次に住む部屋の候補を眺めていて、二部屋ある間取りばかり選んでいる自分に気づいた。|' +
      '[en]{a}と{b}は、この暮らしをもうしばらく続けるかどうかを、居間で話し合った。結論は、言い出す前から二人とも同じだった。'),
    lover: L('{a}と{b}は、もう少し広い部屋に二人で引っ越す話を始めた。駅からの距離と日当たりで、さっそく意見が分かれた。|' +
      '[en]{a}は、内見の予約の画面を{b}に見せた。{b}は、画面より先に{a}の顔を見て笑った。|' +
      '{a}と{b}は、次の部屋に持っていく家具と、置いていく家具を紙に書き出した。二人で選んだものは、全部「持っていく」の欄に入った。')
  };
  /* {fam}＝住人の家族（血縁の二人なら親戚） */
  var VISIT = L('[de]{a}の{fam}が、近くまで来たついでに家に寄った。{b}はぎこちなく挨拶をして、居間の座布団を一枚多く出した。帰り際、{fam}は{b}に深々と頭を下げた。|' +
    '[de]{a}の{fam}から、今から寄ってもいいかと連絡が来た。三十分後、玄関には手土産の果物の箱が置かれていた。|' +
    '[de]{a}の{fam}が、季節の野菜を両手に提げて訪ねてきた。{b}は、{a}が{fam}の前でだけ見せる子どもっぽい顔を、初めて見た。|' +
    '[de]{a}の{fam}は、家の中をひと通り見て回り、ちゃんと暮らしているのを確かめて、安心した顔で帰っていった。|' +
    '[e]{a}の{fam}が帰ったあと、{a}と{b}は居間で同時にため息をついた。気を張っていたのは、二人とも同じだった。');
  var NEIGH = {
    home: L('[de]隣の家の人から、作りすぎたという煮物のお裾分けが届いた。{a}と{b}は、器を返すときに何を添えるかで、しばらく相談した。|' +
      '[m]出がけの家の前で、{a}と{b}は近所の人と行き合った。二人で住んでいるのかと訊かれて、{a}が先に頷いた。|' +
      '[de]回覧板が回ってきた。{a}は判を押す欄を見て、二人の名前をどう書くかで少しだけ迷った。|' +
      '[e]{a}と{b}は、近所の人にすっかり二人で一組として覚えられていた。{a}が一人で歩いていると、今日はお連れさんは、と訊かれた。'),
    share: L('[en]{a}と{b}は、シェアハウスのほかの住人に、最近いつも一緒にいると冷やかされた。|' +
      '[de]シェアハウスの共用部の大掃除の日、{a}と{b}は同じ持ち場に割り振られた。窓を拭き終えるころには、手順の分け方がすっかり決まっていた。|' +
      '[e]シェアハウスの掲示板に、新しい住人を迎える会の知らせが貼られた。{a}と{b}は、出し物を一緒に考えることになった。')
  };
  var MONTH = {
    stiff: L('{a}と{b}が同じ家に住み始めて、そろそろひと月になろうとしていた。カレンダーを見た{a}は、思ったより早かったと感じた。|' +
      '{a}は、最初の月の光熱費の明細を見て、一人で暮らしていた頃との違いに少し驚いた。{b}にも見せると、{b}は黙って電卓を取り出した。'),
    warm: L('同居が、もうすぐひと月になる。{a}と{b}は、記念というほどでもないからと言いながら、少しいいケーキを二つ買ってきた。|' +
      '{a}と{b}は、このひと月で撮った写真を見返した。最初の日の二人は、並んでいても少し距離があった。'),
    lover: L('{a}と{b}は、一緒に暮らし始めてからのひと月を振り返った。いちばん揉めたのも、いちばん笑ったのも、同じ居間だった。|' +
      '[en]同居を始めて、もうすぐひと月という夜、{a}は{b}に小さな包みを渡した。中身は、二人の家の鍵につける揃いのキーホルダーだった。')
  };
  var BUSY = L('[e]{a}の職場が繁忙期に入った。帰りの遅い日が続き、{b}は居間の明かりを一つだけ残して先に休むようになった。|' +
    '[e]{a}は、仕事の山場を越えた日、帰り道でいつもより少し高いプリンを二つ買った。一つは{b}の分だった。|' +
    '[n]{a}が遅く帰ると、台所のテーブルに{b}の書き置きがあった。おつかれさま、とだけ書いてあった。|' +
    '[m]{a}と{b}の仕事の忙しさが重なって、三日ほど、ほとんど顔を合わせなかった。四日目の朝、台所で鉢合わせた二人は、少し照れくさそうに笑った。');

  /* ======================= 出来事 ======================= */
  function famOf(ctx, a, b) { return FC.kinOf && FC.kinOf(ctx, a, b) ? '親戚' : '家族'; }
  FC.ev({ id: 'ft_l_move', label: '同居の終わりと続け方の引っ越しの話', cat: 'bond', tm: 'den', w: 1.6,
    need: function (ctx, a, b) { var f = ctx.ft; return late(ctx) && !done(ctx, 'move') && !today(ctx) && f.day >= Math.round(f.days * 0.6) && inHouse(ctx, a, b) && f.liv !== 'apart'; },
    pool: function (ctx, a, b) { return MOVE[mood(ctx, a, b)]; },
    spot: function (ctx) { return homeN(ctx) + 'の居間'; },
    fx: function (ctx, a, b) { mark(ctx, 'move'); ctx.mod2(a, b, { trust: 2 }, { trust: 2 }); },
    why: function (ctx, a, b) { return '同居の後半：引っ越しの話（' + { stiff: 'まだぎこちない二人', warm: '打ち解けた二人', lover: '恋人どうし' }[mood(ctx, a, b)] + '）'; } });
  FC.ev({ id: 'ft_l_visit', label: '住人の家族が同居の家に寄る', cat: 'bond', tm: 'de', w: 2.0,
    need: function (ctx, a, b) { var f = ctx.ft; return late(ctx) && !done(ctx, 'visit') && !today(ctx) && inHouse(ctx, a, b) && f.liv !== 'apart'; },
    pool: function () { return VISIT; },
    ex: function (ctx, a, b) { return { fam: famOf(ctx, a, b) }; },
    spot: function (ctx) { return homeN(ctx); },
    fx: function (ctx, a, b) { mark(ctx, 'visit'); ctx.mod2(a, b, { aff: 2 }, { aff: 2, trust: 1 }); },
    why: function (ctx, a, b) { return '同居の後半：' + a.name + 'の' + famOf(ctx, a, b) + 'の訪問'; } });
  FC.ev({ id: 'ft_l_neigh', label: '同居の家の近所づきあい', cat: 'bond', tm: 'mden', w: 1.3,
    need: function (ctx, a, b) { var f = ctx.ft; return late(ctx) && !done(ctx, 'neigh') && !today(ctx) && inHouse(ctx, a, b) && f.liv !== 'apart'; },
    pool: function (ctx) { return many(ctx, livKey(ctx) === 'share' ? NEIGH.share : NEIGH.home); },
    spot: function (ctx) { return homeN(ctx); },
    fx: function (ctx, a, b) { mark(ctx, 'neigh'); ctx.mod2(a, b, { aff: 2 }, { aff: 2 }); },
    why: function (ctx) { return '同居の後半：近所づきあい（' + { cohab: '二人だけの家', share: 'シェアハウス', house: '古い家の留守番' }[livKey(ctx)] + '）'; } });
  FC.ev({ id: 'ft_l_month', label: '同居を始めてひと月の節目', cat: 'bond', tm: 'den', w: 2.2,
    need: function (ctx, a, b) { var f = ctx.ft; return f.days >= 28 && f.day >= 23 && !done(ctx, 'month') && !today(ctx) && inHouse(ctx, a, b) && f.liv !== 'apart'; },
    pool: function (ctx, a, b) { return many(ctx, MONTH[mood(ctx, a, b)]); },
    spot: function (ctx) { return homeN(ctx); },
    fx: function (ctx, a, b) { mark(ctx, 'month'); ctx.mod2(a, b, { aff: 2, trust: 2 }, { aff: 2, trust: 2 }); },
    why: function (ctx, a, b) { return '同居の後半：同居を始めてひと月（' + { stiff: 'まだぎこちない二人', warm: '打ち解けた二人', lover: '恋人どうし' }[mood(ctx, a, b)] + '）'; } });
  FC.ev({ id: 'ft_l_busy', label: '住人の仕事の繁忙期と山を越えた日', cat: 'bond', tm: 'men', w: 2.0,
    need: function (ctx, a, b) { var f = ctx.ft; return late(ctx) && !f.hol && !done(ctx, 'busy') && !today(ctx) && FC.sameHome(ctx, a, b) && !FC.onTrip(ctx, a) && !FC.onTrip(ctx, b) && !a.gone && !b.gone && f.liv !== 'apart'; },
    pool: function () { return BUSY; },
    spot: function (ctx) { return homeN(ctx); },
    fx: function (ctx, a, b) { mark(ctx, 'busy'); ctx.mod2(a, b, { aff: 1 }, { aff: 2 }); },
    why: function (ctx, a) { return '同居の後半：' + a.name + 'の仕事の繁忙期'; } });
})();
