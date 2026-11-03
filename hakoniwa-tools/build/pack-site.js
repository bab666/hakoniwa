/* 追加パックの点検用の「試しのフォルダ」を作る（2026-11-03）
   node hakoniwa-tools/build/pack-site.js <パックのフォルダ…> --out=<試しのフォルダ> [--codes=<コードのファイル>]
   ・<試しのフォルダ>/hakoniwa-full・hakoniwa-zenrei に本体を写し（.gz・.br は除く）、パックを組み立てて packs/ に入れる
   ・点検は、写したフォルダとコードを渡して回す（lib.js の HK_PACK_CODES・HK_ONLY_SCEN）：
       HK_PACK_CODES=<コード> HK_ONLY_SCEN=<箱庭の id> node hakoniwa-tools/tone-check/audit-all.js --full=<試し>/hakoniwa-full --zen=<試し>/hakoniwa-zenrei
       HK_PACK_CODES=<コード> node hakoniwa-tools/tone-check/tone-feel.js <試し>/hakoniwa-full --scen=<箱庭の id>
   先に本体を build しておく */
'use strict';
const fs = require('fs'), path = require('path'), cp = require('child_process');
const ROOT = path.resolve(__dirname, '../..');
const args = process.argv.slice(2).filter(a => !/^--/.test(a)), flags = process.argv.slice(2).filter(a => /^--/.test(a));
const opt = k => { const f = flags.find(x => x.indexOf('--' + k + '=') === 0); return f ? f.slice(k.length + 3) : null; };
const out = opt('out');
if (!out || !args.length) { console.error('使い方：node hakoniwa-tools/build/pack-site.js <パックのフォルダ…> --out=<試しのフォルダ> [--codes=…]'); process.exit(1); }
const copy = (src, dst) => {
  fs.mkdirSync(dst, { recursive: true });
  fs.readdirSync(src, { withFileTypes: true }).forEach(e => {
    const s = path.join(src, e.name), d = path.join(dst, e.name);
    if (e.isDirectory()) { if (e.name !== 'packs') copy(s, d); }
    else if (!/\.(gz|br)$/.test(e.name)) fs.copyFileSync(s, d);
  });
};
['hakoniwa-full', 'hakoniwa-zenrei'].forEach(b => { const d = path.resolve(out, b); fs.rmSync(d, { recursive: true, force: true }); copy(path.join(ROOT, b), d); });
args.forEach(p => cp.execFileSync(process.execPath, [path.join(__dirname, 'build-pack.js'), p, '--out=' + path.resolve(out)].concat(opt('codes') ? ['--codes=' + opt('codes')] : []), { stdio: 'inherit' }));
console.log('試しのフォルダ：' + path.resolve(out));
