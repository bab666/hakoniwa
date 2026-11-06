/* 3本のベース「K｜F｜P」で書いた台詞の約束を、ソースから機械で確かめる（書くときの約束の番人）
   node base-lint.js <ビルドのフォルダ> [--all]
   ・3本そろっているか（「＝」と空は左と同じ）
   ・印（{a} {b} {c} {n} 〈〉 {m…} など）が3本で一致しているか
   ・P の文末が敬語の形か（です・ます・ません・ました・でしょう・ください・ましょう・でした・ございます・なさい ＋ か・ね・よ・から・けど など）
   ・K と F の文末に敬語（です・ます）が残っていないか
   ・F の文末に くだけた語尾（だよ・だね・じゃん・でしょ・かな・の？ など）が残っていないか（F は 〜だ／〜か／〜な／〜だろう／命令形）
   ・一人称が「私」以外（俺・僕・あたし）になっていないか、二人称が「あなた」以外（お前・きみ・あんた）になっていないか
   ・一人称・二人称は印 {一人称}・{二人称} で書く（2026-11-06。docs/reports/2026-11-06/fp-marker-design.md）。印は正しい書き方として通し、
     3 本で印の数が違ってもよい（敬語では一人称を省くなど）
   ・「私」「あなた」の直書きは、すべての台詞（3 本・1 本の「」の中・台詞の表）と書き下ろしの値で問題にする（2026-11-06 に古い書き方を一括で移した。
     見つけ方と除くもの（私物・私語・公私などの一人称でない「私」、あなたさま、名詞の引用、地の文・画面の文字列）は移す道具 fp-migrate.js と同じ表。
     直し方は node hakoniwa-tools/build/fp-migrate.js を回す）。--base=<比べる相手> は受け取るが使わない（check.js が比べる相手の問題を引く）
   体言止め・あいさつ・相づち・感嘆（！のみ）・言いさし（……）は P の判定から外す。--all で全部の行を出す */
'use strict';
const fs = require('fs'), path = require('path');
const dir = path.resolve(process.argv[2] || '../../hakoniwa-full'), ALL = process.argv.includes('--all');
const BASE = (process.argv.find(a => a.startsWith('--base=')) || '').slice(7);
const P_END = /(?:です|ます|ません|ました|でしょう|ください|ましょう|でした|ございます|ございました|なさい|ませ|いたします|いただきます|いただけますか|ませんか|でしょうか|ましたか|ますか|ですか|ませんでした|ございません)(?:か|ね|よ|わ|から|けど|けれど|し|ので|のに|って|っけ|よね|かね)?$/;
const K_BAD = /(?:です|ます|ません|ました|ございます|なさい|ください)(?:か|ね|よ|から|けど)?$/;
const F_BAD = /(?:だよ|だね|だよね|じゃん|でしょ|かな|かしら|(?<!も)の|のよ|わよ|(?<![一-鿿])わ|もん|てね|てよ|ないで|ないでよ|ないでね|だってば|ってば|かも|なの|んだよね|だし)$/;
const P_HAS = /(?:です|ます|ません|ました|でしょう|ください|ましょう|でした|ございます|なさい|いたし|いただ)/;
const F_BAD_Q = /(?:の|かな|でしょ|よね|かも|じゃん)$/;
const NEUT = /(?:[一-鿿々ァ-ヶーA-Za-z0-9０-９]|さん|様|ちゃん|くん|を|に|へ|は|も|と|で|ので|のに|なら|たら|れば|ても|でも|から|けど|けれど|し|って|とか|など|だけ|まで|ほど|くらい|ぐらい|ずつ|こそ|……|…|ー|〜|っ|、|ありがとう|おはよう|おやすみ|ごめん|すみません|よろしく|おかえり|ただいま|いただきます|ごちそうさま|さようなら|はい|いいえ|うん|ええ|ああ|おう|へえ|ふうん|さあ|まあ|ほら|ねえ|おい|あの|えっ|あれ|なに|そう|うそ|もう|よし|はいはい|こっち|そっち|どっち|あっち|たぶん|べつに|別に|たまたま|まだ|もっと|あと|いつか|いつでも|どうぞ|お先に|おつかれ|お疲れ|乾杯|次|せーの|わかる|ダメ|だめ|無理|天才|親切|賛成|時効|毒見|当たり前|それだけ|こっちも|こちらも)$/;
const FP_BAD = /(?:^|[^ぁ-ゖァ-ヶ一-鿿])(俺|僕|ぼく|オレ|ボク|あたし|わたくし|拙者|わし|わらわ|うち|ウチ)(?=[はがもをにのとで、。！？」]|$)/;
const YOU_BAD = /(?:^|[^ぁ-ゖァ-ヶ一-鿿])(お前|おまえ|あんた|てめえ|貴様|おぬし|きみ|君)(?=[はがもをにのとで、。！？」]|$)/;
/* 印の一致を見るときは、一人称・二人称の印を外す（3 本で省き方が違ってよい） */
function marks(s) { return (s.match(/\{[^}]+\}|〈〉/g) || []).filter(m => !/^\{[一二]人称\}$/.test(m)).sort().join(' '); }
/* 「私」「あなた」の直書き：移す道具（fp-migrate.js）が移せる所の一覧をそのまま使う（一人称でない「私」の表・除くファイルも共有） */
const FPM = require('../build/fp-migrate.js');
function sents(s) { return s.split(/[。！？!?]+/).map(t => t.replace(/[…‥、っー〜♡\s　]+$/, '').replace(/^[…‥、\s　]+/, '')).filter(t => t.length >= 2); }
function lastSent(s) { const a = sents(s); return a.length ? a[a.length - 1] : ''; }
let files = 0, triples = 0, bad = 0;
const out = [];
for (const f of fs.readdirSync(path.join(dir, 'js')).filter(f => f.endsWith('.js') && !f.startsWith('bundle'))) {
  const src = fs.readFileSync(path.join(dir, 'js', f), 'utf8');
  const qs = src.match(/「[^」]*｜[^」]*」/g) || [];
  if (!qs.length) continue;
  files++;
  qs.forEach(q => {
    /* 頭の話し手の目印「＠{b}＠」（voice.js。3本の台詞でも頭に一つだけ付ける）は、印の数え方から外す */
    const body = q.slice(1, -1).replace(/^＠[^＠「」｜。、！？\s]{0,16}＠/, '');
    if (/^(?:base|元の台詞|id)｜/.test(body)) return;   /* 見出しのコメント */
    const p = body.split('｜');
    const probs = [];
    if (p.length !== 3) probs.push('3本でない（' + p.length + '）');
    const v = [];
    for (let i = 0; i < 3; i++) { let x = (p[i] || '').trim(); if (!x || x === '＝' || x === '=') x = v[i - 1] || ''; v.push(x); }
    /* 文末の形は、印を「私」「あなた」に戻して見る（「〜のに、{一人称}」の言いさしを「私」と同じに扱う） */
    const [K, F, P] = v.map(x => x.replace(/\{一人称\}/g, '私').replace(/\{二人称\}/g, 'あなた'));
    triples++;
    if (marks(K) !== marks(F) || marks(K) !== marks(P)) probs.push('印が3本で違う');
    const pl = lastSent(P), kl = lastSent(K), fl = lastSent(F);
    const allSame = K === F && F === P;
    /* P：最後の文に敬語の形が一つもなければ問題（読点のあとの体言・言いさし「〜が」「〜けど」「〜て」は許す） */
    if (pl && !P_END.test(pl) && !NEUT.test(pl) && !/[！!]$/.test(P.trim()) && !P_HAS.test(pl)) probs.push('P の文末が敬語でない：' + pl);
    /* K が P と同じ敬語の決まり文句（行ってきます・ポイントが減りました の読み上げ）は、わざと敬語なので許す */
    if (kl && K_BAD.test(kl) && !NEUT.test(kl) && K !== P) probs.push('K の文末が敬語：' + kl);
    if (fl && K_BAD.test(fl) && !NEUT.test(fl)) probs.push('F の文末が敬語：' + fl);
    if (fl && !allSame && F !== K && (F_BAD.test(fl) || (/[？?]$/.test(F) && F_BAD_Q.test(fl)))) probs.push('F の文末がくだけている：' + fl);
    [K, F, P].forEach((x, i) => { const m = x.match(FP_BAD); if (m && !/^(?:うち|ウチ)$/.test(m[1])) probs.push('KFP'[i] + ' に一人称「' + m[1] + '」（{一人称}で書く）'); });   /* 「うち、ここから近い」の うち は家 */
    [K, F, P].forEach((x, i) => { const m = x.match(YOU_BAD); if (m) probs.push('KFP'[i] + ' に二人称「' + m[1] + '」（{二人称}で書く）'); });
    if (probs.length) { bad++; out.push(f + '\t' + body + '\n   ' + probs.join('／')); }
    else if (ALL) out.push(f + '\t' + body);
  });
}
/* 「私」「あなた」の直書き（すべての台詞と書き下ろしの値） */
const DIRECT = FPM.scan([path.join(dir, 'js')]);
const KIND = { a: '台詞', c: '台詞の表', b: '書き下ろしの値' };
DIRECT.list.forEach(l => {
  const c = l.split('\t'), b0 = c[2], b1 = c[4], fp = /\{一人称\}/.test(b1) && (b1.match(/\{一人称\}/g) || []).length > (b0.match(/\{一人称\}/g) || []).length;
  const yu = (b1.match(/\{二人称\}/g) || []).length > (b0.match(/\{二人称\}/g) || []).length;
  bad++;
  out.push(path.basename(c[0]) + '\t' + b0.slice(0, 120) + '\n   ' + [fp ? '「私」の直書き' : '', yu ? '「あなた」の直書き' : ''].filter(Boolean).join('・') + '（' + (KIND[c[1]] || c[1]) + '。{一人称}・{二人称} で書く。node hakoniwa-tools/build/fp-migrate.js で移せる）');
});
console.log('ファイル ' + files + '　3本の台詞 ' + triples + '　問題 ' + bad + '（うち「私」「あなた」の直書き ' + DIRECT.list.length + '）');
out.forEach(l => console.log(l));
process.exit(bad ? 1 : 0);
