/* 箱庭シミュレーター: 関係の層の選択肢（2026-10-26。関係の種類は増やさず、既存の関係に欄を足す。定義は ties.js）の場面（エンジン型の箱庭で共通。全年齢版も同じ）
   ・気持ちの重さ（恋人・夫婦・本命の欄 heavy）：重い＝「離れたくない」・確かめる・嫉妬して独占する／軽い＝互いの時間を大事にする淡々とした場面。
     恋人の日常（daily-kit.js の部品）にも、重い・軽いの分岐を足す（関係 wtHeavy／wtLight）
   ・家族の仲（親子・擬似親子・きょうだい・兄弟（庇護）・義理のきょうだい・親族・恩人の欄 kg）：不仲＝口論・無視・和解／良好＝気安く助け合う
   ・元恋人の気持ち（元恋人の欄 feel・feelB）：気まずい／ふっきれている／未練（未練は恋愛対象が合う向きだけ）
   ・二人の過去（どの関係にも付く欄 past）：導入の一文（箱庭の始め）と、回想の出来事、関係の出来事の台詞への差し込み（一組につき箱庭1回で3回まで）
   ・関係ごとの出来事のオフ（どの関係にも付く欄 noev）：関係の出来事（id が HK.TIE_EV_RE に合う場面）の起こる条件を調べるあいだ、
     「出来事：起こさない」の関係を見えないことにする（ties.js の HK.Ties.all が ctx._evq を見る）。関係の色（初期値・倍率・恋人の扱い）は残る
   恋愛の分岐は HK.canLove を両方向・HK.ngPair・家族（恋愛なし）を通した組だけ。死んだ人・その場にいない人・監禁中の人は出さない（HK.State.here）。
   台詞は3本（くだけた常体｜硬い常体｜敬語）、一人称は「私」、二人称は「あなた」。登場人物はすべて成人として扱う。性的な文は書かない。
   id は tie_ly_ で始める（全体の設定「関係性イベント：出さない」・関係ごとの「出来事：起こさない」で外れる） */
(function () {
  'use strict';
  var HK = window.HK;
  if (!HK || !HK.COMMON || !HK.Ties) return;
  function L(s) { return s.split('|'); }
  var PK = ['proud', 'stern', 'tsun', 'gentle', 'devoted', 'cool', 'free', 'shy', 'polite'];
  function per(c) { var k = c && (c.persona || (HK.personaOf && HK.personaOf(c))) || 'gentle'; return PK.indexOf(k) >= 0 ? k : 'gentle'; }
  function P9(o) { var r = {}; PK.forEach(function (k) { r[k] = L(o[k] || o.gentle); }); return r; }
  function here(c) { return !!c && (HK.State ? HK.State.here(c) : c.alive !== false) && !(c.flags && c.flags.caged != null); }
  function both(a, b) { return !!(HK.canLove && HK.canLove(a, b) && HK.canLove(b, a)); }
  function loveOk(ctx, a, b) { return both(a, b) && !(HK.ngPair && HK.ngPair(a, b)) && !ctx.pair(a, b).kin; }
  function fill(s, a, b, c) { return String(s || '').replace(/\{a\}/g, a.name).replace(/\{b\}/g, b.name).replace(/\{c\}/g, c ? c.name : ''); }
  function pk(ctx, l) { return ctx.pick(l); }
  function all(ctx, a, b) { return HK.Ties.all(ctx, a, b); }
  function keyOf(a, b) { return a.i < b.i ? a.i + '-' + b.i : b.i + '-' + a.i; }
  var TL = HK.TieLayer = {};
  function push(ev) { ev.scope = 'pair'; ev.noOdd = true; HK.COMMON.push(ev); }

  /* ======================= 関係の出来事の窓口（出来事のオフ・過去の回想の差し込み） =======================
     最初の箱庭を回すとき（ties.js の HK.Ties.after）に、いちばん外側の HK.buildPool を一度だけ包み、出来事の山にある関係の出来事を包む。
     包んだ出来事は、関係の層の欄を一つも選んでいなければ（ctx._noEv・ctx._past が無ければ）元のまま動く */
  function wrapEv(e) {
    /* 関係の出来事：全体の設定と同じ HK.TIE_EV_RE に、不仲・きょうだい（不仲）の場面（rel-bad-engine.js の rb_）を足す */
    if (!e || e._tlW || !e.id || !HK.TIE_EV_RE || !(HK.TIE_EV_RE.test(e.id) || /^rb_/.test(e.id))) return;
    e._tlW = true;
    var w0 = e.when, r0 = e.run;
    if (typeof w0 === 'function') e.when = function (ctx, a, b) {
      if (!ctx || !ctx._noEv || !b) return w0.apply(this, arguments);
      ctx._evq = (ctx._evq || 0) + 1;
      try { return w0.apply(this, arguments); } finally { ctx._evq--; }
    };
    if (typeof r0 === 'function') e.run = function (ctx, a, b) {
      var r = r0.apply(this, arguments);
      return ctx && ctx._past && b && r && typeof r.text === 'string' ? pastTouch(ctx, a, b, r) : r;
    };
  }
  function hookPool() {
    if (!HK.buildPool || HK.buildPool._tlW) return;
    var bp = HK.buildPool;
    HK.buildPool = function () { var p = bp.apply(this, arguments); (p || []).forEach(wrapEv); return p; };
    HK.buildPool._tlW = true;
  }
  TL.wrapEv = wrapEv;
  var af0 = HK.Ties.after;
  HK.Ties.after = function (ctx) {
    var r = af0.apply(this, arguments);
    hookPool();
    if (ctx && ctx._past) intro(ctx);
    return r;
  };

  /* ======================= 二人の過去（past） =======================
     {a}＝一人目（t.a。初恋をした側・助けられた側・ひどいことをした側）、{b}＝二人目。first は恋愛対象が合わない向きなら「憧れ」の文にする */
  var PAST = {
    friend: {
      intro: L('{a}と{b}は、昔はいつも一緒にいた。いつから距離ができたのか、二人ともはっきりとは覚えていなかった。|{a}と{b}は、昔はよく笑い合う仲だった。今の二人がどう見えるにせよ、あのころのことは二人とも忘れていなかった。'),
      touch: L('{a}はふと、{b}と並んで歩いた昔の帰り道を思い出した。{a}「昔は、毎日一緒に帰ってたね｜昔は、毎日一緒に帰っていたな｜昔は、毎日一緒に帰っていましたね」|{b}の笑い方が昔のままなのに気づいて、{a}は少しだけ懐かしくなった。|{a}「こうしてると、昔に戻ったみたい｜こうしていると、昔に戻ったようだ｜こうしていると、昔に戻ったみたいです」{b}「……昔の話はやめて｜……昔の話はやめろ｜……昔の話はやめてください」――そう言いながら、{b}も少し笑っていた。')
    },
    foe: {
      intro: L('{a}と{b}は、昔は敵どうしだった。あのころの因縁は、二人のあいだにまだ薄く残っていた。|{a}と{b}は、昔は互いを打ち負かすことしか考えていなかった。同じ場所にいるのは、二人にとって妙な気分だった。'),
      touch: L('{a}は{b}の横顔を見て、昔は本気でぶつかり合っていたことを思い出した。{a}「まさか、あなたと並ぶ日が来るとは思わなかった｜＝｜まさか、あなたと並ぶ日が来るとは思いませんでした」|{b}「昔の私が見たら、腰を抜かすね｜昔の私が見たら、腰を抜かすだろう｜昔の私が見たら、腰を抜かしますね」――{a}は鼻で笑って、それでも否定しなかった。|{a}と{b}は、昔の争いの話になると、今でも少しだけ意地を張り合った。どちらも、あのころの負けを認めていなかった。')
    },
    first: {
      intro: L('{b}は、{a}の初恋の相手だった。{b}がそれを知っているのかどうか、{a}には分からなかった。|{a}にとって{b}は、初めて誰かを好きになった、その相手だった。あれから何年たっても、{b}の名前を聞くと、胸の奥が少しだけ揺れた。'),
      touch: L('{b}の何気ない仕草に、{a}は初恋のころの気持ちを思い出して、思わず目を逸らした。|{a}は{b}の笑い声を聞いて、昔、遠くから見ているだけだった日々を思い出した。|{a}「……昔、{b}のこと、ずっと見てた｜……昔、{b}のことをずっと見ていた｜……昔、{b}のことを、ずっと見ていました」{b}「え？｜何だ？｜え？」{a}「何でもない｜何でもない｜何でもありません」')
    },
    adore: {
      intro: L('昔、{a}は{b}に強く憧れていた。{b}の背中を追いかけていた日々のことを、{a}は今も覚えていた。'),
      touch: L('{a}は{b}を見て、昔、憧れて背中を追いかけていたころのことを思い出した。|{a}「昔は、{b}みたいになりたかった｜昔は、{b}のようになりたかった｜昔は、{b}みたいになりたかったんです」{b}は少し照れくさそうに笑った。')
    },
    saved: {
      intro: L('{a}は昔、{b}に助けられたことがある。あの日のことを、{a}は今も忘れていなかった。|{a}が昔、窮地に陥ったとき、手を差し伸べたのは{b}だった。{b}本人は、もう覚えていないかもしれなかった。'),
      touch: L('{a}「あのとき助けてくれたこと、まだちゃんとお礼を言えてない気がする｜あのとき助けてもらったことに、まだきちんと礼を言えていない気がする｜あのとき助けていただいたこと、まだきちんとお礼を言えていない気がします」{b}「そんな昔のこと｜そんな昔のことか｜そんな昔のことを」|{a}は{b}の手際を見て、昔、同じように自分を助けてくれた{b}の姿を思い出した。|{a}は、昔{b}に救われた恩を返すつもりで、黙って{b}の荷物を半分持った。')
    },
    hurt: {
      intro: L('{a}は昔、{b}にひどいことをした。{b}はそれを忘れていないし、{a}も忘れられずにいた。|{a}と{b}のあいだには、昔{a}がしたことが、今も小さな棘のように刺さっていた。'),
      touch: L('{b}の視線に気づいて、{a}は昔の自分のしたことを思い出した。{a}「……あのときのこと、ずっと謝りたかった｜……あのときのことを、ずっと謝りたかった｜……あのときのこと、ずっと謝りたかったです」{b}「今さら｜今さらだ｜今さらですね」――{b}の声は冷たかったが、その場を立ち去りはしなかった。|{a}は{b}に何か言いかけて、やめた。昔{b}を傷つけた自分に、今さら言えることはない気がした。|{b}は{a}を見て、昔のことを思い出したように顔をこわばらせた。{a}はそれに気づいて、そっと距離を取った。'),
      forgive: L('{a}「あのときは、本当にごめん｜あのときは、本当にすまなかった｜あのときは、本当にすみませんでした」{b}「……もういい。昔のことだから｜……もういい。昔のことだ｜……もういいです。昔のことですから」――{b}の返事に、{a}は少しだけ救われた。')
    }
  };
  TL.PAST = PAST;
  function pastTie(ctx, a, b) { var l = HK.Ties.all(ctx, a, b); for (var i = 0; i < l.length; i++) if (l[i].past && HK.TIE_PAST[l[i].past]) return l[i]; return null; }
  function pastN(ctx, t) { var m = ctx._pastC || (ctx._pastC = {}); return m[keyOf(ctx.chars[t.a], ctx.chars[t.b])] || 0; }
  function pastAt(ctx, t) { var m = ctx._pastC || (ctx._pastC = {}); return m['@' + keyOf(ctx.chars[t.a], ctx.chars[t.b])]; }
  function pastBump(ctx, t) { var m = ctx._pastC || (ctx._pastC = {}), k = keyOf(ctx.chars[t.a], ctx.chars[t.b]); m[k] = (m[k] || 0) + 1; m['@' + k] = ctx.stepIndex == null ? -1 : ctx.stepIndex; }
  var PAST_MAX = 3;
  /* 過去の札の文（kind：intro／touch）。{a}＝t.a 側、{b}＝t.b 側で埋める */
  function pastText(ctx, t, kind) {
    var A = ctx.chars[t.a], B = ctx.chars[t.b], k = t.past;
    if (k === 'first' && !HK.canLove(A, B)) k = 'adore';
    var o = PAST[k];
    if (!o) return '';
    var l = o[kind];
    if (k === 'hurt' && kind === 'touch' && ctx.R(B, A).aff > 20 && ctx.R(B, A).ten < 35) l = o.forgive;
    return fill(pk(ctx, l), A, B);
  }
  function pastWhy(ctx, t) {
    var A = ctx.chars[t.a], B = ctx.chars[t.b], x = { names: true, map: HK.TIE_PAST };
    var s = t.past === 'first' && !HK.canLove(A, B) ? '昔の憧れ' : HK.tieExtraShort(x, t.past, A.name, B.name);
    return A.name + 'と' + B.name + 'の過去：' + s;
  }
  /* 導入の一文（箱庭の始め。一組に一度） */
  function intro(ctx) {
    var seen = {};
    Object.keys(ctx.tiesAll || {}).forEach(function (k) {
      (ctx.tiesAll[k] || []).forEach(function (t) {
        if (!t.past || seen[k] || !HK.TIE_PAST[t.past]) return;
        var A = ctx.chars[t.a], B = ctx.chars[t.b];
        if (!A || !B || !here(A) || !here(B)) return;
        seen[k] = 1;
        var tx = pastText(ctx, t, 'intro');
        if (!tx) return;
        pastBump(ctx, t);
        (ctx.pending = ctx.pending || []).push({ kind: 'event', cat: 'bond', actors: [A, B], mag: 4, text: tx, why: pastWhy(ctx, t) + '（導入）' });
      });
    });
  }
  /* 関係の出来事の台詞のあとに、回想の一言を差し込む（3割。同じ区切りに二度は入れない） */
  function pastTouch(ctx, a, b, r) {
    var t = pastTie(ctx, a, b);
    if (!t || pastN(ctx, t) >= PAST_MAX || pastAt(ctx, t) === ctx.stepIndex) return r;
    var A = ctx.chars[t.a], B = ctx.chars[t.b];
    if (!here(A) || !here(B) || ctx.rng() > 0.3) return r;
    var tx = pastText(ctx, t, 'touch');
    if (!tx) return r;
    pastBump(ctx, t);
    r.text += tx;
    if (typeof r.why === 'string') r.why += '／' + pastWhy(ctx, t);
    return r;
  }
  TL.pastTouch = pastTouch;
  /* 回想の出来事（関係の出来事の少ない組でも、過去が顔を出すように） */
  push({
    id: 'tie_ly_past', cat: 'bond',
    when: function (ctx, a, b) {
      if (!ctx._past || !b || !here(a) || !here(b)) return false;
      var t = pastTie(ctx, a, b);
      return !!t && pastN(ctx, t) < PAST_MAX && pastAt(ctx, t) !== ctx.stepIndex;
    },
    w: function () { return 0.3; },
    run: function (ctx, a, b) {
      var t = pastTie(ctx, a, b);
      if (!t) return null;
      var A = ctx.chars[t.a], B = ctx.chars[t.b], tx = pastText(ctx, t, 'touch');
      if (!tx) return null;
      pastBump(ctx, t);
      if (t.past === 'friend') ctx.mod2(A, B, { aff: 3, trust: 2 }, { aff: 3, trust: 2 });
      else if (t.past === 'foe') ctx.mod2(A, B, { ten: -2, aff: 2 }, { ten: -2, aff: 2 });
      else if (t.past === 'first') ctx.mod(A, B, HK.canLove(A, B) && !(HK.ngPair && HK.ngPair(A, B)) ? { att: 2, aff: 2 } : { aff: 2 });
      else if (t.past === 'saved') ctx.mod2(A, B, { trust: 3, aff: 2 }, { aff: 1 });
      else if (t.past === 'hurt') { if (ctx.R(B, A).aff > 20 && ctx.R(B, A).ten < 35) ctx.mod2(A, B, { ten: -3 }, { ten: -6, aff: 4 }); else ctx.mod2(A, B, { ten: 2 }, { ten: 3 }); }
      return { text: tx, why: pastWhy(ctx, t) + '（回想）', mag: 6 };
    }
  });

  /* ======================= 恋人どうしの気持ちの重さ（heavy） ======================= */
  /* a から見た重さの関係（恋人・夫婦は二人に、本命は想う人に）。なければ null */
  function wtTie(ctx, a, b) {
    var l = all(ctx, a, b);
    for (var i = 0; i < l.length; i++) { var t = l[i]; if (!t.heavy || !HK.LOVE_WEIGHT[t.heavy]) continue; if (t.type === 'lover' || (t.type === 'honmei' && t.a === a.i)) return t; }
    return null;
  }
  TL.weight = function (ctx, a, b) { var t = wtTie(ctx, a, b); return t ? t.heavy : ''; };
  var HEAVY = {
    cling: P9({
      proud: '{a}は{b}の手首を掴んで、離そうとしなかった。{a}「どこ行くの。……もう少し、ここにいて｜どこへ行く。……もう少し、ここにいろ｜どこへ行くんですか。……もう少し、ここにいてください」',
      stern: '{a}は{b}の背中に向かって、低く言った。{a}「一人で行かせるつもりはない。私も行く｜＝｜一人で行かせるつもりはありません。私も行きます」',
      tsun: '{a}は{b}の袖をつまんだまま、そっぽを向いた。{a}「べ、別に寂しいとかじゃないし。……ただ、離れたくないだけ｜別に寂しいわけではない。……ただ、離れたくないだけだ｜べ、別に寂しいわけではありません。……ただ、離れたくないだけです」',
      gentle: '{a}は{b}の肩に頭を預けた。{a}「ずっとこうしていたい。{b}のいない時間が、前より長く感じる｜＝｜ずっとこうしていたいです。{b}のいない時間が、前より長く感じます」',
      devoted: '{a}は{b}の手を両手で包んだ。{a}「{b}がいないと、息の仕方も分からなくなる。だから、そばにいて｜{b}がいないと、息の仕方も分からなくなる。だから、そばにいてくれ｜{b}がいないと、息の仕方も分からなくなります。だから、そばにいてください」',
      cool: '{a}は表情を変えないまま、{b}の指に自分の指を絡めた。{a}「離れる理由が見つからない。だから離れない｜＝｜離れる理由が見つかりません。だから離れません」',
      free: '{a}は後ろから{b}に抱きついた。{a}「やだ、行かないで。あと五分だけ｜嫌だ、行くな。あと五分だけだ｜嫌です、行かないでください。あと五分だけ、お願いします」',
      shy: '{a}は{b}の服の裾を、そっと握った。{a}「……もう少しだけ、隣にいたい｜＝｜……もう少しだけ、隣にいたいです」',
      polite: '{a}は{b}の手を取り、静かに言った。{a}「片時も離れていたくない。わがままだと分かっていても｜片時も離れていたくない。わがままだと分かっていてもだ｜片時も離れていたくありません。わがままだと分かっていても」'
    }),
    clingBack: L('{b}は少し困ったように笑って、それでも{a}の手を握り返した。|{b}「どこにも行かないよ｜どこにも行かない｜どこにも行きませんよ」――{b}はそう言って、{a}の髪をそっと撫でた。|{b}は何も言わずに、{a}が落ち着くまで隣に座っていた。'),
    check: L('{a}は{b}の姿が見えなくなるたびに、どこにいるのか確かめずにはいられなかった。{a}「さっき、どこ行ってたの｜さっき、どこへ行っていた｜さっき、どこへ行っていたんですか」{b}「少し外の空気を吸ってただけ｜少し外の空気を吸っていただけだ｜少し外の空気を吸っていただけです」|{a}は{b}の予定を一つずつ聞き出して、全部覚えた。{b}は苦笑したが、嫌がりはしなかった。|{a}は{b}が誰と何を話したのか、さりげなく、けれど全部聞いた。{a}「……ううん、気になっただけ｜……いや、気になっただけだ｜……いえ、気になっただけです」|{a}は、{b}が少し離れただけで落ち着かなくなった。戻ってきた{b}の袖を、{a}は黙って掴んだ。'),
    jeal: L('{a}は、{b}が{c}と笑い合っているのを見て、胸の奥がざわついた。{a}は二人のあいだに割って入り、{b}の腕を取った。{a}「{b}、こっち｜{b}、こっちだ｜{b}、こちらへ」|{b}が{c}に親しげに話しかけるたび、{a}の視線は鋭くなった。{a}「{c}とずいぶん楽しそうだったね｜{c}とずいぶん楽しそうだったな｜{c}とずいぶん楽しそうでしたね」――声は穏やかだったが、{a}は少しも笑っていなかった。|{a}は{c}の前で、わざと{b}の肩を抱き寄せた。{c}は気まずそうに目を逸らした。{a}「{b}は私の恋人だから｜{b}は私の恋人だ｜{b}は私の恋人ですから」'),
    jealBack: L('{b}は{a}の嫉妬に気づいて、困ったように笑った。{b}「{a}だけだって、知ってるくせに｜{a}だけだと、知っているだろう｜{a}だけだって、知っているでしょう」|{b}は{a}の手を握って、{c}に小さく会釈した。そのまま、{a}の隣を離れなかった。|{b}「やきもち？｜やきもちか｜やきもちですか」――{b}がからかうように言うと、{a}はむっとして顔を背けた。'),
    pine: L('{a}は、{b}がほかの誰かと笑うたびに、目で追ってしまう自分に気づいていた。想いを口にできないまま、{a}の胸だけが重くなっていった。|{a}は{b}の隣が空くのを、いつも待っていた。誰にも渡したくないという気持ちを、{a}は持て余していた。|{a}は、{b}の名前を誰かが呼ぶたびに振り返った。{a}「……私だけを見てくれたらいいのに｜……私だけを見てくれればいいのに｜……私だけを見てくれたらいいのに、と思います」――その呟きは、誰にも聞こえなかった。'),
    pineC: L('{a}は、{b}と{c}が並んで話しているのを、少し離れたところから見ていた。割って入る資格はないと分かっていても、目が離せなかった。|{c}が{b}に何か耳打ちするのを見て、{a}は思わず拳を握った。{a}「……{b}を取らないで｜……{b}を取るな｜……{b}を取らないでください」――声にならない言葉が、喉の奥で止まった。')
  };
  var LIGHT = {
    space: P9({
      proud: '{a}は{b}に「＠{a}＠今日は好きにしてて｜今日は好きにしていろ｜今日は好きにしていてください」とだけ言って、自分の用事に出かけた。べったりしないのが、二人の流儀だった。',
      stern: '{a}と{b}は、それぞれの役目に戻った。顔を合わせるのは食事のときだけだったが、それで十分だった。{a}「夕方には戻る｜＝｜夕方には戻ります」',
      tsun: '{a}「べ、別に{b}がいなくても平気だし。……夜には帰るけど｜別に{b}がいなくても平気だ。……夜には帰るが｜べ、別に{b}がいなくても平気です。……夜には帰りますけど」――{b}は笑って、手を振って見送った。',
      gentle: '{a}は{b}の背中を見送って、自分の時間に戻った。会えない時間があるから、会えたときに嬉しいのだと、{a}は思っていた。',
      devoted: '{a}は{b}の邪魔をしないよう、少し離れたところで自分の作業をしていた。{a}「何かあったら呼んで｜何かあったら呼んでくれ｜何かあったら呼んでください」――それだけ言えば、あとは待っていられた。',
      cool: '{a}と{b}は、同じ場所にいても別々のことをしていた。{a}「互いの時間は、互いのもの｜互いの時間は、互いのものだ｜互いの時間は、互いのものです」――冷たいようでいて、二人にはそれが心地よかった。',
      free: '{a}は「じゃ、またあとで｜では、またあとでな｜では、またあとで」と手を振って、さっさと自分の用事に向かった。{b}も同じように手を振り返した。',
      shy: '{a}は{b}に声をかけようとして、やめた。{b}には{b}の時間がある。夜に会えれば、それでよかった。',
      polite: '{a}は{b}に軽く会釈して、それぞれの用事に分かれた。{a}「また後ほど｜また後でな｜また後ほど、お会いしましょう」'
    }),
    calm: L('{a}と{b}は、しばらくぶりに顔を合わせた。{a}「今日、何してた？｜今日は何をしていた｜今日は何をしていましたか」{b}「いろいろ。そっちは？｜いろいろだ。そちらは？｜いろいろです。そちらは？」――それだけの会話で、二人とも満足していた。|{a}と{b}は、黙って並んで座っていた。話すことがないのではなく、話さなくてもよかった。|{b}が{a}に最後に連絡したのは、昨日の夜の一言だけだった。{a}はそれを気にもせず、{b}の顔を見ると軽く手を上げた。|{a}と{b}は、互いの予定を少しだけ確かめ合って、それぞれの時間に戻った。恋人だからといって、いつも一緒にいる必要はなかった。'),
    pine: L('{a}は、遠くから{b}の姿を見つけて、少しだけ口元を緩めた。近づかなくても、それで十分だった。|{a}は{b}への想いを、急がずに胸にしまっていた。今は、{b}が元気でいればそれでいい。|{a}は{b}と短く言葉を交わして、すぐに自分の用事に戻った。{a}「また話そう｜＝｜また話しましょう」')
  };
  TL.HEAVY = HEAVY; TL.LIGHT = LIGHT;
  /* 嫉妬の相手（{c}）：その場にいて、b と親しく話せる人。a・b の家族（恋愛なし）や、a の恋人は除く */
  function jealC(ctx, a, b) {
    return (ctx.others ? ctx.others(a) : []).filter(function (c) {
      if (c === a || c === b || !here(c) || ctx.pair(a, c).couple || ctx.pair(b, c).kin) return false;
      return ctx.R(b, c).aff > 10 && ctx.R(b, c).ten < 45;
    });
  }
  function wtRoles(ctx, a, b, want) {
    if (!b || !here(a) || !here(b)) return null;
    var t = wtTie(ctx, a, b);
    if (!t || t.heavy !== want || !loveOk(ctx, a, b)) return null;
    var cp = ctx.pair(a, b).couple;
    if (t.type === 'lover' && !cp) return null;
    return { t: t, cp: cp };
  }
  function wtWhy(a, b, t, w, k) { return a.name + 'と' + b.name + 'は' + (t.type === 'honmei' ? a.name + 'の本命' : HK.tieLabel(t)) + '（気持ちの重さ：' + (w === 'heavy' ? '重い' : '軽い') + '）' + k; }
  push({
    id: 'tie_ly_heavy', cat: 'romance',
    when: function (ctx, a, b) { return !!wtRoles(ctx, a, b, 'heavy'); },
    w: function (ctx, a) { return 0.55 + a.tr.jealous * 0.3; },
    run: function (ctx, a, b) {
      var r = wtRoles(ctx, a, b, 'heavy');
      if (!r) return null;
      var C = jealC(ctx, a, b), c = C.length ? ctx.pick(C) : null;
      if (!r.cp) {
        ctx.mod(a, b, { att: 3, aff: 1 }); ctx.stress(a, 3);
        if (c) { ctx.mod(a, c, { ten: 3 }); return { cat: 'conflict', with: [c], text: fill(pk(ctx, HEAVY.pineC), a, b, c), why: wtWhy(a, b, r.t, 'heavy', '：' + b.name + 'と' + c.name + 'を見て、ひそかに嫉妬した'), mag: 8 }; }
        return { cat: 'bond', text: fill(pk(ctx, HEAVY.pine), a, b), why: wtWhy(a, b, r.t, 'heavy', '：想いを抱えて目で追う'), mag: 6 };
      }
      var x = ctx.rng(), k = c && x < 0.32 ? 'jeal' : x < 0.62 ? 'check' : 'cling';
      if (k === 'jeal') {
        ctx.mod(a, b, { att: 2, ten: 2 }); ctx.mod(a, c, { ten: 4, aff: -2 }); ctx.stress(a, 4);
        return { cat: 'conflict', with: [c], text: fill(pk(ctx, HEAVY.jeal), a, b, c) + fill(pk(ctx, HEAVY.jealBack), a, b, c), why: wtWhy(a, b, r.t, 'heavy', '：' + c.name + 'と親しげな恋人に嫉妬し、独占しようとした'), mag: 10 };
      }
      if (k === 'check') {
        ctx.mod2(a, b, { att: 2, aff: 1 }, { aff: 1, ten: 2 });
        return { cat: 'bond', text: fill(pk(ctx, HEAVY.check), a, b), why: wtWhy(a, b, r.t, 'heavy', '：恋人の居場所を確かめずにいられない'), mag: 6 };
      }
      ctx.mod2(a, b, { att: 3, aff: 2 }, { att: 2, aff: 2 }); ctx.stress(a, -3);
      return { cat: 'romance', text: fill(pk(ctx, HEAVY.cling[per(a)]), a, b) + fill(pk(ctx, HEAVY.clingBack), a, b), why: wtWhy(a, b, r.t, 'heavy', '：離れたくない'), mag: 8 };
    }
  });
  push({
    id: 'tie_ly_light', cat: 'bond',
    when: function (ctx, a, b) { return !!wtRoles(ctx, a, b, 'light'); },
    w: function (ctx, a) { return 0.5 + a.tr.a * 0.2; },
    run: function (ctx, a, b) {
      var r = wtRoles(ctx, a, b, 'light');
      if (!r) return null;
      if (!r.cp) { ctx.mod(a, b, { aff: 2, trust: 1 }); return { text: fill(pk(ctx, LIGHT.pine), a, b), why: wtWhy(a, b, r.t, 'light', '：急がずに想う'), mag: 4 }; }
      var sp = ctx.rng() < 0.5;
      ctx.mod2(a, b, { trust: 3, ten: -2 }, { trust: 3, ten: -2 }); ctx.stress(a, -2); ctx.stress(b, -2);
      return { text: fill(pk(ctx, sp ? LIGHT.space[per(a)] : LIGHT.calm), a, b), why: wtWhy(a, b, r.t, 'light', sp ? '：互いの時間を大事にする' : '：連絡は少なくても変わらない'), mag: 4 };
    }
  });
  /* 恋人の日常（daily-kit.js の部品）：重い・軽いの分岐（関係 wtHeavy／wtLight。関係ごとの「出来事：起こさない」なら出さない） */
  var DL = HK.Daily;
  if (DL && DL.REL && DL.SPECS) {
    var wtDaily = function (want) { return function (ctx, a, b) { if ((ctx.env && ctx.env.tieEv === 'off') || !DL.REL.lovers(ctx, a, b)) return false; var t = wtTie(ctx, a, b); return !!t && t.type === 'lover' && t.heavy === want && t.noev !== 'off'; }; };
    DL.REL.wtHeavy = wtDaily('heavy');
    DL.REL.wtLight = wtDaily('light');
    var E = function (id, cat, w, fx, texts, meta) { DL.SPECS.push({ id: id, args: [id, cat, 'p', w, '', fx, texts], meta: meta }); };
    E('d_wt_heavy_wait', 'romance', 'np*.3+a*.2+.4', 'ab:att3,aff2;ba:aff2',
      '{a}は、{b}の帰りを玄関で待っていた。何度も時計を見ては、外の足音に耳を澄ませた。{a}「遅い。……心配した｜＝｜遅いです。……心配しました」|{b}が帰ってくるなり、{a}はその胸に飛び込んだ。{a}「おかえり。……今日はもう、どこにも行かないで｜おかえり。……今日はもう、どこにも行くな｜おかえりなさい。……今日はもう、どこにも行かないでください」|{a}は{b}が出かけているあいだ、何度も連絡を送っていた。帰ってきた{b}の顔を見て、{a}はようやく息をついた。',
      { at: 'home.entrance,home.living', tm: 'en', rel: 'wtHeavy' });
    E('d_wt_heavy_night', 'romance', 'np*.3+.4', 'ab:att3,aff2;ba:att2,aff2',
      '{a}は、眠る{b}の手を握ったまま、なかなか目を閉じられなかった。朝になったら{b}がいなくなっている気がして、怖かった。|{a}は{b}の背中にぴたりとくっついた。{b}「暑い｜＝｜暑いです」{a}「我慢して｜我慢しろ｜我慢してください」――{a}は少しも離れようとしなかった。|{a}「明日も、明後日も、ずっと一緒｜明日も、明後日も、ずっと一緒だ｜明日も、明後日も、ずっと一緒です」――{a}は{b}の返事を聞くまで、眠ろうとしなかった。',
      { at: 'home.bedroom,home.living', tm: 'n', rel: 'wtHeavy' });
    E('d_wt_light_own', 'bond', 'a*.3+ac*.2+.4', 'ab:trust3;ba:trust3;as:-3;bs:-3',
      '{a}と{b}は、休みの日をそれぞれの趣味に使った。夕方に顔を合わせると、今日あったことを少しだけ話した。|{a}は{b}からの短い連絡に、短く返した。それで足りるのが、二人の距離感だった。|{a}は{b}の誘いを「＠{a}＠今日は一人でいたい｜＝｜今日は一人でいたいです」と断った。{b}も「了解｜分かった｜分かりました」とだけ返した。それで気まずくなることはなかった。',
      { at: 'home.living,town.cafe,work.office', tm: 'de', rel: 'wtLight' });
    E('d_wt_light_meet', 'bond', 'np*.3+.4', 'ab:aff2,trust2;ba:aff2,trust2',
      '{a}と{b}は、久しぶりに一緒に食事をした。{b}「久しぶり｜久しぶりだな｜お久しぶりです」{a}「そうでもないよ｜そうでもない｜そうでもないですよ」――会わない日があっても、二人の空気は少しも変わらなかった。|{a}と{b}は、同じテーブルで別々の本を読んでいた。ときどき目が合うと、どちらからともなく小さく笑った。',
      { at: 'town.cafe,town.park,home.kitchen', tm: 'de', rel: 'wtLight' });
  }

  /* ======================= 家族の層の仲（kg） =======================
     親子・擬似親子は {a}＝親（親代わり）、{b}＝子。恩人は {a}＝恩人、{b}＝恩を受けた側。きょうだい・親族は出来事の二人のまま */
  var KG = {
    argue: {
      parent: L('{a}と{b}は、ささいなことで言い合いになった。親子だからこそ、言葉に遠慮がなかった。{a}「どうして、いつも私の話を最後まで聞かないの｜なぜ、いつも私の話を最後まで聞かない｜どうして、いつも私の話を最後まで聞かないんですか」{b}「聞いてるよ。聞いたうえで言ってる｜聞いている。聞いたうえで言っている｜聞いています。聞いたうえで言っているんです」|{a}は{b}のやり方に口を出し、{b}はそれに言い返した。昔から、この二人はこうだった。{b}「もう子どもじゃない｜もう子どもではない｜もう子どもではありません」'),
      sib: L('{a}と{b}は、昔のことを蒸し返して言い合いになった。どちらが先に手を出したのか、二人の記憶は食い違ったままだった。|{a}「いつもそうやって、自分だけ正しい顔をする｜＝｜いつもそうやって、自分だけ正しい顔をしますよね」{b}「そっちこそ｜そちらこそだ｜そちらこそです」――同じ家で育った二人の口喧嘩は、どこか似た調子だった。'),
      rel: L('{a}と{b}は、親戚の集まりでの昔の出来事を持ち出して、気まずい言い合いになった。どちらも、自分の覚えているほうが正しいと譲らなかった。|{a}「親戚だからって、何でも口を出していいわけじゃない｜親戚だからといって、何にでも口を出していいわけではない｜親戚だからといって、何にでも口を出していいわけではありません」{b}は不機嫌そうに黙り込んだ。'),
      bene: L('{b}は{a}の言葉に、思わず言い返した。{b}「恩は感謝してる。でも、それとこれとは別｜恩には感謝している。だが、それとこれとは別だ｜恩には感謝しています。でも、それとこれとは別です」{a}は眉をひそめて、黙り込んだ。|{a}「助けたからといって、何でも言うことを聞けとは言ってない｜助けたからといって、何でも言うことを聞けとは言っていない｜助けたからといって、何でも言うことを聞けとは言っていません」{b}「なら、放っておいて｜なら、放っておけ｜なら、放っておいてください」――恩のある二人の口論は、いつも同じところで行き詰まった。')
    },
    ignore: L('{a}は{b}に話しかけられても、聞こえないふりをした。{b}も、それ以上は何も言わなかった。|{a}と{b}は、同じ場所にいながら一言も口をきかなかった。周りのほうが、気まずそうにしていた。|{b}が差し出したものを、{a}は受け取らずに素通りした。{b}は黙って手を引っ込めた。'),
    reconcile: L('{a}と{b}は、長い沈黙のあとで、どちらからともなく口を開いた。{a}「……さっきは、言いすぎた｜＝｜……さっきは、言いすぎました」{b}「こっちも｜こちらもだ｜こちらこそです」――仲直りの言葉は短かったが、二人にはそれで十分だった。|{a}は{b}の好きなものを黙って差し出した。{b}は少し驚いてから受け取った。{b}「……ありがと｜……感謝する｜……ありがとうございます」――それが、二人なりの和解だった。|危ない場面で、{a}は迷わず{b}をかばった。そのあと二人は目を合わせ、気まずそうに、それでも少しだけ笑った。'),
    warm: {
      parent: L('{a}は{b}の話を、最後まで嬉しそうに聞いていた。{a}「{b}がそう決めたなら、応援する｜＝｜{b}がそう決めたなら、応援します」|{b}は{a}の肩をそっと揉んだ。{a}「急にどうしたの｜急にどうした｜急にどうしたんですか」{b}「たまには親孝行｜たまには親孝行だ｜たまには親孝行です」'),
      sib: L('{a}と{b}は、同じところで同時に笑い出した。きょうだいの笑いのツボは、昔から同じだった。|{a}は何も言わずに、{b}の分まで用意しておいた。{b}「さすが｜さすがだ｜さすがです」{a}「何年きょうだいやってると思ってるの｜何年きょうだいをやっていると思っている｜何年きょうだいをやっていると思っているんですか」'),
      rel: L('{a}と{b}は、親戚の誰それの近況を教え合って笑った。遠い親戚のはずが、話してみると妙に気が合った。|{a}「困ったら、いつでも頼って。親戚なんだから｜困ったら、いつでも頼れ。親戚なのだから｜困ったら、いつでも頼ってください。親戚なんですから」'),
      bene: L('{b}は{a}に、今日も小さな手伝いを申し出た。{a}は笑って、それを受けた。恩を返すというより、ただ一緒にいるのが楽しかった。|{a}「もう恩なんて気にしなくていいのに｜もう恩など気にしなくていい｜もう恩なんて気にしなくていいんですよ」{b}「気にしてるんじゃなくて、好きでやってる｜気にしているのではない。好きでやっている｜気にしているのではなく、好きでやっているんです」')
    }
  };
  TL.KG = KG;
  var KG_GRP = { parent: 'parent', pparent: 'parent', sibling: 'sib', sibprot: 'sib', relative: 'rel', benefactor: 'bene' };
  function kgRoles(ctx, a, b) {
    if (!b || !here(a) || !here(b) || ctx.pair(a, b).couple) return null;
    var l = all(ctx, a, b);
    for (var i = 0; i < l.length; i++) {
      var t = l[i]; if (!t.kg || !HK.KIN_GRADE[t.kg]) continue;
      var g = t.type === 'relative' && t.step ? 'sib' : KG_GRP[t.type];
      if (!g) continue;
      /* 向きのある関係（親子・恩人・兄弟（庇護））は関係の向きで、ほかは出来事の二人のまま */
      var D = HK.TIES[t.type], A = D && D.dir ? ctx.chars[t.a] : a, B = D && D.dir ? ctx.chars[t.b] : b;
      return { t: t, g: g, A: A, B: B };
    }
    return null;
  }
  function kgWhy(r, k) { return r.A.name + 'と' + r.B.name + 'は' + HK.tieLabel(r.t) + '（' + HK.KIN_GRADE[r.t.kg].short + '）：' + k; }
  push({
    id: 'tie_ly_kin', cat: 'conflict',
    when: function (ctx, a, b) { return !!kgRoles(ctx, a, b); },
    w: function (ctx, a, b) { var r = kgRoles(ctx, a, b); return r && r.t.kg === 'bad' ? 0.6 + a.tr.cp * 0.2 + a.tr.fc * 0.1 : 0.5 + a.tr.np * 0.2; },
    run: function (ctx, a, b) {
      var r = kgRoles(ctx, a, b);
      if (!r) return null;
      var A = r.A, B = r.B, m = ctx._kgC || (ctx._kgC = {}), key = keyOf(A, B), tx;
      if (r.t.kg === 'good') {
        ctx.mod2(A, B, { aff: 4, trust: 3 }, { aff: 4, trust: 3 }); ctx.stress(A, -2); ctx.stress(B, -2);
        tx = ctx.t(pk(ctx, KG.warm[r.g]), A, B);
        return { cat: 'bond', text: HK.Sib ? HK.Sib.fill(tx, A, B, null, ctx) : tx, why: kgWhy(r, '気安い時間'), mag: 6 };
      }
      /* 不仲：口論か無視。言い合いが重なると、和解することもある（和解のあとは数え直す） */
      var n = m[key] || 0, k;
      if (n >= 2 && ctx.rng() < 0.4) k = 'reconcile';
      else k = ctx.rng() < 0.62 ? 'argue' : 'ignore';
      if (k === 'reconcile') { m[key] = 0; ctx.mod2(A, B, { ten: -10, aff: 5, trust: 4 }, { ten: -10, aff: 5, trust: 4 }); ctx.stress(A, -4); ctx.stress(B, -4); }
      else { m[key] = n + 1; if (k === 'argue') ctx.mod2(A, B, { ten: 5, aff: -2 }, { ten: 5, aff: -2 }); else ctx.mod2(A, B, { ten: 3, trust: -1 }, { ten: 3, trust: -1 }); ctx.stress(A, 3); ctx.stress(B, 3); }
      tx = ctx.t(pk(ctx, k === 'argue' ? KG.argue[r.g] : KG[k]), A, B);
      return { cat: k === 'reconcile' ? 'bond' : 'conflict', text: HK.Sib ? HK.Sib.fill(tx, A, B, null, ctx) : tx, why: kgWhy(r, { argue: '口論', ignore: '無視', reconcile: '和解' }[k]), mag: k === 'reconcile' ? 10 : 8 };
    }
  });

  /* ======================= 元恋人の気持ち（feel・feelB） ======================= */
  var EXL = {
    awk: L('{a}は{b}と目が合うと、すぐに逸らした。別れてからの時間は、二人のあいだにまだ埋まらずにあった。|{a}は{b}に何か言いかけて、やめた。元恋人に何を話せばいいのか、{a}にはまだ分からなかった。|{a}「……久しぶり｜……久しぶりだな｜……お久しぶりです」――それ以上の言葉が続かず、{a}は気まずそうに視線を落とした。'),
    over: L('{a}は{b}に、昔の友達に話すように気軽に声をかけた。{a}「元気そうでよかった｜＝｜お元気そうでよかったです」――そこには、もうわだかまりはなかった。|{a}は{b}の前で、別れたころの話を笑い話にしてみせた。{a}「あのころは、二人とも若かったね｜あのころは、二人とも若かったな｜あのころは、二人とも若かったですね」|{a}は{b}の背中を軽く叩いた。{a}「今は、いい友達でいよう｜＝｜今は、いい友達でいましょう」――元恋人という言葉は、{a}の中ではもう過去のものだった。'),
    linger: L('{a}は{b}の横顔を盗み見て、まだ好きなのだと思い知らされた。別れたはずの想いは、少しも薄れていなかった。|{a}は、{b}が昔と同じ癖で髪に触れるのを見て、胸が苦しくなった。{a}「……変わってないね｜……変わっていないな｜……変わっていませんね」|{a}は{b}の隣に座って、言わずにいた言葉を飲み込みかけた。{a}「たまに思う。あのころに戻れたらって｜たまに思う。あのころに戻れたらと｜たまに思います。あのころに戻れたら、と」'),
    back: {
      awk: L('{b}もまた、どこを見ればいいのか分からないようだった。|{b}は曖昧に頷いて、その場を離れた。|{b}は小さく会釈しただけで、何も言わなかった。'),
      over: L('{b}「うん、そっちも元気で｜ああ、そちらも元気でな｜はい、そちらもお元気で」――{b}の笑顔には、もう迷いがなかった。|{b}は穏やかに笑って、{a}の言葉を受け流した。{b}にとって、二人のことはもう終わった話だった。'),
      linger: L('{b}は{a}の言葉に、一瞬だけ言葉を失った。{b}も、同じことを考えていた。|{b}「……私も、忘れてない｜……私も、忘れていない｜……私も、忘れていません」――二人のあいだに、昔と同じ沈黙が落ちた。')
    }
  };
  TL.EX = EXL;
  function exRoles(ctx, a, b) {
    if (!b || !here(a) || !here(b) || ctx.pair(a, b).couple) return null;
    var t = HK.Ties.has(ctx, a, b, 'ex');
    if (!t || t.type !== 'ex' || !(t.feel || t.feelB)) return null;
    return { t: t, fa: (t.a === a.i ? t.feel : t.feelB) || '', fb: (t.a === a.i ? t.feelB : t.feel) || '' };
  }
  function exShort(v) { return v ? HK.EX_FEEL[v].short : '気まずい'; }
  push({
    id: 'tie_ly_ex', cat: 'bond',
    when: function (ctx, a, b) { return !!exRoles(ctx, a, b); },
    w: function () { return 0.55; },
    run: function (ctx, a, b) {
      var r = exRoles(ctx, a, b);
      if (!r) return null;
      /* 未練は、その向きで恋愛が成り立つときだけ（成り立たなければ気まずさとして書く） */
      var ka = r.fa === 'linger' && !loveOk(ctx, a, b) ? '' : r.fa, kb = r.fb === 'linger' && !loveOk(ctx, a, b) ? '' : r.fb;
      var ta = ka === 'over' ? 'over' : ka === 'linger' ? 'linger' : 'awk', tb = kb === 'over' ? 'over' : kb === 'linger' ? 'linger' : 'awk';
      var cat = 'bond';
      if (ta === 'awk') ctx.mod2(a, b, { ten: 2 }, { ten: 2 });
      else if (ta === 'over') ctx.mod2(a, b, { ten: -4, aff: 3, trust: 2 }, tb === 'over' ? { ten: -4, aff: 3, trust: 2 } : { ten: -1, aff: 1 });
      else { ctx.mod(a, b, { att: 3, aff: 2 }); if (tb === 'linger') { ctx.mod(b, a, { att: 3, aff: 2 }); cat = 'romance'; } ctx.stress(a, 3); }
      var why = a.name + 'と' + b.name + 'は元恋人（' + a.name + '：' + exShort(r.fa) + '・' + b.name + '：' + exShort(r.fb) + '）' + { awk: '：別れたあとの気まずさ', over: '：ふっきれた距離', linger: '：消えない未練' }[ta];
      return { cat: cat, text: fill(pk(ctx, EXL[ta]), a, b) + fill(pk(ctx, EXL.back[tb]), a, b), why: why, mag: ta === 'linger' ? 8 : 5 };
    }
  });
})();
