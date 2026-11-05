/* 箱庭シミュレーター: 今日から同居生活の同居の仕組み（両ビルド。かたまり scen-futari。HK.FutariHouse。2026-11-04 担当FT）
   scenario-futari.js（HK.FutariCore）の区切り・節目から呼ばれ、同居の出来事を足す。文は futari-text.js（HK.FutariT）。
   ■ なじみ（ぎこちなさ）awk（二人ずつ 0〜100。同じ家に住む二人だけ）
     ・はじめ：知らない人どうし 72／同僚・知り合い 55／友人 36／家族 26／両片想い 34／恋人 18／夫婦 10。内気・冷静・厳格は少し高く、奔放・穏やかは少し低く
     ・一緒にいる区切りごとに少しずつ下がり、すれ違いの決着（話し合い・笑い話は下がる／我慢・言い合いは上がる）・季節の行事・家出のケンカで動く
     ・慣れてきた印（58・38・20 を下回ったとき。3 段）。恋愛はなじみしだい：惹かれの育ち（gate）・友人（68 未満）・両片想い（40 未満）・告白（28 未満。知らない人どうしは日数の半分ほど一緒に暮らしてから）
   ■ 同居の理由（REASON 6 種。おまかせは関係から）・初対面の挨拶（態度 9 種 × 9 種）・最初の夜・最初の決まりごと（家事の分担）
   ■ 住人ごとの欄（perFields）：家事（よくする・料理が得意・苦手・しない）・生活時間（朝型・夜型）・片づけ（きれい好き・散らかしがち）。おまかせは気質から
     ・家事をしない人は、どの分担でも家事・料理の担い手にしない（このファイルの家事の出来事・すれ違いの文・日常の部品 daily-kit の家事・料理の出来事、scenario-futari.js の ft_cook）
   ■ 出来事：生活のすれ違い 8 種（受け止め方は態度 9 種、決着は我慢・張り紙・話し合い・笑い話・言い合い。運命の揺らぎでらしくない受け止め方）・家事の分担・生活時間・
     季節の行事の日（月ごと 15 種）・家を出て行くケンカ（と帰ってくる日・同居人の仲裁）・他の住人の訪れと連絡（名簿の参加していない住人。元恋人ならやきもち）・
     恋人が二組の同居（組ごとの時間・ダブルデート・ヤキモチ・応援・壁の薄さ）・一人を三人で取り合う・恋人のいる人の気持ちが揺れる（と、組が入れ替わる別れ）・キス（HK.Kiss）
   ■ 結末：親友になった二人（bff）・ぎくしゃくのまま出て行く二人（leave）、家ぜんたいの終わり（HOUSE_END）、記録の数（stats）
   台詞は3本（futari-text.js）。登場人物はすべて成人として扱う */
/* @event scen=futari id=ft_reason cat=bond tie=- label=同居することになったわけ */
/* @event scen=futari id=ft_greet cat=bond tie=- cond=知らない人どうし label=初対面の二人のぎこちない挨拶 */
/* @event scen=futari id=ft_firstnight cat=bond tie=- label=同居の最初の夜の気まずさ */
/* @event scen=futari id=ft_rules cat=bond tie=- label=最初に決めた家事の分担 */
/* @event scen=futari id=ft_settle cat=bond tie=- label=同じ家に慣れてきた印 */
/* @event scen=futari id=ft_month cat=bond tie=- label=季節の行事の日を一緒に過ごす */
/* @event scen=futari id=ft_leave cat=conflict tie=- label=ケンカして家を出て行ってしまう */
/* @event scen=futari id=ft_away cat=solo tie=- label=出て行った人を一人で待つ */
/* @event scen=futari id=ft_mediate cat=help tie=- label=同居人が家出の仲直りを取り持つ */
/* @event scen=futari id=ft_back cat=help tie=- label=家出から帰ってきて仲直り */
/* @event scen=futari id=ft_exjeal cat=conflict tie=- label=元恋人の訪れに同居人が妬く */
/* @event scen=futari id=ft_waver_seen cat=conflict tie=lover label=恋人の気持ちの揺れに気づく */
/* @event scen=futari id=ft_switch cat=conflict tie=lover label=気持ちが移って恋人と別れる */
/* @event scen=futari id=ft_house_end cat=bond tie=- cond=三人・四人 label=同居の家ぜんたいの最後の夜 */
(function () {
  'use strict';
  var HK = window.HK;
  if (!HK || !HK.FutariCore) return;
  var FC = HK.FutariCore, K = FC.K;
  function TX() { return HK.FutariT || {}; }
  var H = HK.FutariHouse = {};
  var OPP = { proud: 'shy', stern: 'free', tsun: 'gentle', gentle: 'proud', devoted: 'cool', cool: 'devoted', free: 'stern', shy: 'proud', polite: 'free' };
  var RES_N = { gaman: '言えずに我慢', memo: '張り紙で知らせる', talk: '話し合って決まりを一つ', laugh: '笑い話になった', spat: '言い合いになった' };
  var MODE_N = { duty: '当番制', skill: '得意な人が受け持つ', loose: '気づいた人がやる' };

  /* ---------- 状態 ---------- */
  function hs(ctx) { return ctx.ft && ctx.ft.house; }
  function house(ctx, a, b) { var h = hs(ctx); return !!(h && h.on && a && b && FC.sameHome(ctx, a, b)); }
  function awk(ctx, a, b) { return house(ctx, a, b) ? FC.stOf(ctx, a, b).awk || 0 : 0; }
  function addAwk(ctx, a, b, d) { if (!house(ctx, a, b)) return; var x = FC.stOf(ctx, a, b); x.awk = Math.max(0, Math.min(100, (x.awk || 0) + d)); }
  function pf(ctx, c) { var h = hs(ctx); return (h && h.prof[c.i]) || { chore: 'norm', clock: 'norm', tidy: 'norm' }; }
  function pickOf(ctx, c, k) { var p = ctx.input && ctx.input.perChar && ctx.input.perChar[c.i]; var v = p && p.pick ? p.pick[k] : null; return v && v !== 'auto' ? v : null; }
  function tr(c) { return c.tr || {}; }
  H.canChore = function (ctx, c) { return pf(ctx, c).chore !== 'none'; };
  /* 毎日の種（futari-days.js）が使う：住人ごとの欄・家事の分担・同居の理由・ぎこちなさ・家の呼び方 */
  H.prof = function (ctx, c) { return pf(ctx, c); };
  H.mode = function (ctx) { var h = hs(ctx); return h ? h.chores : ''; };
  H.reasonKey = function (ctx) { var h = hs(ctx); return h ? h.reason : ''; };
  H.awk = function (ctx, a, b) { return awk(ctx, a, b); };
  H.on = function (ctx, a, b) { return house(ctx, a, b); };
  /* 古い家の留守番は「シェアハウス」と呼ばない（2026-11-04・遊んで確かめた報告 1104 の B12） */
  H.homeName = function (ctx) { var h = hs(ctx), f = ctx.ft; if (h && h.reason === 'house') return '預かった古い家'; return f && f.liv === 'share' ? 'シェアハウス' : '自宅'; };
  H.cookGood = function (ctx, c) { var k = pf(ctx, c).chore; return k !== 'none' && k !== 'clumsy'; };
  function per(c) { return FC.att(c); }
  function rp(ctx, arr) { return arr && arr.length ? arr[Math.floor(ctx.rng() * arr.length)] : ''; }
  function names(list) { var n = list.map(function (c) { return c.name; }); return n.length === 2 ? n[0] + 'と' + n[1] : n.slice(0, -1).join('・') + 'と' + n[n.length - 1]; }
  function stat(ctx, k, d) { var h = hs(ctx); if (h) h.n[k] = (h.n[k] || 0) + (d == null ? 1 : d); }

  /* ---------- 準備 ---------- */
  function autoChore(c) { var t = tr(c); if (t.np < 0.2 && t.cp < 0.3 && t.fc > 0.6) return 'none'; if (t.np > 0.72) return 'much'; if (t.a > 0.62 && t.np > 0.42) return 'cook'; if (t.fc > 0.7 && t.cp < 0.35) return 'clumsy'; return 'norm'; }
  function autoClock(c) { var t = tr(c); if (t.fc > 0.62 && t.a < 0.5) return 'night'; if (t.cp > 0.6 || (t.a > 0.62 && t.ac > 0.5)) return 'morning'; return 'norm'; }
  function autoTidy(c) { var t = tr(c); if (t.cp > 0.65 || t.a > 0.75) return 'neat'; if (t.fc > 0.62 && t.a < 0.45) return 'messy'; return 'norm'; }
  var FRIENDLY = /^(friend|best|buddy|childhood|benefactor|almost|crush)$/, FAMILY = /^(parent|sibling|sibprot|sibclose|twin|stepsib|relative|pparent)$/, COLD = /^(enemy|bad|sibbad|rival|abuse|fear|apathy|noobs)$/;
  function awk0(ctx, a, b) {
    var x = FC.stOf(ctx, a, b), ts = HK.Ties ? HK.Ties.all(ctx, a, b) || [] : [], ty = ts.map(function (t) { return t.type; }).join(' ');
    var v = 72;
    if (ts.some(function (t) { return t.spouse; })) v = 10;
    else if (x.s >= 3) v = 18;
    else if (x.s === 2) v = 34;
    else if (ts.some(function (t) { return FAMILY.test(t.type); })) v = 26;
    else if (ts.some(function (t) { return FRIENDLY.test(t.type); })) v = 36;
    else if (ts.some(function (t) { return COLD.test(t.type); })) v = 66;
    else if (ty) v = 55;
    [a, b].forEach(function (c) { var p = per(c); if (/^(shy|cool|stern)$/.test(p)) v += 4; else if (/^(free|gentle)$/.test(p)) v -= 4; });
    return Math.max(5, Math.min(90, v));
  }
  H.setup = function (ctx) {
    var f = ctx.ft, C = ctx.chars, env = ctx.env || {};
    var h = f.house = { on: f.liv !== 'apart', prof: {}, away: {}, used: {}, n: { rubs: 0, rules: 0, settle: 0, leaves: 0, visits: 0 }, month: {}, monthDay: -1, settleDay: -1, wanted: null };
    C.forEach(function (c) { h.prof[c.i] = { chore: pickOf(ctx, c, 'chore') || autoChore(c), clock: pickOf(ctx, c, 'clock') || autoClock(c), tidy: pickOf(ctx, c, 'tidy') || autoTidy(c) }; });
    /* 家事の分担：おまかせは住人から（料理が得意・家事をしない人がいれば得意な人が、厳しい人が多ければ当番制、ほかは決めない） */
    var md = /^(duty|skill|loose)$/.test(env.chores) ? env.chores : null;
    if (!md) {
      var cp = 0; C.forEach(function (c) { cp += tr(c).cp || 0; }); cp /= Math.max(1, C.length);
      md = C.some(function (c) { return /^(none|cook)$/.test(h.prof[c.i].chore); }) ? 'skill' : cp > 0.55 ? 'duty' : 'loose';
    }
    h.chores = md;
    /* 同居の理由 */
    var R = TX().REASON || {}, keys = TX().REASON_KEYS || Object.keys(R), known = false;
    for (var i = 0; i < C.length; i++) for (var j = i + 1; j < C.length; j++) if (FC.st(ctx, C[i], C[j]) >= 1) known = true;
    var rs = R[env.reason] ? env.reason : null;
    if (!rs) { var cand = known ? ['rent', 'fire', 'recruit', 'house', 'work'] : ['rent', 'recruit', 'fire', 'parents', 'work']; rs = cand[Math.floor(ctx.rng() * cand.length)]; }
    h.reason = keys.indexOf(rs) >= 0 ? rs : 'rent';
    if (!h.on) return;
    for (var p = 0; p < C.length; p++) for (var q = p + 1; q < C.length; q++) { var x = FC.stOf(ctx, C[p], C[q]); x.awk = x.awk0 = awk0(ctx, C[p], C[q]); x.lv = x.awk <= 20 ? 3 : x.awk <= 38 ? 2 : x.awk <= 58 ? 1 : 0; x.rules = []; x.rubT = {}; }
  };

  /* ---------- 恋愛はなじみしだい ---------- */
  H.gate = function (ctx, a, b) { if (!house(ctx, a, b)) return 1; var v = awk(ctx, a, b); return Math.max(0.12, Math.min(1, 1.0 - v / 65)); };
  H.ready = function (ctx, a, b, kind) {
    if (!house(ctx, a, b)) return true;
    var v = awk(ctx, a, b), f = ctx.ft, x = FC.stOf(ctx, a, b), st = (x.awk0 || 0) >= 60;
    /* 知らない人どうしは、一緒に暮らした日数も要る（両片想いは日数の 4 分の 1、告白は半分ほど。友人どうしはその半分） */
    /* 恋愛の進み「ゆっくり」：両片想い・告白までの日数の下限を上げる（2026-11-04・遊んで確かめた報告 1104 の B16：ゆっくりでも 4 日目に告白と初夜） */
    var sl = ctx.env && ctx.env.pace === 'slow';
    if (kind === 'pining') return v < (sl ? 34 : 40) && f.day >= Math.round(f.days * (sl ? 0.4 : st ? 0.25 : 0.12));
    if (kind === 'confess') return v < (sl ? 22 : 28) && f.day >= Math.round(f.days * (sl ? 0.6 : st ? 0.45 : 0.25)) && (!sl || f.day - (x.at[2] == null ? f.day : x.at[2]) >= 2);
    return kind === 'friend' ? v < 68 : true;
  };

  /* ---------- 日常の部品（daily-kit）の出来事を、同居の決まりで絞る ---------- */
  var COOK_ID = /^(d_cook|d_cookfail|d_breakfast|d_g_nabe)$/, CHORE_ID = /^(d_clean|d_tidy|d_g_duty|d_k_chores)$/;
  H.dailyOk = function (ctx, id, a, b) {
    if (!hs(ctx)) return true;
    if (COOK_ID.test(id) || CHORE_ID.test(id)) { if (!H.canChore(ctx, a) || (b && !H.canChore(ctx, b))) return false; }
    if (id === 'd_station_bye' && b && FC.sameHome(ctx, a, b)) return false;
    return true;
  };

  /* ---------- 始まりの場面 ---------- */
  function emitT(ctx, actors, cat, t, why, ex, tag, fx) {
    if (!t) return null;
    return FC.emit(ctx, { actors: actors, cat: cat, text: FC.fill(ctx, t, actors[0], actors[1], actors[2] || null, ex), why: why, tag: tag, fx: fx });
  }
  /* 同居の理由の中身と家の持ち主（2026-11-05・遊んで確かめた報告 2 回目の A3：給湯器・火事なのに「水浸し」、取り壊しなのに「修理の終わった部屋」、
     貸してくれた人なのに「会社の借り上げ」、持ち主でない人の「ここ、私の家だし」）。始まりの文（まだ名前を入れる前の文）から、
     理由の中身 h.sub（前の部屋に住めなくなった：water 水漏れ・heater 給湯器・demolish 取り壊し・evict 大家の都合・blaze 火事／仕事：company 借り上げ・lend 部屋を貸してくれた）と、
     家の持ち主 h.owner・来た側 h.mover（人の番号。決まらなければ null）を決める。毎日の種（futari-days.js）と結末は、これを見て文を選ぶ */
  function reasonMeta(ctx, raw, A, B) {
    var h = hs(ctx); if (!h || !raw) return;
    if (h.sub == null) {
      if (h.reason === 'fire') h.sub = /水漏れ|水浸し/.test(raw) ? 'water' : /取り壊|建て替え/.test(raw) ? 'demolish' : /給湯器/.test(raw) ? 'heater' : /大家の都合|部屋を出なければ/.test(raw) ? 'evict' : /火事/.test(raw) ? 'blaze' : null;
      else if (h.reason === 'work') h.sub = /貸してくれた/.test(raw) ? 'lend' : /借り上げ|寮|会社が用意/.test(raw) ? 'company' : null;
    }
    if (h.owner != null || !A || !B) return;
    var ob = /\{b\}の(?:家|部屋の空いた|祖父母の家|住む街)|\{b\}は(?:迷わず、)?自分の家|\{b\}が空いた部屋|私の家に来|\{a\}の(?:部屋の水漏れ|部屋の給湯器|住んでいたアパート|部屋が、上の階)/.test(raw), oa = /\{a\}の(?:親が持っている|遠い親戚)|\{a\}が預かる|\{a\}は、恋人の\{b\}に鍵/.test(raw);
    if (ob) { h.owner = B.i; h.mover = A.i; } else if (oa) { h.owner = A.i; h.mover = B.i; }
  }
  H.reasonMeta = reasonMeta;
  /* 理由の中身（無ければ ''）・家の持ち主と来た側（無ければ null） */
  H.sub = function (ctx) { var h = hs(ctx); return (h && h.sub) || ''; };
  H.owner = function (ctx) { var h = hs(ctx); return h && h.owner != null ? ctx.chars[h.owner] : null; };
  H.mover = function (ctx) { var h = hs(ctx); return h && h.mover != null ? ctx.chars[h.mover] : null; };
  H.intro = function (ctx) {
    var f = ctx.ft, h = hs(ctx), P = ctx.present(), T = TX();
    if (!h || !h.on || !T.REASON) return false;
    var R = T.REASON[h.reason], A = P[0], B = P[1];
    var sp = FC.W(ctx, H.homeName(ctx) + 'の居間');
    /* 恋人どうしの二人：同居の理由（恋人どうしの文）→ 関係の始まり（scenario-futari.js の introTie）（2026-11-04・遊んで確かめた報告 1104 の B11：恋人の回は同居の理由が出なかった） */
    if (P.length === 2 && FC.st(ctx, A, B) >= 3) {
      var lvR = (T.REASON_LV || {})[h.reason];
      var lvT = lvR ? FC.fresh(ctx, lvR) : ''; reasonMeta(ctx, lvT, A, B);
      if (lvR) emitT(ctx, [A, B], 'bond', lvT, sp + '同居の理由：' + R.label + '（恋人どうし）', null, 'meet');
      FC.introTie(ctx, A, B);
      return true;
    }
    if (P.length === 2) {
      var s0 = FC.st(ctx, A, B);
      var kn = FC.kinOf ? FC.kinOf(ctx, A, B) : null;
      /* 家族の二人：同居の理由を選んでいれば、その理由の一文を続ける（「親どうしが決めた」が出なかった・義理のきょうだいが「親戚」になった。2026-11-04） */
      var kx = ctx.env && /^(rent|fire|parents|recruit|work|house)$/.test(ctx.env.reason) ? FC.fresh(ctx, (T.REASON_KINX || {})[h.reason]) : '';
      var kt = kn && T.REASON_KIN ? FC.fresh(ctx, kn.step && T.REASON_STEP ? T.REASON_STEP : T.REASON_KIN) + (kx || '') : FC.fresh(ctx, s0 === 0 ? R.s : R.f);
      reasonMeta(ctx, kt, A, B);
      if (kn && T.REASON_KIN) emitT(ctx, [A, B], 'bond', kt, sp + '同居の理由：' + kn.label + 'の二人の同居' + (kx ? '・' + R.label : ''), { rel: kn.label }, 'meet');
      else emitT(ctx, [A, B], 'bond', kt, sp + '同居の理由：' + R.label + (s0 === 0 ? '（知らない人どうし）' : ''), null, 'meet');
      if (s0 === 0) greet(ctx, A, B, sp);
      else FC.introTie(ctx, A, B);
    } else {
      var gt = FC.fresh(ctx, R.g); reasonMeta(ctx, gt, null, null);
      emitT(ctx, P.slice(), 'bond', gt, sp + '同居の理由：' + R.label + '（' + P.length + '人の同居）', { G: names(P), d: P[3] ? P[3].name : '' }, 'meet');
      groupArrive(ctx, P, sp);
      var gn = 0;
      FC.pairs(ctx).forEach(function (p) {
        var s = FC.st(ctx, p[0], p[1]);
        if (s >= 1) { if (s >= 3) FC.introTie(ctx, p[0], p[1]); return; }
        if (gn < 2) { gn++; greet(ctx, p[0], p[1], sp); }
      });
    }
    return true;
  };
  /* 三人・四人の入居の日：家の顔ぶれ（全員知り合い／知らない人どうし／混じる＝目的ばらばら／恋人が二組）で始まりの文を変え、全員分の入居の一文を並べる（不具合リスト 1104 の NO 9） */
  function groupArrive(ctx, P, sp) {
    var T = TX(); if (!T.GROUP_OPEN) return;
    var PS = FC.pairs(ctx), cps = PS.filter(function (p) { return FC.st(ctx, p[0], p[1]) >= 3; }), kn = PS.filter(function (p) { return FC.st(ctx, p[0], p[1]) >= 1; });
    var cpPeople = []; cps.forEach(function (p) { if (cpPeople.indexOf(p[0]) < 0 && cpPeople.indexOf(p[1]) < 0) cpPeople.push(p[0], p[1]); });
    var kind = cps.length >= 2 && cpPeople.length >= 4 ? 'couples2' : kn.length === PS.length ? 'known' : !kn.length ? 'strangers' : 'mixed';
    var t = FC.fresh(ctx, T.GROUP_OPEN[kind]); if (!t) return;
    var done = [];
    if (kind === 'couples2') for (var i = 0; i + 1 < cpPeople.length; i += 2) { var tc = FC.fresh(ctx, T.ARRIVE_CP); if (tc) t += FC.fill(ctx, tc, cpPeople[i], cpPeople[i + 1]); done.push(cpPeople[i], cpPeople[i + 1]); }
    P.forEach(function (c) {
      if (done.indexOf(c) >= 0) return;
      var x = (kind === 'strangers' || kind === 'mixed') && FC.has(ctx, T.PURPOSE) && ctx.rng() < 0.7 ? FC.fresh(ctx, T.PURPOSE) : FC.freshP(ctx, T.ARRIVE, c);
      if (x) t += FC.fill(ctx, x, c, null);
    });
    var KN = { known: '全員もともと知り合い', strangers: '全員が初対面', mixed: '知り合いと初対面が混じる・目的はばらばら', couples2: '恋人が二組' };
    emitT(ctx, P.slice(), 'bond', t, sp + '入居の日（' + P.length + '人。' + KN[kind] + '）', { G: names(P) }, null, function () { for (var i = 0; i < P.length; i++) for (var j = i + 1; j < P.length; j++) ctx.mod2(P[i], P[j], { aff: 2 }, { aff: 2 }); });
  }
  function greet(ctx, a, b, sp) {
    var T = TX(), t1 = FC.freshP(ctx, T.GREET, a), t2 = FC.freshP(ctx, T.GREET_R, b);
    if (t1 || t2) emitT(ctx, [a, b], 'bond', (t1 || '') + (t2 || ''), sp + '初対面の挨拶（' + a.name + 'から）', null, null, FC.relFx(ctx, a, b, { aff: 3 }, { aff: 3 }));
  }

  /* ---------- 区切りの始め ---------- */
  H.phase = function (ctx) {
    var f = ctx.ft, h = hs(ctx), T = TX();
    if (!h) return;
    /* 一日目の夕方：最初の決まりごと（家事の分担） */
    if (h.on && f.day === 0 && f.t === 2 && !h.rulesDone) {
      h.rulesDone = true;
      var P = ctx.present(), a = P[0], b = P[1];
      var tr0 = FC.fresh(ctx, (T.RULES || {})[h.chores]);
      if (a && b && tr0) emitT(ctx, P.length >= 3 ? P.slice() : [a, b], 'bond', P.length >= 3 ? tr0.split('{a}と{b}').join('{G}') : tr0, FC.W(ctx, '自宅の居間') + '最初の決まりごと（家事の分担：' + MODE_N[h.chores] + '）', { G: names(P) }, null);
    }
    /* 家を出て行った人：その日の昼に残った人の一人の場面、帰る日の夕方に帰ってくる */
    Object.keys(h.away).forEach(function (k) {
      var w = h.away[k], c = ctx.chars[+k], o = ctx.chars[w.o];
      if (!c || !o) { delete h.away[k]; return; }
      if (f.t === 1 && !w.alone && !o.gone) {
        w.alone = true;
        emitT(ctx, [o], 'solo', FC.fresh(ctx, T.AWAY_B), FC.W(ctx, '自宅') + c.name + 'が出て行った家で、' + o.name + 'は一人で過ごした', { a: c.name, b: o.name });
        var md = ctx.present().filter(function (x) { return x !== o && FC.together(ctx, x, o); })[0];
        if (md && ctx.rng() < 0.7) emitT(ctx, [md, o], 'help', FC.fresh(ctx, T.MEDIATE), FC.W(ctx, '自宅') + '同居人の仲裁：' + md.name + 'が、' + c.name + 'と' + o.name + 'の仲直りを取り持った', { a: c.name, b: o.name, c: md.name }, null, function () { ctx.mod(o, md, { aff: 4, trust: 4 }); ctx.mod2(c, o, { ten: -8 }, { ten: -8 }); });
      }
      if (f.t === 2 && f.day >= w.back) back(ctx, c, o, w);
    });
    /* 季節の行事の日（夕方。その日の月と日で） */
    if (f.t === 2 && h.monthDay !== f.day) month(ctx);
  };
  function back(ctx, c, o, w) {
    var f = ctx.ft, h = hs(ctx), T = TX();
    c.gone = false; delete h.away[c.i];
    /* 家の持ち主が決まっていて、帰ってきた人がその人でなければ「ここ、私の家だし」を選ばない（A3） */
    var ow = H.owner(ctx), BK = T.BACK;
    if (ow && ow !== c) { BK = {}; Object.keys(T.BACK).forEach(function (k) { BK[k] = T.BACK[k].filter(function (z) { return !/私の家/.test(z); }); }); }
    var x = FC.stOf(ctx, c, o), t = FC.freshP(ctx, BK, c) + (o.gone ? '' : FC.fresh(ctx, T.TAKE));
    var who = o.gone ? ctx.present().filter(function (y) { return y !== c; })[0] : o;
    emitT(ctx, who ? [c, who] : [c], 'help', t, FC.W(ctx, '自宅の玄関') + c.name + 'が' + w.w + 'から帰ってきた（' + (f.day - w.day) + '日ぶり）。仲直り', { b: o.name }, 'back',
      function () { ctx.mod2(c, o, { ten: -25, aff: 4, trust: 3 }, { ten: -25, aff: 4, trust: 3 }); });
    x.spat = false; x.madeUp = f.day; addAwk(ctx, c, o, -6);
  }
  function month(ctx) {
    var f = ctx.ft, h = hs(ctx), T = TX(), dt = FC.dateOf(ctx.env, f.day), rng = ctx.rng;
    var P = ctx.present(), a0 = P[0];
    if (!a0) return;
    var G = P.filter(function (c) { return c === a0 || FC.together(ctx, a0, c); });
    if (G.length < 2) { G = P.filter(function (c) { return c !== a0 && P.filter(function (o) { return o !== c && FC.together(ctx, c, o); }).length; }); if (G.length < 2) return; }
    var ev = (T.MONTH || []).filter(function (m) { return m.m === dt.m && !h.month[m.id] && (m.d ? m.d === dt.d : dt.d >= m.r[0] && dt.d <= m.r[1] && rng() < m.p); })[0];
    if (!ev) return;
    h.month[ev.id] = 1; h.monthDay = f.day;
    var sum = 0, n = 0;
    for (var i = 0; i < G.length; i++) for (var j = i + 1; j < G.length; j++) { sum += h.on ? awk(ctx, G[i], G[j]) : FC.st(ctx, G[i], G[j]) >= 2 ? 20 : 50; n++; }
    var stiff = n && sum / n >= 45, a = G[Math.floor(rng() * G.length)], t = FC.fresh(ctx, stiff ? ev.stiff : ev.warm) || FC.fresh(ctx, stiff ? ev.warm : ev.stiff);
    if (!t) return;
    var rest = G.filter(function (c) { return c !== a; });
    emitT(ctx, [a].concat(rest), 'bond', t, FC.W(ctx, '自宅') + '季節の行事の日：' + ev.name + '（' + FC.dayLabel(ctx.env, f.day) + '）' + (stiff ? '・まだぎこちない' : ''), { G: names(G), R: rest.length === 1 ? rest[0].name : names(rest) }, 'season', function () {
      for (var i2 = 0; i2 < G.length; i2++) for (var j2 = i2 + 1; j2 < G.length; j2++) { ctx.mod2(G[i2], G[j2], { aff: 3 }, { aff: 3 }); addAwk(ctx, G[i2], G[j2], -4); }
    });
  }

  /* ---------- 区切りの終わり：なじみ・慣れてきた印・家を出て行くケンカ・組が入れ替わる別れ ---------- */
  H.after = function (ctx) {
    var f = ctx.ft, h = hs(ctx), T = TX();
    if (!h) return;
    if (h.on) FC.pairs(ctx).forEach(function (p) {
      var a = p[0], b = p[1];
      if (!house(ctx, a, b) || !FC.together(ctx, a, b)) return;
      var x = FC.stOf(ctx, a, b), af = (ctx.R(a, b).aff + ctx.R(b, a).aff) / 2;
      addAwk(ctx, a, b, -0.34 * Math.sqrt(f.g || 1) * (1 + Math.max(0, af) / 100));
      /* 慣れてきた印（一日に一つまで） */
      var TH = [58, 38, 20];
      if (x.lv < 3 && x.awk <= TH[x.lv] && h.settleDay !== f.day && f.day >= 1) {
        var t = FC.fresh(ctx, (T.SETTLE || [])[x.lv]), lv = x.lv;
        x.lv++;
        if (t) { h.settleDay = f.day; stat(ctx, 'settle'); emitT(ctx, ctx.rng() < 0.5 ? [a, b] : [b, a], 'bond', t, FC.W(ctx, FC.spotHere(ctx, a, b)) + '慣れてきた印：' + T.SETTLE_WHY[lv] + '（ぎこちなさ ' + Math.round(x.awk) + '）', null, 'settle', FC.relFx(ctx, a, b, { aff: 2, trust: 2 }, { aff: 2, trust: 2 })); }
      }
    });
    /* 一日目の夜：最初の夜のぎこちなさ */
    if (h.on && f.day === 0 && f.t === 3 && !h.firstDone) {
      h.firstDone = true;
      var P = ctx.present(), fp = FC.pairs(ctx).filter(function (q) { return FC.st(ctx, q[0], q[1]) < 3; })[0];
      var fk = fp && FC.kinOf ? FC.kinOf(ctx, fp[0], fp[1]) : null;
      if (fp) emitT(ctx, fp, 'bond', FC.fresh(ctx, (T.FIRSTNIGHT || {})[fk && T.FIRSTNIGHT.k ? 'k' : FC.st(ctx, fp[0], fp[1]) === 0 ? 's' : 'f']), FC.W(ctx, '自宅') + '同居の最初の夜', fk ? { rel: fk.label } : null, null);
    }
    if (h.on && f.t === 3) leave(ctx);
    if (f.t >= 2) switchCheck(ctx);
  };
  function leave(ctx) {
    var f = ctx.ft, h = hs(ctx), T = TX(), rng = ctx.rng;
    if (f.day < 2 || f.day > f.days - 3 || h.n.leaves >= (f.days >= 14 ? 2 : 1) || Object.keys(h.away).length) return;
    /* 争いの起こりやすさ（環境の strife。50 が既定）：高いほど、低い緊張でも飛び出しやすい（不具合リスト 1104 の NO 6：50 で出て行くケンカが出なかった） */
    var sk = (ctx.env && ctx.env.strife != null ? +ctx.env.strife : 50) / 50, tmin = 46 - 12 * sk, pr = Math.min(0.95, 0.4 + 0.35 * sk);
    if (sk <= 0) return;
    var cand = FC.pairs(ctx).filter(function (p) {
      var a = p[0], b = p[1], x = FC.stOf(ctx, a, b);
      if (!house(ctx, a, b) || !FC.together(ctx, a, b) || FC.onTrip(ctx, a)) return false;
      var ten = Math.max(ctx.R(a, b).ten, ctx.R(b, a).ten);
      return ten >= tmin && f.day - Math.max(x.lastSpat == null ? -9 : x.lastSpat, x.lastRubSpat == null ? -9 : x.lastRubSpat) <= 1;
    });
    if (!cand.length || rng() > pr) return;
    var p = cand[0], a = p[0], b = p[1];
    var hot = function (c, o) { return ctx.R(c, o).ten + (/^(proud|tsun|free)$/.test(per(c)) ? 6 : 0); };
    var lv = hot(a, b) >= hot(b, a) ? a : b, st = lv === a ? b : a, w = rp(ctx, T.WHERE || ['実家']);
    var t = FC.freshP(ctx, T.LEAVE, lv);
    if (!t) return;
    /* 今日の言い合いが記録に無いときは、言い合いの一文から始める（2026-11-04・遊んで確かめた報告 1104 の A6：言い争いの無い家出） */
    var xp = FC.stOf(ctx, a, b);
    var nowF = ctx.log.slice(f.l0 || 0).some(function (e) { return e && e.cat === 'conflict' && e.actors && e.actors.indexOf(a.i) >= 0 && e.actors.indexOf(b.i) >= 0; });
    if (xp.fightDay !== f.day && !nowF && T.LEAVE_PRE) t = (FC.fresh(ctx, T.LEAVE_PRE) || '') + t;
    t += '\n\n' + (FC.fresh(ctx, T.AWAY_A) || '');
    emitT(ctx, [lv, st], 'conflict', t, FC.W(ctx, '自宅の玄関') + '家を出て行ってしまうケンカ：' + lv.name + 'は' + w + 'へ（緊張 ' + Math.round(ctx.R(lv, st).ten) + '）', { w: w }, 'leave', function () { ctx.stress(lv, 12); ctx.stress(st, 10); });
    var x = FC.stOf(ctx, lv, st);
    x.left = (x.left || 0) + 1; x.leftBy = lv.i; stat(ctx, 'leaves'); addAwk(ctx, lv, st, 8);
    h.away[lv.i] = { o: st.i, w: w, day: f.day, back: Math.min(f.days - 1, f.day + 1 + (rng() < 0.4 ? 1 : 0)) };
    lv.gone = true;
  }
  /* 恋人のいる人の気持ちが、同じ家のほかの人へ移った：揺れが二度以上・惹かれが今の恋人より十分に強い・相手も惹かれている・乗り換えてよい（HK.Poly.switchOk） */
  function switchCheck(ctx) {
    var f = ctx.ft, rng = ctx.rng, T = TX(), P = ctx.present();
    P.forEach(function (a) {
      P.forEach(function (L) {
        if (L === a || !FC.couple(ctx, a, L)) return;
        var xl = FC.stOf(ctx, a, L);
        if ((xl.waver || 0) < 2 || xl.married || !FC.together(ctx, a, L)) return;
        var b = P.filter(function (c) { return c !== a && c !== L && FC.loveOk(ctx, a, c) && !FC.couple(ctx, a, c) && ctx.R(a, c).att > ctx.R(a, L).att + 10 && ctx.R(c, a).att >= 38 && HK.Poly && HK.Poly.switchOk(ctx, a, c) && !(HK.lockOut && HK.lockOut(a, c)) && ctx.romanceOk([a, c]); })[0];
        if (!b || rng() > 0.35) return;
        var pp = ctx.pair(a, L);
        pp.couple = false; pp.brokeAt = ctx.stepIndex; xl.broke = true; xl.s = 1; xl.since = f.day; xl.waver = 0;
        var xb = FC.stOf(ctx, a, b); if (xb.s < 2) FC.setSt(ctx, a, b, 2);
        emitT(ctx, [a, L, b], 'conflict', '{a}は、{b}に向き直った。{a}「……ごめん。気持ちが、もう同じじゃない｜……すまない。気持ちが、もう同じではない｜……ごめんなさい。気持ちが、もう同じではないんです」――{b}は長いこと黙っていたが、やがて小さく頷いた。同じ家の中で、{c}は二人の話し声を聞かないようにしていた。',
          FC.W(ctx, '自宅') + '三人の場面・三角関係：' + a.name + 'の気持ちが' + b.name + 'へ移って、' + L.name + 'と別れた（組が入れ替わる）', null, 'break', function () { ctx.mod(L, a, { aff: -10, ten: 12 }); ctx.stress(L, 20); FC.bump(ctx, L, { grief: 30 }, '失恋'); });
      });
    });
  }

  /* ======================= 出来事（エンジンが選ぶ） ======================= */
  /* 旅に出ている人は、その日は家の出来事に出さない（2026-11-04・遊んで確かめた報告 1104 の A7） */
  function addEv(e) { e.noOdd = true; if (!e.tie) e.tie = '-'; var w0 = e.when; e.when = function (ctx, a, b) { if (ctx.ft && (FC.tripAny ? FC.tripAny(ctx) : ctx.ft.trip) && (FC.onTrip(ctx, a) || (b && FC.onTrip(ctx, b)))) return false; return w0.apply(this, arguments); }; FC.EV.push(e); return e; }
  function houseTg(ctx, a, b) { var f = ctx.ft; return !!(f && house(ctx, a, b) && FC.together(ctx, a, b) && !FC.onTrip(ctx, a) && !FC.onTrip(ctx, b) && (f.t !== 1 || f.hol)); }

  /* ---------- 生活のすれ違い ---------- */
  function topicW(ctx, k, a, b) {
    var pa = pf(ctx, a), pb = pf(ctx, b);
    switch (k) {
      case 'clock': return (pa.clock === 'night' && pb.clock === 'morning') || (pa.clock === 'morning' && pb.clock === 'night') ? 3 : pa.clock !== pb.clock ? 0.8 : 0.25;
      case 'clean': return (pa.tidy === 'messy' || pa.chore === 'none' ? 3 : 0.5) * (pb.tidy === 'neat' ? 1.8 : 1);
      case 'laundry': return !H.canChore(ctx, a) ? 0 : pa.chore === 'clumsy' ? 2 : 0.6;
      case 'noise': return pa.clock === 'night' ? 2 : 0.6;
      case 'guest': return 0.5 + (tr(a).fc || 0);
      case 'money': return 0.6;
      default: return 1;
    }
  }
  /* すれ違いの場面の文の時間帯（通し読み 1105：朝の区切りに「昼寝をしていた」）。ctx.ft.t：0 朝・1 昼・2 夕方・3 夜 */
  function sitTime(ctx, t) {
    var tt = ctx.ft ? ctx.ft.t : -1;
    if (/昼寝/.test(t) && tt !== 1 && tt !== 2) return false;
    if (/夕方になっても/.test(t) && tt < 2) return false;
    if (/夜中|夜遅く|夜の長電話/.test(t) && tt === 1) return false;
    return true;
  }
  function sitOk(ctx, t, a) { return (!/作り置き/.test(t) || H.cookGood(ctx, a)) && sitTime(ctx, t); }
  function resPick(ctx, a, b, p, x) {
    var w = { gaman: 1, memo: 1, talk: 1.2, laugh: 0.8, spat: 0.6 }, v = x.awk || 0;
    if (/^(shy|devoted)$/.test(p)) { w.gaman *= 3; w.memo *= 2; w.spat *= 0.3; }
    else if (/^(stern|cool|polite)$/.test(p)) { w.talk *= 2.5; w.memo *= 1.5; w.laugh *= 0.5; }
    else if (/^(free|gentle)$/.test(p)) { w.laugh *= 2.5; w.talk *= 1.5; w.spat *= 0.5; }
    else { w.spat *= 2.5; w.talk *= 1.2; }
    if (v >= 55) { w.laugh *= 0.5; w.gaman *= 1.5; } else if (v < 30) { w.laugh *= 2; w.gaman *= 0.5; }
    if (ctx.R(b, a).ten >= 30) w.spat *= 2;
    if (per(a) === 'free') w.laugh *= 1.3;
    if ((x.rubN || 0) >= 3 && !(x.rules || []).length) w.talk *= 2;
    var ks = Object.keys(w), tot = 0; ks.forEach(function (k) { tot += w[k]; });
    var r = ctx.rng() * tot;
    for (var i = 0; i < ks.length; i++) { r -= w[ks[i]]; if (r <= 0) return ks[i]; }
    return 'talk';
  }
  addEv({ id: 'ft_rub', cat: 'bond', scope: 'pair', label: '生活のすれ違いと、その決着',
    when: function (ctx, a, b) {
      if (!b || !houseTg(ctx, a, b) || ctx.ft.t === 1 && !ctx.ft.hol) return false;
      var x = FC.stOf(ctx, a, b), h = hs(ctx);
      return (x.awk || 0) >= 10 && ctx.ft.day - (x.lastRub == null ? -9 : x.lastRub) >= 1 && (h.rubDay !== ctx.ft.day || h.rubN < 2);
    },
    w: function (ctx, a, b) { var x = FC.stOf(ctx, a, b); return 0.5 + (x.awk || 0) / 35; },
    run: function (ctx, a0, b0) {
      var f = ctx.ft, h = hs(ctx), T = TX(), x = FC.stOf(ctx, a0, b0), RB = T.RUB || {};
      /* すれ違いの種と、原因になった人（{a}）・困った人（{b}）を選ぶ */
      var C = [];
      (T.RUB_KEYS || []).forEach(function (k) {
        [[a0, b0], [b0, a0]].forEach(function (o) {
          var w = topicW(ctx, k, o[0], o[1]) * ((x.rubT[k] || 0) >= 2 ? 0.15 : (x.rubT[k] || 0) ? 0.5 : 1);
          var ok = (RB[k] ? RB[k].sit : []).filter(function (t) { return !f.used[t] && sitOk(ctx, t, o[0]) && (!FC.textOk || FC.textOk(ctx, t)); });
          if (w > 0 && ok.length) C.push({ k: k, a: o[0], b: o[1], w: w, ok: ok });
        });
      });
      if (!C.length) return null;
      var it = HK.weighted(ctx.rng, C, function (c) { return c.w; }), a = it.a, b = it.b, R0 = RB[it.k];
      var sit = rp(ctx, it.ok); f.used[sit] = 1;
      /* 受け止め方：困った人の態度（運命の揺らぎで、らしくない受け止め方） */
      var p = per(b), odd = false;
      if (ctx.chaos && ctx.rng() < ctx.chaos * 0.18) { p = OPP[p] || p; odd = true; }
      var rx = FC.fresh(ctx, (T.REACT || {})[p]) || '';
      var kind = resPick(ctx, a, b, p, x), rule = rp(ctx, R0.rule);
      var resL = ((T.RES || {})[kind] || []).filter(function (t) { return !f.used[t] && (!/片をつけた/.test(t) || H.canChore(ctx, b)); });
      var res = rp(ctx, resL); if (res) f.used[res] = 1;
      x.lastRub = f.day; x.rubN = (x.rubN || 0) + 1; x.rubT[it.k] = (x.rubT[it.k] || 0) + 1;
      if (h.rubDay !== f.day) { h.rubDay = f.day; h.rubN = 0; } h.rubN++;
      stat(ctx, 'rubs');
      if (kind === 'memo' || kind === 'talk') { stat(ctx, 'rules'); x.rules.push(rule); }
      var fx = {
        gaman: function () { ctx.stress(b, 4); ctx.mod(b, a, { ten: 6 }); addAwk(ctx, a, b, 2); },
        memo: function () { ctx.mod(b, a, { ten: 2 }); addAwk(ctx, a, b, -2); },
        talk: function () { ctx.mod2(a, b, { ten: -4, trust: 3 }, { ten: -4, trust: 3 }); addAwk(ctx, a, b, -6); },
        laugh: function () { ctx.mod2(a, b, { aff: 3, ten: -3 }, { aff: 3, ten: -3 }); addAwk(ctx, a, b, -7); },
        spat: function () { ctx.mod2(a, b, { ten: 12, aff: -2 }, { ten: 12, aff: -2 }); addAwk(ctx, a, b, 4); x.spat = true; x.lastRubSpat = f.day; }
      }[kind];
      fx();
      var pa = pf(ctx, a), pb = pf(ctx, b), cause = it.k === 'clock' || it.k === 'noise' ? (pa.clock !== 'norm' ? a.name + 'は' + (pa.clock === 'night' ? '夜型' : '朝型') : '') + (pb.clock !== 'norm' ? (pa.clock !== 'norm' ? '、' : '') + b.name + 'は' + (pb.clock === 'night' ? '夜型' : '朝型') : '')
        : it.k === 'clean' || it.k === 'laundry' ? (pa.chore === 'none' ? a.name + 'は家事をしない' : pa.tidy === 'messy' ? a.name + 'は散らかしがち' : pa.chore === 'clumsy' ? a.name + 'は家事が苦手' : '') + (pb.tidy === 'neat' ? '・' + b.name + 'はきれい好き' : '') : '';
      var ex = { topic: R0.name, rule: rule };
      var text = FC.fill(ctx, sit + rx + (res || ''), a, b, null, ex);
      return { text: text, cat: kind === 'spat' ? 'conflict' : 'bond', odd: odd,
        why: FC.W(ctx, FC.spotHere(ctx, a, b)) + '生活のすれ違い（' + R0.name + '）：' + (cause ? cause + '／' : '') + RES_N[kind] + (odd ? '（' + b.name + 'のらしくない受け止め方）' : '') + '（ぎこちなさ ' + Math.round(x.awk || 0) + '）' };
    } });

  /* ---------- 家事の分担 ---------- */
  addEv({ id: 'ft_chore', cat: 'help', scope: 'pair', label: '家事の分担のひとこま',
    when: function (ctx, a, b) { var h = hs(ctx); return !!b && houseTg(ctx, a, b) && ctx.ft.t !== 1 && h.choreDay !== ctx.ft.day; },
    w: function () { return 1.3; },
    run: function (ctx, a, b) {
      var f = ctx.ft, h = hs(ctx), T = TX(), CH = T.CHORE || {}, pa = pf(ctx, a), pb = pf(ctx, b), t = '', doer = null, why = '';
      var none = pa.chore === 'none' ? a : pb.chore === 'none' ? b : null;
      if (none && ctx.rng() < 0.45) {
        var oth = none === a ? b : a, x = FC.stOf(ctx, a, b);
        t = FC.fresh(ctx, (x.awk || 0) < 35 && ctx.rng() < 0.6 ? CH.noneOk : CH.none) || FC.fresh(ctx, CH.none);
        if (!t) return null;
        h.choreDay = f.day;
        return { text: FC.fill(ctx, t, none, oth), cat: 'bond', with: null, why: FC.W(ctx, '自宅') + '家事の分担：' + none.name + 'は家事をしない（' + MODE_N[h.chores] + '）' };
      }
      var cands = [a, b].filter(function (c) { return H.canChore(ctx, c); });
      if (!cands.length) return null;
      if (h.chores === 'duty') doer = cands[f.day % cands.length];
      else if (h.chores === 'skill') doer = cands.slice().sort(function (x, y) { var r = { cook: 3, much: 2, norm: 1, clumsy: 0 }; return r[pf(ctx, y).chore] - r[pf(ctx, x).chore]; })[0];
      else doer = cands[Math.floor(ctx.rng() * cands.length)];
      var other = doer === a ? b : a, pd = pf(ctx, doer);
      if (pd.chore === 'clumsy' && ctx.rng() < 0.5) { t = FC.fresh(ctx, CH.clumsy); why = doer.name + 'は家事が苦手'; }
      /* 得意な人が受け持つ家：受け持つ人の得意なこと（料理が得意＝料理、家事をよくする＝片づけ・洗濯、ふつう＝ほかの人の苦手を引き受ける）の文（2026-11-04・遊んで確かめた報告 1104 の A4） */
      if (!t) { var pool = h.chores === 'skill' ? (pd.chore === 'cook' ? CH.skillCook : pd.chore === 'much' ? CH.skillMuch : CH.skillNorm) || CH.skill : CH[h.chores]; t = FC.fresh(ctx, pool); why = MODE_N[h.chores] + '・' + doer.name + (h.chores === 'skill' ? '（' + ({ cook: '料理が得意', much: '家事をよくする' }[pd.chore] || '手の空いた人') + '）' : ''); }
      if (!t) return null;
      h.choreDay = f.day;
      ctx.mod(other, doer, { aff: 2, trust: 2 }); addAwk(ctx, a, b, -2);
      return { text: FC.fill(ctx, t, doer, other), why: FC.W(ctx, '自宅') + '家事の分担：' + why };
    } });

  /* ---------- 生活時間のすれ違い（朝型と夜型） ---------- */
  addEv({ id: 'ft_clock', cat: 'bond', scope: 'pair', label: '朝型と夜型の生活のすれ違い',
    when: function (ctx, a, b) { if (!b || !house(ctx, a, b) || a.gone || b.gone) return false; var x = FC.stOf(ctx, a, b), ca = pf(ctx, a).clock, cb = pf(ctx, b).clock; return ca !== cb && ca !== 'norm' && cb !== 'norm' && /^[03]$/.test(String(ctx.ft.t)) && !x.clockSync && ctx.ft.day - (x.clockDay == null ? -9 : x.clockDay) >= 2; },
    w: function () { return 0.8; },
    run: function (ctx, a, b) {
      var x = FC.stOf(ctx, a, b), T = TX(), m = pf(ctx, a).clock === 'morning' ? a : b, n = m === a ? b : a, sync = (x.clockN || 0) >= 1 && (x.awk || 0) < 40;
      var t = FC.fresh(ctx, sync ? T.CLOCK.sync : T.CLOCK.miss);
      if (!t) return null;
      x.clockDay = ctx.ft.day; x.clockN = (x.clockN || 0) + 1; if (sync) { x.clockSync = true; addAwk(ctx, a, b, -5); }
      return { text: FC.fill(ctx, t, m, n), why: FC.W(ctx, '自宅') + (sync ? '生活時間が重なってきた' : '生活時間のすれ違い') + '（' + m.name + 'は朝型、' + n.name + 'は夜型）' };
    } });
  /* 朝型と夜型の場面は、一緒にいない時間（片方が寝ている）なので、together を見ない（when で同じ家だけ） */
  FC.EV[FC.EV.length - 1].scope = 'pair';

  /* ---------- 他の住人（名簿の参加していない住人）の訪れ・連絡 ---------- */
  var OUT = { parent: 'family', sibling: 'family', sibprot: 'family', sibclose: 'family', twin: 'family', stepsib: 'family', relative: 'family', pparent: 'family',
    friend: 'friend', best: 'friend', buddy: 'friend', childhood: 'friend', benefactor: 'friend', acq: 'friend',
    colleague: 'work', boss: 'work', senpai: 'work', classmate: 'work', teacher: 'work', mentor: 'work', ex: 'ex' };
  var OUT_NG = /^(lover|spouse|mate|fated|fiance|fwb|crush|almost|honmei|yan|enemy|bad|sibbad|rival|abuse|master|worship|apathy|fear|noobs)$/;
  var WORD = { parent: '家族', sibling: 'きょうだい', sibprot: 'きょうだい', sibclose: 'きょうだい', twin: 'きょうだい', stepsib: 'きょうだい', relative: '親戚', pparent: '家族同然の人',
    friend: '友人', best: '親友', buddy: '相棒', childhood: '幼なじみ', benefactor: '恩人', acq: '知り合い', colleague: '同僚', boss: '職場の人', classmate: '同級生', teacher: '先生', mentor: '師匠', ex: '元恋人' };
  /* 名簿から：{ i: 参加者の番号, k: family|friend|work|ex, l: 呼び名, n: 名前（出すときだけ） }。一人あたり二人まで */
  H.outsideOf = function (input) {
    var UI = HK.UI, S = UI && UI.state ? UI.state() : null;
    if (!S || !Array.isArray(S.chars) || !Array.isArray(S.ties) || !input || !Array.isArray(input.chars)) return null;
    var byName = {}, dup = {}, byId = {}, idx = {}, out = [], ng = {};
    S.chars.forEach(function (c) { if (!c || !c.name) return; if (byName[c.name]) dup[c.name] = 1; byName[c.name] = c; byId[c.id] = c; });
    input.chars.forEach(function (c, i) { var r = c && byName[c.name]; if (r && !dup[c.name]) idx[r.id] = i; });
    var yes = !(input.env && input.env.outsideNames === 'no');
    S.ties.forEach(function (t) { if (t && (OUT_NG.test(t.type) || t.cold === 'fear' || t.cold === 'apathy')) { ng[t.a + '-' + t.b] = ng[t.b + '-' + t.a] = 1; } });
    S.ties.forEach(function (t) {
      var k = t && OUT[t.type];
      if (!k || t.cold === 'separated' || t.cold === 'divorced') return;
      [[t.a, t.b], [t.b, t.a]].forEach(function (p) {
        var o = byId[p[1]];
        if (idx[p[0]] == null || idx[p[1]] != null || !o || !o.name || dup[o.name] || ng[p[0] + '-' + p[1]]) return;
        if (input.chars.some(function (c) { return c && c.name === o.name; })) return;
        var l = t.type === 'senpai' ? (t.a === p[0] ? '後輩' : '先輩') : t.type === 'teacher' ? (t.a === p[0] ? '教え子' : '先生') : WORD[t.type] || '知り合い';
        var r = { i: idx[p[0]], k: k, l: l }; if (yes) r.n = o.name;
        out.push(r);
      });
    });
    var cnt = {};
    return out.filter(function (o) { cnt[o.i] = (cnt[o.i] || 0) + 1; return cnt[o.i] <= 2; });
  };
  function outs(ctx, c) { return ((ctx.input && ctx.input.outside) || []).filter(function (o) { return o && o.i === c.i && OUT_K.test(o.k); }); }
  var OUT_K = /^(family|friend|work|ex)$/;
  function xName(o) { return o.n ? o.l + 'の' + o.n : o.l; }
  function visitRun(ctx, a, b, kind) {
    var f = ctx.ft, h = hs(ctx), T = TX(), L0 = outs(ctx, a), o = L0.length ? L0[Math.floor(ctx.rng() * L0.length)] : { k: ctx.rng() < 0.6 ? 'friend' : 'family', l: ctx.rng() < 0.6 ? '友人' : '家族' };
    var tb = (T[kind === 'visit' ? 'VISIT' : 'CALL'] || {})[o.k];
    /* 「変な人じゃない？」のような、初対面の同居人を前提にした文は、もともと知り合い・家族の二人には出さない */
    if (FC.st(ctx, a, b) >= 1 || (FC.kinOf && FC.kinOf(ctx, a, b))) tb = (tb || []).filter(function (z) { return !/変な人|どんな人/.test(z); });
    var t = FC.fresh(ctx, tb);
    if (!t) return null;
    h.visitDay = f.day; stat(ctx, 'visits');
    var xn = xName(o), ex = { x: xn };
    /* 元恋人の訪れ・連絡：a の恋人か、a を想う同居人が妬く（すれ違い系） */
    if (o.k === 'ex' && (FC.couple(ctx, a, b) || (FC.loveOk(ctx, b, a) && ctx.R(b, a).att >= 35))) {
      var tj = FC.fresh(ctx, T.EXJEAL);
      if (tj) FC.later(ctx, function () { if (!a.gone && !b.gone) emitT(ctx, [b, a], 'conflict', tj, FC.W(ctx, '自宅') + b.name + 'のやきもち：' + a.name + 'の元恋人' + (o.n ? 'の' + o.n : '') + 'の' + (kind === 'visit' ? '訪れ' : '連絡'), ex, null, function () { ctx.mod(b, a, { ten: 6, att: 2 }); FC.stOf(ctx, a, b).jealDay = ctx.ft.day; }); });
    }
    if (o.k === 'family' || o.k === 'friend') ctx.mod(b, a, { aff: 2 });
    return { text: FC.fill(ctx, t, a, b, null, ex), why: FC.W(ctx, kind === 'visit' ? '自宅の居間' : '自宅') + '他の住人の' + (kind === 'visit' ? '訪れ' : '連絡') + '：' + a.name + 'の' + xn + (o.n ? '' : '（名前は出さない）') };
  }
  addEv({ id: 'ft_visit', cat: 'bond', scope: 'pair', label: '他の住人が家に遊びに来る',
    when: function (ctx, a, b) { var h = hs(ctx), f = ctx.ft; return !!b && FC.sameHome(ctx, a, b) && FC.together(ctx, a, b) && f.hol && /^[12]$/.test(String(f.t)) && h.visitDay !== f.day && h.n.visits < Math.max(2, f.days / 4); },
    w: function (ctx, a) { return outs(ctx, a).length ? 1.1 : 0.2; },
    run: function (ctx, a, b) { return visitRun(ctx, a, b, 'visit'); } });
  addEv({ id: 'ft_call', cat: 'bond', scope: 'pair', label: '他の住人から電話や連絡が来る',
    when: function (ctx, a, b) { var h = hs(ctx), f = ctx.ft; return !!b && FC.sameHome(ctx, a, b) && FC.together(ctx, a, b) && /^[23]$/.test(String(f.t)) && h.visitDay !== f.day && h.n.visits < Math.max(2, f.days / 3); },
    w: function (ctx, a) { return outs(ctx, a).length ? 0.7 : 0.15; },
    run: function (ctx, a, b) { return visitRun(ctx, a, b, 'call'); } });

  /* ---------- 恋人が二組いる同居（{a}{b}＝一組目、{c}{d}＝二組目） ---------- */
  function cpOf(ctx, a, b) {
    if (!b || !FC.couple(ctx, a, b) || !FC.together(ctx, a, b)) return null;
    var O = FC.threeAll(ctx, a, b);
    for (var i = 0; i < O.length; i++) for (var j = i + 1; j < O.length; j++) if (FC.couple(ctx, O[i], O[j]) && !FC.couple(ctx, a, O[i]) && !FC.couple(ctx, a, O[j]) && !FC.couple(ctx, b, O[i]) && !FC.couple(ctx, b, O[j])) return [O[i], O[j]];
    return null;
  }
  function cpEv(id, cat, label, tm, w, need, run) {
    addEv({ id: id, cat: cat, scope: 'pair', label: label, tie: 'lover',
      when: function (ctx, a, b) { var f = ctx.ft; if (tm.indexOf(FC.TC.charAt(f.t)) < 0) return false; var cd = cpOf(ctx, a, b); return !!cd && (!need || need(ctx, a, b, cd[0], cd[1])); },
      w: function () { return w; },
      run: function (ctx, a, b) { var cd = cpOf(ctx, a, b); return cd ? run(ctx, a, b, cd[0], cd[1]) : null; } });
  }
  function cpText(ctx, k, a, b, c, d) { var t = FC.fresh(ctx, (TX().CP || {})[k]); return t ? FC.fill(ctx, t, a, b, c, { d: d.name, G: names([a, b, c, d]) }) : ''; }
  cpEv('ft_cp_time', 'romance', '二組の恋人の、組ごとの時間', 'de', 0.7, function (ctx) { return ctx.ft.hol; }, function (ctx, a, b, c, d) {
    var t = cpText(ctx, 'time', a, b, c, d); if (!t) return null;
    ctx.mod2(a, b, { aff: 3, att: 2 }, { aff: 3, att: 2 });
    return { text: t, why: FC.W(ctx, '自宅') + '恋人が二組の同居：組ごとの時間（' + c.name + 'と' + d.name + 'は外出）' };
  });
  cpEv('ft_cp_double', 'romance', '二組の恋人でダブルデート', 'd', 1.0, function (ctx) { return ctx.ft.hol; }, function (ctx, a, b, c, d) {
    var t = cpText(ctx, 'double', a, b, c, d); if (!t) return null;
    ctx.mod2(a, c, { aff: 3 }, { aff: 3 }); ctx.mod2(b, d, { aff: 3 }, { aff: 3 }); ctx.mod2(a, d, { aff: 2 }, { aff: 2 }); ctx.mod2(b, c, { aff: 2 }, { aff: 2 });
    return { text: t, with: [c, d], why: FC.W(ctx, '街') + '恋人たち二組・ダブルデート（仲良し）：' + a.name + 'と' + b.name + '、' + c.name + 'と' + d.name };
  });
  cpEv('ft_cp_jeal', 'conflict', '同じ家の別の組へのやきもち', 'den', 1.2, function (ctx, a, b, c, d) { return ctx.R(b, c).aff > 12 || ctx.R(b, d).aff > 12; }, function (ctx, a, b, c, d) {
    var o = ctx.R(b, c).aff >= ctx.R(b, d).aff ? c : d, t = FC.fresh(ctx, TX().CP.jeal); if (!t) return null;
    ctx.mod(a, b, { ten: 4, att: 1 }); ctx.mod(a, o, { ten: 5 }); FC.stOf(ctx, a, b).jealDay = ctx.ft.day;
    return { text: FC.fill(ctx, t, a, b, o), with: [o], why: FC.W(ctx, '自宅') + '恋人たち二組・嫉妬：' + a.name + 'は、恋人の' + b.name + 'と' + o.name + 'の仲のよさにやきもちを焼いた' };
  });
  cpEv('ft_cp_cheer', 'help', 'ケンカした組を別の組が応援', 'den', 2.2, function (ctx, a, b, c, d) { var x = FC.stOf(ctx, c, d); return x.spat || ctx.R(c, d).ten > 25 || ctx.R(d, c).ten > 25; }, function (ctx, a, b, c, d) {
    var t = FC.fresh(ctx, TX().CP.cheer); if (!t) return null;
    ctx.mod2(c, d, { ten: -12, aff: 2 }, { ten: -12, aff: 2 }); ctx.mod(c, a, { aff: 3 }); ctx.mod(d, b, { aff: 3 }); FC.stOf(ctx, c, d).spat = false;
    return { text: FC.fill(ctx, t, c, d, a, { d: b.name }), with: [c, d], why: FC.W(ctx, '自宅') + '恋人たち二組・応援（仲良し）：' + a.name + 'と' + b.name + 'が、ケンカした' + c.name + 'と' + d.name + 'を取り持った' };
  });
  cpEv('ft_cp_wall', 'bond', '同じ家に恋人が二組いる気まずさ', 'mn', 0.6, null, function (ctx, a, b, c, d) {
    var t = cpText(ctx, 'wall', a, b, c, d); if (!t) return null;
    return { text: t, with: [c, d], why: FC.W(ctx, '自宅') + '恋人たち二組・同じ家の気まずさ（仲良し）' };
  });

  /* ---------- 取り合い・揺れる気持ち ---------- */
  addEv({ id: 'ft_rival4', cat: 'conflict', scope: 'pair', label: '一人を三人で取り合う',
    when: function (ctx, a, b) { return !!rival4(ctx, a, b); },
    w: function () { return 2.4; },
    run: function (ctx, a, b) {
      var r = rival4(ctx, a, b), t = r ? FC.fresh(ctx, TX().RIVAL4) : ''; if (!t) return null;
      FC.stOf(ctx, a, b).rival4 = true;
      ctx.mod2(a, r[0], { ten: 6 }, { ten: 6 }); ctx.mod2(a, r[1], { ten: 6 }, { ten: 6 }); ctx.mod2(r[0], r[1], { ten: 6 }, { ten: 6 });
      return { text: FC.fill(ctx, t, a, b, r[0], { d: r[1].name }), with: r, why: FC.W(ctx, '自宅') + '三人の場面・取り合い（一人を三人が想う）：' + a.name + '・' + r[0].name + '・' + r[1].name + 'が、同じ' + b.name + 'に惹かれている（恋敵）' };
    } });
  function rival4(ctx, a, b) {
    if (!b || FC.stOf(ctx, a, b).rival4 || FC.couple(ctx, a, b) || !FC.loveOk(ctx, a, b) || ctx.R(a, b).att < 28) return null;
    var O = FC.threeAll(ctx, a, b).filter(function (c) { return FC.loveOk(ctx, c, b) && ctx.R(c, b).att >= 28 && !FC.couple(ctx, c, b) && !FC.couple(ctx, a, c); });
    return O.length >= 2 ? O.slice(0, 2) : null;
  }
  /* 恋人（{b}）のいる{a}の気持ちが、同じ家の{c}に揺れる。エンジンの a＝揺れる人、b＝新しく惹かれる人 */
  function loverOf(ctx, a, c) { return ctx.present().filter(function (L) { return L !== a && L !== c && FC.couple(ctx, a, L) && FC.together(ctx, a, L); })[0] || null; }
  addEv({ id: 'ft_waver', cat: 'romance', scope: 'pair', tie: 'lover', label: '恋人のいる人の気持ちが同居人に揺れる',
    when: function (ctx, a, c) {
      if (!c || FC.couple(ctx, a, c) || !FC.loveOk(ctx, a, c) || !FC.together(ctx, a, c) || a.faithful) return false;
      var L = loverOf(ctx, a, c); if (!L) return false;
      var xl = FC.stOf(ctx, a, L);
      return ctx.R(a, c).att >= 35 && ctx.R(a, c).att >= ctx.R(a, L).att - 6 && ctx.R(c, a).att >= 25 && ctx.ft.day - (xl.waverDay == null ? -9 : xl.waverDay) >= 2 && !(HK.lockOut && HK.lockOut(a, c));
    },
    w: function () { return 1.6; },
    run: function (ctx, a, c) {
      var L = loverOf(ctx, a, c), T = TX(), t = L ? FC.fresh(ctx, T.WAVER) : ''; if (!t) return null;
      var xl = FC.stOf(ctx, a, L); xl.waver = (xl.waver || 0) + 1; xl.waverDay = ctx.ft.day;
      ctx.mod(a, L, { aff: -3 }); ctx.mod(a, c, { att: 3 });
      if ((tr(L).jealous || 0) > 0.35 || ctx.rng() < 0.4) {
        var ts = FC.fresh(ctx, T.WAVER_SEEN);
        if (ts) FC.later(ctx, function () { if (!L.gone && !a.gone && !c.gone) emitT(ctx, [L, a, c], 'conflict', ts, FC.W(ctx, '自宅') + '三人の場面・嫉妬：' + L.name + 'は、恋人の' + a.name + 'の気持ちが' + c.name + 'へ揺れているのに気づいた', null, null, function () { ctx.mod(L, a, { ten: 6 }); ctx.mod(L, c, { ten: 6 }); ctx.stress(L, 10); }); });
      }
      return { text: FC.fill(ctx, t, a, L, c), with: [L], why: FC.W(ctx, '自宅') + '三人の場面・揺れる気持ち（三角関係）：' + a.name + 'は恋人の' + L.name + 'がいながら、' + c.name + 'に惹かれていく' };
    } });

  /* ---------- キス（HK.Kiss の型。恋人どうしの暮らしの節目） ---------- */
  function kissEv(id, label, trig, tm, w, need, once) {
    addEv({ id: id, cat: 'romance', scope: 'pair', label: label, tie: 'lover',
      when: function (ctx, a, b) { var f = ctx.ft; if (!b || !HK.Kiss || tm.indexOf(FC.TC.charAt(f.t)) < 0) return false; var x = FC.stOf(ctx, a, b); return FC.couple(ctx, a, b) && FC.loveOk(ctx, a, b) && FC.together(ctx, a, b) && x.s >= 3 && f.day - (x.kissDay == null ? -9 : x.kissDay) >= 2 && (!need || need(ctx, a, b, x)); },
      w: function () { return w; },
      run: function (ctx, a, b) {
        var len = ctx.rng() < 0.6 ? 's' : 'm', x = FC.stOf(ctx, a, b), r = HK.Kiss.text(ctx, a, b, { trig: trig, x: a, y: b, len: len });
        /* 夜（おやすみ前）のキスで「続きは夜」のお預けにしない（通し読み 1105：布団の中で「続きは夜よ」） */
        if (r && r.text && FC.TC.charAt(ctx.ft.t) === 'n' && /続きは、?夜|夜まで(?:我慢|お預け)/.test(r.text)) r = HK.Kiss.text(ctx, a, b, { trig: trig, x: a, y: b, len: len, end: 'hold' });
        if (!r || !r.text) return null;
        x.kissDay = ctx.ft.day; if (once) x[once] = true;
        return { text: r.text, why: FC.W(ctx, FC.spotHere(ctx, a, b)) + (r.why || 'キスだけの触れ合い') };
      } });
  }
  kissEv('ft_kiss_okaeri', 'おかえりのキス（恋人どうし）', 'okaeri', 'en', 0.6, function (ctx, a, b) { return FC.sameHome(ctx, a, b) && !ctx.ft.hol; });
  kissEv('ft_kiss_itte', 'いってらっしゃいのキス', 'itte', 'm', 0.5, function (ctx, a, b) { return FC.sameHome(ctx, a, b) && !ctx.ft.hol; });
  kissEv('ft_kiss_oyasumi', 'おやすみ前のキス（恋人どうし）', 'oyasumi', 'n', 0.6, null);
  kissEv('ft_kiss_naka', '仲直りのキス', 'naka', 'den', 2.0, function (ctx, a, b, x) { return x.madeUp === ctx.ft.day; });
  kissEv('ft_kiss_fui', 'ふいのキス（恋人になったばかり）', 'fui', 'den', 1.0, function (ctx, a, b, x) { return !x.kissed && ctx.ft.day - (x.at[3] || 0) <= 3; }, 'kissed');

  /* ======================= 結末 ======================= */
  H.endKey = function (ctx, a, b) {
    if (!house(ctx, a, b)) return null;
    var x = FC.stOf(ctx, a, b), ab = ctx.R(a, b), ba = ctx.R(b, a), v = x.awk || 0;
    if (x.s > 1) return null;
    if (x.s === 1 && ab.aff >= 45 && ba.aff >= 45 && ab.trust >= 38 && ba.trust >= 38 && v <= 28) return 'bff';
    if (v >= 55 && (Math.max(ab.ten, ba.ten) >= 30 || Math.min(ab.aff, ba.aff) < 12)) return 'leave';
    if (x.left && Math.max(ab.ten, ba.ten) >= 28 && v >= 40) return 'leave';
    return null;
  };
  H.leaver = function (ctx, a, b) {
    var x = FC.stOf(ctx, a, b);
    if (x.leftBy === a.i) return a; if (x.leftBy === b.i) return b;
    return ctx.R(a, b).ten - ctx.R(a, b).aff >= ctx.R(b, a).ten - ctx.R(b, a).aff ? a : b;
  };
  H.finish = function (ctx) {
    var h = hs(ctx); if (!h) return;
    /* 最後の日までに帰らなかった人（ふつうは帰る日の夕方に帰る）も、結末の前には帰る */
    Object.keys(h.away).forEach(function (k) { var w = h.away[k], c = ctx.chars[+k], o = ctx.chars[w.o]; if (c && o) back(ctx, c, o, w); else if (c) c.gone = false; });
  };
  H.houseEnd = function (ctx) {
    var h = hs(ctx), T = TX(), P = ctx.present(); if (!h || !h.on || P.length < 3) return;
    var sum = 0, n = 0;
    FC.pairs(ctx).forEach(function (p) { if (house(ctx, p[0], p[1])) { sum += awk(ctx, p[0], p[1]); n++; } });
    var m = n ? sum / n : 40, k = m >= 50 ? 'stiff' : m >= 30 ? 'mixed' : 'warm', t = FC.fresh(ctx, (T.HOUSE_END || {})[k]);
    if (t) emitT(ctx, P.slice(), 'bond', t, FC.W(ctx, '自宅') + P.length + '人の同居の終わり（ぎこちなさの平均 ' + Math.round(m) + '）', { G: names(P), n: String(ctx.ft.days) }, null);
  };
  H.stats = function (ctx) {
    var h = hs(ctx); if (!h) return null;
    var R = (TX().REASON || {})[h.reason];
    return { home: !!h.on, reason: R ? R.label : '', chores: h.on ? MODE_N[h.chores] : '', rubs: h.n.rubs, rules: h.n.rules, settle: h.n.settle, leaves: h.n.leaves, visits: h.n.visits };
  };
})();
