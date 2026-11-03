/* 新婚部屋（追加パック set-b の部屋。エンジン型。両方のビルド）
   結婚したばかりの二人（か、元の関係のまま一緒に暮らし始めた二人）の毎日を、朝・日中・夜の3区切りで眺める。最後の夜は幸せなキスで一区切り。
   2026-11-03 利用者のフィードバックで作り直し（docs/reports/2026-11-03/shinkon-feedback.md・shinkon-design.md）：
   ・利用者のソロジャーナルの表は「何が起きたか」の種として内部で引くだけ（記録の行・表の名前は画面に出さない）。願望は場面の文で表す
   ・受け止め方・決着は、性格（態度9種）・関係・らしくない行動（運命の揺らぎ）で変わる（shinkon-react.js）。本体の共通の出来事（関係ごとの出来事・らしくない行動など）も混ぜる
   ・暮らしの困りごと 17 種（shinkon-trouble.js）、他の住人（参加者の三人目から・名簿の登場しない住人＝設定 outsideNames）の訪れ（shinkon-visit.js）
   ・離れていた日数・忙しい日の続きを前提にする文は、実際の日数で絞る（awayOk）
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
    if (!awayOk(ctx, x, a, b)) return false;
    return true;
  }
  /* ---------- 離れていた日数・忙しい日の続き（2026-11-03 利用者の指摘「2 日目なのに『数日ぶりに帰ってきた』という文が出る」）----------
     away(ctx)：その日の前日までに、二人のどちらかが出張で家を空けていた日が何日続いたか（{ n, who: [出張していた人] }。今日も出張なら n は 0）
     busy(ctx)：その日の前日までに、どちらかの帰りが遅い・出張の日が何日続いたか
     文の候補は、離れていたことを前提にする語（数日ぶり・久しぶりに帰ってきた・ずっと会えなかった・出張から帰った など）があれば、実際の日数と出張していた人で絞る */
  function lifeDay(c, d) { return c && c.life && c.life.days ? c.life.days[d] : null; }
  function away(ctx) {
    var S = f(ctx), day = S && S.day; if (!day) return { n: 0, who: [] };
    var d = day.d, n = 0, who = [];
    if (day.apart) return { n: 0, who: [] };
    for (var k = d - 1; k >= 0; k--) {
      var t = [S.A, S.B].filter(function (c) { var x = lifeDay(c, k); return x && x.trip; });
      if (!t.length) break;
      n++; t.forEach(function (c) { if (who.indexOf(c) < 0) who.push(c); });
    }
    return { n: n, who: who };
  }
  function busy(ctx) {
    var S = f(ctx), day = S && S.day; if (!day) return 0;
    var n = 0;
    for (var k = day.d - 1; k >= 0; k--) { if (![S.A, S.B].some(function (c) { var x = lifeDay(c, k); return x && (x.trip || x.late); })) break; n++; }
    return n;
  }
  var AW_MANY = /数日ぶり|何日ぶり|久しぶりに帰っ|会えなかった日数|ずっと会えな|久しぶりの(?:体温|熱)/, AW_ONE = /一晩、家を空けた/;
  var AW_WHO = /(?:出張から(?:帰|戻)った|出張帰りの|ぶりに帰ってきた)\{([ab])\}|\{([ab])\}は出張から(?:帰|戻)/;
  var EVE_RE = /夕方|夕暮れ|夕焼け|日が暮れる前/, EVE_OK = /連絡|遅く|帰っ|帰り|帰宅|残業|電車/;
  var BUSY_RE = /(?:遅い夜|忙しい日|すれ違い)(?:が|の)続いて|残業続き|久しぶりに早く帰/, KYUKA = /久しぶりの(?:お)?休み/;
  function awayOk(ctx, t, a, b) {
    if (typeof t !== 'string' || !f(ctx) || !f(ctx).day) return true;
    var S = f(ctx), day = S.day, aw = null;
    if (AW_MANY.test(t) || AW_ONE.test(t) || AW_WHO.test(t)) {
      aw = away(ctx);
      if (AW_MANY.test(t) && aw.n < 2) return false;
      if (AW_ONE.test(t) && aw.n !== 1) return false;
      var m = AW_WHO.exec(t);
      if (m) { var c = (m[1] || m[2]) === 'a' ? a : b; if (!aw.n || aw.who.indexOf(c) < 0) return false; }
    }
    if (BUSY_RE.test(t) && busy(ctx) < 2) return false;
    /* 帰りが遅い日：その人が夕方に家にいる文（夕方に連絡・帰る文は除く）は使わない */
    if (EVE_RE.test(t) && !EVE_OK.test(t) && [S.A, S.B].some(function (c) { var p = c === S.A ? day.pa : day.pb; return p && p.late && (c === a || c === b); })) return false;
    if (KYUKA.test(t) && !(day.hol && day.d > 0 && !holiday(day.d - 1))) return false;
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
  function SKX() { HK.Shinkon = { restNight: restNight, restAhead: restAhead, okText: okText, choreOk: choreOk, awayOk: awayOk, away: away, busy: busy, ROM: ROM, WED: WED, COOK: COOK, CHORE: CHORE, AW_MANY: AW_MANY, AW_ONE: AW_ONE, AW_WHO: AW_WHO, BUSY_RE: BUSY_RE, KYUKA: KYUKA }; }
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
    note: '※参加者の最初の二人（住人ごとの「立場」で選べます）が新婚の二人です。三人目からは「他の住人」として、遊びに来たり連絡をくれたりします。「登場しない住人を出す」なら、名簿にいて参加していない、二人と関係のある住人も訪ねてきます。登場人物はすべて成人として扱います。',
    unit: '日', perUnit: 3, preRel: 0, lethal: false, minCast: 2, maxCast: 4,
    catBias: { romance: 1, bond: 1, help: 1, conflict: 0.3, combat: 0, betray: 0, kill: 0 },
    decay: 0.998, actRate: 0.2,
    derived: ['warmth', 'honesty', 'jealous', 'impulse'],
    env: [
      { id: 'days', label: '日数', min: 5, max: 14, def: 7, lo: '5日', hi: '14日', unit: '日', desc: '見守る日数。1日は朝・日中・夜の3区切り。最後の夜は幸せなキスで一区切り' },
      { id: 'home', label: '二人の住まい', type: 'select', def: 'auto', options: opts(D.HOME), desc: '二人が暮らす家' },
      { id: 'rel', label: '二人のなれそめ', type: 'select', def: 'keep', options: [{ v: 'keep', label: '元の関係のまま（住人の関係の設定どおり）' }].concat(opts(D.REL.map(function (t, i) { return relShort(i); }), 'おまかせ（新しく決める）')),
        desc: '「元の関係のまま」なら、住人の関係の設定（友人・擬似親子・同僚など）をそのまま使って暮らします（関係が無ければ新婚の夫婦）。【注意】ほかを選ぶと、二人のあいだに設定した関係を「新婚の夫婦」に上書きします（家族などで恋愛が「なし」の関係は上書きしません）' },
      { id: 'meet', label: '出会いの場所', type: 'select', def: 'auto', options: opts(D.MEET.map(function (t) { return t.split(/\s/)[0]; })), desc: '二人が出会った場所' },
      { id: 'speed', label: '願望の高まりやすさ', type: 'select', def: 'normal', options: [{ v: 'slow', label: 'ゆっくり' }, { v: 'normal', label: 'ふつう' }, { v: 'fast', label: '早い' }], desc: '早いほど、願望から来る行動が多く起きる' },
      { id: 'outsideNames', label: '登場しない住人を出す', type: 'select', def: 'yes', options: [{ v: 'yes', label: '出す（名簿の住人のうち、二人と関係のある人が訪ねてくる・連絡をくれる）' }, { v: 'no', label: '出さない（二人と、参加者だけ）' }],
        desc: '出られない部屋の「登場しない住人の名前を出す」と同じ読み方で、名簿にいて今回は参加していない住人のうち、新婚の二人のどちらかと関係（家族・擬似親子・友人・同僚・先輩後輩・同級生・元恋人・知人）がある人（三人まで）が、名簿の性格・口調・関係のまま、遊びに来たり、一緒に出かけたり、連絡をくれたりします。元恋人が来た日は、ヤキモチから始まる夜も。参加者の三人目から（住人ごとの「立場」で「他の住人」にした人）は、この設定にかかわらず同じように出ます' }
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
    /* 経過の目次を日ごとにまとめる（本体の目次の仕組み。無い版では使われないだけ） */
    stepGroup: function (label) { var m = /^(DAY\d+（.）)(.+)$/.exec(label); return m ? { group: m[1], sub: m[2] } : null; },
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
  /* 外す出来事は、その時点の共通の出来事の山から引く（読み取り専用の値。出来事の一覧（event-catalog.js の HK.buildPool）も、遊ぶときと同じものを外して数える。
     2026-11-03 利用者の確かめごと：一覧に「セフレといつもの部屋で落ち合う」などが並んでいた＝以前は setup で書き込んでいたので、一覧を作るときは空だった） */
  function exList() { return (HK.COMMON || []).filter(function (e) { return e.sex || e.force || EX_ID.test(e.id); }).map(function (e) { return e.id; }); }
  Object.defineProperty(scen, 'exclude', { get: exList, enumerable: true, configurable: true });
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
    var C = ctx.chars, cp = couple(C, ctx.input), A = cp[0], B = cp[1] || cp[0], env = ctx.env;
    var days = Math.max(5, Math.min(14, +env.days || 7));
    ctx.place = '二人の新居';
    var keep = !env.rel || env.rel === 'keep';
    var ri = relInfo(ctx, A, B);
    var S = ctx.sk = { days: days, A: A, B: B, G: C.filter(function (c) { return c !== A && c !== B; }),
      home: sel(ctx, 'home', D.HOME), rel: keep && ri.t && !/^(spouse|lover|fiance|mate)$/.test(ri.t.type) ? -1 : sel(ctx, 'rel', D.REL), keep: keep, ri: ri, meet: sel(ctx, 'meet', D.MEET), meet2: 0,
      speed: env.speed === 'slow' ? 0.7 : env.speed === 'fast' ? 1.45 : 1, love: canLove2(ctx, A, B), day: null, fights: 0, makeups: 0, acts: 0, sex: 0, kissed: false, best: null, lewdMax: 0,
      troubles: 0, visits: 0, odd: 0 };
    /* 結婚している二人か：元の関係のままで、二人の関係が恋人・夫婦などの関係（か、関係なし）。なれそめを選んだら、恋愛にしてよい二人は夫婦 */
    S.wed = S.love && (keep ? ri.loveTie : true);
    /* 他の住人：出番のときだけ場に出す（ほかの区切りは留守。共通の出来事に混ざらないように） */
    S.G.forEach(function (g) { g.gone = true; g.life = g.life || { job: '' }; if (pickOfChar(ctx, g, 'outside')) g.outside = true; });
    var night1 = !HK.SAFE_ON && S.love && !(HK.Pos && HK.Pos.libNone && HK.Pos.libNone([A, B]));
    S.meet2 = HK.weighted(ctx.rng, D.MEET2.map(function (x, i) { return i; }), function (i) { return i === 9 && !night1 ? 0 : 1; });
    [A, B].forEach(function (c) {
      var job = pickOfChar(ctx, c, 'job');
      c.life = { job: job ? String(job).slice(0, 20) : '' };
      /* 仕事の型を選んでいれば先に決める（在宅ワークの人のおまかせの役割は、家事を分け合う役割になりやすい。roomkit-life.js） */
      var pw = pickOfChar(ctx, c, 'work');
      if (pw && pw !== 'auto') LF.work(ctx, c, pw);
      LF.role(ctx, c, pickOfChar(ctx, c, 'role'));
      LF.work(ctx, c, pw);
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
  /* ---------- 体調を崩した人の状態（2026-11-03 利用者の報告「体調が悪い人がすぐに次の行動を通ったりするのはやめてほしい」）----------
     日替わりの種「どちらかの体調が悪い」（朝の「相手のちょっとした体調不良に気がついた」と組で出す）が出た日から、その人の状態 S.sick（続く日数 1〜2 日）にする。
     状態の間（day.sick）：体調の悪い人は寝ている・休む・看病される側の文だけ。日替わりは体調の種だけ、相手は仕事を休む・早く帰る（出張・残業は取りやめ）。
       ご飯・困りごと・来客・喧嘩・願望の行動・本体の共通の出来事・夜の R18（ほのめかすも）は出さず、朝は看る文・夜はそばで過ごす文（shinkon-sick.js）。
     翌朝（day.recover）に「よくなった／まだ少しだるい」の段で状態を終える。まだ少しだるい日（day.dull）は、デート・外出・ポンコツ・一緒に出かける来客・夜の R18 を出さない。
     同じ人には一回の遊びで一度だけ。状態の間はほかの人も崩さない。最後の朝までに治るように、最後の前日までに始まるものだけ */
  /* 本体の共通の出来事を混ぜない区切りの actRate（engine.js は 0 を既定値の 1 と読むので、0 にはしない） */
  var REST_RATE = 1e-9;
  function sickOn(S, d) { var k = S.sick; return k && d >= k.from && d <= k.last ? k.c : null; }
  /* その夜は体の関係の場面を出さない（体調の悪い人がいる・まだだるい日・離れている）か */
  function restNight(ctx, day) { return !!(day && (day.sick || day.dull || day.apart)); }
  /* d の夜から最後の夜までのうち、R18 の場面を出さない（体調で休む）と決まっている夜の数 */
  function restAhead(ctx, d) {
    var S = f(ctx), k = S && S.sick, n = 0;
    if (!k) return 0;
    for (var x = d; x < S.days; x++) if ((x >= k.from && x <= k.last) || (k.dull && x === k.last + 1)) n++;
    return n;
  }
  function rollDay(ctx, d) {
    var S = f(ctx), A = S.A, B = S.B, hol = holiday(d);
    var pa = LF.day(ctx, A, d, hol), pb = LF.day(ctx, B, d, hol);
    var hi = J.of(ctx, A).pt >= J.of(ctx, B).pt ? A : B;
    var day = { d: d, hol: hol, pa: pa, pb: pb, hi: hi, lo: hi === A ? B : A };
    /* 体調を崩している人：その日は家で休む（出張・残業は取りやめ）。看る人も出張・残業を取りやめる */
    var sc = sickOn(S, d);
    if (sc) {
      day.sick = sc; day.carer = sc === A ? B : A; day.sickDay = d - S.sick.from;
      [pa, pb].forEach(function (p, k) {
        if (p.trip) { p.trip = false; p.tripEnd = true; }
        p.late = false;
        p.home = { m: true, d: [A, B][k] === sc || p.hol || p.home.d, n: true };
      });
    } else if (S.sick && d === S.sick.last + 1 && !S.sick.done) {
      S.sick.done = true; day.recover = S.sick.c; day.carer = S.sick.c === A ? B : A; day.recoverK = S.sick.dull ? 'dull' : 'well';
      if (S.sick.dull) day.dull = S.sick.c;
      /* 治った朝は二人とも家で迎える（出張は取りやめ）。まだだるい人は残業もしない */
      [pa, pb].forEach(function (p, k) {
        if (p.trip) { p.trip = false; p.tripEnd = true; p.home = { m: true, d: p.hol, n: true }; }
        if ([A, B][k] === day.dull) p.late = false;
      });
    }
    /* 最後の日は二人とも家にいる（最後の夜の幸せなキスがあるので、出張はその日までに切り上げる） */
    if (d === S.days - 1) [pa, pb].forEach(function (p) { if (p.trip) { p.trip = false; p.tripEnd = true; p.home = { m: true, d: p.hol, n: true }; } });
    var apart = day.apart = pa.trip || pb.trip;
    var lv = S.love, nr = function (x) { return lv || !romRow(x) ? 1 : 0; }, nw = function (x) { return S.wed || !WED.test((x.k || '') + (x.t || '')) ? 1 : 0; };
    /* 新しく体調を崩してよい日か：状態の外・治った朝でない・二人とも家にいる・最後の朝までに治る・まだ崩していない人がいる */
    var canSick = !sc && !day.recover && !apart && !(S.sick && !S.sick.done) && d <= S.days - 2 && [A, B].some(function (c) { return !(S.sickWho && S.sickWho[c.i]); });
    /* 日替わり：離れている日は連絡、休日はデートも、家事が苦手（ポンコツ）の人がいるときだけポンコツの出来事も */
    var clumsy = [A, B].some(function (c) { return LF.clumsy(c); });
    var noChore = !LF.canChore(A) || !LF.canChore(B);
    var src = 'DAILY';
    if (!sc && !day.dull && !apart && hol && D.DATE && lv && ctx.rng() < 0.45) src = 'DATE';
    else if (!sc && !day.dull && !apart && clumsy && D.PONKOTSU && ctx.rng() < 0.26) src = 'PONKOTSU';
    day.src = src;
    var ht = hi.tr || {};
    var SICK_K = /^どちらかの体調が悪い$/;
    day.daily = J.pick(ctx, src, D[src], function (x) {
      if (!nr(x) || !nw(x)) return 0;
      if (src !== 'DAILY') return 1;
      /* 体調を崩している日は体調の種だけ。ほかの日は、崩してよい日だけ体調の種を引く */
      if (sc) return SICK_K.test(x.k) ? 1 : 0;
      if (SICK_K.test(x.k) && !canSick) return 0;
      /* まだだるい日は、外出・買い物の種を出さない */
      if (day.dull && /外出|買い物/.test(x.k)) return 0;
      /* 「普段家事をしない人も、分け合って手伝う」は、家事をしない設定の人がいる二人には出さない */
      if (noChore && /家事/.test(x.t)) return 0;
      if ((!LF.canCook(A) || !LF.canCook(B)) && /料理|作る|作って/.test(x.t)) return 0;
      /* 離れている日は連絡の種だけ（「忙しい」の種は、忙しい人が家にいる文なので出さない） */
      if (apart) return /連絡/.test(x.k) ? 3 : 0;
      var w = DAILY_FIT[x.k] ? DAILY_FIT[x.k](ht) : 1;
      return (/連絡/.test(x.k) ? 0.3 : 1) * w;
    });
    day.dailyI = D[src].indexOf(day.daily);
    /* 体調の種が出た日：その日から状態にする（体調の悪い人は、まだ崩していない人から） */
    if (!sc && day.daily && src === 'DAILY' && SICK_K.test(day.daily.k)) {
      var cands = [day.lo, day.hi].filter(function (c) { return !(S.sickWho && S.sickWho[c.i]); });
      sc = cands.length > 1 && ctx.rng() < 0.5 ? cands[1] : cands[0];
      var len = ctx.rng() < 0.45 ? 2 : 1;
      S.sick = { c: sc, from: d, last: Math.min(d + len - 1, S.days - 2), dull: ctx.rng() < 0.5, done: false };
      S.sickWho = S.sickWho || {}; S.sickWho[sc.i] = 1; S.sickN = (S.sickN || 0) + 1;
      day.sick = sc; day.carer = sc === A ? B : A; day.sickDay = 0;
      [pa, pb].forEach(function (p, k) { p.late = false; if ([A, B][k] === sc) p.home = { m: true, d: true, n: true }; });
    }
    /* 朝：体調を崩した日は「相手のちょっとした体調不良に気がついた」（看る人の朝）。二日目は看る朝・治った朝・離れている朝は shinkon-sick.js の文 */
    if (day.sick && day.sickDay === 0) { day.intro = D.INTRO[5]; day.introWho = day.carer; }
    else if (day.sick || day.recover || apart) day.intro = null;
    else day.intro = J.pick(ctx, 'intro', D.INTRO, function (x, i) { return (i === 5 ? 0 : 1) * (i === 0 && src === 'DATE' ? 0 : 1) * nr(x); });
    day.introI = day.intro ? D.INTRO.indexOf(day.intro) : -1;
    if (ctx.rng() < 0.35) { day.item = J.pick(ctx, 'item', D.ITEM); day.itemI = D.ITEM.indexOf(day.item); }
    if (!day.sick && (ctx.rng() < 0.12 || (day.daily && /記念日/.test(day.daily.k)))) day.special = J.pick(ctx, 'special', D.SPECIAL);
    if (!day.sick && day.daily && /喧嘩/.test(day.daily.t + (day.intro && day.intro.t))) day.fight = J.pick(ctx, 'fight', D.FIGHT, function (x) { return fightOk(x, S) ? 1 : 0; });
    day.fightInDaily = !!(day.daily && /喧嘩/.test(day.daily.t));
    /* 昨夜の言い合いの朝：喧嘩っ早い二人ほど、昼にもう一度ぶつかる */
    var cpk = ((A.tr && A.tr.cp) || 0.5) + ((B.tr && B.tr.cp) || 0.5);
    if (day.introI === 0 && ctx.rng() < 0.3 + cpk * 0.25) day.fight = day.fight || J.pick(ctx, 'fight', D.FIGHT, function (x) { return fightOk(x, S) ? 1 : 0; });
    /* ご飯（喧嘩のあとの種は喧嘩した日だけ、デート帰りの種はデートの日だけ。喧嘩が決まってから引く） */
    if (!apart && !day.sick && ctx.rng() < 0.4) { var mr = ctx.rng(); day.mealK = mr < 0.3 ? 'BREAKFAST' : hol && mr < 0.6 ? 'LUNCH' : 'DINNER'; day.meal = pickMeal(ctx, day); }
    /* 暮らしの困りごと（体調を崩している日は出さない） */
    if (HK.ShinkonTrouble && !day.sick) day.trouble = HK.ShinkonTrouble.roll(ctx, S, day);
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
      if (/喧嘩/.test(x.k) && !day.fight) return 0;
      if (/デート/.test(x.k + x.t) && day.src !== 'DATE') return 0;
      /* まだだるい日は、外に食べに出かける種を出さない */
      if (day.dull && /喫茶店|旅先|カフェで|外食|夜景|レストラン|デート帰り/.test(x.k + x.t)) return 0;
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
      /* 体調を崩している日・出張で離れている日は、本体の共通の出来事を混ぜない（寝ている人・家にいない人が出ないように） */
      if (day.sick || day.apart) scen.actRate = REST_RATE;
      /* 看病の区切り・治った朝には、気分の一句（emotion.js。「上機嫌を隠そうともしなかった」など）を付けない（roomkit-journal.js と同じ止め方） */
      if ((day.sick || day.recover) && ctx.stepIndex != null) ctx._emoWS = ctx.stepIndex;
      if (day.recover) { sickMorning(ctx, day, day.recoverK); day.pend = []; }
      else if (day.sick && day.sickDay > 0) { sickMorning(ctx, day, 'morn'); day.pend = []; return; }
      else if (day.apart) { apartMorning(ctx, day); day.pend = []; return; }
      if (!day.recover) {
        var it = day.introI, who = day.introWho || (it === 9 || it === 2 || it === 3 ? (ctx.rng() < 0.5 ? A : B) : day.hi);
        var other = who === A ? B : A;
        var tx = prose(ctx, 'INTRO', it, '{a}の朝――' + (day.intro ? day.intro.t : '') + '。', who, other);
        ctx.act2({ actors: [who, other], cat: S.love && it !== 7 ? 'romance' : 'bond', text: fill(ctx, tx, who, other, { special: day.special || '' }), why: '新婚部屋：朝（' + (day.intro ? day.intro.t : '') + '）' });
        if (day.sick) { day.pend = []; return; }
        var k1 = gain(ctx, who, it === 9 ? 1 + Math.floor(ctx.rng() * 10) : 1 + Math.floor(ctx.rng() * 3)), k2 = gain(ctx, other, 1 + Math.floor(ctx.rng() * 2));
        day.pend = [[who, k1], [other, k2]];
      }
      if (day.meal && day.mealK === 'BREAKFAST') meal(ctx, day);
      trouble(ctx, day, 'm');
      return;
    }
    var day2 = S.day;
    if (day2.sick || day2.apart) scen.actRate = REST_RATE;
    if (day2.sick && ctx.stepIndex != null) ctx._emoWS = ctx.stepIndex;
    if (t === 1 && day2.sick) { sickDay(ctx, day2); return; }
    if (t === 2 && day2.sick) { sickNight(ctx, day2, d); return; }
    if (t === 1) {
      [A, B].forEach(function (c) {
        var pl = c === A ? day2.pa : day2.pb;
        if (day2.hol && !pl.trip) { if (ctx.rng() < 0.45) ctx.act2({ actors: [c], cat: 'solo', text: fill(ctx, LF.roleLine(ctx, c), c), why: '新婚部屋：休日の家のこと' }); return; }
        if (ctx.rng() < (pl.trip ? 1 : 0.6)) ctx.act2({ actors: [c], cat: 'solo', text: fill(ctx, LF.line(ctx, c, pl), c), why: '新婚部屋：' + (pl.trip ? '出張' : '仕事') + '（' + LF.workInfo(c.life.work).label + '）' });
      });
      trouble(ctx, day2, 'd');
      var dl = day2.daily, a = day2.hi, b = day2.lo;
      if (dl && /^(どちらかが忙しい|連絡がうまく取れない)$/.test(dl.k)) { var busy = day2.pa.late || day2.pa.trip ? A : day2.pb.late || day2.pb.trip ? B : null; if (busy) { a = busy === A ? B : A; b = busy; } }
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
    /* 願望の行動は相手と一緒の場面なので、どちらかが出張で家にいない日は出さない */
    if (!day2.apart) [A, B].forEach(function (c) { if (crossed[c.i]) wishActs(ctx, c, Math.min(2, crossed[c.i])); });
    var sexed = false;
    if (!HK.SAFE_ON && HK.ShinkonR18 && S.sex < S.lewdMax && !restNight(ctx, day2)) sexed = HK.ShinkonR18.night(ctx, A, B, day2, d === S.days - 1);
    if (sexed) S.sex++;
    var en = day2.apart ? null : J.pick(ctx, 'end', D.END, function (x) { return (S.love || !romRow(x) ? 1 : 0) * (S.wed || !WED.test(x.t) ? 1 : 0) * (day2.fought && /不安|動揺|戸惑/.test(x.t) ? 1.5 : 1); });
    var dist = distance(ctx, day2);
    if (en) {
      var et = prose(ctx, 'END', D.END.indexOf(en), '一日の終わりに、{a}は思った――' + en.t.replace(/。$/, '') + '。', day2.hi, day2.lo);
      ctx.act2({ actors: [day2.hi, day2.lo], cat: S.love ? 'romance' : 'bond', text: fill(ctx, et, day2.hi, day2.lo) + (dist && d !== S.days - 1 ? dist : ''), why: '新婚部屋：一日の終わり（' + en.k + '）' });
    } else if (dist && d !== S.days - 1) ctx.act2({ actors: [A, B], cat: 'bond', text: dist, why: '新婚部屋：離れて過ごした一日' });
    if (d === S.days - 1) { ending(ctx); return; }
  }
  /* ---------- 体調を崩した人を看る段・出張で離れて迎える朝（文は shinkon-sick.js。{a}＝看る人、{b}＝体調の悪い人） ---------- */
  function SK() { return HK.ShinkonSick || {}; }
  function pickT(ctx, arr, a, b) {
    var p = (arr || []).filter(function (x) { return okText(ctx, x, a, b); });
    if (HK.relFilter && a && b && p.length) { var r = HK.relFilter(ctx, p, a, b); if (r && r.length) p = r; }
    /* 一回の遊びで同じ文を続けて使わない（使っていない文から） */
    var U = f(ctx).skUsed = f(ctx).skUsed || {}, q = p.filter(function (x) { return !U[x]; });
    var t = pickOf(ctx, q.length ? q : p);
    if (t) U[t] = 1;
    return t;
  }
  /* 看病を受ける人（b）の受け止め方（態度9種） */
  function careReact(ctx, a, b, p) {
    if (ctx.rng() > p) return '';
    var R = SK().REACT || {}, k = RC() ? RC().per(b) : 'gentle';
    var t = pickT(ctx, R[k] || R.gentle, a, b);
    return t ? fill(ctx, t, a, b) : '';
  }
  var SICK_WHY = { morn: '看病の朝', well: '体調がよくなった朝', dull: '熱は下がったがまだだるい朝' };
  function sickMorning(ctx, day, kind) {
    var S = f(ctx), b = kind === 'morn' ? day.sick : day.recover, a = day.carer;
    var t = pickT(ctx, SK()[kind === 'morn' ? 'MORN' : kind === 'well' ? 'WELL' : 'DULL'], a, b);
    if (!t) return;
    var tx = fill(ctx, t, a, b) + (kind === 'morn' ? careReact(ctx, a, b, 0.5) : '');
    ctx.act2({ actors: [a, b], cat: 'bond', text: tx, why: '新婚部屋：' + SICK_WHY[kind] + '（' + b.name + '）', fx: function () { ctx.mod2(a, b, { aff: 1, trust: 1 }, { aff: 2, trust: 2 }); } });
  }
  function sickDay(ctx, day) {
    var S = f(ctx), a = day.carer, b = day.sick, W = SK().WORK || {};
    if (!day.hol) {
      var wb = (b.life && b.life.work) || 'regular', wa = (a.life && a.life.work) || 'regular';
      if (wb !== 'home') { var rt = pickT(ctx, SK().REST, a, b); if (rt) ctx.act2({ actors: [b], cat: 'solo', text: fill(ctx, rt, a, b), why: '新婚部屋：体調を崩して休んだ（' + b.name + '）' }); }
      if (wa !== 'home') {
        var wt = pickT(ctx, wa === 'remote' ? W.remote : W.out, a, b);
        if (wt) ctx.act2({ actors: [a, b], cat: 'bond', text: fill(ctx, wt, a, b), why: '新婚部屋：看病のために仕事を休んだ（' + a.name + '）' });
      }
    }
    var fb = '{a}は、体調を崩した{b}のそばについていた。';
    var dt = prose(ctx, 'DAILY', day.dailyI, fb, a, b);
    var body = fill(ctx, dt, a, b, { item: day.item ? day.item.t : '', special: '', fight: '' }) + careReact(ctx, a, b, 0.6);
    ctx.act2({ actors: [a, b], cat: S.love ? 'romance' : 'bond', text: body, why: '新婚部屋：日中の出来事（' + soft(dailyText(day)) + '・' + b.name + 'が体調を崩した）', fx: function () { ctx.mod2(a, b, { aff: 1, trust: 1 }, { aff: 2 + persK(b, 'warm') * 0.5, trust: 2 }); } });
  }
  function sickNight(ctx, day, d) {
    var S = f(ctx), a = day.carer, b = day.sick;
    var t = pickT(ctx, SK().NIGHT, a, b);
    if (t) ctx.act2({ actors: [a, b], cat: 'bond', text: fill(ctx, t, a, b), why: '新婚部屋：看病の夜（' + b.name + '）', fx: function () { ctx.mod2(a, b, { aff: 1, trust: 1 }, { aff: 2, trust: 2 }); } });
    if (d === S.days - 1) ending(ctx);
  }
  function apartMorning(ctx, day) {
    var S = f(ctx), A = S.A, B = S.B, both = day.pa.trip && day.pb.trip;
    var b = both ? B : day.pa.trip ? A : B, a = b === A ? B : A;
    var t = pickT(ctx, both ? SK().APART2 : SK().APART, a, b);
    if (!t) return;
    ctx.act2({ actors: [a, b], cat: 'solo', text: fill(ctx, t, a, b), why: '新婚部屋：朝（' + (both ? '二人とも出張' : b.name + 'が出張') + '）' });
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
      if (c.tr.kind === 'oops') {
        oc = RC().outcome(ctx, b, a, odd);
        /* デートの日の朝・日中の困りごとは、言い合いにしない（言い合いのすぐあとに仲良くデートに出かけないように） */
        if (oc === 'spat' && day.src === 'DATE' && part !== 'n') oc = 'laugh';
        tx += fill(ctx, RC().outText(ctx, oc), b, a);
      }
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
    if (!VI || day.visited || day.sick) return;
    var v = VI.roll(ctx, S, day, part);
    if (!v) return;
    /* まだだるい日は、一緒に出かける来客を出さない */
    if (day.dull && v.kind === 'out') return;
    day.visited = true;
    var g = v.g, ex = { g: g.name, gl: VI.word(ctx, v.host, g) };
    g.gone = false;
    try {
      var t = VI.text(ctx, v);
      var e = ctx.act2({ actors: v.kind === 'contact' ? [v.host, g] : [v.host, g, v.other], cat: 'bond', text: fill(ctx, t, v.host, v.other, ex), why: '新婚部屋：' + { visit: '他の住人が遊びに来た', out: '他の住人と出かけた', contact: '他の住人から連絡が来た' }[v.kind] + '（' + g.name + '・' + ex.gl + '）',
        fx: function () { ctx.mod2(v.host, g, { aff: 3, trust: 2 }, { aff: 3, trust: 2 }); } });
      if (e) S.visits++;
      /* 離れている日（出張）は、そばで妬く場面を出さない */
      var fk = e && !day.apart ? VI.follow(ctx, S, v) : null;
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
    S.G.forEach(function (g) { g.gone = false; g.fate = g.outside ? '訪ねてきた住人（名簿から）' : '生存'; g.fateNote = (S.gUsed && S.gUsed[g.i]) || S.visits ? A.name + 'と' + B.name + 'の暮らしを見守った' : ''; });
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
  /* ---------- 登場しない住人（名簿の住人）を出す（2026-11-03 利用者の指示）----------
     出られない部屋の「登場しない住人の名前を出す」（room-end.js の outsideOf：名簿 HK.UI.state() から、参加していない住人と参加者の関係を読む）と同じ読み方で、
     新婚の二人のどちらかと関係（家族・擬似親子・友人・同僚・先輩後輩・同級生・元恋人・知人。恋人・敵対などの関係が一つでもある人は外す）がある住人を三人まで選び、
     名簿の設定（性格・口調・呼び方・関係）のまま「他の住人」（立場 guest・印 outside）として配役に足す。足し方は画面の入力の組み立て（HK.UI.buildInput）を
     その人たちを加えた参加者で呼び直すだけ（番号で持つ欄も一緒に組み直される）。入力が画面から来たものでない（点検の道具など）ときは何もしない。
     結果は入力の outsideG に写す（記録の入力に残るので、同じ入力で回し直しても同じ。入力の参加者 chars は書き換えない） */
  var OUT_CLS = { parent: 1, sibling: 1, sibprot: 1, sibclose: 1, twin: 1, stepsib: 1, relative: 1, pparent: 1, ex: 0, friend: 2, best: 2, buddy: 2, childhood: 2, benefactor: 2,
    colleague: 3, boss: 3, senpai: 3, classmate: 4, teacher: 4, mentor: 4, acq: 5 };
  var OUT_NG = /^(lover|spouse|mate|fated|fiance|fwb|crush|almost|honmei|yan|enemy|bad|sibbad|rival|abuse|master|worship|apathy|fear|noobs)$/;
  function outsideOf(input) {
    var UI = HK.UI, S = UI && UI.state ? UI.state() : null;
    if (!S || !UI.buildInput || !Array.isArray(S.chars) || !Array.isArray(S.ties) || !Array.isArray(input.chars) || !input.chars.length) return null;
    var byName = {}, dup = {}, mine = [];
    S.chars.forEach(function (c) { if (!c || !c.name) return; if (byName[c.name]) dup[c.name] = 1; byName[c.name] = c; });
    for (var i = 0; i < input.chars.length; i++) { var r = input.chars[i] && byName[input.chars[i].name]; if (!r || dup[r.name]) return null; mine.push(r.id); }
    var cpI = couple(input.chars.map(function (c, k) { return { i: k }; }), input).map(function (c) { return mine[c.i]; });
    var best = {};
    S.ties.forEach(function (t) {
      [[t.a, t.b], [t.b, t.a]].forEach(function (p) {
        if (cpI.indexOf(p[0]) < 0 || mine.indexOf(p[1]) >= 0) return;
        var o = best[p[1]] = best[p[1]] || { id: p[1], pr: 9, ng: false };
        if (OUT_NG.test(t.type) || t.cold === 'fear' || t.cold === 'apathy') o.ng = true;
        else if (OUT_CLS[t.type] != null && (t.type === 'ex' || (t.cold !== 'separated' && t.cold !== 'divorced'))) o.pr = Math.min(o.pr, OUT_CLS[t.type]);
      });
    });
    var ord = {}; S.chars.forEach(function (c, k) { ord[c.id] = k; });
    var add = Object.keys(best).map(function (k) { return best[k]; }).filter(function (o) { var c = S.chars.filter(function (x) { return x.id === o.id; })[0]; return !o.ng && o.pr < 9 && c && c.name && !dup[c.name]; })
      .sort(function (x, y) { return x.pr - y.pr || ord[x.id] - ord[y.id]; }).slice(0, 3).map(function (o) { return o.id; });
    if (!add.length) return [];
    var sid0 = S.scenId, hadJ = !!S.join, j0 = S.join && S.join[ID], base, full;
    try {
      S.scenId = ID; S.join = S.join || {};
      S.join[ID] = mine.slice(); base = UI.buildInput(input.seed);
      /* 画面の入力と同じ参加者・同じ設定でなければ（点検の道具が名前の同じ住人で回したときなど）足さない */
      if (JSON.stringify(base.chars) !== JSON.stringify(input.chars)) return null;
      S.join[ID] = mine.concat(add); full = UI.buildInput(input.seed);
    } finally { S.scenId = sid0; if (!hadJ) delete S.join; else if (j0 === undefined) delete S.join[ID]; else S.join[ID] = j0; }
    full.perChar.forEach(function (p, k) { var c = full.chars[k]; if (c && add.indexOf(c.id) >= 0) { p.pick = p.pick || {}; p.pick.part = 'guest'; p.pick.outside = 1; } });
    return { names: full.chars.filter(function (c) { return add.indexOf(c.id) >= 0; }).map(function (c) { return c.name; }), chars: full.chars, perChar: full.perChar, ties: full.ties, topics: full.topics || [] };
  }
  function withOutside(input) {
    var env = input && input.env;
    if (!env || env.outsideNames === 'no') return input;
    if (input.outsideG === undefined) { try { var o = outsideOf(input); if (o && o.names && o.names.length) input.outsideG = o; } catch (e) { /* 名簿が読めなくても動かす */ } }
    var G = input.outsideG;
    if (!G || !Array.isArray(G.chars) || !Array.isArray(G.perChar)) return input;
    var cp2 = {}; Object.keys(input).forEach(function (k) { cp2[k] = input[k]; });
    cp2.chars = G.chars; cp2.perChar = G.perChar; cp2.ties = G.ties || []; cp2.topics = G.topics || [];
    return cp2;
  }
  if (HK.wrap && HK.simulate) HK.wrap(HK, 'simulate', function (sim0) {
    return function (input) {
      var mine = input && input.scenId === ID;
      var r = sim0.apply(this, mine ? [override(withOutside(input))].concat([].slice.call(arguments, 1)) : arguments), C0 = HK._curCtx;
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
