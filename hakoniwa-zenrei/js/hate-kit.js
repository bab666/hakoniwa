/* 箱庭シミュレーター: 敵視・不仲・敵対の共通部品（いくつかの箱庭で使う）
   ■ 嫌悪レベル（a が b をどれだけ嫌っているか。0〜100、向きがある）
     ・関係の値で動く箱庭（ゾンビ・クラスメイト・合コン・出られない部屋・オメガバース）は、緊張と好意から計算する
     ・物語型の箱庭（邪神村・吹雪の館・人狼・媚薬ロッカー）は、設定した関係から始めて、出来事で上下させる
     ・35〜64 は不仲、65 以上は敵対としてふるまう。箱庭の中で上下し、境目を越えると、同じ出来事でも重さが変わる
   ■ 相手の気持ち（b が a をどう見ているか）：hate（お互いに敵視）／none（なんとも思っていない）／normal（ふつう）／friend（友人）／love（愛している）
     設定した「相手の気持ち」があればそれを、なければ関係の値から決める
   ■ 性格で動き方が変わる
     敵視する側：active（正面から絡む）／cold（冷たく無視する）／passive（避ける・陰で嫌う）
     相手　　　：np（歩み寄る）／cp（言い返す）／fc（からかってつきまとう）／cold（気にしない）／ac（傷ついて引く）／mild
   ■ 出来事：出会ったとき／嫌がらせ／無視／友人だと思っている相手の誘い・かばう／愛している相手の歩み寄りと嫌悪／お互いの衝突
   台詞は tone-lines.js・tone-lines-hate.js（口調ごとの書き下ろし） */
(function () {
  'use strict';
  var HK = window.HK, clamp = HK.clamp;
  if (!HK.TL) return;
  var TL = HK.TL;
  function L(s) { return s.split('|'); }
  function isCtx(x) { return !!(x && x.R && x.pair && x.chars); }
  function tieList(x, a, b) {
    if (isCtx(x)) return HK.Ties ? HK.Ties.all(x, a, b) : [];
    return (x.ties || []).filter(function (t) { return (t.a === a.i && t.b === b.i) || (t.a === b.i && t.b === a.i); });
  }
  function hateTie(x, a, b) {
    var l = tieList(x, a, b);
    for (var i = 0; i < l.length; i++) { var D = HK.TIES[l[i].type]; if (D && D.hate && l[i].a === a.i) return l[i]; }
    for (var j = 0; j < l.length; j++) { var D2 = HK.TIES[l[j].type]; if (D2 && D2.hate && !l[j].cold) return l[j]; }
    return null;
  }
  /* b から a への「相手の気持ち」の設定（a が b を敵視する関係で、b の側の気持ち） */
  function backOf(x, a, b) {
    var l = tieList(x, a, b);
    for (var i = 0; i < l.length; i++) { var D = HK.TIES[l[i].type]; if (D && D.hate && l[i].a === a.i && l[i].cold) return l[i].cold; }
    return '';
  }
  var LOVE_T = 'lover,mate,fated,almost,crush,fwb', FRIEND_T = 'friend,best,buddy,childhood,colleague,sibclose,sibling,senpai,mentor,classmate,boss,benefactor,relative,worship';
  function hasT(x, a, b, list) { return tieList(x, a, b).some(function (t) { return list.split(',').indexOf(t.type) >= 0 && (t.type !== 'crush' || t.a === a.i); }); }

  /* 物語型：嫌悪レベルの表（設定した関係から始める） */
  function storyMap(S) {
    if (S.hate) return S.hate;
    var m = S.hate = {};
    (S.ties || []).forEach(function (t) {
      var D = HK.TIES[t.type];
      if (!D || !D.hate) return;
      var v = D.hate === 2 ? 78 : 46;
      m[t.a + '>' + t.b] = Math.max(m[t.a + '>' + t.b] || 0, v);
      if (!t.cold) m[t.b + '>' + t.a] = Math.max(m[t.b + '>' + t.a] || 0, v);
    });
    return m;
  }

  var H = HK.HateKit = {
    /* a → b の嫌悪レベル */
    level: function (x, a, b) {
      if (!a || !b || a === b) return 0;
      if (isCtx(x)) { var r = x.R(a, b); return clamp(r.ten * 0.9 - r.aff * 0.7, 0, 100); }
      return storyMap(x)[a.i + '>' + b.i] || 0;
    },
    band: function (lv) { return lv >= 65 ? 'enemy' : lv >= 35 ? 'bad' : ''; },
    /* 嫌悪を上下させる。不仲⇔敵対の境目を越えたら、その一文を返す */
    shift: function (x, a, b, d) {
      var b0 = H.band(H.level(x, a, b));
      if (isCtx(x)) x.mod(a, b, d > 0 ? { ten: d * 0.8, aff: -d * 0.4 } : { ten: d * 0.6, aff: -d * 0.6 });
      else { var m = storyMap(x), k = a.i + '>' + b.i; m[k] = clamp((m[k] || 0) + d, 0, 100); }
      var b1 = H.band(H.level(x, a, b));
      if (b0 === b1) return '';
      if (b1 === 'enemy') return a.name + 'の胸の内で、' + b.name + 'への苛立ちは、はっきりとした敵意に変わった。';
      if (b0 === 'enemy') return a.name + 'の' + b.name + 'への敵意は、少しだけ角が取れた。まだ、好きにはなれないけれど。';
      if (b1 === 'bad') return a.name + 'は、いつの間にか' + b.name + 'のことを、はっきり嫌うようになっていた。';
      return a.name + 'は、もう前ほど' + b.name + 'を嫌ってはいなかった。';
    },
    /* b から見た a（a が b を敵視しているときの、b の気持ち） */
    stance: function (x, b, a) {
      if (H.level(x, b, a) >= 35) return 'hate';
      var back = backOf(x, a, b);
      if (back) return back;
      if (hasT(x, b, a, LOVE_T)) return 'love';
      if (isCtx(x)) {
        var r = x.R(b, a);
        if (r.att >= 40 && r.aff >= 25) return 'love';
        if (r.aff >= 22) return 'friend';
        return r.aff >= 0 ? 'normal' : 'none';
      }
      return hasT(x, b, a, FRIEND_T) ? 'friend' : 'normal';
    },
    /* 敵視する側の動き方 */
    style: function (p) {
      var t = p.tr || {};
      var act = (t.aggr || 0) * 0.45 + (t.cp || 0) * 0.25 + (t.impulse || 0) * 0.25 + (t.fc || 0) * 0.1 - (t.ac || 0) * 0.3 - (t.caution || 0) * 0.15;
      if (act > 0.28) return 'active';
      if ((t.cold || 0) > 0.58) return 'cold';
      return 'passive';
    },
    /* 相手の受け止め方 */
    rstyle: function (p) {
      var t = p.tr || {};
      var l = [['np', t.np || 0], ['cp', (t.cp || 0) - 0.02], ['fc', (t.fc || 0) - 0.04], ['cold', (t.cold || 0) - 0.06], ['ac', (t.ac || 0) - 0.03]].sort(function (u, v) { return v[1] - u[1]; });
      return l[0][1] > 0.55 ? l[0][0] : 'mild';
    },
    /* どれくらい自分から絡みにいくか（出来事の起きやすさ） */
    drive: function (p, role) {
      var t = p.tr || {};
      if (role === 'hater') return clamp(0.35 + (t.aggr || 0) * 0.5 + (t.impulse || 0) * 0.3 + (t.cp || 0) * 0.2 - (t.ac || 0) * 0.25 - (t.caution || 0) * 0.2, 0.1, 1.2);
      return clamp(0.35 + (t.np || 0) * 0.4 + (t.fc || 0) * 0.3 - (t.cold || 0) * 0.3 - (t.ac || 0) * 0.2, 0.1, 1.2);
    },
    /* 敵対の強さで b を嫌っていて、強引な性格（出られない部屋の「媚薬を飲ませる」「乱暴に」） */
    forceful: function (x, a, b) {
      var t = a.tr || {};
      return H.level(x, a, b) >= 65 && (t.aggr || 0) * 0.5 + (t.cp || 0) * 0.3 + (t.impulse || 0) * 0.2 > 0.45;
    },
    /* 二人のうち、強引に出る側（いなければ null）。
       受け攻めの指定に従う：強引な側が、その組で攻めに回れない（相手が自分で攻めを選んだ人など）なら、乱暴にはできない */
    forcer: function (x, a, b) {
      var P = HK.Pos, can = function (f, o) { return !P || P.order(f, o, [f, o])[0] === f; };
      return H.forceful(x, a, b) && can(a, b) ? a : H.forceful(x, b, a) && can(b, a) ? b : null;
    },
    /* a が b を敵視している二人（a→b）。lv は a の嫌悪レベル */
    pairs: function (x, list, min) {
      var out = [];
      list.forEach(function (a) { list.forEach(function (b) { if (a !== b) { var lv = H.level(x, a, b); if (lv >= (min || 35)) out.push({ a: a, b: b, lv: lv, band: H.band(lv), st: H.stance(x, b, a) }); } }); });
      return out;
    },
    /* 関係の説明（理由の欄） */
    why: function (x, a, b) {
      var lv = Math.round(H.level(x, a, b)), st = H.stance(x, b, a), bd = H.band(lv);
      var SL = { hate: 'お互いに敵視', none: b.name + 'はなんとも思っていない', normal: b.name + 'はふつうに接している', friend: b.name + 'は友人だと思っている', love: b.name + 'は' + a.name + 'を愛している' };
      return a.name + '→' + b.name + '：' + (bd === 'enemy' ? '敵対' : '不仲') + '（嫌悪 ' + lv + '）／' + SL[st];
    }
  };

  /* ---------- 文 ---------- */
  var N = {
    meet: {
      enemy: { active: L('{a}は{b}に気づくと、まっすぐ歩み寄った。|{a}は{b}の姿を見るなり、足を止めて睨みつけた。'), cold: L('{a}は{b}を一瞥し、氷のような目で見下ろした。|{a}は{b}に気づいても、表情ひとつ変えなかった。目だけが、冷えきっていた。'), passive: L('{a}は{b}に気づくと、表情を消して距離を取った。握った拳が、かすかに震えていた。|{a}は{b}の姿を見つけて、物陰に身を引いた。') },
      bad: { active: L('{a}は{b}を見るなり、露骨に顔をしかめた。|{a}は{b}と目が合うと、聞こえよがしに舌打ちをした。'), cold: L('{a}は{b}に気づいても、目も合わせなかった。|{a}は{b}をいないものとして扱った。'), passive: L('{a}は{b}に気づくと、さりげなく反対側へ回った。|{a}は{b}の姿を見て、小さくため息をついた。') }
    },
    oblivious: L('{b}は、{a}の視線にすら気づいていなかった。|{b}は、自分が睨まれていることに、まるで気づいていなかった。'),
    mutualSilent: L('{b}も、無言で睨み返した。|{b}は、ふん、と鼻を鳴らしてそっぽを向いた。'),
    loveBlush: L('{b}の頬が、少しだけ緩んだ。|{b}は、{a}の顔を見ただけで、ほっとしたように笑った。'),
    loveAfter: L('{a}は、その笑顔から目を逸らした。|{a}は、何も答えずに背を向けた。{b}は、それでも嬉しそうだった。'),
    friendAfter: L('{a}は返事をしなかった。{b}は気にした様子もなく、隣に並んだ。|{a}の眉間の皺が、ほんの少しだけ深くなった。'),
    normalAfter: L('{a}は返事もせずに通り過ぎた。{b}は首を傾げた。|{a}は聞こえないふりをした。'),
    harass: L('{a}は、わざと{b}の肩にぶつかって通り過ぎた。|{a}は、{b}の荷物を、聞こえよがしに蹴飛ばした。|{a}は、{b}の分の食べ物を、何も言わずに自分の皿へ移した。|{a}は、{b}が話し始めると、わざと大きな声でかぶせた。'),
    shrug: L('{b}は肩をすくめただけで、気にも留めなかった。|{b}は荷物を拾い直して、何事もなかったように歩き出した。'),
    hurt: L('{b}は小さく「ごめん」とだけ言って、俯いた。|{b}は唇を噛んで、何も言い返さなかった。'),
    thaw: L('{a}は、しばらく黙っていた。|{a}は目を逸らして、小さく息を吐いた。'),
    snubCold: L('{a}は、聞こえないふりをした。|{a}は、{b}の差し出した手を、見もしなかった。'),
    snubPassive: L('{a}は黙って席を立った。|{a}は、気づかないふりをして、別の誰かに話しかけた。'),
    inviteYes: L('{a}は少し迷ってから、黙ってついていった。|{a}は舌打ちをしながらも、{b}の隣で手を動かした。'),
    defendLead: L('誰かが{a}の陰口を言いかけたとき、{b}がそれを遮った。|{a}が責められかけたとき、{b}が前に出た。'),
    giftLead: L('{b}は、取っておいた甘いものを、{a}に差し出した。|{b}は、どこかで見つけてきた小さな花を、{a}に差し出した。'),
    leanLead: L('{b}は、{a}の隣に、そっと腰を下ろした。|{b}は、{a}のほつれた袖を、黙って繕ってから、そのまま隣に座った。'),
    disgustAfter: { ac: L('{b}は差し出した手を、ゆっくり引っ込めた。|{b}は「ごめんね」と笑ったけれど、その目は濡れていた。'), np: L('それでも、{b}は笑っていた。「嫌われてても、いいんだ」|{b}は少しだけ寂しそうに笑って、それ以上は近づかなかった。'), fc: L('{b}は「つれないなあ」と笑って、またすぐ隣に戻ってきた。|{b}はまったく懲りていなかった。'), other: L('{b}は、それ以上何も言わなかった。|{b}は黙って、{a}から一歩離れた。') },
    melt: L('{a}は追い払おうとして、やめた。|{a}は、しばらく黙っていた。それから、小さく舌打ちをして、そのままにさせた。'),
    quarrelEnemy: L('{a}は{b}の胸ぐらを掴み、壁に押しつけた。|二人は、互いの襟首を掴んだまま、睨み合った。周りが慌てて割って入った。'),
    quarrelBad: L('二人の言い合いは、しばらく続いた。|言い合いは、どちらも引かないまま、平行線で終わった。')
  };
  function F(t, a, b) { return t.replace(/\{a\}/g, a.name).replace(/\{b\}/g, b.name); }
  function P(x, l) { return x.pickArr ? x.pickArr(l) : l[(x.rng() * l.length) | 0]; }

  /* 出会ったとき。{text, why, mag, cat} */
  H.meet = function (x, a, b, place) {
    var lv = H.level(x, a, b), band = H.band(lv) || 'bad', st = H.stance(x, b, a), sty = H.style(a), rs = H.rstyle(b);
    var t = (place || '') + F(P(x, N.meet[band][sty]), a, b), d = 0;
    if (sty === 'active') t += TL.line(a, band === 'enemy' ? 'H_MEET_ENEMY' : 'H_MEET_BAD', b);
    if (st === 'hate') { t += rs === 'ac' || rs === 'cold' ? F(P(x, N.mutualSilent), a, b) : TL.line(b, 'R_HATE_BACK', a); d = 3; H.shift(x, b, a, 3); }
    else if (st === 'none') {
      if (sty !== 'active' || rs === 'cold') { t += F(P(x, N.oblivious), a, b); d = 4; }
      else { t += TL.line(b, 'R_MEET_NONE', a); d = 3; }
    } else if (st === 'normal') { t += TL.line(b, 'R_MEET_NORMAL', a) + F(P(x, N.normalAfter), a, b); d = 2; }
    else if (st === 'friend') { t += TL.line(b, 'R_MEET_FRIEND', a) + F(P(x, N.friendAfter), a, b); d = (a.tr.np || 0) > 0.6 ? -3 : 2; }
    else { t += TL.line(b, 'R_MEET_LOVE', a) + F(P(x, N.loveBlush), a, b) + F(P(x, N.loveAfter), a, b); d = 2; }
    var sh = H.shift(x, a, b, d);
    return { text: t + sh, why: H.why(x, a, b) + '／' + a.name + 'は' + { active: '正面から絡む', cold: '冷たく無視する', passive: '避ける' }[sty], mag: band === 'enemy' ? 22 : 16, cat: 'conflict' };
  };

  /* 嫌がらせ（敵視する側が正面から絡む） */
  H.harass = function (x, a, b) {
    var st = H.stance(x, b, a), rs = H.rstyle(b), lv = H.level(x, a, b);
    var t = F(P(x, N.harass), a, b) + TL.line(a, 'H_JAB', b), d = 0, why = '';
    if (st === 'hate') { t += TL.line(b, 'R_HATE_BACK', a); H.shift(x, b, a, 4); d = 4; why = 'お互いに敵視'; }
    else if (rs === 'np' || (st === 'friend' && rs !== 'cold') || (st === 'love' && rs !== 'ac')) {
      t += TL.line(b, 'R_PEACE', a);
      if (x.rng() < 0.25 + (b.tr.np || 0) * 0.3 - (a.tr.aggr || 0) * 0.25 - lv / 400) { t += F(P(x, N.thaw), a, b) + TL.line(a, 'H_THAW', b); d = -14; why = b.name + 'の歩み寄りで、' + a.name + 'の角が取れた'; }
      else { t += TL.line(a, 'H_BACKFIRE', b); d = 8; why = b.name + 'の歩み寄りが、かえって' + a.name + 'の癇に障った'; }
    } else if (rs === 'cp') { t += TL.line(b, 'R_PUSHBACK', a); d = 6; H.shift(x, b, a, 12); why = b.name + 'は言い返した（' + b.name + 'の嫌悪も上がった）'; }
    else if (rs === 'fc') { t += TL.line(b, 'R_TEASE', a); d = 5; why = b.name + 'はからかって受け流した'; }
    else if (rs === 'cold') { t += F(P(x, N.shrug), a, b); d = 5; why = b.name + 'は気にも留めなかった（それがまた癇に障った）'; }
    else { t += F(P(x, N.hurt), a, b) + TL.line(b, 'R_PUZZLED', a); d = st === 'love' ? 1 : 2; why = b.name + 'は理由が分からず傷ついた'; }
    if (isCtx(x) && x.stress) x.stress(b, st === 'love' ? 12 : 6);
    return { text: t + H.shift(x, a, b, d), why: H.why(x, a, b) + '／' + why, mag: 20, cat: 'conflict' };
  };
  /* 無視（冷たい・避ける側に、相手が話しかける） */
  H.snub = function (x, a, b) {
    var st = H.stance(x, b, a), rs = H.rstyle(b), sty = H.style(a);
    var line = st === 'friend' ? 'R_INVITE' : st === 'love' ? 'R_MEET_LOVE' : 'R_MEET_NORMAL';
    var t = TL.line(b, line, a) + F(P(x, sty === 'cold' ? N.snubCold : N.snubPassive), a, b), d = 2;
    if (rs === 'fc' || (st === 'love' && rs === 'np')) { t += TL.line(b, 'R_TEASE', a); d = 3; }
    else if (rs === 'ac' || st === 'love') { t += F(P(x, N.hurt), a, b); if (isCtx(x) && x.stress) x.stress(b, 8); }
    return { text: t + H.shift(x, a, b, d), why: H.why(x, a, b) + '／' + a.name + 'は' + (sty === 'cold' ? '冷たく無視した' : '避けた'), mag: 14, cat: 'solo' };
  };
  /* 友人だと思っている相手：誘う／かばう */
  H.friendGap = function (x, a, b) {
    if (x.rng() < 0.45) {
      var t = F(P(x, N.defendLead), a, b) + TL.line(b, 'R_DEFEND', a) + TL.line(a, 'H_CONFUSED', b);
      return { text: t + H.shift(x, a, b, -12), why: H.why(x, a, b) + '／敵視している相手に、かばわれた（嫌悪 -12）', mag: 22, cat: 'bond' };
    }
    var t2 = TL.line(b, 'R_INVITE', a), yes = x.rng() < 0.3 + (a.tr.np || 0) * 0.3 - H.level(x, a, b) / 300;
    t2 += yes ? F(P(x, N.inviteYes), a, b) : TL.line(a, 'H_REFUSE', b);
    return { text: t2 + H.shift(x, a, b, yes ? -8 : 2), why: H.why(x, a, b) + '／' + (yes ? 'しぶしぶ誘いに乗った' : '誘いを断った'), mag: 16, cat: 'bond' };
  };
  /* 愛している相手：歩み寄る → 嫌悪（ときどき、ほどける） */
  H.loveGap = function (x, a, b, lead) {
    /* 差し出すものがあるときだけ「これ……」、ほかは、そばに寄る */
    var gift = !lead && x.rng() < 0.5;
    var t = (lead || F(P(x, gift ? N.giftLead : N.leanLead), a, b)) + TL.line(b, gift ? 'R_APPROACH' : 'R_LEAN', a), lv = H.level(x, a, b);
    if (x.rng() < 0.12 + (a.tr.np || 0) * 0.15 - lv / 500) {
      t += F(P(x, N.melt), a, b) + TL.line(a, 'H_CONFUSED', b);
      return { text: t + H.shift(x, a, b, -14), why: H.why(x, a, b) + '／好意を向けられて、嫌悪が揺らいだ', mag: 24, cat: 'romance' };
    }
    var rs = H.rstyle(b);
    t += TL.line(a, 'H_DISGUST', b) + F(P(x, N.disgustAfter[rs] || N.disgustAfter.other), a, b);
    if (isCtx(x) && x.stress) x.stress(b, rs === 'ac' ? 16 : 8);
    return { text: t + H.shift(x, a, b, 6), why: H.why(x, a, b) + '／好意が、嫌悪で返された', mag: 22, cat: 'romance' };
  };
  /* お互いに敵視：衝突（嫌悪の強さで重さが変わる） */
  H.quarrel = function (x, a, b) {
    var lv = H.level(x, a, b), enemy = lv >= 65 || H.level(x, b, a) >= 65, t;
    if (enemy) t = TL.line(a, 'H_THREAT', b) + TL.line(b, 'R_HATE_BACK', a) + F(P(x, N.quarrelEnemy), a, b);
    else t = TL.line(a, 'BAD_BLAME', b) + TL.line(b, 'BAD_RETORT', a) + F(P(x, N.quarrelBad), a, b);
    if (isCtx(x) && x.stress) { x.stress(a, 6); x.stress(b, 6); }
    var s1 = H.shift(x, a, b, 4), s2 = H.shift(x, b, a, 4);
    return { text: t + s1 + s2, why: H.why(x, a, b) + '／' + (enemy ? '敵対どうしの衝突' : '不仲どうしの口論'), mag: enemy ? 26 : 18, cat: 'conflict' };
  };
  /* 二人の関係に合う出来事を一つ（a が b を敵視） */
  H.pick = function (x, a, b) {
    var st = H.stance(x, b, a), sty = H.style(a), r = x.rng();
    if (st === 'hate') return H.quarrel(x, a, b);
    if (st === 'love' && r < 0.55) return H.loveGap(x, a, b);
    if (st === 'friend' && r < 0.5) return H.friendGap(x, a, b);
    return sty === 'active' ? H.harass(x, a, b) : H.snub(x, a, b);
  };

  /* ---------- 関係の値で動く箱庭に組み込む ----------
     opt: { w=重み, meet=最初に顔を合わせたときの反応を出すか, kinds=起きる出来事を絞る（'love' 好意が絡むときだけ など）, place=fn(ctx,a)→「〇〇で、」 } */
  H.install = function (scen, opt) {
    if (!scen || !scen.events || scen.hateKit) return;
    scen.hateKit = opt = opt || {};
    var W = opt.w || 1;
    function okKinds(ctx, a, b) {
      if (opt.kinds !== 'love') return true;
      return H.stance(ctx, b, a) === 'love' || hasT(ctx, a, b, LOVE_T);
    }
    /* 最初に顔を合わせたとき（ゾンビは、同じエリアで出会ったとき：zombie-core.js から H.meet を呼ぶ） */
    if (opt.meet !== false) scen.events.push({
      id: 'hk_meet', cat: 'conflict', scope: 'pair',
      when: function (ctx, a, b) { var pf = ctx.pair(a, b); return !(pf.hkMet && pf.hkMet[a.i]) && H.level(ctx, a, b) >= 35 && okKinds(ctx, a, b); },
      w: function (ctx, a, b) { return 6 * W * H.drive(a, 'hater'); },
      run: function (ctx, a, b) { var pf = ctx.pair(a, b); (pf.hkMet = pf.hkMet || {})[a.i] = 1; var r = H.meet(ctx, a, b, opt.place ? opt.place(ctx, a) : ''); return { text: r.text, why: r.why, mag: r.mag, cat: r.cat }; }
    });
    /* 敵視する側から */
    scen.events.push({
      id: 'hk_hater', cat: 'conflict', scope: 'pair',
      when: function (ctx, a, b) { return H.level(ctx, a, b) >= 35 && okKinds(ctx, a, b) && (ctx.pair(a, b).hkAt == null || ctx.stepIndex - ctx.pair(a, b).hkAt >= 2); },
      w: function (ctx, a, b) { return 1.6 * W * H.drive(a, 'hater') * (0.7 + H.level(ctx, a, b) / 100); },
      run: function (ctx, a, b) {
        ctx.pair(a, b).hkAt = ctx.stepIndex;
        var st = H.stance(ctx, b, a), r = st === 'hate' ? H.quarrel(ctx, a, b) : H.style(a) === 'active' ? H.harass(ctx, a, b) : H.snub(ctx, a, b);
        return { text: r.text, why: r.why, mag: r.mag, cat: r.cat };
      }
    });
    /* 敵視されている相手から（友人だと思っている・愛している・気づかずに話しかける） */
    scen.events.push({
      id: 'hk_receiver', cat: 'bond', scope: 'pair',
      when: function (ctx, b, a) { var st = H.stance(ctx, b, a); return H.level(ctx, a, b) >= 35 && st !== 'hate' && okKinds(ctx, a, b) && (ctx.pair(a, b).hkAt == null || ctx.stepIndex - ctx.pair(a, b).hkAt >= 2); },
      w: function (ctx, b, a) { var st = H.stance(ctx, b, a); return 1.4 * W * H.drive(b, 'receiver') * (st === 'love' ? 1.6 : st === 'friend' ? 1.3 : 0.6); },
      run: function (ctx, b, a) {
        ctx.pair(a, b).hkAt = ctx.stepIndex;
        var st = H.stance(ctx, b, a), r = st === 'love' ? H.loveGap(ctx, a, b, opt.approach ? opt.approach(ctx, a, b) : '') : st === 'friend' ? H.friendGap(ctx, a, b) : H.snub(ctx, a, b);
        return { text: r.text, why: r.why, mag: r.mag, cat: r.cat === 'romance' && opt.kinds === 'love' ? 'romance' : r.cat };
      }
    });
  };

  /* ---------- 物語型の箱庭で、一回ぶん（起きたら出来事、なければ null） ----------
     x=S。opt: { rate=起きやすさ, kinds='love' で好意が絡むときだけ, place=「〇〇で、」 } */
  H.storyTick = function (S, live, opt) {
    opt = opt || {};
    var ps = H.pairs(S, live).filter(function (p) { return opt.kinds !== 'love' || p.st === 'love' || hasT(S, p.a, p.b, LOVE_T); });
    if (!ps.length) return null;
    S.hkMet = S.hkMet || {};
    var fresh = ps.filter(function (p) { return !S.hkMet[p.a.i + '>' + p.b.i]; });
    if (fresh.length) {
      var f = fresh[(S.rng() * fresh.length) | 0];
      S.hkMet[f.a.i + '>' + f.b.i] = 1;
      if (opt.meet !== false) { var m = H.meet(S, f.a, f.b, opt.place || ''); m.actors = [f.a, f.b]; return m; }
    }
    if (S.rng() > (opt.rate || 0.12)) return null;
    var p = ps[(S.rng() * ps.length) | 0];
    var r = H.pick(S, p.a, p.b);
    r.actors = [p.a, p.b];
    return r;
  };
})();
