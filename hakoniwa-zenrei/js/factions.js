/* 箱庭診断: 派閥の形成・離合集散・独裁（クラスメイト／無人島） */
(function () {
  'use strict';
  var HK = window.HK;
  var F = (HK.Factions = {});
  function R(ctx, a, b) { return ctx.R(a, b); }
  function names(list) { return list.map(function (c) { return c.name; }).join('・'); }

  F.REGIME = {
    none: '派閥なし', single: '一大グループ＋はぐれ者', two: '二大派閥', three: '三つ巴', multi: '群雄割拠', dictator: '独裁'
  };

  function bond(ctx, o, L, prevLeader) {
    var r = R(ctx, o, L);
    return r.trust * 0.6 + r.aff * 0.4 + L.tr.lead * 18 - r.ten * 0.5 + (prevLeader === L.i ? 10 : 0) + (L.flags.leader ? 8 : 0);
  }
  function pull(ctx, L, P) {
    var s = 0;
    P.forEach(function (o) { if (o !== L) s += Math.max(0, bond(ctx, o, L, null)); });
    return s;
  }

  /* 現在の関係から派閥構造を算出 */
  F.evaluate = function (ctx) {
    var P = ctx.present(), th = ctx.env.faction || 4, prev = ctx.fac || { of: {} };
    if (P.length < th) {
      return { regime: 'none', reason: 'いま残っているのは' + P.length + '人。派閥に分かれるには少なすぎる（' + th + '人以上で派閥が生まれる設定）', groups: [], loners: P.map(function (c) { return c.i; }), of: {} };
    }
    var cands = P.filter(function (c) { return c.tr.lead > 0.42 || c.flags.leader; });
    if (!cands.length) {
      return { regime: 'none', reason: '人を引っぱる気質（CP・A高、AC低）の持ち主がいない。輪はできても派閥にはならない', groups: [], loners: P.map(function (c) { return c.i; }), of: {} };
    }
    var pw = {};
    cands.forEach(function (L) { pw[L.i] = pull(ctx, L, P) * (0.6 + L.tr.lead); });
    var join = {};
    P.forEach(function (o) {
      var best = null, bv = P.length > 12 ? 16 : 24;
      cands.forEach(function (L) {
        if (L === o) return;
        var v = bond(ctx, o, L, prev.of[o.i]);
        /* 主導性のある人でも、自分より求心力のある相手には補佐として付きやすい（NP・ACが高いほど、二番手に収まる） */
        if (cands.indexOf(o) >= 0) { if (pw[L.i] <= pw[o.i] * 1.2 || v + o.tr.np * 14 + o.tr.ac * 10 - o.tr.cp * 10 < 36) return; }
        if (v > bv) { bv = v; best = L; }
      });
      if (best) join[o.i] = best.i;
    });
    /* 連鎖をたどって頂点のリーダーへ */
    function root(i) { var seen = {}; while (join[i] != null && !seen[i]) { seen[i] = 1; i = join[i]; } return i; }
    var groupsBy = {};
    P.forEach(function (o) {
      if (join[o.i] == null) return;
      var r = root(o.i);
      (groupsBy[r] = groupsBy[r] || []).push(o.i);
    });
    var groups = Object.keys(groupsBy).map(function (k) { return { leader: +k, members: [+k].concat(groupsBy[k].filter(function (x) { return x !== +k; })) }; })
      .filter(function (g) { return g.members.length >= 2; })
      .sort(function (a, b) { return b.members.length - a.members.length; });
    /* 派閥は基本2〜3つ。4つ目以降の小さな輪は、近い派閥に吸収されるか、ばらけて無所属になる */
    var maxG = P.length >= 9 ? 3 : P.length >= 5 ? 3 : 2;
    while (groups.length > maxG) {
      var sm = groups.pop();
      sm.members.forEach(function (m) {
        var o = ctx.chars[m], best = null, bv = 30;
        groups.forEach(function (g) { var v = bond(ctx, o, ctx.chars[g.leader], prev.of[m]) + (m === sm.leader ? o.tr.np * 10 + o.tr.ac * 8 - o.tr.cp * 10 : 0); if (v > bv) { bv = v; best = g; } });
        if (best) best.members.push(m);
      });
      groups.sort(function (a, b) { return b.members.length - a.members.length; });
    }
    /* 一つの大きな輪しかないとき：そこに馴染めない側に、もう一人の中心ができやすい */
    if (groups.length === 1 && P.length >= 5) {
      var G0 = groups[0], L0 = ctx.chars[G0.leader];
      var rv = cands.filter(function (c) { return c !== L0 && pw[c.i] >= pw[L0.i] * 0.4; }).sort(function (x, y) { return (R(ctx, y, L0).ten - R(ctx, y, L0).trust + pw[y.i] / 20) - (R(ctx, x, L0).ten - R(ctx, x, L0).trust + pw[x.i] / 20); })[0];
      if (rv && R(ctx, rv, L0).trust < 35) {
        var side = P.filter(function (o) { return o !== L0 && o !== rv && bond(ctx, o, rv, prev.of[o.i]) > Math.max(20, bond(ctx, o, L0, prev.of[o.i]) - 4); });
        if (side.length) {
          G0.members = G0.members.filter(function (m) { return m !== rv.i && side.indexOf(ctx.chars[m]) < 0; });
          groups.push({ leader: rv.i, members: [rv.i].concat(side.map(function (o) { return o.i; })) });
          groups = groups.filter(function (g) { return g.members.length >= 2; }).sort(function (a, b) { return b.members.length - a.members.length; });
        }
      }
    }
    /* 補佐：派閥の中にいる、主導性のある人（二番手） */
    groups.forEach(function (g) { g.subs = g.members.filter(function (m) { return m !== g.leader && ctx.chars[m].tr.lead > 0.5; }); });
    var of = {};
    groups.forEach(function (g) { g.members.forEach(function (m) { of[m] = g.leader; }); });
    var loners = P.filter(function (c) { return of[c.i] == null; }).map(function (c) { return c.i; });
    var regime, reason = '';
    if (!groups.length) { regime = 'none'; reason = '中心になれる人物はいたが、まだ誰もついていくほど信頼していない'; }
    else if (groups.length === 1) {
      var L = ctx.chars[groups[0].leader];
      if (groups[0].members.length >= Math.ceil(P.length * 0.7) && L.tr.cp > 0.6 && L.tr.np < 0.6) {
        regime = 'dictator'; reason = L.name + 'のCP（' + Math.round(L.eg.CP) + '）と主導性に、ほぼ全員が従った';
      } else { regime = 'single'; reason = L.name + 'を中心に一つの輪ができた'; }
    } else regime = groups.length === 2 ? 'two' : groups.length === 3 ? 'three' : 'multi';
    return { regime: regime, reason: reason, groups: groups, loners: loners, of: of };
  };

  function sameKey(f) {
    return f.regime + '|' + f.groups.map(function (g) { return g.leader + ':' + g.members.slice().sort().join(','); }).join('/');
  }

  /* 1区切りごとに呼ばれる */
  F.step = function (ctx, s, n) {
    if (s === 0) return;
    var f = F.evaluate(ctx), prev = ctx.fac;
    var C = ctx.chars;
    ctx.facHist = ctx.facHist || [];
    var changed = !prev || sameKey(prev) !== sameKey(f);
    if (changed) narrate(ctx, prev, f);
    ctx.fac = f;
    if (changed || s === n - 1) ctx.facHist.push({ step: s, label: ctx.label, regime: f.regime, reason: f.reason, groups: JSON.parse(JSON.stringify(f.groups)), loners: f.loners.slice() });

    /* 派閥が関係に与える影響 */
    ctx.k = 1; ctx._mag = 0; ctx._touched = {};
    f.groups.forEach(function (g) {
      g.members.forEach(function (a) { g.members.forEach(function (b) { if (a !== b) ctx.mod(C[a], C[b], { trust: 2, aff: 1 }); }); });
    });
    for (var i = 0; i < f.groups.length; i++) for (var j = i + 1; j < f.groups.length; j++) {
      var A = C[f.groups[i].leader], B = C[f.groups[j].leader];
      ctx.mod2(A, B, { ten: 6 }, { ten: 6 });
      f.groups[i].members.forEach(function (m) { if (m !== A.i) ctx.mod(C[m], B, { ten: 2 }); });
      f.groups[j].members.forEach(function (m) { if (m !== B.i) ctx.mod(C[m], A, { ten: 2 }); });
    }
    if (f.regime === 'dictator') {
      f.loners.forEach(function (i) {
        var c = C[i];
        c.stress = HK.clamp(c.stress + 8, 0, 100);
        if (ctx.scen.id === 'island') c.hp -= 3;
      });
    }
    if (f.groups.length >= 2 && ctx.rng() < 0.45) clash(ctx, f);
    if (f.groups.length && ctx.rng() < 0.28) tide(ctx, f);
    if (f.groups.length) coup(ctx, f);
    if (f.regime === 'dictator' && f.loners.length && ctx.rng() < 0.55) purge(ctx, f);
  };

  function narrate(ctx, prev, f) {
    var C = ctx.chars, place = ctx.scen.id === 'island' ? '島' : 'クラス';
    var pof = prev ? prev.of : {};
    f.groups.forEach(function (g) {
      var L = C[g.leader];
      var was = prev && prev.groups.filter(function (x) { return x.leader === g.leader; })[0];
      if (!was) {
        var mem = g.members.filter(function (m) { return m !== g.leader; }).map(function (m) { return C[m]; });
        ctx.act2({ actors: [L].concat(mem), cat: 'bond', mag: 12, text: L.name + 'を中心に、' + names(mem) + 'がまとまり始めた。' + place + 'の中に「' + L.name + '派」ができた。', why: '信頼・好意と' + L.name + 'の主導性（' + Math.round(L.tr.lead * 100) + '）' });
      }
    });
    f.groups.forEach(function (g) {
      var was = prev && prev.groups.filter(function (x) { return x.leader === g.leader; })[0];
      (g.subs || []).forEach(function (m) {
        var c = C[m], L = C[g.leader];
        if (c.flags.subOf === L.i) return;
        c.flags.subOf = L.i;
        ctx.act2({ actors: [c, L], cat: 'bond', mag: 8, text: ctx.pick([c.name + 'は、自分が前に出るより' + L.name + 'を支える方を選び、' + L.name + '派の参謀役に収まった。', c.name + 'は' + L.name + 'の右腕として、細かな段取りを引き受けるようになった。', c.name + 'は「トップは' + L.name + 'でいい」と言い、二番手の席に座った。']),
          why: c.name + 'も主導性はある（' + Math.round(c.tr.lead * 100) + '）が、' + L.name + 'の求心力が上回った' + (c.tr.np + c.tr.ac > 1 ? '。NP・ACが高く、補佐に回るのが苦にならない' : '') });
      });
    });
    Object.keys(f.of).forEach(function (k) {
      var i = +k, nowL = f.of[i], oldL = pof[i];
      if (oldL == null || oldL === nowL || i === nowL) return;
      var c = C[i];
      ctx.act2({ actors: [c, C[oldL], C[nowL]], cat: 'betray', mag: 15, fx: function () { ctx.mod(C[oldL], c, { ten: 15, trust: -15 }); },
        text: c.name + 'は' + C[oldL].name + 'のグループを抜けて、' + C[nowL].name + 'の側についた。', why: c.name + 'の' + C[nowL].name + 'への信頼（' + Math.round(R(ctx, c, C[nowL]).trust) + '）が上回った' });
    });
    if (prev) prev.groups.forEach(function (g) {
      if (!f.groups.some(function (x) { return x.leader === g.leader; }) && C[g.leader].alive && !C[g.leader].out) {
        ctx.act2({ actors: [C[g.leader]], cat: 'solo', text: C[g.leader].name + '派は、いつの間にか散り散りになっていた。', why: '求心力の低下' });
      }
    });
    f.loners.forEach(function (i) {
      if (pof[i] != null && C[i].alive) ctx.act2({ actors: [C[i]], cat: 'solo', text: C[i].name + 'は、どの輪にも属さなくなった。', why: '誰に対しても信頼が足りなかった／' + (C[i].tr.cold > 0.55 ? 'ドライさ' : '居場所のなさ') });
    });
    if (f.regime === 'dictator' && (!prev || prev.regime !== 'dictator')) {
      var D = C[f.groups[0].leader];
      ctx.act2({ actors: [D], cat: 'conflict', mag: 20, text: D.name + 'の言葉が、そのまま' + place + 'の決まりになった。異を唱える者はほとんどいない。', why: f.reason });
    }
    if (prev && prev.regime === 'dictator' && f.regime !== 'dictator') {
      ctx.say({ text: C[prev.groups[0].leader].name + 'の支配が崩れた。' });
    }
    if (f.regime === 'none' && prev && prev.groups.length) ctx.say({ text: '派閥はなくなった。' + f.reason + '。' });
  }

  function clash(ctx, f) {
    var C = ctx.chars, A = C[f.groups[0].leader], B = C[f.groups[1].leader];
    var place = ctx.rng.pick(ctx.scen.id === 'island' ? ['水場と寝床の割り当て', '火の番の順番', '食料の分け方'] : ['席替えのやり方', '修学旅行の班決め', 'クラスTシャツのデザイン', '放課後の掃除当番']);
    ctx.act2({ actors: [A, B], cat: 'conflict', fx: function () { ctx.mod2(A, B, { ten: 12, aff: -6 }, { ten: 12, aff: -6 }); },
      text: place + 'を巡って、' + A.name + '派と' + B.name + '派が真っ二つに割れた。', why: '派閥の対立。双方の主導性' });
    var mid = f.groups[1].members.concat(f.groups[0].members).map(function (i) { return C[i]; }).filter(function (c) { return c !== A && c !== B && c.tr.np > 0.6 && c.tr.ac > 0.5; })[0];
    if (mid) ctx.act2({ actors: [mid], cat: 'help', fx: function () { ctx.mod(A, mid, { trust: 4 }); ctx.mod(B, mid, { trust: 4 }); ctx.stress(mid, 10); },
      text: mid.name + 'が両方の顔を立てて、なんとか話をまとめた。本人はその夜、ひどく疲れた顔をしていた。', why: mid.name + 'のNP・AC（板挟み役）' });
  }

  /* 月日の流れ：出来事で、派閥の勢いが変わる（求心力＝メンバーからの信頼が動く） */
  var TIDE = {
    classroom: { up: ['文化祭の出し物で大成功を収め', '体育祭のリレーで逆転勝ちを決め', '定期テストで学年上位に入り', '先生に一目置かれる発言をして'], down: ['文化祭の準備でメンバーと揉め', '修学旅行の班決めで仲間を一人置き去りにし', '陰口を言っていたことが広まり', 'テスト期間に誰の相談にも乗らず'] },
    island: { up: ['大物の魚を仕留めて皆に振る舞い', '嵐の夜に的確な指示を出し', '真水の湧く場所を見つけ'], down: ['食料の分配で自分の取り分を多くし', '狩りの失敗を人のせいにし', '嵐の夜に判断を誤り'] },
    _: { up: ['皆の前で頼れるところを見せ', '揉め事をうまく収め'], down: ['大事な場面で判断を誤り', '仲間の信頼を裏切るような真似をし'] }
  };
  function tide(ctx, f) {
    var C = ctx.chars, T = TIDE[ctx.scen.id] || TIDE._;
    var g = ctx.rng.pick(f.groups), L = C[g.leader], up = ctx.rng() < 0.5 + (L.tr.np * 0.2 + L.tr.a * 0.15 - L.tr.cold * 0.15);
    var all = ctx.present();
    ctx.act2({ actors: [L], cat: up ? 'bond' : 'conflict', mag: 12, fx: function () {
      all.forEach(function (o) { if (o !== L) ctx.mod(o, L, up ? { trust: g.members.indexOf(o.i) >= 0 ? 6 : 9, aff: 4 } : { trust: -12, aff: -6, ten: 6 }); });
    }, text: L.name + 'は' + ctx.pick(up ? T.up : T.down) + '、' + (up ? L.name + '派の勢いが増した。様子見していた者たちの目も、' + L.name + 'に向き始めた。' : L.name + '派の求心力に陰りが見えた。'), why: '月日の流れで変わる力関係（' + L.name + 'の' + (up ? 'NP・A：人を惹きつけた' : 'ドライさ・判断ミス') + '）' });
  }
  /* 補佐の下克上：二番手の求心力がトップを上回ると、派閥の頭が入れ替わる */
  function coup(ctx, f) {
    var C = ctx.chars;
    f.groups.forEach(function (g) {
      var L = C[g.leader];
      (g.subs || []).forEach(function (m) {
        var c = C[m]; if (!c.alive || c.out || g.done) return;
        var mine = g.members.filter(function (x) { return x !== m && x !== g.leader; });
        var sL = mine.reduce(function (t, x) { return t + R(ctx, C[x], L).trust; }, 0), sC = mine.reduce(function (t, x) { return t + R(ctx, C[x], c).trust; }, 0);
        if (mine.length && sC > sL + 25 && c.tr.cp + c.tr.lead > 1 && ctx.rng() < 0.5) {
          g.done = true;
          mine.forEach(function (x) { ctx.mod(C[x], c, { trust: 10 }); ctx.mod(C[x], L, { trust: -10 }); });
          ctx.mod2(L, c, { ten: 25, trust: -25 }, { ten: 10 });
          c.flags.leader = true; L.flags.leader = false;
          ctx.act2({ actors: [c, L], cat: 'betray', mag: 25, text: '気づけば、' + L.name + '派の皆が相談に行く相手は' + c.name + 'になっていた。' + c.name + 'は' + L.name + 'に代わって、派閥の先頭に立った。', why: '補佐の' + c.name + 'への信頼（' + Math.round(sC / mine.length) + '）が、' + L.name + 'への信頼（' + Math.round(sL / mine.length) + '）を上回った。' + c.name + 'のCP・主導性' });
        }
      });
    });
  }

  function purge(ctx, f) {
    var C = ctx.chars, D = C[f.groups[0].leader];
    var t = f.loners.map(function (i) { return C[i]; }).sort(function (a, b) { return (R(ctx, b, D).ten + b.tr.lead * 30) - (R(ctx, a, D).ten + a.tr.lead * 30); })[0];
    if (!t) return;
    var follower = f.groups[0].members.map(function (i) { return C[i]; }).filter(function (c) { return c !== D; });
    var doubter = follower.filter(function (c) { return c.tr.np > 0.6 && R(ctx, c, t).aff > 15; })[0];
    var island = ctx.scen.id === 'island';
    ctx.act2({ actors: [D, t], cat: 'conflict', mag: 15, fx: function () { ctx.mod(t, D, { ten: 18, aff: -10 }); ctx.stress(t, 15); if (island) t.hp -= 6; follower.forEach(function (c) { ctx.mod(c, t, { aff: -4 }); }); },
      text: island ? D.name + 'は、従わない' + t.name + 'の配給を減らすと決めた。誰も反対しなかった。' : D.name + 'のひと言で、クラスの誰も' + t.name + 'に話しかけなくなった。',
      why: D.name + 'の独裁。' + t.name + 'は輪の外にいた' });
    if (doubter) ctx.act2({ actors: [doubter, t, D], cat: 'help', fx: function () { ctx.mod(t, doubter, { aff: 14, trust: 14 }); ctx.mod(D, doubter, { ten: 8 }); },
      text: doubter.name + 'だけが、こっそり' + t.name + 'に' + (island ? '自分の分の魚を半分' : 'ノートを貸していた') + '。', why: doubter.name + 'のNP。' + D.name + '派にいながら' });
  }

  /* 住人ごとの所属まとめ */
  F.noteFor = function (ctx, c) {
    var h = ctx.facHist || [];
    if (!h.length) return null;
    var last = h[h.length - 1], C = ctx.chars;
    var mine = last.groups.filter(function (g) { return g.members.indexOf(c.i) >= 0; })[0];
    var hist = [];
    h.forEach(function (x) {
      var g = x.groups.filter(function (g2) { return g2.members.indexOf(c.i) >= 0; })[0];
      var tag = g ? C[g.leader].name + '派' + (g.leader === c.i ? '（頭）' : '') : '無所属';
      if (hist[hist.length - 1] !== tag) hist.push(tag);
    });
    var ever = h.some(function (x) { return x.groups.length; });
    var now = mine ? (mine.leader === c.i ? C[c.i].name + '派を率いた' + (last.regime === 'dictator' ? '。独裁者として君臨した' : '') : C[mine.leader].name + '派に属した')
      : (!ever ? '派閥は生まれなかった' : last.regime === 'none' ? '最後には派閥そのものが消えた' : 'どの派閥にも属さなかった');
    return '派閥：' + now + (hist.length > 1 ? '（' + hist.join(' → ') + '）' : '') + '。';
  };
})();
