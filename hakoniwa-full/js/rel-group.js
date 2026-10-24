/* 箱庭シミュレーター: 複数人が絡む恋愛の「仲良し系」の場面（全エンジン箱庭で共通。全年齢版も同じ）
   設計指針：三人以上が絡む恋愛の出来事は、嫉妬・失恋・三角関係（すれ違い系）と、応援・祝福・ダブルデート（仲良し系）を半々くらいに。
   すれ違い系はすでに多い（失恋・恋敵・三人の場面の嫉妬・執着）ので、ここでは仲良し系を足す。点検は hakoniwa-tools/tone-check/group-audit.js
   ・冷やかし・応援：恋人どうしを、友達がからかって応援する
   ・恋バナ：誰かを想っている人が、友達に打ち明けて背中を押される
   ・二人きりに：友達が、想い合いそうな二人を二人きりにしてあげる
   ・ダブルデート：恋人どうしの二組が一緒に過ごす
   ・祝福：想っていた相手が恋人と結ばれたのを、身を引いて祝福する
   恋愛を動かす組（惹かれを足す二人）は HK.canLove を両方向・HK.ngPair で確かめる。三人目は、その場にいる人（ctx.present） */
(function () {
  'use strict';
  var HK = window.HK;
  if (!HK || !HK.COMMON) return;
  function L(s) { return s.split('|'); }
  function R(ctx, a, b) { return ctx.R(a, b); }
  function couple(ctx, a, b) { return !!(a && b && a !== b && ctx.pair(a, b).couple); }
  function loveOk(a, b) { return !!(a && b && a !== b && HK.canLove(a, b) && HK.canLove(b, a) && !(HK.ngPair && HK.ngPair(a, b))); }
  function here(ctx) { return ctx.present ? ctx.present() : ctx.chars; }
  function friendly(ctx, a, b) { return R(ctx, a, b).aff > 15 && R(ctx, a, b).ten < 35; }
  function loverOf(ctx, b, not) { return here(ctx).filter(function (c) { return c !== b && c !== not && couple(ctx, b, c); })[0] || null; }
  function d4(t, d) { return t.replace(/\{d\}/g, d ? d.name : ''); }
  var TX = {
    cheer: L('{a}は、{b}と{c}が並んでいるのを見て、わざとらしく咳払いした。「はいはい、仲がよろしいことで」――{b}は赤くなり、{c}は笑って{b}の肩を抱き寄せた。|{a}「{b}、{c}のこと、ちゃんと大事にしなよ」――{b}は照れくさそうに頷いた。{c}は聞こえないふりをしていたが、耳まで赤かった。|{a}は{b}と{c}のために、こっそり二人分の飲み物を用意しておいた。「たまには二人でゆっくりしなよ」|{a}は{b}と{c}をからかいながら、二人の間の席をそっと空けてやった。{b}と{c}は顔を見合わせて、少しだけ肩を寄せた。'),
    koibana: L('{a}は{b}にだけ、{c}のことが気になっていると打ち明けた。{b}は目を輝かせた。「え、いいじゃん。応援する」|{b}「で、{c}とはどうなの？」――{a}は慌てて否定したが、{b}にはもうお見通しだった。|{a}と{b}は、夜更けまで恋の話をした。{c}の名前が出るたび、{a}は顔を伏せた。|{b}は{a}の背中を軽く叩いた。「{c}、絶対{a}のこと見てるって。次、話しかけてみなよ」'),
    match: L('{a}は「ちょっと用事を思い出した」と言って席を立ち、{b}と{c}を二人きりにした。去り際、{a}は{b}に小さく目配せした。|{a}は{b}と{c}を同じ見張りの番に組ませた。二人がぎこちなく話し始めるのを見て、{a}は満足そうに頷いた。|{a}「{c}、{b}が話したいことあるって」――{b}は{a}を睨んだが、{c}は優しく笑って「何？」と聞き返した。|{a}は{b}と{c}が二人になれるよう、ほかの人たちをさりげなく別の用事に誘い出した。'),
    double: L('{a}と{b}、{c}と{d}は、二組並んで食事を囲んだ。誰がいちばん惚気るかで、ささやかな言い合いになった。|{a}と{b}は、{c}と{d}を誘って四人で過ごした。帰り道、二組の歩く速さは自然と同じになっていた。|{c}と{d}の小さな喧嘩の仲裁を、{a}と{b}が買って出た。結局、四人で笑って終わった。|{a}が{b}の世話を焼くのを見て、{c}は{d}の顔をちらりと見た。{d}は黙って{c}の手を取った。'),
    bless: L('{a}は{b}と{c}に向かって、まっすぐに言った。「おめでとう。……二人なら、きっと大丈夫」――胸の痛みは、言ってしまえば少しだけ軽くなった。|{a}は、{b}が{c}の隣で笑っているのを見て、ようやく踏ん切りがついた。{a}「{c}、{b}のこと泣かせたら許さないから」|{a}は{b}への想いを胸にしまい、二人の背中を押すことにした。「ほら、行ってきなよ」')
  };
  function ev(o) { HK.COMMON.push(o); }
  /* 冷やかし・応援（a＝友達、b＝恋人の片方、c＝b の恋人） */
  ev({
    id: 'grp_cheer', cat: 'bond', scope: 'pair',
    when: function (ctx, a, b) { var c = loverOf(ctx, b, a); return !!c && !couple(ctx, a, b) && friendly(ctx, a, b) && friendly(ctx, a, c); },
    w: function () { return 0.2; },
    run: function (ctx, a, b) {
      var c = loverOf(ctx, b, a);
      ctx.mod2(b, c, { att: 3, aff: 2 }, { att: 3, aff: 2 }); ctx.mod2(a, b, { aff: 2 }, { aff: 3, trust: 2 });
      return { with: [c], text: ctx.t(ctx.pick(TX.cheer), a, b, c), why: a.name + 'が、恋人どうしの' + b.name + 'と' + c.name + 'を冷やかして応援した（仲良し）', mag: 10 };
    }
  });
  /* 恋バナ（a＝想っている人、b＝友達、c＝a の想う相手） */
  function crushOf(ctx, a, not) { return here(ctx).filter(function (c) { return c !== a && c !== not && R(ctx, a, c).att > 35 && !couple(ctx, a, c) && loveOk(a, c); }).sort(function (x, y) { return R(ctx, a, y).att - R(ctx, a, x).att; })[0] || null; }
  ev({
    id: 'grp_koibana', cat: 'bond', scope: 'pair',
    when: function (ctx, a, b) { return !couple(ctx, a, b) && friendly(ctx, a, b) && friendly(ctx, b, a) && !!crushOf(ctx, a, b); },
    w: function (ctx, a) { return 0.3 + a.tr.honesty * 0.2; },
    run: function (ctx, a, b) {
      var c = crushOf(ctx, a, b);
      ctx.mod(a, c, { att: 3 }); ctx.mod2(a, b, { trust: 4, aff: 2 }, { trust: 3, aff: 2 });
      return { with: [c], text: ctx.t(ctx.pick(TX.koibana), a, b, c), why: a.name + 'が' + b.name + 'に、' + c.name + 'への想いを打ち明けた（恋バナ・仲良し）', mag: 8 };
    }
  });
  /* 二人きりに（a＝友達、b＝想っている人、c＝b の想う相手。c も b を悪く思っていない） */
  ev({
    id: 'grp_match', cat: 'bond', scope: 'pair',
    when: function (ctx, a, b) { var c = crushOf(ctx, b, a); return !!c && R(ctx, c, b).att > 20 && friendly(ctx, a, b) && a.tr.np + a.tr.fc > 0.8; },
    w: function () { return 0.2; },
    run: function (ctx, a, b) {
      var c = crushOf(ctx, b, a);
      ctx.mod2(b, c, { att: 4, trust: 3 }, { att: 4, trust: 3 }); ctx.mod(b, a, { trust: 3 });
      return { with: [c], text: ctx.t(ctx.pick(TX.match), a, b, c), why: a.name + 'が、' + b.name + 'と' + c.name + 'を二人きりにした（仲良し）', mag: 10 };
    }
  });
  /* ダブルデート（a・b＝恋人どうし、c・d＝もう一組の恋人どうし） */
  function otherCouple(ctx, a, b) {
    var P = here(ctx);
    for (var i = 0; i < P.length; i++) for (var j = i + 1; j < P.length; j++) {
      var c = P[i], d = P[j];
      if ([a, b].indexOf(c) < 0 && [a, b].indexOf(d) < 0 && couple(ctx, c, d)) return [c, d];
    }
    return null;
  }
  ev({
    id: 'grp_double', cat: 'bond', scope: 'pair',
    when: function (ctx, a, b) { return couple(ctx, a, b) && !!otherCouple(ctx, a, b); },
    w: function () { return 0.2; },
    run: function (ctx, a, b) {
      var cd = otherCouple(ctx, a, b), c = cd[0], d = cd[1];
      ctx.mod2(a, b, { att: 2, aff: 2 }, { att: 2, aff: 2 }); ctx.mod2(c, d, { att: 2, aff: 2 }, { att: 2, aff: 2 });
      [[a, c], [a, d], [b, c], [b, d]].forEach(function (p) { ctx.mod2(p[0], p[1], { aff: 2, trust: 2 }, { aff: 2, trust: 2 }); });
      return { with: [c, d], text: ctx.t(d4(ctx.pick(TX.double), d), a, b, c), why: a.name + 'と' + b.name + '、' + c.name + 'と' + d.name + 'の二組で過ごした（ダブルデート・仲良し）', mag: 10 };
    }
  });
  /* 祝福（a＝b を想っていた人、b＝想われていた人、c＝b の恋人） */
  ev({
    id: 'grp_bless', cat: 'bond', scope: 'pair',
    when: function (ctx, a, b) { var c = loverOf(ctx, b, a); return !!c && R(ctx, a, b).att > 35 && !couple(ctx, a, b) && a.tr.np > 0.45 && !(a.flags && a.flags.blessed === b.i); },
    w: function (ctx, a) { return 0.3 + a.tr.np * 0.3; },
    run: function (ctx, a, b) {
      var c = loverOf(ctx, b, a);
      a.flags.blessed = b.i;
      ctx.mod(a, b, { att: -15, aff: 4 }); ctx.mod2(a, c, { aff: 6, ten: -6 }, { aff: 6, trust: 5 }); ctx.mod(b, a, { trust: 6, aff: 4 });
      return { with: [c], text: ctx.t(ctx.pick(TX.bless), a, b, c), why: a.name + 'は' + b.name + 'への想いを胸にしまい、' + c.name + 'との仲を祝福した（祝福・仲良し）', mag: 14 };
    }
  });
})();
