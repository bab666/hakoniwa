/* 変更に応じて要る点検だけを回す入口（2026-11-04。設計・依存の表・所要時間は docs/reports/2026-11-04/check-pipeline.md）
   使い方:
     node hakoniwa-tools/check.js                      # まだコミットしていない変更（HEAD との差・未追跡のファイル）から決めて回す
     node hakoniwa-tools/check.js --since=main         # main からの変更（コミット済みも含む。取り込みのあとは --since=<取り込む前のコミット>）
     node hakoniwa-tools/check.js --staged             # git add した分だけ
     node hakoniwa-tools/check.js --all                # 全部（今までの「全部回す」。全箱庭・追加の配役パス全部・全パック）
     node hakoniwa-tools/check.js --pack=set-b         # パックの点検も回す（変えていなくても。全部の部屋）
     node hakoniwa-tools/check.js --dry                # 何を回すか（と飛ばす理由・キャッシュ）だけ出す
   ほかの指定：--files=a,b（git の差の代わりに、このファイルを変えたものとして決める。表の確かめ用）、--force（キャッシュを使わず回し直す）、
              --jobs=N（同時に使うページの数。既定は CPU の数。audit-all は 1 本で 2 ページ使う）、--keep-going（前置きの点検が落ちても続ける）、
              --cache=フォルダ（既定は主の作業フォルダの hakoniwa-tools/.check-cache。環境変数 HK_CHECK_CACHE でも）、--table（依存の表を md で出す）
   ・変わったファイル → 依存の表（check/table.js）の印 → 回す点検、の順に決める。js のコメントだけの変更は何も回さない（@event・r18 の印を変えたときは別）。
   ・箱庭のかたまり（_order.txt の @scen:・@pack:）のファイルだけを変えたときは、目録（HK_MANIFEST）の依存から、そのかたまりを読む箱庭だけで回す。
   ・点検ごとに「入力のハッシュ（読むかたまり・ファイル ＋ 道具 ＋ 引数）」と結果をキャッシュに残し、同じ入力なら回さずに前回の結果を出す。
   ・終了コード：回した（キャッシュの）点検がすべて合格なら 0、ほかは 1。 */
'use strict';
const fs = require('fs'), path = require('path'), cp = require('child_process'), crypto = require('crypto'), os = require('os'), vm = require('vm');
const T = require('./check/table.js');
const ROOT = path.resolve(__dirname, '..');
const BUILDS = { full: 'hakoniwa-full', zen: 'hakoniwa-zenrei' };

/* ---------- 引数 ---------- */
const argv = process.argv.slice(2);
const opt = (k, d) => { const a = argv.find(x => x.indexOf('--' + k + '=') === 0); return a ? a.slice(k.length + 3) : d; };
const has = k => argv.includes('--' + k);
const O = {
  since: opt('since', ''), staged: has('staged'), all: has('all'), dry: has('dry'), force: has('force'), keep: has('keep-going'),
  files: opt('files', ''), packs: opt('pack', '').split(',').filter(Boolean), jobs: Math.max(1, +opt('jobs', os.cpus().length) || 2), table: has('table'), verbose: has('v')
};

/* ---------- git ---------- */
const git = (args, o) => cp.execFileSync('git', args, Object.assign({ cwd: ROOT, encoding: 'utf8', maxBuffer: 1 << 28, stdio: ['ignore', 'pipe', 'ignore'] }, o || {}));
const gitOk = args => { try { return git(args); } catch (e) { return null; } };
const BASE = O.since || 'HEAD';
const BASE_SHA = (gitOk(['rev-parse', BASE]) || '').trim();
const HEAD_SHA = (gitOk(['rev-parse', 'HEAD']) || '').trim();
function cacheRoot() {
  const c = opt('cache', process.env.HK_CHECK_CACHE || '');
  if (c) return path.resolve(c);
  /* 主の作業フォルダ（git worktree の元）のキャッシュを、どの作業フォルダからも使う（取り込みのあとに、担当が回した結果をそのまま使えるように） */
  const common = (gitOk(['rev-parse', '--path-format=absolute', '--git-common-dir']) || '').trim();
  const main = common && path.basename(common) === '.git' ? path.dirname(common) : ROOT;
  return path.join(fs.existsSync(path.join(main, 'hakoniwa-tools')) ? main : ROOT, 'hakoniwa-tools/.check-cache');
}
const CACHE = cacheRoot();
const mkdir = d => { fs.mkdirSync(d, { recursive: true }); return d; };
const sha = s => crypto.createHash('sha1').update(s).digest('hex');
const readOr = (f, d) => { try { return fs.readFileSync(f); } catch (e) { return d; } };
const baseText = p => { if (!BASE_SHA) return null; try { return git(['show', BASE_SHA + ':' + p]); } catch (e) { return null; } };

/* 変わったファイル：[{ p, st: 'A'|'M'|'D' }] */
function changedFiles() {
  if (O.files) return O.files.split(',').filter(Boolean).map(p => ({ p: p.replace(/^\.\//, ''), st: fs.existsSync(path.join(ROOT, p)) ? (baseText(p) == null ? 'A' : 'M') : 'D' }));
  const out = [];
  const add = txt => txt.split('\n').filter(Boolean).forEach(l => { const m = l.split('\t'); const st = m[0][0]; const p = m[m.length - 1]; if (st === 'R') out.push({ p: m[1], st: 'D' }); out.push({ p, st: st === 'R' || st === 'C' ? 'A' : st }); });
  if (O.staged) add(git(['diff', '--cached', '--name-status', '-M']));
  else {
    add(git(['diff', '--name-status', '-M', BASE_SHA]));
    git(['ls-files', '--others', '--exclude-standard']).split('\n').filter(Boolean).forEach(p => out.push({ p, st: 'A' }));
  }
  const seen = {}; return out.filter(f => !seen[f.p] && (seen[f.p] = 1));
}
const cur = (f) => O.staged ? gitOk(['show', ':' + f.p]) : (f.st === 'D' ? null : String(readOr(path.join(ROOT, f.p), '')));

/* ---------- 字句（コメントだけの変更か） ---------- */
let ACORN = null;
try { ACORN = require('./build/build-min.js').loadAcorn(); } catch (e) { /* 無ければコメントの判定をしない */ }
function lex(src) {
  if (!ACORN || src == null) return null;
  const comments = [], toks = [];
  try {
    for (const t of ACORN.tokenizer(src, { ecmaVersion: 'latest', allowHashBang: true, onComment: (block, text) => comments.push(text) })) toks.push(t.type.label + '\u0001' + (t.value === undefined ? '' : String(t.value)));
  } catch (e) { return null; }
  return { toks: toks.join('\u0002'), comments };
}
/* 行の差（足した行・消した行。並びは見ない） */
function lineDiff(a, b) {
  const cnt = {}; (a || '').split('\n').forEach(l => { cnt[l] = (cnt[l] || 0) + 1; });
  const added = [];
  (b || '').split('\n').forEach(l => { if (cnt[l] > 0) cnt[l]--; else added.push(l); });
  const removed = []; Object.keys(cnt).forEach(l => { for (let i = 0; i < cnt[l]; i++) removed.push(l); });
  return added.concat(removed).filter(l => l.trim());
}

/* ---------- 読み込み順（_order.txt）と目録 ---------- */
const ORDER = {}, MAN = {};
function order(b) {
  if (ORDER[b]) return ORDER[b];
  const m = {};
  String(readOr(path.join(ROOT, BUILDS[b], 'js/_order.txt'), '')).split('\n').forEach(l => {
    l = l.replace(/#.*/, '').trim(); if (!l || l[0] === '@') return;
    const w = l.split(/\s+/); let kind = 'core';
    if (w[0] === 'late' || w[0] === 'tone') kind = w.shift();
    const file = path.basename(w[0]);
    const ann = w.slice(1).find(x => /^@(?:pack|scen):/.test(x));
    m[file] = ann ? (ann.startsWith('@scen:') ? 'scen-' + ann.slice(6) : 'pack-' + ann.slice(6)) : kind;
  });
  return (ORDER[b] = m);
}
function manifest(b) {
  if (MAN[b]) return MAN[b];
  const html = String(readOr(path.join(ROOT, BUILDS[b], 'index.html'), ''));
  const m = html.match(/window\.HK_MANIFEST\s*=\s*(\{[\s\S]*?\})\s*;?\s*<\/script>/);
  return (MAN[b] = m ? JSON.parse(m[1]) : null);
}
function closure(man, names) {
  const out = [], seen = {};
  const go = n => { if (seen[n]) return; seen[n] = 1; const c = man.chunks[n]; if (c) (c.deps || []).forEach(go); out.push(n); };
  names.forEach(go); return out;
}
/* かたまり → それを読む箱庭（'all' は全部） */
function scenOfChunk(b, chunk) {
  if (/^(?:core|late|tone|pack-lewd)$/.test(chunk)) return 'all';
  const man = manifest(b);
  if (!man) return 'all';
  if (man.chunks.late && closure(man, ['late']).indexOf(chunk) >= 0) return 'all';
  if (chunk === 'pack-catalog') return [];
  const ids = Object.keys(man.scen || {}).filter(id => closure(man, man.scen[id].chunks || []).indexOf(chunk) >= 0);
  if (/^scen-/.test(chunk) && !ids.length) ids.push(chunk.slice(5));   /* まだ目録に無い新しい箱庭 */
  return ids;
}

/* ---------- パック ---------- */
const PACKS = {};
function pack(id) {
  if (PACKS[id] !== undefined) return PACKS[id];
  const dir = path.join(ROOT, 'hakoniwa-packs', id);
  let P = null;
  try { P = JSON.parse(fs.readFileSync(path.join(dir, 'pack.json'), 'utf8')); } catch (e) { return (PACKS[id] = null); }
  const chunks = {};
  (P.chunks || []).forEach(c => {
    const deps = Array.isArray(c.deps) ? { full: c.deps, zenrei: c.deps } : (c.deps || {});
    chunks[c.name] = { files: (c.files || []).map(f => path.basename(f)), deps: deps.full || deps.zenrei || [], depsZen: deps.zenrei || deps.full || [] };
  });
  /* 部屋：パックの js に書かれた HK.SCENARIOS['<パック>-xxx'] の id。かたまりの名前が xxx のものがその部屋の本体 */
  const src = fs.readdirSync(path.join(dir, 'js')).filter(f => f.endsWith('.js')).map(f => String(readOr(path.join(dir, 'js', f), ''))).join('\n');
  const rooms = Object.keys(chunks).filter(n => src.indexOf("'" + P.id + '-' + n + "'") >= 0 || src.indexOf('"' + P.id + '-' + n + '"') >= 0).map(n => P.id + '-' + n);
  const roomChunk = {}; rooms.forEach(r => { roomChunk[r] = r.slice(P.id.length + 1); });
  const pclos = n => { const out = [], seen = {}; const go = x => { if (seen[x] || !chunks[x]) return; seen[x] = 1; chunks[x].deps.forEach(go); out.push(x); }; go(n); return out; };
  const mainDeps = [...new Set([].concat(...Object.keys(chunks).map(n => chunks[n].deps.concat(chunks[n].depsZen).filter(d => !chunks[d]))))];
  return (PACKS[id] = { id: P.id, dir, P, chunks, rooms, roomChunk, pclos, mainDeps });
}
function packIds() { try { return fs.readdirSync(path.join(ROOT, 'hakoniwa-packs')).filter(d => !/^[_.]/.test(d) && fs.existsSync(path.join(ROOT, 'hakoniwa-packs', d, 'pack.json'))); } catch (e) { return []; } }
/* パックのファイル → 部屋（'all' はそのパックの全部屋） */
function roomsOfPackFile(pk, base) {
  const cs = Object.keys(pk.chunks).filter(n => pk.chunks[n].files.indexOf(base) >= 0);
  if (!cs.length) return 'all';
  const rs = pk.rooms.filter(r => pk.roomChunk[r] && cs.some(c => pk.pclos(pk.roomChunk[r]).indexOf(c) >= 0));
  return rs.length ? rs : 'all';
}
function packCodes() {
  const f = [path.join(ROOT, 'hakoniwa-packs/codes.local.json'), path.join(ROOT, 'hakoniwa-packs/codes.example.json')].find(x => fs.existsSync(x));
  return f ? { file: f, J: JSON.parse(fs.readFileSync(f, 'utf8')) } : null;
}

/* ---------- 道具のファイル（require をたどる） ---------- */
const TOOLDEP = {};
function toolFiles(rel) {
  if (TOOLDEP[rel]) return TOOLDEP[rel];
  const out = new Set(), go = r => {
    if (out.has(r)) return; const abs = path.join(ROOT, r); if (!fs.existsSync(abs)) return; out.add(r);
    const src = String(readOr(abs, ''));
    (src.match(/require\((['"])\.{1,2}\/[^'"]+\1\)/g) || []).forEach(m => { let q = m.slice(9, -2); if (!/\.js$/.test(q)) q += '.js'; go(path.relative(ROOT, path.resolve(path.dirname(abs), q))); });
    /* tone-feel の feel/*.js（配列で require している） */
    if (/require\('\.\/feel\/' \+/.test(src)) fs.readdirSync(path.join(path.dirname(abs), 'feel')).forEach(f => go(path.relative(ROOT, path.join(path.dirname(abs), 'feel', f))));
  };
  go(rel); return (TOOLDEP[rel] = [...out].sort());
}
const CHECK = {}; T.CHECKS.forEach(c => { CHECK[c.id] = c; });
const toolsOf = id => [...new Set([].concat(...(CHECK[id].tools || []).map(toolFiles)))].sort();
const hashFiles = list => sha(list.map(f => f + '\u0000' + sha(readOr(path.join(ROOT, f), Buffer.from('（無い）')))).join('\n'));

/* ---------- 変更の分類 ---------- */
function classify(files) {
  const R = { files: [], gen: [], tags: {}, mainScen: { full: null, zen: null }, feelScen: new Set(), builds: new Set(), packs: {}, tools: new Set(), jsFiles: [] };
  const tag = (t, f) => { f.tags.add(t); };
  files.forEach(f0 => {
    const f = Object.assign({ tags: new Set(), why: [] }, f0), p = f.p, b = path.basename(p);
    const isMain = T.MAINJS.test(p), isPack = T.PACKJS.test(p), isJs = /\.js$/.test(p);
    const bk = /^hakoniwa-full\//.test(p) ? 'full' : /^hakoniwa-zenrei\//.test(p) ? 'zen' : '';
    let hit = false, ui = false, toneOnly = false, sim = false, gen = false, packAll = false, toolHit = false;
    for (const r of T.FILE_RULES) {
      const ok = r.re ? r.re.test(p) : (r.b && (isMain || isPack) && r.b.test(b));
      if (!ok) continue;
      if (r.gen) gen = true;
      if (r.ui) ui = true;
      if (r.toneOnly) toneOnly = true;
      if (r.packAll) packAll = true;
      if (r.tool) toolHit = true;
      r.tags.forEach(t => { if (t === 'sim') sim = true; tag(t, f); });
      hit = true;
      if (r.stop) break;
    }
    if (gen) { R.gen.push(p); return; }
    /* 中身：コメントだけの変更か・変わった行 */
    const oldS = f.st === 'A' ? null : baseText(p), newS = cur(f);
    if ((isMain || isPack) && isJs && oldS != null && newS != null) {
      const a = lex(oldS), c = lex(newS);
      if (a && c && a.toks === c.toks) {
        f.commentOnly = true;
        /* コメントだけ：@event・r18 の印に触れたときだけ印を付ける（ほかの印は外す） */
        f.tags = new Set();
        const lines = lineDiff(a.comments.join('\n'), c.comments.join('\n'));
        T.COMMENT_RULES.forEach(r => { if (lines.some(l => r.re.test(l))) r.tags.forEach(t => tag(t, f)); });
        if (!f.tags.size) tag('doc', f);
        sim = false; ui = true;
      }
    }
    if (/_order\.txt$/.test(p) && oldS != null && newS != null) {
      const strip = s => s.split('\n').map(l => l.replace(/#.*/, '').trim()).filter(Boolean);
      const a = strip(oldS), c = strip(newS);
      if (a.join('\n') === c.join('\n')) { f.tags = new Set(); tag('doc', f); f.commentOnly = true; }
      /* 行を足しただけ（新しいファイルを並びに入れた・消した行が無い）なら、既にあるファイルの読み込み順・振り分けは変わらない：order を付けない */
      else if (a.every(l => c.indexOf(l) >= 0) && a.filter(l => !/^@/.test(l)).join('\n') === c.filter(l => a.indexOf(l) >= 0 && !/^@/.test(l)).join('\n')) { f.tags.delete('order'); f.why.push('行を足しただけ'); }
    }
    /* index.html：scripts:begin〜end（build が書く目録）の中だけの変更は作り直されたもの */
    if (/\/index\.html$/.test(p) && oldS != null && newS != null) {
      const cut = s => s.replace(/<!-- scripts:begin[\s\S]*<!-- scripts:end -->/, '');
      if (cut(oldS) === cut(newS)) { R.gen.push(p); return; }
    }
    if ((isMain || isPack) && !f.commentOnly) {
      const lines = isJs ? lineDiff(oldS, newS) : [];
      T.LINE_RULES.forEach(r => { if (r.notUi && ui) return; if (r.toneR18 && !(/-r18\.js$/.test(b) && toneOnly)) return; if (lines.some(l => r.re.test(l))) r.tags.forEach(t => tag(t, f)); });
      T.COMMENT_RULES.forEach(r => { if (lines.some(l => r.re.test(l))) r.tags.forEach(t => tag(t, f)); });
      if (lines.some(l => T.EVENT_LINE.test(l))) tag('event', f);
      if (f.st === 'A' || f.st === 'D') tag('event', f);   /* ファイルを足した・消した：一覧が変わりうる */
      /* 名前で決まらなかった js は、結果が変わりうるものとして扱う */
      if (!ui && !toneOnly && !sim) { tag('sim', f); sim = true; }
      /* 内容の印が付いたら sim も（喘ぎ・長い場面などは結果に出る） */
      if (!ui && ['moan', 'thick', 'trio', 'force', 'sexgate', 'feud', 'group', 'death', 'rel'].some(t => f.tags.has(t)) && !f.tags.has('sim') && !toneOnly) tag('sim', f);
    }
    if (isJs && (isMain || isPack || /^hakoniwa-tools\//.test(p)) && f.st !== 'D' && !(f.commentOnly && f.tags.has('doc'))) R.jsFiles.push(f);
    /* 本体のかたまり → 箱庭 */
    if (isMain && !(f.commentOnly && f.tags.has('doc'))) {
      const chunk = order(bk)[b] || (f.st === 'D' ? 'core' : 'core');
      f.chunk = chunk;
      const sc = scenOfChunk(bk, chunk);
      if ([...f.tags].some(t => t !== 'doc' && t !== 'event' && t !== 'serifu' && t !== 'tone' && t !== 'dict' && t !== 'js')) {
        R.mainScen[bk] = R.mainScen[bk] === 'all' || sc === 'all' ? 'all' : [...new Set((R.mainScen[bk] || []).concat(sc))];
      }
      if (f.tags.has('serifu')) { if (/^scen-/.test(chunk)) R.feelScen.add(chunk.slice(5)); else T.FEEL_DEF.forEach(x => R.feelScen.add(x)); }
      f.scen = sc;
      /* パックが頼る本体のかたまり（pack-roomkit・pack-lewd など。core・late は数えない） */
      if (!f.commentOnly) packIds().forEach(id => { const pk = pack(id); if (pk && pk.mainDeps.some(d => d === chunk)) { const X = R.packs[id] = R.packs[id] || { rooms: new Set(), tags: new Set(), why: [] }; pk.rooms.forEach(r => X.rooms.add(r)); X.tags.add('sim'); X.why.push(b + '（' + chunk + '）'); } });
    }
    if (bk && f.tags.size && !f.tags.has('doc')) R.builds.add(bk);
    if (f.tags.has('buildtool') || (f.tags.has('event') && !bk && !isPack)) { R.builds.add('full'); R.builds.add('zen'); }
    /* パックのファイル */
    const pm = p.match(/^hakoniwa-packs\/([^/_][^/]*)\//);
    if (pm && (isPack || packAll)) {
      const pk = pack(pm[1]);
      if (pk && !f.tags.has('doc')) {
        const X = R.packs[pk.id] = R.packs[pk.id] || { rooms: new Set(), tags: new Set(), why: [] };
        const rs = packAll ? 'all' : roomsOfPackFile(pk, b);
        (rs === 'all' ? pk.rooms : rs).forEach(r => X.rooms.add(r));
        f.tags.forEach(t => X.tags.add(t)); X.why.push(b);
        f.rooms = rs;
      }
    }
    /* 点検の道具 */
    if (toolHit) T.CHECKS.forEach(c => { if (toolsOf(c.id).indexOf(p) >= 0) { R.tools.add(c.id); f.tags.add('tool:' + c.id); } });
    if (!hit && !f.tags.size) tag('doc', f);
    /* 本体の印（パックのファイルの印はパックの点検だけに使う） */
    if (!pm) f.tags.forEach(t => { if (!/^tool:/.test(t)) (R.tags[t] = R.tags[t] || []).push(p); });
    R.files.push(f);
  });
  return R;
}

/* ---------- 要る点検を決める ---------- */
const scenStr = s => s === 'all' ? '全箱庭' : s.join(',');
function decide(R) {
  const tasks = [], skipped = [];
  const on = t => O.all || !!R.tags[t];
  const anyOn = ts => ts.some(on);
  const toolOn = id => R.tools.has(id);
  const why = ts => ts.filter(t => R.tags[t]).map(t => t + '（' + R.tags[t].slice(0, 3).map(x => path.basename(x)).join('・') + (R.tags[t].length > 3 ? ' ほか' : '') + '）').join('・');
  const add = (t) => { tasks.push(t); return t; };
  const skip = (id, r) => skipped.push({ id, name: CHECK[id] ? CHECK[id].name : id, why: r });
  const jsOn = O.all || R.jsFiles.length > 0;
  /* 前置き */
  ['syntax', 'r18mark', 'lines', 'twin'].forEach(id => {
    if (O.all && id === 'twin' && !R.jsFiles.length) return skip(id, '--all（比べる変更が無い）');
    if (jsOn) add({ id, stage: 'pre', label: CHECK[id].name, why: O.all ? '--all' : 'js を変えた', weight: 0 });
    else skip(id, 'js を変えていない');
  });
  if (anyOn(['serifu', 'tone']) || toolOn('base-lint')) add({ id: 'base-lint', stage: 'pre', label: CHECK['base-lint'].name + '：本体', why: O.all ? '--all' : why(['serifu', 'tone']) || '道具を変えた', dir: BUILDS.full, weight: 0 });
  else skip('base-lint', '台詞・口調を変えていない');
  /* パック */
  const packWant = {};
  Object.keys(R.packs).forEach(id => { packWant[id] = R.packs[id]; });
  (O.all ? packIds() : O.packs).forEach(id => { const pk = pack(id); if (!pk) return; const X = packWant[id] = packWant[id] || { rooms: new Set(), tags: new Set(), why: [] }; pk.rooms.forEach(r => X.rooms.add(r)); X.tags.add('all'); X.why.push(O.all ? '--all' : '--pack'); });
  Object.keys(packWant).forEach(id => { const X = packWant[id]; if (X.tags.has('serifu') || X.tags.has('tone') || X.tags.has('all')) add({ id: 'base-lint', stage: 'pre', label: CHECK['base-lint'].name + '：' + id, why: X.why.slice(0, 3).join('・'), dir: path.join('hakoniwa-packs', id), weight: 0 }); });
  /* build */
  const builds = O.all ? ['full', 'zen'] : [...R.builds];
  const B = [...new Set(builds)];
  B.forEach(b => add({ id: 'build', stage: 'build', key: 'build:' + b, label: 'build：' + BUILDS[b], b, why: O.all ? '--all' : 'このビルドのファイルを変えた', weight: 1 }));
  if (!B.length) skip('build', 'ビルドのファイルを変えていない');
  /* 一覧 */
  Object.keys(packWant).forEach(id => add({ id: 'pack-catalog', stage: 'build', key: 'pack-catalog:' + id, label: CHECK['pack-catalog'].name + '：' + id, pack: id, why: 'パック', weight: 1 }));
  if (jsOn || Object.keys(packWant).length || toolOn('catalog')) add({ id: 'catalog', stage: 'post', label: CHECK.catalog.name, why: O.all ? '--all' : on('event') ? why(['event']) : 'js を変えた（軽いので毎回）', weight: 0 });
  else skip('catalog', 'js を変えていない');
  /* 本体の重い点検 */
  const scenAll = () => {
    if (O.all) return 'all';
    const a = R.mainScen.full, z = R.mainScen.zen;
    if (a === 'all' || z === 'all') return 'all';
    const s = [...new Set((a || []).concat(z || []))];
    return s.length ? s : 'all';
  };
  const AA = CHECK['audit-all'];
  const aaOn = O.all || AA.tags.some(t => R.tags[t]) || toolOn('audit-all');
  let folded = {};
  if (aaOn) {
    const scope = toolOn('audit-all') ? 'all' : scenAll();
    const extra = new Set();
    Object.keys(T.EXTRA_OF).forEach(t => { if (on(t)) extra.add(T.EXTRA_OF[t]); });
    if (O.all) ['sexgate', 'feud', 'group', 'state-hot', 'name', 'relcons', 'pair'].forEach(x => extra.add(x));
    /* 全箱庭で回すときは、長い場面・三人の場面も同じページで回す（単独の道具と同じ関数。ページを開き直さない） */
    if (scope === 'all' && (on('thick') || toolOn('sex-flow'))) { extra.add('sexflow'); folded['sex-flow'] = 1; }
    if (scope === 'all' && (on('trio') || toolOn('trio-shape'))) { extra.add('trio'); folded['trio-shape'] = 1; }
    /* 既定の一式が要るか（追加の配役パスだけで足りるのは、名前・言い換えの印だけのとき） */
    const needDef = O.all || toolOn('audit-all') || ['sim', 'ui', 'zen', 'moan', 'thick', 'trio', 'force', 'sexgate', 'feud', 'group', 'death', 'rel'].some(t => R.tags[t]);
    const onlyZen = !O.all && R.tags.zen && !['sim', 'ui'].some(t => R.tags[t]);
    if (needDef || extra.size) add({ id: 'audit-all', stage: 'heavy', label: AA.name + (extra.size ? ' ＋ ' + [...extra].join(',') : '') + (scope === 'all' ? '' : '（' + scenStr(scope) + '）'),
      why: O.all ? '--all' : why(AA.tags) || '道具を変えた', scope, extra: [...extra], onlyExtra: !needDef, modes: onlyZen ? ['zen'] : ['r18', 'safe', 'zen'], weight: Math.min(2, O.jobs), est: AA.est * (scope === 'all' ? 1 : 0.15) + (extra.size ? 60 : 0) });
  } else skip('audit-all', 'シミュレーションの結果に触れる js を変えていない');
  const sScope = scenAll();
  const feelS = O.all ? T.FEEL_DEF : [...R.feelScen];
  if (anyOn(['serifu', 'tone']) || toolOn('tone-feel')) add({ id: 'tone-feel', stage: 'heavy', label: CHECK['tone-feel'].name + '（' + (feelS.length ? feelS.join(',') : T.FEEL_DEF.join(',')) + '）', why: O.all ? '--all' : why(['serifu', 'tone']) || '道具を変えた', scen: feelS.length ? feelS : T.FEEL_DEF, weight: 1, est: 40 * Math.max(1, feelS.length) });
  else skip('tone-feel', '台詞・口調を変えていない');
  if (on('moan') || toolOn('moan-tone')) add({ id: 'moan-tone', stage: 'heavy', label: CHECK['moan-tone'].name + (sScope === 'all' ? '' : '（' + scenStr(sScope) + '）'), why: O.all ? '--all' : why(['moan']) || '道具を変えた', scope: sScope, weight: 1, est: sScope === 'all' ? 540 : 120 });
  else skip('moan-tone', '喘ぎを変えていない');
  [['sex-flow', 'thick', 'sexflow'], ['trio-shape', 'trio', 'trio']].forEach(([id, t, ex]) => {
    if (folded[id]) return skip(id, 'audit-all の --extra=' + ex + ' で回す（同じ関数）');
    if (on(t) || toolOn(id)) add({ id, stage: 'heavy', label: CHECK[id].name + (sScope === 'all' ? '' : '（' + scenStr(sScope) + '）'), why: O.all ? '--all' : why([t]) || '道具を変えた', scope: sScope, weight: 1 });
    else skip(id, t === 'thick' ? '長い場面の部品を変えていない' : '三人の場面の部品を変えていない');
  });
  if (on('force') || toolOn('force-repeat')) add({ id: 'force-repeat', stage: 'heavy', label: CHECK['force-repeat'].name, why: O.all ? '--all' : why(['force']) || '道具を変えた', weight: 1 });
  else skip('force-repeat', '無理やりの部品を変えていない');
  if (anyOn(['ui', 'order', 'buildtool']) || toolOn('regress')) ['r18', 'safe', 'zen'].forEach(m => add({ id: 'regress', stage: 'heavy', key: 'regress:' + m, label: CHECK.regress.name + '：' + ({ r18: 'R18版', safe: '全年齢モード', zen: '全年齢版' })[m], mode: m, why: O.all ? '--all' : why(['ui', 'order', 'buildtool']) || '道具を変えた', weight: 1 }));
  else skip('regress', '画面・読み込み順・build の道具を変えていない（結果が変わる変更は audit-all で見る）');
  ['chunk-regress', 'chunk-audit'].forEach(id => {
    if (anyOn(['order', 'buildtool']) || toolOn(id)) ['full', 'zen'].forEach(b => add({ id, stage: 'heavy', key: id + ':' + b, label: CHECK[id].name + '：' + BUILDS[b], b, why: O.all ? '--all' : why(['order', 'buildtool']) || '道具を変えた', weight: 1,
      afterKeys: id === 'chunk-regress' && b === 'full' && tasks.some(x => x.key === 'regress:r18') ? ['regress:r18'] : [] }));
    else skip(id, '読み込み順・かたまりの振り分けを変えていない');
  });
  if (on('dict') || toolOn('dict-regress')) add({ id: 'dict-regress', stage: 'heavy', label: CHECK['dict-regress'].name, why: O.all ? '--all' : why(['dict']) || '道具を変えた', weight: 1 });
  else skip('dict-regress', '口調の辞書を変えていない');
  /* パックの重い点検 */
  if (Object.keys(packWant).length) {
    add({ id: 'pack-site', stage: 'build', label: CHECK['pack-site'].name + '：' + Object.keys(packWant).join(','), packs: Object.keys(packWant), why: Object.keys(packWant).map(id => id + '（' + packWant[id].why.slice(0, 3).join('・') + '）').join('・'), weight: 1 });
    Object.keys(packWant).forEach(id => {
      const X = packWant[id], all = X.tags.has('all') || O.all, rooms = [...X.rooms].sort();
      const tg = t => all || X.tags.has(t);
      rooms.forEach(room => {
        if (all || tg('sim') || tg('ui') || tg('serifu') || tg('tone')) {
          /* 追加の配役パス：長い場面（sexflow）は HK_ONLY_SCEN の部屋で回る。relcons・trio は箱庭の決まった並びを回す（部屋に絞れない）ので入れない。pair は出られない部屋だけを回すので入れない */
          const extra = [];
          if (tg('thick')) extra.push('sexflow');
          Object.keys(T.EXTRA_OF).forEach(t => { if (X.tags.has(t) && T.EXTRA_OF[t] !== 'relcons' && T.EXTRA_OF[t] !== 'pair') extra.push(T.EXTRA_OF[t]); });
          add({ id: 'pack-audit', stage: 'heavy', key: 'pack-audit:' + room, label: 'パックの audit-all：' + room + (extra.length ? ' ＋ ' + extra.join(',') : ''), pack: id, room, extra, why: X.why.slice(0, 3).join('・'), weight: Math.min(2, O.jobs) });
        }
        if (tg('serifu') || tg('tone')) add({ id: 'pack-feel', stage: 'heavy', key: 'pack-feel:' + room, label: 'パックの tone-feel：' + room, pack: id, room, why: X.why.slice(0, 3).join('・'), weight: 1 });
        else skip('pack-feel', room + '：台詞を変えていない');
        if (tg('moan')) add({ id: 'pack-moan', stage: 'heavy', key: 'pack-moan:' + room, label: 'パックの moan-tone：' + room, pack: id, room, why: X.why.slice(0, 3).join('・'), weight: 1 });
        if (tg('trio')) add({ id: 'pack-flow', stage: 'heavy', key: 'pack-flow:' + room, label: 'パックの trio-shape：' + room, pack: id, room, flow: false, trio: true, why: X.why.slice(0, 3).join('・'), weight: 1 });
      });
    });
  } else skip('pack-site', 'パックとパックが頼る本体のかたまりを変えていない（--pack=… で回せる）');
  tasks.forEach(t => { t.key = t.key || t.id + (t.dir ? ':' + t.dir : ''); });
  return { tasks, skipped };
}

/* ---------- 入力のハッシュ（キャッシュの鍵） ---------- */
/* 本体のビルドで、箱庭の範囲 scope を回すときに読むかたまりのファイル（core・late とその依存・口調のかたまり・箱庭の依存） */
function chunkFiles(b, scope) {
  MAN[b] = null;
  const man = manifest(b); if (!man) return [BUILDS[b] + '/index.html'];
  let names;
  if (scope === 'all') names = Object.keys(man.chunks).filter(n => n !== 'pack-catalog');
  else {
    names = closure(man, ['late']).concat(Object.keys(man.chunks).filter(n => /^tone-/.test(n)));
    scope.forEach(id => { if (man.scen[id]) closure(man, man.scen[id].chunks || []).forEach(n => names.push(n)); });
  }
  const files = [man.core].concat([...new Set(names)].map(n => man.chunks[n] && man.chunks[n].src).filter(Boolean)).map(s => BUILDS[b] + '/' + s);
  return files;
}
/* 目録の箱庭の情報（scen）も、回す範囲の分だけ鍵に入れる（chunk の名前は中身のハッシュなので、ファイルの中身と合わせて十分） */
function manifestPart(b, scope) {
  const man = manifest(b); if (!man) return '';
  const ids = scope === 'all' ? Object.keys(man.scen) : scope;
  return JSON.stringify(ids.map(id => [id, man.scen[id] || null]).concat([['order', man.order], ['tones', man.tones]]));
}
function buildInputs(b) {
  const dir = path.join(ROOT, BUILDS[b]);
  const js = fs.readdirSync(path.join(dir, 'js')).filter(f => f !== 'event-catalog.js' && (f.endsWith('.js') || f === '_order.txt')).sort().map(f => BUILDS[b] + '/js/' + f);
  const html = String(readOr(path.join(dir, 'index.html'), '')).replace(/<!-- scripts:begin[\s\S]*<!-- scripts:end -->/, '');
  return sha(hashFiles(js) + sha(html) + hashFiles(toolsOf('build')) + hashFiles(fs.readdirSync(path.join(ROOT, 'hakoniwa-tools/build')).filter(f => /^build(?:-min|-manifest|-tone)?\.js$/.test(f)).map(f => 'hakoniwa-tools/build/' + f)));
}
function buildOutputs(b) {
  const dir = path.join(ROOT, BUILDS[b]);
  return sha(String(readOr(path.join(dir, 'index.html'), '')) + String(readOr(path.join(dir, 'js/event-catalog.js'), '')) + String(readOr(path.join(dir, 'js/c/.prev.json'), '')));
}
function packInputs(id, room) {
  const pk = pack(id); if (!pk) return '';
  const names = room ? pk.pclos(pk.roomChunk[room] || '') : Object.keys(pk.chunks);
  const files = ['hakoniwa-packs/' + id + '/pack.json'].concat([...new Set([].concat(...names.map(n => pk.chunks[n].files)))].map(f => 'hakoniwa-packs/' + id + '/js/' + f));
  return hashFiles(files);
}
function packMainInputs(id) {
  const pk = pack(id);
  const part = b => { const man = manifest(b); if (!man) return ''; const names = closure(man, ['late'].concat(pk.mainDeps.filter(d => man.chunks[d]))).concat(Object.keys(man.chunks).filter(n => /^tone-/.test(n))); return hashFiles([man.core].concat([...new Set(names)].map(n => man.chunks[n].src)).map(s => BUILDS[b] + '/' + s)); };
  return sha(part('full') + part('zen'));
}
function keyOf(t) {
  const tool = hashFiles(toolsOf(t.id));
  const base = { id: t.key, tool, args: t.args || [], env: t.env || {} };
  let inp;
  switch (t.id) {
    case 'build': return null;   /* build は別のやり方（入力と出力の両方を見る） */
    case 'syntax': case 'r18mark': case 'lines': case 'twin': return null;   /* 軽いのでいつも回す */
    case 'base-lint': inp = hashFiles(fs.readdirSync(path.join(ROOT, t.dir, 'js')).filter(f => f.endsWith('.js')).sort().map(f => t.dir + '/js/' + f)) + (t.dir === BUILDS.full ? (gitOk(['rev-parse', BASE_SHA + ':' + t.dir + '/js']) || '') : ''); break;
    case 'catalog': inp = sha(['full', 'zen'].map(b => buildInputs(b) + buildOutputs(b)).join() + packIds().map(id => packInputs(id)).join() + String(readOr(path.join(ROOT, 'docs/reports/2026-10-28/event-catalog.md'), '')) + String(readOr(path.join(ROOT, 'docs/reports/2026-11-03/pack-event-catalog.md'), '')) + HEAD_SHA); break;
    case 'audit-all': inp = sha(t.modes.map(m => { const b = m === 'zen' ? 'zen' : 'full'; return hashFiles(chunkFiles(b, t.scope)) + manifestPart(b, t.scope); }).join()); break;
    case 'tone-feel': inp = hashFiles(chunkFiles('full', t.scen.filter(id => manifest('full') && manifest('full').scen[id]))) + manifestPart('full', t.scen); break;
    case 'moan-tone': case 'sex-flow': case 'trio-shape': inp = hashFiles(chunkFiles('full', t.scope)) + manifestPart('full', t.scope); break;
    case 'force-repeat': inp = hashFiles(chunkFiles('full', 'all')); break;
    case 'regress': { const b = t.mode === 'zen' ? 'zen' : 'full'; inp = hashFiles(chunkFiles(b, 'all')) + manifestPart(b, 'all') + (gitOk(['rev-parse', BASE_SHA + ':' + BUILDS[b]]) || ''); break; }
    case 'chunk-regress': case 'chunk-audit': inp = hashFiles(chunkFiles(t.b, 'all')) + String(readOr(path.join(ROOT, BUILDS[t.b], 'index.html'), '')); break;
    case 'dict-regress': inp = hashFiles(fs.readdirSync(path.join(ROOT, 'hakoniwa-full/js')).filter(f => /^(?:tone-|core|ego-desc|persona)/.test(f)).map(f => 'hakoniwa-full/js/' + f)); break;
    case 'pack-catalog': inp = packInputs(t.pack) + String(readOr(path.join(ROOT, 'docs/reports/2026-11-03/pack-event-catalog.md'), '')); break;
    case 'pack-site': return null;   /* 試しのフォルダは毎回作る（中で build-pack を回す。数十秒） */
    case 'pack-audit': case 'pack-feel': case 'pack-moan': case 'pack-flow': inp = packMainInputs(t.pack) + packInputs(t.pack, t.room) + (packCodes() ? sha(JSON.stringify(packCodes().J[t.pack] || packCodes().J['*'])) : ''); break;
    default: inp = HEAD_SHA;
  }
  return sha(JSON.stringify(base) + inp);
}

/* ---------- 回す ---------- */
const LOGS = () => mkdir(path.join(CACHE, 'logs'));
const SITE = () => path.join(CACHE, 'site');
function spawnLog(t, cmd, args, env) {
  return new Promise(res => {
    const logf = path.join(LOGS(), t.key.replace(/[^\w.-]+/g, '_') + '.log');
    const out = fs.openSync(logf, 'w');
    fs.writeSync(out, '$ ' + Object.keys(env || {}).map(k => k + '=' + env[k] + ' ').join('') + [cmd].concat(args).join(' ') + '\n');
    const ch = cp.spawn(cmd, args, { cwd: ROOT, env: Object.assign({}, process.env, env || {}), stdio: ['ignore', out, out] });
    ch.on('close', code => { fs.closeSync(out); res({ rc: code == null ? 2 : code, log: logf, text: String(readOr(logf, '')) }); });
  });
}
const N = process.execPath;
const TCD = 'hakoniwa-tools/tone-check/', BDD = 'hakoniwa-tools/build/';
const lastLine = (s, re) => { const ls = String(s).split('\n').filter(l => l.trim()); const f = re ? ls.filter(l => re.test(l)) : ls; return (f[f.length - 1] || '').trim(); };
/* 点検ごとの回し方：{ rc, sum（一行のまとめ）, n（件数。数えられないときは null） } */
const RUN = {
  syntax: async (t, C) => {
    const bad = [];
    C.R.jsFiles.forEach(f => { if (O.all) return; try { new vm.Script(cur(f) || '', { filename: f.p }); } catch (e) { bad.push(f.p + '：' + String(e.message).slice(0, 120)); } });
    if (O.all) allJs().forEach(p => { try { new vm.Script(String(readOr(path.join(ROOT, p), '')), { filename: p }); } catch (e) { bad.push(p + '：' + String(e.message).slice(0, 120)); } });
    return { rc: bad.length ? 1 : 0, n: bad.length, sum: bad.length ? bad.slice(0, 5).join('／') : (O.all ? allJs().length : C.R.jsFiles.length) + ' ファイル', detail: bad };
  },
  r18mark: async (t, C) => {
    const bad = [];
    const files = O.all ? allJs().filter(p => T.MAINJS.test(p) || T.PACKJS.test(p)) : C.R.jsFiles.filter(f => T.MAINJS.test(f.p) || T.PACKJS.test(f.p)).map(f => f.p);
    files.forEach(p => {
      const src = O.all ? String(readOr(path.join(ROOT, p), '')) : cur(C.R.jsFiles.find(f => f.p === p));
      let open = 0; src.split('\n').forEach((l, i) => {
        const b = /\/\*\s*r18:begin\s*\*\//.test(l), e = /\/\*\s*r18:end\s*\*\//.test(l);
        if ((b || e) && !/^\s*\/\*\s*r18:(?:begin|end)\s*\*\/\s*$/.test(l)) bad.push(p + ':' + (i + 1) + ' 行全体でない');
        if (b) { if (open) bad.push(p + ':' + (i + 1) + ' 入れ子'); open = 1; }
        if (e) { if (!open) bad.push(p + ':' + (i + 1) + ' begin の無い end'); open = 0; }
      });
      if (open) bad.push(p + ' 閉じていない begin');
    });
    return { rc: bad.length ? 1 : 0, n: bad.length, sum: bad.length ? bad.slice(0, 5).join('／') : files.length + ' ファイル', detail: bad };
  },
  lines: async (t, C) => {
    const bad = [], warn = [];
    const list = O.all ? allJs().filter(p => !/vendor\//.test(p)).map(p => ({ p, st: 'M' })) : C.R.jsFiles.filter(f => !/vendor\//.test(f.p));
    list.forEach(f => {
      const n = String(O.all ? readOr(path.join(ROOT, f.p), '') : cur(f) || '').split('\n').length;
      if (n <= 2000) return;
      const o = O.all ? n : (baseText(f.p) || '').split('\n').length;
      if (O.all || (o > 2000 && n <= o)) return;
      (o > 2000 ? warn : bad).push(f.p + ' ' + (o > 2000 ? o + '→' : '') + n + ' 行');
    });
    return { rc: bad.length ? 1 : 0, n: bad.length, sum: (bad.length ? bad.join('／') : '超えたファイルなし') + (warn.length ? '（警告：もともと 2000 行を超えていて増えた ' + warn.join('・') + '）' : '') };
  },
  twin: async (t, C) => {
    const bad = [];
    C.R.files.filter(f => /^hakoniwa-(?:full|zenrei)\/js\/[^/]+$/.test(f.p) && !f.commentOnly).forEach(f => {
      const b = path.basename(f.p); if (b === '_order.txt' || b === 'event-catalog.js') return;
      const other = (/^hakoniwa-full/.test(f.p) ? BUILDS.zen : BUILDS.full) + '/js/' + b;
      const ob = baseText(other), mb = baseText(f.p);
      if (ob == null || mb == null || ob !== mb) return;   /* もともと違う（片方だけのファイル・別の中身）なら見ない */
      const oc = String(readOr(path.join(ROOT, other), '')), mc = cur(f);
      if (oc !== mc) bad.push(b);
    });
    const u = [...new Set(bad)];
    return { rc: u.length ? 1 : 0, n: u.length, sum: u.length ? '片方だけ変えた：' + u.join('・') : 'ずれなし' };
  },
  'base-lint': async (t) => {
    const r = await spawnLog(t, N, [TCD + 'base-lint.js', t.dir]);
    const items = s => { const out = []; const ls = String(s).split('\n'); for (let i = 1; i < ls.length; i++) if (/\t/.test(ls[i])) out.push(ls[i] + '\n' + (ls[i + 1] || '')); return out; };
    const now = items(r.text);
    let baseSet = new Set();
    if (t.dir === BUILDS.full && BASE_SHA) {
      const d = mkdir(path.join(CACHE, 'base-js', (gitOk(['rev-parse', BASE_SHA + ':' + t.dir + '/js']) || 'x').trim()));
      if (!fs.existsSync(path.join(d, '.ok'))) { cp.execSync('git archive ' + BASE_SHA + ' ' + t.dir + '/js | tar -x -C ' + JSON.stringify(d), { cwd: ROOT }); fs.writeFileSync(path.join(d, '.ok'), ''); }
      const b = cp.spawnSync(N, [TCD + 'base-lint.js', path.join(d, t.dir)], { cwd: ROOT, encoding: 'utf8', maxBuffer: 1 << 26 });
      baseSet = new Set(items(b.stdout));
    }
    const nw = now.filter(x => !baseSet.has(x));
    return { rc: nw.length ? 1 : 0, n: nw.length, sum: '問題 ' + now.length + '（比べる相手に無かったもの ' + nw.length + '）' + (nw.length ? '：' + nw.slice(0, 3).map(x => x.replace(/\s+/g, ' ').slice(0, 80)).join('／') : ''), log: r.log };
  },
  build: async (t) => {
    const r = await spawnLog(t, N, [BDD + 'build.js', BUILDS[t.b]]);
    MAN[t.b] = null; ORDER[t.b] = null;
    return { rc: r.rc, n: r.rc ? 1 : 0, sum: lastLine(r.text, /中核|エラー|Error/) || lastLine(r.text), log: r.log };
  },
  catalog: async (t) => { const r = await spawnLog(t, N, [BDD + 'catalog-check.js']); return { rc: r.rc, n: (r.text.match(/catalog-check：(\d+) 件/) || [])[1] != null ? +(r.text.match(/catalog-check：(\d+) 件/)[1]) : null, sum: lastLine(r.text, /catalog-check/) || lastLine(r.text), log: r.log }; },
  'audit-all': async (t) => {
    const args = [TCD + 'audit-all.js', '--modes=' + t.modes.join(',')].concat(t.extra.length ? ['--extra=' + t.extra.join(',')] : []).concat(t.onlyExtra ? ['--only-extra'] : []).concat(['--jobs=' + t.weight]);
    const env = t.scope === 'all' ? {} : { HK_ONLY_SCEN: t.scope.join(',') };
    const r = await spawnLog(t, N, args, env);
    const m = r.text.match(/== まとめ：(.*)/);
    const n = m ? (/★ 0 件でない項目・失敗が (\d+) 件/.test(m[1]) ? +RegExp.$1 : 0) : null;
    return { rc: r.rc, n, sum: m ? m[1] : lastLine(r.text), log: r.log };
  },
  'tone-feel': async (t) => {
    const r = await spawnLog(t, N, [TCD + 'tone-feel.js', BUILDS.full, '--scen=' + t.scen.join(',')]);
    return { rc: r.rc, n: feelCount(r.text), sum: feelSum(r.text), log: r.log };
  },
  'moan-tone': async (t) => {
    const r = await spawnLog(t, N, [TCD + 'moan-tone-audit.js', BUILDS.full].concat(t.scope === 'all' ? [] : ['--scen=' + t.scope.join(',')]));
    const m = r.text.match(/口調に合わない喘ぎ：(\d+) 件/);
    return { rc: r.rc, n: m ? +m[1] : null, sum: lastLine(r.text, /口調に合わない喘ぎ/) || lastLine(r.text), log: r.log };
  },
  'sex-flow': async (t) => { const r = await spawnLog(t, N, [TCD + 'sex-flow-audit.js', BUILDS.full, '24'].concat(t.scope === 'all' ? [] : [t.scope.join(',')])); return flowRes(r); },
  'trio-shape': async (t) => { const r = await spawnLog(t, N, [TCD + 'trio-shape-audit.js', BUILDS.full, '4'].concat(t.scope === 'all' ? [] : [t.scope.join(',')])); return trioRes(r); },
  'force-repeat': async (t) => { const r = await spawnLog(t, N, [TCD + 'force-repeat-audit.js', BUILDS.full]); return { rc: r.rc, n: r.rc ? null : 0, sum: lastLine(r.text), log: r.log }; },
  regress: async (t) => {
    const b = t.mode === 'zen' ? 'zen' : 'full', mode = t.mode === 'zen' ? 'r18' : t.mode;
    const run = async (dir, tag) => { const r = await spawnLog(Object.assign({}, t, { key: t.key + tag }), N, [BDD + 'regress.js', dir, '6', mode]); try { return JSON.parse(lastLine(r.text, /^\{/)); } catch (e) { return { err: lastLine(r.text), log: r.log }; } };
    const now = await run(BUILDS[b], '');
    /* 今の指紋を残す（chunk-regress の --base に渡す。同じビルドを #all で開いた regress と同じ指紋なので、chunk-regress が取り直さなくてよい） */
    if (now && now.hash) fs.writeFileSync(path.join(mkdir(path.join(CACHE, 'regress-now')), keyOf(t) + '.json'), JSON.stringify(now));
    /* 比べる相手：そのコミットのビルド（git archive で取り出す）の指紋。キャッシュに残す */
    const tree = (gitOk(['rev-parse', BASE_SHA + ':' + BUILDS[b]]) || '').trim();
    const bf = path.join(mkdir(path.join(CACHE, 'regress-base')), tree + '-' + t.mode + '-' + hashFiles(toolsOf('regress')).slice(0, 10) + '.json');
    let base = null;
    if (fs.existsSync(bf) && !O.force) base = JSON.parse(fs.readFileSync(bf, 'utf8'));
    else {
      const d = path.join(CACHE, 'base-build', tree);
      if (!fs.existsSync(path.join(d, '.ok'))) { mkdir(d); cp.execSync('git archive ' + BASE_SHA + ' ' + BUILDS[b] + ' | tar -x -C ' + JSON.stringify(d), { cwd: ROOT, maxBuffer: 1 << 28 }); fs.writeFileSync(path.join(d, '.ok'), ''); }
      base = await run(path.join(d, BUILDS[b]), '-base');
      if (base && base.hash) fs.writeFileSync(bf, JSON.stringify(base));
    }
    if (!now.hash || !base || !base.hash) return { rc: 1, n: null, sum: '指紋を取れない：' + (now.err || (base && base.err) || ''), log: now.log };
    const ids = Object.keys(base.hash).filter(id => now.hash[id] != null);
    const same = Object.keys(base.hash).length === Object.keys(now.hash).length;
    const k = same ? 'hash' : 'hash2';   /* 箱庭の数が変わったら、並びに左右されない指紋2で比べる */
    const diff = ids.filter(id => (now[k] || {})[id] !== (base[k] || {})[id]);
    const err = (now.errors || []).length;
    return { rc: diff.length || err ? 1 : 0, n: diff.length + err, sum: (diff.length ? '指紋が違う箱庭 ' + diff.length + '：' + diff.join(',') : '全 ' + ids.length + ' 箱庭が一致（' + (same ? '指紋1' : '指紋2') + '・比べる相手 ' + BASE_SHA.slice(0, 8) + '）') + (err ? '・ページのエラー ' + err : '') };
  },
  'chunk-regress': async (t, C) => {
    /* R18版：同じ回の regress（R18版）の今の指紋があれば、それを比べる相手に渡す（chunk-regress が #all を開いて同じ指紋を取り直すのを省く） */
    const rt = t.b === 'full' && C.tasks.find(x => x.key === 'regress:r18');
    const bf = rt && path.join(CACHE, 'regress-now', keyOf(rt) + '.json');
    const r = await spawnLog(t, N, [BDD + 'chunk-regress.js', BUILDS[t.b]].concat(t.b === 'full' ? ['r18'] : []).concat(bf && fs.existsSync(bf) ? ['--base=' + bf] : []));
    return { rc: r.rc, n: r.rc ? null : 0, sum: lastLine(r.text), log: r.log };
  },
  'chunk-audit': async (t) => { const r = await spawnLog(t, N, [BDD + 'chunk-audit.js', BUILDS[t.b]].concat(t.b === 'full' ? ['r18'] : [])); return { rc: r.rc, n: r.rc ? null : 0, sum: lastLine(r.text), log: r.log }; },
  'dict-regress': async (t) => { const r = await spawnLog(t, N, [TCD + 'dict-regress.js', BUILDS.full]); return { rc: 0, n: null, sum: lastLine(r.text, /3本|合計|一致/) || lastLine(r.text), log: r.log, info: true }; },
  'pack-catalog': async (t) => { const r = await spawnLog(t, N, [BDD + 'event-catalog.js', '--pack=hakoniwa-packs/' + t.pack]); return { rc: r.rc, n: r.rc ? 1 : 0, sum: lastLine(r.text), log: r.log }; },
  'pack-site': async (t) => {
    const pc = packCodes(); if (!pc) return { rc: 1, n: null, sum: 'コードのファイルがありません（hakoniwa-packs/codes.local.json か codes.example.json）' };
    const r = await spawnLog(t, N, [BDD + 'pack-site.js'].concat(t.packs.map(id => 'hakoniwa-packs/' + id)).concat(['--out=' + SITE(), '--codes=' + pc.file]));
    return { rc: r.rc, n: r.rc ? 1 : 0, sum: r.rc ? lastLine(r.text) : '試しのフォルダ ' + path.relative(ROOT, SITE()), log: r.log };
  },
  'pack-audit': async (t) => {
    const args = [TCD + 'audit-all.js', '--full=' + path.join(SITE(), BUILDS.full), '--zen=' + path.join(SITE(), BUILDS.zen), '--jobs=' + t.weight].concat(t.extra.length ? ['--extra=' + t.extra.join(',')] : []);
    const r = await spawnLog(t, N, args, packEnv(t, true));
    const m = r.text.match(/== まとめ：(.*)/);
    return { rc: r.rc, n: m ? (/★ 0 件でない項目・失敗が (\d+) 件/.test(m[1]) ? +RegExp.$1 : 0) : null, sum: m ? m[1] : lastLine(r.text), log: r.log };
  },
  'pack-feel': async (t) => { const r = await spawnLog(t, N, [TCD + 'tone-feel.js', path.join(SITE(), BUILDS.full), '--scen=' + t.room], packEnv(t, false)); return { rc: r.rc, n: feelCount(r.text), sum: feelSum(r.text), log: r.log }; },
  'pack-moan': async (t) => { const r = await spawnLog(t, N, [TCD + 'moan-tone-audit.js', path.join(SITE(), BUILDS.full), '4', '--scen=' + t.room], packEnv(t, true)); const m = r.text.match(/口調に合わない喘ぎ：(\d+) 件/); return { rc: r.rc, n: m ? +m[1] : null, sum: lastLine(r.text, /口調に合わない喘ぎ/) || lastLine(r.text), log: r.log }; },
  'pack-flow': async (t) => {
    const res = [];
    if (t.flow) res.push(flowRes(await spawnLog(Object.assign({}, t, { key: t.key + '-flow' }), N, [TCD + 'sex-flow-audit.js', path.join(SITE(), BUILDS.full), '24', t.room], packEnv(t, true))));
    if (t.trio) res.push(trioRes(await spawnLog(Object.assign({}, t, { key: t.key + '-trio' }), N, [TCD + 'trio-shape-audit.js', path.join(SITE(), BUILDS.full), '4', t.room], packEnv(t, true))));
    return { rc: res.some(r => r.rc) ? 1 : 0, n: res.reduce((s, r) => s == null || r.n == null ? null : s + r.n, 0), sum: res.map(r => r.sum).join('／'), log: res.map(r => r.log).join(' ') };
  }
};
function packEnv(t, only) {
  const pc = packCodes(), code = pc ? [].concat(pc.J[t.pack] || [], pc.J['*'] || [])[0] : '';
  return Object.assign({ HK_PACK_CODES: code }, only ? { HK_ONLY_SCEN: t.room } : {});
}
/* tone-feel：口調ごとの行（| 口調 | … | ◯／△／✕ | …）のうち ◯ でないものの数。まとめの行は「== まとめ：すべて ◯・…」 */
function feelCount(s) { const m = String(s).match(/== まとめ：(.*)/); if (!m) return null; return /すべて ◯/.test(m[1]) ? 0 : /◯ でない口調 (\d+)/.test(m[1]) ? +RegExp.$1 : (String(s).match(/^\|[^\n]*\| (?:△|✕) \|/gm) || []).length; }
function feelSum(s) { const m = String(s).match(/== まとめ：(.*)/); return m ? m[1] : lastLine(s); }
function flowRes(r) { const v = (r.text.match(/^\s*\(([a-h])\)[^0-9\n]*?(\d+)/gm) || []); return { rc: r.rc, n: r.rc ? null : 0, sum: lastLine(r.text, /件|段/) || lastLine(r.text), log: r.log }; }
function trioRes(r) { return { rc: r.rc, n: r.rc ? null : 0, sum: [lastLine(r.text, /設定に合わない形/), lastLine(r.text, /場面の状態/)].filter(Boolean).join('・') || lastLine(r.text), log: r.log }; }
let ALLJS = null;
function allJs() {
  if (ALLJS) return ALLJS;
  const out = [];
  Object.values(BUILDS).forEach(b => fs.readdirSync(path.join(ROOT, b, 'js')).filter(f => f.endsWith('.js') && f !== 'event-catalog.js').forEach(f => out.push(b + '/js/' + f)));
  packIds().forEach(id => fs.readdirSync(path.join(ROOT, 'hakoniwa-packs', id, 'js')).filter(f => f.endsWith('.js')).forEach(f => out.push('hakoniwa-packs/' + id + '/js/' + f)));
  return (ALLJS = out);
}

/* ---------- キャッシュ ---------- */
const cacheFile = (t, key) => path.join(CACHE, 'results', t.key.replace(/[^\w.-]+/g, '_'), key + '.json');
function cacheGet(t, key) { if (!key || O.force) return null; try { return JSON.parse(fs.readFileSync(cacheFile(t, key), 'utf8')); } catch (e) { return null; } }
function cachePut(t, key, r) {
  if (!key || (r.rc !== 0 && r.rc !== 1)) return;
  const f = cacheFile(t, key); mkdir(path.dirname(f));
  const tmp = f + '.' + process.pid; fs.writeFileSync(tmp, JSON.stringify({ key, check: t.key, label: t.label, rc: r.rc, n: r.n, sum: r.sum, sec: r.sec, date: new Date().toISOString(), commit: HEAD_SHA, base: BASE_SHA, root: ROOT })); fs.renameSync(tmp, f);
}
/* build：入力（js・_order・index.html の scripts の外・道具）が前回の build と同じで、出力（index.html・一覧・.prev.json）も前回の build のあとと同じなら飛ばす */
function buildCached(b) {
  if (O.force) return null;
  try { const J = JSON.parse(fs.readFileSync(path.join(CACHE, 'build', BUILDS[b] + '-' + sha(ROOT).slice(0, 8) + '.json'), 'utf8')); if (J.in === buildInputs(b) && J.out === buildOutputs(b)) return J; } catch (e) { /* 無い */ }
  return null;
}
function buildPut(b, r) { const d = mkdir(path.join(CACHE, 'build')); fs.writeFileSync(path.join(d, BUILDS[b] + '-' + sha(ROOT).slice(0, 8) + '.json'), JSON.stringify({ in: buildInputs(b), out: buildOutputs(b), sec: r.sec, date: new Date().toISOString(), sum: r.sum })); }

/* ---------- 並べて回す ---------- */
async function schedule(tasks, C) {
  const done = {}, results = [];
  const deps = t => {
    const c = CHECK[t.id]; const want = (c && c.after) || [];
    return tasks.filter(x => x !== t && (want.indexOf(x.id) >= 0 || (t.afterKeys || []).indexOf(x.key) >= 0));
  };
  const pre = tasks.filter(t => t.stage === 'pre'), rest = tasks.filter(t => t.stage !== 'pre');
  const runOne = async t => {
    const t0 = Date.now();
    let r;
    /* 試しのフォルダ：あとの点検がすべてキャッシュにあるなら作らない */
    const packNeed = t.id === 'pack-site' && !O.force ? tasks.filter(x => /^pack-(?:audit|feel|moan|flow)$/.test(x.id)).some(x => !cacheGet(x, keyOf(x))) : true;
    if (t.id === 'pack-site' && !packNeed) r = { rc: 0, n: 0, sum: 'あとのパックの点検がすべてキャッシュにあるので作らない', cached: true, sec: 0 };
    else if (t.id === 'build' && buildCached(t.b)) { const J = buildCached(t.b); r = { rc: 0, n: 0, sum: '入力・出力とも前回の build と同じ（' + J.date.slice(0, 16).replace('T', ' ') + '）', cached: true, sec: 0 }; }
    else {
      const key = keyOf(t);
      const hit = cacheGet(t, key);
      if (hit) r = { rc: hit.rc, n: hit.n, sum: hit.sum, cached: true, sec: hit.sec, date: hit.date, commit: hit.commit };
      else {
        log('▶ ' + t.label);
        try { r = await RUN[t.id](t, C); } catch (e) { r = { rc: 1, n: null, sum: '道具の例外：' + String(e && e.message || e).slice(0, 200) }; }
        r.sec = (Date.now() - t0) / 1000;
        if (t.id === 'build') { if (r.rc === 0) buildPut(t.b, r); }
        else if (!r.info) cachePut(t, key, r);
      }
    }
    r.t = t; r.wall = (Date.now() - t0) / 1000;
    log((r.rc ? '✕ ' : '◯ ') + t.label + '（' + (r.cached ? 'キャッシュ' : r.sec.toFixed(0) + ' 秒') + '）' + (r.rc ? '：' + String(r.sum).slice(0, 160) : ''));
    results.push(r); done[t.key] = r; return r;
  };
  /* 前置き：順に。落ちたら（--keep-going でなければ）重い点検に進まない */
  let preBad = false;
  for (const t of pre) { const r = await runOne(t); if (r.rc && !CHECK[t.id].info) preBad = true; }
  if (preBad && !O.keep) { rest.forEach(t => results.push({ t, rc: null, skipped: '前置きの点検が落ちたので回していない（--keep-going で続ける）' })); return results; }
  /* 残り：依存が済んだものから、重い順に、ページの数の上限まで */
  /* 優先度：自分の目安 ＋ 自分のあとに回る点検の目安（regress のあとの chunk-regress のように、長い点検の前に要るものを先に） */
  const est = t => t.est || (CHECK[t.id] || {}).est || 0;
  const pri = t => est(t) + rest.filter(x => x !== t && deps(x).indexOf(t) >= 0).reduce((m, x) => Math.max(m, est(x)), 0);
  const queue = rest.slice().sort((a, b) => pri(b) - pri(a));
  let used = 0; const running = new Set();
  await new Promise(resolve => {
    const pump = () => {
      if (!queue.length && !running.size) return resolve();
      for (let i = 0; i < queue.length; i++) {
        const t = queue[i], ds = deps(t);
        if (ds.some(d => !done[d.key])) continue;
        const bad = ds.filter(d => done[d.key].rc);
        if (bad.length) { queue.splice(i--, 1); const r = { t, rc: null, skipped: '先の点検（' + bad.map(d => d.t ? d.t.label : d.label).join('・') + '）が落ちたので回していない' }; results.push(r); done[t.key] = { rc: 1 }; continue; }
        const w = Math.min(t.weight || 1, O.jobs);
        if (used + w > O.jobs && used > 0) continue;
        queue.splice(i--, 1); used += w; running.add(t);
        runOne(t).then(() => { used -= w; running.delete(t); pump(); });
      }
      if (!running.size && queue.length) { /* 依存が回らない（ありえないが念のため） */ queue.splice(0).forEach(t => results.push({ t, rc: null, skipped: '依存が解けない' })); resolve(); }
    };
    pump();
  });
  return results;
}
const log = s => process.stderr.write(s + '\n');

/* ---------- 表（md） ---------- */
function tableMd() {
  const L = [];
  L.push('| 印 | 意味 |', '|---|---|'); Object.keys(T.TAGS).forEach(k => L.push('| `' + k + '` | ' + T.TAGS[k] + ' |'));
  L.push('', '| ファイルの場所・名前 | 付く印 |', '|---|---|');
  T.FILE_RULES.forEach(r => L.push('| `' + String(r.re || r.b).replace(/\|/g, '\\|') + '`' + (r.b ? '（js の名前）' : '') + ' | ' + (r.gen ? '作り直されるもの（見ない）' : r.tool ? '道具（その道具の点検を回し直す）' : r.tags.map(t => '`' + t + '`').join(' ') || '—') + (r.stop ? '（ここで止める）' : '') + (r.toneOnly ? '（口調だけ：sim を付けない）' : '') + (r.ui ? '（画面：台詞の印を付けない）' : '') + ' |'));
  L.push('', '| 変わった行の中身 | 付く印 |', '|---|---|');
  T.LINE_RULES.concat(T.COMMENT_RULES).forEach(r => L.push('| `' + String(r.re).replace(/\|/g, '\\|') + '` | ' + r.tags.map(t => '`' + t + '`').join(' ') + ' |'));
  L.push('| `' + String(T.EVENT_LINE).replace(/\|/g, '\\|') + '`・ファイルの追加と削除 | `event` |');
  L.push('', '| 点検 | 段 | 回す印 | 先に済ませる | ページ | 目安 | 備考 |', '|---|---|---|---|---|---|---|');
  T.CHECKS.forEach(c => L.push('| ' + c.name + '（`' + c.id + '`） | ' + c.stage + ' | ' + c.tags.map(t => '`' + t + '`').join(' ') + ' | ' + ((c.after || []).join('・') || '—') + ' | ' + (c.weight || 0) + ' | ' + c.est + ' 秒 | ' + c.why + ' |'));
  return L.join('\n');
}

/* ---------- 本体 ---------- */
(async () => {
  if (O.table) { console.log(tableMd()); return; }
  const T0 = Date.now();
  const files = O.all && !O.since && !O.files && !O.staged ? changedFiles() : changedFiles();
  const R = classify(files);
  const { tasks, skipped } = decide(R);
  const C = { R, tasks };
  console.log('== check.js：比べる相手 ' + (O.staged ? 'git add した分' : (O.since || 'HEAD') + '（' + BASE_SHA.slice(0, 8) + '）') + (O.all ? '・--all（全部）' : '') + '・キャッシュ ' + path.relative(ROOT, CACHE) + '・ページ ' + O.jobs + ' 本');
  console.log('変わったファイル ' + R.files.length + (R.gen.length ? '（作り直されるもの ' + R.gen.length + ' は見ない）' : ''));
  R.files.slice(0, O.verbose ? 1e9 : 40).forEach(f => console.log('  ' + f.st + ' ' + f.p + '　' + ([...f.tags].join(' ') || '—') + (f.commentOnly ? '（コメントだけ）' : '') + (f.scen && f.scen !== 'all' && f.scen.length ? '　箱庭 ' + f.scen.join(',') : '') + (f.rooms ? '　部屋 ' + (f.rooms === 'all' ? '全部' : f.rooms.join(',')) : '')));
  if (R.files.length > 40 && !O.verbose) console.log('  …ほか ' + (R.files.length - 40) + '（-v で全部）');
  if (O.dry) {
    console.log('\n回す点検 ' + tasks.length + '：');
    tasks.forEach(t => {
      let c = '';
      if (t.id === 'build') c = buildCached(t.b) ? '［キャッシュ：入力・出力が前回と同じ］' : '';
      else { try { const k = keyOf(t); const h = k && cacheGet(t, k); c = h ? '［キャッシュ：' + h.date.slice(0, 16).replace('T', ' ') + ' ' + (h.rc ? '✕' : '◯') + '］' : (k && tasks.some(x => x.id === 'build' && !buildCached(x.b)) && t.stage !== 'pre' ? '［build のあとで決まる］' : ''); } catch (e) { c = ''; } }
      console.log('  ' + ({ pre: '前置き', build: 'build', post: 'build のあと', heavy: '重い' })[t.stage] + '｜' + t.label + '　← ' + t.why + (c ? '　' + c : ''));
    });
    console.log('\n飛ばす点検 ' + skipped.length + '：');
    skipped.forEach(s => console.log('  ' + s.name + '　← ' + s.why));
    return;
  }
  if (!tasks.length) { console.log('\n回す点検はありません（' + (R.files.length ? '文書・コメントだけの変更' : '変更なし') + '）'); skipped.forEach(s => console.log('  飛ばした：' + s.name + '　← ' + s.why)); return; }
  const res = await schedule(tasks, C);
  /* 一覧 */
  const sec = (Date.now() - T0) / 1000;
  console.log('\n== 結果（' + sec.toFixed(0) + ' 秒）');
  console.log('| 点検 | 結果 | 件数 | 所要 | まとめ |'); console.log('|---|---|---|---|---|');
  let bad = 0;
  res.forEach(r => {
    const ok = r.rc === 0, info = CHECK[r.t.id] && CHECK[r.t.id].info;
    if (!ok && !info) bad++;
    console.log('| ' + r.t.label + ' | ' + (r.skipped ? '— 回していない' : ok ? '◯' : info ? '参考' : '✕') + ' | ' + (r.n == null ? '' : r.n) + ' | ' + (r.skipped ? '' : r.cached ? 'キャッシュ（' + (r.date ? r.date.slice(0, 16).replace('T', ' ') + '・' : '') + (r.sec != null ? r.sec.toFixed(0) + ' 秒' : '') + '）' : r.sec.toFixed(0) + ' 秒') + ' | ' + String(r.skipped || r.sum || '').replace(/\|/g, '／').replace(/\n/g, ' ').slice(0, 220) + (r.rc && r.log ? '（' + path.relative(ROOT, r.log) + '）' : '') + ' |');
  });
  console.log('\n飛ばした点検：');
  skipped.forEach(s => console.log('  ' + s.name + '　← ' + s.why));
  console.log('\n== ' + (bad ? '★ 合格でない点検 ' + bad : 'すべて合格') + '（回した ' + res.filter(r => !r.skipped && !r.cached).length + '・キャッシュ ' + res.filter(r => r.cached).length + '・飛ばした ' + skipped.length + '・所要 ' + sec.toFixed(0) + ' 秒）');
  process.exitCode = bad ? 1 : 0;
})().catch(e => { console.error(e && e.stack || e); process.exitCode = 1; });
