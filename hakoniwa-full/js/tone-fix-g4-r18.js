/* 口調ごとの書き下ろし・直し（第4組、R18版だけに出る台詞）。形式は tone-fix-r18.js と同じ：'口調\t元の台詞\t書き下ろし'。
   一人称は「私」で書き、人名は〈〉。ここにある台詞は、ほかの言い換えを通さずにそのまま使う（あとから読む分が優先） */
(function () {
  var V = HK.Voice, FIX = V.TONE_FIX = V.TONE_FIX || {};
  [
  ].forEach(function (row) { var c = row.split('\t'); (FIX[c[0]] = FIX[c[0]] || {})[c[1]] = c[2]; });
})();
