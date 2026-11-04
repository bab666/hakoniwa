/* r18:begin */
/* セットB の部屋の共通部品：夜の場面の組み立て（R18版だけ。2026-11-03。新婚部屋の shinkon-r18.js から、看病の部屋でも使う部分を共通のかたまり kit に移した）
   ■ HK.PairR18（PR）
     ・PR.sexOk(ctx, a, b)：体の関係にしてよい二人か（血縁・無関心・HK.State.pairSex・性欲「なし」・HK.sexBlocked・HK.ngSexPair）
     ・PR.shape(a, b)：形（mf／ff／fm。攻め a・受け b から。thick-sex.js と同じ決め方）
     ・PR.att(c, o)：c が o に向ける夜の態度（夜の性格で選んでいればそれ、なければ気質の態度9種）
     ・PR.nightAdd・PR.insert1：短い・中くらいの場面に夜の性格の一文（HK.Attr.nightText）と夜の主導の段（HK.PosLead.text）を差す
     ・PR.formOf(ctx, S, env, lv, nogen, last)：場面の長さ（ほのめかす／短い／中くらい／長い）。S.sex・S.lewdMax・S.longN を読む
     ・PR.scene(ctx, S, env, a, b, sh, form, o, src)：場面の本文 { text, form }。src は部屋の文 { TX(): 表の行ごとの文（PLAY・BOTTOM・TOP・AFTER・PEAK）, MO(): 始まり・ほのめかす・男性向けの山場（OPEN・REOPEN・FADE・PEAK_E）,
       R: 表（BOTTOM・TOP の行）, ok(): 文の絞り込みの関数 }。長い場面は本体の HK.ThickSex.scene・HK.ThickEro.scene、中くらいは態度9種の山場の喘ぎ
     ・PR.FB：文の予備（形ごとに 3 文以上）
   体の語は印（{男性器} など）。登場人物はすべて成人として扱う */
(function () {
  'use strict';
  var HK = window.HK;
  if (!HK || !HK.Journal) return;
  var J = HK.Journal, K = HK.PairKit;
  function L(s) { return s.split('|'); }
  function pickOf(ctx, arr) { return arr && arr.length ? arr[Math.floor(ctx.rng() * arr.length)] : ''; }
  /* 一回の遊びで同じ文を続けて使わない（山場の文。2026-11-04：三人・四人で暮らす家の昼の場面で場面の数が増え、同じ山場の文が 3 回出ることがあった） */
  function fresh(ctx, arr) { if (!arr || !arr.length) return ''; var U = ctx._prUsed = ctx._prUsed || {}, q = arr.filter(function (x) { return !U[x]; }), t = pickOf(ctx, q.length ? q : arr); U[t] = 1; return t; }
  function fill(ctx, t, a, b, ex) {
    t = String(t || '');
    if (ex) Object.keys(ex).forEach(function (k) { t = t.split('{' + k + '}').join(ex[k]); });
    return ctx.t(t, a, b);
  }
  function mk(ctx, t, a, b, ex) { return K ? K.fill(ctx, t, a, b, ex) : fill(ctx, t, a, b, ex); }
  function per(c) { return HK.PairReact ? HK.PairReact.per(c) : 'gentle'; }
  /* 体の関係にしてよい二人か。恋愛感情の有無では止めない（利用者の決まり「性的な出来事は性欲と衝動で判定し、恋愛感情が発生を防がないように」。
     「恋愛：なし」の夫婦＝契約結婚のような二人も、体の関係は共通の判定に任せる）。血縁・無関心は止める。恐怖などは HK.sexBlocked（noSex）が止める */
  function sexOk(ctx, a, b) {
    if (!a || !b || a === b) return false;
    if (ctx.pair && ctx.pair(a, b).kin) return false;
    if (HK.Ties && HK.Ties.apathy && (HK.Ties.apathy(ctx, a, b) || HK.Ties.apathy(ctx, b, a))) return false;
    if (HK.State && HK.State.pairSex && !HK.State.pairSex(a, b)) return false;
    /* 性欲「なし」の人は合意ありの場面に出さない（pos.js の HK.Pos.libNone） */
    if (HK.Pos && HK.Pos.libNone && HK.Pos.libNone([a, b])) return false;
    if (HK.sexBlocked && HK.sexBlocked(a, b)) return false;
    if (HK.ngSexPair && HK.ngSexPair(a, b)) return false;
    /* 避けている人（恐怖の二人の怖がっている側など。avoid-kit.js）を、攻めに固定されたまま迫る側にしない（受け攻めの向きが入れ替えられる組は HK.Pos.order が入れ替える。2026-11-03） */
    if (HK.Avoid && HK.Avoid.topOk && !HK.Avoid.topOk(ctx, a, b)) return false;
    return true;
  }
  /* 形：攻め a・受け b から（thick-sex.js と同じ決め方） */
  function shape(a, b) { var P = HK.Pos, fem = P && P.isF; return fem && fem(a) && fem(b) ? 'ff' : fem && fem(a) && !fem(b) ? 'fm' : 'mf'; }
  /* 表の行ごとの文：T[key][i] が { mf: [...], ff: [...], fm: [...] } か配列 */
  function text0(ctx, src, key, i, sh, fb, a, b) {
    var T = (src && src.TX ? src.TX() : {})[key], p = T && T[i];
    if (p && !Array.isArray(p) && typeof p === 'object') p = p[sh] || p.all;
    /* 部屋の文の絞り込み（新婚部屋なら家事をしない設定の人の家事・料理の文を外す HK.Shinkon.okText） */
    var okf = src && src.ok ? src.ok() : null;
    if (Array.isArray(p) && a && okf) p = p.filter(function (x) { return okf(ctx, x, a, b); });
    if (Array.isArray(p) && p.length) return pickOf(ctx, p);
    if (typeof p === 'string' && p) return p;
    return fb || '';
  }
  /* ---------- 文の予備（shinkon-r18-text.js が無い行のため。形ごとに 3 文以上） ---------- */
  var FB = {
    /* 男性向けの山場（中くらいの場面。{m} に受けの絶頂の喘ぎ。新婚部屋の shinkon-r18-more.js から移した） */
    peakE: {
      mf: L('ぱんっ、ぱんっと肌のぶつかる音が、寝室じゅうに響いた。{a}が奥を抉るように腰を打ちつけるたび、{b}の{ナカ}がきゅうっと吸いつく。{m}――{b}が背中をのけぞらせた瞬間、{a}も最奥に{精液}をどくどくと注ぎ込んだ。|{a}は{b}の脚を肩に担ぎ上げ、真上から深く突き下ろした。ぐちゅぐちゅと濡れた音が止まらず、{b}の目からは涙がこぼれる。{m}――びくびくと痙攣する{ナカ}に搾り取られて、{a}も奥で果てた。|{a}が{b}の腰をつかんで引き寄せると、{男性器}が一番奥をごりっと押し上げた。{b}の口からは、もう言葉にならない声しか出ない。{m}――{b}がシーツを握りしめて達するのと同時に、{a}の熱があふれ出した。'),
      ff: L('{a}の指が二本、{b}の{ナカ}の弱いところを容赦なく擦り上げた。くちゅくちゅという水音に、{b}の腰ががくがくと揺れる。{m}――{b}は{a}の腕にしがみついたまま、ぷしゅっと潮を噴いて果てた。|{a}は{b}の脚の間に顔を埋め、硬くなった芽を舌で何度も弾いた。同時に指を奥まで沈められて、{b}の太ももがぶるぶると震えだす。{m}――{b}の腰が跳ね上がり、{a}の舌の上でびくびくと痙攣した。|{a}は{b}の{乳首}を甘噛みしながら、指の動きをいっそう速めた。とろとろに溶けた{ナカ}が、{a}の指をきつく締めつけて離さない。{m}――{b}は全身を弓なりに反らして、長く長く達した。'),
      fm: L('{a}は{b}の胸に両手をついて、ぱちゅん、ぱちゅんと激しく腰を落とした。{a}の{ナカ}が{b}の{男性器}を根元まで呑み込み、きつく締め上げる。{m}――{b}が堪えきれずに果てると、{a}も腰を震わせながらそれを奥で受け止めた。|{a}は{b}の両手首をシーツに押しつけ、自分のいいところに当たるように腰を回した。上から見下ろされたまま責め立てられて、{b}の喉がひくひくと鳴る。{m}――{b}がびくんと跳ねて熱を吐き出し、{a}も満足げに背をそらした。|{a}が腰を浮かせては沈めるたび、ぬちゅっ、ぬちゅっと濡れた音が響いた。{b}の{男性器}は{a}の{ナカ}の中で限界まで張りつめている。{m}――{a}がぐっと深く腰を沈めた瞬間、{b}は{a}の名前を呼びながら果てた。')
    },
    lead: L('{who}の気持ちは、もう溢れそうだった。{trig}――それが、今夜の始まりになった。|一日の終わり、二人きりの部屋で、{trig}。{who}はもう、気持ちを隠すのをやめた。|{trig}。新婚の夜に、それを止める理由はどこにもなかった。'),
    short: {
      mf: L('{a}は{b}をベッドに横たえ、ゆっくりと服を脱がせていった。肌が重なるたびに、{b}の息が浅くなる。{a}が奥まで身を沈めると、{b}は{a}の背中にしがみついた。|{a}は{b}の脚の間に身を割り入れ、確かめるように何度もキスを落とした。{b}が小さくうなずくのを待って、{a}は{b}の{ナカ}へゆっくりと入っていった。二人の呼吸が、少しずつ同じ速さになった。|灯りを落とした寝室で、{a}は{b}を抱き寄せた。触れるたびに{b}の体が熱を帯びていく。重なり合ったまま、二人は短く、深く、互いを求めた。'),
      ff: L('{a}は{b}の胸元に唇を寄せ、指先で肌をなぞった。{b}の脚が震え、{a}の指が{女性器}を探り当てる。小さな声が、二人だけの部屋に何度もこぼれた。|{a}と{b}は向かい合って肌を重ね、指を絡めたまま口づけを繰り返した。{a}の指が{b}の{ナカ}を優しく撫でるたび、{b}の腰が浮く。最後は二人そろって、互いの名前を呼んだ。|{a}は{b}の{乳首}をそっと唇で挟み、もう片方の手で太ももの内側をなぞった。{b}が堪えきれずに{a}の髪を掴む。{a}は笑って、もっと深く{b}に触れた。'),
      fm: L('{a}は{b}の胸板に手をついて跨り、上からじっと見下ろした。{a}がゆっくり腰を沈めると、{b}の喉が鳴った。{a}は自分のいいところを探すように、少しずつ動きを速めた。|{a}は{b}をソファに押しつけ、その上に乗った。「動かないで｜動くな｜動かないでください」――{a}がそう囁くと、{b}は素直に目を閉じた。{a}の腰が揺れるたびに、二人の熱が重なっていく。|{a}は{b}の手首を軽く押さえ、唇で首筋をたどった。{b}の{男性器}が熱を帯びるのを確かめてから、{a}は自分からそれを受け入れた。')
    },
    /* 指を抜く一文（受けの反応の段で指が中にあるまま、次の段で繋がるとき） */
    fingerOut: L('{a}はゆっくりと指を引き抜き、濡れた指先で{b}の太ももをなぞった。|{a}が指をそっと抜くと、{b}の腰が名残惜しそうに揺れた。|{a}は指を引き抜いて、{b}の額に軽くキスを落とした。'),
    /* 山場（中くらいの場面）：{m} に受けの絶頂の喘ぎ（態度ごと）が入る */
    peak: {
      mf: L('{a}の動きが少しずつ速くなり、{b}は{a}の背中に爪を立てた。{m}――深く繋がったまま、二人はほとんど同時に果てた。|{b}の呼吸が細く途切れはじめた。{a}が最後に奥まで沈むと、{m}――{b}の体が大きく震え、{a}もそのまま熱を注いだ。|{a}は{b}の名前を何度も呼んだ。{m}――{b}がしがみつく腕に力がこもり、二人の熱が一つになって弾けた。'),
      ff: L('{a}の指が一番弱いところを捉えて離さなかった。{m}――{b}の背中が弓なりに反り、{a}はその体をしっかりと抱きとめた。|{b}の声がどんどん高くなっていく。{a}が唇と指で追い詰めると、{m}――{b}は{a}の肩に顔を埋めて、長く震えた。|{a}は{b}の脚を抱え込み、休む間を与えなかった。{m}――{b}の太ももが{a}の頬を挟んで、小刻みに震えた。'),
      fm: L('{a}は{b}の胸に手をついたまま、腰の動きを速めた。{m}――{a}が深く腰を沈めた瞬間、{b}もこらえきれずに果てた。|{b}の手が{a}の腰を掴む。{a}はその手に自分の手を重ね、最後まで自分の速さで揺れた。{m}――{b}の熱を奥で受け止めて、{a}は満ち足りた息をついた。|{a}が見下ろしたまま微笑むと、{b}の喉がひくりと鳴った。{m}――{a}がきつく締めつけると、{b}は{a}の名前を呼びながら果てた。')
    },
    after: L('事のあと、{b}は{a}の胸に頬を寄せたまま、しばらく動かなかった。|{a}は汗ばんだ{b}の前髪をそっとかき上げ、額にキスをした。|二人はシーツにくるまったまま、くすくすと笑い合った。'),
    witness: L('{w}がふと寝室の戸を開けると、{s}がひとりで体を慰めていた。{s}は息を呑んで固まり、{w}もまた、目を逸らせなかった。|帰りが早くなった{w}は、寝室から漏れる小さな声に足を止めた。そっと覗くと、{s}が{w}の名前を呼びながら、ひとりで熱を逃がしていた。|浴室の扉の向こうで、{s}が自分の体に触れていた。気づかれたと知って真っ赤になる{s}に、{w}は黙って近づいた。')
  };
  /* c が相手 o に向ける夜の態度（夜の性格で態度を選んでいればそれ、なければ気質の態度9種） */
  function att(c, o) { var A0 = HK.Attr; var v = A0 && A0.nightAtt ? A0.nightAtt(c, o) : ''; return v || per(c); }
  /* 夜の性格の一文と夜の主導の段（短い・中くらいの場面に差す。長い場面は本体の山場の組み立ての包み（attr-r18.js・pos-lead-r18.js・ero-initiative-r18.js）が入れる） */
  /* lo：{ jealous（攻めが妬いた夜＝攻めから）, leadB（受けの側のきっかけ＝受けから） }。夜の主導は傾向（本体の HK.SexFlow.leadTonight。設計は docs/reports/2026-11-03/sex-flow-design.md の 3） */
  function nightAdd(ctx, a, b, sh, ero, entry, lo) {
    var pk = HK.Ero && HK.Ero.freshPick ? HK.Ero.freshPick(ctx, null) : function (arr) { return pickOf(ctx, arr); };
    var t = HK.Attr && HK.Attr.nightText ? HK.Attr.nightText(a, b, sh, pk, ero) : '';
    var l = entry !== 'ini' && HK.PosLead && HK.PosLead.text ? HK.PosLead.text(a, b, sh, pk, lo || null) : '';
    return l + t;
  }
  /* 段落の一つ目（なければ一文目）のあとに差す */
  function insert1(text, ins) {
    if (!ins) return text;
    var i = text.indexOf('\n\n');
    if (i >= 0) return text.slice(0, i) + '\n\n' + ins + text.slice(i);
    var d = 0;
    for (var k = 0; k < text.length; k++) { var c = text.charAt(k); if (c === '「') d++; else if (c === '」') d = Math.max(0, d - 1); else if (!d && c === '。') return text.slice(0, k + 1) + ins + text.slice(k + 1); }
    return text + ins;
  }
  /* ---------- 場面の長さ（2026-11-03 利用者の指示「長さの偏りは直そう」「多めのときの長い場面は最初ではなく後のほうに」）----------
     ・描写の有無「ほのめかす」なら、いつも ほのめかす（本体の共通の設定と同じ読み方：行為は書かない）
     ・描写の長さ：段落分けして厚く＝長い 65%・中くらい 35%／混ぜる＝短い・中くらい・長い を 3 分の 1 ずつ／数行で短く＝いつも短い（2026-11-04 報告「短くなのに中くらいの場面」）
     ・エッチ多め：その遊びの最後のエッチ（回数の目安の最後、か最後の夜）を長い場面にする（「数行で短く」以外）。混ぜるときは、それより前は短い・中くらい
     ・性器なしの人がいる組は中くらいの場面が無いので短い場面に（男性向けも中くらいの場面がある） */
  function formOf(ctx, S, env, lv, nogen, last) {
    if (lv === 'low') return 'fade';
    var len = env.lewdLen === 'thick' || env.lewdLen === 'short' ? env.lewdLen : 'mix', hi = env.lewdN === 'high';
    var fin = S.sex + 1 >= S.lewdMax || last;
    if (hi && len !== 'short' && !S.longN && fin) return 'long';
    var W = len === 'thick' ? [['long', 0.65], ['mid', 0.35]] : len === 'short' ? [['short', 1]] : hi && !fin ? [['short', 0.5], ['mid', 0.5]] : [['short', 1], ['mid', 1], ['long', 1]];
    var f0 = HK.weighted(ctx.rng, W, function (x) { return x[1]; })[0];
    return f0 === 'mid' && nogen ? 'short' : f0;
  }
  /* 場面の本文：{ text（名前を当てたもの）, form } */
  function sceneText(ctx, S, env, a, b, sh, form, o, src) {
    var R = src.R, MO = src.MO, text = function (c, key, i, s2, f2, x, y) { return text0(c, src, key, i, s2, f2, x, y); };
    var pk = function (arr) { return pickOf(ctx, arr); }, high = o.lv === 'high', ero = o.ero, body, lo = { jealous: !!o.jealTop, leadB: !!o.leadB };
    var aft = text(ctx, 'AFTER', o.afi, sh, pickOf(ctx, FB.after), a, b);
    var openL = o.resume && MO().REOPEN ? MO().REOPEN : MO().OPEN || ['{a}は{b}を抱き寄せた。'];
    if (form === 'fade') body = pickOf(ctx, MO().FADE || FB.after);
    else if (form === 'long' && HK.ThickSex) {
      var st = HK.ThickSex.style(a), open = K ? K.mark(pickOf(ctx, openL)) : pickOf(ctx, openL);
      if (K) aft = K.mark(aft);
      var again = high && HK.ThickEro ? HK.ThickEro.again(ctx, pk, a, b, ero, false) + '\n\n' : '';
      var rr = ero ? HK.ThickEro.scene({ S: ctx, pick: pk, rng: ctx.rng, a: a, b: b, style: st, open: open, after: again + aft, jealous: o.jealTop, leadB: o.leadB })
        : HK.ThickSex.scene({ pick: pk, rng: ctx.rng, a: a, b: b, style: st, open: open, after: again + aft, ctx: ctx, jealous: o.jealTop, leadB: o.leadB });
      return { text: ctx.t(rr.text, a, b), form: form };
    } else if (form === 'short' && ero && HK.ThickEro && HK.ThickEro.short) {
      body = HK.ThickEro.short({ S: ctx, pick: pk, a: a, b: b, open: '', again: high, after: '' }).text;
      body = insert1(body, nightAdd(ctx, a, b, sh, true, o.entry, lo));
    } else {
      /* 邪魔が入ったあとの続き（resume）は、場所や状況の決まった種（脱衣所・ベランダなど）を使わず、寝室の続きの文に */
      body = o.resume ? pickOf(ctx, FB.short[sh]) : text(ctx, 'PLAY', o.pi, sh, pickOf(ctx, FB.short[sh]), a, b);
      if (o.nogen) { var ng = HK.NoGen.scene({ pick: pk, rng: ctx.rng, a: a, b: b, open: '', after: false }); body = ng && ng.text ? ng.text : body; form = 'short'; }
      if (form === 'mid') {
        var bt = J.pick(ctx, 'bottom', R.BOTTOM), tp = J.pick(ctx, 'top', R.TOP);
        var bx = text(ctx, 'BOTTOM', R.BOTTOM.indexOf(bt), sh, '{b}の' + bt.k + 'に触れると、' + bt.t.replace(/。$/, '') + '。', a, b);
        var tx = text(ctx, 'TOP', R.TOP.indexOf(tp), sh, '{a}は、' + tp.t.replace(/。$/, '') + '。', a, b);
        var T = HK.ThickSex, mo;
        if (HK.NovelMoan) HK.NovelMoan.top = a;
        /* 山場の喘ぎ（受けの態度ごと）：男性向けは ♡ や擬音の付く本体の男性向けの喘ぎ（HK.ThickEro.fill の {mb2}）と、男性向けの山場の文 */
        if (ero) mo = HK.ThickEro.fill(ctx, '{mb2}', a, b);
        else mo = T && T.moan ? T.moan(pk, b, true, ctx.rng) : '';
        var pkl = ero && MO().PEAK_E ? MO().PEAK_E[sh] : null, PP = HK.Pos;
        /* 男性器の無い人（性器の指定）には、男性器・精液の文を使わない */
        if (pkl && PP && PP.hasM && ((sh === 'mf' && !PP.hasM(a)) || (sh === 'fm' && !PP.hasM(b)))) pkl = pkl.filter(function (x) { return !/\{(?:男性器|精液)\}/.test(x); });
        if (pkl && !pkl.length) pkl = null;
        var peak = (pkl ? fresh(ctx, pkl) : text(ctx, 'PEAK', 0, sh, fresh(ctx, FB.peak[sh]))).replace('{m}', mo ? '{b}「' + String(mo).replace(/^「|」$/g, '') + '」' : '');
        var fo = T && T.fingerOut ? T.fingerOut(bx, body, sh, false) : '';
        if (!fo && sh !== 'ff' && /指/.test(bx) && /沈め|入れ|入って|入ってる|中を|ナカ|何本/.test(bx) && !/指を(?:抜|引き抜)/.test(bx + body)) fo = pickOf(ctx, FB.fingerOut);
        body = bx + (fo ? fo : '') + '\n\n' + body + '\n\n' + peak + '\n\n' + tx;
      }
      if (!o.nogen) body = insert1(body, nightAdd(ctx, a, b, sh, ero, o.entry, lo));
      /* 濃い：もう一度（短い版の一文は形を問わない書き方なので、女性どうしは段落の版にする） */
      if (high && HK.ThickEro) body += '\n\n' + HK.ThickEro.again(ctx, pk, a, b, ero && form === 'mid', form === 'short' && sh !== 'ff');
    }
    body = flowFix(body, a, b, sh, aft);
    return { text: mk(ctx, body + (aft ? '\n\n' + aft : ''), a, b), form: form };
  }
  /* 短い・中くらいの場面も本体の流れの管理（HK.SexFlow.fix：段階の逆戻り・体位の矛盾・二度出しを直す）に通す（2026-11-04 報告「挿入後に服を脱がせる」「入れる前に抜く」） */
  function flowFix(body, a, b, sh, aft) {
    var F = HK.SexFlow; if (!F || !F.fix || !body) return body;
    try { var r = F.fix(body, { a: a, b: b, mode: sh, after: aft || '' }); return r && typeof r.text === 'string' && r.text ? r.text : body; } catch (e) { return body; }
  }
  HK.PairR18 = { flowFix: flowFix, sexOk: sexOk, shape: shape, text: text0, att: att, nightAdd: nightAdd, insert1: insert1, formOf: formOf, scene: sceneText, FB: FB, pickOf: pickOf, mk: mk };
})();
/* r18:end */
