/* 箱庭シミュレーター（R18版のみ）: 劣等感・優越の夜の一文（族のかたまり pack-rel。全年齢版にはこのファイルはない）
   設計：docs/reports/2026-10-29/lovehate-design.md の 7-4。新しい夜の入口は作らない（夜の起こりやすさは土台の衝動の倍率 HK.feelImpK：劣等感 1.2・優越 1.3）。
   ・既にある夜の場面（記録に性的な場面の印 e.lewd があり、住人がちょうど二人）で、二人のどちらかが相手に劣等感・優越を持っていれば（HK.Esteem.of。恐怖・無関心の組は持たない扱い）、
     その気持ちの一文（3 文）を足す：劣等感＝縋る、優越＝思いどおりにしたい・自分が上でいたい。
     きっかけの段（tag「きっかけ」。HK.SexLead などが場面の直前に足したもの）があれば、その段の終わりに足し、なければ場面の最初の段（場所・成り行き）のあとに段として足す（段が少なければ頭に）。
   ・組ごとに初めての夜は必ず、二度目からは 35%。合意のない展開の場面（force・〔合意のない展開〕）には足さない。
   ・攻め受けは本人の設定のまま：文はどちらが攻めでも読める書き方にする（優越でも受けは受け。「組み敷く」「貫く」などの向きの語・体の語は書かない）。
     性別の語も使わない（男×女・女×女・女攻め×男のどれでも読める）
   登場人物はすべて成人として扱う */
/* @event-ok 劣等感・優越の夜の一文（既にある夜の場面・きっかけの段に差し込むだけ。新しい出来事ではない） */
(function () {
  'use strict';
  var HK = window.HK;
  if (!HK || !HK.Esteem || !HK.wrap) return;
  function L(s) { return s.split('|'); }
  var T = HK.EsteemNight = {
    inferior: L('{a}は、{b}に触れられているあいだだけ、引け目を忘れていられた。自分なんかが求められている――その実感に、{a}は縋るようにしがみついた。手を離したら、またいつもの惨めな自分に戻ってしまう気がした。|' +
      'いつも{b}の背中を見てばかりの{a}にとって、今夜だけは{b}が自分だけを見ていた。それが嬉しくて、同じくらい怖かった。{a}は{b}の名前を呼びながら、離れまいと身を寄せた。|' +
      '{a}は、{b}に見合う自分ではないと分かっていた。だからこそ、この熱だけは手放したくなかった。{a}は{b}の肩口に顔を埋めて、縋るように息を詰めた。'),
    superior: L('{a}にとって、これもまた{b}より上に立つための一つだった。{b}が自分に夢中になっていくのを、{a}は一つも見逃すまいとした。どちらが求める側であれ、心の上ではいつも自分が上でいたかった。|' +
      '{b}が自分を欲しがっている――そう思えることが、{a}には何より大事だった。{a}は{b}の反応を確かめるように、わざと間を置いた。焦れた{b}の顔を見て、{a}は満足げに目を細めた。|' +
      '{a}は、{b}を思いどおりにしたかった。どちらが求める側であれ、{b}の熱を左右しているのは自分だと思いたかった。{a}は{b}の名前を、命じるように低く呼んだ。')
  };
  var FORCE_RE = /〔合意のない展開〕/;
  function isCtx(x) { return !!(x && x.R && x.pair && x.chars); }
  function pickOf(Z, arr) {
    if (isCtx(Z)) return Z.pick(arr);
    if (HK.Story && HK.Story.pick && Z.recent) return HK.Story.pick(Z, arr);
    return arr[Math.floor(Z.rng() * arr.length)];
  }
  function fill(t, a, b) { return String(t).replace(/\{a\}/g, a.name).replace(/\{b\}/g, b.name); }
  /* 二人のうち気持ちを持つ側 [持つ側, 相手, 気持ち]（両方なら乱数で一人） */
  function holder(Z, x, y) {
    var E = HK.EsteemEv, c = [];
    [[x, y], [y, x]].forEach(function (q) {
      /* 組の表（esteem.js。物語型は S.ties が無い箱庭もあるので、表を先に見る）。立場が逆転した優越は、劣等感として */
      var p = E && E.pairOf ? E.pairOf(Z, q[0], q[1]) : null;
      var k = p ? p.cur : HK.Esteem.of(Z, q[0], q[1]);
      if (!k) return;
      c.push([q[0], q[1], k]);
    });
    if (!c.length) return null;
    return c.length > 1 && Z.rng() < 0.5 ? c[1] : c[0];
  }
  function apply(Z, e, o) {
    if (HK.SAFE_ON || !e || e.skipped || !e.lewd || e.kind === 'step' || typeof e.text !== 'string' || !e.text) return;
    if ((o && o.force) || FORCE_RE.test(String(e.why || ''))) return;
    var P = isCtx(Z) ? Z.chars : Z.P, ids = (e.actors || []).map(function (x) { return typeof x === 'number' ? x : x && x.i; }).filter(function (x) { return x != null; });
    if (ids.length !== 2 || ids[0] === ids[1]) return;
    var x = P[ids[0]], y = P[ids[1]];
    if (!x || !y) return;
    var h = holder(Z, x, y); if (!h) return;
    var key = Math.min(x.i, y.i) + '-' + Math.max(x.i, y.i), cnt = Z._esNight = Z._esNight || {};
    if (cnt[key] && Z.rng() >= 0.35) return;
    cnt[key] = (cnt[key] || 0) + 1;
    var s = fill(pickOf(Z, T[h[2]]), h[0], h[1]), log = Z.log || [], lead = log[e.n - 1];
    var note = h[0].name + 'は' + h[1].name + (h[2] === 'inferior' ? 'に劣等感を抱いている（縋るように求めた）' : 'に優越を感じている（自分が上でいたかった）');
    if (lead && lead.tag === 'きっかけ' && typeof lead.text === 'string' && (lead.step === e.step || lead.label === e.label)) {
      lead.text += s;
      lead.why = String(lead.why || '') + '・' + note;
    } else {
      /* 場面の最初の段（場所・成り行きの一文）のあとに段として入れる。段が少なければ頭に */
      var ps = e.text.split('\n\n');
      if (ps.length >= 3 && ps[0].length <= 160 && ps[0].indexOf('「') < 0) { ps.splice(1, 0, s); e.text = ps.join('\n\n'); }
      else e.text = s + '\n\n' + e.text;
      e.why = String(e.why || '') + (e.why ? '／' : '') + note;
    }
  }
  HK.EsteemNight.apply = apply;
  if (HK.Ctx && HK.Ctx.prototype.say) HK.wrap(HK.Ctx.prototype, 'say', function (prev) {
    return function (o) { var e = prev.apply(this, arguments); try { apply(this, e, o); } catch (err) { if (HK.DEBUG) throw err; } return e; };
  });
  if (HK.Story && HK.Story.say) HK.wrap(HK.Story, 'say', function (prev) {
    return function (S, o) { var e = prev.apply(this, arguments); try { if (S) apply(S, e, o); } catch (err) { if (HK.DEBUG) throw err; } return e; };
  });
})();
