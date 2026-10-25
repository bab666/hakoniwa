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
  var sim1 = function (input) {
    var res = sim(input);
    try { HK.Voice.processResult(res, input); } catch (e) { /* 台詞の整形に失敗しても結果は返す */ }
    /* モブへの呼びかけの印（mob.js の HK.Mob.addr）が残っていれば、名前に戻す */
    if (HK.Mob && HK.Mob._used) { HK.Mob._used = false; HK.Mob.unmark(res); }
    return res;
  };
  /* 普通の言葉と同じになりやすい名前（漢字一、二字・短いひらがな：「楽」「敬語」など）は、
     箱庭を動かしているあいだだけ名前の前に見えない印（U+2064）を付けておく。
     名前として差し込まれた所には印があり、文の中の同じ言葉（「そのほうが楽」）には印がないので、
     呼び方（〜ちゃん・〜先輩）や話し手の判定は印のある所だけに効く。結果を返す前に印は全部外す */
  var MARK = '\u2064';
  HK.NAME_MARK = MARK;
  function wordish(n) { return /^(?:[\u4e00-\u9fff\u3005]{1,2}|[\u3041-\u3096]{1,3})$/.test(n || ''); }
  function strip(o, seen) {
    if (typeof o === 'string') return o.indexOf(MARK) < 0 ? o : o.split(MARK).join('');
    if (!o || typeof o !== 'object' || seen.indexOf(o) >= 0) return o;
    seen.push(o);
    if (Array.isArray(o)) { for (var i = 0; i < o.length; i++) o[i] = strip(o[i], seen); return o; }
    Object.keys(o).forEach(function (k) { var v = strip(o[k], seen), k2 = k.indexOf(MARK) < 0 ? k : k.split(MARK).join(''); if (k2 !== k) delete o[k]; o[k2] = v; });
    return o;
  }
  HK.simulate = function (input) {
    var cs = (input && input.chars) || [], ren = {};
    cs.forEach(function (c) { if (wordish(c.name) && cs.filter(function (x) { return x.name === c.name; }).length === 1) ren[c.name] = MARK + c.name; });
    if (!Object.keys(ren).length) return sim1(input);
    function rk(m) { if (!m || typeof m !== 'object') return m; var o = {}; Object.keys(m).forEach(function (k) { o[ren[k] || k] = m[k]; }); return o; }
    var in2 = Object.assign({}, input, { chars: cs.map(function (c) { return Object.assign({}, c, { name: ren[c.name] || c.name, calls: rk(c.calls), keigo: rk(c.keigo) }); }) });
    var res = sim1(in2);
    var seen = [];
    strip(res, seen);
    return res;
  };
})();
