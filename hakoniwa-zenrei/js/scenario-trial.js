/* 箱庭診断: 裁判デスゲーム（動機→殺人→捜査→裁判→処刑） */
(function () {
  'use strict';
  var HK = window.HK;
  function R(ctx, a, b) { return ctx.R(a, b); }
  function names(list) { return list.map(function (c) { return c.name; }).join('・'); }
  var CIRC = '①②③④⑤⑥⑦⑧⑨⑩';

  var MOTIVES = [
    { id: 'family', label: '外にいる家族の映像', text: '大切な人が、空っぽの部屋で泣いている映像', fit: function (t) { return t.np * 0.6 + t.ac * 0.4; } },
    { id: 'secret', label: '秘密の暴露', text: '「明日の正午、全員の秘密を公開する」という予告', fit: function (t) { return t.ac * 0.5 + t.jealous * 0.5; } },
    { id: 'money', label: '一億円', text: '「生還した者に一億円を与える」という告知', fit: function (t) { return t.cold * 0.6 + t.fc * 0.4; } },
    { id: 'limit', label: 'タイムリミット', text: '「明日までに事件が起きなければ、全員を処刑する」という宣告', fit: function (t) { return t.caution * 0.4 + t.a * 0.3 + 0.3; } },
    { id: 'memory', label: '失われた記憶', text: '「お前たちは以前から知り合いだった」という写真', fit: function (t) { return t.a * 0.5 + t.honesty * 0.3; } }
  ];
  var PLACES = ['屋内プールの更衣室', '露天風呂', '大浴場の脱衣所', 'ワインセラー', '最上階のラウンジ', '宴会場の舞台裏', '厨房の冷蔵室', 'ボイラー室', '非常階段', 'スイートルームのバスルーム', 'ランドリー室', 'ゲームコーナー', 'サウナ', 'ライブラリー'];
  var CLUES = ['血のついたハンカチ', '止まった腕時計', '割れたグラスの破片', '濡れた足跡', '被害者の握りしめていたボタン', '消された監視モニターの記録', '焦げたメモの切れ端', '開いたままの非常扉', 'ルームキーのカードの欠片', '濡れたバスローブ'];

  function murderScore(ctx, c) {
    var F = ctx.flags, m = F.motive;
    var s = ctx.env.motive / 100 * 0.35 + F.pressure * 0.12;
    s += c.tr.aggr * 0.3 + c.tr.cold * 0.25 + c.stress / 100 * 0.4 + c.tr.impulse * 0.1;
    if (m) s += m.fit(c.tr) * 0.25;
    if (c.flags.grief != null) s += 0.35;
    if (c.flags.revenge != null) s += 0.25;
    if (c.goal.id === 'out') s += 0.3;
    if (c.goal.id === 'nokill') s -= 0.5;
    if (c.goal.id === 'protect') s -= 0.2;
    s -= c.tr.np * 0.35;
    /* 生い立ち：人の死と無縁に生きてきた人ほど、殺人に踏み切れない */
    if (c.tol != null) s += (c.tol - 0.35) * 0.45;
    return s;
  }

  HK.SCENARIOS.trial = {
    id: 'trial', name: '裁判デスゲーム', kicker: 'デスゲーム・推理', zenreiOnly: true,
    desc: 'ホテルに閉じ込められ「殺せば生きて帰れる」と告げられる。殺人が起きれば裁判。犯人を当てれば処刑、外せば犯人以外が全滅。',
    note: '※『ダンガンロンパ』や既存のデスゲーム作品のパロディです。',
    unit: '日', perUnit: 4, preRel: 3, lethal: true,
    derived: ['caution', 'aggr', 'cold', 'jealous'],
    exclude: ['take_charge'],
    env: [
      { id: 'days', label: '最大日数', min: 3, max: 10, def: 7, lo: '3日', hi: '10日', unit: '日' },
      { id: 'motive', label: '動機の強さ', min: 0, max: 100, def: 55, lo: '弱い', hi: '抗えない', desc: '強いほど殺人が起きやすい。起きない夜が続くと黒幕がさらに煽る' },
      { id: 'accrule', label: '共犯者', type: 'select', def: 'dr', options: [{ v: 'dr', label: '生還できるのは実行犯だけ' }, { v: 'both', label: '共犯者も一緒に生還' }] },
      { id: 'endrule', label: '最後まで生き残ったら', type: 'select', def: 'out', options: [{ v: 'out', label: '全員で外に出られる' }, { v: 'stay', label: 'ホテルで暮らし続ける' }] }
    ],
    stats: [
      { id: 'brain', label: '推理力', desc: '捜査と裁判で真相に近づく力。犯人になったときは隠蔽にも効く' },
      { id: 'act', label: '演技力', desc: '嘘の上手さ。犯人・共犯者になったときに疑いをかわす。黒幕への反撃を悟られにくくもする' }
    ],
    perFields: HK.DGK ? [HK.DGK.LIFE, HK.DGK.KNOW] : [],
    actions: [
      { id: 'exit', label: '出口を探し回る', fit: function (t) { return t.a * 0.6 + t.fc * 0.3; }, bias: { escape: 2, solo: 1.3 } },
      { id: 'friends', label: '仲間を作る', fit: function (t) { return t.warmth; }, bias: { bond: 1.8, help: 1.3 } },
      { id: 'lock', label: '客室に閉じこもる', fit: function (t) { return t.caution; }, bias: { solo: 2, bond: 0.6 } },
      { id: 'observe', label: '全員を観察する', fit: function (t) { return t.a * 0.6 + t.cold * 0.4; }, bias: { solo: 1.4, conflict: 1.2 } },
      { id: 'unite', label: '皆をまとめる', fit: function (t) { return t.lead; }, bias: { bond: 1.4, conflict: 1.3 } }
    ],
    goals: [
      { id: 'out', label: '何としても外に出たい', fit: function (t) { return t.cold * 0.5 + t.impulse * 0.5; }, bias: { betray: 1.6, conflict: 1.3 } },
      { id: 'protect', label: '誰かを守る', fit: function (t) { return t.np; }, bias: { help: 2 }, needsFocus: true },
      { id: 'truth', label: '黒幕の正体を暴く', fit: function (t) { return t.a * 0.6 + t.cp * 0.4; }, bias: { escape: 1.8 } },
      { id: 'nokill', label: '誰も殺さない', fit: function (t) { return t.np * 0.6 + t.ac * 0.4; }, bias: { bond: 1.4, conflict: 0.6 } },
      { id: 'survive', label: 'とにかく生き延びる', fit: function (t) { return t.caution; }, bias: { solo: 1.6 } }
    ],
    steps: function (env) {
      var s = [];
      for (var d = 1; d <= env.days; d++) s.push(d + '日目・朝食', d + '日目・昼', d + '日目・夜', d + '日目・裁判');
      return s;
    },
    setup: function (ctx) {
      ctx.place = 'ホテル';
      ctx.flags.pressure = 0; ctx.flags.cases = [];
      ctx.chars.forEach(function (c) { c.stats.brain = c.stats.brain || 3; if (HK.DGK) HK.DGK.init(ctx.rng, c); });
      ctx.flags.rebel = { p: 0, alert: 0, stage: 0, hits: 0 };
    },
    phase: function (ctx, s, n) {
      var P = ctx.present(), part = s % 4;
      if (s === 0) ctx.say({ text: names(P) + 'は、窓に鉄板の打ちつけられたホテルの客室で目を覚ました。館内放送が告げた。「ご宿泊の皆様。どなたかを殺し、裁判で見破られなければ、その方だけが生きてお帰りいただけます」' });
      if (part === 0) breakfast(ctx, s);
      if (part === 1) {
        var m = ctx.rng.pick(MOTIVES);
        if (ctx.flags.pressure >= 2) m = MOTIVES[3];
        ctx.flags.motive = m;
        ctx.incident('黒幕が新しい動機を配った。' + m.text + '。');
        var hit = ctx.most(P, function (c) { return m.fit(c.tr) + c.stress / 200; });
        ctx.act2({ actors: [hit], cat: 'solo', fx: function () { ctx.stress(hit, 18); }, text: ctx.t('{a}は、配られた動機から目を離せなくなっていた。', hit), why: '動機「' + m.label + '」が' + hit.name + 'の気質に刺さった' });
        P.forEach(function (c) { c.stress = HK.clamp(c.stress + 6 + ctx.env.motive / 20, 0, 100); });
        rebelTurn(ctx);
      }
      if (part === 3) trial(ctx, s, n);
    },
    after: function (ctx, s) {
      /* 事件が重なるほど消耗する。人の死に慣れていない人ほど大きい（生い立ち） */
      ctx.present().forEach(function (c) { c.stress = HK.clamp(c.stress + 3 + ctx.env.motive / 40 + ctx.flags.cases.length * 1.5 * (HK.DGK ? HK.DGK.drain(c) : 1) + c.tr.ac * 2, 0, 100); });
      if (s % 4 === 2) night(ctx);
    },
    end: function (ctx, s) { return ctx.flags.over || (s % 4 === 3 && ctx.present().length <= 2); },
    finish: function (ctx) {
      var P = ctx.present(), notes = (ctx.flags.endNotes = ctx.flags.endNotes || []), RB = ctx.flags.rebel;
      if (HK.DGK) ctx.chars.forEach(function (c) { notes.push(c.name + '：' + HK.DGK.note(c)); });
      if (RB && RB.stage) notes.push('黒幕への反撃：進捗 ' + Math.round(RB.p) + '％・黒幕の警戒 ' + Math.round(RB.alert) + '％' + (RB.hits ? '・悟られた回数 ' + RB.hits : ''));
      if (ctx.flags.over) return;
      if (ctx.env.endrule === 'out') {
        ctx.say({ text: '最後の扉が開いた。' + names(P) + 'は、何日ぶりかの外の光の中へ出た。' });
        P.forEach(function (c) { c.fate = '生還'; c.fateNote = '最後まで生き残り、全員でホテルを出た'; });
        ctx.flags.outcome = '生き残った' + P.length + '人で脱出';
      } else {
        ctx.say({ text: names(P) + 'は、ホテルで生きていくことを選んだ。' });
        P.forEach(function (c) { c.fate = 'ホテルに残った'; c.fateNote = '殺し合いを拒んで、閉じたホテルで暮らすことを選んだ'; });
        ctx.flags.outcome = '生き残った' + P.length + '人がホテルに残った';
      }
    },
    events: [
      {
        id: 'patrol', cat: 'bond', scope: 'pair',
        w: function (ctx, a, b) { return 0.3 + a.tr.caution * 0.4 + Math.max(0, R(ctx, a, b).trust) / 80; },
        run: function (ctx, a, b) {
          ctx.mod2(a, b, { trust: 8, aff: 3 }, { trust: 8, aff: 3 });
          return { text: ctx.t('{a}と{b}は、二人一組で夜の廊下を見回った。どちらも相手に背中を向けなかった。', a, b), why: '慎重さと信頼' };
        }
      },
      {
        id: 'doubt', cat: 'conflict', scope: 'pair',
        w: function (ctx, a, b) { return a.tr.jealous * 0.7 + a.stress / 120 + R(ctx, a, b).ten / 80; },
        run: function (ctx, a, b) {
          ctx.mod2(a, b, { ten: 10, trust: -8 }, { ten: 6 });
          return { text: ctx.t('{a}は{b}の部屋の前を通るたび、足音を殺した。', a, b), why: a.name + 'の疑い深さ（嫉妬・執着）と焦り' };
        }
      },
      {
        id: 'pact', cat: 'bond', scope: 'pair',
        when: function (ctx, a, b) { return R(ctx, a, b).trust > 25 && !ctx.pair(a, b).pact; },
        w: function (ctx, a) { return 0.4 + a.tr.honesty * 0.5 + a.tr.np * 0.3; },
        run: function (ctx, a, b) {
          ctx.pair(a, b).pact = true;
          ctx.mod2(a, b, { trust: 14, aff: 8, att: 3 }, { trust: 14, aff: 8, att: 3 });
          return { mag: 12, text: ctx.t('「二人で、ここを出よう。誰も殺さずに」{a}は小指を差し出した。{b}は少し笑って、それに絡めた。', a, b), why: '信頼（' + Math.round(R(ctx, a, b).trust) + '）と' + a.name + 'の本音の出やすさ' };
        }
      },
      {
        id: 'brood', cat: 'solo', scope: 'solo',
        when: function (ctx) { return !!ctx.flags.motive; },
        w: function (ctx, a) { return ctx.flags.motive.fit(a.tr) * 0.8 + a.stress / 150; },
        run: function (ctx, a) {
          ctx.stress(a, 10);
          return { text: ctx.t('{a}はレストランのモニターの前に、一人で長いこと座っていた。', a), why: '動機「' + ctx.flags.motive.label + '」' };
        }
      },
      {
        id: 'gather', cat: 'bond', scope: 'solo',
        when: function (ctx) { return ctx.present().length >= 3; },
        w: function (ctx, a) { return a.tr.np * 0.5 + a.tr.fc * 0.4 + (a.goal.id === 'nokill' ? 0.5 : 0) - 0.2; },
        run: function (ctx, a) {
          ctx.others(a).forEach(function (o) { ctx.mod(o, a, { aff: 4, trust: 3 }); ctx.stress(o, -6); });
          return { text: ctx.t('{a}が厨房でカレーを作って、全員をレストランに呼んだ。黒幕のモニターだけが、それを黙って映していた。', a), why: a.name + 'のNP・FC' };
        }
      },
      {
        id: 'mastermind', cat: 'escape', scope: 'solo',
        w: function (ctx, a) { return a.tr.a * 0.5 * (a.goal.id === 'truth' ? 2.2 : 0.6); },
        run: function (ctx, a) {
          ctx.flags.truth = (ctx.flags.truth || 0) + 10 + ctx.stat(a, 'brain') * 3;
          return { text: ctx.t('{a}は立ち入り禁止の扉の配線を辿っていた。黒幕の居場所まで、あと少しのような気がした。', a), why: a.name + 'のA・推理力 ' + ctx.stat(a, 'brain') };
        }
      }
    ]
  };
  HK.SCEN_ORDER.push('trial');

  /* ---------- 朝食 ---------- */
  var MENU = ['ビュッフェの焼きたてクロワッサンとスクランブルエッグ', '和朝食の焼き鮭と味噌汁', 'ルームサービスのパンケーキ', 'エッグベネディクト', '厨房で見つけた食材のフレンチトースト', 'お粥と漬物', 'ホットサンドとオレンジジュース', '残り物のカレー'];
  function breakfast(ctx, s) {
    var P = ctx.present(), rng = ctx.rng;
    if (P.length < 2) return;
    var day = Math.floor(s / 4) + 1;
    var dead = ctx.chars.filter(function (c) { return !c.alive; });
    /* 料理当番 */
    var cook = ctx.most(P, function (c) { return c.tr.np * 0.6 + c.tr.fc * 0.3 + rng() * 0.5; });
    var dish = rng.pick(MENU);
    var wary = ctx.most(ctx.others(cook), function (c) { return c.tr.caution * 0.7 + c.tr.jealous * 0.3 - Math.max(0, R(ctx, c, cook).trust) / 80 + (dead.length ? 0.2 : 0); });
    var waryOn = wary && wary.tr.caution > 0.55 && (dead.length || ctx.flags.motive) && rng() < 0.6;
    ctx.act2({ actors: waryOn ? [cook, wary] : [cook], cat: waryOn ? 'conflict' : 'bond',
      fx: function () { P.forEach(function (c) { if (c !== cook) ctx.mod(c, cook, { aff: 3, trust: 2 }); ctx.stress(c, -4); }); if (waryOn) ctx.mod2(wary, cook, { ten: 4 }, { ten: 6, trust: -4 }); },
      text: day === 1 ? ctx.t(rng.pick(['一日目の朝。レストランには誰もいなかったが、厨房には食材が揃っていた。{a}が腕まくりをして「' + dish + '」を作った。', '{a}がレストランのビュッフェ台に「' + dish + '」を並べた。「とりあえず、食べよう。話はそれから」']), cook)
        : ctx.t('{a}が「' + dish + '」を作った。', cook) + (waryOn ? ctx.t(rng.pick(['{b}は皿に手をつけず、{a}が一口食べるのをじっと待っていた。', '{b}「…毒、入ってないよね」{a}「入れるわけないでしょ」', '{b}は自分の分だけ、パンの袋を開けて食べた。']), cook, wary) : ''),
      why: cook.name + 'のNP・FC' + (waryOn ? '／' + wary.name + 'の慎重さ（毒を警戒）' : '') });
    /* 空いた席 */
    var recent = dead.filter(function (d) { return d.diedAt != null && ctx.stepIndex - d.diedAt <= 4; });
    if (recent.length) {
      var d = recent[0];
      var mourn = ctx.most(P, function (c) { return Math.max(0, R(ctx, c, d).aff) / 40 + c.tr.np * 0.3; });
      ctx.act2({ actors: [mourn], cat: 'solo', fx: function () { ctx.stress(mourn, 6); }, text: ctx.t(rng.pick(['テーブルには、誰も座らない椅子が一つあった。{a}は、' + d.name + 'がいつも座っていたその席に、黙ってコーヒーを置いた。', '{a}は' + d.name + 'の好物だった料理を一つ多く作りかけて、手を止めた。', '昨日まで' + d.name + 'がいた席を、誰も見ないようにしていた。{a}だけが、ずっと見ていた。']), mourn), why: mourn.name + 'の' + d.name + 'への想い' });
    }
    /* 席順と会話 */
    if (P.length >= 3 && rng() < 0.75) {
      var a = rng.pick(P), b = ctx.most(ctx.others(a), function (o) { return R(ctx, a, o).aff / 40 + R(ctx, a, o).att / 50 + rng() * 0.6; });
      var warm = R(ctx, a, b).aff > 10;
      ctx.act2({ actors: [a, b], cat: warm ? 'bond' : 'conflict', fx: function () { ctx.mod2(a, b, warm ? { aff: 3, trust: 3 } : { ten: 3 }, warm ? { aff: 3, trust: 3 } : { ten: 3 }); },
        text: ctx.t(warm ? rng.pick(['{a}は当たり前のように{b}の隣に座った。「昨日、眠れた？」「…少しだけ」', '{a}が{b}のコーヒーに砂糖を二つ入れた。{b}「なんで知ってるの」{a}「見てたから」', '{a}と{b}は、窓の鉄板の隙間から差し込む朝日を、並んで眺めていた。', '{a}「ここのクロワッサン、外のよりおいしくない？」{b}「…今それ言う？」少しだけ笑いが起きた。'])
          : rng.pick(['{a}は{b}と一番遠い席を選んだ。', '{a}と{b}の視線が合い、どちらも先に逸らさなかった。トーストが冷めていった。', '{a}「…昨日の夜、どこにいた？」{b}「朝からそれ？」空気が凍った。']), a, b),
        why: warm ? '好意・惹かれ' : '緊張' });
    }
    /* 朝のアナウンス */
    if (rng() < 0.5) ctx.incident(rng.pick(['館内放送：「おはようございます。本日も、皆様の素敵な殺意をお待ちしております」', '館内放送：「朝食の時間です。なお、本日の天気は――関係ありませんね」', 'モニターに「本日のプール・温泉は通常営業いたします」と表示された。誰も笑わなかった。']));
  }

  /* ---------- 夜：殺人 ---------- */
  function night(ctx) {
    var P = ctx.present(), rng = ctx.rng, F = ctx.flags;
    if (P.length < 3) return;
    var scored = P.map(function (c) { return { c: c, s: murderScore(ctx, c) }; }).sort(function (a, b) { return b.s - a.s; });
    var top = scored[0];
    var p = HK.clamp(0.25 + top.s * 0.55 + F.pressure * 0.25 + (F.motive && F.motive.id === 'limit' ? 0.3 : 0), 0, 0.97);
    F.tonight = null;
    if (rng() > p) { F.pressure++; return; }
    var killer = HK.weighted(rng, scored.slice(0, 3), function (x) { return Math.pow(Math.max(0.05, x.s), 3); }).c;
    var victim = ctx.most(ctx.others(killer), function (v) {
      var r = R(ctx, killer, v);
      var tv = HK.Ties ? HK.Ties.get(ctx, killer, v) : null;
      var tm = tv ? (tv.type === 'enemy' ? 1.2 : tv.type === 'rival' || tv.type === 'ex' ? 0.5 : HK.TIES[tv.type].pol > 0 ? -2 : 0) : 0;
      return r.ten / 60 - Math.max(0, r.aff) / 50 + (killer.flags.revenge === v.i ? 1.5 : 0) + (1 - v.tr.caution) * 0.4 + rng() * 0.6 - (killer.focus === v ? 2 : 0) + tm;
    });
    var acc = null;
    function accTie(o) {
      var t = HK.Ties ? HK.Ties.get(ctx, o, killer) : null;
      if (!t) return 0;
      if (t.type === 'master' && t.b === o.i) return 0.6;
      return { lover: 0.6, best: 0.4, parent: 0.4, sibling: 0.3, crush: t.a === o.i ? 0.5 : 0, fwb: 0.2 }[t.like || t.type] || 0;
    }
    var cand = ctx.most(ctx.others(killer).filter(function (o) { return o !== victim; }), function (o) {
      return accTie(o) + R(ctx, o, killer).trust / 60 + R(ctx, o, killer).aff / 80 + o.tr.ac * 0.4 + R(ctx, o, victim).ten / 60 - o.tr.np * 0.5 - (o.goal.id === 'nokill' ? 1 : 0);
    });
    if (cand) {
      var cs = accTie(cand) + R(ctx, cand, killer).trust / 60 + R(ctx, cand, killer).aff / 80 + cand.tr.ac * 0.4 + R(ctx, cand, victim).ten / 60 - cand.tr.np * 0.5 - (cand.goal.id === 'nokill' ? 1 : 0);
      if (cs > 0.85 && rng() < 0.5) acc = cand;
    }
    F.pressure = 0;
    var place = rng.pick(PLACES);
    var why = [];
    if (killer.flags.grief != null) why.push(ctx.chars[killer.flags.grief].name + 'を失った悲しみ');
    if (killer.flags.revenge === victim.i) why.push('仇討ち');
    if (F.motive) why.push('動機「' + F.motive.label + '」');
    if (killer.goal.id === 'out') why.push('外に出たいという執念');
    if (killer.stress > 60) why.push('追い詰められた心（負担 ' + Math.round(killer.stress) + '）');
    if (!why.length) why.push(killer.name + 'の攻撃性・ドライさ');
    F.tonight = { killer: killer.i, victim: victim.i, acc: acc ? acc.i : null, place: place, motive: why.join('・') };
    ctx.act2({ actors: acc ? [killer, victim, acc] : [killer, victim], cat: 'betray', mag: 30, fx: function () {
      if (acc) { ctx.pair(killer, acc).secret = true; ctx.mod2(killer, acc, { trust: 15 }, { trust: 15 }); }
    }, text: ctx.t('夜時間。{a}は' + place + 'の前で、{b}が来るのを待っていた。' + (acc ? '見張りに立っていたのは{c}だった。' : ''), killer, victim, acc), why: '動機：' + why.join('・') + (acc ? '。' + acc.name + 'は' + killer.name + 'への信頼とAC（' + Math.round(acc.eg.AC) + '）から加担した' : '') });
    strike(ctx);
  }

  /* ---------- 夜の犯行：ためらい・返り討ち・共犯者の裏切り・ダブルキル ---------- */
  function phys(ctx, c) { return HK.DGK ? HK.DGK.phys(c, ctx.rng) : c.tr.aggr * 0.5 + ctx.rng() * 0.4; }
  /* 手にかけたあとの崩れ方（生い立ちで変わる） */
  function trauma(ctx, c) {
    var DG = HK.DGK;
    if (!DG || c.life == null || c.flags.trauma) return;
    c.flags.trauma = true;
    ctx.stress(c, { peace: 26, harsh: 10, killed: 2 }[c.life]);
    ctx.act2({ actors: [c], cat: 'solo', text: ctx.t(ctx.pick(DG.AFTER_KILL[c.life]), c), why: c.name + 'の生い立ち（' + DG.LIFE_LABEL[c.life] + '）。人を殺したあとの消耗' });
  }
  /* 返り討ちの起きやすさ：殺人の約2割。敵対している相手を襲ったときは約5割 */
  function enemyPair(ctx, a, b) { return !!(HK.Ties && (HK.Ties.get(ctx, a, b, 'enemy') || HK.Ties.get(ctx, b, a, 'enemy'))); }
  function strike(ctx) {
    var F = ctx.flags, T = F.tonight, rng = ctx.rng, C = ctx.chars, DG = HK.DGK;
    var K0 = C[T.killer], V0 = C[T.victim], A0 = T.acc != null ? C[T.acc] : null;
    var enemy = enemyPair(ctx, K0, V0), hes = DG ? DG.hesitate(K0) : 0.2, gap = phys(ctx, V0) - phys(ctx, K0);
    /* 返り討ちになるなら、どの形か（ためらった隙に反撃／体格差／共犯者の裏切り）を気質で選ぶ */
    var turn = null;
    if (rng() < (enemy ? 0.5 : 0.2)) {
      turn = HK.weighted(rng, [
        ['hes', 0.25 + hes * 0.8 + K0.tr.np * 0.2],
        ['phys', 0.25 + Math.max(0, gap) * 1.2 + V0.tr.caution * 0.2 + V0.tr.aggr * 0.2],
        ['betray', A0 ? 0.2 + A0.tr.np * 0.4 + A0.tr.honesty * 0.2 - A0.tr.cold * 0.2 + (A0.goal.id === 'nokill' ? 0.2 : 0) : 0]
      ], function (w) { return Math.max(0, w[1]); })[0];
    }
    var enemyWhy = enemy ? '。敵対している相手を襲った（返り討ちに遭いやすい）' : '';
    /* 共犯者の裏切り：見張りのはずが、実行犯を手にかける */
    if (turn === 'betray') {
      ctx.act2({ actors: [A0, K0], cat: 'betray', mag: 34, text: ctx.t(ctx.pick(['{b}が' + V0.name + 'に手を伸ばした瞬間、背後の{a}が動いた。見張りに立っていたはずの{a}の手が、{b}の首にかかった。', '{a}は' + V0.name + 'を逃がし、{b}の前に立ちはだかった。「やっぱり、こんなの間違ってる」――揉み合いの末、倒れたのは{b}だった。']), A0, K0),
        why: A0.name + 'のNP・正直さ。共犯者が土壇場で裏切った' + enemyWhy });
      ctx.mod2(V0, A0, { aff: 12, trust: 10 }, {});
      ctx.kill(K0, A0, T.place + 'で、共犯者だったはずの' + A0.name + 'に殺された');
      T.orig = K0.i; T.target = V0.i; T.killer = A0.i; T.victim = K0.i; T.acc = null; T.twist = 'betray'; T.victims = [K0.i];
      T.motive = '返り討ち（共犯者の裏切り）';
      trauma(ctx, A0);
      return;
    }
    /* ためらいと返り討ち */
    var hesitated = turn === 'hes' || (!turn && rng() < hes * 0.6);
    if (turn === 'hes' || turn === 'phys') {
      ctx.act2({ actors: [V0, K0], cat: 'combat', mag: 34,
        text: ctx.t(hesitated ? ctx.pick(['{b}は振り上げた手を、ほんの一瞬だけ止めた。その一瞬で足りた。{a}は{b}を突き飛ばし、気づいたときには、{b}はもう動かなかった。', '{b}の手が震えていた。{a}はその手首を掴んで捻り上げ、凶器を奪った。――悲鳴を上げたのは、{b}の方だった。'])
          : ctx.pick(['体格が違いすぎた。{a}は襲いかかってきた{b}を力任せに振り払い、{b}は床に頭を打ちつけて動かなくなった。', '{a}は{b}の一撃をかわし、もみ合いになった。凶器は、{b}自身の胸に刺さっていた。']), V0, K0),
        why: (hesitated ? K0.name + 'がためらった（生い立ち・NP）' : '取っ組み合いの力の差') + '。襲われた' + V0.name + 'の返り討ち' + enemyWhy });
      ctx.kill(K0, V0, T.place + 'で、襲った相手の' + V0.name + 'に返り討ちにされた');
      T.orig = K0.i; T.killer = V0.i; T.victim = K0.i; T.acc = null; T.twist = 'counter'; T.hes = hesitated; T.victims = [K0.i];
      T.motive = '返り討ち（' + (hesitated ? '犯人がためらった隙に反撃' : '体格差で犯人が負けた') + '）';
      trauma(ctx, V0);
      return;
    }
    if (hesitated) ctx.act2({ actors: [K0], cat: 'solo', text: ctx.t('{a}は一度、手を止めた。それでも、止まりきれなかった。', K0), why: K0.name + 'のためらい（生い立ち：' + (DG ? DG.LIFE_LABEL[K0.life] : '') + '）' });
    ctx.kill(V0, K0, T.place + 'で殺害された');
    T.victims = [V0.i];
    trauma(ctx, K0);
    /* ダブルキル（低い確率）：目撃者の口封じ／用済みの共犯者の始末。狙われた側の返り討ちもある */
    var others = ctx.present().filter(function (c) { return c !== K0 && c !== A0; });
    var wit = others.length >= 2 ? ctx.most(others, function (c) { return (1 - c.tr.caution) * 0.5 + (/exit|observe/.test(c.action.id) ? 0.3 : 0) + rng() * 0.5; }) : null;
    if (wit && rng() < 0.06 + (/exit|observe/.test(wit.action.id) ? 0.05 : 0)) {
      var silence = K0.tr.cold * 0.5 + K0.tr.aggr * 0.3 + (K0.tol || 0) * 0.4 > 0.55 + rng() * 0.3;
      if (!silence) {
        T.witness = wit.i; ctx.stress(wit, 20);
        ctx.act2({ actors: [wit, K0], cat: 'solo', mag: 20, text: ctx.t('廊下の角から、{a}がその一部始終を見ていた。{b}と目が合った。{b}は動けなかった。{a}は自分の部屋まで走り、朝まで扉の前に家具を積み上げていた。', wit, K0), why: wit.name + 'が犯行を目撃した。' + K0.name + 'は口封じに踏み切れなかった' });
      } else if (rng() < 0.12 + Math.max(0, phys(ctx, wit) - phys(ctx, K0)) * 0.6) {
        ctx.act2({ actors: [wit, K0], cat: 'combat', mag: 40, text: ctx.t('{b}は、見てしまった{a}を追った。行き止まりの非常階段で、{a}は振り向きざまに消火器を振り下ろした。――二人目の死体は、犯人の方だった。', wit, K0), why: '口封じに来た' + K0.name + 'を、目撃者の' + wit.name + 'が返り討ちにした' });
        ctx.kill(K0, wit, '目撃者の口を封じようとして、返り討ちにされた');
        T.prior = { killer: K0.i, victim: V0.i }; T.killer = wit.i; T.victim = K0.i; T.acc = null; T.twist = 'double-counter'; T.victims.push(K0.i);
        T.motive = '返り討ち（口封じに来た犯人が負けた）';
        trauma(ctx, wit);
      } else {
        ctx.act2({ actors: [K0, wit], cat: 'betray', mag: 44, text: ctx.t('物音に気づいて様子を見に来た{b}と、{a}の目が合った。{a}の手は、もう迷わなかった。', K0, wit), why: '目撃者の口封じ（' + K0.name + 'のドライさ・攻撃性・生い立ち）' });
        ctx.kill(wit, K0, '犯行を目撃し、口を封じられた');
        T.victims.push(wit.i); T.twist = 'double';
      }
    } else if (A0 && ctx.env.accrule !== 'both' && rng() < 0.03 + K0.tr.cold * 0.1) {
      if (rng() < 0.15 + Math.max(0, phys(ctx, A0) - phys(ctx, K0)) * 0.6) {
        ctx.act2({ actors: [A0, K0], cat: 'combat', mag: 40, text: ctx.t('後始末を終えたあと、{b}は{a}に向き直った。「悪いな。生きて出られるのは一人なんだ」――{a}は先にそれを読んでいた。倒れたのは{b}だった。', A0, K0), why: '用済みの共犯者を始末しようとした' + K0.name + 'が、' + A0.name + 'に返り討ちにされた' });
        ctx.kill(K0, A0, '共犯者を始末しようとして、返り討ちにされた');
        T.prior = { killer: K0.i, victim: V0.i }; T.killer = A0.i; T.victim = K0.i; T.acc = null; T.twist = 'double-counter'; T.victims.push(K0.i);
        T.motive = '返り討ち（共犯者を始末しようとした犯人が負けた）';
        trauma(ctx, A0);
      } else {
        ctx.act2({ actors: [K0, A0], cat: 'betray', mag: 44, text: ctx.t('{b}が見張りから戻ってきたとき、{a}はもう次の準備を終えていた。「ここから出られるのは、実行犯だけなんだって」', K0, A0), why: '生還できるのは実行犯だけ。' + K0.name + 'は用済みの共犯者を始末した' });
        ctx.kill(A0, K0, '用済みになった共犯者として始末された');
        T.victims.push(A0.i); T.acc = null; T.accGone = A0.i; T.twist = 'double';
      }
    }
  }

  /* ---------- 黒幕への反撃・脱出ルート（警戒度を上げずに、段階的に進める） ---------- */
  var REBEL_STAGE = [
    { at: 0, t: '{a}が、監視カメラの死角になる場所を見つけた。そこで{b}に耳打ちした。「……ここから、出よう。殺し合いじゃない方法で」' },
    { at: 25, t: '{a}たちは、朝食の席で何気ない会話を装いながら、紙ナプキンの裏で計画を回した。仲間が一人、また一人と増えていった。' },
    { at: 50, t: '{a}は、館内放送の音声に混じる微かなノイズから、黒幕の居場所が地下にあることを割り出した。' },
    { at: 75, t: '{a}たちは、立ち入り禁止の扉の電子錠の番号を、三日分の監視カメラの点滅から読み解いた。あとは、決行の夜を待つだけだった。' }
  ];
  function rebelWill(c) { return (c.goal.id === 'truth' ? 0.5 : 0) + (c.goal.id === 'nokill' ? 0.3 : 0) + (/exit|unite/.test(c.action.id) ? 0.2 : 0) + c.tr.lead * 0.3 + c.tr.a * 0.2 - c.tr.cold * 0.2; }
  function rebelTurn(ctx) {
    var F = ctx.flags, RB = F.rebel, P = ctx.present(), rng = ctx.rng;
    if (!RB || F.over || P.length < 3) return;
    var avgAff = 0, n = 0;
    P.forEach(function (a) { P.forEach(function (b) { if (a !== b) { avgAff += R(ctx, a, b).aff; n++; } }); });
    avgAff = n ? avgAff / n : 0;
    var avgStress = P.reduce(function (s0, c) { return s0 + c.stress; }, 0) / P.length;
    var crew = P.filter(function (c) { return rebelWill(c) > 0.5; });
    var head = ctx.most(crew, function (c) { return c.tr.lead + rebelWill(c) * 0.3; }), brain = ctx.most(crew, function (c) { return c.tr.a + ctx.stat(c, 'brain') * 0.1; });
    var okUnity = avgAff > 2 && avgStress < 68;
    if (!RB.stage) {
      if (!head || !brain || crew.length < 2 || head.tr.lead < 0.55 || (brain.tr.a < 0.55 && ctx.stat(brain, 'brain') < 4) || !okUnity || rng() > 0.3) return;
      RB.stage = 1; RB.by = head.i;
      var b0 = brain !== head ? brain : ctx.most(ctx.others(head), function (c) { return R(ctx, head, c).trust; });
      ctx.act2({ actors: [head, b0], cat: 'escape', mag: 18, fx: function () { ctx.mod2(head, b0, { trust: 10 }, { trust: 10 }); }, text: ctx.t(REBEL_STAGE[0].t, head, b0), why: '黒幕への反撃が始まった（' + head.name + 'の主導性・' + b0.name + 'のA／全体の仲 ' + Math.round(avgAff) + '・負担 ' + Math.round(avgStress) + '）' });
      return;
    }
    if (!crew.length) crew = [ctx.chars[RB.by]].filter(function (c) { return c && c.alive && !c.out; });
    if (!crew.length) return;
    var unity = HK.clamp((avgAff + 30) / 60, 0.3, 1.4) * (avgStress > 75 ? 0.6 : 1);
    var gain = crew.reduce(function (s0, c) { return s0 + c.tr.lead * 5 + c.tr.a * 5 + ctx.stat(c, 'brain') * 1.6; }, 0) * unity * (1 + rng() * 0.8) + (F.truth || 0) * 0.05;
    var act = crew.reduce(function (s0, c) { return s0 + ctx.stat(c, 'act'); }, 0) / crew.length, caut = crew.reduce(function (s0, c) { return s0 + c.tr.caution; }, 0) / crew.length;
    var heat = gain * 0.85 * (1.3 - act / 5) * (1 - caut * 0.4) + crew.length * 1.2 + rng() * 5;
    var p0 = RB.p;
    RB.p = Math.min(100, RB.p + gain); RB.alert = Math.min(100, RB.alert + heat);
    var lead = ctx.chars[RB.by] && ctx.chars[RB.by].alive && !ctx.chars[RB.by].out ? ctx.chars[RB.by] : head || crew[0];
    var stg = REBEL_STAGE.filter(function (x) { return x.at > 0 && p0 < x.at && RB.p >= x.at; }).pop();
    /* 黒幕に悟られた */
    if (RB.alert >= 70) {
      RB.hits++;
      var lost = 30 + rng.int(20);
      RB.p = Math.max(0, RB.p - lost); RB.alert = 35;
      var harsh = RB.hits >= 2 && rng() < 0.25 && lead;
      ctx.incident('館内放送：「おやおや。何やら、楽しそうな相談をしている方々がいますねえ」');
      ctx.act2({ actors: lead ? [lead] : crew, cat: 'conflict', mag: 26, fx: function () { crew.forEach(function (c) { ctx.stress(c, 14); }); },
        text: harsh ? ctx.t('翌朝、{a}の部屋の扉に「校則違反」の札が貼られていた。黒幕は、見せしめを選んだ。', lead) : ctx.t(ctx.pick(['{a}たちが隠していた見取り図は、朝になると一枚残らず消えていた。監視カメラが一台、増えていた。', '{a}たちの集まる場所に、黒幕から「特別な動機」が届いた。仲間同士の視線が、一瞬だけ揺れた。']), lead),
        why: '黒幕の警戒度が上がりすぎた（演技力 平均' + act.toFixed(1) + '・慎重さで抑えきれなかった）。進捗 -' + lost });
      if (harsh) ctx.kill(lead, null, '黒幕への反撃を企てた見せしめとして処刑された');
      return;
    }
    if (stg) ctx.act2({ actors: crew.slice(0, 3), cat: 'escape', mag: 14, fx: function () { crew.forEach(function (a) { crew.forEach(function (b) { if (a !== b) ctx.mod(a, b, { trust: 4 }); }); }); },
      text: ctx.t(stg.t, lead) + '（反撃の進捗 ' + Math.round(RB.p) + '％・黒幕の警戒 ' + Math.round(RB.alert) + '％）', why: '仲間 ' + crew.length + '人の主導性・A・推理力 × 結束（仲 ' + Math.round(avgAff) + '）' });
    if (RB.p >= 100) rebelFinal(ctx, crew, lead);
  }
  function rebelFinal(ctx, crew, lead) {
    var F = ctx.flags, RB = F.rebel, rng = ctx.rng, P = ctx.present();
    var brainAvg = crew.reduce(function (s0, c) { return s0 + ctx.stat(c, 'brain'); }, 0) / crew.length;
    var ch = HK.clamp(0.35 + brainAvg * 0.05 + lead.tr.lead * 0.15 + crew.length * 0.04 - RB.alert / 250, 0.15, 0.85);
    ctx.incident('決行の夜。');
    if (rng() < ch) {
      ctx.act2({ actors: crew, cat: 'escape', mag: 60, text: ctx.t('{a}が電子錠に番号を打ち込んだ。地下の管理室の扉が開いた。モニターの前に座っていた黒幕は、振り向きもせずに言った。「……ずいぶん、退屈させてくれませんでしたね」――' + crew.map(function (c) { return c.name; }).join('・') + 'は、黒幕からゲームの鍵を奪い取った。', lead),
        why: '黒幕への下克上（成功率 ' + Math.round(ch * 100) + '％：推理力・主導性・人数・警戒度）' });
      ctx.say({ text: 'ホテルの鉄板が、一枚ずつ外れていった。' + names(P) + 'は、自分たちの手で扉を開けた。' });
      P.forEach(function (c) { c.out = true; c.fate = '黒幕を倒して脱出'; c.fateNote = '仲間と黒幕に反撃し、ゲームを終わらせた'; });
      F.over = true; F.outcome = '黒幕に下克上し、' + P.length + '人で脱出';
      return;
    }
    ctx.act2({ actors: [lead], cat: 'conflict', mag: 40, text: ctx.t('管理室の扉の向こうは、空っぽだった。背後でシャッターが下りた。「残念でした」――罠だった。{a}だけが、その場に残された。', lead), why: '黒幕への下克上に失敗（成功率 ' + Math.round(ch * 100) + '％）' });
    ctx.kill(lead, null, '黒幕への反撃に失敗し、処刑された');
    RB.p = 30; RB.alert = 60; RB.by = (ctx.most(crew.filter(function (c) { return c !== lead && c.alive; }), function (c) { return c.tr.lead; }) || lead).i;
  }

  /* ---------- 捜査と裁判 ---------- */
  function trial(ctx, s, n) {
    var F = ctx.flags, T = F.tonight, rng = ctx.rng, C = ctx.chars, DG = HK.DGK;
    if (!T) {
      ctx.incident('朝のアナウンス。昨夜は、誰も死ななかった。');
      if (F.pressure >= 1) ctx.say({ text: 'モニターの中の声が苛立っていた。「退屈です。次の動機は、もっと強くします」' });
      return;
    }
    F.tonight = null;
    var K = C[T.killer], V = C[T.victim], A = T.acc != null ? C[T.acc] : null;
    var bodies = (T.victims || [T.victim]).map(function (i) { return C[i]; });
    var P = ctx.present();
    if (!P.length || !K.alive) return;
    var finder = rng.pick(P);
    ctx.incident('死体発見アナウンス。' + bodies.map(function (b) { return b.name; }).join('と') + 'が' + T.place + (bodies.length > 1 ? 'の近くで' : 'で') + '見つかった。第一発見者は' + finder.name + '。' + (bodies.length > 1 ? '一晩で、二人が死んだ。' : ''));
    bodies.forEach(function (B) {
      P.forEach(function (o) {
        var r = R(ctx, o, B);
        if (o !== K && r.aff > 35) {
          ctx.act2({ actors: [o, B], cat: 'solo', fx: function () { ctx.stress(o, 20); o.flags.grief = B.i; }, text: ctx.t('{a}は{b}の名前を呼んで、その場に崩れ落ちた。', o, B), why: o.name + 'の' + B.name + 'への好意（' + Math.round(r.aff) + '）' });
        }
      });
    });
    /* 生い立ちで変わる、死体を見たときの反応 */
    if (DG) {
      P.forEach(function (o) { if (o.life) ctx.stress(o, 8 * DG.drain(o) * bodies.length); });
      var weak = ctx.most(P.filter(function (o) { return o.life === 'peace' && o !== K; }), function (o) { return (1 - o.tol) + o.tr.ac * 0.3; });
      if (weak && rng() < 0.5) ctx.act2({ actors: [weak], cat: 'solo', fx: function () { ctx.stress(weak, 8); }, text: ctx.t(ctx.pick(DG.SHOCK.peace), weak), why: weak.name + 'の生い立ち（平和な日常）。死体を見たことがなかった' });
      var calm = P.filter(function (o) { return o.life === 'harsh' || o.life === 'killed'; })[0];
      if (calm && rng() < 0.55) ctx.act2({ actors: [calm], cat: calm.life === 'killed' ? 'conflict' : 'solo', fx: function () { if (calm.life === 'killed') ctx.others(calm).forEach(function (o) { ctx.mod(o, calm, { ten: 5, trust: -3 }); }); },
        text: ctx.t(ctx.pick(DG.SHOCK[calm.life]), calm), why: calm.name + 'の生い立ち（' + DG.LIFE_LABEL[calm.life] + '）' + (calm.life === 'killed' ? '。落ち着きすぎていて、疑いの目が向いた' : '') });
    }
    if (finder === K) ctx.act2({ actors: [K], cat: 'betray', odd: true, text: ctx.t('悲鳴を上げたのは、{a}だった。', K), why: '第一発見者を装った' });

    /* 隠蔽力と推理力 */
    var helpers = P.filter(function (c) { return c !== K && c !== A; });
    var det = ctx.most(helpers, function (c) { return ctx.stat(c, 'brain') * 0.2 + c.tr.a * 0.6 + (c.goal.id === 'truth' ? 0.3 : 0); });
    var conceal = ctx.stat(K, 'act') * 7 + ctx.stat(K, 'brain') * 4 + K.tr.a * 22 + K.tr.caution * 14 - K.tr.impulse * 12 + rng() * 30 * (0.6 + ctx.chaos);
    if (A) conceal += 8 + A.tr.a * 8 + ctx.stat(A, 'act') * 2;
    var detect = 33 + (det ? ctx.stat(det, 'brain') * 7 + det.tr.a * 22 : 0) + helpers.filter(function (c) { return c.tr.a > 0.55; }).length * 4 + (F.truth || 0) * 0.15 + rng() * 30 * (0.6 + ctx.chaos);
    if (bodies.length > 1) detect += 10;
    if (T.twist === 'counter' || T.twist === 'betray') conceal -= 12;

    var clue = rng.pick(CLUES);
    if (det) ctx.act2({ actors: [det], cat: 'escape', text: ctx.t('捜査時間。{a}は現場で「' + clue + '」を見つけ、黙ってポケットにしまった。', det), why: det.name + 'のA（' + Math.round(det.eg.A) + '）・推理力 ' + ctx.stat(det, 'brain') });

    /* 検死：知識のある人は、推理が苦手でも死因と死亡推定時刻で貢献できる。犯人側なら偽装にも使える */
    var ex = DG ? ctx.most(helpers.filter(function (c) { return c.kn > 0; }), function (c) { return c.kn + c.tr.a * 0.3; }) : null;
    var faker = DG ? [K, A].filter(function (c) { return c && c.kn > 0; }).sort(function (x, y) { return y.kn - x.kn; })[0] : null;
    var faked = false, exposed = false;
    if (faker) {
      var strong = ex && ex.kn >= faker.kn;
      if (strong && faker.tr.caution > 0.55 && rng() < 0.65) {
        ctx.act2({ actors: [faker, ex], cat: 'solo', text: ctx.t('{a}は検死を買って出ようとして、やめた。{b}が遺体の前にしゃがみ込むのが見えたからだ。下手に嘘をつけば、すぐに見抜かれる。', faker, ex), why: faker.name + 'の慎重さ（' + Math.round(faker.tr.caution * 100) + '）。検死の知識で上回る' + ex.name + 'を警戒して、偽装を諦めた' });
      } else {
        faked = true; conceal += 10 + faker.kn * 8;
        ctx.act2({ actors: faker === K ? [K] : [faker, K], cat: 'betray', mag: 16,
          text: ctx.t(faker === K ? '{a}は自分から検死を買って出た。「死亡推定時刻は夜中の二時ごろ。死因は首を絞められたことによる窒息」――その時間、{a}は娯楽室で皆とトランプをしていた。' : '{a}は手慣れた様子で遺体を調べた。「亡くなったのは明け方。その時間なら、{b}は私と一緒にいた」', faker, K),
          why: faker.name + 'の検死の知識（' + DG.KNOW_LABEL[faker.kn] + '）を使った偽装。死亡推定時刻をずらしてアリバイを作った' });
        if (ex && rng() < 0.3 + (ex.kn - faker.kn) * 0.25 + ex.tr.a * 0.25) {
          exposed = true; detect += 24;
          ctx.act2({ actors: [ex, faker], cat: 'conflict', mag: 24, fx: function () { ctx.others(faker).forEach(function (o) { ctx.mod(o, faker, { trust: -12, ten: 10 }); }); },
            text: ctx.t('{a}が首を振った。「違う。死斑の出方も、顎の硬直も合わない。亡くなったのは、もっと早い時間だ」{b}の顔から、血の気が引いた。', ex, faker),
            why: ex.name + 'の検死の知識（' + DG.KNOW_LABEL[ex.kn] + '）が、' + faker.name + 'の偽装を見破った' });
        }
      }
    }
    if (ex && (!faked || exposed)) {
      detect += ex.kn * 9;
      if (!exposed) ctx.act2({ actors: [ex], cat: 'escape', mag: 10,
        text: ctx.t(ctx.pick(['{a}は遺体の瞼を開け、指先の色と硬直を確かめた。「死後、四時間から五時間。抵抗した痕がある。犯人の腕には、引っかき傷が残っているはず」', '{a}は手袋代わりにハンカチを巻いて、遺体の首筋を調べた。「この痕、正面からじゃない。後ろから、自分より背の高い人に」']), ex) + (ctx.stat(ex, 'brain') <= 2 ? ctx.t('推理は苦手でも、{a}の目は確かだった。', ex) : ''),
        why: ex.name + 'の検死の知識（' + DG.KNOW_LABEL[ex.kn] + '）。死因と死亡推定時刻で、推理の土台ができた' });
    }
    if (T.witness != null && C[T.witness].alive) { detect += 26; ctx.act2({ actors: [C[T.witness], K], cat: 'conflict', mag: 20, text: ctx.t('{a}は震える声で言った。「……見たの。昨日の夜、{b}が」', C[T.witness], K), why: '目撃者の証言' }); }
    if (A) ctx.act2({ actors: [A, K], cat: 'betray', fx: function () { ctx.mod2(A, K, { trust: 6 }, { trust: 8, aff: 5 }); }, text: ctx.t('{a}は「{b}は夜時間、ずっと私と一緒にいた」と証言した。', A, K), why: '共犯者のアリバイ工作（' + A.name + 'の演技力 ' + ctx.stat(A, 'act') + '）' });

    ctx.incident('裁判、開廷。');
    var hot = ctx.most(P, function (c) { return c.tr.impulse * 0.6 + c.tr.cp * 0.4; });
    var hotT = ctx.most(ctx.others(hot), function (o) { return R(ctx, hot, o).ten - R(ctx, hot, o).aff * 0.5 + (o === K ? 10 : 0) + rng() * 20; });
    if (hot && hotT) ctx.act2({ actors: [hot, hotT], cat: 'conflict', fx: function () { ctx.mod2(hot, hotT, { ten: 10 }, { ten: 14, trust: -8 }); },
      text: ctx.t('「犯人は{b}だろ！」口火を切ったのは{a}だった。', hot, hotT), why: hot.name + 'の衝動性・CP' + (hotT !== K ? '。見当違いの告発' : '') });
    var defender = hotT && hotT !== K ? ctx.most(ctx.others(hotT).filter(function (o) { return o !== hot; }), function (o) { return Math.max(0, R(ctx, o, hotT).aff) / 50 + o.tr.np * 0.5; }) : null;
    if (defender && R(ctx, defender, hotT).aff > 15) ctx.act2({ actors: [defender, hotT], cat: 'help', fx: function () { ctx.mod(hotT, defender, { aff: 10, trust: 12 }); }, text: ctx.t('{a}がすぐに反論した。「{b}にはそんなことできない」', defender, hotT), why: defender.name + 'の' + hotT.name + 'への好意' });

    var solved = detect > conceal;
    var twistWhy = { counter: '。襲った側の' + (T.orig != null ? C[T.orig].name : '') + 'が返り討ちに遭った事件', betray: '。共犯者の裏切りで、襲った側が殺された事件', 'double-counter': '。二つの殺人が重なった夜', double: '。一晩で二人を手にかけた事件' }[T.twist] || '';
    if (solved) {
      ctx.act2({ actors: [det, K], cat: 'escape', mag: 20, text: ctx.t('{a}が「' + clue + '」を突きつけた。{b}の反論が、そこで途切れた。', det, K), why: '推理（' + Math.round(detect) + '）が隠蔽（' + Math.round(conceal) + '）を上回った' + twistWhy });
      var conf;
      if (T.twist === 'counter') conf = ctx.t(ctx.pick(['{a}は泣きながら叫んだ。「襲われたんだよ！　殺さなきゃ、殺されてた！」――モニターの声は楽しそうだった。「理由は問いません。殺したのは、あなたです」', '{a}は静かに言った。「' + C[T.orig].name + 'が先に、凶器を持って来た。……それでも、殺したのは私だ」']), K);
      else if (T.twist === 'betray') conf = ctx.t('{a}は顔を上げた。「本当は、' + C[T.target].name + 'を殺すはずだった。手伝うはずだった。でも、できなかった。代わりに、止めた。……殺して、止めた」', K);
      else if (T.twist === 'double-counter') conf = ctx.t('{a}は、最初の事件の犯人が' + C[T.prior.killer].name + 'だったことを話した。「口を封じに来たのは、向こうだった」――殺した者がクロ。ルールは変わらなかった。', K);
      else conf = K.tr.cp > 0.65 ? '「……そうだよ。でも、お前らだって同じ立場ならやった」{a}は最後まで目を逸らさなかった。'
        : K.tr.np > 0.55 ? '{a}は泣きながら、動機の映像のことを話した。守りたい人がいた、と。'
        : K.tr.cold > 0.6 ? '{a}は小さく息を吐いた。「計算が一つ合わなかったな」'
        : '{a}は膝から崩れて、ごめんなさい、を何度も繰り返した。';
      ctx.act2({ actors: [K], cat: 'solo', text: ctx.t(conf, K), why: '動機：' + T.motive });
      if (A) ctx.act2({ actors: [A, K], cat: 'betray', fx: function () { ctx.present().forEach(function (o) { if (o !== A && o !== K) ctx.mod(o, A, { trust: -30, ten: 20 }); }); }, text: ctx.t('{a}が共犯だったことも明らかになった。{b}は最後に{a}の方を見た。', A, K), why: '偽のアリバイが崩れた' });
      if (T.twist === 'counter' || T.twist === 'betray' || T.twist === 'double-counter') {
        var pity = ctx.most(ctx.others(K), function (o) { return o.tr.np + Math.max(0, R(ctx, o, K).aff) / 60; });
        if (pity) ctx.act2({ actors: [pity, K], cat: 'help', fx: function () { ctx.mod(pity, K, { aff: 10 }); ctx.stress(pity, 10); }, text: ctx.t('{a}は投票のボタンの上で、長いこと指を止めていた。', pity, K), why: pity.name + 'のNP。正当防衛のような事件に、票を投じるのをためらった' });
      }
      ctx.say({ text: '投票の結果、' + K.name + 'が犯人に選ばれた。正解だった。' });
      ctx.kill(K, null, '裁判で処刑された（' + V.name + '殺しの犯人として）');
      P.forEach(function (o) {
        if (o === K || !o.alive) return;
        if (R(ctx, o, K).aff > 35) { o.flags.grief = K.i; o.stress = HK.clamp(o.stress + 20, 0, 100); ctx.act2({ actors: [o, K], cat: 'solo', text: ctx.t('処刑のあいだ、{a}は一度も目を閉じなかった。', o, K), why: o.name + 'の' + K.name + 'への好意（' + Math.round(R(ctx, o, K).aff) + '）。悲しみは次の夜の火種になる' }); }
      });
      F.cases.push({ label: ctx.label, victim: V.i, killer: K.i, acc: A ? A.i : null, motive: T.motive, solved: true, det: det ? det.i : null, twist: T.twist || '', victims: T.victims, prior: T.prior || null, faked: faked, exposed: exposed });
    } else {
      var scape = ctx.most(P.filter(function (c) { return c !== K && c !== A; }), function (c) { var t = 0; P.forEach(function (o) { if (o !== c) t += R(ctx, o, c).ten - R(ctx, o, c).aff * 0.3; }); return t + (c === hotT ? 40 : 0); });
      if (!scape) scape = A || K;
      ctx.act2({ actors: [K, scape], cat: 'betray', mag: 30, text: ctx.t('{a}の誘導に、誰も気づかなかった。票は{b}に集まった。', K, scape), why: '隠蔽（' + Math.round(conceal) + '）が推理（' + Math.round(detect) + '）を上回った' + (A ? '。共犯者' + A.name + 'の偽証が決め手' : '') + (faked && !exposed ? '。' + faker.name + 'の偽の検死が効いた' : '') + '。' + K.name + 'の' + (K.tr.a > 0.6 ? '頭の良さ' : '運') + twistWhy });
      ctx.say({ text: '「不正解です」――犯人は' + K.name + 'だった。' + (T.twist === 'counter' ? '襲われて、返り討ちにしただけの' + K.name + 'が、一人だけ生き残った。' : '') });
      var winners = [K];
      if (A && ctx.env.accrule === 'both') winners.push(A);
      P.forEach(function (c) { if (winners.indexOf(c) < 0 && c.alive) ctx.kill(c, null, '裁判で投票を外し、犯人以外として処刑された'); });
      winners.forEach(function (w) { w.out = true; w.fate = '生還'; w.fateNote = (w === K ? V.name + 'を殺し、裁判を欺いて' : K.name + 'の共犯として') + '一人だけホテルを出た'; });
      if (A && ctx.env.accrule !== 'both') ctx.say({ text: '共犯者の' + A.name + 'も、例外ではなかった。' });
      F.cases.push({ label: ctx.label, victim: V.i, killer: K.i, acc: A ? A.i : null, motive: T.motive, solved: false, wrong: scape.i, twist: T.twist || '', victims: T.victims, prior: T.prior || null, faked: faked, exposed: exposed });
      F.over = true;
      F.outcome = K.name + 'の勝ち逃げ';
    }
  }
})();
