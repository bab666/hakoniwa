/* 箱庭シミュレーター: 関係・口調・恋愛相手の固定を使う出来事の共通部品（無人島・ゾンビの街で使う）
   行動の起こりやすさはエゴグラムの数値で決め、関係・口調は「誰に向けて」「どんな言い方で」を決めるだけ */
(function () {
  'use strict';
  var HK = window.HK;
  var RK = HK.RelKit = {};
  RK.L = function (s) { return s.split('|'); };
  RK.fill = function (t, m) { return String(t).replace(/\{(\w+)\}/g, function (x, k) { return m[k] != null ? m[k] : x; }); };
  function exact(ctx, a, b, type) {
    var l = HK.Ties ? HK.Ties.all(ctx, a, b) : [];
    for (var i = 0; i < l.length; i++) if (l[i].type === type) return l[i];
    return null;
  }
  RK.exact = exact;
  /* a から見た、追加した関係の種類（なければ null） */
  RK.kind = function (ctx, a, b) {
    var t;
    if ((t = exact(ctx, a, b, 'sibprot'))) return t.a === a.i ? 'protA' : 'protB';
    if (exact(ctx, a, b, 'sibclose')) return 'sibclose';
    if ((t = exact(ctx, a, b, 'teacher'))) return t.a === a.i ? 'teacherA' : 'teacherB';
    if ((t = exact(ctx, a, b, 'mentor'))) return t.a === a.i ? 'mentorA' : 'mentorB';
    return null;
  };
  RK.tone = function (c) { return HK.toneOf ? HK.toneOf(c) : ''; };
  /* 家族・教師と生徒（恋愛・性的な展開にしない組） */
  RK.noRomance = function (ctx, a, b) {
    var l = HK.Ties ? HK.Ties.all(ctx, a, b) : [];
    return l.some(function (t) { return t.type === 'teacher' || HK.tieNoLove(t); });
  };
  RK.locked = function (a) { return a && HK.lockAny(a); };
  RK.lockedTo = function (a, b) { return a && b && HK.lockTo(a, b); };
  /* 同じ出来事を何度も出しすぎない */
  RK.cool = function (ctx, a, b, id, gap) {
    var pf = ctx.pair(a, b), k = '_rk_' + id;
    if (pf[k] != null && ctx.stepIndex - pf[k] < (gap || 6)) return false;
    return true;
  };
  RK.mark = function (ctx, a, b, id) { ctx.pair(a, b)['_rk_' + id] = ctx.stepIndex; };
  /* 亡くなった相手を想う（追加した関係・恋愛相手の固定）。flavor: { kind: [文] } */
  RK.mourn = function (scen, TEXT, idPre) {
    scen.events.push({
      id: idPre + '_mourn', cat: 'solo', scope: 'solo',
      when: function (ctx, a) {
        return ctx.chars.some(function (o) { return o !== a && !o.alive && !(a.flags.mourned || {})[o.i] && (RK.kind(ctx, a, o) || RK.lockedTo(a, o)); });
      },
      w: function () { return 2.4; },
      run: function (ctx, a) {
        var o = ctx.chars.filter(function (x) { return x !== a && !x.alive && !(a.flags.mourned || {})[x.i] && (RK.kind(ctx, a, x) || RK.lockedTo(a, x)); })[0];
        a.flags.mourned = a.flags.mourned || {}; a.flags.mourned[o.i] = true;
        var k = RK.kind(ctx, a, o) || 'lock';
        ctx.stress(a, 18);
        var res = { text: RK.fill(ctx.pick(TEXT[k] || TEXT.lock), { a: a.name, b: o.name }), why: a.name + 'は、' + o.name + 'を失った（' + ({ protA: '我が子のように守ってきた{sib:a→b}', protB: '守ってくれた{sib:a→b}', sibclose: '親友のような{sib:a→b}', teacherA: '教え子', teacherB: '先生', mentorA: '弟子', mentorB: '師匠', lock: HK.locks(a).length > 1 ? '恋愛の相手と決めていた一人' : 'ただ一人と決めていた相手' })[k] + '）', mag: 30, with: [o] };
        /* 続柄の印（{sib:a→b}。sib-word.js） */
        if (HK.Sib) { res.text = HK.Sib.fill(res.text, a, o, null, ctx); res.why = HK.Sib.fill(res.why, a, o, null, ctx); }
        return res;
      }
    });
  };
})();
