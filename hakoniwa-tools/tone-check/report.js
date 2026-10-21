/* 口調ごとの成績：元の文のまま残る割合・書き下ろしが使われる割合・意味の消えた台詞（「……」だけ）の割合
   node report.js <collectの出力.json>... */
'use strict';
const fs = require('fs');
const files = process.argv.slice(2);
const S = {};
/* 敬語とため口が混ざる：文（。！？で区切る）ごとの語尾を見て、敬語の文とため口の文が両方あるか */
const PEND = /(です|ます|ません|でした|ました|ください|でしょう|ございます|ましょう)(?:か|よ|ね|よね|けど|から)?$/;
function mixed(out) {
  const ss = out.split(/[。！？!?]+/).map(t => t.replace(/[…‥、っー〜\s]+$/, '').replace(/^[…‥、\s]+/, '')).filter(t => t.length >= 2);
  let p = 0, c = 0; ss.forEach(t => { if (PEND.test(t)) p++; else c++; });
  return p > 0 && c > 0;
}
for (const f of files) for (const r of JSON.parse(fs.readFileSync(f)).results) for (const x of r.recs) {
  if (!x.raw || x.nq || x.raw.replace(/[…‥、。！？!?っぁぃぅぇぉんあーッ♡〜\s]/g, '').length < 3) continue;
  const o = S[x.tone] = S[x.tone] || { n: 0, same: 0, ov: 0, dots: 0, mix: 0 };
  o.n++; if (mixed(x.out)) o.mix++; if (x.out === x.raw) o.same++; if (x.ov) o.ov++; if (/^[…‥。、？！!?っ\s]*$/.test(x.out)) o.dots++;
}
const pct = (a, b) => (a / b * 100).toFixed(1).padStart(5) + '%';
console.log('口調'.padEnd(12) + '台詞数  元のまま  書き下ろし  「……」だけ  敬語とため口が混ざる');
Object.keys(S).sort().forEach(t => { const o = S[t]; console.log(t.padEnd(12) + String(o.n).padStart(6) + '  ' + pct(o.same, o.n) + '   ' + pct(o.ov, o.n) + '     ' + pct(o.dots, o.n) + '       ' + pct(o.mix, o.n)); });
