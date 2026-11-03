/* 箱庭シミュレーター：build.js の部品（全年齢版の R18 の文の抜き取り・性的な語の検査・軽量化・包んでよいかの確かめ）
   build.js から require して使う。単独では動かさない。
   ・strip(src, f, map)：行全体が「/＊ r18:begin ＊/」〜「/＊ r18:end ＊/」の行に挟まれた部分を落とす。map に「かたまりの行 → 元のファイル・行」を積む
   ・guard(code, map, name, soft, hardRe)：文字列リテラルに性的な語（EXPLICIT）が残っていれば、その場所の一覧を返す
   ・minify(code, name)：コメント・字下げ・空行・余分な空白を落とす（字句は一字も変えない。落としたあと字句の並びと改行の位置が同じか確かめる）
   ・checkTop(src, f)：最上位に var／let／const／function／class の宣言や 'use strict' があれば、その説明を返す（HK.Load.def の関数で包むと意味が変わるため） */
'use strict';
const fs = require('fs'), path = require('path');
const RB = /^\s*\/\*\s*r18:begin\b[^*]*\*\/\s*$/, RE = /^\s*\/\*\s*r18:end\b[^*]*\*\/\s*$/, ROK = /\/\*\s*r18:ok\s*\*\//;
/* 性的な語（全年齢版のかたまり・目録の文字列に残ってはいけない語）。体の語の印（{男性器} など。R18版の lewd-words.js が語に置き換える）も入れない */
const EXPLICIT = /挿入|挿れ|中出し|中に出し|精液|白濁|射精|(?<![ァ-ヴー])(?:イく|イっ|イッ|イか[さずせ]|イキ|イク)(?![ァ-ヴ])|絶頂|乳首|股間|陰部|ペニス|性器|秘所|秘部|膣|フェラ|愛液|勃起|騎乗位|正常位|後背位|寝バック|立ちバック|セックス|性行為|種付|ノット|喘ぎ|喘い|しゃぶ|寸止め|突き上げ|腰を打ち|腰を振|孕ま|孕ん|媚肉|秘裂|肉棒|ザーメン|アナル|後孔|淫[らさ靡乱蕩語]|♡|\{(?:男性器|亀頭|女性器|陰核|ナカ|胸|乳首|尻|後ろ|精液|愛液|股間|前立腺|結腸)\}/;
/* 二段目（止めない。件数だけ出す）：safe.js の HARD（奥まで・跨・果て など、文脈しだいで性的な語）。印の付け忘れの当たりをつけるために */
function loadHard(dir) { try { const m = fs.readFileSync(path.join(dir, 'js/safe.js'), 'utf8').match(/var HARD = \/(.*)\/;/); return m ? new RegExp(m[1]) : null; } catch (e) { return null; } }
/* R18の印の行で挟まれた部分を落とす（行の対応表 map：かたまりの行 → 元の行。ok はその行に r18:ok があるか） */
function strip(src, f, map) {
  const lines = src.split('\n'), out = [];
  let inB = false, beginAt = 0;
  lines.forEach((l, k) => {
    if (RB.test(l)) { if (inB) throw new Error(f + ':' + (k + 1) + ' r18:begin が入れ子になっています'); inB = true; beginAt = k + 1; out.push({ t: '/* r18: 全年齢版では省略 */', n: k + 1 }); return; }
    if (RE.test(l)) { if (!inB) throw new Error(f + ':' + (k + 1) + ' r18:end だけがあります'); inB = false; return; }
    if (!inB) out.push({ t: l, n: k + 1 });
  });
  if (inB) throw new Error(f + ':' + beginAt + ' r18:begin が閉じていません');
  if (map) out.forEach(o => map.push({ f, n: o.n, ok: ROK.test(o.t) }));
  return out.map(o => o.t).join('\n');
}
function loadAcorn() { for (const t of [process.env.ACORN_MODULE, 'acorn', '/opt/node-tools/node_modules/acorn']) { try { if (t) return require(t); } catch (e) { /* 次 */ } } return null; }
function needAcorn(why) {
  const a = loadAcorn();
  if (!a) throw new Error('acorn が見つかりません。リポジトリの直下（package.json のあるフォルダ）で一度 npm install を実行してください（または ACORN_MODULE=acorn のフォルダ）。' + why);
  return a;
}
/* 軽量化：コメント・字下げ・空行・余分な空白を落とす（字句の中身はそのまま写す） */
const NL = /[\n\r\u2028\u2029]/, HEAD = /\/\* ==== (js\/\S+\.js) ==== \*\//;
const WORD = c => /[A-Za-z0-9_$\\#]/.test(c) || c > '\x7f', OPC = c => '+-*/%<>=!&|^~?.:'.indexOf(c) >= 0;
function lex(acorn, code) {
  const list = [];
  for (const t of acorn.tokenizer(code, { ecmaVersion: 'latest', allowHashBang: true })) list.push(t);
  return list;
}
function minify(code, name) {
  const acorn = needAcorn('軽量化に使います（--no-min で軽量化なし）');
  const toks = lex(acorn, code), out = [];
  let prevEnd = 0, prev = '', prevNum = false;
  toks.forEach(t => {
    const raw = code.slice(t.start, t.end), gap = code.slice(prevEnd, t.start);
    if (gap) {
      const h = gap.match(HEAD);
      if (h) out.push(prevEnd ? '\n' : '', '/* ==== ' + h[1] + ' ==== */\n');
      else if (NL.test(gap)) { if (prevEnd) out.push('\n'); }
      else if (prev && raw) {
        const a = prev[prev.length - 1], b = raw[0];
        if ((WORD(a) && WORD(b)) || (OPC(a) && OPC(b)) || (prevNum && b === '.')) out.push(' ');
      }
    }
    out.push(raw);
    if (raw) { prev = raw; prevNum = t.type.label === 'num'; }
    prevEnd = t.end;
  });
  const min = out.join('') + '\n';
  /* 確かめ：字句の並び（元の文字のまま）と、字句の前に改行があるかどうかが元と同じこと（HK.Load.def の包みの字句も含めて） */
  const sig = (c, list) => { let pe = 0; return list.map(t => { const s = (NL.test(c.slice(pe, t.start)) ? '\n' : '') + c.slice(t.start, t.end); pe = t.end; return s; }); };
  const a = sig(code, toks), b = sig(min, lex(acorn, min));
  /* 先頭の字句の前の改行（見出しのあと）は数えない */
  if (a.length) a[0] = a[0].replace(/^\n/, ''); if (b.length) b[0] = b[0].replace(/^\n/, '');
  if (a.length !== b.length) throw new Error(name + ' の軽量化で字句の数が変わりました（' + a.length + '→' + b.length + '）');
  for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) throw new Error(name + ' の軽量化で字句が変わりました（' + i + '番目：' + JSON.stringify(a[i]).slice(0, 80) + ' → ' + JSON.stringify(b[i]).slice(0, 80) + '）');
  return min;
}
/* 抜いたあとのかたまりに性的な語が残っていないか（文字列リテラルだけを見る）。見つかった場所の一覧を返す */
function guard(code, map, name, soft, HARD) {
  const acorn = needAcorn('全年齢版のビルドには必要です');
  const bad = [];
  for (const tok of acorn.tokenizer(code, { ecmaVersion: 2022, locations: true })) {
    if (tok.type.label !== 'string' && tok.type.label !== 'template') continue;
    const v = String(tok.value == null ? '' : tok.value);
    const m = map[tok.loc.start.line - 1];
    if (m && m.ok) continue;
    if (EXPLICIT.test(v)) bad.push((m && m.n ? m.f + ':' + m.n : name + ':' + tok.loc.start.line) + '　[' + (v.match(EXPLICIT) || [''])[0] + ']　' + v.replace(/\s+/g, ' ').slice(0, 60));
    else if (soft && HARD && m && m.n && HARD.test(v) && v.length >= 12) soft.push(m.f + ':' + m.n + '　[' + (v.match(HARD) || [''])[0] + ']　' + v.replace(/\s+/g, ' ').slice(0, 60));
  }
  return bad;
}
/* 包んでよいか：最上位の宣言（包むと大域の名前でなくなる）と 'use strict'（包むと関数の中だけに効く＝意味は同じだが、
   元が大域で効いていたなら、ほかのファイルの書き方まで変わっていたことになる）を見つけたら、その説明を返す */
function checkTop(src, f) {
  const acorn = needAcorn('包んでよいかの確かめに使います');
  let ast;
  try { ast = acorn.parse(src, { ecmaVersion: 'latest', sourceType: 'script', allowHashBang: true, allowReturnOutsideFunction: false }); }
  catch (e) { return [f + ': 構文の誤り（' + e.message + '）']; }
  const out = [];
  ast.body.forEach(n => {
    const line = src.slice(0, n.start).split('\n').length;
    if (n.type === 'VariableDeclaration') out.push(f + ':' + line + ' 最上位に ' + n.kind + ' の宣言（' + n.declarations.map(d => d.id && d.id.name || '?').join(', ') + '）');
    else if (n.type === 'FunctionDeclaration') out.push(f + ':' + line + ' 最上位に function の宣言（' + (n.id && n.id.name) + '）');
    else if (n.type === 'ClassDeclaration') out.push(f + ':' + line + ' 最上位に class の宣言（' + (n.id && n.id.name) + '）');
    else if (n.type === 'ExpressionStatement' && n.directive) out.push(f + ':' + line + " 最上位に '" + n.directive + "'");
  });
  return out;
}
module.exports = { EXPLICIT, loadHard, strip, loadAcorn, minify, guard, checkTop };
