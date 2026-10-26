/* 箱庭シミュレーター: 探偵どうしの関係と、憎しみ・愛憎の共通部品（邪神村RTA・吹雪の館で使う）
   ・関係の種類：設定された人間関係（S.ties）から決める
       愛憎 … 敵対・不仲の「愛憎」の欄（tie.lh。hate-love.js の HK.LoveHate）を設定していれば、それに従う（片方だけなら、持つ側だけが揉めながら構う）。
              設定していなければ、以前の判定：恋愛の関係（恋人・片想い・セフレ・元恋人…）と、敵対・不仲・ライバルが同じ二人に重なっている
       憎しみ … 敵対・不仲・きょうだい（不仲）だけで、恋愛の関係がない
   ・名探偵とポンコツ探偵の顔合わせの台詞は、二人の関係（先輩後輩の向き・ライバル・恋人・親しい・初対面）で変わる
   ・成人向けの描写（愛憎の二人が揉めて、無理やり体を重ねる）は solo-feud-r18.js（R18版のみ）が HK.Feud.r18Clash を足す
   ・揉める場面で唇・体に踏み込むのは、恋愛対象が両方向で合い（HK.canLove。受け攻め HK.Pos.okSex・恋愛相手の固定・一途・恋愛・R18にしない相手もここで見る）、
     向き（HK.Pos.order）で強引な側が攻めのときだけ。体を重ねるのは、さらに HK.LoveHate.sexOk（R18に参加しない・性行為の相手の固定など）を通る組だけ。
     合わない組は、口論・突き放す・掴みかかるだけの文にする（NOTOUCH）
   台詞は tone-lines.js（口調ごとの書き下ろし） */
(function () {
  'use strict';
  var HK = window.HK;
  if (!HK) return;
  /* ---------- 感情のギャップ（HK.Gap。2026-10-25）----------
     強い感情を向ける人ほど、相手から返ってくる気持ちとの差（ギャップ）を感じると、過激な行動に出やすい。
     of(x, a, b)：a の b への想いの強さ（執着の段階・本命・盲信・憎悪・恐怖の重み）と、b の a への好意の差（0〜1）。
                  b がほかの人に向けている好意が a より高ければ、その分を上乗せする
     k(x, a, b)：過激な枝の重みの倍率（差 0 → 1.0、差 1 → 2.2）に、展開の重さ（穏やか 0.6・ふつう 1・重い 1.4）を掛けたもの
     why(x, a, b)：記録の理由書きに添える一言（「想いの差：大（自分 80／相手 20）」）
     x はエンジン型の ctx（R と pair がある）か、物語型の S（ties だけ。好意は opt.back で渡す。なければ 0 とみる）。乱数は使わない */
  var clampG = function (v, lo, hi) { return v < lo ? lo : v > hi ? hi : v; };
  function gTies(x, a, b) {
    if (x && x.R && x.pair) return HK.Ties ? HK.Ties.all(x, a, b) : [];
    return ((x && x.ties) || []).filter(function (t) { return (t.a === a.i && t.b === b.i) || (t.a === b.i && t.b === a.i); });
  }
  var G = HK.Gap = {
    /* a の b への想いの強さ（0〜100） */
    self: function (x, a, b) {
      var v = 0, l = gTies(x, a, b);
      l.forEach(function (t) {
        var from = t.a === a.i;
        if (t.type === 'yan' && from) v = Math.max(v, 55);
        if (t.type === 'honmei' && from) v = Math.max(v, 70);
        if (t.type === 'blind' && from) v = Math.max(v, 75);
        if (t.type === 'enemy' && (from || !t.cold)) v = Math.max(v, t.grade === 'hate' ? 90 : 60);
        if (t.type === 'fear' && from) v = Math.max(v, 60);
      });
      /* 執着の段階（obsess-kit.js の執着度）があれば、そちらを使う */
      if (x && x.R && HK.Obsess && HK.Obsess.state) { var pf = x.pair(a, b); if (pf.ob && pf.ob[a.i]) v = Math.max(v, pf.ob[a.i].lv || 0); }
      else if (x && x.obs && x.obs[a.i + '>' + b.i]) v = Math.max(v, x.obs[a.i + '>' + b.i].lv || 0);
      return clampG(v, 0, 100);
    },
    /* b の a への好意（0〜100）と、b がほかの人に向けているいちばん高い好意 */
    back: function (x, a, b, opt) {
      if (opt && opt.back != null) return { to: clampG(opt.back, 0, 100), other: clampG(opt.other || 0, 0, 100) };
      if (!(x && x.R && x.chars)) return { to: 0, other: 0 };
      var to = clampG(x.R(b, a).aff, 0, 100), other = 0;
      x.chars.forEach(function (c) { if (c !== a && c !== b && c.alive !== false) other = Math.max(other, clampG(x.R(b, c).aff, 0, 100)); });
      return { to: to, other: other };
    },
    of: function (x, a, b, opt) {
      if (!x || !a || !b || a === b) return 0;
      var s = opt && opt.self != null ? opt.self : G.self(x, a, b), bk = G.back(x, a, b, opt);
      if (s <= 0) return 0;
      var g = Math.max(0, s - bk.to) / 100;
      if (bk.other > bk.to) g += (bk.other - bk.to) / 200;
      return clampG(g, 0, 1);
    },
    k: function (x, a, b, opt) {
      var d = HK.Dark ? HK.Dark.pick(x, 0.6, 1, 1.4) : 1;
      return (1 + 1.2 * G.of(x, a, b, opt)) * d;
    },
    why: function (x, a, b, opt) {
      var s = opt && opt.self != null ? opt.self : G.self(x, a, b), g = G.of(x, a, b, opt);
      if (s <= 0) return '';
      return '想いの差：' + (g >= 0.55 ? '大' : g >= 0.25 ? '中' : '小') + '（自分 ' + Math.round(s) + '／相手 ' + Math.round(G.back(x, a, b, opt).to) + '）';
    }
  };
  if (!HK.TL) return;
  var LOVE = 'lover,mate,fated,almost,crush,fwb,ex', HATE = 'enemy,bad,sibbad', RIVAL = 'rival', CLOSE = 'friend,colleague,buddy,childhood,best,sibling,sibprot,sibclose,parent,pparent,mentor,master,teacher,classmate,boss,benefactor,relative,worship,fond,blind';
  function inL(t, l) { return l.split(',').indexOf(t) >= 0; }
  function ties(S, a, b) { return (S.ties || []).filter(function (t) { return (t.a === a.i && t.b === b.i) || (t.a === b.i && t.b === a.i); }); }
  function has(S, a, b, l) { return ties(S, a, b).some(function (t) { return inL(t.type, l); }); }
  /* 恋愛の関係（元恋人は、敵意と重なったときだけ愛憎の材料になる） */
  function love(S, a, b) { return ties(S, a, b).some(function (t) { return inL(t.type, LOVE) && (t.type !== 'crush' || t.a === a.i || t.b === a.i); }); }
  /* a → b の嫌悪レベル（hate-kit.js があれば、箱庭の中で上下する値を使う） */
  function lv(S, a, b) { return HK.HateKit ? HK.HateKit.level(S, a, b) : has(S, a, b, HATE) ? 50 : 0; }
  /* 恋愛対象・受け攻めの合わない組（攻め×攻めも）：唇や体には踏み込まない */
  var NOTOUCH = ['{a}は{b}の胸ぐらを掴みかけて、寸前でその手を下ろした。{a}「もういい。顔も見たくない｜＝｜もう結構です。顔も見たくありません」――{a}は背を向けて、足音も荒く出ていった。', '{a}は{b}の肩を突き飛ばした。{b}もすぐに{a}の腕を払いのけた。二人は荒い息のまま睨み合い、どちらも一歩も引かなかった。', '{a}は{b}に掴みかかったが、{b}はその手を冷たく振り払った。{b}「触らないで。話はもう終わり｜触るな。話はもう終わりだ｜触らないでください。話はもう終わりです」――{a}は拳を握りしめたまま、何も言い返せなかった。', '{a}と{b}は、互いの腕を掴んだまま、一歩も引かずに睨み合った。先に目を逸らしたほうが負けだと、二人とも分かっていた。'];
  var NOTOUCH_AFTER = ['それきり、二人は目も合わせなかった。', '仲間が割って入るまで、二人の睨み合いは続いた。', '残された沈黙は、口論の前よりも重かった。'];
  var KISS = ['{a}は{b}の腕を掴んで壁に押しつけ、噛みつくように唇を奪った。{b}が{a}の頬を張った。それでも、{a}は離さなかった。', '{a}は{b}の胸ぐらを掴み、そのまま強く抱きすくめた。{b}がもがくほど、{a}の腕には力がこもった。'];
  /* 強引な側が受けの組（{b}が自分で攻めを選んでいる等）：掴みかかった{a}を、{b}が逆に押さえ込む */
  var REV = ['{a}は{b}の胸ぐらを掴んだ。{b}はその手首を掴み返し、逆に{a}を壁に押しつけて、噛みつくように唇を奪った。{a}が{b}の頬を張っても、{b}は離さなかった。', '{a}は{b}に掴みかかった。{b}は{a}の両手首をひとまとめに押さえ込み、「……で？」と見下ろした。{a}は唇を噛んで、顔を背けた。'];
  /* r18:begin */
  /* 女性どうし（R18版のみ使う）：揉み合いの延長で、指と舌で */
  var FF_CLASH = ['{a}は{b}の手首を掴んで壁に押しつけ、噛みつくように唇を奪った。もがく{b}の服の中に、{a}の手が乱暴に滑り込んだ。', '{a}は{b}を床に組み伏せ、抗う腕を頭の上で押さえつけた。「黙ってて｜黙っていろ｜黙っていてください」――{a}の指が、{b}の下着の奥を容赦なく探った。', '{a}は{b}の襟元を掴んで布団の上に投げ出し、脚のあいだに膝を割り込ませた。{b}の罵声は、{a}の指が動くたびに、甘い声に崩れていった。'];
  function ffClash(S, a, b, pk) {
    var R = HK.R18M, f = function (x) { return x.replace(/\{a\}/g, a.name).replace(/\{b\}/g, b.name); };
    var ctx = { pick: pk }, t = f(pk(FF_CLASH));
    if (R) t += R.resist(S, a, b, { endure: false });
    if (HK.FF) t += f(HK.FF.pick(ctx, 'body', 'rough')) + (R ? R.say(S, b, 'climax') : '') + f(HK.FF.pick(ctx, 'climax', 'rough'));
    return t;
  }
  /* r18:end */
  /* 以前の判定（愛憎の欄を設定していない組）：恋愛の関係と、敵視（どちらかの嫌悪が不仲以上）かライバルが重なっている。向きはない */
  function lhOld(S, a, b) { return love(S, a, b) && (lv(S, a, b) >= 35 || lv(S, b, a) >= 35 || has(S, a, b, RIVAL)); }
  /* 愛憎の欄（tie.lh）を、この二人のあいだの敵対・不仲に設定しているか */
  function lhSet(S, a, b) { return !!(HK.LoveHate && HK.LoveHate.dir(S, a, b)); }
  /* 同じ二人の「構う」（hate-love.js）と「揉める」を、同じ区切りで重ねないための記録（S.lhLast[組] = 区切りの値） */
  function lhKey(a, b) { return a.i < b.i ? a.i + '-' + b.i : b.i + '-' + a.i; }
  var F = HK.Feud = {
    ties: ties, has: has, level: lv,
    /* 愛憎の二人か（向きは問わない）。愛憎の欄を設定していればそれ（HK.LoveHate.any）、なければ以前の判定 */
    lovehate: function (S, a, b) { return lhSet(S, a, b) ? HK.LoveHate.any(S, a, b) : lhOld(S, a, b); },
    /* a が b に愛憎を抱いているか（揉めながら構う・身を挺して守るのは、こちらが真の側）。以前の判定は両方向とも真 */
    lhFrom: function (S, a, b) { return lhSet(S, a, b) ? HK.LoveHate.has(S, a, b) : lhOld(S, a, b); },
    /* 理由の欄の一言 */
    lhWhy: function (S, a, b) { return (lhSet(S, a, b) && HK.LoveHate.why(S, a, b)) || '憎しみと執着が、同じだけ育っている'; },
    /* 同じ二人の愛憎の出来事（構う・揉める）の区切りの記録 */
    lhMark: function (S, a, b, t) { (S.lhLast = S.lhLast || {})[lhKey(a, b)] = t; },
    lhLast: function (S, a, b) { var m = S.lhLast && S.lhLast[lhKey(a, b)]; return m == null ? null : m; },
    /* 揉める場面で、唇・体に踏み込んでよい組か：恋愛対象を両方向（HK.canLove は受け攻め・恋愛相手の固定・一途・恋愛・R18にしない相手も見る） */
    touchOk: function (S, a, b) {
      if (!a || !b || a === b || !HK.canLove || !HK.canLove(a, b) || !HK.canLove(b, a)) return false;
      if (HK.ngExplicit && HK.ngExplicit(a, b)) return false;
      return !HK.Pos || HK.Pos.okSex(a, b);
    },
    /* 体を重ねてよい組か（R18に参加しない・性行為の相手の固定・全年齢モードなど。HK.LoveHate.sexOk） */
    bodyOk: function (S, a, b) { return F.touchOk(S, a, b) && (!HK.LoveHate || HK.LoveHate.sexOk(S, a, b)); },
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
    /* 愛憎の二人が揉めたときの描写（{text, r18, touch}）。a=強引な側。R18版では solo-feud-r18.js が r18Clash を足す
       恋愛対象・受け攻めの決まり：唇・体に踏み込むのは F.touchOk の組だけ（合わない組・攻め×攻めは NOTOUCH で口論と掴み合いまで。touch: false）。
       体を奪う場面は、F.bodyOk の組で、強引な側 a が攻め（HK.Pos.order の先頭）のときだけ。
       向きが逆（b が攻め）なら、唇だけの揉み合いで、b が逆に押さえ込む（攻めを選んだ人を受けにしない）。女性どうしは指と舌の描写（FF_CLASH） */
    clash: function (S, a, b, pick) {
      var t = a.name + 'と' + b.name + 'の口論は、いつの間にか怒鳴り合いになっていた。' + HK.TL.line(a, 'LH_CLASH', b);
      var fill = function (x) { return x.replace(/\{a\}/g, a.name).replace(/\{b\}/g, b.name); };
      if (!F.touchOk(S, a, b)) return { text: t + (pick ? fill(pick(NOTOUCH)) + pick(NOTOUCH_AFTER) : ''), r18: false, touch: false };
      var Pz = HK.Pos, aTop = !Pz || Pz.order(a, b, [a, b])[0] === a;
      var pk = pick || function (l) { return l[0]; };
      if (aTop && F.r18Clash && F.r18On && F.r18On(S) && F.bodyOk(S, a, b)) {
        if (Pz && Pz.ff(a, b)) return { text: t + ffClash(S, a, b, pk) + HK.TL.line(a, 'LH_AFTER', b), r18: true, touch: true };
        return { text: t + F.r18Clash(S, a, b) + HK.TL.line(a, 'LH_AFTER', b), r18: true, touch: true };
      }
      var l = aTop ? KISS : REV;
      return { text: t + (pick ? fill(pick(l)) : '') + HK.TL.line(a, 'LH_AFTER', b), r18: false, touch: true };
    }
  };

  /* ---------- 憎悪（敵対の度合い grade: 'hate'。2026-10-25）----------
     a が b を憎んでいる（敵対の関係で {a}＝敵視する側、度合い「憎悪」）。出来事：貶める・陥れる・孤立させる・危害
     ・危害は「死のある箱庭」（opt.lethal）だけ命に関わりうる。重みと致命の見込みに想いの差（HK.Gap.k）と展開の重さ（harm・kill）を掛ける
     ・全年齢版・全年齢モードでは、危害は脅しまで（死には至らない）
     ・反応は b（憎まれている側）の態度9種。台詞の一人称は「私」で書き、口調の言い換えに任せる
     文は物語型の箱庭（tie-new-story.js）からも使える：HK.Feud.HATE[種類]・HK.Feud.HATE_RE[種類][態度] */
  var L2 = function (s) { return s.split('|'); };
  F.hateGrade = function (x, a, b) {
    return ties(x && x.R && x.pair ? { ties: HK.Ties ? HK.Ties.all(x, a, b) : [] } : x, a, b).some(function (t) { return t.type === 'enemy' && t.grade === 'hate' && t.a === a.i; });
  };
  F.HATE = {
    demean: L2('{a}は皆の前で、{b}の失敗をわざとらしく数え上げた。「よくそれで平気な顔をしていられるね｜よくそれで平気な顔をしていられるな｜よくそれで平気な顔をしていられますね」――笑い声が起きるのを、{a}は冷たい目で確かめていた。|{a}は{b}の意見を最後まで聞かずに遮った。「誰も{b}にそんなこと頼んでない｜誰も{b}にそんなことは頼んでいない｜誰も{b}にそんなことは頼んでいません」――その言い方には、はっきりとした侮蔑がこもっていた。|{a}は{b}の持ち物を指先でつまみ上げ、汚いものでも見るように放り捨てた。「こういうところに、育ちが出るよね｜こういうところに、育ちが出るものだ｜こういうところに、育ちが出ますよね」'),
    trap: L2('{a}は自分のしくじりを、さりげなく{b}のせいにした。辻褄の合う話を、{a}は前もって用意していた。|{a}は{b}が任された段取りに、こっそり手を入れた。何も知らない{b}は、皆の前で恥をかくことになった。|{a}は{b}にわざと間違ったことを教えた。{b}がその通りに動いて失敗するのを、{a}は少し離れたところから眺めていた。'),
    isolate: L2('{a}は{c}の耳もとで、{b}についての根も葉もない話を囁いた。{c}はその日から、{b}と目を合わせなくなった。|{a}は{b}を誘わないように、{c}に念を押した。「あの人がいると、空気が悪くなるから｜あの人がいると、空気が悪くなる｜あの人がいると、空気が悪くなりますから」|{a}は{b}が席を外したすきに、{c}たちに{b}の陰口を吹き込んだ。戻ってきた{b}を迎えたのは、気まずい沈黙だった。'),
    harm: L2('{a}は{b}が一人になるのを待って、背後から突き飛ばした。{b}は硬い床に叩きつけられ、しばらく起き上がれなかった。|{a}は{b}の足もとに、わざと危ないものを仕掛けておいた。{b}は手を深く切り、血が止まらなかった。|{a}は{b}の水筒に、何かを混ぜた。{b}はその夜、ひどい熱と吐き気に苦しんだ。'),
    harmKill: L2('{a}は{b}を人目のない場所へ呼び出し、二度と戻らせなかった。帰ってきた{a}の袖口には、乾いた血がこびりついていた。|{a}は{b}が助けを求める声を聞きながら、扉を閉めた。{a}がもう一度扉を開けたとき、{b}はもう動かなかった。|{a}は最後まで{b}の目を見ていた。「ずっと、こうしたかった｜＝｜ずっと、こうしたかったんです」――それが、{b}が聞いた最後の言葉だった。'),
    threat: L2('{a}は{b}の前に立ちふさがり、低い声で告げた。「次に私の前に出てきたら、ただじゃおかない｜次に私の前に出てきたら、ただではおかない｜次に私の前に出てきたら、ただではおきません」|{a}は{b}の胸ぐらを掴みかけて、寸前で手を止めた。その目に宿ったものの冷たさに、{b}は思わず後ずさった。|{a}は{b}の荷物の上に、「消えろ｜＝｜消えてください」と書いた紙を置いた。字は、隠す気もないほど{a}のものだった。')
  };
  F.HATE_RE = {
    demean: {
      proud: L2('{b}は拳を握りしめた。「言いたいことはそれだけか。……覚えてろよ」'), stern: L2('{b}は表情を変えずに言った。「事実と違う。訂正してもらう」――声は低く、震えていなかった。'),
      tsun: L2('{b}「な、なによ……！　そんな言い方しなくてもいいでしょ！」{b}の目には、悔し涙がにじんでいた。'), gentle: L2('{b}は困ったように笑ったが、膝の上の手は小さく震えていた。「……そう見えるなら、ごめんね」'),
      devoted: L2('{b}は俯いて唇を噛んだ。「私、そんなに駄目かな……」――誰も、その問いには答えなかった。'), cool: L2('{b}は肩をすくめた。「論点がずれている。私の話をしたいなら、根拠を出して」'),
      free: L2('{b}は「はいはい、私が悪うございました」とおどけてみせた。けれど、そのあと{b}はしばらく誰とも口をきかなかった。'), shy: L2('{b}は真っ赤になって俯き、何も言い返せなかった。小さな背中が、さらに小さくなった。'),
      polite: L2('{b}は丁寧に頭を下げた。「ご指摘、肝に銘じます」――その丁寧さが、かえって場を冷やした。')
    },
    trap: {
      proud: L2('{b}「……ふざけんな。誰がやったか、分かってんだよ」{b}は{a}を睨みつけたが、証拠は何もなかった。'), stern: L2('{b}は黙って責めを受けた。言い訳をするより先に、誰がこれを仕組んだのかを考えていた。'),
      tsun: L2('{b}「私じゃないもん！　……信じてくれなくても、私じゃない！」'), gentle: L2('{b}は皆に謝った。自分のせいではないと分かっていても、責める相手を探す気にはなれなかった。'),
      devoted: L2('{b}は何度も頭を下げた。「ごめんなさい、私がちゃんとしていれば……」――{a}は、その姿を見て薄く笑った。'), cool: L2('{b}は失敗の跡を一つずつ確かめ、手が加えられた箇所に気づいた。{b}は何も言わず、{a}の顔を見た。'),
      free: L2('{b}は「あれ、おかしいな」と首をかしげた。笑ってごまかしたが、その目は{a}のほうを鋭く見ていた。'), shy: L2('{b}は泣きそうな顔で立ち尽くした。どうしてこうなったのか、{b}にはまるで分からなかった。'),
      polite: L2('{b}は静かに言った。「私の不手際ということにしておきます。……今は、ですが」')
    },
    isolate: {
      proud: L2('{b}は空いた席を見て舌打ちした。「群れなきゃ何もできねえ連中だな」――強がりの声は、少しかすれていた。'), stern: L2('{b}は誰にも声をかけず、一人で黙々と自分の務めを続けた。背筋だけは、まっすぐに伸ばしたままだった。'),
      tsun: L2('{b}「べ、別に一人でも平気だし！」――そう言った{b}は、誰もいない方を向いて目をこすった。'), gentle: L2('{b}は輪から外されたことに気づいて、そっと離れた。誰かを責めるより、自分が何をしたのかを考えていた。'),
      devoted: L2('{b}は何度も皆の顔をうかがった。誰も目を合わせてくれないことが、何より堪えた。'), cool: L2('{b}は周りの態度の変化を冷静に見ていた。誰が話を流したのか、見当はついていた。'),
      free: L2('{b}は一人で鼻歌を歌いながら、平気なふりをした。歌は、途中で途切れた。'), shy: L2('{b}は隅のほうで膝を抱えた。話しかけられないことには慣れているつもりだったのに、胸が痛かった。'),
      polite: L2('{b}は「お邪魔のようですので」と小さく会釈して、その場を離れた。')
    },
    harm: {
      proud: L2('{b}は痛みに顔を歪めながら、{a}を睨み返した。「……やってくれたな」'), stern: L2('{b}は呻き声一つ上げずに傷を押さえた。その目は、まっすぐ{a}に向いていた。'),
      tsun: L2('{b}「痛っ……な、なんでこんなこと……！」{b}の声は、恐怖と怒りで裏返っていた。'), gentle: L2('{b}は傷を押さえて座り込んだ。「……どうして、ここまで」――その問いに、{a}は答えなかった。'),
      devoted: L2('{b}は震える声で言った。「私、何かしたなら謝るから……もう、やめて」'), cool: L2('{b}は自分の傷の具合を淡々と確かめた。「これは事故じゃない」――それだけを、はっきり口にした。'),
      free: L2('{b}は笑おうとして、うまく笑えなかった。痛みより、{a}の目のほうが怖かった。'), shy: L2('{b}は声も出せずに震えていた。{a}の影が、すぐそばにあった。'),
      polite: L2('{b}は荒い息を整えてから言った。「……このことは、決して忘れません」')
    }
  };
  F.HATE_RE.threat = F.HATE_RE.harm;
})();
