/* 箱庭シミュレーター: 女性が攻め・男性が受けの組の「女性上位」の小さな出来事（全年齢版・R18版共通）
   自分で「攻め」を選んだ女性が、気になる男性を自分から押し倒して跨り、見下ろしていじめる（焦らす・手首を押さえる・罰ゲームと言って離さない）。
   はっきりした描写はせず、どちらの版でも出せる曖昧な書き方にする。{a}=女性（攻め）、{b}=男性（受け）
   無人島・ゾンビ・出られない部屋の小イベントとして足す */
(function () {
  'use strict';
  var HK = window.HK;
  if (!HK || !HK.addMini) return;
  function L(s) { return s.split('|'); }
  var TEXT = {
    island: L('焚き火が小さくなった夜、{a}は寝床の{b}に跨って、見下ろした。「逃げても、島からは出られないよ」――{b}が何か言いかける前に、{a}は唇で塞いだ。|{a}は浜辺で{b}を砂の上に押し倒し、そのままお腹の上に座り込んだ。「今日、魚を逃したでしょ。罰ゲーム」――{b}は真っ赤になって、されるがままになっていた。|{a}は水浴びから戻った{b}の手首を掴み、ヤシの木の陰で押さえつけた。耳元で何かを囁くと、{b}は息を呑んで目を逸らした。|雨の夜、洞窟の奥で、{a}は{b}の上に跨ったまま、わざとゆっくり濡れた髪を拭いてやった。{b}が手を伸ばすたびに、{a}は「まだだめ」と笑って押し戻した。'),
    zombie: L('見張りを交代した夜、{a}は寝袋の{b}に跨って、懐中電灯で顔を照らした。「眠そうだね。……起こしてあげる」――{b}の抗議は、すぐに静かになった。|{a}は{b}をバリケードの壁際に追い詰め、両手首を頭の上で押さえた。「さっき、無茶したよね」――罰だと言って、{a}は{b}が音を上げるまで離さなかった。|{a}は{b}をソファに押し倒して膝の上に座り、「今夜は、こっちが見張り役」と笑った。{b}は観念したように、{a}の腰に手を添えた。'),
    /* 出られない部屋の文（ベッドに押し倒して跨る・服を脱がせる）は R18版だけ。全年齢版の出られない部屋には、この出来事は出ない */
    /* r18:begin */
    whiteroom: L('{a}は{b}をベッドに押し倒して跨り、「この部屋では、こっちのペースでやらせてもらう」と見下ろした。{b}は抵抗しかけて、やめた。|{a}は{b}の両手首をシーツに縫い留めて、わざと唇の手前で止めた。「欲しいなら、ちゃんと言って」――{b}が根負けするまで、{a}は待った。|{a}は{b}の上に座り込み、シャツのボタンを一つずつ、焦らすように外していった。{b}が身じろぎするたびに、{a}は楽しそうに目を細めた。')
    /* r18:end */
  };
  var TAIL = L('{b}は顔を覆って「……ずるい」と呟いた。|{b}は、もう{a}の顔をまともに見られなかった。|{b}の耳は、しばらく赤いままだった。|{a}は満足そうに{b}の上から降りて、「続きは、また今度」と笑った。');
  function src(c, k) { return c ? (c[k] != null && c[k] !== '' ? c[k] : (c.src && c.src[k]) || '') : ''; }
  function ok(ctx, a, b) {
    var P = HK.Pos;
    if (!P || !b || !P.isF(a) || !P.isTop(a) || src(b, 'gender') !== 'm' || !P.okSex(a, b)) return false;
    if (HK.canLove && (!HK.canLove(a, b) || !HK.canLove(b, a))) return false;
    var pr = ctx.pair ? ctx.pair(a, b) : {};
    return !!(pr.couple || pr.night || (ctx.R(a, b).att > 25 && ctx.R(b, a).att > 12));
  }
  Object.keys(TEXT).forEach(function (sid) {
    HK.addMini(sid, [{
      id: 'fm_tease_' + sid, cat: 'romance', scope: 'pair', mini: true,
      when: function (ctx, a, b) { return ok(ctx, a, b) && (ctx.pair(a, b).fmTease || 0) < 2; },
      w: function (ctx, a, b) { var t = a.tr || {}; return 0.5 + ctx.R(a, b).att / 70 + (t.cp || 0) * 0.4 + (t.fc || 0) * 0.3 + (ctx.pair(a, b).couple ? 0.6 : 0); },
      run: function (ctx, a, b) {
        var pr = ctx.pair(a, b); pr.fmTease = (pr.fmTease || 0) + 1;
        ctx.mod(a, b, { att: 5, aff: 3 }, 1.2); ctx.mod(b, a, { att: 7, aff: 2 }, 1.2);
        var text = ctx.t(ctx.pick(TEXT[sid]), a, b) + (ctx.rng() < 0.6 ? ctx.t(ctx.pick(TAIL), a, b) : '');
        return { text: text, why: a.name + 'は自分で「攻め」を選んでいて、' + b.name + 'が気になっている（自分から跨っていじめる）' };
      }
    }]);
  });
})();
