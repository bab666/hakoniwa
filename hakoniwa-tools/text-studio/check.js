/* 文の不整合の点検（scan.js の索引から）
   check(索引, もう片方のビルドの索引) → [{ rule, level, f, line, path, msg, s, e }]
   level: error（直したほうがよい）／warn（見ておく）／info（目安） */
'use strict';
const { PERSONA_KEYS } = require('./scan.js');

const PAIRS = [['「', '」'], ['『', '』'], ['（', '）']];
const PH = /\{([a-z]+)\}/g;

function bracketMsg(t) {
  for (const [o, c] of PAIRS) {
    let d = 0;
    for (const ch of t) { if (ch === o) d++; else if (ch === c) { d--; if (d < 0) break; } }
    if (d !== 0) return o + c + ' の数が合わない';
  }
  return '';
}

/* 文の数（。！？で区切る） */
function sentences(t) { return t.replace(/\{[a-z0-9_]+\}/g, 'X').split(/[。！？!?]+/).filter(x => x.trim()).length; }

function check(idx, other) {
  const out = [];
  const push = (rule, level, f, g, msg, it) => out.push({ rule, level, f: f.f, line: g.line, path: g.path, msg, s: it ? it.s : g.s, e: it ? it.e : g.e, seg: it && it.seg != null ? it.seg : undefined });
  const r18Only = new Set();
  if (other) {
    const o = new Set(other.files.map(f => f.f));
    idx.files.forEach(f => { if (!o.has(f.f)) r18Only.add(f.f); });
  }
  idx.files.forEach(f => {
    if (f.error) out.push({ rule: '構文エラー', level: 'error', f: f.f, line: 0, path: '', msg: f.error });
    f.groups.forEach(g => {
      const code = g.role === 'code';
      /* 台詞を「切り出し」と「締め」に分けてつなぐ群（人狼の J.open／J.close など）：括弧の足りない向きが全部そろっていれば切れ端とみなす */
      const dirs = g.items.map(it => { const t = it.text; let d = 0; for (const ch of t) { if (ch === '「' || ch === '『' || ch === '（') d++; else if (ch === '」' || ch === '』' || ch === '）') d--; } return Math.sign(d); });
      const pieces = dirs.filter(Boolean);
      const fragGroup = g.frag || (pieces.length && pieces.length >= g.items.length / 2 && pieces.every(d => d === pieces[0]));
      const seen = {};
      g.items.forEach(it => {
        const texts = it.cols ? it.cols : [it.text];
        texts.forEach(t => {
          if (it.enc !== 'expr' && !fragGroup && !code) {
            const b = bracketMsg(t);
            if (b && t.length < 400) push('括弧の対応', 'warn', f, g, b + '：' + t.slice(0, 60), it);
          }
          /* 「。」のように記号そのものを括弧でくくった説明は除く */
          if (!code && /。。|、、|、。|。、|「。(?!」)|「、(?!」)/.test(t)) push('句読点の重なり', 'warn', f, g, t.slice(0, 60), it);
          if (it.enc !== 'expr' && /\{[^}]*$|^[^{]*\}/.test(t.replace(/\{[a-z0-9_]+\}/g, ''))) push('置き換え記号の崩れ', 'error', f, g, t.slice(0, 60), it);
        });
        /* 最後が空（'…|'）は「何も足さない」候補として書かれていることが多いので目安に。途中の空（'||'）は直したほうがよい */
        if (it.enc === 'pipe' && it.text === '') {
          if (it.seg === g.items.length - 1) push('最後が空の「|」（何も足さない候補）', 'info', f, g, (it.seg + 1) + '番目が空', it);
          else push('空の候補', 'error', f, g, '「|」区切りに空の候補がある（' + (it.seg + 1) + '番目）', it);
        }
        if ((it.enc === 'lit') && it.text.trim() === '') push('空の候補', 'error', f, g, '空の文', it);
        const key = it.text;
        /* 短い候補の重複（['施術着', '施術着', …]）は出やすさの重みづけのことが多い。言い換えの表（コード）は対象外 */
        if (key && seen[key] && !code) {
          if (key.replace(/\t.*$/, '').length >= 8 || it.enc === 'tsv') push('同じ候補の重複', 'warn', f, g, it.text.replace(/\t/g, ' ｜ ').slice(0, 80), it);
          else push('短い候補の重複（重みづけ？）', 'info', f, g, it.text.slice(0, 40), it);
        }
        seen[key] = 1;
      });
      /* R18専用のファイルで、候補が1つ・2文以下で固定の段（「1文だけで固定の段を作らない」）。長い段落や、式の一部は除く */
      if (r18Only.has(f.f) && !g.frag && !code && g.role === 'text' && (g.kind === 'array' || g.kind === 'pipe') && g.items.length === 1 &&
        g.items[0].enc !== 'expr' && g.items[0].text.length > 8 && sentences(g.items[0].text) <= 2) push('候補が1つだけの段（R18）', 'info', f, g, g.items[0].text.slice(0, 60));
    });
  });

  /* 態度9種の表の抜け：キーが態度9種のうち5つ以上ある表で、そろっていないもの。
     敬語（polite）は、表になければ persona-final.js が健気（devoted）の行を借りて埋める（台詞はです・ます調に整う）ので数えない */
  idx.files.forEach(f => {
    (f.ptables || []).forEach(t => {
      const miss = PERSONA_KEYS.filter(p => p !== 'polite' && t.keys.indexOf(p) < 0);
      if (miss.length) out.push({ rule: '態度9種の表の抜け', level: 'warn', f: f.f, line: t.line, path: t.path, msg: (t.path || '表') + ' に ' + miss.join('・') + ' がない', s: t.s, e: t.e });
    });
  });

  /* 全年齢版との差：両方にあるファイルで、同じ場所（パス）の群の文が違う */
  if (other) {
    const om = {};
    other.files.forEach(f => { om[f.f] = f; });
    idx.files.forEach(f => {
      const o = om[f.f];
      if (!o) return;
      /* 台詞・地の文・解説だけを比べる（画面の説明・ヒントは、版ごとに書き分けていることが多い） */
      const sig = file => { const m = {}; file.groups.filter(g => g.role === 'text' || g.role === 'why').forEach(g => { const k = g.kind + ' ' + g.path; (m[k] = m[k] || []).push(g.items.map(it => it.text).join('\u0001')); }); return m; };
      const a = sig(f), b = sig(o);
      const diff = [];
      Object.keys(a).forEach(k => { if (!b[k]) diff.push({ k, why: 'もう片方にない' }); else if (a[k].join('\u0002') !== b[k].join('\u0002')) diff.push({ k, why: '文が違う' }); });
      Object.keys(b).forEach(k => { if (!a[k]) diff.push({ k, why: 'こちらにない' }); });
      /* R18版・全年齢版で書き分けている所（.r18／.safe）は対象外 */
      diff.filter(d => !/(^|\.)(r18|safe|R18|SAFE)(\.|$)/.test(d.k.replace(/^\w+ /, ''))).slice(0, 50).forEach(d => {
        const g = f.groups.find(x => x.kind + ' ' + x.path === d.k) || o.groups.find(x => x.kind + ' ' + x.path === d.k) || { line: 0, path: d.k, s: 0, e: 0 };
        out.push({ rule: '全年齢版と違う所（同名ファイル）', level: 'info', f: f.f, line: g.line, path: d.k.replace(/^\w+ /, ''), msg: d.why + '：' + d.k.replace(/^\w+ /, ''), s: g.s, e: g.e });
      });
    });
  }
  return out;
}
module.exports = { check };
