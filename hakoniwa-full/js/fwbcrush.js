/* 箱庭シミュレーター: セフレで片想い（体の関係はあるのに、気持ちは一方通行／両片想い）
   セフレの関係と片想い（または強い惹かれ）が重なっている二人に起きる出来事。
   相手の気持ちで三つに分かれる：
   ・cold   相手は体だけのつもり
   ・pulse  相手にも少し脈がある（まだ自覚していない）
   ・mutual 両片想い（お互いに「相手は体だけ」と思い込んでいる）
   {a}=想う側、{b}=相手、{c}=その場にいる別の誰か */
(function () {
  'use strict';
  var HK = window.HK;
  function L(s) { return s.split('|'); }
  function fill(t, m) { return t.replace(/\{(\w+)\}/g, function (x, k) { return m[k] != null ? m[k] : x; }); }
  function has(ctx, a, b, ty) { return HK.Ties ? HK.Ties.has(ctx, a, b, ty) : null; }
  function wants(ctx, a, b) {
    if (HK.Ties && HK.Ties.from(ctx, a, b, 'crush')) return true;
    /* 片想いが設定されている組では、逆向きの気持ちはよほど育たないと両片想いにならない */
    if (has(ctx, a, b, 'crush')) { var tb = HK.Ties.from(ctx, b, a, 'crush'); return !(tb && tb.cold) && ctx.R(a, b).att > 90; }
    return ctx.R(a, b).att > 58;
  }
  var FC = HK.FwbCrush = {};
  /* a が想う側として、この二人の型を返す（セフレで、a が b を想っていなければ null） */
  FC.kind = function (ctx, a, b) {
    if (!a || !b || a === b || !has(ctx, a, b, 'fwb') || ctx.pair(a, b).couple) return null;
    /* 関係が「セフレ」でも、体の関係を持てない組（攻め×攻めなど）には夜の出来事を起こさない */
    if (HK.Pos && !HK.Pos.okSex(a, b)) return null;
    if (!wants(ctx, a, b)) return null;
    if (wants(ctx, b, a)) return 'mutual';
    var t = HK.Ties && HK.Ties.from(ctx, a, b, 'crush');
    if (t && t.cold) return 'cold';
    return ctx.R(b, a).att >= 34 ? 'pulse' : 'cold';
  };
  var KW = { cold: '相手は体だけのつもり', pulse: '相手にも、少しだけ脈がある', mutual: '両片想い（お互いに「相手は体だけ」と思い込んでいる）' };
  FC.why = function (ctx, a, b, k) { return 'セフレで片想い：' + a.name + '→' + b.name + '（' + KW[k] + '／' + b.name + 'から' + a.name + 'への惹かれ ' + Math.round(ctx.R(b, a).att) + '）'; };

  var D = FC.TEXT = {
    /* 夜の始まり（場面ごと） */
    night: {
      goukon: L('合コンの席で、{a}と{b}は初対面のふりをしていた。トイレの前ですれ違ったとき、{b}が{a}の手の甲を指でなぞった。いつもの合図だった。――その夜、二人は別々に店を出て、同じホテルに入った。|二次会を抜けたのは、{a}と{b}が同時だった。周りは誰も、二人が知り合いだと気づいていなかった。'),
      trial: L('投票の前夜、{a}は{b}の独房の扉を叩いた。明日、どちらかが処刑されるかもしれない。それでも二人は、いつもと同じことをした。|審理が終わると、{b}は無言で{a}の部屋に入ってきた。言葉はいらなかった。いつもそうだった。'),
      whiteroom: L('出られない部屋の簡易ベッドで、二人はいつものように肌を重ねた。条件のためではなかった。|監視カメラの赤い光を背に、{b}は{a}の服に手をかけた。「どうせ、いつもしてることでしょ」'),
      island: L('夜の洞窟で、二人はいつものように体を寄せ合った。波の音が、すべてをかき消した。|焚き火が消えたあと、{b}は当たり前のように{a}の寝床に潜り込んできた。'),
      omega: L('発情期でもないのに、{b}は{a}の部屋に来た。「抑制剤の練習台」――いつもの言い訳だった。|{b}の匂いが濃くなる夜、{a}の部屋の鍵は、いつも開いていた。'),
      zombie: L('バリケードの奥で、二人はいつもの夜を過ごした。明日のことは、どちらも口にしなかった。|見張りの交代のあと、{b}は黙って{a}の寝袋に入ってきた。生きていることを確かめる、いつもの方法だった。'),
      any: L('その夜も、二人はいつものように過ごした。')
    },
    /* 夜のあと（型ごと） */
    after: {
      cold: L('終わると、{b}はすぐに服を着た。「じゃ、またね」――{a}は「うん」とだけ言って、天井を見ていた。|{b}はシャワーを浴びると、{a}の方を見ずにスマホをいじり始めた。{a}は、背中に「好き」と書きそうになった指を、握りしめた。|{a}が「もう少しいてもいいよ」と言うと、{b}は笑った。「何それ、恋人みたい」――{a}も笑った。うまく笑えたかは分からない。'),
      pulse: L('いつもならすぐに帰る{b}が、その夜はなかなか服を着なかった。理由は、{b}自身にも分かっていなかった。|{b}は{a}の髪を、無意識に指で梳いていた。気づいて、慌てて手を引っ込めた。|{b}は帰り際、「……次、いつ空いてる」と訊いた。訊いてから、自分で少し驚いた顔をした。'),
      mutual: L('二人は背中合わせに寝転がっていた。{a}は「好き」と言いかけてやめた。{b}も、同じ言葉を飲み込んでいた。お互いに、相手にとって自分は体だけだと思っていた。|{a}は{b}の寝顔を見つめていた。{b}は眠ったふりをしながら、{a}の視線を数えていた。どちらも、それが相手の本心だとは思わなかった。|朝、{a}は先に起きて、{b}の分のコーヒーを淹れた。{b}はそれを飲みながら、「セフレに優しくしすぎ」と笑った。――{a}の気持ちに気づかれたくなくて、{b}も笑った。')
    },
    /* 嫉妬 */
    jealous: L('{b}が{c}と楽しそうに話しているのを、{a}は遠くから見ていた。文句を言う権利なんて、どこにもない。セフレなのだから。|{b}のスマホが鳴った。画面に{c}の名前が見えた。{a}は、見なかったことにした。|{a}は{b}に「{c}と、仲いいんだね」と言った。声が、思ったより低く出た。'),
    jealousRe: {
      cold: L('{b}は首を傾げた。「何、嫉妬？　そういう関係じゃないでしょ、うちら」|{b}は気にも留めなかった。「別にいいじゃん、誰と話しても」'),
      pulse: L('{b}は「……気にしてるの？」と訊いた。否定されると、なぜか少しがっかりした。|{b}はそれから、{c}と話すのを少しだけ控えるようになった。自分でも理由は分からなかった。'),
      mutual: L('{b}は「そっちこそ」と言いかけて、黙った。{b}もまた、{a}が誰かと話すたびに同じ気持ちになっていた。|{b}はわざと{c}の話を続けた。{a}が少しでも妬いてくれるのが、嬉しかったから。')
    },
    /* 最中に「好き」と漏らす */
    slip: L('最中に、{a}の口から「好き」がこぼれた。{a}は凍りついた。|{a}は{b}を抱きしめたまま、小さく「好きだよ」と言ってしまった。言うつもりは、なかった。'),
    slipRe: {
      cold: L('{b}は動きを止めた。「……そういうのは、なしって言ったよね」――その夜、{b}はいつもより早く帰った。|{b}は聞こえなかったふりをした。それが一番、残酷だった。'),
      pulse: L('{b}は何も言わなかった。ただ、{a}を抱く腕に、少しだけ力がこもった。|{b}は「……ずるい」とだけ言って、{a}の首筋に顔を埋めた。返事は、なかった。'),
      mutual: L('{b}の目に、涙が浮かんだ。「……今の、本当？」{a}が頷くと、{b}は笑って泣いた。「ずっと、体だけだと思ってた。私も、好き」――セフレは、その夜で終わった。|{b}は{a}の顔を両手で挟んだ。「もう一回言って」{a}がもう一度言うと、{b}は「……私の方が、先に好きだった」と言った。二人は、初めてちゃんとキスをした。')
    },
    /* 決まりを破る */
    rule: L('{a}は決まりを破って、{b}の唇にキスをした。セフレの間では、しないと決めていたのに。|{a}は朝まで帰らなかった。「泊まらない」が、二人の約束だった。|{a}は人前で、{b}の手を握った。ほんの一瞬だけ。'),
    ruleRe: {
      cold: L('{b}は眉をひそめた。「ルール、守ってよ。面倒なのは嫌なの」|{b}は{a}の手を、そっとほどいた。「誰かに見られたらどうするの」'),
      pulse: L('{b}は怒らなかった。怒らなかった自分に、{b}は戸惑っていた。|{b}は「……今回だけね」と言った。次も同じことを言う気がした。'),
      mutual: L('{b}は「ルール違反」と言いながら、{a}の手を握り返した。離さなかった。|{b}は一瞬固まってから、キスを返した。二人とも、何も言わなかった。言えば、壊れてしまう気がした。')
    },
    /* 終わらせる（相手が体だけのとき） */
    end: L('{a}は{b}に言った。「もう、会うのやめよう」理由を訊かれても、{a}は答えなかった。好きだからとは、言えなかった。|{a}は{b}からの「今夜」の連絡に、初めて返事をしなかった。スマホを伏せて、膝を抱えた。'),
    endRe: L('{b}は「そっか」とだけ言った。引き止める言葉は、なかった。|{b}は少し驚いた顔をして、それから笑った。「了解。楽しかったよ」'),
    stay: L('{a}は分かっていた。この関係を続ける限り、自分だけが傷つく。それでも、{b}からの「今夜」に、{a}は「行く」と返した。|{a}は自分に言い聞かせた。体だけでもいい。そばにいられるなら。'),
    /* 両片想いの、すれ違い */
    both: L('{a}は思った。{b}にとって自分は、都合のいい相手でしかない。――同じ夜、{b}も{a}について、まったく同じことを思っていた。|{a}は友達に「セフレに本気になったら終わりだよ」と言われて、笑ってごまかした。{b}も別の場所で、同じ言葉を言われていた。|{a}と{b}は、お互いに「重いと思われたくない」と思って、今日も好きと言わなかった。')
  };
  /* 場面ごとの特別な出来事 */
  var SP = {
    trial: { t: L('{a}は{b}に投票しなかった。理由を訊かれて、「セフレがいなくなると困るから」と答えた。嘘だった。|{b}が疑われたとき、{a}は真っ先に{b}をかばった。「{b}は、そんなことをする人じゃない」――周りは、二人がそこまで親しかったことに驚いた。'), why: '処刑されるかもしれない相手を、体だけの関係のはずの{a}が必死でかばった' },
    omega: { t: L('{a}は{b}のうなじに唇を寄せた。「……噛んでいい？」{b}は身をよじった。「だめ。番にはならないって、約束でしょ」|{a}は発情した{b}のうなじを前にして、歯を立てる寸前で止まった。体だけの関係のまま番になったら、{b}を一生縛ってしまう。'), why: '番になりたいのは、片想いの側だけかもしれない' },
    goukon: { t: L('合コンで{b}が{c}といい雰囲気になった。{a}は他人のふりをしたまま、何も言えなかった。帰りに{b}から「今夜、行っていい？」とメッセージが来た。{a}は三十分迷ってから、「いいよ」と返した。|{a}は{b}が合コンで連絡先を交換するのを、向かいの席から見ていた。初対面のふりをしている以上、止める理由はなかった。'), why: 'セフレであることを隠して、同じ合コンに来ていた' },
    zombie: { t: L('{b}が群れに囲まれたとき、{a}は迷わず飛び込んだ。助け出したあと、{b}は「なんでそこまで」と訊いた。{a}は「セフレがいなくなったら困るし」と笑った。|{a}は{b}の分まで食料を集めてきた。「体だけの相手に、そこまでする？」と{b}が笑うと、{a}は何も言わずに背を向けた。'), why: '命がけで守る理由を、体だけの関係では説明できなかった' }
  };

  function scnPool(ctx, T) { return T[ctx.scen.id] || T.any; }
  function other(ctx, a, b) { var o = ctx.others(a).filter(function (x) { return x !== b; }); return o.length ? ctx.pick(o) : null; }
  function mk(id, cat, w, when, run, only) { return { id: id, cat: cat, scope: 'pair', mini: true, sig: true, w: w, when: when, run: run, only: only, sex: id === 'fc_night' || undefined }; }

  var LIST = [
    /* いつもの夜と、そのあと */
    mk('fc_night', 'romance', function (ctx, a, b) { return 1 + ctx.R(a, b).att / 80; },
      function (ctx, a, b) { var k = FC.kind(ctx, a, b); return k && (ctx.pair(a, b).fcN || 0) < 2; },
      function (ctx, a, b) {
        var k = FC.kind(ctx, a, b), pf = ctx.pair(a, b), m = { a: a.name, b: b.name };
        pf.fcN = (pf.fcN || 0) + 1; pf.night = true;
        ctx.mod2(a, b, { att: 5 }, k === 'cold' ? { att: 1 } : { att: 5, aff: 3 });
        ctx.stress(a, k === 'cold' ? 6 : 2);
        return { text: fill(ctx.pick(scnPool(ctx, D.night)), m) + fill(ctx.pick(D.after[k]), m), why: FC.why(ctx, a, b, k), mag: 26 };
      }),
    /* 嫉妬（文句を言う権利はない） */
    mk('fc_jealous', 'conflict', function (ctx, a) { return 0.6 + a.tr.jealous * 0.8; },
      function (ctx, a, b) { return FC.kind(ctx, a, b) && !!other(ctx, a, b) && !ctx.pair(a, b).fcJ && (!HK.Obsess || HK.Obsess.jealOk(ctx, a, b)); },
      function (ctx, a, b) {
        var k = FC.kind(ctx, a, b), c = other(ctx, a, b), m = { a: a.name, b: b.name, c: c.name };
        ctx.pair(a, b).fcJ = true;
        if (HK.Obsess) HK.Obsess.feed(ctx, a, b, 6);
        ctx.stress(a, 8); ctx.mod(a, c, { ten: 5 });
        if (k !== 'cold') ctx.mod(b, a, { att: 6 });
        return { text: fill(ctx.pick(D.jealous), m) + fill(ctx.pick(D.jealousRe[k]), m), why: FC.why(ctx, a, b, k) + '／嫉妬する権利はない', with: [c] };
      }),
    /* 最中に「好き」と漏らす（両片想いなら、ここで実る） */
    mk('fc_slip', 'romance', function (ctx, a) { return 0.5 + a.tr.honesty * 0.5 + a.tr.impulse * 0.4; },
      function (ctx, a, b) { var pf = ctx.pair(a, b); return FC.kind(ctx, a, b) && !pf.fcSlip && (pf.fcN || 0) >= 1; },
      function (ctx, a, b) {
        var k = FC.kind(ctx, a, b), pf = ctx.pair(a, b), m = { a: a.name, b: b.name };
        pf.fcSlip = true;
        if (k === 'mutual') { pf.couple = true; ctx.mod2(a, b, { att: 12, aff: 15, trust: 12 }, { att: 12, aff: 15, trust: 12 }); }
        else if (k === 'pulse') { ctx.mod(b, a, { att: 12, aff: 6 }); }
        else { ctx.stress(a, 18); ctx.mod2(a, b, { att: -2 }, { ten: 6 }); }
        return { text: fill(ctx.pick(D.slip), m) + fill(ctx.pick(D.slipRe[k]), m), why: FC.why(ctx, a, b, k) + (k === 'mutual' ? '／両片想いが、ようやく通じた' : ''), mag: k === 'mutual' ? 40 : 30 };
      }),
    /* 決まりを破る */
    mk('fc_rule', 'romance', function (ctx, a) { return 0.6 + a.tr.fc * 0.4 + a.tr.impulse * 0.3; },
      function (ctx, a, b) { return FC.kind(ctx, a, b) && !ctx.pair(a, b).fcRule; },
      function (ctx, a, b) {
        var k = FC.kind(ctx, a, b), m = { a: a.name, b: b.name };
        ctx.pair(a, b).fcRule = true;
        ctx.mod2(a, b, { att: 4 }, k === 'cold' ? { ten: 5 } : { att: 7, aff: 4 });
        return { text: fill(ctx.pick(D.rule), m) + fill(ctx.pick(D.ruleRe[k]), m), why: FC.why(ctx, a, b, k) };
      }),
    /* 体だけの相手と、終わらせるか続けるか */
    mk('fc_end', 'romance', function (ctx, a) { return 0.4 + a.stress / 120 + a.tr.cp * 0.3; },
      function (ctx, a, b) { var pf = ctx.pair(a, b); return FC.kind(ctx, a, b) === 'cold' && !pf.fcEnd && (pf.fcSlip || (pf.fcN || 0) >= 2 || a.stress > 50); },
      function (ctx, a, b) {
        var pf = ctx.pair(a, b), m = { a: a.name, b: b.name };
        pf.fcEnd = true;
        if (a.tr.cp + a.tr.a > a.tr.ac + 0.3) {
          pf.night = false; pf.wasNight = true;
          ctx.stress(a, 15); ctx.mod2(a, b, { att: -8 }, { ten: 4 });
          return { text: fill(ctx.pick(D.end), m) + fill(ctx.pick(D.endRe), m), why: FC.why(ctx, a, b, 'cold') + '／傷つく前に、自分から終わらせた（CP・A）', mag: 30 };
        }
        ctx.stress(a, 8);
        return { text: fill(ctx.pick(D.stay), m), why: FC.why(ctx, a, b, 'cold') + '／それでも続けることを選んだ（AC）', mag: 22 };
      }),
    /* 両片想いのすれ違い */
    mk('fc_both', 'romance', function () { return 1.1; },
      function (ctx, a, b) { return FC.kind(ctx, a, b) === 'mutual' && !ctx.pair(a, b).fcBoth; },
      function (ctx, a, b) {
        ctx.pair(a, b).fcBoth = true;
        return { text: fill(ctx.pick(D.both), { a: a.name, b: b.name }), why: FC.why(ctx, a, b, 'mutual') };
      })
  ];
  /* 場面ごとの特別な出来事 */
  Object.keys(SP).forEach(function (id) {
    LIST.push(mk('fc_sp_' + id, id === 'trial' || id === 'zombie' ? 'help' : 'romance', function () { return 1.2; },
      function (ctx, a, b) { return ctx.scen.id === id && FC.kind(ctx, a, b) && !ctx.pair(a, b).fcSp && (id !== 'goukon' || !!other(ctx, a, b)); },
      function (ctx, a, b) {
        var k = FC.kind(ctx, a, b), c = other(ctx, a, b), m = { a: a.name, b: b.name, c: c ? c.name : '' };
        ctx.pair(a, b).fcSp = true;
        ctx.mod2(a, b, { att: 4 }, k === 'cold' ? { trust: 6 } : { att: 8, trust: 6 });
        return { text: fill(ctx.pick(SP[id].t), m), why: FC.why(ctx, a, b, k) + '／' + fill(SP[id].why, m), mag: 28, with: id === 'goukon' && c ? [c] : null };
      }));
  });
  /* 教室では、夜の場面のかわりに「秘密の関係」として描く（セフレの夜は起きない） */
  /* クラスメイト（高校生）には入れない（fwb.js と同じ扱い） */
  ['goukon', 'trial', 'whiteroom', 'island', 'omega'].forEach(function (id) { HK.addMini(id, LIST); });
  var Z = HK.ZB;
  if (Z && Z.scen) LIST.forEach(function (e) { var e2 = {}; for (var k in e) e2[k] = e[k]; e2.mini = false; Z.scen.events.push(e2); });
})();
