/* 箱庭シミュレーター: ゾンビの街 ― 恋人と片想い
   ・恋人：「最後かもしれないから」と夜を過ごす／恋人の前から黙って消える／恋人がゾンビになったときの態度
   ・片想い：告白を急ぐ／関係を迫る／墓まで持っていくと決めて、黙って守る
   夜の場面は、この箱庭では「ほのめかす」まで。R18版では solo-zombie-love.js が描写を足す */
(function () {
  'use strict';
  var HK = window.HK, Z = HK.ZB;
  if (!Z || !Z.scen) return;
  var EV = Z.scen.events;
  function L(s) { return s.split('|'); }
  function tie(ctx, a, b) { return HK.Ties ? HK.Ties.get(ctx, a, b) : null; }
  function fill(t, m) { return t.replace(/\{(\w+)\}/g, function (x, k) { return m[k] != null ? m[k] : x; }); }

  /* 恋人か */
  Z.isLover = function (ctx, a, b) {
    if (!a || !b || a === b) return false;
    var has = HK.tieHas || function () { return false; };
    return !!ctx.pair(a, b).couple || !!(has(ctx, a, b, 'lover') || has(ctx, a, b, 'mate') || has(ctx, a, b, 'fated'));
  };
  /* a が b に片想いしているか（恋人ではない） */
  Z.isCrush = function (ctx, a, b) {
    if (!a || !b || a === b || Z.isLover(ctx, a, b)) return false;
    if (HK.Ties && HK.Ties.from(ctx, a, b, 'crush')) return true;
    if (HK.Ties && HK.Ties.has(ctx, a, b, 'crush')) return false;
    return HK.canLove(a, b) && ctx.R(a, b).att > 48 && ctx.R(b, a).att < 30;
  };
  /* 夜の描写の度合い：off（描かない）・fade（ほのめかす）・high（描写する／R18版のみ） */
  Z.loveLv = function (ctx) { var v = ctx.env.zlewd; return v === 'off' || v === 'high' ? v : 'fade'; };

  var LV = Z.LOVE = {
    /* ---------- 恋人：最後かもしれない夜（{a}=誘う側） ---------- */
    nightAsk: {
      proud: L('「……明日、どっちかが死んでても文句言うなよ」{a}はそう言って、{b}を引き寄せた。|{a}は{b}の手首を掴んだ。「今夜だけは、見張りなんかどうでもいい」'),
      stern: L('{a}は長いあいだ黙っていた。「……明日の保証はない。だから、今夜は君のそばにいたい」|{a}は{b}の頬に触れた。「後悔だけは、残したくない」'),
      tsun: L('「べ、別に、最後だからとかじゃないけど……っ」{a}は{b}の袖を掴んで離さなかった。|「……今夜くらい、素直になってあげる。明日はどうなるか、わかんないし」'),
      gentle: L('「ねえ、{b}。……今夜は、ずっとくっついててもいい？」|{a}は{b}の髪を撫でた。「最後かもしれないなら、ちゃんと覚えておきたいの。{b}のこと、全部」'),
      devoted: L('「明日、もし私がいなくなっても……今夜のことは、覚えていてください」|{a}は震える手で、{b}のシャツのボタンに触れた。「最後かもしれないから……お願い」'),
      cool: L('「生き残る確率なんて、もう考えたくない」{a}はそう言って、{b}の首筋に顔を埋めた。|{a}は懐中電灯を消した。「……今夜は、お前のことだけ考えさせろ」'),
      free: L('「ねえ、どうせ明日死ぬかもしれないならさ」{a}は笑って、{b}に覆いかぶさった。「後悔しないこと、しよ？」|「生きてるうちに、いっぱい触っときたいの！」{a}は{b}に抱きついた。笑っていたが、目は赤かった。'),
      shy: L('「あ、あの……っ、今夜、だけ……そばに、いて……」|{a}は真っ赤になって、それでも{b}の手を自分の胸に当てた。「……生きてるって、確かめたいの」'),
      polite: L('「はしたないお願いだと、分かっております。……ですが、明日があるとは限りませんので」|{a}は{b}の前に膝をついた。「今夜だけは、恋人として、お側に」')
    },
    /* ほのめかす（全年齢でもこの程度） */
    nightFade: L('二人は、バリケードの奥の狭い部屋で、互いの体温を確かめ合った。外では、ゾンビのうめき声がいつまでも続いていた。|割れた窓から月明かりが差し込んでいた。{a}と{b}は、生きていることを確かめるように、何度も名前を呼び合った。|毛布一枚の下で、{a}と{b}は朝まで離れなかった。どちらも、明日のことは口にしなかった。|発電機の音に紛れて、二人の息遣いが重なった。それが、この街で聞いたいちばん優しい音だった。'),
    nightAfter: L('明け方、{b}は{a}の寝顔を見つめながら、「生き延びたら、もう一回」と小さく呟いた。|朝になって、{a}は{b}の首筋に残った痕を指でなぞった。「……これで、どこにいても分かるね」|{a}と{b}は、同じ毛布にくるまったまま、朝日が昇るのを待った。外の音は、もう気にならなかった。|二人は、互いの体に咬み跡がないことを確かめ合ってから、ようやく少しだけ笑った。'),

    /* ---------- 恋人の前から、黙って消える ---------- */
    /* 咬まれていて、恋人に知られたくない */
    leaveBit: L('{a}は眠っている{b}の額に口づけてから、そっと立ち上がった。置き手紙には「愛してる。探さないで」とだけ書いてあった。|{a}は{b}が見張りに立った隙に、裏口から出ていった。{b}のリュックには、{a}の分の食料が全部押し込まれていた。|「ちょっと水を汲んでくる」――{a}は{b}に笑いかけて出ていき、二度と戻らなかった。咬み跡のことは、最後まで言わなかった。|{a}は{b}の指から、自分が贈った指輪をそっと外して、{b}のポケットに入れ直した。それから、音を立てずに部屋を出た。'),
    /* 咬まれていないのに、恋人のために消える（囮・食料・足手まといになりたくない） */
    leaveSelf: L('食料は、あと一人分しかなかった。{a}は{b}が眠っているあいだに、それを{b}の枕元に置いて、外へ出ていった。|{a}は群れの気配に気づいた。{b}を起こさずに外へ出て、わざと大きな音を立てながら、反対の方向へ走った。|{a}は足の怪我を隠していた。「足手まといにだけは、なりたくない」――{a}は書き置きを残して、夜明け前に出ていった。|{a}は{b}の寝顔を長いあいだ見つめていた。「必ず迎えに来る」――そう書いた紙を残して、{a}は一人で救助の噂を確かめに出た。'),
    found: L('{b}が目を覚ますと、隣は冷たかった。置き手紙を読んで、{b}は声を上げずに泣いた。|{b}は空っぽの寝袋を見て、すぐに上着を掴んだ。「探す。絶対に」|{b}は書き置きを握りつぶした。「勝手に決めるなよ……！」――そのまま、{a}の足跡を追って外へ飛び出した。|{b}は置き手紙を何度も読み返してから、丁寧に折りたたんで胸ポケットにしまった。'),

    /* ---------- 恋人がゾンビになったとき（{v}=生きている恋人、{z}=ゾンビ） ---------- */
    see: L('{v}は通りの向こうに{z}を見つけた。{z}は、{v}が最後に贈ったマフラーを、まだ首に巻いていた。|{v}は、ガラス越しに{z}と目が合った。{z}が首を傾げた。その癖は、生きていたころと同じだった。|{v}は{z}の名前を呼びかけて、自分の口を手で塞いだ。'),
    talk: L('{v}は武器を下ろした。「{z}、私だよ。……分かる？」――{z}は一瞬だけ動きを止めた。それが答えなのかどうか、{v}には分からなかった。|{v}は泣きながら、{z}に昨日の話をした。{z}はうめき声を上げながら近づいてきた。{v}は、最後まで後ずさらなかった。|{v}は{z}の前に立ちはだかり、仲間に叫んだ。「撃たないで！　まだ、{z}かもしれない！」'),
    embrace: L('{v}は武器を捨てて、{z}を抱きしめた。「一人にしてごめん。……今、行くから」――{z}の歯が、{v}の首筋に沈んだ。|{v}は逃げなかった。{z}に咬まれながら、{v}は{z}の背中を撫で続けた。「これで、ずっと一緒だね」|{v}は{z}の腕の中に自分から飛び込んだ。仲間の叫び声は、もう聞こえていなかった。'),
    self: L('{v}は、仲間が武器を構える前に前へ出た。「……{z}は、私がやる。誰にも、触らせない」――{v}は泣きながら、それをやり遂げた。|{v}は{z}の目を最後まで見つめていた。「愛してる。おやすみ」――{v}の手は、一度も震えなかった。|{v}は{z}を抱きしめるようにして動きを止め、そのまま、終わらせた。崩れ落ちた{z}の手を、{v}はしばらく握ったままだった。'),
    chain: L('{v}は{z}を倒すことができなかった。代わりに、{z}をビルの一室に閉じ込め、扉を鎖で縛った。毎晩、{v}は扉の前に座って、{z}に話しかけた。|{v}は{z}の手足を縛って、部屋の奥に寝かせた。「治る薬が見つかるかもしれない」――仲間は誰も、何も言わなかった。'),
    /* ゾンビになった恋人を見たときの態度の変化（生きている側の気質で） */
    after: {
      proud: L('{v}は壁を殴りつけた。拳から血が出ても、殴るのをやめなかった。'),
      stern: L('{v}は何も言わずに、{z}の名前をナイフで柱に刻んだ。'),
      tsun: L('{v}「ばか……ばか、ばか……っ！　置いていかないって、言ったじゃない……！」'),
      gentle: L('{v}は{z}の好きだった歌を、小さな声で口ずさんだ。最後まで歌えなかった。'),
      devoted: L('{v}は、{z}のいない世界で生きる理由を、一晩中探していた。'),
      cool: L('{v}はいつもどおりの顔で見張りに立った。ただ、その夜は一度も瞬きをしなかった。'),
      free: L('{v}はずっと笑っていた。笑っていないと、壊れてしまいそうだった。'),
      shy: L('{v}は膝を抱えたまま、{z}の名前を何度も、何度も呼んでいた。'),
      polite: L('{v}は「失礼いたします」と誰にともなく言い、部屋の隅で静かに泣いた。')
    },

    /* ---------- 片想い（{a}=想う側、{b}=想われる側） ---------- */
    /* 告白を急ぐ */
    rush: L('「明日、どっちかが死ぬかもしれないだろ。だから今言う」――{a}は{b}の返事も待たずに、好きだと言った。|{a}は群れから逃げ込んだ物置の中で、息を切らしたまま言った。「……好き。今言わないと、一生言えない気がした」|{a}は見張りの交代のとき、{b}を呼び止めた。「生きて帰れたら、なんて待てない。好きだ」|{a}は{b}の袖を掴んだ。「死ぬ前に、一個だけ。……ずっと、好きだった」'),
    rushYes: L('{b}は少し驚いた顔をしてから、{a}の手を握り返した。「……遅いよ」|{b}は黙って、{a}の肩に額を預けた。それが答えだった。|{b}は「こんな時に」と笑って、それから泣いた。「……私も」'),
    rushNo: L('{b}は困ったように目を伏せた。「……ごめん。今は、生き延びることしか考えられない」|{b}は「生き延びたら、ちゃんと聞く」とだけ言った。{a}は、それで十分だと思うことにした。|{b}は何も答えなかった。{a}は「言えてよかった」と笑って、先に歩き出した。'),
    /* 関係を迫る */
    press: L('{a}は{b}を壁際に追い詰めた。「どうせ世界は終わるんだ。……なら、我慢する意味なんてないだろ」|{a}は{b}の手首を掴んで、強引に唇を重ねた。「明日死ぬかもしれないのに、遠慮なんかしてられない」|{a}は{b}の寝床に潜り込んだ。「一人で寝るの、もう無理。……いいでしょ？」'),
    pressYes: L('{b}は一瞬だけ抵抗して、それから{a}の背中に腕を回した。外の闇より、{a}の体温の方がましだった。|{b}は「……今夜だけだからな」と言った。その声は、拒んでいなかった。'),
    pressNo: L('{b}は{a}の胸を突き飛ばした。「こんな時だからって、何してもいいわけじゃない」――それから数日、{b}は{a}と目を合わせなかった。|{b}は{a}の手を振りほどいた。「……今のは、聞かなかったことにする」{a}は、自分が何をしたのかに気づいて、しばらく動けなかった。'),
    /* 墓まで持っていくと決める */
    grave: L('{a}は、眠る{b}の横顔を見つめながら決めた。この気持ちは、言わない。言わずに、守る。|{a}は{b}が別の誰かと笑っているのを見て、そっと目を逸らした。「……それでいい。生きててくれれば」|{a}はノートの最後のページに{b}への想いを書いて、そのページを破って燃やした。灰になるまで、見届けた。|{a}は自分の胸に誓った。この想いは墓まで持っていく。その代わり、{b}だけは、必ずこの街から出す。'),
    /* 黙って守る（決意のあと） */
    guard: L('{a}は自分の分の缶詰を、黙って{b}のリュックに入れた。{b}は気づかなかった。|{a}は{b}の見張りの番を、何も言わずに代わった。「眠れないから」と嘘をついた。|群れが近づいたとき、{a}は真っ先に{b}の前に立った。理由を訊かれても、「たまたま近かったから」としか言わなかった。|{a}は{b}の靴紐がほどけているのに気づいて、黙ってしゃがみ、結び直した。{b}が礼を言うと、{a}はそっぽを向いた。|{a}は{b}が眠るまで、ずっと扉の前に座っていた。')
  };

  function say(ctx, c, T) { var l = T[c.persona] || T.gentle; return ctx.pick(l); }

  /* ======================= 恋人：最後かもしれない夜 ======================= */
  EV.push({
    id: 'z_lv_night', cat: 'romance', scope: 'pair',
    when: function (ctx, a, b) {
      if (Z.loveLv(ctx) === 'off' || !Z.isLover(ctx, a, b)) return false;
      /* 受け攻めの向きが決まらない組（攻め×攻めなど）は、恋人でも夜を過ごさない */
      if (HK.Pos && !HK.Pos.okSex(a, b)) return false;
      if (Z.part(ctx) < 2) return false;
      var pf = ctx.pair(a, b);
      if ((pf.zlvN || 0) >= 2 || (pf.zlvAt != null && ctx.stepIndex - pf.zlvAt < 6)) return false;
      return Z.day(ctx) >= 2 || a.stress > 35 || b.stress > 35 || a.z.bitten || b.z.bitten;
    },
    w: function (ctx, a, b) { return 1.2 + (a.stress + b.stress) / 120 + ctx.R(a, b).att / 90 + (Z.part(ctx) === 3 ? 0.8 : 0); },
    run: function (ctx, a, b) {
      var pf = ctx.pair(a, b); pf.zlvN = (pf.zlvN || 0) + 1; pf.zlvAt = ctx.stepIndex; pf.night = true;
      ctx.mod2(a, b, { att: 8, aff: 8, trust: 6 }, { att: 8, aff: 8, trust: 6 });
      a.stress = Math.max(0, a.stress - 12); b.stress = Math.max(0, b.stress - 12);
      var lv = Z.loveLv(ctx), v = { a: a.name, b: b.name };
      /* 誘う側が受けに回る組では、誘う側が相手を組み伏せる書き方（覆いかぶさる・手首を掴む）を使わない */
      var lead = !HK.Pos || HK.Pos.order(a, b, [a, b])[0] === a, askL = (LV.nightAsk[a.persona] || LV.nightAsk.gentle).filter(function (s) { return lead || !/覆いかぶさ|手首を掴|引き寄せ/.test(s); });
      var ask = ctx.pick(askL.length ? askL : LV.nightAsk.gentle), t = (/^「/.test(ask) ? a.name : '') + fill(ask, v);
      var body = lv === 'high' && LV.nightHigh ? LV.nightHigh(ctx, a, b) : fill(ctx.pick(LV.nightFade), v);
      return { text: t + body + fill(ctx.pick(LV.nightAfter), v), why: '恋人どうし（' + Z.day(ctx) + '日目の夜）。明日の保証がない（焦り ' + Math.round(a.stress) + '・' + Math.round(b.stress) + '）', mag: 34 };
    }
  });

  /* ======================= 恋人：黙って消える（咬まれていないのに） ======================= */
  EV.push({
    id: 'z_lv_vanish', cat: 'solo', scope: 'pair',
    when: function (ctx, a, b) {
      if (!Z.isLover(ctx, a, b) || a.z.vanished || a.z.bitten || Z.day(ctx) < 2) return false;
      return (a.z.food <= 0 && b.z.food <= 1) || a.hp < 45 || ctx.zb.A[a.z.area].z > 55;
    },
    w: function (ctx, a, b) { return 0.12 + a.tr.np * 0.25 + a.tr.cp * 0.1 + (a.hp < 45 ? 0.25 : 0) - a.tr.jealous * 0.15; },
    run: function (ctx, a, b) {
      a.z.vanished = true; a.z.vanishFrom = b.i;
      a.z.food = Math.max(0, a.z.food); b.z.food += a.z.food; a.z.food = 0;
      var na = Z.adj(a.z.area).sort(function (x, y) { return ctx.zb.A[y].z - ctx.zb.A[x].z; })[0];
      var m = { a: a.name, b: b.name };
      var t = fill(ctx.pick(LV.leaveSelf), m);
      a.z.area = na; a.z.path.push(na);
      ctx.mod(b, a, { aff: 10 });
      Z.later(ctx, function () { lostReact(ctx, a, b); });
      return { text: t, why: a.name + 'は恋人の' + b.name + 'のために、黙って姿を消した（NP・CP' + (a.hp < 45 ? '・怪我' : '') + '）', mag: 30 };
    }
  });
  /* 置いていかれた恋人の反応 */
  function lostReact(ctx, a, b) {
    if (!b.alive || b.out) return;
    ctx.stress(b, 22);
    var t = fill(ctx.pick(LV.found), { a: a.name, b: b.name });
    if (b.goal.id !== 'chaos' && b.tr.np + b.tr.impulse > 0.9) { b.focus = a; if (b.goal.id !== 'protect') { b.goal = Z.scen.goals.filter(function (g) { return g.id === 'protect'; })[0] || b.goal; } }
    ctx.act2({ actors: [b, a], cat: 'solo', text: t, why: b.name + 'は、' + a.name + 'がいなくなったことに気づいた', mag: 26 });
  }
  /* 咬まれて黙って消えるときの文（zombie-core から呼ぶ） */
  Z.loveLeave = function (ctx, c, lover) {
    Z.later(ctx, function () { lostReact(ctx, c, lover); });
    return fill(ctx.pick(LV.leaveBit), { a: c.name, b: lover.name });
  };

  /* ======================= 恋人がゾンビになったとき（zombie-core から呼ぶ） ======================= */
  /* 襲われたのが恋人なら、その人の気質で態度が変わる。処理したら true */
  Z.loverZombie = function (ctx, zp, T, P) {
    var c = ctx.chars[zp.i];
    if (!T || !Z.isLover(ctx, T, c) || zp.loveDone) return false;
    zp.loveDone = true;
    var rng = ctx.rng, aff = ctx.R(T, c).aff, m = { v: T.name, z: c.name };
    var opts = [
      ['talk', 0.4 + T.tr.np * 0.4 + T.tr.ac * 0.2],
      ['embrace', (aff > 70 ? 0.15 : 0.03) + T.tr.ac * 0.18 + T.tr.jealous * 0.15 + (T.tr.np > 0.6 && T.tr.ac > 0.5 ? 0.2 : 0) + (T.stress > 60 ? 0.15 : 0)],
      ['self', T.tr.cp * 0.35 + T.tr.a * 0.3 + T.tr.cold * 0.2 + (T.weapon && T.weapon.pow >= 3 ? 0.15 : 0)],
      ['chain', 0.15 + T.tr.np * 0.25 + T.tr.caution * 0.2 + (P.length > 1 ? 0.15 : 0)]
    ];
    var k = HK.weighted(rng, opts, function (o) { return Math.pow(Math.max(0.03, o[1]), 2); })[0];
    var actors = [T, c].concat(P.filter(function (o) { return o !== T; }));
    var tail = ' ' + fill(say(ctx, T, LV.after), m);
    ctx.stress(T, 30);
    if (k === 'embrace' && Z.riseTogether && rng() < 0.5) {
      ctx.pair(T, c).zbite = c.i;
      Z.riseTogether(ctx, zp, T, { pre: fill(ctx.pick(LV.embrace), m), why: T.name + 'は、ゾンビになった恋人の' + c.name + 'を拒まず、その場で同じものになった（好意 ' + Math.round(aff) + '・AC・執着）' });
      return true;
    }
    if (k === 'embrace') {
      ctx.act2({ actors: actors, cat: 'death', text: fill(ctx.pick(LV.embrace), m), why: T.name + 'は、ゾンビになった恋人の' + c.name + 'を拒まなかった（好意 ' + Math.round(aff) + '・AC・執着）', mag: 55 });
      ctx.pair(T, c).zbite = c.i;
      if (Z.infect) Z.infect(ctx, T, c.i, true); else ctx.kill(T, c, 'ゾンビになった恋人の' + c.name + 'に、自分から咬まれた');
      return true;
    }
    if (k === 'self') {
      zp.down = true; ctx.zb.stats.putdown++; ctx.pair(T, c).putdown = T.i;
      c.fateNote = (c.fateNote || '') + '。最後は恋人の' + T.name + 'の手で眠らされた';
      ctx.act2({ actors: actors, cat: 'combat', text: fill(ctx.pick(LV.self), m) + tail, why: T.name + 'は、恋人の' + c.name + 'を自分の手で眠らせると決めた（CP・A・ドライさ）', mag: 50 });
      return true;
    }
    if (k === 'chain') {
      zp.down = true; zp.chained = true;
      c.fateNote = (c.fateNote || '') + '。恋人の' + T.name + 'に、部屋に閉じ込められた';
      ctx.act2({ actors: actors, cat: 'help', text: fill(ctx.pick(LV.chain), m) + tail, why: T.name + 'は、恋人の' + c.name + 'を倒せなかった（NP・慎重さ）', mag: 44 });
      return true;
    }
    /* 話しかける：そのあとは通常どおり（迷いが出る） */
    ctx.act2({ actors: actors, cat: 'solo', text: fill(ctx.pick(LV.talk), m), why: T.name + 'は、ゾンビになった' + c.name + 'に話しかけた（NP・AC）', mag: 36 });
    return false;
  };
  Z.loverSee = function (ctx, v, c) {
    return Z.isLover(ctx, v, c) ? fill(ctx.pick(LV.see), { v: v.name, z: c.name }) : null;
  };

  /* ======================= 片想いの相手がゾンビになったとき（zombie-core から呼ぶ） ======================= */
  LV.crushZ = {
    /* 監禁する（執着・心が擦り切れている） */
    keep: L('{v}は、ゾンビになった{z}の手足を縛り、地下の倉庫に閉じ込めた。扉に鍵をかけてから、{v}は初めて笑った。「やっと、どこにも行かなくなった」|{v}は{z}の首に革のベルトを巻き、部屋の柱に繋いだ。「もう、誰のことも見なくていいよ。……これで、ずっと私のものだ」|{v}は{z}をシーツでくるみ、自分の寝床の隣に寝かせた。うめき声に、{v}は一晩中相槌を打った。「やっと、ちゃんと話を聞いてくれるね」|{v}は{z}を空き部屋に閉じ込め、外から板を打ちつけた。扉に額を当てて、{v}は囁いた。「これで、君は私のもの。……誰にも、渡さない」'),
    keepVisit: L('{v}は今夜も、閉じ込めた{z}に話しかけていた。返事がないことには、もう慣れていた。|{v}は{z}の髪を、毎朝とかしてやった。{z}は、一度も嫌がらなかった。生きていたころと違って。|{v}は{z}の分の食事を、毎日扉の前に置いた。手つかずのまま、腐っていった。|{v}は扉越しに、{z}に今日あったことを報告した。「ねえ、聞いてる？」――うめき声が答えた。{v}は満足そうに頷いた。'),
    keepEnd: L('{v}は街を出なかった。地下の倉庫の前に椅子を置いて、そこで暮らすことにした。|救助のヘリの音が聞こえても、{v}は窓の外を見なかった。扉の向こうに、全部があったから。'),
    /* 最後に、やっと言う */
    say: L('{v}は{z}の前に立ち、初めて口にした。「ずっと、好きだった」――{z}は、うめき声で答えた。それでも{v}は、少しだけ救われた顔をした。|{v}は{z}に向かって言った。「生きてるうちに、言えばよかった」――{z}の濁った目に、{v}の泣き顔が映っていた。'),
    /* 自分の手で眠らせる */
    self: L('{v}は仲間の武器を押しのけた。「……最後くらい、触れてもいいよね」――{v}は{z}を抱きしめるようにして、終わらせた。|{v}は{z}の目を見つめたまま、引き金を引いた。「一度も、こっちを見てくれなかったね」――その声は、ひどく優しかった。')
  };
  Z.crushZombie = function (ctx, zp, P) {
    var c = ctx.chars[zp.i];
    if (zp.crushDone) return false;
    var o = P.filter(function (x) { return Z.isCrush(ctx, x, c) || (HK.Unreq && HK.Unreq.crushOn(ctx, x, c)); })[0];
    if (!o) return false;
    zp.crushDone = true;
    var rng = ctx.rng, m = { v: o.name, z: c.name };
    var unreq = HK.Unreq && HK.Unreq.cold(ctx, o, c);
    var opts = [
      ['keep', (HK.Obsess && !HK.Obsess.jealOk(ctx, o, c) ? -9 : 0) + o.tr.jealous * 0.55 + o.tr.ac * 0.25 + o.stress / 160 + (unreq ? 0.25 : 0) - o.tr.cp * 0.15 - o.tr.np * 0.1],
      ['say', 0.35 + o.tr.honesty * 0.3 + o.tr.np * 0.2],
      ['self', o.tr.cp * 0.3 + o.tr.a * 0.25 + o.tr.cold * 0.2 + (o.weapon && o.weapon.pow >= 3 ? 0.15 : 0)]
    ];
    var k = HK.weighted(rng, opts, function (x) { return Math.pow(Math.max(0.03, x[1]), 2); })[0];
    var actors = [o, c].concat(P.filter(function (x) { return x !== o; }));
    ctx.stress(o, k === 'keep' ? -20 : 25);
    if (k === 'keep') {
      zp.down = true; zp.kept = o.i; o.z.keep = c.i; o.z.keepArea = zp.area;
      c.fateNote = (c.fateNote || '') + '。片想いしていた' + o.name + 'に、閉じ込められた';
      ctx.act2({ actors: actors, cat: 'betray', text: fill(ctx.pick(LV.crushZ.keep), m), why: o.name + 'は、片想いの相手だった' + c.name + 'を手放さなかった（執着 ' + Math.round(o.tr.jealous * 100) + '・AC・焦り ' + Math.round(o.stress) + (unreq ? '・生きているうちは相手にされなかった' : '') + '）', mag: 52 });
      return true;
    }
    if (k === 'self') {
      zp.down = true; ctx.zb.stats.putdown++; ctx.pair(o, c).putdown = o.i;
      c.fateNote = (c.fateNote || '') + '。最後は、片想いしていた' + o.name + 'の手で眠らされた';
      ctx.act2({ actors: actors, cat: 'combat', text: fill(ctx.pick(LV.crushZ.self), m), why: o.name + 'は、片想いの相手を自分の手で眠らせた（CP・A・ドライさ）', mag: 46 });
      return true;
    }
    ctx.act2({ actors: actors, cat: 'romance', text: fill(ctx.pick(LV.crushZ.say), m), why: o.name + 'は、ゾンビになった' + c.name + 'に、やっと想いを告げた', mag: 38 });
    return false;
  };
  /* 閉じ込めたゾンビのもとへ通う */
  EV.push({
    id: 'z_keep_visit', cat: 'solo', scope: 'solo',
    when: function (ctx, a) { return a.z.keep != null && (a.z.keepN || 0) < 3; },
    w: function () { return 4; }, pri: true,
    run: function (ctx, a) {
      a.z.keepN = (a.z.keepN || 0) + 1;
      var c = ctx.chars[a.z.keep], last = a.z.keepN >= 3 || Z.day(ctx) >= ctx.env.days;
      a.z.area = a.z.keepArea; a.goal = Z.scen.goals.filter(function (g) { return g.id === 'live'; })[0] || a.goal;
      if (last) a.fateNote = '閉じ込めた' + c.name + 'のそばで暮らすことを選んだ';
      return { text: fill(ctx.pick(last ? LV.crushZ.keepEnd : LV.crushZ.keepVisit), { v: a.name, z: c.name }), why: a.name + 'は、閉じ込めた' + c.name + 'のもとを離れない', mag: last ? 30 : 18 };
    }
  });

  /* ======================= 片想い ======================= */
  EV.push({
    id: 'z_cr_feel', cat: 'romance', scope: 'pair',
    when: function (ctx, a, b) { var pf = ctx.pair(a, b); return Z.isCrush(ctx, a, b) && !pf.zcr && !pf.zconf && (Z.day(ctx) >= 2 || a.stress > 40); },
    w: function (ctx, a, b) { return 0.8 + ctx.R(a, b).att / 70 + a.stress / 120; },
    run: function (ctx, a, b) {
      var pf = ctx.pair(a, b), rng = ctx.rng, m = { a: a.name, b: b.name };
      var opts = [
        ['rush', 0.3 + a.tr.honesty * 0.5 + a.tr.impulse * 0.3 + a.stress / 200],
        ['press', a.tr.aggr * 0.45 + a.tr.impulse * 0.35 + a.tr.fc * 0.15 - a.tr.np * 0.2 - a.tr.ac * 0.25 + (a.goal.id === 'chaos' ? 0.3 : 0)],
        ['grave', a.tr.ac * 0.45 + a.tr.np * 0.3 + a.tr.caution * 0.2 - a.tr.honesty * 0.2 + (ctx.present().some(function (o) { return o !== a && o !== b && Z.isLover(ctx, b, o); }) ? 0.5 : 0)]
      ];
      /* 自分で攻めを選んだ相手には、関係を迫って壁際に追い詰める場面にしない */
      if (HK.Pos && HK.Pos.hardTop(b)) opts = opts.filter(function (o) { return o[0] !== 'press'; });
      var k = HK.weighted(rng, opts, function (o) { return Math.pow(Math.max(0.03, o[1]), 2); })[0];
      pf.zcr = k;
      var rb = ctx.R(b, a), loveOK = HK.canLove(b, a);
      if (k === 'rush') {
        pf.zconf = true;
        var yes = loveOK && rb.att > 26 && rb.aff > 15;
        if (yes) { pf.couple = true; ctx.mod2(a, b, { att: 10, aff: 12, trust: 8 }, { att: 14, aff: 12, trust: 8 }); }
        else ctx.mod2(a, b, { att: -3 }, { aff: 4 });
        return { text: fill(ctx.pick(LV.rush), m) + fill(ctx.pick(yes ? LV.rushYes : LV.rushNo), m), why: a.name + 'は、終わりかけた街で告白を急いだ（本音の出やすさ・衝動性・焦り ' + Math.round(a.stress) + '）' + (yes ? '／' + b.name + 'も惹かれていた' : ''), mag: 32 };
      }
      if (k === 'press') {
        var ok = loveOK && rb.att > 34 && b.tr.fc + b.tr.impulse > 0.7;
        if (ok) { pf.night = true; ctx.mod2(a, b, { att: 10, aff: 4 }, { att: 10, aff: 2, ten: 4 }); }
        else ctx.mod2(a, b, { ten: 6 }, { ten: 18, trust: -18, aff: -10 });
        var tx = fill(ctx.pick(LV.press), m) + fill(ctx.pick(ok ? LV.pressYes : LV.pressNo), m);
        if (ok && Z.loveLv(ctx) === 'high' && LV.pressHigh) tx += LV.pressHigh(ctx, a, b);
        return { cat: ok ? 'romance' : 'conflict', text: tx, why: a.name + 'は、どうせ終わる世界ならと関係を迫った（攻撃性・衝動性）' + (ok ? '' : '／' + b.name + 'は拒んだ'), mag: 32 };
      }
      a.focus = b; a.z.vow = b.i;
      if (a.goal.id !== 'chaos' && a.goal.id !== 'family') a.goal = Z.scen.goals.filter(function (g) { return g.id === 'protect'; })[0] || a.goal;
      ctx.mod(a, b, { aff: 8 });
      return { text: fill(ctx.pick(LV.grave), m), why: a.name + 'は、' + b.name + 'への想いを墓まで持っていくと決めた（AC・NP）。目標「大切な人を守る」', mag: 26 };
    }
  });
  /* 想いを隠したまま、黙って守る */
  EV.push({
    id: 'z_cr_guard', cat: 'help', scope: 'pair',
    when: function (ctx, a, b) { return a.z.vow === b.i && (ctx.pair(a, b).zgd || 0) < 3; },
    w: function () { return 2.2; },
    run: function (ctx, a, b) {
      var pf = ctx.pair(a, b); pf.zgd = (pf.zgd || 0) + 1;
      if (a.z.food > 0 && b.z.food <= 1) { a.z.food--; b.z.food++; }
      b.stress = Math.max(0, b.stress - 6);
      ctx.mod2(a, b, { aff: 3 }, { trust: 6, aff: 4 });
      return { text: fill(ctx.pick(LV.guard), { a: a.name, b: b.name }), why: a.name + 'は想いを隠したまま、' + b.name + 'を守り続けている', mag: 18 };
    }
  });
})();
