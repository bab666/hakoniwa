/* 口調の辞書（tone-engine.js）の出来を、書き下ろし辞書（tone-fix*.js の「元の台詞 → その口調の台詞」）を正解として測る
   node dict-regress.js <ビルドのフォルダ> [口調,…] [--show=20]
   例：node dict-regress.js ../../hakoniwa-full kohai,ojou,noja,kansai,gyaru --show=10
   ・元の台詞は1本（K／F／P のどれか分からない）なので、そのまま辞書に当てる（控えめな見積もり。3本化が進むと上がる）
   ・一致の段階：完全一致／文末一致（最後の文の末尾3文字）／差分の種類（文末だけ・語彙・組み替え）
   ・「組み替え」の割合が 2 割を超える口調は、辞書では届かない台詞が多い（ベースを足すか、行単位の上書きに残す）の目安 */
'use strict';
const fs = require('fs'), path = require('path');
const dir = path.resolve(process.argv[2] || '../../hakoniwa-full');
const only = process.argv[3] && !/^--/.test(process.argv[3]) ? process.argv[3].split(',') : null;
const SHOW = +((process.argv.find(a => /^--show=/.test(a)) || '').slice(7)) || 0;
/* ブラウザ用のファイルを node で動かす（window.HK のまね） */
const win = { HK: {} }, HK = win.HK;
function load(f) { new Function('window', fs.readFileSync(path.join(dir, 'js', f), 'utf8'))(win); }
HK.store = { get: () => null, set: () => false };
/* 口調の登録簿が要るので、core → persona → tone-registry → tone-plus の順に最小限読む（失敗したら名前だけの表で代える） */
try { load('core.js'); load('ego-desc.js'); load('persona.js'); load('tone-registry.js'); load('tone-plus.js'); } catch (e) { /* 依存が足りないときは下の表で */ }
if (!HK.TONES) { HK.PERSONA = HK.PERSONA || { gentle: { label: '穏やか' }, polite: { label: '敬語' }, proud: { label: '強気' } }; HK.PERSONA_KEYS = Object.keys(HK.PERSONA); HK.TONES = {}; HK.TONE_EXTRA = {}; HK.TONE_KEYS = []; HK.TONE_YOU = {}; }
HK.toneOf = HK.toneOf || (c => c.tone);
load('tone-engine.js'); load('tone-dict-builtin.js');
const T = HK.Tone;

/* 書き下ろしの対を集める */
const rows = [];
for (const f of fs.readdirSync(path.join(dir, 'js')).filter(f => /^tone-fix/.test(f))) {
  const s = fs.readFileSync(path.join(dir, 'js', f), 'utf8');
  const re = /'(\w+)\\t((?:[^'\\]|\\.)*)\\t((?:[^'\\]|\\.)*)'/g; let m;
  while ((m = re.exec(s))) { const un = x => x.replace(/\\'/g, "'").replace(/\\\\/g, '\\'); rows.push([m[1], un(m[2]), un(m[3])]); }
}
/* 差分の分類（元 → 正解）：文末だけ／語彙／組み替え */
function diff(a, b) {
  const n = a.length, m = b.length, L = Array.from({ length: n + 1 }, () => new Uint16Array(m + 1));
  for (let i = n - 1; i >= 0; i--) for (let j = m - 1; j >= 0; j--) L[i][j] = a[i] === b[j] ? L[i + 1][j + 1] + 1 : Math.max(L[i + 1][j], L[i][j + 1]);
  const spans = []; let i = 0, j = 0, cur = null;
  const push = (k, ai, bi) => { if (k === '=') { cur = null; return; } if (!cur) { cur = { ai, aj: ai, bi, bj: bi }; spans.push(cur); } if (k === '-') cur.aj = ai + 1; else cur.bj = bi + 1; };
  while (i < n && j < m) { if (a[i] === b[j]) { push('=', i, j); i++; j++; } else if (L[i + 1][j] >= L[i][j + 1]) { push('-', i, j); i++; } else { push('+', i, j); j++; } }
  while (i < n) { push('-', i, j); i++; } while (j < m) { push('+', i, j); j++; }
  return { spans, lcs: L[0][0] };
}
const SENT = /[。！？!?…‥]/;
function classify(a, b) {
  const { spans, lcs } = diff(a, b);
  if (!spans.length) return 'same';
  let struct = false, vocab = false;
  for (const s of spans) {
    const al = s.aj - s.ai, bl = s.bj - s.bi, after = a.slice(s.aj, s.aj + 1), afterB = b.slice(s.bj, s.bj + 1);
    const atEnd = (after === '' || SENT.test(after)) && (afterB === '' || SENT.test(afterB));
    if (atEnd && al <= 5) continue;
    if (s.ai === 0 && al <= 3 && bl <= 4) continue;
    if (al <= 5 && bl <= 6) vocab = true; else struct = true;
  }
  if (struct || 1 - lcs / Math.max(a.length, b.length) > 0.6) return 'struct';
  return vocab ? 'vocab' : 'end';
}
const tail3 = s => s.replace(/[。！？!?…‥♡っ、\s]+$/, '').slice(-3);
const tones = (only || Object.keys(T.dicts)).filter(k => T.dictOf(k));
console.log('口調'.padEnd(10) + '  件数  完全一致  文末一致  残り：文末だけ  語彙  組み替え');
for (const t of tones) {
  const R = rows.filter(r => r[0] === t), d = T.dictOf(t);
  const c = { n: 0, exact: 0, tail: 0, end: 0, vocab: 0, struct: 0 }, samples = [];
  for (const [, raw, fix] of R) {
    const out = T.apply(raw, d, { name: '〈〉' });
    c.n++;
    if (out === fix) { c.exact++; continue; }
    if (tail3(out) === tail3(fix)) c.tail++;
    const k = classify(out, fix); c[k === 'same' ? 'end' : k]++;
    if (samples.length < SHOW) samples.push([raw, out, fix, k]);
  }
  const pct = x => (100 * x / Math.max(1, c.n)).toFixed(0).padStart(3) + '%';
  console.log(t.padEnd(10) + String(c.n).padStart(6) + '  ' + pct(c.exact) + '      ' + pct(c.tail) + '      ' + pct(c.end) + '       ' + pct(c.vocab) + '  ' + pct(c.struct));
  samples.forEach(s => console.log('   [' + s[3] + '] ' + s[0] + '\n      → ' + s[1] + '\n      正 ' + s[2]));
}
