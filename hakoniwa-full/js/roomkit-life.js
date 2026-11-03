/* 箱庭シミュレーター: 部屋の部品「暮らし」（HK.Life。かたまり pack-roomkit。追加パックの部屋が使う。両方のビルドに同じファイルを置く）
   職業を全部並べる代わりに、仕事の型（外回り・社畜気味・在宅・自営業・出張多め・専業など）と家庭での役割を「暮らしの状態」として持ち、
   その日に家にいるか・帰りが遅いか・出張で離れているかを決める。地の文の一言（日中の様子）も持つ。
   ・HK.Life.WORK／ROLE：選択肢（住人の欄の options にそのまま使える形 { v, label }）と、在宅の度合い・遅い帰り・出張の起こりやすさ
   ・HK.Life.work(ctx, c, pick)／role(ctx, c, pick)：おまかせ（auto）なら気質から選ぶ。決めたものは c.life に覚える
   ・HK.Life.day(ctx, c, d, hol)：その日の予定 { trip, late, home: { m, d, n }（朝・日中・夜に家にいるか） }。同じ日は同じ答え
   ・HK.Life.line(ctx, c, plan)：日中の一言（仕事の型と職業名から）。家事の一言は roleLine(ctx, c)
   ・家事をしない人（役割の家事・料理が 0.2 未満：忙しい仕事人・ヒモタイプ）は、家事・料理の担い手にしない（2026-11-03 利用者の指示「家事をしないキャラが料理をしてしまう」）：
     canChore(c)／canCook(c) で確かめ、chorePerson・cookOf は担い手がいなければ null を返す（呼ぶ側は外食・出来合いの文にする）。roleLine の「家事をしない人」の一言も家事をしない文だけ
   ・家事が苦手（ポンコツ）なのは役割「家事をしているが得意ではない（ポンコツ）」の人だけ（clumsy(c)）
   設計：docs/reports/2026-11-03/shinkon-design.md */
(function () {
  'use strict';
  var HK = window.HK;
  if (!HK) return;
  function L(s) { return s.split('|'); }
  var WORK = [
    { v: 'out', label: '外回りが多い', home: 0.15, late: 0.3, trip: 0.04, fit: function (t) { return t.fc * 0.5 + t.impulse * 0.3; } },
    { v: 'overtime', label: '社畜気味（残業が多い）', home: 0.05, late: 0.65, trip: 0.05, fit: function (t) { return t.ac * 0.5 + t.cp * 0.3; } },
    { v: 'regular', label: '定時で帰る', home: 0.05, late: 0.08, trip: 0.02, fit: function (t) { return t.a * 0.4 + t.np * 0.2 + 0.1; } },
    { v: 'remote', label: '在宅ワーク', home: 0.95, late: 0.1, trip: 0.01, fit: function (t) { return (1 - t.fc) * 0.4 + t.a * 0.3; } },
    { v: 'self', label: '自営業', home: 0.5, late: 0.35, trip: 0.05, fit: function (t) { return t.cp * 0.4 + t.fc * 0.3; } },
    { v: 'trip', label: '出張が多い', home: 0.1, late: 0.2, trip: 0.22, fit: function (t) { return t.a * 0.3 + t.fc * 0.3; } },
    { v: 'shift', label: '夜勤・シフト勤務', home: 0.45, late: 0.5, trip: 0.01, fit: function (t) { return t.ac * 0.3 + 0.15; } },
    { v: 'home', label: '専業（家事が中心）', home: 1, late: 0, trip: 0, fit: function (t) { return t.np * 0.5 + (1 - t.cp) * 0.2; } }
  ];
  /* 家庭での役割（利用者のソロジャーナルの「家庭での役割表」） */
  var ROLE = [
    { v: 'r1', label: '専業主婦・主夫', chores: 1, cook: 0.9, work: 'home' },
    { v: 'r2', label: '家事中心だが、少し仕事もしている', chores: 0.8, cook: 0.8 },
    { v: 'r3', label: '仕事をしつつ、家事も頑張っている', chores: 0.6, cook: 0.6 },
    { v: 'r4', label: '忙しい仕事人。なかなか家事にまで手が回らない', chores: 0.15, cook: 0.15 },
    { v: 'r5', label: '自宅で在宅ワークを中心に行っている', chores: 0.5, cook: 0.5, work: 'remote' },
    { v: 'r6', label: '家事はそこそこ。趣味優先型', chores: 0.35, cook: 0.35 },
    { v: 'r7', label: '家事も仕事も二人で協力している', chores: 0.5, cook: 0.5 },
    { v: 'r8', label: '家事をしているが得意ではない（ポンコツ）', chores: 0.55, cook: 0.3, clumsy: true },
    { v: 'r9', label: '家事も仕事も、なんでもこなす万能タイプ', chores: 0.7, cook: 0.75 },
    { v: 'r10', label: '家事も仕事も相手に任せきりなヒモタイプ', chores: 0.05, cook: 0.05, work: 'home' }
  ];
  var LINE = {
    out: L('{a}は朝から外回りで、昼は営業先の近くでさっと済ませた。|{a}は今日も得意先を回り、駅から駅へ歩き通しだった。|外回りの合間、{a}は公園のベンチで少しだけ空を見上げた。'),
    overtime: L('{a}の職場は今日も慌ただしく、気づけば窓の外が暗くなっていた。|{a}は山積みの仕事を片づけるうちに、昼を食べそびれた。|{a}は定時のチャイムを聞き流し、画面に向かい続けた。'),
    regular: L('{a}は決まった時間に仕事を始め、決まった時間に片づけた。|{a}の一日は、いつもどおりの段取りで進んだ。|{a}は昼休みに、帰りに寄る店を考えていた。'),
    remote: L('{a}は居間の隅の机で、朝から画面に向かっていた。|{a}は在宅の仕事の合間に、洗濯物を取り込んだ。|会議を一つ終えると、{a}は台所でお茶を淹れ直した。'),
    self: L('{a}は自分の仕事の段取りを、朝のうちに組み直した。|{a}は取引先からの電話に出ながら、手元の作業を進めた。|自分で決めた締め切りに追われ、{a}は昼を回っても手を止めなかった。'),
    trip: L('{a}は出張先のホテルで、窓の外の知らない街を眺めた。|{a}は出張の打ち合わせを終えて、新幹線の座席に深く沈み込んだ。|出張先の夕飯は、一人で食べるには少し寂しかった。'),
    shift: L('{a}は夜勤明けで、昼過ぎまでぐっすり眠っていた。|{a}は交代の時間に合わせて家を出た。|シフトの合間、{a}は短い仮眠をとった。'),
    home: L('{a}は家のことをひと通り片づけて、ようやく一息ついた。|{a}は買い物のついでに、季節の花を一輪買ってきた。|{a}は午後の日差しの中で、たまった洗濯物を畳んだ。')
  };
  var ROLE_LINE = {
    hi: L('{a}は手際よく洗い物を片づけ、台所をぴかぴかにした。|{a}は二人分の夕飯の下ごしらえを、鼻歌まじりに済ませた。|{a}は家計簿をつけながら、来週の献立を考えた。'),
    mid: L('{a}は、気づいた家事から少しずつ片づけた。|{a}は帰り道でパンと牛乳を買ってきた。|{a}は休みの朝に、まとめて掃除機をかけた。'),
    /* 家事をしない人：家事・料理をする文は書かない（2026-11-03） */
    lo: L('{a}は家のことは任せきりで、ソファで仕事の資料を広げていた。|{a}は帰りにコンビニへ寄って、二人分のデザートを買ってきた。|{a}は休みの朝、遠くに聞こえる生活の音を聞きながら二度寝を決め込んだ。'),
    clumsy: L('{a}は張り切って料理を始めたが、鍋をひとつ焦がしてしまった。|{a}は洗濯物を畳んだつもりが、なぜか前より散らかっていた。|{a}は皿を割らずに洗い終えて、小さく胸を張った。')
  };
  function find(list, v) { for (var i = 0; i < list.length; i++) if (list[i].v === v) return list[i]; return null; }
  function rngOf(ctx) { return ctx && ctx.rng ? ctx.rng : Math.random; }
  function pick(ctx, arr) { var r = rngOf(ctx); return arr[Math.floor(r() * arr.length)]; }
  HK.Life = {
    WORK: WORK.map(function (w) { return { v: w.v, label: w.label }; }),
    ROLE: ROLE.map(function (r) { return { v: r.v, label: r.label }; }),
    workInfo: function (v) { return find(WORK, v); },
    roleInfo: function (v) { return find(ROLE, v); },
    work: function (ctx, c, pickV) {
      c.life = c.life || {};
      if (c.life.work) return c.life.work;
      var w = pickV && pickV !== 'auto' ? find(WORK, pickV) : null;
      if (!w && c.life.role) { var rr = find(ROLE, c.life.role); if (rr && rr.work) w = find(WORK, rr.work); }
      if (!w) w = HK.weighted ? HK.weighted(rngOf(ctx), WORK, function (x) { return Math.pow(Math.max(0.05, x.fit(c.tr || {})), 2); }) : WORK[0];
      c.life.work = w.v;
      return w.v;
    },
    role: function (ctx, c, pickV) {
      c.life = c.life || {};
      if (c.life.role) return c.life.role;
      var r = pickV && pickV !== 'auto' ? find(ROLE, pickV) : null;
      if (!r) {
        var t = c.tr || {}, w = c.life.work;
        r = HK.weighted ? HK.weighted(rngOf(ctx), ROLE, function (x) {
          var f = 0.2 + (x.chores * (t.np || 0.5) + (1 - x.chores) * (t.fc || 0.5)) * 0.6;
          if (w === 'home' && x.v !== 'r1' && x.v !== 'r10') f *= 0.3;
          if (w !== 'home' && (x.v === 'r1' || x.v === 'r10')) f *= 0.15;
          return f;
        }) : ROLE[2];
      }
      c.life.role = r.v;
      return r.v;
    },
    /* その日の予定（休日 hol は在宅が増える。出張は2日続くことがある） */
    day: function (ctx, c, d, hol) {
      var lf = c.life = c.life || {}, memo = lf.days = lf.days || {};
      if (memo[d]) return memo[d];
      var w = find(WORK, lf.work) || WORK[2], r = rngOf(ctx);
      var prev = memo[d - 1], trip = !hol && (prev && prev.trip && !prev.tripEnd ? true : r() < w.trip);
      var o = { trip: trip, tripEnd: trip && !!(prev && prev.trip) || (trip && r() < 0.5), late: !trip && !hol && r() < w.late, hol: !!hol };
      o.home = trip ? { m: false, d: false, n: false } : { m: true, d: hol || r() < w.home, n: true };
      memo[d] = o;
      return o;
    },
    line: function (ctx, c, plan) {
      var w = plan && plan.trip ? 'trip' : (c.life && c.life.work) || 'regular';
      /* 家にいる仕事の型（専業）でも、家事をしない人には家事の一言を出さない */
      if (w === 'home' && !HK.Life.canChore(c)) return pick(ctx, ROLE_LINE.lo);
      var ok = c.life && (find(ROLE, c.life.role) || ROLE[2]).chores >= 0.2;
      var arr = (LINE[w] || LINE.regular).filter(function (l) { return ok || !/洗濯|掃除|家のこと|畳ん|洗い物/.test(l); });
      var t = pick(ctx, arr.length ? arr : LINE.regular);
      if (c.life && c.life.job && w !== 'home') t = t.replace(/^\{a\}は/, '{a}は' + c.life.job + 'の仕事で、').replace(/^\{a\}の職場は/, '{a}の' + c.life.job + 'の職場は');
      return t;
    },
    roleLine: function (ctx, c) {
      var r = find(ROLE, c.life && c.life.role) || ROLE[2];
      return pick(ctx, ROLE_LINE[r.clumsy ? 'clumsy' : r.chores >= 0.7 ? 'hi' : r.chores >= 0.35 ? 'mid' : 'lo']);
    },
    /* 家事・料理をする人か（役割の家事・料理が 0.2 以上）。家事が苦手（ポンコツ）か */
    canChore: function (c) { var r = find(ROLE, c && c.life && c.life.role) || ROLE[2]; return r.chores >= 0.2; },
    canCook: function (c) { var r = find(ROLE, c && c.life && c.life.role) || ROLE[2]; return r.cook >= 0.2; },
    clumsy: function (c) { var r = find(ROLE, c && c.life && c.life.role); return !!(r && r.clumsy); },
    /* 二人のうち家事を多くする人（家事の出来事の主役に）。家事をする人がいなければ null */
    chorePerson: function (a, b) {
      var ra = find(ROLE, a.life && a.life.role) || ROLE[2], rb = find(ROLE, b.life && b.life.role) || ROLE[2];
      var oa = ra.chores >= 0.2, ob = rb.chores >= 0.2;
      if (!oa && !ob) return null;
      if (oa !== ob) return oa ? a : b;
      return ra.chores >= rb.chores ? a : b;
    },
    /* ご飯を作る人（料理をする人の中から、料理の多さで重みをつけて選ぶ）。list の誰も料理をしなければ null */
    cookOf: function (ctx, list) {
      var ok = (list || []).filter(function (c) { return c && (find(ROLE, c.life && c.life.role) || ROLE[2]).cook >= 0.2; });
      if (!ok.length) return null;
      if (ok.length === 1 || !HK.weighted) return ok[0];
      return HK.weighted(rngOf(ctx), ok, function (c) { return (find(ROLE, c.life && c.life.role) || ROLE[2]).cook; });
    },
    label: function (c) {
      var w = find(WORK, c.life && c.life.work), r = find(ROLE, c.life && c.life.role);
      return (c.life && c.life.job ? c.life.job + '・' : '') + (w ? w.label : '') + (r ? '／' + r.label : '');
    }
  };
})();
