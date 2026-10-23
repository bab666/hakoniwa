/* 箱庭シミュレーター（R18版のみ）: 宇宙船漂流記 ― R18の描写の設定（lewd-unify.js）に合わせた文
   ・ほのめかす：船員どうしの夜・看病の夜・異星の生き物との場面を、ぼかした一文にする（fade・nurseFade・xFade）
   ・男性向け：船員どうしの夜・看病の夜は thick-sex-ero.js の山場（始まりは ship-thick.js の LEAD）、
     異星の生き物は、自分で攻めを選んだ人が生き物を責める場面だけ、男性向けの段落を足す（xEroTop。襲われる場面は合意がないので足さない）
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
  /* 男性向け：自分で攻めを選んだ人が生き物を責める（{m1}＝主導する側の声） */
  R.xEroTop = L('{a}は{x}の敏感な器官を握り込み、ぐちゅぐちゅと音を立ててしごき上げた。{s:wet}。{a}「{m1}」――{x}は甘い鳴き声を上げ、{a}の手の中で何度も震えて果てた。|{a}は逃げようとする{x}を押さえつけ、震える先端を舌でしつこく責めた。{s:suck}。{x}が全身を明滅させて果てるまで、{a}は手を緩めなかった。{a}「{m1}」');
  R.xAgain = L('一度では終わらなかった。{x}は日が沈むまで、何度も{a}を求め続けた。|しばらくして、{x}はまた{a}の体に絡みついてきた。二度目は、一度目よりずっと長かった。|{a}が野営地に戻れたのは、夜が明けてからだった。');
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
  /* ---------- 書き足し用の型（作者が書く欄。空のあいだは何も出ない） ----------
     描写の作風「男性向け」で、生き物に襲われる側（自分で攻めを選んでいない人）の場面のあとに足す段落。
     ・場面の種類ごとの欄：lure（誘われていると分からなかった）／force（強引に迫られた）／take（攫われた）／probe（体を調べられた）／
       invade（体の中に入り込まれた）／civ（文明の住人の誘い）／alien（そのほかの異星の生き物）。any はどの種類にも使う
     ・一つの欄に何文でも入れられる（そのたびに一つを選ぶ）。文は '…' で囲んで , で区切る
     ・使える差し込み：{a}＝襲われた船員の名前、{x}＝生き物の名前、{b}＝その船員といちばん近しい仲間の名前、
       {m0}{m1}{m2}＝{a} の喘ぎ（0 こらえる／1 とろける／2 崩れる。態度9種で ero-kit.js が選ぶ。「{a}「{m1}」」のように台詞の中に置く）、
       {s:wet}{s:hit}{s:cum}{s:suck}＝擬音
     ・段落の区切りは \n\n。登場人物はすべて成人として扱うこと
     xEroAgainV：描写の有無「濃い」のとき、上の段落のあとに足すもう一段（空なら小説調の xAgain を使う） */
  /* 仮の文（骨組み）：〔 〕の中を自分の文に書き換え、行頭の // を消すと使われる。// が付いたままなら何も出ない */
  R.xEroV = {
    lure: [
      // '{x}が{a}に〔近づき方〕。{a}は〔最初の反応〕。{s:wet}。{a}「{m0}」\n\n〔場面の動き〕。{a}「{m1}」――〔{a}の様子〕。\n\n〔山場〕。{s:cum}。{a}「{m2}」――〔終わりの一文〕。',
    ],
    force: [
      // '〔{x}が{a}を捕らえる〕。{a}「{m0}」――〔{a}の様子〕。\n\n〔場面の動き〕。{s:hit}。{a}「{m1}」\n\n〔山場〕。{a}「{m2}」――〔終わりの一文〕。',
    ],
    take: [
      // '〔{a}が運ばれた先の場所〕。〔{x}の動き〕。{a}「{m0}」\n\n〔場面の動き〕。{s:wet}。{a}「{m1}」――〔{a}の様子〕。\n\n〔山場〕。{a}「{m2}」――〔{b}のことを思う一文など〕。',
    ],
    probe: [
      // '〔{x}が{a}を調べはじめる〕。{a}「{m0}」\n\n〔場面の動き〕。{s:suck}。{a}「{m1}」――〔{a}の様子〕。\n\n〔山場〕。{s:cum}。{a}「{m2}」',
    ],
    invade: [
      // '〔{x}が入り込む〕。{a}「{m0}」――〔{a}の様子〕。\n\n〔場面の動き〕。{s:wet}。{a}「{m1}」\n\n〔山場〕。{a}「{m2}」――〔終わりの一文〕。',
    ],
    civ: [
      // '〔住人たちの誘いの言葉や儀礼〕。{a}は〔最初の反応〕。{a}「{m0}」\n\n〔場面の動き〕。{s:hit}。{a}「{m1}」――〔{a}の様子〕。\n\n〔山場〕。{a}「{m2}」――〔終わりの一文〕。',
    ],
    alien: [
      // '〔{x}の姿と動き〕。{a}「{m0}」\n\n〔場面の動き〕。{s:wet}。{a}「{m1}」――〔{a}の様子〕。\n\n〔山場〕。{s:cum}。{a}「{m2}」',
    ],
    any: [
      // '〔どの種類にも合う場面の始まり〕。{a}「{m0}」\n\n〔場面の動き〕。{a}「{m1}」\n\n〔山場〕。{a}「{m2}」――〔終わりの一文〕。',
    ]
  };
  R.xEroAgainV = [
    // '〔二度目の始まり〕。{a}「{m1}」――〔場面の動き〕。{s:wet}。{a}「{m2}」――〔終わりの一文〕。',
  ];
  /* 書いた文の欄を選ぶ（空の欄は飛ばす） */
  R.xEroPool = function (kind) { var V = R.xEroV || {}; return (V[kind] || []).concat(V.any || []).filter(function (t) { return t && String(t).trim(); }); };

  /* 生き物の場面の喘ぎ・擬音を埋める */
  R.xFill = function (S, text, a, top) {
    if (!E) return text;
    var d = a.eroDom; if (top) a.eroDom = true;
    var r = E.fill(S, text, a);
    a.eroDom = d;
    return r;
  };
})();
