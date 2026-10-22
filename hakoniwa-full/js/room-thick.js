/* 箱庭シミュレーター: 出られない部屋（R18版のみ）― 条件の「エッチ」を果たす山場を、段落に分けて厚くする（400字前後）
   room-lewd.js の HK.RoomLewd.scene を包む。厚くするのは、はじめての「エッチ」（will／des／aphro）で、道具を使わない場面だけ。
   女性どうしの場面・二回目以降・道具・スピード型は、これまでどおり room-lewd.js の文。
   リード役の決め方・敵視の強引さ・受け攻めの指定は room-lewd.js と同じ。文は thick-sex.js（HK.ThickSex）。
   嫉妬で取り戻しに行った場面（solo-room-jealous.js の opt.jealous）で、嫉妬した本人が攻めのときだけ、首を押さえる書き方がありうる */
(function () {
  'use strict';
  var HK = window.HK, LW = HK.RoomLewd, T = HK.ThickSex;
  if (!LW || !T || !LW.scene) return;
  function L(s) { return s.split('|'); }

  /* 白い部屋ならではの始まり（型ごと。始まりの段落に足す） */
  var ROOM = {
    rough: L('扉の紙を一度だけ睨んでから、{a}は{b}を簡易ベッドへ引きずり込んだ。|白い照明の下で、{a}は{b}を壁際に追い詰めた。'),
    gentle: L('白い部屋の静けさの中で、{a}は{b}の手をそっと取った。|{a}は簡易ベッドの縁に{b}を座らせ、隣に腰を下ろした。'),
    tease: L('{a}は扉の紙を指でなぞり、「条件、ちゃんと果たそうか」と笑った。|{a}は監視カメラの方をちらりと見てから、{b}の耳元に唇を寄せた。'),
    playful: L('{a}は「条件クリア、いってみよう」と言って{b}をベッドに引っぱり込んだ。|{a}は扉の紙を読み上げて、わざとらしく咳払いをした。'),
    clinical: L('{a}は扉の紙を確かめ、「必要な手順だ」とだけ言った。|{a}は時計を一度見てから、照明を一段落とした。'),
    clumsy: L('二人はしばらく、扉の紙と互いの顔を交互に見ていた。|{a}は「えっと……じゃあ、するね」と、ぎこちなく{b}の肩に手を置いた。')
  };
  var APHRO = L('媚薬で敏感になった{b}は、指先が触れるだけで腰が跳ねた。|部屋に満ちた甘い匂いのせいで、{a}も{b}も、もう待てなかった。');
  /* 余韻（条件を果たしたあと。扉が開くかどうかで使い分け） */
  var AFTER = {
    will: L('終わったあと、{b}は{a}の腕の中で、しばらく扉の方を見なかった。{a}は{b}の背中に毛布をかけて、汗の引いていく肩を撫で続けた。|{a}と{b}は汗ばんだ額を合わせたまま、息が整うのを待った。どこかで、カチリと錠の外れる音がした。'),
    des: L('終わったあと、二人は背中合わせで服を着た。どちらも何も言わなかった。シーツに残った熱だけが、妙に長く消えなかった。|{a}は「……ごめん」と言った。{b}は首を振ったが、顔は上げなかった。白い照明が、やけに眩しかった。'),
    aphro: L('媚薬が抜けるまで、二人は何度も求め合った。正気に戻ったとき、どちらも顔を上げられなかった。|熱が引いたあと、{b}は顔を覆って「全部、媚薬のせいだから」と繰り返した。{a}は「うん」とだけ答えて、乱れた髪を直してやった。')
  };
  var OPENED = /扉|錠|出られる|行こう/;

  var s0 = LW.scene;
  LW.scene = function (ctx, a, b, mode, opt) {
    opt = opt || {};
    if (HK.SAFE_ON || opt.toolText || !(mode === 'will' || mode === 'des' || mode === 'aphro')) return s0.apply(this, arguments);
    if (HK.Pos && !HK.Pos.okSex(a, b)) return s0.apply(this, arguments);
    var lr = opt.lead ? (HK.Pos ? HK.Pos.order(a, b, ctx.rng() < 0.6 ? HK.Pos.fbFor(a, b) : [a, b]) : [a, b]) : LW.lead(ctx, a, b), A = lr[0], B = lr[1];
    if (HK.Pos && HK.Pos.ff(A, B)) return s0.apply(this, arguments);
    var fx = HK.Pos ? HK.Pos.fixed(A, B) : false;
    var HKr = HK.HateKit, rough = HKr ? HKr.forcer(ctx, A, B) : null;
    if (rough && rough === B && !fx) { var sw = A; A = B; B = sw; }
    var x = A.tr || {}, exp = ctx.stat ? ctx.stat(A, 'exp') : null;
    var st = rough ? 'rough' : mode === 'des' && x.cold > 0.55 ? 'clinical' : T.style(A, exp);
    var pick = function (arr) { return ctx.pick(arr); };
    var open = (rough && HK.TL ? A.name + 'は' + B.name + 'の手首を掴んで、ベッドへ乱暴に押し倒した。' + HK.TL.line(A, 'H_ROUGH', B) : pick(ROOM[st] || ROOM.gentle)) + pick(T.OPEN[st] || T.OPEN.gentle);
    if (mode === 'aphro') open += pick(APHRO);
    var API = HK.RoomAPI, opened = !API || !API.pairDone || API.pairDone(ctx, a, b);
    var af = opened ? AFTER[mode] : AFTER[mode].filter(function (l) { return !OPENED.test(l); });
    var r = T.scene({ pick: pick, rng: ctx.rng, a: A, b: B, style: st, open: open, after: pick(af.length ? af : AFTER[mode]), jealous: !!opt.jealous && A === a });
    return ctx.t(r.text, A, B) + (opt.dash ? '――' : '');
  };
})();
