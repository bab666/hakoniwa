/* 箱庭シミュレーター: フラれても諦めない線と、二度目の告白（2026-11-04。設計と計測は docs/reports/2026-11-04/heartbreak-persist.md）
   告白して断られた人（events-common.js の confess・unreq.js の u_confess・ふたりの日常の告白・クラスメイトのバレンタインと後夜祭・
   無人島の告白・オメガバースの告白）が、その場で「諦める」か「諦めない」かを決める（HK.HeartP.reject）。
   ・決め方：態度（健気は諦めにくく、冷静・奔放は切り替えが早い）・一途の設定・本命の関係・惹かれの強さ・心の強さ（will）・
     二人の関係（幼馴染・親友・友達以上恋人未満・未練のある元恋人は諦めにくい）・相手の断り方（ためらい／理由つき／きっぱり）。
     相手が苦手に思っている・緊張が高い（嫌がっている）ときは、いつも諦める（節度。しつこくしない）
   ・諦めない人の出来事（hp_stay）：変わらず優しくする・距離を置かずにそばにいる・見守る・「まだ好き」を態度で示す・
     相手の恋を応援しながら想い続ける（相手に恋人・想い人がいるときは、見守る・応援だけ。横恋慕の場面にしない）。
     相手の反応（戸惑う・気づかないふり・揺れる・改めて断る）を態度9種で続ける。改めて断られたら、諦める人はそこで引く（st: back）
   ・二度目の告白（hp_again）：時間を置いて（断られてから2区切り以上）、相手の気持ちが動いた・相手の想い人がいなくなった・
     ふたりきり、のどれかのとき。相手に恋人がいれば起きない（奪わない）。恋愛対象は両方向（HK.canLove）と HK.Poly.canCouple を通す。
     実れば恋人に。断られたら、心の強さ・一途・本命・健気で「それでも想い続ける」か「今度こそ諦める」。三度目はしない
   ・結末：諦めない人・諦めた人・二度目で区切った人は、結果の住人に hpTo・hpSt を書き（HK.Emo.summary を包む）、epilogue.js の「その後」が分ける
   {a}=想う人 {b}=想われる人 {c}={b}の恋人・想い人。文は heart-persist-text.js（HK.HeartP.T）。全年齢版も同じ（性的な語なし） */
/* @event-ok 告白の失敗のあとに「諦めない」かどうかの分岐を足した（各箱庭の告白の出来事。2026-11-04 担当HP） */
(function () {
  'use strict';
  var HK = window.HK;
  if (!HK || !HK.HeartP || !HK.HeartP.T) return;
  var P = HK.HeartP, T = P.T;
  var PS = ['proud', 'stern', 'tsun', 'gentle', 'devoted', 'cool', 'free', 'shy', 'polite'];
  function L(s) { return s.split('|'); }
  function fill(t, m) { return String(t).replace(/\{(\w+)\}/g, function (x, k) { return m[k] != null ? m[k] : x; }); }
  function alive(c) { return !!c && c.alive !== false && !c.out; }
  function psOf(c) { var p = HK.personaOf ? HK.personaOf(c) : c && c.persona; return PS.indexOf(p) >= 0 ? p : 'gentle'; }
  function has(ctx, a, b, ty) { return HK.Ties ? HK.Ties.has(ctx, a, b, ty) : null; }
  function from(ctx, a, b, ty) { return HK.Ties ? HK.Ties.from(ctx, a, b, ty) : null; }
  function couple(ctx, a, b) { return !!ctx.pair(a, b).couple || !!(has(ctx, a, b, 'lover') || has(ctx, a, b, 'mate') || has(ctx, a, b, 'fated')); }
  function marked(a, b) { return !!((a.ng && a.ng.indexOf(b.i) >= 0) || (b.ng && b.ng.indexOf(a.i) >= 0)); }
  /* b に、a 以外の（生きている）恋人がいるか。いればその人 */
  function loverOf(ctx, b, a) {
    var L0 = ctx.chars.filter(function (c) { return c !== a && c !== b && alive(c) && couple(ctx, b, c); });
    return L0[0] || null;
  }
  /* b の心が向いている、a 以外の人（恋人・想い人・恋愛相手の固定） */
  function heartOf(ctx, b, a) {
    var l = loverOf(ctx, b, a); if (l) return l;
    if (HK.Unreq && HK.Unreq.heartOf) { var h = HK.Unreq.heartOf(ctx, b, a); if (h && alive(h)) return h; }
    return null;
  }
  function rec(ctx, a, b) { var pf = ctx.pair(a, b); return pf.hpS ? pf.hpS[a.i] || null : null; }
  /* 嫌がっている（苦手・緊張が高い）か：諦めない線も、二度目の告白も起こさない */
  function bothered(ctx, a, b) { var r = ctx.R(b, a); return r.ten > 35 || r.aff < -10; }
  /* 同じ文を一回の遊びで二度出さない：使った文を覚えて、残りから選ぶ（残りが無ければ null） */
  function pk(ctx, list) {
    var u = ctx.flags.hpUsed || (ctx.flags.hpUsed = {});
    var c = (list || []).filter(function (t) { return !u[t]; });
    if (!c.length) return null;
    var t = c[Math.floor(hr(ctx) * c.length)]; u[t] = 1; return t;
  }
  /* この仕組みの乱数は、箱庭の乱数を使わず、回の種と呼んだ回数から決める（断られても出来事が起きない回の結果を、今までと同じに保つため） */
  function hr(ctx) {
    var f = ctx.flags, n = f.hpN = (f.hpN || 0) + 1, k = String(ctx.seed) + '|hp|' + n, h = 0x811c9dc5;
    for (var i = 0; i < k.length; i++) { h ^= k.charCodeAt(i); h = Math.imul(h, 0x01000193) >>> 0; }
    h ^= h >>> 13; h = Math.imul(h, 0x5bd1e995) >>> 0; h ^= h >>> 15;
    return (h >>> 0) / 4294967296;
  }
  function tr(ev, o) { if (P.trace) { o.ev = ev; o.sc = P.traceSc || ''; P.trace.push(o); } }

  /* ---------- 諦めない判定 ---------- */
  /* 態度ごとの寄与（健気が最も諦めにくく、冷静・奔放は切り替えが早い） */
  var PS_K = { devoted: 0.28, shy: 0.1, gentle: 0.08, tsun: 0.08, stern: 0.05, polite: 0.05, proud: 0.03, cool: -0.2, free: -0.2 };
  var KIND_K = { soft: 0.15, friend: 0.05, none: 0, other: -0.1, taken: -0.25, lock: -0.4 };
  var KIND_NM = { soft: 'ためらいのある断り方', friend: '友達として、という理由つきの断り方', none: 'きっぱりした断り方', other: 'ほかに好きな人がいるという理由つきの断り方', taken: '恋人がいるという断り方', lock: '心を決めた相手がいるという断り方', dislike: '苦手に思われている' };
  P.score = function (ctx, a, b, k) {
    var r = ctx.R(a, b), parts = [], v = 0.2, ps = psOf(a);
    function add(x, nm) { if (!x) return; v += x; parts.push(nm + (x > 0 ? '＋' : '－')); }
    add(PS_K[ps] || 0, '態度「' + ((HK.PERSONA && HK.PERSONA[ps] && HK.PERSONA[ps].label) || ps) + '」');
    if (a.faithful) add(0.25, '一途');
    if (a.honmei === b.i || from(ctx, a, b, 'honmei')) add(0.35, '本命');
    else if (from(ctx, a, b, 'crush')) add(0.08, '片想い');
    add(Math.max(-0.1, Math.min(0.3, (r.att - 50) / 100)), '惹かれ ' + Math.round(r.att));
    var w = a.will;
    if (w === 'strong') add(0.15, '心が強い'); else if (w === 'weak') add(-0.12, '心が弱い');
    if (has(ctx, a, b, 'childhood') || has(ctx, a, b, 'best') || has(ctx, a, b, 'almost') || (has(ctx, a, b, 'ex') && r.att > 40)) add(0.12, '長い付き合い');
    else if (r.trust > 45) add(0.05, '信頼');
    add(KIND_K[k] || 0, KIND_NM[k] || '断り方');
    if (a.tr) add(-a.tr.cold * 0.15, 'ドライさ');
    return { p: Math.max(0.03, Math.min(0.92, v)), why: parts.join('・') };
  };
  /* 断り方：呼ぶ側の手がかり（hint）と、今の相手の気持ちから */
  function kindOf(ctx, a, b, hint) {
    if (hint === 'dislike' || bothered(ctx, a, b)) return 'dislike';
    if (loverOf(ctx, b, a)) return 'taken';
    if (HK.lockOut && HK.lockOut(b, a)) return 'lock';
    if (hint === 'soft' || hint === 'friend' || hint === 'other' || hint === 'none') return hint;
    var rb = ctx.R(b, a);
    if (rb.att >= 22) return 'soft';
    if (heartOf(ctx, b, a)) return 'other';
    return rb.aff > 30 ? 'friend' : 'none';
  }
  /* 断られた直後に呼ぶ。o = { k: 断り方の手がかり, silent: 文を返さない }。戻り値 { st: 'keep'|'give', text, why } */
  P.reject = function (ctx, a, b, o) {
    o = o || {};
    if (!ctx || !a || !b || a === b) return null;
    var pf = ctx.pair(a, b), S = pf.hpS || (pf.hpS = {}), x = S[a.i];
    if (x && x.n >= 2) return null;
    if (x) { x.n = 2; return null; }   /* 二度目は P.second で決める（ここに来るのは、箱庭の告白がもう一度起きたときだけ） */
    var k = kindOf(ctx, a, b, o.k), sc = k === 'dislike' ? { p: 0, why: KIND_NM.dislike } : P.score(ctx, a, b, k);
    var keep = k !== 'dislike' && !marked(a, b) && hr(ctx) < sc.p;
    var c = heartOf(ctx, b, a);
    x = S[a.i] = { st: keep ? 'keep' : 'give', k: k, at: ctx.stepIndex, n: 1, att0: ctx.R(b, a).att, sv: 0, last: ctx.stepIndex, c: c ? c.i : null };
    if (keep) a.flags.unreqPersist = b.i;
    tr('reject', { a: a.i, b: b.i, step: ctx.stepIndex, ps: psOf(a), st: x.st, k: k, p: sc.p, faith: !!a.faithful, honmei: a.honmei === b.i || !!from(ctx, a, b, 'honmei') });
    var why = '／' + (keep ? '諦めない' : '諦める') + '（' + sc.why + '）';
    if (o.silent) return { st: x.st, text: '', why: why };
    var m = { a: a.name, b: b.name };
    var t = keep ? pk(ctx, T.decide[psOf(a)]) : pk(ctx, T.give);
    return { st: x.st, text: t ? fill(t, m) : '', why: why };
  };
  P.keeps = function (ctx, a, b) { var x = rec(ctx, a, b); return !!x && (x.st === 'keep' || x.st === 'keep2'); };
  P.state = function (ctx, a, b) { var x = rec(ctx, a, b); return x ? x.st : ''; };
  /* 失恋を受け入れて想いを手放した（heartbreak.js の hb_letgo）：諦めない線を終える */
  P.letGo = function (ctx, a, b) { var x = rec(ctx, a, b); if (x && (x.st === 'keep' || x.st === 'keep2')) { x.st = 'give'; if (a.flags.unreqPersist === b.i) a.flags.unreqPersist = null; } };
  /* 箱庭の告白（ふたりの日常）：もう一度告白してよいか（記録が無い＝一度目、諦めない人の二度目だけ） */
  P.mayConfess = function (ctx, a, b) { var x = rec(ctx, a, b); return !x || (x.st === 'keep' && x.n < 2 && !bothered(ctx, a, b) && !loverOf(ctx, b, a)); };
  /* 箱庭の告白（オメガバース）：この組の告白を、箱庭の側ではもう起こさない（二度目は hp_again が受け持つ） */
  P.blocked = function (ctx, a, b) { var x = rec(ctx, a, b); return !!x && x.st !== 'won'; };

  /* ---------- 二度目の告白 ---------- */
  function againTrig(ctx, a, b, x) {
    var rb = ctx.R(b, a), out = [];
    if (rb.att >= x.att0 + 6 || rb.att >= 30) out.push('moved');
    if (x.c != null) { var c = ctx.chars[x.c]; if (!alive(c) || heartOf(ctx, b, a) !== c) out.push('freed'); }
    if (ctx.present().filter(alive).length <= 2) out.push('alone');
    return out;
  }
  function canWin(ctx, a, b) {
    var rb = ctx.R(b, a);
    return rb.att >= 30 && rb.aff >= 18 && HK.canLove(a, b) && HK.canLove(b, a) && !loverOf(ctx, b, a) && !loverOf(ctx, a, b) && (!HK.Poly || HK.Poly.canCouple(ctx, a, b));
  }
  /* 二度目の告白の言葉（{a} の態度。前回を踏まえた言い方）。場面の頭（箱庭ごと）を付けるかは o.at */
  P.againText = function (ctx, a, b, o) {
    var m = { a: a.name, b: b.name }, at = o && o.at === false ? '' : pk(ctx, T.againAt[ctx.scen.id] || T.againAt.any) || '';
    var t = pk(ctx, T.again[psOf(a)]);
    return t ? fill(at + t, m) : '';
  };
  /* 二度目の告白の結果。ok：実ったか。戻り値 { text: 相手の返事＋そのあと, why, st } */
  P.second = function (ctx, a, b, ok) {
    var pf = ctx.pair(a, b), S = pf.hpS || (pf.hpS = {}), x = S[a.i] || (S[a.i] = { st: 'keep', k: 'soft', at: ctx.stepIndex, n: 1, att0: ctx.R(b, a).att, sv: 0 });
    x.n = 2; x.at2 = ctx.stepIndex;
    var m = { a: a.name, b: b.name };
    if (ok) {
      x.st = 'won';
      tr('again', { a: a.i, b: b.i, ps: psOf(a), ok: true });
      var y = pk(ctx, T.yes2[psOf(b)]);
      return { st: 'won', text: y ? fill(y, m) : '', why: '二度目の告白。' + b.name + 'の気持ちも、前より動いていた（惹かれ ' + Math.round(ctx.R(b, a).att) + '）' };
    }
    var stay = (a.will === 'strong' || a.faithful || a.honmei === b.i || psOf(a) === 'devoted') && a.will !== 'weak' && hr(ctx) < 0.6;
    x.st = stay ? 'keep2' : 'final';
    if (!stay && a.flags.unreqPersist === b.i) a.flags.unreqPersist = null;
    tr('again', { a: a.i, b: b.i, ps: psOf(a), ok: false, stay: stay });
    var n = pk(ctx, T.no2[psOf(b)]), f = pk(ctx, (stay ? T.finKeep : T.finGive)[psOf(a)]);
    return { st: x.st, text: fill((n || '') + (f || ''), m), why: '二度目の告白。' + b.name + 'の答えは変わらなかった（惹かれ ' + Math.round(ctx.R(b, a).att) + '）。' + a.name + 'は' + (stay ? '告白はこれで最後にして、それでも想い続けることにした（心の強さ）' : '今度こそ、想いに区切りをつけた') };
  };

  /* ---------- 出来事 ---------- */
  /* 関係は問わない（告白して断られたかで決まる。出来事の一覧の tie: '-'） */
  function mk(id, cat, w, when, run) { return { id: id, cat: cat, tie: '-', scope: 'pair', mini: true, sig: true, when: when, w: w, run: run }; }
  /* 諦めない人が、変わらずそばにいる（相手の反応つき） */
  function stayOk(ctx, a, b) {
    var x = rec(ctx, a, b);
    if (!x || (x.st !== 'keep' && x.st !== 'keep2') || x.sv >= (x.st === 'keep2' ? 1 : 3) || ctx.stepIndex <= x.last) return false;
    if (!alive(a) || !alive(b) || bothered(ctx, a, b) || marked(a, b) || ctx.pair(a, b).couple) return false;
    /* a に恋人ができた（気持ちが移った）なら、もう追わない */
    if (loverOf(ctx, a, b)) { x.st = 'moved'; return false; }
    return ctx.romanceOk([a, b]);
  }
  function kindPick(ctx, a, b, x, taken) {
    if (taken) return heartOf(ctx, b, a) ? 'cheer' : 'watch';
    if (x.st === 'keep2') return 'watch';
    var ps = psOf(a), w = { kind: 1, near: 1, watch: 1, still: 1 };
    if (ps === 'devoted' || ps === 'gentle' || ps === 'polite') w.kind += 1;
    if (ps === 'shy' || ps === 'cool' || ps === 'stern') w.watch += 1;
    if (ps === 'proud' || ps === 'free' || ps === 'tsun') w.still += 1;
    if (x.sv === 0) w.still *= 0.5;
    if (heartOf(ctx, b, a)) w.cheer = 1.2;
    var tot = 0, k; for (k in w) tot += w[k];
    var r = hr(ctx) * tot; for (k in w) { r -= w[k]; if (r <= 0) return k; }
    return 'kind';
  }
  function reactOf(ctx, a, b, x, kind, taken) {
    var rb = ctx.R(b, a);
    if (kind === 'watch' && hr(ctx) < 0.5) return '';
    if (rb.ten > 25 || rb.aff < 5 || (x.sv >= 1 && rb.att < x.att0 + 3 && hr(ctx) < 0.22 + b.tr.cp * 0.2)) return 'refuse';
    if (!taken && kind !== 'cheer' && (rb.att >= x.att0 + 6 || rb.att >= 26)) return 'sway';
    return hr(ctx) < 0.3 + b.tr.ac * 0.3 + b.tr.cold * 0.2 ? 'ignore' : 'puzzle';
  }
  var CHEER_CP = /\{a\}は\{c\}|\{c\}を見据え|\{c\}が待って|\{c\}となら/;
  var LIST = [
    mk('hp_stay', 'bond', function (ctx, a, b) { var x = rec(ctx, a, b); return ((x && x.sv === 0 ? 36 : 9) + a.tr.np * 2 + a.tr.ac) * (ctx.scen.id === 'omega' ? 0.35 : 1); },
      function (ctx, a, b) { return stayOk(ctx, a, b); },
      function (ctx, a, b) {
        var x = rec(ctx, a, b), lov = loverOf(ctx, b, a), taken = !!lov || !!(HK.lockOut && HK.lockOut(b, a));
        var kind = kindPick(ctx, a, b, x, taken), c = kind === 'cheer' ? heartOf(ctx, b, a) : null;
        /* {c} に話しかける文・付き合っている前提の文は、{b} と {c} が恋人どうしのときだけ */
        var pool = kind === 'cheer' ? T.cheer[psOf(a)].filter(function (s) { return couple(ctx, b, c) || !CHEER_CP.test(s); }) : T.stay[kind][psOf(a)];
        var t = pk(ctx, pool);
        if (!t) return null;
        var re = reactOf(ctx, a, b, x, kind, taken), r2 = re ? pk(ctx, T.react[re][psOf(b)]) : '';
        if (re && !r2) re = '';
        var m = { a: a.name, b: b.name, c: c ? c.name : '' }, tail = '';
        x.sv++; x.last = ctx.stepIndex;
        var KN = { kind: '変わらず優しくする', near: 'そばにいる', watch: '見守る', still: '「まだ好き」を態度で示す', cheer: '相手の恋を応援しながら想い続ける' };
        var RN = { puzzle: '戸惑った', ignore: '気づかないふりをした', sway: '少し心が揺れた', refuse: '改めて断った' };
        if (re === 'refuse') {
          x.st = 'back'; if (a.flags.unreqPersist === b.i) a.flags.unreqPersist = null;
          tail = pk(ctx, T.back[psOf(a)]) || '';
          ctx.mod2(a, b, { att: -10, aff: 2 }, { ten: -4, trust: 4 }); ctx.stress(a, 10);
        } else {
          ctx.mod2(a, b, { att: 1, aff: 1 }, taken ? { aff: 3, trust: 3 } : { aff: 3, trust: 3, att: re === 'sway' ? 5 : 2 + Math.round(b.tr.np * 2) });
          ctx.stress(a, kind === 'cheer' ? 6 : 2);
        }
        tr('stay', { a: a.i, b: b.i, ps: psOf(a), kind: kind, react: re || '-', taken: taken, bothered: bothered(ctx, a, b) });
        return { text: fill(t + (r2 || '') + tail, m), why: a.name + 'は、' + b.name + 'に断られても諦めていない（' + KN[kind] + '）' + (re ? '。' + b.name + 'は' + RN[re] : '') + (re === 'refuse' ? '。' + a.name + 'は、相手を困らせないように身を引いた' : ''), mag: re === 'refuse' || re === 'sway' ? 22 : 14, with: c ? [c] : null };
      }),
    mk('hp_again', 'romance', function (ctx, a, b) { var x = rec(ctx, a, b), g = x ? againTrig(ctx, a, b, x) : []; return (6 + (g.indexOf('moved') >= 0 ? 8 : 0) + (g.indexOf('freed') >= 0 ? 6 : 0) + (g.indexOf('alone') >= 0 ? 3 : 0)) * (ctx.scen.id === 'omega' ? 0.4 : 1); },
      function (ctx, a, b) {
        var x = rec(ctx, a, b);
        if (!x || x.st !== 'keep' || x.n >= 2 || x.sv < 1 || ctx.stepIndex - x.at < 2 || ctx.stepIndex <= x.last) return false;
        if (!alive(a) || !alive(b) || bothered(ctx, a, b) || marked(a, b) || ctx.pair(a, b).couple) return false;
        /* 相手に恋人がいるときは告白しない（奪わない）。相手が恋愛相手を別の人に決めているときも */
        if (loverOf(ctx, b, a) || loverOf(ctx, a, b) || (HK.lockOut && HK.lockOut(b, a)) || (HK.Poly && !HK.Poly.canTry(ctx, a, b))) return false;
        if (!HK.canLove(a, b) || !ctx.romanceOk([a, b])) return false;
        return againTrig(ctx, a, b, x).length > 0 || x.sv >= 2;
      },
      function (ctx, a, b) {
        var x = rec(ctx, a, b), g = againTrig(ctx, a, b, x), ok = canWin(ctx, a, b);
        var t = P.againText(ctx, a, b);
        if (!t) return null;
        var hadLover = !!loverOf(ctx, b, a);
        var r = P.second(ctx, a, b, ok);
        if (ok) { ctx.pair(a, b).couple = true; ctx.mod2(a, b, { att: 10, aff: 12, trust: 10, ten: -8 }, { att: 12, aff: 12, trust: 10, ten: -8 }); if (a.flags.unreqPersist === b.i) a.flags.unreqPersist = null; }
        else { ctx.mod2(a, b, { att: r.st === 'keep2' ? -4 : -16 }, { aff: 2 }); ctx.stress(a, r.st === 'keep2' ? 12 : 18); }
        tr('again2', { a: a.i, b: b.i, ok: ok, hadLover: hadLover, trig: g.join(',') || 'time', bothered: bothered(ctx, a, b) });
        var TG = { moved: b.name + 'の気持ちが少し動いた', freed: b.name + 'の想い人が、もうそばにいない', alone: 'ふたりきり' };
        return { text: t + r.text, why: a.name + 'は、' + (g.length ? g.map(function (k) { return TG[k]; }).join('・') : '時間を置いた') + 'のを機に、もう一度想いを伝えた。' + r.why, mag: ok ? 34 : 28 };
      })
  ];
  /* ふたりの日常は箱庭の告白（scenario-futari.js）が二度目も受け持つので、二度目の告白の出来事は足さない */
  ['goukon', 'classroom', 'island', 'whiteroom', 'omega'].forEach(function (id) { if (HK.addMini) HK.addMini(id, LIST); });
  if (HK.addMini) HK.addMini('futari', [LIST[0]]);
  var ZC = LIST.map(function (e) { var e2 = {}; for (var k in e) e2[k] = e[k]; e2.mini = false; return e2; });
  if (HK.atScen) HK.atScen('zombie', function () { var Z = HK.ZB; if (Z && Z.scen) HK.addTo(Z.scen.events, ZC); });

  /* ---------- 結末：結果の住人に、諦めない・諦めたの印を書く（epilogue.js の「その後」が読む） ---------- */
  if (HK.Emo && HK.wrap) HK.wrap(HK.Emo, 'summary', function (f0) {
    return function (ctx, chars) {
      var r = f0.apply(this, arguments);
      try {
        (ctx.chars || []).forEach(function (a) {
          var best = null;
          ctx.chars.forEach(function (b) { if (b === a) return; var x = rec(ctx, a, b); if (x && (!best || x.at >= best.x.at)) best = { b: b, x: x }; });
          var s = best && chars && chars[a.i];
          if (s && /^(keep|keep2|give|back|final)$/.test(best.x.st)) { s.hpTo = best.b.i; s.hpSt = best.x.st; }
        });
      } catch (e) { /* 結末の印は無くても動く */ }
      return r;
    };
  });
})();
/* @labels（出来事の一覧の表示名。hakoniwa-tools/build/event-catalog.js が読む）
   hp_stay=断られても諦めずにそばで想い続ける
   hp_again=時間を置いて二度目の告白をする
*/
