/* 箱庭シミュレーター: 運命の揺らぎが高いときの「らしくない」行動と、それを見た相手の反応（全箱庭の共通。族のかたまり pack-rel。両方のビルドに同じファイル）
   利用者の指示（2026-10-28）：運命のゆらぎが高い時には、関係性のある対象に「らしくない」行動が増えてほしい（嫉妬しない人が嫉妬する、強引な人が急に照れる…）。
   見た相手の反応も、普段と違う相手への動揺・ときめき・惹かれ・蠱惑的に思う（性欲が強い人はそそられる）などにし、意外な関係に着地させる。
   設計：docs/reports/2026-10-28/unlike-design.md
   ■ HK.Unlike（U）
     ・U.FLIPS：反転の型12種（気質・態度から「本来はしない」ものを選ぶ。fit が閾値以上の型だけ）。文は型ごとの地の文＋相手への一言（3本）＋態度9種の「らしさの崩れ」の一文
     ・U.REACT：見た相手の反応8種（動揺・ときめき・惹かれ・蠱惑・心配・面白がる・警戒、R18版だけ「そそられる」＝unlike-r18.js）。相手の気質・態度・性欲・二人の関係で選ぶ
     ・起きる回数：環境値「運命の揺らぎ」chaos（0〜1）から、区切りごとの確率 U.pStep(x, 区切りの数)。0 なら起きない、既定の 40 で1回の箱庭に1〜2回、100 でほぼ毎区切り。
       区切りごとの当たり外れは種と区切りの番号から作る別の乱数（本筋の乱数を使わない）。同じ人の同じ型は回の中で一度だけ、一人あたり2回（揺らぎ 70 以上は3回）まで
     ・相手：同じ場にいて、関係の設定があるか、惹かれ・好意・緊張が動いている人（揺らぎ 70 以上なら同じ場にいるだけでよい）。
       死んだ人・場にいない人・監禁中の人（HK.State.here）は出ない。避けている人（HK.Avoid.of）は迫る側にならない（その組では起きない）。無関心・恐怖の組でも起きない
     ・恋愛に進めるのは、恋愛対象が両方向に合い（HK.canLove）、恋愛・R18にしない組でなく、恋愛：なしの家族でなく、恋愛の出来事を起こせる組（ctx.romanceOk）だけ。
       それ以外の組では、惹かれは上げず、動揺（緊張）と、R18版で体の関係が許される組（HK.State.pairSex・HK.sexBlocked）なら体の熱（気分の火照り）に流す
   ■ エンジン型（合コン・出られない部屋・クラスメイト・無人島・ゾンビの街・オメガバース）の共通の出来事（HK.COMMON）
     ・unl_flip：らしくない行動と相手の反応（その区切りの当たりが出ていて、条件を満たす組。結果に odd の印＝画面の「らしくない」）
     ・unl_after：当人の後日談（恥じる／開き直る／覚えていない。覚えていないは揺らぎ 70 以上）
     ・unl_spark：らしくない一面が忘れられず、反応した側から近づく（ときめき・惹かれ・蠱惑のあと。恋愛の流れ＝告白・恋人へ）
     ・unl_heat（R18版だけ。unlike-r18.js）：そそられた側から誘い、体の関係になる夜（HK.Pos.okSex・HK.State.pairSex を通る組。セフレの流れへ）
   ■ 物語型（邪神村・吹雪の館・宇宙船）の入口：U.story(S, id, live, {n: 一回の箱庭でこの入口を呼ぶ見込みの回数})
       → null か { a, b, text, why, d（S.relD に足す値）, tag }。呼ぶ側が HK.Story.sayB で記録し、関係の値に d を足す。後日談も同じ入口から出る
   台詞は3本「くだけた常体｜硬い常体｜敬語」（一人称は「私」、二人称は「あなた」）。登場人物はすべて成人として扱う */
/* @labels
   unl_flip=らしくない行動と相手の動揺・ときめき
   unl_after=らしくない行動を振り返る後日談
   unl_spark=らしくない一面が忘れられず近づく
*/
(function () {
  'use strict';
  var HK = window.HK;
  if (!HK || !HK.COMMON || !HK.addTo) return;
  var U = HK.Unlike = HK.Unlike || {};
  function L(s) { return s.split('|'); }
  var PK = ['proud', 'stern', 'tsun', 'gentle', 'devoted', 'cool', 'free', 'shy', 'polite'];
  function per(c) {
    var k = c && c.persona;
    if (PK.indexOf(k) >= 0) return k;
    var b = c && c.tone && HK.toneOpt ? HK.toneOpt(c.tone, 'base') : null;
    if (PK.indexOf(b) >= 0) return b;
    k = c && HK.personaOf ? HK.personaOf(c) : 'gentle';
    return PK.indexOf(k) >= 0 ? k : 'gentle';
  }
  function trOf(c) { return (c && c.tr) || (c && c.eg && HK.traits ? HK.traits(c.eg) : HK.traits({})); }
  function isCtx(x) { return !!(x && x.R && x.pair && x.chars); }
  function here(c) { return !!c && (HK.State && HK.State.here ? HK.State.here(c) : c.alive !== false); }
  function pc(v) { return Math.round((v || 0) * 100); }
  /* 種と番号から作る 0〜1（本筋の乱数を使わない） */
  function h01() {
    var h = 2166136261;
    for (var i = 0; i < arguments.length; i++) { h ^= (arguments[i] | 0) >>> 0; h = Math.imul(h, 16777619) >>> 0; h ^= h >>> 13; }
    h = Math.imul(h ^ (h >>> 16), 2246822507) >>> 0; h = Math.imul(h ^ (h >>> 13), 3266489909) >>> 0; h ^= h >>> 16;
    return (h >>> 0) / 4294967296;
  }
  function fill(t, m) { return String(t).replace(/\{(a|b|u|x|p|q)\}/g, function (s, k) { var v = m[k]; return v == null ? s : typeof v === 'string' ? v : v.name; }); }
  function pickOf(X, arr) {
    if (!arr || !arr.length) return '';
    if (isCtx(X)) return X.pick(arr);
    if (HK.Story && HK.Story.pick && X && X.recent) return HK.Story.pick(X, arr);
    return arr[Math.floor(X.rng() * arr.length)];
  }

  /* ================= 起きる回数 ================= */
  /* 区切りの当たりの見込みの回数（揺らぎ 0.4 で約2.4回。実際に起きるのは、相手と型がそろう分だけなので約1〜2回。2乗で増え、1.0 ではほぼ毎区切りが当たり） */
  U.expect = function (x) { return x > 0 ? 2.4 * Math.pow(x / 0.4, 2) : 0; };
  U.pStep = function (x, n) { return Math.min(0.9, U.expect(x) / Math.max(1, n || 8)); };
  U.cap = function (x) { return x >= 0.7 ? 3 : 2; };
  U.TH = function (x) { return x >= 0.8 ? 0.5 : 0.58; };
  function chaosOf(X) {
    if (isCtx(X)) return X.chaos || 0;
    var v = X && X.env && X.env.chaos;
    return v == null || v === '' ? 0.4 : +v / 100;
  }
  U.chaosOf = chaosOf;
  /* 回ごとの記録（エンジン型 ctx._unl、物語型 S._unl）。log：起きた組（点検・計測用） */
  function st(X) {
    if (X._unl) return X._unl;
    var s = X._unl = { used: {}, cnt: {}, log: [], tokAt: -1, tok: false, done: false, calls: 0, n: 0 };
    if (isCtx(X)) {
      s.salt = (X.seed | 0) ^ 0x5bd1e995;
      try { s.nSteps = X.scen && X.scen.steps ? X.scen.steps(X.env).length : 8; } catch (e) { s.nSteps = 8; }
    } else s.salt = Math.floor(X.rng() * 1e9);
    return s;
  }
  U.state = st;

  /* ================= 組の判定 ================= */
  function tiesOf(X, a, b) {
    if (isCtx(X)) return HK.Ties && X.tiesAll ? HK.Ties.all(X, a, b) : [];
    return (X.ties || []).filter(function (t) { return t && ((t.a === a.i && t.b === b.i) || (t.a === b.i && t.b === a.i)); });
  }
  function kinNo(X, a, b) {
    if (isCtx(X)) return !!X.pair(a, b).kin;
    return tiesOf(X, a, b).some(function (t) { return HK.tieNoLove && HK.tieNoLove(t); });
  }
  /* 起こさない組：無関心・恐怖、a が b を避けている */
  function blocked(X, a, b) {
    if (!a || !b || a === b || !here(a) || !here(b)) return true;
    if (a.flags && a.flags.caged != null) return true;
    if (b.flags && b.flags.caged != null) return true;
    if (tiesOf(X, a, b).some(function (t) { return t.type === 'apathy' || t.type === 'fear'; })) return true;
    if (HK.Avoid && HK.Avoid.of && HK.Avoid.of(X, a, b)) return true;
    return false;
  }
  /* 関係の濃さ：3＝関係の設定がある、2＝惹かれ・好意・緊張が動いている、1＝同じ場にいるだけ */
  function related(X, a, b) {
    if (tiesOf(X, a, b).length) return 3;
    if (isCtx(X)) {
      var ab = X.R(a, b), ba = X.R(b, a);
      return ab.att > 12 || ba.att > 12 || Math.abs(ab.aff) > 20 || Math.abs(ba.aff) > 20 || ab.ten > 20 ? 2 : 1;
    }
    var k = a.i < b.i ? a.i + '-' + b.i : b.i + '-' + a.i, d = X.relD && X.relD[k];
    return d != null && Math.abs(d) >= 0.12 ? 2 : 1;
  }
  U.related = related;
  /* 恋愛に進めてよい組（両方向）。エンジン型は ctx.romanceOk（恋愛の起こりやすさ・一途・悲しみ・別れた直後なども見る） */
  function romOK(X, a, b) {
    if (!a || !b || a === b || !HK.canLove || !HK.canLove(a, b) || !HK.canLove(b, a)) return false;
    if ((HK.ngPair && HK.ngPair(a, b)) || (HK.noLovePair && HK.noLovePair(a, b)) || kinNo(X, a, b)) return false;
    if (HK.Poly && HK.Poly.faithNG && (HK.Poly.faithNG(a, b) || HK.Poly.faithNG(b, a))) return false;
    if (HK.Avoid && HK.Avoid.of && (HK.Avoid.of(X, a, b) || HK.Avoid.of(X, b, a))) return false;
    if (isCtx(X)) return X.romanceOk([a, b]) && X.romanceOk([b, a]);
    return !(X.env && X.env.romance != null && +X.env.romance === 0);
  }
  U.romOK = romOK;
  /* 体の熱に流してよい組（R18版で unlike-r18.js があるときだけ。全年齢版・全年齢モードでは偽） */
  function sexOK(X, a, b) {
    if (HK.SAFE_ON || !U.R18 || !HK.State || !HK.State.pairSex) return false;
    if (!HK.State.pairSex(a, b) || (HK.sexBlocked && HK.sexBlocked(a, b))) return false;
    if (kinNo(X, a, b) || (HK.noLovePair && HK.noLovePair(a, b))) return false;
    return !(HK.Pos && HK.Pos.okSex && !HK.Pos.okSex(a, b));
  }
  U.sexOK = sexOK;

  /* ================= 反転の型 ================= */
  /* fit(t, p)：その人がふだん「その逆」である度合い（0〜1）。rom：恋愛に進められる組だけ。neg：見た相手が心配しやすい型。lure：蠱惑的に映りやすい型 */
  var F = U.FLIPS = [
    { k: 'jeal', name: '嫉妬しない人の嫉妬', noun: 'やきもち', usual: L('ふだんは人が誰と親しくしても気にしない|やきもちとは縁がなさそうな'), lure: 1,
      fit: function (t, p) { return 1 - t.jealous + (p === 'free' || p === 'gentle' || p === 'cool' ? 0.08 : 0); }, why: function (t) { return '嫉妬・執着 ' + pc(t.jealous); },
      t: L('{u}{a}が、{b}がほかのことに夢中になっているのを見て、露骨に黙り込んだ。{a}「……そんなに、そっちが楽しいんだ｜……そんなに、そっちが楽しいのか｜……そんなに、そちらが楽しいんですね」――言ってから、{a}自身がいちばん驚いた顔をしていた。|' +
        '{u}{a}が、{b}の袖をつかんで離さなかった。{a}「私以外とばっかり、楽しそうにしないで｜私以外とばかり、楽しそうにするな｜私以外とばかり、楽しそうにしないでください」――冗談めかすつもりだった声は、少しも冗談になっていなかった。|' +
        '{b}がほかの話題で笑っただけで、{u}{a}の眉がぴくりと動いた。{a}「別に。……楽しそうで、よかったね｜別に。……楽しそうで、何よりだ｜別に。……楽しそうで、何よりです」――棘のある言い方に、{a}は自分で戸惑った。') },
    { k: 'blush', name: '強引な人の照れ', noun: '照れた顔', usual: L('いつもは押しが強く、人の都合などお構いなしの|強引に人を引っぱっていくのが常の'), lure: 1,
      fit: function (t, p) { return Math.max(t.aggr, t.lead) + (p === 'proud' || p === 'stern' ? 0.12 : 0); }, why: function (t) { return '攻撃性 ' + pc(t.aggr) + '・主導性 ' + pc(t.lead); },
      t: L('{u}{a}が、{b}と目が合ったとたん、耳まで赤くして視線を逸らした。{a}「……見ないで。今、顔が変だから｜……見るな。今、顔がおかしい｜……見ないでください。今、顔が変なので」|' +
        '{b}が何気なく礼を言うと、{u}{a}は言葉に詰まった。{a}「べ、別に、大したことしてない｜べ、別に、大したことはしていない｜べ、別に、大したことはしていません」――いつもなら胸を張るところで、{a}は口元を手で隠した。|' +
        '{u}{a}は、{b}の手が触れた瞬間、跳ねるように身を引いた。{a}「ご、ごめん。急だったから｜す、すまない。急だったから｜ご、ごめんなさい。急だったので」――それきり、{a}は{b}の顔をまともに見られなかった。') },
    { k: 'panic', name: '冷静な人の取り乱し', noun: '取り乱した姿', usual: L('どんなときも顔色ひとつ変えない|何が起きても淡々としている'), neg: 1,
      fit: function (t, p) { return Math.max(t.cold, t.a) + (p === 'cool' || p === 'stern' ? 0.12 : 0); }, why: function (t) { return 'ドライさ ' + pc(t.cold) + '・A ' + pc(t.a); },
      t: L('{b}が指先を少し切っただけなのに、{u}{a}は血相を変えて駆け寄った。{a}「大丈夫！？　見せて、早く｜大丈夫か！？　見せろ、早く｜大丈夫ですか！？　見せてください、早く」――手当ての手つきまで震えていて、{b}のほうが{a}を落ち着かせる羽目になった。|' +
        '{b}の何気ない一言に、{u}{a}がはっきりとうろたえた。{a}「え、待って、今のどういう意味？｜待て、今のはどういう意味だ？｜え、待ってください、今のはどういう意味ですか？」――手にしていたものを取り落としたことにも、{a}は気づいていなかった。|' +
        '{u}{a}が、{b}の前でだけ言葉をもつれさせた。考えをまとめようとするほど、話はあちこちに飛んだ。{a}「違う、そうじゃなくて……ああ、もう、何を言ってるんだろう｜違う、そうではなく……ああ、もう、何を言っているんだ｜違うんです、そうではなくて……ああ、もう、何を言っているんでしょう」') },
    { k: 'amae', name: '素直でない人の甘え', noun: '甘えた声', usual: L('いつもは本音を言わずに強がってばかりの|素直に頼るということを知らない'), lure: 1,
      fit: function (t, p) { return 1 - t.honesty + (p === 'tsun' || p === 'proud' ? 0.12 : 0); }, why: function (t) { return '本音の出やすさ ' + pc(t.honesty); },
      t: L('{u}{a}が、{b}の肩にこつんと額を預けた。{a}「……少しだけ、こうしてていい？｜……少しだけ、こうしていていいか｜……少しだけ、こうしていてもいいですか」――{b}が驚いて見下ろしても、{a}は離れなかった。|' +
        '{u}{a}が、{b}にだけ聞こえる声で言った。{a}「今日、ちょっと疲れた。……褒めて｜今日は、少し疲れた。……褒めてくれ｜今日は、少し疲れました。……褒めてください」――あまりに素直な言い方に、{b}は聞き間違いかと思った。|' +
        '{u}{a}が、{b}の服の裾をそっとつまんだ。{a}「あのさ。……そばにいてくれて、ありがとう｜あのな。……そばにいてくれて、感謝している｜あの。……そばにいてくれて、ありがとうございます」――言い終えた{a}は、自分の言葉に自分で目を丸くしていた。') },
    { k: 'rude', name: '丁寧な人の毒舌', noun: '荒っぽい物言い', usual: L('いつも誰にでも物腰のやわらかい|人を悪く言うところなど見たことのない'), neg: 1, lure: 1,
      fit: function (t, p) { return (p === 'polite' || p === 'devoted' || p === 'gentle' ? 0.55 + t.np * 0.3 : t.np * 0.45 + t.ac * 0.35); }, why: function (t) { return 'NP ' + pc(t.np) + '・AC ' + pc(t.ac); },
      t: L('{u}{a}が、{b}の言葉をばっさりと切り捨てた。{a}「は？　それ、本気で言ってる？｜は？　それは本気で言っているのか？｜は？　それ、本気でおっしゃっているんですか？」――空気が一瞬で凍りついた。いちばん驚いていたのは、言った本人だった。|' +
        '{u}{a}が、{b}に向かって遠慮のない悪態をついた。{a}「ほんと、要領悪いよね｜まったく、要領が悪いな｜本当に、要領が悪いですね」――{b}は思わず{a}の顔を二度見した。|' +
        '{b}の手際の悪さに、{u}{a}が舌打ちをした。{a}「いいから貸して。見てられない｜いいから貸せ。見ていられない｜いいから貸してください。見ていられません」――乱暴に言い捨ててから、{a}ははっとして口を押さえた。') },
    { k: 'ichizu', name: '奔放な人の一途', noun: 'ひたむきな目', usual: L('いつもは気の向くまま、誰とでも軽やかに付き合う|ひとつところに落ち着いたためしのない'), rom: 1, lure: 1,
      fit: function (t, p) { return Math.max(t.impulse, t.fc) + (p === 'free' ? 0.12 : 0) - 0.04; }, why: function (t) { return '衝動性 ' + pc(t.impulse) + '・FC ' + pc(t.fc); },
      t: L('{u}{a}が、なぜか{b}のそばから一歩も離れなかった。{a}「今は、あなたといる。ほかはいい｜＝｜今は、あなたといます。ほかはいいです」――ほかの誘いを全部断ってまで、{a}は{b}の隣を選んだ。|' +
        '{u}{a}が、真顔で{b}に言った。{a}「ほかの人じゃ、だめなんだ。あなたじゃないと｜ほかの者では、だめだ。あなたでなければ｜ほかの人では、だめなんです。あなたでないと」――いつもの軽口とは、声の温度がまるで違った。|' +
        '{u}{a}が、{b}のことを何度も尋ねて確かめていた。好きなもの、苦手なもの、昔の話。{a}「全部、知っておきたいの｜全部、知っておきたい｜全部、知っておきたいんです」') },
    { k: 'bold', name: '臆病な人の大胆', noun: '大胆なひと言', usual: L('いつもは人の顔色をうかがって一歩引いている|自分から前に出ることなどめったにない'), rom: 1, lure: 1,
      fit: function (t, p) { return t.caution + (p === 'shy' || p === 'devoted' ? 0.12 : 0); }, why: function (t) { return '慎重さ ' + pc(t.caution); },
      t: L('{u}{a}が、まっすぐ{b}の前に立ち、目を逸らさずに言った。{a}「あなたと、もっと話したい。今から｜あなたと、もっと話したい。今からだ｜あなたと、もっと話したいです。今から」――{b}が返事をするより先に、{a}は{b}の手を取っていた。|' +
        '{u}{a}が、{b}との距離を自分から詰めた。肩が触れるほど近くで、{a}は小さく、けれどはっきりと言った。{a}「逃げないで。……今日は、私から行くから｜逃げるな。……今日は、私から行く｜逃げないでください。……今日は、私から行きますから」|' +
        '{u}{a}が、{b}の耳元でささやいた。{a}「ねえ、少しだけ、二人で話そう｜なあ、少しだけ、二人で話そう｜あの、少しだけ、二人でお話ししませんか」――言った本人の膝は笑っていたが、目だけは本気だった。') },
    { k: 'forget', name: '几帳面な人の物忘れ', noun: 'うっかりした顔', usual: L('いつもは何事もきっちり守る|約束の時間に遅れたことすらない'), neg: 1,
      fit: function (t, p) { return t.a * 0.55 + t.cp * 0.45 + (p === 'stern' || p === 'cool' ? 0.1 : 0); }, why: function (t) { return 'A ' + pc(t.a) + '・CP ' + pc(t.cp); },
      t: L('{u}{a}が、{b}と交わした約束をすっかり忘れていた。指摘されて、{a}は目を見開いた。{a}「うそ、ほんとに？　ごめん、全然覚えてない｜まさか、本当か？　すまない、まったく覚えていない｜うそ、本当ですか？　ごめんなさい、全然覚えていません」|' +
        '{u}{a}が、{b}に頼まれていたことを、きれいに忘れていた。{a}「……あれ、何か頼まれてたっけ｜……ん、何か頼まれていたか｜……あれ、何か頼まれていましたっけ」――{b}がぽかんとしているのを見て、{a}はようやく事態に気づいた。|' +
        '{u}{a}が、どこか上の空だった。{b}の話に相づちを打ちながら、同じことを二度も聞き返した。{a}「ごめん、もう一回いい？　……あれ、さっきも聞いた？｜すまない、もう一度いいか？　……ん、さっきも聞いたか？｜ごめんなさい、もう一度いいですか？　……あれ、さっきも聞きましたか？」') },
    { k: 'chatty', name: '無口な人のおしゃべり', noun: '楽しそうな饒舌', usual: L('ふだんは必要なことしか口にしない|いるのかいないのか分からないほど静かな'), lure: 1,
      fit: function (t, p) { return 1 - t.warmth + (p === 'cool' || p === 'shy' ? 0.08 : 0); }, why: function (t) { return '人懐こさ ' + pc(t.warmth); },
      t: L('{u}{a}が、{b}を相手に、堰を切ったように話し続けた。子どものころの話、好きな食べ物の話、どうでもいい夢の話。{a}「それでね、そのあとがまた面白くて｜それで、そのあとがまた面白くてな｜それで、そのあとがまた面白かったんです」――{b}が相づちを打つたびに、{a}の話は止まらなくなった。|' +
        '{u}{a}が、{b}の隣に座るなり、自分から話しかけた。{a}「ねえ、聞いて。ずっと話したいことがあったの｜聞いてくれ。ずっと話したいことがあった｜あの、聞いてください。ずっと話したいことがあったんです」――{b}は、{a}の声をこんなに長く聞くのは初めてだと気づいた。|' +
        '{u}{a}が、{b}の何気ない質問に、驚くほど長く答えた。笑ったり、身ぶりを交えたり、ときどき自分で照れたりしながら。{b}は、{a}がこんな顔で話す人だったことを、初めて知った。') },
    { k: 'cold', name: '面倒見のいい人の突き放し', noun: '突き放すような横顔', usual: L('いつもは誰の世話でも焼かずにいられない|困っている人を見ると放っておけない'), neg: 1,
      fit: function (t, p) { return t.np + (p === 'gentle' || p === 'devoted' ? 0.1 : 0); }, why: function (t) { return 'NP ' + pc(t.np); },
      t: L('{u}{a}が、{b}の頼みを素っ気なく断った。{a}「自分でやって。私は知らない｜自分でやれ。私は知らない｜ご自分でどうぞ。私は知りません」――突き放された{b}より先に、{a}のほうが傷ついた顔をしていた。|' +
        '{b}が困っているのに、{u}{a}は手を貸さなかった。{a}「たまには、甘えないで｜たまには、甘えるな｜たまには、甘えないでください」――背を向けた{a}の肩が、少しだけ震えていた。|' +
        '{u}{a}が、{b}の差し出したものを受け取らずに言った。{a}「放っておいて。今は、優しくできない｜放っておいてくれ。今は、優しくできない｜放っておいてください。今は、優しくできません」') },
    { k: 'wagama', name: '献身的な人のわがまま', noun: 'わがままな声', usual: L('いつも自分のことは後回しにして尽くす|人の望みばかり先に叶えようとする'), lure: 1,
      fit: function (t, p) { return t.np * 0.5 + t.ac * 0.5 + (p === 'devoted' || p === 'polite' ? 0.12 : 0); }, why: function (t) { return 'NP ' + pc(t.np) + '・AC ' + pc(t.ac); },
      t: L('{u}{a}が、{b}に向かって唇を尖らせた。{a}「今は、私の言うこと聞いて。全部｜今は、私の言うことを聞け。全部だ｜今は、私の言うことを聞いてください。全部です」――{b}は、{a}が自分の望みを口にするのを初めて聞いた。|' +
        '{u}{a}が、{b}の腕を引いて駄々をこねた。{a}「やだ。もう少しここにいて｜嫌だ。もう少しここにいろ｜嫌です。もう少しここにいてください」――言ってしまってから、{a}は自分の声の幼さに頬を染めた。|' +
        '{u}{a}が、{b}に取っておいた分の食べ物を、黙って自分で食べてしまった。{a}「……たまには、いいでしょ｜……たまには、いいだろう｜……たまには、いいでしょう」――開き直ったような顔の裏で、{a}はひどく落ち着かなかった。') },
    { k: 'weak', name: '強気な人の弱音', noun: '弱音', usual: L('いつも強気で、弱みなど見せたことのない|誰に対しても一歩も引かない'), neg: 1, lure: 1,
      fit: function (t, p) { return t.cp * 0.6 + (1 - t.ac) * 0.4 + (p === 'proud' || p === 'tsun' ? 0.12 : 0); }, why: function (t) { return 'CP ' + pc(t.cp) + '・AC ' + pc(t.ac); },
      t: L('{u}{a}が、{b}の前でぽつりとこぼした。{a}「……正直、ちょっと怖い｜……正直、少し怖い｜……正直、少し怖いです」――それだけ言うと、{a}はうつむいて黙り込んだ。|' +
        '{u}{a}が、{b}にだけ弱音を吐いた。{a}「私、ほんとはそんなに強くないんだ｜私は、本当はそれほど強くない｜私、本当はそんなに強くないんです」――{b}は、{a}がこんなに小さな声で話すのを初めて聞いた。|' +
        '{u}{a}が、{b}の隣で長いため息をついた。{a}「疲れた。……今だけ、強がるのやめていい？｜疲れた。……今だけ、強がるのをやめていいか？｜疲れました。……今だけ、強がるのをやめてもいいですか？」') }
  ];
  var FK = {}; F.forEach(function (f) { FK[f.k] = f; });
  U.flip = function (k) { return FK[k] || null; };
  /* 態度9種：らしさの崩れ（{a}＝らしくないことをした人） */
  var GAP = U.GAP = {
    proud: L('いつもの不遜な物言いは、すっかり鳴りを潜めていた。|人を見下ろすような{a}の目つきが、このときばかりは揺れていた。'),
    stern: L('背筋を伸ばして構える{a}の姿は、どこにも見当たらなかった。|規律を何より重んじる{a}の顔から、いつもの厳しさが抜け落ちていた。'),
    tsun: L('憎まれ口ひとつ添えないあたり、どう見ても{a}らしくなかった。|いつもの意地っ張りな言い訳は、最後まで出てこなかった。'),
    gentle: L('おっとりと受け流すいつもの{a}とは、まるで別人だった。|{a}の穏やかな笑みは、このときばかりはどこかに消えていた。'),
    devoted: L('人のために我慢するのが当たり前だった{a}にしては、珍しいことだった。|健気に笑ってみせるいつもの{a}は、そこにいなかった。'),
    cool: L('理屈で物事を片づける{a}が、自分の気持ちの名前も分からないでいた。|冷静さを失わないはずの{a}の目が、珍しく泳いでいた。'),
    free: L('いつも笑い飛ばして終わらせる{a}が、このときは笑わなかった。|軽やかなはずの{a}の声が、妙に重たく響いた。'),
    shy: L('いつも誰かの陰に隠れている{a}とは、まるで違って見えた。|おどおどと周りを気にするいつもの{a}は、このときだけいなかった。'),
    polite: L('誰にでも丁寧な{a}の言葉遣いが、ほんの少し崩れていた。|礼儀正しい{a}が、このときばかりは取り繕うのを忘れていた。')
  };

  /* ================= 見た相手の反応 ================= */
  /* {a}＝らしくないことをした人、{b}＝見た相手。rom：恋愛に進める組だけ。pos：態度の一文を「心が動いた」側から選ぶ */
  var REACT = U.REACT = {
    dousa: { name: '動揺した', pos: 1, t: L('{b}は返す言葉を見つけられなかった。見たことのない{a}の顔が、頭から離れない。{b}「……ど、どうしたの、急に｜……ど、どうした、急に｜……ど、どうしたんですか、急に」|' +
      '{b}の心臓が、妙な跳ね方をした。{b}は何でもないふりをしようとして、手にしていたものを落としかけた。|' +
      '{b}はしばらく固まっていた。いつもの{a}なら、こんなことはしない。そのことが、思った以上に{b}を揺さぶった。') },
    toki: { name: 'ときめいた', rom: 1, pos: 1, t: L('{b}の胸が、とくんと鳴った。こんな{a}もいるのだと知っただけで、目の前の景色が少し違って見えた。{b}「……そういうところ、ずるい｜……そういうところは、ずるいぞ｜……そういうところ、ずるいです」|' +
      '{b}は思わず、{a}から目を逸らした。頬が熱い。今の{a}を、もう少し見ていたいと思ってしまった。|' +
      '{b}は口元がゆるむのを止められなかった。{b}「……今の、ちょっとかわいかった｜……今のは、少し可愛かった｜……今の、ちょっと可愛かったです」――言われた{a}が真っ赤になるのを、{b}は見逃さなかった。') },
    hikare: { name: '惹かれた', rom: 1, pos: 1, t: L('{b}はそれからしばらく、{a}のことばかり考えていた。いつもの印象と、さっきの姿。その落差が、どうしても頭から離れなかった。|' +
      '{b}は、自分の中で何かが音を立てて変わるのを感じた。これまで{a}をどう見ていたのか、もう思い出せなかった。{b}「あなたって、そんな顔もするんだ｜あなたは、そんな顔もするのか｜あなたって、そんな顔もなさるんですね」|' +
      '{b}は{a}から目が離せなくなっていた。よく知っているつもりだった相手が、急に知らない人のように見えた。それが、少しも嫌ではなかった。') },
    kowaku: { name: '蠱惑的に感じた', rom: 1, pos: 1, t: L('{b}は、ぞくりとするものを感じた。いつもと違う{a}には、目を逸らさせない妙な引力があった。{b}「……危ない人だね、あなたは｜……危ない人だな、あなたは｜……危ない方ですね、あなたは」|' +
      '{b}の視線が、{a}の口元で止まった。ふだんの{a}が隠していたものを、うっかり覗いてしまった気がした。それはひどく甘い毒のようだった。|' +
      '{b}は小さく息をのんだ。崩れた{a}は、整っているときよりずっと危うくて、ずっと目を引いた。もっと崩してみたい――そんな考えが浮かんで、{b}は慌てて打ち消した。') },
    shinpai: { name: '心配した', t: L('{b}は眉を寄せて、{a}の顔をのぞき込んだ。{b}「大丈夫？　何かあった？｜大丈夫か？　何かあったのか？｜大丈夫ですか？　何かあったんですか？」――{a}は答えられず、{b}はそのまま隣にいることにした。|' +
      '{b}は、{a}らしくないことにすぐ気づいた。何も聞かずに隣に腰を下ろし、{a}が落ち着くまで黙って待った。|' +
      '{b}は{a}の手をそっと取った。{b}「無理しないで。……話したくなったら、聞くから｜無理はするな。……話したくなったら、聞く｜無理しないでください。……話したくなったら、聞きますから」') },
    omoshiro: { name: '面白がった', t: L('{b}は堪えきれずに吹き出した。{b}「何それ、あなたらしくない！｜何だそれは、あなたらしくないな｜何ですか、それ。あなたらしくないですね」――笑われた{a}は、むっとしたような、ほっとしたような顔をした。|' +
      '{b}はにやりと笑って、{a}の顔をしげしげと眺めた。{b}「へえ。珍しいもの見ちゃった｜ほう。珍しいものを見た｜へえ。珍しいものを見てしまいました」|' +
      '{b}は面白がって、わざと{a}をつついた。{b}「もう一回やって。今の、もう一回｜もう一度やってくれ。今のを、もう一度｜もう一回やってください。今の、もう一回」――{a}は「＠{a}＠やらない｜＝｜やりません」とそっぽを向いた。') },
    keikai: { name: '警戒した', t: L('{b}は一歩、身を引いた。{b}「……何を企んでるの｜……何を企んでいる｜……何を企んでいらっしゃるんですか」――いつもと違う{a}を、{b}は素直に受け取れなかった。|' +
      '{b}は笑顔を作りながら、内心で身構えていた。らしくない{a}の振る舞いの裏に、何かあるのではないか。疑いは、そう簡単には消えなかった。|' +
      '{b}は{a}の顔をじっと見つめ、目を細めた。{b}「どういう風の吹き回し？｜どういう風の吹き回しだ？｜どういう風の吹き回しですか？」――答えを聞いても、{b}の警戒は解けなかった。') }
  };
  /* 態度9種：見た相手（{b}）の様子。pos＝心が動いた（動揺・ときめき・惹かれ・蠱惑・そそられ）、calm＝落ち着いて受け止めた（面白がる・警戒。心配のあとには足さない） */
  var TAIL = U.TAIL = {
    proud: { pos: L('{b}は鼻を鳴らしてみせたが、耳の先が赤かった。|{b}は強気な顔を取り繕ったまま、{a}をちらりと盗み見た。'), calm: L('{b}は腕を組んで、{a}を値踏みするように眺めた。|{b}は顎を上げたまま、{a}の出方を待った。') },
    stern: { pos: L('{b}は咳払いをひとつして、乱れた心を立て直そうとした。うまくはいかなかった。|{b}は唇を引き結んだが、目元の厳しさが、いつもより少しゆるんでいた。'), calm: L('{b}は黙って{a}を見守った。必要なら、すぐに手を貸すつもりだった。|{b}は眉ひとつ動かさず、しかし{a}から目を離さなかった。') },
    tsun: { pos: L('{b}は何か言い返そうとして、続きを飲み込んだ。|{b}はそっぽを向いた。けれど、{a}のいる方だけは、どうしても意識してしまっていた。'), calm: L('{b}「別に、気にしてないけど｜別に、気にしてはいない｜別に、気にしてはいませんけど」――そう言いながら、{b}は何度も{a}のほうを振り返った。|{b}はぶっきらぼうに目を逸らしたが、気配だけはずっと{a}に向けていた。') },
    gentle: { pos: L('{b}はふわりと笑った。その笑みの奥で、胸がいつもより速く鳴っていた。|{b}はおっとりと首をかしげたが、頬にはうっすら赤みが差していた。'), calm: L('{b}は穏やかに微笑んで、{a}の言葉の続きを待った。|{b}はのんびりと頷いた。驚いてはいたが、慌てはしなかった。') },
    devoted: { pos: L('{b}は胸の前で手をぎゅっと握りしめた。{a}のこの顔を、ずっと覚えていたいと思った。|{b}は小さく頷いて、{a}の隣に一歩だけ近づいた。'), calm: L('{b}は{a}の様子をうかがいながら、そっと寄り添った。|{b}は自分にできることを探して、{a}のそばを離れなかった。') },
    cool: { pos: L('{b}は表情を変えなかった。ただ、{a}を見る時間が、いつもより少し長かった。|{b}は自分の動揺を分析しようとして、すぐに諦めた。'), calm: L('{b}は冷静に{a}の様子を観察していた。原因を探るように。|{b}は短く息をついて、{a}の変化を頭の中に書き留めた。') },
    free: { pos: L('{b}は「やば」と小さく呟いて、自分の頬をぱちんと叩いた。|{b}は落ち着きなく{a}の周りをうろうろした。そわそわしているのは、{b}のほうだった。'), calm: L('{b}はけらけらと笑いながらも、{a}から目を離さなかった。|{b}は身を乗り出して、{a}の顔を覗き込んだ。') },
    shy: { pos: L('{b}は真っ赤になって、両手で顔を覆った。指の隙間から、まだ{a}を見ていた。|{b}はうつむいたまま、服の裾をいじっていた。'), calm: L('{b}はおろおろと{a}の前で手をさまよわせた。|{b}は小さな声で、{a}の名前を一度だけ呼んだ。') },
    polite: { pos: L('{b}は丁寧に笑みを返したが、言葉が少しだけ上ずっていた。|{b}は姿勢を正したが、指先が落ち着きなく動いていた。'), calm: L('{b}は礼儀正しく一歩下がり、{a}が落ち着くのを待った。|{b}は言葉を選ぶように少し黙ってから、{a}に向き直った。') }
  };
  /* 反応ごとの理由と、値の動き（エンジン型は ctx.mod の差分、物語型は S.relD に足す値 d） */
  var RX = U.RX = {
    dousa: { why: function () { return 'いつもとの落差に戸惑った'; }, d: 0.03 },
    toki: { why: function () { return '意外な一面に胸が鳴った'; }, d: 0.1 },
    hikare: { why: function (X, a, b, low) { return '落差に惹かれた' + (low ? '（もともと好意は低かった）' : ''); }, d: 0.14 },
    kowaku: { why: function () { return '崩れた姿を蠱惑的に感じた'; }, d: 0.12 },
    shinpai: { why: function (X, a, b) { return '面倒見のよさ（NP ' + pc(trOf(b).np) + '）'; }, d: 0.08 },
    omoshiro: { why: function (X, a, b) { return '遊び心（FC ' + pc(trOf(b).fc) + '）'; }, d: 0.06 },
    keikai: { why: function (X, a, b) { return '慎重さ ' + pc(trOf(b).caution); }, d: -0.08 },
    sosoru: { why: function (X, a, b) { return '体の熱が上がった（性欲' + (HK.Pos && HK.Pos.libOf && HK.Pos.libOf(b) === 'high' ? '：強い' : '') + '）'; }, d: 0.08 }
  };
  function affOf(X, b, a) {
    if (isCtx(X)) return X.R(b, a).aff;
    var k = a.i < b.i ? a.i + '-' + b.i : b.i + '-' + a.i;
    return ((X.relD && X.relD[k]) || 0) * 60;
  }
  /* 反応を選ぶ（ro：恋愛に進める組、so：体の熱に流せる組） */
  function reactW(X, a, b, f, ro, so) {
    var t = trOf(b), p = per(b), lib = HK.Pos && HK.Pos.libOf ? HK.Pos.libOf(b) : '', aff = affOf(X, b, a);
    var trust = isCtx(X) ? X.R(b, a).trust : aff, ten = isCtx(X) ? X.R(b, a).ten : 0, x = chaosOf(X);
    var w = {
      dousa: 1 + t.ac * 0.6,
      shinpai: f.neg ? 0.4 + t.np * 1.4 : 0.15 + t.np * 0.3,
      omoshiro: 0.2 + t.fc * 1.1,
      keikai: 0.15 + t.caution * 0.6 + (trust < 0 ? 0.6 : 0) + (ten > 30 ? 0.5 : 0),
      toki: ro ? 0.55 + t.ac * 0.5 + Math.max(0, aff) / 100 : 0,
      hikare: ro ? 0.5 + (aff < 10 ? 0.7 : 0.2) + x * 0.5 : 0,
      kowaku: ro && f.lure ? 0.3 + t.cold * 0.6 + (p === 'cool' || p === 'proud' || p === 'stern' ? 0.3 : 0) : 0,
      /* そそられる：性欲が強い人（ふつうの人もまれに）。見た側が相手を避けているときは起こさない */
      sosoru: so && !(HK.Avoid && HK.Avoid.of && HK.Avoid.of(X, b, a)) ? (lib === 'high' ? 1.8 : lib === '' ? 0.22 : 0) * (U.R18 && U.R18.react ? 1 : 0) : 0
    };
    return w;
  }
  function pickReact(X, a, b, f, ro, so) {
    var w = reactW(X, a, b, f, ro, so), keys = Object.keys(w).filter(function (k) { return w[k] > 0; });
    return HK.weighted(X.rng, keys, function (k) { return w[k]; });
  }
  U.pickReact = pickReact;
  /* その人の、まだ使っていない型のうち、いちばん「らしくない」もの（同点は種で決める。乱数を使わない） */
  function flipFor(X, a, b, ro) {
    var s = st(X), used = s.used[a.i] || {}, t = trOf(a), p = per(a), th = U.TH(chaosOf(X)), best = null, bv = -1;
    F.forEach(function (f, j) {
      if (used[f.k] || (f.rom && !ro)) return;
      var v = f.fit(t, p);
      if (v < th) return;
      v += h01(s.salt, a.i, j, 31) * 0.12;
      if (v > bv) { bv = v; best = f; }
    });
    return best;
  }
  U.flipFor = flipFor;

  /* ================= 一場面を組み立てる（エンジン型・物語型の共通） ================= */
  /* 返す：{ text, why, rk（反応）, f（型）, rom（恋愛として記録してよい）, d（物語型の関係の値） } */
  function scene(X, a, b, f, ro) {
    var s = st(X), so = sexOK(X, a, b), rk = pickReact(X, a, b, f, ro, so), R0 = REACT[rk] || (U.R18 && U.R18.react && U.R18.react.def);
    var low = affOf(X, b, a) < 10, x = chaosOf(X), m = { a: a, b: b, u: pickOf(X, f.usual) };
    var head = fill(pickOf(X, f.t), m);
    if (X.rng() < 0.6) head += fill(pickOf(X, GAP[per(a)] || GAP.gentle), m);
    var body = rk === 'sosoru' && U.R18 && U.R18.react ? U.R18.react(X, a, b) : fill(pickOf(X, R0.t), m);
    var tp = TAIL[per(b)] || TAIL.gentle, tail = fill(pickOf(X, REACT[rk] && !REACT[rk].pos && rk !== 'dousa' ? tp.calm : tp.pos), m);
    /* 心配した人は手を差し伸べる文で終わるので、態度の一文を足さない（腕を組んで眺める などと食い違うため） */
    var text = head + body + (rk !== 'shinpai' && X.rng() < 0.7 ? tail : '');
    var name = REACT[rk] ? REACT[rk].name : 'そそられた';
    var why = a.name + 'の「らしくない」行動：' + f.name + '（ふだんの' + f.why(trOf(a)) + '／運命の揺らぎ ' + pc(x) + '）。' + b.name + 'は' + name + '（' + RX[rk].why(X, a, b, low) + '）';
    if (!ro && (rk === 'dousa' || rk === 'sosoru')) why += (so ? '／恋愛には進まない組なので、惹かれではなく体の熱に流れた' : '／恋愛には進まない組なので、動揺のまま');
    s.used[a.i] = s.used[a.i] || {}; s.used[a.i][f.k] = 1;
    s.cnt[a.i] = (s.cnt[a.i] || 0) + 1; s.n++;
    return { text: text, why: why, rk: rk, f: f, rom: ro && (rk === 'toki' || rk === 'hikare' || rk === 'kowaku' || rk === 'sosoru'), so: so, low: low };
  }
  /* 気分（emotion.js）：らしくないことをした側は恥じらい、見た側は反応ごと */
  function emo(X, a, b, rk) {
    var E = HK.Emo; if (!E || !E.bump) return;
    E.bump(X, a, { shame: 12 }, 'らしくない振る舞い');
    var d = { dousa: { shame: 6 }, toki: { joy: 8, shame: 6 }, hikare: { joy: 10 }, kowaku: { shame: 4, joy: 4 }, shinpai: { fear: 4 }, omoshiro: { joy: 8 }, keikai: { fear: 6 }, sosoru: { lust: 30 } }[rk];
    if (d) E.bump(X, b, d, 'らしくない' + a.name + 'を見て');
  }
  /* エンジン型の値の動き */
  function apply(ctx, a, b, sc, ro) {
    var rk = sc.rk, pf = ctx.pair(a, b);
    if (rk === 'dousa') { ctx.mod(b, a, ro ? { ten: 3, att: 5 } : { ten: 4 }); ctx.stress(b, 3); }
    else if (rk === 'toki') { ctx.mod(b, a, { att: 10, aff: 4 }); ctx.mod(a, b, { att: 3 }); }
    else if (rk === 'hikare') { ctx.mod(b, a, sc.low ? { att: 14, aff: 12, ten: -8 } : { att: 14, aff: 6, ten: -4 }); ctx.mod(a, b, { att: 4 }); }
    else if (rk === 'kowaku') { ctx.mod(b, a, { att: 13, ten: 2 }); ctx.mod(a, b, { att: 3 }); }
    else if (rk === 'shinpai') { ctx.mod(b, a, { aff: 5, trust: 3 }); ctx.mod(a, b, { trust: 4, aff: 2 }); }
    else if (rk === 'omoshiro') { ctx.mod(b, a, { aff: 4 }); ctx.mod(a, b, { ten: 2, aff: 1 }); }
    else if (rk === 'keikai') { ctx.mod(b, a, { trust: -6, ten: 5 }); ctx.mod(a, b, { ten: 2 }); }
    else if (rk === 'sosoru') { if (ro) ctx.mod(b, a, { att: 8 }); else ctx.mod(b, a, { ten: 3 }); }
    /* 意外な関係への入口：反応した側（b）から a へ。恋愛の流れ（unl_spark）と体の関係の流れ（unl_heat） */
    if (ro && (rk === 'toki' || rk === 'hikare' || rk === 'kowaku')) pf.unlSpark = { by: b.i, to: a.i, at: ctx.stepIndex, k: sc.f.k, rk: rk };
    if (rk === 'sosoru') pf.unlHeat = { by: b.i, to: a.i, at: ctx.stepIndex, k: sc.f.k };
    emo(ctx, a, b, rk);
  }

  /* ================= 当人の後日談 ================= */
  var AFTER = U.AFTER = {
    shame: { name: '自覚して恥じた', t: L('{a}は、{b}の前で見せた自分の姿を思い出しては、何度も頭を抱えた。|{a}は{b}と顔を合わせるたびに、あのときのことを思い出して視線を泳がせた。|{a}は{b}の姿を見かけると、さりげなく向きを変えた。あのときの自分を、なかったことにしたかった。'),
      line: {
        proud: '{a}「さっきのは忘れて。いい？｜さっきのは忘れろ。いいな｜さっきのことは、忘れてください。いいですね」',
        stern: '{a}「先ほどは見苦しいところを見せた。……すまない｜＝｜先ほどは見苦しいところをお見せしました。……すみません」',
        tsun: '{a}「あ、あれは違うから！　本気にしないでよね｜あ、あれは違う！　本気にするな｜あ、あれは違いますから！　本気にしないでくださいね」',
        gentle: '{a}「ごめんね、変なところ見せちゃった｜すまない、変なところを見せた｜ごめんなさい、変なところを見せてしまいました」',
        devoted: '{a}「あの、さっきはごめん。もう、あんなことしないから｜あの、さっきはすまなかった。もう、あんなことはしない｜あの、さっきはごめんなさい。もう、あんなことはしませんから」',
        cool: '{a}「……さっきのは、記録から消しておいて｜……さっきのは、記録から消しておいてくれ｜……さっきのは、記録から消しておいてください」',
        free: '{a}「うわー、思い出すと恥ずかしい！　忘れて忘れて｜ああ、思い出すと恥ずかしい！　忘れてくれ｜うわあ、思い出すと恥ずかしいです！　忘れてください」',
        shy: '{a}「ご、ごめんね……あんなの、私じゃないみたいで｜す、すまない……あんなのは、私ではないみたいで｜ご、ごめんなさい……あんなの、私ではないみたいで」',
        polite: '{a}「さっきは、失礼なことをした。忘れてほしい｜先ほどは、失礼をした。忘れてほしい｜先ほどは、大変失礼しました。どうか忘れてください」'
      } },
    own: { name: '開き直った', t: L('{a}は、もう取り繕おうとはしなかった。あのときの自分も自分だと、どこかで腹をくくっていた。|{a}は{b}と目が合うと、照れもせずに見つめ返した。|{a}は、あれ以来、{b}の前で無理に「いつもの自分」を演じなくなった。'),
      line: {
        proud: '{a}「何、文句ある？　あれも私だから｜何だ、文句があるのか？　あれも私だ｜何か、ご不満でも？　あれも私ですから」',
        stern: '{a}「言い訳はしない。あれも、私の本心だ｜＝｜言い訳はしません。あれも、私の本心です」',
        tsun: '{a}「……べ、別に、撤回はしないから｜……べ、別に、撤回はしない｜……べ、別に、撤回はしませんから」',
        gentle: '{a}「たまには、ああいう私もいいでしょ？｜たまには、ああいう私もいいだろう？｜たまには、ああいう私もいいでしょう？」',
        devoted: '{a}「たまには、私だってわがまま言いたいの｜たまには、私だってわがままを言いたい｜たまには、私だってわがままを言いたいんです」',
        cool: '{a}「考えた結果、あれも私の一部だと結論した｜＝｜考えた結果、あれも私の一部だと結論しました」',
        free: '{a}「いいじゃん、たまには！　またやるかもね｜いいだろう、たまには！　またやるかもしれない｜いいじゃないですか、たまには！　またやるかもしれません」',
        shy: '{a}「あ、あれも、本当の私なの……たぶん｜あ、あれも、本当の私だ……たぶん｜あ、あれも、本当の私です……たぶん」',
        polite: '{a}「見苦しかったかもしれないけど、後悔はしてない｜見苦しかったかもしれないが、後悔はしていない｜お見苦しかったかもしれませんが、後悔はしていません」'
      } },
    forget: { name: '覚えていなかった', t: L('{a}は、あのときのことをまるで覚えていなかった。{b}が話を振っても、きょとんと首をかしげるばかりだった。|{b}がそれとなく例の件に触れると、{a}は不思議そうに瞬きをした。どうやら本当に、何も覚えていないらしい。|{a}は、すっかりいつもどおりの{a}に戻っていた。あの「らしくない」{a}は、まるで最初からいなかったかのようだった。'),
      line: {
        proud: '{a}「は？　何の話？｜は？　何の話だ｜はい？　何のお話ですか」',
        stern: '{a}「何のことだ。覚えがない｜＝｜何のことでしょう。覚えがありません」',
        tsun: '{a}「な、何よ。そんなこと、言ってない｜な、何だ。そんなことは、言っていない｜な、何ですか。そんなこと、言っていません」',
        gentle: '{a}「あら、そんなことあった？｜ほう、そんなことがあったか？｜あら、そんなことがありましたか？」',
        devoted: '{a}「え、私、何かしちゃった？｜ん、私は何かしたか？｜え、私、何かしてしまいましたか？」',
        cool: '{a}「記憶にない。誰かと勘違いしてない？｜記憶にない。誰かと勘違いしていないか｜記憶にありません。誰かと勘違いしていませんか」',
        free: '{a}「え、ほんと？　全然覚えてないや｜何、本当か？　まったく覚えていない｜え、本当ですか？　全然覚えていません」',
        shy: '{a}「わ、私、そんなことを……？｜わ、私が、そんなことを……？｜わ、私、そんなことをしてしまったんですか……？」',
        polite: '{a}「申し訳ないけど、覚えがなくて｜申し訳ないが、覚えがない｜申し訳ありませんが、覚えがなくて」'
      } }
  };
  function afterKind(X, a) {
    var t = trOf(a), p = per(a), x = chaosOf(X);
    if (x >= 0.7 && X.rng() < 0.35) return 'forget';
    var own = t.honesty * 0.6 + t.fc * 0.4 + (p === 'free' || p === 'proud' ? 0.2 : 0), shame = t.ac * 0.6 + (1 - t.honesty) * 0.3 + (p === 'shy' || p === 'tsun' || p === 'stern' || p === 'polite' ? 0.2 : 0);
    return X.rng() * (own + shame) < own ? 'own' : 'shame';
  }
  function afterScene(X, a, b, P) {
    var k = afterKind(X, a), A = AFTER[k], m = { a: a, b: b };
    var t = fill(pickOf(X, A.t), m) + fill(A.line[per(a)] || A.line.gentle, m);
    return { k: k, text: t, why: a.name + 'の後日談：「らしくない」行動（' + FK[P.k].name + '）のあと、' + A.name + (k === 'forget' ? '（運命の揺らぎ ' + pc(chaosOf(X)) + '）' : '') };
  }
  /* らしくない一面が忘れられず、反応した側（{a}）から近づく */
  var SPARK = U.SPARK = L('{a}は、あのときの{b}の顔が忘れられずにいた。気づけば、自分から{b}の隣に座っていた。{a}「ねえ、また見せてよ。ああいう顔｜なあ、また見せてくれ。ああいう顔を｜あの、また見せてください。ああいう顔」|' +
    '{a}は{b}を見かけるたび、つい目で追うようになっていた。{b}がそれに気づいて、二人のあいだに妙な沈黙が落ちた。どちらも、嫌な沈黙だとは思わなかった。|' +
    '{a}は用もないのに{b}に話しかけた。理由を聞かれても、うまく答えられなかった。{a}「……別に。話したかっただけ｜……別に。話したかっただけだ｜……別に。お話ししたかっただけです」|' +
    '{a}と{b}は、気づけば並んで過ごす時間が増えていた。あの「らしくない」一件以来、二人の距離はどこかおかしかった。それが、不思議と心地よかった。');

  /* ================= エンジン型の共通の出来事 ================= */
  /* この区切りの当たり（種と区切りの番号から。本筋の乱数を使わない） */
  function token(ctx) {
    var s = st(ctx), i = ctx.stepIndex;
    /* 当たったのに相手と型がそろわず起きなかった区切りの当たりは、次の区切りに一度だけ持ち越す（場所が分かれる箱庭でも、見込みに近い回数にする） */
    if (s.tokAt !== i) { var left = s.tok && !s.done && !s.carried; s.tokAt = i; s.tok = left || h01(s.salt, i, 77) < U.pStep(ctx.chaos, s.nSteps); s.carried = left; s.done = false; }
    return s.tok && !s.done;
  }
  function flipOk(ctx, a, b) {
    if (!b || !(ctx.chaos > 0) || !token(ctx)) return null;
    var s = st(ctx);
    if ((s.cnt[a.i] || 0) >= U.cap(ctx.chaos) || blocked(ctx, a, b)) return null;
    if (ctx.others(a).indexOf(b) < 0) return null;
    if (related(ctx, a, b) < (ctx.chaos >= 0.7 ? 1 : 2)) return null;
    var ro = romOK(ctx, a, b), f = flipFor(ctx, a, b, ro);
    return f ? { f: f, ro: ro } : null;
  }
  HK.addTo(HK.COMMON, [
    {
      id: 'unl_flip', label: 'らしくない行動と相手の動揺・ときめき', cat: 'bond', scope: 'pair', tie: '-', noOdd: true,
      when: function (ctx, a, b) { return !!flipOk(ctx, a, b); },
      /* 揺らぎが高いほど、ほかの出来事の重みが均される（engine.js の act）ので、そのぶん重くする */
      w: function (ctx) { return 10 + 30 * ctx.chaos; },
      run: function (ctx, a, b) {
        var ok = flipOk(ctx, a, b);
        if (!ok) return null;
        var s = st(ctx); s.done = true;
        var pf = ctx.pair(a, b), sc = scene(ctx, a, b, ok.f, ok.ro);
        s.log.push({ a: a.i, b: b.i, k: ok.f.k, rk: sc.rk, at: ctx.stepIndex, ro: ok.ro, so: sc.so, couple0: !!pf.couple, night0: !!pf.night || (pf.nights || 0) > 0 });
        apply(ctx, a, b, sc, ok.ro);
        a._unlP = { b: b.i, k: ok.f.k, at: ctx.stepIndex };
        return { cat: sc.rom ? 'romance' : 'bond', odd: true, text: ctx.t(sc.text, a, b), why: sc.why, mag: 14 };
      }
    },
    {
      id: 'unl_after', label: 'らしくない行動を振り返る後日談', cat: 'bond', scope: 'solo', tie: '-', noOdd: true,
      when: function (ctx, a) {
        var P = a._unlP; if (!P || P.done || ctx.stepIndex <= P.at) return false;
        var b = ctx.chars[P.b];
        return !!b && here(a) && here(b) && ctx.others(a).indexOf(b) >= 0;
      },
      w: function () { return 4; },
      run: function (ctx, a) {
        var P = a._unlP, b = ctx.chars[P.b]; P.done = true;
        var r = afterScene(ctx, a, b, P);
        if (r.k === 'shame') { ctx.stress(a, 4); ctx.mod(b, a, { aff: 2 }); }
        else if (r.k === 'own') { ctx.mod(a, b, romOK(ctx, a, b) ? { att: 3, trust: 2 } : { trust: 3 }); ctx.mod(b, a, { trust: 2 }); }
        else ctx.mod(b, a, { ten: 3 });
        return { with: [b], text: ctx.t(r.text, a, b), why: r.why, mag: 6 };
      }
    },
    {
      id: 'unl_spark', label: 'らしくない一面が忘れられず近づく', cat: 'romance', scope: 'pair', tie: '-', noOdd: true, pri: true,
      when: function (ctx, a, b) {
        if (!b) return false;
        var pf = ctx.pair(a, b), sp = pf.unlSpark;
        return !!sp && !sp.done && sp.by === a.i && sp.to === b.i && ctx.stepIndex > sp.at && !pf.couple && ctx.R(a, b).att >= 14 && romOK(ctx, a, b) && !blocked(ctx, a, b);
      },
      /* 一組に一度だけの続きなので、箱庭の進行役の出来事と同じくらい重くする（pri） */
      w: function (ctx, a, b) { return (2.5 + ctx.R(a, b).att / 30) * (1 + ctx.chaos); },
      run: function (ctx, a, b) {
        var sp = ctx.pair(a, b).unlSpark; sp.done = true;
        ctx.mod2(a, b, { aff: 8, att: 8, trust: 4, ten: -4 }, { aff: 7, att: 8, trust: 3, ten: -4 });
        return { text: ctx.t(ctx.pick(SPARK), a, b), why: a.name + 'は、' + b.name + 'の「らしくない」一面（' + FK[sp.k].name + '）が忘れられなかった（' + REACT[sp.rk].name + 'あと）', mag: 12 };
      }
    }
  ]);

  /* ================= 物語型の入口 ================= */
  /* S：物語型の状態、id：箱庭、live：出てよい人（呼ぶ側が、死んだ人・連れ去られた人・縛られた人などを除いて渡す）、o.n：この入口を一回の箱庭で呼ぶ見込みの回数 */
  U.story = function (S, id, live, o) {
    o = o || {};
    if (!S || !S.rng) return null;
    var x = chaosOf(S);
    if (!(x > 0)) return null;
    var L0 = (live || []).filter(function (p) { return here(p); });
    if (L0.length < 2) return null;
    var s = st(S);
    s.calls++;
    /* 後日談（らしくない行動の次の呼び出し以降） */
    var pend = L0.filter(function (p) { return p._unlP && !p._unlP.done && p._unlP.call < s.calls; })[0];
    if (pend && S.rng() < 0.6) {
      var P = pend._unlP, pb = S.P[P.b];
      if (pb && L0.indexOf(pb) >= 0) {
        P.done = true;
        var ar = afterScene(S, pend, pb, P);
        return { a: pend, b: pb, text: ar.text, why: ar.why, d: ar.k === 'forget' ? -0.02 : 0.03, tag: 'らしくない（後日談）', after: true };
      }
    }
    if (S.rng() >= U.pStep(x, o.n || 10)) return null;
    var cands = [], cap = U.cap(x);
    L0.forEach(function (a) {
      if ((s.cnt[a.i] || 0) >= cap) return;
      L0.forEach(function (b) {
        if (a === b || blocked(S, a, b)) return;
        var ro = romOK(S, a, b), f = flipFor(S, a, b, ro), w = related(S, a, b);
        if (f && (w >= 2 || x >= 0.5)) cands.push({ a: a, b: b, f: f, ro: ro, w: w === 3 ? 4 : w });
      });
    });
    if (!cands.length) return null;
    var c = HK.weighted(S.rng, cands, function (q) { return q.w; }), a = c.a, b = c.b;
    var sc = scene(S, a, b, c.f, c.ro);
    s.log.push({ a: a.i, b: b.i, k: c.f.k, rk: sc.rk, at: s.calls, ro: c.ro, so: sc.so });
    a._unlP = { b: b.i, k: c.f.k, call: s.calls };
    emo(S, a, b, sc.rk);
    return { a: a, b: b, text: fill(sc.text, { a: a, b: b }), why: sc.why, d: RX[sc.rk].d * (c.ro || sc.rk === 'shinpai' || sc.rk === 'omoshiro' || sc.rk === 'keikai' ? 1 : 0.3), tag: 'らしくない', rk: sc.rk, k: c.f.k };
  };
  /* 物語型の箱庭に足す環境値（呼ぶ側の箱庭の env に入れる。エンジン型の全体の設定と同じ id） */
  U.ENV = { id: 'chaos', label: '運命の揺らぎ', min: 0, max: 100, def: 40, lo: '気質どおり', hi: '番狂わせ', desc: '高いほど、関係のある相手に「らしくない行動」（嫉妬しない人の嫉妬・強引な人の照れ など）をとり、それを見た相手が動揺したり、ときめいたりする' };
})();
