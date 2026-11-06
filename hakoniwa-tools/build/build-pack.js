/* 箱庭シミュレーター：追加パックを組み立てる（本体の build.js とは別に、パックだけを作り直せる）
   node hakoniwa-tools/build/build-pack.js <パックのフォルダ（hakoniwa-packs/set-a など）> [--build=full|zenrei]（既定は pack.json の builds 全部）
       [--out=<ビルドのフォルダの代わり>] [--codes=<コードのファイル>] [--dist] [--no-min]
   ・パックのフォルダ：pack.json と js/*.js。pack.json の形（hakoniwa-packs/README.md）：
       { "id": "set-a", "slot": "set-a", "name": "セットの名前", "desc": "紹介（コードの入力画面に出す。部屋の名前は書かない）",
         "builds": ["full", "zenrei"], "api": 1,
         "chunks": [{ "name": "room1", "deps": ["pack-rel"], "files": ["js/room1.js"] }],   … deps は本体のかたまり（pack-rel・scen-futari など）か、同じパックのかたまりの名前。
                                                                                              版で分け方が違うときは { "full": [...], "zenrei": [...] }
         "needs": { "<箱庭の id>": ["pack-trap"] } }                                           … 任意。その箱庭を動かすのに、登録するかたまりのほかに要るかたまり
   ・本体の組み立て済みのかたまり（<ビルド>/index.html の目録が指す js/c/*.js）を node の vm で読み、パックのファイルを足して、
     パックが登録した箱庭（HK.SCENARIOS に増えた id）から目録の情報を作る（本体の build.js と同じ形）。先に本体を build しておく
   ・パックのファイルは本体と同じく HK.Load.def(<通し番号>, 'pack:<id>/js/xx.js', function () { … }) で包む。通し番号は 1000000＋枠の番号×10000＋並び
     （本体のどのファイルよりも後ろ。HK.wrap・HK.addTo の並べ替えでも本体の後ろに来る）。かたまりの名前は pk-<枠>-<名前>
   ・全年齢版では、本体と同じく /＊ r18:begin ＊/〜/＊ r18:end ＊/ を落とし、文字列に性的な語が残っていれば止める
   ・中身（かたまりの本文と目録）は JSON にして、コードで暗号化する（js/pack-crypto.js。本体と同じファイルを使う）。
     コードは hakoniwa-packs/codes.local.json（git に入れない）：{ "set-a": ["セットのコード"], "*": ["まとめ用のコード"] }。
     "*" のコードは全部のパックに入る（まとめ用。1つのコードで全部のセットが開く）。
     版ごとのコード（2026-11-07）：鍵に接尾辞の無いコードは R18版（--build=full）の封に、"set-a@zen"・"*@zen" は全年齢版（--build=zenrei）の封に使う。
     全年齢版のコードが無い鍵は、全年齢版でも R18版のコードで封をする（後方互換。警告を出す）
   ・書き出し：<ビルド>/packs/<枠>/pack.js と、<ビルド>/packs/index.js（サイト公開版用：packs にあるパックの枠の一覧）。
     --dist：配布用の zip（dist/<ビルド>-<枠>.zip。中身は packs/<枠>/pack.js だけ。本体のフォルダにそのまま解凍する）も作る。
     本体の配布用の zip は build-dist.js
   ・出来事の一覧：本体と同じ印（@event・label・@labels・@event-table）を拾い（event-catalog.js の makePack）、中身のかたまり pk-<枠>-catalog に入れる
     （箱庭カードの「出来事の一覧」を押したときだけ読む。かたまりの名前 catalog は使えない）。作り手向けの docs/reports/2026-11-03/pack-event-catalog.md も書き直す
     （見本のパックは --out のフォルダに）。コード無しで md だけ作り直すなら node hakoniwa-tools/build/event-catalog.js --pack=<パックのフォルダ>
   設計：docs/reports/2026-11-02/pack-foundation.md */
'use strict';
const fs = require('fs'), path = require('path'), crypto = require('crypto');
process.on('uncaughtException', e => { console.error('※ パックの組み立てを止めました：' + (e && e.message || e)); if (process.env.DEBUG) console.error(e && e.stack); process.exit(1); });
const M = require('./build-min.js'), MF = require('./build-manifest.js'), Z = require('./zip.js'), EC = require('./event-catalog.js');
const ROOT = path.resolve(__dirname, '../..');
const args = process.argv.slice(2).filter(a => !/^--/.test(a)), flags = process.argv.slice(2).filter(a => /^--/.test(a));
const opt = k => { const f = flags.find(x => x.indexOf('--' + k + '=') === 0); return f ? f.slice(k.length + 3) : null; };
const flag = f => flags.indexOf(f) >= 0;
if (!args[0]) throw new Error('使い方：node hakoniwa-tools/build/build-pack.js <パックのフォルダ> [--build=full|zenrei] [--out=…] [--codes=…] [--dist]');
const pdir = path.resolve(args[0]);
const P = JSON.parse(fs.readFileSync(path.join(pdir, 'pack.json'), 'utf8'));
const SLOTS = ['set-a', 'set-b', 'set-c', 'set-d', 'set-e', 'set-f', 'set-g', 'set-h', 'set-i', 'set-j', 'set-k', 'set-l'];
const NAME = /^[a-z0-9-]+$/;
if (!P.id || !NAME.test(P.id)) throw new Error('pack.json の id は英小文字・数字・- だけにしてください');
P.slot = P.slot || P.id;
if (SLOTS.indexOf(P.slot) < 0) throw new Error('pack.json の slot は ' + SLOTS.join('・') + ' のどれかにしてください（本体が読みに行く決まった名前）');
if (!P.name) throw new Error('pack.json に name（セットの名前）を書いてください');
if (!Array.isArray(P.chunks) || !P.chunks.length) throw new Error('pack.json に chunks を書いてください');
const API = P.api || 1;
const builds = opt('build') ? [opt('build')] : (P.builds || ['full']);
builds.forEach(b => { if (b !== 'full' && b !== 'zenrei') throw new Error('build は full か zenrei です: ' + b); });
if (P.sample && !opt('out')) throw new Error('見本のパック（sample）は本体のフォルダに書き出しません。--out=<試しのフォルダ> を付けてください');

/* ---------- コード ---------- */
const codesPath = path.resolve(opt('codes') || path.join(ROOT, 'hakoniwa-packs/codes.local.json'));
if (!fs.existsSync(codesPath)) throw new Error('コードのファイルがありません: ' + codesPath + '（hakoniwa-packs/codes.example.json を写して作る。git には入れない）');
const CODES = JSON.parse(fs.readFileSync(codesPath, 'utf8'));
Object.keys(CODES).forEach(k => { if (/@/.test(k) && !/^[^@]+@zen$/.test(k)) throw new Error(codesPath + ' の鍵 ' + k + '：版の接尾辞は @zen（全年齢版のコード）だけです'); });
const PC = require(path.join(ROOT, 'hakoniwa-full/js/pack-crypto.js'));
/* 版ごとのコード（2026-11-07）："set-b"・"*" は R18版のコード、"set-b@zen"・"*@zen" は全年齢版のコード。
   全年齢版のコードが無い鍵は、全年齢版でも今までどおり R18版のコードで封をする（後方互換。警告を出す） */
function codesFor(BUILD) {
  const pick = k => {
    if (BUILD !== 'zenrei') return CODES[k] || [];
    if (CODES[k + '@zen']) return CODES[k + '@zen'];
    if ((CODES[k] || []).length) console.warn('※ ' + rel(codesPath) + ' に "' + k + '@zen"（全年齢版のコード）がありません。全年齢版の ' + P.id + ' は R18版の "' + k + '" のコードで封をします');
    return CODES[k] || [];
  };
  const codes = [].concat(pick(P.id), pick('*')).filter(Boolean);
  if (!codes.length) throw new Error(codesPath + ' に ' + P.id + ' のコード（か "*" のまとめ用のコード）がありません（' + BUILD + '）');
  const norms = codes.map(PC.norm);
  if (norms.some(c => c.length < 6)) throw new Error('コードは整えたあと（空白・- を除いて大文字）6文字以上にしてください');
  if (new Set(norms).size !== norms.length) throw new Error('同じコードが2回あります（整えたあとで同じになるもの。' + BUILD + '）');
  return { codes, norms };
}

const rel = p => { const r = path.relative(ROOT, p); return /^\.\./.test(r) ? p : r; };
const hv = s => crypto.createHash('sha1').update(s).digest('hex').slice(0, 10);
const cname = n => 'pk-' + P.slot + '-' + n;
const localNames = P.chunks.map(c => c.name);
P.chunks.forEach(c => {
  if (!NAME.test(c.name || '')) throw new Error('chunks の name は英小文字・数字・- だけにしてください: ' + c.name);
  if (!Array.isArray(c.files) || !c.files.length) throw new Error('chunks の ' + c.name + ' に files がありません');
  if (c.name === 'catalog') throw new Error('かたまりの名前 catalog は出来事の一覧に使うので、ほかの名前にしてください');
});

function buildOne(BUILD) {
  const STRIP = BUILD === 'zenrei';
  const { codes, norms } = codesFor(BUILD);
  const bdir = path.resolve(opt('out') ? path.join(opt('out'), 'hakoniwa-' + BUILD) : path.join(ROOT, 'hakoniwa-' + BUILD));
  const mainDir = path.join(ROOT, 'hakoniwa-' + BUILD);
  const html = fs.readFileSync(path.join(mainDir, 'index.html'), 'utf8'), MAN = MF.readManifest(html);
  if (!MAN) throw new Error(mainDir + '/index.html に目録がありません。先に本体を build してください');
  /* ---------- 包む ---------- */
  const si = SLOTS.indexOf(P.slot), base = 1000000 + si * 10000;
  let seq = 0;
  const topBad = [], guardBad = [], chunks = {};
  P.chunks.forEach(c => {
    const map = STRIP ? [] : null, parts = [], files = [];
    c.files.forEach(f => {
      const fp = path.join(pdir, f);
      if (!fs.existsSync(fp)) throw new Error('ファイルがありません: ' + fp);
      if (!/^js\/[^\s'"\\]+\.js$/.test(f)) throw new Error('ファイルは js/xx.js の形で書いてください: ' + f);
      let src = fs.readFileSync(fp, 'utf8').replace(/\s+$/, '');
      if (map) map.push({ f, n: 0 });
      if (STRIP) src = M.strip(src, f, map);
      topBad.push(...M.checkTop(src, f));
      const n = base + (++seq);
      if (map) { map.splice(map.length - (src.split('\n').length), 0, { f, n: 0 }); map.push({ f, n: 0 }); }
      parts.push(';/* ==== ' + f + ' ==== */\nHK.Load.def(' + n + ", 'pack:" + P.id + '/' + f + "', function () {\n" + src + '\n});\n');
      files.push({ n, f: 'pack:' + P.id + '/' + f, src });
    });
    const body = parts.join('');
    if (STRIP) guardBad.push(...M.guard(body, map, cname(c.name), null, null));
    /* deps は配列か、版ごとの { full: [...], zenrei: [...] }（本体のかたまりの分け方が版で違うため） */
    const deps = (Array.isArray(c.deps) ? c.deps : ((c.deps || {})[BUILD] || [])).map(d => localNames.indexOf(d) >= 0 ? cname(d) : d);
    deps.forEach(d => { if (!/^pk-/.test(d) && d !== 'core' && !(MAN.chunks || {})[d]) throw new Error('chunks の ' + c.name + ' の deps にある ' + d + ' は、本体（' + BUILD + '）のかたまりにありません'); });
    chunks[cname(c.name)] = { local: c.name, body, files, deps: deps.filter(d => d !== 'core') };
  });
  if (topBad.length) { topBad.forEach(b => console.error('  ' + b)); throw new Error('HK.Load.def で包むと意味が変わる書き方があります。全体を (function () { … })(); で包んでください'); }
  if (guardBad.length) { guardBad.slice(0, 60).forEach(b => console.error('  ' + b)); throw new Error('全年齢版のパックに性的な語が残っています（' + guardBad.length + '件）。/* r18:begin */〜/* r18:end */ で挟んでください'); }
  /* 軽量化して名前を付ける */
  Object.keys(chunks).forEach(n => {
    const c = chunks[n], body = flag('--no-min') ? c.body : M.minify(c.body, n);
    c.hash = hv(body);
    c.code = body + 'HK.Load.done(' + JSON.stringify(n).replace(/"/g, "'") + ", '" + c.hash + "', 1);\n";
  });

  /* ---------- vm で読んで、箱庭の目録を作る ---------- */
  const win = MF.makeWindow({ build: BUILD, safeBuild: STRIP, hash: STRIP ? '' : 'r18', quiet: true });
  const vm = require('vm'), ctx = vm.createContext(win), errs = [];
  const run = (code, fn) => { try { vm.runInContext(code, ctx, { filename: fn }); } catch (e) { errs.push(fn + ': ' + String(e && e.message || e).slice(0, 200)); } };
  const mainSrc = f => fs.readFileSync(path.join(mainDir, f), 'utf8');
  run(mainSrc(MAN.core), MAN.core);
  /* パックが頼る本体のかたまり（依存をたどって、依存が先） */
  const need = [], seenC = {};
  const addMain = (n, trail) => {
    if (seenC[n] || /^pk-/.test(n)) return;
    const ch = MAN.chunks[n];
    if (!ch) throw new Error('本体のかたまり ' + n + ' がありません');
    if (trail.indexOf(n) >= 0) return;
    (ch.deps || []).forEach(d => addMain(d, trail.concat(n)));
    seenC[n] = 1; need.push(n);
  };
  const extraNeeds = P.needs || {};
  Object.keys(chunks).forEach(n => chunks[n].deps.forEach(d => addMain(d, [])));
  Object.keys(extraNeeds).forEach(id => (extraNeeds[id] || []).forEach(d => { if (localNames.indexOf(d) < 0) addMain(d, []); }));
  if (MAN.chunks.late) addMain('late', []);
  need.forEach(n => run(mainSrc(MAN.chunks[n].src), MAN.chunks[n].src));
  const HK = () => win.HK || {};
  const before = new Set(Object.keys(HK().SCENARIOS || {}));
  const home = {}, order = [];
  /* パックのかたまりを依存の順に */
  const pOrder = [], pSeen = {};
  const visit = (n, trail) => {
    if (pSeen[n]) return;
    if (trail.indexOf(n) >= 0) throw new Error('パックのかたまりの依存が循環しています（' + trail.concat(n).join(' → ') + '）');
    chunks[n].deps.filter(d => /^pk-/.test(d)).forEach(d => { if (!chunks[d]) throw new Error('パックのかたまり ' + d + ' がありません'); visit(d, trail.concat(n)); });
    pSeen[n] = 1; pOrder.push(n);
  };
  Object.keys(chunks).forEach(n => visit(n, []));
  pOrder.forEach(n => {
    run(chunks[n].code, 'pack:' + n);
    Object.keys(HK().SCENARIOS || {}).forEach(id => { const s = HK().SCENARIOS[id]; if (!before.has(id) && !home[id] && s && typeof s === 'object' && !s.stub) { home[id] = n; order.push(id); } });
  });
  ((HK().Load && HK().Load.errors) || []).forEach(e => errs.push((e.file || '?') + ': ' + String(e.err || '').slice(0, 200)));
  if (errs.length) { errs.slice(0, 20).forEach(e => console.error('  ' + e)); throw new Error('vm で読んだときに例外が出ました（' + errs.length + '件）'); }
  if (!order.length) throw new Error('パックが箱庭を登録していません（HK.SCENARIOS[id] = scen; を書いてください）');
  order.forEach(id => { if (MAN.scen && MAN.scen[id]) throw new Error('箱庭の id ' + id + ' が本体の箱庭と重なります'); });
  /* 箱庭の id は本体と重ならないように、パックの id で始める決まり */
  order.forEach(id => { if (id.indexOf(P.id + '-') !== 0) throw new Error('パックの箱庭の id は「' + P.id + '-」で始めてください: ' + id); });
  const R = { HK: HK() }, scen = {};
  const needOf = id => {
    const out = [home[id]];
    (extraNeeds[id] || []).map(d => localNames.indexOf(d) >= 0 ? cname(d) : d).forEach(d => { if (out.indexOf(d) < 0) out.push(d); });
    return out;
  };
  order.forEach(id => { scen[id] = MF.scenEntry(HK().SCENARIOS[id], id, R, needOf); });
  if (STRIP) { const bad = MF.guardManifest({ scen }, M.EXPLICIT); if (bad.length) { bad.slice(0, 20).forEach(b => console.error('  ' + b)); throw new Error('全年齢版のパックの目録に性的な語が残っています'); } }

  /* ---------- 出来事の一覧（2026-11-03）：本体と同じ印・同じ数え方で、パックの箱庭の一覧を作る（event-catalog.js の makePack）。
     パックの中身のかたまり pk-<枠>-catalog に入れ（暗号化される）、箱庭カードの「出来事の一覧」を押したときだけ読む。作り手向けの md も書き直す ---------- */
  const spec = EC.packSpec(pdir);
  const cat = EC.makePack(mainDir, spec, { safeBuild: STRIP });
  if (cat.errs.length) { cat.errs.slice(0, 10).forEach(e => console.warn('  ' + e)); console.warn('※ 出来事の一覧の vm で例外が ' + cat.errs.length + ' 件ありました'); }
  if (STRIP) { const bad = MF.guardManifest(cat.data, M.EXPLICIT); if (bad.length) { bad.slice(0, 20).forEach(b => console.error('  ' + b)); throw new Error('全年齢版のパックの出来事の一覧に性的な語が残っています'); } }
  const catN = cname('catalog'), catCode = EC.packCatalogJs(cat.data, catN);
  const noName = cat.data.ev.filter(e => !EC.hasName(e)).length, ownEv = cat.data.ev.filter(e => EC.packOwn(cat.data, e));
  const mdPath = P.sample ? path.join(path.resolve(opt('out')), 'pack-event-catalog.md') : EC.PACK_MD;
  EC.writePackMd(cat.data, mdPath);

  /* ---------- 中身・暗号化・書き出し ---------- */
  const mainNeeds = need.filter(n => n !== 'late');
  const body = { f: 1, id: P.id, slot: P.slot, api: API, build: BUILD, name: P.name, needs: mainNeeds, chunks: {}, scen, order };
  pOrder.forEach(n => { body.chunks[n] = { code: chunks[n].code, deps: chunks[n].deps }; });
  body.chunks[catN] = { code: catCode, deps: [] };
  const text = JSON.stringify(body);
  const v = new Date().toISOString().slice(0, 10).replace(/-/g, '') + '-' + hv(text);
  const sealed = PC.seal(text, codes, n => new Uint8Array(crypto.randomBytes(n)));
  /* 自分で開けて確かめる */
  norms.forEach(c => { const K = PC.unlock(sealed, c); if (!K || PC.open(sealed, K) !== text) throw new Error('暗号化の確かめに失敗しました'); });
  /* 箱庭が全部 R18（肩見出しに R18）なら、R18版の全年齢モードでは「箱庭を追加」に出さない印 */
  const r18only = BUILD === 'full' && order.every(id => /R-?18/.test(scen[id].kicker || ''));
  const head = { f: 1, id: P.id, slot: P.slot, v, api: API, build: BUILD, name: P.name, desc: P.desc || '' };
  if (r18only) head.r18only = 1;
  const js = '/* 箱庭シミュレーター 追加パック「' + P.name.replace(/\*\//g, '') + '」（' + BUILD + '・' + v + '）。中身は暗号化してあります。本体の「箱庭を追加」でコードを入れると開きます */\n' +
    '(window.HK_PACK_Q=window.HK_PACK_Q||[]).push(' + JSON.stringify(Object.assign(head, sealed)).replace(/</g, '\\u003c') + ');\n' +
    'if(window.HK&&window.HK.Packs&&window.HK.Packs.take)window.HK.Packs.take();\n';
  const outDir = path.join(bdir, 'packs', P.slot);
  fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(path.join(outDir, 'pack.js'), js);
  writeIndex(path.join(bdir, 'packs'));
  let zinfo = '';
  if (flag('--dist')) {
    const dd = path.join(opt('out') || ROOT, 'dist');
    fs.mkdirSync(dd, { recursive: true });
    const zp = path.join(dd, 'hakoniwa-' + BUILD + '-' + P.slot + '.zip');
    const howto = ['追加パック「' + P.name + '」', '', 'この zip の中の packs フォルダの ' + P.slot + ' フォルダを、本体のフォルダ（index.html のある場所）の packs フォルダの中に入れてください。',
      '例：本体のフォルダ/packs/' + P.slot + '/pack.js', '', 'そのあと index.html を開き、「箱庭を選ぶ」の一覧の最後にある「箱庭を追加」で、購入したコードを入れてください。'].join('\r\n') + '\r\n';
    Z.writeZip(zp, [{ name: 'packs/' + P.slot + '/pack.js', data: Buffer.from(js, 'utf8') }, { name: 'はじめにお読みください（' + P.name + '）.txt', data: Buffer.from('\ufeff' + howto, 'utf8') }]);
    zinfo = '・配布用 ' + rel(zp);
  }
  const kb = n => Math.round(n / 1024) + 'KB';
  console.log('追加パック ' + P.id + '（' + BUILD + '）：箱庭 ' + order.length + '（' + order.join(',') + '）・かたまり ' + pOrder.length + '・' + kb(js.length) + '・コード ' + codes.length + '個・本体のかたまり ' + (mainNeeds.join(',') || 'なし') +
    ' → ' + rel(path.join(outDir, 'pack.js')) + zinfo);
  console.log('  出来事の一覧：' + order.map(id => id + ' ' + cat.data.scen[id].ev.length + '件').join('・') + '（パックで書いた出来事 ' + ownEv.length + '件' + (BUILD === 'full' ? '・うち夜 ' + ownEv.filter(e => e.x).length + '件' : '') +
    '・表示名の無い出来事 ' + noName + '件）→ ' + rel(mdPath) + (noName ? '　※ label か @labels で表示名を付けてください（catalog-check.js）' : ''));
}
/* packs/index.js：packs にある枠の一覧（サイト公開版の本体はこれを読み、ある枠だけを読みに行く。データ配布版の本体の zip には入れない） */
function writeIndex(pk) {
  const list = SLOTS.filter(s => fs.existsSync(path.join(pk, s, 'pack.js')));
  fs.writeFileSync(path.join(pk, 'index.js'), '/* 箱庭シミュレーター：サイトに置いてある追加パックの枠（build-pack.js が書く。データ配布版には入れない） */\nif(window.HK_PACK_INDEX)window.HK_PACK_INDEX(' + JSON.stringify(list) + ');\n');
}
builds.forEach(buildOne);
