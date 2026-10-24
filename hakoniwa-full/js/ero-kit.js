/* 箱庭シミュレーター: 描写の作風「男性向け（エロエロ）」の共通部品（R18版の催眠・サキュバス・現実改変・感覚遮断穴）
   ■ 箱庭の設定に HK.Ero.OPT（描写の作風：小説調／男性向け）を足すと、S.env.style が 'ero' のときだけ、
     各箱庭の solo-*-ero.js に書いた男性向けの文（擬音・♡喘ぎ・淫語・おねだり・堕ち）に差し替わる。小説調の文はそのまま残る
   ■ 使い方：HK.Ero.add('saimin', { 'sug.kuwaeru.full': [...], ... }) で登録し、
     本文では HK.Ero.L(S, 'saimin', 'sug.kuwaeru.full', 元の配列) で引く（作風が小説調、または未登録なら元の配列）
   ■ 喘ぎ（HK.Ero.moan）：段階 0 こらえる（声を抑える）／1 とろける（懇願）／2 崩れる（快楽堕ち）。言葉が崩れるのは絶頂（段階 2）だけ。
     口調ごとの喘ぎは ero-moan-tone.js。キャラの設定「濁点喘ぎ」がオンの人は、絶頂・奥を深く突かれた場面・強引に抱かれる場面・場面の後半・快楽堕ち中に濁点喘ぎ（あ゛・お゛）になる。
     態度（persona）ごとに崩れ方が違う（強気・厳格は最後まで噛み殺そうとする、内気は最初から甘い）
   ■ 全年齢版（HK.SAFE_ON）では常に小説調。登場人物はすべて成人として扱う */
(function () {
  'use strict';
  var HK = window.HK;
  if (!HK) return;
  function L(s) { return s.split('|'); }
  var T = {};
  var E = HK.Ero = {
    OPT: { id: 'style', label: '描写の作風', type: 'select', def: 'novel', options: [{ v: 'novel', label: '小説調' }, { v: 'ero', label: '男性向け（擬音・♡喘ぎ・おねだり）' }] },
    on: function (S) {
      if (HK.SAFE_ON || !(S && S.env && S.env.style === 'ero')) return false;
      /* 描写の有無が「ほのめかす」なら使わない（lewd-unify.js） */
      var X = HK.Lewd, id = S.scen && S.scen.id;
      return !(X && id && X.conf(id) && X.lv(S.env) === 'low');
    },
    add: function (scen, tbl) { var o = T[scen] = T[scen] || {}; Object.keys(tbl).forEach(function (k) { o[k] = (o[k] || []).concat(tbl[k]); }); },
    has: function (scen, key) { return !!(T[scen] && T[scen][key] && T[scen][key].length); },
    L: function (S, scen, key, base) { return E.on(S) && E.has(scen, key) ? T[scen][key] : base; },
    T: T
  };

  /* 嗜虐的な攻め：この判定が通るとき、山場で激しく腰を打ち付ける・ちょっと乱暴に振る舞う（髪を掴む・押し倒す）。
     両手首を押さえつけるのは可。首を押さえるのは「嫉妬エッチ」（嫉妬・独占欲がきっかけの行為）のときだけ。縛る拘束はしない（小説調・男性向けとも）。
     攻め側の CP が高く、衝動性・攻撃性が高い（または A が低い）人。受ける側が攻め指定（hardTop）なら使わない。
     使う側は確率を絞る（山場の 2〜3 割程度） */
  E.sadist = function (top, bot) {
    if (!top) return false;
    if (bot && HK.Pos && HK.Pos.hardTop && HK.Pos.hardTop(bot)) return false;
    var eg = top.eg || {}, tr = top.tr || {};
    var cp = eg.CP != null ? eg.CP / 20 : (tr.cp || 0), aggr = tr.aggr != null ? tr.aggr : (eg.FC != null ? eg.FC / 20 : 0), a = eg.A != null ? eg.A / 20 : (tr.a || 0.5);
    return cp >= 0.65 && (aggr >= 0.55 || a <= 0.35);
  };
  /* 擬音（{s} で本文に差し込む） */
  E.SFX = {
    wet: L('ぐちゅ、ぐちゅっ|くちゅ、くちゅ……|ぬちゅ、ぬちゅっ|じゅぷ、じゅぷっ|ちゅぷ……っ'),
    hit: L('ぱんっ、ぱんっ、ぱんっ|ばちゅっ、ばちゅんっ|どちゅ、どちゅっ|ぱちゅん、ぱちゅんっ|ずちゅっ、ずちゅっ|ぱんっ、ぱちゅっ、ぱんっ'),
    cum: L('どぷっ、どぷどぷっ|びゅるっ、びゅくっ|びゅーっ、びゅるるっ|どくん、どくっ|びゅくっ、びゅくびゅくっ|どぷ、どぷっ……'),
    suck: L('じゅるっ、じゅぽ、じゅぽっ|ちゅぱ、ちゅぱっ|じゅぞっ、じゅるる……|んぐ、んぶっ|ちゅるっ、ちゅぷ……|じゅぷ、じゅるるっ')
  };
  E.sfx = function (S, kind) { var l = E.SFX[kind] || E.SFX.wet; return l[S.rng.int(l.length)]; };

  /* 喘ぎ：態度 × 段階（0 こらえる／1 とろける／2 崩れる）。台詞の中身だけ（「」なし） */
  var M = {
    proud: [L('く……っ、ふ、ざけ……っ|っ……！　こんな、ので……っ|ぐ、ぅ……っ、誰が……感じる、か……っ'), L('っ、あ……♡　くそ、なんで……っ、♡|ふ、ぅ……っ♡　や、め……っ♡|そこ、ばっか……っ、ぁ♡'), L('お゛っ……♡　イ、く……っ、イっ……♡♡|あ゛、あぁっ♡　だめ、だ、これ……っ♡♡|ひ、ぐ……っ♡　とま、んな……♡♡')],
    stern: [L('……っ、ふ……。……耐え、る……|……く、ぅ……。まだ、だ……|っ……この程度、で……'), L('ん、ぁ……♡　……っ、声、が……|は、ぁ……っ♡　いけない、のに……|……っ♡　そこは、……っ'), L('あ゛……っ♡　も、う……むり、だ……♡♡|ぉ、ぁ……♡　あたま、が……♡♡|ひ……っ♡　イ、く……っ♡♡')],
    tsun: [L('ちょ、っ……！　感じて、ないし……っ|べ、別に……っ、こんなの……っ|ばか……っ、やめ……っ'), L('ん、ぁっ♡　ち、違う、から……っ♡|ひゃ、ぅ……♡　そこ、ずる……っ♡|や、ぁ……♡　見ないで、よ……っ'), L('あ、あぁっ♡♡　イっちゃ、う……っ♡♡|ひぅっ♡　すき、そこ、すき……っ♡♡|も、むり……っ♡　ばか、ぁ……♡♡')],
    gentle: [L('ん……っ、あら……そんな、に……|ふ、ぁ……。ゆっくり、ね……？|あ……っ、だめよ……そこ……'), L('あ、ん……♡　きもち、いい……♡|ふぁ……♡　もっと、して……♡|そこ……っ♡　じょうず、ね……♡'), L('あっ、あぁっ♡♡　イく、イっちゃう……♡♡|すき、すきぃ……♡♡　とけちゃう……♡|ぁ……っ♡　あたま、真っ白……♡♡')],
    devoted: [L('ぁ……っ、す、すみません……声が……|ん、ん……っ、がまん、します……|は、ぁ……っ、だい、じょうぶ、です……'), L('あ、ぁ……♡　きもち、いい、です……♡|ん、ぅ……♡　もっと、ください……♡|ひぁ……♡　そこ、だめ、です……♡'), L('あぁっ♡♡　イきます、イっちゃいます……っ♡♡|ひ、ぅ……っ♡　とまんな……♡♡|ぁ、あ……♡　しあわせ、です……♡♡')],
    cool: [L('……っ。想定、外……だな|……く。呼吸、が……|っ……落ち着け、ただの……刺激、だ'), L('ん、ぁ……♡　……おかしい、数値、が……|は……っ♡　思考、が……まとまら、な……|……っ♡　これ、は……っ'), L('ぁ゛……っ♡♡　考え、られ……な……♡|イ、く……っ♡　だめ、だ、とまら……♡♡|ひ、ぁ……♡　なにも、わから、な……♡♡')],
    free: [L('ちょ、まって、くすぐった……っ、あはっ|ひゃっ！？　え、えっ、なにこれ……っ|ん、ぁっ……ちょっと、いきなり……っ'), L('あっ♡　それ、いい……っ♡　もっと♡|ん、ぁ♡　きもちいい、きもちいい……っ♡|や、ばっ♡　これ、やばい……っ♡'), L('イくっ♡♡　イっちゃう、イっちゃうぅ……っ♡♡|あ゛っ♡　すご、すごいぃ……♡♡|も、わけ、わかんな……っ♡♡')],
    shy: [L('ひ、ぁ……っ、み、見ないで……っ|ぁ……っ、こえ、でちゃ……|ん、っ……こ、こえ……っ'), L('ふぁ……♡　は、はずかし……っ♡|ん、ぅ……♡　へんな、こえ……♡|あ、ぁ……♡　そこ、やぁ……♡'), L('ひぁっ♡♡　イ、イっちゃ……っ♡♡|も、むり、です……っ♡♡　とけちゃう……♡|ぁ、あ……♡　あたま、ふわふわ……♡♡')],
    polite: [L('……っ、失礼、いたしました……声が……|ん……っ、お、お控え、ください……|は、ぁ……っ、だ、大丈夫で、ございます……'), L('あ、ぁ……♡　そ、そこは……っ♡|ん、ふ……♡　はしたない、声が……♡|ぁ……♡　お、おかしく、なって……♡'), L('あぁっ♡♡　い、イってしまいます……っ♡♡|も、申し訳、ござ……っ♡♡　とまりませ……♡|ぁ……♡　なにも、かんがえられ……♡♡')]
  };
  /* 言い回しを足す（同じ人の喘ぎが一回の結果の中でかぶらないように） */
  var MORE = {
    proud: [L('っ、く……！　調子に、乗んな……っ|ふ、ぅ……っ。こんなもん、で……|……っ、くそ、どこ、触って……'), L('ぁ、っ♡　ちが、今のは……っ♡|く、ぅ……♡　そこ、ばか、やめ……っ♡|はっ、ぁ……♡　なんで、こんな……っ♡'), L('ぉ゛……っ♡♡　くそ、イ、っ……♡♡|あ゛ぁっ♡　だめだ、くる、きちゃ……っ♡♡|ひぐ、っ♡♡　イってる、から……っ♡')],
    stern: [L('……っ。声は、出さん……|ふ……。まだ、平気だ……|……っ、く。集中、しろ……'), L('……ぁ、っ♡　律せ、な……っ|ん……っ♡　ふ、不覚……っ♡|は、ぁ……♡　このような、こと……っ♡'), L('ぉ、っ……♡♡　だめ、だ……っ、イ……♡♡|あ゛……♡　何も、考え、られん……♡♡|く、ぁ……っ♡♡　果て、る……っ♡')],
    tsun: [L('な、なによ……っ、別に……っ|ちょっと、そこ、反則……っ|ん、っ……！　いまの、なし……っ'), L('ふぁ……♡　ば、ばかぁ……っ♡|や、っ♡　そこ、ばっかり……っ♡|ん、ぁ♡　き、気持ちよくなんか……っ♡'), L('ひぁっ♡♡　イく、イっちゃ……♡♡|も、むり、ばかぁ……っ♡♡|ぁ゛っ♡　すき、すきぃ……っ♡♡')],
    gentle: [L('ん……っ、ふふ、くすぐったい……|ぁ……っ、そんな、急に……|は、ぁ……。待って、まだ……'), L('ん、ぁ……♡　そこ、好き……♡|ぁ……♡　あったかい……♡|ふ、ぅ……♡　もう少し、奥……♡'), L('あぁっ♡♡　いっしょに、イこ……っ♡♡|ん、ぁあっ♡　とまらない……っ♡♡|ぁ……♡　しあわせ……♡♡')],
    devoted: [L('……っ、ご、ごめんなさい……声……|ん、ぅ……。が、がまん……|ぁ、っ……。大丈夫、です、から……'), L('ふぁ……♡　うれし、い……です……♡|ぁ、ん……♡　そこ、すき、です……♡|は、ぁ……♡　もっと、ほしい、です……♡'), L('ひぁっ♡♡　イっちゃいます……っ♡♡|ぁ、あぁっ♡　もう、だめ、です……♡♡|ん、ぅ……♡♡　なか、いっぱい……♡')],
    cool: [L('……っ。反応、が……早い、な……|……ふ。分析、する、余裕は……|っ……今のは、計算、外……'), L('……っ♡　数え、られな……っ|ぁ……♡　予測、が……外れ……っ♡|ん……♡　そこ、は……っ、反則、だ……♡'), L('ひ、ぁ゛……っ♡♡　頭、が……白く……♡|イ……っ、く……♡♡　止まら、ない……っ|ぉ……っ♡♡　理屈、じゃ、ない……♡')],
    free: [L('ちょっ、くすぐったいって……っ、んっ|わ、わっ、なにそれ……っ！|あはっ、ちょ、そこ……っ'), L('ん、ぁ♡　それ、すき……っ♡|ひゃ、ぁ♡　もっと、もっと……っ♡|あっ♡　だめ、気持ちいい……っ♡'), L('イくイくっ♡♡　イっちゃうぅっ♡♡|あ゛っ♡　またイく、またぁ……っ♡♡|ひぁっ♡♡　とまんないぃ……っ♡')],
    shy: [L('ぁ、の……っ、こえ、が……|ひ、っ……こ、こえ、が……|み、見ない、で……くださ……っ'), L('ん、ぅ……♡　ど、どうしよ……♡|ふぁ……♡　そこ、へん……っ♡|ぁ……♡　はずかしい、のに……っ♡'), L('ひぁ、ぁっ♡♡　イっちゃ、う……♡♡|ん、ぅうっ♡♡　とまらな……っ♡|ぁ……♡♡　なにも、わかんな……♡')],
    polite: [L('……っ、し、失礼……|ん……っ。お、お見苦しいところを……|は……っ。どうか、お手柔らかに……'), L('ぁ……♡　そ、そのように、されては……っ♡|ん、ぅ……♡　お、おやめ……くださ……♡|は、ぁ……♡　お、お恥ずかしい……♡'), L('あぁっ♡♡　もう、達して、しまいます……っ♡♡|ひ、ぁ……♡♡　とまりません……っ|ぁ゛……♡　お許し、くださ……っ♡♡')]
  };
  Object.keys(MORE).forEach(function (k) { if (M[k]) for (var i = 0; i < 3; i++) M[k][i] = M[k][i].concat(MORE[k][i]); });
  /* 主導権を握っている側の喘ぎ（拒む言葉を使わない）。荒い気質／やわらかい気質 */
  var DOM = {
    rough: [L('ふ、ん……っ。悪くない|は……っ、ほら、もっと奥だ|……っ、そうだ、そのまま締めてろ|ふ……っ。いい顔だ|……は、っ。まだ、これからだ'), L('っ、ぁ……♡　いい、ぞ……っ|く、ぅ……♡　お前の、いいとこ……当たってる……|は、ぁ……♡　まだ、出すなよ……っ|く、ぁ……♡　たまんねえ……っ|は……っ♡　ほら、全部見せろ……')],
    soft: [L('ん……っ、ふふ、いい子……|は、ぁ……。ほら、ちゃんと見てて|ん……っ、まだ、だめ。我慢して|ん……っ、ふふ、上手……|は、ぁ……。もっと、見せて'), L('ぁ……♡　すごい、奥まで……♡|ん、ぁ……♡　ほら、もっとちょうだい……♡|は、ぁ……♡　かわいい顔、してる……♡|ぁ……♡　すごい、気持ちいい……♡|ん、ふ……♡　かわいい、もっと……♡')]
  };
  var ROUGH = { proud: 1, stern: 1, cool: 1, tsun: 1 };
  E.MOAN = M; E.DOM = DOM;
  /* 一回の結果の中では、同じ喘ぎをなるべく繰り返さない */
  /* 使い切ったら、いちばん前に使ったものから戻す（直前に使った文はすぐには戻らない） */
  function pickFresh(S, list, tag) {
    var seen = S._eroSeen = S._eroSeen || {}, used = seen[tag] = seen[tag] || [];
    var free = list.filter(function (x) { return used.indexOf(x) < 0; });
    if (!free.length) {
      /* used は古い順。候補の中で使ったのがいちばん古い半分から選ぶ */
      var old = list.slice().sort(function (a, b) { return used.indexOf(a) - used.indexOf(b); });
      free = old.slice(0, Math.max(1, Math.ceil(old.length / 2)));
    }
    var x = free[S.rng.int(free.length)];
    var i = used.indexOf(x); if (i >= 0) used.splice(i, 1);
    used.push(x);
    return x;
  }
  /* 一回の結果の中で同じ文を繰り返さない選び方（喘ぎ以外の地の文・反応・事後にも使う）。
     S … その回のもの（箱庭の ctx・物語型の S・rng のどれでも。中の rng に覚える）、base … 元の選び方（ctx.pick など。候補を絞ってから渡す）。
     まだ使っていない文から選び、使い切ったら、いちばん前に使ったものから戻す */
  E.fresh = function (S, arr, base) {
    if (!arr || !arr.length) return base ? base(arr) : undefined;
    var own = (S && S.rng) || S, rng = own && own.int ? own : S && S.rng;
    if (!own || arr.length < 2) return base ? base(arr) : arr[0];
    var st = own._fresh || (own._fresh = { n: 0, m: {} }), m = st.m;
    var key = function (x) { return typeof x === 'string' ? x : x && typeof x.t === 'string' ? x.t : null; };
    var best = Infinity, sub = [];
    arr.forEach(function (x) {
      var k = key(x), v = k == null ? -1 : m[k] == null ? -1 : m[k];
      if (v < best) { best = v; sub = [x]; } else if (v === best) sub.push(x);
    });
    var t = base ? base(sub) : sub[rng && rng.int ? rng.int(sub.length) : Math.floor(Math.random() * sub.length)];
    var k = key(t); if (k != null) m[k] = ++st.n;
    return t;
  };
  /* その回で、二人が体を重ねた回数（反応の段階を後戻りさせないため）。peek なら数えずに今の回数を返す。
     一度身を委ねた人が、次の場面でまた最初の抵抗からやり直さないよう、二度目以降の反応を選ぶのに使う */
  E.pairNight = function (S, a, b, peek) {
    var own = (S && S.rng) || S;
    if (!own || !a || !b) return 1;
    var m = own._pairN || (own._pairN = {}), k = [a.name, b.name].sort().join('\u0001');
    if (!peek) m[k] = (m[k] || 0) + 1;
    return m[k] || 1;
  };
  /* 元の選び方 base（pick(arr) の形）を、繰り返さない選び方に包む */
  E.freshPick = function (S, base) {
    if (base && base._fresh) return base;
    var f = function (arr) { return E.fresh(S, arr, base); };
    f._fresh = true;
    return f;
  };
  /* 口調ごとの喘ぎ（ero-moan-tone.js の E.TONE_MOAN[口調] = { s0 声を抑える, s1 懇願, s2 快楽堕ち, daku 濁点喘ぎ }）。
     9つの態度の口調は、上の態度の喘ぎに足して使う。それ以外の口調は、その口調の喘ぎだけを使う（なければ態度の喘ぎ） */
  E.TONE_MOAN = E.TONE_MOAN || {};
  /* 濁点喘ぎ：キャラの設定「濁点喘ぎ」（input.chars[i].daku）がオンの人だけ使う。
     絶頂（段階 2）、奥を深く突かれた場面・強引に抱かれている場面・場面の後半（本文の後ろ半分、またはこの回で何度も喘いだあと）・快楽堕ち中（段階 1）、
     快楽堕ち中と強引な場面はこらえる段階（段階 0）でもときどき。
     箱庭ごとに人物の作り方が違うので、名前で引けるように、シミュレーションの入力から覚えておく */
  var DAKU = {};
  E.dakuOf = function (who) { return !!(who && (who.daku || DAKU[who.name])); };
  if (HK.simulate && !HK.simulate._daku) {
    var sim0 = HK.simulate;
    HK.simulate = function (input) {
      DAKU = {};
      ((input && input.chars) || []).forEach(function (c) { if (c && c.daku && c.name) DAKU[c.name] = true; });
      return sim0.apply(this, arguments);
    };
    HK.simulate._daku = true;
  }
  E.DEEP = /奥|深く|深い|突き上げ|突き入|最奥|根元まで|一番深|子宮|結腸/;
  E.FORCE = /無理やり|無理矢理|強引|乱暴|押さえつけ|押さえ込|組み敷|ねじ伏せ|髪を掴|手首を(?:掴|ひとまとめ|まとめて)|逃がさ|逃げ(?:られ|よう)|抵抗|容赦なく|休みなく|有無を言わさ|力ずく|拘束/;
  /* 快楽堕ち中：堕ちた（fallen・fell）か、堕ち度が 75 以上 */
  function fallenOf(who) { return !!(who && (who.fallen || who.fell || (who.corrupt || 0) >= 75)); }
  /* この回でその人が喘いだ回数（後半かどうかの目安） */
  function moanCount(S, who) { var m = S._eroCnt = S._eroCnt || {}, k = (who && who.name) || '?'; return (m[k] = (m[k] || 0) + 1); }
  /* 本文 t の at 文字目に入る喘ぎの場面：奥を深く突く（deep）・強引（force）・本文の後ろ半分（late） */
  E.ctxOf = function (t, at) { t = String(t); return { deep: E.DEEP.test(t), force: E.FORCE.test(t), late: at != null && t.length > 120 && at > t.length / 2 }; };
  /* ctx … true（奥を深く突かれた場面）、または { deep, force, late } */
  E.moan = function (S, who, stage, ctx) {
    var cx = ctx && typeof ctx === 'object' ? ctx : { deep: !!ctx };
    var ps = (who && (HK.personaOf ? HK.personaOf(who) : who.persona)) || 'gentle';
    var st = Math.max(0, Math.min(2, stage | 0));
    /* 主導権を握っている側（who.eroDom）：こらえる・とろける段階は、拒まない喘ぎ */
    if (who && who.eroDom && st < 2) { var dk = ROUGH[ps] ? 'rough' : 'soft'; return pickFresh(S, DOM[dk][st], 'dom.' + dk + st); }
    var tone = who && HK.toneOf ? HK.toneOf(who) : ps, TM = E.TONE_MOAN[tone];
    if (TM && TM.daku && TM.daku.length && !(who && who.eroDom) && E.dakuOf(who)) {
      var fal = fallenOf(who), late = cx.late || moanCount(S, who) > 6;
      var p = st === 2 ? 0.8 : st === 1 ? (cx.deep || cx.force || late || fal ? 0.6 : 0) : (fal || cx.force ? 0.35 : 0);
      if (p && S.rng() < p) return pickFresh(S, TM.daku, tone + '.daku');
    }
    /* 濁点喘ぎの設定がオフの人には、態度の喘ぎのうち濁点のもの（お゛ など）も使わない */
    var dk = E.dakuOf(who), noDaku = function (l) { if (dk) return l; var f = l.filter(function (x) { return !/[゛ﾞ]/.test(x); }); return f.length ? f : l; };
    var own = TM && TM['s' + st] && TM['s' + st].length ? TM['s' + st] : null;
    if (own) return pickFresh(S, noDaku(M[tone] ? M[tone][st].concat(own) : own), tone + '.t' + st);
    var tbl = M[ps] || M.gentle;
    return pickFresh(S, noDaku(tbl[st]), ps + st);
  };
  /* 本文の {s:wet} {s:hit} {s:cum} {s:suck} {m0} {m1} {m2}（{a} の喘ぎ）を埋める。ほかの差し込み（{a} {h} など）は各箱庭の ST.fmt で。
     本文が奥を深く突く場面・強引な場面、本文の後ろ半分なら、とろける段階でも濁点喘ぎを使う（設定がオンの人だけ） */
  E.fill = function (S, text, who) {
    var t = String(text);
    return t.replace(/\{s:(\w+)\}/g, function (m, k) { return E.sfx(S, k); })
      .replace(/\{m([012])\}/g, function (m, n, at, all) { return E.moan(S, who, +n, E.ctxOf(all, at)); });
  };
})();
