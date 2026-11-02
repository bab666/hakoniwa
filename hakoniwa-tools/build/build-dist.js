/* 箱庭シミュレーター：データ配布版の本体の zip を作る（追加パックの zip は build-pack.js --dist）
   node hakoniwa-tools/build/build-dist.js <ビルドのフォルダ（hakoniwa-full / hakoniwa-zenrei）> [--name=<zip の中のフォルダ名>] [--out=<出力先のフォルダ>]
   ・入れるもの：index.html・js/c の今のかたまり（js/c/.prev.json の cur。.gz・.br は入れない）・ほかの最上位のファイル（ogp.png・pass-gate.js など）と、
     空の packs フォルダ（置き方の説明 packs/はじめにお読みください.txt だけ）
   ・入れないもの：js のソース（js/*.js。配布版は js/c のかたまりだけで動く）・サーバの設定（.htaccess・_headers）・packs/index.js（サイト公開版用）・packs/set-*（追加パックは別の zip）
   ・データ配布版の本体は packs/index.js が無いので、決まった名前の枠（packs/set-a〜set-l）を全部読みに行き、置いてあるパックだけを使う（js/packs.js）
   先に本体を build しておく（index.html の目録と js/c のかたまりを使う） */
'use strict';
const fs = require('fs'), path = require('path');
const Z = require('./zip.js');
process.on('uncaughtException', e => { console.error('※ 配布用の zip を作れませんでした：' + (e && e.message || e)); process.exit(1); });
const ROOT = path.resolve(__dirname, '../..');
const args = process.argv.slice(2).filter(a => !/^--/.test(a)), flags = process.argv.slice(2).filter(a => /^--/.test(a));
const opt = k => { const f = flags.find(x => x.indexOf('--' + k + '=') === 0); return f ? f.slice(k.length + 3) : null; };
const dir = path.resolve(args[0] || '');
if (!fs.existsSync(path.join(dir, 'index.html'))) throw new Error('使い方：node hakoniwa-tools/build/build-dist.js <ビルドのフォルダ> [--name=…] [--out=…]');
const top = opt('name') || path.basename(dir);
const prev = JSON.parse(fs.readFileSync(path.join(dir, 'js/c/.prev.json'), 'utf8'));
const html = fs.readFileSync(path.join(dir, 'index.html'), 'utf8');
const files = [];
const add = (rel, data) => files.push({ name: top + '/' + rel, data: data || fs.readFileSync(path.join(dir, rel)) });
add('index.html');
Object.values(prev.cur || {}).forEach(f => add('js/c/' + f));
/* 目録が指すかたまりが全部入っているか */
const want = (html.match(/js\/c\/[a-z0-9-]+\.[0-9a-f]{10}\.js/g) || []);
want.forEach(w => { if (!files.some(x => x.name === top + '/' + w)) throw new Error('目録のかたまりが js/c にありません: ' + w + '（本体を build し直してください）'); });
fs.readdirSync(dir).forEach(f => {
  const fp = path.join(dir, f);
  if (!fs.statSync(fp).isFile() || f === 'index.html' || /^\./.test(f) || f === '_headers') return;
  add(f);
});
const README = [
  'このフォルダに追加パック（追加の箱庭のセット）を置きます。',
  '',
  '1. 購入した追加パックの zip を開くと、packs フォルダの中に set-a などのフォルダがあります。',
  '2. その set-a などのフォルダを、このフォルダ（packs）の中にそのまま入れてください。',
  '   例：' + top + '/packs/set-a/pack.js',
  '3. index.html を開き、「箱庭を選ぶ」の一覧の最後にある「箱庭を追加」で、購入したコードを入れてください。',
  '',
  '・コードは一度入れればこの端末に覚えておくので、次からは入れなくても使えます。',
  '・本体を新しい版に入れ替えるときは、この packs フォルダを新しい本体のフォルダに移してください。',
  '・追加パックのフォルダが無いときは、「箱庭を追加」は出ません。'
].join('\r\n') + '\r\n';
files.push({ name: top + '/packs/はじめにお読みください.txt', data: Buffer.from('﻿' + README, 'utf8') });
const outDir = path.resolve(opt('out') || path.join(ROOT, 'dist'));
fs.mkdirSync(outDir, { recursive: true });
const zp = path.join(outDir, top + '.zip');
Z.writeZip(zp, files);
const kb = n => Math.round(n / 1024) + 'KB';
console.log('データ配布版の本体：' + zp + '（' + files.length + 'ファイル・' + kb(fs.statSync(zp).size) + '）');
