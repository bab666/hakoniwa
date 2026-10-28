/* 喘ぎ声の点検：口調を1つずつ全員に固定して、R18 の喘ぎが出る全箱庭を回し、喘ぎ・山場の声・寸前の声・キス中・口での声を集めて調べる
   使い方: node moan-audit.js <ビルドのディレクトリ> [1箱庭・1口調あたりの回数=4] [r18|safe|''] [--tones=口調,…] [--scen=箱庭id,…] [--why] [--show=8] [--json=出力.json]
     例：node moan-audit.js ../../hakoniwa-full 4 r18            … R18版（a・b・c を数える）
         node moan-audit.js ../../hakoniwa-full 2 safe           … 全年齢モード（d だけ数える）
         node moan-audit.js ../../hakoniwa-zenrei 2              … 全年齢版（d だけ数える）
   回ごとに、作風（小説調 novel／男性向け ero）・濃さ（ほどほど mid／濃い high）・住人の性別の並び（男女交互・女男交互・全員女・全員男）を変える
   （回数 8 で全部の組み合わせが一回りする）。過激さ・媚薬などの設定は最大（collect.js の HOT と同じ）、内容のスイッチはすべて入。
   集めるもの：記録の e.seg の喘ぎ区分（m）で話し手が住人のもの、HK.Moan（pick・E.moan・say）が作った声と同じ文の「」、
              台詞（l・q）のうち喘ぎ・山場・寸前の声に見えるもの（voice.js の V.moanLike）
   数えるもの：
     (a) 口調・性別に合わない語尾（規則は lint.js の MOAN_RULES。敬語の口調の荒い常体／はっきりした口調の弱い拒み・女性的語尾／
         やわらかい口調の荒い語尾・「お前」／のじゃ・関西弁・紳士などの標準語の語尾／男性の女性的語尾（お姉さん・お嬢様を除く）／
         女性の男性的語尾（強気・兄貴分・ヤンキーなど男性的な語尾が個性の口調を除く））
     (b) 一つの記録（場面）の中で、同じ喘ぎ（♡・空白を除いて同じ文）が2回以上出た（短い声＝言葉の部分が2字以下は数えない）
     (c) 口調の語尾が付いた喘ぎの割合（素の表＝moan-dict.js・moan-said.js・ero-kit.js の M・persona.js の山場／寸前の声 にない文の割合。#19 の決まりで 3割以下）
     (d) 全年齢（safe・全年齢版）での喘ぎの混入（♡、R18 の喘ぎの表の行（言葉の部分が3字以上で、小さい母音・♡・「っ」の切れ目のあるもの）、HK.Moan の声）
   表：口調 × 性別 × 作風 の (a) 件数／喘ぎの数。--why で例文（どの表から来たか：pick の鍵と出どころ、台詞なら「台詞」）を出す
   (a)(b) は「喘ぎ」（HK.Moan の声・喘ぎの表・山場／寸前の声の表）と「台詞（参考）」（喘ぎの表にない、言い換えを通る山場の台詞。台詞の点検 lint.js の受け持ち）に分けて出す
   効き：--night=… で夜の性格ごとに、HK.Moan に夜の性格が届いたか・基盤の態度（サド＝強気／マゾ＝健気／意地悪＝奔放／甘々＝穏やか／恥じらい＝恥じらい）・鍵の割合を、
         --moantone=口調 で、喘ぎの口調で作った声の割合を出す（moan-engine.js の HK.Moan.nightOf・toneOf）
   調整：--moanfit=設定.json で、高度設定「喘ぎ声の調整」（HK.Moan.setFit）の設定を当てて回す（区分・夜の性格→声の基盤・割合・性別の整え。書式は moan-engine.js の M.setFit）。
         例：{"tone":{"proud":{"kind":"soft","masc":false}}}（強気をやわらかく）／{"night":{"sadist":"shy"}}／{"rate":{"tone":1}}／{"tone":{"proud":{"kind":"off"}}}
   辞書：--moandict=辞書.txt で、高度設定「喘ぎの辞書」（HK.Moan.setUser）を当てて回す。--owndict=辞書.txt で、全員の住人の欄「喘ぎの辞書（この住人だけ）」（c.moanDict）に入れて回す。
         --ownfit=区分（firm|soft|grand|none|off）で全員の「声の区分（この住人だけ）」（c.moanFit）を決めて回す。
         利用者の辞書の行が記録に出た数（男性向け／小説調、小説調の鍵 [小説 …] の行）を出す（2026-10-28 担当HW2） */
'use strict';
const fs = require('fs');
const { openBuild } = require('./lib.js');
const { MOAN_RULES } = require('./lint.js');
(async () => {
  const args = process.argv.slice(2).filter(a => !/^--/.test(a));
  const opt = k => (process.argv.find(a => a.indexOf('--' + k + '=') === 0) || '').slice(k.length + 3);
  const dir = args[0], N = +args[1] || 4, mode = args[2] || '';
  const WHY = process.argv.includes('--why'), SHOW = +opt('show') || (WHY ? 12 : 4), JS = opt('json');
  const TONES = opt('tones') ? opt('tones').split(',') : null, SCEN = opt('scen') ? opt('scen').split(',') : null;
  /* --night=sadist,maso,mean,sweet,shy,match,none：夜の性格を全員に決めて回す（match は偶数番の住人をサド・奇数番を「相手に合わせる」に）。
     --moantone=口調：全員の「喘ぎの口調」（c.moanTone）を決めて回す。どちらも、喘ぎの選び方に効いているか（効き）を表に出す */
  const NIGHTS = opt('night') ? opt('night').split(',').map(x => x === 'none' ? '' : x) : null, MT = opt('moantone') || '';
  const FIT = opt('moanfit') ? JSON.parse(fs.readFileSync(opt('moanfit'), 'utf8')) : null;
  const DICT = opt('moandict') ? fs.readFileSync(opt('moandict'), 'utf8') : '', OWN = opt('owndict') ? fs.readFileSync(opt('owndict'), 'utf8') : '', OWNFIT = opt('ownfit') || '';
  /* --from=前の --json の出力：回さずに、集めた喘ぎに規則だけ当て直す（規則を直したときの確かめ） */
  const FROM = opt('from');
  if (FROM) { report(Object.assign({ runs: 0, err: [], tones: [], scens: [], gen: 0, genMatched: 0, full: true }, JSON.parse(fs.readFileSync(FROM))), [], FROM, 0); return; }
  if (!dir) { console.error('使い方: node moan-audit.js <ビルド> [回数] [r18|safe|\'\'] [--tones=…] [--scen=…] [--why]'); process.exit(1); }
  const { browser, page, errors } = await openBuild(dir, mode);
  const t0 = Date.now();
  const r = await page.evaluate(({ N, TONES, SCEN, NIGHTS, MT, FIT, DICT, OWN, OWNFIT }) => {
    const HK = window.HK, V = HK.Voice, M = HK.Moan, E = HK.Ero, SAFE = !!HK.SAFE_ON;
    /* 喘ぎ声の調整を当てる（当てたあとの、整えた設定を表に出す） */
    const fitSet = FIT && M && M.setFit ? (M.setFit(FIT), M.fitCfg) : null;
    const dictErr = DICT && M && M.setUser ? M.setUser(DICT).errors : [];
    const out = { runs: 0, err: [], moans: [], dup: [], safeHits: [], tones: [], gen: 0, genMatched: 0, safe: SAFE, full: !!M, fit: fitSet, dictErr };
    const norm = s => String(s || '').replace(/[⁠⁡-⁤♡゛ﾞ\s　]/g, '');
    const letters = s => norm(s).replace(/[…‥、。！？!?っッー〜～ぁぃぅぇぉゃゅょ「」（）・]/g, '');
    /* 素の喘ぎの表（口調の色のない行）。ここに無い文を「口調の語尾が付いた」と数える */
    const PLAIN = new Set(), R18SET = new Set();
    const addAll = (o, set, f) => { if (!o) return; if (Array.isArray(o)) o.forEach(x => { if (typeof x === 'string') (f ? f(x) : [x]).forEach(y => set.add(norm(y))); else addAll(x, set, f); }); else if (typeof o === 'object') Object.keys(o).forEach(k => addAll(o[k], set, f)); };
    const parts = ['ちんぽ', 'おちんちん', '{男性器}', 'それ', ''];
    const variants = x => {
      const a = [x], k = M && M.kForm ? M.kForm(x) : x;
      if (k !== x) a.push(k);
      a.slice().forEach(y => { if (/\{p\}/.test(y)) parts.forEach(p => a.push(y.replace(/\{p\}/g, p))); });
      if (V && V.unfem) a.slice().forEach(y => a.push(V.unfem(y, { tone: 'gentle' })));
      return a;
    };
    if (M) {
      addAll(HK.MOAN_SHARED, PLAIN, variants); addAll(HK.MOAN_SAID, PLAIN, variants); addAll(E && E.MOAN, PLAIN, variants);
      addAll(V && V.CLIMAX, PLAIN, variants); addAll(V && V.EDGE, PLAIN, variants);
    }
    /* 口調ごとに書いた喘ぎの表（ero-moan-tone.js・novel-moan-tone.js・solo-r18-moan-data.js の V）のうち、態度9種と同じ名前の口調以外の行。
       ここから出た声と、文末に口調の辞書を当てた声を「口調の語尾が付いた喘ぎ」に数える（態度9種の口調の表は、態度の基盤と同じく素の声に数える） */
    const PS9 = { proud: 1, stern: 1, tsun: 1, gentle: 1, devoted: 1, cool: 1, free: 1, shy: 1, polite: 1 }, TONED = new Set();
    [E && E.TONE_MOAN, HK.NovelMoan && HK.NovelMoan.T, HK.R18M_DATA && HK.R18M_DATA.V].forEach(T => { if (T) Object.keys(T).forEach(t => { if (!PS9[t]) addAll(T[t], TONED, x => { const v = variants(x); return v.filter(y => !PLAIN.has(norm(y))); }); }); });
    /* 全年齢での混入の点検に使う R18 の喘ぎの表（言葉の部分が3字以上の行） */
    /* 喘ぎの印（小さい母音・♡・濁点・言葉の切れ目の「っ」）のある行だけ（「……かわいい」のような普通の台詞と同じ行は数えない） */
    const r18add = o => addAll(o, R18SET, x => letters(x).length >= 3 && /[ぁぃぅぇぉ♡゛]|[っッ](?=[…‥、。！!？?\s　]|$)/.test(x) ? [x] : []);
    r18add(HK.MOAN_SHARED); r18add(HK.MOAN_SAID); r18add(E && E.TONE_MOAN); r18add(HK.NovelMoan); r18add(HK.R18M_DATA);
    /* 作った声の記録（HK.Moan の pick・E.moan・say のいちばん外側の呼び出し） */
    let depth = 0, cur = null, gen = [];
    const wrap = (obj, key, kind) => {
      if (!obj || typeof obj[key] !== 'function' || obj[key]._ma) return;
      const f0 = obj[key];
      obj[key] = function (S, who) {
        const outer = depth === 0;
        if (outer) cur = { srcs: [], ends: false, kind };
        depth++;
        let r;
        try { r = f0.apply(this, arguments); } finally { depth--; }
        if (kind === 'pick' && cur) cur.srcs.push((M.lastSrc || '?') + ':' + arguments[2]);
        /* 小説調の利用者の行（HK.Moan.say が pick を通さずに出した辞書の行） */
        if (outer && cur && kind === 'say' && M.lastSay === 'user') cur.srcs.push('user:novel');
        if (outer && cur && typeof r === 'string' && r && who) {
          const cx = arguments[3] && typeof arguments[3] === 'object' ? arguments[3] : {}, ks = cur.srcs.map(x => x.split(':')[1]);
          const n = norm(r), old = !cur.srcs.length, tone = cur.srcs.some(x => /^tone/.test(x));
          const toned = cur.ends || ((tone || old) && TONED.has(n));
          gen.push({ name: who.name, n, raw: r, src: kind + (cur.srcs.length ? '[' + cur.srcs.join(',') + ']' : old ? '[元の表]' : ''), toned, ends: cur.ends, key: ks[ks.length - 1] || '', ps: M.psOf ? M.psOf(who, cx) : '', nt: M.nightOf ? M.nightOf(who, cx) : '', mt: M.toneOf ? M.toneOf(who) : '', base: cur.srcs.some(x => /^base/.test(x)) });
          cur = null;
        } else if (outer) cur = null;
        return r;
      };
      for (const k in f0) if (Object.prototype.hasOwnProperty.call(f0, k)) obj[key][k] = f0[k];
      obj[key]._ma = 1;
    };
    if (M) { wrap(M, 'pick', 'pick'); wrap(M, 'say', 'say'); wrap(E, 'moan', 'E.moan'); }
    if (HK.Tone && HK.Tone.apply && !HK.Tone.apply._ma) {
      const a0 = HK.Tone.apply;
      HK.Tone.apply = function (s) { const r = a0.apply(this, arguments); if (depth > 0 && cur && r !== s) cur.ends = true; return r; };
      HK.Tone.apply._ma = 1;
    }
    const tones = (TONES || HK.TONE_KEYS).filter(t => HK.TONE_KEYS.indexOf(t) >= 0);
    out.tones = tones;
    const NAMES = ['アキラ', 'ミナト', 'ユキノ', 'カオル', 'ハルカ', 'レンジ'];
    const GP = [['m', 'f'], ['f', 'm'], ['f'], ['m']];
    function rnd(s) { let x = s; return () => (x = (x * 1103515245 + 12345) % 2147483648) / 2147483648; }
    const scens = HK.SCEN_ORDER.filter(id => { const sc = HK.SCENARIOS[id]; return sc && !sc.stub && (SCEN ? SCEN.indexOf(id) >= 0 : (sc.env || []).some(e => e.id === 'style' || e.id === 'lewd')); });
    out.scens = scens;
    const qOf = x => { let s = x.s.slice(x.nm || 0); const a = s.indexOf('「'), b = s.lastIndexOf('」'); return a >= 0 && b > a ? s.slice(a + 1, b) : s; };
    out.nightFx = []; out.mtFx = { n: 0, hit: 0 };
    (NIGHTS || [null]).forEach(night => tones.forEach(tone => scens.forEach(id => {
      const sc = HK.SCENARIOS[id], n = Math.max(sc.minCast || 2, Math.min(sc.maxCast || 6, 6));
      for (let s = 0; s < N; s++) {
        const style = s % 2 ? 'ero' : 'novel', lewd = Math.floor(s / 2) % 2 ? 'high' : 'mid', gp = GP[(s + Math.floor(s / 4)) % 4];
        const rr = rnd(1000 + s * 77 + id.length + tone.length * 13), chars = [], perChar = [];
        for (let i = 0; i < n; i++) {
          chars.push({ name: NAMES[i], eg: { CP: Math.round(rr() * 20), NP: Math.round(rr() * 20), A: Math.round(rr() * 20), FC: Math.round(rr() * 20), AC: Math.round(rr() * 20) }, memo: '', gender: gp[i % gp.length], likes: '', tone, fp: '', pos: '', color: '', call: '', calls: {}, loveLock: '' });
          if (night != null) chars[i].night = night === 'match' ? (i % 2 ? 'match' : 'sadist') : night;
          if (MT) chars[i].moanTone = MT;
          if (OWN) chars[i].moanDict = OWN;
          if (OWNFIT) chars[i].moanFit = { kind: OWNFIT };
          perChar.push({ action: 'auto', goal: 'auto', stats: {}, weapon: '', pick: {}, role: '' });
        }
        const env = {}; (sc.env || []).forEach(e => { env[e.id] = e.def != null ? e.def : (e.options && e.options[0] ? e.options[0].v : ''); });
        (sc.env || []).forEach((e, k) => {
          if (e.max != null && /lewd|dose|shady|heat|npc|prey|depth|skill|monsters|pleasure|traffic|ev$/.test(e.id)) env[e.id] = e.max;
          else if (e.options && e.options.some(o => o.v === 'high') && /lewd/.test(e.id)) env[e.id] = 'high';
          else if (e.options && e.options.length > 1 && !/lewd|^mode$|^style$/.test(e.id) && (s + k) % 2) env[e.id] = e.options[(s + k) % e.options.length].v;
          if (e.id === 'mode' && e.options && e.options.some(o => o.v === 'lewd')) env[e.id] = 'lewd';
        });
        if ('style' in env) env.style = style;
        if ('lewd' in env && (sc.env || []).some(e => e.id === 'lewd' && e.options && e.options.some(o => o.v === lewd))) env.lewd = lewd;
        if (HK.Content && env.ct == null) env.ct = HK.Content.TAGS.map(t => t.id).join(',');
        gen = [];
        let res;
        try { res = HK.simulate({ scenId: id, seed: 12345 + s * 101, env, chars, perChar, ties: [] }); }
        catch (e) { out.err.push(tone + ':' + id + ':' + s + ' ' + (e && e.message)); continue; }
        out.runs++;
        out.gen += gen.length;
        /* 効き：夜の性格・喘ぎの口調が、HK.Moan の選び方に届いているか */
        gen.forEach(g => {
          const c = chars.filter(x => x.name === g.name)[0]; if (!c) return;
          if (night != null) out.nightFx.push({ set: night, own: c.night || '', nt: g.nt, ps: g.ps, key: g.key, base: g.base });
          if (MT) { out.mtFx.n++; if (g.mt === MT) out.mtFx.hit++; }
        });
        const byN = {}; gen.forEach(g => { (byN[g.n] = byN[g.n] || []).push(g); });
        const nameIx = {}; chars.forEach((c, i) => { nameIx[c.name] = i; });
        (res.log || []).forEach((e, li) => {
          if (!e || typeof e.text !== 'string' || !e.seg) return;
          const seen = {};
          e.seg.forEach(x => {
            if (x.t === 'n') return;
            const q = qOf(x), nq = norm(q);
            if (SAFE || !M) {
              const hit = /♡/.test(q) ? '♡' : R18SET.has(nq) ? '喘ぎの表' : (byN[nq] && letters(q).length >= 1) ? 'HK.Moan' : '';
              if (hit) out.safeHits.push({ tone, id, s, why: hit, q, ctx: e.text.slice(0, 80) });
              return;
            }
            const g = byN[nq] ? byN[nq][0] : null;
            let who = x.who;
            if (!(who >= 0) && g && nameIx[g.name] != null) who = nameIx[g.name];
            if (!(who >= 0) || !chars[who]) return;
            let isMoan = false;
            if (x.t === 'm') isMoan = !!g || (V.moanLike && V.moanLike(q));
            else if (x.t === 'l' || x.t === 'q') isMoan = !!g || (V.moanLike && V.moanLike(q));
            if (!isMoan) return;
            if (g) out.genMatched++;
            /* (c) は HK.Moan が作った声だけで数える（台詞・地の文の喘ぎは話し手の口調で書くもの） */
            const toned = g ? g.toned : null;
            const c = chars[who];
            out.moans.push({ tone: g && MT ? MT : tone, night: night || '', id, s, style, lewd, g: c.gender, t: x.t, q, src: g ? g.src : (x.t === 'm' ? '地の文の喘ぎ' : '台詞'), toned: toned == null ? -1 : toned ? 1 : 0 });
            if (letters(q).length > 2) { if (seen[nq]) out.dup.push({ tone, id, s, style, g: c.gender, q, src: g ? g.src : x.t }); seen[nq] = 1; }
          });
        });
      }
    })));
    return out;
  }, { N, TONES, SCEN, NIGHTS, MT, FIT, DICT, OWN, OWNFIT });
  report(r, errors, dir, Math.round((Date.now() - t0) / 1000));
  await browser.close();
  function report(r, errors, dir, sec) {
  if (!r.tones.length) r.tones = [...new Set(r.moans.map(m => m.tone))];
  const label = FROM ? '(' + FROM + ' から)' : mode || '(全年齢版)';
  console.log('== moan-audit', dir, label, '回数', r.runs, '口調', r.tones.length, '箱庭', (r.scens || []).length, '失敗', r.err.length, 'ページのエラー', errors.length, '秒', sec);
  if (r.err.length) console.log('  失敗の例', r.err.slice(0, 3));
  if (errors.length) console.log('  ページのエラー', errors.slice(0, 3));
  if (r.fit !== undefined && FIT) console.log('  喘ぎ声の調整:', JSON.stringify(r.fit));
  if (r.dictErr && r.dictErr.length) console.log('  辞書の読めなかった行:', r.dictErr.slice(0, 3));
  if (r.safe || !r.full) {
    console.log('(d) 全年齢での喘ぎの混入:', r.safeHits.length);
    r.safeHits.slice(0, SHOW).forEach(h => console.log('   [' + h.why + '] ' + h.tone + ' ' + h.id + '#' + h.s + ' 「' + h.q + '」 … ' + h.ctx));
    if (JS) fs.writeFileSync(JS, JSON.stringify(r));
    return;
  }
  /* (a) 規則に当てる */
  const hits = [];
  r.moans.forEach(m => { MOAN_RULES.check(m.q, m.tone, m.g).forEach(nm => hits.push(Object.assign({ rule: nm }, m))); });
  console.log('喘ぎ', r.moans.length, '（HK.Moan が作った声', r.gen, '・うち本文で見つかった', r.genMatched, '）');
  /* 台詞＝喘ぎの表にない、言い換えを通る山場の台詞（場面のファイルの台詞。台詞の口調の点検 lint.js の受け持ち）。喘ぎ＝HK.Moan の声・喘ぎの表・山場／寸前の声の表 */
  const hD = hits.filter(h => h.src === '台詞').length;
  console.log('(a) 口調・性別に合わない語尾:', hits.length, '件（異なる文', new Set(hits.map(h => h.tone + h.g + h.q)).size, '）＝ 喘ぎ', hits.length - hD, '＋ 台詞（参考）', hD);
  const bD = r.dup.filter(d => d.src === 'l' || d.src === 'q').length;
  console.log('(b) 同じ場面で同じ喘ぎが2回:', r.dup.length, '＝ 喘ぎ', r.dup.length - bD, '＋ 台詞（参考）', bD);
  const gm = r.moans.filter(m => m.toned >= 0), tonedN = gm.filter(m => m.toned > 0).length;
  if (DICT || OWN) {
    const us = r.moans.filter(m => /user:/.test(m.src)), un = us.filter(m => /user:novel/.test(m.src));
    console.log('利用者の辞書の行が記録に出た数:', us.length, '＝ 男性向け', us.filter(m => m.style === 'ero').length, '・小説調', us.filter(m => m.style === 'novel').length, '（うち小説調の鍵 [小説 …] の行', un.length, '）');
  }
  console.log('(c) 口調の語尾が付いた喘ぎ（HK.Moan が作った声 ' + gm.length + ' のうち）: 全体', (100 * tonedN / Math.max(1, gm.length)).toFixed(1) + '%');
  /* 口調 × 性別 × 作風 の表 */
  const key = m => m.tone + '\t' + m.g + '\t' + m.style;
  const tot = {}, bad = {}, tn = {}, gn = {};
  r.moans.forEach(m => { const k = key(m); tot[k] = (tot[k] || 0) + 1; if (m.toned >= 0) gn[k] = (gn[k] || 0) + 1; if (m.toned > 0) tn[k] = (tn[k] || 0) + 1; });
  hits.forEach(m => { if (m.src === '台詞') return; const k = key(m); bad[k] = (bad[k] || 0) + 1; });
  console.log('\n口調\t性別\t作風\t(a 台詞を除く)/喘ぎ\t(c)口調の語尾（HK.Moan の声の数）');
  const over = [];
  r.tones.forEach(t => ['f', 'm'].forEach(g => ['novel', 'ero'].forEach(st => {
    const k = t + '\t' + g + '\t' + st; if (!tot[k]) return;
    const rate = (tn[k] || 0) / Math.max(1, gn[k] || 0);
    if (rate > 0.3 && (gn[k] || 0) >= 20) over.push(k.replace(/\t/g, '・') + ' ' + (100 * rate).toFixed(0) + '%');
    if (bad[k] || (rate > 0.3 && (gn[k] || 0) >= 20) || WHY) console.log(k + '\t' + (bad[k] || 0) + '/' + tot[k] + '\t' + (100 * rate).toFixed(0) + '%（' + (gn[k] || 0) + '）' + (rate > 0.3 && (gn[k] || 0) >= 20 ? ' ＞3割' : ''));
  })));
  console.log('(c) 3割を超えた組（喘ぎ20以上）:', over.length, over.slice(0, 20).join('、'));
  /* 規則ごと・口調ごとの例 */
  const byRule = {};
  hits.forEach(h => { const k = h.rule; (byRule[k] = byRule[k] || {}); const u = h.tone + '/' + h.g + '｜' + h.q; byRule[k][u] = byRule[k][u] || { n: 0, h }; byRule[k][u].n++; });
  Object.keys(byRule).sort().forEach(k => {
    const us = Object.values(byRule[k]).sort((a, b) => b.n - a.n), n = us.reduce((x, y) => x + y.n, 0);
    console.log('\n### (a) ' + k + '　' + n + '件（異なる文 ' + us.length + '）');
    us.slice(0, SHOW).forEach(u => console.log('  ' + u.n + '× [' + u.h.tone + '/' + u.h.g + '/' + u.h.style + '/' + u.h.id + '] 「' + u.h.q + '」' + (WHY ? '  ← ' + u.h.src : '')));
  });
  if (r.dup.length) {
    console.log('\n### (b) 同じ場面で同じ喘ぎ　' + r.dup.length + '件');
    r.dup.slice(0, SHOW).forEach(d => console.log('  [' + d.tone + '/' + d.g + '/' + d.style + '/' + d.id + '#' + d.s + '] 「' + d.q + '」' + (WHY ? '  ← ' + d.src : '')));
  }
  /* 夜の性格・喘ぎの口調の効き */
  if (r.nightFx && r.nightFx.length) {
    /* --moanfit の夜の性格→声の基盤（night）を当てていれば、その態度を期待にする（'off' は口調の態度のままなので数えない） */
    const EXP = Object.assign({ sadist: 'proud', maso: 'devoted', mean: 'free', sweet: 'gentle', shy: 'shy' }, (r.fit && r.fit.night) || {});
    if (r.fit && r.fit.night) console.log('（喘ぎ声の調整の夜の性格→声の基盤：' + JSON.stringify(r.fit.night) + '）');
    console.log('\n### 夜の性格の効き（HK.Moan の声。期待：サド＝強気の基盤／マゾ＝健気の基盤・懇願 b が増える／意地悪＝奔放の基盤・攻めで t3 が増える／甘々＝穏やかの基盤／恥じらい＝恥じらいの基盤・声を抑える h が増える）');
    console.log('設定\t本人\t声の数\t夜の性格が届いた\t期待の基盤（基盤の声のうち）\tb 懇願\th 抑える\tt3 かわいい\tw3 限界');
    const grpK = {}; r.nightFx.forEach(x => { const k = (x.set || '(なし)') + '\t' + (x.own || '-'); (grpK[k] = grpK[k] || []).push(x); });
    Object.keys(grpK).forEach(k => {
      const l = grpK[k], own = l[0].own, exp = own === 'match' ? 'maso' : own, b = l.filter(x => x.base), pc = (f, ll) => (100 * (ll || l).filter(f).length / Math.max(1, (ll || l).length)).toFixed(0) + '%';
      console.log(k + '\t' + l.length + '\t' + (exp ? pc(x => x.nt === exp) : '-') + '\t' + (EXP[exp] ? pc(x => x.ps === EXP[exp], b) + '（' + b.length + '）' : '-') + '\t' + pc(x => /^b/.test(x.key)) + '\t' + pc(x => /^h/.test(x.key)) + '\t' + pc(x => x.key === 't3') + '\t' + pc(x => x.key === 'w3'));
    });
  }
  if (r.mtFx && r.mtFx.n) console.log('\n### 喘ぎの口調の効き：HK.Moan の声 ' + r.mtFx.n + ' のうち、喘ぎの口調（' + MT + '）で作った声 ' + (100 * r.mtFx.hit / r.mtFx.n).toFixed(1) + '%');
  if (JS) fs.writeFileSync(JS, JSON.stringify(Object.assign({}, r, { hits })));
  }
})();
