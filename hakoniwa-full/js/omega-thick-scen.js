/* 箱庭シミュレーター: オメガバース（R18版のみ）の山場を段落に分けて厚くする ― 恋人と番の夜・勢いの夜・愛憎の夜・隠れた夜
   2026-10-27（分割読み込みの第3段）：omega-thick.js から、オメガバースの箱庭だけが使う部分を分けた（箱庭のかたまり scen-omega。omega-thick.js のすぐ後に読む）。
   書き分け・受け攻め・描写の濃さの決まりは omega-thick-kit.js の冒頭のとおり。部品は omega-thick.js の HK.OMEGA._thk。登場人物はすべて成人として扱う */
(function () {
  'use strict';
  var HK = window.HK, OM = HK && HK.OMEGA, K = OM && OM._thk;
  if (!K) return;
  function L(s) { return s.split('|'); }
  var TK = HK.TKC;
  var fp = K.fp, cbKnot = K.cbKnot, cbPlay = K.cbPlay, eroScene = K.eroScene, faF = K.faF, ffOk = K.ffOk, lw = K.lw, omTop = K.omTop, omTops = K.omTops, toTU = K.toTU, weaveShort = K.weaveShort;
  /* 恋人・番の夜（omega-love.js）：はじまり（気質）・第二性の組のプレイ・結び・事後（受ける側の気質／番） */
  var BOND_LEAD = L('{U}のうなじの噛み跡に、{T}がそっと唇を寄せた。そこに触れられるだけで、{U}の体から力が抜けていく。|番の匂いが混ざり合って、どちらの熱なのか分からなくなっていた。|');
  var l0 = OM.loveScene;
  if (l0) OM.loveScene = function (ctx, x, y, bond) {
    var s = l0.apply(this, arguments);
    var lew = ctx.env.lewd || 'mid';
    if (!TK.on(lew) || !HK.Pos || !HK.Voice || !s || !s.A) return s;
    var A = s.A, B = s.B, LV = OM.LOVE;
    if (!TK.ok(A, B)) return s;
    var L2 = lw.last = lw(ctx);
    if (L2.short && !L2.ero) { s.text = weaveShort(ctx, s.text, A, B, bond ? 'bond' : 'love', 0.7); return s; }
    if (L2.ero) { s.text = (s.text.match(/^[^。]*。/) || [''])[0] + (L2.short ? '' : '\n\n') + eroScene(ctx, A, B, '', '', TK.kind(A, B, 'omega')); return s; }
    var kd = TK.kind(A, B, 'omega'), pk = function (arr) { return fp(ctx, arr); }, ff = kd === 'ff', hi = lew === 'high';
    var riba = HK.Pos.bothRiba && HK.Pos.bothRiba(A, B);
    var cp = cbPlay(pk, A, B, kd, riba), extra = [cp.play];
    /* 濃いめ：組み合わせを問わないプレイをもう一つ（女性どうしは指・舌の文） */
    if (hi && LV) {
      if (kd === 'ff') { var pf2 = LV.T.playFF.filter(ffOk(riba)); if (pf2.length) extra.push('それから、' + toTU(pk(pf2), true, A, B)); }
      else if (kd !== 'ride') { var ab = []; LV.T.play.forEach(function (p) { ab = ab.concat(p.base); }); extra.push('それから、' + toTU(pk(faF(A, kd, ab)), true, A, B)); }
    }
    var lead = (bond && !ff ? pk(BOND_LEAD) : '') + (LV && kd !== 'ride' && ctx.rng() < 0.6 ? toTU(pk(faF(A, kd, LV.T.lead[HK.voiceTop(A)] || LV.T.lead.NP)), true, A, B) : '');
    var fin = hi || ctx.rng() < 0.7 ? cbKnot(pk, A, B, kd, cp.cb) : '';
    var aft = LV && ctx.rng() < 0.7 ? toTU(pk(bond && ctx.rng() < 0.5 ? LV.T.bondAfter : LV.T.after[HK.voiceTop(B)] || LV.T.after.NP), true, A, B) : null;
    var body = TK.body(A, B, { flav: 'omega', pick: pk, rng: ctx.rng, bed: 'シーツ', depth: hi ? 3 : 1, lead: lead, extra: extra, finish: fin, after: aft, fore: true, top: omTops(ctx, A, B, bond ? 'bond' : 'love') });
    var sc = OM.sc || function (t) { return t; };
    var text = sc(ctx.t(TK.map(body.replace(/\{sT\}/g, '{sa}').replace(/\{sU\}/g, '{sb}'), 'a', 'b'), A, B), A, B);
    if (ff && HK.FF) text = HK.FF.fix(ctx, text, A, B, { tools: true });
    /* 書き出し（いつ・どこで）は元の場面の最初の一文を残す */
    var first = (s.text.match(/^[^。]*。/) || [''])[0];
    s.text = first + '\n\n' + text;
    return s;
  };

  /* 勢いの夜（om_night）・愛憎の夜（om_hatenight）：半分ほど、段落に分けた厚い版に（愛憎は荒い抱き方） */
  var HATE_LEAD = L('憎まれ口の応酬は、いつの間にか口づけに変わっていた。|「嫌いだ」と言いながら、{T}は{U}の服を引き裂くように脱がせた。|睨み合ったまま、どちらからともなく唇を奪い合った。|');
  var HATE_END = L('終わったあと、二人は目を合わせずに服を着た。|{U}は{T}の背中に爪痕を残したまま、黙って部屋を出ていった。|「次はない」――そう言った{T}の声は、少しも説得力がなかった。');
  var SCN = HK.SCENARIOS && HK.SCENARIOS.omega;
  (SCN && SCN.events || []).forEach(function (e) {
    if (e.id !== 'om_night' && e.id !== 'om_hatenight') return;
    var r0 = e.run, hate = e.id === 'om_hatenight';
    e.run = function (ctx, a, b) {
      var res = r0.apply(this, arguments);
      /* 敵対の強引な夜で、受けが最後まで受け入れなかった回（hate-sex-r18.js の HS.refused。2026-10-29 担当NC）は、厚い版（荒いが合意寄りの抱き方）に差し替えない */
      if (hate && HK.HateSex && HK.HateSex.refused && HK.HateSex.refused(ctx, a, b)) return res;
      var lew = ctx.env.lewd || 'mid';
      if (!res || typeof res.text !== 'string' || !TK.on(lew) || !HK.Pos || !HK.Voice) return res;
      /* 描写の長さ：厚く＝いつも段落の版、混ぜる＝半分、短く＝元の文のまま（設定をそろえる前の入力は半分） */
      var X = HK.Lewd, cf = X && X.conf('omega'), L3 = lw.last = lw(ctx);
      var o = HK.Pos.order(a, b, [a, b]), T = o[0], U = o[1];
      if (cf ? (L3.short && !L3.ero) : ctx.rng() > 0.5) {
        /* 短い版：勢いの夜は書き出しのあとに攻めの一言（愛憎の夜は hate-sex-r18.js が攻めにも喋らせている） */
        if (!hate && TK.ok(T, U) && cf && lew !== 'low') { var ld0 = res.lead && res.text.indexOf(res.lead) === 0 ? res.lead : ''; res.text = ld0 + weaveShort(ctx, res.text.slice(ld0.length), T, U, 'night', 0.5); }
        return res;
      }
      if (!TK.ok(T, U)) return res;
      /* 「誰とでも可」の人の体だけの夜（free-sex.js）は、導入の一文（res.lead）を頭に残す */
      var ld = res.lead && res.text.indexOf(res.lead) === 0 ? res.lead : '', rest = res.text.slice(ld.length);
      if (L3.ero) { res.text = ld + (rest.match(/^[^。]*。/) || [''])[0] + (L3.short ? '' : '\n\n') + eroScene(ctx, T, U, '', '', TK.kind(T, U, 'omega')); return res; }
      var pk = function (arr) { return fp(ctx, arr); }, ff = TK.kind(T, U, 'omega') === 'ff';
      var body = TK.body(T, U, { flav: 'omega', pick: pk, rng: ctx.rng, bed: 'シーツ', depth: lew === 'high' ? 3 : 1, rough: hate, lead: hate ? pk(HATE_LEAD) : '', after: hate ? pk(HATE_END) : null, fore: true, top: omTops(ctx, T, U, hate ? 'hate' : 'night') });
      var sc = OM.sc || function (t) { return t; };
      var text = sc(ctx.t(TK.map(body, 'a', 'b'), T, U), T, U);
      if (ff && HK.FF) text = HK.FF.fix(ctx, text, T, U, { tools: true });
      var first = (rest.match(/^[^。]*。/) || [''])[0];
      res.text = ld + first + '\n\n' + text;
      return res;
    };
  });

  /* 番・恋人のいる人の、ほかの人との夜（omega-passion.js の om_steal）：段落に分けた厚い版。このあと隠しごとの流れになる（omega-secret.js）。
     {T}=攻め {U}=受け（HK.Pos.order。攻めを選んだ人は受けにしない）。描写の設定が「数行で短く」なら null を返し、元の一段落の版のまま */
  var AFF_LEAD = L('「誰にも言わない」――それが、二人の最初の約束だった。|伏せたスマホが一度だけ震えて、すぐに静かになった。|知らない部屋の、知らないシーツの匂いがした。|');
  var AFF_END = L('終わったあと、二人ともしばらく何も言わなかった。窓の外が白みはじめるまで、どちらもスマホに触れなかった。|' +
    '{U}は天井を見上げたまま、帰る場所のことを考えないようにしていた。{T}の腕は、まだ{U}の腰に回ったままだった。|' +
    'シャワーの音だけが、狭い部屋に長く響いていた。混ざり合った二人の匂いは、湯を浴びても簡単には落ちなかった。');
  OM.affairScene = function (ctx, a, b) {
    var lew = ctx.env.lewd || 'mid';
    if (!TK.on(lew) || !HK.Pos || !HK.Voice) return null;
    var o = HK.Pos.order(a, b, [a, b]), T = o[0], U = o[1];
    if (!TK.ok(T, U)) return null;
    var L4 = lw.last = lw(ctx);
    if (L4.short && !L4.ero) return null;
    var sc = OM.sc || function (t) { return t; }, pk = function (arr) { return fp(ctx, arr); };
    if (L4.ero) return eroScene(ctx, T, U, '', sc(TK.names(pk(AFF_END), T, U), T, U), TK.kind(T, U, 'omega'));
    var kd = TK.kind(T, U, 'omega'), ff = kd === 'ff', riba = HK.Pos.bothRiba && HK.Pos.bothRiba(T, U);
    var cp = cbPlay(pk, T, U, kd, riba);
    var fin = lew === 'high' || ctx.rng() < 0.5 ? cbKnot(pk, T, U, kd, cp.cb) : '';
    var body = TK.body(T, U, { flav: 'omega', pick: pk, rng: ctx.rng, bed: 'シーツ', depth: lew === 'high' ? 3 : 1, lead: pk(AFF_LEAD), extra: [cp.play], finish: fin, after: pk(AFF_END), fore: true, top: omTops(ctx, T, U, 'affair') });
    var text = sc(ctx.t(TK.map(body.replace(/\{sT\}/g, '{sa}').replace(/\{sU\}/g, '{sb}'), 'a', 'b'), T, U), T, U);
    if (ff && HK.FF) text = HK.FF.fix(ctx, text, T, U, { tools: true });
    return text;
  };
  /* 短い版の隠れた夜（omega-passion.js の om_steal で、厚い版を使わないとき）：攻めの一言＋前戯の一文（pre）と、事後の一言（post）。名前で埋めた文 */
  OM.affairShort = function (ctx, a, b) {
    if (HK.SAFE_ON || !HK.Pos) return null;
    var o = HK.Pos.order(a, b, [a, b]), T = o[0], U = o[1];
    if (!TK.ok(T, U) || (ctx.env.lewd || 'mid') === 'low') return null;
    var sc = OM.sc || function (t) { return t; }, kd = TK.kind(T, U, 'omega');
    var foreS = HK.NoGen && HK.NoGen.on && HK.NoGen.on(T, U) ? '' : fp(ctx, TK.forePool(T, U, kd, {}, true));
    var fill = function (t) { return t ? sc(TK.names(t, T, U), T, U) : ''; };
    return { pre: fill(omTop(ctx, T, U, 'start', 'affair', 0.85) + foreS), post: fill(omTop(ctx, T, U, 'after', 'affair', 0.7)) };
  };
})();
