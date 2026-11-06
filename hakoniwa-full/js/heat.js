/* @event-ok 温度 6 段（HK.Heat）の部品。新しい出来事ではない（温度を読む部屋の夜の場面に、きっかけ・事後・変化の一文を足すだけ。2026-11-06） */
/* 箱庭シミュレーター: 温度 6 段（HK.Heat）（かたまり pack-sim。両ビルド。設計は docs/reports/2026-11-06/heat-design.md）
   どのエッチも「二人が今どういう関係で、どんな気分か」で温度が決まり、きっかけ・エッチの型・台詞・事後が同じ温度を読む。
   6 段：fresh 初々しい／sweet 甘い／play じゃれ合い／dry ドライ／rough 荒い／warped 歪んだ
   ■ 温度は部屋が HK.Heat.use(scenId[, { forceGate }]) で登録したときだけ働く（HK.Heat.enabled(scenId)）。既存の箱庭は登録しないので、今までどおり夜の色（HK.EroFlavor）で決まり、結果は変わらない
   ■ HK.Heat.of(ctx, a, b, opt) → { key, base, shifted, why, force, forceOk, mood }（a＝攻め・b＝受け。乱数を使わない）
       opt：{ first, rel（'lover'・'casual'…）, kind（部屋の夜の種：'naka' 仲直り・'jeal' やきもち）, flavor（乗客の性格の色）, force（合意のない場面として組んでいる）, scen }
   ■ HK.Heat.flavor(key, a, b)：6 段 → 夜の色（長い場面の opt.flavor に渡す）
   ■ HK.Heat.remember(ctx, a, b, key)・HK.Heat.last(ctx, a, b)：その回の二人ごとの前回の温度（モブとは覚えない。保存済みの記録には触れない）
   ■ HK.Heat.scope(ctx, a, b, h, fn)：温度の場面のあいだ HK.Heat.cur を置く（HK.Play の重み・飽きない決まり、体の特徴の溶かした文が読む）
   ■ HK.Heat.lead／after／change：きっかけの一文・事後の型の一文・変化の一文（文は下の r18 の印の中。全年齢では ''）
   ■ HK.Heat.move(ctx, h, a, b)：場面のあとに気分を動かす（HK.Emo）
   ■ HK.Heat.log：点検用（配列を入れると、温度の場面ごとに記録する。heat-audit.js）
   全年齢（HK.SAFE_ON）では of は動くが、文は '' で、部屋も夜の場面を組まない。登場人物はすべて成人として扱う */
(function () {
  'use strict';
  var HK = window.HK;
  if (!HK || HK.Heat) return;
  var KEYS = ['fresh', 'sweet', 'play', 'dry', 'rough', 'warped'];
  var LABEL = { fresh: '初々しい', sweet: '甘い', play: 'じゃれ合い', dry: 'ドライ', rough: '荒い', warped: '歪んだ' };
  var FLAVOR = { fresh: 'sweet', sweet: 'sweet', play: 'deal', dry: 'dry', rough: 'rough', warped: 'rough' };
  var H = HK.Heat = { KEYS: KEYS, LABEL: LABEL, FLAVOR: FLAVOR, ROOMS: {}, log: null, cur: null, stack: [], lines: {} };

  /* ---------- 部屋の登録 ---------- */
  H.use = function (scenId, o) { if (scenId) H.ROOMS[scenId] = Object.assign({ on: true }, o || {}); };
  H.enabled = function (scenId) { return !!(scenId && H.ROOMS[scenId] && H.ROOMS[scenId].on); };
  function scenOf(ctx) {
    if (!ctx) return '';
    if (ctx.input && ctx.input.scenId) return ctx.input.scenId;
    if (ctx.S && ctx.S.input && ctx.S.input.scenId) return ctx.S.input.scenId;
    if (ctx.scen && ctx.scen.id) return ctx.scen.id;
    return HK._curCtx && HK._curCtx.input ? HK._curCtx.input.scenId || '' : '';
  }
  H.scenOf = scenOf;
  H.on = function (ctx) { return !HK.SAFE_ON && H.enabled(scenOf(ctx)); };

  /* ---------- 部品 ---------- */
  function nm(c) { return String((c && c.name) || ''); }
  function pid(a, b) { return [nm(a), nm(b)].sort().join('\u0001'); }
  function h01(s) {
    var h = 2166136261; s = String(s); if (HK.Voice && HK.Voice.markOut) s = HK.Voice.markOut(s);
    for (var i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
    h ^= h >>> 13; h = Math.imul(h, 0x5bd1e995); h ^= h >>> 15;
    return (h >>> 0) / 4294967296;
  }
  function memOf(ctx) { return ctx ? (ctx._heatMem = ctx._heatMem || { pair: {}, used: {}, n: 0 }) : { pair: {}, used: {}, n: 0 }; }
  function isMob(c) { return !!(c && c.mob); }
  function tiesOf(ctx, a, b) {
    var ty = {};
    try { if (HK.Ties && HK.Ties.all && ctx && a && b && a.i != null && b.i != null) HK.Ties.all(ctx, a, b).forEach(function (t) { if (t && t.type) ty[t.type] = t; }); } catch (e) { /* 関係を引けなければ無し */ }
    /* 物語型（電車など）の関係の表 S.ties */
    if (ctx && Array.isArray(ctx.ties) && !Object.keys(ty).length && a && b) ctx.ties.forEach(function (t) { if (t && ((t.a === a.i && t.b === b.i) || (t.a === b.i && t.b === a.i))) ty[t.type] = t; });
    return ty;
  }
  function emo(c, k) { return c && c.emo && typeof c.emo[k] === 'number' ? c.emo[k] : 0; }
  /* 二人の気分（35 以上でいちばん高いもの）と、怒り・火照りの高いほう */
  function moodOf(a, b) {
    var best = 'calm', bv = 34, mx = {};
    ['joy', 'grief', 'fear', 'anger', 'shame', 'lust'].forEach(function (k) {
      var v = Math.max(isMob(a) ? 0 : emo(a, k), isMob(b) ? 0 : emo(b, k));
      mx[k] = v;
      if (v > bv) { bv = v; best = k; }
    });
    return { top: best, v: bv, anger: mx.anger, lust: mx.lust, shame: mx.shame, joy: mx.joy };
  }
  H.moodOf = moodOf;
  function obsLv(ctx, a, b) {
    var O = HK.Obsess; if (!O || !O.level || !ctx || !ctx.R) return 0;
    try { return Math.max(O.level(ctx, a, b) || 0, O.level(ctx, b, a) || 0); } catch (e) { return 0; }
  }
  function warmOf(ctx, a, b) {
    if (!ctx || !ctx.R || a.i == null || b.i == null) return 0;
    try { return Math.min(ctx.R(a, b).aff || 0, ctx.R(b, a).aff || 0); } catch (e) { return 0; }
  }
  function forceOk(ctx, scen) {
    var C = HK.Content; if (!C || !C.on) return false;
    try { return !!C.on(ctx && ctx.env, 'force', scen); } catch (e) { return false; }
  }

  /* ---------- 決め方 ---------- */
  H.of = function (ctx, a, b, opt) {
    opt = opt || {};
    var scen = opt.scen || scenOf(ctx), ty = tiesOf(ctx, a, b), why = [];
    var pf = null; try { pf = ctx && ctx.pair && a && b && a.i != null && b.i != null && !isMob(a) && !isMob(b) ? ctx.pair(a, b) : null; } catch (e) { pf = null; }
    var prev = H.last(ctx, a, b);
    var first = opt.first != null ? !!opt.first : !prev && !(pf && (pf.nights > 0));
    /* 始める前から恋人・夫婦・番の二人（関係の設定）は、部屋が初めてと言わない限り初めて扱いにしない（もう重ねてきた二人） */
    if (opt.first == null && (ty.lover || ty.spouse || ty.mate || ty.fated)) first = false;
    var lover = !!(ty.lover || ty.spouse || ty.mate || ty.fated || (pf && pf.couple) || opt.rel === 'lover');
    var base;
    if (isMob(a) || isMob(b)) {
      base = { sweet: 'fresh', deal: 'play', rough: 'rough', dry: 'dry' }[opt.flavor] || 'dry';
      why.push('相手が乗客');
    } else if (ty.yan || ty.abuse || (ty.worship && ty.worship.cold === 'dominate') || (HK.fearHeld && HK.fearHeld(a, b)) || obsLv(ctx, a, b) >= 60) {
      base = 'warped'; why.push(ty.yan ? '執着' : ty.abuse ? '支配' : ty.worship ? '信仰の支配' : HK.fearHeld && HK.fearHeld(a, b) ? '恐怖' : '執着');
    } else if (ty.enemy || ty.bad) { base = 'rough'; why.push('敵対・不仲'); }
    else if (lover || ty.crush || ty.almost || ty.honmei || (pf && pf.kin)) { base = first ? 'fresh' : 'sweet'; why.push((lover ? '恋人' : pf && pf.kin ? '家族' : '想い合う二人') + (first ? '・初めて' : '・二度目以降')); }
    else if (ty.childhood || ty.buddy || ty.best || ty.friend || ty.classmate || ty.twin || ty.comrade) { base = first ? 'fresh' : 'play'; why.push('気心の知れた二人' + (first ? '・初めて' : '')); }
    else if (ty.fwb || (pf && pf.fwb) || opt.rel === 'casual') { base = warmOf(ctx, a, b) >= 50 ? 'play' : 'dry'; why.push('体だけの相手'); }
    else if (ty.ex || ty.rival) { base = 'play'; why.push('駆け引きの相手'); }
    else if (ty.colleague || ty.boss || ty.senpai || ty.mentor || ty.teacher || ty.master) { base = 'dry'; why.push('割り切った相手'); }
    else { base = first ? 'fresh' : 'dry'; why.push(first ? '初めて' : '割り切り'); }
    /* ずらし：いちばん高い気分で一段 */
    var md = moodOf(a, b), key = base;
    if (opt.kind === 'naka') { key = base === 'warped' ? base : 'sweet'; why.push('仲直りの直後'); }
    else if (opt.kind === 'jeal' && base !== 'warped') { key = 'rough'; why.push('やきもち'); }
    else if ((md.anger >= 50 || md.lust >= 85) && base !== 'warped') { key = 'rough'; why.push(md.anger >= 50 ? '怒り' : '火照り'); }
    else if (md.top === 'shame') { key = { sweet: 'fresh', play: 'fresh', dry: 'play' }[base] || base; if (key !== base) why.push('恥じらい'); }
    else if (md.top === 'joy') { key = { dry: 'play', play: 'sweet', rough: 'play' }[base] || base; if (key !== base) why.push('喜び'); }
    /* 合意のない場面：温度は入口を作らない。部屋が合意のない場面として組んでいれば force、許すかは内容のスイッチのまま */
    var fOk = forceOk(ctx, scen), room = H.ROOMS[scen] || {};
    if (room.forceGate && (key === 'rough' || key === 'warped') && !fOk) { key = 'dry'; why.push('内容のスイッチ「無理矢理」が切'); }
    var h = { key: key, base: base, shifted: key !== base, first: first, prev: prev, why: LABEL[key] + '（' + why.join('・') + '）', force: !!opt.force, forceOk: fOk, mood: md, scen: scen };
    return h;
  };
  H.label = function (k) { return LABEL[k] || ''; };
  H.flavor = function (key, a, b) {
    var f = FLAVOR[key] || 'sweet';
    if (f === 'rough' && a && b && HK.Pos && HK.Pos.hardTop && HK.Pos.hardTop(b, a)) f = 'deal';
    return f;
  };
  H.remember = function (ctx, a, b, key) {
    if (!ctx || !a || !b || isMob(a) || isMob(b) || !LABEL[key]) return;
    var M = memOf(ctx), p = M.pair[pid(a, b)] = M.pair[pid(a, b)] || { n: 0, keys: [] };
    p.n++; p.keys.push(key); p.last = key;
  };
  H.last = function (ctx, a, b) {
    if (!ctx || !a || !b || isMob(a) || isMob(b)) return '';
    var p = memOf(ctx).pair[pid(a, b)];
    return p ? p.last || '' : '';
  };

  /* ---------- 場面の区切り ---------- */
  H.scope = function (ctx, a, b, h, fn) {
    var sc = { ctx: ctx, a: a, b: b, h: h, key: h && h.key, scen: h && h.scen, plays: [], feat: [], featN: 0 };
    H.stack.push(sc); H.cur = sc;
    try { return fn(sc); } finally { H.stack.pop(); H.cur = H.stack.length ? H.stack[H.stack.length - 1] : null; }
  };

  /* ---------- 文を選ぶ（種から。同じ回で同じ文を続けない） ---------- */
  function pickK(ctx, arr, key) {
    if (!arr || !arr.length) return '';
    var M = memOf(ctx), l = arr.filter(function (t) { return !M.used[t]; });
    if (!l.length) { l = arr.slice(); arr.forEach(function (t) { delete M.used[t]; }); }
    var t = l[Math.floor(h01(key + '\u0002' + (M.n++)) * l.length) % l.length];
    M.used[t] = 1;
    return t;
  }
  function fill(t, a, b) { return String(t || '').replace(/\{a\}/g, '{a}').replace(/\{b\}/g, '{b}'); }
  function modeOf(a, b) {
    var P = HK.Pos; if (!P) return 'mf';
    if (P.ff && P.ff(a, b)) return 'ff';
    if (P.isF && P.isF(a, b) && !P.isF(b, a) && !(P.hasM && P.hasM(a))) return 'fm';
    return 'mf';
  }
  H.modeOf = modeOf;
  function seedOf(ctx) { return ctx && ctx.input ? ctx.input.seed : ctx && ctx.seed; }
  /* きっかけの段に足す温度の一文（{a}{b} のまま返す） */
  H.lead = function (ctx, h, a, b) {
    if (HK.SAFE_ON || !h) return '';
    var L = H.lines.LEAD && H.lines.LEAD[h.key];
    return fill(pickK(ctx, L, 'lead' + seedOf(ctx) + pid(a, b) + h.key), a, b);
  };
  /* 部屋だけの事後の型（2026-11-06。部屋のオリジナルの文 8 割の決まり）：H.addAfter(部屋の id, 温度, 組, [文…])。
     登録した部屋・温度・組では、共通の 3 文の代わりにその部屋の文から選ぶ（車内の文・登録の無い温度と組は共通の文のまま） */
  H.ROOM_AFTER = {};
  H.addAfter = function (scenId, key, mode, list) {
    if (!scenId || !key || !list || !list.length) return;
    var r = H.ROOM_AFTER[scenId] = H.ROOM_AFTER[scenId] || {}, k = r[key] = r[key] || {};
    (k[mode || 'mf'] = k[mode || 'mf'] || []).push.apply(k[mode || 'mf'], list);
  };
  /* 事後の型の一文：温度 × 組（mf・ff・fm）。opt.spot が車内なら車内の文 */
  H.after = function (ctx, h, mode, opt) {
    if (HK.SAFE_ON || !h) return '';
    var A = H.lines.AFTER || {}, sp = opt && opt.spot, RA = ((H.ROOM_AFTER[h.scen || scenOf(ctx)] || {})[h.key] || {})[mode || 'mf'];
    var L = sp === 'car' ? (H.lines.AFTER_CAR || {})[h.key] : RA && RA.length ? RA : (A[h.key] || {})[mode || 'mf'];
    if (L && sp && sp !== 'car' && HK.SexSpot && HK.SexSpot.filter) { var f = HK.SexSpot.filter(L, sp); if (f && f.length) L = f; }
    var t = pickK(ctx, L, 'after' + seedOf(ctx) + h.key + (mode || ''));
    if (H.cur) H.cur.after = t;
    return t;
  };
  /* 変化の一文：前回の温度と違うときだけ。同じ二人で同じ文は 1 回まで */
  var PREV_W = { fresh: 'ぎこちなかった', sweet: 'あんなに甘かった', play: '笑いながらふざけ合っていた', dry: 'どこか素っ気なかった', rough: 'あれほど荒っぽかった', warped: '息が詰まるほど重苦しかった' };
  H.PREV_W = PREV_W;
  H.change = function (ctx, h, a, b, opt) {
    if (HK.SAFE_ON || !h || !h.prev || h.prev === h.key || isMob(a) || isMob(b)) return '';
    var L = H.lines.CHANGE && H.lines.CHANGE[h.key]; if (!L || !L.length) return '';
    var M = memOf(ctx), pu = M.chg = M.chg || {}, k0 = pid(a, b), seen = pu[k0] = pu[k0] || {};
    var l = L.filter(function (t) { return !seen[t]; }); if (!l.length) return '';
    var t = l[Math.floor(h01('chg' + seedOf(ctx) + k0 + (M.n++)) * l.length) % l.length];
    seen[t] = 1;
    t = t.replace(/\{前\}/g, PREV_W[h.prev] || '');
    /* 夜でない場面（朝の電車など）は「今夜」「前の夜」を言わない */
    if (opt && opt.day) t = t.replace(/前の夜/g, '前のとき').replace(/今夜/g, '今日');
    if (H.cur) H.cur.change = t;
    return t;
  };
  /* 場面のあとに気分を動かす（HK.Emo）。動かせたら真 */
  var MOVE = {
    fresh: [{ joy: 12, shame: 10 }, { joy: 14, shame: 14 }], sweet: [{ joy: 14 }, { joy: 16 }], play: [{ joy: 10 }, { joy: 10 }],
    dry: [{ lust: -20 }, { lust: -20 }], rough: [{ anger: -18, lust: -15 }, { anger: -10, shame: 8 }], warped: [{ joy: 8 }, { fear: 8, shame: 8 }]
  };
  H.move = function (ctx, h, a, b) {
    if (!h || !HK.Emo || !HK.Emo.bump) return false;
    var mv = MOVE[h.key] || MOVE.sweet, any = false;
    [[a, mv[0]], [b, mv[1]]].forEach(function (q) { if (q[0] && !isMob(q[0]) && q[0].emo) { HK.Emo.bump(ctx, q[0], q[1]); any = true; } });
    return any;
  };
  /* 点検用の記録（HK.Heat.log が配列のときだけ） */
  H.note = function (ctx, h, a, b, o) {
    if (!Array.isArray(H.log) || !h) return;
    var sc = (o && o.sc) || H.cur || {};
    H.log.push(Object.assign({ scen: h.scen, seed: seedOf(ctx), a: nm(a), b: nm(b), mob: isMob(a) || isMob(b), key: h.key, base: h.base, prev: h.prev || '', why: h.why, force: h.force, forceOk: h.forceOk,
      anger: h.mood ? h.mood.anger : 0, plays: (sc.plays || []).slice(), feat: (sc.feat || []).slice(), after: sc.after || '', change: sc.change || '' }, o || {}, { sc: undefined }));
  };

  /* ---------- HK.Play の重み（温度の場面のあいだ。play-r18.js の P.choose が読む） ----------
     値は掛ける倍率（0 は選ばない）。甘い・初々しいに押し倒す・嫉妬・押さえつけ・言葉責め・目隠しを出さない */
  H.PLAY = {
    sweet: { entry: { kiss: 3, push: 0, jealous: 0, hurry: 0.5, backhug: 1.5 }, focus: { zenshin: 2, kotoba: 0 }, prop: { mekakushi: 0 }, pos: { osae: 0, seijo: 1.5, zai: 1.5 }, finish: { issho: 2 } },
    fresh: { entry: { kiss: 2, push: 0, jealous: 0, hurry: 0, whisper: 0.5 }, focus: { jirashi: 2.5, te: 1.5, kotoba: 0 }, prop: { chakui: 2, mekakushi: 0, omocha: 0 }, pos: { osae: 0, seijo: 2 }, finish: { renzoku: 0, issho: 1.5 } },
    play: { entry: { amae: 3, whisper: 1.5, push: 0.5 }, focus: { kuchi: 1.5, mimi: 1.5 }, pos: { kijo: 2 }, finish: { again: 1.5 } },
    dry: { entry: { hurry: 3, kiss: 0.5, nekomi: 0, amae: 0.5 }, focus: { zenshin: 0, te: 1.5 }, finish: { soto: 1.5, issho: 0.5 } },
    rough: { entry: { push: 3, hurry: 2, kiss: 0.3, amae: 0 }, focus: { kotoba: 1.5 }, pos: { osae: 2, back: 1.5 }, finish: { issho: 0.5 } },
    warped: { entry: { whisper: 2, push: 1.5, amae: 0 }, focus: { kotoba: 3, jirashi: 1.5 }, prop: { mekakushi: 3 }, pos: { osae: 3 } }
  };
  /* 甘い・初々しいの夜に出さない型の値（点検と同じ） */
  H.ROUGH_PLAY = { entry: { push: 1, jealous: 1 }, focus: { kotoba: 1 }, pos: { osae: 1 }, prop: { mekakushi: 1 } };
  H.weigh = function (axis, w) {
    var sc = H.cur; if (!sc || !sc.key) return w;
    var T = (H.PLAY[sc.key] || {})[axis]; if (!T) return w;
    Object.keys(T).forEach(function (k) { if (w[k] != null) w[k] = w[k] * T[k]; });
    return w;
  };
  /* 文の候補を温度で絞る（甘い・初々しい：荒い入り方の文を外す／荒い・ドライ・歪んだ：甘い事後の文を外す。残らなければ元のまま） */
  H.ROUGH_RE = /押し倒|組み敷|(?<!に)縛[っらりるれろ]|(?<!に)縛り|拘束|手首を(?:押さえ|一つにまとめ|頭上)|頭上で押さえ|ねじ伏せ/;
  H.SWEET_AFTER_RE = /腕枕|額に(?:キス|口づけ|唇)|髪を撫で/;
  function reOf(key) { return key === 'sweet' || key === 'fresh' ? H.ROUGH_RE : /^(?:rough|dry|warped)$/.test(key || '') ? H.SWEET_AFTER_RE : null; }
  H.trim = function (list, stage, key) {
    key = key || (H.cur && H.cur.key);
    var re = reOf(key);
    if (!list || !list.length || !re || !Array.isArray(list)) return list;
    var o = list.filter(function (t) { return !(typeof t === 'string' ? re.test(t) : t && typeof t.t === 'string' && re.test(t.t)); });
    return o.length ? o : list;
  };
  /* 部屋の選び方（pick）を包む：温度の場面のあいだだけ、候補を温度で絞る */
  H.pickWrap = function (pick) {
    return function (arr) { return pick(H.cur && Array.isArray(arr) ? H.trim(arr) : arr); };
  };
  /* 仕上げ：甘い・初々しいの場面の始まりの 2 段から荒い入り方の地の文（押し倒す・組み敷く・拘束…）を、荒い・ドライ・歪んだの場面の最後の 2 段から甘い事後の地の文
     （腕枕・額にキス・髪を撫で）を外す（台詞を含む文と、段が空になる外し方はしない） */
  H.strip = function (text, key) {
    var re = reOf(key);
    if (typeof text !== 'string' || !re) return text;
    var ps = text.split('\n\n'), n = ps.length, soft = re === H.ROUGH_RE;
    for (var i = soft ? 0 : Math.max(0, n - 2); i < (soft ? Math.min(2, n) : n); i++) {
      if (!re.test(ps[i])) continue;
      /* 台詞の閉じ（」）のすぐあとに地の文が続くところでも区切る（「…しましょう」{a}は{b}の手首を押さえたまま…」の地の文を台詞と一緒に残さないように。2026-11-06） */
      var ss = ps[i].replace(/」(?=[^とっ、。をにがはもの…―」\s\u2060])/g, '」\u0001').split('\u0001').reduce(function (o, q) { return o.concat(q.match(/[^。！？]+[。！？]+|[^。！？]+$/g) || [q]); }, []);
      var keep = ss.filter(function (x) { return /[「」]/.test(x) || !re.test(x); });
      if (keep.length && keep.length < ss.length && keep.join('').replace(/\s/g, '')) ps[i] = keep.join('');
      /* 外せない（段がその一文だけ）甘い・初々しいの「押し倒す」は、そっと横たえる言い方に */
      else if (soft) ps[i] = ps[i].replace(/押し倒さ(?=れ)/g, 'そっと横たえら').replace(/押し倒そ(?=う)/g, 'そっと横たえよ').replace(/押し倒す/g, 'そっと横たえる').replace(/押し倒し/g, 'そっと横たえ');
    }
    return ps.join('\n\n');
  };

  /* ---------- 体格差・体の特徴の文を「主語にせず動作の中に溶かす」（温度の場面のあいだだけ。段 2.5 の (c)） ----------
     HK.Attr.featLines を溶かした文の表に差し替え、一回のエッチに 2 文まで。連続させない決まり（A.featPick）はそのまま */
  var A = HK.Attr;
  H.MELT_MAX = 2;
  function meltOn() { return !!(H.cur && !HK.SAFE_ON && H.MELT && H.MELT.feat); }
  if (A && A.featLines && A.featPick && A.pairLine && HK.wrap) {
    HK.wrap(A, 'featLines', function (fl0) {
      return function (k, kind) {
        if (meltOn() && k && k !== 'note' && k.indexOf('look:') !== 0 && kind !== 'look') { var l = H.MELT.feat[k]; if (l && l.length) return l; }
        return fl0.apply(this, arguments);
      };
    });
    HK.wrap(A, 'featPick', function (fp0) {
      return function (owner, c, opt) {
        if (meltOn() && !(opt && opt.kind === 'look')) {
          if (H.cur.featN >= H.MELT_MAX) return '';
          /* 体の感触・抱き方の文は、溶かした文のある特徴だけ（その他の種族の名前・目につく特徴の文は主語の文なので選ばない） */
          if (opt && (opt.kind === 'touch' || opt.kind === 'hold')) {
            var k0 = opt.keys, o2 = Object.assign({}, opt, { keys: function (k) { return !!H.MELT.feat[k] && (!k0 || (typeof k0 === 'function' ? k0(k) : k0.indexOf(k) >= 0)); } });
            return fp0.call(this, owner, c, o2);
          }
        }
        return fp0.apply(this, arguments);
      };
    });
    HK.wrap(A, 'featUse', function (fu0) {
      return function (owner, c, k, opt) {
        if (meltOn() && k && !(opt && opt.kind === 'look')) { H.cur.featN++; H.cur.feat.push({ who: nm(c), k: k, kind: (opt && opt.kind) || '', melt: !!(H.MELT.feat[k]) }); }
        return fu0.apply(this, arguments);
      };
    });
    /* 二人の場面の一文：体格差の文も溶かした文に。胸の文・身長の文は温度の場面では出さない（主語が体の部分の独立した文のため） */
    HK.wrap(A, 'pairLine', function (pl0) {
      return function (a, b, kind, pick, owner) {
        if (!meltOn() || kind === 'look') return pl0.apply(this, arguments);
        if (!a || !b || H.cur.featN >= H.MELT_MAX) return '';
        var pk = typeof pick === 'function' ? pick : function (l) { return l[0]; };
        var c = [], sd = A.sizeDiff ? A.sizeDiff(a, b) : '';
        if (sd && H.MELT.size) c.push({ t: pk(H.MELT.size[sd === 'a>b' ? 'big' : 'small']) });
        [a, b].forEach(function (x) { var k = A.featPick(owner, x, { kind: kind, pick: pick, peek: true }); if (k && H.MELT.feat[k]) c.push({ k: k, x: x, o: x === a ? b : a }); });
        if (!c.length) return '';
        var it = c.length === 1 ? c[0] : pk(c);
        if (!it.k) { H.cur.featN++; H.cur.feat.push({ who: nm(a), k: 'size', kind: kind, melt: true }); return String(it.t).replace(/\{a\}/g, nm(a)).replace(/\{b\}/g, nm(b)); }
        A.featUse(owner, it.x, it.k, { kind: kind });
        return A.featText(it.x, it.k, kind, pick, it.o, owner);
      };
    });
  }

  /* r18:begin */
  function L(s) { return s.split('|'); }
  function M3(o) { var r = {}; Object.keys(o).forEach(function (k) { r[k] = L(o[k]); }); return r; }
  /* きっかけの文の系統（札 LEAD_TAG）。{a}＝攻め・{b}＝受け。地の文だけ */
  H.LEAD_TAG = { fresh: 'ためらい', sweet: '名前を呼ぶ', play: 'からかい', dry: '言葉のいらない', rough: '収まらない熱', warped: '離さない' };
  H.lines.LEAD = M3({
    fresh: '{b}は、自分の心臓の音が{a}にまで聞こえてしまいそうで、なかなか顔を上げられなかった。|{a}の指先がためらうように止まり、{b}も同じくらいぎこちなく、その手に自分の手を重ねた。|二人とも、どこから始めればいいのか分からないまま、しばらく黙って見つめ合っていた。',
    sweet: '{a}が{b}の名前を呼ぶ声は、昼間よりずっと柔らかかった。|{b}が振り向くより先に、{a}はその肩にそっと額を寄せた。言葉にしなくても、今夜がどんな夜になるかは二人とも分かっていた。|灯りを落とした部屋で、{a}は{b}の指に自分の指を一本ずつ絡めていった。',
    play: '{b}がからかうように笑い、{a}も負けじと笑い返した。そのまま、どちらからともなく距離が縮まった。|{a}が冗談めかして袖を引くと、{b}は呆れた顔をしながらも、その手を振りほどかなかった。|ふざけ合っているうちに、二人の笑い声が少しずつ低く、熱を帯びたものに変わっていった。',
    dry: '余計な言葉はいらなかった。二人とも、何のために向き合っているのか分かっていた。|{a}は短く目で合図をした。{b}は小さく頷いて、それ以上は何も訊かなかった。|甘い前置きもないまま、{a}は{b}の手首を軽く引いた。それで十分だった。',
    rough: '{a}の目には、まだ収まりきらない熱が残っていた。{b}はその目から逃げなかった。|言いたいことを全部飲み込んだまま、{a}は{b}との距離を一息に詰めた。|{b}の言葉を最後まで聞かず、{a}は荒い息のまま{b}を引き寄せた。',
    warped: '{a}は{b}の手を掴んだまま、決して離そうとしなかった。どこへも行かせない、とその指が言っていた。|{a}の視線は、{b}だけを見ていた。ほかのものは何ひとつ映っていない目だった。|{b}が少しでも身を引こうとすると、{a}はその分だけ静かに距離を詰めた。'
  });
  /* 事後の型：温度 × 組（mf＝男性器のある攻め・ff＝女性どうし・fm＝女性の攻め×男性の受け）× 3 文。寝床の語を使わない（場所を選ばない） */
  H.lines.AFTER = {
    fresh: M3({
      mf: '果てたあと、{b}は火照った顔を両手で隠してしまった。{a}がそっとその手をどけると、{b}は恥ずかしそうに笑った。|{a}は、まだ震えの残る{b}の肩に上着をかけた。{b}は目を合わせられないまま、小さな声で礼を言った。|息が落ち着くと、二人は顔を見合わせて、どちらからともなく照れくさそうに笑い出した。',
      ff: '{b}は{a}の胸元に顔をうずめたまま、しばらく顔を上げようとしなかった。耳まで赤く染まっていた。|{a}が乱れた{b}の髪を指で整えると、{b}はくすぐったそうに肩をすくめて、はにかんだ。|二人は並んで息を整えながら、さっきまでのことを思い出しては、目が合うたびに笑ってしまった。',
      fm: '{b}は乱れた服の前を慌てて合わせ、真っ赤な顔で{a}から目を逸らした。{a}はその様子を見て、くすりと笑った。|{a}が{b}の額の汗を指で拭うと、{b}は照れくさそうに、それでも嬉しそうに目を細めた。|息が整うと、{b}はおずおずと{a}の手を探して、指先だけをそっと握った。'
    }),
    sweet: M3({
      mf: '{a}は{b}を腕枕にして、その額に口づけを落とした。{b}は満ち足りた顔で、{a}の胸に頬を寄せた。|果てたあとも、{a}は{b}を抱きしめたまま離さなかった。{b}の髪を撫でる手は、どこまでも優しかった。|{b}が小さく{a}の名前を呼ぶと、{a}は額にキスをして、もう一度だけ抱き寄せた。|{a}は{b}の肩まで上掛けを引き上げ、その髪に唇を寄せた。{b}は安心しきった顔で、{a}の腕に頬をすり寄せた。|{b}が{a}の指に自分の指を絡めると、{a}はその手を口元に運んで、指先にそっと口づけた。|二人は額を合わせたまま、しばらく黙って笑い合った。{a}の手が、{b}の背中をゆっくりと撫で続けていた。',
      ff: '{a}は{b}の髪を撫でながら、何度も額に口づけた。{b}は{a}の腕の中で、満ち足りた吐息をこぼした。|二人は指を絡めたまま、しばらく黙って寄り添っていた。言葉はいらない、穏やかな時間だった。|{b}が{a}の肩に頭を預けると、{a}はその髪にそっと頬を寄せた。|{a}は{b}の背中に腕を回したまま、その耳元で小さく{b}の名前を呼んだ。{b}は嬉しそうに目を細めて、{a}の首筋に顔をうずめた。|{b}が眠たげに瞬きをすると、{a}はその瞼にそっと唇を落とした。{b}は満ち足りた顔で、{a}の胸元に寄り添った。|二人は額をくっつけて、くすぐったそうに笑い合った。絡めた指を、どちらもほどこうとしなかった。',
      fm: '{a}は{b}の胸に頬を乗せて、早いままの鼓動に耳を澄ませた。{b}の手が、{a}の髪をゆっくりと撫でた。|{b}は{a}を腕枕にして、その額に口づけた。{a}は満足そうに目を閉じた。|{a}は{b}の頬に手を添えて、ゆっくりと唇を重ねた。終わったあとのキスは、始まる前よりずっと甘かった。|{b}は{a}の背中を抱き寄せて、その髪に顔をうずめた。{a}は{b}の胸に耳を当てたまま、静かに目を閉じた。|{a}が{b}の指に自分の指を絡めると、{b}はその手を引き寄せて、手の甲にそっと口づけた。|二人は額を合わせたまま、しばらく黙って見つめ合った。{b}の手が、{a}の背中をいつまでも撫でていた。'
    }),
    play: M3({
      mf: '息が整うと、{b}は{a}の脇腹をつついて「＠{b}＠さっき、すごい顔してた｜……さっき、すごい顔をしていたな｜……さっき、すごいお顔をされていましたよ」とからかった。{a}は笑って、{b}の頬をつまみ返した。|{a}が{b}の耳元で何かを囁くと、{b}は吹き出して、{a}の肩を軽く叩いた。二人の笑い声が、部屋にしばらく残った。|果てたあとも、二人はくすぐり合ってはじゃれ合い、最後は息を切らして笑いながら並んで寝転んだ。',
      ff: '{b}は{a}の頬を指でつついて、「＠{b}＠次は{一人称}の番だからね｜……次は{一人称}の番だ｜……次は{一人称}の番ですからね」と悪戯っぽく笑った。{a}は肩をすくめて笑い返した。|二人は額をくっつけたまま、くすくすと笑い合った。さっきまでの熱が、心地よいおかしさに変わっていた。|{a}が{b}の脇腹をくすぐると、{b}は身をよじって笑い、お返しに{a}の首筋に噛みつくふりをした。',
      fm: '{a}は{b}の胸の上に顎を乗せて、得意げに笑った。{b}は呆れたように笑い、{a}の髪をくしゃくしゃにかき混ぜた。|息が落ち着くと、{b}は{a}の手を取って、指の一本ずつに噛みつくふりをした。{a}はくすぐったそうに笑い声を上げた。|二人は顔を見合わせて吹き出した。真剣だったのがおかしくて、しばらく笑いが止まらなかった。'
    }),
    dry: M3({
      mf: '終わると、{a}は何も言わずに体を離し、背を向けて息を整えた。{b}もそれを気にする様子はなかった。|{b}は黙って服を拾い上げ、手早く身につけた。二人のあいだに、余計な言葉はひとつもなかった。|{a}は乱れた服を整えると、短く「＠{a}＠……じゃあ、おやすみ｜……では、おやすみ｜……では、おやすみなさい」とだけ言った。それだけで十分だった。',
      ff: '{a}は乱れた髪を手ぐしで整えると、何事もなかったように服を着直した。{b}も黙って、その横で身支度をした。|息が落ち着くと、二人は互いに背を向けたまま、それぞれの服を探した。|{b}は脱ぎ捨てた服を拾いながら、{a}のほうを振り返りもしなかった。それが二人の決まりのようなものだった。',
      fm: '{a}は手を拭うと、さっさと服を着直した。{b}は天井を見上げたまま、黙って息を整えていた。|終わると、{b}は{a}に背を向けて、黙って服を身につけた。{a}も引き止めはしなかった。|{a}は乱れた襟元を直しながら、「＠{a}＠先に行くね｜……先に行く｜……先に失礼しますね」とだけ言った。{b}は短く頷いた。'
    }),
    rough: M3({
      mf: '{a}は荒い息のまま体を離した。{b}の肌には、強く掴まれた指の痕が赤く残っていた。|果てたあとも、{a}の呼吸はなかなか落ち着かなかった。{b}はぐったりと横たわったまま、乱れた息を吐いていた。|{a}は額の汗を乱暴に拭うと、まだ熱の引かない目で{b}を見下ろした。{b}はその視線から目を逸らさなかった。',
      ff: '{b}の首筋には、{a}が噛んだ痕がくっきりと残っていた。{a}はそれを見下ろして、荒い息をついた。|二人ともしばらく口がきけなかった。乱れた息だけが、静かな部屋に響いていた。|{a}は{b}から体を離すと、まだ震えている自分の指先をじっと見つめた。',
      fm: '{a}は{b}から手を離し、荒い息のまま身を起こした。{b}の腰には、きつく掴まれた痕が残っていた。|{b}はぐったりと体を投げ出したまま、しばらく息が整わなかった。{a}はその様子を、熱の残る目で見下ろしていた。|{a}は乱れた髪をかき上げ、何も言わずに{b}を見た。{b}もまた、黙ってその目を見返した。'
    }),
    warped: M3({
      mf: '果てたあとも、{a}は{b}の手首を握ったまま離さなかった。「＠{a}＠どこにも行かせない｜……どこにも行かせない｜……どこにも行かせませんよ」と、低い声が耳元に落ちた。|{a}は{b}の首筋に残した痕を、確かめるように指でなぞった。{b}は身じろぎもできずに、その指の動きを感じていた。|{a}は{b}の指に自分の指を絡め、ほどけないように固く握りしめた。{b}の目には、怯えとも諦めともつかない色が浮かんでいた。',
      ff: '{a}は{b}の髪をひと房すくい取り、自分の指に巻きつけた。逃がさない、と言うように。|{b}が身を起こそうとすると、{a}は無言でその肩を押し戻した。{b}は、それ以上動けなかった。|{a}は{b}の耳元で、何度も{b}の名前を繰り返した。そのたびに、{b}の肩が小さくすくんだ。',
      fm: '{a}は{b}の顔のすぐ上から、その目をじっと覗き込んでいた。{b}は目を逸らすこともできなかった。|{a}は{b}の手首の内側に、自分の痕を一つずつ残していった。{b}はただ、それを受け入れていた。|{a}は{b}の頬に手を添えて、「＠{a}＠{二人称}は{一人称}のものだから｜……{二人称}は{一人称}のものだ｜……{二人称}は{一人称}のものですから」と囁いた。{b}は何も答えられなかった。'
    })
  };
  /* 車内（電車の終点前）の事後の型：温度ごとの 3 文（組を問わない書き方） */
  H.lines.AFTER_CAR = M3({
    fresh: '電車が揺れるたび、{b}は顔を伏せたまま、乱れた服の前をぎゅっと握りしめていた。|{b}は真っ赤な顔で窓の外ばかり見ていた。{a}の顔を、どうしても見られなかった。|{b}はうつむいたまま、小さく息を整えた。耳の先まで赤く染まっていた。',
    sweet: '{a}は、{b}が倒れないように、揺れる車内でそっと腰を支えていた。|{b}が吊り革を握り直すと、{a}はその手に自分の手を重ねて、駅に着くまで離さなかった。|人の波に押されながらも、{a}は{b}の背中を庇うように立っていた。',
    play: '{b}が肘で{a}をつつくと、{a}は素知らぬ顔で窓の外を眺めた。口元だけが笑っていた。|{a}と{b}は顔を見合わせ、声を殺して小さく笑った。|{b}がわざとらしく咳払いをすると、{a}は肩を震わせて笑いをこらえた。',
    dry: '{a}は何事もなかったように吊り革を握り直し、{b}にはもう目もくれなかった。|{b}は乱れた服を手早く直すと、黙って扉のほうを向いた。|二人は言葉もなく、ただ次の駅のアナウンスを聞いていた。',
    rough: '{b}の手首には、さっき強く掴まれた痕が赤く残っていた。{b}はそれを袖で隠した。|{b}は扉にもたれたまま、荒い息を必死に整えていた。|{a}はまだ熱の引かない目で、{b}の背中をじっと見ていた。',
    warped: '{a}は{b}の手を握ったまま、降りる駅に着いても離そうとしなかった。|{b}が人混みに紛れようとすると、{a}の手がすぐにその腕を捕まえた。|{a}の視線は、扉が開くまでずっと{b}の背中に張りついていた。'
  });
  /* 変化の一文：今の温度ごとに 3 本。{前}＝前回の温度の言い方（PREV_W） */
  H.lines.CHANGE = M3({
    fresh: '前の夜は{前}のに、今夜の二人は、まるで初めてのようにぎこちなかった。|前のときは{前}のに、今夜はなぜか、指先が触れるだけで{b}の頬が熱くなった。|前の夜は{前}のに、今夜の{a}は、壊れものに触れるように手を伸ばしていた。',
    sweet: '前の夜は{前}のに、今夜の{a}の手は、最初から最後までどこまでも優しかった。|前のときは{前}のに、今夜の二人は、何度も確かめるように見つめ合った。|前の夜は{前}のに、今夜の{b}は、自分から{a}に身を預けていた。',
    play: '前の夜は{前}のに、今夜の二人は、途中で何度も笑い出してしまった。|前のときは{前}のに、今夜の{b}は、悪戯っぽい目で{a}をからかい続けた。|前の夜は{前}のに、今夜は肩の力が抜けて、じゃれ合うように触れ合った。',
    dry: '前の夜は{前}のに、今夜の二人は、どこか淡々としていた。|前のときは{前}のに、今夜の{a}は、ほとんど口をきかなかった。|前の夜は{前}のに、今夜は言葉も甘さもないまま、二人は体を重ねた。',
    rough: '前の夜は{前}のに、今夜の{a}は、どこか余裕をなくしていた。|前のときは{前}のに、今夜の二人は、ぶつけ合うように求め合った。|前の夜は{前}のに、今夜の{a}の手には、遠慮というものがまるでなかった。',
    warped: '前の夜は{前}のに、今夜の{a}の目には、暗い熱が宿っていた。|前のときは{前}のに、今夜の{a}は、{b}を逃がさないように抱きすくめていた。|前の夜は{前}のに、今夜の{a}の指は、{b}の手首から一度も離れなかった。'
  });
  /* 体格差・体の特徴を動作の中に溶かした文（主語は人か手・指。{c}＝その特徴の人・{o}＝相手）。特徴 10 種 × 3 本・体格差 大／小 × 3 本 */
  H.MELT = {
    feat: M3({
      ear: '{o}は{c}の耳の付け根を指でなぞりながら、もう片方の手で{c}を引き寄せた。|{o}が獣の耳に唇を寄せて息を吹きかけると、{c}は喉の奥で小さく鳴いた。|{o}は伏せられた{c}の耳ごと髪をかき上げて、そのこめかみに口づけた。',
      tail: '{c}は無意識のうちに、尻尾を{o}の脚に巻きつけて引き寄せていた。|{o}が尻尾の付け根を撫で上げるたび、{c}は腰を小さく跳ねさせた。|{c}は揺れる尻尾で{o}の手首を絡め取り、自分の腰へと導いた。',
      fang: '{c}は牙を立てないように気をつけながら、{o}の首筋に唇を押し当てた。|{o}の肩口を甘噛みする{c}の唇から、小さな牙の先がのぞいた。|{c}は鋭い牙で{o}の唇を傷つけないよう、ゆっくりと口づけを深めた。',
      horn: '{o}は{c}の角の根元を指でなぞりながら、その首筋に唇を寄せた。|{c}は角が当たらないよう首を傾けて、{o}の唇を塞いだ。|{o}が角を握って{c}の顔を上向かせると、{c}は抗わずに目を閉じた。',
      wing: '{c}は翼を広げて、{o}の体ごと包み込むように抱き寄せた。|{o}が羽の付け根を撫でるたび、{c}は背を反らせて息をこぼした。|{c}は震える翼で{o}の背中を覆い、そのまま強く抱きしめた。',
      trans: '{o}は、触れるたびに淡く透ける{c}の腕を、確かめるように何度も握り直した。|{c}は輪郭が揺らがないよう、{o}の手に指を絡めて強く握った。|{o}がうっすら透ける{c}の肩に口づけると、その輪郭が少しだけ確かになった。',
      cold: '{o}は、{c}のひんやりした指先に背を跳ねさせながらも、その手を離さなかった。|{c}は冷たい手のひらで{o}の熱い頬を包み、ゆっくりと唇を重ねた。|{o}は冷えた{c}の体を抱き寄せて、自分の体温を移すように肌を重ねた。',
      eye: '{c}は暗がりで淡く光る瞳で、{o}の顔をすぐそばから覗き込んだ。|{o}は光る瞳に見つめられたまま、{c}の頬に手を添えて唇を寄せた。|{c}は光る目を細めて、{o}の表情をひとつも見逃さないように見つめた。',
      drive: '{c}は駆動音を低く鳴らしながら、力加減を確かめるように{o}の腰を抱いた。|{o}は、一定の温度に保たれた{c}の肌に頬を寄せ、そのまま首筋に口づけた。|{c}は{o}の反応をひとつずつ覚え込むように、指先の動きを細かく変えていった。',
      immortal: '{c}は、限りのある{o}の体温を確かめるように、何度もその肌に手のひらを押し当てた。|{c}は{o}の鼓動を聞くように胸元へ耳を寄せ、そのまま唇を落とした。|{o}は傷ひとつない{c}の肌に指を滑らせ、そこに自分の痕を残した。'
    }),
    size: {
      big: L('{a}の大きな手が、{b}の腰を丸ごと抱え込んで引き寄せた。|{a}は小柄な{b}の体を胸に閉じ込めるようにして、その首筋に唇を寄せた。|{a}は{b}の背中を片手ですっぽり支えながら、もう片方の手で顎をすくい上げた。'),
      small: L('{a}は背伸びをして、自分より大きな{b}の首に腕を回し、ぐいと引き寄せた。|{a}は小さな手で{b}の広い胸に触れ、その鼓動を確かめるように身を寄せた。|{a}は見上げるほどの{b}の顎を指先で引き下ろして、唇を奪った。')
    }
  };
  /* r18:end */
})();
