/* 箱庭シミュレーター: 人狼
   住人どうしで人狼ゲームを遊ぶだけの箱庭。配役は人狼・狩人・占い師・霊媒師・村人からランダム（数は設定で決める）。
   ・ゲームなので、襲う相手・投票先は既存の関係を無視して、推理と立ち回りだけで決まる
   ・推理を頑張るか（A・慎重さ）、勘で動くか（FC・衝動性）、人に合わせるか（AC）、場を仕切るか（CP・主導性）は気質の数値で決まる
   ・人狼は性格で戦法を選ぶ（占い騙り・霊媒騙り・潜伏・仲間切り・庇い合い・噛み方）。村は仕切り役しだいで方針が変わる
   ・一人ひとりが疑いと信頼を持ち、協力したり裏切ったりする。知能は性格とは別に決まり、推理の破綻しやすさに効く
   ・台詞は jinro-data.js
   ・賞品があると、勝ちたい気持ち（FC・衝動性・負けず嫌い）が推理の熱量に乗る
   全年齢・R18版の両方で使う */
/* 出来事の一覧の印（hakoniwa-tools/build/event-catalog.js が数える。決まりは docs/reports/2026-10-28/event-catalog.md） */
/* @event-ok 人狼ゲームの中の言い回しを足しただけ（盤面整理・白確を外す一言・名前の出る罪着せ。新しい出来事ではない） */
/* @event-ok 投票の理由（票ごとに、疑いが上がったきっかけを一言添える。新しい出来事ではない） */
/* @event scen=jinro id=jr_game cat=conflict tags=death cond=HK.Dark.f(S, 'night') label=人狼ゲーム（占い・騙り・投票・夜の襲撃） */
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
    /* 推理の台詞は「切り出し＋理由＋締め」をつなぐ。部品はどれも 3 本（くだけた常体｜硬い常体｜敬語。＝・空は左と同じ）なので、
       本ごとにつないで 1 本の 3 本の台詞にする（切り出しの ¦ より前は地の文。台詞は「」で挟む）。2026-10-31 口調直し第8回 */
    function tri(t) { var a = String(t).split('｜'); if (a.length < 3) return [t, t, t]; for (var i = 1; i < 3; i++) if (a[i] === '＝' || a[i] === '') a[i] = a[i - 1]; return a.slice(0, 3); }
    var QUIET = /^(mukuchi|mukuchi_ne|darui)$/, BRIEF = /^(aniki|yankee|usan|chara_down|otaku|kohai|mystic|noja|sondai|kansai)$/;
    function joinTri(op, rs, cl) {
      var k = op.indexOf('¦'), head = op.slice(0, k) + '「', A = tri(op.slice(k + 1)), B = tri(rs), C = tri(cl.replace(/」$/, ''));
      return head + [0, 1, 2].map(function (i) { return A[i] + B[i] + C[i]; }).join('｜') + '」';
    }
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
    /* 疑いを動かす。k＝きっかけの種類・by＝きっかけになった人。上がった分は q.susLog に残し、投票の理由はそこから選ぶ（起きていないことを理由にしない） */
    function bump(q, x, v, k, by) {
      if (q === x || !q.alive) return; if (isW(q)) return;
      var b0 = q.sus[x.i] || 50; q.sus[x.i] = clamp(b0 + v, 0, 100);
      var dv = q.sus[x.i] - b0;
      if (dv > 0 && k) { q.susLog = q.susLog || {}; (q.susLog[x.i] = q.susLog[x.i] || []).push({ k: k, by: by || null, v: dv, d: S.jrDay || 0 }); }
    }
    /* 話し手 sp の言葉を、聞き手 q がどれだけ信じるか */
    function cred(q, sp) { return clamp(1 - (q.sus[sp.i] || 50) / 100 + (sp.like - 0.5) * 0.3, 0.05, 1); }
    /* 疑いの動き方の重み（名指しは第一印象の差（最大 22）に負けない量に。人狼の票の乗り方は勝率の調整に使う） */
    var VILL_K = { logic: 18, gut: 10 }, WOLF_K = { pre: 10, seer: 15, acc: 5, lieBold: 26, lieShaky: 12 };

    /* ---------- 公開の情報と盤面の整理（2026-10-30 担当JW） ----------
       記録に出た CO・占い結果・霊媒結果・狩人の護衛の申告だけから、村から見た盤面を計算する（board()）。
       ・白確（論理的に白と確定）：本物と分かった占い師（噛まれた・吊られて霊媒で白・対抗が全員偽と分かった）とその白、
         占い師が複数 CO していて全員が白を出した人、噛まれた人、霊媒で白の人（死者）
       ・準白確：対抗のいない占い師の白、対抗のいない狩人が守ったと言い、その朝が平和だった人
       ・黒確：本物と分かった占い師の黒、偽と分かった占い師
       投票先・議論の名指し・人狼の罪着せの対象・盤面整理の台詞は、すべてこの値を使う（白確・準白確には入れない） */
    var pub = { res: {}, med: [], guard: [] }, votesByDay = {}, policy = 'none', polT = null, inf = null, peaceDay = 0;
    var spoke = {}, named = {}, accBy = {};
    function isCO(q) { return seerCO.indexOf(q) >= 0 || medCO.indexOf(q) >= 0 || hunterCO.indexOf(q) >= 0; }
    function said(c, x, black, d) { (pub.res[c.i] = pub.res[c.i] || []).push({ x: x, black: black, day: d }); }
    function resOf(c) { return pub.res[c.i] || []; }
    /* 霊媒結果：霊媒の CO が二人以上なら、二人以上がそろって同じ結果のときだけ確か */
    function medOf(x) {
      var a = pub.med.filter(function (m) { return m.x === x; });
      if (!a.length || (medCO.length >= 2 && a.length < 2)) return null;
      return a.every(function (m) { return m.black === a[0].black; }) ? a[0].black : null;
    }
    function board() {
      var B = { white: {}, semi: {}, black: {}, real: null, fake: {}, semiBy: null, deadW: 0, exact: true, wolfMax: null, med: [] };
      var cl = seerCO.slice();
      cl.forEach(function (c) {
        if (killed.indexOf(c) >= 0) { if (!B.real) B.real = c; }
        else if (executed.indexOf(c) >= 0) { var r = medOf(c); if (r === false && !B.real) B.real = c; else if (r === true) B.fake[c.i] = 1; }
      });
      if (!B.real && cl.length >= 2) { var nf = cl.filter(function (c) { return !B.fake[c.i]; }); if (nf.length === 1) B.real = nf[0]; }
      if (B.real) cl.forEach(function (c) { if (c !== B.real) B.fake[c.i] = 1; });
      if (B.real) { B.white[B.real.i] = 1; resOf(B.real).forEach(function (r) { B[r.black ? 'black' : 'white'][r.x.i] = 1; }); }
      cl.forEach(function (c) { if (B.fake[c.i]) B.black[c.i] = 1; });
      if (cl.length >= 2) P.forEach(function (q) { if (cl.every(function (c) { return c !== q && resOf(c).some(function (r) { return r.x === q && !r.black; }); })) B.white[q.i] = 1; });
      if (cl.length === 1 && !B.real) { B.semiBy = cl[0]; resOf(cl[0]).forEach(function (r) { if (!r.black) B.semi[r.x.i] = 1; }); }
      killed.forEach(function (q) { B.white[q.i] = 1; });
      executed.forEach(function (q) { var r = medOf(q); if (r != null) { B[r ? 'black' : 'white'][q.i] = 1; B.med.push({ x: q, black: r }); } });
      if (hunterCO.length === 1) pub.guard.forEach(function (g) { if (g.c === hunterCO[0] && g.c.alive) B.semi[g.x.i] = 1; });
      Object.keys(B.black).forEach(function (k) { delete B.white[k]; delete B.semi[k]; });
      Object.keys(B.white).forEach(function (k) { delete B.semi[k]; });
      executed.forEach(function (q) { if (B.black[q.i]) B.deadW++; else if (!B.white[q.i]) B.exact = false; });
      B.wolfMax = nW - B.deadW >= 1 ? nW - B.deadW : null;
      B.gray = alive().filter(function (q) { return !isCO(q) && !B.white[q.i] && !B.semi[q.i] && !B.black[q.i]; });
      return B;
    }
    function safe(B, q) { return !!(B.white[q.i] || B.semi[q.i]); }
    /* 投票・名指しの候補：白確・準白確を外す（占い師は自分の白も外す）。グレー吊りの方針を言った日は CO者も外す */
    function candOf(p, others, B) {
      var c = others.filter(function (q) { return !safe(B, q) && !(p === seer && seer.known[q.i] === 'human'); });
      if (policy === 'gray') { var g = c.filter(function (q) { return !isCO(q); }); if (g.length) c = g; }
      if (!c.length) c = others.filter(function (q) { return !B.white[q.i]; });
      return c.length ? c : others;
    }
    function maxSus(p, list) { return list.slice().sort(function (a, b) { return (p.sus[b.i] || 0) - (p.sus[a.i] || 0); })[0]; }
    /* その人が今日いちばん吊りたい相手（議論の名指しと投票で同じ値を使う） */
    function leanOf(p, others, B) {
      if (p === seer) { var k = others.filter(function (q) { return seer.known[q.i] === 'wolf'; })[0]; if (k) return k; }
      var c = candOf(p, others, B);
      var bk = c.filter(function (q) { return B.black[q.i]; });
      if (bk.length) return maxSus(p, bk);
      if (polT && policy !== 'gray' && policy !== 'none' && p.followPol === day && c.indexOf(polT) >= 0) return polT;
      return maxSus(p, c);
    }
    /* 台詞の候補を、今の盤面・日数で絞る（まだ起きていないこと・記録と食い違うことを言わない） */
    var R_DAY1 = /昨日|昨夜|投票先|票を見|票先|一貫|記録を見|毎回|二日続|辻褄|噛ま|噛み|霊媒結果|平和な朝|入れてない|流れと違う|入れたんだっけ/;
    var R_VOTE = /流れと違う|毎回いちばん安全|直前で票先|二日続けて揃って|票を入れてないの/;
    function whiteSaid(x) { return seerCO.some(function (c) { return resOf(c).some(function (r) { return r.x === x && !r.black; }); }); }
    function lineOK(t, c) {
      var x = c.x, y = c.y, p = c.p;
      if (day === 1 && R_DAY1.test(t)) return false;
      if (/霊媒結果/.test(t) && !pub.med.length) return false;
      if (/対抗|真贋|どっちを信じる|どっちがどっち/.test(t) && seerCO.length < 2) return false;
      if (/占い師が出た/.test(t) && !seerCO.length) return false;
      if (/二人出た|両方/.test(t) && claimants().length !== 2) return false;
      if (/急に結果を言い出した/.test(t) && !(x && seerCO.indexOf(x) > 0)) return false;
      if (/明日の占い結果/.test(t) && !claimants().length) return false;
      if (/黒を証明/.test(t) && !(p && x && resOf(p).some(function (r) { return r.x === x && r.black; }))) return false;
      if (/噛まれたのが|噛まれるのは/.test(t) && !c.kill) return false;
      if (/噛み先/.test(t) && !(c.kill && x && killed.filter(function (v) { return (v.sus[x.i] || 0) >= 55; }).length >= 2)) return false;
      if (/平和な朝/.test(t) && peaceDay !== day) return false;
      if (/偽の占い結果/.test(t) && !(p && plan.fake === p && seerCO.indexOf(p) >= 0)) return false;
      if (/\{x\}が白で、\{y\}も白/.test(t) && !(x && y && whiteSaid(x) && whiteSaid(y))) return false;
      if (/黒出した/.test(t) && !seerCO.some(function (s) { return resOf(s).some(function (r) { return r.black; }); })) return false;
      if (/昨日まで組んで|昨日の発言で/.test(t) && !(p && p.allyDay != null && p.allyDay < day)) return false;
      if (/口数が少ない|話題を振らない|喋らなさすぎ|黙ってる/.test(t) && !(x && !spoke[x.i])) return false;
      if (/名前を一度も出してない/.test(t) && !(x && !accBy[x.i])) return false;
      if (/\{y\}の意見に賛成|\{y\}の推理、納得|\{y\}の顔をうかがってから/.test(t) && !(x && y && (named[x.i] || []).indexOf(y) >= 0)) return false;
      if (/みんな\{x\}|皆\{x\}/.test(t) && !(x && (named[x.i] || []).length >= 2)) return false;
      if (/\{x\}吊りの流れ/.test(t) && !(x && (named[x.i] || []).length >= 1)) return false;
      if (R_VOTE.test(t) && !(c.vote && c.vote.indexOf(t) >= 0)) return false;
      return true;
    }
    /* 条件に合う台詞だけから選ぶ。need の印（'{x}' など）を含む文だけにもできる。合う文がなければ null */
    function pf(arr, c, need) {
      var a = arr.filter(function (t) { return (!need || need.every(function (m) { return t.indexOf(m) >= 0; })) && lineOK(t, c || {}); });
      return a.length ? pk(a) : null;
    }
    /* 「昨日の投票」の推理は、実際の票の記録と合う文だけ（{y} が要る文は、その相手も返す） */
    function voteFacts(x, sp) {
      var Y = votesByDay[day - 1], out = { lines: [], y: null };
      if (!Y || !x) return out;
      var rx = function (r) { return r.p === x; };
      var mine = Y.v.filter(rx)[0];
      if (!mine || !mine.to) return out;
      var non = Y.v.filter(function (r) { return r.to && r.to !== Y.ex; });
      J.reason.vote.forEach(function (t) {
        if (/流れと違う|票を入れてないの/.test(t)) { if (non.length === 1 && non[0].p === x) out.lines.push(t); }
        else if (/毎回いちばん安全/.test(t)) {
          var ds = Object.keys(votesByDay).map(Number).filter(function (d) { return d < day; });
          if (ds.length >= 2 && ds.every(function (d) { var r = votesByDay[d].v.filter(rx)[0]; return r && r.to === votesByDay[d].ex; })) out.lines.push(t);
        } else if (/直前で票先/.test(t)) { if (mine.pre && mine.pre !== mine.to) out.lines.push(t); }
        else if (/二日続けて揃って/.test(t)) {
          var Y2 = votesByDay[day - 2], m2 = Y2 && Y2.v.filter(rx)[0];
          if (!m2 || !m2.to) return;
          var pal = Y.v.filter(function (r) {
            if (r.p === x || r.p === sp || !r.p.alive || r.to !== mine.to) return false;
            var r2 = Y2.v.filter(function (z) { return z.p === r.p; })[0];
            return r2 && r2.to === m2.to && (mine.to !== Y.ex || m2.to !== Y2.ex);
          })[0];
          if (pal) { out.lines.push(t); out.y = pal.p; }
        }
      });
      return out;
    }
    /* 名指しの記録（その日の流れ）。名前が本文に出たときだけ数える */
    function accuse(p, x, text) {
      if (!x || !p || text.indexOf(x.name) < 0) return;
      (named[x.i] = named[x.i] || []).push(p); accBy[p.i] = (accBy[p.i] || 0) + 1;
      if (!isW(p)) { p.named = x; p.namedDay = day; }
    }
    /* 白確・準白確の人がいちばん疑わしく見えていた人は、「もう白で見ていい」と外してから、実際に推す相手を言う（同じ日に同じ人を外す一言は一度だけ） */
    var skipSaid = {};
    function skipWhite(p, top, others, B) {
      var raw = maxSus(p, others);
      if (!raw || raw === top || !safe(B, raw) || (p.sus[raw.i] || 0) < 55 || skipSaid[raw.i] === day) return;
      var wsT = pf(J.whiteSkip.filter(function (t) { return B.white[raw.i] || t.indexOf('白確') < 0; }), { p: p, x: top, y: raw });
      if (!wsT) return;
      skipSaid[raw.i] = day;
      say({ actors: [p.i, top.i, raw.i], tag: '盤面', text: F(wsT, { a: p.name, x: top.name, y: raw.name }), why: raw.name + 'は' + (B.white[raw.i] ? '白確' : '準白確（対抗のいない占い師の白など）') + '。' + p.name + 'は投票の候補から外した' });
    }
    /* ---------- 投票の理由（その人の疑いが上がった実際のきっかけから選ぶ） ----------
       ・決まりで入れた票（占いの結果・黒確・方針・自分の名指し・協力相手）は、その決まりを理由にする
       ・それ以外は、susLog（bump が残す「誰の・どの出来事で・いくつ上がったか」）を、きっかけごとに足して、いちばん大きいもの（今日の分は 1.5 倍）
       ・人狼は本心を言わないので、今日その人を名指しした人など、記録に出た出来事だけを口実にする
       ・きっかけが無ければ、今日一度も話していない・前の日の票が記録と合う・名指し最多・第一印象の順
       名指し最多と違う相手に入れた人と、今日話していない人の分を、票の記録（札「投票」）に「A→B「理由」」で出す */
    function whyOf(p, x, B) {
      if (p.vRule) return p.vRule;
      if (!isW(p)) {
        var agg = {}, best = null;
        ((p.susLog && p.susLog[x.i]) || []).forEach(function (e) {
          if (e.k === 'seer' && e.by && B.black[e.by.i]) return;   /* 偽と分かった占い師の黒は理由にしない */
          var key = e.k + '>' + (e.by ? e.by.i : ''), o = agg[key] = agg[key] || { k: e.k, by: e.by, v: 0 };
          o.v += e.v * (e.d === day ? 1.5 : 1);
        });
        Object.keys(agg).forEach(function (k) { if (!best || agg[k].v > best.v) best = agg[k]; });
        if (best && best.v >= 4) return { k: best.k, by: best.by };
      } else {
        var acc = (named[x.i] || []).filter(function (q) { return q !== p && q !== x; });
        if (acc.length) return { k: 'acc', by: acc[acc.length - 1] };
      }
      if (!spoke[x.i]) return { k: 'silent' };
      var vf = voteFacts(x, p);
      if (vf.lines.some(function (t) { return t.indexOf('{y}') < 0; })) return { k: 'votes' };
      if (topNamed().indexOf(x) >= 0) return { k: 'flow' };
      if (x.like < 0.4) return { k: 'firstRude' };
      return { k: 'first' };
    }
    function topNamed() {
      var mx = 0, t = [];
      Object.keys(named).forEach(function (k) { var c = named[k].length; if (!P[k].alive) return; if (c > mx) { mx = c; t = [P[k]]; } else if (c === mx) t.push(P[k]); });
      return t;
    }
    function voteWhySay() {
      var tn = topNamed(), B2 = board(), parts = [], rec = [];
      A.forEach(function (p) {
        var x = p.voted; if (!x) return;
        var w = whyOf(p, x, B2), show = w.k !== 'emo' && (tn.indexOf(x) < 0 || !spoke[p.i]);
        rec.push({ p: p.i, x: x.i, k: w.k, by: w.by ? w.by.i : null, shown: show });
        if (!show) return;
        var t = J.voteWhy[w.k]; if (!t) return;
        parts.push(p.name + '→' + x.name + '\u300c＠' + p.name + '＠' + fill(t, { y: w.by ? w.by.name : '' }) + '\u300d');
      });
      S._jrVoteWhy = rec;
      if (parts.length) say({ actors: A.filter(function (p) { return p.voted; }).map(function (p) { return p.i; }), tag: '投票', text: '投票の理由。' + parts.join('　'), why: '名指し最多' + (tn.length ? '（' + tn.map(function (q) { return q.name; }).join('・') + '）' : '') + 'と違う相手に入れた人と、今日話していない人の理由。疑いが上がった実際のきっかけから選んだ' });
    }
    /* 盤面整理の台詞（3本のベース）と、点検用の値 */
    function boardSay(sp, B) {
      var BP = J.boardPart, nm = function (l) { return l.map(function (q) { return q.name; }).join('・'); };
      var parts = [], data = { seers: [], real: null, white: [], semi: [], black: [], med: [], gray: [], wolfMax: B.wolfMax, exact: B.exact };
      var put = function (k, m) { parts.push(BP[k].map(function (t) { return fill(t, m); })); };
      var cl = claimants();
      if (B.real && B.real.alive) { put('real', { s: B.real.name }); data.real = B.real.name; }
      else if (cl.length) { put('seers', { s: nm(cl), n: cl.length }); data.seers = cl.map(function (q) { return q.name; }); }
      var w = alive().filter(function (q) { return B.white[q.i]; }), sm = alive().filter(function (q) { return B.semi[q.i]; }), bk = alive().filter(function (q) { return B.black[q.i]; });
      if (w.length) { put('white', { w: nm(w) }); data.white = w.map(function (q) { return q.name; }); }
      if (sm.length) { put('semi', { w: nm(sm) }); data.semi = sm.map(function (q) { return q.name; }); }
      if (bk.length) { put('black', { k: nm(bk) }); data.black = bk.map(function (q) { return q.name; }); }
      if (B.med.length) { put('med', { m: B.med.map(function (r) { return r.x.name + 'は' + (r.black ? '人狼' : '人間'); }).join('、') }); data.med = B.med.map(function (r) { return [r.x.name, r.black]; }); }
      if (B.gray.length) { put('gray', { g: nm(B.gray), n: B.gray.length }); data.gray = B.gray.map(function (q) { return q.name; }); }
      if (B.wolfMax) put(B.exact ? 'wolfExact' : 'wolfMax', { n: B.wolfMax });
      if (parts.length < 2) return false;
      var head = BP.head, line = [0, 1, 2].map(function (k) { return head[k] + parts.map(function (x, i) { return k < 2 && i < parts.length - 1 ? x[k].replace(/だ?。$/, '、') : x[k]; }).join(''); });
      S._jrBoard = data;   /* 点検用（記録には入れない） */
      say({ actors: [sp.i], tag: '盤面整理', text: sp.name + '\u300c' + line.map(function (x) { return x.replace(/。$/, ''); }).join('\uff5c') + '\u300d', why: sp.name + 'が記録（CO・占い結果・霊媒結果・吊り・噛み）から盤面を整理した' });
      S._jrBoard = null;
      spoke[sp.i] = 1;
      return true;
    }

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
      alive().forEach(function (q) { if (q === c) return; var b = q.belief[c.i] == null ? 0.5 : q.belief[c.i]; if (x === q) { if (black && !isW(q)) { q.belief[c.i] = 0; q.sus[c.i] = 100; q.susLog = q.susLog || {}; (q.susLog[c.i] = q.susLog[c.i] || []).push({ k: 'liar', by: c, v: 50, d: S.jrDay || 0 }); } return; } bump(q, x, black ? 34 * b : -18 * b, 'seer', c); });
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
      spoke = {}; named = {}; accBy = {}; S.jrDay = day;
      /* 霊媒・噛みの話は、昨日の吊り・昨夜の噛みだけ（前の日の噛みを「昨夜」と言わない） */
      var A = alive(), lastEx = executed[executed.length - 1] || null, lastKill = killed.length && killed[killed.length - 1].killedDay === day ? killed[killed.length - 1] : null;
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
            say({ actors: [seer.i, seer.lastDiv.i], tag: '占い師CO', text: F(pk(J.seerCO), { a: seer.name, x: seer.lastDiv.name, r: foundW ? '人狼' : '人間' }), why: seer.name + 'は本物の占い師（' + (foundW ? '人狼を見つけた' : seer.tr.honesty > 0.6 ? '正直さ' : pressure > 55 ? '疑いをかわすため' : '頃合いを見て') + '）' });
            said(seer, seer.lastDiv, foundW, day); spoke[seer.i] = 1;
            hearResult(seer, seer.lastDiv, foundW);
          }
        } else if (seerCO.indexOf(seer) >= 0 && seer.lastDiv && seer.lastDiv.alive) {
          var bl = seer.known[seer.lastDiv.i] === 'wolf';
          say({ actors: [seer.i, seer.lastDiv.i], tag: '占い結果', text: F(pk(J.seerRes), { a: seer.name, x: seer.lastDiv.name, r: bl ? '人狼' : '人間' }), why: seer.name + 'は本物の占い師' });
          said(seer, seer.lastDiv, bl, day); spoke[seer.i] = 1;
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
          say({ actors: [fw.i, tgt.i], tag: seerCO.length > 1 ? '対抗CO' : '占い師CO', text: F(pk(seerCO.length > 1 ? J.fakeCO : J.seerCO), { a: fw.name, x: tgt.name, r: ft ? '人間' : '人狼' }), why: fw.name + 'は人狼。占い師を騙った（' + (ft ? '仲間に白を出して守る' : '推理役に黒を出す') + '・堂々さ ' + Math.round(fw.bold * 100) + '）' });
          said(fw, tgt, !ft, day); spoke[fw.i] = 1;
          hearResult(fw, tgt, !ft);
        }
      } else if (fw && fw.alive && seerCO.indexOf(fw) >= 0 && day > 1) {
        var ft2 = A.filter(function (q) { return !isW(q) && q !== fw && q !== fw.fakeLast; }).sort(function (a, b) { return b.acc - a.acc; })[rng() < 0.6 ? 0 : 1];
        if (ft2) { var blk = rng() < 0.45; fw.fakeLast = ft2; say({ actors: [fw.i, ft2.i], tag: '占い結果', text: F(pk(J.seerRes), { a: fw.name, x: ft2.name, r: blk ? '人狼' : '人間' }), why: fw.name + 'は偽の占い師（人狼）' }); said(fw, ft2, blk, day); spoke[fw.i] = 1; hearResult(fw, ft2, blk); }
      }
      /* 霊媒 */
      if (lastEx) {
        if (med && med.alive && (medCO.indexOf(med) >= 0 || med.tr.honesty > 0.45 || isW(lastEx) || claimants().length > 1 || rng() < 0.5)) {
          if (medCO.indexOf(med) < 0) medCO.push(med);
          say({ actors: [med.i, lastEx.i], tag: '霊媒', text: F(pk(J.medCO), { a: med.name, x: lastEx.name, r: isW(lastEx) ? '人狼' : '人間' }), why: med.name + 'は本物の霊媒師' });
          pub.med.push({ c: med, x: lastEx, black: isW(lastEx) }); spoke[med.i] = 1;
          /* 霊媒結果で占い師の真贋が見える */
          alive().forEach(function (q) { if (isW(q) || q === med) return; claimants().forEach(function (c) { var said0 = c === seer ? seer.known[lastEx.i] : c.fakeLast === lastEx ? 'wolf' : null; if (said0) q.belief[c.i] = clamp((q.belief[c.i] || 0.5) + ((said0 === 'wolf') === isW(lastEx) ? 0.2 : -0.35) * (0.5 + q.acc * 0.5), 0.02, 0.98); }); });
        }
        var fm = plan.fakeMed;
        if (fm && fm.alive && medCO.indexOf(fm) < 0 && (medCO.length || rng() < 0.5)) {
          medCO.push(fm); fm.cnt.lies++;
          say({ actors: [fm.i, lastEx.i], tag: '霊媒騙り', text: F(pk(J.medCO), { a: fm.name, x: lastEx.name, r: isW(lastEx) ? '人間' : '人狼' }), why: fm.name + 'は人狼。霊媒師を騙った' });
          pub.med.push({ c: fm, x: lastEx, black: !isW(lastEx) }); spoke[fm.i] = 1;
          alive().forEach(function (q) { if (!isW(q)) { bump(q, fm, 8 * q.acc, 'claim'); if (med && med.alive && medCO.indexOf(med) >= 0) bump(q, med, 6 * (1 - q.acc), 'claim'); } });
        }
      }
      if (lastKill && lastKill === seer && seerCO.indexOf(seer) >= 0) alive().forEach(function (q) { if (!isW(q)) claimants().forEach(function (c) { q.belief[c.i] = clamp((q.belief[c.i] || 0.5) - 0.25 * q.acc, 0.02, 0.98); bump(q, c, 15 * q.acc, 'claim'); }); });

      /* ---------- 村の方針（仕切り役の気質で決まる。仕切り役が人狼なら、狼に都合のいい方へ）。方針を言わない日は「なし」 ---------- */
      var B = board();
      policy = 'none'; polT = null;
      inf = A.slice().sort(function (a, b) { return (b.tr.lead * 0.6 + b.tr.cp * 0.4 + (1 - avg(A.filter(function (q) { return q !== b; }), function (q) { return (q.sus[b.i] || 50) / 100; })) * 0.6) - (a.tr.lead * 0.6 + a.tr.cp * 0.4 + (1 - avg(A.filter(function (q) { return q !== a; }), function (q) { return (q.sus[a.i] || 50) / 100; })) * 0.6); })[0];
      var cl = claimants().filter(function (c) { return !safe(B, c); });
      if (cl.length >= 2 && !B.real) {
        if (isW(inf)) policy = plan.fake && plan.fake.alive ? (inf.intel > 0.6 ? 'judge' : 'gray') : 'roller';
        else { var sc2 = { roller: inf.tr.cp * 0.5 + inf.tr.caution * 0.4 + (1 - inf.acc) * 0.3, judge: inf.acc * 0.9 + inf.tr.a * 0.3, gray: inf.tr.np * 0.6 + (1 - inf.tr.cp) * 0.2 }; policy = Object.keys(sc2).sort(function (a, b) { return sc2[b] - sc2[a]; })[0]; }
        polT = policy === 'gray' ? null : policy === 'roller' ? cl.slice().sort(function (a, b) { return avg(A, function (q) { return q.sus[a.i] || 0; }) - avg(A, function (q) { return q.sus[b.i] || 0; }); }).pop() : (isW(inf) ? cl.filter(function (c) { return !isW(c); })[0] : cl.slice().sort(function (a, b) { return (inf.belief[a.i] || 0.5) - (inf.belief[b.i] || 0.5); })[0]);
        if (polT === inf) polT = cl.filter(function (c) { return c !== inf; })[0] || null;
        if (policy !== 'gray' && !polT) policy = 'gray';
        policyLog.push(POLICY_LABEL[policy]);
        /* 方針の相手がいない（グレー吊り）ときは、{x} の無い文だけ（「今日はグレーの」と名前が抜けないように） */
        var polArr = J.policy[policy].filter(function (t) { return polT ? t.indexOf('{x}') >= 0 : t.indexOf('{x}') < 0; });   /* 相手がいれば名前の出る文だけ（名前の出ない名指しをしない） */
        var polText = F(pf(polArr, { p: inf, x: polT }) || polArr[0], { a: inf.name, x: polT ? polT.name : '' });
        say({ actors: [inf.i].concat(polT ? [polT.i] : []), tag: '村の方針', text: polText, why: '仕切り役の' + inf.name + 'が「' + POLICY_LABEL[policy] + '」を提案（' + (isW(inf) ? '実は人狼。狼に都合のいい方針' : { roller: 'CP・慎重さ', judge: '推理の正確さ', gray: 'NP。情報源を残したい' }[policy]) + '）' });
        spoke[inf.i] = 1;
        if (polT) accuse(inf, polT, polText);
        /* 方針に従うか（AC・仕切り役への信頼）。その日の名指しと投票の両方に使う */
        A.forEach(function (q) { if (q === inf || rng() < 0.25 + q.tr.ac * 0.4 + cred(q, inf) * 0.3 - (q.style === 'contra' ? 0.4 : 0)) q.followPol = day; });
      }
      /* 盤面整理：二日目から（初日は占い師が出たときだけ）。記録から計算した値だけを言う */
      if ((day >= 2 || seerCO.length) && rng() < (day >= 2 ? 0.75 : 0.45)) boardSay(inf, B);

      /* ---------- 議論 ---------- */
      var speakers = rng.shuffle(A.slice()).slice(0, Math.min(A.length, 4 + Math.floor(rng() * 3)));
      speakers.forEach(function (p) {
        if (!p.alive) return;
        var others = A.filter(function (q) { return q !== p; });
        if (!others.length) return;
        B = board();
        var mate = isW(p) ? others.filter(isW)[0] : null;
        if (LM && LM.appeal(S, p, others, { isW: isW, pk: pk, bump: bump, say: say, day: day })) { spoke[p.i] = 1; return; }
        spoke[p.i] = 1;
        /* 人狼の立ち回り */
        if (isW(p)) {
          var mateHeat = mate ? avg(others.filter(function (q) { return !isW(q); }), function (q) { return q.sus[mate.i] || 50; }) : 0;
          var busT = mate && mateHeat > 62 && plan.tags.indexOf('bus') >= 0 && rng() < p.busP + 0.2 ? pf(J.bus, { p: p, x: mate }, ['{x}']) : null;
          if (busT) {
            p.cnt.bus++; moments.push(p.name + 'が仲間の' + mate.name + 'を切った');
            var bt = F(busT, { a: p.name, x: mate.name });
            say({ actors: [p.i, mate.i], tag: '仲間切り', text: bt, why: p.name + 'は人狼。疑われた仲間を自分から切って、信用を買った（ドライさ・知能）' });
            accuse(p, mate, bt);
            others.forEach(function (q) { bump(q, mate, 12, 'acc', p); bump(q, p, -10 * (1 - q.acc * 0.5)); });
            p.busVote = mate; return;
          }
          if (mate && mateHeat > 55 && rng() < p.coverP) {
            var scp = others.filter(function (q) { return !isW(q) && !safe(B, q); }).sort(function (a, b) { return b.acc - a.acc; })[0];
            var cvT = scp ? pf(J.cover, { p: p, x: mate, y: scp }) || pk(J.cover) : pk(J.cover.filter(function (t) { return t.indexOf('{y}') < 0; }));
            var cvx = F(cvT, { a: p.name, x: mate.name, y: scp ? scp.name : '' });
            say({ actors: scp && cvx.indexOf(scp.name) >= 0 ? [p.i, mate.i, scp.i] : [p.i, mate.i], tag: '庇う', text: cvx, why: p.name + 'は人狼。仲間を庇った（NP・衝動性）' });
            if (scp) accuse(p, scp, cvx);
            others.forEach(function (q) { bump(q, mate, -6 * (1 - q.acc)); bump(q, p, 8 * q.acc, 'cover', mate); });
            return;
          }
          /* 村人と手を組んで隠れ蓑にする（感じのよさ・演技力）。用が済めば切り捨てる */
          if (p.ally && p.ally.alive && (alive().filter(isW).length * 2 + 1 >= alive().length || avg(others.filter(function (q) { return !isW(q); }), function (q) { return q.sus[p.i] || 50; }) > 60) && rng() < 0.5 + p.tr.cold * 0.4 && !safe(B, p.ally)) {
            var dupe = p.ally; p.cnt.betray++; moments.push(p.name + 'が協力相手の' + dupe.name + 'を裏切った');
            var btx = F(pf(J.betray, { p: p, x: dupe }) || pk(J.betray), { a: p.name, x: dupe.name }) + F(pk(J.betrayed), { a: p.name, x: dupe.name });
            say({ actors: [p.i, dupe.i], tag: '裏切り', text: btx, why: p.name + 'は人狼。隠れ蓑にしていた' + dupe.name + 'を切り捨てた（ドライさ）' });
            accuse(p, dupe, btx);
            others.forEach(function (q) { bump(q, dupe, 14 * (1 - q.acc * 0.5), 'betrayed', p); });
            p.busVote = dupe; dupe.ally = null; p.ally = null; return;
          }
          if (!p.ally && rng() < 0.25 + p.like * 0.3 + p.act * 0.2) {
            var mark = others.filter(function (q) { return !isW(q) && !q.ally && (q.sus[p.i] || 50) < 55; }).sort(function (a, b) { return (b.acc + (b === seer ? 0.4 : 0)) - (a.acc + (a === seer ? 0.4 : 0)); })[0];
            if (mark && rng() < 0.4 + p.act * 0.5 - mark.acc * 0.3) {
              p.ally = mark; mark.ally = p; p.allyDay = mark.allyDay = day; p.cnt.ally++; mark.cnt.ally++;
              say({ actors: [p.i, mark.i], tag: '協力', text: F(pk(J.ally), { a: p.name, x: mark.name }), why: p.name + 'は人狼。' + mark.name + 'に近づいて隠れ蓑にした（感じのよさ・演技力）' });
              mark.sus[p.i] = clamp(mark.sus[p.i] - 20, 0, 100);
              return;
            }
          }
          /* 推理役に罪を着せる（白確・準白確は狙わない）。堂々と言えるかは性格、ほころびは知能。名前の出る文だけで言う */
          var scape = others.filter(function (q) { return !isW(q) && !safe(B, q); }).sort(function (a, b) { return (b.acc + (seerCO.indexOf(b) >= 0 ? 0.5 : 0)) - (a.acc + (seerCO.indexOf(a) >= 0 ? 0.5 : 0)); })[0];
          if (!scape) return;
          p.cnt.lies++;
          var boldNow = rng() < p.bold + 0.15;
          var lieT = pf(boldNow ? J.lieBold : J.lieShaky, { p: p, x: scape }, ['{x}']) || pf(J.lieBold, { p: p, x: scape }, ['{x}']);
          var lieX = F(lieT, { a: p.name, x: scape.name });
          say({ actors: [p.i, scape.i], tag: '議論', text: lieX, why: boldNow ? '' : p.name + 'の嘘が、少し顔に出た（正直さ・AC）' });
          accuse(p, scape, lieX);
          others.forEach(function (q) { bump(q, scape, (boldNow ? WOLF_K.lieBold : WOLF_K.lieShaky) * cred(q, p) * (1 - q.acc * 0.4), 'acc', p); if (!boldNow) bump(q, p, 10 * q.acc, 'shaky'); });
          if (rng() < (1 - p.intel) * 0.18 + (seerCO.indexOf(p) >= 0 ? 0.06 : 0)) {
            var bwT = pf(J.breakWolf, { p: p, kill: lastKill });
            if (bwT) {
              p.cnt.breaks++; moments.push(p.name + 'が口を滑らせた');
              say({ actors: [p.i], tag: '失言', text: F(bwT, { a: p.name, y: lastKill ? lastKill.name : '' }), why: p.name + 'の嘘がほころんだ（知能 ' + Math.round(p.intel * 5) + '）' });
              others.forEach(function (q) { bump(q, p, 25 * (0.4 + q.acc), 'slip'); });
            }
          }
          return;
        }
        /* 村人陣営 */
        /* 裏切り：組んでいた相手が怪しく見えてきた（白確の相手は裏切らない） */
        if (p.ally && p.ally.alive && p.sus[p.ally.i] > 64 && !safe(B, p.ally)) {
          var ex2 = p.ally; p.cnt.betray++; moments.push(p.name + 'が' + ex2.name + 'を裏切った');
          var btx2 = F(pf(J.betray, { p: p, x: ex2 }) || pk(J.betray), { a: p.name, x: ex2.name }) + F(pk(J.betrayed), { a: p.name, x: ex2.name });
          say({ actors: [p.i, ex2.i], tag: '裏切り', text: btx2, why: p.name + 'は' + ex2.name + 'と組んでいたが、疑いが上回った（' + Math.round(p.sus[ex2.i]) + '）' });
          accuse(p, ex2, btx2);
          others.forEach(function (q) { bump(q, ex2, 10, 'betrayed', p); });
          ex2.ally = null; p.ally = null; return;
        }
        /* 協力：信頼できる相手と組む */
        if (!p.ally && rng() < 0.3 + p.tr.np * 0.25 + p.tr.ac * 0.15) {
          var pal = others.filter(function (q) { return !q.ally && p.sus[q.i] < 44; }).sort(function (a, b) { return p.sus[a.i] - p.sus[b.i]; })[0];
          if (pal && (isW(pal) ? rng() < 0.3 + pal.act * 0.6 : pal.sus[p.i] < 50)) {
            p.ally = pal; pal.ally = p; p.allyDay = pal.allyDay = day; p.cnt.ally++; pal.cnt.ally++;
            say({ actors: [p.i, pal.i], tag: '協力', text: F(pk(J.ally), { a: p.name, x: pal.name }), why: p.name + 'は' + pal.name + 'を信頼している（疑い ' + Math.round(p.sus[pal.i]) + '）' + (isW(pal) ? '。……' + pal.name + 'は人狼だ' : '') });
            return;
          }
        }
        /* 名指しの相手は、投票と同じ決め方（白確・準白確を外す・黒確が先・方針に従う人は方針の相手） */
        var top = leanOf(p, others, B);
        var cand0 = candOf(p, others, B);
        var fixedTop = (p === seer && seer.known[top.i] === 'wolf') || B.black[top.i] || (top === polT && p.followPol === day);
        if (p.style === 'logic' || (p.style === 'lead' && rng() < 0.4)) {
          /* 理詰め：本物の人狼の綻びを拾う確率は、推理の正確さで決まる */
          var real = cand0.filter(isW).sort(function (a, b) { return a.act - b.act; })[0];
          if (!fixedTop && real && rng() < p.acc * (1.15 - real.act) * 0.6) top = real;
          skipWhite(p, top, others, B);
          var vf = voteFacts(top, p);
          var types = ['speech', 'feel'];
          if (vf.lines.length) types.push('vote', 'vote');
          if (seerCO.length || pub.med.length) types.push('co');
          if (lastKill || peaceDay === day) types.push('bite');
          if (top.ally && top.ally.alive && top.ally !== p && day >= 2) types.push('defend');
          var y0 = others.filter(function (q) { return q !== top; })[Math.floor(rng() * Math.max(1, others.length - 1))];
          var rt, rtx = null, m0, yy = y0;
          for (var tries = 0; tries < 6 && !rtx; tries++) {
            rt = types[Math.floor(rng() * types.length)];
            yy = rt === 'bite' && lastKill ? lastKill : rt === 'vote' && vf.y ? vf.y : rt === 'defend' ? top.ally : y0;
            m0 = { a: p.name, x: top.name, y: yy ? yy.name : top.name };
            rtx = pf(J.reason[rt], { p: p, x: top, y: yy, kill: lastKill, vote: vf.lines });
          }
          if (!rtx) { rt = 'feel'; yy = y0; m0 = { a: p.name, x: top.name, y: y0 ? y0.name : top.name }; rtx = pf(J.reason.feel, { p: p, x: top }) || J.reason.feel[1]; }
          var op = F(pf(J.open, { p: p, x: top }) || pk(J.open), m0);
          var text = joinTri(op, F(rtx, m0), F(pf(J.close, { p: p, x: top }) || pk(J.close), m0));
          /* 口数の少ない口調（無口・無口（……だね）・けだるげ）は、切り出しと締めを言わず、理由をひと言で（J.quiet。乱数は使わない。2026-10-31 口調直し第8回） */
          var tn = HK.toneOf ? HK.toneOf(p) : p.tone || '';
          if (J.quiet && J.quiet[rt] && QUIET.test(tn)) text = p.name + '「' + F(J.quiet[rt], m0) + '」';
          /* 一文ごとに口癖が付く・長いと言い切れない口調は、理由だけを言う（切り出し・締めの地の文は残す） */
          else if (BRIEF.test(tn)) text = joinTri(op.slice(0, op.indexOf('¦') + 1), F(rtx, m0), '');
          p.cnt.talk++;
          say({ actors: [p.i, top.i], tag: '推理', text: text, why: p.name + 'の推理（' + STYLE[p.style] + '・正確さ ' + Math.round(p.acc * 100) + '）' });
          accuse(p, top, text);
          others.forEach(function (q) { if (q !== top) bump(q, top, VILL_K.logic * cred(q, p) * (0.6 + q.acc * 0.4), 'acc', p); });
          /* 推理の破綻：知能が低いと起きやすい */
          if (rng() < (1 - p.intel) * 0.22) {
            var brT = pf(J.break, { p: p, x: top, y: yy });
            if (brT) {
              p.cnt.breaks++;
              say({ actors: [p.i], tag: '破綻', text: F(brT, { a: p.name, x: top.name, y: m0.y }), why: p.name + 'の推理が破綻した（知能 ' + Math.round(p.intel * 5) + '）' });
              others.forEach(function (q) { bump(q, p, 8 * q.acc, 'break'); bump(q, top, -8); });
            }
          }
        } else if (p.style === 'lead') {
          var t2 = inf === p && polT && cand0.indexOf(polT) >= 0 ? polT : top;
          var t3 = cand0.filter(function (q) { return q !== t2; }).sort(function (a, b) { return p.sus[b.i] - p.sus[a.i]; })[0];
          var ldT = pf(J.lead, { p: p, x: t2, y: t3 }, t3 ? ['{x}'] : ['{x}']);
          if (!t3 || !ldT) ldT = pf(J.lead.filter(function (t) { return t.indexOf('{y}') < 0; }), { p: p, x: t2 }, ['{x}']);
          var ldx = F(ldT, { a: p.name, x: t2.name, y: t3 ? t3.name : '' });
          var useY = t3 && ldT.indexOf('{y}') >= 0;
          say({ actors: useY ? [p.i, t2.i, t3.i] : [p.i, t2.i], tag: '仕切り', text: ldx, why: p.name + 'のCP・主導性' + (useY ? '／次点は' + t3.name : '') });
          accuse(p, t2, ldx);
          others.forEach(function (q) { if (q !== t2) bump(q, t2, 14 * cred(q, p) * (0.5 + q.tr.ac * 0.5), 'acc', p); });
          top = t2;
        } else if (p.style === 'gut' || (p.style === 'contra' && fixedTop)) {
          /* 逆張りの人でも、占いの結果・黒確・方針に従うと決めた日は、その相手を名指しする */
          skipWhite(p, top, others, B);
          var gtx = F(pf(J.gut, { p: p, x: top }, ['{x}']) || J.gut[0], { a: p.name, x: top.name });
          say({ actors: [p.i, top.i], tag: '勘', text: gtx, why: p.name + 'のFC・衝動性' });
          accuse(p, top, gtx);
          others.forEach(function (q) { if (q !== top) bump(q, top, VILL_K.gut * cred(q, p), 'acc', p); });
        } else if (p.style === 'contra' && !fixedTop) {
          /* 逆張り：今日いちばん名指しされた人（流れ）を疑わず、別の人を推す */
          var crowd = Object.keys(named).map(Number).filter(function (k) { return P[k].alive && P[k] !== p; }).sort(function (a, b) { return named[b].length - named[a].length; }).map(function (k) { return P[k]; })[0] || null;
          var alt = cand0.filter(function (q) { return q !== crowd; }).sort(function (a, b) { return p.sus[b.i] - p.sus[a.i]; })[0] || top;
          var ctT = crowd ? pf(J.contra, { p: p, x: crowd, y: alt }, ['{x}', '{y}']) : null;
          if (!ctT) ctT = pf(J.contra.filter(function (t) { return t.indexOf('{x}') < 0; }), { p: p, y: alt }, ['{y}']);
          var ctx = F(ctT, { a: p.name, x: crowd ? crowd.name : '', y: alt.name });
          say({ actors: [p.i, alt.i], tag: '逆張り', text: ctx, why: p.name + 'の攻撃性・ACの低さ（多数派を疑う）' });
          accuse(p, alt, ctx);
          others.forEach(function (q) { if (crowd && ctx.indexOf(crowd.name) >= 0) bump(q, crowd, -6); bump(q, alt, 8 * cred(q, p), 'acc', p); });
          top = alt;
        } else {
          /* 同調：その人を名指しした人（いれば）に合わせる。名前の出る文だけ */
          skipWhite(p, top, others, B);
          var who = (named[top.i] || []).filter(function (q) { return q !== p && q.alive; });
          var leadP = who.length ? who[who.length - 1] : null;
          var flT = leadP ? pf(J.follow, { p: p, x: top, y: leadP }, ['{x}']) : null;
          if (!flT) { leadP = null; flT = pf(J.follow.filter(function (t) { return t.indexOf('{y}') < 0; }), { p: p, x: top }, ['{x}']); }
          var flx = F(flT, { a: p.name, x: top.name, y: leadP ? leadP.name : '' });
          say({ actors: [p.i, top.i], tag: '同調', text: flx, why: p.name + 'のAC' + (leadP && flT.indexOf('{y}') >= 0 ? '（' + leadP.name + 'に合わせる）' : '（今の流れに乗る）') });
          accuse(p, top, flx);
        }
        /* 感じの悪さ：言い方がきついと、それだけで疑われる */
        if (p.like < 0.35 && rng() < 0.35) {
          var hearer = others[Math.floor(rng() * others.length)];
          say({ actors: [p.i, hearer.i], tag: '空気', text: F(pk(J.rude), { a: p.name, x: hearer.name }) + F(pk(J.rudeReact), { a: p.name, x: hearer.name }), why: p.name + 'は日頃から感じが悪い（ドライさ・攻撃性。感じのよさ ' + Math.round(p.like * 100) + '）' });
          others.forEach(function (q) { bump(q, p, 9, 'rude'); });
        }
        /* 名指しされた側の弁明 */
        if (top && top.alive && rng() < 0.55) {
          spoke[top.i] = 1;
          if (isW(top)) { var bd = rng() < top.bold + 0.1; top.cnt.lies++; say({ actors: [top.i], tag: '弁明', text: F(pf(bd ? J.lieBold : J.lieShaky, { p: top, x: p }) || pk(J.lieBold.filter(function (t) { return t.indexOf('{x}') < 0; })), { a: top.name, x: p.name }), why: bd ? top.name + 'は堂々と嘘をついた（正直さの低さ・CP）' : top.name + 'の弁明はぎこちなかった' }); others.forEach(function (q) { if (q !== top) bump(q, top, bd ? -8 * (1 - q.acc) : 10 * q.acc, 'shaky'); }); }
          else { var dl = J.defend[top.persona] || J.defend.gentle; say({ actors: [top.i], tag: '弁明', text: F(pf(dl, { p: top, x: p }) || pk(J.defend.gentle.filter(function (t) { return lineOK(t, {}); })), { a: top.name, x: p.name }), why: '' }); others.forEach(function (q) { if (q !== top) bump(q, top, -10 * q.acc * (0.5 + top.like * 0.5)); }); }
        }
      });
      setBelief();
      snap();

      /* ---------- 投票 ---------- */
      A = alive();
      A.forEach(function (p) { p.voted = null; p.votedDay = null; p.preVoted = null; });
      var tally = function (fnTarget) { var v = {}; A.forEach(function (p) { var t = fnTarget(p); if (t) { v[t.i] = (v[t.i] || 0) + 1; p.voted = t; p.votedDay = day; } }); return v; };
      var villTarget = function (p) {
        var others = A.filter(function (q) { return q !== p; });
        var lean = leanOf(p, others, B), c = candOf(p, others, B);
        /* p.vRule：決まりで入れたときの理由（占いの結果・黒確・方針・自分の名指し・協力相手）。なければ疑いのきっかけから選ぶ */
        p.vRule = null;
        if (p === seer && seer.known[lean.i] === 'wolf') { p.vRule = { k: 'seerOwn' }; return lean; }
        if (B.black[lean.i]) { p.vRule = { k: 'black' }; return lean; }
        if (lean === polT && p.followPol === day) { p.vRule = { k: p === inf ? 'self' : 'policy', by: inf }; return lean; }
        /* 議論で自分が名指しした相手：疑いが最大に近ければ、そのまま入れる */
        if (p.named && p.namedDay === day && p.named.alive && c.indexOf(p.named) >= 0 && (p.sus[p.named.i] || 0) >= (p.sus[lean.i] || 0) - 10) { p.vRule = { k: 'self' }; return p.named; }
        /* 協力相手（自分より推理の確かな人）の今日の票に合わせる */
        if (p.ally && p.ally.alive && p.ally.acc > p.acc && p.ally.voted && p.ally.votedDay === day && p.ally.voted !== p && p.ally.voted.alive && c.indexOf(p.ally.voted) >= 0) { p.vRule = { k: 'ally', by: p.ally }; return p.ally.voted; }
        return lean;
      };
      /* 仮の投票で吊られそうな狩人は、COして逃れようとする */
      B = board();
      var pre = tally(function (p) { return isW(p) ? null : villTarget(p); }), preTop = Object.keys(pre).sort(function (a, b) { return pre[b] - pre[a]; })[0];
      A.forEach(function (p) { p.preVoted = isW(p) ? null : p.voted; p.voted = null; p.votedDay = null; });
      var cand = preTop != null ? P[+preTop] : null;
      if (cand && cand === hunter && hunterCO.indexOf(hunter) < 0 && rng() < 0.5 + hunter.tr.caution * 0.3) {
        hunterCO.push(hunter);
        var hcT = pk(guardLast ? J.hunterCO : J.hunterCO.filter(function (t) { return t.indexOf('{x}') < 0; }));
        say({ actors: [hunter.i], tag: '狩人CO', text: F(hcT, { a: hunter.name, x: guardLast ? guardLast.name : '' }), why: hunter.name + 'は本物の狩人。吊られそうになってCOした（慎重さ）' });
        /* 守った相手を言い、その朝が平和だった（襲撃を防いだ）なら、その人は襲われた＝人間 */
        if (guardLast && hcT.indexOf('{x}') >= 0 && peaceDay === day && hunter.savedDay === day) pub.guard.push({ c: hunter, x: guardLast, day: day });
        A.forEach(function (q) { bump(q, hunter, -30 * (0.5 + q.acc * 0.5)); });
        var cw = A.filter(function (w) { return isW(w) && w.bold > 0.8; })[0];
        if (cw && rng() < 0.5) { hunterCO.push(cw); cw.cnt.lies++; moments.push(cw.name + 'が狩人に対抗した'); say({ actors: [cw.i, hunter.i], tag: '狩人対抗', text: F(pk(J.hunterCounter), { a: cw.name, x: hunter.name }), why: cw.name + 'は人狼。狩人を騙って対抗した（堂々さ）' }); A.forEach(function (q) { bump(q, hunter, 18 * (1 - q.acc), 'claim'); bump(q, cw, 18 * q.acc, 'claim'); }); }
      } else if (cand && isW(cand) && cand.bold > 0.85 && hunterCO.indexOf(cand) < 0 && rng() < 0.35) {
        hunterCO.push(cand); cand.cnt.lies++; moments.push(cand.name + 'が狩人を騙った');
        say({ actors: [cand.i], tag: '狩人CO', text: F(pk(J.hunterCO), { a: cand.name, x: A.filter(function (q) { return q !== cand; })[0].name }), why: cand.name + 'は人狼。吊られそうになって狩人を騙った（堂々さ）' });
        A.forEach(function (q) { bump(q, cand, -22 * (1 - q.acc * 0.6)); });
        if (hunter && hunter.alive && hunterCO.indexOf(hunter) < 0 && rng() < 0.6 + hunter.tr.honesty * 0.3) { hunterCO.push(hunter); say({ actors: [hunter.i, cand.i], tag: '狩人対抗', text: F(pk(J.hunterCounter), { a: hunter.name, x: cand.name }), why: hunter.name + 'は本物の狩人' }); A.forEach(function (q) { bump(q, cand, 25 * q.acc, 'claim'); }); }
      }
      B = board();
      function wolfTarget(p, others) {
        if (!isW(p)) return villTarget(p);
        p.vRule = null;
        if (p.busVote && p.busVote.alive) { p.vRule = { k: 'self' }; return p.busVote; }
        /* 人狼は村人の吊り先に乗る（仲間が危ないときは、仲間以外の最多票へ）。白確・準白確には入れない（目立つので） */
        var vs = others.filter(function (q) { return !isW(q) && !safe(B, q); });
        if (!vs.length) vs = others.filter(function (q) { return !isW(q); });
        var sc = function (q) { return (pre[q.i] || 0) * WOLF_K.pre + (seerCO.indexOf(q) >= 0 && q === seer ? WOLF_K.seer : 0) + q.acc * WOLF_K.acc; };
        return vs.sort(function (a, b) { return sc(b) - sc(a); })[0];
      }
      var votes = tally(function (p) {
        var others = A.filter(function (q) { return q !== p; });
        var base = wolfTarget(p, others);
        var vt = LM ? LM.vote(S, p, others, base, isW(p)) : base;
        /* 好き嫌いの票でも、白確・準白確には入れない */
        if (vt && vt !== base && safe(B, vt)) vt = base;
        /* 殺さない相手には票を入れない（ほかに入れられる相手がいれば、次に疑わしい人へ） */
        if (SSK && vt && SSK.nk(S, p, vt)) { var alt = SSK.spare(S, p, others).filter(function (q) { return !safe(B, q); }).sort(function (a, b) { return (p.sus[b.i] || 0) - (p.sus[a.i] || 0); })[0]; if (alt) vt = alt; }
        if (vt !== base) p.vRule = vt && LM && S.emoLog && S.emoLog.some(function (e) { return e.p === p && e.to === vt; }) ? { k: 'emo' } : null;
        return vt;
      });
      if (LM) LM.flush(S, say, pk);
      voteWhySay();
      A.forEach(function (p) { p.busVote = null; if (p.voted) { p.cnt.votes++; if (!isW(p) && isW(p.voted)) p.cnt.right++; } });
      var maxV = 0, tops = [];
      Object.keys(votes).forEach(function (k) { if (votes[k] > maxV) { maxV = votes[k]; tops = [+k]; } else if (votes[k] === maxV) tops.push(+k); });
      var exP = P[tops[Math.floor(rng() * tops.length)]];
      var exNk = SSK && A.some(function (p) { return p.voted === exP && SSK.nk(S, p, exP); }) ? SSK.NOTE : '';
      /* 票の内訳（誰が誰に入れたか）。次の日からの「昨日の投票」の推理は、この記録から選ぶ */
      votesByDay[day] = { ex: exP, v: A.map(function (p) { return { p: p, to: p.voted, pre: p.preVoted }; }) };
      var vb = {}; A.forEach(function (p) { if (p.voted) (vb[p.voted.i] = vb[p.voted.i] || []).push(p.name); });
      var vbTxt = Object.keys(vb).sort(function (a, b) { return vb[b].length - vb[a].length; }).map(function (k) { return P[k].name + 'に' + vb[k].length + '票（' + vb[k].join('・') + '）'; }).join('、');
      exP.alive = false; executed.push(exP); exP.fate = '処刑（' + day + '日目）';
      var lw = (isW(exP) ? J.lastW : J.lastV)[exP.persona] || (isW(exP) ? J.lastW : J.lastV).gentle;
      say({ actors: [exP.i], tag: '処刑', kind: 'climax', text: F(pk(J.exec), { x: exP.name }) + F(pk(lw), { x: exP.name }), why: '得票 ' + maxV + '／' + A.length + (tops.length > 1 ? '（同票からくじ引き）' : '') + '・' + exP.name + 'は' + ROLE[exP.role] + (policy !== 'gray' && policy !== 'none' && exP === polT ? '（方針「' + POLICY_LABEL[policy] + '」どおり）' : '') + exNk + '／票の内訳：' + vbTxt });
      if (exP.ally) { exP.ally.ally = null; exP.ally = null; }
      winner = check(); if (winner) break;

      /* ---------- 夜 ---------- */
      ST.step(S, day + '日目・夜');
      A = alive();
      divine();
      var guard = null;
      if (hunter && hunter.alive) {
        var gc = A.filter(function (q) { return q !== hunter && q !== guardLast; });
        guard = gc.sort(function (a, b) { var va = (claimants().indexOf(a) >= 0 ? 60 * (hunter.belief[a.i] == null ? 0.5 : hunter.belief[a.i]) : 0) + (medCO.indexOf(a) >= 0 ? 20 : 0) + a.acc * 12 - hunter.sus[a.i] * 0.4, vb2 = (claimants().indexOf(b) >= 0 ? 60 * (hunter.belief[b.i] == null ? 0.5 : hunter.belief[b.i]) : 0) + (medCO.indexOf(b) >= 0 ? 20 : 0) + b.acc * 12 - hunter.sus[b.i] * 0.4; return vb2 - va; })[0];
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
      if (prey && prey === guard) { guardOK++; peaceDay = day + 1; hunter.savedDay = day + 1; moments.push(hunter.name + 'が' + prey.name + 'を守り抜いた'); say({ actors: [], tag: '平和な朝', text: pk(J.peace), why: '狩人の' + hunter.name + 'が' + prey.name + 'を守った' + rogueNote }); }
      else if (prey && HK.Dark.skip(S, 'night')) { peaceDay = day + 1; say({ actors: [], tag: '平和な朝', text: pk(J.peace.filter(function (t) { return !/狩人|護衛|守り抜/.test(t); })), why: '人狼は、この夜は誰も襲わなかった（' + HK.Dark.tag(S, 'night') + '）' }); }
      else if (prey) { prey.alive = false; killed.push(prey); prey.killedDay = day + 1; prey.fate = '襲撃（' + (day + 1) + '日目の朝）'; if (prey.ally) { prey.ally.ally = null; prey.ally = null; } say({ actors: [prey.i], tag: '襲撃', text: F(pk(J.killed), { x: prey.name }), why: '人狼の戦法「' + PLAN_LABEL[plan.kill] + '」' + rogueNote + nkNote }); }
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
/* @event-ok 台詞を3本に（口調直し第8回） */
