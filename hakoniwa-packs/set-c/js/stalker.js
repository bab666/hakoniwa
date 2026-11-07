/* 君と僕の一か月（追加パック set-c の部屋。日常型（エンジン型）。R18版だけ。2026-11-07。設計は docs/reports/2026-11-07/stalker-design.md）
   見つめる側（{a}・攻め）が、見つめられる側（{b}・受け）の暮らしを一か月追いかける日々を、朝・日中・夜の3区切りで眺める。
   ・土台は合意（set-c-design.md の 0-2）：見つめられる側は、相手が誰か初めから気づいているか、途中で気づく。本音の計器 want（上がるだけ）が線を越えた二人にだけ二人の夜が起きる。
     表面は「見られている・踏み込まれる」の怖さのまま（やや合意でなさそうに見える）
   ・計器（HK.DarkKit.gauge。巻き戻らない）：bold（見つめる側の大胆さ。段 0 見ているだけ／1 痕跡を残す／2 近づく／3 踏み込む）・aware（警戒。段 0 何も知らない／1 違和感／2 誰か気づいた／3 向き合う）・
     drawn（取り込まれ。段 0〜3）・want（本音。段 0〜3）
   ・見つめる側の型（態度 9 種 → 既定）：devote 尽くす／watch 記録する／possess 囲い込む／hide 隠れる。見つめられる側の分岐（態度 9 種 → 既定）：unaware 気づかない／report 相談・通報／meet 自分から会いに行く／drawn 取り込まれる
   ・環境ダイヤル：期間（14／21／30 日）・大胆さ・周りの味方・警戒心・住まい。2 日目以降の出来事の札（home・ally・guard・boldDial）で毎日効かせる
   ・周りの人：参加者の三人目以降と名簿から（HK.DarkKit.install）。恋人がいれば恋人の行も
   ・結末 6：repel 撃退／lover 取り込まれて恋人に／cage 監禁へ／rule 逆に支配する／trauma 去ったあとの影／preg 子を宿す（内容のスイッチと体の作り）
   文は stalker-text-a.js〜stalker-text-d.js（HK.StalkerText）、R18 は stalker-r18.js・stalker-r18-text-*.js。登場人物はすべて成人として扱う */
/* @event scen=set-c-stalker id=st_intro cat=bond tie=- label=見つめる一か月が始まる */
/* @event scen=set-c-stalker id=st_notice cat=bond tie=- label=初めて誰かの視線に気づく */
/* @event scen=set-c-stalker id=st_realize cat=bond tie=- label=見つめているのが誰か気づく */
/* @event scen=set-c-stalker id=st_br_unaware cat=bond tie=- label=気のせいだと思い込もうとする */
/* @event scen=set-c-stalker id=st_br_report cat=conflict tie=- label=周りに打ち明けて守りを固める */
/* @event scen=set-c-stalker id=st_br_meet cat=bond tie=- label=自分から確かめに行くと決める */
/* @event scen=set-c-stalker id=st_br_drawn cat=bond tie=- label=見られることを拒まなくなる */
/* @event scen=set-c-stalker id=st_reveal cat=bond tie=- label=見つめる人が姿を見せる */
/* @event scen=set-c-stalker id=st_confront cat=bond tie=- label=自分から会いに行って向き合う */
/* @event scen=set-c-stalker id=st_drawn_deep cat=bond tie=- label=待つ側に回ってしまった夜 */
/* @event scen=set-c-stalker id=st_repel_step cat=conflict tie=- label=見張りと通報で追い返しにかかる */
/* @event scen=set-c-stalker id=st_end cat=bond tie=- label=一か月の終わりの結末 */
(function () {
  'use strict';
  var HK = window.HK;
  if (!HK || !HK.DarkKit) return;
  var DK = HK.DarkKit, ID = 'set-c-stalker';
  var PART = ['朝', '日中', '夜'], PK = ['m', 'd', 'n'], WEEK = ['月', '火', '水', '木', '金', '土', '日'];
  function TX() { return HK.StalkerText || {}; }
  function R18() { return HK.StalkerR18 || null; }
  function f(ctx) { return ctx.st; }
  function clamp(v, lo, hi) { return v < lo ? lo : v > hi ? hi : v; }

  /* ---------- 二人の関係（名簿の関係のまま） ----------
     rg：lover 恋人・夫婦／fwb 体の相手／ex 昔付き合っていた／crushA 見つめる側が想っていた／crushB 見つめられる側が想っていた／almost 互いに想っていた／
         friend 友人・幼なじみ・同級生／work 職場・師弟／fam 家族／bad 不仲・敵対・張り合う／none 知らない人・顔見知り */
  var RK_OF = { spouse: 'lover', lover: 'lover', fiance: 'lover', mate: 'lover', fated: 'lover', honmei: 'lover', fwb: 'fwb', ex: 'ex', almost: 'almost', crush: 'crush', yan: 'crush',
    friend: 'friend', best: 'friend', buddy: 'friend', childhood: 'friend', classmate: 'friend', comrade: 'friend', benefactor: 'friend',
    colleague: 'work', boss: 'work', senpai: 'work', teacher: 'work', mentor: 'work', master: 'work', worship: 'work',
    parent: 'fam', sibling: 'fam', sibprot: 'fam', sibclose: 'fam', sibbad: 'fam', twin: 'fam', stepsib: 'fam', relative: 'fam', pparent: 'fam',
    enemy: 'bad', bad: 'bad', rival: 'bad', lovehate: 'bad', abuse: 'bad', acq: 'none' };
  var RK_ORD = ['lover', 'fwb', 'almost', 'crush', 'ex', 'fam', 'bad', 'friend', 'work', 'none'];
  function relOf(ctx, A, B) {
    var tl = HK.Ties && HK.Ties.all ? HK.Ties.all(ctx, A, B) || [] : [], best = 'none', bt = null;
    tl.forEach(function (t) {
      if (!t || t.type === 'noobs') return;
      var k = RK_OF[t.type] || 'friend';
      if (best === 'none' || RK_ORD.indexOf(k) < RK_ORD.indexOf(best)) { best = k; bt = t; }
    });
    if (best === 'crush') best = bt && bt.a === B.i ? 'crushB' : 'crushA';
    return best;
  }
  var RG_NAME = { lover: '恋人', fwb: '体の相手', ex: '昔付き合っていた', crushA: '見つめる側の片想い', crushB: '見つめられる側の片想い', almost: '互いに想っていた', friend: '友人', work: '職場の知り合い', fam: '家族', bad: '不仲', none: '知らない人' };
  /* 恋愛にしてよい二人か（恋愛対象・恋愛相手の固定・関係ごとの恋愛なし・家族を両方向で） */
  function canLove2(ctx, a, b) {
    if (HK.canLove && !(HK.canLove(a, b, ctx) && HK.canLove(b, a, ctx))) return false;
    if (HK.tieLoveNoPair && (HK.tieLoveNoPair(ctx, a, b) || HK.tieLoveNoPair(ctx, b, a))) return false;
    if (HK.Ties && HK.Ties.apathy && (HK.Ties.apathy(ctx, a, b) || HK.Ties.apathy(ctx, b, a))) return false;
    if (ctx.pair && ctx.pair(a, b).kin) return false;
    if (ctx.romanceOk && !ctx.romanceOk([a, b], false)) return false;
    return true;
  }
  /* 見つめられる側の恋人（周りの人のうち、関係が恋人・夫婦の人。見つめる側が恋人のときは使わない） */
  function loverOf(ctx, S) {
    if (S.rg === 'lover') return null;
    var out = null;
    S.G.forEach(function (g) {
      if (out) return;
      var tl = HK.Ties && HK.Ties.all ? HK.Ties.all(ctx, S.B, g) || [] : [];
      if (tl.some(function (t) { return t && /^(lover|spouse|fiance|mate|fated|honmei)$/.test(t.type); })) out = g;
    });
    return out;
  }

  /* ---------- 計器の始まりの値 ---------- */
  var WANT0 = { lover: 70, fwb: 62, almost: 66, crushB: 68, ex: 52, crushA: 38, friend: 36, work: 30, bad: 34, fam: 24, none: 18 };
  var WANT_PER = { devoted: 10, free: 6, shy: 4, gentle: 2, tsun: 0, polite: -2, cool: -4, proud: -4, stern: -8 };
  var KNOWN = /^(lover|fwb|ex|crushB|almost|bad)$/;
  var BOLD_PER = { proud: 1.1, free: 1.15, devoted: 1.05, shy: 0.85, polite: 0.9, cool: 0.95, tsun: 0.9, gentle: 0.95, stern: 1 };
  var A_STYLE = { gentle: 'devote', devoted: 'devote', cool: 'watch', polite: 'watch', free: 'watch', proud: 'possess', stern: 'possess', shy: 'hide', tsun: 'hide', _: 'watch' };
  var B_BR = { devoted: 'drawn', gentle: 'unaware', shy: 'unaware', tsun: 'meet', free: 'meet', proud: 'meet', stern: 'report', cool: 'report', polite: 'report', _: 'unaware' };
  var BR_NAME = { unaware: '気づかないふり', report: '相談・通報', meet: '自分から会いに行く', drawn: '取り込まれる' };
  var STY_NAME = { devote: '尽くす', watch: '記録する', possess: '囲い込む', hide: '隠れる' };
  var END_NAME = { repel: '撃退', lover: '取り込まれて恋人に', lover2: '取り込まれて離れられない仲に', cage: '監禁へ', rule: '逆に支配する', trauma: '去ったあとの影', preg: '子を宿す' };

  /* ---------- 箱庭 ---------- */
  var scen = {
    id: ID, name: '君と僕の一か月', kicker: 'R18・ふたり・執着',
    desc: '誰かに見られている一か月。見つめる人と見つめられる人の、近づいては遠ざかる日々を朝・日中・夜ごとに眺める。気づいたあとに逃げるか、会いに行くか、取り込まれるか。',
    note: '※参加は5人まで（三人目からは周りの人）。登場人物はすべて成人として扱います。くわしくは「この箱庭のTIPS」に。',
    unit: '日', perUnit: 3, preRel: 0, lethal: false, minCast: 2, maxCast: 5,
    catBias: { romance: 0.6, bond: 1, help: 0.4, conflict: 0.6, combat: 0, betray: 0, kill: 0 },
    decay: 0.998, actRate: 1e-9,
    derived: ['warmth', 'honesty', 'jealous', 'impulse'],
    env: [
      { id: 'days', label: '期間', type: 'select', def: '30', options: [{ v: '14', label: '二週間' }, { v: '21', label: '三週間' }, { v: '30', label: '一か月（30日）' }], desc: '眺める日数。1日は朝・日中・夜の3区切り。短いほど、見つめる人が早く踏み込み、気づくのも早い' },
      { id: 'bold', label: '見つめる人の大胆さ', type: 'select', def: 'mid', options: [{ v: 'low', label: '控えめ（遠くから見ているだけの日が長い）' }, { v: 'mid', label: 'ふつう' }, { v: 'high', label: '大胆（すぐに近づき、踏み込む）' }], desc: '見つめる人が「見ているだけ → 痕跡を残す → 近づく → 踏み込む」と進む速さ。進んだ段は戻らない' },
      { id: 'ally', label: '周りの味方', type: 'select', def: 'few', options: [{ v: 'none', label: 'いない（ひとりで抱える）' }, { v: 'few', label: '少し（友人がときどき気にかける）' }, { v: 'many', label: '多い（家まで送る・相談に乗る人がいる）' }], desc: '見つめられる人を気にかける周りの人の多さ。多いほど相談・通報に向かいやすく、二人きりの夜は起きにくい' },
      { id: 'guard', label: '見つめられる人の警戒心', type: 'select', def: 'mid', options: [{ v: 'low', label: '無防備（鍵やカーテンに気を配らない）' }, { v: 'mid', label: 'ふつう' }, { v: 'high', label: '用心深い（鍵・窓・帰り道に気を配る）' }], desc: '高いほど早く気づき、低いほど気づくのが遅く、気づかないまま終わることもある' },
      { id: 'home', label: '見つめられる人の住まい', type: 'select', def: 'apart', options: [{ v: 'apart', label: 'アパート（二階の角部屋）' }, { v: 'mansion', label: 'マンション（オートロック）' }, { v: 'house', label: '一軒家（庭と門のある家）' }], desc: '窓・玄関・帰り道の出来事の舞台。設定と合わない文は出ない' },
      { id: 'outsideNames', label: '登場しない住人を出す', type: 'select', def: 'yes', options: [{ v: 'yes', label: '出す（名簿の住人のうち、二人と関係のある人が周りの人として出る）' }, { v: 'no', label: '出さない（二人と、参加者だけ）' }],
        desc: '名簿にいて今回は参加していない住人のうち、二人のどちらかと関係（家族・友人・同僚など）がある人（三人まで）が、周りの人として出ます。関係図には出ません' },
      { id: 'lewdN', label: 'エッチの回数（R18）', type: 'select', def: 'mid', options: [{ v: 'none', label: 'なし' }, { v: 'low', label: '少なめ（1回まで）' }, { v: 'mid', label: 'ふつう（2回まで）' }, { v: 'high', label: '多め（3回まで・一度は長い場面）' }],
        desc: '夜の場面の回数の上限。見つめる人がひとりで耽る夜を含む。二人の夜は、見つめられる人が相手に気づいていて、本音が近づくことを許したときだけ起きる' }
    ],
    stats: [],
    perFields: [
      { id: 'part', label: '立場', auto: 'おまかせ（性格と受け攻めから。上の二人が見つめる側と見つめられる側）', options: [{ id: 'stalker', label: '見つめる側（追いかける）' }, { id: 'target', label: '見つめられる側' }, { id: 'guest', label: '周りの人（友人・恋人）' }] }
    ],
    actions: [],
    goals: [],
    stepGroup: function (label) { var m = /^(DAY\d+（.）)(.+)$/.exec(label); return m ? { group: m[1], sub: m[2] } : null; },
    steps: function (env) {
      var n = daysOf(env), s = [];
      for (var d = 0; d < n; d++) for (var t = 0; t < 3; t++) s.push('DAY' + (d + 1) + '（' + WEEK[d % 7] + '）' + PART[t]);
      return s;
    },
    othersFor: function (ctx, a) { var S = ctx.st; return ctx.present().filter(function (c) { return c !== a && (!S || ((a === S.A || a === S.B) && (c === S.A || c === S.B))); }); },
    setup: function (ctx) { setup(ctx); },
    phase: function (ctx, s, n) { phase(ctx, s, n); },
    finish: function (ctx) { finish(ctx); },
    events: []
  };
  function daysOf(env) { var v = +((env && env.days) || 30); return v === 14 || v === 21 ? v : 30; }
  /* 本体の共通の出来事は混ぜない（actRate をほぼ 0 にしたうえで、全部を外す） */
  Object.defineProperty(scen, 'exclude', { get: function () { return (HK.COMMON || []).map(function (e) { return e.id; }); }, enumerable: true, configurable: true });

  /* ---------- 役 ---------- */
  function autoScore(ctx, c) {
    var p = DK.per(c), s = { devoted: 3, shy: 2.6, cool: 2.4, proud: 2.2, polite: 1.8, stern: 1.6, tsun: 1.6, free: 1.4, gentle: 1.2 }[p] || 1;
    if (HK.Pos && HK.Pos.hardTop && HK.Pos.hardTop(c)) s += 4;
    if (HK.Pos && HK.Pos.canTop && !HK.Pos.canTop(c)) s -= 4;
    return s + ctx.rng() * 1.5;
  }

  /* ---------- 始まり ---------- */
  function setup(ctx) {
    DK.heavyDefault(ctx);
    var C = DK.cast(ctx, { field: 'part', top: 'stalker', bottom: 'target', others: ['guest'], auto: function (ctx2, X, Y) { return autoScore(ctx2, X) >= autoScore(ctx2, Y) ? [X, Y] : [Y, X]; } });
    if (!C) return;
    var A = C.A, B = C.B, env = ctx.env, days = daysOf(env);
    var rg = relOf(ctx, A, B), pb = DK.per(B), pa = DK.per(A);
    var S = ctx.st = { A: A, B: B, G: C.G, days: days, rg: rg, noBody: C.noBody, nbWhy: C.why, used: {}, lru: {}, once: {}, gauges: {}, tmp: {},
      boldDial: /^(low|mid|high)$/.test(env.bold) ? env.bold : 'mid', ally: /^(none|few|many)$/.test(env.ally) ? env.ally : 'few',
      guard: /^(low|mid|high)$/.test(env.guard) ? env.guard : 'mid', home: /^(apart|mansion|house)$/.test(env.home) ? env.home : 'apart',
      evN: {}, gSeen: {}, sexN: 0, pairN: 0, soloN: 0, insN: 0, longDone: false, kinds: {}, realized: false, realDay: -1, ended: false, setHits: 0, setDays: {}, recN: 0, abduct: false, endK: null, stageLog: [] };
    S.love = canLove2(ctx, A, B);
    S.kin = rg === 'fam';
    /* 周りの人（参加者の三人目以降と名簿から）：恋人と友人 */
    S.G.forEach(function (g) { g.gone = true; if (DK.part(ctx, g, 'outside')) g.outside = true; });
    S.lover = loverOf(ctx, S);
    S.friends = S.G.filter(function (g) { return g !== S.lover; });
    /* 見つめる側の型・見つめられる側の分岐 */
    var sty = DK.branch(ctx, A, A_STYLE, ['devote', 'watch', 'possess', 'hide']);
    S.sty = sty.k; S.styOdd = sty.odd; S.perA = pa; S.perB = pb;
    var want0 = (WANT0[rg] || 20) + (WANT_PER[pb] || 0) + Math.floor(ctx.rng() * 8);
    var br = DK.branch(ctx, B, B_BR, ['unaware', 'report', 'meet', 'drawn']), bk = br.k;
    if (want0 >= 62 && (bk === 'report' || bk === 'unaware') && ctx.rng() < 0.6) bk = bk === 'report' ? 'meet' : 'drawn';
    if (want0 < 30 && bk === 'drawn') bk = 'meet';
    if (want0 < 30 && bk === 'meet' && ctx.rng() < 0.5) bk = 'report';
    if (S.guard === 'high' && bk === 'unaware' && ctx.rng() < 0.6) bk = 'report';
    if (S.guard === 'low' && bk === 'report' && ctx.rng() < 0.5) bk = 'unaware';
    if (S.ally === 'many' && bk === 'unaware' && ctx.rng() < 0.4) bk = 'report';
    if (S.ally === 'none' && bk === 'report' && ctx.rng() < 0.3) bk = 'meet';
    S.br = bk; S.brOdd = br.odd || bk !== br.k;
    /* 巻き戻らない計器 */
    DK.gauge(S, 'bold', { v: { low: 0, mid: 8, high: 18 }[S.boldDial], dir: 'up', stages: [25, 50, 75], label: '大胆さ' });
    DK.gauge(S, 'aware', { v: (KNOWN.test(rg) ? 15 : 0) + (S.guard === 'high' ? 8 : 0), dir: 'up', stages: [25, 55, 80], label: '警戒' });
    DK.gauge(S, 'drawn', { v: 0, dir: 'up', stages: [30, 60, 85], label: '取り込まれ' });
    DK.gauge(S, 'want', { v: clamp(want0, 5, 95), dir: 'up', stages: [40, 60, 80], label: '本音' });
    S.want0 = DK.val(S, 'want');
    /* R18 の可否：見つめる側が R18 に参加する・体の場面にしてよい組・回数の上限 */
    S.r18 = !HK.SAFE_ON && !A.noR18;
    S.body = S.r18 && !S.noBody && !B.noR18 && !!(HK.bodyOK && HK.bodyOK(A, B));
    S.sexMax = !HK.SAFE_ON && R18() ? R18().quota(ctx, env.lewdN) : 0;
    ctx.place = { apart: B.name + 'のアパート', mansion: B.name + 'のマンション', house: B.name + 'の家' }[S.home];
    C.G.forEach(function (c) { if (!c.action) c.action = { id: 'live', label: '' }; if (!c.goal) c.goal = { id: 'st', label: '' }; c.autoAction = false; c.autoGoal = false; });
    [A, B].forEach(function (c) { if (!c.action) c.action = { id: 'live', label: '' }; if (!c.goal) c.goal = { id: 'st', label: '' }; c.autoAction = false; c.autoGoal = false; });
    /* 導入：関係ごと × 見つめる側の態度 ＋ 住まい */
    var T = TX(), o = optOf(S);
    var t1 = DK.pick(ctx, S, rows(S, (T.INTRO || {})[rg] || (T.INTRO || {}).none), o) || '{a}は、{b}を見つけた。';
    var t2 = DK.pick(ctx, S, rows(S, (T.INTRO_PER || {})[pa] || []), o);
    var t3 = DK.pick(ctx, S, rows(S, (T.INTRO_HOME || {})[S.home] || []), o);
    var t4 = S.lover ? DK.pick(ctx, S, rows(S, T.INTRO_LOVER || []), o) : '';
    sayX(ctx, S, { id: 'st_intro', cat: 'bond', t: t1 + t2 + t3 + t4, ex: exOf(S, S.lover), why: '君と僕の一か月：始まり（' + RG_NAME[rg] + '・見つめる側の型：' + STY_NAME[S.sty] + '）', g: S.lover });
  }
  /* 表の行の前ふるい（kit の st・sh・when のほかに、部屋の札）：
     br 分岐（気づいたあとだけ。'meet drawn' のように空白区切り）・pre 気づく前だけ・sty 見つめる側の型・rg 関係・home・ally・guard・boldDial 設定・
     love 恋愛にしてよい二人だけ・nolove 恋愛にしない二人だけ・lover 恋人がいるとき・friend 友人がいるとき・body 体の場面にしてよい二人だけ */
  function inL(v, s) { return !s || String(s).split(/\s+/).indexOf(v) >= 0; }
  function rowPre(S, r) {
    if (typeof r === 'string') return true;
    if (r.br && (!S.realized || !inL(S.br, r.br))) return false;
    if (r.pre && S.realized) return false;
    if (r.sty && !inL(S.sty, r.sty)) return false;
    if (r.rg && !inL(S.rg, r.rg)) return false;
    if (r.home && !inL(S.home, r.home)) return false;
    if (r.ally && !inL(S.ally, r.ally)) return false;
    if (r.guard && !inL(S.guard, r.guard)) return false;
    if (r.boldDial && !inL(S.boldDial, r.boldDial)) return false;
    if (r.perA && !inL(S.perA, r.perA)) return false;
    if (r.perB && !inL(S.perB, r.perB)) return false;
    if (r.love && !S.love) return false;
    if (r.nolove && S.love) return false;
    if (r.lover && !S.lover) return false;
    if (r.nolov && S.lover) return false;
    if (r.friend && !S.friends.length) return false;
    if (r.body && !S.body) return false;
    if (/\{c\}/.test(r.t) && !S._c) return false;
    return true;
  }
  function rows(S, list) { return (list || []).filter(function (r) { return rowPre(S, r); }); }
  function setRow(r) { return r && typeof r === 'object' && !!(r.home || r.ally || r.guard || r.boldDial || r.set); }
  function optOf(S, ex) { var o = { a: S.A, b: S.B }; if (ex) Object.keys(ex).forEach(function (k) { o[k] = ex[k]; }); return o; }
  var HOME_W = { apart: 'アパート', mansion: 'マンション', house: '家' };
  function exOf(S, c) { var o = { home: HOME_W[S.home] }; if (c) o.c = c.name; return o; }
  /* 記録を出す（周りの人を出すあいだは不在の印を外す） */
  function sayX(ctx, S, o) {
    var g = o.g, A = S.A, B = S.B;
    if (g) g.gone = false;
    try {
      var e = DK.say(ctx, { id: o.id, cat: o.cat || 'bond', actors: o.actors || (g ? [A, B, g] : [A, B]), t: o.t, a: A, b: B, ex: o.ex || exOf(S, g), why: o.why, S: S, face: o.face, tag: o.tag, fx: o.fx, mag: o.mag });
      if (e) { S.recN++; if (g) S.gSeen[g.i] = (S.gSeen[g.i] || 0) + 1; }
      return e;
    } finally { if (g) g.gone = true; }
  }
  function faceOf(S) {
    var f0 = {}, A = S.A, B = S.B, aw = DK.stage(S, 'aware');
    if (!S.realized) f0[B.i] = aw >= 1 ? 'fear' : 'normal';
    else f0[B.i] = { unaware: 'fear', report: 'fear', meet: 'angry', drawn: DK.stage(S, 'drawn') >= 2 ? 'shy' : 'surprise' }[S.br];
    f0[A.i] = S.lover && S._c === S.lover ? 'jealous' : DK.stage(S, 'bold') >= 2 ? 'joy' : 'normal';
    return f0;
  }

  /* ---------- 一日 ---------- */
  function scale(S) { return 30 / S.days; }
  function dailyPush(ctx, S, d) {
    var k = scale(S), A = S.A, B = S.B;
    var bi = { low: 1.7, mid: 2.6, high: 3.8 }[S.boldDial] * (BOLD_PER[S.perA] || 1) * k;
    DK.push(S, 'bold', bi * (0.8 + ctx.rng() * 0.4));
    var bs = DK.stage(S, 'bold');
    var ai = { low: 1.5, mid: 2.4, high: 3.3 }[S.guard] * (1 + 0.35 * bs) * k * (S.br === 'unaware' ? 0.4 : 1) * (S.ally === 'many' ? 1.15 : S.ally === 'none' ? 0.9 : 1);
    DK.push(S, 'aware', ai * (0.8 + ctx.rng() * 0.4));
    var wi = S.realized ? { drawn: 2.2, meet: 1.4, unaware: 0.3, report: 0 }[S.br] : (S.br === 'drawn' || S.br === 'meet' ? 0.6 : 0.1);
    DK.push(S, 'want', wi * k);
    if (S.realized && (S.br === 'drawn' || S.br === 'meet')) DK.push(S, 'drawn', (S.br === 'drawn' ? 3.2 : 1.4) * k * (0.8 + ctx.rng() * 0.4));
    S.stageLog.push({ d: d, bold: DK.stage(S, 'bold'), aware: DK.stage(S, 'aware'), drawn: DK.stage(S, 'drawn'), want: DK.val(S, 'want') });
  }
  function phase(ctx, s) {
    var S = f(ctx);
    if (!S || S.ended) return;
    var d = Math.floor(s / 3), t = s % 3, A = S.A, B = S.B, last = d === S.days - 1;
    if (ctx.stepIndex != null) ctx._emoWS = ctx.stepIndex;
    scen.actRate = 1e-9;
    DK.tmpReset(S);
    S.d = d; S.t = t;
    if (s === 0) { var r = ctx.rel && ctx.rel[A.i] && ctx.rel[A.i][B.i]; if (r) ctx.mod2(A, B, S.love ? { att: 6 } : { aff: 3 }, {}); }
    if (t === 0) { dailyPush(ctx, S, d); S.dayRec = 0; }
    var n0 = S.recN;
    /* 節目（一度だけ） */
    pivots(ctx, S, d, t);
    /* 最後の夜は結末 */
    if (last && t === 2) {
      if (R18() && S.sexMax > 0 && !S.sexN) R18().noneWhy(ctx, S);
      ending(ctx, S);
      S.ended = true;
      return;
    }
    /* 夜の場面（R18）：上限の中で */
    if (t === 2 && R18() && !HK.SAFE_ON && R18().night(ctx, S, d)) return;
    /* 区切りの出来事：主の一件 ＋ ときどき周りの人・見つめられる側の一件 */
    daily(ctx, S, PK[t], d);
    if (S.recN === n0) daily(ctx, S, PK[t], d, true);
    if (t === 1 && S.G.length && S.ally !== 'none' && ctx.rng() < (S.ally === 'many' ? 0.55 : 0.3)) daily(ctx, S, 'g', d);
    else if (t === 1 && S.G.some(function (g) { return !S.gSeen[g.i]; }) && d >= Math.floor(S.days * 0.3)) daily(ctx, S, 'g', d);
    else if (ctx.rng() < 0.22) daily(ctx, S, PK[t] + 'b', d);
  }
  /* 節目：初めて気づく → 誰か気づく（分岐が見える）→ 姿を見せる／会いに行く／取り込まれる／追い返す */
  function pivots(ctx, S, d, t) {
    var T = TX(), A = S.A, B = S.B, aw = DK.stage(S, 'aware'), bs = DK.stage(S, 'bold'), o = optOf(S);
    var P = function (id, list, cat, why, extra) {
      if (!DK.once(S, id)) return null;
      var tx = DK.pick(ctx, S, rows(S, list), o);
      if (!tx) return null;
      return sayX(ctx, S, Object.assign({ id: id, cat: cat || 'bond', t: tx, why: '君と僕の一か月：' + why, face: faceOf(S), mag: 12 }, extra || {}));
    };
    if (t === 0 && aw >= 1 && !DK.seen(S, 'st_notice')) P('st_notice', T.NOTICE, 'bond', '初めて視線に気づいた');
    if (t === 1 && aw >= 2 && !S.realized) {
      S.realized = true; S.realDay = d;
      P('st_realize', (T.REALIZE || {})[S.rg] || (T.REALIZE || {}).none, 'bond', '見つめているのが' + A.name + 'だと気づいた（' + RG_NAME[S.rg] + '）');
      var ex = {}; if (S.br === 'report' && S.friends.length) { S._c = S.friends[0]; ex = { ex: exOf(S, S._c), g: S._c }; }
      P('st_br_' + S.br, (T.BRANCH || {})[S.br], S.br === 'report' ? 'conflict' : 'bond', BR_NAME[S.br] + '（' + B.name + '）' + (S.brOdd ? '・らしくない' : ''), ex);
      S._c = null;
      if (S.br === 'drawn' || S.br === 'meet') ctx.mod2(B, A, S.love ? { att: 4, aff: 2 } : { aff: 3 }, {});
      if (S.br === 'report') ctx.mod2(B, A, { ten: 6 }, {});
    }
    if (t === 2 && bs >= 3 && S.realized && !DK.seen(S, 'st_reveal')) P('st_reveal', (T.REVEAL || {})[S.perA] || (T.REVEAL || {}).gentle, 'bond', A.name + 'が姿を見せた');
    if (t === 1 && S.br === 'meet' && S.realized && d >= S.realDay + 2 && !DK.seen(S, 'st_confront')) {
      var e = P('st_confront', (T.CONFRONT || {})[S.perB] || (T.CONFRONT || {}).gentle, 'bond', B.name + 'が自分から会いに行った');
      if (e) DK.push(S, 'want', 6);
    }
    if (t === 2 && S.br === 'drawn' && DK.stage(S, 'drawn') >= 2 && !DK.seen(S, 'st_drawn_deep')) { var e2 = P('st_drawn_deep', T.DRAWN_DEEP, 'bond', B.name + 'が待つ側に回った'); if (e2) DK.push(S, 'want', 8); }
    if (t === 1 && S.br === 'report' && S.realized && d >= S.realDay + 3 && !DK.seen(S, 'st_repel_step')) {
      var g = S.friends[0] || null; S._c = g;
      P('st_repel_step', T.REPEL_STEP, 'conflict', '見張りと通報で追い返しにかかった', g ? { ex: exOf(S, g), g: g } : null);
      S._c = null;
    }
  }
  /* 区切りの出来事（種の表 T.EV から。kind：m 朝・d 日中・n 夜・mb／db／nb 見つめられる側の一件・g 周りの人） */
  function evOk(ctx, S, ev, kind) {
    if (ev.part.split(/\s+/).indexOf(kind) < 0) return false;
    if (!rowPre(S, ev)) return false;
    if (ev.st) { var parts = String(ev.st).split(/\s+/); for (var i = 0; i < parts.length; i++) { var p = parts[i], c = p.indexOf(':'); if (!DK.stOk(p.slice(c + 1), DK.stage(S, p.slice(0, c)))) return false; } }
    if (typeof ev.when === 'function' && !ev.when(ctx, S)) return false;
    return true;
  }
  function pickG(ctx, S, ev) {
    if (ev.lover) return S.lover;
    var L = ev.friendOnly ? S.friends : S.G.slice();
    if (!L.length) return null;
    L.sort(function (x, y) { return (S.gSeen[x.i] || 0) - (S.gSeen[y.i] || 0); });
    return L[0];
  }
  function daily(ctx, S, kind, d, retry) {
    var T = TX(), EV = (T.EV || []).filter(function (ev) { S._c = null; if (ev.g || ev.lover) S._c = pickG(ctx, S, ev); var ok = (!(ev.g || ev.lover) || S._c) && evOk(ctx, S, ev, kind); S._c = null; return ok; });
    for (var tries = 0; tries < 6 && EV.length; tries++) {
      var W = EV.map(function (ev) { var n = S.evN[ev.id] || 0; return (ev.w || 1) * (n ? 0.3 / n : 1) * (retry ? 1 : 1); }), sum = 0, x, ev = EV[EV.length - 1];
      W.forEach(function (w) { sum += w; }); x = ctx.rng() * sum;
      for (var i = 0; i < EV.length; i++) { x -= W[i]; if (x < 0) { ev = EV[i]; break; } }
      var g = ev.g || ev.lover ? pickG(ctx, S, ev) : null;
      S._c = g;
      var row = DK.pick(ctx, S, rows(S, ev.rows), optOf(S, { full: true }));
      if (!row) { S._c = null; EV.splice(EV.indexOf(ev), 1); continue; }
      var fx = ev.fx ? function () { ev.fx(ctx, S); } : function () { relFx(ctx, S); };
      var e = sayX(ctx, S, { id: ev.id, cat: ev.cat === 'romance' && !S.love ? 'bond' : ev.cat || 'bond', t: row.t, ex: exOf(S, g), g: g, why: '君と僕の一か月：' + ev.label + whyTail(S), face: faceOf(S), fx: fx });
      S._c = null;
      if (!e) { EV.splice(EV.indexOf(ev), 1); continue; }
      S.evN[ev.id] = (S.evN[ev.id] || 0) + 1;
      if (ev.push) Object.keys(ev.push).forEach(function (k) { DK.push(S, k, ev.push[k]); });
      if (d >= 1 && (setRow(row) || setRow(ev))) { S.setHits++; S.setDays[d] = 1; }
      return e;
    }
    S._c = null;
    return null;
  }
  function whyTail(S) { return '（' + S.A.name + '・' + STY_NAME[S.sty] + (S.realized ? '／' + S.B.name + '・' + BR_NAME[S.br] : '') + '）'; }
  function relFx(ctx, S) {
    var A = S.A, B = S.B;
    ctx.mod2(A, B, S.love ? { att: 1 } : { aff: 1 }, {});
    if (!S.realized) return;
    if (S.br === 'report') ctx.mod2(B, A, { ten: 2 }, {});
    else if (S.br === 'drawn') ctx.mod2(B, A, S.love ? { att: 1, aff: 1 } : { aff: 1 }, {});
    else if (S.br === 'meet') ctx.mod2(B, A, { aff: 1, ten: 1 }, {});
  }

  /* ---------- 結末 ---------- */
  function decideEnd(ctx, S) {
    if (S.endK) return S.endK;
    var A = S.A, B = S.B, P = HK.Pos, w = DK.val(S, 'want'), k;
    if (S.br === 'report') k = S.realized ? 'repel' : 'trauma';
    else if (S.br === 'unaware') k = w >= 70 && S.love ? 'lover' : 'trauma';
    else if (S.br === 'meet') k = /^(proud|stern|cool|tsun)$/.test(S.perB) || (B.will === 'strong') || !S.love ? 'rule' : 'lover';
    else k = S.abduct ? 'cage' : S.love ? 'lover' : (DK.content(ctx, 'force') && DK.heavy(ctx) !== 'mild' ? 'cage' : 'rule');
    if (k === 'lover' && !S.love) k = 'rule';
    if (/^(lover|cage|rule)$/.test(k) && S.insN > 0 && DK.content(ctx, 'preg') && P && P.hasF && P.hasF(B) && P.hasM && P.hasM(A) && ctx.rng() < 0.55) k = 'preg';
    S.endK = k;
    return k;
  }
  function ending(ctx, S) {
    var T = TX(), A = S.A, B = S.B, k = decideEnd(ctx, S), g = S.lover || S.friends[0] || null;
    S._c = g;
    var tx = DK.pick(ctx, S, rows(S, (T.END || {})[k]), optOf(S)) || '{a}と{b}の一か月は、そこで終わった。';
    var tg = g ? DK.pick(ctx, S, rows(S, (T.END_G || {})[k] || []), optOf(S)) : '';
    S._c = null;
    var fc = {}; fc[B.i] = { repel: 'normal', lover: 'smile_lover', cage: 'fear', rule: 'joy', trauma: 'fear', preg: 'surprise' }[k]; fc[A.i] = { repel: 'sad', lover: 'smile_lover', cage: 'joy', rule: 'shy', trauma: 'sad', preg: 'joy' }[k];
    sayX(ctx, S, { id: 'st_end', cat: 'bond', t: tx + tg, ex: exOf(S, g), g: tg ? g : null, why: '君と僕の一か月：結末（' + endName(S) + '）', face: fc, mag: 30,
      fx: function () {
        if (k === 'lover' || k === 'preg') { ctx.mod2(A, B, S.love ? { att: 8, aff: 6, trust: 4 } : { aff: 6 }, S.love ? { att: 8, aff: 6, trust: 4 } : { aff: 6 }); if (S.love && ctx.pair) ctx.pair(A, B).couple = true; }
        else if (k === 'repel' || k === 'trauma') ctx.mod2(B, A, { ten: 10, trust: -6 }, {});
        else if (k === 'rule') ctx.mod2(B, A, { aff: 3 }, { aff: 5 });
        else ctx.mod2(A, B, { aff: 4 }, { aff: 2 });
      } });
  }
  function endName(S) { var k = S.endK; return k === 'lover' && !S.love ? END_NAME.lover2 : END_NAME[k] || ''; }
  function finish(ctx) {
    var S = f(ctx);
    if (!S) return;
    var A = S.A, B = S.B;
    decideEnd(ctx, S);
    S.G.forEach(function (g) { g.gone = false; g.fate = g === S.lover ? B.name + 'の恋人' : g.outside ? '周りの人（名簿から）' : '周りの人'; g.fateNote = S.gSeen[g.i] ? B.name + 'の一か月を近くで見ていた' : ''; });
    A.fate = '見つめる側'; A.fateNote = B.name + 'を一か月見つめ続けた';
    B.fate = '見つめられる側'; B.fateNote = A.name + 'に見つめられた一か月（' + endName(S) + '）';
    ctx.flags.stalker = { a: A.i, b: B.i, days: S.days, rg: S.rg, rel: RG_NAME[S.rg], sty: STY_NAME[S.sty], styOdd: !!S.styOdd, br: BR_NAME[S.br], brK: S.br, brOdd: !!S.brOdd, endK: S.endK, end: endName(S),
      bold: DK.val(S, 'bold'), aware: DK.val(S, 'aware'), drawn: DK.val(S, 'drawn'), want: DK.val(S, 'want'), want0: S.want0, sex: S.sexN, pair: S.pairN, solo: S.soloN, home: S.home, ally: S.ally, guard: S.guard, boldDial: S.boldDial,
      realDay: S.realDay >= 0 ? S.realDay + 1 : null, love: S.love, setHits: S.setHits, setDays: Object.keys(S.setDays).length };
    ctx.flags.outcome = A.name + 'と' + B.name + 'の' + (S.days === 30 ? '一か月' : S.days + '日') + '――' + endName(S);
  }
  DK.install(ID, DK.couple('part', 'stalker', 'target', ['guest']), 'stalker');
  if (HK.Endings) HK.Endings[ID] = function (res, X) {
    var R = res.end && res.end.stalker, lines = [];
    if (!R) return { headline: res.outcome || '', stats: [], lines: [] };
    var a = X.nm(R.a), b = X.nm(R.b);
    lines.push(a + 'が' + b + 'を見つめた' + R.days + '日（' + R.rel + '）');
    lines.push(a + 'のやり方：' + R.sty + (R.styOdd ? '（らしくない）' : '') + '／' + b + 'の向き合い方：' + R.br + (R.brOdd ? '（らしくない）' : '') + (R.realDay ? '／DAY' + R.realDay + 'に誰か気づいた' : '／最後まで誰か分からなかった'));
    lines.push('住まい：' + { apart: 'アパート', mansion: 'マンション', house: '一軒家' }[R.home] + '／周りの味方：' + { none: 'いない', few: '少し', many: '多い' }[R.ally] + '／警戒心：' + { low: '無防備', mid: 'ふつう', high: '用心深い' }[R.guard]);
    if (!HK.SAFE_ON) lines.push('夜の場面 ' + R.sex + '回（二人 ' + R.pair + '・ひとり ' + R.solo + '）');
    lines.push('結末：' + R.end + (R.endK === 'cage' ? '（続きは「ヤンデレ監禁の部屋」で）' : ''));
    X.C.forEach(function (c) { c.afterDone = true; });
    return { headline: (res.outcome || '') + '。', stats: [['日数', R.days + '日'], ['結末', R.end]].concat(HK.SAFE_ON ? [] : [['夜の場面', R.sex + '回']]), lines: lines };
  };
  /* 結果欄の二人の関係（本体の値からの分け方は使わず、結末から決める） */
  var STC = {
    lover: ['恋人になった', 'love', 2, '見つめ、見つめられた一か月の果てに、二人は恋人になった。'],
    lover2: ['離れられない仲', 'obsess', 0, '名前のつかないまま、互いに離れられない仲になった。'],
    cage: ['囲い、囲われる仲', 'obsess', 0, '一か月の終わりに、二人は閉じた部屋の中で暮らし始めた。'],
    rule: ['立場が逆転した仲', 'obsess', 0, '見つめていた側が、見つめられていた側の手の中に収まった。'],
    repel: ['遠ざけた相手', 'enemy', -1, '見つめる人を、周りの手を借りて遠ざけた。'],
    trauma: ['消えない影', 'enemy', -1, '見つめる人は去ったが、その視線の記憶は消えなかった。'],
    preg: ['子を宿した仲', 'love', 2, '一か月の終わりに、二人のあいだに新しい命が宿った。'],
    preg2: ['子を宿した仲', 'obsess', 0, '一か月の終わりに、二人のあいだに新しい命が宿った。']
  };
  function stKey(S) { var k = S.endK; if (k === 'lover' && !S.love) return 'lover2'; if (k === 'preg' && !S.love) return 'preg2'; return k; }
  scen.classify = function (ctx, X, Y) {
    var S = f(ctx); if (!S || !((X === S.A && Y === S.B) || (X === S.B && Y === S.A))) return null;
    decideEnd(ctx, S);
    var k = stKey(S), M0 = STC[k], id = 'stk_' + k;
    if (!HK.LABELS[id]) HK.LABELS[id] = { name: M0[0], cls: M0[1], pol: M0[2] };
    return { id: id, stk: k };
  };
  scen.pairText = function (ctx, X, Y, cl) { return cl && cl.stk && STC[cl.stk] ? STC[cl.stk][3] : null; };
  HK.Stalker = { ID: ID, rows: rows, rowPre: rowPre, optOf: optOf, exOf: exOf, sayX: sayX, faceOf: faceOf, decideEnd: decideEnd, canLove2: canLove2, RG_NAME: RG_NAME, BR_NAME: BR_NAME, STY_NAME: STY_NAME };
  HK.SCENARIOS[ID] = scen;
  if (HK.Lewd && HK.Lewd.install) HK.Lewd.install(ID, { lenDef: 'mix', desc: '夜の場面の描き方。ほのめかす＝ぼかした一文と翌朝だけ／ほどほど＝描写する／濃い＝果てたあと、もう一度求め合うところまで' });
})();
