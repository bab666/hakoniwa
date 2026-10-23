/* 箱庭シミュレーター: オメガバース ― 街の外から来る運命の番（モブ）
   「運命の番の現れやすさ」が高いと、住人どうしの関係に運命の番がいないα・Ωの前に、住人ではない運命の番が現れて場をかき回す。
   ・恋人がいる人：職場や家の前に現れ、連絡を寄越し、発情期・ラットの匂いに呼ばれて来る。恋人は気づいて詰める。
     揺れた末に、運命の抗えなさが高いほど恋人を捨てて運命へ走り、低いほど抗って振り切る（モブは街を去る）
   ・恋人がいない人：口説かれる。運命に呑まれて結ばれる／抗って断る／手を出されて不快、のどれかになる
   モブは住人ではないので、関係図には出ない */
(function () {
  'use strict';
  var HK = window.HK, OM = HK.OMEGA, BD = OM.B, SX = OM.SEX;
  var scen = HK.SCENARIOS.omega, EV = scen.events;
  function sx(c) { return c.om.sex; }
  function key(a, b) { return a.i < b.i ? a.i + '-' + b.i : b.i + '-' + a.i; }
  function partnerOf(ctx, a) {
    var p = null;
    ctx.present().forEach(function (o) { if (o !== a && ctx.pair(a, o).couple) p = o; });
    return p;
  }
  function tieType(ctx, a, b) { var t = HK.Ties && HK.Ties.get(ctx, a, b); return t ? (t.like || t.type) : ''; }
  function L(s) { return s.split('|'); }
  function fateV(ctx) { return (ctx.env.fate == null ? 35 : ctx.env.fate) / 100; }
  function dest(ctx) { return OM.destiny ? OM.destiny(ctx) : 0.5; }
  function why(ctx, s) { return s + '／運命の番の現れやすさ ' + Math.round(fateV(ctx) * 100) + '／運命の抗えなさ ' + Math.round(dest(ctx) * 100); }
  function mobOf(ctx, a) { return ctx.om.mob ? ctx.om.mob[a.i] : null; }
  function tag(m) { return m.name + '（' + SX[m.sex] + '）'; }
  /* {m}=モブの名前 {M}=モブ名（第二性） {S}=モブの第二性 {sm}=モブの匂い {sa}=住人の匂い、あとは ctx.t（{a}{b}{c}） */
  function fill(ctx, t, m, a, b, c) {
    t = t.replace(/\{M\}/g, tag(m)).replace(/\{m\}/g, m.name).replace(/\{S\}/g, SX[m.sex]).replace(/\{sm\}/g, m.scent).replace(/\{sa\}/g, function () { return OM.shortScent(a); });
    return ctx.t(t, a, b, c);
  }
  function note(ctx, s) { (ctx.flags.endNotes = ctx.flags.endNotes || []).push(s); }

  var NAMES = ['白石', '久遠', '七瀬', '東雲', '氷室', '真壁', '高槻', '九条', '小鳥遊', '如月', '鷺沢', '御影', '伊集院', '柊', '遠野', '神楽', '早乙女', '常盤', '黒須', '水無瀬', '桐生', '朝比奈'];
  var SCENTS = ['白檀', '雨上がりの土', '焦がしたキャラメル', '鉄と雪', '夜のジャスミン', '煙草と革', '青い林檎', '潮風', '墨', '焚き火', 'ラベンダー', 'ウイスキー', '蜂蜜', '冷たい金属', '真夏の草', '古い本'];
  var WHERE = ['駅の改札', '雨宿りの軒先', '取引先の会議室', 'コンビニのレジ待ち', '深夜の交差点', '病院の待合室', '行きつけの店のカウンター', 'バスの最後列'];

  /* ======================= 準備：モブの運命の番を割り当てる ======================= */
  var setup0 = scen.setup;
  scen.setup = function (ctx) {
    setup0(ctx);
    var om = ctx.om, rng = ctx.rng, P = ctx.chars;
    om.mob = {};
    var p = HK.clamp((fateV(ctx) - 0.3) * 1.1, 0, 0.8);
    if (p <= 0) return;
    var used = {};
    var okName = function (n) { return !used[n] && !P.some(function (c) { return c.name.indexOf(n) >= 0 || n.indexOf(c.name) >= 0; }); };
    var pool = rng.shuffle(NAMES);
    P.forEach(function (c) {
      if (sx(c) !== 'a' && sx(c) !== 'o') return;
      if (c.lock != null || c.likes === 'none') return;
      /* 関係で「運命の番」が付いている人、本人も知らない運命の番が住人の中にいる人には現れない */
      if (P.some(function (o) { return o !== c && tieType(ctx, c, o) === 'fated'; })) return;
      if (om.fatedLatent && Object.keys(om.fatedLatent).some(function (k) { return k.split('-').indexOf(String(c.i)) >= 0; })) return;
      if (rng() >= p) return;
      var name = pool.filter(okName)[0];
      if (!name) return;
      used[name] = 1;
      om.mob[c.i] = {
        name: name, sex: sx(c) === 'a' ? 'o' : 'a', gender: c.likes === 'm' || c.likes === 'f' ? c.likes : '',
        scent: rng.pick(SCENTS), at: 2 + rng.int(9), state: 'unmet', waver: 0, last: -9, bad: false, metAt: null, doneAt: null, how: ''
      };
    });
  };

  /* ======================= 出会い ======================= */
  var MEET = {
    low: L('{a}は{w}で、知らない{S}とすれ違った。{sm}の匂いがした。妙に落ち着く匂いだ、と思った。それだけだった。――街の外から来た{S}の{m}。運命の番だと知るのは、ずっとあとになる。|{w}で、{a}は一瞬だけ足を止めた。{sm}の匂い。隣にいた知らない{S}が、{m}と名乗った。{a}は会釈だけして歩き出した。その匂いが何だったのか、気づくのは何日も経ってからだった。'),
    mid: L('{w}で、{a}と知らない{S}の目が合った。{sm}の匂いが、体の奥の何かを叩いた。{m}と名乗ったその{S}は、この街の住人ではなかった。――運命の番だった。|{a}は{w}で、知らない匂いに足を止めた。{sm}。その先に、街の外から来た{S}の{m}がいた。振り返ったのは同時だった。'),
    high: L('{w}で、{a}は足を止めた。{sm}の匂いが、理性を素通りして体を掴んだ。振り返ると、知らない{S}が同じ顔でこちらを見ていた。街の外から来た{M}。――名前も知らないのに、もう離れられないと分かってしまった。|{w}で、{a}の息が止まった。{sm}の匂いの先に、見知らぬ{S}が立っていた。{m}と名乗る前に、{a}の膝が震えていた。運命の番だった。')
  };
  var phase0 = scen.phase;
  scen.phase = function (ctx, s, n) {
    phase0(ctx, s, n);
    var om = ctx.om;
    if (!om.mob) return;
    ctx.present().forEach(function (a) {
      var m = om.mob[a.i];
      if (!m || m.state !== 'unmet' || m.at !== s) return;
      m.state = 'met'; m.metAt = s;
      var d = dest(ctx), pull = 20 + d * 40;
      m.pull = pull;
      var t = ctx.pick(d < 0.3 ? MEET.low : d > 0.7 ? MEET.high : MEET.mid).replace(/\{w\}/g, ctx.rng.pick(WHERE));
      t += '{a}からは{sa}の匂いがした。';
      ctx.say({ kind: 'event', cat: 'romance', actors: [a], text: fill(ctx, t, m, a), why: why(ctx, '街の外から来た運命の番（住人ではない）との出会い' + (d < 0.3 ? '：出会っても気づくのに時間がかかる' : d > 0.7 ? '：一目で落ちる' : '')), mag: 30 });
      var p = partnerOf(ctx, a);
      if (p) {
        ctx.mod(a, p, { ten: 3 });
        ctx.say({ kind: 'event', cat: 'romance', actors: [a, p], text: fill(ctx, '{a}には、{b}という恋人がいる。{a}はその夜、{b}からの連絡に返事ができなかった。', m, a, p), why: '街の外から来た運命の番と、今の恋人', mag: 12 });
      }
    });
  };

  /* ======================= かき回す：恋人がいる人 ======================= */
  var ST = {
    appear: L('{a}の職場の前に、{M}が立っていた。「仕事が終わるの、待ってた」――{sm}の匂いに、{a}の足が一瞬止まった。|{a}の家の前に、{m}がいた。偶然を装う気もないらしい。「近くまで来たから」{a}はドアの鍵を握ったまま、しばらく動けなかった。|{m}から連絡が来た。「一度だけ、会って話したい」――{a}は返事を打っては消し、結局スマホを伏せた。|{a}は帰り道で{m}に呼び止められた。「逃げないでよ」{sm}の匂いが、{a}の背中に貼りついて離れなかった。|{m}は{a}の行きつけの店で待っていた。隣の席に座られただけで、{a}はグラスを持つ手の震えを隠せなかった。'),
    heat: L('発情期の夜、{a}は窓の外に{sm}の匂いを感じた。{m}が、匂いに呼ばれて来ていた。{a}は窓を閉め、カーテンを閉め、それでも匂いが消えなかった。|発情期の{a}の部屋のインターホンが鳴った。ドアの向こうから{sm}の匂いがする。{m}だった。{a}はドアに背中を預けたまま、開けなかった。――開けなかったことが、精一杯だった。'),
    rut: L('ラットの最中、{a}は気づけば{m}の泊まるホテルの前にいた。{sm}の匂いが、ここまで{a}を引いてきた。{a}は自分の{sa}の匂いが濃くなっているのに気づき、踵を返した。|ラットが来た{a}の前に、{m}が現れた。「呼ばれた気がして」――{a}は歯を食いしばって、{m}に背を向けた。'),
    notice: L('{b}は気づいていた。{a}の上着に、知らない{sm}の匂いがついている。「……誰？」{a}はすぐに答えられなかった。|「最近、どこ見てるの」{b}の問いに、{a}は「別に」と答えた。{b}はそれ以上訊かなかった。訊かないまま、眠れなかった。|{b}は{a}のスマホに、{m}という名前を見つけた。「この人、誰」――問い詰める声は、自分でも驚くほど震えていた。|{b}は{a}を抱きしめて、動きを止めた。{a}の首筋から、知らない{S}の匂いがした。「……私のこと、まだ見えてる？」'),
    friend: L('――{b}の様子がおかしいのに気づいた{c}は、理由を訊かずに「無理するな」とだけ言った。|――{c}は{b}から事情を聞いて、「運命の番って、本当にあるんだ」と呟いた。{b}は笑えなかった。'),
    go: L('{a}は{b}に言った。「ごめん。{m}のところに行く」――運命の番の匂いは、積み重ねた日々より強かった。|{a}は夜中に荷物をまとめた。{b}は止めなかった。止めても無駄だと、匂いで分かっていた。――{a}は街の外から来た{m}のもとへ走った。|{b}は{a}の目を見て分かった。そこにいるのはもう、自分を見ている{a}ではなかった。{m}の匂いが、{a}の理性を連れていってしまった。'),
    goBond: L('{a}と{b}は番だった。それでも{a}の本能は、街の外から来た{m}の方を向いてしまった。{a}は{b}を置いて去った。――Ωの番は一生に一人。{b}のうなじの噛み跡は、その日から疼き続けている。'),
    drive: L('{m}は番のいるΩだと知っても、{a}につきまとうのをやめなかった。{b}が{a}の前に立ちはだかった。αの威圧がぶつかり、店の看板が揺れた。「二度と近づくな」――{m}は街を去った。|{b}は{a}の首筋に鼻を埋め、知らない{S}の匂いを嗅ぎ取った。次の日、{b}は{m}を探し出し、殴りかかる寸前まで行った。{m}は荷物をまとめ、街を出た。|番のいるΩの体は、運命の番さえ拒む。それでも{m}は{a}の家の前に通い続けた。{b}が三度目に現れたとき、{m}は何も言わずに引き下がり、街からいなくなった。'),
    resist: L('{a}は{m}に会いに行き、はっきり言った。「運命でも、私が選んできたのは{b}だ」{m}はしばらく黙って、それから笑った。「……分かった」――{m}は街を去った。|{a}は{m}からの連絡を全部消した。{b}には何も言わなかったが、{b}は{a}の手がもう震えていないのを見て、少しだけ安心した。{m}は、いつの間にか街からいなくなっていた。|{a}は{b}に打ち明けた。「運命の番に、会った。でも帰る場所は変わらない」{b}は泣きながら笑った。{m}はその夜のうちに街を出た。'),
    tired: L('{m}は待ちくたびれたように街を去った。{a}は最後まで、答えを出さなかった。')
  };
  EV.push({
    id: 'om_mob_stir', cat: 'romance', scope: 'solo', pri: true,
    when: function (ctx, a) { var m = mobOf(ctx, a); return !!m && m.state === 'met' && !!partnerOf(ctx, a) && ctx.stepIndex - m.last >= 2; },
    w: function (ctx, a) { var f = fateV(ctx), d = dest(ctx); return 1.0 + f * 1.2 + d * 0.8 + ((sx(a) === 'o' && a.om.heat > 0) || (sx(a) === 'a' && a.om.rut > 0) ? 0.8 : 0); },
    run: function (ctx, a) {
      var m = mobOf(ctx, a), p = partnerOf(ctx, a), pf = ctx.pair(a, p), d = dest(ctx), rng = ctx.rng;
      m.last = ctx.stepIndex; m.waver++;
      var r = ctx.R(a, p), wasBond = BD.bonded(ctx, a, p), omegaBond = wasBond && sx(a) === 'o';
      var heat = sx(a) === 'o' && a.om.heat > 0, rut = sx(a) === 'a' && a.om.rut > 0;
      var t, wh, w = [p], cat = 'conflict', mag = 20;
      if (m.waver >= 2) {
        /* 揺れた末に、恋人を捨てて運命へ走る（番のΩは番を捨てられない） */
        var go = HK.clamp((d - 0.4) * 0.9 + (m.waver - 1) * 0.08 - (r.aff + r.trust) / 700 + (wasBond ? -0.15 : 0), 0.02, 0.9);
        if (!omegaBond && rng() < go) {
          pf.couple = false; pf.fatedWho = a.i; pf.fatedPending = false;
          ctx.om.fatedSplit[key(a, p)] = true;
          if (wasBond && sx(a) === 'a') BD.abandon(ctx, a, p, 'fated');
          ctx.mod2(a, p, { att: -15, ten: 8 }, { aff: -10, ten: 20, att: -5 });
          ctx.stress(p, 30);
          m.state = 'bond'; m.doneAt = ctx.stepIndex; m.how = 'split'; a.om.mobMate = m;
          cat = 'romance'; mag = 42;
          t = ctx.pick(wasBond ? ST.goBond : ST.go);
          wh = why(ctx, a.name + 'は揺れた末に、恋人（' + p.name + '）を捨てて街の外から来た運命の番（' + m.name + '）へ走った');
          var rt = react(ctx, a, m, w, 'split'); if (rt) t += '　' + rt;
          return { cat: cat, text: fill(ctx, t, m, a, p), why: wh, with: w, mag: mag };
        }
        /* 番のαが追い払う */
        if (omegaBond && rng() < 0.3 + m.waver * 0.15) {
          m.state = 'left'; m.doneAt = ctx.stepIndex; m.how = 'driven';
          ctx.mod2(a, p, { trust: 8, aff: 4 }, { trust: 4, ten: -5 });
          return { cat: 'conflict', text: fill(ctx, ctx.pick(ST.drive), m, a, p), why: why(ctx, '番のΩは番以外を受けつけない。' + p.name + 'が街の外から来た運命の番（' + m.name + '）を追い払った'), with: w, mag: 30 };
        }
        /* 抗って振り切る */
        var hold = HK.clamp((0.5 - d) * 1.0 + (m.waver - 1) * 0.08 + (r.aff + r.trust) / 500 - 0.1 + (a.tr.cp + a.tr.np - 0.9) * 0.2, 0.03, 0.9);
        if (rng() < hold || m.waver >= 6) {
          var tired = m.waver >= 6 && rng() >= hold;
          m.state = 'left'; m.doneAt = ctx.stepIndex; m.how = tired ? 'tired' : 'resist';
          if (!tired) { pf.resisted = true; pf.resistedAt = ctx.stepIndex; ctx.mod2(a, p, { trust: 12, aff: 8 }, { trust: 15, aff: 10, ten: -6 }); }
          return { cat: 'romance', text: fill(ctx, ctx.pick(tired ? ST.tired : ST.resist), m, a, p), why: why(ctx, tired ? '答えを出さないまま、街の外から来た運命の番（' + m.name + '）が去った' : a.name + 'の積み上げた想い（好意 ' + Math.round(r.aff) + '・信頼 ' + Math.round(r.trust) + '）が本能に勝った'), with: w, mag: 34 };
        }
      }
      /* 揺れる：現れて、恋人が気づく */
      t = ctx.pick(heat ? ST.heat : rut ? ST.rut : ST.appear) + ctx.pick(ST.notice);
      ctx.mod2(a, p, { ten: 6, trust: -3 }, { ten: 10, trust: -6, aff: -4 });
      ctx.stress(a, 10); ctx.stress(p, 12);
      m.pull = HK.clamp((m.pull || 30) + 6 + d * 10, 0, 100);
      var fr = ctx.present().filter(function (o) { return o !== a && o !== p && ctx.R(o, p).aff > 25; });
      if (fr.length && rng() < 0.45) { var c = rng.pick(fr); t += ctx.pick(ST.friend); w.push(c); ctx.mod(p, c, { trust: 3 }); return { cat: 'conflict', text: fill(ctx, t, m, a, p, c), why: why(ctx, '街の外から来た運命の番（' + m.name + '）が' + a.name + 'を揺さぶり、恋人の' + p.name + 'が気づいた'), with: w, mag: mag }; }
      return { cat: 'conflict', text: fill(ctx, t, m, a, p), why: why(ctx, '街の外から来た運命の番（' + m.name + '）が' + a.name + 'を揺さぶり、恋人の' + p.name + 'が気づいた' + (heat ? '／発情期の匂いに呼ばれた' : rut ? '／ラット' : '')), with: w, mag: mag };
    }
  });

  /* ======================= かき回す：恋人がいない人 ======================= */
  var CT = {
    court: L('{M}は{a}を食事に誘った。断る理由を探しているうちに、{sm}の匂いが喉の奥まで入ってきた。気づけば{a}は頷いていた。|「運命の番って、信じる？」{m}は{a}にそう訊いて、返事を待たずに手を取った。{a}は振りほどけなかった。|{m}は{a}の職場に、三日続けて顔を出した。同僚が「誰？」と訊くたびに、{a}は答えに詰まった。|{m}は{a}の帰り道に、当たり前のように並んで歩いた。「街の外に、いい場所があるんだ」――{sm}の匂いが、{a}の判断を鈍らせた。|{a}のポストに、{m}からの手紙が入っていた。差出人の名前だけで、{sm}の匂いがした気がした。'),
    harass: L('{m}は人気のない通路で{a}の腕を掴み、首筋に顔を寄せた。{a}は振り払った。「触るな」――運命の番でも、これは違う。{a}の指は怒りで震えていた。|{m}は{a}の匂いが欲しいと言って、拒んでも帰らなかった。{a}はドアチェーンをかけたまま、朝まで眠れなかった。|{m}は{a}の肩を抱き寄せ、耳元で「運命なんだから」と囁いた。{a}はその手を払いのけ、店を出た。吐き気がするほど、匂いだけは甘かった。'),
    bond: L('{a}は{m}の手を取った。「分かった。運命に乗る」――街の外から来た{S}と、{a}は付き合い始めた。|{m}の部屋で、{a}は{sm}の匂いに包まれて眠った。抗う気は、もう残っていなかった。{a}と{m}は恋人になった。|{a}は{m}を街に泊めた。朝、{a}のシャツには{sm}の匂いが染みていた。――{a}は運命の番を、受け入れた。'),
    refuse: L('{a}は{m}に言った。「匂いだけで決める気はない」{m}はもう一度だけ食い下がり、それから引いた。数日後、{m}は街を去った。|{a}は{m}からの連絡に、一度だけ返した。「ごめん。あなたとは、ここまで」――{m}は街を出た。{a}は{sm}の匂いを、しばらく忘れられなかった。'),
    expel: L('{a}は{m}に、二度と来るなと告げた。{m}はしばらく{a}の家の前に立っていたが、やがて街を去った。|{a}は{m}の顔を見るたびに体が強張るようになった。周りに相談して、{m}は街を出ていくことになった。')
  };
  EV.push({
    id: 'om_mob_court', cat: 'romance', scope: 'solo', pri: true,
    when: function (ctx, a) { var m = mobOf(ctx, a); return !!m && m.state === 'met' && !partnerOf(ctx, a) && ctx.stepIndex - m.last >= 2; },
    w: function (ctx, a) { var f = fateV(ctx), d = dest(ctx); return 0.9 + f * 1.0 + d * 0.6 + (a.action.id === 'hunt' || a.goal.id === 'mate' ? 0.3 : 0); },
    run: function (ctx, a) {
      var m = mobOf(ctx, a), d = dest(ctx), rng = ctx.rng, w = [];
      m.last = ctx.stepIndex; m.waver++;
      if (m.waver >= 2) {
        var go = HK.clamp((d - 0.3) * 0.9 + (m.waver - 1) * 0.1 + a.tr.impulse * 0.15 - (m.bad ? 0.45 : 0), 0.03, 0.92);
        if (rng() < go) {
          m.state = 'bond'; m.doneAt = ctx.stepIndex; m.how = 'court'; a.om.mobMate = m;
          var t = ctx.pick(CT.bond), rb = react(ctx, a, m, w, 'bond'); if (rb) t += '　' + rb;
          return { cat: 'romance', text: fill(ctx, t, m, a), why: why(ctx, a.name + 'は運命に呑まれ、街の外から来た運命の番（' + m.name + '）と付き合い始めた'), with: w.length ? w : null, mag: 36 };
        }
        var no = HK.clamp((0.5 - d) * 0.9 + (m.waver - 1) * 0.1 + a.tr.caution * 0.2 + (m.bad ? 0.45 : 0), 0.05, 0.9);
        if (rng() < no || m.waver >= 5) {
          m.state = 'left'; m.doneAt = ctx.stepIndex; m.how = m.bad ? 'expel' : 'refuse';
          ctx.stress(a, m.bad ? -5 : 4);
          return { cat: m.bad ? 'conflict' : 'romance', text: fill(ctx, ctx.pick(m.bad ? CT.expel : CT.refuse), m, a), why: why(ctx, a.name + 'は' + (m.bad ? '不快な相手を' : '運命を') + '振り切った。街の外から来た運命の番（' + m.name + '）は去った'), mag: 28 };
        }
      }
      /* 口説かれる／手を出されて不快 */
      var bad = !m.bad && rng() < 0.1 + a.tr.caution * 0.2 - d * 0.1;
      if (bad) { m.bad = true; ctx.stress(a, 14); m.pull = HK.clamp((m.pull || 30) - 15, 0, 100); return { cat: 'conflict', text: fill(ctx, ctx.pick(CT.harass), m, a), why: why(ctx, '街の外から来た運命の番（' + m.name + '）が' + a.name + 'に手を出した。運命でも、嫌なものは嫌だ'), mag: 22 }; }
      m.pull = HK.clamp((m.pull || 30) + 8 + d * 10, 0, 100);
      ctx.stress(a, 5);
      var t2 = ctx.pick(CT.court), c = crushOn(ctx, a);
      if (c && rng() < 0.5) { t2 += '　' + react1(ctx, c, a, m, 'court'); w.push(c); }
      return { cat: 'romance', text: fill(ctx, t2, m, a, c), why: why(ctx, '街の外から来た運命の番（' + m.name + '）が' + a.name + 'を口説いている'), with: w.length ? w : null, mag: 18 };
    }
  });

  /* a を好きな住人（惹かれが高い順） */
  function crushOn(ctx, a) {
    var best = null, bv = 38;
    ctx.present().forEach(function (o) { if (o !== a && !ctx.pair(o, a).couple && HK.canLove(o, a) && ctx.R(o, a).att > bv) { bv = ctx.R(o, a).att; best = o; } });
    return best;
  }
  var RE = {
    court: L('――{c}はそれを聞いて、その夜{a}に電話をかけた。「好きだ。ずっと前から」声が裏返っていた。|――{c}は{a}と{m}が並んで歩くのを見て、理由もなく苛立った。帰りに買った缶コーヒーを、握りつぶしていた。|――{c}は{a}に「あの人、誰」と訊けなかった。訊いたら、何かが終わる気がした。'),
    bond: L('――{c}は{a}の隣に立つ{m}を遠くから見て、告げないままの想いを鞄の奥にしまった。|――{c}はその夜、{a}に長いメッセージを送り、送ってから全部消した。「おめでとう」とだけ残した。|――{c}は{m}を一目見て、勝てないと思った。匂いの相性には、気持ちでは勝てない。'),
    split: L('――{c}は{b}の部屋に押しかけて、朝まで一緒にいた。何も言わなかった。それでよかった。|――{c}は{a}の背中を見送って、{b}の肩を抱いた。「馬鹿だね、あの人」')
  };
  /* 周りの住人の反応（文字列を返し、with に足す） */
  function react(ctx, a, m, w, kind) {
    var rng = ctx.rng;
    if (kind === 'split') {
      var left = null;
      ctx.present().forEach(function (o) { if (o !== a && ctx.pair(a, o).fatedWho === a.i && ctx.om.fatedSplit[key(a, o)]) left = o; });
      var fr = left ? ctx.present().filter(function (o) { return o !== a && o !== left && ctx.R(o, left).aff > 25; }) : [];
      if (left && fr.length && rng() < 0.6) { var c = rng.pick(fr); w.push(c); ctx.mod2(c, left, { aff: 4, trust: 4 }, { trust: 6, aff: 4 }); return fill(ctx, ctx.pick(RE.split), m, a, left, c); }
      return '';
    }
    var c2 = crushOn(ctx, a);
    if (c2 && rng() < 0.7) { w.push(c2); return react1(ctx, c2, a, m, kind); }
    return '';
  }
  function react1(ctx, c, a, m, kind) {
    var rng = ctx.rng, t = ctx.pick(RE[kind]);
    if (/好きだ/.test(t)) { ctx.mod2(c, a, { att: 6, aff: 3 }, { aff: 4, att: rng() < 0.5 ? 5 : -3 }); ctx.pair(c, a).mobConfess = true; }
    else if (/苛立った|勝てない/.test(t)) { ctx.mod(c, a, { ten: 5, att: 3 }); ctx.stress(c, 8); }
    else { ctx.mod(c, a, { att: -14, aff: 2 }); ctx.stress(c, 10); }
    return fill(ctx, t, m, a, null, c);
  }

  /* ======================= 結ばれたあと ======================= */
  var LF = L('{a}は休みの日を{m}と過ごすようになった。街の住人と会う時間は、少しずつ減っていった。|{a}の部屋に、{sm}の匂いが染みついてきた。{m}は週の半分を、この街で過ごしている。|{a}は{m}と、街の外へ小さな旅行に出た。帰ってきた{a}は、前より少し遠い顔をしていた。');
  EV.push({
    id: 'om_mob_life', cat: 'romance', scope: 'solo',
    when: function (ctx, a) { var m = mobOf(ctx, a); return !!m && m.state === 'bond' && !partnerOf(ctx, a) && ctx.stepIndex - m.last >= 3; },
    w: function () { return 0.5; },
    run: function (ctx, a) {
      var m = mobOf(ctx, a); m.last = ctx.stepIndex;
      ctx.stress(a, -6);
      return { text: fill(ctx, ctx.pick(LF), m, a), why: why(ctx, a.name + 'は街の外から来た運命の番（' + m.name + '）と付き合っている'), mag: 8 };
    }
  });
  var after0 = scen.after;
  scen.after = function (ctx, s, n) {
    var r = after0 ? after0.apply(this, arguments) : undefined;
    var om = ctx.om;
    if (om.mob) ctx.present().forEach(function (a) {
      var m = om.mob[a.i];
      if (!m || m.state !== 'bond') return;
      var p = partnerOf(ctx, a);
      /* 住人と付き合い始めたら、街の外の運命の番は去る */
      if (p) {
        m.state = 'left'; m.how = 'dropped'; m.doneAt = s; a.om.mobMate = null;
        ctx.say({ kind: 'event', cat: 'romance', actors: [a, p], text: fill(ctx, '{a}が{b}と付き合い始めたと知って、{m}は何も言わずに街を去った。運命の匂いより、目の前の人を選んだ{a}を、{m}は責めなかった。', m, a, p), why: why(ctx, a.name + 'は街の外から来た運命の番（' + m.name + '）より、' + p.name + 'を選んだ'), mag: 20 });
        return;
      }
      /* 街の外の運命の番と結ばれた人は、住人との恋愛に乗りにくくなる */
      ctx.present().forEach(function (o) { if (o !== a) ctx.R(a, o).att = Math.min(Math.max(0, ctx.R(a, o).att - 3), 40); });
    });
    return r;
  };

  /* ======================= 結末 ======================= */
  var finish0 = scen.finish;
  scen.finish = function (ctx) {
    finish0(ctx);
    var om = ctx.om, P = ctx.chars, mobs = [];
    if (!om.mob) return;
    P.forEach(function (c) {
      var m = om.mob[c.i];
      if (!m || !c.alive) return;
      mobs.push({ i: c.i, name: m.name, sex: m.sex, state: m.state, how: m.how, at: m.metAt, doneAt: m.doneAt });
      if (m.state === 'bond' && !partnerOf(ctx, c)) {
        c.fate = '運命の番（街の外）と';
        c.fateNote = m.name + '（' + SX[m.sex] + '）と結ばれた。街の外から来た運命の番だった' + (m.how === 'split' ? '。そのために恋人を捨てた' : '') + (c.om.switched ? '。途中で' + SX[c.om.sex] + 'にスイッチした' : '');
        note(ctx, c.name + 'の前に街の外から運命の番（' + m.name + '）が現れ、' + (m.how === 'split' ? '恋人を捨てて' : '') + '運命に呑まれた。');
        if (om.ending && om.ending.others) om.ending.others.forEach(function (x) { if (x.i === c.i) x.text = c.name + 'は街の外から来た運命の番、' + m.name + 'と結ばれた。'; });
      } else if (m.state === 'left') {
        var s = m.how === 'driven' ? '番が街の外から来た運命の番（' + m.name + '）を追い払った' : m.how === 'expel' ? '街の外から来た運命の番（' + m.name + '）に手を出され、追い返した' : m.how === 'dropped' ? '街の外から来た運命の番（' + m.name + '）より、住人を選んだ' : '街の外から来た運命の番（' + m.name + '）を振り切った';
        c.fateNote = (c.fateNote ? c.fateNote + '。' : '') + s;
        if (m.how === 'resist' || m.how === 'driven') note(ctx, c.name + 'は' + s + '。');
      } else if (m.state === 'met') {
        c.fateNote = (c.fateNote ? c.fateNote + '。' : '') + '街の外から来た運命の番（' + m.name + '）とは、まだ答えが出ていない';
      }
    });
    if (ctx.flags.omega) ctx.flags.omega.mobs = mobs;
  };
  OM.MOB = { names: NAMES, of: mobOf };
})();
