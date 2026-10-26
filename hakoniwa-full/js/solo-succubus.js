/* 箱庭シミュレーター: サキュバスの一夜（R18）
   住人がサキュバスになって一晩、街で精を集める。魅力はあるのか、ちゃんと誘惑できるのか、どう誘惑するのか、
   一晩で何ml集められるのかを、住人どうしで比べられる。住人の一人を「先輩サキュバス」にすると、
   その性格に応じたアドバイスをくれる */
(function () {
  'use strict';
  /* 同じ結果の中で、同じ文・台詞を繰り返さない：まだ使っていない文から選び、使い切ったら、いちばん前に使った文から戻す */
  function pkF(S, arr) {
    if (!arr || !arr.length) return window.HK.Story.pick(S, arr);
    var m = S._pkLru = S._pkLru || { n: 0, at: {} }, best = [], bv = Infinity;
    for (var i = 0; i < arr.length; i++) {
      var a = typeof arr[i] === 'string' ? (m.at['$' + arr[i]] || 0) : 0;
      if (a < bv) { bv = a; best = [arr[i]]; } else if (a === bv) best.push(arr[i]);
    }
    var x = best[S.rng.int(best.length)];
    if (typeof x === 'string') m.at['$' + x] = ++m.n;
    return x;
  }
  var HK = window.HK, SB = HK.SUCCUBUS, ST = HK.Story, clamp = HK.clamp;
  function L(s) { return s.split('|'); }

  var scen = {
    id: 'succubus', name: 'サキュバスの一夜', kicker: 'ソロ（比べられる）・R18', solo: true, maxCast: 8, minCast: 1,
    desc: '住人がサキュバスになって一晩、街で精を集める。魅力は足りるか、どう誘惑するか、一晩で何ml集められるか。複数人なら同じ夜を別々に狩って比べられる。住人の一人を先輩サキュバスにすると、性格に応じたアドバイスをくれる。※成人キャラクター向け',
    note: '※登場人物はすべて成人として扱います。',
    unit: '時間', simulate: function (input) { return run(input); },
    castHint: '1人でも複数人でも。複数人なら全員が同じ夜に別々に狩りをして、集めた精の量を比べます。「役割」で「先輩サキュバス」を選んだ住人は狩りに出ず、後輩にアドバイスをします（性格でアドバイスが変わります）。「標的」で「標的（人間）になる」を選んだ住人（または設定「標的」を住人から）は、サキュバスの存在を知らない人間として街にいて、サキュバスの住人に狙われます。',
    env: [
      { id: 'town', label: '狩り場', type: 'select', def: 'random', options: [{ v: 'random', label: 'おまかせ' }, { v: 'downtown', label: '夜の繁華街' }, { v: 'office', label: '残業明けのオフィス街' }, { v: 'onsen', label: '湯けむりの温泉街' }, { v: 'masq', label: '仮面舞踏会' }] },
      { id: 'hours', label: '夜の長さ', min: 3, max: 10, def: 7, lo: '3時間', hi: '10時間', unit: '時間' },
      { id: 'prey', label: '獲物の多さ', min: 0, max: 100, def: 60, lo: '人通りがない', hi: 'よりどりみどり' },
      { id: 'holy', label: '聖なるものの危険', min: 0, max: 100, def: 40, lo: 'ほぼいない', hi: '退魔師だらけ', desc: '神父・僧侶・天使・退魔師に出くわす率' },
      { id: 'ev', label: 'ハプニングの頻度', min: 0, max: 100, def: 55, lo: 'たまに', hi: '毎時間' },
      { id: 'lewd', label: '描写の濃さ', type: 'select', def: 'mid', options: [{ v: 'low', label: 'ぼかす' }, { v: 'mid', label: 'ほどほど' }, { v: 'high', label: '濃いめ' }] }
    ].concat(HK.Ero ? [HK.Ero.OPT] : []),
    stats: [
      { id: 'charm', label: '魅力', desc: '見た目と色香。誘惑の成功率に効く' },
      { id: 'tech', label: '技巧', desc: '誘い方と、ベッドでの腕。大成功と搾れる量に効く' }
    ],
    perFields: [{ id: 'role', label: '役割', auto: 'おまかせ（狩りに出る）', options: [{ id: 'hunt', label: '狩りに出る' }, { id: 'senpai', label: '先輩サキュバス（アドバイス係）' }, { id: 'target', label: '標的（人間）になる' }] }],
    actions: [
      { id: 'pick', label: '獲物を選ぶ', fit: function (t) { return t.a * 0.6 + t.caution * 0.4; } },
      { id: 'many', label: '数を打つ', fit: function (t) { return t.fc * 0.6 + t.impulse * 0.4; } },
      { id: 'magic', label: '魔力に頼る', fit: function (t) { return t.cp * 0.5 + t.cold * 0.5; } }
    ],
    goals: [
      { id: 'most', label: 'いちばん多く集める', fit: function (t) { return t.cp * 0.5 + t.lead * 0.5; } },
      { id: 'safe', label: '無事に帰る', fit: function (t) { return t.caution; } },
      { id: 'fun', label: '楽しむ', fit: function (t) { return t.fc; } }
    ],
    events: []
  };
  HK.SCENARIOS.succubus = scen;
  HK.SCEN_ORDER.push('succubus');

  function resolve(S, p, list, pick) {
    if (pick && pick !== 'auto') for (var i = 0; i < list.length; i++) if (list[i].id === pick) return list[i];
    return HK.weighted(S.rng, list, function (o) { return Math.pow(Math.max(0.02, o.fit(p.tr)), 3); });
  }
  /* 魅力診断の「誘惑の型は…」：同じ型の人が続いたら、言い方を変えて説明を繰り返さない */
  function styleLine(S, p) {
    var said = S._styleSaid = S._styleSaid || {}, lb = p.style.label, prev = said[lb];
    said[lb] = said[lb] || p.name;
    if (prev) return ST.fmt(pkF(S, ['{a}の型も、{b}と同じ「{l}」だった。', '診断の結果は、{b}と同じ「{l}」。', '{a}も「{l}」――{b}とは、似た者どうしらしい。']), { a: p.name, b: prev, l: lb });
    return ST.fmt(pkF(S, ['誘惑の型は「{l}」（{d}）。', '診断で出た誘惑の型は「{l}」――{d}のが得意らしい。', '{a}の誘惑の型は「{l}」。{d}やり方が、いちばん性に合っている。']), { a: p.name, l: lb, d: p.style.desc });
  }
  function names(l) { return l.map(function (p) { return p.name; }).join('・'); }
  var GOOD = { S: 1, A: 1, B: 1 };
  /* 描写の作風「男性向け」（ero-kit.js・solo-succubus-ero.js）：選んだときだけ差し替える */
  /* 描写の濃さが「ぼかす」なら、作風の指定より優先して小説調のまま */
  function EO(S) { return !!(HK.Ero && HK.Ero.on(S) && S.env.lewd !== 'low'); }
  function EL(S, key, base) { return EO(S) ? HK.Ero.L(S, 'succubus', key, base) : base; }
  var VO = SB && SB.VOICE;
  function senV(S, sen, k) { var sv = VO && sen && VO.SEN[sen.persona]; return sv && sv[k] && S.rng() < 0.8 ? sv[k] : null; }
  /* サキュバス自身の昂りの段階（0 余裕／1 火照りはじめ／2 限界が近い）。昂りの値から決め、上がった段階は下げない。
     下げるのは、時間がたって昂りがはっきり引いたとき（一段ずつ、ひと息つく一文を出す）と、感じすぎて果てたときだけ。
     上がった回は、変わり目の一文を狩りの終わりに足す。厚い山場の締めの一文も、この段階に合わせる */
  var HEAT_UP = {
    1: L('吸った精が肌の下で温かく巡るたび、{a}自身の体まで火照りはじめていた。尻尾の先が、落ち着きなく揺れている。|{a}は唇を舐めた。獲物を酔わせているつもりが、自分の下腹まで甘く疼きはじめている。|狩りを重ねるうちに、{a}の淫紋は淡く灯ったまま消えなくなっていた。余裕の笑みの奥で、息が少しだけ浅い。|{a}の羽が、熱を逃がすように小さく震えた。吸うたびに満たされるはずが、体のほうはもっと欲しがりはじめていた。'),
    2: L('{a}の淫紋は、もう疼きっぱなしだった。次に誰かと肌を重ねたら、吸うより先に自分が溶けてしまうかもしれない。|{a}は壁に背を預けて、熱い息を逃がした。脚の間がじんじんと疼いて、獲物を選ぶ目まで潤んでいる。|尻尾の先まで火照りきって、{a}はうまく羽をたためなくなっていた。サキュバスのくせに、自分のほうが限界に近い。|{a}の余裕の笑みは、とうに崩れていた。夜風に当たっても、体の芯の熱が引かない。')
  };
  var HEAT_COOL = L('夜風に当たって、{a}の火照りはようやく少し引いた。尻尾の揺れが、いつもの速さに戻っていく。|{a}は屋根の上でひと息ついた。淫紋の疼きが、静かに薄れていった。|冷たい水で頬を冷やすと、{a}の頭はようやく澄んできた。次の獲物を選ぶ目に、余裕が戻っていた。|{a}はしばらく羽を休めた。体の芯に残っていた熱が、少しずつ夜気に溶けていった。');
  var HEAT_AFTER = [
    L('{a}の肌に、{ml}ml分の精がゆっくりと溶けていった。|{a}は舌なめずりをして、満ちていく魔力を味わった。――{ml}ml。|{a}の淫紋が、{ml}ml分の精を吸って淡く光った。|{a}は満足げに羽を広げた。{ml}ml――まだまだ、夜はこれからだ。'),
    L('{a}の肌に、{ml}ml分の精がゆっくりと溶けていった。吸うたびに、自分の体まで熱くなっていくのが分かる。|{a}は舌なめずりをしたが、その頬は自分でも分かるほど上気していた。――{ml}ml。|{a}の淫紋が{ml}ml分の精を吸って光り、そのまま疼くように脈打ちつづけた。'),
    L('{ml}ml。満たされたはずなのに、{a}の下腹は疼いたまま、まるで熱が引かなかった。|{a}は獲物の上から降りると、自分の膝が震えているのに気づいた。――{ml}ml。吸ったのか、吸われたのか、もう分からない。|{a}の淫紋は{ml}ml分の精を呑み込んでも、まだ足りないと言うように明滅していた。息が、ひどく甘い。')
  ];
  function rawHeat(p) { return p.m.plea < 40 ? 0 : p.m.plea < 75 ? 1 : 2; }
  function heatTr(p, ev) { if (HK._rxT) HK._rxT.push({ sc: 'succubus', k: 'heat', who: p.name, raw: rawHeat(p), st: p.hs || 0, ev: ev || '' }); }
  /* 狩りのあと：上がったら変わり目の一文 */
  function heatUp(S, p) {
    var raw = rawHeat(p), old = p.hs || 0, t = '';
    if (raw > old) { p.hs = raw; t = ST.fmt(pkF(S, HEAT_UP[raw]), { a: p.name }); }
    heatTr(p);
    return t;
  }
  /* 一時間ごと：昂りがはっきり引いたら一段下げる */
  function heatCool(S, p) {
    var old = p.hs || 0;
    if (old && p.m.plea < (old === 2 ? 55 : 20)) { p.hs = old - 1; heatTr(p, 'cool'); return ST.fmt(pkF(S, HEAT_COOL), { a: p.name }); }
    heatTr(p, 'hour');
    return '';
  }
  function grade(ml) { return ml >= 180 ? 'S' : ml >= 120 ? 'A' : ml >= 70 ? 'B' : ml >= 35 ? 'C' : 'D'; }

  function run(input) {
    /* 役割「標的（人間）になる」は、標的の判定（solo-succubus-target.js・HK.Roles）が読む pick.target に移す。
       「狩りに出る」を自分で選んだ人は、標的に選ばれない。以前の保存の pick.target もそのまま効く */
    (input.perChar || []).forEach(function (pc, i) {
      var k = pc && pc.pick; if (!k) return;
      if (k.role === 'target') input.perChar[i] = Object.assign({}, pc, { pick: Object.assign({}, k, { role: 'hunt', target: 'yes' }) });
      else if (k.role === 'hunt' && !k.target) input.perChar[i] = Object.assign({}, pc, { pick: Object.assign({}, k, { target: 'no' }) });
    });
    var S = ST.state(input, 'succubus'), rng = S.rng, env = S.env, P = S.P;
    var tk = env.town === 'random' || !SB.TOWNS[env.town] ? rng.pick(Object.keys(SB.TOWNS)) : env.town, T = SB.TOWNS[tk];
    P.forEach(function (p) {
      var pc = (input.perChar && input.perChar[p.i]) || {};
      p.role = (pc.pick || {}).role === 'senpai' ? 'senpai' : 'hunt';
      p.action = resolve(S, p, scen.actions, pc.action); p.goal = resolve(S, p, scen.goals, pc.goal);
      p.style = SB.typeOf ? SB.typeOf(p) : SB.STYLE[p.top];
    });
    /* 標的（人間の側）の住人（solo-succubus-target.js）。設定「標的」がおまかせ（モブ）なら、いままでどおり街の獲物だけ */
    var TG = S.TG = SB.targetsOf ? SB.targetsOf(S, input) : [];
    if (!P.some(function (p) { return p.role === 'hunt'; })) (P.filter(function (p) { return p.role !== 'target'; })[0] || P[0]).role = 'hunt';
    var H = P.filter(function (p) { return p.role === 'hunt'; }), sen = P.filter(function (p) { return p.role === 'senpai'; })[0] || null;
    var SE = sen ? SB.SENPAI[sen.top] : null;
    P.forEach(function (p) {
      p.roleLabel = p.role === 'senpai' ? '先輩サキュバス（' + SE.label + '）' : p.role === 'target' ? '標的（人間）' : 'サキュバス・' + p.style.label;
      p.m = { ml: 0, mana: 100, plea: 0, mood: 60 };
      p.cnt = { tries: 0, win: 0, big: 0, half: 0, fail: 0, melt: 0, streak: 0, shame: 0, magic: 0, reverse: 0, holy: 0 };
      p.best = null; p.out = false;
    });
    if (TG.length) SB.targetSetup(S, T, TG);
    var keys = ['ml', 'mana', 'plea', 'mood'];

    /* ---------- 日没 ---------- */
    ST.step(S, '日没');
    ST.say(S, { kind: 'phase', text: '今夜の狩り場は「' + T.name + '」。' + (H.length > 1 ? names(H) + 'は、同じ夜にそれぞれ獲物を探しに出る。' : H[0].name + 'は、初めての夜を迎える。') });
    H.forEach(function (p) {
      var charm = p.stats.charm, tech = p.stats.tech;
      var power = Math.round(charm * 12 + tech * 7 + p.tr.warmth * 10 + p.tr.fc * 6);
      var ck = charm >= 4 && tech <= 2 ? 'sexy' : charm <= 2 && tech >= 4 ? 'skill' : charm >= 4 && tech >= 4 ? 'ace' : charm <= 2 && tech <= 2 ? 'bad' : 'avg';
      var comment = pkF(S, (SB.COMMENT && SB.COMMENT[ck]) || [{ sexy: '見た目の色香は十分。ただ、誘い方はまだぎこちない', skill: '派手さはないが、近づけば落とせる腕がある', ace: '色香も腕も揃った、天性のサキュバス', bad: '正直、サキュバスに向いているかは怪しい', avg: '平均的なサキュバス。勝負は獲物の選び方しだい' }[ck]]);
      p.power = power;
      var o = ST.say(S, { actors: [p], tag: '魅力診断', text: (SB.TRANSFORM ? ST.fmt(pkF(S, SB.TRANSFORM), { a: p.name }) : p.name + 'の背中に小さな羽が、腰に細い尻尾が生えた。') + styleLine(S, p) + '魅力' + charm + '・技巧' + tech + '――' + comment + '。', why: '誘惑の型は' + p.name + 'の' + (p.style.why || p.topWhy) + 'から／誘惑力 ' + power, mag: 10 });
      ST.key(S, o, p.name + 'の誘惑の型');
    });
    if (sen) {
      ST.say(S, { actors: [sen], tag: '先輩', text: sen.name + 'は先輩サキュバスとして、今夜は後輩たちの面倒を見ることになった。' + ST.fmt(pkF(S, senV(S, sen, 'start') || SE.start), { a: H.length > 1 ? 'みんな' : H[0].name }).replace('みんなちゃん', 'みんな'), why: '先輩の性格：' + SE.label + '（' + sen.topWhy + '）／' + SE.eff });
      H.forEach(function (p) {
        var weak = Object.keys(SB.PREY).filter(function (k) { return SB.PREY[k].weak === p.top && T.prey[k]; }).map(function (k) { return SB.PREY[k].name; });
        ST.say(S, { actors: [sen, p], tag: 'アドバイス', text: sen.name + 'は' + p.name + 'に耳打ちした。' + ST.fmt(pkF(S, senV(S, sen, 'tip') || SE.tip), { a: p.name, style: p.style.label, weak: weak.length ? weak.slice(0, 2).join('や') : 'あなたに合う獲物' }), why: SE.label + 'のアドバイス' });
        if (sen.top === 'A') p.intel = true;
      });
    }
    if (TG.length) SB.targetDusk(S, T, TG, H);
    ST.snap(S, keys);

    /* ---------- 夜 ---------- */
    for (var h = 0; h < env.hours; h++) {
      ST.step(S, ((22 + h) % 24) + ':00');
      S.step = h;
      ST.budget(S, 1);
      var last = h === env.hours - 1;
      if (H.length > 1 && rng() < 0.18) meet(S, T, H);
      H.forEach(function (p) {
        if (p.out) return;
        if (p.skip) { p.skip = false; return; }
        /* インキュバス派との獲物の取り合い・吸い合い勝負（solo-succubus-rival.js。設定「インキュバス派」） */
        if (SB.rivalTurn && SB.rivalTurn(S, T, p, H, sen, h, last)) return;
        /* 住人の標的（人間）に近づく（solo-succubus-target.js。設定「標的」が住人から） */
        if (TG.length && SB.targetTurn(S, T, p, TG, sen, h, last)) return;
        if (rng() < env.ev / 100 * 0.45 || (last && rng() < 0.4)) { if (happen(S, T, p, sen, SE, last)) return; }
        if (rng() > 0.35 + env.prey / 100 * 0.65) return ST.sayB(S, { actors: [p], text: ST.fmt(pkF(S, (SB.NOPREY || L('{a}は{spot}で一時間粘ったが、めぼしい獲物は通らなかった。|{a}は{spot}の屋根の上から街を見下ろした。今夜は人通りが少ない。|{a}は{spot}をうろついたが、目が合う人がいなかった。'))), { a: p.name, spot: rng.pick(T.spots) }), why: '獲物の少なさ（' + env.prey + '）' }, p.name + 'は空振り');
        hunt(S, T, p, sen, SE);
      });
      ST.flushShort(S, 'ほかの狩り：');
      /* 精が尽きかけた住人に、仲間・先輩・ライバルが精を分け与える（solo-succubus-rival.js） */
      if (SB.rivalGive) SB.rivalGive(S, T, H, sen, h);
      P.forEach(function (p) {
        if (p.role === 'target') { p.m.plea = clamp(p.m.plea - 15, 0, 100); return; }
        p.m.mana = clamp(p.m.mana + 3, 0, 100); p.m.plea = clamp(p.m.plea - 10, 0, 100);
        if (p.role !== 'hunt' || p.out) return;
        var cl = heatCool(S, p);
        if (cl) ST.sayB(S, { actors: [p], tag: 'ひと息', text: cl, why: '時間がたって昂りが引いた（昂り ' + Math.round(p.m.plea) + '）' }, p.name + 'の火照りが引いた');
      });
      ST.snap(S, keys);
    }
    return finish(S, input, T, H, sen, SE);
  }

  /* ---------- 一回の狩り ---------- */
  function hunt(S, T, p, sen, SE) {
    var rng = S.rng, env = S.env;
    /* 恋愛対象（likes）が女性なら女性の獲物、両方なら3回に1回。女性の獲物は SB.PREY_F（狩り場ごとの顔ぶれ） */
    if (SB.PREY_F && (p.likes === 'f' || (p.likes === 'both' && rng() < 0.35))) return huntF(S, T, p, sen, SE);
    var key = HK.weighted(rng, Object.keys(T.prey), function (k) {
      var q = SB.PREY[k], w = T.prey[k];
      if (q.holy) w *= 0.3 + env.holy / 60 * (sen && sen.top === 'AC' ? 0.4 : 1);
      if ((p.action.id === 'pick' || p.intel) && q.weak === p.top) w *= 2.4;
      if (p.goal.id === 'safe' && q.holy) w *= 0.4;
      w /= 1 + ((p.seen || {})[k] || 0) * 0.8;
      return w;
    });
    p.seen = p.seen || {}; p.seen[key] = (p.seen[key] || 0) + 1;
    /* {you}：獲物への呼びかけ（mob.js の HK.Mob.addr。呼び名だけの獲物なので、台詞では話し手の二人称） */
    var q = SB.PREY[key], spot = rng.pick(T.spots), v = { a: p.name, t: q.name, spot: spot, s: sen ? sen.name : '', you: HK.Mob ? HK.Mob.addr(q.name) : 'あなた' };
    p.cnt.tries++;
    var match = q.weak === p.top;
    var ty = p.style || {};
    var score = (ty.score || 0) + p.stats.charm * 10 + p.stats.tech * 6 + (match ? 22 * (sen && sen.top === 'A' ? 1.5 : 1) : 0) + p.tr.warmth * 8 + rng() * 38 - q.resist - 20 + (p.m.mood - 60) / 4;
    var why = q.name + '（抵抗 ' + q.resist + '・' + SB.STYLE[q.weak].label + 'に弱い）に、' + p.style.label + 'で挑んだ' + (match ? '：相性ぴったり' : '');
    /* 魔力に頼る */
    if (p.m.mana >= 20 && (p.action.id === 'magic' ? rng() < 0.6 : rng() < 0.15 + (score < 0 ? 0.2 : 0))) { p.m.mana -= 18; score += 16; p.cnt.magic++; why += '／魅了の魔眼を使った'; }
    if (sen) {
      if (sen.top === 'CP') score += 6;
      if (sen.top === 'NP' && p.cnt.streak >= 1) score += 12;
      if (sen.top === 'FC') score += (rng() - 0.45) * 30;
      if (sen.top === 'AC') score -= 4;
    }
    if (p.m.mana < 15) { score -= 10; why += '／魔力切れで変身が不安定'; }
    /* 狩りの入り方（尾行・バー・逆ナン・雨宿り・夢に忍び込む・再会…） */
    var flw = SB.FLOW ? HK.weighted(rng, SB.FLOW, function (f) { return f.w / (1 + (S.flags['sf_' + f.id] || 0) * (f.id === 'eye' ? 0.3 : 1.5)); }) : null;
    if (flw) { S.flags['sf_' + flw.id] = (S.flags['sf_' + flw.id] || 0) + 1; score += flw.score || 0; if (flw.id !== 'eye') why += '／入り方：' + { tail: '尾行', bar: 'バーで', reverse: '向こうから', rain: '雨宿り', lost: '迷子のふり', dream: '夢に忍び込む' }[flw.id]; }
    var again = p.seen[key] > 1 && SB.AGAIN && rng() < 0.6;
    if (again) { score += 10; why += '／前に会った相手と再会'; }
    var t = ST.fmt(again ? pkF(S, SB.AGAIN) : flw ? pkF(S, flw.t) : '{spot}で、{a}は{t}に目をつけた。', v) + (flw && flw.id === 'dream' ? '' : ST.fmt(apText(S, p, ty), v)) + (VO && rng() < (ty.ap ? 0.2 : 0.5) ? p.name + ST.fmt(pkF(S, VO.OPEN[p.persona] || VO.OPEN.gentle), v) : '') + (q.re && rng() < 0.65 ? ST.fmt(q.re, v) : '');
    var lew = env.lewd || 'mid', ml = 0, kind, rev = 0, leadP = '';
    /* 聖なる獲物で大失敗すると、祓われかける */
    if (q.hunter && score < 10) {
      p.cnt.holy++; p.m.mana -= 35; p.m.mood -= 20;
      t += ST.fmt('――{t}の懐から、銀の十字架が光った。「やはり淫魔か」{a}は羽を焦がしながら、夜空へ逃げた。', v);
      if (p.m.mana <= 0 || rng() < 0.25) { p.out = true; p.outWhy = '退魔師に祓われかけて撤退'; t += ST.fmt('{a}は今夜の狩りを諦めて、巣へ逃げ帰った。', v); }
      return ST.key(S, ST.say(S, { actors: [p], tag: '退魔師', text: t, why: why + '／正体を見破られた', mag: 40 }), p.name + 'が退魔師に見破られた');
    }
    if (q.angel && score < 20) {
      p.cnt.holy++; p.m.mana -= 30;
      t += ST.fmt('――{t}の背中に、白い光の輪が浮かんだ。「迷える子よ、お帰りなさい」{a}は浄化されかけて、半泣きで逃げ出した。', v);
      return ST.say(S, { actors: [p], tag: '天使', text: t, why: why + '／相手は天使だった', mag: 35 });
    }
    /* 受け攻め：サキュバスが攻めの指定なら、抱く側の文を使う */
    var sTop = HK.Pos && (HK.Pos.vsNpc(p, '') === 'top' || (HK.Pos.of(p) === 'riba' && rng() < 0.5));
    /* 自分で「攻め」を選んだサキュバスは、獲物に主導権を取られたり、逆に搾られたりしない */
    var hTop = !!(HK.Pos && HK.Pos.hardTopNpc(p));
    var noRecv = function (arr) { if (!hTop) return arr; var f = arr.filter(function (x) { return !SB.RECV_RE.test(x); }); return f.length ? f : arr; };
    if (score < -5) {
      kind = 'fail'; p.cnt.fail++; p.cnt.streak++; p.m.mood -= 10; p.cnt.shame++;
      t += ST.fmt(pkF(S, ty.fail && rng() < 0.6 ? ty.fail : SB.FAIL[p.top]), v) + (VO && rng() < 0.5 ? p.name + pkF(S, VO.FAIL[p.persona] || VO.FAIL.gentle) : '');
    } else if (score < 15) {
      kind = 'half'; p.cnt.half++; p.cnt.streak++; ml = Math.round(2 + rng() * 6);
      t += ST.fmt(pkF(S, EL(S, 'half', SB.HALF)), v);
    } else if (SB.MELT && rng() < Math.max(0, 0.05 + p.m.plea / 100 * 0.32 + Math.max(0, 3 - p.stats.tech) * 0.05 + (q.stamina ? 0.1 : 0) + (q.incubus ? 0.08 : 0) + (p.top === 'AC' ? 0.05 : 0) + (ty.melt || 0) - (score >= 45 ? 0.06 : 0))) {
      /* 感じすぎて仕事にならない */
      kind = 'melt'; p.cnt.melt++; p.cnt.streak++; p.cnt.shame++; p.m.mood -= 12;
      ml = Math.round(q.vit * (0.1 + rng() * 0.2));
      why += '／感じすぎた（昂り ' + Math.round(p.m.plea) + '・技巧 ' + p.stats.tech + '）';
      if (lew === 'low') t += ST.fmt(pkF(S, noRecv(SB.MELT_LOW)), v);
      else {
        t += '――' + ST.fmt(pkF(S, sTop && EO(S) && HK.Pos.isF(p) ? EL(S, 'melt.topf', SB.MELT_TOP) : hTop && SB.MELT_HARD ? EL(S, 'melt.hard', SB.MELT_HARD) : sTop && SB.MELT_TOP ? EL(S, 'melt.top', SB.MELT_TOP) : EL(S, 'melt', SB.MELT)), v);
        /* 果てる声は喘ぎの辞書（moan-engine.js の HK.Moan.say。小説調なら♡なし）から。上に乗っているときは攻めの声。元の表（Voice.CLIMAX）も残る */
        if (HK.Voice.CLIMAX[p.persona] && rng() < (EO(S) ? 0.3 : 0.6)) t += p.name + '「' + (HK.Moan && HK.Moan.say ? HK.Moan.say(S, p, sTop ? 'top' : 'climax', { novel: !EO(S), top: q }, noRecv(HK.Voice.CLIMAX[p.persona])) : pkF(S, noRecv(HK.Voice.CLIMAX[p.persona]))) + '」';
        else if (SB.VOICE.MELT[p.persona]) t += p.name + pkF(S, noRecv(EL(S, 'voice.melt.' + p.persona, SB.VOICE.MELT[p.persona])));
      }
      t += ST.fmt(pkF(S, noRecv(EL(S, 'melt.after', SB.MELT_AFTER))), v) + (ml ? '（吸えたのは' + ml + 'mlだけ）' : '');
      if (sTop && HK.FM && HK.Pos.isF(p)) t = HK.FM.fixWith({ pick: function (a) { return pkF(S, a); } }, t, p, q.name);
      p.m.plea = 35; p.hs = 0; heatTr(p, 'melt');
      if (rng() < 0.4) { p.skip = true; why += '／腰が抜けて次の一時間は休み'; }
    } else {
      kind = score >= 45 ? 'big' : 'win';
      p.cnt.win++; p.cnt.streak = 0; p.m.mood += 8;
      if (kind === 'big') p.cnt.big++;
      ml = Math.round(q.vit * (kind === 'big' ? 0.9 + rng() * 0.6 : 0.5 + rng() * 0.4) * (1 + p.stats.tech * 0.05) * (ty.ml || 1));
      if (lew === 'low') t += ST.fmt('――二人は{spot}の奥へ消えた。何があったのかは、{a}の満ち足りた顔だけが知っている。', v);
      else if (ty.tk) { leadP = ST.fmt(SB.say(S, pkF(S, takeList(S, p, ty, sTop)), ty.id + '_tk', p), v); t += '――' + leadP; }
      else { t += '――' + ST.fmt(pkF(S, sTop && SB.TAKE_TOP ? SB.TAKE_TOP[p.top] : SB.TAKE[p.top]), v); }
      if (q.stamina && hTop && SB.REVERSE_HARD && rng() < 0.5 - p.stats.tech * 0.06 + (ty.rev || 0)) { p.m.plea = 100; p.skip = true; rev = 1; ml = Math.round(ml * 1.4); t += ST.fmt(pkF(S, EO(S) && HK.Pos.isF(p) ? EL(S, 'reverse.topf', SB.REVERSE_HARD) : EL(S, 'reverse.hard', SB.REVERSE_HARD)), v); why += '／底なしの体力の相手に、朝まで主導権を渡さなかった'; }
      else if (q.stamina && !hTop && rng() < 0.5 - p.stats.tech * 0.06 + (ty.rev || 0)) { p.cnt.reverse++; p.m.plea = 100; p.skip = true; rev = 1; ml = Math.round(ml * 1.4); t += ST.fmt(pkF(S, sTop && SB.REVERSE_TOP ? (EO(S) && HK.Pos.isF(p) ? EL(S, 'reverse.topf', SB.REVERSE_TOP) : EL(S, 'reverse.top', SB.REVERSE_TOP)) : EL(S, 'reverse', SB.REVERSE)), v); why += '／相手の底なしの体力に逆に搾られた'; }
      else if (q.incubus && hTop) { ml = Math.round(ml * 0.6); t += ST.fmt('――ところが{t}も、{a}から吸い返そうとしてきた。{a}は{t}の手首を押さえつけ、一滴も吸い返させなかった。ただ、同業者の精は薄かった。', v); }
      else if (q.incubus) { ml = Math.round(ml * 0.6); t += ST.fmt('――ところが{t}も、{a}から吸い返そうとしてきた。同業者どうしの吸い合いは、引き分けに終わった。', v); }
      /* 小説調の山場（solo-thick4.js）：主導権を握ったまま搾りきった回は、段落に分けて厚く。サキュバスが攻めなら貫いて、そうでなければ跨って。型ごとの決め台詞の文は絶頂の段落に置く */
      if (leadP && !rev && !q.incubus && HK.Thick4 && HK.Thick4.ok(S, lew)) {
        var prey = { name: q.name, gender: 'm', mob: true };
        t = t.replace('――' + leadP, '――' + HK.Thick4.scene(S, { dom: p, sub: prey, kind: sTop ? 'in' : 'ride', peak: (sTop && HK.FM && HK.Pos.isF(p) ? HK.FM.fixWith({ pick: function (a) { return pkF(S, a); } }, leadP, p, prey.name) : leadP).replace(/([。」])「/g, '$1' + p.name + '「'), sad: HK.Thick4.rollSad(S, p, prey),
          after: ST.fmt(pkF(S, HEAT_AFTER[p.hs || 0]), { a: p.name, ml: ml }) }));
      }
      else t += ST.fmt(pkF(S, EL(S, 'climax', SB.CLIMAX).concat(!sTop && EO(S) ? EL(S, 'climax.in', []) : [])), { a: p.name, t: q.name, ml: ml });
      /* 女性のサキュバスが攻めのときは、女性上位（跨って搾る）の書き方にそろえる */
      if (sTop && HK.FM && HK.Pos.isF(p)) t = HK.FM.fixWith({ pick: function (a) { return pkF(S, a); } }, t, p, q.name);
      if (kind === 'big') t += ST.fmt(pkF(S, EL(S, 'big', SB.BIG)), v);
      if (VO && rng() < 0.45) t += p.name + pkF(S, VO.WIN[p.persona] || VO.WIN.gentle);
      p.m.plea = clamp(p.m.plea + 30 + (p.top === 'FC' ? 20 : 0), 0, 100);
    }
    /* 主導権を握って搾った回は、拒む喘ぎを使わない（感じすぎた・逆に搾られた回はそのまま） */
    if (HK.Ero) t = HK.Ero.fill(S, t, kind === 'win' || kind === 'big' ? (rev ? p : Object.assign({}, p, { eroDom: true })) : p);
    p.m.ml += ml;
    if (ml && (!p.best || ml > p.best.ml)) p.best = { name: q.name, ml: ml };
    if (kind !== 'melt') { var hu = heatUp(S, p); if (hu) { t += hu; why += '／昂りが一段上がった（昂り ' + Math.round(p.m.plea) + '）'; } }
    var tag = { fail: '失敗', half: 'あと一歩', win: '成功', big: '大成功', melt: '感じすぎ' }[kind];
    var o = ST.sayB(S, { actors: [p], tag: tag, lewd: kind === 'half' && ml > 0 ? true : undefined, text: t, why: why + '（誘惑の出来 ' + Math.round(score) + '）', mag: kind === 'big' ? 40 : kind === 'win' ? 26 : 12, kind: kind === 'big' || kind === 'win' || kind === 'melt' ? 'climax' : 'event' }, p.name + '×' + q.name + '＝' + tag + (ml ? ' ' + ml + 'ml' : ''), kind === 'big' || (p.cnt.win === 1 && kind === 'win') || (kind === 'melt' && p.cnt.melt === 1));
    if (o && kind === 'melt' && p.cnt.melt === 1) ST.key(S, o, p.name + 'は感じすぎて吸えなかった');
    if (o && kind === 'big') ST.key(S, o, p.name + 'の大成功');
    if (o && p.cnt.win === 1 && kind === 'win') ST.key(S, o, p.name + 'の初めての獲物');
    /* 先輩から */
    if (sen && (kind === 'fail' || kind === 'melt') && p.cnt.streak >= 2) {
      var e = ST.say(S, { actors: [sen, p], tag: '先輩から', text: (function () { var sv = senV(S, sen, 'fail'); return sv ? ST.fmt('{s}は{a}にメッセージを送った。' + pkF(S, sv), { a: p.name, s: sen.name }) : ST.fmt(pkF(S, SE.fail), { a: p.name, s: sen.name }); })(), why: SE.label + '（' + SE.eff + '）' });
      if (sen.top === 'NP') p.m.mood += 15;
      if (sen.top === 'CP') p.m.mood -= 5;
      if (sen.top === 'FC' && S.rng() < 0.5) {
        /* 二人がかりで一人を落とすのは、恋愛・R18にしない組（HK.ngPair）では起きない（先輩が一人で見本を見せる） */
        var gain = Math.round(15 + S.rng() * 30), steal = S.rng() < 0.4 || !!(HK.ngPair && HK.ngPair(sen, p));
        if (!steal) p.m.ml += gain;
        ST.say(S, { actors: [sen, p], tag: '先輩乱入', text: steal ? sen.name + 'は「見本見せたげる！」と言って、' + p.name + 'の目の前で通りすがりの男を落とし、自分だけ満腹になって帰っていった。' : sen.name + 'が現れて' + p.name + 'の手を引き、二人がかりで一人の男を骨抜きにした。' + p.name + 'の取り分は' + gain + 'ml。', why: '感覚派の先輩は、何をするか分からない' });
      }
      p.cnt.streak = 0;
    }
  }

  /* ---------- ハプニング（戻り値 true でその時間の狩りはなし） ---------- */
  function happen(S, T, p, sen, SE, last) {
    var rng = S.rng, env = S.env;
    var list = SB.EVENTS.filter(function (e) { return (e.id !== 'gift' || sen) && (e.id !== 'dawn' || last) && (e.id !== 'full' || p.m.ml >= 80) && (e.id !== 'fan' || p.cnt.win >= 1) && !(e.id === 'holy' && rng() > env.holy / 60); });
    var e = HK.weighted(rng, list, function (x) { return 1 / (1 + (p.cnt['ev_' + x.id] || 0) * 3) * (x.id === 'dawn' ? 4 : 1); });
    if (!e) return false;
    p.cnt['ev_' + e.id] = (p.cnt['ev_' + e.id] || 0) + 1;
    /* 男性向けのハプニングは、自分で「攻め」を選んだサキュバスには使わない（跨る・咥える書き方があるため） */
    var et = HK.Pos && HK.Pos.hardTopNpc(p) ? e.t : EL(S, 'ev.' + e.id, e.t);
    var fx = e.fx, t = ST.fmt(pkF(S, et), { a: p.name, s: sen ? sen.name : '' }), why = '';
    if (HK.Ero) t = HK.Ero.fill(S, t, p);
    if (sen && sen.top === 'AC' && (e.id === 'holy' || e.id === 'police') && rng() < 0.5) { t = sen.name + 'の「教会には近づかないで」を思い出して、' + p.name + 'は道を変えた。危ないところだった。'; fx = {}; why = '心配性の先輩の忠告が効いた'; }
    if (fx.mana) p.m.mana = clamp(p.m.mana + fx.mana, 0, 100);
    if (fx.charm) p.m.mood += fx.charm;
    if (fx.ml) { p.m.ml += fx.ml; if (!p.best || fx.ml > p.best.ml) p.best = { name: e.id === 'couple' ? 'カップル' : e.id === 'fan' ? '以前の獲物' : '先輩の差し入れ', ml: fx.ml }; }
    if (fx.shame) p.cnt.shame++;
    if (fx.plea) p.m.plea = clamp(p.m.plea + fx.plea, 0, 100);
    if (fx.love) { p.inLove = true; p.m.mood += 10; }
    var o = ST.say(S, { actors: sen && fx.senpai ? [p, sen] : [p], tag: 'ハプニング', lewd: fx.ml || fx.plea || et !== e.t ? true : undefined, text: t, why: why || (fx.ml ? '+' + fx.ml + 'ml' : fx.mana ? '魔力' + fx.mana : ''), mag: fx.love ? 30 : 12 });
    if (fx.love) ST.key(S, o, p.name + 'の一目惚れ');
    if (fx.bonusPrey) { hunt(S, T, p, sen, SE); return true; }
    return !!(fx.skip || fx.love);
  }

  /* ---------- 型の誘い・搾精の候補 ----------
     型（solo-succubus-types.js）の文に、型の強い因子の旧来の文（SB.STYLE[因子].approach・SB.TAKE・SB.TAKE_TOP）を4割で混ぜる。
     男性のサキュバスが受け入れるときは tkM（後ろで迎える・自分のものも張りつめる）、ふたなりが抱くときは TOP_FUTA を混ぜる。
     男性向けは、女性のサキュバスが攻めなら型ごとの topf.<型>（なければ共通の topf）、男性のサキュバスが受け入れるなら tkm.<型> */
  function apText(S, p, ty) {
    var old = SB.STYLE[p.top] && SB.STYLE[p.top].approach; /* 型の因子＝本人のいちばん強い因子（typeOf）。ty.top は抱く側の文の配列 */
    if (old && old.length && (!ty.ap || S.rng() < 0.4)) return pkF(S, old);
    return ty.ap ? SB.say(S, pkF(S, ty.ap), ty.id + '_ap', p) : pkF(S, p.style.approach);
  }
  function takeList(S, p, ty, sTop) {
    var P0 = HK.Pos, f = P0 && P0.isF(p), male = !P0 || !P0.isFBody(p), futa = P0 && P0.futa(p), k = p.top;
    if (EO(S)) {
      if (sTop && f) return HK.Ero.has('succubus', 'topf.' + ty.id) ? EL(S, 'topf.' + ty.id, ty.top) : EL(S, 'topf', ty.top);
      if (sTop) return EL(S, 'top.' + ty.id, ty.top).concat(futa ? EL(S, 'top.futa', []) : []);
      if (male && HK.Ero.has('succubus', 'tkm.' + ty.id)) return EL(S, 'tkm.' + ty.id, ty.tk);
      return EL(S, 'tk.' + ty.id, ty.tk);
    }
    var base = sTop ? ty.top : ty.tk, old = sTop ? SB.TAKE_TOP && SB.TAKE_TOP[k] : SB.TAKE && SB.TAKE[k];
    if (old && old.length && S.rng() < 0.4) base = old;
    if (sTop && futa && SB.TOP_FUTA && S.rng() < 0.45) base = SB.TOP_FUTA;
    if (!sTop && male && ty.tkM && S.rng() < 0.6) base = ty.tkM;
    return base;
  }

  /* ---------- 女性の獲物（恋愛対象が女性のサキュバス） ----------
     女性のサキュバス×女性の獲物：指・舌・肌で精気を吸う（いちもつの語・挿入の動詞を使わない）。型ごとの ff。
     男性（ふたなり）のサキュバス×女性の獲物：サキュバスが抱く（型の top）。自分で「受け」を選んだ男性なら、獲物が跨る（RIDE_F。女性が導く）。
     底なしの体力・同業者・退魔師の分岐はない */
  function huntF(S, T, p, sen, SE) {
    var rng = S.rng, env = S.env, P0 = HK.Pos;
    var keys = Object.keys(SB.PREY_F).filter(function (k) { return SB.PREY_F[k].towns.indexOf(T.id) >= 0; });
    var key = HK.weighted(rng, keys, function (k) { var q0 = SB.PREY_F[k]; var w = 1; if ((p.action.id === 'pick' || p.intel) && q0.weak === p.top) w *= 2.4; return w / (1 + ((p.seenF || {})[k] || 0) * 0.8); });
    p.seenF = p.seenF || {}; p.seenF[key] = (p.seenF[key] || 0) + 1;
    var q = SB.PREY_F[key], spot = rng.pick(T.spots), v = { a: p.name, t: q.name, spot: spot, s: sen ? sen.name : '', you: HK.Mob ? HK.Mob.addr(q.name) : 'あなた' };
    p.cnt.tries++;
    var ty = p.style || {}, match = q.weak === p.top;
    var score = (ty.score || 0) + p.stats.charm * 10 + p.stats.tech * 6 + (match ? 22 * (sen && sen.top === 'A' ? 1.5 : 1) : 0) + p.tr.warmth * 8 + rng() * 38 - q.resist - 20 + (p.m.mood - 60) / 4;
    var why = q.name + '（抵抗 ' + q.resist + '・' + SB.STYLE[q.weak].label + 'に弱い）に、' + p.style.label + 'で挑んだ' + (match ? '：相性ぴったり' : '') + '／恋愛対象が女性なので、女性の獲物';
    if (p.m.mana >= 20 && (p.action.id === 'magic' ? rng() < 0.6 : rng() < 0.15 + (score < 0 ? 0.2 : 0))) { p.m.mana -= 18; score += 16; p.cnt.magic++; why += '／魅了の魔眼を使った'; }
    if (sen) { if (sen.top === 'CP') score += 6; if (sen.top === 'NP' && p.cnt.streak >= 1) score += 12; if (sen.top === 'FC') score += (rng() - 0.45) * 30; if (sen.top === 'AC') score -= 4; }
    if (p.m.mana < 15) { score -= 10; why += '／魔力切れで変身が不安定'; }
    var t = ST.fmt('{spot}で、{a}は{t}に目をつけた。', v) + ST.fmt(apText(S, p, ty), v) + (VO && rng() < 0.2 ? p.name + ST.fmt(pkF(S, VO.OPEN[p.persona] || VO.OPEN.gentle), v) : '') + (q.re ? ST.fmt(pkF(S, q.re), v) : '');
    var ff = !P0 || P0.isF(p), ride = !ff && P0 && P0.of(p) === 'bottom' && P0.explicit(p);
    var lew = env.lewd || 'mid', ml = 0, kind;
    if (score < -5) {
      kind = 'fail'; p.cnt.fail++; p.cnt.streak++; p.m.mood -= 10; p.cnt.shame++;
      t += ST.fmt(pkF(S, ty.fail && rng() < 0.6 ? ty.fail : SB.FAIL[p.top]), v) + (VO && rng() < 0.5 ? p.name + pkF(S, VO.FAIL[p.persona] || VO.FAIL.gentle) : '');
    } else if (score < 15) {
      kind = 'half'; p.cnt.half++; p.cnt.streak++; ml = Math.round(2 + rng() * 5);
      t += ST.fmt(pkF(S, EL(S, 'half.f', SB.HALF_F)), v);
    } else if (rng() < Math.max(0, 0.05 + p.m.plea / 100 * 0.3 + Math.max(0, 3 - p.stats.tech) * 0.05 + (ty.melt || 0) - (score >= 45 ? 0.06 : 0))) {
      kind = 'melt'; p.cnt.melt++; p.cnt.streak++; p.cnt.shame++; p.m.mood -= 12;
      ml = Math.round(q.vit * (0.1 + rng() * 0.2));
      why += '／感じすぎた（昂り ' + Math.round(p.m.plea) + '・技巧 ' + p.stats.tech + '）';
      t += lew === 'low' ? ST.fmt(pkF(S, SB.MELT_LOW.slice(0, 1).concat(SB.MELT_LOW.slice(2))), v) : '――' + ST.fmt(pkF(S, EL(S, 'melt.f', SB.MELT_F)), v);
      t += ST.fmt(pkF(S, SB.MELT_AFTER.filter(function (x) { return !SB.RECV_RE.test(x); })), v) + (ml ? '（吸えたのは' + ml + 'mlだけ）' : '');
      p.m.plea = 35; p.hs = 0; heatTr(p, 'melt');
      if (rng() < 0.4) { p.skip = true; why += '／腰が抜けて次の一時間は休み'; }
    } else {
      kind = score >= 45 ? 'big' : 'win';
      p.cnt.win++; p.cnt.streak = 0; p.m.mood += 8;
      if (kind === 'big') p.cnt.big++;
      ml = Math.round(q.vit * (kind === 'big' ? 0.9 + rng() * 0.6 : 0.5 + rng() * 0.4) * (1 + p.stats.tech * 0.05) * (ty.ml || 1));
      if (lew === 'low') t += ST.fmt('――二人は{spot}の奥へ消えた。何があったのかは、{a}の満ち足りた顔だけが知っている。', v);
      else {
        var lst = ff ? (EO(S) ? EL(S, 'ff.' + ty.id, EL(S, 'ff.tk', ty.ff || [])) : ty.ff) : ride ? EL(S, 'mf.ride', SB.RIDE_F) : EO(S) ? EL(S, 'mf.top', ty.top) : ty.top;
        t += '――' + ST.fmt(SB.say(S, pkF(S, lst && lst.length ? lst : ty.tk), ty.id + '_tk', p), v);
      }
      t += ST.fmt(pkF(S, EL(S, 'climax.f', SB.CLIMAX_F)), { a: p.name, t: q.name, ml: ml });
      if (kind === 'big') t += ST.fmt(pkF(S, EL(S, 'big.f', SB.BIG_F)), v);
      if (VO && rng() < 0.45) t += p.name + pkF(S, VO.WIN[p.persona] || VO.WIN.gentle);
      p.m.plea = clamp(p.m.plea + 30 + (p.top === 'FC' ? 20 : 0), 0, 100);
    }
    if (HK.Ero) t = HK.Ero.fill(S, t, kind === 'win' || kind === 'big' ? Object.assign({}, p, { eroDom: true }) : p);
    p.m.ml += ml;
    if (ml && (!p.best || ml > p.best.ml)) p.best = { name: q.name, ml: ml };
    if (kind !== 'melt') { var hu = heatUp(S, p); if (hu) { t += hu; why += '／昂りが一段上がった（昂り ' + Math.round(p.m.plea) + '）'; } }
    var tag = { fail: '失敗', half: 'あと一歩', win: '成功', big: '大成功', melt: '感じすぎ' }[kind];
    var o = ST.sayB(S, { actors: [p], tag: tag, lewd: kind === 'half' && ml > 0 ? true : undefined, text: t, why: why + '（誘惑の出来 ' + Math.round(score) + '）', mag: kind === 'big' ? 40 : kind === 'win' ? 26 : 12, kind: kind === 'big' || kind === 'win' || kind === 'melt' ? 'climax' : 'event' }, p.name + '×' + q.name + '＝' + tag + (ml ? ' ' + ml + 'ml' : ''), kind === 'big' || (p.cnt.win === 1 && kind === 'win') || (kind === 'melt' && p.cnt.melt === 1));
    if (o && kind === 'big') ST.key(S, o, p.name + 'の大成功');
    if (o && p.cnt.win === 1 && kind === 'win') ST.key(S, o, p.name + 'の初めての獲物');
  }

  /* ---------- サキュバスどうしが鉢合わせる ---------- */
  function meet(S, T, H) {
    var rng = S.rng, live = H.filter(function (p) { return !p.out; });
    if (live.length < 2) return;
    var a = rng.pick(live), b = rng.pick(live.filter(function (x) { return x !== a; })), spot = rng.pick(T.spots);
    /* 獲物を二人で挟む共闘は、恋愛・R18にしない組（HK.ngPair）では起きない（取り合いになる） */
    /* 共闘の獲物は男性なので、二人とも恋愛対象に男性を含み、モブとの場面に出られる人だけ。二人が一つの獲物を挟むので、二人の組も体の関係が成り立つときだけ（HK.Pos.okSex） */
    function likesM(p) { return !p.likes || p.likes === 'm' || p.likes === 'both'; }
    var team = a.tr.warmth + b.tr.warmth > 1.1 && rng() < 0.6 && !(HK.ngPair && HK.ngPair(a, b)) && likesM(a) && likesM(b) &&
      !(HK.State && !(HK.State.mobSexOk(a) && HK.State.mobSexOk(b))) && !(HK.Pos && !HK.Pos.okSex(a, b));
    if (team) {
      var ml = Math.round(25 + rng() * 35);
      a.m.ml += Math.round(ml / 2); b.m.ml += Math.round(ml / 2);
      var hard2 = HK.Pos && (HK.Pos.hardTop(a) || HK.Pos.hardTop(b)), tt = !hard2 && EO(S) ? HK.Ero.fill(S, ST.fmt(pkF(S, EL(S, 'team', [])), { a: a.name, b: b.name }), a) : '「半分こね」――' + a.style.label + 'と' + b.style.label + 'に挟まれた獲物は、朝まで帰してもらえなかった。';
      return ST.key(S, ST.say(S, { actors: [a, b], tag: '共闘', text: spot + 'で、' + a.name + 'と' + b.name + 'は同じ獲物に目をつけていた。' + pkF(S, ['顔を見合わせて、二人は笑った。', '目が合った瞬間、二人の尻尾が同じ向きに揺れた。', 'どちらからともなく、二人は小さく頷き合った。', '取り合うより、分け合うほうが早い。二人の考えは同じだった。']) + tt + '（' + ml + 'mlを山分け）', why: '二人の人懐こさ（NP・FC）', mag: 30, kind: 'climax' }), a.name + 'と' + b.name + 'の共闘');
    }
    var sa = a.stats.charm * 10 + a.stats.tech * 6 + rng() * 40, sb = b.stats.charm * 10 + b.stats.tech * 6 + rng() * 40;
    var w = sa >= sb ? a : b, l = w === a ? b : a, ml2 = Math.round(15 + rng() * 25);
    w.m.ml += ml2; l.m.mood -= 10;
    ST.say(S, { actors: [a, b], tag: '取り合い', text: spot + 'で、' + ST.fmt(pkF(S, SB.RIVAL || ['{a}と{b}が同じ獲物の両腕をそれぞれ掴んでいた。「私が先に見つけたの！」――獲物が選んだのは{w}だった。{l}は尻尾をしならせて、悔しそうに見送った。']), { a: a.name, b: b.name, w: w.name, l: l.name }) + '（' + w.name + ' +' + ml2 + 'ml）', why: w.name + 'の魅力と技巧が上回った', mag: 22 });
  }

  /* ---------- 夜明け：夜が明けたら狩りはおしまい（その夜の成績に合わせた締め） ---------- */
  var DAWN = {
    downtown: L('東の空が白み始め、ネオンが一つずつ消えていった。夜の繁華街に、始発を待つ人の足音だけが残った。|朝日がビルの隙間から差し込んだ。路地裏の看板の灯りが落ち、夜の繁華街の狩りの時間が終わった。|カラスが鳴き、ゴミ収集車が通りを抜けていった。夜の繁華街に、朝が来た。'),
    office: L('東の空が白み、オフィスビルの窓が一枚ずつ朝の色に染まっていった。残業明けの街の夜が終わった。|始発の電車がホームに滑り込んだ。オフィス街に、何事もなかったような朝が来た。|ビルの警備灯が消え、早出の清掃員がエントランスの鍵を開けた。オフィス街の長い夜が明けた。'),
    onsen: L('湯けむりの向こうで、山の端が明るくなった。温泉街の提灯が一つずつ消され、夜が明けた。|川面に朝靄が立ちこめた。旅館の朝風呂の札が掛け替えられ、温泉街の夜が終わった。|一番鶏が鳴いた。浴衣の人影の消えた温泉街に、朝の湯の音だけが響いていた。'),
    masq: L('シャンデリアの灯が落とされ、窓の外が白み始めた。仮面舞踏会は、夜明けとともにお開きになった。|最後のワルツが終わり、客たちが仮面を外して帰っていった。舞踏会の夜が明けた。|庭園の噴水に朝日が差した。館の扉が閉ざされ、仮面の夜は終わった。')
  };
  var DAWN_P = {
    out: L('{a}は巣の奥で羽を畳み、小さく丸まった。祓われかけた夜のことは、しばらく思い出したくない。|{a}は窓の外の朝日を恨めしそうに眺めた。今夜の狩りは途中で終わってしまった。次こそは、と{a}は尻尾を握りしめた。|{a}は巣に逃げ帰ったまま、朝まで震えていた。集めた精は{ml}ml。生きて帰れただけでもよしとするしかない。'),
    love: L('{a}は朝日の中、一目惚れしたあの人の背中をもう一度だけ思い浮かべてから巣へ戻った。胸の奥が、精とは別のもので満たされていた。|{a}は巣に戻っても、すれ違ったあの人のことばかり考えていた。サキュバスが人間に恋をするなんて、と自分で自分に呆れながら。|{a}は羽を畳んで朝の空を見上げた。集めた精は{ml}ml。けれど、今夜いちばんの収穫は数字では測れなかった。'),
    top: L('{a}は膨らんだ魔力を確かめるように、朝日の中で大きく羽を広げた。今夜いちばん多く集めたのは{a}だった（{ml}ml）。|{a}は誇らしげに尻尾を揺らして巣へ戻った。一晩で{ml}ml。仲間の誰よりも多い、文句なしの一位だった。|{a}は満腹の体でふわりと屋根に降り、夜明けの街を見下ろした。{ml}ml――この夜の主役は、間違いなく{a}だった。'),
    good: L('{a}は満ち足りた顔で、朝焼けの空を巣へ向かって飛んだ。集めた精は{ml}ml。上出来の一夜だった。|{a}は巣に戻ると、{best}のことを思い出して小さく笑った。{ml}ml。サキュバスとして、十分に胸を張れる夜だった。|{a}は朝日を背に羽を畳んだ。{ml}ml――体の隅々まで、魔力が満ちていた。'),
    mid: L('{a}は少し物足りなそうに、お腹をさすりながら巣へ戻った。集めた精は{ml}ml。悪くはないが、自慢できるほどでもない。|{a}は朝日に目を細めて、今夜の狩りを振り返った。{ml}ml。次はもう少しうまくやれるはずだ。|{a}は屋根の上で羽を休め、夜明けの街を見下ろした。{ml}ml。そこそこの夜だった。'),
    bad: L('{a}はぺこぺこのお腹を抱えて、朝焼けの空をとぼとぼと飛んだ。集めた精は{ml}ml。今夜はうまくいかなかった。|{a}は巣に戻るなり、毛布をかぶってふて寝した。{ml}ml。サキュバスとしては、正直かなり恥ずかしい数字だ。|{a}は朝日を浴びて、しおしおと羽を垂らした。次の夜こそ、と{a}は小さくつぶやいて目を閉じた。')
  };
  var DAWN_SEN = L('{s}は最後の一人が巣に戻るのを見届けてから、ようやく自分の羽を畳んだ。先輩としての一夜も、これでおしまいだ。|{s}は{a}の背中を見送って、小さくあくびをした。面倒を見るのは疲れるが、悪い夜ではなかった。|{s}は朝日に目を細めながら、{a}の今夜の狩りを頭の中でもう一度なぞった。次の夜に教えることは、もう決まっている。');
  var DAWN_END = {
    many_ok: L('こうして{town}の一夜は明けた。{n}人で集めた精は合わせて{sum}ml。いちばんは{top}だった。|夜が明け、サキュバスたちはそれぞれの巣へ帰っていった。{town}の一夜、いちばん多く集めたのは{top}（{topml}ml）。|朝日が昇り、羽と尻尾は人の目から消えた。{town}の一夜は、{top}の勝ちで幕を下ろした。'),
    many_ng: L('こうして{town}の一夜は明けた。いちばん多く集めた{top}でさえ{topml}ml。全員にとって、苦い夜になった。|夜が明け、サキュバスたちは肩を落として巣へ帰っていった。{town}の獲物は、今夜は手ごわかった。|朝日が昇り、羽と尻尾は人の目から消えた。{n}人で合わせて{sum}ml。次の夜への宿題が残った。'),
    one_ok: L('こうして{top}の一夜は明けた。集めた精は{topml}ml、評価は{grade}。サキュバスとしての初めての夜は、上々の出来だった。|夜が明け、{top}の羽と尻尾は朝日に溶けるように消えた。{topml}ml――{town}での一夜は、十分な収穫で終わった。|朝が来た。{top}は{town}での一夜を胸にしまい、評価{grade}の成績で狩りを終えた。'),
    one_ng: L('こうして{top}の一夜は明けた。集めた精は{topml}ml、評価は{grade}。初めての夜は、ほろ苦い結果に終わった。|夜が明け、{top}の羽と尻尾は朝日に溶けるように消えた。{topml}ml――{town}の夜は、思ったより厳しかった。|朝が来た。{top}は評価{grade}の成績で、{town}での一夜を終えた。次の夜こそは、と心に決めて。')
  };
  function dawnScene(S, T) {
    var tk = Object.keys(SB.TOWNS).filter(function (k) { return SB.TOWNS[k] === T; })[0];
    ST.say(S, { kind: 'phase', text: pkF(S, DAWN[tk] || DAWN.downtown) });
  }
  function closeNight(S, T, H, sen, rank, SE) {
    if (!sen) { ST.step(S, '夜明け'); dawnScene(S, T); }
    rank.forEach(function (p, k) {
      var kind = p.out ? 'out' : p.inLove ? 'love' : k === 0 && rank.length > 1 && GOOD[p.grade] ? 'top' : GOOD[p.grade] ? 'good' : p.grade === 'C' ? 'mid' : 'bad';
      var pool = DAWN_P[kind];
      if (!p.best) pool = pool.filter(function (x) { return x.indexOf('{best}') < 0; });
      ST.say(S, { actors: [p], tag: '夜明け', text: ST.fmt(pkF(S, pool), { a: p.name, ml: Math.round(p.m.ml), best: p.best ? p.best.name : '' }), why: p.name + 'の一夜：' + Math.round(p.m.ml) + 'ml・評価 ' + p.grade + (p.out ? '・' + p.outWhy : p.inLove ? '・獲物に恋をした' : '') });
    });
    if (S.TG && S.TG.length) SB.targetDawn(S, T, S.TG);
    if (sen) ST.say(S, { actors: [sen], tag: '夜明け', text: ST.fmt(pkF(S, DAWN_SEN), { s: sen.name, a: H.length > 1 ? '後輩たち' : H[0].name }), why: '先輩サキュバス（' + (SE ? SE.label : '') + '）' });
    var top = rank[0], sum = Math.round(H.reduce(function (s, p) { return s + p.m.ml; }, 0));
    var ek = (H.length > 1 ? 'many_' : 'one_') + (GOOD[top.grade] && !top.out ? 'ok' : 'ng');
    var o = ST.say(S, { kind: 'phase', actors: [top], text: ST.fmt(pkF(S, DAWN_END[ek]), { town: T.name, n: H.length, sum: sum, top: top.name, topml: Math.round(top.m.ml), grade: top.grade }) });
    ST.key(S, o, '夜明け：' + T.name + 'の一夜が終わった');
  }
  /* ---------- 結果 ---------- */
  function finish(S, input, T, H, sen, SE) {
    var rank = H.slice().sort(function (a, b) { return b.m.ml - a.m.ml; });
    rank.forEach(function (p, k) {
      p.grade = grade(p.m.ml);
      p.fate = p.out ? p.outWhy : p.inLove ? '恋をした夜（' + Math.round(p.m.ml) + 'ml）' : Math.round(p.m.ml) + 'ml・評価' + p.grade;
      p.notes.push('集めた精 ' + Math.round(p.m.ml) + 'ml（評価 ' + p.grade + '）・誘惑 ' + p.cnt.tries + '回中 成功' + p.cnt.win + '回' + (p.cnt.big ? '（大成功' + p.cnt.big + '回）' : '') + (p.cnt.half ? '・あと一歩' + p.cnt.half + '回' : ''));
      if (p.best) p.notes.push('いちばんの獲物：' + p.best.name + '（' + p.best.ml + 'ml）');
      var bits = [];
      if (p.cnt.magic) bits.push('魅了の魔眼 ' + p.cnt.magic + '回');
      if (p.cnt.reverse) bits.push('逆に搾られた ' + p.cnt.reverse + '回');
      if (p.cnt.holy) bits.push('聖なるものに出くわした ' + p.cnt.holy + '回');
      if (p.cnt.melt) bits.push('感じすぎて吸えなかった ' + p.cnt.melt + '回');
      if (p.cnt.shame) bits.push('恥ずかしい失敗 ' + p.cnt.shame + '回');
      if (p.inLove) bits.push('獲物に恋をした');
      if (SB.rivalNote) { var rn = SB.rivalNote(p); if (rn) bits.push(rn); }
      if (bits.length) p.notes.push(bits.join('・'));
      p.notes.push('誘惑の型「' + p.style.label + '」・方針「' + p.action.label + '」・目標「' + p.goal.label + '」');
      if (sen && SB.review) {
        p.rv = SB.review(S, sen, p, { rank: k, n: rank.length, T: T });
        p.notes.push('先輩' + sen.name + 'の講評：「' + p.rv.text + '」');
      } else if (sen) {
        var rv = ST.fmt(pkF(S, senV(S, sen, GOOD[p.grade] ? 'good' : 'bad') || SE.review[GOOD[p.grade] ? 'good' : 'bad']), { a: p.name });
        p.notes.push('先輩' + sen.name + 'の講評：' + rv);
      }
    });
    if (sen) {
      ST.step(S, '夜明け');
      dawnScene(S, T);
      rank.forEach(function (p) { if (p.rv) return ST.say(S, { actors: [sen, p], tag: '講評', text: p.name + 'への講評――' + sen.name + '「' + p.rv.text + '」', why: '評価 ' + p.grade + '（' + Math.round(p.m.ml) + 'ml）・' + p.rv.why }); ST.say(S, { actors: [sen, p], tag: '講評', text: sen.name + '→' + p.name + '：' + p.notes.filter(function (n) { return n.indexOf('講評') >= 0; })[0].replace(/^.*講評：/, ''), why: '評価 ' + p.grade + '（' + Math.round(p.m.ml) + 'ml）' }); });
      sen.fate = '後輩の面倒を見た'; sen.notes.push(SE.label + '：' + SE.eff);
    }
    closeNight(S, T, H, sen, rank, SE);
    var top = rank[0];
    var title = H.length > 1 ? T.name + 'の一夜。いちばん多く集めたのは' + top.name + '（' + Math.round(top.m.ml) + 'ml）。' : top.name + 'の一夜：' + Math.round(top.m.ml) + 'ml（評価 ' + top.grade + '）。' + (top.out ? top.outWhy + '。' : top.inLove ? '最後は獲物に恋をしてしまった。' : '');
    var lines = rank.map(function (p, k) { return (k + 1) + '位 ' + p.name + '（' + p.style.label + '）' + Math.round(p.m.ml) + 'ml・成功' + p.cnt.win + '/' + p.cnt.tries + (p.best ? '・最高は' + p.best.name : '') + (p.out ? '・' + p.outWhy : ''); });
    var rows = rank.map(function (p, k) { return { i: p.i, rank: (k + 1) + '位', cells: [p.style.label, '魅' + p.stats.charm + '・技' + p.stats.tech, Math.round(p.m.ml) + 'ml', p.cnt.win + '/' + p.cnt.tries, String(p.cnt.big), p.best ? p.best.name : '—', p.grade] }; });
    if (sen) rows.push({ i: sen.i, rank: '先輩', cells: [SE.label, '—', '—', '—', '—', '—', '—'] });
    if (S.TG && S.TG.length) SB.targetFinish(S, T, S.TG, rows, lines);
    var sum = H.reduce(function (s, p) { return s + p.m.ml; }, 0);
    return ST.result(S, input, {
      ending: { title: title, kind: GOOD[top.grade] ? 'ok' : 'over', lines: lines },
      estats: [['集めた精（合計）', Math.round(sum) + 'ml'], ['いちばん', top.name + ' ' + Math.round(top.m.ml) + 'ml'], ['誘惑', H.reduce(function (s, p) { return s + p.cnt.win; }, 0) + '/' + H.reduce(function (s, p) { return s + p.cnt.tries; }, 0) + '成功'], ['夜の長さ', S.env.hours + '時間']],
      table: { title: '一晩の成績', hint: '評価：S＝180ml以上、A＝120ml以上、B＝70ml以上、C＝35ml以上。', cols: ['誘惑の型', '魅力・技巧', '精', '成功/挑戦', '大成功', 'いちばんの獲物', '評価'], rows: rows },
      meters: [{ label: '精', color: '--love', max: 220, unit: 'ml' }, { label: '魔力', color: '--accent' }, { label: '昂り', color: '--pine', dash: true }, { label: '気分', color: '--guard', dash: true }],
      meta: T.name + '・' + S.env.hours + '時間',
      summary: 'サキュバスの一夜：' + rank.map(function (p) { return p.name + ' ' + Math.round(p.m.ml) + 'ml'; }).join('、')
    });
  }
})();
