// 使い方: node tips-zenrei.js <full版のtips-scen-X.js> <全年齢版の出力先> <全年齢版index.html> <全年齢版の箱庭ID一覧JSON（HK.SCEN_ORDER）>
// full版の tips-scen-X.js から全年齢版用を作る：全年齢版にない箱庭を除き、r18 の項目を外す
const fs = require('fs'), vm = require('vm');
const [src, dst, zidx] = process.argv.slice(2);
const html = fs.readFileSync(zidx, 'utf8');
const win = { HK: {} }; vm.runInNewContext(fs.readFileSync(src, 'utf8'), { window: win });
// 全年齢版の箱庭一覧を実際に読み込んで取る
const ids = JSON.parse(fs.readFileSync(process.argv[5], 'utf8'));
const T = win.HK.TIPS_SCEN, keep = Object.keys(T).filter(id => ids.includes(id));
const head = '/* 箱庭シミュレーター: 箱庭ごとのTIPS（' + keep.map(id => (T[id] && id)).join('・') + '）。表示は tips.js\n   全年齢版用：hakoniwa-full の同名ファイルから、全年齢版にある箱庭だけを取り出して作る */';
let out = head + '\n(function () {\n  \'use strict\';\n  var HK = window.HK, T = HK.TIPS_SCEN = HK.TIPS_SCEN || {};\n';
const DROP = /性的|挿入|絶頂|セックス|射精|快楽|R18版|描写の作風/;
const WORD = [[/発情していた/g, '火照っていた'], [/発情して/g, '火照って'], [/発情し/g, '火照っ'], [/発情/g, '火照り'], [/快感/g, '高鳴り'], [/堕ち度/g, '揺らぎ'], [/堕ちた/g, '流された'], [/堕ち/g, '流され']];
const fix = x => WORD.reduce((a, w) => a.replace(w[0], w[1]), x);
const dropped = [];
const clean = arr => (arr || []).filter(x => { if (DROP.test(x)) { dropped.push(x); return false; } return true; }).map(fix);
for (const id of keep) { const o = Object.assign({}, T[id]); delete o.r18; if (o.lead) o.lead = fix(o.lead); o.sections = (o.sections || []).map(s => ({ h: s.h, items: clean(s.items) })).filter(s => s.items.length); o.safe = clean(o.safe); out += '  T.' + id + ' = ' + JSON.stringify(o, null, 2).replace(/\n/g, '\n  ') + ';\n'; }
out += '})();\n';
fs.writeFileSync(dst, out);
console.log(dst, keep.join(','), '\nDROPPED:\n' + dropped.join('\n'));
