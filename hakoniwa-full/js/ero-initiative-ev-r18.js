/* 箱庭シミュレーター（R18版のみ）: 夜の能動性が見える出来事（2026-10-31 担当E2）。判定と型は ero-initiative-r18.js（HK.Initiative）
   利用者の要望：「騎乗位、受け優位の展開、あるいは逆転など、夜の性格や能動性に合わせたエッチなイベント」
     ・受け優位・逆転は、住人の設定「夜の主導」で受けが主導（誘い受け・襲い受け）を選んだときだけ（2026-10-31 の利用者の指示）
   ■ 出来事（共通の出来事 HK.COMMON。出られない部屋・合コン・無人島・ゾンビ・オメガバースなど、共通の出来事を使う箱庭で起きる）
     ini_sasoi … 受けから誘う夜（受けの夜の主導が「誘い受け」）。誘い方は受けの夜の性格の種類／態度で変わる
     ini_osoi  … 受けが迫る夜（受けの夜の主導が「襲い受け」）。攻めが自分で攻めを選んでいれば押し倒さず、膝に乗り上げる・引き寄せる形
     ini_ue    … 「今日は私が上」と受けが宣言して跨る夜（受けの夜の主導が誘い受け・襲い受け）。女攻め×男で受けに男性器がなければ主導だけが移る形
     ini_take  … 前に受けに主導された攻めが、次の夜に主導を取り返す（上の三つのあと。攻めの夜の性格の種類／態度で取り返し方が変わる）
     ini_trio  … 三人の主導権の取り合い（出られない部屋だけ）：真ん中の人が主導する版／二人の受けが組んで攻めを翻弄する版。夜の主導が受けの人がいるときだけ
     オメガバース：受けがΩで発情期なら、発情の熱で能動的になる文（理由の一文も発情）。攻めがαで自分で攻めを選んでいなければ、αが押さえ込まれる文。
   ■ 起きる条件：R18版・描写の設定がある箱庭（クラスメイトでは起きない）・HK.TieWarmR18.ok（その場にいる・恋愛対象と受け攻め HK.Pos.okSex・HK.canLove を両方向・
     性欲「なし」でない・恋愛やR18にしない相手・性行為の相手の固定・ほかの恋人）・惹かれが互いに 35 以上か恋人・夜を過ごした仲。攻め／受けは HK.Pos.order。
     同じ組で同じ出来事は一回まで。性欲・夜の起こりやすさの倍率は engine.js が掛ける（sex: true）。
   ■ きっかけの段：場面の記録の直前に、なぜその夜になったか（場所・状況の一文／誰が言い出したか・受けの夜の性格や態度・付き合っているか／攻めの応じ方。3 文）を
     別の記録（tag「きっかけ」）で出す。出られない部屋では HK.SexLead（出来事 id を EVR に登録）が部屋の条件・時間の前振りを先に出すので、その段の終わりに理由の文を足す。
   台詞は3本「くだけた常体｜硬い常体｜敬語」（一人称は「私」、二人称は「あなた」）。体の語は印。全年齢版にはこのファイルはない。登場人物はすべて成人として扱う */
(function () {
  'use strict';
  var HK = window.HK;
  if (!HK || HK.SAFE_ON || !HK.COMMON || !HK.Initiative || !HK.Pos) return;
  var I = HK.Initiative, P = HK.Pos;
  function L(s) { return s.split('|'); }
  var PS = ['proud', 'stern', 'tsun', 'gentle', 'devoted', 'cool', 'free', 'shy', 'polite'];
  function ps(c) { var p = HK.personaOf ? HK.personaOf(c) : c.persona; return PS.indexOf(p) >= 0 ? p : 'gentle'; }
  function pk(ctx, arr) { return HK.Ero && HK.Ero.fresh && ctx.rng && ctx.rng.int ? HK.Ero.fresh(ctx, arr, function (l) { return ctx.pick(l); }) : ctx.pick(arr); }
  function fill(t, m) { return String(t).replace(/\{(a|b|c)\}/g, function (s, k) { var v = m[k]; return v == null ? s : v.name; }); }

  /* ======================= きっかけの文（{a}＝攻め・{b}＝受け。性的な語・体の語・手を繋ぐ・抱きしめる・口づけの言い回しは書かない） ======================= */
  var SIT = {
    whiteroom: L('扉の紙の条件は、まだ満たされていなかった。|白い部屋の照明が一段落ちて、夜の時間になっていた。|閉じ込められてから、二人きりになれる時間はそう多くなかった。'),
    omega: L('発情期の甘い匂いが、部屋の空気を重くしていた。|抑制剤の効き目が、そろそろ切れかけていた。|番の約束をした夜から、二人の距離はずっと近いままだった。'),
    goukon: L('二次会の酔いが、まだ二人の頬に残っていた。|店を出たあとも、二人はなんとなく別れがたかった。|終電の時刻は、とうに過ぎていた。'),
    island: L('焚き火の明かりが落ちて、浜辺の夜は二人だけのものになっていた。|波の音しか聞こえない夜だった。|今日一日を生き延びた安堵が、二人を少しだけ大胆にしていた。'),
    zombie: L('見張りの交代を終えて、ようやく二人きりになれた。|明日も生きていられる保証は、どこにもなかった。|バリケードの向こうが静かな夜は、久しぶりだった。'),
    _: L('夜が更けて、二人の周りから人の気配が消えていた。|その夜、二人はようやく落ち着いて向き合う時間を持てた。|部屋には、二人のほかに誰もいなかった。')
  };
  /* 受けが言い出す理由（夜の性格の種類） */
  var CAUSE_K = {
    maso: L('強く扱われたいという願いを、{b}はもう隠すつもりがなかった。|{a}にもっと乱されたい、という気持ちが{b}を動かしていた。'),
    sweet: L('甘えたい気持ちが、{b}の背中を押していた。|今夜は{a}にたくさん甘やかしてもらいたい、と{b}は思っていた。'),
    mean: L('いつまでも動かない{a}に焦れて、{b}は挑発することにした。|{a}の余裕を崩してやりたい、と{b}は意地悪く考えていた。'),
    shy: L('言葉にはできなくても、{b}の目はずっと{a}を追っていた。|恥ずかしさをこらえて、{b}は自分から一歩を踏み出すことにした。'),
    sadist: L('{a}をどうするかは自分が決める、と{b}は最初から思っていた。|{a}を思いどおりにしてみたい、という気持ちが{b}の中で膨らんでいた。')
  };
  /* 受けが言い出す理由（夜の性格の種類を決めていない受け：態度 9 種） */
  var CAUSE_A = {
    proud: L('待つのは性に合わない、と{b}ははっきり思っていた。'), stern: L('{b}は、自分の気持ちを曖昧なままにしておくのをやめた。'),
    tsun: L('素直になれないまま、{b}はそれでも自分から動くことにした。'), gentle: L('{a}ともっと近くにいたい、と{b}は静かに思っていた。'),
    devoted: L('{a}を満たしたい、という一心が{b}を動かしていた。'), cool: L('{a}の顔に書いてある本音を、{b}はとうに見抜いていた。'),
    free: L('したいと思ったら我慢しないのが、{b}のやり方だった。'), shy: L('恥ずかしさをこらえて、{b}は自分から一歩を踏み出すことにした。'),
    polite: L('{b}は、自分から申し出るのが筋だと考えていた。')
  };
  var EVW = {
    ini_sasoi: L('今夜は自分から誘おう、と{b}は決めていた。|言い出したのは、{b}のほうだった。'),
    ini_osoi: L('{b}は、もう待つのをやめることにした。|先に動いたのは、{b}のほうだった。'),
    ini_ue: L('今夜は自分が上になる、と{b}は前から決めていた。|主導を握るのは自分だと、{b}はその日のうちに{a}に告げていた。'),
    ini_take: L('前の夜、主導を握っていたのは{b}のほうだった。{a}は、その借りを返すつもりでいた。|あの夜にされるがままだったことを、{a}は忘れていなかった。')
  };
  var RESP = L('{a}は{b}の様子に気づいて、黙って向き直った。|{a}は少し驚いたが、拒む理由は見つからなかった。|{a}は苦笑して、{b}の気が済むまで付き合うことにした。');
  var TAKE_RESP = L('{b}は、{a}の目の色が違うことにすぐ気づいた。|今夜は、{b}が待つ番だった。|{b}は、取り返されるのを少しだけ楽しみにしていた。');
  var ACC_LEAD = L('{b}は乗り気というより、{a}の望みに付き合うつもりだった。|自分の嗜好ではなかったが、{b}は{a}に合わせることにした。');
  var ACC_TOP = L('{a}は自分から望んだわけではなかったが、{b}が望むならと腹を決めた。|{a}は、{b}の好みに付き合うつもりで向き直った。');
  var OM_HEAT = L('発情期の熱に浮かされて、{b}はいつになく大胆になっていた。|発情の波が来るたびに、{b}の遠慮はひとつずつ消えていった。');
  var OM_ALPHA = L('{a}はαの本能で主導を取り戻そうとしたが、{b}の熱に気圧されていた。|αであるはずの{a}が、今夜は{b}の勢いに押されていた。');

  /* ======================= 場面の書き出し（{a}＝攻め・{b}＝受け。組を問わない書き方。2 文） ======================= */
  var OPEN = {
    ini_sasoi: L('{b}が{a}の隣に腰を下ろしたのは、夜もだいぶ更けてからだった。肩が触れる距離のまま、{b}は{a}の顔をじっと見上げた。|{b}は{a}の袖を引いて、灯りの落ちた奥へ連れていった。振り返った{b}の頬は、うっすらと赤かった。|{b}は{a}の前に立つと、黙って上着を脱いでみせた。それが何の合図なのか、{a}にはすぐに分かった。'),
    ini_osoi: L('{a}が振り向くより先に、{b}はその胸元をつかんで引き寄せた。逃げる隙を与えない近さで、{b}は{a}を見つめた。|{b}は{a}の手首を取って、そのまま寝床のほうへ歩き出した。{a}が何か言いかけても、{b}は振り返らなかった。|{b}は{a}の膝の上に乗り上げ、両手で頬を挟んだ。息のかかる距離で、{b}は小さく笑った。'),
    ini_ue: L('{b}は{a}を寝床に座らせ、その前に立って見下ろした。いつもと逆の目線に、{a}は思わず息を呑んだ。|{b}は{a}を仰向けにさせると、その腰の横に膝をついた。今夜の決まりを告げるように、{b}は{a}の胸に手を置いた。|{b}は{a}の手を引いて寝床に導き、自分は{a}の上に陣取った。見下ろす目は、楽しそうに細められていた。'),
    ini_take: L('{a}は、部屋に入ってきた{b}の手首をつかんで引き寄せた。この前の夜とは、目の色がまるで違っていた。|{a}は{b}を寝床に座らせ、その前に膝をついて顔を覗き込んだ。今夜は好きにさせない、と目が告げていた。|{a}は{b}の顎に指をかけ、上を向かせた。前の夜の続きを始める合図だった。')
  };
  /* 取り返す攻めの一言（攻めの態度 9 種 × 3 本の形） */
  var TAKE_SAY = {
    proud: L('「この前の分、きっちり返してもらうよ｜この前の分、きっちり返してもらう｜この前の分、きっちり返していただきますよ」'),
    stern: L('「今夜は、私が決める｜今夜は私が決める｜今夜は、私が決めます」'),
    tsun: L('「べ、別に根に持ってたわけじゃないけど。……今夜は、私の番｜べ、別に根に持っていたわけではない。……今夜は私の番だ｜べ、別に根に持っていたわけではありません。……今夜は、私の番です」'),
    gentle: L('「今夜は、私にさせて。……いいよね｜今夜は私にさせてくれ。……いいな｜今夜は、私にさせてください。……いいですよね」'),
    devoted: L('「この前のお返しに、今夜は私が全部するね｜この前の礼に、今夜は私が全部する｜この前のお返しに、今夜は私が全部いたしますね」'),
    cool: L('「この前は、油断しただけ｜この前は油断しただけだ｜この前は、油断しただけです」'),
    free: L('「今日は私の番ね。逃げちゃだめだよ｜今日は私の番だ。逃げるなよ｜今日は私の番ですよ。逃げてはいけません」'),
    shy: L('「こ、今夜は……私が、するから｜こ、今夜は……私がする｜こ、今夜は……私が、しますから」'),
    polite: L('「先日のお返しを、させてね｜先日の礼をさせてくれ｜先日のお返しを、させてください」')
  };

  /* ======================= 三人（出られない部屋）：{h}＝真ん中の人／{x}{y}＝ほかの二人 ======================= */
  var TRIO = {
    /* 真ん中の人（二人に対して受け）が主導する */
    hub: L('{h}は{x}と{y}の手をそれぞれ取って、自分の両隣に座らせた。どちらから先に触れるか、どこに触れるかを決めるのは、真ん中にいる{h}だった。{h}が{x}に口づければ{y}が待たされ、{y}に向き直れば{x}が焦れる。二人の熱を同時に受け止めながら、{h}は楽しそうに順番を告げていった。|{h}は二人を寝床に呼び寄せ、まず{x}の手を自分の胸に、次に{y}の手を自分の腰に導いた。「勝手に動かないで。順番は、私が決める｜勝手に動くな。順番は私が決める｜勝手に動かないでください。順番は、私が決めます」と言われて、{x}も{y}も息を詰めて{h}の合図を待つ。受け止めるのは{h}なのに、二人を動かしているのは間違いなく{h}の声だった。|{h}は{x}の膝に背を預け、目の前の{y}を足先で招き寄せた。前から{y}に、後ろから{x}に触れられながら、{h}はどちらにどれだけ触れさせるかを、指先ひとつで決めていく。{x}と{y}が張り合うように熱を上げるほど、{h}の笑みは深くなっていった。'),
    /* 二人の受けが組んで、攻めを翻弄する */
    duo: L('{x}と{y}は目を見交わすと、示し合わせたように{h}の両側に回った。{x}が{h}の耳元で囁けば、{y}が首筋に唇を寄せる。どちらに応えればいいのか分からないまま、{h}は二人に翻弄されていった。|{x}が{h}の手を取り、{y}が{h}の上着を脱がせていく。二人がかりで先回りされて、{h}は自分から動く隙をことごとく奪われた。「今夜は、私たちの番｜今夜は、私たちの番だ｜今夜は、私たちの番です」と{x}が笑い、{y}が頷いた。|{x}と{y}は{h}を寝床に座らせ、左右からその膝に乗り上げた。代わる代わる唇を奪われて、{h}は息を整える暇もない。抱く側のはずの{h}が、いつのまにか二人のなすがままになっていた。'),
    /* 続き（三人。組を問わない書き方。{mh}＝真ん中の人の声） */
    mid: L('肌が重なるたびに、三人の息はひとつに溶けていった。誰の手がどこに触れているのかも、もう分からない。{h}の喉から、こらえきれない声がこぼれた。{h}「{mh}」|二人に挟まれた{h}の体は、どこを撫でられても敏感に跳ねた。片方が離れれば、すぐにもう片方が埋める。終わりのない熱の中で、{h}は何度も名前を呼んだ。{h}「{mh}」|寝床の上で、三人の影がゆっくりと揺れていた。{x}と{y}の熱を交互に受け止めながら、{h}は甘い声を漏らし続けた。{h}「{mh}」'),
    end: L('夜が明けるころには、三人とも寝床の上で折り重なるように眠っていた。|最後に誰が先に音を上げたのかは、三人とも覚えていなかった。|ようやく息が整ったころ、{h}は満足そうに二人の髪を撫でた。'),
    lead: L('三人で過ごす夜の主導を、誰が握るのか。言葉にしなくても、その答えはもう決まりかけていた。|三人のあいだには、誰が先に動くかを探り合うような空気が流れていた。|言い出したのは、主導を握りたがる一人だった。'),
    low: L('――そこから先のことは、三人だけの秘密になった。|――灯りが消えたあと、三人の夜がどう転んだのかは、三人だけが知っている。')
  };

  /* ======================= 判定 ======================= */
  var W = HK.TieWarmR18;
  function baseOk(ctx, a, b) {
    if (!b || HK.SAFE_ON || !ctx.env || ctx.env.lewd == null || ctx.stepIndex < 1) return false;
    if (!W || !W.ok || !W.ok(ctx, a, b) || !P.okSex(a, b)) return false;
    var pf = ctx.pair(a, b), ab = ctx.R(a, b), ba = ctx.R(b, a);
    if (ab.ten > 55 || ba.ten > 55) return false;
    return !!pf.couple || !!pf.night || (ab.att >= 35 && ba.att >= 35);
  }
  function ord(a, b) { return P.order(a, b, [a, b]); }
  /* 受けの夜の主導（この組の向きで受けになる人が、誘い受け・襲い受けを選んでいるか） */
  function leadU(T, U) { var v = P.leadOf(U); return v === 'sasoi' || v === 'osoi' ? v : ''; }
  function done(ctx, a, b, id) { var pf = ctx.pair(a, b); return !!(pf.iniDone && pf.iniDone[id]); }
  function mark(ctx, a, b, id) { var pf = ctx.pair(a, b); (pf.iniDone = pf.iniDone || {})[id] = ctx.stepIndex; pf.night = true; pf.nights = (pf.nights || 0) + 1; }
  function scenId(ctx) { return (ctx.scen && ctx.scen.id) || ''; }
  function omegaHeat(ctx, U) { return scenId(ctx) === 'omega' && U && U.om && U.om.sex === 'o' && U.om.heat > 0; }
  function isAlpha(T) { return !!(T && T.om && T.om.sex === 'a'); }

  /* きっかけの文 */
  function leadText(ctx, id, T, U) {
    var sid = scenId(ctx), kU = I.kindOf(U, T), aU = I.attOf(U, T), out = [];
    out.push(pk(ctx, SIT[sid] || SIT._));
    if (id === 'ini_take') { out.push(pk(ctx, EVW.ini_take)); out.push(pk(ctx, TAKE_RESP)); }
    else {
      var c = pk(ctx, EVW[id]) + (omegaHeat(ctx, U) ? pk(ctx, OM_HEAT) : kU ? pk(ctx, CAUSE_K[kU]) : pk(ctx, CAUSE_A[aU] || CAUSE_A.gentle));
      if (I.accomOf(U, T)) c += pk(ctx, ACC_LEAD);
      out.push(c);
      out.push(isAlpha(T) && !P.hardTop(T, U) && id === 'ini_osoi' ? pk(ctx, OM_ALPHA) : I.accomOf(T, U) ? pk(ctx, ACC_TOP) : pk(ctx, RESP));
    }
    return fill(out.join(''), { a: T, b: U });
  }

  /* 場面（ThickSex／ThickEro。型は opt.ini で指定） */
  function scene(ctx, id, T, U, ini, open) {
    var X = W.X, LW = HK.Lewd, env = ctx.env, low = LW && LW.low(env), short = LW && LW.short(env, ctx.rng), ero = LW && LW.ero(env) && HK.ThickEro, high = LW && LW.high(env);
    var pk0 = function (arr) { return ctx.pick(arr); }, pkF = HK.Ero && HK.Ero.freshPick ? HK.Ero.freshPick(ctx, pk0) : pk0;
    var mode = I.modeOf(T, U), ET = HK.EroTop, rel = (ET && ET.relOf ? ET.relOf(ctx, T, U) : '') || 'lover';
    var after = pk(ctx, X.PEAK_PS[ps(U)] || X.PEAK_PS.gentle);
    var text;
    if (low) text = open + pk(ctx, X.FADE);
    else if (!short && HK.ThickSex) {
      var tail = after + (high && HK.ThickEro ? '\n\n' + HK.ThickEro.again(ctx, pkF, T, U, !!ero, false) : '');
      var o = { S: ctx, ctx: ctx, pick: pkF, rng: ctx.rng, a: T, b: U, style: HK.ThickSex.style(T), open: open, after: tail, rel: rel, again: false, ini: ini, heat: omegaHeat(ctx, U), place: scenId(ctx) === 'goukon' ? 'goukon' : '' };
      text = (ero ? HK.ThickEro.scene(o) : HK.ThickSex.scene(o)).text;
    } else {
      /* 短い版：型の段だけを短い山場に添える（本筋の乱数は使わない） */
      var pl = I.plan(ctx, T, U, { mode: mode, ero: !!ero, ini: ini, heat: omegaHeat(ctx, U), r: I.rngFor(T, U, open + ctx.stepIndex) });
      var core = ero ? HK.ThickEro.short({ S: ctx, pick: pkF, a: T, b: U, open: '', again: high, after: '', rel: rel }).text
        : (HK.NoGen && HK.NoGen.on && HK.NoGen.on(T, U) && HK.NoGen.short ? HK.NoGen.short({ S: ctx, pick: pkF, rng: ctx.rng, a: T, b: U }) : pk(ctx, X.SHORT[mode]) + pk(ctx, X.CLIMB[mode]) + '{b}「{m2}」' + pk(ctx, X.SHORT_END[mode]));
      text = open + '\n\n' + core + '\n\n' + after;
      if (pl) text = I.apply(text, pl, { after: after, src: 'short' });
    }
    if (HK.Ero && HK.Ero.fill) text = HK.Ero.fill(ctx, text, U);
    text = ctx.t(text, T, U);
    if (mode === 'ff' && HK.FF && HK.FF.fix) text = HK.FF.fix(ctx, text, T, U);
    return text;
  }

  /* ======================= 出来事 ======================= */
  function pairEv(id, label, cond, iniOf, openOf, whyOf, w0) {
    HK.addTo(HK.COMMON, {
      id: id, label: label, cat: 'romance', sex: true, scope: 'pair', r18: true, tie: '-', tags: ['night'],
      when: function (ctx, a, b) {
        if (!baseOk(ctx, a, b) || done(ctx, a, b, id)) return false;
        var od = ord(a, b);
        return cond(ctx, od[0], od[1]);
      },
      w: function (ctx, a, b) { return w0 + (ctx.R(a, b).att + ctx.R(b, a).att) / 400; },
      run: function (ctx, a, b) {
        var od = ord(a, b), T = od[0], U = od[1];
        if (!cond(ctx, T, U)) return null;
        mark(ctx, a, b, id);
        var ini = iniOf(ctx, T, U), open = openOf(ctx, T, U);
        var text = scene(ctx, id, T, U, ini, open);
        ctx._iniLead = { id: id, text: leadText(ctx, id, T, U), why: 'きっかけ：' + label };
        ctx.mod2(T, U, { att: 6, aff: 4, trust: 2 }, { att: 6, aff: 4, trust: 2 });
        if (HK.Emo && HK.Emo.bump) HK.Emo.bump(ctx, U, { lust: -20 });
        return { cat: 'romance', sex: true, text: text, why: whyOf(ctx, T, U) + '（' + T.name + 'が攻め）', mag: 24 };
      }
    });
  }
  var LJ = { sasoi: '誘い受け', osoi: '襲い受け' };
  function nightJa(c, o) { var k = I.kindOf(c, o); return k ? ({ sadist: 'サド', maso: 'マゾ', mean: '意地悪', sweet: '甘々', shy: '恥じらい' })[k] : '態度：' + ((HK.PERSONA && HK.PERSONA[I.attOf(c, o)] && HK.PERSONA[I.attOf(c, o)].label) || I.attOf(c, o)); }
  pairEv('ini_sasoi', '受けのほうから甘く誘って始まる夜',
    function (ctx, T, U) { return leadU(T, U) === 'sasoi'; },
    function () { return { lead: true }; },
    function (ctx, T, U) { return fill(pk(ctx, OPEN.ini_sasoi), { a: T, b: U }); },
    function (ctx, T, U) { return U.name + 'の夜の主導が誘い受けなので、' + U.name + 'から誘った夜／' + U.name + '＝' + nightJa(U, T) + '・' + T.name + '＝' + nightJa(T, U); }, 0.35);
  pairEv('ini_osoi', '受けのほうから迫って始まる夜',
    function (ctx, T, U) { return leadU(T, U) === 'osoi'; },
    function () { return { lead: true }; },
    function (ctx, T, U) { var l = OPEN.ini_osoi; if (P.hardTop(T, U)) l = l.filter(function (s) { return !/寝床のほうへ歩き出/.test(s); }); return fill(pk(ctx, l), { a: T, b: U }); },
    function (ctx, T, U) { return U.name + 'の夜の主導が襲い受けなので、' + U.name + 'から迫った夜／' + U.name + '＝' + nightJa(U, T) + '・' + T.name + '＝' + nightJa(T, U); }, 0.35);
  pairEv('ini_ue', '受けが今夜は自分が上だと宣言する夜',
    function (ctx, T, U) { return !!leadU(T, U); },
    function (ctx, T, U) { var m = I.modeOf(T, U); return { lead: false, dev: false, change: m === 'fm' && !P.hasM(U) ? 'shift' : 'ride_b' }; },
    function (ctx, T, U) { var l = OPEN.ini_ue; if (P.hardTop(T, U)) l = l.filter(function (s) { return !/仰向けにさせ/.test(s); }); return fill(pk(ctx, l), { a: T, b: U }) + fill('{b}', { b: U }) + pk(ctx, (HK.IniText.SAY.ue[ps(U)] || HK.IniText.SAY.ue.gentle)); },
    function (ctx, T, U) { return U.name + 'の夜の主導が' + LJ[leadU(T, U)] + 'なので、「今日は私が上」と宣言した夜（受け攻めは指定どおり）'; }, 0.3);
  pairEv('ini_take', '前の夜の仕返しに攻めが主導を取り返す夜',
    function (ctx, T, U) { var pf = ctx.pair(T, U), d = pf.iniDone || {}; var last = Math.max(d.ini_sasoi || -1, d.ini_osoi || -1, d.ini_ue || -1); return last >= 0 && ctx.stepIndex > last; },
    function () { return { lead: false, change: '', dev: true, react: true }; },
    function (ctx, T, U) { return fill(pk(ctx, OPEN.ini_take), { a: T, b: U }) + fill('{a}', { a: T }) + pk(ctx, TAKE_SAY[ps(T)] || TAKE_SAY.gentle); },
    function (ctx, T, U) { return '前の夜に' + U.name + 'に主導された' + T.name + 'が、主導を取り返した夜／' + T.name + '＝' + nightJa(T, U); }, 0.6);

  /* 三人の主導権の取り合い（出られない部屋だけ） */
  function trioOk(ctx, list) {
    if (list.some(function (c) { return !c || (P.trioOptOut && P.trioOptOut(c)) || !HK.State || !HK.State.canAct(c); })) return false;
    return true;
  }
  function trioFind(ctx, a, b) {
    if (scenId(ctx) !== 'whiteroom' || ctx.flags && (ctx.flags.isOne || ctx.flags.trioCur)) return null;
    var others = (ctx.chars || []).filter(function (c) { return c !== a && c !== b && c.alive !== false && !c.out; });
    for (var i = 0; i < others.length; i++) {
      var c = others[i], g = [a, b, c];
      /* 真ん中の人 h：ほかの二人に対して受け（二人ともと体の関係が成り立つ）で、夜の主導が受け */
      for (var k = 0; k < 3; k++) {
        var h = g[k], x = g[(k + 1) % 3], y = g[(k + 2) % 3];
        var okHX = baseOk(ctx, x, h) && ord(x, h)[0] === x, okHY = baseOk(ctx, y, h) && ord(y, h)[0] === y;
        if (okHX && okHY && leadU(x, h) && trioOk(ctx, g)) return { kind: 'hub', h: h, x: x, y: y };
        /* 二人の受け（x・y）が組んで攻め h を翻弄：h が二人の攻めで、x・y のどちらかの夜の主導が受け */
        var okXH = baseOk(ctx, h, x) && ord(h, x)[0] === h, okYH = baseOk(ctx, h, y) && ord(h, y)[0] === h;
        if (okXH && okYH && (leadU(h, x) || leadU(h, y)) && trioOk(ctx, g)) return { kind: 'duo', h: h, x: x, y: y };
      }
    }
    return null;
  }
  HK.addTo(HK.COMMON, {
    id: 'ini_trio', label: '三人で夜の主導権を取り合う', cat: 'romance', sex: true, scope: 'pair', r18: true, tie: '-', tags: ['night'],
    when: function (ctx, a, b) { if (!b || HK.SAFE_ON || ctx.stepIndex < 2 || (ctx.flags && ctx.flags.iniTrio)) return false; return !!trioFind(ctx, a, b); },
    w: function () { return 0.25; },
    run: function (ctx, a, b) {
      var f = trioFind(ctx, a, b);
      if (!f) return null;
      ctx.flags.iniTrio = ctx.stepIndex;
      var m = { h: f.h, x: f.x, y: f.y }, fl = function (t) { return String(t).replace(/\{(h|x|y)\}/g, function (s, k) { return m[k].name; }); };
      var LW = HK.Lewd, low = LW && LW.low(ctx.env), ero = LW && LW.ero(ctx.env);
      var t = fl(pk(ctx, TRIO[f.kind]));
      if (low) t += fl(pk(ctx, TRIO.low));
      else {
        var mh = HK.Moan && HK.Moan.say ? HK.Moan.say(ctx, f.h, 'mid', { novel: !ero, top: f.kind === 'hub' ? f.x : f.y }, null) : '……っ';
        t += '\n\n' + fl(pk(ctx, TRIO.mid)).replace('{mh}', mh || '……っ') + '\n\n' + fl(pk(ctx, TRIO.end));
      }
      [[f.h, f.x], [f.h, f.y]].forEach(function (p) { var pf = ctx.pair(p[0], p[1]); pf.night = true; pf.nights = (pf.nights || 0) + 1; ctx.mod2(p[0], p[1], { att: 4, aff: 2 }, { att: 4, aff: 2 }); });
      ctx._iniLead = { id: 'ini_trio', text: pk(ctx, SIT.whiteroom) + fl(pk(ctx, TRIO.lead)) + fl(f.kind === 'hub' ? '真ん中にいる{h}は、{x}と{y}の両方を自分のペースに巻き込むつもりでいた。' : '{x}と{y}は、二人で{h}を振り回してみたいと目配せし合っていた。'), why: 'きっかけ：三人の主導権の取り合い' };
      var why = f.kind === 'hub' ? f.h.name + 'が' + f.x.name + '・' + f.y.name + 'の二人に対して受けで、夜の主導が受け：真ん中の' + f.h.name + 'が主導した' : f.x.name + '・' + f.y.name + 'が' + f.h.name + 'に対して受けで、夜の主導が受けの人がいる：二人の受けが組んで' + f.h.name + 'を翻弄した';
      return { cat: 'romance', sex: true, with: [f.h, f.x, f.y].filter(function (c) { return c !== a && c !== b; }), text: t, why: why, mag: 22, trioPairs: [[f.h, f.x], [f.h, f.y]] };
    }
  });

  /* ======================= きっかけの記録（場面の直前。出られない部屋では HK.SexLead が出した前振りの終わりに理由の文を足す） ======================= */
  var IDS = { ini_sasoi: 1, ini_osoi: 1, ini_ue: 1, ini_take: 1, ini_trio: 1 };
  /* HK.SexLead は出られない部屋のかたまりにあるので、そのかたまりが届いたときに登録する（HK.Load.onChunk） */
  function evr() {
    var SL = HK.SexLead;
    if (!SL || !SL.EVR || SL.EVR.ini_sasoi) return;
    Object.keys(IDS).forEach(function (id) {
      SL.EVR[id] = function (ctx, o) { return o.sex === true && (o.actors || []).length >= 2 ? { gen: (o.actors || []).length >= 3 ? 'trio' : 'pair', who: o.actors.slice(0, 3) } : null; };
    });
  }
  if (HK.Load && HK.Load.onChunk) HK.Load.onChunk(evr); else evr();
  if (HK.Ctx && HK.Ctx.prototype.say) HK.wrap(HK.Ctx.prototype, 'say', function (prev) {
    return function (o) {
      var L0 = this._iniLead;
      if (!L0 || !o || o.kind !== 'event' || !this._ev || this._ev.id !== L0.id || typeof o.text !== 'string' || !o.text) return prev.apply(this, arguments);
      this._iniLead = null;
      var log = this.log, at = log.length, last = log[at - 1];
      /* すでに前振りの段がある（出られない部屋の HK.SexLead）：その段の終わりに理由を足す */
      if (last && last.tag === 'きっかけ' && last.step === this.stepIndex) { last.text += L0.text; return prev.apply(this, arguments); }
      var e0 = { n: at, step: this.stepIndex, label: this.label, cat: 'romance', actors: (o.actors || []).map(function (c) { return typeof c === 'number' ? c : c.i; }), text: L0.text, why: L0.why, odd: false, mag: 3, kind: 'event', tag: 'きっかけ', lewd: false };
      log.push(e0);
      var eroN = this._eroN === at;
      if (eroN) this._eroN = at + 1;
      var e = prev.apply(this, arguments);
      if (!e || e.skipped) {
        var k = log.indexOf(e0);
        if (k >= 0) { log.splice(k, 1); for (var j = k; j < log.length; j++) if (log[j]) log[j].n = j; }
        if (eroN && this._eroN === at + 1) this._eroN = at;
        return e;
      }
      if (HK.SexLead && HK.SexLead.log) HK.SexLead.log.push({ kind: 'ini', ev: L0.id, n: e0.n, scene: e.n, gens: ['ini'] });
      return e;
    };
  });
})();
