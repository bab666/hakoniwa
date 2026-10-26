/* 箱庭シミュレーター: 人狼ゲーム ― 好意モード（好感度を大きく参照する）
   ・環境設定「好意モード」をオンにすると、投票の半分くらいが、論理ではなく好感度で決まる
     （好きな人には入れられない／嫌いな人に入れたい）。めちゃくちゃ論理的な人はほぼ論理で入れるが、関係とランダムで揺れる
   ・好感度は、住人どうしの関係（恋人・親友・敵対など）＋感じのよさ＋ランダムで決まる
   ・関係のある人は、性格どおりのやり方（甘える・必死に訴える・泣き落とし・距離を詰める・信頼を盾にする）で
     好意を使って信頼を取りにいく。成功するかは嘘の技能（演技力：正直さの低さ・知能・ポーカーフェイス）次第 */
(function () {
  'use strict';
  var HK = window.HK, scen = HK.SCENARIOS && HK.SCENARIOS.jinro;
  if (!scen) return;
  function L(s) { return s.split('|'); }
  function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }
  function fill(t, m) { return String(t).replace(/\{(\w+)\}/g, function (x, k) { return m[k] != null ? m[k] : x; }); }
  var at = -1; scen.env.forEach(function (e, i) { if (e.id === 'prize') at = i; });
  scen.env.splice(at >= 0 ? at : scen.env.length, 0, { id: 'lovemode', label: '好意モード', type: 'select', def: 'off', options: [{ v: 'off', label: 'オフ（推理で投票する）' }, { v: 'on', label: 'オン（好感度で投票することがある）' }], desc: 'オンにすると、半分くらいの投票が好き嫌いで決まり、好意を使って信頼を取りにいく人が出る' });

  var TW = { lover: 1, mate: 1, fated: 1, almost: 0.8, fwb: 0.5, best: 0.8, buddy: 0.75, childhood: 0.7, sibling: 0.65, sibclose: 0.8, sibprot: 0.8, parent: 0.8, pparent: 0.75, friend: 0.5, mentor: 0.5, master: 0.55, teacher: 0.45, senpai: 0.35, colleague: 0.25, classmate: 0.35, boss: 0.4, benefactor: 0.6, relative: 0.55, worship: 0.85, fond: 0.5, blind: 0.75, acq: 0.1, rival: -0.35, enemy: -0.85 , sibbad: -0.15, bad: -0.4 };
  var LBL = function (t) { return HK.TIES && HK.TIES[t] ? HK.TIES[t].label : t; };

  /* ---------- 好意を使って信頼を取りにいく ---------- */
  var APPEAL = {
    amae: { label: '甘える', t: L('{a}は{x}の袖をつまんだ。「ねえ、{x}は私のこと信じてくれるよね？｜なあ、{x}は私を信じてくれるだろう？｜あの、{x}は私のこと、信じてくれますよね？」|{a}は{x}の隣にぴったりくっついた。「{x}だけは、味方でいてよ｜{x}だけは、味方でいてくれ｜{x}だけは、味方でいてください」|{a}は上目づかいで{x}を見た。「……{x}に疑われたら、さすがに泣くよ？｜……{x}に疑われたら、さすがに泣くぞ？｜……{x}に疑われたら、さすがに泣きますよ？」|{a}は{x}の肩に頭を預けた。「つかれた。{x}の隣がいちばん安心する｜疲れた。{x}の隣がいちばん安心する｜疲れました。{x}の隣がいちばん安心します」') },
    plead: { label: '必死に訴える', t: L('{a}は{x}の手を両手で握った。「お願い、{x}。私を信じて。本当に村人なの｜頼む、{x}。私を信じろ。本当に村人なんだ｜お願いです、{x}。私を信じてください。本当に村人なんです」|{a}は身を乗り出した。「{x}、今までずっと一緒にいたでしょ。私が嘘ついたこと、ある？｜{x}、今までずっと一緒にいただろう。私が嘘をついたことが、あるか？｜{x}、今までずっと一緒にいたでしょう。私が嘘をついたこと、ありますか？」|{a}の声が震えた。「みんなに疑われてもいい。でも{x}にだけは、信じてほしい｜皆に疑われてもいい。だが{x}にだけは、信じてほしい｜みんなに疑われてもいいです。でも{x}にだけは、信じてほしいんです」|{a}は{x}の目をまっすぐ見た。「{x}が信じてくれるなら、私、最後まで戦える｜{x}が信じてくれるなら、私は最後まで戦える｜{x}が信じてくれるなら、私、最後まで戦えます」') },
    cry: { label: '泣き落とし', t: L('{a}の目から、ぽろりと涙がこぼれた。「{x}まで……疑うの……？｜{x}まで……疑うのか……？｜{x}まで……疑うんですか……？」|{a}は俯いたまま、声を詰まらせた。「……{x}にだけは、そんな目で見られたくなかった｜＝｜……{x}にだけは、そんな目で見られたくなかったです」|{a}は{x}の服の裾を握ったまま、黙って首を振った。肩が小さく震えていた。') },
    flirt: { label: '距離を詰める', t: L('{a}は{x}の耳元に顔を寄せた。「終わったら、二人でご飯行こ。……だから、今日は私を残して？｜終わったら、二人で食事に行こう。……だから、今日は私を残してくれ｜終わったら、二人でご飯に行きましょう。……だから、今日は私を残してください」|{a}は{x}の指に、そっと自分の指を絡めた。「{x}なら、分かってくれるでしょ｜{x}なら、分かってくれるだろう｜{x}なら、分かってくれますよね」|{a}は{x}にだけ聞こえる声で囁いた。「{x}を最後まで守るのは、私だよ｜{x}を最後まで守るのは、私だ｜{x}を最後まで守るのは、私ですよ」|{a}は{x}の前髪を指で払った。「そんな怖い顔しないで。{x}の味方なんだから｜そんな怖い顔をするな。私は{x}の味方だ｜そんな怖い顔しないでください。{x}の味方なんですから」') },
    pride: { label: '信頼を盾にする', t: L('{a}は{x}をまっすぐ見た。「{x}。私が{x}を裏切ったこと、一度でもあったか｜＝｜{x}。私が{x}を裏切ったことが、一度でもありましたか」|{a}「{x}、私を信じろ。今まで通りでいい｜＝｜{x}、私を信じてください。今まで通りでいいんです」|{a}は腕を組んだ。「他の誰に疑われても構わない。だが{x}だけは、分かっているはずだ｜＝｜他の誰に疑われても構いません。でも{x}だけは、分かっているはずです」|{a}は{x}の肩に手を置いた。「長い付き合いだろう。……任せろ｜＝｜長い付き合いでしょう。……任せてください」') }
  };
  var OK = L('{x}の表情がゆるんだ。「……うん。分かった｜……ああ。分かった｜……はい。分かりました」|{x}は小さく頷いた。「{a}がそう言うなら、信じる｜＝｜{a}がそう言うなら、信じます」|{x}は少し迷ってから、{a}の手を握り返した。|{x}「……ずるいなあ。そんな顔されたら、疑えないよ｜……ずるいな。そんな顔をされたら、疑えない｜……ずるいですね。そんな顔をされたら、疑えません」|{x}はため息をついた。「分かったよ。今日は{a}には入れない｜分かった。今日は{a}には入れない｜分かりました。今日は{a}には入れません」');
  var NG = L('{x}はそっと手を離した。「……ごめん。それとこれとは別｜……すまない。それとこれとは別だ｜……すみません。それとこれとは別です」|{x}は目を細めた。「なんか、あざとくない？｜何だか、あざとくないか？｜何だか、あざとくないですか？」|{x}は首を振った。「好きだからこそ、ちゃんと見たいんだ｜＝｜好きだからこそ、ちゃんと見たいんです」|{x}の表情が硬くなった。「……今の、誰にでも同じこと言ってない？｜……今のは、誰にでも同じことを言っていないか？｜……今の、誰にでも同じことを言っていませんか？」|まわりの視線が冷えた。好意につけこむようなやり方は、かえって人狼らしく見えた。');

  /* 好意で投票したときの一言 */
  var VOTE_PROTECT = L('{a}は{x}の名前を書きかけて、手を止めた。そして、{y}の名前を書いた。|{a}は{x}の方を見られなかった。「……{x}には、入れられない｜＝｜……{x}には、入れられません」|{a}は迷った末に、{x}ではなく{y}に入れた。|{a}は{x}の名前を書けなかった。「理屈では{x}なのに……無理だ｜＝｜理屈では{x}なのに……無理です」――{a}は{y}に入れた。');
  var VOTE_MOOD = L('{a}は、なんとなく{y}の方が好きになれなかった。|{a}は少し迷って、{x}ではなく{y}に入れた。「……なんか、{y}の方が気になる｜……何だか、{y}の方が気になる｜……何だか、{y}の方が気になります」|{a}「{x}って感じじゃないんだよね。{y}にする｜{x}という感じではない。{y}にする｜{x}って感じじゃないんですよね。{y}にします」|{a}は{x}の顔を見て、思い直した。そして{y}の名前を書いた。');
  var VOTE_GRUDGE = L('{a}は迷わず{y}の名前を書いた。理由は、自分でもよく分かっていた。|{a}「推理？　……{y}が気に食わない。それだけ｜推理？　……{y}が気に食わない。それだけだ｜推理ですか？　……{y}が気に食わないんです。それだけです」|{a}は{y}を見て、ふっと鼻で笑った。そして{y}に入れた。|{a}は前から、{y}とは合わないと思っていた。');

  function setup(S, P, input, rng) {
    var ties = input.ties || [];
    P.forEach(function (p) { p.aff = {}; p.tieW = {}; });
    P.forEach(function (p) {
      P.forEach(function (q) {
        if (p === q) return;
        var w = 0, has = 0, lab = [];
        ties.forEach(function (t) {
          if (!((t.a === p.i && t.b === q.i) || (t.a === q.i && t.b === p.i))) return;
          var x = t.type === 'crush' ? (t.a === p.i ? 0.9 : 0.15) : t.type === 'ex' ? rng() * 1 - 0.4 : TW[t.type] != null ? TW[t.type] : 0.1;
          if (Math.abs(x) > Math.abs(w)) w = x;
          has = 1; lab.push(LBL(t.type));
        });
        p.tieW[q.i] = has ? w : 0; p.tieL = p.tieL || {}; p.tieL[q.i] = lab.join('・');
        p.aff[q.i] = clamp(w + (q.like - 0.5) * 0.5 + (rng() - 0.5) * 0.5, -1, 1);
        /* 第一印象にも、好き嫌いが乗る */
        if (p.sus[q.i] != null) p.sus[q.i] = clamp(p.sus[q.i] - p.aff[q.i] * 14, 0, 100);
      });
      /* めちゃくちゃ論理的か（知能と推理の正確さが高く、Aが強い） */
      p.superLogic = p.acc >= 0.85 && p.tr.a >= 0.55;
      p.cnt.emo = 0; p.cnt.appeal = 0; p.cnt.appealOK = 0;
    });
    S.emoLog = [];
  }
  function affTxt(v) { return (v >= 0 ? '+' : '') + Math.round(v * 100); }

  /* 好意で信頼を取りにいく（議論のとき）。動いたら true */
  function appeal(S, p, others, c) {
    var rng = S.rng;
    var heat = others.length ? others.reduce(function (s0, q) { return s0 + (q.sus[p.i] || 50); }, 0) / others.length : 50;
    var need = heat > 50 || c.isW(p);
    if (!need) return false;
    var cands = others.filter(function (q) { return (q.aff[p.i] || 0) > 0.3 && !(c.isW(q) && c.isW(p)); }).sort(function (a, b) { return (b.aff[p.i] + (b.tieW[p.i] || 0)) - (a.aff[p.i] + (a.tieW[p.i] || 0)); });
    var q = cands[0];
    if (!q || p.appealed === c.day) return false;
    if (rng() > 0.3 + Math.max(0, p.tieW[q.i] || 0) * 0.3 + (heat - 50) / 100) return false;
    p.appealed = c.day;
    var t = p.tr, per = p.persona;
    var w = {
      amae: t.fc * 0.6 + t.ac * 0.4 + (per === 'free' || per === 'tsun' ? 0.4 : 0),
      plead: t.np * 0.6 + t.impulse * 0.3 + (per === 'gentle' || per === 'devoted' ? 0.4 : 0),
      cry: t.ac * 0.7 + (per === 'shy' || per === 'devoted' ? 0.5 : 0) - t.cp * 0.3,
      flirt: (t.fc * 0.4 + p.bold * 0.4) * (/恋人|番|友達以上|セフレ|片想い|元恋人/.test(q.tieL[p.i] || p.tieL[q.i] || '') ? 1.6 : 0.6),
      pride: t.cp * 0.6 + t.a * 0.2 + (per === 'proud' || per === 'stern' || per === 'cool' || per === 'polite' ? 0.5 : 0)
    };
    /* 恋愛・R18にしない組（HK.ngPair）には、距離を詰める（口説く）手を使わない */
    if (HK.ngPair(p, q)) delete w.flirt;
    var kind = HK.weighted(rng, Object.keys(w), function (k) { return Math.pow(Math.max(0.02, w[k]), 2); });
    /* 成功は嘘の技能（演技力）。好かれているほど、相手の推理力が低いほど通りやすい */
    var chance = clamp(p.act * 0.6 + q.aff[p.i] * 0.3 - q.acc * 0.25 + (c.isW(p) ? 0 : 0.1) + 0.1, 0.05, 0.9);
    var ok = rng() < chance, m = { a: p.name, x: q.name };
    var text = fill(c.pk(APPEAL[kind].t), m) + fill(c.pk(ok ? OK : NG), m);
    p.cnt.appeal++;
    if (ok) {
      p.cnt.appealOK++;
      if (!c.isW(q)) q.sus[p.i] = clamp((q.sus[p.i] || 50) - 25, 0, 100);
      q.aff[p.i] = clamp(q.aff[p.i] + 0.1, -1, 1); q.spare = q.spare || {}; q.spare[p.i] = c.day;
      others.forEach(function (o) { if (o !== q && !c.isW(o)) o.sus[p.i] = clamp((o.sus[p.i] || 50) - 3 + (o.acc > 0.7 ? 6 : 0), 0, 100); });
    } else {
      if (!c.isW(q)) q.sus[p.i] = clamp((q.sus[p.i] || 50) + 10, 0, 100);
      others.forEach(function (o) { if (o !== q) c.bump(o, p, 4 + o.acc * 4); });
    }
    c.say({ actors: [p.i, q.i], tag: '好意', text: text, why: '好意モード：' + p.name + 'は' + q.name + 'に好かれている（好感度 ' + affTxt(q.aff[p.i]) + (q.tieL[p.i] ? '・' + q.tieL[p.i] : '') + '）。「' + APPEAL[kind].label + '」は性格から。成功率 ' + Math.round(chance * 100) + '％は嘘の技能（演技力 ' + Math.round(p.act * 100) + '）次第' + (c.isW(p) ? '。……' + p.name + 'は人狼だ' : '') + '――' + (ok ? '通った' : '通らなかった') });
    return true;
  }

  /* 投票：好感度で決めることがある。論理での投票先 base を受け取り、最終の投票先を返す */
  function vote(S, p, others, base, wolfSide) {
    var rng = S.rng;
    if (!base || !others.length) return base;
    var tieMax = others.reduce(function (s0, q) { return Math.max(s0, Math.abs(p.tieW[q.i] || 0)); }, 0);
    var emo = p.superLogic ? 0.06 + tieMax * 0.22 : clamp(0.5 + (0.6 - p.acc) * 0.45 + p.tr.np * 0.08 + p.tr.fc * 0.06 - p.tr.a * 0.12, 0.2, 0.85);
    if (Math.abs(p.aff[base.i] || 0) > 0.45) emo += 0.15;
    emo += (rng() - 0.5) * 0.2;
    if (rng() > emo) return base;
    var spared = p.spare && p.spare[base.i] != null;
    p.cnt.emo++;
    /* 好き嫌いで選び直す：嫌いな人ほど、疑わしい人ほど。好きな人（と、好意で訴えてきた人）には入れない */
    var pool = others.filter(function (q) { return (p.aff[q.i] || 0) < 0.35 && !(p.spare && p.spare[q.i] != null) && !(wolfSide && q.role === 'wolf'); });
    if (!pool.length) return base;
    var to = pool.map(function (q) { return { q: q, v: -(p.aff[q.i] || 0) * 80 + (p.sus[q.i] || 50) * 0.3 + rng() * 18 }; }).sort(function (a, b) { return b.v - a.v; })[0].q;
    if (to === base) return base;
    var why = (p.aff[base.i] || 0) > 0.35 || spared ? 'protect' : (p.aff[to.i] || 0) < -0.2 ? 'grudge' : 'mood';
    log(S, p, base, to, why);
    return to;
  }
  function log(S, p, base, to, why) { S.emoLog.push({ p: p, base: base, to: to, why: why }); }
  /* その日の好意の投票をまとめて記録する（三人まで全文） */
  function flush(S, say, pk) {
    var l = S.emoLog; S.emoLog = [];
    if (!l.length) return;
    var full = l.slice(0, 3), rest = l.slice(3);
    full.forEach(function (e) {
      var m = { a: e.p.name, x: e.base.name, y: e.to.name };
      say({ actors: [e.p.i, e.to.i], tag: '感情票', text: fill(pk(e.why === 'protect' ? VOTE_PROTECT : e.why === 'mood' ? VOTE_MOOD : VOTE_GRUDGE), m), why: '好意モード：論理なら' + e.base.name + 'だったが、' + (e.why === 'protect' ? e.base.name + 'への好意（' + affTxt(e.p.aff[e.base.i]) + (e.p.tieL[e.base.i] ? '・' + e.p.tieL[e.base.i] : '') + '）' + (e.p.spare && e.p.spare[e.base.i] != null ? 'と、訴えに心を動かされて' : 'で') + '外した' : e.why === 'mood' ? '好感度の差（' + e.base.name + ' ' + affTxt(e.p.aff[e.base.i]) + '／' + e.to.name + ' ' + affTxt(e.p.aff[e.to.i]) + '）で' + e.to.name + 'にした' : e.to.name + 'への嫌悪（' + affTxt(e.p.aff[e.to.i]) + (e.p.tieL[e.to.i] ? '・' + e.p.tieL[e.to.i] : '') + '）で入れた') + (e.p.superLogic ? '（論理的な人だが、関係とランダムで揺れた）' : '') });
    });
    if (rest.length) say({ kind: 'phase', actors: rest.map(function (e) { return e.p.i; }), tag: '感情票', text: 'ほかに、' + rest.map(function (e) { return e.p.name + '→' + e.to.name; }).join('、') + 'も、好き嫌いで票を入れた。' });
  }

  HK.JinroLove = { setup: setup, appeal: appeal, vote: vote, flush: flush };
})();
