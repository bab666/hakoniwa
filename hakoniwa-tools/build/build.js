/* 箱庭シミュレーター：読み込むスクリプトを「かたまり」にまとめ、目録（HK_MANIFEST）を index.html に書き込む
   node build.js <ビルドのディレクトリ>（hakoniwa-full / hakoniwa-zenrei） [--best] [--no-min] [--no-guard] [--all] [--soft] [--no-manifest] [--no-tone-verify] [--no-catalog]
   ・はじめに出来事の一覧（js/event-catalog.js・docs/reports/2026-10-28/event-catalog.md）を event-catalog.js で作り直す（_order.txt に js/event-catalog.js があるとき）。出来事を足したら、両ビルドの build のあとで catalog-check.js を 0 件にする
   ・<ビルド>/js/_order.txt が読み込み順の一覧（全部読んだときの元の順。# から行末はコメント）。1行の書き方：
       js/xx.js                     … 中核（core。起動時に読む）
       late js/xx.js                … late（画面が出たあと裏で読む。late と tone-base を読み終わると HK.LATE_READY = true・HK.onLate()）
       tone js/xx.js                … 口調の書き下ろし（表 TONE_FIX・TONE_FIX_G・OVR・TONE_MOAN・NovelMoan.T だけを書くファイル）。かたまりには入れず、
                                      vm で全部を元の順で読んだ最後の表を、口調ごとのデータのかたまり tone-base（自動の10口調）・tone-<口調> と、
                                      箱庭だけの行は scen-<id> の後ろ（'tone:scen-<id>'）に書き出す（build-tone.js）。表のほかを書き換えるファイルはエラー（late に残す）
       js/xx.js @pack:rel           … かたまり pack-rel（族の共有。選んだ箱庭が要るときに読む）
       js/xx.js @scen:goukon        … かたまり scen-goukon（箱庭ごと）
       @chunk pack-story deps=pack-rel   … かたまりの依存（先に読むかたまり。カンマ区切り）
       @need goukon pack-rel        … その箱庭を動かすのに要るかたまり（登録するかたまりのほかに。カンマ区切り。deps はたどらなくてよい）
     ファイルには「全部読んだときの実行順」で 1 から通し番号を振る（HK.Load.def の第1引数。HK.wrap／HK.addTo の並べ替えの鍵）：
     late・tone 以外（注記なし・@pack・@scen）の行を並びの順に 1 から、その後ろに late と tone の行を並びの順に続ける（今までの bundle-main → bundle-late の実行順と同じ）。
     口調のデータの def は、書き足したかたまりの最後の通し番号＋0.5（scen-<id> など）、口調のかたまりは全部の通し番号の後ろ。
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
       --no-guard を付けると、エラーでも止めない（移行作業の途中だけ）。--all で残りを全部、--soft で二段目（HARD。文脈しだいの語。ふだんは出さない）の一覧も出す
   ・軽量化（両ビルド。全年齢版の検査のあと。かたまりごと）：コメント・字下げ・空行を落とす（字句は変えない。build-min.js）。--no-min で軽量化しない
   ・事前圧縮：かたまりごとに .gz／.br も作る（サーバが Accept-Encoding を見て返す。.htaccess）。中身が同じなら作り直さない。
       .br はふだん品質9、公開の前は --best で品質11（1割ほど小さくなるが、作るのに1分ほどかかる）
   ・中核（core）の内訳：ファイルごとの大きさ（軽量化後と、ファイル単独で br にした目安）を js/c/.prev.json の core に残し、
       大きい順の上位15本と、前回の build からの増減（br の目安で ±1KB 以上・足した・外した）を出す。
       中核の br が目安（1MB）を超えたら、前回より増えたファイル・中核に足したファイルを大きい順に出す（docs/reports/2026-11-01/core-size.md） */
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
/* @base <かたまり>：中核のすぐ次に読む土台のかたまり（2026-11-04。動かすのに要るが画面を出すのには要らない部品＝pack-sim）。
   core・口調のかたまり・自分のほかの全部のかたまり（late・族・箱庭・追加パックの頼る先）の deps の先頭に足す（書き忘れで抜けないように） */
let baseChunk = '';
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
  if ((m = l.match(/^@base\s+(\S+)$/))) {
    if (baseChunk) throw new Error(at + '@base は1つだけです');
    baseChunk = m[1];
    return;
  }
  if ((m = l.match(/^@need\s+(\S+)\s+(\S+)$/))) {
    (needs[m[1]] = needs[m[1]] || []).push(...m[2].split(',').filter(Boolean));
    return;
  }
  if (/^@/.test(l)) throw new Error(at + '読めない指示です（@chunk <名前> deps=a,b か @need <箱庭> <かたまり,…> か @base <かたまり>）');
  m = l.match(/^((?:late|tone)\s+)?(js\/[^\s@'"\\]+\.js)(?:\s+@(pack|scen):(\S+))?$/);
  if (!m) {
    if (/^(late|tone)\s+\S+\s+@/.test(l)) throw new Error(at + 'late・tone と @pack:／@scen: は一緒に付けられません');
    if (/\s@\S+\s+@/.test(l)) throw new Error(at + '注記は1つだけです');
    if (/\s@/.test(l)) throw new Error(at + '注記は @pack:<族> か @scen:<箱庭の id> です');
    throw new Error(at + '読めない行です（js/xx.js、late js/xx.js、tone js/xx.js、js/xx.js @pack:<族>、js/xx.js @scen:<id>）');
  }
  if (m[1] && m[3]) throw new Error(at + 'late・tone と @pack:／@scen: は一緒に付けられません');
  const chunk = m[1] ? m[1].trim() : m[3] ? m[3] + '-' + m[4] : 'core';
  if (m[3] && /^tone-/.test(chunk)) throw new Error(at + 'tone- で始まるかたまりの名前は口調のかたまり用です');
  if (!NAME.test(chunk)) throw new Error(at + 'かたまりの名前（' + chunk + '）は英小文字・数字・- だけにしてください');
  if (seen.has(m[2])) throw new Error(at + '重複しています: ' + m[2]);
  if (!fs.existsSync(path.join(dir, m[2]))) throw new Error(at + 'ファイルがありません: ' + m[2]);
  seen.add(m[2]);
  entries.push({ n: entries.length + 1, f: m[2], chunk });
});
/* 通し番号は実行順：late・tone 以外を並びの順に、そのあと late と tone を並びの順に */
const isLate = e => e.chunk === 'late' || e.chunk === 'tone';
entries.filter(e => !isLate(e)).concat(entries.filter(isLate)).forEach((e, i) => { e.n = i + 1; });
/* js/load.js（読み込み器）：書くなら先頭に注記なしで。書いていなければ先頭に足す（無いうちは空の代わり） */
const li = entries.findIndex(e => e.f === LOADF);
if (li > 0) throw new Error('_order.txt：' + LOADF + ' は先頭の行に書いてください（今は ' + (li + 1) + '本目）');
if (li === 0 && entries[0].chunk !== 'core') throw new Error('_order.txt：' + LOADF + ' は注記なし（core）にしてください');
const hasLoad = fs.existsSync(path.join(dir, LOADF));
if (!hasLoad) console.warn('※ ' + LOADF + ' がまだありません。空の代わりで作ります（このままでは画面は動きません）');
const files = entries.filter(e => e.f !== LOADF && e.chunk !== 'tone'), toneFiles = entries.filter(e => e.chunk === 'tone');
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
if (baseChunk) {
  if (names.indexOf(baseChunk) < 0) throw new Error('_order.txt：@base ' + baseChunk + ' のファイルがありません');
  if ((chunkDeps[baseChunk] || []).length) throw new Error('_order.txt：@base のかたまり ' + baseChunk + ' に deps は付けられません');
  names.forEach(c => { if (c === 'core' || c === baseChunk) return; const d = chunkDeps[c] = chunkDeps[c] || []; if (d.indexOf(baseChunk) < 0) d.unshift(baseChunk); });
}
Object.keys(chunkDeps).forEach(c => { if (/^tone-/.test(c)) throw new Error('_order.txt：@chunk ' + c + '：口調のかたまりは build が作ります（deps は無し）'); });
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

/* ---------- 出来事の一覧（js/event-catalog.js と docs/reports/2026-10-28/event-catalog.md）を作り直す ----------
   全部のかたまりを vm で読んで箱庭ごとに出来事を数える（event-catalog.js。数秒）。かたまりを組み立てる前に書くので、今回のかたまり（pack-catalog）に入る。--no-catalog で作らない（前のまま） */
let catalogInfo = '';
if (seen.has('js/event-catalog.js') && !flag('--no-catalog')) {
  const EC = require('./event-catalog.js'), r = EC.build(dir, { safeBuild: STRIP });
  catalogInfo = r.line;
  if (r.errs.length) { console.warn('※ 出来事の一覧を作る vm の実行で ' + r.errs.length + ' 件の例外：'); r.errs.slice(0, 5).forEach(e => console.warn('  ' + e)); }
}

/* ---------- かたまりを組み立てる ---------- */
const HARD = STRIP ? M.loadHard(dir) : null;
const readSrc = f => fs.readFileSync(path.join(dir, f), 'utf8').replace(/\s+$/, '');
const topBad = [], guardBad = [], soft = [];
const loadSrc = hasLoad ? readSrc(LOADF) : 'window.HK = window.HK || {};';
const chunks = {};
/* 1回目：かたまりごとにファイルを包んで並べる（全年齢版の検査は、口調のデータを足したあと） */
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
  chunks[name] = { name, files: srcs, count: list.length + (name === 'core' ? 1 : 0), parts, map };
});
/* 口調の書き下ろし（tone の行）：vm で全部を読み、口調ごとのデータにする */
const toneSrcs = toneFiles.map(e => {
  let src = readSrc(e.f);
  if (STRIP) src = M.strip(src, e.f, null);
  topBad.push(...M.checkTop(src, e.f));
  return { n: e.n, f: e.f, src };
});
let toneMade = null, toneInfo = '';
/* 口調のデータの def を、かたまりの部品として足す（map は全年齢版の検査用：1行に1つ） */
const addDef = (c, d) => {
  const part = ';/* ==== ' + d.name + ' ==== */\nHK.Load.def(' + d.n + ", '" + d.name + "', function () {\n" + d.code + '});\n';
  c.parts.push(part);
  if (c.map) { let i = 0; part.replace(/\n/g, () => { c.map.push({ f: d.name, n: i++ }); return ''; }); }
};
if (toneSrcs.length && !topBad.length) {
  const T0 = Date.now(), BT = require('./build-tone.js');
  const vmOpt = { build: BUILD, safeBuild: STRIP, hash: STRIP ? '' : 'r18', loadSrc: hasLoad ? (STRIP ? M.strip(loadSrc, LOADF, null) : loadSrc) : null, acorn: M.loadAcorn() };
  if (!vmOpt.acorn) throw new Error('acorn が見つかりません（口調のデータの振り分けに使います）。リポジトリの直下で npm install を実行してください');
  const ch = exec.map(n => ({ name: n, files: chunks[n].files }));
  toneMade = BT.make(vmOpt, ch, toneSrcs);
  const R = toneMade.R;
  if (R.errs.length) { console.warn('※ 口調のデータを作る vm の実行で ' + R.errs.length + ' 件の例外：'); R.errs.slice(0, 10).forEach(e => console.warn('  ' + e)); }
  const badF = Object.keys(R.bad);
  if (badF.length) {
    console.error('※ tone の印のファイルが、口調の表のほかも読み込み時に書き換えています（' + badF.length + '本）。コードを含むファイルは _order.txt で late に戻してください');
    badF.forEach(f => console.error('  ' + f + '：' + R.bad[f].slice(0, 3).join('／')));
    process.exit(1);
  }
  /* 確かめ：読む順を3とおりに変えて、データから作った表が元の順で全部読んだときと同じか（鍵・値・G の印・ゆるい引き方の結果） */
  if (!flag('--no-tone-verify')) {
    const rest = exec.filter(n => n !== 'core' && n !== 'late'), lt = names.indexOf('late') >= 0 ? ['late'] : [];
    const V = BT.verify(vmOpt, ch, toneMade, [['core'].concat(lt, ['@tones'], rest), ['core'].concat(rest, lt, ['@tones']), ['core', '@tones'].concat(rest, lt)]);
    const ng = V.filter(v => v.diff.length || v.errs.length);
    if (ng.length) {
      console.error('※ 口調のデータで読んだときの表が、元の順で全部読んだときと違います（build-tone.js の振り分けを見てください）：');
      ng.forEach(v => { console.error('  順：' + v.order + '：違い ' + v.diff.length + ' 件・例外 ' + v.errs.length + ' 件'); v.diff.concat(v.errs).slice(0, 8).forEach(x => console.error('    ' + x)); });
      process.exit(1);
    }
  }
  /* 調べもの用：HK_TONE_DUMP=<ファイル> で、元の順で全部読んだときの表の全行（表・口調・鍵 → 値）・ゆるい引き方の結果・行き先を JSON で書き出す
     （書き下ろしのファイルを分けたり、読み込み順を変えたりした前後で、最終の表が同じかを比べる。docs/reports/2026-11-04/core-split.md） */
  if (process.env.HK_TONE_DUMP) {
    const fin = {}, lw = {}, dst = {};
    toneMade.R.final.forEach((v, id) => { fin[id] = v; });
    BT.looseWin(BT.tablesOf(toneMade.R.win).F).forEach((v, id) => { lw[id] = v; });
    toneMade.destOf.forEach((v, id) => { dst[id] = v; });
    fs.writeFileSync(process.env.HK_TONE_DUMP, JSON.stringify({ final: fin, loose: lw, dest: dst }));
  }
  /* かたまりの後ろに足す def（late・pack-*・scen-*） */
  Object.keys(toneMade.append).forEach(n => { if (!chunks[n]) throw new Error('口調のデータの行き先 ' + n + ' というかたまりがありません'); addDef(chunks[n], toneMade.append[n]); });
  /* 口調のかたまり（tone-base が先、ほかは名前の順） */
  Object.keys(toneMade.toneChunks).sort((a, b) => a === 'tone-base' ? -1 : b === 'tone-base' ? 1 : a < b ? -1 : 1).forEach(n => {
    if (!NAME.test(n)) throw new Error('口調のかたまりの名前（' + n + '）が英小文字・数字・- だけになりません');
    if (names.indexOf(n) >= 0) throw new Error('口調のかたまりの名前 ' + n + ' が、ほかのかたまりと重なります');
    names.push(n);
    const c = chunks[n] = { name: n, files: [], count: 0, parts: [], map: STRIP ? [] : null, tone: true };
    toneMade.toneChunks[n].forEach(d => { addDef(c, d); c.count++; });
  });
  const st = toneMade.stat, by = st.byDest, sum = f => Object.keys(by).filter(f).reduce((a, k) => a + by[k], 0);
  const scenB = sum(k => /^scen-/.test(k)), allB = sum(() => true);
  toneInfo = '口調の書き下ろし ' + toneSrcs.length + '本 → ' + st.rows + '行（箱庭へ ' + st.scen + '行・' + Math.round(scenB / Math.max(1, allB) * 100) + '%（字数）、口調のかたまりへ ' + st.tone + '行、書き手のかたまりへ ' + st.writer + '行' +
    (st.looseFix ? '、ゆるい鍵の組をそろえた ' + st.looseFix + '行' : '') + '。vm ' + (Date.now() - T0) + 'ms' + (flag('--no-tone-verify') ? '・確かめなし' : '') + '）';
  if (toneMade.extra.length) console.warn('※ HK.TONE_KEYS に無い口調の書き下ろし（目録の tones.pack には入れる）：' + toneMade.extra.join(','));
}
/* 2回目：本文にまとめて、全年齢版の検査 */
names.forEach(name => {
  const c = chunks[name], body = c.parts.join('');
  if (STRIP) guardBad.push(...M.guard(body, c.map, name, soft, HARD));
  c.raw = Buffer.byteLength(body); c.body = body;
  delete c.parts; delete c.map;
});
if (topBad.length) {
  console.error('※ HK.Load.def で包むと意味が変わるおそれのある書き方があります（' + topBad.length + '件）。全体を (function () { … })(); で包んでください');
  topBad.forEach(b => console.error('  ' + b));
  process.exit(1);
}
if (STRIP) {
  /* 二段目（HARD）は --soft のときだけ出す。「奥に」「果て」「押し倒」のような、文脈しだいの語を含む普通の文（約300件）が当たるので、ふだんは知らせない
     （厳しい検査 EXPLICIT は上で止めている。印の付け忘れの当たりをつけたいときに --soft で一覧を見る） */
  if (soft.length && flag('--soft')) {
    const per = {}; soft.forEach(x => { const f = x.split(':')[0]; per[f] = (per[f] || 0) + 1; });
    console.warn('※ 参考（止めません）：文脈しだいで性的な語（safe.js の HARD）を含む12文字以上の文字列が ' + soft.length + ' 件：' + Object.keys(per).sort((a, b) => per[b] - per[a]).map(f => f.replace('js/', '') + ' ' + per[f]).join('、'));
    soft.forEach(x => console.warn('  ' + x));
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
  if (toneMade) manifest.tones = { auto: toneMade.auto, pack: toneMade.pack };
  vmInfo = '目録は前回のまま（--no-manifest）';
} else {
  const R = MF.runVm({ build: BUILD, safeBuild: STRIP, hash: STRIP ? '' : 'r18', quiet: true, loadSrc: hasLoad ? chunksLoadSrc() : null,
    chunks: exec.map(n => ({ name: n, hash: chunks[n].hash, files: chunks[n].files })) });   /* 口調のかたまりは目録の情報に関わらないので vm では読まない */
  /* 並びは元の順で実行し直して取る（今までの bundle と同じ：late 以外を並びの順、そのあと late） */
  const fileOf = {}; names.forEach(n => chunks[n].files.forEach(x => { fileOf[x.f] = x; }));
  const seq = files.slice().sort((a, b) => a.n - b.n).map(e => fileOf[e.f]);   /* 通し番号の順＝late 以外、そのあと late */
  const R2 = MF.runVm({ build: BUILD, safeBuild: STRIP, hash: STRIP ? '' : 'r18', quiet: true, loadSrc: hasLoad ? chunksLoadSrc() : null, chunks: [{ name: 'core', files: seq, noDone: true }] });
  manifest = MF.makeManifest(R, { v, build: BUILD, core: chunks.core.src, chunks: mchunks, need: need(R.home), ord: R2.ord });
  if (toneMade) manifest.tones.pack = toneMade.pack;
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
/* 中核の内訳（ファイルごと。軽量化後の字数と、ファイル単独で br にした目安。かたまり全体の br は辞書を共有するので、合計より 2 割ほど小さい） */
const coreStat = {};
{
  const BQ = { params: { [zlib.constants.BROTLI_PARAM_QUALITY]: 9, [zlib.constants.BROTLI_PARAM_LGWIN]: 22, [zlib.constants.BROTLI_PARAM_MODE]: zlib.constants.BROTLI_MODE_TEXT } };
  [{ f: LOADF, src: chunksLoadSrc() }].concat(chunks.core.files).forEach(x => {
    let code = x.src;
    if (!flag('--no-min')) { try { code = M.minify(x.src, x.f); } catch (e) { /* 1本だけでは軽量化できない書き方なら元のまま */ } }
    const b = Buffer.from(code, 'utf8');
    coreStat[x.f] = [b.length, zlib.brotliCompressSync(b, BQ).length];
  });
}
const prevCore = prev.core && typeof prev.core === 'object' ? prev.core : null;
fs.writeFileSync(prevPath, JSON.stringify({ cur, prev: keepPrev || {}, core: coreStat }, null, 1) + '\n');
['bundle-main.js', 'bundle-late.js'].forEach(b => ['', '.gz', '.br'].forEach(x => { const p = path.join(dir, 'js', b + x); if (fs.existsSync(p)) { fs.unlinkSync(p); removed++; } }));

/* ---------- 報告 ---------- */
const k = n => Math.round(n / 1024) + 'KB';
const tot = { raw: 0, gz: 0, br: 0 };
console.log(path.basename(dir) + '（' + (STRIP ? '全年齢版' : 'R18版') + '）：かたまり ' + names.length + ' 個・' + entries.length + '本' + (hasLoad ? '' : '（＋load.js の代わり）') + '。' + vmInfo);
const tz = { n: 0, raw: 0, gz: 0, br: 0, made: 0, list: [] };
names.forEach(n => {
  const c = chunks[n], z = c.z; tot.raw += z.raw; tot.gz += z.gz; tot.br += z.br;
  /* 口調のかたまりは1行にまとめる（下） */
  if (c.tone) { tz.n++; tz.raw += z.raw; tz.gz += z.gz; tz.br += z.br; if (z.made) tz.made++; tz.list.push([n, z.br]); return; }
  console.log('  ' + n.padEnd(16) + String(c.count).padStart(3) + '本  ' + k(z.raw).padStart(7) + '（gz ' + k(z.gz) + '・br ' + k(z.br) + '）' + (z.made ? '' : '　変わらず') + (c.raw !== z.raw && !flag('--no-min') ? '　軽量化の前 ' + k(c.raw) : '') + ((chunkDeps[n] || []).length ? '　deps=' + chunkDeps[n].join(',') : ''));
});
if (tz.n) {
  tz.list.sort((a, b) => b[1] - a[1]);
  const base = chunks['tone-base'] && chunks['tone-base'].z;
  console.log('  口調 ' + String(tz.n).padStart(3) + '個  ' + k(tz.raw).padStart(7) + '（gz ' + k(tz.gz) + '・br ' + k(tz.br) + '）' + (tz.made ? '　作り直し ' + tz.made + '個' : '　変わらず') +
    '　tone-base br ' + (base ? k(base.br) : '-') + '・大きい順 ' + tz.list.filter(x => x[0] !== 'tone-base').slice(0, 5).map(x => x[0].replace(/^tone-/, '') + ' ' + k(x[1])).join('、'));
  const big = tz.list.filter(x => x[1] > 90 * 1024);
  if (big.length) console.warn('※ br が 90KB を超える口調のかたまり：' + big.map(x => x[0] + ' ' + k(x[1])).join('、'));
}
if (toneInfo) console.log('  ' + toneInfo);
if (catalogInfo) console.log('  ' + catalogInfo);
console.log('  合計 ' + k(tot.raw) + '（gz ' + k(tot.gz) + '・br ' + k(tot.br) + '）。index.html の目録 ' + k(Buffer.byteLength(MF.manifestJs(manifest))) + (removed ? '。古いファイルを ' + removed + ' 本消した' : ''));
/* 中核の内訳：大きい順の上位15本と、前回の build からの増減（br の目安） */
/* 中核の上限（2026-11-04）：かたまりの br と、ファイルごとの br の目安の合計の両方が 900KB 以下（目安 0.9MB。超えたら build を不合格＝終了コード 1 にする。
   check.js の build もそれで落ちる。調べものの途中で止めたくないときだけ --no-core-limit） */
const CORE_BR_MAX = 900 * 1024, kk = n => (n / 1024).toFixed(n < 10240 ? 1 : 0) + 'KB', sg = n => (n > 0 ? '+' : n < 0 ? '−' : '±') + kk(Math.abs(n));
{
  const fl = Object.keys(coreStat).sort((a, b) => coreStat[b][1] - coreStat[a][1]);
  const dOf = f => prevCore && prevCore[f] ? coreStat[f][1] - prevCore[f][1] : null;
  const nm = f => f.replace(/^js\//, '');
  console.log('  中核の内訳（' + fl.length + '本。軽量化後の大きさ・ファイル単独の br の目安。大きい順の上位15本）：');
  fl.slice(0, 15).forEach((f, i) => {
    const d = dOf(f);
    console.log('    ' + String(i + 1).padStart(2) + '. ' + nm(f).padEnd(28) + k(coreStat[f][0]).padStart(7) + '・br ' + kk(coreStat[f][1]).padStart(7) +
      (!prevCore ? '' : d == null ? '　（前回は中核に無い）' : Math.abs(d) >= 1024 ? '　（前回比 ' + sg(d) + '）' : ''));
  });
  if (prevCore) {
    const grow = fl.filter(f => prevCore[f] && dOf(f) >= 1024).sort((a, b) => dOf(b) - dOf(a));
    const shrink = fl.filter(f => prevCore[f] && dOf(f) <= -1024).sort((a, b) => dOf(a) - dOf(b));
    const added = fl.filter(f => !prevCore[f]), gone = Object.keys(prevCore).filter(f => !coreStat[f]).sort((a, b) => prevCore[b][1] - prevCore[a][1]);
    const sumP = Object.keys(prevCore).reduce((a, f) => a + prevCore[f][1], 0), sumC = fl.reduce((a, f) => a + coreStat[f][1], 0);
    const list = (xs, fmt) => xs.slice(0, 8).map(fmt).join('、') + (xs.length > 8 ? ' ほか' + (xs.length - 8) + '本' : '');
    if (!grow.length && !shrink.length && !added.length && !gone.length) console.log('  前回の build から中核の中身の増減なし（br の目安の合計 ' + kk(sumC) + '）');
    else {
      console.log('  前回の build からの中核の増減（br の目安の合計 ' + kk(sumP) + ' → ' + kk(sumC) + '・' + sg(sumC - sumP) + '）：');
      if (grow.length) console.log('    増えた ' + list(grow, f => nm(f) + ' ' + sg(dOf(f))));
      if (shrink.length) console.log('    減った ' + list(shrink, f => nm(f) + ' ' + sg(dOf(f))));
      if (added.length) console.log('    中核に足した ' + list(added, f => nm(f) + ' ' + kk(coreStat[f][1])));
      if (gone.length) console.log('    中核から外した ' + list(gone, f => nm(f) + ' ' + kk(prevCore[f][1])));
    }
  }
  const sumNow = fl.reduce((a, f) => a + coreStat[f][1], 0);
  console.log('  中核の上限：かたまりの br ' + k(chunks.core.z.br) + '・ファイルごとの br の目安の合計 ' + kk(sumNow) + '（どちらも ' + kk(CORE_BR_MAX) + ' 以下）');
  if (chunks.core.z.br > CORE_BR_MAX || sumNow > CORE_BR_MAX) {
    console.warn('※ 中核（core）が上限 ' + kk(CORE_BR_MAX) + ' を超えています（かたまりの br ' + k(chunks.core.z.br) + '・目安の合計 ' + kk(sumNow) + '）。起動時に読む量は 0.9MB 以下にします' + (flag('--no-core-limit') ? '（--no-core-limit：不合格にしない）' : '（build は不合格）'));
    if (!flag('--no-core-limit')) process.exitCode = 1;
    if (!prevCore) console.warn('  （前回の内訳が js/c/.prev.json に無いので、増えたファイルは次の build から出します）');
    else {
      const inc = f => coreStat[f][1] - (prevCore[f] ? prevCore[f][1] : 0);
      const up = fl.filter(f => !prevCore[f] || dOf(f) >= 512).sort((a, b) => inc(b) - inc(a));
      if (up.length) console.warn('  前回より増えた・中核に足したファイル（br の目安）：' + up.slice(0, 12).map(f => nm(f) + ' ' + (prevCore[f] ? sg(dOf(f)) : '新しく ' + kk(coreStat[f][1]))).join('、'));
      else console.warn('  前回の build から増えたファイルはありません（前から目安を超えています）');
    }
    console.warn('  文の表・特定の箱庭だけの部品・画面が出たあとでよい部品は、中核に入れず @pack:<族>・@scen:<id>・late に振り分けてください（CLAUDE.md の「スクリプトはかたまりに分けて配る」）');
  }
}
