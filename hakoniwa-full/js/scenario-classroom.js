/* 箱庭診断: クラスメイト（2026-10-27 分割読み込みの第3段で scenarios-a.js から分けた。箱庭のかたまり scen-classroom） */
(function () {
  'use strict';
  var HK = window.HK;
  HK.SCENARIOS = HK.SCENARIOS || {};
  HK.SCEN_ORDER = HK.SCEN_ORDER || [];
  function R(ctx, a, b) { return ctx.R(a, b); }
  function names(list) { return list.map(function (c) { return c.name; }).join('・'); }
  /* 並びに無ければ足す（分割読み込みでは目録の並びが中核で先に作られている） */
  function add(s) { HK.SCENARIOS[s.id] = s; if (HK.SCEN_ORDER.indexOf(s.id) < 0) HK.SCEN_ORDER.push(s.id); }
  /* ======================= クラスメイト ======================= */
  var MONTHS = ['4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月', '1月', '2月', '3月'];
  add({
    id: 'classroom', name: 'クラスメイト', kicker: '日常・一年間',
    desc: '同じクラスで過ごす一年。テスト、体育祭、文化祭、修学旅行。行事ごとに関係が動く。',
    unit: '月', preRel: 4, lethal: false, factions: true, maxCast: 30,
    derived: ['warmth', 'lead', 'jealous', 'caution'],
    env: [
      { id: 'grade', label: '学年', type: 'select', def: '2', options: [{ v: '1', label: '高校1年' }, { v: '2', label: '高校2年（修学旅行あり）' }, { v: '3', label: '高校3年（受験）' }, { v: 'all', label: '学園全体（学年は住人ごと・先輩後輩あり）' }], desc: '学園全体にすると、住人ごとの「学年」で1〜3年生が混ざる。上級生と下級生は先輩・後輩になり、後輩は先輩に敬語で「〜先輩」と呼ぶ（呼び方や敬語を自分で決めた人はそのまま）' },
      { id: 'climate', label: 'クラスの雰囲気', min: 0, max: 100, def: 55, lo: '荒れている', hi: '仲がいい' },
      { id: 'faction', label: '派閥が生まれる人数', min: 3, max: 8, def: 4, lo: '3人から', hi: '8人から', unit: '人以上', desc: 'この人数を下回ると派閥には分かれない。上回っても、引っぱる人や信頼がなければ生まれない' },
      { id: 'bully', label: 'いじめ', type: 'select', def: 'auto', options: [{ v: 'auto', label: 'あり（気質と雰囲気しだい）' }, { v: 'high', label: 'あり（起きやすい）' }, { v: 'off', label: 'なし' }], desc: '「なし」にすると、いじめも陰口・嫌がらせの小さな出来事も起きない' },
      { id: 'span', label: '期間', type: 'select', def: 'year', options: [{ v: 'year', label: '一年間' }, { v: 'term', label: '一学期だけ' }] }
    ],
    perFields: [{ id: 'grade', label: '学年（学園全体のとき）', auto: 'おまかせ（2年）', options: [{ id: '1', label: '1年生' }, { id: '2', label: '2年生' }, { id: '3', label: '3年生' }] }],
    /* 学園全体：住人ごとの学年を決め、学年の違う二人を先輩・後輩にする（台詞の敬語と「〜先輩」の呼び方も） */
    extraTies: function (ctx, input) {
      var all = ctx.env.grade === 'all';
      ctx.chars.forEach(function (c) { c.grade = all ? (+((c.pick || {}).grade) || 2) : (+ctx.env.grade || 2); });
      if (!all) return [];
      var out = [], has = {};
      (input.ties || []).forEach(function (t) { has[Math.min(t.a, t.b) + '-' + Math.max(t.a, t.b)] = 1; });
      ctx.chars.forEach(function (a) { ctx.chars.forEach(function (b) {
        if (a.grade <= b.grade || a.role === 'teacher' || b.role === 'teacher') return;
        if (!has[Math.min(a.i, b.i) + '-' + Math.max(a.i, b.i)]) out.push({ a: a.i, b: b.i, type: 'senpai' });
        var y = input.chars[b.i];
        if (y && !y.call && !(y.calls && y.calls[a.name])) { y.calls = Object.assign({}, y.calls || {}); y.calls[a.name] = a.name + '先輩'; }
        if (y && !(y.keigo && Object.keys(y.keigo).length)) { y.keigoSenpai = y.keigoSenpai || {}; y.keigoSenpai[a.name] = 1; }
      }); });
      input.chars.forEach(function (y) { if (y.keigoSenpai) { y.keigo = Object.assign({}, y.keigo || {}, y.keigoSenpai); delete y.keigoSenpai; } });
      return out;
    },
    stats: [
      { id: 'study', label: '学力', desc: 'テストの順位に影響' },
      { id: 'sport', label: '運動', desc: '体育祭の活躍に影響' }
    ],
    actions: [
      { id: 'talky', label: '自分から話しかけまくる', fit: function (t) { return t.warmth; }, bias: { bond: 1.7 } },
      { id: 'club', label: '部活に打ち込む', fit: function (t) { return t.fc * 0.5 + t.a * 0.3; }, bias: { solo: 1.5 } },
      { id: 'rep', label: '委員長に立候補する', fit: function (t) { return t.lead; }, bias: { conflict: 1.3, help: 1.3 } },
      { id: 'window', label: '窓際の席でひとり', fit: function (t) { return t.cold * 0.6 + t.ac * 0.4; }, bias: { solo: 2, bond: 0.6 } }
    ],
    goals: [
      { id: 'lover', label: '恋人を作る', fit: function (t) { return t.honesty * 0.5 + t.fc * 0.4; }, bias: { romance: 1.9 } },
      { id: 'peace', label: '平穏に過ごす', fit: function (t) { return t.ac * 0.6 + t.caution * 0.4; }, bias: { conflict: 0.5, solo: 1.3 } },
      { id: 'center', label: 'クラスの中心になる', fit: function (t) { return t.lead * 0.6 + t.fc * 0.4; }, bias: { bond: 1.4, conflict: 1.3 } },
      { id: 'beat', label: '誰かに勝つ', fit: function (t) { return t.cp * 0.6 + t.aggr * 0.4; }, bias: { conflict: 1.8 }, needsFocus: true },
      { id: 'watch', label: '誰かを見守る', fit: function (t) { return t.np; }, bias: { help: 2, romance: 1.2 }, needsFocus: true }
    ],
    steps: function (env) { return env.span === 'term' ? MONTHS.slice(0, 4) : MONTHS.slice(); },
    setup: function (ctx) {
      ctx.place = '教室';
      ctx.chars.forEach(function (a) { ctx.others(a).forEach(function (b) { ctx.R(a, b).ten = HK.clamp(ctx.R(a, b).ten + (50 - ctx.env.climate) / 8, 0, 100); }); });
    },
    phase: function (ctx, s, n) {
      var P = ctx.present(), rng = ctx.rng, m = ctx.label;
      var e;
      if (s === 0) ctx.say({ text: ctx.env.grade === 'all' ? '始業式。' + [1, 2, 3].map(function (g) { var l = P.filter(function (c) { return c.grade === g; }); return l.length ? g + '年生の' + names(l) : ''; }).filter(Boolean).join('、') + '。同じ学園での一年が始まった。' : '始業式。' + names(P) + 'は同じクラスになった。' });
      if (s === 0 && HK.Attr && HK.Attr.meetScene) HK.Attr.meetScene(P, ctx);   /* 初対面の反応（体の特徴・目につく特徴。attr-meet.js） */
      if (m === '5月' || m === '12月') {
        var rank = P.map(function (c) { return { c: c, v: ctx.stat(c, 'study') * 10 + rng() * 25 + c.tr.a * 10 }; }).sort(function (x, y) { return y.v - x.v; });
        /* 全員が休んでいる（不登校など）ときは、テストの結果の場面を出さない */
        if (!rank.length) return;
        var top = rank[0].c, bot = rank[rank.length - 1].c;
        ctx.say({ text: (m === '5月' ? '中間' : '期末') + 'テストの結果が出た。トップは' + top.name + '、最下位は' + bot.name + '。' });
        P.forEach(function (c) { if (c !== top && c.tr.cp > 0.6) { ctx.k = 1; ctx.R(c, top).ten += 8; } });
        P.forEach(function (c) { if (c.grade === 3) c.stress = HK.clamp(c.stress + 10, 0, 100); });
      }
      var P2 = P.filter(function (c) { return c.grade === 2; });
      if (m === '11月' && P2.length >= 2) {
        var sh = rng.shuffle(P2);
        ctx.say({ text: (P2.length < P.length ? '二年生の' : '') + '修学旅行。消灯後、部屋のあちこちで話し声が続いた。' });
        for (var i = 0; i + 1 < sh.length; i += 2) {
          ctx.k = 1; ctx._mag = 0; ctx._touched = {};
          var a = sh[i], b = sh[i + 1];
          ctx.mod2(a, b, { trust: 8, att: 4 }, { trust: 8, att: 4 });
          var ab = R(ctx, a, b);
          e = ctx.say({ kind: 'event', cat: ab.att > 35 && ctx.romanceOk([a, b]) ? 'romance' : 'bond', actors: [a, b], text: ab.att > 35 && ctx.romanceOk([a, b]) ? a.name + 'と' + b.name + 'は、旅館の廊下の自販機の前で偶然二人になった。' : a.name + 'と' + b.name + 'は同じ布団の列で、眠くなるまで話した。', why: '修学旅行の夜（ランダムな組み合わせ）', mag: ctx._mag });
          ctx.pair(a, b).moments.push({ n: e.n, mag: e.mag });
        }
      }
      if (HK.ClassLife) HK.ClassLife.month(ctx, s, n);
    },
    after: function (ctx, s, n) { if (HK.ClassLife) HK.ClassLife.after(ctx, s, n); },
    finish: function (ctx) {
      if (HK.ClassLife) HK.ClassLife.finish(ctx);
      ctx.present().forEach(function (c) {
        var g = c.grade === 3;
        if (c.stress > 75) { c.fate = '休みがちに'; c.fateNote = '三学期は教室にいないことが増えた'; }
        else { c.fate = g ? '卒業' : '進級'; c.fateNote = g ? '卒業式の日、' + (ctx.closest(c) ? ctx.closest(c).name + 'と写真を撮った' : '一人で校門を出た') : (ctx.closest(c) ? ctx.closest(c).name + 'と同じクラスになりたいと思っている' : '春休みを待っている'); }
      });
    },
    events: [
      {
        id: 'studytogether', cat: 'bond', scope: 'pair',
        w: function (ctx, a, b) { return 0.2 + Math.abs(ctx.stat(a, 'study') - ctx.stat(b, 'study')) * 0.12 + a.tr.np * 0.3; },
        run: function (ctx, a, b) {
          var teach = ctx.stat(a, 'study') >= ctx.stat(b, 'study');
          ctx.mod2(a, b, { aff: 5, trust: 4 }, { aff: 5, trust: teach ? 8 : 3, att: teach ? 4 : 0 });
          return { text: ctx.t(teach ? '放課後、{a}が{b}に数学を教えた。{b}の方が先に問題を解き終えて、{a}が悔しがった。' : '{a}は{b}にノートを借りた。字が思ったより丁寧だった。', a, b), why: '学力差（' + ctx.stat(a, 'study') + '／' + ctx.stat(b, 'study') + '）' };
        }
      },
      {
        id: 'rumor', cat: 'betray', scope: 'pair',
        when: function (ctx, a, b) { return R(ctx, a, b).ten > 25 || ctx.pair(a, b).jealous > 0; },
        w: function (ctx, a) { return a.tr.jealous * 0.8 * (1.2 - ctx.env.climate / 100) - 0.15; },
        run: function (ctx, a, b) {
          ctx.others(b).forEach(function (o) { if (o !== a) ctx.mod(o, b, { aff: -4, ten: 4 }); });
          ctx.stress(b, 20);
          var found = ctx.rng() < 0.4 + b.tr.a * 0.3;
          if (found) ctx.mod(b, a, { ten: 30, aff: -25, trust: -35 });
          return { text: ctx.t('{b}についての妙な噂がクラスに流れた。出どころは{a}だった。' + (found ? '{b}はそれを突き止めた。' : '{b}はまだ知らない。'), a, b), why: a.name + 'の嫉妬・執着（' + Math.round(a.tr.jealous * 100) + '）と、クラスの雰囲気' };
        }
      },
      {
        id: 'lunch', cat: 'bond', scope: 'pair',
        w: function (ctx, a, b) { return 0.3 + a.tr.warmth * 0.5 + Math.max(0, R(ctx, a, b).aff) / 100; },
        run: function (ctx, a, b) {
          ctx.mod2(a, b, { aff: 5, trust: 3 }, { aff: 5, trust: 3 });
          return { text: ctx.t(ctx.pick(['昼休み、{a}と{b}は屋上で弁当を食べた。', '{a}が購買の最後の焼きそばパンを{b}に譲った。']), a, b), why: '日常の積み重ね' };
        }
      },
      {
        id: 'skip', cat: 'bond', scope: 'pair',
        when: function (ctx, a, b) { return R(ctx, a, b).aff > 15; },
        w: function (ctx, a, b) { return a.tr.fc * b.tr.fc * 1.2 * (1 - a.tr.ac); },
        run: function (ctx, a, b) {
          ctx.mod2(a, b, { aff: 8, att: 5, trust: 6 }, { aff: 8, att: 5, trust: 6 });
          return { text: ctx.t('{a}が{b}を誘って五限をサボった。河川敷で、何をするでもなく時間を潰した。', a, b), why: '二人ともFC高・AC低' };
        }
      },
      {
        id: 'rivalry', cat: 'conflict', scope: 'pair',
        w: function (ctx, a, b) { return a.tr.cp * 0.6 * (a.focus === b ? 2.5 : 0.6) + (b.tr.cp > 0.6 ? 0.2 : 0); },
        run: function (ctx, a, b) {
          var win = ctx.rng() < 0.5 + (ctx.stat(a, 'study') - ctx.stat(b, 'study')) * 0.08;
          ctx.mod2(a, b, { ten: 8, att: 3 }, { ten: 8, att: 3 });
          if (!win) ctx.stress(a, 10);
          return { text: ctx.t(win ? '小テストで{a}が{b}に勝った。{a}はわざわざ点数を見せに行った。' : '{a}はまた{b}に負けた。答案を握りしめた手に力が入った。', a, b), why: a.name + 'のCP（負けず嫌い）' + (a.focus === b ? '。' + b.name + 'を目標にしている' : '') };
        }
      },
      {
        id: 'club', cat: 'solo', scope: 'solo',
        w: function (ctx, a) { return 0.3 + a.tr.fc * 0.3 + (a.action.id === 'club' ? 0.6 : 0); },
        run: function (ctx, a) {
          ctx.stress(a, -12);
          return { text: ctx.t('{a}は部活に打ち込んでいた。教室にいる時間は少なかった。', a), why: '初動「' + a.action.label + '」' };
        }
      }
    ]
  });
})();
