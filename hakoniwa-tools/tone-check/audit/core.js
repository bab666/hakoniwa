/* 点検の共通の枠組み（2026-10-29 担当MQ。設計は docs/reports/2026-10-29/audit-consolidation.md）
   ・パス（pass）：配役・環境値・seed の決め方。ページの中で動く生成関数 function* (HK, opt) が、回（run）を一つずつ返す。
       run = { sc: 箱庭, s: 回の番号, input: HK.simulate に渡すもの, meta: 判定が使う配役の印 }。
       input の代わりに special（関数）を持つ回は、simulate せずにその関数を呼ぶ（画面の点検など）
   ・判定（judge）：ページの中で動く工場関数 function (HK, opt) が { begin(run), end(run, res), error(run, e), finish() } を返す。
       記録を書く途中を見る判定（state の Ctx.say の包みなど）は、工場関数の中で一度だけ包む。finish() の戻り値が、その道具の結果（今までの out）
   ・回の組み立てがほかと違う点検（name-audit の双子の回）は、パスが special の回を 1 つ返し、判定の special() が道具のページの関数（fns）を丸ごと呼ぶ
   ・道具のファイル（orient-audit.js など）は { passes: {id: 生成関数}, judges: {id: 工場関数}, summarize(out) } を module.exports で出し、
     単独で起動したときは runTool() で自分のパスと判定だけを回す（中身は audit-all と同じ関数）
   ・1 枚のページで、複数のパスを順に回せる。判定の工場は 1 ページに 1 回だけ作り、パスをまたいで数え続ける */
'use strict';
const { openBuild } = require('../lib.js');

/* ---------- ページの中：1 パスを回す ---------- */
const RUN = function (plan) {
  const HK = window.HK, A = window.__AUD;
  /* 体の語の印の列（lib.js の lewdMode と同じ。パスごとに、元の道具と同じ設定に戻す） */
  const lm = plan.lewdMode;
  if (HK.LewdWords) HK.LewdWords.MODE = lm === 'none' ? null : lm ? lm : A.mode0;
  const act = [];
  plan.judges.forEach(j => {
    let x = A.inst[j.key];
    if (!x) {
      try { x = A.inst[j.key] = A.J[j.id](HK, j.opt || {}); }
      catch (e) { A.jerr.push(j.key + ' の準備: ' + String(e && e.stack || e).slice(0, 400)); return; }
    }
    act.push({ key: j.key, own: !!j.own, x });
  });
  const stat = { runs: 0, err: 0, ms: 0 };
  const t0 = performance.now();
  let gen;
  try { gen = A.P[plan.pass.id](HK, plan.pass.opt || {}); } catch (e) { A.jerr.push(plan.pass.id + ' のパス: ' + String(e && e.stack || e).slice(0, 400)); return stat; }
  const call = (o, k, run, v) => { const f = o.x[k]; if (!f) return; try { f(run, v); } catch (e) { if (A.jerr.length < 50) A.jerr.push(o.key + '.' + k + ' ' + run.pass + ' ' + run.sc + '#' + run.s + ': ' + String(e && e.stack || e).slice(0, 400)); } };
  for (const run of gen) {
    run.pass = plan.pass.id;
    /* 判定を当てる：自分のパス（own）は全部、ほかのパスは判定の accept（なければ当てる）で決める */
    const on = act.filter(o => o.own || !o.x.accept || o.x.accept(run));
    if (run.special) { on.forEach(o => call(o, 'special', run)); continue; }
    on.forEach(o => call(o, 'begin', run));
    let res;
    try { res = HK.simulate(run.input); }
    catch (e) { stat.err++; on.forEach(o => call(o, 'error', run, e)); on.forEach(o => call(o, 'after', run)); continue; }
    stat.runs++;
    on.forEach(o => call(o, 'end', run, res));
    on.forEach(o => call(o, 'after', run));
  }
  stat.ms = Math.round(performance.now() - t0);
  return stat;
};
const FINISH = function (keys) {
  const A = window.__AUD, out = {};
  keys.forEach(k => { const x = A.inst[k]; if (!x) return; try { out[k] = x.finish ? x.finish() : null; } catch (e) { A.jerr.push(k + '.finish: ' + String(e && e.stack || e).slice(0, 400)); } });
  return { out, jerr: A.jerr.slice() };
};

/* 道具の定義（mods：require した道具のファイルの配列）をページに入れる */
async function inject(page, mods) {
  const parts = [];
  mods.forEach(m => {
    Object.keys(m.passes || {}).forEach(id => parts.push('P[' + JSON.stringify(id) + '] = (' + m.passes[id].toString() + ');'));
    Object.keys(m.judges || {}).forEach(id => parts.push('J[' + JSON.stringify(id) + '] = (' + m.judges[id].toString() + ');'));
    /* 判定から呼ぶページの中の関数（name-audit のように、1 回の special の中で今までの点検を丸ごと回すもの） */
    Object.keys(m.fns || {}).forEach(id => parts.push('A.F[' + JSON.stringify(id) + '] = (' + m.fns[id].toString() + ');'));
  });
  const src = '(function () { var A = window.__AUD; if (!A) { A = window.__AUD = { P: {}, J: {}, F: {}, inst: {}, jerr: [], mode0: window.HK && window.HK.LewdWords ? window.HK.LewdWords.MODE : null }; }\n' +
    'var P = A.P, J = A.J;\n' + parts.join('\n') + '\nA.run = (' + RUN.toString() + ');\nA.finish = (' + FINISH.toString() + ');\n})()';
  await page.evaluate(src);
}

/* モード（r18／safe／''）のページを開く。lib.js の openBuild と同じ（体の語の印はパスごとに RUN が決める） */
async function openMode(dir, mode) {
  const hash = mode === 'safe' ? 'safe' : mode === 'r18' ? 'r18' : '';
  return openBuild(dir, hash);
}

/* 1 枚のページで、パスの並び（steps：[{ pass: {id, opt}, judges: [{id, key, opt, own}], lewdMode }]）を順に回す。
   onStep(i, stat) で進み具合を知らせる。戻り値：{ out: {判定の key: 結果}, jerr, stats } */
async function runSteps(page, mods, steps, onStep) {
  await inject(page, mods);
  const stats = [];
  for (let i = 0; i < steps.length; i++) {
    const t0 = Date.now();
    const st = await page.evaluate(plan => window.__AUD.run(plan), steps[i]);
    st.wall = Date.now() - t0;
    stats.push(st);
    if (onStep) onStep(i, st);
  }
  const keys = [...new Set([].concat(...steps.map(s => s.judges.map(j => j.key))))];
  const fin = await page.evaluate(k => window.__AUD.finish(k), keys);
  fin.stats = stats;
  return fin;
}

/* 体の語の印の列：環境変数 HK_LEWD_MODE があればそれ（lib.js と同じく道具の指定より優先）、なければ道具の指定（'direct' か ''） */
const lewdOf = m => process.env.HK_LEWD_MODE || m || '';

/* 単独の道具：自分のパスと判定だけを回して、判定の結果（今までの out）を返す */
async function runTool(o) {
  const { browser, page, errors } = await openBuild(o.dir, o.hash || '');
  try {
    const steps = o.steps || [{ pass: { id: o.pass, opt: o.opt }, judges: [{ id: o.judge, key: o.judge, opt: o.opt, own: true }], lewdMode: lewdOf(o.lewdMode) }];
    const fin = await runSteps(page, [o.mod], steps);
    if (fin.jerr.length) { console.error('判定の例外', fin.jerr.length); fin.jerr.slice(0, 5).forEach(x => console.error('  ' + x)); process.exitCode = 1; }
    return { r: fin.out[steps[0].judges[0].key], all: fin.out, errors, jerr: fin.jerr, stats: fin.stats };
  } finally { await browser.close(); }
}

module.exports = { RUN, FINISH, inject, openMode, runSteps, runTool, lewdOf };
