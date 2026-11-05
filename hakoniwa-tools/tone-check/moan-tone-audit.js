/* 喘ぎの口調の点検（2026-11-03）：住人の口調（49 種）・性別・夜の性格・態度ごとに、口調に合わない喘ぎを数える
   使い方: node moan-tone-audit.js <ビルドのディレクトリ> [1箱庭・1口調・1夜の性格あたりの回数=2] [--nights=none,sadist,maso,mean,sweet,shy]
             [--tones=口調,…] [--scen=箱庭id,…] [--why] [--show=8] [--json=出力.json] [--from=前の出力.json,…] [--dialog]
     例：node moan-tone-audit.js ../../hakoniwa-full                    … R18版の全箱庭（約 6 分）
         HK_PACK_CODES=DDDD-EEEE-FFFF HK_ONLY_SCEN=set-b-shinkon node moan-tone-audit.js <試しのフォルダ>/hakoniwa-full 4 --scen=set-b-shinkon
                                                                           … 追加パックの新婚部屋（build/pack-site.js で作った試しのフォルダ）
         node moan-tone-audit.js --from=a.json --why                     … 集めた喘ぎに規則だけ当て直す（規則を直したときの確かめ）
   集め方：moan-audit.js（喘ぎ声の点検）を、夜の性格ごと（なし・サド・マゾ・意地悪・甘々・恥じらい）に回して喘ぎを集める（口調を全員に固定。
     エゴグラムは乱数なので、態度がエゴグラムで決まる口調（ヤンキー・のじゃ・無口など）は態度 9 種がまんべんなく出る。夜の性格は喘ぎの基盤の態度を変える
     （サド＝強気・マゾ＝健気・意地悪＝奔放・甘々＝穏やか・恥じらい＝恥じらい）ので、強い口調の人に健気・恥じらいの基盤が当たる組み合わせもここで見る）。
   数えるもの（口調に合わない喘ぎ。moan-audit.js の (a)＝lint.js の MOAN_RULES に、下の TONE_RULES を足したもの）：
     強い口調（強気・兄貴分・ヤンキー・熱血・厳格・冷静・紳士・尊大・神・のじゃ・論客・無機質）の、女性的な語尾（〜わ・〜のよ・〜なの・〜ないの）・
       甘えた語尾（〜ちゃう・ちょうだい・〜だもん・〜てぇ・〜よぉ）・弱いお願い（〜ないで・もっと、して）（男女とも）、
     敬語でない口調の敬語（イきます・〜ください）、無口の女性的な語尾・伸ばした甘え（すきぃ・とまってぇ・ちょうだい）、無口の長い声、一人称の取り違え、男性の女性的な語尾、口調の付け替えの崩れ（まっしろ→まっしたまえ）、
     頼みの形の二重（「見ないで、くれると」を「見るな、くれると」、「して……くれ」を「してくれたまえ……くれ」にしたもの）
   「喘ぎ」（HK.Moan の声・喘ぎの表）と「台詞（参考）」（場面のファイルの台詞のうち喘ぎに見えるもの。台詞の点検の受け持ち）に分けて出す。
   終了コード：喘ぎの件数が 0 なら 0 */
'use strict';
const fs = require('fs'), path = require('path'), cp = require('child_process'), os = require('os');
const { MOAN_RULES } = require('./lint.js');
const args = process.argv.slice(2).filter(a => !/^--/.test(a));
const opt = k => (process.argv.find(a => a.indexOf('--' + k + '=') === 0) || '').slice(k.length + 3);
const WHY = process.argv.includes('--why'), SHOW = +opt('show') || (WHY ? 12 : 6), DIALOG = process.argv.includes('--dialog');

/* ---------- 規則 ---------- */
const MG = MOAN_RULES.GROUPS;
const grp = s => { const o = {}; s.split(' ').forEach(k => { o[k] = 1; }); return o; };
/* 強い口調（はっきりした口調＋熱血。チャラい（〜っしょ）は軽い口調なので「イっちゃう」「止めないで」を数えない） */
const STRONG = grp('proud aniki yankee hero stern cool calm gentleman sondai god noja ronkyaku flat_plain');
/* 敬語を使ってよい口調（敬語の口調・敬語まじり・関西弁の「〜ですわ」） */
const POLITE_OK = grp('polite devoted ojou kohai genki keigo_sarc keigo_bossy keigo_flat otaku keigo_twist chara_down mixed kansai');
const E_ = '(?=[…‥。！？!?、」♡〜ー　\\sっッ]|$)', ME = s => new RegExp('(?:' + s + ')' + E_);
const L_ = '(?:^|[、。…‥「\\s　♡！!？?っ゛])';
const M_WA = '(?<=[ぁ-ゖ一-鿿々ー][ぁ-ゖ])(?<![うたけふじぞざほぽっ])(?<!しあ)わ(?!、わ)';
/* 「〜なの」「〜いいの」は言い切り（後ろが「、」なら「こんなの、」「気持ちいいの、」の名詞なので数えない） */
const E2 = '(?=[…‥。！？!?」♡〜ー　\\sっッ]|$)';
const FEM_END = t => new RegExp('(?:' + (MG.grand[t] || t === 'noja' ? '' : M_WA + '|') + 'のよ|かしら|わね|わよ|なのね|のね)' + E_ + '|(?<![こそあど]ん)(?:なの|ないの|いいの|のぉ+)' + E2);
/* 甘えた語尾：〜ちゃう（イっちゃう・とけちゃ…）・飛んじゃう・ちょうだい・〜だもん・赤ちゃん言葉・〜てぇ・〜よぉ（「しろよぉ」のような崩れた命令は除く） */
const SWEET = new RegExp('(?<=[っれけでしせてねえ])ちゃ(?:う|った|って|い|お)?(?=[…‥。！？!?、」♡〜ー　\\sっッぅうそ]|$)|(?<=ん)じゃ(?:う|った)(?=[…‥。！？!?、」♡〜ー　\\sっッぅ]|$)|ちょうだい|でちゅ|でしゅ|ましゅ|' +
  '(?:だ|ん)もん' + E_ + '|[てで]ぇ+' + E_ + '|(?<![ろれえけせてめな]、?)よぉ+' + E_);
/* 弱いお願い（〜ないで・もっと、して・来て）。後ろに「くれ」「ほしい」が付けば頼みの言い切りなので数えない */
const ASK_ = '(?![、…‥っッ♡\\s　]*(?:くれ|くん|もら|ほし|欲し|おくれ|たも|いただ|頂))';
const PLEA = new RegExp('(?<=[ぁ-ゖ一-鿿])ないで' + E_ + ASK_ + '|' + L_ + '(?:もっと、?|ずっと……|ぎゅって、?)?(?:して|してて|来て|きて|入れて|いれて|抱いて|突いて|動いて|うごいて|触って|さわって|吸って|噛んで|イかせて|いかせて|見てて|出して|だして)' + E_ + ASK_);
/* 問い（「どこ、触って……」「何、して……」）と「勝手に、動いて」は頼みではない */
const NOT_PLEA = /(?:(?:勝手に|かってに)、?(?:うごいて|動いて)|(?:どこ|何|なに|なん|どう)[、…‥っ]*(?:して|触って|さわって|入れて|いれて|出して|だして|見てて))/g;
const QUIET_SWEET = new RegExp('(?<=[ぁ-ゖ一-鿿ー])[いきしちにひみりぎじびぴ]ぃ+' + E_ + '|(?<=[ぁ-ゖ一-鿿ー])[うくすつぬふむるぐずぶぷ]ぅ+' + E_ + '|(?<=[ぁ-ゖ一-鿿ー])[おこそとのほもろよごぞどぼぽ]ぉ+' + E_ + '|[てで]ぇ+' + E_ + '|ちょうだい|(?:だ|ん)もん' + E_);
const FP_ALL = /(?:^|[^ぁ-ゖ])(俺様|オレ様|俺|オレ|僕|ボク|ぼく|あたし|アタシ|わたくし|わたし|私|拙者|わし|わらわ)(?=[はがもをにのとで、。！？…‥」っ　]|$)/g;
const letters = s => String(s).replace(/[⁠⁡-⁤♡゛ﾞ\s　…‥、。！？!?っッー〜～ぁぃぅぇぉゃゅょ「」（）・]/g, '');
/* 態度の特徴の語（2026-11-05 利用者の報告「厳格のハオンに『あたま、まわんねえ』」）：強気の表の崩した話し方（〜ねえ・〜んな・うるせえ・てめえ・くっそ・〜ぜ）は、
   荒く話す口調（ROUGH_TALK。moan-engine.js の同名の表と同じ）か、普段の態度（m.own＝HK.Moan.psBase。夜の性格を入れない）が強気の人だけ。
   夜の性格「サド」で強気の基盤が当たった厳格・冷静・穏やか・敬語・内気などの人に出たら数える。穏やかの「あらあら」も、強い口調の人に出たら数える */
const ROUGH_TALK = grp('proud aniki yankee hero chara gyaru tame darui darui_lite darui_talk tsun tsun_n kansai');
const ROUGH_WORD = new RegExp('うるせえ|てめえ|てめぇ|くっそ|クッソ|じゃねえ|くんねえ|らんね(?:え|ぇ)?' + E_ + '|(?<=[ぁ-ゖ一-鿿])(?<![めこそあどうもら])んね(?:え|ぇ)?' + E_ +
  '|(?<=[らまがばきみりえけせてめれげべ])(?<![ねネ][えぇ])(?<![だん]が)ね(?:え|ぇ)' + E_ + '|[もが持勝立]たね(?:え|ぇ)' + E_ + '|(?:悪|わる|よ|良|すご|痛|いた|熱|あつ|甘|あま|強|弱|うま|上手)く、?ね(?:え|ぇ)' + E_ +
  '|(?:^|[、…‥「\\s　♡！!っ。]|[にをはがもで]|調子に)(?:触|さわ|見|止め|とめ|進め|始め|乗|の|来|く|す|ふざけ|ざけ|もったい、?ぶ|ぶ|して|見て|笑って|動|うご|抜|入れ)んな' + E_ + '|(?<=[ぁ-ゖ一-鿿])(?<![なせ])ぜ' + E_);
const TONE_RULES = [
  ['態度の特徴の語が別の態度の人に（強気の荒い語）', (q, t, g, m) => !ROUGH_TALK[t] && !(m && m.own === 'proud') && ROUGH_WORD.test(q)],
  ['態度の特徴の語が別の態度の人に（穏やかの「あらあら」）', (q, t) => STRONG[t] && t !== 'noja' && /(?:^|[、…‥「\s　♡！!？?っ])あら(?:あら|まあ)?(?=[、…‥っッ♡！!？?　\s]|$)/.test(q)],
  ['強い口調に女性的な語尾', (q, t) => STRONG[t] && FEM_END(t).test(q)],
  ['強い口調に甘えた語尾', (q, t) => STRONG[t] && SWEET.test(t === 'noja' ? q.replace(/じゃ/g, '') : q)],
  /* 「勝手に、動いて」は頼みではない */
  ['強い口調に弱いお願い', (q, t) => STRONG[t] && PLEA.test(q.replace(NOT_PLEA, ''))],
  /* 頼みの形が二重になった崩れ（「してくれたまえ、くれたまえ」「見るな、くれると」） */
  ['頼みの形の二重', (q, t) => STRONG[t] && /(?:くれたまえ|たもれ|るな|んな|でない|しろ|せよ)[、…‥っ]*(?:くれ|もら)/.test(q)],
  ['強い口調に弱いお願いの拒み・泣き声', (q, t) => STRONG[t] && !MG.firm[t] && (MOAN_RULES.list[1][1](q, 'proud') || MOAN_RULES.list[2][1](q, 'proud'))],
  ['男性に女性的な語尾', (q, t, g) => g === 'm' && !MG.fem[t] && !STRONG[t] && ME('のね|だもん|かしら').test(q)],
  /* 無口（「……」「……ん」）：女性的な語尾と、伸ばした甘え（すきぃ・とまってぇ・ちょうだい・だもん）。短い「イっちゃう」「とめないで」は無口の声として数えない */
  ['無口に女性的な語尾・伸ばした甘え', (q, t) => t === 'mukuchi' && (FEM_END(t).test(q) || QUIET_SWEET.test(q))],
  ['敬語でない口調に敬語', (q, t) => !POLITE_OK[t] && ME('です|ます|ません|ました|でした|ください|くださ|ございます|いたします').test(q)],
  ['無口に長い声', (q, t) => (t === 'mukuchi' && letters(q).length > 14) || (t === 'mukuchi_ne' && letters(q).length > 18)],
  ['一人称の取り違え', (q, t, g, m) => { if (!m || !m.fp) return false; let r = false; String(q).replace(FP_ALL, (a, f) => { if (f !== m.fp && !(f === '私' && /^(?:わたし|ワタシ)$/.test(m.fp)) && !(f === 'わたし' && m.fp === '私')) r = true; return a; }); return r; }],
  ['口調の付け替えの崩れ', q => /(?:まっ|真っ)(?:したまえ|しな|せよ)|っしたまえ/.test(q)]
];
function check(m) {
  const q = m.q, t = m.tone, g = m.g;
  return MOAN_RULES.check(q, t, g).concat(TONE_RULES.filter(([, f]) => f(q, t, g, m)).map(([nm]) => nm));
}
module.exports = { TONE_RULES, check, STRONG, ROUGH_TALK, ROUGH_WORD };
/* 単独で回したときだけ集めて数える（require されたときは規則だけ。node --check が通るよう、上の階層で return しない） */
if (require.main === module) main();
function main() {

/* ---------- 集める ---------- */
let files = opt('from') ? opt('from').split(',') : [];
const dir = args[0], N = +args[1] || 2;
if (!files.length) {
  if (!dir) { console.error('使い方: node moan-tone-audit.js <ビルド> [回数=2] [--nights=…] [--tones=…] [--scen=…] [--why] [--json=…] [--from=…]'); process.exit(1); }
  const nights = opt('nights') || 'none,sadist,maso,mean,sweet,shy';
  const tmp = path.join(os.tmpdir(), 'moan-tone-audit-' + process.pid + '.json');
  const a = [path.join(__dirname, 'moan-audit.js'), dir, String(N), 'r18', '--night=' + nights, '--json=' + tmp];
  if (opt('tones')) a.push('--tones=' + opt('tones'));
  if (opt('scen')) a.push('--scen=' + opt('scen'));
  const t0 = Date.now();
  const r = cp.spawnSync(process.execPath, a, { encoding: 'utf8', maxBuffer: 1 << 28 });
  const head = (r.stdout || '').split('\n')[0];
  console.log(head.replace('moan-audit', 'moan-tone-audit（moan-audit で集めた）') + '　夜の性格 ' + nights + '　' + Math.round((Date.now() - t0) / 1000) + '秒');
  if (r.status !== 0 || !fs.existsSync(tmp)) { console.error(r.stderr || r.stdout); process.exit(2); }
  files = [tmp];
  if (opt('json')) fs.copyFileSync(tmp, opt('json'));
}
const moans = [];
files.forEach(f => { const r = JSON.parse(fs.readFileSync(f, 'utf8')); (r.moans || []).forEach(m => moans.push(m)); });
if (opt('from')) console.log('== moan-tone-audit（' + files.join(',') + ' から）喘ぎ ' + moans.length);
files.forEach(f => { if (!opt('from')) try { fs.unlinkSync(f); } catch (e) { /* 残っていてよい */ } });

/* ---------- 数える ---------- */
const hits = [];
moans.forEach(m => { check(m).forEach(rule => hits.push(Object.assign({ rule, dlg: m.src === '台詞' }, m))); });
const moanHits = hits.filter(h => !h.dlg), dlgHits = hits.filter(h => h.dlg);
const nM = moans.filter(m => m.src !== '台詞').length;
console.log('喘ぎ ' + nM + '（台詞（参考）' + (moans.length - nM) + '）');
console.log('口調に合わない喘ぎ：' + moanHits.length + ' 件（異なる文 ' + new Set(moanHits.map(h => h.tone + h.g + h.q)).size + '）　台詞（参考）：' + dlgHits.length + ' 件');
/* 規則ごと */
const byRule = {};
moanHits.forEach(h => { byRule[h.rule] = (byRule[h.rule] || 0) + 1; });
Object.keys(byRule).sort((a, b) => byRule[b] - byRule[a]).forEach(k => console.log('  ' + k + '　' + byRule[k]));
/* 口調 × 性別 */
const tot = {}, bad = {};
moans.forEach(m => { if (m.src === '台詞') return; const k = m.tone + '\t' + m.g; tot[k] = (tot[k] || 0) + 1; });
moanHits.forEach(h => { const k = h.tone + '\t' + h.g; bad[k] = (bad[k] || 0) + 1; });
const ks = Object.keys(tot).sort((a, b) => (bad[b] || 0) - (bad[a] || 0));
console.log('\n口調\t性別\t件数/喘ぎ\t割合');
ks.forEach(k => { if (bad[k] || WHY) console.log(k + '\t' + (bad[k] || 0) + '/' + tot[k] + '\t' + (100 * (bad[k] || 0) / tot[k]).toFixed(1) + '%'); });
/* 夜の性格・態度ごと */
const byN = {}, byP = {};
moanHits.forEach(h => { byN[h.night || '(なし)'] = (byN[h.night || '(なし)'] || 0) + 1; if (h.ps) byP[h.ps] = (byP[h.ps] || 0) + 1; });
console.log('\n夜の性格ごと：' + Object.keys(byN).map(k => k + ' ' + byN[k]).join('、') + '\n声の基盤の態度ごと：' + Object.keys(byP).sort((a, b) => byP[b] - byP[a]).map(k => k + ' ' + byP[k]).join('、'));
/* 例 */
const show = (list, title) => {
  const g = {};
  list.forEach(h => { (g[h.rule] = g[h.rule] || {}); const u = h.tone + '/' + h.g + '｜' + h.q; (g[h.rule][u] = g[h.rule][u] || { n: 0, h }).n++; });
  Object.keys(g).forEach(k => {
    const us = Object.values(g[k]).sort((a, b) => b.n - a.n);
    console.log('\n### ' + title + k + '　' + us.reduce((n, u) => n + u.n, 0) + '件（異なる文 ' + us.length + '）');
    us.slice(0, SHOW).forEach(u => console.log('  ' + u.n + '× [' + u.h.tone + '/' + u.h.g + '/' + (u.h.night || '-') + '/' + (u.h.ps || '-') + '/' + u.h.style + '/' + u.h.id + '] 「' + u.h.q + '」' + (WHY ? '  ← ' + u.h.src + (u.h.fp ? '（一人称 ' + u.h.fp + '）' : '') : '')));
  });
};
show(moanHits, '');
if (DIALOG || WHY) show(dlgHits, '台詞（参考）');
process.exit(moanHits.length ? 1 : 0);
}
