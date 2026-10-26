/* 箱庭シミュレーター: 無人島 ― 教師と生徒・師弟・きょうだい（庇護／親友のよう）・恋愛相手の固定・兄貴分・関西弁の出来事
   起こりやすさはエゴグラムの数値と関係値で決め、関係は「誰と」、口調は「どう言うか」を決める */
(function () {
  'use strict';
  var HK = window.HK, RK = HK.RelKit, isl = HK.SCENARIOS.island;
  if (!isl || !RK) return;
  var EV = isl.events, L = RK.L, fill = RK.fill;
  function add(o) { EV.push(o); }
  function mm(a, b) { return { a: a.name, b: b ? b.name : '' }; }
  function up(c, id) { c.stats[id] = Math.min(5, (c.stats[id] || 3) + 1); }

  var T = {
    lesson: L('{a}は砂浜に枝で図を描いた。「いいか、{b}。北極星はこっち。ここが今日の授業だ｜いいか、{b}。北極星はこちらだ。ここが今日の授業だ｜いいですか、{b}。北極星はこちらです。ここが今日の授業です」|{a}は{b}に、木の枝で火を起こす方法を一から教えた。煙が上がったとき、{b}は子どものように声を上げた。|{a}は{b}に、食べられる貝と食べられない貝の見分け方を、黒板代わりの岩に書いて教えた。「テストに出すぞ｜＝｜テストに出しますよ」|{a}は{b}と並んで夕日を見ながら、潮の満ち引きの仕組みを話した。授業より、ずっと真剣に聞いてくれた。'),
    shield: L('嵐の夜、{a}は{b}を岩陰に押し込み、自分の背中で雨風を受け止めた。|崖から落ちかけた{b}の腕を、{a}は必死で掴んだ。手のひらの皮が剥けても、{a}は離さなかった。「生徒を落とす先生がいるか！｜＝｜生徒を落とす先生がいるものですか！」|{a}は高波から{b}をかばって、岩に肩を打ちつけた。「大丈夫だ。先生は頑丈なんだ｜＝｜大丈夫です。先生は頑丈なんです」'),
    grown: L('{a}は熱を出した{b}のために、ひとりで水場まで往復した。「先生、今日は休んでて｜先生、今日は休んでいてくれ｜先生、今日は休んでてください」|{a}は釣った魚を、真っ先に{b}の前に置いた。「先生に教わった通りにやったら、釣れた｜＝｜先生に教わった通りにやったら、釣れました」|{a}は{b}が眠っているあいだに、雨漏りする屋根を直しておいた。いつも守られてばかりだった。'),
    scold: L('{a}は勝手に沖まで泳ごうとした{b}を、浜から怒鳴りつけた。{b}は「授業じゃないんだから｜授業じゃないんだ｜授業じゃないんですから」と言い返した。|{a}は火の番をさぼった{b}を叱った。{b}はふてくされて、背中を向けたまま眠ったふりをした。'),
    rebelT: L('{a}は{b}に言い返した。「ここじゃ先生も生徒もないでしょ｜ここでは先生も生徒もないだろう｜ここでは先生も生徒もないでしょう」――{b}は少しだけ寂しそうに笑った。|{a}は{b}の言いつけを破って、ひとりで森の奥まで探検に行った。戻った{a}を、{b}は叱らずに迎えた。'),
    train: L('{a}は{b}の手を取って、銛の構えを直させた。「波を読め。魚は、波の切れ目に来る｜＝｜波を読んでください。魚は、波の切れ目に来ます」|{a}は{b}に、罠の仕掛け方を一度だけ見せた。二度目は、{b}にやらせた。|{a}は{b}の結んだロープを黙ってほどき、もう一度結ばせた。三度目で、{a}は小さく頷いた。|{a}は{b}に、星と風から天気を読む方法を教えた。「明日は荒れる。覚えておけ｜＝｜明日は荒れます。覚えておいてください」'),
    surpass: L('{a}が釣り上げた大物を見て、{b}は目を見開いた。「……もう、私より上手いな｜＝｜……もう、私より上手いですね」|嵐の前兆に先に気づいたのは、{a}だった。{b}は弟子の判断に黙って従い、その夜、誰も怪我をしなかった。'),
    protFood: L('{a}は自分の分の焼き魚を、黙って{b}の皿に移した。「腹減ってないから｜腹は減っていない｜お腹は空いていませんから」|{a}はやっと見つけた果物を、皮をむいて{b}に渡した。自分は、皮の裏をかじった。|{a}は{b}が寝ているあいだに、自分の水を{b}の分に足しておいた。'),
    protStorm: L('嵐の夜、{a}は{b}を毛布でくるみ、自分は外側で寝た。雨に打たれ続けた背中が、朝には冷えきっていた。|雷が鳴るたびに、{a}は{b}の肩を抱き寄せた。子どもの頃、雷が怖いと泣いていた弟妹だった。'),
    protRebel: L('{a}は{b}に言い返した。「もう子どもじゃない。魚くらい自分で獲れる｜＝｜もう子どもじゃありません。魚くらい自分で獲れます」――{b}は何も言えなかった。|{a}は{b}の制止を振り切って、ひとりで崖の上の鳥の巣を取りに行った。戻ってきた{a}を、{b}は泣きながら叱った。'),
    protCare: L('{a}は日焼けで真っ赤になった{b}の肩に、アロエを塗ってやった。「昔からすぐ赤くなるんだから｜昔から、すぐに赤くなるんだからな｜昔からすぐ赤くなるんですから」|{a}は{b}の髪についた砂を、丁寧に払った。{b}は「子ども扱いしないで｜子ども扱いするな｜子ども扱いしないでください」と言いながら、黙って払われていた。|{a}は眠れない{b}の背中を、子どもの頃のように一晩中さすり続けた。'),
    closeSignal: L('{a}と{b}は、子どもの頃に作った秘密の合図で、離れた浜から互いの無事を知らせ合った。|{a}と{b}は、砂浜に二人だけに分かる暗号を書いて伝言にした。'),
    closeRace: L('{a}と{b}は、どちらが多く貝を獲れるか競争した。結果は引き分けで、二人とも同じ数だと言い張った。|{a}と{b}は浜辺で相撲を取って、二人して波に倒れ込んだ。笑い声が、浜じゅうに響いた。|{a}と{b}は、どちらの寝床が上等か言い合い、最後には二人で一つの寝床を作った。'),
    closeMemory: L('{a}と{b}は、昔の家族旅行の海の話をして笑った。「あのときも、あなたが溺れかけたよね｜あのときも、あなたが溺れかけただろう｜あのときも、あなたが溺れかけましたよね」|{a}は{b}に、子どもの頃に隠したおやつの場所を白状した。{b}は「やっぱりあなたか｜＝｜やっぱりあなたでしたか」と吹き出した。'),
    lockRefuse: L('焚き火のそばで{b}が想いを口にしかけたとき、{a}はそっと首を振った。「ごめん。心に決めた人がいる｜すまない。心に決めた人がいる｜ごめんなさい。心に決めた人がいます」|{a}は{b}の差し出した花を、困ったように受け取った。「ありがとう。でも、気持ちには応えられない｜＝｜ありがとうございます。でも、気持ちには応えられません」|{a}は{b}の視線に気づいて、静かに言った。「……あの人以外は、考えられないんだ｜＝｜……あの人以外は、考えられないんです」'),
    lockDevote: L('{a}は一番いい貝を、迷わず{b}に渡した。|{a}は{b}のために、浜で一番きれいな貝殻を探して首飾りにした。|{a}は{b}が火の番をする夜は、決まって隣で眠った。|{a}は{b}の寝床にだけ、乾いた草を多めに敷いておいた。'),
    lockSeek: L('{a}は、ここにいない{b}のことばかり考えていた。島のどこかで、生きていると信じていた。|{a}は砂浜に{b}の名前を書いた。波が消すたびに、また書いた。'),
    anikiRally: L('{a}は浜に皆を集めて、役割を割り振った。「漁と薪と水汲み。全員で回せば、なんとかなる｜＝｜漁と薪と水汲みです。全員で回せば、なんとかなります」|{a}はしょげている{b}の背中を叩いた。「明日は私が大物を釣ってやる。期待しとけ｜明日は私が大物を釣ってやる。期待しておけ｜明日は私が大物を釣ってみせます。期待していてください」|{a}は一番きつい夜の見張りを、当たり前のように自分の番にした。|{a}は「全員で帰る｜＝｜全員で帰ります」と言い切った。根拠はなかった。それでも、皆は少しだけ顔を上げた。'),
    anikiAlone: L('皆が眠ったあと、{a}はひとりで波打ち際に座り、声を殺して泣いた。朝になると、いつもの顔で皆を起こした。|{a}は誰にも見られていないのを確かめてから、海に向かって大声で叫んだ。それから、何事もなかったように拠点へ戻った。'),
    kansai: L('{a}は焚き火を囲む皆に軽口を叩いた。「無人島で魚ばっか食べてたら、帰る頃にはエラ生えてるで」皆が吹き出した。|{a}は{b}の肩を叩いた。「しゃあない、なんとかなるて」――根拠はなかったが、{b}は少し笑った。|{a}は釣れなかった日も、「明日は大漁や」と言い切った。')
  };
  var MOURN = {
    protA: L('{a}は{b}が眠っていた寝床に、ひとりで横になった。まだ少しだけ、温かい気がした。|{a}は{b}の名前を海に向かって叫んだ。波の音しか、返ってこなかった。'),
    protB: L('{a}は{b}がいつもしてくれたように、焚き火の番をした。ずっと守られていたのだと、ひとりになって初めて知った。|{a}は{b}の口癖を真似てみた。「腹減ってないから｜腹は減っていない｜お腹は空いていませんから」――言いながら、涙が止まらなかった。'),
    sibclose: L('{a}は二人で作った秘密の合図を、誰もいない浜で一度だけ送った。返ってくる合図は、もうなかった。|{a}は{b}との競争の続きを、ひとりで砂浜に書いた。勝負は、ずっと引き分けのままだ。'),
    teacherA: L('{a}は{b}に教えた星を見上げた。教え子は、もうそれを見ることがない。|{a}は砂浜に{b}の名前を書いて、その横に花丸を描いた。'),
    teacherB: L('{a}は{b}に教わった方法で、ひとりで火を起こした。煙が目に染みたことにした。|{a}は{b}の最後の授業を、何度も思い出していた。'),
    mentorA: L('{a}は{b}の銛を、自分の銛の隣に立てた。弟子を失った師は、何も言わなかった。|{a}は{b}に最後まで「よくやった｜＝｜よくやりました」と言えなかったことを、波の音を聞きながら悔やんでいた。'),
    mentorB: L('{a}は{b}に教わった罠を、ひとりで仕掛けた。今度は一度で、うまくいった。見せたい相手は、もういなかった。|{a}は{b}の教えを守って、明日の天気を空から読んだ。'),
    lock: L('{a}は{b}のいない浜辺で、それでも生きていた。ほかの誰かを好きになる日は、きっと来ない。|{a}は{b}の名前を、誰にも聞こえない声で呼んだ。心に決めた人は、最後まで一人だけだった。')
  };

  function ev(id, cat, kindOk, gap, w, run) {
    add({ id: id, cat: cat, scope: 'pair',
      when: function (ctx, a, b) { return kindOk(ctx, a, b) && RK.cool(ctx, a, b, id, gap); },
      w: w,
      run: function (ctx, a, b) { RK.mark(ctx, a, b, id); return run(ctx, a, b); } });
  }
  function is(k) { return function (ctx, a, b) { return RK.kind(ctx, a, b) === k; }; }

  /* 教師と生徒 */
  ev('ir_lesson', 'help', is('teacherA'), 5, function (ctx, a, b) { return 0.6 + a.tr.np * 0.6 + a.tr.cp * 0.4; },
    function (ctx, a, b) { ctx.mod2(a, b, { trust: 4 }, { trust: 8, aff: 5 }); ctx.stress(b, -10); if (ctx.rng() < 0.35) up(b, ctx.pick(['fish', 'build', 'cook'])); return { text: fill(ctx.pick(T.lesson), mm(a, b)), why: a.name + 'は' + b.name + 'の先生（NP・CP。教え導こうとする）' }; });
  ev('ir_shield', 'help', function (ctx, a, b) { return RK.kind(ctx, a, b) === 'teacherA' && (ctx.env.storm > 40 || ctx.rng() < 0.3); }, 8, function (ctx, a) { return 0.4 + a.tr.np * 0.7 + a.tr.cp * 0.3 - a.tr.caution * 0.2; },
    function (ctx, a, b) { a.hp -= 6 + ctx.rng.int(8); ctx.mod(b, a, { aff: 12, trust: 14 }); return { text: fill(ctx.pick(T.shield), mm(a, b)), why: a.name + 'は生徒の' + b.name + 'をかばった（NP' + Math.round(a.eg.NP) + '）', mag: 18 }; });
  ev('ir_grown', 'help', function (ctx, a, b) { return RK.kind(ctx, a, b) === 'teacherB' && (b.hp < 75 || b.stress > 35); }, 7, function (ctx, a) { return 0.5 + a.tr.np * 0.6 + a.tr.fc * 0.2; },
    function (ctx, a, b) { b.hp = Math.min(100, b.hp + 6); ctx.mod2(a, b, { trust: 6 }, { aff: 10, trust: 12 }); return { text: fill(ctx.pick(T.grown), mm(a, b)), why: '生徒の' + a.name + 'が、先生の' + b.name + 'を支えた', mag: 16 }; });
  ev('ir_scold', 'conflict', function (ctx, a, b) { var k = RK.kind(ctx, a, b); return k === 'teacherA' || k === 'teacherB'; }, 8,
    function (ctx, a, b) { return RK.kind(ctx, a, b) === 'teacherA' ? a.tr.cp * 0.6 * (b.tr.impulse + b.tr.fc) : a.tr.fc * 0.4 + a.tr.impulse * 0.4 + a.stress / 150; },
    function (ctx, a, b) { var k = RK.kind(ctx, a, b); ctx.mod2(a, b, { ten: 8 }, { ten: 10, aff: -3 }); return { text: fill(ctx.pick(k === 'teacherA' ? T.scold : T.rebelT), mm(a, b)), why: k === 'teacherA' ? a.name + '（先生）のCPと、' + b.name + 'の衝動性がぶつかった' : '生徒の' + a.name + 'が反発した（FC・衝動性）' }; });
  /* 師弟：稽古で弟子の得意分野が伸びる */
  ev('ir_train', 'bond', is('mentorA'), 5, function (ctx, a) { return 0.6 + a.tr.cp * 0.5 + a.tr.a * 0.3; },
    function (ctx, a, b) { var sk = ctx.pick(['fish', 'hunt', 'build']); b.flags.trained = (b.flags.trained || 0) + 1; up(b, sk); ctx.mod2(a, b, { trust: 5 }, { trust: 8, aff: 4 }); return { text: fill(ctx.pick(T.train), mm(a, b)), why: '師の' + a.name + 'が、弟子の' + b.name + 'に稽古をつけた（CP・A）。' + b.name + 'の' + { fish: '釣り', hunt: '狩猟', build: '拠点づくり' }[sk] + 'が' + b.stats[sk] + 'になった' }; });
  ev('ir_surpass', 'help', function (ctx, a, b) { return RK.kind(ctx, a, b) === 'mentorB' && (a.flags.trained || 0) >= 2; }, 12, function (ctx, a) { return 0.5 + a.tr.np * 0.3 + a.tr.a * 0.3; },
    function (ctx, a, b) { ctx.mod(b, a, { trust: 15, aff: 8 }); ctx.food = (ctx.food || 0) + 6; return { text: fill(ctx.pick(T.surpass), mm(a, b)), why: '弟子の' + a.name + 'が、師の' + b.name + 'に並んだ（稽古 ' + a.flags.trained + '回）', mag: 22 }; });
  /* きょうだい（庇護） */
  ev('ir_pfood', 'help', function (ctx, a, b) { return RK.kind(ctx, a, b) === 'protA' && (ctx.food < 25 || b.hp < 70); }, 4, function (ctx, a) { return 0.8 + a.tr.np * 0.8; },
    function (ctx, a, b) { a.hp -= 4; b.hp = Math.min(100, b.hp + 5); ctx.mod(b, a, { aff: 8, trust: 6 }); return { text: fill(ctx.pick(T.protFood), mm(a, b)), why: a.name + 'は弟妹の' + b.name + 'を我が子のように守る（NP' + Math.round(a.eg.NP) + '）' }; });
  ev('ir_pstorm', 'help', function (ctx, a, b) { return RK.kind(ctx, a, b) === 'protA' && ctx.env.storm > 30; }, 7, function (ctx, a) { return 0.5 + a.tr.np * 0.6; },
    function (ctx, a, b) { a.hp -= 3; ctx.stress(b, -12); ctx.mod(b, a, { aff: 8 }); return { text: fill(ctx.pick(T.protStorm), mm(a, b)), why: a.name + 'の、弟妹への庇護（NP）' }; });
  ev('ir_prebel', 'conflict', is('protB'), 10, function (ctx, a) { return a.tr.fc * 0.5 + a.tr.cp * 0.3 + a.tr.impulse * 0.3 - a.tr.ac * 0.3; },
    function (ctx, a, b) { ctx.mod2(a, b, { ten: 8 }, { ten: 6 }); ctx.stress(b, 10); a.flags.grownUp = true; return { text: fill(ctx.pick(T.protRebel), mm(a, b)), why: '弟妹の' + a.name + 'が、' + b.name + 'の庇護に反発した（FC・CP）' }; });
  ev('ir_pcare', 'help', is('protA'), 4, function (ctx, a, b) { return 0.5 + a.tr.np * 0.6 + b.stress / 100; },
    function (ctx, a, b) { ctx.stress(b, -12); ctx.mod(b, a, { aff: 5 }); return { text: fill(ctx.pick(T.protCare), mm(a, b)), why: a.name + 'の、弟妹への世話焼き（NP）' }; });
  /* きょうだい（親友のよう） */
  ev('ir_csig', 'bond', is('sibclose'), 5, function (ctx, a) { return 0.6 + a.tr.fc * 0.5; },
    function (ctx, a, b) { ctx.mod2(a, b, { trust: 8, aff: 4 }, { trust: 8, aff: 4 }); ctx.stress(a, -6); ctx.stress(b, -6); var r = ctx.rng(); return { text: fill(ctx.pick(r < 0.35 ? T.closeSignal : r < 0.7 ? T.closeRace : T.closeMemory), mm(a, b)), why: '親友のようなきょうだい（FC）' }; });
  /* 恋愛相手の固定 */
  add({ id: 'ir_lrefuse', cat: 'romance', scope: 'pair',
    when: function (ctx, a, b) { return RK.locked(a) && !RK.lockedTo(a, b) && ctx.R(b, a).att > 35 && !ctx.pair(a, b).lockRef; },
    w: function (ctx, a, b) { return 0.8 + ctx.R(b, a).att / 60; },
    run: function (ctx, a, b) { ctx.pair(a, b).lockRef = true; ctx.mod(b, a, { att: -10, ten: 6 }); ctx.stress(b, 12); var t = HK.lockNames(ctx.chars, a); return { text: fill(ctx.pick(T.lockRefuse), mm(a, b)), why: a.name + 'は恋愛の相手を' + (t ? t + 'と' : '') + '決めている。' + b.name + 'の想い（惹かれ ' + Math.round(ctx.R(b, a).att) + '）には応えない' }; } });
  ev('ir_ldevote', 'romance', function (ctx, a, b) { return RK.lockedTo(a, b); }, 5, function (ctx, a, b) { return 0.8 + a.tr.np * 0.4 + a.tr.ac * 0.3 + ctx.R(a, b).att / 80; },
    function (ctx, a, b) { ctx.mod(a, b, { att: 6, aff: 4 }); ctx.mod(b, a, { aff: 6, att: 3 }); return { text: fill(ctx.pick(T.lockDevote), mm(a, b)), why: a.name + 'の想う相手は、' + (HK.locks(a).length > 1 ? b.name + 'たち（決めた人）' : b.name + 'ただ一人') }; });
  /* 兄貴・姉貴分／関西弁 */
  ev('ir_aniki', 'help', function (ctx, a) { return RK.tone(a) === 'aniki'; }, 5, function (ctx, a, b) { return 0.6 + a.tr.np * 0.5 + a.tr.lead * 0.4 + b.stress / 100; },
    function (ctx, a, b) { ctx.others(a).forEach(function (o) { ctx.stress(o, -5); ctx.mod(o, a, { trust: 4 }); }); return { text: fill(ctx.pick(T.anikiRally), mm(a, b)), why: a.name + 'の面倒見のよさ（NP・CP。兄貴・姉貴分）' }; });
  add({ id: 'ir_anikiAlone', cat: 'solo', scope: 'solo',
    when: function (ctx, a) { return RK.tone(a) === 'aniki' && a.stress > 45 && !a.flags.anikiCry; },
    w: function (ctx, a) { return 0.6 + a.stress / 100; },
    run: function (ctx, a) { a.flags.anikiCry = true; ctx.stress(a, -15); return { text: fill(ctx.pick(T.anikiAlone), mm(a)), why: '頼られる側の' + a.name + 'にも、限界はある（ストレス ' + Math.round(a.stress) + '）' }; } });
  ev('ir_kansai', 'bond', function (ctx, a) { return RK.tone(a) === 'kansai'; }, 6, function (ctx, a, b) { return 0.3 + a.tr.fc * 0.6 + b.stress / 120; },
    function (ctx, a, b) { ctx.stress(b, -8); ctx.mod(b, a, { aff: 4 }); return { text: fill(ctx.pick(T.kansai), mm(a, b)), why: a.name + 'の軽口（FC）' }; });

  /* 親友のようなきょうだい：守るのはお互いさま（借りはすぐ返す） */
  var GUARD = {
    help: L('{a}は{b}の様子がおかしいのに気づいて、黙って隣に座った。「顔に出てる。半分よこせ｜顔に出ている。半分よこせ｜顔に出ていますよ。半分ください」――荷物の話なのか、気持ちの話なのか、{b}には分かっていた。|{a}は{b}の分の見張りを代わった。「次はあなたの番ね｜次はあなたの番だ｜次はあなたの番ですよ」|{a}はふらつく{b}に肩を貸した。「重い｜＝｜重いです」{b}は言い返した。「うるさい｜＝｜うるさいです」――いつものやりとりだった。|{a}は{b}の手当てをしながら言った。「これで貸し一つ｜これで貸し一つだ｜これで貸し一つですね」'),
    repay: L('今度は{a}が、弱った{b}に肩を貸した。「この前の借り。これでチャラな｜この前の借りだ。これで帳消しだ｜この前の借りです。これでチャラですね」|{a}は{b}の分まで働いた。「貸し借りなしだろ｜貸し借りなしだろう｜貸し借りなしでしょう」――{b}は小さく笑った。|{a}は{b}の隣に座った。前に、{b}がそうしてくれたように。')
  };
  add({ id: 'ir_cguard', cat: 'help', scope: 'pair',
    when: function (ctx, a, b) { return RK.kind(ctx, a, b) === 'sibclose' && (b.hp < 85 || b.stress > 25 || ctx.food < 20) && RK.cool(ctx, a, b, 'cguard', 4); },
    w: function (ctx, a, b) { return 0.8 + a.tr.np * 0.4 + a.tr.fc * 0.2 + (ctx.pair(a, b).owe === a.i ? 2 : 0); },
    run: function (ctx, a, b) {
      RK.mark(ctx, a, b, 'cguard');
      var pf = ctx.pair(a, b), repay = pf.owe === a.i;
      pf.owe = repay ? null : b.i;
      b.hp = Math.min(100, b.hp + 5); ctx.stress(b, -10);
      ctx.mod2(a, b, { trust: 8, aff: 5 }, { trust: 8, aff: 5 });
      return { text: fill(ctx.pick(repay ? GUARD.repay : GUARD.help), { a: a.name, b: b.name }), why: repay ? a.name + 'が' + b.name + 'に借りを返した（親友のようなきょうだいは、守り合う）' : a.name + 'が' + b.name + 'を支えた（今度は' + b.name + 'が返す番）' };
    } });
  RK.mourn(isl, MOURN, 'ir');
})();
