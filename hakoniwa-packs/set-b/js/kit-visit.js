/* セットB の部屋の共通部品：他の住人と二人の関係の読み方（両方のビルド。2026-11-03。新婚生活の shinkon-visit.js から、看病の部屋でも使う部分を共通のかたまり kit に移した）
   ■ HK.PairVisit（V）
     ・V.cls(ctx, a, g)：二人の一人 a と、他の住人 g の関係の種類。fam（家族）／pfam（擬似親子）／known（友人・親友・幼なじみ・相棒・恩人）／weak（知人）／
       work（同僚・上司・先輩後輩）／school（同級生・先生・師弟）／ex（元恋人）。恋人・片想い・執着・不仲・敵対・主従などの関係は訪れの相手にしない（null）
     ・V.word(ctx, a, g)：a から見た g の呼び名（友人・きょうだい・同僚・先輩 など）
     ・V.here(c)：生きていて閉じ込められていない人か（HK.State.here を、出番の外の「留守」の印 gone を外して確かめる）
   名簿から訪れた住人（印 outside）は関係図・二人ずつ・住人ごとの結果に出さず（kit-cast.js の strip）、関係の値も動かさない。訪れた住人から恋愛・告白・体の関係は始まらない */
(function () {
  'use strict';
  var HK = window.HK;
  if (!HK) return;
  var CLS = { parent: 'fam', sibling: 'fam', sibprot: 'fam', sibclose: 'fam', twin: 'fam', stepsib: 'fam', relative: 'fam', pparent: 'pfam',
    friend: 'known', best: 'known', buddy: 'known', childhood: 'known', benefactor: 'known', acq: 'weak',
    colleague: 'work', boss: 'work', senpai: 'work', classmate: 'school', teacher: 'school', mentor: 'school', ex: 'ex' };
  /* 訪れの相手にしない関係（どれか一つでもあれば出さない） */
  var NG = /^(lover|spouse|mate|fated|fiance|fwb|crush|almost|honmei|yan|enemy|bad|sibbad|rival|abuse|master|worship|apathy|fear|noobs)$/;
  var WORD = { parent: '家族', sibling: 'きょうだい', sibprot: 'きょうだい', sibclose: 'きょうだい', twin: 'きょうだい', stepsib: 'きょうだい', relative: '親戚', pparent: '家族同然の人',
    friend: '友人', best: '親友', buddy: '相棒', childhood: '幼なじみ', benefactor: '恩人', acq: '知り合い', colleague: '同僚', boss: '職場の人', classmate: '同級生', ex: '元恋人' };
  function ties(ctx, a, g) { return HK.Ties && HK.Ties.all ? HK.Ties.all(ctx, a, g) || [] : []; }
  var V = HK.PairVisit = { CLS: CLS, NG: NG, WORD: WORD };
  V.cls = function (ctx, a, g) {
    var tl = ties(ctx, a, g), best = null, ORD = ['ex', 'fam', 'pfam', 'known', 'work', 'school', 'weak'];
    if (!tl.length) return null;
    if (tl.some(function (t) { return NG.test(t.type) || t.cold === 'fear' || t.cold === 'apathy'; })) return null;
    tl.forEach(function (t) { var c = CLS[t.type]; if (c && (!best || ORD.indexOf(c) < ORD.indexOf(best))) best = c; });
    if (HK.Ties.apathy && (HK.Ties.apathy(ctx, a, g) || HK.Ties.apathy(ctx, g, a))) return null;
    return best;
  };
  V.word = function (ctx, a, g) {
    var tl = ties(ctx, a, g);
    for (var i = 0; i < tl.length; i++) {
      var t = tl[i];
      if (t.type === 'senpai') return t.a === a.i ? '後輩' : '先輩';
      if (t.type === 'teacher') return t.a === a.i ? '教え子' : '先生';
      if (t.type === 'mentor') return t.a === a.i ? '弟子' : '師匠';
      if (WORD[t.type]) return WORD[t.type];
    }
    return '知り合い';
  };
  V.here = function (c) { if (!c) return false; var g0 = c.gone; c.gone = false; var ok = HK.State && HK.State.here ? HK.State.here(c) : c.alive !== false; c.gone = g0; return ok; };
})();
