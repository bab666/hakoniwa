/* 古い書き方の一人称「私」・二人称「あなた」を、印 {一人称}・{二人称} へ一括で移す道具（2026-11-06。決まりは docs/reports/2026-11-06/fp-marker-design.md の 7 章）
   node hakoniwa-tools/build/fp-migrate.js [--dry] [--list=<一覧の出力先>] [--ex=<除外の一覧の出力先>] [--quiet] [ディレクトリ…]
   ・既定の対象：hakoniwa-full/js・hakoniwa-zenrei/js・hakoniwa-packs/<パック>/js の *.js（js/c/・bundle*・event-catalog.js は作られたものなので見ない）
   ・何度回してもよい（移したあとの行には「私」「あなた」の直書きが残らないので、2 回目は 0 件）。merge のあとにもう一度回せば、取り込んだ新しい直書きも移る
   ・--dry は書き換えずに件数と一覧だけ出す。--list は置き換えた所の一覧（ファイル:行・種類・前→後）、--ex は除外した所の一覧
   書き換える所（acorn で字句に分け、文字列リテラル・テンプレートの文字列の部分だけを見る。コメント・正規表現リテラルは見ない）：
   (a) 台詞：文字列の中の「」の中（「＠＠…」の名詞の引用は除く）
   (c) 台詞の表：「」を付けない文字列のうち、3 本の形（｜を含む）か、頭に「＠名前＠」の目印があるもの
   (b) 書き下ろし（tone-fix*・tone-brush*・voice-override*・パックの *-tone*.js）：値の列だけ（鍵は「私」「あなた」のまま。voice.js が印を戻した写しで引く）
       タブ区切りの行は、頭が口調の id なら 3 列目から（tone-fix の形）、そうでなければ 2 列目から（voice-override-rows の形）が値。
       オブジェクトの値（「鍵: 値」の値・値の配列の中）も値。関数の引数の頭（add('鍵', {…}) の鍵）・オブジェクトの鍵・
       値の配列の中の [鍵, 値] の対の頭（HK.Load.toneData の F: [[元, 書き下ろし], …] の元）・3 本の形（｜を含む）の文字列（鍵）・
       名前の鍵の配列（K = { tail: ['K', 'F', 'P'] } の元の台詞）は見ない
   置き換える語（出力が変わらないことが条件）：
   ・「私」→ {一人称}：voice.js の FP_RE が一人称として当たる「私」だけ（後ろが漢字の 私物・私語・私用・私的・私情・私生活・私服・私見・私立 と、前が 公・滅・無 の 公私 などは当たらないので除く）。
     どもり「わ、私」は「わ、{一人称}」（展開がどもりの頭を直す）
   ・「あなた」→ {二人称}：voice.js の YOU2 が当たる「あなた」だけ（後ろが さん・方・様・さま のものは当たらない）。後ろが「がた」のものも除く
   ・文字列の終わりで切れていて、後ろの字が分からないもの（'…私' + x）は除く（後ろの語しだいで当たり方が変わるため）
   除くファイル：tips*・ui*（画面の文字列）・attr.js（設定の選択肢）・tone-dict*（口調の辞書の規則）・voice.js ほかの中核（下の SKIP）。「label:」「desc:」の値も除く。
   地の文（「」の外）は触らない（ソロ型の一人称の語り手の「私」は台詞でない） */
'use strict';
const fs = require('fs'), path = require('path');
const ROOT = path.resolve(__dirname, '../..');
const MAIN = require.main === module, argv = MAIN ? process.argv.slice(2) : [];
let DRY = argv.includes('--dry');
const QUIET = argv.includes('--quiet');
const LIST = (argv.find(a => a.startsWith('--list=')) || '').slice(7), EXL = (argv.find(a => a.startsWith('--ex=')) || '').slice(5);
function loadAcorn() { for (const t of [process.env.ACORN_MODULE, 'acorn', '/opt/node-tools/node_modules/acorn']) { try { if (t) return require(t); } catch (e) { /* 次 */ } } throw new Error('acorn が見つかりません（npm install）'); }
const acorn = loadAcorn();

/* voice.js の FP_RE・YOU2 をそのまま使う（置き換えの当たり方を voice.js と同じにするため） */
const VSRC = fs.readFileSync(path.join(ROOT, 'hakoniwa-full/js/voice.js'), 'utf8');
const reOf = name => { const m = VSRC.match(new RegExp('var ' + name + ' = (/.*/g);')); if (!m) throw new Error('voice.js の ' + name + ' が見つからない'); return eval(m[1]); };
const FP_RE = reOf('FP_RE'), YOU2 = reOf('YOU2');
/* 名詞の引用（voice.js の nounQOf：「〜」という話・「〜」と書いた札）。名詞の引用の印 {一人称} は「私」のまま出るので、
   古い「私」（一人称に置き換わっていた）を印にすると出力が変わる。voice.js の判定のうち、本文と後ろの字だけで決まる部分を写し、当たる「」は移さない */
const NOUN_AFTER = (() => { const m = VSRC.match(/var NOUN_AFTER = (\/.*\/);/); if (!m) throw new Error('voice.js の NOUN_AFTER が見つからない'); return eval(m[1]); })();
const speechy = q => { q = String(q || '').replace(/[\u2060-\u2064]/g, ''); return /[。！？!?…‥、♡っ]/.test(q) || /[ぁ-ん][ー〜～]+$/.test(q) || /(?:よ|ね|な|わ|ぞ|ぜ|さ|か|の|て|で|た|だ|い|う|く|ぐ|す|つ|ぬ|ぶ|む|る|ん|ろ|れ|え|け|や|ば|も|ら|り|じゃん)$/.test(q); };
if (VSRC.indexOf("return /[。！？!?…‥、♡っ]/.test(q) || /[ぁ-ん][ー〜～]+$/.test(q) || /(?:よ|ね|な|わ|ぞ|ぜ|さ|か|の|て|で|た|だ|い|う|く|ぐ|す|つ|ぬ|ぶ|む|る|ん|ろ|れ|え|け|や|ば|も|ら|り|じゃん)$/.test(q);") < 0) throw new Error('voice.js の speechy が変わった（fp-migrate.js の写しを合わせる）');
function nounQ(body, post, pre) {
  return NOUN_AFTER.test(post) || (/^だ/.test(post) && /(?:のは|お題は|テーマは|題名は|企画は)$/.test(pre)) ||
    (/^だと/.test(post) && !/[。！？!?]$/.test(body)) || (/^(?:で(?![すし])|だ|です|。)/.test(post) && !speechy(body));
}

let dirs = argv.filter(a => !a.startsWith('--'));
if (MAIN && !dirs.length) {
  dirs = ['hakoniwa-full/js', 'hakoniwa-zenrei/js'];
  const pk = path.join(ROOT, 'hakoniwa-packs');
  if (fs.existsSync(pk)) fs.readdirSync(pk).forEach(p => { if (fs.existsSync(path.join(pk, p, 'js'))) dirs.push('hakoniwa-packs/' + p + '/js'); });
}
/* 見ないファイル：画面・説明の文字列、設定の選択肢、口調の辞書の規則、置き換えそのものを書いた中核 */
const SKIP = /^(?:tips.*|ui.*|attr|tone-dict.*|voice|voice-seg|voice-fp|tone-engine|tone-registry|tone-plus|lewd-words|lewd-mark|event-catalog|bundle.*|packs|load)\.js$/;
const VFILE = (d, f) => /^(?:tone-fix|tone-brush|voice-override)/.test(f) || (/hakoniwa-packs/.test(d) && /-tone(?:-[a-z0-9]+)?\.js$/.test(f));
const TONE_ID = /^[a-z][a-z0-9_]*$/;

let stat = null, list = [], exl = [];
const reset = () => { stat = { files: 0, changed: 0, fp: { a: 0, c: 0, b: 0 }, you: { a: 0, c: 0, b: 0 }, ex: {} }; list = []; exl = []; };
reset();
const exAdd = (k, where, s) => { stat.ex[k] = (stat.ex[k] || 0) + 1; exl.push(where + '\t' + k + '\t' + s); };

/* 一つの区切り（台詞の本文・値）の中を置き換える。open：終わりが文字列の切れ目（後ろが分からない） */
function seg(s, kind, where, open, bound) {
  if (s.indexOf('私') < 0 && s.indexOf('あなた') < 0) return s;
  /* 区切りの字（3 本の ｜、書き下ろしの候補の ／）ごとに分けて、それぞれの終わりを「台詞の終わり」として見る */
  const parts = s.split(bound), seps = s.match(new RegExp(bound.source, 'g')) || [];
  return parts.map((p, pi) => {
    const last = pi === parts.length - 1 && open;
    let o = p;
    if (o.indexOf('私') >= 0) {
      const hit = new Set(); FP_RE.lastIndex = 0; let m;
      while ((m = FP_RE.exec(o))) if (m[0] === '私') hit.add(m.index);
      let r = '';
      for (let i = 0; i < o.length; i++) {
        if (o[i] !== '私') { r += o[i]; continue; }
        const ctx = o.slice(Math.max(0, i - 4), i + 5);
        if (last && i === o.length - 1) { exAdd('私：文字列の切れ目', where, ctx); r += o[i]; }
        else if (hit.has(i)) { r += '{一人称}'; stat.fp[kind]++; }
        else { exAdd('私：一人称でない（' + (o[i - 1] && /[公滅無]/.test(o[i - 1]) ? o[i - 1] + '私' : '私' + (o[i + 1] || '（終わり）')) + '）', where, ctx); r += o[i]; }
      }
      o = r;
    }
    if (o.indexOf('あなた') >= 0) {
      const hit = new Set(); YOU2.lastIndex = 0; let m;
      while ((m = YOU2.exec(o))) if (m[0] === 'あなた') hit.add(m.index);
      let r = '', i = 0;
      while (i < o.length) {
        if (o.startsWith('あなた', i)) {
          const ctx = o.slice(Math.max(0, i - 4), i + 7), nx = o.slice(i + 3, i + 5);
          if (last && i + 3 === o.length) { exAdd('あなた：文字列の切れ目', where, ctx); r += 'あなた'; }
          else if (hit.has(i) && !/^がた/.test(nx)) { r += '{二人称}'; stat.you[kind]++; }
          else { exAdd('あなた：二人称でない（あなた' + (nx.match(/^(?:さま|さん|様|方|がた)/) || [nx.slice(0, 1)])[0] + '）', where, ctx); r += 'あなた'; }
          i += 3; continue;
        }
        r += o[i]; i++;
      }
      o = r;
    }
    return o + (pi < seps.length ? seps[pi] : '');
  }).join('');
}
/* 「」の中だけを置き換える。文字列の頭に閉じの 」 があれば、そこまでは前の字句から続く「」の中 */
function quotes(s, where, bound) {
  let out = '', i = 0;
  /* 頭の閉じの無い 」（前から続く台詞の終わり） */
  let d0 = 0, firstClose = -1;
  for (let k = 0; k < s.length; k++) { if (s[k] === '「') d0++; else if (s[k] === '」') { if (d0 === 0) { firstClose = k; break; } d0--; } }
  if (firstClose >= 0) { out += seg(s.slice(0, firstClose), 'a', where, false, bound) + '」'; i = firstClose + 1; }
  while (i < s.length) {
    const a = s.indexOf('「', i);
    if (a < 0) { out += s.slice(i); break; }
    out += s.slice(i, a + 1);
    let d = 1, k = a + 1;
    for (; k < s.length; k++) { if (s[k] === '「') d++; else if (s[k] === '」') { d--; if (d === 0) break; } }
    const body = s.slice(a + 1, k), open = k >= s.length;
    if (/^＠＠/.test(body)) { if (/私|あなた/.test(body)) exAdd('名詞の引用「＠＠」', where, body.slice(0, 20)); out += body; }
    else if (!open && !/^＠[^＠]/.test(body) && /私/.test(body) && nounQ(body, s.slice(k + 1, k + 9), s.slice(Math.max(0, a - 6), a))) { exAdd('名詞の引用（後ろが「' + s.slice(k + 1, k + 3) + '」）', where, body.slice(0, 24)); out += body; }
    else out += seg(body, 'a', where, open, bound);
    if (!open) out += '」';
    i = k + 1;
  }
  return out;
}
function lineOf(src, pos) { let n = 1; for (let i = 0; i < pos; i++) if (src.charCodeAt(i) === 10) n++; return n; }

function doFile(dir, f) {
  const fp = path.resolve(ROOT, dir, f);
  const src = fs.readFileSync(fp, 'utf8');
  if (src.indexOf('私') < 0 && src.indexOf('あなた') < 0) return;
  stat.files++;
  let toks;
  try { toks = [...acorn.tokenizer(src, { ecmaVersion: 'latest', allowHashBang: true })]; } catch (e) { console.error('字句に分けられない：' + dir + '/' + f + '：' + e.message); process.exitCode = 1; return; }
  const isV = VFILE(dir, f), vBound = /^voice-override/.test(f) ? /[／]/ : /(?!)/;
  const edits = [];
  /* 括弧の並び：{ c: '[' | '{' | '(', val: 値の配列か, pair: 配列の中の配列（[鍵, 値] の対。HK.Load.toneData の F: [[元, 書き下ろし], …]）か, ix: 配列の何番目の要素か } */
  const stack = [];
  for (let ti = 0; ti < toks.length; ti++) {
    const t = toks[ti], L = t.type.label, prev = toks[ti - 1], next = toks[ti + 1];
    const pl = prev ? prev.type.label : '', nl = next ? next.type.label : '';
    if (L === '[') {
      const up = stack[stack.length - 1], inArr = !!(up && up.c === '[' && up.val);
      /* 名前の鍵の配列（tone-brush8c-r18.js の K = { tail: ['K', 'F', 'P'] } のように、元の台詞＝鍵を並べたもの）は値でない。
         値の配列は文字列の鍵（OVR の '元の台詞': ['書き下ろし', …]）か、HK.Load.toneData の F・S・O の中 */
      const kt = pl === ':' ? toks[ti - 2] : null, named = !!(kt && kt.type.label === 'name' && !/^[FSOMNI]$/.test(kt.value));
      stack.push({ c: '[', val: (pl === ':' && !named) || inArr, pair: inArr, ix: 0 }); continue;
    }
    if (L === ',' && stack.length && stack[stack.length - 1].c === '[') { stack[stack.length - 1].ix++; continue; }
    if (L === '{' || L === '${') { stack.push({ c: '{' }); continue; }
    if (L === '(') { stack.push({ c: '(' }); continue; }
    if (L === ']' || L === '}' || L === ')') { stack.pop(); continue; }
    if (L !== 'string' && L !== 'template') continue;
    const raw0 = L === 'string' ? src.slice(t.start + 1, t.end - 1) : src.slice(t.start, t.end);
    if (raw0.indexOf('私') < 0 && raw0.indexOf('あなた') < 0) continue;
    const where = dir + '/' + f + ':' + lineOf(src, t.start);
    /* オブジェクトの鍵（'鍵': 値） */
    if (nl === ':' && L === 'string' && !(stack.length && stack[stack.length - 1].c === '(' && false)) {
      /* 三項演算子の ? 'x' : 'y' は鍵でない */
      const p2 = prev && prev.type.label;
      if (p2 !== '?') { if (!isV && /「|｜/.test(raw0) && /私|あなた/.test(raw0)) exAdd('オブジェクトの鍵', where, raw0.slice(0, 24)); continue; }
    }
    /* label: ／ desc: の値（画面の説明） */
    if (pl === ':' && toks[ti - 2] && /^(?:label|desc)$/.test(toks[ti - 2].value || '')) { exAdd('label・desc の値', where, raw0.slice(0, 24)); continue; }
    let raw = raw0;
    if (isV) {
      const top = stack[stack.length - 1];
      if (/\\t/.test(raw)) {
        const cols = raw.split('\\t'), from = TONE_ID.test(cols[0]) ? 2 : 1;
        raw = cols.map((c, ci) => ci >= from ? seg(c, 'b', where, false, vBound) : c).join('\\t');
      } else if (/｜/.test(raw)) {
        /* 3 本の形の文字列は書き下ろしの鍵（パックの kanbyo-tone-b.js の Q.yume: '…｜…｜…' を F3(Q.yume, 値) で鍵にする形）。値は 1 本なので移さない */
        continue;
      } else if (pl === ':' || (top && top.c === '[' && top.val && (pl === '[' || pl === ',') && !(top.pair && top.ix === 0))) {
        /* [鍵, 値] の対の頭（鍵）は移さない（上の else に落ちる） */
        raw = seg(raw, 'b', where, L === 'template', vBound);
      } else continue;
    } else {
      if (raw.indexOf('「') >= 0 || raw.indexOf('」') >= 0) raw = quotes(raw, where, /[｜]/);
      else if (raw.indexOf('｜') >= 0 || /^＠[^＠]{1,16}＠/.test(raw)) {
        /* 台詞の表の一行（3 本・話し手の目印つき）。テンプレートの切れ目（${ の前）は後ろが分からない */
        raw = seg(raw, 'c', where, L === 'template' && src.slice(t.end, t.end + 2) === '${', /[｜]/);
      } else continue;
    }
    if (raw !== raw0) {
      const s0 = L === 'string' ? t.start + 1 : t.start;
      edits.push([s0, s0 + raw0.length, raw]);
      list.push(where + '\t' + (isV ? 'b' : raw0.indexOf('「') >= 0 ? 'a' : 'c') + '\t' + raw0.replace(/\s+/g, ' ').slice(0, 160) + '\t→\t' + raw.replace(/\s+/g, ' ').slice(0, 160));
    }
  }
  if (!edits.length) return;
  stat.changed++;
  let out = '', last = 0;
  edits.forEach(([a, b, s]) => { out += src.slice(last, a) + s; last = b; });
  out += src.slice(last);
  if (!DRY) fs.writeFileSync(fp, out);
}

function walk(dirs) {
for (const d of dirs) {
  const abs = path.resolve(ROOT, d);
  if (!fs.existsSync(abs)) { console.error('無いフォルダ：' + d); continue; }
  for (const f of fs.readdirSync(abs).filter(f => f.endsWith('.js')).sort()) {
    if (SKIP.test(f)) continue;
    doFile(d, f);
  }
}
}
/* ほかの道具（base-lint.js）向け：書き換えずに、移せる所（＝「私」「あなた」の直書き）の一覧を返す。
   返す値 { stat, list: ['ファイル:行\t種類\t前\t→\t後'], ex: ['ファイル:行\t除いた理由\t前後'] }。dirs は ROOT からの相対か絶対のフォルダ（js の中） */
function scan(ds) { reset(); const d0 = DRY; DRY = true; try { walk(ds); } finally { DRY = d0; } return { stat, list: list.slice(), ex: exl.slice() }; }
module.exports = { scan, SKIP, VFILE };
if (MAIN) {
walk(dirs);
const sum = o => o.a + o.c + o.b;
if (LIST) fs.writeFileSync(LIST, list.join('\n') + '\n');
if (EXL) fs.writeFileSync(EXL, exl.join('\n') + '\n');
if (!QUIET) {
  console.log((DRY ? '（--dry：書き換えない）' : '') + 'fp-migrate：対象 ' + dirs.join('・'));
  console.log('  「私」→{一人称} ' + sum(stat.fp) + '（台詞の「」の中 ' + stat.fp.a + '・台詞の表 ' + stat.fp.c + '・書き下ろしの値 ' + stat.fp.b + '）');
  console.log('  「あなた」→{二人称} ' + sum(stat.you) + '（台詞の「」の中 ' + stat.you.a + '・台詞の表 ' + stat.you.c + '・書き下ろしの値 ' + stat.you.b + '）');
  console.log('  書き換えたファイル ' + stat.changed + '（「私」「あなた」を含むファイル ' + stat.files + '。除いたファイルは数えない）');
  const ex = Object.keys(stat.ex).sort((a, b) => stat.ex[b] - stat.ex[a]);
  console.log('  除いた所 ' + ex.reduce((n, k) => n + stat.ex[k], 0) + (ex.length ? '：' + ex.map(k => k + ' ' + stat.ex[k]).join('・') : ''));
}
}
