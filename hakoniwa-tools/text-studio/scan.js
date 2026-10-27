/* 文の索引づくり：ビルドの js を構文解析して、文（台詞・地の文）の「群」を拾い出す
   node scan.js <ビルドのフォルダ> [stats|check|groups] [--json]
   例：node scan.js ../../hakoniwa-full stats     … 箱庭ごと・ファイルごとの文の数
       node scan.js ../../hakoniwa-full check     … 不整合の点検（括弧の対応・空の候補・重複・口調の表の抜け・全年齢版との差）
   群の種類
   ・array … 文の配列 ['…', '…']。要素の一つ一つが候補
   ・pipe  … 「|」区切りの一つの文字列 L('…|…')・E(…, '…|…')。区切りの一つ一つが候補
   ・tsv   … タブ区切りの行の配列（口調の書き下ろし辞書など）。一行が一つの候補で、列ごとに直せる
   ・single … 配列に入っていない一つだけの文（text: '…' など）
   どの群も、ファイルの中の位置（start〜end）を持つので、その場所だけを書き換えられる */
'use strict';
const fs = require('fs'), path = require('path');
const acorn = require('./vendor/acorn.js');

const JA = /[぀-ヿ㐀-鿿]/;
const JA_G = /[぀-ヿ㐀-鿿]/g;
/* 文字列が「文」として扱えるか（かな・漢字を含む） */
/* 正規表現の元の文字列・HTML は文として扱わない */
const NOT_TEXT = /\(\?[:=!<]|\[\^|\\[sdwb]|\(\^|\$\)|<\/?[a-z][a-z0-9]*[\s>]/;
function isJa(s) { return typeof s === 'string' && JA.test(s) && !NOT_TEXT.test(s); }
function jaCount(s) { return (s.match(JA_G) || []).length; }

/* 9つの態度（文面の表の口調）。口調の一覧は実行時に HK.TONE_KEYS から取るが、索引では名前の候補として持っておく */
const PERSONA_KEYS = ['proud', 'stern', 'tsun', 'gentle', 'devoted', 'cool', 'free', 'shy', 'polite'];

/* 箱庭の id とファイル名の対応（ファイルの中に箱庭の名前が出てこないときの手がかり） */
const SCEN_FILE_HINT = {
  goukon: /^(mini-goukon|goukon|drunk|solo-goukon)/, whiteroom: /^(mini-room|room-|scenario-room|solo-room)/,
  classroom: /^(mini-classroom|classroom)/, island: /^(mini-island|island)/, ship: /^ship/, zombie: /^(zombie|solo-zombie)/,
  jashin: /^(jashin|solo-jashin)/, yakata: /^(yakata|solo-yakata)/, omega: /^(omega|obsess-omega)/, dungeon: /^dungeon/,
  massage: /^solo-massage/, hole: /^(solo-hole|hole-)/, kaihen: /^solo-kaihen/, succubus: /^solo-succubus/, saimin: /^solo-saimin/,
  variety: /^(solo-variety|solo-erotic)/, locker: /^(solo-locker|locker-)/, rpg: /^(rpg|scenario-rpg)/, jinro: /^(jinro|scenario-jinro)/,
  br: /^scenario-br/, trial: /^scenario-trial/
};

/* 画面の文字（選択欄の名前・説明など）。文の一覧では既定で隠す */
const UI_KEY = { label: 1, desc: 1, lo: 1, hi: 1, name: 1, n: 1, kicker: 1, note: 1, unit: 1, castHint: 1, title: 1, hint: 1, placeholder: 1, help: 1, short: 1 };
const UI_FILE = /^(ui|view|tips|saves|share-card|egoquiz|icons|dungeon-view|safe|reset)/;

function readOrder(dir) {
  const p = path.join(dir, 'js/_order.txt');
  if (!fs.existsSync(p)) throw new Error('js/_order.txt がありません: ' + dir);
  return fs.readFileSync(p, 'utf8').split('\n').map(l => l.replace(/#.*$/, '').trim()).filter(l => l && !/^@/.test(l))
    .map(l => { const m = l.match(/^(late\s+)?(js\/\S+\.js)(?:\s+@\S+)*$/); return m ? { late: !!m[1], f: m[2] } : null; }).filter(Boolean);
}

/* ---------- 一つのファイルを読む ---------- */
const SKIP_CALLEE = { replace: 1, indexOf: 1, lastIndexOf: 1, test: 1, match: 1, split: 1, startsWith: 1, endsWith: 1, includes: 1, search: 1, RegExp: 1, querySelector: 1, querySelectorAll: 1, getElementById: 1, setAttribute: 1, getItem: 1, setItem: 1 };
const QUIET_CALLEE = { t: 1, pick: 1, pk: 1, L: 1, push: 1, concat: 1, join: 1, map: 1, forEach: 1, filter: 1, apply: 1, call: 1, f: 1, fill: 1 };

function calleeName(c) {
  if (!c) return '';
  if (c.type === 'Identifier') return c.name;
  if (c.type === 'MemberExpression' && !c.computed && c.property.type === 'Identifier') return c.property.name;
  return '';
}
function keyName(p) {
  if (!p || !p.key) return '';
  if (p.key.type === 'Identifier') return p.key.name;
  if (p.key.type === 'Literal') return String(p.key.value);
  return '';
}
function strLit(n) { return n && n.type === 'Literal' && typeof n.value === 'string'; }
function idOfObject(o) {
  if (!o || o.type !== 'ObjectExpression') return '';
  for (const p of o.properties) if (p.type === 'Property' && keyName(p) === 'id' && strLit(p.value)) return p.value.value;
  return '';
}
function isEventObject(o) {
  if (!idOfObject(o)) return false;
  return o.properties.some(p => p.type === 'Property' && /^(run|text|fn|w|when|lines)$/.test(keyName(p)));
}

/* 文の式か：文字列・テンプレート・「+」でつないだ式（かなか漢字の入った文字列を含むもの） */
function leaves(n, out) {
  if (n.type === 'BinaryExpression' && n.operator === '+') { leaves(n.left, out); leaves(n.right, out); }
  else out.push(n);
  return out;
}
function textOf(n, src) {
  if (!n) return null;
  if (strLit(n)) return isJa(n.value) ? { enc: 'lit', value: n.value } : null;
  if (n.type === 'TemplateLiteral') {
    if (!n.quasis.some(q => isJa(q.value.cooked))) return null;
    if (!n.expressions.length) return { enc: 'lit', value: n.quasis[0].value.cooked, tpl: true };
    let s = '';
    n.quasis.forEach((q, i) => { s += q.value.cooked; if (n.expressions[i]) s += '〔' + short(src.slice(n.expressions[i].start, n.expressions[i].end)) + '〕'; });
    return { enc: 'expr', value: s };
  }
  if (n.type === 'BinaryExpression' && n.operator === '+') {
    const L = leaves(n, []);
    if (!L.some(x => strLit(x) && isJa(x.value))) return null;
    return { enc: 'expr', value: L.map(x => strLit(x) ? x.value : '〔' + short(src.slice(x.start, x.end)) + '〕').join('') };
  }
  return null;
}
function short(s) { s = s.replace(/\s+/g, ' '); return s.length > 28 ? s.slice(0, 26) + '…' : s; }

/* 一つの候補を作る（ファイルの中の位置つき） */
function itemOf(n, t) {
  const it = { s: n.start, e: n.end, enc: t.enc, text: t.value };
  if (t.tpl) it.tpl = 1;
  return it;
}

function scanSource(src, file) {
  let ast;
  try { ast = acorn.parse(src, { ecmaVersion: 2022, sourceType: 'script', locations: true, allowHashBang: true }); }
  catch (e) { return { error: '構文エラー: ' + e.message, groups: [] }; }
  const groups = [], used = new Set(), ptables = [];

  function pathOf(anc) {
    const segs = [];
    let ev = '';
    for (let i = 0; i < anc.length; i++) {
      const a = anc[i].node, key = anc[i].key, next = anc[i + 1] ? anc[i + 1].node : null;
      if (a.type === 'VariableDeclarator' && key === 'init') segs.push(a.id.type === 'Identifier' ? a.id.name : '?');
      else if (a.type === 'AssignmentExpression' && key === 'right') segs.push(short(src.slice(a.left.start, a.left.end)).replace(/^(window\.)?HK\./, ''));
      else if (a.type === 'FunctionDeclaration' && a.id) segs.push(a.id.name + '()');
      else if (a.type === 'Property' && key === 'value') { const k = keyName(a); if (k) segs.push(k); }
      else if (a.type === 'CallExpression' && key === 'arguments') {
        const cn = calleeName(a.callee);
        const a0 = a.arguments[0];
        if (cn === 'E' && strLit(a0)) { segs.push('E(' + a0.value + ')'); ev = a0.value; }
        else if (cn && !QUIET_CALLEE[cn]) segs.push(cn + (strLit(a0) && !isJa(a0.value) && a0.value.length < 24 ? '(' + a0.value + ')' : '()'));
      } else if (a.type === 'ArrayExpression' && key === 'elements' && next) {
        const id = idOfObject(next);
        const idx = a.elements.indexOf(next);
        if (id) segs.push('#' + id); else if (next.type === 'ObjectExpression' || next.type === 'ArrayExpression') segs.push('[' + idx + ']');
      }
      if (a.type === 'ObjectExpression' && isEventObject(a)) ev = idOfObject(a);
    }
    /* 続けて同じ名前が並ぶのを詰める */
    const out = [];
    segs.forEach(s => { if (out[out.length - 1] !== s) out.push(s); });
    return { path: out.join('.'), ev };
  }
  function add(kind, anc, node, items, extra) {
    if (!items.length) return;
    const p = pathOf(anc);
    const g = { kind, path: p.path, s: node.start, e: node.end, line: node.loc.start.line, items };
    if (p.ev) g.ev = p.ev;
    const last = p.path.split('.').pop();
    g.role = UI_FILE.test(path.basename(file)) || UI_KEY[last] ? 'ui' : last === 'why' || /\.why$|why\(\)$/.test(p.path) ? 'why' : 'text';
    /* frag … 「+」でつなぐ式の一部（文の切れ端。括弧が片方だけでも正常） */
    if (anc.some(a => a.node.type === 'BinaryExpression' && a.node.operator === '+')) g.frag = 1;
    if (extra) Object.assign(g, extra);
    groups.push(g);
  }
  function pipeItems(lit) {
    /* 「|」区切りの区切りごとの文。書き換えは文字列全体を作り直す */
    return lit.value.split('|').map((t, i) => ({ s: lit.start, e: lit.end, enc: 'pipe', seg: i, text: t }));
  }
  function tsvItem(n) { return { s: n.start, e: n.end, enc: 'tsv', text: n.value, cols: n.value.split('\t') }; }

  function skipContext(n, anc) {
    const p = anc.length ? anc[anc.length - 1] : null;
    if (!p) return false;
    const pn = p.node;
    if (pn.type === 'Property' && p.key === 'key') return true;
    if (pn.type === 'MemberExpression' && p.key === 'property') return true;
    if (pn.type === 'ExpressionStatement' && pn.directive) return true;
    if (pn.type === 'BinaryExpression' && /^(===|!==|==|!=|in)$/.test(pn.operator)) return true;
    if (pn.type === 'SwitchCase') return true;
    if (pn.type === 'CallExpression' && p.key === 'arguments' && SKIP_CALLEE[calleeName(pn.callee)]) return true;
    if (pn.type === 'NewExpression' && calleeName(pn.callee) === 'RegExp') return true;
    return false;
  }

  function visit(n, anc) {
    if (!n || typeof n.type !== 'string') return;
    if (used.has(n)) return;
    /* 文の配列 */
    if (n.type === 'ArrayExpression' && n.elements.length) {
      const els = n.elements.filter(Boolean);
      const ts = els.map(x => textOf(x, src));
      const nText = ts.filter(Boolean).length;
      if (nText && nText >= els.length * 0.5 && !els.some(x => x.regex)) {
        const tsvN = els.filter((x, i) => ts[i] && ts[i].enc === 'lit' && strLit(x) && x.value.indexOf('\t') >= 0).length;
        const asTsv = tsvN >= Math.max(1, nText * 0.6);
        const items = [];
        els.forEach((x, i) => {
          if (!ts[i]) return;
          used.add(x);
          if (asTsv && strLit(x)) items.push(tsvItem(x));
          else items.push(itemOf(x, ts[i]));
        });
        /* 言い換えの表（正規表現の元の文字列を含む行や、[…][k] で口調ごとに引く表）は「コード」として分ける */
        const par = anc.length ? anc[anc.length - 1] : null;
        const code = els.some(x => strLit(x) && JA.test(x.value) && NOT_TEXT.test(x.value)) ||
          (par && par.node.type === 'MemberExpression' && par.key === 'object' && par.node.computed);
        add(asTsv ? 'tsv' : 'array', anc, n, items, code ? { n: n.elements.length, role: 'code' } : { n: n.elements.length });
        /* 「+」でつないだ式の中の配列（pk(ctx, [...]) など）も拾う */
        els.forEach((x, i) => { if (ts[i] && ts[i].enc === 'expr') visitChildren(x, anc.concat([{ node: n, key: 'elements' }]), true); });
        els.forEach((x, i) => { if (!ts[i]) visit(x, anc.concat([{ node: n, key: 'elements' }])); });
        return;
      }
    }
    /* 「|」区切りの文字列 */
    if (strLit(n) && n.value.indexOf('|') >= 0 && isJa(n.value) && !skipContext(n, anc)) {
      used.add(n);
      add('pipe', anc, n, pipeItems(n));
      return;
    }
    /* 一つだけの文 */
    const t = textOf(n, src);
    if (t && !skipContext(n, anc)) {
      if (jaCount(t.value) >= 3) {
        used.add(n);
        if (t.enc === 'lit' && strLit(n) && n.value.indexOf('\t') >= 0) add('tsv', anc, n, [tsvItem(n)]);
        else add('single', anc, n, [itemOf(n, t)]);
      }
      if (t.enc === 'expr') visitChildren(n, anc, true);
      return;
    }
    /* 態度の名前で分かれた表（キーが態度9種のうち5つ以上の { proud: …, stern: … }）。点検の「態度9種の表の抜け」に使う */
    /* 値が文の候補（配列・L('…|…') などの呼び出し・「|」区切り）のものだけ。{ proud: 1 } のような分類の表や、
       addP(表, { … }) のように既にある表へ足す分（関数の引数）は数えない */
    const par = anc.length ? anc[anc.length - 1] : null;
    if (n.type === 'ObjectExpression' && !(par && par.node.type === 'CallExpression' && par.key === 'arguments')) {
      const pool = v => v && (v.type === 'ArrayExpression' || v.type === 'CallExpression' || v.type === 'ObjectExpression' || (strLit(v) && v.value.indexOf('|') >= 0));
      const keys = n.properties.filter(p => p.type === 'Property' && PERSONA_KEYS.indexOf(keyName(p)) >= 0 && pool(p.value)).map(keyName);
      if (keys.length >= 5) ptables.push({ path: pathOf(anc).path, line: n.loc.start.line, s: n.start, e: n.end, keys });
    }
    visitChildren(n, anc, false);
  }
  /* exprOnly：文の式の中は、文字列以外（関数呼び出しの中の配列など）だけをたどる */
  function visitChildren(n, anc, exprOnly) {
    for (const k in n) {
      if (k === 'loc' || k === 'start' || k === 'end' || k === 'type') continue;
      const v = n[k];
      const a2 = anc.concat([{ node: n, key: k }]);
      if (Array.isArray(v)) v.forEach(x => { if (x && typeof x.type === 'string' && !(exprOnly && (strLit(x) || x.type === 'TemplateLiteral' || x.type === 'BinaryExpression'))) visit(x, a2); else if (exprOnly && x && x.type === 'BinaryExpression') visitChildren(x, a2, true); });
      else if (v && typeof v.type === 'string') {
        if (exprOnly && (strLit(v) || v.type === 'TemplateLiteral')) { if (v.type === 'TemplateLiteral') v.expressions.forEach(x => visit(x, a2)); continue; }
        if (exprOnly && v.type === 'BinaryExpression' && v.operator === '+') { visitChildren(v, a2, true); continue; }
        visit(v, a2);
      }
    }
  }
  visit(ast, []);

  /* イベントの定義（E('id', …) と { id: '…', run/text: … }）。箱庭の出来事の一覧に、ファイルの中の場所を添えるのに使う */
  const events = [];
  /* list … 配列の要素か関数の引数（後ろに「, 新しいイベント」を足せる） */
  (function walkEv(n, par) {
    if (!n || typeof n.type !== 'string') return;
    const list = !!par && (par.type === 'ArrayExpression' || ((par.type === 'CallExpression' || par.type === 'NewExpression') && par.arguments.indexOf(n) >= 0));
    if (n.type === 'CallExpression' && calleeName(n.callee) === 'E' && strLit(n.arguments[0]) && n.arguments.length >= 6) {
      events.push({ id: n.arguments[0].value, s: n.start, e: n.end, line: n.loc.start.line, form: 'E', list, cat: strLit(n.arguments[1]) ? n.arguments[1].value : '', scope: strLit(n.arguments[2]) ? n.arguments[2].value : '' });
    } else if (n.type === 'ObjectExpression' && isEventObject(n)) {
      const cat = n.properties.find(p => p.type === 'Property' && keyName(p) === 'cat' && strLit(p.value));
      const scope = n.properties.find(p => p.type === 'Property' && keyName(p) === 'scope' && strLit(p.value));
      events.push({ id: idOfObject(n), s: n.start, e: n.end, line: n.loc.start.line, form: 'obj', list, cat: cat ? cat.value.value : '', scope: scope ? scope.value.value : '' });
    }
    for (const k in n) {
      if (k === 'loc') continue;
      const v = n[k];
      if (Array.isArray(v)) v.forEach(x => { if (x && typeof x.type === 'string') walkEv(x, n); });
      else if (v && typeof v.type === 'string') walkEv(v, n);
    }
  })(ast, null);

  /* ファイルが触る箱庭 */
  const scen = new Set();
  const re = /SCENARIOS\.(\w+)|SCENARIOS\[['"](\w+)['"]\]|addMini\(\s*['"](\w+)['"]|INCIDENTS\.(\w+)|INCIDENTS\[['"](\w+)['"]\]|scenId\s*[!=]==?\s*['"](\w+)['"]|scen\.id\s*[!=]==?\s*['"](\w+)['"]|\bid:\s*['"](\w+)['"],\s*name:/g;
  let m;
  while ((m = re.exec(src))) { const id = m.slice(1).find(Boolean); if (id) scen.add(id); }
  const base = path.basename(file, '.js');
  for (const id in SCEN_FILE_HINT) if (SCEN_FILE_HINT[id].test(base)) scen.add(id);
  const head = (src.match(/^\s*\/\*([\s\S]*?)\*\//) || [, ''])[1].split('\n')[0].trim();
  return { groups, events, ptables, scen: Array.from(scen), head };
}

/* ---------- ビルド全体 ---------- */
function scanBuild(dir, opt) {
  opt = opt || {};
  dir = path.resolve(dir);
  const order = readOrder(dir);
  const files = [];
  const cache = opt.cache || {};
  order.forEach((o, i) => {
    const full = path.join(dir, o.f);
    if (!fs.existsSync(full)) { files.push({ f: o.f, late: o.late, missing: true, groups: [], events: [], scen: [] }); return; }
    const st = fs.statSync(full);
    const ck = cache[o.f];
    if (ck && ck.mtime === st.mtimeMs && ck.size === st.size) { files.push(Object.assign({}, ck.data, { late: o.late, order: i })); return; }
    const src = fs.readFileSync(full, 'utf8');
    const r = scanSource(src, o.f);
    const data = { f: o.f, late: o.late, order: i, size: st.size, groups: r.groups, events: r.events, ptables: r.ptables || [], scen: r.scen, head: r.head, error: r.error };
    cache[o.f] = { mtime: st.mtimeMs, size: st.size, data };
    files.push(data);
  });
  return { dir, name: path.basename(dir), files, cache };
}

/* 群の総数・文の数 */
function stats(idx) {
  const byFile = idx.files.map(f => ({ f: f.f, groups: f.groups.length, items: f.groups.reduce((s, g) => s + g.items.length, 0), events: f.events.length, scen: f.scen }));
  const byScen = {};
  byFile.forEach(r => { (r.scen.length ? r.scen : ['(共通)']).forEach(id => { const o = byScen[id] = byScen[id] || { files: 0, groups: 0, items: 0, events: 0 }; o.files++; o.groups += r.groups; o.items += r.items; o.events += r.events; }); });
  return { byFile, byScen, total: byFile.reduce((s, r) => ({ groups: s.groups + r.groups, items: s.items + r.items, events: s.events + r.events }), { groups: 0, items: 0, events: 0 }) };
}

module.exports = { scanBuild, scanSource, readOrder, stats, PERSONA_KEYS, SCEN_IDS: Object.keys(SCEN_FILE_HINT), isJa };

if (require.main === module) {
  const [dir, cmd, ...rest] = process.argv.slice(2);
  if (!dir) { console.error('使い方: node scan.js <ビルドのフォルダ> [stats|check|groups] [--json]'); process.exit(1); }
  const idx = scanBuild(dir);
  const json = rest.indexOf('--json') >= 0;
  if (!cmd || cmd === 'stats') {
    const s = stats(idx);
    if (json) { console.log(JSON.stringify(s, null, 1)); return; }
    console.log('文の群', s.total.groups, '文', s.total.items, 'イベントの定義', s.total.events);
    console.log('\n箱庭ごと（ファイル数・群・文・イベントの定義）');
    Object.keys(s.byScen).filter(id => id === '(共通)' || SCEN_FILE_HINT[id]).sort((a, b) => s.byScen[b].items - s.byScen[a].items).forEach(id => { const o = s.byScen[id]; console.log('  ' + id.padEnd(12), String(o.files).padStart(4), String(o.groups).padStart(6), String(o.items).padStart(7), String(o.events).padStart(5)); });
  } else if (cmd === 'groups') {
    idx.files.forEach(f => f.groups.forEach(g => console.log(f.f + ':' + g.line + '\t' + g.kind + '\t' + g.items.length + '\t' + g.path)));
  } else if (cmd === 'check') {
    const { check } = require('./check.js');
    const other = rest.find(x => !/^--/.test(x));
    const res = check(idx, other ? scanBuild(other) : null);
    if (json) { console.log(JSON.stringify(res, null, 1)); return; }
    const by = {};
    res.forEach(r => { (by[r.rule] = by[r.rule] || []).push(r); });
    Object.keys(by).forEach(k => { console.log('\n■ ' + k + '（' + by[k].length + '件）'); by[k].slice(0, 30).forEach(r => console.log('  ' + r.f + ':' + r.line + '  ' + r.msg)); if (by[k].length > 30) console.log('  …ほか ' + (by[k].length - 30) + ' 件'); });
    process.exitCode = res.some(r => r.level === 'error') ? 1 : 0;
  }
}
