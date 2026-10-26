/* 箱庭シミュレーター: 媚薬ロッカー ― 住人の夜の性格（夜の顔）の文を、ロッカーの中の行為に差し込む（R18版のみ）
   文は locker-night-top.js（攻め）・locker-night-bot.js（受け）が作る LK.NIGHT：
     early：キス〜まさぐる〜口（性器の形に依存しない）  top { sadist, mean, sweet, shy } ／ bot { maso, shy, sweet }
     deep ：繋がっている最中（{ mf, fm, ff } で書き分け）
     bound：夜の性格を持つ側が後ろ手に手錠（手が使えない）
   {a}＝攻め・動く側 {b}＝受け。どちらのファイルも無ければ、何も足さない。
   LK.nightLine(S, top, bot, stage, opt) → { text, label }（stage：'early'／'deep'。opt：{ mode: 'mf'|'fm'|'ff', only: 'top'|'bot' }）
   ・夜の性格は HK.Attr.nightOf（攻め→受け・受け→攻め）。全年齢モードでは何も足さない
   ・受けが攻め指定の組には足さない（自分で攻めを選んだ人を受けにしない。attr-r18.js の nightText と同じ）
   ・マゾは受けに回ったときだけ（攻めの文にしない）。受けの文は maso・shy・sweet だけ
   ・点検用：HK.Attr.log が配列なら { who, role: 'a'|'b', night, a, b } を記録する（pos-audit の V5）
   登場人物はすべて成人として扱う */
(function () {
  'use strict';
  var HK = window.HK, LK = HK && HK.LOCKER;
  if (!LK) return;
  var NONE = { text: '', label: '' };
  var NAME = null;
  function nameOf(n) {
    if (!NAME) {
      NAME = {};
      var A = HK.Attr;
      if (A && A.NIGHT) A.NIGHT.forEach(function (x) { NAME[x[0]] = x[1]; });
    }
    return NAME[n] || n;
  }
  /* 候補の配列：bound（手が使えない）→ 段階ごと（deep は mode ごと） */
  function poolOf(side, night, stage, mode, bound) {
    var N = LK.NIGHT;
    if (!N || !night) return null;
    var arr;
    if (bound) arr = N.bound && N.bound[side] && N.bound[side][night];
    else if (stage === 'deep') {
      var d = N.deep && N.deep[side] && N.deep[side][night];
      /* 書き分けのない mode は mf に戻さない（女性どうし・女性の攻めに男性の体の文を当てない）。mode が不明なときだけ mf */
      arr = d && d[mode];
    } else arr = N.early && N.early[side] && N.early[side][night];
    return arr && arr.length ? arr : null;
  }
  LK.nightLine = function (S, top, bot, stage, opt) {
    var A = HK.Attr;
    if (!S || !top || !bot || top === bot || HK.SAFE_ON || !A || !A.nightOf || !LK.NIGHT) return NONE;
    opt = opt || {};
    var only = opt.only, mode = opt.mode === 'ff' || opt.mode === 'fm' ? opt.mode : 'mf';
    var nt = only === 'bot' ? '' : A.nightOf(top, bot), nb = only === 'top' ? '' : A.nightOf(bot, top);
    if (!nt && !nb) return NONE;
    /* 受けが攻め指定の組（向きの決まらない組）には足さない */
    if (HK.Pos && HK.Pos.hardTop && HK.Pos.hardTop(bot, top)) return NONE;
    /* マゾは攻めの文にしない。受けの表は maso・shy・sweet だけ */
    if (nt === 'maso') nt = '';
    if (nb === 'sadist' || nb === 'mean') nb = '';
    var st = stage === 'deep' ? 'deep' : 'early';
    var pt = poolOf('top', nt, st, mode, !!top.bound), pb = poolOf('bot', nb, st, mode, !!bot.bound);
    if (!pt && !pb) return NONE;
    var out = '', labels = [], log = Array.isArray(A.log) ? A.log : null;
    function nm(t) { return t.replace(/\{a\}/g, top.name).replace(/\{b\}/g, bot.name); }
    if (pt) {
      out += nm(LK.pick(S, pt));
      labels.push(top.name + '＝' + nameOf(nt));
      if (log) log.push({ who: top.name, role: 'a', night: nt, a: top.name, b: bot.name });
    }
    if (pb) {
      out += nm(LK.pick(S, pb));
      labels.push(bot.name + '＝' + nameOf(nb));
      if (log) log.push({ who: bot.name, role: 'b', night: nb, a: top.name, b: bot.name });
    }
    return out ? { text: out, label: labels.join('・') } : NONE;
  };
})();
