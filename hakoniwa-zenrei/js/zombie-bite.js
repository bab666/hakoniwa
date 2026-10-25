/* 箱庭シミュレーター: ゾンビの街 ― ゾンビに襲われるトラブルと、咬まれたときの対処
   ・Z_TROUBLE：日常のすきまで突然ゾンビに襲われる出来事（30種類）。切り抜ける・戦う・けが・咬まれる・仲間が助ける
   ・咬まれたその場での仲間の反応（止血・その場で切断・武器を向ける・否定する・抱きしめる）
   ・咬まれたと知ったあとの選択肢を追加（仲間を逃がす盾になる・想いを告げる・最後の伝言・戦い抜く・持ち物を託す・最後の夜） */
(function () {
  'use strict';
  var HK = window.HK, Z = HK.ZB, scen = Z && Z.scen;
  if (!scen) return;
  var EV = scen.events;
  function L(s) { return s.split('|'); }
  function wname(c) { return c.weapon ? c.weapon.name : '素手'; }
  function luck(ctx, c) { return ctx.stat(c, 'luck'); }
  function tieT(ctx, a, b) { var t = HK.Ties && HK.Ties.get(ctx, a, b); return t ? (t.like || t.type) : ''; }
  function fill(t, m) { return t.replace(/\{(\w+)\}/g, function (x, k) { return m[k] != null ? m[k] : x; }); }
  function sayOf(ctx, c, T) { var l = T[c.persona] || T.gentle; return c.name + ctx.pick(l); }

  /* ======================= 突然のトラブル ======================= */
  /* [場面, 危険度 0〜1] {a} 襲われる人 {area} 場所 */
  var TROUBLE = [
    ['{a}が{area}で冷蔵庫を開けた瞬間、中に押し込まれていたゾンビが倒れかかってきた。', 0.55],
    ['{area}のトイレの個室から、ドアの下を這って腕が伸び、{a}の足首を掴んだ。', 0.6],
    ['{a}が死体だと思ってまたいだものが、目を開けた。', 0.65],
    ['エレベーターの扉が開いた。中には、ぎっしりとゾンビが詰まっていた。', 0.7],
    ['{area}の天井の板が抜け、ゾンビが{a}の真上に落ちてきた。', 0.65],
    ['{a}のポケットで、電源を切り忘れたスマホが大音量で鳴った。{area}じゅうのゾンビが振り向いた。', 0.6],
    ['{area}の駐車場で、{a}が触れた車の防犯アラームが鳴り響いた。', 0.55],
    ['{a}が{area}の角を曲がると、子どもの姿をしたゾンビが立っていた。{a}の手が、一瞬止まった。', 0.6],
    ['{area}の自動ドアが、停電から復旧して勝手に開いた。外にいた群れが、なだれ込んできた。', 0.7],
    ['{a}がくしゃみをこらえきれなかった。{area}の静寂が破れた。', 0.5],
    ['{area}の階段で、上からも下からも呻き声が近づいてきた。{a}は挟まれた。', 0.75],
    ['{a}が床下収納を開けると、そこには隠れたまま発症した誰かがいた。', 0.6],
    ['{area}で、{a}は助けを求める声を聞いて駆けつけた。声の主は、もう人間ではなかった。', 0.6],
    ['ゾンビになった犬が、{area}の茂みから{a}に飛びかかってきた。', 0.65],
    ['{a}が{area}で物資を漁っていると、背後の棚がゆっくり倒れてきた。棚の向こうに、ゾンビがいた。', 0.55],
    ['{area}の窓ガラスが割れ、ゾンビの腕が{a}の髪を掴んだ。', 0.6],
    ['{a}が寝ていた部屋のドアノブが、ゆっくりと回った。', 0.55],
    ['{area}のマンホールの蓋が持ち上がり、下水からゾンビが這い出してきた。', 0.55],
    ['{a}は{area}のバスの中に隠れようとした。座席の陰で、乗客たちがまだ座っていた。全員、こちらを向いた。', 0.7],
    ['{area}で、車の下からゾンビの手が伸びて{a}のすねを掴んだ。', 0.6],
    ['{a}が見張り台にしていた{area}の屋上の扉を、内側から何かが叩き始めた。', 0.6],
    ['倒したはずのゾンビが、{a}が背を向けた瞬間に起き上がった。頭を外していたのだ。', 0.65],
    ['{area}のプールで水を汲もうとした{a}の手を、水底から伸びた手が引きずり込もうとした。', 0.65],
    ['{a}がバリケード代わりに積んだ家具が、ゾンビの重みで崩れ始めた。', 0.6],
    ['{area}に、ヘリの音を追ってきた群れが流れ込んできた。{a}の逃げ道が塞がれた。', 0.7],
    ['{a}が{area}で見つけた生存者は、腕を隠していた。話している途中で、その目が白く濁った。', 0.65],
    ['夜明け前の霧の中、{a}は{area}でゾンビとぶつかった。一メートルも離れていなかった。', 0.6],
    ['{a}が{area}で拾った缶詰の山が崩れ、甲高い音が響いた。', 0.5],
    ['{area}の病院のベッドで、シーツをかぶった遺体が起き上がった。', 0.65],
    ['{a}が{area}で水を飲んでいると、水面に、背後に立つ影が映った。', 0.6]
  ];
  var OUT = {
    escape: L('{a}は息を止めて後ずさり、扉を閉めて全体重でふさいだ。|{a}は持っていた荷物を投げつけ、その隙に駆け抜けた。|{a}は窓から飛び降りて、植え込みに転がり込んだ。足首が痛んだが、咬まれてはいない。|{a}は咄嗟に死んだふりをした。ゾンビは{a}の上を通り過ぎていった。'),
    fight: L('{a}は{w}を振り下ろした。一撃で、頭が砕けた。|{a}は{w}で喉元を突き、倒れたところで頭を潰した。手が震えていた。|{a}は叫び声を上げて{w}を振り回し、三体を倒してようやく息をついた。|{a}は相手の顎を押さえて{w}を突き立てた。生温かいものが手を伝った。'),
    hurt: L('{a}は振りほどいたが、転んだ拍子に額を割った。|{a}はどうにか逃げ切ったが、爪で腕を深く裂かれていた。咬まれてはいない――たぶん。|{a}は逃げる途中で釘を踏み抜いた。'),
    save: L('――{b}が横から{bw}で殴りつけ、ゾンビを{a}から引き剥がした。「ぼーっとするな！」|――{b}が{a}の襟首を掴んで引き戻した。ゾンビの歯が、{a}の鼻先で空を噛んだ。|――{b}の投げた消火器が、ゾンビの頭に命中した。{b}は「借りは返せよ」と言った。')
  };
  var SHOUT = {
    proud: L('「どけ！」|「来るなら来い！」|「ちっ、しつこい！」'),
    stern: L('「下がれ！」|「落ち着け……一体ずつだ」|「構えろ！」'),
    tsun: L('「ちょ、来ないでってば！」|「やだやだやだ、あっち行って！」|「な、何よもう！」'),
    gentle: L('「ごめんね……っ！」|「みんな、下がって！」|「お願い、来ないで……！」'),
    devoted: L('「み、みんなには触らせません！」|「私が引きつけます！」|「逃げてください！」'),
    cool: L('「数は三。行ける」|「頭を狙う。それだけだ」|「退路は右だ」'),
    free: L('「うわーっ！　無理無理無理！」|「ちょっと待って聞いてない！」|「こっちこっち！　走って！」'),
    shy: L('「ひっ……！」|「い、いや……っ、こないで……！」|「た、たすけて……！」'),
    polite: L('「失礼いたします……っ！」|「お下がりください！」|「申し訳ございませんが、お引き取りを！」')
  };

  EV.push({
    id: 'z_trouble', cat: 'combat', scope: 'solo',
    when: function (ctx, a) { return !a.out && ctx.zb.A[a.z.area].z > 8; },
    w: function (ctx, a) { var A = ctx.zb.A[a.z.area]; return (0.8 + A.z / 100 * 2.6) * (Z.part(ctx) === 3 ? 1.3 : 1) * (1 - A.bar * 0.5) * (a.action.id === 'loot' || a.action.id === 'hunt' ? 1.3 : 1); },
    run: function (ctx, a) {
      var rng = ctx.rng, A = ctx.zb.A[a.z.area], mates = Z.here(ctx, a);
      var tr = HK.weighted(rng, TROUBLE, function (x, i) { return 1 / (1 + ((ctx.zb.trUsed || {})[i] || 0) * 3); });
      var ti = TROUBLE.indexOf(tr); ctx.zb.trUsed = ctx.zb.trUsed || {}; ctx.zb.trUsed[ti] = (ctx.zb.trUsed[ti] || 0) + 1;
      /* 襲われるのは、ときどき一緒にいる誰か */
      var v = mates.length && rng() < 0.3 ? rng.pick(mates) : a;
      var m = { a: v.name, area: A.name, w: wname(v) };
      var t = fill(tr[0], m) + (rng() < 0.45 ? sayOf(ctx, v, SHOUT) : '');
      var danger = tr[1] * (0.8 + A.z / 250) * (Z.part(ctx) === 3 ? 1.15 : 1);
      var skill = luck(ctx, v) * 0.05 + (v.weapon ? v.weapon.pow : 0) * 0.035 + v.tr.a * 0.1 + v.tr.caution * 0.08 + (v.hp / 100) * 0.12 + rng() * 0.55;
      var why = A.name + 'のゾンビの多さ（' + Math.round(A.z) + '）／' + v.name + 'の運・武器・冷静さ';
      var actors = [v].concat(mates.filter(function (o) { return o !== v; })).concat(v !== a ? [a] : []);
      actors = actors.filter(function (c, i) { return actors.indexOf(c) === i; });
      ctx.stress(v, 10);
      var gap = skill - danger * HK.Dark.pick(ctx, 0.8, 1, 1.6);   /* 展開の重さ（mood-dial.js） */
      if (gap > 0.12) {
        var fight = v.tr.aggr + (v.weapon ? v.weapon.pow * 0.06 : 0) > 0.55 && rng() < 0.7;
        t += fill(ctx.pick(fight ? OUT.fight : OUT.escape), m);
        if (fight) { v.z.kills++; A.z = Math.max(0, A.z - 2); }
        return { with: actors, text: t, why: why + '：切り抜けた', mag: 14 };
      }
      /* 仲間が助けに入る */
      var helper = mates.filter(function (o) { return o !== v && ctx.R(o, v).aff > 10 && o.tr.aggr + o.tr.np > 0.7; }).sort(function (x, y) { return ctx.R(y, v).aff - ctx.R(x, v).aff; })[0];
      if (helper && rng() < HK.Dark.live(ctx, 0.45 + ctx.R(helper, v).aff / 250, 'kill')) {
        t += fill(ctx.pick(OUT.save), { a: v.name, b: helper.name, bw: wname(helper) });
        ctx.mod(v, helper, { aff: 10, trust: 14 });
        return { with: actors, text: t, why: why + '／' + helper.name + 'がとっさに助けた（' + v.name + 'への好意 ' + Math.round(ctx.R(helper, v).aff) + '）', mag: 22 };
      }
      if (gap > -0.12) {
        v.hp -= 8 + rng.int(12); if (v.z.wound < 0) v.z.wound = ctx.stepIndex;
        t += fill(ctx.pick(OUT.hurt), m);
        return { with: actors, text: t, why: why + '：けがを負った（化膿すると危ない）', mag: 18 };
      }
      /* まれに、犯される展開になる（R18版のみ。襲われる人が「攻め」指定でないときだけ） */
      if (Z.ZA_TEXT && Z.zombieAssault && Z.loveLv(ctx) !== 'off' && (!HK.Content || HK.Content.ok(ctx, 'force')) && !(HK.Pos && !HK.Pos.canReceive(v)) && !(HK.State && !HK.State.mobSexOk(v)) && !v.z.zassault && rng() < (0.1 + (Z.part(ctx) === 3 ? 0.05 : 0)) * (ctx.env.zlust == null ? 1 : ctx.env.zlust / 50) * HK.Dark.f(ctx, 'raid')) {
        v.z.zassault = true; v.flags.mobHit = { at: ctx.stepIndex, by: 'ゾンビ' };
        var ra = Z.zombieAssault(ctx, v, [a].concat(mates).filter(function (o, i, arr) { return o !== v && arr.indexOf(o) === i; }), A);
        ra.with.forEach(function (x) { if (actors.indexOf(x) < 0) actors.push(x); });
        return { with: actors, text: t + ra.text, why: why + '／' + ra.why, mag: ra.mag };
      }
      /* 咬まれる（身代わり・見捨てる・囮などは群れのときと同じ判定） */
      var res = Z.victim(ctx, [v].concat(mates.filter(function (o) { return o !== v; })), v, A);
      res.with.forEach(function (x) { if (actors.indexOf(x) < 0) actors.push(x); });
      return { with: actors, text: t + res.text, why: why + '／' + res.why, mag: res.mag };
    }
  });

  /* ======================= 咬まれたその場での、仲間の反応 ======================= */
  var REACT = {
    tq: L('{r}は自分のベルトを引き抜き、{c}の二の腕をきつく縛り上げた。「動くな。毒を回すな」――それが効くのかどうか、誰も知らなかった。|{r}は水筒の水を{c}の傷にかけ、シャツを裂いて巻きつけた。手が震えて、うまく結べなかった。'),
    cutOk: L('{r}は一瞬だけ目を閉じた。それから{c}の腕を押さえつけ、{w}を振り下ろした。{c}の絶叫が{area}に響いた。――傷口を焼いた翌朝、{c}の熱は上がらなかった。|「恨むなよ」――{r}は{c}の口にタオルを噛ませ、{w}で咬まれた腕を落とした。{c}は気を失った。目を覚ましたとき、{c}はまだ{c}のままだった。'),
    cutBad: L('{r}は{c}の腕に{w}を振り下ろした。けれど、遅かった。切り口の向こうで、黒い筋がもう肩まで伸びていた。|{r}は震える手で{c}の腕を落とした。止血が追いつかない。{c}の顔から、みるみる血の気が引いていった。'),
    aim: L('{r}は無言で{w}を{c}に向けた。「……離れろ。三歩下がれ」|{r}は{c}から距離を取り、武器を握り直した。目は{c}の咬み跡から離れなかった。'),
    deny: L('{r}は{c}の腕を見て、首を振った。「咬まれてない。かすっただけ。そうでしょ？」――{c}は答えなかった。|{r}は{c}の傷を両手で押さえた。「大丈夫、大丈夫だから」――誰に言い聞かせているのか、分からなかった。'),
    hold: L('{r}は咬み跡ごと{c}を抱きしめた。「まだ、ちゃんとここにいる。まだ大丈夫だ」|{r}は{c}の血だらけの手を握って、離さなかった。'),
    panic: L('{r}は悲鳴を上げて後ずさった。「咬まれた、咬まれたって！」――その声に、周りの全員が凍りついた。|{r}は{c}から目を逸らし、出口の方を何度も見た。')
  };
  var RSAY = {
    proud: L('「……クソが」|「勝手に死ぬな。許さねえぞ」'),
    stern: L('「……覚悟を決めろ。お前も、私もだ」|「手当てをする。黙っていろ」'),
    tsun: L('「ば、ばか！　なんで避けないのよ……！」|「やだ……やだってば……！」'),
    gentle: L('「大丈夫、大丈夫だよ……」|「痛いよね。そばにいるから」'),
    devoted: L('「私が、私がなんとかします……！」|「代わりに咬まれればよかった……」'),
    cool: L('「感染から発症まで、まだ時間はある。考えろ」|「……切るなら、今しかない」'),
    free: L('「うそ、うそでしょ……！？」|「だいじょぶ、絶対だいじょぶだから……！」'),
    shy: L('「ひっ……ち、血が……」|「ど、どうしよう、どうしよう……」'),
    polite: L('「どうか、お気を確かに……！」|「すぐに手当ていたします」')
  };
  Z.onInfect = function (ctx, c, by, aware) {
    if (!aware) return;
    Z.later(ctx, function () {
      if (!c.alive || c.out || !c.z.bitten) return;
      var mates = Z.here(ctx, c);
      if (!mates.length || ctx.rng() > 0.85) return;
      var rng = ctx.rng, A = ctx.zb.A[c.z.area];
      var r = mates.slice().sort(function (x, y) { return (ctx.R(y, c).aff + ctx.R(y, c).trust * 0.5) - (ctx.R(x, c).aff + ctx.R(x, c).trust * 0.5); })[0];
      var ra = ctx.R(r, c), lover = tieT(ctx, r, c) === 'lover' || ctx.pair(r, c).couple;
      var opts = [
        ['tq', r.tr.np * 0.5 + r.tr.a * 0.3 + 0.1],
        ['aim', r.tr.cold * 0.6 + r.tr.caution * 0.3 - ra.aff / 120],
        ['deny', r.tr.ac * 0.4 + r.tr.np * 0.3 + ra.aff / 150],
        ['hold', (lover ? 0.6 : 0) + ra.aff / 120 + r.tr.np * 0.2],
        ['panic', r.tr.caution * 0.4 + r.tr.ac * 0.3 - ra.aff / 150]
      ];
      if (r.weapon && r.weapon.pow >= 3) opts.push(['cut', r.tr.a * 0.4 + r.tr.cp * 0.3 + r.tr.cold * 0.3 + ra.trust / 200 + (r.z.know.cut ? 0.3 : 0)]);
      var k = HK.weighted(rng, opts, function (o) { return Math.pow(Math.max(0.03, o[1]), 2); })[0];
      var m = { r: r.name, c: c.name, w: wname(r), area: A.name }, t, why = c.name + 'が咬まれた瞬間、' + r.name + 'は';
      if (k === 'cut') {
        var ok = rng() < 0.42 + luck(ctx, c) * 0.03 + r.tr.a * 0.1;
        c.hp -= 35; c.z.wound = ctx.stepIndex;
        t = fill(ctx.pick(ok ? REACT.cutOk : REACT.cutBad), m);
        why += 'その場で腕を切り落とした（' + r.name + 'の決断力：A・CP・ドライさ）' + (ok ? '――間に合った' : '――間に合わなかった');
        if (ok) { c.z.bitten = null; c.z.turnAt = -1; c.z.cut = true; ctx.mod(c, r, { trust: 20, aff: 10 }); }
        ctx.stress(r, 25);
        ctx.act2({ actors: [r, c], cat: 'help', text: t + (rng() < 0.5 ? sayOf(ctx, r, RSAY) : ''), why: why, mag: 42 });
        if (c.hp <= 0 && c.alive) ctx.kill(c, null, r.name + 'に咬まれた腕を切り落とされ、失血で');
        return;
      }
      t = fill(ctx.pick(REACT[k]), m);
      why += { tq: '止血した（NP・A）', aim: '武器を向けた（ドライさ・慎重さ）', deny: '咬まれたことを認めなかった（AC・好意）', hold: '抱きしめた（' + (lover ? '恋人' : '好意 ' + Math.round(ra.aff)) + '）', panic: '取り乱した（慎重さ・AC）' }[k];
      if (k === 'tq') c.z.turnAt += 1;
      if (k === 'aim' || k === 'panic') ctx.mod2(r, c, { ten: 15 }, { ten: 12, trust: -10 });
      if (k === 'hold' || k === 'deny') ctx.mod(c, r, { aff: 8, trust: 6 });
      ctx.act2({ actors: [r, c], cat: k === 'aim' || k === 'panic' ? 'conflict' : 'help', text: t + (rng() < 0.55 ? sayOf(ctx, r, RSAY) : ''), why: why, mag: 26 });
    });
  };

  /* ======================= 咬まれたと知ったあとの選択肢（追加） ======================= */
  Z.BITE_LABEL = { shield: '仲間を逃がす盾になる', confess: '想いを告げる', video: '最後の伝言を残す', berserk: '最後まで戦い抜く', gift: '持ち物を託す', lastnight: '恋人と最後の夜を過ごす' };
  var LAST = {
    proud: L('「……悪くなかったぜ、お前らといるのは」|「泣くな。うっとうしい」|「俺の分まで、しぶとく生きろ」'),
    stern: L('「後は頼む。……それだけだ」|「生きろ。それが最後の命令だ」|「お前たちと戦えたことを、誇りに思う」'),
    tsun: L('「べ、別に、寂しくなんかないから……っ」|「……ありがと。一回しか言わないから」|「あたしのこと、忘れたら許さないから」'),
    gentle: L('「みんな、ありがとう。……楽しかったよ」|「大丈夫。わたしは、平気だから」|「ちゃんとご飯、食べてね」'),
    devoted: L('「お役に立てて、よかったです」|「最後まで、そばにいられなくてごめんなさい」|「どうか、生きてください」'),
    cool: L('「合理的な判断だ。……後悔はない」|「確率的に、これが最善だった」|「……感情が追いつかないな。不思議だ」'),
    free: L('「楽しかった！　ほんとに！」|「泣かないでよー、笑って送ってよ！」|「次に生まれたら、また遊ぼうね！」'),
    shy: L('「あ、ありがとう……ずっと、言えなかった……」|「こ、こわいけど……みんながいたから……」|「わ、わすれないで、ね……」'),
    polite: L('「今まで、ありがとうございました」|「皆様、どうかご無事で」|「お世話になりました」')
  };
  Z.biteOpts = function (ctx, c, opts, mates, close, lover) {
    if (mates.length) {
      opts.push(['shield', c.tr.np * 0.45 + c.tr.cp * 0.3 + (close ? ctx.R(c, close).aff / 220 : 0)]);
      opts.push(['gift', c.tr.np * 0.4 + c.tr.a * 0.2 + 0.05]);
      var crush = mates.filter(function (o) { return ctx.R(c, o).att > 45 && o !== lover; }).sort(function (x, y) { return ctx.R(c, y).att - ctx.R(c, x).att; })[0];
      if (crush) { c.z.crush = crush.i; opts.push(['confess', 0.3 + ctx.R(c, crush).att / 150 + c.tr.fc * 0.2]); }
      /* 最後の夜は、受け攻めの向きが決まる二人だけ（HK.Pos.okSex） */
      if (lover && (!HK.Pos || HK.Pos.okSex(c, lover))) opts.push(['lastnight', 0.35 + ctx.R(c, lover).att / 180]);
    }
    opts.push(['video', c.tr.ac * 0.3 + c.tr.np * 0.3 + (c.z.family ? 0.35 : 0)]);
    opts.push(['berserk', c.tr.aggr * 0.45 + c.tr.fc * 0.15 - c.tr.ac * 0.2]);
  };
  Z.biteRun = function (ctx, c, pick, why, mates, close, lover) {
    var rng = ctx.rng, A = ctx.zb.A[c.z.area], last = sayOf(ctx, c, LAST), m = { a: c.name, area: A.name, w: wname(c) };
    if (pick === 'shield') {
      ctx.act2({ actors: [c].concat(mates), cat: 'death', fx: function () { mates.forEach(function (o) { ctx.mod(o, c, { aff: 20, trust: 20 }); ctx.stress(o, 25); }); }, text: fill(ctx.pick(L('{area}に群れが押し寄せた夜、{a}は皆を裏口へ押しやり、ひとり正面のバリケードの前に立った。「どうせ俺はもうすぐ終わる。だったら、使い道くらい選ばせろ」|{a}は咬み跡を隠さずに言った。「群れは私が引きつける。その間に行って」――{a}は{w}を握り、わざと大きな音を立てて通りへ出ていった。|{a}は仲間たちが車に乗り込むのを見届けてから、ゾンビの群れの方へ歩き出した。振り返らなかった。')), m) + last, why: why, mag: 55 });
      A.z = Math.max(0, A.z - 20);
      ctx.kill(c, null, '咬まれたあと、仲間を逃がすため群れの前に残った');
      return true;
    }
    if (pick === 'confess') {
      var o = ctx.chars[c.z.crush];
      if (!o || !o.alive) return false;
      var yes = ctx.R(o, c).att + ctx.R(o, c).aff > 70;
      ctx.act2({ actors: [c, o], cat: 'romance', fx: function () { ctx.mod2(c, o, { att: 10, aff: 10 }, { att: yes ? 15 : 5, aff: 12 }); if (yes) ctx.pair(c, o).couple = true; }, text: fill(ctx.pick(L('{a}は咬み跡を見せてから、{b}に向き直った。「言わずに終わるのは、嫌だから。……ずっと好きだった」|「どうせもうすぐ、私は私じゃなくなる。だから言う。{b}、好きだ」')), { a: c.name, b: o.name }) + (yes ? fill(ctx.pick(L('{b}は何も言わずに{a}を抱きしめた。「……遅いよ。私も」|{b}は泣きながら{a}に口づけた。咬み跡のことなど、どうでもよかった。')), { a: c.name, b: o.name }) : fill(ctx.pick(L('{b}は言葉を失って、ただ{a}の手を握った。|{b}は「ごめん」と言いかけて、やめた。代わりに、最後まで隣に座っていた。')), { a: c.name, b: o.name })), why: why + '／' + o.name + 'への惹かれ ' + Math.round(ctx.R(c, o).att), mag: 38 });
      Z.later(ctx, function () { if (c.alive && Z.groupReaction) Z.groupReaction(ctx, c); });
      return true;
    }
    if (pick === 'video') {
      var to = c.z.family ? c.z.family.rel || '家族' : rng.pick(['誰か', 'まだ見ぬ誰か', '昔の友人']);
      ctx.act2({ actors: [c], cat: 'solo', text: fill(ctx.pick(L('{a}は割れたスマホを立てかけて、録画ボタンを押した。「{to}へ。……これを見てるってことは」――そこで{a}は笑って、撮り直した。|{a}はノートの最後のページに、{to}への手紙を書いた。一枚では足りなかった。|{a}はボイスレコーダーに、{to}への伝言を吹き込んだ。最後は、声にならなかった。')), { a: c.name, to: to }) + last, why: why, mag: 26 });
      return true;
    }
    if (pick === 'berserk') {
      var k = 3 + rng.int(6); c.z.kills += k; A.z = Math.max(0, A.z - 12); c.hp -= 15;
      ctx.act2({ actors: [c].concat(mates), cat: 'combat', text: fill(ctx.pick(L('{a}は咬み跡を見下ろして、笑った。「なら、もう怖いものはない」――{a}は{w}を担いで{area}の群れに飛び込み、' + k + '体を叩き潰した。|{a}は残り時間を数えるのをやめた。代わりに、{area}のゾンビを数えて、一体ずつ減らしていった。（' + k + '体）')), m), why: why, mag: 34 });
      if (c.hp <= 0 && c.alive) ctx.kill(c, null, '咬まれたあと、最後まで群れと戦って');
      return true;
    }
    if (pick === 'gift') {
      var r = close || mates[0];
      if (!r) return false;
      if (c.weapon && (!r.weapon || c.weapon.pow > r.weapon.pow)) { var w = r.weapon; r.weapon = c.weapon; c.weapon = w; }
      r.z.food += c.z.food; c.z.food = 0;
      ctx.act2({ actors: [c, r], cat: 'help', fx: function () { ctx.mod(r, c, { aff: 15, trust: 15 }); }, text: fill(ctx.pick(L('{a}は自分のリュックを{b}に押しつけた。「食料と、武器と、地図。……もう、俺には要らない」|{a}は{b}に、ポケットの中身を一つずつ渡した。最後に渡したのは、家の鍵だった。')), { a: c.name, b: r.name }) + last, why: why, mag: 28 });
      return true;
    }
    if (pick === 'lastnight' && lover && lover.alive) {
      ctx.pair(c, lover).night = true;
      ctx.act2({ actors: [c, lover], cat: 'romance', fx: function () { ctx.mod2(c, lover, { att: 12, aff: 12 }, { att: 12, aff: 12 }); ctx.stress(lover, 20); }, text: fill(ctx.pick(L('{a}は{b}に咬み跡を見せた。{b}は何も言わず、{a}の手を引いて奥の部屋へ行った。最後の夜だった。二人は、朝まで互いの名前を呼び合った。|「最後くらい、普通の恋人でいたい」――{a}と{b}は、拾ったろうそくを灯して、壊れたソファで抱き合った。')), { a: c.name, b: lover.name }), why: why + '／恋人の' + lover.name, mag: 40 });
      ctx.pair(c, lover).promise = c.i;
      return true;
    }
    return false;
  };
})();
