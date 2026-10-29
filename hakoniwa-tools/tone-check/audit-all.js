/* 点検の一式（2026-10-29 担当MQ。設計と所要時間は docs/reports/2026-10-29/audit-consolidation.md）
   使い方:
     node hakoniwa-tools/tone-check/audit-all.js                       # 既定の一式（R18版・全年齢モード・全年齢版。2 本並べて約 4 分）
     node hakoniwa-tools/tone-check/audit-all.js --modes=r18           # モードを絞る（r18,safe,zen）
     node hakoniwa-tools/tone-check/audit-all.js --extra=sexgate,feud,group,state-hot,name  # 追加の配役パスも回す（--extra=all で全部）
     node hakoniwa-tools/tone-check/audit-all.js --only-extra --extra=group             # 追加の配役パスだけ
     node hakoniwa-tools/tone-check/audit-all.js --print=出力のフォルダ                 # 今までの道具の形の出力もパスごとに書く（単独実行の出力と同じになる）
     node hakoniwa-tools/tone-check/audit-all.js --cross                                # 判定をほかのパスの回にも当てる（調べもの用。誤判定を含む。下の注）
   ほかの指定：--jobs=1（ページを 1 枚ずつ。既定 2）、--scale=0.5（回数を一律に何倍にするか。seed の範囲が変わるので、件数は単独実行と比べられない）、
              --json=まとめ.json、--info（参考の数も全部出す）、--compat（misc を当てない＝統合前の道具と同じ判定だけ）、
              --full=…／--zen=…（ビルドのフォルダ。既定はこのリポジトリの hakoniwa-full・hakoniwa-zenrei）
   ・モードごとにページを開き（R18版 #r18・全年齢モード #safe・全年齢版）、パス（配役の決め方。今までの道具と同じ seed・配役）を順に回す。
     各判定は自分のパスの回に当てる（今までの道具の単独実行と同じ件数になる）。misc（使われなくなった小さな道具から取り込んだ文の崩れの判定）は自分のパスを持たず、全部のパスの回に当てる。
   ・--cross：orient・pos・state・loveflag・seg を、ほかのパスの回（配役の違う回）にも当てる。配役の印（NL_T など）に頼る項目は自分のパスだけ。
     ほかのパスの配役は、その判定が前提にしていない組み合わせ（不死の蘇り・モブの相手・恋愛対象「なし」と受け攻めの組 など）を含むので、
     0 でない項目は、まず判定の前提に合うかを確かめる（2026-10-29 の HEAD で出たものは docs/reports/2026-10-29/audit-consolidation.md）。
     qa・sexgate・feud・group は比率の点検なので、--cross でも自分のパスの回だけ。
   ・終了コード：0 件であるべき項目が 1 件でもある・シミュレーションの失敗・ページのエラー・判定の例外があれば 1 */
'use strict';
const path = require('path'), fs = require('fs');
const core = require('./audit/core.js');
const misc = require('./audit/misc.js');
const TOOLS = {
  orient: require('./orient-audit.js'), pos: require('./pos-audit.js'), state: require('./state-audit.js'), loveflag: require('./love-flag-audit.js'),
  seg: require('./seg-audit.js'), qa: require('./qa-audit.js'), sexgate: require('./sex-gate-audit.js'), feud: require('./feud-audit.js'), group: require('./group-audit.js'),
  name: require('./name-audit.js'),
  misc
};
const MODS = Object.keys(TOOLS).map(k => TOOLS[k]);
/* 判定の名前（まとめの見出し） */
const JNAME = { orient: '恋愛対象', pos: '受け攻め・体の語', state: '状態', loveflag: '恋愛：なし', seg: '台詞の区分', qa: '問いと返事', sexgate: '性的な出来事の門', feud: '不仲の組', group: '複数人の恋愛', name: '名前の言い換え', misc: '文の崩れ' };

/* ---------- パス（配役の決め方）：今までの道具の既定の回数と同じ。est は 1 回分の目安の秒数（ページの割り振りに使う） ---------- */
const PASSES = {
  orient: { tool: 'orient', id: 'orient', opt: { N: 40 }, lewd: 'direct', est: 40, out: m => 'orient-' + m },
  pos: { tool: 'pos', id: 'pos', opt: { N: 24 }, lewd: 'direct', est: 23, modes: ['r18'], out: () => 'pos-r18' },
  'pos-hot': { tool: 'pos', id: 'pos', opt: { N: 24, hot: true }, lewd: 'direct', est: 27, modes: ['r18'], out: () => 'pos-hot' },
  'pos-ffhot': { tool: 'pos', id: 'pos', opt: { N: 24, ff: true, hot: true }, lewd: 'direct', est: 23, modes: ['r18'], out: () => 'pos-ffhot' },
  state: { tool: 'state', id: 'state', opt: { N: 24 }, lewd: 'direct', est: 66, out: m => 'state-' + m },
  loveflag: { tool: 'loveflag', id: 'loveflag', opt: { N: 24 }, lewd: 'direct', est: 30, out: m => 'loveflag-' + m },
  seg: { tool: 'seg', id: 'seg', opt: { N: 10 }, lewd: '', est: 12, out: m => 'seg-' + m },
  qa: { tool: 'qa', id: 'qa', opt: { N: 12 }, lewd: '', est: 14, modes: ['r18', 'zen'], out: m => 'qa-' + m },
  /* 追加の配役パス（--extra） */
  sexgate: { tool: 'sexgate', id: 'sexgate', opt: { N: 24, cond: TOOLS.sexgate.COND }, lewd: 'direct', est: 165, modes: ['r18'], extra: true, out: () => 'sexgate-r18' },
  feud: { tool: 'feud', id: 'feud', opt: { N: 24 }, lewd: '', est: 28, modes: ['r18', 'zen'], extra: true, out: m => 'feud-' + m },
  group: { tool: 'group', id: 'group', opt: { N: 40 }, lewd: '', est: 24, modes: ['r18', 'zen'], extra: true, out: m => 'group-' + m },
  'state-hot': { tool: 'state', id: 'state', opt: { N: 24, hot: true }, lewd: 'direct', est: 66, extra: true, out: m => 'state-hot-' + m },
  name: { tool: 'name', id: 'name', opt: { N: 6 }, lewd: '', est: 22, extra: true, out: m => 'name-' + m }
};
const DEFAULT = ['orient', 'pos', 'pos-hot', 'pos-ffhot', 'state', 'loveflag', 'seg', 'qa'];
/* 判定：cross＝ほかのパスの回にも当てる。modes＝当てるモード */
const JUDGES = {
  orient: { cross: true, opt: () => ({ why: true }) },
  pos: { cross: true, modes: ['r18'], opt: () => ({}) },
  state: { cross: true, opt: m => ({ mode: m === 'zen' ? '' : m }) },
  loveflag: { cross: true, opt: c => ({ why: !c.compat }) },
  seg: { cross: true, opt: () => ({}) },
  misc: { cross: true, opt: () => ({}) },
  qa: { cross: false, opt: () => ({}) },
  sexgate: { cross: false, opt: () => ({ cond: TOOLS.sexgate.COND }) },
  feud: { cross: false, opt: () => ({}) },
  group: { cross: false, opt: () => ({}) },
  name: { cross: false, opt: () => ({}) }
};
const MODE = { r18: { name: 'R18版', build: 'full', mode: 'r18' }, safe: { name: '全年齢モード', build: 'full', mode: 'safe' }, zen: { name: '全年齢版', build: 'zen', mode: '' } };

function arg(name, def) { const a = process.argv.find(x => x.indexOf('--' + name + '=') === 0); return a ? a.slice(name.length + 3) : def; }
const has = name => process.argv.includes('--' + name);

/* ---------- 回す単位（ページ 1 枚ぶん）を作る ---------- */
function plan(o) {
  const units = [];
  o.modes.forEach(m => {
    let pl = (o.onlyExtra ? [] : DEFAULT).concat(o.extra).filter(p => PASSES[p] && (!PASSES[p].modes || PASSES[p].modes.indexOf(m) >= 0));
    if (!pl.length) return;
    /* 判定：このモードで当てるもの（比率の点検は、自分のパスがあるときだけ） */
    const mk = list => {
      const own = {}; list.forEach(p => { own[PASSES[p].tool] = 1; });
      const js = Object.keys(JUDGES).filter(j => (!JUDGES[j].modes || JUDGES[j].modes.indexOf(m) >= 0) && (own[j] || (j === 'misc' ? !o.compat && !o.noMisc : JUDGES[j].cross && o.cross)));
      return { mode: m, passes: list, judges: js, est: list.reduce((s, p) => s + PASSES[p].est, 0) * o.scale + 5 };
    };
    /* 2 本以上で回すときは、重いモードのパスを 2 枚のページに分ける（判定の結果はあとで足す） */
    const est = pl.reduce((s, p) => s + PASSES[p].est, 0);
    if (o.jobs >= 2 && est > 150 && pl.length > 1) {
      const a = [], b = []; let ea = 0, eb = 0;
      pl.slice().sort((x, y) => PASSES[y].est - PASSES[x].est).forEach(p => { if (ea <= eb) { a.push(p); ea += PASSES[p].est; } else { b.push(p); eb += PASSES[p].est; } });
      const ord = l => pl.filter(p => l.indexOf(p) >= 0);
      units.push(mk(ord(a)), mk(ord(b)));
    } else units.push(mk(pl));
  });
  return units;
}

async function runUnit(u, o, log) {
  const M = MODE[u.mode], dir = M.build === 'zen' ? o.zen : o.full;
  const t0 = Date.now();
  const { browser, page, errors } = await core.openMode(dir, M.mode);
  const steps = u.passes.map(p => {
    const P = PASSES[p], opt = Object.assign({}, P.opt);
    if (opt.N) opt.N = Math.max(1, Math.round(opt.N * o.scale));
    return {
      label: p,
      pass: { id: P.id, opt },
      lewdMode: core.lewdOf(P.lewd),
      /* pos は 3 つのパス（素・--hot・--ff --hot）を、--cross でなければパスごとに数える（今までの単独実行と同じ） */
      judges: u.judges.map(j => ({ id: j, key: !o.cross && j === 'pos' ? 'pos@' + p : j, opt: JUDGES[j].opt(j === 'state' ? u.mode : o, o), own: PASSES[p].tool === j }))
        .filter(j => j.own || j.id === 'misc' || o.cross)
    };
  });
  let fin;
  try {
    fin = await core.runSteps(page, MODS, steps, (i, st) => log('[' + M.name + '] ' + steps[i].label + '：' + st.runs + ' 回' + (st.err ? '（失敗 ' + st.err + '）' : '') + '・' + (st.wall / 1000).toFixed(1) + ' 秒'));
  } finally { await browser.close(); }
  fin.errors = errors; fin.sec = (Date.now() - t0) / 1000; fin.unit = u; fin.steps = steps;
  return fin;
}

/* ---------- まとめ ---------- */
function addInfo(a, b) { Object.keys(b || {}).forEach(k => { const v = b[k]; if (typeof v === 'number') a[k] = (a[k] || 0) + v; else if (v && typeof v === 'object' && !Array.isArray(v)) { a[k] = a[k] || {}; addInfo(a[k], v); } else if (a[k] == null) a[k] = v; }); }
function summarizeMode(m, fins) {
  const J = {};
  let runs = 0, err = 0, sec = 0; const perr = [], jerr = [];
  fins.forEach(f => {
    runs += f.stats.reduce((s, x) => s + x.runs, 0); err += f.stats.reduce((s, x) => s + x.err, 0); sec = Math.max(sec, f.sec);
    f.errors.forEach(e => perr.push(e)); f.jerr.forEach(e => jerr.push(e));
    Object.keys(f.out).forEach(key => {
      const id = key.split('@')[0], S = TOOLS[id].summarize(f.out[key] || {});
      const T = J[id] = J[id] || { items: {}, ex: {}, info: {}, err: 0, errEx: [] };
      Object.keys(S.items || {}).forEach(k => { T.items[k] = (T.items[k] || 0) + S.items[k]; T.ex[k] = (T.ex[k] || []).concat((S.ex && S.ex[k]) || []).slice(0, 3); });
      addInfo(T.info, S.info); T.err += S.err || 0; (S.errEx || []).forEach(x => T.errEx.length < 3 && T.errEx.push(x));
    });
  });
  return { mode: m, name: MODE[m].name, runs, err, perr, jerr, sec, judges: J };
}
function fmtInfo(info) {
  return Object.keys(info).map(k => { const v = info[k]; return k + ' ' + (v && typeof v === 'object' ? JSON.stringify(v) : v); }).join('・');
}
function report(sums, o) {
  let bad = 0;
  const lines = [];
  sums.forEach(S => {
    lines.push('== ' + S.name + '：シミュレーション ' + S.runs + ' 回' + (S.err ? '（失敗 ' + S.err + '）' : '') + (S.perr.length ? '・ページのエラー ' + S.perr.length : '') + (S.jerr.length ? '・判定の例外 ' + S.jerr.length : ''));
    Object.keys(S.judges).forEach(id => {
      const T = S.judges[id], L = TOOLS[id].LABEL || {}, ks = Object.keys(T.items);
      const nz = ks.filter(k => T.items[k] > 0);
      bad += nz.length;
      const cells = ks.map(k => k + ' ' + T.items[k]).join('・');
      lines.push('  ' + (JNAME[id] + '（' + id + '）').padEnd(16, '　') + ' ' + (ks.length ? (nz.length ? '★ ' + nz.length + ' 項目が 0 でない' : 'すべて 0 件') + '［' + cells + '］' : '（比率の点検）') + (T.err ? '・失敗 ' + T.err : ''));
      if (o.info || !ks.length) lines.push('      参考：' + fmtInfo(T.info));
      nz.forEach(k => {
        lines.push('    ★ ' + id + ' ' + k + '（' + (L[k] || '') + '）' + T.items[k] + ' 件');
        (T.ex[k] || []).forEach(x => lines.push('        例：' + String(x).replace(/\n/g, ' ').slice(0, 300)));
      });
      T.errEx.forEach(x => lines.push('        失敗：' + String(x).replace(/\n/g, ' ').slice(0, 200)));
    });
    S.perr.slice(0, 3).forEach(x => lines.push('  ページのエラー：' + String(x).slice(0, 200)));
    S.jerr.slice(0, 5).forEach(x => lines.push('  判定の例外：' + String(x).replace(/\n/g, ' ').slice(0, 300)));
    bad += S.err + S.perr.length + S.jerr.length;
  });
  return { lines, bad };
}

(async () => {
  const root = path.resolve(__dirname, '../..');
  const o = {
    full: path.resolve(arg('full', path.join(root, 'hakoniwa-full'))), zen: path.resolve(arg('zen', path.join(root, 'hakoniwa-zenrei'))),
    modes: arg('modes', 'r18,safe,zen').split(',').filter(m => MODE[m]),
    extra: (v => v === 'all' ? Object.keys(PASSES).filter(p => PASSES[p].extra) : v.split(',').filter(Boolean))(arg('extra', '')),
    onlyExtra: has('only-extra'), compat: has('compat'), cross: has('cross'), print: arg('print', ''), jobs: Math.max(1, +arg('jobs', 2) || 1), scale: +arg('scale', 1) || 1,
    json: arg('json', ''), info: has('info'), noMisc: has('no-misc')
  };
  const bad = o.extra.filter(p => !PASSES[p] || !PASSES[p].extra);
  if (bad.length) { console.error('知らない追加のパス：' + bad.join(',') + '（使えるもの：' + Object.keys(PASSES).filter(p => PASSES[p].extra).join(',') + '）'); process.exit(2); }
  const T0 = Date.now();
  const units = plan(o);
  const log = s => process.stderr.write(s + '\n');
  log('audit-all：' + units.length + ' 枚のページを ' + o.jobs + ' 本で回す' + (o.compat ? '（compat：misc なし）' : o.cross ? '（--cross：判定をほかのパスの回にも当てる）' : '') + (o.scale !== 1 ? '（回数 ×' + o.scale + '）' : ''));
  /* 重い順に、空いている本へ */
  const queue = units.slice().sort((a, b) => b.est - a.est), done = [];
  const worker = async () => { while (queue.length) { const u = queue.shift(); done.push(await runUnit(u, o, log)); } };
  await Promise.all(Array.from({ length: Math.min(o.jobs, units.length) }, worker));
  /* --print：今までの道具の形の出力（パスごとに 1 ファイル。--cross のときは書かない） */
  if (o.print) {
    fs.mkdirSync(o.print, { recursive: true });
    done.forEach(f => f.steps.forEach(st => {
      const P = PASSES[st.label], j = st.judges.filter(x => x.own)[0];
      if (!j || o.cross) return;
      const lines = [], cl = console.log; console.log = (...a) => lines.push(a.map(x => typeof x === 'string' ? x : require('util').inspect(x)).join(' '));
      try {
        const r = f.out[j.key], M = MODE[f.unit.mode], dir = M.build === 'zen' ? o.zen : o.full;
        const tool = TOOLS[P.tool];
        if (P.tool === 'pos') tool.print(r, f.errors, {});
        else if (P.tool === 'seg') tool.print(r, f.errors, { dir, mode: M.mode });
        else if (P.tool === 'qa') tool.print(r, f.errors, { ex: 25 });
        else if (P.tool === 'sexgate') tool.print(r, f.errors, { force: false, lib: 'high' });
        else if (P.tool === 'name') tool.print(r, f.errors, { dir, mode: M.mode });
        else tool.print(r, f.errors, {});
      } finally { console.log = cl; }
      fs.writeFileSync(path.join(o.print, P.out(f.unit.mode === 'zen' ? 'zen' : f.unit.mode) + '.txt'), lines.join('\n') + '\n');
    }));
  }
  const sums = o.modes.map(m => summarizeMode(m, done.filter(f => f.unit.mode === m))).filter(S => S.runs || Object.keys(S.judges).length);
  const R = report(sums, o);
  const sec = (Date.now() - T0) / 1000;
  console.log(R.lines.join('\n'));
  console.log('== まとめ：' + (R.bad ? '★ 0 件でない項目・失敗が ' + R.bad + ' 件' : 'すべて 0 件') + '（' + sums.map(S => S.name + ' ' + S.runs + ' 回').join('・') + '・所要 ' + sec.toFixed(0) + ' 秒）');
  if (o.json) fs.writeFileSync(o.json, JSON.stringify({ sec, bad: R.bad, modes: sums, stats: done.map(f => ({ mode: f.unit.mode, passes: f.unit.passes, sec: f.sec, steps: f.stats })) }, null, 1));
  process.exitCode = R.bad ? 1 : 0;
})().catch(e => { console.error(e && e.stack || e); process.exitCode = 1; });
