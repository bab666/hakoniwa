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
     縮約=はい              ← 分からない→分かんない、ちょうだい→ちょーだい など
     強調語=マジ／めっちゃ  ← 形容詞の前に差し込む（台詞に一度まで。文に勢い（！や強い語）があるときだけ）
     強調語の割合=0.4       ← 差し込む割合（既定 0.5）
     [効果]                 ← 組み込みの小さな変形
     感嘆符を落とす=はい ／ 伸ばす=はい ／ 言い切りに！=はい ／ 短くする=はい ／ 言いよどみ=はい
   ■ 使い方
     HK.Tone.pick(台詞, 話し手, 敬語の相手か) → { q: 選んだベース, dict: 辞書か null }（voice.js の processText から）
     HK.Tone.apply(台詞, 辞書, 話し手) → 言い換えた台詞。同じ台詞は同じ結果（くじは台詞の文字から）
   一人称は「私」、二人称は「あなた」で書く約束（置換は voice.js の既存の層） */
(function () {
  'use strict';
  var HK = window.HK;
  if (!HK) return;
  var T = HK.Tone = { dicts: {}, user: {}, userText: '' };
  function hash(s) { var x = 7; for (var i = 0; i < s.length; i++) x = (x * 31 + s.charCodeAt(i)) | 0; return Math.abs(x); }
  function esc(s) { return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }
  function choose(list, seed) { return list.length === 1 ? list[0] : list[hash(seed) % list.length]; }
  function yes(v) { return /^(はい|on|1|true|yes|○|する)$/i.test(String(v || '').trim()); }

  /* ---------- 組み込みの口調がどのベースから作られるか ---------- */
  T.BASE = {
    gentle: 'K', gentle_n: 'K', ane: 'K', usan: 'K', free: 'K', gyaru: 'K', chara: 'K', shy: 'K', tame: 'K', kansai: 'K', mukuchi: 'K', boku_n: 'K', devoted_p: 'K', darui_lite: 'K', darui: 'K', tsun: 'K', tsun_n: 'K',
    proud: 'F', aniki: 'F', yankee: 'F', stern: 'F', cool: 'F', calm: 'F', gentleman: 'F', sondai: 'F', noja: 'F', god: 'F', mystic: 'F', hero: 'F', cool_soft: 'F',
    polite: 'P', devoted: 'P', kohai: 'P', ojou: 'P', genki: 'P', keigo_sarc: 'P', keigo_bossy: 'P', keigo_flat: 'P', chara_down: 'P', mixed: 'P'
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
  T.dictOf = function (tone) { return (tone && (T.user[tone] || T.dicts[tone])) || null; };
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
    var ichiIM = (last === 'い' || last === 'み') && (!pre || /[てで]$/.test(pre));
    if (/^(?:来|き)$/.test(stem)) return { 'る': '来る', 'た': '来た', 'ない': '来ない', 'なかった': '来なかった', 'よう': '来よう' }[form];
    if (suru) return pre + { 'る': 'する', 'た': 'した', 'ない': 'しない', 'なかった': 'しなかった', 'よう': 'しよう' }[form];
    if (/^(?:あり)$/.test(stem)) return { 'る': 'ある', 'た': 'あった', 'ない': 'ない', 'なかった': 'なかった', 'よう': 'あろう' }[form];
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
    return q.replace(EMPH_AT, function (m) { return choose(words, seed + '#ew') + m; });
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
      if (s.punct || s.body.length > 8 || /[…‥、〜ー]$/.test(s.body)) return s;
      if (/[だよぜぞ]$/.test(s.body) && hash(seed + '#bg' + i) % 100 < 50) return { body: s.body, punct: '！' };
      return s;
    });
  }
  function fxShort(ss) { if (ss.length <= 1) return ss; var f = ss[0]; return [{ body: (/^[…‥]/.test(f.body) ? '' : '……') + f.body, punct: f.punct }]; }
  function fxStammer(q, seed) {
    if (hash(seed + '#stm') % 100 >= 30 || /^[…‥]/.test(q)) return q;
    var m = q.match(/^([ぁ-ゖァ-ヶ])/);
    return m ? m[1] + '、' + q : 'あ、あの……' + q;
  }

  /* ---------- 適用 ---------- */
  T.apply = function (q, d, who) {
    if (!q || !d) return q;
    var seed = q + '#' + ((who && who.name) || '');
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
      q = q.replace(re, function (m) { k++; return MARK + choose(map[m], seed + '#w' + k) + MARK; });
    }
    if (r.emph && r.emph.length) q = ruleEmph(q, r.emph, seed, r.emphRate);
    /* 文ごと */
    var ss = segs(q);
    ss = ss.map(function (s, i) {
      var body = s.body;
      if (r.neg) body = ruleNeg(body, r.neg);
      if (r.copula) body = ruleCopula(body, r.copula);
      if (r.drop) body = ruleDrop(body, r.drop, seed + i);
      /* 文末 */
      if (d.ends && d.ends.length) {
        var st = splitTail(body), core = st[0];
        var punct = s.punct;
        if (core.slice(-1) !== MARK) for (var j = 0; j < d.ends.length; j++) {
          var e = d.ends[j], from = e[0], qm = /[？?]$/.test(from);
          /* 「ません？=ませんこと？」のように ？ 付きの項目は、文末記号ごと見る */
          if (qm) { if (!/^[？?]/.test(punct)) continue; from = from.slice(0, -1); }
          var head = core.slice(0, core.length - from.length);
          if (core.length >= from.length && core.slice(core.length - from.length) === from && (!e[2] || e[2].test(head.replace(new RegExp(MARK, 'g'), '')))) {
            var to = choose(e[1], seed + '#e' + i);
            if (qm) { var tq = to.match(/[？?]+$/); to = to.replace(/[？?]+$/, ''); punct = (tq ? tq[0] : '') + punct.replace(/^[？?]+/, ''); }
            /* {る}{た}{ない}{なかった}{よう}：丁寧形の語幹（〜ます の前）を活用させる */
            if (/\{(る|た|ない|なかった|よう)\}/.test(to)) {
              var sm = head.match(/([ぁ-ゖ一-鿿々ァ-ヶー]+?)([きぎしちにびみりいえけげせぜてでねべめれ]|[一-鿿々])$/);
              var stem = sm ? sm[0] : head, rest = head.slice(0, head.length - stem.length);
              /* 語幹は、直前の漢字・かな続き（「飲み」「やってみ」「勉強し」）。長すぎる語幹は最後の数文字に */
              if (stem.length > 6) { rest = head.slice(0, head.length - 6); stem = head.slice(-6); }
              to = to.replace(/\{(る|た|ない|なかった|よう)\}/g, function (m, f) { return conj(stem, f); });
              body = rest + to + st[1];
            } else body = head + to + st[1];
            break;
          }
        }
      }
      return { body: body.replace(new RegExp(MARK, 'g'), ''), punct: punct };
    });
    if (fx.stretch) ss = fxStretch(ss, seed);
    if (fx.bangOn) ss = fxBangOn(ss, seed);
    if (fx.short) ss = fxShort(ss);
    q = join(ss);
    if (fx.bangOff) q = fxBang(q);
    if (fx.stammer) q = fxStammer(q, seed);
    return q;
  };

  /* ---------- 辞書の文字列を読む ---------- */
  var RULE_KEYS = { '否定': 'neg', '進行': 'prog', '断定': 'copula', '助詞落とし': 'drop', '縮約': 'contract', '強調語': 'emph', '強調語の割合': 'emphRate', '存在': 'exist' };
  var FX_KEYS = { '感嘆符を落とす': 'bangOff', '伸ばす': 'stretch', '言い切りに！': 'bangOn', '言い切りに!': 'bangOn', '短くする': 'short', '言いよどみ': 'stammer' };
  function alts(v) { return String(v).split(/[／/]/).map(function (x) { return x.replace(/^\s+|\s+$/g, ''); }).filter(function (x, i, a) { return x !== '' || a.length === 1; }); }
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
        var rk = RULE_KEYS[k]; if (!rk) { out.errors.push((i + 1) + '行目：規則「' + k + '」は使えません（否定／進行／断定／助詞落とし／縮約／強調語）'); return; }
        if (rk === 'drop') { var rate = parseFloat(v); cur.rules.drop = rate > 0 ? Math.min(1, rate) : 0; }
        else if (rk === 'emphRate') { var er = parseFloat(v); cur.rules.emphRate = er >= 0 ? Math.min(1, er) : 0.5; }
        else if (rk === 'contract') cur.rules.contract = yes(v);
        else if (rk === 'emph') cur.rules.emph = alts(v);
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
      d.ends.sort(function (a, b) { return b[0].length - a[0].length; });
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
  T.help = function () { return '書き方：[口調] 名前=／ベース=K・F・P／一人称=／二人称=／態度=（省略可）。[文末] 元=先（／で候補）。[語彙] 元=先。[規則] 否定=ぬ・へん・ん／進行=ておる・とる／断定=や／助詞落とし=0.3／縮約=はい／強調語=マジ／めっちゃ。[効果] 感嘆符を落とす・伸ばす・言い切りに！・短くする・言いよどみ=はい。\n※ 試作中：3本のベース（K｜F｜P）で書かれた台詞にだけ効きます。1本の台詞はこれまでの言い換えになります。'; };
  T.sample = function () { return '[口調]\n名前=ですぞ侍\nベース=P\n一人称=拙者\n二人称=貴殿\n[文末]\nです=ですぞ／ですな\nですか=ですかな\nますか=ますかな\nました=ましたぞ\nません=ませぬ\nください=くだされ\n[語彙]\nありがとうございます=かたじけない\nすみません=面目ない\n[規則]\n否定=ぬ\n進行=ておる'; };

  /* 保存してある利用者の辞書（ui-adv.js が adv.tone に入れる） */
  try { var adv = HK.store && HK.store.get('adv', null); if (adv && adv.tone) T.setUser(adv.tone); } catch (e) { /* 読めなければ組み込みだけ */ }
})();
