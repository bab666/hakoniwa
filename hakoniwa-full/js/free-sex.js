/* 箱庭シミュレーター: 恋愛相手を固定し、性行為の相手を「誰とでも可（恋愛は固定のまま）」にした人（engine.js の HK.lockSexOnly）の、
   固定外の相手との「体だけの場面」の共通部品（全箱庭。エンジン型 ctx と物語型 S のどちらでも使える）
   ・HK.State.freeSex(ctx, a, b)：体だけの場面にしてよい組か。a か b が「誰とでも可」で固定外の相手（HK.lockSexOnly）で、
       受け攻めと恋愛対象の性別（HK.Pos.okSex）・両方 R18 に参加（全年齢版・全年齢モードでは常に偽）・その場にいる（HK.State.pairSex）、
       体の関係の縛り（HK.sexBlocked：恋愛・R18にしない相手・同じ人の恋人どうし・恋人だけ・〇〇だけ・一途。同一人物は縛らない）を通る組。
       恋愛相手の固定（HK.canLove）は見ない（体だけの関係なので）。家族の「恋愛：なし」（エンジン型は ctx.pair().kin、物語型は ng）・先生・未成年は止める
   ・HK.FreeSex.factor(ctx, a, b)：固定した恋人がその場にいれば 0.3（起きにくくする）
   ・HK.FreeSex.lead(ctx, a, b)：導入の一文。「恋ではない」ことが分かる文（「誰とでも可」の人の態度9種 × 3文以上）
   ・HK.FreeSex.mark(ctx, a, b)：体の場面のあと。エンジン型は夜（pf.night）と体だけの関係（pf.fwb：記録の札「体だけの関係に」）の印を付け、恋人にはしない
       （惹かれを恋愛の手前で止めるのは engine.js の sexOnlyFix）。物語型は S.freeSex に回数を残す
   ・HK.FreeSex.jealous(ctx, a, b)：固定した恋人が気づいたら、嫉妬の出来事（cat 'conflict'。恋愛の出来事ではない）
   登場人物はすべて成人として扱う。攻めを選んだ人を受けにしないのは、各箱庭の夜の文（HK.Pos.order）に任せる */
(function () {
  'use strict';
  var HK = window.HK;
  if (!HK || !HK.State) return;
  function L(s) { return s.split('|'); }
  function eng(ctx) { return !!(ctx && HK.Ctx && ctx instanceof HK.Ctx); }
  function people(ctx) { return (ctx && (ctx.chars || ctx.P)) || []; }
  function rnd(ctx) { return ctx && ctx.rng ? ctx.rng() : Math.random(); }
  function pick(ctx, arr) {
    if (eng(ctx)) return ctx.pick(arr);
    if (HK.Story && HK.Story.pick && ctx && ctx.recent) return HK.Story.pick(ctx, arr);
    return arr[Math.floor(rnd(ctx) * arr.length)];
  }
  function fill(t, a, b) { return String(t).replace(/\{a\}/g, a.name).replace(/\{b\}/g, b.name); }
  /* 固定外の相手と体の関係を持つ側（相手以外に恋愛相手を固定している人） */
  function freeOne(a, b) { return HK.lockOut(a, b) ? a : b; }

  HK.State.freeSex = function (ctx, a, b) {
    if (!a || !b || a === b || HK.SAFE_ON) return false;
    if (!(HK.lockSexOnly && HK.lockSexOnly(a, b))) return false;
    if (!HK.State.pairSex(a, b)) return false;
    if (HK.sexBlocked && HK.sexBlocked(a, b)) return false;
    if (a.role === 'teacher' || b.role === 'teacher' || a.minor || b.minor) return false;
    if (eng(ctx) && ctx.pair(a, b).kin) return false;
    return true;
  };
  HK.sexFree = HK.State.freeSex;

  var F = HK.FreeSex = {};
  /* 固定した恋人（その場にいる人）。いなければ null */
  /* 恋愛相手の固定は複数人を持てる（HK.locks）。notI がその中にいれば固定外ではないので null。いれば、その場にいる最初の一人 */
  F.loverOf = function (ctx, x, notI) {
    if (!x || !HK.lockAny(x)) return null;
    var L = HK.locks(x), P = people(ctx);
    if (L.indexOf(notI) >= 0) return null;
    for (var k = 0; k < L.length; k++) { var y = P[L[k]]; if (y && y !== x && HK.State.here(y)) return y; }
    return null;
  };
  F.factor = function (ctx, a, b) {
    return F.loverOf(ctx, a, b.i) || F.loverOf(ctx, b, a.i) ? 0.3 : 1;
  };

  /* r18:begin */
  /* 導入：恋ではないと分かる一文（{a}＝固定外の相手と体の関係を持つ人、{b}＝相手）。態度9種 */
  F.LEAD = {
    proud: L('{a}は「勘違いしないで。気持ちは別のところにある」と先に言い切った。{b}は肩をすくめて、それで構わないと答えた。|{a}にとって、心を預ける相手はひとりだけだった。体のほうは、また別の話だと割り切っていた。|「惚れたわけじゃない。今夜はそういう気分なだけ」――{a}の言葉に、{b}は笑って頷いた。|{a}は本気の相手の顔を一瞬だけ思い浮かべて、すぐに追い払った。これは、そういうことではない。'),
    stern: L('{a}は自分の中で線を引いた。想う相手はひとり。これはこれ、と割り切った。|「心までは渡せない。それでいいなら」――{a}は{b}の目を見て、静かにそう告げた。|恋ではない。{a}はそれを確かめるように一度目を閉じてから、{b}に向き直った。'),
    tsun: L('「べ、別に好きとかじゃないから。そこは勘違いしないで」――{a}は早口でそう言って、{b}から目を逸らした。|{a}の本命は、とっくに決まっている。それとこれとは別だと、{a}は自分に言い聞かせた。|「今夜だけ。気持ちは別のとこにあるんだからね」――{b}は「はいはい」と笑った。'),
    gentle: L('{a}の心は、もう決まった人のところにある。{b}もそれを知っていて、ただ今夜の熱だけを分け合うことにした。|「好きな人はね、別にいるの。それでもいい？」――{a}が穏やかに訊くと、{b}は迷わず頷いた。|恋とは違う、と{a}は思った。それでも、誰かの体温がほしい夜はある。'),
    devoted: L('{a}が心を捧げている相手は、ひとりだけだった。今夜のことは、それとは別の場所に置いておくことにした。|「気持ちは、あの人のものです。……それでも、よければ」――{a}の言葉に、{b}は黙って頷いた。|{a}は胸の中で、想う人の名前をそっとしまった。今夜は、体だけのことだった。'),
    cool: L('{a}は冷静だった。気持ちは別のところにある。これは欲の処理で、恋ではない。|「恋愛感情は持ち込まない。それが条件」――{a}の淡々とした声に、{b}は「了解」とだけ返した。|{a}の中で、心と体ははっきり別の棚に分けてあった。今夜使うのは、体のほうだけだった。'),
    free: L('「好きな人は別にいるけど、それはそれ！」――{a}はあっけらかんと笑って、{b}の腕を引いた。|{a}にとって、恋と体は別の遊びだった。{b}も、そういう軽さが嫌いではなかった。|「付き合うとかじゃないよ？　今夜楽しいだけ」――{a}の言葉に、{b}は吹き出した。'),
    shy: L('{a}の好きな人は、ひとりだけだった。恋ではないことだけは、{a}にもはっきり分かっていた。それでも今夜は、{b}の熱から離れられなかった。|「あの、気持ちは……別のところに、あって……」――消え入りそうな{a}の声に、{b}は「分かってる」と答えた。|{a}は真っ赤になりながら、これは恋じゃない、と心の中で何度も繰り返した。'),
    polite: L('「心に決めた方がおりますので、今夜のことはどうかお気になさらず」――{a}の丁寧な前置きに、{b}は小さく笑った。|{a}は礼儀正しく線を引いた。お慕いしている方はひとり。これは、それとは別のことだった。|「恋ではございません。それでもよろしければ」――{a}はそう言って、{b}の手に指を重ねた。')
  };
  F.persona = function (c) {
    var k = (c && c.persona) || (HK.personaOf && HK.personaOf(c)) || 'gentle';
    return F.LEAD[k] ? k : 'gentle';
  };
  F.lead = function (ctx, a, b) {
    var x = freeOne(a, b), y = x === a ? b : a;
    return fill(pick(ctx, F.LEAD[F.persona(x)]), x, y);
  };
  F.why = function (a, b) {
    var x = freeOne(a, b);
    return x.name + 'は性行為の相手を「誰とでも可」にしている（恋愛は固定のまま。体だけの関係）';
  };
  /* r18:end */

  F.mark = function (ctx, a, b) {
    if (eng(ctx)) {
      var pf = ctx.pair(a, b);
      pf.night = true; pf.fwb = true; pf.couple = false; pf.since = null;
      pf.freeSex = (pf.freeSex || 0) + 1;
      return pf;
    }
    var k = Math.min(a.i, b.i) + '-' + Math.max(a.i, b.i);
    ctx.freeSex = ctx.freeSex || {};
    ctx.freeSex[k] = (ctx.freeSex[k] || 0) + 1;
    return null;
  };

  /* r18:begin */
  /* 固定した恋人が気づく（{a}＝恋人、{b}＝固定外の相手と夜を過ごした人、{c}＝その相手） */
  F.JEAL = L('{a}は、{b}が{c}と夜を過ごしたことに気づいた。体だけのことだと分かっていても、胸の奥がざらついた。|{b}の首筋に残った痕を、{a}は見逃さなかった。{a}は何も言わずに、{c}のほうを一度だけ見た。|「……{c}と、だよね｜……{c}と、なのか｜……{c}と、ですよね」――{a}の問いに、{b}は隠さずに頷いた。決まりの上では許していても、{a}の顔は笑っていなかった。|{a}は、{c}の隣に座る{b}を見ないようにした。それでも、目が勝手にそちらへ行った。|{b}の言い分は分かっていた。気持ちは自分のところにある、と。{a}はそれでも、{c}への苛立ちを飲み込めなかった。');
  F.jealous = function (ctx, a, b) {
    var x = freeOne(a, b), z = x === a ? b : a, y = F.loverOf(ctx, x, z.i);
    if (!y || y === z) return null;
    var jl = y.tr && y.tr.jealous != null ? y.tr.jealous : 0.4;
    if (rnd(ctx) > 0.15 + jl * 0.5) return null;
    var text = pick(ctx, F.JEAL).replace(/\{a\}/g, y.name).replace(/\{b\}/g, x.name).replace(/\{c\}/g, z.name);
    var why = y.name + 'は、恋愛相手に決めた' + x.name + 'が' + z.name + 'と体の関係を持ったことに気づいた（嫉妬 ' + Math.round(jl * 100) + '）';
    if (eng(ctx)) {
      var k0 = ctx.k; ctx.k = 1;
      ctx.mod(y, z, { ten: 12, aff: -6 }); ctx.mod(y, x, { ten: 5 });
      ctx.pair(y, z).jealous++;
      ctx.stress(y, 8);
      ctx.k = k0;
      /* 出来事の途中で呼ばれるので、いまの出来事のあとに出す（engine.js の pending・flush） */
      var o = { kind: 'event', cat: 'conflict', actors: [y, x, z], text: text, why: why, mag: 14 };
      (ctx.pending = ctx.pending || []).push(o);
      return o;
    }
    if (HK.Story && HK.Story.say) return HK.Story.say(ctx, { actors: [y.i, x.i, z.i], tag: '嫉妬', text: text, why: why });
    return null;
  };
  /* r18:end */
})();
