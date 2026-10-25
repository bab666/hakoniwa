/* 箱庭シミュレーター: 特殊役職（不死・吸血鬼）と発狂（全年齢版・R18版共通）
   死のある箱庭（ダンジョンRPG・ゾンビの街・邪神村RTA・吹雪の館の殺人・宇宙船漂流記）の住人の欄に「特殊役職」を足す。
   ・不死／吸血鬼：死んでも傷が塞がり、体力満タンで起き上がる。攫われて行方不明になることはある（そのときは戻らない）
   ・精神が摩耗しすぎると発狂して動けなくなる。仲の良い人が落ち着かせるまで戻らず、そのあいだは死の出来事を引きやすい
   ・吸血鬼は三日に一度、人の血を吸う（ゾンビ・感染した人の血は吸えない）。好意のある相手を襲うか、同意を得て吸う。
     恋愛相手を固定している吸血鬼は、その人からしか吸えない。吸える相手がいない環境では、例外的に死ぬ
   ・吸血鬼に目を見つめられた人は催眠状態になり、言いなりになる。警戒心の強い人は目を逸らして逃れられる
   ・邪神村では、特殊役職でなくても全員が発狂しうる（jashin.js）
   箱庭ごとの違いは「アダプター」A で受け取る（各箱庭の組み込み側で作る）：
     A = { rng, all, alive(p), here(p), say(o), hp(p), setHp(p, v), full(p), stress(p), addStress(p, v), rel(a, b),
           nowH, r18, revive(p), kill(p, how, text, by), zombie(p), lewd, near(a, b)?, reviveText(p)?, relMod(b, a, how)? }
     rel(a, b) は a から見た b：{ love: 恋仲か, w: -1〜1 の好意 }。say(o) は { actors, tag, text, why, mag, key } */
(function () {
  'use strict';
  var HK = window.HK;
  function L(s) { return s.split('|'); }
  function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }
  function fmt(t, v) { return String(t).replace(/\{(\w+)\}/g, function (m, k) { return v[k] != null ? v[k] : m; }); }
  /* 最近使った文を避けて選ぶ */
  function near(A, a, b) { return !A.near || A.near(a, b); }
  function pick(A, arr) {
    var r = A._rec = A._rec || [], t = arr[Math.floor(A.rng() * arr.length)];
    for (var i = 0; i < 4 && arr.length > 1 && r.indexOf(t) >= 0; i++) t = arr[Math.floor(A.rng() * arr.length)];
    r.push(t); if (r.length > 30) r.shift();
    return t;
  }
  function wpick(A, list, wf) {
    var tot = 0, ws = list.map(function (x) { var w = Math.max(0, wf(x)); tot += w; return w; });
    if (!tot) return null;
    var r = A.rng() * tot;
    for (var i = 0; i < list.length; i++) { r -= ws[i]; if (r <= 0) return list[i]; }
    return list[list.length - 1];
  }

  var SP = HK.Special = {};
  SP.SCENES = ['rpg', 'zombie', 'jashin', 'yakata', 'ship'];
  SP.LABEL = { immortal: '不死', vampire: '吸血鬼' };
  /* 吸血鬼は特殊役職としては選ばず、住人の種族（attr.js の race = 'vampire'）で決める（2026-10-25）。古い保存の special = 'vampire' は ui.js が種族に移す */
  SP.FIELD = { id: 'special', label: '特殊役職', auto: 'なし', options: [{ id: 'immortal', label: '不死（死んでも蘇る）' }], note: '吸血鬼は住人の設定の「種族」で選びます（死んでも蘇り、三日に一度血を吸います）' };
  /* 箱庭の欄に足す（箱庭がそろったあと、ui.js から一度） */
  SP.install = function () {
    SP.SCENES.forEach(function (id) {
      var sc = HK.SCENARIOS && HK.SCENARIOS[id];
      if (!sc) return;
      sc.perFields = (sc.perFields || []).filter(function (f) { return f.id !== 'special'; }).concat([SP.FIELD]);
    });
  };
  /* 住人に役職を付ける。pc は perChar */
  SP.setup = function (A, P, pcOf) {
    P.forEach(function (p) {
      var v = ((pcOf(p) || {}).pick || {}).special;
      /* 吸血鬼は住人の種族（attr.js）で決める。不死を選んでいれば不死のまま。古い入力の special = 'vampire' も吸血鬼として扱う */
      p.spec = v === 'immortal' ? v : (v === 'vampire' || (HK.Attr && HK.Attr.isVampire(p))) ? 'vampire' : '';
      p.spRev = 0; p.mad = null; p.wear = 0;
      if (p.spec === 'vampire') p.vamp = { due: 6 + A.rng() * 42, fed: 0, warn: false };
    });
  };
  SP.is = function (p) { return !!(p && p.spec); };
  SP.label = function (p) { return p && p.spec ? SP.LABEL[p.spec] : ''; };

  /* ---------- 蘇る ---------- */
  /* 攫われた・神隠し・呑み込まれた……のような「行方不明」は戻らない */
  var GONE = /連れ去|攫|神隠し|取り残|消えた|呑み込|呑まれ|行方|旅立|成り代わ|花嫁|連れて行か|閉じ込め|連れ帰|帰ってこな/;
  var REVIVE = {
    immortal: L('{a}の指先が、ぴくりと動いた。裂けていた傷がみるみるうちに塞がり、{a}は何事もなかったように起き上がった。|しばらくして、{a}は大きく息を吸い込んだ。止まっていた心臓が、また動き出していた。傷は、跡形もなかった。|{a}は咳き込みながら目を開けた。「……また、死に損なったか」――血だまりの中で、傷だけが消えていた。|冷たくなっていたはずの{a}の頬に、赤みが戻った。{a}は自分の体を確かめるように撫でて、立ち上がった。'),
    vampire: L('灰のように白くなっていた{a}の肌に、血の気が戻った。{a}は赤く光る目を開け、ゆっくりと起き上がった。|{a}の傷口から、黒い霧が立ちのぼった。霧が晴れたとき、{a}は無傷でそこに立っていた。|動かなくなった{a}の指が、床を引っかいた。{a}は牙を覗かせて笑い、何事もなかったように身を起こした。|夜の冷気の中で、{a}の体は元の形を取り戻していった。{a}は首を鳴らして、「まだ、死なせてくれないらしい」と呟いた。')
  };
  var WITNESS = L('{b}は悲鳴を飲み込んだ。目の前で起きたことが、信じられなかった。|{b}は後ずさった。さっきまで死んでいたはずなのに。|{b}は思わず{a}に駆け寄り、その体温を確かめた。|{b}は何も言えず、ただ{a}を見つめていた。');
  /* 死んだ不死・吸血鬼を起こす。起きた人の一覧を返す */
  SP.revive = function (A) {
    var out = [];
    A.all.forEach(function (p) {
      if (!p.spec || A.alive(p) || p.spNoRev || p.spGone) return;
      if (GONE.test(p.fate || '')) { p.spGone = true; return; }
      A.revive(p);
      A.setHp(p, A.full(p));
      p.spRev++;
      /* 傷は治っても、死んだ記憶は心をすり減らす */
      p.wear = (p.wear || 0) + 5; A.addStress(p, 15);
      var wit = A.all.filter(function (q) { return q !== p && A.alive(q) && A.here(q) && !q.spec && near(A, p, q); });
      var w = wit.length ? pick(A, wit) : null;
      wit.forEach(function (q) { A.addStress(q, 8); });
      var o = A.say({ actors: w ? [p, w] : [p], tag: '蘇生', text: ((A.reviveText && A.reviveText(p)) || fmt(pick(A, REVIVE[p.spec]), { a: p.name })) + (w ? fmt(pick(A, WITNESS), { a: p.name, b: w.name }) : ''), why: SP.LABEL[p.spec] + '：死んでも、傷が回復して体力満タンで蘇る（' + p.spRev + '回目）', mag: 30, key: p.spRev === 1 ? p.name + 'が蘇った' : '' });
      out.push(p);
    });
    return out;
  };
  /* 結末に添える一言 */
  SP.endNote = function (p) {
    if (!p || !p.spec) return '';
    var t = SP.LABEL[p.spec] + (p.spRev ? '・' + p.spRev + '回蘇った' : '');
    if (p.vamp && p.vamp.fed) t += '・血を吸ったのは' + p.vamp.fed + '回';
    if (p.mad) t += '・発狂したまま';
    return t;
  };

  /* ---------- 発狂 ---------- */
  /* 性格ごとのなりやすさ（proud stern tsun gentle devoted cool free shy の順） */
  var MAD = [
    { id: 'panic', label: 'パニック', w: [0.5, 0.5, 2, 1, 2, 0.5, 1, 3], danger: 1.8,
      on: L('{a}は突然叫び出した。誰の声も届かず、腕を振り回して、壁にぶつかりながら走り回った。|{a}の呼吸が、どんどん速くなっていった。「無理、無理、無理……っ」――{a}は頭を抱えてうずくまり、誰にも触らせなかった。'),
      act: L('{a}は物音がするたびに悲鳴を上げ、隠れる場所を探して這い回った。|{a}は「来ないで」と繰り返しながら、出口のない部屋の隅に逃げ込んだ。|{a}は誰かの足音を聞いただけで、叫んで走り出した。') },
    { id: 'murder', label: '殺人癖', w: [2.5, 1.5, 1, 0.4, 0.4, 1.5, 1, 0.4], danger: 1.6,
      on: L('{a}の目から、何かが抜け落ちた。{a}は手近な刃物を握りしめ、仲間の背中をじっと見つめていた。|{a}は静かに笑った。「……そうか。全員いなくなれば、怖くないんだ」|{a}は黙って、誰がいちばん弱いかを数えはじめた。'),
      act: L('{a}は刃物を手放さず、誰かが眠るのを待っていた。|{a}は、夜の間ずっと仲間の首筋を見ていた。') },
    { id: 'regress', label: '幼児退行', w: [0.4, 0.4, 0.8, 2, 2, 0.5, 0.8, 2], danger: 1.4,
      on: L('{a}は膝を抱えて、子どものような声で母親を呼びはじめた。|{a}は指をしゃぶり、「\u2060おうちかえる」とだけ繰り返した。'), /* r18:ok */
      act: L('{a}は床に座り込んで、意味のない歌を口ずさんでいた。|{a}は誰かの服の裾を掴んで、離そうとしなかった。') },
    { id: 'stupor', label: '昏迷', w: [0.5, 2, 0.5, 0.6, 0.6, 2.5, 0.4, 1], danger: 1.7,
      on: L('{a}は、ぴたりと動かなくなった。目は開いているのに、何も見ていなかった。|{a}は話しかけても返事をしなかった。瞬きすら、ほとんどしなくなった。'),
      act: L('{a}は同じ姿勢のまま、何時間も壁を見つめていた。|{a}は呼ばれても振り向かず、置かれた水にも手をつけなかった。') },
    { id: 'paranoia', label: '被害妄想', w: [1.5, 2, 1.5, 0.4, 0.5, 1, 0.5, 0.6], danger: 1.4,
      on: L('{a}は仲間の顔を一人ずつ睨みつけた。「……お前たちの誰かが、あいつらと通じてるんだろ」|{a}は「みんな、グルだったんだ」と言い出し、誰の差し出す食べ物も口にしなくなった。'),
      act: L('{a}は仲間の寝顔を疑わしげに覗き込み、荷物を勝手に漁っていた。|{a}は「聞いてるのは分かってる」と、何もない壁に向かって怒鳴った。') },
    { id: 'halluc', label: '幻覚', w: [0.6, 0.6, 0.7, 1, 0.8, 0.7, 1.5, 1], danger: 1.5,
      on: L('{a}は誰もいない部屋の隅に向かって、楽しそうに話しかけはじめた。|{a}は天井を指さして叫んだ。「ほら、そこにいる。ずっと見てる」'),
      act: L('{a}は見えない誰かと口論していた。|{a}は自分の腕を這う「何か」を払い落とそうと、何度も肌をこすっていた。') },
    { id: 'selfharm', label: '自傷', w: [0.4, 0.4, 1.5, 0.6, 2.5, 0.4, 0.4, 1], danger: 1.5, hurt: 8,
      on: L('{a}は爪を立てて、自分の腕を掻きむしりはじめた。血が滲んでも、やめなかった。|{a}は「全部、自分のせいだ」と呟き、壁に額を打ちつけた。'),
      act: L('{a}の腕には、新しい傷が増えていた。|{a}は止める手を振りほどいて、また自分を傷つけた。') },
    { id: 'laugh', label: '哄笑', w: [1, 0.5, 0.5, 1, 0.4, 0.4, 2.5, 0.4], danger: 1.4,
      on: L('{a}は突然、腹を抱えて笑い出した。笑いは止まらず、そのうち涙と嗚咽が混ざった。|{a}はけらけらと笑った。「あはは、なにこれ、おかしい、おかしいよ」'),
      act: L('{a}の笑い声が、夜通し響いていた。|{a}は何を言われても、笑うことしかできなかった。') },
    { id: 'zealot', label: '狂信', w: [0.5, 0.5, 0.4, 1.5, 1.5, 0.4, 1, 0.6], danger: 1.6,
      on: L('{a}はその場にひざまずき、聞いたこともない祈りの言葉を唱えはじめた。|{a}は恍惚とした顔で言った。「分かったよ。全部、あの方に捧げればいいんだ」'),
      act: L('{a}は床に奇妙な紋様を描いては、その前で祈りを捧げていた。|{a}は仲間の手を取って、「一緒に行こう」と熱っぽく囁いた。') },
    { id: 'fugue', label: '遁走', w: [0.6, 0.6, 0.6, 0.7, 0.6, 1, 1.5, 0.8], danger: 2.2,
      on: L('{a}は自分の名前を呼ばれても、首をかしげた。そして、ふらりと外へ歩き出した。|{a}は「帰らなきゃ」と言って、靴も履かずに出ていこうとした。'),
      act: L('{a}は目を離した隙に、またどこかへ歩いていこうとした。|{a}は知らない道を、ぼんやりと歩き続けていた。') }
  ];
  var PERS = ['proud', 'stern', 'tsun', 'gentle', 'devoted', 'cool', 'free', 'shy'];
  var PMAP = { aniki: 'proud', tsun_n: 'tsun', gentle_n: 'gentle', devoted_p: 'devoted', calm: 'cool', polite: 'stern', kohai: 'devoted', ojou: 'proud', mixed: 'free', kansai: 'free', noja: 'proud', mukuchi: 'cool', darui: 'cool', gentleman: 'stern', sondai: 'stern', ane: 'gentle', usan: 'free', yankee: 'proud', cool_soft: 'cool', darui_lite: 'cool', boku_n: 'gentle', god: 'stern' };
  SP.MAD = MAD;
  function pidx(p) { var k = PMAP[p.persona] || p.persona; var i = PERS.indexOf(k); return i < 0 ? 3 : i; }
  var CALM = L('{b}は{a}の手を握り、名前を何度も呼んだ。{a}の目に、ゆっくりと光が戻っていった。|{b}は暴れる{a}を後ろから抱きしめて、離さなかった。やがて{a}の体から、力が抜けた。|{b}は{a}の隣に座って、二人で過ごした日のことを話し続けた。{a}はいつの間にか、泣きながら頷いていた。|「大丈夫。ここにいる」――{b}の声に、{a}はようやく顔を上げた。');
  var MURDER_HIT = L('{a}は背後から{b}に襲いかかった。{b}はとっさに身をよじり、肩を切られながらも突き飛ばした。|{a}は眠っている{b}の首に手をかけた。{b}が目を覚まして暴れ、ほかの仲間が二人を引きはがした。|{a}は刃物を振りかぶって{b}に向かっていった。{b}は腕で受け止め、深い傷を負った。');
  var MURDER_KILL = L('{a}の刃は、{b}の喉を正確に捉えていた。|{a}は、{b}が動かなくなるまで手を離さなかった。');
  /* 発狂しているか */
  SP.isMad = function (p) { return !!(p && p.mad); };
  /* 死の出来事の引きやすさ（発狂中は高い） */
  SP.danger = function (p) { if (!p || !p.mad) return 1; var m = MAD.filter(function (x) { return x.id === p.mad.id; })[0]; return m ? m.danger : 1.5; };
  /* 精神の摩耗を足す（ストレスの高い時間が続くほど溜まる）。発狂したら true。opt.all＝特殊役職でなくても発狂する */
  SP.wear = function (A, p, opt) {
    opt = opt || {};
    if (p.mad || (!p.spec && !opt.all) || !A.alive(p)) return false;
    var s = A.stress(p), tr = p.tr || {};
    p.wear = (p.wear || 0) + Math.max(0, s - (opt.base || 72)) / 8 * HK.Dark.f(A, 'madness') + (opt.add || 0);
    var lim = (opt.lim || 26) * (1 + (tr.cp || 0) * 0.35 + (tr.a || 0) * 0.2 - (tr.ac || 0) * 0.2);
    if (p.wear < lim) return false;
    return SP.goMad(A, p, opt);
  };
  SP.goMad = function (A, p, opt) {
    opt = opt || {};
    var i = pidx(p);
    var m = wpick(A, MAD, function (x) { return x.w[i] * (opt.zealot && x.id === 'zealot' ? 2 : 1); });
    p.mad = { id: m.id, label: m.label, at: A.nowH };
    var o = A.say({ actors: [p], tag: '発狂', text: fmt(pick(A, m.on), { a: p.name }), why: '精神が摩耗しきった（恐怖・ストレス ' + Math.round(A.stress(p)) + '）→ 発狂：' + m.label + '。仲の良い人が落ち着かせるまで動けない', mag: 34, key: p.name + 'が発狂した（' + m.label + '）' });
    A.all.forEach(function (q) { if (q !== p && A.alive(q) && A.here(q) && near(A, p, q)) A.addStress(q, 6); });
    return true;
  };
  /* 発狂している人の番。動けないので、行動を使ったら true */
  SP.madTurn = function (A, p) {
    if (!p.mad || !A.alive(p)) return false;
    var m = MAD.filter(function (x) { return x.id === p.mad.id; })[0];
    /* 仲の良い人が落ち着かせる */
    var fr = A.all.filter(function (q) { return q !== p && A.alive(q) && A.here(q) && !q.mad && near(A, p, q) && A.rel(q, p).w >= 0.45; }).sort(function (a, b) { return A.rel(b, p).w - A.rel(a, p).w; })[0];
    if (fr && A.rng() < 0.22 + A.rel(fr, p).w * 0.35 + (A.rel(fr, p).love ? 0.1 : 0)) {
      p.mad = null; p.wear = 0;
      A.addStress(p, -45);
      A.say({ actors: [fr, p], tag: '正気に戻る', text: fmt(pick(A, CALM), { a: p.name, b: fr.name }), why: fr.name + 'が' + p.name + 'を落ち着かせた（' + m.label + 'から戻った）', mag: 26 });
      return true;
    }
    /* 殺人癖：そばの人を襲う */
    if (m.id === 'murder' && A.rng() < 0.35) {
      var vs = A.all.filter(function (q) { return q !== p && A.alive(q) && A.here(q) && near(A, p, q); });
      var v = vs.length ? pick(A, vs) : null;
      if (v) {
        var dmg = 18 + Math.floor(A.rng() * 18);
        A.setHp(v, A.hp(v) - dmg); A.addStress(v, 20);
        if (A.hp(v) <= 0 || A.rng() < 0.12) {
          A.kill(v, p.name + 'に襲われて', fmt(pick(A, MURDER_KILL), { a: p.name, b: v.name }), p);
          return true;
        }
        A.say({ actors: [p, v], tag: '凶行', text: fmt(pick(A, MURDER_HIT), { a: p.name, b: v.name }), why: p.name + 'は発狂している（殺人癖）', mag: 30 });
        return true;
      }
    }
    if (m.hurt) A.setHp(p, Math.max(1, A.hp(p) - m.hurt));
    /* 毎回書くとくどいので、ときどきだけ様子を書く（動けないのは同じ） */
    if (A.rng() > 0.45) return true;
    A.say({ actors: [p], tag: '発狂中', text: fmt(pick(A, m.act), { a: p.name }), why: '発狂（' + m.label + '）で動けない。' + (fr ? fr.name + 'の声は、まだ届かない' : '落ち着かせてくれる仲の良い人がそばにいない'), short: p.name + 'は発狂したまま' });
    return true;
  };

  /* ---------- 吸血鬼 ---------- */
  var V = SP.VT = {
    thirst: L('{a}の喉が、焼けるように渇いていた。最後に血を口にしてから、三日が経とうとしていた。|{a}の瞳が、赤く濁りはじめた。血が足りない。|{a}は自分の手首に爪を立てかけて、やめた。欲しいのは、自分の血ではなかった。'),
    consentLove: L('{b}は何も言わずに襟元をくつろげ、首筋を差し出した。「……いいよ。{a}になら」――{a}は{b}を抱き寄せ、そっと牙を立てた。|{a}が言い出す前に、{b}は袖をまくって腕を差し出した。「我慢しないで」――{a}は{b}の手首に口づけるように、牙を沈めた。|{a}は{b}の耳元で「……ごめん。少しだけ」と囁いた。{b}は笑って{a}の頭を抱き寄せ、首筋に導いた。'),
    ask: L('{a}は{b}に、渇きのことを打ち明けた。「少しだけでいい。血を、分けてくれないか」|{a}は{b}の前で膝をついた。「頼みがある。……血を、少しだけ」'),
    yes: L('{b}は長いこと迷ってから、腕を差し出した。「……少しだけ、だから」――{a}は礼を言って、そっと牙を立てた。|{b}は青ざめながらも頷いた。{a}は痛くないように、ゆっくりと吸った。'),
    no: L('{b}は首を横に振って、後ずさった。|{b}は「無理」とだけ言って、{a}から距離を取った。'),
    gaze: L('{a}は{b}の目をまっすぐに見つめた。赤い瞳に射すくめられて、{b}の体から力が抜けていった。|{a}が{b}の顎に指をかけ、目を合わせた。{b}の瞳から、意思の色が消えた。'),
    hypno: L('{b}はうつろな目のまま、自分から首筋をさらした。{a}は牙を立て、ゆっくりと血を啜った。|「こっちへおいで」――{b}は言われるまま{a}の腕の中に収まり、首を傾けた。|{b}は{a}の命じるままに膝をつき、喉元を差し出した。'),
    avert: L('{b}はとっさに目を逸らした。{a}の赤い瞳の力は、届かなかった。|{a}の目が赤く光った瞬間、{b}は顔を背けた。「……その手には乗らない」'),
    fightWin: L('{b}は{a}を突き飛ばし、近くにあったものを振り回して逃げ出した。|{b}は{a}の腕に噛みつき返し、その隙に振りほどいて走り去った。'),
    fightLose: L('{a}は抵抗する{b}を壁に押しつけ、首筋に牙を突き立てた。{b}の悲鳴は、すぐに弱々しい呻きに変わった。|{a}は{b}を組み伏せた。もがく{b}の喉に、牙が深く沈んだ。'),
    after: L('{b}はふらつきながら、首筋の小さな二つの傷を押さえた。|{b}の顔色は、紙のように白くなっていた。|{b}はしばらく立ち上がれなかった。'),
    afterHypno: L('我に返った{b}は、何があったのか思い出せなかった。首筋の二つの傷だけが、熱を持っていた。|{b}が正気を取り戻したとき、{a}はもういなかった。'),
    noLock: L('{a}は、たった一人の血しか受けつけない体だった。けれど、その人はここにいない。|{a}は、決めた相手以外の血を吸うことはできなかった。'),
    starve: L('三日目の夜が明けても、{a}の渇きは癒えなかった。{a}の体は朝日の中で灰のように崩れ、風にさらわれていった。|渇きに耐えきれず、{a}は自分の喉をかきむしった。やがて{a}は、乾いた砂のように崩れ落ちた。――二度と、起き上がらなかった。'),
    weak: L('{a}は渇きでふらついていた。顔色は死人のようだった。|{a}は誰の首筋も見ないように、目を閉じてうずくまっていた。'),
    zombieNo: L('{a}は{b}に牙を立てかけて、顔をしかめて離れた。腐った血の臭いがした。')
  };
  function vampDue(A, p) { return p.spec === 'vampire' && p.vamp && A.nowH >= p.vamp.due; }
  /* 吸える相手：人間（ゾンビ・感染者・吸血鬼でない）・その場にいる */
  function donors(A, p) {
    return A.all.filter(function (q) { return q !== p && A.alive(q) && A.here(q) && near(A, p, q) && q.spec !== 'vampire' && !(A.zombie && A.zombie(q)); });
  }
  /* 吸血鬼の番。行動を使ったら true */
  SP.vampTurn = function (A, p) {
    if (!vampDue(A, p) || !A.alive(p) || p.mad) return false;
    var vp = p.vamp, over = A.nowH - vp.due;
    var lockP = p.lock == null ? null : p.lock < 0 ? 'absent' : A.all.filter(function (q) { return q.i === p.lock; })[0] || 'absent';
    var cand = donors(A, p);
    if (lockP) cand = lockP === 'absent' ? [] : cand.filter(function (q) { return q === lockP; });
    /* 吸える相手がいない環境：決めた相手が来ていない・二度と会えない・人間が誰も残っていない */
    var never = lockP === 'absent' || (lockP && (lockP.spNoRev || lockP.spGone || (!A.alive(lockP) && !lockP.spec) || lockP.out)) || !donors(A, p).length && !A.all.some(function (q) { return q !== p && q.spec !== 'vampire' && (A.alive(q) || (q.spec && !q.spGone)); });
    if (!cand.length) {
      if (never) {
        p.spNoRev = true;
        A.kill(p, '渇きで', (lockP ? fmt(pick(A, V.noLock), { a: p.name }) : '') + fmt(pick(A, V.starve), { a: p.name }));
        return true;
      }
      /* 吸える相手がそばにいないまま一日が過ぎると、弱っていく（死ぬのは、吸える相手がこの世界にいないときだけ） */
      if (vp.warn && over >= 24) { A.setHp(p, Math.max(1, A.hp(p) - 8)); A.addStress(p, 6); return false; }
      if (!vp.warn) { vp.warn = true; A.setHp(p, A.hp(p) - 10); A.say({ actors: [p], tag: '渇き', text: fmt(pick(A, V.thirst), { a: p.name }) + fmt(pick(A, V.weak), { a: p.name }), why: '吸血鬼：三日に一度、人の血を吸わなければならない' + (lockP ? '（決めた相手からしか吸えない）' : '') + '。吸えないと弱っていき、吸える相手がどこにもいなければ灰になる', mag: 20 }); return true; }
      return false;
    }
    /* 誰から吸うか：恋仲を最優先、次に好感度の高い人（好意が高いほど強く偏る。好意のない相手を襲うのは、ほかに誰もいないときくらい） */
    var lv = cand.filter(function (q) { return A.rel(p, q).love; });
    var b = wpick(A, lv.length ? lv : cand, function (q) { var w = A.rel(p, q).w; return Math.pow(Math.max(0.02, w + 0.25), 4); }) || cand[0];
    var rb = A.rel(b, p), t = fmt(pick(A, V.thirst), { a: p.name }), how = '', hp = 12 + Math.floor(A.rng() * 10), stress = 10, sex = null;
    var wary = (b.tr && (b.tr.caution || 0) > 0.62) || (b.tr && (b.tr.ac || 0) < 0.25 && (b.tr.cp || 0) > 0.6);
    if (rb.love && A.rng() < 0.95) { t += fmt(pick(A, V.consentLove), { a: p.name, b: b.name }); how = '同意（恋仲）'; stress = 0; }
    else {
      var asked = rb.w >= 0.3 && A.rng() < 0.7, yes = asked && A.rng() < 0.25 + rb.w * 0.55;
      if (asked) t += fmt(pick(A, V.ask), { a: p.name, b: b.name });
      if (yes) { t += fmt(pick(A, V.yes), { a: p.name, b: b.name }); how = '同意'; stress = 6; }
      else {
        if (asked) t += fmt(pick(A, V.no), { a: p.name, b: b.name });
        if (wary && A.rng() < 0.85) {
          t += fmt(pick(A, V.avert), { a: p.name, b: b.name });
          var str = (b.tr && ((b.tr.aggr || 0) * 0.5 + (b.tr.caution || 0) * 0.3)) || 0.3;
          if (A.rng() < 0.3 + str * 0.6) {
            A.addStress(b, 18);
            A.say({ actors: [p, b], tag: '吸血（失敗）', text: t + fmt(pick(A, V.fightWin), { a: p.name, b: b.name }), why: b.name + 'は警戒心が強く、目を逸らして催眠を逃れ、振りほどいた', mag: 22 });
            vp.due = A.nowH + 4;
            return true;
          }
          t += fmt(pick(A, V.fightLose), { a: p.name, b: b.name }); how = '力ずく'; stress = 22; hp += 6;
        } else {
          t += fmt(pick(A, V.gaze), { a: p.name, b: b.name }) + fmt(pick(A, V.hypno), { a: p.name, b: b.name }); how = '催眠'; stress = 8;
          b.hypno = true;
        }
      }
    }
    /* R18：無理やり体を重ねることもある（自分で攻めを選んだ人を受けにはしない） */
    if (A.r18 && SP.R18 && how !== '同意（恋仲）' && how !== '同意') {
      var Pz = HK.Pos;
      /* 同意のない体の関係は、内容のスイッチ「合意のない展開」が入のときだけ（content.js） */
      var forceOk = !HK.Content || HK.Content.on(A.env, 'force', A.scenId);
      if (forceOk && Pz && Pz.okSex(p, b) && !(HK.State && !(HK.State.r18ok(p) && HK.State.r18ok(b))) && !(HK.sexBlocked && HK.sexBlocked(p, b)) && A.rng() < (A.lewd || 0.4) * (how === '催眠' ? 1 : 0.7)) sex = SP.R18.text(A, p, b, how);
    } else if (A.r18 && SP.R18 && HK.Pos && HK.Pos.okSex(p, b) && !(HK.State && !(HK.State.r18ok(p) && HK.State.r18ok(b))) && !(HK.sexBlocked && HK.sexBlocked(p, b)) && A.rng() < (A.lewd || 0.4) * 0.5) sex = SP.R18.text(A, p, b, how);
    if (sex) t += sex;
    t += fmt(pick(A, how === '催眠' ? V.afterHypno : V.after), { a: p.name, b: b.name });
    A.setHp(b, A.hp(b) - hp); A.addStress(b, stress);
    if (A.relMod) A.relMod(b, p, how);
    vp.due = A.nowH + 72; vp.fed++; vp.warn = false; b.hypno = false;
    A.setHp(p, A.full(p));
    A.say({ actors: [p, b], tag: '吸血', text: t, why: '吸血鬼：三日に一度、人の血が要る（' + how + '）' + (lockP ? '・決めた相手からしか吸えない' : '') + '／' + b.name + 'の体力 -' + hp, mag: sex ? 34 : 26, key: vp.fed === 1 ? p.name + 'が' + b.name + 'の血を吸った' : '' });
    return true;
  };
  /* 吸血鬼が渇いて動き出すところか（箱庭側で、ほかの行動より先に呼ぶ） */
  SP.thirsty = function (A, p) { return vampDue(A, p); };
})();
