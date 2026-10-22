/* 箱庭シミュレーター: R18版の山場（小説調）を段落に分けて厚くする ― 共通の組み立て（HK.TKC）とオメガバース（R18版のみ）
   ■ 山場（本番・絶頂）だけ、400字前後・段落（\n\n）区切りで書く。前後の小さな場面は元のまま
   ■ 組み立て：書き出し → 最中（短い台詞と地の文を交互に）→ 頂（受ける側の声は HK.Voice の性格別の台詞）→ 余韻
     攻める側のいちばん強い因子（CP・NP・A・FC・AC）で書き分ける。女性が攻めで男性が受けなら「跨って主導権を握る」形、女性どうしは指と舌
   ■ 攻め側が嗜虐的（HK.Ero.sadist）なら、ときどき乱暴な抱き方（激しく打ちつける・髪を掴む・強く腰を掴む）に。首を押さえる・縛るは使わない
   ■ 受け攻めの指定：攻めを選んだ人は必ず攻める側（HK.Pos.order）。受ける側が攻め指定になる組み合わせでは使わない
   ■ 余韻は場面の元の文（事後）を使うときは noAfter で省く
   ■ 描写の濃さが「ぼかす／朝チュン」のとき、全年齢版（HK.SAFE_ON）では使わない。登場人物はすべて成人として扱う
   差し込み：{T}=攻める側 {U}=受ける側 {bed}=寝床の言い方 {edge}{climax}=受ける側の声 */
(function () {
  'use strict';
  var HK = window.HK;
  if (!HK) return;
  function L(s) { return s.split('|'); }

  var CORE = {
    CP: {
      open: L('{T}は{U}を{bed}に押し倒し、肩を押さえつけたまま覆いかぶさった。首筋に歯を立てられて、{U}の喉がひくりと鳴った。|{T}は短く「脱げ」と言い、{U}が従うのを黙って見下ろしていた。最後の一枚が落ちると、{T}は{U}の顎を掴んで上を向かせた。'),
      mid: L('{T}「目、逸らすな」\n\n入口をなぞられるだけで、{U}の腰が勝手に浮く。{T}は低く笑い、一息に奥まで沈めた。\n\n{edge}|{T}「欲しいなら、そう言え」\n\n{edge}\n\n言い終わる前に、{T}は{U}の脚を割り開いて、深く押し入った。'),
      peak: L('奥の一点を正確に抉られるたび、{U}の爪先が{bed}を掻く。{T}は{U}の顔から目を離さなかった。\n\n{T}「俺のことだけ考えてればいい」\n\n最奥に押しつけられたまま熱が弾け、{U}は背を反らせて達した。{climax}|容赦のない律動に、{U}の声が細く裏返っていく。{T}は逃げる腰を引き戻し、いちばん深いところで果てた。{climax}'),
      after: L('{T}はしばらく{U}の中から出ていかなかった。汗で貼りついた前髪を払い、額に一度だけ口づける。命令ばかりの声が、そのときだけ少し掠れていた。|{T}「……やりすぎたか」――そう言いながら、{T}は{U}を腕の中から離さなかった。')
    },
    NP: {
      open: L('{T}は{U}を抱き寄せ、額に、瞼に、頬にと、ゆっくり唇を落としていった。{U}の肩から力が抜けていくのを、{T}は指先で確かめていた。|{T}は{U}の服を一枚ずつ、確かめるように脱がせていった。肌が触れるたびに、{U}の息が浅くなる。'),
      mid: L('{T}「痛かったら、すぐ言って」\n\n時間をかけて解されたそこへ、{T}はゆっくりと入っていった。浅いところで止まり、{U}の呼吸が落ち着くのを待ってから、また少しだけ奥へ。\n\n{edge}|{T}「大丈夫。ちゃんと見てるから」\n\n{edge}\n\n{T}は{U}の指に自分の指を絡め、とろけるように深く繋がった。'),
      peak: L('優しいのに、逃げ場がない。いちばん弱いところを同じ深さで何度も撫でられて、{U}の目尻から涙がこぼれた。{T}はそれを唇で拭った。\n\n二人の呼吸が重なった瞬間、{U}は{T}にしがみついて達した。{climax}――少し遅れて、{T}も奥で静かに果てた。'),
      after: L('{T}は{U}の汗を拭き、乱れた髪を撫でつけた。{T}「よく頑張ったね」――{U}は返事の代わりに、{T}の胸に顔を埋めた。|{T}は{U}を抱いたまま、眠りに落ちるまで背中を撫で続けていた。')
    },
    A: {
      open: L('{T}は{U}の首筋から鎖骨、脇腹へと、確かめるように指を滑らせた。どこで息が詰まり、どこで肌が粟立つか。{T}は一つも見逃さなかった。'),
      mid: L('{T}「ここか」\n\n独り言のような声と一緒に、{T}は{U}の中へ沈んだ。角度を少しずつ変え、三度目で{U}の腰が跳ねたのを、表情一つ変えずに覚えた。\n\n{edge}|{T}「声、我慢しなくていい。そのほうが分かりやすい」\n\n{edge}'),
      peak: L('そこからは、見つけた一点だけだった。浅く、深く、正確に同じ場所を抉られて、{U}の思考がほどけていく。\n\n{U}が名前を呼んだ瞬間、{T}の律動が初めて乱れた。{climax}――二人はほとんど同時に、奥で熱を弾けさせた。'),
      after: L('{T}は息を整えながら、{U}の手首で脈を測った。{T}「……速いな」――自分の鼓動のほうが速いことに、{T}は気づかないふりをした。')
    },
    FC: {
      open: L('{T}は{U}をくすぐって押し倒し、笑い声ごと唇で塞いだ。絡まった服に二人で笑い、笑いながらまた唇を重ねた。'),
      mid: L('{T}「ね、ここ好き？　こっちは？」\n\n{T}は口づけては反応を確かめ、嬉しそうに目を細めた。やがて{T}が中へ入ってくると、笑い声は甘い吐息に変わった。\n\n{edge}|{T}「かわいい。もっと聞かせて」\n\n{edge}'),
      peak: L('向かい合っては口づけ、後ろから抱きしめては耳を噛む。揺さぶられるたびに{bed}が軋み、二人の汗が混ざった。\n\n{T}「一緒にいこ」\n\n深く打ちつけられた瞬間、{U}は{T}の背中に爪を立てて達した。{climax}――{T}も{U}を抱きしめたまま果てた。'),
      after: L('{T}は{U}の上に倒れ込んだまま笑っていた。{T}「すっごかった」――{U}は呆れたように笑って、{T}の背中を撫でた。')
    },
    AC: {
      open: L('{T}は「いい？」と何度も訊いてから、ようやく{U}の服に手をかけた。ボタンを外す指が震えている。{U}がその手を取って胸に当てると、{T}は息を呑んだ。'),
      mid: L('{T}「痛くない……？」\n\nおそるおそる押し入ってくる熱は、震えるほど慎重だった。{U}が腰を引き寄せてやると、{T}は小さく声を漏らして、それきり止まれなくなった。\n\n{edge}'),
      peak: L('遠慮がちだった動きは、いつの間にか夢中な律動に変わっていた。{T}は{U}の名前を呼びながら、しがみつくように奥を求める。\n\n{U}が先に達した。{climax}――締めつけられた{T}も、泣きそうな声で{U}を呼びながら奥に熱を注いだ。'),
      after: L('{T}「……乱暴じゃ、なかった？」――真っ赤な顔で確かめる{T}を、{U}は黙って抱き寄せた。')
    }
  };
  /* 嗜虐的な攻め：乱暴な抱き方（首を押さえる・縛るは使わない） */
  var ROUGH = {
    open: L('{T}は{U}を{bed}に乱暴に押し倒した。抗議しかけた口を唇で塞ぎ、服を剥ぐように脱がせていく。|{T}は{U}の髪を掴んで顔を上げさせ、噛みつくように口づけた。{U}の膝から力が抜けた。'),
    mid: L('{T}「声、出せよ。どうせ我慢できない」\n\n{T}は{U}の腰を指が食い込むほど強く掴み、一息に根元まで打ち込んだ。\n\n{edge}|{T}は{U}をうつ伏せにさせ、腰だけを高く引き上げた。\n\n{T}「逃げるな」\n\n後ろから深々と貫かれて、{U}の背が跳ねた。{edge}'),
    peak: L('肌を打つ音が、部屋じゅうに響いた。{T}は{U}の髪を後ろへ引き、反った喉に歯を立てながら、容赦なく奥を叩き続けた。\n\n{T}「ほら、イけ」\n\n最奥に叩きつけられた瞬間、{U}は声を裏返して達した。{climax}――{T}も腰を押しつけたまま、熱を吐き出した。'),
    after: L('{T}は掴んでいた髪を放し、乱れたそれを指で梳いてやった。{T}「……痛かったか」――{U}の腰には、{T}の指の跡が赤く残っていた。|{T}は荒い息のまま{U}を抱き寄せた。乱暴だった手が、今は不器用に背中を撫でていた。')
  };
  /* 女性が攻め、男性が受け：跨って主導権を握る */
  var RIDE = {
    open: L('{T}は{U}を押し倒して跨り、見下ろしたまま、熱く張りつめたものをゆっくりと自分の中へ迎え入れた。沈める速さも深さも、すべて{T}が決める。'),
    mid: L('{T}「動かないで。……私の好きにさせて」\n\n浅いところで焦らしては、不意に根元まで呑み込む。{U}が思わず腰を突き上げると、{T}はその胸に手をついて押さえつけた。\n\n{edge}'),
    peak: L('{T}の中が、きゅうっと{U}を締め上げる。限界を訴えられても、{T}はむしろ深く腰を落とした。\n\n{T}「まだ。……いいって言うまで」\n\n{T}が自分の頂へ駆け上がるのと同時に、許しが出た。{U}は{T}の腰を掴んだまま、奥へ熱を吐き出した。{U}「っ、く……出る……！」'),
    after: L('{T}は{U}の胸に倒れ込み、汗ばんだ首筋に頬を寄せた。{T}「……悪くなかった」――主導権は、最後まで{T}のものだった。')
  };
  /* 女性どうし：指と舌 */
  var FF = {
    open: L('{T}は{U}の首筋から胸、腹へと、ゆっくり唇を這わせていった。脚の付け根に辿り着く頃には、{U}の呼吸はすっかり乱れていた。'),
    mid: L('{T}「ここ、触ってほしい？」\n\n答えを待たずに、{T}の指が濡れた襞を割った。浅いところをなぞり、一本、二本と沈めていく。中で指を曲げられた瞬間、{U}の腰が跳ねた。\n\n{edge}'),
    peak: L('{T}は指を止めないまま、敏感な芽に舌を這わせた。外と内を同時に責められ、{U}は{bed}を握りしめて首を振る。\n\n{T}「いいよ、イって」\n\n囁かれた瞬間、{U}は{T}の指をきつく締めつけて達した。{climax}'),
    after: L('二人は汗ばんだ脚を絡めたまま、しばらく黙っていた。{T}が{U}の指先に口づけると、{U}はくすぐったそうに笑った。')
  };

  function topOf(c) { return HK.voiceTop ? HK.voiceTop(c) : 'NP'; }
  /* 山場の本文（{T}{U} のまま）。o: { pick, rng, bed, lead（書き出しの前に足す地の文）, finish（頂のあとの段落）, after（余韻を差し替えるとき） } */
  var TK = HK.TKC = {
    on: function (lew) { return !HK.SAFE_ON && lew !== 'low' && lew !== 'off' && lew !== 'fade'; },
    ok: function (T, U) { return !(HK.Pos && HK.Pos.hardTop && HK.Pos.hardTop(U)); },
    body: function (T, U, o) {
      var pk = o.pick, Pz = HK.Pos, V = HK.Voice;
      var fT = Pz && Pz.isF && Pz.isF(T), fU = Pz && Pz.isF && Pz.isF(U);
      var set = fT && fU ? FF : fT && !fU ? RIDE : HK.Ero && HK.Ero.sadist && HK.Ero.sadist(T, U) && o.rng() < 0.3 ? ROUGH : (CORE[topOf(T)] || CORE.NP);
      var pf = function (a) { return pk(a); };
      var edge = V && V.line ? V.line(pf, U.persona || 'gentle', 'edge', 'U') : '';
      var climax = V && V.line ? V.line(pf, U.persona || 'gentle', 'climax', 'U') : '';
      var paras = [(o.lead || '') + pk(set.open), pk(set.mid), pk(set.peak)];
      if (o.finish) paras.push(o.finish);
      if (!o.noAfter) paras.push(o.after || pk(set.after));
      return paras.join('\n\n').replace(/\{edge\}/g, edge).replace(/\{climax\}/g, climax).replace(/\{bed\}/g, o.bed || 'シーツ');
    },
    /* {T}{U} を名前で埋める（ほかの差し込みはそのまま） */
    names: function (t, T, U) { return t.replace(/\{T\}/g, T.name).replace(/\{U\}/g, U.name); },
    /* {T}{U} を、場面のテンプレートの {a}{b}（など）に置き換える */
    map: function (t, kT, kU) { return t.replace(/\{T\}/g, '{' + kT + '}').replace(/\{U\}/g, '{' + kU + '}'); }
  };

  /* ---------------- オメガバース ---------------- */
  var OM = HK.OMEGA;
  if (!OM || !OM.HEAT) return;
  var H = OM.HEAT;
  var LEAD_HEAT_R = L('発情の熱に浮かされた{T}の目には、もう{U}しか映っていなかった。|{T}の肌から立ちのぼる{sT}の匂いに、{U}の膝から力が抜けた。|');
  var LEAD_HEAT = L('{U}の肌から立ちのぼる{sU}の匂いが、{T}の理性を端から溶かしていく。|発情の熱で、{U}の体はどこに触れても震えた。|');
  var KNOT = L('ノットが膨らみ、二人は繋がったまま動けなくなった。根元で栓をされたまま、熱が何度も奥へ脈打つ。{U}は{T}の胸に額を押しつけて、小さく震えていた。|結ばれたまま、{T}は{U}の背中をゆっくり撫で続けた。腹の奥が満たされていく感覚に、{U}はうっとりと目を閉じた。');
  var KNOT_R = L('{T}は{U}の奥で果てても、発情の熱は引かなかった。繋がったまま{U}を抱きすくめ、また緩やかに腰を揺らし始める。|果てたあとも、{T}は{U}を離さなかった。{sT}の匂いが、{U}の体の奥まで染み込んでいた。');
  var BETA = L('βの{T}には、ノットも匂いに酔う本能もない。それでも{T}は、{U}の熱が引くまで何度でも抱いた。|{T}「匂いが分からなくても、欲しがってるのは分かる」――βの{T}は、{U}が満たされるまで離さなかった。');
  var h0 = H.scene;
  H.scene = function (ctx, a, b, opt) {
    opt = opt || {};
    var lew = ctx.env.lewd || 'mid';
    if (!TK.on(lew) || !HK.Pos || !HK.Voice) return h0.apply(this, arguments);
    /* {a}=相手、{b}=発情期のΩ。受け攻めの指定でΩが攻めなら入れ替える */
    var o = HK.Pos.order(a, b, [a, b]), T = o[0], U = o[1], rev = T === b;
    if (!TK.ok(T, U)) return h0.apply(this, arguments);
    var ff = HK.Pos.ff(a, b), kT = rev ? 'b' : 'a', kU = rev ? 'a' : 'b';
    var pk = function (arr) { return ctx.pick(arr); };
    var noRecv = function (arr, re) { if (!rev) return arr; var f = arr.filter(function (l) { return !re.test(l); }); return f.length ? f : arr; };
    var moe = H.MOE.filter(function (l) { return !(ff && /喉仏/.test(l)); });
    var head = pk(H.COME[HK.voiceTop(a)]) + pk(noRecv(H.STATE[HK.voiceTop(b)], /触れた瞬間|さわって|ほどくと/)) + pk(noRecv(moe, /いっぱいにして|噛まない|肩がびくりと/));
    var fin = ff ? '' : opt.beta && !rev ? pk(BETA) : ctx.rng() < (lew === 'high' ? 0.8 : 0.55) ? pk(rev ? KNOT_R : KNOT) : '';
    var body = TK.body(T, U, { pick: pk, rng: ctx.rng, bed: 'シーツ', lead: ff ? '' : pk(rev ? LEAD_HEAT_R : LEAD_HEAT), finish: fin, noAfter: true });
    body = TK.map(body.replace(/\{sT\}/g, '{s' + kT + '}').replace(/\{sU\}/g, '{s' + kU + '}'), kT, kU);
    var sc = OM.sc || function (t) { return t; };
    var V = HK.Voice, pf = function (arr) { return ctx.pick(arr); };
    var res = sc(ctx.t(head, a, b), a, b) + '\n\n' + sc(ctx.t(body, a, b), a, b) + (opt.insert ? '\n\n' + opt.insert : '') + '\n\n' + sc(ctx.t(pk(noRecv(H.AFTER[HK.voiceTop(b)], /腰が抜け/)), a, b), a, b) + (ctx.rng() < 0.35 ? ctx.t(V.line(pf, b.persona, 'after', 'b'), a, b) : '');
    if (ff && HK.FF) res = HK.FF.fix(ctx, res, T, U, { tools: true });
    return res;
  };
  /* 恋人・番の夜（omega-love.js） */
  var BOND_LEAD = L('{U}のうなじの噛み跡に、{T}がそっと唇を寄せた。そこに触れられるだけで、{U}の体から力が抜けていく。|番の匂いが混ざり合って、どちらの熱なのか分からなくなっていた。|');
  var l0 = OM.loveScene;
  if (l0) OM.loveScene = function (ctx, x, y, bond) {
    var s = l0.apply(this, arguments);
    var lew = ctx.env.lewd || 'mid';
    if (!TK.on(lew) || !HK.Pos || !HK.Voice || !s || !s.A) return s;
    var A = s.A, B = s.B;
    if (!TK.ok(A, B)) return s;
    var pk = function (arr) { return ctx.pick(arr); }, ff = HK.Pos.ff(A, B);
    var body = TK.body(A, B, { pick: pk, rng: ctx.rng, bed: 'シーツ', lead: bond && !ff ? pk(BOND_LEAD) : '' });
    var sc = OM.sc || function (t) { return t; };
    var text = sc(ctx.t(TK.map(body, 'a', 'b'), A, B), A, B);
    if (ff && HK.FF) text = HK.FF.fix(ctx, text, A, B, { tools: true });
    /* 書き出し（いつ・どこで）は元の場面の最初の一文を残す */
    var first = (s.text.match(/^[^。]*。/) || [''])[0];
    s.text = first + '\n\n' + text;
    return s;
  };
})();
