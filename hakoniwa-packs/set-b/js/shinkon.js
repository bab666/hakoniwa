/* 新婚部屋（追加パック set-b の部屋。エンジン型。両方のビルド）
   結婚したばかりの二人（か、元の関係のまま一緒に暮らし始めた二人）の毎日を、朝・日中・夜の3区切りで眺める。最後の夜は幸せなキスで一区切り。
   2026-11-03 利用者のフィードバックで作り直し（docs/reports/2026-11-03/shinkon-feedback.md・shinkon-design.md）：
   ・利用者のソロジャーナルの表は「何が起きたか」の種として内部で引くだけ（記録の行・表の名前は画面に出さない）。願望は場面の文で表す
   ・受け止め方・決着は、性格（態度9種）・関係・らしくない行動（運命の揺らぎ）で変わる（shinkon-react.js）。本体の共通の出来事（関係ごとの出来事・らしくない行動など）も混ぜる
   ・暮らしの困りごと 17 種（shinkon-trouble.js）、他の住人（参加者の三人目から）の訪れ（shinkon-visit.js）
   ・家事をしない設定の人は料理・家事をしない（HK.Life.canCook／canChore）。ポンコツの出来事は「家事が苦手（ポンコツ）」の役割の人がいるときだけ
   ・なれそめ「元の関係のまま」（既定）：住人の関係の設定をそのまま使う。ほかを選ぶと二人の関係を新婚の夫婦に上書きする（家族などで「恋愛：なし」の関係は上書きしない）
   ・R18版の夜は shinkon-r18.js（描写の有無・長さ・作風は本体の共通の設定 HK.Lewd。エッチ多めなら一度は長い場面）
   部品：暮らしの状態は HK.Life、願望の高まり・表を引くのは HK.Journal（本体のかたまり pack-roomkit）、文の仕上げは HK.ShinkonKit（話し手の目印）。登場人物はすべて成人として扱う */
/* @event scen=set-b-shinkon id=sk_setup cat=romance tie=- label=新婚の二人の暮らしが始まる */
/* @event scen=set-b-shinkon id=sk_morning cat=romance tie=- label=二人の朝の様子（10種） */
/* @event scen=set-b-shinkon id=sk_work cat=solo tie=- label=仕事の型ごとの日中の様子 */
/* @event scen=set-b-shinkon id=sk_daily cat=romance tie=- label=日替わりの出来事（52種） */
/* @event scen=set-b-shinkon id=sk_date cat=romance tie=- label=休日のデート（52種） */
/* @event scen=set-b-shinkon id=sk_ponkotsu cat=romance tie=- cond=家事が苦手（ポンコツ）の人がいる label=家事が苦手な人のやらかし（52種） */
/* @event scen=set-b-shinkon id=sk_fight cat=conflict tie=- label=新婚の小さな喧嘩 */
/* @event scen=set-b-shinkon id=sk_makeup cat=bond tie=- label=喧嘩した日の寝る前の仲直り */
/* @event scen=set-b-shinkon id=sk_wish cat=romance tie=- label=願望が高まったときの行動（100種） */
/* @event scen=set-b-shinkon id=sk_meal cat=romance tie=- label=朝昼晩のご飯の時間（156種） */
/* @event scen=set-b-shinkon id=sk_end cat=romance tie=- label=一日の終わりに思うこと（52種） */
/* @event scen=set-b-shinkon id=sk_kiss cat=romance tie=- label=最後の夜の幸せなキス */
/* @event scen=set-b-shinkon id=sk_hug cat=bond tie=- label=最後の夜に明日の話をする */
(function () {
  'use strict';
  var HK = window.HK;
  var D = HK.ShinkonData;
  if (!D || !HK.Life || !HK.Journal || !HK.ShinkonKit) return;
  var ID = 'set-b-shinkon', J = HK.Journal, LF = HK.Life, K = HK.ShinkonKit;
  var PART = ['朝', '日中', '夜'], WEEK = ['月', '火', '水', '木', '金', '土', '日'];
  function TX() { return HK.ShinkonText || {}; }
  function RC() { return HK.ShinkonReact; }
  function pickOf(ctx, arr) { return arr && arr.length ? arr[Math.floor(ctx.rng() * arr.length)] : ''; }
  var soft = K.soft;
  function fill(ctx, t, a, b, ex) { return K.fill(ctx, t, a, b, ex); }
  /* 恋愛にならない二人のときに出さない文（キス・嫉妬・甘え・デートなど、恋人どうしを前提にした文） */
  var ROM = /キス|いちゃ|嫉妬|ヤキモチ|甘え|抱き|膝枕|好き|愛|デート|ナンパ|記念日|触れ合|スキンシップ|独り占め|寄り添|ペアリング|彼シャツ|添い|一緒に寝|ぎゅっ|ムラムラ|エッチ|色っぽ|夢に相手/;
  /* 結婚していない二人（元の関係のまま、恋人どうしの関係でない）に出さない文 */
  var WED = /結婚|新婚|夫婦|入籍|式場|新妻|新郎|新婦|伴侶|旦那|奥さん|結婚指輪|指輪/;
  /* 家事・料理（担い手の点検。shinkon-kit の点検と同じ語） */
  var COOK = /料理(?:を(?:作|し|する)|して|した|中|の腕を)|手料理を(?:作|振る舞)|台所に立|キッチンに立|包丁|フライパン|鍋(?:を(?:火|かき|焦)|に火)|味見|味付け|下ごしらえ|弁当を(?:作|詰)|煮物を|炒め|茹で|揚げ物を|刻ん|盛り付け|炊い|(?:ご飯|ごはん|朝食|夕飯|夕食|昼食|お昼|おかず|朝ごはん|夜ごはん|スープ|カレー|味噌汁|お菓子|ケーキ|おにぎり|パン|トースト|オムライス|クッキー|お粥|おかゆ)を(?:作|焼|用意|握|温め|こしらえ)|(?:ご飯|ごはん|夕飯|食事|朝食|朝ごはん)の(?:支度|用意)/;
  var CHORE = /家事|洗濯|掃除|洗い物|皿を洗|食器を洗|畳ん|(?<!折り)たたん|干し|ゴミ出し|アイロン|拭き掃除|(?:部屋|台所|家のこと|食卓|テーブル)を(?:ひと通り)?片(?:づ|付)け/;
  function romRow(x) { return ROM.test(typeof x === 'string' ? x : ((x && x.k) || '') + ((x && x.t) || '')); }
  function f(ctx) { return ctx.sk; }
  /* 文の候補を、二人に合うものに絞る（恋愛・結婚・家事の担い手・関係） */
  function okText(ctx, x, a, b) {
    var S = f(ctx);
    if (typeof x !== 'string') return true;
    if (S && !S.love && ROM.test(x)) return false;
    if (S && !S.wed && WED.test(x)) return false;
    if (!choreOk(x, a, b)) return false;
    return true;
  }
  /* 家事・料理の文の担い手：文の中で家事・料理をしている人（その文の主語）が、家事をしない設定の人なら使わない */
  function choreOk(t, a, b) {
    if (!(COOK.test(t) || CHORE.test(t))) return true;
    var ss = String(t).replace(/「[^」]*」/g, '').split(/[。\n]/), carry = null;
    for (var i = 0; i < ss.length; i++) {
      var s = ss[i]; if (!s) continue;
      var re = new RegExp(COOK.source + '|' + CHORE.source, 'g'), m;
      while ((m = re.exec(s))) {
        var pre = s.slice(0, m.index), sub = null, mm, r2 = /\{([ab])\}(?:は|が|も)/g;
        while ((mm = r2.exec(pre))) sub = mm[1];
        if (!sub) sub = carry;
        var two = /二人で|二人は|二人して|ふたりで|一緒に|手分け/.test(pre + m[0]);
        var who = two ? ['a', 'b'] : sub ? [sub] : ['a'], ck = COOK.test(m[0]);
        for (var k = 0; k < who.length; k++) {
          var c = who[k] === 'a' ? a : b;
          if (!c || !c.life) continue;
          if (ck && !LF.canCook(c)) return false;
          if (!ck && !LF.canChore(c)) return false;
        }
      }
      var last = null, r3 = /\{([ab])\}(?:は|が)/g, m3; while ((m3 = r3.exec(s))) last = m3[1];
      if (last) carry = last;
    }
    return true;
  }
  /* 地の文：表の名前・行の番号で shinkon-text*.js を引く。無ければ fb */
  function prose(ctx, key, i, fb, a, b) {
    var T = TX()[key], p = T && T[i];
    if (Array.isArray(p)) {
      p = p.filter(function (x) { return okText(ctx, x, a, b); });
      if (HK.relFilter && a && b) { var r = HK.relFilter(ctx, p, a, b); if (r) p = r; }
      if (p.length) return pickOf(ctx, p);
      return fb && okText(ctx, fb, a, b) ? fb : '';
    }
    if (typeof p === 'string' && p && okText(ctx, p, a, b)) return p;
    return fb && okText(ctx, fb, a, b) ? fb : '';
  }
  SKX();
  function SKX() { HK.Shinkon = { okText: okText, choreOk: choreOk, ROM: ROM, WED: WED, COOK: COOK, CHORE: CHORE }; }
  /* 恋愛にしてよい二人か（恋愛対象・恋愛相手の固定・関係の「恋愛：なし」（家族・無関心・恐怖など）を両方向で） */
  function canLove2(ctx, a, b) {
    if (HK.canLove && !(HK.canLove(a, b, ctx) && HK.canLove(b, a, ctx))) return false;
    if (HK.tieLoveNoPair && (HK.tieLoveNoPair(ctx, a, b) || HK.tieLoveNoPair(ctx, b, a))) return false;
    if (HK.Ties && HK.Ties.apathy && (HK.Ties.apathy(ctx, a, b) || HK.Ties.apathy(ctx, b, a))) return false;
    if (ctx.pair && ctx.pair(a, b).kin) return false;
    return true;
  }

  /* ---------- 願望（おまかせは気質から。全年齢では「もっとエッチなこと」を選ばない） ---------- */
  var WISH_FIT = [
    function (t) { return (t.np || 0) * 0.4 + (t.ac || 0) * 0.3; },
    function (t) { return (t.ac || 0) * 0.5 + (t.fc || 0) * 0.3; },
    function (t) { return (t.np || 0) * 0.5 + 0.1; },
    function (t) { return (t.honesty || 0) * 0.5 + (t.np || 0) * 0.2; },
    function (t) { return (t.fc || 0) * 0.5 + (t.warmth || 0) * 0.3; },
    function (t) { return (t.np || 0) * 0.6 + (t.cp || 0) * 0.2; },
    function (t) { return (t.a || 0) * 0.4 + (t.fc || 0) * 0.3; },
    function (t) { return (t.ac || 0) * 0.4 + (t.warmth || 0) * 0.3; },
    function (t) { return (t.jealous || 0) * 0.7 + (t.cp || 0) * 0.2; },
    function (t) { return (t.impulse || 0) * 0.5 + (t.fc || 0) * 0.3; }
  ];
  function wishOf(ctx, c, pick) {
    var n = D.WISH.length;
    if (pick != null && pick !== 'auto' && pick !== '') { var k = +String(pick).replace(/^w/, ''); if (k >= 0 && k < n && !(k === 9 && HK.SAFE_ON)) return k; }
    var love = ctx.sk ? ctx.sk.love : true, idx = [];
    for (var i = 0; i < n; i++) if (!(i === 9 && HK.SAFE_ON) && (love || [0, 2, 5, 6].indexOf(i) >= 0)) idx.push(i);
    return HK.weighted(ctx.rng, idx, function (i) { return Math.pow(Math.max(0.05, WISH_FIT[i](c.tr || {})), 2); });
  }
  function wishName(i) { return String(D.WISH[i].t).split(/\s/)[0]; }

  /* ---------- 箱庭 ---------- */
  function opts(list, auto) { return [{ v: 'auto', label: auto || 'おまかせ' }].concat(list.map(function (t, i) { return { v: 'x' + i, label: t }; })); }
  var REL_SHORT = ['幼なじみ', '元ライバル', '長い片想いの相手', '元同僚', '文通やネットで知り合った仲', '家族ぐるみの付き合い', '復縁した元恋人', '運命的な衝動婚', '拾った・拾われた関係', '初めて付き合った相手どうし'];
  function relShort(i) { return REL_SHORT[i] || String(D.REL[i] || '').split(/\s/)[0]; }
  var scen = {
    id: ID, name: '新婚部屋', kicker: 'ふたり・日常',
    desc: '結婚したばかりの二人の毎日を、朝・日中・夜ごとに眺める。暮らしの中で願望が高まると出来事が起き、困りごとや来客もある。同じ出来事でも、性格や関係で受け止め方が変わる。最後の夜は幸せなキスで一区切り。',
    note: '※参加者の最初の二人（住人ごとの「立場」で選べます）が新婚の二人です。三人目からは「他の住人」として、遊びに来たり連絡をくれたりします。登場人物はすべて成人として扱います。',
    unit: '日', perUnit: 3, preRel: 0, lethal: false, minCast: 2, maxCast: 4,
    catBias: { romance: 1, bond: 1, help: 1, conflict: 0.3, combat: 0, betray: 0, kill: 0 },
    decay: 0.998, actRate: 0.2,
    derived: ['warmth', 'honesty', 'jealous', 'impulse'],
    exclude: [],
    env: [
      { id: 'days', label: '日数', min: 5, max: 14, def: 7, lo: '5日', hi: '14日', unit: '日', desc: '見守る日数。1日は朝・日中・夜の3区切り。最後の夜は幸せなキスで一区切り' },
      { id: 'home', label: '二人の住まい', type: 'select', def: 'auto', options: opts(D.HOME), desc: '二人が暮らす家' },
      { id: 'rel', label: '二人のなれそめ', type: 'select', def: 'keep', options: [{ v: 'keep', label: '元の関係のまま（住人の関係の設定どおり）' }].concat(opts(D.REL.map(function (t, i) { return relShort(i); }), 'おまかせ（新しく決める）')),
        desc: '「元の関係のまま」なら、住人の関係の設定（友人・擬似親子・同僚など）をそのまま使って暮らします（関係が無ければ新婚の夫婦）。【注意】ほかを選ぶと、二人のあいだに設定した関係を「新婚の夫婦」に上書きします（家族などで恋愛が「なし」の関係は上書きしません）' },
      { id: 'meet', label: '出会いの場所', type: 'select', def: 'auto', options: opts(D.MEET.map(function (t) { return t.split(/\s/)[0]; })), desc: '二人が出会った場所' },
      { id: 'speed', label: '願望の高まりやすさ', type: 'select', def: 'normal', options: [{ v: 'slow', label: 'ゆっくり' }, { v: 'normal', label: 'ふつう' }, { v: 'fast', label: '早い' }], desc: '早いほど、願望から来る行動が多く起きる' },
      { id: 'others', label: '他の住人を出す', type: 'select', def: 'on', options: [{ v: 'on', label: '出す（参加者の三人目からが遊びに来る・連絡をくれる）' }, { v: 'off', label: '出さない（二人だけ）' }], desc: '参加者の三人目から（住人ごとの「立場」で「他の住人」にした人）のうち、新婚の二人のどちらかと関係（家族・友人・同僚・同級生・元恋人など）がある人が、遊びに来たり、一緒に出かけたり、連絡をくれたりします。元恋人が来た日は、ヤキモチから始まる夜も' }
    ],
    stats: [],
    perFields: [
      { id: 'part', label: '立場', auto: 'おまかせ（上から二人が新婚の二人）', options: [{ id: 'couple', label: '新婚の二人' }, { id: 'guest', label: '他の住人（訪ねてくる側）' }] },
      { id: 'work', label: '仕事の型', auto: 'おまかせ（気質から）', options: LF.WORK.map(function (w) { return { id: w.v, label: w.label }; }) },
      { id: 'job', label: '職業', type: 'text', placeholder: function () { return '例：営業、看護師（空欄でもよい）'; } },
      { id: 'role', label: '家庭での役割', auto: 'おまかせ（気質から）', options: LF.ROLE.map(function (r) { return { id: r.v, label: r.label }; }) },
      { id: 'wish', label: '願望', auto: 'おまかせ（気質から）', options: D.WISH.map(function (w, i) { return { id: 'w' + i, label: wishName(i) }; }) }
    ],
    actions: [{ id: 'live', label: 'いつもどおりに暮らす', fit: function () { return 0.5; } }],
    goals: [{ id: 'happy', label: '幸せに暮らしたい', fit: function () { return 0.5; } }],
    steps: function (env) {
      var n = Math.max(5, Math.min(14, +env.days || 7)), s = [];
      for (var d = 0; d < n; d++) for (var t = 0; t < 3; t++) s.push('DAY' + (d + 1) + '（' + WEEK[d % 7] + '）' + PART[t]);
      return s;
    },
    /* 新婚の二人の関係：元の関係のまま（既定）で二人のあいだに関係が無いか、なれそめを選んだ（上書き）ときは、夫婦の関係を足す（恋愛にしてよい二人だけ） */
    extraTies: function (ctx, input) {
      var cp = couple(ctx.chars, input), A = cp[0], B = cp[1];
      if (!A || !B || A === B) return [];
      var has = (input.ties || []).some(function (t) { return (t.a === A.i && t.b === B.i) || (t.a === B.i && t.b === A.i); });
      if (has) return [];
      if (HK.canLove && !(HK.canLove(A, B, ctx) && HK.canLove(B, A, ctx))) return [];
      return [{ a: A.i, b: B.i, type: 'spouse', spouse: true }];
    },
    othersFor: function (ctx, a) { var S = ctx.sk; return ctx.present().filter(function (c) { return c !== a && (!S || ((a === S.A || a === S.B) && (c === S.A || c === S.B))); }); },
    setup: function (ctx) { setup(ctx); },
    phase: function (ctx, s, n) { phase(ctx, s, n); },
    finish: function (ctx) { finish(ctx); },
    events: []
  };
  /* R18版：エッチの回数 */
  if (!HK.SAFE_BUILD) scen.env.push({ id: 'lewdN', label: 'エッチの回数（R18）', type: 'select', def: 'mid', options: [{ v: 'low', label: '少なめ（1回）' }, { v: 'mid', label: 'ふつう（1〜2回）' }, { v: 'high', label: '多め（2〜3回。一度は長い場面）' }], desc: '一回の遊びの中で起きるエッチの場面の回数の目安（体の関係にしてよい二人だけ）。多めなら一度は段落を分けた長い場面になる（描写の長さが「数行で短く」のときを除く）' });

  /* 新婚の二人（住人ごとの「立場」。おまかせは上から） */
  function partOf(input, i) { var p = input && input.perChar && input.perChar[i]; return p && p.pick ? p.pick.part : null; }
  function couple(C, input) {
    var ok = C.filter(function (c) { return partOf(input, c.i) === 'couple'; });
    C.forEach(function (c) { if (ok.length < 2 && ok.indexOf(c) < 0 && partOf(input, c.i) !== 'guest') ok.push(c); });
    C.forEach(function (c) { if (ok.length < 2 && ok.indexOf(c) < 0) ok.push(c); });
    return ok.slice(0, 2);
  }
  function sel(ctx, id, list) {
    var v = ctx.env[id];
    if (typeof v === 'string' && /^x\d+$/.test(v)) { var k = +v.slice(1); if (k < list.length) return k; }
    return Math.floor(ctx.rng() * list.length);
  }
  function pickOfChar(ctx, c, k) { var p = ctx.input && ctx.input.perChar && ctx.input.perChar[c.i]; return p && p.pick ? p.pick[k] : null; }
  /* 共通の出来事から外すもの：体の関係の出来事（この部屋の夜は shinkon-r18.js が、きっかけの段を付けて出す）・合意のない展開・三人以上の恋愛・告白（もう夫婦）など */
  var EX_ID = /^(?:confess|take_charge|brood|lighten|mob_after|tie_spouse|grp_|poly_|ct_|cf_)/;
  function poolSetup() { scen.exclude = (HK.COMMON || []).filter(function (e) { return e.sex || e.force || EX_ID.test(e.id); }).map(function (e) { return e.id; }); }
  /* 元の関係のまま遊ぶときの、関係の種類と名前 */
  var LOVE_T = /^(lover|spouse|fiance|mate|fated|ex|crush|almost|fwb|honmei)$/;
  function relInfo(ctx, A, B) {
    var tl = HK.Ties && HK.Ties.all ? HK.Ties.all(ctx, A, B) || [] : [];
    var t = tl.filter(function (x) { return x && x.type !== 'noobs'; })[0];
    var cls = HK.relClass ? HK.relClass(ctx, A, B) : 'none';
    var lab = t && HK.TIES[t.type] ? HK.TIES[t.type].label : '';
    return { t: t, cls: cls, label: lab, loveTie: !t || tl.some(function (x) { return LOVE_T.test(x.type); }) };
  }

  function setup(ctx) {
    poolSetup();
    var C = ctx.chars, cp = couple(C, ctx.input), A = cp[0], B = cp[1] || cp[0], env = ctx.env;
    var days = Math.max(5, Math.min(14, +env.days || 7));
    ctx.place = '二人の新居';
    var keep = !env.rel || env.rel === 'keep';
    var ri = relInfo(ctx, A, B);
    var S = ctx.sk = { days: days, A: A, B: B, G: C.filter(function (c) { return c !== A && c !== B; }), others: env.others === 'off' ? 'off' : 'on',
      home: sel(ctx, 'home', D.HOME), rel: keep && ri.t && !/^(spouse|lover|fiance|mate)$/.test(ri.t.type) ? -1 : sel(ctx, 'rel', D.REL), keep: keep, ri: ri, meet: sel(ctx, 'meet', D.MEET), meet2: 0,
      speed: env.speed === 'slow' ? 0.7 : env.speed === 'fast' ? 1.45 : 1, love: canLove2(ctx, A, B), day: null, fights: 0, makeups: 0, acts: 0, sex: 0, kissed: false, best: null, lewdMax: 0,
      troubles: 0, visits: 0, odd: 0 };
    /* 結婚している二人か：元の関係のままで、二人の関係が恋人・夫婦などの関係（か、関係なし）。なれそめを選んだら、恋愛にしてよい二人は夫婦 */
    S.wed = S.love && (keep ? ri.loveTie : true);
    /* 他の住人：出番のときだけ場に出す（ほかの区切りは留守。共通の出来事に混ざらないように） */
    S.G.forEach(function (g) { g.gone = true; g.life = g.life || { job: '' }; });
    var night1 = !HK.SAFE_ON && S.love && !(HK.Pos && HK.Pos.libNone && HK.Pos.libNone([A, B]));
    S.meet2 = HK.weighted(ctx.rng, D.MEET2.map(function (x, i) { return i; }), function (i) { return i === 9 && !night1 ? 0 : 1; });
    [A, B].forEach(function (c) {
      var job = pickOfChar(ctx, c, 'job');
      c.life = { job: job ? String(job).slice(0, 20) : '' };
      LF.role(ctx, c, pickOfChar(ctx, c, 'role'));
      LF.work(ctx, c, pickOfChar(ctx, c, 'work'));
      var w = wishOf(ctx, c, pickOfChar(ctx, c, 'wish'));
      J.wish(ctx, c, w, D.WISH[w].init);
    });
    if (!HK.SAFE_ON && HK.ShinkonR18 && HK.ShinkonR18.quota) S.lewdMax = HK.ShinkonR18.quota(ctx, env.lewdN);
    /* 二人の紹介 */
    var home = D.HOME[S.home], meet = D.MEET[S.meet].split(/\s/)[0], intro;
    if (S.rel >= 0) {
      intro = prose(ctx, 'SETUP', 0, '{a}と{b}は、結婚したばかりの二人だ。住まいは{home}。{rel}――出会いは{meet}だった。', A, B);
      if (!S.wed) intro = pickOf(ctx, NW_SETUP);
    } else if (S.wed) intro = pickOf(ctx, KEEP_WED);
    else intro = pickOf(ctx, NW_SETUP);
    var rl = S.rel >= 0 && S.wed ? relShort(S.rel) : ri.label || '同居人';
    var tx = fill(ctx, intro, A, B, { home: home, rel: rl, meet: meet });
    /* 元の関係のまま：関係の色の一文 */
    if (S.rel < 0 && RC()) { var rc = RC().rel(ctx, ri.cls); if (rc) tx += fill(ctx, rc, A, B, { rel: rl }); }
    ctx.act2({ actors: [A, B], cat: S.love ? 'romance' : 'bond', text: tx, why: '新婚部屋：二人の始まり' + (S.rel < 0 ? '（元の関係のまま：' + rl + '）' : '') });
  }
  /* 元の関係のまま、恋人どうしの関係（か夫婦）の二人の紹介。{rel}＝関係の名前 */
  var KEEP_WED = [
    '{a}と{b}は、{rel}から夫婦になったばかりだ。新しい暮らしの舞台は、{home}。玄関には、二人分の靴が並んでいる。',
    '{home}で、{a}と{b}の新婚の暮らしが始まった。{rel}だった二人が、今日からは同じ家に帰ってくる。段ボールはまだいくつか残っていた。',
    '{a}は、隣で荷ほどきをする{b}を見て、まだ少し信じられない気持ちでいた。{rel}だった二人が、結婚して、同じ家で暮らしている。今日から二人の家は、{home}だ。'
  ];
  /* 結婚していない二人（元の関係のまま・恋愛にならない二人）の紹介 */
  var NW_SETUP = [
    '{a}と{b}は、{rel}のまま、{home}で一緒に暮らし始めた。段ボールはまだいくつか残っているけれど、玄関には二人分の靴が並んでいる。',
    '{home}の窓から、朝の光が差し込んでいる。{rel}どうしの{a}と{b}が同じ家で暮らし始めて、まだ数日しかたっていない。',
    '{a}と{b}の新しい暮らしの舞台は、{home}。{rel}として過ごしてきた二人の、少し照れくさい同居の日々が始まった。'
  ];

  /* ---------- 一日の種を引く（朝に、その日の分をまとめて） ---------- */
  function holiday(d) { return d % 7 === 5 || d % 7 === 6; }
  /* 日替わりの種の選ばれやすさ（性格で）：{a}＝主役（願望の高い人）の気質 */
  var DAILY_FIT = {
    '記念日が近い': function (t) { return 0.6 + (t.np || 0) * 0.8; }, '甘えたい／甘えられたい': function (t) { return 0.5 + (t.ac || 0) * 1.2; },
    '夜更かしして語り合う': function (t) { return 0.6 + (t.fc || 0) * 0.8; }, '家でのんびり過ごす': function (t) { return 0.6 + (1 - (t.fc || 0.5)) * 0.8; },
    '外出の予定': function (t) { return 0.5 + (t.fc || 0) * 1; }, 'いつもと違う日常': function (t) { return 0.5 + (t.impulse || 0) * 1; },
    'マンネリ解消': function (t) { return 0.4 + (t.fc || 0) * 0.6 + (t.impulse || 0) * 0.5; }, '過去を振り返る': function (t) { return 0.5 + (t.np || 0) * 0.5 + (t.ac || 0) * 0.4; }
  };
  function rollDay(ctx, d) {
    var S = f(ctx), A = S.A, B = S.B, hol = holiday(d);
    var pa = LF.day(ctx, A, d, hol), pb = LF.day(ctx, B, d, hol), apart = pa.trip || pb.trip;
    var hi = J.of(ctx, A).pt >= J.of(ctx, B).pt ? A : B;
    var day = { d: d, hol: hol, pa: pa, pb: pb, apart: apart, hi: hi, lo: hi === A ? B : A };
    var lv = S.love, nr = function (x) { return lv || !romRow(x) ? 1 : 0; }, nw = function (x) { return S.wed || !WED.test((x.k || '') + (x.t || '')) ? 1 : 0; };
    day.intro = J.pick(ctx, 'intro', D.INTRO, function (x, i) { return (apart && i === 4 ? 0 : 1) * nr(x); });
    day.introI = D.INTRO.indexOf(day.intro);
    /* 日替わり：離れている日は連絡・忙しさ、休日はデートも、家事が苦手（ポンコツ）の人がいるときだけポンコツの出来事も */
    var clumsy = [A, B].some(function (c) { return LF.clumsy(c); });
    var noChore = !LF.canChore(A) || !LF.canChore(B);
    var src = 'DAILY';
    if (!apart && hol && D.DATE && lv && ctx.rng() < 0.45) src = 'DATE';
    else if (!apart && clumsy && D.PONKOTSU && ctx.rng() < 0.26) src = 'PONKOTSU';
    day.src = src;
    var ht = hi.tr || {};
    day.daily = J.pick(ctx, src, D[src], function (x) {
      if (!nr(x) || !nw(x)) return 0;
      if (src !== 'DAILY') return 1;
      /* 「普段家事をしない人も、分け合って手伝う」は、家事をしない設定の人がいる二人には出さない */
      if (noChore && /家事/.test(x.t)) return 0;
      if ((!LF.canCook(A) || !LF.canCook(B)) && /料理|作る|作って/.test(x.t)) return 0;
      if (apart) return /連絡|忙しい/.test(x.k) ? 3 : 0;
      var w = DAILY_FIT[x.k] ? DAILY_FIT[x.k](ht) : 1;
      return (/連絡/.test(x.k) ? 0.3 : 1) * w;
    });
    day.dailyI = D[src].indexOf(day.daily);
    if (ctx.rng() < 0.35) { day.item = J.pick(ctx, 'item', D.ITEM); day.itemI = D.ITEM.indexOf(day.item); }
    if (!apart && ctx.rng() < 0.4) { var mr = ctx.rng(); day.mealK = mr < 0.3 ? 'BREAKFAST' : hol && mr < 0.6 ? 'LUNCH' : 'DINNER'; day.meal = pickMeal(ctx, day); }
    if (ctx.rng() < 0.12 || (day.daily && /記念日/.test(day.daily.k))) day.special = J.pick(ctx, 'special', D.SPECIAL);
    if (day.daily && /喧嘩/.test(day.daily.t + (day.intro && day.intro.t))) day.fight = J.pick(ctx, 'fight', D.FIGHT, function (x) { return fightOk(x, S) ? 1 : 0; });
    day.fightInDaily = !!(day.daily && /喧嘩/.test(day.daily.t));
    /* 昨夜の言い合いの朝：喧嘩っ早い二人ほど、昼にもう一度ぶつかる */
    var cpk = ((A.tr && A.tr.cp) || 0.5) + ((B.tr && B.tr.cp) || 0.5);
    if (day.introI === 0 && ctx.rng() < 0.3 + cpk * 0.25) day.fight = day.fight || J.pick(ctx, 'fight', D.FIGHT, function (x) { return fightOk(x, S) ? 1 : 0; });
    /* 暮らしの困りごと */
    if (HK.ShinkonTrouble) day.trouble = HK.ShinkonTrouble.roll(ctx, S, day);
    return day;
  }
  /* 喧嘩の種：家事のやり方の喧嘩は、家事をしない設定の人がいる二人でも（文は shinkon-text の側で担い手を見る） */
  function fightOk(x, S) { return S.love || !ROM.test(x); }
  /* ご飯の種：作る人（料理をする人）がいるか。外食・出来合い・別々の行は作る人がいなくてもよい */
  var MEAL_NONE = /喫茶店|テイクアウト|旅先の朝|カフェで|外食|別々|バラバラ|コンビニ|夜景|レストラン|デート帰り|別行動/;
  function mealNeed(row) { if (MEAL_NONE.test(row.k)) return 'none'; if (/ふたりで料理/.test(row.k)) return 'both'; if (/不慣れ/.test(row.k)) return 'clumsy'; return 'cook'; }
  function pickMeal(ctx, day) {
    var S = f(ctx), A = S.A, B = S.B, K0 = day.mealK, lv = S.love;
    var ca = LF.canCook(A), cb = LF.canCook(B);
    /* 帰りが遅い人は夕飯を作らない */
    if (K0 === 'DINNER') { if (day.pa.late) ca = false; if (day.pb.late) cb = false; }
    var unskilled = [A, B].filter(function (c) { return LF.canCook(c) && (LF.clumsy(c) || (LF.roleInfo(c.life.role) || {}).cook <= 0.5); });
    var row = J.pick(ctx, K0, D[K0], function (x) {
      if (!(lv || !romRow(x))) return 0;
      var n = mealNeed(x);
      if (n === 'both') return ca && cb ? 1 : 0;
      if (n === 'cook') return ca || cb ? 1 : 0;
      if (n === 'clumsy') return unskilled.length ? 1 : 0;
      return ca || cb ? 0.8 : 3;
    });
    if (!row) return null;
    var n = mealNeed(row), cook = null;
    if (n === 'clumsy') cook = unskilled.length > 1 ? (ctx.rng() < 0.5 ? unskilled[0] : unskilled[1]) : unskilled[0];
    else if (n === 'cook' || n === 'both') cook = LF.cookOf(ctx, [ca ? A : null, cb ? B : null].filter(Boolean));
    day.mealI = D[K0].indexOf(row); day.mealNeed = n; day.cook = cook;
    return row;
  }
  /* 理由の欄に出す種の言葉：遊び方の言葉（表・願望pt）を外す */
  function clean(t) { return String(t || '').replace(/\s*[（(]?食材表[^）)]*[）)]?/g, '').replace(/願望ptが(?:多い|高い)(?:ほう|方)が/g, '').replace(/\s+/g, ' ').trim(); }
  function dailyText(day) { return day.daily ? clean((day.daily.k ? day.daily.k + '／' : '') + day.daily.t) : ''; }
  var SRC_NAME = { DAILY: '日中の出来事', DATE: '休日のデート', PONKOTSU: '家事が苦手な人のやらかし' };

  /* 願望を高め、越えた分の願望の行動を出す */
  function gain(ctx, c, n) { var S = f(ctx); return J.add(ctx, c, Math.max(0, Math.round(n * S.speed))); }
  function wishActs(ctx, c, k) {
    var S = f(ctx), w = J.of(ctx, c), o = c === S.A ? S.B : S.A;
    for (var i = 0; i < k; i++) {
      var list = (TX().WISH4 && w.d === 3) ? TX().WISH4 : D.WISH[w.d].acts;
      var act = J.pick(ctx, 'act' + w.d + '_' + c.i, list, function (x) { return (S.love || !romRow(x)) && (S.wed || !WED.test(x.t)) ? 1 : 0; });
      if (!act) continue;
      var ai = list.indexOf(act), wn = wishName(w.d);
      var T = TX().ACT && TX().ACT[w.d] && TX().ACT[w.d][ai];
      if (w.d === 9 && ai === 9 && HK.Pos && HK.Pos.order && HK.Pos.order(c, o)[0] !== c) T = ['{a}は布団の上で{b}に体を預け、腕を引いて自分のほうへ倒れ込ませた。間近で見下ろしてくる{b}の目を、{a}はじっと見上げた。「……どうする？｜……どうする｜……どうしますか」', '{a}は{b}のシャツの裾を握って、ベッドの端まで引っぱった。{a}が先に仰向けになると、{b}は息を呑んで、その上に覆いかぶさった。'];
      if (Array.isArray(T)) T = T.filter(function (x) { return okText(ctx, x, c, o); });
      var t = Array.isArray(T) && T.length ? pickOf(ctx, T) : '{a}の気持ちが、また少し高まった。{a}は、' + act.t.replace(/。$/, '') + '。';
      /* 受け止め方：相手（o）の態度で（らしくない反応もある） */
      var tx = fill(ctx, t, c, o), odd = false;
      if (RC() && ctx.rng() < 0.5) { var r = RC().say(ctx, 'warm', o, c); if (r.text) { tx += fill(ctx, r.text, o, c); odd = r.odd; if (odd) tx += fill(ctx, RC().after(ctx, S.love), o, c); } }
      var e = ctx.act2({ actors: [c, o], cat: S.love ? 'romance' : 'bond', text: tx, odd: odd, why: '新婚部屋：願望が高まった（' + c.name + '：' + wn + '）', fx: function () { ctx.mod2(c, o, { aff: 3, att: S.love ? 2 : 0 }, { aff: 2 + persK(o, 'warm'), att: S.love ? 2 : 0 }); } });
      if (e) { S.acts++; J.count(ctx, 'acts'); if (odd) S.odd++; }
      S.day.urge = Math.max(S.day.urge || 0, w.d === 9 ? 1 : /^(4|7|8)$/.test(String(w.d)) ? 0.55 : 0.3);
      S.day.urgeBy = S.day.urgeBy || c;
    }
  }
  /* 性格による関係の動きの大きさ（受け止める人の態度で。健気・穏やか・内気はうれしいことに大きく動き、冷静・厳格は小さい） */
  var PK_WARM = { devoted: 3, gentle: 2.5, shy: 2.5, free: 2, tsun: 2, polite: 1.5, proud: 1.5, stern: 1, cool: 1 };
  function persK(c, kind) { var p = RC() ? RC().per(c) : 'gentle'; return kind === 'warm' ? PK_WARM[p] || 1.5 : 1; }
  /* 出来事の文に受け止め方を足す：who＝受け止める人、other＝相手。{ text, odd } */
  function withReact(ctx, kind, who, other, p) {
    if (!RC() || ctx.rng() > (p == null ? 0.6 : p)) return { text: '', odd: false };
    var r = RC().say(ctx, kind, who, other);
    if (!r.text || !okText(ctx, r.text, who, other)) return { text: '', odd: false };
    var t = fill(ctx, r.text, who, other);
    if (r.odd) t += fill(ctx, RC().after(ctx, f(ctx).love), who, other);
    return { text: t, odd: r.odd };
  }

  function phase(ctx, s, n) {
    var S = f(ctx), A = S.A, B = S.B, d = Math.floor(s / 3), t = s % 3;
    if (A === B) return;
    if (s === 0) {
      ctx._touched = ctx._touched || {}; ctx._mag = ctx._mag || 0;
      if (S.love) ctx.mod2(A, B, { aff: 45, trust: 35, att: 45 }, { aff: 45, trust: 35, att: 45 });
      else ctx.mod2(A, B, { aff: 30, trust: 30 }, { aff: 30, trust: 30 });
    }
    /* 平日の日中は、それぞれの仕事：共通の出来事を少なく */
    scen.actRate = t === 1 && !holiday(d) ? 0.08 : 0.2;
    if (t === 0) {
      var day = S.day = rollDay(ctx, d);
      var it = day.introI, who = it === 9 || it === 2 || it === 3 ? (ctx.rng() < 0.5 ? A : B) : day.hi;
      var other = who === A ? B : A;
      var tx = prose(ctx, 'INTRO', it, '{a}の朝――' + (day.intro ? day.intro.t : '') + '。', who, other);
      ctx.act2({ actors: [who, other], cat: S.love && it !== 7 ? 'romance' : 'bond', text: fill(ctx, tx, who, other, { special: day.special || '' }), why: '新婚部屋：朝（' + (day.intro ? day.intro.t : '') + '）' });
      var k1 = gain(ctx, who, it === 9 ? 1 + Math.floor(ctx.rng() * 10) : 1 + Math.floor(ctx.rng() * 3)), k2 = gain(ctx, other, 1 + Math.floor(ctx.rng() * 2));
      day.pend = [[who, k1], [other, k2]];
      if (day.meal && day.mealK === 'BREAKFAST') meal(ctx, day);
      trouble(ctx, day, 'm');
      return;
    }
    var day2 = S.day;
    if (t === 1) {
      [A, B].forEach(function (c) {
        var pl = c === A ? day2.pa : day2.pb;
        if (day2.hol && !pl.trip) { if (ctx.rng() < 0.45) ctx.act2({ actors: [c], cat: 'solo', text: fill(ctx, LF.roleLine(ctx, c), c), why: '新婚部屋：休日の家のこと' }); return; }
        if (ctx.rng() < (pl.trip ? 1 : 0.6)) ctx.act2({ actors: [c], cat: 'solo', text: fill(ctx, LF.line(ctx, c, pl), c), why: '新婚部屋：' + (pl.trip ? '出張' : '仕事') + '（' + LF.workInfo(c.life.work).label + '）' });
      });
      trouble(ctx, day2, 'd');
      var dl = day2.daily, a = day2.hi, b = day2.lo;
      if (dl && /^(どちらかが忙しい|連絡がうまく取れない)$/.test(dl.k)) { var busy = day2.pa.late || day2.pa.trip ? A : day2.pb.late || day2.pb.trip ? B : null; if (busy) { a = busy === A ? B : A; b = busy; } }
      if (dl && /^(どちらかの体調が悪い)$/.test(dl.k) && ctx.rng() < 0.5) { var tmp = a; a = b; b = tmp; }
      /* ポンコツ：{b} が家事が苦手（ポンコツ）な人、{a} は見守る側 */
      if (day2.src === 'PONKOTSU') { var cA = LF.clumsy(A), cB = LF.clumsy(B); b = cA && cB ? (ctx.rng() < 0.5 ? A : B) : cA ? A : B; a = b === A ? B : A; }
      var fb = '{a}と{b}の一日――' + dailyText(day2) + '。' + (day2.item ? '鍵になったのは、' + day2.item.t + '。' : '');
      var dt = prose(ctx, day2.src, day2.dailyI, fb, a, b);
      var body = fill(ctx, dt, a, b, { item: day2.item ? day2.item.t : '', special: day2.special || '', fight: day2.fight || '' });
      /* 受け止め方：ポンコツは見守る側（a）が、忙しい・連絡は待つ側（a）が、ほかは相手（b）が */
      var neg = dl && /すれ違|喧嘩|踏み込|気まず|不安|失敗|忘れ|怒|拗ね|困|はぐれ|迷子|嫉妬|視線が気|落ち着かな/.test(dl.t);
      var rk = day2.src === 'PONKOTSU' ? ['oops', a, b] : dl && /忙しい|連絡/.test(dl.k) ? ['wait', a, b] : (dl && /体調/.test(dl.k)) || neg ? null : ['warm', b, a];
      var re = rk ? withReact(ctx, rk[0], rk[1], rk[2], 0.55) : { text: '', odd: false };
      var e = ctx.act2({ actors: [a, b], cat: S.love ? 'romance' : 'bond', text: body + re.text, odd: re.odd, why: '新婚部屋：' + SRC_NAME[day2.src] + '（' + soft(dailyText(day2)) + '）', fx: function () { var kw = rk && rk[0] === 'warm' ? persK(rk[1], 'warm') : 1; ctx.mod2(a, b, { aff: 2, att: S.love ? 2 : 0 }, { aff: 1 + kw, att: S.love ? 1 + kw * 0.5 : 0 }); } });
      if (re.odd && e) S.odd++;
      if (day2.fight) {
        S.fights++;
        var ft = prose(ctx, 'FIGHT', D.FIGHT.indexOf(day2.fight), '{a}と{b}は、' + day2.fight.replace(/。$/, '') + 'ことで、少し言い合いになった。', a, b);
        if (!day2.fightInDaily) {
          /* 喧嘩の受け止め方：言われた側（b）の態度。意地を張るか、すぐ折れるか */
          var fr = withReact(ctx, 'oops', b, a, 0.35);
          ctx.act2({ actors: [a, b], cat: 'conflict', text: fill(ctx, ft, a, b) + (fr.odd ? fr.text : ''), odd: fr.odd, why: '新婚部屋：小さな喧嘩（' + day2.fight + '）', fx: function () { ctx.mod2(a, b, { aff: -3, ten: 6 }, { aff: -3, ten: 6 }); } });
        }
        day2.fought = true;
      }
      visit(ctx, day2, 'd');
      var g1 = gain(ctx, a, 2 + Math.floor(ctx.rng() * 4)), g2 = gain(ctx, b, 1 + Math.floor(ctx.rng() * 4));
      day2.pend.push([a, g1], [b, g2]);
      if (e && !S.best && !neg && !(dl && /忙しい|連絡|体調/.test(dl.k))) S.best = { d: day2.d, label: 'DAY' + (day2.d + 1), why: soft(dailyText(day2)) };
      return;
    }
    /* 夜 */
    trouble(ctx, day2, 'n');
    if (day2.meal && day2.mealK !== 'BREAKFAST') meal(ctx, day2);
    visit(ctx, day2, 'n');
    if (day2.fought) {
      /* 仲直り：謝る側は、喧嘩を言い出した側より NP の高いほう（意地っ張り・強気は自分からは謝りにくい） */
      var lo = day2.lo, hi = day2.hi, pl = RC() ? RC().per(lo) : '';
      if ((pl === 'proud' || pl === 'tsun') && ctx.rng() < 0.6) { var sw = lo; lo = hi; hi = sw; }
      var mk = prose(ctx, 'MAKEUP', 0, '寝る前に、{a}のほうから「さっきはごめん｜さっきは悪かった｜先ほどはすみませんでした」と切り出した。{b}は小さくうなずいた。', lo, hi);
      if (ctx.act2({ actors: [lo, hi], cat: 'bond', text: fill(ctx, mk, lo, hi), why: '新婚部屋：仲直り（' + lo.name + 'から）', fx: function () { ctx.mod2(lo, hi, { aff: 4, ten: -6 }, { aff: 4, ten: -6 }); } })) S.makeups++;
    }
    var gn1 = gain(ctx, A, Math.floor(ctx.rng() * 3)), gn2 = gain(ctx, B, Math.floor(ctx.rng() * 3));
    day2.pend.push([A, gn1], [B, gn2]);
    var crossed = {}; day2.pend.forEach(function (p) { crossed[p[0].i] = (crossed[p[0].i] || 0) + p[1]; });
    [A, B].forEach(function (c) { if (crossed[c.i] && !(c === A ? day2.pa : day2.pb).trip) wishActs(ctx, c, Math.min(2, crossed[c.i])); });
    var sexed = false;
    if (!HK.SAFE_ON && HK.ShinkonR18 && S.sex < S.lewdMax && !day2.apart) sexed = HK.ShinkonR18.night(ctx, A, B, day2, d === S.days - 1);
    if (sexed) S.sex++;
    var en = day2.apart ? null : J.pick(ctx, 'end', D.END, function (x) { return (S.love || !romRow(x) ? 1 : 0) * (S.wed || !WED.test(x.t) ? 1 : 0) * (day2.fought && /不安|動揺|戸惑/.test(x.t) ? 1.5 : 1); });
    var dist = distance(ctx, day2);
    if (en) {
      var et = prose(ctx, 'END', D.END.indexOf(en), '一日の終わりに、{a}は思った――' + en.t.replace(/。$/, '') + '。', day2.hi, day2.lo);
      ctx.act2({ actors: [day2.hi, day2.lo], cat: S.love ? 'romance' : 'bond', text: fill(ctx, et, day2.hi, day2.lo) + (dist && d !== S.days - 1 ? dist : ''), why: '新婚部屋：一日の終わり（' + en.k + '）' });
    } else if (dist && d !== S.days - 1) ctx.act2({ actors: [A, B], cat: 'bond', text: dist, why: '新婚部屋：離れて過ごした一日' });
    if (d === S.days - 1) { ending(ctx); return; }
  }
  /* 困りごと（その区切りのもの）：当人の文＋受け止める人の反応（態度・らしくない）＋決着（気質で：笑い話・一緒に何とかする・小さな言い合い） */
  function trouble(ctx, day, part) {
    var S = f(ctx), c = day.trouble, TR = HK.ShinkonTrouble;
    if (!c || c.tr.part !== part || c.done) return;
    c.done = true;
    var a = c.who, b = c.other, pb = b === S.A ? day.pa : day.pb, pa = a === S.A ? day.pa : day.pb;
    var t = TR.text(ctx, S, day, c);
    if (!t) return;
    var together = !pa.trip && !pb.trip;
    var tx = fill(ctx, t, a, b), odd = false, oc = null;
    if (together && RC()) {
      var r = RC().say(ctx, c.tr.kind, b, a);
      if (r.text && okText(ctx, r.text, b, a)) { tx += fill(ctx, r.text, b, a); odd = r.odd; if (odd) tx += fill(ctx, RC().after(ctx, S.love), b, a); }
      if (c.tr.kind === 'oops') { oc = RC().outcome(ctx, b, a, odd); tx += fill(ctx, RC().outText(ctx, oc), b, a); }
    }
    if (c.tr.id === 'rain') day.rain = a;
    if (c.tr.id === 'dark') day.dark = true;
    if (c.tr.id === 'forgot') day.forgot = a;
    if (c.tr.id === 'overtime' || c.tr.id === 'train') day.lateHome = a;
    var e = ctx.act2({ actors: together ? [a, b] : [a], cat: oc === 'spat' ? 'conflict' : together ? 'bond' : 'solo', text: tx, odd: odd, why: '新婚部屋：困りごと（' + TROUBLE_NAME[c.tr.id] + '）' + (oc ? '・' + OUT_NAME[oc] : ''),
      fx: function () { if (!together) return; if (oc === 'spat') ctx.mod2(a, b, { aff: -2, ten: 5 }, { aff: -2, ten: 5 }); else ctx.mod2(a, b, { aff: 2, trust: 2 }, { aff: 2, trust: oc === 'help' ? 3 : 1 }); } });
    if (e) { S.troubles++; if (odd) S.odd++; }
    if (oc === 'spat' && e) { day.fought = true; S.fights++; day.lo = a; day.hi = b; }
  }
  var TROUBLE_NAME = { burnt: 'ご飯を焦がした', overtime: '残業で遅くなった', train: '電車が止まった', rain: '急な雨', appliance: '家電の故障', oversleep: '寝坊', lockout: '鍵を忘れた', dark: '停電', trip: '出張先で', remote: '在宅の仕事中に', deadline: '締め切り', shift: '勤務のすれ違い', parcel: '宅配の受け取り損ね', bug: '虫が出た', forgot: '買い忘れ', spill: 'コーヒーをこぼした', noise: '工事の音' };
  var OUT_NAME = { laugh: '笑い話に', help: '一緒に何とかした', spat: '小さな言い合いに' };
  /* 他の住人の訪れ（shinkon-visit.js） */
  function visit(ctx, day, part) {
    var S = f(ctx), VI = HK.ShinkonVisit;
    if (!VI || day.visited) return;
    var v = VI.roll(ctx, S, day, part);
    if (!v) return;
    day.visited = true;
    var g = v.g, ex = { g: g.name, gl: VI.word(ctx, v.host, g) };
    g.gone = false;
    try {
      var t = VI.text(ctx, v);
      var e = ctx.act2({ actors: v.kind === 'contact' ? [v.host, g] : [v.host, g, v.other], cat: 'bond', text: fill(ctx, t, v.host, v.other, ex), why: '新婚部屋：' + { visit: '他の住人が遊びに来た', out: '他の住人と出かけた', contact: '他の住人から連絡が来た' }[v.kind] + '（' + g.name + '・' + ex.gl + '）',
        fx: function () { ctx.mod2(v.host, g, { aff: 3, trust: 2 }, { aff: 3, trust: 2 }); } });
      if (e) S.visits++;
      var fk = e ? VI.follow(ctx, S, v) : null;
      if (fk) {
        var arr = VI.T[fk], jl = fk !== 'bless';
        var ft = fill(ctx, pickOf(ctx, arr), v.host, v.other, ex);
        var e2 = ctx.act2({ actors: jl ? [v.other, v.host, g] : [g, v.host, v.other], cat: 'romance', text: ft, why: '新婚部屋：' + (jl ? v.other.name + 'のヤキモチ（' + g.name + 'が' + (v.cls === 'ex' ? '元恋人' : ex.gl) + '）' : g.name + 'が二人を祝福した'),
          fx: function () { if (jl) ctx.mod2(v.other, v.host, { att: 4, ten: 3 }, { att: 3 }); else ctx.mod2(v.host, v.other, { aff: 2, att: 2 }, { aff: 2, att: 2 }); } });
        if (e2 && jl) { day.jealBy = v.other; day.jealOf = v.host; day.jealG = g; day.jealEx = v.cls === 'ex'; }
      }
    } finally { g.gone = true; }
  }
  /* ご飯：作る人は料理をする人だけ（作る人がいないときは外食・出来合いの種だけ） */
  var MEAL_NAME = { BREAKFAST: '朝', LUNCH: '昼', DINNER: '夜' };
  function meal(ctx, day) {
    var S = f(ctx), A = S.A, B = S.B;
    if (!day.meal) return;
    var cook = day.cook || (ctx.rng() < 0.5 ? A : B), other = cook === A ? B : A;
    var food = pickOf(ctx, D.FOOD);
    var mt = prose(ctx, day.mealK, day.mealI, '', cook, other);
    if (!mt) {
      /* 作る人のいない二人の文（作る人の文が合わなかったとき） */
      mt = day.mealNeed === 'none' ? '{a}と{b}の' + MEAL_NAME[day.mealK] + 'ご飯は、' + day.meal.k + '。' + day.meal.t + '。' : '';
      if (!mt) return;
    }
    var re = withReact(ctx, 'warm', other, cook, day.cook ? 0.4 : 0.2);
    ctx.act2({ actors: [cook, other], cat: S.love ? 'romance' : 'bond', text: fill(ctx, mt, cook, other, { food: food }) + re.text, odd: re.odd, why: '新婚部屋：' + MEAL_NAME[day.mealK] + 'ご飯（' + clean(day.meal.k).replace(/（.*$|\s.*$/, '') + (day.cook ? '・' + day.cook.name + 'が作った' : '') + '）' });
  }
  /* ふたりの距離（その日の終わりの一文） */
  function distance(ctx, day) {
    var S = f(ctx), A = S.A, B = S.B, r = ctx.rel[A.i][B.i], q = ctx.rel[B.i][A.i];
    var key = day.fought ? (S.makeups ? 'mend' : 'rough') : day.apart ? 'apart' : (r && q && r.att + q.att > 120) ? 'close' : 'calm';
    var DIST = TX().DIST || {};
    var arr = (DIST[key] || []).filter(function (x) { return okText(ctx, x, A, B); });
    var t = pickOf(ctx, arr);
    return t ? fill(ctx, t, A, B) : '';
  }
  function ending(ctx) {
    var S = f(ctx), A = S.A, B = S.B, k = Math.floor(ctx.rng() * D.KISS.length);
    if (S.love) {
      var t = prose(ctx, 'KISS', k, D.KISS[k], A, B);
      if (ctx.act2({ actors: [A, B], cat: 'romance', text: fill(ctx, t, A, B), why: '新婚部屋：最後の夜（幸せなキス）', fx: function () { ctx.mod2(A, B, { aff: 6, att: 6, trust: 4 }, { aff: 6, att: 6, trust: 4 }); } })) S.kissed = true;
    } else {
      ctx.act2({ actors: [A, B], cat: 'bond', text: fill(ctx, prose(ctx, 'HUG', 0, '最後の夜、{a}と{b}は並んで座り、明日の話をした。穏やかな、いい暮らしだった。', A, B), A, B), why: '新婚部屋：最後の夜' });
    }
  }
  function finish(ctx) {
    var S = f(ctx), A = S.A, B = S.B;
    if (A === B) return;
    S.G.forEach(function (g) { g.gone = false; g.fate = '生存'; g.fateNote = S.visits ? A.name + 'と' + B.name + 'の暮らしを見守った' : ''; });
    var wa = J.of(ctx, A), wb = J.of(ctx, B);
    ctx.flags.shinkon = { days: S.days, home: D.HOME[S.home], rel: S.rel >= 0 ? relShort(S.rel) : (S.ri.label || ''), keep: S.rel < 0, meet: D.MEET[S.meet].split(/\s/)[0], a: A.i, b: B.i,
      life: [LF.label(A), LF.label(B)], wish: [wishName(wa.d), wishName(wb.d)], wed: S.wed,
      acts: S.acts, fights: S.fights, makeups: S.makeups, sex: S.sex, long: S.longN || 0, kissed: S.kissed, love: S.love, best: S.best, troubles: S.troubles, visits: S.visits, odd: S.odd };
    [A, B].forEach(function (c) { c.fate = S.wed ? '新婚の夫婦' : S.love ? '一緒に暮らす恋人' : '同じ家で暮らす二人'; c.fateNote = (c === A ? B : A).name + 'と、' + S.days + '日を過ごした'; });
    ctx.flags.outcome = A.name + 'と' + B.name + 'の' + (S.wed ? '新婚の' : '同居の') + S.days + '日' + (S.kissed ? '――最後の夜、二人は幸せなキスをした' : '');
  }
  /* なれそめを選んだとき（上書き）：二人のあいだの関係を外す（家族などで恋愛が「なし」の関係は残す）。入力はそのまま、写しで動かす */
  function override(input) {
    var env = input && input.env, ts = input && input.ties;
    if (!env || !env.rel || env.rel === 'keep' || !Array.isArray(ts) || !ts.length || !Array.isArray(input.chars)) return input;
    var C = input.chars.map(function (c, i) { return { i: i }; }), cp = couple(C, input), a = cp[0] && cp[0].i, b = cp[1] && cp[1].i;
    if (a == null || b == null) return input;
    var mine = ts.filter(function (t) { return (t.a === a && t.b === b) || (t.a === b && t.b === a); });
    if (!mine.length) return input;
    if (mine.some(function (t) { return t.love === 'no'; }) || (HK.tiesLove && !HK.tiesLove(mine))) return input;
    var cp2 = {}; Object.keys(input).forEach(function (k) { cp2[k] = input[k]; });
    cp2.ties = ts.filter(function (t) { return mine.indexOf(t) < 0; });
    return cp2;
  }
  if (HK.wrap && HK.simulate) HK.wrap(HK, 'simulate', function (sim0) {
    return function (input) {
      var mine = input && input.scenId === ID;
      var r = sim0.apply(this, mine ? [override(input)].concat([].slice.call(arguments, 1)) : arguments), C0 = HK._curCtx;
      if (r && r.end && mine && C0 && C0.scen && C0.scen.id === ID && C0.flags) r.end.shinkon = C0.flags.shinkon || null;
      return r;
    };
  });
  /* 結末の要約（endings.js の E.build から） */
  if (HK.Endings) HK.Endings[ID] = function (res, X) {
    var R = res.end && res.end.shinkon, lines = [];
    if (!R) return { headline: res.outcome || '', stats: [], lines: [] };
    var a = X.nm(R.a), b = X.nm(R.b);
    lines.push('二人の' + R.days + '日（' + a + 'と' + b + '）');
    lines.push('住まい：' + R.home + '／' + (R.keep ? '関係：' : 'なれそめ：') + R.rel + '／出会い：' + R.meet);
    lines.push(a + '：' + R.life[0] + '／願望「' + R.wish[0] + '」');
    lines.push(b + '：' + R.life[1] + '／願望「' + R.wish[1] + '」');
    lines.push('願望から来た行動 ' + R.acts + '回／困りごと ' + R.troubles + '回／喧嘩 ' + R.fights + '回' + (R.fights ? '（仲直り ' + R.makeups + '回）' : '') + (R.visits ? '／来客・連絡 ' + R.visits + '回' : '') + (HK.SAFE_ON ? '' : '／エッチ ' + R.sex + '回'));
    if (R.best) lines.push('いちばん心に残った日：' + R.best.label + '――' + R.best.why);
    X.C.forEach(function (c) { c.afterDone = true; });
    return { headline: (res.outcome || '') + '。', stats: [['日数', R.days + '日'], ['願望の行動', R.acts + '回'], ['困りごと', R.troubles + '回'], ['喧嘩', R.fights + '回']].concat(HK.SAFE_ON ? [] : [['エッチ', R.sex + '回']]), lines: lines };
  };

  HK.SCENARIOS[ID] = scen;
  /* R18 の描写の設定（描写の有無・長さ・作風）をほかの R18 の箱庭と同じ共通の設定にする（lewd-unify.js。全年齢では「ほのめかす」だけ） */
  if (HK.Lewd && HK.Lewd.install) HK.Lewd.install(ID, { lenDef: 'mix', desc: HK.SAFE_BUILD ? '' : '夜の場面の描き方。ほのめかす＝ぼかした一文と翌朝だけ／ほどほど＝描写する／濃い＝果てたあと、もう一度求め合うところまで' });
})();
