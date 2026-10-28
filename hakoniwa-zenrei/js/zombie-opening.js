/* 箱庭シミュレーター: ゾンビの街 ― 始まり方と、居合わせた者どうしが手を組む場面
   ・エリアごとに「始まり方」が違う：襲われている真っ最中／立てこもり／病院のベッドで目覚める／職場で／車の中で／
     見知らぬ誰かに助けられる／すでに引っかかれている…など
   ・同じエリアの同盟は、一組ずつではなく一場面にまとめて描く */
(function () {
  'use strict';
  var HK = window.HK, Z = HK.ZB;
  function L(s) { return s.split('|'); }
  function names(list) { return list.map(function (c) { return c.name; }).join('・'); }
  function an(ctx, i) { return ctx.zb.A[i].name; }
  function wname(c) { return c.weapon ? c.weapon.name : '素手'; }
  function f(t, m) { return t.replace(/\{(\w+)\}/g, function (x, k) { return m[k] != null ? m[k] : x; }); }

  /* {g}=その場の全員 {a}=一人目 {b}=二人目 {area} {look} {w}=一人目の武器 */
  var OPEN = {
    attack: {
      w: 1.4,
      t: L('{area}のドアが内側から破られた。{g}は、悲鳴を上げる暇もなく走り出していた。――始まりは、逃げている最中だった。|「伏せて！｜伏せろ！｜伏せてください！」――{a}の声と同時に、窓ガラスが砕けて腕が何本も突っ込んできた。{area}での最初の一分は、ただ必死だった。|{a}は{w}を握りしめたまま、{area}の通路を後ずさっていた。目の前のゾンビは、ついさっきまで隣で喋っていた誰かの顔をしていた。|エレベーターの扉が開いた瞬間、そこにいたのは乗客ではなかった。{g}は{area}の非常階段へ転がり込んだ。'),
      fx: 'attack'
    },
    hide: {
      w: 1.1,
      t: L('{g}は{area}の倉庫に閉じこもって、もう六時間になる。扉の向こうを、足を引きずる音が何度も行き来した。|{area}の更衣室のロッカーの中で、{a}は膝を抱えていた。隙間から、外をうろつく影が見えた。|{g}は{area}のトイレの個室に鍵をかけ、スマホの明かりを手で覆っていた。電池は残り12%。'),
      fx: 'calm'
    },
    wake: {
      w: 0.9,
      t: L('{a}が目を覚ましたのは、{area}の床の上だった。何があったのか思い出せない。ただ、口の中に血の味がした。|{a}は点滴の針を引き抜いて、ベッドから起き上がった。誰もいない病棟に、ナースコールだけが鳴り続けていた。|{a}は横転した車の中で意識を取り戻した。シートベルトを外すと、窓の外から白く濁った目がこちらを覗いていた。'),
      fx: 'hurt'
    },
    work: {
      w: 1,
      t: L('{g}は、仕事中だった。{area}のレジの前で客が倒れ、起き上がったとき、もう客ではなかった。|{a}は{area}で、いつもどおりの一日を始めるはずだった。同僚が窓の外を指さして「なにあれ」と言うまでは。|{area}の朝礼の最中に、警報が鳴った。{g}は、上司が誰かに噛みつくところを見てしまった。'),
      fx: 'calm'
    },
    saved: {
      w: 0.9, min: 2,
      t: L('ゾンビに組みつかれた{a}の横から、{b}が{w2}で一体を引き剥がした。「立って！｜立て！｜立ってください！」――見知らぬ誰かに命を救われたのが、この街での最初の出来事だった。|{b}は、{area}の路地で動けなくなっていた{a}の腕を掴んで引きずり起こした。お礼を言う暇もなかった。|{a}が叩いた扉を、内側から開けてくれたのは{b}だった。「早く入って。……噛まれてないよね？｜早く入れ。……噛まれていないな？｜早く入ってください。……噛まれていませんよね？」'),
      fx: 'saved'
    },
    party: {
      w: 0.6,
      t: L('{g}は、{area}で開かれていた誰かの誕生日会の帰りだった。ケーキの箱を抱えたまま、{g}は呻き声の中を走った。|{area}の映画館で、{g}はゾンビ映画を観ていた。エンドロールのあと外に出ると、スクリーンの続きが始まっていた。'),
      fx: 'calm'
    },
    scratch: {
      w: 0.45,
      t: L('{a}は{area}の騒ぎの中で転び、誰かの手に足首を掴まれた。振り払って逃げ切った――はずだった。足首の引っかき傷を、{a}はまだ気にしていなかった。|揉み合いの最中、{a}の腕を何かがかすめた。ただの擦り傷だと、{a}は思った。'),
      fx: 'scratch'
    },
    npc: {
      w: 0.6,
      t: L('{g}のそばには、迷子の子どもが一人いた。名前を訊いても、泣くばかりで答えなかった。|{area}で、迷彩服の男が{g}に銃口を向けていた。「噛まれていないなら、両手を上げてゆっくり来い」'),
      fx: 'npc'
    }
  };
  var LOOK = L('{look}。|あたりには、{look}。|振り返ると、{look}。');

  Z.intro = function (ctx) {
    var zb = ctx.zb, rng = ctx.rng, groups = {};
    ctx._touched = {}; ctx._mag = 0; ctx.k = 1;
    ctx.chars.forEach(function (c) { (groups[c.z.area] = groups[c.z.area] || []).push(c); });
    ctx.say({ text: (zb.reg === 'us' ? 'アメリカの地方都市' : '地方都市') + 'に「それ」が現れて三日目。電気はまだ通っているが、警察も病院も機能していない。街は9つのエリアに分断された。' });
    var used = {};
    Object.keys(groups).forEach(function (k) {
      var g = rng.shuffle(groups[k]), A = zb.A[+k];
      var kind = HK.weighted(rng, Object.keys(OPEN), function (x) { var o = OPEN[x]; if ((o.min || 1) > g.length) return 0; if (x === 'npc' && ctx.env.npc < 20) return 0; return o.w / (1 + (used[x] || 0) * 2); });
      used[kind] = (used[kind] || 0) + 1;
      var O = OPEN[kind], a = g[0], b = g[1] || g[0];
      var t = f(ctx.pick(O.t), { g: names(g), a: a.name, b: b.name, area: A.name, w: wname(a), w2: wname(b) });
      if (kind !== 'wake' && rng() < 0.6) t += f(ctx.pick(LOOK), { look: A.def.look });
      var why = '開始地点はランダム（仲の良さとは関係なし）', mag = 10;
      if (O.fx === 'attack') { g.forEach(function (c) { ctx.stress(c, 15); }); A.z = Math.min(100, A.z + 6); mag = 20; why += '／襲われている最中から始まる'; }
      if (O.fx === 'hurt') { a.hp -= 10; a.z.wound = 0; why += '／' + a.name + 'は怪我をしている'; }
      if (O.fx === 'saved' && g.length > 1) { ctx.mod2(a, b, { aff: 18, trust: 20 }, { trust: 10, aff: 6 }); ctx.pair(a, b).allied = true; why += '／' + b.name + 'が' + a.name + 'を助けた'; mag = 18; }
      if (O.fx === 'scratch') { Z.infect(ctx, a, 'horde', false); why += '／' + a.name + 'はすでに引っかかれている（本人は気づいていない）'; mag = 16; }
      if (O.fx === 'npc') {
        var child = /迷子/.test(t);
        Z.spawnNPCAt(ctx, child ? 'child' : 'soldier', +k);
      }
      ctx.say({ kind: 'event', cat: O.fx === 'attack' ? 'escape' : 'solo', actors: g, text: t, why: why, mag: mag });
    });
    ctx.chars.forEach(function (c) {
      var fm = c.z.family;
      if (!fm || fm.pc != null) return;
      if (fm.inside) ctx.say({ kind: 'event', cat: 'solo', actors: [c], text: c.name + 'の' + fm.rel + 'は、' + an(ctx, fm.area) + 'の近くにいるはずだ。' + (c.goal.id === 'family' ? c.name + 'は、まずそこへ向かうと決めた。' : ''), why: '家族の居場所（街の中）' });
      else ctx.say({ kind: 'event', cat: 'solo', actors: [c], text: c.name + 'の' + fm.rel + 'は、街の外にいる。' + (c.goal.id === 'family' ? '会いに行くには、この街を出るしかない。' : ''), why: '家族の居場所（街の外）' });
    });
  };

  /* ---------- 同じ場所に居合わせた者どうしの同盟（エリアごとに一場面） ---------- */
  var PACT2 = L('{a}と{b}は、どちらからともなく「一緒に行こう｜＝｜一緒に行きましょう」と言った。ひとりでいるよりは、ましだった。|{a}は{b}に、見張りを交代でやらないかと持ちかけた。{b}は少し迷ってから頷いた。|{b}は{a}を信用していなかった。それでも、夜をひとりで越すよりはいいと、{a}の差し出した手を取った。|{a}と{b}は互いの持ち物を床に並べた。食料、電池、{w}。「……組む？｜……組むか｜……組みましょうか」「組もう｜＝｜組みましょう」|{a}は{b}に名前を訊いた。この街で誰かの名前を覚えるのは、三日ぶりだった。|{a}は無言で{b}に缶コーヒーを放った。それが、同盟の合図だった。');
  var PACTG = L('{g}は、{area}の一室で身を寄せ合った。最初に段取りを決めたのは{lead}だった。|{lead}が「ここで夜を越す。見張りは二人ずつ｜＝｜ここで夜を越します。見張りは二人ずつです」と言い、{g}はそれに従った。誰も、ほかの案を持っていなかった。|{g}は輪になって座り、それぞれが知っていることを話した。話が終わる頃には、自然と{lead}の顔を見るようになっていた。|{area}に集まった{g}は、まず噛まれていないことを確かめ合った。{lead}が全員の腕を順番に見て回った。');
  /* もともと知り合い（家族・友人など）どうしの同盟：名前を確かめ合ったりはしない */
  var PACTK = L('{a}と{b}は顔を見合わせて、黙って頷いた。言葉はいらなかった。|{a}は{b}の無事を確かめると、すぐに荷物を半分持った。「行こう。今度は離れないで｜行くぞ。今度は離れるな｜行きましょう。今度は離れないでください」|{a}と{b}は、いつもの調子で軽口を叩き合った。そうでもしないと、膝が震えそうだった。|{b}は{a}の顔を見るなり、張りつめていたものが切れたように座り込んだ。{a}はその隣に腰を下ろし、見張りは自分がやると言った。');
  /* もともと知った仲でも、不仲の二人（sib-feud.js の HK.SibFeud.chilly：兄弟（不仲）・不仲・敵対・ライバル・家族の仲：不仲・師弟などの仲：険悪。雪解け前）は渋々の同盟（2026-10-28 担当MH） */
  var PACTF = L('{a}と{b}は、よりによって同じ場所に逃げ込んでいた。二人は不機嫌に顔を見合わせたが、一人で生き延びられないことも分かっていた。{a}「今だけだから｜今だけだ｜今だけですから」{b}「こっちの台詞｜こちらの台詞だ｜こちらの台詞です」|{a}は{b}の顔を見るなり舌打ちした。それでも、渋々荷物の半分を受け取った。生き延びるための同盟に、仲の良さは要らなかった。|{a}と{b}は、互いに武器を下ろすまでにずいぶん時間がかかった。結局、口をきかないまま、見張りの順番だけを決めた。');
  var DOUBT = L('{d}だけは、少し離れた場所に座っていた。|{d}は、誰とも目を合わせようとしなかった。|{d}は「足手まといは置いていく｜＝｜足手まといは置いていきます」と小さく付け加えた。|{d}は、自分の荷物を抱えたまま眠った。');
  Z.pacts = function (ctx) {
    var rng = ctx.rng, P = ctx.present(), byArea = {};
    P.forEach(function (a) {
      P.forEach(function (b) {
        if (a.i >= b.i || a.z.area !== b.z.area || a.z.alone || b.z.alone) return;
        var pf = ctx.pair(a, b);
        if (pf.allied || pf.noPact) return;
        var ra = ctx.R(a, b), rb = ctx.R(b, a);
        if (ra.ten > 45 || rb.ten > 45 || (a.goal.id === 'chaos' && b.goal.id === 'chaos')) { if (rng() < 0.3) pf.noPact = true; return; }
        if (rng() > 0.45 + (a.tr.warmth + b.tr.warmth) * 0.15) return;
        pf.allied = true;
        ctx.mod2(a, b, { trust: 14, aff: 5 }, { trust: 14, aff: 5 });
        var k = a.z.area;
        (byArea[k] = byArea[k] || { pairs: [], who: [] }).pairs.push([a, b]);
        [a, b].forEach(function (x) { if (byArea[k].who.indexOf(x) < 0) byArea[k].who.push(x); });
      });
    });
    Object.keys(byArea).forEach(function (k) {
      var B = byArea[k], g = B.who, t, why = '同じ' + an(ctx, +k) + 'に居合わせた。生き延びるための同盟';
      if (g.length === 2) {
        var p = B.pairs[0];
        var known = HK.Ties && HK.Ties.get(ctx, p[0], p[1]);
        var chilly = !!(known && HK.SibFeud && HK.SibFeud.chilly(ctx, p[0], p[1]));
        t = f(ctx.pick(chilly ? PACTF : known ? PACTK : PACT2), { a: p[0].name, b: p[1].name, w: wname(p[0]) });
        if (known) why = 'もともと知った仲（' + (HK.Sib && HK.Sib.isSibTie(known) && HK.tieLabel ? HK.tieLabel(known) : HK.TIES && HK.TIES[known.like || known.type] ? HK.TIES[known.like || known.type].label : '知り合い') + '）。同じ' + an(ctx, +k) + 'で合流した' + (chilly ? '（不仲のまま、渋々の同盟）' : '');
      } else {
        var lead = ctx.most(g, function (c) { return c.tr.lead; });
        t = f(ctx.pick(PACTG), { g: names(g), lead: lead.name, area: an(ctx, +k) });
        var d = g.filter(function (c) { return c !== lead && c.tr.cold > 0.6 && c.tr.warmth < 0.45; })[0];
        if (d && rng() < 0.7) t += f(ctx.pick(DOUBT), { d: d.name });
        why += '（まとめ役：' + lead.name + 'の主導性）';
      }
      ctx.act2({ actors: g, cat: 'bond', text: t, why: why, mag: 10 });
    });
  };
})();
