/* 一人称の置き換えの点検（2026-11-06。利用者の指摘「一人称を設定すると『冷めないうちに』の『うち』が『俺』になる」）
   使い方（リポジトリの根で）: node hakoniwa-tools/tone-check/fp-audit.js [hakoniwa-full] [--scen=whiteroom,locker,omega,massage] [--N=12] [--seeds=2000,21001]
                                 [--tones=口調,…] [--fps=俺,あたし,僕] [--jobs=3] [--why]
   住人全員に一人称を設定して（既定は 男「俺」・女「あたし」・性別なし「僕」。--fps=m,f,x で変える）、全口調 × 箱庭 × 回数を回し、
     (a) 一人称でない語の置き換え：V.replaceFP の前後を比べて実際に置き換わった語を拾い、前後の文脈から一人称でないもの
         （熟語の「私」＝公私・私物、前がひらがなの「わし」＝交わし、「うち」の置き換え、前が「お」・後ろが「に来」「に帰」など）を数える
     (b) 画面に残った印：結果（記録・結末・住人の欄）に {一人称}・{二人称}、または内部の 1 字の印（U+E0F1〜U+E0F3）が残った文
     (c) 一人称のブレ：同じ住人の話し手つきの台詞（e.seg の l・q）に、2 種類以上の一人称が出た（回 × 住人）
   を数える。3 つとも 0 件で合格（終了コード 0）。--why で例を出す。
   仕組みと決まりは docs/reports/2026-11-06/fp-marker-design.md。check.js の依存の表（hakoniwa-tools/check/table.js）から回る */
'use strict';
const path = require('path');
const { openBuild, buildUrl } = require('./lib.js');
const args = process.argv.slice(2), flags = args.filter(a => /^--/.test(a)), pos = args.filter(a => !/^--/.test(a));
const flag = (k, d) => { const f = flags.find(a => a.startsWith('--' + k + '=')); return f ? f.slice(k.length + 3) : d; };
const DIR = path.resolve(pos[0] || 'hakoniwa-full'), ZEN = /zenrei/.test(DIR);
const only = (flag('scen', '') || process.env.HK_ONLY_SCEN || '').split(',').filter(Boolean);
const O = {
  scen: only.length ? only : ['whiteroom', 'locker', 'omega', 'massage'],
  N: +flag('N', 12), seeds: flag('seeds', '2000,21001').split(',').map(Number), jobs: +flag('jobs', 3),
  fps: flag('fps', '俺,あたし,僕').split(',').filter(Boolean), why: flags.includes('--why')
};
const HASH = ZEN ? '' : 'r18';

function inPage(a) {
  const HK = window.HK, V = HK.Voice;
  const D = x => { if (typeof x !== 'string') return x; if (HK.NameGuard && HK.NameGuard.decAll) x = HK.NameGuard.decAll(x); if (HK.NameSafe) x = HK.NameSafe.dec(x); return x; };
  /* 置き換えの元になりうる語（voice.js の FP_RE の語と印） */
  const WORDS = ['', '俺様', 'オレ様', 'わたくし', 'ワタクシ', 'あたくし', 'あたし', 'アタシ', 'わたし', 'ワタシ', '拙者', 'わらわ', 'ぼく', 'オレ', 'ボク', 'ウチ', 'うち', 'わし', '俺', '僕', '私'];
  /* 二つの文字列の差分（LCS）。[元で消えた区間, 後で入った区間, 元の位置] の並び */
  function diff(x, y) {
    const n = x.length, m = y.length;
    if (n > 700 || m > 700) return null;
    const W = m + 1, L = new Uint16Array((n + 1) * W);
    for (let i = n - 1; i >= 0; i--) for (let j = m - 1; j >= 0; j--) L[i * W + j] = x[i] === y[j] ? L[(i + 1) * W + j + 1] + 1 : Math.max(L[(i + 1) * W + j], L[i * W + j + 1]);
    const out = []; let i = 0, j = 0, cur = null;
    while (i < n || j < m) {
      if (i < n && j < m && x[i] === y[j]) { if (cur) { out.push(cur); cur = null; } i++; j++; continue; }
      if (!cur) cur = { del: '', ins: '', at: i };
      if (j < m && (i >= n || L[i * W + j + 1] >= L[(i + 1) * W + j])) { cur.ins += y[j]; j++; } else { cur.del += x[i]; i++; }
    }
    if (cur) out.push(cur);
    return out;
  }
  const reps = [], left = [], errs = [], cnt = { calls: 0, skip: 0, runs: 0, lines: 0 };
  let run = '', ptDepth = 0;
  const pt0 = V.processText; V.processText = function () { ptDepth++; try { return pt0.apply(this, arguments); } finally { ptDepth--; } };
  const rf0 = V.replaceFP;
  V.replaceFP = function (q, c) {
    const out = rf0.apply(this, arguments);
    try {
      cnt.calls++;
      const q1 = V.markIn ? V.markIn(q) : q;
      if (typeof q1 === 'string' && q1 !== out) {
        const h = diff(q1, out);
        if (!h) cnt.skip++;
        else h.forEach(x => {
          const w = WORDS.find(k => x.del.indexOf(k) >= 0);
          if (!w) return;
          const at = x.at + x.del.indexOf(w);
          reps.push({ run, w: w === '' ? '{一人称}' : w, rep: x.ins, b: D(q1.slice(Math.max(0, at - 12), at)), f: D(q1.slice(at + w.length, at + w.length + 12)), q: D(q1).replace(//g, '{一人称}').replace(//g, '{二人称}'), who: D(c && c.name), tone: c && c.tone });
        });
      }
    } catch (e) { errs.push('rec:' + e.message); }
    return out;
  };
  const AUTO = a.auto;
  let EGS = [{ CP: 8, NP: 12, A: 10, FC: 12, AC: 12 }, { CP: 16, NP: 8, A: 12, FC: 6, AC: 6 }, { CP: 6, NP: 10, A: 8, FC: 16, AC: 8 }, { CP: 6, NP: 14, A: 8, FC: 8, AC: 16 }];
  if (AUTO && a.tone !== 'polite') {
    EGS = []; let rs = 12345; const rnd = () => { rs = (rs * 1103515245 + 12345) & 0x7fffffff; return rs / 0x7fffffff; };
    for (let i = 0; i < 200000 && EGS.length < 4; i++) { const eg = { CP: Math.round(rnd() * 20), NP: Math.round(rnd() * 20), A: Math.round(rnd() * 20), FC: Math.round(rnd() * 20), AC: Math.round(rnd() * 20) }; if (HK.toneOf({ tone: '', eg }) === a.tone) EGS.push(eg); }
    if (!EGS.length) EGS = [{ CP: 8, NP: 12, A: 10, FC: 12, AC: 12 }];
  }
  const fps = a.fps, fpOf = g => !fps.length ? '' : g === 'm' ? fps[0] : g === 'f' ? fps[1] : (fps[2] || fps[0]);
  const MKL = /\{[一二]人称\}|[-]/;
  /* 一人称の語（ブレの数え上げ。analyze の数え方：再帰の「自分」・感動詞の「おら」・家や時の「うち」は数えない） */
  const FPW = /(?<![一-鿿々])(?<![ぁ-ゖ](?<![はもとがをにでやへ、…]))(俺様|オレ様|俺|僕|ぼく|オレ|ボク|わたくし|ワタクシ|あたくし|あたし|アタシ|わたし|ワタシ|私|拙者|わらわ|わし|儂|おいら|オイラ|あたい|吾輩|小生|うち|ウチ)(?=[はがもをにのとでへやっだ、。！？!?…」]|たち|達|ら|$)/g;
  function fpsIn(s, want) {
    const r = []; let m; FPW.lastIndex = 0;
    while ((m = FPW.exec(s))) {
      const w = m[1], f = s.slice(m.index + w.length, m.index + w.length + 3);
      if (/^(うち|ウチ)$/.test(w) && want !== w) continue;
      if (/^(わし)$/.test(w) && /^(づか|め)/.test(f)) continue;
      r.push(w);
    }
    return r;
  }
  const blur = [];
  const SCL = a.scen;
  for (const SEED of a.seeds) for (const sc of SCL) {
    const scen = HK.SCENARIOS[sc]; if (!scen) { errs.push('no scen ' + sc); continue; }
    for (let s = 0; s < a.N; s++) {
      const g = s % 2 ? 'f' : 'm';
      const chars = [
        { name: 'ハルカ', gender: g, likes: 'both', pos: s % 4 < 2 ? 'bottom' : 'top', tone: AUTO ? (a.tone === 'polite' ? 'polite' : '') : a.tone, fp: fpOf(g), memo: '', eg: EGS[(s >> 1) % EGS.length] },
        { name: 'レン', gender: g === 'f' ? 'm' : 'f', likes: 'both', pos: s % 4 < 2 ? 'top' : 'bottom', tone: '', fp: fpOf(g === 'f' ? 'm' : 'f'), memo: '', eg: { CP: 10, NP: 10, A: 10, FC: 12, AC: 8 } },
        { name: 'ソラ', gender: '', likes: 'both', pos: '', tone: '', fp: fpOf(''), memo: '', eg: { CP: 6, NP: 14, A: 8, FC: 10, AC: 14 } }
      ].slice(0, sc === 'locker' ? 3 : 2 + (s % 2));
      const env = {}; (scen.env || []).forEach(e => { env[e.id] = e.def != null ? e.def : (e.options && e.options[0] ? e.options[0].v : (e.min != null ? e.min : '')); });
      (scen.env || []).forEach(e => { if (e.max != null && /romance|love|night|lewd|heat|aphro|dose|pleasure/.test(e.id)) env[e.id] = e.max; });
      if (HK.Content) env.ct = HK.Content.TAGS.map(t => t.id).filter(t => t !== 'force').join(',');
      run = a.tone + '/' + sc + '/' + (SEED + s * 7);
      let R; cnt.runs++;
      try { R = HK.simulate({ scenId: sc, seed: SEED + s * 7, env, chars, ties: s % 3 === 0 ? [{ a: 0, b: 1, type: 'lover' }] : [], perChar: chars.map(() => ({ action: 'auto', goal: 'auto', stats: {}, pick: {}, role: '' })) }); }
      catch (e) { errs.push(run + ':' + e.message); continue; }
      /* (b) 画面に残った印：記録の本文・区分・結末・住人の欄 */
      const walk = (o, where, seen) => {
        if (typeof o === 'string') { if (MKL.test(o)) left.push({ run, where, s: o.slice(0, 160).replace(//g, '〔印1〕').replace(//g, '〔印2〕').replace(//g, '〔印3〕') }); return; }
        if (!o || typeof o !== 'object' || seen.has(o)) return; seen.add(o);
        if (Array.isArray(o)) o.forEach((v, i) => walk(v, where, seen)); else Object.keys(o).forEach(k => walk(o[k], where === '' ? k : where, seen));
      };
      walk({ log: R.log, ending: R.ending || R.end, chars: R.chars, heroes: R.heroes }, '', new Set());
      /* (c) ブレ */
      const fpw = chars.map(c => V.fpFor(c)), per = {};
      (R.log || []).forEach(e => (e.seg || []).forEach(x => {
        if (!(x.t === 'l' || x.t === 'q') || !(x.who >= 0)) return;
        cnt.lines++;
        const body = x.s.replace(/^[^「]*「/, '').replace(/」$/, ''), f = fpsIn(body, fpw[x.who]);
        if (!f.length) return;
        const p = per[x.who] = per[x.who] || { w: {}, ex: [] };
        f.forEach(w => { if (!p.w[w]) { p.w[w] = 1; p.ex.push(w + '：' + body.slice(0, 60)); } });
      }));
      Object.keys(per).forEach(k => { if (Object.keys(per[k].w).length >= 2) blur.push({ run, who: chars[k].name, want: fpw[k], ws: Object.keys(per[k].w), ex: per[k].ex.slice(0, 3) }); });
    }
  }
  V.processText = pt0; V.replaceFP = rf0;
  return { tone: a.tone, cnt, reps, left, blur, errs };
}

/* 置き換えた語が一人称でないか（前後の文脈）。一人称でなければ理由を返す */
function notFP(x) {
  const w = x.w, b = x.b, f = x.f;
  if (w === '{一人称}') return '';
  if (/^(うち|ウチ)$/.test(w)) return 'うち（家・時・所属の「うち」）';
  /* 「全部私の」「今日私が」の「私」は一人称なので、前の漢字は熟語（公私・滅私・無私）と、後ろの漢字（私物・私語）だけで見る */
  if (w === '私' && (/[公滅無]$/.test(b) || /^[語用的情生物服見立鉄設財産]/.test(f))) return '私：熟語（公私・私物など）';
  if (w === 'わし' && /[ぁ-ゖ]$/.test(b) && !/[はもとがをにでやへ]$/.test(b)) return 'わし：前がひらがな（交わし・まわしなど）';
  if (/(下|公|従|学)$/.test(b) && w === '僕') return '僕：下僕・公僕など';
  if (/^(わたし|あたし|ぼく|わたくし|あたくし|わらわ)$/.test(w) && /[ぁ-ゖ]$/.test(b) && !/[はもとがをにでやへ、…っ]$/.test(b)) return w + '：前がひらがな（語の途中）';
  if (/お$/.test(b) && /^(うち|ウチ)$/.test(w)) return 'おうち';
  if (/^(に来|に帰|に泊|に寄)/.test(f) && /^(うち|ウチ)$/.test(w)) return '家の「うち」';
  return '';
}

(async () => {
  const T0 = Date.now();
  const first = await openBuild(DIR, HASH);
  const keys = await first.page.evaluate(() => window.HK.TONE_KEYS.slice());
  const want = flag('tones', '') ? flag('tones').split(',') : keys;
  const queue = want.slice(), res = {};
  let pageErr = 0;
  const worker = async pre => {
    const ob = pre || await openBuild(DIR, HASH); let fresh = true;
    try {
      while (queue.length) {
        const t = queue.shift();
        if (!fresh) { await ob.page.goto(buildUrl(DIR, HASH)); await ob.page.waitForFunction(() => window.HK && window.HK.simulate && window.HK.TONE_KEYS && window.HK.LATE_READY !== false, null, { timeout: 120000 }); }
        fresh = false;
        const AUTO = ['proud', 'stern', 'tsun', 'gentle', 'devoted', 'cool', 'free', 'shy', 'polite'].indexOf(t) >= 0;
        res[t] = await ob.page.evaluate(inPage, { tone: t, auto: AUTO, scen: O.scen, N: O.N, seeds: O.seeds, fps: O.fps });
      }
    } finally { pageErr += ob.errors.length; await ob.browser.close(); }
  };
  await Promise.all(Array.from({ length: Math.max(1, O.jobs) }, (_, i) => worker(i === 0 ? first : null)));
  let runs = 0, calls = 0, skip = 0, lines = 0, nRep = 0; const bad = [], left = [], blur = [], errs = [];
  const byW = {};
  Object.values(res).forEach(r => {
    runs += r.cnt.runs; calls += r.cnt.calls; skip += r.cnt.skip; lines += r.cnt.lines; nRep += r.reps.length;
    r.reps.forEach(x => { byW[x.w] = (byW[x.w] || 0) + 1; const k = notFP(x); if (k) bad.push(Object.assign({ k }, x)); });
    left.push(...r.left); blur.push(...r.blur); errs.push(...r.errs);
  });
  const sec = ((Date.now() - T0) / 1000).toFixed(0);
  console.log('一人称の置き換えの点検（' + path.basename(DIR) + '・' + want.length + '口調 × ' + O.scen.join(',') + ' × N=' + O.N + ' × 種 ' + O.seeds.join(',') + '・一人称の設定 ' + O.fps.join('/') + '）：' + runs + ' 回・' + sec + ' 秒');
  console.log('  置き換え ' + nRep + ' 件（' + Object.entries(byW).sort((a, b) => b[1] - a[1]).map(([k, v]) => k + ' ' + v).join('・') + '）・話し手つきの台詞 ' + lines + ' 本' + (skip ? '・長すぎて比べなかった台詞 ' + skip : ''));
  const show = (title, arr, fmt) => {
    console.log('  ' + title + '：' + arr.length + ' 件');
    if (!arr.length) return;
    const seen = new Map(); arr.forEach(x => { const k = fmt(x); seen.set(k, (seen.get(k) || 0) + 1); });
    [...seen.entries()].sort((a, b) => b[1] - a[1]).slice(0, O.why ? 30 : 5).forEach(([k, v]) => console.log('    - ' + v + ' 回 … ' + k));
  };
  show('(a) 一人称でない語の置き換え', bad, x => x.k + '「' + x.b + '［' + x.w + '→' + x.rep + '］' + x.f + '」（' + x.tone + '）');
  show('(b) 画面に残った印', left, x => x.where + '：' + x.s);
  show('(c) 同じ住人の台詞の一人称のブレ', blur, x => x.who + '（期待 ' + x.want + '）' + x.ws.join('＋') + ' … ' + x.ex.join(' ／ '));
  if (errs.length || pageErr) console.log('  シミュレーションの失敗 ' + errs.length + '・ページのエラー ' + pageErr + (errs.length ? '（' + errs.slice(0, 3).join(' ／ ') + '）' : ''));
  const ng = bad.length + left.length + blur.length + errs.length + pageErr;
  console.log(ng ? '不合格（' + ng + ' 件）' : '合格（すべて 0 件）');
  process.exitCode = ng ? 1 : 0;
})().catch(e => { console.error(e); process.exitCode = 2; });
