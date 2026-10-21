/* 箱庭シミュレーター: 酔い方（合コン・オメガバース）
   住人ごとの「酔い方」をエゴグラムから決め、酔ったときの姿・相手への絡み方・介抱・翌朝を見せる。
   ・酔い方：甘え上戸／笑い上戸／泣き上戸／説教上戸／本音が漏れる／寝落ち／キス魔／素直になる／脱ぎ上戸／ザル（顔に出ない）
   ・酒の強さ：合コンは設定の「酒の強さ」、オメガバースは気質から
   ・相手の反応は、相手のいちばん強い因子で変わる
   {a}=酔った人 {b}=相手 */
(function () {
  'use strict';
  var HK = window.HK;
  function L(s) { return s.split('|'); }
  function hash(s) { var h = 7; for (var i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) % 9973; return h / 9973; }
  function top(c) { return HK.voiceTop ? HK.voiceTop(c) : HK.egoType(c.eg).top; }

  var TYPES = {
    amae: { label: '甘え上戸', fit: function (t) { return t.ac * 0.4 + t.np * 0.4 + t.warmth * 0.4 - t.cp * 0.2; } },
    warai: { label: '笑い上戸', fit: function (t) { return t.fc * 0.7 + t.warmth * 0.2; } },
    naki: { label: '泣き上戸', fit: function (t) { return t.ac * 0.6 + t.np * 0.3 - t.fc * 0.3; } },
    sekkyo: { label: '説教上戸', fit: function (t) { return t.cp * 0.6 + t.lead * 0.2 - t.ac * 0.2; } },
    honne: { label: '本音が漏れる', fit: function (t) { return t.a * 0.3 + t.honesty * 0.4 + t.cold * 0.2; } },
    nemu: { label: '寝落ちする', fit: function (t) { return t.caution * 0.6 + (1 - t.impulse) * 0.4 + (1 - t.fc) * 0.2; } },
    kiss: { label: 'キス魔', fit: function (t) { return t.fc * 0.4 + t.warmth * 0.3 + t.impulse * 0.2; } },
    sunao: { label: '素直になる', fit: function (t) { return t.cp * 0.45 + t.ac * 0.45 + t.cold * 0.3 - t.warmth * 0.3; } },
    nugi: { label: '脱ぎ上戸', fit: function (t) { return t.fc * 0.35 + t.impulse * 0.45; } }
  };
  var D = HK.Drunk = { TYPES: TYPES };
  /* 酔い方はその人に固定（名前で少しだけ揺らす） */
  D.type = function (c) {
    if (c.flags.dkType) return c.flags.dkType;
    var best = null, bv = -9, h = hash(c.name || ''), avg = {};
    ['a', 'cp', 'np', 'fc', 'ac', 'warmth', 'cold', 'lead', 'honesty', 'caution', 'impulse'].forEach(function (k) { avg[k] = 0.5; });
    /* 気質の平均からのずれで比べる（どの酔い方も同じくらい出るように） */
    Object.keys(TYPES).forEach(function (k, i) { var v = TYPES[k].fit(c.tr) - TYPES[k].fit(avg) + ((h * (i + 3) * 7.13) % 1) * 0.12; if (v > bv) { bv = v; best = k; } });
    return (c.flags.dkType = best);
  };
  /* 酒の強さ（1〜5） */
  D.strong = function (ctx, c) {
    if (ctx.scen.id === 'goukon' && ctx.stat) return ctx.stat(c, 'drink');
    if (c.flags.dkStr) return c.flags.dkStr;
    var v = c.tr.cold * 0.3 + c.tr.cp * 0.2 + (1 - c.tr.ac) * 0.2 + hash((c.name || '') + 'sake') * 0.3;
    return (c.flags.dkStr = v > 0.72 ? 5 : v > 0.58 ? 4 : v > 0.45 ? 3 : v > 0.33 ? 2 : 1);
  };
  D.label = function (ctx, c) { return D.strong(ctx, c) >= 5 ? 'ザル（顔に出ない）' : TYPES[D.type(c)].label; };

  /* ---------- 酔ったときの姿（ひとり） ---------- */
  var SHOW = {
    amae: L('{a}は三杯目あたりから、隣の人の袖をつまんで離さなくなった。「ねえ、もうちょっとここにいて」|{a}は頬杖をついたまま、とろんとした目で誰かの名前を呼んでいた。'),
    warai: L('{a}は箸が転がっただけで、涙を流して笑い出した。止まらなかった。|{a}は自分の言った冗談に自分で笑い、テーブルに突っ伏して肩を震わせていた。'),
    naki: L('{a}は二杯目で急に黙り込み、四杯目で「みんな優しすぎる」と泣き出した。|{a}は昔飼っていた犬の話をしながら、おしぼりで目を押さえていた。'),
    sekkyo: L('{a}は空いたグラスを置くなり、「そもそもね」と人生論を語り始めた。誰も頼んでいなかった。|{a}は後輩の生き方について、頼まれもしないのに三十分語った。'),
    honne: L('{a}は酔いが回るにつれて、普段は飲み込んでいる言葉を、するすると口にし始めた。|{a}は「正直に言うと」を五回言った。五回とも、本当に正直だった。'),
    nemu: L('{a}は二杯目の途中で、グラスを持ったまま静かに眠っていた。|{a}は会話に相づちを打ちながら、だんだん首が傾いていき、ついに壁にもたれて寝息を立てた。'),
    kiss: L('{a}は「乾杯！」のたびに、隣の人のグラスに口づけていた。グラスで済んでいるうちはよかった。|{a}は上機嫌で、手の甲にキスをして回っていた。'),
    sunao: L('いつも素っ気ない{a}が、酔うと急に「ありがとう」を連発し始めた。周りは少し怖がった。|{a}は普段の憎まれ口が嘘のように、にこにこと人の話を聞いていた。'),
    nugi: L('{a}は「暑い」と言って上着を脱ぎ、ネクタイを外し、シャツのボタンに手をかけたところで止められた。|{a}は靴下を脱いで、なぜか丁寧に畳んでテーブルに置いた。'),
    zaru: L('{a}は誰よりも飲んでいるのに、顔色ひとつ変わらなかった。追加の注文も、会計の計算も、全部{a}がやっていた。|{a}は日本酒を水のように飲み干し、「次、何にする？」と涼しい顔でメニューを開いた。')
  };
  /* ---------- 相手への絡み方 ---------- */
  var TO = {
    amae: L('{a}は{b}の肩に頭を乗せて、「{b}の隣、落ち着く」と言った。そのまま動かなかった。|{a}は{b}の腕に自分の腕を絡めて、「帰らないで」と三回言った。|{a}は{b}の手を取って、自分の頬に当てた。「つめたくて、きもちいい」'),
    warai: L('{a}は{b}の何気ない一言に笑い転げ、{b}の背中をばしばし叩いた。|{a}は{b}の顔を見るたびに思い出し笑いをして、理由を最後まで言わなかった。'),
    naki: L('{a}は{b}の手を握って、「{b}がいてくれてよかった」と泣き出した。|{a}は{b}の肩に顔をうずめて、何に泣いているのか自分でも分からないまま泣いた。'),
    sekkyo: L('{a}は{b}に「もっと自分を大事にしなさい」と、真剣な顔で一時間説教した。内容は、全部{b}を心配することだった。|{a}は{b}の箸の持ち方から生き方まで、愛情たっぷりにダメ出しをした。'),
    honne: L('{a}は{b}を見つめて、「前から思ってたけど、{b}の笑い方、好き」と言った。言ってから、自分で驚いていた。|{a}は{b}に「本当は、ずっと話したかった」とこぼした。|{a}は{b}に「{b}といると、ちょっと苦しい」と言った。それが何の告白なのか、{b}はしばらく考えた。'),
    nemu: L('{a}は{b}の肩にもたれて、すうすうと眠ってしまった。{b}は動けなくなった。|{a}は{b}の膝を枕にして寝落ちした。寝言で、{b}の名前を呼んだ。'),
    kiss: L('{a}は{b}の頬に、ちゅっと音を立ててキスをした。「あいさつ」と言い張った。|{a}は{b}の手を取って、指の一本一本にキスをしていった。{b}は耳まで赤くなった。|{a}は{b}の額にキスをして、満足そうに笑った。'),
    sunao: L('{a}は{b}の顔をまっすぐ見て、「いつもありがとう。本当は、すごく感謝してる」と言った。素面では一度も言ったことがなかった。|{a}は{b}に「……好きだよ、{b}のこと」とあっさり言った。翌日の自分が聞いたら、卒倒する台詞だった。'),
    nugi: L('{a}は脱いだ上着を{b}の肩にかけて、「似合う」と笑った。自分はシャツ一枚になっていた。|{a}がシャツのボタンに手をかけたところで、{b}が慌ててその手を押さえた。'),
    zaru: L('{a}は酔った人たちの間を回って水を配り、最後に{b}の隣に座って「お疲れ」と言った。|{a}は涼しい顔のまま、{b}のグラスにだけこっそり烏龍茶を混ぜていた。')
  };
  /* ---------- 相手の反応（相手のいちばん強い因子） ---------- */
  var RE = {
    CP: L('{b}は「飲みすぎだ」と言いながら、{a}のグラスを取り上げた。手つきは優しかった。|{b}は呆れた顔をしたが、{a}の頭を一度だけ撫でた。'),
    NP: L('{b}は「よしよし」と言って、{a}が落ち着くまで背中をさすった。|{b}は笑いながら、{a}の前に水とおしぼりを並べた。'),
    A: L('{b}は「{a}は酔うとこうなるのか」と、なぜか手帳にメモをした。|{b}は冷静に水を頼み、{a}の分の会計まで計算していた。口元だけ笑っていた。'),
    FC: L('{b}は大笑いして、こっそり動画を撮った。|{b}は「かわいいじゃん」と言って、{a}の頬をつついた。'),
    AC: L('{b}は真っ赤になって固まったまま、{a}を振りほどけなかった。|{b}はどうしていいか分からず、小さな声で「だ、大丈夫……？」と繰り返した。')
  };
  /* ---------- 介抱 ---------- */
  var CARE = L('{b}は酔いつぶれた{a}を背負って、夜道を歩いた。背中の{a}が、寝言で何か言った。|{b}は{a}をタクシーに乗せ、行き先を告げてから、迷った末に自分も乗り込んだ。|{b}はコンビニでスポーツドリンクを買ってきて、{a}の首筋に当てた。{a}は「つめたい」と笑った。|{b}は{a}を部屋まで送り、靴を脱がせ、布団をかけて、水を枕元に置いて帰った。');
  /* ---------- 翌朝 ---------- */
  var MORN = {
    forget: L('翌朝、{a}は昨夜のことを何も覚えていなかった。{b}だけが、全部覚えていた。|翌朝、{a}は「昨日、変なこと言ってなかった？」と{b}に訊いた。{b}は「別に」と答えて、目を逸らした。'),
    remember: L('翌朝、{a}は昨夜のことを全部覚えていた。{b}からの「おはよう」に、{a}は布団をかぶったまま返事ができなかった。|翌朝、{a}は{b}に「昨日のは、忘れて」と送った。既読がついたまま、返事は来なかった。')
  };
  /* ---------- オメガバース：第二性ごとの一言 ---------- */
  var OM_EX = {
    o: L('酔いのせいで抑制剤の効きが緩み、{a}の首元から甘い匂いがふわりと漏れた。|{a}は酔うと、自分の匂いがいつもより濃くなることを忘れていた。'),
    a: L('酔った{a}の匂いが少しだけ強くなり、周りのΩがそわそわし始めた。{a}は気づかずに笑っていた。|{a}は酔っても威圧だけは出さないよう、無意識に息を整えていた。'),
    b: L('{a}はαとΩの匂いが入り混じる中で、βらしく一人だけ平然と飲んでいた。')
  };
  var OM_AB = L('{b}は{a}の匂いに気づいて、自分の上着を{a}の肩にかけ、周りから隠した。|{b}は{a}の首筋に鼻先を寄せかけて、慌てて顔を背けた。「……飲みすぎだ。帰るぞ」');
  var OCC = L('週末の飲み会で、|{b}の部屋での宅飲みで、|行きつけのバーで、|誕生日祝いの席で、|花見の宴会で、|居酒屋のカウンターで、');

  function fill(ctx, t, a, b) { return ctx.t(t, a, b); }
  function react(ctx, a, b) { return fill(ctx, ctx.pick(RE[top(b)] || RE.NP), a, b); }
  function why(ctx, a) { var k = D.label(ctx, a); return a.name + 'の酔い方「' + k + '」（' + (D.strong(ctx, a) >= 5 ? '酒の強さ ' + D.strong(ctx, a) : 'エゴグラムから') + '）'; }
  function behave(ctx, a, b) {
    var k = D.strong(ctx, a) >= 5 ? 'zaru' : D.type(a);
    var att = { amae: { att: 4, aff: 3 }, warai: { aff: 3 }, naki: { aff: 4, trust: 3 }, sekkyo: { trust: 3, ten: 2 }, honne: { att: 6, trust: 3 }, nemu: { aff: 3 }, kiss: { att: 7 }, sunao: { att: 6, aff: 5 }, nugi: { att: 4 }, zaru: { trust: 5, aff: 3 } }[k];
    ctx.mod2(a, b, { att: 2, aff: 2 }, att);
    return k;
  }

  /* ---------- 合コン ---------- */
  var GK = HK.SCENARIOS && HK.SCENARIOS.goukon;
  if (GK) {
    GK.events.push({
      id: 'dk_style', cat: 'solo', scope: 'solo',
      when: function (ctx, a) { return (a.flags.drunk > 45 || ctx.stat(a, 'drink') >= 5 && ctx.stepIndex >= 2) && !a.flags.dkShown; },
      w: function (ctx, a) { return 1.2 + (a.flags.drunk || 0) / 80; }, pri: true,
      run: function (ctx, a) {
        a.flags.dkShown = true;
        var k = ctx.stat(a, 'drink') >= 5 ? 'zaru' : D.type(a);
        return { text: fill(ctx, ctx.pick(SHOW[k]), a, null), why: why(ctx, a), mag: 10 };
      }
    });
    GK.events.push({
      id: 'dk_to', cat: 'romance', scope: 'pair',
      when: function (ctx, a, b) { return a.flags.dkShown && (a.flags.drunk > 50 || ctx.stat(a, 'drink') >= 5) && (ctx.pair(a, b).dk || 0) < 2; },
      w: function (ctx, a, b) { return 0.9 + ctx.R(a, b).att / 60 + (a.flags.drunk || 0) / 100; },
      run: function (ctx, a, b) {
        var pf = ctx.pair(a, b); pf.dk = (pf.dk || 0) + 1;
        var k = behave(ctx, a, b);
        return { cat: k === 'sekkyo' ? 'bond' : k === 'zaru' ? 'help' : 'romance', text: fill(ctx, ctx.pick(TO[k]), a, b) + react(ctx, a, b), why: why(ctx, a) + '／' + b.name + 'の反応は' + top(b) + '（いちばん強い因子）', mag: 14 };
      }
    });
    GK.events.push({
      id: 'dk_care', cat: 'help', scope: 'pair',
      when: function (ctx, a, b) { return b.flags.drunk > 75 && (a.flags.drunk || 0) < 50 && !b.flags.dkCared && ctx.stepIndex >= 4; },
      w: function (ctx, a, b) { return 0.6 + a.tr.np + ctx.R(a, b).att / 60; },
      run: function (ctx, a, b) {
        b.flags.dkCared = true;
        ctx.mod2(a, b, { aff: 4, att: 3 }, { trust: 10, aff: 8, att: 5 });
        return { text: fill(ctx, ctx.pick(CARE), b, a), why: a.name + 'の面倒見（NP ' + Math.round(a.eg.NP) + '）と、' + b.name + 'の酔い（' + Math.round(b.flags.drunk) + '）', mag: 16 };
      }
    });
  }

  /* ---------- オメガバース ---------- */
  var OMS = HK.SCENARIOS && HK.SCENARIOS.omega;
  if (OMS) {
    OMS.events.push({
      id: 'om_drink', cat: 'romance', scope: 'pair',
      when: function (ctx, a, b) { var pf = ctx.pair(a, b); var mk = a.i < b.i ? a.i + '-' + b.i : b.i + '-' + a.i; return ctx.om && ctx.om.met && (ctx.om.met[mk] || ctx.R(a, b).aff > 5 || pf.couple) && (pf.dkAt == null || ctx.stepIndex - pf.dkAt >= 4); },
      w: function (ctx, a, b) { return 0.35 + a.tr.fc * 0.3 + ctx.R(a, b).aff / 150 + (ctx.pair(a, b).couple ? 0.2 : 0); },
      run: function (ctx, a, b) {
        var pf = ctx.pair(a, b); pf.dkAt = ctx.stepIndex;
        var k = behave(ctx, a, b), sx = a.om && a.om.sex;
        var t = fill(ctx, ctx.pick(OCC), a, b) + fill(ctx, ctx.pick(SHOW[k]), a, b) + fill(ctx, ctx.pick(TO[k]), a, b);
        if (sx && OM_EX[sx] && (sx !== 'b' || k === 'zaru') && ctx.rng() < 0.5) {
          t += fill(ctx, ctx.pick(OM_EX[sx]), a, b);
          if (sx === 'o' && b.om && b.om.sex === 'a') { t += fill(ctx, ctx.pick(OM_AB), a, b); ctx.mod2(a, b, { trust: 4 }, { att: 5 }); }
        }
        t += react(ctx, a, b);
        if (k !== 'zaru' && D.strong(ctx, b) >= 3 && ctx.rng() < 0.45) { t += fill(ctx, ctx.pick(CARE), a, b); ctx.mod(a, b, { trust: 6, aff: 4 }); }
        pf.dkMorning = ctx.stepIndex;
        return { cat: k === 'sekkyo' ? 'bond' : 'romance', text: t, why: why(ctx, a) + '／' + b.name + 'の反応は' + top(b) + '（いちばん強い因子）', mag: 16 };
      }
    });
    OMS.events.push({
      id: 'om_drink_morning', cat: 'romance', scope: 'pair',
      when: function (ctx, a, b) { var pf = ctx.pair(a, b); return pf.dkMorning != null && ctx.stepIndex - pf.dkMorning === 1; },
      w: function () { return 1.5; },
      run: function (ctx, a, b) {
        var pf = ctx.pair(a, b); pf.dkMorning = null;
        var drunkOne = D.strong(ctx, a) <= D.strong(ctx, b) ? a : b, other = drunkOne === a ? b : a;
        var rem = drunkOne.tr.a + drunkOne.tr.caution > 1 ? 'remember' : 'forget';
        return { text: fill(ctx, ctx.pick(MORN[rem]), drunkOne, other), why: drunkOne.name + 'の翌朝（' + (rem === 'remember' ? '覚えている：A・慎重さが高い' : '覚えていない') + '）', mag: 6 };
      }
    });
  }
})();
