/* 箱庭シミュレーター: キスだけの触れ合いの場面（全エンジン箱庭で共通。全年齢版も同じ。族のかたまり pack-rel）
   エッチの場面とは別の、キスだけの出来事。文は HK.Kiss（kiss.js）の型（きっかけ・長さ・深さ・終わり方）で組む。夜（体の関係）には数えない。
   ・恋人どうし（箱庭の中で恋人になった組・恋人／夫婦の関係）：きっかけごとの出来事（ふいに・からかい・ご褒美・甘えて・仲直り・お祝い・雨宿り（外の箱庭））。
     攻めの夜の性格がサド・意地悪の人は、キスの寸前で止める「お預け」が出やすい（R18版）
   ・両片想い（恋人でない、互いに惹かれている二人）：初めてのキス
   ・友人どうし（恋愛の関係でない、仲のよい二人）：事故のキス・じゃれ合い（恋愛の出来事ではない）
   ・不仲の二人：顔が近づいてにらみ合うだけ（キスはしない）
   ・三人以上の箱庭：恋人どうしのキスを、三人目が見て冷やかす（仲良し系）／見てしまって妬く（すれ違い系）。半々になるよう同じ重み
   恋愛を動かす組は HK.canLove を両方向・HK.ngPair で確かめる（エンジンの romanceOk も通る）。家族などの「恋愛：なし」・無関心・恐怖の組には出さない。
   追加パックの部屋（id が set- で始まる箱庭）は部屋ごとのキスの場面を持つので、ここの出来事は出さない。HK.KISS_OFF が真なら出さない（regress の比べ用）。
   台詞は 3 本「くだけた常体｜硬い常体｜敬語」（文は kiss-text*.js）。設計は docs/reports/2026-11-03/kiss-design.md */
(function () {
  'use strict';
  var HK = window.HK;
  if (!HK || !HK.COMMON) return;
  function R(ctx, a, b) { return ctx.R(a, b); }
  function off(ctx) { return !!(HK.KISS_OFF || !HK.Kiss || !HK.KissText || !ctx || !ctx.scen || /^set-/.test(ctx.scen.id || '') || ctx.scen.noKiss); }
  function here(ctx) { return ctx.present ? ctx.present() : ctx.chars; }
  var LOVE_CLS = { lover: 1, spouse: 1 };
  function couple(ctx, a, b) { return !!(a && b && a !== b && (ctx.pair(a, b).couple || (HK.relClass && LOVE_CLS[HK.relClass(ctx, a, b)]))); }
  function loveOk(ctx, a, b) { return !!(a && b && a !== b && HK.canLove(a, b, ctx) && HK.canLove(b, a, ctx) && !(HK.ngPair && HK.ngPair(a, b))); }
  /* 無関心・恐怖・「恋愛：なし」の関係（家族など）の組 */
  function cold(ctx, a, b) {
    if (HK.Ties && HK.Ties.apathy && (HK.Ties.apathy(ctx, a, b) || HK.Ties.apathy(ctx, b, a))) return true;
    if (HK.Ties && HK.Ties.has && (HK.Ties.has(ctx, a, b, 'fear') || HK.Ties.has(ctx, b, a, 'fear'))) return true;
    if (HK.tieLoveNoPair && (HK.tieLoveNoPair(ctx, a, b) || HK.tieLoveNoPair(ctx, b, a))) return true;
    var c = HK.relClass ? HK.relClass(ctx, a, b) : 'none';
    return c === 'fam' || c === 'pfam';
  }
  /* 同じ組のキスの回数（多いほど控えめに） */
  function key(a, b) { return a.i < b.i ? a.i + '-' + b.i : b.i + '-' + a.i; }
  function nOf(ctx, a, b) { return ((ctx._kissN || {})[key(a, b)]) || 0; }
  function count(ctx, a, b) { var N = ctx._kissN || (ctx._kissN = {}); N[key(a, b)] = (N[key(a, b)] || 0) + 1; }
  function damp(ctx, a, b) { var n = nOf(ctx, a, b); return n >= 4 ? 0.15 : n >= 2 ? 0.45 : 1; }
  /* 恋人どうしのキスをしてよい二人 */
  function lovers(ctx, a, b) { return !off(ctx) && couple(ctx, a, b) && loveOk(ctx, a, b) && !cold(ctx, a, b) && R(ctx, a, b).ten < 55 && R(ctx, b, a).ten < 55; }
  /* 追加パックの部屋（id が set- で始まる箱庭）の出来事の山からは外す（部屋ごとのキスがあるので。出来事の一覧にも出さない） */
  if (HK.buildPool && HK.wrap) HK.wrap(HK, 'buildPool', function (bp0) {
    return function (scen) { var p = bp0.apply(this, arguments); return scen && /^set-/.test(scen.id || '') && Array.isArray(p) ? p.filter(function (e) { return !(e && /^kiss_/.test(e.id || '')); }) : p; };
  });
  var OUTDOOR = { island: 1, zombie: 1 };
  /* 贈り物・乾杯・ケーキのある「お祝い」は、閉じ込められた・生き延びる箱庭では出さない */
  var HARSH = { whiteroom: 1, island: 1, zombie: 1, br: 1, trial: 1 };
  function ev(o) { HK.addTo(HK.COMMON, o); }
  /* 恋人どうしのきっかけごとの出来事 */
  function loverEv(id, trig, label, w, extra) {
    ev({
      id: id, label: label, cat: 'romance', scope: 'pair', tie: '-',
      when: function (ctx, a, b) { return lovers(ctx, a, b) && (!extra || extra(ctx, a, b)); },
      w: function (ctx, a, b) { return w(ctx, a, b) * damp(ctx, a, b); },
      run: function (ctx, a, b) {
        var r = HK.Kiss.text(ctx, a, b, { trig: trig });
        count(ctx, a, b);
        var p = r.plan, ten = trig === 'naka' ? -8 : -2;
        ctx.mod2(a, b, { att: 3, aff: 2, ten: ten }, { att: 3, aff: 2, ten: ten });
        return { text: r.text, why: 'キスだけの触れ合い：' + r.why, mag: p.len === 'l' ? 12 : 8 };
      }
    });
  }
  loverEv('kiss_fui', 'fui', 'ふいに唇を寄せるキス', function () { return 0.35; });
  loverEv('kiss_karakai', 'karakai', 'からかいながらのキス（お預けも）', function (ctx, a, b) {
    var o = HK.Pos && HK.Pos.order ? HK.Pos.order(a, b) : [a, b], nt = HK.Kiss.nightOf(o[0], o[1]), pa = HK.Kiss.per(o[0]);
    return /^(sadist|mean)$/.test(nt) || pa === 'free' || pa === 'proud' ? 0.3 : 0.12;
  });
  loverEv('kiss_hobi', 'hobi', 'ご褒美にキスする', function () { return 0.18; });
  loverEv('kiss_amae', 'amae', '甘えてキスをねだられる', function (ctx, a, b) { var pb = HK.Kiss.per(b); return /^(devoted|free|shy|gentle)$/.test(pb) ? 0.2 : 0.1; });
  loverEv('kiss_naka', 'naka', '仲直りのしるしにキスする', function () { return 0.6; }, function (ctx, a, b) { return R(ctx, a, b).ten >= 18 || R(ctx, b, a).ten >= 18; });
  loverEv('kiss_kinen', 'kinen', 'お祝いの日にキスする', function () { return 0.08; }, function (ctx) { return !HARSH[ctx.scen.id]; });
  loverEv('kiss_ame', 'amayadori', '雨宿りの軒下でキスする', function () { return 0.2; }, function (ctx) { return !!OUTDOOR[ctx.scen.id]; });

  /* 両片想い：初めてのキス（恋人ではない、互いに惹かれている二人。一組に一度） */
  ev({
    id: 'kiss_first', label: '両片想いの二人の初めてのキス', cat: 'romance', scope: 'pair', tie: '-',
    when: function (ctx, a, b) {
      if (off(ctx) || couple(ctx, a, b) || nOf(ctx, a, b) || !loveOk(ctx, a, b) || cold(ctx, a, b)) return false;
      var r1 = R(ctx, a, b), r2 = R(ctx, b, a);
      return r1.att > 40 && r2.att > 40 && r1.aff > 25 && r2.aff > 25 && r1.ten < 35 && (!HK.Poly || !HK.Poly.canTry || HK.Poly.canTry(ctx, a, b));
    },
    w: function () { return 0.2; },
    run: function (ctx, a, b) {
      var r = HK.Kiss.text(ctx, a, b, { rel: 'first' });
      count(ctx, a, b);
      ctx.mod2(a, b, { att: 8, aff: 3 }, { att: 8, aff: 3 });
      return { text: r.text, why: 'キスだけの触れ合い：' + r.why + '（互いに惹かれていた二人）', mag: 14 };
    }
  });
  /* 友人どうし：事故のキス・じゃれ合い（恋愛の出来事ではない） */
  var FRIEND_CLS = { known: 1, work: 1, school: 1, weak: 1, none: 1 };
  ev({
    id: 'kiss_friend', label: '友人どうしの事故のキス・じゃれ合い', cat: 'bond', scope: 'pair', tie: '-',
    when: function (ctx, a, b) {
      if (off(ctx) || couple(ctx, a, b) || cold(ctx, a, b) || !HK.relClass || !FRIEND_CLS[HK.relClass(ctx, a, b)]) return false;
      var r1 = R(ctx, a, b), r2 = R(ctx, b, a);
      return r1.aff > 30 && r2.aff > 30 && r1.ten < 20 && r2.ten < 20 && r1.att < 30 && r2.att < 30 && nOf(ctx, a, b) < 1;
    },
    w: function (ctx, a) { return 0.06 + (a.tr && a.tr.fc ? a.tr.fc * 0.06 : 0); },
    run: function (ctx, a, b) {
      var r = HK.Kiss.text(ctx, a, b, { rel: 'friend' });
      count(ctx, a, b);
      ctx.mod2(a, b, { aff: 3 }, { aff: 3 });
      return { text: r.text, why: '友人どうしのじゃれ合い（' + r.why + '）', mag: 6 };
    }
  });
  /* 不仲：顔が近づいてにらみ合う（キスはしない） */
  ev({
    id: 'kiss_feud', label: '顔が近づいて不仲の二人がにらみ合う', cat: 'conflict', scope: 'pair', tie: '-',
    when: function (ctx, a, b) { return !off(ctx) && !couple(ctx, a, b) && R(ctx, a, b).ten > 55 && R(ctx, b, a).ten > 45 && R(ctx, a, b).aff < 10 && nOf(ctx, a, b) < 1; },
    w: function () { return 0.08; },
    run: function (ctx, a, b) {
      var r = HK.Kiss.text(ctx, a, b, { rel: 'feud' });
      count(ctx, a, b);
      ctx.mod2(a, b, { ten: 4 }, { ten: 4 });
      return { text: r.text, why: '不仲の二人：' + r.why, mag: 6 };
    }
  });

  /* ---------- 三人目に見られる（a＝見た人、b＝恋人の片方、c＝b の恋人） ---------- */
  function rot(ctx, b, n) { return ((ctx.stepIndex || 0) + (b ? b.i : 0)) % n; }
  function loverOf(ctx, b, not) {
    var ls = HK.Poly && HK.Poly.lovers ? HK.Poly.lovers(ctx, b) : here(ctx).filter(function (c) { return c !== b && couple(ctx, b, c); });
    var hs = here(ctx);
    ls = ls.filter(function (c) { return c !== not && hs.indexOf(c) >= 0 && lovers(ctx, b, c); });
    return ls.length > 1 ? ls[rot(ctx, b, ls.length)] : ls[0] || null;
  }
  function friendly(ctx, a, b) { return R(ctx, a, b).aff > 15 && R(ctx, a, b).ten < 35; }
  ev({
    id: 'kiss_seen', label: '恋人たちのキスを見て冷やかす', cat: 'bond', scope: 'pair', tie: '-',
    when: function (ctx, a, b) {
      if (off(ctx) || here(ctx).length < 3) return false;
      var c = loverOf(ctx, b, a);
      return !!c && !couple(ctx, a, b) && !couple(ctx, a, c) && friendly(ctx, a, b) && friendly(ctx, a, c) && R(ctx, a, b).att < 35 && R(ctx, a, c).att < 35;
    },
    w: function (ctx, a, b) { return 0.2 * damp(ctx, a, b); },
    run: function (ctx, a, b) {
      var c = loverOf(ctx, b, a), o = HK.Pos && HK.Pos.order ? HK.Pos.order(b, c) : [b, c];
      var t = HK.Kiss.seen(ctx, o[0], o[1], a, 'warm');
      count(ctx, a, b);
      ctx.mod2(b, c, { att: 2, aff: 2 }, { att: 2, aff: 2 }); ctx.mod2(a, b, { aff: 2 }, { aff: 2 });
      return { with: [c], text: t, why: a.name + 'が、恋人どうしの' + b.name + 'と' + c.name + 'のキスを見て冷やかした（仲良し）', mag: 8 };
    }
  });
  ev({
    id: 'kiss_seen_jeal', label: '恋人たちのキスを見て妬く', cat: 'romance', scope: 'pair', tie: '-',
    when: function (ctx, a, b) {
      if (off(ctx) || here(ctx).length < 3) return false;
      var c = loverOf(ctx, b, a);
      return !!c && !couple(ctx, a, b) && R(ctx, a, b).att > 35 && HK.canLove(a, b, ctx) && !cold(ctx, a, b);
    },
    w: function (ctx, a, b) { return 0.2 * damp(ctx, a, b); },
    run: function (ctx, a, b) {
      var c = loverOf(ctx, b, a), o = HK.Pos && HK.Pos.order ? HK.Pos.order(b, c) : [b, c];
      var t = HK.Kiss.seen(ctx, o[0], o[1], a, 'jeal');
      count(ctx, a, b);
      ctx.mod(a, c, { ten: 5 }); ctx.mod(a, b, { att: 2 });
      if (ctx.stress) ctx.stress(a, 10);
      return { with: [c], text: t, why: a.name + 'が、想いを寄せる' + b.name + 'と恋人の' + c.name + 'のキスを見てしまった（嫉妬）', mag: 10 };
    }
  });
})();
