/* 箱庭シミュレーター: 恐怖が和らぐ出来事（HK.FearSoften。族のかたまり pack-rel。両方のビルドに同じファイル。2026-11-03 利用者の指示）
   利用者の指示：「恋愛『あり』は、恐怖が和らぐ可能性があるという意味。和らいでいないのに恋愛していたら変なので、恋愛の出来事・恋人になるのは恐怖が和らいだあとだけ」
   ■ 決まり（docs/reports/2026-10-31/rel-consistency.md の「恐怖の二人」の節）
     ・関係「恐怖」（{a} が {b} を恐れる）の「恋愛：あり」は、恐怖が和らぐまで恋愛しない（engine.js の HK.fearHold。ties.js の HK.Ties.after・fam-kin.js の HK.fearNG が付ける）
     ・和らぐ＝cold-fear.js の組の表（ctx._cf・S._cf）で、和らいだ回数 p.soft が CF.SOFT_N（2）回に届いた（恋に転じたときはすぐ）。届いたら HK.fearRelease で止めを外す（p.freed）
     ・和らぐきっかけ：今までの「弱ったところを助けられた」（cf_tend）・「庇われた・救われた」（cf_moved）に、この 4 種を足す
         kind 相手の小さな優しさ／guard 危ないところを守られる／used 同じ場所にいることに慣れる／face 相手の素顔（怖くない一面）を見る
       「恋愛：あり」の恐怖の組だけに起きる（「恋愛：自動・なし」の恐怖は和らぐ見込みのない関係として、今までどおり）。脅し・暴力で恐怖が深まった区切り（p.thrAt）には起きない
     ・怖がっている側（{a}）の反応は態度 9 種 × 2 本以上。台詞は3本「くだけた常体｜硬い常体｜敬語」（一人称は「私」、二人称は「あなた」）。全年齢の文だけ
   ■ エンジン型は HK.COMMON の出来事（fs_soften）、物語型は HK.Story.step の後に一つまで（区切りごとに 14%）
   登場人物はすべて成人として扱う */
/* @labels
   fs_soften=恐れていた相手の優しさに恐怖が和らぐ
*/
/* @event scen=jashin,jinro,yakata,ship,locker,saimin,massage,rpg id=fs_story_soften cat=bond tie=fear label=恐れていた相手に少しずつ慣れていく */
(function () {
  'use strict';
  var HK = window.HK;
  if (!HK || !HK.addTo || !HK.wrap || !HK.COMMON || !HK.ColdFear) return;
  var CF = HK.ColdFear;
  function L(s) { return s.split('|'); }
  var FS = HK.FearSoften = {};
  FS.P_STORY = 0.14;
  /* ---------- 文 ---------- */
  /* 場面（{a}＝怖がっている側、{b}＝相手。性別・関係の語を使わない） */
  FS.SIT = {
    kind: L('{a}が重い荷物に手こずっていると、{b}が何も言わずに半分を持っていった。礼を言う間もなく、{b}はもう先を歩いていた。|' +
      '{a}が手を滑らせて物を落としたとき、{b}は怒るでもなく、黙って拾って差し出した。その手つきは、思っていたよりずっと静かだった。|' +
      '{a}の前に、飲み物が一つ置かれた。置いたのは{b}だった。{b}「少し休んだら？｜少し休んだらどうだ｜少し休んでください」――それだけ言って、{b}はすぐに離れていった。'),
    guard: L('足を滑らせかけた{a}の腕を、{b}がとっさに掴んだ。引き戻された{a}の目の前を、崩れた物が音を立てて落ちていった。|' +
      '険しい声で{a}に詰め寄る人がいた。その間に、{b}が黙って割って入った。{b}が一言返しただけで、相手は気まずそうに引き下がった。|' +
      '危ないものが転がってきたとき、{b}は{a}の前に半歩出て、それを足で止めた。{b}は振り返りもせず、短く聞いた。{b}「平気？｜平気か｜大丈夫ですか」'),
    used: L('気づけば、{a}は{b}と同じ場所で過ごす時間に、前ほど身構えなくなっていた。{b}がそばを通っても、肩がこわばらない日があった。|' +
      '{b}の足音を聞き分けられるようになって、{a}は、その足音がいつも急いでいないことに気づいた。急に近づいてくることは、一度もなかった。|' +
      '同じ空間で黙って過ごす時間が、何度も重なった。{b}は、{a}が距離を取ると、それ以上は近づかなかった。そのことを、{a}は少しずつ覚えていった。'),
    face: L('{a}は、{b}が一人のときに小さく息をつくのを見た。いつもの険しい顔ではなく、ただ疲れた人の顔だった。|' +
      '{b}が誰かの冗談に、つい吹き出していた。{a}は、{b}がそんなふうに笑うことを、初めて知った。|' +
      '{b}が、困っている誰かに手を貸していた。言葉はぶっきらぼうなのに、手つきは丁寧だった。{a}は、それを少し離れたところから見ていた。')
  };
  /* 怖がっている側の反応（態度 9 種 × 2〜3 本） */
  FS.RX = {
    proud: L('{a}は鼻を鳴らしてみせた。それでも、張りつめていた肩は、いつの間にか下りていた。{a}「……別に、怖くなんかないし｜……別に、怖くなどない｜……別に、怖くなんてありません」|' +
      '{a}は顔を背けたまま、小さく舌打ちをした。強がりの声は、前ほど震えていなかった。{a}「借りを作ったなんて、思わないから｜借りを作ったとは、思わない｜借りを作ったなんて、思いませんから」'),
    stern: L('{a}は表情を崩さなかった。ただ、相手を見張るように据えていた視線が、少しだけ緩んだ。{a}「……今のは、感謝しておく｜……今のは、感謝しておく｜……今のは、感謝しておきます」|' +
      '{a}は短く頷いた。警戒を解いたわけではない、と自分に言い聞かせながらも、拳はもう握られていなかった。{a}「見誤っていたのかもしれない｜見誤っていたのかもしれん｜見誤っていたのかもしれません」'),
    tsun: L('{a}はぷいと横を向いた。耳まで赤くなっているのは、怖さのせいではなかった。{a}「べ、別に、助かったなんて思ってないから｜べ、別に、助かったとは思っていない｜べ、別に、助かったなんて思っていませんから」|' +
      '{a}は口をとがらせて、そっぽを向いた。それでも、逃げ出しはしなかった。{a}「……少しは、ましな人なんだね｜……少しは、ましな人間らしい｜……少しは、ましな方なんですね」'),
    gentle: L('{a}は胸に手を当てて、ゆっくりと息を吐いた。怖さの奥に、温かいものが少しだけ混じっていた。{a}「……ありがとう。ちょっと、ほっとした｜……ありがとう。少し、安心した｜……ありがとうございます。少し、ほっとしました」|' +
      '{a}は、こわばっていた指をそっとほどいた。相手の背中を見る目が、前より柔らかかった。{a}「怖いばかりの人じゃ、ないのかも｜怖いばかりの人では、ないのかもしれない｜怖いばかりの人では、ないのかもしれませんね」'),
    devoted: L('{a}は小さく頭を下げた。その仕草には、怯えよりも、何かを返したいという気持ちがにじんでいた。{a}「何か、{一人称}にできることがあったら言って｜何か、{一人称}にできることがあれば言ってくれ｜何か、{一人称}にできることがあったら言ってください」|' +
      '{a}は、ぎゅっと唇を結んだ。怖がってばかりいた自分が、少し恥ずかしかった。{a}「今度は、{一人称}が手伝う番だね｜今度は、{一人称}が手伝う番だな｜今度は、{一人称}がお手伝いする番ですね」'),
    cool: L('{a}は黙ったまま、相手の様子を観察した。怖がる理由を一つずつ数え直して、思っていたより少ないことに気づいた。{a}「……前ほどは、警戒しなくていいみたい｜……前ほどは、警戒しなくてよさそうだ｜……前ほどは、警戒しなくてよさそうです」|' +
      '{a}は肩をすくめた。淡々とした顔の下で、張りつめていた糸が一本だけ切れていた。{a}「認識を改めておく｜認識を改めておく｜認識を改めておきます」'),
    free: L('{a}は気の抜けたように笑った。笑えたことに、自分でも少し驚いていた。{a}「なーんだ、そういうとこもあるんだ｜なんだ、そういうところもあるのか｜なんだ、そういうところもあるんですね」|' +
      '{a}は大きく伸びをした。体のこわばりが、伸びと一緒にほどけていった。{a}「ちょっとだけ、見直したかも｜少しだけ、見直したかもしれない｜ちょっとだけ、見直したかもしれません」'),
    shy: L('{a}は俯いたまま、指先をもじもじと動かした。逃げ出したい気持ちは、いつの間にか小さくなっていた。{a}「……あ、ありがとう｜……あ、ありがとう｜……あ、ありがとうございます」|' +
      '{a}はそっと顔を上げ、すぐにまた目を伏せた。それでも、一歩後ずさることはしなかった。{a}「……思ってたより、こわくない、かも｜……思っていたより、こわくない、かもしれない｜……思っていたより、こわくない、かもしれません」'),
    polite: L('{a}は丁寧に頭を下げた。礼の言葉は、いつもの形式ばった響きより、少しだけ素直だった。{a}「助かった。本当にありがとう｜助かった。本当に感謝する｜助かりました。本当にありがとうございます」|' +
      '{a}は、乱れた息を整えてから、相手に向き直った。声は、もう震えていなかった。{a}「これまで、失礼な態度だったかもしれない｜これまで、失礼な態度だったかもしれない｜これまで、失礼な態度だったかもしれません」')
  };
  /* 結び（和らいだ） */
  FS.END = L('{a}の中で、{b}への怖さが、ほんの少しだけ形を変えた。|{a}は、{b}をただ怖いだけの人として見るのを、少しだけやめた。|怖さが消えたわけではない。それでも、{a}は前より楽に息ができた。');
  /* 止めが外れたとき（和らいだと言える）の結び */
  FS.FREE = L('{a}はもう、{b}の姿を見ても身をすくめなかった。怖さのあった場所に、別の何かが入り込みはじめていた。|{b}がそばにいても、{a}の鼓動は前のように跳ねなかった。跳ねるとしたら、それは別の理由だった。|{a}の中で、{b}はもう「怖い人」ではなくなりつつあった。');
  var KJA = { kind: '相手の小さな優しさ', guard: '危ないところを守られた', used: '同じ場所にいることに慣れた', face: '相手の怖くない一面を見た' };
  FS.KJA = KJA;

  /* ---------- 選び方 ---------- */
  function fearOn(p) { return CF.fearOn ? CF.fearOn(p) : p.type === 'fear'; }
  /* 和らぎうる組：恐怖が続いている「恋愛：あり」の組で、まだ止めが外れていない。逃れた・同じ区切りで脅された組は除く */
  function okP(p, step) { return !!(p && p.type === 'fear' && p.lv && !p.freed && fearOn(p) && p.st !== 'fled' && p.thrAt !== step && !(p.fsAt != null && step - p.fsAt < 2)); }
  function kindOf(Z, p) {
    var ks = ['kind', 'guard', 'used', 'face'], last = p.fsK;
    var l = ks.filter(function (k) { return k !== last; });
    /* 慣れるのは、和らぐのが二度目以降か、少し時間が経ってから */
    if (!(p.soft || 0) && (p.fsN || 0) < 1) l = l.filter(function (k) { return k !== 'used'; });
    return l[Math.floor(Z.rng() * l.length)];
  }
  /* 第三者の出る文（「誰か」「詰め寄る人」）は、その場に三人以上いるときだけ（二人きりの部屋に第三者を出さない） */
  var THIRD = /誰か|人がいた/;
  function crowd(Z) {
    var L0 = CF.isCtx(Z) ? Z.present() : (Z.P || []).filter(function (q) { return q && CF.here(q); });
    return L0.length >= 3;
  }
  FS.sit = function (Z, k) { var l = FS.SIT[k] || []; if (!crowd(Z)) { var f = l.filter(function (t) { return !THIRD.test(t); }); if (f.length) l = f; } return l; };
  function text(Z, p, a, b, k, freed) {
    var m = { a: a, b: b }, per = CF.per(a);
    return CF.fill(CF.pickOf(Z, FS.sit(Z, k)), m) + CF.fill(CF.pickOf(Z, FS.RX[per] || FS.RX.gentle), m) + CF.fill(CF.pickOf(Z, freed ? FS.FREE : FS.END), m);
  }
  /* 和らぐ（組の表の値・止め）。理由の欄の文を返す */
  function apply(Z, p, a, b, k) {
    p.fsAt = CF.isCtx(Z) ? Z.stepIndex : (Z._cfStep || 0); p.fsK = k; p.fsN = (p.fsN || 0) + 1;
    if (CF.isCtx(Z)) { CF.raw(Z, a, b, { ten: -10, trust: 6, aff: 4 }); CF.fearEnd(Z, p, 'eased'); }
    else { p.st = 'eased'; Z.relD = Z.relD || {}; var rk = a.i < b.i ? a.i + '-' + b.i : b.i + '-' + a.i; Z.relD[rk] = Math.max(-1, Math.min(1, (Z.relD[rk] || 0) + 0.06)); }
    if (!p.end || p.end === 'deep') CF.endNote(Z, p, 'eased');
    var add = CF.soften(Z, p);
    CF.note(Z, p, 'soft_' + k);
    return { why: '恐怖の変化：' + a.name + 'の' + b.name + 'への恐怖が、少し和らいだ（' + KJA[k] + '）' + add, freed: !!add };
  }
  FS.apply = apply;

  /* ---------- エンジン型 ---------- */
  function pairE(ctx, a) {
    var m = ctx._cf; if (!m || !CF.here(a)) return null;
    for (var key in m) {
      var p = m[key]; if (p.h !== a.i || !okP(p, ctx.stepIndex)) continue;
      var b = ctx.chars[p.t];
      if (!CF.here(b) || ctx.others(a).indexOf(b) < 0) continue;
      return { p: p, b: b };
    }
    return null;
  }
  HK.addTo(HK.COMMON, [{
    id: 'fs_soften', label: '恐れていた相手の優しさに恐怖が和らぐ', cat: 'bond', scope: 'solo', tie: 'fear', noOdd: true,
    when: function (ctx, a) { return !!pairE(ctx, a); },
    w: function (ctx, a) { var x = pairE(ctx, a); if (!x) return 0; var t = CF.trOf(x.b); return 1.2 + t.np * 1.6 + (t.warmth || 0) * 0.8; },
    run: function (ctx, a) {
      var x = pairE(ctx, a); if (!x) return null;
      var k = kindOf(ctx, x.p), r = apply(ctx, x.p, a, x.b, k);
      return { with: [x.b], cat: 'bond', text: text(ctx, x.p, a, x.b, k, r.freed), why: r.why, mag: 12 };
    }
  }]);

  /* ---------- 物語型（区切りの見出しのあとに、一つまで） ---------- */
  function hereS(p) { return !!p && CF.here(p) && !p.bound && !p.locked && !p.mad && !p.away && !p.panic && !p.out; }
  FS.storyStep = function (S) {
    if (!S || !S._cf || !S.P || S._fsBusy || !HK.Story || !HK.Story.say) return;
    var step = S._cfStep || 0, ks = Object.keys(S._cf);
    for (var i = 0; i < ks.length; i++) {
      var p = S._cf[ks[i]], a = S.P[p.h], b = S.P[p.t];
      if (!okP(p, step) || !hereS(a) || !hereS(b) || S.rng() >= FS.P_STORY) continue;
      var k = kindOf(S, p);
      S._fsBusy = true;
      try {
        var r = apply(S, p, a, b, k);
        HK.Story.say(S, { actors: [a, b], tag: '恐怖の和らぎ', text: text(S, p, a, b, k, r.freed), why: r.why, mag: 12 });
      } finally { S._fsBusy = false; }
      return;
    }
  };
  if (HK.Story && HK.Story.step) HK.wrap(HK.Story, 'step', function (prev) {
    return function (S) { var r = prev.apply(this, arguments); try { FS.storyStep(S); } catch (e) { if (HK.DEBUG) throw e; } return r; };
  });
})();
