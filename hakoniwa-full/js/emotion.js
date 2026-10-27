/* 箱庭シミュレーター: 住人の気分（持続する感情） HK.Emo
   住人ごとに、出来事のあとも残る気分を一か所に持ち、次の出来事の起こりやすさと地の文に効かせ、結果に見せる。
   c.emo = { joy 喜び, grief 悲しみ, fear 恐れ, anger 怒り, shame 恥じらい, lust 火照り（R18版だけ。全年齢では常に 0）, calm 平静 }   各 0〜100
   ■ HK.Emo.bump(ctx, c, { grief: +40 }, why)：立てる。why があれば、次の記録の why に「気分」として足す
   ■ HK.Emo.tick(ctx)：毎区切りの減衰（悲しみは遅く、怒りは速く引く。ストレスが高いと恐れ・怒りが残る）
   ■ HK.Emo.mood(c)：いちばん高い気分（35 未満なら calm）／HK.Emo.face(c)：表情の id（neutral/smile/cry/fear/angry/blush/dark。画像は持たない）
   ■ HK.Emo.word(c)：地の文に挿す短い一句（態度9種×気分7種×3文以上。火照りの句は R18 版の emotion-r18.js）
   ■ HK.Emo.weight(ctx, a, ev)：出来事の重み（engine.js の act()）。悲しみ→恋愛×0.4・交流×1.3、怒り→対立×1.6、恐れ→単独行動×1.5 など
   ■ HK.Emo.blockLove(ctx, actors)：悲しみの深い人（grief 60 以上）は恋愛の出来事を起こさない（engine.js の romanceOk）
   エンジン型：Ctx.kill・Ctx.say をここで包んで気分を立て、区切りごとに snapshot() から HK.Emo.step、結果を作るときに HK.Emo.summary を呼ぶ。
   物語型（邪神村・吹雪の館・宇宙船）：HK.Story.say から HK.Emo.story を呼ぶ。p.m（各箱庭のメーター）には触らず、p.emo を別に持つ */
(function () {
  'use strict';
  var HK = window.HK;
  if (!HK || !HK.Ctx) return;
  var Ctx = HK.Ctx;
  var KEYS = ['joy', 'grief', 'fear', 'anger', 'shame', 'lust'];
  var BARS = ['joy', 'grief', 'fear', 'anger'];
  var NAME = { calm: '平静', joy: '喜び', grief: '悲しみ', fear: '恐れ', anger: '怒り', shame: '恥じらい', lust: '火照り' };
  var FACE = { calm: 'neutral', joy: 'smile', grief: 'cry', fear: 'fear', anger: 'angry', shame: 'blush', lust: 'blush' };
  var FACE_SYM = { neutral: '（・_・）', smile: '（＾▽＾）', cry: '（；_；）', fear: '（゜□゜；）', angry: '（｀へ´）', blush: '（＊／／＊）', dark: '（－_－）' };
  var BAR_COL = { joy: '--friend', grief: '--pine', fear: '--night', anger: '--enemy' };
  var TH = 35, LOVE_BLOCK = 60;
  var ATT = ['proud', 'stern', 'tsun', 'gentle', 'devoted', 'cool', 'free', 'shy', 'polite'];
  /* 物語型で気分を持つ箱庭（死のある三つ） */
  var STORY_EMO = { jashin: 1, yakata: 1, ship: 1 };
  function safe() { return !!HK.SAFE_ON; }
  function clamp(v) { return v < 0 ? 0 : v > 100 ? 100 : v; }
  function L(s) { return s.split('|'); }
  /* 文の選び方は種から決める（ctx.rng を使わないので、ほかの乱数の流れを変えない） */
  function hash(s) { s = String(s); var h = 2166136261; for (var i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return (h >>> 0) / 4294967296; }
  function pickH(arr, key) { return arr && arr.length ? arr[Math.floor(hash(key) * arr.length) % arr.length] : ''; }

  /* ---------- 地の文に挿す一句（{a}＝その人）。態度9種 × 気分（calm は落ち着きを取り戻したとき） ---------- */
  var W = {
    proud: {
      calm: L('{a}は、もういつもの不敵な顔に戻っていた。|{a}はひとつ鼻を鳴らし、肩の力を抜いた。|{a}の声に、ようやく普段の張りが戻っていた。'),
      joy: L('{a}は上機嫌を隠そうともしなかった。|{a}の口の端が、さっきから上がりっぱなしだった。|{a}は妙に機嫌がよく、声まで大きかった。'),
      grief: L('{a}は平気な顔を作ろうとして、うまくいかなかった。|{a}の強がりには、もう力がなかった。|{a}は誰とも目を合わせず、乱暴に目元をこすった。'),
      fear: L('{a}は虚勢を張っていたが、物音のたびに肩が跳ねた。|{a}の大きな声は、怯えを隠すためのものだった。|{a}は舌打ちをして、背後を何度も確かめた。'),
      anger: L('{a}はまだ腹の虫がおさまらなかった。|{a}の目には、剣呑な光が残っていた。|{a}は苛立ちを隠そうともせず、足元の小石を蹴った。'),
      shame: L('{a}はばつが悪そうに、そっぽを向いていた。|{a}は気まずさをごまかすように、乱暴に頭をかいた。|{a}は誰とも目を合わせようとしなかった。')
    },
    stern: {
      calm: L('{a}は背筋を伸ばし、乱れた呼吸を整え終えていた。|{a}の表情は、もとの硬さを取り戻していた。|{a}は短く目を閉じ、気持ちを切り替えた。'),
      joy: L('{a}の硬い表情が、今日はどこか緩んでいた。|{a}は口元が緩むのを、何度も引き締め直していた。|{a}の声には、珍しく弾みがあった。'),
      grief: L('{a}は表情を崩さなかったが、拳は白くなるほど握られていた。|{a}は黙って、やるべきことだけを続けていた。そうしていないと、立っていられなかった。|{a}の背中は、いつもより小さく見えた。'),
      fear: L('{a}は冷静を装っていたが、手の震えを止められなかった。|{a}は警戒を解かず、壁を背にして立っていた。|{a}の声が、わずかに上ずっていた。'),
      anger: L('{a}は怒りを押し殺し、低い声で話していた。|{a}の眉間の皺は、深いままだった。|{a}は一言ずつ区切るように、硬い声を出した。'),
      shame: L('{a}は自分を責めるように、きつく目を閉じた。|{a}はうなだれ、己の不甲斐なさを噛みしめていた。|{a}の声には、自分への苛立ちがにじんでいた。')
    },
    tsun: {
      calm: L('{a}はそっぽを向いたまま、少しだけ肩の力を抜いた。|{a}は小さく咳払いをして、いつもの顔に戻った。|{a}は、どうにかいつもの澄ました顔を作り直していた。'),
      joy: L('{a}は嬉しいのを隠しているつもりで、まるで隠せていなかった。|{a}はそっけない顔をしながら、足取りだけは軽かった。|{a}は、にやけそうになる口元を必死にこらえていた。'),
      grief: L('{a}は泣いていないふりをして、何度も顔をそむけた。|{a}の憎まれ口は、途中で途切れた。|{a}は意地でも涙を見せまいと、唇を噛んでいた。'),
      fear: L('{a}は怖くなんかないという顔で、誰かのそばを離れなかった。|{a}は強がりを言いながら、袖を握りしめていた。|{a}の声だけが、妙に威勢がよかった。'),
      anger: L('{a}はむくれた顔のまま、口をきこうとしなかった。|{a}は怒っていないと言い張りながら、明らかに怒っていた。|{a}の返事は、いつも以上にとげとげしかった。'),
      shame: L('{a}は耳まで赤くして、そっぽを向いていた。|{a}はうつむいて、何か言い訳を探していた。|{a}は目をそらしたまま、ぶっきらぼうに答えた。')
    },
    gentle: {
      calm: L('{a}の表情に、穏やかさが戻ってきていた。|{a}はゆっくり息を吐いて、いつもの笑みを浮かべた。|{a}の声は、もう柔らかさを取り戻していた。'),
      joy: L('{a}は、ふわりとした笑みを絶やさなかった。|{a}の声は、いつもよりいっそう柔らかかった。|{a}はずっと、何かを思い出しては微笑んでいた。'),
      grief: L('{a}はまだ笑えなかった。|{a}の笑顔は、どこか遠くを見ていた。|{a}は時々、ふっと言葉を失った。'),
      fear: L('{a}の笑みは、こわばっていた。|{a}は落ち着かない様子で、何度も辺りを見回した。|{a}は誰かの気配がするたびに、身をすくめていた。'),
      anger: L('{a}の穏やかな顔に、珍しく険があった。|{a}は笑みを消したまま、静かに怒っていた。|{a}の声から、柔らかさが消えていた。'),
      shame: L('{a}は申し訳なさそうに、何度も目を伏せた。|{a}は困ったように笑って、そっと視線を外した。|{a}は小さく肩をすぼめていた。')
    },
    devoted: {
      calm: L('{a}は自分の頬を軽く叩き、いつもの調子を取り戻した。|{a}は、もう大丈夫だというように小さく頷いた。|{a}は気持ちを立て直し、また周りに目を配り始めた。'),
      joy: L('{a}は嬉しさを抱きしめるように、両手を握りしめていた。|{a}の目は、さっきからずっと輝いていた。|{a}は張り切って、いつも以上によく動いた。'),
      grief: L('{a}は自分のことは後回しにして、それでも目を赤くしていた。|{a}は気丈に振る舞っていたが、声が震えていた。|{a}は泣き腫らした目で、それでも周りを気遣っていた。'),
      fear: L('{a}は怖さをこらえて、それでも前に立とうとしていた。|{a}は震える手を、もう片方の手で押さえていた。|{a}は自分に言い聞かせるように、小さく頷き続けていた。'),
      anger: L('{a}は悔しさに、唇を噛みしめていた。|{a}は言い返したいのをこらえて、拳を震わせていた。|{a}の目には、悔し涙がにじんでいた。'),
      shame: L('{a}は、ごめんなさいと口の中で何度も繰り返していた。|{a}は合わせる顔がないというように、うつむいていた。|{a}は自分を責めて、目を潤ませていた。')
    },
    cool: {
      calm: L('{a}の目は、もう冷静さを取り戻していた。|{a}は一度深く息をして、思考を整理し直した。|{a}の声から、揺らぎが消えていた。'),
      joy: L('{a}は平静を装っていたが、目元だけが柔らかかった。|{a}の口数が、珍しく多かった。|{a}は自分の機嫌のよさを、少し持て余していた。'),
      grief: L('{a}は淡々としていたが、同じ説明を二度繰り返していた。|{a}の視線は、ときどき焦点を失っていた。|{a}は理屈で気持ちを片づけようとして、できずにいた。'),
      fear: L('{a}は状況を何度も確かめ直していた。落ち着いているふりだった。|{a}は逃げ道の数を、無意識に数えていた。|{a}の分析は、いつもより早口だった。'),
      anger: L('{a}は冷ややかな目で、相手を見据えていた。|{a}の言葉は、普段よりずっと辛辣だった。|{a}は静かだったが、その静けさが怖かった。'),
      shame: L('{a}は咳払いをひとつして、表情を隠した。|{a}は自分の失態を、頭の中で何度も検証していた。|{a}は珍しく、言葉に詰まっていた。')
    },
    free: {
      calm: L('{a}はもう、けろりとした顔をしていた。|{a}は大きく伸びをして、気分を切り替えた。|{a}の顔に、いつもの屈託のなさが戻っていた。'),
      joy: L('{a}は鼻歌でも歌い出しそうなほど、上機嫌だった。|{a}は今にも跳ね出しそうなほど浮かれていた。|{a}は誰彼かまわず笑いかけていた。'),
      grief: L('{a}から、いつもの明るさが消えていた。|{a}は笑おうとして、途中で泣き顔になった。|{a}は珍しく、ずっと黙り込んでいた。'),
      fear: L('{a}は軽口を叩いていたが、目は笑っていなかった。|{a}は落ち着きなく、その場を行ったり来たりしていた。|{a}の顔から、血の気が引いていた。'),
      anger: L('{a}は不機嫌を隠さず、ぷいと顔をそむけた。|{a}は怒りに任せて、言葉を荒らげた。|{a}は頬をふくらませたまま、ずかずかと歩いた。'),
      shame: L('{a}は照れ隠しに、へらへらと笑っていた。|{a}は顔を赤くして、髪をくしゃくしゃにかき回した。|{a}はさすがに、ばつが悪そうだった。')
    },
    shy: {
      calm: L('{a}はやっと、うつむいていた顔を上げられるようになっていた。|{a}の手の震えは、いつのまにか止まっていた。|{a}は小さく息をついて、少しだけ落ち着いた。'),
      joy: L('{a}は頬を緩ませては、慌てて顔を伏せていた。|{a}の小さな笑みが、何度もこぼれていた。|{a}は嬉しさに、少しだけ声を弾ませた。'),
      grief: L('{a}は膝を抱えたまま、なかなか顔を上げなかった。|{a}の目は、まだ赤く腫れていた。|{a}は声を殺して、何度も涙を拭っていた。'),
      fear: L('{a}は青い顔で、誰かの背中に隠れるようにしていた。|{a}は声も出せずに、身を縮めていた。|{a}はびくびくと、周りの顔色をうかがっていた。'),
      anger: L('{a}は珍しく、はっきりと顔をしかめていた。|{a}は小さな声で、それでも譲らずに言い返した。|{a}はうつむいたまま、拳を握りしめていた。'),
      shame: L('{a}は真っ赤になって、顔を上げられなかった。|{a}は消え入りそうな声で、何度も謝った。|{a}は袖で顔を隠すようにしていた。')
    },
    polite: {
      calm: L('{a}は居住まいを正し、いつもの落ち着いた物腰に戻っていた。|{a}の言葉遣いに、いつもの丁寧さが戻っていた。|{a}は静かに息を整え、背筋を伸ばした。'),
      joy: L('{a}の物腰は、いつもより晴れやかだった。|{a}は穏やかな笑みを浮かべ、声も軽やかだった。|{a}の丁寧な言葉の端々に、嬉しさがにじんでいた。'),
      grief: L('{a}は丁寧な言葉を崩さなかったが、その声は細かった。|{a}は気丈に頭を下げたが、目元は赤かった。|{a}は静かに目を伏せ、しばらく何も言わなかった。'),
      fear: L('{a}は礼儀正しさを保とうとしていたが、声が震えていた。|{a}は努めて平静に振る舞っていたが、顔は青ざめていた。|{a}は言葉を選ぶ余裕もなく、短く息をしていた。'),
      anger: L('{a}は丁寧な言葉のまま、ひどく冷たい声を出した。|{a}の笑顔は、目だけが笑っていなかった。|{a}は慇懃な口調を崩さず、静かに怒っていた。'),
      shame: L('{a}は恐縮しきった様子で、深く頭を下げた。|{a}は頬を染め、言葉を探すように口ごもった。|{a}はいたたまれない様子で、視線を落としていた。')
    }
  };

  var X = HK.Emo = {
    KEYS: KEYS, BARS: BARS, NAME: NAME, FACE_SYM: FACE_SYM, ATT: ATT, WORDS: W, TH: TH, LOVE_BLOCK: LOVE_BLOCK, STORY_EMO: STORY_EMO,
    hash: hash, pickH: pickH,
    /* R18版の火照りの句（emotion-r18.js が {態度: [文]} を入れる） */
    WORDS_LUST: null
  };
  function E(c) {
    if (!c.emo) c.emo = { joy: 0, grief: 0, fear: 0, anger: 0, shame: 0, lust: 0, calm: 100 };
    return c.emo;
  }
  X.get = E;
  function top(e) {
    var best = 'calm', bv = TH - 0.001;
    for (var i = 0; i < KEYS.length; i++) { var k = KEYS[i]; if (k === 'lust' && safe()) continue; if (e[k] > bv) { bv = e[k]; best = k; } }
    return best;
  }
  function recalm(e) { var m = 0; KEYS.forEach(function (k) { if (e[k] > m) m = e[k]; }); e.calm = Math.round(100 - m); }
  /* 態度9種（口調の追加分は、もとにした態度へ） */
  X.att = function (c) {
    var p = c && c.persona;
    if (ATT.indexOf(p) >= 0) return p;
    var b = c && c.tone && HK.toneOpt ? HK.toneOpt(c.tone, 'base') : null;
    return ATT.indexOf(b) >= 0 ? b : 'gentle';
  };
  function stepOf(ctx) { return ctx ? (ctx.stepIndex != null ? ctx.stepIndex : ctx._emoStep || 0) : 0; }
  X.bump = function (ctx, c, d, why) {
    if (!c || c.alive === false || !d) return;
    if (c.flags && c.flags.mad) return;
    var e = E(c), m0 = top(e);
    for (var k in d) {
      if (KEYS.indexOf(k) < 0 || !d[k]) continue;
      if (k === 'lust' && (safe() || (HK.State && !HK.State.r18ok(c)))) continue;
      e[k] = clamp(e[k] + d[k]);
    }
    recalm(e);
    var m = top(e);
    if (m !== 'calm' && (!c._emoPk || e[m] > c._emoPk.v)) c._emoPk = { mood: m, v: Math.round(e[m]), step: stepOf(ctx), label: (ctx && ctx.label) || '' };
    if (ctx && ctx.log) c._emoT = ctx.log.length;
    /* 気分が変わったときだけ、次の記録の why に足す */
    if (why && ctx && m !== 'calm' && m !== m0) { var q = ctx._emoWhy = ctx._emoWhy || []; if (q.length < 2) q.push(c.name + 'は' + NAME[m] + '（' + why + '）'); }
  };
  X.mood = function (c) { return c && c.emo ? top(c.emo) : 'calm'; };
  X.face = function (c) {
    var e = c && c.emo;
    if (!e) return 'neutral';
    if ((e.grief >= 60 && e.anger >= 45) || (e.anger >= 60 && e.shame >= 40) || (e.grief >= 85 && e.fear >= 60)) return 'dark';
    return FACE[top(e)] || 'neutral';
  };
  function fill(t, c) { return String(t).replace(/\{a\}/g, c.name); }
  X.lines = function (att, m) {
    if (m === 'lust') return safe() || !X.WORDS_LUST ? [] : X.WORDS_LUST[att] || X.WORDS_LUST.gentle || [];
    var t = W[att] || W.gentle;
    return t[m] || [];
  };
  /* used（{文: 1}）を渡すと、その回でまだ使っていない文から選ぶ */
  X.word = function (c, key, m, used) {
    if (!c) return '';
    m = m || X.mood(c);
    var arr = X.lines(X.att(c), m);
    if (!arr.length) return '';
    var k0 = Math.floor(hash((key || '') + '|' + c.name + '|' + m) * arr.length) % arr.length, t = arr[k0];
    if (used) { for (var d = 0; d < arr.length; d++) { var t2 = arr[(k0 + d) % arr.length]; if (!used[c.name + t2]) { t = t2; break; } } used[c.name + t] = 1; }
    return fill(t, c);
  };
  /* 一句を挿してよい出来事か：気分と出来事の種類が噛み合い、本文が気分と逆の調子でないこと */
  var FIT = { joy: /^(?:romance|bond|help|escape)$/, grief: /^(?:bond|help|solo|escape|conflict)$/, fear: /^(?:solo|escape|conflict|combat|help|bond)$/, anger: /^(?:conflict|combat|betray|solo|bond)$/, shame: /^(?:solo|bond|romance|help)$/, lust: /^(?:romance|bond|solo)$/, calm: /./ };
  var CLASH = { joy: /泣|涙|怖|震え|不安|痛|苦し|怯|大丈夫|発情|熱が|悲鳴|血/, grief: /笑い声|はしゃ|浮かれ|上機嫌|大笑い/, fear: /笑い声|はしゃ|浮かれ|上機嫌/, anger: /笑い合|微笑|照れ|はにか/, shame: /堂々|胸を張/, lust: /泣|涙|怖|悲鳴|血/, calm: /泣|涙|悲鳴/ };
  X.fits = function (m, cat, text) { return !!(FIT[m] && FIT[m].test(cat || 'solo') && !(CLASH[m] && CLASH[m].test(String(text || '')))); };
  /* 出来事の重み（engine.js の act() で、本命の補正の隣に掛ける） */
  X.weight = function (ctx, a, ev) {
    var e = a && a.emo;
    if (!e || !ev) return 1;
    var cat = ev.cat, f = 1;
    if (e.grief >= TH) { if (cat === 'romance') f *= 0.4; else if (cat === 'bond') f *= 1.3; else if (cat === 'help') f *= 1.15; }
    if (e.anger >= TH) { if (cat === 'conflict') f *= 1.6; else if (cat === 'combat') f *= 1.3; else if (cat === 'romance') f *= 0.8; }
    if (e.fear >= TH) { if (cat === 'solo') f *= 1.5; else if (cat === 'escape') f *= 1.3; else if (cat === 'conflict') f *= 0.8; }
    if (e.joy >= TH) { if (cat === 'romance') f *= 1.1; else if (cat === 'bond') f *= 1.1; else if (cat === 'conflict') f *= 0.85; }
    if (e.shame >= TH) { if (cat === 'solo') f *= 1.3; else if (cat === 'romance') f *= 0.8; }
    if (!safe() && e.lust >= TH && cat === 'romance') f *= 1.3;
    return f;
  };
  /* 悲しみの深い人（主役か相手）は、恋愛の出来事を起こさない */
  X.blockLove = function (ctx, actors) {
    var L0 = (actors || []).filter(Boolean);
    for (var i = 0; i < L0.length && i < 2; i++) if (L0[i].emo && L0[i].emo.grief >= LOVE_BLOCK) return true;
    return false;
  };
  /* 毎区切りの減衰 */
  function decay(c) {
    var e = c.emo;
    if (!e) return;
    var st = c.stress || 0, ag = c.tr && c.tr.aggr != null ? c.tr.aggr : 0.5;
    e.joy = clamp(e.joy * 0.86 - 1.5);
    e.grief = clamp(e.grief * 0.95 - 0.8);
    e.fear = clamp(e.fear * 0.82 - 2 + (st > 55 ? (st - 55) * 0.12 : 0));
    e.anger = clamp(e.anger * 0.72 - 2 + (st > 70 && ag > 0.55 ? 2 : 0));
    e.shame = clamp(e.shame * 0.85 - 1.5);
    e.lust = safe() ? 0 : clamp(e.lust * 0.62 - 3);
    recalm(e);
  }
  X.tick = function (ctx) { (ctx.chars || ctx.P || []).forEach(function (c) { if (c && c.alive !== false) decay(c); }); };

  /* ---------- 死：周りの人に悲しみと恐れ、手を下した人に恥じらいと怒り ---------- */
  function relOf(ctx, a, b) { return ctx.rel && ctx.rel[a.i] ? ctx.rel[a.i][b.i] : null; }
  X.onDeath = function (ctx, v, killer) {
    if (!v || v._emoDead) return;
    v._emoDead = true;
    var why = v.name + 'の死';
    (ctx.chars || []).forEach(function (o) {
      if (o === v || o.alive === false || o.out) return;
      var r = relOf(ctx, o, v), aff = r ? r.aff : 0, pf = ctx.pair ? ctx.pair(o, v) : {};
      var g = aff > 35 ? 20 + aff * 0.55 : aff > 10 ? 10 : 3;
      if (pf.couple) g += 18;
      if (o === killer) {
        var np = o.tr ? o.tr.np : 0.5;
        X.bump(ctx, o, { shame: 12 + np * 30, anger: 8 + (o.tr ? o.tr.aggr * 18 : 6), grief: aff > 30 ? g * 0.6 : 0 }, why);
        return;
      }
      X.bump(ctx, o, { grief: g, fear: killer ? 18 : 10, anger: killer && aff > 35 ? 12 + aff * 0.25 : 0 }, why);
    });
  };
  /* ---------- 記録ごと ---------- */
  var EXPL = /果て|達し|イ[っッくかきキ]|挿|喘|貫|腰を[振沈打揺使]|繋が|奥まで|突き上げ|絶頂|♡|射精|精液|ナカ|抱き潰|体を重ね|肌を重ね|\{(?:男性器|亀頭|女性器|陰核|ナカ|精液|愛液)\}/;
  function evBump(ctx, cat, A, text) {
    var a = A[0], b = A[1];
    if (!a) return;
    if (cat === 'romance') { X.bump(ctx, a, { joy: 12 }); if (b) X.bump(ctx, b, { joy: 10 }); }
    else if (cat === 'bond') { X.bump(ctx, a, { joy: 6 }); if (b) X.bump(ctx, b, { joy: 6 }); }
    else if (cat === 'help') { X.bump(ctx, a, { joy: 3 }); if (b) X.bump(ctx, b, { joy: 6, fear: -6 }); }
    else if (cat === 'conflict') { X.bump(ctx, a, { anger: 10 }); if (b) X.bump(ctx, b, { anger: 8, fear: 3 }); }
    else if (cat === 'combat') { X.bump(ctx, a, { anger: 8, fear: 4 }); if (b) X.bump(ctx, b, { fear: 12, anger: 4 }); }
    else if (cat === 'betray') { X.bump(ctx, a, { shame: 8 }); if (b) X.bump(ctx, b, { anger: 18, grief: 6 }); }
    if (!safe() && typeof text === 'string' && EXPL.test(text)) A.forEach(function (c) { X.bump(ctx, c, { lust: 22, joy: 4 }); });
  }
  var NOWORD = /^[「（『―…＠⁠⁢\s]/;
  X.onSay = function (ctx, o, e) {
    var kind = e.kind;
    if (kind === 'step') return;
    var A = (o.actors || []).filter(function (c) { return c && c.i != null && ctx.chars[c.i] === c; });
    if (ctx._emoWhy && kind !== 'phase') { e.why = (e.why ? e.why + '／' : '') + '気分：' + ctx._emoWhy.join('、'); ctx._emoWhy = null; }
    if (kind !== 'event' || /^(?:death|phase)$/.test(e.cat)) return;
    var a = A[0];
    /* 気分の一句：1区切りに1回まで・25% */
    if (a && a.alive !== false && typeof e.text === 'string' && e.text && !NOWORD.test(e.text) && ctx._emoWS !== ctx.stepIndex && a._emoT !== e.n && hash(ctx.seed + '|w|' + e.n) < 0.25) {
      var m = X.mood(a), w = '', U = ctx._emoUsed = ctx._emoUsed || {};
      if (m === 'calm' && !(a._emoPrev && a._emoPrev !== 'calm' && !a._emoRec)) m = '';
      if (m && X.fits(m, e.cat, e.text)) { w = X.word(a, ctx.seed + '|' + e.n, m, U); if (m === 'calm') a._emoRec = true; }
      if (w) { e.text = w + e.text; e.emoWord = true; ctx._emoWS = ctx.stepIndex; }
    }
    evBump(ctx, e.cat, A, e.text);
  };
  /* 区切りの終わり（snapshot() から）：関係の節目（付き合い始めた・別れた・浮気）を拾い、気分を記録し、減衰させる */
  X.step = function (ctx, h) {
    var C = ctx.chars, done = ctx._emoMk = ctx._emoMk || {}, from = ctx._emoA || 0;
    for (var n = from; n < ctx.log.length; n++) {
      var x = ctx.log[n];
      if (!x || !x.mark || done[n]) continue;
      done[n] = 1;
      var p = C[x.actors[0]], q = C[x.actors[1]];
      if (!p || !q) continue;
      x.mark.forEach(function (mk) {
        if (mk === 'couple') { X.bump(ctx, p, { joy: 32 }, '付き合い始めた'); X.bump(ctx, q, { joy: 32 }, '付き合い始めた'); }
        else if (mk === 'break') { X.bump(ctx, p, { grief: 22, anger: 12 }, '別れ'); X.bump(ctx, q, { grief: 22, anger: 12 }, '別れ'); }
        else if (mk === 'cheat' || mk === 'affair') {
          [p, q].forEach(function (y) {
            C.forEach(function (z) { if (z !== p && z !== q && z.alive !== false && ctx.pair(y, z).couple) X.bump(ctx, z, { anger: 32, grief: 18 }, y.name + 'の浮気'); });
          });
          if (mk === 'cheat') { X.bump(ctx, p, { shame: 12 }); X.bump(ctx, q, { shame: 12 }); }
          else X.bump(ctx, q, { fear: 25, anger: 10 });
        }
      });
    }
    ctx._emoA = ctx._emoB || 0; ctx._emoB = ctx.log.length;
    /* Ctx.kill を通らない死（ゾンビ化など）も、周りの悲しみにする */
    C.forEach(function (c) { if (c.alive === false && !c._emoDead) X.onDeath(ctx, c, c.killedBy != null ? C[c.killedBy] : null); });
    if (h) {
      var em = {};
      C.forEach(function (c) { var e = E(c); em[c.i] = BARS.map(function (k) { return Math.round(e[k]); }); });
      h.emo = em;
    }
    C.forEach(function (c) { var m = X.mood(c); if (m !== 'calm') c._emoRec = false; c._emoPrev = m; });
    X.tick(ctx);
  };
  /* 結果のまとめ（engine.js の finalize から）：最終値と、いちばん強かった気分 */
  function sumOf(c) {
    var e = E(c), o = {};
    KEYS.concat(['calm']).forEach(function (k) { if (k === 'lust' && safe()) return; o[k] = Math.round(e[k]); });
    return o;
  }
  X.summary = function (ctx, chars) {
    (ctx.chars || []).forEach(function (c, k) {
      var s = chars[k];
      if (!s) return;
      s.emo = sumOf(c);
      s.moodPeak = c._emoPk ? { mood: c._emoPk.mood, name: NAME[c._emoPk.mood], v: c._emoPk.v, step: c._emoPk.step, label: c._emoPk.label } : null;
      s.face = X.face(c);
      s.persona = s.persona || c.persona;
      s.caged = !!(c.flags && c.flags.caged != null);
      if (c.flags && c.flags.loss && c.flags.loss.who != null) s.lossOf = c.flags.loss.who;
    });
    if (HK.Epilogue && HK.Epilogue.summary) HK.Epilogue.summary(ctx, chars);
  };

  /* ---------- 物語型（HK.Story.say から。p.m には触らない） ---------- */
  var T_LOVE = /夜|恋|キス|告白|デート|誘い|口説|ときめ|求愛|触れ合い|甘い/, T_CONF = /故障|危機|感染|誘拐|喧嘩|ケンカ|口論|嫉妬|対立|裏切|襲|戦い|戦闘|罠|処刑|告発|疑い|事故|発狂/, T_HELP = /治療|看病|救出|助け|手当|守|仲直り|慰め|食事|会話|絆|団らん|晩酌/, T_DANGER = /故障|危機|感染|誘拐|襲|罠|事故|遭難|発狂|漂流|嵐|吹雪|停電|侵入|暴走/, T_DEAD = /遺体|死体|亡骸|殺され|悲鳴|死因|息絶え|帰らぬ人/;
  function storyCat(tag) { return T_LOVE.test(tag) ? 'romance' : T_CONF.test(tag) ? 'conflict' : T_HELP.test(tag) ? 'help' : 'solo'; }
  X.story = function (S, o) {
    if (!S || !S.P || !S.scen) return;
    var id = S.scen.id, P = S.P, emo = !!STORY_EMO[id];
    if (o.kind === 'step') {
      S._emoStep = (S._emoStep || 0) + 1;
      if (emo) { (S.emoHist = S.emoHist || []).push({ label: o.text, v: P.map(function (p) { var e = E(p); return BARS.map(function (k) { return Math.round(e[k]); }); }) }); P.forEach(function (p) { var m = X.mood(p); if (m !== 'calm') p._emoRec = false; p._emoPrev = m; }); X.tick(S); }
      return;
    }
    /* 死を見つけたら：その記録を覚えておき（最期の言葉を足す場所）、周りに悲しみと恐れ */
    P.forEach(function (p) {
      if (!p || p.alive !== false || p._emoDead) return;
      p._emoDead = true;
      p._emoDeathN = o.actors.indexOf(p.i) >= 0 ? o.n : null;
      if (emo) P.forEach(function (q) {
        if (!q || q === p || q.alive === false) return;
        var bd = S.bondFn ? S.bondFn(S, q, p) : 0;
        X.bump(S, q, { grief: 30 + (bd > 0 ? bd * 45 : 0), fear: 22 });
      });
    });
    if (!emo || typeof o.text !== 'string') return;
    /* 住人でない人の死・遺体の発見・悲鳴：その場の皆に恐れ */
    if (o.kind !== 'phase' && T_DEAD.test(o.text)) P.forEach(function (q) { if (q && q.alive !== false) X.bump(S, q, { fear: 24 }); });
    var a = P[o.actors[0]];
    if (!a || a.alive === false) return;
    var kind = o.kind || 'event';
    if (kind === 'event' && o.text && !NOWORD.test(o.text) && S._emoWS !== S._emoStep && a._emoT !== o.n) {
      var key = P.map(function (p) { return p.name; }).join(',') + '|' + o.n;
      if (hash(key + '|w') < 0.25) {
        var m = X.mood(a), w = '', U = S._emoUsed = S._emoUsed || {}, cat = storyCat(o.tag || '');
        if (m === 'calm' && !(a._emoPrev && a._emoPrev !== 'calm' && !a._emoRec)) m = '';
        if (m && X.fits(m, cat, o.text)) { w = X.word(a, key, m, U); if (m === 'calm') a._emoRec = true; }
        if (w) { o.text = w + o.text; o.emoWord = true; S._emoWS = S._emoStep; }
      }
    }
    var tag = o.tag || '', B = o.actors.slice(1).map(function (i) { return P[i]; }).filter(Boolean);
    if (T_LOVE.test(tag)) { [a].concat(B).forEach(function (p) { X.bump(S, p, kind === 'climax' && !safe() ? { lust: 22, joy: 6 } : { joy: 10 }); }); }
    else if (T_DANGER.test(tag)) { [a].concat(B).forEach(function (p) { X.bump(S, p, { fear: 14 }); }); }
    else if (T_CONF.test(tag)) { X.bump(S, a, { anger: 10 }); B.forEach(function (p) { X.bump(S, p, { anger: 6, fear: 6 }); }); }
    else if (T_HELP.test(tag)) { [a].concat(B).forEach(function (p) { X.bump(S, p, { joy: 5 }); }); }
  };
  X.storySummary = function (S, res) {
    if (!S || !S.P || !res || !res.heroes || !STORY_EMO[S.scen.id]) return;
    S.P.forEach(function (p, k) {
      var h = res.heroes[k];
      if (!h) return;
      h.emo = sumOf(p);
      h.moodPeak = p._emoPk ? { mood: p._emoPk.mood, name: NAME[p._emoPk.mood], v: p._emoPk.v, step: p._emoPk.step, label: p._emoPk.label } : null;
      h.face = X.face(p);
      h.persona = p.persona;
    });
    res.emoHist = S.emoHist || [];
  };

  /* ---------- 表示（view.js の住人カード・物語型のカード） ---------- */
  X.html = function (c) {
    var e = c && c.emo;
    if (!e) return '';
    var esc = HK.escape || function (s) { return String(s); };
    var fc = c.face || 'neutral', m = 'calm', bv = TH - 0.001;
    KEYS.forEach(function (k) { if (k === 'lust' && safe()) return; if (e[k] != null && e[k] > bv) { bv = e[k]; m = k; } });
    var bars = BARS.map(function (k) {
      var v = Math.max(0, Math.min(100, e[k] || 0));
      return '<span style="white-space:nowrap">' + NAME[k] + '</span><span style="display:block;height:6px;border-radius:3px;background:var(--line);overflow:hidden"><span style="display:block;height:100%;width:' + v + '%;background:var(' + BAR_COL[k] + ')"></span></span>';
    }).join('');
    var pk = c.moodPeak ? 'いちばん強かった気分：' + c.moodPeak.name + (c.moodPeak.label ? '（' + c.moodPeak.label + '）' : '') : '最後まで、大きく心が揺れることはなかった';
    return '<div class="emo" data-face="' + fc + '" style="display:flex;align-items:center;gap:10px;margin:6px 0 2px">' +
      '<span class="emoface" data-face="' + fc + '" title="' + esc('いまの気分：' + NAME[m]) + '" style="font-size:13px;white-space:nowrap;color:var(--muted)">' + FACE_SYM[fc] + '</span>' +
      '<span style="flex:1;display:grid;grid-template-columns:auto 1fr;gap:3px 8px;align-items:center;font-size:11px;color:var(--muted2,var(--muted));max-width:260px" aria-label="気分の終わりの値">' + bars + '</span></div>' +
      '<div class="sub">' + esc('気分：' + NAME[m] + '　' + pk) + '</div>';
  };

  /* ---------- エンジン型の Ctx を包む（engine.js を書き換えない） ---------- */
  var kill0 = Ctx.prototype.kill;
  Ctx.prototype.kill = function (v, killer) {
    var was = !!(v && v.alive);
    var r = kill0.apply(this, arguments);
    if (was && v.alive === false) X.onDeath(this, v, killer);
    return r;
  };
  var say0 = Ctx.prototype.say;
  Ctx.prototype.say = function (o) {
    var e = say0.apply(this, arguments);
    if (e && !e.skipped && o) { try { X.onSay(this, o, e); } catch (err) { /* 気分の処理に失敗しても記録は残す */ } }
    return e;
  };
})();
