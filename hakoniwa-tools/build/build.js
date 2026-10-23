/* 箱庭シミュレーター：読み込むスクリプトを2つにまとめる
   node build.js <ビルドのディレクトリ>（hakoniwa-full / hakoniwa-zenrei）
   ・<ビルド>/js/_order.txt が読み込み順の一覧（1行に1ファイル。「late js/xx.js」は画面が出たあとで読む。# から行末はコメント）
   ・先に読む分を js/bundle-main.js、あとで読む分を js/bundle-late.js にまとめ、index.html の
     <!-- scripts:begin --> 〜 <!-- scripts:end --> のあいだを書き換える（?v= は中身から自動で付く）
   ・あとで読む分は、画面が出たあと裏で読み込む。読み終わると HK.LATE_READY = true になり HK.onLate() が呼ばれる */
'use strict';
const fs = require('fs'), path = require('path'), crypto = require('crypto');
const dir = path.resolve(process.argv[2] || '.');
const order = fs.readFileSync(path.join(dir, 'js/_order.txt'), 'utf8').split('\n')
  .map(l => l.replace(/#.*$/, '').trim()).filter(Boolean)
  .map(l => { const m = l.match(/^(late\s+)?(js\/\S+\.js)$/); if (!m) throw new Error('読めない行: ' + l); return { late: !!m[1], f: m[2] }; });
const seen = new Set();
order.forEach(o => { if (seen.has(o.f)) throw new Error('重複: ' + o.f); seen.add(o.f); if (!fs.existsSync(path.join(dir, o.f))) throw new Error('ファイルがない: ' + o.f); });
/* 一覧に載っていない js/*.js を知らせる（読み込み漏れの防止） */
fs.readdirSync(path.join(dir, 'js')).filter(f => /\.js$/.test(f) && !/^bundle-/.test(f)).forEach(f => { if (!seen.has('js/' + f)) console.warn('※ _order.txt に載っていない: js/' + f); });
function cat(list) { return list.map(o => ';/* ==== ' + o.f + ' ==== */\n' + fs.readFileSync(path.join(dir, o.f), 'utf8').replace(/\s+$/, '') + '\n').join(''); }
const main = cat(order.filter(o => !o.late)), late = cat(order.filter(o => o.late));
const hv = s => crypto.createHash('sha1').update(s).digest('hex').slice(0, 10);
fs.writeFileSync(path.join(dir, 'js/bundle-main.js'), main);
fs.writeFileSync(path.join(dir, 'js/bundle-late.js'), late);
const lateUrl = 'js/bundle-late.js?v=' + hv(late);
const block = '<!-- scripts:begin（hakoniwa-tools/build/build.js が書き換える。手で直さず js/_order.txt を直して build する） -->\n' +
  '<script src="js/bundle-main.js?v=' + hv(main) + '"></script>\n' +
  (late ? '<script>(function () { var HK = window.HK; HK.LATE_READY = false; var s = document.createElement(\'script\'); s.src = \'' + lateUrl + '\';\n' +
    '  s.onload = function () { HK.LATE_READY = true; if (HK.onLate) HK.onLate(); };\n' +
    '  s.onerror = function () { HK.LATE_READY = true; HK.LATE_FAILED = true; if (HK.onLate) HK.onLate(); };\n' +
    '  document.body.appendChild(s); })();</script>\n' : '') +
  '<!-- scripts:end -->';
const ip = path.join(dir, 'index.html');
let html = fs.readFileSync(ip, 'utf8');
if (!/<!-- scripts:begin/.test(html)) throw new Error('index.html に <!-- scripts:begin --> がありません');
html = html.replace(/<!-- scripts:begin[\s\S]*?<!-- scripts:end -->/, block);
/* あとで読む分は、先に読む分と並行して先読みしておく */
html = html.replace(/<link rel="preload" as="script" href="js\/bundle-late\.js[^>]*>\n?/g, '');
if (late) html = html.replace('</head>', '<link rel="preload" as="script" href="' + lateUrl + '">\n</head>');
fs.writeFileSync(ip, html);
const kb = n => Math.round(Buffer.byteLength(n) / 1024) + 'KB';
console.log(path.basename(dir) + '：先に読む ' + order.filter(o => !o.late).length + '本 ' + kb(main) + '／あとで読む ' + order.filter(o => o.late).length + '本 ' + kb(late));
