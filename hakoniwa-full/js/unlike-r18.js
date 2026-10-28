/* 箱庭シミュレーター（R18版のみ）: 「らしくない」行動（unlike.js の HK.Unlike）の R18 の部分（族のかたまり pack-rel）
   ■ 反応「そそられる」（U.R18.react）：らしくないことをした人（{a}）を見て、性欲の強い人（{b}。HK.Pos.libOf が high、ふつうの人もまれに）の体の熱が上がる。
     体の関係が許される組（HK.State.pairSex・HK.sexBlocked・恋愛：なしの家族でない。unlike.js の U.sexOK）だけ。
     文は性別の組（HK.Pos.order の向きで mf／ff／fm）×{b} が攻めか受けか、で書き分ける（1本3文以上）
   ■ 出来事 unl_heat：そそられた側（{a}）から誘い、らしくないことをした相手（{b}）と体の関係になる夜。
     起きる条件：そそられたあと（pf.unlHeat）・tie-warm-r18.js の HK.TieWarmR18.ok（描写の設定がある箱庭・クラスメイトは除く・その場にいる・
       恋愛対象（HK.canLove 両方向）・受け攻め（HK.Pos.okSex）・恋愛やR18にしない相手・性行為の相手の固定・恋愛：なしの家族・ほかの恋人がいる組を越えない）・
       相手の側にも下地がある（惹かれ 15 以上・好意 25 以上・性欲が強い のどれか）。一回の箱庭で同じ組は一回まで。
     文：導入（性別の組ごと。らしくない一面を思い出す）→ 最中・山場（thick-sex.js の HK.ThickSex／thick-sex-ero.js の HK.ThickEro。態度9種の喘ぎ・男性向け作風はそちらの部品。
       短くは tie-warm-r18.js の SHORT・CLIMB・SHORT_END）→ 受けの様子（同じく PEAK_PS。態度9種）→ 事後。攻め／受けは HK.Pos.order（自分で攻めを選んだ人を受けにしない）。
     夜の印（pf.night・nights）を付けるので、セフレの流れ（fwb.js の fwb_offer）・恋人の流れに乗る
   台詞は3本「くだけた常体｜硬い常体｜敬語」（一人称は「私」、二人称は「あなた」）。登場人物はすべて成人として扱う */
/* @labels
   unl_heat=らしくない一面にそそられて結ばれる夜
*/
(function () {
  'use strict';
  var HK = window.HK, U = HK && HK.Unlike;
  if (!HK || !U || !HK.COMMON) return;
  function L(s) { return s.split('|'); }
  function fill(t, m) { return String(t).replace(/\{(a|b|p|q|x)\}/g, function (s, k) { var v = m[k]; return v == null ? s : typeof v === 'string' ? v : v.name; }); }
  function isCtx(x) { return !!(x && x.R && x.pair && x.chars); }
  function pk(X, arr) {
    if (isCtx(X)) return HK.Ero && HK.Ero.fresh && X.rng && X.rng.int ? HK.Ero.fresh(X, arr, function (l) { return X.pick(l); }) : X.pick(arr);
    if (HK.Story && HK.Story.pick && X && X.recent) return HK.Story.pick(X, arr);
    return arr[Math.floor(X.rng() * arr.length)];
  }
  function modeOf(A, B) { var P = HK.Pos; if (!P || !P.isF) return 'mf'; if (P.ff(A, B)) return 'ff'; return P.isF(A, B) && !P.isF(B, A) ? 'fm' : 'mf'; }
  function order(a, b) { return HK.Pos && HK.Pos.order ? HK.Pos.order(a, b, [a, b]) : [a, b]; }

  /* ================= 反応「そそられる」 =================
     {a}＝らしくないことをした人、{b}＝そそられた人。top：{b} が攻め（HK.Pos.order の一人目）、bot：{b} が受け */
  var SX = {
    mf: {
      top: L('{b}は、喉の奥がひりつくように渇くのを感じた。崩れた{a}の姿に、体の芯がじわじわと熱を持ち始めている。この顔を、自分の腕の中でもっと崩してみたい――{b}は{a}の首筋から、どうしても目を離せなかった。|' +
        '{b}の視線が、{a}の唇から喉元へとゆっくり降りていった。ふだん隙を見せない相手の、あまりに無防備な姿。引き寄せて組み敷いたらどんな声を出すのか、{b}は考えるのをやめられなかった。'),
      bot: L('{b}は、下腹の奥がきゅっと疼くのを感じた。いつもと違う{a}の、無防備な横顔。あの腕に引き寄せられたらどうなるのか、考えただけで膝から力が抜けそうになった。|' +
        '{b}は、自分の頬が火照っていくのを止められなかった。らしくない{a}を見ているだけなのに、体の奥がじんと熱い。今の{a}になら、何をされてもいい――そんな考えが浮かんで、{b}はうろたえた。')
    },
    ff: {
      top: L('{b}は、いつもと違う{a}の横顔から目が離せなかった。指先がじんと熱くなる。このまま{a}を抱き寄せて、もっといろんな顔をさせてみたい――そんな欲が、{b}の中で静かに膨らんでいった。|' +
        '{b}は、{a}の乱れた前髪に、そっと手を伸ばしかけてやめた。触れたら、きっと止まれなくなる。{b}は唇を湿らせて、{a}の首筋に浮いた汗を目で追った。'),
      bot: L('{b}は、{a}の見せた隙に、胸の奥がざわめくのを感じた。肌の下まで熱が回ったような気がして、{b}は思わず腕で自分の体を抱いた。あの手に触れられたら――考えまいとするほど、想像は勝手に先へ進んだ。|' +
        '{b}は、いつもと違う{a}の声に、背筋がぞくりと粟立つのを感じた。耳の奥でその声が何度も繰り返される。{b}は太腿をきつく閉じて、体の熱をやり過ごそうとした。')
    },
    fm: {
      top: L('{b}は、崩れた{a}を見つめて、ぺろりと唇を湿らせた。ふだん隙を見せない相手が、あんな顔をするなんて。組み敷いて、もっと崩してしまいたい――体の奥に、甘い熱がともった。|' +
        '{b}は、らしくない{a}の姿に、腹の底から熱が這い上がってくるのを感じた。あの胸板に手をついて、上から見下ろしてやりたい。{b}は気づかれないように、ゆっくりと息を吐いた。'),
      bot: L('{b}は、いつもと違う{a}の熱っぽい目に射すくめられて、息を詰めた。体の芯がじわりと熱くなり、落ち着かなさに喉が鳴る。このまま{a}に跨がられたら――そんな想像を振り払えず、{b}は狼狽えた。|' +
        '{b}は、らしくない{a}から目を逸らそうとして、できなかった。腰のあたりに、重たい熱が溜まっていく。{a}の細い指が自分に触れるところを、{b}は思わず思い描いていた。')
    }
  };
  U.R18 = {
    SX: SX,
    react: function (X, a, b) {
      var od = order(a, b), A = od[0], B = od[1], m = modeOf(A, B), role = b === A ? 'top' : 'bot';
      return fill(pk(X, (SX[m] || SX.mf)[role]), { a: a, b: b });
    }
  };

  /* ================= 出来事 unl_heat ================= */
  /* 導入：{a}＝攻め、{b}＝受け、{p}＝らしくないことをした人、{q}＝そそられた人、{x}＝らしくない一面の名詞（照れた顔 など） */
  var OPEN = {
    mf: L('{p}の{x}が、{q}の目にまだ焼きついていた。二人きりになったとたん、どちらからともなく距離が消えた。{a}は{b}の腰を引き寄せ、確かめるように唇を重ねた。{b}は抵抗しなかった。むしろ、自分から{a}の首に腕を回した。|' +
      '{q}「あんな顔を見せたあなたが悪い｜あんな顔を見せたあなたが悪い｜あんな顔を見せたあなたが悪いんです」――{q}の声は、自分でも驚くほど熱を帯びていた。{a}は{b}を抱き寄せ、服の上から体の線をゆっくりなぞった。{b}の呼吸が、目に見えて乱れていった。|' +
      '{p}が見せた{x}のせいで、二人の間の空気は、もう元には戻らなかった。{a}は{b}の手首をそっと掴み、指先に口づけた。そのまま唇は腕の内側を上っていき、{b}は小さく身を震わせた。'),
    ff: L('{p}の{x}が、{q}の胸の奥でずっとくすぶっていた。二人きりになると、{a}は{b}の頬に手を添え、ゆっくりと唇を重ねた。柔らかな唇が触れ合うたびに、{b}の吐息が甘くなっていった。|' +
      '{q}「さっきのあなた、ずるかった｜さっきのあなたは、ずるかった｜さっきのあなた、ずるかったです」――{q}がそう囁くと、{a}は{b}の髪を耳にかけ、首筋に唇を落とした。{b}の指が、{a}の服をぎゅっと掴む。二人の体温が、少しずつ同じになっていった。|' +
      '{a}は{b}を抱き寄せ、背中を撫でながら何度も口づけた。{p}の{x}を思い出すたびに、{q}の胸は高鳴った。{b}は{a}の手を取り、自分の{胸}へと導いた。'),
    fm: L('{p}の{x}が、{q}の頭から離れなかった。二人きりになるなり、{a}は{b}の肩を押して座らせ、その膝に跨った。見下ろす{a}の目に、いつもとは違う熱がともっていた。|' +
      '{q}「あんな顔、ほかの人には見せないで｜あんな顔は、ほかの者には見せるな｜あんな顔、ほかの人には見せないでください」――{a}は{b}の胸板に手をつき、唇を奪った。{b}の手が、ためらいがちに{a}の腰に回った。|' +
      '{a}は{b}のシャツのボタンをひとつずつ外しながら、首筋に口づけを落としていった。{p}の{x}を思い出すたびに、{q}の体は熱くなった。{b}は観念したように、{a}の背中を抱き寄せた。')
  };
  /* 事後（{p}＝らしくないことをした人、{q}＝そそられた人） */
  var AFTER = L('しばらくのあいだ、二人とも何も言わなかった。{p}は自分の「らしくない」一面が招いたものを、黙って噛みしめていた。{q}は、もう前と同じ目で{p}を見られないと知っていた。|' +
    '{q}は隣で眠る{p}の顔を眺めながら、あの{x}を思い出していた。あんなものを見なければ、こうはならなかった。それでも、後悔はひとつもなかった。|' +
    '目が合うと、二人は少しぎこちなく笑った。{p}が先に笑い、{q}もつられて笑った。何が始まったのか、まだ二人にも分かっていなかった。');
  function ready(ctx, a, b) {
    var hu = ctx.pair(a, b).unlHeat, W = HK.TieWarmR18;
    if (!hu || hu.done || hu.by !== a.i || hu.to !== b.i || ctx.stepIndex <= hu.at) return false;
    if (HK.SAFE_ON || !W || !W.ok || !W.X || !HK.ThickSex) return false;
    if (ctx.pair(a, b).couple || !W.ok(ctx, a, b) || !U.sexOK(ctx, a, b)) return false;
    var ba = ctx.R(b, a);
    return ba.att >= 15 || ba.aff >= 25 || (HK.Pos && HK.Pos.libOf && HK.Pos.libOf(b) === 'high');
  }
  HK.addTo(HK.COMMON, {
    id: 'unl_heat', label: 'らしくない一面にそそられて結ばれる夜', cat: 'romance', sex: true, scope: 'pair', r18: true, tie: '-', noOdd: true, pri: true,
    when: function (ctx, a, b) { return !!b && ready(ctx, a, b); },
    /* 一組に一度だけの続きなので、箱庭の進行役の出来事と同じくらい重くする（pri）。性欲の強さの倍率は engine.js の act が掛ける */
    w: function (ctx, a, b) { return 2 + (ctx.R(a, b).att + ctx.R(b, a).att) / 80; },
    run: function (ctx, a, b) {
      if (!ready(ctx, a, b)) return null;
      var pf = ctx.pair(a, b), hu = pf.unlHeat, W = HK.TieWarmR18, X = W.X, f = U.flip(hu.k);
      hu.done = true; pf.night = true; pf.nights = (pf.nights || 0) + 1;
      var od = order(a, b), A = od[0], B = od[1], mode = modeOf(A, B), m = { p: b, q: a, x: f ? f.noun : 'らしくない顔' };
      var op = fill(pk(ctx, OPEN[mode] || OPEN.mf), m), after = fill(pk(ctx, AFTER), m);
      var LW = HK.Lewd, env = ctx.env, low = LW && LW.low(env), short = LW && LW.short(env, ctx.rng), ero = LW && LW.ero(env) && HK.ThickEro, high = LW && LW.high(env);
      var pk0 = function (arr) { return ctx.pick(arr); }, pkF = HK.Ero && HK.Ero.freshPick ? HK.Ero.freshPick(ctx, pk0) : pk0;
      var ET = HK.EroTop, rel = (ET && ET.relOf ? ET.relOf(ctx, A, B) : '') || 'first', text;
      var PS = X.PEAK_PS[B.persona] || X.PEAK_PS.gentle;
      if (low) text = op + pk(ctx, X.FADE) + after;
      else {
        var tailPs = pk(ctx, PS), TS = HK.ThickSex;
        if (!short && TS) {
          var tail = tailPs + '\n\n' + (high && HK.ThickEro ? HK.ThickEro.again(ctx, pkF, A, B, !!ero, false) + '\n\n' : '') + after;
          var o = { S: ctx, ctx: ctx, pick: pkF, rng: ctx.rng, a: A, b: B, style: TS.style(A), open: op, after: tail, rel: rel, again: false };
          text = (ero ? HK.ThickEro.scene(o) : TS.scene(o)).text;
        } else if (ero) {
          text = HK.ThickEro.short({ S: ctx, pick: pkF, a: A, b: B, open: op, again: high, after: tailPs + after, rel: rel }).text;
        } else {
          var NG = HK.NoGen && HK.NoGen.on && HK.NoGen.on(A, B);
          var body = NG && HK.NoGen.short ? HK.NoGen.short({ S: ctx, pick: pkF, rng: ctx.rng, a: A, b: B }) : pk(ctx, X.SHORT[mode]) + pk(ctx, X.CLIMB[mode]) + '{b}「{m2}」' + pk(ctx, X.SHORT_END[mode]);
          var again = high && HK.ThickEro ? HK.ThickEro.again(ctx, pkF, A, B, false, true) : '';
          text = op + body + again + tailPs + after;
        }
      }
      if (HK.Ero && HK.Ero.fill) text = HK.Ero.fill(ctx, text, B);
      text = ctx.t(text, A, B);
      if (mode === 'ff' && HK.FF && HK.FF.fix) text = HK.FF.fix(ctx, text, A, B);
      ctx.mod2(a, b, { att: 8, aff: 5, trust: 3 }, { att: 8, aff: 5, trust: 3 });
      ctx.stress(a, -6); ctx.stress(b, -6);
      if (HK.Emo && HK.Emo.bump) { HK.Emo.bump(ctx, a, { lust: -20, joy: 6 }); HK.Emo.bump(ctx, b, { joy: 6 }); }
      return { cat: 'romance', sex: true, text: text, why: a.name + 'は、' + b.name + 'の「らしくない」一面（' + (f ? f.name : '') + '）にそそられ、自分から誘った（' + A.name + 'が攻め）', mag: 24 };
    }
  });
})();
