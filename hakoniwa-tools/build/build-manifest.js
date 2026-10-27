/* 箱庭シミュレーター：build.js の部品（目録 HK_MANIFEST を作る）
   node の vm に、ブラウザの代わりの小さな部品（document・localStorage・matchMedia など。中身は空）を置き、
   中核 → 各かたまりを、ブラウザで読むときと同じ包み（HK.Load.def）で1本ずつ実行して、
   HK.SCENARIOS・HK.SCEN_ORDER・HK.ScenMeta・HK.ScenTags.TABLE・HK.TONE_KEYS から目録を作る。
   ・vm には空の目録（vm: true）を渡す（仮の箱庭を作らせないため）。ソースの js は変えない
   ・R18版は #r18 で回す。全年齢版は index.html と同じく window.HK_SAFE_BUILD = 1
   ・「どの箱庭がどのかたまりで登録されたか」は、ファイルを1本実行するたびに HK.SCENARIOS に増えた id（stub でないもの）で決める
   ・並び（order）は、途中で SCEN_ORDER から消えた箱庭（safe.js が絞るもの）も残した「全部」の並び。
     かたまりの順で実行すると並びが変わることがあるので、並びだけは別にもう一度、元の順（今までの bundle と同じ：late 以外を並びの順、そのあと late）で実行して取る */
'use strict';
const vm = require('vm');

/* ---------- ブラウザの代わり ---------- */
function makeWindow(opt) {
  const el = () => new Proxy(function () {}, {
    get: (t, p) => p === Symbol.toPrimitive ? () => '' : p === 'length' ? 0 : p === 'then' ? undefined : el(),
    apply: () => el(), construct: () => el(), set: () => true, has: () => true
  });
  const mkStore = () => { const s = {}; return { getItem: k => s[k] == null ? null : s[k], setItem: (k, v) => { s[k] = String(v); }, removeItem: k => { delete s[k]; }, clear: () => { Object.keys(s).forEach(k => delete s[k]); }, key: i => Object.keys(s)[i] || null, get length() { return Object.keys(s).length; } }; };
  const Dummy = function () { return el(); };
  const doc = {
    readyState: 'complete', addEventListener() {}, removeEventListener() {}, querySelectorAll: () => [], querySelector: () => el(), getElementById: () => el(),
    getElementsByClassName: () => [], getElementsByTagName: () => [], createElement: () => el(), createElementNS: () => el(), createTextNode: () => el(),
    createDocumentFragment: () => el(), body: el(), documentElement: el(), head: el(), cookie: '', title: '', hidden: false, visibilityState: 'visible', fonts: el()
  };
  const win = {
    document: doc, location: { hash: opt.hash ? '#' + opt.hash : '', search: '', href: 'file:///vm/index.html' + (opt.hash ? '#' + opt.hash : ''), protocol: 'file:', pathname: '/vm/index.html', origin: 'null', reload() {}, replace() {} },
    navigator: { userAgent: 'node-vm', language: 'ja', languages: ['ja'], maxTouchPoints: 0, onLine: true, clipboard: el() },
    localStorage: mkStore(), sessionStorage: mkStore(), indexedDB: undefined,
    addEventListener() {}, removeEventListener() {}, dispatchEvent() { return true; },
    setTimeout: () => 0, clearTimeout() {}, setInterval: () => 0, clearInterval() {}, requestAnimationFrame: () => 0, cancelAnimationFrame() {},
    matchMedia: () => ({ matches: false, addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {} }),
    getComputedStyle: () => ({ getPropertyValue: () => '' }), scrollTo() {}, scrollBy() {}, alert() {}, confirm: () => false, prompt: () => null, open: () => null,
    fetch: () => new Promise(() => {}), innerWidth: 0, innerHeight: 0, devicePixelRatio: 1, screen: { width: 0, height: 0 },
    history: { replaceState() {}, pushState() {}, state: null }, performance: { now: () => Date.now(), mark() {}, measure() {} },
    MutationObserver: Dummy, ResizeObserver: Dummy, IntersectionObserver: Dummy, Image: Dummy, Event: Dummy, CustomEvent: Dummy, FileReader: Dummy,
    console: opt.quiet ? { log() {}, info() {}, warn() {}, error() {}, debug() {}, time() {}, timeEnd() {} } : console,
    URL, URLSearchParams, TextEncoder, TextDecoder, Blob, atob, btoa, structuredClone, crypto: globalThis.crypto, queueMicrotask
  };
  if (opt.safeBuild) win.HK_SAFE_BUILD = 1;
  win.HK_MANIFEST = { v: '', api: 1, build: opt.build, core: '', chunks: {}, order: [], scen: {}, tones: { auto: [] }, vm: true };
  win.window = win; win.self = win; win.top = win; win.parent = win; win.globalThis = win;
  return win;
}

/* load.js が無いうちの代わり（def はその場で実行、done で onChunk を呼ぶだけ） */
const LOAD_FALLBACK = `(function () { var HK = window.HK = window.HK || {}; var subs = [];
  HK.Load = { cur: 0, gen: 0, flags: {}, def: function (n, f, fn) { HK.Load.cur = n; try { fn(); } finally { HK.Load.cur = 0; } },
    onChunk: function (fn) { subs.push(fn); }, done: function (name) { subs.slice().forEach(function (fn) { fn(name); }); HK.Load.gen++; },
    has: function () { return true; }, ensure: function () { return Promise.resolve(); }, prefetch: function () {}, all: function () { return Promise.resolve(); } }; })();`;

/* ---------- 実行して情報を集める ----------
   chunks：[{ name, hash, files: [{ n, f, src }] }]（実行の順。先頭が core）、loadSrc：js/load.js の中身（無ければ null） */
function runVm(opt) {
  const win = makeWindow(opt), ctx = vm.createContext(win), errs = [], t0 = Date.now();
  const onRej = e => errs.push('（約束の失敗）' + String(e && e.message || e).slice(0, 160));
  process.on('unhandledRejection', onRej);
  const run = (code, filename, lineOffset) => vm.runInContext(code, ctx, { filename, lineOffset: lineOffset || 0 });
  try { run(opt.loadSrc != null ? opt.loadSrc : LOAD_FALLBACK, 'js/load.js'); } catch (e) { errs.push('js/load.js: ' + String(e && e.message || e).slice(0, 160)); }
  const cap = {}, home = {}, ord = [];
  /* SCEN_ORDER の並びを ord にまとめる（新しい id は、今の並びで直前にある id の後ろに入れる） */
  const scan = chunk => {
    const HK = win.HK || {}, S = HK.SCENARIOS || {};
    Object.keys(S).forEach(id => { const s = S[id]; if (s && typeof s === 'object' && !s.stub) { cap[id] = s; if (!home[id]) home[id] = chunk; } });
    const so = Array.isArray(HK.SCEN_ORDER) ? HK.SCEN_ORDER : [];
    so.forEach((id, i) => {
      if (ord.indexOf(id) >= 0) return;
      let at = 0;
      for (let j = i - 1; j >= 0; j--) { const p = ord.indexOf(so[j]); if (p >= 0) { at = p + 1; break; } }
      ord.splice(at, 0, id);
    });
  };
  opt.chunks.forEach(c => {
    c.files.forEach(x => {
      try { run('HK.Load.def(' + x.n + ", '" + x.f + "', function () {\n" + x.src + '\n});', x.f, -1); }
      catch (e) { errs.push(x.f + ': ' + String(e && e.message || e).slice(0, 160)); }
      scan(c.name);
    });
    if (!c.noDone) try { win.HK.Load.done(c.name, c.hash, 1); } catch (e) { errs.push(c.name + ' の done: ' + String(e && e.message || e).slice(0, 160)); }
    scan(c.name);
  });
  process.removeListener('unhandledRejection', onRej);
  const HK = win.HK || {};
  /* load.js の def は例外を受け止めて HK.Load.errors に積む（残りのファイルを続けるため）。それも拾う */
  ((HK.Load && Array.isArray(HK.Load.errors)) ? HK.Load.errors : []).forEach(e => errs.push((e.file || '?') + ': ' + String(e.err || e.message || e).slice(0, 160)));
  return { HK, cap, home, ord, finalOrder: (HK.SCEN_ORDER || []).slice(), errs, ms: Date.now() - t0 };
}

/* ---------- 目録の中身 ---------- */
/* 関数を落とし、vm の中の値を外の素の値にする */
const plain = v => v === undefined ? undefined : JSON.parse(JSON.stringify(v, (k, x) => typeof x === 'function' ? undefined : x));
const idLabel = a => Array.isArray(a) ? a.filter(x => x && typeof x === 'object').map(x => { const o = { id: x.id }; if (x.label != null) o.label = x.label; return plain(o); }) : undefined;
function scenEntry(s, id, R, need) {
  const o = {};
  Object.keys(s).forEach(k => { const v = s[k]; if (typeof v === 'string' || typeof v === 'number' || typeof v === 'boolean') o[k] = v; });
  ['env', 'stats'].forEach(k => { const a = idLabel(s[k]); if (a) o[k] = a; });
  /* perFields は本体を読む前から選べるように、id・label に加えて auto（おまかせの表示）と options（各選択肢の id・label だけ。desc や関数は入れない）も */
  if (Array.isArray(s.perFields)) o.perFields = s.perFields.filter(x => x && typeof x === 'object').map(x => {
    const f = { id: x.id };
    if (x.label != null) f.label = x.label;
    if (x.auto != null && typeof x.auto !== 'function') f.auto = x.auto;
    if (Array.isArray(x.options)) f.options = idLabel(x.options);
    return plain(f);
  });
  const SM = R.HK.ScenMeta;
  let card;
  try { card = SM ? (typeof SM.card === 'function' ? SM.card(id) : SM[id]) : undefined; } catch (e) { card = undefined; }
  if (card != null) o.card = plain(card);
  const TB = R.HK.ScenTags && R.HK.ScenTags.TABLE;
  if (TB && TB[id]) o.tags = plain(TB[id]);
  o.chunks = need(id);
  return o;
}
/* chunks：{ 名前: { src, br, deps } }（core を除く）。need(id)：その箱庭に要るかたまりの並び */
function makeManifest(R, opt) {
  const ord = opt.ord || R.ord, order = ord.filter(id => R.cap[id]).concat(R.ord.filter(id => R.cap[id] && ord.indexOf(id) < 0));
  const scen = {};
  order.forEach(id => { scen[id] = scenEntry(R.cap[id], id, R, opt.need); });
  const HK = R.HK, keys = HK.TONE_KEYS || [], auto = ['aniki'].concat(HK.PERSONA_KEYS || []).filter(k => keys.indexOf(k) >= 0);
  return { v: opt.v, api: 1, build: opt.build, core: opt.core, chunks: opt.chunks, order, scen, tones: { auto } };
}
/* 目録の文字列（鍵も）に性的な語が残っていないか。場所は目録の鍵で示す */
function guardManifest(m, EXPLICIT) {
  const bad = [];
  const walk = (v, p) => {
    if (typeof v === 'string') { if (EXPLICIT.test(v)) bad.push('目録 ' + p + '　[' + v.match(EXPLICIT)[0] + ']　' + v.slice(0, 60)); return; }
    if (Array.isArray(v)) { v.forEach((x, i) => walk(x, p + '[' + i + ']')); return; }
    if (v && typeof v === 'object') Object.keys(v).forEach(k => { if (EXPLICIT.test(k)) bad.push('目録 ' + p + ' の鍵　[' + k.match(EXPLICIT)[0] + ']　' + k); walk(v[k], p ? p + '.' + k : k); });
  };
  walk(m, '');
  return bad;
}
/* index.html に書く形（箱庭は1行に1つ。</script> などが中に出ないように < を逃がす） */
function manifestJs(m) {
  const j = v => JSON.stringify(v).replace(/</g, '\\u003c').replace(/\u2028/g, '\\u2028').replace(/\u2029/g, '\\u2029');
  const head = ['v', 'api', 'build', 'core'].map(k => j(k) + ':' + j(m[k])).join(',');
  const ch = Object.keys(m.chunks).map(k => '  ' + j(k) + ':' + j(m.chunks[k])).join(',\n');
  const sc = Object.keys(m.scen).map(k => '  ' + j(k) + ':' + j(m.scen[k])).join(',\n');
  return 'window.HK_MANIFEST={' + head + ',\n"chunks":{\n' + ch + '},\n"order":' + j(m.order) + ',\n"scen":{\n' + sc + '},\n"tones":' + j(m.tones) + '};';
}
/* 前回の index.html から目録を読む（--no-manifest 用） */
function readManifest(html) {
  const m = html.match(/<script>window\.HK_MANIFEST=([\s\S]*?);<\/script>/);
  if (!m) return null;
  try { return JSON.parse(m[1]); } catch (e) { return null; }
}
module.exports = { runVm, makeManifest, guardManifest, manifestJs, readManifest };
