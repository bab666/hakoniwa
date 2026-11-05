/* r18:begin */
/* @event-ok 四人の夜の長い版の途中の段（寸止め・次の組へ移る一文）を足した（既にある出来事の言い回し。2026-11-05） */
/* @event scen=set-b-shinkon id=sk_night_futari cat=romance tie=- tags=night cond=家に三人以上・ほかの人が仕事や外出 label=ほかの人の留守に夫婦で過ごす昼 */
/* @event scen=set-b-shinkon id=sk_night_quad cat=romance tie=- tags=night cond=四人婚・四人とも体の関係にしてよい label=四人で軽く求め合う新婚の夜 */
/* 新婚部屋：三人・四人で暮らす家の R18（R18版だけ。2026-11-04 利用者の指示）
   ■ 昼の二人きり（HK.ShinkonR18Four.futari）：家に三人以上が暮らしていて、仕事の忙しくない夫婦の二人が家にいて、ほかの全員が仕事・出張・外出で留守の日中に、その二人の場面。
     ・二人は夫婦の組だけ（同居人とはしない）。体の関係にしてよい組（HK.PairR18.sexOk＝HK.State.pairSex＝HK.Pos.okSex を通す）だけなので、攻めどうしの組は出ない
       （利用者の決まり「受けが一人しか居なくて、受けが出かけているからと攻め同士でまぐわう、はなし。あくまで受けやリバがいるときだけ」）
     ・場面は新婚部屋の夜の組み立て（HK.ShinkonR18.night）を、新婚らしい入口の仕組み（HK.ShinkonR18X の day.r18x）で呼ぶ：きっかけの段（理由「きっかけ：家に二人きりの昼」）→ 場面。
       昼の場面の文（PLAY・OPEN・FADE・AFTER）はこのファイルの X.*.futari（3 組の専用文）。その夜は二人の夜の場面を出さない
   ■ 四人の夜（HK.ShinkonR18Four.quad）：四人婚で四人とも家にいる夜に、本体の HK.Quad（R18版の pack-lewd。js/quad-r18.js）の条件 HK.Quad.ok を満たすときだけ、
     きっかけの文（このファイルの QLEAD）を渡して HK.Quad.scene（受けの人数で描写を切り替える・短いものはきっかけのあとさっぱり済ませる）。HK.Quad が無い版では出さない（二人の夜に落ちる）。
     描写の有無「ほのめかす」のときは出さない。四人であることを無駄に言い立てる文は書かない
   体の語は印。台詞は3本。登場人物はすべて成人として扱う */
(function () {
  'use strict';
  var HK = window.HK;
  if (!HK || !HK.ShinkonR18X || !HK.ShinkonR18 || !HK.PairR18) return;
  function L(s) { return s.split('|'); }
  var X = HK.ShinkonR18X, SH = HK.ShinkonR18, PR = HK.PairR18;
  function SK() { return HK.Shinkon; }
  function F() { return HK.ShinkonFour; }
  /* ---------- 昼の二人きり：文（{x}＝言い出した人・{y}＝相手、{why}＝ほかの人が留守のわけ（「Cは仕事に出ていて」の形）。場面は {a}＝攻め・{b}＝受け） ---------- */
  X.LEAD.futari = L('{why}、家には{x}と{y}の二人だけが残っていた。いつもは誰かの声がする居間が、今日はやけに静かだった。{x}は{y}の隣に座り直して、「＠{x}＠……今なら、誰もいないね｜……今なら、誰もいないな｜……今なら、誰もいませんね」とささやいた。|' +
    '昼過ぎ。{why}、{x}と{y}は、同じ家にいながら久しぶりに二人きりになったことに気づいた。目が合ったまま、どちらも先にそらそうとしなかった。先に手を伸ばしたのは、{x}のほうだった。|' +
    '{why}、家の中はしんとしていた。{x}は、その静けさに落ち着かなかった。{y}の横顔ばかり目で追ってしまい、{y}がそれに気づいて小さく笑うと、{x}はもう我慢ができなかった。|' +
    '{why}、にぎやかな家が、昼のあいだだけ二人の家に戻っていた。{y}が「なんだか、新婚のころみたい｜なんだか、新婚のころのようだ｜なんだか、新婚のころみたいですね」と言うと、{x}は笑ってその手を引き、寝室へ向かった。');
  X.NAME.futari = '家に二人きりの昼';
  if (SH.ENTRY) SH.ENTRY.futari = '家に二人きりの昼';
  X.OPEN.futari = L('昼の光がカーテン越しに差し込む寝室で、{a}は{b}をベッドに座らせた。いつもなら誰かの足音が聞こえる時間なのに、今日は二人の息づかいしか聞こえない。{a}はゆっくりと{b}の唇をふさいだ。|' +
    '{a}は{b}の手を引いて寝室に入り、戸を閉めた。まだ明るい窓の外から、遠くの車の音が聞こえる。{a}は{b}を胸に抱き寄せ、長い口づけを落とした。|' +
    '居間のソファで、{a}は{b}を引き寄せた。昼下がりの明るい部屋は、夜の寝室よりずっと隠れる場所が少ない。{b}は恥ずかしそうに目を伏せたが、{a}の腕からは逃げなかった。');
  X.PLAY.futari = {
    mf: L('{a}は{b}をソファに押し倒し、昼の明るさの中で服のボタンを一つずつ外していった。「＠{b}＠誰か帰ってきたら｜誰かが帰ってきたら｜誰か帰ってきたらどうするんですか」と言いかけた{b}の口を、{a}は唇でふさいだ。{a}は{b}の脚を開かせ、{男性器}をゆっくりと{b}の{ナカ}へ沈めた。昼下がりの居間に、こらえきれない{b}の声がこぼれた。|' +
      '{a}は{b}の手を引いて寝室に入り、まだ明るい窓のカーテンを半分だけ引いた。差し込む光の中で、{b}の肌が白く浮かび上がる。{a}はその{胸}に口づけを落としながら、{b}の{ナカ}へ深く身を沈めた。家には二人しかいないと分かっていても、{b}はシーツを噛んで声をこらえた。'),
    ff: L('{a}は{b}をソファに座らせ、その前にひざをついた。昼間の居間で脚を開かされて、{b}は顔を真っ赤にする。{a}の舌が{女性器}をなぞり、指が{ナカ}へ沈んでいくと、{b}は{a}の髪をつかんで背中をそらした。|' +
      '{a}は{b}を寝室のベッドに横たえ、カーテン越しの光の中で肌をあらわにした。「＠{b}＠まだ明るいのに｜まだ明るいのに｜まだ明るいですよ」と恥じらう{b}の{乳首}を、{a}は唇でついばんだ。指が{女性器}を割って{ナカ}をかき回すと、{b}の腰がシーツの上で小さく跳ねた。'),
    fm: L('{a}は{b}をソファに座らせ、その膝に跨った。昼の光の中で見下ろされて、{b}は落ち着かなげに視線をさまよわせる。{a}は{b}の{男性器}を自分の{ナカ}へ導き、ゆっくりと腰を沈めた。誰もいない居間に、二人の荒い息だけが響いた。|' +
      '{a}は{b}を寝室のベッドに仰向けにし、その上から覆いかぶさった。「＠{a}＠みんなが帰ってくる前に｜皆が帰ってくる前に｜皆さんが帰ってくる前に」――{a}は笑って、{b}の{男性器}を{ナカ}に迎え入れた。{a}が腰を揺らすたびに、{b}の手が{a}の太ももをきつくつかんだ。')
  };
  X.FADE = X.FADE || {};
  X.FADE.futari = L('{a}は{b}の手を引いて、寝室の戸を閉めた。昼の光が、カーテン越しにやわらかく差していた。夕方、ほかのみんなが帰ってくるころには、二人はそろって何食わぬ顔で居間にいた。|' +
    'ソファの上で、二人の影がゆっくりと重なった。その先のことは、二人しか知らない。夕方に誰かが帰ってきたとき、{b}の頬はまだ少し赤かった。');
  X.AFTER = X.AFTER || {};
  X.AFTER.futari = L('事のあと、{b}は{a}の腕の中で時計を見上げた。「＠{b}＠そろそろ、帰ってくる｜そろそろ、帰ってくるな｜そろそろ、帰ってきますね」――二人は慌てて服を拾い集め、顔を見合わせて吹き出した。夕方、玄関の戸が開く音がしたとき、二人は何事もなかったようにお茶を飲んでいた。|' +
    '息が落ち着くと、{a}と{b}はしばらく昼の光の中で寝転んでいた。誰も帰ってこない静かな家が、少しだけもったいなく思えた。{b}は{a}の肩に頭をのせて、「＠{b}＠たまには、こういうのもいい｜たまには、こういうのもいい｜たまには、こういうのもいいですね」とつぶやいた。|' +
    '{b}は乱れた髪を手ぐしで整えながら、窓を開けて部屋の空気を入れ替えた。{a}がそれを見て笑うと、{b}は「＠{b}＠ばれたら困る｜ばれたら困る｜ばれたら困ります」と真っ赤になった。その夜の食卓で、二人はやけに口数が少なかった。');
  /* ---------- 昼の二人きりを出す（shinkon.js の日中から。出したら true） ---------- */
  var R4 = HK.ShinkonR18Four = {};
  function lifeP(S, day, c) { var f = F(); return f ? f.pOf(S, day, c) : null; }
  function freeDay(S, day, c) { var p = lifeP(S, day, c); return !!(p && !p.trip && (p.hol || (p.home && p.home.d))); }
  function outWhy(S, day, c) { var p = lifeP(S, day, c); return p && p.trip ? 'trip' : p && !p.hol && !(p.home && p.home.d) ? 'work' : null; }
  R4.futari = function (ctx, S, day) {
    var f = F();
    if (HK.SAFE_ON || !f || S.sex >= S.lewdMax || day.noSex || day.r18x || day.futari || day.sick || day.dull) return false;
    if (HK.ShinkonR18 && HK.ShinkonR18.paceOk && !HK.ShinkonR18.paceOk(ctx, S, day.d)) return false;
    if (SK().restNight && SK().restNight(ctx, day)) return false;
    var H = f.house(S);
    if (H.length < 3 || (S.futariN || 0) >= (ctx.env.lewdN === 'high' ? 2 : 1)) return false;
    if (day.house && day.house.part === 'd') return false;
    var P = [], sp = S.spouses;
    for (var i = 0; i < sp.length; i++) for (var j = i + 1; j < sp.length; j++) {
      var x = sp[i], y = sp[j];
      if (!freeDay(S, day, x) || !freeDay(S, day, y) || !PR.sexOk(ctx, x, y)) continue;
      var rest = H.filter(function (c) { return c !== x && c !== y; });
      /* ほかの全員が留守：平日は仕事・出張、休日は出かける（その日の日中の暮らしの場面が無いときだけ） */
      var why = rest.map(function (c) { return outWhy(S, day, c); });
      if (why.some(function (w) { return !w; })) { if (!day.hol) continue; why = rest.map(function () { return 'out'; }); }
      P.push({ x: x, y: y, rest: rest, why: why });
    }
    if (!P.length || ctx.rng() > (day.hol ? 0.22 : 0.4)) return false;
    var pr = P[Math.floor(ctx.rng() * P.length)], J = HK.Journal;
    var x0 = J && J.of(ctx, pr.y).pt > J.of(ctx, pr.x).pt ? pr.y : pr.x, y0 = x0 === pr.x ? pr.y : pr.x;
    var nm = pr.rest.map(function (c) { return c.name; }).join('と'), w0 = pr.why;
    var whyT = w0.every(function (w) { return w === 'out'; }) ? nm + 'は出かけていて' : w0.every(function (w) { return w === 'work'; }) ? nm + 'は仕事に出ていて' : nm + 'は仕事や出張で家を空けていて';
    day.r18x = { k: 'futari', x: x0, y: y0, sure: true, ex: { why: whyT } };
    /* 朝のキスの約束（shinkon-kiss.js）は夜のためのもの。昼の場面には持ち込まない */
    var kp = day.kissPromise, kl = day.kissLead, r = false;
    day.kissPromise = null; day.kissLead = null;
    try { r = SH.night(ctx, x0, y0, day, false); } finally { day.kissPromise = kp; day.kissLead = kl; if (day.r18x && day.r18x.k === 'futari') day.r18x = null; }
    if (!r) return false;
    day.futari = true; S.futariN = (S.futariN || 0) + 1;
    if (pr.why.every(function (w) { return w === 'out'; })) day.outing = pr.rest;
    return true;
  };
  /* ---------- 四人の夜（本体の HK.Quad。無ければ出さない） ---------- */
  /* きっかけ（{a}＝言い出した人、{b}{c}{d}＝ほかの三人）。触れ合いの形は HK.Quad が受けの人数から書くので、ここでは書かない */
  R4.QLEAD = L('寝る前の居間で、{a}が明かりを一つ落とした。ソファに並んでいた{b}と{c}と{d}は、その意味にすぐ気づいた。誰も立ち上がらず、誰も目をそらさなかった。|' +
    '四人とも早く帰った夜だった。夕飯のあと、{a}が「＠{a}＠今夜は、みんな一緒にいたい｜今夜は、皆と一緒にいたい｜今夜は、皆さんと一緒にいたいです」と言うと、{b}が照れくさそうに笑い、{c}と{d}は顔を見合わせてうなずいた。|' +
    '休みの前の夜、寝室に布団を並べ終えたところで、{a}が{b}の手を取った。それを見ていた{c}が{d}の袖を引き、四人の距離が自然に縮まった。結婚してから、こういう夜は初めてだった。|' +
    '風呂上がりの{a}が寝室に戻ると、{b}と{c}と{d}が布団の上で待っていた。「＠{b}＠遅い｜遅いぞ｜遅いですよ」と{b}が言い、{a}は笑ってその輪の中に腰を下ろした。誰が言い出すでもなく、明かりが消えた。');
  /* 四人の夜の長い版（2026-11-05 報告「四人婚の夜が『B→A、D→C』の 2 行だけ」）：組ごとに、入り方（前戯）・繋がる段・最中の一幕・山場・終わり方を
     新婚部屋専用の段（shinkon-r18-more.js の HK.PairR18.addRoom）から組む。組が三つ以上（受け一人に攻め三人など）は繋がる段・山場・終わり方だけ。
     体の組が形に合わない組（性器の指定など）は本体の二人の段のまま。最後は本体の締めの一文 */
  /* 組が三つ以上の四人の夜（攻め 1・受け 3＝同じ攻めが三人と順に／受け 1・攻め 3＝同じ受けのもとへ順に）で、途中の組の段（2026-11-05 申し送り：
     攻め 1・受け 3 で、攻めが三つの段それぞれで「中に熱を注いだ」と 3 回果てた）。
     HOLD＝山場の代わり：受けだけが達し、攻めはまだ果てずにこらえる（あとの組にも出る攻めの段）。{m}＝受けの山場の声。体の語は組の形（mf／ff／fm）ごと
     PASS＝終わり方の代わり：次の組へ移る一文（three＝攻めが次の受けへ、one＝受けが次の攻めへ）。{a}＝この段の攻め・{b}＝受け */
  var HOLD = {
    mf: L('{a}の動きが速くなるにつれて、{b}の声は途切れがちになっていった。{m}――{b}が{a}の背中にしがみついて達すると、{a}は奥で動きを止め、果てる手前で深く息を吐いた。|' +
      '{a}は{b}のいちばん弱いところを、何度も同じ深さで突いた。{m}――{b}の{ナカ}がきつく締めつけても、{a}は歯を食いしばってこらえた。まだ、果てるわけにはいかなかった。|' +
      '{b}の脚が{a}の腰に絡みつき、離すまいと引き寄せた。{m}――{b}が背を反らして昇りつめるのを、{a}は動きをゆるめて最後まで見届けた。自分の熱は、まだ奥にしまったままだった。|' +
      '{a}は{b}の手を探して指を絡め、浅いところと奥を交互に擦った。{m}――{b}が小さく震えて達すると、{a}はそこで動きを止め、{b}の息が落ち着くのを待った。{a}はまだ果てていなかった。'),
    ff: L('{a}の指が、{b}の弱いところを捉えて離さなかった。{m}――{b}は{a}の腕にしがみついたまま、小刻みに震えて達した。{a}は濡れた指をそっと引き抜き、{b}の髪を撫でた。|' +
      '{a}は{b}の{陰核}を舌でなぞりながら、{ナカ}の指をゆっくり曲げた。{m}――{b}が腰を跳ねさせて果てると、{a}は顔を上げて、満足そうに唇をぬぐった。|' +
      '{a}は{b}の耳もとで名前を呼びながら、指の動きを少しずつ速めた。{m}――{b}の背中がしなり、{a}の腕の中で長い震えが続いた。{a}は自分の熱を、まだ胸の奥に抱えたままだった。'),
    fm: L('{a}は{b}の{男性器}を握る手をゆるめずに、{ナカ}の指で奥を押し上げた。{m}――{b}は{a}の手の中で、どくどくと熱を吐き出した。{a}は息の荒い{b}の頬に口づけて、そっと手を離した。|' +
      '「＠{a}＠いいよ、出して｜いい、出せ｜いいですよ、出してください」――{a}が耳元でささやくと、{b}の最後の我慢がほどけた。{m}――{b}は体を大きく震わせて果てた。{a}は濡れた手のひらを見下ろして、小さく笑った。|' +
      '{a}は{b}の胸に唇を落としながら、手の動きを最後までゆるめなかった。{m}――{b}は{a}の名前を呼びながら、{a}の手の中で果てた。')
  };
  var PASS = {
    three: L('{b}がぐったりと布団に沈むと、{a}はその肩に毛布を掛けてやった。息を整える間もなく、隣から伸びてきた手が{a}の手首を引いた。|' +
      '{a}は{b}の汗ばんだ額に口づけて、そっと体を離した。{b}は目を閉じたまま、満ち足りたように小さく笑った。夜は、まだ終わっていなかった。|' +
      '{b}の呼吸が落ち着くのを待って、{a}は身を起こした。暗がりの向こうで、次の伴侶が{a}を待っていた。|' +
      '{a}が離れると、{b}は布団に頬を押しつけたまま、行ってきて、というように{a}の背中を押した。|' +
      '{b}は{a}の首から腕をほどき、横へ転がって場所を空けた。{a}の肌には、まだ{b}の熱が残っていた。'),
    one: L('{a}が身を離すと、{b}は息を整える間もなく、次に伸びてきた腕に引き寄せられた。|' +
      '{a}は{b}の髪を撫でてから、場所を譲った。{b}の体には、まだ{a}の熱が残っていた。|' +
      '{a}が名残惜しそうに体を離すと、{b}は荒い息のまま、次の伴侶へ手を伸ばした。|' +
      '{a}は{b}の額に口づけて、隣に身を横たえた。{b}が目を開けたときには、もう次の手が{b}の頬に触れていた。')
  };
  /* 本体の段の文の攻めの「果てた」を、寸止めに言い換える（{a} の名前で始まる節だけ） */
  function holdFix(t, a) {
    var n = a && a.name; if (!n) return t;
    var e = n.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    return String(t).replace(new RegExp(e + '(?:も|は|が)[^。「」、]{0,30}?(?:熱を(?:注いだ|注ぎ込んだ|放った|吐き出した)|果てた)', 'g'), n + 'は、果てる手前で動きを止めてこらえた');
  }
  function quadLong(ctx, r) {
    var PR = HK.PairR18, TS = HK.ThickSex;
    if (!PR || !PR.part || !r.pairs || !r.pairs.length) return;
    var ps = String(r.e.text).split(/\n\n+/), endP = ps.length > r.pairs.length ? ps[ps.length - 1] : '';
    var many = r.pairs.length >= 3, kinds = many ? ['insert', 'peak', 'end'] : ['fore', 'insert', 'mid', 'peak', 'end'];
    var out = [];
    r.pairs.forEach(function (pr, i) {
      var a = pr[0], b = pr[1], sh = PR.shape(a, b);
      /* 組が三つ以上：この段の攻めがあとの段にも出るなら、ここでは果てない（HOLD）。最後の段でないなら、終わり方の代わりに次の組へ移る一文（PASS） */
      var later = r.pairs.slice(i + 1), hold = many && later.some(function (q) { return q[0] === a; }), pass = many && later.length > 0;
      var passK = later.length && later[0][0] === a ? 'three' : 'one';
      if (!PR.bodyFits(sh, a, b)) {
        /* 本体の二人の段のまま（本体の段は攻めの果てる文を持つので、途中の段の攻めの「果てた」を寸止めに言い換える） */
        if (ps[i]) out.push(hold ? holdFix(ps[i], a) : ps[i]);
        return;
      }
      var pk = function (l) { return l[Math.floor(ctx.rng() * l.length)]; }, used = [];
      var segs = kinds.map(function (k) {
        var t;
        if (k === 'peak' && hold) t = PR.lru(ctx, HOLD[sh] || HOLD.mf);
        else if (k === 'end' && pass) t = PR.lru(ctx, PASS[passK]);
        else t = PR.part(ctx, 'set-b-shinkon', k, sh, a, b, used);
        used.push(t); return t;
      });
      if (segs.some(function (x) { return !x; })) { if (ps[i]) out.push(ps[i]); return; }
      if (HK.NovelMoan) HK.NovelMoan.top = a;
      var mo = function (cl) { var m = TS && TS.moan ? String(TS.moan(pk, b, cl, ctx.rng)) : ''; return m ? '{b}「' + m.replace(/^「|」$/g, '') + '」' : ''; };
      var body = segs.join('\n\n').replace(/\{m0\}|\{mm\}/g, function () { return mo(false); }).replace('{m}', mo(true)).replace(/\{m\}/g, '');
      body = PR.flowFix(body, a, b, sh, '', { ctx: ctx });
      out.push(PR.mk(ctx, body, a, b));
    });
    if (endP) out.push(endP);
    r.e.text = out.join('\n\n');
    if (typeof r.e.why === 'string') r.e.why = r.e.why.replace('四人の夜（軽く。', '四人の夜（組ごとに。');
  }
  /* 四人の組の見方（受け攻めは性的に対象になる相手との向きだけで数える・攻めどうし／受けどうしの組の緊張は見ない）は、
     本体の HK.Quad（quad-r18.js の split・ringOk）で直した（2026-11-05。以前はここで呼ぶあいだだけ差し替えていた。shinkon-design.md 12.5） */
  R4.ok = function (ctx, S) {
    var Q = HK.Quad;
    if (HK.SAFE_ON || !S.quad || !Q || !Q.ok) return false;
    var ids = S.spouses.map(function (c) { return c.i; });
    return Q.ok(ctx, ids);
  };
  /* ほのめかす（描写の有無「ほのめかす」）の四人の夜（{a}{b}{c}{d}＝四人） */
  R4.QFADE = L('寝室の戸が静かに閉まった。それから先のことは、四人しか知らない。翌朝の食卓で、{a}と{b}と{c}と{d}は、誰からともなく照れくさそうに笑い合った。|' +
    '明かりの消えた寝室で、四人の影がゆっくりと二つずつ重なった。夜更けまで、小さな笑い声と息づかいが廊下に漏れていた。翌朝、四人の寝起きはそろって遅かった。');
  /* opt.sure：その夜は四人の夜と決まっている（shinkon.js が夜の起こりやすさを振ったあと）。無ければ今までどおり 30%（まだ無く最後の夜なら必ず） */
  R4.quad = function (ctx, S, day, last, opt) {
    opt = opt || {};
    var Q = HK.Quad, f = F();
    if (HK.SAFE_ON || !S.quad || !Q || !Q.ok || !Q.scene || !f) return false;
    if (S.sex >= S.lewdMax || day.noSex || day.futari || (!opt.sure && day.r18x) || (SK().restNight && SK().restNight(ctx, day))) return false;
    if (!f.allHome(S, day, 'n') || S.spouses.some(function (c) { var p = f.pOf(S, day, c); return p && p.trip; })) return false;
    var LV = HK.Lewd, lv = LV ? LV.lv(ctx.env) : 'mid';
    var ids = S.spouses.map(function (c) { return c.i; });
    if (!R4.ok(ctx, S)) return false;
    if (!opt.sure && !(ctx.rng() < 0.3 || (!S.quadSex && last))) return false;
    var o = S.spouses.slice().sort(function () { return ctx.rng() - 0.5; }), a = o[0];
    var lead = SK().fill(ctx, SK().pickT(ctx, R4.QLEAD, a, o[1]), a, o[1], { c: o[2].name, d: o[3].name });
    var len = ctx.env.lewdLen === 'thick' ? 'long' : ctx.env.lewdLen === 'short' ? 'short' : ctx.rng() < 0.7 ? 'long' : 'short';
    if (lv === 'low') len = 'short';
    var r = Q.scene(ctx, ids, { len: len, lead: lead, why: '新婚部屋：', leadWhy: '四人の夜（新婚の四人・' + a.name + 'から）',
      fx: function () { for (var i = 0; i < 4; i++) for (var j = i + 1; j < 4; j++) ctx.mod2(o[i], o[j], { att: 3, aff: 2 }, { att: 3, aff: 2 }); } });
    if (!r) return false;
    if (lv === 'low' && r.e) {
      /* ほのめかす：場面の本文を、四人の夜を暗示する文にする */
      r.e.text = SK().fill(ctx, SK().pickT(ctx, R4.QFADE, o[0], o[1]), o[0], o[1], { c: o[2].name, d: o[3].name });
      r.e.lewd = false;
      if (typeof r.e.why === 'string') r.e.why = r.e.why.replace(/・短く）$/, '・ほのめかす）');
    } else if (len === 'long' && r.e) quadLong(ctx, r);
    S.quadSex = (S.quadSex || 0) + 1;
    return true;
  };
})();
/* r18:end */
