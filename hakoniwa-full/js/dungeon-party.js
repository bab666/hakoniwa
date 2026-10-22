/* 箱庭診断: エロトラップダンジョン ― 複数人で挑むときの出来事
   見せつけられて火照る／気分が悪くなる／助けに入る／興奮した仲間が襲ってくる／慰め合う／堕ちた仲間が手招きする */
(function () {
  'use strict';
  var HK = window.HK, DG = HK.DG;
  var clamp = HK.clamp;

  function k(a, b) { return a.i < b.i ? a.i + '-' + b.i : b.i + '-' + a.i; }
  function rel(S, a, b) { return S.rel[k(a, b)]; }
  function t2(S, s, a, b) { return s.replace(/\{a\}/g, a.name).replace(/\{b\}/g, b ? b.name : '').replace(/\{t\}/g, S.lastEv ? S.lastEv.name : '罠'); }
  function pk(S, arr) { return DG.pick(S, arr); }
  function st(h, id) { return h.stats[id] || 3; }
  function free(S) { return S.party.filter(function (x) { return !x.fallen && !x.captor; }); }
  function pn(S, s) { (S.partyNotes = S.partyNotes || []).push(s); }
  function sayAs(S, h, o) { var prev = S.h; S.h = h; var e = DG.say(S, o); S.h = prev; return e; }
  function canLove(a, b) { return HK.canLove ? HK.canLove(a, b) : true; }
  /* 自分で「攻め」を選んだ人（罠や魔物に「される」側として書かない） */
  function isTop(h) { return !!(HK.Pos && HK.Pos.hardTop(h)); }

  /* 仲間どうしの関係：相性＋登録された関係から */
  DG.partySetup = function (S, input) {
    S.rel = {};
    var P = S.party;
    P.forEach(function (a) {
      P.forEach(function (b) {
        if (a.i >= b.i) return;
        var bc = HK.baseCompat(a, b);
        S.rel[k(a, b)] = { trust: 15 + bc.aff * 0.2, att: Math.max(0, bc.att * 0.3) * (canLove(a, b) && canLove(b, a) ? 1 : 0.1), ten: Math.max(0, bc.ten * 0.2), saved: 0, assault: 0, intimate: 0 };
      });
    });
    (input.ties || []).forEach(function (t) {
      var a = P[t.a], b = P[t.b];
      if (!a || !b || !HK.TIES[t.type]) return;
      var r = rel(S, a, b), D = HK.TIES[t.type];
      r.tie = t.type;
      r.trust += D.pol * 15; r.ten += D.pol < 0 ? 30 : 0;
      if (D.family && !D.loveOK) r.att = 0;
      else if (D.loveOK) r.att += 8;
      else if (D.couple || D.night || t.type === 'almost') r.att += 40;
      else if (t.type === 'crush') r.att += 25;
    });
  };

  /* 見せつけられた側の反応 */
  function witness(S, tgt, hit) {
    var others = free(S).filter(function (x) { return x !== tgt; });
    if (!others.length) return false;
    var w = others[S.rng.int(others.length)], r = rel(S, w, tgt), rng = S.rng;
    var arouse = w.tr.fc * 0.4 + w.tr.impulse * 0.3 + r.att / 80 + w.corrupt / 120 + (canLove(w, tgt) ? 0.1 : -0.4);
    var disgust = w.tr.cp * 0.4 + w.tr.cold * 0.3 + (r.ten / 80) - r.att / 100 + (canLove(w, tgt) ? 0 : 0.3);
    var rescue = w.tr.np * 0.5 + w.tr.cp * 0.2 + r.trust / 80 + st(w, 'fight') * 0.05 - w.corrupt / 150;
    var lvl = (tgt.captor || hit.gain > 18) ? 1 : 0;
    var pickx = HK.weighted(rng, ['arouse', 'disgust', 'rescue', 'look'], function (x) { return Math.max(0, { arouse: arouse, disgust: disgust, rescue: rescue * (lvl ? 1.4 : 0.6), look: 0.35 }[x]); });
    if (pickx === 'arouse') {
      var g = (hit.gain || 15) * (0.35 + w.tr.fc * 0.3 + r.att / 200);
      w.pleasure += g; w.reason -= g * 0.1; w.corrupt += 1.2; r.att += 4;
      sayAs(S, w, { kind: 'ev', tag: '見せつけ', text: t2(S, pk(S, isTop(tgt) ? ['熱に浮かされた{b}の横顔から、{a}は目を離せなかった。体の奥が、勝手に火照っていく。', '{b}の荒い息づかいに、{a}は喉を鳴らした。自分でも驚くほど、熱くなっていた。', '{a}は「見ちゃだめだ」と思いながら、指の隙間から{b}を見ていた。', '{a}「…{b}、そんな顔、するんだ」声が掠れていた。'] : ['{b}が責められる様子から、{a}は目を離せなかった。体の奥が、勝手に火照っていく。', '{b}の上げた声に、{a}は喉を鳴らした。自分でも驚くほど、熱くなっていた。', '{a}は「見ちゃだめだ」と思いながら、指の隙間から{b}を見ていた。', '{a}は{b}の乱れた姿に、膝をこすり合わせた。', '{a}「…{b}、そんな顔、するんだ」声が掠れていた。']), w, tgt), why: w.name + 'のFC・衝動・' + tgt.name + 'への惹かれ（' + Math.round(r.att) + '）' });
      return true;
    }
    if (pickx === 'disgust') {
      w.reason -= 3; w.hp -= 3; r.ten += 3;
      sayAs(S, w, { kind: 'ev', tag: '見せつけ', text: t2(S, pk(S, ['{a}は顔を背けた。胃の奥がせり上がってくる。「…気分悪い」', '{a}は{b}から目を逸らし、壁に手をついて吐き気をこらえた。', '{a}「最低だ、この迷宮」{a}は奥歯を噛んで、罠の主を睨んだ。', '{a}は耳を塞いでうずくまった。{b}の声が、どうしても聞こえてしまう。']), w, tgt), why: w.name + 'のCP・ドライさ（嫌悪が勝った）' });
      return true;
    }
    if (pickx === 'rescue') {
      var ok = rng() < 0.3 + st(w, 'fight') * 0.05 + w.tr.cp * 0.12;
      r.trust += ok ? 12 : 4; S.cnt.saved += ok ? 1 : 0; r.saved += ok ? 1 : 0;
      if (ok) {
        tgt.pleasure -= 12; tgt.reason += 3;
        if (tgt.captor) { tgt.captor = null; tgt.hp = Math.max(tgt.hp, 30); }
        sayAs(S, w, { kind: 'ev', tag: '救援', text: t2(S, pk(S, isTop(tgt) ? ['{a}が{b}の隣に駆けつけ、二人がかりで残りの仕掛けを叩き壊した。', '{a}は{b}の背中を守るように立ち、寄ってくる魔物を追い払った。「大丈夫か」', '{a}は自分の外套を{b}に被せた。「少し休んで。熱が引くまで」'] : ['{a}が刃を振るって、{b}に絡みつくものを断ち切った。「掴まれ！」', '{a}は{b}の腕を引っぱって、罠の中から力ずくで引きずり出した。', '{a}は松明を突き出して、{b}に群がるものを追い払った。「大丈夫か」', '{a}は自分の外套を{b}に被せて、肩を抱いた。「もう平気。見てないから」']), w, tgt), why: w.name + 'のNP・CP・戦闘力 ' + st(w, 'fight') + '（' + tgt.name + 'を助けた）' });
        if (r.saved === 2) pn(S, w.name + 'は何度も' + tgt.name + 'を助けた。');
      } else {
        var ev = S.lastEv;
        sayAs(S, w, { kind: 'ev', tag: '救援', text: t2(S, pk(S, isTop(w) ? ['{a}は{b}を助けようと飛び込んだが、仕掛けの吐いた甘い霧を正面から浴びてしまった。', '{a}は{b}のもとへ駆け寄り、伸びてきたものを叩き落とした。飛び散った媚薬の飛沫が、肌を火照らせた。'] : isTop(tgt) ? ['{a}は{b}に加勢しようと飛び込み、足首を何かに絡め取られた。', '{a}は{b}のもとへ駆け寄る途中で、別の仕掛けに捕まった。'] : ['{a}は{b}を助けようと飛び込み、一緒に絡め取られた。', '{a}の手が{b}に届く寸前で、{a}の足首にも何かが巻きついた。']), w, tgt), why: w.name + 'のNP（助けに入ったが、届かなかった）' });
        if (ev && ev.power) { var prev2 = S.h; S.h = w; DG.stim(S, ev, 0.6); S.h = prev2; }
      }
      return true;
    }
    if (rng() < 0.5 && lvl) {
      sayAs(S, w, { kind: 'ev', tag: '見せつけ', text: t2(S, pk(S, isTop(tgt) ? ['{a}は何もできずに、ただ{b}を見ていた。'] : ['{a}は何もできずに、ただ{b}を見ていた。', '{a}は「すぐ終わる、すぐ終わるから」と{b}に繰り返した。']), w, tgt), why: '' });
      return true;
    }
    return false;
  }

  /* 興奮した仲間が襲う／慰め合う */
  function heat(S) {
    var P = free(S);
    if (P.length < 2) return false;
    var rng = S.rng;
    var a = HK.weighted(rng, P, function (x) { var v = x.corrupt / 100 + x.pleasure / 140 + x.tr.impulse * 0.3 - 0.75; return v > 0 ? v : 0; });
    if (!a) return false;
    var cand = P.filter(function (x) { return x !== a && canLove(a, x); });
    if (!cand.length) return false;
    var b = HK.weighted(rng, cand, function (x) { return Math.max(0.05, 0.3 + rel(S, a, x).att / 50); });
    if (!b) return false;
    var r = rel(S, a, b);
    var want = (canLove(b, a) ? r.att / 60 : 0) + b.corrupt / 100 + b.pleasure / 150 + b.tr.fc * 0.2;
    if (want > 0.85 || (r.tie && /lover|fwb|almost/.test(r.tie))) {
      r.intimate++; r.att += 10; r.trust += 6;
      [a, b].forEach(function (x) { x.pleasure += 30 + x.sens * 8; x.corrupt += 2; x.reason += 3; });
      sayAs(S, a, { kind: 'ev', tag: '慰め合い', text: t2(S, pk(S, ['{a}「…ねえ、{b}も、熱いでしょ」{b}は答えずに、{a}の手を取った。――罠のせいにして、二人は互いの熱を逃がした。', '休める場所で、{a}と{b}は背中合わせに座っていた。どちらからともなく向き直った。――', '{b}が先に{a}の肩に額をつけた。「少しだけ」「…うん」――', '{a}と{b}は、誰にも言わないと約束して、互いを慰めた。']), a, b), why: a.name + 'と' + b.name + 'の昂り・惹かれ（' + Math.round(r.att) + '）' });
      [a, b].forEach(function (x) { var prev = S.h; S.h = x; DG.settle(S); S.h = prev; });
      if (r.intimate === 1) pn(S, a.name + 'と' + b.name + 'は、迷宮の中で一線を越えた。');
      return true;
    }
    /* 襲う場面は、受け攻めの向きどおり（HK.Pos.order の先頭）が襲う側のときだけ。自分で攻めを選んだ人は襲われない */
    if (HK.Pos && (HK.Pos.order(a, b, [a, b])[0] !== a || isTop(b))) return false;
    var third = P.filter(function (x) { return x !== a && x !== b; }).sort(function (x, y) { return (y.tr.np + y.tr.cp + rel(S, y, b).trust / 50) - (x.tr.np + x.tr.cp + rel(S, x, b).trust / 50); })[0];
    var stop = b.tr.cp * 0.4 + st(b, 'fight') * 0.06 + (third ? third.tr.np * 0.3 + third.tr.cp * 0.3 + st(third, 'fight') * 0.05 : 0) + rng() * 0.5;
    S.cnt.assault++; r.assault++; r.trust -= 20; r.ten += 25;
    if (stop > 0.75) {
      var by = third && third.tr.np + third.tr.cp > b.tr.cp ? third : null;
      sayAs(S, a, { kind: 'ev', tag: '仲間の暴走', text: t2(S, '堕ちかけた{a}が、{b}を床に押し倒した。', a, b) + (by ? by.name + 'が' + a.name + 'を引き剥がした。「しっかりしろ！迷宮に呑まれるな！」' : t2(S, pk(S, ['{b}は{a}の頬を張った。「目を覚まして！」', '{b}は{a}の手首をねじり上げた。「…それ以上やったら、置いていく」']), a, b)), why: a.name + 'の堕ち度 ' + Math.round(a.corrupt) + '・昂り。' + (by ? by.name + 'が止めた' : b.name + 'が拒んだ') });
      a.reason += 6;
      if (by) rel(S, by, b).trust += 10;
    } else {
      var ev = { id: 'mate', name: a.name, kind: 'mate', part: 'any', power: 22, o: { hold: 0 }, texts: [] };
      var prev = S.h; S.h = b; DG.stim(S, ev, 1);
      sayAs(S, a, { kind: 'ev', tag: '仲間の暴走', text: t2(S, pk(S, ['迷宮の熱に呑まれた{a}が、{b}に覆いかぶさった。「ごめん、もう、止まらない」――', '{a}の目はもう、仲間を見る目ではなかった。{b}は壁際に追い詰められた。――', '{a}は{b}の名前を何度も呼びながら、その体をまさぐった。――']), a, b) + DG.react(S, true), why: a.name + 'の堕ち度 ' + Math.round(a.corrupt) + '・衝動。誰も止められなかった' });
      S.h = prev;
      a.corrupt += 4;
      pn(S, a.name + 'は迷宮の熱に呑まれ、' + b.name + 'を襲った。');
    }
    return true;
  }

  /* 協力的な場面 */
  function assist(S) {
    var P = free(S);
    if (P.length < 2) return false;
    var rng = S.rng;
    var a = HK.weighted(rng, P, function (x) { return 0.2 + x.tr.np * 0.6 + x.tr.warmth * 0.3; });
    var b = HK.weighted(rng, P.filter(function (x) { return x !== a; }), function (x) { return Math.max(0.05, 0.2 + x.corrupt / 80 + Math.max(0, x.pleasure) / 100 + Math.max(0, 100 - x.reason) / 150); });
    if (!a || !b) return false;
    var r = rel(S, a, b);
    var opts = [];
    if (a.items.indexOf('herb') >= 0 && (b.pleasure > 55 || b.reason < 50)) opts.push('herb');
    opts.push('hand', 'warn', 'talk');
    if (b.hp < 50) opts.push('carry');
    var o = opts[rng.int(opts.length)];
    var text, why = a.name + 'のNP（' + Math.round(a.eg.NP) + '）';
    if (o === 'herb') { a.items.splice(a.items.indexOf('herb'), 1); b.pleasure -= 40; b.reason += 14; text = '{a}は自分の鎮静の薬草を、{b}の口に押し込んだ。「噛んで。苦いけど、効くから」'; }
    else if (o === 'hand') { a.reason += 2; b.reason += 4; r.att += 3; text = pk(S, ['{a}は{b}の手を握った。「自分の名前、言える？」{b}は震える声で、ちゃんと答えた。', '{a}と{b}は手を繋いだまま進んだ。指先の温度が、正気をつなぎとめていた。', '{a}は{b}の額に自分の額をつけた。「大丈夫。一緒に帰る」']); }
    else if (o === 'warn') { S.mapFloor = S.floor; text = pk(S, ['{a}が{b}の肩を掴んで止めた。「待って、そこの床、色が違う」', '{a}は先に立って、罠のありそうな場所を一つずつ指で示した。']); why = a.name + 'の慎重さ'; }
    else if (o === 'carry') { b.hp += 20; text = '{a}は足元のおぼつかない{b}に肩を貸した。「重くない？」「重い。でも置いてかない」'; }
    else { b.reason += 4; text = pk(S, ['{a}「帰ったら、何食べたい？」{b}「…普通のご飯」二人は少し笑った。', '{a}は{b}に、地上で待っている人の話をさせた。{b}の目に、少し光が戻った。', '{a}「ここで見たことは、全部忘れよう。お互いに」{b}は小さく頷いた。']); }
    r.trust += 6;
    sayAs(S, a, { kind: 'ev', tag: '助け合い', text: t2(S, text, a, b), why: why });
    return true;
  }

  /* 堕ちた仲間が手招きする */
  function lure(S) {
    var fell = S.party.filter(function (x) { return x.fallen; });
    var P = free(S);
    if (!fell.length || !P.length) return false;
    var f = fell[S.rng.int(fell.length)], v = HK.weighted(S.rng, P, function (x) { return Math.max(0.05, 0.3 + rel(S, x, f).att / 50 + rel(S, x, f).trust / 80 + x.tr.np * 0.3); });
    if (!v) return false;
    var r = rel(S, v, f);
    var pull = r.att / 100 + r.trust / 150 + v.corrupt / 120;
    v.reason -= 4 + pull * 6; v.corrupt += 2 + pull * 4; v.pleasure += 10 + pull * 10;
    sayAs(S, v, { kind: 'ev', tag: '堕ちた仲間', text: t2(S, pk(S, ['通路の奥で、堕ちた{b}が蕩けた顔で手招きしていた。「{a}も、おいでよ。気持ちいいよ」', '{b}の声がした。もう{a}の知っている声ではなかった。「どうして来てくれないの？」', isTop(f) ? '{a}は、魔物を足元に侍らせて笑う{b}を見てしまった。足が止まった。' : '{a}は、罠に絡まれたまま幸せそうに笑う{b}を見てしまった。足が止まった。']), v, f), why: f.name + 'は迷宮に堕ちた。' + v.name + 'との絆（信頼 ' + Math.round(r.trust) + '）が引き寄せる' });
    return true;
  }

  DG.partyAfter = function (S, tgt, hit) {
    var rng = S.rng;
    var t = hit ? hit.h : tgt;
    if (hit && !t.fallen && rng() < 0.6) witness(S, t, hit);
    else if (rng() < 0.22) heat(S);
    else if (rng() < 0.12) assist(S);
    if (rng() < 0.2) lure(S);
  };
  /* 敵視（hate-kit.js）：パーティの中のケンカ。嫌悪の強さで、口論から掴み合いまで */
  var setup0 = DG.partySetup;
  DG.partySetup = function (S, input) { S.ties = (input && input.ties) || []; return setup0(S, input); };
  var after0 = DG.partyAfter;
  DG.partyAfter = function (S, tgt, hit) {
    after0(S, tgt, hit);
    var H = HK.HateKit;
    if (!H || S.rng() > 0.2) return;
    var live = S.party.filter(function (x) { return !x.fallen; }), ps = H.pairs(S, live);
    if (!ps.length) return;
    var p = ps[(S.rng() * ps.length) | 0], r = p.st === 'hate' ? H.quarrel(S, p.a, p.b) : H.harass(S, p.a, p.b);
    var rr = rel(S, p.a, p.b); if (rr) rr.ten = clamp(rr.ten + 6, 0, 100);
    sayAs(S, p.a, { kind: 'ev', tag: 'ケンカ', text: r.text, why: r.why });
  };
  DG.partyBoss = function (S, tgt) { if (S.rng() < 0.5) witness(S, tgt, { gain: 20 }); };

  /* 捕まった仲間を助けに行く */
  DG.partyRescue = function (S, caps, fr) {
    var rng = S.rng;
    caps.forEach(function (c) {
      if (c.fallen || !c.captor || c.bossCapture && fr.length === 0) return;
      var a = fr.slice().sort(function (x, y) { return (y.tr.np + st(y, 'fight') * 0.1 + rel(S, y, c).trust / 60) - (x.tr.np + st(x, 'fight') * 0.1 + rel(S, x, c).trust / 60); })[0];
      if (!a) return;
      var will = a.tr.np * 0.5 + rel(S, a, c).trust / 60 + a.tr.cp * 0.2 + (c.bossCapture ? 0.2 : 0);
      if (rng() > will) return;
      var ok = rng() < 0.35 + st(a, 'fight') * 0.07 + fr.length * 0.08;
      if (ok) {
        c.captor = null; c.hp = 30; c.bossCapture = false; S.cnt.saved++; rel(S, a, c).trust += 15; rel(S, a, c).saved++;
        var o = sayAs(S, a, { kind: 'ev', tag: '救出', text: t2(S, pk(S, [isTop(c) ? '{a}が巣に飛び込み、{b}を閉じ込めていた檻を叩き壊した。「帰るぞ！」{b}は「遅い」とだけ言って、{a}の肩を叩いた。' : '{a}が巣に飛び込み、{b}を縛るものを断ち切った。「帰るぞ！」{b}は泣きながら{a}にしがみついた。', '{a}は囮になって魔物を引きつけ、その隙に{b}を連れ出した。', '{a}は{b}を背負って、巣から全力で駆け出した。']), a, c), why: a.name + 'のNP・戦闘力 ' + st(a, 'fight') + '（捕まった' + c.name + 'を救出）' });
        DG.key(S, o, a.name + 'が' + c.name + 'を救い出した');
        pn(S, a.name + 'は捕らわれた' + c.name + 'を救い出した。');
      } else {
        sayAs(S, a, { kind: 'ev', tag: '救出', text: t2(S, pk(S, [isTop(c) ? '{a}は{b}を助けに向かったが、巣の入り口で押し返された。奥から、{b}が魔物を怒鳴りつける声が聞こえた。' : '{a}は{b}を助けに向かったが、巣の入り口で押し返された。{b}の声が、奥から聞こえ続けた。', '{a}の手は{b}に届かなかった。「必ず戻る」と叫んで、{a}は退いた。']), a, c), why: a.name + 'は救出に失敗した' });
        a.hp -= 10;
      }
    });
  };
})();
