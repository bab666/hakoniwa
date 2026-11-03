/* 第1回（MX）：敬語まじりのため口（mixed）の判定。元は作業者の scratchpad の MX/check.js（判定 (a)〜(d)。(e) 目視は入れていない） */
'use strict';
let TONE = '';
/* ---- ここから元の判定の規則（そのまま写した） ---- */

const RX_A = /お声|お口|お顔|おっしゃ|いらっしゃ|いたしま|よろし(?!く)|ございま|ご覧|なさって/;
const broken = s => /[♡ぁぃぅぇぉ]|っ[…。！？!?]*$|……っ/.test(s);
// 文に分ける
function sents(s) {
  return s.replace(/[「」]/g, '').split(/(?<=[。！？!?])|　+|(?<=……)(?=[^……っ！？。、])/).map(x => x.trim()).filter(x => x && !/^[…・ー―。、！？!?\s]+$/.test(x));
}
function core(x) { return x.replace(/[…・ー―〜。、！？!?\s　]+$/g, '').replace(/^[…・ー―\s　]+/, ''); }
const PART = /(よね|よ|ね|か|って|から|けど|し|な|わ|の|ってば|かな|かも)$/;
function kind(x) {
  let c = core(x);
  for (let i = 0; i < 3; i++) { const d = c.replace(/(ってば|よね|かな|って|から|けど|よ|ね|か|し|な|わ|ので|のに)$/, ''); if (d === c) break; c = d.replace(/[、…]+$/, ''); }
  if (/(です|ます|ません|ました|でしょう|ましょう|ください|でした|ませんでした|ございます|ません)$/.test(c)) return 'K';
  if (/(ありがとう|すみません|お願い)$/.test(c) && /すみません|ございます/.test(c)) return 'K';
  if (core(x).length <= 3 || /^(はい|うん|ええ|いや|あ|え|お|ん|ほら|ねえ|あの|えっと|うわぁ?|わ|へえ|ふふ|あはは)$/.test(core(x))) return 'N';
  return 'T';
}
const REQ = /(て|てよ|ないで|しろ|して|ちょうだい|てくれ|てね|てて)$|(だから|なんだ|んだ|からね|からさ)$|ほしい/;
function overlap(a, b) {
  // 記号を除いた字の重なり（2字の並びで数える。1字ずつだと「ない」「です」だけで重なってしまうため）
  a = a.replace(/[^\p{L}\p{N}]/gu, ''); b = b.replace(/[^\p{L}\p{N}]/gu, '');
  if (a.length < 2 || b.length < 2) return 0;
  const bg = x => { const m = {}; for (let i = 0; i + 1 < x.length; i++) { const k = x.slice(i, i + 2); m[k] = (m[k] || 0) + 1; } return m; };
  const [s, l] = a.length <= b.length ? [a, b] : [b, a];
  const ms = bg(s), ml = bg(l); let k = 0, n = 0;
  for (const g in ms) { n += ms[g]; k += Math.min(ms[g], ml[g] || 0); }
  return k / n;
}
const RELIEF = /大丈夫|なんとか|何とか|でき|平気|間に合|あり|ある|なる|なり/;
/* ---- ここまで元の判定の規則 ---- */

function judge(tone, r) {
  const s = r.s, why = [];
  if (RX_A.test(s.replace(/ありがとうございま/g, '').replace(/よろしく/g, ''))) why.push('(a) 尊敬語・謙譲語');
  const ss = sents(s), ks = ss.map(kind);
  for (let i = 0; i + 1 < ss.length; i++) {
    if ((ks[i] === 'K' && ks[i + 1] === 'T' || ks[i] === 'T' && ks[i + 1] === 'K') && overlap(ss[i], ss[i + 1]) >= 0.6) { why.push('(b) 同じ内容の二度言い'); break; }
  }
  if (!broken(s)) {
    const nn = ss.map((x, i) => [x, ks[i]]).filter(p => p[1] !== 'N');
    if (nn.length >= 2) {
      if (nn.every(p => p[1] === 'K')) why.push('(c) 2 文以上で全部敬語');
      else if (nn.every(p => p[1] === 'T') && nn.some(p => REQ.test(core(p[0])))) why.push('(c) 頼み・説明までため口');
    }
  }
  for (const x of ss) if (/(ます|です)って/.test(x) && !RELIEF.test(x)) { why.push('(d) 安心させる文以外の〜ますって'); break; }
  return why;
}
module.exports = { team: 'MX', round: '第1回', tones: ['mixed'], judge };
