/* 配信の部屋（set-b-haishin）の開始前の注意（R18 版・全年齢モードでないとき。本体の HK.SoloWarn。設計 docs/reports/2026-11-06/haishin-design.md の 2.4）
   ・二人とも攻めで、形がカップル配信 → 始められない（block。どの版でも止める判定は haishin.js の scen.check にもある。ここは画面の注意の文）
   ・二人とも攻めで、形がおまかせ → ソロ配信になる（warn）
   ・攻めのソロ（配信する人が攻め）→ 玩具を自分に入れない・画面の外の相手が来たら、相手が焦らして言葉で責めたあと、配信者が相手を抱く（warn）
   両方の版のかたまりに入るので、HK.SoloWarn が無い版（全年齢版）・全年齢モードでは何もしない（全年齢の案内は haishin.js の HK.ScenUI） */
/* @event-ok 開始前の注意（新しい出来事は無い） */
(function () {
  'use strict';
  var HK = window.HK;
  if (!HK || !HK.SoloWarn || !HK.SoloWarn.add || !HK.Haishin || !HK.Haishin.formOf) return;
  var H = HK.Haishin;
  /* r18:begin */
  HK.SoloWarn.add('set-b-haishin', function (input, T) {
    var C = T.C, out = [];
    if (C.length < 2) return out;
    /* どんな関係の二人でも始められる（この部屋ではカップルとして扱う。2026-11-06 の利用者の指示） */
    if (!H.relIn(input, 0, 1)) out.push({ level: 'warn', text: 'どんな関係でも、この部屋ではカップルとして扱います（結末の結婚報告は、恋人か夫婦の二人のときだけ）' });
    var A = C[0], B = C[1], f = T.env.form, tt = T.hard(A, B) && T.hard(B, A);
    if (tt && f === 'couple') return [{ level: 'block', text: '二人とも攻めなので、カップル配信は始められません。ソロ配信にするか、どちらかを受けかリバ、おまかせにしてください' }];
    if (tt && f !== 'solo') out.push({ level: 'warn', text: '二人とも攻めなので、ソロ配信になります' });
    var fo = H.formOf(input, A, B, 0.5);
    /* おまかせでカップルにもソロにもなりうる（どちらも立場を決めていない）ときは、ソロになったときの注意として出す */
    var mayS = fo.form === 'solo' || (f !== 'couple' && !tt && T.pick(0, 'role') !== 'on' && T.pick(1, 'role') !== 'on') ? fo : null;
    if (mayS && fo.form !== 'solo') { var f2 = Object.assign({}, input, { env: Object.assign({}, input.env, { form: 'solo' }) }); mayS = H.formOf(f2, A, B, 0.5); }
    if (mayS && mayS.on && mayS.on[0] && T.hard(mayS.on[0], mayS.off)) {
      var x = mayS.on[0].name, y = mayS.off.name;
      out.push({ level: 'warn', text: (fo.form === 'solo' ? '' : 'ソロ配信になったとき、') + x + 'は攻めなので、ソロ配信で玩具を自分に入れません（男性は男性器で、女性は体を触るだけ）。画面の外の' + y + 'が来たときは、' + y + 'が焦らして言葉で責めたあと、' + x + 'が' + y + 'を抱きます' });
    }
    return out;
  });
  /* r18:end */
})();
