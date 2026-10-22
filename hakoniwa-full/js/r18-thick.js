/* 箱庭シミュレーター（R18版のみ）― 邪神村RTA・吹雪の館の「交わりの山場」を厚くする（小説調）
   HK.R18M.sex をこの二つの箱庭のときだけ包み、段落（\n\n）に分けて組み立て直す（山場1つで400字前後）。
   体位に入る → 攻めの一言 → 受けの声と最中の手触り → 崩れていく受けと余裕を崩さない攻め → 果てる瞬間 → 余韻。
   ・受けの崩れ方は気の強さで分ける（気の強い人は唇を噛んで堪え、やわらかい人はしがみついて蕩ける）
   ・ハードな支配（首を押さえる・手首を縛る）は、攻めが嗜虐的なとき（HK.Ero.sadist）だけ、山場の2割5分ほど。
     恋人・その場の勢い（love・plain）の夜だけで、媚薬・憎しみ・憑依の夜には使わない。受けが攻め指定のときは使わない
   ・opt.short（愛憎の揉み合い・口封じ）は短いまま、段落だけ分ける。余韻は甘くしない
   ・女性どうし（HK.FF）・女性が攻め（HK.FM）は、挿入を前提にしない文で同じ流れに
   全年齢版ではこのファイルは読み込まれない。登場人物はすべて成人として扱う */
(function () {
  'use strict';
  var HK = window.HK, ST = HK.Story, R = HK.R18M, D = HK.R18M_DATA;
  if (!R || !D || !ST) return;
  function L(s) { return s.split('|'); }
  function F(t, m) { return ST.fmt(t, m); }
  function pick(S, a) { return ST.pick(S, a); }
  var SCEN = { jashin: 1, yakata: 1 };
  function on(S) { return !HK.SAFE_ON && S && S.scen && SCEN[S.scen.id]; }
  var P = '\n\n';

  /* 繋がった直後の手触り（気分ごと） */
  var ENTER = {
    love: L('押し広げられていく熱に、{y}の息が細く震えた。{x}は動かずに待ち、{y}の内側がゆっくりと馴染んでいくのを確かめていた。|{x}の重みと体温が、{y}の上にゆっくりと降りてきた。触れ合った胸から、互いの鼓動が混ざり合って聞こえた。'),
    rough: L('{y}の内側が、無理やり押し開かれる感触に強ばった。{x}はそれを宥めもせず、腰を掴む指にさらに力を込めた。|奥まで届いた瞬間、{y}の背中が弓なりに反った。{x}の指の跡が、腰に赤く残っていた。'),
    drug: L('薬の熱で火照った内側は、触れられただけで溶けそうだった。{y}は自分の体が勝手に{x}を締めつけるのを止められなかった。|甘い香りがまだ肌にまとわりついていた。繋がった場所から広がる熱が、{y}の頭の芯まで痺れさせていった。'),
    plain: L('{y}の内側が、{x}の形を確かめるようにきゅっと締まった。{x}は短く息を吐き、{y}の腰を引き寄せた。|肌と肌の擦れる音だけが、部屋に響いた。{y}は息を詰め、{x}の肩に爪を立てた。')
  };
  /* 最中：受けが崩れていき、攻めは余裕を崩さない（受けの気の強さで分ける） */
  var MID_STRONG = {
    love: L('{y}は唇を噛んで声を殺そうとした。けれど{x}が同じ場所を何度も丁寧に擦り上げるうちに、噛んだ唇がほどけていった。'),
    rough: L('{y}は睨み返そうとした。けれど奥を抉られるたびに、睨む目の焦点がほどけ、悪態は途中で喘ぎに変わった。'),
    drug: L('{y}は「薬のせいだ」と自分に言い聞かせた。それでも腰は、{x}を逃がすまいと勝手にくねっていた。'),
    plain: L('{y}は意地でも声を出すまいとした。{x}はそれを面白がるように、浅いところと奥を交互に責め立てた。')
  };
  var MID_SOFT = {
    love: L('{y}は{x}の背中にしがみつき、突き上げられるたびに甘い声を零した。{x}は{y}の髪を撫で、耳元で名前を呼び続けた。'),
    rough: L('{y}は敷布を握りしめ、揺さぶられるままに声を上げた。{x}は息ひとつ乱さず、深く、重く腰を打ちつけた。'),
    drug: L('{y}はもう、何も考えられなかった。{x}が動くたびに目の前が白く瞬き、口の端から甘い声が溢れ続けた。'),
    plain: L('{y}の声はだんだん高く、細くなっていった。{x}は{y}の弱いところを見つけると、そこだけを執拗に擦り上げた。')
  };
  /* 果てる瞬間の手触り */
  var PEAK = {
    love: L('{x}が最奥に押しつけたまま動きを止めると、{y}の内側が波打つように{x}を締めつけた。熱が、奥深くに注ぎ込まれていった。|{y}が大きく背を反らした。その締めつけに、{x}も短く呻いて、{y}の奥へ熱を吐き出した。'),
    rough: L('{x}は{y}の腰を引き寄せ、一番奥に叩きつけるようにして果てた。{y}は声にならない声を上げ、全身を痙攣させた。|最後の一突きで、{y}の膝が崩れた。{x}はそのまま体重をかけ、奥へ深く注ぎ込んだ。'),
    drug: L('{y}は何度目か分からない絶頂に呑まれた。痙攣する内側に搾られて、{x}も耐えきれずに奥へ熱を放った。|薬に煽られた体は、果てても果ててもまだ熱かった。{x}が奥で脈打つたびに、{y}はまた小さく達した。'),
    plain: L('{x}の動きが速く、短くなった。{y}が先に達し、その締めつけに引きずられるように、{x}も奥で果てた。|{y}の爪先が丸まり、全身が強ばった。一拍遅れて、{x}の熱が奥に広がっていった。')
  };
  /* 余韻 */
  var AFTER = {
    love: L('しばらく、二人とも動けなかった。{x}は汗ばんだ{y}の額に口づけ、乱れた髪を指で梳いた。{y}の呼吸が落ち着くまで、腕の中から離さなかった。|繋がったまま、{x}は{y}を抱きしめていた。窓の外の音が、ようやく耳に戻ってきた。'),
    rough: L('{x}が体を離すと、{y}は敷布の上に崩れ落ちたまま、しばらく顔を上げなかった。腰に残った指の跡が、熱を持って疼いていた。|{x}は乱れた襟を直し、何も言わなかった。{y}は荒い息のまま、天井を睨んでいた。'),
    drug: L('薬の熱が引いていくにつれて、{y}の頬に別の赤みが差した。{x}は目を逸らし、脱ぎ散らかした着物を{y}の肩に掛けた。|夜明けが近づくころ、ようやく熱が引いた。二人は背中合わせのまま、一言も話さなかった。'),
    plain: L('{y}は{x}の胸に頬を預けたまま、まだ小さく震えていた。{x}はその背中を、ゆっくりと撫で下ろした。|二人は並んで横たわり、互いの荒い息が静まるのを待った。肌に残った熱が、妙に長く残った。')
  };

  /* 嗜虐的な攻め（HK.Ero.sadist）のときだけ：首・手首を押さえて支配する。{x}の台詞は口調の言い換えを通る */
  var HARD = [
    { open: '{x}は{y}を仰向けに押し倒すと、大きな手でその喉を覆った。指の腹が脈に触れ、親指が喉の少し上を押さえる。力はまだ入れていない。', say: '{x}「動くな」', mid: '{x}は突き上げるたびに指へ力を込め、引くときに緩めた。息を与えては奪われるたびに、{y}の内側がきゅんと強く締まり、視界がうっすらと白く滲んでいった。', say2: '{x}「苦しいか。でも、腰は逃げてないぞ」', peak: '最後に深く打ちつけると同時に、{x}は喉への力をほんの一瞬だけ強めた。{y}は大きく背を反らして達し、{x}もその締めつけの中で奥へ熱を注ぎ込んだ。', after: '{x}はすぐに手を離した。息が一気に流れ込み、{y}は咳き込みながら大きく呼吸を繰り返した。{x}は涙で濡れた頬を親指で拭い、喉に残った赤い指の跡をそっと撫でた。' },
    { open: '{x}は{y}の両手首をまとめて掴み、頭の上で敷布に縫いとめた。片手だけで、{y}はもう身動きが取れなかった。', say: '{x}「隠すな。全部見せろ」', mid: '{x}は手首を押さえたまま、ゆっくりと、深く腰を沈めた。逃げ場のない快感に{y}の体が跳ねるたびに、手首を押さえる力がわずかに強まった。', say2: '{x}「手を離してほしいか。……まだだ」', peak: '{x}が一番奥で動きを止め、低く「いけ」と囁いた。{y}はその声だけで弾けるように達し、{x}も押さえつけたまま奥へ注いだ。', after: '{x}は手首を離し、赤くなったところを指でなぞった。{y}がぼんやりと見上げると、{x}は何も言わずにその手首に口づけた。' }
  ];

  function moodOf(m) { return m === 'rough' || m === 'drug' || m === 'love' ? m : 'plain'; }
  /* 体位を選ぶ（solo-r18-moan.js と同じ重みづけ） */
  function pickPos(S, x, y, mood, allow) {
    var list = allow ? D.POS.filter(function (p) { return allow.indexOf(p.id) >= 0; }) : D.POS;
    if (!list.length) list = D.POS;
    var used = S.r18Pos || (S.r18Pos = []), tx = x.tr || {}, ty = y.tr || {}, tone = R.tone(y);
    return HK.weighted(S.rng, list, function (p) {
      var w = mood === 'love' ? 0.5 + p.love : mood === 'rough' ? 0.5 + p.rough : 1 + (p.love + p.rough) * 0.35;
      if (p.id === 'kijo') w *= 1 + (ty.fc || 0) * 2 + (tone === 'free' ? 1 : 0);
      if (p.id === 'back' || p.id === 'tachi' || p.id === 'neback') w *= 1 + (tx.aggr || 0) + (tx.cp || 0) * 0.5;
      if (p.id === 'seijo' || p.id === 'soku') w *= 1 + (tone === 'shy' || tone === 'devoted' ? 1 : 0) + (tx.np || 0) * 0.5;
      if (p.id === 'ekiben') w *= 0.4 + (x.stats && x.stats.nerve ? x.stats.nerve / 100 : 0.4);
      if (p.oral) w *= 0.45;
      var n = used.filter(function (u) { return u === p.id; }).length;
      return Math.max(0.02, w / (1 + n * 2.5));
    });
  }
  function hardOk(S, x, y, mood, opt) {
    if (opt.short || !(mood === 'love' || mood === 'plain')) return false;
    if (HK.Pos && HK.Pos.hardTop && HK.Pos.hardTop(y)) return false;
    return !!(HK.Ero && HK.Ero.sadist && HK.Ero.sadist(x, y)) && S.rng() < 0.25;
  }
  /* 段落をつなぐ（空の段落は飛ばす） */
  function J(a) { return a.filter(function (x) { return x; }).join(P); }

  /* x=攻め（男性器のある側）・y=受け */
  function mm(S, x, y, opt) {
    var mood = moodOf(opt.mood), rng = S.rng, m = { x: x.name, y: y.name };
    var pos = opt.pos ? D.POS.filter(function (p) { return p.id === opt.pos; })[0] : pickPos(S, x, y, mood, opt.allow);
    if (!pos) pos = pickPos(S, x, y, mood);
    (S.r18Pos || (S.r18Pos = [])).push(pos.id);
    S.r18Last = pos.label;
    var mid = mood === 'plain' ? (rng() < 0.25 + ((x.tr && x.tr.aggr) || 0) * 0.4 ? 'rough' : 'love') : mood;
    var fore = opt.fore !== false ? F(pick(S, D.FORE[mood === 'plain' || rng() < 0.3 ? 'plain' : mood]), m) : '';
    if (pos.oral) {
      /* 口・指は元の流れのまま、段落に分ける */
      if (pos.id === 'kuchi') return J([fore, F(pick(S, pos.t), m) + R.say(S, x, 'top'), opt.short ? '' : R.say(S, x, 'topc'), F(D.CLIMAX.oral[0], m)]);
      return J([fore, F(pick(S, pos.t), m), R.say(S, y, 'start') + (opt.short ? '' : R.say(S, y, 'mid')), R.say(S, y, 'climax') + F(D.CLIMAX.oral[1], m)]);
    }
    if (opt.short) {
      return J([F(pick(S, pos.t), m) + F(pick(S, ENTER[mid]), m), R.say(S, y, 'start'), F(pick(S, PEAK[mid]), m) + R.say(S, y, 'climax')]);
    }
    if (hardOk(S, x, y, mood, opt)) {
      var h = pick(S, HARD);
      return J([fore, F(h.open, m), F(h.say, m), R.say(S, y, 'start') + F(h.mid, m), F(h.say2, m), R.say(S, y, 'mid'), F(h.peak, m) + R.say(S, y, 'climax'), F(h.after, m)]);
    }
    var strong = R.isStrong(y);
    return J([
      fore,
      F(pick(S, pos.t), m) + F(pick(S, ENTER[mood]), m),
      R.say(S, x, 'top'),
      R.say(S, y, 'start') + F(pick(S, (strong ? MID_STRONG : MID_SOFT)[mid]), m),
      R.say(S, y, 'mid'),
      F(pick(S, PEAK[mid]), m) + R.say(S, y, 'climax') + (rng() < 0.45 ? R.say(S, x, 'topc') : ''),
      F(pick(S, AFTER[mood]), m) + (rng() < 0.6 ? R.say(S, rng() < 0.6 ? y : x, 'after') : '')
    ]);
  }

  /* 女性どうし・女性が攻め：挿入を前提にしない言い方で、同じ流れ */
  var SOFT_MID = {
    ff: L('{x}の指が、{y}の一番弱いところを探り当てた。{y}がびくりと腰を跳ねさせると、{x}は小さく笑って、そこだけをゆっくりとなぞり続けた。|{x}は{y}の胸元に唇を這わせながら、脚のあいだを撫でる指の速さを少しずつ上げていった。{y}の吐息が、どんどん浅くなっていった。'),
    fm: L('{x}は{y}の上で腰をくねらせ、{y}が声を上げるたびに、わざと動きを緩めた。{y}の手が{x}の腰を掴もうとすると、{x}はその手を払いのけた。|{x}は{y}を見下ろしたまま、ゆっくりと、深く腰を落とした。{y}の喉から、堪えきれない声が漏れた。')
  };
  var SOFT_AFTER = {
    ff: L('二人は絡めた脚をほどかないまま、しばらく天井を見ていた。{x}が{y}の汗ばんだ髪を耳にかけると、{y}は照れたように目を伏せた。|{y}は{x}の肩に額を預け、乱れた息を整えた。肌に残った熱が、なかなか引かなかった。'),
    fm: L('{x}は{y}の上から降りると、乱れた髪をかき上げた。{y}はまだ息を整えられないまま、{x}の背中をぼんやりと見ていた。|{x}は{y}の胸に頬を預けた。{y}の鼓動が、まだ速く鳴っていた。')
  };
  function soft(S, x, y, opt, kind) {
    var mood = moodOf(opt.mood), rng = S.rng, m = { x: x.name, y: y.name };
    var ctx = { pick: function (a) { return pick(S, a); } }, K = kind === 'ff' ? HK.FF : HK.FM;
    var st = mood === 'rough' ? 'rough' : mood === 'love' ? 'gentle' : HK.FF && HK.FF.styleOf ? HK.FF.styleOf(x) : 'gentle';
    var fill = function (s) { return s.replace(/\{a\}/g, x.name).replace(/\{b\}/g, y.name); };
    S.r18Last = kind === 'ff' ? '指と舌' : '女性上位';
    var body = fill(K.pick(ctx, 'body', st, kind === 'ff' && opt.tools ? { tools: opt.tools } : undefined)), peak = fill(K.pick(ctx, 'climax', st));
    if (opt.short) return J([body, R.say(S, y, 'start'), R.say(S, y, 'climax') + peak]);
    var open = opt.fore !== false && kind === 'fm' ? fill(K.pick(ctx, 'open', st)) : opt.fore !== false ? F(pick(S, D.FORE[mood === 'plain' ? 'plain' : mood]), m) : '';
    return J([open, body, R.say(S, y, 'start') + F(pick(S, SOFT_MID[kind]), m), R.say(S, x, 'top') + R.say(S, y, 'mid'), R.say(S, y, 'climax') + peak, F(pick(S, SOFT_AFTER[kind]), m) + (rng() < 0.5 ? R.say(S, y, 'after') : '')]);
  }

  var sex0 = R.sex;
  R.sex = function (S, x, y, opt) {
    if (!on(S)) return sex0.apply(this, arguments);
    opt = opt || {};
    /* 向きは必ず HK.Pos.order に従う（自分で攻めを選んだ人を受けの位置に置かない） */
    if (HK.Pos) { var od = HK.Pos.order(x, y, [x, y]); x = od[0]; y = od[1]; }
    if (HK.Pos && HK.FF && HK.Pos.ff(x, y)) return soft(S, x, y, opt, 'ff');
    if (HK.FM && HK.FM.on(x, y)) return soft(S, x, y, opt, 'fm');
    return mm(S, x, y, opt);
  };
  /* 女性どうしを自前で組み立てる箱庭（邪神村 pairSex・吹雪の館 SX）用 */
  HK.R18Thick = { on: on, ff: function (S, x, y, opt) { return soft(S, x, y, opt || {}, 'ff'); } };
})();
