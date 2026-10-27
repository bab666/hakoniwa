/* 箱庭シミュレーター：読み込むスクリプトを「かたまり」にまとめ、目録（HK_MANIFEST）を index.html に書き込む
   node build.js <ビルドのディレクトリ>（hakoniwa-full / hakoniwa-zenrei） [--best] [--no-min] [--no-guard] [--all] [--soft] [--no-manifest]
   ・<ビルド>/js/_order.txt が読み込み順の一覧（全部読んだときの元の順。# から行末はコメント）。1行の書き方：
       js/xx.js                     … 中核（core。起動時に読む）
       late js/xx.js                … late（画面が出たあと裏で読む。読み終わると HK.LATE_READY = true・HK.onLate()）
       js/xx.js @pack:rel           … かたまり pack-rel（族の共有。選んだ箱庭が要るときに読む）
       js/xx.js @scen:goukon        … かたまり scen-goukon（箱庭ごと）
       @chunk pack-story deps=pack-rel   … かたまりの依存（先に読むかたまり。カンマ区切り）
       @need goukon pack-rel        … その箱庭を動かすのに要るかたまり（登録するかたまりのほかに。カンマ区切り。deps はたどらなくてよい）
     ファイルには「全部読んだときの実行順」で 1 から通し番号を振る（HK.Load.def の第1引数。HK.wrap／HK.addTo の並べ替えの鍵）：
     late 以外（注記なし・@pack・@scen）の行を並びの順に 1 から、その後ろに late の行を並びの順に続ける（今までの bundle-main → bundle-late の実行順と同じ）。
   ・かたまりごとに、ファイルを HK.Load.def(<通し番号>, 'js/xx.js', function () { …元の中身… }); で包んで連結し、
     最後に HK.Load.done('<名前>', '<hash>', 1); を付けて js/c/<名前>.<hash>.js に書く（hash は軽量化後の本文の sha1 の10桁）。
     core の先頭は js/load.js（読み込み器。包まない）。_order.txt に書くなら先頭の行に注記なしで。書かなければ build が先頭に足す。
     包んでも意味が変わらないように、最上位に var／let／const／function／class の宣言や 'use strict' があるファイルはエラーで止める。
   ・index.html の <!-- scripts:begin --> 〜 <!-- scripts:end --> に、目録（window.HK_MANIFEST）と core の script 要素を書く。
     目録は node の vm で core → 各かたまりを実行して作る（build-manifest.js）。--no-manifest なら vm を回さず、箱庭の情報は前回の目録のまま（かたまりの名前だけ新しくする）
   ・js/c/ には今回と前回（1世代前）のかたまりだけを残し、それより古いものは消す（開いたままのページが 404 にならないように）。前回の名前は js/c/.prev.json。
     以前の js/bundle-main.js・bundle-late.js（と .gz/.br）は消す
   ・全年齢版（index.html に window.HK_SAFE_BUILD = 1 がある）のビルドでは、R18の文を抜く：
       ソースの中で、行全体が「/＊ r18:begin ＊/」と「/＊ r18:end ＊/」（半角）の行に挟まれた部分を、かたまりから落とす
       （js/ のソースは R18版とバイト一致のまま。全年齢版の index.html が読むのはかたまりだけ）。
       抜いたあとのかたまりを acorn で字句に分け、文字列リテラルに性的な語（EXPLICIT）が残っていればエラーにしてビルドを止める。目録の文字列も同じく調べる
       （コメント・正規表現は見ない。全年齢版で使ってよい語の行は、その行に「/＊ r18:ok ＊/」（半角）を書く）。
       --no-guard を付けると、エラーでも止めない（移行作業の途中だけ）。--all で残りを全部、--soft で二段目（HARD）の一覧も出す
   ・軽量化（両ビルド。全年齢版の検査のあと。かたまりごと）：コメント・字下げ・空行を落とす（字句は変えない。build-min.js）。--no-min で軽量化しない
   ・事前圧縮：かたまりごとに .gz／.br も作る（サーバが Accept-Encoding を見て返す。.htaccess）。中身が同じなら作り直さない。
       .br はふだん品質9、公開の前は --best で品質11（1割ほど小さくなるが、作るのに1分ほどかかる） */
'use strict';
const fs = require('fs'), path = require('path'), crypto = require('crypto'), zlib = require('zlib');
/* 書式の誤りなどは、場所の分かる一文だけを出して止める（DEBUG=1 なら詳しく） */
process.on('uncaughtException', e => { console.error('※ ビルドを止めました：' + (e && e.message || e)); if (process.env.DEBUG) console.error(e && e.stack); process.exit(1); });
const M = require('./build-min.js'), MF = require('./build-manifest.js');
const args = process.argv.slice(2).filter(a => !/^--/.test(a)), flags = process.argv.slice(2).filter(a => /^--/.test(a));
const flag = f => flags.indexOf(f) >= 0;
const dir = path.resolve(args[0] || '.');
const ip = path.join(dir, 'index.html');
if (!fs.existsSync(ip)) throw new Error('index.html がありません: ' + ip);
let html = fs.readFileSync(ip, 'utf8');
const STRIP = /HK_SAFE_BUILD\s*=\s*1/.test(html.replace(/<!-- scripts:begin[\s\S]*?<!-- scripts:end -->/, ''));
const BUILD = STRIP ? 'zenrei' : 'full';
const NAME = /^[a-z0-9-]+$/, LOADF = 'js/load.js';
const hv = s => crypto.createHash('sha1').update(s).digest('hex').slice(0, 10);

/* ---------- _order.txt を読む ---------- */
const orderPath = path.join(dir, 'js/_order.txt');
const entries = [], chunkDeps = {}, needs = {}, seen = new Set();
fs.readFileSync(orderPath, 'utf8').split('\n').forEach((line, i) => {
  const l = line.replace(/#.*$/, '').trim(), at = '_order.txt の ' + (i + 1) + '行目「' + line.trim() + '」：';
  if (!l) return;
  let m;
  if ((m = l.match(/^@chunk\s+(\S+)(?:\s+deps=(\S*))?$/))) {
    if (!NAME.test(m[1])) throw new Error(at + 'かたまりの名前は英小文字・数字・- だけにしてください');
    if (chunkDeps[m[1]]) throw new Error(at + '同じかたまりの @chunk が2回あります');
    chunkDeps[m[1]] = (m[2] || '').split(',').filter(Boolean);
    return;
  }
  if ((m = l.match(/^@need\s+(\S+)\s+(\S+)$/))) {
    (needs[m[1]] = needs[m[1]] || []).push(...m[2].split(',').filter(Boolean));
    return;
  }
  if (/^@/.test(l)) throw new Error(at + '読めない指示です（@chunk <名前> deps=a,b か @need <箱庭> <かたまり,…>）');
  m = l.match(/^(late\s+)?(js\/[^\s@'"\\]+\.js)(?:\s+@(pack|scen):(\S+))?$/);
  if (!m) {
    if (/^late\s+\S+\s+@/.test(l)) throw new Error(at + 'late と @pack:／@scen: は一緒に付けられません');
    if (/\s@\S+\s+@/.test(l)) throw new Error(at + '注記は1つだけです');
    if (/\s@/.test(l)) throw new Error(at + '注記は @pack:<族> か @scen:<箱庭の id> です');
    throw new Error(at + '読めない行です（js/xx.js、late js/xx.js、js/xx.js @pack:<族>、js/xx.js @scen:<id>）');
  }
  if (m[1] && m[3]) throw new Error(at + 'late と @pack:／@scen: は一緒に付けられません');
  const chunk = m[1] ? 'late' : m[3] ? m[3] + '-' + m[4] : 'core';
  if (!NAME.test(chunk)) throw new Error(at + 'かたまりの名前（' + chunk + '）は英小文字・数字・- だけにしてください');
  if (seen.has(m[2])) throw new Error(at + '重複しています: ' + m[2]);
  if (!fs.existsSync(path.join(dir, m[2]))) throw new Error(at + 'ファイルがありません: ' + m[2]);
  seen.add(m[2]);
  entries.push({ n: entries.length + 1, f: m[2], chunk });
});
/* 通し番号は実行順：late 以外を並びの順に、そのあと late を並びの順に */
entries.filter(e => e.chunk !== 'late').concat(entries.filter(e => e.chunk === 'late')).forEach((e, i) => { e.n = i + 1; });
/* js/load.js（読み込み器）：書くなら先頭に注記なしで。書いていなければ先頭に足す（無いうちは空の代わり） */
const li = entries.findIndex(e => e.f === LOADF);
if (li > 0) throw new Error('_order.txt：' + LOADF + ' は先頭の行に書いてください（今は ' + (li + 1) + '本目）');
if (li === 0 && entries[0].chunk !== 'core') throw new Error('_order.txt：' + LOADF + ' は注記なし（core）にしてください');
const hasLoad = fs.existsSync(path.join(dir, LOADF));
if (!hasLoad) console.warn('※ ' + LOADF + ' がまだありません。空の代わりで作ります（このままでは画面は動きません）');
const files = entries.filter(e => e.f !== LOADF);
/* かたまりの並び（初めて出てきた順。core が先頭） */
const names = ['core'];
/* late は core のすぐ後ろ（起動の流れで core の次に読むので、vm もその順で回す。族のかたまりに頼る late のファイルがあれば vm の例外で分かる） */
if (files.some(e => e.chunk === 'late')) names.push('late');
files.forEach(e => { if (names.indexOf(e.chunk) < 0) names.push(e.chunk); });
Object.keys(chunkDeps).forEach(c => {
  if (names.indexOf(c) < 0) throw new Error('_order.txt：@chunk ' + c + ' のファイルがありません');
  chunkDeps[c].forEach(d => {
    if (names.indexOf(d) < 0) throw new Error('_order.txt：@chunk ' + c + ' の deps にある ' + d + ' というかたまりがありません');
    if (d === 'core') throw new Error('_order.txt：@chunk ' + c + '：core は deps に書かなくてよい（いつも先に読む）');
  });
});
if (chunkDeps.core && chunkDeps.core.length) throw new Error('_order.txt：core に deps は付けられません');
Object.keys(needs).forEach(id => needs[id].forEach(c => { if (names.indexOf(c) < 0) throw new Error('_order.txt：@need ' + id + ' の ' + c + ' というかたまりがありません'); }));
/* 依存の順（循環はエラー）。同じ段は初めて出てきた順 */
const exec = [];
(function () {
  const state = {};
  const visit = (c, trail) => {
    if (state[c] === 2) return;
    if (state[c] === 1) throw new Error('_order.txt：かたまりの依存が循環しています（' + trail.concat(c).join(' → ') + '）');
    state[c] = 1;
    (chunkDeps[c] || []).forEach(d => visit(d, trail.concat(c)));
    state[c] = 2; exec.push(c);
  };
  names.forEach(c => visit(c, []));
})();
/* 一覧に載っていない js/*.js を知らせる（読み込み漏れの防止） */
fs.readdirSync(path.join(dir, 'js')).filter(f => /\.js$/.test(f) && !/^bundle-/.test(f) && fs.statSync(path.join(dir, 'js', f)).isFile())
  .forEach(f => { if (!seen.has('js/' + f) && 'js/' + f !== LOADF) console.warn('※ _order.txt に載っていない: js/' + f); });

/* ---------- かたまりを組み立てる ---------- */
const HARD = STRIP ? M.loadHard(dir) : null;
const readSrc = f => fs.readFileSync(path.join(dir, f), 'utf8').replace(/\s+$/, '');
const topBad = [], guardBad = [], soft = [];
const loadSrc = hasLoad ? readSrc(LOADF) : 'window.HK = window.HK || {};';
const chunks = {};
names.forEach(name => {
  const list = files.filter(e => e.chunk === name), map = STRIP ? [] : null, parts = [];
  const add = (f, src, wrapN) => {
    if (map) map.push({ f, n: 0 });
    if (STRIP) src = M.strip(src, f, map);
    if (wrapN) {
      topBad.push(...M.checkTop(src, f));
      if (map) { map.splice(map.length - (src.split('\n').length), 0, { f, n: 0 }); map.push({ f, n: 0 }); }
      parts.push(';/* ==== ' + f + ' ==== */\nHK.Load.def(' + wrapN + ", '" + f + "', function () {\n" + src + '\n});\n');
    } else parts.push(';/* ==== ' + f + ' ==== */\n' + src + '\n');
    return src;
  };
  if (name === 'core') add(LOADF, loadSrc, 0);
  const srcs = list.map(e => ({ n: e.n, f: e.f, src: add(e.f, readSrc(e.f), e.n) }));
  let body = parts.join('');
  if (STRIP) guardBad.push(...M.guard(body, map, name, soft, HARD));
  chunks[name] = { name, files: srcs, count: list.length + (name === 'core' ? 1 : 0), raw: Buffer.byteLength(body), body };
});
if (topBad.length) {
  console.error('※ HK.Load.def で包むと意味が変わるおそれのある書き方があります（' + topBad.length + '件）。全体を (function () { … })(); で包んでください');
  topBad.forEach(b => console.error('  ' + b));
  process.exit(1);
}
if (STRIP) {
  if (soft.length) {
    const per = {}; soft.forEach(x => { const f = x.split(':')[0]; per[f] = (per[f] || 0) + 1; });
    console.warn('※ 注意（止めません）：文脈しだいで性的な語（safe.js の HARD）を含む12文字以上の文字列が ' + soft.length + ' 件。印の付け忘れがないか見てください：' + Object.keys(per).sort((a, b) => per[b] - per[a]).map(f => f.replace('js/', '') + ' ' + per[f]).join('、'));
    if (flag('--soft')) soft.forEach(x => console.warn('  ' + x));
  }
}
const reportBad = (bad, what) => {
  if (!bad.length) return;
  console.error('※ 全年齢版の' + what + 'に性的な語が残っています（' + bad.length + '件）。/* r18:begin */〜/* r18:end */ で挟むか、全年齢で使う語なら行に /* r18:ok */ を書いてください');
  bad.slice(0, flag('--all') ? 1e9 : 60).forEach(b => console.error('  ' + b));
  if (bad.length > 60 && !flag('--all')) console.error('  …ほか ' + (bad.length - 60) + ' 件（--all で全部出す）');
  if (!flag('--no-guard')) process.exit(1);
};
reportBad(guardBad, 'かたまり');

/* ---------- 軽量化・名前・書き出し ---------- */
const BRQ = flag('--best') ? 11 : 9;
const cdir = path.join(dir, 'js/c');
fs.mkdirSync(cdir, { recursive: true });
/* 書き出しと事前圧縮（.gz は gzip の最大圧縮。.br は brotli の品質9：最大の11は1割ほど小さいが時間がかかるので、公開の前だけ --best で11にする。
   中身が前と同じで、圧縮済みのファイルをほどくと同じ中身になるなら作り直さない（--best のときは作り直す） */
function emit(base, code) {
  const fp = path.join(cdir, base), buf = Buffer.from(code, 'utf8');
  const ok = (f, un) => { try { return un(fs.readFileSync(f)).equals(buf); } catch (e) { return false; } };
  const same = BRQ < 11 && fs.existsSync(fp) && fs.readFileSync(fp).equals(buf) && ok(fp + '.gz', zlib.gunzipSync) && ok(fp + '.br', zlib.brotliDecompressSync);
  if (!same) {
    fs.writeFileSync(fp, buf);
    fs.writeFileSync(fp + '.gz', zlib.gzipSync(buf, { level: 9 }));
    fs.writeFileSync(fp + '.br', zlib.brotliCompressSync(buf, { params: { [zlib.constants.BROTLI_PARAM_QUALITY]: BRQ, [zlib.constants.BROTLI_PARAM_LGWIN]: 24, [zlib.constants.BROTLI_PARAM_MODE]: zlib.constants.BROTLI_MODE_TEXT, [zlib.constants.BROTLI_PARAM_SIZE_HINT]: buf.length } }));
  }
  return { raw: buf.length, gz: fs.statSync(fp + '.gz').size, br: fs.statSync(fp + '.br').size, made: !same };
}
names.forEach(name => {
  const c = chunks[name];
  let body = flag('--no-min') ? c.body : M.minify(c.body, name);
  c.hash = hv(body);
  c.file = name + '.' + c.hash + '.js';
  c.src = 'js/c/' + c.file;
  c.z = emit(c.file, body + 'HK.Load.done(' + JSON.stringify(name).replace(/"/g, "'") + ", '" + c.hash + "', 1);\n");
  delete c.body;
});

/* ---------- 目録 ---------- */
const mchunks = {};
names.filter(n => n !== 'core').forEach(n => { mchunks[n] = { src: chunks[n].src, br: chunks[n].z.br, deps: (chunkDeps[n] || []).slice() }; });
const v = hv(names.map(n => n + ':' + chunks[n].hash).join(','));
const need = home => id => {
  const out = [];
  if (home[id] && home[id] !== 'core') out.push(home[id]);
  (needs[id] || []).forEach(c => { if (c !== 'core' && out.indexOf(c) < 0) out.push(c); });
  return out.sort((a, b) => names.indexOf(a) - names.indexOf(b));
};
let manifest, vmInfo = '';
if (flag('--no-manifest')) {
  const old = MF.readManifest(html);
  if (!old) console.warn('※ --no-manifest：前回の目録が index.html にありません。箱庭の情報が空の目録にします');
  manifest = { v, api: 1, build: BUILD, core: chunks.core.src, chunks: mchunks, order: old ? old.order : [], scen: old ? old.scen : {}, tones: old ? old.tones : { auto: [] } };
  vmInfo = '目録は前回のまま（--no-manifest）';
} else {
  const R = MF.runVm({ build: BUILD, safeBuild: STRIP, hash: STRIP ? '' : 'r18', quiet: true, loadSrc: hasLoad ? chunksLoadSrc() : null,
    chunks: exec.map(n => ({ name: n, hash: chunks[n].hash, files: chunks[n].files })) });
  /* 並びは元の順で実行し直して取る（今までの bundle と同じ：late 以外を並びの順、そのあと late） */
  const fileOf = {}; names.forEach(n => chunks[n].files.forEach(x => { fileOf[x.f] = x; }));
  const seq = files.slice().sort((a, b) => a.n - b.n).map(e => fileOf[e.f]);   /* 通し番号の順＝late 以外、そのあと late */
  const R2 = MF.runVm({ build: BUILD, safeBuild: STRIP, hash: STRIP ? '' : 'r18', quiet: true, loadSrc: hasLoad ? chunksLoadSrc() : null, chunks: [{ name: 'core', files: seq, noDone: true }] });
  manifest = MF.makeManifest(R, { v, build: BUILD, core: chunks.core.src, chunks: mchunks, need: need(R.home), ord: R2.ord });
  R.ms += R2.ms;
  const errs = R.errs.concat(R2.errs.filter(e => R.errs.indexOf(e) < 0).map(e => '（元の順）' + e));
  if (errs.length) {
    console.warn('※ 目録を作る vm の実行で ' + errs.length + ' 件の例外（目録が欠けていないか見てください）：');
    errs.slice(0, flag('--all') ? 1e9 : 20).forEach(e => console.warn('  ' + e));
  }
  const dropped = manifest.order.filter(id => R.finalOrder.indexOf(id) < 0);
  vmInfo = '目録 ' + manifest.order.length + '箱庭（vm ' + R.ms + 'ms' + (dropped.length ? '。この版の既定のモードでは出ない: ' + dropped.join(',') : '') + '）';
  /* 中核で登録され、要るかたまりの指定（@need）が無い箱庭（族のかたまりがあるのに）を知らせる */
  if (names.some(n => /^(pack|scen)-/.test(n))) {
    const lone = manifest.order.filter(id => !manifest.scen[id].chunks.length);
    if (lone.length) console.warn('※ 中核で登録され、要るかたまりが空の箱庭: ' + lone.join(',') + '（族の部品が要るなら _order.txt に @need <id> <かたまり> を）');
  }
}
function chunksLoadSrc() { return STRIP ? M.strip(loadSrc, LOADF, null) : loadSrc; }
if (STRIP) reportBad(MF.guardManifest(manifest, M.EXPLICIT), '目録');

/* ---------- index.html ---------- */
const block = '<!-- scripts:begin（hakoniwa-tools/build/build.js が書き換える。手で直さず js/_order.txt を直して build する） -->\n' +
  '<script>' + MF.manifestJs(manifest) + '</script>\n' +
  '<script src="' + chunks.core.src + '"></script>\n' +
  '<!-- scripts:end -->';
if (!/<!-- scripts:begin/.test(html)) throw new Error('index.html に <!-- scripts:begin --> がありません');
html = html.replace(/<!-- scripts:begin[\s\S]*?<!-- scripts:end -->/, () => block);
/* 以前の bundle-late.js の先読み指定は消す */
html = html.replace(/<link rel="preload" as="script" href="js\/bundle-late\.js[^>]*>\n?/g, '');
/* トップの「最終更新」の日付は docs/CHANGELOG.md のいちばん上の日付に合わせる（手で直し忘れないように） */
try {
  const cl = fs.readFileSync(path.join(__dirname, '../../docs/CHANGELOG.md'), 'utf8'), md = cl.match(/^## (\d{4})-(\d{2})-(\d{2})/m);
  if (md) html = html.replace(/最終更新：<time datetime="\d{4}-\d{2}-\d{2}">\d{4}年\d{1,2}月\d{1,2}日<\/time>/, '最終更新：<time datetime="' + md[1] + '-' + md[2] + '-' + md[3] + '">' + +md[1] + '年' + +md[2] + '月' + +md[3] + '日</time>');
} catch (e) { console.warn('※ 最終更新の日付を合わせられませんでした: ' + e.message); }
fs.writeFileSync(ip, html);

/* ---------- 古いかたまりの掃除（今回と前回だけ残す）・以前の bundle を消す ---------- */
const prevPath = path.join(cdir, '.prev.json');
let prev = { cur: {}, prev: {} };
try { prev = Object.assign(prev, JSON.parse(fs.readFileSync(prevPath, 'utf8'))); } catch (e) { /* 初回 */ }
const cur = {}; names.forEach(n => { cur[n] = chunks[n].file; });
const sameAsLast = JSON.stringify(cur) === JSON.stringify(prev.cur);
const keepPrev = sameAsLast ? prev.prev : prev.cur;
const keep = new Set(Object.values(cur).concat(Object.values(keepPrev || {})));
const CF = /^([a-z0-9-]+\.[0-9a-f]{10}\.js)(\.gz|\.br)?$/;
let removed = 0;
fs.readdirSync(cdir).forEach(f => {
  if (f === '.prev.json') return;
  const m = f.match(CF);
  if (!m) { console.warn('※ js/c/ に知らないファイル（消しません）: ' + f); return; }
  if (!keep.has(m[1])) { fs.unlinkSync(path.join(cdir, f)); removed++; }
});
fs.writeFileSync(prevPath, JSON.stringify({ cur, prev: keepPrev || {} }, null, 1) + '\n');
['bundle-main.js', 'bundle-late.js'].forEach(b => ['', '.gz', '.br'].forEach(x => { const p = path.join(dir, 'js', b + x); if (fs.existsSync(p)) { fs.unlinkSync(p); removed++; } }));

/* ---------- 報告 ---------- */
const k = n => Math.round(n / 1024) + 'KB';
const tot = { raw: 0, gz: 0, br: 0 };
console.log(path.basename(dir) + '（' + (STRIP ? '全年齢版' : 'R18版') + '）：かたまり ' + names.length + ' 個・' + entries.length + '本' + (hasLoad ? '' : '（＋load.js の代わり）') + '。' + vmInfo);
names.forEach(n => {
  const c = chunks[n], z = c.z; tot.raw += z.raw; tot.gz += z.gz; tot.br += z.br;
  console.log('  ' + n.padEnd(16) + String(c.count).padStart(3) + '本  ' + k(z.raw).padStart(7) + '（gz ' + k(z.gz) + '・br ' + k(z.br) + '）' + (z.made ? '' : '　変わらず') + (c.raw !== z.raw && !flag('--no-min') ? '　軽量化の前 ' + k(c.raw) : '') + ((chunkDeps[n] || []).length ? '　deps=' + chunkDeps[n].join(',') : ''));
});
console.log('  合計 ' + k(tot.raw) + '（gz ' + k(tot.gz) + '・br ' + k(tot.br) + '）。index.html の目録 ' + k(Buffer.byteLength(MF.manifestJs(manifest))) + (removed ? '。古いファイルを ' + removed + ' 本消した' : ''));
if (chunks.core.z.br > 1024 * 1024) console.warn('※ 中核（core）の br が 1MB を超えています（' + k(chunks.core.z.br) + '）。起動時に読む量の目安は 1MB 以下です');
