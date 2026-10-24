/* 箱庭シミュレーター: モブに襲われたあとの、恋人（想い人）の反応（R18版のみ。エンジンの箱庭で共通）
   受けの住人がモブ（ゾンビ・略奪者など）に襲われたあと（c.flags.mobHit = { at: 何回目, by: 誰に }）、
   恋人、または強く想っている住人が、その人に寄り添う場面。反応は想う側のいちばん強い気質で分ける
   ・怒り（CP・攻撃性）：相手を探しに行こうとする／二度と離れないと誓う
   ・寄り添う（NP・あたたかさ）：何も聞かずに抱きしめる
   ・自分を責める（AC）：守れなかったと泣く
   ・冷静に手当て（A・ドライ）：手当てをして、次に備える
   ・上書き（自由奔放さ・衝動性。二人が恋人で、襲われた人も相手を強く想っているとき）：何度も名前を呼んで抱きしめ、口づけで上書きする（行為の描写はしない）
   襲われた側の受け止め方は、気の弱さ（AC）で分ける（すがりつく／一瞬身を引いてから、ゆっくり預ける）
   恋愛の組は HK.canLove を両方向・HK.ngPair で確かめる。三回あと（ctx.stepIndex）までに一度だけ */
(function () {
  'use strict';
  var HK = window.HK;
  if (!HK || !HK.COMMON || HK.SAFE_ON) return;
  function L(s) { return s.split('|'); }
  function loveOk(a, b) { return !!(HK.canLove && HK.canLove(a, b) && HK.canLove(b, a) && !(HK.ngPair && HK.ngPair(a, b))); }
  var T = {
    rage: L('{a}は{b}の震える肩を見て、拳を握りしめた。「……どこのどいつだ」――今にも飛び出していきそうな{a}の袖を、{b}がそっと掴んで止めた。|{a}は{b}を抱き寄せたまま、低い声で言った。「もう二度と、一人にしない」――その腕は、痛いくらいに強かった。|{a}は黙って{b}の前に膝をつき、手首に残った痕を見つめた。それから、ゆっくりと顔を上げた。その目は、見たことがないほど冷たく燃えていた。'),
    warm: L('{a}は何も聞かずに、{b}を毛布ごと抱きしめた。{b}が話し出すまで、ずっとそうしていた。|{a}は{b}の髪を撫でながら、「大丈夫。もう大丈夫だから」と何度も繰り返した。|{a}は温かい飲み物を{b}の手に持たせ、その手を自分の両手で包んだ。「ここにいるよ」'),
    guilt: L('{a}は{b}の前で、崩れるように座り込んだ。「ごめん……守れなかった……」――泣いているのは、{a}のほうだった。|{a}は{b}の手を握ったまま、何度も「ごめん」と謝った。{b}は首を振り、{a}の頭を胸に抱いた。|{a}は、あのとき{b}のそばを離れた自分を、どうしても許せなかった。'),
    cool: L('{a}は黙って救急箱を開き、{b}の傷を一つずつ手当てした。手つきは落ち着いていたが、指先だけがかすかに震えていた。|{a}「まず傷を見せて。……それから、次はこうならないように考えよう」――{a}の声はいつもどおりだったが、{b}の手を握る力は強かった。|{a}は{b}の体を拭いてやり、着替えを用意し、寝床を整えた。それが終わってから、ようやく{b}を抱きしめた。'),
    over: L('{a}は{b}の頬を両手で包み、何度も名前を呼んだ。「{b}は、こっちだけ見てて」――重ねられた唇は、触れられた記憶を一つずつ塗り替えていくようだった。|{a}は{b}の首筋の痕に、上から自分の口づけを重ねた。「全部、上書きする」――{b}は目を閉じて、その熱に身を任せた。|{a}は{b}を胸に閉じ込めて、離さなかった。「忘れさせてやる。……俺のことしか、考えられないくらいに」')
  };
  var BACK = {
    cling: L('{b}は堰を切ったように泣き出し、{a}にしがみついた。|{b}は{a}の胸に顔を埋めて、ようやく息を吐いた。|{b}は小さく頷いて、{a}の服の裾を握りしめた。'),
    flinch: L('{b}は触れられた瞬間、びくりと身を引いた。それから、相手が{a}だと分かって、ゆっくりと体を預けた。|{b}は一瞬目を逸らしたが、{a}の手が離れていかないのを感じて、そっと握り返した。|{b}は「……汚れてる、から」と呟いた。{a}は首を振って、それでも抱きしめた。')
  };
  function kindOf(a, b, ctx) {
    var t = a.tr || {}, rb = ctx.R(b, a);
    var sc = {
      rage: (t.cp || 0) * 0.6 + (t.aggr || 0) * 0.8,
      warm: (t.np || 0) * 0.8 + (t.warmth || 0) * 0.5,
      guilt: (t.ac || 0) * 0.9,
      cool: (t.a || 0) * 0.6 + (t.cold || 0) * 0.6,
      over: ctx.pair(a, b).couple && rb.att > 45 ? (t.fc || 0) * 0.6 + (t.impulse || 0) * 0.6 : -1
    };
    return Object.keys(sc).sort(function (x, y) { return sc[y] - sc[x]; })[0];
  }
  function partnerOf(ctx, b) {
    var here = ctx.present ? ctx.present() : ctx.chars;
    return here.filter(function (a) { return a !== b && loveOk(a, b) && (ctx.pair(a, b).couple || ctx.R(a, b).att > 45); })
      .sort(function (x, y) { return (ctx.pair(y, b).couple ? 100 : 0) + ctx.R(y, b).att - (ctx.pair(x, b).couple ? 100 : 0) - ctx.R(x, b).att; })[0] || null;
  }
  HK.COMMON.push({
    id: 'mob_after', cat: 'romance', scope: 'solo',
    when: function (ctx, b) { var h = b.flags && b.flags.mobHit; return !!h && !h.done && ctx.stepIndex - h.at <= 3 && !!partnerOf(ctx, b); },
    w: function () { return 3; }, pri: true,
    run: function (ctx, b) {
      var h = b.flags.mobHit, a = partnerOf(ctx, b); h.done = true;
      var k = kindOf(a, b, ctx), bk = (b.tr && b.tr.ac > 0.55) || ctx.rng() < 0.3 ? 'flinch' : 'cling';
      ctx.mod2(a, b, { att: 3, aff: 4 }, { trust: 8, aff: 6, att: k === 'over' ? 5 : 2 });
      if (k === 'rage') ctx.mod(a, b, { ten: 2 });
      if (ctx.stress) { ctx.stress(b, -10); ctx.stress(a, k === 'guilt' ? 8 : 4); }
      var lab = { rage: '怒り、二度と離れないと誓う（CP・攻撃性）', warm: '何も聞かずに寄り添う（NP）', guilt: '守れなかった自分を責める（AC）', cool: '冷静に手当てをする（A）', over: '口づけで上書きする（自由奔放さ・衝動性）' }[k];
      return { with: [a], text: ctx.t(ctx.pick(T[k]) + ctx.pick(BACK[bk]), a, b), why: b.name + 'が' + (h.by || 'モブ') + 'に襲われたあと、' + (ctx.pair(a, b).couple ? '恋人の' : '想いを寄せる') + a.name + 'の反応：' + lab, mag: 16 };
    }
  });
})();
