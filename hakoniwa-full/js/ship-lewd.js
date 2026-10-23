/* 箱庭シミュレーター（R18版のみ）: 宇宙船漂流記 ― R18の描写の設定（lewd-unify.js）に合わせた文
   ・ほのめかす：船員どうしの夜・看病の夜・異星の生き物との場面を、ぼかした一文にする（fade・nurseFade・xFade）
   ・男性向け：船員どうしの夜・看病の夜は thick-sex-ero.js の山場（始まりは ship-thick.js の LEAD）、
     異星の生き物は、元の場面のあとに男性向けの段落を足す（xEro：受ける側／xEroTop：自分で攻めを選んだ人）
   ・濃い：もう一度の段落・一文（again・xAgain）
   {t}＝攻め、{u}＝受け、{a}＝生き物と出会った船員、{x}＝生き物。登場人物はすべて成人として扱う */
(function () {
  'use strict';
  var HK = window.HK, SH = HK.SHIP;
  if (!SH || !SH.R18) return;
  function L(s) { return s.split('|'); }
  var R = SH.R18, E = HK.Ero;
  R.fade = L('{t}は{u}を寝台に横たえ、船室の照明を落とした。――そこから先は、二人だけの航海日誌に書かれている。|{u}の指が、{t}の作業着の留め具にかかった。――観測窓の外の星だけが、その先を見ていた。|二人は狭い寝台で、互いの体温を確かめ合った。――換気扇の音が、しばらく二人の息遣いをかき消していた。|{t}は{u}を抱き寄せ、扉のロックを閉めた。――その夜のことは、船の記録には残っていない。');
  R.nurseFade = L('{t}は熱っぽい{u}の額に口づけ、医務室の明かりを落とした。――その先は、点滴の雫の音だけが知っている。|{u}は{t}の手を自分の胸に引き寄せた。――熱のせいだと、二人とも言い訳をしなかった。|{t}は{u}の汗ばんだ肌を拭い、そのまま隣に横たわった。――医務室の小さな明かりが消えたのは、それからずいぶん経ってからだった。');
  R.xFade = L('{x}は{a}の体に絡みつき、ゆっくりと岩陰へ引き寄せた。――その先のことは、{a}自身もよく覚えていない。|{a}の肌に、{x}の柔らかなものが触れた。――気がつくと、{a}は野営地の外で、甘い匂いに包まれて座り込んでいた。|{x}は{a}をそっと包み込んだ。――戻ってきた{a}は、何があったのか誰にも話さなかった。');
  R.xFadeTop = L('{a}は{x}を手懐け、そのまま主導権を握った。――その先は、{a}と{x}だけが知っている。|{a}は伸びてきた{x}を逆に掴み取った。――しばらくして、{x}はおとなしく{a}の足元に寄り添っていた。');
  /* 男性向け：異星の生き物（受ける側）。{m1}{m2}＝{a} の喘ぎ */
  R.xEro = L('触手の先が{a}の脚のあいだに潜り込み、ぬるぬると奥まで這い入った。{s:wet}。{a}「{m1}」――ナカを内側から撫で回されるたびに、{a}の腰ががくがくと跳ねる。触手が一斉に脈打った瞬間、{a}は泥の上でびくびくとイった。{a}「{m2}」|粘液に濡れた器官が、{a}の胸の先と脚のあいだを同時に吸い上げた。{s:suck}。{a}「{m1}」――何度イかされても、{x}は放してくれなかった。{a}「{m2}」|{x}は{a}の奥に、どろりと温かいものを注ぎ込んだ。{s:cum}。{a}「{m2}」――注がれるたびに頭が真っ白になり、{a}はとろけた顔のまま何度も果てた。|太い触手が{a}の奥をぐぽぐぽと突き上げた。{s:hit}。{a}「{m1}」――ナカの弱いところを覚えた{x}は、そこばかりを執拗に責め立て、{a}を何度もイかせた。{a}「{m2}」');
  /* 男性向け：自分で攻めを選んだ人が生き物を責める（{m1}＝主導する側の声） */
  R.xEroTop = L('{a}は{x}の敏感な器官を握り込み、ぐちゅぐちゅと音を立ててしごき上げた。{s:wet}。{a}「{m1}」――{x}は甘い鳴き声を上げ、{a}の手の中で何度も震えて果てた。|{a}は逃げようとする{x}を押さえつけ、震える先端を舌でしつこく責めた。{s:suck}。{x}が全身を明滅させて果てるまで、{a}は手を緩めなかった。{a}「{m1}」');
  R.xAgain = L('一度では終わらなかった。{x}は日が沈むまで、何度も{a}を求め続けた。|しばらくして、{x}はまた{a}の体に絡みついてきた。二度目は、一度目よりずっと長かった。|{a}が野営地に戻れたのは、夜が明けてからだった。');
  R.xAgainEro = L('{x}は一度では満足せず、{a}をまた絡め取った。{s:hit}。{a}「{m2}」――イきっぱなしのまま、{a}は夜明けまで責め続けられた。|二度目、三度目と注ぎ込まれ、{a}のお腹はぽっこりと膨らんでいた。{s:cum}。{a}「{m2}」');
  /* 船員どうしの夜（男性向け）：始まりは ship-thick.js の LEAD を使う */
  R.ero = function (S, t, u, kind, short, high) {
    var TE = HK.ThickEro;
    if (!TE) return null;
    var pick = function (arr) { return S.rng.pick(arr); };
    var lead = R.LEAD && R.LEAD[kind === 'nurse' ? 'nurse' : 'night'];
    var op = lead ? pick(lead).replace(/\{T\}/g, '{a}').replace(/\{U\}/g, '{b}') : '';
    var r = short ? TE.short({ S: S, pick: pick, a: t, b: u, open: op, again: high }) : TE.scene({ S: S, pick: pick, rng: S.rng, a: t, b: u, style: HK.ThickSex ? HK.ThickSex.style(t) : 'gentle', open: op || null, place: 'ship', again: high });
    var tx = r.text.replace(/\{a\}/g, t.name).replace(/\{b\}/g, u.name);
    if (HK.Pos && HK.Pos.ff(t, u) && HK.FF && HK.FF.fix) tx = HK.FF.fix(S, tx, t, u);
    return short ? tx : '\n\n' + tx + '\n\n';
  };
  /* 濃い：船員どうしの夜のもう一度（小説調） */
  R.again = function (S, t, u, short) {
    var TE = HK.ThickEro;
    if (!TE) return '';
    var x = TE.again(S, function (arr) { return S.rng.pick(arr); }, t, u, false, short).replace(/\{a\}/g, t.name).replace(/\{b\}/g, u.name);
    return short ? x : x + '\n\n';
  };
  /* 生き物の場面の喘ぎ・擬音を埋める */
  R.xFill = function (S, text, a, top) {
    if (!E) return text;
    var d = a.eroDom; if (top) a.eroDom = true;
    var r = E.fill(S, text, a);
    a.eroDom = d;
    return r;
  };
})();
