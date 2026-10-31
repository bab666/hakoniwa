/* @event-ok 夜の能動性の型（既にある山場に段を差すだけ。新しい出来事ではない。2026-10-31 担当E2） */
/* 箱庭シミュレーター（R18版のみ）: 夜の能動性の判定（HK.Initiative）と、山場への型の差し込み。文の表は ero-initiative-text-r18.js（HK.IniText）
   利用者の要望（2026-10-31）：「騎乗位、受け優位の展開、あるいは逆転など、夜の性格や能動性に合わせたエッチなイベント」
     補足：「受け優位・逆転は、夜の主導で受けが主導（誘い受け・襲い受け）が選ばれた時だけ」「すでにある夜の性格を、展開に反映して欲しい」
           「夜の性格の設定がない人は、ふだんの性格（態度9種）を優先で」「相手に合わせる＝乗り気でなくても相手の嗜好に付き合う」
   ■ HK.Initiative.plan(ctx, T, U, o) → 型（null なら何も差さない）。T＝攻め（挿れる側）・U＝受け（HK.Pos.order で並べた二人）
     読む設定：夜の性格の種類（HK.Attr.nightKind：sadist・maso・mean・sweet・shy／''）、態度（HK.Attr.nightAtt：夜の性格に態度を選んだ値か、気質の態度9種）、
       相手に合わせる（HK.Attr.nightAccom）、受けの夜の主導（受けの P.leadOf：sasoi・osoi／''）、攻め度・性欲（HK.Pos.lv・libOf）、受け攻め（HK.Pos.dirOk・prefer・hardTop）、
       作風（o.ero）、その場の状態（o.place：room／locker（媚薬）／goukon（酒）、o.heat：発情、同じ二人の回数 HK.Ero.pairNight）。
     決めること：
       dev     … 攻めの展開の段（夜の性格の種類 sadist・sweet・mean・shy の表、種類が無ければ態度 9 種の表＋体位の一文）。主導は攻めのまま
       pose    … 体位（ride 騎乗位・lap 対面座位・back 後背・face 正常位・side 側位。攻めが受けを上に乗せる形は、主導が攻めのままの体位の変化）
       react   … 受けの返し（夜の性格の種類 maso・sweet・shy・mean・sadist、種類が無ければ態度 9 種）
       lead    … 受けの誘い方・襲い方（夜の主導が受けのときだけ。受けの夜の性格の種類／態度で書き分け。襲い受けで攻めが自分で攻めを選んでいなければ、合意の上で手を縛ることも）＋攻めの応じ方
       change  … 型の変化（夜の主導が受けのときだけ。1 回の場面で 1 回まで）：
                 ride_b（受けが自分の意思で跨る）／shift（主導だけが移る。受け攻めは指定どおり）／
                 swap（役割の入れ替え：二人とも攻めを選んでおらず、二通りの向きが成り立ち、攻め度・相手ごとの指定で向きが決まらない組だけ。果てたあとの二度目）
                 理由の一文（WHY：発情・媚薬・酔い・攻めの疲れ・受けの性欲・攻めに煽られた・主導の設定）を必ず頭に置く
       accom   … 「相手に合わせる」で付き合っている受けが、受けが主導の設定で相手（攻め）がマゾなら、付き合って襲う一文（付き合う一文・事後の一言は attr-r18.js が出す）
     挿入の向きは受け攻めの指定に従う。攻めを選んだ人は受けにしない（swap は二人とも攻めを選んでいない組だけ。押し倒す・縛る文は、自分で攻めを選んだ攻めには使わない）。
   ■ HK.Initiative.apply(text, T, U, plan, o) … 段落（'\n\n' 区切り）の本文に差し込む（{a}{b} のまま）。o.anchor（感じていく段の文の切れ端）があればその段の後ろ、
     なければ果てる段の前。lead は始まりの段のすぐ後ろ（HK.PosLead の主導の段の後ろ）、swap と付き合いの一言は事後（o.after）の前
   ■ 包み：thick-sex.js の HK.ThickSex.scene・thick-sex-ero.js の HK.ThickEro.scene（出られない部屋・合コン・関係の夜（無人島・ゾンビ・共通）など）、
     omega-thick-kit.js の HK.TKC.body（オメガバース）。最初のシミュレーションの前に包む（pos-lead-r18.js の主導の段より内側＝主導の段のあとに並ぶ）。
     本筋の乱数は使わない：二人の名前と本文から決まる乱数（hash）で選ぶ（ほかの部品の結果を変えない）。opt.ini を渡すと型を指定できる（出来事から使う）
   ■ 点検用：HK.Initiative.log に配列を入れると、差し込んだ型を記録する（{ a, b, mode, kind, att, accom, lead, dev, pose, react, change, why, ero, H }）
   全年齢版にはこのファイルはない。登場人物はすべて成人として扱う */
(function () {
  'use strict';
  var HK = window.HK;
  if (!HK || !HK.Pos || HK.Initiative) return;
  var P = HK.Pos;
  var I = HK.Initiative = { log: null };
  var KINDS = { sadist: 1, maso: 1, mean: 1, sweet: 1, shy: 1 };
  var ATTS = ['proud', 'stern', 'tsun', 'gentle', 'devoted', 'cool', 'free', 'shy', 'polite'];
  function X() { return HK.IniText; }

  /* ---------- 設定の窓口（HK.Attr に無ければ同じ意味の代替） ---------- */
  function rawNight(a, b) { return (a && ((b && a.nightFor && a.nightFor[b.i]) || a.night || (a.src && a.src.night))) || ''; }
  I.kindOf = function (a, b) {
    var A = HK.Attr;
    if (!A || HK.SAFE_ON) return '';
    if (A.nightKind) { var k = A.nightKind(a, b); return KINDS[k] ? k : ''; }
    var v = A.nightOf ? A.nightOf(a, b) : '';
    return KINDS[v] ? v : '';
  };
  I.attOf = function (a, b) {
    var A = HK.Attr, v;
    if (A && A.nightAtt) { v = A.nightAtt(a, b); if (ATTS.indexOf(v) >= 0) return v; }
    v = A && A.nightOf ? A.nightOf(a, b) : '';
    if (ATTS.indexOf(v) >= 0) return v;
    v = HK.personaOf ? HK.personaOf(a) : a && a.persona;
    return ATTS.indexOf(v) >= 0 ? v : 'gentle';
  };
  I.accomOf = function (a, b) {
    var A = HK.Attr;
    if (!A || HK.SAFE_ON) return false;
    if (A.nightAccom) return !!A.nightAccom(a, b);
    return rawNight(a, b) === 'match' && !!I.kindOf(a, b);
  };
  /* 受けの夜の主導：この組で受けになる人（U）が「受けが主導（誘い受け・襲い受け）」を選んでいるときだけ（攻めになる人の設定は見ない。2026-10-31 の利用者の指示） */
  I.leadOf = function (T, U) { if (HK.SAFE_ON || !U || !P.leadOf) return ''; var v = P.leadOf(U); return v === 'sasoi' || v === 'osoi' ? v : ''; };
  function modeOf(T, U) { return P.isF(T, U) && P.isF(U, T) ? 'ff' : P.isF(T, U) && !P.isF(U, T) ? 'fm' : 'mf'; }
  I.modeOf = modeOf;
  /* 役割の入れ替えが成り立つ組か（二人とも攻めを選んでいない・二通りの向き・攻め度や相手ごとの指定で向きが決まらない・体の組が合う） */
  I.canSwap = function (T, U, mode) {
    if (P.hardTop(T, U) || P.hardTop(U, T)) return false;
    if (!P.dirOk(U, T) || !P.dirOk(T, U) || P.prefer(T, U)) return false;
    if (mode === 'mf') return P.hasM(U);
    if (mode === 'fm') return P.hasM(U) && P.hasF(T);
    return mode === 'ff';
  };

  /* ---------- 本筋に触れない乱数（名前と本文から） ---------- */
  function hashOf(str) { var h = 2166136261; for (var i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }
  function rngOf(seed) {
    var h = seed >>> 0;
    var f = function () { h = (h + 0x6D2B79F5) >>> 0; var t = h; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
    f.int = function (n) { return Math.floor(f() * n); };
    f.float = f;
    return f;
  }
  I.rngFor = function (T, U, text) { var t = String(text || ''); return rngOf(hashOf((T && T.name) + '\u0001' + (U && U.name) + '\u0001' + t.length + '\u0001' + t.slice(0, 80) + t.slice(-80))); };
  function pickR(r, arr) { return arr && arr.length ? arr[r.int(arr.length)] : ''; }
  function tagOf(s) { var m = /^(ride|lap|back|face|side|H)>/.exec(s); return m ? m[1] : ''; }
  function untag(s) { return String(s).replace(/^(?:ride|lap|back|face|side|H)>/, ''); }

  /* ---------- 判定 ---------- */
  /* o = { ero, place, heat, drug, drunk, nth, ini（出来事からの指定：{ change, lead, dev, react }）, memo（同じ二人の連続を避ける置き場）, r（乱数） } */
  I.plan = function (ctx, T, U, o) {
    o = o || {};
    if (HK.SAFE_ON || !T || !U || T === U || !X()) return null;
    if (P.hardTop(U, T)) return null;   /* 受けが攻め指定の組（向きの決まらない組）には足さない */
    if (HK.NoGen && HK.NoGen.on && HK.NoGen.on(T, U)) return null;
    var r = o.r || rngOf(hashOf(T.name + U.name)), ini = o.ini || {};
    var mode = o.mode || modeOf(T, U), kT = I.kindOf(T, U), kU = I.kindOf(U, T), aT = I.attOf(T, U), aU = I.attOf(U, T);
    var accT = I.accomOf(T, U), accU = I.accomOf(U, T), ld = I.leadOf(T, U), H = P.hardTop(T, U);
    var nth = o.nth || 1, libT = P.libOf(T), libU = P.libOf(U);
    var pl = { a: T, b: U, mode: mode, kind: kT, kindU: kU, att: aT, attU: aU, accT: accT, accU: accU, lead: ld, H: H, ero: !!o.ero, dev: '', pose: '', react: '', lsty: '', bind: false, tresp: '', change: '', why: '' };
    /* 型の変化（夜の主導が受けのときだけ） */
    if (ld) {
      pl.lsty = ini.lead === false ? '' : (ini.lead || r() < 0.85) ? (kU || aU || ld) : '';
      if (pl.lsty && ld === 'osoi' && !H && (kU === 'sadist' || kU === 'mean' || (!kU && (aU === 'proud' || aU === 'free' || aU === 'cool'))) && r() < 0.3) pl.bind = true;
      pl.tresp = pl.lsty && r() < 0.8 ? (kT && kT !== 'maso' ? kT : 'att') : '';
      var pc = (ld === 'osoi' ? 0.55 : 0.4) + (libU === 'high' ? 0.1 : 0) + (o.heat || o.drug || o.drunk ? 0.08 : 0) + (nth >= 2 ? 0.05 : 0);
      var ch = ini.change != null ? ini.change : r() < pc ? (I.canSwap(T, U, mode) && r() < 0.4 ? 'swap' : (r() < (ld === 'sasoi' ? 0.65 : 0.5) ? 'ride_b' : 'shift')) : '';
      if (ch === 'swap' && !I.canSwap(T, U, mode)) ch = 'shift';
      if (ch === 'ride_b' && mode === 'fm' && !P.hasM(U)) ch = 'shift';
      pl.change = ch;
      if (ch) pl.why = o.heat ? 'heat' : o.drug ? 'drug' : o.drunk ? 'drunk' : nth >= 2 && r() < 0.6 ? 'tired' : libU === 'high' && r() < 0.7 ? 'libido' : (kT === 'mean' || kT === 'sadist') && r() < 0.6 ? 'provoked' : 'lead';
    }
    /* 攻めの展開の段（型の変化が跨る・主導の移る場面のときは差さない。主導は攻めのまま） */
    if (ini.dev !== false && pl.change !== 'ride_b' && pl.change !== 'shift') {
      var pd = (ld ? 0.35 : 0.6) + (libT === 'high' ? 0.1 : 0) + (P.lv(T) >= 4 ? 0.05 : 0);
      if (kT && kT !== 'maso' && X().DEV[kT] && (ini.dev || r() < pd)) pl.dev = kT;
      else if ((!kT || kT === 'maso') && (ini.dev || r() < pd * 0.75)) pl.dev = 'att';
      else if (!pl.lsty && r() < 0.12 + (libT === 'high' || libU === 'high' ? 0.06 : 0)) pl.dev = 'neu';
    }
    /* 受けの返し */
    if (ini.react !== false && (ini.react || r() < (kU ? 0.6 : 0.45))) pl.react = kU && X().REACT[kU] ? kU : 'att';
    if (!pl.dev && !pl.react && !pl.lsty && !pl.change) return null;
    /* 同じ二人で同じ型が続かないように（体位か変化を一つずらす） */
    var memo = o.memo, key = T.name + '\u0001' + U.name;
    if (memo) {
      var sig = [pl.dev, pl.change, pl.lsty ? 'L' : ''].join('|');
      if (memo[key] === sig && sig !== '||') {
        if (pl.change && !ini.change) { pl.change = ''; pl.why = ''; }
        else if (pl.dev && !ini.dev) pl.dev = pl.dev === 'neu' ? '' : 'neu';
        sig = [pl.dev, pl.change, pl.lsty ? 'L' : ''].join('|');
      }
      memo[key] = sig;
    }
    pl.r = r;
    /* 使った喘ぎの覚え：場面の部品（HK.Moan の fresh）と同じ置き場（回の ctx か乱数の _eroSeen）を共有して、同じ喘ぎを繰り返さない */
    var host = o.seenHost;
    /* 場面の部品が喘ぎの覚えを持つほかの置き場（回の ctx・その乱数） */
    pl.hosts = [ctx, ctx && ctx.rng, o.seenHost && o.seenHost.rng, o.rngHost].filter(function (h, i, a) { return h && (typeof h === 'object' || typeof h === 'function') && h !== host && a.indexOf(h) === i; });
    if (host && !host._eroSeen) host._eroSeen = {};
    if (!host && memo && !memo.__seen) Object.defineProperty(memo, '__seen', { value: {}, enumerable: false });
    pl.seen = host ? host._eroSeen : I._runSeen || (memo ? memo.__seen : null);
    return pl;
  };

  /* ---------- 文を組む ---------- */
  function persona(c) { var p = HK.personaOf ? HK.personaOf(c) : c && c.persona; return ATTS.indexOf(p) >= 0 ? p : 'gentle'; }
  /* 使った喘ぎの覚え（HK.Moan の fresh が tag ごとに持つ配列）に、すでにその声があるか */
  function used(seen, v) { if (!seen || !v) return false; for (var k in seen) if (Array.isArray(seen[k]) && seen[k].indexOf(v) >= 0) return true; return false; }
  function moan(r, who, kind, top, ero, seen, others) {
    if (!HK.Moan || !HK.Moan.say) return '……っ';
    /* 使った喘ぎの覚え（_eroSeen）は、場面の部品と同じ置き場（回の ctx か乱数）で共有する。
       覚えにすでにある声・この回で型の段がすでに使った声しか出なければ、声を足さない（同じ喘ぎが三つ以上の記録に出ないように。点検 state の S10） */
    var bare0 = function (x) { return String(x || '').replace(/^\u2060+/, '').replace(/♡/g, ''); };
    var S2 = { rng: r, _eroSeen: seen || {} }, s = '', snap = {};
    var last0 = {};
    Object.keys(S2._eroSeen).forEach(function (q) { var a = S2._eroSeen[q]; if (Array.isArray(a)) { a.forEach(function (x) { snap[bare0(x)] = 1; }); last0[q] = a[a.length - 1]; } });
    (others || []).forEach(function (h) { var m = h && h._eroSeen; if (m) Object.keys(m).forEach(function (q) { if (Array.isArray(m[q])) m[q].forEach(function (x) { snap[bare0(x)] = 1; }); }); });
    /* 短い声（言葉の部分が 9 字以下）に寄せる。言葉のある長い声は、ほかの部品の声と同じになりやすく、同じ文が三つの記録に並ぶ（点検 state の S10） */
    var len = function (x) { return bare0(x).replace(/[\s　…‥、。！？!?っッー〜～゛]/g, '').length; }, best = '';
    for (var k = 0; k < 4; k++) {
      var v = HK.Moan.say(S2, who, kind, { novel: !ero, top: top, talk: 0 }, null);
      if (!v) break;
      if (snap[bare0(v)] || (I._runMoan && I._runMoan[bare0(v)])) continue;
      if (len(v) <= 9) { s = v; break; }
      if (!best || len(v) < len(best)) best = v;
    }
    if (!s && best && len(best) <= 9) s = best;
    if (s && I._runMoan) I._runMoan[bare0(s)] = 1;
    /* 使った声を、場面の部品が使うほかの置き場（ctx と乱数の両方）にも写す（あとの場面の部品が同じ声を選ばないように） */
    if (s && others && others.length) Object.keys(S2._eroSeen).forEach(function (q) {
      var a = S2._eroSeen[q]; if (!Array.isArray(a) || !a.length || a[a.length - 1] === last0[q]) return;
      var v = a[a.length - 1];
      others.forEach(function (h) { if (!h) return; var m = h._eroSeen || (h._eroSeen = {}), l = m[q] || (m[q] = []), i = l.indexOf(v); if (i >= 0) l.splice(i, 1); l.push(v); });
    });
    return s;
  }
  /* H（攻めを選んだ攻め）に使えない文を外す */
  function poolH(arr, H) { if (!H) return arr; var o = arr.filter(function (s) { return tagOf(s) === 'H'; }); return o.length ? o : []; }
  /* 受けに男性器がない女攻め×男の組では、受けの男性器を前提にした文を外す */
  var NOM = /\{b\}の\{男性器\}|出したら|出しちゃ|イっちゃだめ|イかないで/;
  function okBody(arr, pl) { if (pl.mode !== 'fm' || P.hasM(pl.b)) return arr; return arr.filter(function (s) { return !NOM.test(s) && !/\{b\}の\{男性器\}/.test(s); }); }
  /* 受けが主導を取る台詞（主導だけが移る場面では、受けが下にいることもあるので「私が上」「乗る」の台詞を使わない） */
  function sayUe(T, U, ch) { var l = T.SAY.ue[persona(U)] || T.SAY.ue.gentle; if (ch === 'shift') { var f = l.filter(function (x) { return !/上|乗る/.test(x); }); if (f.length) l = f; } return l; }
  function parts(pl) {
    var T = X(), r = pl.r, out = { lead: '', mid: '', end: '', after: '' }, e = pl.ero, m = pl.mode, U = pl.b;
    /* 受けの誘い方・襲い方＋攻めの応じ方 */
    if (pl.lsty) {
      var lt;
      if (pl.bind) lt = pickR(r, T.BIND);
      else if (T.LSTY[pl.lsty]) lt = pickR(r, T.LSTY[pl.lsty]);
      else if (T.ATT_LEAD[pl.lsty]) lt = pickR(r, T.ATT_LEAD[pl.lsty]);
      else lt = pickR(r, T.LSTY0[pl.lead] || T.LSTY0.sasoi);
      /* 受けが「相手に合わせる」で、攻めがマゾ：付き合って襲う側に回る */
      if (pl.accU && pl.kind === 'maso') lt = pickR(r, T.ACCOM.leadPre) + lt;
      var rs = '';
      if (pl.tresp) rs = pl.tresp !== 'att' && T.TRESP[pl.tresp] ? pickR(r, T.TRESP[pl.tresp]) : pickR(r, T.ATT_RESP[pl.att] || T.ATT_RESP.gentle);
      out.lead = lt + (rs ? '\n\n' + rs : '');
    }
    var mid = [];
    /* 攻めの展開 */
    if (pl.dev === 'att') {
      var a1 = pickR(r, T.ATT_TOP[pl.att] || T.ATT_TOP.gentle), tl = pickR(r, okBody((e ? T.ATT_TAIL_E : T.ATT_TAIL)[m], pl));
      pl.pose = tagOf(tl);
      mid.push(a1 + untag(tl));
    } else if (pl.dev === 'neu') {
      var nt = pickR(r, okBody((e ? T.NEU_E : T.NEU)[m], pl));
      pl.pose = tagOf(nt);
      mid.push(untag(nt));
    } else if (pl.dev) {
      var dl = okBody(((e ? T.DEV_E : T.DEV)[pl.dev] || T.DEV[pl.dev])[m], pl);
      if (!dl.length) dl = okBody(T.DEV[pl.dev][m], pl);
      var dt = pickR(r, dl);
      if (dt) { pl.pose = tagOf(dt); mid.push(untag(dt)); }
    }
    /* 型の変化（跨る・主導が移る） */
    if (pl.change === 'ride_b' || pl.change === 'shift') {
      var tab = pl.change === 'ride_b' ? (e ? T.RIDE_B_E : T.RIDE_B) : (e ? T.SHIFT_E : T.SHIFT);
      var cl = poolH(okBody(tab[m], pl), pl.H);
      if (!cl.length) cl = poolH(okBody((pl.change === 'ride_b' ? T.RIDE_B : T.SHIFT)[m], pl), pl.H);
      if (cl.length) {
        var ct = untag(pickR(r, cl));
        ct = ct.replace('{why}', pickR(r, T.WHY[pl.why] || T.WHY.lead)).replace('{say}', e ? '' : '{b}' + pickR(r, sayUe(T, U, pl.change)));
        if (pl.change === 'ride_b') ct = ct.replace(/\{b\}「\{mb\}」$/, '{b}「{mb}」' + pickR(r, T.RIDE_END[m]));
        pl.pose = pl.change === 'ride_b' ? (m === 'fm' ? 'face' : 'ride') : pl.pose;
        mid.push(ct);
      } else pl.change = '';
    }
    /* 受けの返し（「相手に合わせる」で付き合っている人の一文と事後の一言は attr-r18.js の夜の性格の文が出すので、ここでは足さない） */
    if (pl.react) {
      var rl = pl.react !== 'att' ? (e ? T.REACT_E : T.REACT)[pl.react] || T.REACT[pl.react] : T.ATT_BOT[pl.attU] || T.ATT_BOT.gentle;
      mid.push(pickR(r, rl));
    }
    out.mid = mid.join('\n\n');
    /* 役割の入れ替え（果てたあとの二度目） */
    if (pl.change === 'swap') {
      var sl = (e ? T.SWAP_E : T.SWAP)[m] || T.SWAP[m];
      out.end = untag(pickR(r, sl)).replace('{why}', pickR(r, T.WHY[pl.why] || T.WHY.lead)).replace('{say}', e ? '' : '{b}' + pickR(r, T.SAY.swap[persona(U)] || T.SAY.swap.gentle));
    }
    /* 喘ぎ */
    var fill = function (s) {
      return s.replace(/\{mb\}/g, function () { return moan(r, U, 'mid', pl.a, e, pl.seen, pl.hosts); }).replace(/\{ma\}/g, function () { return moan(r, pl.a, 'climax', U, e, pl.seen, pl.hosts); }).replace(/\{[ab]\}「」/g, '');
    };
    out.mid = fill(out.mid); out.end = fill(out.end);
    return out;
  }
  I.parts = parts;

  /* ---------- 差し込む ---------- */
  function after1(text, ins) { if (!ins) return text; var i = text.indexOf('\n\n'); return i < 0 ? text + '\n\n' + ins : text.slice(0, i) + '\n\n' + ins + text.slice(i); }
  var PEAK = /果て(?:た|る|て)|達し(?:た|て)|絶頂|最後の一押し|頂へ|頂に/;
  function fragOf(s) { return String(s || '').split(/\{[^}]*\}|\n/).filter(function (x) { return x.length >= 6; }).sort(function (x, y) { return y.length - x.length; })[0] || ''; }
  /* o = { anchor: 感じていく段の文、after: 事後の文（本文の末尾）、pos: 'last'（果てる段の前＝最後の段の前） } */
  I.apply = function (text, pl, o) {
    if (!pl || typeof text !== 'string') return text;
    o = o || {};
    /* すでに縛る・拘束する場面（部屋の道具・スピード型など）なら、受けが攻めの手を縛る文は使わない */
    if (pl.bind && /縛|縄|ロープ|手錠|拘束|ネクタイ|リボン|ベルト/.test(text)) pl.bind = false;
    var pp = parts(pl), t = text;
    /* 事後の位置（呼ぶ側の after の頭） */
    var afterAt = -1;
    if (o.after) { var fa = fragOf(o.after); if (fa) { var k = t.lastIndexOf(fa); if (k >= 0) { var b0 = t.lastIndexOf('\n\n', k); afterAt = b0 >= 0 ? b0 : -1; } } }
    var tailIns = [pp.end, pp.after].filter(Boolean).join('\n\n');
    if (tailIns) {
      if (afterAt >= 0) t = t.slice(0, afterAt) + '\n\n' + tailIns + t.slice(afterAt);
      else t = t + '\n\n' + tailIns;
    }
    if (pp.mid) {
      var at = -1, fr = fragOf(o.anchor);
      if (fr) { var k2 = t.lastIndexOf(fr); if (k2 >= 0) { at = t.indexOf('\n\n', k2); } }
      if (at < 0) {
        /* 果てる段の前：3 段目より後ろで、最初に果てる・達する語のある段の頭（段の区切りは改行）。無ければ、事後があればその前の段の頭、なければ最後の段の頭 */
        var lim = afterAt >= 0 ? afterAt : t.length, re = /\n+/g, mm, k3 = 0, cut = -1;
        while ((mm = re.exec(t)) && mm.index < lim) {
          k3++;
          var nx = t.indexOf('\n', mm.index + mm[0].length), para = t.slice(mm.index + mm[0].length, nx < 0 ? t.length : nx);
          if (k3 >= 2 && PEAK.test(para.replace(/「[^」]*」/g, ''))) { cut = mm.index; break; }
        }
        if (cut >= 0) at = cut;
        else { var b1 = t.lastIndexOf('\n\n', lim - 1); at = b1 >= 0 ? b1 : t.length; }
      }
      /* 直前の段落が指で責めている段（指を抜く言葉がない）で、差す段が繋がる書き方なら、先に指を抜く一文を置く（点検 misc の FI） */
      var p0 = t.slice(0, at).replace(/\n+$/, '').lastIndexOf('\n'), prev = t.slice(p0 >= 0 ? p0 + 1 : 0, at).replace(/「[^」]*」/g, '');
      if (pl.mode !== 'ff' && /指(?:を|が|で)/.test(prev) && !/指を[^。]{0,8}(?:抜|引き抜|離)|指が[^。]{0,6}(?:抜け|抜か|離れ)/.test(prev) && /繋が|挿|腰を沈め|突き入れ|貫|満たし/.test(pp.mid)) pp.mid = '{a}は濡れた指を、ゆっくりと引き抜いた。' + pp.mid;
      t = t.slice(0, at) + '\n\n' + pp.mid + t.slice(at);
    }
    if (pp.lead) t = after1(t, pp.lead);
    if (I.log) I.log.push({ a: pl.a.name, b: pl.b.name, mode: pl.mode, kind: pl.kind, kindU: pl.kindU, att: pl.att, attU: pl.attU, accT: pl.accT, accU: pl.accU, accSaid: pl.accSaid || '', lead: pl.lead, lsty: pl.lsty, bind: pl.bind, tresp: pl.tresp, dev: pl.dev, pose: pl.pose, react: pl.react, change: pl.change, why: pl.why, ero: pl.ero, H: pl.H, place: o.place || '', src: o.src || '' });
    return t;
  };

  /* ---------- 組み立ての包み ---------- */
  /* 感じていく段の攻めの快感の文（FEEL_A）を覚えるための集合 */
  var FA = null;
  function faSet() {
    if (FA) return FA;
    FA = {};
    [HK.ThickSex && HK.ThickSex.FEEL_A, HK.ThickEro && HK.ThickEro.FEEL_A].forEach(function (m) { if (m) Object.keys(m).forEach(function (k) { (m[k] || []).forEach(function (s) { if (typeof s === 'string') FA[s] = 1; }); }); });
    return FA;
  }
  function stateOf(opt, T, U) {
    var R0 = opt.S || opt.rng, nth = HK.Ero && HK.Ero.pairNight ? HK.Ero.pairNight(R0, T, U, true) : 1;
    var own = (opt.S && opt.S.rng) || opt.rng || opt.S, memo = own ? (own._iniMemo || (own._iniMemo = {})) : null;
    return { place: opt.place || '', drug: opt.place === 'locker' || !!opt.drug, drunk: opt.place === 'goukon' || !!opt.drunk, heat: !!opt.heat, nth: nth, memo: memo, ini: opt.ini || null, seenHost: (opt.S && opt.S.rng ? opt.S : null) || opt.rng || null };
  }
  function wrapScene(obj, ero) {
    /* 包むのは一度だけ（最初のシミュレーションの前。あとで外側に包んだ pos-lead-r18.js の包みにも印が無いので、物の側に印を付ける） */
    if (!obj || !obj.scene || obj.scene._ini || obj._iniWrapped) return;
    obj._iniWrapped = true;
    var sc0 = obj.scene;
    obj.scene = function (opt) {
      if (HK.SAFE_ON || !opt || !opt.a || !opt.b || opt.noIni) return sc0.apply(this, arguments);
      var last = '', set = faSet(), o2 = {};
      Object.keys(opt).forEach(function (k) { o2[k] = opt[k]; });
      if (typeof opt.pick === 'function') {
        var pk0 = opt.pick;
        o2.pick = function (arr) { var v = pk0(arr); if (typeof v === 'string' && set[v]) last = v; return v; };
        if (pk0._fresh) o2.pick._fresh = true;
      }
      var r = sc0.call(this, o2);
      if (!r || typeof r.text !== 'string') return r;
      var T = opt.a, U = opt.b, st = stateOf(opt, T, U);
      st.ero = ero; st.mode = r.mode === 'ff' || r.mode === 'fm' ? r.mode : r.mode === 'mf' ? 'mf' : '';
      if (!st.mode) return r;
      st.r = I.rngFor(T, U, r.text);
      var pl = I.plan(opt.ctx || opt.S, T, U, st);
      if (!pl) return r;
      r.text = I.apply(r.text, pl, { anchor: last, after: opt.after || '', place: st.place, src: ero ? 'ThickEro' : 'ThickSex' });
      r.ini = pl;
      return r;
    };
    obj.scene._ini = true;
    /* 内側の包みの印を引き継ぐ（attr-r18.js・pos-lead-r18.js が二度包まないように） */
    if (sc0._attr) obj.scene._attr = true;
    if (sc0._lead) obj.scene._lead = true;
  }
  var LAST = 1e9 - 1;   /* pos-lead-r18.js の主導の段（1e9）のすぐ内側 */
  function install() {
    bedInstall();
    wrapScene(HK.ThickSex, false);
    wrapScene(HK.ThickEro, true);
    var TK = HK.TKC;
    if (TK && TK.body && !TK.body._ini && !TK._iniWrapped && (TK._iniWrapped = true)) HK.wrap(TK, 'body', function (tb0) {
      var f = function (T, U, o) {
        var r = tb0.apply(this, arguments);
        if (HK.SAFE_ON || !T || !U || !o || typeof r !== 'string' || o.noIni) return r;
        var kd = TK.kind ? TK.kind(T, U, o.flav) : '', mode = kd === 'ff' ? 'ff' : kd === 'ride' ? 'fm' : 'mf';
        if (P.isMaleTop && P.isMaleTop(T, U)) mode = 'mf';
        var memo = o.rng ? (o.rng._iniMemo || (o.rng._iniMemo = {})) : null;
        var st = { mode: mode, ero: !!o.ero, heat: !!(o.heatO || o.flav === 'omega' && o.heat), nth: 1, memo: memo, ini: o.ini || null, r: I.rngFor(T, U, r), seenHost: o.rng || null };
        var pl = I.plan(null, T, U, st);
        if (!pl) return r;
        var t = I.apply(r.replace(/\{T\}/g, '{a}').replace(/\{U\}/g, '{b}'), pl, { place: 'omega', src: 'TKC' });
        return t.replace(/\{a\}/g, '{T}').replace(/\{b\}/g, '{U}');
      };
      f._ini = true;
      return f;
    }, LAST);
  }
  /* ---------- 媚薬ロッカーのベッド（solo-locker-bed.js の HK.LOCKER.bed）：誘いの記録の後ろに誘い方・襲い方、最中の記録の後ろに展開・返し・型の変化、
     最後の記録の後ろに入れ替え・付き合いの一言。ロッカーの表がすでに「受けが自分から跨る」「主導権の取り合い」「受けが自分から誘う」を選んだ回は、型の変化を足さない ---------- */
  var BED_OWN = /受けが自分から跨る|主導権の取り合い|受けが自分から誘う/;
  function names(t, T, U) { return String(t).replace(/\{a\}/g, T.name).replace(/\{b\}/g, U.name); }
  function bedInstall() {
    var LK = HK.LOCKER, ST = HK.Story;
    if (!LK || !LK.bed || !ST || !ST.say || LK._iniBed) return;
    LK._iniBed = true;
    HK.wrap(ST, 'say', function (s0) {
      return function (S, o) {
        var B = S && S._iniBed;
        if (B && o && typeof o.text === 'string' && o.kind !== 'step' && o.kind !== 'phase') {
          if (o.tag === 'ベッドへ') B.inv = o;
          else if (B.inv && !B.mid && o.text.length >= 80) { B.mid = o; o.text = B.midText(o); }
          B.last = o;
        }
        return s0.apply(this, arguments);
      };
    }, LAST);
    HK.wrap(LK, 'bed', function (b0) {
      return function (S, o) {
        if (HK.SAFE_ON || !S || !o || !o.x || !o.y || o.lew === 'low' || S._iniBed) return b0.apply(this, arguments);
        var T = o.x, U = o.y, ero = !!(HK.Ero && HK.Ero.on && HK.Ero.on(S)), mode = o.ff ? 'ff' : P.isF(T, U) && !P.isF(U, T) ? 'fm' : modeOf(T, U);
        var own = S.rng || S, memo = own ? (own._iniMemo || (own._iniMemo = {})) : null, nth = HK.Ero && HK.Ero.pairNight ? HK.Ero.pairNight(S, T, U, true) + 1 : 1;
        var st = { mode: mode, ero: ero, drug: true, nth: nth, memo: memo, seenHost: S, r: rngOf(hashOf(T.name + '\u0001' + U.name + '\u0001' + (S.log ? S.log.length : 0) + '\u0001' + (S.seed || ''))) };
        if (o.lead) st.ini = { lead: false };
        var pl = I.plan(S, T, U, st), pp = null;
        if (!pl) return b0.apply(this, arguments);
        var B = S._iniBed = { midText: function (rec) {
          if (BED_OWN.test(rec.tag || '') || /攻守交代/.test(rec.why || '')) { pl.change = ''; pl.why = ''; }
          pp = parts(pl);
          return pp.mid ? rec.text + '\n\n' + names(pp.mid, T, U) : rec.text;
        } };
        var r;
        try { r = b0.apply(this, arguments); } finally { S._iniBed = null; }
        if (pp) {
          if (pp.lead && B.inv) B.inv.text += '\n\n' + names(pp.lead, T, U);
          var tail = [pp.end, pp.after].filter(Boolean).join('\n\n');
          if (tail && B.last && B.last !== B.inv) B.last.text += '\n\n' + names(tail, T, U);
          if (I.log) I.log.push({ a: T.name, b: U.name, mode: pl.mode, kind: pl.kind, kindU: pl.kindU, att: pl.att, attU: pl.attU, accT: pl.accT, accU: pl.accU, accSaid: pl.accSaid || '', lead: pl.lead, lsty: pl.lsty, bind: pl.bind, tresp: pl.tresp, dev: pl.dev, pose: pl.pose, react: pl.react, change: pl.change, why: pl.why, ero: pl.ero, H: pl.H, place: 'locker', src: 'LK.bed' });
        }
        return r;
      };
    }, LAST);
  }
  if (HK.Load && HK.Load.onChunk) HK.Load.onChunk(bedInstall);
  if (HK.simulate && !HK.simulate._ini) {
    var sim0 = HK.simulate;
    /* 一回のシミュレーションのあいだ、型の段で使った喘ぎを覚えておく（同じ喘ぎを別の記録で繰り返さない） */
    HK.simulate = function () { install(); I._runSeen = {}; I._runMoan = {}; return sim0.apply(this, arguments); };
    HK.simulate._ini = true;
  }
  I.install = install;
})();
