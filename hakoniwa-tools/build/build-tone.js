/* 箱庭シミュレーター：build.js の部品（口調の書き下ろしを「データのかたまり」にする）
   _order.txt で「tone js/xx.js」と印を付けたファイル（口調の書き下ろし）は、かたまりに入れず、ここで node の vm に全部を元の順で読ませて、
   最後にできた口調の表（下の TABLES）を口調ごとのデータとして書き出す。
   ・表：HK.Voice.TONE_FIX[口調][元] ＝ 書き下ろし（F。元＝書き下ろしの行は S）／HK.Voice.TONE_FIX_G[口調][元]（G 印。F の行の3つ目に 1）／
         HK.Voice.OVR[口調][元]（O）／HK.Voice.INTENT（決まり文句の配列）の要素 x[口調]（I。id ごと）／HK.Ero.TONE_MOAN[口調][種類]（M）／HK.NovelMoan.T[口調][種類]（N）
   ・書き出すのは「tone の印のファイルが書いた行」だけ（中核などほかのファイルが書いた行は、そのファイルが今までどおり書く）。行の行き先は：
       ①その行を、中核以外のかたまり（late・pack-*・scen-*）の tone でないファイルも書く → そのかたまりの最後の def（'tone:<かたまり>'。ソースより後ろ）に入れる
         （読む順が変わっても、そのかたまりを読んだあとで最後の値に戻るように。書くかたまりが2つ以上なら、それぞれに入れる）
       ②元の台詞（〈〉・一人称・二人称で区切り、句読点・記号などを落とした一番長い断片。5文字以上）が、ちょうど1つの箱庭のかたまり scen-<id> の
         ソースの文字列リテラル（同じく落とした形）にだけあり、ほかのかたまり（中核・族・late・ほかの箱庭）には無い → その scen-<id> の 'tone:scen-<id>' に入れる
         （箱庭を足しても口調のかたまりが伸びないように。ゆるい引き方で同じ行に当たる文も見つけるため。迷う行は③）。
         tone-fix-loose のゆるい鍵が同じになる行が別々の行き先に分かれたら、箱庭へ回した分を③に戻してそろえる
       ③それ以外 → 口調のかたまり tone-<口調>（自動の10口調＝aniki と HK.PERSONA_KEYS は、まとめて tone-base）
   ・形：HK.Load.toneData('<口調>', { F: [[元, 書き下ろし], [元, 書き下ろし, 1], …], S: [元, …], O: {元: 値}, I: {id: 値}, M: {種類: 値}, N: {種類: 値} })。
     F の3つ目の 1 は TONE_FIX_G の印（元＝書き下ろしでも印つきは F に [元, 元, 1]）。S は元＝書き下ろしで印の無い行。
     toneData は表に上書きで入れる（T[鍵] = 値。load.js。無いときは下の代わり）。行の並びは最後の表の並び（元の順）のまま。
   ・確かめ（verify。--no-tone-verify で省く）：「中核 → late → 口調ぜんぶ → 族・箱庭」「中核 → 族・箱庭 → late → 口調ぜんぶ」「中核 → 口調ぜんぶ → 族・箱庭 → late」の3とおりの順で、
     tone のファイルの代わりにデータを入れて読み、6つの表が元の順で全部読んだときと鍵・値・G 印まで一致し、ゆるい引き方の結果も同じこと。違えばビルドを止める。
   ・tone の印のファイルが読み込み時に表のほか（HK の3段目まで。配列は添字ごと・window）を書き換えていたらビルドを止める（コードを含むファイルは late に残す。
     例外は下の ALLOW：tone-fix.js の末尾の表を引く包み。同じ包みを late の tone-fix-loose.js が付ける）。 */
'use strict';
const vm = require('vm');
const MF = require('./build-manifest.js');
const TABLES = [['F', 'Voice', 'TONE_FIX'], ['G', 'Voice', 'TONE_FIX_G'], ['O', 'Voice', 'OVR'], ['M', 'Ero', 'TONE_MOAN'], ['N', 'NovelMoan', 'T'], ['I', 'Voice', 'INTENT']];
/* I は配列（voice-override.js の決まり文句 V.INTENT。要素は { id, re, <口調>: 値 }）。行は「口調・要素の id」→ x[口調]。id・re は口調ではない */
const I_NOT_TONE = new Set(['id', 're']);
const SKIP = new Set(TABLES.map(t => t[1] + '.' + t[2]).concat(['Load']));
/* tone のファイルが書いてもよい、表のほかの所：tone-fix.js（tone-fix-r18.js）の末尾にある表を引く包み。
   同じ包みを late の tone-fix-loose.js が付ける（V._toneFixHooked で二重にならない）ので、ブラウザでは tone-fix.js を読まなくてよい */
const ALLOW = new Set(['Voice.overrideFor', 'Voice._toneFixHooked']);
const SKIPSIG = new Set([...SKIP, ...ALLOW]);
const SEP = '\u0000';
/* tone-fix-loose.js のゆるい引き方の鍵（同じ作り。索引に入れる行の条件も同じ） */
const MOANISH = /♡|[ぁぃぅぇぉ]|[…‥、]っ|っ[…‥、]/;
const looseKey = k => (/^[…‥]/.test(k) ? '…' : '') + k.replace(/[、…‥\s　]/g, '');

/* ---------- vm ---------- */
function newVm(opt) {
  const win = MF.makeWindow({ build: opt.build, safeBuild: opt.safeBuild, hash: opt.hash, quiet: true });
  const ctx = vm.createContext(win), errs = [];
  const run = (code, filename) => { try { vm.runInContext(code, ctx, { filename }); } catch (e) { errs.push(filename + ': ' + String(e && e.message || e).slice(0, 160)); } };
  run(opt.loadSrc != null ? opt.loadSrc : MF.LOAD_FALLBACK, 'js/load.js');
  /* toneData の代わり（load.js にまだ無いときだけ。約束 A のとおり：鍵ごとに上書き、F のあと S、S の [元, 1] は G の印つき） */
  run('(function(){var HK=window.HK,L=HK.Load;if(!L||L.toneData)return;function put(tab,tone,src){var t=tab[tone]=tab[tone]||{};for(var k in src)t[k]=src[k];}' +
    'L.toneData=function(tone,d){var V=HK.Voice,i,r;if(V&&(d.F||d.S)){var FIX=V.TONE_FIX=V.TONE_FIX||{},T=FIX[tone]=FIX[tone]||{},G=null;' +
    'var mark=function(k){if(!G){var GG=V.TONE_FIX_G=V.TONE_FIX_G||{};G=GG[tone]=GG[tone]||{};}G[k]=1;};' +
    'for(i=0;i<(d.F||[]).length;i++){r=d.F[i];T[r[0]]=r[1];if(r[2])mark(r[0]);}' +
    'for(i=0;i<(d.S||[]).length;i++){r=d.S[i];if(Array.isArray(r)){T[r[0]]=r[0];if(r[1])mark(r[0]);}else T[r]=r;}}' +
    'if(V&&d.O)put(V.OVR=V.OVR||{},tone,d.O);if(d.M&&HK.Ero)put(HK.Ero.TONE_MOAN=HK.Ero.TONE_MOAN||{},tone,d.M);' +
    'if(d.N&&HK.NovelMoan&&HK.NovelMoan.T)put(HK.NovelMoan.T,tone,d.N);' +
    'if(V&&d.I&&Array.isArray(V.INTENT))V.INTENT.forEach(function(x){if(x&&x.id!=null&&Object.prototype.hasOwnProperty.call(d.I,x.id))x[tone]=d.I[x.id];});L.gen++;};})();', 'tonedata-stub');
  const def = (n, f, src) => run('HK.Load.def(' + n + ', ' + JSON.stringify(f) + ', function () {\n' + src + '\n});', f);
  return { win, ctx, errs, run, def };
}
const tablesOf = win => {
  const HK = win.HK || {}, o = {};
  TABLES.forEach(([c, a, b]) => { o[c] = HK[a] && HK[a][b] && typeof HK[a][b] === 'object' ? HK[a][b] : null; });
  /* I は「口調 → { id: 値 }」の形に直して返す（ほかの表と同じに扱えるように） */
  if (o.I) { const arr = Array.isArray(o.I) ? o.I : [], t = {}; arr.forEach(x => { if (!x || typeof x !== 'object' || x.id == null) return; Object.keys(x).forEach(k => { if (k === 'id') return; (t[k] = t[k] || {})[x.id] = x[k]; }); }); o.I = t; }
  return o;
};
const vsig = v => typeof v === 'string' ? 's' + v : typeof v === 'function' ? 'f?' : Object.prototype.toString.call(v) === '[object RegExp]' ? 'r' + String(v) : 'j' + JSON.stringify(v);
/* 表の全行：行の id（表・口調・鍵）→ 値の印 */
function snap(win) {
  const m = new Map(), T = tablesOf(win);
  TABLES.forEach(([c]) => { const t = T[c]; if (!t) return; Object.keys(t).forEach(tone => { const o = t[tone]; if (!o || typeof o !== 'object') return; Object.keys(o).forEach(k => m.set(c + SEP + tone + SEP + k, vsig(o[k]))); }); });
  return m;
}
/* HK の形（3段目まで。表と HK.Load は見ない）と window の鍵：tone のファイルが表のほかを書き換えていないかを見る。
   物の同一性も比べるため、物の id は1回の vm で共有する（呼ぶたびに同じ WeakMap を使う） */
function hkSigShared() {
  const ids = new WeakMap(); let nid = 0;
  const fid = f => { if (!ids.has(f)) ids.set(f, ++nid); return ids.get(f); };
  return win => {
    const out = new Map();
    /* 鍵の数は、表（SKIP）の鍵を除いて数える（HK.Voice.TONE_FIX_G を作っただけで HK.Voice が変わったことにしない） */
    const nk = (v, p) => Object.keys(v).filter(k => !SKIPSIG.has(p + '.' + k)).length;
    const d = (v, p) => { if (v === null) return 'null'; const t = typeof v; if (t === 'function') return 'F' + fid(v) + ':' + nk(v, p); if (Array.isArray(v)) return 'A' + fid(v) + ':' + v.length; if (t === 'object') return 'O' + fid(v) + ':' + nk(v, p); return t[0] + String(v).slice(0, 40); };
    const walk = (v, p, dep) => {
      if (SKIPSIG.has(p)) return;
      out.set(p, d(v, p));
      if (dep >= 3 || !v || (typeof v !== 'object' && typeof v !== 'function')) return;
      let ks; try { ks = Object.keys(v); } catch (e) { return; }   /* 配列は添字ごとに見る（要素の書き換えも見つける） */
      if (ks.length > 6000) return;
      ks.forEach(k => walk(v[k], p + '.' + k, dep + 1));
      if (typeof v === 'function' && v.prototype) Object.getOwnPropertyNames(v.prototype).forEach(k => { if (k !== 'constructor') out.set(p + '.prototype.' + k, d(v.prototype[k], p + '.prototype.' + k)); });
    };
    const HK = win.HK || {};
    Object.keys(HK).forEach(k => walk(HK[k], k, 1));
    Object.keys(win).forEach(k => out.set('window.' + k, typeof win[k]));
    return out;
  };
}

/* ---------- 全部を元の順で読んで、行ごとの書き手を記録する ----------
   seq：[{ n, f, src, chunk }]（通し番号の順。chunk は 'core'・'late'・'pack-x'・'scen-y'・'tone'） */
function analyze(opt, seq) {
  const t0 = Date.now(), V = newVm(opt), sig = hkSigShared();
  const rows = new Map();   /* 行の id → { tone: tone のファイルが書いた, ch: Set（書いた中核以外・tone 以外のかたまり）, core: 中核が書いた値 } */
  const touched = {}, bad = {};
  let prev = snap(V.win);
  seq.forEach(x => {
    const isTone = x.chunk === 'tone';
    /* 読むたびに値が変わるもの（getter など）は、何もしないで2回取って違う所として除く */
    const s0 = isTone ? sig(V.win) : null, s0b = isTone ? sig(V.win) : null;
    V.def(x.n, x.f, x.src);
    const cur = snap(V.win);
    cur.forEach((v, id) => {
      if (prev.get(id) === v) return;
      const r = rows.get(id) || { tone: false, ch: new Set(), core: undefined };
      rows.set(id, r);
      if (isTone) r.tone = true;
      else if (x.chunk === 'core') r.core = v;
      else r.ch.add(x.chunk);
      (touched[x.f] = touched[x.f] || new Set()).add(id.split(SEP)[0]);
    });
    prev.forEach((v, id) => { if (!cur.has(id)) (bad[x.f] = bad[x.f] || []).push('表の行を消した: ' + id.split(SEP).join(' / ').slice(0, 80)); });
    if (isTone) {
      const s1 = sig(V.win), diff = [];
      s1.forEach((v, p) => { if (s0.get(p) !== v && s0.get(p) === s0b.get(p)) diff.push(p); });
      s0.forEach((v, p) => { if (!s1.has(p)) diff.push(p + '（消えた）'); });
      if (diff.length) (bad[x.f] = bad[x.f] || []).push('表のほかを書き換え: ' + diff.slice(0, 6).join('、') + (diff.length > 6 ? ' ほか' + (diff.length - 6) : ''));
    }
    prev = cur;
  });
  const HK = V.win.HK || {};
  return { win: V.win, final: prev, rows, touched, bad, errs: V.errs.concat(((HK.Load && HK.Load.errors) || []).map(e => (e.file || '?') + ': ' + String(e.err || e))), ms: Date.now() - t0 };
}

/* ---------- 文字列リテラル（箱庭だけの行の判定） ---------- */
/* ソースの文字列リテラル・テンプレートの文字を、正規化して1本の文字列にまとめる（区切らずにつなぐ：'ご無事で' + '何より' のように
   つないで作る文にも当たるように。つないだ所でたまたま当たるのは「複数に当たる」側＝安全側） */
function literals(acorn, src) {
  const out = [];
  try { for (const t of acorn.tokenizer(src, { ecmaVersion: 'latest', allowHashBang: true })) if (t.type.label === 'string' || t.type.label === 'template') out.push(String(t.value == null ? '' : t.value)); }
  catch (e) { /* 構文の誤りは build の別の確かめで止まる */ }
  return norm(out.join(''));
}
/* 多数の断片を、大きな文字列から一度に探す（Aho-Corasick）。found[断片の番号] に、見つかったかたまりの名前を足す */
function makeAC(pats) {
  const next = [new Map()], fail = [0], out = [[]];
  pats.forEach((p, id) => {
    let s = 0;
    for (const c of p) { let t = next[s].get(c); if (t == null) { t = next.length; next.push(new Map()); fail.push(0); out.push([]); next[s].set(c, t); } s = t; }
    out[s].push(id);
  });
  const q = [];
  next[0].forEach(t => { fail[t] = 0; q.push(t); });
  while (q.length) {
    const s = q.shift();
    next[s].forEach((t, c) => {
      q.push(t);
      let f = fail[s];
      while (f && !next[f].has(c)) f = fail[f];
      const g = next[f].get(c);
      fail[t] = g != null && g !== t ? g : 0;
      if (out[fail[t]].length) out[t] = out[t].concat(out[fail[t]]);
    });
  }
  return text => {
    const hit = new Set(); let s = 0;
    for (const c of text) {
      while (s && !next[s].has(c)) s = fail[s];
      const t = next[s].get(c); s = t == null ? 0 : t;
      if (out[s].length) out[s].forEach(id => hit.add(id));
    }
    return hit;
  };
}
/* 箱庭だけの行の判定に使う正規化：台詞の引き方（tone-fix.js の頭の「…」を外す引き方、tone-fix-loose.js の読点・「…」・空白を無視する引き方）で
   同じ行に当たる文を取りこぼさないよう、それより広く句読点・記号・空白・長音・小さい「っ」を落として比べる（落としすぎは「複数に当たる」＝口調のかたまりへ、で安全側） */
const NORM = /[、。，．,.・…‥！？!?\s　「」『』（）()〜～ーっッ―－\-]/g;
const norm = s => s.replace(NORM, '');
/* 元の台詞の、探す断片：〈〉（名前）・一人称（tone-fix-loose は「私」を俺・僕…に替えて引く）・二人称で区切り、正規化した一番長いもの。5文字未満なら探さない（＝口調のかたまりへ） */
const PERSON = /〈〉|私|あなた|俺|僕|あたし|わたし|オレ|自分|お前|おまえ|君|きみ|あんた/;
const pieceOf = k => { const p = k.split(PERSON).map(norm).sort((a, b) => b.length - a.length)[0] || ''; return p.length >= 5 ? p : ''; };

/* ---------- 書き出し ----------
   opt：{ build, safeBuild, hash, loadSrc, acorn }
   chunks：[{ name, files: [{ n, f, src }] }]（実行の順。core・late・pack-*・scen-*。src は全年齢版なら抜いたあと）
   tones：[{ n, f, src }]（tone の印のファイル） */
function make(opt, chunks, tones) {
  const seq = [];
  chunks.forEach(c => c.files.forEach(x => seq.push({ n: x.n, f: x.f, src: x.src, chunk: c.name })));
  tones.forEach(x => seq.push({ n: x.n, f: x.f, src: x.src, chunk: 'tone' }));
  seq.sort((a, b) => a.n - b.n);
  const R = analyze(opt, seq), HK = R.win.HK || {};
  const keys = HK.TONE_KEYS || [], auto = ['aniki'].concat(HK.PERSONA_KEYS || []).filter(k => keys.indexOf(k) >= 0);
  const T = tablesOf(R.win);
  /* 口調ごとに、書き出す鍵（表 F・G は元の台詞でまとめる） */
  const want = {};   /* tone → { F: Set(元), O: Set, M: Set, N: Set, ch: { 元/鍵 → Set(かたまり) } } */
  R.rows.forEach((r, id) => {
    if (!r.tone || !R.final.has(id)) return;
    const [c, tone, k] = id.split(SEP), w = want[tone] || (want[tone] = { F: new Set(), O: new Set(), M: new Set(), N: new Set(), I: new Set(), ch: {} });
    if (c === 'I' && I_NOT_TONE.has(tone)) { R.bad['(表)'] = (R.bad['(表)'] || []).concat(['V.INTENT の ' + tone + ' を書き換えた（id ' + k + '）']); return; }
    const cc = c === 'G' ? 'F' : c;
    w[cc].add(k);
    const kk = cc + SEP + k;
    if (r.ch.size) { const s = w.ch[kk] || (w.ch[kk] = new Set()); r.ch.forEach(x => s.add(x)); }
  });
  /* 箱庭だけの行：断片を全かたまりの文字列リテラルから探す */
  const pieces = new Map();
  Object.keys(want).forEach(t => ['F', 'O'].forEach(c => want[t][c].forEach(k => { const p = pieceOf(k); if (p && !pieces.has(p)) pieces.set(p, pieces.size); })));
  const plist = Array.from(pieces.keys()), where = plist.map(() => new Set());
  const ac = makeAC(plist);
  chunks.forEach(c => { const hit = ac(c.files.map(x => literals(opt.acorn, x.src)).join('')); hit.forEach(id => where[id].add(c.name)); });
  const scenOnly = k => { const p = pieceOf(k); if (!p) return null; const w = where[pieces.get(p)]; if (w.size !== 1) return null; const c = w.values().next().value; return /^scen-/.test(c) ? c : null; };
  /* 行き先ごとのデータ：dest → tone → { F: [], S: [], O: {}, M: {}, N: {} } */
  const out = {}, stat = { rows: 0, scen: 0, writer: 0, tone: 0, looseFix: 0, byDest: {} };
  const bucket = (dest, tone) => { const d = out[dest] || (out[dest] = {}); return d[tone] || (d[tone] = { F: [], S: [], O: {}, I: {}, M: {}, N: {} }); };
  const toneChunk = t => auto.indexOf(t) >= 0 ? 'tone-base' : 'tone-' + t.replace(/_/g, '-').toLowerCase();
  Object.keys(want).forEach(tone => {
    const w = want[tone];
    const dests = (c, k) => {
      const s = w.ch[c + SEP + k];
      if (s && s.size) return { why: 'writer', to: Array.from(s) };
      const sc = c === 'F' || c === 'O' ? scenOnly(k) : null;
      if (sc) return { why: 'scen', to: [sc] };
      return { why: 'tone', to: [toneChunk(tone)] };
    };
    const count = d => { stat[d.why]++; return d.to; };
    /* F（と G）：最後の表の鍵の順（Object.keys）のまま。元＝書き下ろしで G の印が無い行は S、G の印つきは F に [元, 元, 1] */
    const F = T.F && T.F[tone] || {}, G = T.G && T.G[tone] || {};
    const fd = {};
    Object.keys(F).forEach(k => { if (w.F.has(k)) fd[k] = dests('F', k); });
    /* tone-fix-loose のゆるい引き方は「先に入った鍵が勝つ」：同じゆるい鍵になる行が別々の行き先に分かれると、読む順で勝ち負けが変わる。
       分かれた組は、箱庭へ回した行を口調のかたまりに戻してそろえる（書き手のかたまりの行はそのまま。確かめ verify で見る） */
    const grp = {};
    Object.keys(F).forEach(k => { const l = looseKey(k); if (l.length >= 4 && !MOANISH.test(k)) (grp[l] = grp[l] || []).push(k); });
    Object.keys(grp).forEach(l => {
      const ks = grp[l]; if (ks.length < 2) return;
      const ds = new Set(ks.map(k => fd[k] ? fd[k].to.join(',') : 'core'));
      if (ds.size < 2) return;
      ks.forEach(k => { if (fd[k] && fd[k].why === 'scen') { fd[k] = { why: 'tone', to: [toneChunk(tone)] }; stat.looseFix++; } });
    });
    Object.keys(F).forEach(k => {
      if (!fd[k]) return;
      stat.rows++;
      const v = F[k], g = G[k];
      count(fd[k]).forEach(d => { const b = bucket(d, tone); if (v === k && !g) b.S.push(k); else b.F.push(g ? [k, v, g] : [k, v]); });
    });
    /* G だけあって F に無い鍵（書き出せない形）は知らせる */
    w.F.forEach(k => { if (!(k in F)) R.bad['(表)'] = (R.bad['(表)'] || []).concat(['TONE_FIX_G だけにある鍵: ' + tone + ' / ' + k.slice(0, 40)]); });
    ['O', 'I', 'M', 'N'].forEach(c => {
      const t = T[c] && T[c][tone] || {};
      Object.keys(t).forEach(k => { if (!w[c].has(k)) return; stat.rows++; count(dests(c, k)).forEach(d => { bucket(d, tone)[c][k] = t[k]; }); });
    });
  });
  /* G の印の値は 1 の約束（ほかの値があれば知らせる） */
  if (T.G) Object.keys(T.G).forEach(t => Object.keys(T.G[t]).forEach(k => { if (T.G[t][k] !== 1) R.bad['(表)'] = (R.bad['(表)'] || []).concat(['TONE_FIX_G の印が 1 でない: ' + t + ' / ' + k.slice(0, 40) + ' = ' + JSON.stringify(T.G[t][k])]); }));
  /* JS の本文：1口調ぶんの toneData（1行に1行） */
  const J = v => JSON.stringify(v).replace(/\u2028/g, '\\u2028').replace(/\u2029/g, '\\u2029');
  const callOf = (tone, d) => {
    const parts = [];
    if (d.F.length) parts.push('"F":[\n' + d.F.map(J).join(',\n') + ']');
    if (d.S.length) parts.push('"S":[\n' + d.S.map(J).join(',\n') + ']');
    ['O', 'I', 'M', 'N'].forEach(c => { const ks = Object.keys(d[c]); if (ks.length) parts.push(J(c) + ':{\n' + ks.map(k => J(k) + ':' + J(d[c][k])).join(',\n') + '}'); });
    return parts.length ? 'HK.Load.toneData(' + J(tone) + ', {' + parts.join(',\n') + '});\n' : '';
  };
  const lastN = {}; chunks.forEach(c => c.files.forEach(x => { lastN[c.name] = Math.max(lastN[c.name] || 0, x.n); }));
  const maxN = seq.reduce((a, x) => Math.max(a, x.n), 0);
  /* ほかのかたまりの後ろに足す def（'tone:<かたまり>'）と、口調のかたまり */
  const append = {}, toneChunks = {}, pack = {};
  Object.keys(out).forEach(dest => {
    const tl = Object.keys(out[dest]);
    if (/^tone-/.test(dest)) {
      const body = tl.map(t => { const c = callOf(t, out[dest][t]); return c ? { tone: t, code: c } : null; }).filter(Boolean);
      if (!body.length) return;
      toneChunks[dest] = body.map(b => ({ name: 'tone:' + b.tone, n: maxN + 1, code: b.code }));
      if (dest !== 'tone-base') body.forEach(b => { pack[b.tone] = dest; });
    } else {
      const code = tl.map(t => callOf(t, out[dest][t])).join('');
      if (code) append[dest] = { name: 'tone:' + dest, n: (lastN[dest] || maxN) + 0.5, code };
    }
  });
  /* 口調のかたまりの名前が重なっていないか（鍵の _ を - にするので） */
  const seenName = {};
  Object.keys(pack).forEach(t => { const c = pack[t]; if (seenName[c] && seenName[c] !== t) R.bad['(表)'] = (R.bad['(表)'] || []).concat(['口調のかたまりの名前が重なる: ' + seenName[c] + '・' + t + ' → ' + c]); seenName[c] = t; });
  /* 大きさの統計：行き先ごとの本文の文字数 */
  Object.keys(toneChunks).forEach(d => { stat.byDest[d] = toneChunks[d].reduce((a, x) => a + x.code.length, 0); });
  Object.keys(append).forEach(d => { stat.byDest[d] = append[d].code.length; });
  return { R, auto, keys, toneChunks, append, pack, stat, extra: Object.keys(want).filter(t => keys.indexOf(t) < 0) };
}

/* ---------- 確かめ：データで読んだときの表が、元の順で全部読んだときと同じか ----------
   orders：かたまりの名前の並びの配列（'@tones' は口調のかたまり全部の場所） */
/* tone-fix-loose の索引（先に入った鍵が勝つ）で引いたときの値。鍵の順の違いが結果に出ないかを見る */
function looseWin(T) {
  const m = new Map();
  Object.keys(T || {}).forEach(t => { const o = T[t] || {}, seen = new Set(); Object.keys(o).forEach(k => { const l = looseKey(k); if (l.length >= 4 && !MOANISH.test(k) && !seen.has(l)) { seen.add(l); m.set(t + SEP + l, vsig(o[k])); } }); });
  return m;
}
function verify(opt, chunks, made, orders) {
  const want = made.R.final, wantL = looseWin(tablesOf(made.R.win).F), res = [];
  const byName = {}; chunks.forEach(c => { byName[c.name] = c; });
  orders.forEach(order => {
    const V = newVm(opt), t0 = Date.now();
    const runChunk = name => {
      if (name === '@tones') { Object.keys(made.toneChunks).forEach(tc => made.toneChunks[tc].forEach(d => V.def(d.n, d.name, d.code))); return; }
      const c = byName[name]; if (!c) return;
      c.files.forEach(x => V.def(x.n, x.f, x.src));
      const a = made.append[name]; if (a) V.def(a.n, a.name, a.code);
    };
    order.forEach(runChunk);
    const got = snap(V.win), diff = [];
    want.forEach((v, id) => { if (got.get(id) !== v) diff.push((got.has(id) ? '値が違う ' : '無い ') + id.split(SEP).join(' / ').slice(0, 90)); });
    got.forEach((v, id) => { if (!want.has(id)) diff.push('余分 ' + id.split(SEP).join(' / ').slice(0, 90)); });
    const gl = looseWin(tablesOf(V.win).F); let ld = 0;
    wantL.forEach((v, k) => { if (gl.get(k) !== v) { ld++; if (ld <= 5) diff.push('ゆるい引き方の結果が違う ' + k.split(SEP).join(' / ').slice(0, 60)); } });
    const HK = V.win.HK || {};
    const errs = V.errs.concat(((HK.Load && HK.Load.errors) || []).map(e => (e.file || '?') + ': ' + String(e.err || e)));
    res.push({ order: order.join(' → '), diff, loose: ld, errs, ms: Date.now() - t0 });
  });
  return res;
}

module.exports = { TABLES, newVm, snap, tablesOf, analyze, make, verify, literals };
