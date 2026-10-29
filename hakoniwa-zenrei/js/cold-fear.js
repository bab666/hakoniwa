/* 箱庭シミュレーター: 無関心・恐怖の値の動き方と、変化の引き金（HK.ColdFear。全箱庭の共通。族のかたまり pack-rel。両方のビルドに同じファイル）
   利用者の指示（2026-10-28）：無関心・恐怖は恋愛ありでも進みづらく。無関心は劇的なことがあるまで上がりにくく、恐怖はマイナスに動きやすい。
   強引に性的な行為をされたら無関心ではいられない・恐怖はより深まる。恐怖対象が落ちぶれたら恐怖し続けるのは難しい：極限系の箱庭では突き落とす・
   見捨てる・「私は悪くない……」と売り渡す、性格によっては逃れる・歪んだ庇護欲・まれに愛。決まり：docs/reports/2026-10-28/apathy-fear-rules.md
   ■ 進みづらさ（エンジン型。Ctx.prototype.mod を包む）
     ・無関心（a→b）：「恋愛：自動」は今までどおり値を凍結（ties.js の freezeInit）。「恋愛：あり」は凍結を外し、すべての値の動きを ×0.25（CF.K.apathy）
     ・恐怖（a→b）：惹かれ・好意・信頼の上がりを ×0.1（関係の伸びの倍率 modsA と合わせて）、好意・信頼の下がりを ×1.5、緊張の上がりを ×1.3、緊張の下がりを ×0.5
     ・物語型（関係の値が二人で一つの S.relD）：区切りごとに、組の値の上がりを ×0.25（無関心）／×0.1（恐怖）に戻す
   ■ 引き金（出来事として記録し、理由に「無関心の変化：…」「恐怖の変化：…」）。変化のときだけ ctx._cfRaw で抑えを外してまとめて動かす
     ・強引な性的行為（R18版だけ。cold-fear-r18.js の cf_force_r18）：無関心 → 憎悪か動揺（無関心は解ける）、恐怖 → 深まる
     ・劇的なこと：弱ったときに相手に助けられた（cf_tend）／ほかの出来事で相手に庇われた・救われた（理由・本文から拾う → cf_moved）：無関心 → 心が動く（解ける）、恐怖 → 少し和らぐ
     ・相手が落ちぶれた・弱みを見せた（けが・病気・噛まれた・孤立・いじめ・暴かれた・追い詰められた・疑われた など。CF.weak）：恐怖は続かない（cf_fall）。
       攻撃的・CP 高・愛憎／敵視あり → 極限系の箱庭（CF.EXT）では突き落とす・見捨てる・見殺し・売り渡す、それ以外は見下す・言い返す・縁を切る。
       臆病・AC 高 → 逃れる。NP 高・献身的 → 歪んだ庇護。まれに（8%、恋愛：あり・好意があるとき）愛に。変化後は 憎悪／見下し／歪んだ庇護／逃れた／恋
     ・恐怖はマイナスに動きやすい：相手から脅し・怒鳴り・暴力・見せしめを向けられた出来事（Ctx.say・HK.Story.say を包んで拾う）で恐怖が深まる（理由に足す）
   ■ 殺す行動は、死ネタの重さ（HK.Dark.f(ctx, 'kill')・少人数の係数）・「憎悪を持っても殺さない」（HK.Attr.noKillPair）・蘇る人（HK.Special.canRevive）を通す。
     死ぬのは ctx.kill だけ（物語型は人を直接殺さず、箱庭の仕組み：邪神村は村人に連れ去られる・人狼は疑いが集まる・館は疑いが増える）
   ■ 結末：エンジン型は結末の覚え書き（ctx.flags.endNotes）と関係のまとめ（HK.TieRel.refine・pairText を包む。既存の分類 嫌悪・庇護と依存・他人のまま を使う）。
     物語型は HK.Story.result を包み、結末の箇条書き・住人の覚え書き・関係図の★の線に足す
   ■ 計測用：HK.ColdFear.trace に配列を入れると、変化のたびに { scen, k, type, h, t, to } を足す（ふだんは null）
   登場人物はすべて成人として扱う */
/* @labels
   cf_fall=恐れていた相手の落ちぶれた姿に態度が変わる
   cf_tend=弱ったところを恐れ・無関心の相手に助けられる
   cf_moved=助けられて無関心・恐怖が揺らぐ
*/
/* @event scen=jashin,jinro,yakata,ship id=cf_story_fall cat=conflict tie=fear tags=cruel label=恐れていた相手を見捨てる・売り渡す */
/* @event scen=jashin,jinro,yakata,ship id=cf_story_moved cat=bond tie=apathy,fear label=助けられて無関心・恐怖が揺らぐ */
(function () {
  'use strict';
  var HK = window.HK;
  if (!HK || !HK.addTo || !HK.wrap || !HK.COMMON || !HK.ColdFearText) return;
  var X = HK.ColdFearText;
  var CF = HK.ColdFear = HK.ColdFear || {};
  CF.K = { apathy: 0.25, fear: 0.1 };
  /* 極限系の箱庭（命が懸かっていて、見捨てる・突き落とす・売り渡すが起きうる） */
  CF.EXT = { zombie: 1, island: 1, br: 1, trial: 1, jashin: 1, yakata: 1, jinro: 1, ship: 1 };
  CF.trace = null;
  CF.LOVE_P = 0.08;
  var PK = ['proud', 'stern', 'tsun', 'gentle', 'devoted', 'cool', 'free', 'shy', 'polite'];
  function per(c) {
    var k = c && c.persona;
    if (PK.indexOf(k) >= 0) return k;
    k = c && HK.personaOf ? HK.personaOf(c) : 'gentle';
    return PK.indexOf(k) >= 0 ? k : 'gentle';
  }
  function trOf(c) { return (c && c.tr) || (c && c.eg && HK.traits ? HK.traits(c.eg) : HK.traits({})); }
  function isCtx(x) { return !!(x && x.R && x.pair && x.chars); }
  function here(c) { return !!c && (HK.State && HK.State.here ? HK.State.here(c) : c.alive !== false); }
  function pc(v) { return Math.round((v || 0) * 100); }
  function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }
  function fill(t, m) { return String(t).replace(/\{(a|b|w)\}/g, function (s, k) { var v = m[k]; return v == null ? s : typeof v === 'string' ? v : v.name; }); }
  function pickOf(Z, arr) {
    if (!arr || !arr.length) return '';
    if (isCtx(Z)) return Z.pick(arr);
    if (HK.Story && HK.Story.pick && Z && Z.recent) return HK.Story.pick(Z, arr);
    return arr[Math.floor(Z.rng() * arr.length)];
  }
  function scenOf(Z) { return Z && Z.scen ? Z.scen.id : ''; }
  function note(Z, p, k) {
    if (!CF.trace) return;
    CF.trace.push({ scen: scenOf(Z), k: k, type: p.type, h: p.h, t: p.t, to: p.st, lv: !!p.lv });
  }
  var ACTIVE_F = { '': 1, deep: 1, eased: 1, fled: 1 };
  /* 恐怖がまだ続いているか（憎悪・見下し・庇護・恋に変わったら終わり） */
  function fearOn(p) { return p.type === 'fear' && !!ACTIVE_F[p.st || '']; }
  /* 無関心がまだ解けていないか */
  function apaOn(p) { return p.type === 'apathy' && !p.st; }
  CF.fearOn = fearOn; CF.apaOn = apaOn;
  /* 一回の箱庭の組の表（エンジン型 ctx._cf・物語型 S._cf）。鍵は「抱く側>相手」 */
  function build(ties, P) {
    var out = {}, any = false;
    (ties || []).forEach(function (t) {
      if (!t || (t.type !== 'apathy' && t.type !== 'fear') || t.a === t.b || !P[t.a] || !P[t.b]) return;
      var k = t.a + '>' + t.b;
      if (out[k] && out[k].type === 'fear') return;   /* 同じ向きに無関心と恐怖の両方があれば、恐怖を見る */
      out[k] = { h: t.a, t: t.b, type: t.type, lv: !!(HK.tieLoveOK && HK.tieLoveOK(t)), st: '', deep: 0 };
      any = true;
    });
    return any ? out : null;
  }
  CF.pairOf = function (Z, h, t) { var m = Z && Z._cf; return m && h && t ? m[h.i + '>' + t.i] || null : null; };
  function rk(a, b) { return a.i < b.i ? a.i + '-' + b.i : b.i + '-' + a.i; }

  /* ================= 弱った様子（落ちぶれた・弱みを見せた） ================= */
  /* エンジン型：名前の前に付く形の文（無ければ ''） */
  function weakE(ctx, c) {
    if (!c || !here(c)) return '';
    var f = c.flags || {};
    if (c.z && c.z.bitten) return 'ゾンビに噛まれた';
    if (f.venom) return '毒に倒れた';
    if (c.z && c.z.fever) return '熱に浮かされて起き上がれなくなった';
    if (typeof c.hp === 'number' && c.hp <= 60) return 'けがを負って、まともに動けなくなった';
    if (c.z && c.z.wound >= 0) return 'けがを負って、足を引きずるようになった';
    if (c.z && (c.z.hunger || 0) >= 2) return '飢えでひどくやつれた';
    if (f.ostra) return '皆から爪弾きにされた';
    if (ctx.flags && ctx.flags.bully && ctx.flags.bully.tg === c.i && ctx.flags.bully.stopped == null) return 'いじめの標的にされた';
    if (f.exposed) return '隠していたことを暴かれた';
    if ((f.slump || 0) >= 2) return '心が折れて沈み込んだ';
    if (f.down && f.down < 900) return '倒れて動けなくなった';
    if ((f.drunk || 0) >= 75) return '酔いつぶれて醜態をさらした';
    if ((c.stress || 0) >= 82) return '追い詰められて取り乱した';
    return '';
  }
  /* 物語型：箱庭ごとの状態から */
  var SW = {
    jashin: function (S, c) {
      if (c.m && c.m.hp <= 50) return 'けがを負って動けなくなった';
      if (c.possessed) return '何かに取り憑かれて、うわ言を繰り返すようになった';
      if (c.curse != null) return '呪いの痣に怯えて取り乱した';
      if (c.m && c.m.fear >= 70) return '震えが止まらなくなった';
      return '';
    },
    /* 人狼：村人から見た疑いの平均が高い（55 以上）か、いちばん疑われている（50 以上） */
    jinro: function (S, c) {
      var live = S.P.filter(function (q) { return q.alive && q.role !== 'wolf' && q.sus; });
      function avg(x) { var o = live.filter(function (q) { return q !== x; }); return o.length ? o.reduce(function (s0, q) { return s0 + (q.sus[x.i] == null ? 50 : q.sus[x.i]); }, 0) / o.length : 0; }
      var v = avg(c), top = S.P.filter(function (q) { return q.alive && q !== c; }).every(function (q) { return avg(q) <= v; });
      return v >= 55 || (top && v >= 50) ? '皆から人狼だと疑われた' : '';
    },
    yakata: function (S, c) {
      if (c.m && c.m.sus >= 45) return '犯人ではないかと疑われた';
      if (c.m && c.m.fear >= 70) return '怯えきって、まともに口もきけなくなった';
      return '';
    },
    ship: function (S, c) {
      if (c.inf > 0) return '感染症に倒れた';
      if (c.m && c.m.hp < 55) return '体を壊して寝込んだ';
      if (c.m && c.m.fear >= 70) return '漂流の恐怖に押しつぶされかけた';
      return '';
    }
  };
  /* 物語型で、その場にいて動ける人（死・不在に加えて、縛られた・閉じこもった・正気でない・遭難中の人を除く） */
  function hereS(p) { return !!p && here(p) && !p.bound && !p.locked && !p.mad && !p.away && !p.panic && !p.out; }
  function weak(Z, c) {
    if (isCtx(Z)) return weakE(Z, c);
    var f = SW[scenOf(Z)];
    return f && hereS(c) ? f(Z, c) : '';
  }
  CF.weak = weak;

  /* ================= 進みづらさ（エンジン型） ================= */
  /* 凍結（ties.js の freezeInit）のあとに組の表を作り、「恋愛：あり」の無関心は凍結を外して ×0.25 にする */
  CF.setup = function (ctx) {
    var all = [];
    Object.keys(ctx.tiesAll || {}).forEach(function (k) { (ctx.tiesAll[k] || []).forEach(function (t) { all.push(t); }); });
    ctx._cf = build(all, ctx.chars);
    if (!ctx._cf) return;
    Object.keys(ctx._cf).forEach(function (k) {
      var p = ctx._cf[k];
      if (p.type === 'apathy' && p.lv) { p.slow = true; if (ctx._frz) delete ctx._frz[k]; }
    });
  };
  if (HK.Ties && HK.Ties.freezeInit) HK.wrap(HK.Ties, 'freezeInit', function (prev) {
    return function (ctx) { var r = prev.apply(this, arguments); if (ctx && ctx.chars) CF.setup(ctx); return r; };
  });
  /* 値の動きの倍率（f：値の種類、v：動く量） */
  function slowK(p, f, v) {
    if (p.type === 'apathy') {
      if (p.st) return f === 'att' && v > 0 ? 0.5 : 1;   /* 解けたあとも、惹かれはゆっくり */
      return p.slow ? CF.K.apathy : 1;
    }
    if (!fearOn(p)) return 1;
    if (f === 'att') return v > 0 ? CF.K.fear : 1;
    /* 好意・信頼は関係の伸びの倍率（恐怖の modsA：好意 0.6・信頼 0.5）と合わせて、上がりがおよそ ×0.1 になるように */
    if (f === 'aff') return v > 0 ? CF.K.fear / 0.6 : 1.5;
    if (f === 'trust') return v > 0 ? CF.K.fear / 0.5 : 1.5;
    if (f === 'ten') return v > 0 ? 1.3 : 0.5;
    return 1;
  }
  if (HK.Ctx && HK.Ctx.prototype.mod) HK.wrap(HK.Ctx.prototype, 'mod', function (prev) {
    return function (a, b, d, scale) {
      var m = this._cf;
      if (!m || this._cfRaw || !a || !b || !d) return prev.apply(this, arguments);
      var p = m[a.i + '>' + b.i];
      if (!p) return prev.apply(this, arguments);
      var d2 = {};
      for (var f in d) d2[f] = typeof d[f] === 'number' ? d[f] * slowK(p, f, d[f]) : d[f];
      return prev.call(this, a, b, d2, scale);
    };
  });
  /* 変化のときの、まとめた動き（抑えを外す。凍結している無関心は凍結を外してから） */
  function raw(ctx, a, b, d) {
    if (!a || !b || a === b || !d) return;
    var k = a.i + '>' + b.i;
    if (ctx._frz && ctx._frz[k]) delete ctx._frz[k];
    ctx._cfRaw = (ctx._cfRaw || 0) + 1;
    try { ctx.mod(a, b, d); } finally { ctx._cfRaw--; }
  }
  /* 無関心が解ける：凍結・出来事の門（ctx._apathy）を外す。恋愛：自動なら恋愛しないのは今までどおり（noLove はそのまま） */
  function apaBreak(ctx, p, st) {
    var k = p.h + '>' + p.t;
    p.st = st;
    if (ctx._frz) delete ctx._frz[k];
    if (ctx._apathy) delete ctx._apathy[k];
  }
  /* 恐怖が終わる（憎悪・見下し・庇護・恋）：避ける重み（ctx._fear）を外す。逃れた・深まった・和らいだは恐怖のまま */
  function fearEnd(ctx, p, st) {
    p.st = st;
    if (!ACTIVE_F[st] && ctx._fear) delete ctx._fear[p.h + '>' + p.t];
  }
  function endNote(Z, p, k) {
    var t = X.END[k]; if (!t) return;
    var P = isCtx(Z) ? Z.chars : Z.P, s = fill(t, { a: P[p.h], b: P[p.t] });
    if (isCtx(Z)) { var l = Z.flags.endNotes = Z.flags.endNotes || []; if (l.indexOf(s) < 0) l.push(s); }
    p.end = k;
  }
  CF.raw = raw; CF.apaBreak = apaBreak; CF.fearEnd = fearEnd; CF.endNote = endNote; CF.note = note;
  CF.per = per; CF.trOf = trOf; CF.fill = fill; CF.pickOf = pickOf; CF.here = here; CF.isCtx = isCtx;

  /* 逃れた人は、恐れていた相手を出来事の相手に選ばない（同じ場にいても近づかない） */
  if (HK.Ctx && HK.Ctx.prototype.others) HK.wrap(HK.Ctx.prototype, 'others', function (prev) {
    return function (a) {
      var l = prev.apply(this, arguments), m = this._cf;
      if (!m || !a || !this._cfFled) return l;
      var self = this;
      return l.filter(function (c) { return !self._cfFled[a.i + '>' + c.i]; });
    };
  });

  /* ================= 恐れていた相手の落ちぶれた姿 → 行動の選び方（エンジン型・物語型の共通） ================= */
  var KNAME = { push: '突き落とした', abandon: '見捨てて逃げた', let: '見殺しにした', sell: '「私は悪くない……」と言いながら売り渡した', scorn: '見下した', retort: '言い返した', cut: '縁を切った', flee: '逃れた', shelter: '歪んだ庇護欲を向けた', love: '恋に転じた' };
  var KTO = { push: 'hate', abandon: 'hate', let: 'hate', sell: 'hate', scorn: 'scorn', retort: 'hate', cut: 'scorn', flee: 'fled', shelter: 'shelter', love: 'love' };
  CF.KNAME = KNAME; CF.KTO = KTO;
  function tiesOf(Z, a, b) {
    if (isCtx(Z)) return HK.Ties && Z.tiesAll ? HK.Ties.all(Z, a, b) : [];
    return (Z.ties || Z._cfIn || []).filter(function (t) { return t && ((t.a === a.i && t.b === b.i) || (t.a === b.i && t.b === a.i)); });
  }
  /* a が b を敵視している（不仲・敵対・ライバルの敵視する側／愛憎を持つ側） */
  function hostile(Z, a, b) {
    return tiesOf(Z, a, b).some(function (t) {
      var D = HK.TIES && HK.TIES[t.type];
      if (t.type === 'lovehate' && (t.a === a.i || t.cold === 'both')) return true;
      if (t.lh && (t.lh === 'both' || (t.lh === 'a') === (t.a === a.i))) return true;
      return !!(D && D.hate && (t.a === a.i || !t.cold));
    });
  }
  function affOf(Z, a, b) {
    if (isCtx(Z)) return Z.R(a, b).aff;
    var d = Z.relD && Z.relD[rk(a, b)];
    return (d || 0) * 100;
  }
  /* 恋に転じてよい組（両方向の恋愛対象・恋愛の欄・恋愛の起こりやすさ） */
  function romOK(Z, a, b) {
    if (!HK.canLove || !HK.canLove(a, b) || !HK.canLove(b, a)) return false;
    if (isCtx(Z)) return !!Z.romanceOk && Z.romanceOk([b, a]);
    return !(Z.env && Z.env.romance != null && Z.env.romance !== '' && +Z.env.romance === 0);
  }
  function lethalOK(Z, a, b) {
    if (!b || b.alive === false) return false;
    if (HK.Attr && HK.Attr.noKillPair && HK.Attr.noKillPair(a, b)) return false;
    if (HK.Special && HK.Special.canRevive && HK.Special.canRevive(b)) return false;
    return true;
  }
  function wpick(Z, ws) {
    var keys = Object.keys(ws).filter(function (k) { return ws[k] > 0; });
    if (!keys.length) return '';
    return HK.weighted(Z.rng, keys, function (k) { return ws[k]; });
  }
  /* 箱庭ごとの、極限の行動の候補（push・abandon・let・sell） */
  function extActs(Z, a, b, w) {
    var id = scenOf(Z), L0 = lethalOK(Z, a, b), kf = HK.Dark ? HK.Dark.f(Z, 'kill') : 1, o = {};
    if (id === 'zombie' || id === 'br') { if (L0) o.push = 1.1 * kf; o.abandon = 1; }
    else if (id === 'island') o.abandon = 1;
    else if (id === 'trial') o.sell = 1.4;
    else if (id === 'jashin') { o.sell = b.curse != null ? 0 : 1.2; o.abandon = 0.8; }
    else if (id === 'jinro' || id === 'yakata') { o.sell = 1.3; o.abandon = 0.7; }
    else if (id === 'ship') { o.abandon = 1; o.sell = 0.8; }
    /* 見殺し：噛まれた・毒・けがの相手（エンジン型） */
    if (isCtx(Z) && (id === 'zombie' || id === 'island' || id === 'br') && /噛まれた|毒に|けが/.test(w)) o.let = 1;
    /* 人狼：「殺さない」相手には疑いを向けない（票が処刑になるため） */
    if ((id === 'jinro' || id === 'trial') && !L0) o.sell = 0;
    return o;
  }
  /* 行動を決める：{ k, why }（k が空なら何もしない） */
  CF.choose = function (Z, a, b, w) {
    var t = trOf(a), p = per(a), id = scenOf(Z);
    var why = [];
    var p0 = CF.pairOf(Z, a, b);
    if (p0 && p0.lv && romOK(Z, a, b) && affOf(Z, a, b) > 5 && Z.rng() < CF.LOVE_P) return { k: 'love', why: '恋愛：あり・もともと好意があった（まれ）' };
    var hos = hostile(Z, a, b), lh = HK.LoveHate && HK.LoveHate.dir ? HK.LoveHate.dir(Z, a, b) : '';
    var wA = t.aggr * 1.2 + t.cp * 0.7 + (hos ? 0.45 : 0) + (lh === 'a' || lh === 'both' ? 0.45 : 0) + (p === 'proud' || p === 'stern' ? 0.15 : 0);
    var wF = t.ac * 1.1 + t.caution * 0.5 + (p === 'shy' || p === 'polite' ? 0.2 : 0);
    var wS = t.np * 1.2 + (p === 'devoted' || p === 'gentle' ? 0.25 : 0);
    var g = wpick(Z, { aggr: wA * wA, flee: wF * wF, shel: wS * wS });
    if (g === 'flee') return { k: 'flee', why: '臆病さ（AC ' + pc(t.ac) + '・慎重さ ' + pc(t.caution) + '）' };
    if (g === 'shel') return { k: 'shelter', why: '面倒見のよさ（NP ' + pc(t.np) + '）が、弱った相手への歪んだ庇護欲に転じた' };
    why.push('攻撃性 ' + pc(t.aggr) + '・CP ' + pc(t.cp) + (hos ? '・敵視' : '') + (lh ? '・愛憎' : ''));
    if (CF.EXT[id]) {
      var k = wpick(Z, extActs(Z, a, b, w));
      if (k) return { k: k, why: why.join('') + '・極限の箱庭' };
    }
    var k2 = wpick(Z, { retort: t.aggr + (hos ? 0.4 : 0), scorn: t.cp + (p === 'proud' ? 0.3 : 0), cut: 0.35 + t.a * 0.4 });
    return { k: k2 || 'scorn', why: why.join('') };
  };
  /* 文：極限の行動は箱庭ごと、なければ共通 */
  function actText(Z, k) {
    var id = scenOf(Z), A = X.ACT[k];
    if (A) return A[id] || A.gen || A.zombie;
    return X.FALL[k];
  }

  /* ================= エンジン型の出来事 ================= */
  function pairsOf(ctx, h) {
    var m = ctx._cf, out = [];
    if (!m) return out;
    for (var k in m) if (m[k].h === h.i) out.push(m[k]);
    return out;
  }
  function seen(ctx, a, b) { return ctx.others(a).indexOf(b) >= 0; }
  function freeE(c) { return here(c) && !(c.flags && (c.flags.caged != null || c.flags.down)) && !c.mad; }
  /* 落ちぶれた相手を見た、恐れる側 a の組（一つ） */
  function fallOf(ctx, a) {
    if (!ctx._cf || !freeE(a)) return null;
    var L0 = pairsOf(ctx, a);
    for (var i = 0; i < L0.length; i++) {
      var p = L0[i], b = ctx.chars[p.t];
      if (!fearOn(p) || p.st === 'fled' || p.fellAt === ctx.stepIndex || !here(b) || !(seen(ctx, a, b) || (p.metAt != null && ctx.stepIndex - p.metAt <= 1))) continue;
      var w = weakE(ctx, b);
      if (w) return { p: p, b: b, w: w };
    }
    return null;
  }
  /* 弱った a を、a が無関心・恐怖を抱く相手 b（＝出来事の主役）が助ける組 */
  function tendOf(ctx, b) {
    if (!ctx._cf || !freeE(b)) return null;
    for (var k in ctx._cf) {
      var p = ctx._cf[k];
      if (p.t !== b.i || p.tended || p.st === 'fled' || !(apaOn(p) || fearOn(p))) continue;   /* 逃れた人のところへは、相手は来ない */
      var a = ctx.chars[p.h];
      if (!here(a) || !seen(ctx, b, a) || CF.pairOf(ctx, b, a)) continue;
      if (HK.Avoid && HK.Avoid.of && HK.Avoid.of(ctx, b, a)) continue;
      var w = weakE(ctx, a);
      if (!w) continue;
      var t = trOf(b), r = ctx.R(b, a), will = t.np * 0.8 + t.warmth * 0.3 + Math.max(0, r.aff) / 80 - Math.max(0, r.ten - 40) / 120;
      if (will > 0.45) return { p: p, a: a, w: w, will: will };
    }
    return null;
  }
  /* ほかの出来事で庇われた・救われた組（反応の出来事を待っている） */
  function movedOf(ctx, a) {
    if (!ctx._cf || !freeE(a)) return null;
    var L0 = pairsOf(ctx, a);
    for (var i = 0; i < L0.length; i++) {
      var p = L0[i], b = ctx.chars[p.t];
      if (p.pend && ctx.stepIndex >= p.pend.at && (apaOn(p) || fearOn(p)) && here(b) && seen(ctx, a, b)) return { p: p, b: b };
    }
    return null;
  }
  /* 劇的なことで動く：無関心は解けて信頼・好意が上がる、恐怖は少し和らぐ */
  function moveE(ctx, p, a, b) {
    var head;
    if (p.type === 'apathy') {
      raw(ctx, a, b, { trust: 14, aff: 10, ten: 4 });
      apaBreak(ctx, p, 'moved'); endNote(ctx, p, 'moved');
      head = '無関心の変化：' + a.name + 'は' + b.name + 'に無関心だったが、劇的なことで心が動いた（信頼・好意が上がった）';
    } else {
      raw(ctx, a, b, { ten: -14, trust: 8, aff: 5 });
      fearEnd(ctx, p, 'eased'); p.eased = (p.eased || 0) + 1;
      if (!p.end || p.end === 'deep') endNote(ctx, p, 'eased');
      head = '恐怖の変化：' + a.name + 'の' + b.name + 'への恐怖が、少し和らいだ（恐怖は消えない）';
    }
    note(ctx, p, 'rescue');
    return head;
  }
  /* 殺すのは、この出来事の記録を書いたあと（下の Ctx.say の包み）。記録の中で、死んだ人が動く文にならないように */
  function deferKill(ctx, b, how, killer) { ctx._cfDefer = { v: b, how: how, k: killer || null }; return true; }
  /* 落ちぶれた相手への行動（エンジン型）：本文と理由を返す */
  function fallE(ctx, a, b, f) {
    var p = f.p, w = f.w, c = CF.choose(ctx, a, b, w), k = c.k, m = { a: a, b: b, w: w };
    var text = fill(pickOf(ctx, actText(ctx, k)), m), dead = false, few = HK.Dark && HK.Dark.few ? HK.Dark.few(ctx) : 1, kf = HK.Dark ? HK.Dark.f(ctx, 'kill') : 1;
    p.fellAt = ctx.stepIndex;
    if (k === 'push') dead = deferKill(ctx, b, '恐れていた相手に突き落とされた', a);
    else if (k === 'abandon' || k === 'let') {
      if (typeof b.hp === 'number') b.hp = Math.max(1, b.hp - (k === 'let' ? 15 : 20));
      ctx.stress(b, 20);
      var pr = (k === 'let' ? 0.55 : 0.35) * kf * few;
      if (lethalOK(ctx, a, b) && ctx.rng() < pr) dead = deferKill(ctx, b, k === 'let' ? '助けを拒まれ、見殺しにされた' : '見捨てられ、取り残された', null);
      else text += fill(pickOf(ctx, X.SURVIVE), m);
    } else if (k === 'sell') {
      ctx.present().forEach(function (o) { if (o !== a && o !== b) ctx.mod(o, b, { trust: -12, ten: 10 }); });
    } else if (k === 'flee') {
      (ctx._cfFled = ctx._cfFled || {})[a.i + '>' + b.i] = 1;
    }
    var D = {
      push: [{ ten: -40, aff: -20 }, null], abandon: [{ ten: -35, aff: -15, trust: -15 }, { aff: -35, trust: -45, ten: 30 }], let: [{ ten: -35, aff: -15, trust: -15 }, { aff: -35, trust: -45, ten: 30 }],
      sell: [{ ten: -35, aff: -15 }, { aff: -40, trust: -50, ten: 35 }], scorn: [{ ten: -35, aff: -10, trust: -10 }, { ten: 15, aff: -10 }], retort: [{ ten: -30, aff: -15 }, { ten: 20 }],
      cut: [{ ten: -30, aff: -20, trust: -15 }, { aff: -10, ten: 10 }], flee: [{ ten: -15 }, null], shelter: [{ ten: -35, aff: 12, trust: 5 }, { trust: 12, aff: 6, ten: 6 }],
      love: [{ ten: -30, aff: 20, att: 46, trust: 10 }, null]
    }[k];
    raw(ctx, a, b, D[0]);
    if (D[1] && !dead) ctx.mod(b, a, D[1]);
    if (k === 'love') { var r = ctx.R(a, b); if (r.att < 46) r.att = 46; }
    ctx.stress(a, k === 'push' || k === 'let' ? 15 : k === 'flee' ? -10 : 5);
    fearEnd(ctx, p, KTO[k]); endNote(ctx, p, KTO[k]); note(ctx, p, k);
    var why = '恐怖の変化：' + a.name + 'は' + b.name + 'を恐れていたが、' + b.name + 'が' + w + 'のを見て、恐怖を保てなくなった（' + c.why + '）→ ' + KNAME[k] + (dead ? '（' + b.name + 'は命を落とした）' : '');
    return { text: text, why: why, k: k, dead: dead };
  }

  HK.addTo(HK.COMMON, [
    {
      id: 'cf_fall', label: '恐れていた相手の落ちぶれた姿に態度が変わる', cat: 'conflict', scope: 'solo', tie: 'fear', tags: ['death', 'cruel'], pri: true, noOdd: true,
      when: function (ctx, a) { return !!fallOf(ctx, a); },
      w: function (ctx, a) { return fallOf(ctx, a) ? 60 : 0; },
      run: function (ctx, a) {
        var f = fallOf(ctx, a); if (!f) return null;
        var r = fallE(ctx, a, f.b, f);
        return { with: [f.b], cat: r.k === 'shelter' || r.k === 'love' ? 'bond' : r.k === 'flee' ? 'solo' : 'conflict', text: r.text, why: r.why, mag: r.dead ? 40 : 24 };
      }
    },
    {
      id: 'cf_tend', label: '弱ったところを恐れ・無関心の相手に助けられる', cat: 'help', scope: 'solo', tie: 'apathy,fear', pri: true, noOdd: true,
      when: function (ctx, b) { return !!tendOf(ctx, b); },
      w: function (ctx, b) { var x = tendOf(ctx, b); return x ? 2 + x.will * 4 : 0; },
      run: function (ctx, b) {
        var x = tendOf(ctx, b); if (!x) return null;
        var a = x.a, p = x.p; p.tended = true;
        if (typeof a.hp === 'number') a.hp = Math.min(100, a.hp + 15);
        ctx.stress(a, -10);
        ctx.mod(b, a, { aff: 4, trust: 3 });
        var head = moveE(ctx, p, a, b), m = { a: a, b: b, w: x.w };
        var tk = /爪弾き|いじめ|暴かれ|疑われ/.test(x.w) ? 'social' : /心が折れ|取り乱|酔いつぶれ|震え|怯え/.test(x.w) ? 'mind' : 'hurt';
        var text = fill(pickOf(ctx, X.TEND[tk]), m) + fill(pickOf(ctx, p.type === 'apathy' ? X.MOVED : X.EASED), m);
        return { with: [a], text: text, why: head + '／' + b.name + 'が、' + x.w + a.name + 'を助けた（NP ' + pc(trOf(b).np) + '）', mag: 20 };
      }
    },
    {
      id: 'cf_moved', label: '助けられて無関心・恐怖が揺らぐ', cat: 'bond', scope: 'solo', tie: 'apathy,fear', pri: true, noOdd: true,
      when: function (ctx, a) { return !!movedOf(ctx, a); },
      w: function () { return 6; },
      run: function (ctx, a) {
        var x = movedOf(ctx, a); if (!x) return null;
        var p = x.p, b = x.b; p.pend = null;
        var head = moveE(ctx, p, a, b), m = { a: a, b: b };
        var text = fill(pickOf(ctx, X.AFTER_HELP), m) + fill(pickOf(ctx, p.type === 'apathy' ? X.MOVED : X.EASED), m);
        return { with: [b], text: text, why: head + '／' + b.name + 'に庇われた・救われたあと', mag: 14 };
      }
    }
  ]);

  /* ================= ほかの出来事から拾う（庇われた・救われた／脅された・暴力を向けられた） ================= */
  var RESCUE_RE = /庇っ|かばっ|庇い|かばい|身を挺|助け出|救い出|引き上げ|引っ張り上げ|手当て|看病|介抱|止血|担いで|背負って|盾にな|命を救|救出|助けた|助けられ/;
  var THREAT_RE = /怒鳴|脅し|脅さ|脅す|殴|蹴り|蹴っ|突き飛ば|胸ぐら|見せしめ|威圧|睨みつけ|罵|怒声|平手|首を絞|押さえつけ/;
  var OWN_RE = /(?:無関心|恐怖)の変化：/;
  /* 人が死ぬ・死んでいた出来事（殺した・殺された・見つかった亡骸）では、恐怖を深めない（恐れる側が死んでいる・ただ見つけただけ、のことがあるため） */
  var DEATH_RE = /殺さ|殺し|殺す|死ん|死因|息絶|命を落と|動かなくな|もう動かなかった|亡骸|遺体|犠牲者|事切れ/;
  /* 恐れる側が自分から割って入った・なだめた出来事、助け合い・恋愛・絆の出来事では、恐怖を深めない */
  var CALM_RE = /なだめ|割って入|止めに入|引き離|仲裁|落ち着かせ|別々の部屋に連れ/, SOFT_CAT = { help: 1, bond: 1, romance: 1, care: 1, kind: 1 };
  /* a が b からの出来事を受けた（o：記録の元。エンジン型は値を、物語型は S.relD を動かす）。理由に足す文を返す */
  function watch(Z, idx, o) {
    var P = isCtx(Z) ? Z.chars : Z.P, T = P[idx[0]], s = String(o.text || '') + ' ' + String(o.why || '') + ' ' + String(o.tag || ''), add = '';
    if (!T || OWN_RE.test(String(o.why || ''))) return '';
    var resc = RESCUE_RE.test(s) && (o.cat === 'help' || /救出|庇|かば|助け|看病|手当/.test(String(o.tag || '') + s));
    var thr = !resc && THREAT_RE.test(s) && !SOFT_CAT[o.cat] && !CALM_RE.test(s) && !DEATH_RE.test(s) && here(T);
    if (!resc && !thr) return '';
    var step = isCtx(Z) ? Z.stepIndex : (Z._cfStep || 0);
    idx.slice(1).forEach(function (j) {
      var H = P[j], p = H ? CF.pairOf(Z, H, T) : null;
      if (!p || H === T) return;
      if (resc && (apaOn(p) || fearOn(p)) && p.st !== 'fled' && !p.pend) p.pend = { at: step };
      else if (thr && fearOn(p) && p.thrAt !== step && here(H)) {
        p.thrAt = step; p.deep++;
        if (isCtx(Z)) raw(Z, H, T, { ten: 8, trust: -6, aff: -5 });
        else { Z.relD = Z.relD || {}; var k = rk(H, T); Z.relD[k] = clamp((Z.relD[k] || 0) - 0.06, -1, 1); }
        if (p.st === '' || p.st === 'eased') { p.st = 'deep'; endNote(Z, p, 'deep'); }
        note(Z, p, 'threat');
        add += '／恐怖の変化：' + H.name + 'の' + T.name + 'への恐怖が深まった（' + (idx.length === 2 ? '脅し・暴力を向けられた' : '脅し・暴力を目の当たりにした') + '）';
      }
    });
    return add;
  }
  if (HK.Ctx && HK.Ctx.prototype.say) HK.wrap(HK.Ctx.prototype, 'say', function (prev) {
    return function (o) {
      if (this._cf && o && o.kind === 'event' && o.actors && o.actors.length >= 2 && typeof o.text === 'string') {
        var idx = o.actors.filter(Boolean).map(function (c) { return c.i; }), m0 = this._cf, si = this.stepIndex;
        /* 二人が同じ出来事に出た区切りを覚える（別の場所にいても、その区切りと次の区切りは「相手の様子を見た」とみなす） */
        Object.keys(m0).forEach(function (k) { var q = m0[k]; if (idx.indexOf(q.h) >= 0 && idx.indexOf(q.t) >= 0) q.metAt = si; });
        var add = watch(this, idx, o);
        if (add) o.why = String(o.why || '') + add;
      }
      var e = prev.apply(this, arguments), D0 = this._cfDefer;
      if (D0 && o && OWN_RE.test(String(o.why || ''))) {
        this._cfDefer = null;
        if (e && !e.skipped && D0.v.alive) this.kill(D0.v, D0.k, D0.how);
      }
      return e;
    };
  });

  /* ================= 物語型 ================= */
  var ST = HK.Story;
  /* 箱庭ごとの、行動の効き目（箱庭の仕組みを使う。人を直接は殺さない） */
  /* 返す：{ t：理由に足す文, gone：相手がその場を離れる, go：記録を書いたあとに当てる動き }（何もしなければ null） */
  function take(S, b) { return function () { b.taken = true; b.takenAt = S.h; }; }
  var SA = {
    jashin: {
      sell: function (S, a, b) { return b.curse == null ? { t: b.name + 'は村人に連れ去られた（生贄の候補）', gone: true, go: take(S, b) } : null; },
      abandon: function (S, a, b) {
        var gone = b.curse == null && S.rng() < 0.4 * (HK.Dark ? HK.Dark.f(S, 'raid') : 1);
        return { t: gone ? b.name + 'は逃げ遅れ、村人に連れ去られた' : '', gone: gone, go: function () { b.m.hp = clamp(b.m.hp - 15, 1, 100); b.m.fear = clamp(b.m.fear + 20, 0, 100); if (gone) take(S, b)(); } };
      }
    },
    jinro: {
      ok: function (S) { return /昼/.test(S.label || ''); },
      sell: function (S, a, b) { return { t: b.name + 'への疑いが一気に集まった', go: function () { S.P.forEach(function (q) { if (q !== b && q.alive && q.role !== 'wolf' && q.sus) q.sus[b.i] = clamp((q.sus[b.i] == null ? 50 : q.sus[b.i]) + 22, 0, 100); }); } }; },
      abandon: function (S, a, b) { return { t: '', go: function () { if (a.sus) a.sus[b.i] = 100; S.P.forEach(function (q) { if (q !== b && q !== a && q.alive && q.role !== 'wolf' && q.sus) q.sus[b.i] = clamp((q.sus[b.i] == null ? 50 : q.sus[b.i]) + 8, 0, 100); }); } }; }
    },
    yakata: {
      sell: function (S, a, b) { return { t: b.name + 'への疑いが強まった', go: function () { b.m.sus = clamp(b.m.sus + 25, 0, 100); } }; },
      abandon: function (S, a, b) { return { t: '', go: function () { b.m.fear = clamp(b.m.fear + 20, 0, 100); } }; }
    },
    ship: {
      sell: function (S, a, b) { return { t: b.name + 'は皆の信頼を失った', go: function () { S.relD = S.relD || {}; S.P.forEach(function (q) { if (q !== a && q !== b && q.alive) { var k = rk(q, b); S.relD[k] = clamp((S.relD[k] || 0) - 0.15, -1, 1); } }); } }; },
      abandon: function (S, a, b) { return { t: '', go: function () { b.m.hp = clamp(b.m.hp - 12, 1, 100); } }; }
    }
  };
  CF.STORY = SA;
  var RELD = { hate: -0.5, scorn: -0.35, fled: -0.2, shelter: 0.25, love: 0.35, moved: 0.18, eased: 0.08 };
  function relS(S, a, b, d) { if (!d) return; S.relD = S.relD || {}; var k = rk(a, b); S.relD[k] = clamp((S.relD[k] || 0) + d, -1, 1); }
  /* 区切りごと：組の値の上がりを抑える（変化のあとは抑えない） */
  function dampS(S) {
    if (!S.relD) return;
    var last = S._cfLast = S._cfLast || {};
    Object.keys(S._cf).forEach(function (k) {
      var p = S._cf[k], a = S.P[p.h], b = S.P[p.t]; if (!a || !b) return;
      var key = rk(a, b), cur = S.relD[key] || 0, prev = last[key];
      var slow = p.type === 'apathy' ? (apaOn(p) ? CF.K.apathy : 0) : (fearOn(p) ? CF.K.fear : 0);
      if (slow && prev != null && cur > prev) S.relD[key] = prev + (cur - prev) * slow;
      last[key] = S.relD[key] || 0;
    });
  }
  function storyFall(S, A) {
    var id = scenOf(S);
    var ks = Object.keys(S._cf);
    for (var i = 0; i < ks.length; i++) {
      var p = S._cf[ks[i]], a = S.P[p.h], b = S.P[p.t];
      if (!fearOn(p) || p.st === 'fled' || !hereS(a) || !hereS(b)) continue;
      var w = weak(S, b);
      if (!w || S.rng() > 0.55) continue;
      var c = CF.choose(S, a, b, w), k = c.k, m = { a: a, b: b, w: w };
      var text = fill(pickOf(S, actText(S, k)), m), fx = A[k] ? A[k](S, a, b) : null;
      if ((k === 'abandon' || k === 'let') && !(fx && fx.gone) && id !== 'jinro' && id !== 'yakata') text += fill(pickOf(S, X.SURVIVE), m);
      relS(S, a, b, RELD[KTO[k]]);
      p.st = KTO[k]; p.end = KTO[k]; note(S, p, k);
      if (k === 'flee') (S._cfFled = S._cfFled || {})[a.i + '>' + b.i] = 1;
      var o = ST.say(S, { actors: [a, b], tag: '恐怖の変化', text: text, why: '恐怖の変化：' + a.name + 'は' + b.name + 'を恐れていたが、' + b.name + 'が' + w + 'のを見て、恐怖を保てなくなった（' + c.why + '）→ ' + KNAME[k] + (fx && fx.t ? '（' + fx.t + '）' : ''), mag: 26 });
      /* 連れ去り・疑いなどは、記録を書いたあとに当てる（記録の中で、場を離れた人が動く文にならないように） */
      if (fx && fx.go) fx.go();
      if (o && ST.key && (k === 'sell' || (fx && fx.gone))) ST.key(S, o, a.name + 'が' + b.name + 'を' + (k === 'sell' ? '売り渡した' : '見捨てた'));
      return true;
    }
    return false;
  }
  function storyMoved(S) {
    var ks = Object.keys(S._cf);
    for (var i = 0; i < ks.length; i++) {
      var p = S._cf[ks[i]], a = S.P[p.h], b = S.P[p.t];
      if (!p.pend || !(apaOn(p) || fearOn(p)) || !hereS(a) || !hereS(b)) continue;
      p.pend = null;
      var m = { a: a, b: b }, head;
      if (p.type === 'apathy') { p.st = 'moved'; p.end = 'moved'; relS(S, a, b, RELD.moved); head = '無関心の変化：' + a.name + 'は' + b.name + 'に無関心だったが、劇的なことで心が動いた'; }
      else { p.st = 'eased'; if (!p.end || p.end === 'deep') p.end = 'eased'; relS(S, a, b, RELD.eased); head = '恐怖の変化：' + a.name + 'の' + b.name + 'への恐怖が、少し和らいだ（恐怖は消えない）'; }
      note(S, p, 'rescue');
      ST.say(S, { actors: [a, b], tag: p.type === 'apathy' ? '無関心の変化' : '恐怖の変化', text: fill(pickOf(S, X.AFTER_HELP), m) + fill(pickOf(S, p.type === 'apathy' ? X.MOVED : X.EASED), m), why: head + '／' + b.name + 'に庇われた・救われたあと', mag: 16 });
      return true;
    }
    return false;
  }
  CF.storyStep = function (S) {
    if (!S || !S.P || !S.scen || S._cfBusy) return;
    if (S._cf === undefined) S._cf = build(S._cfIn || S.ties || [], S.P);
    if (!S._cf) return;
    S._cfStep = (S._cfStep || 0) + 1;
    dampS(S);
    var A = SA[scenOf(S)];
    if (!A || (A.ok && !A.ok(S))) return;
    S._cfBusy = true;
    try { if (!storyMoved(S)) storyFall(S, A); } finally { S._cfBusy = false; }
  };
  if (ST && ST.state) HK.wrap(ST, 'state', function (prev) {
    return function (input) { var S = prev.apply(this, arguments); if (S && input) { S._cfIn = input.ties || []; S._cf = undefined; } return S; };
  });
  /* 区切りの見出しを出したあとに、変化の出来事を一つまで */
  if (ST && ST.step) HK.wrap(ST, 'step', function (prev) {
    return function (S) { var r = prev.apply(this, arguments); try { CF.storyStep(S); } catch (e) { if (HK.DEBUG) throw e; } return r; };
  });
  if (ST && ST.say) HK.wrap(ST, 'say', function (prev) {
    return function (S, o) {
      if (S && S._cf && o && o.kind !== 'step' && o.kind !== 'phase' && o.actors && o.actors.length >= 2 && typeof o.text === 'string') {
        var idx = o.actors.map(function (x) { return typeof x === 'number' ? x : x && x.i; }).filter(function (x) { return x != null; });
        var add = watch(S, idx, o);
        if (add) o.why = String(o.why || '') + add;
      }
      return prev.apply(this, arguments);
    };
  });
  /* 結末：箇条書き・住人の覚え書き・関係図の★の線 */
  var ECLS = { hate: 'enemy', scorn: 'enemy', shelter: 'guard', fled: 'none', love: 'pine', deep: 'enemy', eased: 'friend', moved: 'friend', shaken: 'obsess', ahate: 'enemy' };
  if (ST && ST.result) HK.wrap(ST, 'result', function (prev) {
    return function (S, input, o) {
      if (S && S._cf && o) {
        Object.keys(S._cf).forEach(function (k) {
          var p = S._cf[k], a = S.P[p.h], b = S.P[p.t], e = p.end;
          if (!e || !a || !b || !X.END[e]) return;
          var s = fill(X.END[e], { a: a, b: b });
          if (o.ending && Array.isArray(o.ending.lines) && o.ending.lines.indexOf(s) < 0) o.ending.lines.push(s);
          if (Array.isArray(a.notes) && a.notes.indexOf(s) < 0) a.notes.push(s);
          if (o.relmap && Array.isArray(o.relmap.edges) && X.EDGE[e]) o.relmap.edges.push({ a: a.i, b: b.i, label: '★' + X.EDGE[e], cls: ECLS[e] || 'friend', dir: a.i });
        });
      }
      return prev.apply(this, arguments);
    };
  });

  /* ================= 結末の関係のまとめ（エンジン型） ================= */
  var RCL = { hate: 'dislike', ahate: 'dislike', scorn: 'dislike', shelter: 'guard', fled: 'strangers' };
  function cfEnd(ctx, A, B) {
    var p = CF.pairOf(ctx, A, B), q = CF.pairOf(ctx, B, A);
    return p && p.end ? { p: p, h: A, t: B } : q && q.end ? { p: q, h: B, t: A } : null;
  }
  if (HK.TieRel && HK.TieRel.refine) HK.wrap(HK.TieRel, 'refine', function (prev) {
    return function (ctx, A, B, pf, cl) {
      var r = prev.apply(this, arguments), c = r || cl;
      if (!ctx || !ctx._cf || !c || !pf || pf.kill || pf.couple || /^(kill|mutualkill|lovers|breakup)$/.test(c.id)) return r;
      var x = cfEnd(ctx, A, B); if (!x || !RCL[x.p.end]) return r;
      return { id: RCL[x.p.end], dir: x.p.end === 'shelter' ? x.t.i : x.h.i };
    };
  });
  if (HK.TieRel && HK.TieRel.pairText) HK.wrap(HK.TieRel, 'pairText', function (prev) {
    return function (ctx, A, B, cl) {
      var x = ctx && ctx._cf && cl && !/^(kill|mutualkill|lovers|breakup)$/.test(cl.id) ? cfEnd(ctx, A, B) : null;
      if (x && X.END[x.p.end]) return fill(X.END[x.p.end], { a: x.h, b: x.t });
      return prev.apply(this, arguments);
    };
  });
})();
