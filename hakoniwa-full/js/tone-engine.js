/* 箱庭シミュレーター: 口調の辞書エンジン（HK.Tone）― 試作
   ■ 考え方（docs/reports/2026-10-25/tone-engine-design.md）
     台詞を3本のベースで書く：「K くだけた常体｜F 硬い常体｜P 敬語」（「」の中を全角の縦棒で区切る。「＝」は左と同じ、空は左と同じ）。
     話し手の口調が「どのベースから作るか」を決め、そのベースに口調の辞書（文末・語彙・規則・効果）を当てる。
     1本しか書かれていない台詞は、これまでどおりの言い換え（voice.js・voice-tone.js ほか）に流す。
   ■ 辞書の形式（組み込みは tone-dict-builtin.js、利用者は高度設定「口調の辞書」。どちらも同じ文字列の形式）
     [口調]                 ← ここから一つの口調。[口調 kohai] と書けば組み込みの口調 kohai の辞書になる（利用者が書けば上書き）
     名前=ですぞ侍          ← 選択欄に出る名前（利用者の口調の鍵は u:名前）
     ベース=P               ← K／F／P
     一人称=拙者            ← 男|女|その他 の順で3つ書いてもよい
     二人称=貴殿
     態度=stern             ← 文面の表（9つの態度）をどれから借りるか（省略：K→穏やか、F→強気、P→敬語）
     [文末]                 ← 文の終わり（。！？…の手前）にだけ効く。長いものから。「／」で候補、くじで一つ
     です=ですぞ／ですな
     [語彙]                 ← 文のどこでも。単語単位
     ありがとうございます=かたじけない
     [規則]                 ← 型つきの規則（組み込みの数個だけ）
     否定=ぬ                ← 〜ない → 〜ぬ／〜へん／〜ん
     進行=ておる            ← 〜ている／〜てる → 〜ておる／〜とる
     断定=や                ← 〜だ → 〜や（だよ・だね・だろ・だった・だから・だけど も）
     助詞落とし=0.3         ← が・は・を を落とす割合
     存在=おる              ← いる／いた／いない／います → おる／おった／おらぬ（が・は・も・に などの直後だけ。〜ている は進行の規則）
     短い文はため口=6       ← 敬語のベースで、助詞のない短い一言（大丈夫です→大丈夫、ありがとうございます→ありがとう）と短い問い（飲みますか？→飲む？）だけをため口にする（敬語まじり）
     縮約=はい              ← 分からない→分かんない、ちょうだい→ちょーだい など
     強調語=マジ／めっちゃ  ← 形容詞の前に差し込む（台詞に一度まで。文に勢い（！や強い語）があるときだけ）
     強調語の割合=0.4       ← 差し込む割合（既定 0.5）
     前置き=フッ……。／やれやれ ← 台詞の頭に付ける一言（ため息・感嘆）。候補が「。」「……」「、」などで終わればそのままつなぎ、終わらなければ「。」を補う
     前置きの割合=0.3       ← 前置きを付ける割合（既定 0.3）。「……」や前置きの語で始まる台詞・短い一言（6文字以下）・喘ぎには付けない
     驚き=なんと！／おお……  ← 文頭の驚きの言葉（え・えっ・えー・うそ・マジ・なんで！・何、・は？・わっ など）を置き換える。空の候補は消す
     笑い=フハハ／ふふふ     ← 短い笑い声（はは・あはは・ふふ・くく・へへ・にしし など。語の中には当てない）を置き換える。空の候補は消す
     言い切り=0.3           ← 文末の終助詞（よ・ね・よね・さ・ぞ・だな）を、この割合で落として言い切りにする（問いには当てない）
     動揺=く……ッ！／バカな……！ ← 「！」で終わる強い感情の文（うそ・まさか なども）の頭に付ける一言。台詞に一度まで
     動揺の割合=0.5         ← 動揺を付ける割合（既定 0.5）
     [効果]                 ← 組み込みの小さな変形
     感嘆符を落とす=はい ／ 伸ばす=はい ／ 言い切りに！=はい ／ 短くする=はい ／ 言いよどみ=はい ／ 前に……=はい ／ 間を置く=はい
   ■ 使い方
     HK.Tone.pick(台詞, 話し手, 敬語の相手か) → { q: 選んだベース, dict: 辞書か null }（voice.js の processText から）
     HK.Tone.apply(台詞, 辞書, 話し手) → 言い換えた台詞。同じ台詞は同じ結果（くじは台詞の文字から）
   一人称は「私」、二人称は「あなた」で書く約束（置換は voice.js の既存の層） */
(function () {
  'use strict';
  var HK = window.HK;
  if (!HK) return;
  var T = HK.Tone = { dicts: {}, user: {}, userText: '', ending: {} };
  function hash(s) { var x = 7; for (var i = 0; i < s.length; i++) x = (x * 31 + s.charCodeAt(i)) | 0; return Math.abs(x); }
  function esc(s) { return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }
  function choose(list, seed) { return list.length === 1 ? list[0] : list[hash(seed) % list.length]; }
  function yes(v) { return /^(はい|on|1|true|yes|○|する)$/i.test(String(v || '').trim()); }

  /* ---------- 組み込みの口調がどのベースから作られるか ---------- */
  T.BASE = {
    gentle: 'K', gentle_n: 'K', ane: 'K', usan: 'K', free: 'K', gyaru: 'K', chara: 'K', shy: 'K', tame: 'K', kansai: 'K', mukuchi: 'K', boku_n: 'K', devoted_p: 'K', darui_lite: 'K', darui: 'K', tsun: 'K', tsun_n: 'K', honwaka: 'K', darui_talk: 'K', tsun_soft: 'K', mukuchi_ne: 'K',
    proud: 'F', aniki: 'F', yankee: 'F', stern: 'F', cool: 'F', calm: 'F', gentleman: 'F', sondai: 'F', noja: 'F', god: 'F', mystic: 'F', hero: 'F', cool_soft: 'F', ronkyaku: 'F', flat_plain: 'F',
    polite: 'P', devoted: 'P', kohai: 'P', ojou: 'P', genki: 'P', keigo_sarc: 'P', keigo_bossy: 'P', keigo_flat: 'P', chara_down: 'P', mixed: 'P', otaku: 'P', keigo_twist: 'P'
  };
  var BASE_PERSONA = { K: 'gentle', F: 'proud', P: 'polite' };
  T.baseOf = function (tone, kg) {
    if (kg) return 'P';
    var d = T.dictOf(tone);
    if (d && d.base) return d.base;
    if (T.BASE[tone]) return T.BASE[tone];
    var g = HK.toneOpt ? HK.toneOpt(tone, 'group') : null;
    return g === 'polite' ? 'P' : g === 'soft' ? 'K' : 'F';
  };
  T.dictOf = function (tone) { return (tone && (T.user[tone] || T.ending[tone] || T.dicts[tone])) || null; };
  /* 「K｜F｜P」を分ける。＝・空は左と同じ。1本なら null */
  T.split = function (q) {
    if (!q || q.indexOf('｜') < 0) return null;
    var p = q.split('｜');
    if (p.length < 2) return null;
    var out = [];
    for (var i = 0; i < 3; i++) { var v = i < p.length ? p[i] : ''; v = v.replace(/^\s+|\s+$/g, ''); out.push(!v || v === '＝' || v === '=' ? (out[i - 1] || '') : v); }
    return { K: out[0], F: out[1], P: out[2] };
  };
  T.pick = function (q, who, kg) {
    var s = T.split(q);
    if (!s) return { q: q, dict: null };
    var tone = who && (HK.toneOf ? HK.toneOf(who) : who.tone), b = T.baseOf(tone, kg), q1 = s[b] || s.K;
    /* alts：選ばなかったベース（既存の書き下ろし辞書は元の文で引いてあるので、3本のどれかに一致すれば使う） */
    var alts = [s.K, s.F, s.P].filter(function (x, i, a) { return x && x !== q1 && a.indexOf(x) === i; });
    return { q: q1, dict: kg ? null : T.dictOf(tone), base: b, alts: alts };
  };

  /* ---------- 文を切る（文末の処理のため）。tail は …‥っ〜ー♡ など、文末記号の手前の飾り ---------- */
  var END = /([。！？!?]+)/, POLITE_CUT = /(?:です|ます|ません|ました|でしょう|ください|ましょう|でした)(?:から|けど|が|し|ので|のに|よ|ね|よね)?$/;
  function segs(q) {
    var parts = q.split(END), out = [];
    for (var i = 0; i < parts.length; i += 2) {
      var body = parts[i], punct = parts[i + 1] || '';
      /* 「好きです、〈〉のこと」「動きますから、」のような敬語の言いさしは、読点でも切って文末の辞書を当てる */
      var sub = body.split('、');
      if (sub.length > 1) {
        var acc = '';
        for (var k = 0; k < sub.length - 1; k++) {
          acc += sub[k];
          if (POLITE_CUT.test(acc)) { out.push({ body: acc, punct: '、' }); acc = ''; } else acc += '、';
        }
        body = acc + sub[sub.length - 1];
      }
      if (body || punct) out.push({ body: body, punct: punct });
    }
    return out;
  }
  function join(ss) { return ss.map(function (s) { return s.body + s.punct; }).join(''); }
  var TAIL = /[っッ…‥〜～ー♡♪、\s　]*$/, MARK = '\u2061';
  function splitTail(body) { var t = (body.match(TAIL) || [''])[0]; return [body.slice(0, body.length - t.length), t]; }

  /* ---------- 規則 ---------- */
  /* 「ない」の前がこれなら、動詞の否定ではない（形容詞・名詞＋ない）ので触らない */
  var ADJ_NAI = /(少|危|仕方|しょうが|情け|つまら|くだら|もったい|だらし|切|みっとも|あっけ|頼り|物足り|はした|ぎこち|さりげ|間違い|違い|申し訳|面目|容赦|汚|きた|せつ|あぶ|すく|かたじけ|やる気|元気|関係|意味|興味|問題|時間|余裕|自信|用|金|気|暇|仕事|しかた|心配|覚え|記憶|文句|縫い目|隙|勝ち目|しょう|たま|他|ほか|な|こと)$/;
  var ICHI = /(起き|生き|落ち|信じ|感じ|閉じ|浴び|借り|降り|過ぎ|すぎ|足り|伸び|満ち|飽き|尽き|老い|報い|でき|着|似|煮|居|い|見|寝|出|来)$/;
  /* 丁寧形の語幹（〜ます の前）から、辞書形・過去・否定・意向を作る（{る} {た} {ない} {なかった} {よう} の印。かんたんな活用だけ） */
  var I2U = { 'き': 'く', 'ぎ': 'ぐ', 'し': 'す', 'ち': 'つ', 'に': 'ぬ', 'び': 'ぶ', 'み': 'む', 'り': 'る', 'い': 'う' };
  var I2A = { 'き': 'か', 'ぎ': 'が', 'し': 'さ', 'ち': 'た', 'に': 'な', 'び': 'ば', 'み': 'ま', 'り': 'ら', 'い': 'わ' };
  var I2O = { 'き': 'こ', 'ぎ': 'ご', 'し': 'そ', 'ち': 'と', 'に': 'の', 'び': 'ぼ', 'み': 'も', 'り': 'ろ', 'い': 'お' };
  var I2TA = { 'き': 'いた', 'ぎ': 'いだ', 'し': 'した', 'ち': 'った', 'り': 'った', 'い': 'った', 'に': 'んだ', 'び': 'んだ', 'み': 'んだ' };
  function conj(stem, form) {
    var last = stem.slice(-1), pre = stem.slice(0, -1);
    /* する（〜します・勉強します・何とかします）：「し」の前が五段の「す」で終わる動詞の漢字一字（話し・出し・返し）でなければ する */
    var suru = last === 'し' && !/[話出返消押渡隠回落戻倒起鳴指示伸干放正済許殺探離貸刺移映残直試流通増減足察差指刺外越殴壊卸干貸]$/.test(pre) && !/(過ご|なく|無く|増や|減ら|こぼ|ずら|ころ|まわ|かく|こわ|なお|かえ|はな|わた|おと|さが|よこ|ほど|ゆる|たお|もど|お|だ|け|さ|ど)$/.test(pre);
    /* 一段の「い」「み」は、いる・みる（〜ている・〜てみる）のときだけ。それ以外の い・み は五段（思い・飲み） */
    /* 語幹は前の語とつながって切り出される（「そばにい」「問題あり」）ので、助詞・副詞の直後の い・み も いる・みる（そばにいます→そばにいる） */
    var ichiIM = (last === 'い' || last === 'み') && (!pre || /[てでにがはもとをへやだう、\s　…‥]$/.test(pre.replace(new RegExp(MARK, 'g'), '、')));
    if (/^(?:来|き)$/.test(stem)) return { 'る': '来る', 'た': '来た', 'ない': '来ない', 'なかった': '来なかった', 'よう': '来よう' }[form];
    if (suru) return pre + { 'る': 'する', 'た': 'した', 'ない': 'しない', 'なかった': 'しなかった', 'よう': 'しよう' }[form];
    /* ある（問題ありません→問題ない。「あらない」にしない） */
    if (/あり$/.test(stem)) return stem.slice(0, -2) + { 'る': 'ある', 'た': 'あった', 'ない': 'ない', 'なかった': 'なかった', 'よう': 'あろう' }[form];
    var ichi = ichiIM || (ICHI.test(stem) && !((last === 'い' || last === 'み') && !ichiIM)) || /[えけげせぜてでねべめれ]$/.test(last) || /^[一-鿿々]$/.test(stem);
    if (ichi) return stem + { 'る': 'る', 'た': 'た', 'ない': 'ない', 'なかった': 'なかった', 'よう': 'よう' }[form];
    if (I2U[last]) return pre + ({ 'る': I2U[last], 'た': I2TA[last], 'ない': I2A[last] + 'ない', 'なかった': I2A[last] + 'なかった', 'よう': I2O[last] + 'う' }[form]);
    return stem + { 'る': 'る', 'た': 'た', 'ない': 'ない', 'なかった': 'なかった', 'よう': 'よう' }[form];
  }
  var IRR_NEG = { 'ぬ': { 'しない': 'せぬ', 'こない': 'こぬ', '来ない': '来ぬ', 'いない': 'おらぬ', 'ない': 'ない' }, 'へん': { 'しない': 'せえへん', 'こない': 'けえへん', '来ない': '来えへん', 'いない': 'おらへん', 'ない': 'ない' }, 'ん': { 'しない': 'せん', 'こない': 'こん', '来ない': '来ん', 'いない': 'おらん', 'ない': 'ない' } };
  function ruleNeg(body, to) {
    var irr = IRR_NEG[to] || {};
    return body.replace(/([一-鿿々ぁ-ゖァ-ヶ]{1,6}?)(しない|こない|来ない|いない|ない)(?=(?:よ|ね|の|か|ぞ|ぜ|さ|わ|し|から|けど|けれど|でしょ|です|んだ|のだ|って)?[っッ…‥〜～ー♡、\s　]*$)/, function (m, pre, nai) {
      if (nai === 'ない') {
        if (!pre || /く$/.test(pre) || ADJ_NAI.test(pre) || /(じゃ|では|が|は|も|しか|なんか|なんて|に|で|て)$/.test(pre)) return m;   /* 形容詞・「〜じゃない」「〜がない」は触らない */
        /* 動詞の否定らしい形だけ：ア段（行か・分から）、エ段（食べ・見え）、一段の語幹、漢字一字（見・出・来） */
        if (!/[かがさたなばまらわえけげせぜてでねべめれ一-鿿々]$/.test(pre) && !ICHI.test(pre)) return m;
        return pre + to;
      }
      return pre + (irr[nai] || nai);
    });
  }
  var NO_TERU = '捨建育当慌果企隔宛充裁満絶断討撃打企待持立勝';
  function ruleProg(q, to) {
    var te = to, de = /^て/.test(to) ? to.replace(/^て/, 'で') : /^と/.test(to) ? to.replace(/^と/, 'ど') : to;
    return q.replace(/(.)(ている|てる|でいる|でる)(?![ぁ-ゖ]?[ばれ])/g, function (m, pre, v, at) {
      if (NO_TERU.indexOf(pre) >= 0 && /^て/.test(v)) return m;
      /* 「兄弟っている」「推しっている」「〇〇ってる」の っ は引用（名詞＋って）：二字の漢字・漢字＋し・カタカナの直後の っ なら触らない */
      if (pre === 'っ' && /(?:[一-鿿々]{2}|[一-鿿々]し|[ァ-ヶー]|[A-Za-zＡ-Ｚａ-ｚ0-9０-９]|」)$/.test(q.slice(0, at))) return m;
      if (/^で/.test(v) && !/[んい]$/.test(pre)) return m;   /* 「〜んでいる」「〜いでいる」以外の「でる」は触らない */
      return pre + (/^で/.test(v) ? de : te);
    });
  }
  /* 存在の「いる」（〜ている は進行の規則）：が・は・も・に・と・か・で・読点・文頭の直後だけ */
  function ruleExist(q, to, neg) {
    var nai = neg === 'ぬ' ? 'おらぬ' : neg === 'へん' ? 'おらへん' : 'おらん';
    var M2 = { 'いる': to, 'いた': to.replace(/る$/, 'った'), 'いない': nai, 'いません': nai, 'います': to.replace(/る$/, 'ります'), 'いました': to.replace(/る$/, 'りました'), 'いれば': to.replace(/る$/, 'れば') };
    return q.replace(/(^|[がはもにとかで、\s　])(いる|いた|いない|いません|います|いました|いれば)(?=[^ぁ-ゖ]|[よねのかなぞぜさわしっ…‥〜～ー♡、。！？!?]|$)/g, function (m, p, v) { return p + (M2[v] || v); });
  }
  function ruleCopula(body, to) {
    /* 文中の だから・だけど・だって・だった */
    body = body.replace(/だ(から|けど|けれど|って|った|ろう|ろ)(?=[、\s　]|$|[っ…‥〜～ー♡])/g, to + '$1').replace(/だ(から|けど|けれど)/g, to + '$1');
    /* 文末の だ・だよ・だね・だな・だぞ */
    return body.replace(/(?:^|[^ん])だ(よ|ね|な|ぞ|ぜ|わ|もん|っけ)?(?=[っッ…‥〜～ー♡、\s　]*$)/, function (m, p) { return m.slice(0, m.length - 1 - (p || '').length) + to + (p || ''); }).replace(/んだ(よ|ね|な|ぞ)?(?=[っッ…‥〜～ー♡、\s　]*$)/, 'ん' + to + '$1');
  }
  function ruleDrop(body, rate, seed) {
    var k = 0;
    return body.replace(/([一-鿿々ァ-ヶー]{1,6})(が|は|を)(?=[一-鿿々ぁ-ゖァ-ヶ])/g, function (m, n, p) { k++; return (hash(seed + '#drop' + k) % 100) < rate * 100 ? n : m; });
  }
  var CONTRACT = [[/([ぁ-ゖ一-鿿々])(?<![いしか])らない/g, '$1んない'], [/ている/g, 'てる'], [/ちょうだい/g, 'ちょーだい'], [/どれだけ/g, 'どんだけ'], [/こんなの/g, 'こんなん'], [/やっぱり/g, 'やっぱ'], [/大丈夫/g, 'だいじょぶ'], [/するの(?=[？?]|$)/g, 'すんの'], [/てるの(?=[？?]|$)/g, 'てんの'], [/なければ/g, 'なきゃ'], [/てしまう/g, 'ちゃう'], [/でしまう/g, 'じゃう'], [/てしまった/g, 'ちゃった'], [/でしまった/g, 'じゃった'], [/ところ(?![一-鿿])/g, 'とこ'], [/という/g, 'って'], [/しなければ/g, 'しなきゃ'], [/わからない/g, 'わかんない'], [/分からない/g, '分かんない'], [/つまらない/g, 'つまんない']];
  function ruleContract(q) { CONTRACT.forEach(function (c) { q = q.replace(c[0], c[1]); }); return q; }
  var EMPH_AT = /(?<![ぁ-ゖァ-ヶ一-鿿])(すごい|すご|かわいい|可愛い|いい|やばい|ヤバい|うまい|楽しい|嬉しい|うれしい|きれい|面白い|おもしろい|おいしい|つらい|こわい|怖い|痛い|眠い|疲れた|好き|嫌い|無理|ムリ|だめ|ダメ|最高|最悪|きつい|寒い|暑い|重い|遠い|近い|早い|遅い|高い|安い|大変|うざい|ずるい|わかる|分かる|助かる|困る)/;
  var EMPH_HOT = /[！!]|すご|ヤバ|やば|最高|最悪|無理|ムリ|かわいい|可愛い|うれし|嬉し|楽し|たのし|ウケる|面白|おもしろ|びっくり|やった|うそ|ほんと|本当/;
  function ruleEmph(q, words, seed, rate) {
    /* 文に勢い（！や強い語）がないときは差し込まない。割合（既定 0.5）は辞書の「強調語の割合」で変えられる */
    if (!EMPH_HOT.test(q) || hash(seed + '#emph') % 100 >= Math.round((rate == null ? 0.5 : rate) * 100)) return q;
    /* もう強調語が付いている語（「ガチ無理」「マジかわいい」）には重ねない */
    return q.replace(EMPH_AT, function (m, g, at, all) {
      var pv = all.slice(Math.max(0, at - 4), at).replace(new RegExp(MARK, 'g'), '');
      if (words.concat(['マジ', 'ガチ', 'めっちゃ', 'すごく', 'とても', 'チョー', '超', 'ほんと', '本当に']).some(function (w) { return pv.slice(-w.length) === w; })) return m;
      return choose(words, seed + '#ew') + m;
    });
  }

  /* ---------- 語尾の設定の規則（前置き・驚き・笑い・言い切り・動揺）。どれも辞書に書いたときだけ効く ---------- */
  /* 喘ぎ（前置き・動揺を付けない） */
  var MOAN = /♡|[ぁぃぅぇぉ][っッ…‥、！!〜ー]|[…‥]っ|(?:^|[、…‥\s　])[あんひはふ][ぁあんっッ]*[っッ][、…‥]/;
  /* 候補の後ろの記号（候補が記号で終わるかどうか） */
  var CAND_END = /[。、…‥！!？?]$/;
  /* 文頭の驚きの言葉：[語, 後ろに要る記号（正規表現）]。後ろの記号まで含めて置き換える */
  var SURP = /(^|[。！？!?\s　」\u2061])(ええっ|えっ|えー|ええー|え|うそ|嘘|マジで|まじで|マジ|まじ|なんで|何|は|わっ|わあ|わぁ)([、…‥！!？?。ー〜っ]*)/g;
  function surpOk(w, p, rest) {
    if (!p) return rest === '';   /* 記号がないなら、台詞の終わりの一言だけ（「えらい」「何か」「は」に当てない） */
    if (w === 'は') return /^[？?]/.test(p);
    if (w === 'なんで') return /^[！!？?…‥]/.test(p) && (rest === '' || /^[！!？?…‥]/.test(p));
    if (w === 'ええー' || w === 'えー') return true;
    return !/^[ー〜]/.test(p) || /^[ー〜]+[、…‥！!？?]/.test(p);
  }
  /* 候補の語を印で包む（文末の辞書が当たらないように）。候補の末尾の記号は外に出す */
  function wrapCand(c) { var m = c.match(/^(.*?)([。、…‥！!？?]*)$/); return m[1] ? MARK + m[1] + MARK + m[2] : m[2]; }
  function ruleSurprise(q, list, seed) {
    var k = 0;
    return q.replace(SURP, function (m, pre, w, p, at, all) {
      var rest = all.slice(at + m.length);
      if (!surpOk(w, p, rest)) return m;
      var c = choose(list, seed + '#sp' + (++k));
      /* 空の候補：驚きの言葉ごと消す（後ろの記号も） */
      if (!c) return pre;
      return pre + wrapCand(c) + (CAND_END.test(c) ? '' : p);
    });
  }
  var LAUGH = /(^|[^ぁ-ゖ一-鿿々ァ-ヶー])(あはは+|うふふ+|えへへ+|はは+|ふふ+|くく+|へへ+|にしし+|フハハ+|ハハ+|フフ+|クク+)(っ?)(?![ぁ-ゖ])([、…‥！!。]*)/g;
  function ruleLaugh(q, list, seed) {
    var k = 0;
    return q.replace(LAUGH, function (m, pre, w, tu, p) {
      var c = choose(list, seed + '#lf' + (++k));
      if (!c) return pre;   /* 空の候補：笑い声ごと消す（後ろの記号も） */
      return pre + wrapCand(c) + (CAND_END.test(c) ? '' : p);
    });
  }
  /* 言い切り：文末の終助詞を落とす（問い・語彙で置き換えた語の後ろには当てない） */
  function ruleFlat(body, punct, rate, seed) {
    if (/^[？?]/.test(punct) || isQuestion(body)) return body;
    var st = splitTail(body), core = st[0];
    if (core.slice(-1) === MARK || hash(seed + '#fl') % 100 >= Math.round(rate * 100)) return body;
    var m = core.match(/(?:だな|よね|よ|ね|さ|ぞ|な)$/);
    if (!m) return body;
    var head = core.slice(0, core.length - m[0].length), p = m[0];
    if (!head || head.replace(new RegExp(MARK, 'g'), '').length < 2) return body;
    if (p === 'だな') return head + 'だ' + st[1].replace(/^[〜ー～]+/, '');
    /* 「な」は、〜ている・〜た・形容詞の後ろだけ（「するな」「触るな」の禁止は残す） */
    if (p === 'な' && !/(?:ている|でいる|ていた|でいた|[^ぁ-ゖ]い|しい|かった|ない)$/.test(head.replace(new RegExp(MARK, 'g'), ''))) return body;
    if (p === 'ね' && /[かわ]$/.test(head)) return body;          /* 「ですかね」「〜わね」はそのまま */
    if (p === 'よ' && /し$/.test(head) && !/だし$/.test(head)) return body;   /* 「しよ」「勉強しよ」の誘い */
    if (p === 'さ' && /の$/.test(head)) return body;              /* 「なのさ」 */
    return head + st[1].replace(/^[〜ー～]+/, '');
  }
  /* 新しい規則（前置き・驚き・笑い・言い切り・動揺）を一つでも使う辞書か。使う辞書だけ、次の細かい整え方をする（既存の辞書の出力は変えない）：
     ・感嘆符を落としたあとの台詞の終わりの「。」を外す　・「！」で終わる文には、「。」「、」を中に含む文末の候補（「だよ。知らないけど」）を当てない */
  function newRules(r) { return r.flat != null || !!(r.lead || r.shaken || r.surprise || r.laugh); }
  /* 前置き・動揺の候補をつなぐ：候補が「。」「……」「、」「！」などで終わればそのまま、終わらなければ「。」を補う */
  function prefix(c, s) { return CAND_END.test(c) ? c + (/[！!？?]$/.test(c) && !/^[\s　]/.test(s) ? '　' : '') + s.replace(/^[\s　]+/, '') : c + '。' + s; }
  /* 台詞が既に前置き・間投詞・言いよどみで始まっているか */
  var LEAD_DONE = /^(?:[…‥]|[ぁ-ゖー〜]{1,4}[、…‥！!？?]|[ァ-ヶー]{1,3}ッ?[…‥！!]|(?:まあ|やれやれ|ふむ|ほう|はあ|ああ|おや|さて|ねえ|ほら|えっと|ええと|あの|うん|いや|そう|フッ|ふっ)(?![ぁ-ゖ]))/;
  var SHAKE_POS = /ありがと|嬉し|うれし|楽し|たのし|やった|最高|好き|よろしく|おめでと|がんば|頑張|行こう|しよう|おいし|美味し|かわい|可愛|すご|見事|素晴|いいね|いいぞ|任せ|おはよう|おやすみ|さすが|助か|礼を|感謝|ただいま|おかえり/;
  var SHAKE_HOT = /うそ|嘘|まさか|ありえな|あり得な|信じられな|びっくり|最悪/;
  function ruleShaken(q, list, rate, seed) {
    if (hash(seed + '#sh') % 100 >= Math.round(rate * 100)) return null;
    var parts = q.match(/[^。！？!?]+[。！？!?]*|[。！？!?]+/g) || [q];
    for (var i = 0; i < parts.length; i++) {
      var s = parts[i], b = s.replace(/[。！？!?\s　]+$/, '').replace(/^[\s　]+/, '');
      if (b.replace(/[…‥、っッー〜]/g, '').length < 2 || LEAD_DONE.test(s.replace(/^[\s　]+/, '')) || /^[ぁ-ゖァ-ヶ][ゃゅょ]?、/.test(b) || SHAKE_POS.test(b)) continue;
      if (/[！!][？?]?$/.test(s.replace(/[\s　]+$/, '')) || SHAKE_HOT.test(b)) {
        parts[i] = prefix(choose(list, seed + '#shc'), s);
        return parts.join('');
      }
    }
    return null;
  }

  /* ---------- 効果 ---------- */
  function fxBang(q) { return q.replace(/！+/g, '。').replace(/。(?=」|$)/g, '。'); }
  function fxStretch(ss, seed) {
    return ss.map(function (s, i) {
      var st = splitTail(s.body);
      if (/[よねなで]$/.test(st[0]) && !/[〜ー]/.test(st[1]) && hash(seed + '#st' + i) % 100 < 50) return { body: st[0] + '〜' + st[1].replace(/^、/, ''), punct: s.punct };
      return s;
    });
  }
  function fxBangOn(ss, seed) {
    return ss.map(function (s, i) {
      if (s.punct || s.body.length > 8 || /[…‥、〜ー]$/.test(s.body) || isQuestion(s.body)) return s;
      if (/[だよぜぞ]$/.test(s.body) && hash(seed + '#bg' + i) % 100 < 50) return { body: s.body, punct: '！' };
      return s;
    });
  }
  function fxShort(ss) { if (ss.length <= 1) return ss; var f = ss[0]; return [{ body: (/^[…‥]/.test(f.body) ? '' : '……') + f.body, punct: f.punct === '。' ? '' : f.punct }]; }
  /* 言いよどみ：文頭のかなを一つ重ねる（「大丈夫」→ 漢字始まりは重ねられないので、最初の文の終わりを「……」で濁す）。
     元の文がもう言いよどんでいる・間投詞で始まる（「だ、大丈夫」「あ、」「え、」）・「……」で始まるときは何もしない */
  function fxStammer(q, seed) {
    if (hash(seed + '#stm') % 100 >= 30 || /^[…‥]/.test(q) || /^[ぁ-ゖァ-ヶ][ゃゅょャュョ]?[、…‥]/.test(q)) return q;
    var m = q.match(/^([ぁ-ゖァ-ヶ][ゃゅょぁぃぅぇぉャュョァィゥェォ]?)/);
    if (m && !/^[ぁぃぅぇぉっゃゅょゎんゝゞァィゥェォッャュョヮンヽヾ]/.test(q)) return m[1] + '、' + q;
    /* 漢字・記号始まり：最初の言い切り（。・文末）を「……」に。問い・！・……で終わる文はそのまま */
    return q.replace(/^([^。！？!?…‥]*?[^。！？!?…‥〜ー～っッ♡、\s　])(。|$)/, function (x, b, p) { return b + '……'; });
  }

  /* 文末の項目を当ててはいけない組み合わせ（当てずに次の項目を見る）
     ・終助詞が重なる：「よ」＋「よね」→「よよね」、「よ」＋「わね」、「ね」＋「ね」（「よね」「わよ」「わね」「のよ」「のね」はよい）
     ・問い（？で終わる文）に、言い切りの語尾（よ・わ・ぞ・ぜ・さ・だ・！）を付ける：「いいさ？」「行くわ？」「平気だよ？」「思いまーす！？」
       （「ます？=ますの？」のように ？ 付きで書いた項目は別） */
  var FINAL_P = /[よねわぞぜさ]$/, PAIR_OK = /^(?:よね|わよ|わね|ぞよ|さね)$/;
  /* ？のない問い（「何をした」「いつからだ」「どうしたいんだ！」）：疑問の語があり、その後ろが「〜ても」「〜たら」のような条件・譲歩でないもの */
  var QW = /(何|なに|誰|(?<![よなた])だれ|どこ|(?<![こそあど])いつ|なぜ|どうして|どう|どれ|どちら|どっち|いくつ|いくら(?!い)|どんな|(?<![ほけ])どの)(?!でも|も|か|ぞ|とか|となく|にも|にか|せ|より|度も|回も|人も|だか|とも|しろ|ら|だって|なり)/g;
  function isQuestion(head) {
    var m, rest = null;
    QW.lastIndex = 0;
    while ((m = QW.exec(head))) rest = head.slice(m.index + m[0].length);
    /* 「どうするか決めて」「どちらが本気か答えて」のような、文の中の問いは除く */
    return rest != null && !/(?:ても|でも|たら(?!いい|よい)|れば(?!いい|よい)|けど|のに|ので|ながら|とか|か(?=[一-鿿々ァ-ヶをがはもと、]))/.test(rest);
  }
  function badEnd(head, to, punct, qm, from) {
    if (to === from) return false;   /* 元のまま（「だ=だ／だよ」の「だ」）はいつでもよい */
    var t0 = to.replace(/^[\u2061]+/, '');
    if (FINAL_P.test(head) && /^[よねわぞぜさ]/.test(t0) && !PAIR_OK.test(head.slice(-1) + t0.charAt(0))) return true;
    /* 継ぎ目で同じかなが繰り返す：「ではない」＋「ではないか」、「くれたまえ」＋「たまえ」 */
    for (var L = 2; L <= t0.length; L++) { var pf = t0.slice(0, L); if (/^[ぁ-ゖ]+$/.test(pf) && head.slice(-L) === pf) return true; }
    /* 問いでも「〜のだ」「〜んだ」「〜の（よ・さ）」（何をしているのだ？・いつからなんだ？・何なのよ）はよい */
    if (qm || /[？?]$/.test(to) || /[のん]だ$/.test(to)) return false;
    /* 問いに念押し・言い切りの語尾を足さない（元の文にもともとあった語尾の言い換えはよい：「ね？=ね〜？」） */
    var tq = (head + t0).replace(/[〜ー～]+$/, ''), oq = (head + (from || '')).replace(/[〜ー～]+$/, '');
    if (/^[？?]/.test(punct) && /(?:[よわぞぜさだね！!]|である)$/.test(tq) && tq.slice(-1) !== oq.slice(-1)) return true;
    if (isQuestion(head + (from || '')) && !/の[よさ]$/.test(to) && /(?:[よわぞぜさだな！!]|である)[〜ー～]*$/.test(to)) return true;
    return false;
  }
  /* 文末の表を一つの文に当てる（最初に合った項目だけ） */
  function applyEnds(body, punct, ends, seed, i, strict) {
    if (!ends || !ends.length) return { body: body, punct: punct };
    var st = splitTail(body), core = st[0];
    if (core.slice(-1) === MARK) return { body: body, punct: punct };
    for (var j = 0; j < ends.length; j++) {
      var e = ends[j], from = e[0], qm = /[？?]$/.test(from);
      /* 「ません？=ませんこと？」のように ？ 付きの項目は、文末記号ごと見る */
      if (qm) { if (!/^[？?]/.test(punct)) continue; from = from.slice(0, -1); }
      var head = core.slice(0, core.length - from.length);
      if (core.length >= from.length && core.slice(core.length - from.length) === from && (!e[2] || e[2].test(head.replace(new RegExp(MARK, 'g'), '')))) {
        /* 当ててはいけない候補は外して選ぶ。全部だめなら、この文は元のまま（短い項目に落ちると、もっと崩れるので） */
        var h0 = head.replace(new RegExp(MARK, 'g'), ''), ask = strict && !qm && (/^[？?]/.test(punct) || isQuestion(h0 + from));
        var okc = e[1].filter(function (c) {
          if (badEnd(h0, c, punct, qm, from)) return false;
          if (strict && /^[！!]/.test(punct) && /[。、]/.test(c.replace(/^[…‥、]+/, ''))) return false;
          /* 新しい規則を使う辞書：問いには、問いの形（か・の・かな・かね など）でない付け足し（「たよぉ？」「でしょ、たぶん？」）を当てない */
          if (ask && c !== from && (!/(?:か|の|かな|かい|かね|だい)[〜ー～ぁあ]*$/.test(c) || /[。、]/.test(c.replace(/^[…‥、]+/, '')))) return false;
          return true;
        });
        if (!okc.length) return { body: body, punct: punct };
        var to = okc.length === e[1].length ? choose(e[1], seed + '#e' + i) : choose(okc, seed + '#e' + i);
        if (qm) { var tq = to.match(/[？?]+$/); to = to.replace(/[？?]+$/, ''); punct = (tq ? tq[0] : '') + punct.replace(/^[？?]+/, ''); }
        /* {る}{た}{ない}{なかった}{よう}：丁寧形の語幹（〜ます の前）を活用させる */
        if (/\{(る|た|ない|なかった|よう)\}/.test(to)) {
          var sm = head.match(/([ぁ-ゖ一-鿿々ァ-ヶー]+?)([きぎしちにびみりいえけげせぜてでねべめれ]|[一-鿿々])$/);
          var stem = sm ? sm[0] : head, rest = head.slice(0, head.length - stem.length);
          /* 語幹は、直前の漢字・かな続き（「飲み」「やってみ」「勉強し」）。長すぎる語幹は最後の数文字に */
          if (stem.length > 6) { rest = head.slice(0, head.length - 6); stem = head.slice(-6); }
          to = to.replace(/\{(る|た|ない|なかった|よう)\}/g, function (m, f) { return conj(stem, f); });
          return { body: rest + to + st[1], punct: punct };
        }
        return { body: head + to + st[1], punct: punct };
      }
    }
    return { body: body, punct: punct };
  }
  var SET_PHRASE = /^(?:ありがとうございま(?:す|した)|よろしくお願いします|おはようございます|申し訳(?:あり|ござい)ません|おやすみなさい|お願いします|わかりました|分かりました|すみません|失礼します|了解です|大丈夫です|お疲れさまです|お疲れさまでした|ごめんなさい)$/;
  /* 敬語 → ため口（規則「短い文はため口」で使う組み込みの表。長いものから） */
  var CASUAL_ENDS = [
    ['ありがとうございました', ['ありがとう']], ['ありがとうございます', ['ありがとう']], ['よろしくお願いします', ['よろしく']], ['おはようございます', ['おはよう']], ['申し訳ありません', ['ごめん']], ['申し訳ございません', ['ごめん']],
    ['おやすみなさい', ['おやすみ']], ['ないでください', ['ないで']], ['お願いします', ['お願い']], ['わかりました', ['わかった']], ['分かりました', ['分かった']], ['すみません', ['ごめん']], ['失礼します', ['失礼']],
    ['てください', ['て']], ['でください', ['で']], ['ください', ['ちょうだい']], ['ませんでした', ['{なかった}']], ['ましたか', ['{た}']], ['ませんか', ['{ない}']], ['ましょうか', ['{よう}か']], ['ましょう', ['{よう}']],
    ['ますよね', ['{る}よね']], ['ますね', ['{る}ね']], ['ますよ', ['{る}よ']], ['ますか', ['{る}']], ['ました', ['{た}']], ['ません', ['{ない}']], ['ます', ['{る}']],
    ['でしょうか', ['かな']], ['でしょう', ['でしょ']], ['ですよね', ['だよね']], ['ですね', ['ね'], /い$/], ['ですよ', ['よ'], /い$/], ['ですね', ['だね']], ['ですよ', ['だよ']], ['ですか', ['']], ['でした', ['だった']], ['です', ['']]
  ];
  /* ---------- 適用 ---------- */
  T.apply = function (q, d, who) {
    if (!q || !d) return q;
    var seed = q + '#' + ((who && who.name) || '');
    var q0 = q, dots0 = (q.match(/[…‥]+/g) || []).reduce(function (n, x) { return Math.max(n, x.length); }, 0);
    var r = d.rules || {}, fx = d.effects || {};
    /* 規則（文の内側） */
    if (r.prog) q = ruleProg(q, r.prog);
    if (r.exist) q = ruleExist(q, r.exist, r.neg);
    if (r.contract) q = ruleContract(q);
    /* 語彙 */
    if (d.words && d.words.length) {
      var re = d.wordsRe || (d.wordsRe = new RegExp(d.words.map(function (w) { return w[0]; }).sort(function (a, b) { return b.length - a.length; }).map(esc).join('|'), 'g'));
      var map = d.wordsMap || (d.wordsMap = d.words.reduce(function (m, w) { if (!m[w[0]]) m[w[0]] = w[1]; return m; }, {}));
      var k = 0;
      /* 置き換えた語は印で包み、文末の処理（ます→っす など）が重ねて当たらないようにする */
      q = q.replace(re, function (m, at, all) {
        var nx = all.slice(at + m.length), to = choose(map[m], seed + '#w' + (k + 1));
        /* 語の続きを切らない：「食べた」の語が「食べたい」「食べたくて」に当たって「食ったい」にならないように */
        if (/た$/.test(m) && /^(?:い|く|かっ|が[らりるれっ]|けれ)/.test(nx)) return m;
        /* 間投詞のようなかな2文字までの語（うん・はい・まあ・でも・おい・あら）は、語の中に当てない：「言うんだ」の「うん」、「おいしい」の「おい」、「それでも」の「でも」 */
        if (/^[あいうえおはわまで][ぁ-ゖ]?$/.test(m) && (/^[ぁ-ゖ]/.test(nx) || /[ぁ-ゖ]$/.test(all.slice(0, at)))) return m;
        /* 言い換えの付け足しが、元の文の続きと重なる：「ごめん=ごめんね」が「ごめんね」に当たって「ごめんねね」にならないように */
        if (to.length > m.length && to.indexOf(m) === 0) { var ad = to.slice(m.length).replace(/^[\s　]+/, ''); if (ad && /^[ぁ-ゖ〜ー]/.test(ad) && nx.indexOf(ad.charAt(0)) === 0) return m; }
        /* 語彙が足した念押しの語尾（だめ=だめだよ・だめ=いけないよ・ごめん=ごめんね）は、語のすぐ後に続きがある（「ごめんねだから」「分かったよの」）・
           その文が問い（？）のときは外す：「だめだよ？」「いけないよかい？」にしない。読点・言い切りの前ではそのまま */
        var tl = to.match(/(?:だよ|なのさ|ねえ|よ|ね|ぞ|ぜ|わ|さ)[〜ー～]*$/);
        if (tl && to.length > tl[0].length && m.slice(-tl[0].length) !== tl[0] && !(/^ねえ/.test(tl[0]) && /ない$/.test(m))) {
          var cont = /^[^。！!？?、，…‥」』）)\s　]/.test(nx), ask = /^[^。！!？?]*[？?]/.test(nx);
          if (cont || ask) to = to.slice(0, to.length - tl[0].length);
        }
        k++;
        return MARK + to + MARK;
      });
    }
    /* 驚き・笑い（語彙のあと。置き換えた語は印で包む） */
    if (r.surprise) q = ruleSurprise(q, r.surprise, seed);
    if (r.laugh) q = ruleLaugh(q, r.laugh, seed);
    if (r.emph && r.emph.length) q = ruleEmph(q, r.emph, seed, r.emphRate);
    /* 文ごと */
    var ss = segs(q);
    ss = ss.map(function (s, i) {
      var body = s.body;
      if (r.neg) body = ruleNeg(body, r.neg);
      if (r.copula) body = ruleCopula(body, r.copula);
      if (r.drop) body = ruleDrop(body, r.drop, seed + i);
      if (r.flat) body = ruleFlat(body, s.punct, r.flat, seed + '#' + i);
      /* 文末 */
      var punct = s.punct, core0 = splitTail(body)[0].replace(new RegExp(MARK, 'g'), '').replace(/^[…‥、\s　]+/, ''), coreLen = core0.length;
      /* 短い文はため口（敬語まじり）：決まり文句（ありがとうございます・よろしくお願いします など）、助詞のない短い一言、短い問いは、組み込みの敬語→ため口の表で崩す。それ以外は辞書の文末 */
      var pre0 = core0.replace(/(?:です|ます|ません|ました|でしょう|ください|ましょう|でした|ございます)[かねよ]*$/, '');
      var sc = r.shortCasual != null && (SET_PHRASE.test(core0) || (coreLen <= r.shortCasual && !/[はがをにへとでもの]/.test(pre0)) || (/^[？?]/.test(punct) && coreLen <= r.shortCasual + 2));
      var ap = applyEnds(body, punct, sc ? CASUAL_ENDS : d.ends, seed, i, newRules(r));
      return { body: ap.body.replace(new RegExp(MARK, 'g'), ''), punct: ap.punct };
    });
    if (fx.stretch) ss = fxStretch(ss, seed);
    if (fx.bangOn) ss = fxBangOn(ss, seed);
    if (fx.short) ss = fxShort(ss);
    q = join(ss);
    /* 言い換えで重なった記号を整える（「！。」「！、」「？？」） */
    q = q.replace(/([！？!?])。/g, '$1').replace(/([！？!?])、/g, '$1　').replace(/？(?=？)/g, '').replace(/！(?=！(?!！))/g, '').replace(/([！？])(?=[ぁ-ゖァ-ヶ一-鿿々「（])/g, '$1　');
    if (fx.bangOff) q = fxBang(q);
    /* 言い切りの規則を使う辞書（無機質など）は、感嘆符を落としたあとの台詞の終わりの「。」も外す（元の台詞が「。」で終わっていたときは残す） */
    if (fx.bangOff && newRules(r) && !/。$/.test(q0)) q = q.replace(/。$/, '');
    if (fx.stammer) q = fxStammer(q, seed);
    /* 前に……：文頭に「……」（けだるげ）。間を置く：文の切れ目の「。」を「。……」に（半分くらい） */
    if (fx.dots && !/^[…‥]/.test(q)) q = '……' + q;
    if (fx.pause) { var pk = 0; q = q.replace(/(?<![…‥])。(?=[^…‥])/g, function (m) { pk++; return hash(seed + '#pz' + pk) % 100 < 50 ? '。……' : m; }); }
    /* 「……」の重なり：語彙（ありがとう=……ありがと）や効果が足した「……」が元の「……」と並んだら一つに（元の文にあった長さまでは残す） */
    if (!/[…‥]。/.test(q0)) q = q.replace(/([…‥])。/g, '$1');
    /* 重なった語尾（「よよ」「ねね」）を一つに（元の文にあったものは残す） */
    q = q.replace(/(よ|ね)\1(?=[。！？!?…‥〜ー～」]|$)/g, function (m, c) { return q0.indexOf(m) >= 0 ? m : c; });
    q = q.replace(/[…‥]{3,}/g, function (m) { return m.length <= dots0 ? m : '……'; });
    /* 動揺（強い感情の文の頭）と前置き（台詞の頭）。喘ぎには付けない。動揺を付けた台詞には前置きを付けない */
    if ((r.shaken || r.lead) && !MOAN.test(q0)) {
      var shk = r.shaken ? ruleShaken(q, r.shaken, r.shakenRate == null ? 0.5 : r.shakenRate, seed) : null;
      if (shk != null) q = shk;
      else if (r.lead && !LEAD_DONE.test(q) && !/^[^。！？!?]*[！!]/.test(q) && q.replace(/[。、…‥！!？?\s　「」]/g, '').length > 6 && hash(seed + '#ld') % 100 < Math.round((r.leadRate == null ? 0.3 : r.leadRate) * 100)) {
        var lc = choose(r.lead, seed + '#ldc');
        if (lc) q = prefix(lc, q);
      }
    }
    /* 空の候補で消した笑い・驚きの後に残った記号（「、」で始まる台詞・「。、」） */
    if (r.surprise || r.laugh) {
      q = q.replace(/^[、\s　]+/, '').replace(/([。！？!?])、+/g, '$1').replace(/。[\s　]+/g, '。');
      /* 台詞が笑い声だけ（「はは」）で、消したら空になったときは「……」 */
      if (!q.replace(/[。、！？!?\s　]/g, '')) q = '……';
    }
    return q;
  };

  /* ---------- 1本の台詞に辞書を当てる（tone-registry.js で dictOnly の口調だけ。voice.js の processText から） ----------
     書き下ろしも従来の言い換えもない口調なので、台詞の形から K（常体）か P（敬語）かを見て、辞書のベースに寄せてから当てる。
     F は判定しない（硬い常体は K として扱い、F の辞書はそのまま当てる） */
  var P_FORM = /(?:です|ます|ません|ました|ましょう|でしょう|でした|ください|ございます)(?:か|よ|ね|よね|けど|から|が|し|の)?$/;
  T.formOf = function (q) {
    var ss = segs(String(q || '')).filter(function (s) { return s.body.replace(/[…‥、〜ー～っッ♡\s　]/g, ''); });
    var last = ss.length ? splitTail(ss[ss.length - 1].body)[0] : '';
    return P_FORM.test(last) ? 'P' : 'K';
  };
  /* 敬語の文をため口に（組み込みの敬語→ため口の表を全部の文に当てる） */
  T.casualize = function (q, seed) {
    return join(segs(q).map(function (s, i) { var ap = applyEnds(s.body, s.punct, CASUAL_ENDS, (seed || q) + '#cz', i); return { body: ap.body, punct: ap.punct }; }));
  };
  T.apply1 = function (q, d, who) {
    if (!q || !d) return q;
    /* 喘ぎ・短い声はそのまま（「気持ちいい……♡」に語尾を足さない） */
    if (MOAN.test(q) || /[♡゛]/.test(q)) return q;
    var f = T.formOf(q);
    if (f === 'P' && d.base !== 'P') q = T.casualize(q, q);
    else if (f === 'K' && d.base === 'P' && HK.Voice && HK.Voice.polite) q = HK.Voice.polite(q);
    return T.apply(q, d, who);
  };

  /* ---------- 辞書の文字列を読む ---------- */
  var RULE_KEYS = { '否定': 'neg', '進行': 'prog', '断定': 'copula', '助詞落とし': 'drop', '縮約': 'contract', '強調語': 'emph', '強調語の割合': 'emphRate', '存在': 'exist', '短い文はため口': 'shortCasual',
    '前置き': 'lead', '前置きの割合': 'leadRate', '驚き': 'surprise', '笑い': 'laugh', '言い切り': 'flat', '動揺': 'shaken', '動揺の割合': 'shakenRate' };
  var FX_KEYS = { '感嘆符を落とす': 'bangOff', '伸ばす': 'stretch', '言い切りに！': 'bangOn', '言い切りに!': 'bangOn', '短くする': 'short', '言いよどみ': 'stammer', '前に……': 'dots', '間を置く': 'pause' };
  /* 「元=先1／先2」の候補。空の候補（「です(い)=／です」の左側）は「消す」の意味で残す */
  function alts(v) { return String(v).split(/[／/]/).map(function (x) { return x.replace(/^\s+|\s+$/g, ''); }); }
  /* 文字列 → { dicts: { 鍵: 辞書 }, errors } */
  T.parse = function (text, userMode) {
    var out = { dicts: {}, errors: [] }, cur = null, sec = null, n = 0;
    String(text || '').split(/\r?\n/).forEach(function (raw, i) {
      var line = raw.replace(/^\s+|\s+$/g, '');
      if (!line || /^[#＃]/.test(line)) return;
      var h = line.match(/^[\[［]\s*(.+?)\s*[\]］]$/);
      if (h) {
        var hd = h[1].split(/[\s　]+/);
        if (hd[0] === '口調') {
          n++;
          cur = { key: hd[1] ? (userMode && !/^u:/.test(hd[1]) && !(HK.TONES && HK.TONES[hd[1]]) ? 'u:' + hd[1] : hd[1]) : null, label: '', base: '', fp: null, you: '', persona: '', ends: [], words: [], rules: {}, effects: {}, line: i + 1, order: n };
          sec = 'head';
          out.dicts['#' + n] = cur;
          return;
        }
        if (!cur) { out.errors.push((i + 1) + '行目：先に [口調] が要ります'); return; }
        var sm = { '文末': 'ends', '語彙': 'words', '規則': 'rules', '効果': 'effects' }[hd[0]];
        if (!sm) { out.errors.push((i + 1) + '行目：節「' + hd[0] + '」が読めません（文末／語彙／規則／効果）'); sec = null; return; }
        sec = sm; return;
      }
      if (!cur) { out.errors.push((i + 1) + '行目：先に [口調] が要ります'); return; }
      var kv = line.match(/^(.+?)\s*[=＝]\s*(.*)$/);
      if (!kv) { out.errors.push((i + 1) + '行目：「元=先」の形で書いてください'); return; }
      var k = kv[1].replace(/^\s+|\s+$/g, ''), v = kv[2].replace(/^\s+|\s+$/g, '');
      if (sec === 'head') {
        if (k === '名前') cur.label = v.slice(0, 20);
        else if (k === '鍵') cur.key = userMode ? 'u:' + v.replace(/^u:/, '') : v;
        else if (k === 'ベース') { var b = v.toUpperCase(); if (b === 'K' || b === 'F' || b === 'P') cur.base = b; else out.errors.push((i + 1) + '行目：ベースは K／F／P'); }
        else if (k === '一人称') { var fs = v.split(/[|｜]/).map(function (x) { return x.replace(/^\s+|\s+$/g, '').slice(0, 8); }); cur.fp = { m: fs[0] || '', f: fs[1] || fs[0] || '', x: fs[2] || fs[0] || '' }; }
        else if (k === '二人称') cur.you = v.slice(0, 8);
        else if (k === '態度') { if (HK.PERSONA && HK.PERSONA[v]) cur.persona = v; else out.errors.push((i + 1) + '行目：態度「' + v + '」が見つかりません'); }
        else if (k === '説明') cur.desc = v.slice(0, 80);
        else out.errors.push((i + 1) + '行目：項目「' + k + '」が読めません');
        return;
      }
      if (sec === 'ends') { var cond = null; var cm = k.match(/^(.+?)\((.+)\)$/); if (cm) { k = cm[1]; try { cond = new RegExp(cm[2] + '$'); } catch (e) { cond = null; } } cur.ends.push([k, alts(v), cond]); return; }
      if (sec === 'words') { cur.words.push([k, alts(v)]); return; }
      if (sec === 'rules') {
        var rk = RULE_KEYS[k]; if (!rk) { out.errors.push((i + 1) + '行目：規則「' + k + '」は使えません（否定／進行／断定／助詞落とし／縮約／強調語／存在／短い文はため口／前置き／驚き／笑い／言い切り／動揺）'); return; }
        if (rk === 'drop') { var rate = parseFloat(v); cur.rules.drop = rate > 0 ? Math.min(1, rate) : 0; }
        else if (rk === 'emphRate') { var er = parseFloat(v); cur.rules.emphRate = er >= 0 ? Math.min(1, er) : 0.5; }
        else if (rk === 'shortCasual') { var sl = parseInt(v, 10); cur.rules.shortCasual = sl > 0 ? sl : 6; }
        else if (rk === 'contract') cur.rules.contract = yes(v);
        else if (rk === 'emph') cur.rules.emph = alts(v);
        else if (rk === 'lead' || rk === 'shaken') { var lv = alts(v).filter(Boolean); if (lv.length) cur.rules[rk] = lv; }
        else if (rk === 'surprise' || rk === 'laugh') cur.rules[rk] = alts(v);   /* 空の候補は「消す」 */
        else if (rk === 'leadRate' || rk === 'shakenRate' || rk === 'flat') { var fr = parseFloat(v); if (fr >= 0) cur.rules[rk] = Math.min(1, fr); else out.errors.push((i + 1) + '行目：' + k + 'は 0〜1 の数'); }
        else if (rk === 'neg') { if (/^(ぬ|へん|ん)$/.test(v)) cur.rules.neg = v; else out.errors.push((i + 1) + '行目：否定は ぬ／へん／ん'); }
        else if (rk === 'prog') { if (/^[てと]/.test(v)) cur.rules.prog = v; else out.errors.push((i + 1) + '行目：進行は「ておる」「とる」のような形'); }
        else if (rk === 'exist') { if (/る$/.test(v)) cur.rules.exist = v; else out.errors.push((i + 1) + '行目：存在は「おる」のような形'); }
        else cur.rules[rk] = v;
        return;
      }
      if (sec === 'effects') { var fk = FX_KEYS[k]; if (!fk) { out.errors.push((i + 1) + '行目：効果「' + k + '」は使えません'); return; } cur.effects[fk] = yes(v); return; }
      out.errors.push((i + 1) + '行目：節の中ではありません');
    });
    /* 鍵を確定（利用者の口調は u:名前）、文末は長い順 */
    var dicts = {};
    Object.keys(out.dicts).forEach(function (k) {
      var d = out.dicts[k];
      if (!d.key) { if (!d.label) { out.errors.push(d.line + '行目の [口調]：名前がありません'); return; } d.key = userMode ? 'u:' + d.label : d.label; }
      /* 同じ長さなら、条件つきの項目（「な(る)=な」）を先に（条件なしの「な=ね」に先を越されないように） */
      d.ends.sort(function (a, b) { return b[0].length - a[0].length || (b[2] ? 1 : 0) - (a[2] ? 1 : 0); });
      if (!d.base) d.base = T.BASE[d.key] || 'K';
      dicts[d.key] = d;
    });
    out.dicts = dicts;
    return out;
  };
  /* 組み込みの辞書を登録（tone-dict-builtin.js から） */
  T.addBuiltin = function (text) { var p = T.parse(text, false); Object.keys(p.dicts).forEach(function (k) { T.dicts[k] = p.dicts[k]; }); if (p.errors.length && typeof console !== 'undefined') console.warn('tone-dict-builtin: ' + p.errors.join(' / ')); return p; };

  /* ---------- 利用者の口調を選択欄に出す ---------- */
  var registered = [];
  function unregister() {
    registered.forEach(function (k) { if (HK.TONES) delete HK.TONES[k]; if (HK.TONE_EXTRA) delete HK.TONE_EXTRA[k]; if (HK.TONE_YOU) delete HK.TONE_YOU[k]; if (HK.TONE_KEYS) { var i = HK.TONE_KEYS.indexOf(k); if (i >= 0) HK.TONE_KEYS.splice(i, 1); } });
    registered = [];
  }
  T.setUser = function (text) {
    var p = T.parse(text, true);
    T.userText = String(text || '');
    T.user = {};
    unregister();
    Object.keys(p.dicts).forEach(function (k) {
      var d = p.dicts[k];
      T.user[k] = d;
      if (!/^u:/.test(k)) return;   /* 組み込みの口調の上書きは選択欄に足さない */
      var ps = d.persona || BASE_PERSONA[d.base], info = { label: d.label || k.slice(2), desc: d.desc || '自作の口調（高度設定の口調の辞書）', base: ps, top: null, fp: d.fp || undefined, group: d.base === 'P' ? 'polite' : d.base === 'K' ? 'soft' : undefined };
      if (HK.TONES) HK.TONES[k] = info;
      if (HK.TONE_EXTRA) HK.TONE_EXTRA[k] = info;
      if (HK.TONE_YOU && d.you) HK.TONE_YOU[k] = d.you;
      if (HK.TONE_KEYS && HK.TONE_KEYS.indexOf(k) < 0) HK.TONE_KEYS.push(k);
      registered.push(k);
    });
    return p;
  };
  /* 住人ごとの語尾の設定（tone-ending.js の HK.Ending）が作った辞書を、鍵（e:…）で登録する。高度設定の辞書（setUser）とは別に持つので、両方を使える */
  T.setEnding = function (key, text) {
    var p = T.parse(text, false), d = p.dicts[key];
    if (d) T.ending[key] = d; else delete T.ending[key];
    return p;
  };
  T.userKeys = function () { return Object.keys(T.user); };
  T.labelOf = function (k) { var d = T.user[k] || T.dicts[k]; return (d && d.label) || (HK.toneInfo && HK.toneInfo(k) && HK.toneInfo(k).label) || k; };
  /* 見本（3本のベースの台詞を辞書で言い換えて見せる） */
  var SAMPLES = [
    '知ってるよ｜知っている｜知っています', 'ありがとう｜＝｜ありがとうございます', '無理しないでね｜無理をするな｜無理をしないでください',
    'それ、本当にすごいね｜それは本当にすごいな｜それは本当にすごいですね', '分からないよ。でも、やってみる｜分からない。だが、やってみる｜分かりません。でも、やってみます',
    'もう帰る？｜もう帰るのか｜もう帰りますか？'
  ];
  T.demo = function (k) {
    var d = T.user[k] || T.dicts[k]; if (!d) return [];
    return SAMPLES.map(function (s) { var sp = T.split(s); return '「' + T.apply(sp[d.base] || sp.K, d, { name: '見本' }) + '」'; });
  };
  T.help = function () { return '書き方：[口調] 名前=／ベース=K・F・P／一人称=／二人称=／態度=（省略可）。[文末] 元=先（／で候補）。[語彙] 元=先。[規則] 否定=ぬ・へん・ん／進行=ておる・とる／断定=や／助詞落とし=0.3／縮約=はい／強調語=マジ／めっちゃ／前置き=フッ……。／やれやれ（前置きの割合=0.3）／驚き=なんと！／おお……（文頭の え・うそ・マジ などを置き換え。空なら消す）／笑い=フハハ（はは・ふふ などを置き換え。空なら消す）／言い切り=0.3（文末の よ・ね・さ・ぞ を落とす割合）／動揺=く……ッ！／バカな……！（「！」の強い文の頭に。動揺の割合=0.5）。[効果] 感嘆符を落とす・伸ばす・言い切りに！・短くする・言いよどみ=はい。\n※ 試作中：3本のベース（K｜F｜P）で書かれた台詞にだけ効きます。1本の台詞はこれまでの言い換えになります。'; };
  T.sample = function () { return '[口調]\n名前=ですぞ侍\nベース=P\n一人称=拙者\n二人称=貴殿\n[文末]\nです=ですぞ／ですな\nですか=ですかな\nますか=ますかな\nました=ましたぞ\nません=ませぬ\nください=くだされ\n[語彙]\nありがとうございます=かたじけない\nすみません=面目ない\n[規則]\n否定=ぬ\n進行=ておる'; };

  /* 保存してある利用者の辞書（ui-adv.js が adv.tone に入れる） */
  try { var adv = HK.store && HK.store.get('adv', null); if (adv && adv.tone) T.setUser(adv.tone); } catch (e) { /* 読めなければ組み込みだけ */ }
})();
