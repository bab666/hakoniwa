/* 配信の部屋（set-b-haishin）：コメント欄の組み立て（両方のビルド。2026-11-06 担当 P2。設計 docs/reports/2026-11-06/haishin-design.md の 4・14 章）
   ■ HK.HaishinCmKit（＝ HK.Haishin.cm。haishin.js（P1）が読み終えたあとに足す）
     ・post(ctx, opt)：一区切りのコメントの一件（コメントタブ。e.ch = 'cm'・e.tag = 'コメント'・lewd:false・actors:[]）を記録に足し、{ e, lines, garikoi, wed } を返す
         opt：stage（既定 S.stage）・sleep（寝落ちのコメントだけの区切り。本数 1.5 倍・C.GEN.sleep を混ぜる）・end（配信を切る前の最後の 3 本）・
              leak（'start'|'mid'|'peak'|'after'。切り忘れの C.LEAK）・stall（渋り。C.STALL を 2 本）・sc（[{ yen, whale }]。スパチャつきの行）・
              react（直前の出来事の鍵の配列。既定 S.lastEv）・hour（時刻 0〜23。既定 S.hour）・n（本数を決め打ち）
     ・main(ctx, opt)：メインの質問・要求を一つ選び、導入の地の文＋「＠コメント」の文を返す（記録には足さない。応えは haishin.js が足す）
         返り値 { text, k（要求の種類）, ak（応えの表の鍵。food の登録が無ければ food_none）, item, tgt（呼ばれた配信者）, other, sub（段 3 カップルの top|bot|both）, yen, handle }。候補が無ければ null
     ・has(ctx, stage)：その段に、まだ出せる要求が残っているか
     ・yen(ctx, stage)・scBatch(ctx)：スパチャの一件の額／一区切りのスパチャの並び（設計 6.2）。yenStr(n)：'¥1,000'
     ・regulars(ctx)：常連（S.regulars）を決める。handle(ctx, used)：ハンドル名を一つ
     ・fill(ctx, t, tgt)：印 {h}・{h2}・{相方}・{ch} を当てる（視聴者だけが配信の名前で呼ぶ。設計 14 章の例外）。hname(ctx, c)・chName(ctx)・aibou(ctx, c)
     ・okFor(ctx, it, tgt)：その文を今の配信・その配信者に出してよいか（形・体・受け攻め・規模・時間帯・料理の具合・関係）
   ■ 表は HK.HaishinCm（C。haishin-cm-text-a/b.js・haishin-r18-cm-text.js）。要素は文字列か { t, tag, need, kind, cook, k, end }：
       tag ['高']／['低']＝盛り上がりの高低、need（文字列か配列。全部を満たすときだけ）'solo'|'couple'|'M'|'F'（{h} の体）|'M2'|'F2'（{h2} の体）|'top'|'bot'（{h} の役）、
       kind＝配信の種類の限定（段 1 の kindq）、cook 1＝料理が順調なときだけ、end 1（または tag に 'end'）＝配信を切る前の最後のコメントだけ
   ■ 同じ文は一回の遊びで 2 回まで（S.cmUsed。表の合う文を一度ずつ使い切るまでは 2 回目を出さない）。足りなければ本数を減らす（最低 3 本を目指す） */
/* @event-ok 視聴者のコメント欄（出来事ではない） */
(function () {
  'use strict';
  var HK = window.HK;
  if (!HK) return;
  var SIZE_N = { s10: 10, s100: 100, s1k: 1000, s10k: 10000 };
  /* 要求の段の上限が 'kiss' の配信で出してよい段 4 の種類（軽い要求） */
  var LIGHT = { kiss: 1, hug: 1, hiza: 1, aan: 1, nade: 1, hand: 1, kiss_cam: 1, sasayaki_l: 1 };
  var SOLO_K = { kiss_cam: 1, sasayaki_l: 1, onani: 1, tel: 1 };
  var COUPLE_K = { kiss: 1, hug: 1, hiza: 1, aan: 1, nade: 1, hand: 1, kuchi: 1, ana: 1, ireru: 1, deep: 1, kubi: 1, mimi: 1 };
  /* 体の語の印（正規表現なので全年齢版の検査には当たらない） */
  var LEWD_RE = /\{(?:男性器|亀頭|女性器|陰核|ナカ|胸|乳首|尻|後ろ|精液|愛液|先走り|股間|前立腺|結腸)\}/;
  var M_RE = /\{(?:男性器|亀頭|精液|先走り|前立腺)\}/, F_RE = /\{(?:女性器|陰核)\}/;
  var IN_RE = /\{(?:ナカ|後ろ|前立腺|結腸)\}|入れ|挿れ|挿入|突っ込/;
  var FALLBACK_H = ['名無しのリスナー', 'nanashi_01', '通りすがり', 'よるのひと', 'みてるだけ', 'ROM専', 'mikan_22', 'しろくま', 'ねこまる', 'tsuki_88', 'あおぞら', '深夜の人'];

  function C() { return HK.HaishinCm || {}; }
  function st(ctx) { return (HK.Haishin && HK.Haishin.st ? HK.Haishin.st(ctx) : null) || (ctx && ctx.hs) || null; }
  function rnd(ctx) { return ctx && ctx.rng ? ctx.rng() : Math.random(); }
  function pick(ctx, a) { return a && a.length ? a[Math.floor(rnd(ctx) * a.length)] : null; }
  function txt(it) { return typeof it === 'string' ? it : it && it.t || ''; }
  function arr(x) { return Array.isArray(x) ? x : x == null ? [] : [x]; }
  function onList(S) { return arr(S && S.on).filter(Boolean); }
  function isSolo(S) { return S && (S.form === 'solo' || onList(S).length < 2); }
  function partner(S, c) {
    var on = onList(S);
    if (isSolo(S)) return c === S.off ? on[0] || null : S.off || null;
    return on[0] === c ? on[1] : on[0];
  }
  function genOf(c) { return c ? c.gender || (c.src && c.src.gender) || '' : ''; }
  function P() { return HK.Pos || {}; }
  function hasM(c) { return P().hasM ? P().hasM(c) : genOf(c) !== 'f'; }
  function hasF(c) { return P().hasF ? P().hasF(c) : genOf(c) === 'f'; }
  /* 受けかリバか（カップルは S.bot。ソロは「攻め」でなければ受けの扱い。リバのソロは受けと同じ：設計 1 の決定 5） */
  function isBot(S, c) {
    if (!c) return false;
    if (!isSolo(S) && (S.top || S.bot)) return c === S.bot;
    return !(P().of ? P().of(c) === 'top' : false);
  }
  function married(ctx, S) {
    if (!S) return false;
    if (S.married != null) return !!S.married;
    if (S.rk) return S.rk === 'spouse';
    if (S.rel) return /spouse|夫婦/.test(String(S.rel));
    var on = onList(S), a = on[0], b = partner(S, a), tl = a && b && HK.Ties && HK.Ties.all ? HK.Ties.all(ctx, a, b) || [] : [];
    return tl.some(function (t) { return t && (t.type === 'spouse' || t.spouse) && t.married !== 'divorced'; });
  }
  function hourOf(S, opt) { var h = opt && opt.hour != null ? opt.hour : S && S.hour; return h == null ? null : ((+h % 24) + 24) % 24; }
  function capKiss(S) { return HK.SAFE_ON || HK.SAFE_BUILD || !S || (S.cap === 'kiss' || S.cap === 'talk'); }
  function cookOk(S) {
    if (!S || S.kind !== 'cook') return false;
    if (S.cookFail || S.cookNg) return false;
    var LF = HK.Life;
    return !LF || !LF.canCook || onList(S).some(function (c) { return LF.canCook(c); });
  }
  function hiLo(S) { var p = S && S.pt != null ? S.pt : 40; return p >= 60 ? 'hi' : p < 40 ? 'lo' : ''; }

  /* ---------- 名前の印 ---------- */
  function hname(ctx, c) {
    if (!c) return '';
    var S = st(ctx), v = S && S.hn && S.hn[c.i];
    if (!v) { var p = ctx && ctx.input && ctx.input.perChar && ctx.input.perChar[c.i], q = p && p.pick ? p.pick.hname : ''; v = typeof q === 'string' ? q.trim().slice(0, 12) : ''; }
    return v || c.name || '';
  }
  function chName(ctx) {
    var S = st(ctx), on = onList(S);
    if (!on.length) return '';
    return isSolo(S) ? hname(ctx, on[0]) : hname(ctx, on[0]) + 'と' + hname(ctx, on[1]);
  }
  /* 相方の呼び方（設計 14 章）：恋人で相手が男性→彼氏さん、女性→彼女さん、ほか→相方さん／夫婦で男性→旦那さん、女性→奥さん、ほか→パートナーさん。
     カップル配信では半分を配信の名前で呼ぶ */
  function aibou(ctx, c) {
    var S = st(ctx), o = partner(S, c);
    if (!o) return '相方さん';
    if (!isSolo(S) && rnd(ctx) < 0.5) return hname(ctx, o);
    var g = genOf(o), w = married(ctx, S);
    return w ? (g === 'm' ? '旦那さん' : g === 'f' ? '奥さん' : 'パートナーさん') : (g === 'm' ? '彼氏さん' : g === 'f' ? '彼女さん' : '相方さん');
  }
  function fill(ctx, t, tgt) {
    var S = st(ctx), on = onList(S);
    tgt = tgt || on[0];
    var o = partner(S, tgt);
    return String(t || '').replace(/\{h\}/g, function () { return hname(ctx, tgt); })
      .replace(/\{h2\}/g, function () { return hname(ctx, o && on.indexOf(o) >= 0 ? o : tgt); })
      .replace(/\{相方\}/g, function () { return aibou(ctx, tgt); })
      .replace(/\{ch\}/g, function () { return chName(ctx); })
      .replace(/[「」＠]/g, '');
  }

  /* ---------- その文を出してよいか ---------- */
  /* 札 need（文字列か配列。配列は全部を満たすときだけ）：M/F＝{h} に男性器／女性器、M2/F2＝{h2} に、top/bot＝{h} が攻め／受けかリバ、solo/couple＝形 */
  var opt0 = null;   /* okFor の opt（向きで当てた行は、受け攻めの設定の top／bot を見ない） */
  function needOk(ctx, S, n, tgt) {
    var o = partner(S, tgt);
    switch (n) {
      case 'solo': return isSolo(S);
      case 'couple': return !isSolo(S);
      case 'M': case 'm': return hasM(tgt);
      case 'F': case 'f': return hasF(tgt);
      case 'M2': return !isSolo(S) && hasM(o);
      case 'F2': return !isSolo(S) && hasF(o);
      case 'bot': return !!(opt0 && opt0.actMode) || isBot(S, tgt);
      case 'top': return !!(opt0 && opt0.actMode) || !isBot(S, tgt);
      default: return true;
    }
  }
  function okFor(ctx, it, tgt, opt) {
    var S = st(ctx); if (!S) return false;
    var t = txt(it); if (!t) return false;
    var on = onList(S); tgt = tgt || on[0];
    if (typeof it === 'object') {
      opt0 = opt || null;
      var nb = arr(it.need).some(function (n) { return !needOk(ctx, S, n, tgt); });
      opt0 = null;
      if (nb) return false;
      if (it.kind && it.kind !== (S.kindLive || S.kind)) return false;
      if (it.cook && !cookOk(S)) return false;
      var isEnd = it.end || arr(it.tag).indexOf('end') >= 0;
      if (isEnd && !(opt && opt.end)) return false;
      var hl = hiLo(S), tg = arr(it.tag);
      if (hl === 'lo' && tg.indexOf('高') >= 0 && tg.indexOf('低') < 0) return false;
      if (hl === 'hi' && tg.indexOf('低') >= 0 && tg.indexOf('高') < 0) return false;
    }
    /* 全年齢・上限がキスまでの配信に体の語を出さない */
    if (LEWD_RE.test(t) && capKiss(S)) return false;
    /* 画面の住人の体に無い体の語（pos-audit の V10 に当てない） */
    if (M_RE.test(t) && !on.some(hasM)) return false;
    if (F_RE.test(t) && !on.some(hasF)) return false;
    /* 攻めのソロの配信者に「入れる」要求を出さない（設計 1 の決定 5） */
    if (isSolo(S) && !isBot(S, tgt) && IN_RE.test(t)) return false;
    /* 形：ソロに二人で並ぶ文、カップルに {h2} の無い「一人で」の文 */
    if (isSolo(S) && (/\{h2\}/.test(t) || /並んで|お二人|二人とも|ふたりとも|二人で|ふたりで/.test(t))) return false;
    /* 規模と食い違う数 */
    if (/1万|一万|10000|10,000/.test(t) && S.size !== 's10k') return false;
    if (/(?:1000|1,000|千)人/.test(t) && (S.size === 's10' || S.size === 's100')) return false;
    /* 関係：夫婦に「結婚して」、恋人に夫婦の語。相方の性別と食い違う呼び方 */
    var w = married(ctx, S), o = partner(S, tgt);
    if (w && /結婚して|結婚しろ|結婚まだ|入籍|プロポーズ/.test(t)) return false;
    if (!w && /旦那|奥さん|嫁さん|夫婦/.test(t)) return false;
    if (/彼氏/.test(t) && genOf(o) !== 'm') return false;
    if (/彼女さん|彼女ちゃん/.test(t) && genOf(o) !== 'f') return false;
    /* 時間帯の挨拶 */
    var h = hourOf(S, opt);
    if (h != null && /おはよう|おはよ/.test(t) && !(h >= 5 && h < 11)) return false;
    return true;
  }

  /* ---------- 2 回までの引き方 ---------- */
  function draw(ctx, pool, tgtOf, opt, local) {
    var S = st(ctx), U = S.cmUsed = S.cmUsed || {}, c0 = [], c1 = [];
    (pool || []).forEach(function (it) {
      var t = txt(it); if (!t || local[t]) return;
      var tg = tgtOf(it); if (tg === false) return;
      var o2 = tg && tg.am ? Object.assign({}, opt || {}, { actMode: true }) : opt; if (tg && tg.am) tg = tg.c;
      if (!okFor(ctx, it, tg, o2)) return;
      var u = U[t] || 0;
      if (u === 0) c0.push([it, tg]); else if (u === 1) c1.push([it, tg]);
    });
    var c = pick(ctx, c0.length ? c0 : c1);
    if (!c) return null;
    var t0 = txt(c[0]); U[t0] = (U[t0] || 0) + 1; local[t0] = 1;
    return { it: c[0], tgt: c[1], t: t0 };
  }
  function tgtRand(ctx) { var S = st(ctx), on = onList(S); return function () { return on.length > 1 ? on[Math.floor(rnd(ctx) * on.length)] : on[0]; }; }
  /* 行為の向きでコメントの {h}／{h2} を当てる（2026-11-06 の利用者の指示「逆 CP としてコメントしないように」。設計 4.5）。
     向きを言う文＝札 dir（'doer'＝{h} が行為をする側・'taker'＝{h} がされる側）か、need の top（→ doer）・bot（→ taker）。ak＝行為の種類の限定（kuchi・sex など）。
     act＝その区切りの { doer, taker, k }（haishin.js の setAct。反応の表は、その出来事をした人 S.lastEvBy[鍵]）。向きの無い区切り（act が null）は向きを言う文を出さない。
     向きを言わない文は今までどおり配信者のどちらかを当てる。ソロ配信は {h}＝配信者だけなので当てない。戻り値：false（出さない）／{ c, am }（am＝向きで当てた） */
  function dirOf(it) {
    if (!it || typeof it !== 'object') return '';
    if (it.dir) return it.dir;
    var nd = arr(it.need);
    return nd.indexOf('top') >= 0 ? 'doer' : nd.indexOf('bot') >= 0 ? 'taker' : '';
  }
  function tgtAct(ctx, act) {
    var S = st(ctx), on = onList(S), rt = tgtRand(ctx);
    return function (it) {
      var d = dirOf(it);
      if (isSolo(S)) return on[0];
      if (!d) return it && it.ak ? false : rt();
      if (!act || !act.doer) return false;
      if (it.ak && arr(it.ak).indexOf(act.k) < 0) return false;
      var c = d === 'doer' ? act.doer : act.taker;
      if (!c || on.indexOf(c) < 0) return false;
      return { c: c, am: true };
    };
  }

  /* ---------- ハンドル名・常連 ---------- */
  function handles() { var l = HK.Mob && HK.Mob.list ? HK.Mob.list('haishin-h') : []; if (!l || !l.length) l = C().HANDLES || []; return l && l.length ? l : FALLBACK_H; }
  function handle(ctx, used) {
    var S = st(ctx), reg = {}; (S && S.regulars || []).forEach(function (r) { reg[r.h] = 1; });
    var l = handles().filter(function (h) { return !reg[h] && !(used && used[h]); });
    var h = pick(ctx, l.length ? l : handles());
    if (used && h) used[h] = 1;
    return h;
  }
  var REG_T = ['kosan', 'whale', 'garikoi', 'arashi', 'mod', 'shoken'];
  function regulars(ctx) {
    var S = st(ctx); if (!S) return [];
    if (S.regulars) return S.regulars;
    var types = REG_T.filter(function (k) {
      if (k === 'whale') return S.sc === 'whale' || (S.sc !== 'few' && rnd(ctx) < 0.5);
      if (k === 'arashi') return S.size !== 's10';
      return true;
    });
    var pool = handles().slice(), out = [];
    types.forEach(function (k) {
      var i = Math.floor(rnd(ctx) * pool.length), h = pool.splice(i, 1)[0];
      if (h) out.push({ type: k, h: h });
    });
    S.regulars = out;
    return out;
  }
  function regOf(S, type) { return (S.regulars || []).filter(function (r) { return r.type === type; })[0] || null; }

  /* ---------- スパチャ（設計 6.2） ---------- */
  var YEN = [[100, 30], [200, 22], [500, 20], [1000, 14], [2000, 7], [3000, 4], [5000, 3]];
  function yen(ctx, stage) {
    var S = st(ctx), s = stage || (S && S.stage) || 1, tot = 0;
    var w = YEN.map(function (y, i) { var v = y[1] * (i >= 3 ? 1 + 0.3 * s : 1); tot += v; return v; });
    var r = rnd(ctx) * tot;
    for (var i = 0; i < YEN.length; i++) { r -= w[i]; if (r <= 0) return YEN[i][0]; }
    return YEN[0][0];
  }
  function scBatch(ctx) {
    var S = st(ctx); if (!S) return [];
    var rg = { few: [0, 1], mid: [1, 3], whale: [2, 4] }[S.sc] || [1, 3];
    var n = rg[0] + Math.floor(rnd(ctx) * (rg[1] - rg[0] + 1)), m = Math.max(1, Math.min(2, Math.log(Math.max(S.v || 10, 10)) / Math.LN10 / 2));
    n = Math.round(n * m);
    var out = [];
    for (var i = 0; i < n; i++) out.push({ yen: Math.min(50000, yen(ctx)) });
    if (S.sc === 'whale' && regOf(S, 'whale') && rnd(ctx) < 0.35) out.push({ yen: [10000, 20000, 30000, 50000][Math.floor(rnd(ctx) * 4)], whale: true });
    return out;
  }
  function yenStr(n) { return '¥' + String(Math.round(n || 0)).replace(/\B(?=(\d{3})+(?!\d))/g, ','); }

  /* ---------- コメントの一件 ---------- */
  function stageTable(S, stage, kind) {
    var G = C().GEN || {}, f = isSolo(S) ? G.solo : G.couple, s = Math.max(1, Math.min(6, stage || 1));
    if (capKiss(S) && s > 3) s = 3;
    return f && f[s] || [];
  }
  function timeTable(S, opt) {
    var G = C().GEN || {}, h = hourOf(S, opt);
    if (h == null) return null;
    if (h < 5) return G.late; if (h < 9) return G.morning; if (h >= 17) return G.eve;
    return null;
  }
  function post(ctx, opt) {
    opt = opt || {};
    var S = st(ctx); if (!S) return null;
    var CC = C(), G = CC.GEN || {}, stage = opt.stage || S.stage || 1, local = {}, used = {}, lines = [];
    var act = S.actMix ? null : S.act || null, rt = tgtAct(ctx, act), evBy = S.lastEvBy || {};
    var v = Math.max(S.v || 10, 1);
    var n = opt.n || Math.max(3, Math.min(12, Math.round(3 + 2.2 * Math.log(v) / Math.LN10 + 0.5 * stage)));
    if (opt.sleep && !opt.n) n = Math.min(12, Math.round(n * 1.5));
    if (opt.end && !opt.n) n = 3;
    regulars(ctx);
    var res = { garikoi: false, wed: 0 };
    function add(o, h, y) { if (!o) return false; lines.push({ h: h || handle(ctx, used), y: y || 0, t: fill(ctx, o.t, o.tgt), reg: o.reg || '', d: dirOf(o.it), tg: o.tgt, src: o.t, ak: o.it && o.it.ak || '', act: o.act === undefined ? act : o.act }); return true; }
    /* 配信を切る前の最後のコメント：end の札の文だけ */
    if (opt.end) {
      var ends = stageTable(S, 6).concat(stageTable(S, stage), G.all || []);
      for (var e0 = 0; e0 < n; e0++) if (!add(draw(ctx, ends, rt, { end: true, hour: opt.hour }, local))) break;
    } else {
      /* 直前の出来事への反応（2 本まで） */
      var ev = arr(opt.react != null ? opt.react : S.lastEv).filter(function (k) { return CC.REACT && CC.REACT[k]; }), rc = 0;
      ev.forEach(function (k) {
        var ea = evBy[k] || null, d0 = rc < 2 ? draw(ctx, CC.REACT[k], tgtAct(ctx, ea), opt, local) : null;
        if (d0) { d0.act = ea; if (add(d0)) rc++; }
      });
      if (opt.stall && CC.STALL) for (var s0 = 0; s0 < 2; s0++) add(draw(ctx, CC.STALL, rt, opt, local));
      /* 切り忘れ：最高潮のコメントを主に */
      if (opt.leak && CC.LEAK && CC.LEAK[opt.leak]) { var lk = Math.ceil(n * 0.7); for (var l0 = 0; l0 < lk && lines.length < n; l0++) if (!add(draw(ctx, CC.LEAK[opt.leak], rt, opt, local))) break; }
      /* 常連（規模が小さいほど多い） */
      var rk = { s10: 2, s100: 1 + (rnd(ctx) < 0.5 ? 1 : 0), s1k: 1, s10k: rnd(ctx) < 0.5 ? 1 : 0 }[S.size];
      if (rk == null) rk = 1;
      var regs = (S.regulars || []).filter(function (r) { return CC.REG && CC.REG[r.type]; });
      for (var r0 = 0; r0 < rk && regs.length && lines.length < n; r0++) {
        var R = pick(ctx, regs), d = draw(ctx, CC.REG[R.type], rt, opt, local);
        if (d && add({ t: d.t, tgt: d.tgt, it: d.it, reg: R.type }, R.h)) {
          if (R.type === 'garikoi') res.garikoi = true;
          var md = regOf(S, 'mod');
          if (R.type === 'arashi' && md) { var dm = draw(ctx, CC.REG.mod, rt, opt, local); if (dm) add({ t: dm.t, tgt: dm.tgt, it: dm.it, reg: 'mod' }, md.h); }
        }
      }
      /* 残り：段の表 40・共通 25・種類 15・規模 10・時間帯 10（寝落ちの区切りは段の表の代わりに寝落ちの表） */
      var tt = timeTable(S, opt), guard = 0;
      while (lines.length < n && guard++ < n * 4) {
        var r = rnd(ctx) * 100, pool;
        if (r < 40) pool = opt.sleep ? G.sleep : stageTable(S, stage);
        else if (r < 65) pool = G.all;
        else if (r < 80) pool = G.kind && G.kind[S.kindLive || S.kind];
        else if (r < 90) pool = G.size && G.size[S.size];
        else pool = tt || G.all;
        var d2 = draw(ctx, pool, rt, opt, local) || draw(ctx, G.all, rt, opt, local);
        if (!d2) break;
        add(d2);
      }
    }
    /* スパチャつきの行：太客は太客の常連の行に、ほかは常連でない行に */
    arr(opt.sc).forEach(function (s) {
      var y = typeof s === 'number' ? s : s && s.yen; if (!y) return;
      var wh = s && s.whale ? regOf(S, 'whale') : null, cand = lines.filter(function (l) { return !l.y && (wh ? l.h === wh.h : !l.reg); });
      var L0 = pick(ctx, cand);
      if (L0) { L0.y = y; return; }
      var d3 = draw(ctx, (CC.REACT && CC.REACT.sc) || G.all, rt, opt, local) || draw(ctx, G.all, rt, opt, local);
      if (d3) lines.push({ h: wh ? wh.h : handle(ctx, used), y: y, t: fill(ctx, d3.t, d3.tgt), reg: wh ? 'whale' : '', d: dirOf(d3.it), tg: d3.tgt, src: d3.t, ak: d3.it && d3.it.ak || '', act: act });
    });
    if (!lines.length) return null;
    /* 並びを混ぜる（荒らし→モデレーターの順は崩さない） */
    for (var i = lines.length - 1; i > 0; i--) { var j = Math.floor(rnd(ctx) * (i + 1)); if (lines[i].reg === 'mod' || lines[j].reg === 'mod') continue; var tmp = lines[i]; lines[i] = lines[j]; lines[j] = tmp; }
    var out = lines.map(function (l) { return l.h + (l.y ? '［' + yenStr(l.y) + '］' : '') + '：' + l.t; });
    /* 点検用の控え（記録には書かない。S.dirLog は ctx.hs の中だけ。点検の道具が HK.Haishin._dirLog から読む） */
    if (S.dirLog) {
      var nm = function (c) { return c ? c.name : ''; };
      S.dirLog.push({ s: S.s, step: ctx.stepIndex, form: S.form, act: act ? { doer: nm(act.doer), taker: nm(act.taker), k: act.k } : null, mix: !!S.actMix,
        lines: lines.map(function (l) { return { t: l.t, src: l.src || '', d: l.d || '', ak: l.ak || '', h: nm(l.tg), act: l.act ? { doer: nm(l.act.doer), taker: nm(l.act.taker), k: l.act.k } : null }; }) });
    }
    out.forEach(function (l) { if (/結婚/.test(l)) res.wed++; });
    S.wedCm = (S.wedCm || 0) + res.wed;
    S.cmLast = { garikoi: res.garikoi, wed: res.wed, step: ctx.stepIndex };
    var e = ctx.say({ kind: 'phase', cat: 'phase', actors: [], text: out.join('\n'), mag: 0, lewd: false });
    if (e) { e.ch = 'cm'; e.tag = 'コメント'; }
    res.e = e; res.lines = out;
    return res;
  }

  /* ---------- メインの質問・要求（設計 4.2・4.3） ---------- */
  function kOk(ctx, S, it, stage) {
    var k = it && it.k || '', solo = isSolo(S);
    if (SOLO_K[k] && !solo) return false;
    if (COUPLE_K[k] && solo) return false;
    if (stage === 4 && capKiss(S) && !LIGHT[k]) return false;
    if (stage > 4 && capKiss(S)) return false;
    if ((k === 'kiss' || k === 'deep') && (S.kiss || 0) >= 2) return false;
    /* 玩具を入れる要求は受け・リバだけ（攻めのソロの vibe は need に top の付いた「入れない」文だけ） */
    if (k === 'vibe' && arr(it.need).indexOf('top') < 0 && !(solo ? isBot(S, onList(S)[0]) : S.bot)) return false;
    return true;
  }
  function reqPool(ctx, S, stage) {
    var R = (C().REQ || {})[stage], solo = isSolo(S), on = onList(S);
    if (!R) return [];
    if (Array.isArray(R)) return R.map(function (it) { return { it: it, sub: '' }; });
    var f = solo ? R.solo : R.couple;
    if (!f) return [];
    if (Array.isArray(f)) return f.map(function (it) { return { it: it, sub: '' }; });
    /* 段 3 のカップル：攻め宛・受け宛・両方（設計 4.3） */
    var out = [];
    ['top', 'bot', 'both'].forEach(function (k) { (f[k] || []).forEach(function (it) { out.push({ it: it, sub: k }); }); });
    return on.length ? out : [];
  }
  /* 呼ばれる配信者 {h}：ソロは配信者。カップルは段 3 の宛先（top・bot）か、札の top・bot（段 4〜6 の行為は {h}＝攻め・{h2}＝受け）、ほかはどちらか */
  function tgtFor(ctx, S, x) {
    var on = onList(S), nd = arr(x.it && x.it.need);
    if (isSolo(S)) return on[0];
    if (x.sub === 'top' || nd.indexOf('top') >= 0) return S.top || on[0];
    if (x.sub === 'bot' || nd.indexOf('bot') >= 0) return S.bot || on[1];
    return on[Math.floor(rnd(ctx) * on.length)];
  }
  function cands(ctx, stage) {
    var S = st(ctx); if (!S) return [];
    var U = S.cmUsed = S.cmUsed || {}, out = [];
    reqPool(ctx, S, stage).forEach(function (x) {
      if (!kOk(ctx, S, x.it, stage)) return;
      var tg = tgtFor(ctx, S, x);
      if (!okFor(ctx, x.it, tg)) return;
      if ((U[txt(x.it)] || 0) >= 2) return;
      out.push({ it: x.it, sub: x.sub, tgt: tg, u: U[txt(x.it)] || 0 });
    });
    return out;
  }
  function has(ctx, stage) { return cands(ctx, stage || (st(ctx) || {}).stage || 1).length > 0; }
  function main(ctx, opt) {
    opt = opt || {};
    var S = st(ctx); if (!S) return null;
    var stage = opt.stage || S.stage || 1, cs = cands(ctx, stage);
    if (opt.k) cs = cs.filter(function (x) { return x.it.k === opt.k; });
    if (!cs.length) return null;
    /* 使っていない文を先に。続けて同じ種類を出さず、出した回数の少ない種類を重く */
    var fresh = cs.filter(function (x) { return x.u === 0; }); if (fresh.length) cs = fresh;
    var KU = S.reqK = S.reqK || {}, last = S.reqLast || '', nl = cs.filter(function (x) { return x.it.k !== last; }); if (nl.length) cs = nl;
    /* 段 1〜3 の質問は、一回の配信で同じ種類を二度聞かない（「告白はどっちから」を二度聞かれて、二人の答えが食い違った。2026-11-06 P15b の通し読み） */
    if (stage <= 3) { var nu = cs.filter(function (x) { return !KU[x.it.k]; }); if (nu.length) cs = nu; }
    var x = HK.weighted ? HK.weighted(ctx.rng, cs, function (c) { return 1 / (1 + (KU[c.it.k] || 0)); }) : pick(ctx, cs);
    var t = txt(x.it), U = S.cmUsed; U[t] = (U[t] || 0) + 1;
    KU[x.it.k] = (KU[x.it.k] || 0) + 1; S.reqLast = x.it.k;
    /* 額：opt.yen（数）か、設定の太さで付けるか決める */
    var y = opt.yen !== undefined ? opt.yen : (rnd(ctx) < ({ few: 0.15, mid: 0.35, whale: 0.5 }[S.sc] || 0.3) ? yen(ctx, stage) : 0);
    var h = opt.handle || handle(ctx);
    var IN = (C().INTRO || []).filter(function (it) { var s = txt(it); return s && (y ? /\{yen\}/.test(s) : !/\{yen\}/.test(s)) && okFor(ctx, it, x.tgt) && (U[s] || 0) < 2; });
    var in0 = IN.filter(function (it) { return !U[txt(it)]; }), it0 = pick(ctx, in0.length ? in0 : IN), intro;
    if (it0) { intro = txt(it0); U[intro] = (U[intro] || 0) + 1; }
    else intro = y ? '{handle}から {yen} のスパチャとともに、コメントが届いた。' : '{handle}のコメントが、画面の端に大きく浮かんだ。';
    intro = fill(ctx, intro.replace(/\{handle\}/g, h).replace(/¥?\{yen\}/g, yenStr(y)), x.tgt);
    var ak = x.it.k;
    if (ak === 'food' && !(HK.Food && HK.Food.like && HK.Food.like(x.tgt))) ak = 'food_none';
    return { text: intro + '「＠' + fill(ctx, t, x.tgt) + '」', k: x.it.k, ak: ak, item: x.it, tgt: x.tgt, other: partner(S, x.tgt), sub: x.sub, yen: y, handle: h };
  }

  var CM = HK.HaishinCmKit = {
    post: post, main: main, has: has, yen: yen, scBatch: scBatch, yenStr: yenStr, regulars: regulars, handle: handle,
    fill: fill, hname: hname, chName: chName, aibou: aibou, okFor: okFor, married: married, isSolo: isSolo, isBot: isBot, partner: partner, onList: onList, st: st, SIZE_N: SIZE_N
  };
  HK.Haishin = HK.Haishin || {};
  HK.Haishin.cm = CM;
})();
