/* 箱庭シミュレーター（R18版のみ）― 内容のスイッチ（content.js）の場面を、ふつうの箱庭でも起こす仕組み（文は content-text-r18.js）
   どれも「展開の重さ：重い」（mood-dial.js）で、そのスイッチが入のときだけ働く（穏やか・ふつうでは今までどおり。乱数も引かない）。
   クラスメイト（教室）には足さない。恋愛対象（HK.canLove 両方向）・受け攻め（HK.Pos.okSex・order）・恋愛やR18にしない組・R18に参加しない・
   性行為の相手の固定（HK.State.pairSex・HK.sexBlocked）・恋愛の起こりやすさ0（ctx.romanceOk）を守る。
   ・妊娠・孕む描写（preg）
       エンジン型の箱庭（合コン・無人島・出られない部屋・オメガバース・ゾンビの街）：住人二人の体の関係の出来事のあと、
       攻めに男性器があり受けが女性器だけ（HK.Pos.gen＝'f'。ふたなり・男性の受けは除く）なら、ときどき「孕んだかもしれない」の段を足す
       （オメガバースの発情期のα×Ω・番は起きやすい。男性の体（男性器だけ）の受けのΩには、孕むはずのない体の疑似の気配だけ）。
       のちの区切りで「妊娠が分かる」（ct_preg_news。二人の間柄で文が変わる）、結末の「その後」に妊娠・出産の一行。
       催眠（物語型）：性的な暗示を受けた女性器だけの人で、かける側に男性器があれば、結末に妊娠に気づく段。
   ・暴力をともなう性描写（violence）：敵対する二人の強引なエッチ（hate-sex-r18.js の HK.HateSex.scene。出られない部屋・オメガバース・ゾンビの街・合コン）に、
       攻めの暴力（頬を張る・押さえつける・首に手をかける。体の組 m／ff／fm）と受けの反応（態度9種。怯え・反発）の段を差し込む（HS.extra）。
       歪んだ関係の「拒めない夜」にも暴力の段を足す。
   ・DVなど歪んだ関係（abuse）：関係「歪んだ関係」（tie-abuse.js）が無くても、恋人・夫婦・許嫁・番・執着の組で、支配的な気質
       （CP・ドライさ・攻撃性が高い。執着は執着する側）の人が、束縛→暴言→暴力→謝罪→（相手の反応）を繰り返す（ct_dv）。
       相手の反応（耐える・反発・逃げ出したい）は相手の気質から。周りの人が気づく・間に入る、離れる決心（恋人ではなくなる）。
       合意のない展開も入なら、暴力の段の代わりに「拒めない夜」（受け攻めの指定どおり、支配する側が攻めのときだけ）。結末に行く末（歪んだままの関係・別れた・周りが引き離した）。
       催眠：かける側が恋人・ストーカーなら、結末に「暗示で縛り続ける」段。
   ・合意のない展開（force）：合コンで、敵対する二人の帰り道の強引なエッチ（ct_goukon_hate。hate-sex-r18.js の場面）。
       催眠で同意のない催眠になったとき、理由に〔合意のない展開〕と書く（重さに関係なく）。
   記録の理由（why）には〔妊娠〕〔暴力をともなう性描写〕〔DVなど歪んだ関係〕〔合意のない展開〕の印を書く（遊ぶ人が見分けられるように。点検の道具も数える）。
   全年齢版にはこのファイルはない。登場人物はすべて成人として扱う */
(function () {
  'use strict';
  var HK = window.HK;
  if (!HK || !HK.COMMON || !HK.Ctx || !HK.CtText || !HK.simulate) return;
  var T = HK.CtText;
  /* いま回している箱庭の ctx（結末に「その後」を足すため）。体の関係・歪んだ関係を記録したときに覚える */
  var CUR = null;
  var NO_SCEN = { classroom: 1 };
  function scenOf(x) { return x && x.scen && x.scen.id; }
  /* そのスイッチが入で、展開の重さが「重い」か */
  function on(x, tag) {
    if (HK.SAFE_ON || !HK.Content || !HK.Dark || !x || !x.env) return false;
    if (HK.Dark.on(x.env) !== 'dark') return false;
    return HK.Content.on(x.env, tag, scenOf(x));
  }
  function pk(x, arr) { return arr[Math.floor(x.rng() * arr.length)]; }
  function tiesOf(ctx, a, b) { return HK.Ties && HK.Ties.all && ctx.tiesAll ? HK.Ties.all(ctx, a, b) : []; }
  function book(ctx) { CUR = ctx; return (ctx._ct = ctx._ct || { preg: [], dv: [] }); }
  /* 体の組：m＝攻めが男性の体／ff＝女性どうし／fm＝女性の攻めが男性に（hate-sex-r18.js と同じ） */
  function kindOf(t, b) { var P = HK.Pos; return P && P.isF(t, b) ? (P.isF(b, t) ? 'ff' : 'fm') : 'm'; }
  function join(t, add) { return t + (/\n/.test(t) ? '\n\n' : '') + add; }

  /* ================= 妊娠・孕む描写 ================= */
  /* 二人の間柄（文の選び分け）：執着（どちらが執着する側か）・強引（敵対・強引な場面）・恋人・その場かぎり */
  function relKind(ctx, Tp, B, why) {
    var ts = tiesOf(ctx, Tp, B), pf = ctx.pair(Tp, B);
    var y = ts.filter(function (t) { return t.type === 'yan' || t.type === 'abuse'; })[0];
    if (y) return y.a === Tp.i ? 'yanT' : 'yanB';
    if (pf.ctDv) return pf.ctDv.d === Tp.i ? 'yanT' : 'yanB';
    if (/強引|拒めない|襲|無理やり|〔合意のない展開〕/.test(why || '') || ts.some(function (t) { return /^(enemy|rival|bad)$/.test(t.type); })) return 'forced';
    if (pf.couple || ts.some(function (t) { return /^(lover|spouse|fiance|mate|fated)$/.test(t.type); })) return 'couple';
    return 'casual';
  }
  function pregHook(ctx, o, e) {
    if (NO_SCEN[scenOf(ctx)] || !HK.sexEv || !HK.sexEv(ctx, o).sex) return;
    var P = HK.Pos, acts = (o.actors || []).filter(function (c) { return c && c.i != null && ctx.chars[c.i] === c; });
    if (!P || acts.length !== 2) return;
    var ord = P.order(acts[0], acts[1], [acts[0], acts[1]]), Tp = ord[0], B = ord[1];
    if (B._ctPreg || !P.okSex(Tp, B) || !P.hasM(Tp) || (ctx._ct && ctx._ct.preg.length >= 2)) return;
    var om = scenOf(ctx) === 'omega' && Tp.om && B.om, ao = om && Tp.om.sex === 'a' && B.om.sex === 'o';
    var g = P.gen(B), pseudo = false;
    if (g !== 'f') { if (ao && g === 'm') pseudo = true; else return; }
    var heat = ao && (B.om.heat > 0 || Tp.om.rut > 0);
    var bond = ao && HK.OMEGA && HK.OMEGA.B && HK.OMEGA.B.mateOf && HK.OMEGA.B.mateOf(ctx, B) === Tp;
    /* オメガバースは数か月〜二年で夜が多いので、一回ごとの確率を低く（発情期・番で上がる） */
    var p = pseudo ? 0.12 : om ? 0.03 + (heat ? 0.04 : 0) + (bond ? 0.06 : 0) : 0.22 + (scenOf(ctx) === 'goukon' ? 0.06 : 0);
    if (ctx.rng() >= p) return;
    var lw = HK.Lewd, low = lw && lw.lv(ctx.env) === 'low';
    var list = pseudo ? T.PREG_PSEUDO : bond ? T.PREG_BOND : heat ? T.PREG_HEAT : !low && lw && lw.ero(ctx.env) ? T.PREG_HINT_ERO : T.PREG_HINT;
    var kind = relKind(ctx, Tp, B, e.why);
    B._ctPreg = { by: Tp.i, at: ctx.stepIndex, kind: kind, pseudo: pseudo, omega: !!om, known: false };
    book(ctx).preg.push(B.i);
    /* 行為の記録のすぐあとに、一つの記録として足す（行為の文の最後に、部屋を出る文などが続くことがあるため） */
    ctx.say({ kind: 'event', cat: 'solo', actors: [B, Tp], sex: true, mag: 14, text: ctx.t(pk(ctx, list), Tp, B),
      why: '〔妊娠〕' + (pseudo ? B.name + 'の体が、孕むはずのない熱を宿したがった（疑似）' : B.name + 'は' + Tp.name + 'の子を孕んだかもしれない' + (heat ? '（発情期のα×Ω）' : bond ? '（番）' : '')) + '／内容のスイッチ「妊娠・孕む描写」・展開：重い' });
  }
  /* 体の関係の出来事を記録したあとに見る（エンジン型の箱庭）。暴力の段を差し込んだ場面が、厚い版の差し替え（omega-thick.js など）で落ちていたら、最初の段落のあとに戻す */
  var say0 = HK.Ctx.prototype.say;
  HK.Ctx.prototype.say = function (o) {
    var e = say0.apply(this, arguments), vp = this._ctViolPend;
    if (vp && e && typeof e.text === 'string' && typeof e.why === 'string' && e.why.indexOf('〔暴力をともなう性描写〕') >= 0) {
      this._ctViolPend = null;
      if (e.text.indexOf(vp) < 0) { var cut = e.text.indexOf('\n\n'); e.text = cut > 0 ? e.text.slice(0, cut) + '\n\n' + vp + e.text.slice(cut) : e.text + vp; }
    }
    if (e && !e.skipped && o && o.kind === 'event' && typeof e.text === 'string' && on(this, 'preg')) pregHook(this, o, e);
    return e;
  };
  /* 妊娠が分かる（身ごもった人が動いたとき。相手と二人の出来事） */
  HK.COMMON.push({
    id: 'ct_preg_news', cat: 'solo', scope: 'solo', pri: true, noOdd: true, r18: true,
    when: function (ctx, a) {
      var p = a._ctPreg;
      if (!p || p.known || p.pseudo || ctx.stepIndex - p.at < 1 || !on(ctx, 'preg')) return false;
      var F = ctx.chars[p.by];
      return !!F && HK.State.here(F) && HK.State.here(a);
    },
    w: function () { return 4; },
    run: function (ctx, a) {
      var p = a._ctPreg, F = ctx.chars[p.by], k = T.NEWS[p.kind] ? p.kind : 'casual';
      p.known = true;
      if (k === 'couple') ctx.mod2(a, F, { aff: 6, trust: 4 }, { aff: 6, trust: 4 });
      else if (k === 'forced') { ctx.mod2(a, F, { ten: 10, trust: -6 }, { ten: 6 }); ctx.stress(a, 12); }
      else if (k === 'yanT') { ctx.mod2(a, F, { ten: 6 }, { att: 8 }); ctx.stress(a, 10); }
      else if (k === 'yanB') ctx.mod2(a, F, { att: 8 }, { ten: 8 });
      else ctx.stress(a, 6);
      var lab = { couple: '恋人の子', casual: 'その場かぎりの相手の子', forced: '強引に抱かれた相手の子', yanT: '執着する相手の子', yanB: '執着する相手の子（' + a.name + 'が執着する側）' }[k];
      return { cat: k === 'couple' ? 'bond' : k === 'casual' ? 'solo' : 'conflict', with: [F], text: ctx.t(pk(ctx, T.NEWS[k]), a, F), why: a.name + 'の妊娠が分かった（' + F.name + 'との、' + lab + '）／〔妊娠〕内容のスイッチ「妊娠・孕む描写」・展開：重い', mag: 30 };
    }
  });

  /* ================= 暴力をともなう性描写：敵対する二人の強引なエッチに差し込む段 ================= */
  var HS = HK.HateSex;
  if (HS && HS.scene && HS.why) {
    HS.extra = function (x, Tp, B, k) {
      if (!on(x, 'violence') || !HS.hostile(x, Tp, B) || x.rng() >= 0.45) return '';
      var ps = HK.personaOf ? HK.personaOf(B) : B.persona;
      var t = pk(x, T.VIOL_TOP[k] || T.VIOL_TOP.m) + pk(x, T.VIOL_REACT[ps] || T.VIOL_REACT.gentle);
      x._ctViol = { n: x.log ? x.log.length : 0, text: t.replace(/\{a\}/g, Tp.name).replace(/\{b\}/g, B.name) };
      return t;
    };
    /* 差し込んだ場面の理由に印を足す（場面を作った直後に理由を作る呼び方だけ。間に別の記録が入ったら足さない） */
    var why0 = HS.why;
    HS.why = function (x) {
      var w = why0.apply(this, arguments), v = x && x._ctViol;
      if (v && v.n === (x.log ? x.log.length : 0)) { w += '／〔暴力をともなう性描写〕' + '攻めが手を上げた（内容のスイッチ「暴力をともなう性描写」・展開：重い）'; x._ctViolPend = v.text; }
      if (x) x._ctViol = null;
      return w;
    };
  }

  /* ================= 合意のない展開：合コンの帰り道の、敵対する二人 ================= */
  HK.COMMON.push({
    id: 'ct_goukon_hate', cat: 'romance', sex: true, scope: 'pair', pri: true, r18: true,
    when: function (ctx, a, b) {
      if (!b || scenOf(ctx) !== 'goukon' || !HS || ctx.stepIndex < 3 || !on(ctx, 'force')) return false;
      var pf = ctx.pair(a, b);
      if (pf.ctHate || pf.hateSexAt != null || !HK.State.pairSex(a, b) || !ctx.romanceOk([a, b], { sex: true })) return false;
      return HS.order(ctx, a, b)[0] === a && HS.hostile(ctx, a, b) && !HS.taken(ctx, a, b);
    },
    w: function (ctx, a) { return 3 + (a.tr.aggr || 0) + (a.tr.impulse || 0) * 0.5; },
    run: function (ctx, a, b) {
      var pf = ctx.pair(a, b), o = HS.order(ctx, a, b);
      pf.ctHate = true; pf.night = true; pf.nights = (pf.nights || 0) + 1; pf.hateSex = (pf.hateSex || 0) + 1; pf.hateSexAt = ctx.stepIndex;
      ctx.mod2(a, b, { att: 10, aff: 3, ten: -2 }, { att: 10, aff: 3, ten: -2 });
      var text = HS.scene(ctx, a, b, { place: ctx.t(pk(ctx, T.GOUKON_HATE), o[0], o[1]) });
      return { cat: 'romance', sex: true, text: text, why: HS.why(ctx, a, b) + '／合コンの帰り道／〔合意のない展開〕内容のスイッチ「合意のない展開」・展開：重い', mag: 28 };
    }
  });

  /* ================= DVなど歪んだ関係 ================= */
  var DVT = /^(lover|spouse|fiance|mate|fated|yan)$/, LONG = { omega: 1, island: 1, zombie: 1 };
  var STYLE = { endure: '耐えている', resist: '反発している', flee: '逃げ出したい' };
  /* 支配しやすさ：支配（CP）・冷たさ（ドライさ）・短気（攻撃性） */
  function domScore(c) { var t = c.tr || {}; return (t.cp || 0) * 0.45 + (t.cold || 0) * 0.3 + (t.aggr || 0) * 0.25; }
  function dvTie(ctx, a, b) { return tiesOf(ctx, a, b).filter(function (t) { return DVT.test(t.type); })[0] || null; }
  function domOf(ctx, a, b, tie) {
    if (tie && tie.type === 'yan') { var Y = ctx.chars[tie.a]; return Y && domScore(Y) >= 0.45 ? Y : null; }
    var D = domScore(a) >= domScore(b) ? a : b, O = D === a ? b : a;
    return domScore(D) >= 0.55 && domScore(D) - domScore(O) >= 0.04 ? D : null;
  }
  /* 支配される側の反応：耐える（AC・NP）／反発（CP・攻撃性）／逃げ出したい（慎重さ・A） */
  function styleOf(c) {
    var t = c.tr || {}, s = { endure: (t.ac || 0) * 0.55 + (t.np || 0) * 0.45, resist: (t.cp || 0) * 0.55 + (t.aggr || 0) * 0.45, flee: (t.caution || 0) * 0.55 + (t.a || 0) * 0.45 };
    return s.resist > s.endure && s.resist >= s.flee ? 'resist' : s.flee > s.endure ? 'flee' : 'endure';
  }
  function witness(ctx, D, V) {
    return ctx.present().filter(function (c) { return c !== D && c !== V && ctx.R(c, V).aff > 10; })
      .sort(function (x, y) { return (y.tr.np + ctx.R(y, V).aff / 100) - (x.tr.np + ctx.R(x, V).aff / 100); })[0] || null;
  }
  /* 拒めない夜：合意のない展開も入で、体の関係になれる組（支配する側が攻め） */
  function nightOk(ctx, D, V) {
    if (!on(ctx, 'force') || !HK.Pos || !HK.State.pairSex(D, V) || !HK.canLove(D, V) || !HK.canLove(V, D)) return false;
    if ((HK.sexBlocked && HK.sexBlocked(D, V)) || !ctx.romanceOk([D, V], { sex: true })) return false;
    return HK.Pos.order(D, V, [D, V])[0] === D;
  }
  HK.COMMON.push({
    id: 'ct_dv', cat: 'conflict', scope: 'pair', pri: true, r18: true,
    when: function (ctx, a, b) {
      if (!b || NO_SCEN[scenOf(ctx)] || !on(ctx, 'abuse')) return false;
      var pf = ctx.pair(a, b);
      /* 長い箱庭（数か月〜の区切り）では二区切りに一度。一組で六回まで */
      if (pf.ctDvEnd || pf.abFree || (pf.ctDv && pf.ctDv.n >= 6) || (pf.ctDvAt != null && ctx.stepIndex - pf.ctDvAt < (LONG[scenOf(ctx)] ? 2 : 1))) return false;
      if (HK.Ties && HK.Ties.has && HK.Ties.has(ctx, a, b, 'abuse')) return false;
      var tie = dvTie(ctx, a, b);
      if (!tie && !pf.couple) return false;
      if (!HK.State.pairLove(a, b)) return false;
      var D = pf.ctDv ? ctx.chars[pf.ctDv.d] : domOf(ctx, a, b, tie);
      return D === a || D === b;
    },
    /* 始まった二人は続きやすい（繰り返しの流れを見せるため） */
    w: function (ctx, a, b) { var st = ctx.pair(a, b).ctDv; return 0.8 + Math.max(domScore(a), domScore(b)) * 1.4 + (st ? 2 : 0); },
    run: function (ctx, a, b) {
      var pf = ctx.pair(a, b), st = pf.ctDv, tie = dvTie(ctx, a, b);
      /* 動いたのが支配される側でも、支配する側を {a} にする */
      var D = st ? ctx.chars[st.d] : domOf(ctx, a, b, tie), V = D === a ? b : a;
      if (!st) st = pf.ctDv = { d: D.i, v: V.i, n: 0, seen: false, style: styleOf(V), c: null, src: tie ? tie.type : 'couple', lab: tie ? (HK.tieLabel ? HK.tieLabel(tie) : HK.TIES[tie.type] ? HK.TIES[tie.type].label : '恋人') : '恋人' };
      st.n++; pf.ctDvAt = ctx.stepIndex;
      var cs = book(ctx); if (cs.dv.indexOf(pf) < 0) cs.dv.push(pf);
      var rng = ctx.rng, C = witness(ctx, D, V), k;
      var freeP = (st.style === 'flee' ? 0.25 : st.style === 'resist' ? 0.18 : 0.06) + (st.seen ? 0.15 : 0) + Math.min(0.2, (st.n - 4) * 0.05);
      if (st.n >= 4 && (C || st.style !== 'endure') && rng() < freeP) k = 'free';
      else if (C && st.n >= 2 && rng() < 0.3) k = st.seen && rng() < 0.55 ? 'step' : 'notice';
      else {
        var seq = ['control', 'verbal', 'violence', 'honey', st.style];
        k = seq[(st.n - 1) % seq.length];
        if (k === 'violence' && nightOk(ctx, D, V) && rng() < 0.6) k = 'night';
      }
      var text, sex = false, extra = '', vio = false;
      if (k === 'night') {
        var bk = kindOf(D, V);
        vio = on(ctx, 'violence');
        text = ctx.t(pk(ctx, T.DV_NIGHT[bk]) + (vio ? pk(ctx, T.DV_NIGHT_V[bk]) : ''), D, V);
        sex = true;
        extra = '／〔合意のない展開〕' + (vio ? '〔暴力をともなう性描写〕' : '');
      } else text = ctx.t(pk(ctx, T.DV[k]).replace(/\{c\}/g, C ? C.name : '周りの人'), D, V);
      if (k === 'control') { ctx.mod2(D, V, { att: 2 }, { ten: 5, trust: -3 }); ctx.stress(V, 6); }
      else if (k === 'verbal') { ctx.mod2(D, V, { ten: 2 }, { aff: -4, ten: 6 }); ctx.stress(V, 8); }
      else if (k === 'violence') { ctx.mod2(D, V, { ten: 4 }, { aff: -6, trust: -6, ten: 10 }); ctx.stress(V, 12); }
      else if (k === 'night') { ctx.mod2(D, V, { att: 2 }, { aff: -8, trust: -8, ten: 12 }); ctx.stress(V, 14); }
      else if (k === 'honey') { ctx.mod2(D, V, { att: 3 }, { att: 3, aff: 3, ten: -3 }); ctx.stress(V, -4); }
      else if (k === 'resist') ctx.mod2(D, V, { ten: 6 }, { ten: 6 });
      else if (k === 'endure' || k === 'flee') ctx.stress(V, k === 'flee' ? 6 : 3);
      else if (k === 'notice' || k === 'step') {
        st.seen = true; st.c = C.i;
        ctx.mod2(V, C, { trust: 8, aff: 5 }, { aff: 4 }); ctx.stress(V, -5);
        if (k === 'step') ctx.mod2(D, C, { ten: 10 }, { ten: 8, trust: -6 });
      } else if (k === 'free') {
        pf.couple = false; pf.ctDvEnd = st.seen && st.c != null ? 'rescued' : 'free';
        ctx.mod2(V, D, { att: -30, aff: -15, ten: 6 }, { ten: 8 }); ctx.stress(V, -10);
        if (C) ctx.mod2(V, C, { trust: 10, aff: 6 }, { aff: 5, trust: 4 });
      }
      if (HK.Emo && /^(?:control|verbal|violence|night|flee)$/.test(k)) HK.Emo.bump(ctx, V, { fear: k === 'violence' || k === 'night' ? 30 : 16, grief: 6 }, D.name + 'との歪んだ関係');
      var whyK = { control: '：束縛', verbal: '：暴言', violence: '：暴力', honey: '：謝って優しくなる（繰り返し）', endure: '：耐えている', resist: '：言い返した', flee: '：逃げ出したい', notice: '：' + (C ? C.name : '周り') + 'が気づいた', step: '：' + (C ? C.name : '周り') + 'が間に入った', free: '：' + V.name + 'が離れる決心をした（恋人ではなくなった）', night: '：拒めない夜' }[k];
      var src = st.src === 'yan' ? '執着（' + D.name + 'が執着する側）' : st.lab;
      return {
        cat: k === 'honey' ? 'romance' : /notice|step|free/.test(k) ? 'help' : 'conflict', sex: sex, with: C && /notice|step|free/.test(k) ? [C] : null, text: text,
        why: D.name + '（支配する側）と' + V.name + '（支配される側・' + STYLE[st.style] + '）の歪んだ関係' + whyK + '／〔DVなど歪んだ関係〕' + src + 'で、' + (st.src === 'yan' ? '執着が支配に変わった' : D.name + 'の支配的な気質（CP・ドライさ・攻撃性）') + '（内容のスイッチ「DVなど歪んだ関係」・展開：重い）' + extra,
        mag: k === 'free' ? 22 : k === 'violence' || k === 'night' || k === 'step' ? 16 : 10
      };
    }
  });

  /* ================= 結末の「その後」（エンジン型の箱庭） ================= */
  function endNotes(ctx, r) {
    var cs = ctx._ct, notes = r.end.notes = r.end.notes || [];
    cs.preg.forEach(function (i) {
      var B = ctx.chars[i], p = B && B._ctPreg;
      if (!p || B.alive === false) return;
      var F = ctx.chars[p.by], E = T.END;
      var bonded = p.omega && F && HK.OMEGA && HK.OMEGA.B && HK.OMEGA.B.mateOf && HK.OMEGA.B.mateOf(ctx, B) === F;
      var list = p.pseudo ? E.pseudo : !F || F.alive === false ? E.lost : bonded && (p.kind === 'couple' || p.kind === 'casual') ? E.omega : E[p.kind] || E.casual;
      var tx = ctx.t(pk(ctx, list), F, B);
      notes.push(/^その後/.test(tx) ? tx : 'その後：' + tx);
    });
    cs.dv.forEach(function (pf) {
      var st = pf.ctDv, D = st && ctx.chars[st.d], V = st && ctx.chars[st.v];
      if (!st || st.n < 2 || !D || !V || V.alive === false) return;
      var C = st.c != null ? ctx.chars[st.c] : null, k = pf.ctDvEnd === 'rescued' && C ? 'rescued' : pf.ctDvEnd ? 'free' : D.alive === false ? '' : 'stay';
      if (k) notes.push('その後：' + ctx.t(pk(ctx, T.DV_END[k]), D, V, C));   /* DV_END の文は「その後」で始めない */
    });
  }

  /* ================= 催眠（物語型）：結末に足す・同意のない催眠の印 ================= */
  function saiminHook(S, o) {
    var p = o.actors && o.actors[0], HY = o.actors && o.actors[1];
    if (!p || typeof p !== 'object' || !p.T) return;
    var P = HK.Pos;
    /* 同意のない催眠：導入の記録の理由に印（重さに関係なく、合意のない展開が入なら） */
    if (o.tag === p.T.label && !p._ctF && !p.consent && !p.noSex && S.env.lewd !== 'low' && HK.Content && HK.Content.ok(S, 'force')) {
      p._ctF = true;
      o.why = (o.why || '') + '／〔合意のない展開〕同意のない催眠（内容のスイッチ「合意のない展開」が入）';
    }
    if (o.tag !== '結末' || p.failed || typeof o.text !== 'string') return;
    var v = { a: p.name, h: p.h }, fmt = function (t) { return String(t).replace(/\{(a|h)\}/g, function (m, k) { return v[k]; }); };
    /* 妊娠：性的な暗示を受けた、女性器だけの受けの人。かける側に男性器がある */
    if (on(S, 'preg') && P && p.cnt && p.cnt.lewd > 0 && !p.aTop && !p.ff && !p.noSex && P.gen(p) === 'f') {
      var male = HY && typeof HY === 'object' ? P.hasM(HY) : p.hm ? P.hasM(p.hm) : !p.hf;
      if (male && S.rng() < 0.35 + (p.wokeCum ? 0.15 : 0)) {
        o.text = join(o.text, fmt(pk(S, p.route === 'forget' || p.erased === 'full' ? T.SAIMIN_PREG_FORGET : T.SAIMIN_PREG)));
        o.why = (o.why || '') + '／〔妊娠〕' + p.name + 'は' + p.h + 'の子を宿したかもしれない（内容のスイッチ「妊娠・孕む描写」・展開：重い）';
      }
    }
    /* 歪んだ関係：恋人・ストーカーのかける側が、そのあとも暗示で縛り続ける（催眠が解けて離れた結末は除く） */
    if (on(S, 'abuse') && (p.ty === 'lover' || p.ty === 'stalker') && /^(forget|body|fall|depend|accept|dazed|confused|sweet|couple)$/.test(p.route || '') && S.rng() < 0.5) {
      o.text = join(o.text, fmt(pk(S, T.SAIMIN_DV)));
      o.why = (o.why || '') + '／〔DVなど歪んだ関係〕' + p.h + 'は暗示で' + p.name + 'を縛り続けた（内容のスイッチ「DVなど歪んだ関係」・展開：重い）';
    }
  }
  /* 物語型の記録（solo-story-kit.js の HK.Story.say）は、あとで読むファイルが包み直すので、最初に回すときに包む */
  function hookStory() {
    var ST = HK.Story;
    if (!ST || !ST.say || ST.say._ct) return;
    var s0 = ST.say;
    ST.say = function (S, o) {
      if (o && S && S.scen && S.scen.id === 'saimin' && !HK.SAFE_ON && HK.Content) saiminHook(S, o);
      return s0.apply(this, arguments);
    };
    ST.say._ct = true;
  }

  var sim0 = HK.simulate;
  HK.simulate = function (input) {
    hookStory();
    CUR = null;
    var r = sim0.apply(this, arguments);
    if (CUR && CUR._ct && r && r.end && typeof r.end === 'object') endNotes(CUR, r);
    CUR = null;
    return r;
  };
  Object.keys(sim0).forEach(function (k) { HK.simulate[k] = sim0[k]; });
})();
