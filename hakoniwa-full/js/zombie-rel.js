/* 箱庭シミュレーター: ゾンビの街 ― 教師と生徒・師弟・きょうだい（庇護／親友のよう）・恋愛相手の固定・兄貴分・関西弁の出来事
   起こりやすさはエゴグラムの数値（NP・CP・AC など）と関係値で決め、関係は「誰と」、口調は「どう言うか」を決める */
(function () {
  'use strict';
  var HK = window.HK, Z = HK.ZB, RK = HK.RelKit;
  if (!Z || !Z.scen || !RK) return;
  var EV = Z.scen.events, L = RK.L, fill = RK.fill;
  function m2(a, b, ctx) { return { a: a.name, b: b.name, area: ctx.zb.A[a.z.area].name, w: a.weapon ? a.weapon.name : '素手' }; }
  function danger(ctx, c) { return ctx.zb.A[c.z.area].z; }
  function add(o) { HK.addTo(EV, o); }   /* 足す順は HK.addTo で元のファイルの順に保つ（敵視・執着・喪失の組み込みが、分割読み込みでは後から足すため） */

  var T = {
    /* 教師と生徒 */
    lesson: L('{a}は崩れた教室の黒板に、チョークで逃げ道を描いた。「いいか、{b}。ここが今日の授業だ｜＝｜いいですか、{b}。ここが今日の授業です」|{a}は{b}の隣に座り、いつもの口調で言った。「パニックになったら、深呼吸を三回。それから考える。テストに出るぞ｜＝｜パニックになったら、深呼吸を三回。それから考えます。テストに出ますよ」|{a}は{b}に、止血の仕方を一つずつ教えた。教壇に立っていたときと、同じ声だった。|{a}は{b}のノートの切れ端に、安全な道順を書いて渡した。「なくすなよ。宿題より大事だ｜なくすな。宿題より大事だ｜なくさないでください。宿題より大事です」'),
    shield: L('ゾンビが窓を破った瞬間、{a}は{b}を背中にかばった。腕を引っかかれても、{a}は一歩も退かなかった。「先生の後ろにいて！｜先生の後ろにいろ！｜先生の後ろにいてください！」|{a}は{b}の手を引いて走り、自分が最後に扉をくぐった。閉まる直前、{a}の肩を何かがかすめた。|{a}は群れの前に立ちはだかった。「生徒には指一本触れさせない｜＝｜生徒には指一本触れさせません」――{w}を握る手が、震えていた。'),
    grown: L('{b}が足を挫いたとき、{a}は迷わず{b}を背負った。「先生、軽いね｜先生、軽いな｜先生、軽いですね」――{b}は「重いって言って｜重いと言え｜重いと言ってください」と笑った。|{a}は{b}の背後に迫るゾンビを、震える手で突き倒した。「先生、今度は私の番だよ｜先生、今度は私の番だ｜先生、今度は私の番です」|{a}は眠っている{b}に毛布をかけた。いつも守られてばかりだった。今夜くらいは、見張りを代わりたかった。'),
    scold: L('{a}は勝手に外へ出ようとした{b}の腕を掴んだ。「死にたいのか！｜＝｜死にたいんですか！」――{b}は振り払った。「先生面すんなよ、もう学校なんてないんだ｜先生面をするな、もう学校などないんだ｜先生面しないでください、もう学校なんてないんです」|{a}は{b}を叱った。{b}は唇を噛んで黙り込み、しばらく{a}と口をきかなかった。'),
    rebelT: L('{a}は{b}の指示を無視して、ひとりで物資を取りに行った。戻った{a}を、{b}は叱らずに抱きしめた。|{a}は{b}に言い返した。「先生だって怖いくせに｜先生だって怖いのだろう｜先生だって、怖いんでしょう」――{b}は否定しなかった。'),
    /* 師弟 */
    train: L('{a}は{b}に{w}の握り方を直させた。「力で振るな。体重で振れ｜＝｜力で振らないでください。体重で振ってください」――三度目で、{b}の一撃は空気を裂いた。|{a}は{b}に、足音を殺す歩き方を教えた。{b}がうまくできると、{a}は何も言わずに頷いた。それが一番の褒め言葉だった。|{a}は{b}と背中合わせに立ち、群れの動きを読む稽古をつけた。「目で追うな。気配で数えろ｜＝｜目で追わないでください。気配で数えてください」|{a}は{b}の構えを一瞥して、「まだ甘い｜＝｜まだ甘いです」とだけ言った。{b}は悔しそうに、もう一度構え直した。'),
    surpass: L('{b}が三体に囲まれたとき、割って入ったのは{a}だった。教わった通りの、無駄のない一撃だった。{b}は小さく笑った。「……教えることは、もうないか｜＝｜……教えることは、もうありませんか」|{a}は{b}より先に危険に気づき、{b}の腕を引いた。一瞬遅れて、{b}のいた場所にゾンビが倒れ込んだ。{b}は弟子の背中を、黙って見つめた。'),
    mentorLast: L('{a}は咬み跡を見せずに、{b}に{w}を渡した。「これからは、あなたが誰かを守る番だ｜＝｜これからは、あなたが誰かを守る番です」|{a}は{b}を呼んで、最後の稽古をつけた。{b}が一本取ったとき、{a}は満足そうに目を閉じた。|{a}は{b}に言った。「振り返るな。それが最後の教えだ｜＝｜振り返らないでください。それが最後の教えです」――{b}はまだ、その意味を知らなかった。'),
    /* きょうだい（庇護） */
    protFood: L('{a}は自分の分の缶詰を、黙って{b}の前に置いた。「腹減ってないから｜腹は減っていない｜お腹は空いていませんから」――腹の虫が鳴ったのは、そのすぐあとだった。|{a}は乾パンを二つに割って、大きい方を{b}に渡した。昔から、ずっとそうしてきた。|{a}は{b}が寝ているあいだに、自分の水を{b}のボトルに移した。'),
    protDecoy: L('{a}は{b}を物置に押し込み、外から扉を閉めた。「十数えたら逃げろ。絶対に、振り返るな｜＝｜十数えたら逃げてください。絶対に、振り返らないでください」――{a}はわざと大きな音を立てて、群れを引きつけた。|{a}は{b}の頭を撫でて、「すぐ戻る｜＝｜すぐ戻ります」と言った。それから、ゾンビのいる方へ走っていった。|群れが迫ったとき、{a}は迷わず{b}の前に出た。{sib:a→b}を守るのは、自分の役目だった。'),
    protRebel: L('{a}は{b}に言い返した。「もう子どもじゃない。自分のことは自分で決める｜もう子どもではない。自分のことは自分で決める｜もう子どもじゃありません。自分のことは自分で決めます」――{b}は言葉を失った。|{a}は{b}の制止を振り切って、ひとりで偵察に出た。戻ってきた{a}を、{b}は泣きながら叱った。|{a}は{b}の過保護に耐えきれず、声を荒げた。「守られてばっかりじゃ、生き残れないんだよ！｜守られてばかりでは、生き残れないんだ！｜守られてばかりじゃ、生き残れないんです！」'),
    protHide: L('{a}は{b}の腕の咬み跡を見て、自分の包帯で黙って隠した。「誰にも言うな。……どうにかする｜＝｜誰にも言わないでください。……どうにかします」|{a}は{b}の熱を確かめて、震える声で言った。「大丈夫。ただの風邪だ｜大丈夫だ。ただの風邪だ｜大丈夫です。ただの風邪です」――嘘だと、二人とも分かっていた。'),
    protCare: L('{a}は眠れない{b}の背中を、子どもの頃のように一晩中さすり続けた。|{a}は{b}の髪についた血を、残り少ない水で丁寧に拭った。「ほら、きれいになった｜＝｜ほら、きれいになりました」|{a}は{b}の靴紐が解けているのに気づいて、しゃがんで結び直した。{b}は「子ども扱いすんな｜子ども扱いするな｜子ども扱いしないでください」と言いながら、黙って結ばれていた。'),
    /* きょうだい（親友のよう） */
    closeSignal: L('{a}と{b}は、子どもの頃に決めた口笛の合図を思い出した。短く二回で「来い」、長く一回で「逃げろ」。|{a}と{b}は、壁越しに指で暗号を叩き合った。家族にしか分からない、くだらない遊びの名残だった。'),
    closeBack: L('{a}と{b}は背中合わせになって、群れを迎え撃った。互いの呼吸だけで、どちらが右を受け持つか分かった。|{a}が叫ぶより先に、{b}は動いていた。生まれたときから一緒にいる相手だった。'),
    closeMemory: L('{a}と{b}は、昔の家族旅行の話をして笑った。笑い声が大きすぎて、二人で慌てて口を押さえた。|{a}は{b}に、子どもの頃に隠したおやつの場所を白状した。{b}は「やっぱりあなたか｜やはりあなたか｜やっぱりあなたでしたか」と吹き出した。|{a}と{b}は、どうでもいいことで言い合いをして、五分後には肩を並べて眠っていた。'),
    /* 恋愛相手の固定 */
    lockRefuse: L('{b}が想いを口にしかけたとき、{a}はそっと首を振った。「ごめん。心に決めた人がいる｜すまない。心に決めた人がいる｜ごめんなさい。心に決めた人がいます」|{a}は{b}の差し出した手を、優しく、けれどはっきりと離した。「その気持ちには、応えられない｜＝｜その気持ちには、応えられません」|{b}の視線に気づいて、{a}は困ったように笑った。「……あの人以外は、考えられないんだ｜……あの人以外は、考えられない｜……あの人以外は、考えられないんです」'),
    lockDevote: L('{a}はどんなに疲れていても、{b}の見張りの時間だけは必ず起きていた。|{a}は見つけたチョコレートを、自分では一口も食べずに{b}に渡した。|{a}は{b}の名前を、眠る前に一度だけ小さく呼ぶのが癖になっていた。|{a}は{b}の後ろを、いつも半歩だけ遅れて歩いた。何かあったら、すぐに盾になれるように。'),
    lockSeek: L('{a}は、ここにいない{b}のことばかり考えていた。生きていると、信じるしかなかった。|{a}は壁に、{b}だけに分かる印を刻んで回った。いつか、{b}がこれを見つけてくれるように。|{a}は{b}の名前を書いた紙を、お守りのように胸ポケットに入れていた。'),
    /* 兄貴・姉貴分 */
    anikiRally: L('{a}はみんなの顔を見回して、手を叩いた。「よし、腹が減っては戦えない。飯にするぞ」――張り詰めた空気が、少しだけ緩んだ。|{a}は泣いている{b}の頭をくしゃくしゃにした。「泣いていい。そのかわり、泣き終わったら一緒に行くぞ」|{a}は一番危ない見張りの時間を、当たり前のように自分の番にした。|{a}は「全員で帰る。一人も置いていかない」と言い切った。根拠はなかった。それでも、皆は少しだけ顔を上げた。'),
    anikiAlone: L('皆が眠ったあと、{a}はひとりで外に出て、声を殺して泣いた。朝になると、いつもの顔に戻っていた。|{a}は誰にも見られていないのを確かめてから、震える手を握りしめた。「……しっかりしろ。頼られてるんだ」'),
    /* 関西弁 */
    kansai: L('{a}の軽口が、張り詰めた空気を少しだけ緩めた。「こんなん、帰ったら一生の笑い話にしたるわ」|{a}は{b}の肩を叩いた。「しゃあない、なんとかなるて」――根拠はなかったが、{b}は少し笑った。|{a}は缶詰の残りを数えて、「まあ、なんとかなるやろ」と言った。誰よりも先に、その言葉を信じようとしていた。')
  };
  var MOURN = {
    protA: L('{a}は{b}の遺した靴を抱きしめて、声を上げずに泣いた。守ると、約束していたのに。|{a}は{b}の名前を何度も呼んだ。返事は、もうなかった。我が子のように育ててきた、たった一人の{sib:a→b}だった。'),
    protB: L('{a}は{b}がいつも背負っていたリュックを、自分で背負った。重かった。ずっと、こんなに重いものを背負わせていたのだと知った。|{a}は{b}の口癖を真似してみた。「腹減ってないから｜腹は減っていない｜お腹は空いていませんから」――言いながら、涙が止まらなかった。'),
    sibclose: L('{a}は二人で決めた口笛を、誰もいない夜に一度だけ吹いた。返ってくる音は、もうなかった。|{a}は{b}と最後に言い合った、くだらない喧嘩の内容を思い出した。謝りそびれたままだった。'),
    teacherA: L('{a}は{b}の名前を、出席簿の最後に書き足した。そこに丸をつけることは、もう二度とない。|{a}は{b}に教えた逃げ道を、ひとりで何度もなぞった。教えたことは、間違っていなかったはずなのに。'),
    teacherB: L('{a}は{b}に教わった通りに、深呼吸を三回した。それから、ひとりで考えた。|{a}は{b}が書いてくれた道順のメモを、ぼろぼろになるまで握りしめていた。'),
    mentorA: L('{a}は{b}の武器を拾い上げ、手入れをしてから、自分の横に置いた。弟子を失った師は、何も言わなかった。|{a}は{b}に最後まで「よくやった」と言えなかったことを、ずっと悔やんでいた。'),
    mentorB: L('{a}は{b}の最後の教えを思い出して、振り返らずに歩き出した。泣くのは、全部終わってからだと決めた。|{a}は{b}の構えを真似て、群れの前に立った。師の背中は、もう前にない。それでも、教えはここにある。'),
    lock: L('{a}は{b}のいない世界で、それでも息をしていた。ほかの誰かを好きになる日は、きっと来ない。|{a}は{b}の名前を、誰にも聞こえない声で呼んだ。心に決めた人は、最後まで一人だけだった。')
  };

  /* ---------- 教師と生徒 ---------- */
  add({ id: 'zr_lesson', cat: 'help', scope: 'pair',
    when: function (ctx, a, b) { return RK.kind(ctx, a, b) === 'teacherA' && RK.cool(ctx, a, b, 'lesson', 5); },
    w: function (ctx, a, b) { return 0.6 + a.tr.np * 0.6 + a.tr.cp * 0.4 + b.stress / 120; },
    run: function (ctx, a, b) { RK.mark(ctx, a, b, 'lesson'); ctx.mod2(a, b, { trust: 4 }, { trust: 8, aff: 5 }); ctx.stress(b, -10); return { text: fill(ctx.pick(T.lesson), m2(a, b, ctx)), why: a.name + 'は' + b.name + 'の先生（NP・CP。教え導こうとする）' }; } });
  add({ id: 'zr_shield', cat: 'help', scope: 'pair',
    when: function (ctx, a, b) { return RK.kind(ctx, a, b) === 'teacherA' && danger(ctx, a) > 35 && RK.cool(ctx, a, b, 'shield', 8); },
    w: function (ctx, a, b) { return 0.4 + a.tr.np * 0.7 + a.tr.cp * 0.3 - a.tr.caution * 0.2; },
    run: function (ctx, a, b) { RK.mark(ctx, a, b, 'shield'); a.hp -= 8 + ctx.rng.int(10); ctx.mod(b, a, { aff: 12, trust: 14 }); ctx.stress(b, 8); return { text: fill(ctx.pick(T.shield), m2(a, b, ctx)), why: a.name + 'は生徒の' + b.name + 'をかばった（NP' + Math.round(a.eg.NP) + '）', mag: 18 }; } });
  add({ id: 'zr_grown', cat: 'help', scope: 'pair',
    when: function (ctx, a, b) { return RK.kind(ctx, a, b) === 'teacherB' && (b.hp < 70 || b.stress > 40) && RK.cool(ctx, a, b, 'grown', 7); },
    w: function (ctx, a, b) { return 0.5 + a.tr.np * 0.6 + a.tr.fc * 0.2; },
    run: function (ctx, a, b) { RK.mark(ctx, a, b, 'grown'); ctx.mod2(a, b, { trust: 6 }, { aff: 10, trust: 12 }); ctx.stress(b, -8); return { text: fill(ctx.pick(T.grown), m2(a, b, ctx)), why: '生徒の' + a.name + 'が、先生の' + b.name + 'を支えた', mag: 16 }; } });
  add({ id: 'zr_scold', cat: 'conflict', scope: 'pair',
    when: function (ctx, a, b) { var k = RK.kind(ctx, a, b); return (k === 'teacherA' || k === 'teacherB') && RK.cool(ctx, a, b, 'scold', 8); },
    w: function (ctx, a, b) { var k = RK.kind(ctx, a, b); return k === 'teacherA' ? a.tr.cp * 0.6 * (b.tr.impulse + b.tr.fc) : a.tr.fc * 0.4 + a.tr.impulse * 0.4 + a.stress / 150; },
    run: function (ctx, a, b) { RK.mark(ctx, a, b, 'scold'); var k = RK.kind(ctx, a, b); ctx.mod2(a, b, { ten: 8 }, { ten: 10, aff: -3 }); return { text: fill(ctx.pick(k === 'teacherA' ? T.scold : T.rebelT), m2(a, b, ctx)), why: k === 'teacherA' ? a.name + '（先生）のCPと、' + b.name + 'の衝動性がぶつかった' : '生徒の' + a.name + 'が反発した（FC・衝動性）' }; } });

  /* ---------- 師弟 ---------- */
  add({ id: 'zr_train', cat: 'bond', scope: 'pair',
    when: function (ctx, a, b) { return RK.kind(ctx, a, b) === 'mentorA' && RK.cool(ctx, a, b, 'train', 5); },
    w: function (ctx, a, b) { return 0.6 + a.tr.cp * 0.5 + a.tr.a * 0.3 + b.tr.ac * 0.2; },
    run: function (ctx, a, b) { RK.mark(ctx, a, b, 'train'); ctx.mod2(a, b, { trust: 5 }, { trust: 8, aff: 4 }); b.flags.trained = (b.flags.trained || 0) + 1; if (b.weapon && b.flags.trained === 2) b.weapon = Object.assign({}, b.weapon, { pow: b.weapon.pow + 2 }); return { text: fill(ctx.pick(T.train), m2(a, b, ctx)), why: '師の' + a.name + 'が、弟子の' + b.name + 'に稽古をつけた（CP・A）' + (b.flags.trained === 2 ? '。' + b.name + 'の腕が上がった（武器の威力＋2）' : '') }; } });
  add({ id: 'zr_surpass', cat: 'help', scope: 'pair',
    when: function (ctx, a, b) { return RK.kind(ctx, a, b) === 'mentorB' && (a.flags.trained || 0) >= 1 && danger(ctx, a) > 30 && RK.cool(ctx, a, b, 'surpass', 10); },
    w: function (ctx, a, b) { return 0.4 + a.tr.np * 0.4 + a.tr.aggr * 0.3 + (a.flags.trained || 0) * 0.2; },
    run: function (ctx, a, b) { RK.mark(ctx, a, b, 'surpass'); ctx.mod(b, a, { trust: 15, aff: 8 }); ctx.mod(a, b, { aff: 6 }); return { text: fill(ctx.pick(T.surpass), { a: a.name, b: b.name }), why: '弟子の' + a.name + 'が、師の' + b.name + 'を救った（稽古 ' + a.flags.trained + '回）', mag: 22 }; } });
  add({ id: 'zr_mlast', cat: 'help', scope: 'pair',
    when: function (ctx, a, b) { return RK.kind(ctx, a, b) === 'mentorA' && a.z.bitten && a.z.aware && !a.flags.mlast; },
    w: function () { return 3; },
    run: function (ctx, a, b) { a.flags.mlast = true; if (a.weapon && (!b.weapon || a.weapon.pow > b.weapon.pow)) { var wp = b.weapon; b.weapon = a.weapon; a.weapon = wp; } ctx.mod(b, a, { trust: 10, aff: 8 }); ctx.stress(b, 15); return { text: fill(ctx.pick(T.mentorLast), m2(a, b, ctx)), why: '咬まれた師の' + a.name + 'が、弟子の' + b.name + 'に最後の教えを遺した', mag: 30 }; } });

  /* ---------- きょうだい（庇護） ---------- */
  add({ id: 'zr_pfood', cat: 'help', scope: 'pair',
    when: function (ctx, a, b) { return RK.kind(ctx, a, b) === 'protA' && a.z.food > 0 && b.z.food <= 1 && RK.cool(ctx, a, b, 'pfood', 4); },
    w: function (ctx, a, b) { return 0.8 + a.tr.np * 0.8; },
    run: function (ctx, a, b) { RK.mark(ctx, a, b, 'pfood'); a.z.food--; b.z.food++; a.hp -= 3; ctx.mod(b, a, { aff: 8, trust: 6 }); return { text: fill(ctx.pick(T.protFood), m2(a, b, ctx)), why: a.name + 'は{sib:a→b}の' + b.name + 'を我が子のように守る（NP' + Math.round(a.eg.NP) + '）' }; } });
  add({ id: 'zr_pdecoy', cat: 'help', scope: 'pair',
    when: function (ctx, a, b) { return RK.kind(ctx, a, b) === 'protA' && danger(ctx, a) > 50 && !a.flags.decoy; },
    w: function (ctx, a, b) { return 0.3 + a.tr.np * 0.6 + a.tr.cp * 0.2 - a.tr.caution * 0.3; },
    run: function (ctx, a, b) { a.flags.decoy = true; a.hp -= 15 + ctx.rng.int(15); ctx.mod(b, a, { aff: 14, trust: 10 }); ctx.stress(b, 25); if (a.hp <= 0) ctx.kill(a, null, (HK.Sib ? HK.Sib.word(a, b, 'plain', ctx) : '弟妹') + 'の' + b.name + 'を逃がすため、群れを引きつけて'); return { text: fill(ctx.pick(T.protDecoy), m2(a, b, ctx)), why: a.name + 'は{sib:a→b}の' + b.name + 'の囮になった（危険度 ' + Math.round(danger(ctx, a)) + '）', mag: 30 }; } });
  add({ id: 'zr_prebel', cat: 'conflict', scope: 'pair',
    when: function (ctx, a, b) { return RK.kind(ctx, a, b) === 'protB' && RK.cool(ctx, a, b, 'prebel', 10); },
    w: function (ctx, a, b) { return a.tr.fc * 0.5 + a.tr.cp * 0.3 + a.tr.impulse * 0.3 - a.tr.ac * 0.3; },
    run: function (ctx, a, b) { RK.mark(ctx, a, b, 'prebel'); ctx.mod2(a, b, { ten: 8 }, { ten: 6 }); ctx.stress(b, 10); a.flags.grownUp = true; return { text: fill(ctx.pick(T.protRebel), m2(a, b, ctx)), why: '{sib:b→a}の' + a.name + 'が、' + b.name + 'の庇護に反発した（FC・CP）' }; } });
  add({ id: 'zr_phide', cat: 'help', scope: 'pair',
    when: function (ctx, a, b) { return RK.kind(ctx, a, b) === 'protA' && b.z.bitten && !b.flags.phid; },
    w: function (ctx, a, b) { return 1 + a.tr.np * 0.8 - a.tr.honesty * 0.4; },
    run: function (ctx, a, b) { b.flags.phid = true; ctx.pair(a, b).secret = true; ctx.stress(a, 25); ctx.mod(b, a, { trust: 12 }); return { text: fill(ctx.pick(T.protHide), m2(a, b, ctx)), why: a.name + 'は{sib:a→b}の' + b.name + 'が咬まれていると知り、かばった', mag: 26 }; } });
  add({ id: 'zr_pcare', cat: 'help', scope: 'pair',
    when: function (ctx, a, b) { return RK.kind(ctx, a, b) === 'protA' && RK.cool(ctx, a, b, 'pcare', 4); },
    w: function (ctx, a, b) { return 0.5 + a.tr.np * 0.6 + b.stress / 100; },
    run: function (ctx, a, b) { RK.mark(ctx, a, b, 'pcare'); ctx.stress(b, -12); ctx.mod(b, a, { aff: 5 }); return { text: fill(ctx.pick(T.protCare), m2(a, b, ctx)), why: a.name + 'の、{sib:a→b}への世話焼き（NP）' }; } });

  /* ---------- きょうだい（親友のよう） ---------- */
  add({ id: 'zr_csig', cat: 'bond', scope: 'pair',
    when: function (ctx, a, b) { return RK.kind(ctx, a, b) === 'sibclose' && RK.cool(ctx, a, b, 'csig', 6); },
    w: function (ctx, a, b) { return 0.6 + a.tr.fc * 0.4 + a.tr.a * 0.2; },
    run: function (ctx, a, b) { RK.mark(ctx, a, b, 'csig'); ctx.mod2(a, b, { trust: 8 }, { trust: 8 }); return { text: fill(ctx.pick(ctx.rng() < 0.5 ? T.closeSignal : T.closeMemory), m2(a, b, ctx)), why: '親友のような{sibs}' }; } });
  add({ id: 'zr_cback', cat: 'help', scope: 'pair',
    when: function (ctx, a, b) { return RK.kind(ctx, a, b) === 'sibclose' && danger(ctx, a) > 35 && RK.cool(ctx, a, b, 'cback', 6); },
    w: function (ctx, a, b) { return 0.5 + a.tr.aggr * 0.3 + a.tr.np * 0.3; },
    run: function (ctx, a, b) { RK.mark(ctx, a, b, 'cback'); ctx.mod2(a, b, { trust: 10, aff: 4 }, { trust: 10, aff: 4 }); ctx.stress(a, -6); ctx.stress(b, -6); return { text: fill(ctx.pick(T.closeBack), m2(a, b, ctx)), why: '親友のような{sibs}の連携（危険度 ' + Math.round(danger(ctx, a)) + '）', mag: 14 }; } });

  /* ---------- 恋愛相手の固定 ---------- */
  add({ id: 'zr_lrefuse', cat: 'romance', scope: 'pair',
    when: function (ctx, a, b) { return RK.locked(a) && !RK.lockedTo(a, b) && ctx.R(b, a).att > 35 && !ctx.pair(a, b).lockRef; },
    w: function (ctx, a, b) { return 0.8 + ctx.R(b, a).att / 60; },
    run: function (ctx, a, b) { ctx.pair(a, b).lockRef = true; ctx.mod(b, a, { att: -10, ten: 6 }); ctx.stress(b, 12); var t = HK.lockNames(ctx.chars, a); return { text: fill(ctx.pick(T.lockRefuse), { a: a.name, b: b.name }), why: a.name + 'は恋愛の相手を' + (t ? t + 'と' : '') + '決めている。' + b.name + 'の想い（惹かれ ' + Math.round(ctx.R(b, a).att) + '）には応えない' }; } });
  add({ id: 'zr_ldevote', cat: 'romance', scope: 'pair',
    when: function (ctx, a, b) { return RK.lockedTo(a, b) && RK.cool(ctx, a, b, 'ldev', 5); },
    w: function (ctx, a, b) { return 0.8 + a.tr.np * 0.4 + a.tr.ac * 0.3 + ctx.R(a, b).att / 80; },
    run: function (ctx, a, b) { RK.mark(ctx, a, b, 'ldev'); ctx.mod(a, b, { att: 6, aff: 4 }); ctx.mod(b, a, { aff: 6, att: 3 }); return { text: fill(ctx.pick(T.lockDevote), { a: a.name, b: b.name }), why: a.name + 'の想う相手は、' + (HK.locks(a).length > 1 ? b.name + 'たち（決めた人）' : b.name + 'ただ一人') }; } });
  /* 固定した相手（複数なら順に）のうち、生きていて別の場所にいる人 */
  /* 二人以上なら、想うたびに順に回す（2026-10-27：住人欄のいちばん上の一人だけになっていたのを直す） */
  function lseekTo(ctx, a) { var L = HK.lockPeople(ctx.chars, a).filter(function (t) { return t.alive && !t.out && t.z && a.z && t.z.area !== a.z.area; }); return L.length > 1 ? L[(a.flags.lseekN || 0) % L.length] : L[0] || null; }
  add({ id: 'zr_lseek', cat: 'solo', scope: 'solo',
    when: function (ctx, a) { if (!RK.locked(a)) return false; var t = lseekTo(ctx, a); if (!t) return false; return a.flags.lseekAt == null || ctx.stepIndex - a.flags.lseekAt > 6; },
    w: function (ctx, a) { return 0.7 + a.tr.ac * 0.4 + a.tr.np * 0.3; },
    run: function (ctx, a) { a.flags.lseekAt = ctx.stepIndex; var t = lseekTo(ctx, a); a.flags.lseekN = (a.flags.lseekN || 0) + 1; if (a.tr.np + a.tr.impulse > 0.9) { a.focus = t; } return { text: fill(ctx.pick(T.lockSeek), { a: a.name, b: t.name }), why: a.name + 'は、離れた場所にいる' + t.name + 'を想っている' + (a.focus === t ? '（探しに行くと決めた）' : '') }; } });

  /* ---------- 兄貴・姉貴分／関西弁 ---------- */
  add({ id: 'zr_aniki', cat: 'help', scope: 'pair',
    when: function (ctx, a, b) { return RK.tone(a) === 'aniki' && RK.cool(ctx, a, b, 'aniki', 5); },
    w: function (ctx, a, b) { return 0.6 + a.tr.np * 0.5 + a.tr.lead * 0.4 + b.stress / 100; },
    run: function (ctx, a, b) { RK.mark(ctx, a, b, 'aniki'); Z.here(ctx, a).forEach(function (o) { ctx.stress(o, -6); ctx.mod(o, a, { trust: 4 }); }); return { text: fill(ctx.pick(T.anikiRally), { a: a.name, b: b.name }), why: a.name + 'の面倒見のよさ（NP・CP。兄貴・姉貴分）' }; } });
  add({ id: 'zr_anikiAlone', cat: 'solo', scope: 'solo',
    when: function (ctx, a) { return RK.tone(a) === 'aniki' && a.stress > 45 && !a.flags.anikiCry; },
    w: function (ctx, a) { return 0.6 + a.stress / 100; },
    run: function (ctx, a) { a.flags.anikiCry = true; ctx.stress(a, -15); return { text: fill(ctx.pick(T.anikiAlone), { a: a.name }), why: '頼られる側の' + a.name + 'にも、限界はある（ストレス ' + Math.round(a.stress) + '）' }; } });
  add({ id: 'zr_kansai', cat: 'bond', scope: 'pair',
    when: function (ctx, a, b) { return RK.tone(a) === 'kansai' && RK.cool(ctx, a, b, 'kansai', 6); },
    w: function (ctx, a, b) { return 0.3 + a.tr.fc * 0.6 + b.stress / 120; },
    run: function (ctx, a, b) { RK.mark(ctx, a, b, 'kansai'); ctx.stress(b, -8); ctx.mod(b, a, { aff: 4 }); return { text: fill(ctx.pick(T.kansai), { a: a.name, b: b.name }), why: a.name + 'の軽口（FC）' }; } });

  /* 親友のようなきょうだい：守るのはお互いさま（借りはすぐ返す） */
  var GUARD = {
    help: L('{a}は{b}の様子がおかしいのに気づいて、黙って隣に座った。「顔に出てる。半分よこせ｜顔に出ている。半分よこせ｜顔に出ています。半分ください」――荷物の話なのか、気持ちの話なのか、{b}には分かっていた。|{a}は{b}の分の見張りを代わった。「次はあなたの番な｜次はあなたの番だ｜次はあなたの番です」|{a}はふらつく{b}に肩を貸した。「重い｜＝｜重いです」「うるさい｜＝｜うるさいです」――いつものやりとりだった。|{a}は{b}の手当てをしながら言った。「これで貸し一つ｜これで貸し一つだ｜これで貸し一つです」'),
    repay: L('今度は{a}が、弱った{b}に肩を貸した。「この前の借り。これでチャラな｜この前の借りだ。これで帳消しだ｜この前の借りです。これで帳消しですね」|{a}は{b}の分まで働いた。「貸し借りなしだろ｜貸し借りなしだろう｜貸し借りなしでしょう」――{b}は小さく笑った。|{a}は{b}の隣に座った。前に、{b}がそうしてくれたように。')
  };
  add({ id: 'zr_cguard', cat: 'help', scope: 'pair',
    when: function (ctx, a, b) { return RK.kind(ctx, a, b) === 'sibclose' && (b.hp < 60 || b.stress > 50 || b.z.food <= 0) && RK.cool(ctx, a, b, 'cguard', 4); },
    w: function (ctx, a, b) { return 0.8 + a.tr.np * 0.4 + a.tr.fc * 0.2 + (ctx.pair(a, b).owe === a.i ? 2 : 0); },
    run: function (ctx, a, b) {
      RK.mark(ctx, a, b, 'cguard');
      var pf = ctx.pair(a, b), repay = pf.owe === a.i;
      pf.owe = repay ? null : b.i;
      if (b.z.food <= 0 && a.z.food > 1) { a.z.food--; b.z.food++; } b.hp = Math.min(100, b.hp + 5); ctx.stress(b, -10);
      ctx.mod2(a, b, { trust: 8, aff: 5 }, { trust: 8, aff: 5 });
      return { text: fill(ctx.pick(repay ? GUARD.repay : GUARD.help), { a: a.name, b: b.name }), why: repay ? a.name + 'が' + b.name + 'に借りを返した（親友のような{sibs}は、守り合う）' : a.name + 'が' + b.name + 'を支えた（今度は' + b.name + 'が返す番）' };
    } });
  RK.mourn(Z.scen, MOURN, 'zr');
})();
