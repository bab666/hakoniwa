/* 看病の部屋のキス（追加パック set-b。両方のビルド。kanbyo.js のあとに読む。kanbyo.js は書き換えず、HK.wrap で区切りの関数 phase を包む。2026-11-04）
   本体の共通部品 HK.Kiss（キスの描写の型：きっかけ・長さ・深さ・終わり方。文は本体の kiss-text*.js）で、治ったあとの二人のキスを足す。夜（エッチ）には数えない。
   ・病気の間（うつった人が寝込んでいる日も）は出さない（うつるので。熱のある人は休む）
   ・治った日・治ったあとの朝：寝起きのキス（同居の二人か、前の晩を一緒に過ごした二人。恋人どうしは治った日の夜から一緒に過ごす＝kanbyo.js の nightTogether）
   ・治った日・治ったあとの夜：おやすみのキス。その夜にエッチの場面があった夜と、最後の夜（結末の段で終える）は出さない
   ・恋愛にしてよい二人で、恋人どうし（夫婦・恋人）か、この看病で恋人になった二人だけ（告白の前の二人には出さない）
   台詞は 3 本「くだけた常体｜硬い常体｜敬語」（HK.Kiss の文の表）。登場人物はすべて成人として扱う */
/* @event scen=set-b-kanbyo id=kb_kiss_neoki cat=romance tie=- label=治った朝に交わす寝起きのキス */
/* @event scen=set-b-kanbyo id=kb_kiss_oyasumi cat=romance tie=- label=治ったあとの夜のおやすみのキス */
(function () {
  'use strict';
  var HK = window.HK;
  var ID = 'set-b-kanbyo';
  if (!HK || !HK.Kiss || !HK.SCENARIOS || !HK.SCENARIOS[ID] || !HK.wrap || !HK.Kanbyo) return;
  var KS = HK.Kiss, KB = HK.Kanbyo, scen = HK.SCENARIOS[ID];
  function ok2(ctx, a, b) { return !!(a && b && a !== b && HK.canLove(a, b, ctx) && HK.canLove(b, a, ctx) && (!ctx.romanceOk || ctx.romanceOk([a, b], false))); }
  function stat(ctx) { return ctx.flags.kanbyoKiss = ctx.flags.kanbyoKiss || { neoki: 0, oyasumi: 0 }; }
  function kiss(ctx, a, b, opt, k) {
    var S = ctx.kb;
    if (S.used['kiss:' + k + ':' + opt.d]) return null;
    var r = KS.scene(ctx, a, b, Object.assign({ whyPre: '看病の部屋：', fx: function () { ctx.mod2(a, b, { aff: 2, att: 2 }, { aff: 2, att: 2 }); } }, opt));
    if (!r) return null;
    S.used['kiss:' + k + ':' + opt.d] = 1;
    stat(ctx)[k]++;
    return r;
  }
  HK.wrap(scen, 'phase', function (orig) {
    return function (ctx, s, n) {
      var S = ctx.kb, sex0 = S ? S.sex : 0;
      var r = orig.apply(this, arguments);
      S = ctx.kb;
      if (!S || S.A === S.B) return r;
      var d = Math.floor(s / 3), t = s % 3, st = KB.stageOf(S, d), ks = KB.kStage(S, d);
      /* 病気の間・うつった人が寝込んでいる日は出さない。治った日と治ったあとだけ */
      if (KB.sickNight(S, d) || ks === 'ksick' || (st !== 'heal' && st !== 'after')) return r;
      /* 恋人どうし（夫婦・恋人）か、この看病で恋人になった二人だけ */
      if (!S.love || !(S.couple || S.confessed) || !ok2(ctx, S.A, S.B)) return r;
      var A = S.A, B = S.B;
      if (t === 0) {
        if ((S.live !== 'together' && d <= S.heal) || ctx.rng() > 0.3) return r;
        kiss(ctx, A, B, { trig: 'neoki', d: d, tag: '寝起きのキス' }, 'neoki');
      } else if (t === 2) {
        /* その夜にエッチの場面があった夜は出さない */
        /* 最後の夜は結末の段で終えるので出さない */
        if (S.sex > sex0 || d >= S.days - 1 || ctx.rng() > 0.35) return r;
        kiss(ctx, A, B, { trig: 'oyasumi', d: d, tag: 'おやすみのキス' }, 'oyasumi');
      }
      return r;
    };
  });
})();
