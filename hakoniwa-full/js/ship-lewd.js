/* 箱庭シミュレーター（R18版のみ）: 宇宙船漂流記 ― R18の描写の設定（lewd-unify.js）に合わせた文
   ・ほのめかす：船員どうしの夜・看病の夜・異星の生き物との場面を、ぼかした一文にする（fade・nurseFade・xFade）
   ・男性向け：船員どうしの夜・看病の夜は thick-sex-ero.js の山場（始まりは ship-thick.js の LEAD）、
     異星の生き物は、自分で攻めを選んだ人が生き物を責める場面に男性向けの段落を足す（xEroTop）。
     襲われる場面（星の生命体・異種族の誘い・異星の生き物）と文明の研究も、男性向けの段で組む（2026-10-27 担当BN：R.xEroBuild・R.labEro）。
     庇い展開（仲間が助けに入る）もこのファイル（R.coverPlan・R.coverRun。文は ship-r18-xeno.js の SH.X.cov）
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
  /* 男性向け：自分で攻めを選んだ人が生き物を責める（{m1}＝主導する側の声）。xEroTopM は責める側が男性の体のときだけ足す */
  R.xEroTop = L('{a}は{x}の敏感な器官を握り込み、ぐちゅぐちゅと音を立てて激しくしごき上げた。ぬちゃ、ぬぽっ、と先走りが飛び散り、熱い体液が糸を引く。{s:wet}。{a}「{m1}」――{x}は甘い鳴き声を上げ、{a}の手の中で何度も激しく震えて果てた。|{a}は{x}を押し倒し、主導権を完全に握った。敏感な器官を握り込み、ぐちゅぐちゅと激しくしごく。ぬちゃ、ぬぽっ、と先走りが飛び散る。{s:wet}。{a}「{m1}」――{x}は甘い鳴き声を上げ、{a}の手の中で何度も痙攣して果てた。');
  R.xEroTopM = L('{a}は逃げようとする{x}を押さえつけ、震える先端を舌でしつこく吸い、歯で軽く噛んだ。{s:suck}。ずぶっ、と奥まで突き入れ、激しく腰を打ち付けながら{x}が全身を明滅させて絶頂するまで、{a}は容赦なく腰を打ち付け、熱い{精液}を注ぎ込んだ。{a}「{m1}」|{a}は逃げようとする{x}を押さえつけ、震える先端を舌でねっとりと吸い上げ、歯で軽く噛んだ。{s:suck}。ずぶっ、と奥まで突き入れ、激しく腰を打ち付けながら{x}が全身を明滅させて絶頂するまで、{a}は手を緩めず、熱い精を注ぎ込んだ。{a}「{m1}」');
  /* 男性向け：船員どうしの夜・看病の夜の山場の候補（thick-sex-ero.js の山場と半々で選ぶ）。{t}＝攻め、{u}＝受け、
     {ma1}＝{t} の主導する側の声、{mb1}{mb2}＝{u} の喘ぎ。
     組：mf＝{t}が男性の体で{u}が女性の体、uf＝{u}が女性の体（男×女・女×女）、any＝どの組でも */
  R.EROX = {
    night: [
      { k: 'mf', t: '{t}は{u}を寝台に押し倒し、作業着の留め具を乱暴に外した。ぱん、と生地が弾け、むき出しになった柔らかい{胸}と濡れた{女性器}が露わになる。硬く勃起した{男性器}を{u}の入口に押しつけ、一気に根元まで突き入れた。ずぶっ！　熱く狭い穴が締め付けてくる。{s:wet}。{u}「{mb1}」――狭い寝台が激しく軋み、ぐちゅっ、ぐぽっ、ぬちゃぬちゃと淫らな水音が船室に響き渡った。' },
      { k: 'mf', t: '{u}の指が{t}の{股間}を掴み、硬く膨張した{男性器}をぬるぬるにしごき上げる。先走りが糸を引き、ぬちゃぬちゃと音を立てる。{t}「{ma1}」と喘ぎながら腰を突き上げ、{u}の奥を抉るように打ち付けた。観測窓の外の星さえも、その激しい結合音と肉がぶつかる音を知っていた。' },
      { k: 'mf', t: '{t}は{u}の両脚を大きく開き、腰を深く沈めて一気に奥まで突き入れた。ずぶっ！　ぐぽっぐぽっ！　と激しい水音が立ち、子宮口を突き上げるたび{u}「{mb2}」と声を裏返らせて何度も潮を吹き、痙攣しながら果てた。換気扇の音など、もう聞こえていなかった。' },
      { k: 'mf', t: '{t}は扉のロックを閉め、{u}を壁に押し付けたまま激しく腰を打ち付けた。ぱんぱんぱん！　と肉のぶつかる音が連続し、熱い穴が締め付けてくる。{u}「{mb2}」と崩れ落ちるまで、{t}は朝まで何度も射精し、止めなかった。' }
    ],
    nurse: [
      { k: 'any', t: '{t}は熱っぽい{u}の額に口づけ、そのまま医務室の明かりを落とした。汗ばんだ肌に舌を這わせ、敏感な{乳首}を強く吸い上げる。{s:suck}。{u}「{mb1}」点滴の雫の音など、もうかき消されていた。' },
      { k: 'uf', t: '{u}は{t}の手を自分の熱い{股間}に引き寄せ、ぐちゅぐちゅと音を立ててかき回させた。すでにびしょ濡れの{女性器}がぬちゃぬちゃと鳴る。{t}「こんなに濡らして…我慢できなかったのか」と耳元で囁きながら、指を奥までねじ込み、Gスポットを容赦なく抉る。{u}「{mb1}」と腰を跳ねさせた。' },
      { k: 'mf', t: '{t}は{u}の汗だくの体を覆い、硬く勃起した{男性器}を一気に根元まで結合した。ずぶっ！　ぬちゃぬちゃと激しく腰を振り、子宮を突くたび{u}「{mb2}」と声を上げ続け、{t}は熱い{精液}を何度も中に注ぎ込んだ。医務室の小さな明かりが消えたのは、二人が何度も果てた後だった。' }
    ]
  };
  R.eroxPool = function (t, u, kind) {
    var P = HK.Pos, tf = P.isF(t), uf = P.isF(u);
    /* ff＝女性どうし、fm＝{t}が女性の体で{u}が男性の体（跨る）、mm＝男性どうし */
    return (R.EROX[kind === 'nurse' ? 'nurse' : 'night'] || []).filter(function (o) { return o.k === 'any' || (o.k === 'uf' && uf) || (o.k === 'mf' && !tf && uf) || (o.k === 'ff' && tf && uf) || (o.k === 'fm' && tf && !uf) || (o.k === 'mm' && !tf && !uf); });
  };
  R.xAgain = L('一度では終わらなかった。{x}は日が沈むまで、何度も{a}を求め続けた。|しばらくして、{x}はまた{a}の体に絡みついてきた。二度目は、一度目よりずっと長かった。|{a}が野営地に戻れたのは、夜が明けてからだった。');
  /* 船員どうしの夜（男性向け）：始まりは ship-thick.js の LEAD を使う */
  R.ero = function (S, t, u, kind, short, high) {
    var TE = HK.ThickEro;
    if (!TE) return null;
    /* 一回の遊びの中で同じ文を繰り返さない（HK.Ero.fresh） */
    var pick = function (arr) { return E && E.fresh ? E.fresh(S, arr, function (l) { return S.rng.pick(l); }) : S.rng.pick(arr); };
    var lead = R.LEAD && R.LEAD[kind === 'nurse' ? 'nurse' : 'night'];
    var op = lead ? pick(lead).replace(/\{T\}/g, '{a}').replace(/\{U\}/g, '{b}') : '';
    /* 山場の候補（R.EROX）を半々で使う。厚い版は始まり（LEAD）のあとの段落にする */
    var xp = R.eroxPool(t, u, kind);
    if (xp.length && S.rng.int(2) === 0) {
      var xt = (short || !op ? '' : op + '\n\n') + pick(xp).t.replace(/\{t\}/g, '{a}').replace(/\{u\}/g, '{b}');
      if (high) xt += (short ? '' : '\n\n') + TE.again(S, pick, t, u, true, short);
      xt = TE.fill(S, xt, t, u).replace(/\{a\}/g, t.name).replace(/\{b\}/g, u.name);
      if (HK.Pos.ff(t, u) && HK.FF && HK.FF.fix) xt = HK.FF.fix(S, xt, t, u);
      return short ? xt : '\n\n' + xt + '\n\n';
    }
    var r = short ? TE.short({ S: S, pick: pick, a: t, b: u, open: op, again: high }) : TE.scene({ S: S, pick: pick, rng: S.rng, a: t, b: u, style: HK.ThickSex ? HK.ThickSex.style(t) : 'gentle', open: op || null, place: 'ship', again: high });
    var tx = r.text.replace(/\{a\}/g, t.name).replace(/\{b\}/g, u.name);
    if (HK.Pos && HK.Pos.ff(t, u) && HK.FF && HK.FF.fix) tx = HK.FF.fix(S, tx, t, u);
    return short ? tx : '\n\n' + tx + '\n\n';
  };
  /* 濃い：船員どうしの夜のもう一度（小説調） */
  /* 船の上らしいもう一度の段落（ship-r18-more.js の R.AGAIN_S：mf＝{t}が男性の体、fm＝{t}が女性の体で{u}が男性の体、ff＝女性どうし、short＝短い版の一文）を半分ほど混ぜる */
  R.again = function (S, t, u, short) {
    var TE = HK.ThickEro, P = HK.Pos;
    var pick = function (arr) { return E && E.fresh ? E.fresh(S, arr, function (l) { return S.rng.pick(l); }) : S.rng.pick(arr); };
    var kd = P && P.isF(t) ? (P.isF(u) ? 'ff' : 'fm') : 'mf', AS = R.AGAIN_S, own = AS && (short ? AS.short : AS[kd]);
    var x;
    if (own && own.length && (!TE || S.rng() < 0.6)) x = pick(own).replace(/\{t\}/g, t.name).replace(/\{u\}/g, u.name);
    else if (TE) x = TE.again(S, pick, t, u, false, short).replace(/\{a\}/g, t.name).replace(/\{b\}/g, u.name);
    else return '';
    return short ? x : x + '\n\n';
  };
  /* ---------- 描写の作風「男性向け」：生き物に襲われる側（自分で攻めを選んでいない人）の段（2026-10-27 担当BN で組み直し） ----------
     段の順：始まり（R.xEroV：場面の種類ごと）→ 行為（SH.X.ero.body：受ける体 f／m ごと）→ 体が先に応える（mid）→
     山場（peak：受ける人の態度9種）→ 果てる声 → 生き物が果てる（fin）→（濃い）もう一度（again：体ごと）。数行で短くは「始まり＋行為＋山場」だけ。
     組み立ては下の R.xEroBuild。段落は、ship.js が場面のあとに足したものを、記録に書く前に「そのあと」の文の前へ移す（R.relocate）
     ・場面の種類：lure（誘われていると分からなかった）／force（強引に迫られた）／take（攫われた）／probe（体を調べられた）／
       invade（体の中に入り込まれた）／civ（文明の住人の誘い）／alien（そのほかの異星の生き物）
     ・差し込み：{a}＝襲われた船員、{x}＝生き物、{v0}＝{a} の嫌がる喘ぎ（はじめ）、{s:wet}{s:hit}{s:cum}{s:suck}＝擬音。人間の体は性別を問わない書き方
     ・登場人物はすべて成人として扱うこと */
  R.xEroV = {
    lure: [
      '{x}が甘い香を漂わせながら{a}にゆっくりと近づき、柔らかな触手が足首を撫で上げた。抵抗しようと思う前に体が熱くなり、脚ががくがくと震え出す。{s:wet}。{a}「{v0}」',
      '{x}の甘い匂いが{a}の意識を溶かし、気づいたときには体じゅうにぬるぬるした感触が這い回っていた。挨拶の続きだと思っていた{a}は、服の内側に潜り込んだものの動きに、ようやく息を呑んだ。{s:wet}。{a}「{v0}」',
      '求愛の踊りは、まだ続いていた。{x}は{a}の腰に絡みつき、作業着の留め具をひとつずつ器用に外していく。慌てて押さえた{a}の手ごと、ぬめる腕が{股間}へ滑り込んだ。{s:wet}。{a}「{v0}」'
    ],
    force: [
      '{x}が一気に{a}を押し倒し、硬い地面に背中を押しつけた。逃げようとする腕を触手で押さえ込み、閉じようとする脚を力ずくで割り開く。{a}「{v0}」――息が詰まり、体が強張る。',
      '{x}の触手が{a}の体に幾重にも巻きつき、逃げ場を奪った。顔の前に熱い先端が押しつけられ、無理やり口をこじ開けられる。{a}「{v0}」――涎が糸を引いた。',
      '{x}は背後から{a}にのしかかり、地面に這いつくばらせた。重い体に押し潰されて、腕一本動かせない。腰だけを高く持ち上げられ、作業着の下が{x}の熱い体温に晒された。{a}「{v0}」'
    ],
    take: [
      '{a}が気づいたときには、岩陰の奥の湿った暗がりに運ばれていた。{x}の腕が全身に絡みつき、指一本動かせない。{a}「{v0}」',
      '運ばれた先は、粘液にまみれた巣のような空間だった。{x}は{a}を柔らかな床に押さえ込み、舌のような器官で肌を端から舐め回していく。{a}「{v0}」',
      '巣の奥には、乾いた古い繭がいくつも転がっていた。{x}は{a}をその隣に横たえ、逃げ出そうとするたびに引き戻した。何度目かに引き戻されたとき、服はもう半分も残っていなかった。{a}「{v0}」'
    ],
    probe: [
      '{x}が{a}の体を丁寧に、しかし容赦なく調べはじめた。細い触手が服の下に滑り込み、敏感なところを一つ一つ確かめるように撫でていく。{a}「{v0}」',
      '{x}の細長い触手が、{a}の口と{股間}を同時に探りはじめた。奥の形を確かめるように、ゆっくりと、何度も出入りを繰り返す。{a}「{v0}」',
      '{x}は{a}の体を裏返し、また表に返した。声が上がった場所に印をつけるように粘液を垂らし、印のついた場所ばかりを繰り返しなぞる。{s:wet}。{a}「{v0}」'
    ],
    invade: [
      '{x}の熱い先端が{a}の入口を押し開き、ずぶっ、と一気に深く入り込んだ。無理やり広げられた内側に、熱さが奥まで伝わる。{a}「{v0}」――息が止まり、体が強張る。',
      '{x}が何本もの細い腕を、同時に{a}の体へ潜り込ませた。口も、下も塞がれて、逃げ場がない。{a}「{v0}」――涎が糸を引いた。',
      '{x}は皮膚の上から{a}の中へ、溶けるように沈み込んでいった。痛みはない。代わりに、体の内側の、触れられるはずのない場所を直接撫でられる感覚が来た。{s:wet}。{a}「{v0}」'
    ],
    civ: [
      '文明の住人たちが儀式のように{a}を囲み、甘い香の油を体に塗りはじめた。抵抗する言葉は優しく遮られ、塗られたところから熱が広がっていく。{a}「{v0}」',
      '住人たちの柔らかな腕が、{a}を優しく、しかし確実に押さえ込んだ。言葉は分からないのに、受け入れれば楽になると囁かれているのだけは分かった。体がびくりと反応する。{a}「{v0}」',
      '祭りの夜、{a}は花で飾られた寝台に横たえられた。何本もの手に手首と足首を押さえられ、服を一枚ずつ剥がれていく。祝福の歌が高まるにつれ、指先が{胸}から{股間}へと降りていった。{a}「{v0}」'
    ],
    alien: [
      '{x}の異形の体が{a}に覆いかぶさり、ぬるぬるした皮膚が全身に密着した。熱い息がかかり、体の芯が疼き出す。{a}「{v0}」',
      '{x}の触手は、予測できない動きで{a}の体を責め立てた。どこを触られるか分からないぶん、体が過敏に跳ねてしまう。{a}「{v0}」',
      '{x}は{a}を押し倒し、ためらいもなく体を重ねてきた。人のものではない重みと熱に、{a}の背中が地面に縫い止められる。{a}「{v0}」'
    ]
  };
  /* 始まりの段の候補（空の欄は飛ばす） */
  R.xEroOpen = function (kind) { var V = R.xEroV || {}; return (V[kind] || V.alien || []).filter(function (t) { return t && String(t).trim(); }); };

  /* ---------- 男性向けの段の組み立て・段落の並べ替え・文明の研究・庇い展開（2026-10-27 担当BN） ----------
     ship.js（両ビルド共通）は変えない。ship.js の xLewd が R.xEroPool・R.xEroAgainV・R.xFill を呼ぶので、そこで印を渡して組み立て、
     記録に書く直前（HK.Story.say を包む）に段落を並べ替える。
     ・印：\u0001…\u0002＝男性向けの段（「そのあと」の文の前へ移す）、\u0003＝「そのあと」の文の頭（X2.AFTER・X.lureAfter に付ける）。印は記録に残さない
     ・小説調で庇い展開が起きない回は、文も乱数の引き方も変えない（庇い展開の抽選は、その回の記録から作った別の乱数で引く） */
  var XV = '\u0001XV:', XA = '\u0001XA', AF = '\u0003';
  function XE() { return SH.X && SH.X.ero; }
  function markAfter(list) { return (list || []).map(function (t) { return String(t).charAt(0) === AF ? t : AF + t; }); }
  if (SH.X2 && SH.X2.AFTER) Object.keys(SH.X2.AFTER).forEach(function (k) { SH.X2.AFTER[k] = markAfter(SH.X2.AFTER[k]); });
  if (SH.X && SH.X.lureAfter) SH.X.lureAfter = markAfter(SH.X.lureAfter);
  /* 男性向けの段は印で受け取る（xLewd は男性向けのときだけこれを呼ぶ） */
  R.xEroPool = function (kind) { return [XV + (kind || 'alien')]; };
  R.xEroAgainV = [XA];
  function pkL(S, arr) { return E && E.fresh ? E.fresh(S, arr, function (l) { return S.rng.pick(l); }) : S.rng.pick(arr); }
  function lwOf(S) { var X = HK.Lewd; if (!X || !X.conf('ship')) return { lv: 'mid', ero: false, high: false }; return { lv: X.lv(S.env), ero: X.ero(S.env), high: X.high(S.env) }; }
  function shortOf(S) { return !!(HK.Lewd && HK.Lewd.conf('ship') && HK.Lewd.short(S.env, S.rng)); }
  function bodyKey(c) { return HK.Pos && HK.Pos.isF(c) ? 'f' : 'm'; }
  function persOf(c) { return (HK.personaOf ? HK.personaOf(c) : c.persona) || 'gentle'; }
  /* 襲われる人の嫌がる喘ぎ（moan-engine.js。気の強い人は声を抑える。late＝山場から先。小説調は♡を落とす） */
  function vMoan(S, v, k, late, novel) {
    var M = HK.R18M, o = { force: true, hush: !!(M && M.isStrong && M.isStrong(v)), late: !!late };
    if (novel) o.novel = true;
    if (HK.Moan && HK.Moan.say) return HK.Moan.say(S, v, k, o);
    return E && E.moan ? E.moan(S, v, { start: 0, mid: 1, climax: 2 }[k] || 0, { force: true }) : '……っ';
  }
  /* 文を埋める：{v}＝その段で襲われる人、{a}{b}{c}{x}＝m の名前（m がなければ ship.js が埋める）、{v0}{v1}{v2}＝喘ぎ、{s:…}＝擬音（小説調は落とす） */
  function fx(S, t, v, m, late, novel) {
    var s = String(t).replace(/\{([abcx])\}/g, function (q, k) { return m && m[k] != null ? m[k] : q; }).replace(/\{v\}/g, v.name);
    s = novel ? s.replace(/\{s:\w+\}。?/g, '') : s.replace(/\{s:(\w+)\}/g, function (q, k) { return E && E.sfx ? E.sfx(S, k) : ''; });
    return s.replace(/\{v([012])\}/g, function (q, n) { return vMoan(S, v, ['start', 'mid', 'climax'][+n], late || n === '2', novel); });
  }
  function climaxOf(S, v, novel) { return v.name + '「' + vMoan(S, v, 'climax', true, novel) + '」'; }
  /* 星の生命体・異種族の誘い・異星の生き物（男性向け）：始まり → 行為（体ごと）→ 体が先に応える → 山場（態度9種）→ 果てる声 → 生き物が果てる。
     数行で短くは「始まり＋行為＋山場」 */
  R.xEroBuild = function (S, a, kind) {
    var X = XE(); if (!X) return '';
    var sh = shortOf(S), sep = sh ? '' : '\n\n', op = R.xEroOpen(kind);
    var t = (op.length ? fx(S, pkL(S, op), a) + sep : '') + fx(S, pkL(S, X.body[bodyKey(a)]), a);
    if (!sh) t += fx(S, pkL(S, X.mid), a);
    t += sep + fx(S, pkL(S, X.peak[persOf(a)] || X.peak.gentle), a, null, true) + climaxOf(S, a);
    if (!sh) t += fx(S, pkL(S, X.fin), a, null, true);
    return t;
  };

  /* 生き物の場面の喘ぎ・擬音を埋める（男性向けの段の印なら、ここで組み立てる） */
  R.xFill = function (S, text, a, top) {
    var s0 = String(text);
    if (s0.indexOf(XV) === 0) return '\u0001' + R.xEroBuild(S, a, s0.slice(XV.length)) + '\u0002';
    if (s0 === XA) { var X0 = XE(); return X0 ? '\u0001' + fx(S, pkL(S, X0.again[bodyKey(a)]), a, null, true) + '\u0002' : ''; }
    if (!E) return text;
    var d = a.eroDom; if (top) a.eroDom = true;
    var r = E.fill(S, text, a);
    a.eroDom = d;
    return r;
  };

  /* 段落の並べ替え：男性向けの段（\u0001…\u0002）を「そのあと」の文（\u0003）の前へ移す。cut なら「そのあと」から先を落とす（庇い展開が続く回）。
     印のない文・男性向けの段がなく cut でもない文は、印を消すだけ（小説調の文は変えない） */
  R.relocate = function (t, cut) {
    if (!/[\u0001-\u0003]/.test(t)) return t;
    var bl = [];
    var s = t.replace(/\u0001([\s\S]*?)\u0002/g, function (m, x) { bl.push(x); return ''; }).replace(/[\u0001\u0002]/g, '');
    if (!bl.length && !cut) return s.replace(/\u0003/g, '');
    var i = s.indexOf(AF), pre = (i >= 0 ? s.slice(0, i) : s).replace(/\u0003/g, '').replace(/\s+$/, '');
    var post = i >= 0 ? s.slice(i + 1).replace(/\u0003/g, '').replace(/^\s+|\s+$/g, '') : '';
    var sep = /\n\n/.test(s) || bl.some(function (x) { return /\n\n/.test(x); }) ? '\n\n' : '';
    var out = pre;
    bl.forEach(function (x) { if (x) out += sep + x; });
    if (post && !cut) out += sep + post;
    return out;
  };

  /* 文明の研究（男性向け）：元の一文 → 器具の責め（体ごと）→ 測られる羞恥 → 山場（態度9種）→ 果てる声 → 記録の終わり →（濃い）もう一度 */
  R.labOn = function (S) { var w = lwOf(S); return !HK.SAFE_ON && w.ero && w.lv !== 'low' && !!(XE() && XE().lab); };
  R.labEro = function (S, a, intro) {
    var X = XE(), L = X.lab, sh = shortOf(S), sep = sh ? '' : '\n\n';
    var civ = S.planet && S.planet.civ && S.planet.civ.d && S.planet.civ.d.name, m = { a: a.name, x: civ || '異星の者' };
    var t = intro + sep + fx(S, pkL(S, L[bodyKey(a)]), a, m);
    if (!sh) t += fx(S, pkL(S, L.mid), a, m);
    t += sep + fx(S, pkL(S, X.peak[persOf(a)] || X.peak.gentle), a, m, true) + climaxOf(S, a) + fx(S, pkL(S, L.fin), a, m, true);
    if (lwOf(S).high) t += sep + fx(S, pkL(S, L.again), a, m, true);
    return t;
  };

  /* ---------- 庇い展開：生き物に捕まった仲間を、ほかの船員が助けに入る ----------
     起きるのは、星の生命体（xeno）・異種族の誘い・異星の生き物の場面で、捕まった人が受ける側のとき（自分で攻めを選んだ人が生き物を責める場面は除く）。
     一回の遊びで2回まで、場面ごとに3割ほど。助けに入る人は、その場にいる生きた船員から、関係の近さで選ぶ。
     分岐：殴られる（触手に弾かれる）／身代わりを申し出る（巻き込まれない人は申し出が届かず弾かれる）／二人とも引きずり込まれる／絡め取られて見せつけられる。
     ・巻き込まれる（身代わり・二人とも）＝モブとの場面に出てよく（HK.State.mobSexOk）、モブ相手に受けになれて（HK.Pos.canReceive）、
       性行為の相手を固定していない人。家族・「恋愛・R18にしない相手」の組は除く
     ・見せつけられて興奮＝R18に参加する人（攻め指定・固定の人も可。体の関係にはならず、自慰もしない。固定の人は相手を思い浮かべて恥じる）。
       {b} の恋愛対象の性別に {a} が合い、家族・「恋愛・R18にしない相手」の組でないとき
     ・殴られる・申し出（届かない）＝誰でも（R18に参加しない人も。性的な文には出ない）。描写の有無「ほのめかす」ではこの二つだけ
     記録は三つに分ける：駆けつける（{b}・{a}。性的な語なし）→ 場面（巻き込まれた {b}、または見せつけられる {a} の記録）→ そのあと（{b}・{a}。性的な語なし） */
  R.COVER_RATE = 0.3;
  var REL_JP = { lover: '恋人', fixed: '性行為の相手を固定した相手', crush: '片想いの相手', friend: '仲間', enemy: '反目している相手', cold: 'ほとんど関わりのない相手' };
  function lockList(c) { var L = c && c.sexLocks; return L && L.length ? L : (c && c.sexLock != null && c.sexLock !== 'any' && c.sexLock !== '' ? [c.sexLock] : []); }
  function fixedTo(b, a) { return lockList(b).indexOf(a.i) >= 0; }
  function likesG(p, q) { if (!p.likes || p.likes === 'both') return true; if (p.likes === 'none') return false; if (!q.gender || q.gender === 'x') return true; return p.likes === q.gender; }
  function relOf(S, b, a) {
    var A = SH.API, T = A.ties(S, a, b);
    if (A.lover(S, a, b) || T.some(function (t) { return /^(spouse|mate|fated|lover)$/.test(t.type); })) return 'lover';
    if (fixedTo(b, a)) return 'fixed';
    if (T.some(function (t) { return t.type === 'almost' || t.type === 'honmei' || ((t.type === 'crush' || t.type === 'yan' || t.type === 'worship') && t.a === b.i); })) return 'crush';
    if (T.some(function (t) { return /^(enemy|rival|bad|sibbad|abuse)$/.test(t.type); }) || A.bond(S, b, a) < -0.1) return 'enemy';
    if (A.bond(S, b, a) >= 0.2 || T.length) return 'friend';
    return 'cold';
  }
  /* その回の記録から作る乱数の種（S.rng を引かない） */
  function seedOf(S, a) {
    var lt = S.log && S.log.length ? String(S.log[S.log.length - 1].text || '').slice(-48) : '';
    var s = (S.log ? S.log.length : 0) + '|' + (S.m || 0) + '|' + a.name + '|' + lt, h = 2166136261;
    for (var i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
    return h >>> 0;
  }
  /* 襲っている相手の名前（記録の理由の欄から）。文明の住人の誘いで襲うのは「巨体」（X.huge・X.hugeAct の文と同じ） */
  function xName(S, o) {
    var w = String(o.why || ''); if (/^まだ正体に気づいていない/.test(w)) return '正体の分からない何か';
    var m = w.match(/^(.+?)(?:の誘い。|（)/), x = m ? m[1] : '異星の生き物', civ = S.planet && S.planet.civ && S.planet.civ.d && S.planet.civ.d.name;
    return civ && x === civ ? '巨体' : x;
  }
  R.coverPlan = function (S, a, o) {
    var A = SH.API, C = SH.X && SH.X.cov, St = HK.State, P = HK.Pos;
    if (!A || !C || !XE() || HK.SAFE_ON || !St || !P || !HK.rng || (S._shieldN || 0) >= 2) return null;
    var g = HK.rng(seedOf(S, a));
    if (g() >= R.COVER_RATE) return null;
    var L = A.live(S).filter(function (q) { return q !== a && St.here(q); });
    if (!L.length) return null;
    var b = HK.weighted(g, L, function (q) { return 0.3 + Math.max(0, A.bond(S, q, a)) * 1.5 + (A.lover(S, a, q) ? 2 : 0) + (fixedTo(q, a) ? 2 : 0); });
    var w = lwOf(S), low = w.lv === 'low', fam = A.family(S, a, b), ng = !!(HK.ngExplicit && HK.ngExplicit(a, b));
    var drag = !low && !fam && !ng && St.mobSexOk(b) && P.canReceive(b) && !lockList(b).length && (!HK.Content || HK.Content.ok(S, 'force'));
    var watch = !low && !fam && !ng && St.r18ok(b) && !b.noR18 && likesG(b, a);
    var br = HK.weighted(g, [['hit', drag || watch ? 0.6 : 1], ['offer', 0.8], ['both', drag ? 1 : 0], ['watch', watch ? 1.2 : 0]].filter(function (x) { return x[1] > 0; }), function (x) { return x[1]; })[0];
    if (br === 'offer') br = drag ? 'swap' : 'offerNo';
    var c = null;
    if (br === 'watch') { var cl = lockList(b).filter(function (i) { return i !== a.i; }); if (cl.length) c = S.P.filter(function (p) { return p.i === cl[0]; })[0] || null; }
    return { a: a, b: b, g: g, br: br, rel: relOf(S, b, a), x: xName(S, o), c: c };
  };
  R.coverRun = function (S, cv) {
    var r0 = S.rng; S.rng = cv.g;
    try { coverBody(S, cv); } finally { S.rng = r0; }
  };
  function coverBody(S, cv) {
    var C = SH.X.cov, X = XE(), A = SH.API, ST2 = HK.Story, a = cv.a, b = cv.b, br = cv.br;
    var w = lwOf(S), novel = !w.ero, sh = shortOf(S), sep = sh ? '' : '\n\n';
    var m = { a: a.name, b: b.name, x: cv.x, c: cv.c ? cv.c.name : '' };
    var f = function (arr, v, late) { return fx(S, pkL(S, arr), v || a, m, late, novel); };
    var peak = function (v) { return f(X.peak[persOf(v)] || X.peak.gentle, v, true) + climaxOf(S, v, novel); };
    var take = function (v) { return novel ? f(C.novel, v) : f(X.body[bodyKey(v)], v) + (sh ? '' : f(X.mid, v)); };
    var fin = function (v) { return novel || sh ? '' : f(X.fin, v, true); };
    S._shieldN = (S._shieldN || 0) + 1;
    var rj = REL_JP[cv.rel] || '仲間', t1 = f(C.motive[cv.rel] || C.motive.friend), t2 = '', tag2 = '', act2 = [b], t3 = '', why1 = b.name + 'が、捕まった' + a.name + '（' + rj + '）を助けに入った';
    if (br === 'hit' || br === 'offerNo') {
      if (br === 'offerNo') { t1 += f(C.offer) + f(C.offerNo); why1 += '。身代わりを申し出たが、届かなかった' + (b.noR18 ? '（R18に参加しないので、巻き込まれない）' : ''); }
      else why1 += '。触手に弾かれた' + (b.noR18 ? '（R18に参加しないので、巻き込まれない）' : '');
      t1 += sep + f(C.hit) + f(C.hitEnd);
      b.m.hp = Math.max(1, (b.m.hp || 0) - 8); A.stress(b, 6);
    } else if (br === 'swap') {
      t1 += f(C.offer); why1 += '。自分を身代わりに差し出した';
      tag2 = '庇い：身代わり'; t2 = f(C.swap) + sep + take(b) + sep + peak(b) + fin(b); t3 = f(C.swapEnd);
    } else if (br === 'both') {
      why1 += '。二人とも引きずり込まれた';
      tag2 = '庇い：二人とも'; t2 = f(C.both) + sep + take(b) + f(C.bothMid) + sep + peak(b) + climaxOf(S, a, novel) + fin(b); t3 = f(C.bothEnd);
    } else {
      why1 += '。触手に絡め取られ、見せつけられた' + (cv.c ? '（性行為の相手を固定しているので、体の関係にはならない）' : '');
      tag2 = '庇い：見せつけられて'; act2 = [a];
      t2 = f(C.watch) + sep + (novel ? f(C.watchA) : f(C.watchAEro)) + sep + f(novel ? C.watchB : C.watchBEro) + (cv.c ? f(C.watchFix) : '') + sep + peak(a) + fin(a);
      t3 = f(C.watchEnd) + f(C.shame);
    }
    var o1 = ST2.say(S, { actors: [b, a], tag: '庇い', kind: 'climax', text: t1, why: why1, mag: 28 });
    if (!S._bnCovKey) { S._bnCovKey = true; ST2.key(S, o1, b.name + 'が' + a.name + 'を庇った'); }
    if (t2) {
      if (br !== 'watch') { b.cnt.r18 = (b.cnt.r18 || 0) + 1; A.stress(b, 10); } else A.stress(b, 8);
      if (HK.EroScene) HK.EroScene.touch(S);
      ST2.say(S, { actors: act2, tag: tag2, kind: 'climax', text: t2, why: br === 'watch' ? a.name + 'は、助けに来た' + b.name + 'の目の前で' + cv.x + 'に襲われた。' + b.name + 'は見せつけられ、体が熱くなるのを止められなかった' : b.name + 'は' + cv.x + 'に襲われた（' + a.name + 'を庇って巻き込まれた）', mag: 30 });
    }
    A.setRel(S, a, b, cv.rel === 'enemy' ? 0.12 : 0.18);
    ST2.say(S, { actors: [b, a], tag: '庇いのあと', text: (t3 ? t3 + sep : '') + f(C.after[cv.rel] || C.after.friend), why: b.name + 'と' + a.name + '（' + rj + '）のそのあと', mag: 18 });
  }

  /* 記録に書く直前：宇宙船の場面の印を片づけ、研究（男性向け）を組み、庇い展開を続ける */
  var STY = HK.Story;
  function isShip(S) { return !!(S && S.ship && S.scen && S.scen.id === 'ship'); }
  function covTag(tag) {
    if (tag === '異星の生き物' || tag === '異種族の誘い') return true;
    var T = SH.X2 && SH.X2.TAG; return !!(tag && T && Object.keys(T).some(function (k) { return T[k] === tag; }));
  }
  /* 包み直しは HK.wrap（包む順を元のファイルの順に固定。分割読み込みで後から届いた包みが内側に入る） */
  if (STY && STY.say) HK.wrap(STY, 'say', function (say0) { return function (S, o) {
    if (!o || typeof o.text !== 'string' || !isShip(S)) return say0.apply(this, arguments);
    var a = o.actors && o.actors.length === 1 && o.actors[0] && typeof o.actors[0] === 'object' ? o.actors[0] : null, cv = null;
    if (a && covTag(o.tag) && !/自分で攻めを選んで/.test(o.why || '')) cv = R.coverPlan(S, a, o);
    o.text = R.relocate(o.text, !!cv);
    if (a && o.tag === '研究' && R.labOn(S)) o.text = R.labEro(S, a, o.text);
    var r = say0.apply(this, arguments);
    if (cv) R.coverRun(S, cv);
    return r;
  }; });
})();
