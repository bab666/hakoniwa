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
const TOPICS = require('./topics-sample.js');

/* ---------- ページの中：点検の配役の関係を住人の設定に写す（2026-11-05） ----------
   恋愛と夜の可否は住人の設定（恋愛にしない相手 loveNo・R18にしない相手 r18No）で決める形になったので、点検が「止める組」として配役した関係を、
   以前の既定のとおり住人の設定に写す（画面の読み込みの写し HK.tieLoveMigrate より広い：自動の既定も写す。点検の意図を保つため）
   ・恋愛：なし → 恋愛にしない／家族（恋愛：ありでない）→ 恋愛・R18にしない（loveNG）／執着（信仰）の「発展しない」・教師と生徒の自動 → 恋愛にしない
   ・無関心 → 恋愛：ありなら R18にしない、ほかは恋愛・R18にしない／恐怖 → 恋愛も体の関係も「あり」でなければ恋愛・R18にしない、体の関係だけありなら恋愛にしない、恋愛だけありなら R18にしない／体の関係：なし → R18にしない
   ・恐怖の「体の関係：あり」→ 互いの体の相手（性行為の相手の固定）にする（ui-norm.js の HK.tieLoveMigrate と同じ） */
const LEGACY = function (HK, input) {
  const C = input.chars || [], T = HK.TIES || {};
  if (input._legacy) return; input._legacy = true;
  const add = (x, y, f) => { const c = C[x]; if (!c) return; c[f] = Array.isArray(c[f]) ? c[f].slice() : []; if (c[f].indexOf(y) < 0) c[f].push(y); };
  const both = (t, f) => { add(t.a, t.b, f); add(t.b, t.a, f); };
  const rom = {};
  (input.ties || []).forEach(t => { if (t && /^(lover|spouse|fiance|honmei|crush|mate|fated|fwb|almost|ex)$/.test(t.type)) rom[Math.min(t.a, t.b) + '-' + Math.max(t.a, t.b)] = 1; });
  (input.ties || []).forEach(t => {
    if (!t || t.a === t.b || !C[t.a] || !C[t.b]) return;
    const D = T[t.type] || {}, ok = t.love === 'ok', k = Math.min(t.a, t.b) + '-' + Math.max(t.a, t.b);
    if (t.love === 'no') both(t, 'loveNo');
    /* 以前 noLove（恋愛にも体の関係にもならない）で止めていた組は「恋愛・R18にしない相手」（loveNG）に */
    if (D.family && !D.loveOK && !ok) both(t, 'loveNG');
    if (D.loveOpt && !ok && !(t.type === 'worship' && t.cold === 'dominate')) both(t, 'loveNo');
    if (D.loveSoft && !ok && !rom[k] && t.type !== 'worship') both(t, 'loveNo');
    if (t.type === 'apathy') both(t, ok ? 'r18No' : 'loveNG');
    if (t.type === 'fear') { if (!ok && t.body !== 'ok') both(t, 'loveNG'); else if (!ok) both(t, 'loveNo'); else if (t.body !== 'ok') both(t, 'r18No'); }
    if (t.body === 'no') both(t, 'r18No');
    /* 恐怖の「体の関係：あり」→ 互いの「体の相手」（性行為の相手の固定＋モブ。固定が空の人だけ）にする（恐怖の二人は和らぐまで合意の夜を起こさない。体の相手に固定した二人だけ夜が起きる） */
    if (t.type === 'fear' && t.body === 'ok') [[t.a, t.b], [t.b, t.a]].forEach(q => { const c = C[q[0]]; if (c && (c.sexLock === '' || c.sexLock == null)) { c.sexLock = [q[1]]; c.sexLockMob = true; } });
  });
};

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
    /* 見本の話題（audit/topics-sample.js）：話題の文も検査に当たるように、パスの opt.topics が真のときだけ入れる（audit-all.js の topics-* のパス。ほかのパスの回は変えない） */
    if (run.input && plan.pass.opt && plan.pass.opt.topics && A.topicsFor) { try { A.topicsFor(run.input); } catch (e) { A.jerr.push('見本の話題: ' + String(e).slice(0, 200)); } }
    /* 2026-11-05：恋愛と夜の可否は住人の設定で決める（ties.js の HK.TIE_LOVE_GATE が偽）。点検の配役の関係が前提にしている「止める組」
       （関係の「恋愛：なし」・家族と信仰の自動・無関心・恐怖・体の関係：なし）を、住人の「恋愛にしない相手」「R18にしない相手」に写してから回す（A.legacyTies） */
    if (run.input && HK.TIE_LOVE_GATE === false) { try { A.legacyTies(HK, run.input); } catch (e) { A.jerr.push('legacyTies: ' + String(e).slice(0, 200)); } }
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
    'var P = A.P, J = A.J;\n' + parts.join('\n') + '\nA.topicsFor = (' + TOPICS.ADD.toString() + ');\nA.legacyTies = (' + LEGACY.toString() + ');\nA.run = (' + RUN.toString() + ');\nA.finish = (' + FINISH.toString() + ');\n})()';
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
