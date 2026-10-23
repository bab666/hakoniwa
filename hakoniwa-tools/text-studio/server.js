/* 箱庭テキスト工房：文の一覧・試し読み・その場での書き換え・不整合の点検を、ブラウザの画面で行う
   node hakoniwa-tools/text-studio/server.js [ビルドのフォルダ…] [--port 4580]
   → http://localhost:4580 をブラウザで開く
   ・フォルダを指定しなければ、リポジトリの hakoniwa-full と hakoniwa-zenrei を読む（画面からほかのフォルダも足せる）
   ・書き換えはファイルの該当する文字列だけを置き換える。同じ名前のファイルがもう片方のビルドにあれば、同じ場所も直す
   ・js を書き換えたら、コミットの前に画面の「ビルド」（build.js）を押す。試し読みは個々のファイルを直接読むので、ビルドしなくても反映される
   外部のパッケージは使わない（構文解析の acorn は vendor/ に同梱） */
'use strict';
const http = require('http'), fs = require('fs'), path = require('path'), zlib = require('zlib'), url = require('url');
const { execFile } = require('child_process');
const acorn = require('./vendor/acorn.js');
const { scanBuild, readOrder, SCEN_IDS } = require('./scan.js');
const { check } = require('./check.js');

const ROOT = path.resolve(__dirname, '../..');
const PUB = path.join(__dirname, 'public');
const REQ_FILE = path.join(__dirname, 'ai-requests.md');
const CHANGELOG = path.join(ROOT, 'docs/CHANGELOG.md');

const args = process.argv.slice(2);
let PORT = 4580;
const dirs = [];
for (let i = 0; i < args.length; i++) { if (args[i] === '--port') PORT = +args[++i]; else dirs.push(path.resolve(args[i])); }
if (!dirs.length) ['hakoniwa-full', 'hakoniwa-zenrei'].forEach(d => { const p = path.join(ROOT, d); if (fs.existsSync(path.join(p, 'js/_order.txt'))) dirs.push(p); });

/* ビルドの一覧。id は 0,1,2… */
const builds = [];
function addBuild(dir) {
  dir = path.resolve(dir);
  if (!fs.existsSync(path.join(dir, 'js/_order.txt'))) throw new Error('js/_order.txt のあるフォルダを指定してください: ' + dir);
  let b = builds.find(x => x.dir === dir);
  if (!b) { b = { id: builds.length, dir, name: path.basename(dir), cache: {} }; builds.push(b); }
  return b;
}
dirs.forEach(addBuild);
function idxOf(b) { const r = scanBuild(b.dir, { cache: b.cache }); b.cache = r.cache; return r; }
function infoOf(b) {
  const html = fs.existsSync(path.join(b.dir, 'index.html')) ? fs.readFileSync(path.join(b.dir, 'index.html'), 'utf8') : '';
  return { id: b.id, name: b.name, dir: b.dir, safe: /HK_SAFE_BUILD\s*=\s*1/.test(html) };
}
/* 同じ名前のファイルを持つ、もう片方のビルド */
function partners(b) { return builds.filter(x => x !== b); }

/* ---------- 文字列リテラルを作る（元の引用符にそろえる） ---------- */
function serialize(v, q) {
  if (q === '`') return '`' + v.replace(/\\/g, '\\\\').replace(/`/g, '\\`').replace(/\$\{/g, '\\${') + '`';
  if (q !== '"') q = "'";
  let s = '';
  for (const ch of v) {
    const c = ch.codePointAt(0);
    if (ch === '\\') s += '\\\\';
    else if (ch === q) s += '\\' + q;
    else if (ch === '\n') s += '\\n';
    else if (ch === '\t') s += '\\t';
    else if (ch === '\r') s += '\\r';
    else if (c < 0x20 || (c >= 0x2060 && c <= 0x2064) || c === 0x2028 || c === 0x2029 || c === 0x200b) s += '\\u' + c.toString(16).padStart(4, '0');
    else s += ch;
  }
  return q + s + q;
}
function parseOk(src) {
  try { acorn.parse(src, { ecmaVersion: 2022, sourceType: 'script', allowHashBang: true }); return ''; }
  catch (e) { return e.message; }
}
function occurrences(hay, needle) { const r = []; if (!needle) return r; let i = hay.indexOf(needle); while (i >= 0) { r.push(i); i = hay.indexOf(needle, i + 1); } return r; }

/* 書き換え：{ b, f, s, e, expect, op:'lit'|'raw', value, gs, ge, mirror }
   gs〜ge は文の群の範囲。もう片方のビルドでは、同じ中身の群を探して、群の中の同じ位置を置き換える */
function applyEdit(req) {
  const b = builds[req.b];
  if (!b) throw new Error('ビルドがありません');
  if (!/^js\/[\w.-]+\.js$/.test(req.f) || /^js\/bundle-/.test(req.f)) throw new Error('書き換えられないファイルです: ' + req.f);
  const file = path.join(b.dir, req.f);
  const src = fs.readFileSync(file, 'utf8');
  const s = +req.s, e = +req.e;
  if (src.slice(s, e) !== (req.expect || '')) { const err = new Error('ファイルが先に変わっています。読み直してから、もう一度直してください'); err.code = 409; throw err; }
  const rep = req.op === 'lit' ? serialize(req.value, req.expect ? req.expect[0] : (req.quote || "'")) : String(req.value);
  const out = src.slice(0, s) + rep + src.slice(e);
  const pe = parseOk(out);
  if (pe) throw new Error('書き換えると構文エラーになります: ' + pe);
  fs.writeFileSync(file, out);
  const res = { ok: true, rep, mirror: [] };
  if (req.mirror === false) return res;
  const gs = req.gs != null ? +req.gs : s, ge = req.ge != null ? +req.ge : e;
  const anchor = src.slice(gs, ge);
  const before = occurrences(src.slice(0, gs + 1), anchor).length - 1;
  partners(b).forEach(o => {
    const of = path.join(o.dir, req.f);
    if (!fs.existsSync(of)) return;
    const osrc = fs.readFileSync(of, 'utf8');
    const occ = occurrences(osrc, anchor);
    if (!occ.length) { res.mirror.push({ name: o.name, status: '同じ文が見つからない（手で直してください）' }); return; }
    const at = occ.length === 1 ? occ[0] : occ[Math.min(before, occ.length - 1)];
    const ns = at + (s - gs), ne = at + (e - gs);
    const oout = osrc.slice(0, ns) + rep + osrc.slice(ne);
    const ope = parseOk(oout);
    if (ope) { res.mirror.push({ name: o.name, status: '構文エラーになるので直さなかった' }); return; }
    fs.writeFileSync(of, oout);
    res.mirror.push({ name: o.name, status: occ.length === 1 ? '同じ場所も直した' : '同じ文が' + occ.length + 'か所あり、' + (before + 1) + '番目を直した' });
  });
  return res;
}

/* ---------- 更新履歴 ---------- */
function today() { const d = new Date(Date.now() + 9 * 3600e3); return d.toISOString().slice(0, 10); }
function changelogHeads() {
  if (!fs.existsSync(CHANGELOG)) return { top: '', heads: [] };
  const L = fs.readFileSync(CHANGELOG, 'utf8').split('\n');
  const heads = []; let top = '', inTop = false, sec = '', sub = '';
  for (let i = 0; i < L.length; i++) {
    const l = L[i];
    if (/^## /.test(l)) { if (inTop) break; inTop = true; top = l.slice(3); continue; }
    if (!inTop) continue;
    if (/^### /.test(l)) { sec = l.slice(4); sub = ''; heads.push({ line: i, label: sec }); }
    else if (/^#### /.test(l)) { sub = l.slice(5); heads.push({ line: i, label: sec + ' › ' + sub }); }
    else if (/^##### /.test(l)) heads.push({ line: i, label: sec + ' › ' + sub + ' › ' + l.slice(6) });
  }
  return { top, today: today(), heads };
}
function changelogAdd(req) {
  let L = fs.readFileSync(CHANGELOG, 'utf8').split('\n');
  if (req.newDay) {
    const at = L.findIndex(l => /^## /.test(l));
    const block = ['## ' + today(), '', '### アップデート', '', '#### 【全体】', '', '#### 【箱庭ごと】', '', '### アップデート（R18）', '', '#### 【全体】', '', '#### 【箱庭ごと】', ''];
    L.splice(at < 0 ? L.length : at, 0, ...block);
    fs.writeFileSync(CHANGELOG, L.join('\n'));
    return { ok: true };
  }
  const h = +req.line;
  if (!/^#{3,5} /.test(L[h] || '')) throw new Error('見出しが見つかりません（更新履歴が変わったかもしれません）');
  /* 見出しの下の箇条書きの終わりに足す */
  let i = h + 1;
  while (i < L.length && !/^#{2,5} /.test(L[i])) i++;
  let j = i; while (j > h + 1 && L[j - 1].trim() === '') j--;
  const text = String(req.text || '').trim().replace(/^[・\-\s]+/, '');
  if (!text) throw new Error('書く内容が空です');
  const ins = ['・' + text];
  if (j === h + 1) ins.unshift('');
  L.splice(j, 0, ...ins);
  if (L[j + ins.length] !== undefined && L[j + ins.length].trim() !== '' && /^#/.test(L[j + ins.length])) L.splice(j + ins.length, 0, '');
  fs.writeFileSync(CHANGELOG, L.join('\n'));
  return { ok: true };
}

/* ---------- AIへの依頼（Claude Code などに渡す依頼の控え） ---------- */
function aiAdd(req) {
  const t = new Date(Date.now() + 9 * 3600e3).toISOString().replace('T', ' ').slice(0, 16);   /* 日本時間 */
  let md = '';
  if (!fs.existsSync(REQ_FILE)) md += '# 文の直しの依頼（箱庭テキスト工房から）\n\nClaude Code に「hakoniwa-tools/text-studio/ai-requests.md の未完了の依頼を片付けて」と頼むと、上から順に直します。終わったら [x] にします。\n\n';
  md += '- [ ] ' + t + '　' + (req.kind || '直し') + '：' + String(req.note || '').replace(/\n/g, ' ') + '\n';
  (req.targets || []).forEach(x => { md += '  - `' + x.build + '/' + x.f + ':' + x.line + '` `' + x.path + '`' + (x.text ? '\n    > ' + String(x.text).replace(/\n/g, '\n    > ') : '') + '\n'; });
  fs.appendFileSync(REQ_FILE, md);
  return { ok: true, file: path.relative(ROOT, REQ_FILE) };
}

/* ---------- 試し読み用のページ：index.html の読み込み部分を、個々のファイルの読み込みに差し替える ---------- */
function sandboxHtml(b) {
  const html = fs.readFileSync(path.join(b.dir, 'index.html'), 'utf8');
  const order = readOrder(b.dir);
  const tag = f => '<script src="' + f + '?t=' + Date.now() + '"></script>';
  const block = order.filter(o => !o.late).map(o => tag(o.f)).join('\n') + '\n<script>window.HK && (window.HK.LATE_READY = false);</script>\n' +
    order.filter(o => o.late).map(o => tag(o.f)).join('\n') +
    '\n<script>(function(){var HK=window.HK;HK.LATE_READY=true;if(HK.onLate)HK.onLate();})();</script>\n<script src="/studio/sandbox.js?t=' + Date.now() + '"></script>';
  const re = /<!-- scripts:begin[\s\S]*?<!-- scripts:end -->/;
  if (!re.test(html)) return html.replace('</body>', block + '</body>');
  return html.replace(re, () => block);
}

/* ---------- HTTP ---------- */
const MIME = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.json': 'application/json; charset=utf-8', '.png': 'image/png', '.svg': 'image/svg+xml', '.ico': 'image/x-icon', '.webp': 'image/webp', '.jpg': 'image/jpeg', '.woff2': 'font/woff2' };
function send(req, res, code, body, type) {
  const buf = Buffer.isBuffer(body) ? body : Buffer.from(typeof body === 'string' ? body : JSON.stringify(body));
  const h = { 'Content-Type': type || 'application/json; charset=utf-8', 'Cache-Control': 'no-store' };
  if (buf.length > 4096 && /gzip/.test(req.headers['accept-encoding'] || '')) { h['Content-Encoding'] = 'gzip'; res.writeHead(code, h); res.end(zlib.gzipSync(buf)); return; }
  res.writeHead(code, h); res.end(buf);
}
function sendFile(req, res, file) {
  if (!fs.existsSync(file) || !fs.statSync(file).isFile()) return send(req, res, 404, { error: 'not found' });
  send(req, res, 200, fs.readFileSync(file), MIME[path.extname(file)] || 'application/octet-stream');
}
function body(req) { return new Promise((ok, ng) => { let s = ''; req.on('data', d => { s += d; if (s.length > 20e6) ng(new Error('大きすぎます')); }); req.on('end', () => { try { ok(s ? JSON.parse(s) : {}); } catch (e) { ng(e); } }); }); }
function safeJoin(base, rel) { const p = path.resolve(base, '.' + path.sep + rel); if (p !== base && !p.startsWith(base + path.sep)) throw new Error('bad path'); return p; }

const server = http.createServer(async (req, res) => {
  const u = url.parse(req.url, true), p = decodeURIComponent(u.pathname);
  /* よそのサイトから書き換えられないように、ローカルからの要求だけを受ける */
  const host = (req.headers.host || '').replace(/:\d+$/, '');
  if (!/^(localhost|127\.0\.0\.1|\[::1\])$/.test(host)) return send(req, res, 403, { error: 'localhost からだけ使えます' });
  if (req.method === 'POST' && req.headers.origin && !/^https?:\/\/(localhost|127\.0\.0\.1|\[::1\])(:\d+)?$/.test(req.headers.origin)) return send(req, res, 403, { error: 'origin' });
  try {
    if (p === '/' || p === '/index.html') return sendFile(req, res, path.join(PUB, 'index.html'));
    if (p.startsWith('/studio/')) return sendFile(req, res, safeJoin(PUB, p.slice(8)));
    let m = p.match(/^\/sb\/(\d+)\/(.*)$/);
    if (m) {
      const b = builds[+m[1]];
      if (!b) return send(req, res, 404, { error: 'no build' });
      if (m[2] === '' || m[2] === 'index.html') return send(req, res, 200, sandboxHtml(b), MIME['.html']);
      return sendFile(req, res, safeJoin(b.dir, m[2]));
    }
    if (p === '/api/builds') return send(req, res, 200, { builds: builds.map(infoOf), scenIds: SCEN_IDS, root: ROOT });
    if (p === '/api/open' && req.method === 'POST') { const q = await body(req); const b = addBuild(q.dir); return send(req, res, 200, infoOf(b)); }
    if (p === '/api/index') {
      const b = builds[+u.query.b]; if (!b) return send(req, res, 404, { error: 'no build' });
      const idx = idxOf(b), ps = partners(b);
      /* only … もう片方のビルドにないファイル（R18専用など） */
      const files = idx.files.filter(f => !u.query.f || f.f === u.query.f)
        .map(f => ({ f: f.f, late: f.late, head: f.head, scen: f.scen, error: f.error, events: f.events, groups: f.groups, only: ps.length > 0 && !ps.some(o => fs.existsSync(path.join(o.dir, f.f))) }));
      return send(req, res, 200, { name: b.name, files });
    }
    if (p === '/api/check') {
      const b = builds[+u.query.b]; if (!b) return send(req, res, 404, { error: 'no build' });
      const o = partners(b)[0];
      return send(req, res, 200, { items: check(idxOf(b), o ? idxOf(o) : null), other: o ? o.name : '' });
    }
    if (p === '/api/source') {
      const b = builds[+u.query.b]; if (!b) return send(req, res, 404, { error: 'no build' });
      return send(req, res, 200, fs.readFileSync(safeJoin(b.dir, u.query.f), 'utf8'), 'text/plain; charset=utf-8');
    }
    if (p === '/api/edit' && req.method === 'POST') { const q = await body(req); return send(req, res, 200, applyEdit(q)); }
    if (p === '/api/build' && req.method === 'POST') {
      const tool = path.join(ROOT, 'hakoniwa-tools/build/build.js');
      const out = [];
      for (const b of builds) {
        if (!fs.existsSync(path.join(b.dir, 'index.html'))) continue;
        out.push(await new Promise(ok => execFile(process.execPath, [tool, b.dir], { cwd: ROOT }, (err, so, se) => ok({ name: b.name, ok: !err, out: (so + se).trim() }))));
      }
      return send(req, res, 200, { results: out });
    }
    if (p === '/api/changelog') {
      if (req.method === 'POST') return send(req, res, 200, changelogAdd(await body(req)));
      return send(req, res, 200, changelogHeads());
    }
    if (p === '/api/ai') {
      if (req.method === 'POST') return send(req, res, 200, aiAdd(await body(req)));
      return send(req, res, 200, fs.existsSync(REQ_FILE) ? fs.readFileSync(REQ_FILE, 'utf8') : '', 'text/plain; charset=utf-8');
    }
    send(req, res, 404, { error: 'not found' });
  } catch (e) {
    send(req, res, e.code === 409 ? 409 : 400, { error: e.message });
  }
});
server.listen(PORT, '127.0.0.1', () => {
  console.log('箱庭テキスト工房： http://localhost:' + PORT + '/');
  builds.forEach(b => console.log('  [' + b.id + '] ' + b.dir));
});
