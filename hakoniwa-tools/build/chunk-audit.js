/* 分割読み込みのかたまりの境目の点検（読み込み時の HK.X の読み書きを Proxy で実測する。担当BH の rtrace.js と同じやり方）
   使い方：
     node hakoniwa-tools/build/chunk-audit.js <ビルドのディレクトリ> [r18|safe] [--out=詳細.json] [--v]
   数えるもの（全部 0 件なら exit 0）：
     (1) 分類：_order.txt の全行が、ちょうど1つのかたまりに入っている（注記どおりのかたまり。js/load.js は core の先頭で包まない）。
         かたまりの中の HK.Load.def の通し番号が実行順（late 以外を並びの順に、そのあと late。js/load.js が 1）と合っている。
     (2) 中核のファイルが、読み込み時に中核以外の持ち物（HK.X。持ち主＝最初に書いたファイル）を読んでいない
         （元の並びでもまだ無かったもの＝持ち主のファイルが後ろにあるものは数えない。中核はいつも先に読むので、元と同じく「無い」を見るだけ）。
     (3) 共有のかたまり（late・pack-*）が、箱庭のかたまり（scen-*）の持ち物を読み込み時に読んでいない。
     (3') ほかのかたまりどうし：かたまり X のファイルが、X・core・X の deps（たどった先も）以外のかたまりの持ち物を読み込み時に読んでいない
         （読む順で「有る／無い」が変わる）。
     (4) 同じ HK.X（と HK.SCENARIOS.<id>）を2つのかたまりが作っていない：「無いときに書いた」か「同じ値を書き直した（HK.X = HK.X || {} の形）」
         ファイルを作り手とし、作り手のかたまりが2つ以上あって、どれか1つ（core か、ほかの全員の deps）が必ず先に読まれる、と言えないもの。
     (5) 口調のデータ：tone の印のファイル（_order.txt の「tone js/xx.js」）はどのかたまりにも def で入っていない。
         口調のかたまり（目録の tone-base・tones.pack の tone-*）は 'tone:<口調>' の def だけを持ち、ほかのかたまりの後ろの def は 'tone:<そのかたまり>' でかたまりの最後にある。
         'tone:' の def の中身は HK.Load.toneData('<口調>', {…文字・数・配列・物だけ…}) の並びだけ（何も読まない。acorn で字句の形を見る）。
         目録の tones.pack の口調は HK.TONE_KEYS にある・かたまりがある。読み込み時の読み書き（下の実測）も、'tone:' の def は core のほかを読まない。
   自分で書いて自分で読む（HK.X = HK.X || {} など）読みは数えない。目録の仮の箱庭（stub: true）を書くのは持ち主に数えない。
   取り付け役（HK.Load.onChunk を登録したファイル）の読み込み時の読みは数えない（いま有る分に当て、後から来た分は onChunk で当てる作り）。
   中核のファイルが HK.SCENARIOS.<id>（箱庭の本体）を読むのは参考に出すだけ（画面の描画など。本体が無ければ HK.Load.info の仮の箱庭を使う作り）。
   持ち物は2段目まで見る（HK.X と、HK.X が素の物なら HK.X.y。2段目の持ち主は、def の前後で鍵が増えたファイル）。
   ページは file:// の index.html#<mode>&all（全部のかたまりを読む）で開く。 */
'use strict';
const fs = require('fs'), path = require('path');
const R = require('./regress.js'), lib = require('../tone-check/lib.js'), CR = require('./chunk-regress.js');

/* _order.txt → [{file, chunk, n}]（n は 1 始まりの元の通し番号） */
function readOrder(dir) {
  const out = [];
  fs.readFileSync(path.join(dir, 'js/_order.txt'), 'utf8').split(/\r?\n/).forEach(line => {
    let s = line.replace(/\s+#.*$/, '').trim();
    if (!s || s[0] === '#' || s[0] === '@') return;   /* @chunk・@need などの行はファイルではない */
    let chunk = 'core';
    if (/^late\s+/.test(s)) { chunk = 'late'; s = s.replace(/^late\s+/, ''); }
    else if (/^tone\s+/.test(s)) { chunk = 'tone'; s = s.replace(/^tone\s+/, ''); }
    const m = s.match(/@(pack|scen):(\S+)/); if (m) chunk = m[1] + '-' + m[2];
    const file = s.split(/\s+/)[0];
    out.push({ file, chunk, n: 0 });
  });
  /* 通し番号は実行順（build.js と同じ）：late・tone 以外を並びの順に、そのあと late と tone を並びの順に（js/load.js が 1） */
  const L = o => o.chunk === 'late' || o.chunk === 'tone';
  out.filter(o => !L(o)).concat(out.filter(L)).forEach((o, i) => { o.n = i + 1; });
  return out;
}
/* かたまりのファイルから HK.Load.def(n, 'js/x.js', …) を拾う（口調のデータの def 'tone:<名前>' は toneDefs に分ける。n は小数もある） */
function readDefs(dir, man, toneDefs) {
  const list = [['core', man.core]].concat(Object.keys(man.chunks).map(n => [n, man.chunks[n].src]));
  const defs = [];
  list.forEach(([name, src]) => {
    const code = fs.readFileSync(path.join(dir, src), 'utf8');
    const re = /HK\.Load\.def\(\s*(\d+(?:\.\d+)?)\s*,\s*(['"])([^'"]+)\2/g; let m, k = 0;
    while ((m = re.exec(code))) {
      const d = { n: +m[1], file: m[3], chunk: name, k: k++, at: m.index };
      if (/^tone:/.test(d.file)) { if (toneDefs) toneDefs.push(d); } else defs.push(d);
    }
    if (toneDefs) toneDefs.filter(d => d.chunk === name).forEach(d => { d.total = k; });
  });
  return defs;
}
/* 口調のデータの def の中身が HK.Load.toneData('<口調>', {…値だけ…}) の並びだけか（acorn の構文木で見る） */
function checkToneCode(dir, man, toneDefs, probs) {
  let acorn; try { acorn = require('./build-min.js').loadAcorn(); } catch (e) { acorn = null; }
  if (!acorn) { probs['5'].push('acorn が無いので口調のデータの中身を確かめられません（npm install）'); return; }
  const lit = n => n.type === 'Literal' ? !(n.regex) : n.type === 'ArrayExpression' ? n.elements.every(x => x && lit(x)) :
    n.type === 'ObjectExpression' ? n.properties.every(p => p.type === 'Property' && !p.computed && p.kind === 'init' && !p.method && lit(p.value)) :
    n.type === 'UnaryExpression' && n.operator === '-' ? n.argument.type === 'Literal' : false;
  const isTD = c => c.type === 'CallExpression' && c.callee.type === 'MemberExpression' && !c.callee.computed && c.callee.property.name === 'toneData' &&
    c.callee.object.type === 'MemberExpression' && !c.callee.object.computed && c.callee.object.property.name === 'Load' && c.callee.object.object.type === 'Identifier' && c.callee.object.object.name === 'HK';
  const chunks = Array.from(new Set(toneDefs.map(d => d.chunk)));
  chunks.forEach(name => {
    const src = name === 'core' ? man.core : man.chunks[name].src, code = fs.readFileSync(path.join(dir, src), 'utf8');
    let ast; try { ast = acorn.parse(code, { ecmaVersion: 'latest' }); } catch (e) { probs['5'].push(name + '：構文の誤り ' + e.message); return; }
    ast.body.forEach(st => {
      const c = st.type === 'ExpressionStatement' && st.expression;
      if (!c || c.type !== 'CallExpression' || !c.arguments[1] || c.arguments[1].type !== 'Literal' || !/^tone:/.test(String(c.arguments[1].value))) return;
      const f = c.arguments[2], who = name + ' の ' + c.arguments[1].value;
      if (!f || f.type !== 'FunctionExpression' || f.params.length) { probs['5'].push(who + '：def の第3引数が引数なしの関数でない'); return; }
      f.body.body.forEach(s2 => {
        const e = s2.type === 'ExpressionStatement' && s2.expression;
        if (!e || !isTD(e)) { probs['5'].push(who + '：HK.Load.toneData の呼び出しでない文がある（' + s2.type + '）'); return; }
        if (e.arguments.length !== 2 || e.arguments[0].type !== 'Literal' || typeof e.arguments[0].value !== 'string' || !lit(e.arguments[1])) probs['5'].push(who + '：toneData の引数が「口調の文字列と値だけの物」でない');
      });
    });
  });
}

/* ページに入れる計測（window.HK を Proxy にする。持ち主・作り手・読み書きを記録） */
const INST = function (FILES) {
  var Rr = window.__R = { on: true, log: {}, own: {}, cre: {}, attach: {} };
  var T = null, P = null;
  var P2T = new WeakMap(), T2P = new WeakMap();   /* 2段目の Proxy と元の物 */
  function raw(v) { return (v && typeof v === 'object' && P2T.has(v)) ? P2T.get(v) : v; }
  function plain(v) { if (!v || typeof v !== 'object' || Array.isArray(v)) return false; var pr = Object.getPrototypeOf(v); return pr === Object.prototype || pr === null; }
  /* HK.Load の onChunk（取り付け役の記録）と def（ファイルごとに 2段目の鍵の増えたものを持ち主として記録）を包む */
  function snap() { var m = {}; Object.keys(T).forEach(function (k) { var o = T[k]; if (plain(o) && k !== 'Load') m[k] = { o: o, keys: Object.keys(o) }; }); return m; }
  function hookLoad(L) {
    if (!L || L.__auditHook || typeof L.onChunk !== 'function') return;
    L.__auditHook = true;
    var oc = L.onChunk; L.onChunk = function () { var f = cur(); if (f) Rr.attach[f] = 1; return oc.apply(this, arguments); };
    var od = L.def; L.def = function (n, file, fn) {
      var before = Rr.on ? snap() : null;
      var r = od.apply(this, arguments);
      if (before) Object.keys(T).forEach(function (k) {
        var o = T[k]; if (!plain(o) || k === 'Load' || k === 'SCENARIOS') return;
        var b = before[k], ks = Object.keys(o);
        if (b && b.o === o && b.keys.length === ks.length) return;
        var had = {}; if (b && b.o === o) b.keys.forEach(function (x) { had[x] = 1; }); else if (b) b.keys.forEach(function (x) { had[x] = 1; });
        ks.forEach(function (x) { var key = k + '.' + x; if (!had[x] && !(key in Rr.own)) Rr.own[key] = file; });
      });
      return r;
    };
  }
  function cur() {
    var L = T && T.Load;
    if (!L) return 'js/load.js';
    var n = L.cur;
    /* def の中は L.file が立つ。onChunk の呼び出しは L.cur だけ（登録したファイルの番号）なので数えない */
    if (n) return L.file ? L.file : (L.def && 'file' in L ? null : (FILES[n] || ('#' + n)));
    return (L.gen > 0) ? null : 'js/load.js';
  }
  function note(f, k, w) { var m = Rr.log[f] || (Rr.log[f] = {}); m[(w ? 'W ' : 'R ') + k] = (m[(w ? 'W ' : 'R ') + k] || 0) + 1; }
  function isObj(v) { return v !== null && (typeof v === 'object' || typeof v === 'function'); }
  function onWrite(f, key, had, old, v) {
    if (v && typeof v === 'object' && v.stub === true && /^SCENARIOS\./.test(key)) return;   /* 目録の仮の箱庭 */
    note(f, key, 1);
    if (!(key in Rr.own)) Rr.own[key] = f;
    if (!had || (old === v && isObj(v))) { var c = Rr.cre[key] || (Rr.cre[key] = []); if (c.indexOf(f) < 0) c.push(f); }
  }
  /* 2段目（HK.X が素の物のとき。HK.SCENARIOS は箱庭の id ごと）：読み書きを 'X.y' で記録する */
  function wrap2(name, o) {
    if (!plain(o)) return o;
    var p = T2P.get(o); if (p) return p;
    var scen = name === 'SCENARIOS';
    p = new Proxy(o, {
      get: function (t, k) { var v = t[k]; if (Rr.on && typeof k === 'string') { var f = cur(); if (f) note(f, name + '.' + k + (k in t && !(scen && v && v.stub === true) ? '' : '?'), 0); } return v; },
      set: function (t, k, v) { v = raw(v); if (Rr.on && typeof k === 'string') { var f = cur(); if (f) { if (scen) onWrite(f, name + '.' + k, (k in t) && !(t[k] && t[k].stub === true), t[k], v); else { note(f, name + '.' + k, 1); if (!((name + '.' + k) in Rr.own)) Rr.own[name + '.' + k] = f; } } } t[k] = v; return true; },
      has: function (t, k) { if (Rr.on && typeof k === 'string') { var f = cur(); if (f) note(f, name + '.' + k + (k in t ? '' : '?'), 0); } return k in t; }
    });
    T2P.set(o, p); P2T.set(p, o); return p;
  }
  function make(t) {
    return new Proxy(t, {
      get: function (t, k) { var v = t[k]; if (k === 'Load') { hookLoad(v); return v; } if (Rr.on && typeof k === 'string') { var f = cur(); if (f) note(f, k + (k in t ? '' : '?'), 0); return wrap2(k, v); } return v; },
      set: function (t, k, v) { v = raw(v); if (Rr.on && typeof k === 'string') { var f = cur(); if (f) onWrite(f, k, k in t, t[k], v); } t[k] = v; return true; },
      has: function (t, k) { if (Rr.on && typeof k === 'string') { var f = cur(); if (f) note(f, k + (k in t ? '' : '?'), 0); } return k in t; }
    });
  }
  T = {}; P = make(T);
  Object.defineProperty(window, 'HK', { configurable: true, get: function () { return P; }, set: function (v) { v = raw(v); if (v === P || v === T) return; T = v; P = make(v); } });
};

async function main() {
  const args = process.argv.slice(2), pos = args.filter(a => !a.startsWith('--')), opt = {};
  args.filter(a => a.startsWith('--')).forEach(a => { const m = a.slice(2).split('='); opt[m[0]] = m.length > 1 ? m.slice(1).join('=') : true; });
  const dir = path.resolve(pos[0]), mode = pos[1] != null ? pos[1] : (/zenrei/.test(dir) ? '' : 'r18');
  const man = CR.readManifest(dir);
  if (!man) { console.error('目録（HK_MANIFEST）が無い index.html です（分割読み込みの版ではない）'); process.exit(2); }
  const order = readOrder(dir), toneDefs = [], defs = readDefs(dir, man, toneDefs);
  const probs = { '1': [], '2': [], '3': [], "3'": [], '4': [], '5': [] };
  /* ---------- (1) 分類 ---------- */
  const chunkOf = {}, nOf = {}, FILES = {};
  defs.forEach(d => {
    if (chunkOf[d.file]) probs['1'].push(d.file + '：2つのかたまりに入っている（' + chunkOf[d.file] + '・' + d.chunk + '）');
    chunkOf[d.file] = d.chunk; nOf[d.file] = d.n; FILES[d.n] = d.file;
  });
  const inOrder = {};
  order.forEach(o => {
    inOrder[o.file] = o;
    if (o.chunk === 'tone') { if (chunkOf[o.file]) probs['5'].push(o.file + '：tone の印なのに、かたまり ' + chunkOf[o.file] + ' に def で入っている'); return; }
    if (o.file === 'js/load.js') { if (chunkOf[o.file]) probs['1'].push('js/load.js が def で包まれている'); chunkOf[o.file] = 'core'; nOf[o.file] = o.n; return; }
    if (!chunkOf[o.file]) { probs['1'].push(o.file + '：どのかたまりにも入っていない（_order.txt では ' + o.chunk + '）'); return; }
    if (chunkOf[o.file] !== o.chunk) probs['1'].push(o.file + '：かたまりが ' + chunkOf[o.file] + '（_order.txt の注記は ' + o.chunk + '）');
  });
  defs.forEach(d => { if (!inOrder[d.file]) probs['1'].push(d.file + '：_order.txt に無いのにかたまりに入っている（' + d.chunk + '）'); });
  /* 通し番号が _order.txt の並びと同じ向きか */
  const nBad = defs.filter(d => inOrder[d.file] && inOrder[d.file].n !== d.n);
  if (nBad.length) probs['1'].push('def の通し番号が _order.txt の実行順と違う：' + nBad.length + ' 本（例 ' + nBad.slice(0, 3).map(d => d.file + ' ' + d.n + '≠' + inOrder[d.file].n).join('、') + '）');
  /* かたまりの依存（自分・core・deps をたどった先） */
  /* ---------- (5) 口調のデータ ---------- */
  const tones = man.tones || {}, pack = tones.pack || {}, toneChunks = Object.keys(man.chunks).filter(n => /^tone-/.test(n));
  toneDefs.forEach(d => {
    if (/^tone-/.test(d.chunk)) {
      const t = d.file.slice(5);
      if (d.chunk === 'tone-base' ? (tones.auto || []).indexOf(t) < 0 : pack[t] !== d.chunk) probs['5'].push(d.chunk + ' に口調 ' + t + ' の def（目録の tones では ' + (pack[t] || ((tones.auto || []).indexOf(t) >= 0 ? 'tone-base' : '無し')) + '）');
    } else {
      if (d.file !== 'tone:' + d.chunk) probs['5'].push(d.chunk + ' の後ろの口調のデータの def の名前が ' + d.file + '（tone:' + d.chunk + ' のはず）');
      if (d.k !== d.total - 1) probs['5'].push(d.chunk + ' の ' + d.file + ' がかたまりの最後の def でない');
      const last = defs.filter(x => x.chunk === d.chunk).reduce((a, x) => Math.max(a, x.n), 0);
      if (!(d.n > last)) probs['5'].push(d.chunk + ' の ' + d.file + ' の通し番号 ' + d.n + ' がソースの最後（' + last + '）より前');
    }
  });
  toneChunks.forEach(n => { if (defs.some(d => d.chunk === n)) probs['5'].push(n + '：口調のかたまりに口調のデータでない def がある'); if (!toneDefs.some(d => d.chunk === n)) probs['5'].push(n + '：口調のかたまりが空'); });
  Object.keys(pack).forEach(t => { if (!man.chunks[pack[t]]) probs['5'].push('目録 tones.pack の ' + t + ' → ' + pack[t] + ' というかたまりが無い'); });
  checkToneCode(dir, man, toneDefs, probs);
  const allowed = name => { const s = new Set(['core', name]); if (man.chunks[name]) CR.depClosure(man, [name]).forEach(x => s.add(x)); return s; };
  /* ---------- 実測 ---------- */
  const b = await R.launch(); const ctx = await b.newContext(); const page = await ctx.newPage(); const errors = [];
  page.on('pageerror', e => errors.push(String(e).slice(0, 300)));
  await page.addInitScript(INST, FILES);
  await page.goto(lib.buildUrl(dir, mode));
  await R.waitReady(page);
  const rec = await page.evaluate(() => { window.__R.on = false; return { log: window.__R.log, own: window.__R.own, cre: window.__R.cre, attach: window.__R.attach, toneKeys: (window.HK && window.HK.TONE_KEYS || []).slice() }; });
  Object.keys(pack).concat(tones.auto || []).forEach(t => { if (rec.toneKeys.indexOf(t) < 0) probs['5'].push('目録 tones の口調 ' + t + ' が HK.TONE_KEYS に無い'); });
  await b.close();
  /* 口調のデータの def（'tone:<名前>'）はその def のあるかたまり（tone:<かたまり> はそのかたまり、tone:<口調> は口調のかたまり） */
  const toneChunkOf = {}; toneDefs.forEach(d => { toneChunkOf[d.file] = d.chunk; });
  const ch = f => f === 'js/load.js' ? 'core' : /^tone:/.test(f) ? toneChunkOf[f] : chunkOf[f];
  const ordN = f => nOf[f] || 0;
  /* ---------- (2)(3)(3') 読み ---------- */
  const info = { attach: [], core: [] };
  Object.keys(rec.log).forEach(f => {
    const X = ch(f); if (!X) return;
    const ok = allowed(X), m = rec.log[f];
    const writes = new Set(Object.keys(m).filter(k => k[0] === 'W').map(k => k.slice(2)));
    Object.keys(m).filter(k => k[0] === 'R').forEach(k => {
      const key = k.slice(2).replace(/\?$/, ''), absent = /\?$/.test(k);
      const o = rec.own[key]; if (!o || writes.has(key)) return;
      const Y = ch(o); if (!Y || ok.has(Y)) return;
      const scen = /^SCENARIOS\./.test(key);
      /* 箱庭の本体の読み：取り付け役（onChunk を登録したファイル）は後から来た箱庭にも当てるので数えない。
         中核の読み（画面の描画など。本体が無ければ HK.Load.info の仮の箱庭を使う作り）は参考に出すだけ */
      /* 取り付け役（HK.Load.onChunk を登録したファイル）の読み込み時の読みは「いま有る分に当てる」1回目なので数えない（後から来た分は onChunk で当てる） */
      if (rec.attach[f]) { info.attach.push(f + ' → HK.' + key); return; }
      if (scen && X === 'core') { info.core.push(f + ' → HK.' + key + (absent ? '（今回 無い）' : '')); return; }
      const was = ordN(o) < ordN(f) ? '元の並びでは有った' : '元の並びでは無かった';
      const line = f + '（' + X + '）が HK.' + key + '（持ち主 ' + o + '・' + Y + '）を読む［今回 ' + (absent ? '無い' : '有る') + '・' + was + '］';
      if (X === 'core') { if (ordN(o) < ordN(f)) probs['2'].push(line); }
      else if (/^(late|pack-)/.test(X) && /^scen-/.test(Y)) probs['3'].push(line);
      else probs["3'"].push(line);
    });
  });
  /* ---------- (4) 作り手 ---------- */
  Object.keys(rec.cre).forEach(key => {
    const cs = Array.from(new Set(rec.cre[key].map(ch).filter(Boolean)));
    if (cs.length < 2) return;
    const first = cs.find(c => c === 'core' || cs.every(o => o === c || allowed(o).has(c)));
    if (first) return;
    /* 参考：作り手のソースがどれも「HK.X = HK.X || …」の形か（そうなら、どちらが先でも中身は足し合わされる） */
    const esc = key.replace(/[.$]/g, '\\$&'), re = new RegExp('HK\\.' + esc + '\\s*=\\s*(window\\.)?HK\\.' + esc + '\\s*\\|\\||HK\\.' + esc + '\\s*\\|\\|\\s*\\(\\s*HK\\.' + esc + '\\s*=');
    const allOr = !/^SCENARIOS\./.test(key) && rec.cre[key].every(f => { try { return re.test(fs.readFileSync(path.join(dir, f), 'utf8')); } catch (e) { return false; } });
    probs['4'].push('HK.' + key + '：作り手が ' + cs.join('・') + '（' + rec.cre[key].join('・') + '）' + (allOr ? '［どれも HK.X = HK.X || … の形］' : '［上書きのおそれ］'));
  });
  /* ---------- 出力 ---------- */
  const NAMES = { '1': '(1) かたまりへの振り分け', '2': '(2) 中核が中核以外の持ち物を読む', '3': '(3) 共有のかたまりが箱庭の持ち物を読む', "3'": "(3') かたまりどうしで依存の外を読む", '4': '(4) 同じ持ち物を2つのかたまりが作る', '5': '(5) 口調のデータ' };
  let total = 0;
  Object.keys(probs).forEach(k => { const L = Array.from(new Set(probs[k])); total += L.length; console.log(NAMES[k] + '：' + L.length + ' 件'); L.slice(0, opt.v ? 1e9 : 15).forEach(x => console.log('   ' + x)); if (!opt.v && L.length > 15) console.log('   …ほか ' + (L.length - 15) + ' 件（--v で全部）'); });
  const sumBy = L => { const m = {}; L.forEach(x => { const f = x.split(' → ')[0]; m[f] = (m[f] || 0) + 1; }); return Object.keys(m).map(f => f + ' ' + m[f]).join('・'); };
  console.log('（参考・数えない）取り付け役が読み込み時に依存の外を読む：' + info.attach.length + ' 件' + (info.attach.length ? '（' + sumBy(info.attach) + '）' : '') + '／取り付け役：' + Object.keys(rec.attach).join('・'));
  console.log('（参考・数えない）中核が読み込み時に箱庭の本体を引く（取り付け役でないもの。画面の描画など）：' + info.core.length + ' 件' + (info.core.length ? '（' + sumBy(info.core) + '）' : ''));
  if (opt.v) info.core.forEach(x => console.log('   ' + x));
  if (errors.length) { console.log('ページのエラー：' + errors.length + ' 件'); errors.slice(0, 5).forEach(e => console.log('   ' + e)); total += errors.length; }
  const nChunk = {}; order.forEach(o => { const c = o.chunk === 'tone' ? 'tone（データ）' : chunkOf[o.file] || '?'; nChunk[c] = (nChunk[c] || 0) + 1; });
  console.log('口調のデータ：口調のかたまり ' + toneChunks.length + ' 個（tone-base ' + (man.chunks['tone-base'] ? 'あり' : '無し') + '・tones.pack ' + Object.keys(pack).length + '）、tone: の def ' + toneDefs.length + ' 本（口調のかたまりの中 ' + toneDefs.filter(d => /^tone-/.test(d.chunk)).length + '・ほかのかたまりの後ろ ' + toneDefs.filter(d => !/^tone-/.test(d.chunk)).length + '）');
  console.log('かたまりごとのファイル数：' + Object.keys(nChunk).map(k => k + ' ' + nChunk[k]).join('・') + '／記録したファイル ' + Object.keys(rec.log).length + '・持ち物 ' + Object.keys(rec.own).length);
  console.log('chunk-audit ' + path.basename(dir) + ' ' + (mode || '(無印)') + '：' + total + ' 件');
  if (opt.out) fs.writeFileSync(opt.out, JSON.stringify({ probs, info, attach: rec.attach, own: rec.own, cre: rec.cre, chunkOf }, null, 1));
  process.exit(total ? 1 : 0);
}
module.exports = { readOrder, readDefs };
if (require.main === module) main().catch(e => { console.error(e); process.exit(2); });
