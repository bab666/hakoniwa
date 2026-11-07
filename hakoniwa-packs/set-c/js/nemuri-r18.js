/* 眠りの部屋（set-c-nemuri）の R18 の場面（R18版だけのパック。2026-11-07。設計は docs/reports/2026-11-07/nemuri-design.md）
   ■ HK.NemuriR18.quota(ctx, S, env)：エッチの回数の上限（なし 0／少なめ 1／ふつう 2／多め 3。多めは最初の場面を長い場面にして、一度は必ず長い場面）
   ■ HK.NemuriR18.touch(ctx, S, kind)：眠っている間の愛撫（kind 'sleep' 約束のある二人の眠っている夜・'half' 山場で目を覚ましかける夜・'feign' 寝たふりの夜）。
     回数に数えない短い段。前にきっかけの段（約束の言葉・寝たふりをやめなかった一文）を必ず出す。出したら真
   ■ HK.NemuriR18.scene(ctx, S, kind)：起きている二人の場面（kind 'feign' 寝たふりのまま・'wake' 目を覚まして受け入れた・'invite' 眠る側から誘った・
     'pull' 止めた手を眠る側が引き寄せた・'again' 受け入れたあと）。きっかけの段（e.tag＝'きっかけ'）→ 場面（sex: true）。出したら真
   ■ HK.NemuriR18.why(ctx, S, k)：設定した回数に届かなかったわけ（一回の遊びで一つ）
   どれも、眠る側の本音 want が部屋の線（HK.Nemuri.LINE）を越えた二人・体の関係にしてよい組（S.noBody が偽）・全年齢モードでないときだけ。
   場面は部屋の文（nemuri-r18-text*.js）だけで組む（本体・セット B の長い場面の文は使わない。喘ぎの声だけ本体の HK.Moan）。温度は HK.Heat（forceGate）、流れは HK.SexFlow.fix。
   kit の組み立て HK.DarkKit.R18（kit-dark-r18.js。別の担当）ができたら、NR.KIT を真にすると、そちらの scene に同じ表で組ませる（今は部屋の中の組み立て）。
   登場人物はすべて成人として扱う */
/* @event scen=set-c-nemuri id=nm_lead cat=romance tie=- tags=night label=眠る側が止めなかった夜のきっかけ */
/* @event scen=set-c-nemuri id=nm_touch cat=romance tie=- tags=night,force label=約束どおり眠る相手に触れる夜 */
/* @event scen=set-c-nemuri id=nm_touch_f cat=romance tie=- tags=night,force label=寝たふりの相手に触れる夜 */
/* @event scen=set-c-nemuri id=nm_touch_h cat=romance tie=- tags=night,force label=目を覚ましかけた相手に触れる夜 */
/* @event scen=set-c-nemuri id=nm_sex_feign cat=romance tie=- tags=night,force label=寝たふりのまま最後まで抱かれる夜 */
/* @event scen=set-c-nemuri id=nm_sex_wake cat=romance tie=- tags=night,force label=目を覚ましたまま受け入れる夜 */
/* @event scen=set-c-nemuri id=nm_sex_invite cat=romance tie=- tags=night label=疼きに耐えかねて眠る側から誘う夜 */
/* @event scen=set-c-nemuri id=nm_sex_pull cat=romance tie=- tags=night label=止めた手を眠る側が引き寄せる夜 */
/* @event scen=set-c-nemuri id=nm_sex_again cat=romance tie=- tags=night label=打ち明けたあとも寝たふりで誘う夜 */
/* @event scen=set-c-nemuri id=nm_nosex_why cat=bond tie=- label=夜の場面にならなかったわけが語られる */
(function () {
  'use strict';
  var HK = window.HK;
  if (!HK || !HK.DarkKit || !HK.Nemuri) return;
  var DK = HK.DarkKit, N = HK.Nemuri, ID = N.ID;
  function TX() { return HK.NemuriR18Text || {}; }
  var NR = HK.NemuriR18 = { KIT: false };
  var KIND = { feign: '寝たふりのまま', wake: '目を覚まして受け入れた', invite: '眠る側から誘った', pull: '止めた手を引き寄せた', again: '打ち明けたあとの夜' };
  var FORM = { fade: 'ほのめかす', short: '短い場面', mid: '中くらいの場面', long: '長い場面' };

  /* ---------- 行の絞り込み（体の形・ペニバン・寝たふり） ---------- */
  var FEM_RE = /\{(?:女性器|陰核|愛液)\}/;
  function hasM(c) { return !!(HK.Pos && HK.Pos.hasM && HK.Pos.hasM(c)); }
  function fit(S, r) {
    var t = typeof r === 'string' ? r : r && r.t, B = S.B;
    if (!t) return false;
    var mB = hasM(B);
    if ((r.fb || FEM_RE.test(t)) && mB) return false;
    if (r.mb && !mB) return false;
    if (r.peg && !S.peg) return false;
    if (r.nopeg && S.peg) return false;
    if (r.fe && !(S.flags && S.flags.feignN)) return false;
    return true;
  }
  function pkR(ctx, S, list, o) { return N.pk(ctx, S, (list || []).filter(function (r) { return fit(S, r); }), o); }
  function bySh(tbl, sh) { return (tbl || {})[sh] || (tbl || {}).mf || []; }
  /* 受けの体に合わせた行を先に（男性の体の受けは、ほぐす前戯と後ろへの挿入の行。女性の体の受けは女性器への挿入の行）。無ければ全部から */
  function prefer(S, list, key) { var l = (list || []).filter(function (r) { return r && r[key] && fit(S, r); }); return l.length ? l : list; }

  /* ---------- 喘ぎ（本体の HK.Moan。無いときは控えめな息） ---------- */
  var FB_MID = ['……っ', 'ん、……', 'は……っ', 'あ……'], FB_CL = ['……っ、あ……！', 'んんっ……！', 'あ、……っ！'];
  function moan(ctx, S, kind, hush) {
    var MS = S.ms = S.ms || { rng: ctx.rng }, LV = HK.Lewd, ero = !!(LV && LV.ero && LV.ero(ctx.env));
    var m = '';
    try { m = HK.Moan && HK.Moan.say ? HK.Moan.say(MS, S.B, kind, { novel: !ero, hush: !!hush }, kind === 'climax' ? FB_CL : FB_MID) : ''; } catch (e) { m = ''; }
    if (!m) m = (kind === 'climax' ? FB_CL : FB_MID)[Math.floor(ctx.rng() * (kind === 'climax' ? FB_CL : FB_MID).length)];
    return '{b}「' + String(m).replace(/^「|」$/g, '') + '」';
  }
  function fillMoan(ctx, S, t, hush) {
    return String(t).replace(/\{mm\}/g, function () { return moan(ctx, S, 'mid', hush); }).replace(/\{m\}/g, function () { return moan(ctx, S, 'climax', hush); });
  }

  /* ---------- 回数 ---------- */
  NR.quota = function (ctx, S, env) { var v = env && env.lewdN; return v === 'none' ? 0 : v === 'low' ? 1 : v === 'high' ? 3 : 2; };
  /* 言い出す側：眠る側から誘う夜（invite・pull）は眠る側、ほかは触れる側 */
  function byOf(S, kind) { return kind === 'invite' || kind === 'pull' ? S.B : S.A; }
  function canR18(ctx, S, kind) {
    if (HK.SAFE_ON || !S.lewdOn || S.noBody || !N.wantOk(S)) return false;
    var x = byOf(S, kind), y = x === S.A ? S.B : S.A, AV = HK.Avoid;
    if (x === S.A ? S.avA : S.avB) return false;
    if (AV && AV.okSex && !AV.okSex(ctx, x, y)) return false;
    return true;
  }
  function lead(ctx, S, t, why, kind) {
    if (!t) return null;
    var x = byOf(S, kind), y = x === S.A ? S.B : S.A;
    var e = DK.say(ctx, { id: 'nm_lead', cat: N.rcat(ctx, S, x), actors: [x, y], t: t, a: S.A, b: S.B, S: S, why: 'きっかけ：' + why, tag: 'きっかけ', mag: 0 });
    return e;
  }
  function drop(ctx, e) { if (!e) return; var L = ctx.log, i = L.indexOf(e); if (i >= 0) L.splice(i, 1); }
  function note(S, kind) { (S.r18log = S.r18log || []).push({ d: S.d, kind: kind, want: DK.val(S, 'want'), lead: true }); }

  /* ---------- 眠っている間の愛撫 ---------- */
  NR.touch = function (ctx, S, kind) {
    if (!canR18(ctx, S, kind)) return false;
    if ((kind === 'sleep' || kind === 'half') && !S.pact) return false;
    var T = TX(), L = (T.TLEAD || {})[kind] || [];
    var body = kind === 'feign' ? pkR(ctx, S, T.TOUCH_F, { g: 'dev' }) : kind === 'half' ? pkR(ctx, S, T.TOUCH_H) : pkR(ctx, S, T.TOUCH, { g: 'dev' });
    if (!body) return false;
    var le = lead(ctx, S, pkR(ctx, S, L), { sleep: '前もっての約束（眠っている間なら）', feign: '寝たふりをやめなかった', half: '前もっての約束（山場の夜）' }[kind], kind);
    if (!le) return false;
    var e = DK.say(ctx, { id: { sleep: 'nm_touch', feign: 'nm_touch_f', half: 'nm_touch_h' }[kind], cat: N.rcat(ctx, S), actors: [S.A, S.B], t: body, a: S.A, b: S.B, S: S, lewd: true,
      why: '眠りの部屋：' + { sleep: '約束どおり、眠る相手に触れた夜', feign: '寝たふりの相手に触れた夜（' + S.B.name + 'は起きていた）', half: '目を覚ましかけた相手に触れた夜' }[kind],
      fx: function () { ctx.mod2(S.A, S.B, { att: 2 }, { att: 2 }); } });
    if (!e) { drop(ctx, le); return false; }
    DK.push(S, 'dev', { sleep: 16, feign: 12, half: 8 }[kind]);
    DK.push(S, 'uzuki', { sleep: 14, feign: 10, half: 6 }[kind]);
    DK.push(S, 'want', 3);
    S.touchN++;
    note(S, 'touch_' + kind);
    return true;
  };

  /* ---------- 起きている二人の場面 ---------- */
  function formOf(ctx, S) {
    var env = ctx.env, LV = HK.Lewd, lv = LV && LV.lv ? LV.lv(env) : 'mid';
    if (lv === 'low') return 'fade';
    if (env.lewdLen === 'short') return 'short';
    if (env.lewdLen === 'thick') return 'long';
    if (S.quota >= 3 && !S.longN) return 'long';
    return ctx.rng() < 0.5 ? 'short' : 'mid';
  }
  function build(ctx, S, kind, form, sh) {
    var T = TX(), A = S.A, per = DK.per(A), hush = kind === 'feign' || kind === 'again' || kind === 'pull';
    if (form === 'fade') return pkR(ctx, S, T.FADE);
    var ero = !!(HK.Lewd && HK.Lewd.ero && HK.Lewd.ero(ctx.env));
    var P = [];
    var add = function (t) { if (t) P.push(t); };
    add(pkR(ctx, S, (T.OPEN || {})[kind]));
    var mB = hasM(S.B);
    add(pkR(ctx, S, sh === 'mf' && mB ? prefer(S, bySh(T.FORE, sh), 'mb') : bySh(T.FORE, sh)));
    if (form !== 'short') add(pkR(ctx, S, (T.TOPV || {})[per] || (T.TOPV || {}).gentle));
    add(pkR(ctx, S, sh === 'mf' ? prefer(S, bySh(T.INSERT, sh), mB ? 'mb' : 'fb') : bySh(T.INSERT, sh)));
    /* 短い場面も、山場の前に最中の一段を挟む（受けの高まりが山場に届かないまま果てる流れにしない。流れの管理が本体の追い上げの段を足さないように） */
    if (form === 'short') { add(pkR(ctx, S, bySh(T.SHORT, sh))); add(pkR(ctx, S, bySh(T.MID, sh))); }
    else {
      var nMid = form === 'long' ? 5 : 3;
      for (var i = 0; i < nMid; i++) {
        if (i === 2 && (S.grp === 'awk' || kind === 'wake') && ctx.rng() < 0.7) { add(pkR(ctx, S, T.RESIST)); continue; }
        add(pkR(ctx, S, bySh(T.MID, sh)));
      }
    }
    add(pkR(ctx, S, bySh(ero ? T.PEAK_E : T.PEAK, sh)) || pkR(ctx, S, bySh(T.PEAK, sh)));
    /* 終わりと事後は一つの段に（流れの管理が事後の段を一つにまとめるため） */
    var en = pkR(ctx, S, bySh(T.END, sh)), af = pkR(ctx, S, (T.AFTER || {})[kind]) || pkR(ctx, S, (T.AFTER || {})._);
    add(en && af ? en + af : en || af);
    return fillMoan(ctx, S, P.join('\n\n'), hush);
  }
  NR.scene = function (ctx, S, kind) {
    if (!canR18(ctx, S, kind) || S.sexN >= S.quota) return false;
    var T = TX(), A = S.A, B = S.B, sh = N.shOf(A, B);
    var by = byOf(S, kind), le = lead(ctx, S, pkR(ctx, S, (T.LEAD || {})[kind]), KIND[kind] + '・' + by.name + 'から', kind);
    if (!le) return false;
    var form = formOf(ctx, S);
    /* 女性の攻め × 男性の受けは、中くらい・長い場面で 25% だけペニバン（女性どうしは 30%） */
    S.peg = (sh === 'fm' || sh === 'ff') && form !== 'short' && form !== 'fade' && ctx.rng() < (sh === 'fm' ? 0.25 : 0.3);
    var H = HK.Heat && HK.Heat.enabled && HK.Heat.enabled(ID) ? HK.Heat : null, h = null, text;
    try {
      h = H ? H.of(ctx, A, B, { first: S.sexN === 0 && !S.couple, scen: ID }) : null;
      text = h ? H.scope(ctx, A, B, h, function () { return build(ctx, S, kind, form, sh); }) : build(ctx, S, kind, form, sh);
      if (h && text) text = H.strip(text, h.key);
      if (text && form !== 'fade' && HK.SexFlow && HK.SexFlow.fix) { var fx = HK.SexFlow.fix(text, { a: A, b: B, mode: sh }); if (fx && fx.text) text = fx.text; }
    } finally { S.peg = false; }
    if (!text) { drop(ctx, le); return false; }
    var fc = {}; fc[B.i] = 'shy';
    var e = DK.say(ctx, { id: 'nm_sex_' + kind, cat: N.rcat(ctx, S, by), actors: by === A ? [A, B] : [B, A], t: text, a: A, b: B, S: S, sex: true, lewd: form !== 'fade', face: fc,
      why: '眠りの部屋：夜（' + FORM[form] + '・' + KIND[kind] + '）', fx: function () { ctx.mod2(A, B, { aff: 4, att: 6, trust: 2 }, { aff: 4, att: 6, trust: 2 }); } });
    if (!e) { drop(ctx, le); return false; }
    if (h) { H.move(ctx, h, A, B); H.note(ctx, h, A, B, { text: e.text }); H.remember(ctx, A, B, h.key); }
    S.sexN++;
    if (form === 'long') S.longN++;
    DK.push(S, 'dev', 20); DK.push(S, 'uzuki', 10); DK.push(S, 'want', 4);
    note(S, 'sex_' + kind);
    return true;
  };

  /* ---------- 回数が出なかったわけ ---------- */
  NR.why = function (ctx, S, k) {
    if (S.flags.whyDone) return false;
    var t = N.pk(ctx, S, (TX().WHY || {})[k]);
    if (!t) return false;
    S.flags.whyDone = true;
    return !!N.say(ctx, S, 'nm_nosex_why', t, { why: '夜の場面にならなかったわけ（' + { nobody: '体の関係にならない二人', broken: '知られて離れた', unknown: '何も知らないまま', want: '気持ちが届かなかった', chance: '機会が巡らなかった', used: '回数を使い切った' }[k] + '）' });
  };

  if (HK.Heat && HK.Heat.use) HK.Heat.use(ID, { forceGate: true });
  if (HK.Play && HK.Play.strict) HK.Play.strict(ID, true);
})();
