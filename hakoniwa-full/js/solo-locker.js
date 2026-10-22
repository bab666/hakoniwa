/* 箱庭シミュレーター: 媚薬ロッカー（R18）
   媚薬の充満する狭いロッカーに閉じ込められた二人。仕掛けを解いて脱出できるか。
   感度が上がると、堪え性のない人から手を出し始める。乗るか嗜めるかは関係と性格しだい。
   拘束されたままなら生殺し、動けるなら狭い中での焦らしセックス。脱出後にベッドで続きをすることも */
(function () {
  'use strict';
  var HK = window.HK, LK = HK.LOCKER, ST = HK.Story, clamp = HK.clamp;
  if (!LK || !ST) return;

  var scen = {
    id: 'locker', name: '媚薬ロッカー', kicker: '2人・R18', solo: true, maxCast: 2, minCast: 2,
    desc: '媚薬の充満する狭いロッカーに閉じ込められた二人。仕掛けを解いて無事に脱出できるか。手を出すのは誰か、乗るのか嗜めるのか、拘束されたまま生殺しか、狭い中で焦らしセックスか。出たあと、目の前のベッドで続きをするかも。※成人キャラクター向け',
    note: '※登場人物はすべて成人として扱います。',
    unit: 'コマ', simulate: function (input) { return run(input); },
    castHint: 'ちょうど2人。二人の関係（恋人・主従・ライバルなど）は「既存の関係」から決まります。まれに、自分から望んで閉じ込められている人がいます（役割で指定もできます）。',
    env: [
      { id: 'bind', label: '拘束', type: 'select', def: 'random', options: [{ v: 'random', label: 'おまかせ' }, { v: 'both', label: '二人とも手錠' }, { v: 'one', label: '片方だけ手錠' }, { v: 'none', label: '拘束なし' }] },
      { id: 'dose', label: '媚薬の濃さ', min: 0, max: 100, def: 65, lo: 'ほのか', hi: '理性が飛ぶ' },
      { id: 'diff', label: '仕掛けの難しさ', min: 0, max: 100, def: 50, lo: '簡単', hi: '激ムズ' },
      { id: 'turns', label: '制限時間', min: 6, max: 14, def: 12, lo: '30分', hi: '70分', desc: '5分ごとに区切る。時間切れになると扉は開くが……' },
      { id: 'ev', label: 'ハプニングの頻度', min: 0, max: 100, def: 45, lo: 'たまに', hi: '頻繁' },
      { id: 'lewd', label: '描写の濃さ', type: 'select', def: 'mid', options: [{ v: 'low', label: 'ぼかす' }, { v: 'mid', label: 'ほどほど' }, { v: 'high', label: '濃いめ' }] }
    ],
    stats: [
      { id: 'gaman', label: '我慢', desc: '高いほど媚薬に耐え、理性が長くもつ' },
      { id: 'dex', label: '器用さ', desc: '高いほど仕掛けを解くのが早い（謎解きはエゴグラムのAも効く）' },
      { id: 'luck', label: '運', desc: '高いほど、外から扉が開くなどの幸運が起きやすい' }
    ],
    actions: [
      { id: 'solve', label: '脱出に集中する', fit: function (t) { return t.a * 0.5 + t.cp * 0.4; } },
      { id: 'calm', label: '相手を落ち着かせる', fit: function (t) { return t.np * 0.8; } },
      { id: 'flow', label: '流れに任せる', fit: function (t) { return t.fc * 0.5 + t.ac * 0.4; } }
    ],
    goals: [
      { id: 'out', label: '一刻も早く出る', fit: function (t) { return t.cp * 0.5 + t.caution * 0.5; } },
      { id: 'safe', label: '相手を守る', fit: function (t) { return t.np * 0.7; } },
      { id: 'want', label: '本当は少し期待している', fit: function (t) { return t.fc * 0.4 + t.impulse * 0.4; } }
    ],
    perFields: [{ id: 'role', label: '役割', auto: 'おまかせ（まれに自分から閉じ込められている）', options: [{ id: 'normal', label: '巻き込まれた' }, { id: 'plotter', label: '自分から望んで閉じ込められた' }] }],
    events: []
  };
  HK.SCENARIOS.locker = scen;
  HK.SCEN_ORDER.push('locker');

  var LV = ['touch', 'kiss', 'grope', 'oral', 'sex'];
  var REL = { lover: 'lover', mate: 'lover', fated: 'lover', fwb: 'fwb', master: 'master', crush: 'crush', friend: 'friend', best: 'friend', childhood: 'friend', buddy: 'friend', senpai: 'friend', colleague: 'friend', acq: 'friend', almost: 'almost', rival: 'tension', bad: 'tension', enemy: 'tension', ex: 'ex', sibling: 'friend' };
  var REL_LABEL = { lover: '恋人', fwb: 'セフレ', master: '主従', crush: '片想い', friend: '知り合い', almost: '友達以上恋人未満', tension: '険悪', ex: '元恋人', stranger: '初対面' };

  var LK_HATE_LEAD = ['狭いロッカーの中で、{b}は{a}の胸に、そっと額を預けた。', '{b}は、触れ合った{a}の手を、そのまま握ろうとした。', '{b}は、熱に浮かされた目で、{a}の顔を見上げた。'];
  function run(input) {
    var S = ST.state(input, 'locker'), rng = S.rng, env = S.env, P = S.P, lew = env.lewd || 'mid', V = HK.Voice;
    var A = P[0], B = P[1];
    if (!B) { B = A; }
    /* 関係 */
    /* 同じ二人に関係を重ねられる（セフレで片想い など）。代表の関係は強いものから */
    var PRIO = ['mate', 'fated', 'lover', 'master', 'fwb', 'ex', 'crush', 'almost', 'best', 'buddy', 'childhood', 'rival', 'enemy', 'bad', 'senpai', 'mentor', 'teacher', 'colleague', 'friend', 'acq', 'pparent', 'parent', 'sibprot', 'sibling', 'sibclose', 'sibbad'];
    var tieL = (input.ties || []).filter(function (t) { return (t.a === A.i && t.b === B.i) || (t.a === B.i && t.b === A.i); }).sort(function (x, y) { return PRIO.indexOf(x.type) - PRIO.indexOf(y.type); });
    var tie = tieL[0];
    var rel = tie ? REL[tie.type] || REL[(HK.TIES[tie.type] || {}).like] || 'friend' : 'stranger';
    var master = null, servant = null, crusher = null;
    var mtie = tieL.filter(function (t) { return t.type === 'master'; })[0];
    if (mtie) { master = P[mtie.a]; servant = P[mtie.b]; }
    var crushL = tieL.filter(function (t) { return t.type === 'crush'; });
    if (crushL.length) crusher = P[crushL[0].a];
    var fwbAll = tieL.some(function (t) { return t.type === 'fwb'; });
    var intimate = fwbAll || rel === 'lover';
    /* セフレで片想い：相手の気持ちで三つに分かれる */
    var fcKind = fwbAll && crusher ? (crushL.length > 1 ? 'mutual' : crushL[0].cold ? 'cold' : 'pulse') : null;
    /* 自分から閉じ込められた人 */
    var plotter = null;
    P.forEach(function (p) { var pk = (input.perChar && input.perChar[p.i] && input.perChar[p.i].pick || {}).role; if (pk === 'plotter') plotter = p; });
    if (!plotter && rng() < 0.1) plotter = crusher || (rng() < 0.5 ? A : B);
    /* 拘束 */
    var bind = env.bind === 'random' ? rng.pick(['both', 'one', 'none', 'both']) : env.bind;
    P.forEach(function (p) {
      var o = p === A ? B : A;
      p.o = o;
      p.bound = bind === 'both';
      p.m = { heat: plotter === p ? 25 : 0, reason: clamp(70 + p.tr.cp * 15 + p.stats.gaman * 3, 40, 100), plea: 0, esc: 0 };
      p.cnt = { make: 0, refuse: 0, accept: 0, climax: 0, solve: 0, hold: 0 };
      var pc = (input.perChar && input.perChar[p.i]) || {};
      p.action = pick(scen.actions, pc.action, p); p.goal = pick(scen.goals, pc.goal, p);
      p.roleLabel = (plotter === p ? '自分から閉じ込められた人' : '閉じ込められた人') + '・' + REL_LABEL[rel] + (servant === p ? '（従者）' : master === p ? '（主）' : '');
      p.sens = (0.6 + (6 - (p.stats.gaman || 3)) * 0.1 - p.tr.cp * 0.15) * (0.7 + rng() * 0.7);
    });
    function pick(list, id, p) { if (id && id !== 'auto') for (var i = 0; i < list.length; i++) if (list[i].id === id) return list[i]; return HK.weighted(rng, list, function (o) { return Math.pow(Math.max(0.02, o.fit(p.tr)), 3); }); }
    var boundOne = null;
    /* 受け攻め：向きの決まらない二人（攻め×攻めなど）は体の関係にならない。女性どうしは、いちもつの描写を使わない */
    var Pos = HK.Pos, clash = !!(Pos && Pos.clash(A, B)), ff = !!(Pos && Pos.ff(A, B)), R18 = !HK.SAFE_ON;
    function hardTop(p) { return !!(Pos && Pos.hardTop(p)); }
    if (bind === 'one') {
      boundOne = plotter ? plotter.o : rng() < 0.5 ? A : B;
      /* 自分で攻めを選んだ人は、片方だけの拘束の側にしない（拘束されて何かをされる側にしない）。二人とも攻めなら二人とも手錠に */
      if (hardTop(boundOne)) { if (!hardTop(boundOne.o)) boundOne = boundOne.o; else { bind = 'both'; boundOne = null; A.bound = B.bound = true; } }
      if (boundOne) boundOne.bound = true;
    }
    var keys = ['heat', 'reason', 'plea', 'esc'];

    /* 仕掛けの順番 */
    var gimmicks = [];
    if (bind !== 'none') gimmicks.push(LK.GIMMICK.filter(function (g) { return g.bind; })[0]);
    var others = LK.GIMMICK.filter(function (g) { return !g.bind; });
    var first = rng.pick(others); gimmicks.push(first);
    if (rng() < 0.5 + env.diff / 200) gimmicks.push(rng.pick(others.filter(function (g) { return g !== first; })));
    var gi = 0, prog = 0, escaped = false, escTurn = -1, how = '';
    var pair = { level: -1, sexIn: false, acts: 0, refusedHard: false };
    var v0 = { a: A.name, b: B.name };

    /* ---------- 目覚め ---------- */
    ST.step(S, '閉じ込められた');
    ST.budget(S, 3);
    ST.say(S, { actors: [A, B], tag: '目覚め', text: ST.fmt(ST.pick(S, LK.INTRO), v0) + ST.fmt(ST.pick(S, LK.BIND[bind]), boundOne ? { a: boundOne.name, b: boundOne.o.name } : v0), why: '二人の関係：' + REL_LABEL[rel] + '／拘束：' + { both: '二人とも', one: boundOne ? boundOne.name + 'だけ' : '', none: 'なし' }[bind] });
    ST.say(S, { kind: 'phase', text: ST.pick(S, LK.SPEAKER) + '（仕掛け：' + gimmicks.map(function (g) { return g.name; }).join('→') + '）' });
    /* 体の関係にならない二人・相手が自分で攻めを選んだ人のときは、手を取って触れさせる文を使わない */
    var plotPush = plotter ? LK.PLOT.push.filter(function (l) { return !((clash || (hardTop(plotter.o) && !hardTop(plotter))) && /胸に押し当て|腰に回させ|任せて/.test(l)); }) : [];
    if (plotter) { var o = ST.say(S, { actors: [plotter], tag: '思惑', text: ST.fmt(ST.pick(S, plotPush.length ? plotPush : LK.PLOT.push), { a: plotter.name, b: plotter.o.name }), why: plotter.name + 'は、自分から望んでここにいる' + (crusher === plotter ? '（' + plotter.o.name + 'への片想い）' : ''), mag: 20 }); ST.key(S, o, plotter.name + 'の思惑'); }
    ST.snap(S, keys);

    function stage(p) { return p.m.heat >= 85 ? 3 : p.m.heat >= 60 ? 2 : p.m.heat >= 35 ? 1 : 0; }
    function moan(p) { return lew !== 'low' && V && V.CLIMAX[p.persona] ? p.name + '「' + ST.pick(S, V.CLIMAX[p.persona]) + '」' : ''; }
    function say2(p, T) { var l = T[p.persona] || T.gentle; return p.name + ST.pick(S, l); }
    function climax(p, t) { p.cnt.climax++; p.m.plea = 25; p.m.heat = clamp(p.m.heat - 10, 0, 100); return t + moan(p); }
    function canHands(p) { return !p.bound; }
    /* ロッカーの中でいちばん進んだ段階の名前（女性どうしは「挿入」と呼ばない） */
    function actLabel(lv) { var k = LV[lv]; return ff && LK.FF_ACT && LK.FF_ACT[k] && LK.FF_ACT[k].label || LK.ACT[k].label; }
    /* 向きの決まらない二人：手が伸びかけても、性格に合わせたやり方で踏みとどまる */
    function clashType(p) {
      var t = p.tr, sc = { solve: t.cp * 0.6 + t.a * 0.3 + (p.goal && p.goal.id === 'out' ? 0.2 : 0) + (p.action && p.action.id === 'solve' ? 0.15 : 0), care: t.np * 0.85 + (p.goal && p.goal.id === 'safe' ? 0.2 : 0), shy: t.ac * 0.85, joke: t.fc * 0.8, endure: 0.5 };
      return Object.keys(sc).reduce(function (x, k) { return sc[k] > sc[x] ? k : x; }, 'endure');
    }
    function holdClash(a, b) {
      a.cnt.hold++; a.m.reason = clamp(a.m.reason + 3, 0, 100); a.m.plea = clamp(a.m.plea + 8, 0, 90);
      if (a.cnt.hold > 3 && rng() < 0.5) return;
      var ty = clashType(a), C = LK.CLASH;
      ST.sayB(S, { actors: [a, b], tag: C.tag[ty], text: ST.fmt(ST.pick(S, C.hold[ty]), { a: a.name, b: b.name }) + (rng() < 0.5 ? ST.fmt(ST.pick(S, C.reply), { a: a.name, b: b.name }) : ''), why: a.name + 'は発情していた（' + Math.round(a.m.heat) + '）が、' + b.name + 'とは受け攻めの向きが合わない二人なので、手は出さなかった（' + { solve: 'CP・A', care: 'NP', shy: 'AC', joke: 'FC', endure: '我慢' }[ty] + '）', mag: 16 }, a.name + 'は手を出さずに耐えた', a.cnt.hold === 1);
    }

    /* ---------- 5分ごと ---------- */
    for (var turn = 0; turn < env.turns && !escaped; turn++) {
      ST.step(S, ((turn + 1) * 5) + '分');
      S.step = turn;
      ST.budget(S, 3);
      var logAt = S.log.length;
      /* ハプニング */
      if (rng() < env.ev / 100 * 0.5) {
        var calm = rng() < 0.3;
        if (calm) P.forEach(function (p) { p.m.reason = clamp(p.m.reason + 12, 0, 100); p.m.heat = clamp(p.m.heat - 6, 0, 100); });
        else P.forEach(function (p) { p.m.heat = clamp(p.m.heat + 10, 0, 100); });
        ST.sayB(S, { actors: [A, B], tag: calm ? '一息' : 'ハプニング', text: ST.fmt(ST.pick(S, calm ? LK.CALM : LK.SURGE), v0), why: calm ? '理性 +12' : '二人とも発情 +10' }, calm ? '少しだけ正気に戻った' : 'ガスが濃くなった');
      }
      /* ガスが回る */
      P.forEach(function (p) {
        var before = stage(p);
        p.m.heat = clamp(p.m.heat + (4 + env.dose * 0.1 + rng() * 4) * p.sens, 0, 100);
        p.m.reason = clamp(p.m.reason - (3 + p.m.heat * 0.13 - (p.stats.gaman || 3) * 0.7 - p.tr.cp * 2), 0, 100);
        var after = stage(p);
        if (after > before) ST.sayB(S, { actors: [p], tag: ['', '火照り', '発情', '限界'][after], text: ST.fmt(ST.pick(S, LK.GAS[after]), { a: p.name, b: p.o.name }), why: p.name + 'の発情 ' + Math.round(p.m.heat) + '・理性 ' + Math.round(p.m.reason) + '（我慢 ' + p.stats.gaman + '）', mag: after * 6 }, p.name + 'の発情が進んだ', after >= 3);
      });
      /* 敵視（hate-kit.js）：狭いロッカーの中で、一方が近づき、一方が嫌悪する */
      if (HK.HateKit && rng() < 0.3) {
        if (!S.ties) S.ties = input.ties || [];
        var HKt = HK.HateKit, hp = HKt.pairs(S, [A, B])[0];
        if (hp) {
          var hr = hp.st === 'love' ? HKt.loveGap(S, hp.a, hp.b, ST.fmt(ST.pick(S, LK_HATE_LEAD), { a: hp.a.name, b: hp.b.name })) : hp.st === 'hate' ? HKt.quarrel(S, hp.a, hp.b) : HKt.style(hp.a) === 'active' ? HKt.harass(S, hp.a, hp.b) : HKt.snub(S, hp.a, hp.b);
          /* 嫌悪している側は、理性で踏みとどまる。近づいた側は、拒まれて熱を持て余す */
          hp.a.m.reason = clamp(hp.a.m.reason + 6, 0, 100);
          if (hp.st === 'love') hp.b.m.heat = clamp(hp.b.m.heat + 4, 0, 100);
          ST.sayB(S, { actors: [hp.a, hp.b], tag: hp.st === 'love' ? '片恋と嫌悪' : '敵視', text: hr.text, why: hr.why + '（' + hp.a.name + 'の理性 +6）' }, hp.a.name + 'と' + hp.b.name + 'が揉めた');
        }
      }
      /* 手を出す */
      var lewdNow = false;
      var order = rng() < 0.5 ? [A, B] : [B, A];
      for (var k = 0; k < 2; k++) {
        var a = order[k], b = a.o;
        var urge = (a.goal && a.goal.id === 'want' ? 0.12 : a.goal && a.goal.id === 'out' ? -0.08 : 0) + (a.action && a.action.id === 'flow' ? 0.08 : a.action && a.action.id === 'solve' ? -0.06 : 0) + a.m.heat / 100 + a.tr.impulse * 0.35 + a.tr.fc * 0.15 - a.m.reason / 130 - a.tr.cp * 0.12 + (plotter === a ? 0.45 : 0) + ({ lover: 0.15, fwb: 0.2, almost: 0.1, crush: crusher === a ? 0.2 : 0, tension: -0.1 }[rel] || 0) + (fwbAll && rel !== 'fwb' ? 0.2 : 0) + (crusher === a && rel !== 'crush' ? 0.15 : 0);
        /* 従者は主に手を出さないよう耐える */
        if (servant === a && plotter !== a) {
          var order2 = !clash && !a.ordered && master.m.heat > 70 && master.tr.cp + master.tr.fc > 0.8 && rng() < 0.5;
          if (order2) { a.ordered = true; a.m.reason = 0; ST.sayB(S, { actors: [a, b], tag: '主の許し', text: ST.fmt(ST.pick(S, LK.SERVANT.order), { a: a.name, b: b.name }), why: '主の' + b.name + 'も発情していた（' + Math.round(b.m.heat) + '）', mag: 26 }, b.name + 'が許しを与えた', true); urge += 0.6; }
          else if (urge > 0.4 && a.m.reason > 8 + a.tr.ac * 10) {
            a.cnt.hold++; a.m.reason = clamp(a.m.reason - 6, 0, 100);
            if (a.cnt.hold <= 2) ST.sayB(S, { actors: [a, b], tag: '耐える従者', text: ST.fmt(ST.pick(S, LK.SERVANT.hold), { a: a.name, b: b.name }), why: '主への忠誠（CP・理性 ' + Math.round(a.m.reason) + '）', mag: 20 }, a.name + 'は耐えた', a.cnt.hold === 1);
            continue;
          } else if (urge > 0.4 && clash) { holdClash(a, b); continue; }
          else if (urge > 0.4 && !a.broke) { a.broke = true; ST.key(S, ST.sayB(S, { actors: [a, b], tag: '理性が切れた', text: ST.fmt(ST.pick(S, LK.SERVANT.break.filter(function (l) { return !hardTop(b) || !/押しつけ/.test(l); })), { a: a.name, b: b.name }), why: a.name + 'の理性が尽きた（耐えた回数 ' + a.cnt.hold + '）', mag: 34 }, '', true), a.name + 'が主に手を出した'); urge += 0.3; }
        }
        /* 片方だけ発情 */
        if (a.m.heat >= 70 && b.m.heat < 40 && urge > 0.5 && rng() < 0.6) {
          var kind = b.tr.np > 0.6 ? 'give' : b.m.heat > 25 || b.tr.fc > 0.6 ? 'tempted' : 'help';
          /* 手で楽にするのは、体の関係になれる二人で、楽にされる側が自分で攻めを選んだ人でないときだけ */
          if (kind === 'give' && (clash || hardTop(a))) kind = 'help';
          if (kind === 'tempted') b.m.heat = clamp(b.m.heat + 15, 0, 100);
          var tt = ST.fmt(ST.pick(S, LK.ONE[kind]), { a: a.name, b: b.name });
          if (kind === 'give') { a.m.plea += 50; if (a.m.plea >= 100) tt = climax(a, tt); pair.acts++; lewdNow = true; }
          ST.sayB(S, { actors: [a, b], tag: { help: 'なだめる', give: '手で楽に', tempted: 'つられる' }[kind], text: tt, why: a.name + 'だけが発情していた（' + Math.round(a.m.heat) + ' 対 ' + Math.round(b.m.heat) + '）／' + b.name + 'の' + (kind === 'give' ? 'NP' : kind === 'tempted' ? '揺らぎ' : '冷静さ'), mag: 18 }, b.name + 'が' + a.name + 'を' + { help: 'なだめた', give: '手で楽にした', tempted: 'つられかけた' }[kind]);
          continue;
        }
        /* 恋愛相手を別に決めている人は、ほとんど手を出さない */
        if (a.lock != null && a.lock !== b.i) { urge -= 0.45; if (urge > 0.3 && !a.lockSaid) { a.lockSaid = true; ST.sayB(S, { actors: [a, b], tag: '心に決めた人', text: ST.fmt(ST.pick(S, LK.LOCKED || ['{a}は{b}の肩を押し返した。「……ごめん。心に決めた人がいるから」']), { a: a.name, b: b.name }), why: a.name + 'は恋愛の相手を決めている（' + b.name + 'ではない）', mag: 18 }); continue; } }
        if (urge < 0.36 + rng() * 0.3) continue;
        /* 受け攻め：向きの決まらない二人は、手を出さずに耐える */
        if (clash) { holdClash(a, b); continue; }
        /* どこまでするか */
        /* セフレや恋人は、段階を飛ばしやすい（慣れた相手） */
        var lv = Math.min(pair.level + (intimate && pair.level >= 0 && rng() < 0.5 ? 2 : 1), LK.MAXLV || 4);
        if (!canHands(a) && !canHands(b) && lv >= 2) {
          var nm = Pos ? Pos.order(a, b, [a, b]) : [a, b];
          ST.sayB(S, { actors: [a, b], tag: '生殺し', text: ST.fmt(ST.pick(S, LK.NAMA), { a: nm[0].name, b: nm[1].name }) + (V && V.EDGE && V.EDGE[a.persona] ? a.name + '「' + ST.pick(S, V.EDGE[a.persona]) + '」' : ''), why: '二人とも拘束されたまま発情（' + Math.round(a.m.heat) + '・' + Math.round(b.m.heat) + '）', mag: 24 }, '二人は生殺し');
          a.m.plea = clamp(a.m.plea + 20, 0, 95); b.m.plea = clamp(b.m.plea + 20, 0, 95); lewdNow = true;
          continue;
        }
        var act = LK.ACT[LV[lv]];
        a.cnt.make++;
        var w = b.m.heat / 100 + ({ lover: 0.5, fwb: 0.45, almost: 0.3, crush: crusher === b ? 0.45 : -0.05, friend: 0, tension: -0.3, ex: 0.05, stranger: -0.1, master: servant === b ? 0.35 : 0.2 }[rel] || 0) + b.tr.np * 0.15 + b.tr.ac * 0.1 - b.tr.cp * 0.25 - b.m.reason / 160 + (plotter === b ? 0.8 : 0) + (fwbAll && rel !== 'fwb' ? 0.35 : 0) + (fcKind === 'mutual' ? 0.2 : 0) + (crusher === b && rel !== 'crush' ? 0.2 : 0) + (rng() - 0.5) * 0.3;
        if (b.lock != null && b.lock !== a.i) w -= 0.5;
        var resp = w > 0.55 ? 'accept' : w > 0.32 ? 'passive' : 'refuse';
        /* 受け攻め：挿入では、仕掛けた側が攻めか受けかで書き分ける */
        var aTop = !Pos || Pos.order(a, b, LV[lv] === 'sex' ? Pos.fbFor(a, b) : [a, b])[0] === a;
        /* 仕掛けたのが受けの側で、相手が「自分で攻めを選んだ人」・女性どうし・手の使えない攻め（挿入）のときは、
           受けは誘うだけにして、そこから先は攻めが動く（攻めを受け身にしない／拘束された攻めに跨らない） */
        var swap = R18 && !aTop && ((lv >= 2 && (hardTop(b) || ff)) || (lv === 4 && b.bound) || (hardTop(b) && b.bound));
        var ax = swap ? b : a, bx = swap ? a : b, axTop = swap || aTop;   /* 実際に動く側・受ける側 */
        var FFA = ff && LK.FF_ACT && LK.FF_ACT[LV[lv]];
        var actPool = FFA ? (ax.bound ? FFA.bound : FFA.t) : LV[lv] === 'sex' ? (ax.bound ? (axTop ? act.boundTop : act.bound) : (axTop ? act.t : act.ride)) : (ax.bound ? act.bound : act.t);
        /* ノリノリの受けは、自分から跨る・誘う（相手が拘束されていないときだけ） */
        var noriAct = !swap && !FFA && LV[lv] === 'sex' && !aTop && !b.bound && Pos && Pos.nori(a) && rng() < 0.6 && (a.bound ? act.noriBound : act.nori);
        if (noriAct) actPool = noriAct;
        var vA = { a: ax.name, b: bx.name }, vT = { a: a.name, b: b.name };
        var t = swap ? ST.fmt(ST.pick(S, LK.TEMPT), vT) : ST.fmt(ST.pick(S, actPool), vA);
        if (resp === 'refuse') {
          b.cnt.refuse++; a.m.reason = clamp(a.m.reason + 6, 0, 100);
          t += ST.fmt(ST.pick(S, LK.REFUSE), { a: a.name, b: b.name }) + (rng() < 0.7 ? say2(b, LK.REFUSE_SAY) : '');
          if (b.cnt.refuse >= 2 && lv >= 2) pair.refusedHard = true;
          ST.sayB(S, { actors: [a, b], tag: '嗜めた', text: t, why: a.name + 'が「' + actLabel(lv) + '」を仕掛けた（発情 ' + Math.round(a.m.heat) + '）／' + b.name + 'は嗜めた（理性 ' + Math.round(b.m.reason) + '・CP）', mag: 18 }, b.name + 'が嗜めた', pair.acts === 0);
          continue;
        }
        b.cnt.accept++; pair.level = lv; pair.acts++; lewdNow = true;
        if (swap) t += ST.fmt(ST.pick(S, LK.TAKE[b.bound ? 'bound' : 'free']), vT) + ST.fmt(ST.pick(S, actPool), vA);
        else t += ST.fmt(ST.pick(S, (resp === 'accept' ? LK.ACCEPT : LK.PASSIVE).filter(function (x) { return (aTop && !ff) || !/受け入れ/.test(x); })), { a: a.name, b: b.name }) + (resp === 'accept' && rng() < 0.6 ? say2(b, LK.ACCEPT_SAY) : '');
        var gain = [15, 20, 30, 40, 50][lv];
        ax.m.plea += gain * ax.sens * 0.8; bx.m.plea += gain * bx.sens;
        a.m.heat = clamp(a.m.heat + 4, 0, 100); b.m.heat = clamp(b.m.heat + 8, 0, 100);
        /* 焦らしの文は、攻め（動く側）を {a} に */
        var tp = axTop ? ax : bx;
        if (lv === 4) { pair.sexIn = true; t += ST.fmt(ST.pick(S, ff && LK.FF_ACT ? LK.FF_ACT.tease : LK.TEASE), { a: tp.name, b: tp.o.name }); }
        /* セフレで片想い：いつもの体なのに、想う側の心だけが違う */
        if (lv >= 3 && fcKind && LK.FC && !pair.fcShown) { pair.fcShown = true; t += ST.fmt(ST.pick(S, LK.FC.inside[fcKind]), { c: crusher.name, o: crusher.o.name }); }
        if (lew === 'low' && lv >= 3) t = ST.fmt(ST.pick(S, actPool), vA).replace(/。.*$/, '。') + '――その先は、ロッカーの扉の隙間からも見えなかった。';
        /* 自分で攻めを選んだ人は、相手に「イかされる」側にしない */
        if (bx.m.plea >= 100) { if (hardTop(bx)) bx.m.plea = 95; else t = climax(bx, t); }
        if (ax.m.plea >= 100) t = climax(ax, t);
        /* キスで開く扉 */
        var G = gimmicks[gi];
        if (G && G.lewd && lv >= 1) { prog = 100; t += ST.fmt(ST.pick(S, G.ok), { a: a.name, b: b.name }); }
        var o2 = ST.sayB(S, { actors: [a, b], tag: actLabel(lv), text: t, why: a.name + 'が「' + actLabel(lv) + '」を仕掛けた（発情 ' + Math.round(a.m.heat) + '）／' + b.name + 'は' + (swap ? '誘いに乗って、自分から動いた（' + (hardTop(b) ? '攻め' : '動く側') + '）' : resp === 'accept' ? '乗った' : '流された') + '（関係：' + REL_LABEL[rel] + '・' + b.name + 'の発情 ' + Math.round(b.m.heat) + '）', mag: 18 + lv * 5, kind: 'climax' }, a.name + '→' + b.name + '：' + actLabel(lv), lv >= 3 || pair.acts === 1);
        if (o2 && pair.acts === 1) ST.key(S, o2, '最初に手を出したのは' + a.name);
        if (o2 && lv === 4 && !pair.keySex) { pair.keySex = true; ST.key(S, o2, ff ? 'ロッカーの中で肌を重ねた' : 'ロッカーの中で繋がった'); }
      }
      /* 仕掛けを解く */
      var G2 = gimmicks[gi];
      if (G2 && prog < 100) {
        var workers = P.filter(function (p) { return p !== plotter && p.m.reason > 10 && !(G2.bind ? false : p.bound); });
        if (plotter && (plotter.sabotage || 0) < 2 && rng() < 0.4) {
          ST.sayB(S, { actors: [plotter], tag: '細工', text: ST.fmt(ST.pick(S, LK.PLOT.hide[G2.id] || LK.PLOT.hide.code), { a: plotter.name, b: plotter.o.name }), why: plotter.name + 'は脱出したくない', mag: 16 }, plotter.name + 'は仕掛けを妨害した');
          prog = Math.max(0, prog - 15); plotter.sabotage = (plotter.sabotage || 0) + 1;
        }
        if (workers.length && !G2.lewd) {
          var wk = workers.slice().sort(function (x, y) { return (y.stats.dex * G2.dex + y.tr.a * 5 * G2.brain) - (x.stats.dex * G2.dex + x.tr.a * 5 * G2.brain); })[0];
          var pw = 10 + (wk.stats.dex || 3) * 6 * G2.dex + wk.tr.a * 30 * G2.brain + rng() * 28 + workers.length * 6 - G2.diff * 0.25 - env.diff * 0.2 - (lewdNow ? 14 : 0) - wk.m.heat * 0.12;
          prog = clamp(prog + Math.max(4, pw), 0, 100);
          var ok = prog >= 100;
          ST.sayB(S, { actors: [wk], tag: G2.name, text: ST.fmt(ST.pick(S, G2.try), { a: wk.name, b: wk.o.name }) + ST.fmt(ST.pick(S, ok ? G2.ok : G2.ng), { a: wk.name, b: wk.o.name }), why: '進み具合 ' + Math.round(prog) + '％（' + wk.name + 'の器用さ ' + wk.stats.dex + (G2.brain > 0.5 ? '・A' : '') + (lewdNow ? '・いちゃついていて集中できない' : '') + '）', mag: ok ? 22 : 10 }, wk.name + '：' + G2.name + ' ' + Math.round(prog) + '％', ok);
          if (ok) wk.cnt.solve++;
        } else if (G2.lewd && rng() < 0.05 + (A.m.heat + B.m.heat) / 450 + ({ lover: 0.3, fwb: 0.25, almost: 0.2, tension: -0.15 }[rel] || 0)) {
          prog = 100;
          ST.sayB(S, { actors: [A, B], tag: G2.name, text: ST.fmt(ST.pick(S, LK.KISS_OK), v0), why: '脱出のためにキスをした（発情 ' + Math.round(A.m.heat) + '・' + Math.round(B.m.heat) + '）', mag: 24 }, '', true);
        } else if (G2.lewd && rng() < 0.3) {
          ST.sayB(S, { actors: [A, B], tag: G2.name, text: ST.fmt(ST.pick(S, G2.try), v0) + ST.fmt(ST.pick(S, G2.ng), v0), why: 'キスしないと開かない' }, 'キスの扉は開かないまま');
        }
      }
      if (prog >= 100) {
        if (G2 && G2.bind) { P.forEach(function (p) { p.bound = false; }); }
        gi++; prog = 0;
        if (gi >= gimmicks.length) { escaped = true; escTurn = turn; how = 'solve'; }
      }
      /* 外からの幸運 */
      if (!escaped && turn >= 2 && rng() < 0.005 + ((A.stats.luck || 3) + (B.stats.luck || 3)) * 0.0035) {
        escaped = true; escTurn = turn; how = 'luck';
        ST.sayB(S, { actors: [A, B], tag: '幸運', text: ST.pick(S, LK.OUTSIDE), why: '二人の運（' + A.stats.luck + '・' + B.stats.luck + '）' }, '', true);
      }
      P.forEach(function (p) { p.m.esc = Math.round((gi + prog / 100) / gimmicks.length * 100); p.m.plea = clamp(p.m.plea, 0, 100); });
      ST.flushShort(S, 'ほかに：');
      if (S.log.length === logAt) ST.say(S, { kind: 'phase', actors: [A.i, B.i], text: ST.fmt(ST.pick(S, LK.QUIET), rng() < 0.5 ? v0 : { a: B.name, b: A.name }) });
      ST.snap(S, keys);
    }
    if (!escaped) { how = 'timeout'; escTurn = env.turns; }

    /* ---------- 脱出のあと ---------- */
    ST.step(S, how === 'timeout' ? '時間切れ' : '脱出');
    ST.budget(S, 6);
    var both = A.m.heat >= 60 && B.m.heat >= 60;
    var plotOk = plotter && plotter.o.m.heat >= 50 && plotter.o.cnt.refuse <= 1;
    var bed = (both && A.m.heat + B.m.heat >= 140 && (A.cnt.accept + B.cnt.accept >= 1 || (A.m.heat >= 85 && B.m.heat >= 85)) && !pair.refusedHard && rng() < 0.85) || (plotter && plotOk && rng() < 0.8);
    if (bed && !plotter && Math.max(A.m.reason, B.m.reason) > 18 && (A.tr.cp + B.tr.cp) / 2 + rng() * 0.6 > 0.75) bed = false;
    if (servant && servant.cnt.hold >= 2 && !servant.broke && master.m.heat < 70) bed = false;
    /* 向きの決まらない二人は、ベッドを前にしても一線を越えない（耐え抜く展開に） */
    var endure = bed && clash;
    if (endure) bed = false;
    var outcome, bedLabels = [];
    if (bed) {
      outcome = 'bed';
      var x = plotter || (A.cnt.make >= B.cnt.make ? A : B), y = x.o;
      /* 受け攻め：ベッドでは攻めを {a} に（ロッカーの中と同じ向き） */
      if (HK.Pos && HK.Pos.order(x, y, [x, y])[0] !== x) { y = x; x = x.o; }
      var vv = { a: x.name, b: y.name };
      var tone = rel === 'tension' || rel === 'ex' ? 'rough' : rel === 'lover' || rel === 'almost' || rel === 'crush' ? 'sweet' : rng() < 0.5 ? 'rough' : 'sweet';
      /* ベッドの展開は solo-locker-bed.js（誘い方・最中の展開・結び） */
      bedLabels = LK.bed(S, { A: A, B: B, x: x, y: y, rel: rel, tone: tone, how: how, plotter: plotter, servant: servant, master: master, lew: lew, dose: env.dose, pair: pair, moan: moan, REL_LABEL: REL_LABEL, ff: ff });
      A.cnt.climax += 2 + rng.int(3); B.cnt.climax += 2 + rng.int(3);
    } else if (endure) {
      outcome = 'endure';
      /* 理性の残っていた方が、性格に合わせたやり方で二人を引き離す */
      var ke = A.m.reason >= B.m.reason ? A : B, tye = clashType(ke);
      ST.key(S, ST.say(S, { actors: [A, B], tag: '耐え抜いた', text: (how === 'timeout' ? LK.BED.timeout[0].replace(/そこには、大きなベッドが置かれていた。$/, '') : '') + ST.fmt(ST.pick(S, LK.CLASH.bed[tye]), { a: ke.name, b: ke.o.name }), why: '二人とも発情していた（' + Math.round(A.m.heat) + '・' + Math.round(B.m.heat) + '）が、受け攻めの向きが合わない二人なので、ベッドには行かなかった（' + ke.name + 'の理性 ' + Math.round(ke.m.reason) + '）', mag: 30 }), '結末');
    } else {
      outcome = how === 'timeout' ? 'rescue' : plotter && !plotOk ? 'plotfail' : pair.refusedHard && pair.acts >= 1 ? 'angry' : pair.acts >= 1 ? 'awkward' : (A.cnt.make + B.cnt.make) > 0 || (clash && A.cnt.hold + B.cnt.hold > 0) ? 'near' : 'clean';
      var who0 = outcome === 'angry' ? (A.cnt.refuse >= B.cnt.refuse ? B : A) : outcome === 'plotfail' ? plotter : outcome === 'near' ? (A.cnt.make + A.cnt.hold >= B.cnt.make + B.cnt.hold ? A : B) : A;
      var aft = LK.AFTER[outcome].filter(function (l) { return A.cnt.refuse + B.cnt.refuse > 0 || !/嗜め/.test(l); });
      ST.key(S, ST.say(S, { actors: [A, B], tag: { clean: '無事に脱出', near: '踏みとどまった', awkward: '気まずい脱出', angry: '怒りの脱出', plotfail: '計画失敗', rescue: '時間切れ' }[outcome], text: ST.fmt(ST.pick(S, aft.length ? aft : LK.AFTER[outcome]), { a: who0.name, b: who0.o.name }), why: '手を出した回数 ' + pair.acts + '・嗜めた回数 ' + (A.cnt.refuse + B.cnt.refuse) + '・発情 ' + Math.round(A.m.heat) + '／' + Math.round(B.m.heat), mag: 30 }), '結末');
    }

    /* ---------- 結末 ---------- */
    P.forEach(function (p) {
      var f;
      if (plotter === p) f = outcome === 'bed' ? '相手をモノにした' : '計画が空回りした';
      else if (servant === p) f = p.broke ? '主に手を出してしまった' : p.ordered ? '主の許しで身を委ねた' : p.cnt.hold ? '主に手を出さず耐えきった' : '主に身を委ねた';
      else if (clash && (p.cnt.hold || outcome === 'endure')) f = '触れずに耐え抜いた';
      else if (p.cnt.make >= 2 && p.cnt.make === p.o.cnt.make && p.o !== plotter && p.o !== servant) f = '一緒に堕ちた';
      else if (p.cnt.make >= 2 && p.cnt.make > p.o.cnt.make) f = '先に堕ちた';
      else if (p.cnt.refuse >= 2 && outcome !== 'bed') f = '最後まで嗜めた';
      else if (p.cnt.accept >= 1) f = '流された';
      else f = p.m.reason > 30 ? '理性を保ちきった' : 'ぎりぎりで踏みとどまった';
      p.fate = f + (outcome === 'bed' ? '・ベッドで激しく' : '');
      p.notes.push('発情 ' + Math.round(p.m.heat) + '・理性 ' + Math.round(p.m.reason) + '・絶頂 ' + p.cnt.climax + '回');
      p.notes.push('仕掛けた ' + p.cnt.make + '回・応じた ' + p.cnt.accept + '回・嗜めた ' + p.cnt.refuse + '回' + (p.cnt.hold ? '・耐えた ' + p.cnt.hold + '回' : '') + (p.cnt.solve ? '・仕掛けを解いた ' + p.cnt.solve + '回' : ''));
    });
    var mins = (escTurn + 1) * 5;
    var title = { bed: (how === 'timeout' ? '時間切れで扉が開いたが、' : mins + '分で脱出したが、') + '二人は部屋を出ずにベッドへ直行した。', clean: mins + '分で無事に脱出。何も起きなかった。', near: mins + '分で脱出。危ない瞬間はあったが、二人は踏みとどまった。', awkward: mins + '分で脱出。ロッカーの中のことは、ガスのせいにした。', angry: mins + '分で脱出。' + (A.cnt.refuse >= B.cnt.refuse ? A.name : B.name) + 'の怒りは収まらなかった。', plotfail: mins + '分で脱出。' + (plotter ? plotter.name : '') + 'の計画は空回りした。', rescue: '制限時間内に脱出できず、扉は時間切れで開いた。', endure: (how === 'timeout' ? '時間切れで扉が開いた。' : mins + '分で脱出。') + '目の前のベッドには目もくれず、二人は媚薬が抜けるまで耐え抜いた。' }[outcome];
    var lines = P.map(function (p) { return p.name + '：' + p.fate; });
    lines.push('仕掛け：' + gimmicks.map(function (g, i) { return g.name + (i < gi ? '（解除）' : ''); }).join('→') + (how === 'luck' ? '（外から開いた）' : ''));
    if (pair.level >= 0) lines.push('ロッカーの中でいちばん進んだのは「' + actLabel(pair.level) + '」');
    if (bedLabels.length) lines.push('ベッドでは：' + bedLabels.join('→'));
    if (fcKind && LK.FC) lines.push(ST.fmt(ST.pick(S, LK.FC.end[fcKind]), { c: crusher.name, o: crusher.o.name }));
    var rows = P.map(function (p) { return { i: p.i, rank: '', cells: [Math.round(p.m.heat) + '', Math.round(p.m.reason) + '', String(p.cnt.make), String(p.cnt.refuse), String(p.cnt.climax), String(p.cnt.solve), p.fate] }; });
    return ST.result(S, input, {
      ending: { title: title, kind: outcome === 'clean' ? 'ok' : 'over', lines: lines },
      estats: [['脱出まで', how === 'timeout' ? '時間切れ' : mins + '分'], ['関係', REL_LABEL[rel]], ['受け入れた', pair.acts + '回'], ['絶頂', (A.cnt.climax + B.cnt.climax) + '回']],
      table: { title: '二人の状態', hint: '発情が高く理性が低いほど手を出しやすい。乗るか嗜めるかは関係と性格しだい。', cols: ['発情', '理性', '仕掛けた', '嗜めた', '絶頂', '解いた', '結末'], rows: rows },
      meters: [{ label: '発情', color: '--love' }, { label: '理性', color: '--accent' }, { label: '快感', color: '--pine', dash: true }, { label: '脱出', color: '--partner', dash: true }],
      meta: REL_LABEL[rel] + '・拘束' + { both: 'あり', one: '片方', none: 'なし' }[bind] + '・媚薬' + env.dose,
      summary: '媚薬ロッカー：' + title
    });
  }
})();
