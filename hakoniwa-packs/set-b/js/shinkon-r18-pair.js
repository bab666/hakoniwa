/* r18:begin */
/* @event scen=set-b-shinkon id=sk_form_pair cat=romance tie=- tags=night label=新婚の型の夜（入り方7・最中7・終わり方5） */
/* 新婚部屋：二人のエッチの「新婚の型」（R18版だけ。2026-11-04 不具合リスト 1104 の NO 11「2 人のエロの場面のパターンが少ない。有料版はエロが売り」）
   ■ HK.ShinkonPair.scene(ctx, S, env, a, b, sh, form, o)：短い・中くらいの夜の場面を、新婚部屋ならではの型で組む（{ text, form, why } か null）
     ・入り方 7 種（台所で後ろから・ソファで映画のあと・風呂上がりに髪を乾かして・新しいベッド・結婚指輪を外す手・玄関で・寝ずに待っていた）
     ・最中の一幕 7 種（名前を呼ぶ・指輪が当たる・壁の薄い新居・姿見・好きを言わせる・明日の朝の話・カーテンの隙間の月）＋受けの反応（態度 9 種）
     ・山場は共通の部品と同じ（受けの態度 9 種の喘ぎ・男性向けの山場の文 PEAK_E・新婚部屋の山場の文）
     ・終わり方 5 種（腕枕・シャワーを浴び直す・水を取りに行く・シーツを替える・明日の朝の約束）＋受けの一言（態度 9 種）
     選び方：その夜のきっかけ（雨なら風呂上がり、遅い帰りなら玄関・待っていた）、家の顔ぶれ（三人以上で暮らす家は壁の薄い新居）、結婚しているか（指輪）、
     攻めの夜の性格（サド・意地悪は姿見）・受けの態度（恥じらい・丁寧は名前、意地っ張り・強気・冷静は好きを言わせる）、家事をする人か（台所）。
     一回の遊びで同じ種は続けて使わず、同じ文は二度出さない（ctx._skpUsed）
   ■ shinkon-r18.js の HK.ShinkonR18.night が、短い・中くらいの場面の 55% で呼ぶ（邪魔が入った続き・新婚らしい入口・性器の指定のある組・受けから始まる夜・攻めが妬いた夜は今までの組み立て）
   文は shinkon-r18-pair-text.js（HK.ShinkonPairText）。体の語は印。登場人物はすべて成人として扱う */
(function () {
  'use strict';
  var HK = window.HK;
  if (!HK || !HK.PairR18) return;
  var PR = HK.PairR18, PP = HK.ShinkonPair = {};
  function PT() { return HK.ShinkonPairText || {}; }
  function per(c) { return HK.ShinkonReact ? HK.ShinkonReact.per(c) : 'gentle'; }
  function okT(ctx, t, a, b) { return !HK.Shinkon || HK.Shinkon.okText(ctx, t, a, b); }
  /* 使っていない文から（一回の遊びで同じ文を二度出さない） */
  function fresh(ctx, arr, a, b) {
    var L0 = (arr || []).filter(function (t) { return okT(ctx, t, a, b); });
    if (!L0.length) return '';
    var U = ctx._skpUsed = ctx._skpUsed || {}, q = L0.filter(function (t) { return !U[t]; }), t = (q.length ? q : L0)[Math.floor(ctx.rng() * (q.length ? q : L0).length)];
    U[t] = 1;
    return t;
  }
  function wpick(ctx, W, used) {
    var ks = Object.keys(W).filter(function (k) { return W[k] > 0; });
    if (!ks.length) return null;
    return HK.weighted(ctx.rng, ks, function (k) { return W[k] * (used && used[k] ? 0.25 : 1); });
  }
  /* その組で使えるか：性器の指定で形と体が食い違う組（男性器の無い攻めの mf・受けの fm）は今までの組み立てに任せる */
  PP.can = function (a, b, sh) {
    var P = HK.Pos;
    if (!PT().OPEN || !P || !P.hasM) return true;
    if (sh === 'mf' && !P.hasM(a)) return false;
    if (sh === 'fm' && !P.hasM(b)) return false;
    return true;
  };
  PP.scene = function (ctx, S, env, a, b, sh, form, o) {
    var X = PT();
    if (!X.OPEN || (form !== 'short' && form !== 'mid') || !PP.can(a, b, sh)) return null;
    var day = S.day || {}, cute = o.cute || '', LF = HK.Life, pa = per(a), pb = per(b);
    var nk = HK.Attr && HK.Attr.nightKind ? HK.Attr.nightKind(a, b) : '';
    var U = S.pairK = S.pairK || { o: {}, m: {}, e: {} };
    /* 入り方 */
    var WO = { daidokoro: LF && LF.canChore && !LF.canChore(b) ? 0 : 1, sofa: 1, furo: cute === 'rain' ? 3 : 0.8, bed: day.d <= 2 ? 1.8 : 0.8,
      yubiwa: S.wed ? (/devoted|gentle/.test(pa) ? 1.4 : 0.9) : 0, genkan: cute === 'late' || cute === 'trip' ? 3 : day.hol ? 1.2 : 0.6, matte: (cute === 'late' ? 2.5 : 0.7) * (/devoted|shy/.test(pb) ? 1.5 : 1) };
    if (cute === 'dark') { WO.sofa = 0; WO.furo = 0.3; }
    var ok = wpick(ctx, WO, U.o); if (!ok) return null;
    /* 最中の一幕 */
    var WM = { namae: /shy|polite/.test(pb) ? 1.6 : 1, yubi: S.wed ? 1 : 0, kabe: S.H && S.H.length >= 3 ? 2.5 : 0.8, kagami: (/sadist|mean/.test(nk) ? 2.2 : 0.7) * (/proud|free/.test(pa) ? 1.4 : 1),
      suki: /tsun|proud|cool/.test(pb) ? 1.7 : 0.9, ashita: /free|gentle/.test(pa) ? 1.4 : 0.9, tsuki: cute === 'dark' ? 0.4 : 1 };
    var mk = wpick(ctx, WM, U.m); if (!mk) return null;
    /* 終わり方 */
    var WE = { ude: /gentle|devoted|shy/.test(pb) ? 1.4 : 1, shower: /free/.test(pb) || cute === 'rain' ? 1.5 : 0.9, mizu: /devoted|gentle/.test(pa) ? 1.5 : 0.9, sheet: o.high ? 1.6 : 0.8, asa: day.d < S.days - 1 ? 1 : 0.3 };
    var ek = wpick(ctx, WE, U.e); if (!ek) return null;
    var op = fresh(ctx, (X.OPEN[ok] || {})[sh], a, b), br = fresh(ctx, (X.BRIDGE || {})[sh], a, b), md = fresh(ctx, (X.MID[mk] || {})[sh], a, b), en = fresh(ctx, (X.END[ek] || {})[sh], a, b);
    if (!op || !br || !md || !en) return null;
    U.o[ok] = 1; U.m[mk] = 1; U.e[ek] = 1;
    var mr = form === 'mid' || ctx.rng() < 0.45 ? fresh(ctx, (X.MIDR || {})[pb] || (X.MIDR || {}).gentle, a, b) : '';
    /* 山場（共通の部品と同じ：受けの態度 9 種の喘ぎ。男性向けは本体の男性向けの喘ぎと男性向けの山場の文） */
    var pk = function (arr) { return arr[Math.floor(ctx.rng() * arr.length)]; }, T = HK.ThickSex, ero = !!o.ero, mo;
    if (HK.NovelMoan) HK.NovelMoan.top = a;
    if (ero && HK.ThickEro) mo = HK.ThickEro.fill(ctx, '{mb2}', a, b);
    else mo = T && T.moan ? T.moan(pk, b, true, ctx.rng) : '';
    var MO = HK.ShinkonR18More || {}, P0 = HK.Pos, pkl = ero && MO.PEAK_E ? MO.PEAK_E[sh] : null;
    if (pkl && P0 && P0.hasM && ((sh === 'mf' && !P0.hasM(a)) || (sh === 'fm' && !P0.hasM(b)))) pkl = pkl.filter(function (x) { return !/\{(?:男性器|精液)\}/.test(x); });
    if (pkl && !pkl.length) pkl = null;
    var TP = (HK.ShinkonR18Text || {}).PEAK, tp0 = TP && TP[0] ? (Array.isArray(TP[0]) ? TP[0] : TP[0][sh] || TP[0].all) : null;
    var peak = fresh(ctx, pkl || (Array.isArray(tp0) && tp0.length ? tp0 : PR.FB.peak[sh]), a, b);
    if (!peak) return null;
    peak = peak.replace('{m}', mo ? '{b}「' + String(mo).replace(/^「|」$/g, '') + '」' : '');
    var er = ctx.rng() < 0.6 ? fresh(ctx, (X.ENDR || {})[pb] || (X.ENDR || {}).gentle, a, b) : '';
    var body = op + '\n\n' + br + md + mr + '\n\n' + peak;
    /* 夜の性格の一文・夜の主導の段（共通の部品と同じ差し方） */
    body = PR.insert1(body, PR.nightAdd(ctx, a, b, sh, ero, o.entry, { jealous: !!o.jealTop, leadB: !!o.leadB }));
    if (o.high && HK.ThickEro) body += '\n\n' + HK.ThickEro.again(ctx, pk, a, b, ero && form === 'mid', form === 'short' && sh !== 'ff');
    body += '\n\n' + en + er;
    S.pairN = (S.pairN || 0) + 1;
    return { text: PR.mk(ctx, body, a, b), form: form, why: '新婚の型：' + X.OPEN_NAME[ok] + '／' + X.MID_NAME[mk] + '／' + X.END_NAME[ek] };
  };
})();
/* r18:end */
