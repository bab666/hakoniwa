/* 箱庭シミュレーター: ゾンビの街 ― 恋人たちの夜（「描写する」）の山場を段落に分けて厚くする（R18版のみ。組み立ては omega-thick.js の HK.TKC）
   襲われる場面（ゾンビ・怪物・略奪者）は元のまま。ここで厚くするのは、合意のうえの恋人たちの夜だけ
   3割は元の短い版（solo-zombie-love.js の HIGH・HIGH_FF・HIGH_RIDE）。厚い版にも、短い版の脱がせ方・声を殺す一段を混ぜる */
(function () {
  'use strict';
  var HK = window.HK, Z = HK.ZB, TK = HK.TKC;
  if (!Z || !Z.LOVE || !Z.LOVE.nightHigh || !TK) return;
  function L(s) { return s.split('|'); }
  var LEAD = L('外では、ゾンビの呻き声が途切れ途切れに続いていた。バリケード代わりの棚の向こうで、二人は息を殺して抱き合った。|非常灯の赤い光だけが、狭い部屋をぼんやり照らしていた。{T}は{U}の体に咬み跡がないか、一つずつ唇で確かめていった。|窓に打ちつけた板の隙間から、月明かりが細く差し込んでいた。{T}は見張りの交代を告げに来た{U}の手を、離さなかった。|');
  var FIN = L('物音がするたびに、二人は繋がったまま動きを止めた。それでも、離れようとはしなかった。|果てたあとも、二人は外の物音に耳を澄ませたまま抱き合っていた。生きている。その体温だけが、確かだった。|遠くで銃声がひとつ鳴った。二人は顔を見合わせ、それから、もう一度だけ口づけを交わした。');
  var n0 = Z.LOVE.nightHigh;
  /* {x}{y}（solo-zombie-love.js の短い版）を {T}{U} に */
  function xy(t) { return t.replace(/\{x\}/g, '{T}').replace(/\{y\}/g, '{U}'); }
  Z.LOVE.nightHigh = function (ctx, a, b) {
    if (HK.SAFE_ON || !HK.Pos || !HK.Voice) return n0.apply(this, arguments);
    var o = HK.Pos.order(a, b, [a, b]), T = o[0], U = o[1];
    if (!TK.ok(T, U)) return n0.apply(this, arguments);
    var pk = function (arr) { return ctx.pick(arr); }, LH = Z.LOVE_HIGH;
    /* R18の描写の設定（lewd-unify.js）：数行で短く＝元の短い版、男性向け＝thick-sex-ero.js、濃い＝もう一度 */
    var X = HK.Lewd, cf = X && X.conf('zombie'), TE = HK.ThickEro;
    var ero = cf && X.ero(ctx.env) && TE, high = cf && X.high(ctx.env) && TE, short = cf ? X.short(ctx.env, ctx.rng) : null;
    var nm = function (s) { return s.replace(/\{a\}/g, T.name).replace(/\{b\}/g, U.name); };
    if (ero) {
      var r = short ? TE.short({ S: ctx, pick: pk, a: T, b: U, open: pk(LEAD).replace(/\{T\}/g, '{a}').replace(/\{U\}/g, '{b}'), again: high })
        : TE.scene({ S: ctx, pick: pk, rng: ctx.rng, a: T, b: U, style: HK.ThickSex ? HK.ThickSex.style(T) : 'gentle', open: pk(LEAD).replace(/\{T\}/g, '{a}').replace(/\{U\}/g, '{b}'), place: 'zombie', again: high });
      var et = nm(r.text);
      if (HK.Pos.ff(T, U) && HK.FF && HK.FF.fix) et = HK.FF.fix(ctx, et, T, U);
      return short ? et : '\n\n' + et + '\n\n';
    }
    if (short) return n0.apply(this, arguments) + (high ? nm(TE.again(ctx, pk, T, U, false, true)) : '');
    /* 設定をそろえる前の入力：3割ほどは、元の短い版（書き出し・挿入・最中・結びを一文ずつ。女性どうし・女性が攻めの組にも専用の文） */
    if (short === null && LH && ctx.rng() < 0.3) return n0.apply(this, arguments);
    var kd = TK.kind(T, U, 'zombie'), set = LH ? (kd === 'ff' ? LH.ff : kd === 'ride' ? LH.ride : LH.mf) : null;
    var ok = LH && kd === 'ff' ? LH.ffOk(T, U) : function () { return true; };
    var mids = set ? set.mid.filter(ok) : [];
    /* 書き出し：外の気配（LEAD）に、短い版の脱がせ方（fore）を半分ほど続ける。最中のあとに、短い版の「声を殺す」一段 */
    var lead = pk(LEAD) + (LH && ctx.rng() < 0.5 ? xy(pk(LH.mf.fore)) : '');
    var extra = mids.length && ctx.rng() < 0.7 ? [xy(pk(mids))] : [];
    /* 女性どうしの結びには「繋がったまま」の文を使わない */
    var finish = pk(kd === 'ff' ? FIN.filter(function (l) { return !/繋が/.test(l); }) : FIN);
    var t = TK.body(T, U, { flav: 'zombie', pick: pk, rng: ctx.rng, bed: '毛布', depth: ctx.rng() < 0.4 ? 3 : 2, lead: lead, extra: extra, finish: finish, noAfter: true });
    return '\n\n' + TK.names(t, T, U) + '\n\n' + (high ? nm(TE.again(ctx, pk, T, U, false, false)) + '\n\n' : '');
  };
})();
