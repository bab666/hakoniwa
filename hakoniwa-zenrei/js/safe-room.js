/* 箱庭シミュレーター: 全年齢版 ― 出られない部屋の「エッチ」の場面を、少し曖昧に描く
   ・触れ合い（キス・抱きしめる・照明を落とす）までは書き、その先は暗転する
   ・誰がリードするか、どんな雰囲気かは R18版と同じく気質で決まる（文だけ差し替える）
   R18版でも、描写の有無が「ほのめかす」のときは、この書き方を使う（HK.RoomFade。room-thick.js が呼ぶ）。
   全年齢モードでないときは、それ以外は何もしない */
(function () {
  'use strict';
  var HK = window.HK, L = HK.RoomLewd;
  if (!L) return;
  function st(c) {
    var x = c.tr;
    if (x.aggr > 0.6 && x.np < 0.5) return 'rough';
    if (x.cold > 0.55 && x.a > 0.55) return 'cool';
    if (x.np > 0.62) return 'gentle';
    if (x.fc > 0.62) return 'playful';
    if (x.ac > 0.65) return 'clumsy';
    return x.cp > 0.55 ? 'rough' : 'gentle';
  }
  var NEAR = {
    rough: ['{a}は{b}の手首を掴んで引き寄せ、有無を言わせずに唇を塞いだ。', '{a}は{b}を壁際に追い詰め、逃げ道を腕で塞いだ。「もう、待たない」', '{a}は{b}をベッドに押し倒すように抱きすくめ、首筋に顔を埋めた。'],
    gentle: ['{a}は{b}の頬に手を添えて、「嫌だったら、すぐ言って」と囁いてから、そっと唇を重ねた。', '{a}は{b}の髪を撫でながら、額、瞼、頬と順番にキスを落とした。', '{a}は{b}を毛布ごと抱き寄せた。二人の鼓動が、同じ速さになっていった。'],
    cool: ['{a}は「条件を満たすだけだ」と言いながら、{b}の顎を持ち上げた。手つきは、思ったより優しかった。', '{a}は照明を一段落とし、{b}の隣に腰を下ろした。「目を閉じてろ」', '{a}は{b}の手首に触れて、「緊張してるな」とだけ言った。それから、ゆっくり抱き寄せた。'],
    playful: ['{a}は「条件クリア、頑張ろうね」と真顔で言って、{b}を吹き出させた。その隙に、キスをした。', '{a}は{b}をお姫様抱っこでベッドまで運び、一緒に倒れ込んで笑った。', '{a}は{b}をくすぐって押し倒し、笑い疲れた{b}の唇を、そっと塞いだ。'],
    clumsy: ['{a}はキスをしようとして、{b}の鼻にぶつかった。二人で笑ってから、もう一度ちゃんと唇を重ねた。', '{a}と{b}は、照明を消すかどうかで三回揉めた。結局、半分だけ落とした。', '{a}は「あの、上手くないかもだけど」と前置きした。{b}は「知ってる」と笑って、{a}の手を握った。']
  };
  var MID = ['{a}は{b}をベッドに横たえ、照明を落とした。', '{b}の指が、{a}のシャツのボタンにかかった。', '二人は毛布の中で、互いの体温を確かめ合った。', '{a}が耳元で何かを囁くと、{b}は真っ赤になって頷いた。', '{b}は{a}の背中に腕を回して、目を閉じた。'];
  var FADE = ['――その先のことは、二人だけの秘密だ。', '――そこから先は、閉じた扉の向こうの話だ。', '――照明が消えたあとのことは、誰も知らない。', '――しばらくのあいだ、部屋には二人の息づかいだけがあった。'];
  var AFTER = {
    will: ['しばらくして、{b}は{a}の腕の中で「……扉、開いちゃったね」と残念そうに言った。', '{a}は{b}の髪を指で梳きながら、「出たら、ちゃんとデートしよう」と言った。', '二人は毛布にくるまったまま、扉が開く音を聞いても、すぐには起き上がらなかった。'],
    des: ['しばらくして、二人は背中合わせで身支度を整えた。どちらも何も言わなかった。', '{a}は「忘れていい」と言った。{b}は「忘れられるわけない」と返した。', '扉が開いたとき、先に出たのは{a}だった。{b}は少し遅れて、その背中を追った。'],
    aphro: ['熱が引いたあと、{b}は顔を覆って「全部、薬のせい」と繰り返した。{a}は「うん」とだけ答えた。', '正気に戻った二人は、乱れたシーツを見て同時に目を逸らした。', '{a}は「薬のせいにしていいよ」と言った。{b}は「……ちょっとは、違うかも」と小さく答えた。']
  };
  /* 女性が攻め・男性が受けの組：女性が押し倒して跨り、見下ろして焦らす（曖昧な書き方のまま） */
  var NEAR_FM = ['{a}は{b}をベッドに押し倒して、その上に跨った。「今日は、こっちが上」――見下ろす目が、楽しそうに細められた。', '{a}は{b}の両手首をシーツに押さえつけ、唇が触れる寸前で止めた。「欲しいなら、ちゃんと言って」', '{a}は{b}の胸を軽く突いて仰向けに倒し、腰の上に座り込んだ。「逃げないでね」'];
  var MID_FM = ['{a}は{b}の上に跨ったまま、わざとゆっくり照明を落とした。', '{a}は{b}のシャツのボタンを、焦らすように一つずつ外していった。{b}が身じろぎするたびに、{a}は「まだ」と笑った。', '{b}が手を伸ばすと、{a}はその手首をまた押さえつけた。「動いていいって、言ってない」'];
  function fmLead(A, B) { var P = HK.Pos; return !!(P && P.isF(A) && P.isTop(A) && (B.gender || (B.src && B.src.gender)) === 'm'); }
  var lead0 = L.lead;
  function fadeScene(ctx, a, b, mode, opt) {
    opt = opt || {};
    var lr = lead0 ? lead0(ctx, a, b) : [a, b], A = lr[0], B = lr[1], s = st(A);
    var fm = fmLead(A, B);
    var out = [ctx.pick(fm ? NEAR_FM : NEAR[s]), ctx.pick(fm ? MID_FM : MID), ctx.pick(FADE)];
    if (mode === 'repeat') out = ['{a}と{b}は、もう一度互いを抱き寄せた。', ctx.pick(FADE)];
    if (AFTER[mode]) {
      /* まだ条件が残っている組には、扉が開く・部屋を出る締めを使わない */
      var API = HK.RoomAPI, open = !API || !API.pairDone || API.pairDone(ctx, a, b);
      var af = open ? AFTER[mode] : AFTER[mode].filter(function (l) { return !/扉|出たら/.test(l); });
      out.push(ctx.pick(af.length ? af : AFTER[mode]));
    }
    return out.map(function (x) { return ctx.t(x, A, B); }).join('') + (opt.dash ? '――' : '');
  }
  HK.RoomFade = fadeScene;
  /* 三人の場面のほのめかし（room-trio.js が呼ぶ） */
  var FADE3 = ['三人は照明を落とし、毛布の中で身を寄せ合った。――その先のことは、三人だけの秘密だ。', '誰からともなく、三人の唇が重なった。――そこから先は、閉じた扉の向こうの話だ。', '三人は簡易ベッドに身を沈めた。――しばらくのあいだ、部屋には三人分の息づかいだけがあった。'];
  HK.RoomFade3 = function (ctx) { return ctx.pick(FADE3); };
  if (!HK.SAFE_ON) return;
  L.scene = fadeScene;
  var recap0 = L.recap;
  L.recap = function (ctx, a, b, k, n) { if (k === 'h') return ctx.t('{a}と{b}は、しばらく寄り添ったままでいた。', a, b) + (n > 1 ? '（' + n + '回目）' : ''); return recap0.apply(this, arguments); };
  /* 念のため：出られない部屋の結果に残ったはっきりした文は、ほかの箱庭と同じ方法でまろやかにする */
  var sim0 = HK.simulate;
  HK.simulate = function (input) {
    var r = sim0.apply(this, arguments);
    if (r && input && input.scenId === 'whiteroom' && HK.SafeText) {
      (r.log || []).forEach(function (e) { if (e && typeof e.text === 'string' && EXPL.test(e.text)) e.text = HK.SafeText(e.text) || ctxFade(); });
      if (r.ending && Array.isArray(r.ending.lines)) r.ending.lines = r.ending.lines.map(function (l) { return typeof l === 'string' && EXPL.test(l) ? HK.SafeText(l) : l; });
    }
    return r;
  };
  var EXPL = /挿|果て|達し|イ[っッくかカきキ]|喘|脚の間|貫|腰を[振沈打揺使]|繋が|舐め|脱が|跨|濡れ|奥まで|突き上げ|絶頂|中で/;
  var fi = 0;
  function ctxFade() { return FADE[fi++ % FADE.length].replace(/^――/, ''); }
})();
