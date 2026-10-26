/* 箱庭診断: 無人島の海と探索 ―― 大物釣り／海に引き込まれる・漂流と帰還／一人の探索／二人以上の探索（関係で展開が変わる）
   関係の見方：恋人・惹かれ合い（love）／両片想い（pining：どちらも想っているのに、相手は自分を何とも思っていないと思い込んでいる）／片想い（crush）／ライバル・険悪（rival）／仲良し（friend）／疑い（wary）／まだ他人（plain） */
(function () {
  'use strict';
  var HK = window.HK;
  var isl = HK.SCENARIOS && HK.SCENARIOS.island;
  if (!isl) return;
  function R(ctx, a, b) { return ctx.R(a, b); }
  function pk(ctx, arr) { return ctx.pick(arr); }
  function sk(ctx, c, id) { return ctx.stat(c, id); }
  function T(ctx, s, a, b, c) { return ctx.t(s, a, b, c); }
  function aid(c) { return c.action && c.action.id; }
  function tie(ctx, a, b, ty) { return HK.Ties && HK.Ties.has ? HK.Ties.has(ctx, a, b, ty) : null; }

  /* 二人の関係（a から見た b） */
  function bondOf(ctx, a, b) {
    var ab = R(ctx, a, b), ba = R(ctx, b, a), pf = ctx.pair(a, b);
    if (HK.Ties && HK.Ties.pining && HK.Ties.pining(ctx, a, b)) return 'pining';
    if (pf.couple || tie(ctx, a, b, 'lover') || tie(ctx, a, b, 'mate') || (ab.att > 45 && ba.att > 45)) return 'love';
    if (ab.att > 48 && HK.canLove(a, b)) return 'crush';
    if (tie(ctx, a, b, 'rival') || tie(ctx, a, b, 'enemy') || ab.ten > 38 || ab.aff < -15) return 'rival';
    if (ab.trust < -8) return 'wary';
    if (ab.aff > 30 && ab.trust > 18) return 'friend';
    return 'plain';
  }
  var BOND_WHY = { love: '惹かれ合う二人', pining: '両片想いの二人', crush: '片想いの相手と', rival: '張り合う二人', wary: '信用しきれない相手と', friend: '気心の知れた二人', plain: 'まだよく知らない相手と' };

  /* 恋の気配がある関係（恋人・両片想い・片想い） */
  function warm(k) { return k === 'love' || k === 'pining' || k === 'crush'; }

  /* ======================= 大物釣り ======================= */
  var BIG = [
    { n: 'カジキ', food: 30, pull: 0.85 }, { n: 'ロウニンアジ', food: 22, pull: 0.7 }, { n: '巨大なハタ', food: 24, pull: 0.6 },
    { n: 'キハダマグロ', food: 28, pull: 0.8 }, { n: '大ダコ', food: 18, pull: 0.55 }, { n: 'サメ', food: 26, pull: 0.9 },
    { n: '人の背丈ほどあるウツボ', food: 16, pull: 0.6 }, { n: '巨大なエイ', food: 20, pull: 0.75 }
  ];

  function rescuerFor(ctx, a) {
    var cand = ctx.others(a).filter(function (o) { return o.hp > 30; });
    if (!cand.length) return null;
    return ctx.most(cand, function (o) { var r = R(ctx, o, a); return r.aff / 70 + r.att / 120 + o.tr.np * 0.6 + o.tr.aggr * 0.2 - o.tr.caution * 0.2 + sk(ctx, o, 'hp') * 0.05; });
  }

  /* 海に引き込まれた a のその後 */
  function sweptAway(ctx, a, what) {
    var P = ctx.present(), rng = ctx.rng, res = rescuerFor(ctx, a);
    var intro = a.name + 'の体が、竿ごと海へ引きずり込まれた。' + pk(ctx, [what + 'は止まらなかった。', '波が' + a.name + 'の頭を越えた。', '岸から伸ばされた手は、あと少しで届かなかった。']);
    if (res) {
      var r = R(ctx, res, a), love = bondOf(ctx, res, a);
      var go = 0.18 + res.tr.np * 0.25 + Math.max(0, r.aff) / 250 + (warm(love) ? 0.2 : 0) - (love === 'rival' ? 0.1 : 0) - res.tr.caution * 0.15 - (ctx.env.storm || 0) / 400;
      if (rng() < go) {
        var lines = {
          love: [res.name + 'は迷わず海に飛び込んだ。' + a.name + 'の腕を掴み、離さなかった。浜に這い上がった二人は、しばらく抱き合ったまま動けなかった。' + res.name + '「…二度と、こんなことしないで｜…二度と、こんなことはするな｜…二度と、こんなことしないでください」',
            res.name + 'は' + a.name + 'の名前を叫びながら泳いだ。浜に引き上げたあと、' + a.name + 'は咳き込みながら言った。' + a.name + '「…ねえ、今の、人工呼吸した？｜…おい、今の、人工呼吸したのか｜…あの、今の、人工呼吸しました？」' + res.name + '「してない！　…まだ｜していない！　…まだだ｜してません！　…まだ」'],
          pining: [res.name + 'は誰より先に海へ飛び込み、' + a.name + 'を浜まで引きずり上げた。' + a.name + '「なんで、そこまで…｜なぜ、そこまで…｜なんで、そこまで…」' + res.name + '「…誰でも助ける｜＝｜…誰でも助けます」本当は誰でもよくなかった。' + a.name + 'は、その言葉を真に受けて少しだけ落ち込んだ。',
            res.name + 'は' + a.name + 'を抱えて岸まで泳ぎ切った。二人は砂の上で、同時に「ごめん｜すまない｜すみません」と言った。何を謝ったのか、どちらもわからなかった。濡れた手は、しばらく離れなかった。',
            '浜に引き上げられた' + a.name + 'は、咳き込みながら' + res.name + 'の手を握っていた。' + a.name + '「…嫌だったでしょ、こんなの｜…嫌だっただろう、こんなのは｜…嫌だったでしょう、こんなの」' + res.name + '「嫌なわけない｜嫌なわけがない｜嫌なわけありません」言ってから、' + res.name + 'は慌てて「仲間だし｜仲間だ｜仲間ですし」と付け足した。' + a.name + 'は「だよね｜だな｜ですよね」と笑って、その夜は眠れなかった。'],
          crush: [res.name + 'は服のまま海に飛び込み、' + a.name + 'を浜まで引っ張ってきた。' + a.name + '「ありがと…｜ありがとう…｜ありがとうございます…」' + res.name + 'は濡れた前髪で、真っ赤な顔を隠した。',
            res.name + 'は' + a.name + 'を抱えて岸まで泳ぎ切った。' + a.name + '「重かったでしょ｜重かっただろう｜重かったでしょう」' + res.name + '「…全然｜…全然だ｜…全然です」本当は腕がちぎれそうだった。'],
          rival: [res.name + 'は舌打ちして海に飛び込んだ。' + a.name + 'を浜に放り出すと、' + res.name + '「借りにしとくね。高くつくから｜借りにしておく。高くつくぞ｜借りにしておきます。高くつきますよ」' + a.name + '「…頼んでない｜…頼んでいない｜…頼んでません」' + res.name + '「知ってる｜知っている｜知ってます」',
            res.name + 'は蔓を投げて' + a.name + 'を引き上げた。' + a.name + '「なんで助けたの｜なぜ助けた｜なんで助けたんですか」' + res.name + '「あなたに死なれたら、張り合う相手がいなくなるでしょ｜あなたに死なれたら、張り合う相手がいなくなる｜あなたに死なれたら、張り合う相手がいなくなります」'],
          wary: [res.name + 'は少しだけ迷ってから、流木を投げた。' + a.name + 'はそれにしがみついて、どうにか浜に戻った。二人とも、ありがとうもごめんも言わなかった。',
            res.name + 'が引き上げてくれた。' + a.name + 'は息を整えながら、' + res.name + 'を見直していた。'],
          friend: [res.name + '「つかまって！｜つかまれ！｜つかまってください！」――' + res.name + 'が投げた蔓のロープを、' + a.name + 'は必死で掴んだ。浜に上がった二人は、ずぶ濡れのまま笑い転げた。' + a.name + '「魚に釣られるとこだった｜魚に釣られるところだった｜魚に釣られるとこでした」',
            res.name + 'は' + a.name + 'の襟首を掴んで、浅瀬まで引きずってきた。' + res.name + '「釣りに行って、釣られて帰ってくる人がいる？｜釣りに行って、釣られて帰ってくるやつがあるか｜釣りに行って、釣られて帰ってくる人がいますか」'],
          plain: [res.name + 'が海に飛び込んで、' + a.name + 'を引き上げた。' + a.name + 'はそれまで' + res.name + 'とろくに話したこともなかった。その夜、' + a.name + 'は焚き火で' + res.name + 'の服を一番いい場所に干した。',
            res.name + 'が浅瀬から手を伸ばし、' + a.name + 'を掴んだ。' + a.name + '「…助かった。本当に｜＝｜…助かりました。本当に」']
        };
        ctx.act2({ actors: [res, a], cat: warm(love) ? 'romance' : 'help', mag: 22,
          fx: function () {
            a.hp -= 10; res.hp -= 8; ctx.stress(a, 12);
            ctx.mod2(res, a, { aff: 6, trust: 6, ten: love === 'rival' ? -6 : 0 }, { aff: 14, trust: 18, ten: love === 'rival' ? -10 : 0, att: warm(love) ? 8 : 0 });
            ctx.others(res).forEach(function (o) { if (o !== a) ctx.mod(o, res, { trust: 5 }); });
          },
          text: intro + pk(ctx, lines[love]), why: res.name + 'が助けに飛び込んだ（NP・' + BOND_WHY[love] + '）' });
        return;
      }
    }
    /* 自力で戻る */
    if (rng() < 0.12 + sk(ctx, a, 'hp') * 0.06 + sk(ctx, a, 'know') * 0.04) {
      ctx.act2({ actors: [a], cat: 'solo', mag: 14,
        fx: function () { a.hp -= 18; ctx.stress(a, 10); },
        text: intro + pk(ctx, [a.name + 'は竿を手放し、潮の流れに逆らわず斜めに泳いだ。一時間後、岩場に打ち上げられるようにして戻ってきた。' + a.name + '「…竿、持っていかれた｜＝｜…竿、持っていかれました」',
          a.name + 'は流木にしがみついて、夕方には浜に戻ってきた。髪に海藻を巻きつけたまま「ただいま｜＝｜ただいま戻りました」と言った。誰も笑わなかったが、あとで全員が思い出し笑いをした。']),
        why: a.name + 'の体力 ' + sk(ctx, a, 'hp') + '・サバイバル知識 ' + sk(ctx, a, 'know') + '（自力で岸へ）' });
      if (a.hp <= 0) { ctx.kill(a, null, '海に引き込まれ、浜まで戻る力が残っていなかった'); ctx.flush(); }
      return;
    }
    /* 流される */
    ctx.act2({ actors: [a], cat: 'solo', mag: 30,
      fx: function () {
        a.out = true; a.fate = '海に流された'; a.fateNote = ctx.label + '、' + what + 'に海へ引き込まれ、そのまま沖へ流された';
        a.flags.adrift = { at: ctx.stepIndex, by: what };
        P.forEach(function (o) { if (o !== a) ctx.stress(o, 6 + Math.max(0, R(ctx, o, a).aff) / 6); });
      },
      text: intro + pk(ctx, ['浜に残された者たちが気づいたときには、' + a.name + 'の頭は波間の小さな点になっていた。', a.name + 'の叫び声は、すぐに波の音にかき消された。日が暮れても、' + a.name + 'は戻らなかった。']),
      why: '助けが間に合わなかった（' + what + 'の力）' });
  }

  isl.events = isl.events.concat([
    {
      id: 'i_bigone', cat: 'help', scope: 'solo',
      when: function (ctx, a) { return a.hp > 25 && (a.flags.bigTry || 0) < 2 && (aid(a) === 'fishing' || sk(ctx, a, 'fish') >= 4 || ctx.rng() < 0.2); },
      w: function (ctx, a) { return (aid(a) === 'fishing' ? 0.7 : 0.12) + sk(ctx, a, 'fish') * 0.06 + a.tr.fc * 0.1; },
      run: function (ctx, a) {
        var rng = ctx.rng, F = pk(ctx, BIG), P = ctx.present();
        a.flags.bigTry = (a.flags.bigTry || 0) + 1;
        var helper = ctx.others(a).filter(function (o) { return R(ctx, o, a).aff > 15 && o.tr.np + R(ctx, o, a).aff / 100 > 0.6 && rng() < 0.5; })[0] || null;
        var power = sk(ctx, a, 'fish') * 0.12 + a.hp / 300 + a.tr.a * 0.1 + a.tr.caution * 0.08 + rng() * 0.5 + (helper ? 0.2 : 0) - F.pull * 0.35;
        var hook = a.name + 'の釣り竿が、折れそうなほどしなった。' + pk(ctx, ['糸の先で、' + F.n + 'が暴れていた。', '海面が割れて、' + F.n + 'の背中が見えた。', a.name + '「で、でかい！　なんかでかいの来た！｜で、でかい！　何かでかいのが来た｜で、でかいです！　なんかでかいの来ました！」']);
        if (power > 0.86) {
          var fan = ctx.others(a).length ? ctx.most(ctx.others(a), function (o) { return o.tr.fc + o.tr.warmth + R(ctx, o, a).aff / 100; }) : null;
          ctx.food += F.food;
          P.forEach(function (o) { if (o !== a) ctx.mod(o, a, { aff: 4, trust: 4 }); ctx.stress(o, -8); });
          if (helper) ctx.mod2(a, helper, { aff: 6, trust: 6 }, { aff: 4, trust: 5 });
          var cheer = fan ? pk(ctx, [fan.name + '「今夜はごちそうだ！｜今夜はごちそうだ｜今夜はごちそうです！」', fan.name + 'は' + F.n + 'の横に寝転がって、大きさを比べた。' + fan.name + '「負けた｜＝｜負けました」', fan.name + '「これ、帰ったら絶対誰も信じてくれないやつ｜これは、帰ったら誰も信じないやつだ｜これ、帰ったら絶対誰も信じてくれないやつです」', fan.name + 'は' + a.name + 'を胴上げしようとして、二人とも砂に転がった。']) : '';
          return { cat: 'help', mag: 18, with: helper ? [helper] : null,
            text: hook + (helper ? helper.name + 'が後ろから' + a.name + 'の腰を抱えて、二人がかりで引いた。' : '') + '一時間の格闘の末、' + a.name + 'は' + F.n + 'を浜に引き上げた。' + cheer,
            why: a.name + 'の釣り ' + sk(ctx, a, 'fish') + '・体力' + (helper ? '・' + helper.name + 'の加勢' : '') };
        }
        if (power > 0.64) {
          var doubt = ctx.others(a).length ? pk(ctx, ctx.others(a)) : null;
          ctx.stress(a, 6);
          return { cat: 'solo', mag: 8,
            text: hook + pk(ctx, ['糸が、ぷつりと切れた。', a.name + 'がよろけた瞬間、' + F.n + 'は針を外して海の底へ消えた。']) + (doubt ? a.name + 'は両手をいっぱいに広げて「このくらいあった｜＝｜このくらいありました」と言い張った。' + doubt.name + '「…へえ｜…ほう｜…そうですか」日を追うごとに、その魚は大きくなっていった。' : a.name + 'はしばらく、何もない海面を見つめていた。'),
            why: a.name + 'の釣り ' + sk(ctx, a, 'fish') + '（' + F.n + 'に逃げられた）' };
        }
        ctx.say({ kind: 'event', cat: 'solo', actors: [a], text: hook + a.name + 'は竿を離さなかった。それが間違いだった。', why: F.n + 'の引き（' + a.name + 'の釣り ' + sk(ctx, a, 'fish') + '・体力 ' + Math.round(a.hp) + '）', mag: 10 });
        sweptAway(ctx, a, F.n);
        return null;
      }
    }
  ]);

  /* 流された人のその後（一日ごとに） */
  function adriftTurn(ctx) {
    var rng = ctx.rng;
    ctx.chars.forEach(function (c) {
      if (!c.alive || !c.out || !c.flags.adrift || c.flags.adrift.done) return;
      var days = ctx.stepIndex - c.flags.adrift.at;
      if (days < 1) return;
      c.hp -= 10 + rng.int(8);
      if (c.hp <= 0 || days >= 5) {
        c.flags.adrift.done = true;
        c.fateNote = c.flags.adrift.by + 'に海へ引き込まれ、沖へ流されたまま戻らなかった';
        if (c.hp <= 0) { c.out = false; ctx.kill(c, null, '海に流され、戻らなかった'); ctx.flush(); }
        return;
      }
      if (rng() > 0.12 + sk(ctx, c, 'hp') * 0.04 + sk(ctx, c, 'know') * 0.04) return;
      c.flags.adrift.done = true; c.out = false; c.fate = ''; c.fateNote = '';
      var P = ctx.present().filter(function (o) { return o !== c; });
      var how = pk(ctx, [
        c.name + 'は、島の反対側の浜に打ち上げられていた。流木にしがみついたまま、' + ['', '丸一', '二', '三', '四'][days] + '日を海の上で過ごしていた。',
        '朝、浜にイルカの群れが来た。その真ん中に、流木に乗った' + c.name + 'がいた。' + c.name + '「…イルカ、意外と話が通じる｜＝｜…イルカ、意外と話が通じます」',
        c.name + 'は、手作りの筏のようなものに乗って戻ってきた。' + c.name + '「流されてる間、暇だったから｜流されている間、暇だった｜流されてる間、暇でしたから」',
        '岩場で釣りをしていた者が、波間の頭に気づいた。' + c.name + 'だった。日焼けで、顔が真っ赤に腫れていた。'
      ]);
      if (!P.length) { ctx.act2({ actors: [c], cat: 'solo', text: how, why: c.name + 'の体力とサバイバル知識（漂流から帰還）', mag: 20 }); return; }
      var first = ctx.most(P, function (o) { return R(ctx, o, c).aff / 60 + R(ctx, o, c).att / 80 + o.tr.warmth; });
      var bd = bondOf(ctx, first, c);
      var meet = bd === 'pining' ? pk(ctx, [
        first.name + 'は' + c.name + 'の顔を見た瞬間、泣き出した。' + c.name + 'は、自分のために泣く人がいるとは思っていなかった。' + c.name + '「…心配、してくれたの｜…心配、してくれたのか｜…心配、してくれたんですか」' + first.name + '「当たり前でしょ｜当たり前だ｜当たり前でしょう」――その「当たり前｜当たり前だ｜当たり前です」の意味を、二人は別々に受け取った。',
        first.name + 'は' + c.name + 'に駆け寄って、抱きつく寸前で止まった。' + first.name + '「…おかえり｜＝｜…おかえりなさい」' + c.name + 'も伸ばしかけた腕を、そっと下ろした。流されている間ずっと' + first.name + 'のことを考えていたとは、言えなかった。',
        c.name + '「流されてる間、ずっと会いたい人がいた｜流されている間、ずっと会いたい人がいた｜流されてる間、ずっと会いたい人がいました」' + first.name + 'は笑って「誰？｜誰だ｜誰ですか？」と聞いた。' + c.name + 'は「…内緒｜…内緒だ｜…内緒です」と目をそらした。' + first.name + 'はその夜、焚き火を見ながら、それが自分ならいいのにと思った。'
      ]) : {
        love: first.name + 'は駆け寄って、' + c.name + 'を抱きしめた。何も言えなかった。' + c.name + '「…ただいま｜＝｜…ただいま戻りました」',
        crush: first.name + 'は' + c.name + 'の顔を見た瞬間、泣き出した。自分でも驚くほど、止まらなかった。',
        rival: first.name + '「…遅いんだよ｜…遅い｜…遅いんですよ」' + c.name + '「待ってたの？｜待っていたのか｜待ってたんですか？」' + first.name + '「待ってない｜待っていない｜待ってません」焚き火のそばには、' + c.name + 'の分の魚が三日分、取ってあった。',
        wary: first.name + 'は' + c.name + 'を見て、少し肩の力を抜いた。疑っていたのが、急に馬鹿らしくなった。',
        friend: first.name + '「生きてたー！｜生きていた！｜生きてましたー！」――' + first.name + 'は' + c.name + 'に飛びついて、二人そろって波打ち際に倒れた。',
        plain: first.name + 'は' + c.name + 'に水を渡した。' + c.name + 'は一気に飲み干して、「生き返った｜＝｜生き返りました」と言った。'
      }[bd];
      ctx.act2({ actors: [c, first], cat: warm(bd) ? 'romance' : 'bond', mag: 24,
        fx: function () { c.hp = Math.max(c.hp, 15); P.forEach(function (o) { ctx.stress(o, -10); ctx.mod(o, c, { aff: 4 }); }); ctx.mod2(first, c, { aff: 8, trust: 6 }, { aff: 10, trust: 8, att: warm(bd) ? 6 : 0 }); },
        text: how + meet, why: c.name + 'が漂流から帰還（' + days + '日）。' + first.name + 'の好意' });
    });
  }

  /* ======================= 一人で探索する ======================= */
  var SOLO_FIND = [
    { t: '{a}は森の奥で、澄んだ湧き水を見つけた。口に含むと、甘かった。', fx: function (ctx, a) { ctx.present().forEach(function (o) { ctx.stress(o, -6); if (o !== a) ctx.mod(o, a, { trust: 4 }); }); }, cat: 'help' },
    { t: '{a}は崖の下で、半分砂に埋もれた救命ボートの残骸を見つけた。使える板とロープが残っていた。', fx: function (ctx) { if (!ctx.flags.raftDone) ctx.flags.raft = (ctx.flags.raft || 0) + 10; }, cat: 'escape' },
    { t: '{a}は野生のバナナが群生している谷を見つけた。両腕いっぱいに抱えて帰った。', fx: function (ctx, a) { ctx.food += 12; ctx.others(a).forEach(function (o) { ctx.mod(o, a, { aff: 3 }); }); }, cat: 'help' },
    { t: '{a}は洞窟の奥で、誰かの日記を見つけた。最後のページには「明日、船が来る気がする｜＝｜明日、船が来る気がします」とだけ書いてあった。日付は四十年前だった。', fx: function (ctx, a) { ctx.stress(a, 8); }, cat: 'solo' },
    { t: '{a}は浜で、コルク栓のされた瓶を拾った。中の手紙には、外国語で「宿題を代わりにやってくれる人を募集」と書いてあった。', fx: function (ctx, a) { ctx.stress(a, -4); }, cat: 'solo' },
    { t: '{a}は島の一番高い岩に登った。水平線の向こうに、うっすらと別の島影が見えた気がした。', fx: function (ctx, a) { ctx.present().forEach(function (o) { ctx.stress(o, -5); }); }, cat: 'escape' },
    { t: '{a}は朽ちた小屋の中で、錆びたナイフと釣り針の入った缶を見つけた。', fx: function (ctx, a) { ctx.others(a).forEach(function (o) { ctx.mod(o, a, { trust: 4 }); }); if (!ctx.flags.raftDone) ctx.flags.raft = (ctx.flags.raft || 0) + 4; }, cat: 'help' },
    { t: '{a}はコウモリだらけの洞窟に入ってしまい、悲鳴を上げながら全力で引き返した。', fx: function (ctx, a) { ctx.stress(a, 8); a.hp -= 3; }, cat: 'solo' }
  ];
  /* 笑える一人探索 */
  var SOLO_FUNNY = [
    '{a}は道に迷って三時間歩き、たどり着いたのは出発した浜だった。砂浜には自分の足跡が、きれいな円を描いていた。',
    '{a}は猿に帽子を盗まれた。追いかけて木に登ったら、今度は靴も盗まれた。',
    '{a}はヤシの実に顔を描いて「ココさん」と名付け、一時間ほど身の上話をしてから帰ってきた。ココさんは聞き上手だった。',
    '{a}は泥沼にはまり、全身泥まみれで拠点に戻った。見張りが悲鳴を上げて棒を振り回した。',
    '{a}は「ここは俺の島」と彫られた木の看板を見つけた。日付は二十年前だった。',
    '{a}は探索に出たはずが、日当たりのいい岩の上で昼寝してしまい、片側だけ日焼けして帰ってきた。',
    '{a}は「秘密基地にちょうどいい｜＝｜秘密基地にちょうどいいです」と言って木の上に小屋を作り始め、夕方には降りられなくなっていた。',
    '{a}は砂浜で巨大なヤドカリと睨み合い、十五分後に負けを認めて道を譲った。'
  ];
  var SOLO_FUNNY_REACT = ['{b}は涙が出るほど笑った。', '{b}「…何してたの、一日｜…何をしていた、一日｜…何してたんですか、一日」', '{b}はその話を、その夜三回せがんだ。', '{b}は黙って、{a}の肩を叩いた。'];

  isl.events = isl.events.concat([
    {
      id: 'i_solo_find', cat: 'solo', scope: 'solo',
      w: function (ctx, a) { return (aid(a) === 'explore' ? 0.9 : 0.12) + a.tr.fc * 0.2 + sk(ctx, a, 'know') * 0.03; },
      run: function (ctx, a) {
        var f = pk(ctx, SOLO_FIND);
        f.fx(ctx, a);
        return { cat: f.cat, text: T(ctx, f.t, a), why: a.name + 'が一人で島を探索した（FC・サバイバル知識 ' + sk(ctx, a, 'know') + '）', mag: 8 };
      }
    },
    {
      id: 'i_solo_funny', cat: 'bond', scope: 'pair',
      w: function (ctx, a) { return (aid(a) === 'explore' ? 0.55 : 0.08) + a.tr.fc * 0.25 + a.tr.impulse * 0.15; },
      run: function (ctx, a, b) {
        ctx.mod2(a, b, { aff: 3 }, { aff: 4, ten: -3 }); ctx.stress(a, -4); ctx.stress(b, -5);
        return { text: T(ctx, pk(ctx, SOLO_FUNNY), a, b) + T(ctx, pk(ctx, SOLO_FUNNY_REACT), a, b), why: a.name + 'のFC・衝動（一人の探索で起きた珍事）', mag: 6 };
      }
    },
    {
      /* 一人の探索の土産：関係で渡し方が変わる */
      id: 'i_solo_gift', cat: 'romance', scope: 'pair',
      when: function (ctx, a, b) { var k = bondOf(ctx, a, b); return warm(k) || k === 'rival' || k === 'friend'; },
      w: function (ctx, a, b) { return (aid(a) === 'explore' ? 0.5 : 0.08) + R(ctx, a, b).att / 120 + R(ctx, a, b).aff / 200; },
      run: function (ctx, a, b) {
        var k = bondOf(ctx, a, b), rb = R(ctx, b, a);
        var G = {
          love: ['{a}は探索の帰りに見つけた桜色の貝殻を、黙って{b}の手のひらに載せた。{b}はそれを、寝床の枕元に置いた。', '{a}は「誰にも教えてない場所」に{b}を連れていった。夕日がまっすぐ差し込む、小さな入り江だった。'],
          pining: ['{a}は森で摘んだ白い花を、「余ったから｜余った｜余りましたから」と言って{b}に渡した。同じ日の夕方、{b}も「たまたま見つけた｜＝｜たまたま見つけました」と言って、同じ白い花を{a}に差し出した。二人はしばらく、互いの手の花を見比べていた。',
            '{a}は一番きれいな貝殻を拾って、{b}に渡そうとして、やめた。どうせ、ただの貝殻だと思われる。翌朝、{b}の枕元には、{b}が{a}に渡しそびれた貝殻がもう一つ並んでいた。',
            '{a}は甘い木の実を「みんなに」と言って配り、いちばん熟れたのだけを{b}の分に回した。{b}は気づかなかったふりをした。{a}がそうするのは誰にでもだと、{b}は思い込んでいた。'],
          crush: ['{a}は森で摘んだ白い花を、渡すかどうか一時間迷った。結局「…落ちてた｜…落ちていた｜…落ちてました」と言って{b}に押しつけた。', '{a}は一番形のいい貝殻を拾って、{b}に渡すためだけに遠回りして帰った。'],
          rival: ['{a}は探索で見つけた巨大な果実を、わざわざ{b}の目の前で齧った。{a}「探せばあるのに｜探せばある｜探せばあるのに」{b}「…明日はもっとでかいの見つけてくる｜…明日はもっとでかいのを見つけてくる｜…明日はもっとでかいの見つけてきます」', '{a}は自作の島の地図を、{b}にだけ見せびらかした。'],
          friend: ['{a}は「{b}が好きそう｜{b}が好きそうだ｜{b}が好きそうです」と言って、変な形の流木を持ち帰った。{b}は大喜びで、それを拠点の入り口に飾った。', '{a}は{b}のために、甘い木の実をポケットいっぱいに詰めて帰った。']
        }[k];
        var fx;
        if (k === 'rival') fx = function () { ctx.mod2(a, b, { ten: 4, aff: 2 }, { ten: 6, aff: 1 }); };
        else if (k === 'friend') fx = function () { ctx.mod2(a, b, { aff: 5 }, { aff: 6, trust: 3 }); };
        else fx = function () { ctx.mod2(a, b, { att: 4 }, { att: k === 'love' || rb.att > 25 ? 7 : 2, aff: 4 }); };
        fx();
        return { cat: k === 'rival' ? 'conflict' : k === 'friend' ? 'bond' : 'romance', text: T(ctx, pk(ctx, G), a, b), why: '探索の土産（' + BOND_WHY[k] + '）', mag: 8 };
      }
    }
  ]);

  /* ======================= 二人以上で探索する ======================= */
  var DUO = {
    love: [
      ['{a}と{b}は、川を渡るとき自然に手を繋いだ。渡り終えても、どちらも手を離さなかった。', { att: 6, aff: 4 }, { att: 6, aff: 4 }, 'romance'],
      ['{a}と{b}は、森の奥に青く光るラグーンを見つけた。{b}「ここ、二人だけの秘密にしよう｜ここは、二人だけの秘密にする｜ここ、二人だけの秘密にしましょう」', { att: 5, trust: 5 }, { att: 5, trust: 5 }, 'romance', 'sec'],
      ['{a}は滑りやすい岩場で{b}を支えようとして、二人そろって潮だまりに落ちた。ずぶ濡れのまま、しばらく笑いが止まらなかった。', { aff: 5, att: 3 }, { aff: 5, att: 3 }, 'romance']
    ],
    pining: [
      ['{a}と{b}は二人きりで探索に出た。川を渡るとき、二人は同時に手を差し出し、同時に引っ込めた。結局、どちらも一人で渡った。', { att: 4 }, { att: 4 }, 'romance'],
      ['崖の上で、{a}が「あのさ｜あのな｜あのですね」と言った。{b}も「あのさ｜あのな｜あのですね」と言った。{a}「…先どうぞ｜…先に言え｜…先にどうぞ」{b}「いや、たいしたことじゃないから｜いや、たいしたことではない｜いや、たいしたことじゃないですから」二人とも、言いかけたことの続きを言わないまま拠点に戻った。', { att: 5 }, { att: 5 }, 'romance'],
      ['探索の帰り道、{b}が「疲れた｜＝｜疲れました」と言った。{a}は黙ってしゃがみ、背中を差し出した。背負われながら、{b}は「{a}は誰にでも優しい｜＝｜{a}は誰にでも優しいです」と思い、{a}は「{b}は誰にでも甘える｜＝｜{b}は誰にでも甘えます」と思っていた。', { att: 6, trust: 3 }, { att: 6, trust: 4 }, 'romance'],
      ['森の奥で、{a}と{b}は夕立に降られて、狭い岩陰に二人で押し込まれた。肩が触れていた。{a}「…狭くてごめん｜…狭くてすまない｜…狭くてすみません」{b}「…こっちの台詞｜…こっちの台詞だ｜…こっちの台詞です」雨がやんでも、どちらもすぐには立ち上がらなかった。', { att: 6, aff: 3 }, { att: 6, aff: 3 }, 'romance']
    ],
    crush: [
      ['{a}は{b}と二人で探索に出られることになり、前の晩あまり眠れなかった。当日、{a}は緊張で三回転んだ。', { att: 5 }, { aff: 3 }, 'romance'],
      ['{a}は{b}の前でいいところを見せようと崖の上の果実に手を伸ばし、落ちてきた果実を顔で受け止めた。{b}は声を上げて笑った。', { att: 3, aff: 2 }, { aff: 5 }, 'romance'],
      ['探索の帰り道、{b}が「疲れた｜＝｜疲れました」と言った。{a}は無言でしゃがんで背中を差し出した。拠点までの道のりは、行きより短く感じた。', { att: 6 }, { att: 4, trust: 5 }, 'romance']
    ],
    rival: [
      ['{a}と{b}は、どっちの道が正しいかで三十分言い争い、別々の道を進んで、同じ場所で再会した。二人とも、何も言わなかった。', { ten: 3, aff: 2 }, { ten: 3, aff: 2 }, 'conflict'],
      ['{a}と{b}は「どっちが多く食べ物を見つけるか｜どちらが多く食べ物を見つけるか｜どっちが多く食べ物を見つけるかです」で勝負した。結果は引き分けで、その日の夕食はいつもの倍だった。', { ten: -4, aff: 4 }, { ten: -4, aff: 4 }, 'bond', 'food'],
      ['崖の途中で{a}の足場が崩れた。とっさに腕を掴んだのは{b}だった。{b}「…貸しだよ｜…貸しだぞ｜…貸しですよ」{a}「…わかってる｜…わかっている｜…わかってます」帰り道、二人はいつもより少しだけ並んで歩いた。', { trust: 10, ten: -8 }, { trust: 4, ten: -4 }, 'help']
    ],
    wary: [
      ['{a}は{b}と二人で崖沿いを歩くことになった。{a}はずっと、{b}より海側を歩かないように気をつけていた。{b}も同じことをしていた。', { ten: 4 }, { ten: 4 }, 'conflict'],
      ['{b}が岩陰で何かを拾ってポケットに入れたのを、{a}は見逃さなかった。{a}「今の、何？｜今の、何だ｜今の、何ですか？」{b}「…貝殻｜＝｜…貝殻です」本当に貝殻だった。気まずい沈黙だけが残った。', { trust: 2, ten: 5 }, { trust: -4, ten: 4 }, 'conflict'],
      ['足をくじいた{a}に、{b}は黙って肩を貸した。{a}は、自分が{b}の何を疑っていたのか、思い出せなくなった。', { trust: 12, aff: 5 }, { trust: 3 }, 'help']
    ],
    friend: [
      ['{a}が{b}を肩車して、高い枝のマンゴーをもぎ取った。二人の連携は完璧だった。帰りに{a}が「重かった｜＝｜重かったです」と言うまでは。', { aff: 5, trust: 4 }, { aff: 4, trust: 4 }, 'bond', 'food'],
      ['{a}と{b}は難破船の残骸を探検して、船長室で古い望遠鏡を見つけた。二人は交代で「陸だー！｜陸だ！｜陸です！」と叫んで遊んだ。', { aff: 6 }, { aff: 6 }, 'bond'],
      ['{a}と{b}は、探索中に見つけた一番変な形の石を拠点に持ち帰り、「島の神様」として祀った。翌日から、なぜか全員がそれに手を合わせるようになった。', { aff: 5 }, { aff: 5 }, 'bond']
    ],
    plain: [
      ['{a}と{b}は、黙々と森を歩いた。帰る頃には、好きな食べ物と嫌いな虫の話くらいはするようになっていた。', { aff: 4, trust: 3 }, { aff: 4, trust: 3 }, 'bond'],
      ['{a}と{b}は、どちらが先に頂上に着くか競争して、頂上で二人とも倒れた。息が整うまで、空を見上げて笑っていた。', { aff: 5 }, { aff: 5 }, 'bond'],
      ['{a}は{b}が意外なほど方向感覚がいいことを知った。{b}は{a}が意外なほど虫に弱いことを知った。', { trust: 4, aff: 3 }, { aff: 3 }, 'bond']
    ]
  };
  /* 三人以上で探検隊を組む（笑える） */
  var GROUP = [
    '{a}を隊長に、探検隊が結成された。地図を書き、隊旗を作り、隊歌まで決めたところで日が暮れた。探検は明日になった。',
    '{a}の号令で島の奥地へ向かった探検隊は、「伝説の果樹園」を発見した。パイナップル畑だった。全員が無言で食べた。',
    '{a}たちの探検隊は、島の地図を三人がそれぞれ書いた。三枚とも、まったく違う形の島になった。',
    '{a}が先頭で藪をかき分けていると、後ろの{c}が「静かに｜静かにしろ｜静かにしてください」と言った。全員が息を殺した。巨大なヤドカリが一匹、横切っていった。',
    '探検の途中、{a}が「今、誰か歌った？｜今、誰か歌ったか｜今、誰か歌いました？」と言った。誰も歌っていなかった。全員で走って帰った。翌朝、それが鳥の声だとわかった。'
  ];

  isl.events = isl.events.concat([
    {
      id: 'i_duo_explore', cat: 'bond', scope: 'pair',
      when: function (ctx, a, b) { return a.hp > 20 && b.hp > 20; },
      w: function (ctx, a, b) {
        var e = (aid(a) === 'explore' || aid(a) === 'food' ? 0.5 : 0.1) + (aid(b) === 'explore' || aid(b) === 'food' ? 0.3 : 0);
        return e + Math.abs(R(ctx, a, b).aff) / 200 + R(ctx, a, b).att / 200 + R(ctx, a, b).ten / 250;
      },
      run: function (ctx, a, b) {
        var k = bondOf(ctx, a, b), L = pk(ctx, DUO[k]);
        ctx.mod2(a, b, L[1], L[2]);
        if (L[4] === 'food') ctx.food += 8;
        if (L[4] === 'sec') ctx.pair(a, b).secret = true;
        ctx.stress(a, -3); ctx.stress(b, -3);
        return { cat: L[3], text: T(ctx, L[0], a, b), why: '二人で探索（' + BOND_WHY[k] + '）', mag: 10 };
      }
    },
    {
      id: 'i_expedition', cat: 'bond', scope: 'solo',
      when: function (ctx) { return ctx.present().length >= 3 && !(ctx.flags.expN >= 2); },
      w: function (ctx, a) { return (aid(a) === 'explore' || aid(a) === 'gather' ? 0.35 : 0.06) + a.tr.lead * 0.2 + a.tr.fc * 0.15; },
      run: function (ctx, a) {
        ctx.flags.expN = (ctx.flags.expN || 0) + 1;
        var others = ctx.others(a), c = others.length ? pk(ctx, others) : null;
        others.forEach(function (o) { ctx.mod2(a, o, { aff: 3 }, { aff: 3, trust: 2 }); ctx.stress(o, -5); });
        ctx.stress(a, -5); ctx.food += 4;
        return { text: T(ctx, pk(ctx, c ? GROUP : GROUP.filter(function (s) { return s.indexOf('{c}') < 0; })), a, null, c), why: a.name + 'の主導性・FC（探検隊）', mag: 8, with: c ? [c] : null };
      }
    }
  ]);

  var after0 = isl.after;
  isl.after = function (ctx, s, n) {
    after0(ctx, s, n);
    adriftTurn(ctx);
  };
  HK.IslandSea = { bondOf: bondOf };
})();
