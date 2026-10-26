/* 箱庭シミュレーター: 体の語の印（{…}）の後始末（両ビルド共通。このファイルには性的な語を書かない）
   R18の文では体の語を印で書き、R18版の lewd-words.js が結果を仕上げるときに語へ置き換える（印の一覧と書き方は docs/reports/2026-10-26/lewd-words.md）。
   ここは保険：結果のどこかに印が残っていたら（全年齢モード・全年齢版・置き換えの表がない・記録の外の文）、
   ・R18版で全年齢モードでなく、置き換えの関数（HK.LewdWords.plain）があれば、地の文の列で置き換える
   ・そうでなければ、無難な語（「そこ」など）に替える
   全年齢版の bundle には印そのものが入らない（hakoniwa-tools/build/build.js の検査で止まる）ので、全年齢版でこの後始末が働くことはふつうない */
(function () {
  'use strict';
  var HK = window.HK;
  if (!HK || !HK.simulate || HK.simulate._lewdMark) return;
  /* 印の形：{ と } で挟んだ、かな・漢字の1〜3字。口調の辞書の活用の印（{る}{た}{て}{ない}{よう}{なかった}）や {役} は除く */
  var GEN = /\{([ぁ-ヿ一-鿿]{1,3})\}/g;
  var NOT = { 'る': 1, 'た': 1, 'て': 1, 'ない': 1, 'よう': 1, 'なかった': 1, '役': 1 };
  /* 無難な語（印の名前 → 語。ない印は「そこ」） */
  var SAFE = { '胸': '胸', '尻': '腰', '後ろ': '後ろ', 'ナカ': '奥' };
  function safeText(t) {
    return t.replace(GEN, function (m, k) { return NOT[k] ? m : SAFE[k] || 'そこ'; });
  }
  function has(t) {
    if (t.indexOf('{') < 0) return false;
    GEN.lastIndex = 0;
    var m, hit = false;
    while ((m = GEN.exec(t))) { if (!NOT[m[1]]) { hit = true; break; } }
    GEN.lastIndex = 0;
    return hit;
  }
  function fix(t, env) {
    if (!has(t)) return t;
    var LW = HK.LewdWords;
    if (!HK.SAFE_ON && LW && LW.plain) { try { t = LW.plain(t, env); } catch (e) { /* 下で無難な語に */ } }
    return has(t) ? safeText(t) : t;
  }
  /* 結果の全体をたどって、文字列に残った印を直す */
  function walk(o, env, seen) {
    if (typeof o === 'string') return fix(o, env);
    if (!o || typeof o !== 'object' || seen.has(o)) return o;
    seen.add(o);
    if (Array.isArray(o)) { for (var i = 0; i < o.length; i++) { var v = o[i]; if (v && (typeof v === 'string' || typeof v === 'object')) o[i] = walk(v, env, seen); } return o; }
    Object.keys(o).forEach(function (k) { var v = o[k]; if (v && (typeof v === 'string' || typeof v === 'object')) { var w = walk(v, env, seen); if (w !== v) o[k] = w; } });
    return o;
  }
  HK.LewdMark = { has: has, fix: fix, safe: safeText };
  var sim0 = HK.simulate;
  HK.simulate = function (input) {
    var r = sim0.apply(this, arguments);
    try { if (r && typeof r === 'object') walk(r, (input && input.env) || {}, new Set()); } catch (e) { /* 後始末に失敗しても結果は返す */ }
    return r;
  };
  /* 前の包みの印（_lewd など）を引き継ぐ */
  Object.keys(sim0).forEach(function (k) { HK.simulate[k] = sim0[k]; });
  HK.simulate._lewdMark = true;
})();
