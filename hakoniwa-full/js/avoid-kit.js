/* 箱庭シミュレーター: 「苦手で避けている」人の判定（全箱庭の共通。中核。2026-10-28 担当JE）
   利用者の指示（2026-10-28）：思いの方向は愛憎でも執着でもどんな形でも、苦手で避けている・回避行動をするタイプが積極的に迫ることはないように。
   ■ HK.Avoid.of(x, a, b)：a が b を「避けている」なら真（x はエンジン型の ctx か、物語型の S。関係は ctx なら HK.Ties.all、S なら S.ties）
     次のどれか：
     ・不仲・敵対の「相手の気持ち：苦手・避けている」（HK.HATE_BACK.avoid）。データは「t.a が t.b を敵視、t.cold が t.b の気持ち」なので、避けているのは t.b
     ・片想いの「想われる側：苦手・避けている」（HK.CRUSH_COLD.dislike。避けているのは想われる側 t.b）
     ・執着の「執着される側：怖がっている・嫌っている」（HK.OBS_BACK.afraid／hate。避けているのは執着される側 t.b）
     ・歪んだ関係の「支配される側：怯えている・逃げ出したい」（HK.ABUSE_BACK.fear／flee。避けているのは支配される側 t.b）
     ・関係「恐怖」（T.fear：恐れる側 t.a が避ける）・「無関心」（T.apathy：無関心な側 t.a は迫らない）
     ・嫌悪レベル（hate-kit.js の HK.HateKit.level）が 35 以上（不仲の帯）で、その人の気質が回避型（HK.Avoid.shy）
   ただし、その人が相手を想っているとき（HK.Avoid.loves：片想い・執着・信仰・盲信・慕う・本命の想う側、恋人・番・運命の番・友達以上・夫婦・
   許嫁（断りたい側を除く）、両片想いの想われる側、不仲・敵対の相手の気持ち「愛している」、愛憎を持つ側（HK.LoveHate.has）、
   エンジン型の惹かれ 45 以上・執着度 35 以上・恋人どうし）は「避けている」に数えない
   （担当JD の hate-sex-r18.js の avoids と同じ決まり。愛憎は「嫌いだけど構う」型なので、愛憎を持つ側は避けていない）。
   恐怖・無関心は「恋愛にしない」の印でもあるので、想いの関係を重ねていても避けているほうを優先する（ties.js の HK.Ties.after と同じ）。
   ■ 回避型の気質（HK.Avoid.shy）：HK.traits の値で ac（順応）≥ 0.6・cp（批判）≤ 0.45・aggr（攻撃性）≤ 0.45
     （エゴグラムで AC 12 以上・CP 9 以下で、FC が高すぎない人。hate-kit.js の敵視の動き方では「避ける・陰で嫌う」passive に入る人）
   ■ HK.Avoid.why(x, a, b)：理由の短い文（「苦手・避けている」「恐怖」「無関心」「嫌悪と回避型の気質」など。避けていなければ ''）
   ■ HK.Avoid.initiator(x, a, b)：a が b に自分から迫ってよいか（避けていなければ真）
   ■ HK.Avoid.lead(x, a, b)：向きの決まらない場面で [迫る側, 相手]。a が避けていれば b を迫る側に、両方が避けていれば null
   ■ HK.Avoid.note(x, a, b)：理由の欄に足す一文「a は b を避けているので、自分からは迫らない（理由）」
   ■ HK.Avoid.pick(x, a, b, sex)：場面の入口で使う。{ a: 迫る側, b: 相手, note: 入れ替えたときの理由の一文 } か、起こさないなら null
   ■ HK.Avoid.topOk(x, a, b)：攻め（HK.Pos.order の一人目）が迫る書き方の場面に、この二人を使ってよいか（両方が避けている組・攻めに固定された人が受けを避けている組は偽）
   ■ HK.Avoid.okSex(x, a, b)：a が主役の体の関係の場面を起こしてよいか（a が b を避けていない、かつ受け攻めの指定で攻めに固定された人が受けを避けていない）
   ■ 全体の門（ここで包む。止めた場面は記録に残らない）
     ・Ctx.prototype.romanceOk（エンジン型の恋愛・体の関係の出来事は、act() の候補選び・actRun・Ctx.say・act2 のすべてでここを通る）：
       主役（actors の一人目）が相手（二人目）を避けていれば起こさない。体の関係の出来事は、攻めに固定された人が受けを避けている組も起こさない。
       三人以上の場面（trioPairs）は、主役が直接の行為をする相手を避けていないこと・直接の行為をする組のどれもが topOk であることを見る
     ・HK.Pos.order（受け攻めの向き）：攻め（迫る側）が受けを避けていて、逆の向きが受け攻めの指定で成り立つなら入れ替える（攻めを選んだ人は受けにしない）。
       入れ替えたときは、その二人の次の記録の理由に「避けているので、自分からは迫らない」を足す（Ctx.say・HK.Story.say）
     モブ・箱庭の仕掛け（ゾンビ・神・触手）は住人でないので対象外 */
(function () {
  'use strict';
  var HK = window.HK;
  if (!HK) return;
  function isCtx(x) { return !!(x && x.R && x.pair && x.chars); }
  function tieList(x, a, b) {
    if (!x || !a || !b) return [];
    if (isCtx(x)) return HK.Ties ? HK.Ties.all(x, a, b) : [];
    return (x.ties || []).filter(function (t) { return t && ((t.a === a.i && t.b === b.i) || (t.a === b.i && t.b === a.i)); });
  }
  function pkey(a, b) { return a.i < b.i ? a.i + '-' + b.i : b.i + '-' + a.i; }
  var LOVE_T = /^(crush|yan|worship|fond|blind|honmei|lover|almost|fiance|spouse|mate|fated)$/;
  function dirTie(t) { var D = HK.TIES && HK.TIES[t.type]; return !!(D && D.dir); }
  /* 回避型の気質の閾値と、「想っている」に数えるエンジン型の値（惹かれ・執着度）、嫌悪レベル */
  var SHY = { ac: 0.6, cp: 0.45, aggr: 0.45, lv: 35, att: 45, ob: 35 };
  function shy(p) { var t = (p && p.tr) || (p && p.eg && HK.traits ? HK.traits(p.eg) : null); return !!(t && t.ac >= SHY.ac && t.cp <= SHY.cp && t.aggr <= SHY.aggr); }
  /* a が b を想っているか（関係の設定と、エンジン型の値。ctx.pair は組を作るので、ctx.pf を直接見る） */
  function loves(x, a, b) {
    if (tieList(x, a, b).some(function (t) {
      var D = HK.TIES && HK.TIES[t.type];
      if (D && D.hate) return t.b === a.i && t.cold === 'love';
      if (t.type === 'fiance') return (t.a === a.i ? t.feel : t.feelB) !== 'refuse';
      if (t.type === 'crush' && t.b === a.i && t.cold === 'mutual') return true;
      return LOVE_T.test(t.type) && (!dirTie(t) || t.a === a.i);
    })) return true;
    if (HK.LoveHate && HK.LoveHate.has && HK.LoveHate.has(x, a, b)) return true;
    if (isCtx(x)) {
      var pf = x.pf && x.pf[pkey(a, b)];
      if (pf && pf.couple) return true;
      if (pf && pf.ob && pf.ob[a.i] && pf.ob[a.i].lv >= SHY.ob) return true;
      var r = x.rel && x.rel[a.i] && x.rel[a.i][b.i];
      if (r && r.att >= SHY.att) return true;
    } else {
      /* 物語型：箱庭の中で恋人になった二人（宇宙船の S.lovers・恋仲 S.rom） */
      if (Array.isArray(x.lovers) && x.lovers.some(function (pr) { return pr && ((pr[0] === a.i && pr[1] === b.i) || (pr[0] === b.i && pr[1] === a.i)); })) return true;
      if (x.rom && x.rom[pkey(a, b)]) return true;
    }
    return false;
  }
  /* 関係の設定から決まる理由（恐怖・無関心は想いより先） */
  function tieWhy(x, a, b) {
    var l = tieList(x, a, b), w = '';
    for (var i = 0; i < l.length; i++) {
      if (l[i].type === 'fear' && l[i].a === a.i) return '恐怖';
      if (l[i].type === 'apathy' && l[i].a === a.i) return '無関心';
    }
    for (var j = 0; j < l.length; j++) {
      var u = l[j], D = HK.TIES && HK.TIES[u.type];
      if (u.b !== a.i || u.a !== b.i || w) continue;
      if (D && D.hate && u.cold === 'avoid') w = '苦手・避けている';
      else if (u.type === 'crush' && u.cold === 'dislike') w = '想われているが、苦手・避けている';
      else if (u.type === 'yan' && (u.cold === 'afraid' || u.cold === 'hate')) w = u.cold === 'afraid' ? '執着されて怖がっている' : '執着されて嫌っている';
      else if (u.type === 'abuse' && (u.cold === 'fear' || u.cold === 'flee')) w = u.cold === 'fear' ? '支配されて怯えている' : '支配から逃げ出したい';
    }
    return w;
  }
  /* 嫌悪レベル（物語型は S.hate の表。関係がまだ写されていない S で表を作ると空のまま残るので、S.ties か S.hate があるときだけ見る） */
  function hateLv(x, a, b) {
    var H = HK.HateKit;
    if (!H || !H.level) return 0;
    if (!isCtx(x) && !x.hate && !x.ties) return 0;
    return H.level(x, a, b);
  }
  function why(x, a, b) {
    if (!x || !a || !b || a === b || a.i == null || b.i == null || a.i === b.i) return '';
    var w = tieWhy(x, a, b);
    if (w === '恐怖' || w === '無関心') return w;
    if (loves(x, a, b)) return '';
    if (w) return w;
    if (shy(a) && hateLv(x, a, b) >= SHY.lv) return '嫌悪と回避型の気質';
    return '';
  }
  /* いま回っている箱庭（エンジン型の ctx か物語型の S）。住人そのもの（写しでない）のときだけ */
  function curOf(a, b) {
    if (!a || !b || a.i == null || b.i == null) return null;
    var c = HK._curCtx;
    if (c && c.chars && c.chars[a.i] === a && c.chars[b.i] === b) return c;
    var S = HK.Story && HK.Story._cur;
    if (S && S.P && S.P[a.i] === a && S.P[b.i] === b) return S;
    return null;
  }
  /* 受け攻めの指定で、攻めが一人に決まる組（[攻め, 受け]。決まらなければ null） */
  function fixedTop(a, b) {
    var P = HK.Pos;
    if (!P || !P.orients) return null;
    var os = P.orients(a, b);
    return os.length === 1 ? os[0] : null;
  }
  var AV = HK.Avoid = {
    SHY: SHY,
    shy: shy,
    loves: loves,
    why: why,
    of: function (x, a, b) { return !!why(x, a, b); },
    initiator: function (x, a, b) { return !why(x, a, b); },
    /* 向きの決まらない場面：避けていない側を迫る側に。両方が避けていれば null */
    lead: function (x, a, b) {
      if (!AV.of(x, a, b)) return [a, b];
      if (!AV.of(x, b, a)) return [b, a];
      return null;
    },
    /* 理由の欄に足す一文（a が避けている側） */
    note: function (x, a, b) {
      var w = why(x, a, b);
      return w ? a.name + 'は' + b.name + 'を避けているので、自分からは迫らない（' + w + '）' : '';
    },
    /* 体の関係の場面：a が主役で、受け攻めの指定で攻めに固定された人が受けを避けていない */
    okSex: function (x, a, b) {
      if (!a || !b || a === b) return true;
      if (AV.of(x, a, b)) return false;
      if (!AV.of(x, b, a)) return true;
      var o = fixedTop(a, b);
      return !(o && o[0] === b);
    },
    /* 攻め（HK.Pos.order の一人目）が迫る書き方の場面に、この二人を使ってよいか：両方が避けている組と、
       受け攻めの指定で攻めに固定された人が受けを避けている組は使わない（固定でない組は HK.Pos.order が避けていない側を攻めにする） */
    topOk: function (x, a, b) {
      if (!a || !b || a === b) return true;
      var ab = AV.of(x, a, b), ba = AV.of(x, b, a);
      if (!ab && !ba) return true;
      if (ab && ba) return false;
      var o = fixedTop(a, b);
      return !(o && AV.of(x, o[0], o[1]));
    },
    /* 場面の入口で使う：a が b に迫る場面を、避けていない側が迫る向きにする。{ a: 迫る側, b: 相手, note: 入れ替えたときの理由の一文 }。
       両方が避けている・（sex のとき）攻めに固定された人が受けを避けている組は null（場面を起こさない） */
    pick: function (x, a, b, sex) {
      var ld = AV.lead(x, a, b);
      if (!ld || (sex && !AV.okSex(x, ld[0], ld[1]))) return null;
      return { a: ld[0], b: ld[1], note: ld[0] !== a ? AV.note(x, a, b) : '' };
    },
    /* 出来事 e が「自分から迫る」出来事か（恋愛・体の関係・執着の行動・印 approach） */
    approach: function (e) { return !!(e && (e.cat === 'romance' || e.sex || e.approach || /^ob_act/.test(e.id || ''))); },
    /* a が主役の出来事 e を、相手 b に起こしてはいけないか */
    block: function (x, a, b, e) {
      if (!a || !b || a === b || !AV.approach(e || { cat: 'romance' })) return false;
      return e && e.sex ? !AV.okSex(x, a, b) : AV.of(x, a, b);
    }
  };

  /* ---------- 全体の門 ---------- */
  /* エンジン型：恋愛・体の関係の出来事の主役が相手を避けていれば起こさない */
  if (HK.Ctx && HK.wrap && !HK.Ctx.prototype.romanceOk._avoid) {
    HK.wrap(HK.Ctx.prototype, 'romanceOk', function (orig) {
      var f = function (actors, ev) {
        var self = this, TP = ev && ev.trioPairs && ev.trioPairs.length ? ev.trioPairs : null;
        var L = (actors || []).filter(Boolean), ok = function (p) { return p && p[0] && p[1] && p[0].i != null && p[1].i != null; };
        if (TP) {
          /* 三人以上の場面：主役（一人目）は、直接の行為をする相手を避けていない。直接の行為をする組はどれも、お互いに避けている組・攻めに固定された人が受けを避けている組でない */
          if (TP.some(function (p) { return ok(p) && ((p[0] === L[0] && AV.of(self, p[0], p[1])) || (p[1] === L[0] && AV.of(self, p[1], p[0])) || (ev.sex && !AV.topOk(self, p[0], p[1]))); })) return false;
        } else if (L.length >= 2 && ok(L) && (ev && ev.sex ? !AV.okSex(this, L[0], L[1]) : AV.of(this, L[0], L[1]))) return false;
        return orig.apply(this, arguments);
      };
      f._avoid = true;
      return f;
    });
  }
  /* 受け攻めの向き：攻めが受けを避けていて、逆の向きが成り立てば入れ替える（入れ替えた組は、次の記録の理由に一文を足す） */
  if (HK.Pos && HK.Pos.order && HK.wrap && !HK.Pos.order._avoid) {
    HK.wrap(HK.Pos, 'order', function (orig) {
      var f = function (a, b, fb) {
        var r = orig.apply(this, arguments);
        if (!r || !r[0] || !r[1] || r[0] === r[1]) return r;
        var x = curOf(r[0], r[1]);
        if (!x || !AV.of(x, r[0], r[1]) || AV.of(x, r[1], r[0])) return r;
        var os = HK.Pos.orients(r[0], r[1]);
        /* 入れ替えられない（攻めに固定されている）：点検用の知らせ（AV.onStuck を点検の道具が置く）。場面は入口の判定（topOk・okSex）で起こさない */
        if (!os.some(function (o) { return o[0] === r[1]; })) { if (AV.onStuck) AV.onStuck(x, r); return r; }
        x._avNote = { k: pkey(r[0], r[1]), text: AV.note(x, r[0], r[1]) };
        return [r[1], r[0]];
      };
      f._avoid = true;
      return f;
    });
  }
  /* 入れ替えた組の、次の性的な場面の記録（二人とも出る記録）の理由に一文を足す。その二人の性的でない記録・止めた記録・区切り（step）では足さずに忘れる
     （向きは出来事の条件を調べるときにも決まるので、場面にならなかった分の一文を、別の場面に付けないため） */
  function addNote(x, e, ids, sexy) {
    var n = x && x._avNote;
    if (!n || !e) return;
    if (e.kind === 'step') { x._avNote = null; return; }
    var ij = n.k.split('-').map(Number);
    if (ids.indexOf(ij[0]) < 0 || ids.indexOf(ij[1]) < 0) return;
    x._avNote = null;
    if (sexy && !e.skipped && typeof e.why === 'string' && e.why.indexOf(n.text) < 0) e.why = e.why ? e.why + '／' + n.text : n.text;
  }
  if (HK.Ctx && !HK.Ctx.prototype.say._avoid) {
    var cs0 = HK.Ctx.prototype.say;
    HK.Ctx.prototype.say = function (o) {
      var e = cs0.apply(this, arguments);
      if (this._avNote && o && e) addNote(this, e, (o.actors || []).map(function (c) { return c && c.i; }), !!(e.lewd || (o.sex != null ? o.sex : o.cat === 'romance' && this._ev && this._ev.sex)));
      return e;
    };
    HK.Ctx.prototype.say._avoid = true;
  }
  if (HK.Story && HK.Story.say && !HK.Story.say._avoid) {
    var ss0 = HK.Story.say;
    HK.Story.say = function (S, o) {
      var e = ss0.apply(this, arguments);
      if (S && S._avNote && e) addNote(S, e, (e.actors || []).map(function (p) { return typeof p === 'number' ? p : p && p.i; }), !!(e.lewd || e.kind === 'climax'));
      return e;
    };
    HK.Story.say._avoid = true;
  }
})();
