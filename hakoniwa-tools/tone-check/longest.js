// 長い台詞順の作業リスト: node longest.js <口調> <件数> <collect.js の出力.json>...
// 長い台詞ほど言い換えの継ぎ目が目立つので、変換後の長さの順に「元の台詞 ⇒ 変換後」を並べる（同じ台詞は1回、出現回数つき）。
// 喘ぎだけの台詞・書き下ろし済み（ov）は後回しにしたいときは SKIP_OV=1
const fs = require('fs');
const [tone, N = '100', ...files] = process.argv.slice(2);
if (!tone || !files.length) { console.error('usage: node longest.js <tone> <N> out.json...'); process.exit(1); }
const m = new Map();
for (const f of files) {
  const d = JSON.parse(fs.readFileSync(f, 'utf8'));
  for (const r of d.results) for (const x of r.recs) {
    if (x.tone !== tone || x.nq) continue;
    if (process.env.SKIP_OV && x.ov) continue;
    const k = x.raw;
    const e = m.get(k) || { raw: x.raw, out: x.out, n: 0, scen: r.id };
    e.n++; m.set(k, e);
  }
}
const list = [...m.values()].sort((a, b) => b.out.length - a.out.length || b.n - a.n).slice(0, +N);
for (const e of list) console.log(`${e.out.length}\t${e.n}\t${e.scen}\t${e.raw}\t${e.out}`);
