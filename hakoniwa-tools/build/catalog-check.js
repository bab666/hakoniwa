/* 箱庭シミュレーター：出来事の一覧（js/event-catalog.js・js/c/pack-catalog.*・docs/reports/2026-10-28/event-catalog.md）の点検
   node hakoniwa-tools/build/catalog-check.js [--base <rev>]（引数なしで両ビルドを見る。--base は比べる相手のコミット。ふだんは HEAD）
   出来事を足したら build のあとで回し、0 件にしてからコミットする（CLAUDE.md の決まり）。問題があれば終了コード 1
   見ること
     (a) 一覧が古い：今の js から event-catalog.js の生成関数（make・toJs・mdText）で作り直した結果と、各ビルドの js/event-catalog.js・
         目録の pack-catalog のかたまり（js/c/.prev.json の今の名前。index.html がそれを指すか・中のデータが同じか）・md（冒頭と各ビルドの節）が一致しない。build 全体は回さない
     (b) 表示名の無い出来事（表示名が空、または日本語を含まない＝id のまま）
     (c) 印の無い新しい場面
         ① 比べる相手（HEAD）の一覧に無い新しい出来事のうち、表示名が印（label・@labels・@event）でなく本文から自動で拾われたもの
         ② 変わった js（git diff <base> --name-only と未追跡のファイル）のうち、場面の書き方が増えたのに印が増えていないファイル
            場面の書き方：夜の場面の記録 kind: 'climax'・出来事や場面の記録の sex: true・ログの見出し tag: '…' の新しい語（生成器が夜・場面として拾う形）
            印：@event・@event-table・@labels の行・日本語の label:・@event-ok。そのファイルから新しい出来事が一覧に入っていれば ① で見るので数えない
            既にある出来事の言い回し・分岐を足しただけなら、そのファイルに 1 行 /* @event-ok <何を足したか> *\/ を書く（数えなくなる）
     (d) 参考（数えない）：比べる相手の一覧と今の一覧の差（足された出来事・消えた出来事・表示名が変わった出来事。出る箱庭つき）。足した出来事が全件入ったかを確かめる */
'use strict';
const fs = require('fs'), path = require('path'), vm = require('vm');
const { execFileSync } = require('child_process');
const EC = require('./event-catalog.js');

const ROOT = path.resolve(__dirname, '../..');
const BUILDS = ['hakoniwa-full', 'hakoniwa-zenrei'];
const BNAME = { 'hakoniwa-full': 'R18版', 'hakoniwa-zenrei': '全年齢版' };
const argv = process.argv.slice(2);
const bi = argv.indexOf('--base'), BASE = bi >= 0 && argv[bi + 1] ? argv[bi + 1] : 'HEAD';
const git = args => { try { return execFileSync('git', ['-C', ROOT].concat(args), { encoding: 'utf8', maxBuffer: 1 << 29, stdio: ['ignore', 'pipe', 'ignore'] }); } catch (e) { return null; } };
const rd = p => fs.existsSync(p) ? fs.readFileSync(p, 'utf8') : null;

/* 一覧のデータのファイル・かたまりを vm で読んで HK.EVENT_CATALOG を取り出す */
function evalCatalog(code) {
  if (code == null) return null;
  const HK = { Load: { def: (n, f, fn) => fn(), done: () => { } } };
  const win = { HK };
  try { vm.runInNewContext(code, { window: win, HK }, { timeout: 20000 }); } catch (e) { return { err: String(e && e.message || e) }; }
  return HK.EVENT_CATALOG || null;
}
const keyOf = (d, e) => e.i || '?' + e.n + '@' + (d.files[e.f] || '');
const scenNames = (d, ix) => d.order.filter(id => d.scen[id].ev.indexOf(ix) >= 0).map(id => d.scen[id].name);
const nm = s => String(s || '').replace(/\{a\}/g, 'Ａ').replace(/\{b\}/g, 'Ｂ').replace(/\{c\}/g, 'Ｃ');
const show = e => '「' + (nm(e.n) || '（表示名なし）') + '」（' + (e.i || 'id なし') + '）';

/* 場面の書き方と印を数える（(c)②） */
const JPS = '[\\u3040-\\u30ff\\u4e00-\\u9fff]';
function shapes(s) {
  s = s || '';
  const n = re => (s.match(re) || []).length;
  const heads = new Set();
  s.replace(/\btag:\s*'([^'\\\n]{1,40})'/g, (m, t) => { heads.add(t); return m; });
  let labels = 0;
  s.replace(/\/\*\s*@labels\b([\s\S]*?)\*\//g, (m, b) => { labels += b.split('\n').filter(l => /^\s*[A-Za-z0-9_*]+\s*=\s*\S/.test(l)).length; return m; });
  /* sex: true は、出来事・場面の記録のオブジェクト（cat・text・label・tag を持つ）の中だけ数える（romanceOk(…, { sex: true }) の指定や、型の計画のオブジェクトは数えない） */
  const sex = (s.match(/\{[^{}]*\bsex:\s*true\b[^{}]*\}/g) || []).filter(o => /\b(?:cat|text|label|tag):/.test(o)).length;
  return { climax: n(/\bkind:\s*['"]climax['"]/g), sex, heads, marks: n(/@event(?:-table)?\s/g) + n(/@event-ok\b/g) + labels + n(new RegExp("\\blabel:\\s*'[^'\\n]*" + JPS, 'g')) };
}
function judge(oldSrc, newSrc) {
  const a = shapes(oldSrc), b = shapes(newSrc);
  const newHeads = Array.from(b.heads).filter(h => !a.heads.has(h));
  const d = { climax: b.climax - a.climax, sex: b.sex - a.sex, heads: newHeads.length };
  return { scene: Math.max(0, d.climax) + Math.max(0, d.sex) + d.heads, marks: b.marks - a.marks, d, newHeads };
}

function main() {
  const problems = [], out = [];
  const bad = (kind, text) => { problems.push(kind); out.push('  ※ ' + text); };
  const made = {}, olds = {};
  const t0 = Date.now();
  BUILDS.forEach(b => {
    const dir = path.join(ROOT, b);
    if (!fs.existsSync(path.join(dir, 'js/_order.txt'))) return;
    try { made[b] = EC.make(dir); } catch (e) { bad('a', BNAME[b] + '：一覧を作り直せませんでした（' + (e && e.message || e) + '）'); }
    olds[b] = evalCatalog(git(['show', BASE + ':' + b + '/js/event-catalog.js']));
    if (olds[b] && olds[b].err) olds[b] = null;
  });

  /* (a) 一覧が古い */
  out.push('(a) 一覧が今の js から作り直した結果と同じか');
  const before = problems.length;
  BUILDS.filter(b => made[b]).forEach(b => {
    const dir = path.join(ROOT, b), d = made[b].data, js = EC.toJs(d);
    if (rd(path.join(dir, EC.OUT_JS)) !== js) bad('a', BNAME[b] + '：' + b + '/js/event-catalog.js が古い（build で作り直してください）');
    /* 目録の pack-catalog のかたまり */
    let prev = null;
    try { prev = JSON.parse(rd(path.join(dir, 'js/c/.prev.json')) || 'null'); } catch (e) { prev = null; }
    const cn = prev && prev.cur && prev.cur['pack-catalog'];
    if (!cn) bad('a', BNAME[b] + '：js/c/.prev.json に pack-catalog のかたまりがありません（build してください）');
    else {
      const code = rd(path.join(dir, 'js/c', cn)), html = rd(path.join(dir, 'index.html')) || '';
      if (code == null) bad('a', BNAME[b] + '：かたまり js/c/' + cn + ' がありません（build してください）');
      else {
        const got = evalCatalog(code), want = evalCatalog(js);
        if (!got || got.err) bad('a', BNAME[b] + '：かたまり js/c/' + cn + ' から一覧のデータを読めません' + (got && got.err ? '（' + got.err + '）' : ''));
        else if (JSON.stringify(got) !== JSON.stringify(want)) bad('a', BNAME[b] + '：かたまり js/c/' + cn + ' の一覧が古い（build で作り直してください）');
      }
      if (html.indexOf(cn) < 0) bad('a', BNAME[b] + '：index.html の目録が今の pack-catalog（' + cn + '）を指していません（build してください）');
    }
  });
  const mdCur = rd(EC.OUT_MD);
  if (mdCur == null) bad('a', 'md（docs/reports/2026-10-28/event-catalog.md）がありません（build してください）');
  else {
    const want = BUILDS.filter(b => made[b]).reduce((m, b) => EC.mdText(m, made[b].data), mdCur);
    if (want !== mdCur) {
      const part = (s, b) => { const i = s.indexOf('<!-- catalog:' + b + ':begin -->'), j = s.indexOf('<!-- catalog:' + b + ':end -->'); return i < 0 || j < 0 ? '' : s.slice(i, j); };
      const head = s => s.slice(0, Math.max(0, s.indexOf('<!-- catalog:')));
      if (head(want) !== head(mdCur)) bad('a', 'md の冒頭（決まり）が event-catalog.js の MD_HEAD と違う（build で作り直してください。決まりを変えるなら MD_HEAD を直す）');
      BUILDS.filter(b => made[b]).forEach(b => { if (part(want, made[b].data.build) !== part(mdCur, made[b].data.build)) bad('a', 'md の' + BNAME[b] + 'の節が古い（' + b + ' の build で作り直してください）'); });
      if (problems.length === before) bad('a', 'md が今の一覧と違う（build で作り直してください）');
    }
  }
  if (problems.length === before) out.push('  同じ（js/event-catalog.js・pack-catalog・md）');

  /* (b) 表示名の無い出来事 */
  out.push('(b) 表示名の無い出来事');
  const b0 = problems.length;
  BUILDS.filter(b => made[b]).forEach(b => {
    const d = made[b].data;
    d.ev.forEach((e, ix) => { if (!EC.hasName(e)) bad('b', BNAME[b] + '：表示名の無い出来事 ' + show(e) + '（' + (d.files[e.f] || '出どころ不明') + '・' + scenNames(d, ix).join('・') + '）：label: か @labels で、内容の分かる 8〜25 字の日本語を付けてください'); });
  });
  if (problems.length === b0) out.push('  なし');

  /* (c) 印の無い新しい場面 */
  out.push('(c) 印の無い新しい場面（比べる相手：' + BASE + '）');
  const c0 = problems.length;
  const newEv = {};   /* ビルド → 新しい出来事 [{ e, ix }] */
  BUILDS.filter(b => made[b]).forEach(b => {
    const d = made[b].data, od = olds[b];
    if (!od) { out.push('  ' + BNAME[b] + '：' + BASE + ' に一覧がないので、新しい出来事は数えません'); return; }
    const ok = new Set(od.ev.map(e => keyOf(od, e)));
    newEv[b] = d.ev.map((e, ix) => ({ e, ix })).filter(x => !ok.has(keyOf(d, x.e)));
  });
  /* ① 表示名が自動で拾われた新しい出来事（両ビルドにあるものは 1 回） */
  const seen1 = {};
  BUILDS.filter(b => newEv[b]).forEach(b => {
    const d = made[b].data, by = made[b].labelBy || [];
    newEv[b].forEach(({ e, ix }) => {
      if (by[ix] !== 'auto') return;
      const k = keyOf(d, e).replace(/@js\//, '@');
      if (seen1[k]) { seen1[k].both = true; return; }
      seen1[k] = { b, e, ix, d };
    });
  });
  Object.keys(seen1).forEach(k => {
    const x = seen1[k];
    bad('c', (x.both ? '両ビルド' : BNAME[x.b]) + '：印の無い新しい出来事 ' + show(x.e) + '（' + (x.d.files[x.e.f] || '') + '・' + scenNames(x.d, x.ix).join('・') + '）：表示名が本文から自動で拾われています。label: か @labels で付けてください');
  });
  /* ② 場面の書き方が増えたのに印が増えていないファイル */
  const changed = new Set();
  [git(['diff', BASE, '--name-only']), git(['ls-files', '--others', '--exclude-standard'])].forEach(s => (s || '').split('\n').forEach(f => {
    f = f.trim();
    if (/^hakoniwa-(?:full|zenrei)\/js\/[^/]+\.js$/.test(f) && !/\/event-catalog\.js$/.test(f) && fs.existsSync(path.join(ROOT, f))) changed.add(f);
  }));
  const seen2 = {};
  Array.from(changed).sort().forEach(f => {
    const b = f.split('/')[0], base = 'js/' + path.basename(f);
    const j = judge(git(['show', BASE + ':' + f]) || '', rd(path.join(ROOT, f)));
    if (j.scene <= 0 || j.marks > 0) return;
    /* そのファイルから新しい出来事が一覧に入った（① と (d) で見る） */
    if ((newEv[b] || []).some(x => made[b].data.files[x.e.f] === base)) return;
    const what = [];
    if (j.d.climax > 0) what.push("夜の場面の記録 kind: 'climax' +" + j.d.climax);
    if (j.d.sex > 0) what.push('sex: true +' + j.d.sex);
    if (j.d.heads) what.push('新しい見出し「' + j.newHeads.slice(0, 6).join('」「') + '」' + (j.newHeads.length > 6 ? 'ほか' : ''));
    const k = base + '|' + what.join('、');
    if (seen2[k]) { seen2[k].both = true; return; }
    seen2[k] = { f, b, what };
  });
  Object.keys(seen2).forEach(k => {
    const x = seen2[k];
    bad('c', '印の無い新しい場面の可能性：' + (x.both ? x.f.replace(/^hakoniwa-(?:full|zenrei)\//, '') + '（両ビルド）' : x.f) + '（増えたもの：' + x.what.join('、') + '）：新しい出来事なら @event／label の印を付け、既にある出来事の言い回し・分岐を足しただけなら、そのファイルに /* @event-ok <何を足したか> */ を 1 行書いてください');
  });
  if (problems.length === c0) out.push('  なし（変わった js ' + changed.size + ' 本を見ました）');

  /* (d) 参考：比べる相手の一覧との差 */
  out.push('(d) 参考：' + BASE + ' の一覧との差（足した出来事が全件入ったかを確かめる。数えない）');
  BUILDS.filter(b => made[b]).forEach(b => {
    const d = made[b].data, od = olds[b];
    if (!od) { out.push('  ' + BNAME[b] + '：' + BASE + ' に一覧がありません'); return; }
    const nk = new Map(d.ev.map((e, ix) => [keyOf(d, e), ix])), ok = new Map(od.ev.map((e, ix) => [keyOf(od, e), ix]));
    const add = [], del = [], ren = [];
    nk.forEach((ix, k) => { if (!ok.has(k)) add.push(ix); else if (od.ev[ok.get(k)].n !== d.ev[ix].n) ren.push([ok.get(k), ix]); });
    ok.forEach((ix, k) => { if (!nk.has(k)) del.push(ix); });
    if (!add.length && !del.length && !ren.length) { out.push('  ' + BNAME[b] + '：差はありません（' + d.ev.length + ' 件）'); return; }
    out.push('  ' + BNAME[b] + '：' + od.ev.length + ' 件 → ' + d.ev.length + ' 件（足された ' + add.length + '・消えた ' + del.length + '・表示名が変わった ' + ren.length + '）');
    add.forEach(ix => out.push('    + ' + show(d.ev[ix]) + '〔' + scenNames(d, ix).join('・') + '〕'));
    del.forEach(ix => out.push('    - ' + show(od.ev[ix]) + '〔' + scenNames(od, ix).join('・') + '〕'));
    ren.forEach(([oi, ix]) => out.push('    ~ ' + (d.ev[ix].i || '') + '：「' + nm(od.ev[oi].n) + '」→「' + nm(d.ev[ix].n) + '」'));
  });

  console.log(out.join('\n'));
  console.log('（' + Math.round((Date.now() - t0) / 100) / 10 + '秒）');
  const per = k => problems.filter(x => x === k).length;
  console.log('catalog-check：' + problems.length + ' 件' + (problems.length ? '（一覧が古い ' + per('a') + '・表示名なし ' + per('b') + '・印の無い新しい場面 ' + per('c') + '）' : ''));
  return problems.length ? 1 : 0;
}
module.exports = { shapes, judge, evalCatalog };
if (require.main === module) process.exit(main());
