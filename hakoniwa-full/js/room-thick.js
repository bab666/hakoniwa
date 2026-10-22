/* 箱庭シミュレーター: 出られない部屋（R18版のみ）― 条件の「エッチ」を果たす山場を、段落に分けて厚くする（400字前後）
   room-lewd.js の HK.RoomLewd.scene を包む。はじめての「エッチ」（will／des／aphro）、二回目以降（repeat）、
   道具を使う場面（opt.toolText）、スピード型（speed：縛った側が動く）、女性どうしの場面を、すべて厚くする。
   リード役の決め方・敵視の強引さ・受け攻めの指定は room-lewd.js と同じ。文は thick-sex.js（HK.ThickSex）。
   形（男性×／女性が跨る／女性どうし）は二人の性別から決まる（thick-sex.js）。女性どうしの道具は、挿入の言葉を使わない書き方で。
   嫉妬で取り戻しに行った場面（solo-room-jealous.js の opt.jealous）で、嫉妬した本人が攻めのときだけ、首を押さえる書き方がありうる */
(function () {
  'use strict';
  var HK = window.HK, LW = HK.RoomLewd, T = HK.ThickSex;
  if (!LW || !T || !LW.scene) return;
  function L(s) { return s.split('|'); }

  /* 白い部屋ならではの始まり（型ごと。始まりの段落に足す） */
  var ROOM = {
    rough: L('扉の紙を一度だけ睨んでから、{a}は{b}を簡易ベッドへ引きずり込んだ。|白い照明の下で、{a}は{b}を壁際に追い詰めた。|{a}は「条件なんだろ」と吐き捨て、{b}の肩を掴んでベッドに押しつけた。|白い床に{b}の上着が投げ捨てられた。{a}は振り返りもしなかった。'),
    gentle: L('白い部屋の静けさの中で、{a}は{b}の手をそっと取った。|{a}は簡易ベッドの縁に{b}を座らせ、隣に腰を下ろした。|{a}は「怖くないよ」と言って、{b}を毛布ごと抱き寄せた。|白い照明を背に、{a}は{b}の頬を両手で包んだ。'),
    tease: L('{a}は扉の紙を指でなぞり、「条件、ちゃんと果たそうか」と笑った。|{a}は監視カメラの方をちらりと見てから、{b}の耳元に唇を寄せた。|{a}は「見られてるかもね」と囁いて、わざとゆっくり{b}の服に手をかけた。|{a}は時計を見上げて、「時間はたっぷりあるから」と微笑んだ。'),
    playful: L('{a}は「条件クリア、いってみよう」と言って{b}をベッドに引っぱり込んだ。|{a}は扉の紙を読み上げて、わざとらしく咳払いをした。|{a}は「せっかくだし楽しもうよ」と言って、{b}をベッドに押し倒した。|{a}は監視カメラに向かってピースしてから、{b}に飛びついた。'),
    clinical: L('{a}は扉の紙を確かめ、「必要な手順だ」とだけ言った。|{a}は時計を一度見てから、照明を一段落とした。|{a}は「効率よく済ませよう」と言って、ためらいなく服を脱いだ。|{a}は扉の文面を読み返し、「条件は満たせる」と頷いた。'),
    clumsy: L('二人はしばらく、扉の紙と互いの顔を交互に見ていた。|{a}は「えっと……じゃあ、するね」と、ぎこちなく{b}の肩に手を置いた。|{a}は「こういうの、初めてで」と打ち明けてから、{b}の手を握った。|二人は白い簡易ベッドの端と端に座ったまま、しばらく動けなかった。先に手を伸ばしたのは{a}だった。')
  };
  var APHRO = L('媚薬で敏感になった{b}は、指先が触れるだけで腰が跳ねた。|部屋に満ちた甘い匂いのせいで、{a}も{b}も、もう待てなかった。|媚薬の熱で、{b}の肌は触れる前から火照っていた。|{b}は自分から{a}にすがりつき、「早く」と掠れた声でねだった。');
  /* 二回目以降：慣れと遠慮のなさ */
  var REPEAT = L('二度目は、さっきよりずっと遠慮がなかった。{a}はもう{b}の弱いところを知っていた。|息が整うのも待たずに、{a}はまた{b}を抱き寄せた。さっきの熱が、まだ肌に残っていた。|回数を重ねるごとに、{b}は{a}の触れ方を覚え、{a}は{b}の声の変わり目を覚えていった。|次は{b}の方から{a}の服に手をかけた。{a}は少し驚いてから、笑ってそれに応えた。');
  /* スピード型：縛った側がそのまま動く（受け攻めの指定で、縛った側が攻めに回れるときだけ呼ばれる） */
  var SPEED = L('手首を縛られて動けない{b}を見下ろし、{a}は「すぐ終わらせる」と言って服をはだけさせた。|{a}は縛った{b}の上に覆いかぶさり、耳元で「力、抜いて」と囁いた。|{a}は身動きの取れない{b}の肌に、時間を惜しむように手を這わせた。');
  /* 道具（女性どうし。挿入の言葉は使わない） */
  var FF_TOY = L('{a}は木箱から細身のローターを取り出し、震える先端を{b}の花芯に押し当てた。{b}の腰が、びくりと浮いた。|{a}は木箱の底にあった双頭の玩具を手に取り、片側を{b}に、もう片側を自分にあてがった。動くたびに、二人分の甘い声が重なった。|{a}は振動する玩具を{b}の脚のあいだに滑らせ、強さを一段ずつ上げていった。');
  /* 余韻（条件を果たしたあと。扉が開くかどうかで使い分け） */
  var AFTER = {
    will: L('終わったあと、{b}は{a}の腕の中で、しばらく扉の方を見なかった。{a}は{b}の背中に毛布をかけて、汗の引いていく肩を撫で続けた。|{a}と{b}は汗ばんだ額を合わせたまま、息が整うのを待った。{b}は{a}の胸に頬を寄せ、規則正しい鼓動を聞いていた。|二人は狭い簡易ベッドで毛布にくるまり、指を絡めたまま天井の白い照明を見上げていた。'),
    des: L('終わったあと、二人は背中合わせで服を着た。どちらも何も言わなかった。シーツに残った熱だけが、妙に長く消えなかった。|{a}は「……ごめん」と言った。{b}は首を振ったが、顔は上げなかった。白い照明が、やけに眩しかった。|{b}は乱れた服を整えながら、さっきの自分の声を思い出して顔を覆った。'),
    aphro: L('媚薬が抜けるまで、二人は何度も求め合った。正気に戻ったとき、どちらも顔を上げられなかった。|熱が引いたあと、{b}は顔を覆って「全部、媚薬のせいだから」と繰り返した。{a}は「うん」とだけ答えて、乱れた髪を直してやった。'),
    repeat: L('二人はシーツに沈んだまま、しばらく天井を見ていた。{b}の指が、まだ{a}の手を探していた。|{a}は{b}の汗ばんだ髪に顔を埋め、「もう一回は、さすがに無理」と笑った。'),
    speed: L('{a}は手早く{b}の手首をほどき、赤くなった跡を指でさすった。|{a}は縛り目をほどいてから、{b}の乱れた服を黙って直してやった。')
  };
  var OPENED = /扉|錠|出られる|行こう/;

  var s0 = LW.scene;
  LW.scene = function (ctx, a, b, mode, opt) {
    opt = opt || {};
    if (HK.SAFE_ON || !(mode === 'will' || mode === 'des' || mode === 'aphro' || mode === 'repeat' || mode === 'speed')) return s0.apply(this, arguments);
    if (HK.Pos && !HK.Pos.okSex(a, b)) return s0.apply(this, arguments);
    var lr = mode === 'speed' ? (HK.Pos ? HK.Pos.order(a, b, [a, b]) : [a, b]) : opt.lead ? (HK.Pos ? HK.Pos.order(a, b, opt.toolText ? [a, b] : ctx.rng() < 0.6 ? HK.Pos.fbFor(a, b) : [a, b]) : [a, b]) : LW.lead(ctx, a, b), A = lr[0], B = lr[1];
    var fx = HK.Pos ? HK.Pos.fixed(A, B) : false;
    var HKr = HK.HateKit, rough = HKr ? HKr.forcer(ctx, A, B) : null;
    if (rough && rough === B && !fx) { var sw = A; A = B; B = sw; }
    var ff = HK.Pos && HK.Pos.ff(A, B);
    var x = A.tr || {}, exp = ctx.stat ? ctx.stat(A, 'exp') : null;
    var st = rough ? 'rough' : mode === 'des' && x.cold > 0.55 ? 'clinical' : T.style(A, exp);
    var pick = function (arr) { return ctx.pick(arr); };
    var head = rough && HK.TL ? A.name + 'は' + B.name + 'の手首を掴んで、ベッドへ乱暴に押し倒した。' + HK.TL.line(A, 'H_ROUGH', B) : '';
    var open;
    if (opt.toolText) open = head + opt.toolText.replace(/――$/, '') + (ff && ctx.rng() < 0.5 ? pick(FF_TOY) : '');
    else if (mode === 'repeat') open = head + pick(REPEAT);
    else if (mode === 'speed') open = head + pick(SPEED);
    else open = head + pick(ROOM[st] || ROOM.gentle) + pick(T.OPEN[st] || T.OPEN.gentle);
    if (mode === 'aphro') open += pick(APHRO);
    var API = HK.RoomAPI, opened = !API || !API.pairDone || API.pairDone(ctx, a, b);
    var al = AFTER[mode] || AFTER.will, af = opened ? al : al.filter(function (l) { return !OPENED.test(l); });
    var r = T.scene({ pick: pick, rng: ctx.rng, a: A, b: B, style: st, open: open, after: pick(af.length ? af : al), place: 'room', jealous: !!opt.jealous && A === a });
    var txt = ctx.t(r.text, A, B);
    if (ff && HK.FF && HK.FF.fix) txt = HK.FF.fix(ctx, txt, A, B, { tools: !!(ctx.flags && ctx.flags.toolbox) });
    return txt + (opt.dash ? '――' : '');
  };
})();
