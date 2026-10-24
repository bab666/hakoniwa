/* 箱庭シミュレーター: 探偵どうしの関係と、憎しみ・愛憎の共通部品（邪神村RTA・吹雪の館で使う）
   ・関係の種類：設定された人間関係（S.ties）から決める
       愛憎 … 恋愛の関係（恋人・片想い・セフレ・元恋人…）と、敵対・不仲・ライバルが同じ二人に重なっている
       憎しみ … 敵対・不仲・きょうだい（不仲）だけで、恋愛の関係がない
   ・名探偵とポンコツ探偵の顔合わせの台詞は、二人の関係（先輩後輩の向き・ライバル・恋人・親しい・初対面）で変わる
   ・成人向けの描写（愛憎の二人が揉めて、無理やり体を重ねる）は solo-feud-r18.js（R18版のみ）が HK.Feud.r18Clash を足す
   台詞は tone-lines.js（口調ごとの書き下ろし） */
(function () {
  'use strict';
  var HK = window.HK;
  if (!HK || !HK.TL) return;
  var LOVE = 'lover,mate,fated,almost,crush,fwb,ex', HATE = 'enemy,bad,sibbad', RIVAL = 'rival', CLOSE = 'friend,colleague,buddy,childhood,best,sibling,sibprot,sibclose,parent,pparent,mentor,master,teacher,classmate,boss,benefactor,relative,worship';
  function inL(t, l) { return l.split(',').indexOf(t) >= 0; }
  function ties(S, a, b) { return (S.ties || []).filter(function (t) { return (t.a === a.i && t.b === b.i) || (t.a === b.i && t.b === a.i); }); }
  function has(S, a, b, l) { return ties(S, a, b).some(function (t) { return inL(t.type, l); }); }
  /* 恋愛の関係（元恋人は、敵意と重なったときだけ愛憎の材料になる） */
  function love(S, a, b) { return ties(S, a, b).some(function (t) { return inL(t.type, LOVE) && (t.type !== 'crush' || t.a === a.i || t.b === a.i); }); }
  /* a → b の嫌悪レベル（hate-kit.js があれば、箱庭の中で上下する値を使う） */
  function lv(S, a, b) { return HK.HateKit ? HK.HateKit.level(S, a, b) : has(S, a, b, HATE) ? 50 : 0; }
  var KISS = ['{a}は{b}の腕を掴んで壁に押しつけ、噛みつくように唇を奪った。{b}が{a}の頬を張った。それでも、{a}は離さなかった。', '{a}は{b}の胸ぐらを掴み、そのまま強く抱きすくめた。{b}がもがくほど、{a}の腕には力がこもった。'];
  /* 強引な側が受けの組（{b}が自分で攻めを選んでいる等）：掴みかかった{a}を、{b}が逆に押さえ込む */
  var REV = ['{a}は{b}の胸ぐらを掴んだ。{b}はその手首を掴み返し、逆に{a}を壁に押しつけて、噛みつくように唇を奪った。{a}が{b}の頬を張っても、{b}は離さなかった。', '{a}は{b}に掴みかかった。{b}は{a}の両手首をひとまとめに押さえ込み、「……で？」と見下ろした。{a}は唇を噛んで、顔を背けた。'];
  /* 二人とも自分で攻めを選んでいる組：どちらも押さえ込まれない */
  var EVEN = ['{a}は{b}の胸ぐらを掴んだ。{b}も{a}の襟を掴み返した。睨み合ったまま、どちらからともなく、噛みつくように唇がぶつかった。', '{a}と{b}は、互いの腕を掴んだまま、一歩も引かずに睨み合った。息がかかるほどの距離で、先に目を逸らしたほうが負けだと、二人とも分かっていた。'];
  /* 女性どうし（R18版のみ使う）：揉み合いの延長で、指と舌で */
  var FF_CLASH = ['{a}は{b}の手首を掴んで壁に押しつけ、噛みつくように唇を奪った。もがく{b}の服の中に、{a}の手が乱暴に滑り込んだ。', '{a}は{b}を床に組み伏せ、抗う腕を頭の上で押さえつけた。「黙ってなさい」――{a}の指が、{b}の下着の奥を容赦なく探った。', '{a}は{b}の襟元を掴んで布団の上に投げ出し、脚のあいだに膝を割り込ませた。{b}の罵声は、{a}の指が動くたびに、甘い声に崩れていった。'];
  function ffClash(S, a, b, pk) {
    var R = HK.R18M, f = function (x) { return x.replace(/\{a\}/g, a.name).replace(/\{b\}/g, b.name); };
    var ctx = { pick: pk }, t = f(pk(FF_CLASH));
    if (R) t += R.resist(S, a, b, { endure: false });
    if (HK.FF) t += f(HK.FF.pick(ctx, 'body', 'rough')) + (R ? R.say(S, b, 'climax') : '') + f(HK.FF.pick(ctx, 'climax', 'rough'));
    return t;
  }
  var F = HK.Feud = {
    ties: ties, has: has, level: lv,
    /* 愛憎：恋愛の関係と、敵視（どちらかの嫌悪が不仲以上）かライバルが重なっている */
    lovehate: function (S, a, b) { return love(S, a, b) && (lv(S, a, b) >= 35 || lv(S, b, a) >= 35 || has(S, a, b, RIVAL)); },
    /* 憎しみ：a が b を嫌っていて、恋愛の関係がない（一方的でもよい） */
    hate: function (S, a, b) { return lv(S, a, b) >= 35 && !love(S, a, b); },
    /* 敵対の強さの憎しみ（生贄に差し出す・手にかけるのはこちら） */
    hateStrong: function (S, a, b) { return lv(S, a, b) >= 65 && !love(S, a, b); },
    rival: function (S, a, b) { return has(S, a, b, RIVAL) || lv(S, a, b) >= 35 || lv(S, b, a) >= 35; },
    /* 名探偵 sl から見た、ポンコツ探偵（またはもう一人の名探偵）pk との顔合わせの台詞の種類 */
    duo: function (S, sl, pk) {
      var sp = ties(S, sl, pk).filter(function (t) { return t.type === 'senpai'; })[0];
      if (sp) return sp.a === sl.i ? 'DUO_SENPAI_S' : 'DUO_SENPAI_P';
      if (F.lovehate(S, sl, pk) || has(S, sl, pk, RIVAL + ',' + HATE)) return 'DUO_RIVAL';
      if (love(S, sl, pk)) return 'DUO_LOVE';
      if (has(S, sl, pk, CLOSE)) return 'DUO_CLOSE';
      return 'DUO_NONE';
    },
    /* 顔合わせの一文（名探偵が、相手を見て言う） */
    duoText: function (S, sl, pk) {
      var k = F.duo(S, sl, pk), lead = {
        DUO_SENPAI_S: sl.name + 'は、後輩の' + pk.name + 'を振り返った。',
        DUO_SENPAI_P: sl.name + 'は、先輩の' + pk.name + 'を見て、眉間を押さえた。',
        DUO_RIVAL: sl.name + 'は、' + pk.name + 'の顔を見るなり、目を細めた。',
        DUO_LOVE: sl.name + 'は、' + pk.name + 'の袖を、そっと引いた。',
        DUO_CLOSE: sl.name + 'は、' + pk.name + 'を見て、小さく笑った。',
        DUO_NONE: sl.name + 'は、初めて会う' + pk.name + 'を、横目で値踏みした。'
      }[k];
      return { k: k, text: lead + HK.TL.line(sl, k, pk) };
    },
    /* 関係の名前（理由の欄に出す） */
    label: function (S, a, b) { return ties(S, a, b).map(function (t) { return HK.tieLabel ? HK.tieLabel(t) : HK.TIES && HK.TIES[t.type] ? HK.TIES[t.type].label : t.type; }).join('・') || 'なし'; },
    /* 愛憎の二人が揉めたときの描写（{text, r18}）。a=強引な側。R18版では solo-feud-r18.js が r18Clash を足す
       受け攻めの決まり（pos.js）：体を奪う場面は、向きの決まる組（HK.Pos.okSex）で、強引な側 a が攻め（HK.Pos.order の先頭）のときだけ。
       向きが逆（b が攻め）なら、唇だけの揉み合いで、b が逆に押さえ込む。女性どうしは指と舌の描写（FF_CLASH） */
    clash: function (S, a, b, pick) {
      var t = a.name + 'と' + b.name + 'の口論は、いつの間にか怒鳴り合いになっていた。' + HK.TL.line(a, 'LH_CLASH', b);
      var Pz = HK.Pos, ok = !Pz || Pz.okSex(a, b), aTop = !Pz || Pz.order(a, b, [a, b])[0] === a;
      var pk = pick || function (l) { return l[0]; };
      if (ok && aTop && F.r18Clash && F.r18On && F.r18On(S)) {
        if (Pz && Pz.ff(a, b)) return { text: t + ffClash(S, a, b, pk) + HK.TL.line(a, 'LH_AFTER', b), r18: true };
        return { text: t + F.r18Clash(S, a, b) + HK.TL.line(a, 'LH_AFTER', b), r18: true };
      }
      var l = Pz && Pz.hardTop(b) ? (Pz.hardTop(a) ? EVEN : REV) : ok && !aTop ? REV : KISS;
      return { text: t + (pick ? pick(l) : '').replace(/\{a\}/g, a.name).replace(/\{b\}/g, b.name) + HK.TL.line(a, 'LH_AFTER', b), r18: false };
    }
  };
})();
