#!/usr/bin/env node
/* デートの日々（追加パック set-b の set-b-date）の舞台と段の点検（2026-11-04。不具合リスト 1104 の 3）
   使い方：node hakoniwa-tools/tone-check/date-setting-audit.js [--why] [--pack=hakoniwa-packs/set-b]
   ページを開かず、パックの js（行き先・段・舞台・文の表）だけを vm で読んで、次を数える（合格は 0 件）：
   (a) 舞台の印の無い行き先（HK.DateSet.TAG）
   (b) 段を持つ行き先で、段の決まっていない行（spot・ev・tr・food。段の表にあるのに行き先に無い名前も）
   (c) 全行き先 × 汎用の文（GEN・TOKI・HEAT・HEAT_NC・BEHX・RICH・BATTARI・C_BATTARI・LUNCH・DINNER）× 出うる区切りで、
       実行時の絞り込み（HK.DateSet.ok）を通るのに、点検の語の表（下の LEX：行き先の説明文・スポットの文の語と舞台の印で見る、実行時とは別の表）で
       舞台に合わない文（例：宇宙旅行で交番・海水浴で傘・水族館でスクリーン）
   (d) 汎用の表の種で、舞台の決まり（HK.DateSet.KIND）も語の決まり（RULE）も当たらないのに、場所の語を含む文（決まりの漏れ） */
'use strict';
const fs = require('fs'), path = require('path'), vm = require('vm');
const ROOT = path.resolve(__dirname, '../..');
const args = process.argv.slice(2), WHY = args.includes('--why');
const PACK = path.resolve(ROOT, (args.find(a => a.startsWith('--pack=')) || '--pack=hakoniwa-packs/set-b').slice(7));
const pj = JSON.parse(fs.readFileSync(path.join(PACK, 'pack.json'), 'utf8'));
const ch = pj.chunks.find(c => c.name === 'date');
const w = { HK: {} }; w.window = w; const cx = vm.createContext(w);
ch.files.filter(f => /date-(?:places|phase|setting|text-)/.test(f)).forEach(f => vm.runInContext(fs.readFileSync(path.join(PACK, f), 'utf8'), cx, { filename: f }));
const HK = w.HK, P = HK.DatePlaces, DS = HK.DateSet, PH = HK.DatePhase, T = HK.DateText;
const bad = { a: [], b: [], c: [], d: [] };
/* (a) */
P.list.forEach(d => { if (!DS.TAG[d.id]) bad.a.push(d.id + '（' + d.name + '）'); });
/* (b) */
const KINDS = ['spot', 'ev', 'tr', 'food'];
P.list.filter(d => d.ph).forEach(d => {
  KINDS.forEach(k => (d[k] || []).forEach(r => r[1].forEach(t => { const key = PH.of(d, k, r[0], t); if (PH.idx(d, key) === -3) bad.b.push(d.name + '：' + k + '「' + r[0] + '」の段が無い'); })));
  Object.keys(d.ph.map).forEach(k => Object.keys(d.ph.map[k]).forEach(nm => { if (!(d[k] || []).some(r => r[0] === nm)) bad.b.push(d.name + '：段の表の ' + k + '「' + nm + '」が行き先に無い'); }));
});
bad.b = [...new Set(bad.b)];
/* (c) 点検の語の表：語 → 合う条件（tags＝舞台の印、C＝行き先の文の全部） */
const has = (tg, x) => tg.indexOf(x) >= 0;
const LEX = [
  [/交番/, (tg) => has(tg, 'city') && !has(tg, 'abroad') && !has(tg, 'space')],
  [/傘/, (tg) => has(tg, 'out') && !has(tg, 'space') && !has(tg, 'water')],
  [/雨|軒下/, (tg) => has(tg, 'out')],
  [/コンビニ|信号|横断歩道|自転車|路地/, (tg) => has(tg, 'city') && !has(tg, 'space')],
  [/電車|駅|改札/, (tg) => has(tg, 'city')],
  [/スクリーン|客席|肘掛け|上映/, (tg, C) => /スクリーン|客席|上映|座席|シート/.test(C)],
  [/ゴンドラ|観覧車/, (tg, C) => /ゴンドラ|観覧車/.test(C)],
  [/屋台/, (tg, C) => /屋台|露店|縁日|夜店|売店|出店/.test(C) || has(tg, 'stall')],
  [/水槽/, (tg, C) => /水槽/.test(C)],
  [/人混み|人波|人の波|人通り|混み合|混雑/, (tg, C) => has(tg, 'crowd') || /人混み|人波|行列|混み|大勢|人だかり/.test(C)],
  [/店の人|店員|レジ|会計|伝票/, (tg, C) => /店|売店|売り場|カフェ|レストラン|係の人|受付|窓口/.test(C)],
  [/お土産|雑貨屋/, (tg, C) => /店|売店|売り場|みやげ|土産|グッズ|ショップ/.test(C)],
  [/定食屋|ラーメン屋|洋食屋|居酒屋|焼肉|お寿司|パン屋/, (tg) => has(tg, 'city') && !has(tg, 'abroad') && !has(tg, 'space') && !has(tg, 'vehicle')],
  [/ヘリコプター|ジェット機|空港|リムジン|眼下で小さく/, (tg) => !has(tg, 'space')],
  [/屋上/, (tg, C) => !has(tg, 'space') && (has(tg, 'city') || /屋上/.test(C))],
  [/ベンチ/, (tg, C) => !has(tg, 'space') && !has(tg, 'home')],
  [/自販機/, (tg) => !has(tg, 'space') && !has(tg, 'home')],
  [/日差し|日陰|葉っぱ/, (tg) => has(tg, 'out')],
  [/夜景/, (tg) => has(tg, 'night')],
  [/展示/, (tg, C) => /展示|展示室|標本|模型/.test(C) || has(tg, 'exhibit')],
  [/閉館/, (tg) => has(tg, 'in') && !has(tg, 'home') && !has(tg, 'space')],
  [/道に迷|近道|地図|行き止まり|来た道/, (tg) => !has(tg, 'home') && !has(tg, 'space') && !has(tg, 'vehicle')],
  [/歩い|歩き|歩く|歩幅|段差|石段|靴擦れ/, (tg) => has(tg, 'walk')],
  [/行きの座席|着くまで/, (tg) => has(tg, 'move')],
  [/波打ち際|砂浜|浜辺/, (tg) => has(tg, 'water')],
  [/知らない人に(?:声|話)/, (tg) => has(tg, 'crowd')]
];
/* 汎用の表と、出うる区切り（date.js で呼ぶ所に合わせる） */
const L = (o, k) => (o && o[k]) || [];
const flat = (o) => Array.isArray(o) ? o : o && typeof o === 'object' ? [].concat(...Object.keys(o).map(k => flat(o[k]))) : typeof o === 'string' ? [o] : [];
const GT = [];
Object.keys(T.GEN || {}).forEach(k => GT.push({ key: 'GEN.' + k, parts: k === 'chikoku' ? ['am'] : ['am', 'pm'], lines: flat(T.GEN[k]) }));
const TOKI_AT = { negao: /mv|ev/, aiai: /am|pm|mv/, hagure: /am|pm/, uwagi: /pm|ev|mv/, kabau: /am|pm|mv/, nomimono: /am|pm/, tesashi: /am|pm|mv/ };
Object.keys(T.TOKI || {}).forEach(k => GT.push({ key: 'TOKI.' + k, parts: ['mv', 'am', 'pm', 'ev'].filter(p => !TOKI_AT[k] || TOKI_AT[k].test(p)), lines: flat(T.TOKI[k]) }));
Object.keys(T.HEAT || {}).forEach(k => GT.push({ key: 'HEAT.' + k, parts: ['am', 'pm', 'ev'], lines: flat(T.HEAT[k]), heat: k }));
Object.keys(T.HEAT_NC || {}).forEach(k => GT.push({ key: 'HEAT_NC.' + k, parts: ['am', 'pm', 'ev'], lines: flat(T.HEAT_NC[k]), heat: k }));
GT.push({ key: 'BEHX', parts: ['pm', 'ev'], lines: flat(T.BEHX) });
(T.RICH || []).forEach(r => GT.push({ key: 'RICH.' + r[0], parts: ['ev'], lines: r[2] }));
GT.push({ key: 'BATTARI', parts: ['am', 'pm', 'ev'], lines: flat(T.BATTARI) });
GT.push({ key: 'C_BATTARI', parts: ['am', 'pm', 'ev'], lines: flat(T.C_BATTARI) });
GT.push({ key: 'LUNCH', parts: ['pm'], lines: (T.LUNCH || []).map(r => r[1]).flat() });
GT.push({ key: 'DINNER', parts: ['ev'], lines: (T.DINNER || []).map(r => r[1]).flat() });
/* やらしい雰囲気の場所の鍵が、その行き先で選ばれうるか（date.js の heatPlace と同じ） */
const fl = (d, x) => (' ' + (d.flags || '') + ' ').indexOf(' ' + x + ' ') >= 0;
const heatOk = (d, k, part) => k === 'all' || k === 'quiet' || k === 'car' || (k === 'dark' ? fl(d, 'dark') || !!(d.ph && (d.ph.dark || d.ph.darkSpot)) : k === 'kanran' ? fl(d, 'kanran') : k === 'view' ? fl(d, 'view') && part === 'ev' : k === 'crowd' ? true : true);
let pass = 0;
P.list.forEach(d => {
  const C = [d.name, d.label || '', d.inn || ''].concat(...['spot', 'ev', 'tr', 'food', 'cl'].map(k => (d[k] || []).map(r => r[0] + ' ' + r[1].join(' '))), (d.rich || []).map(r => r[0] + ' ' + r[2].join(' '))).join(' ');
  GT.forEach(g => g.parts.forEach(part => {
    if (g.heat && !heatOk(d, g.heat, part)) return;
    g.lines.forEach(t => {
      if (!DS.ok(d, t, g.key, part)) return;
      pass++;
      const tg = DS.tags(d, part);
      LEX.forEach(([re, ok]) => { const m = re.exec(t); if (m && !ok(tg, C)) bad.c.push(d.name + '（' + part + '）' + g.key + '「' + m[0] + '」：' + t.slice(0, 60)); });
    });
  }));
});
bad.c = [...new Set(bad.c)];
/* (d) 決まりの漏れ：場所の語を含むのに、どの決まりにも当たらない汎用の文 */
const PLACE_W = /交番|傘|雨|コンビニ|信号|駅|改札|スクリーン|客席|ゴンドラ|観覧車|屋台|水槽|人混み|人波|店の人|店員|レジ|会計|お土産|ヘリコプター|ジェット機|ベンチ|自販機|日差し|夜景|展示|閉館|地図|歩い|歩き|波打ち際|砂浜/;
const anyRule = (key, t) => !!(DS.KIND[key] || DS.KIND[key.split('.')[0]]) || DS.RULE.some(r => r.re.test(t));
GT.forEach(g => g.lines.forEach(t => { if (PLACE_W.test(t) && !anyRule(g.key, t)) bad.d.push(g.key + '：' + t.slice(0, 60)); }));
bad.d = [...new Set(bad.d)];
const N = bad.a.length + bad.b.length + bad.c.length + bad.d.length;
const NAME = { a: '(a) 舞台の印の無い行き先', b: '(b) 段の決まっていない行', c: '(c) 舞台に合わない汎用の文', d: '(d) 決まりの漏れ' };
console.log('行き先 ' + P.list.length + ' か所（段を持つ ' + P.list.filter(d => d.ph).length + '）× 汎用の表 ' + GT.length + ' 種：通った組 ' + pass);
Object.keys(bad).forEach(k => { console.log(NAME[k] + '：' + bad[k].length + ' 件'); if (bad[k].length) bad[k].slice(0, WHY ? 999 : 8).forEach(x => console.log('  ' + x)); });
console.log('date-setting：' + N + ' 件');
process.exit(N ? 1 : 0);
