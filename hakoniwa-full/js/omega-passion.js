/* 箱庭シミュレーター: オメガバース ― 運命の番に「気づく」流れと、愛憎（無理やりのキス・憎みながらの夜・寝取り・浮気の発覚）
   ・住人の中に、本人たちもまだ知らない運命の番がいることがある（環境値「運命の番の現れやすさ」）
     発情期の匂い、触れた瞬間、検査、そしてスイッチで第二性が変わった瞬間に発覚する
   ・惹かれと苛立ちが同じだけ育つと、無理やり唇を奪ったり、恋人のいる相手を寝取ったりする */
(function () {
  'use strict';
  var HK = window.HK, OM = HK.OMEGA, BD = OM.B, SX = OM.SEX;
  var scen = HK.SCENARIOS.omega, EV = scen.events;
  function sx(c) { return c.om.sex; }
  function key(a, b) { return a.i < b.i ? a.i + '-' + b.i : b.i + '-' + a.i; }
  function ao(a, b) { return (sx(a) === 'a' && sx(b) === 'o') || (sx(a) === 'o' && sx(b) === 'a'); }
  function alphaOf(a, b) { return sx(a) === 'a' ? a : b; }
  function omegaOf(a, b) { return sx(a) === 'o' ? a : b; }
  function partnerOf(ctx, a) {
    var p = null;
    ctx.present().forEach(function (o) { if (o !== a && ctx.pair(a, o).couple) p = o; });
    return p;
  }
  function tieType(ctx, a, b) { var t = HK.Ties && HK.Ties.get(ctx, a, b); return t ? (t.like || t.type) : ''; }
  function fill(ctx, t, a, b, c) { return OM.sc(OM.fill(ctx, ctx.t(t, a, b, c), a, b), a, b); }
  function I(c) { return c.tr.cp + c.tr.fc > 1 ? '俺' : '私'; }
  function L(s) { return s.split('|'); }

  scen.env.splice(2, 0, { id: 'fate', label: '運命の番の現れやすさ', min: 0, max: 100, def: 35, lo: 'まずいない', hi: 'あちこちに', desc: '住人の中に、本人たちもまだ知らない運命の番がいる確率。発情期の匂い、触れた瞬間、検査、スイッチで第二性が変わった瞬間などに気づく' });
  scen.desc = scen.desc.replace('30通り', '37通り').replace('運命の番、スイッチ', '運命の番（気づく瞬間も）、スイッチ').replace('探偵と助手のバディも。', '探偵と助手のバディ、愛憎の寝取りも。');

  /* ======================= 運命の番に気づく ======================= */
  var setup0 = scen.setup;
  scen.setup = function (ctx) {
    setup0(ctx);
    var om = ctx.om, rng = ctx.rng, P = ctx.chars, f = (ctx.env.fate == null ? 35 : ctx.env.fate) / 100;
    om.fatedLatent = {}; om.fatedKnown = {}; om.fatedLate = {}; om.fatedVia = {};
    if (!f) return;
    var taken = {};
    P.forEach(function (a) { P.forEach(function (b) { if (a.i < b.i && tieType(ctx, a, b) === 'fated') { taken[a.i] = 1; taken[b.i] = 1; } }); });
    var flip = function (c) { return sx(c) === 'a' ? 'o' : 'a'; };
    var pairs = [];
    P.forEach(function (a) { P.forEach(function (b) { if (a.i < b.i) pairs.push([a, b]); }); });
    rng.shuffle(pairs).forEach(function (pr) {
      var a = pr[0], b = pr[1];
      if (taken[a.i] || taken[b.i] || !HK.canLove(a, b) || !HK.canLove(b, a)) return;
      if (HK.Ties.all(ctx, a, b).some(HK.tieNoLove)) return;
      var now = ao(a, b);
      /* スイッチすればα×Ωになる二人（スイッチした瞬間に気づく） */
      var later = !now && ((a.om.sw && (flip(a) + sx(b) === 'ao' || flip(a) + sx(b) === 'oa')) || (b.om.sw && (sx(a) + flip(b) === 'ao' || sx(a) + flip(b) === 'oa')));
      var p = now ? f * 0.24 : later ? f * 0.6 : 0;
      if (p && rng() < p) { om.fatedLatent[key(a, b)] = true; taken[a.i] = 1; taken[b.i] = 1; }
    });
  };

  var REALIZE = {
    heat: L('{o}の発情期だった。抑制剤ごしでもかすかに漂う{so}の匂いに、{x}は膝から崩れかけた。何度も嗅いだはずの匂いなのに、今日は世界でいちばん甘い。――運命の番だ。二人は同時に、それを知った。|{x}が{o}の部屋のドアを開けた瞬間、{so}の匂いが喉の奥まで流れ込んだ。{o}は熱に浮かされた目で{x}を見上げ、「……あなただったの」とかすれた声で言った。運命の番だった。'),
    kiss: L('唇が触れた瞬間、{a}の頭の中で、何かがかちりとはまる音がした。離れようとした{b}の手が、{a}の服を掴んだまま動かない。「……{x2}たち、もしかして」――運命の番だった。|肌を重ねたその夜、{a}は{b}のうなじに顔を埋めたまま動けなくなった。噛みたい、という衝動が、本能の底から湧き上がってくる。{b}も同じ顔をしていた。――運命の番だった。'),
    touch: L('{a}の指先が、{b}の手首に触れた。静電気のような痺れが走り、二人は同時に手を引っ込めて、それから黙って見つめ合った。ずっと近くにいたのに、どうして今まで気づかなかったのだろう。――運命の番だった。|{a}がふざけて{b}の首元に顔を寄せた。{sb}の匂いを吸い込んだ瞬間、{a}は笑うのをやめた。{b}も、もう笑っていなかった。'),
    test: L('定期健診のフェロモン適合検査で、{a}と{b}の数値は「測定上限」と出た。医師は二人の顔を見比べて言った。「運命の番、というやつですね。実物は初めて見ました」|{a}は抑制剤の処方のついでに受けた検査結果を、{b}の前で開いた。適合者の欄に、{b}の名前があった。'),
    dream: L('{a}は三晩続けて、{b}の夢を見た。夢の中の{b}は{sb}の匂いがして、目が覚めても匂いが消えなかった。会いに行くと、{b}も同じ夢を見ていた。――運命の番だった。|{a}と{b}は、知り合ってから一度も同じ日に体調を崩したことがなかった。気づけば発情期とラットの周期まで重なっていた。調べてみれば、理由は一つしかなかった。運命の番だ。'),
    sw: L('スイッチの検査結果を受け取ったその日、{c}は{d}とすれ違った。昨日まで何も感じなかった{d}の{sd}の匂いが、今日は膝が抜けるほど甘い。{d}も足を止めて振り返っていた。――第二性が変わった瞬間に、眠っていた運命が目を覚ました。|{c}の第二性が変わって最初に会ったのは、{d}だった。{d}は{c}を見るなり、持っていたカップを落とした。「……嘘だろ。運命の番って、こんな」――{c}がスイッチしたことで、二人は初めて運命の番になれた。|病院から帰った{c}の部屋に、{d}が見舞いに来た。ドアを開けた瞬間、二人とも動けなくなった。αとΩになった今なら分かる。ずっと前から、運命の番だったのだ。'),
    late: L('運命の番だと気づいたのは、{o}のうなじに、もう{m}の噛み跡が残ったあとだった。{x}と{o}は、互いの匂いに震えながら、一歩も近づかなかった。|{o}は{x}の匂いに気づいた瞬間、うなじの噛み跡を手で押さえた。番のいるΩの体は、運命の番さえ拒む。それでも{o}の目は、{x}から離れなかった。')
  };
  function realize(ctx, a, b, via) {
    var om = ctx.om, k = key(a, b), pf = ctx.pair(a, b);
    if (om.fatedKnown[k]) return null;
    om.fatedKnown[k] = true; om.met[k] = true; om.fatedVia[k] = via;
    var A = alphaOf(a, b), O = omegaOf(a, b), mate = BD.mateOf(ctx, O), d = OM.destiny ? OM.destiny(ctx) : 0.5;
    /* 気づいた瞬間の惹かれの立ち上がりは、運命の抗えなさで変わる（+12〜+44） */
    [[a, b], [b, a]].forEach(function (x) { var r = ctx.R(x[0], x[1]); r.att = HK.clamp(r.att + 12 + d * 32, 0, 100); r.aff = HK.clamp(r.aff + 4 + d * 8, -100, 100); });
    var late = mate && mate !== A;
    var vk = late ? 'late' : via;
    var t = ctx.pick(REALIZE[vk]);
    var c = via === 'sw' ? (a.om.switched && ctx.stepIndex === a.om.switchAt ? a : b.om.switched ? b : a) : a, d = c === a ? b : a;
    t = t.replace(/\{o\}/g, O.name).replace(/\{x\}/g, A.name).replace(/\{so\}/g, OM.shortScent(O)).replace(/\{m\}/g, mate ? mate.name : '')
      .replace(/\{c\}/g, c.name).replace(/\{d\}/g, d.name).replace(/\{sd\}/g, OM.shortScent(d)).replace(/\{x2\}/g, I(a) === '俺' ? '俺' : '私');
    t = OM.sc(ctx.t(t, a, b), a, b);
    var why = '運命の番（住人のなかに隠れていた）に気づいた：' + { heat: '発情期の匂い', touch: '触れた瞬間', kiss: '唇・肌が触れた瞬間', test: 'フェロモン適合検査', dream: '重なる周期と夢', sw: 'スイッチでα×Ωになった' }[via] + (OM.destinyWhy ? OM.destinyWhy(ctx) : '');
    if (late) {
      om.fatedLate[k] = true; om.lateEndAt = ctx.stepIndex + 6;
      ctx.mod2(A, O, { ten: 10 }, { ten: 10 }); ctx.stress(O, 25); ctx.stress(A, 15);
      why += '／' + O.name + 'にはもう番（' + mate.name + '）がいる';
    }
    if (pf.couple) t += '恋人として過ごしてきた日々の意味が、その日から少しだけ変わった。';
    ctx.say({ kind: 'event', cat: 'romance', actors: [a, b], text: t, why: why, mag: 42 });
    /* それぞれに恋人がいれば、その恋人との仲が揺らぐ */
    [a, b].forEach(function (x) {
      var y = x === a ? b : a, p = partnerOf(ctx, x);
      if (p && p !== y && !late) {
        ctx.pair(x, p).fatedPending = true;
        ctx.say({ kind: 'event', cat: 'romance', actors: [x, p], text: x.name + 'には、' + p.name + 'という恋人がいる。その夜、' + x.name + 'は' + p.name + 'の顔をまっすぐ見られなかった。', why: '運命の番と、今の恋人', mag: 15 });
      }
    });
    return true;
  }
  OM.onSwitch = function (ctx, c) {
    var om = ctx.om;
    if (!om.fatedLatent) return;
    ctx.present().forEach(function (o) {
      if (o === c) return;
      var k = key(c, o);
      if (om.fatedLatent[k] && !om.fatedKnown[k] && ao(c, o)) realize(ctx, c, o, 'sw');
      /* 運命の番だった二人が、スイッチでα×Ωでなくなる */
      else if (om.fatedKnown[k] && !ao(c, o) && !om.fatedLost) {
        om.fatedLost = true;
        ctx.mod2(c, o, { att: -15, ten: 8 }, { att: -10, ten: 10 });
        ctx.say({ kind: 'event', cat: 'romance', actors: [c, o], text: c.name + 'の第二性が変わった日、' + o.name + 'は' + c.name + 'の首元に顔を埋めて、長いこと黙っていた。運命の番の匂いが、どこにもなかった。', why: 'スイッチで、運命の番の組み合わせ（α×Ω）が崩れた', mag: 30 });
      }
    });
  };
  EV.push({
    id: 'om_fated_realize', cat: 'romance', scope: 'pair', pri: true,
    when: function (ctx, a, b) { var om = ctx.om, k = key(a, b); return om.fatedLatent && om.fatedLatent[k] && !om.fatedKnown[k] && ao(a, b) && ctx.stepIndex >= 1; },
    w: function (ctx, a, b) {
      var pf = ctx.pair(a, b), heat = (sx(a) === 'o' && a.om.heat > 0) || (sx(b) === 'o' && b.om.heat > 0);
      return 0.18 + (heat ? 2.2 : 0) + (pf.night || pf.couple ? 0.9 : 0) + Math.max(ctx.R(a, b).att, ctx.R(b, a).att) / 120;
    },
    run: function (ctx, a, b) {
      var pf = ctx.pair(a, b), heat = (sx(a) === 'o' && a.om.heat > 0) || (sx(b) === 'o' && b.om.heat > 0);
      var via = heat ? 'heat' : pf.night || pf.couple || pf.hateKiss ? 'kiss' : ctx.rng.pick(['touch', 'touch', 'test', 'dream']);
      realize(ctx, a, b, via);
      return null;
    }
  });

  /* ======================= 愛憎 ======================= */
  /* aがbに、惹かれと苛立ちを同時に抱いているか */
  function hateLove(ctx, a, b) {
    var r = ctx.R(a, b), pf = ctx.pair(a, b);
    return (r.att > 36 && (r.ten > 30 || (pf.rejBy === a.i && pf.rejCount))) || (r.ten > 40 && r.aff > 15 && r.att > 26) || (r.att > 30 && ctx.om.rival && Object.keys(ctx.om.rival).some(function (k) { return ctx.om.rival[k] === b.i && k.split('-').indexOf(String(a.i)) >= 0; }) && r.ten > 22);
  }
  OM.hateLove = hateLove;
  function heatOn(c) { return (sx(c) === 'o' && c.om.heat > 0) || (sx(c) === 'a' && c.om.rut > 0); }
  function lewd(ctx) { return ctx.env.lewd || 'mid'; }
  function strifeK(ctx) { return 0.45 + ctx.env.strife / 90; }

  /* --- 無理やり唇を奪う --- */
  var FK = {
    open: L('{a}は{b}の胸ぐらを掴んで引き寄せ、言い返そうとした唇を自分の唇で塞いだ。|言い合いの途中で、{a}は{b}を壁に押しつけ、乱暴に唇を奪った。|{a}は帰ろうとする{b}の腕を掴んで振り向かせ、何か言われる前に口づけた。|「黙れよ」――{a}は{b}の顎を掴んで上を向かせ、噛みつくようにキスをした。|二人きりのエレベーターで、{a}は{b}を隅に追い込み、逃げ道を塞いだまま唇を重ねた。'),
    alpha: L('{a}はαの威圧を隠さずに{b}を見下ろした。動けなくなった{b}の顎を持ち上げ、{a}はゆっくりと唇を奪った。|{a}の{sa}の匂いが濃くなった。Ωの体が勝手にすくむのを、{b}は止められなかった。{a}はその隙に、{b}の唇を塞いだ。'),
    back: L('{b}は一瞬目を見開き、それから{a}の襟を掴み返して、もっと深く口づけ返した。離れたとき、二人とも息が上がっていた。「……最低」「お互いさまだろ」|{b}は{a}の下唇に歯を立てた。血の味がした。それでも{b}は、{a}を突き放さなかった。|{b}は抵抗するふりをして、{a}の背中に爪を立てた。キスは長く続いた。'),
    slap: L('乾いた音が響いた。{b}の平手が、{a}の頬を打っていた。「二度とするな」――そう言った{b}の唇は、震えていた。|{b}は{a}を突き飛ばし、手の甲で唇をぬぐった。「……ふざけるな」|{b}は{a}の唇に噛みつき、怯んだ隙に膝を入れた。{a}は呻いて、それでも笑っていた。'),
    freeze: L('{b}は動けなかった。{a}が離れても、{b}は壁にもたれたまま、自分の唇に触れていた。|{b}の目から、ぽろりと涙が落ちた。{a}はそれを見て、初めて自分のしたことに気づいた顔をした。|{b}は何も言わずに、その場から逃げ出した。{a}の手には、{b}の体温だけが残った。'),
    seen: L('――廊下の角で、{c}がそれを見ていた。|――少し離れた場所で、{b}の恋人の{c}が、立ち尽くしていた。')
  };
  EV.push({
    id: 'om_forcekiss', cat: 'romance', scope: 'pair',
    when: function (ctx, a, b) {
      var pf = ctx.pair(a, b);
      /* 自分で攻めを選んだ人を、壁に押しつけて唇を奪う側には回さない（受け攻めの指定に従う） */
      if (HK.Pos && HK.Pos.hardTop(b)) return false;
      return OM.isFated && HK.canLove(a, b) && !pf.couple && hateLove(ctx, a, b) && ctx.stepIndex - (pf.lastForce == null ? -9 : pf.lastForce) >= 3 && (ctx.om.met[key(a, b)] || !OM.isFated(ctx, a, b));
    },
    w: function (ctx, a, b) { var r = ctx.R(a, b); return (0.35 + a.tr.impulse * 0.8 + a.tr.aggr * 0.6 + r.ten / 90 + r.att / 120) * strifeK(ctx); },
    run: function (ctx, a, b) {
      var pf = ctx.pair(a, b), rb = ctx.R(b, a), p = partnerOf(ctx, b);
      pf.lastForce = ctx.stepIndex; pf.hateKiss = (pf.hateKiss || 0) + 1;
      var useAlpha = sx(a) === 'a' && sx(b) === 'o' && a.tr.cp > 0.55 && ctx.rng() < 0.6;
      var t = ctx.pick(useAlpha ? FK.alpha : FK.open), why = a.name + 'の、惹かれ（' + Math.round(ctx.R(a, b).att) + '）と苛立ち（' + Math.round(ctx.R(a, b).ten) + '）が同時に溢れた（衝動性 ' + Math.round(a.tr.impulse * 100) + '）';
      var back = (hateLove(ctx, b, a) || rb.att > 42) && !(useAlpha && b.tr.ac > 0.6), kind;
      if (back) { kind = 'back'; ctx.mod2(a, b, { att: 9, ten: 3, aff: 2 }, { att: 9, ten: 3, aff: 2 }); why += '／' + b.name + 'も同じだけ' + a.name + 'に惹かれていた'; }
      else if (b.tr.aggr + b.tr.cp > 1.0 && !useAlpha) { kind = 'slap'; ctx.mod2(a, b, { att: 4, ten: 6 }, { ten: 14, aff: -8, att: 2 }); why += '／' + b.name + 'の攻撃性・CP'; }
      else { kind = 'freeze'; ctx.mod2(a, b, { att: 3 }, { ten: 12, trust: -16, aff: -5 }); ctx.stress(b, 14); if (a.tr.np > 0.5) ctx.stress(a, 10); why += useAlpha ? '／αの威圧に、Ωの体は逆らえない' : '／' + b.name + 'のAC（すくんでしまう）'; }
      t += ctx.pick(FK[kind]);
      var w = null;
      if (p && p !== a && ctx.rng() < 0.4) { t += ctx.pick(FK.seen); w = [p]; ctx.mod(p, a, { ten: 18, aff: -10 }); ctx.mod(p, b, { trust: -6, ten: 6 }); ctx.pair(b, p).sawKiss = a.i; }
      return { text: fill(ctx, t, a, b, p), why: why, with: w, mag: 24 };
    }
  });

  /* --- 憎みながら、夜を重ねる --- */
  var HN = {
    open: L('「お前なんか嫌いだ」と{a}が言った。「知ってる」と{b}が言った。それが合図だった。|言い争いは、いつの間にか服の掴み合いになり、ベッドの上で終わった。|{a}と{b}は、互いの悪口を言い合いながら、ホテルの部屋の鍵を開けた。|殴り合いの寸前で、{a}は{b}の手首を掴み、そのまま壁に縫いとめた。'),
    mid: L('優しさはひとつもなかった。爪と歯の痕だけが、互いの肌に残った。――|{b}は{a}の肩に噛みつき、{a}は{b}の名前を罵るように呼んだ。どちらも、相手を離さなかった。――|「嫌い」と言うたびに、{a}は{b}を深く抱いた。{b}は泣きながら、それでも{a}の背中にしがみついた。――'),
    low: L('――その夜、二人が何をしたかは、乱れたシーツだけが知っている。――|――翌朝、{b}の首筋には、隠しきれない痕が残っていた。――'),
    end: L('朝、二人は目を合わせずに服を着た。「今のは、なかったことにしろ」「言われなくても」|{a}は眠る{b}の顔を、憎らしそうに、それでいて名残惜しそうに見つめていた。|{b}が先に部屋を出た。ドアが閉まる直前、「次はない」と言った。次は、たぶんある。')
  };
  EV.push({
    id: 'om_hatenight', cat: 'romance', scope: 'pair',
    when: function (ctx, a, b) {
      var pf = ctx.pair(a, b);
      if (pf.couple || !HK.canLove(a, b) || !HK.canLove(b, a) || partnerOf(ctx, a) || partnerOf(ctx, b)) return false;
      var mb = BD.mateOf(ctx, b), ma = BD.mateOf(ctx, a);
      if ((mb && mb !== a) || (ma && ma !== b)) return false;
      return hateLove(ctx, a, b) && (hateLove(ctx, b, a) || ctx.R(b, a).att > 40) && (pf.hateKiss || 0) >= 1 && ctx.stepIndex - (pf.lastHate == null ? -9 : pf.lastHate) >= 2;
    },
    w: function (ctx, a, b) { return (0.6 + (a.tr.impulse + b.tr.impulse) * 0.5 + ctx.env.heat / 200) * strifeK(ctx); },
    run: function (ctx, a, b) {
      var pf = ctx.pair(a, b);
      pf.night = true; pf.nights = (pf.nights || 0) + 1; pf.hateNight = (pf.hateNight || 0) + 1; pf.lastHate = ctx.stepIndex;
      ctx.mod2(a, b, { att: 8, aff: 3, ten: 2 }, { att: 8, aff: 3, ten: 2 });
      var t = ctx.pick(HN.open) + ctx.pick(lewd(ctx) === 'low' ? HN.low : HN.mid) + ctx.pick(HN.end);
      /* 受け攻め：抱く側を {a} に */
      var ab = HK.Pos ? HK.Pos.order(a, b, [a, b]) : [a, b];
      return { text: fill(ctx, t, ab[0], ab[1]), why: '愛憎（互いに惹かれと苛立ちを抱えている）／' + a.name + 'と' + b.name + 'の衝動性', mag: 26 };
    }
  });

  /* --- 恋人のいる相手を寝取る／恋人がいるのに、ほかの誰かと --- */
  var NT = {
    steal: L('{a}は、{b}に恋人がいるのを知っていた。知っていて、{b}を自分の部屋に誘った。{b}は断らなかった。|「{c}には黙っておけばいい」――{a}の囁きに、{b}は小さく頷いた。|{a}は{c}と{b}が待ち合わせていた店に先回りし、{b}だけを連れ出した。その夜、{b}は帰らなかった。|{b}の恋人が出張でいない夜だった。{a}からの「今から会える？」に、{b}は五分で返事をした。'),
    rival: L('{a}は{c}が憎かった。だから{c}のいちばん大事なものを奪うことにした。――{b}は、{a}の腕の中で{c}の名前を一度も呼ばなかった。|{a}は{b}の首筋に、わざと見える位置に痕をつけた。「{c}に見せてやれよ」'),
    cheat: L('恋人の{c}の顔が浮かんだ。それでも{a}は、{b}の手を離さなかった。|{a}は{c}からの着信を無視して、{b}の上着を脱がせた。|{a}は{c}に「残業」と送ってから、{b}の待つホテルに向かった。'),
    scene: L('――言い訳を探すより先に、体が動いた。|――{sa}と{sb}の匂いが混ざり合い、もう引き返せなかった。|――シーツの上で、{b}は罪悪感と快感の区別がつかなくなっていた。'),
    low: L('――その先は、二人だけの秘密になった。|――朝まで、二人の部屋の明かりは消えなかった。'),
    after: L('帰り道、{b}はシャワーを二回浴びたのに、まだ{a}の匂いが消えない気がしていた。|翌朝、{b}は{c}に「おはよう」と送った。指が少し震えていた。|{a}は満足げに煙草に火をつけ、{b}は黙って背を向けた。'),
    refuseSelf: L('{a}は{b}に手を伸ばしかけて、やめた。恋人の{c}の顔が浮かんだ。|{a}は{b}からの「今夜会える？」に、長いこと返信を打っては消して、結局「ごめん」とだけ送った。|{b}の部屋の前まで来て、{a}は引き返した。ポケットの中で、{c}からもらった鍵が冷たかった。'),
    refuse: L('{a}は恋人のいる{b}に迫った。{b}は{a}の手を払いのけた。「私／俺には{c}がいる」|{b}は{a}の誘いをきっぱり断り、その足で{c}に会いに行った。|{a}が{b}を抱き寄せようとした瞬間、{b}のスマホが鳴った。画面には{c}の名前があった。{b}はそれを理由に、{a}から離れた。')
  };
  EV.push({
    id: 'om_steal', cat: 'romance', scope: 'pair',
    when: function (ctx, a, b) {
      var pf = ctx.pair(a, b), pb = partnerOf(ctx, b), pa = partnerOf(ctx, a);
      if (pf.couple || !HK.canLove(a, b) || !HK.canLove(b, a) || !(pb || pa) || pb === a) return false;
      if (ctx.stepIndex - (pf.lastSteal == null ? -9 : pf.lastSteal) < 3) return false;
      /* 番のいるΩは、番以外を体が受けつけない */
      var mb = BD.mateOf(ctx, b), ma = BD.mateOf(ctx, a);
      if ((mb && mb !== a) || (ma && ma !== b)) return false;
      var r = ctx.R(a, b);
      return r.att > 40 && (hateLove(ctx, a, b) || (pb && ctx.R(a, pb).ten > 28) || a.tr.impulse > 0.6 || a.goal.id === 'free' || pf.night);
    },
    w: function (ctx, a, b) {
      var pb = partnerOf(ctx, b), r = ctx.R(a, b);
      return (0.25 + a.tr.impulse * 0.6 + a.tr.aggr * 0.35 + (1 - a.tr.np) * 0.2 + (pb && ctx.R(a, pb).ten > 28 ? 0.6 : 0) + (hateLove(ctx, a, b) ? 0.5 : 0) + r.att / 150) * (0.4 + ctx.env.romance / 90) * strifeK(ctx);
    },
    run: function (ctx, a, b) {
      var pf = ctx.pair(a, b), pb = partnerOf(ctx, b), pa = partnerOf(ctx, a), rb = ctx.R(b, a);
      pf.lastSteal = ctx.stepIndex;
      /* 恋人のいる側（b）が踏みとどまるか */
      var holder = pb ? b : a, part = pb || pa, rh = ctx.R(holder, part), other = holder === b ? a : b;
      var hold = rh.aff + rh.trust * 0.6 + (holder.tr.cp + holder.tr.ac) * 20 - ctx.R(holder, other).att * 1.15 - holder.tr.impulse * 28 - rh.ten * 0.5 - (heatOn(holder) || heatOn(other) ? 30 : 0) + (pf.night ? -10 : 0);
      if (holder === a) hold -= 25; /* 自分から浮気を仕掛ける側は、もう半分踏み外している */
      /* 相手が運命の番なら、運命の抗えなさが高いほど踏みとどまれない（低ければ逆に踏みとどまる） */
      var fd = OM.isFated && OM.isFated(ctx, a, b) ? ((OM.destiny ? OM.destiny(ctx) : 0.5) - 0.5) * 70 : 0;
      hold -= fd;
      var fdw = fd ? OM.destinyWhy(ctx) : '';
      if (hold > ctx.rng() * 90) {
        ctx.mod2(a, b, { att: 2, ten: 7 }, { ten: 8, trust: -6 });
        if (pb) ctx.mod(b, pb, { trust: 5, aff: 3 });
        return { cat: 'conflict', text: fill(ctx, ctx.pick(holder === a ? NT.refuseSelf : NT.refuse).replace(/私／俺/, I(b)), a, b, pb || pa), why: holder.name + 'は恋人（' + part.name + '）への想い（好意 ' + Math.round(rh.aff) + '・信頼 ' + Math.round(rh.trust) + '）で踏みとどまった' + fdw, with: part ? [part] : null, mag: 14 };
      }
      pf.night = true; pf.nights = (pf.nights || 0) + 1; pf.affair = true;
      var cheater = holder, victim = part;
      var cp = ctx.pair(cheater, victim);
      cp.cheat = { by: cheater.i, with: other.i, at: ctx.stepIndex, found: false };
      ctx.mod2(a, b, { att: 8, aff: 3 }, { att: 8, aff: 3 });
      ctx.stress(cheater, 12);
      /* 受け攻めの指定：恋人を裏切る側（holder）が攻めなら、holder が抱かれ・痕をつけられる文は使わない */
      var hTop = HK.Pos && HK.Pos.order(a, b, [a, b])[0] === holder;
      var motive = pb && ctx.R(a, pb).ten > 28 && a.tr.aggr > 0.45 && !hTop ? 'rival' : pb ? 'steal' : 'cheat';
      var nf = function (arr, re) { var f = arr.filter(function (l) { return !(hTop && re.test(l)); }); return f.length ? f : arr; };
      /* 寝取られる側（恋人を裏切る側）を、後半の文の主語にする */
      var t2 = ctx.pick(lewd(ctx) === 'low' ? NT.low : nf(NT.scene, /快感/)) + ctx.pick(NT.after);
      if (motive === 'cheat') t2 = t2.replace(/\{a\}/g, '{A}').replace(/\{b\}/g, '{a}').replace(/\{A\}/g, '{b}').replace(/\{sa\}/g, '{SA}').replace(/\{sb\}/g, '{sa}').replace(/\{SA\}/g, '{sb}');
      var t = ctx.pick(motive === 'cheat' && HK.Pos && !hTop && HK.Pos.hardTop(b) ? NT.cheat.filter(function (l) { return !/上着を脱がせた/.test(l); }) : NT[motive]) + t2;
      var why = motive === 'rival' ? a.name + 'は恋敵の' + pb.name + 'から奪いたかった（緊張 ' + Math.round(ctx.R(a, pb).ten) + '）' : motive === 'steal' ? a.name + 'の惹かれ（' + Math.round(ctx.R(a, b).att) + '）と衝動性。恋人のいる' + b.name + 'が拒みきれなかった' : a.name + 'には恋人（' + pa.name + '）がいる。それでも' + b.name + 'への惹かれ（' + Math.round(ctx.R(a, b).att) + '）が勝った';
      return { text: fill(ctx, t, a, b, part), why: why + (hateLove(ctx, a, b) ? '／愛憎' : '') + (fd ? '／運命の番' + fdw : ''), mag: 32 };
    }
  });

  /* --- 浮気が恋人に知られる --- */
  var FOUND = {
    scent: L('{a}は帰ってきた{b}を抱きしめて、動きを止めた。{b}の首筋から、知らない{sc}の匂いがした。|{a}は{b}の上着を受け取った瞬間に気づいた。{d}の匂いだった。αとΩの鼻は、嘘をつかせてくれない。'),
    phone: L('{b}のスマホが鳴った。画面に浮かんだ{d}からのメッセージを、{a}は読んでしまった。|{a}は{b}の鞄から、{d}の部屋の鍵を見つけた。'),
    flaunt: L('{d}がわざわざ{a}の前に現れて言った。「{b}、昨日はうちに泊まったよ。聞いてない？」|{a}のもとに、{d}から一枚の写真が届いた。眠っている{b}が写っていた。'),
    confess: L('{b}は耐えきれずに打ち明けた。「{d}と、寝た」――{a}の手から、マグカップが落ちた。|夕食の途中で、{b}は箸を置いた。「話がある」その一言で、{a}はすべてを察した。'),
    forgive: L('{a}は長いこと黙っていた。それから「次はない」とだけ言って、{b}を抱きしめた。腕は、少し痛いほど強かった。|{a}は泣きながら{b}を責め、責め疲れて、それでも別れるとは言わなかった。|「許したわけじゃない」――{a}はそう言って、{b}のうなじに顔を埋めた。自分の匂いで上書きするように。'),
    leave: L('{a}は{b}の荷物を、玄関の外にまとめて出した。「出ていって」|{a}は何も言わずに指輪を外し、テーブルに置いて出ていった。|「よりによって、{d}と」――{a}は笑った。笑いながら泣いていた。その夜、二人は終わった。|{a}は{b}の頬を打った。打った手のほうが、ずっと痛そうだった。「二度と顔を見せるな」')
  };
  EV.push({
    id: 'om_cheat_found', cat: 'conflict', scope: 'pair', pri: true,
    when: function (ctx, a, b) { var pf = ctx.pair(a, b); return pf.couple && pf.cheat && !pf.cheat.found && pf.cheat.by === b.i && ctx.stepIndex > pf.cheat.at; },
    w: function (ctx, a, b) { var pf = ctx.pair(a, b); return 0.5 + (ctx.stepIndex - pf.cheat.at) * 0.45 + (sx(a) !== 'b' ? 0.5 : 0); },
    run: function (ctx, a, b) {
      var pf = ctx.pair(a, b), d = ctx.chars[pf.cheat.with], om = ctx.om;
      pf.cheat.found = true;
      var how = b.tr.honesty > 0.62 && ctx.rng() < 0.6 ? 'confess' : d.alive && d.tr.aggr > 0.6 && ctx.rng() < 0.5 ? 'flaunt' : sx(a) !== 'b' && ctx.rng() < 0.65 ? 'scent' : 'phone';
      var t = ctx.pick(FOUND[how]).replace(/\{d\}/g, d.name).replace(/\{sc\}/g, OM.shortScent(d));
      var r = ctx.R(a, b);
      var keep = r.aff * 0.8 + r.trust * 0.4 + a.tr.np * 35 + a.tr.ac * 10 - a.tr.cp * 25 - a.tr.jealous * 35 - 25 - (how === 'flaunt' ? 15 : 0) + (how === 'confess' ? 15 : 0) + (BD.bonded(ctx, a, b) ? 25 : 0);
      ctx.mod(a, d, { ten: 30, aff: -25, trust: -30 });
      ctx.stress(a, 30);
      if (keep > ctx.rng() * 130) {
        pf.forgiven = (pf.forgiven || 0) + 1;
        ctx.mod2(a, b, { trust: -22, ten: 14 }, { trust: 6, ten: 6 });
        t += ctx.pick(FOUND.forgive);
        return { text: fill(ctx, t, a, b), why: b.name + 'の浮気（相手は' + d.name + '）が発覚。' + a.name + 'は許すほうを選んだ（好意 ' + Math.round(r.aff) + '・NP ' + Math.round(a.eg.NP) + '）', with: [d], mag: 34 };
      }
      pf.couple = false; pf.broke = 'cheat'; pf.cheatBy = b.i; pf.brokeAt = ctx.stepIndex;
      ctx.mod2(a, b, { aff: -28, ten: 22, trust: -40 }, { aff: -6, ten: 10 });
      ctx.pair(b, d).stolenFrom = a.i; ctx.pair(b, d).stealer = d.i;
      om.cheatEnd = { a: a.i, b: b.i, at: ctx.stepIndex + 6 };
      t += ctx.pick(FOUND.leave).replace(/\{d\}/g, d.name);
      if (BD.bonded(ctx, a, b) && ao(a, b)) {
        var A = alphaOf(a, b), O = omegaOf(a, b);
        BD.abandon(ctx, A, O, 'cheat');
        t += fill(ctx, '番の契りは、浮気くらいでは解けない。{b}のうなじには、{a}の噛み跡が残ったままだ。', A, O);
      }
      return { text: fill(ctx, t, a, b), why: b.name + 'の浮気（相手は' + d.name + '）が発覚した（' + { scent: '匂い', phone: 'スマホ', flaunt: d.name + 'が見せつけた', confess: b.name + 'が打ち明けた' }[how] + '）／' + a.name + 'の嫉妬・執着 ' + Math.round(a.tr.jealous * 100), with: [d], mag: 42 };
    }
  });

  /* --- 奪った相手と、恋人になる --- */
  EV.push({
    id: 'om_steal_win', cat: 'romance', scope: 'pair', pri: true,
    when: function (ctx, a, b) { var pf = ctx.pair(a, b); return !pf.couple && pf.stealer === a.i && pf.stolenFrom != null && !partnerOf(ctx, a) && !partnerOf(ctx, b) && ctx.R(a, b).att > 35 && ctx.R(b, a).att > 30; },
    w: function () { return 3; },
    run: function (ctx, a, b) {
      var pf = ctx.pair(a, b), c = ctx.chars[pf.stolenFrom];
      pf.couple = true; pf.since = ctx.stepIndex; pf.stolen = true;
      ctx.mod2(a, b, { aff: 10, trust: 8 }, { aff: 10, trust: 6 });
      var t = ctx.pick(L('{c}と別れた{b}の部屋に、{a}は花も持たずに現れた。「だから言っただろ。こっちに来いって」{b}は笑って、ドアを大きく開けた。|{b}が{c}と別れたと聞いた夜、{a}は迷わず電話をかけた。「今から行く」――それで、二人は恋人になった。|{a}は{b}の手を取って言った。「奪ったなんて思ってない。最初から、こうなるはずだった」{b}は何も言わずに、その手を握り返した。'));
      return { text: fill(ctx, t, a, b, c), why: a.name + 'が' + c.name + 'から奪った恋（惹かれ ' + Math.round(ctx.R(a, b).att) + '／' + Math.round(ctx.R(b, a).att) + '）', with: [c], mag: 32 };
    }
  });

  /* ======================= 判定と結末 ======================= */
  HK.LABELS.cheatbreak = { name: '浮気で破局', cls: 'enemy', pol: -1 };
  HK.LABELS.affair = { name: '浮気相手', cls: 'night', pol: 0 };
  HK.LABELS.stolen = { name: '略奪愛', cls: 'love', pol: 2 };
  HK.LABELS.fatedlate = { name: '遅すぎた運命の番', cls: 'pine', pol: 1 };
  var cls0 = scen.classify, txt0 = scen.pairText;
  scen.classify = function (ctx, A, B, pf) {
    var om = ctx.om, k = key(A, B), ab = ctx.R(A, B), ba = ctx.R(B, A);
    if (om.fatedLate && om.fatedLate[k] && !pf.couple) return { id: 'fatedlate' };
    if (pf.couple && pf.stolen) return { id: om.bonded[k] ? 'bonded' : 'stolen', dir: pf.stealer };
    if (!pf.couple && pf.broke === 'cheat') return { id: 'cheatbreak', dir: pf.cheatBy };
    var r0 = cls0(ctx, A, B, pf);
    if (r0) return r0;
    if (!pf.couple && pf.affair && !pf.fwb) return { id: 'affair' };
    if (!pf.couple && (pf.hateKiss || pf.hateNight) && (ab.ten + ba.ten) / 2 > 24 && (ab.att > 30 || ba.att > 30)) return { id: 'lovehate', dir: pf.hateNight ? null : (ab.att - ba.att > 15 ? A.i : ba.att - ab.att > 15 ? B.i : null) };
    return null;
  };
  scen.pairText = function (ctx, A, B, cl) {
    var pf = ctx.pair(A, B), n = function (i) { return ctx.chars[i].name; };
    switch (cl.id) {
      case 'fatedlate': return '運命の番だと気づいたとき、Ωのうなじにはもう別のαの噛み跡があった。二人は触れ合わないままだ。';
      case 'stolen': return n(pf.stealer) + 'は、' + (pf.stolenFrom != null ? n(pf.stolenFrom) + 'の恋人だった' : '') + (pf.stealer === A.i ? B.name : A.name) + 'を奪って恋人になった。';
      case 'cheatbreak': return n(pf.cheatBy) + 'の浮気が発覚し、二人は終わった。';
      case 'affair': return '恋人のいる身で、人に言えない夜を重ねた。';
      case 'lovehate': if (pf.hateKiss || pf.hateNight) return '憎まれ口を叩き合いながら、' + (pf.hateNight ? '夜を重ねずにはいられなかった。' : '無理やり唇を奪い、奪われた。'); break;
      case 'fatedmate': if (ctx.om.fatedKnown && ctx.om.fatedKnown[key(A, B)]) return '知り合ってから、運命の番だと気づいた二人。' + (ctx.om.bonded[key(A, B)] ? '番になった。' : '恋人になった。'); break;
    }
    return txt0(ctx, A, B, cl);
  };

  var E = OM.END_DEF;
  E.fated_found = ['運命に気づいて', '{a}と{b}は、ずっと前から知り合いだった。運命の番だと気づいた日から、二人の世界は変わった。うなじの噛み跡が、その答えになった。'];
  E.fated_switch = ['スイッチが呼んだ運命', '第二性が変わったその日、{a}と{b}は互いが運命の番だと知った。眠っていた運命は、スイッチで目を覚ました。'];
  E.fated_late = ['遅すぎた運命', '{a}と{b}は運命の番だった。気づいたとき、{b}のうなじにはもう別のαの噛み跡があった。二人は触れ合わないまま、同じ街で生きている。'];
  E.stolen = ['奪った恋', '{a}は{b}を、恋人の手から奪った。始まりは裏切りだった。それでも二人は、今は同じ部屋に帰る。'];
  E.break_cheat = ['寝取られて', '{b}は{a}を裏切り、ほかの誰かと夜を過ごした。{a}はそれを許さなかった。'];
  E.lovehate = ['愛憎のまま', '{a}と{b}は、顔を合わせれば憎まれ口を叩き、二人きりになれば唇を奪い合う。好きなのか憎いのか、本人たちにも分からない。'];
  E.affair = ['秘密の夜', '{a}と{b}は、恋人には言えない夜を重ねている。'];
  ['fated_found', 'fated_switch', 'fated_late', 'stolen', 'break_cheat', 'lovehate', 'affair'].forEach(function (k) { if (OM.END_IDS.indexOf(k) < 0) OM.END_IDS.push(k); });
  function mk(ctx, id, a, b) { var d = E[id]; return { id: id, title: d[0], text: ctx.t(d[1], a, b), a: a.i, b: b ? b.i : null }; }
  var end0 = BD.endingFor;
  BD.endingFor = function (ctx, a, b) {
    var om = ctx.om, k = key(a, b), pf = ctx.pair(a, b), ab = ctx.R(a, b), ba = ctx.R(b, a);
    if (om.fatedKnown && om.fatedKnown[k] && tieType(ctx, a, b) !== 'fated') {
      var A = alphaOf(a, b), O = omegaOf(a, b);
      if (om.fatedLate[k] && !pf.couple) return mk(ctx, 'fated_late', A, O);
      if (pf.couple && om.bonded[k]) return mk(ctx, om.fatedVia[k] === 'sw' ? 'fated_switch' : 'fated_found', A, O);
    }
    if (pf.couple && pf.stolen && pf.stealer != null) { var S = ctx.chars[pf.stealer]; return mk(ctx, 'stolen', S, S === a ? b : a); }
    if (!pf.couple && pf.broke === 'cheat') { var C = ctx.chars[pf.cheatBy]; return mk(ctx, 'break_cheat', C === a ? b : a, C); }
    if (!pf.couple && !om.bonded[k] && pf.affair && !pf.fwb) return mk(ctx, 'affair', a, b);
    if (!pf.couple && !om.bonded[k] && (pf.hateKiss || pf.hateNight) && (ab.ten + ba.ten) / 2 > 24 && (ab.att > 30 || ba.att > 30)) return mk(ctx, 'lovehate', a, b);
    return end0(ctx, a, b);
  };
  /* 結末を決める合図：浮気で別れてしばらくしたとき／遅すぎた運命に気づいてしばらくしたとき／二人きりで愛憎が続いたとき */
  BD.extraHit = function (ctx, s) {
    var om = ctx.om, P = ctx.chars;
    if (om.cheatEnd && s >= om.cheatEnd.at) {
      var ch = P[om.cheatEnd.b], np = partnerOf(ctx, ch);
      return np ? [ch, np] : [P[om.cheatEnd.a], ch];
    }
    if (om.lateEndAt != null && s >= om.lateEndAt) {
      var k = Object.keys(om.fatedLate)[0];
      if (k) { var ij = k.split('-'); return [P[+ij[0]], P[+ij[1]]]; }
    }
    if (P.length === 2) { var pf = ctx.pair(P[0], P[1]); if (!pf.couple && (pf.hateNight || 0) >= 3 && s >= 14) return [P[0], P[1]]; }
    return null;
  };
})();
