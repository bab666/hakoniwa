/* 口調ごとの書き下ろし：箱庭「バトルロワイヤル（全年齢版）」（br）だけに出る台詞（2026-11-04 に tone-fix.js・tone-fix-g2.js から分けた。両方のビルドに置く）
   形式は tone-fix.js と同じ：'口調\t元の台詞\t書き下ろし'。一人称は「私」、人名は〈〉。ここにある台詞は、ほかの言い換えを通さずにそのまま使う。
   この箱庭の台詞の書き下ろしを足すときは、このファイルに書く（共通の台詞は tone-fix.js）。build が口調のデータとして読み、箱庭だけの行はこの箱庭のかたまりに入れる
   第1組＝tone-fix.js の形（印なし）／第2組＝tone-fix-g2.js の形（G の印つき：派生の口調には引き継がない） */
(function () {
  var V = HK.Voice, FIX = V.TONE_FIX = V.TONE_FIX || {}, GK = V.TONE_FIX_G = V.TONE_FIX_G || {};
  /* 第1組 */
  [
    'gentle\tお前が先に食え\tきみが先に食べて',
  ].forEach(function (row) { var c = row.split('\t'); (FIX[c[0]] = FIX[c[0]] || {})[c[1]] = c[2]; });
  /* 第2組 */
  [
    'sondai\tこんなゲーム、終わらせてやる\tこんなゲーム、終わらせてやろう',
  ].forEach(function (row) { var c = row.split('\t'); (FIX[c[0]] = FIX[c[0]] || {})[c[1]] = c[2]; (GK[c[0]] = GK[c[0]] || {})[c[1]] = 1; });
})();
