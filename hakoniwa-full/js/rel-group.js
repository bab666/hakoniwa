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
  /* 恋人（複数の恋人がいる人は、その場にいる最初の一人。poly.js の HK.Poly.lovers） */
  function loverOf(ctx, b, not) { var ls = HK.Poly && HK.Poly.lovers ? HK.Poly.lovers(ctx, b) : here(ctx).filter(function (c) { return c !== b && couple(ctx, b, c); }); var hs = here(ctx); return ls.filter(function (c) { return c !== not && hs.indexOf(c) >= 0; })[0] || null; }
  function d4(t, d) { return t.replace(/\{d\}/g, d ? d.name : ''); }
  var TX = {
    cheer: L('{a}は、{b}と{c}が並んでいるのを見て、わざとらしく咳払いした。「はいはい、仲がよろしいことで｜やれやれ、仲がよろしいことだ｜はいはい、仲がよろしいことですね」――{b}は赤くなり、{c}は笑って{b}の肩を抱き寄せた。|{a}「{b}、{c}のこと、ちゃんと大事にしなよ｜{b}、{c}のことを、ちゃんと大事にしろ｜{b}、{c}のこと、ちゃんと大事にしてくださいね」――{b}は照れくさそうに頷いた。{c}は聞こえないふりをしていたが、耳まで赤かった。|{a}は{b}と{c}のために、こっそり二人分の飲み物を用意しておいた。「たまには二人でゆっくりしなよ｜たまには二人でゆっくりしろ｜たまには二人でゆっくりしてください」|{a}は{b}と{c}をからかいながら、二人の間の席をそっと空けてやった。{b}と{c}は顔を見合わせて、少しだけ肩を寄せた。'),
    koibana: L('{a}は{b}にだけ、{c}のことが気になっていると打ち明けた。{b}は目を輝かせた。「え、いいじゃん。応援する｜ほう、いいじゃないか。応援する｜え、いいですね。応援します」|{b}「で、{c}とはどうなの？｜で、{c}とはどうなんだ？｜で、{c}とはどうなんですか？」――{a}は慌てて否定したが、{b}にはもうお見通しだった。|{a}と{b}は、夜更けまで恋の話をした。{c}の名前が出るたび、{a}は顔を伏せた。|{b}は{a}の背中を軽く叩いた。「{c}、絶対{a}のこと見てるって。次、話しかけてみなよ｜{c}は、絶対に{a}のことを見ている。次、話しかけてみろ｜{c}、絶対{a}のこと見てますよ。次、話しかけてみてください」'),
    match: L('{a}は「ちょっと用事を思い出した｜＝｜ちょっと用事を思い出しました」と言って席を立ち、{b}と{c}を二人きりにした。去り際、{a}は{b}に小さく目配せした。|{a}は{b}と{c}を同じ見張りの番に組ませた。二人がぎこちなく話し始めるのを見て、{a}は満足そうに頷いた。|{a}「{c}、{b}が話したいことあるって｜{c}、{b}が話したいことがあるそうだ｜{c}、{b}が話したいことがあるそうです」――{b}は{a}を睨んだが、{c}は優しく笑って「何？｜何だ？｜何ですか？」と聞き返した。|{a}は{b}と{c}が二人になれるよう、ほかの人たちをさりげなく別の用事に誘い出した。'),
    double: L('{a}と{b}、{c}と{d}は、二組並んで食事を囲んだ。誰がいちばん惚気るかで、ささやかな言い合いになった。|{a}と{b}は、{c}と{d}を誘って四人で過ごした。帰り道、二組の歩く速さは自然と同じになっていた。|{c}と{d}の小さな喧嘩の仲裁を、{a}と{b}が買って出た。結局、四人で笑って終わった。|{a}が{b}の世話を焼くのを見て、{c}は{d}の顔をちらりと見た。{d}は黙って{c}の手を取った。'),
    bless: L('{a}は{b}と{c}に向かって、まっすぐに言った。「おめでとう。……二人なら、きっと大丈夫｜おめでとう。……二人なら、きっと大丈夫だ｜おめでとうございます。……二人なら、きっと大丈夫です」――胸の痛みは、言ってしまえば少しだけ軽くなった。|{a}は、{b}が{c}の隣で笑っているのを見て、ようやく踏ん切りがついた。{a}「{c}、{b}のこと泣かせたら許さないから｜{c}、{b}を泣かせたら許さない｜{c}、{b}のこと泣かせたら許しませんから」|{a}は{b}への想いを胸にしまい、二人の背中を押すことにした。「ほら、行ってきなよ｜ほら、行ってこい｜ほら、行ってきてください」')
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

  /* ---------- 円満な三人の日常（複数の恋人「あり」・関係で恋人を二人にした人。poly.js の恋人たちの組） ----------
     {h}＝中心の人（中心のない三人では一人目）、{x}・{y}＝残りの二人。三人とも場にいて、誰どうしも張りつめていないときだけ */
  var TRIO = {
    morning: L('朝、{h}と{x}と{y}は、誰が先に顔を洗うかで少しだけ揉めた。結局いつもの順番に落ち着いて、三人とも小さく笑った。|{h}がいちばんに起きて、三人分の湯を沸かした。{x}は寝ぼけたまま{y}の肩にもたれ、{y}はそれを押し返さずに、{h}から湯気の立つカップを受け取った。|朝の支度の順番は、いつの間にか決まっていた。{x}が先に起きて{h}を揺り起こし、{h}が{y}の寝癖を直してやる。誰も口には出さないが、三人とも気に入っていた。|{y}が寝坊した朝、{h}と{x}は顔を見合わせて、二人がかりで毛布を剥がした。{y}は文句を言いながら、二人に挟まれて笑っていた。'),
    errand: L('{h}と{x}と{y}は、三人で{shop}出かけた。{h}が先を歩き、{x}と{y}は荷物を半分ずつ持って、どちらが{h}の好きなものを先に見つけるかで盛り上がっていた。|{x}が「それは要らない｜＝｜それは要りません」と言い、{y}が「要る｜＝｜要ります」と言い、{h}が「両方にしよう｜＝｜両方にしましょう」と笑った。三人の{errand}は、いつも少しだけ荷物が多くなる。|{h}が重いほうの荷物に手を伸ばすと、{x}と{y}が同時にそれを取り上げた。三人で笑い合いながら、帰り道は自然と同じ歩幅になった。'),
    bed: L('夜、三人は寝る位置で少しだけ揉めた。結局{h}が真ん中になり、{x}と{y}が両側から{h}の手を握った。|{x}が「今日は端でいい｜＝｜今日は端でいいです」と言うと、{y}も「じゃあ反対の端｜では反対の端だ｜じゃあ、反対の端にします」と笑った。真ん中の{h}は、二人の体温に挟まれてすぐに眠ってしまった。|寝床に入ると、{h}の右に{x}、左に{y}。いつの間にか決まった並びだった。灯りを消したあと、三人のうち誰かが小さく「おやすみ」と言い、残りの二人が同時に返した。')
  };
  var SHOP = { zombie: ['物資を探しに', '物資探し'], island: ['食べられるものを集めに', '食料集め'], whiteroom: ['差し入れの箱を開けに', '差し入れの仕分け'], _: ['買い出しに', '買い出し'] };
  var TRIO_WHY = { morning: '朝の順番', errand: '三人の買い出し', bed: '寝る位置' };
  function trioOf(ctx, a, b) {
    var PY = HK.Poly; if (!PY || !PY.groupOf) return null;
    var g = PY.groupOf(ctx, a, true);
    if (!g || g.members.length !== 3 || g.members.indexOf(b.i) < 0 || !PY.harmonious(ctx, g)) return null;
    var m = g.members.map(function (i) { return ctx.chars[i]; });
    if (!m.every(function (c) { return HK.State ? HK.State.here(c) : c.alive; })) return null;
    var h = g.hub != null ? ctx.chars[g.hub] : a, o = m.filter(function (c) { return c !== h; });
    return { h: h, x: o[0], y: o[1], g: g };
  }
  ev({
    id: 'grp_trio_day', cat: 'bond', scope: 'pair',
    when: function (ctx, a, b) { return !!trioOf(ctx, a, b) && ctx.flags.trioDayAt !== ctx.stepIndex; },
    w: function (ctx, a) { return 0.22 + a.tr.np * 0.15 + a.tr.fc * 0.1; },
    run: function (ctx, a, b) {
      var t = trioOf(ctx, a, b), k = ctx.pick(['morning', 'errand', 'bed']), sh = SHOP[ctx.scen && ctx.scen.id] || SHOP._;
      ctx.flags.trioDayAt = ctx.stepIndex;
      [[t.h, t.x], [t.h, t.y], [t.x, t.y]].forEach(function (p) { ctx.mod2(p[0], p[1], { aff: 3, trust: 3 }, { aff: 3, trust: 3 }); });
      ctx.stress(t.h, -6); ctx.stress(t.x, -6); ctx.stress(t.y, -6);
      var text = ctx.pick(TRIO[k]).replace(/\{h\}/g, t.h.name).replace(/\{x\}/g, t.x.name).replace(/\{y\}/g, t.y.name).replace(/\{shop\}/g, sh[0]).replace(/\{errand\}/g, sh[1]);
      var others = [t.h, t.x, t.y].filter(function (c) { return c !== a; });
      return { with: others.filter(function (c) { return c !== b; }), text: text, why: t.h.name + '・' + t.x.name + '・' + t.y.name + 'の、' + TRIO_WHY[k] + '（恋人たち・三人で円満・仲良し）', mag: 10 };
    }
  });
  /* 恋人たちの三人の、小さなやきもち（すれ違い系。{x}＝やきもちを焼く人、{h}・{y}＝仲よくしていた二人）。最後は三人の形に戻る */
  var PANG = {
    lead: L('{h}が{y}の髪についた埃を払ってやるのを、{x}は少し離れたところから見ていた。|{y}が{h}の肩にもたれて眠っている。{x}はその寝顔を見て、胸の奥がちくりとした。|{h}と{y}が二人だけで笑い合う声が、{x}の耳に届いた。何の話なのかは、聞こえなかった。'),
    react: {
      proud: L('{x}は舌打ちして、{h}の空いているほうの腕をわざと掴んだ。「……こっちも空いてるだろ」――{h}は笑って、{x}の頭を乱暴に撫でた。|{x}「別に妬いてねえよ。……ただ、次は私の番だからな」――{y}が吹き出し、{h}は二人の肩をまとめて抱いた。|{x}はわざと大きな音を立てて二人の間に座り込んだ。{y}は苦笑して少し詰め、{h}は{x}の背中を軽く叩いた。'),
      stern: L('{x}は黙って目を伏せた。自分で選んだ形だ、と言い聞かせる。その横顔に気づいた{h}が、何も言わずに{x}の手を握った。|{x}「……気にしていない」――そう言った声が少し硬かったのを、{y}は聞き逃さなかった。{y}は{x}の隣に移って、肩を並べた。|{x}は小さく息を吐いた。妬く資格がないとは思わない。ただ、口に出すのは性に合わなかった。{h}はそれを分かっていて、あとで{x}にだけ温かい茶を淹れた。'),
      tsun: L('{x}「べ、別に羨ましくなんかないし！」――{h}が手招きすると、{x}は文句を言いながら、結局いちばん近くに座った。|{x}はぷいと顔を背けた。{y}が「ほら、拗ねてる」と笑うと、{x}は真っ赤になって{y}の腕を叩いた。{h}は二人まとめて抱き寄せた。|{x}「……私だって、そうしてほしいんだけど」――言ってから慌てて口を塞いだ{x}に、{h}と{y}は顔を見合わせて笑った。'),
      gentle: L('{x}は胸の痛みに少しだけ驚いて、それから笑った。「二人とも、仲いいね」――{h}は{x}を手招きして、三人分の隙間を作った。|{x}はちくりとした気持ちを、そっと飲み込んだ。気づいた{y}が「{x}もおいで」と呼び、{x}は嬉しそうに輪に入った。|{x}「ちょっと妬けちゃった」――正直に言うと、{h}は笑って{x}の手を取り、{y}も反対の手を取った。'),
      devoted: L('{x}は、二人の邪魔をしないように、そっとその場を離れようとした。{h}がその袖を掴んだ。「どこ行くの。{x}もここ」|{x}は自分の胸に手を当てた。羨ましいと思ってしまったことが、少しだけ申し訳なかった。{y}がそれに気づいて、{x}の隣に座り直した。|{x}「……私、わがままかな」――{h}は首を振り、{x}を抱き寄せた。{y}も笑って、二人の背中に腕を回した。'),
      cool: L('{x}は自分の中のやきもちを、冷静に眺めた。「……なるほど、これが嫉妬か」――{h}が吹き出し、{y}は「分析しないで」と笑った。|{x}「今の、少し妬けた。報告だけしておく」――{h}は「了解」と言って、{x}の隣に移った。|{x}は表情を変えずに、二人の間に割り込んだ。{y}は苦笑して少しずれ、{h}は{x}の頬を軽くつまんだ。'),
      free: L('{x}「ずるーい！　私も！」――{x}が二人の上に飛び込むと、三人まとめて転がった。|{x}はわざとらしく頬をふくらませた。「はいはい、どうせ私は三番目ですよー」――{h}と{y}が同時に「違う」と言って、三人とも笑い出した。|{x}は後ろから{h}と{y}をまとめて抱きしめた。「やきもちの分、ぎゅーってする」'),
      shy: L('{x}は何も言えずに、膝を抱えた。それに気づいた{h}が、黙って隣に座った。{y}も反対側に座り、{x}は二人に挟まれて、やっと顔を上げた。|{x}は少しだけ唇を噛んだ。……羨ましい、なんて言えない。そう思っていたら、{y}が{x}の手をそっと握った。|{x}「あ、あの……私も、そこ、入っていい……？」――消え入りそうな声に、{h}と{y}は同時に頷いた。'),
      polite: L('{x}は姿勢を正して、小さく咳払いをした。「……お二人とも、お楽しそうで何よりです」――{h}は笑って、{x}の手を引いた。|{x}「少々、妬けてしまいました。お恥ずかしい」――{y}が「正直でよろしい」と笑い、{x}の席を空けた。|{x}は胸のざわめきを、丁寧に言葉にした。「私も、混ぜていただけますか」――{h}と{y}は顔を見合わせて、もちろん、と頷いた。')
    }
  };
  ev({
    id: 'grp_trio_pang', cat: 'bond', scope: 'pair',
    /* a＝やきもちを焼く人、b＝恋人たちの一人。残りの二人が仲よくしているのを見る */
    when: function (ctx, a, b) { return !!trioOf(ctx, a, b) && ctx.flags.trioPangAt !== ctx.stepIndex; },
    w: function (ctx, a) { return 0.26 + a.tr.jealous * 0.4; },
    run: function (ctx, a, b) {
      var t = trioOf(ctx, a, b), x = a, o = [t.h, t.x, t.y].filter(function (c) { return c !== x; }), h = t.h !== x ? t.h : o[0], y = o.filter(function (c) { return c !== h; })[0];
      ctx.flags.trioPangAt = ctx.stepIndex;
      ctx.mod(x, y, { ten: 3 }); ctx.mod2(x, h, { att: 2, aff: 2 }, { aff: 3 }); ctx.mod2(x, y, { aff: 1 }, { aff: 2 });
      var P0 = HK.Poly && HK.Poly.per ? HK.Poly.per(x) : 'gentle';
      var text = (ctx.pick(PANG.lead) + ctx.pick(PANG.react[P0] || PANG.react.gentle)).replace(/\{h\}/g, h.name).replace(/\{x\}/g, x.name).replace(/\{y\}/g, y.name);
      return { with: [h, y].filter(function (c) { return c !== b; }), text: text, why: x.name + 'は、' + h.name + 'と' + y.name + 'が仲よくしているのを見て、少しやきもちを焼いた（恋人たちの三人・嫉妬）', mag: 10 };
    }
  });
  /* 秘密の恋人の発覚（poly.js。複数の恋人「秘密」のときだけ。嫉妬系） */
  if (HK.Poly && HK.Poly.EVENTS) HK.Poly.EVENTS.forEach(ev);
  /* 結末のラベル「三人で円満」「一人を二人が愛している」（tie-rel.js の分類に重ねる） */
  if (HK.Poly && HK.Poly.hookTieRel) HK.Poly.hookTieRel();
})();
