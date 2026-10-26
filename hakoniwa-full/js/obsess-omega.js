/* 箱庭シミュレーター: オメガバースの執着（ヤンデレ）
   匂い・巣・うなじ・発情期・抑制剤・職業を使った重い執着の文と、オメガバースだけの暴走・結末。
   ・暴走（R18版のみ）
     奪う番：執着するαが、Ωのうなじを意思を待たずに噛む（αが攻めに回る組だけ。攻めに設定したΩを受けにはしない）
     仕組まれた発情：執着するΩが抑制剤を断ち、発情期でαを部屋に絡め取る（体の向きは受け攻めの指定どおり）
   ・監禁は「巣」：匂いで満たした部屋に閉じ込める
   ・結末を6つ足す（心中・奪われたうなじ・仕組まれた発情・巣の中の二人・共依存の番・執着の果て）
   全年齢版は、匂いや巣で縛るところまで（噛む・発情で絡め取る・死はない） */
(function () {
  'use strict';
  var HK = window.HK, O = HK.Obsess, OM = HK.OMEGA, SC = HK.SCENARIOS;
  if (!O || !OM || !SC || !SC.omega) return;
  var BD = OM.B;
  function L(s) { return s.split('|'); }
  function sx(c) { return c.om ? c.om.sex : ''; }
  function key(a, b) { return a.i < b.i ? a.i + '-' + b.i : b.i + '-' + a.i; }
  function safe() { return !!HK.SAFE_ON; }
  function order(a, b) { return HK.Pos && HK.Pos.order ? HK.Pos.order(a, b, [a, b]) : [a, b]; }
  function okSex(a, b) { return !HK.Pos || !HK.Pos.okSex || HK.Pos.okSex(a, b); }

  O.PACK.omega = {
    where: '自分の部屋',
    only: ['cage', 'cage_s', 'cageDay', 'shinju_s', 'rescue'],
    seed: L('{c}の匂いが{b}の服に残っているのに気づいた瞬間、{a}の中で何かが静かに壊れた。|{b}のうなじを、{c}がじっと見ていた。{a}は生まれて初めて、誰かを本気で消したいと思った。|{b}の{sb}の匂いに、知らない誰かの匂いが混じっていた。{a}はその夜、一睡もできなかった。'),
    devote: L('{a}は{b}の発情期の周期を、本人よりも正確に把握していた。抑制剤はいつも、切れる前に{b}の部屋に届いていた。|{a}は{job}の仕事を早退して、{b}の帰り道に「偶然」居合わせた。|{a}は{b}が好きだと言った香りを、自分の{sa}の匂いが消えるほど重ねてまとった。'),
    bind: L('{a}は{b}に会うたび、首筋に鼻を寄せて匂いを確かめた。「……今日、誰と会ってた？｜……今日、誰と会っていた？｜……今日、誰と会っていたんですか？」|{a}は{b}の上着に、自分の{sa}の匂いをこすりつけた。ほかの誰も近づかないように。|{a}は{b}に、毎晩寝る前に声を聞かせるよう約束させた。'),
    purge: L('{b}に近づいた相手に、{a}は無言で威圧の匂いを浴びせた。相手は青ざめて後ずさった。|{a}は{b}に届いた花束を、黙ってゴミ箱に捨てた。添えられたカードの名前は、読まなかった。'),
    depend: L('{a}は{b}が脱いだシャツを、黙って持ち帰った。その夜、{a}は{b}の匂いに埋もれて眠った。|{a}「{b}の匂いがしないと、眠れないの｜{b}の匂いがしないと、眠れない｜{b}の匂いがしないと、眠れないんです」'),
    devote2: L('{a}のクローゼットには、{b}がなくしたと思っていた服が、きれいに畳まれて並んでいた。|{a}は{b}の勤め先の向かいに部屋を借りた。窓からは、{b}の席がよく見えた。|{a}は{jobb}の{b}の職場の人間関係を、本人より詳しく知っていた。'),
    bind2: L('{a}は{b}に、首輪をつけるよう迫った。「つけないなら、外には出さない｜＝｜つけないなら、外には出しません」|{a}は{b}のうなじを見つめて言った。「早く噛ませて。……誰かに取られる前に｜早く噛ませてくれ。……誰かに取られる前に｜……誰かに取られる前に、早く噛ませてください」|{a}は{b}の抑制剤の残りを、毎日数えていた。'),
    purge2: L('{a}は{c}の職場に、{c}についての匿名の手紙を送った。{c}は職場にいづらくなった。|{a}は{c}に向けて、威圧の匂いを全力でぶつけた。{c}はその場に膝をつき、息もできなかった。|{a}は{c}を呼び出し、静かに言った。「{b}に、あなたの匂いを二度とつけないで｜{b}に、あなたの匂いを二度とつけるな｜{b}に、あなたの匂いを二度とつけないでください」'),
    depend2: L('{a}は{b}の匂いのついた服で巣を作り、その中で何日も{b}を待ち続けた。|{a}「{b}に捨てられたら、もう誰の匂いも分からなくなる。……それでもいいの？｜{b}に捨てられたら、もう誰の匂いも分からなくなる。……それでもいいのか？｜{b}に捨てられたら、もう誰の匂いも分からなくなります。……それでもいいんですか？」'),
    r_afraid: L('{b}は{a}の匂いがするだけで、体がこわばるようになった。|{b}は{a}に首筋の匂いを嗅がれるのを、そっと避けるようになった。気づいた{a}の目が、暗く沈んだ。'),
    r_accept: L('{b}はうなじに触れる{a}の指を、払いのけなかった。「……いいよ。{a}の匂いなら、怖くない｜……いい。{a}の匂いなら、怖くない｜……いいですよ。{a}の匂いなら、怖くありません」|{b}は{a}がこすりつけた匂いを、洗い流さずに一日過ごした。{a}はそれだけで、泣きそうなほど嬉しそうだった。'),
    r_mutual: L('{b}もまた、{a}の匂いがないと眠れなくなっていた。二人の匂いは、もう混ざり合って区別がつかなかった。|{b}は{a}の首筋に鼻を寄せて囁いた。「私以外の匂いがしたら、許さないから｜私以外の匂いがしたら、許さない｜私以外の匂いがしたら、許しませんから」'),
    r_hate: L('{b}は{a}の匂いのついた上着を、目の前で脱ぎ捨てた。「やめて。気持ち悪い｜やめろ。気持ちが悪い｜やめてください。気持ち悪いです」{a}はそれを拾い上げて、大事そうに抱きしめた。'),
    cage: L('{a}は{b}を、自分の匂いで満たした部屋に閉じ込めた。窓には目張りがされ、ベッドのまわりには{b}の服で作った巣があった。「ここが、私たちの巣だよ｜ここが、私たちの巣だ｜ここが、私たちの巣ですよ」|{a}は{b}の抑制剤を全部捨てて、部屋の鍵を外からかけた。「次の発情期は、ここで過ごそうね｜次の発情期は、ここで過ごそう｜次の発情期は、ここで過ごしましょうね」'),
    cage_s: L('{a}は{b}を自分の部屋に招き、扉の前から動かなかった。部屋じゅうに、{a}の{sa}の匂いが満ちていた。|{a}は{b}の服で作った巣の真ん中に、{b}を座らせた。「今日は、ここにいて｜今日は、ここにいろ｜今日は、ここにいてください」'),
    cageDay: L('{a}は毎日、{b}の首筋に鼻を寄せて、自分の匂いしかしないことを確かめた。|{a}は{b}の匂いのついた服で巣を作り直し、{b}をその真ん中に座らせた。|{b}の勤め先には、「体調不良でしばらく休む」と連絡が入っていた。送ったのは{a}だった。'),
    rescue: L('{c}は{b}の匂いをたどって、目張りされた部屋を見つけ出した。扉を破ると、{a}の匂いがあふれ出した。|{c}は{b}が何日も職場に来ないことを不審に思い、{a}の部屋の前で待ち伏せた。'),
    escape: L('{b}は{a}が仕事に出たすきに、目張りを剥がして窓から逃げ出した。|{b}は{a}が眠ったすきに、震える手で鍵を外した。廊下の空気には、{a}の匂いがしなかった。'),
    release: L('{a}は泣きながら、{b}の服で作った巣を崩した。「……ごめん。もう、行っていいよ｜……すまない。もう、行っていい｜……ごめんなさい。もう、行っていいですよ」'),
    harm: L('{a}は{c}を人気のない倉庫に呼び出し、威圧の匂いで動けなくしたうえで、二度と{b}に近づけない体にした。|{a}は{c}の抑制剤を、発情を誘う薬にすり替えた。人前で倒れた{c}は、職場にいられなくなった。'),
    harm_s: L('{a}は{c}を呼び出し、威圧の匂いをぶつけた。「{b}に近づいたら、次はこれじゃ済まない｜{b}に近づけば、次はこれでは済まない｜{b}に近づいたら、次はこれでは済みません」|{c}の郵便受けには、毎日{b}の写真が一枚ずつ届いた。裏には、{a}の匂いがかすかに残っていた。'),
    harmKill: L('{a}は{c}を呼び出し、二度と戻らせなかった。{b}のもとに帰ってきた{a}からは、かすかに血の匂いがした。'),
    shinju: L('{a}は{b}のうなじに唇を寄せて、「来世では、最初に私が噛むから｜来世では、最初に私が噛む｜来世では、最初に私が噛みますから」と囁いた。二人分の薬が、静かに空になった。|番になれないなら、せめて同じ場所で。{a}は{b}の手を握ったまま、冬の海へ歩いていった。'),
    shinjuFail: L('{a}は二人分の薬を差し出した。{b}はそれを払い落として、{a}を抱きしめた。「生きて。……{a}の匂いが、この世界からなくなるのは嫌だ｜生きてくれ。……{a}の匂いが、この世界からなくなるのは嫌だ｜生きてください。……{a}の匂いが、この世界からなくなるのは嫌です」'),
    shinju_s: L('{a}は{b}の首筋に顔をうずめて、「このまま、二人の匂いだけの世界に行けたらいいのに｜このまま、二人の匂いだけの世界に行けたらいいのだが｜このまま、二人の匂いだけの世界に行けたらいいのにと思います」と呟いた。{b}は黙って、{a}の背中を撫でた。'),
    /* r18:begin */
    /* 巣の夜（R18）：向きは受け攻めの指定どおり */
    top: L('{a}は巣の中で、何度も{b}を抱いた。「誰の匂いがする？　言って｜誰の匂いがする？　言え｜誰の匂いがしますか？　言ってください」――{b}が{a}の名前を呼ぶまで、夜は終わらなかった。|{a}は{b}の体じゅうに自分の{sa}の匂いを刻み込むように、夜通し{b}を抱いた。'),
    bottom: L('{a}は自分の匂いで{b}の理性を溶かし、自分から{b}を受け入れた。「私の匂いしか、分からなくしてあげる｜私の匂いしか、分からなくしてやる｜私の匂いしか、分からなくしてあげます」|{a}は動けない{b}の上に跨り、ゆっくりと腰を落とした。部屋じゅうの{sa}の匂いが、{b}の逃げ場を奪っていた。')
    /* r18:end */
  };

  /* r18:begin */
  /* ---------- オメガバースだけの暴走 ---------- */
  var FORCE = L('発情期の匂いが満ちた部屋で、{a}は{b}のうなじに歯を立てた。{b}の拒む声は、{a}には届かなかった。噛み跡が残った瞬間、{b}の体は{a}を番として覚えてしまった。|{a}は{b}を壁に押しつけ、うなじに深く歯を沈めた。「これで、誰にも取られない｜＝｜これで、誰にも取られません」――{b}の膝から、力が抜けていった。|{a}は{b}の抑制剤をすり替え、発情期を待った。熱に浮かされた{b}を抱きながら、{a}は迷わずうなじを噛んだ。');
  var GIVEN = L('{b}は{a}に背を向け、自分から髪をかき上げた。「……噛んで。{a}のものにして｜……噛んでくれ。{a}のものにしてくれ｜……噛んでください。{a}のものにしてください」――{a}は震えながら、うなじに歯を立てた。|「逃げないよ。だから、噛んで｜逃げない。だから、噛んでくれ｜逃げません。だから、噛んでください」{b}の囁きに、{a}は泣きながらうなじを噛んだ。二人は番になった。');
  var TRAP = L('{a}は抑制剤を断ち、発情期の匂いをまとって{b}を自分の部屋に呼び出した。扉が閉まった瞬間、{b}の理性は{a}の{sa}の匂いに溶けた。|{a}は{b}の飲み物に誘発剤を混ぜ、自分の発情期に合わせて{b}を巣へ誘い込んだ。');
  var TRAP_X = {
    /* [攻め, 受け] の向きで */
    alphaTop: L('{a}は熱に呑まれた{b}を組み敷き、本能のままに抱いた。|{a}は{b}をベッドに押し倒し、夜が明けるまで離さなかった。'),
    omegaTop: L('{a}は熱に浮かされた{b}を押し倒し、そのまま{b}を抱いた。|{a}は理性を失った{b}の上にのしかかり、夜が明けるまで{b}を離さなかった。')
  };
  var TRAP_BITE = L('我に返ったとき、{a}のうなじには{b}の噛み跡が残っていた。{a}はそれを指でなぞり、幸せそうに笑った。|朝、{b}は自分の口の中に残る血の味で、何をしたのかを悟った。{a}のうなじには、くっきりと噛み跡があった。');
  /* r18:end */

  function fill(ctx, t, a, b, c) { return OM.fill(ctx, OM.sc(ctx.t(t, a, b, c), a, b), a, b); }

  function more(ctx, a, b, s, ty, c, isSafe) {
    if (isSafe) return [];
    var out = [], om = ctx.om, stn = O.stance(ctx, b, a);
    /* r18:begin */
    /* 奪う番：αが攻めに回る組だけ */
    if (sx(a) === 'a' && sx(b) === 'o' && BD.canBite(ctx, a, b) && okSex(a, b) && order(a, b)[0] === a && (stn === 'mutual' || stn === 'accept' || (!HK.Content || HK.Content.ok(ctx, 'force'))))
      out.push(['forceBite', (ty === 'bind' || ty === 'purge' ? 3.2 : 2) * (OM.destiny ? 0.6 + OM.destiny(ctx) * 0.8 : 1), function () {
        var given = stn === 'mutual' || stn === 'accept';
        BD.bite(ctx, a, b, given ? 'yan' : 'force');
        om.obBite = om.obBite || {}; om.obBite[key(a, b)] = { by: a.i, kind: given ? 'given' : 'force', at: ctx.stepIndex };
        ctx.pair(a, b).night = true; ctx.pair(a, b).nights = (ctx.pair(a, b).nights || 0) + 1;
        if (given) { ctx.pair(a, b).couple = true; ctx.pair(a, b).since = ctx.stepIndex; ctx.mod2(a, b, { att: 10, aff: 6 }, { att: 10, aff: 4, ten: 6 }); }
        else { ctx.mod(b, a, { ten: 35, trust: -35, aff: -15 }); ctx.stress(b, 40); }
        ctx.mod(a, b, { att: 8 });
        s.lv = Math.min(100, s.lv + 5);
        return { with: [b], cat: given ? 'romance' : 'conflict', sex: true, text: fill(ctx, ctx.pick(given ? GIVEN : FORCE), a, b), why: O.why(ctx, a, b) + (given ? '。' + b.name + 'はそれを受け入れ、自分から噛ませた' : '。執着が暴走し、' + b.name + 'の意思を待たずに番にした') + (OM.destinyWhy ? OM.destinyWhy(ctx) : ''), mag: 55 };
      }]);
    /* 仕組まれた発情：Ωがαを絡め取る */
    if (sx(a) === 'o' && sx(b) === 'a' && okSex(a, b) && ctx.romanceOk([a, b]))
      out.push(['heatTrap', ty === 'depend' || ty === 'devote' ? 3 : 1.8, function () {
        var ord = order(a, b), top = ord[0], bot = ord[1];
        var t = fill(ctx, ctx.pick(TRAP), a, b) + fill(ctx, ctx.pick(top === b ? TRAP_X.alphaTop : TRAP_X.omegaTop), top, bot);
        var bit = BD.canBite(ctx, b, a) && ctx.rng() < 0.75;
        if (bit) { BD.bite(ctx, b, a, 'trap'); t += fill(ctx, ctx.pick(TRAP_BITE), a, b); }
        om.obTrap = om.obTrap || {}; om.obTrap[key(a, b)] = { by: a.i, bit: bit, at: ctx.stepIndex };
        ctx.pair(a, b).night = true; ctx.pair(a, b).nights = (ctx.pair(a, b).nights || 0) + 1;
        ctx.mod2(a, b, { att: 10 }, { att: 8, ten: 18, trust: -15 }); ctx.stress(b, 25);
        return { with: [b], cat: 'romance', sex: true, text: t, why: O.why(ctx, a, b) + '。抑制剤を断ち、発情期で' + b.name + 'を絡め取った' + (bit ? '（' + b.name + 'はうなじを噛んでしまった）' : ''), mag: 55 };
      }]);
    /* r18:end */
    return out;
  }

  /* 区切りが多い（最長72）ので、関係を設定していない執着はゆっくり育つ（tick） */
  O.install(SC.omega, { w: 1.5, tick: 0.3, more: more, fill: function (ctx, s, a, b) { return OM.fill(ctx, OM.sc(s, a, b), a, b); } });

  /* ---------- 結末 ---------- */
  var E = OM.END_DEF;
  E.ob_shinju = ['番になれないなら', '{a}は{b}を誰にも渡さないまま、二人で逝くことを選んだ。残された部屋には、二人の匂いだけが混ざり合って漂っていた。'];
  E.ob_forced = ['奪われたうなじ', '{a}は{b}のうなじを、{b}の意思を待たずに噛んだ。Ωの番は一生に一人。{b}の体はもう、{a}の匂いにしか応えない。'];
  E.ob_trapped = ['仕組まれた発情', '{a}は自分の発情期で{b}を絡め取った。{b}が気づいたときには、もう逃げられない夜が明けていた。'];
  E.ob_nest = ['巣の中の二人', '{a}は{b}を、自分の匂いで満たした巣の中に閉じ込めた。外の世界は、もう二人には届かない。'];
  E.ob_codep = ['共依存の番', '{a}と{b}は、互いの匂いがなければ息もできなくなった。二人の世界は、二人だけで閉じている。'];
  E.ob_yandere = ['執着の果て', '{a}の想いは、愛と呼ぶには重すぎた。{b}がどこへ行っても、{a}の匂いがついてくる。'];
  var SAFE_TXT = {
    ob_nest: '{a}は{b}をそばから離さず、二人だけの世界に閉じこもった。外の匂いは、もう二人には届かない。'
  };
  ['ob_shinju', 'ob_forced', 'ob_trapped', 'ob_nest', 'ob_codep', 'ob_yandere'].forEach(function (k) { if (OM.END_IDS.indexOf(k) < 0) OM.END_IDS.push(k); });
  SC.omega.desc = SC.omega.desc.replace(/(\d+)通り/, function (m, n) { return (+n + 6) + '通り'; }).replace('愛憎の寝取りも。', '愛憎の寝取り、執着（ヤンデレ）も。');

  function mk(ctx, id, a, b) { var d = E[id], t = safe() && SAFE_TXT[id] ? SAFE_TXT[id] : d[1]; return { id: id, title: d[0], text: ctx.t(t, a, b), a: a.i, b: b ? b.i : null }; }
  function obEnd(ctx, a, b) {
    var om = ctx.om, k = key(a, b), pf = ctx.pair(a, b), m = pf.ob || {};
    var by = function (i) { return ctx.chars[i]; }, oth = function (x) { return x === a ? b : a; };
    if (pf.shinju) { var x = by(pf.shinju.by); return mk(ctx, 'ob_shinju', x, oth(x)); }
    if (om.obBite && om.obBite[k] && om.obBite[k].kind === 'force') { var f = by(om.obBite[k].by); return mk(ctx, 'ob_forced', f, oth(f)); }
    if (om.obTrap && om.obTrap[k]) { var tp = by(om.obTrap[k].by); return mk(ctx, 'ob_trapped', tp, oth(tp)); }
    if (pf.captive) { var cg = by(pf.captive.by); return mk(ctx, 'ob_nest', cg, oth(cg)); }
    var la = m[a.i] ? m[a.i].lv : 0, lb = m[b.i] ? m[b.i].lv : 0;
    if (la >= 60 && lb >= 60) return mk(ctx, 'ob_codep', a, b);
    if (Math.max(la, lb) >= 70) return mk(ctx, 'ob_yandere', la >= lb ? a : b, la >= lb ? b : a);
    return null;
  }
  var end0 = BD.endingFor;
  BD.endingFor = function (ctx, a, b) { return obEnd(ctx, a, b) || end0(ctx, a, b); };
  /* 結末を決める合図：心中・奪う番・仕組まれた発情のあと／巣ごもりが長引いたとき */
  var hit0 = BD.extraHit;
  BD.extraHit = function (ctx, s) {
    var om = ctx.om, P = ctx.chars, h = null;
    for (var i = 0; i < P.length && !h; i++) for (var j = i + 1; j < P.length && !h; j++) {
      var a = P[i], b = P[j], pf = ctx.pair(a, b), k = key(a, b), st = (pf.ob || {});
      if (pf.shinju) h = [a, b];
      else if (om.obBite && om.obBite[k] && s - om.obBite[k].at >= 2) h = [a, b];
      else if (om.obTrap && om.obTrap[k] && s - om.obTrap[k].at >= 2) h = [a, b];
      else if (pf.captive && ((st[pf.captive.by] || {}).cage || {}).n >= 3) h = [a, b];
    }
    return h || (hit0 ? hit0(ctx, s) : null);
  };
})();
