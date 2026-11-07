/* 認識阻害の部屋の夜（R18版だけのパック。2026-11-07。設計は docs/reports/2026-11-07/ninshiki-design.md の 5）
   ■ 入口（kind）：night 認識阻害の夜／keep 囲い込んだ部屋で／public 人前の死角で（気づいたうえで乗り気の人だけ）／peak 力が切れかける瞬間（山場）／ask 体が覚えて受けのほうから求める
   ■ 可否（ninshiki.js の elig）：本音の計器 want が線（55）を越え、かつ前もって許していた二人（恋人・夫婦・体の相手・両片想い）か、気づいたうえで乗り気になった人だけ。
     体の場面にしてよい組（HK.DarkKit.R18.ok。モブ・触手は HK.Mob.sexOk・モブには受け・恋愛対象の性別）。気づいてその場を離れた人には起こさない（離れたあと自分から戻ってきた人は別）
   ■ 場面の直前に必ずきっかけの段（記録の一件。e.tag＝'きっかけ'、理由の欄は「きっかけ：…」）：なぜ今か（入口ごと）＋受けが止められたのに止めなかった一文（stop の表）
   ■ 回数の上限は HK.DarkKit.R18.quota（なし 0／少なめ 1／ふつう 2／多め 3・一度は長い場面）。上限があるのに一度も出なかったら、最後の夜に理由の文を一つ（ns_none_why）
   ■ 合意のない展開（force）の印は付けない（電車の部屋と同じ。前もって許していたか、気づいたうえで選んだ人の場面のため）。温度は HK.Heat.use(ID, { forceGate: true })
   文は ninshiki-r18-text-*.js（HK.DarkKit.R18.addRoom）。体の語は印。登場人物はすべて成人として扱う */
/* @event scen=set-c-ninshiki id=ns_r18_night cat=bond tie=- tags=night label=認識阻害の空間で迎える夜 */
/* @event scen=set-c-ninshiki id=ns_r18_keep cat=bond tie=- tags=night label=囲い込んだ部屋で重なる夜 */
/* @event scen=set-c-ninshiki id=ns_r18_public cat=bond tie=- tags=night,mob label=人前の死角で気づいたまま触れ合う */
/* @event scen=set-c-ninshiki id=ns_r18_peak cat=bond tie=- tags=night label=力が切れかける瞬間に果てる */
/* @event scen=set-c-ninshiki id=ns_r18_ask cat=bond tie=- tags=night label=体が覚えて受けのほうから求める夜 */
/* @event scen=set-c-ninshiki id=ns_none_why cat=bond tie=- label=夜にならなかった理由が語られる */
(function () {
  'use strict';
  var HK = window.HK;
  if (!HK || HK.SAFE_ON || !HK.Ninshiki || !HK.DarkKit || !HK.DarkKit.R18) return;
  var N = HK.Ninshiki, DK = HK.DarkKit, R = DK.R18, ID = N.ID;
  if (HK.Heat && HK.Heat.use) HK.Heat.use(ID, { forceGate: true });
  if (HK.Play && HK.Play.strict) HK.Play.strict(ID, true);
  var KIND_W = { night: '認識阻害の夜', keep: '囲い込んだ部屋', public: '人前の死角', peak: '力が切れかける瞬間', ask: '受けのほうから求めた夜' };
  var SPOT = { night: 'bed', keep: 'bed', ask: 'bed', public: 'stand', peak: 'stand' };
  function shOf(S) {
    if (S.ak !== 'tent') return R.shape(S.A, S.B);
    var P = HK.Pos;
    return P && P.hasM && P.hasM(S.B) ? 'fm' : 'ff';
  }
  function okPair(ctx, S) {
    if (S.noBody) return false;
    if (S.ak === 'res') return R.ok(ctx, S, S.A, S.B);
    var B = S.B;
    if (B.noR18) return false;
    if (HK.Mob && HK.Mob.sexOk && !HK.Mob.sexOk(B)) return false;
    if (HK.Pos && HK.Pos.hardTopNpc && HK.Pos.hardTopNpc(B)) return false;
    if (S.ak === 'mob' && !N.mobGOk(B, S.A.gender)) return false;
    return true;
  }
  /* 起こるか：残りの回数を残りの機会（夜と山場）に配る。最後の夜は、まだ一度も無ければ必ず */
  function chance(ctx, kind) {
    var S = N.f(ctx); if (!S.r18) R.quota(ctx, S, ctx.env);
    var left = R.left(S); if (!left || !okPair(ctx, S)) return false;
    if (kind === 'last') return S.r18.n === 0 || ctx.rng() < 0.6;
    var remain = Math.max(1, S.days - S.d) + (S.peakDone ? 0 : 1);
    var p = Math.min(1, left / remain * 1.3);
    if (kind === 'peak') p = Math.min(1, p * 1.6 + 0.2);
    if (kind === 'public') p *= 0.6;
    return ctx.rng() < p;
  }
  function q0(S, kind, form) { return { a: S.A, b: S.B, sh: shOf(S), kind: kind, force: false, nN: 0, g: 'habit', heatKey: '', form: form || '' }; }
  function run(ctx, kind) {
    var S = N.f(ctx), A = S.A, B = S.B, env = ctx.env || {};
    if (kind === 'last') kind = 'night';
    if (!R.left(S) || !N.elig(ctx) || !okPair(ctx, S)) return null;
    var lastN = S.last && S.r18.n === 0;
    var form = R.formOf(ctx, S, env, { last: lastN || S.last });
    var q = q0(S, kind, form);
    var lt = R.part(ctx, S, 'lead', q), sp = R.part(ctx, S, 'stop', q);
    if (!lt || !sp) return null;
    var acts = S.ak === 'res' ? [A, B] : [B];
    var why0 = KIND_W[kind] + '・' + (S.pre && !S.aware ? '前もって許していた' : '気づいたうえで乗り気');
    var le = ctx.say({ kind: 'event', cat: 'bond', actors: acts, text: N.fill(ctx, lt.replace(/\s+$/, '') + sp), why: 'きっかけ：' + why0, mag: 0 });
    if (!le || le.skipped || !le.text) return null;
    le.tag = 'きっかけ'; le.ev = 'ns_lead_' + kind;
    var r = R.scene(ctx, S, A, B, { kind: kind, form: form, spot: SPOT[kind], sh: q.sh, g: 'habit', first: S.r18.n === 0, couple: S.grp === 'love' });
    if (!r || !r.text) { R.drop(ctx, le); return null; }
    var e = DK.say(ctx, { id: 'ns_r18_' + kind, actors: acts, cat: 'bond', text: r.text, why: '認識阻害の部屋：夜（' + why0 + '・' + ({ short: '短い', mid: '中くらい', long: '長い', fade: 'ほのめかす' })[r.form] + '）', sex: true, lewd: r.form !== 'fade', mag: 10 });
    if (!e || e.skipped) { R.drop(ctx, le); return null; }
    S.r18.n++; if (r.form === 'long') S.r18.longN++;
    DK.push(S, 'habit', 14); DK.push(S, 'want', 3); DK.push(S, 'wear', 10);
    if (S.ak === 'res') ctx.mod2(A, B, { att: 4, aff: 1 }, { att: 4, aff: 1 });
    if (kind === 'ask') S.asked = true;
    return e;
  }
  /* 上限があるのに一度も出なかった：理由の文を一つ */
  function missed(ctx) { var S = N.f(ctx); return !!(S.r18 && S.r18.n === 0 && (ctx.env || {}).lewdN !== 'none'); }
  function why(ctx) {
    var S = N.f(ctx), T = HK.NinshikiText || {}, k;
    if (S.noBody) k = 'nobody';
    else if (S.out) k = 'out';
    else if (N.elig(ctx)) k = 'chance';
    else if (!S.aware && !S.pre) k = 'unaware';
    else k = 'want';
    var t = N.pick(ctx, (T.WHY || {})[k]);
    if (t) N.say(ctx, 'ns_none_why', t, '夜にならなかった理由（' + { nobody: '体の場面を出せない組', out: '気づいて離れた', chance: '機会が合わなかった', unaware: '気づかないまま・許していない', want: '本音が線の手前' }[k] + '）');
  }
  N.setR18({ chance: chance, run: run, missed: missed, why: why, okPair: okPair });
  /* 部屋の文の絞り込み：触手の場面は「触手」の文だけ、ほかは「触手」を書かない文だけ */
  R.addRoom(ID, { ok: function (ctx, t) { var S = ctx && ctx.ns; var tent = !!(S && S.ak === 'tent'); return tent === /触手/.test(t); } });
})();
