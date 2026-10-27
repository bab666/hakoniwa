/* 箱庭シミュレーター：読み込むスクリプトを2つにまとめる
   node build.js <ビルドのディレクトリ>（hakoniwa-full / hakoniwa-zenrei）
   ・<ビルド>/js/_order.txt が読み込み順の一覧（1行に1ファイル。「late js/xx.js」は画面が出たあとで読む。# から行末はコメント）
   ・先に読む分を js/bundle-main.js、あとで読む分を js/bundle-late.js にまとめ、index.html の
     <!-- scripts:begin --> 〜 <!-- scripts:end --> のあいだを書き換える（?v= は中身から自動で付く）
   ・あとで読む分は、画面が出たあと裏で読み込む。読み終わると HK.LATE_READY = true になり HK.onLate() が呼ばれる
   ・全年齢版（index.html に window.HK_SAFE_BUILD = 1 がある）のビルドでは、R18の文を抜く：
       ソースの中で、行全体が「/＊ r18:begin ＊/」と「/＊ r18:end ＊/」（半角）の行に挟まれた部分を、まとめた結果（bundle）から落とす
       （js/ のソースは R18版とバイト一致のまま。全年齢版の index.html が読むのは bundle だけ）。
       抜いたあとの bundle を acorn で字句に分け、文字列リテラルに性的な語（EXPLICIT）が残っていればエラーにしてビルドを止める
       （コメント・正規表現は見ない。全年齢版で使ってよい語の行は、その行に「/＊ r18:ok ＊/」（半角）を書く）。
       印の付け忘れは、このエラーで見つかる（実行時の検知に頼らない）。--no-guard を付けると、エラーでも止めない（移行作業の途中だけ）。--all で残りを全部、--soft で二段目（HARD）の一覧も出す
   ・軽量化（両ビルド。全年齢版の検査のあと）：acorn で字句に分け、コメント・字下げ・空行・字句のあいだの余分な空白を落とす。
       字句（文字列・テンプレート・正規表現を含む）は元のソースから一字も変えずに写す。改行があったところは改行を1つ残す（自動セミコロン挿入を変えない）。
       ファイルの見出し（「;／＊ ==== js/xx.js ==== ＊／」）は残す。落としたあと字句に分け直し、字句の並び・改行の位置が元と同じでなければエラーで止める。
       --no-min を付けると軽量化しない（調べもの用）
   ・事前圧縮：bundle-main.js.gz／.br、bundle-late.js.gz／.br も作る（サーバが Accept-Encoding を見て返す。.htaccess）。中身が前と同じなら作り直さない。
       .br はふだん品質9、公開の前は --best で品質11（1割ほど小さくなるが、作るのに1分ほどかかる） */
'use strict';
const fs = require('fs'), path = require('path'), crypto = require('crypto');
const args = process.argv.slice(2).filter(a => !/^--/.test(a)), flags = process.argv.slice(2).filter(a => /^--/.test(a));
const dir = path.resolve(args[0] || '.');
const ip0 = path.join(dir, 'index.html');
const STRIP = fs.existsSync(ip0) && /HK_SAFE_BUILD\s*=\s*1/.test(fs.readFileSync(ip0, 'utf8'));
const RB = /^\s*\/\*\s*r18:begin\b[^*]*\*\/\s*$/, RE = /^\s*\/\*\s*r18:end\b[^*]*\*\/\s*$/, ROK = /\/\*\s*r18:ok\s*\*\//;
/* 性的な語（全年齢版の bundle の文字列リテラルに残ってはいけない語）。体の語の印（{男性器} など。R18版の lewd-words.js が語に置き換える）も入れない */
const EXPLICIT = /挿入|挿れ|中出し|中に出し|精液|白濁|射精|(?<![ァ-ヴー])(?:イく|イっ|イッ|イか[さずせ]|イキ|イク)(?![ァ-ヴ])|絶頂|乳首|股間|陰部|ペニス|性器|秘所|秘部|膣|フェラ|愛液|勃起|騎乗位|正常位|後背位|寝バック|立ちバック|セックス|性行為|種付|ノット|喘ぎ|喘い|しゃぶ|寸止め|突き上げ|腰を打ち|腰を振|孕ま|孕ん|媚肉|秘裂|肉棒|ザーメン|アナル|後孔|淫[らさ靡乱蕩語]|♡|\{(?:男性器|亀頭|女性器|陰核|ナカ|胸|乳首|尻|後ろ|精液|愛液|股間)\}/;
/* 二段目（止めない。件数だけ出す）：safe.js の HARD（奥まで・跨・果て など、文脈しだいで性的な語）。印の付け忘れの当たりをつけるために */
function loadHard() { try { const m = fs.readFileSync(path.join(dir, 'js/safe.js'), 'utf8').match(/var HARD = \/(.*)\/;/); return m ? new RegExp(m[1]) : null; } catch (e) { return null; } }
/* R18の印の行で挟まれた部分を落とす（行の対応表 map：bundle の行 → 元の行） */
function strip(src, f, map) {
  const lines = src.split('\n'), out = [];
  let inB = false, beginAt = 0;
  lines.forEach((l, k) => {
    if (RB.test(l)) { if (inB) throw new Error(f + ':' + (k + 1) + ' r18:begin が入れ子になっています'); inB = true; beginAt = k + 1; out.push({ t: '/* r18: 全年齢版では省略 */', n: k + 1 }); return; }
    if (RE.test(l)) { if (!inB) throw new Error(f + ':' + (k + 1) + ' r18:end だけがあります'); inB = false; return; }
    if (!inB) out.push({ t: l, n: k + 1 });
  });
  if (inB) throw new Error(f + ':' + beginAt + ' r18:begin が閉じていません');
  out.forEach(o => map.push({ f, n: o.n, ok: ROK.test(o.t) }));
  return out.map(o => o.t).join('\n');
}
function loadAcorn() { for (const t of [process.env.ACORN_MODULE, 'acorn', '/opt/node-tools/node_modules/acorn']) { try { if (t) return require(t); } catch (e) { /* 次 */ } } return null; }
/* 軽量化：コメント・字下げ・空行・余分な空白を落とす（字句の中身はそのまま写す） */
const NL = /[\n\r\u2028\u2029]/, HEAD = /\/\* ==== (js\/\S+\.js) ==== \*\//;
const WORD = c => /[A-Za-z0-9_$\\#]/.test(c) || c > '\x7f', OPC = c => '+-*/%<>=!&|^~?.:'.indexOf(c) >= 0;
function lex(acorn, code) {
  const list = [];
  for (const t of acorn.tokenizer(code, { ecmaVersion: 'latest', allowHashBang: true })) list.push(t);
  return list;
}
function minify(code, name) {
  const acorn = loadAcorn();
  if (!acorn) throw new Error('acorn が見つかりません（npm i acorn か ACORN_MODULE=パス）。軽量化に使います（--no-min で軽量化なし）');
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
  /* 確かめ：字句の並び（元の文字のまま）と、字句の前に改行があるかどうかが元と同じこと */
  const sig = (c, list) => { let pe = 0; return list.map(t => { const s = (NL.test(c.slice(pe, t.start)) ? '\n' : '') + c.slice(t.start, t.end); pe = t.end; return s; }); };
  const a = sig(code, toks), b = sig(min, lex(acorn, min));
  /* 先頭の字句の前の改行（見出しのあと）は数えない */
  if (a.length) a[0] = a[0].replace(/^\n/, ''); if (b.length) b[0] = b[0].replace(/^\n/, '');
  if (a.length !== b.length) throw new Error(name + ' の軽量化で字句の数が変わりました（' + a.length + '→' + b.length + '）');
  for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) throw new Error(name + ' の軽量化で字句が変わりました（' + i + '番目：' + JSON.stringify(a[i]).slice(0, 80) + ' → ' + JSON.stringify(b[i]).slice(0, 80) + '）');
  return min;
}
/* 抜いたあとの bundle に性的な語が残っていないか（文字列リテラルだけを見る） */
function guard(code, map, name, soft) {
  const acorn = loadAcorn();
  if (!acorn) throw new Error('acorn が見つかりません（npm i acorn か ACORN_MODULE=パス）。全年齢版のビルドには必要です');
  const bad = [], HARD = loadHard();
  for (const tok of acorn.tokenizer(code, { ecmaVersion: 2022, locations: true })) {
    if (tok.type.label !== 'string' && tok.type.label !== 'template') continue;
    const v = String(tok.value == null ? '' : tok.value);
    const m = map[tok.loc.start.line - 1];
    if (m && m.ok) continue;
    if (EXPLICIT.test(v)) bad.push((m ? m.f + ':' + m.n : name + ':' + tok.loc.start.line) + '　[' + (v.match(EXPLICIT) || [''])[0] + ']　' + v.replace(/\s+/g, ' ').slice(0, 60));
    else if (soft && HARD && m && HARD.test(v) && v.length >= 12) soft.push(m.f + ':' + m.n + '　[' + (v.match(HARD) || [''])[0] + ']　' + v.replace(/\s+/g, ' ').slice(0, 60));
  }
  return bad;
}
const order = fs.readFileSync(path.join(dir, 'js/_order.txt'), 'utf8').split('\n')
  .map(l => l.replace(/#.*$/, '').trim()).filter(Boolean)
  .map(l => { const m = l.match(/^(late\s+)?(js\/\S+\.js)$/); if (!m) throw new Error('読めない行: ' + l); return { late: !!m[1], f: m[2] }; });
const seen = new Set();
order.forEach(o => { if (seen.has(o.f)) throw new Error('重複: ' + o.f); seen.add(o.f); if (!fs.existsSync(path.join(dir, o.f))) throw new Error('ファイルがない: ' + o.f); });
/* 一覧に載っていない js/*.js を知らせる（読み込み漏れの防止） */
fs.readdirSync(path.join(dir, 'js')).filter(f => /\.js$/.test(f) && !/^bundle-/.test(f)).forEach(f => { if (!seen.has('js/' + f)) console.warn('※ _order.txt に載っていない: js/' + f); });
function cat(list, map) {
  return list.map(o => {
    let src = fs.readFileSync(path.join(dir, o.f), 'utf8').replace(/\s+$/, '');
    if (map) { map.push({ f: o.f, n: 0 }); src = strip(src, o.f, map); return ';/* ==== ' + o.f + ' ==== */\n' + src + '\n'; }
    return ';/* ==== ' + o.f + ' ==== */\n' + src + '\n';
  }).join('');
}
const mapM = STRIP ? [] : null, mapL = STRIP ? [] : null;
let main = cat(order.filter(o => !o.late), mapM), late = cat(order.filter(o => o.late), mapL);
if (STRIP) {
  /* strip() は末尾の改行を落とすので、行の対応表を bundle の行と合わせ直す：ファイルごとの見出し行＋本文の行数 */
  const soft = [], bad = guard(main, mapM, 'bundle-main.js', soft).concat(guard(late, mapL, 'bundle-late.js', soft));
  if (soft.length) {
    const per = {}; soft.forEach(x => { const f = x.split(':')[0]; per[f] = (per[f] || 0) + 1; });
    console.warn('※ 注意（止めません）：文脈しだいで性的な語（safe.js の HARD）を含む12文字以上の文字列が ' + soft.length + ' 件。印の付け忘れがないか見てください：' + Object.keys(per).sort((a, b) => per[b] - per[a]).map(f => f.replace('js/', '') + ' ' + per[f]).join('、'));
    if (flags.indexOf('--soft') >= 0) soft.forEach(x => console.warn('  ' + x));
  }
  if (bad.length) {
    console.error('※ 全年齢版の bundle に性的な語が残っています（' + bad.length + '件）。/* r18:begin */〜/* r18:end */ で挟むか、全年齢で使う語なら行に /* r18:ok */ を書いてください');
    bad.slice(0, flags.indexOf('--all') >= 0 ? 1e9 : 60).forEach(b => console.error('  ' + b));
    if (bad.length > 60 && flags.indexOf('--all') < 0) console.error('  …ほか ' + (bad.length - 60) + ' 件（--all で全部出す）');
    if (flags.indexOf('--no-guard') < 0) process.exit(1);
  }
}
const hv = s => crypto.createHash('sha1').update(s).digest('hex').slice(0, 10);
const raw0 = { main: Buffer.byteLength(main), late: Buffer.byteLength(late) };
if (flags.indexOf('--no-min') < 0) { main = minify(main, 'bundle-main.js'); late = late ? minify(late, 'bundle-late.js') : late; }
/* 書き出しと事前圧縮（.gz は gzip の最大圧縮。.br は brotli の品質9：最大の11は1割ほど小さいが1本に40秒かかるので、公開の前だけ --best で11にする。
   中身が前と同じで、圧縮済みのファイルをほどくと同じ中身になるなら作り直さない（--best のときは作り直す） */
const BRQ = flags.indexOf('--best') >= 0 ? 11 : 9;
const zlib = require('zlib'), zs = {};
function emit(base, code) {
  const fp = path.join(dir, 'js', base), buf = Buffer.from(code, 'utf8');
  /* 圧縮済みのファイルは、ほどいて中身が一致するときだけ使い回す（取り込みなどで .js と .gz／.br の版がずれていたら作り直す） */
  const ok = (f, un) => { try { return un(fs.readFileSync(f)).equals(buf); } catch (e) { return false; } };
  const same = BRQ < 11 && fs.existsSync(fp) && fs.readFileSync(fp).equals(buf) && ok(fp + '.gz', zlib.gunzipSync) && ok(fp + '.br', zlib.brotliDecompressSync);
  if (!same) {
    fs.writeFileSync(fp, buf);
    fs.writeFileSync(fp + '.gz', zlib.gzipSync(buf, { level: 9 }));
    fs.writeFileSync(fp + '.br', zlib.brotliCompressSync(buf, { params: { [zlib.constants.BROTLI_PARAM_QUALITY]: BRQ, [zlib.constants.BROTLI_PARAM_LGWIN]: 24, [zlib.constants.BROTLI_PARAM_MODE]: zlib.constants.BROTLI_MODE_TEXT, [zlib.constants.BROTLI_PARAM_SIZE_HINT]: buf.length } }));
  }
  zs[base] = { raw: buf.length, gz: fs.statSync(fp + '.gz').size, br: fs.statSync(fp + '.br').size };
}
emit('bundle-main.js', main);
emit('bundle-late.js', late);
const lateUrl = 'js/bundle-late.js?v=' + hv(late);
const block = '<!-- scripts:begin（hakoniwa-tools/build/build.js が書き換える。手で直さず js/_order.txt を直して build する） -->\n' +
  '<script src="js/bundle-main.js?v=' + hv(main) + '"></script>\n' +
  (late ? '<script>(function () { var HK = window.HK; HK.LATE_READY = false; var s = document.createElement(\'script\'); s.src = \'' + lateUrl + '\';\n' +
    '  s.onload = function () { HK.LATE_READY = true; if (HK.onLate) HK.onLate(); };\n' +
    '  s.onerror = function () { HK.LATE_READY = true; HK.LATE_FAILED = true; if (HK.onLate) HK.onLate(); };\n' +
    '  document.body.appendChild(s); })();</script>\n' : '') +
  '<!-- scripts:end -->';
const ip = path.join(dir, 'index.html');
let html = fs.readFileSync(ip, 'utf8');
if (!/<!-- scripts:begin/.test(html)) throw new Error('index.html に <!-- scripts:begin --> がありません');
html = html.replace(/<!-- scripts:begin[\s\S]*?<!-- scripts:end -->/, block);
/* あとで読む分は先読みしない（先に読む分と回線を取り合って、画面が出るのが遅くなるため）。以前の先読み指定は消す */
html = html.replace(/<link rel="preload" as="script" href="js\/bundle-late\.js[^>]*>\n?/g, '');
/* トップの「最終更新」の日付は docs/CHANGELOG.md のいちばん上の日付に合わせる（手で直し忘れないように） */
try {
  const cl = fs.readFileSync(path.join(__dirname, '../../docs/CHANGELOG.md'), 'utf8'), md = cl.match(/^## (\d{4})-(\d{2})-(\d{2})/m);
  if (md) html = html.replace(/最終更新：<time datetime="\d{4}-\d{2}-\d{2}">\d{4}年\d{1,2}月\d{1,2}日<\/time>/, '最終更新：<time datetime="' + md[1] + '-' + md[2] + '-' + md[3] + '">' + +md[1] + '年' + +md[2] + '月' + +md[3] + '日</time>');
} catch (e) { console.warn('※ 最終更新の日付を合わせられませんでした: ' + e.message); }
fs.writeFileSync(ip, html);
const k = n => Math.round(n / 1024) + 'KB', zz = z => k(z.raw) + '（gz ' + k(z.gz) + '・br ' + k(z.br) + '）';
console.log(path.basename(dir) + '：先に読む ' + order.filter(o => !o.late).length + '本 ' + zz(zs['bundle-main.js']) + '／あとで読む ' + order.filter(o => o.late).length + '本 ' + zz(zs['bundle-late.js']) +
  (raw0.main !== zs['bundle-main.js'].raw ? '　※軽量化の前 ' + k(raw0.main) + '／' + k(raw0.late) : ''));
