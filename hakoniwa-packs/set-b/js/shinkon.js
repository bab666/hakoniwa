/* 新婚部屋（追加パック set-b の見本の部屋。エンジン型。両方のビルド）
   利用者のソロジャーナルの遊び方を箱庭にしたもの：毎日、表（シーン導入・日替わり・キーアイテム・ご飯）を振って一日を組み立て、
   二人それぞれの願望pt が 10 の倍数を越えるたびに願望の行動が起きる。最後の夜は幸せなキスで一区切り。遊んだあとに「プレイログ」が残る。
   ・1日＝朝・日中・夜の3区切り。暮らしの状態（仕事の型・家庭での役割）は HK.Life、願望pt・表を引く・記録は HK.Journal（本体のかたまり pack-roomkit）
   ・地の文は shinkon-text.js の HK.ShinkonText（表の行ごと）。無い行は表の言葉で一文にする
   ・R18版の夜の場面は shinkon-r18.js の HK.ShinkonR18（1回の遊びで 1〜3 回。体の関係にしてよい組だけ）
   ・恋愛の文は cat: 'romance' で出す（恋愛にならない組＝恋愛対象が合わないなどは、エンジンが記録に残さない）
   設計：docs/reports/2026-11-03/shinkon-design.md。登場人物はすべて成人として扱う */
(function () {
  'use strict';
  var HK = window.HK;
  var D = HK.ShinkonData;
  if (!D || !HK.Life || !HK.Journal) return;
  var ID = 'set-b-shinkon', J = HK.Journal, LF = HK.Life;
  var PART = ['朝', '日中', '夜'], WEEK = ['月', '火', '水', '木', '金', '土', '日'];
  function TX() { return HK.ShinkonText || {}; }
  function pickOf(ctx, arr) { return arr && arr.length ? arr[Math.floor(ctx.rng() * arr.length)] : ''; }
  /* 全年齢（全年齢版・全年齢モード）では、飾りの ♡ を ♪ にする（性的な語の点検に当たるため。ポンコツ新妻編の台詞など） */
  function soft(t) { return HK.SAFE_ON ? String(t).replace(/♡/g, '♪') : t; }
  function fill(ctx, t, a, b, ex) {
    t = String(t || '');
    if (ex) Object.keys(ex).forEach(function (k) { t = t.split('{' + k + '}').join(ex[k]); });
    return soft(ctx.t(t, a, b));
  }
  function rowsSoft(rows) { return rows.map(function (r) { return r && [r[0], r[1] == null ? r[1] : soft(r[1])]; }); }
  /* 地の文：表の名前・行の番号で shinkon-text.js を引く。無ければ fb（表の言葉の一文） */
  function prose(ctx, key, i, fb) {
    var T = TX()[key], p = T && T[i];
    /* 恋愛にならない二人では、キス・嫉妬などの文を候補から外す（全部当たるなら表の言葉の一文） */
    if (Array.isArray(p) && ctx.sk && !ctx.sk.love) { p = p.filter(function (x) { return typeof x !== 'string' || !ROM.test(x); }); if (!p.length) return fb || ''; }
    if (Array.isArray(p) && p.length) return pickOf(ctx, p);
    if (typeof p === 'string' && p) return p;
    return fb || '';
  }
  /* 恋愛にしてよい二人か（恋愛対象・恋愛相手の固定・関係の「恋愛：なし」（家族・無関心・恐怖など）を両方向で） */
  function canLove2(ctx, a, b) {
    if (HK.canLove && !(HK.canLove(a, b, ctx) && HK.canLove(b, a, ctx))) return false;
    if (HK.tieLoveNoPair && (HK.tieLoveNoPair(ctx, a, b) || HK.tieLoveNoPair(ctx, b, a))) return false;
    if (HK.Ties && HK.Ties.apathy && (HK.Ties.apathy(ctx, a, b) || HK.Ties.apathy(ctx, b, a))) return false;
    if (ctx.pair && ctx.pair(a, b).kin) return false;
    return true;
  }
  /* 恋愛にならない二人のときに出さない行（キス・嫉妬・甘え・デートなど、恋人どうしを前提にした行） */
  var ROM = /キス|いちゃ|嫉妬|ヤキモチ|甘え|抱き|膝枕|好き|愛|デート|ナンパ|記念日|触れ合|スキンシップ|独り占め|寄り添|ペアリング|彼シャツ|添い|一緒に寝|ぎゅっ|ムラムラ|エッチ|色っぽ|夢に相手/;
  function romRow(x) { return ROM.test(typeof x === 'string' ? x : ((x && x.k) || '') + ((x && x.t) || '')); }
  function f(ctx) { return ctx.sk; }

  /* ---------- 願望（おまかせは気質から。全年齢では「もっとエッチなこと」を選ばない） ---------- */
  var WISH_FIT = [
    function (t) { return (t.np || 0) * 0.4 + (t.ac || 0) * 0.3; },        /* 1 もっと仲良く */
    function (t) { return (t.ac || 0) * 0.5 + (t.fc || 0) * 0.3; },        /* 2 甘えたい */
    function (t) { return (t.np || 0) * 0.5 + 0.1; },                      /* 3 一緒の時間 */
    function (t) { return (t.honesty || 0) * 0.5 + (t.np || 0) * 0.2; },   /* 4 気持ちを言葉に */
    function (t) { return (t.fc || 0) * 0.5 + (t.warmth || 0) * 0.3; },    /* 5 スキンシップ */
    function (t) { return (t.np || 0) * 0.6 + (t.cp || 0) * 0.2; },        /* 6 頼ってほしい */
    function (t) { return (t.a || 0) * 0.4 + (t.fc || 0) * 0.3; },         /* 7 趣味や夢 */
    function (t) { return (t.ac || 0) * 0.4 + (t.warmth || 0) * 0.3; },    /* 8 深く愛されたい */
    function (t) { return (t.jealous || 0) * 0.7 + (t.cp || 0) * 0.2; },   /* 9 独り占め */
    function (t) { return (t.impulse || 0) * 0.5 + (t.fc || 0) * 0.3; }    /* 10 もっとエッチなこと */
  ];
  function wishOf(ctx, c, pick) {
    var n = D.WISH.length;
    if (pick != null && pick !== 'auto' && pick !== '') { var k = +String(pick).replace(/^w/, ''); if (k >= 0 && k < n && !(k === 9 && HK.SAFE_ON)) return k; }
    var love = ctx.sk ? ctx.sk.love : true, idx = [];
    for (var i = 0; i < n; i++) if (!(i === 9 && HK.SAFE_ON) && (love || [0, 2, 5, 6].indexOf(i) >= 0)) idx.push(i);
    return HK.weighted(ctx.rng, idx, function (i) { return Math.pow(Math.max(0.05, WISH_FIT[i](c.tr || {})), 2); });
  }

  /* ---------- 箱庭 ---------- */
  function opts(list, auto) { return [{ v: 'auto', label: auto || 'おまかせ' }].concat(list.map(function (t, i) { return { v: 'x' + i, label: t }; })); }
  /* なれそめの短い名前（文の {rel} と結末の記録に使う。選択肢には表の言葉の頭を出す） */
  var REL_SHORT = ['幼なじみ', '元ライバル', '長い片想いの相手', '元同僚', '文通やネットで知り合った仲', '家族ぐるみの付き合い', '復縁した元恋人', '運命的な衝動婚', '拾った・拾われた関係', '初めて付き合った相手どうし'];
  function relShort(i) { return REL_SHORT[i] || String(D.REL[i] || '').split(/\s/)[0]; }
  var scen = {
    id: ID, name: '新婚部屋', kicker: 'ふたり・日常',
    desc: '結婚したばかりの二人の毎日を、朝・日中・夜ごとに眺める。それぞれの願望が高まると出来事が起き、最後の夜は幸せなキスで一区切り。遊んだあとに表の結果と二人の一日が「プレイログ」として残る。',
    note: '※二人で遊ぶ箱庭です。登場人物はすべて成人として扱います。',
    unit: '日', perUnit: 3, preRel: 0, lethal: false, minCast: 2, maxCast: 2,
    catBias: { romance: 1, bond: 1, help: 1, conflict: 0.3, combat: 0, betray: 0 },
    decay: 0.998, actRate: 1e-9,
    derived: ['warmth', 'honesty', 'jealous', 'impulse'],
    env: [
      { id: 'days', label: '日数', min: 5, max: 14, def: 7, lo: '5日', hi: '14日', unit: '日', desc: '見守る日数。1日は朝・日中・夜の3区切り。最後の夜は幸せなキスで一区切り' },
      { id: 'home', label: '二人の住まい', type: 'select', def: 'auto', options: opts(D.HOME), desc: '二人が暮らす家（ソロジャーナルの「二人の住まい表」）' },
      { id: 'rel', label: '二人のなれそめ', type: 'select', def: 'auto', options: opts(D.REL.map(function (t, i) { return relShort(i); })), desc: '結婚するまでの二人の関係（「二人の関係性表」）' },
      { id: 'meet', label: '出会いの場所', type: 'select', def: 'auto', options: opts(D.MEET.map(function (t) { return t.split(/\s/)[0]; })), desc: '二人が出会った場所（「偶然の出会いの表」）' },
      { id: 'speed', label: '願望の溜まりやすさ', type: 'select', def: 'normal', options: [{ v: 'slow', label: 'ゆっくり' }, { v: 'normal', label: 'ふつう' }, { v: 'fast', label: '早い' }], desc: '願望pt の増え方。早いほど願望の行動が多く起きる' }
    ],
    stats: [],
    perFields: [
      { id: 'work', label: '仕事の型', auto: 'おまかせ（気質から）', options: LF.WORK.map(function (w) { return { id: w.v, label: w.label }; }) },
      { id: 'job', label: '職業', type: 'text', placeholder: function () { return '例：営業、看護師（空欄でもよい）'; } },
      { id: 'role', label: '家庭での役割', auto: 'おまかせ（気質から）', options: LF.ROLE.map(function (r) { return { id: r.v, label: r.label }; }) },
      { id: 'wish', label: '願望', auto: 'おまかせ（気質から）', options: D.WISH.map(function (w, i) { return { id: 'w' + i, label: w.t.split(/\s/)[0] }; }) }
    ],
    actions: [{ id: 'live', label: 'いつもどおりに暮らす', fit: function () { return 0.5; } }],
    goals: [{ id: 'happy', label: '幸せに暮らしたい', fit: function () { return 0.5; } }],
    steps: function (env) {
      var n = Math.max(5, Math.min(14, +env.days || 7)), s = [];
      for (var d = 0; d < n; d++) for (var t = 0; t < 3; t++) s.push('DAY' + (d + 1) + '（' + WEEK[d % 7] + '）' + PART[t]);
      return s;
    },
    setup: function (ctx) { setup(ctx); },
    phase: function (ctx, s, n) { phase(ctx, s, n); },
    finish: function (ctx) { finish(ctx); },
    events: []
  };
  /* R18版：エッチの回数 */
  if (!HK.SAFE_BUILD) scen.env.push({ id: 'lewdN', label: 'エッチの回数（R18）', type: 'select', def: 'mid', options: [{ v: 'low', label: '少なめ（1回）' }, { v: 'mid', label: 'ふつう（1〜2回）' }, { v: 'high', label: '多め（2〜3回）' }], desc: '一回の遊びの中で起きるエッチの場面の回数の目安（体の関係にしてよい二人だけ）' });

  function sel(ctx, id, list) {
    var v = ctx.env[id];
    if (typeof v === 'string' && /^x\d+$/.test(v)) { var k = +v.slice(1); if (k < list.length) return k; }
    return Math.floor(ctx.rng() * list.length);
  }
  function pickOfChar(ctx, c, k) { var p = ctx.input && ctx.input.perChar && ctx.input.perChar[c.i]; return p && p.pick ? p.pick[k] : null; }

  function setup(ctx) {
    var C = ctx.chars, A = C[0], B = C[1] || C[0], env = ctx.env;
    var days = Math.max(5, Math.min(14, +env.days || 7));
    ctx.place = '二人の新居';
    var S = ctx.sk = { days: days, A: A, B: B, home: sel(ctx, 'home', D.HOME), rel: sel(ctx, 'rel', D.REL), meet: sel(ctx, 'meet', D.MEET), meet2: 0,
      speed: env.speed === 'slow' ? 0.7 : env.speed === 'fast' ? 1.45 : 1, love: canLove2(ctx, A, B), day: null, fights: 0, makeups: 0, acts: 0, sex: 0, kissed: false, best: null, lewdMax: 0 };
    /* 出会いの詳細「出会ったその日に一夜を共にした」（行10）は R18 版で、二人とも性欲「なし」でないときだけ */
    var night1 = !HK.SAFE_ON && S.love && !(HK.Pos && HK.Pos.libNone && HK.Pos.libNone([A, B]));
    S.meet2 = HK.weighted(ctx.rng, D.MEET2.map(function (x, i) { return i; }), function (i) { return i === 9 && !night1 ? 0 : 1; });
    C.forEach(function (c) {
      var job = pickOfChar(ctx, c, 'job');
      c.life = { job: job ? String(job).slice(0, 20) : '' };
      LF.role(ctx, c, pickOfChar(ctx, c, 'role'));
      LF.work(ctx, c, pickOfChar(ctx, c, 'work'));
      var w = wishOf(ctx, c, pickOfChar(ctx, c, 'wish'));
      J.wish(ctx, c, w, D.WISH[w].init);
    });
    if (!HK.SAFE_ON && HK.ShinkonR18 && HK.ShinkonR18.quota) S.lewdMax = HK.ShinkonR18.quota(ctx, env.lewdN);
    /* セットアップの記録と、二人の紹介 */
    J.prompt(ctx, [A, B], [['二人の住まい表', D.HOME[S.home]], ['関係性表', D.REL[S.rel]], ['偶然の出会いの表', D.MEET[S.meet]], ['偶然の出会い 詳細', D.MEET2[S.meet2]]], '〇セットアップ');
    C.forEach(function (c) {
      var w = J.of(ctx, c);
      J.prompt(ctx, [c], [['仕事', LF.label(c)], ['願望表', D.WISH[w.d].t], ['初期願望pt', String(w.pt)]], '〇' + c.name);
    });
    var intro = prose(ctx, 'SETUP', 0, '{a}と{b}は、結婚したばかりの二人だ。住まいは{home}。{rel}――出会いは{meet}だった。');
    ctx.act2({ actors: [A, B], cat: S.love ? 'romance' : 'bond', text: fill(ctx, intro, A, B, { home: D.HOME[S.home], rel: relShort(S.rel), meet: D.MEET[S.meet].split(/\s/)[0] }), why: '新婚部屋：二人の始まり' });
  }

  /* ---------- 一日の表を振る（朝に、その日の分をまとめて） ---------- */
  function holiday(d) { return d % 7 === 5 || d % 7 === 6; }
  function rollDay(ctx, d) {
    var S = f(ctx), A = S.A, B = S.B, hol = holiday(d);
    var pa = LF.day(ctx, A, d, hol), pb = LF.day(ctx, B, d, hol), apart = pa.trip || pb.trip;
    var hi = J.of(ctx, A).pt >= J.of(ctx, B).pt ? A : B;
    var day = { d: d, hol: hol, pa: pa, pb: pb, apart: apart, hi: hi, lo: hi === A ? B : A };
    var lv = S.love, nr = function (x) { return lv || !romRow(x) ? 1 : 0; };
    day.intro = J.pick(ctx, 'intro', D.INTRO, function (x, i) { return (apart && i === 4 ? 0 : 1) * nr(x); });
    day.introI = D.INTRO.indexOf(day.intro);
    /* 日替わり：離れている日は連絡・忙しさの行、休日はデートの表も混ぜる、家事が苦手な人がいればポンコツ編も */
    var clumsy = [A, B].some(function (c) { var r = LF.roleInfo(c.life.role); return r && (r.clumsy || r.chores < 0.2); });
    var src = 'DAILY';
    if (!apart && hol && D.DATE && lv && ctx.rng() < 0.45) src = 'DATE';
    else if (!apart && D.PONKOTSU && ctx.rng() < (clumsy ? 0.22 : 0.08)) src = 'PONKOTSU';
    day.src = src;
    day.daily = J.pick(ctx, src, D[src], function (x) {
      if (!nr(x)) return 0;
      if (src !== 'DAILY') return 1;
      if (apart) return /連絡|忙しい/.test(x.k) ? 3 : 0;
      return /連絡/.test(x.k) ? 0.3 : 1;
    });
    day.dailyI = D[src].indexOf(day.daily);
    if (ctx.rng() < 0.35) { day.item = J.pick(ctx, 'item', D.ITEM); day.itemI = D.ITEM.indexOf(day.item); }
    if (!apart && ctx.rng() < 0.4) { var mr = ctx.rng(); day.mealK = mr < 0.3 ? 'BREAKFAST' : hol && mr < 0.6 ? 'LUNCH' : 'DINNER'; day.meal = J.pick(ctx, day.mealK, D[day.mealK], nr); day.mealI = D[day.mealK].indexOf(day.meal); }
    if (ctx.rng() < 0.12 || (day.daily && /記念日/.test(day.daily.k))) day.special = J.pick(ctx, 'special', D.SPECIAL);
    if (day.daily && /喧嘩/.test(day.daily.t + (day.intro && day.intro.t))) day.fight = J.pick(ctx, 'fight', D.FIGHT);
    /* 日替わりの行そのものが小さな喧嘩のとき（買い物の喧嘩など）は、喧嘩の段を重ねない（記録と夜の仲直りは出す） */
    day.fightInDaily = !!(day.daily && /喧嘩/.test(day.daily.t));
    if (day.introI === 0 && ctx.rng() < 0.6) day.fight = day.fight || J.pick(ctx, 'fight', D.FIGHT);
    return day;
  }
  function dailyText(day) { return day.daily ? (day.daily.k ? day.daily.k + '／' : '') + day.daily.t : ''; }
  var SRC_NAME = { DAILY: '日替わりイベント表', DATE: '日替わりイベント表・デート特化', PONKOTSU: '日替わりイベント表・ポンコツ新妻編' };

  /* 願望pt を増やし、越えた分の願望の行動を出す */
  function gain(ctx, c, n) { var S = f(ctx); return J.add(ctx, c, Math.max(0, Math.round(n * S.speed))); }
  function wishActs(ctx, c, k) {
    var S = f(ctx), w = J.of(ctx, c), o = c === S.A ? S.B : S.A;
    for (var i = 0; i < k; i++) {
      var list = (TX().WISH4 && w.d === 3) ? TX().WISH4 : D.WISH[w.d].acts;
      var act = J.pick(ctx, 'act' + w.d + '_' + c.i, list, function (x) { return S.love || !romRow(x) ? 1 : 0; });
      if (!act) continue;
      var ai = list.indexOf(act), wn = D.WISH[w.d].t.split(/\s/)[0];
      J.prompt(ctx, [c], [['願望行動表', act.t]], '〇' + c.name + 'の願望行動');
      var T = TX().ACT && TX().ACT[w.d] && TX().ACT[w.d][ai];
      /* 「押し倒して相手の反応を見る」（願望10の行10）：願望を持つ人が受けのときは、押し倒さずに誘う形にする（攻めを選んだ人を受けにしない・受けが攻めを組み敷かない） */
      if (w.d === 9 && ai === 9 && HK.Pos && HK.Pos.order && HK.Pos.order(c, o)[0] !== c) T = ['{a}は布団の上で{b}に体を預け、腕を引いて自分のほうへ倒れ込ませた。間近で見下ろしてくる{b}の目を、{a}はじっと見上げた。「……どうする？｜……どうする｜……どうしますか」', '{a}は{b}のシャツの裾を握って、ベッドの端まで引っぱった。{a}が先に仰向けになると、{b}は息を呑んで、その上に覆いかぶさった。'];
      var t = Array.isArray(T) && T.length ? pickOf(ctx, T) : '{a}の気持ちが、また少し高まった。{a}は、' + act.t.replace(/。$/, '') + '。';
      var e = ctx.act2({ actors: [c, o], cat: S.love ? 'romance' : 'bond', text: fill(ctx, t, c, o), why: '新婚部屋：願望が高まった（' + wn + '・' + w.pt + 'pt）', fx: function () { ctx.mod2(c, o, { aff: 3, att: 2 }, { aff: 2, att: 2 }); } });
      if (e) { S.acts++; J.count(ctx, 'acts'); }
      /* R18版：願望が高まったら、その夜のエッチのきっかけになりやすい */
      S.day.urge = Math.max(S.day.urge || 0, w.d === 9 ? 1 : /^(4|7|8)$/.test(String(w.d)) ? 0.55 : 0.3);
      S.day.urgeBy = S.day.urgeBy || c;
    }
  }

  function phase(ctx, s, n) {
    var S = f(ctx), A = S.A, B = S.B, d = Math.floor(s / 3), t = s % 3;
    if (A === B) return;
    /* 新婚の二人：はじめから親しい（恋愛にならない組は親しい同居人として）。エンジンの関係の記録が整ってから（最初の区切り）当てる */
    if (s === 0) {
      ctx._touched = ctx._touched || {}; ctx._mag = ctx._mag || 0;
      if (S.love) ctx.mod2(A, B, { aff: 45, trust: 35, att: 45 }, { aff: 45, trust: 35, att: 45 });
      else ctx.mod2(A, B, { aff: 30, trust: 30 }, { aff: 30, trust: 30 });
    }
    if (t === 0) {
      var day = S.day = rollDay(ctx, d);
      var rows = [['シーン導入表', day.intro && day.intro.t], [SRC_NAME[day.src], dailyText(day)]];
      if (day.item) rows.push(['キーアイテム表', (day.item.k ? day.item.k + '／' : '') + day.item.t]);
      if (day.special) rows.push(['特別な日表', day.special]);
      J.prompt(ctx, [A, B], rowsSoft(rows));
      var it = day.introI, who = it === 9 || it === 2 || it === 3 ? (ctx.rng() < 0.5 ? A : B) : day.hi;
      var other = who === A ? B : A;
      var tx = prose(ctx, 'INTRO', it, '{a}の朝――' + (day.intro ? day.intro.t : '') + '。');
      ctx.act2({ actors: [who, other], cat: S.love && it !== 7 ? 'romance' : 'bond', text: fill(ctx, tx, who, other, { special: day.special || '' }), why: '新婚部屋：朝（' + (day.intro ? day.intro.t : '') + '）' });
      day.before = {}; day.before[A.i] = J.of(ctx, A).pt; day.before[B.i] = J.of(ctx, B).pt;
      /* シーン導入で増える願望pt（ムラムラしている朝は、その人だけ 1〜10） */
      var k1 = gain(ctx, who, it === 9 ? 1 + Math.floor(ctx.rng() * 10) : 1 + Math.floor(ctx.rng() * 3)), k2 = gain(ctx, other, 1 + Math.floor(ctx.rng() * 2));
      day.pend = [[who, k1], [other, k2]];
      if (day.meal && day.mealK === 'BREAKFAST') meal(ctx, day);
      return;
    }
    var day2 = S.day;
    if (t === 1) {
      /* 日中：仕事の型ごとの一言（休日・在宅の日は家のこと） */
      [A, B].forEach(function (c) {
        var pl = c === A ? day2.pa : day2.pb;
        if (day2.hol && !pl.trip) { if (ctx.rng() < 0.45) ctx.act2({ actors: [c], cat: 'solo', text: fill(ctx, LF.roleLine(ctx, c), c), why: '新婚部屋：休日の家のこと' }); return; }
        if (ctx.rng() < (pl.trip ? 1 : 0.6)) ctx.act2({ actors: [c], cat: 'solo', text: fill(ctx, LF.line(ctx, c, pl), c), why: '新婚部屋：' + (pl.trip ? '出張' : '仕事') + '（' + LF.workInfo(c.life.work).label + '）' });
      });
      /* 日替わりイベント */
      var dl = day2.daily, a = day2.hi, b = day2.lo;
      if (dl && /^(どちらかが忙しい|連絡がうまく取れない)$/.test(dl.k)) { var busy = day2.pa.late || day2.pa.trip ? A : day2.pb.late || day2.pb.trip ? B : null; if (busy) { a = busy === A ? B : A; b = busy; } }
      if (dl && /^(どちらかの体調が悪い)$/.test(dl.k) && ctx.rng() < 0.5) { var tmp = a; a = b; b = tmp; }
      /* ポンコツ新妻編：{b} が家事の苦手なほう（役割から。同じくらいならくじ）、{a} は見守る側 */
      if (day2.src === 'PONKOTSU') { var ca = LF.roleInfo(A.life.role), cb = LF.roleInfo(B.life.role), sa = ca.clumsy ? 2 : 1 - ca.chores, sb2 = cb.clumsy ? 2 : 1 - cb.chores; b = sa === sb2 ? (ctx.rng() < 0.5 ? A : B) : sa > sb2 ? A : B; a = b === A ? B : A; }
      var fb = '{a}と{b}の一日――' + dailyText(day2) + '。' + (day2.item ? '鍵になったのは、' + day2.item.t + '。' : '');
      var dt = prose(ctx, day2.src, day2.dailyI, fb);
      var e = ctx.act2({ actors: [a, b], cat: S.love ? 'romance' : 'bond', text: fill(ctx, dt, a, b, { item: day2.item ? day2.item.t : '', special: day2.special || '', fight: day2.fight || '' }), why: '新婚部屋：' + (SRC_NAME[day2.src] || '日替わり') + '（' + dailyText(day2) + '）', fx: function () { ctx.mod2(a, b, { aff: 2, att: 2 }, { aff: 2, att: 2 }); } });
      if (day2.fight) {
        S.fights++;
        J.prompt(ctx, [a, b], [['喧嘩のきっかけ表', day2.fight], ['困ったときのリアクション表', pickOf(ctx, D.REACT)]]);
        var ft = prose(ctx, 'FIGHT', D.FIGHT.indexOf(day2.fight), '{a}と{b}は、' + day2.fight.replace(/。$/, '') + 'ことで、少し言い合いになった。');
        if (!day2.fightInDaily) ctx.act2({ actors: [a, b], cat: 'conflict', text: fill(ctx, ft, a, b), why: '新婚部屋：小さな喧嘩（' + day2.fight + '）', fx: function () { ctx.mod2(a, b, { aff: -3, ten: 6 }, { aff: -3, ten: 6 }); } });
        day2.fought = true;
      }
      var g1 = gain(ctx, a, 2 + Math.floor(ctx.rng() * 4)), g2 = gain(ctx, b, 1 + Math.floor(ctx.rng() * 4));
      day2.pend.push([a, g1], [b, g2]);
      if (e && !S.best) S.best = { d: day2.d, label: 'DAY' + (day2.d + 1), why: soft(dailyText(day2)) };
      return;
    }
    /* 夜 */
    if (day2.meal && day2.mealK !== 'BREAKFAST') meal(ctx, day2);
    if (day2.fought) {
      var mk = prose(ctx, 'MAKEUP', 0, '寝る前に、{a}のほうから「さっきはごめん｜さっきは悪かった｜先ほどはすみませんでした」と切り出した。{b}は小さくうなずいた。');
      if (ctx.act2({ actors: [day2.lo, day2.hi], cat: 'bond', text: fill(ctx, mk, day2.lo, day2.hi), why: '新婚部屋：仲直り', fx: function () { ctx.mod2(day2.lo, day2.hi, { aff: 4, ten: -6 }, { aff: 4, ten: -6 }); } })) S.makeups++;
    }
    var gn1 = gain(ctx, A, Math.floor(ctx.rng() * 3)), gn2 = gain(ctx, B, Math.floor(ctx.rng() * 3));
    day2.pend.push([A, gn1], [B, gn2]);
    J.pts(ctx, [A, B], day2.before);
    var crossed = {}; day2.pend.forEach(function (p) { crossed[p[0].i] = (crossed[p[0].i] || 0) + p[1]; });
    [A, B].forEach(function (c) { if (crossed[c.i]) wishActs(ctx, c, Math.min(2, crossed[c.i])); });
    /* R18版：エッチの場面 */
    var sexed = false;
    if (!HK.SAFE_ON && HK.ShinkonR18 && S.sex < S.lewdMax && !day2.apart) sexed = HK.ShinkonR18.night(ctx, A, B, day2, d === S.days - 1);
    if (sexed) S.sex++;
    /* シーンの結末 */
    /* 離れて過ごした日（出張など）は、一緒にいる前提の「シーンの結末」を出さない（ふたりの距離の一行で締める） */
    var en = day2.apart ? null : J.pick(ctx, 'end', D.END, function (x) { return (S.love || !romRow(x) ? 1 : 0) * (day2.fought && /不安|動揺|戸惑/.test(x.t) ? 1.5 : 1); });
    if (en) {
      J.prompt(ctx, [A, B], [['シーンの結末表', en.k + '／' + en.t]]);
      var et = prose(ctx, 'END', D.END.indexOf(en), '一日の終わりに、{a}は思った――' + en.t.replace(/。$/, '') + '。');
      ctx.act2({ actors: [day2.hi, day2.lo], cat: S.love ? 'romance' : 'bond', text: fill(ctx, et, day2.hi, day2.lo), why: '新婚部屋：シーンの結末（' + en.k + '）' });
    }
    if (d === S.days - 1) { ending(ctx); return; }
    distance(ctx, day2);
  }
  /* ご飯（朝ご飯は朝の区切り、昼・夜ご飯は夜の区切り。作るのは家事を多くする人） */
  var MEAL_NAME = { BREAKFAST: ['朝ご飯表', '朝'], LUNCH: ['昼ご飯表', '昼'], DINNER: ['夜ご飯表', '夜'] };
  function meal(ctx, day) {
    var S = f(ctx), A = S.A, B = S.B, nm = MEAL_NAME[day.mealK];
    var mt = prose(ctx, day.mealK, day.mealI, '{a}と{b}の' + nm[1] + 'ご飯――' + day.meal.k + '。' + day.meal.t + '。');
    var food = pickOf(ctx, D.FOOD);
    J.prompt(ctx, [A, B], [[nm[0], day.meal.k + '／' + day.meal.t], ['食材表', food]]);
    var cook = LF.chorePerson(A, B);
    ctx.act2({ actors: [cook, cook === A ? B : A], cat: S.love ? 'romance' : 'bond', text: fill(ctx, mt, cook, cook === A ? B : A, { food: food }), why: '新婚部屋：ご飯（' + day.meal.k + '）' });
  }
  /* ふたりの距離（その日の関係の動き） */
  function distance(ctx, day) {
    var S = f(ctx), A = S.A, B = S.B, r = ctx.rel[A.i][B.i], q = ctx.rel[B.i][A.i];
    var key = day.fought ? (day.fought && S.makeups ? 'mend' : 'rough') : day.apart ? 'apart' : (r && q && r.att + q.att > 120) ? 'close' : 'calm';
    var DIST = TX().DIST || {};
    var t = pickOf(ctx, DIST[key]) || { mend: '行き違いはあったけれど、ちゃんと仲直りできた。', rough: 'まだ少し気まずさが残っている。', apart: '離れていたぶん、相手のことを考える時間が長かった。', close: '心の距離が、また少し縮まった。', calm: 'いつもどおりの一日。それがなによりだった。' }[key];
    J.prompt(ctx, [A, B], [['ふたりの距離', fill(ctx, t, A, B)]], '〇');
  }
  /* 最後の夜：幸せなキス */
  function ending(ctx) {
    var S = f(ctx), A = S.A, B = S.B, k = Math.floor(ctx.rng() * D.KISS.length);
    if (S.love) {
      J.prompt(ctx, [A, B], [['幸せなキスをした表', D.KISS[k]]], '〇エンディング');
      var t = prose(ctx, 'KISS', k, D.KISS[k]);
      if (ctx.act2({ actors: [A, B], cat: 'romance', text: fill(ctx, t, A, B), why: '新婚部屋：エンディング（幸せなキス）', fx: function () { ctx.mod2(A, B, { aff: 6, att: 6, trust: 4 }, { aff: 6, att: 6, trust: 4 }); } })) S.kissed = true;
    } else {
      ctx.act2({ actors: [A, B], cat: 'bond', text: fill(ctx, prose(ctx, 'HUG', 0, '最後の夜、{a}と{b}は並んで座り、明日の話をした。穏やかな、いい暮らしだった。'), A, B), why: '新婚部屋：エンディング' });
    }
  }
  function finish(ctx) {
    var S = f(ctx), A = S.A, B = S.B;
    if (A === B) return;
    var wa = J.of(ctx, A), wb = J.of(ctx, B);
    ctx.flags.shinkon = { days: S.days, home: D.HOME[S.home], rel: relShort(S.rel), meet: D.MEET[S.meet].split(/\s/)[0], a: A.i, b: B.i,
      life: [LF.label(A), LF.label(B)], wish: [D.WISH[wa.d].t.split(/\s/)[0], D.WISH[wb.d].t.split(/\s/)[0]], pt: [wa.pt, wb.pt],
      acts: S.acts, fights: S.fights, makeups: S.makeups, sex: S.sex, kissed: S.kissed, love: S.love, best: S.best };
    [A, B].forEach(function (c) { c.fate = S.love ? '新婚の夫婦' : '同じ家で暮らす二人'; c.fateNote = (c === A ? B : A).name + 'と、' + S.days + '日を過ごした'; });
    ctx.flags.outcome = A.name + 'と' + B.name + 'の新婚の' + S.days + '日' + (S.kissed ? '――最後の夜、二人は幸せなキスをした' : '');
  }

  /* 結果に記録を載せる（engine.js の finalize は書き換えず、回し終えた ctx から写す） */
  if (HK.wrap && HK.simulate) HK.wrap(HK, 'simulate', function (sim0) {
    return function (input) {
      var r = sim0.apply(this, arguments), C0 = HK._curCtx;
      if (r && r.end && input && input.scenId === ID && C0 && C0.scen && C0.scen.id === ID && C0.flags) r.end.shinkon = C0.flags.shinkon || null;
      return r;
    };
  });
  /* 結末の要約（endings.js の E.build から） */
  if (HK.Endings) HK.Endings[ID] = function (res, X) {
    var R = res.end && res.end.shinkon, lines = [];
    if (!R) return { headline: res.outcome || '', stats: [], lines: [] };
    var a = X.nm(R.a), b = X.nm(R.b);
    lines.push('二人の' + R.days + '日の記録（' + a + 'と' + b + '）');
    lines.push('住まい：' + R.home + '／なれそめ：' + R.rel + '／出会い：' + R.meet);
    lines.push(a + '：' + R.life[0] + '／願望「' + R.wish[0] + '」' + R.pt[0] + 'pt');
    lines.push(b + '：' + R.life[1] + '／願望「' + R.wish[1] + '」' + R.pt[1] + 'pt');
    lines.push('願望の行動 ' + R.acts + '回／喧嘩 ' + R.fights + '回' + (R.fights ? '（仲直り ' + R.makeups + '回）' : '') + (HK.SAFE_ON ? '' : '／エッチ ' + R.sex + '回'));
    if (R.best) lines.push('いちばん心に残った日：' + R.best.label + '――' + R.best.why);
    X.C.forEach(function (c) { c.afterDone = true; });
    return { headline: (res.outcome || '') + '。', stats: [['日数', R.days + '日'], ['願望の行動', R.acts + '回'], ['喧嘩', R.fights + '回']].concat(HK.SAFE_ON ? [] : [['エッチ', R.sex + '回']]), lines: lines };
  };

  HK.SCENARIOS[ID] = scen;
})();
