/* 箱庭シミュレーター: サキュバスの一夜（R18）
   住人がサキュバスになって一晩、街で精を集める。魅力はあるのか、ちゃんと誘惑できるのか、どう誘惑するのか、
   一晩で何ml集められるのかを、住人どうしで比べられる。住人の一人を「先輩サキュバス」にすると、
   その性格に応じたアドバイスをくれる */
(function () {
  'use strict';
  /* 同じ結果の中で、同じ文・台詞をなるべく繰り返さない（候補が尽きたら元どおりに引く） */
  function pkF(S, arr) {
    if (!arr || !arr.length) return window.HK.Story.pick(S, arr);
    var u = S._pkSeen = S._pkSeen || [], f = arr.filter(function (x) { return u.indexOf(x) < 0; });
    var x = window.HK.Story.pick(S, f.length ? f : arr);
    if (typeof x === 'string') { u.push(x); if (u.length > 400) u.shift(); }
    return x;
  }
  var HK = window.HK, SB = HK.SUCCUBUS, ST = HK.Story, clamp = HK.clamp;
  function L(s) { return s.split('|'); }

  var scen = {
    id: 'succubus', name: 'サキュバスの一夜', kicker: 'ソロ（比べられる）・R18', solo: true, maxCast: 8, minCast: 1,
    desc: '住人がサキュバスになって一晩、街で精を集める。魅力は足りるか、どう誘惑するか、一晩で何ml集められるか。複数人なら同じ夜を別々に狩って比べられる。住人の一人を先輩サキュバスにすると、性格に応じたアドバイスをくれる。※成人キャラクター向け',
    note: '※登場人物はすべて成人として扱います。',
    unit: '時間', simulate: function (input) { return run(input); },
    castHint: '1人でも複数人でも。複数人なら全員が同じ夜に別々に狩りをして、集めた精の量を比べます。「役割」で「先輩サキュバス」を選んだ住人は狩りに出ず、後輩にアドバイスをします（性格でアドバイスが変わります）。',
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
    perFields: [{ id: 'role', label: '役割', auto: '狩りに出る', options: [{ id: 'hunt', label: '狩りに出る' }, { id: 'senpai', label: '先輩サキュバス（アドバイス係）' }] }],
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
  function names(l) { return l.map(function (p) { return p.name; }).join('・'); }
  var GOOD = { S: 1, A: 1, B: 1 };
  /* 描写の作風「男性向け」（ero-kit.js・solo-succubus-ero.js）：選んだときだけ差し替える */
  /* 描写の濃さが「ぼかす」なら、作風の指定より優先して小説調のまま */
  function EO(S) { return !!(HK.Ero && HK.Ero.on(S) && S.env.lewd !== 'low'); }
  function EL(S, key, base) { return EO(S) ? HK.Ero.L(S, 'succubus', key, base) : base; }
  var VO = SB && SB.VOICE;
  function senV(S, sen, k) { var sv = VO && sen && VO.SEN[sen.persona]; return sv && sv[k] && S.rng() < 0.8 ? sv[k] : null; }
  function grade(ml) { return ml >= 180 ? 'S' : ml >= 120 ? 'A' : ml >= 70 ? 'B' : ml >= 35 ? 'C' : 'D'; }

  function run(input) {
    var S = ST.state(input, 'succubus'), rng = S.rng, env = S.env, P = S.P;
    var tk = env.town === 'random' || !SB.TOWNS[env.town] ? rng.pick(Object.keys(SB.TOWNS)) : env.town, T = SB.TOWNS[tk];
    P.forEach(function (p) {
      var pc = (input.perChar && input.perChar[p.i]) || {};
      p.role = (pc.pick || {}).role === 'senpai' ? 'senpai' : 'hunt';
      p.action = resolve(S, p, scen.actions, pc.action); p.goal = resolve(S, p, scen.goals, pc.goal);
      p.style = SB.typeOf ? SB.typeOf(p) : SB.STYLE[p.top];
    });
    if (!P.some(function (p) { return p.role === 'hunt'; })) P[0].role = 'hunt';
    var H = P.filter(function (p) { return p.role === 'hunt'; }), sen = P.filter(function (p) { return p.role === 'senpai'; })[0] || null;
    var SE = sen ? SB.SENPAI[sen.top] : null;
    P.forEach(function (p) {
      p.roleLabel = p.role === 'senpai' ? '先輩サキュバス（' + SE.label + '）' : 'サキュバス・' + p.style.label;
      p.m = { ml: 0, mana: 100, plea: 0, mood: 60 };
      p.cnt = { tries: 0, win: 0, big: 0, half: 0, fail: 0, melt: 0, streak: 0, shame: 0, magic: 0, reverse: 0, holy: 0 };
      p.best = null; p.out = false;
    });
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
      var o = ST.say(S, { actors: [p], tag: '魅力診断', text: (SB.TRANSFORM ? ST.fmt(pkF(S, SB.TRANSFORM), { a: p.name }) : p.name + 'の背中に小さな羽が、腰に細い尻尾が生えた。') + '誘惑の型は「' + p.style.label + '」（' + p.style.desc + '）。魅力' + charm + '・技巧' + tech + '――' + comment + '。', why: '誘惑の型は' + p.name + 'の' + (p.style.why || p.topWhy) + 'から／誘惑力 ' + power, mag: 10 });
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
        if (rng() < env.ev / 100 * 0.45 || (last && rng() < 0.4)) { if (happen(S, T, p, sen, SE, last)) return; }
        if (rng() > 0.35 + env.prey / 100 * 0.65) return ST.sayB(S, { actors: [p], text: ST.fmt(pkF(S, (SB.NOPREY || L('{a}は{spot}で一時間粘ったが、めぼしい獲物は通らなかった。|{a}は{spot}の屋根の上から街を見下ろした。今夜は人通りが少ない。|{a}は{spot}をうろついたが、目が合う人がいなかった。'))), { a: p.name, spot: rng.pick(T.spots) }), why: '獲物の少なさ（' + env.prey + '）' }, p.name + 'は空振り');
        hunt(S, T, p, sen, SE);
      });
      ST.flushShort(S, 'ほかの狩り：');
      P.forEach(function (p) { p.m.mana = clamp(p.m.mana + 3, 0, 100); p.m.plea = clamp(p.m.plea - 10, 0, 100); });
      ST.snap(S, keys);
    }
    return finish(S, input, T, H, sen, SE);
  }

  /* ---------- 一回の狩り ---------- */
  function hunt(S, T, p, sen, SE) {
    var rng = S.rng, env = S.env;
    var key = HK.weighted(rng, Object.keys(T.prey), function (k) {
      var q = SB.PREY[k], w = T.prey[k];
      if (q.holy) w *= 0.3 + env.holy / 60 * (sen && sen.top === 'AC' ? 0.4 : 1);
      if ((p.action.id === 'pick' || p.intel) && q.weak === p.top) w *= 2.4;
      if (p.goal.id === 'safe' && q.holy) w *= 0.4;
      w /= 1 + ((p.seen || {})[k] || 0) * 0.8;
      return w;
    });
    p.seen = p.seen || {}; p.seen[key] = (p.seen[key] || 0) + 1;
    var q = SB.PREY[key], spot = rng.pick(T.spots), v = { a: p.name, t: q.name, spot: spot, s: sen ? sen.name : '' };
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
    var t = ST.fmt(again ? pkF(S, SB.AGAIN) : flw ? pkF(S, flw.t) : '{spot}で、{a}は{t}に目をつけた。', v) + (flw && flw.id === 'dream' ? '' : ST.fmt(ty.ap ? SB.say(S, pkF(S, ty.ap), ty.id + '_ap', p) : pkF(S, p.style.approach), v)) + (VO && rng() < (ty.ap ? 0.2 : 0.5) ? p.name + pkF(S, VO.OPEN[p.persona] || VO.OPEN.gentle) : '') + (q.re && rng() < 0.65 ? ST.fmt(q.re, v) : '');
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
    var hTop = !!(HK.Pos && HK.Pos.hardTop(p));
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
        if (HK.Voice.CLIMAX[p.persona] && rng() < (EO(S) ? 0.3 : 0.6)) t += p.name + '「' + pkF(S, noRecv(HK.Voice.CLIMAX[p.persona])) + '」';
        else if (SB.VOICE.MELT[p.persona]) t += p.name + pkF(S, noRecv(EL(S, 'voice.melt.' + p.persona, SB.VOICE.MELT[p.persona])));
      }
      t += ST.fmt(pkF(S, noRecv(EL(S, 'melt.after', SB.MELT_AFTER))), v) + (ml ? '（吸えたのは' + ml + 'mlだけ）' : '');
      if (sTop && HK.FM && HK.Pos.isF(p)) t = HK.FM.fixWith({ pick: function (a) { return pkF(S, a); } }, t, p, q.name);
      p.m.plea = 35;
      if (rng() < 0.4) { p.skip = true; why += '／腰が抜けて次の一時間は休み'; }
    } else {
      kind = score >= 45 ? 'big' : 'win';
      p.cnt.win++; p.cnt.streak = 0; p.m.mood += 8;
      if (kind === 'big') p.cnt.big++;
      ml = Math.round(q.vit * (kind === 'big' ? 0.9 + rng() * 0.6 : 0.5 + rng() * 0.4) * (1 + p.stats.tech * 0.05) * (ty.ml || 1));
      if (lew === 'low') t += ST.fmt('――二人は{spot}の奥へ消えた。何があったのかは、{a}の満ち足りた顔だけが知っている。', v);
      else if (ty.tk) { leadP = ST.fmt(SB.say(S, pkF(S, sTop ? (EO(S) && HK.Pos.isF(p) ? EL(S, 'topf', ty.top) : EL(S, 'top.' + ty.id, ty.top)) : EL(S, 'tk.' + ty.id, ty.tk)), ty.id + '_tk', p), v); t += '――' + leadP; }
      else { t += '――' + ST.fmt(pkF(S, sTop && SB.TAKE_TOP ? SB.TAKE_TOP[p.top] : SB.TAKE[p.top]), v); }
      if (q.stamina && hTop && SB.REVERSE_HARD && rng() < 0.5 - p.stats.tech * 0.06 + (ty.rev || 0)) { p.m.plea = 100; p.skip = true; rev = 1; ml = Math.round(ml * 1.4); t += ST.fmt(pkF(S, EO(S) && HK.Pos.isF(p) ? EL(S, 'reverse.topf', SB.REVERSE_HARD) : EL(S, 'reverse.hard', SB.REVERSE_HARD)), v); why += '／底なしの体力の相手に、朝まで主導権を渡さなかった'; }
      else if (q.stamina && !hTop && rng() < 0.5 - p.stats.tech * 0.06 + (ty.rev || 0)) { p.cnt.reverse++; p.m.plea = 100; p.skip = true; rev = 1; ml = Math.round(ml * 1.4); t += ST.fmt(pkF(S, sTop && SB.REVERSE_TOP ? (EO(S) && HK.Pos.isF(p) ? EL(S, 'reverse.topf', SB.REVERSE_TOP) : EL(S, 'reverse.top', SB.REVERSE_TOP)) : EL(S, 'reverse', SB.REVERSE)), v); why += '／相手の底なしの体力に逆に搾られた'; }
      else if (q.incubus && hTop) { ml = Math.round(ml * 0.6); t += ST.fmt('――ところが{t}も、{a}から吸い返そうとしてきた。{a}は{t}の手首を押さえつけ、一滴も吸い返させなかった。ただ、同業者の精は薄かった。', v); }
      else if (q.incubus) { ml = Math.round(ml * 0.6); t += ST.fmt('――ところが{t}も、{a}から吸い返そうとしてきた。同業者どうしの吸い合いは、引き分けに終わった。', v); }
      /* 小説調の山場（solo-thick4.js）：主導権を握ったまま搾りきった回は、段落に分けて厚く。サキュバスが攻めなら貫いて、そうでなければ跨って。型ごとの決め台詞の文は絶頂の段落に置く */
      if (leadP && !rev && !q.incubus && HK.Thick4 && HK.Thick4.ok(S, lew)) {
        var prey = { name: q.name, gender: 'm' };
        t = t.replace('――' + leadP, '――' + HK.Thick4.scene(S, { dom: p, sub: prey, kind: sTop ? 'in' : 'ride', peak: leadP.replace(/([。」])「/g, '$1' + p.name + '「'), sad: HK.Thick4.rollSad(S, p, prey),
          after: ST.fmt(pkF(S, ['{a}の肌に、{ml}ml分の精がゆっくりと溶けていった。', '{a}は舌なめずりをして、満ちていく魔力を味わった。――{ml}ml。', '{a}の淫紋が、{ml}ml分の精を吸って淡く光った。']), { a: p.name, ml: ml }) }));
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
    var tag = { fail: '失敗', half: 'あと一歩', win: '成功', big: '大成功', melt: '感じすぎ' }[kind];
    var o = ST.sayB(S, { actors: [p], tag: tag, text: t, why: why + '（誘惑の出来 ' + Math.round(score) + '）', mag: kind === 'big' ? 40 : kind === 'win' ? 26 : 12, kind: kind === 'big' || kind === 'win' || kind === 'melt' ? 'climax' : 'event' }, p.name + '×' + q.name + '＝' + tag + (ml ? ' ' + ml + 'ml' : ''), kind === 'big' || (p.cnt.win === 1 && kind === 'win') || (kind === 'melt' && p.cnt.melt === 1));
    if (o && kind === 'melt' && p.cnt.melt === 1) ST.key(S, o, p.name + 'は感じすぎて吸えなかった');
    if (o && kind === 'big') ST.key(S, o, p.name + 'の大成功');
    if (o && p.cnt.win === 1 && kind === 'win') ST.key(S, o, p.name + 'の初めての獲物');
    /* 先輩から */
    if (sen && (kind === 'fail' || kind === 'melt') && p.cnt.streak >= 2) {
      var e = ST.say(S, { actors: [sen, p], tag: '先輩から', text: (function () { var sv = senV(S, sen, 'fail'); return sv ? ST.fmt('{s}は{a}にメッセージを送った。' + pkF(S, sv), { a: p.name, s: sen.name }) : ST.fmt(pkF(S, SE.fail), { a: p.name, s: sen.name }); })(), why: SE.label + '（' + SE.eff + '）' });
      if (sen.top === 'NP') p.m.mood += 15;
      if (sen.top === 'CP') p.m.mood -= 5;
      if (sen.top === 'FC' && S.rng() < 0.5) {
        var gain = Math.round(15 + S.rng() * 30), steal = S.rng() < 0.4;
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
    var et = HK.Pos && HK.Pos.hardTop(p) ? e.t : EL(S, 'ev.' + e.id, e.t);
    var fx = e.fx, t = ST.fmt(pkF(S, et), { a: p.name, s: sen ? sen.name : '' }), why = '';
    if (HK.Ero) t = HK.Ero.fill(S, t, p);
    if (sen && sen.top === 'AC' && (e.id === 'holy' || e.id === 'police') && rng() < 0.5) { t = sen.name + 'の「教会には近づかないで」を思い出して、' + p.name + 'は道を変えた。危ないところだった。'; fx = {}; why = '心配性の先輩の忠告が効いた'; }
    if (fx.mana) p.m.mana = clamp(p.m.mana + fx.mana, 0, 100);
    if (fx.charm) p.m.mood += fx.charm;
    if (fx.ml) { p.m.ml += fx.ml; if (!p.best || fx.ml > p.best.ml) p.best = { name: e.id === 'couple' ? 'カップル' : e.id === 'fan' ? '以前の獲物' : '先輩の差し入れ', ml: fx.ml }; }
    if (fx.shame) p.cnt.shame++;
    if (fx.plea) p.m.plea = clamp(p.m.plea + fx.plea, 0, 100);
    if (fx.love) { p.inLove = true; p.m.mood += 10; }
    var o = ST.say(S, { actors: sen && fx.senpai ? [p, sen] : [p], tag: 'ハプニング', text: t, why: why || (fx.ml ? '+' + fx.ml + 'ml' : fx.mana ? '魔力' + fx.mana : ''), mag: fx.love ? 30 : 12 });
    if (fx.love) ST.key(S, o, p.name + 'の一目惚れ');
    if (fx.bonusPrey) { hunt(S, T, p, sen, SE); return true; }
    return !!(fx.skip || fx.love);
  }

  /* ---------- サキュバスどうしが鉢合わせる ---------- */
  function meet(S, T, H) {
    var rng = S.rng, live = H.filter(function (p) { return !p.out; });
    if (live.length < 2) return;
    var a = rng.pick(live), b = rng.pick(live.filter(function (x) { return x !== a; })), spot = rng.pick(T.spots);
    var team = a.tr.warmth + b.tr.warmth > 1.1 && rng() < 0.6;
    if (team) {
      var ml = Math.round(25 + rng() * 35);
      a.m.ml += Math.round(ml / 2); b.m.ml += Math.round(ml / 2);
      var hard2 = HK.Pos && (HK.Pos.hardTop(a) || HK.Pos.hardTop(b)), tt = !hard2 && EO(S) ? HK.Ero.fill(S, ST.fmt(pkF(S, EL(S, 'team', [])), { a: a.name, b: b.name }), a) : '「半分こね」――' + a.style.label + 'と' + b.style.label + 'に挟まれた獲物は、朝まで帰してもらえなかった。';
      return ST.key(S, ST.say(S, { actors: [a, b], tag: '共闘', text: spot + 'で、' + a.name + 'と' + b.name + 'は同じ獲物に目をつけていた。顔を見合わせて、二人は笑った。' + tt + '（' + ml + 'mlを山分け）', why: '二人の人懐こさ（NP・FC）', mag: 30, kind: 'climax' }), a.name + 'と' + b.name + 'の共闘');
    }
    var sa = a.stats.charm * 10 + a.stats.tech * 6 + rng() * 40, sb = b.stats.charm * 10 + b.stats.tech * 6 + rng() * 40;
    var w = sa >= sb ? a : b, l = w === a ? b : a, ml2 = Math.round(15 + rng() * 25);
    w.m.ml += ml2; l.m.mood -= 10;
    ST.say(S, { actors: [a, b], tag: '取り合い', text: spot + 'で、' + ST.fmt(pkF(S, SB.RIVAL || ['{a}と{b}が同じ獲物の両腕をそれぞれ掴んでいた。「私が先に見つけたの！」――獲物が選んだのは{w}だった。{l}は尻尾をしならせて、悔しそうに見送った。']), { a: a.name, b: b.name, w: w.name, l: l.name }) + '（' + w.name + ' +' + ml2 + 'ml）', why: w.name + 'の魅力と技巧が上回った', mag: 22 });
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
      rank.forEach(function (p) { if (p.rv) return ST.say(S, { actors: [sen, p], tag: '講評', text: p.name + 'への講評――' + sen.name + '「' + p.rv.text + '」', why: '評価 ' + p.grade + '（' + Math.round(p.m.ml) + 'ml）・' + p.rv.why }); ST.say(S, { actors: [sen, p], tag: '講評', text: sen.name + '→' + p.name + '：' + p.notes.filter(function (n) { return n.indexOf('講評') >= 0; })[0].replace(/^.*講評：/, ''), why: '評価 ' + p.grade + '（' + Math.round(p.m.ml) + 'ml）' }); });
      sen.fate = '後輩の面倒を見た'; sen.notes.push(SE.label + '：' + SE.eff);
    }
    var top = rank[0];
    var title = H.length > 1 ? T.name + 'の一夜。いちばん多く集めたのは' + top.name + '（' + Math.round(top.m.ml) + 'ml）。' : top.name + 'の一夜：' + Math.round(top.m.ml) + 'ml（評価 ' + top.grade + '）。' + (top.out ? top.outWhy + '。' : top.inLove ? '最後は獲物に恋をしてしまった。' : '');
    var lines = rank.map(function (p, k) { return (k + 1) + '位 ' + p.name + '（' + p.style.label + '）' + Math.round(p.m.ml) + 'ml・成功' + p.cnt.win + '/' + p.cnt.tries + (p.best ? '・最高は' + p.best.name : '') + (p.out ? '・' + p.outWhy : ''); });
    var rows = rank.map(function (p, k) { return { i: p.i, rank: (k + 1) + '位', cells: [p.style.label, '魅' + p.stats.charm + '・技' + p.stats.tech, Math.round(p.m.ml) + 'ml', p.cnt.win + '/' + p.cnt.tries, String(p.cnt.big), p.best ? p.best.name : '—', p.grade] }; });
    if (sen) rows.push({ i: sen.i, rank: '先輩', cells: [SE.label, '—', '—', '—', '—', '—', '—'] });
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
