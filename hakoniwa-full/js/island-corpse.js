/* 箱庭シミュレーター: 無人島 ― 亡骸をどうするか（飢えに関係なく、死者が出たら必ず起きる）
   残った一人ひとりの気持ちは数値で決まる：
   ・きちんと弔いたい：NP・CP・AC と、亡くなった人への好意
   ・愛着があるからこそ、ひとつになりたい：嫉妬・執着、衝動性、惹かれ・好意の強さ（CPが歯止め）
   ・合理的に、食料にすべき：ドライさ・A と飢え（NPと好意が歯止め）
   設定「飢えの果て」が「揉めるまで」なら、弔いだけ。口調は関係しない */
(function () {
  'use strict';
  var HK = window.HK, isl = HK.SCENARIOS && HK.SCENARIOS.island;
  if (!isl) return;
  function L(s) { return s.split('|'); }
  function fill(t, m) { return String(t).replace(/\{(\w+)\}/g, function (x, k) { return m[k] != null ? m[k] : x; }); }
  function names(l) { return l.map(function (c) { return c.name; }).join('・'); }
  function posTie(ctx, a, b) { var l = HK.Ties && HK.Ties.all ? HK.Ties.all(ctx, a, b) : []; return l.some(function (t) { var d = HK.TIES[t.type]; return d && d.pol > 0; }); }

  var T = {
    funeral: L('{a}は見晴らしのいい丘に穴を掘り、{v}を埋めた。皆で流木を組んで、小さな墓標を立てた。|{a}が言い出して、{v}を浜の椰子の木の根元に葬った。誰からともなく、花を摘んで供えた。|{a}は{v}の顔を海水で清め、自分の上着でくるんでから土をかけた。|{a}は{v}の墓の前で、短い言葉を述べた。声は途中で途切れた。|{a}は{v}の墓に、{v}が気に入っていた貝殻を並べた。'),
    alone: L('{a}は一人で{v}を埋めた。ほかの誰も、手を貸さなかった。|墓を掘ったのは{a}だけだった。皆は遠巻きに、それを見ていた。'),
    propose: L('{p}は焚き火を見つめたまま言った。「……{v}を、このまま土に返すのは、もったいない」|{p}は淡々と言った。「腐らせるくらいなら、生きている俺たちの役に立ってもらう方がいい。{v}だって、そう思うはずだ」|{p}は皆を見回した。「綺麗事で腹は膨れない。分かってるだろ」|{p}は小さな声で、誰も言い出せなかったことを口にした。「……食べよう」'),
    oppose: L('{a}が{p}の前に立ちはだかった。「{v}は、ちゃんと埋める。それだけは譲らない」|{a}は{p}の胸ぐらを掴んだ。「それ以上言ったら、お前を許さない」|{a}は静かに首を振った。「人として、それだけはしちゃいけない」|{a}は泣きながら叫んだ。「{v}は、食べ物じゃない！」'),
    agree: L('{a}は目を伏せたまま、小さく頷いた。|{a}は何も言わずに、ナイフを差し出した。|{a}は「……仕方ない」とだけ言った。'),
    eatWin: L('その夜の焚き火で何が焼かれていたのか、誰も口にしなかった。{v}の墓は、作られなかった。|話し合いは、{p}の言う通りになった。{v}の分の食料が、皆に分けられた。'),
    eatLose: L('{p}の言葉は、誰にも受け入れられなかった。{v}は丘の上に埋められ、{p}は少し離れた場所からそれを見ていた。|結局、{v}は皆の手で葬られた。その日から、{p}に話しかける者は少なくなった。'),
    love: L('{a}は皆が眠ったあと、{v}のそばにひとりで座っていた。「ずっと一緒にいられる方法、これしか思いつかなかった」――翌朝、{v}の亡骸には布がきちんと掛け直されていた。|{a}は{v}の手を握ったまま、長いこと動かなかった。やがて{a}は、小さく呟いた。「ひとつになろう」|{a}は{v}の髪をひと房切り取り、それから――誰にも見せない場所で、{v}の一部を自分のものにした。|{a}は誰にも気づかれないように、{v}の亡骸の一部を持ち去った。「これで、もう離れない」'),
    loveSeen: L('{b}は、{a}が{v}の亡骸のそばで何をしていたのかに気づいてしまった。「……何してるの」{a}は、穏やかに笑っていた。|{b}は{a}の口元に残ったものを見て、声を失った。|{b}は{a}の荷物の中に、布に包まれた{v}の一部を見つけた。'),
    loveAfter: L('{a}は、{v}の墓の前でだけ、幸せそうな顔をした。|{a}は誰に言うでもなく呟いた。「大丈夫。{v}は、ここにいるから」――そう言って、自分の胸に手を当てた。'),
    shun: L('{a}は青ざめて、その場から離れた。|{a}は口を押さえて、海の方へ走っていった。|{a}は何も見なかったことにした。')
  };

  function stances(ctx, c, v) {
    var r = ctx.R(c, v), close = r.aff + r.att * 0.8 + (posTie(ctx, c, v) ? 30 : 0) + (HK.lockTo(c, v) ? 60 : 0);
    var I = ctx.isl || {}, n = ctx.present().length, hungry = Math.min(0.25, (I.hungry || 0) * 0.05) + (ctx.food < n * 6 ? 0.08 : 0);
    var t = c.tr;
    return {
      close: close,
      bury: 0.25 + t.np * 0.45 + t.cp * 0.3 + t.ac * 0.15 + Math.max(0, close) / 200 + ctx.rng() * 0.15,
      love: close > 45 ? t.jealous * 0.6 + t.impulse * 0.25 + t.fc * 0.1 - t.cp * 0.3 - t.np * 0.1 + Math.min(0.3, close / 400) + c.stress / 400 + ctx.rng() * 0.15 : 0,
      prag: t.cold * 0.55 + t.a * 0.3 - t.np * 0.35 - Math.max(0, close) / 200 + hungry + ctx.rng() * 0.15
    };
  }

  function scene(ctx, v, late) {
    var P = ctx.present(); if (!P.length) return;
    /* 見つかるのが遅れた亡骸は、もう食べられる状態ではない */
    var I = ctx.isl = ctx.isl || {}, dark = ctx.env.dark !== 'mild' && !(late >= 2), m = { v: v.name };
    var S = P.map(function (c) { return { c: c, s: stances(ctx, c, v) }; });
    /* 1) 愛着から：誰にも言わずに（強い執着の人だけ） */
    var lovers = dark ? S.filter(function (x) { return x.s.love > 0.7 && ctx.rng() < (x.s.love - 0.6) * 1.1; }) : [];
    lovers.slice(0, 1).forEach(function (x) {
      var a = x.c;
      ctx.stress(a, -12); a.flags.ateLove = v.i;
      ctx.act2({ actors: [a], cat: 'betray', odd: true, text: fill(ctx.pick(T.love), { a: a.name, v: v.name }), why: a.name + 'の執着・衝動（嫉妬・執着 ' + Math.round(a.tr.jealous * 100) + '）と、' + v.name + 'への想い（' + Math.round(x.s.close) + '）。愛着があるからこそ、離れたくなかった', mag: 35 });
      (I.loveAte = I.loveAte || []).push({ by: a.i, v: v.i });
      var seer = ctx.most(P.filter(function (o) { return o !== a; }), function (o) { return o.tr.a * 0.5 + o.tr.caution * 0.3; });
      if (seer && ctx.rng() < 0.3 + seer.tr.a * 0.4) {
        ctx.act2({ actors: [seer, a], cat: 'conflict', fx: function () { ctx.mod(seer, a, { aff: -25, trust: -25, ten: 30 }); ctx.stress(seer, 20); }, text: fill(ctx.pick(T.loveSeen), { a: a.name, b: seer.name, v: v.name }) + fill(ctx.pick(T.shun), { a: seer.name }), why: seer.name + 'のA・慎重さ（気づいてしまった）' });
        a.flags.loveSeen = true;
      }
    });
    /* 2) 合理的に：食料にしようと言い出す人がいるか */
    var prop = dark && !I.ate ? S.filter(function (x) { return x.s.prag > 0.62; }).sort(function (x, y) { return y.s.prag - x.s.prag; })[0] : null;
    if (prop && ctx.rng() > (prop.s.prag - 0.55) * 1.8) prop = null;
    if (prop) {
      var p = prop.c; m.p = p.name;
      var sup = S.filter(function (x) { return x !== prop && x.s.prag > x.s.bury * 0.8; }), opp = S.filter(function (x) { return x !== prop && x.s.prag <= x.s.bury * 0.8; });
      var wt = function (l) { return l.reduce(function (t, x) { return t + 0.6 + x.c.tr.lead * 0.6 + (x.s.bury > 0.9 || x.s.prag > 0.9 ? 0.3 : 0); }, 0); };
      var yes = wt([prop].concat(sup)), no = wt(opp);
      var head = fill(ctx.pick(T.propose), m);
      var loud = opp.slice().sort(function (x, y) { return y.s.bury - x.s.bury; })[0];
      if (loud) head += fill(ctx.pick(T.oppose), { a: loud.c.name, p: p.name, v: v.name });
      if (sup.length) head += fill(ctx.pick(T.agree), { a: sup[0].c.name });
      if (yes > no) {
        I.ate = true; ctx.food = (ctx.food || 0) + 25;
        var eaters = [p].concat(sup.map(function (x) { return x.c; })), refused = opp.map(function (x) { return x.c; });
        ctx.act2({ actors: eaters, cat: 'betray', fx: function () {
          eaters.forEach(function (c) { ctx.stress(c, 15); });
          refused.forEach(function (c) { eaters.forEach(function (e) { ctx.mod(c, e, { aff: -25, trust: -20, ten: 25 }); }); ctx.stress(c, 15); });
          eaters.forEach(function (e) { eaters.forEach(function (f) { if (e !== f) { ctx.mod(e, f, { trust: 8 }); ctx.pair(e, f).secret = true; } }); });
        }, text: head + fill(ctx.pick(T.eatWin), m) + (refused.length ? names(refused) + 'は、最後まで口をつけなかった。' : ''), why: p.name + 'のドライさ・A（合理的に考えた）。賛成 ' + eaters.length + '人・反対 ' + refused.length + '人（主導性で重みづけ）', mag: 40 });
        return;
      }
      ctx.act2({ actors: [p].concat(loud ? [loud.c] : []), cat: 'conflict', fx: function () { opp.forEach(function (x) { ctx.mod(x.c, p, { trust: -15, aff: -12, ten: 15 }); }); }, text: head + fill(ctx.pick(T.eatLose), m), why: '弔いたい気持ち（NP・CP・AC・' + v.name + 'への好意）が勝った。反対 ' + opp.length + '人' });
      I.buried = (I.buried || []).concat([v.i]);
      return;
    }
    /* 3) 弔い */
    var lead = S.slice().sort(function (x, y) { return y.s.bury - x.s.bury; })[0];
    var helpers = S.filter(function (x) { return x !== lead && x.s.bury > 0.55; });
    var solo = !helpers.length && P.length > 1;
    ctx.act2({ actors: [lead.c].concat(helpers.map(function (x) { return x.c; })), cat: 'help', fx: function () { helpers.forEach(function (x) { ctx.mod(x.c, lead.c, { trust: 6, aff: 4 }); }); P.forEach(function (c) { ctx.stress(c, -4); }); }, text: fill(ctx.pick(solo ? T.alone : T.funeral), { a: lead.c.name, v: v.name }), why: lead.c.name + 'のNP・CP（' + v.name + 'をきちんと弔いたい）' + (solo ? '。ほかの皆は、弔う気持ちが薄かった' : '') });
    I.buried = (I.buried || []).concat([v.i]);
    var la = (I.loveAte || []).filter(function (x) { return x.v === v.i; })[0];
    if (la && ctx.chars[la.by].alive && !ctx.chars[la.by].out && ctx.rng() < 0.6) ctx.say({ kind: 'event', cat: 'solo', odd: true, actors: [ctx.chars[la.by]], text: fill(ctx.pick(T.loveAfter), { a: ctx.chars[la.by].name, v: v.name }), why: '' });
  }

  /* ---------- 村八分のまま死んだ人：亡骸が見つかるか ---------- */
  T.found0 = L('朝、{a}が離れた岩場に{v}の様子を見に行った。{v}は、膝を抱えたまま冷たくなっていた。|{a}は、夜のうちに{v}の焚き火が消えていたことに気づいた。駆けつけたときには、もう遅かった。');
  T.found1 = L('{v}の姿を見かけなくなって、{d}日が経った。{a}が森の奥を探しに行き、倒れている{v}を見つけた。|{a}は、{v}が寝床にしていた岩陰を{d}日ぶりに覗いた。{v}は、そこにいた。もう動かなかった。|{v}がいないことに、誰も{d}日のあいだ気づかなかった。最初に気づいたのは{a}だった。');
  T.found2 = L('{d}日後、{a}は浜に集まる海鳥を追って、{v}を見つけた。誰にも看取られなかった亡骸だった。|{a}が{v}を見つけたのは、{d}日も経ってからだった。{a}はその場に膝をついた。');
  T.never = L('{v}の姿は、それきり見えなくなった。探す者は、いなかった。');
  T.regret = L('{a}は{v}の墓の前で、長いこと動けなかった。「……あのとき、一言でも声をかけていれば」|{a}は、{v}に食事を分けなかった日のことを、何度も思い出した。|{a}は夜になると、{v}が一人で膝を抱えていた岩場の方を見るようになった。|{a}は誰にも聞こえない声で呟いた。「ごめん。許してやればよかった」|{a}は{v}の墓に、自分の分の魚を一切れ供えた。生きているうちに渡すべきだった。');
  T.regretFight = L('{a}は、{v}と最後に交わした言葉が喧嘩だったことを、ずっと悔やんでいた。|{a}は{v}の墓の前で、言えなかった「ごめん」を、やっと口にした。|{a}は{v}に言い放った言葉を思い出して、夜中に何度も目を覚ました。');
  T.regretForgive = L('{a}は{v}の墓に手を合わせた。「もっと早く、皆を止めればよかった」|{a}は、{v}にこっそり魚を渡していた夜のことを思い出した。それだけでは、足りなかった。');
  T.noRegret = L('{a}は{v}の墓を一瞥しただけだった。「自業自得だろ」|{a}は肩をすくめた。「抜け駆けしようとしたのは、あいつの方だ」|{a}は何も言わなかった。後悔している様子は、なかった。');

  function regret(ctx, v) {
    var P = ctx.present(), said = 0;
    P.forEach(function (o) {
      if (said >= 3) return;
      var harm = (o.flags.harm || {})[v.i] || 0, forg = (o.flags.forgave || {})[v.i], r = ctx.R(o, v);
      var fought = r.ten > 45 && r.aff < 10, shunned = v.flags.ostra && !forg;
      if (!harm && !fought && !shunned && !forg) return;
      var t = o.tr, score = t.np * 0.45 + t.ac * 0.3 + t.honesty * 0.15 - t.cold * 0.35 + Math.min(0.3, harm * 0.1) + (forg ? 0.2 : 0) + ctx.rng() * 0.25;
      var m = { a: o.name, v: v.name };
      if (score > (fought && !harm && !shunned && !forg ? 0.6 : 0.5)) {
        said++;
        var pool = forg ? T.regretForgive : (harm || shunned) ? T.regret : T.regretFight;
        ctx.act2({ actors: [o], cat: 'solo', fx: function () { ctx.stress(o, 12 + harm * 3); }, text: fill(ctx.pick(pool), m), why: o.name + 'のNP・AC（後悔）' + (harm ? '。' + v.name + 'を村八分にした（' + harm + '回）' : fought ? '。' + v.name + 'とは揉めたままだった（緊張 ' + Math.round(r.ten) + '）' : forg ? '。こっそり許していたが、守りきれなかった' : '。' + v.name + 'を遠ざけたままだった') });
      } else if ((harm || shunned) && t.cold > 0.55 && ctx.rng() < 0.6) {
        said++;
        ctx.act2({ actors: [o], cat: 'conflict', text: fill(ctx.pick(T.noRegret), m), why: o.name + 'のドライさ（後悔しない）' });
      }
    });
  }
  function findChance(ctx, v, days) {
    var best = null, bv = 0;
    ctx.present().forEach(function (o) {
      var r = ctx.R(o, v), x = o.tr.np * 0.3 + o.tr.a * 0.2 + o.tr.caution * 0.15 + Math.max(0, r.aff) / 200 + ((o.flags.forgave || {})[v.i] ? 0.35 : 0);
      if (x > bv) { bv = x; best = o; }
    });
    return best && ctx.rng() < bv * 0.55 + days * 0.12 ? best : null;
  }

  var origFinish = isl.finish;
  isl.finish = function (ctx) {
    if (origFinish) origFinish.call(this, ctx);
    (ctx.flags.lostBody || []).forEach(function (x) {
      var v = ctx.chars[x.v];
      v.fateNote += '（亡骸は、最後まで誰にも見つけられなかった）';
      (ctx.flags.endNotes = ctx.flags.endNotes || []).push(fill(ctx.pick(T.never), { v: v.name }) + '――' + v.name + 'は村八分のまま、一人で死んだ。');
    });
  };
  var origAfter = isl.after;
  isl.after = function (ctx, s, n) {
    if (origAfter) origAfter.call(this, ctx, s, n);
    ctx.flags.corpseDone = ctx.flags.corpseDone || {};
    ctx.chars.forEach(function (v) {
      if (v.alive || ctx.flags.corpseDone[v.i]) return;
      ctx.flags.corpseDone[v.i] = true;
      if (/海/.test(v.deathHow || '')) return;   /* 海で消えた人には亡骸がない */
      /* 村八分のまま死んだ人は、離れた場所で一人で死ぬ。見つかるかどうかから */
      if (v.flags.ostra) { (ctx.flags.lostBody = ctx.flags.lostBody || []).push({ v: v.i, at: ctx.stepIndex }); return; }
      scene(ctx, v); regret(ctx, v);
    });
    var LB = ctx.flags.lostBody || [];
    ctx.flags.lostBody = LB.filter(function (x) {
      var v = ctx.chars[x.v], d = ctx.stepIndex - x.at, f = findChance(ctx, v, d);
      if (!f) return true;
      var pool = d <= 0 ? T.found0 : d <= 2 ? T.found1 : T.found2;
      ctx.act2({ actors: [f], cat: 'help', fx: function () { ctx.present().forEach(function (o) { ctx.stress(o, 8); }); }, text: fill(ctx.pick(pool), { a: f.name, v: v.name, d: Math.max(1, d) }), why: v.name + 'は村八分のまま、皆から離れた場所で死んだ。見つけたのは' + f.name + '（NP・A・慎重さ' + ((f.flags.forgave || {})[v.i] ? '・こっそり許していた' : '') + '）' + (d ? '。' + d + '日後' : ''), mag: 25 });
      v.fateNote += '（亡骸は' + (d ? d + '日後に' : 'その日のうちに') + f.name + 'が見つけた）';
      scene(ctx, v, d); regret(ctx, v);
      return false;
    });
  };
})();
