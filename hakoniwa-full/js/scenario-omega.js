/* 箱庭シミュレーター: オメガバース（R18）
   α・β・Ωの第二性、スイッチ、運命の番、職業を持った住人の、数か月〜二年の恋の行方を見る。
   二人なら落ち着いた関係を、複数ならカップルの成立を、恋人同士ならデートの様子を中心に描く */
(function () {
  'use strict';
  var HK = window.HK, OM = HK.OMEGA;
  var SX = OM.SEX;

  function names(list) { return list.map(function (c) { return c.name; }).join('・'); }
  function sx(c) { return c.om.sex; }
  function S(c) { return SX[c.om.sex]; }
  function key(a, b) { return a.i < b.i ? a.i + '-' + b.i : b.i + '-' + a.i; }
  function love(r) { return r.aff > 30 && r.att > 34; }
  function ao(a, b) { return (sx(a) === 'a' && sx(b) === 'o') || (sx(a) === 'o' && sx(b) === 'a'); }
  function alphaOf(a, b) { return sx(a) === 'a' ? a : b; }
  function omegaOf(a, b) { return sx(a) === 'o' ? a : b; }
  function job(c) { return OM.JOB[c.om.job]; }
  /* 元〇〇なら「元」をつけた職業名 */
  function jobName(c) { return (c.om.former ? '元' : '') + job(c).name; }
  OM.jobName = jobName;
  /* {sa}{sb} = それぞれのフェロモンの匂い */
  /* 匂いが長いとき（「革、バニラ、オレンジ」など）は、毎回その中から1〜2つだけ選んで使う */
  function notes(s) {
    return String(s).split(/[、,，]/).map(function (x) { return x.replace(/^\s*(かすかに|ほのかに)/, '').trim(); }).filter(Boolean);
  }
  function short(c) {
    var n = c.om.notes || (c.om.notes = notes(c.om.scent)), r = c.om.rng || Math.random;
    if (n.length <= 1) return n[0] || c.om.scent;
    var i = Math.floor(r() * n.length), x = n[i];
    if (r() < 0.35) { var j = (i + 1 + Math.floor(r() * (n.length - 1))) % n.length; if (!/と/.test(x) && !/と/.test(n[j])) x += 'と' + n[j]; }
    return x;
  }
  OM.shortScent = short;
  function sc(t, a, b) { return t.replace(/\{sa\}/g, function () { return a ? short(a) : ''; }).replace(/\{sb\}/g, function () { return b ? short(b) : ''; }); }
  OM.sc = sc;
  OM.fill = function (ctx, t, a, b) { return fill(ctx, t, a, b); };
  function slash(ctx, t) { return t.replace(/([^\s、。「」（）]+)／([^\s、。「」（）]+)/g, function (m, x, y) { return ctx.rng() < 0.5 ? x : y; }); }
  function fill(ctx, t, a, b) {
    return slash(ctx, ctx.t(t, a, b)).replace(/\{jobraw\}/g, a ? job(a).name : '').replace(/\{job\}/g, a ? jobName(a) : '').replace(/\{jobb\}/g, b ? jobName(b) : '');
  }
  /* 運命の番：関係「運命の番」で決めた二人か、箱庭の中で運命の番だと気づいた二人 */
  function fated(ctx, a, b) { var t = HK.Ties && HK.Ties.get(ctx, a, b); return !!(t && t.type === 'fated') || !!(ctx.om && ctx.om.fatedKnown && ctx.om.fatedKnown[key(a, b)]); }
  OM.isFated = fated;
  function met(ctx, a, b) { return !fated(ctx, a, b) || ctx.om.met[key(a, b)]; }
  function partnerOf(ctx, a) {
    var p = null;
    ctx.present().forEach(function (o) { if (o !== a && ctx.pair(a, o).couple) p = o; });
    return p;
  }
  function addFx(ctx, a, b, fx) {
    if (fx.ab && b) ctx.mod(a, b, fx.ab);
    if (fx.ba && b) ctx.mod(b, a, fx.ba);
    if (fx.s) ctx.stress(a, fx.s);
    if (fx.hp) a.hp = HK.clamp(a.hp + fx.hp, 1, 100);
  }
  function note(ctx, s) { (ctx.flags.endNotes = ctx.flags.endNotes || []).push(s); }
  /* 運命の抗えなさ（環境値 destiny）：0〜1。0.5 が従来どおりで、上は本能寄り・下は理性寄り */
  function dest(ctx) { return (ctx.env.destiny == null ? 50 : ctx.env.destiny) / 100; }
  /* 「なぜ」に添える一言（真ん中あたりの値では添えない） */
  function destWhy(ctx, always) { var d = dest(ctx); return always || d >= 0.65 || d <= 0.35 ? '／運命の抗えなさ ' + Math.round(d * 100) : ''; }
  OM.destiny = dest; OM.destinyWhy = destWhy;
  function mom(ctx) { return ctx.om; }

  var scen = {
    id: 'omega', name: 'オメガバース', kicker: '恋愛・R18',
    desc: 'α・β・Ωの第二性がある世界で、関係の結末（番・破局・片想いのまま…など30通り）が決まるまで見守る。複数人なら誰かが結ばれた時点で終わる。発情期、運命の番、スイッチ、職業の事情、探偵と助手のバディも。※成人キャラクター向け',
    note: '※オメガバースの二次創作的な設定を下敷きにしたパロディです。',
    unit: '月', perUnit: 2, preRel: 4, lethal: false,
    catBias: { romance: 1.5, bond: 1.1, conflict: 0.65, combat: 0, betray: 0.4 },
    decay: 0.985, miniShare: 0.6, priBoost: 2.6,
    derived: ['impulse', 'warmth', 'caution', 'jealous'],
    exclude: ['confess', 'fw_upgrade'],
    perFields: [
      { id: 'sex', label: '第二性', auto: 'おまかせ（ランダム）', options: [{ id: 'a', label: 'α' }, { id: 'b', label: 'β' }, { id: 'o', label: 'Ω' }] },
      { id: 'sw', label: 'スイッチ', auto: 'おまかせ', options: [{ id: 'no', label: 'しない' }, { id: 'yes', label: 'する体質' }] },
      { id: 'job', label: '職業', auto: 'おまかせ（気質から）', groups: true, options: OM.JOBS.map(function (j) { return { id: j[0], label: j[1], group: OM.CATS[j[2]] }; }) },
      { id: 'jobst', label: '職歴', auto: 'おまかせ', options: [{ id: 'now', label: '現職' }, { id: 'ex', label: '元〇〇（今は辞めている）' }] },
      { id: 'hide', label: '隠れΩ', auto: 'おまかせ', options: [{ id: 'yes', label: '第二性を隠して働く（Ωのとき）' }, { id: 'no', label: '隠さない' }] },
      { id: 'scent', label: 'フェロモンの匂い', type: 'text', placeholder: function (c) { return HK.EgoImage ? '診断から：' + HK.EgoImage.of(HK.toCode(c.eg)).scent : '例：雨上がりの土'; } }
    ],
    env: [
      { id: 'heat', label: '発情期の重さ', min: 0, max: 100, def: 50, lo: '抑制剤がよく効く', hi: '抗えない', desc: '高いほど発情期・ラットで理性が飛びやすく、一線を越えやすい' },
      { id: 'destiny', label: '運命の抗えなさ', min: 0, max: 100, def: 50, lo: '理性で抗える', hi: '本能に呑まれる', desc: '運命の番と本能の強さ。高いほど運命の番に一目で落ち、恋人を捨てて運命へ走り、発情期に合意を待たずにうなじを噛んでしまう。低いほど「運命の番でも人は選べるよ」世界になり、積み重ねた関係が運命に勝つ' },
      { id: 'society', label: 'α優位の社会（Ωへの偏見）', min: 0, max: 100, def: 60, lo: 'ほぼ対等', hi: 'αが絶対', desc: 'αが社会の上に立ち、Ωが弱い立場に置かれる度合い。高いほどαは地位の高い職に就きやすく、Ωは差別・離職・αの威圧にさらされやすい' },
      { id: 'lewd', label: '描写の濃さ', type: 'select', def: 'mid', options: [{ v: 'low', label: '朝チュン（ぼかす）' }, { v: 'mid', label: 'ほどほど' }, { v: 'high', label: '濃いめ' }] }
    ],
    stats: [{ id: 'charm', label: 'フェロモン', desc: '高いほど第二性の匂いが強く、α・Ωを惹きつけやすい' }],
    actions: [
      { id: 'work', label: '仕事に打ち込む', fit: function (t) { return t.cp * 0.5 + t.a * 0.5; }, bias: { solo: 1.6, romance: 0.7 } },
      { id: 'social', label: '人と会う予定を詰める', fit: function (t) { return t.warmth; }, bias: { bond: 1.6, romance: 1.2 } },
      { id: 'guard', label: '第二性を隠して暮らす', fit: function (t) { return t.caution; }, bias: { romance: 0.6, solo: 1.4 } },
      { id: 'hunt', label: '出会いを探しに行く', fit: function (t) { return t.impulse; }, bias: { romance: 1.9 } }
    ],
    goals: [
      { id: 'mate', label: '番を見つけたい', fit: function (t) { return t.ac * 0.5 + t.warmth * 0.5; }, bias: { romance: 1.8 } },
      { id: 'free', label: '誰にも縛られたくない', fit: function (t) { return (1 - t.ac) * 0.6 + t.cold * 0.4; }, bias: { romance: 0.8, solo: 1.4 } },
      { id: 'career', label: '仕事で認められたい', fit: function (t) { return t.cp * 0.6 + t.a * 0.4; }, bias: { solo: 1.5, romance: 0.7 } },
      { id: 'protect', label: '大事な人を守りたい', fit: function (t) { return t.np; }, bias: { help: 1.9 }, needsFocus: true }
    ],
    /* 結末が決まるまで進む（最長3年で打ち切り） */
    steps: function () {
      var s = [];
      for (var m = 1; m <= 36; m++) { s.push(m + 'か月目・前半'); s.push(m + 'か月目・後半'); }
      return s;
    },
    end: function (ctx) { return !!ctx.om.ending; },
    setup: function (ctx) { setup(ctx); },
    phase: function (ctx, s, n) { phase(ctx, s, n); },
    after: function (ctx, s, n) {
      afterStep(ctx);
      OM.B.check(ctx, s === n - 1);
    },
    finish: function (ctx) { finish(ctx); },
    classify: function (ctx, A, B, pf) { return classify(ctx, A, B, pf); },
    pairText: function (ctx, A, B, cl) { return pairText(ctx, A, B, cl); },
    charNote: function (ctx, c) { return charNote(ctx, c); },
    events: []
  };
  var EV = scen.events;
  OM.DET.events.forEach(function (e) { EV.push(e); });
  (OM.EXTRA_EV || []).forEach(function (e) { EV.push(e); });
  var BD = OM.B;

  function afterStep(ctx) {
      Object.keys(ctx.om.fatedSplit).forEach(function (k) { var ij = k.split('-'); ctx.pair(ctx.chars[+ij[0]], ctx.chars[+ij[1]]).couple = false; });
      Object.keys(ctx.om.fatedMeetAt).forEach(function (k) {
        if (ctx.om.met[k]) return;
        var ij = k.split('-'), a = ctx.chars[+ij[0]], b = ctx.chars[+ij[1]];
        ctx.R(a, b).att = 0; ctx.R(b, a).att = 0;
      });
      ctx.present().forEach(function (c) {
        if (c.om.heat > 0) c.om.heat--;
        if (c.om.rut > 0) c.om.rut--;
      });
      if (ctx.present().length === 2) { var P = ctx.present(); ctx.mod2(P[0], P[1], { trust: 1.2, att: ctx.R(P[0], P[1]).att > 25 ? 0.4 : 0 }, { trust: 1.2, att: ctx.R(P[1], P[0]).att > 25 ? 0.4 : 0 }); }
      /* α×Ωは、会うたびにフェロモンで少しずつ惹かれ合う */
      ctx.present().forEach(function (x) { ctx.present().forEach(function (y) { if (x !== y && ao(x, y) && met(ctx, x, y) && HK.canLove(x, y) && ctx.R(x, y).att > 25) ctx.R(x, y).att = HK.clamp(ctx.R(x, y).att + 1.2 + (ctx.stat(y, 'charm') - 3) * 0.4, 0, 100); }); });
      /* 運命の番どうしは、運命の抗えなさが高いほど、会うたびに本能が引き寄せる（低ければ普通のα×Ωと同じ） */
      var dd = dest(ctx);
      if (dd > 0.5) ctx.present().forEach(function (x) { ctx.present().forEach(function (y) { if (x !== y && fated(ctx, x, y) && met(ctx, x, y) && HK.canLove(x, y)) ctx.R(x, y).att = HK.clamp(ctx.R(x, y).att + (dd - 0.5) * 4, 0, 100); }); });
      /* 時間が経てば、ぎすぎすは少しずつ薄れる（恋人同士はなおさら） */
      ctx.chars.forEach(function (x) { ctx.chars.forEach(function (y) { var r = ctx.rel[x.i][y.i]; if (r) r.ten *= ctx.pair(x, y).couple ? 0.95 : 0.96; }); });
  }

  /* ---------- 準備 ---------- */
  function setup(ctx) {
    var rng = ctx.rng, P = ctx.chars;
    ctx.place = '街';
    ctx.stepsTotal = scen.steps(ctx.env).length;
    var om = ctx.om = { met: {}, bonded: {}, bondOf: {}, everBonded: {}, mates: {}, scar: {}, bondHow: {}, bondAt: {}, fatedSplit: {}, hesitate: {}, rival: {}, dates: [], gifts: [], switched: [], quit: [], usedDates: {}, bites: 0, heats: 0, amagami: 0, fatedMeetAt: {}, det: { cur: null, n: 0, solved: 0, doneAt: null, lastStep: -1 }, ending: null };
    P.forEach(function (c) {
      var pk = c.pick || {};
      var o = c.om = { sex: pk.sex && SX[pk.sex] ? pk.sex : null, sw: pk.sw === 'yes' ? true : pk.sw === 'no' ? false : null, job: pk.job && OM.JOB[pk.job] ? pk.job : null, heat: 0, rut: 0 };
      if (!o.sex) { var r = rng(); o.sex = r < 0.3 ? 'a' : r < 0.62 ? 'b' : 'o'; o.sexAuto = true; }
      if (o.sw == null) o.sw = o.sex !== 'b' && rng() < 0.1;
      if (!o.job) {
        var j = HK.weighted(rng, OM.JOBS, function (x) { return Math.pow(Math.max(0.05, OM.JOB_FIT[x[2]](c.tr)), 2.5) * OM.STATUS.mult(o.sex, x[0], ctx.env.society); });
        o.job = j[0]; o.jobAuto = true;
      }
      /* 隠れΩ：Ωであることを隠して働く（地位の高い職ほど、偏見が強いほど隠しやすい） */
      o.hidden = o.sex === 'o' && (pk.hide === 'yes' || (pk.hide !== 'no' && rng() < (OM.STATUS.HIGH[o.job] ? 0.25 + ctx.env.society / 250 : 0.05 + ctx.env.society / 600) + (c.actionPick === 'guard' ? 0.3 : 0)));
      if (o.hidden) { o.fake = OM.STATUS.HIGH[o.job] && c.tr.cp > 0.6 && ctx.rng() < 0.4 ? 'a' : 'b'; o.exposure = 0; }
      /* 職歴：元〇〇かどうかと、辞めた理由 */
      var high = !!OM.STATUS.HIGH[o.job], soc = ctx.env.society / 100;
      o.former = pk.jobst === 'ex' ? true : pk.jobst === 'now' || o.hidden ? false : rng() < 0.08 + (o.sex === 'o' && high ? soc * 0.3 : 0);
      if (o.former) {
        var fame = high || OM.JOB[o.job].cat === 'show';
        o.formerWhy = o.sex === 'o' && rng() < 0.3 + soc * 0.6 ? 'bias' : o.sex === 'a' && rng() < 0.4 ? (fame ? rng.pick(['pride', 'scandal']) : 'pride') : rng.pick(fame ? ['burnout', 'family', 'injury', 'scandal'] : ['burnout', 'family', 'injury']);
        o.formerTxt = { bias: 'Ωだと知られて辞めた', burnout: '燃え尽きて辞めた', pride: '期待に潰されて辞めた', scandal: '辞めた理由は語らない', family: '家族の事情で辞めた', injury: '怪我で辞めた' }[o.formerWhy];
      }
      o.orig = o.sex;
      var img = HK.EgoImage ? HK.EgoImage.of(HK.toCode(c.eg)) : null;
      o.scent = pk.scent ? String(pk.scent).replace(/の(匂い|香り)$/, '') : img ? img.scent : '石鹸';
      o.scentAuto = !pk.scent; o.rng = rng; o.scentWhy = pk.scent ? '' : img ? img.scentWhy : '';
      o.heatAt = 1 + rng.int(5);
      o.switchAt = o.sw ? 2 + rng.int(20) : -1;
    });
    if (OM.jobSetup) OM.jobSetup(ctx);
    /* 第二性による最初の惹かれ方 */
    P.forEach(function (a) {
      P.forEach(function (b) {
        if (a === b) return;
        var r = ctx.R(a, b);
        if (!HK.canLove(a, b)) return;
        var ch = (ctx.stat(b, 'charm') - 3) * 3;
        if (ao(a, b)) r.att = HK.clamp(r.att + 10 + ch, 0, 100);
        else if (sx(a) === 'a' && sx(b) === 'a') { r.ten = HK.clamp(r.ten + 8, 0, 100); }
      });
    });
    P.forEach(function (a) {
      P.forEach(function (b) {
        if (a.i >= b.i) return;
        var pf = ctx.pair(a, b);
        if (ao(a, b)) pf.chem = HK.clamp(pf.chem * 1.25, 0.1, 2);
        if (pf.couple) { pf.preset = true; pf.since = 0; }
        /* 関係「番」：α×Ωなら最初から番 */
        var tt = HK.Ties && HK.Ties.get(ctx, a, b);
        if (tt && tt.type === 'mate' && ao(a, b)) {
          var A0 = alphaOf(a, b), O0 = omegaOf(a, b), k0 = key(a, b);
          om.bonded[k0] = true; om.bondOf[O0.i] = A0.i; om.everBonded[O0.i] = true; om.mates[A0.i] = (om.mates[A0.i] || []).concat([O0.i]);
          om.bondHow[k0] = 'vow'; om.bondAt[k0] = 0; pf.presetBond = true; pf.couple = true; pf.preset = true; pf.since = 0;
        }
        if (OM.DET.buddyCtx(ctx, a, b)) { pf.buddy = true; [ctx.R(a, b), ctx.R(b, a)].forEach(function (r) { r.trust = HK.clamp(r.trust + 25, -100, 100); r.aff = HK.clamp(r.aff + 15, -100, 100); }); }
        if (fated(ctx, a, b)) {
          if (pf.couple) { ctx.om.met[key(a, b)] = true; return; }
          /* 運命の抗えなさが低いと、出会っても気づくまでに時間がかかる */
          var at = 1 + rng.int(6) + (dest(ctx) < 0.4 ? rng.int(1 + Math.round((0.4 - dest(ctx)) * 10)) : 0);
          om.fatedMeetAt[key(a, b)] = at;
          /* 出会うまでは、運命の番どうしの惹かれは眠っている */
          ['att', 'aff'].forEach(function (k) { pf['sleep_' + k] = [ctx.R(a, b)[k], ctx.R(b, a)[k]]; ctx.R(a, b)[k] = 0; ctx.R(b, a)[k] = 0; });
        }
      });
    });
  }

  /* ---------- 区切りごと ---------- */
  function phase(ctx, s, n) {
    var P = ctx.present(), rng = ctx.rng, om = ctx.om;
    if (s === 0) {
      ctx.say({ text: '見守りが始まった。' + P.map(function (c) { return c.name + '（' + S(c) + (c.om.hidden ? '。周りには' + SX[c.om.fake] + 'と偽っている' : '') + '・' + jobName(c) + '）'; }).join('、') + '。' });
      P.forEach(function (c) { if (c.om.former) ctx.say({ kind: 'event', cat: 'solo', actors: [c], text: fill(ctx, OM.STATUS.FORMER_WHY[c.om.formerWhy], c, null), why: '職歴：' + jobName(c) }); });
      if (OM.jobIntro) OM.jobIntro(ctx);
      P.forEach(function (a) {
        P.forEach(function (b) {
          if (a.i < b.i && ctx.pair(a, b).couple) ctx.say({ kind: 'event', cat: 'romance', actors: [a, b], text: a.name + 'と' + b.name + (om.bonded[key(a, b)] ? 'は、もう番になっている。' + omegaOf(a, b).name + 'のうなじには、' + alphaOf(a, b).name + 'の噛み跡がある。' : 'は、もう付き合っている。' + (ao(a, b) ? 'まだ番にはなっていない。' : '')) });
        });
      });
    }
    /* 運命の番の出会い */
    Object.keys(om.fatedMeetAt).forEach(function (k) {
      if (om.fatedMeetAt[k] !== s || om.met[k]) return;
      var ij = k.split('-'), a = ctx.chars[+ij[0]], b = ctx.chars[+ij[1]];
      if (!a.alive || !b.alive) return;
      om.met[k] = true;
      var pf = ctx.pair(a, b), d = dest(ctx);
      /* 惹かれの立ち上がり：抗えなさが高いほど一目で落ちる（+10〜+50）、低いほど気づくのに時間がかかる */
      var up = 10 + d * 40, upAff = 4 + d * 12;
      ctx.R(a, b).att = HK.clamp(pf.sleep_att[0] + up, 0, 100); ctx.R(b, a).att = HK.clamp(pf.sleep_att[1] + up, 0, 100);
      ctx.R(a, b).aff = pf.sleep_aff[0] + upAff; ctx.R(b, a).aff = pf.sleep_aff[1] + upAff;
      var where = rng.pick(['駅の改札', '雨宿りの軒先', '取引先の会議室', 'コンビニのレジ待ち', '友人の結婚式の二次会', '病院の待合室', '深夜の交差点']);
      var t = rng.pick(d < 0.3 ? [
        where + 'で、' + a.name + 'と' + b.name + 'はすれ違った。' + a.name + 'は一瞬だけ足を止め、それから何事もなかったように歩き出した。――その匂いが何だったのか、気づくのは何日も経ってからだった。',
        where + 'で' + a.name + 'と' + b.name + 'の目が合った。妙に落ち着く匂いだ、と思った。それだけだった。運命の番だと知るのは、ずっとあとになる。'
      ] : d > 0.7 ? [
        where + 'で、' + a.name + 'と' + b.name + 'はすれ違った。次の瞬間、二人とも立ち止まっていた。――匂いが、理性を素通りして体を掴んだ。膝が震えた。',
        where + 'で' + a.name + 'と' + b.name + 'の目が合った。息が止まった。名前も知らないのに、もう離れられないと分かってしまった。'
      ] : [
        where + 'で、' + a.name + 'と' + b.name + 'はすれ違った。振り返ったのは同時だった。――匂いが、体の奥の何かを叩いた。',
        where + 'で' + a.name + 'と' + b.name + 'の目が合った。知らない人のはずなのに、ずっと探していた気がした。',
        a.name + 'は' + where + 'で、知らない匂いに足を止めた。その先に' + b.name + 'がいた。'
      ]);
      ctx.say({ kind: 'event', cat: 'romance', actors: [a, b], text: t + a.name + 'からは' + short(a) + '、' + b.name + 'からは' + short(b) + 'の匂いがした。' + (d < 0.3 ? '――それが運命の番の匂いだと、二人はまだ知らなかった。' : '運命の番だった。') + (HK.Attr && HK.Attr.meetLine ? HK.Attr.meetLine(a, b, ctx) || HK.Attr.meetLine(b, a, ctx) : ''), why: '運命の番の出会い（遺伝子レベルの惹かれ）／運命の抗えなさ ' + Math.round(d * 100) + (d < 0.3 ? '：出会っても気づくのに時間がかかる' : d > 0.7 ? '：一目で落ちる' : ''), mag: 40 });
      [a, b].forEach(function (x) {
        var y = x === a ? b : a, p = partnerOf(ctx, x);
        if (p && p !== y) { ctx.pair(x, p).fatedPending = true; ctx.say({ kind: 'event', cat: 'romance', actors: [x, p], text: x.name + 'には、' + p.name + 'という恋人がいる。' + x.name + 'はその夜、' + p.name + 'からの連絡に返事ができなかった。', why: '運命の番と、今の恋人', mag: 15 }); }
      });
    });
    /* スイッチ */
    P.forEach(function (c) {
      if (c.om.switchAt !== s || c.om.switched) return;
      doSwitch(ctx, c);
    });
    /* 発情期 */
    P.forEach(function (c) {
      if (sx(c) !== 'o' || c.om.heat > 0) return;
      if (s >= c.om.heatAt) {
        c.om.heat = 1 + (ctx.env.heat > 60 ? 1 : 0);
        c.om.heatAt = s + 5 + rng.int(2);
        om.heats++;
        var txt = rng.pick(['{a}の発情期が来た。', '{a}は朝起きた瞬間に分かった。――来た。', '{a}の体温が上がり始めた。周期どおりの発情期だった。']);
        var sup = ctx.env.heat < 40 || c.tr.caution > 0.6, d = dest(ctx), dw = '';
        /* 運命の抗えなさ：高いと抑制剤も理性も本能に負けやすく、低いと理性で抑えやすい */
        if (sup && d > 0.5 && rng() < (d - 0.5) * 0.9) { sup = false; dw = '・抑制剤が本能に負けた（運命の抗えなさ ' + Math.round(d * 100) + '）'; }
        else if (!sup && d < 0.5 && rng() < (0.5 - d) * 0.6) { sup = true; dw = '・理性で抑えた（運命の抗えなさ ' + Math.round(d * 100) + '）'; }
        ctx.say({ kind: 'event', cat: 'solo', actors: [c], text: ctx.t(txt, c) + (sup ? '抑制剤を飲んで、どうにか日常を保った。' : '抑制剤が効きにくい。部屋のカーテンを閉め切った。'), why: 'Ωの発情期（周期）' + (sup ? '・抑制剤が効いた' : '') + dw, mag: 6 });
        if (sup) c.om.heat = Math.max(0, c.om.heat - 1) || 1;
        c.om.supp = sup;
      }
    });
    P.forEach(function (c) {
      if (sx(c) === 'a' && c.om.rut <= 0 && rng() < 0.05 + ctx.env.heat / 1000) {
        c.om.rut = 1;
        ctx.say({ kind: 'event', cat: 'solo', actors: [c], text: sc(ctx.t(rng.pick(['{a}のラットが来た。苛立ちと熱が、理由もなく込み上げる。', '{a}は自分の{sa}の匂いが濃くなっているのに気づき、予定を全部キャンセルした。']), c), c), why: 'αのラット', mag: 4 });
      }
    });
    scheduleDates(ctx, s);
    /* 傷を負ったΩの発情期は、ひとりで耐えるしかない */
    P.forEach(function (c) {
      if (sx(c) === 'o' && om.scar[c.i] && c.om.heat > 0 && rng() < 0.6) {
        var by = ctx.chars[om.scar[c.i].by];
        ctx.say({ kind: 'event', cat: 'solo', actors: [c], text: ctx.t(rng.pick(['{a}の発情期。番がそばにいない発情期は、抑制剤ではどうにもならなかった。{a}は{b}の匂いの残ったシャツを抱いて、朝まで震えていた。', '{a}は番以外のαの匂いに吐き気がして、外に出られなくなった。噛み跡が疼くたびに、{b}の名前を呼びそうになった。', '番に置いていかれたΩの発情期は、ただの熱じゃない。{a}は浴室の床で、冷たいタイルに頬を押しつけていた。']), c, by), why: 'Ωの番は一生に一人。番を失ったΩは、発情期のたびに番を求めてしまう', mag: 15 });
      }
    });
  }

  /* スイッチ：α⇄Ω（βは後天的にΩになることがある） */
  function doSwitch(ctx, c) {
    var om = ctx.om, from = sx(c), to = from === 'a' ? 'o' : from === 'o' ? 'a' : 'o';
    c.om.sex = to; c.om.switched = true;
    om.switched.push(c.i);
    var J = job(c), quit = false;
    var txt = c.name + 'の体に異変が起きた。検査の結果は――' + SX[from] + 'から' + SX[to] + 'への転換（スイッチ）。';
    var bias = ctx.env.society / 100;
    if ((to === 'o' && J.a && ctx.rng() < 0.35 + bias * 0.6) || (to === 'a' && J.o && ctx.rng() < 0.5 + bias * 0.4)) {
      quit = true; c.om.quit = J.name; om.quit.push(c.i);
      txt += to === 'o' ? c.name + 'は「Ωの' + J.name + 'は前例がない」と告げられ、離職を余儀なくされた。' : c.name + 'は「αの' + J.name + 'は売り方が違う」と契約を切られた。';
    } else if (to === 'o') txt += '発情期という言葉が、急に自分のものになった。';
    else txt += '鏡に映る自分の目つきが、少しだけ鋭くなった気がした。';
    ctx.say({ kind: 'event', cat: 'solo', actors: [c], text: txt, why: 'スイッチする体質' + (quit ? '／世間の偏見（' + ctx.env.society + '）と職業' : ''), mag: 35 });
    ctx.stress(c, quit ? 40 : 20);
    if (to === 'o') { c.om.heatAt = ctx.stepIndex + 2; }
    /* 恋人の反応と、関係の組み替え */
    var p = partnerOf(ctx, c);
    if (p) {
      var r = ctx.R(p, c), was = from + sx(p), now = to + sx(p);
      if (r.aff + r.trust > 90 || p.tr.np > 0.65) {
        ctx.mod2(p, c, { aff: 6, trust: 8 }, { aff: 10, trust: 12 });
        ctx.say({ kind: 'event', cat: 'help', actors: [p, c], text: p.name + 'は' + c.name + 'の手を握った。「' + SX[to] + 'でも' + SX[from] + 'でも、' + c.name + 'は' + c.name + 'だろ」', why: p.name + 'の想い（好意＋信頼）', mag: 20 });
        if (now === 'oa' || now === 'ao') ctx.R(p, c).att = HK.clamp(r.att + 12, 0, 100);
      } else if (was === 'ao' && now === 'oo' || was === 'oa' && now === 'aa' || was === 'aa' || was === 'oo') {
        ctx.mod2(p, c, { att: -12, ten: 10 }, { ten: 12 });
        ctx.pair(p, c).switchStrain = true;
        ctx.say({ kind: 'event', cat: 'conflict', actors: [p, c], text: p.name + 'は、' + c.name + 'の新しい匂いに戸惑っていた。「……ごめん、少し時間がほしい｜……すまない、少し時間がほしい｜……すみません、少し時間がほしいです」', why: '第二性の組み合わせが変わった', mag: 18 });
      }
      if (om.bonded[key(c, p)] && from === 'o') { delete om.bonded[key(c, p)]; delete om.bondOf[c.i]; c.om.bondLost = true; ctx.say({ kind: 'event', cat: 'romance', actors: [c, p], text: c.name + 'のうなじの番の印が、日ごとに薄れていった。' + p.name + 'はそれを、何も言えずに見ていた。', why: 'Ωでなくなると番は解ける', mag: 25 }); }
    }
    if (OM.onSwitch) OM.onSwitch(ctx, c);
    /* α同士でためらっていた二人に、道が開ける */
    ctx.present().forEach(function (o) {
      if (o === c) return;
      var k = key(c, o);
      if (om.hesitate[k] && ao(c, o)) { om.hesitate[k] = 0; ctx.mod2(c, o, { att: 10 }, { att: 10 }); }
    });
  }

  /* ---------- 出来事 ---------- */
  /* 匂いに気づく（α×Ωの初期） */
  EV.push({
    id: 'om_scent', cat: 'romance', scope: 'pair',
    when: function (ctx, a, b) { return ao(a, b) && met(ctx, a, b) && !ctx.pair(a, b).scent && HK.canLove(a, b); },
    w: function (ctx, a, b) { return 1.4 + ctx.R(a, b).att / 40; },
    run: function (ctx, a, b) {
      ctx.pair(a, b).scent = true;
      var A = alphaOf(a, b), O = omegaOf(a, b);
      ctx.mod2(A, O, { att: 8 }, { att: 7 });
      var t = ctx.pick(['{a}はすれ違いざまに、{b}の匂いに気づいた。{sb}――いい匂いだ、と思った。思ってから慌てた。', '{b}の首元から、かすかに{sb}の匂いがした。{a}は一歩だけ近づき、一歩だけ離れた。', '{a}と{b}がエレベーターで二人きりになった。狭い箱の中で、{sa}と{sb}の匂いが混ざった。', '{b}は{a}の上着から漂う{sa}の匂いに、思わず顔を上げた。', '{a}は{b}が座っていた椅子に残る{sb}の匂いを、気づけば探していた。']);
      return { text: sc(ctx.t(t, A, O), A, O), why: 'α（' + A.name + '）とΩ（' + O.name + '）の匂い' };
    }
  });

  /* α同士・Ω同士のためらい／それでも */
  EV.push({
    id: 'om_same', cat: 'romance', scope: 'pair',
    when: function (ctx, a, b) { var s = sx(a) + sx(b); return (s === 'aa' || s === 'oo') && !ctx.pair(a, b).couple && love(ctx.R(a, b)) && ctx.R(b, a).att > 30 && (!HK.Poly || HK.Poly.canCouple(ctx, a, b)); },
    w: function (ctx, a, b) { return 1.6 + ctx.R(a, b).att / 50; },
    run: function (ctx, a, b) {
      var om = ctx.om, k = key(a, b), pf = ctx.pair(a, b), both = sx(a) === 'a', ra = ctx.R(a, b), rb = ctx.R(b, a);
      om.hesitate[k] = (om.hesitate[k] || 0) + 1;
      var brave = (a.tr.honesty + b.tr.honesty) / 2 + (ra.trust + rb.trust) / 200 - (a.tr.cp + b.tr.cp) / 4 - ctx.env.society / 300;
      if (om.hesitate[k] >= 3 && love(rb) && brave > 0.4 && !pf.fwb && ctx.rng() < 0.3) {
        pf.couple = true; om.hesitate[k] = 0; pf.braveSame = true;
        ctx.mod2(a, b, { aff: 10, trust: 10 }, { aff: 10, trust: 10 });
        return { text: ctx.t(both ? ctx.pick(['「αとαで、番にもなれないのに｜＝｜αとαで、番にもなれないのに」と{b}が言った。{a}は「なれなくていいよ｜なれなくていい｜なれなくていいです」と答えた。二人は付き合うことにした。', '{a}は{b}の胸ぐらを掴むようにして言った。「αだからなんなの｜αだからなんだ｜αだからなんですか」――それが告白だった。']) : ctx.pick(['「Ω同士じゃ、守ってもらえないよ｜Ω同士では、守ってもらえない｜Ω同士では、守ってもらえませんよ」{b}が笑った。{a}は「守り合えばいいよ｜守り合えばいい｜守り合えばいいです」と言った。', '{a}と{b}は、発情期が重なった夜に抑制剤を分け合いながら、付き合おうと決めた。']), a, b), why: '何度ためらっても残った想い（本音の出やすさ・信頼）', mag: 30 };
      }
      ctx.mod2(a, b, { ten: 4, att: 2 }, { ten: 4, att: 2 });
      ctx.stress(a, 6); ctx.stress(b, 6);
      return { text: ctx.t(both ? ctx.pick(['{a}と{b}は、いい雰囲気になりかけた。だがお互いの匂いがぶつかって、どちらからともなく距離を取った。「……αとαじゃな｜……αとαではな｜……αとαでは、無理ですね」', '{a}は{b}に触れかけて、手を止めた。αの本能が、相手を「競う相手」だと言っていた。', '{a}は{b}への気持ちに気づいていた。でも、αとαの未来が想像できなかった。']) : ctx.pick(['{a}と{b}は手を繋ぎかけて、笑ってごまかした。「Ω同士で、何やってんだろ｜Ω同士で、何をやっているんだ｜Ω同士で、何をやっているんでしょう」', '{a}は{b}の発情期の匂いに、甘さではなく共感を覚えた。それが恋なのか、分からなかった。']), a, b), why: (both ? 'α同士' : 'Ω同士') + 'のためらい（偏見 ' + ctx.env.society + '・CP）', mag: 12 };
    }
  });

  /* 告白 */
  EV.push({
    id: 'om_confess', cat: 'romance', scope: 'pair', pri: true,
    when: function (ctx, a, b) {
      var s = sx(a) + sx(b);
      if (s === 'aa' || s === 'oo') return false;
      return met(ctx, a, b) && !ctx.pair(a, b).couple && HK.canLove(a, b) && love(ctx.R(a, b)) && !partnerOf(ctx, a) && (!HK.Poly || HK.Poly.canCouple(ctx, a, b)) && !(ctx.pair(a, b).rejected != null && ctx.stepIndex - ctx.pair(a, b).rejected < 4) && !ctx.om.fatedSplit[key(a, b)] && !(ctx.pair(a, b).night && !ctx.pair(a, b).fwbAsked && HK.FWB.lean(a) > 0.5) && !(ctx.pair(a, b).fwb && HK.FWB.lean(a) > 0.55 && ctx.rng() < 0.7);
    },
    w: function (ctx, a, b) { return 0.8 + a.tr.honesty + ctx.R(a, b).att / 60 + (a.goal.id === 'mate' ? 0.8 : 0) + (fated(ctx, a, b) ? Math.max(0, dest(ctx) - 0.5) * 3 : 0); },
    run: function (ctx, a, b) {
      var pf = ctx.pair(a, b), rb = ctx.R(b, a), p2 = partnerOf(ctx, b);
      if (love(rb) && !p2) {
        pf.couple = true; pf.since = ctx.stepIndex; pf.broke = null;
        ctx.mod2(a, b, { aff: 12, trust: 10 }, { aff: 12, trust: 10 });
        var t = fated(ctx, a, b) ? ctx.pick(['言葉はいらなかった。{a}が手を伸ばすより先に、{b}がその手を取っていた。', '{a}「私、初めて会った気がしない｜初めて会った気がしない｜私、初めて会った気がしません」{b}「……私も｜＝｜……私もです」']) : ctx.pick(['{a}は{b}に「好き｜好きだ｜好きです」と言った。{b}は少し驚いて、それから笑った。「遅いよ｜遅い｜遅いですよ」', '{a}の告白は、噛んで二回言い直した。{b}は三回目を待たずに頷いた。', '帰り道、{a}は立ち止まって「付き合ってほしい｜＝｜付き合ってほしいです」と言った。{b}は「うん｜ああ｜はい」とだけ言った。', '{a}「番とか、そういうの抜きで、私は{b}が好き｜番とか、そういうものは抜きで、私は{b}が好きだ｜番とか、そういうのは抜きで、私は{b}さんが好きです」{b}「抜かなくていいよ｜抜かなくていい｜抜かなくていいですよ」']);
        return { text: ctx.t(t, a, b), why: '両想い（惹かれ ' + Math.round(ctx.R(a, b).att) + '／' + Math.round(rb.att) + '）' + (fated(ctx, a, b) ? '・運命の番' + destWhy(ctx) : ''), mag: 30 };
      }
      pf.rejected = ctx.stepIndex; pf.rejCount = (pf.rejCount || 0) + 1; pf.rejBy = a.i;
      ctx.mod2(a, b, { aff: -6, ten: 8, att: pf.rejCount >= 2 ? -15 : 0 }, { ten: 6 });
      ctx.stress(a, 14);
      return { text: ctx.t(p2 ? '{a}は{b}に想いを伝えた。{b}は申し訳なさそうに、恋人のいる方の手を見せた。' : ctx.pick(['{a}は{b}に告白した。{b}は「ごめん｜すまない｜ごめんなさい」と言った。理由は言わなかった。', '{a}の告白に、{b}は長い沈黙のあと「友達のままがいい｜＝｜友達のままがいいです」と答えた。']), a, b), why: b.name + 'の気持ちはまだそこになかった', mag: 18 };
    }
  });

  /* デート（恋人同士）：月に一度くらいは必ず出かける */
  function dateRun(ctx, a, b) {
    var om = ctx.om, pf = ctx.pair(a, b), k = key(a, b);
    om.usedDates[k] = om.usedDates[k] || {};
    var d = OM.pickDate(ctx.rng, a, b, { att: (ctx.R(a, b).att + ctx.R(b, a).att) / 2 }, om.usedDates[k]);
    if (!d) { om.usedDates[k] = {}; d = OM.pickDate(ctx.rng, a, b, { att: 50 }, {}); }
    om.usedDates[k][d.name] = 1;
    pf.lastDate = ctx.stepIndex; pf.dates = (pf.dates || 0) + 1;
    om.dates.push({ a: a.i, b: b.i, place: d.name });
    ctx.mod2(a, b, { aff: 6, att: 4, trust: 3, ten: -4 }, { aff: 6, att: 4, trust: 3, ten: -4 });
    var lead = ctx.most([a, b], function (c) { return c.tr.lead; }), other = lead === a ? b : a;
    var scenes = [
      '{a}と{b}は「' + d.name + '」へ出かけた。' + d.desc + '。',
      '{a}が選んだ今回のデートは「' + d.name + '」。{b}は着いた瞬間に「分かってるね｜分かっているな｜分かっていますね」と笑った。',
      '「' + d.name + '」で、{a}と{b}は気づけば日が暮れるまで過ごしていた。',
      '{b}の「どこ行く？｜どこへ行く｜どこへ行きますか？」に、{a}は迷わず「' + d.name + '」と答えた。'
    ];
    var t = ctx.t(ctx.pick(scenes), lead, other);
    t += ctx.t(ctx.pick(dateBeat(lead, other)), lead, other);
    var why = d.why.length ? '二人のエゴグラム：' + d.why.join('、') + '二人だから' : '二人のエゴグラムに合うデート先';
    /* 食べ物の好み（food.js）：好みを決めた人がいるときだけ、ときどき好物の一句を足す */
    if (HK.Food && HK.Food.any([a, b]) && ctx.rng() < 0.35) {
      var ft = HK.Food.talk(ctx, lead, other, ['remember', 'share', 'gift', 'hate']) || HK.Food.talk(ctx, other, lead, ['remember', 'share', 'gift', 'hate']);
      if (ft) { t += ft.text; why += '／' + ft.why; }
    }
    if (ctx.rng() < 0.45) {
      var giver = ctx.rng() < 0.5 ? a : b, recv = giver === a ? b : a;
      var g = OM.pickGift(ctx.rng, giver, recv, sx(giver), sx(recv));
      om.gifts.push({ from: giver.i, to: recv.i, name: g.name });
      ctx.mod(recv, giver, { aff: 6, att: 3 });
      t += g.nest ? ctx.t('帰り際、{a}は{b}に紙袋を渡した。中身は' + g.name + '。' + short(giver) + 'の匂いがした。{b}はその夜、それを抱いて巣を作った。', giver, recv)
        : ctx.t('{a}から{b}へのプレゼントは、' + g.name + '。' + giftReact(ctx, recv), giver, recv);
      why += '／贈り物は' + giver.name + 'の' + (g.nest ? 'αの本能（巣作り用）' : g.top + '優位な気質') + 'から';
    }
    return { text: t, why: why, mag: 12 };
  }
  HK.OMEGA.dateRun = dateRun;
  function scheduleDates(ctx, s) {
    if (s % 2 !== 0) return;
    var P = ctx.present();
    P.forEach(function (a) {
      P.forEach(function (b) {
        if (a.i >= b.i) return;
        var pf = ctx.pair(a, b);
        if (!pf.couple || a.om.heat || b.om.heat) return;
        if (pf.lastDate != null && s - pf.lastDate < 2) return;
        if (ctx.rng() > 0.8) return;
        var res = null;
        ctx.act2({ actors: [a, b], cat: 'romance', fx: function () { res = dateRun(ctx, a, b); return res; }, text: function (r) { return r.text; }, why: function (r) { return r.why; }, mag: 12 });
      });
    });
  }
  function dateBeat(a, b) {
    var out = [];
    if (a.tr.fc > 0.6 || b.tr.fc > 0.6) out.push('はしゃぎすぎて、帰りの電車で二人とも寝落ちした。', '{a}が撮った{b}の変な顔の写真が、待ち受けになった。');
    if (a.tr.np > 0.6 || b.tr.np > 0.6) out.push('{a}は{b}の歩く速さに、何も言わずに合わせていた。', '寒くなってきて、{a}は自分の上着を{b}にかけた。');
    if (a.tr.a > 0.6 || b.tr.a > 0.6) out.push('{a}は下調べした豆知識を披露し、{b}は半分聞き流しながら嬉しそうだった。');
    if (a.tr.ac > 0.6 || b.tr.ac > 0.6) out.push('{b}は「楽しかった？｜楽しかったか｜楽しかったですか？」と三回確認した。{a}は三回とも「楽しかった｜＝｜楽しかったです」と答えた。');
    if (a.tr.cp > 0.6 || b.tr.cp > 0.6) out.push('{a}は予約から会計まで完璧に仕切った。{b}は財布を出す隙がなかった。');
    out.push('帰り道、どちらからともなく手を繋いだ。', '別れ際、{b}は名残惜しそうに{a}の袖をつまんだ。');
    return out;
  }
  function giftReact(ctx, r) {
    if (r.tr.ac > 0.6) return ctx.t('{b}は「私、こんなのもらっていいの｜こんなものをもらっていいのか｜私、こんなものをもらっていいんですか」と言いながら、大事そうに抱えた。', null, r);
    if (r.tr.fc > 0.6) return ctx.t('{b}は声を上げて喜んで、その場で使い始めた。', null, r);
    if (r.tr.cp > 0.6) return ctx.t('{b}は「……悪くないね｜……悪くない｜……悪くないです」と言った。最上級の褒め言葉だった。', null, r);
    if (r.tr.a > 0.6) return ctx.t('{b}はしばらく黙って眺めてから、「よく分かってるね｜よく分かっている｜よく分かっていますね」と言った。', null, r);
    return ctx.t('{b}は照れくさそうに受け取った。', null, r);
  }

  /* 発情期・ラットのそばで */
  EV.push({
    id: 'om_heat', cat: 'romance', sex: true, scope: 'pair', pri: true,
    when: function (ctx, a, b) { return (a.om.heat > 0 && sx(a) === 'o') || (b.om.heat > 0 && sx(b) === 'o') || (a.om.rut > 0 && sx(a) === 'a' && sx(b) === 'o'); },
    w: function (ctx, a, b) { return 1.5 + ctx.env.heat / 50 + Math.max(ctx.R(a, b).att, ctx.R(b, a).att) / 50; },
    run: function (ctx, a, b) { return heatScene(ctx, a, b); }
  });
  function heatScene(ctx, a, b) {
    var om = ctx.om, pf = ctx.pair(a, b), k = key(a, b);
    var O = sx(a) === 'o' && a.om.heat > 0 ? a : sx(b) === 'o' && b.om.heat > 0 ? b : sx(a) === 'o' ? a : b, X = O === a ? b : a;
    var rX = ctx.R(X, O), rO = ctx.R(O, X), heat = ctx.env.heat / 100, d = dest(ctx), isF = fated(ctx, a, b);
    /* 運命の抗えなさ：高いほど発情期の本能に流されやすい（発情期の重さに足し引きする） */
    heat = HK.clamp(heat + (d - 0.5) * 0.5, 0, 1.2);
    /* 執着（信仰）で「恋愛に発展：しない」組（支配しているときを除く）は、発情期の相手にしない（omega-ties.js の OM.worshipNoNight） */
    var noW = !!(OM.worshipNoNight && OM.worshipNoNight(ctx, X, O));
    var mutual = !noW && rX.att > 35 && rO.att > 35 && HK.canLove(X, O) && HK.canLove(O, X);
    var bound = pf.couple || isF;
    var mate = BD.mateOf(ctx, O);
    /* 番のいるΩは、番以外を体が拒む */
    if (mate && mate !== X) {
      ctx.mod2(X, O, { trust: 3 }, { trust: 4 });
      return { cat: 'help', text: ctx.t(ctx.pick(['{a}が近づいた瞬間、{b}は口元を押さえてうずくまった。番以外のαの匂いを、体が受けつけない。', '{b}は熱に浮かされながらも、{a}の手を振り払った。「だめ……私には、番がいる｜だめだ……私には、番がいる｜だめです……私には、番がいます」']).replace(/私／俺/, O.tr.cp + O.tr.fc > 1 ? '俺' : '私'), X, O) + (mate ? ctx.t('{b}が呼んだのは、{c}の名前だった。', X, O, mate) : ''), why: O.name + 'には番（' + mate.name + '）がいる。番のいるΩは、ほかのαを拒む', mag: 12 };
    }
    var heatLine = OM.HEAT;
    var casual = !noW && !pf.couple && rX.att > 25 && rO.att > 25 && HK.canLove(X, O) && HK.canLove(O, X) && (HK.FWB.lean(X) + HK.FWB.lean(O)) / 2 > 0.45 && ctx.rng() < 0.5;
    /* 「誰とでも可」の人と固定外の相手（HK.State.freeSex。free-sex.js）：恋愛の条件（惹かれ・HK.canLove・HK.ngPair の恋愛側）を外し、発情期の熱と衝動で（固定した恋人がいれば ×0.3）。番にはならない */
    var fs = !noW && !!(HK.State.freeSex && HK.State.freeSex(ctx, X, O)) && ctx.rng() < HK.clamp(0.25 + heat * 0.35 + X.tr.impulse * 0.3, 0, 0.9) * HK.FreeSex.factor(ctx, X, O);
    /* 夜になる組は、受け攻め・恋愛対象（HK.Pos.okSex）と、恋愛やR18にしない組・性行為の相手の固定・R18に参加しない（HK.ngPair・HK.sexBlocked）を通るときだけ */
    var sexOk = fs || (!(HK.Pos && !HK.Pos.okSex(X, O)) && !(HK.ngPair && HK.ngPair(X, O)) && !(HK.sexBlocked && HK.sexBlocked(X, O)));
    if (sexOk && (sx(X) === 'a' || sx(X) === 'b') && (fs || bound && mutual || casual || (mutual && rX.trust > 20 && rO.trust > 20 && heat + X.tr.impulse * 0.4 > 0.75 && ctx.rng() < 0.55))) {
      pf.night = true; pf.nights = (pf.nights || 0) + 1;
      if (fs) {
        ctx.mod2(X, O, { aff: 3 }, { aff: 3 });
        HK.FreeSex.mark(ctx, X, O); HK.FreeSex.jealous(ctx, X, O);
        return { text: HK.FreeSex.lead(ctx, X, O) + heatLine.scene(ctx, X, O, { beta: sx(X) === 'b', insert: '' }), why: '発情期（' + O.name + '）の熱／' + HK.FreeSex.why(X, O) + '。番にはならない', mag: 22 };
      }
      ctx.mod2(X, O, { att: 10, aff: 6 }, { att: 10, aff: 6 });
      /* 噛む（番にする）：運命の抗えなさが高いほど、信頼が浅くても噛んでしまう・噛まれてしまう。低いほど信頼を待つ */
      var need = 30 - (d - 0.5) * 30;
      var willBite = BD.canBite(ctx, X, O) && (pf.couple || isF) && rX.trust > need && rO.trust > need && ctx.rng() < 0.55 + (isF ? 0.3 : 0) + (d - 0.5) * 0.4;
      /* Ωの側が攻め（受け攻めの指定）なら、Ωが自分からうなじを差し出す形だけ（行為の最中に噛まれて「ものになる」形は使わない） */
      var oLead = HK.Pos && HK.Pos.order(X, O, [X, O])[0] === O;
      /* 本能が先に噛む：抗えなさが高く、αが攻めで、まだ合意と呼べる信頼がないのに歯を立ててしまう（執着の「奪う番」とは別。相手も拒みはしない） */
      var instinct = !willBite && !oLead && BD.canBite(ctx, X, O) && isF && d > 0.6 && !(HK.Obsess && ctx.pair(X, O).ob && ctx.pair(X, O).ob[X.i] && ctx.pair(X, O).ob[X.i].lv >= 40) && ctx.rng() < (d - 0.6) * 1.2;
      var biteL = ['{b}は自分から髪をかき上げて、うなじを差し出した。「噛んで｜噛め｜噛んでください」――{a}の歯が沈んだ瞬間、二人は番になった。', '「いいの？一生だよ｜いいのか。一生だぞ｜いいんですか？一生ですよ」{a}の問いに、{b}は頷いた。{a}はうなじに深く歯を立てた。'];
      /* r18:begin */
      if (!oLead) biteL.push('果てる寸前、{a}は{b}のうなじに深く歯を立てた。{b}は痛みと熱の中で、自分が{a}のものになったのを感じた。');
      /* r18:end */
      var instL = ['「待って、まだ――｜待て、まだ――｜待ってください、まだ――」{b}の声が終わる前に、{a}の歯はうなじに沈んでいた。運命の匂いの前では、約束も順番も意味をなさなかった。', '噛まないつもりだった。{a}はそう思っていた。気づいたときには口の中に血の味があり、{b}のうなじに自分の歯形があった。{b}は泣きながら、{a}の背中に腕を回した。'];
      var biteT = willBite ? ctx.t(ctx.pick(biteL), X, O) : instinct ? ctx.t(ctx.pick(instL), X, O) : '';
      var t = heatLine.scene(ctx, X, O, { beta: sx(X) === 'b', insert: biteT });
      var why = '発情期（' + O.name + '）と、互いの惹かれ' + (bound ? '・' + (pf.couple ? '恋人' : '運命の番') : '') + '／' + X.name + 'は' + HK.egoType(X.eg).top + '優位、' + O.name + 'は' + HK.egoType(O.eg).top + '優位';
      /* 番になる（同意のうえで、αがΩのうなじを噛む） */
      if (willBite) {
        BD.bite(ctx, X, O, 'heat');
        ctx.mod2(X, O, { trust: 20, aff: 12 }, { trust: 20, aff: 12 });
        why += '／信頼が十分で、二人とも番を望んだ' + destWhy(ctx);
        return { text: t, why: why, mag: 45 };
      }
      if (instinct) {
        BD.bite(ctx, X, O, 'instinct');
        ctx.om.instinctBite = ctx.om.instinctBite || {}; ctx.om.instinctBite[k] = X.i;
        if (!pf.couple) { pf.couple = true; pf.since = ctx.stepIndex; }
        ctx.mod2(X, O, { att: 10, aff: 6 }, { att: 12, aff: 4, trust: -8, ten: 10 });
        ctx.stress(O, 15); ctx.stress(X, 10);
        why += '／合意を待たずに噛んでしまった：運命の抗えなさ ' + Math.round(d * 100);
        return { text: t, why: why, mag: 50 };
      }
      if (!pf.couple) why += '（まだ恋人ではない）';
      return { text: t, why: why, mag: 25 };
    }
    if (sx(X) === 'a') {
      var stop = X.tr.a * 0.5 + X.tr.cp * 0.4 + X.tr.np * 0.3 - heat * 0.5 - X.tr.impulse * 0.3;
      if (stop > 0.15 || !mutual) {
        ctx.mod2(X, O, { trust: 4 }, { trust: 10, aff: 6 });
        return { cat: 'help', text: sc(ctx.t(ctx.pick(['{a}は{b}の{sb}の匂いに膝が崩れかけた。自分の腕に爪を立て、「薬、どこ｜薬は、どこだ｜薬、どこですか」とだけ訊いた。', '{a}は{b}に背を向けたまま、扉の外から抑制剤を差し入れた。「開けないで。私が持たない｜開けるな。私が持たない｜開けないでください。私が持ちません」', '{a}は救急車を呼び、到着するまで廊下の端で壁に額をつけて待った。']), X, O), X, O), why: X.name + 'の理性（A・CP）が発情期の匂いに勝った' + (d <= 0.35 ? destWhy(ctx) : ''), mag: 18 };
      }
      pf.night = true; pf.nights = (pf.nights || 0) + 1;
      ctx.mod2(X, O, { att: 6, ten: 6 }, { att: 8, ten: 4 });
      return { text: ctx.t(ctx.pick(['{b}の匂いに呑まれて、{a}の理性が切れた。{b}も拒まなかった。', '「だめ｜だめだ｜だめです」と言いながら、{a}は{b}を抱き寄せていた。{b}の指が、{a}の背中に食い込んだ。']), X, O) + heatLine.scene(ctx, X, O, {}) + ctx.t('朝、二人は目を合わせられなかった。', X, O), why: '発情期の匂い（重さ ' + ctx.env.heat + '）と' + X.name + 'の衝動性' + (d >= 0.65 ? destWhy(ctx) : ''), mag: 22 };
    }
    if (sx(X) === 'b') {
      ctx.mod2(X, O, { trust: 4, aff: 3 }, { trust: 10, aff: 6 });
      return { cat: 'help', text: ctx.t(ctx.pick(['{a}は匂いの影響を受けないβらしく、淡々と{b}の看病をした。冷えピタ、水、抑制剤。', '{a}は{b}の部屋の前に、食料と飲み物を一週間分置いていった。「βで良かったって、初めて思った｜βで良かったと、初めて思った｜βで良かったって、初めて思いました」', '{a}は{b}をαたちから遠ざけるため、一晩中玄関の前に座っていた。']), X, O), why: X.name + 'はβ（フェロモンが効かない）', mag: 10 };
    }
    ctx.mod2(X, O, { aff: 6, trust: 6 }, { aff: 6, trust: 6 });
    return { cat: 'help', text: ctx.t(ctx.pick(['{a}は自分の抑制剤を半分、{b}に分けた。「分かるよ。しんどいよね｜分かる。しんどいな｜分かります。しんどいですよね」', '{a}と{b}は、Ω同士で発情期の愚痴を言い合った。少しだけ楽になった。']), X, O), why: 'Ω同士の共感', mag: 8 };
  }

  /* 発情期でなくても、勢いで一線を越える夜（恋人にならないまま続くこともある） */
  EV.push({
    id: 'om_night', cat: 'romance', sex: true, scope: 'pair',
    /* 「誰とでも可」の人と固定外の相手（HK.State.freeSex）は、恋愛の条件（HK.canLove・惹かれ・恋人のいない人どうし）を外す（番のいる人は除く） */
    when: function (ctx, a, b) { var pf = ctx.pair(a, b); if (pf.couple || pf.night || !met(ctx, a, b) || BD.mateOf(ctx, a) || BD.mateOf(ctx, b)) return false; return HK.State.freeSex(ctx, a, b) || (HK.canLove(a, b) && HK.canLove(b, a) && ctx.R(a, b).att > 28 && ctx.R(b, a).att > 24 && !partnerOf(ctx, a) && !partnerOf(ctx, b)); },
    w: function (ctx, a, b) { var h = ctx.om.hesitate[key(a, b)] ? 1 : 0, fs = HK.State.freeSex(ctx, a, b); return ((HK.FWB.lean(a) + HK.FWB.lean(b)) * 1.4 + h * 0.8 + (a.goal.id === 'free' ? 0.6 : 0) + (fs ? 0.5 : 0)) * (fs ? HK.FreeSex.factor(ctx, a, b, true) : 1); },
    run: function (ctx, a, b) {
      var pf = ctx.pair(a, b); pf.night = true; pf.nights = (pf.nights || 0) + 1;
      var fs = HK.State.freeSex(ctx, a, b);
      var same = sx(a) === sx(b) && sx(a) !== 'b';
      ctx.mod2(a, b, { att: same ? 3 : 8 }, { att: same ? 3 : 8 });
      var t = ctx.pick(same ? ['付き合えないのは分かっていた。それでも{a}と{b}は、飲んだ帰りに同じ部屋へ入った。', '「恋人にはなれないけど、これくらいなら｜恋人にはなれないが、これくらいなら｜恋人にはなれませんけど、これくらいなら」――{a}の言い訳に、{b}は黙って頷いた。'] : ['二軒目の帰り、{a}は{b}の手を引いて、自分の部屋の鍵を開けた。', '終電を逃した{a}と{b}は、駅前のホテルに入った。部屋は一つだった。', '{b}の家で飲み直しているうちに、{a}との距離がなくなった。']);
      /* 押し倒すのは、受け攻めの指定で攻めに回る側 */
      var ob = HK.Pos ? HK.Pos.order(a, b, [a, b]) : [a, b];
      t = ctx.t(t, a, b) + sc(ctx.t(ctx.pick(['{sa}と{sb}の匂いが混ざって、どちらからともなく唇を重ねた。――', '服を脱がせ合う手が、酔いのせいか少し乱暴だった。――', '{a}は{b}をベッドに押し倒し、{b}は{a}のシャツを引き寄せた。――']), ob[0], ob[1]), ob[0], ob[1]) + ctx.t(ctx.pick(['朝、二人は気まずそうに、でもどこか慣れたように「おはよう｜＝｜おはようございます」と言った。', '目が覚めると、{a}はもう服を着ていた。', '{b}は{a}の寝顔を見ながら、これが何の始まりなのか考えていた。']), a, b);
      /* lead：導入の一文（恋ではない）。厚い版（omega-thick.js）に差し替えても、頭に残す */
      if (fs) { HK.FreeSex.mark(ctx, a, b); HK.FreeSex.jealous(ctx, a, b); var ld = HK.FreeSex.lead(ctx, a, b); return { text: ld + t, lead: ld, why: HK.FreeSex.why(a, b) + '／恋人より気楽な関係に寄りやすい気質', mag: 20 }; }
      return { text: t, why: '惹かれ（' + Math.round(ctx.R(a, b).att) + '）と、恋人より気楽な関係に寄りやすい気質' + (same ? '／同じ第二性で付き合えない二人' : ''), mag: 20 };
    }
  });

  /* 両想いになったら愛咬：首筋や肩に印をつけ合う。α×Ωなら、そのまま番になることも */
  EV.push({
    id: 'om_amagami', cat: 'romance', scope: 'pair', pri: true,
    when: function (ctx, a, b) { var pf = ctx.pair(a, b); return pf.couple && !a.om.heat && !b.om.heat && (pf.amagami || 0) < 3 && ctx.stepIndex - (pf.lastAma == null ? -9 : pf.lastAma) >= 2; },
    w: function (ctx, a, b) { var pf = ctx.pair(a, b); return (pf.amagami ? 1 : 3.5) + ctx.R(a, b).att / 60; },
    run: function (ctx, a, b) {
      var pf = ctx.pair(a, b); pf.amagami = (pf.amagami || 0) + 1; pf.lastAma = ctx.stepIndex; ctx.om.amagami++;
      var lead = ctx.most([a, b], function (c) { return c.tr.lead + c.tr.impulse * 0.5; }), oth = lead === a ? b : a;
      ctx.mod2(a, b, { att: 6, aff: 5, trust: 4 }, { att: 6, aff: 5, trust: 4 });
      var tl = HK.voiceTop(lead);
      var T = {
        CP: ['{a}は{b}の首筋に歯を立て、くっきりと痕を残した。「これで誰が見ても分かるね｜これで誰が見ても分かる｜これで誰が見ても分かります」', '{a}は{b}の鎖骨に噛みついて、「私のだ｜＝｜私のです」と短く言った。'],
        NP: ['{a}は{b}の肩に、痛くないようにそっと歯を当てた。「痕、残っちゃうけど、いい？｜痕が残るが、いいか｜痕、残ってしまいますけど、いいですか？」', '{a}は{b}の手首の内側に甘く歯を立てて、そこにキスをした。'],
        A: ['{a}は{b}の首筋の、服で隠れるぎりぎりの位置を選んで噛んだ。「計算済み｜計算済みだ｜計算済みです」', '{a}は「愛咬には所有を示す意味があるんだよ｜愛咬には所有を示す意味がある｜愛咬には所有を示す意味があります」と説明しながら、{b}の肩口を噛んだ。説明は途中で途切れた。'],
        FC: ['{a}は{b}の耳たぶを甘噛みして、「食べちゃいたい｜食ってしまいたい｜食べてしまいたいです」と笑った。', '{a}は{b}の首筋に何か所も小さな歯形をつけて、「星座みたい｜星座みたいだな｜星座みたいです」と満足げに眺めた。'],
        AC: ['{a}は「噛んでも、いい……？｜噛んでも、いいか……｜噛んでも、いいですか……？」と三回確認してから、{b}の肩にそっと歯を当てた。', '{a}は{b}に噛まれた跡を鏡で見て、真っ赤になりながら嬉しそうに指でなぞった。']
      };
      var t = ctx.t(ctx.pick(T[tl] || T.NP), lead, oth);
      var A = alphaOf(a, b), O = omegaOf(a, b);
      /* うなじを噛む＝番。αとΩで、信頼が十分で、Ωが番を望んだとき */
      var dA = dest(ctx), needA = 45 - (dA - 0.5) * 30;
      if (ao(a, b) && BD.canBite(ctx, A, O) && pf.amagami >= 2 && ctx.stepIndex - (pf.since || 0) >= 4 && ctx.R(A, O).trust > needA && ctx.R(O, A).trust > needA && ctx.rng() < 0.3 + (pf.amagami - 2) * 0.2 + (dA - 0.5) * 0.3) {
        BD.bite(ctx, A, O, 'vow');
        ctx.mod2(A, O, { trust: 15, aff: 10 }, { trust: 15, aff: 10 });
        t += ctx.t(ctx.pick(['――{b}は髪をかき上げて、うなじを見せた。「ここも｜＝｜ここもです」{a}は息を呑み、それからゆっくりと、深く噛んだ。二人は番になった。', '――「次は、うなじにして｜次は、うなじにしろ｜次は、うなじにしてください」{b}の囁きに、{a}の手が震えた。噛み跡が残った瞬間、二人は番になった。']), A, O);
        return { text: t, why: '両想いの愛咬から、番へ（信頼 ' + Math.round(ctx.R(A, O).trust) + '／' + Math.round(ctx.R(O, A).trust) + '）' + destWhy(ctx), mag: 45 };
      }
      if (ao(a, b) && !BD.canBite(ctx, A, O) && ctx.om.everBonded[O.i] && BD.mateOf(ctx, O) !== A) t += ctx.t('{b}のうなじには、もう別の誰かの古い噛み跡がある。{a}はそこにだけは、決して歯を立てなかった。', A, O);
      return { text: t, why: '両想いの愛咬（' + lead.name + 'の' + tl + '優位な気質）', mag: 15 };
    }
  });

  /* 破局：ぎすぎすが積もった恋人たち */
  EV.push({
    id: 'om_breakup', cat: 'conflict', scope: 'pair', pri: true,
    when: function (ctx, a, b) { var pf = ctx.pair(a, b), r = ctx.R(a, b), q = ctx.R(b, a); return pf.couple && !pf.preset && (r.ten > 50 || r.aff < 5 || pf.switchStrain) && (q.ten > 40 || q.aff < 15 || pf.switchStrain) && ctx.stepIndex - (pf.since || 0) >= 3; },
    w: function (ctx, a, b) { return (0.8 + ctx.R(a, b).ten / 50) * HK.Dark.f(ctx, 'breakup'); },
    run: function (ctx, a, b) {
      var pf = ctx.pair(a, b), om = ctx.om;
      var reason = pf.switchStrain ? 'switch' : (ctx.env.society > 55 && (sx(a) === sx(b) || sx(a) === 'o' || sx(b) === 'o') && ctx.rng() < 0.5 ? 'bias' : 'drift');
      pf.couple = false; pf.broke = reason; pf.brokeAt = ctx.stepIndex;
      ctx.mod2(a, b, { aff: -10, ten: 10 }, { aff: -10, ten: 10 });
      ctx.stress(a, 20); ctx.stress(b, 20);
      var t = reason === 'switch' ? '{a}と{b}は、スイッチのあと一度も前と同じように笑えなかった。「ごめん、もう無理｜すまない、もう無理だ｜すみません、もう無理です」――別れ話は、驚くほど静かに終わった。'
        : reason === 'bias' ? OM.wpick(ctx, ['職場で二人の関係が噂になった。{a}は「しばらく距離を置こう｜＝｜しばらく距離を置きましょう」と言い、{b}は頷いた。それが別れの言葉になった。', '{b}の家族は、二人の関係を最後まで認めなかった。{a}は「私は{b}を追い詰めたくない｜＝｜私は{b}さんを追い詰めたくないんです」と言って、身を引いた。'], [a, b])
        : ctx.pick(['{a}と{b}は、どちらからともなく連絡を減らしていった。最後の喧嘩の原因は、もう思い出せない。', '「好きだけど、一緒にいると苦しい｜好きだが、一緒にいると苦しい｜好きですけど、一緒にいると苦しいです」{b}の言葉に、{a}は何も言い返せなかった。', '{a}は{b}の部屋の合鍵を、郵便受けに入れて帰った。']);
      if (BD.bonded(ctx, a, b) && ao(a, b)) {
        var A = alphaOf(a, b), O = omegaOf(a, b);
        BD.abandon(ctx, A, O, reason);
        t += ctx.t('番の契りは解けない。{b}のうなじには{a}の噛み跡が残り、これから先、{b}がほかの誰かと番うことはない。', A, O);
      }
      return { text: ctx.t(t, a, b), why: reason === 'switch' ? 'スイッチ後の戸惑い' : reason === 'bias' ? '世間の偏見（' + ctx.env.society + '）' : '積もった緊張（' + Math.round(ctx.R(a, b).ten) + '）', mag: 35 };
    }
  });

  /* 一人のΩを取り合う */
  EV.push({
    id: 'om_rival', cat: 'conflict', scope: 'pair',
    when: function (ctx, a, b) { var o = sx(a) === 'a' && sx(b) === 'a' && !ctx.pair(a, b).couple && rivalTarget(ctx, a, b); return !!o && (!HK.Obsess || HK.Obsess.jealOk(ctx, a, o)); },
    w: function (ctx, a, b) { return 1 + a.tr.aggr + a.tr.jealous * 0.6; },
    run: function (ctx, a, b) {
      var o = rivalTarget(ctx, a, b), k = key(a, b);
      ctx.om.rival[k] = o.i;
      if (HK.Obsess) HK.Obsess.feed(ctx, a, o, 8);
      ctx.mod2(a, b, { ten: 12, aff: -6 }, { ten: 12, aff: -6 });
      var won = partnerOf(ctx, o);
      var t = won ? ctx.t(won === a ? '{b}は、{c}の隣に立つ{a}を睨みつけた。αの威圧がぶつかり、店のグラスが鳴った。' : '{a}は{c}の恋人である{b}に、真正面から言った。「譲る気はないよ｜譲る気はない｜譲る気はありません」', a, b, o)
        : ctx.t(ctx.pick(['{a}と{b}は、{c}を挟んで笑顔で牽制し合った。目は笑っていなかった。', '{c}をめぐって、{a}と{b}のαの匂いがぶつかった。周りの人が数歩下がった。', '{a}は{b}に「{c}に近づかないで｜{c}に近づくな｜{c}さんに近づかないでください」と言った。{b}は「それを決めるのは{c}だよ｜それを決めるのは{c}だ｜それを決めるのは{c}さんです」と返した。']), a, b, o);
      return { text: t, why: '二人のαが同じΩ（' + o.name + '）に惹かれている', with: [o], mag: 15 };
    }
  });
  function rivalTarget(ctx, a, b) {
    var best = null;
    ctx.present().forEach(function (o) {
      if (o === a || o === b || sx(o) !== 'o') return;
      if (ctx.R(a, o).att > 40 && ctx.R(b, o).att > 40) best = o;
    });
    return best;
  }

  /* 運命の番が現れて、今の恋人と別れる */
  EV.push({
    id: 'om_fatedsplit', cat: 'romance', scope: 'pair', pri: true,
    when: function (ctx, a, b) { return ctx.pair(a, b).couple && ctx.pair(a, b).fatedPending; },
    w: function () { return 3; },
    run: function (ctx, a, b) {
      var pf = ctx.pair(a, b);
      var x = ctx.present().filter(function (o) { return o !== a && o !== b && (fated(ctx, a, o) || fated(ctx, b, o)) && ctx.om.met[key(fated(ctx, a, o) ? a : b, o)]; })[0];
      if (!x) { pf.fatedPending = false; return null; }
      var who = x && fated(ctx, a, x) ? a : b, left = who === a ? b : a;
      var wasBond = !!ctx.om.bonded[key(a, b)];
      var hold = ctx.R(who, left).aff + ctx.R(who, left).trust - (x ? ctx.R(who, x).att : 0) + (wasBond ? 30 : 0) + (wasBond && sx(who) === 'o' ? 200 : 0);
      /* 運命の抗えなさ：高いほど恋人を捨てて運命へ走り、低いほど抗って今の恋人を選ぶ */
      var d = dest(ctx), dw = '／運命の抗えなさ ' + Math.round(d * 100);
      var keep = HK.clamp((hold - 60) / 120 + (who.tr.cp + who.tr.np - 0.9) * 0.4 + (0.5 - d) * 0.7, 0.03, 0.95);
      if (ctx.rng() < keep) {
        pf.fatedPending = false; pf.resisted = true; pf.resistedAt = ctx.stepIndex;
        ctx.mod2(who, left, { trust: 12, aff: 8 }, { trust: 15, aff: 10 });
        return { text: ctx.t(d < 0.3 ? ctx.pick(['{a}は{b}に、運命の番に出会ったことを打ち明けた。「運命だって言われても、私が選んできたのは{b}だよ｜運命だと言われても、私が選んできたのは{b}だ｜運命だと言われても、私が選んできたのは{b}さんです」――{b}は泣きながら笑った。', '{a}は運命の番の匂いを知った。それでも帰る場所は変わらなかった。「本能に決めさせる気はないよ｜本能に決めさせる気はない｜本能に決めさせる気はありません」{a}は{b}の手を取った。']) : '{a}は{b}に、運命の番に出会ったことを打ち明けた。「それでも、選ぶのは{b}だよ｜それでも、選ぶのは{b}だ｜それでも、選ぶのは{b}さんです」――{b}は泣きながら笑った。', who, left), why: who.name + 'の積み上げた想い（好意＋信頼）が本能に勝った' + dw, mag: 35 };
      }
      pf.couple = false; pf.fatedPending = false;
      ctx.om.fatedSplit[key(a, b)] = true;
      pf.fatedWho = who.i;
      if (wasBond && sx(who) === 'a') BD.abandon(ctx, who, left, 'fated');
      ctx.mod2(who, left, { att: -15, ten: 8 }, { aff: -10, ten: 20, att: -5 });
      ctx.stress(left, 30);
      if (wasBond) return { text: ctx.t('{a}と{b}は番だった。それでも、{a}の本能は運命の番の方を向いてしまった。{a}は{b}を置いて去った。――Ωの番は一生に一人。{b}のうなじの噛み跡は、その日から疼き続けている。', who, left), why: '運命の番（' + x.name + '）が、番の絆さえ上書きした' + dw, with: [x], mag: 45 };
      return { text: ctx.t(d > 0.7 ? ctx.pick(['{a}は{b}に別れを告げるつもりはなかった。それでも足は、運命の番の匂いのする方へ勝手に向いた。「……ごめん。体が、もう｜……すまない。体が、もう｜……すみません。体が、もう」{b}は何も言えなかった。', '{b}は{a}の目を見て分かった。そこにいるのはもう、自分を見ている{a}ではなかった。運命の番の匂いが、{a}の理性を連れていってしまった。']) : ctx.pick(['「ごめん。会ってしまったんだ｜すまない。会ってしまった｜すみません。会ってしまったんです」{a}の言葉の意味を、{b}はすぐに理解した。運命の番には、勝てない。', '{b}は{a}の首元から、知らない誰かの匂いがすることに気づいていた。「……行きなよ｜……行け｜……行ってください」――二人は別れた。', '{a}は最後のデートの帰り道、{b}に別れを告げた。{b}は「運命って、ずるいね｜運命とは、ずるいな｜運命って、ずるいですね」とだけ言った。']), who, left), why: '運命の番（' + (x ? x.name : '') + '）が現れた' + dw, with: x ? [x] : null, mag: 40 };
    }
  });

  /* 抗ったあとも、運命の抗えなさが高いと再び揺れる（揺れた末に、結局運命へ走ることもある） */
  EV.push({
    id: 'om_fated_waver', cat: 'romance', scope: 'pair', pri: true,
    when: function (ctx, a, b) {
      var pf = ctx.pair(a, b);
      if (!pf.couple || !pf.resisted || dest(ctx) <= 0.5) return false;
      if (ctx.stepIndex - (pf.waverAt == null ? pf.resistedAt || 0 : pf.waverAt) < 3) return false;
      return ctx.present().some(function (o) { return o !== a && o !== b && (fated(ctx, a, o) || fated(ctx, b, o)) && ctx.om.met[key(fated(ctx, a, o) ? a : b, o)] && !partnerOf(ctx, o); });
    },
    w: function (ctx) { return (dest(ctx) - 0.5) * 3; },
    run: function (ctx, a, b) {
      var pf = ctx.pair(a, b), d = dest(ctx);
      var x = ctx.present().filter(function (o) { return o !== a && o !== b && (fated(ctx, a, o) || fated(ctx, b, o)) && !partnerOf(ctx, o); })[0];
      if (!x) return null;
      var who = fated(ctx, a, x) ? a : b, left = who === a ? b : a;
      pf.waverAt = ctx.stepIndex; pf.waver = (pf.waver || 0) + 1;
      var dw = '／運命の抗えなさ ' + Math.round(d * 100);
      /* 揺れた末に、本能が勝つ */
      if (ctx.rng() < (d - 0.5) * 0.9 + pf.waver * 0.1 - (ctx.R(who, left).aff + ctx.R(who, left).trust) / 600) {
        pf.couple = false; pf.resisted = false; pf.fatedWho = who.i;
        ctx.om.fatedSplit[key(a, b)] = true;
        if (ctx.om.bonded[key(a, b)] && sx(who) === 'a') BD.abandon(ctx, who, left, 'fated');
        ctx.mod2(who, left, { att: -10, ten: 6 }, { aff: -12, ten: 18 });
        ctx.stress(left, 30);
        return { text: ctx.t(ctx.pick(['一度は抗った。それでも{a}の体は、{c}の匂いを忘れてくれなかった。「ごめん。もう、嘘がつけない｜すまない。もう、嘘がつけない｜すみません。もう、嘘がつけません」――{b}は{a}を引き止めなかった。', '{a}は{b}に「選ぶのは{b}だよ｜選ぶのは{b}だ｜選ぶのは{b}さんです」と言った。その言葉を、{a}自身の本能が裏切った。夜中、{a}は{c}の家の前に立っていた。']), who, left, x), why: who.name + 'は一度抗ったが、本能が勝った' + dw, with: [x], mag: 42 };
      }
      ctx.mod2(who, left, { att: -3, ten: 5 }, { ten: 6, trust: -4 });
      ctx.mod(who, x, { att: 6 });
      ctx.stress(who, 12);
      return { cat: 'conflict', text: ctx.t(ctx.pick(['{a}は{c}とすれ違っただけで、その日一日、仕事が手につかなかった。帰ってきた{a}の顔を見て、{b}は何も訊かなかった。', '{a}は夜中に目を覚まし、{c}の匂いを探すように窓を開けた。隣で眠る{b}に気づかれないように、静かに閉めた。', '「まだ、あの人のこと考えてる？｜まだ、あの人のことを考えているのか｜まだ、あの人のことを考えていますか？」{b}の問いに、{a}は「考えてない｜考えていない｜考えていません」と答えた。答えるのに、一秒だけ時間がかかった。']), who, left, x), why: who.name + 'の本能が、抗った決意を揺らしている' + dw, with: [x], mag: 16 };
    }
  });

  /* 職業ごとの出来事 */
  function jobRun(sc) {
    return function (ctx, a, b) {
      if (a.om.former) {
        var F = OM.STATUS.FORMER, pool = sc === 'p' ? F.p : F.s.concat(sx(a) === 'o' ? F.sO : sx(a) === 'a' ? F.sA : []);
        if (sc === 's') ctx.stress(a, sx(a) === 'o' ? 5 : 2);
        else ctx.mod2(a, b, { trust: 3 }, { trust: 4, aff: 3 });
        return { cat: sc === 'p' ? 'bond' : 'solo', text: fill(ctx, ctx.pick(pool), a, sc === 'p' ? b : null), why: fill(ctx, '{job}としての日々', a, null) };
      }
      if (OM.jobSpecific && OM.JOB_EVENTS_ID && OM.JOB_EVENTS_ID[a.om.job] && ctx.rng() < 0.85) { var js = OM.jobSpecific(ctx, a, b, sc); if (js) return js; }
      var ban = OM.JOB_BAN && OM.JOB_BAN[a.om.job];
      var list = (OM.JOB_EVENTS[job(a).cat] || []).filter(function (e) { return (!e.sx || e.sx === sx(a)) && e.sc === sc && !(e.cat === 'romance' && !ctx.romanceOk(sc === 'p' ? [a, b] : [a])) && !(ban && e.texts.some(function (t) { return ban.test(t); })); });
      if (!list.length && OM.jobSpecific && OM.JOB_EVENTS_ID && OM.JOB_EVENTS_ID[a.om.job]) return OM.jobSpecific(ctx, a, b, sc);
      if (!list.length) return null;
      var e = ctx.pick(list), bb = sc === 'p' ? b : null;
      addFx(ctx, a, bb, e.fx);
      if (/偏見/.test(e.why)) ctx.stress(a, ctx.env.society / 20);
      return { cat: e.cat, text: fill(ctx, OM.btext ? OM.btext(ctx, e.texts, bb) : ctx.pick(e.texts), a, bb), why: fill(ctx, e.why || '{job}（' + OM.CATS[job(a).cat] + '）の日常', a, bb) };
    };
  }
  EV.push({ id: 'om_job_s', cat: 'solo', scope: 'solo', w: function (ctx, a) { return 0.8 + (a.action.id === 'work' ? 0.8 : 0) + (a.goal.id === 'career' ? 0.5 : 0); }, run: jobRun('s') });
  EV.push({ id: 'om_job_p', cat: 'bond', scope: 'pair', when: function (ctx, a, b) { return met(ctx, a, b); }, w: function (ctx, a) { return 1.2 + (a.action.id === 'work' ? 0.4 : 0); }, run: jobRun('p') });

  /* 恋人どうしの小さなすれ違い・甘い日常 */
  EV.push({
    id: 'om_life', cat: 'romance', scope: 'pair',
    when: function (ctx, a, b) { return ctx.pair(a, b).couple; },
    w: function (ctx, a) { return 1 + a.tr.warmth * 0.6; },
    run: function (ctx, a, b) {
      var r = ctx.R(a, b), bad = r.ten > 35 || a.stress > 60;
      if (bad && ctx.rng() < 0.45) {
        ctx.mod2(a, b, { ten: -12, aff: 4, trust: 4 }, { ten: -12, aff: 4, trust: 4 });
        return { cat: 'help', text: ctx.t(ctx.pick(['{a}は「この前は私が悪かった。ごめん｜この前は私が悪かった。すまない｜この前は私が悪かったです。すみません」と言って、{b}の好きなケーキを買ってきた。{b}はフォークを二本出した。', '喧嘩の翌朝、{a}は黙って{b}の分のコーヒーも淹れた。それで仲直りだった。', '{a}と{b}は、言い合いの途中で同時に吹き出した。何で揉めていたか、もう思い出せなかった。']), a, b), why: '恋人同士の仲直り（好意 ' + Math.round(r.aff) + '）' };
      }
      if (bad) {
        ctx.mod2(a, b, { ten: 6 }, { ten: 8, aff: -3 });
        return { cat: 'conflict', text: ctx.t(ctx.pick(['{a}は疲れて帰ってきて、{b}の話を上の空で聞いた。{b}は途中で話すのをやめた。', '{a}は{b}が他のαと話していたことを、しつこく問い詰めた。', '{a}と{b}は、どちらが連絡を返さなかったかで言い合いになった。']), a, b), why: '緊張（' + Math.round(r.ten) + '）と' + a.name + 'の疲れ' };
      }
      ctx.mod2(a, b, { aff: 4, att: 3 }, { aff: 4, att: 3 });
      var nest = sx(b) === 'o' && sx(a) === 'a';
      return { text: ctx.t(ctx.pick([].concat(['{a}は{b}の寝癖を直してから、仕事に出かけた。', '{a}と{b}は、同じ毛布にくるまって映画を見た。途中で二人とも寝ていた。', '{a}は{b}の好物を、帰りに買って帰った。', '{a}「ただいま」{b}「おかえり」――それだけの会話が、妙に嬉しかった。'], nest ? ['{b}は{a}がいない間、{a}の服を集めて小さな巣を作っていた。{a}は見なかったふりをした。', '{a}は帰宅するなり{b}の首元に顔を埋めて、匂いを確かめた。'] : [])), a, b), why: '恋人同士の日常（好意 ' + Math.round(r.aff) + '）' };
    }
  });

  /* 番になっていない恋人どうしで、番の話 */
  EV.push({
    id: 'om_bondtalk', cat: 'romance', scope: 'pair',
    when: function (ctx, a, b) { return ctx.pair(a, b).couple && ao(a, b) && BD.canBite(ctx, alphaOf(a, b), omegaOf(a, b)) && !a.om.heat && !b.om.heat; },
    w: function () { return 0.7; },
    run: function (ctx, a, b) {
      var A = alphaOf(a, b), O = omegaOf(a, b), rO = ctx.R(O, A), rA = ctx.R(A, O), dB = dest(ctx), needB = 45 - (dB - 0.5) * 30;
      if (BD.canBite(ctx, A, O) && rO.trust > needB && rA.trust > needB && ctx.rng() < 0.5 + (dB - 0.5) * 0.4) {
        BD.bite(ctx, A, O, 'vow');
        ctx.mod2(A, O, { trust: 15, aff: 10 }, { trust: 15, aff: 10 });
        return { text: ctx.t(ctx.pick(['静かな夜だった。{b}は「今なら私、怖くない｜今なら怖くない｜今なら私、怖くありません」と言って、うなじを差し出した。{a}は長いことためらってから、そっと噛んだ。二人は番になった。', '{a}は指輪の箱を開けた。「番になってほしい。順番、逆かもしれないけど｜番になってほしい。順番は、逆かもしれないが｜番になってほしいです。順番、逆かもしれませんけど」――{b}は笑って、うなじの髪を払った。']), A, O), why: '十分な信頼（' + Math.round(rA.trust) + '／' + Math.round(rO.trust) + '）。発情期でなくても番を選んだ' + destWhy(ctx), mag: 40 };
      }
      ctx.mod2(A, O, { att: 2 }, { att: 2 });
      return { text: ctx.t(ctx.pick(['{b}はうなじに触れながら「いつか｜＝｜いつか」と言った。{a}は「いつでも｜＝｜いつでも」と言った。', '{a}は{b}のうなじを見つめて、目を逸らした。まだ、その覚悟はなかった。', '{b}は首を守るチョーカーを、{a}の前でだけ外すようになった。']), A, O), why: '番になるかどうか、まだ迷っている' };
    }
  });

  /* 第二性への偏見と、それへの反応 */
  EV.push({
    id: 'om_bias', cat: 'conflict', scope: 'pair',
    when: function (ctx, a, b) { return sx(b) === 'o' && !b.om.hidden && sx(a) !== 'o' && ctx.env.society > 30; },
    w: function (ctx, a) { return 0.3 + ctx.env.society / 150; },
    run: function (ctx, a, b) {
      if (a.tr.np > 0.6 || a.tr.cp > 0.65) {
        ctx.mod(b, a, { trust: 10, aff: 6 });
        return { cat: 'help', text: ctx.t(OM.wpick(ctx, ['「Ωのくせに」と誰かが言った。{a}はその人の前に立った。「今の、もう一回言ってみろ｜＝｜今の、もう一回言ってみてください」', '{a}は、{b}を「Ωだから」と外そうとした会議で、真っ先に反対した。', '{a}は、{b}にだけ番の有無を訊いた面接官に、同じ質問を自分にもするよう求めた。', '{a}は{b}の名前で予約した店に「α同伴でないと」と断られ、その店の口コミに星一つをつけた。'], [a]), a, b), why: a.name + 'の' + (a.tr.np > 0.6 ? 'NP（守りたい）' : 'CP（筋を通す）') + '／偏見（' + ctx.env.society + '）' };
      }
      ctx.mod(b, a, { ten: 8, trust: -5 });
      ctx.stress(b, 8);
      return { text: ctx.t(ctx.pick(['{a}は悪気なく「Ωなのにすごいね｜Ωなのにすごいな｜Ωなのにすごいですね」と言った。{b}は笑ってみせた。', '{a}は{b}の前で、Ωについての冗談に笑ってしまった。', '{a}は「重い荷物はαに任せて｜重い荷物はαに任せろ｜重い荷物はαに任せてください」と{b}の手から箱を取り上げた。親切のつもりだった。', '{a}は{b}が意見を言うたびに、隣のαの顔を見て確認した。']), a, b), why: '世間の偏見（' + ctx.env.society + '）が' + a.name + 'の口から出た' };
    }
  });

  /* ---------- α優位の社会：αの特権・Ωの壁・威圧・反発・身分違い・β ---------- */
  var STX = OM.STATUS;
  EV.push({
    id: 'om_alpha_rank', cat: 'solo', scope: 'solo',
    when: function (ctx, a) { return sx(a) === 'a'; },
    w: function (ctx) { return 0.25 + ctx.env.society / 180; },
    run: function (ctx, a) {
      var k = a.tr.cp > 0.6 && a.tr.np < 0.55 ? 'proud' : a.tr.np > 0.6 ? 'noble' : 'burden';
      if (k === 'burden') ctx.stress(a, 6);
      return { text: fill(ctx, OM.wpick(ctx, STX.ALPHA[k], [a]), a, null), why: 'α優位の社会（' + ctx.env.society + '）で、' + a.name + 'は' + { proud: '特権を当然と思っている（CP高・NP低）', noble: '特権の使い方を考えている（NP）', burden: 'αであることの期待を背負っている' }[k] };
    }
  });
  EV.push({
    id: 'om_omega_wall', cat: 'solo', scope: 'solo',
    when: function (ctx, a) { return sx(a) === 'o' && !a.om.hidden && ctx.env.society > 15; },
    w: function (ctx) { return 0.3 + ctx.env.society / 120; },
    run: function (ctx, a) {
      var high = STX.HIGH[a.om.job] && !a.om.former;
      ctx.stress(a, 3 + ctx.env.society / 12);
      if (high && ctx.env.society > 55 && ctx.rng() < 0.06 + (ctx.env.society - 55) / 400) {
        a.om.former = true; a.om.formerWhy = 'bias'; a.om.formerTxt = 'Ωだと知られて辞めた';
        ctx.stress(a, 25);
        return { mag: 30, text: fill(ctx, ctx.pick(STX.PUSHED_OUT), a, null), why: 'α優位の社会（' + ctx.env.society + '）。Ωが地位の高い職に居続けるのは難しい' };
      }
      return { text: fill(ctx, OM.wpick(ctx, high ? STX.OMEGA_HIGH.concat(STX.OMEGA) : STX.OMEGA, [a]), a, null), why: 'Ωの壁（社会のα優位 ' + ctx.env.society + '）' };
    }
  });
  EV.push({
    id: 'om_glare', cat: 'conflict', scope: 'pair',
    when: function (ctx, a, b) { return sx(a) === 'a' && sx(b) === 'o' && met(ctx, a, b); },
    w: function (ctx, a, b) { return 0.3 + ctx.env.society / 250 + (ctx.R(a, b).ten > 25 ? 0.4 : 0); },
    run: function (ctx, a, b) {
      var k = a.tr.cp > 0.6 && a.tr.np < 0.5 ? 'use' : a.tr.np > 0.55 || a.tr.a > 0.65 ? 'stop' : 'slip';
      if (k === 'use') { ctx.mod2(a, b, { ten: -3 }, { ten: 10, trust: -8, att: 3 }); ctx.stress(b, 10); }
      else if (k === 'stop') ctx.mod2(a, b, { trust: 2 }, { trust: 8, aff: 5 });
      else { ctx.mod2(a, b, { ten: 3 }, { ten: 4 }); ctx.stress(b, 4); }
      return { cat: k === 'stop' ? 'help' : 'conflict', text: fill(ctx, ctx.pick(STX.GLARE[k]), a, b), why: 'αの威圧（' + { use: '力として使う：CP高・NP低', stop: '自分で抑える：NP・A', slip: '無意識に漏れる' }[k] + '）。Ωの体はαの威圧に逆らえない' };
    }
  });
  EV.push({
    id: 'om_omega_push', cat: 'conflict', scope: 'pair',
    when: function (ctx, a, b) { return sx(a) === 'o' && sx(b) === 'a' && met(ctx, a, b) && a.tr.cp + a.tr.fc > 1.05; },
    w: function () { return 0.45; },
    run: function (ctx, a, b) {
      var won = b.tr.np > 0.5 || b.tr.a > 0.6;
      ctx.mod2(a, b, { ten: 4 }, won ? { trust: 6, att: 5, aff: 3 } : { ten: 8 });
      return { text: fill(ctx, ctx.pick(STX.PUSH), a, b), why: a.name + 'の強さ（CP・FC）が、αへの遠慮を上回った' + (won ? '。' + b.name + 'はそれを好ましく思った' : '') };
    }
  });
  EV.push({
    id: 'om_gap', cat: 'conflict', scope: 'pair',
    when: function (ctx, a, b) { return ctx.pair(a, b).couple && sx(a) === 'a' && sx(b) === 'o' && STX.HIGH[a.om.job] && !a.om.former && !(STX.HIGH[b.om.job] && !b.om.former); },
    w: function (ctx) { return 0.35 + ctx.env.society / 200; },
    run: function (ctx, a, b) {
      ctx.mod2(a, b, { ten: 3 }, { ten: 6, trust: -2 }); ctx.stress(b, 6);
      return { text: fill(ctx, ctx.pick(STX.GAP), a, b), why: '身分違い（地位の高いα×Ω）。α優位の社会 ' + ctx.env.society };
    }
  });
  EV.push({
    id: 'om_beta', cat: 'solo', scope: 'solo',
    when: function (ctx, a) { return sx(a) === 'b' && ctx.present().some(function (o) { return sx(o) !== 'b'; }); },
    w: function () { return 0.18; },
    run: function (ctx, a) { return { text: fill(ctx, OM.wpick(ctx, STX.BETA, [a]), a, null), why: 'βの立ち位置' }; }
  });

  /* ---------- 隠れΩ ---------- */
  function hfill(ctx, t, a, b, h) { return fill(ctx, t.replace(/\{fake\}/g, SX[(h || a).om.fake]), a, b); }
  function outHidden(ctx, c, how) {
    var soc = ctx.env.society, r = ctx.rng(), kind = soc > 65 && r < 0.6 ? 'fired' : soc > 35 && r < 0.75 ? 'demote' : 'accept';
    c.om.hidden = false; c.om.outed = how; c.om.outKind = kind;
    if (kind === 'fired') { c.om.former = true; c.om.formerWhy = 'bias'; c.om.formerTxt = 'Ωだと知られて辞めた'; }
    ctx.stress(c, kind === 'fired' ? 45 : kind === 'demote' ? 25 : 5);
    return hfill(ctx, ctx.pick(STX.HIDE_OUT[kind]), c, null) + hfill(ctx, STX.HIDE_OUT_SELF[c.persona] || STX.HIDE_OUT_SELF.gentle, c, null);
  }
  EV.push({
    id: 'om_hidden', cat: 'solo', scope: 'solo',
    when: function (ctx, a) { return sx(a) === 'o' && a.om.hidden; },
    w: function (ctx, a) { return 0.9 + (a.om.heat > 0 ? 1.5 : 0); },
    run: function (ctx, a) {
      var heat = a.om.heat > 0;
      a.om.exposure += (heat ? 18 + ctx.rng() * 12 : 5 + ctx.rng() * 7) * (0.6 + ctx.env.society / 125);
      ctx.stress(a, heat ? 10 : 4);
      if (a.om.exposure > 40 && ctx.rng() < (a.om.exposure - 32) / 70) {
        return { mag: 35, text: '隠していた第二性が、ついに明るみに出た。' + outHidden(ctx, a, 'exposed'), why: '隠れΩ：無理が積み重なった（露見の危険 ' + Math.round(a.om.exposure) + '）／α優位の社会 ' + ctx.env.society };
      }
      return { text: hfill(ctx, OM.wpick(ctx, heat ? STX.HIDE_HEAT : STX.HIDE_DAY, [a]), a, null), why: '隠れΩ（周りには' + SX[a.om.fake] + 'と偽っている）' + (heat ? '：発情期' : '') };
    }
  });
  EV.push({
    id: 'om_hidden_notice', cat: 'bond', scope: 'pair',
    when: function (ctx, a, b) { return b.om.hidden && !b.om.hideKnown && sx(a) !== 'o' && met(ctx, a, b); },
    w: function (ctx, a, b) { return (sx(a) === 'a' ? 0.6 : 0.25) + (b.om.heat > 0 ? 0.8 : 0); },
    run: function (ctx, a, b) {
      var k = sx(a) === 'b' ? 'help' : a.tr.cp > 0.62 && a.tr.np < 0.45 ? 'lever' : 'keep';
      b.om.hideKnown = true; b.om.knower = a.i;
      if (k === 'lever') { ctx.mod2(a, b, { ten: -2 }, { ten: 15, trust: -15 }); ctx.stress(b, 15); }
      else ctx.mod2(a, b, { trust: 4, aff: 3 }, { trust: 15, aff: 8, att: sx(a) === 'a' ? 5 : 0 });
      return { cat: k === 'lever' ? 'conflict' : 'help', text: hfill(ctx, ctx.pick(STX.HIDE_NOTICE[k]), a, b, b), why: a.name + 'が' + b.name + 'の秘密に気づいた（' + { keep: '黙っていてくれる', lever: '秘密を握った：CP高・NP低', help: '隠すのを手伝う' }[k] + '）' };
    }
  });
  EV.push({
    id: 'om_hidden_come', cat: 'romance', scope: 'pair',
    when: function (ctx, a, b) { return a.om.hidden && met(ctx, a, b) && ctx.R(a, b).trust > 50 && ctx.R(a, b).aff > 40; },
    w: function (ctx, a) { return 0.15 + a.tr.honesty * 0.35 + (a.stress > 60 ? 0.3 : 0); },
    run: function (ctx, a, b) {
      var t = OM.wpick(ctx, STX.HIDE_COME, [a]), pub = /職場で名乗り出た/.test(t);
      ctx.mod2(a, b, { trust: 10 }, { trust: 12, aff: 8 });
      a.stress = Math.max(0, a.stress - 20);
      var txt = hfill(ctx, t, a, b);
      if (pub) txt += outHidden(ctx, a, 'self');
      else { a.om.hideKnown = true; a.om.knower = b.i; }
      return { mag: pub ? 30 : 18, text: txt, why: a.name + 'の本音の出やすさ（' + Math.round(a.tr.honesty * 100) + '）と、' + b.name + 'への信頼' };
    }
  });

  /* ---------- 巣作り（番のいるΩの習性）と、それを見つけた番 ---------- */
  EV.push({
    id: 'om_nest', cat: 'romance', scope: 'solo',
    when: function (ctx, a) { return sx(a) === 'o' && ctx.om.everBonded[a.i] && !!BD.mateOf(ctx, a); },
    w: function (ctx, a) { return 0.55 + (a.om.heat > 0 ? 1.2 : 0) + a.stress / 120; },
    run: function (ctx, a) {
      var m = BD.mateOf(ctx, a), lost = !BD.bonded(ctx, m, a) || !m.alive || ctx.om.scar[a.i];
      ctx.om.nests = (ctx.om.nests || 0) + 1;
      if (lost) { ctx.stress(a, 8); return { text: fill(ctx, ctx.pick(STX.NEST_LOST), a, m), why: '番に置いていかれたΩの巣作り' }; }
      var pa = STX.NEST_SELF[a.persona] ? a.persona : 'gentle', pm = STX.NEST_FIND[m.persona] ? m.persona : 'gentle';
      var txt = fill(ctx, ctx.pick(STX.NEST_MAKE), a, m) + fill(ctx, ctx.pick(STX.NEST_SELF[pa]), a, m);
      var found = ctx.rng() < 0.75;
      if (found) { txt += '――' + fill(ctx, ctx.pick(STX.NEST_FIND[pm]), a, m); ctx.mod2(a, m, { aff: 6, att: 4, trust: 4 }, { aff: 8, att: 6, trust: 3 }); a.stress = Math.max(0, a.stress - 15); }
      else ctx.mod(a, m, { att: 3 });
      return { cat: 'romance', actors: [a, m], text: txt, why: '番のいるΩの巣作り（' + a.name + '：口調「' + HK.PERSONA[pa].label + '」' + (found ? '／見つけた' + m.name + '：口調「' + HK.PERSONA[pm].label + '」' : '／まだ見つかっていない') + '）', mag: 18 };
    }
  });

  /* ---------- 判定と結末 ---------- */
  HK.LABELS.bonded = { name: '番', cls: 'love', pol: 2 };
  HK.LABELS.fatedmate = { name: '運命の番', cls: 'love', pol: 2 };
  HK.LABELS.fatedsplit = { name: '運命に引き裂かれた', cls: 'enemy', pol: -1 };
  HK.LABELS.hesitant = { name: 'ためらう二人', cls: 'pine', pol: 1 };
  HK.LABELS.ohrivals = { name: '恋敵', cls: 'enemy', pol: -1 };
  HK.LABELS.unmet = { name: 'まだ出会っていない', cls: 'none', pol: 0 };
  HK.LABELS.abandoned = { name: '番のまま別れた', cls: 'obsess', pol: -1 };
  HK.LABELS.buddy = { name: 'バディ', cls: 'partner', pol: 2 };

  function classify(ctx, A, B, pf) {
    var om = ctx.om, k = key(A, B), ab = ctx.R(A, B), ba = ctx.R(B, A);
    if (fated(ctx, A, B) && !om.met[k]) return { id: 'unmet' };
    if (om.fatedSplit[k] && !pf.couple) return { id: 'fatedsplit' };
    if (om.bonded[k] && pf.couple) return { id: fated(ctx, A, B) ? 'fatedmate' : 'bonded' };
    if (om.bonded[k] && !pf.couple) return { id: 'abandoned' };
    if (pf.buddy && !pf.couple && ab.trust > 30 && ba.trust > 30) return { id: 'buddy' };
    if (pf.couple && fated(ctx, A, B) && !(ab.aff < 0 || ba.aff < 0)) return { id: 'fatedmate' };
    if (!pf.couple && om.hesitate[k] && love(ab) && ba.att > 30) return { id: 'hesitant' };
    if (om.rival[k] != null && ab.ten > 30 && ba.ten > 30) return { id: 'ohrivals' };
    return null;
  }
  function pairText(ctx, A, B, cl) {
    switch (cl.id) {
      case 'bonded': return A.name + 'と' + B.name + 'は番になった。うなじの噛み跡が、二人の約束になった。';
      case 'fatedmate': return '出会うべくして出会った運命の番。' + (ctx.om.bonded[key(A, B)] ? '二人は番になった。' : '二人は恋人になった。');
      case 'fatedsplit': return '恋人同士だったが、運命の番が現れて終わった。';
      case 'hesitant': return '惹かれ合っているのに、' + (sx(A) === 'a' ? 'α同士' : 'Ω同士') + 'であることが最後の一歩を止めた。';
      case 'ohrivals': return '同じΩをめぐって、互いを恋敵と認めた。';
      case 'unmet': return '運命の番だが、結末までに出会わなかった。';
      case 'abandoned': return '番になったが、別れた。Ωの番は一生に一人。噛み跡だけが残った。';
      case 'buddy': return '探偵と助手として、背中を預け合うバディになった。';
    }
    return null;
  }
  function charNote(ctx, c) {
    var o = c.om, t = '匂い：' + o.scent + (o.scentAuto ? '（ふたりのエゴグラムの診断から）' : '') + '　第二性：' + SX[o.orig] + (o.switched ? '→' + SX[o.sex] + '（スイッチ）' : '') + (o.sexAuto ? '（おまかせ）' : '') + '　職業：' + jobName(c) + (o.jobAuto ? '（気質から）' : '') + (o.former && o.formerTxt ? '（' + o.formerTxt + '）' : '') + (o.quit ? '→離職' : '');
    if (o.shop) t += '（' + o.shop + '）';
    if (o.hotel) t += '（' + o.hotel + '）';
    if (o.work) t += '（勤め先：' + o.work + '）';
    if (o.bondLost) t += '　番の印が消えた';
    if (o.hidden) t += '　隠れΩ（' + SX[o.fake] + 'と偽ったまま' + (o.hideKnown ? '。秘密を知る人がいる' : '。最後まで隠し通した') + '）';
    else if (o.outed) t += '　隠れΩだった（' + (o.outed === 'self' ? '自分から名乗り出た' : '露見した') + '→' + { fired: '職を失った', demote: '閑職に回された', accept: '受け入れられた' }[o.outKind] + '）';
    if (ctx.om.scar[c.i]) t += '　' + (ctx.om.scar[c.i].kind === 'second' ? '番が別のΩを噛んだ傷' : '番に去られた傷') + 'を負っている';
    var mates = ctx.om.mates[c.i];
    if (mates && mates.length > 1) t += '　番が' + mates.length + '人いる';
    return t;
  }
  function finish(ctx) {
    if (OM.workFixLog) OM.workFixLog(ctx);
    var om = ctx.om, P = ctx.chars;
    if (!om.ending) OM.B.check(ctx, true);
    var couples = [];
    /* 亡くなった恋人（心中など）とは、もう「付き合っている」とは書かない */
    P.forEach(function (a) { P.forEach(function (b) { if (a.i < b.i && a.alive !== false && b.alive !== false && ctx.pair(a, b).couple) couples.push([a, b]); }); });
    P.forEach(function (c) {
      /* 心中など（obsess-omega.js）で亡くなった人は、そのまま */
      if (!c.alive) return;
      var p = couples.filter(function (x) { return x[0] === c || x[1] === c; })[0];
      var o = p ? (p[0] === c ? p[1] : p[0]) : null;
      c.fate = o ? (om.bonded[key(c, o)] ? '番' : '恋人あり') : om.scar[c.i] ? '傷を負った' : '独り身';
      c.fateNote = (o ? o.name + 'と' + (om.bonded[key(c, o)] ? '番になった' : '付き合っている') : om.scar[c.i] ? BD.scarText(ctx, c) : '恋人はいない') + (c.om.quit ? '。スイッチで' + c.om.quit + 'を辞めた' : c.om.switched ? '。途中で' + SX[c.om.sex] + 'にスイッチした' : '');
    });
    var E = om.ending;
    /* 後日談（ネックガード・巣作り・番の暮らし）は、二人とも生きている番だけ（心中などで亡くなった番の「後日」を書かない） */
    var liveBond = Object.keys(om.bonded).filter(function (k) { var ij = k.split('-'); return ctx.chars[+ij[0]].alive !== false && ctx.chars[+ij[1]].alive !== false; });
    /* 後日談：番になったあとのネックガード（omega-guard.js） */
    if (OM.guardLate) liveBond.forEach(function (k) { var ij = k.split('-'); OM.guardLate(ctx, ctx.chars[+ij[0]], ctx.chars[+ij[1]]); });
    /* 後日談：番になったΩの巣作り */
    liveBond.forEach(function (k) {
      var ij = k.split('-'), x = ctx.chars[+ij[0]], y = ctx.chars[+ij[1]];
      if (!ctx.pair(x, y).couple || ctx.rng() > 0.7) return;
      var O = omegaOf(x, y), A = alphaOf(x, y), pa = STX.NEST_SELF[O.persona] ? O.persona : 'gentle', pm = STX.NEST_FIND[A.persona] ? A.persona : 'gentle';
      ctx.say({ kind: 'event', cat: 'romance', actors: [O, A], text: '――後日。' + fill(ctx, ctx.pick(STX.NEST_MAKE), O, A) + fill(ctx, ctx.pick(STX.NEST_SELF[pa]), O, A) + '――' + fill(ctx, ctx.pick(STX.NEST_FIND[pm]), O, A), why: '番のいるΩの巣作り（後日談）' });
    });
    /* 後日談：番になったあとの暮らし（omega-after.js） */
    if (OM.afterLate) liveBond.forEach(function (k) { var ij = k.split('-'); OM.afterLate(ctx, ctx.chars[+ij[0]], ctx.chars[+ij[1]]); });
    ctx.flags.outcome = E ? E.title : '';
    ctx.flags.omega = {
      months: Math.ceil((ctx.stepIndex + 1) / 2), ending: E, couples: couples.map(function (x) { return [x[0].i, x[1].i, !!om.bonded[key(x[0], x[1])]]; }),
      bites: om.bites, heats: om.heats, amagami: om.amagami, switched: om.switched.slice(), quit: om.quit.slice(), dates: om.dates.slice(), gifts: om.gifts.slice(),
      fatedSplit: Object.keys(om.fatedSplit), resisted: Object.keys(ctx.pf).filter(function (k) { return ctx.pf[k].resisted; }), instinctBites: Object.keys(om.instinctBite || {}), destiny: ctx.env.destiny, hesitate: Object.keys(om.hesitate).filter(function (k) { return om.hesitate[k]; }),
      rivals: Object.keys(om.rival).map(function (k) { return { k: k, o: om.rival[k] }; }), scars: Object.keys(om.scar).map(function (i) { return { i: +i, kind: om.scar[i].kind, by: om.scar[i].by }; }),
      cases: om.det.solved,
      sex: P.map(function (c) { return c.om.sex; }), orig: P.map(function (c) { return c.om.orig; }), job: P.map(function (c) { return jobName(c); })
    };
  }

  HK.SCENARIOS.omega = scen;
  /* 並びに無ければ足す（分割読み込みでは目録の並びが中核で先に作られている） */
  if (HK.SCEN_ORDER.indexOf('omega') < 0) HK.SCEN_ORDER.push('omega');
})();
