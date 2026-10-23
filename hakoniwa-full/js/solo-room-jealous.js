/* 箱庭シミュレーター: 出られない部屋（R18版のみ）― 「相手は一人だけ」と決めた人が、その相手がほかの人と抱き合うのを見たとき
   ・詰め寄る：「お前は俺のものだろ」と相手に迫り、そのまま抱く（CP・攻撃性・嫉妬深さ・相手への惹かれで選ばれやすい）
     相手の返し方は気質で変わる（素直に謝る／突っぱねるが折れる／「妬いた？」とからかう）
   ・気が変わる：「そっちがそうなら」と決め事を捨て、ほかの誰かに目を向ける。見せつけ返すこともある（積極性・FC）
   ・黙って傷つく：何も言えずに背を向ける（AC）。決め事は残るが、相手との間に溝ができる
   全年齢版ではこのファイルは読み込まれず、全年齢モードでも起きない。登場人物はすべて成人として扱う */
(function () {
  'use strict';
  var HK = window.HK, A = HK.RoomAPI;
  /* R18版だけの設定：条件「エッチ」の場面の描写（room-thick.js が見る。全年齢モードでは safe-room.js が外す） */
  var WR = HK.SCENARIOS && HK.SCENARIOS.whiteroom;
  if (WR && Array.isArray(WR.env) && !WR.env.some(function (e) { return e.id === 'rmlewd'; })) {
    WR.env.push({ id: 'rmlewd', label: 'エッチの描写（R18）', type: 'select', def: 'thick', options: [{ v: 'thick', label: '段落に分けて厚く' }, { v: 'mix', label: '厚い版と短い版をまぜる' }, { v: 'short', label: '一段落で短く' }], desc: '「短く」は、リードする側の型ごとの一段落（体位・シチュエーション約40種、受けの気質ごとの反応、女性どうし専用の文あり）で描く' });
  }
  if (!A) return;
  function R(ctx, a, b) { return ctx.R(a, b); }
  function free(c) { return !c.out && !c.flags.down; }
  function hasH(ctx) { return ctx.rules.some(function (r) { return r.k === 'h'; }); }
  /* P がほかの人と重ねた回数（X 以外） */
  function seenOf(ctx, X, P) {
    var n = 0;
    ctx.chars.forEach(function (q) { if (q !== P && q !== X) { var a = A.prog(ctx, P, q).act; n += (a.h || 0) * 10 + (a.kiss || 0); } });
    return n;
  }
  /* 直近で見たのがエッチか、キスか */
  function seenKind(ctx, X, P) { return ctx.chars.some(function (q) { return q !== P && q !== X && (A.prog(ctx, P, q).act.h || 0) > 0; }) ? 'h' : 'kiss'; }
  function withWhom(ctx, X, P) {
    return ctx.chars.filter(function (q) { return q !== P && q !== X && ((A.prog(ctx, P, q).act.h || 0) > 0 || (A.prog(ctx, P, q).act.kiss || 0) > 0); })
      .sort(function (a, b) { var x = A.prog(ctx, P, a).act, y = A.prog(ctx, P, b).act; return ((y.h || 0) * 10 + (y.kiss || 0)) - ((x.h || 0) * 10 + (x.kiss || 0)); })[0] ||
      ctx.chars.filter(function (q) { return q !== P && q !== X && (A.prog(ctx, P, q).act.kiss || 0) > 0; })[0];
  }

  var CLAIM_OPEN = [
    '{a}は、{b}が{c}と抱き合うのを、部屋の隅で黙って見ていた。終わるまで、一度も目を逸らさなかった。',
    '{c}の腕の中で喘ぐ{b}の声が、{a}の耳にこびりついて離れなかった。',
    '{b}が{c}から離れた瞬間、{a}が立ち上がった。'
  ];
  var KISS_OPEN = [
    '{a}は、{b}が{c}と唇を重ねるのを見てしまった。条件のためのキスだと、分かってはいた。',
    '{b}と{c}の唇が離れるとき、小さな音がした。{a}の拳が、膝の上で白くなった。'
  ];
  var CLAIM_ROUGH = [
    '{a}は{b}の手首を掴んで壁際まで引きずった。{a}「お前は俺のものだろ。……違うのか」',
    '{a}は{b}の顎を掴んで、自分の方を向かせた。{a}「他の奴の匂いをさせて戻ってくるな」',
    '{a}「一人だけって言ったよな。俺は、お前だけって決めたんだ」――{a}の声は、震えていた。',
    '{a}は{b}を床に押し倒した。{a}「あいつに触られたところ、全部上書きする」',
    '{a}は{b}の唇を、親指で強くなぞった。{a}「……ここ、誰に許した」',
    '{a}は{b}を背中から抱きすくめた。{a}「返せ。お前は、最初から俺のだ」'
  ];
  /* 相手の返し方 */
  var REPLY_ROUGH = {
    sorry: ['{b}は目を伏せた。{b}「……ごめん。条件のためだって、自分に言い聞かせてた」', '{b}は{a}の胸に額を押しつけた。{b}「ずっと、{a}の顔ばっかり浮かんでた」'],
    defy: ['{b}は{a}を睨み返した。{b}「誰が、お前のものだって？」――けれど、{a}に唇を塞がれると、{b}はもう何も言わなかった。', '{b}「離せよ……っ」――言葉とは裏腹に、{b}の指は{a}の服を掴んで離さなかった。'],
    tease: ['{b}は、くすりと笑った。{b}「なに、妬いた？」――{a}の答えは、噛みつくような口づけだった。', '{b}は{a}の頬に手を添えた。{b}「その顔が見たかったのかも」']
  };
  var CLAIM_SEX = [
    '{a}は、{c}の痕を一つずつ消すように、{b}の肌に自分の痕を刻んでいった。',
    '{a}は{b}の名前を何度も呼びながら、奥まで、確かめるように沈めた。',
    '{a}は{b}に、自分の名前を呼ばせ続けた。呼ぶたびに、深くなった。',
    '{c}が見ている前で、{a}はわざと{b}の声を引き出した。'
  ];
  /* 詰め寄った側が、受け攻めの指定では受けのとき（{b} が攻め）：自分から「上書き」をねだる */
  var CLAIM_SEX_B = [
    '{a}は{b}の首に腕を回して引き寄せ、「{c}が触ったところ、全部、{b}で塗り替えて」とねだった。',
    '{a}は{b}の手を取って、{c}の痕が残る場所へ一つずつ導いた。{b}はそのたびに、そこへ自分の痕を重ねた。'
  ];
  var CLAIM_AFTER_ROUGH = [
    '{a}は果てたあとも、{b}を離さなかった。{a}「……もう、他の奴に触らせるな」',
    '{b}は息を整えながら、{a}の背中に腕を回した。{b}「……分かってる。お前のだよ」',
    '{c}は二人から目を逸らし、壁の方を向いた。'
  ];
  var CHANGE_ROUGH = [
    '{a}は、{b}と{c}の重なる影を見つめていた。やがて、ふっと息を吐いた。{a}「……そっちがそうなら、俺も好きにする」',
    '{a}は「一人だけ」と言った自分が、急にばからしく思えた。',
    '{a}は笑った。乾いた笑いだった。{a}「なんだ。決め事なんて、最初からなかったんだな」'
  ];
  var SHOW_ROUGH = [
    '{a}は{d}の手を取って、{b}に見える位置に座った。{a}「次は、こっち」',
    '{a}は{d}の膝に乗り、{b}の目の前で唇を重ねた。',
    '{a}は{d}を壁に押しつけた。{b}の視線を、背中にはっきりと感じながら。'
  ];

  /* ---------- 口調ごとの言い回し（強い口調／やわらかい口調／敬語）。台詞の変換に任せると語尾が混ざるので、書き分ける ---------- */
  /* 口調の分類は tone-registry.js の group */
  function grp(p) { var t = HK.toneOf ? HK.toneOf(p) : p.tone, g = HK.toneOpt && HK.toneOpt(t, 'group'); return g === 'polite' || g === 'soft' ? g : 'rough'; }
  var CLAIM = {
    rough: CLAIM_ROUGH,
    soft: [
      '{a}は{b}の手首を掴んで、壁際まで引き寄せた。{a}「ねえ、{b}は僕のものでしょ？……違うの？」',
      '{a}は{b}の頬を両手で包んで、自分の方を向かせた。{a}「他の人の匂い、させたまま戻ってこないで」',
      '{a}「一人だけって、言ったよね。僕は、{b}だけって決めてたのに」――{a}の声は、震えていた。',
      '{a}は{b}をそっと押し倒した。{a}「触られたところ、全部、僕で上書きさせて」',
      '{a}は{b}の唇を、指先でなぞった。{a}「……ここ、誰に許したの？」',
      '{a}は{b}を背中から抱きしめた。{a}「返して。最初から、僕のだったでしょ」'
    ],
    polite: [
      '{a}は{b}の手首を掴んで、壁際まで引き寄せた。{a}「あなたは、私のものですよね。……違いますか」',
      '{a}は{b}の顎に指をかけ、自分の方を向かせた。{a}「他の方の匂いをさせたまま、戻ってこないでください」',
      '{a}「一人だけと、申し上げましたよね。私は、あなただけと決めていたんです」――{a}の声は、震えていた。',
      '{a}は{b}を静かに押し倒した。{a}「触れられたところ、全部、私で上書きさせていただきます」',
      '{a}は{b}の唇を、指先でなぞった。{a}「……ここは、どなたに許したんですか」',
      '{a}は{b}を背中から抱きすくめた。{a}「返してください。あなたは、最初から私のものです」'
    ]
  };
  var REPLY = {
    rough: REPLY_ROUGH,
    soft: {
      sorry: ['{b}は目を伏せた。{b}「……ごめんね。条件のためだって、自分に言い聞かせてた」', '{b}は{a}の胸に額を押しつけた。{b}「ずっと、{a}の顔ばっかり浮かんでた」'],
      defy: ['{b}は{a}を見上げた。{b}「……誰のものとか、そういうのじゃないでしょ」――けれど、{a}に唇を塞がれると、{b}はもう何も言わなかった。', '{b}「離して……っ」――言葉とは裏腹に、{b}の指は{a}の服を掴んで離さなかった。'],
      tease: ['{b}は、くすりと笑った。{b}「もしかして、妬いてくれたの？」――{a}の答えは、噛みつくような口づけだった。', '{b}は{a}の頬に手を添えた。{b}「その顔、見たかったのかも」']
    },
    polite: {
      sorry: ['{b}は目を伏せた。{b}「……申し訳ありません。条件のためだと、自分に言い聞かせていました」', '{b}は{a}の胸に額を押しつけた。{b}「ずっと、あなたのお顔ばかり浮かんでいました」'],
      defy: ['{b}は{a}を見据えた。{b}「……私は、どなたのものでもありません」――けれど、{a}に唇を塞がれると、{b}はもう何も言わなかった。', '{b}「お離しください……っ」――言葉とは裏腹に、{b}の指は{a}の服を掴んで離さなかった。'],
      tease: ['{b}は、くすりと笑った。{b}「もしかして、妬いてくださったんですか？」――{a}の答えは、噛みつくような口づけだった。', '{b}は{a}の頬に手を添えた。{b}「そのお顔が、見たかったのかもしれません」']
    }
  };
  /* 事後の一言：0番目は詰め寄った側、1番目は抱かれた側、2番目は地の文 */
  var CLAIM_AFTER = {
    rough: CLAIM_AFTER_ROUGH,
    soft: ['{a}は果てたあとも、{b}を離さなかった。{a}「……もう、他の人に触らせないで」', '{b}は息を整えながら、{a}の背中に腕を回した。{b}「……うん。{a}のだよ」', '{c}は二人から目を逸らし、壁の方を向いた。'],
    polite: ['{a}は果てたあとも、{b}を離さなかった。{a}「……もう、他の方には触れさせないでください」', '{b}は息を整えながら、{a}の背中に腕を回した。{b}「……はい。あなたのものです」', '{c}は二人から目を逸らし、壁の方を向いた。']
  };
  var CHANGE = {
    rough: CHANGE_ROUGH,
    soft: ['{a}は、{b}と{c}の重なる影を見つめていた。やがて、ふっと息を吐いた。{a}「……そっか。じゃあ、僕も好きにするね」', '{a}は「一人だけ」と言った自分が、急にばからしく思えた。', '{a}は小さく笑った。{a}「決め事なんて、最初からなかったんだね」'],
    polite: ['{a}は、{b}と{c}の重なる影を見つめていた。やがて、静かに息を吐いた。{a}「……そうですか。でしたら、私も好きにさせていただきます」', '{a}は「一人だけ」と言った自分が、急にばからしく思えた。', '{a}は小さく笑った。{a}「決め事など、最初からなかったんですね」']
  };
  var SHOW = {
    rough: SHOW_ROUGH,
    soft: ['{a}は{d}の手を取って、{b}に見える位置に座った。{a}「次は、こっちね」', '{a}は{d}の膝に乗り、{b}の目の前で唇を重ねた。', '{a}は{d}を壁に押しつけた。{b}の視線を、背中にはっきりと感じながら。'],
    polite: ['{a}は{d}の手を取って、{b}に見える位置に座った。{a}「次は、こちらで」', '{a}は{d}の膝に乗り、{b}の目の前で唇を重ねた。', '{a}は{d}を壁に押しつけた。{b}の視線を、背中にはっきりと感じながら。']
  };
  var HURT = [
    '{a}は何も言わずに、{b}に背を向けた。膝を抱えた肩が、小さく震えていた。',
    '{a}は{b}と目を合わせなかった。{b}が話しかけても、{a}は「別に」としか言わなかった。'
  ];

  A.EV.push({
    id: 'jealous_claim', cat: 'romance', scope: 'pair', pri: true,
    when: function (ctx, a, b) {
      if (HK.SAFE_ON || !hasH(ctx) || !free(a) || !free(b)) return false;
      if (!a.flags.excl || a.flags.partner !== b.i) return false;
      return seenOf(ctx, a, b) > (a.flags.jSeen || 0);
    },
    w: function () { return 5; },
    run: function (ctx, a, b) {
      var c = withWhom(ctx, a, b), seen = seenOf(ctx, a, b);
      a.flags.jSeen = seen;
      var m = function (s, d) { return ctx.t(s, a, b, c || b).replace(/\{d\}/g, d ? d.name : ''); };
      var tr = a.tr, att = R(ctx, a, b).att;
      var wClaim = tr.cp * 0.5 + tr.aggr * 0.6 + (tr.jealous || 0) * 0.6 + att / 80 + (ctx.pair(a, b).jealous || 0) * 0.1;
      var wChange = A.eager(ctx, a) * 0.9 + tr.fc * 0.4 + (1 - att / 100) * 0.4;
      var wHurt = tr.ac * 0.7 + (1 - tr.cp) * 0.2;
      var k = HK.weighted(ctx.rng, ['claim', 'change', 'hurt'], function (x) { return Math.pow(Math.max(0.05, { claim: wClaim, change: wChange, hurt: wHurt }[x]), 2); });
      var sk = seenKind(ctx, a, b), t = m(ctx.pick(sk === 'h' ? CLAIM_OPEN : KISS_OPEN)), why;
      if (k === 'claim' && HK.canLove(a, b) && HK.canLove(b, a)) {
        var rk = b.tr.ac > 0.6 || R(ctx, b, a).att > 60 ? 'sorry' : b.tr.cp > 0.6 ? 'defy' : 'tease';
        var LW = HK.RoomLewd;
        /* 受け攻めの指定に従う：{a} が受けなら、{b}（攻め）を押し倒したり、{b}の体に「上書き」したりはしない */
        var aTop = !HK.Pos || HK.Pos.topOf(a, b, [a, b]) === a, ffP = HK.Pos && HK.Pos.ff(a, b);
        t += m(ctx.pick(aTop ? CLAIM[grp(a)] : CLAIM[grp(a)].filter(function (l) { return !/押し倒/.test(l); }))) + m(ctx.pick(REPLY[grp(b)][rk]));
        t += m(ctx.pick(aTop ? CLAIM_SEX.filter(function (l) { return !(ffP || (HK.Pos && HK.Pos.isF(a) && !HK.Pos.isF(b))) || !/沈めた|深くなった/.test(l); }) : CLAIM_SEX_B)) + (LW ? LW.scene(ctx, a, b, (A.prog(ctx, a, b).act.h || 0) ? 'repeat' : 'will', { lead: true, jealous: true }) : '') + (function () { var r = ctx.rng(); return r < 0.4 ? m(CLAIM_AFTER[grp(a)][0]) : r < 0.8 ? m(CLAIM_AFTER[grp(b)][1]) : m(CLAIM_AFTER.rough[2]); })();
        var p = A.prog(ctx, a, b); p.act.h = (p.act.h || 0) + 1;
        ctx.pair(a, b).night = true;
        ctx.mod2(a, b, { att: 10, aff: 6, ten: 2 }, { att: 8, aff: 4 });
        b.flags.partner = a.i; b.flags.excl = true; b.flags.exclOpen = false; b.flags.partnerAt = ctx.stepIndex;
        a.flags.jSeen = seenOf(ctx, a, b);
        if (c && !c.out) ctx.mod(c, a, { ten: 6 });
        why = b.name + 'が' + (c ? c.name : 'ほかの人') + (sk === 'h' ? 'と抱き合う' : 'とキスする') + 'のを見た' + a.name + 'は、「一人だけ」の相手を取り戻しに行った（CP・攻撃性・嫉妬・' + b.name + 'への惹かれ ' + Math.round(att) + '）。' + b.name + 'は' + { sorry: '素直に謝った', defy: '突っぱねたが、拒まなかった', tease: 'からかって受け入れた' }[rk];
        if (A.pairDone(ctx, a, b) && A.exitPair) return A.exitPair(ctx, a, b, t, why, true);
        return { text: t, why: why, mag: 34 };
      }
      if (k === 'change') {
        a.flags.exclOpen = true; a.flags.excl = false; a.flags.partner = null;
        ctx.mod2(a, b, { ten: 8, att: -6 }, { ten: 3 });
        t += m(ctx.pick(CHANGE[grp(a)]));
        var d = ctx.present().filter(function (q) { return q !== a && q !== b && free(q) && HK.canLove(a, q) && HK.canLove(q, a); }).sort(function (x, y) { return R(ctx, a, y).att - R(ctx, a, x).att; })[0];
        if (d && ctx.rng() < 0.6) { t += m(ctx.pick(SHOW[grp(a)].filter(function (l) { return !(HK.Pos && HK.Pos.hardTop(d)) || !/押しつけ/.test(l); })), d); ctx.mod2(a, d, { att: 10 }, { att: A.eager(ctx, d) > 0.5 ? 8 : 3 }); }
        why = a.name + 'は、' + b.name + 'がほかの人と抱き合うのを見て、「一人だけ」の決め事を捨てた（積極性・FC）。三人やほかの相手との場面にも加わるようになる';
        return { text: t, why: why, mag: 24, with: d ? [d] : [] };
      }
      ctx.mod2(a, b, { ten: 10, trust: -6 }, { ten: 4 });
      ctx.stress(a, 10);
      t += m(ctx.pick(HURT));
      return { text: t, why: a.name + 'は、' + b.name + 'がほかの人と抱き合うのを見て、何も言えなかった（AC）。二人の間に溝ができた', mag: 18 };
    }
  });
})();
