/* 箱庭シミュレーター: 無人島 ― 途中脱出・抜け駆け・村八分・「助けを呼んでくる」
   ・運が良ければ通りがかりの船に拾われる。イカダは試し漕ぎで壊れることもある
   ・自分だけ助かりたい人（ドライさ・目標「自分が生き延びる」・衝動性）は、こっそり自分用のイカダを作る
   ・見つかれば、口のうまさ（主導性・A・本音の出にくさ・人懐こさ）次第で「助けを呼びに行くため」と言い逃れるか、村八分になる
   ・「助けを呼んでくる」と出て行った人が本当に助けを呼ぶかは、NP・本音の出やすさ・CPの数値で決まる
   口調は一切関係しない。決めるのはエゴグラムの数値と関係値だけ */
(function () {
  'use strict';
  var HK = window.HK, isl = HK.SCENARIOS && HK.SCENARIOS.island, RK = HK.RelKit;
  if (!isl) return;
  var L = function (s) { return s.split('|'); };
  function fill(t, m) { return String(t).replace(/\{(\w+)\}/g, function (x, k) { return m[k] != null ? m[k] : x; }); }
  function names(list) { return list.map(function (c) { return c.name; }).join('・'); }
  function R(ctx, a, b) { return ctx.R(a, b); }
  function note(ctx, s) { (ctx.flags.endNotes = ctx.flags.endNotes || []).push(s); }

  if (!(isl.stats || []).some(function (s) { return s.id === 'luck'; })) (isl.stats = isl.stats || []).push({ id: 'luck', label: '運', desc: '通りがかりの船に気づく・海を渡りきる幸運' });

  /* 数値から決まる傾き */
  function selfish(ctx, a) {
    var g = a.goal ? a.goal.id : '';
    return a.tr.cold * 0.5 + a.tr.impulse * 0.2 + (g === 'self' ? 0.4 : 0) + a.stress / 220 + (a.flags.ostra ? 0.3 : 0) - a.tr.np * 0.4 - (g === 'all' ? 0.45 : 0) - (g === 'guard' ? 0.3 : 0) - (g === 'stay' ? 1 : 0);
  }
  function talk(a) { return a.tr.lead * 0.35 + a.tr.a * 0.25 + (1 - a.tr.honesty) * 0.25 + a.tr.warmth * 0.15; }
  function conscience(a) { return a.tr.np * 0.5 + a.tr.honesty * 0.3 + a.tr.cp * 0.2; }
  function luck(ctx, a) { return ctx.stat(a, 'luck'); }
  function seaOK(ctx, a) { return ctx.rng() < 0.42 + ctx.stat(a, 'know') * 0.06 + luck(ctx, a) * 0.05 - ctx.env.storm / 250; }

  var T = {
    shipSee: L('{a}が、水平線に小さな船影を見つけた。|岩場で貝を獲っていた{a}の目に、沖をゆく漁船の白い帆が映った。|夜明け前、{a}だけが、沖に揺れる灯りに気づいた。|{a}は、遠くでエンジンの音がした気がして顔を上げた。本当に、船だった。'),
    shipCall: L('{a}は叫びながら浜へ走った。全員で火に生木をくべ、黒い煙を空へ上げた。|{a}の声で全員が飛び起き、服を振り、鍋を叩き、声が嗄れるまで叫んだ。|{a}は鏡代わりの金属片で、船に向かって日光を返し続けた。'),
    shipYes: L('船が、ゆっくりと向きを変えた。|汽笛が一度、短く鳴った。気づいてもらえたのだ。|船から小舟が下ろされ、こちらに向かってきた。'),
    shipNo: L('船影は、そのまま水平線の向こうへ消えた。誰も、しばらく口をきかなかった。|煙は風に流され、船は気づかずに去っていった。|あと少しだった。船は一度も振り返らなかった。'),
    shipAlone: L('{a}は誰にも声をかけず、そのまま海に飛び込んで船へ泳いだ。|{a}は皆が眠っているうちに、ひとりで岬の先まで走り、船に手を振った。|{a}は一瞬、拠点の方を振り返った。それから、ひとりで船へ向かって泳ぎ出した。'),
    shipTell: L('{a}は船員に、島に仲間が残っていることを伝えた。|{a}は船の上で、島の場所を何度も説明した。「まだ、みんないるんです」|船室で毛布にくるまりながら、{a}はようやく島の皆のことを話した。'),
    shipSilent: L('{a}は船員に何も言わなかった。島の方角を、二度と見なかった。|{a}は「一人で漂流していた」とだけ答えた。|{a}は温かいスープを飲みながら、島のことを口にするのをやめた。'),
    raftBreak: L('完成したイカダで沖へ出た途端、大波が来た。蔓がほどけ、丸太がばらばらになった。全員、泳いで浜へ戻るしかなかった。|試し漕ぎのイカダは、潮の流れに押し戻されて岩に打ちつけられた。半分が壊れた。|イカダは三人目が乗ったところで傾き、ゆっくりと沈んだ。'),
    sraft: L('{a}は皆が眠ったあと、岩陰で丸太を縛っていた。|{a}は薪拾いと言って森へ入り、蔓を集めて隠した。|{a}は自分の分の食料を少しずつ、乾いた葉に包んで隠していた。|{a}は誰にも見られない入り江に、小さなイカダの骨組みを作っていた。|{a}は潮の満ち引きを、毎晩ひとりで確かめていた。'),
    found: L('{a}が、入り江の岩陰に隠された小さなイカダを見つけた。そばには、{b}の上着が置いてあった。|{a}は、夜中に森へ入っていく{b}の後をつけた。そこには、一人乗りのイカダがあった。|{a}は、{b}が隠していた食料の包みと、蔓の束を見つけた。'),
    excuse: L('{b}は少しも慌てなかった。「見つかっちゃったか。……実は、一人で先に出て、助けを呼んでこようと思ってたんだ。言ったら止められると思って」|{b}は目を伏せた。「みんなに期待させたくなかった。成功するか分からないから、黙って行って、船を連れて戻るつもりだった」|{b}は真剣な顔で言った。「全員で乗れるイカダは作れない。なら、一番体力のある誰かが行くしかないだろ」|{b}は笑ってみせた。「サプライズにしたかったんだけどな。助けを呼んでくる係、俺がやるよ」'),
    believe: L('{a}は、しばらく{b}を見つめたあと頷いた。「……分かった。皆には、俺から話す」|{a}は「一人で背負うな」と言った。翌朝、皆で{b}を送り出すことになった。|{a}は納得した。話を聞いた皆も、最後には{b}に頭を下げた。'),
    exposed: L('{a}は{b}の言い訳を最後まで聞かなかった。「一人分しかないイカダで、誰を助けに行くって？」|{b}の言葉は、しどろもどろだった。{a}はイカダを皆の前に引きずり出した。|{a}は黙って、{b}が隠していた食料の包みを皆の前に広げた。それで十分だった。'),
    ostraStart: L('その日から、誰も{b}に話しかけなくなった。|{b}の寝床は、焚き火から一番遠い場所に移された。|{b}の分の魚は、皆が食べ終わったあとの骨だけになった。'),
    ostraMeal: L('{a}は{b}の器に、魚を半分しか入れなかった。「抜け駆けするやつには、これで十分だ」|{a}は焚き火に近づいた{b}に、無言で背を向けた。|{a}は「お前の分はない」とだけ言って、{b}の前で最後の果物を分けた。|{a}は{b}が汲んできた水を、わざと地面にこぼした。'),
    ostraAlone: L('{a}はひとり、拠点から離れた岩場で膝を抱えて眠った。|{a}は誰とも目を合わせないまま、黙々と薪を割った。|{a}は皆の笑い声を、遠くの砂浜で聞いていた。|{a}は自分で獲った小魚を、ひとりで焼いて食べた。'),
    ostraForgive: L('{a}は皆の目を盗んで、{b}に焼き魚を一匹持っていった。「……食べなよ。私は、許したわけじゃないけど」|{a}は焚き火の輪に、{b}の場所を空けた。誰も何も言わなかったが、{b}は少しだけそこに座った。|{a}は皆に言った。「怖かったのは、全員同じだろ。もういいじゃないか」|{a}は{b}の隣で黙って網を繕った。それが{a}なりの、許しだった。'),
    ostraApology: L('{a}は皆の前で、砂に額をつけた。「本当に、ごめん」|{a}は自分の取り分を全部差し出して、頭を下げた。|{a}は誰よりも早く起きて、全員分の水を汲んできた。毎朝、黙って。'),
    ostraSpite: L('{a}は夜中に、拠点の干し魚をひとつ盗んで食べた。もう、失うものはなかった。|{a}は皆が作っていたイカダの蔓を、こっそり一本切った。|{a}は聞こえるように言った。「どうせお前らも、チャンスがあれば逃げるくせに」'),
    night: L('夜明け前、{a}はひとりでイカダを押し出した。誰も気づかなかった。|満月の夜、{a}は音を立てないように、隠していたイカダに乗り込んだ。|{a}は焚き火の番を代わると言い、皆が眠ったのを確かめてから、入り江へ向かった。'),
    nightPair: L('夜明け前、{a}は{b}を起こした。「来て。二人なら、なんとかなる」――二人を乗せたイカダが、静かに入り江を離れた。|{a}は{b}の手を引いて入り江へ走った。皆には、何も言わなかった。'),
    invite: L('{a}は{b}にだけ打ち明けた。「イカダがある。一緒に行こう」|{a}は{b}の耳元で囁いた。「今夜、ここを出る。お前だけは連れていく」'),
    refuseKeep: L('{b}は首を振った。「皆を置いていけない」――それでも{b}は、そのことを誰にも言わなかった。|{b}は「行けない」とだけ言った。一晩中、眠れなかった。'),
    refuseTell: L('{b}は首を振り、翌朝、皆の前でそのことを話した。「黙ってるのは、違うと思った」|{b}は{a}を止めた。「行くなら、全員で行く方法を考えよう」――そして、皆を起こした。'),
    morning: L('朝、{a}の寝床は空だった。入り江には、イカダを引きずった跡だけが残っていた。|{a}がいないことに気づいたのは、朝の水汲みのときだった。浜に、小さな舟の跡があった。|{a}の荷物が、きれいさっぱり消えていた。'),
    angry: L('{a}は砂を蹴り上げた。「あいつ、一人で逃げやがった！」|{a}は拳を震わせた。「信じてたのに」|{a}は吐き捨てるように言った。「最初から、そういうやつだったんだよ」|{a}は黙って、{b}の使っていた器を海に投げた。'),
    defend: L('{a}は、ぽつりと言った。「……あいつなりに、限界だったんだよ」|{a}は「もし助かったら、助けを呼んでくれるかもしれない」と言った。誰も答えなかった。|{a}は{b}の寝床をそのままにしておいた。戻ってくる気がした。'),
    letterLove: L('{a}は寝床に、貝殻で文字を書き残していた。「必ず迎えに来る。待ってて」|{a}は砂の上に、こう書き残していた。「{b}へ。ごめん。生きて会いたい」'),
    letterTie: L('{a}は寝床に、木の皮の書き置きを残していた。「{b}、あとは頼む」|{a}は浜の流木に、こう刻んでいた。「{b}だけは、無事でいてくれ」'),
    letterNone: L('{a}は拠点の柱に、一言だけ刻んでいた。「ごめん」|書き置きは、なかった。|{a}は焚き火の灰に、指で書き残していた。「先に行く」'),
    back: L('三日後、{a}がぼろぼろになって浜に打ち上げられた。イカダは、どこにもなかった。|波打ち際に、{a}が倒れていた。海は、一人では越えられなかった。|夕方、{a}が泳いで戻ってきた。誰も手を貸さなかった。'),
    lostSea: L('沖へ出た{a}の姿は、それきり見えなくなった。|数日後、浜に{a}のイカダの破片が流れ着いた。'),
    msgSincere: L('{a}は名乗り出た。「イカダは一人乗りが限界だ。俺が行って、必ず船を連れて戻る」|{a}は言った。「みんなの分まで、私が行く。待ってて」|{a}は自分の取り分の食料を皆に残して、空の荷物でイカダに乗ると言った。'),
    msgSmooth: L('{a}は焚き火の前で、静かに話し始めた。「全員は乗れない。だったら、一番泳げて、一番体力があるやつが助けを呼びに行くべきだ」――それは、{a}のことだった。|{a}は地図を砂に描いて、皆を説得した。「潮の流れは、俺が一番分かってる。俺が行けば、三日で船が来る」|{a}は穏やかに笑った。「誰かが行かなきゃいけないなら、僕が行くよ。……みんなのためにね」|{a}は涙ぐんでみせた。「本当は怖い。でも、みんなを助けたいの」'),
    msgOk: L('皆は{a}に、なけなしの干し魚を持たせた。イカダが沖へ遠ざかっていくのを、全員で見送った。|{a}は皆と一人ずつ握手をしてから、イカダに乗った。|皆が浜に並んで手を振った。{a}は一度だけ、振り返った。'),
    msgNo: L('{b}が首を振った。「お前一人で行くなら、皆で行く。イカダは全員のものだ」|{b}は{a}をじっと見た。「本当に、戻ってくるつもりなのか？」――{a}は答えに詰まった。|話し合いは夜まで続き、結局、誰も一人では行かないことになった。'),
    msgSeen: L('{b}は冷たく言った。「助けを呼ぶ、ね。一人で逃げたいだけだろ」――焚き火の輪が、静まり返った。|{b}は{a}の荷物を指さした。「戻ってくるやつが、そんなに食料を持っていくか？」'),
    helpCome: L('水平線に、大きな船が現れた。甲板で、{a}が手を振っていた。|沖から汽笛が聞こえた。{a}が呼んだ救助船だった。|ヘリの音がした。{a}は、約束を守ったのだ。'),
    helpCall: L('{a}は本土に着くなり、警察に駆け込んだ。「島に、まだ仲間がいるんです」|{a}は病院のベッドから、何度も島の場所を伝えた。'),
    noCall: L('{a}は本土に着いた。だが、島のことは誰にも話さなかった。|{a}は無事に家へ帰った。島の皆が待っていることを、思い出さないようにしていた。')
  };

  function pick(ctx, arr) { return arr[Math.floor(ctx.rng() * arr.length)]; }
  function mm(a, b) { return { a: a.name, b: b ? b.name : '' }; }
  function tieOf(ctx, a, b) {
    if (RK && RK.kind && RK.kind(ctx, a, b)) return RK.kind(ctx, a, b);
    var l = HK.Ties && HK.Ties.all ? HK.Ties.all(ctx, a, b) : [];
    for (var i = 0; i < l.length; i++) { var d = HK.TIES[l[i].type]; if (d && d.pol > 0) return l[i].type; }
    return null;
  }
  function enemyTie(ctx, a, b) { var l = HK.Ties && HK.Ties.all ? HK.Ties.all(ctx, a, b) : []; return l.some(function (t) { var d = HK.TIES[t.type]; return d && d.pol < 0; }); }
  function closest(ctx, a, list) {
    var best = null, bv = -1e9;
    list.forEach(function (o) { if (o === a) return; var r = R(ctx, a, o), v = r.aff + r.att * 0.8 + r.trust * 0.3 + (tieOf(ctx, a, o) ? 30 : 0) + (HK.lockTo(a, o) ? 60 : 0); if (v > bv) { bv = v; best = o; } });
    return best && bv > 40 ? best : null;
  }

  /* 出て行った人の行く末。ok=true なら本土へ。sincere は助けを呼ぶか */
  function sail(ctx, a, crew, how) {
    var ok = seaOK(ctx, a);
    if (!ok) {
      if (ctx.rng() < 0.3) { crew.forEach(function (c) { c.out = false; ctx.kill(c, null, '一人で漕ぎ出した海で消息を絶った'); }); ctx.say({ kind: 'event', cat: 'death', actors: crew, text: fill(pick(ctx, T.lostSea), mm(a)), why: '海は荒れていた（天候 ' + ctx.env.storm + '・運 ' + luck(ctx, a) + '）', mag: 30 }); return 'lost'; }
      crew.forEach(function (c) { c.out = false; c.hp -= 20; ctx.stress(c, 25); c.flags.sraft = 0; });
      ctx.say({ kind: 'event', cat: 'escape', actors: crew, text: fill(pick(ctx, T.back), mm(a)), why: '一人では海を越えられなかった（知識 ' + ctx.stat(a, 'know') + '・運 ' + luck(ctx, a) + '）', mag: 20 });
      return 'back';
    }
    crew.forEach(function (c) { c.out = true; c.fate = how.fate; c.fateNote = how.note; });
    return 'ok';
  }
  /* 島に残る人との関係：仲の良い人がいればほぼ必ず助けを呼び、敵ばかりなら見捨てやすい */
  function hostile(ctx, a, o) { var r = R(ctx, a, o); return Math.max(0, r.ten - r.aff * 0.6 - r.trust * 0.3) + (enemyTie(ctx, a, o) ? 25 : 0); }
  function bonds(ctx, a) {
    var left = ctx.present().filter(function (o) { return o !== a; }), friend = null, fv = 0, foes = [];
    left.forEach(function (o) {
      var r = R(ctx, a, o), v = r.aff + r.trust * 0.5 + r.att * 0.5 + (tieOf(ctx, a, o) ? 30 : 0) + (HK.lockTo(a, o) ? 60 : 0);
      if (v > fv) { fv = v; friend = o; }
      if (hostile(ctx, a, o) > 32 || r.aff < -18) foes.push(o);
    });
    return { left: left, friend: fv >= 55 ? friend : null, foes: foes };
  }
  function decideHelp(ctx, a, sincere) {
    var B = bonds(ctx, a), p = sincere ? 0.85 : conscience(a) * 0.8, why;
    if (B.friend) { p = Math.max(p, 0.95); why = '島に' + B.friend.name + 'が残っている（' + (HK.lockTo(a, B.friend) ? '想う相手' : tieOf(ctx, a, B.friend) ? '大事な関係' : '仲が良い') + '）'; }
    else if (B.foes.length && B.foes.length >= B.left.length / 2) { p *= sincere ? 0.7 : 0.3; why = '島に残っているのは、' + names(B.foes) + 'のような折り合いの悪い相手ばかり'; }
    else why = a.name + 'の良心（NP・本音の出やすさ・CP）';
    return { does: ctx.rng() < p, why: why };
  }
  /* 敵対している人ほど、抜け出そうとする相手を見張っていて見逃さない */
  function watcher(ctx, a) {
    var best = null, bv = 0;
    ctx.present().forEach(function (o) {
      if (o === a) return;
      var h = hostile(ctx, o, a) + Math.max(0, -R(ctx, o, a).aff) * 0.5;
      if (h < 25) return;
      var v = Math.min(0.7, (o.tr.a * 0.35 + o.tr.caution * 0.25 + h / 160) * 0.85);
      if (v > bv) { bv = v; best = o; }
    });
    return best && ctx.rng() < bv ? best : null;
  }
  T.caught = L('{b}は、{a}が拠点を抜け出すのを見ていた。{b}は{a}の腕を掴み、低く言った。「どこへ行く気だ」|{b}は眠ったふりをして、ずっと{a}を見張っていた。「やっぱりな」|{a}が入り江へ向かう足音に、{b}だけが目を開けた。{b}は大声で皆を起こした。|{b}は{a}の前に立ちふさがった。「お前だけ助かるなんて、許さない」');
  T.caughtShip = L('{b}がそれに気づき、{a}の腕を掴んで引き戻した。「一人で行かせるか」――{b}の怒鳴り声で、皆が浜へ駆けてきた。|泳ぎ出そうとした{a}の前に、{b}が立ちふさがった。「皆を呼べ。今すぐだ」');
  function callHelp(ctx, a, sincere) {
    var D = decideHelp(ctx, a, sincere), does = D.does;
    if (does) {
      ctx.flags.helpAt = ctx.stepIndex + 2 + Math.floor(ctx.rng() * 2); ctx.flags.helpBy = a.i;
      a.fateNote += '。本土で救助を呼んだ';
      ctx.say({ kind: 'phase', cat: 'escape', actors: [a], text: fill(pick(ctx, T.helpCall), mm(a)), why: D.why });
    } else {
      ctx.flags.noReturn = a.i; a.fateNote += '。島のことは誰にも話さなかった';
      ctx.say({ kind: 'phase', cat: 'betray', actors: [a], text: fill(pick(ctx, T.noCall), mm(a)), why: (/折り合い/.test(D.why) ? D.why + '。見捨てた' : a.name + 'の良心は、助けを呼ぶほどには働かなかった（NP ' + Math.round(a.eg.NP) + '）') });
    }
    return does;
  }
  function ostracize(ctx, b, by) {
    b.flags.ostra = true; b.flags.ostraN = 0; b.flags.sraft = 0;
    if (by) (by.flags.harm = by.flags.harm || {})[b.i] = (by.flags.harm[b.i] || 0) + 2;
    ctx.others(b).forEach(function (o) { ctx.mod(o, b, { trust: -35, aff: -18, ten: 22 }); ctx.mod(b, o, { ten: 12 }); });
    ctx.stress(b, 25);
    ctx.flags.ostraList = (ctx.flags.ostraList || []).concat([b.i]);
  }
  function angerAt(ctx, gone) {
    var P = ctx.present(); if (!P.length) return;
    P.forEach(function (o) { ctx.k = 1; ctx.mod(o, gone, { trust: -40, aff: -22, ten: 25 }); });
    var mad = ctx.most(P, function (o) { return o.tr.cp * 0.5 + o.tr.aggr * 0.5; });
    var kind = ctx.most(P.filter(function (o) { return o !== mad; }), function (o) { return o.tr.np * 0.7 + R(ctx, o, gone).aff / 100; });
    ctx.say({ kind: 'event', cat: 'conflict', actors: [mad, gone], text: fill(pick(ctx, T.angry), mm(mad, gone)), why: mad.name + 'のCP・攻撃性（置いていかれた怒り）', mag: 18 });
    if (kind && kind.tr.np > 0.55) ctx.say({ kind: 'event', cat: 'help', actors: [kind, gone], text: fill(pick(ctx, T.defend), mm(kind, gone)), why: kind.name + 'のNP（責めきれない）' });
  }
  function letter(ctx, a) {
    var P = ctx.present(), dear = closest(ctx, a, P);
    var love = dear && (HK.lockTo(a, dear) || R(ctx, a, dear).att > 40);
    var t = love ? T.letterLove : dear && tieOf(ctx, a, dear) ? T.letterTie : T.letterNone;
    if (dear && t !== T.letterNone) ctx.stress(dear, 18);
    return fill(pick(ctx, t), mm(a, dear));
  }

  var EV = isl.events;
  /* 通りがかりの船（運） */
  EV.push({ id: 'ie_ship', cat: 'escape', scope: 'solo',
    when: function (ctx) { return ctx.stepIndex >= 1 && (ctx.flags.ships || 0) < 2 && ctx.flags.helpAt == null; },
    w: function (ctx, a) { return (0.03 + luck(ctx, a) * 0.03) * (ctx.env.rescue === 'no' ? 1.6 : 1); },
    run: function (ctx, a) {
      ctx.flags.ships = (ctx.flags.ships || 0) + 1;
      var see = fill(pick(ctx, T.shipSee), mm(a)), P = ctx.present();
      if (P.length > 1 && selfish(ctx, a) > 0.45 && ctx.rng() < 0.65) {
        var wt = watcher(ctx, a);
        if (wt) { ctx.mod2(a, wt, { ten: 12 }, { ten: 10, trust: -12 }); ctx.others(a).forEach(function (o) { if (o !== wt) ctx.mod(o, a, { trust: -8 }); }); see += fill(pick(ctx, T.shipAlone), mm(a)) + fill(pick(ctx, T.caughtShip), mm(a, wt)); a = wt; }
        else if (ctx.rng() < 0.35 + luck(ctx, a) * 0.1) {
          a.out = true; a.fate = '一人で島を抜け出した'; a.fateNote = ctx.label + '、通りがかりの船に一人で泳ぎ着いた';
          var TD = decideHelp(ctx, a, false), tell = TD.does;
          if (tell) { ctx.flags.helpAt = ctx.stepIndex + 1 + Math.floor(ctx.rng() * 2); ctx.flags.helpBy = a.i; a.fateNote += '。船員に島のことを伝えた'; }
          else { ctx.flags.noReturn = a.i; a.fateNote += '。島のことは黙っていた'; }
          var e = { cat: 'betray', text: see + fill(pick(ctx, T.shipAlone), mm(a)) + fill(pick(ctx, tell ? T.shipTell : T.shipSilent), mm(a)), why: a.name + 'のドライさ・目標（' + a.goal.label + '）と運 ' + luck(ctx, a) + '。' + TD.why, mag: 35 };
          ctx.pending = (ctx.pending || []).concat([{ kind: 'event', cat: 'phase', text: fill(pick(ctx, T.morning), mm(a)) }]);
          ctx.flags.angerQ = (ctx.flags.angerQ || []).concat([a.i]);
          return e;
        }
        if (!wt) { ctx.stress(a, 10);
        return { cat: 'solo', text: see + fill(pick(ctx, T.shipAlone), mm(a)) + '――だが、船は' + a.name + 'に気づかないまま去った。' + a.name + 'は濡れた服のまま、何食わぬ顔で拠点に戻った。', why: a.name + 'のドライさ（一人で行こうとした）。運が足りなかった' }; }
      }
      var p = 0.25 + luck(ctx, a) * 0.08 + (ctx.isl && ctx.isl.base ? ctx.isl.base / 400 : 0) + a.tr.lead * 0.1;
      if (ctx.rng() < p) {
        var stayed = [];
        P.forEach(function (c) { var sr = HK.IslandStay ? HK.IslandStay.decide(ctx, c, 'ship', c.goal.id === 'stay' && ctx.rng() < 0.35) : null; if (sr) { c.flags.stayR = sr; stayed.push(c); } });
        P = P.filter(function (c) { return stayed.indexOf(c) < 0; });
        if (!P.length) { P = stayed.splice(0, 1); P[0].flags.stayR = null; }
        if (stayed.length) HK.IslandStay.follow(ctx, stayed, P).forEach(function (x) { if (P.length > 1) { x[0].flags.stayR = x[1]; stayed.push(x[0]); P.splice(P.indexOf(x[0]), 1); } });
        ctx.flags.stayLater = stayed;
        P.forEach(function (c) { c.out = true; c.fate = '救助（通りがかりの船）'; c.fateNote = ctx.label + '、' + a.name + 'が見つけた船に拾われた（体力 ' + Math.max(0, Math.round(c.hp)) + '）'; });
        ctx.flags.earlyShip = { by: a.i, label: ctx.label };
        return { cat: 'escape', text: see + fill(pick(ctx, T.shipCall), mm(a)) + pick(ctx, T.shipYes) + names(P) + 'は、' + ctx.label + 'に島を離れた。', why: a.name + 'の運 ' + luck(ctx, a) + '（全員を呼んだのはNP・主導性）', mag: 45 };
      }
      P.forEach(function (c) { ctx.stress(c, 10); });
      return { cat: 'escape', text: see + fill(pick(ctx, T.shipCall), mm(a)) + pick(ctx, T.shipNo), why: '船は気づかなかった（運 ' + luck(ctx, a) + '）' };
    } });

  /* こっそり自分用のイカダ */
  EV.push({ id: 'ie_sraft', cat: 'solo', scope: 'solo',
    when: function (ctx, a) { return ctx.present().length > 1 && selfish(ctx, a) > 0.42 && !ctx.flags.helpAt && (a.flags.sraft || 0) < 100; },
    w: function (ctx, a) { return (selfish(ctx, a) * 0.9 + (a.flags.ostra ? 0.4 : 0)) * (ctx.env.rescue === 'no' ? 1.5 : 0.8); },
    run: function (ctx, a) {
      a.flags.sraft = (a.flags.sraft || 0) + 12 + ctx.stat(a, 'know') * 5 + ctx.rng() * 8;
      return { cat: 'solo', text: fill(pick(ctx, T.sraft), mm(a)), why: a.name + 'のドライさ・目標「' + a.goal.label + '」（自分用のイカダ ' + Math.min(100, Math.round(a.flags.sraft)) + '%）' };
    } });

  /* 隠しイカダの発見 → 言い逃れ／村八分／一緒に逃げる取引 */
  EV.push({ id: 'ie_found', cat: 'conflict', scope: 'pair',
    when: function (ctx, a, b) { return (b.flags.sraft || 0) > (b.flags.sfound ? 60 : 20); },
    w: function (ctx, a, b) { return 0.6 + a.tr.a * 0.9 + a.tr.caution * 0.4 + a.tr.cp * 0.3 + b.flags.sraft / 120; },
    run: function (ctx, a, b) {
      b.flags.sfound = true;
      var t = fill(pick(ctx, T.found), mm(a, b));
      if (selfish(ctx, a) > 0.5 && R(ctx, a, b).trust > -10 && ctx.rng() < 0.6) {
        b.flags.partner = a.i; ctx.mod2(a, b, { trust: 10 }, { trust: 8 });
        return { cat: 'betray', text: t + a.name + 'は皆を呼ばなかった。代わりに、低い声で言った。「俺も乗せろ。そうしたら、黙っててやる」', why: a.name + 'も自分が助かりたい（ドライさ）。二人は秘密を共有した' };
      }
      var sus = a.tr.a * 0.6 + Math.max(0, -R(ctx, a, b).trust) / 100 + hostile(ctx, a, b) / 120;
      if (talk(b) + ctx.rng() * 0.35 > sus + 0.42) {
        ctx.mod(a, b, { trust: 6 });
        var e = { cat: 'escape', text: t + fill(pick(ctx, T.excuse), mm(a, b)) + fill(pick(ctx, T.believe), mm(a, b)), why: b.name + 'の口のうまさ（主導性・A・本音の出にくさ）が、' + a.name + 'の疑い（A）を上回った', mag: 20 };
        depart(ctx, b, conscience(b) > 0.55);
        return e;
      }
      ctx.flags.raft = (ctx.flags.raft || 0) + b.flags.sraft * 0.4;
      ostracize(ctx, b, a);
      return { cat: 'conflict', text: t + fill(pick(ctx, T.exposed), mm(a, b)) + fill(pick(ctx, T.ostraStart), mm(a, b)) + '隠しイカダの丸太は、皆のイカダに回された。', why: a.name + 'のA（言い訳を見抜いた）。' + b.name + 'は村八分になった', mag: 30 };
    } });

  /* 「助けを呼んでくる」と送り出される */
  function depart(ctx, a, sincere) { (ctx.flags.departQ = ctx.flags.departQ || []).push({ i: a.i, s: sincere }); }
  function departNow(ctx, a, sincere) {
    if (!a.alive || a.out) return;
    var r = sail(ctx, a, [a], { fate: '助けを呼びに島を出た', note: ctx.label + '、「助けを呼んでくる」と一人でイカダを出した' });
    if (r === 'ok') { ctx.say({ kind: 'event', cat: 'escape', actors: [a], text: fill(pick(ctx, T.msgOk), mm(a)) }); a.flags.msgr = true; ctx.flags.msgr = a.i; callHelp(ctx, a, sincere); }
  }
  EV.push({ id: 'ie_messenger', cat: 'escape', scope: 'solo',
    when: function (ctx, a) { return (!ctx.flags.raftDone && (ctx.flags.raft || 0) >= 40 || (a.flags.sraft || 0) >= 55) && ctx.flags.msgr == null && ctx.flags.msgTry !== ctx.stepIndex && ctx.present().length >= 3 && !a.flags.ostra; },
    w: function (ctx, a) { var s = selfish(ctx, a); return Math.max(0, s) * talk(a) * 3 + ((a.flags.sraft || 0) >= 55 ? talk(a) : 0) + (conscience(a) > 0.6 ? a.tr.np * 0.5 : 0); },
    run: function (ctx, a) {
      ctx.flags.msgTry = ctx.stepIndex;
      var sincere = conscience(a) + ctx.rng() * 0.2 > 0.6 && selfish(ctx, a) < 0.35;
      var speech = fill(pick(ctx, sincere ? T.msgSincere : T.msgSmooth), mm(a));
      var O = ctx.others(a), doubter = ctx.most(O, function (o) { return o.tr.a * 0.6 - R(ctx, o, a).trust / 100 + o.tr.cp * 0.2; });
      var own = (a.flags.sraft || 0) >= 55, acc = (sincere ? 0.55 : talk(a) * 0.9) + ((own ? 70 : ctx.flags.raft) - 55) / 150 + R(ctx, doubter, a).trust / 200 - doubter.tr.a * 0.35 + 0.15 - O.reduce(function (t, o) { return t + hostile(ctx, o, a); }, 0) / Math.max(1, O.length) / 120;
      if (ctx.rng() < acc) {
        if (own) { a.flags.sraft = 0; a.flags.sfound = true; speech = a.name + 'は、自分で作っていたイカダのことを打ち明けた。' + speech; } else ctx.flags.raft = 15;
        O.forEach(function (o) { ctx.mod(o, a, { trust: sincere ? 10 : 6 }); });
        var e = { cat: 'escape', text: speech, why: (sincere ? a.name + 'のNP・責任感（本心から）' : a.name + 'の口のうまさ（主導性・A・本音の出にくさ）') + '。皆のイカダを託された', mag: 30 };
        depart(ctx, a, sincere);
        return e;
      }
      if (!sincere && doubter.tr.a > 0.55 && ctx.rng() < 0.6) {
        O.forEach(function (o) { ctx.mod(o, a, { trust: -15, ten: 10 }); });
        return { cat: 'conflict', text: speech + fill(pick(ctx, T.msgSeen), mm(a, doubter)), why: doubter.name + 'のA（下心を見抜いた）' };
      }
      return { cat: 'conflict', text: speech + fill(pick(ctx, T.msgNo), mm(a, doubter)), why: '皆は' + a.name + 'に、全員のイカダを預けなかった' };
    } });

  /* 村八分の日々 */
  EV.push({ id: 'ie_omeal', cat: 'conflict', scope: 'pair',
    when: function (ctx, a, b) { return b.flags.ostra && !a.flags.ostra; },
    w: function (ctx, a) { return 0.4 + a.tr.cp * 0.5 + a.tr.cold * 0.4 + a.tr.aggr * 0.3; },
    run: function (ctx, a, b) { b.hp -= 5; ctx.stress(b, 10); ctx.mod(b, a, { ten: 8, aff: -6 }); (a.flags.harm = a.flags.harm || {})[b.i] = (a.flags.harm[b.i] || 0) + 1; return { text: fill(pick(ctx, T.ostraMeal), mm(a, b)), why: a.name + 'のCP・ドライさ（抜け駆けを許さない）' }; } });
  EV.push({ id: 'ie_oalone', cat: 'solo', scope: 'solo',
    when: function (ctx, a) { return a.flags.ostra; },
    w: function () { return 0.6; },
    run: function (ctx, a) { ctx.stress(a, 6); return { text: fill(pick(ctx, T.ostraAlone), mm(a)), why: a.name + 'は村八分のまま' }; } });
  EV.push({ id: 'ie_oforgive', cat: 'help', scope: 'pair',
    when: function (ctx, a, b) { return b.flags.ostra && !a.flags.ostra; },
    w: function (ctx, a, b) { return 0.3 + a.tr.np * 1.4 + R(ctx, a, b).aff / 120 + (tieOf(ctx, a, b) ? 0.6 : 0) - a.tr.cp * 0.3; },
    run: function (ctx, a, b) { (a.flags.forgave = a.flags.forgave || {})[b.i] = true; lift(ctx, b, 1); b.hp = Math.min(100, b.hp + 5); ctx.mod2(a, b, { trust: 5 }, { aff: 14, trust: 14 }); return { cat: 'help', text: fill(pick(ctx, T.ostraForgive), mm(a, b)), why: a.name + 'のNP（' + Math.round(a.eg.NP) + '）' + (b.flags.ostra ? '' : '。' + b.name + 'は輪に戻された') }; } });
  EV.push({ id: 'ie_oapology', cat: 'help', scope: 'solo',
    when: function (ctx, a) { return a.flags.ostra; },
    w: function (ctx, a) { return 0.2 + a.tr.ac * 1.1 + a.tr.np * 0.4 - a.tr.cp * 0.3; },
    run: function (ctx, a) { lift(ctx, a, 1); ctx.others(a).forEach(function (o) { ctx.mod(o, a, { trust: 6, ten: -6 }); }); return { text: fill(pick(ctx, T.ostraApology), mm(a)), why: a.name + 'のAC（償いたい）' + (a.flags.ostra ? '' : '。皆は、少しずつ' + a.name + 'を許した') }; } });
  EV.push({ id: 'ie_ospite', cat: 'betray', scope: 'solo',
    when: function (ctx, a) { return a.flags.ostra; },
    w: function (ctx, a) { return a.tr.aggr * 0.8 + a.tr.fc * 0.3 - a.tr.ac * 0.4 + a.stress / 200; },
    run: function (ctx, a) { ctx.food = Math.max(0, (ctx.food || 0) - 4); ctx.flags.raft = Math.max(0, (ctx.flags.raft || 0) - 6); ctx.others(a).forEach(function (o) { ctx.mod(o, a, { ten: 8, trust: -6 }); }); return { text: fill(pick(ctx, T.ostraSpite), mm(a)), why: a.name + 'の攻撃性・FC（追い詰められて開き直った）' }; } });
  function lift(ctx, b, n) {
    b.flags.ostraN = (b.flags.ostraN || 0) + n;
    if (b.flags.ostra && b.flags.ostraN >= 3) { b.flags.ostra = false; ctx.others(b).forEach(function (o) { ctx.mod(o, b, { trust: 12, ten: -10 }); }); }
  }

  /* 毎日の終わり：イカダの試し漕ぎ・夜逃げ・救助船の到着 */
  var origAfter = isl.after;
  isl.after = function (ctx, s, n) {
    (ctx.flags.stayLater || []).forEach(function (c) { HK.IslandStay.apply(ctx, c, c.flags.stayR, '通りがかりの船に乗らなかった'); c.out = true; });
    ctx.flags.stayLater = [];
    var P = ctx.present();
    /* 皆のイカダが完成：試し漕ぎで壊れることがある */
    if ((ctx.flags.raft || 0) >= 100 && !ctx.flags.raftDone && (ctx.flags.raftFail || 0) < 2) {
      var bd = ctx.chars[ctx.flags.raftBy] || P[0];
      var avgL = P.reduce(function (t, c) { return t + luck(ctx, c); }, 0) / Math.max(1, P.length);
      if (bd && ctx.rng() > 0.5 + ctx.stat(bd, 'know') * 0.07 + avgL * 0.03 - ctx.env.storm / 220) {
        ctx.flags.raftFail = (ctx.flags.raftFail || 0) + 1; ctx.flags.raft = 35 + ctx.rng() * 20;
        P.forEach(function (c) { c.hp -= 5; ctx.stress(c, 10); });
        ctx.say({ kind: 'event', cat: 'escape', actors: P, text: pick(ctx, T.raftBreak), why: 'イカダは嵐と潮に耐えられなかった（' + bd.name + 'の知識 ' + ctx.stat(bd, 'know') + '・天候 ' + ctx.env.storm + '）', mag: 18 });
      }
    }
    if (origAfter && ctx.present().length) origAfter.call(this, ctx, s, n);
    /* 「助けを呼んでくる」と送り出された人の出発 */
    (ctx.flags.departQ || []).forEach(function (d) { departNow(ctx, ctx.chars[d.i], d.s); });
    ctx.flags.departQ = [];
    /* 船で一人抜けた人への怒り */
    (ctx.flags.angerQ || []).forEach(function (i) { angerAt(ctx, ctx.chars[i]); });
    ctx.flags.angerQ = [];
    /* 隠しイカダが完成した人の夜逃げ */
    ctx.present().forEach(function (a) {
      if ((a.flags.sraft || 0) < 100 || !a.alive || a.out || a.flags.ostra && ctx.rng() < 0.3) return;
      var rest = ctx.present().filter(function (o) { return o !== a; }); if (!rest.length) return;
      var crew = [a], partner = a.flags.partner != null ? ctx.chars[a.flags.partner] : null, txt = '';
      if (!partner || !partner.alive || partner.out) {
        partner = null;
        var dear = closest(ctx, a, rest);
        if (dear && a.tr.np * 0.5 + R(ctx, a, dear).aff / 150 + (HK.lockTo(a, dear) ? 0.4 : 0) > 0.55) {
          txt = fill(pick(ctx, T.invite), mm(a, dear));
          if (selfish(ctx, dear) > 0.2 || R(ctx, dear, a).att > 45 || HK.lockTo(dear, a)) partner = dear;
          else if (dear.tr.cp * 0.5 + dear.tr.honesty * 0.5 > 0.55) {
            ostracize(ctx, a, dear); a.flags.sfound = true;
            ctx.say({ kind: 'event', cat: 'conflict', actors: [a, dear], text: txt + fill(pick(ctx, T.refuseTell), mm(a, dear)) + fill(pick(ctx, T.ostraStart), mm(dear, a)), why: dear.name + 'のCP・本音の出やすさ（黙っていられなかった）', mag: 25 });
            return;
          } else { ctx.stress(dear, 20); txt += fill(pick(ctx, T.refuseKeep), mm(a, dear)); }
        }
      }
      var wt = watcher(ctx, a);
      if (wt && wt !== partner) {
        ctx.flags.raft = (ctx.flags.raft || 0) + a.flags.sraft * 0.4; a.flags.sfound = true;
        ostracize(ctx, a, wt); if (partner && !partner.flags.ostra) ostracize(ctx, partner, wt);
        ctx.say({ kind: 'event', cat: 'conflict', actors: [a, wt], text: txt + fill(pick(ctx, T.caught), mm(a, wt)) + fill(pick(ctx, T.ostraStart), mm(wt, a)), why: wt.name + 'は' + a.name + 'を敵視していて、目を離さなかった（A・慎重さ・緊張）', mag: 28 });
        return;
      }
      if (partner) crew.push(partner);
      var lt = letter(ctx, a);
      a.flags.sraft = 0;
      ctx.say({ kind: 'event', cat: 'betray', actors: crew, text: txt + (partner ? fill(pick(ctx, T.nightPair), mm(a, partner)) : fill(pick(ctx, T.night), mm(a))), why: a.name + 'のドライさ・目標「' + a.goal.label + '」（自分だけ助かりたい）', mag: 35 });
      var r = sail(ctx, a, crew, { fate: '一人で島を抜け出した', note: ctx.label + '、隠していたイカダで' + (partner ? partner.name + 'と二人で' : '一人で') + '夜のうちに島を出た' });
      if (r === 'back') { crew.forEach(function (c) { if (!c.flags.ostra) ostracize(ctx, c, null); }); return; }
      if (r === 'ok') {
        if (partner) partner.fate = a.name + 'と島を抜け出した';
        ctx.say({ kind: 'phase', cat: 'phase', text: fill(pick(ctx, T.morning), mm(a)) + lt });
        crew.forEach(function (c) { angerAt(ctx, c); });
        callHelp(ctx, a, false);
      }
    });
    /* 呼ばれた救助船 */
    if (ctx.flags.helpAt != null && ctx.stepIndex >= ctx.flags.helpAt) {
      var hb = ctx.chars[ctx.flags.helpBy], Q = ctx.present();
      ctx.flags.helpAt = null;
      if (Q.length && hb) {
        Q.forEach(function (c) {
          var sr = HK.IslandStay ? HK.IslandStay.decide(ctx, c, 'help', c.goal.id === 'stay' && ctx.rng() < 0.35) : null;
          if (sr) { HK.IslandStay.apply(ctx, c, sr, '迎えの船に乗らなかった'); c.out = true; return; }
          c.out = true; c.fate = '救助（呼ばれた船）'; c.fateNote = ctx.label + '、' + hb.name + 'が呼んだ船で帰還した（体力 ' + Math.max(0, Math.round(c.hp)) + '）'; ctx.mod(c, hb, { trust: 20, aff: 12, ten: -15 });
        });
        ctx.say({ kind: 'event', cat: 'escape', actors: Q, text: fill(pick(ctx, T.helpCome), mm(hb)), why: hb.name + 'が本土で救助を呼んだ', mag: 40 });
        note(ctx, hb.name + 'が呼んだ救助船で、' + names(Q.filter(function (c) { return c.out; })) + 'が帰還した。');
      }
    }
  };
  var origEnd = isl.end;
  isl.end = function (ctx, s, n) { return ctx.present().length === 0 || (origEnd ? origEnd.call(this, ctx, s, n) : false); };
  var origFinish = isl.finish;
  isl.finish = function (ctx) {
    if (origFinish) origFinish.call(this, ctx);
    if (ctx.flags.earlyShip) note(ctx, ctx.flags.earlyShip.label + '、' + ctx.chars[ctx.flags.earlyShip.by].name + 'が見つけた通りがかりの船で島を離れた。');
    var nr = ctx.flags.noReturn != null ? ctx.chars[ctx.flags.noReturn] : null;
    if (nr && nr.alive) note(ctx, nr.name + 'は先に本土へ着いていた。島に残る皆のことは、誰にも話さなかった。');
    (ctx.flags.ostraList || []).forEach(function (i) { var c = ctx.chars[i]; note(ctx, '村八分：' + c.name + (c.flags.ostra ? '（最後まで許されなかった）' : '（のちに輪へ戻された）')); });
  };
})();
