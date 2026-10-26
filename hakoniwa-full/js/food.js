/* 箱庭シミュレーター: 住人の食べ物の好み（好きな食べ物・嫌いな食べ物・好きな味）を場面に混ぜる共通の部品（HK.Food。全年齢版・R18版共通。attr.js の直後に読む）
   ・欄は attr.js（foodLike・foodHate・taste）。実行時の住人には配列で写る（HK.Attr.copy）
   ・HK.Food.like(c)／hate(c)／taste(c)：その人の好物・苦手な食べ物・好きな味（配列。なければ空）。has(c)：どれか一つでも決めているか。any(list)
   ・cook(ctx, who, dish, q)：料理の味を決める → { dish, taste }。味は作る人の好きな味に寄るが、乱数で外れる
   ・react(ctx, c, taste, dish, o)：食べた人の反応 → { v: 'good'|'meh'|'bad', text, why }。好きな味・好物なら喜び、苦手な味（好きな味の反対）・嫌いな食べ物なら顔をしかめる。
     何も決めていない人は気質から。文は「うまい／ふつう／まずい」×態度9種（HK.personaOf）で3文以上ずつ
   ・talk(ctx, a, b)：好物を会話に差し込む一句（相手の好物を覚えている・差し入れる・取り分ける、苦手を引き取る。相手が決めていなければ自分の好物）
   ・hateScene(ctx, a, b, item)：{a} が嫌いな食べ物を {b} に出された場面（隠して食べる／正直に言う。態度9種）
   ・meal(ctx, cook, eater, dish, o)：作った人と食べた人の一場面（味の一文＋反応＋作った人の受け止め）。関係値に少し効く
     （うまい→食べた人の好意＋、まずい→強気・意地っ張り・奔放はからかい、ほかは気遣い）
   ・daily(ctx, kind, a, b, c)：日常キット（daily-kit.js）の食事・買い出し・鍋・差し入れの出来事に足す一文
   ・ctx は箱庭の ctx（ctx.rng）でも、物語型の S（S.rng）でもよい。関係値・気分は ctx.mod があるときだけ動かす
   ・決まり：好みを決めた人が場面にいないときは、乱数を一つも使わない（決めていない人の結果は今までと変わらない）
   ・登場人物はすべて成人として扱う */
(function () {
  'use strict';
  var HK = window.HK;
  if (!HK) return;
  function L(s) { return s.split('|'); }
  var F = HK.Food = {};
  var A = HK.Attr || {};
  F.TASTES = A.TASTES || ['甘い', 'しょっぱい', '辛い', '酸っぱい', '苦い', 'あっさり', 'こってり'];
  /* 名詞の前に置く形（{taste}）：甘い味付け・あっさりした味付け */
  var TN = { '甘い': '甘い', 'しょっぱい': 'しょっぱい', '辛い': '辛い', '酸っぱい': '酸っぱい', '苦い': 'ほろ苦い', 'あっさり': 'あっさりした', 'こってり': 'こってりした' };
  /* 好きな味の反対（苦手な味とみなす。好きな味に入っていれば苦手にしない） */
  var OPP = { '甘い': ['苦い', '酸っぱい'], 'しょっぱい': ['甘い'], '辛い': ['甘い'], '酸っぱい': ['こってり'], '苦い': ['甘い'], 'あっさり': ['こってり'], 'こってり': ['あっさり'] };
  var P9 = ['proud', 'stern', 'tsun', 'gentle', 'devoted', 'cool', 'free', 'shy', 'polite'];
  var TEASE = { proud: 1, tsun: 1, free: 1 };
  var HONEST = { proud: 1, stern: 1, cool: 1, free: 1 };

  function arr(v) { return A.foodWords ? A.foodWords(v) : Array.isArray(v) ? v.slice(0, 5) : []; }
  F.like = function (c) { return c ? arr(c.foodLike) : []; };
  F.hate = function (c) { return c ? arr(c.foodHate) : []; };
  F.taste = function (c) { return c && A.tasteList ? A.tasteList(c.taste) : []; };
  F.has = function (c) { return !!c && (F.like(c).length > 0 || F.hate(c).length > 0 || F.taste(c).length > 0); };
  F.any = function (list) { return (list || []).some(function (c) { return c && F.has(c); }); };
  F.badTastes = function (c) {
    var t = F.taste(c), out = [];
    t.forEach(function (x) { (OPP[x] || []).forEach(function (y) { if (t.indexOf(y) < 0 && out.indexOf(y) < 0) out.push(y); }); });
    return out;
  };
  F.tasteWord = function (t) { return TN[t] || t || ''; };
  function persona(c) { var p = c && HK.personaOf ? HK.personaOf(c) : 'gentle'; return P9.indexOf(p) >= 0 ? p : 'gentle'; }
  F.persona = persona;

  /* ---------- 乱数と文の組み立て ---------- */
  function rnd(x) { return typeof x === 'function' ? x : x && x.rng; }
  function pick(x, list) { return list[Math.floor(rnd(x)() * list.length)]; }
  /* 同じ回の中で、同じ文をできるだけ繰り返さない */
  function fresh(x, list) {
    var U = x._foodUsed = x._foodUsed || {}, f = list.filter(function (t) { return !U[t]; });
    var t = pick(x, f.length ? f : list); U[t] = 1; return t;
  }
  function fill(t, v) {
    return t.replace(/\{(a|b|c|dish|taste|like|hate)\}/g, function (m, k) {
      var o = v[k];
      if (k === 'a' || k === 'b' || k === 'c') return o && o.name ? o.name : '';
      return o == null ? '' : String(o);
    });
  }
  function hit(dish, words) {
    if (!dish) return '';
    for (var i = 0; i < words.length; i++) if (words[i] && (dish.indexOf(words[i]) >= 0 || words[i].indexOf(dish) >= 0)) return words[i];
    return '';
  }
  function mod(ctx, a, b, d) { if (ctx && typeof ctx.mod === 'function' && ctx.R && a && b && a !== b) ctx.mod(a, b, d); }
  function joy(ctx, c, d) { if (ctx && ctx.R && HK.Emo && HK.Emo.bump && c) HK.Emo.bump(ctx, c, d); }
  function tr(c, k) { return c && c.tr && typeof c.tr[k] === 'number' ? c.tr[k] : 0.5; }

  /* ---------- 料理の味 ---------- */
  var DISH = {
    home: L('肉じゃが|カレー|オムライス|生姜焼き|親子丼|焼き魚の定食|野菜炒め|味噌汁とおにぎり'),
    morning: L('トースト|目玉焼き|焼き鮭の朝ごはん|フレンチトースト|卵焼き|おにぎりと味噌汁'),
    cafe: L('パスタ|オムライス|サンドイッチ|ケーキ|グラタン|パンケーキ'),
    famires: L('ハンバーグ|ドリア|山盛りのポテト|パフェ|唐揚げ|ナポリタン'),
    school: L('焼きそばパン|唐揚げ弁当|購買のおにぎり|日替わりの定食'),
    island: L('魚の塩焼き|貝のスープ|焼いた芋|木の実の和え物'),
    room: L('差し入れの弁当|サンドイッチ|レトルトのカレー'),
    trip: L('旅館の会席|地元の名物料理|焼きそば|浜焼き'),
    nabe: L('寄せ鍋|キムチ鍋|すき焼き|水炊き|もつ鍋'),
    feast: L('山菜の煮しめ|川魚の甘露煮|猪鍋|里芋の煮っころがし|赤飯'),
    ship: L('配給のペースト食|乾燥野菜のスープ|合成肉のステーキ|宇宙食のカレー')
  };
  F.DISH = DISH;
  F.dishFor = function (ctx, eater, kind) {
    var lk = F.like(eater);
    if (lk.length && rnd(ctx)() < 0.45) return pick(ctx, lk);
    return pick(ctx, DISH[kind] || DISH.home);
  };
  F.cook = function (ctx, who, dish, q) {
    var t = F.taste(who), r = rnd(ctx)();
    var taste = t.length && r < 0.6 ? pick(ctx, t) : pick(ctx, F.TASTES);
    return { dish: dish || pick(ctx, DISH.home), taste: taste, q: q };
  };

  /* ---------- 食べた人の反応（v：good うまい／meh ふつう／bad まずい）× 態度9種 ---------- */
  var REACT = {
    good: {
      proud: L('{a}は{dish}をひと口食べて、しばらく黙った。{a}「……悪くない。いや、うまい」|{a}は無言で{dish}を平らげ、空になった器を突き出した。おかわりの合図だった。|{a}「{taste}味付けか。……こういうのでいいんだよ」――ぶっきらぼうな声の割に、箸は止まらなかった。'),
      stern: L('{a}は背筋を伸ばしたまま{dish}を味わい、短く頷いた。{a}「うまい。手間をかけたのが分かる」|{a}は一口ごとに箸を置き、丁寧に{dish}を味わった。最後に「見事だ」とだけ言った。|{a}「{taste}味付けは、好みだ」――めったに褒めない{a}の一言に、場の空気が少し和らいだ。'),
      tsun: L('{a}「べ、別に、うまいとか思ってないし」――そう言いながら、{a}の{dish}はいちばん先になくなった。|{a}は{dish}をひと口食べて、ぷいと顔を背けた。耳まで赤かった。{a}「……まあまあ、だし」|{a}「……{taste}の、嫌いじゃない」――{a}はそれだけ言って、黙っておかわりをよそった。'),
      gentle: L('{a}は{dish}をひと口食べて、ふわりと笑った。{a}「おいしい。なんだか、ほっとする味」|{a}「{taste}味付け、好きなんだ。ありがとう」――{a}は、最後のひと口まで大事そうに食べた。|{a}は{dish}を味わいながら、何度も「おいしいね」と繰り返した。'),
      devoted: L('{a}「とってもおいしいです……！」――{a}は目を輝かせて、{dish}を一口ずつ噛みしめた。|{a}は{dish}を食べ終えると、「作り方、今度教えてもらえますか」と真剣な顔で頼んだ。|{a}「{taste}の、大好きなんです」――{a}は嬉しそうに、器を両手で包んだ。'),
      cool: L('{a}は{dish}をひと口食べて、わずかに目を見開いた。{a}「……火の通し方がちょうどいい。うまい」|{a}「{taste}味付けで、素材の味も残ってる。よくできてる」――淡々とした口ぶりの割に、{a}はおかわりをした。|{a}は黙々と{dish}を口に運び、気づけば皿は空になっていた。それが{a}なりの感想だった。'),
      free: L('{a}「うまっ！　なにこれ、めちゃくちゃおいしい！」――{a}は{dish}をかき込んで、頬をふくらませた。|{a}は{dish}をひと口食べるなり、足をばたばたさせた。{a}「{taste}の最高！　おかわり！」|{a}「これ毎日食べたい！」――{a}は{dish}の器を抱えたまま、満面の笑みを浮かべた。'),
      shy: L('{a}は{dish}をひと口食べて、小さく「……おいしい」とつぶやいた。顔が少し赤かった。|{a}「あ、あの、すごくおいしい、です……」――{a}は消え入りそうな声で言って、また一口食べた。|{a}は{taste}味付けの{dish}を、こっそり二杯目までよそっていた。見つかって、真っ赤になった。'),
      polite: L('{a}は{dish}をひと口味わい、丁寧に手を合わせた。{a}「とてもおいしいです。ありがとうございます」|{a}「{taste}味付けが、とても好みです」――{a}は姿勢を正したまま、きれいに{dish}を食べ終えた。|{a}「こんなにおいしいものをいただけるなんて」――{a}は、最後のひと口まで丁寧に味わった。')
    },
    meh: {
      proud: L('{a}は{dish}を食べて、肩をすくめた。{a}「普通だな。食えりゃいい」|{a}「可もなく不可もなく、ってとこか」――{a}はそう言いつつ、残さず食べた。|{a}は{dish}を黙って食べ終えた。うまいともまずいとも言わなかった。'),
      stern: L('{a}は{dish}を静かに食べ、「悪くはない」とだけ言った。|{a}「味は、まあ普通だ。腹は満たせる」――{a}は淡々と箸を進めた。|{a}は{dish}を残さず食べ、器をきちんと重ねた。感想は特になかった。'),
      tsun: L('{a}「ふつう。……ふつうだってば」――{a}は、なぜか二回言った。|{a}は{dish}をつつきながら、「まあ、食べられなくはないけど」と小さく言った。|{a}「別に文句はないし」――{a}はそっけなく言って、黙々と食べた。'),
      gentle: L('{a}は{dish}を食べて、にこにこと「うん、おいしいよ」と言った。いつもどおりの、やさしい感想だった。|{a}「やさしい味だね」――{a}はそう言って、ゆっくり食べた。|{a}は{dish}を食べ終えて、「ごちそうさま」と穏やかに手を合わせた。'),
      devoted: L('{a}「おいしいです」――{a}は笑顔で言ったが、いつもほど目は輝いていなかった。|{a}は{dish}をきちんと食べ終えて、「ごちそうさまでした」と頭を下げた。|{a}「次は、違う味付けのも食べてみたいです」――{a}は遠慮がちに付け足した。'),
      cool: L('{a}「可もなく不可もなく、だな」――{a}は{dish}を分析するように食べ進めた。|{a}は{dish}を食べて、「悪くない。改善の余地はあるが」とだけ言った。|{a}は黙々と{dish}を食べた。感想を聞かれて、少し考えてから「標準的」と答えた。'),
      free: L('{a}「うーん、ふつう！　でもお腹すいてたからおいしい！」――{a}は笑って{dish}を平らげた。|{a}は{dish}を食べながら、もう次に食べたいものの話を始めていた。|{a}「まあまあかな！」――{a}は正直に言って、けらけら笑った。'),
      shy: L('{a}は{dish}を小さな口で食べて、「……おいしい、と思います」と自信なさげに言った。|{a}は感想を聞かれて、少し困ったように笑った。{a}「ふ、ふつうに、おいしいです」|{a}は黙って{dish}を食べ終え、そっと「ごちそうさま」とつぶやいた。'),
      polite: L('{a}「ごちそうさまでした。おいしくいただきました」――{a}の感想は、いつもどおり礼儀正しかった。|{a}は{dish}を丁寧に食べ終え、静かに手を合わせた。|{a}「やさしいお味ですね」――{a}は穏やかに言って、残さず食べた。')
    },
    bad: {
      proud: L('{a}は{dish}をひと口食べて、顔をしかめた。{a}「……なんだこれ。{taste}にもほどがあるだろ」|{a}「まずい」――{a}は即答した。それでも、出されたものは全部食べた。|{a}は{dish}を飲み込んで、水をあおった。{a}「次はもうちょいましなもん作れよ」'),
      stern: L('{a}は{dish}を一口食べて、眉間に皺を寄せた。{a}「……正直に言う。これは、うまくない」|{a}は表情を変えずに{dish}を食べきり、「次は味見をしてから出すといい」と静かに言った。|{a}「味が強すぎる。だが、食べられないほどではない」――{a}はそう言って、最後まで箸を置かなかった。'),
      tsun: L('{a}「うわ、なにこれ。……べ、別に、食べないとは言ってないし」――{a}は顔をしかめたまま、{dish}をつついた。|{a}は{dish}をひと口食べて、ものすごい顔をした。{a}「下手くそ。……でも、残すのはもったいないから」|{a}「まずい！　まずいけど、次も味見してあげてもいい」――{a}はそっぽを向いて言った。'),
      gentle: L('{a}は{dish}をひと口食べて、一瞬だけ固まった。それから、何事もなかったように笑った。{a}「うん、大丈夫。食べられるよ」|{a}「ちょっと、思ってたのと違う味かも。でも、作ってくれたのが嬉しい」――{a}はやさしく言って、箸を進めた。|{a}は苦笑いしながら、{dish}を最後まで食べた。{a}「次は一緒に作ろうか」'),
      devoted: L('{a}「だ、大丈夫です、おいしいです……！」――{a}は涙目で言って、無理やり{dish}を飲み込んだ。|{a}は顔色ひとつ変えずに{dish}を食べきろうとして、途中でそっと水を飲んだ。|{a}「作ってもらえただけで、嬉しいので」――{a}は健気に笑って、最後まで食べた。'),
      cool: L('{a}は{dish}をひと口食べて、冷静に言った。{a}「火が強すぎた。それと、味の配分が偏ってる」|{a}「まずい、というより、方向性の問題だな」――{a}は淡々と原因を分析しはじめた。|{a}は無表情で{dish}を飲み込み、「改善点は三つある」と指を立てた。'),
      free: L('{a}「うえっ、なにこれ！」――{a}は正直すぎる声を上げて、それから吹き出した。{a}「ごめん、でもこれはさすがに！」|{a}は{dish}をひと口食べて、変な顔をしてみせた。{a}「{taste}の通り越して、新しい味がする！」|{a}「これ、罰ゲームのやつ？」――{a}はけらけら笑いながら、それでも全部食べた。'),
      shy: L('{a}は{dish}をひと口食べて、固まった。何か言おうとして、結局「……い、いただきます」ともう一度言った。|{a}はまずいとは言えずに、小さく小さく{dish}を食べ続けた。|{a}「あ、あの……ちょっとだけ、お水、もらってもいいですか」――{a}は申し訳なさそうに言った。'),
      polite: L('{a}は表情を崩さずに{dish}を口に運び、「個性的なお味ですね」とだけ言った。|{a}「お気持ちはとても嬉しいです。……少しだけ、お水をいただけますか」――{a}は穏やかに言った。|{a}は丁寧に{dish}を食べきり、「ごちそうさまでした」と頭を下げた。少しだけ、笑顔が硬かった。')
    }
  };
  /* 味の一文（{b}＝作った人。いなければ店や配給の料理） */
  var TASTE_BY = L('{b}の{dish}は、今日は{taste}味付けだった。|ひと口目で分かった。{b}の作った{dish}は、{taste}仕上がりだ。|{b}が作った{dish}は、{taste}味に寄っていた。|{b}の{dish}は、いつもより{taste}味付けになっていた。');
  var TASTE_NO = L('{dish}は、{taste}味付けだった。|運ばれてきた{dish}は、{taste}仕上がりだった。|ひと口食べると、{dish}は思ったより{taste}味だった。');
  var LIKE_DISH = L('{dish}は、{a}の好物だった。|{a}の前に置かれたのは、好物の{dish}だった。|{a}は、好物の{dish}を前にして目を輝かせた。');
  /* 作った人の受け止め（{a}＝食べた人、{b}＝作った人） */
  var AFTER = {
    good: L('{b}は、少し得意げに鼻を鳴らした。|{b}は照れくさそうに笑って、{a}の器にもう一杯よそった。|{b}「でしょ｜だろう｜でしょう」――{b}は胸を張った。|{b}は、きれいになった{a}の器を見て、こっそり嬉しそうにしていた。'),
    tease: L('{b}「うるさい。じゃあ次は{a}が作って｜うるさい。では次は{a}が作れ｜うるさいですよ。では次は{a}が作ってください」――言い返しながら、{b}も少し笑っていた。|{b}は{a}の頭を軽く小突いた。二人とも、なんだか楽しそうだった。|{b}「覚えてろ｜覚えていろ｜覚えていてください」――{b}は悔しそうに言って、もう次の献立を考えはじめた。'),
    care: L('{b}は申し訳なさそうに頭をかいた。{a}の気遣いが、かえって身にしみた。|{b}「……次は、ちゃんと味見する｜……次は、きちんと味見する｜……次は、ちゃんと味見します」――{a}は笑って頷いた。|{b}は、文句ひとつ言わずに食べてくれた{a}に、こっそり感謝した。')
  };

  /* 反応の判定：q（料理の出来 0〜3。分からなければ null）・好きな味・苦手な味・好物・嫌いな食べ物・気質 */
  F.verdict = function (ctx, c, taste, dish, q) {
    var s = 0, why = [];
    if (q != null) s += [-1.2, -0.2, 0.6, 1.2][Math.max(0, Math.min(3, q))];
    var lk = hit(dish, F.like(c)), hs = hit(dish, F.hate(c));
    if (lk) { s += 2; why.push('好物（' + lk + '）'); }
    if (hs) { s -= 2.5; why.push('嫌いな食べ物（' + hs + '）'); }
    if (taste && F.taste(c).indexOf(taste) >= 0) { s += 1.6; why.push('好きな味（' + taste + '）'); }
    else if (taste && F.badTastes(c).indexOf(taste) >= 0) { s -= 1.4; why.push('苦手な味（' + taste + '）'); }
    if (!F.has(c)) { s += (tr(c, 'np') * 0.4 + tr(c, 'fc') * 0.4 - tr(c, 'cp') * 0.5) - 0.15; why.push('好みは決めていない（気質から）'); }
    s += (rnd(ctx)() - 0.5) * 1.6;
    return { v: s >= 0.8 ? 'good' : s <= -0.8 ? 'bad' : 'meh', why: why.join('・'), like: lk, hate: hs };
  };
  F.react = function (ctx, c, taste, dish, o) {
    o = o || {};
    var V = F.verdict(ctx, c, taste, dish, o.q), p = persona(c);
    var t = fill(fresh(ctx, REACT[V.v][p]), { a: c, b: o.cook, dish: dish, taste: F.tasteWord(taste) });
    return { v: V.v, text: t, why: c.name + '：' + ({ good: 'うまい', meh: 'ふつう', bad: 'まずい' })[V.v] + '（' + (V.why || '味の当たり外れ') + '）', like: V.like, hate: V.hate, persona: p };
  };

  /* ---------- 嫌いな食べ物を出された（{a}＝出された人、{b}＝出した人、{hate}） ---------- */
  var HATE = {
    proud: L('{b}が出した皿に{hate}を見つけて、{a}ははっきり言った。{a}「{hate}は食わない。悪いな」|{a}は{hate}を箸でつまんで、黙って{b}の皿に移した。{a}「これだけは無理だ」|{a}「{hate}入ってんじゃねえか」――{a}は顔をしかめたが、ほかのものはきれいに食べた。'),
    stern: L('{a}は{hate}を前にして、一瞬だけ箸を止めた。{a}「……実は{hate}が苦手だ。だが、出されたものは食べる」|{a}は{hate}を一息に飲み込み、表情を崩さなかった。あとで{b}にだけ「苦手なんだ」と打ち明けた。|{a}「{hate}は好かん。……次からは抜いてくれると助かる」――{a}は言うべきことを言って、残りを黙って食べた。'),
    tsun: L('{a}「べ、別に{hate}が嫌いなわけじゃないし」――そう言う{a}の箸は、{hate}だけを器用に避けていた。|{a}は{hate}をこっそり皿の端に寄せた。{b}に見つかって、{a}「……見なかったことにして」|{a}は意地で{hate}を口に入れ、涙目で飲み込んだ。{a}「よ、余裕だし」'),
    gentle: L('{a}は{hate}がのった皿を前に、にこにこと「いただきます」と言った。苦手なことは、最後まで口にしなかった。|{a}は{hate}を、ほかのおかずと一緒にそっと口に運んだ。{b}には、苦手だと気づかれないように。|{a}「うん、おいしいよ」――{hate}を飲み込んだあと、{a}はこっそり水を多めに飲んだ。'),
    devoted: L('{a}は{hate}を見て一瞬固まったが、すぐに笑顔を作った。{a}「いただきます……！」|{a}は苦手な{hate}を、{b}が用意してくれたものだからと、目をつぶって食べきった。|{a}「お、おいしいです」――{hate}を食べる{a}の手は、少しだけ震えていた。'),
    cool: L('{a}は{hate}を見て、淡々と言った。{a}「{hate}は食べない主義なんだ。理由は聞かないでくれ」|{a}「{hate}が苦手だ。食感が合わない」――{a}は理由まで正確に説明して、{hate}だけを皿の端に除けた。|{a}は{hate}を除けながら、{b}に代わりのものを頼んだ。迷いのない手つきだった。'),
    free: L('{a}「あっ、{hate}！　ごめん、これだけ無理！」――{a}は両手を合わせて、{hate}を{b}の皿に移した。|{a}は{hate}を見るなり「うげっ」と声を上げた。正直すぎて、{b}は怒る気も失せた。|{a}「{hate}ってさ、なんでこの世にあるんだろうね」――{a}は真顔で言って、{hate}を避けて食べた。'),
    shy: L('{a}は{hate}を前に、何も言えずにうつむいた。結局、小さく切って少しずつ飲み込んだ。|{a}は{hate}を残すこともできず、もじもじと箸を動かした。{b}が気づいて、そっと皿を引き取った。|{a}「だ、大丈夫です……」――{hate}を口に入れた{a}は、今にも泣きそうだった。'),
    polite: L('{a}は{hate}を前にして、穏やかに微笑んだ。{a}「いただきます」――苦手であることは、おくびにも出さなかった。|{a}「申し訳ありません、{hate}が少し苦手でして」――{a}は丁寧に詫びてから、ほかのものをきれいに食べた。|{a}は{hate}を上品に口に運び、静かに飲み込んだ。表情は最後まで崩れなかった。')
  };
  F.hateScene = function (ctx, a, b, item) {
    var h = F.hate(a);
    if (!h.length) return null;
    item = item && h.indexOf(item) >= 0 ? item : pick(ctx, h);
    var p = persona(a), t = fresh(ctx, HATE[p]);
    var honest = HONEST[p] || (p === 'polite' && /申し訳/.test(t)) || (p === 'stern');
    var hide = !honest;
    if (honest) mod(ctx, b, a, { trust: 1 });
    else if (ctx && ctx.R && typeof ctx.stress === 'function') ctx.stress(a, 2);
    return { text: fill(t, { a: a, b: b, hate: item }), why: a.name + 'の嫌いな食べ物（' + item + '）を出された：' + (hide ? '苦手を隠した' : '正直に言った') + '（態度「' + ((HK.PERSONA && HK.PERSONA[p] && HK.PERSONA[p].label) || p) + '」）', hide: hide };
  };

  /* ---------- 好物の一句（{a}＝言う・する人、{b}＝相手） ---------- */
  var TALK = {
    remember: L('{a}は、{b}の好物が{like}だということを、ちゃんと覚えていた。|{a}「{like}、好きだったよね｜{like}が好きだったな｜{like}、お好きでしたよね」――{b}は、前に一度話しただけのことを覚えられていて、少し照れた。|{b}が前に一度だけ口にした「{like}が好き」を、{a}は忘れていなかった。'),
    gift: L('{a}は帰り道に、{b}の好きな{like}を買ってきた。{b}の顔が、ぱっと明るくなった。|{a}は「ついでだから｜ついでだ｜ついでですから」と言って、{b}に{like}を差し入れた。ついでにしては、ちょうど{b}の好きな店のものだった。|{a}がそっと置いていった袋の中には、{b}の好物の{like}が入っていた。'),
    share: L('{a}は、自分の分の{like}を、黙って{b}の皿に取り分けた。{b}の好物だと知っていた。|{a}「{like}、こっちの分もあげる｜{like}、こちらの分もやる｜{like}、こちらの分も差し上げます」――{b}の好物だと、とっくに知っていた。|{a}は大皿の{like}を、{b}の分だけ多めによそった。'),
    hate: L('{a}は、{b}が{hate}を苦手なのを覚えていて、{b}の皿の{hate}を黙って引き取った。|{a}「{hate}、抜いといたよ｜{hate}は抜いておいた｜{hate}、抜いておきました」――{b}は、前に一度話しただけの苦手を覚えられていて、少し驚いた。|{a}は注文のとき、さりげなく「片方は{hate}抜きで｜片方は{hate}抜きで頼む｜片方は{hate}抜きでお願いします」と言い添えた。{b}の分だった。'),
    self: L('{a}は好物の{like}の話になると、急に早口になった。|{a}は、{like}さえあれば機嫌がいい。今日もそうだった。|{a}は「{like}が食べたい｜＝｜{like}が食べたいです」と、今日三回目の独り言を言った。'),
    selfTaste: L('{a}は、何でも{taste}味付けにしたがる。今日も例外ではなかった。|{a}は{taste}ものに目がない。今日も、つい手が伸びた。|{a}の好みは、昔から{taste}味付けだった。')
  };
  /* kinds：使ってよい種類（省略時は remember・gift・share・hate）。相手が何も決めていなければ自分の好物・好きな味 */
  F.talk = function (ctx, a, b, kinds) {
    if (!a) return null;
    kinds = kinds || ['remember', 'gift', 'share', 'hate'];
    var bl = b ? F.like(b) : [], bh = b ? F.hate(b) : [], ks = [];
    kinds.forEach(function (k) { if (k === 'hate' ? bh.length : bl.length) ks.push(k); });
    var k, v = { a: a, b: b };
    if (ks.length) { k = pick(ctx, ks); if (k === 'hate') v.hate = pick(ctx, bh); else v.like = pick(ctx, bl); }
    else if (F.like(a).length) { k = 'self'; v.like = pick(ctx, F.like(a)); }
    else if (F.taste(a).length) { k = 'selfTaste'; v.taste = F.tasteWord(pick(ctx, F.taste(a))); }
    else return null;
    if (k === 'gift' || k === 'share' || k === 'hate') mod(ctx, b, a, { aff: 2 });
    if (k === 'remember') mod(ctx, b, a, { aff: 1, trust: 1 });
    var who = k === 'self' || k === 'selfTaste' ? a : b;
    return { text: fill(fresh(ctx, TALK[k]), v), why: who.name + 'の' + (k === 'hate' ? '嫌いな食べ物（' + v.hate + '）' : k === 'selfTaste' ? '好きな味' : '好物（' + v.like + '）'), kind: k };
  };

  /* ---------- 作った人と食べた人の一場面 ---------- */
  F.meal = function (ctx, cook, eater, dish, o) {
    o = o || {};
    if (!eater) return null;
    var hs = F.hate(eater), hd = hit(dish, hs);
    /* 嫌いな食べ物が入っている（または、たまに苦手なものが出てくる） */
    if (hs.length && (hd || (o.hateChance && rnd(ctx)() < o.hateChance))) return F.hateScene(ctx, eater, cook || o.server || eater, hd || null);
    var M = F.cook(ctx, cook && cook !== eater ? cook : null, dish, o.q);
    var lk = hit(M.dish, F.like(eater));
    var head = (lk ? fill(fresh(ctx, LIKE_DISH), { a: eater, dish: M.dish }) : '') + fill(fresh(ctx, cook && cook !== eater ? TASTE_BY : TASTE_NO), { b: cook, dish: M.dish, taste: F.tasteWord(M.taste) });
    var R = F.react(ctx, eater, M.taste, M.dish, { q: o.q, cook: cook });
    var text = head + R.text, mode = '';
    if (cook && cook !== eater) {
      mode = R.v === 'good' ? 'good' : R.v === 'bad' ? (TEASE[R.persona] ? 'tease' : 'care') : '';
      if (mode && !o.noAfter) text += fill(fresh(ctx, AFTER[mode]), { a: eater, b: cook });
      if (mode === 'good') { mod(ctx, eater, cook, { aff: 3, trust: 1 }); mod(ctx, cook, eater, { aff: 1 }); joy(ctx, eater, { joy: 5 }); }
      else if (mode === 'tease') { mod(ctx, eater, cook, { aff: 1 }); mod(ctx, cook, eater, { aff: 1, ten: 1 }); }
      else if (mode === 'care') { mod(ctx, cook, eater, { aff: 3, trust: 2 }); }
    } else if (R.v === 'good') joy(ctx, eater, { joy: 4 });
    return { text: text, v: R.v, taste: M.taste, dish: M.dish, why: '味付けは' + M.taste + '・' + R.why + (mode === 'good' ? '（' + eater.name + '→' + cook.name + ' 好意＋）' : mode === 'tease' ? '（からかい）' : mode === 'care' ? '（気遣い）' : ''), mode: mode };
  };

  /* ---------- 日常キット（daily-kit.js）の出来事に足す一文 ----------
     kind：meal（{a} が作って {b}・{c} が食べる）／out（外食・店）／share（取り分け・交換）／gift（差し入れ・買い出し）／picky（好き嫌いの話） */
  var DAILY_P = { meal: 0.75, out: 0.7, share: 0.55, gift: 0.6, picky: 0.85 };
  function spotKind(ctx) {
    var s = HK.Daily && HK.Daily.at ? String(HK.Daily.at(ctx) || '') : '';
    if (ctx._dailyCur && ctx._dailyCur.time === 'morning' && /^home/.test(s)) return 'morning';
    if (/^island/.test(s)) return 'island';
    if (/^room/.test(s)) return 'room';
    if (/cafe/.test(s)) return 'cafe';
    if (/famires/.test(s)) return 'famires';
    if (/school|office/.test(s)) return 'school';
    if (/^trip/.test(s)) return 'trip';
    return 'home';
  }
  F.daily = function (ctx, kind, a, b, c) {
    var P = [a, b, c].filter(Boolean);
    if (!F.any(P) || !DAILY_P[kind]) return null;
    if (rnd(ctx)() >= DAILY_P[kind]) return null;
    var withPref = P.filter(F.has);
    if (kind === 'picky') {
      var hh = P.filter(function (x) { return F.hate(x).length; });
      if (hh.length) { var e0 = pick(ctx, hh); return F.hateScene(ctx, e0, e0 === a ? b : a); }
      return F.talk(ctx, a, b, ['remember', 'share']) || F.talk(ctx, b, a, ['remember', 'share']);
    }
    if (kind === 'gift') return F.talk(ctx, a, b, ['gift', 'remember']) || F.talk(ctx, b, a, ['gift', 'remember']);
    if (kind === 'share') {
      var x = F.like(b).length || F.hate(b).length ? [a, b] : F.like(a).length || F.hate(a).length ? [b, a] : [a, b];
      return F.talk(ctx, x[0], x[1], ['share', 'hate', 'remember']);
    }
    /* meal・out：食べた人を一人（好みを決めた人を先に） */
    var cook = kind === 'meal' ? a : null;
    var eaters = P.filter(function (x) { return x !== cook; }), pref = eaters.filter(F.has);
    var eater = pick(ctx, pref.length ? pref : eaters.length ? eaters : withPref);
    if (!eater) return null;
    var dish = kind === 'meal' && c ? pick(ctx, DISH.nabe) : F.dishFor(ctx, eater, spotKind(ctx));
    return F.meal(ctx, cook, eater, dish, { hateChance: 0.12, server: eater === a ? b : a });
  };

  /* ---------- 合コン・初対面の話題（{a}＝話す人、{b}＝聞いた人） ---------- */
  var INTRO = {
    like: L('{a}がぽろっと「{like}に目がなくて｜{like}に目がないのだ｜{like}に目がないんです」と言うと、{b}が「わかる｜分かる｜分かります」と身を乗り出した。|好物を聞かれた{a}は、迷わず「{like}」と答えた。答えるのが少し早すぎて、皆が笑った。|{a}は{like}のおいしい店の話を始めて、止まらなくなった。{b}がスマホに店の名前をメモしていた。'),
    hate: L('{a}が「{hate}だけはどうしても無理｜{hate}だけはどうしても無理だ｜{hate}だけはどうしても無理なんです」と言うと、{b}が「えっ、おいしいのに｜なに、うまいのにか｜えっ、おいしいですよ」と目を丸くした。|苦手な食べ物の話で、{a}は{hate}について熱く語った。誰も止められなかった。|{a}「{hate}は、昔からずっと苦手で｜{hate}は、昔からずっと苦手だ｜{hate}は、昔からずっと苦手なんです」――少し恥ずかしそうに言う{a}に、{b}が笑った。'),
    taste: L('{a}は「味付けは、断然{taste}のが好き｜味付けは、断然{taste}のが好きだ｜味付けは、断然{taste}のが好きです」と言い切った。{b}は「意外｜意外だ｜意外です」と目を瞬かせた。|{b}が「{a}って、{taste}もの好きそう｜{a}は、{taste}ものが好きそうだ｜{a}は、{taste}ものがお好きそうですね」と言うと、{a}は「なんで分かったの｜なぜ分かった｜どうして分かったんですか」と驚いた。|{a}の好みが{taste}味付けだと分かって、{b}は「今度いい店がある｜＝｜今度、いいお店がありますよ」と言った。'),
    same: L('{a}と{b}の好物が、どちらも{like}だと分かった。二人は顔を見合わせて、なぜか握手をした。|「{like}！」――{a}と{b}の声が、せーので重なった。好物が同じだった。|{a}と{b}は、{like}の話で妙に意気投合した。周りが置いていかれるほどだった。')
  };
  /* topic：'like'（好きな食べ物の話題）・'hate'（苦手な食べ物）・'taste'（味の好み）・''（ほかの話題に低確率で） */
  F.intro = function (ctx, list, topic) {
    var P = (list || []).filter(Boolean);
    if (!F.any(P)) return null;
    if (!topic && rnd(ctx)() >= 0.12) return null;
    var cand = [];
    for (var i = 0; i < P.length; i++) for (var j = 0; j < P.length; j++) {
      if (i === j) continue;
      var x = P[i], y = P[j], same = F.like(x).filter(function (w) { return F.like(y).indexOf(w) >= 0; });
      if (same.length && i < j && topic !== 'hate') cand.push({ k: 'same', a: x, b: y, like: same[0], w: 3 });
      if (F.like(x).length && topic !== 'hate' && topic !== 'taste') cand.push({ k: 'like', a: x, b: y, w: 2 });
      if (F.hate(x).length && (topic === 'hate' || !topic)) cand.push({ k: 'hate', a: x, b: y, w: topic === 'hate' ? 3 : 1 });
      if (F.taste(x).length && topic !== 'hate') cand.push({ k: 'taste', a: x, b: y, w: topic === 'taste' ? 3 : 1 });
    }
    if (!cand.length) return null;
    var tot = cand.reduce(function (s, o) { return s + o.w; }, 0), r = rnd(ctx)() * tot, it = cand[0];
    for (var n = 0; n < cand.length; n++) { r -= cand[n].w; if (r < 0) { it = cand[n]; break; } }
    var v = { a: it.a, b: it.b };
    if (it.k === 'same') v.like = it.like;
    else if (it.k === 'like') v.like = pick(ctx, F.like(it.a));
    else if (it.k === 'hate') v.hate = pick(ctx, F.hate(it.a));
    else v.taste = F.tasteWord(pick(ctx, F.taste(it.a)));
    if (it.k === 'same') { mod(ctx, it.a, it.b, { aff: 3 }); mod(ctx, it.b, it.a, { aff: 3 }); }
    else mod(ctx, it.b, it.a, { aff: 1 });
    return { text: fill(fresh(ctx, INTRO[it.k]), v), why: it.a.name + 'の' + ({ like: '好物（' + v.like + '）', hate: '嫌いな食べ物（' + v.hate + '）', taste: '好きな味', same: '好物が' + it.b.name + 'と同じ（' + v.like + '）' })[it.k], a: it.a, b: it.b, kind: it.k };
  };

  /* ---------- 宇宙船の配給（{a}・{b}） ---------- */
  var RATION = {
    good: L('配給の箱の中に、{b}の好物の{like}味の非常食がひとつだけ入っていた。{a}は黙ってそれを{b}に回した。|{a}は自分の配給から、{b}の好きな{like}を少しだけ取り分けた。|{b}の好物が{like}だと知っていた{a}は、配給の献立表を見て「今日は当たりだよ｜今日は当たりだ｜今日は当たりですよ」と教えた。'),
    bad: L('取り合いになったのは、{a}の好物の{like}の缶詰だった。|{a}は、{like}だけは譲れないと言い張った。|{a}は、最後の{like}を{b}に先に取られて、むっとした。'),
    hate: L('配給のメニューは、{a}の嫌いな{hate}だった。{a}は黙って半分を{b}に押しつけた。|{a}は{hate}入りのペーストを前に、長いこと睨み合っていた。|{a}「また{hate}か｜＝｜また{hate}ですか」――配給の箱を開けた{a}は、天井を仰いだ。')
  };
  F.ration = function (S, a, b, bad) {
    if (!F.any([a, b])) return null;
    if (rnd(S)() >= 0.45) return null;
    var k, v = { a: a, b: b };
    if (bad && F.like(a).length) { k = 'bad'; v.like = pick(S, F.like(a)); }
    else if (bad && F.like(b).length) { k = 'bad'; v = { a: b, b: a, like: pick(S, F.like(b)) }; }
    else if (!bad && F.like(b).length) { k = 'good'; v.like = pick(S, F.like(b)); }
    else if (!bad && F.like(a).length) { k = 'good'; v = { a: b, b: a, like: pick(S, F.like(a)) }; }
    else if (F.hate(a).length) { k = 'hate'; v.hate = pick(S, F.hate(a)); }
    else if (F.hate(b).length) { k = 'hate'; v = { a: b, b: a, hate: pick(S, F.hate(b)) }; }
    else return null;
    return { text: fill(fresh(S, RATION[k]), v), why: (k === 'good' ? v.b : v.a).name + 'の' + (k === 'hate' ? '嫌いな食べ物（' + v.hate + '）' : '好物（' + v.like + '）') };
  };

  /* ---------- 宴（{a}＝その人） ---------- */
  var FEAST = {
    like: L('膳の料理の中に、{a}の好物の{like}に似た一品があった。{a}の箸が、そこだけやけに進んだ。|{a}は村の女たちに好物を聞かれて、「{like}」と答えた。女たちは顔を見合わせて、「次の宴で出そうかね」と笑った。|{a}は山菜の煮しめをつつきながら、「{like}が食べたいな｜{like}が食べたいものだ｜{like}が食べたいです」と小さくつぶやいた。隣の村人には聞こえなかったらしい。'),
    hate: L('{a}の前の小鉢には、苦手な{hate}が入っていた。{a}は村人の目を気にして、黙って飲み込んだ。|{a}は膳の{hate}を、こっそり隣の皿に移した。誰にも見られていないことを祈った。|{a}は{hate}ののった皿を前に、箸を止めたまま固まっていた。村の女が「遠慮しないで」と笑った。')
  };
  /* ---------- 無人島：食べられない好物を恋しがる（{a}） ---------- */
  var LONG = L('{a}は焚き火を見つめながら、「帰ったら、{like}が食べたい｜＝｜帰ったら、{like}が食べたいです」とつぶやいた。|{a}「{like}……{like}が食べたい……｜＝｜{like}……{like}が食べたいです……」――島に来てから、それが{a}の口癖になっていた。|{a}は{like}の味を思い出そうとして、うまく思い出せずに少しだけ寂しくなった。|{a}が「これ、ちょっと{like}に似てる｜これは、少し{like}に似ている｜これ、ちょっと{like}に似ています」と言うと、皆が一斉に「似てない｜似ていない｜似ていません」と言った。');
  F.longing = function (ctx, c) {
    var l = F.like(c);
    if (!l.length) return null;
    var v = { a: c, like: pick(ctx, l) };
    return { text: fill(fresh(ctx, LONG), v), why: c.name + 'の好物（' + v.like + '）' };
  };
  F.feast = function (S, list, dishKind) {
    var P = (list || []).filter(F.has);
    if (!P.length || rnd(S)() >= 0.6) return null;
    var a = pick(S, P), v = { a: a };
    if (F.like(a).length && rnd(S)() < 0.55) { v.like = pick(S, F.like(a)); return { text: fill(fresh(S, FEAST.like), v), why: a.name + 'の好物（' + v.like + '）', who: a }; }
    if (F.hate(a).length && rnd(S)() < 0.5) { v.hate = pick(S, F.hate(a)); return { text: fill(fresh(S, FEAST.hate), v), why: a.name + 'の嫌いな食べ物（' + v.hate + '）', who: a }; }
    var dish = pick(S, DISH[dishKind] || DISH.feast), taste = pick(S, F.TASTES);
    var head = fill(fresh(S, TASTE_NO), { dish: dish, taste: F.tasteWord(taste) }), R = F.react(S, a, taste, dish, {});
    return { text: head + R.text, why: '味付けは' + taste + '・' + R.why, who: a };
  };

  /* ---------- 小イベント（HK.MINI）の文に足す：箱庭 → { 出来事の id: 種類 } ----------
     種類：share（{a} と {b} の取り分け・交換）／gift（{a} から {b} への差し入れ・確保）／self（{a} ひとりの好物） */
  F.HOOK = {
    classroom: { c_bento: 'share', c_canteen: 'gift', c_roof: 'share', c_invite_alone: 'share', c_lunch_early: 'self' }
  };
  F.hookMini = function (scen, map) {
    (HK.MINI && HK.MINI[scen] || []).forEach(function (ev) {
      var k = map[ev.id];
      if (!k || ev._foodHook || typeof ev.run !== 'function') return;
      var run0 = ev.run;
      ev._foodHook = k;
      ev.run = function (ctx, a, b) {
        var r = run0.apply(this, arguments);
        if (!r || !r.text || !F.any(k === 'self' ? [a] : [a, b])) return r;
        if (rnd(ctx)() >= 0.4) return r;
        var x = k === 'self' ? F.talk(ctx, a, null) : k === 'gift' ? F.talk(ctx, a, b, ['gift', 'remember']) : F.talk(ctx, a, b, ['share', 'hate', 'remember']) || F.talk(ctx, b, a, ['share', 'hate', 'remember']);
        if (x) { r.text += x.text; r.why = (r.why ? r.why + '／' : '') + x.why; }
        return r;
      };
    });
  };
  Object.keys(F.HOOK).forEach(function (s) { F.hookMini(s, F.HOOK[s]); });
})();
