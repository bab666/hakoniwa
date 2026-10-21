/* 箱庭シミュレーター: 口調・声の仕上げ（すべての箱庭を読み込んだあとに実行）
   ・「敬語」用の行がない表は、近い口調（健気）の行を使う。台詞は voice.js がです・ます調に整える
   ・シミュレーション結果の台詞に、一人称と敬語を反映する */
(function () {
  'use strict';
  var HK = window.HK, DG = HK.DG;
  function fill(t, from) { if (t && typeof t === 'object' && !t.polite && t[from || 'devoted']) t.polite = t[from || 'devoted']; }
  if (DG) {
    ['TAILS', 'CLIMAX', 'ENDURE'].forEach(function (k) { fill(DG[k]); });
    if (DG.RICH) Object.keys(DG.RICH).forEach(function (k) { fill(DG.RICH[k]); });
  }
  var M = HK.MassageMore;
  if (M) { fill(M.REACT); fill(M.SLEEP_WAKE); fill(M.AFTERSHOP); (M.INCIDENTS || []).forEach(function (x) { fill(x.r); }); }
  var X = HK.HoleMore;
  if (X) { fill(X.MIND); fill(X.CONFUSE); fill(X.THIS_REACT); }
  fill(HK.Voice.CLIMAX); fill(HK.Voice.EDGE); fill(HK.Voice.AFTER); fill(HK.Voice.TALK);

  var sim = HK.simulate;
  HK.simulate = function (input) {
    var res = sim(input);
    try { HK.Voice.processResult(res, input); } catch (e) { /* 台詞の整形に失敗しても結果は返す */ }
    return res;
  };
})();
