/* 句読点の崩れの点検：記録の本文（e.text）と、画面の改行（HK.fmtLong）のあとの各行で、文頭の句読点・句読点の重なりを数える
   使い方: node punct-audit.js <ビルドのディレクトリ> [1箱庭あたりの回数=12] [r18|safe|''] [箱庭id,…] [--why] [--hot] [--stack] [--input] [--env=style:ero]
   P1 文頭の句読点：本文の先頭・改行・空白・「『 の直後に「。」「、」（「…。」「……、」のように点のあとの句読点も）
   P2 画面の行頭の句読点：HK.fmtLong（長い文を段落・台詞で改行する。view.js と同じく seg を渡す）のあとの行が「。」「、」で始まる
   P3 句読点の重なり：「。。」「、。」「。、」「、、」
   P4 文頭の台詞のあとの句点：文頭（本文の先頭・句点・！？・）・空白・改行・―・… のあと）の台詞「…」・名前「…」（続けて並ぶ「…」「…」も一つ）の
      すぐあとの「。」（「…」。〇〇は）と「。」。」。HK.fmtLong はこの台詞を一行にするので、残りが「。〇〇は…」の行になる（P2 の元）。
      「〜した。「…」」・文の途中の引用（店の名は「ひだまり」。）は数えない
   P5 句点のすぐあとに記号：「。！」「。？」「。・」「。）」「。〜」など（空白なしの崩れ。「。……」「。――」は書き方として数えない）
   回ごとに作風（style：小説調／男性向け）を交互にし、関係（恋人・敵対・夫婦・ライバル など）をずらす。--hot で過激さ・媚薬などを最大にする。
   出どころ：記録を書いた時点（HK.Ctx.prototype.say・HK.Story.say）の呼び出し元のファイルと関数（かたまりの「/* ==== js/〜.js ==== *\/」の印から引く。--stack で全部）と、
   崩れの前後の地の文の断片で js/*.js を検索した行（--why のとき）。「書いた後」は、記録を書いた時点には無く、仕上げ（口調・語の差し替え・全年齢の言い換え）で生じたもの。
   --input で、その回の設定（env・関係・性別と受け攻め）も出す。仕上げは core.js の HK.punctFix（voice-seg.js の包みがかける） */
'use strict';
const fs = require('fs');
const path = require('path');
const { openBuild } = require('./lib.js');
(async () => {
  const args = process.argv.slice(2).filter(a => !/^--/.test(a));
  const dir = args[0], N = +args[1] || 12, mode = args[2] || '', only = args[3] ? args[3].split(',') : null;
  if (!dir) { console.log('使い方: node punct-audit.js <ビルドのディレクトリ> [回数=12] [r18|safe|\'\'] [箱庭id,…] [--why] [--hot]'); process.exit(1); }
  const WHY = process.argv.includes('--why'), HOT = process.argv.includes('--hot');
  const ENVSET = ((process.argv.find(a => /^--env=/.test(a)) || '').slice(6)).split(',').filter(Boolean).map(x => x.split(':'));
  const { browser, page, errors } = await openBuild(dir, mode);
  const r = await page.evaluate(({ N, only, HOT, ENVSET, WHY }) => {
    const KEYS = ['P1', 'P2', 'P3', 'P4', 'P5'];
    const RE = {
      P1: /(?:^|[\n 　「『])…*[。、]/,
      P3: /[。、][。、]/,
      P4: /。」。|(?<=^|[。！？）\s―…])(?:アキラ|ミナト|ユキノ|カオル|ハルカ|レンジ|ソウタ|カエデ)?(?:「[^「」\n]*」)+。/,
      P5: /。(?=[！？!?・）)〜～])/
    };
    const NAMES = ['アキラ', 'ミナト', 'ユキノ', 'カオル', 'ハルカ', 'レンジ', 'ソウタ', 'カエデ'];
    const out = { n: {}, ex: {}, runs: 0, bySc: {}, byKind: {}, bySrc: {}, err: [] };
    KEYS.forEach(k => { out.n[k] = 0; out.ex[k] = []; });
    /* 記録を書いた時点の呼び出し元（スタック） */
    const STK = new WeakMap(), SEEN = new WeakSet();
    Error.stackTraceLimit = 60;
    const anyBad = t => typeof t === 'string' && (RE.P1.test(t) || RE.P3.test(t) || RE.P4.test(t) || RE.P5.test(t));
    const grab = (o) => { if (!o || typeof o !== 'object') return; SEEN.add(o); if (anyBad(o.text)) STK.set(o, String(new Error().stack || '')); };
    if (HK.Ctx && !HK.Ctx.prototype.say._pa) { const s0 = HK.Ctx.prototype.say; HK.Ctx.prototype.say = function (o) { const e = s0.apply(this, arguments); if (e && o && e.text === o.text) grab(e); return e; }; HK.Ctx.prototype.say._pa = 1; }
    if (HK.Story && HK.Story.say && !HK.Story.say._pa) { const s1 = HK.Story.say; HK.Story.say = function (S, o) { const e = s1.apply(this, arguments); grab(e); return e; }; HK.Story.say._pa = 1; }
    let curIn = '';
    const hit = (k, sc, s, e, t, m) => {
      out.n[k]++;
      out.bySc[sc] = out.bySc[sc] || {}; out.bySc[sc][k] = (out.bySc[sc][k] || 0) + 1;
      const kd = (e.kind || '') + '/' + (e.cat || '') + (e.tag ? '/' + e.tag : '');
      out.byKind[kd] = (out.byKind[kd] || 0) + 1;
      const st = STK.get(e) || '';
      const src = st ? '' : SEEN.has(e) ? '（書いた後：仕上げで生じた）' : '（書いた時点のスタックなし）';
      const key = k + ' ' + sc + ' ' + kd;
      out.bySrc[key] = out.bySrc[key] || { n: 0, st: st, src: src, ex: '' };
      out.bySrc[key].n++;
      const i = t.indexOf(m), ctx = t.slice(Math.max(0, i - 40), i + m.length + 40).replace(/\n/g, '⏎');
      if (!out.bySrc[key].ex) out.bySrc[key].ex = ctx;
      if (out.ex[k].length < (WHY ? 60 : 8)) out.ex[k].push({ sc, s, kd, m, ctx, st, src, inp: curIn });
    };
    const ids = Object.keys(HK.SCENARIOS).filter(id => !only || only.indexOf(id) >= 0);
    ids.forEach(sc => {
      const scen = HK.SCENARIOS[sc], lo = scen.minCast || 1, hi = Math.min(scen.maxCast || 6, 6);
      for (let s = 0; s < N; s++) {
        const n = Math.max(lo, Math.min(hi, lo + (s % (hi - lo + 1))));
        const chars = [], perChar = [];
        for (let i = 0; i < n; i++) {
          chars.push({ name: NAMES[i], eg: { CP: (s * 7 + i * 5) % 21, NP: (s * 3 + i * 11) % 21, A: (s * 13 + i * 3) % 21, FC: (s * 5 + i * 7) % 21, AC: (s * 11 + i * 3) % 21 }, gender: ['m', 'f', 'f', 'm', 'f', 'm', 'm', 'f'][(i + s) % 8], pos: ['top', 'bottom', '', 'riba', 'bottom', 'top', '', ''][(i + s) % 8], tone: HK.TONE_KEYS[(i * 5 + s) % HK.TONE_KEYS.length], calls: {}, loveNG: [], loveLock: '' });
          perChar.push({ action: 'auto', goal: 'auto', stats: {}, weapon: '', pick: {}, role: '' });
        }
        const env = {}; (scen.env || []).forEach(e => { env[e.id] = e.def != null ? e.def : (e.options && e.options[0] ? e.options[0].v : (e.min != null ? e.min : '')); });
        (scen.env || []).forEach((e, k) => { if (e.options && e.options.length > 1 && (s + k) % 3 === 0 && e.id !== 'style') env[e.id] = e.options[(s + k) % e.options.length].v; if (/^role_/.test(e.id)) env[e.id] = s % 2 ? 'res' : 'auto'; });
        if (HOT) (scen.env || []).forEach(e => {
          if (e.max != null && /lewd|dose|shady|heat|prey|pleasure|traffic|ev$|aphro|night/.test(e.id)) env[e.id] = e.max;
          else if (e.options && /lewd/.test(e.id)) { const h = e.options.filter(o => /high|max|lewd/.test(o.v))[0]; if (h) env[e.id] = h.v; }
          if (e.id === 'mode' && e.options && e.options.some(o => o.v === 'lewd')) env[e.id] = 'lewd';
        });
        /* 作風：回ごとに小説調・男性向けを交互に */
        if ((scen.env || []).some(e => e.id === 'style')) env.style = s % 2 ? 'ero' : 'novel';
        if (HK.Content) env.ct = HK.Content.TAGS.map(t => t.id).join(',');
        ENVSET.forEach(kv => { env[kv[0]] = isNaN(+kv[1]) ? kv[1] : +kv[1]; });
        const ties = n >= 2 ? [{ a: 0, b: 1, type: ['lover', 'enemy', 'spouse', 'rival', 'honmei', 'friend', 'crush'][s % 7] }] : [];
        let res;
        curIn = JSON.stringify({ env, ties, g: chars.map(c => c.gender + ':' + c.pos) });
        try { res = HK.simulate({ scenId: sc, seed: 5300 + s, env, chars, perChar, ties }); } catch (e) { out.err.push(sc + '#' + s + ': ' + String(e && e.message)); continue; }
        out.runs++;
        const names = chars.map(c => c.name);
        (res.log || []).forEach(e => {
          const t = e && e.text;
          if (typeof t !== 'string' || !t) return;
          let m;
          if ((m = t.match(RE.P1))) hit('P1', sc, s, e, t, m[0]);
          if ((m = t.match(RE.P3))) hit('P3', sc, s, e, t, m[0]);
          if ((m = t.match(RE.P4))) hit('P4', sc, s, e, t, m[0].slice(-2));
          if ((m = t.match(RE.P5))) hit('P5', sc, s, e, t, m[0]);
          /* 画面の改行のあと（view.js と同じく、記録の seg があれば台詞の塊を seg から取る） */
          if (HK.fmtLong) {
            let d = '';
            try { d = HK.fmtLong(t, names, e.seg); } catch (err) { d = ''; }
            const DL = d.split('\n').filter(l => l.trim()), k2 = DL.findIndex(l => /^\s*…*[。、]/.test(l));
            if (k2 >= 0) hit('P2', sc, s, e, (k2 ? DL[k2 - 1].slice(-30) : '') + '⏎' + DL[k2].trim(), '⏎' + DL[k2].trim().slice(0, 3));
          }
        });
      }
    });
    return out;
  }, { N, only, HOT, ENVSET, WHY });

  /* スタックのかたまりの位置 → 元のファイル（かたまりの中の「/* ==== js/〜.js ==== *\/」の印） */
  const absDir = path.resolve(dir), mapCache = {};
  const marksOf = (file) => {
    if (mapCache[file]) return mapCache[file];
    let lines = []; try { lines = fs.readFileSync(file, 'utf8').split('\n'); } catch (e) { /* なし */ }
    const marks = []; lines.forEach((l, i) => { const m = l.match(/^\/\* ==== (js\/[^ ]+) ==== \*\/$/); if (m) marks.push([i + 1, m[1]]); });
    return (mapCache[file] = marks);
  };
  const SKIP = /^js\/(?:engine|solo-story-kit|attr-look|attr-meet|attr-r18|voice-seg|voice|ero-scene)\.js$/;
  const STACK = process.argv.includes('--stack');
  const where = (st) => {
    if (!st) return '';
    const fr = [];
    st.split('\n').slice(1).forEach(l => {
      const m = l.match(/at (?:(\S+) \()?file:\/\/([^:)]+):(\d+):\d+\)?/); if (!m) return;
      let f = m[2]; const ln = +m[3];
      if (f.indexOf(absDir) !== 0) return;
      let src = path.relative(absDir, f);
      if (/^js\/c\//.test(src)) { const mk = marksOf(f).filter(x => x[0] <= ln).pop(); src = mk ? mk[1] : src; }
      if (STACK) { fr.push(src.replace(/^js\//, '') + ':' + (m[1] || '')); return; }
      if (SKIP.test(src) || /punct-audit|__puppeteer|evaluate/.test(m[1] || '') || /(?:simulate|^Object\.sim|^sim\d?|^Object\.f)$/.test(m[1] || '')) return;
      const fn = (m[1] || '').replace(/^Object\./, '').replace(/^HK\./, '');
      const tag = src.replace(/^js\//, '') + (fn && !/^(?:sim|Array\.forEach|Array\.map|<anonymous>)$/.test(fn) ? ':' + fn : '');
      if (fr[fr.length - 1] !== tag) fr.push(tag);
    });
    return fr.slice(0, STACK ? 40 : 4).join(' ← ');
  };
  /* 崩れのすぐあとの地の文の断片で、js/*.js（かたまりの js/c は除く）を探す（住人の名前は {a} などの印に戻して探す） */
  const srcFiles = (() => { try { return fs.readdirSync(path.join(absDir, 'js')).filter(f => /\.js$/.test(f)).map(f => ['js/' + f, fs.readFileSync(path.join(absDir, 'js', f), 'utf8').split('\n')]); } catch (e) { return []; } })();
  const NM = /アキラ|ミナト|ユキノ|カオル|ハルカ|レンジ|ソウタ|カエデ/g;
  const grepFrag = (ctx, m) => {
    const i = ctx.indexOf(m); if (i < 0) return '';
    let frag = ctx.slice(i + m.length).replace(/⏎.*$/, '').split(/[「」。！？]/)[0];
    if (frag.replace(NM, '').length < 4) frag = ctx.slice(0, i).replace(/^.*⏎/, '').split(/[「」。！？]/).pop();
    if (!frag || frag.replace(NM, '').length < 4) return '';
    const re = new RegExp(frag.slice(0, 24).replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(NM, '(?:\\{\\w+\\}|\\$\\{\\w+\\}|\' ?\\+ ?\\w+(?:\\.name)? ?\\+ ?\'|[^、。]{1,8})'));
    const hits = [];
    srcFiles.forEach(([f, L]) => L.forEach((l, k) => { if (hits.length < 3 && re.test(l)) hits.push(f + ':' + (k + 1)); }));
    return hits.join(' ');
  };
  console.log('回数', r.runs, '合計', JSON.stringify(r.n));
  console.log('--- 箱庭ごと');
  Object.keys(r.bySc).sort().forEach(sc => console.log('  ' + sc.padEnd(10), JSON.stringify(r.bySc[sc])));
  console.log('--- 出どころ（種類 箱庭 出来事の種類／分類／札：件数 呼び出し元）');
  Object.keys(r.bySrc).sort((a, b) => r.bySrc[b].n - r.bySrc[a].n).forEach(k => {
    const x = r.bySrc[k];
    console.log('  ' + k + '：' + x.n + '  ' + (x.src || where(x.st)) + (WHY ? '\n      例：' + x.ex + '\n      検索：' + grepFrag(x.ex, (x.ex.match(/(?:^|[⏎ 　「『])…*[。、]|[。、][。、]|。」|」。|。[！？!?…‥・）)〜～―]/) || [''])[0]) : ''));
  });
  for (const k of Object.keys(r.ex)) {
    if (!r.ex[k].length) continue;
    console.log('--- ' + k);
    r.ex[k].forEach(x => console.log('  ' + x.sc + '#' + x.s + ' [' + x.kd + '] 「' + x.m + '」 … ' + x.ctx + (WHY ? '\n      ' + (x.src || where(x.st)) : '') + (process.argv.includes('--input') ? '\n      入力：' + x.inp : '')));
  }
  if (r.err.length) console.log('失敗', r.err.length, r.err.slice(0, 3));
  console.log('ページのエラー', errors.length, JSON.stringify(errors.slice(0, 3)));
  await browser.close();
})();
