/* ヤンデレ監禁の部屋（set-c-kankin）の夜の場面（R18版だけ。2026-11-07。設計は docs/reports/2026-11-07/kankin-design.md の 4）
   ■ HK.KankinR18
     ・setup(ctx, S)：エッチの回数の上限（HK.DarkKit.R18.quota。なし 0／少なめ 1／ふつう 2／多め 3）と、夜の配り方（2 日目から最後の前の夜までに散らす）
     ・night(ctx, S, kind)：その夜に場面を出したら真。kind＝'oshioki'（逃げて見つかった夜）か ''（予定の夜）。
       土台は合意：閉じ込められる側の本音 want が線（HK.Kankin.WANT_LINE）を越えている二人だけ。越えていない・体の場面にしない二人（S.noBody）は出さず、
       予定の夜は次の夜へ送る（最後まで出なければ kankin.js が理由の一文を出す）。
     ・入口：oshioki 逃げた夜のお仕置き（温度「歪んだ」・長い場面・合意のない形。この部屋でいちばん激しい）／kusuri 薬の杯の夜（その日に杯を飲んだとき）／
       uso 嘘の甘え（嘘で取り入る受けで、まだばれていないとき）／oboreru 溺れる（正気が薄れたか、溺れる段）／yoru ふつうの夜（堕ちの段 0 で拒む・逃げる受けは合意のない形）
     ・場面は HK.DarkKit.R18.run（きっかけの段 → 場面 → 記録）。文は kankin-r18-text-a.js・-b.js（HK.KankinR18Text）だけで組む
   登場人物はすべて成人として扱う */
/* @event scen=set-c-kankin id=kk_r_yoru cat=bond tie=- tags=night,force label=閉ざされた寝室で体を重ねる夜 */
/* @event scen=set-c-kankin id=kk_r_kusuri cat=bond tie=- tags=night label=薬の杯の熱に浮かされる夜 */
/* @event scen=set-c-kankin id=kk_r_uso cat=bond tie=- tags=night label=嘘の甘えのつもりで身を任せる夜 */
/* @event scen=set-c-kankin id=kk_r_oboreru cat=bond tie=- tags=night label=自分から求めて溺れていく夜 */
/* @event scen=set-c-kankin id=kk_r_oshioki cat=bond tie=- tags=night,force label=逃げた夜の拘束と寸止めのお仕置き */
(function () {
  'use strict';
  var HK = window.HK;
  if (!HK || !HK.DarkKit || !HK.DarkKit.R18 || !HK.Kankin) return;
  var DK = HK.DarkKit, R = DK.R18, KK = HK.Kankin, ID = KK.ID, X = HK.KankinR18Text || {};
  R.addRoom(ID, { lead: X.lead, stop: X.stop, open: X.open, fore: X.fore, insert: X.insert, mid: X.mid, peak: X.peak, peakE: X.peakE, end: X.end, after: X.after, again: X.again,
    top: X.top, resist: X.resist, fade: X.fade, change: X.change, spot: 'bed' });
  if (HK.Heat && HK.Heat.use) HK.Heat.use(ID, { forceGate: true });
  if (HK.Play && HK.Play.strict) HK.Play.strict(ID, true);
  var KIND_NAME = { yoru: '閉ざされた寝室の夜', kusuri: '薬の杯の熱', uso: '嘘の甘え', oboreru: '自分から求める夜', oshioki: '逃げた夜のお仕置き' };
  var KR = HK.KankinR18 = {};
  KR.setup = function (ctx, S) {
    var max = R.quota(ctx, S, ctx.env), n = S.days - 2, plan = [];
    for (var i = 0; i < max; i++) plan.push(Math.min(S.days - 2, 1 + Math.floor((i + 0.3 + ctx.rng() * 0.5) * n / Math.max(1, max))));
    S.plan = plan;
  };
  function eligible(ctx, S) { return S.d >= 1 && DK.val(S, 'want') >= KK.WANT_LINE && R.left(S) > 0 && R.ok(ctx, S, S.A, S.B); }
  KR.night = function (ctx, S, kind) {
    if (HK.SAFE_ON || !S.r18) return false;
    var due = S.plan && S.plan[S.r18.n] != null && S.plan[S.r18.n] <= S.d;
    if (kind !== 'oshioki' && !due) return false;
    if (!eligible(ctx, S)) return false;
    var A = S.A, B = S.B, fs = DK.stage(S, 'fall'), b = S.bbr.k;
    var k = kind || (S.cupToday && S.drug ? 'kusuri' : b === 'lie' && !S.lieFound ? 'uso' : DK.stage(S, 'sane') >= 2 || fs >= 3 ? 'oboreru' : 'yoru');
    S.cupToday = false;
    var force = k === 'oshioki' || (k === 'yoru' && fs === 0 && /^(refuse|escape)$/.test(b));
    var left = S.days - 2 - S.d, last = R.left(S) <= 1 || left <= 1;
    var o = { id: 'kk_r_' + k, kind: k, force: force, heat: k === 'oshioki' ? 'warped' : '', x: k === 'uso' || k === 'oboreru' ? B : A, last: last, spot: 'bed', when: 'n',
      why: 'ヤンデレ監禁の部屋：夜（' + KIND_NAME[k] + '）', leadWhy: KIND_NAME[k] + '・' + (k === 'uso' || k === 'oboreru' ? B.name : A.name) + 'から',
      after: function () { KK.afterSex(ctx, S, k); } };
    if (k === 'oshioki' && ctx.env.lewdLen !== 'short') o.form = 'long';
    var e = R.run(ctx, S, A, B, o);
    return !!e;
  };
})();
