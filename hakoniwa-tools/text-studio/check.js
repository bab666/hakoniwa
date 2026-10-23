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
      const seen = {};
      const phSets = [];
      g.items.forEach(it => {
        const texts = it.cols ? it.cols : [it.text];
        texts.forEach(t => {
          if (it.enc !== 'expr') {
            const b = bracketMsg(t);
            if (b && t.length < 400) push('括弧の対応', 'warn', f, g, b + '：' + t.slice(0, 60), it);
          }
          if (/。。|、、|、。|。、|「。|「、/.test(t)) push('句読点の重なり', 'warn', f, g, t.slice(0, 60), it);
          if (it.enc !== 'expr' && /\{[^}]*$|^[^{]*\}/.test(t.replace(/\{[a-z]+\}/g, ''))) push('置き換え記号の崩れ', 'error', f, g, t.slice(0, 60), it);
        });
        /* 最後が空（'…|'）は「何も足さない」候補として書かれていることが多いので目安に。途中の空（'||'）は直したほうがよい */
        if (it.enc === 'pipe' && it.text === '') {
          if (it.seg === g.items.length - 1) push('最後が空の「|」（何も足さない候補）', 'info', f, g, (it.seg + 1) + '番目が空', it);
          else push('空の候補', 'error', f, g, '「|」区切りに空の候補がある（' + (it.seg + 1) + '番目）', it);
        }
        if ((it.enc === 'lit') && it.text.trim() === '') push('空の候補', 'error', f, g, '空の文', it);
        const key = it.text;
        if (key && seen[key]) push('同じ群の中の重複', 'warn', f, g, it.text.slice(0, 60), it);
        seen[key] = 1;
        const ph = new Set(); let m; PH.lastIndex = 0;
        while ((m = PH.exec(it.text))) ph.add(m[1]);
        phSets.push(ph);
      });
      /* {a}{b} と {x}{y} が一つの群に混ざる */
      const ab = phSets.some(s => s.has('a') || s.has('b')), xy = phSets.some(s => s.has('x') || s.has('y'));
      if (ab && xy && g.items.length > 1) push('置き換え記号の混在', 'info', f, g, '{a}{b} と {x}{y} が同じ群にある');
      /* R18専用のファイルで、候補が1つだけの群（「1文だけで固定の段を作らない」） */
      if (r18Only.has(f.f) && (g.kind === 'array' || g.kind === 'pipe') && g.items.length === 1 && g.items[0].text.length > 8) push('1文だけの段（R18）', 'info', f, g, g.items[0].text.slice(0, 60));
    });
  });

  /* 口調・態度ごとの表の抜け：同じ親の下に態度のキーが5つ以上あって、9つそろっていないもの */
  idx.files.forEach(f => {
    const tables = {};
    f.groups.forEach(g => {
      const segs = g.path.split('.');
      for (let i = 0; i < segs.length; i++) {
        if (PERSONA_KEYS.indexOf(segs[i]) >= 0) {
          const k = segs.slice(0, i).join('.') + '.*.' + segs.slice(i + 1).join('.');
          (tables[k] = tables[k] || { keys: new Set(), g }).keys.add(segs[i]);
          break;
        }
      }
    });
    Object.keys(tables).forEach(k => {
      const t = tables[k];
      if (t.keys.size >= 5 && t.keys.size < PERSONA_KEYS.length) {
        const miss = PERSONA_KEYS.filter(p => !t.keys.has(p));
        out.push({ rule: '態度9種の表の抜け', level: 'warn', f: f.f, line: t.g.line, path: k, msg: k + ' に ' + miss.join('・') + ' がない', s: t.g.s, e: t.g.e });
      }
    });
  });

  /* 全年齢版との差：両方にあるファイルで、同じ場所（パス）の群の文が違う */
  if (other) {
    const om = {};
    other.files.forEach(f => { om[f.f] = f; });
    idx.files.forEach(f => {
      const o = om[f.f];
      if (!o) return;
      const sig = file => { const m = {}; file.groups.forEach(g => { const k = g.kind + ' ' + g.path; (m[k] = m[k] || []).push(g.items.map(it => it.text).join('\u0001')); }); return m; };
      const a = sig(f), b = sig(o);
      const diff = [];
      Object.keys(a).forEach(k => { if (!b[k]) diff.push({ k, why: 'もう片方にない' }); else if (a[k].join('\u0002') !== b[k].join('\u0002')) diff.push({ k, why: '文が違う' }); });
      Object.keys(b).forEach(k => { if (!a[k]) diff.push({ k, why: 'こちらにない' }); });
      diff.slice(0, 50).forEach(d => {
        const g = f.groups.find(x => x.kind + ' ' + x.path === d.k) || { line: 0, path: d.k, s: 0, e: 0 };
        out.push({ rule: '全年齢版との差（同名ファイル）', level: 'info', f: f.f, line: g.line, path: d.k.replace(/^\w+ /, ''), msg: d.why + '：' + d.k.replace(/^\w+ /, ''), s: g.s, e: g.e });
      });
    });
  }
  return out;
}
module.exports = { check };
