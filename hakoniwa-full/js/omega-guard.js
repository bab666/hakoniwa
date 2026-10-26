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
    kind: L('{a}は小さな箱を{b}に差し出した。中には、柔らかい革のネックガードが入っていた。「番になっても、外では何があるか分からないから。……苦しくないものを選んだつもり｜番になっても、外では何があるか分からない。……苦しくないものを選んだつもりだ｜番になっても、外では何があるか分かりませんから。……苦しくないものを選んだつもりです」|ある朝、{a}は「肌に合うか試して｜肌に合うか試してくれ｜肌に合うか試してください」と言って、{b}の首に裏地の柔らかいネックガードを当てた。噛み跡がこすれないように、内側には布が貼ってあった。|{a}は何日も店を回って、{b}の肌の色に合うネックガードを探してきた。「噛み跡、まだ痛むだろ。人に見られるのも嫌かと思って｜噛み跡は、まだ痛むだろう。人に見られるのも嫌だろうと思った｜噛み跡、まだ痛むでしょう。人に見られるのも嫌かと思ったんです」|{a}は{b}の首にそっとネックガードを留めた。「これで、知らない誰かに怯えなくていい。外すのは、私の前だけでいいから｜これで、知らない誰かに怯えなくていい。外すのは、私の前だけでいい｜これで、知らない誰かに怯えなくていいです。外すのは、私の前だけでいいですから」'),
    own: L('{a}は黙って、{b}の首にネックガードを巻いた。留め具の内側には、{a}の名前が刻んであった。「これで誰が見ても分かる。あなたが誰のものか｜＝｜これで、あなたが誰のものか、誰が見ても分かります」|{a}が贈ったのは、鍵のついたネックガードだった。鍵は{a}のポケットにしまわれた。「外したくなったら、私に頼めばいい｜＝｜外したくなったら、私に頼めばいいんです」|「他のαに見せたくない｜＝｜他のαに見せたくないんです」――{a}はそう言って、{b}のうなじの噛み跡をすっぽり覆うネックガードを着けさせた。色は、{a}の瞳と同じだった。|{a}は{b}の首に、自分の匂いをしみこませたネックガードを留めた。「どこにいても、私の匂いがするように｜＝｜どこにいても、私の匂いがするようにしました」'),
    both: L('{a}は{b}の首にネックガードを着けながら言った。「守りたいのも本当。……誰にも触らせたくないのも、本当｜守りたいのも本当だ。……誰にも触らせたくないのも、本当だ｜守りたいのも本当です。……誰にも触らせたくないのも、本当です」|ネックガードの裏には、小さく{a}の名前と、「ずっと」という一言が刻まれていた。{a}は照れくさそうに、それでも目を逸らさなかった。|{a}が選んだのは、柔らかくて、しかもしっかりした鍵のついたネックガードだった。「痛くないように。でも、誰にも外せないように｜痛くないように。だが、誰にも外せないように｜痛くないように。でも、誰にも外せないようにしました」')
  };
  var REACT = {
    CP: L('{b}は「子ども扱いしないで｜子ども扱いするな｜子ども扱いしないでください」と言いながら、その日から一度も外さなかった。|{b}は眉をひそめて「大げさだよ｜大げさだ｜大げさです」と言った。それでも鏡の前で、留め具の位置を何度も直していた。'),
    NP: L('{b}は首元に手を当てて、「ありがとう。大事にするね｜ありがとう。大事にする｜ありがとうございます。大事にしますね」と微笑んだ。|{b}は嬉しそうに、お返しに何を贈ろうかと考えはじめた。'),
    A: L('{b}は留め具の作りを確かめてから、「実用的だね。……気に入った｜実用的だな。……気に入った｜実用的ですね。……気に入りました」と頷いた。|{b}は素材と強度を一通り確かめ、それから小さく「ありがとう｜＝｜ありがとうございます」と言った。'),
    FC: L('{b}は鏡の前でくるりと回って、「似合う？｜似合うか？｜似合いますか？」と何度も聞いた。|{b}はさっそく写真を撮って、待ち受けにした。'),
    AC: L('{b}は首元を押さえたまま、目を潤ませた。「……一生、大事にする｜＝｜……一生、大事にします」|{b}はしばらく言葉が出ず、それから{a}の胸に顔をうずめた。')
  };
  var REACT_OWN = L('{b}は首元に触れて、少しだけ顔を赤くした。「……重いよ｜……重い｜……重いです」――それでも、外そうとはしなかった。|{b}は留め具の名前を指でなぞった。逃げ場がなくなったのに、なぜか安心していた。|{b}は「束縛だ｜＝｜束縛です」と笑った。笑いながら、{a}の手を首元に引き寄せた。');

  /* 独占欲（関係「執着なし」の相手には向かない） */
  function jea(ctx, a, b) { return HK.Obsess && !HK.Obsess.jealOk(ctx, a, b) ? 0 : a.tr.jealous; }
  function ok(ctx, a, b) {
    var om = ctx.om;
    return om && sx(a) === 'a' && sx(b) === 'o' && om.bonded[key(a, b)] && ctx.pair(a, b).couple && a.alive !== false && b.alive !== false && !(om.guard || {})[b.i] && (kind(a.tr) >= 0.55 || jea(ctx, a, b) >= 0.55);
  }
  function give(ctx, a, b) {
    var om = ctx.om, k = kind(a.tr), j = jea(ctx, a, b);
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

/* ---------- 結末の締め：決まった結末（ctx.om.ending）を、記録の最後に一つの場面として置く ----------
   結末の条件：誰か一組の関係が結末に届いた時点（omega-bond.js の B.check）。3年たっても届かなければ、いちばん濃い組で打ち切る。
   後日談（ネックガード・巣作り）のあとに「結末」の段と、結末の種類ごとに書き分けた締めの文を入れる */
(function () {
  'use strict';
  var HK = window.HK, scen = HK.SCENARIOS && HK.SCENARIOS.omega;
  if (!scen) return;
  function L(s) { return s.split('|'); }
  var KIND = {
    bond: 'bond_heat bond_fated bond_vow bond_switch bond_buddy bond_rival bond_instinct fated_found',
    lovers: 'lovers_beta lovers_aa lovers_oo lovers_resist lovers_scar lovers_nobond fated_switch stolen mended',
    brk: 'break_drift break_bias break_switch break_cheat split_fated abandon second_mate',
    unreq: 'reject oneway_other pining rival_lost fated_late',
    apart: 'hesitate fated_free onenight strangers quit_alone',
    fwb: 'fwb affair',
    hate: 'lovehate',
    friend: 'friends rivals buddy',
    shinju: 'ob_shinju',
    dark: 'ob_forced ob_trapped ob_nest ob_codep ob_yandere'
  };
  var OF = {};
  Object.keys(KIND).forEach(function (k) { KIND[k].split(' ').forEach(function (id) { OF[id] = k; }); });
  var SCENE = {
    bond: L('季節がひと回りしたころ、{a}と{b}は同じ鍵を持つようになった。玄関には、いつも二人分の靴が並んでいる。|{b}のうなじの噛み跡は、もう痛まない。{a}は今でもときどき、そこにそっと唇を寄せる。|二人の部屋には、互いの匂いが混ざり合って染みついた。{a}と{b}は、それを「うちの匂い」と呼んでいる。'),
    lovers: L('{a}と{b}の毎日は、大きな事件もなく続いている。朝はどちらかが先に起きて、もう一人の分のコーヒーを淹れる。|休みの日、{a}と{b}は並んで街を歩いた。すれ違う誰の匂いにも、もう振り返らなかった。|{a}は{b}の隣で、来月の予定を話した。その先の予定も、当たり前のように二人分だった。'),
    brk: L('{a}の部屋から、{b}の匂いが少しずつ消えていった。最後に残ったのは、返しそびれた一枚のシャツだけだった。|{a}と{b}は、駅のホームで最後の挨拶をした。電車が来るまで、どちらも目をそらさなかった。|{b}は引っ越しの段ボールに、二人で撮った写真を伏せてしまい込んだ。それで、一つの季節が終わった。'),
    unreq: L('{a}は今も、{b}の匂いがする場所を通るたび、少しだけ足をゆるめる。|季節が変わっても、{a}と{b}の距離は変わらなかった。届かなかった言葉は、{a}の胸の中で静かに丸くなった。|{a}は{b}に宛てた言葉を、最後まで送らなかった。下書きのまま、それは今もスマホの中にある。'),
    apart: L('{a}と{b}は、それぞれの道を歩いている。すれ違うことはあっても、もう立ち止まることはない。|{a}は新しい季節の中で、自分の暮らしを続けた。{b}もまた、どこかで同じようにしているのだろう。|{a}と{b}の話は、ここで一度幕を下ろした。続きがあるのかどうかは、まだ誰にも分からない。'),
    fwb: L('{a}のスマホに、{b}から短いメッセージが届いた。用件は書いていない。書かなくても分かった。|{a}と{b}は、朝になるとそれぞれの顔に戻る。名前のない関係は、名前のないまま続いていく。|{a}は{b}の部屋の合鍵を持っていない。それでも次の発情期がいつ来るかは、二人とも知っている。'),
    hate: L('{a}と{b}は、今日もどこかで言い合いをしている。その声が途切れた夜にだけ、二人の距離はなくなる。|{a}は{b}の悪口を言うたび、少しだけ声が甘くなる。{b}も、それに気づかないふりを続けている。|{a}と{b}の関係に、名前はまだない。憎まれ口と熱のあいだを、二人は行ったり来たりしている。'),
    friend: L('{a}と{b}は、今日も変わらない調子で顔を合わせた。それ以上でも以下でもない距離が、二人にはちょうどよかった。|{a}が困ったとき、最初に連絡するのは{b}だった。恋ではなかったが、それに負けない縁だった。|{a}と{b}は、何年たってもこうして会うのだろう。恋の話にはならなかったが、それを惜しいと思うこともなかった。'),
    shinju: L('二人の部屋は、しばらくして静かに片づけられた。残された匂いも、季節が変わるころには消えていった。|{a}と{b}の名前は、小さな記事の片隅に載っただけだった。街は何事もなかったように、次の季節へ進んだ。|誰もいなくなった部屋の窓辺に、二人がよく並んでいた場所の跡だけが残った。'),
    dark: L('{a}と{b}の部屋のカーテンは、昼でも閉じたままになった。外の誰も、二人の本当の顔を知らない。|{b}の周りには、いつも{a}の匂いがまとわりついている。それを愛と呼ぶのか、檻と呼ぶのか、もう誰にも決められない。|街は何も変わらずに季節を進めた。ただ{a}と{b}だけが、その流れから少し外れたところで、二人きりで閉じている。')
  };
  var WHEN = L('{m}か月が過ぎた。|見守りはじめて{m}か月。|こうして、{m}か月がたった。');
  var TIMEOUT = L('三年がたっても、二人の関係はそれ以上動かなかった。|三年という時間が、二人の答えになった。|気づけば、三年が過ぎていた。');
  function closing(ctx) {
    var E = ctx.om && ctx.om.ending;
    if (!E) return;
    var a = ctx.chars[E.a], b = E.b != null ? ctx.chars[E.b] : null;
    var k = OF[E.id] || 'apart';
    if (!b) k = 'apart';
    var m = Math.ceil((ctx.stepIndex + 1) / 2);
    /* 全年齢版では「果て」が言い換えの対象になるので、題を言い換えておく */
    if (HK.SAFE_ON && E.title === '執着の果て') { E.title = '執着の行き着く先'; ctx.flags.outcome = E.title; }
    var t = (E.timeout ? ctx.pick(TIMEOUT) : ctx.pick(WHEN).replace('{m}', m)) + (E.text || '');
    t += ctx.t(ctx.pick(SCENE[k]), a, b || a);
    (E.others || []).forEach(function (o) { t += String(o.text || '').replace(/^[^：。]{1,24}：/, ''); });
    ctx.say({ kind: 'step', cat: 'phase', text: '結末「' + E.title + '」' });
    ctx.say({ kind: 'event', cat: 'phase', cageOk: true, actors: b ? [a, b] : [a], text: t, why: '結末：' + E.title, mag: 30 });
  }
  var fin0 = scen.finish;
  scen.finish = function (ctx) {
    var r = fin0 ? fin0.apply(this, arguments) : undefined;
    ctx.flush();
    closing(ctx);
    return r;
  };
})();
