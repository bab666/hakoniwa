/* 3本のベース「K｜F｜P」で書いた台詞の約束を、ソースから機械で確かめる（書くときの約束の番人）
   node base-lint.js <ビルドのフォルダ> [--all]
   ・3本そろっているか（「＝」と空は左と同じ）
   ・印（{a} {b} {c} {n} 〈〉 {m…} など）が3本で一致しているか
   ・P の文末が敬語の形か（です・ます・ません・ました・でしょう・ください・ましょう・でした・ございます・なさい ＋ か・ね・よ・から・けど など）
   ・K と F の文末に敬語（です・ます）が残っていないか
   ・F の文末に くだけた語尾（だよ・だね・じゃん・でしょ・かな・の？ など）が残っていないか（F は 〜だ／〜か／〜な／〜だろう／命令形）
   ・一人称が「私」以外（俺・僕・あたし）になっていないか、二人称が「あなた」以外（お前・きみ・あんた）になっていないか
   体言止め・あいさつ・相づち・感嘆（！のみ）・言いさし（……）は P の判定から外す。--all で全部の行を出す */
'use strict';
const fs = require('fs'), path = require('path');
const dir = path.resolve(process.argv[2] || '../../hakoniwa-full'), ALL = process.argv.includes('--all');
const P_END = /(?:です|ます|ません|ました|でしょう|ください|ましょう|でした|ございます|ございました|なさい|ませ|いたします|いただきます|いただけますか|ませんか|でしょうか|ましたか|ますか|ですか|ませんでした|ございません)(?:か|ね|よ|わ|から|けど|けれど|し|ので|のに|って|っけ|よね|かね)?$/;
const K_BAD = /(?:です|ます|ません|ました|ございます|なさい|ください)(?:か|ね|よ|から|けど)?$/;
const F_BAD = /(?:だよ|だね|だよね|じゃん|でしょ|かな|かしら|(?<!も)の|のよ|わよ|(?<![一-鿿])わ|もん|てね|てよ|ないで|ないでよ|ないでね|だってば|ってば|かも|なの|んだよね|だし)$/;
const P_HAS = /(?:です|ます|ません|ました|でしょう|ください|ましょう|でした|ございます|なさい|いたし|いただ)/;
const F_BAD_Q = /(?:の|かな|でしょ|よね|かも|じゃん)$/;
const NEUT = /(?:[一-鿿々ァ-ヶーA-Za-z0-9０-９]|さん|様|ちゃん|くん|を|に|へ|は|も|と|で|ので|のに|なら|たら|れば|ても|でも|から|けど|けれど|し|って|とか|など|だけ|まで|ほど|くらい|ぐらい|ずつ|こそ|……|…|ー|〜|っ|、|ありがとう|おはよう|おやすみ|ごめん|すみません|よろしく|おかえり|ただいま|いただきます|ごちそうさま|さようなら|はい|いいえ|うん|ええ|ああ|おう|へえ|ふうん|さあ|まあ|ほら|ねえ|おい|あの|えっ|あれ|なに|そう|うそ|もう|よし|はいはい|こっち|そっち|どっち|あっち|たぶん|べつに|別に|たまたま|まだ|もっと|あと|いつか|いつでも|どうぞ|お先に|おつかれ|お疲れ|乾杯|次|せーの|わかる|ダメ|だめ|無理|天才|親切|賛成|時効|毒見|当たり前|それだけ|こっちも|こちらも)$/;
const FP_BAD = /(?:^|[^ぁ-ゖァ-ヶ一-鿿])(俺|僕|ぼく|オレ|ボク|あたし|わたくし|拙者|わし|わらわ|うち|ウチ)(?=[はがもをにのとで、。！？」]|$)/;
const YOU_BAD = /(?:^|[^ぁ-ゖァ-ヶ一-鿿])(お前|おまえ|あんた|てめえ|貴様|おぬし|きみ|君)(?=[はがもをにのとで、。！？」]|$)/;
function marks(s) { return (s.match(/\{[^}]+\}|〈〉/g) || []).sort().join(' '); }
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
    const [K, F, P] = v;
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
    [K, F, P].forEach((x, i) => { const m = x.match(FP_BAD); if (m && !/^(?:うち|ウチ)$/.test(m[1])) probs.push('KFP'[i] + ' に一人称「' + m[1] + '」（私で書く）'); });   /* 「うち、ここから近い」の うち は家 */
    [K, F, P].forEach((x, i) => { const m = x.match(YOU_BAD); if (m) probs.push('KFP'[i] + ' に二人称「' + m[1] + '」（あなたで書く）'); });
    if (probs.length) { bad++; out.push(f + '\t' + body + '\n   ' + probs.join('／')); }
    else if (ALL) out.push(f + '\t' + body);
  });
}
console.log('ファイル ' + files + '　3本の台詞 ' + triples + '　問題 ' + bad);
out.forEach(l => console.log(l));
process.exit(bad ? 1 : 0);
