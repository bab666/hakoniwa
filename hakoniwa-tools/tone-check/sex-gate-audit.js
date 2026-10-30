/* 性的な出来事の門の点検（2026-10-28 担当MC。利用者の指示「性的イベントは性欲＋衝動性で判定し、恋愛感情が発生を防がないように。敵対は表面上＋しづらい程度」
   「性的な出来事の発生には理性なども加味して」）
   使い方: node sex-gate-audit.js <ビルドのフォルダ> [回数=24] [r18] [箱庭,…] [--force] [--why] [--lib=high|mid|low]
   ・--lib：住人の性欲の強さ（既定 high＝強い。mid＝ふつう。敵対の倍率が確率の上限に埋もれないかを見るとき）
   ・配役：住人4〜6人（箱庭の人数の範囲で）、全員 恋愛対象「男女両方」・受け攻めおまかせ・性欲「強い」・衝動性 高め（FC 高・A 低）。
     環境値のうち恋愛・夜・媚薬などの起こりやすさは最大。内容のスイッチは「合意のない展開」だけ切（--force で入）
   ・関係（0-1 と 2-3 の二組に同じものを付ける）：
       a 恋人／b 友人（基準）／c 「恋愛：なし」の友人／d 「恋愛：なし」の恋人／e 敵対／f 不仲／g 敵対＋愛憎（双方）／h 関係なし
       i 「恋愛：なし」の友人で、全員の理性が高い（CP・AC 高。衝動性は高いまま）／j 同じく理性が低い（CP・AC 低）
   ・数えるもの：二組それぞれについて、性的な場面の記録（e.lewd）で、その二人がどちらも登場人物に入っているもの
   ・判定：b が少なすぎる箱庭（MIN_B＝12 件未満）は「対象外」（参考に敵対・不仲の割合だけ出す。2026-10-29 担当MC2：b が 8〜9 件だと、e・f が 1〜2 件揺れるだけで 4 割の線をまたぎ、
     同じ版でも ok と不具合を行き来した。ゾンビの街 b=8 で e が 3〜8 件・f が 3〜4 件）。c・d・e・f・h のどれかが b の 4 割未満なら「不具合」（敵対は目安 5〜7 割）。
     理性：j が MIN 件以上あるのに i が 0 件なら「不具合（理性で止まった）」。i／j の比を「理性」の欄に出す（1 より小さければ、理性で起きにくくなっている）
   ・終了コード：不具合が 1 件でもあれば 1 
   （2026-10-29 担当MQ）配役（パス sexgate）と判定（judge sexgate）を分けて module.exports で出す。audit-all.js の追加の配役パス（--extra=sexgate）が
     同じ関数を使う（比率の点検なので、ほかのパスの回には当てない）。使い方・出力は今までどおり */
'use strict';
const core = require('./audit/core.js');
  /* [記号, 表の見出し, 関係, 気質の上書き（理性）] */
const COND = [
    ['a', '恋人', { type: 'lover' }], ['b', '友人', { type: 'friend' }], ['c', 'なし友人', { type: 'friend', love: 'no' }], ['d', 'なし恋人', { type: 'lover', love: 'no' }],
    ['e', '敵対', { type: 'enemy' }], ['f', '不仲', { type: 'bad' }], ['g', '敵対愛憎', [{ type: 'enemy' }, { type: 'lovehate', cold: 'both' }]], ['h', '関係なし', null],
    ['i', '理性高', { type: 'friend', love: 'no' }, 'hi'], ['j', '理性低', { type: 'friend', love: 'no' }, 'lo'],
    /* 気持ちの関係（2026-10-29。設計 4 章）：愛憎・劣等感・優越を付けた組が、付けない組（友人 b）より起こりにくくなっていないこと（衝動の倍率が効いていること） */
    ['k', '友人愛憎', [{ type: 'friend' }, { type: 'lovehate', cold: 'both' }]], ['l', '友人劣等', [{ type: 'friend' }, { type: 'inferior' }]], ['m', '友人優越', [{ type: 'friend' }, { type: 'superior' }]],
    /* 恐怖（2026-10-30 担当FS）：恐怖の二人（0 が 1 を・2 が 3 を恐れる）は、合意のない展開が入のときだけ、恐れられる側が迫る形で体の関係になってよい。
       n＝恐怖だけ（スイッチ切なら 0 件であること）／o＝恐れる側が性行為の相手をほかの人に固定（0 件であること）／p＝恐れられる側の性欲「なし」（0 件であること） */
    ['n', '恐怖', { type: 'fear' }], ['o', '恐怖固定', { type: 'fear' }, 'lock'], ['p', '恐怖性欲なし', { type: 'fear' }, 'nolib']
  ];

/* ---------- パス sexgate（ページの中）：opt = { N, only, force, lib, cond } ---------- */
const PASS = function* (HK, opt) {
  const N = opt.N || 24, only = opt.only || [], FORCE = !!opt.force, LIB = opt.lib == null ? 'high' : opt.lib, COND = opt.cond;
    const NAMES = ['アキラ', 'ユキノ', 'ミナト', 'ソラ', 'カエデ', 'ヒカル'];
    const ids = HK.SCEN_ORDER.filter(id => HK.SCENARIOS[id] && (!only.length || only.indexOf(id) >= 0));
    for (const id of ids) {
      const sc = HK.SCENARIOS[id];
      const lo = Math.max(sc.minCast || 2, 4), hi = Math.max(lo, Math.min(sc.maxCast || 6, 6));
      for (const cd of COND) {
        const k = cd[0];
        for (let s = 0; s < N; s++) {
          const n = Math.min(hi, lo + (s % 3));
          const chars = [];
          for (let i = 0; i < n; i++) {
            /* 衝動性（FC 高・A 低）はどの列も高め。理性の列だけ CP・AC（規範・慎重さ）を上げ下げする */
            const eg = { CP: (s * 7 + i * 5) % 9, NP: 6 + (s * 3 + i * 11) % 13, A: (s * 13 + i * 3) % 6, FC: 15 + (s * 5 + i * 7) % 6, AC: (s * 11 + i * 3) % 13 };
            if (cd[3] === 'hi') { eg.CP = 17 + (s + i) % 4; eg.AC = 15 + (s * 3 + i) % 6; }
            if (cd[3] === 'lo') { eg.CP = (s + i) % 3; eg.AC = (s * 3 + i) % 3; }
            chars.push({ name: NAMES[i], eg: eg, gender: (i + s) % 2 ? 'f' : 'm', likes: 'both', pos: '', tone: '', fp: '', calls: {}, memo: '', libido: LIB });
          }
          /* 恐怖の列の上書き：o は恐れる側（0・2）を互いに固定、p は恐れられる側（1・3）の性欲を「なし」に */
          if (cd[3] === 'lock') { if (n >= 4) { chars[0].sexLock = [2]; chars[2].sexLock = [0]; } else chars[0].sexLock = [-1]; }
          if (cd[3] === 'nolib') { chars[1].libido = 'none'; if (n >= 4) chars[3].libido = 'none'; }
          const env = {}; (sc.env || []).forEach(e => { env[e.id] = e.def != null ? e.def : (e.options && e.options[0] ? e.options[0].v : (e.min != null ? e.min : '')); });
          (sc.env || []).forEach(e => { if (e.max != null && /romance|love|night|lewd|heat|aphro|dose|pleasure|shady|prey/.test(e.id)) env[e.id] = e.max; });
          if (HK.Content) env.ct = HK.Content.TAGS.map(t => t.id).filter(t => FORCE || t !== 'force').join(',');
          const ties = [];
          if (cd[2]) [].concat(cd[2]).forEach(tt => { ties.push(Object.assign({ a: 0, b: 1 }, tt)); if (n >= 4) ties.push(Object.assign({ a: 2, b: 3 }, tt)); });
          yield { sc: id, s, input: { scenId: id, seed: 7300 + s * 41, env, chars, perChar: chars.map(() => ({ action: 'auto', goal: 'auto', stats: {}, pick: {}, role: '' })), ties }, meta: { k } };
        }
      }
    }
};

/* ---------- 判定 sexgate（ページの中）：opt = { why, cond } ---------- */
const JUDGE = function (HK, opt) {
  const WHY = !!opt.why, COND = opt.cond;
  const out = {};
  const oOf = id => { if (!out[id]) { out[id] = { cnt: {}, runs: 0, err: 0, ex: [] }; COND.forEach(cd => { out[id].cnt[cd[0]] = 0; }); } return out[id]; };
  return {
    accept() { return false; },
    error(run, e) { const o = oOf(run.sc), k = run.meta.k; o.err++; if (o.ex.length < 4) o.ex.push('ERR ' + k + ' ' + e.message); },
    end(run, res) {
      const o = oOf(run.sc), k = run.meta.k, n = run.input.chars.length;
          o.runs++;
          o.forceOn = /(^|,)force(,|$)/.test(String((run.input.env || {}).ct || ''));
          const prs = n >= 4 ? [[0, 1], [2, 3]] : [[0, 1]];
          (res.log || []).forEach(e => {
            if (!e || !e.lewd || !Array.isArray(e.actors)) return;
            prs.forEach(p => {
              if (e.actors.indexOf(p[0]) < 0 || e.actors.indexOf(p[1]) < 0) return;
              o.cnt[k]++;
              if (/[nop]/.test(k) && o.ex.length < 16) o.ex.push('恐怖の列 ' + k + ' ｜ ' + String(e.text).slice(0, 60) + ' ｜ why ' + String(e.why || '').slice(0, 90));
              if (WHY && o.ex.length < 16 && /[cdef]/.test(k)) o.ex.push(k + ' ' + (e.tag || e.label || '') + ' ｜ ' + String(e.text).slice(0, 70) + ' ｜ why ' + String(e.why || '').slice(0, 90));
            });
          });
    },
    finish() { return out; }
  };
};

/* ---------- 判定の表（今までの形）と、不具合の箱庭 ---------- */
function verdict(r, show) {
  /* MIN：理性の判定（j がこの件数以上あるのに i が 0）。MIN_B：関係の比の判定に要る友人 b の件数（これ未満は揺れが大きいので対象外） */
  const MIN = 6, MIN_B = 12, bad = [];
  show && console.log('箱庭'.padEnd(10), COND.map(c => (c[0] + ' ' + c[1]).padEnd(8)).join(' '), ' 判定');
  for (const id in r) {
    const o = r[id], c = o.cnt, b = c.b;
    let v = '';
    if (b < MIN_B) v = '対象外（友人の夜が ' + b + ' 件。' + MIN_B + ' 件未満は揺れが大きい' + (b > 0 ? '。参考：敵対 ' + Math.round(c.e / b * 100) + '%・不仲 ' + Math.round(c.f / b * 100) + '%' : '') + '）';
    else {
      const low = ['c', 'd', 'e', 'f', 'h'].filter(k => c[k] < b * 0.4);
      v = low.length ? '不具合：' + low.map(k => k + '=' + Math.round(c[k] / b * 100) + '%').join(' ') : 'ok（敵対 ' + Math.round(c.e / b * 100) + '%・不仲 ' + Math.round(c.f / b * 100) + '%）';
      if (low.length) bad.push(id);
    }
    if (c.j >= MIN && c.i === 0) { v += '／不具合（理性で止まった）'; if (bad.indexOf(id) < 0) bad.push(id); }
    /* 気持ちの関係の列：付けない組の 85% を下回ったら不具合（しづらくしない原則。比べる側が MIN_B 件以上あるときだけ） */
    [['g', 'e'], ['k', 'b'], ['l', 'b'], ['m', 'b']].forEach(([x, y]) => { if (c[x] != null && c[y] >= MIN_B && c[x] < c[y] * 0.85) { v += '／不具合：' + x + '=' + Math.round(c[x] / c[y] * 100) + '%（' + y + ' 比）'; if (bad.indexOf(id) < 0) bad.push(id); } });
    if (c.j > 0) v += '／理性 高÷低 ' + Math.round(c.i / c.j * 100) + '%';
    /* 恐怖の列（2026-10-30 担当FS）：スイッチ切の恐怖の夜・固定を越えた恐怖の夜・恐れられる側の性欲「なし」での恐怖の夜は 1 件でも不具合 */
    const fz = [];
    if (c.n > 0 && !o.forceOn) fz.push('n=' + c.n + '（スイッチ切）');
    if (c.o > 0) fz.push('o=' + c.o + '（固定を越えた）');
    if (c.p > 0) fz.push('p=' + c.p + '（性欲なし）');
    if (fz.length) { v += '／不具合：恐怖の夜 ' + fz.join(' '); if (bad.indexOf(id) < 0) bad.push(id); }
    show && console.log(id.padEnd(10), COND.map(cd => String(c[cd[0]]).padEnd(8 + cd[1].length)).join(' '), v, o.err ? 'err ' + o.err : '');
    if (show) o.ex.forEach(x => console.log('    ' + String(x).replace(/\n/g, ' ')));
  }
  return bad;
}
function print(r, errors, o) {
  const FORCE = o.force, LIB = o.lib;
  const bad = verdict(r, true);
  console.log('不具合の箱庭', bad.length, bad.join(' '), FORCE ? '（合意のない展開：入）' : '（合意のない展開：切）', '性欲 ' + (LIB || 'ふつう'));
  console.log('pageerr', errors.slice(0, 3));
  if (bad.length || errors.length) process.exitCode = 1;
}
function summarize(r) {
  const bad = verdict(r, false);
  let runs = 0, err = 0; Object.keys(r || {}).forEach(id => { runs += r[id].runs; err += r[id].err; });
  return { items: { bad: bad.length }, ex: { bad: bad.slice(0, 6) }, info: { 回: runs }, err };
}
const LABEL = { bad: '性的な出来事の門の不具合（関係・理性で起きにくすぎる箱庭）' };
module.exports = { passes: { sexgate: PASS }, judges: { sexgate: JUDGE }, print, summarize, LABEL, COND };

if (require.main === module) (async () => {
  const args = process.argv.slice(2).filter(a => !/^--/.test(a));
  const dir = args[0], N = +args[1] || 24, mode = args[2] || 'r18', only = (args[3] || '').split(',').filter(Boolean);
  const FORCE = process.argv.includes('--force'), WHY = process.argv.includes('--why');
  const LIB = ((process.argv.find(a => /^--lib=/.test(a)) || '--lib=high').slice(6)).replace('mid', '');
  if (!dir) { console.log('使い方: node sex-gate-audit.js <ビルドのフォルダ> [回数] [r18] [箱庭,…] [--force] [--why] [--lib=high|mid|low]'); process.exit(1); }
  const t = await core.runTool({ dir, hash: mode === 'r18' ? 'r18' : mode === 'safe' ? 'safe' : '', lewdMode: 'direct', mod: module.exports, pass: 'sexgate', judge: 'sexgate', opt: { N, only, force: FORCE, lib: LIB, why: WHY, cond: COND } });
  print(t.r, t.errors, { force: FORCE, lib: LIB });
})();
