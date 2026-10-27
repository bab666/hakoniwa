/* 箱庭シミュレーター: 人狼
   住人どうしで人狼ゲームを遊ぶだけの箱庭。配役は人狼・狩人・占い師・霊媒師・村人からランダム（数は設定で決める）。
   ・ゲームなので、襲う相手・投票先は既存の関係を無視して、推理と立ち回りだけで決まる
   ・推理を頑張るか（A・慎重さ）、勘で動くか（FC・衝動性）、人に合わせるか（AC）、場を仕切るか（CP・主導性）は気質の数値で決まる
   ・人狼は性格で戦法を選ぶ（占い騙り・霊媒騙り・潜伏・仲間切り・庇い合い・噛み方）。村は仕切り役しだいで方針が変わる
   ・一人ひとりが疑いと信頼を持ち、協力したり裏切ったりする。知能は性格とは別に決まり、推理の破綻しやすさに効く
   ・台詞は jinro-data.js
   ・賞品があると、勝ちたい気持ち（FC・衝動性・負けず嫌い）が推理の熱量に乗る
   全年齢・R18版の両方で使う */
(function () {
  'use strict';
  var HK = window.HK;
  function L(s) { return s.split('|'); }
  function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }
  var ROLE = { wolf: '人狼', seer: '占い師', medium: '霊媒師', hunter: '狩人', vill: '村人' };
  var PRIZE = { none: '', yaki: '高級焼肉', money: '賞金一万円', cake: 'ホールケーキ', punish: '負けた陣営は罰ゲーム', wish: '勝者の言うことを一つ聞く' };

  function fill(t, m) { return String(t).replace(/\{(\w+)\}/g, function (x, k) { return m[k] != null ? m[k] : x; }); }

  var scen = {
    id: 'jinro', name: '人狼', kicker: 'ゲーム・推理',
    desc: '住人どうしで人狼ゲーム。配役は人狼・狩人・占い師・霊媒師・村人からランダム。人狼は性格で戦法（騙り・潜伏・仲間切り・庇い合い）を選び、村は仕切り役しだいで方針（ローラー・真贋の見極め・グレー吊り）が変わる。信頼と協力、そして裏切り。知能は性格とは別に決まる。',
    solo: true, minCast: 4, maxCast: 15, unit: '日',
    castHint: '4〜15人。配役の数は環境値で決めます（人狼は全体の半分未満に自動で調整）。ゲームなので、襲う相手や投票先は既存の関係と関係なく、推理と立ち回りで決まります。',
    simulate: function (input) { return run(input); },
    derived: ['caution', 'honesty', 'impulse', 'lead'],
    env: [
      { id: 'wolves', label: '人狼の数', min: 1, max: 4, def: 2, lo: '1人', hi: '4人', unit: '人' },
      { id: 'seer', label: '占い師', type: 'select', def: '1', options: [{ v: '1', label: 'あり' }, { v: '0', label: 'なし' }] },
      { id: 'medium', label: '霊媒師', type: 'select', def: '1', options: [{ v: '1', label: 'あり' }, { v: '0', label: 'なし' }] },
      { id: 'hunter', label: '狩人', type: 'select', def: '1', options: [{ v: '1', label: 'あり' }, { v: '0', label: 'なし' }] },
      { id: 'prize', label: '賞品', type: 'select', def: 'none', options: [{ v: 'none', label: 'なし（ただ遊ぶ）' }, { v: 'yaki', label: '高級焼肉' }, { v: 'money', label: '賞金一万円' }, { v: 'cake', label: 'ホールケーキ' }, { v: 'punish', label: '負けた陣営は罰ゲーム' }, { v: 'wish', label: '勝者の言うことを一つ聞く' }] },
      { id: 'prizeText', label: '賞品（自由に書く）', type: 'text', def: '', placeholder: '例：駅前のラーメン', desc: '書くと、上の賞品の代わりになる' }
    ],
    stats: [{ id: 'int', label: '知能', desc: '推理の正確さ。低いと推理が破綻しやすく、嘘もほころびやすい（性格とは別）' }, { id: 'poker', label: 'ポーカーフェイス', desc: '嘘をついても顔に出にくい' }],
    perFields: [{ id: 'role', label: '配役', auto: 'ランダム', options: [{ id: 'wolf', label: '人狼' }, { id: 'seer', label: '占い師' }, { id: 'medium', label: '霊媒師' }, { id: 'hunter', label: '狩人' }, { id: 'vill', label: '村人' }] }],
    actions: [
      { id: 'logic', label: '理詰めで推理する', fit: function (t) { return t.a * 0.7 + t.caution * 0.3; } },
      { id: 'gut', label: '勘と勢いで動く', fit: function (t) { return t.fc * 0.5 + t.impulse * 0.5; } },
      { id: 'quiet', label: '様子を見る', fit: function (t) { return t.ac * 0.6 + t.caution * 0.3; } }
    ],
    goals: [
      { id: 'win', label: '絶対に勝つ', fit: function (t) { return t.cp * 0.4 + t.jealous * 0.3 + t.fc * 0.2; } },
      { id: 'fun', label: '楽しめればいい', fit: function (t) { return t.fc * 0.5 + t.np * 0.3; } },
      { id: 'prize', label: '賞品が欲しい', fit: function (t) { return t.impulse * 0.5 + t.fc * 0.3 + t.cold * 0.1; } }
    ],
    events: []
  };
  HK.SCENARIOS.jinro = scen;
  /* 並びに無ければ足す（分割読み込みでは目録の並びが中核で先に作られている） */
  if (HK.SCEN_ORDER.indexOf('jinro') < 0) HK.SCEN_ORDER.push('jinro');

  function resolve(S, p, list, pick) {
    if (pick && pick !== 'auto') for (var i = 0; i < list.length; i++) if (list[i].id === pick) return list[i];
    return HK.weighted(S.rng, list, function (o) { return Math.pow(Math.max(0.02, o.fit(p.tr)), 3); });
  }
  var STYLE = { logic: '理詰め', lead: '仕切り役', gut: '勘で動く', follow: '空気に合わせる', contra: '逆張り' };
  var PLAN_LABEL = { fake: '占い騙り', fakeMed: '霊媒騙り', hide: '潜伏', bus: '仲間切り', cover: '庇い合い', ks: '占い師噛み', kstrong: '推理役噛み', kgray: '信頼の厚い人を噛む' };
  var POLICY_LABEL = { roller: '占いローラー', judge: '真贋の見極め', gray: 'グレー吊り' };

  function run(input) {
    var ST = HK.Story, J = HK.JinroText, S = ST.state(input, 'jinro'), rng = S.rng, env = S.env, P = S.P, n = P.length;
    /* 殺さない（attr.js の HK.Attr.noKillPair）の共通部品（same-story.js） */
    var SSK = HK.SameStory && HK.SameStory.nk ? HK.SameStory : null;
    var prize = String(env.prizeText || '').trim().slice(0, 30) || PRIZE[env.prize] || '';
    /* 台詞の {p} に入れる名詞の形。「負けた陣営は罰ゲーム」「勝者の言うことを一つ聞く」のような文の賞品をそのまま差し込むと
       「負けた陣営は罰ゲームは村人陣営のもの」と崩れるので、罰ゲームは「罰ゲーム回避」（勝ち負けの台詞は「勝利」）、
       言うことを聞くは「勝者の命令権」、自由に書いた文（は・が・を を含む・動詞で終わる）は「賞品」（勝ち負けの台詞は「勝利」）にする */
    var pTxt = String(env.prizeText || '').trim(), pPun = pTxt ? /罰/.test(pTxt) : env.prize === 'punish', pWish = !pTxt && env.prize === 'wish';
    var pSent = pTxt ? /[はがを]|[うくすつぬふむゆるぐぶ]$/.test(pTxt) : pWish;
    var prizeHotN = !prize ? '' : pPun ? '罰ゲーム回避' : pWish ? '勝者の命令権' : pSent ? '賞品' : prize;
    var prizeWinN = !prize ? '' : pPun ? '勝利' : pWish ? '勝者の命令権' : pSent ? '勝利' : prize;
    function pk(a) { return ST.pick(S, a); }
    function F(t, m) { return fill(t, m); }
    function say(o) { return ST.say(S, o); }
    function avg(list, f) { return list.length ? list.reduce(function (s0, x) { return s0 + f(x); }, 0) / list.length : 0; }

    /* ---------- 配役 ---------- */
    var nW = clamp(+env.wolves || 1, 1, Math.max(1, Math.ceil(n / 2) - 1));
    var roles = [];
    for (var i = 0; i < nW; i++) roles.push('wolf');
    if (env.seer === '1' && roles.length < n) roles.push('seer');
    if (env.medium === '1' && roles.length < n) roles.push('medium');
    if (env.hunter === '1' && roles.length < n) roles.push('hunter');
    while (roles.length < n) roles.push('vill');
    var fixed = P.map(function (p) { var pc = (input.perChar && input.perChar[p.i]) || {}; return (pc.pick || {}).role; });
    var pool = roles.slice();
    P.forEach(function (p, k) { var want = fixed[k]; if (want && ROLE[want]) { var at = pool.indexOf(want); if (at >= 0) { p.role = want; pool.splice(at, 1); } } });
    pool = rng.shuffle(pool);
    P.forEach(function (p) { if (!p.role) p.role = pool.pop(); });

    /* ---------- 一人ひとりの気質 ---------- */
    P.forEach(function (p) {
      var pc = (input.perChar && input.perChar[p.i]) || {}, t = p.tr;
      p.action = resolve(S, p, scen.actions, pc.action); p.goal = resolve(S, p, scen.goals, pc.goal);
      p.intel = clamp((p.stats.int || 3) / 5, 0.2, 1);
      p.want = (prize ? 0.3 + t.fc * 0.3 + t.impulse * 0.25 + t.cp * 0.2 + t.jealous * 0.2 : 0.2 + t.cp * 0.2) + (p.goal.id === 'win' ? 0.25 : p.goal.id === 'prize' && prize ? 0.35 : 0);
      p.effort = clamp((t.a * 0.45 + t.caution * 0.2 + p.intel * 0.45 + (p.action.id === 'logic' ? 0.15 : 0)) * (0.7 + p.want * 0.6), 0.05, 1.3);
      /* 推理の正確さは知能が中心。気質（A）と熱量が少し足す */
      p.acc = clamp(p.intel * 0.65 + t.a * 0.2 + p.effort * 0.15, 0.1, 1);
      /* 堂々と嘘をつけるか（正直さが低い・CP・ドライさ）は、知能とは別 */
      p.bold = clamp((1 - t.honesty) * 0.45 + t.cp * 0.3 + t.cold * 0.25, 0, 1);
      p.act = clamp(p.bold * 0.45 + p.intel * 0.3 + (p.stats.poker || 3) * 0.06 + t.fc * 0.1 - t.ac * 0.25, 0.05, 1);
      /* 感じのよさ：NP・FC・人懐こさが上げ、ドライさ・攻撃性が下げる */
      p.like = clamp(0.5 + t.np * 0.3 + t.fc * 0.15 + t.warmth * 0.2 - t.cold * 0.35 - t.aggr * 0.2, 0.05, 1);
      var sc = { logic: p.acc * 1.2 + (p.action.id === 'logic' ? 0.3 : 0), lead: t.lead * 0.7 + t.cp * 0.5, gut: t.fc * 0.5 + t.impulse * 0.6 + (p.action.id === 'gut' ? 0.3 : 0), follow: t.ac * 0.9 + (p.action.id === 'quiet' ? 0.3 : 0), contra: t.aggr * 0.5 + (1 - t.ac) * 0.4 + t.cp * 0.2 - t.np * 0.3 };
      p.style = HK.weighted(rng, Object.keys(sc), function (k) { return Math.pow(Math.max(0.02, sc[k]), 3); });
      p.alive = true; p.sus = {}; p.known = {}; p.belief = {}; p.ally = null;
      p.cnt = { votes: 0, right: 0, talk: 0, breaks: 0, lies: 0, betray: 0, ally: 0, bus: 0 };
      p.m = { sus: 0, effort: Math.round(p.effort * 70) };
      p.roleLabel = ROLE[p.role] + (fixed[p.i] && fixed[p.i] === p.role ? '（指定）' : '');
    });
    /* 第一印象：感じの悪い人は最初から疑われやすい */
    P.forEach(function (p) { P.forEach(function (q) { if (q !== p) p.sus[q.i] = 38 + (1 - q.like) * 22 + (rng() - 0.5) * 16 * (1.2 - p.acc); }); });
    var isW = function (p) { return p.role === 'wolf'; };
    /* 好意モード（jinro-love.js） */
    var LM = HK.JinroLove && env.lovemode === 'on' ? HK.JinroLove : null;
    if (LM) LM.setup(S, P, input, rng);
    var wolves = P.filter(isW);
    wolves.forEach(function (w) { wolves.forEach(function (v) { if (v !== w) w.known[v.i] = 'wolf'; }); w.sus = {}; P.forEach(function (q) { if (q !== w) w.sus[q.i] = isW(q) ? 0 : 50; }); });
    var alive = function () { return P.filter(function (p) { return p.alive; }); };
    var seer = P.filter(function (p) { return p.role === 'seer'; })[0], med = P.filter(function (p) { return p.role === 'medium'; })[0], hunter = P.filter(function (p) { return p.role === 'hunter'; })[0];

    /* ---------- 人狼陣営の戦法（人狼たちの性格で決まる） ---------- */
    var plan = { fake: null, fakeMed: null, kill: 'kstrong', tags: [] };
    var fakeScore = function (w) { return w.tr.aggr * 0.4 + w.bold * 0.5 + w.intel * 0.25 + w.tr.fc * 0.1; };
    var rankW = wolves.slice().sort(function (a, b) { return fakeScore(b) - fakeScore(a); });
    if (seer && rankW[0] && fakeScore(rankW[0]) > 0.62 + rng() * 0.2) { plan.fake = rankW[0]; plan.tags.push('fake'); }
    if (med && rankW[1] && fakeScore(rankW[1]) > 0.66 + rng() * 0.15) { plan.fakeMed = rankW[1]; plan.tags.push('fakeMed'); }
    if (!plan.fake && !plan.fakeMed) plan.tags.push('hide');
    wolves.forEach(function (w) { w.busP = clamp(w.tr.cold * 0.5 + w.intel * 0.3 - w.tr.np * 0.35 + w.tr.aggr * 0.1, 0, 1); w.coverP = clamp(w.tr.np * 0.5 + w.tr.impulse * 0.2 - w.tr.cold * 0.2 + 0.1, 0, 1); });
    if (wolves.length > 1) plan.tags.push(avg(wolves, function (w) { return w.busP; }) > avg(wolves, function (w) { return w.coverP; }) ? 'bus' : 'cover');
    var wa = avg(wolves, function (w) { return w.tr.aggr + w.bold * 0.5; }), wi = avg(wolves, function (w) { return w.intel; });
    plan.kill = wa > 0.75 ? 'ks' : wi > 0.65 ? 'kstrong' : 'kgray';
    plan.tags.push(plan.kill);
    var planText = plan.tags.map(function (k) { return PLAN_LABEL[k]; }).join('＋');

    var seerCO = [], medCO = [], hunterCO = [], executed = [], killed = [], guardLast = null, guardOK = 0, winner = '', policyLog = [], moments = [];
    function claimants() { return seerCO.filter(function (c) { return c.alive; }); }
    function snap() { P.forEach(function (p) { var o = alive().filter(function (q) { return q !== p && !isW(q); }); p.m.sus = o.length ? Math.round(avg(o, function (q) { return q.sus[p.i] || 0; })) : 0; }); ST.snap(S, ['sus', 'effort']); }
    function check() { var w = alive().filter(isW).length, v = alive().length - w; if (!w) return 'vill'; if (w >= v) return 'wolf'; return ''; }
    function bump(q, x, v) { if (q === x || !q.alive) return; if (isW(q)) return; q.sus[x.i] = clamp((q.sus[x.i] || 50) + v, 0, 100); }
    /* 話し手 sp の言葉を、聞き手 q がどれだけ信じるか */
    function cred(q, sp) { return clamp(1 - (q.sus[sp.i] || 50) / 100 + (sp.like - 0.5) * 0.3, 0.05, 1); }

    say({ kind: 'phase', actors: P.map(function (p) { return p.i; }), text: n + '人で人狼ゲームが始まった。配役は人狼' + nW + '・' + [env.seer === '1' ? '占い師' : '', env.medium === '1' ? '霊媒師' : '', env.hunter === '1' ? '狩人' : ''].filter(Boolean).join('・') + (roles.filter(function (r) { return r === 'vill'; }).length ? '・村人' + roles.filter(function (r) { return r === 'vill'; }).length : '') + '。' + (prize ? '賞品は「' + prize + '」。' : ''), why: '配役はランダム（指定があればそれを優先）' });
    if (prize) { var hot = P.slice().sort(function (a, b) { return b.want - a.want; })[0]; say({ actors: [hot.i], tag: '賞品', text: F(pk(J.prizeHot), { a: hot.name, p: prizeHotN }), why: hot.name + 'の勝ちたい気持ち（FC・衝動性・負けず嫌い）' }); }

    function divine() {
      if (!seer || !seer.alive) return;
      var cand = alive().filter(function (q) { return q !== seer && !seer.known[q.i]; });
      if (!cand.length) return;
      var t = cand.slice().sort(function (a, b) { return seer.sus[b.i] - seer.sus[a.i]; })[rng() < 0.55 + seer.acc * 0.3 ? 0 : Math.floor(rng() * cand.length)];
      seer.known[t.i] = isW(t) ? 'wolf' : 'human';
      seer.lastDiv = t;
    }
    /* 占い結果を聞いたときの反応：信じる度合いで疑いが動く */
    function hearResult(c, x, black) {
      alive().forEach(function (q) { if (q === c) return; var b = q.belief[c.i] == null ? 0.5 : q.belief[c.i]; if (x === q) { if (black && !isW(q)) { q.belief[c.i] = 0; q.sus[c.i] = 100; } return; } bump(q, x, black ? 34 * b : -18 * b); });
    }
    function setBelief() {
      var cl = claimants();
      alive().forEach(function (q) {
        if (isW(q)) return;
        cl.forEach(function (c) {
          var real = c === seer, base = cl.length === 1 ? 0.75 : 0.5;
          var tell = real ? q.acc * 0.25 : -q.acc * 0.25 * (1.1 - c.act);
          q.belief[c.i] = clamp(base + tell + (c.like - 0.5) * 0.2 - (q.sus[c.i] - 50) / 200, 0.02, 0.98);
        });
      });
    }
    divine();
    snap();
    var played = 0;
    for (var day = 1; day <= n + 2 && !winner; day++) {
      played = day;
      ST.step(S, day + '日目・昼');
      var A = alive(), lastEx = executed[executed.length - 1] || null, lastKill = killed[killed.length - 1] || null;
      /* 敵視（hate-kit.js）：人狼では、好意が絡む二人のときだけ（片方が愛している・恋愛の関係がある） */
      if (HK.HateKit) {
        if (!S.ties) S.ties = (input.ties || []).filter(function (t) { return !(HK.ngPair(P[t.a], P[t.b]) && /^(lover|fwb|mate|fated|crush|almost|ex|yan)$/.test(t.type)); });   /* 恋愛・R18にしない組には恋愛の関係を当てない */
        var hk = HK.HateKit.storyTick(S, A, { kinds: 'love', rate: 0.35, place: '朝の広場で、' });
        if (hk) ST.say(S, { actors: hk.actors, tag: hk.cat === 'romance' ? '片恋と嫌悪' : '敵視', text: hk.text, why: hk.why, mag: hk.mag });
      }
      /* 執着（ヤンデレ。obsess-story.js） */
      if (HK.Obsess && HK.Obsess.storyTick) {
        if (!S.ties) S.ties = (input.ties || []).filter(function (t) { return !(HK.ngPair(P[t.a], P[t.b]) && /^(lover|fwb|mate|fated|crush|almost|ex|yan)$/.test(t.type)); });   /* 恋愛・R18にしない組には恋愛の関係を当てない */
        var ob = HK.Obsess.storyTick(S, A, { rate: 0.3, place: '朝の広場で、' });
        if (ob) ST.say(S, { actors: ob.actors, tag: ob.tag, kind: ob.kind, text: ob.text, why: ob.why, mag: ob.mag });
      }

      /* ---------- 占い師のCO・結果 ---------- */
      if (seer && seer.alive) {
        if (seerCO.indexOf(seer) < 0 && seer.lastDiv) {
          var foundW = seer.known[seer.lastDiv.i] === 'wolf';
          var pressure = avg(A.filter(function (q) { return q !== seer && !isW(q); }), function (q) { return q.sus[seer.i]; });
          if (foundW || seer.tr.honesty > 0.6 || pressure > 55 || (plan.fake && day >= 1 && rng() < 0.4) || day >= 2 && rng() < 0.6) {
            seerCO.push(seer); setBelief();
            say({ actors: [seer.i, seer.lastDiv.i], tag: '占い師CO', text: F(pk(J.seerCO), { a: seer.name, x: seer.lastDiv.name, r: foundW ? '人狼でした' : '人狼ではありませんでした' }), why: seer.name + 'は本物の占い師（' + (foundW ? '人狼を見つけた' : seer.tr.honesty > 0.6 ? '正直さ' : pressure > 55 ? '疑いをかわすため' : '頃合いを見て') + '）' });
            hearResult(seer, seer.lastDiv, foundW);
          }
        } else if (seerCO.indexOf(seer) >= 0 && seer.lastDiv && seer.lastDiv.alive) {
          var bl = seer.known[seer.lastDiv.i] === 'wolf';
          say({ actors: [seer.i, seer.lastDiv.i], tag: '占い結果', text: F(pk(J.seerRes), { a: seer.name, x: seer.lastDiv.name, r: bl ? '人狼' : '人間' }), why: seer.name + 'は本物の占い師' });
          hearResult(seer, seer.lastDiv, bl);
        }
      }
      /* 人狼の占い騙り：本物が出たら対抗、出なければ先に出ることも */
      var fw = plan.fake;
      if (fw && fw.alive && seerCO.indexOf(fw) < 0 && (seerCO.length || fw.bold > 0.75 || day >= 2)) {
        seerCO.push(fw); setBelief();
        var ft = fw.intel > 0.6 && rng() < 0.4 ? wolves.filter(function (w) { return w !== fw && w.alive; })[0] : null;
        var tgt = ft || A.filter(function (q) { return !isW(q) && q !== fw; }).sort(function (a, b) { return (b.acc + (b === seer ? 0.5 : 0)) - (a.acc + (a === seer ? 0.5 : 0)); })[0];
        if (tgt) {
          fw.fakeLast = tgt; fw.cnt.lies++;
          say({ actors: [fw.i, tgt.i], tag: seerCO.length > 1 ? '対抗CO' : '占い師CO', text: F(pk(seerCO.length > 1 ? J.fakeCO : J.seerCO), { a: fw.name, x: tgt.name, r: ft ? '人狼ではありませんでした' : '人狼でした' }), why: fw.name + 'は人狼。占い師を騙った（' + (ft ? '仲間に白を出して守る' : '推理役に黒を出す') + '・堂々さ ' + Math.round(fw.bold * 100) + '）' });
          hearResult(fw, tgt, !ft);
        }
      } else if (fw && fw.alive && seerCO.indexOf(fw) >= 0 && day > 1) {
        var ft2 = A.filter(function (q) { return !isW(q) && q !== fw && q !== fw.fakeLast; }).sort(function (a, b) { return b.acc - a.acc; })[rng() < 0.6 ? 0 : 1];
        if (ft2) { var blk = rng() < 0.45; fw.fakeLast = ft2; say({ actors: [fw.i, ft2.i], tag: '占い結果', text: F(pk(J.seerRes), { a: fw.name, x: ft2.name, r: blk ? '人狼' : '人間' }), why: fw.name + 'は偽の占い師（人狼）' }); hearResult(fw, ft2, blk); }
      }
      /* 霊媒 */
      if (lastEx) {
        if (med && med.alive && (medCO.indexOf(med) >= 0 || med.tr.honesty > 0.45 || isW(lastEx) || claimants().length > 1 || rng() < 0.5)) {
          if (medCO.indexOf(med) < 0) medCO.push(med);
          say({ actors: [med.i, lastEx.i], tag: '霊媒', text: F(pk(J.medCO), { a: med.name, x: lastEx.name, r: isW(lastEx) ? '人狼でした' : '人狼ではありませんでした' }), why: med.name + 'は本物の霊媒師' });
          /* 霊媒結果で占い師の真贋が見える */
          alive().forEach(function (q) { if (isW(q) || q === med) return; claimants().forEach(function (c) { var said = c === seer ? seer.known[lastEx.i] : c.fakeLast === lastEx ? 'wolf' : null; if (said) q.belief[c.i] = clamp((q.belief[c.i] || 0.5) + ((said === 'wolf') === isW(lastEx) ? 0.2 : -0.35) * (0.5 + q.acc * 0.5), 0.02, 0.98); }); });
        }
        var fm = plan.fakeMed;
        if (fm && fm.alive && medCO.indexOf(fm) < 0 && (medCO.length || rng() < 0.5)) {
          medCO.push(fm); fm.cnt.lies++;
          say({ actors: [fm.i, lastEx.i], tag: '霊媒騙り', text: F(pk(J.medCO), { a: fm.name, x: lastEx.name, r: isW(lastEx) ? '人狼ではありませんでした' : '人狼でした' }), why: fm.name + 'は人狼。霊媒師を騙った' });
          alive().forEach(function (q) { if (!isW(q)) { bump(q, fm, 8 * q.acc); if (med && med.alive && medCO.indexOf(med) >= 0) bump(q, med, 6 * (1 - q.acc)); } });
        }
      }
      if (lastKill && lastKill === seer && seerCO.indexOf(seer) >= 0) alive().forEach(function (q) { if (!isW(q)) claimants().forEach(function (c) { q.belief[c.i] = clamp((q.belief[c.i] || 0.5) - 0.25 * q.acc, 0.02, 0.98); bump(q, c, 15 * q.acc); }); });

      /* ---------- 村の方針（仕切り役の気質で決まる。仕切り役が人狼なら、狼に都合のいい方へ） ---------- */
      var policy = 'gray', inf = A.slice().sort(function (a, b) { return (b.tr.lead * 0.6 + b.tr.cp * 0.4 + (1 - avg(A.filter(function (q) { return q !== b; }), function (q) { return (q.sus[b.i] || 50) / 100; })) * 0.6) - (a.tr.lead * 0.6 + a.tr.cp * 0.4 + (1 - avg(A.filter(function (q) { return q !== a; }), function (q) { return (q.sus[a.i] || 50) / 100; })) * 0.6); })[0];
      var cl = claimants();
      if (cl.length >= 2) {
        if (isW(inf)) policy = plan.fake && plan.fake.alive ? (inf.intel > 0.6 ? 'judge' : 'gray') : 'roller';
        else { var sc2 = { roller: inf.tr.cp * 0.5 + inf.tr.caution * 0.4 + (1 - inf.acc) * 0.3, judge: inf.acc * 0.9 + inf.tr.a * 0.3, gray: inf.tr.np * 0.6 + (1 - inf.tr.cp) * 0.2 }; policy = Object.keys(sc2).sort(function (a, b) { return sc2[b] - sc2[a]; })[0]; }
        var polT = policy === 'gray' ? null : policy === 'roller' ? cl.slice().sort(function (a, b) { return avg(A, function (q) { return q.sus[a.i] || 0; }) - avg(A, function (q) { return q.sus[b.i] || 0; }); }).pop() : (isW(inf) ? cl.filter(function (c) { return !isW(c); })[0] : cl.slice().sort(function (a, b) { return (inf.belief[a.i] || 0.5) - (inf.belief[b.i] || 0.5); })[0]);
        policyLog.push(POLICY_LABEL[policy]);
        say({ actors: [inf.i].concat(polT ? [polT.i] : []), tag: '村の方針', text: F(pk(J.policy[policy]), { a: inf.name, x: polT ? polT.name : '' }), why: '仕切り役の' + inf.name + 'が「' + POLICY_LABEL[policy] + '」を提案（' + (isW(inf) ? '実は人狼。狼に都合のいい方針' : { roller: 'CP・慎重さ', judge: '推理の正確さ', gray: 'NP。情報源を残したい' }[policy]) + '）' });
        inf.policyT = polT;
      } else inf.policyT = null;

      /* ---------- 議論 ---------- */
      var speakers = rng.shuffle(A.slice()).slice(0, Math.min(A.length, 4 + Math.floor(rng() * 3)));
      speakers.forEach(function (p) {
        if (!p.alive) return;
        var others = A.filter(function (q) { return q !== p; });
        if (!others.length) return;
        var mate = isW(p) ? others.filter(isW)[0] : null;
        if (LM && LM.appeal(S, p, others, { isW: isW, pk: pk, bump: bump, say: say, day: day })) return;
        /* 人狼の立ち回り */
        if (isW(p)) {
          var mateHeat = mate ? avg(others.filter(function (q) { return !isW(q); }), function (q) { return q.sus[mate.i] || 50; }) : 0;
          if (mate && mateHeat > 62 && plan.tags.indexOf('bus') >= 0 && rng() < p.busP + 0.2) {
            p.cnt.bus++; moments.push(p.name + 'が仲間の' + mate.name + 'を切った');
            say({ actors: [p.i, mate.i], tag: '仲間切り', text: F(pk(J.bus), { a: p.name, x: mate.name }), why: p.name + 'は人狼。疑われた仲間を自分から切って、信用を買った（ドライさ・知能）' });
            others.forEach(function (q) { bump(q, mate, 12); bump(q, p, -10 * (1 - q.acc * 0.5)); });
            p.busVote = mate; return;
          }
          if (mate && mateHeat > 55 && rng() < p.coverP) {
            var scp = others.filter(function (q) { return !isW(q); }).sort(function (a, b) { return b.acc - a.acc; })[0];
            say({ actors: [p.i, mate.i], tag: '庇う', text: F(pk(J.cover), { a: p.name, x: mate.name, y: scp ? scp.name : '' }), why: p.name + 'は人狼。仲間を庇った（NP・衝動性）' });
            others.forEach(function (q) { bump(q, mate, -6 * (1 - q.acc)); bump(q, p, 8 * q.acc); });
            return;
          }
          /* 村人と手を組んで隠れ蓑にする（感じのよさ・演技力）。用が済めば切り捨てる */
          if (p.ally && p.ally.alive && (alive().filter(isW).length * 2 + 1 >= alive().length || avg(others.filter(function (q) { return !isW(q); }), function (q) { return q.sus[p.i] || 50; }) > 60) && rng() < 0.5 + p.tr.cold * 0.4) {
            var dupe = p.ally; p.cnt.betray++; moments.push(p.name + 'が協力相手の' + dupe.name + 'を裏切った');
            say({ actors: [p.i, dupe.i], tag: '裏切り', text: F(pk(J.betray), { a: p.name, x: dupe.name }) + F(pk(J.betrayed), { a: p.name, x: dupe.name }), why: p.name + 'は人狼。隠れ蓑にしていた' + dupe.name + 'を切り捨てた（ドライさ）' });
            others.forEach(function (q) { bump(q, dupe, 14 * (1 - q.acc * 0.5)); });
            p.busVote = dupe; dupe.ally = null; p.ally = null; return;
          }
          if (!p.ally && rng() < 0.25 + p.like * 0.3 + p.act * 0.2) {
            var mark = others.filter(function (q) { return !isW(q) && !q.ally && (q.sus[p.i] || 50) < 55; }).sort(function (a, b) { return (b.acc + (b === seer ? 0.4 : 0)) - (a.acc + (a === seer ? 0.4 : 0)); })[0];
            if (mark && rng() < 0.4 + p.act * 0.5 - mark.acc * 0.3) {
              p.ally = mark; mark.ally = p; p.cnt.ally++; mark.cnt.ally++;
              say({ actors: [p.i, mark.i], tag: '協力', text: F(pk(J.ally), { a: p.name, x: mark.name }), why: p.name + 'は人狼。' + mark.name + 'に近づいて隠れ蓑にした（感じのよさ・演技力）' });
              mark.sus[p.i] = clamp(mark.sus[p.i] - 20, 0, 100);
              return;
            }
          }
          /* 推理役に罪を着せる。堂々と言えるかは性格、ほころびは知能 */
          var scape = others.filter(function (q) { return !isW(q); }).sort(function (a, b) { return (b.acc + (seerCO.indexOf(b) >= 0 ? 0.5 : 0)) - (a.acc + (seerCO.indexOf(a) >= 0 ? 0.5 : 0)); })[0];
          if (!scape) return;
          p.cnt.lies++;
          var boldNow = rng() < p.bold + 0.15;
          say({ actors: [p.i, scape.i], tag: boldNow ? '議論' : '議論', text: F(pk(boldNow ? J.lieBold : J.lieShaky), { a: p.name, x: scape.name }), why: boldNow ? '' : p.name + 'の嘘が、少し顔に出た（正直さ・AC）' });
          others.forEach(function (q) { bump(q, scape, (boldNow ? 10 : 4) * cred(q, p) * (1 - q.acc * 0.4)); if (!boldNow) bump(q, p, 10 * q.acc); });
          if (rng() < (1 - p.intel) * 0.18 + (seerCO.indexOf(p) >= 0 ? 0.06 : 0)) {
            p.cnt.breaks++; moments.push(p.name + 'が口を滑らせた');
            say({ actors: [p.i], tag: '失言', text: F(pk(J.breakWolf), { a: p.name, y: lastKill ? lastKill.name : scape.name }), why: p.name + 'の嘘がほころんだ（知能 ' + Math.round(p.intel * 5) + '）' });
            others.forEach(function (q) { bump(q, p, 25 * (0.4 + q.acc)); });
          }
          return;
        }
        /* 村人陣営 */
        /* 裏切り：組んでいた相手が怪しく見えてきた */
        if (p.ally && p.ally.alive && p.sus[p.ally.i] > 64) {
          var ex2 = p.ally; p.cnt.betray++; moments.push(p.name + 'が' + ex2.name + 'を裏切った');
          say({ actors: [p.i, ex2.i], tag: '裏切り', text: F(pk(J.betray), { a: p.name, x: ex2.name }) + F(pk(J.betrayed), { a: p.name, x: ex2.name }), why: p.name + 'は' + ex2.name + 'と組んでいたが、疑いが上回った（' + Math.round(p.sus[ex2.i]) + '）' });
          others.forEach(function (q) { bump(q, ex2, 10); });
          ex2.ally = null; p.ally = null; return;
        }
        /* 協力：信頼できる相手と組む */
        if (!p.ally && rng() < 0.3 + p.tr.np * 0.25 + p.tr.ac * 0.15) {
          var pal = others.filter(function (q) { return !q.ally && p.sus[q.i] < 44; }).sort(function (a, b) { return p.sus[a.i] - p.sus[b.i]; })[0];
          if (pal && (isW(pal) ? rng() < 0.3 + pal.act * 0.6 : pal.sus[p.i] < 50)) {
            p.ally = pal; pal.ally = p; p.cnt.ally++; pal.cnt.ally++;
            say({ actors: [p.i, pal.i], tag: '協力', text: F(pk(J.ally), { a: p.name, x: pal.name }), why: p.name + 'は' + pal.name + 'を信頼している（疑い ' + Math.round(p.sus[pal.i]) + '）' + (isW(pal) ? '。……' + pal.name + 'は人狼だ' : '') });
            return;
          }
        }
        var top = others.slice().sort(function (a, b) { return p.sus[b.i] - p.sus[a.i]; })[0];
        if (p === seer) { var kw = others.filter(function (q) { return seer.known[q.i] === 'wolf'; })[0]; if (kw) top = kw; }
        if (p.style === 'logic' || (p.style === 'lead' && rng() < 0.4)) {
          /* 理詰め：本物の人狼の綻びを拾う確率は、推理の正確さで決まる */
          var real = others.filter(isW).sort(function (a, b) { return a.act - b.act; })[0];
          if (real && rng() < p.acc * (1.15 - real.act) * 0.6) top = real;
          var types = ['speech', 'feel'];
          if (day >= 2) types.push('vote', 'vote');
          if (seerCO.length) types.push('co');
          if (lastKill) types.push('bite');
          var cover0 = others.filter(function (q) { return q.ally && q.ally !== top; })[0];
          if (cover0 && day >= 2) types.push('defend');
          var y0 = others.filter(function (q) { return q !== top; })[Math.floor(rng() * Math.max(1, others.length - 1))];
          var rt = types[Math.floor(rng() * types.length)], m0 = { a: p.name, x: top.name, y: rt === 'bite' && lastKill ? lastKill.name : y0 ? y0.name : top.name };
          var op = F(pk(J.open), m0);
          var text = op + (/[？。、]$/.test(op) ? '' : '') + F(pk(J.reason[rt]), m0) + F(pk(J.close), m0);
          p.cnt.talk++;
          say({ actors: [p.i, top.i], tag: '推理', text: text, why: p.name + 'の推理（' + STYLE[p.style] + '・正確さ ' + Math.round(p.acc * 100) + '）' });
          others.forEach(function (q) { if (q !== top) bump(q, top, 12 * cred(q, p) * (0.6 + q.acc * 0.4)); });
          /* 推理の破綻：知能が低いと起きやすい */
          if (rng() < (1 - p.intel) * 0.22) {
            p.cnt.breaks++;
            say({ actors: [p.i], tag: '破綻', text: F(pk(J.break), { a: p.name, x: top.name, y: m0.y }), why: p.name + 'の推理が破綻した（知能 ' + Math.round(p.intel * 5) + '）' });
            others.forEach(function (q) { bump(q, p, 8 * q.acc); bump(q, top, -8); });
          }
        } else if (p.style === 'lead') {
          var t2 = inf === p && inf.policyT ? inf.policyT : top;
          var t3 = others.filter(function (q) { return q !== t2; }).sort(function (a, b) { return p.sus[b.i] - p.sus[a.i]; })[0];
          var leadT = t3 ? J.lead : J.lead.filter(function (t) { return t.indexOf('{y}') < 0; });
          say({ actors: t3 ? [p.i, t2.i, t3.i] : [p.i, t2.i], tag: '仕切り', text: F(pk(leadT), { a: p.name, x: t2.name, y: t3 ? t3.name : '' }), why: p.name + 'のCP・主導性' + (t3 ? '／次点は' + t3.name : '') });
          others.forEach(function (q) { if (q !== t2) bump(q, t2, 14 * cred(q, p) * (0.5 + q.tr.ac * 0.5)); });
        } else if (p.style === 'gut') {
          say({ actors: [p.i, top.i], tag: '勘', text: F(pk(J.gut), { a: p.name, x: top.name }), why: p.name + 'のFC・衝動性' });
          others.forEach(function (q) { if (q !== top) bump(q, top, 6 * cred(q, p)); });
        } else if (p.style === 'contra') {
          var crowd = others.slice().sort(function (a, b) { return avg(others, function (q) { return q.sus[b.i] || 0; }) - avg(others, function (q) { return q.sus[a.i] || 0; }); })[0];
          var alt = others.filter(function (q) { return q !== crowd; }).sort(function (a, b) { return p.sus[b.i] - p.sus[a.i]; })[0] || crowd;
          say({ actors: [p.i, alt.i], tag: '逆張り', text: F(pk(J.contra), { a: p.name, x: crowd.name, y: alt.name }), why: p.name + 'の攻撃性・ACの低さ（多数派を疑う）' });
          others.forEach(function (q) { bump(q, crowd, -6); bump(q, alt, 8 * cred(q, p)); });
        } else {
          var leadP = others.slice().sort(function (a, b) { return (b.tr.lead + b.tr.cp) - (a.tr.lead + a.tr.cp); })[0];
          say({ actors: [p.i, top.i], tag: '同調', text: F(pk(J.follow), { a: p.name, x: top.name, y: leadP.name }), why: p.name + 'のAC（' + leadP.name + 'に合わせる）' });
        }
        /* 感じの悪さ：言い方がきついと、それだけで疑われる */
        if (p.like < 0.35 && rng() < 0.35) {
          var hearer = others[Math.floor(rng() * others.length)];
          say({ actors: [p.i, hearer.i], tag: '空気', text: F(pk(J.rude), { a: p.name, x: hearer.name }) + F(pk(J.rudeReact), { a: p.name, x: hearer.name }), why: p.name + 'は日頃から感じが悪い（ドライさ・攻撃性。感じのよさ ' + Math.round(p.like * 100) + '）' });
          others.forEach(function (q) { bump(q, p, 9); });
        }
        /* 名指しされた側の弁明 */
        if (top && top.alive && rng() < 0.55) {
          if (isW(top)) { var bd = rng() < top.bold + 0.1; top.cnt.lies++; say({ actors: [top.i], tag: '弁明', text: F(pk(bd ? J.lieBold : J.lieShaky), { a: top.name, x: p.name }), why: bd ? top.name + 'は堂々と嘘をついた（正直さの低さ・CP）' : top.name + 'の弁明はぎこちなかった' }); others.forEach(function (q) { if (q !== top) bump(q, top, bd ? -8 * (1 - q.acc) : 10 * q.acc); }); }
          else { var dl = J.defend[top.persona] || J.defend.gentle; say({ actors: [top.i], tag: '弁明', text: F(pk(dl), { a: top.name, x: p.name }), why: '' }); others.forEach(function (q) { if (q !== top) bump(q, top, -10 * q.acc * (0.5 + top.like * 0.5)); }); }
        }
      });
      setBelief();
      snap();

      /* ---------- 投票 ---------- */
      A = alive();
      var tally = function (fnTarget) { var v = {}; A.forEach(function (p) { var t = fnTarget(p); if (t) { v[t.i] = (v[t.i] || 0) + 1; p.voted = t; } }); return v; };
      var policyT = inf.policyT;
      var villTarget = function (p) {
        var others = A.filter(function (q) { return q !== p; });
        if (p === seer) { var k = others.filter(function (q) { return seer.known[q.i] === 'wolf'; })[0]; if (k) return k; }
        var comply = 0.25 + p.tr.ac * 0.4 + cred(p, inf) * 0.3 - (p.style === 'contra' ? 0.4 : 0);
        if (policy === 'gray') { var gray = others.filter(function (q) { return seerCO.indexOf(q) < 0 && medCO.indexOf(q) < 0 && hunterCO.indexOf(q) < 0; }); if (gray.length) others = gray; }
        else if (policyT && policyT !== p && rng() < comply) return policyT;
        if (p.ally && p.ally.alive && p.ally.acc > p.acc && p.ally.voted && p.ally.voted !== p) return p.ally.voted;
        return others.sort(function (a, b) { return p.sus[b.i] - p.sus[a.i]; })[0];
      };
      /* 仮の投票で吊られそうな狩人は、COして逃れようとする */
      var pre = tally(function (p) { return isW(p) ? null : villTarget(p); }), preTop = Object.keys(pre).sort(function (a, b) { return pre[b] - pre[a]; })[0];
      var cand = preTop != null ? P[+preTop] : null;
      if (cand && cand === hunter && hunterCO.indexOf(hunter) < 0 && rng() < 0.5 + hunter.tr.caution * 0.3) {
        hunterCO.push(hunter);
        say({ actors: [hunter.i], tag: '狩人CO', text: F(pk(guardLast ? J.hunterCO : J.hunterCO.filter(function (t) { return t.indexOf('{x}') < 0; })), { a: hunter.name, x: guardLast ? guardLast.name : '' }), why: hunter.name + 'は本物の狩人。吊られそうになってCOした（慎重さ）' });
        A.forEach(function (q) { bump(q, hunter, -30 * (0.5 + q.acc * 0.5)); });
        var cw = A.filter(function (w) { return isW(w) && w.bold > 0.8; })[0];
        if (cw && rng() < 0.5) { hunterCO.push(cw); cw.cnt.lies++; moments.push(cw.name + 'が狩人に対抗した'); say({ actors: [cw.i, hunter.i], tag: '狩人対抗', text: F(pk(J.hunterCounter), { a: cw.name, x: hunter.name }), why: cw.name + 'は人狼。狩人を騙って対抗した（堂々さ）' }); A.forEach(function (q) { bump(q, hunter, 18 * (1 - q.acc)); bump(q, cw, 18 * q.acc); }); }
      } else if (cand && isW(cand) && cand.bold > 0.85 && hunterCO.indexOf(cand) < 0 && rng() < 0.35) {
        hunterCO.push(cand); cand.cnt.lies++; moments.push(cand.name + 'が狩人を騙った');
        say({ actors: [cand.i], tag: '狩人CO', text: F(pk(J.hunterCO), { a: cand.name, x: A.filter(function (q) { return q !== cand; })[0].name }), why: cand.name + 'は人狼。吊られそうになって狩人を騙った（堂々さ）' });
        A.forEach(function (q) { bump(q, cand, -22 * (1 - q.acc * 0.6)); });
        if (hunter && hunter.alive && hunterCO.indexOf(hunter) < 0 && rng() < 0.6 + hunter.tr.honesty * 0.3) { hunterCO.push(hunter); say({ actors: [hunter.i, cand.i], tag: '狩人対抗', text: F(pk(J.hunterCounter), { a: hunter.name, x: cand.name }), why: hunter.name + 'は本物の狩人' }); A.forEach(function (q) { bump(q, cand, 25 * q.acc); }); }
      }
      function wolfTarget(p, others) {
        if (!isW(p)) return villTarget(p);
        if (p.busVote && p.busVote.alive) return p.busVote;
        /* 人狼は村人の吊り先に乗る（仲間が危ないときは、仲間以外の最多票へ） */
        var vs = others.filter(function (q) { return !isW(q); });
        return vs.sort(function (a, b) { return (pre[b.i] || 0) * 10 + (seerCO.indexOf(b) >= 0 && b === seer ? 15 : 0) + b.acc * 5 - ((pre[a.i] || 0) * 10 + (seerCO.indexOf(a) >= 0 && a === seer ? 15 : 0) + a.acc * 5); })[0];
      }
      var votes = tally(function (p) {
        var others = A.filter(function (q) { return q !== p; });
        var vt = LM ? LM.vote(S, p, others, wolfTarget(p, others), isW(p)) : wolfTarget(p, others);
        /* 殺さない相手には票を入れない（ほかに入れられる相手がいれば、次に疑わしい人へ） */
        if (SSK && vt && SSK.nk(S, p, vt)) { var alt = SSK.spare(S, p, others).slice().sort(function (a, b) { return (p.sus[b.i] || 0) - (p.sus[a.i] || 0); })[0]; if (alt) vt = alt; }
        return vt;
      });
      if (LM) LM.flush(S, say, pk);
      A.forEach(function (p) { p.busVote = null; if (p.voted) { p.cnt.votes++; if (!isW(p) && isW(p.voted)) p.cnt.right++; } });
      var maxV = 0, tops = [];
      Object.keys(votes).forEach(function (k) { if (votes[k] > maxV) { maxV = votes[k]; tops = [+k]; } else if (votes[k] === maxV) tops.push(+k); });
      var exP = P[tops[Math.floor(rng() * tops.length)]];
      var exNk = SSK && A.some(function (p) { return p.voted === exP && SSK.nk(S, p, exP); }) ? SSK.NOTE : '';
      exP.alive = false; executed.push(exP); exP.fate = '処刑（' + day + '日目）';
      var lw = (isW(exP) ? J.lastW : J.lastV)[exP.persona] || (isW(exP) ? J.lastW : J.lastV).gentle;
      say({ actors: [exP.i], tag: '処刑', kind: 'climax', text: F(pk(J.exec), { x: exP.name }) + F(pk(lw), { x: exP.name }), why: '得票 ' + maxV + '／' + A.length + (tops.length > 1 ? '（同票からくじ引き）' : '') + '・' + exP.name + 'は' + ROLE[exP.role] + (policy !== 'gray' && exP === policyT ? '（方針「' + POLICY_LABEL[policy] + '」どおり）' : '') + exNk });
      if (exP.ally) { exP.ally.ally = null; exP.ally = null; }
      winner = check(); if (winner) break;

      /* ---------- 夜 ---------- */
      ST.step(S, day + '日目・夜');
      A = alive();
      divine();
      var guard = null;
      if (hunter && hunter.alive) {
        var gc = A.filter(function (q) { return q !== hunter && q !== guardLast; });
        guard = gc.sort(function (a, b) { var va = (claimants().indexOf(a) >= 0 ? 60 * (hunter.belief[a.i] == null ? 0.5 : hunter.belief[a.i]) : 0) + (medCO.indexOf(a) >= 0 ? 20 : 0) + a.acc * 12 - hunter.sus[a.i] * 0.4, vb = (claimants().indexOf(b) >= 0 ? 60 * (hunter.belief[b.i] == null ? 0.5 : hunter.belief[b.i]) : 0) + (medCO.indexOf(b) >= 0 ? 20 : 0) + b.acc * 12 - hunter.sus[b.i] * 0.4; return vb - va; })[0];
        guardLast = guard;
      }
      /* 襲撃：戦法どおり。気の早い狼が独断で噛み先を変えることも */
      var prey = null, vill = A.filter(function (q) { return !isW(q); });
      if (plan.kill === 'ks' && seer && seer.alive && seerCO.indexOf(seer) >= 0) prey = seer;
      else if (plan.kill === 'kgray') prey = vill.filter(function (q) { return seerCO.indexOf(q) < 0; }).sort(function (a, b) { return avg(A, function (q) { return q.sus[a.i] || 50; }) - avg(A, function (q) { return q.sus[b.i] || 50; }); })[0];
      prey = prey || vill.sort(function (a, b) { return (b.acc + (b === seer && seerCO.indexOf(b) >= 0 ? 0.6 : 0) + (medCO.indexOf(b) >= 0 ? 0.3 : 0)) - (a.acc + (a === seer && seerCO.indexOf(a) >= 0 ? 0.6 : 0) + (medCO.indexOf(a) >= 0 ? 0.3 : 0)); })[0];
      var rogue = A.filter(function (w) { return isW(w) && w.tr.impulse > 0.7; })[0], rogueNote = '';
      if (rogue && rng() < 0.2 && vill.length > 1) { var rp = vill.filter(function (q) { return q !== prey; }).sort(function (a, b) { return rogue.sus[a.i] - rogue.sus[b.i]; })[0] || prey; if (rp !== prey) { prey = rp; rogueNote = '（' + rogue.name + 'が独断で噛み先を変えた）'; moments.push(rogue.name + 'が独断で噛んだ'); } }
      /* 殺さない：生きている人狼の誰かが殺さない相手は、ほかに噛める村人がいれば噛まない（いなければ、やむを得ず） */
      var nkNote = '';
      if (SSK && prey) {
        var wv = A.filter(isW);
        if (SSK.note(S, wv, prey)) {
          var alt2 = SSK.spare(S, wv, vill).slice().sort(function (a, b) { return b.acc - a.acc; })[0];
          if (alt2 && !SSK.note(S, wv, alt2)) prey = alt2; else nkNote = SSK.NOTE;
        }
      }
      ST.step(S, (day + 1) + '日目・朝');
      if (prey && prey === guard) { guardOK++; moments.push(hunter.name + 'が' + prey.name + 'を守り抜いた'); say({ actors: [], tag: '平和な朝', text: pk(J.peace), why: '狩人の' + hunter.name + 'が' + prey.name + 'を守った' + rogueNote }); }
      else if (prey && HK.Dark.skip(S, 'night')) say({ actors: [], tag: '平和な朝', text: pk(J.peace), why: '人狼は、この夜は誰も襲わなかった（' + HK.Dark.tag(S, 'night') + '）' });
      else if (prey) { prey.alive = false; killed.push(prey); prey.fate = '襲撃（' + (day + 1) + '日目の朝）'; if (prey.ally) { prey.ally.ally = null; prey.ally = null; } say({ actors: [prey.i], tag: '襲撃', text: F(pk(J.killed), { x: prey.name }), why: '人狼の戦法「' + PLAN_LABEL[plan.kill] + '」' + rogueNote + nkNote }); }
      snap();
      winner = check();
    }
    winner = winner || check() || 'wolf';

    /* ---------- 結果と賞品 ---------- */
    var winners = P.filter(function (p) { return winner === 'wolf' ? isW(p) : !isW(p); }), losers = P.filter(function (p) { return winners.indexOf(p) < 0; });
    var pz = prizeWinN || '勝利';
    var hotW = winners.slice().sort(function (a, b) { return b.want - a.want; })[0], hotL = losers.slice().sort(function (a, b) { return b.want - a.want; })[0];
    if (hotW) say({ actors: [hotW.i], tag: '勝利', text: F(pk(J.win[winner]), { a: hotW.name, p: pz }), why: hotW.name + 'の勝ちたい気持ち（' + Math.round(hotW.want * 100) + '）' });
    if (hotL) say({ actors: [hotL.i], tag: '敗北', text: F(pk(hotL.want > 0.6 ? J.loseHot : J.loseCalm), { a: hotL.name, p: pz }), why: hotL.name + (hotL.want > 0.6 ? 'は本気で勝ちたかった' : 'は楽しめればよかった') });
    /* 騙された側のリアクション・罰ゲーム（jinro-after.js） */
    if (HK.JinroAfter) HK.JinroAfter.end({ S: S, P: P, input: input, env: env, winner: winner, winners: winners, losers: losers, wolves: wolves, isW: isW, plan: plan });
    var sharp = P.filter(function (p) { return !isW(p) && p.cnt.votes; }).sort(function (a, b) { return b.cnt.right / b.cnt.votes - a.cnt.right / a.cnt.votes || b.acc - a.acc; })[0];
    P.forEach(function (p) {
      if (!p.fate) p.fate = '生存';
      p.notes.push(ROLE[p.role] + '・' + (winners.indexOf(p) >= 0 ? '勝ち' : '負け') + '・知能 ' + Math.round(p.intel * 5) + '・推理の正確さ ' + Math.round(p.acc * 100) + '・感じのよさ ' + Math.round(p.like * 100));
      p.notes.push(isW(p) ? '人狼として：' + (plan.fake === p ? '占い騙り' : plan.fakeMed === p ? '霊媒騙り' : '潜伏') + '・嘘 ' + p.cnt.lies + '回' + (p.cnt.bus ? '・仲間切り ' + p.cnt.bus + '回' : '') + (p.cnt.breaks ? '・失言 ' + p.cnt.breaks + '回' : '') : '議論のしかた：' + STYLE[p.style] + '・人狼に投票 ' + p.cnt.right + '／' + p.cnt.votes + (p.cnt.breaks ? '・推理の破綻 ' + p.cnt.breaks + '回' : '') + (p.cnt.ally ? '・協力 ' + p.cnt.ally + '回' : '') + (p.cnt.betray ? '・裏切り ' + p.cnt.betray + '回' : ''));
      if (LM) p.notes.push('好意モード：' + (p.superLogic ? 'とても論理的・' : '') + '好き嫌いで投票 ' + p.cnt.emo + '回' + (p.cnt.appeal ? '・好意で訴えた ' + p.cnt.appeal + '回（通った ' + p.cnt.appealOK + '回）' : ''));
      p.notes.push('方針：' + p.action.label + '／目標：' + p.goal.label + (prize ? '・勝ちたい気持ち ' + Math.round(p.want * 100) : ''));
    });
    var title = winner === 'wolf' ? '人狼陣営の勝利 ― ' + wolves.map(function (w) { return w.name; }).join('・') + 'が逃げ切った' : '村人陣営の勝利 ― 人狼を全員見つけ出した';
    var lines = ['人狼は' + wolves.map(function (w) { return w.name; }).join('・') + '。' + (seer ? '占い師は' + seer.name + '。' : '') + (med ? '霊媒師は' + med.name + '。' : '') + (hunter ? '狩人は' + hunter.name + '。' : '')];
    lines.push('人狼陣営の戦法：' + planText + '。');
    if (policyLog.length) lines.push('村の方針：' + policyLog.filter(function (x, k, a) { return a.indexOf(x) === k; }).join('→') + '。');
    if (moments.length) lines.push('盤面の転機：' + moments.slice(0, 4).join('／') + '。');
    if (sharp) lines.push('いちばん鋭かったのは' + sharp.name + '（人狼に投票 ' + sharp.cnt.right + '／' + sharp.cnt.votes + '）。');
    if (prize) lines.push(pPun ? '「' + prize + '」の約束どおり、負けた' + (winner === 'wolf' ? '村人陣営' : '人狼陣営') + 'が罰ゲームを受けることになった。'
      : pSent ? '「' + prize + '」の約束どおり、勝ったのは' + (winner === 'wolf' ? '人狼陣営' : '村人陣営') + 'だった。'
      : '賞品の「' + prize + '」は、' + (winner === 'wolf' ? '人狼陣営' : '村人陣営') + 'のものになった。');
    return ST.result(S, input, {
      ending: { title: title, kind: 'ok', lines: lines },
      estats: [['日数', played + '日'], ['処刑', executed.length + '人'], ['襲撃', killed.length + '人'], ['護衛成功', guardOK + '回'], ['人狼の戦法', planText]],
      table: { title: '配役と結果', cols: ['配役', '陣営', '結末', '知能', '議論のしかた', '人狼に投票'], rows: P.map(function (p) { return { i: p.i, rank: winners.indexOf(p) >= 0 ? '勝' : '', cells: [ROLE[p.role], isW(p) ? '人狼' : '村人', p.fate, String(Math.round(p.intel * 5)), isW(p) ? (plan.fake === p ? '占い騙り' : plan.fakeMed === p ? '霊媒騙り' : '潜伏') : STYLE[p.style], isW(p) ? '－' : p.cnt.right + '／' + p.cnt.votes] }; }) },
      meters: [{ label: '疑われ度', color: '--enemy' }, { label: '推理の熱量', color: '--accent', dash: true }],
      meta: n + '人・人狼' + nW + (prize ? '・賞品「' + prize + '」' : ''),
      summary: '人狼：' + title
    });
  }
})();
