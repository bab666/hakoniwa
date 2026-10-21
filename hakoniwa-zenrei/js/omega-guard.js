/* 箱庭シミュレーター: オメガバース ― 番になったあとのネックガード
   番になったあと、αが優しい（NP・思いやりが高い）か独占欲が強い（嫉妬しやすさが高い）と、Ωにネックガードを贈る。
   贈る理由（守りたい／自分のものだと示したい／その両方）と、受け取るΩの反応は性格で変わる。
   どちらでもないαは贈らない（行動はエゴグラムの数値だけで決まる） */
(function () {
  'use strict';
  var HK = window.HK, OM = HK.OMEGA, scen = HK.SCENARIOS && HK.SCENARIOS.omega;
  if (!scen || !OM) return;
  function L(s) { return s.split('|'); }
  function key(a, b) { return a.i < b.i ? a.i + '-' + b.i : b.i + '-' + a.i; }
  function sx(c) { return c.om && c.om.sex; }
  function top(c) { return HK.voiceTop ? HK.voiceTop(c) : 'NP'; }
  function kind(t) { return Math.max(t.np, t.warmth); }

  /* {a}=α {b}=Ω */
  var GIVE = {
    kind: L('{a}は小さな箱を{b}に差し出した。中には、柔らかい革のネックガードが入っていた。「番になっても、外では何があるか分からないから。……苦しくないものを選んだつもり」|ある朝、{a}は「肌に合うか試して」と言って、{b}の首に裏地の柔らかいネックガードを当てた。噛み跡がこすれないように、内側には布が貼ってあった。|{a}は何日も店を回って、{b}の肌の色に合うネックガードを探してきた。「噛み跡、まだ痛むだろ。人に見られるのも嫌かと思って」|{a}は{b}の首にそっとネックガードを留めた。「これで、知らない誰かに怯えなくていい。外すのは、俺の前だけでいいから」'),
    own: L('{a}は黙って、{b}の首にネックガードを巻いた。留め具の内側には、{a}の名前が刻んであった。「これで誰が見ても分かる。お前が誰のものか」|{a}が贈ったのは、鍵のついたネックガードだった。鍵は{a}のポケットにしまわれた。「外したくなったら、俺に頼めばいい」|「他のαに見せたくない」――{a}はそう言って、{b}のうなじの噛み跡をすっぽり覆うネックガードを着けさせた。色は、{a}の瞳と同じだった。|{a}は{b}の首に、自分の匂いをしみこませたネックガードを留めた。「どこにいても、俺の匂いがするように」'),
    both: L('{a}は{b}の首にネックガードを着けながら言った。「守りたいのも本当。……誰にも触らせたくないのも、本当」|ネックガードの裏には、小さく{a}の名前と、「ずっと」という一言が刻まれていた。{a}は照れくさそうに、それでも目を逸らさなかった。|{a}が選んだのは、柔らかくて、しかもしっかりした鍵のついたネックガードだった。「痛くないように。でも、誰にも外せないように」')
  };
  var REACT = {
    CP: L('{b}は「子ども扱いするな」と言いながら、その日から一度も外さなかった。|{b}は眉をひそめて「大げさだ」と言った。それでも鏡の前で、留め具の位置を何度も直していた。'),
    NP: L('{b}は首元に手を当てて、「ありがとう。大事にするね」と微笑んだ。|{b}は嬉しそうに、お返しに何を贈ろうかと考えはじめた。'),
    A: L('{b}は留め具の作りを確かめてから、「実用的だね。……気に入った」と頷いた。|{b}は素材と強度を一通り確かめ、それから小さく「ありがとう」と言った。'),
    FC: L('{b}は鏡の前でくるりと回って、「似合う？」と何度も聞いた。|{b}はさっそく写真を撮って、待ち受けにした。'),
    AC: L('{b}は首元を押さえたまま、目を潤ませた。「……一生、大事にします」|{b}はしばらく言葉が出ず、それから{a}の胸に顔をうずめた。')
  };
  var REACT_OWN = L('{b}は首元に触れて、少しだけ顔を赤くした。「……重いよ」――それでも、外そうとはしなかった。|{b}は留め具の名前を指でなぞった。逃げ場がなくなったのに、なぜか安心していた。|{b}は「束縛だ」と笑った。笑いながら、{a}の手を首元に引き寄せた。');

  function ok(ctx, a, b) {
    var om = ctx.om;
    return om && sx(a) === 'a' && sx(b) === 'o' && om.bonded[key(a, b)] && ctx.pair(a, b).couple && a.alive !== false && b.alive !== false && !(om.guard || {})[b.i] && (kind(a.tr) >= 0.55 || a.tr.jealous >= 0.55);
  }
  function give(ctx, a, b) {
    var om = ctx.om, k = kind(a.tr), j = a.tr.jealous;
    var why = k >= 0.55 && j >= 0.55 ? 'both' : j > k ? 'own' : 'kind';
    (om.guard = om.guard || {})[b.i] = { by: a.i, why: why, at: ctx.stepIndex };
    var react = why === 'kind' || ctx.rng() < 0.4 ? ctx.pick(REACT[top(b)] || REACT.NP) : ctx.pick(REACT_OWN);
    var whyT = { kind: a.name + 'の優しさ（NP・思いやり）。番になった' + b.name + 'を守りたい', own: a.name + 'の独占欲（嫉妬しやすさ）。' + b.name + 'が自分のものだと示したい', both: a.name + 'の優しさと独占欲の両方' }[why];
    return { text: ctx.t(ctx.pick(GIVE[why]) + react, a, b), why: whyT, kind: why };
  }
  /* 箱庭の終わりまでに贈る機会がなかった二人は、後日談で */
  OM.guardLate = function (ctx, x, y) {
    var a = sx(x) === 'a' ? x : y, b = a === x ? y : x;
    if (!ok(ctx, a, b)) return;
    var g = give(ctx, a, b);
    ctx.say({ kind: 'event', cat: 'romance', actors: [a, b], text: '――番になって少し経ったころ。' + g.text, why: g.why + '（後日談）' });
  };
  OM.guard = function (ctx, c) { return !!(ctx.om && ctx.om.guard && ctx.om.guard[c.i]); };
  scen.events.push({
    id: 'om_neckguard', cat: 'romance', scope: 'pair', pri: true,
    when: function (ctx, a, b) {
      if (!ok(ctx, a, b)) return false;
      var at = ctx.om.bondAt && ctx.om.bondAt[key(a, b)];
      return at == null || ctx.stepIndex - at >= 1;
    },
    w: function (ctx, a) { return 1.6 + Math.max(kind(a.tr), a.tr.jealous) * 2; },
    run: function (ctx, a, b) {
      var g = give(ctx, a, b);
      ctx.mod2(a, b, { att: 3, aff: 4, trust: g.kind === 'own' ? 1 : 4 }, { att: 4, aff: 5, trust: g.kind === 'own' ? 2 : 5 });
      return { text: g.text, why: g.why, mag: 18 };
    }
  });
})();
