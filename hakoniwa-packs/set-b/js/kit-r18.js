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
     ・部屋専用の段（2026-11-05。遊んで確かめた報告 3 回目「3 部屋に共通する文が場面の 4 割強」）：PR.addMid(部屋の id, 文の表)・PR.addEnd・PR.addOpen・PR.addFore・PR.addInsert・PR.addPeak・PR.addPeakE・PR.addAgain
       （まとめて PR.addRoom(部屋の id, { open, fore, insert, mid, peak, peakE, end, again, ok })）。部屋の段がそろっていれば、中くらい・長い場面は部屋の段だけで組み（PR.compose）、
       共通の段（本体の HK.ThickSex・HK.ThickEro・下の FB）は補い。重みは最中の一幕の数で決まる（12 本以上で 95%。PR.roomW）。一回の遊びで同じ段落は二度出さない（ctx._pkLru。PR.lru）。
       書き方と決まりは hakoniwa-packs/README.md の「部屋専用の段」
   体の語は印（{男性器} など）。登場人物はすべて成人として扱う */
(function () {
  'use strict';
  var HK = window.HK;
  if (!HK || !HK.Journal) return;
  var J = HK.Journal, K = HK.PairKit, PR0 = {};
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
      fm: L('{a}は{b}の{男性器}を握りこみ、濡れた先を親指でぐりぐりと責め立てた。同時に後ろへ沈めた指で奥の一点を押し上げられて、{b}の腰ががくがくと跳ねる。{m}――{b}は{a}の手の中で、どくどくと熱を吐き出した。|{a}は{b}の両手首をシーツに押しつけたまま、もう片方の手で{男性器}を根元から容赦なくしごき上げた。上から見下ろされたまま責め立てられて、{b}の喉がひくひくと鳴る。{m}――{b}がびくんと跳ねて果てると、{a}は満足げに目を細めた。|{a}が指を曲げて奥を押し上げるたび、ぬちゅっ、ぬちゅっと濡れた音が響いた。{b}の{男性器}は{a}の手の中で限界まで張りつめている。{m}――{a}がひときわ強く握りこんだ瞬間、{b}は{a}の名前を呼びながら果てた。')
    },
    lead: L('{who}の気持ちは、もう溢れそうだった。{trig}――それが、今夜の始まりになった。|一日の終わり、二人きりの部屋で、{trig}。{who}はもう、気持ちを隠すのをやめた。|{trig}。新婚の夜に、それを止める理由はどこにもなかった。'),
    short: {
      mf: L('{a}は{b}をベッドに横たえ、ゆっくりと服を脱がせていった。肌が重なるたびに、{b}の息が浅くなる。{a}が奥まで身を沈めると、{b}は{a}の背中にしがみついた。|{a}は{b}の脚の間に身を割り入れ、確かめるように何度もキスを落とした。{b}が小さくうなずくのを待って、{a}は{b}の{ナカ}へゆっくりと入っていった。二人の呼吸が、少しずつ同じ速さになった。|灯りを落とした寝室で、{a}は{b}を抱き寄せた。触れるたびに{b}の体が熱を帯びていく。重なり合ったまま、二人は短く、深く、互いを求めた。'),
      ff: L('{a}は{b}の胸元に唇を寄せ、指先で肌をなぞった。{b}の脚が震え、{a}の指が{女性器}を探り当てる。小さな声が、二人だけの部屋に何度もこぼれた。|{a}と{b}は向かい合って肌を重ね、指を絡めたまま口づけを繰り返した。{a}の指が{b}の{ナカ}を優しく撫でるたび、{b}の腰が浮く。最後は二人そろって、互いの名前を呼んだ。|{a}は{b}の{乳首}をそっと唇で挟み、もう片方の手で太ももの内側をなぞった。{b}が堪えきれずに{a}の髪を掴む。{a}は笑って、もっと深く{b}に触れた。'),
      fm: L('{a}は{b}をベッドに仰向けにさせ、その脚のあいだに膝をついた。{a}の手が{b}の{男性器}を包むと、{b}の喉が鳴った。{a}は{b}の顔を見つめたまま、少しずつ手の動きを速めた。|{a}は{b}をソファに押しつけ、その胸に手をついた。「動かないで｜動くな｜動かないでください」――{a}がそう囁くと、{b}は素直に目を閉じた。{a}の指が奥を探るたびに、{b}の腰が浮いた。|{a}は{b}の手首を軽く押さえ、唇で首筋をたどった。{b}の{男性器}が熱を帯びるのを確かめてから、{a}は濡らした指をゆっくりと{b}の奥へ沈めていった。')
    },
    /* 指を抜く一文（受けの反応の段で指が中にあるまま、次の段で繋がるとき） */
    fingerOut: L('{a}はゆっくりと指を引き抜き、濡れた指先で{b}の太ももをなぞった。|{a}が指をそっと抜くと、{b}の腰が名残惜しそうに揺れた。|{a}は指を引き抜いて、{b}の額に軽くキスを落とした。'),
    /* 山場（中くらいの場面）：{m} に受けの絶頂の喘ぎ（態度ごと）が入る */
    peak: {
      mf: L('{a}の動きが少しずつ速くなり、{b}は{a}の背中に爪を立てた。{m}――深く繋がったまま、二人はほとんど同時に果てた。|{b}の呼吸が細く途切れはじめた。{a}が最後に奥まで沈むと、{m}――{b}の体が大きく震え、{a}もそのまま熱を注いだ。|{a}は{b}の名前を何度も呼んだ。{m}――{b}がしがみつく腕に力がこもり、二人の熱が一つになって弾けた。'),
      ff: L('{a}の指が一番弱いところを捉えて離さなかった。{m}――{b}の背中が弓なりに反り、{a}はその体をしっかりと抱きとめた。|{b}の声がどんどん高くなっていく。{a}が唇と指で追い詰めると、{m}――{b}は{a}の肩に顔を埋めて、長く震えた。|{a}は{b}の脚を抱え込み、休む間を与えなかった。{m}――{b}の太ももが{a}の頬を挟んで、小刻みに震えた。'),
      fm: L('{a}は{b}の胸に手をついたまま、手の動きを速めた。{m}――{a}が指で奥を押し上げた瞬間、{b}もこらえきれずに果てた。|{b}の手が{a}の手首を掴む。{a}はその手を振りほどかずに、最後まで自分の速さで{b}を追いつめた。{m}――{b}の熱を手のひらで受け止めて、{a}は満ち足りた息をついた。|{a}が見下ろしたまま微笑むと、{b}の喉がひくりと鳴った。{m}――{a}がきつく握りこむと、{b}は{a}の名前を呼んで果てた。')
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
  /* 寝床の場面に、立ったまま・壁際・抱え上げたままの一文（本体の型の体位の一文）を差さない（2026-11-05 通し読み：布団の場面に「寝床まで辿り着く余裕もなかった」「壁に押しつけられた跡」） */
  var STAND_INS = /寝床まで辿り着く|壁に押しつけられた|立ったまま|爪先立ち|宙に浮いたまま|抱え上げたまま|壁際で/, BED_BODY = /ベッド|布団|シーツ|寝床|枕/;
  function insert1(text, ins) {
    if (ins && STAND_INS.test(ins) && BED_BODY.test(text || '')) ins = ins.split(/(?<=。)/).filter(function (x) { return !STAND_INS.test(x); }).join('');
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
    /* 一回の遊びで同じ段落を二度出さない（本体の HK.Ero.freshPick。2026-11-05 報告「男性向けの同じ段落が同じ回の別の夜に再登場」） */
    var pk0 = function (arr) { return pickOf(ctx, arr); }, pk = HK.Ero && HK.Ero.freshPick ? HK.Ero.freshPick(ctx, pk0) : pk0;
    var high = o.lv === 'high', ero = o.ero, body, lo = { jealous: !!o.jealTop, leadB: !!o.leadB };
    /* 描写の長さ「数行で短く」：もう一度の段は付けず、一つの段落にまとめる（2026-11-05 報告「数行で短くなのに 5 段落」） */
    var oneP = env.lewdLen === 'short';
    if (oneP) high = false;
    var aft = text(ctx, 'AFTER', o.afi, sh, pickOf(ctx, FB.after), a, b);
    /* 部屋専用の段（PR.addRoom など）がそろっていれば、中くらい・長い場面は部屋の段で組む（共通の段は補い） */
    var rid = roomOf(ctx), rw = (form === 'long' || form === 'mid') && !o.nogen && !o.noRoom && bodyFits(sh, a, b) ? roomW(rid, sh, ero) : 0;
    if (rw > 0 && ctx.rng() < rw) {
      var cb = compose(ctx, S, env, a, b, sh, form, { ero: ero, lv: o.lv, entry: o.entry, jealTop: o.jealTop, leadB: o.leadB, open: o.open || (o.resume && MO().REOPEN ? pickOf(ctx, MO().REOPEN) : '') }, rid);
      if (cb) { var cb0 = cb; cb = flowFix(cb, a, b, sh, aft, { ctx: ctx }); if (PR0.trace) PR0.trace.push({ text: cb, raw: cb0, a: a, b: b, sh: sh, after: aft, room: rid }); return { text: mk(ctx, cb + (aft ? '\n\n' + aft : ''), a, b), form: form, room: true }; }
    }
    var openL = o.resume && MO().REOPEN ? MO().REOPEN : MO().OPEN || ['{a}は{b}を抱き寄せた。'];
    if (form === 'fade') body = pickOf(ctx, MO().FADE || FB.after);
    else if (form === 'long' && HK.ThickSex) {
      var st = HK.ThickSex.style(a), open = K ? K.mark(pickOf(ctx, openL)) : pickOf(ctx, openL);
      if (K) aft = K.mark(aft);
      var again = high && HK.ThickEro ? HK.ThickEro.again(ctx, pk, a, b, ero, false) + '\n\n' : '';
      /* 恋人・夫婦の二人は rel: 'lover'（本体の色の台詞・返事が「今夜だけ」を出さない。2026-11-05 報告「夫婦で今夜だけ」） */
      var cpl = !!((ctx.pair && ctx.pair(a, b).couple) || (ctx.sk && (ctx.sk.wed || ctx.sk.love)) || o.couple), rel = cpl ? 'lover' : undefined;
      var rr = ero ? HK.ThickEro.scene({ S: ctx, pick: pk, rng: ctx.rng, a: a, b: b, style: st, open: open, after: again + aft, jealous: o.jealTop, leadB: o.leadB, rel: rel })
        : HK.ThickSex.scene({ pick: pk, rng: ctx.rng, a: a, b: b, style: st, open: open, after: again + aft, ctx: ctx, jealous: o.jealTop, leadB: o.leadB, rel: rel });
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
    body = flowFix(body, a, b, sh, aft, { ctx: ctx, short: form === 'short' });
    if (oneP) return { text: mk(ctx, (body + (aft ? '\n\n' + aft : '')).replace(/\n\n+/g, ''), a, b), form: form };
    return { text: mk(ctx, body + (aft ? '\n\n' + aft : ''), a, b), form: form };
  }
  /* 短い・中くらいの場面も本体の流れの管理（HK.SexFlow.fix：段階の逆戻り・体位の矛盾・二度出しを直す）に通す（2026-11-04 報告「挿入後に服を脱がせる」「入れる前に抜く」） */
  /* opt（2026-11-05）：{ ctx, short }。流れの管理が山場の前に足す追い上げの段（本体の HK.SexFlowText.BUILD。3 部屋で同じ段落になる）は、
     部屋の最中の一幕があればそれに置き換え、短い場面（short）では外す */
  function flowFix(body, a, b, sh, aft, opt) {
    var F = HK.SexFlow; if (!F || !F.fix || !body) return body;
    var t;
    try { var r = F.fix(body, { a: a, b: b, mode: sh, after: aft || '' }); t = r && typeof r.text === 'string' && r.text ? r.text : body; } catch (e) { return body; }
    if (!opt || t === body) return t;
    var BU = ((HK.SexFlowText || {}).BUILD || {})[sh === 'ff' || sh === 'fm' ? sh : 'mf'] || [];
    if (!BU.length) return t;
    var nm = function (x) { return String(x).split('{a}').join(a.name).split('{b}').join(b.name); };
    var ctx = opt.ctx, rid = ctx ? roomOf(ctx) : '', TS = HK.ThickSex;
    /* 追い上げの段の頭の一文で見分ける（流れの管理が段落に喘ぎなどを足していても見つかるように） */
    var heads = []; BU.forEach(function (x) { var h = String(x).split('。')[0]; if (h.length >= 10) heads.push(h, nm(h)); });
    var isB = function (p) { return heads.some(function (h) { return p.indexOf(h) >= 0; }); };
    return t.split('\n\n').map(function (p) {
      if (!isB(p)) return p;
      if (opt.short) return null;
      var m = ctx && bodyFits(sh, a, b) ? part(ctx, rid, 'mid', sh, a, b) : '';
      if (!m) return p;
      var mo = TS && TS.moan ? String(TS.moan(function (l) { return pickOf(ctx, l); }, b, false, ctx.rng)) : '';
      return m.replace(/\{mm\}/g, mo ? '{b}「' + mo.replace(/^「|」$/g, '') + '」' : '');
    }).filter(function (p) { return p != null; }).join('\n\n');
  }
  /* ---------- 部屋専用の段（2026-11-05） ----------
     表の形：文字列（三つの組で使える文）、{ mf: [...], ff: [...], fm: [...], all: [...], when(ctx, a, b, sh) }、{ t, sh, when } の配列か、{ mf, ff, fm, all } の一つ。
     段の役割（sex-flow の段階に合わせる）：
       open（書き出し。寝床へ向かう・口づけ。挿入・山場なし）／fore（前戯。挿入なし）／insert（繋がる段。mf＝{男性器}で、ff＝指で、fm＝指と手（まれにペニバン））／
       mid（最中の一幕。山場・脱がせる・体位を変える動きは書かない。{mm} に受けの喘ぎ）／peak（山場。{m} に受けの絶頂の喘ぎ）／peakE（男性向けの山場。2 文以上）／
       end（終わり方：果てたあとの一幕。体位の言い回し・挿入は書かない）／again（濃いときのもう一度）
     ok(ctx, t, a, b)：部屋の文の絞り込み（家事をしない人の家事の文・住まいに合わない文を外す） */
  var ROOMS = PR0.ROOMS = {}, KINDS = ['open', 'fore', 'insert', 'mid', 'peak', 'peakE', 'end', 'again'];
  function normList(list) {
    var out = [];
    var push = function (t, sh, when) { if (typeof t === 'string' && t) out.push({ t: t, sh: sh || 'all', when: when || null }); };
    (Array.isArray(list) ? list : [list]).forEach(function (x) {
      if (!x) return;
      if (typeof x === 'string') return push(x, 'all');
      if (typeof x.t === 'string') return push(x.t, x.sh, x.when);
      ['mf', 'ff', 'fm', 'all'].forEach(function (k) { (x[k] || []).forEach(function (t) { push(t, k, x.when); }); });
    });
    return out;
  }
  function roomRec(id) { return ROOMS[id] || (ROOMS[id] = { ok: null, w: 0.95 }); }
  function addPart(id, kind, list) {
    if (!id || KINDS.indexOf(kind) < 0) return;
    var r = roomRec(id), l = r[kind] || (r[kind] = []), have = {};
    l.forEach(function (x) { have[x.sh + '|' + x.t] = 1; });
    normList(list).forEach(function (x) { if (!have[x.sh + '|' + x.t]) { have[x.sh + '|' + x.t] = 1; l.push(x); } });
  }
  function addRoom(id, def) {
    if (!id || !def) return;
    var r = roomRec(id);
    if (typeof def.ok === 'function') r.ok = def.ok;
    if (def.w != null) r.w = +def.w;
    if (def.spot) r.spot = def.spot;
    KINDS.forEach(function (k) { if (def[k]) addPart(id, k, def[k]); });
  }
  /* 今の遊びの部屋の id */
  function roomOf(ctx) {
    if (ctx && ctx.input && ctx.input.scenId) return ctx.input.scenId;
    if (HK.Play && HK.Play.scenIdOf) return HK.Play.scenIdOf({ ctx: ctx });
    return '';
  }
  /* 一回の遊びで、いちばん前に使った（まだ使っていない）文から選ぶ（本体の S._pkLru と同じ型。ctx に持つ） */
  function lru(ctx, arr) {
    if (!arr || !arr.length) return '';
    var m = ctx._pkLru = ctx._pkLru || { n: 0, at: {} }, best = [], bv = Infinity;
    for (var i = 0; i < arr.length; i++) { var v = m.at['$' + arr[i]] || 0; if (v < bv) { bv = v; best = [arr[i]]; } else if (v === bv) best.push(arr[i]); }
    var x = best[Math.floor(ctx.rng() * best.length)];
    m.at['$' + x] = ++m.n;
    return x;
  }
  function cands(ctx, id, kind, sh, a, b) {
    var r = ROOMS[id]; if (!r || !r[kind]) return [];
    var bM = !!(b && HK.Pos && HK.Pos.hasM && HK.Pos.hasM(b));
    return r[kind].filter(function (x) {
      if (x.sh !== 'all' && x.sh !== sh) return false;
      try { if (x.when && !x.when(ctx, a, b, sh)) return false; if (r.ok && a && !r.ok(ctx, x.t, a, b)) return false; } catch (e) { return false; }
      /* 体の語：受けに男性器があれば女性器の語の文を、なければ受けの男性器の文を使わない（男性どうしは mf の文から） */
      if (bM && BODY_F.test(x.t)) return false;
      if (!bM && /\{b\}の(?:[^。、{]{0,4})\{(?:男性器|先走り|亀頭)\}/.test(x.t)) return false;
      return true;
    }).map(function (x) { return x.t; });
  }
  /* 部屋の段を一つ（無ければ ''）。avoid：同じ場面ですでに使った文 */
  function part(ctx, id, kind, sh, a, b, avoid) {
    var l = cands(ctx, id, kind, sh, a, b);
    if (avoid) { var l2 = l.filter(function (t) { return avoid.indexOf(t) < 0; }); if (l2.length) l = l2; }
    return lru(ctx, l);
  }
  var BODY_F = /\{(?:女性器|陰核|愛液)\}|潮を/;
  var REAR = /うつ伏せ|四つん這い|後ろから|背後から|背中から/, REAR_NG = /見つめ|目を合わせ|目が合|額|唇を重ね|顔を(?:見|のぞ|覗)|見下ろ|見上げ|頬を|胸に頬|脚を絡め|首に(?:腕|しがみ)/;
  function count(id, kind, sh) { var r = ROOMS[id]; return r && r[kind] ? r[kind].filter(function (x) { return x.sh === 'all' || x.sh === sh; }).length : 0; }
  /* 部屋の段で組む割合：段がそろっていて、最中の一幕が 12 本以上なら部屋の重み（既定 95%）。少なければ本数に比例 */
  function roomW(id, sh, ero) {
    var r = ROOMS[id]; if (!r) return 0;
    var need = ['open', 'fore', 'insert', 'mid', 'end', ero ? 'peakE' : 'peak'];
    if (need.some(function (k) { return !count(id, k, sh); })) return 0;
    return Math.min(1, count(id, 'mid', sh) / 12) * (r.w != null ? r.w : 0.95);
  }
  /* 体の組が形に合うときだけ（フタナリ・性器の指定で形と体が食い違う組は共通の組み立て） */
  function bodyFits(sh, a, b) {
    var P = HK.Pos, hm = P && P.hasM; if (!hm) return true;
    return sh === 'mf' ? hm(a) : sh === 'ff' ? !hm(a) && !hm(b) : sh === 'fm' ? !hm(a) && hm(b) : false;
  }
  /* 部屋の段だけで組む中くらい・長い場面の本文（名前は {a}{b} のまま）。組めなければ '' */
  function compose(ctx, S, env, a, b, sh, form, o, id) {
    var ero = !!o.ero, T = HK.ThickSex, pk = function (arr) { return pickOf(ctx, arr); }, used = [];
    /* 後ろからの体位の繋がる段のあとは、顔を合わせる文を使わない（sex-flow の (k)） */
    var rear = false;
    var P1 = function (kind) {
      var l0 = cands(ctx, id, kind, sh, a, b), l = l0.filter(function (t) { return used.indexOf(t) < 0 && !(rear && REAR_NG.test(t)); });
      if (!l.length) l = l0.filter(function (t) { return !(rear && REAR_NG.test(t)); });
      var t = lru(ctx, l); if (t) used.push(t);
      if (kind === 'insert' && REAR.test(t)) rear = true;
      return t;
    };
    var moan = function (cl) {
      if (ero && HK.ThickEro && HK.ThickEro.fill) return String(HK.ThickEro.fill(ctx, cl ? '{mb2}' : '{mb1}', a, b));
      return T && T.moan ? String(T.moan(pk, b, cl, ctx.rng)) : '';
    };
    /* 女性の受けに、舌打ち・命令の荒い声を出さない（2026-11-05 報告「強気の女性が『……ちっ。好きにしろよ』」） */
    var fB = !!(HK.Pos && HK.Pos.isF && HK.Pos.isF(b)), ROUGH = /ちっ|しろよ|しやがれ|てめえ|んじゃねえ/;
    var tryM = function (f) { var m = ''; for (var i = 0; i < 6; i++) { m = f(); if (!fB || !ROUGH.test(m)) return m; } return fB && ROUGH.test(m) ? '' : m; };
    var say0 = function () {
      var m = tryM(function () { return ero && HK.ThickEro && HK.ThickEro.fill ? String(HK.ThickEro.fill(ctx, '{mb0}', a, b)) : T && T.moan0 ? String(T.moan0(pk, b, ctx.rng)) : ''; });
      return m ? '{b}「' + m.replace(/^「|」$/g, '') + '」' : '';
    };
    var say = function (cl) { var m = tryM(function () { return moan(cl); }); return m ? '{b}「' + m.replace(/^「|」$/g, '') + '」' : ''; };
    if (HK.NovelMoan) HK.NovelMoan.top = a;
    var long = form === 'long', thick = env.lewdLen === 'thick';
    var ps = [];
    if (long || o.open) ps.push(o.open || P1('open'));
    ps.push(P1('fore'));
    if (long && (thick || ctx.rng() < 0.5)) { var f2 = P1('fore'); if (f2) ps.push(f2); }
    ps.push(P1('insert'));
    /* 最中の一幕：中くらいは 2、長いは 2〜3（流れの管理の性感が山場の前に閾値に届く数。届かないと共通の追い上げの段が入る） */
    var nMid = long && thick ? 3 : 2;
    for (var i = 0; i < nMid; i++) { var m0 = P1('mid'); if (m0) ps.push(m0); }
    var pkT = P1(ero ? 'peakE' : 'peak'); ps.push(pkT);
    /* 濃いときのもう一度は、終わり方（眠る・体を拭く）の前に */
    if (o.lv === 'high') { var ag = P1('again'); ps.push(ag || (HK.ThickEro ? HK.ThickEro.again(ctx, pk, a, b, ero, false) : '') || '{a}と{b}は、もう一度だけ互いを求め合った。'); }
    ps.push(P1('end'));
    if (ps.some(function (x) { return !x; })) return '';
    var body = ps.join('\n\n').replace(/\{mm\}/g, function () { return say(false); }).replace(/\{m0\}/g, function () { return say0(); });
    body = body.replace('{m}', say(true)).replace(/\{m\}/g, '');
    if (ero && HK.ThickEro && HK.ThickEro.fill) body = HK.ThickEro.fill(ctx, body, a, b);
    /* 夜の性格の一文と夜の主導の段（受けから始める夜など）は、書き出しのあとに */
    /* 本体の型の体位の一文（HK.Play の shortLine）は、部屋の段の体位と食い違うので足さない */
    var PL = HK.Play, off0 = PL ? PL.off : null, na;
    if (PL) PL.off = true;
    try { na = nightAdd(ctx, a, b, sh, ero, o.entry, { jealous: !!o.jealTop, leadB: !!o.leadB }); } finally { if (PL) PL.off = off0; }
    body = insert1(body, na);
    return body;
  }
  PR0.addRoom = addRoom; PR0.addPart = addPart; PR0.roomOf = roomOf; PR0.lru = lru; PR0.part = part; PR0.roomW = roomW; PR0.compose = compose; PR0.bodyFits = bodyFits; PR0.count = count;
  KINDS.forEach(function (k) { PR0['add' + k.charAt(0).toUpperCase() + k.slice(1)] = function (id, list) { addPart(id, k, list); }; });
  /* 場面の場所（2026-11-05 通し読み：看病の布団の場面に、本体の型の一文「寝床まで辿り着く余裕もなかった」が差さった）：
     o.spot か部屋の既定の場所（PR.addRoom の spot。文字列か (ctx, o) を返す関数）を、場面を組むあいだだけ本体の HK.SexSpot.cur に置く
     （本体の型の一文 HK.Play.shortLine と、本体の組み立ての候補が場所に合わないものを外す。すでに置かれていれば上書きしない） */
  function sceneAt(ctx, S, env, a, b, sh, form, o, src) {
    var SP = HK.SexSpot, r = ROOMS[roomOf(ctx)], sp = (o && o.spot) || (r && (typeof r.spot === 'function' ? r.spot(ctx, o || {}) : r.spot)) || '';
    if (!SP || !sp || SP.cur) return sceneText(ctx, S, env, a, b, sh, form, o, src);
    SP.cur = sp;
    try { return sceneText(ctx, S, env, a, b, sh, form, o, src); } finally { SP.cur = null; }
  }
  HK.PairR18 = PR0; Object.assign(PR0, { flowFix: flowFix, sexOk: sexOk, shape: shape, text: text0, att: att, nightAdd: nightAdd, insert1: insert1, formOf: formOf, scene: sceneAt, FB: FB, pickOf: pickOf, mk: mk });
})();
/* r18:end */
