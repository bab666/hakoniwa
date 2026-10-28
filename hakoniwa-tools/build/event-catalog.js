/* 箱庭シミュレーター：箱庭ごとの「出来事の一覧」を作る（build.js から毎回呼ぶ。単独でも動く）
   node hakoniwa-tools/build/event-catalog.js <ビルド>（hakoniwa-full / hakoniwa-zenrei） [--print] [--headless]
     ・<ビルド>/js/event-catalog.js（HK.EVENT_CATALOG。族のかたまり pack-catalog。画面 event-catalog-ui.js がボタンを押したときに読む）と docs/reports/2026-10-28/event-catalog.md の、そのビルドの節を書き直す
     ・--print：書かずに、箱庭ごとの件数だけを出す　--headless：ブラウザ（Playwright）で #all を開いて数え、node の vm で数えた結果と id の並びが同じか確かめる（遅い。点検用）
   しくみ
     ・build.js と同じ順・同じ包み（HK.Load.def）で、全部のかたまりを node の vm で読む（build-manifest.js の runVm。R18版は #r18）。
       ファイルを1本読むたびに、出来事の置き場（HK.COMMON・箱庭の events・HK.MINI・HK.INCIDENTS・関係の出来事の山・印の付いた表）をなめ、初めて見た出来事に「出どころのファイル」と、
       その時点の when／w／run の文字列を覚える（あとで別のファイルが包んでも、元の条件が読めるように）
     ・エンジン型の箱庭（simulate を持たない）は HK.buildPool(箱庭) の出来事＋HK.INCIDENTS（ハプニング）。物語型の箱庭は、ソースの印（下の「印」）だけ
     ・関係の判定（どれか一つで決まれば、その方法の記号を付ける）
         a＝出来事の印（tie／ties。文字列・カンマ区切り・配列。'-' は「関係を問わない」と明示）
         b＝when／w の文字列から拾う（Ties.has(ctx, a, b, 'master') のような関係の鍵の引用・.type === 'lover'・/^(enemy|rival)$/.test(t.type)・ctx.pair(a, b).couple など。! で打ち消しているものは数えない）
         d＝定義の文字列から拾う（出来事の id をソースで探し、その定義のかたまり（is('teacherA') や k: 'sibbad' など）から同じように拾う。工場で作る出来事向け）
         c＝id から拾う（tie_master_r18 → 主従、om_tie_boss → 上司と部下、と、決まった頭（u_ 片想い・fc_ セフレ など。下の ID_RULE））
         -＝拾えない（「関係を問わない」に数える）
     ・R18 の夜：印（sex／lewd／r18、tags の night）か、run が HK.EroTop／HK.ThickSex／HK.Ero を呼ぶもの。モブ相手は tags の mob か、id・コードのモブの印（ID の mob・assault・raid、HK.Mob・mobSexOk など）
     ・条件：when の文字列の HK.Content.ok／on(…,'force')・展開の重さ（'dark'）・ctx.env.xxx（環境値。しきい値も）・okSex（受け攻め）・性欲・関係・モブ
     ・内容の軸：合意のない展開・妊娠・暴力・歪んだ関係（Content の印・tags）、死ネタ（HK.Dark の死ネタの種類・ctx.kill・tags の death）、残酷（HK.Dark の harm・cage・assault・暴力・tags の cruel）
   印（新しい出来事を足すときの決まり。docs/reports/2026-10-28/event-catalog.md の冒頭にも書く）
     ・出来事のオブジェクト：tie: 'master'（関係が条件なら）、tags: ['night','mob','force','preg','violence','abuse','death','cruel']（拾えないとき）、label: '表示名'
     ・コードで書いた場面（物語型など）：その場面の近くに 1 行のコメント
         /* @event scen=jashin id=jn_god_night cat=夜 tie=- tags=night,mob,force label=神に捧げられる夜 *\/
       表（配列やオブジェクト）をまとめて数えるとき：
         /* @event-table scen=jashin path=JASHIN.DUO_EV cat=二人の場面 label=二人の場面 pair=1 *\/（path は HK. から先。pair=1 は職業×職業の表：数だけ）
       R18 の場面の印は、R18専用のファイルか /* r18:begin *\/〜/* r18:end *\/ の中に書く（全年齢版のビルドでは読まない）
   出力は決定的（同じソースなら同じ中身。時刻を入れない） */
'use strict';
const fs = require('fs'), path = require('path');
const MF = require('./build-manifest.js'), BM = require('./build-min.js');

const OUT_JS = 'js/event-catalog.js', OUT_MD = path.join(__dirname, '../../docs/reports/2026-10-28/event-catalog.md');
const SKIP_RUN = { 'js/load.js': 1, 'js/event-catalog.js': 1 };

/* ---------- 読み込み順（build.js と同じ解釈。通し番号は late・tone を後ろに回した順） ---------- */
function readOrder(dir) {
  const entries = [], deps = {};
  fs.readFileSync(path.join(dir, 'js/_order.txt'), 'utf8').split('\n').forEach(line => {
    const l = line.replace(/#.*$/, '').trim();
    if (!l) return;
    let m;
    if ((m = l.match(/^@chunk\s+(\S+)(?:\s+deps=(\S*))?$/))) { deps[m[1]] = (m[2] || '').split(',').filter(Boolean); return; }
    if (/^@/.test(l)) return;
    m = l.match(/^((?:late|tone)\s+)?(js\/[^\s@'"\\]+\.js)(?:\s+@(pack|scen):(\S+))?$/);
    if (!m) return;
    entries.push({ f: m[2], chunk: m[1] ? m[1].trim() : m[3] ? m[3] + '-' + m[4] : 'core' });
  });
  const isLate = e => e.chunk === 'late' || e.chunk === 'tone';
  entries.filter(e => !isLate(e)).concat(entries.filter(isLate)).forEach((e, i) => { e.n = i + 1; });
  const names = ['core'];
  if (entries.some(e => e.chunk === 'late')) names.push('late');
  entries.forEach(e => { if (e.chunk !== 'tone' && names.indexOf(e.chunk) < 0) names.push(e.chunk); });
  const exec = [], st = {};
  const visit = c => { if (st[c]) return; st[c] = 1; (deps[c] || []).forEach(visit); exec.push(c); };
  names.forEach(visit);
  return { entries, exec };
}
function isSafeBuild(dir) {
  const html = fs.readFileSync(path.join(dir, 'index.html'), 'utf8');
  return /HK_SAFE_BUILD\s*=\s*1/.test(html.replace(/<!-- scripts:begin[\s\S]*?<!-- scripts:end -->/, ''));
}

/* ---------- vm で全部を読む（出どころを覚えながら） ---------- */
/* 出来事の置き場：[名前, 配列] の並び（エンジン型の出来事の山の材料と、印の付いた表） */
function stores(HK) {
  const out = [];
  const arr = (n, a) => { if (Array.isArray(a)) out.push([n, a]); };
  arr('COMMON', HK.COMMON);
  const S = HK.SCENARIOS || {};
  Object.keys(S).forEach(id => { const s = S[id]; if (s && typeof s === 'object') arr('scen.' + id, s.events); });
  Object.keys(HK.MINI || {}).forEach(id => arr('MINI.' + id, HK.MINI[id]));
  Object.keys(HK.INCIDENTS || {}).forEach(id => arr('INCIDENTS.' + id, HK.INCIDENTS[id]));
  const P = HK.RelCore && HK.RelCore.POOL;
  if (P) Object.keys(P).forEach(id => arr('RelCore.' + id, P[id]));
  return out;
}
const FN_KEYS = ['when', 'w', 'run', 'ok', 'cond', 'can', 'fit'];
function srcOf(o) {
  const s = {};
  FN_KEYS.forEach(k => { let v; try { v = o[k]; } catch (e) { v = null; } if (typeof v === 'function') s[k] = Function.prototype.toString.call(v); });
  return s;
}
function runAll(dir, opt) {
  const SAFE = opt.safeBuild, { entries, exec } = readOrder(dir);
  const readSrc = f => { let s = fs.readFileSync(path.join(dir, f), 'utf8').replace(/\s+$/, ''); if (SAFE) s = BM.strip(s, f, null); return s; };
  const srcs = {};
  const chunks = exec.map(name => ({ name, hash: '', files: entries.filter(e => e.chunk === name && !SKIP_RUN[e.f]).map(e => { const src = readSrc(e.f); srcs[e.f] = src; return { n: e.n, f: e.f, src }; }) }));
  /* tone の行（口調の表だけのファイル）は実行しないが、印のコメントを拾うために読む */
  entries.filter(e => e.chunk === 'tone').forEach(e => { srcs[e.f] = readSrc(e.f); });
  const born = new WeakMap();
  const scanAt = (f, HK) => {
    stores(HK).forEach(([, a]) => a.forEach(o => {
      if (!o || typeof o !== 'object' || born.has(o)) return;
      born.set(o, { f, src: srcOf(o) });
    }));
  };
  let hooked = false;
  const onFile = (f, HK) => {
    /* かたまりの読み終わりの取り付け役（HK.Load.onChunk）が足した出来事は、取り付け役を登録したファイルのものにする（この vm の中だけ包む） */
    if (!hooked && HK.Load && typeof HK.Load.onChunk === 'function') {
      hooked = true;
      const L = HK.Load, on0 = L.onChunk;
      L.onChunk = function (fn) {
        const who = L.file || '';
        return on0.call(this, typeof fn !== 'function' ? fn : function () { scanAt('@done', HK); const r = fn.apply(this, arguments); scanAt(who || '@done', HK); return r; });
      };
    }
    scanAt(f, HK);
  };
  const loadSrc = fs.existsSync(path.join(dir, 'js/load.js')) ? readSrc('js/load.js') : null;
  const R = MF.runVm({ build: SAFE ? 'zenrei' : 'full', safeBuild: SAFE, hash: SAFE ? '' : 'r18', quiet: true, loadSrc, chunks, onFile });
  return { R, HK: R.HK, born, srcs, entries };
}

/* ---------- 文字列から拾う ---------- */
const JP = /[\u3040-\u30ff\u4e00-\u9fff]/;
/* 関係の鍵の言い換え（箱庭の中の呼び名 → HK.TIES の鍵） */
const ALIAS = { sib: 'sibling', mirror: 'same', teacherA: 'teacher', teacherB: 'teacher', mentorA: 'mentor', mentorB: 'mentor', protA: 'sibprot', protB: 'sibprot', bossA: 'boss', bossB: 'boss', parentA: 'parent', parentB: 'parent', masterA: 'master', masterB: 'master', couple: 'lover', lovers: 'lover', married: 'spouse' };
/* 箱庭の中で変わる関係（設定の関係でなく、その回でなった恋人など）：コードの書き方 → 鍵 */
const DYN = [
  ['lover', /(?:ctx\.pair\([^()]*\)|\b(?:pf|pr|pair|pp))\.(?:couple|lover)\b/g],
  ['lover', /\b(?:loverOf|isLover|lovers|coupleOf|isCouple|partnerOf)\s*\(/g],
  ['fwb', /(?:ctx\.pair\([^()]*\)|\b(?:pf|pr|pair|pp))\.fwb\b/g],
  ['fwb', /\bFC\.kind\s*\(|\bF\.allowed\s*\(/g],
  ['yan', /\bHK\.Obsess\.(?:target|is|level)\s*\(|\bO\.target\s*\(/g],
  ['crush', /\bU\.unreq\s*\(|\bHK\.Unreq\.\w+\s*\(|\bP\.is\s*\(/g],
  ['enemy', /\bH\.level\s*\(|\bHK\.HateKit\.\w+\s*\(/g],
  ['mate', /(?:ctx\.pair\([^()]*\)|\b(?:pf|pr|pair))\.(?:bonded|mated)\b/g]
];
/* id の頭 → 鍵（工場で作る出来事。ファイルの分担に合わせた決まり） */
const ID_RULE = [
  [/^u_/, 'crush'], [/^pn_/, 'crush'], [/^(?:fc|fw|fwb)_/, 'fwb'], [/^ob_/, 'yan'], [/^hk_/, 'enemy'],
  [/^rb_[a-z]+_sb/, 'sibbad'], [/^rb_/, 'bad'], [/^tie_nw_ap_/, 'apathy'], [/^tie_nw_fr_/, 'fear'], [/^tie_nw_fi_/, 'fiance'],
  [/^tie_nw_dep_|^tie_nw_hl_/, 'yan'], [/^tie_nw_hate_/, 'enemy'], [/^tie_nw_gu_/, 'benefactor'], [/^tie_nw_os_/, 'fond'], [/^tie_nw_mi_/, 'fwb'], [/^tie_nw_co_/, 'comrade'],
  [/^tie_lh_/, 'yan'], [/^tie_ab_|^ct_dv$|^ct_abuse/, 'abuse'], [/^rs_|^attr_mirror_/, 'same']
];
/* 位置 i の直前で開いている括弧の呼び出しの名前と、その前に ! があるか */
function callAt(s, i) {
  let d = 0, j = i - 1;
  for (; j >= 0 && i - j < 600; j--) {
    const ch = s[j];
    if (ch === ')' || ch === ']') d++;
    else if (ch === '(' || ch === '[') { if (d === 0) break; d--; }
    else if (d === 0 && (ch === ';' || ch === '{' || ch === '}')) return null;
  }
  if (j < 0 || s[j] !== '(') return null;
  const m = s.slice(Math.max(0, j - 80), j).match(/([A-Za-z_$][\w$.]*)\s*$/);
  if (!m) return null;
  const before = s.slice(Math.max(0, j - 80), j - m[0].length).replace(/\s+$/, '');
  return { name: m[1], neg: /!$/.test(before) && !/!!$/.test(before) };
}
function tieKeysIn(code, KEYS) {
  const out = new Set();
  if (!code) return out;
  const key = k => { const a = ALIAS[k] || k; return KEYS.has(a) ? a : null; };
  /* 文字列の引用 */
  code.replace(/(['"])([a-zA-Z]+)\1/g, (m0, q, k, i) => {
    const t = key(k);
    if (!t) return m0;
    const pre = code.slice(Math.max(0, i - 60), i);
    if (/(?:\.type|\btype|\btt|\bk|\bkind|\btie\w*\([^()]*\))\s*===?\s*$/.test(pre)) { out.add(t); return m0; }
    if (/!==?\s*$/.test(pre)) return m0;
    if (/\b(?:k|tie|type|kind|rel|t)\s*:\s*$/.test(pre)) { out.add(t); return m0; }
    const c = callAt(code, i);
    if (c && !c.neg && /(?:^|\.)(?:Ties\.\w+|has\w*|tie\w*|is|isK|kind\w*|from|get|on|rel\w*|tt|T|by|of|with|find|any\w*|ok\w*|tiesOf\w*)$/i.test(c.name)) out.add(t);
    return m0;
  });
  /* 正規表現の印：/^(enemy|rival|bad)$/.test(t.type) */
  code.replace(/\/\^\(?((?:[a-z]+\|)*[a-z]+)\)?\$\/\.test\(([^()]*)\)/g, (m0, ks, arg) => {
    if (/type|tie|kind/i.test(arg)) ks.split('|').forEach(k => { const t = key(k); if (t) out.add(t); });
    return m0;
  });
  /* 箱庭の中で変わる関係 */
  DYN.forEach(([k, re]) => {
    re.lastIndex = 0;
    let m;
    while ((m = re.exec(code))) {
      const before = code.slice(Math.max(0, m.index - 3), m.index);
      if (/![\s(]*$/.test(before) && !/!!$/.test(before)) continue;
      if (/^\s*(?:==|!=)/.test(code.slice(m.index + m[0].length))) continue;
      out.add(k); break;
    }
  });
  return out;
}
/* ソースで出来事の定義のかたまりを探す（id の引用か、工場の鍵名） */
function defSnippet(src, id) {
  if (!src || !id) return null;
  const tries = ["'" + id + "'", '"' + id + '"'];
  const segs = String(id).split('_');
  for (let k = segs.length - 1; k >= 1; k--) { const s = segs.slice(k).join('_'); if (s.length >= 4) tries.push(new RegExp('[{,]\\s*' + s.replace(/[$]/g, '\\$') + '\\s*:')); }
  for (const t of tries) {
    const at = typeof t === 'string' ? src.indexOf(t) : (src.match(t) || { index: -1 }).index;
    if (at < 0) continue;
    let end = Math.min(src.length, at + 700);
    const nx = src.slice(at + 10, end).search(/\n\s*(?:ev\(|add\(|\{\s*id:|[A-Za-z]\w*:\s*\{\s*k:|id: ')/);
    if (nx > 0) end = at + 10 + nx;
    return { at, text: src.slice(at, end), exact: typeof t === 'string' };
  }
  return null;
}
function lineOf(src, at) { let n = 1; for (let i = 0; i < at && i < src.length; i++) if (src.charCodeAt(i) === 10) n++; return n; }
/* r18:begin〜end の行の範囲 */
function r18Ranges(raw) {
  const out = [], ls = raw.split('\n');
  let b = 0;
  ls.forEach((l, i) => { if (/^\s*\/\*\s*r18:begin\b/.test(l)) b = i + 1; else if (/^\s*\/\*\s*r18:end\b/.test(l) && b) { out.push([b, i + 1]); b = 0; } });
  return out;
}
/* 表示名：地の文の先頭（R18 の語・体の語の印を含まない、日本語の文字列）。台詞（「…」）は入れない：
   台詞の断片が箱庭以外のかたまり（この一覧の pack-catalog）に載ると、口調の書き下ろしの行き先（build-tone.js の②：その台詞が1つの箱庭のかたまりにだけある）が変わるため */
function cleanHead(code) {
  if (!code) return '';
  const re = /'((?:[^'\\\n]|\\.){6,})'|"((?:[^"\\\n]|\\.){6,})"/g;
  let m;
  while ((m = re.exec(code))) {
    let s = (m[1] || m[2] || '').replace(/\\(.)/g, '$1');
    if (!JP.test(s) || BM.EXPLICIT.test(s) || /\{[^{}a-z]+\}/.test(s)) continue;
    s = s.split('|')[0].replace(/\[[^\]]*\]/, '').split(/[「『]/)[0].replace(/[＠@].*$/, '').replace(/\{sibs?(?::[^}]*)?\}/g, '…').replace(/\s+/g, ' ').replace(/^[：、。，・／\s（）()]+/, '').trim();
    s = s.replace(/[（(「『、・／\s]+$/, '');
    /* 文の途中から始まる断片（a.name + 'の…' のような連結の後半）は使わない */
    if (s.length < 6 || !/\{[ab]\}|[。、]/.test(s) || /^[）)」』、。・／のがをにはとでもへやかけ]/.test(s)) continue;
    return s.length > 30 ? s.slice(0, 30) + '…' : s;
  }
  return '';
}

/* ---------- 印のコメント ---------- */
function parseMarks(srcs) {
  const ev = [], tables = [];
  Object.keys(srcs).sort().forEach(f => {
    const s = srcs[f];
    if (s.indexOf('@event') < 0) return;
    const re = /\/\*\s*@event(-table)?\s+([\s\S]*?)\*\//g;
    let m;
    while ((m = re.exec(s))) {
      const o = { f, line: lineOf(s, m.index) }, body = m[2].replace(/\s+/g, ' ').trim();
      const parts = body.split(/\s+(?=[a-z]+=)/);
      parts.forEach(p => { const k = p.match(/^([a-z]+)=(.*)$/); if (k) o[k[1]] = k[2].trim(); });
      if (!o.scen) continue;
      o.scens = o.scen.split(',').map(x => x.trim()).filter(Boolean);
      (m[1] ? tables : ev).push(o);
    }
  });
  return { ev, tables };
}
function resolvePath(HK, p) {
  let v = HK;
  String(p || '').split('.').forEach(k => { v = v == null ? v : v[k]; });
  return v;
}

/* ---------- 分類 ---------- */
const DEATH_K = { kill: 1, shinju: 1, madness: 1, raid: 1, wipe: 1, night: 1, grudge: 1 };
const CRUEL_K = { harm: 1, cage: 1, assault: 1 };
const AX_LABEL = { force: '合意のない展開', preg: '妊娠', violence: '暴力をともなう性描写', abuse: '歪んだ関係（DV など）', death: '死ネタ', cruel: '残酷な展開' };
const R18_AX = { force: 1, preg: 1, violence: 1, abuse: 1 };
const DK_LABEL = { kill: '死', shinju: '心中', madness: '発狂', raid: '襲撃', wipe: '全滅', night: '夜の襲撃', grudge: '恨みの殺し', harm: '危害', cage: '監禁', assault: '襲われる', fall: '堕ち', breakup: '別れ', cheat: '浮気', heartbreak: '失恋', spite: '恨み' };
const GLOBAL_ENV_SKIP = { heavy: 1, death: 1, ct: 1, tieEv: 1, romance: 1, strife: 1, chaos: 1, incident: 1, mobYou: 1, poly: 1 };
const TAGS_OK = { night: 1, mob: 1, force: 1, preg: 1, violence: 1, abuse: 1, death: 1, cruel: 1 };
function listOf(v) { return v == null || v === '' ? [] : Array.isArray(v) ? v.map(String) : String(v).split(/[,、\s]+/).filter(Boolean); }
function envLabel(scen, HK, id) {
  const f = x => Array.isArray(x) ? x.find(e => e && e.id === id) : null;
  const e = f(scen && scen.env) || f(HK.GLOBAL_ENV);
  return e ? { label: e.label, opt: e.options } : null;
}
function classify(o, ctx) {
  const { KEYS, TIES, HK, scen, safeBuild } = ctx;
  const when = [o.src.when, o.src.w, o.src.ok, o.src.cond, o.src.can].filter(Boolean).join('\n');
  const run = o.src.run || '';
  const all = when + '\n' + run;
  const out = { ties: [], m: '-', conds: [], ax: {}, night: false, mob: false };
  /* 関係 */
  const mark = o.tie != null ? o.tie : o.ties;
  if (mark != null) {
    const l = listOf(mark).filter(k => k !== '-').map(k => ALIAS[k] || k).filter(k => KEYS.has(k));
    out.ties = l; out.m = 'a';
  } else {
    let s = new Set();
    /* id の決まり（ファイルの分担で決めた頭）と、関係の出来事の id に入った関係の鍵（tie_master_r18・om_tie_boss・tie_rc_<箱庭>_<鍵>_…） */
    if (o.id) {
      for (const [re, k] of ID_RULE) if (re.test(o.id)) { if (KEYS.has(k)) s.add(k); break; }
      const segs = String(o.id).split('_');
      if (!s.size && (segs[0] === 'tie' || /^(?:om|zb|rt|rc)$/.test(segs[0]) || segs.indexOf('tie') >= 0 || /^om_tie/.test(o.id))) {
        for (let i = 1; i < segs.length; i++) { const k = ALIAS[segs[i]] || segs[i]; if (KEYS.has(k) && (k.length >= 3 || segs[0] === 'tie')) { s.add(k); break; } }
      }
      if (s.size) out.m = 'c';
    }
    if (!s.size) { s = tieKeysIn(when, KEYS); if (s.size) out.m = 'b'; }
    if (!s.size && o.snip) { s = tieKeysIn(o.snip, KEYS); if (s.size) out.m = 'd'; }
    out.ties = Array.from(s);
  }
  out.ties.sort((a, b) => ctx.TORD(a) - ctx.TORD(b));
  /* 印 */
  const tags = new Set(listOf(o.tags).filter(t => TAGS_OK[t]));
  /* 夜・モブ */
  const sexy = !!(o.sex || o.lewd || o.r18 === true && /sex|lewd|Ero|night|Thick/i.test(run)) || /\bHK\.(?:EroTop|ThickSex|Ero)\b|\bsexEv\s*\(|\bHK\.Thick\b/.test(run) || tags.has('night');
  out.mob = tags.has('mob') || /(?:^|_)(?:mob|mobr|assault|raid|raider|prey|looter)(?:_|$)/.test(o.id || '') || /\bHK\.Mob\b|\bmobSexOk\b|\bmobHit\b|\bZ\.Cover\b|\bMob\.pick\b/.test(all);
  /* 内容の軸 */
  const ax = out.ax;
  const cAll = new Set();
  all.replace(/\bContent\.(?:ok|on)\s*\([^()]*?,\s*'(force|preg|violence|abuse)'/g, (m0, t) => { cAll.add(t); return m0; });
  all.replace(/\bon\s*\(\s*(?:ctx|S|env|x)\s*,\s*'(force|preg|violence|abuse)'\s*\)/g, (m0, t) => { cAll.add(t); return m0; });
  if (o.force) cAll.add('force');
  /* R18 だけ：印・R18専用のファイル・r18 の印の中・全年齢モードで外す条件・内容のスイッチ（全年齢では常に切）を見る出来事 */
  out.r18 = !safeBuild && !!(o.r18 || o.sex || o.lewd || o.r18file || o.inR18 || /HK\.SAFE_ON/.test(when) || tags.has('night') || ['force', 'preg', 'violence', 'abuse'].some(t => tags.has(t)) || cAll.size);
  out.night = !safeBuild && out.r18 && (sexy || (out.mob && (cAll.has('force') || tags.has('force'))));
  cAll.forEach(t => { ax[t] = 1; });
  ['force', 'preg', 'violence', 'abuse', 'death', 'cruel'].forEach(t => { if (tags.has(t)) ax[t] = 1; });
  const dks = new Set();
  all.replace(/\bDark\.(?:f|live|skip|on|pick|endings|tag)\s*\([^()]*?'([a-z]+)'\s*\)/g, (m0, k) => { if (DK_LABEL[k]) dks.add(k); return m0; });
  if (typeof o.dk === 'string' && DK_LABEL[o.dk]) dks.add(o.dk);
  if (/\b(?:ctx|S|this|A)\.kill\s*\(|\bkill\s*\(\s*(?:ctx|S)\s*,|\b(?:C|core)\.die\s*\(|\.alive\s*=\s*false/.test(run)) dks.add('kill');
  dks.forEach(k => { if (DEATH_K[k]) ax.death = 1; if (CRUEL_K[k]) ax.cruel = 1; });
  if (ax.violence) ax.cruel = 1;
  if (safeBuild || !out.r18) Object.keys(R18_AX).forEach(t => { if (ax[t] && safeBuild) delete ax[t]; });
  /* 条件（短い語） */
  const C = out.conds;
  Object.keys(R18_AX).forEach(t => { if ((cAll.has(t) || tags.has(t)) && !safeBuild) C.push(AX_LABEL[t]); });
  if (/'dark'/.test(when) && /(?:Dark\.on|\bheavy\b|D\.on)/.test(when)) C.push('重い');
  const envs = [];
  when.replace(/\b(?:env|ctx\.env|S\.env)\.([a-zA-Z]\w*)(?:\s*(>=|>|<=|<|===|!==|==)\s*(\d+|'[^']*'))?/g, (m0, id, op, v) => {
    if (GLOBAL_ENV_SKIP[id] || envs.some(e => e.id === id)) return m0;
    const L = envLabel(scen, HK, id);
    if (!L) return m0;
    let t = L.label;
    if (op && v != null) {
      if (/^\d/.test(v)) t += ' ' + v + ({ '>=': ' 以上', '>': ' 超', '<=': ' 以下', '<': ' 未満', '===': '', '==': '' }[op] || '');
      else { const vv = v.replace(/'/g, ''), opt = (L.opt || []).find(x => x && (x.v === vv || x.id === vv)); t += (op === '!==' ? '≠' : '：') + (opt ? opt.label : vv); }
    }
    envs.push({ id, t });
    return m0;
  });
  envs.forEach(e => C.push('環境値：' + e.t));
  if (out.night) {
    if (/\bokSex\b|\bcanReceive\b|\bcanTop\b|\bcanBottom\b/.test(when)) C.push('受け攻め');
    if (/\blust\b|\blibido\b|\.horny\b|性欲/.test(when)) C.push('性欲');
  }
  out.ties.forEach(k => C.push('関係：' + TIES[k]));
  if (out.mob) C.push('モブ');
  return out;
}

/* ---------- 一覧を作る ---------- */
function make(dir, opt) {
  opt = opt || {};
  dir = path.resolve(dir);
  const t0 = Date.now();
  const safeBuild = opt.safeBuild != null ? opt.safeBuild : isSafeBuild(dir);
  const V = runAll(dir, { safeBuild });
  const HK = V.HK;
  const otherJs = path.join(dir, '..', safeBuild ? 'hakoniwa-full' : 'hakoniwa-zenrei', 'js');
  const fullOnly = f => !safeBuild && fs.existsSync(otherJs) && !fs.existsSync(path.join(otherJs, path.basename(f)));
  /* 関係の鍵（並びは HK.TIE_ORDER、その後ろは鍵の順） */
  const TIES = {};
  Object.keys(HK.TIES || {}).forEach(k => { TIES[k] = HK.TIES[k].label || k; });
  if (!TIES.comrade) TIES.comrade = '仲間';
  /* 同一人物（関係の一覧の「同一人物」。HK.TIES には無い） */
  if (!TIES.same) TIES.same = '同一人物';
  const KEYS = new Set(Object.keys(TIES));
  const ORD = (HK.TIE_ORDER || []).filter(k => KEYS.has(k)).concat(Object.keys(TIES).filter(k => (HK.TIE_ORDER || []).indexOf(k) < 0).sort());
  const TORD = k => { const i = ORD.indexOf(k); return i < 0 ? 999 : i; };
  const CATN = Object.assign({}, HK.CAT_NAME || {}, { incident: 'ハプニング' });
  const marks = parseMarks(V.srcs);
  const raw = {};   /* ファイル → 生のソース（r18 の範囲を見る） */
  const rawOf = f => raw[f] != null ? raw[f] : (raw[f] = fs.existsSync(path.join(dir, f)) ? fs.readFileSync(path.join(dir, f), 'utf8') : '');
  const files = [], fileIx = f => { let i = files.indexOf(f); if (i < 0) { files.push(f); i = files.length - 1; } return i; };
  const evs = [], evKey = new Map();
  const S = HK.SCENARIOS || {};
  const order = (HK.SCEN_ORDER || []).filter(id => S[id]).concat(Object.keys(S).filter(id => (HK.SCEN_ORDER || []).indexOf(id) < 0).sort());
  const base = e => { let x = e; for (let i = 0; i < 6; i++) { const p = Object.getPrototypeOf(x); if (!p || p === Object.prototype || p.id !== x.id) break; x = p; } return x; };
  /* 出どころの当て直し：かたまりの読み終わり（HK.Load.onChunk の取り付け役）で足された出来事や、生まれたファイルに id が書かれていない出来事は、
     id の引用（'xx_yy'）か工場の鍵名（yy:）が書かれたファイルにする */
  const LIT = new Map(), KEYN = new Map();
  Object.keys(V.srcs).forEach(f => {
    const s = V.srcs[f];
    s.replace(/'([a-z][A-Za-z0-9_]{2,})'/g, (m0, k) => { if (!LIT.has(k)) LIT.set(k, f); return m0; });
    s.replace(/[{,]\s*([a-z][A-Za-z0-9]{3,})\s*:\s*\{/g, (m0, k) => { if (!KEYN.has(k)) KEYN.set(k, f); return m0; });
  });
  const fileFor = (id, f0) => {
    if (!id) return f0;
    if (f0) return V.srcs[f0] && !defSnippet(V.srcs[f0], id) && LIT.has(id) ? LIT.get(id) : f0;
    if (LIT.has(id)) return LIT.get(id);
    const segs = String(id).split('_');
    for (let k = segs.length - 1; k >= 1; k--) { const x = segs.slice(k).join('_'); if (KEYN.has(x)) return KEYN.get(x); if (x.length >= 4 && LIT.has(x)) return LIT.get(x); }
    return '';
  };
  const descr = (e, scen, extra) => {
    const b0 = V.born.get(e) || { f: '', src: srcOf(e) }, b = { f: fileFor(e.id, /^@/.test(b0.f) ? '' : b0.f), src: b0.src };
    const src = Object.assign({}, b.src);
    /* 後から包まれた条件も読む（元の文字列の後ろに足す） */
    const now = srcOf(e);
    Object.keys(now).forEach(k => { if (src[k] !== now[k]) src[k] = (src[k] ? src[k] + '\n' : '') + now[k]; });
    const f = b.f || (extra && extra.f) || '';
    const s0 = f ? V.srcs[f] : '';
    const sn = defSnippet(s0, e.id);
    let inR18 = false;
    if (sn && f && !safeBuild) {
      const rs = r18Ranges(rawOf(f)), r = rawOf(f), at = r.indexOf(sn.text.slice(0, 40));
      if (at >= 0) { const ln = lineOf(r, at); inR18 = rs.some(([a, z]) => ln > a && ln < z); }
    }
    return { id: e.id, src, snip: sn && sn.text, snipExact: !!(sn && sn.exact), f, tie: e.tie, ties: e.ties, tags: e.tags, sex: e.sex, lewd: e.lewd, r18: e.r18, force: e.force, dk: e.dk, r18file: f && fullOnly(f), inR18,
      label: typeof e.label === 'string' ? e.label : typeof e.name === 'string' ? e.name : typeof e.title === 'string' ? e.title : '', cat: e.cat, scope: e.scope };
  };
  /* 箱庭ごとに当てはまらない出来事（when の箱庭の指定） */
  /* 内容のスイッチの出来事が出ない箱庭（content-events-r18.js の NO_SCEN） */
  let NO_SCEN = {};
  try { const m = (V.srcs['js/content-events-r18.js'] || '').match(/\bNO_SCEN\s*=\s*(\{[^}]*\})/); if (m) NO_SCEN = Function('return ' + m[1])(); } catch (e) { NO_SCEN = {}; }
  const notHere = (d, id) => {
    const w = [d.src.when, d.src.w].filter(Boolean).join('\n');
    let m;
    const reNe = /scen(?:\.id|Id)\s*!==\s*'(\w+)'|scenOf\(ctx\)\s*!==\s*'(\w+)'/g;
    while ((m = reNe.exec(w))) { const x = m[1] || m[2]; if (/return false/.test(w.slice(m.index, m.index + 160)) && x !== id) return true; if (!/return false/.test(w.slice(m.index, m.index + 160)) && x === id && /&&/.test(w.slice(Math.max(0, m.index - 40), m.index + 40))) return true; }
    const reEq = /scen(?:\.id|Id)\s*===\s*'(\w+)'\)\s*return false/g;
    while ((m = reEq.exec(w))) if (m[1] === id) return true;
    if (/scen\.id\s*===\s*id\b/.test(w)) { const mm = String(d.id).match(/_([a-z]+)$/); if (mm && S[mm[1]] && mm[1] !== id) return true; }
    if ((/\bNO_SCEN\[scenOf\(ctx\)\]/.test(w) || d.f === 'js/content-events-r18.js') && NO_SCEN[id]) return true;
    return false;
  };
  const scen = {}, poolIds = {};   /* poolIds：箱庭ごとの出来事の山とハプニングの id（箱庭の指定で外す前。--headless の突き合わせ用） */
  const cctx = { KEYS, TIES, HK, TORD, safeBuild };
  const addEv = (d, sc, kind) => {
    const k = d._obj || d;
    if (evKey.has(k)) return evKey.get(k);
    cctx.scen = sc;
    const c = classify(d, cctx);
    let cat = d.cat;
    if (kind === 'incident') cat = 'incident';
    const label = d.label || cleanHead(d.src.run) || (d.snipExact ? cleanHead(d.snip) : '') || '';
    const o = { i: d.id || '', n: label, k: cat || '', t: c.ties, m: c.m, c: c.conds.filter(x => !/^関係：/.test(x) && x !== 'モブ'), f: d.f ? fileIx(d.f) : -1 };
    if (c.r18) o.r = 1;
    if (c.night) o.x = 1;
    if (c.mob) o.mo = 1;
    const ax = Object.keys(c.ax).filter(t => !(safeBuild && R18_AX[t])).sort();
    if (ax.length) o.a = ax;
    if (d.pair) o.p = 1;
    evs.push(o);
    evKey.set(k, evs.length - 1);
    return evs.length - 1;
  };
  order.forEach(id => {
    const s = S[id], info = { name: s.name || id, story: !!s.simulate, ev: [], tables: [] };
    if (!s.simulate) {
      let pool = [];
      try { pool = HK.buildPool(s) || []; } catch (e) { info.err = String(e && e.message || e); }
      const seen = new Set();
      pool.forEach(e0 => {
        if (!e0 || typeof e0 !== 'object') return;
        const e = base(e0);
        if (seen.has(e)) return;
        seen.add(e);
        (poolIds[id] = poolIds[id] || []).push(String(e.id || ''));
        const d = descr(e, s); d._obj = e;
        if (notHere(d, id)) return;
        info.ev.push(addEv(d, s, 'event'));
      });
      ((HK.INCIDENTS || {})[id] || []).forEach(e => { if (!e || seen.has(e)) return; seen.add(e); (poolIds[id] = poolIds[id] || []).push(String(e.id || '')); const d = descr(e, s); d._obj = e; info.ev.push(addEv(d, s, 'incident')); });
    }
    scen[id] = info;
  });
  /* 印のコメント（コードで書いた場面） */
  marks.ev.forEach(mk => {
    mk.scens.forEach(id => {
      const info = scen[id];
      if (!info) return;
      const d = { id: mk.id || '', label: mk.label || mk.id || '', cat: mk.cat || '', tie: mk.tie != null ? mk.tie : undefined, tags: mk.tags, src: { when: mk.cond || '' }, f: mk.f, r18file: fullOnly(mk.f), inR18: false };
      if (!safeBuild) { const rs = r18Ranges(rawOf(mk.f)), r = rawOf(mk.f), at = r.indexOf('@event'); if (at >= 0) { const ln = mk.line; d.inR18 = rs.some(([a, z]) => ln > a && ln < z) || d.r18file; } }
      d._obj = mk;
      const ix = addEv(d, S[id], 'mark');
      if (mk.n) evs[ix].nn = +mk.n || undefined;
      if (info.ev.indexOf(ix) < 0) info.ev.push(ix);
    });
  });
  /* 印の付いた表（数だけ、または行ごと） */
  marks.tables.forEach(mk => {
    const v = resolvePath(HK, mk.path);
    const n = Array.isArray(v) ? v.length : v && typeof v === 'object' ? Object.keys(v).length : 0;
    mk.scens.forEach(id => {
      const info = scen[id];
      if (!info) return;
      info.tables.push({ n: mk.label || mk.path, c: n, k: mk.cat || '', p: mk.pair ? 1 : 0, f: fileIx(mk.f), note: mk.note || '' });
      if (mk.rows && Array.isArray(v)) v.forEach((row, ri) => {
        if (!row || typeof row !== 'object') return;
        const d = { id: row.id || mk.path + '[' + ri + ']', label: typeof row.name === 'string' ? row.name : typeof row.label === 'string' ? row.label : typeof row.title === 'string' ? row.title : '', cat: mk.cat || '', tie: row.tie != null ? row.tie : mk.tie, tags: row.tags || mk.tags, src: srcOf(row), f: mk.f, r18file: fullOnly(mk.f), inR18: false };
        if (!d.label) { const t = Array.isArray(row.t) ? row.t[0] : row.t; if (typeof t === 'string') d.label = cleanHead("'" + t.replace(/'/g, '’') + "'"); }
        d._obj = row;
        const ix = addEv(d, S[id], 'row');
        if (info.ev.indexOf(ix) < 0) info.ev.push(ix);
      });
    });
  });
  /* 表示側の見込み（content-events-r18.js の表）と、実際の出来事の食い違い */
  const judge = safeBuild ? null : judgeTables(V.srcs['js/content-events-r18.js'] || '', V.srcs['js/content.js'] || '');
  /* R18 が題材の箱庭（content.js の CORE）：合意のない展開はいつも入 */
  let CORE = {};
  try { const m = (V.srcs['js/content.js'] || '').match(/CORE:\s*(\{[^}]*\})/); if (m) CORE = Function('return ' + m[1])(); } catch (e) { CORE = {}; }
  Object.keys(scen).forEach(id => {
    const info = scen[id], A = {};
    Object.keys(AX_LABEL).forEach(t => {
      if (safeBuild && R18_AX[t]) return;
      const l = info.ev.filter(i => (evs[i].a || []).indexOf(t) >= 0);
      const need = { sw: 0, dark: 0 };
      l.forEach(i => { const c = evs[i].c; if (R18_AX[t] && c.indexOf(AX_LABEL[t]) >= 0) need.sw++; if (c.indexOf('重い') >= 0) need.dark++; });
      /* R18 の内容は、内容のスイッチが入のときだけ（スイッチの定義。R18 が題材の箱庭の合意のない展開はいつも入）。死ネタ・残酷は重さで増減するだけ */
      const always = t === 'force' && CORE[id];
      const st = !l.length ? 'no' : (R18_AX[t] && !always) || need.dark === l.length ? 'cond' : 'yes';
      const notes = [];
      if (l.length && R18_AX[t]) notes.push(always ? '題材なので、いつも入' : 'スイッチ「' + AX_LABEL[t] + '」が入のとき');
      if (l.length && need.dark) notes.push('重いのとき' + (need.dark === l.length ? 'だけ' : '：' + need.dark + '件'));
      if (t === 'death' && S[id] && S[id].lethal === true) notes.push('体力が尽きると死ぬ箱庭（出来事の外でも死が起きる）');
      const o = { s: st, n: l.length };
      if (notes.length) o.t = notes.join('・');
      if (judge && R18_AX[t]) { const j = judge(t, id, S[id]); o.j = j.s; o.jt = j.t; if ((j.s === 'no') !== (l.length === 0)) o.d = 1; }
      A[t] = o;
    });
    info.ax = A;
  });
  const data = { v: 1, build: safeBuild ? 'zenrei' : 'full', ties: ORD.map(k => [k, TIES[k]]), cats: CATN, files, ev: evs, scen, order: Object.keys(scen) };
  return { data, raw: poolIds, ms: Date.now() - t0, errs: V.R.errs, HK };
}
/* content-events-r18.js の表（ENG・HATE・OBS・MOBF・PREG_STORY・NO_SCEN）と content.js の CORE を読んで、表示側の判定を写す（いちばん起きやすい設定のとき） */
function judgeTables(src, csrc) {
  const obj = name => { const m = src.match(new RegExp('\\b' + name + '\\s*=\\s*(\\{[^}]*\\})')); if (!m) return {}; try { return Function('return ' + m[1])(); } catch (e) { return {}; } };
  const ENG = obj('ENG'), HATE = obj('HATE'), OBS = obj('OBS'), MOBF = obj('MOBF'), PS = obj('PREG_STORY'), NO = obj('NO_SCEN');
  const cm = csrc.match(/CORE:\s*(\{[^}]*\})/); let CORE = {};
  try { CORE = cm ? Function('return ' + cm[1])() : {}; } catch (e) { CORE = {}; }
  return (tag, id, sc) => {
    const solo = !!(sc && sc.solo);
    if (tag === 'preg') { const st = PS[id]; if (st === 'any') return { s: 'yes', t: 'いつも（疑似妊娠）' }; if (NO[id] || (!st && solo)) return { s: 'no', t: '妊娠の場面なし' }; return { s: 'cond', t: '重いのとき' }; }
    if (tag === 'force') { if (CORE[id]) return { s: 'yes', t: '題材（いつも入）' }; if (id === 'saimin') return { s: 'yes', t: '同意のない催眠' }; if (MOBF[id]) return { s: 'yes', t: MOBF[id] + 'に襲われる' }; if (id === 'jinro') return { s: 'cond', t: '人狼が勝ったとき' }; if (!ENG[id]) return { s: 'no', t: '場面なし' }; return { s: HATE[id] || OBS[id] ? 'cond' : 'cond', t: '関係（敵対・執着・主従・歪んだ関係）しだい' }; }
    if (tag === 'violence') { if (id === 'yakata') return { s: 'cond', t: '快楽殺人の動機' }; if (!ENG[id] || id === 'classroom') return { s: 'no', t: '場面なし' }; return { s: 'cond', t: '重いのとき' }; }
    if (tag === 'abuse') { if (id === 'saimin') return { s: 'cond', t: '重いのとき' }; if (!ENG[id]) return { s: 'no', t: 'スイッチで足す場面なし（関係としては出る）' }; return { s: 'cond', t: '関係「歪んだ関係」か、重いとき' }; }
    return { s: 'yes', t: '' };
  };
}

/* ---------- 書き出し ---------- */
const AX_ORDER = ['force', 'preg', 'violence', 'abuse', 'death', 'cruel'];
function toJs(data) {
  /* 鍵の順を固定した JSON（出来事は1行に1つ） */
  const j = v => JSON.stringify(v).replace(/</g, '\\u003c').replace(/\u2028/g, '\\u2028').replace(/\u2029/g, '\\u2029');
  const head = '/* 箱庭シミュレーター：出来事の一覧のデータ（自動で作るファイル。手で直さない）\n' +
    '   hakoniwa-tools/build/event-catalog.js が build のたびに作り直す（build.js から呼ぶ）。数え方と印の付け方は docs/reports/2026-10-28/event-catalog.md。画面は event-catalog-ui.js。\n' +
    '   ev：出来事 { i: id, n: 表示名, k: 種類, t: [関係の鍵], m: 分類の方法（a 印・b 条件の文字列・d 定義の文字列・c id・- 拾えない）, c: [条件（関係・モブは t・mo から足す）], f: 出どころ（files の番号）, r: R18 だけ, x: 夜, mo: モブ, a: [内容の軸], p: 職業×職業 }\n' +
    '   scen：箱庭 { name, story（物語型）, ev: [ev の番号], tables: [{ n: 表の名前, c: 件数, k: 種類, p: 職業×職業 }], ax: { 軸: { s: yes/cond/no, n: 件数, t: 注記, j: 表示側の見込み } } } */\n';
  const sc = Object.keys(data.scen).map(id => '  ' + j(id) + ': ' + j(data.scen[id])).join(',\n');
  /* 出来事は1行に3つ（ファイルを 2000 行以下に保つため。出来事が増えても行数は 3 分の 1） */
  const evl = [];
  for (let i = 0; i < data.ev.length; i += 3) evl.push('  ' + data.ev.slice(i, i + 3).map(j).join(', '));
  const ev = evl.join(',\n');
  return head + '(function () {\n  var HK = window.HK;\n  if (!HK) return;\n  HK.EVENT_CATALOG = { v: ' + data.v + ', build: ' + j(data.build) + ', ties: ' + j(data.ties) + ', cats: ' + j(data.cats) + ',\n files: ' + j(data.files) + ',\n order: ' + j(data.order) + ',\n scen: {\n' + sc + '\n },\n ev: [\n' + ev + '\n ] };\n})();\n';
}
const esc = s => String(s == null ? '' : s).replace(/\|/g, '｜').replace(/\n/g, ' ');
function toMd(data) {
  const L = [], E = data.ev, T = {}; data.ties.forEach(([k, l]) => { T[k] = l; });
  const full = data.build === 'full';
  L.push('## ' + (full ? 'R18版（hakoniwa-full）' : '全年齢版（hakoniwa-zenrei）'));
  L.push('');
  L.push('箱庭 ' + data.order.length + ' 個・出来事 ' + E.length + ' 件（同じ出来事が複数の箱庭に出るときは1件）。分類の方法：a 印／b 条件の文字列／d 定義の文字列／c id／- 拾えない（関係を問わない）。');
  L.push('');
  /* 全体の表：箱庭 × 件数 */
  L.push('| 箱庭 | 型 | 出来事 | 関係が条件 | 関係を問わない | ' + (full ? '夜（R18） | うちモブ | ' : '') + AX_ORDER.filter(t => full || !R18_AX[t]).map(t => AX_LABEL[t]).join(' | ') + ' | 表（数だけ） |');
  L.push('|' + ' --- |'.repeat(5 + (full ? 2 : 0) + AX_ORDER.filter(t => full || !R18_AX[t]).length + 1));
  data.order.forEach(id => {
    const s = data.scen[id], ev = s.ev.map(i => E[i]);
    const tied = ev.filter(e => e.t.length).length;
    const ax = AX_ORDER.filter(t => full || !R18_AX[t]).map(t => { const a = s.ax[t]; return a ? (a.n ? a.n + (a.s === 'cond' ? '（条件つき）' : '') : 'なし') + (a.d ? ' ※' : '') : '-'; });
    L.push('| ' + esc(s.name) + ' | ' + (s.story ? '物語型' : 'エンジン型') + ' | ' + ev.length + ' | ' + tied + ' | ' + (ev.length - tied) + ' | ' + (full ? ev.filter(e => e.x).length + ' | ' + ev.filter(e => e.x && e.mo).length + ' | ' : '') + ax.join(' | ') + ' | ' + (s.tables.map(t => esc(t.n) + ' ' + t.c + (t.p ? '組' : '件')).join('、') || '-') + ' |');
  });
  L.push('');
  if (full) {
    L.push('※ は、内容のスイッチの表示側（content-events-r18.js の HK.Content.judge の表）の見込みと、数えた出来事が食い違うもの（表示側は「なし」なのに出来事がある、または表示側は「ある」なのに印の付いた出来事が見つからない）。');
    L.push('');
  }
  data.order.forEach(id => {
    const s = data.scen[id], ev = s.ev.map(i => E[i]);
    L.push('### ' + esc(s.name) + '（' + id + '）');
    L.push('');
    const rows = {};
    ev.forEach(e => { (e.t.length ? e.t : ['-']).forEach(k => { (rows[k] = rows[k] || []).push(e); }); });
    L.push('| 関係 | 件数 | 主な出来事 |');
    L.push('| --- | --- | --- |');
    data.ties.map(x => x[0]).concat(['-']).forEach(k => {
      const l = rows[k];
      if (!l) return;
      L.push('| ' + (k === '-' ? '関係を問わない' : esc(T[k])) + ' | ' + l.length + ' | ' + l.slice(0, 4).map(e => esc(e.n || e.i) + (e.n ? '（' + esc(e.i) + '）' : '') + (e.m !== '-' ? '〔' + e.m + '〕' : '')).join('、') + (l.length > 4 ? ' ほか' : '') + ' |');
    });
    L.push('');
    const cats = {};
    ev.forEach(e => { const k = e.k || '-'; cats[k] = (cats[k] || 0) + 1; });
    L.push('種類：' + Object.keys(cats).sort((a, b) => cats[b] - cats[a] || (a < b ? -1 : 1)).map(k => (data.cats[k] || k) + ' ' + cats[k]).join('・'));
    if (full) {
      const nights = ev.filter(e => e.x), g = {};
      nights.forEach(e => { const cs = e.c.concat(e.t.map(k => '関係：' + T[k])); const key = (e.mo ? 'モブ' : '住人どうし') + '｜' + (cs.join('・') || '条件の印なし'); g[key] = (g[key] || 0) + 1; });
      if (nights.length) { L.push(''); L.push('R18：夜 ' + nights.length + ' 件：' + Object.keys(g).sort((a, b) => g[b] - g[a] || (a < b ? -1 : 1)).map(k => k.replace('｜', '〔') + '〕 ' + g[k]).join('、')); }
    }
    const axn = AX_ORDER.filter(t => s.ax[t]).map(t => { const a = s.ax[t]; return AX_LABEL[t] + '：' + (a.n ? a.n + '件' : 'なし') + (a.t ? '（' + a.t + '）' : '') + (a.j ? '〔表示側：' + ({ yes: 'ある', cond: '条件つき', no: 'なし' }[a.j]) + (a.jt ? '・' + a.jt : '') + '〕' : '') + (a.d ? ' ※食い違い' : ''); });
    L.push('');
    L.push('内容の軸：' + axn.join('／'));
    if (s.tables.length) { L.push(''); L.push('表（数だけ）：' + s.tables.map(t => esc(t.n) + ' ' + t.c + (t.p ? '組（職業×職業）' : '件') + (t.note ? '（' + esc(t.note) + '）' : '')).join('、')); }
    if (s.story) { L.push(''); L.push('物語型：場面は関数で書かれていて、印（@event／@event-table）の付いたものだけを数えています。印の無い手書きの場面は入っていません。'); }
    L.push('');
  });
  return L.join('\n');
}
const MD_HEAD = '# 出来事の一覧（箱庭ごと・関係ごと・R18 の夜）\n\n' +
  'このファイルは `hakoniwa-tools/build/event-catalog.js` が build のたびに書き直します（各ビルドの節は `<!-- catalog:<ビルド>:begin -->`〜`end` の間だけ。冒頭の決まりは手で直してよい）。画面では、箱庭カードの「この箱庭のTIPS」の隣の「出来事の一覧」から同じ表が見られます。\n\n' +
  '## 新しい出来事を足すときの決まり\n\n' +
  '- 出来事は build のたびに自動で数え直されます（`node hakoniwa-tools/build/build.js <ビルド>` の中で `js/event-catalog.js` とこのファイルを作り直す）。手で追記しません。\n' +
  '- 関係が条件の出来事は、`when` に `HK.Ties.has(ctx, a, b, \'master\')` のように関係の鍵をそのまま書けば拾われます。補助の関数（`is(k)`・`o.roles(…)` など）で隠れるときは、出来事に `tie: \'master\'`（複数なら `\'lover,fwb\'` か配列。関係を問わないと明示するなら `\'-\'`）を付けます。\n' +
  '- 夜・モブ・内容のスイッチ・死ネタ・残酷は、`sex: true`／`r18: true`・`HK.Content.ok(ctx, \'force\')`・`HK.Dark.f(ctx, \'kill\')`・`ctx.kill(…)` から拾います。拾えない書き方なら `tags: [\'night\', \'mob\', \'force\', \'preg\', \'violence\', \'abuse\', \'death\', \'cruel\']` から当てはまるものを付けます（文や動きは変えない）。\n' +
  '- 表示名は `label` が無ければ、run の最初の文の先頭 30 字です。分かりにくければ `label: \'…\'` を付けます。\n' +
  '- 物語型の箱庭（場面を関数で書くもの）は、場面の近くに 1 行のコメントを書くと数えられます：`/* @event scen=jashin id=jn_god_night cat=夜 tie=- tags=night,mob,force label=神に捧げられる夜 */`。表（配列・オブジェクト）は `/* @event-table scen=jashin path=JASHIN.DUO_EV label=二人の場面 */`（`pair=1` は職業×職業の表として数だけ、`rows=1` は行ごとに一覧へ）。\n' +
  '- R18 の場面の印は、R18専用のファイルか `/* r18:begin */`〜`/* r18:end */` の中に書きます（全年齢版のビルドでは読まれません）。\n' +
  '- 足したら build を回し、`js/event-catalog.js` の差分（その出来事が入ったか）を確かめてコミットします。\n\n' +
  '## 数え方と限界\n\n' +
  '- 数は仕組みが数えた「出来事の種類」の数で、文の本数ではありません。同じ出来事が複数の箱庭に出るときは、箱庭ごとに数えます。\n' +
  '- エンジン型の箱庭は、その箱庭の出来事の山（`HK.buildPool`）とハプニング（`HK.INCIDENTS`）。物語型の箱庭は、印の付いた場面と表だけです（手書きの場面は入らない）。\n' +
  '- 関係の判定は文字列からの推定です（分類の方法の記号を見てください）。「関係を問わない」には、関係の条件が補助の関数に隠れていて拾えなかったものも入ります。\n' +
  '- 邪神村・吹雪の館・オメガバースの職業の掛け合わせ（職業×職業の表）は、組の数だけを出します。\n';
function writeMd(data) {
  let md = fs.existsSync(OUT_MD) ? fs.readFileSync(OUT_MD, 'utf8') : MD_HEAD;
  const b = '<!-- catalog:' + data.build + ':begin -->', e = '<!-- catalog:' + data.build + ':end -->';
  const block = b + '\n' + toMd(data) + '\n' + e;
  if (md.indexOf(b) >= 0) md = md.replace(new RegExp(b + '[\\s\\S]*?' + e), () => block);
  else md = md.replace(/\s*$/, '\n\n') + block + '\n';
  fs.mkdirSync(path.dirname(OUT_MD), { recursive: true });
  fs.writeFileSync(OUT_MD, md);
}
/* build.js から：作って書く（中身が同じなら書かない）。戻り値は報告の一行 */
function build(dir, opt) {
  const r = make(dir, opt), js = toJs(r.data), p = path.join(path.resolve(dir), OUT_JS);
  const same = fs.existsSync(p) && fs.readFileSync(p, 'utf8') === js;
  if (!same) fs.writeFileSync(p, js);
  writeMd(r.data);
  const d = r.data, nd = Object.keys(d.scen).reduce((a, id) => a + Object.keys(d.scen[id].ax).filter(t => d.scen[id].ax[t].d).length, 0);
  return { line: '出来事の一覧 ' + d.order.length + '箱庭・' + d.ev.length + '件（' + Math.round(Buffer.byteLength(js) / 1024) + 'KB・' + r.ms + 'ms' + (same ? '・変わらず' : '・作り直し') + (nd ? '・表示側との食い違い ' + nd + '件' : '') + '）', errs: r.errs, data: d };
}
module.exports = { make, build, toJs, toMd, classify, tieKeysIn };

if (require.main === module) {
  const args = process.argv.slice(2).filter(a => !/^--/.test(a)), flags = process.argv.slice(2).filter(a => /^--/.test(a));
  const dir = path.resolve(args[0] || 'hakoniwa-full');
  if (flags.indexOf('--print') >= 0) {
    const r = make(dir), d = r.data;
    d.order.forEach(id => { const s = d.scen[id]; console.log(id.padEnd(10), String(s.ev.length).padStart(4), '関係', s.ev.filter(i => d.ev[i].t.length).length, '夜', s.ev.filter(i => d.ev[i].x).length); });
    console.log(r.ms + 'ms', r.errs.length ? '例外 ' + r.errs.length : '');
  } else if (flags.indexOf('--headless') >= 0) {
    require('./event-catalog-headless.js').check(dir, make(dir)).then(code => process.exit(code));
  } else {
    const r = build(dir);
    console.log(path.basename(dir) + '：' + r.line);
    if (r.errs.length) { console.warn('※ vm の例外 ' + r.errs.length + ' 件'); r.errs.slice(0, 5).forEach(e => console.warn('  ' + e)); }
  }
}
