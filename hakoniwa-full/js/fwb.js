/* 箱庭シミュレーター: 甘い恋だけでなく「セフレ」に落ち着く流れ（全箱庭共通。クラスメイトとバトルロワイヤルは除く）
   一線を越えたあと、恋人にならずに体の関係だけを続けるかどうかを、二人の気質で決める */
(function () {
  'use strict';
  var HK = window.HK;
  var F = HK.FWB = {};
  var NO = ['classroom', 'br'];
  F.allowed = function (ctx) { return NO.indexOf(ctx.scen.id) < 0; };
  /* 恋人より体の関係を選びやすい度合い（0〜1） */
  F.lean = function (c) { return HK.clamp(c.tr.cold * 0.35 + c.tr.impulse * 0.35 + (1 - c.tr.ac) * 0.15 + (1 - c.tr.np) * 0.15 - c.tr.cp * 0.1); };
  function love(r) { return r.aff > 38 && r.att > 42; }
  /* セフレに落ち着くか */
  F.decide = function (ctx, a, b) {
    if (!F.allowed(ctx)) return false;
    /* 体の関係を持てない組（攻め×攻めなど）はセフレにならない */
    if (HK.Pos && !HK.Pos.okSex(a, b)) return false;
    var ab = ctx.R(a, b), ba = ctx.R(b, a), both = love(ab) && love(ba);
    var p = 0.12 + (F.lean(a) + F.lean(b)) / 2 * 0.65 - (both ? 0.3 : 0) + (love(ab) !== love(ba) ? 0.12 : 0);
    return ctx.rng() < HK.clamp(p, 0.03, 0.85);
  };
  F.mark = function (ctx, a, b) {
    var pf = ctx.pair(a, b);
    pf.fwb = true; pf.night = true; pf.couple = false; pf.fwbAt = ctx.stepIndex;
    pf.nights = Math.max(2, pf.nights || 0);
  };
  /* セフレになるときの一言（言い出す側の気質で） */
  F.OFFER = {
    cold: ['{a}は服を着ながら言った。「付き合うとかは面倒だけど、また会うのはいいよ」{b}は少し考えて、頷いた。', '{a}「恋人じゃなくて、こういう関係でいよう。お互い楽でしょ」{b}「……わかった」'],
    fc: ['{a}「ねえ、またしようよ。付き合うとかは置いといて」{b}は吹き出して、「{light}」と言いながら連絡先を交換した。', '{a}は{b}の背中に抱きついて、「これ、たまにやりたい」と言った。恋人になろうとは言わなかった。'],
    ac: ['{a}は「付き合って」と言えないまま、「……また、会える？」とだけ訊いた。{b}は「いつでも」と答えた。それ以上は、どちらも言わなかった。', '{a}は{b}の重荷になりたくなくて、「恋人じゃなくていいから」と先に言ってしまった。'],
    cp: ['{a}は「勘違いするな。これはそういう関係だ」と線を引いた。{b}はその線の内側で、また会う約束をした。'],
    np: ['{a}は「{b}が寂しいときは、いつでも呼んで」と言った。それが恋人の約束ではないことを、二人とも分かっていた。']
  };
  /* 「軽っ」の一言：言われた側の態度で（口調の辞書が拾わない態度でも、その人らしく） */
  var LIGHT = { proud: '軽いな', stern: '節操がないな', tsun: 'か、軽すぎ……', gentle: 'ふふ、軽いね', devoted: 'え、ええと……はい', cool: '軽いな', free: 'いいね、そういうの', shy: 'か、軽い……', polite: '軽いですね' };
  F.offerText = function (ctx, a, b) {
    var k = a.tr.cold > 0.6 ? 'cold' : a.tr.fc > 0.6 ? 'fc' : a.tr.ac > 0.6 ? 'ac' : a.tr.cp > 0.6 ? 'cp' : a.tr.np > 0.6 ? 'np' : ctx.rng.pick(['cold', 'fc']);
    var pb = (b && b.persona) || (HK.personaOf && HK.personaOf(b)) || 'gentle';
    return ctx.t(ctx.pick(F.OFFER[k]), a, b).replace(/\{light\}/g, LIGHT[pb] || '軽いね');
  };
  /* 部屋を出たあと・店を出たあとなど、一度きりの夜のあとの後日談 */
  F.after = function (ctx, a, b) {
    var lead = F.lean(a) >= F.lean(b) ? a : b, oth = lead === a ? b : a;
    return F.offerText(ctx, lead, oth);
  };

  var AGAIN = ['{a}から「今夜、空いてる？」とだけ連絡が来た。{b}は返事より先に、シャワーを浴びていた。', '{a}と{b}は、いつものホテルのいつもの部屋で落ち合った。会話は少なかった。', '{a}は{b}の部屋に来て、何も言わずにジャケットを脱いだ。{b}も何も訊かなかった。', '終わったあと、{a}はすぐに服を着た。{b}は天井を見たまま「またね」と言った。', '{a}と{b}は、恋人みたいにキスをして、恋人みたいには朝を迎えなかった。', '{b}は{a}の首筋に残した痕を見て、「見えるとこはやめてって言ったでしょ」と笑った。', '{a}は{b}を抱きながら、ふと「好き」と言いかけて、別の言葉に変えた。', '{a}と{b}は、お互いの恋愛の話を平気でした。平気なふりをした。'];

  F.events = [
    {
      id: 'fwb_offer', cat: 'romance', sex: true, scope: 'pair', pri: true,
      when: function (ctx, a, b) { var pf = ctx.pair(a, b); return F.allowed(ctx) && pf.night && !pf.couple && !pf.fwb && !pf.fwbAsked && !pf.forced && (!HK.Pos || HK.Pos.okSex(a, b)); },
      w: function (ctx, a) { return 0.8 + F.lean(a) * 1.5; },
      run: function (ctx, a, b) {
        var pf = ctx.pair(a, b); pf.fwbAsked = true;
        if (F.decide(ctx, a, b)) {
          F.mark(ctx, a, b);
          ctx.mod2(a, b, { att: 6, trust: 3 }, { att: 6, trust: 3 });
          return { text: F.offerText(ctx, a, b), why: a.name + 'の「恋人より気楽な関係」寄りの気質（ドライさ・衝動性）', mag: 18 };
        }
        ctx.mod2(a, b, { aff: 3 }, { aff: 3 });
        return { text: ctx.t(ctx.pick(['{a}は「あれは、なかったことにしよう」と言いかけて、やめた。{b}の顔を見たら、言えなかった。', '{a}と{b}は、あの夜のことを一度も口にしないまま、普通に話した。', '{a}は「またね」と言いかけて、「じゃあ」と言い直した。']), a, b), why: '体だけの関係にはしなかった' };
      }
    },
    {
      id: 'fwb_again', cat: 'romance', sex: true, scope: 'pair',
      when: function (ctx, a, b) { var pf = ctx.pair(a, b); return F.allowed(ctx) && pf.fwb && !pf.couple && pf.night && (!HK.Pos || HK.Pos.okSex(a, b)); },
      w: function (ctx, a, b) { return 0.9 + ctx.R(a, b).att / 60; },
      run: function (ctx, a, b) {
        var pf = ctx.pair(a, b); pf.nights = (pf.nights || 1) + 1;
        ctx.mod2(a, b, { att: 5 }, { att: 5 });
        /* 「抱く」側は受け攻めの指定どおり */
        var o = HK.Pos ? HK.Pos.order(a, b, [a, b]) : [a, b];
        return { text: ctx.t(ctx.pick(AGAIN), o[0], o[1]), why: 'セフレの関係（' + pf.nights + '回目）' };
      }
    }
  ];
  HK.COMMON = HK.COMMON.concat(F.events);
  /* 判定ラベル */
  HK.LABELS.fwbsettle = { name: 'セフレ', cls: 'night', pol: 1 };
})();
