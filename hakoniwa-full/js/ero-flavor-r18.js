/* 箱庭シミュレーター（R18版のみ）― 夜の色（HK.EroFlavor）：甘々に偏った合意の夜を、性格と関係しだいで「ドライ」「大人の駆け引き」に分ける
   2026-10-28 担当KH。利用者の要望「全体的に甘々エッチが多いため、ドライだったり大人の駆け引きだったりが見られるエッチも 3P に限らず分岐・追加して。性格次第なら」
   ■ 色：'sweet' 甘め（今までどおり）／'dry' ドライ／'deal' 大人の駆け引き／'rough' 荒め（サドの夜・敵対の合意で荒い攻め。文は今までの荒い抱き方）
   ■ 決め方 HK.EroFlavor.of(ctx か S か rng, 攻め, 受け, opt)：重みを足して、種（その回の seed・二人の名前・二人の夜の回数）から決まる値で一つ選ぶ（乱数は使わない）
       ・攻め・受けの態度（受けは 0.6 倍）：穏やか・健気・内気 → 甘め／強気 → 駆け引き／冷静・厳格 → ドライ／奔放 → ドライと駆け引き／意地っ張り → 駆け引き寄り／敬語 → 相手しだい
       ・気質：ドライさ（cold）・A・CP が高いとドライ、攻撃性・主導性・FC が高いと駆け引き、NP が高いと甘め
       ・関係：恋人・夫婦・番 → 甘めが強く残る（二人とも冷静・厳格・強気ならドライ・駆け引きも）／両片想い・友達以上 → 甘め寄り／
         セフレ・一夜・その場の関係・元恋人・ライバル・同僚・上司と部下・主従・敵対の合意 → 甘めを大きく減らし、ドライ・駆け引きへ
       ・気持ちの関係（2026-10-29）：愛憎の表の顔が恋愛系 → ドライ・駆け引き寄り、対等系 → 駆け引き寄り／劣等感 → 甘め寄り（縋る）／優越 → ドライ・駆け引き寄り
       ・夜の性格：サド → 荒め／意地悪 → 駆け引き／甘々 → 甘め／恥じらい → 甘め寄り。初めての夜は甘めに少し戻す
       ・利用者の調整：全体の口調・喘ぎの設定の「夜の色の寄り」（性格に任せる＝既定／甘めに／ドライめに）
       同じ二人の同じ夜（その回の何度目の夜か）は、どこから聞いても同じ色（場面の始まりから終わりまでそろう）。夜の回数は、下の「場面の区切り」が閉じたときに一つ進む
   ■ 場面の区切り HK.EroFlavor.begin(S, a, b, opt)／end()（scope(S, a, b, opt, fn) でも）：そのあいだ色を覚えておき、色がドライ・駆け引きなら
       ・厚い山場の表（thick-sex.js の HK.ThickSex・thick-sex-ero.js の HK.ThickEro の始まり・繋がる・果てる・短い版）を、色の表（ero-flavor-lines-r18.js）に差し替える
       ・文の候補（HK.Ero.fresh・ctx.pick・HK.Story.pick・HK.LOCKER.pick）から、甘い文（F.SWEET_RE）を外す（甘くない候補が残るときだけ。乱数の引き方は変えない）
       ・受けの喘ぎ（HK.Moan.pick・HK.Ero.moan）の甘い切れ端（すき・しあわせ・とけちゃう 等）を引き直す（3回まで）。激しい声のリズム（HK.Moan.pound）は甘い♡の部品を使わない。
         台詞の遮りの切れ端（moan-cut.js の HK.Moan.cut・崩しの印）は強い切れ端だけにする（甘い切れ端は 1 割以下）
       ・記録の理由書きに「色：ドライ」「色：駆け引き」「色：荒め」を足す
   ■ 差し込み（HK.wrap）：攻めの台詞 HK.EroTop.line（段ごとに 5〜8 割でドライ・駆け引きの表。残りは今までの表から甘い文を外して）・
       HK.EroTop.say（言葉責め・焦らし・攻めの崩れを含む。崩しの印を強い切れ端に。無理やりの場面 opt.force・出来事の force には色を付けない）、
       厚い山場 HK.ThickSex.scene・HK.ThickEro.scene／short・HK.TKC.body・HK.R18M.sex（場面の区切り＋事後の一段落。R18M は mood の rough・drug を除く）、
       箱庭の夜の入口（後から届くかたまりは HK.Load.onChunk で）：出られない部屋 HK.RoomLewd.scene（媚薬・拘束の場面は甘めのまま）・合コン HK.GoukonNight・
       無人島とゾンビの街 HK.RelNight.body・媚薬ロッカー HK.LOCKER.bed（ドライ・駆け引きなら甘い一文 BED.sweet を挟まない）。
       オメガバース・宇宙船・ゾンビの街・クラスメイト・館・邪神村の夜は、上の厚い山場の部品を通るので、そこで色が効く
       ・喘ぎの引き直しは、その色の二人の声だけ（三人以上の場面のほかの人は、下の 3P の口で）
   ■ 3P・4P（担当KF 向けの口）：HK.EroFlavor.group(ctx, 攻め, [受け…]) → 色、HK.EroFlavor.trim(候補, 色) → 甘い型を外した候補（残らなければ元のまま）、
       HK.EroFlavor.isSweet(文)、HK.EroTop.say(…, { flavor: 色 }) で色を指定できる
   全年齢版・全年齢モードでは何もしない。登場人物はすべて成人として扱う */
(function () {
  'use strict';
  var HK = window.HK;
  if (!HK || HK.EroFlavor) return;
  var PS9 = ['proud', 'stern', 'tsun', 'gentle', 'devoted', 'cool', 'free', 'shy', 'polite'];
  var STAGES = ['start', 'fore', 'in', 'mid', 'peak', 'after'];
  var ALIAS = { open: 'start', kiss: 'start', foreplay: 'fore', insert: 'in', body: 'mid', climax: 'peak', cum: 'peak', end: 'after', last: 'after' };
  var LABEL = { sweet: '甘め', dry: 'ドライ', deal: '駆け引き', rough: '荒め' };
  /* 甘い文（候補から外す判定・喘ぎの引き直し） */
  var SWEET_RE = /愛して|愛おし|愛し[たてい]|大好き|好きだよ|好きだ[。、…！」]|好きよ|好き[。…」！♡]|「好き|すき(?![まを間])|幸せ|しあわせ|かわい|可愛|ぎゅっ|ぎゅう|抱きしめ|抱き締め|抱き寄せ|抱きつ|甘え|甘やか|微笑|ほほえ|うれし|嬉し|おかえり|ありがとう|ずっと一緒|一緒にいこ|一緒に、|いっしょ|離さな|額に口づけ|額に唇|額にキス|髪を撫|腕の中で|腕枕|寄り添|大切|恋人|とろけ|蕩け|ふわふわ|あったか|ときめ|胸がいっぱい|鼓動/;
  /* 性器なしの人がいる組では使わない言い方（ero-top-lines-r18.js の NOGEN_NG と同じ） */
  var NOGEN_NG = /入れ|入っ|入り|挿|貫|奥まで|繋が|出す|出る|出し|中で|中に|締めつけ|飲み込/;
  var F = HK.EroFlavor = { LABEL: LABEL, SWEET_RE: SWEET_RE, bias: '', log: null, sayLog: null };
  F.isSweet = function (s) { return typeof s === 'string' && SWEET_RE.test(s); };
  function notSweet(s) { return !(typeof s === 'string' && SWEET_RE.test(s)); }
  /* 甘い型を外した候補（色がドライ・駆け引き・荒めのときだけ。残らなければ元のまま） */
  F.trim = function (list, fl) {
    if (!list || !list.length || !fl || fl === 'sweet') return list;
    var o = list.filter(notSweet);
    return o.length ? o : list;
  };

  /* ---------- 部品 ---------- */
  function rngOf(S) {
    var r = S && S.rng ? S.rng : S;
    if (typeof r === 'function') return r;
    if (r && r.int) return function () { return r.int(1000000) / 1000000; };
    return Math.random;
  }
  function stageOf(st) { st = ALIAS[st] || st; return STAGES.indexOf(st) >= 0 ? st : 'mid'; }
  function psOf(c, opt) { var p = (opt && opt.persona) || (HK.personaOf ? HK.personaOf(c) : c && c.persona); return PS9.indexOf(p) >= 0 ? p : 'gentle'; }
  /* 夜の性格で態度を選んだ人は、相手 o に対してその態度（attr.js の HK.Attr.psNight。opt.persona の指定が優先。2026-10-31 担当E4） */
  function psN(c, o, opt) { var b = psOf(c, opt); if (opt && opt.persona) return b; var v = HK.Attr && HK.Attr.psNight ? HK.Attr.psNight(c, o, b) : b; return PS9.indexOf(v) >= 0 ? v : b; }
  function trOf(c) { return (c && c.tr) || (HK.traits ? HK.traits((c && c.eg) || { CP: 10, NP: 10, A: 10, FC: 10, AC: 10 }) : {}); }
  function nm(c) { return String((c && c.name) || ''); }
  function pairId(a, b) { return [nm(a), nm(b)].sort().join('\u0001'); }
  /* 種から 0〜1（FNV-1a ＋混ぜ） */
  function h01(s) {
    var h = 2166136261;
    for (var i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
    h ^= h >>> 13; h = Math.imul(h, 0x5bd1e995); h ^= h >>> 15;
    return (h >>> 0) / 4294967296;
  }

  /* ---------- その回の状態（箱庭を動かすたびに忘れる） ---------- */
  var SEED = 0, NIGHT = {}, CACHE = {}, stack = [], marks = [], curCtx = null;
  function reset(input) { SEED = (input && input.seed) >>> 0; NIGHT = {}; CACHE = {}; stack.length = 0; marks.length = 0; curCtx = null; }
  if (HK.simulate && HK.wrap) HK.wrap(HK, 'simulate', function (sim0) {
    var f = function (input) { reset(input); return sim0.apply(this, arguments); };
    for (var ks in sim0) if (Object.prototype.hasOwnProperty.call(sim0, ks)) f[ks] = sim0[ks];
    return f;
  });
  /* いまの箱庭の回（engine.js の Ctx）。乱数だけを渡された呼び出しでも、関係を引けるように */
  function ctxOf(S) {
    if (S && S.pf && S.chars) return S;
    if (curCtx && S && (S === curCtx.rng || S.rng === curCtx.rng)) return curCtx;
    return null;
  }

  /* ---------- 関係 ---------- */
  /* 関係の鍵：lover 恋人・夫婦・番／pine 両片想い・友達以上・片想い／first 初めて／fwb セフレ／one 一夜・その場の関係／casual 二度目以降の体だけ／
     ex 元恋人／rival ライバル／colleague 同僚／boss 上司と部下／master 主従（攻めが主）／hate 敵対の合意 */
  var OPT_REL = { lover: 'lover', first: 'first', hate: 'hate', master: 'master', serve: 'master', casual: 'one', fwb: 'fwb', ex: 'ex', rival: 'rival', tension: 'rival',
    crush: 'pine', mutual: 'pine', almost: 'pine', colleague: 'colleague', boss: 'boss', one: 'one' };
  function relOf(S, a, b, opt) {
    var c = ctxOf(S), ty = {}, pf = null;
    if (c) {
      try { if (HK.Ties && HK.Ties.all && c.tiesAll && a.i != null && b.i != null) HK.Ties.all(c, a, b).forEach(function (t) { ty[t.type] = t; }); } catch (e) { /* 関係を引けなければ無し */ }
      pf = c.pf && HK.pairKey && a.i != null && b.i != null ? c.pf[HK.pairKey(a, b)] : null;
    }
    var o = opt && opt.rel ? OPT_REL[opt.rel] || '' : '';
    var first = pf ? !pf.night && !(pf.nights > 0) : o === 'first';
    var rel;
    if (ty.lover || ty.spouse || ty.mate || ty.fated || (ty.fiance && ty.fiance.couple) || (pf && pf.couple) || o === 'lover') rel = 'lover';
    else if (ty.fwb || (pf && pf.fwb) || o === 'fwb') rel = 'fwb';
    else if (ty.enemy || ty.bad || o === 'hate') rel = 'hate';
    else if (ty.ex || o === 'ex') rel = 'ex';
    else if (ty.rival || o === 'rival') rel = 'rival';
    else if (ty.master || o === 'master') rel = 'master';
    else if (ty.boss || o === 'boss') rel = 'boss';
    else if (ty.colleague || o === 'colleague') rel = 'colleague';
    else if (ty.almost || ty.crush || ty.honmei || ty.yan || o === 'pine') rel = 'pine';
    else if (o === 'first') rel = 'first';
    else if (o === 'one') rel = 'one';
    else rel = pf && pf.nights > 0 ? 'casual' : 'one';
    /* 主従・上司と部下の台詞は、攻めが主・上司のときだけ */
    var dir = '';
    if (ty.master) dir = ty.master.a === a.i ? 'a' : 'b';
    else if (ty.boss) dir = ty.boss.a === a.i ? 'a' : 'b';
    /* お互いの好意（低いほう）と緊張（高いほう） */
    var warm = 0, ten = 0;
    if (c && c.R && a.i != null && b.i != null) { try { var r1 = c.R(a, b), r2 = c.R(b, a); warm = Math.min(r1.aff || 0, r2.aff || 0); ten = Math.max(r1.ten || 0, r2.ten || 0); } catch (e) { /* 値を引けなければ 0 */ } }
    return { rel: rel, first: first, dir: dir, warm: warm, ten: ten };
  }

  /* ---------- 色の重み ---------- */
  var PS_W = {
    gentle: { sweet: 1.0 }, devoted: { sweet: 1.0 }, shy: { sweet: 0.8 },
    proud: { deal: 0.8, dry: 0.3 }, cool: { dry: 1.0, deal: 0.3 }, stern: { dry: 0.8, deal: 0.2 },
    free: { deal: 0.5, dry: 0.5 }, tsun: { deal: 0.7, dry: 0.2, sweet: 0.2 }, polite: { sweet: 0.3, dry: 0.2 }
  };
  var COOLISH = { cool: 1, stern: 1, proud: 1 };
  /* 関係：mul … 甘めに掛ける倍率、ほか … 足す */
  var REL_W = {
    lover: { mul: 1, sweet: 2.0 }, pine: { mul: 1, sweet: 1.2 }, first: { mul: 1, sweet: 1.0 },
    fwb: { mul: 0.4, dry: 1.3, deal: 1.0 }, one: { mul: 0.55, dry: 1.1, deal: 0.9 }, casual: { mul: 0.55, dry: 1.0, deal: 0.9 },
    ex: { mul: 0.4, deal: 1.4, dry: 0.7 }, rival: { mul: 0.3, deal: 2.0, dry: 0.3 }, colleague: { mul: 0.5, deal: 1.1, dry: 0.8 },
    boss: { mul: 0.45, deal: 1.2, dry: 0.7 }, master: { mul: 0.5, deal: 1.1, dry: 0.6 }, hate: { mul: 0.15, deal: 1.2, dry: 1.0, rough: 0.6 }
  };
  function add(w, o, k) { Object.keys(o).forEach(function (f) { if (w[f] != null) w[f] += o[f] * k; }); }
  F.weights = function (S, top, bot, opt, R) {
    var pa = psN(top, bot, opt), pb = psN(bot, top), ta = trOf(top), tb = trOf(bot);
    R = R || relOf(S, top, bot, opt);
    var w = { sweet: 1.2, dry: 0.35, deal: 0.35, rough: 0 };
    add(w, PS_W[pa], 1); add(w, PS_W[pb], 0.6);
    /* 敬語の人は相手の色に半分寄る */
    if (pa === 'polite') add(w, PS_W[pb], 0.5);
    if (pb === 'polite') add(w, PS_W[pa], 0.3);
    /* 気質 */
    var cold = (ta.cold || 0) * 0.6 + (tb.cold || 0) * 0.4;
    if (cold > 0.55) w.dry += (cold - 0.55) * 3;
    if (ta.a > 0.65) w.dry += (ta.a - 0.65) * 2;
    if (ta.cp > 0.65) w.dry += (ta.cp - 0.65) * 1.5;
    if (ta.aggr > 0.6) w.deal += (ta.aggr - 0.6) * 3;
    if (ta.lead > 0.6) w.deal += (ta.lead - 0.6) * 2.5;
    if (ta.fc > 0.65) w.deal += (ta.fc - 0.65) * 2;
    if (ta.np > 0.65) w.sweet += (ta.np - 0.65) * 3;
    if (tb.np > 0.65) w.sweet += (tb.np - 0.65) * 2;
    /* 関係 */
    var rw = REL_W[R.rel] || REL_W.one;
    w.sweet *= rw.mul;
    add(w, rw, 1);
    if (R.rel === 'lover' && COOLISH[pa] && COOLISH[pb]) { w.dry += 1.3; w.deal += 0.8; }
    else if (R.rel === 'lover' && (COOLISH[pa] || pa === 'free')) { w.dry += 0.3; w.deal += 0.3; }
    /* 恋人でない二人も、お互いの好意が高ければ甘めに寄り、張り詰めた仲（緊張が高い）なら駆け引きに寄る */
    if (R.rel !== 'lover' && R.warm > 40) w.sweet += Math.min(1.5, (R.warm - 40) / 25);
    if (R.ten > 50) w.deal += Math.min(1, (R.ten - 50) / 40);
    /* 愛憎・劣等感・優越（2026-10-29。設計 2-1・7-4）：恋愛系の顔の愛憎はドライ・駆け引き寄り（喧嘩のあと）、対等系の愛憎は駆け引き寄り
       （嫌悪系は上の関係 hate のまま）。劣等感は甘め寄り（縋る）、優越はドライ・駆け引き寄り（見下ろす）。どちらの向きでも見る */
    var lx = ctxOf(S) || (S && S.P && S.ties ? S : null), LH = HK.LoveHate, ES = HK.Esteem;
    if (lx) {
      try {
        if (LH && LH.any && LH.any(lx, top, bot)) {
          var fc = LH.face ? LH.face(lx, top, bot) : 'hate';
          if (fc === 'love') { w.sweet *= 0.55; w.dry += 0.6; w.deal += 0.9; }
          else if (fc === 'peer') { w.sweet *= 0.7; w.deal += 0.7; w.dry += 0.3; }
        }
        if (ES && ES.of) {
          var e1 = ES.of(lx, top, bot), e2 = ES.of(lx, bot, top);
          if (e1 === 'inferior' || e2 === 'inferior') w.sweet += 0.9;
          if (e1 === 'superior' || e2 === 'superior') { w.sweet *= 0.75; w.dry += 0.5; w.deal += 0.6; }
        }
      } catch (e) { /* 関係を引けなければそのまま */ }
    }
    /* 夜の性格 */
    var A = HK.Attr, nt = A && A.nightOf ? A.nightOf(top, bot) : '', nb = A && A.nightOf ? A.nightOf(bot, top) : '';
    if (nt === 'sadist') { w.rough += 2.5; w.deal += 0.5; }
    if (nt === 'mean') w.deal += 2;
    if (nt === 'sweet' || nb === 'sweet') w.sweet += 3;
    if (nt === 'shy' || nb === 'shy') w.sweet += 1;
    if (nb === 'maso') w.rough += 0.5;
    /* 初めての夜は甘めに少し戻す */
    if (R.first) w.sweet += /^(lover|pine|first)$/.test(R.rel) ? 0.8 : 0.25;
    /* 荒めは、受けが攻めを選んでいる組では使わない */
    if (HK.Pos && HK.Pos.hardTop && HK.Pos.hardTop(bot, top)) w.rough = 0;
    /* 利用者の調整 */
    if (F.bias === 'sweet') { w.sweet *= 2.2; w.dry *= 0.6; w.deal *= 0.6; w.rough *= 0.6; }
    else if (F.bias === 'dry') { w.sweet *= 0.35; w.dry *= 1.5; w.deal *= 1.3; }
    return w;
  };
  /* 色を選ぶ（同じ二人の同じ夜は同じ色） */
  F.of = function (S, a, b, opt) {
    if (HK.SAFE_ON || !a || !b || a === b) return 'sweet';
    if (opt && opt.flavor && LABEL[opt.flavor]) return opt.flavor;
    /* 無理やりの場面（出来事の force・呼ぶ側の opt.force）は色を付けない（合意の夜だけ） */
    var c0 = ctxOf(S);
    if ((opt && opt.force) || (c0 && c0._ev && c0._ev.force)) return 'sweet';
    var pid = pairId(a, b), n = NIGHT[pid] || 0, key = SEED + '\u0002' + pid + '\u0002' + n;
    if (CACHE[key]) return CACHE[key].fl;
    var od = HK.Pos && HK.Pos.order ? HK.Pos.order(a, b, [a, b]) : [a, b], top = od[0], bot = od[1];
    var R = relOf(S, top, bot, opt), w = F.weights(S, top, bot, opt, R), sum = 0, ks = ['sweet', 'dry', 'deal', 'rough'];
    ks.forEach(function (k) { w[k] = Math.max(0, w[k]) * (0.65 + 0.7 * h01(key + '\u0003' + k)); sum += w[k]; });
    var x = h01(key + '\u0003pick') * sum, fl = 'sweet';
    for (var i = 0; i < ks.length; i++) { if (x < w[ks[i]]) { fl = ks[i]; break; } x -= w[ks[i]]; }
    CACHE[key] = { fl: fl, rel: R.rel, dir: R.dir, top: nm(top) };
    return fl;
  };
  /* 二人の関係の鍵（色の台詞の関係の表を引くため） */
  F.relKey = function (S, a, b, opt) { F.of(S, a, b, opt); var c = CACHE[SEED + '\u0002' + pairId(a, b) + '\u0002' + (NIGHT[pairId(a, b)] || 0)]; return c ? c : { rel: relOf(S, a, b, opt).rel, dir: '' }; };
  /* 三人以上の場面（担当KF 向け）：攻めと受けそれぞれの組の色のうち、いちばん多い色（同数なら最初の組） */
  F.group = function (S, top, bots, opt) {
    var cnt = {}, first = '', best = '';
    (bots || []).forEach(function (b) { if (!b || b === top) return; var fl = F.of(S, top, b, opt); if (!first) first = fl; cnt[fl] = (cnt[fl] || 0) + 1; });
    Object.keys(cnt).forEach(function (k) { if (!best || cnt[k] > cnt[best] || (cnt[k] === cnt[best] && k === first)) best = k; });
    return best || 'sweet';
  };

  /* ---------- 場面の区切り ---------- */
  function same(sc, a, b) { return sc && pairId(sc.a, sc.b) === pairId(a, b); }
  F.cur = function () { for (var i = stack.length - 1; i >= 0; i--) if (stack[i]) return stack[i]; return null; };
  /* いま甘い文を外す色か */
  function hot() { var sc = F.cur(); return !!(sc && sc.fl !== 'sweet' && !HK.SAFE_ON); }
  F.active = hot;
  F.begin = function (S, a, b, opt) {
    if (HK.SAFE_ON || !a || !b || a === b) { stack.push(null); return 'sweet'; }
    var c = ctxOf(S); if (c) curCtx = c;
    var up = F.cur(), fl = opt && opt.flavor && LABEL[opt.flavor] ? opt.flavor : up && same(up, a, b) ? up.fl : F.of(S, a, b, opt);
    var sc = { fl: fl, a: a, b: b, S: S, sw: null, tagged: false, light: false };
    if ((fl === 'dry' || fl === 'deal') && !(up && up.sw && up.fl === fl)) sc.sw = swap(fl);
    stack.push(sc);
    return fl;
  };
  F.end = function () {
    var sc = stack.pop();
    if (!sc) return;
    if (sc.sw) unswap(sc.sw);
    if (sc.light) return;
    /* いちばん外側の区切りが閉じたら、その二人の夜を一つ進め、理由書きの印を置く */
    if (!stack.some(function (x) { return x && !x.light; })) {
      var pid = pairId(sc.a, sc.b), ce = CACHE[SEED + '\u0002' + pid + '\u0002' + (NIGHT[pid] || 0)];
      NIGHT[pid] = (NIGHT[pid] || 0) + 1;
      if (Array.isArray(F.log)) F.log.push({ names: [nm(sc.a), nm(sc.b)], fl: sc.fl, rel: ce ? ce.rel : '' });
      if (sc.fl !== 'sweet' && !sc.tagged) { marks.push({ names: [nm(sc.a), nm(sc.b)], fl: sc.fl, n: 0 }); if (marks.length > 12) marks.shift(); }
    }
  };
  F.scope = function (S, a, b, opt, fn) { var fl = F.begin(S, a, b, opt); try { return fn(fl); } finally { F.end(); } };
  /* 色だけを一時的に効かせる（表の差し替え・夜の回数・理由書きはしない） */
  function light(fl, fn, a, b) { stack.push({ fl: fl, a: a || null, b: b || null, light: true }); try { return fn(); } finally { stack.pop(); } }

  /* ---------- 厚い山場の表の差し替え ---------- */
  function allKeys(orig, list) { var o = {}; Object.keys(orig || {}).forEach(function (k) { o[k] = list; }); return o; }
  function swap(fl) {
    var D = HK.EROFLAVOR, N = D && D.NOVEL && D.NOVEL[fl], E = D && D.ERO && D.ERO[fl], T = HK.ThickSex, X = HK.ThickEro, saved = [];
    function put(obj, key, val) { if (!obj || obj[key] == null || !val) return; saved.push([obj, key, obj[key]]); obj[key] = val; }
    var MUT = HK.Pos && HK.Pos.MUTUAL_RE, noMut = function (l) { return notSweet(l) && !(MUT && MUT.test(l)) && !/玩具|双頭/.test(l); };
    if (T && N) {
      var bk = fl === 'dry' ? 'clinical' : 'tease';
      put(T, 'OPEN', allKeys(T.OPEN, N.open));
      put(T, 'BODY', allKeys(T.BODY, N.body.mf.concat(((T.BODY || {})[bk] || []).filter(notSweet))));
      put(T, 'CLIMAX', allKeys(T.CLIMAX, N.climax.mf));
      put(T, 'FM_BODY', allKeys(T.FM_BODY, N.body.fm.concat(((T.FM_BODY || {}).dom || []).filter(notSweet))));
      put(T, 'FM_CLIMAX', allKeys(T.FM_CLIMAX, N.climax.fm));
      put(T, 'FF_BODY', allKeys(T.FF_BODY, N.body.ff.concat(((T.FF_BODY || {}).dom || []).filter(noMut))));
      put(T, 'FF_CLIMAX', allKeys(T.FF_CLIMAX, N.climax.ff.concat(((T.FF_CLIMAX || {}).dom || []).filter(noMut))));
    }
    if (X && E) {
      var o = {};
      ['mf', 'fm', 'ff'].forEach(function (m) { o[m] = N ? N.open.concat(((X.OPEN || {})[m] || []).filter(notSweet)) : null; });
      if (N) put(X, 'OPEN', o);
      var dl = fl === 'deal';
      put(X, 'BODY', allKeys(X.BODY, E.body.mf.concat(dl ? (X.BODY || {}).tease || [] : [])));
      put(X, 'CLIMAX', allKeys(X.CLIMAX, E.climax.mf.concat(dl ? (X.CLIMAX || {}).tease || [] : [])));
      put(X, 'FM_BODY', allKeys(X.FM_BODY, E.body.fm.concat(((X.FM_BODY || {}).dom || []).filter(notSweet))));
      put(X, 'FM_CLIMAX', allKeys(X.FM_CLIMAX, E.climax.fm.concat(dl ? ((X.FM_CLIMAX || {}).dom || []).filter(notSweet) : [])));
      put(X, 'FF_BODY', allKeys(X.FF_BODY, E.body.ff.concat(((X.FF_BODY || {}).dom || []).filter(noMut))));
      put(X, 'FF_CLIMAX', allKeys(X.FF_CLIMAX, E.climax.ff.concat(((X.FF_CLIMAX || {}).dom || []).filter(noMut))));
      put(X, 'SHORT', { mf: E.short.mf, fm: E.short.fm, ff: E.short.ff });
    }
    return saved;
  }
  function unswap(saved) { for (var i = saved.length - 1; i >= 0; i--) saved[i][0][saved[i][1]] = saved[i][2]; }

  /* ---------- 色の文 ---------- */
  function freshPick(S, arr) { var r = rngOf(S), base = function (l) { return l[Math.floor(r() * l.length)]; }; return HK.Ero && HK.Ero.fresh && S ? HK.Ero.fresh(S, arr, base) : base(arr); }
  /* 攻めの一言（「…」だけ。言わないときは ''） */
  F.line = function (S, top, bot, stage, fl, opt) {
    var D = HK.EROFLAVOR; if (!D || (fl !== 'dry' && fl !== 'deal')) return '';
    var st = stageOf(stage), ps = psN(top, bot, opt), T = (fl === 'dry' ? D.DRY : D.DEAL)[ps] || (fl === 'dry' ? D.DRY : D.DEAL).gentle;
    var base = (T && T[st]) || [], rk = F.relKey(S, top, bot, opt), RL = (fl === 'dry' ? D.REL_DRY : D.REL_DEAL)[rk.rel];
    /* 主従・上司と部下の台詞は、攻めが主・上司のときだけ */
    if (RL && (rk.rel === 'master' || rk.rel === 'boss') && rk.dir && rk.dir !== (rk.top === nm(top) ? 'a' : 'b')) RL = null;
    var rel = RL && RL[st] ? RL[st] : null, r = rngOf(S);
    var pool = rel && r() < 0.5 ? rel : base.length ? base : rel || [];
    if (HK.NoGen && HK.NoGen.on && HK.NoGen.on(top, bot)) { var ng = pool.filter(function (l) { return !NOGEN_NG.test(l); }); pool = ng.length ? ng : pool; }
    return pool.length ? freshPick(S, pool) : '';
  };
  /* 事後の一段落（{a}{b}。mode：mf／fm／ff） */
  F.after = function (S, fl, mode) {
    var D = HK.EROFLAVOR, N = D && D.NOVEL && D.NOVEL[fl];
    if (!N || !N.after) return '';
    var l = N.after[mode === 'fm' || mode === 'ff' ? mode : 'mf'];
    return l && l.length ? freshPick(S, l) : '';
  };
  /* 崩しの印（moan-cut.js の MK0＋崩しの段＋強い切れ端の割合）の割合を、強い切れ端だけに */
  function harden(s) { return typeof s === 'string' && s.indexOf('') >= 0 ? s.replace(/([0-9])[0-9]/g, function (m, lv) { return '' + lv + '9'; }) : s; }
  F.harden = harden;

  /* ---------- 攻めの台詞（HK.EroTop.say） ---------- */
  /* 色の表を使う割合（段ごと）。残りは今までの表（言葉責め・焦らし・攻めの崩れを含む。甘い文は外す） */
  var P_USE = { start: 0.75, fore: 0.55, in: 0.55, mid: 0.5, peak: 0.5, after: 0.8 };
  function wrapTop() {
    var ET = HK.EroTop;
    if (!ET || !ET.say || ET.say._flavor) return;
    /* 「…」だけを返す表引き（say のほか、場面の表と混ぜる呼び出し：出られない部屋・オメガバースなども直に使う） */
    if (ET.line && !ET.line._flavor) HK.wrap(ET, 'line', function (line0) {
      var f = function (S, top, bot, stage, opt) {
        if (HK.SAFE_ON || !top || !bot || top === bot) return line0.apply(this, arguments);
        var fl = opt && opt.flavor && LABEL[opt.flavor] ? opt.flavor : opt && opt.force ? 'sweet' : F.of(S, top, bot, opt), self = this, args = arguments;
        if (fl === 'sweet') return line0.apply(this, arguments);
        if (fl === 'rough') return light(fl, function () { return line0.apply(self, args); }, top, bot);
        var r = rngOf(S);
        if (opt && opt.p != null) { if (r() >= opt.p) return ''; opt = Object.assign({}, opt); delete opt.p; }
        var st = stageOf(stage);
        if (r() < (P_USE[st] || 0.55)) { var l = F.line(S, top, bot, st, fl, opt); if (l) return l; }
        return light(fl, function () { return line0.call(self, S, top, bot, stage, opt); }, top, bot);
      };
      f._flavor = true;
      return f;
    });
    /* 名前「…」の形（言葉責め・焦らし・攻めの崩れ HK.Moan.topSay を先に試し、無ければ上の line） */
    HK.wrap(ET, 'say', function (say0) {
      var f = function (S, top, bot, stage, opt) {
        if (HK.SAFE_ON || !top || !bot || top === bot) return say0.apply(this, arguments);
        var fl = opt && opt.flavor && LABEL[opt.flavor] ? opt.flavor : opt && opt.force ? 'sweet' : F.of(S, top, bot, opt), self = this, args = arguments;
        if (Array.isArray(F.sayLog)) F.sayLog.push({ names: [nm(top), nm(bot)], fl: fl, stage: stageOf(stage) });
        if (fl === 'sweet') return say0.apply(this, arguments);
        return harden(light(fl, function () { return say0.apply(self, args); }, top, bot));
      };
      f._flavor = true;
      return f;
    });
  }
  wrapTop();

  /* ---------- 厚い山場（小説調・男性向け）：場面の区切り＋事後の一段落 ---------- */
  var STYLE = { dry: 'clinical', deal: 'tease', rough: 'rough' };
  function wrapThick(obj, ero) {
    if (!obj || !obj.scene || obj.scene._flavor) return;
    HK.wrap(obj, 'scene', function (sc0) {
      var f = function (opt) {
        if (HK.SAFE_ON || !opt || !opt.a || !opt.b) return sc0.apply(this, arguments);
        var S = opt.ctx || opt.S || opt.rng, fl = F.begin(S, opt.a, opt.b, opt);
        try {
          var o2 = STYLE[fl] ? Object.assign({}, opt, { style: STYLE[fl] }) : opt;
          var r = sc0.call(this, o2);
          if ((fl === 'dry' || fl === 'deal') && r && typeof r.text === 'string' && !opt.after && !opt.again) {
            var af = F.after(opt.S || opt.rng || S, fl, r.mode);
            if (af) r.text += '\n\n' + af;
          }
          return r;
        } finally { F.end(); }
      };
      f._flavor = true;
      return f;
    });
    if (ero && obj.short && !obj.short._flavor) HK.wrap(obj, 'short', function (sh0) {
      var f = function (opt) {
        if (HK.SAFE_ON || !opt || !opt.a || !opt.b) return sh0.apply(this, arguments);
        var self = this, args = arguments;
        return F.scope(opt.S || opt.rng, opt.a, opt.b, opt, function () { return sh0.apply(self, args); });
      };
      f._flavor = true;
      return f;
    });
  }
  wrapThick(HK.ThickSex, false);
  wrapThick(HK.ThickEro, true);
  /* オメガバース・宇宙船・ゾンビの街の厚い山場（omega-thick-kit.js の HK.TKC.body）：{T}{U} のまま */
  if (HK.TKC && HK.TKC.body && !HK.TKC.body._flavor) HK.wrap(HK.TKC, 'body', function (tb0) {
    var f = function (T, U, o) {
      if (HK.SAFE_ON || !T || !U || !o) return tb0.apply(this, arguments);
      var self = this, args = arguments;
      /* o.flavor（慰めの夜 omega-mob-after-r18.js の 'sweet' など）があれば、その色で */
      return F.scope(o.rng, T, U, o.flavor ? { flavor: o.flavor } : null, function (fl) {
        if ((fl === 'dry' || fl === 'deal') && !o.noAfter && !o.after) {
          var kd = HK.TKC.kind ? HK.TKC.kind(T, U, o.flav) : 'mf', af = F.after(o.rng, fl, kd === 'ff' ? 'ff' : kd === 'ride' ? 'fm' : 'mf');
          if (af) return tb0.call(self, T, U, Object.assign({}, o, { after: af.replace(/\{a\}/g, '{T}').replace(/\{b\}/g, '{U}') }));
        }
        return tb0.apply(self, args);
      });
    };
    f._flavor = true;
    return f;
  });
  /* 物語型の箱庭の交わり（solo-r18-moan.js の HK.R18M.sex。名前を埋めた文を返す） */
  if (HK.R18M && HK.R18M.sex && !HK.R18M.sex._flavor) HK.wrap(HK.R18M, 'sex', function (sx0) {
    var f = function (S, x, y, opt) {
      /* 荒々しい・媚薬の交わり（mood rough・drug）は今までどおり。恋人・想いの交わり（love）は恋人として色を決める */
      var md = opt && opt.mood;
      if (HK.SAFE_ON || !S || !x || !y || md === 'rough' || md === 'drug') return sx0.apply(this, arguments);
      var self = this, args = arguments;
      return F.scope(S, x, y, md === 'love' ? { rel: 'lover' } : null, function (fl) {
        if (fl !== 'dry' && fl !== 'deal') return sx0.apply(self, args);
        var o2 = Object.assign({}, opt || {}); if (o2.mood === 'love') o2.mood = 'plain';
        var t = sx0.call(self, S, x, y, o2);
        if (typeof t !== 'string' || o2.short) return t;
        var od = HK.Pos && HK.Pos.order ? HK.Pos.order(x, y, [x, y]) : [x, y], P = HK.Pos;
        var mode = P && P.isF && P.isF(od[0]) ? (P.isF(od[1]) ? 'ff' : 'fm') : 'mf', af = F.after(S, fl, mode);
        return af ? t + '\n\n' + af.replace(/\{a\}/g, nm(od[0])).replace(/\{b\}/g, nm(od[1])) : t;
      });
    };
    f._flavor = true;
    return f;
  });

  /* ---------- 文の候補から甘い文を外す（色がドライ・駆け引き・荒めの場面のあいだだけ） ---------- */
  var Ero = HK.Ero;
  if (Ero && Ero.fresh && !Ero.fresh._flavor) HK.wrap(Ero, 'fresh', function (fr0) {
    var f = function (S, arr, base) {
      if (arr && arr.length > 1 && hot()) { var o = arr.filter(notSweet); if (o.length && o.length < arr.length) arr = o; }
      return fr0.call(this, S, arr, base);
    };
    f._flavor = true;
    return f;
  });
  function filterPick(obj, key, ctxIsThis) {
    if (!obj || typeof obj[key] !== 'function' || obj[key]._flavor) return;
    HK.wrap(obj, key, function (p0) {
      var f = ctxIsThis ? function (arr) {
        curCtx = this;
        if (arr && arr.length > 1 && hot() && typeof arr[0] === 'string') { var o = arr.filter(notSweet); if (o.length && o.length < arr.length) arguments[0] = o; }
        return p0.apply(this, arguments);
      } : function (S, arr) {
        if (arr && arr.length > 1 && hot() && typeof arr[0] === 'string') { var o = arr.filter(notSweet); if (o.length && o.length < arr.length) arguments[1] = o; }
        return p0.apply(this, arguments);
      };
      f._flavor = true;
      return f;
    });
  }
  if (HK.Ctx && HK.Ctx.prototype) filterPick(HK.Ctx.prototype, 'pick', true);
  filterPick(HK.Story, 'pick', false);
  filterPick(HK.LOCKER, 'pick', false);

  /* ---------- 喘ぎ：甘い切れ端を引き直す・強い切れ端だけにする ---------- */
  var M = HK.Moan;
  function reroll(obj, key) {
    if (!obj || typeof obj[key] !== 'function' || obj[key]._flavor) return;
    HK.wrap(obj, key, function (p0) {
      var f = function () {
        var out = p0.apply(this, arguments), sc = F.cur(), who = arguments[1];
        /* 引き直すのは、その色の二人の声だけ（三人以上の場面のほかの人は、担当KF の色の口 HK.EroFlavor.group／trim に任せる） */
        if (!hot() || (sc.a && who && who.name && who.name !== nm(sc.a) && who.name !== nm(sc.b))) return out;
        for (var i = 0; i < 3 && typeof out === 'string' && SWEET_RE.test(out); i++) out = p0.apply(this, arguments);
        return out;
      };
      f._flavor = true;
      return f;
    });
  }
  reroll(M, 'pick');
  reroll(Ero, 'moan');
  if (M && M.pound && !M.pound._flavor) HK.wrap(M, 'pound', function (p0) {
    var f = function (S, who, refuse, sweet) { return p0.call(this, S, who, refuse, sweet && !hot()); };
    f._flavor = true;
    return f;
  });
  if (M && M.cut && !M.cut._flavor) HK.wrap(M, 'cut', function (c0) {
    var f = function (S, who, line, lv, o) {
      if (hot() && !(o && (o.hard != null || o.sweet != null))) o = Object.assign({}, o || {}, { hard: 0.95 });
      return c0.call(this, S, who, line, lv, o);
    };
    f._flavor = true;
    return f;
  });

  /* ---------- 記録の理由書きに「色：〜」 ---------- */
  function hasBoth(t, names) { return names[0] && names[1] && t.indexOf(names[0]) >= 0 && t.indexOf(names[1]) >= 0; }
  function addWhy(o, fl) {
    var w = String(o.why || '');
    if (w.indexOf('色：') >= 0) return;
    /* 媚薬ロッカーのベッドの「甘く」は、色がドライ・駆け引きなら外す */
    if (fl === 'dry' || fl === 'deal') w = w.replace(/／甘く(?=／|$)/, '');
    o.why = (w ? w + '／' : '') + '色：' + LABEL[fl];
  }
  function tagWhy(o) {
    if (!o || typeof o.text !== 'string' || HK.SAFE_ON || o.kind === 'step') return;
    var sc = F.cur();
    if (sc && !sc.light && sc.fl !== 'sweet' && hasBoth(o.text, [nm(sc.a), nm(sc.b)])) { addWhy(o, sc.fl); stack.forEach(function (x) { if (x && same(x, sc.a, sc.b)) x.tagged = true; }); return; }
    for (var i = 0; i < marks.length; i++) {
      if (hasBoth(o.text, marks[i].names)) { addWhy(o, marks[i].fl); marks.splice(i, 1); return; }
    }
    marks.forEach(function (x) { x.n++; });
    for (var j = marks.length - 1; j >= 0; j--) if (marks[j].n >= 8) marks.splice(j, 1);
  }
  if (HK.Ctx && HK.Ctx.prototype.say && !HK.Ctx.prototype.say._flavor) {
    var cs0 = HK.Ctx.prototype.say;
    HK.Ctx.prototype.say = function (o) { curCtx = this; tagWhy(o); return cs0.apply(this, arguments); };
    HK.Ctx.prototype.say._flavor = true;
  }
  if (HK.Story && HK.Story.say && !HK.Story.say._flavor) HK.wrap(HK.Story, 'say', function (ss0) {
    var f = function (S, o) { tagWhy(o); return ss0.apply(this, arguments); };
    f._flavor = true;
    return f;
  });

  /* ---------- 箱庭の夜の入口（場所・関係の一文、事後の文も色の区切りの中で選ぶ） ---------- */
  function entry(obj, key, pick) {
    if (!obj || typeof obj[key] !== 'function' || obj[key]._flavor) return;
    HK.wrap(obj, key, function (e0) {
      var f = function () {
        var p = pick.apply(null, arguments);
        if (HK.SAFE_ON || !p || !p.a || !p.b) return e0.apply(this, arguments);
        var self = this, args = arguments;
        return F.scope(p.S, p.a, p.b, p.opt || null, function (fl) {
          var undo = p.prep ? p.prep(fl) : null;
          try { return e0.apply(self, args); } finally { if (undo) undo(); }
        });
      };
      f._flavor = true;
      return f;
    });
  }
  function install() {
    /* 出られない部屋（room-thick.js）：始まり・事後・場所の文を選ぶところから（媚薬・拘束の場面は今までどおり） */
    entry(HK.RoomLewd, 'scene', function (ctx, a, b, mode) { return { S: ctx, a: a, b: b, opt: mode === 'aphro' || mode === 'speed' ? { flavor: 'sweet' } : null }; });
    /* 合コン（solo-goukon-night.js） */
    entry(HK, 'GoukonNight', function (ctx, a, b) { return { S: ctx, a: a, b: b }; });
    /* 無人島・ゾンビの街の夜（solo-rel-r18.js の HK.RelNight.body。x＝攻め、y＝受け） */
    entry(HK.RelNight, 'body', function (ctx, place, x, y) { return { S: ctx, a: x, b: y }; });
    /* 媚薬ロッカーのベッド（solo-locker-bed.js・locker-thick.js の HK.LOCKER.bed）：色がドライ・駆け引きなら、甘い一文（BED.sweet）を挟まない */
    var LK = HK.LOCKER;
    entry(LK, 'bed', function (S, o) {
      return o ? { S: S, a: o.x, b: o.y, opt: { rel: o.rel }, prep: function (fl) {
        var B = LK && LK.BED;
        if ((fl !== 'dry' && fl !== 'deal') || !B || !B.sweet) return null;
        var s0 = B.sweet; B.sweet = [''];
        return function () { B.sweet = s0; };
      } } : null;
    });
  }
  install();
  if (HK.Load && HK.Load.onChunk) HK.Load.onChunk(install);

  /* ---------- 利用者の調整：全体の口調・喘ぎの設定の「夜の色の寄り」 ---------- */
  var BIAS = [['', '性格に任せる（既定）'], ['sweet', '甘めに'], ['dry', 'ドライめに']];
  function norm(v) { v = String(v || '').trim(); return v === 'sweet' || v === 'dry' ? v : ''; }
  var A = HK.Adv;
  if (A && A.add && !HK.SAFE_ON) {
    A.add({
      id: 'eroflavor', title: '夜の色の寄り', before: 'moanfit',
      desc: '合意の夜を、甘め・ドライ（動作と結果だけ、短い確認と指示、後腐れのない事後）・大人の駆け引き（主導権の取り合い・条件・交換・余裕の煽り合い）のどれで書くかの寄せ方です。' +
        '「性格に任せる」では、二人の態度・気質・関係（恋人は甘め寄り、セフレ・一夜・元恋人・ライバル・同僚・上司と部下などはドライ・駆け引き寄り）・夜の性格から決めます。変えた値は次に箱庭を動かしたときから効きます。',
      html: function () {
        var cur = norm(A.get('eroflavor'));
        return '<select data-f="adv" data-k="eroflavor" aria-label="夜の色の寄り">' + BIAS.map(function (x) { return '<option value="' + x[0] + '"' + (x[0] === cur ? ' selected' : '') + '>' + A.esc(x[1]) + '</option>'; }).join('') + '</select>';
      },
      onInput: function (el) { A.set('eroflavor', norm(el.value), true); },
      apply: function (text) { F.bias = norm(text); return { errors: [] }; }
    });
  }
})();
