/* 自分の口調に言及する台詞の点検（2026-11-04。利用者の指摘「あぅ……♡　敬語、うまく、つかえな……っ♡ のような、自分の口調に触れる喘ぎは変」）
   使い方（リポジトリの根で）: node hakoniwa-tools/tone-check/meta-tone-audit.js [1箱庭あたりの回数=8] [箱庭id,…] [--why] [--full=hakoniwa-full] [--zen=hakoniwa-zenrei]
   R18版（#r18。喘ぎ・夜の場面を濃く）と全年齢版を回して、記録の台詞・喘ぎ（e.seg の l・q・m・u。名詞の引用 c と地の文 n は見ない）から、
   話し手が自分の話し方に触れる語（敬語・言葉遣い・口調・タメ口・丁寧語・ですます・〜って言い方・キャラ・しゃべり方…）を含むものを数える。目標 0 件。
   残してよい言い方（会話として自然な言い方の相談・相手への求め）は OK の表で外す：
     ・相手に敬語をやめようと持ちかける（「じゃあ敬語やめよ」「敬語いらないですね」）
     ・相手の言葉遣いを求める・評する（「言葉遣いは丁寧に」「そういう話し方、するんだ」）
     ・場面が口癖そのものを話題にしている（バイト先の癖で敬語になる二人の場面）
   崩れは文の形（敬語が途中で途切れる・言い切れない・名前だけ呼ぶ）で見せ、語り手が描く地の文（「{a}の丁寧な言葉遣いが崩れた」）は残してよい。
   決まりは CLAUDE.md の R18 の文の基準・js/moan-top-said.js の冒頭 */
'use strict';
const { openBuild } = require('./lib.js');
const args = process.argv.slice(2), flags = args.filter(a => /^--/.test(a)), pos = args.filter(a => !/^--/.test(a));
const flag = (k, d) => { const f = flags.find(a => a.startsWith('--' + k + '=')); return f ? f.slice(k.length + 3) : d; };
const N = +pos[0] || 8, WHY = flags.includes('--why');
const only = (pos[1] || process.env.HK_ONLY_SCEN || '').split(',').filter(Boolean);
const FULL = flag('full', 'hakoniwa-full'), ZEN = flag('zen', 'hakoniwa-zenrei');
/* 自分の話し方に触れる語 */
const KW = '敬語|言葉遣い|言葉づかい|ことばづかい|口調|タメ口|ため口|タメ語|丁寧語|ですます|です・ます|って言い方|という言い方|キャラ(?!メル|クター)|しゃべり方|喋り方|話し方|(?:ていねい|丁寧)に[、…っ・ 　]*(?:しゃべ|はな|話|でき|いえ|言え)';
/* 残してよい言い方（会話として自然なもの） */
const OK = [
  /敬語(?:は|を|、)?\s*(?:やめ|なし|いらな|使わなくて|はいらな)/,
  /敬語[、…]*\s*(?:や、)?やめ/,
  /言葉遣い[はを、]*\s*丁寧に/,
  /そういう(?:話し方|しゃべり方|言い方)/,
  /ここでも敬語にな/,
  /敬語で(?:話す相手|呼び合)/
];

/* ---------- 表の行（静的）：記録に出にくい表の行も漏らさないよう、ソースの文字列を直接なめる ----------
   喘ぎの表（moan-*・ero-moan-tone・novel-moan-tone・solo-r18-moan*・ero-kit）と口調の書き下ろし（tone-*・voice-override-*）は、
   文字列を | と \t で区切った一つ一つ（話し言葉らしいもの：♡・…・。・っ などを含む）を、ほかの js は文字列の中の「」の中身を見る。コメントは見ない */
const fs = require('fs'), path = require('path');
function strings(src) {
  const out = []; let i = 0, prev = '';
  while (i < src.length) {
    const c = src[i], d = src[i + 1];
    if (c === '/' && d === '/') { const j = src.indexOf('\n', i); i = j < 0 ? src.length : j; continue; }
    if (c === '/' && d === '*') { const j = src.indexOf('*/', i + 2); i = j < 0 ? src.length : j + 2; continue; }
    if (c === '\'' || c === '"' || c === '`') {
      let j = i + 1, buf = '';
      while (j < src.length && src[j] !== c) { if (src[j] === '\\') { buf += src[j] + src[j + 1]; j += 2; continue; } buf += src[j]; j++; }
      out.push({ s: buf, line: src.slice(0, i).split('\n').length }); i = j + 1; prev = c; continue;
    }
    if (c === '/' && /[(,=:[!&|?{};+\-*%<>~^]|^$/.test(prev)) {
      let j = i + 1, cls = false;
      while (j < src.length && src[j] !== '\n') { if (src[j] === '\\') { j += 2; continue; } if (src[j] === '[') cls = true; else if (src[j] === ']') cls = false; else if (src[j] === '/' && !cls) break; j++; }
      i = j + 1; prev = '/'; continue;
    }
    if (!/\s/.test(c)) prev = /[A-Za-z0-9_$)\]]/.test(c) ? 'w' : c;
    i++;
  }
  return out;
}
const TABLE = /^(?:moan-|ero-moan-tone|novel-moan-tone|solo-r18-moan|ero-kit|tone-|voice-override)/;
/* 見ない js：口調の仕組み・設定の画面・TIPS・属性の説明（画面の文字で、台詞ではない） */
const SKIP = /^(?:tone-(?:dict-builtin|engine|registry|ending|plus|keigo-unify|extra2|sample-fix)|moan-engine|event-catalog|tips(?:-[a-z-]+)?|attr|attr-yomi|persona(?:-[a-z]+)?)\.js$|^(?:ui|view)[-.]/;
function scanStatic(dirs) {
  const KWR = new RegExp(KW), hits = [], okHits = [];
  let files = 0, pieces = 0;
  dirs.forEach(dir => {
    if (!fs.existsSync(dir)) return;
    fs.readdirSync(dir).filter(f => f.endsWith('.js') && !SKIP.test(f)).forEach(f => {
      files++;
      const tab = TABLE.test(f);
      strings(fs.readFileSync(path.join(dir, f), 'utf8')).forEach(x => {
        const cand = [];
        if (tab) x.s.split(/\||\\t|\t/).forEach(p => { if (/[♡…。！？っ、]/.test(p)) cand.push(p); });
        const re = /「([^「」]*)」/g; let m; while ((m = re.exec(x.s))) m[1].split(/[｜|]/).forEach(p => cand.push(p));
        cand.forEach(p => {
          pieces++;
          if (!KWR.test(p)) return;
          const ex = path.relative(process.cwd(), path.join(dir, f)) + ':' + x.line + ' ' + p.slice(0, 100);
          (OK.some(r => r.test(p)) ? okHits : hits).push(ex);
        });
      });
    });
  });
  return { files, pieces, hits, okHits };
}

function pass(HK, o) {
  const KWR = new RegExp(o.kw), OKR = o.ok.map(s => new RegExp(s));
  const NAMES = ['アキラ', 'ミナト', 'ユキノ', 'カオル', 'ハルカ', 'レンジ'], tones = HK.TONE_KEYS.slice();
  const out = { runs: 0, err: [], n: 0, ok: 0, ex: [], okEx: [], scen: {}, lines: 0 };
  const ids = (o.only.length ? o.only : HK.SCEN_ORDER).filter(id => HK.SCENARIOS[id]);
  const POS = ['top', 'bottom', 'riba', 'bottom', 'top', ''];
  let ti = 0;
  for (const sc of ids) {
    const scen = HK.SCENARIOS[sc];
    for (let s = 0; s < o.N; s++) {
      const n = Math.max(scen.minCast || 2, Math.min(scen.maxCast || 6, s % 3 ? 6 : 2));
      const chars = [], perChar = [];
      for (let i = 0; i < n; i++) {
        chars.push({ name: NAMES[i], eg: { CP: (s * 7 + i * 5) % 21, NP: (s * 3 + i * 11) % 21, A: (s * 13 + i * 3) % 21, FC: (s * 5 + i * 7) % 21, AC: (s * 11 + i * 3) % 21 }, memo: '', gender: (i + s) % 3 === 0 ? 'm' : (i + s) % 3 === 1 ? 'f' : (s % 2 ? 'm' : 'f'), likes: '', tone: tones[(ti++) % tones.length], fp: '', pos: s % 4 === 3 ? POS[(i + s) % POS.length] : '', posLike: '', color: '', call: '', calls: {}, loveLock: '', genital: '' });
        perChar.push({ action: 'auto', goal: 'auto', stats: {}, weapon: '', pick: {} });
      }
      const env = {}; (scen.env || []).forEach(e => { env[e.id] = e.def != null ? e.def : (e.options && e.options[0] ? e.options[0].v : (e.min != null ? e.min : '')); });
      /* R18版：moan-audit.js と同じ濃い設定（作風・濃さを回ごとに変える。内容のスイッチはすべて入） */
      if (o.lewd) {
        const style = s % 2 ? 'ero' : 'novel', lewd = Math.floor(s / 2) % 2 ? 'high' : 'mid';
        (scen.env || []).forEach((e, k) => {
          if (e.max != null && /lewd|dose|shady|heat|npc|prey|depth|skill|monsters|pleasure|traffic|ev$/.test(e.id)) env[e.id] = e.max;
          else if (e.options && e.options.some(x => x.v === 'high') && /lewd/.test(e.id)) env[e.id] = 'high';
          else if (e.options && e.options.length > 1 && !/lewd|^mode$|^style$/.test(e.id) && (s + k) % 2) env[e.id] = e.options[(s + k) % e.options.length].v;
          if (e.id === 'mode' && e.options && e.options.some(x => x.v === 'lewd')) env[e.id] = 'lewd';
        });
        if ('style' in env) env.style = style;
        if ('lewd' in env && (scen.env || []).some(e => e.id === 'lewd' && e.options && e.options.some(x => x.v === lewd))) env.lewd = lewd;
        if (HK.Content && env.ct == null) env.ct = HK.Content.TAGS.map(t => t.id).join(',');
      }
      const ties = s % 3 === 2 ? [{ a: 0, b: 1, type: ['lover', 'fwb'][s % 2] }] : [];
      let res;
      try { res = HK.simulate({ scenId: sc, seed: 8100 + s * 31 + sc.length, env, chars, perChar, ties }); }
      catch (e) { out.err.push(sc + '#' + s + ' ' + String(e && e.stack || e).slice(0, 200)); continue; }
      out.runs++;
      const segs = [];
      (res.log || []).forEach(e => {
        if (!e || typeof e.text !== 'string') return;
        if (Array.isArray(e.seg)) e.seg.forEach(g => { if (g && /^[lqmu]$/.test(g.t)) segs.push({ s: g.s, who: g.who }); });
        else (HK.Seg && HK.Seg.quotes ? HK.Seg.quotes(e.text) : []).forEach(x => segs.push({ s: e.text.slice(x.a, x.b + 1) }));
      });
      segs.forEach(g => {
        const t = String(g.s || '').replace(/[⁠⁤]/g, '');
        out.lines++; if (/♡/.test(t)) out.heart = (out.heart || 0) + 1;
        if (!KWR.test(t)) return;
        const who = g.who != null && chars[g.who] ? chars[g.who].name + '（' + chars[g.who].tone + '）' : '';
        const ex = sc + '#' + s + ' ' + who + '：' + t.slice(0, 120);
        if (OKR.some(r => r.test(t))) { out.ok++; if (out.okEx.length < 10) out.okEx.push(ex); return; }
        out.n++; out.scen[sc] = (out.scen[sc] || 0) + 1;
        if (out.ex.length < 40) out.ex.push(ex);
      });
    }
  }
  return out;
}

(async () => {
  let bad = 0;
  const PK = path.join(__dirname, '..', '..', 'hakoniwa-packs');
  const packs = fs.existsSync(PK) ? fs.readdirSync(PK).filter(p => !/^[._]/.test(p)).map(p => path.join(PK, p, 'js')) : [];
  const st = scanStatic([path.join(FULL, 'js'), path.join(ZEN, 'js')].concat(packs));
  console.log('表の行（静的）：' + st.files + ' ファイル・' + st.pieces + ' 行');
  console.log('  自分の口調に言及する台詞：' + st.hits.length + ' 件');
  st.hits.slice(0, WHY ? 60 : 20).forEach(e => console.log('    ' + e));
  console.log('  残してよい言い方（参考）：' + st.okHits.length + ' 件');
  if (WHY) st.okHits.slice(0, 40).forEach(e => console.log('    ' + e));
  bad += st.hits.length;
  for (const [dir, hash, label, lewd] of [[FULL, 'r18', 'R18版', true], [ZEN, '', '全年齢版', false]]) {
    const { browser, page, errors } = await openBuild(dir, hash, {});
    const r = await page.evaluate(([src, o]) => (new Function('return ' + src)())(window.HK, o), [pass.toString(), { N, only, kw: KW, ok: OK.map(x => x.source), lewd }]);
    console.log(label + '：回した回数 ' + r.runs + '・台詞と喘ぎ ' + r.lines + '（♡のあるもの ' + (r.heart || 0) + '）・エラー ' + r.err.length);
    r.err.slice(0, 5).forEach(e => console.log('  ' + e));
    console.log('  自分の口調に言及する台詞：' + r.n + ' 件' + (r.n ? '（' + Object.keys(r.scen).map(k => k + ' ' + r.scen[k]).join('、') + '）' : ''));
    if (WHY || r.n) r.ex.forEach(e => console.log('    ' + e));
    console.log('  残してよい言い方（参考）：' + r.ok + ' 件');
    if (WHY) r.okEx.forEach(e => console.log('    ' + e));
    if (errors.length) console.log('  ページのエラー: ' + errors.slice(0, 3).join(' / '));
    bad += r.n + r.err.length;
    await browser.close();
  }
  console.log('自分の口調に言及する台詞（合計）：' + bad + ' 件');
  console.log(bad ? '要確認' : 'すべて合格');
  process.exit(bad ? 1 : 0);
})();
