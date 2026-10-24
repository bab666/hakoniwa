/* 箱庭シミュレーター: 無人島 ― 「島に残る」を選んだ理由
   船に乗らない人には、必ず理由をつける。理由は島で起きたことと数値から決まる
   ・仲間外れ（村八分・皆からの信頼の低さ）　・失恋（片想い・想い人が別の誰かと結ばれた・断られた）　・両片想いのまま言えなかった（相手も想っているのに、届かないと思い込んでいる。片想いの「届かなかった」にはしない）
   ・大事な人の死　・自分が誰かを手にかけた罪悪感　・想う相手が島に残る　・まとめ役としての責任
   ・自分から（目標「本当は帰りたくない」）：FC・AC・A・NP のどれが強いかで、思ったことが変わる
   口調は関係しない */
(function () {
  'use strict';
  var HK = window.HK, isl = HK.SCENARIOS && HK.SCENARIOS.island;
  if (!isl) return;
  function L(s) { return s.split('|'); }
  function fill(t, m) { return String(t).replace(/\{(\w+)\}/g, function (x, k) { return m[k] != null ? m[k] : x; }); }
  function pick(ctx, a) { return a[Math.floor(ctx.rng() * a.length)]; }
  function posTie(ctx, a, b) {
    var l = HK.Ties && HK.Ties.all ? HK.Ties.all(ctx, a, b) : [];
    return l.some(function (t) { var d = HK.TIES[t.type]; return d && d.pol > 0; });
  }

  var T = {
    ostra: L('{a}は桟橋の手前で足を止めた。「俺がいなくても、誰も困らないだろ」――あの日から、誰も{a}と目を合わせなかった。|{a}は船を見送った。抜け駆けしようとしたあの夜から、皆の輪に戻れたことは一度もなかった。|{a}は「みんなと同じ船には乗れない」と言った。誰も引き止めなかった。'),
    lonely: L('{a}は船に乗らなかった。島での日々、誰ともろくに打ち解けられなかった。帰っても、それは同じだと思った。|{a}は、皆が抱き合って喜ぶ輪の外にいた。その輪に入れないまま、黙って浜に残った。'),
    heart: L('{a}は、{b}が{c}の手を取って船に乗るのを見ていた。それを見届けてから、{a}は浜に背を向けた。|{a}は{b}の隣に乗る勇気がなかった。同じ船で、{b}と{c}の笑い声を聞き続けるのは無理だった。|{a}は笑って手を振った。「俺はもう少しここにいる」――{b}が{c}を選んだことは、ずっと前から分かっていた。'),
    unreq: L('{a}は、{b}の顔を最後まで見られなかった。届かない想いを抱えたまま、同じ船に揺られる気にはなれなかった。|{a}の想いは、{b}には一度も届かなかった。{a}は島に残ることで、それに区切りをつけた。'),
    unsaid: L('{a}は最後まで、{b}に言えなかった。{b}が自分を何とも思っていないことくらい、分かっているつもりだった。{a}は笑って手を振り、浜に残った。|{a}は船に乗りかけて、{b}の背中を見た。隣に座れば、きっと言ってしまう。困らせるくらいなら、と{a}は桟橋を降りた。|{a}は{b}に「元気でね」とだけ言った。言いかけた本当の言葉は、喉の奥で止まったままだった。{b}も、同じ言葉を飲み込んでいたことを、{a}は知らなかった。'),
    refused: L('{a}は、焚き火の夜に{b}に断られた言葉を、まだ覚えていた。「ごめん。心に決めた人がいる」――{a}は、船に乗らなかった。|{b}に気持ちを伝えて、断られた。それから{a}は、帰りたいと口にしなくなった。'),
    grief: L('{a}は、{b}を埋めた丘を振り返った。「一人にはしておけない」|{a}は{b}の墓に花を供えてから、船に向かって首を振った。|{a}は「{b}を置いては帰れない」と言った。誰も、それ以上は言えなかった。'),
    guilt: L('{a}は自分の手を見つめた。{b}をあんな目に遭わせて、何事もなかったように帰れるはずがなかった。|{a}は船に乗る皆を見送った。{b}のことを、本土でどう説明すればいいのか分からなかった。'),
    withLove: L('{a}は、浜に残ると決めた{b}の隣に立った。「お前が残るなら、俺も残る」|{a}は船の縁に掛けた足を下ろした。振り返ると、{b}が浜で待っていた。|{a}は{b}の手を握った。「帰る場所なんて、ここでいい」'),
    leader: L('{a}は、自分たちで建てた小屋を見上げた。「ここを守る人間も要るだろう」|{a}は皆に言った。「次に流れ着く誰かのために、ここを残しておく」'),
    free: L('{a}は「明日のことを考えなくていい毎日が、こんなに楽しいなんて」と言って、船に背を向けた。|{a}は浜で一番高い椰子の木に登って、船が見えなくなるまで手を振った。降りてくる気はなかった。|{a}は伸びをして笑った。「時計も上司もない。こんなに息がしやすいの、初めてなんだ」|{a}は船を見送りながら、裸足で砂を蹴った。帰りたい理由が、一つも思いつかなかった。'),
    escape: L('{a}は、鳴りやまない電話と、断れない約束のことを思い出した。ここには、どちらもない。|{a}は船に乗りかけて、立ち止まった。「帰ったら、また誰かの期待に合わせるだけだ」|{a}は、帰ったあとの毎日を思い浮かべた。誰かの顔色をうかがい、頼まれごとを断れない日々。{a}は首を振った。|{a}は小さく言った。「戻ったら、また『いい子』に戻らなきゃいけないから」'),
    reason: L('{a}は本土の暮らしと島の暮らしを、指を折って比べてみせた。結論は、島だった。|{a}は「帰ったところで、待っている人も仕事もない」と言った。感傷はなく、ただの計算だった。|{a}は淡々と言った。「島の方が、合理的に暮らせる。食料も水も確保できた」|{a}は救助船の乗組員に、ここに残る理由を三つ並べてみせた。どれも筋が通っていた。'),
    care: L('{a}は、皆で植えた芋の畑を見下ろした。「収穫まで、見届けたい」|{a}は浜に流れ着いた傷ついた海鳥を抱えていた。「この子が飛べるようになるまでは」|{a}は、島で懐いた野良のヤギの頭を撫でた。「この子を置いていけない」|{a}は「誰かが流れ着いたとき、手当てできる人間がいた方がいい」と言った。')
  };

  /* c が船に乗らない理由を、強い順に。kind: 'final'（最終日の船）／'help'（呼ばれた船）／'ship'（通りがかりの船） */
  function reasons(ctx, c, onBoard) {
    var out = [], others = ctx.chars.filter(function (o) { return o !== c; });
    var live = others.filter(function (o) { return o.alive; });
    /* 仲間外れ */
    var tr = live.length ? live.reduce(function (t, o) { return t + ctx.R(o, c).trust + ctx.R(o, c).aff * 0.5; }, 0) / live.length : 0;
    if (c.flags.ostra || (ctx.flags.ostraList || []).indexOf(c.i) >= 0) out.push({ k: 'ostra', s: c.flags.ostra ? 0.5 : 0.3, why: '村八分にされた（皆からの信頼 平均' + Math.round(tr) + '）' });
    else if (tr < -6 && live.length >= 2) out.push({ k: 'lonely', s: 0.18 + Math.min(0.2, -tr / 200) + c.tr.ac * 0.1, why: '皆からの信頼・好意が低いまま（平均' + Math.round(tr) + '）' });
    /* 失恋 */
    others.forEach(function (b) {
      var att = ctx.R(c, b).att; if (att < 28 || !b.alive) return;
      var rival = null, rv = 0;
      live.forEach(function (x) { if (x === c || x === b) return; var v = Math.min(ctx.R(b, x).att, ctx.R(x, b).att); if (v > rv) { rv = v; rival = x; } });
      if (rival && rv > 32 && rv > ctx.R(b, c).att + 5) out.push({ k: 'heart', s: 0.2 + att / 250 + c.tr.ac * 0.1, b: b, c: rival, why: c.name + 'は' + b.name + 'に惹かれていた（' + Math.round(att) + '）が、' + b.name + 'は' + rival.name + 'と結ばれた' });
      else if (ctx.pair(b, c).lockRef) out.push({ k: 'refused', s: 0.2 + att / 250, b: b, why: b.name + 'に想いを断られた（' + b.name + 'は恋愛の相手を決めている）' });
      else if (HK.Ties && HK.Ties.pining && HK.Ties.pining(ctx, c, b)) { if (att > 38) out.push({ k: 'unsaid', s: 0.08 + att / 320 + c.tr.ac * 0.12, b: b, why: b.name + 'とは両片想い（' + Math.round(att) + '／' + b.name + 'から ' + Math.round(ctx.R(b, c).att) + '）なのに、届かない想いだと思い込んだまま言えなかった' }); }
      else if (ctx.R(b, c).att < att * 0.45 && att > 38) out.push({ k: 'unreq', s: 0.1 + att / 300 + c.tr.ac * 0.1, b: b, why: b.name + 'への片想い（' + Math.round(att) + '）が届かなかった（' + b.name + 'から ' + Math.round(ctx.R(b, c).att) + '）' });
    });
    /* 大事な人の死・罪悪感 */
    others.forEach(function (b) {
      if (b.alive) return;
      var r = ctx.R(c, b), close = r.aff + r.att * 0.6 + (posTie(ctx, c, b) ? 30 : 0) + (c.lock === b.i ? 50 : 0);
      if (b.killedBy === c.i) out.push({ k: 'guilt', s: 0.2 + c.tr.np * 0.2 + c.tr.ac * 0.15, b: b, why: c.name + 'は' + b.name + 'の死に関わった（NP・ACが罪悪感を強める）' });
      else if (close > 40) out.push({ k: 'grief', s: 0.2 + close / 350 + c.tr.np * 0.1, b: b, why: b.name + 'を島で失った（好意 ' + Math.round(r.aff) + '）' });
    });
    if (c.leader) out.push({ k: 'leader', s: 0.08 + c.tr.cp * 0.1, why: 'まとめ役としての責任（CP）' });
    out.sort(function (x, y) { return y.s - x.s; });
    return out;
  }
  /* 「本当は帰りたくない」を自分から選んだ理由：いちばん強い自我状態で決める */
  function selfReason(c) {
    var t = c.tr, m = [['free', t.fc, 'FC（自由でいたい）'], ['escape', t.ac, 'AC（元の生活の窮屈さ）'], ['reason', t.a * 0.9 + t.cold * 0.2, 'A（島の方が合理的）'], ['care', t.np * 0.9, 'NP（島で世話をしたいものがある）']];
    m.sort(function (x, y) { return y[1] - x[1]; });
    return { k: m[0][0], s: 0.35, why: '目標「本当は帰りたくない」。いちばん強いのは' + m[0][2] };
  }
  function line(ctx, c, r) { return fill(pick(ctx, T[r.k]), { a: c.name, b: r.b ? r.b.name : '', c: r.c ? r.c.name : '' }); }

  /* 船に乗るか。乗らないなら理由を返す。forced=true は目標で既に残ると決まった人 */
  HK.IslandStay = {
    decide: function (ctx, c, kind, forced) {
      var R = reasons(ctx, c);
      if (forced) {
        if (R[0] && R[0].s > 0.2) { var r1 = Object.assign({}, R[0]); if (c.goal && c.goal.id === 'stay') r1.why += '（もともと「本当は帰りたくない」気持ちもあった）'; return r1; }
        return selfReason(c);
      }
      if (!R.length) return null;
      var top = R[0], p = top.s * (kind === 'ship' ? 0.45 : 0.7) + (c.goal && c.goal.id === 'stay' ? 0.08 : 0) - (c.goal && c.goal.id === 'all' ? 0.1 : 0);
      return ctx.rng() < p ? top : null;
    },
    apply: function (ctx, c, r, how) {
      c.fate = '島に残った'; c.fateNote = how + '――' + r.why;
      c.flags.stayWhy = r;
      ctx.say({ kind: 'event', cat: 'solo', actors: [c].concat(r.b ? [r.b] : []), text: line(ctx, c, r), why: '船に乗らなかった理由：' + r.why, mag: 20 });
    },
    /* 想う相手が残るなら、自分も残る */
    follow: function (ctx, stayers, boarders) {
      var add = [];
      boarders.forEach(function (x) {
        if (stayers.indexOf(x) >= 0) return;
        var love = null;
        stayers.forEach(function (s) { var v = Math.min(ctx.R(x, s).att, ctx.R(s, x).att) + (x.lock === s.i ? 40 : 0); if (v > 45 && (!love || v > love.v)) love = { s: s, v: v }; });
        if (love && ctx.rng() < 0.45 + x.tr.np * 0.2 + x.tr.impulse * 0.15) {
          var r = { k: 'withLove', s: 1, b: love.s, why: '想う相手の' + love.s.name + 'が島に残ると決めた（互いの惹かれ ' + Math.round(love.v) + '）' };
          add.push([x, r]);
        }
      });
      return add;
    }
  };

  /* 最終日の船：残った人に理由をつけ、理由のある人は残るかもしれない */
  var origFinish = isl.finish;
  isl.finish = function (ctx) {
    var P = ctx.present();
    if (origFinish) origFinish.call(this, ctx);
    var shipCame = ctx.env.rescue === 'yes' || ctx.flags.radio;
    if (!shipCame || !P.length) return;
    var stayers = [], boarders = [];
    P.forEach(function (c) {
      if (c.fate === '島に残った') {
        var r = HK.IslandStay.decide(ctx, c, 'final', true);
        HK.IslandStay.apply(ctx, c, r, '救助船に乗らなかった'); stayers.push(c);
      } else if (c.fate === '救助') {
        var r2 = HK.IslandStay.decide(ctx, c, 'final', false);
        if (r2) { HK.IslandStay.apply(ctx, c, r2, '救助船に乗らなかった'); stayers.push(c); } else boarders.push(c);
      }
    });
    HK.IslandStay.follow(ctx, stayers, boarders).forEach(function (x) { HK.IslandStay.apply(ctx, x[0], x[1], '救助船に乗らなかった'); });
  };
})();
