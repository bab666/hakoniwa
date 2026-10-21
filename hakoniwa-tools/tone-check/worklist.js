/* 書き下ろしの作業リスト：その口調で、まだ書き下ろしのない台詞を出現回数の多い順に
   node worklist.js <口調> <件数> <collectの出力.json>...
   環境変数 SCEN=kaihen,succubus で箱庭を絞れる
   出力：順位・回数・箱庭・元の台詞（名前は〈〉）・今の変換結果（「＝」は元のまま） */
'use strict';
const fs = require('fs');
const [tone, N, ...files] = process.argv.slice(2);
if (!tone || !files.length) { console.error('使い方: node worklist.js <口調> <件数> <json>...'); process.exit(1); }
const NM = /アキラ|ミナト|ユキノ|カオル|ハルカ|レンジ/g, m = new Map();
/* SCEN=kaihen,succubus のように箱庭を絞れる */
const ONLY = (process.env.SCEN || '').split(',').filter(Boolean);
for (const f of files) for (const r of JSON.parse(fs.readFileSync(f)).results) for (const x of r.recs) {
  if (x.tone !== tone || !x.raw || x.ov || x.nq || (ONLY.length && ONLY.indexOf(r.id) < 0)) continue;
  if (x.raw.replace(/[…‥、。！？!?っぁぃぅぇぉんあーッ♡〜\s]/g, '').length < 3) continue;
  const k = x.raw.replace(NM, '〈〉'), o = m.get(k) || { n: 0, outs: {}, sc: r.id };
  o.n++; o.outs[x.out.replace(NM, '〈〉')] = 1; m.set(k, o);
}
[...m.entries()].sort((a, b) => b[1].n - a[1].n).slice(0, +N || 100).forEach(([k, o], i) => {
  console.log(i + '\t' + o.n + '\t' + o.sc + '\t' + k + '\t→ ' + Object.keys(o.outs).slice(0, 2).map(x => x === k ? '＝' : x).join(' ／ '));
});
