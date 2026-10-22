/* 箱庭シミュレーター: 口調ごとの台詞の整形（敬語以外の8つの口調）
   voice.js が台詞（「」）ごとに話し手を判定したあと、その人の口調に合わせて言い回しを寄せる。
   ・強気：丁寧語をくだけた言い方に、お願いを命令に、「ね」を「な」に、謝罪・お礼をぶっきらぼうに
   ・厳格：お願いを「〜てくれ」に、「ね」を「な」に、謝罪は「すまない」、お礼は「感謝する」
   ・意地っ張り：丁寧語をくだけた言い方に、素直なお礼・好意を照れ隠しに
   ・穏やか／健気：命令・禁止をやわらかいお願いに、乱暴な呼び方・語尾をやわらかく
   ・恥じらい：穏やかと同じ整形に加えて、ときどき言いよどむ
   ・冷静：感嘆符を落として淡々とした言い方に
   ・奔放：丁寧語をくだけた言い方に、短い言い切りに「！」
   台詞ごとに決まった結果になる（同じ台詞なら同じ整形）。 */
(function () {
  'use strict';
  var HK = window.HK, V = HK.Voice;
  if (!V) return;

  function hash(s) { var x = 7; for (var i = 0; i < s.length; i++) x = (x * 31 + s.charCodeAt(i)) | 0; return Math.abs(x); }
  function isKanji(ch) { return /[一-鿿々]/.test(ch || ''); }
  var WH = /(なんで|どうして|何|なに|誰|だれ|どこ|いつ|どう|どれ|どっち|なぜ)/;

  /* ---------- 丁寧語 → くだけた言い方 ---------- */
  var I2U = { 'き': 'く', 'ぎ': 'ぐ', 'し': 'す', 'ち': 'つ', 'に': 'ぬ', 'び': 'ぶ', 'み': 'む', 'り': 'る', 'い': 'う' };
  var I2A = { 'き': 'か', 'ぎ': 'が', 'し': 'さ', 'ち': 'た', 'に': 'な', 'び': 'ば', 'み': 'ま', 'り': 'ら', 'い': 'わ' };
  var I2O = { 'き': 'こ', 'ぎ': 'ご', 'し': 'そ', 'ち': 'と', 'に': 'の', 'び': 'ぼ', 'み': 'も', 'り': 'ろ', 'い': 'お' };
  var I2TA = { 'き': 'いた', 'ぎ': 'いだ', 'し': 'した', 'ち': 'った', 'り': 'った', 'い': 'った', 'に': 'んだ', 'び': 'んだ', 'み': 'んだ' };
  var ICHI = /(起き|生き|落ち|信じ|感じ|閉じ|浴び|借り|降り|過ぎ|足り|伸び|満ち|飽き|尽き|老い|報い|できる|でき)$/;
  var FORMS = { 'する': ['する', 'しない', 'した', 'しよう'], 'くる': ['くる', 'こない', 'きた', 'こよう'], '来る': ['来る', '来ない', '来た', '来よう'], 'いる': ['いる', 'いない', 'いた', 'いよう'], 'ある': ['ある', 'ない', 'あった', 'あろう'], 'できる': ['できる', 'できない', 'できた', 'しよう'], '行く': ['行く', '行かない', '行った', '行こう'], 'いく': ['いく', 'いかない', 'いった', 'いこう'] };
  var FI = { u: 0, nai: 1, ta: 2, vol: 3 };
  /* 連用形の語幹 stem を活用させる（form: u 言い切り / nai 否定 / ta 過去 / vol 意向） */
  function conj(stem, form) {
    var fi = FI[form], irr = null, cut = 0;
    if (/でき$/.test(stem)) { irr = 'できる'; cut = 2; }
    else if (/(^|[^ぁ-ん]|[はがもにでと、])あり$/.test(stem) || stem === 'あり' || /(では|じゃ|て|で)あり$/.test(stem)) { irr = 'ある'; cut = 2; }
    else if (/行き$/.test(stem)) { irr = '行く'; cut = 2; }
    else if (/[てで]いき$/.test(stem) || stem === 'いき') { irr = 'いく'; cut = 2; }
    else if (stem === 'い' || /[てで]い$/.test(stem) || (/[ぁ-んァ-ヶー、\s]い$/.test(stem) && !/(もらい|しまい|かまい|ちがい|あらい|うたい|あい|かい|すい|ぬぐい|はらい|わらい|まよい|ねがい|つかい|おもい|いい)$/.test(stem))) { irr = 'いる'; cut = 1; }
    else if (stem === 'き' || /[てで]き$/.test(stem)) { irr = 'くる'; cut = 1; }
    else if (/来$/.test(stem)) { irr = '来る'; cut = 1; }
    else if (/し$/.test(stem)) {
      var b1 = stem.slice(-2, -1), b2 = stem.slice(-3, -2);
      var sahen = stem === 'し' || /何し$/.test(stem) || /[ァ-ヶーにとうくでをよいもは]/.test(b1) || (isKanji(b1) && (isKanji(b2) || /[ァ-ヶー]/.test(b2)));
      if (sahen) { irr = 'する'; cut = 1; }
    }
    if (irr) return stem.slice(0, stem.length - cut) + FORMS[irr][fi];
    var c = stem.slice(-1), pre = stem.slice(-2, -1);
    /* 「人います」「猫います」：名詞のあとの「い」は「いる」（「言い」「会い」などの動詞は除く） */
    if (c === 'い' && isKanji(pre) && !/[言思会買使払笑願迷歌洗拭誘違吸追争祝救狙雇酔結揃匂舞這繕伴担戦失奪補従扱漂味叶通構呪貰養行誓拾庇伺敬繕問負合占縫狂]/.test(pre)) return stem.slice(0, -1) + FORMS['いる'][fi];
    var ichidan = /[えけげせぜてでねへべめれ]$/.test(stem) || ICHI.test(stem) || (isKanji(c) && !I2U[c]);
    if (ichidan) return stem + ['る', 'ない', 'た', 'よう'][fi];
    if (!I2U[c] || !(isKanji(pre) || /[ぁ-ん]/.test(pre))) return null;
    if (form === 'u') return stem.slice(0, -1) + I2U[c];
    if (form === 'nai') return stem.slice(0, -1) + I2A[c] + 'ない';
    if (form === 'ta') return stem.slice(0, -1) + I2TA[c];
    return stem.slice(0, -1) + I2O[c] + 'う';
  }
  /* 丁寧な文末をくだけた文末に（変えられなければ null）。rough = 強気・厳格寄りの語尾 */
  function plainCore(s, rough) {
    var m;
    if (/[ちじ]ゃいます$/.test(s)) return s.replace(/([ちじ])ゃいます$/, '$1ゃう');
    if (/[ちじ]ゃいましょう$/.test(s)) return s.replace(/([ちじ])ゃいましょう$/, '$1ゃおう');
    if (/[ちじ]ゃいました$/.test(s)) return s.replace(/([ちじ])ゃいました$/, '$1ゃった');
    if ((m = s.match(/^(.*)ませんでした$/))) { var n0 = conj(m[1], 'nai'); return n0 ? n0.replace(/ない$/, 'なかった') : null; }
    if ((m = s.match(/^(.*)ません$/))) return conj(m[1], 'nai');
    if ((m = s.match(/^(.*)ましょう$/))) return conj(m[1], 'vol');
    if ((m = s.match(/^(.*)ました$/))) return conj(m[1], 'ta');
    if ((m = s.match(/^(.*)ます$/))) return conj(m[1], 'u');
    if (/かったです$/.test(s)) return s.replace(/です$/, '');
    if (/でした$/.test(s)) return s.replace(/でした$/, 'だった');
    /* クイズの「誰でしょう？」「なんて書いたでしょう？」は、独り言の「だろ」にせず「〜と思う？」に */
    if (/でしょう$/.test(s) && rough && /(何|なに|なん|誰|だれ|どこ|いつ|どう|どれ|どっち|どんな|どの|なぜ)/.test(s)) return s.replace(/でしょう$/, /[たるいうくすつむぬぶぐ]でしょう$/.test(s) ? 'と思う' : 'だと思う');
    if (/でしょう$/.test(s)) return s.replace(/でしょう$/, rough ? 'だろ' : 'でしょ');
    if (/んです$/.test(s)) return s.replace(/んです$/, 'んだ');
    if (/[^し]いです$/.test(s) || /(ない|たい|しい)です$/.test(s)) return s.replace(/です$/, '');
    if (/です$/.test(s)) return s.replace(/です$/, 'だ');
    if (/(て|で)ください$/.test(s)) return s.replace(/ください$/, rough ? 'くれ' : '');
    if (/ください$/.test(s)) return s.replace(/ください$/, rough ? 'くれ' : 'ちょうだい');
    return null;
  }
  var PPART = /(よね|ね|よ|か)$/;
  function plainSentence(s, mode) {
    var rough = mode === 'proud', s1 = s;
    /* 「〜ますから」「〜ですけど」：つなぎの言葉の前の丁寧語も外す */
    var cj = s.match(/^(.*(?:です|ます|ません|でした|ました|ましょう))(が|けど|けれど|けれども|から|ので|し)$/);
    if (cj) { var cr = /^(です|ます)$/.test(cj[1]) ? 'だ' : plainSentence(cj[1], mode); if (cr == null) return null; if (cj[2] === 'ので' && /だ$/.test(cr)) cr = cr.slice(0, -1) + 'な'; return cr + cj[2]; }
    s = s.replace(/くださいませ$/, 'ください').replace(/ありがとう、ございま(?:す|した)$/, 'ありがとう').replace(/^お疲れ(?:さま|様)(?:でした|です)$/, 'お疲れ').replace(/ございません$/, 'ありません').replace(/ございました$/, 'ありました').replace(/([てで])おり(ます|ました|ません|ましょう)/, '$1い$2').replace(/おります$/, 'いる').replace(/でございます$/, 'だ').replace(/でございました$/, 'だった').replace(/ございます$/, 'ある').replace(/いたします$/, 'する').replace(/いたしました$/, 'した').replace(/いたしましょう$/, 'しよう');
    if (/^(ありがとうございます|ありがとうございました)$/.test(s)) return null;
    if (/(おはよう|おめでとう)ございます$/.test(s)) return s.replace(/ございます$/, '');
    if (/^(すみません|ごめんなさい|申し訳ありません|申し訳ございません|失礼しました)$/.test(s)) return null;
    if (/お願いします$/.test(s)) return s.replace(/お願いします$/, rough ? '頼む' : 'お願い');
    var c = plainCore(s, rough);
    if (c) return c;
    if (s !== s1) return s;
    var pm = s.match(PPART);
    if (!pm || s.length <= pm[1].length) return null;
    var p = pm[1], rest = s.slice(0, -p.length);
    if (/ん?ですか$/.test(s)) {
      if (/んですか$/.test(s)) return s.replace(/んですか$/, rough ? (WH.test(s) ? 'んだ' : 'のか') : 'の');
      if (/いですか$/.test(s)) return s.replace(/ですか$/, rough ? 'のか' : 'の');
      return s.replace(/ですか$/, rough ? (WH.test(s) ? 'だ' : /(好き|嫌い|苦手|得意)ですか$/.test(s) ? 'なのか' : 'か') : 'なの');
    }
    var rc = plainCore(rest, rough) || (/(が|けど|けれど|から|ので|し)$/.test(rest) && rest !== s ? plainSentence(rest, mode) : null);
    if (!rc) return null;
    if (p === 'か' && /[よお]う$/.test(rc)) return rc + 'か';
    if (p === 'ね' && rough && /[るうくすつぬむぶぐ]$/.test(rc) && !/([おこそとのほもよろごぞどぼょ]う|てる|ている)$/.test(rc)) return rc + 'ぞ';
    var map = rough ? { 'よね': 'よな', 'ね': 'な', 'よ': 'ぞ', 'か': 'か' } : { 'よね': 'よね', 'ね': 'ね', 'よ': 'よ', 'か': 'の' };
    if (/くれ$/.test(rc)) return rc + (p === 'よ' ? 'よ' : '');
    if (p === 'か' && /だ$/.test(rc)) return rc.slice(0, -1) + (rough ? 'か' : 'なの');
    if (p === 'か' && rough && /[るうくすつぬぶむぐいた]$/.test(rc)) return rc + 'のか';
    if (p === 'よ' && /だ$/.test(rc)) return rc + (rough ? 'ぞ' : 'よ');
    if (p === 'ね' && /だ$/.test(rc)) return rc + (rough ? 'な' : 'ね');
    return rc + map[p];
  }

  /* ---------- 命令・禁止 → やわらかいお願い ---------- */
  var GTE = { 'け': 'いて', 'げ': 'いで', 'せ': 'して', 'て': 'って', 'ね': 'んで', 'べ': 'んで', 'め': 'んで', 'れ': 'って', 'え': 'って' };
  var GNOUN = /(仕掛け|負け|賭け|助け|流れ|別れ|疲れ|遅れ|恐れ|晴れ|憧れ|汚れ|乱れ|揺れ|崩れ|外れ|生まれ|受け|儲け|分け|明け|抜け|焼け|情け|化け|群れ|切れ|売れ|触れ|慣れ|照れ|腫れ|痺れ|攣れ|捩れ|狙え|見え|答え|考え|教え|支え|鍛え|構え|迎え|訴え|蓄え|植え|飢え|冷え|震え|甘え|怯え|越え|超え|手当て|目当て|仕立て|見立て|組み立て|子育て|手立て|企て|隔て|当て|捨て|果て|責め|攻め|眺め|締め|戒め|勧め|決め|詰め|初め|始め|諦め|慰め|並べ|調べ|比べ|述べ|重ね|真似|束ね|兼ね|尋ね|跳ね|寝|任せ|知らせ|幸せ|合わせ|仕合せ|寄せ|見せ|着せ|乗せ|載せ|浴びせ|出せ|入れ|逃げ|上げ|下げ|投げ|揚げ|曲げ|焦げ|開け|止め|閉め|眺め|集め|求め|染め|込め|笑顔|姉|兄|手|目|歯|芽|胸|腕|指|舌|耳|首|腰)$/;
  function soften(s) {
    if (/(ください|なさい)$/.test(s) || /[うょ][なね]$/.test(s) || /(なんで|ので|たりして)$/.test(s)) return null;
    var core = s, tail = '';
    var pm = s.match(/(よ|ぞ|ぜ|って)$/);
    if (pm && s.length > pm[1].length + 1) { core = s.slice(0, -pm[1].length); tail = pm[1]; }
    var GOD = core.match(/(入|帰|座|黙|走|戻|止ま|乗|下が|頑張|がんば|上が|曲が|登|渡|守|作|切|取|握|祈|踊|触|撮|送|残)れ$/);
    if (GOD) return core.slice(0, -1) + 'って' + (tail === 'よ' ? 'よ' : '');
    if (/(行け|出し切れ)$/.test(core)) return core.replace(/行け$/, '行って').replace(/出し切れ$/, '出し切って') + (tail === 'よ' ? 'よ' : '');
    var gm = core.match(/^(.*[一-鿿々])([けげせてべめれえ])$/);
    /* 「来て」「見て」などは、もともとて形（命令形ではない） */
    if (gm && gm[2] === 'て' && /(来|見|着|寝|出|居|似|煮|得|経|捨|当|育|慌|企|建|隔|果|捉)て$/.test(core)) return null;
    if (gm && !/の$/.test(gm[1].slice(0, -1)) && !GNOUN.test(core)) return gm[1] + GTE[gm[2]] + (tail === 'よ' ? 'よ' : '');
    var p = V.politeSentence(core, false, false);
    if (p !== core && /(て|で)ください$/.test(p) && p !== core + 'ください') return p.slice(0, -4) + (tail === 'よ' ? 'よ' : '');
    return null;
  }
  /* ---------- お願い・禁止 → 命令（強気） ---------- */
  var TE2IMP = [['やめて', 'やめろ'], ['待って', '待て'], ['来て', '来い'], ['見て', '見ろ'], ['聞いて', '聞け'], ['逃げて', '逃げろ'], ['離して', '離せ'], ['教えて', '教えろ'], ['止めて', '止めろ'], ['助けて', '助けろ'], ['どいて', 'どけ'], ['起きて', '起きろ'], ['寝て', '寝ろ'], ['行って', '行け'], ['言って', '言え'], ['黙って', '黙れ'], ['座って', '座れ'], ['立って', '立て'], ['急いで', '急げ'], ['走って', '走れ'], ['手伝って', '手伝え'], ['見せて', '見せろ'], ['貸して', '貸せ'], ['返して', '返せ'], ['出して', '出せ'], ['開けて', '開けろ'], ['閉めて', '閉めろ'], ['許して', '許せ'], ['信じて', '信じろ'], ['任せて', '任せろ'], ['食べて', '食え'], ['飲んで', '飲め'], ['休んで', '休め'], ['呼んで', '呼べ'], ['選んで', '選べ'], ['乗って', '乗れ'], ['帰って', '帰れ'], ['戻って', '戻れ'], ['笑って', '笑え'], ['動いて', '動け'], ['続けて', '続けろ'], ['答えて', '答えろ'], ['考えて', '考えろ'], ['して', 'しろ'], ['ついてきて', 'ついてこい'], ['おいで', '来い']];
  var NAIDE = [['しないで', 'するな'], ['見ないで', '見るな'], ['来ないで', '来るな'], ['言わないで', '言うな'], ['触らないで', '触るな'], ['笑わないで', '笑うな'], ['行かないで', '行くな'], ['泣かないで', '泣くな'], ['やめないで', 'やめるな'], ['離さないで', '離すな'], ['止めないで', '止めるな'], ['死なないで', '死ぬな'], ['逃げないで', '逃げるな'], ['近寄らないで', '近寄るな'], ['無理しないで', '無理するな'], ['置いていかないで', '置いていくな']];
  function harden(s, mode) {
    var i, k, pre;
    /* 「何が…起きて…」のように主語のあとのて形は、お願いではない */
    if (/が[…‥、\s]*[ぁ-ん一-鿿]{1,4}て$/.test(s)) return null;
    for (i = 0; i < NAIDE.length; i++) if (s.slice(-NAIDE[i][0].length) === NAIDE[i][0]) return s.slice(0, -NAIDE[i][0].length) + NAIDE[i][1];
    for (i = 0; i < TE2IMP.length; i++) {
      k = TE2IMP[i][0];
      if (s.slice(-k.length) !== k) continue;
      pre = s.slice(0, -k.length);
      if (k === 'して' && pre && !(/[、を\s]$/.test(pre) || /[ァ-ヶー]$/.test(pre) || (isKanji(pre.slice(-1)) && (isKanji(pre.slice(-2, -1)) || /[ァ-ヶー]/.test(pre.slice(-2, -1)))))) continue;
      /* 「何が…起きて…」のように主語のあとのて形は、お願いではない */
      if (/が[…‥、\s]*$/.test(pre)) continue;
      if (pre && /[ぁ-ん]$/.test(pre) && k.length <= 2 && !/[、をからでもにはがよねっ]$/.test(pre)) continue;
      return pre + TE2IMP[i][1];
    }
    if (/ないで$/.test(s)) return s + 'くれ';
    var isReq = /[てで]$/.test(s) && !/(なんで|ので|たりして|だりして|なんて|として|にして|って|けど|かもしれなくて|すぎて|ないで|くて|てで|せいで|おかげで|てて|でて)$/.test(s) && V.politeSentence(s, false, false) === s + 'ください';
    return isReq ? s + 'くれ' : null;
  }

  /* ---------- 一文ごとの整形 ---------- */
  function sentence(s0, who, ask, h, term) {
    var mode = who.persona, f = who.gender === 'f';
    var tail = (s0.match(/[っッー〜～…♡♪、]+$/) || [''])[0], s = s0.slice(0, s0.length - tail.length);
    if (!s || /^[ぁ-んァ-ヶー…っッ、\s]{1,2}$/.test(s)) return s0;
    var lead = (s.match(/^[…‥・、\s]+/) || [''])[0], body = s.slice(lead.length), out = null;
    if (!body) return s0;
    if (mode === 'proud' || mode === 'tsun' || mode === 'free') {
      if (/^(ありがとう(ございます|ございました)?|ありがと)$/.test(body)) out = { proud: '……礼は言っとく', tsun: '……ありがと。べ、別に、感謝してるわけじゃないから', free: 'ありがと！' }[mode];
      else if (/^(ごめん(ね|なさい)?|すみません|すまない|申し訳(ありません|ございません|ない)|失礼(しました|いたしました))$/.test(body)) out = { proud: '……悪かった', tsun: f ? '……悪かったわよ' : '……悪かったな', free: 'ごめんごめん' }[mode];
      else if (mode === 'tsun' && /^(好き|好きだ|好きです|大好き)(よ|だよ)?$/.test(body)) out = '……別に、嫌いじゃないだけ';
      else if (mode === 'tsun' && /^(嬉しい|うれしい)(です|よ)?$/.test(body)) out = '……別に、嬉しくなんか';
      else out = plainSentence(body, mode === 'proud' ? 'proud' : 'casual');
      var b2 = out || body;
      if (mode === 'proud') { var hd = ask ? null : harden(b2, 'proud'); if (hd) out = hd; }
      if (mode === 'proud' && !out && !ask && /[たるうくいてっ]の$/.test(b2) && !/(もの|この|その|あの|どの)$/.test(b2)) out = b2.replace(/の$/, 'んだ');
      if (mode === 'proud' && !out) {
        if (/(だ|た|い|ない)ね$/.test(b2)) out = b2.replace(/ね$/, 'な');
        /* 「記録するね」を「記録するな」にすると禁止に読めるので「ぞ」に */
        else if (/[るうくすつぬむぶぐ]ね$/.test(b2) && !ask) out = b2.replace(/ね$/, /([おこそとのほもよろごぞどぼょ]う|てる|ている)ね$/.test(b2) ? 'な' : 'ぞ');
        else if (/よね$/.test(b2) && !f) out = b2.replace(/よね$/, 'よな');
        else if (/[^な]の$/.test(b2) && ask) out = b2.replace(/の$/, WH.test(b2) ? 'んだ' : 'のか');
      }
      if (mode === 'free' && who.tone !== 'aniki' && !ask && !term && !/^[…‥っ]/.test(tail) && b2.length <= 8 && h % 2 === 0 && !/なさい$/.test(b2) && /[だいたるう]$/.test(out || body)) out = (out || body) + '！';
    } else if (mode === 'stern') {
      /* 厳格は敬語を使わない（「一人暮らしですか？」→「一人暮らしか？」） */
      if (!/^(ありがとうございま|すみません|ごめんなさい|申し訳)/.test(body)) { var pl = plainSentence(body, 'casual'); if (pl) { body = pl.replace(/でしょ$/, 'だろう').replace(/なの$/, ask ? (WH.test(body) ? 'なんだ' : 'なのか') : 'なのだ').replace(/ちょうだい$/, 'くれ'); out = body; } }
      var plain0 = out;
      if (/^(ごめん(ね|なさい)?|すみません|失礼(しました|いたしました))$/.test(body)) out = 'すまない';
      else if (/^(ありがとう|ありがと)(ございます|ございました)?$/.test(body)) out = '感謝する';
      else if (/^お願い$/.test(body)) out = '頼む';
      else {
        /* 厳格：くだけた誘い・言い回しを硬く（「言わない？」→「言わないか？」、「ごめんね、」→「すまない、」） */
        var bm = body;
        if (/^ごめん(ね|なさい)?、/.test(body)) body = body.replace(/^ごめん(ね|なさい)?、/, 'すまない、');
        if (/しなきゃ$/.test(body)) body = body.replace(/しなきゃ$/, 'せねばならない');
        else if (/なきゃ$/.test(body)) body = body.replace(/なきゃ$/, 'なければ');
        if (/なんだから$/.test(body)) body = body.replace(/なんだから$/, 'なのだから');
        if (ask && /[^ょ]ない$/.test(body)) body = body + 'か';
        if (ask && /てる$/.test(body)) body = body.replace(/てる$/, 'ているのか');
        out = ask ? null : harden(body, 'stern');
        if (!out && body !== bm) out = body;
        if (!out && /(だ|た|い|ない)ね$/.test(body) && !/くださいね$/.test(body)) out = body.replace(/ね$/, 'な');
        if (!out && /よね$/.test(body)) out = body.replace(/よね$/, 'よな');
        if (!out && /じゃん$/.test(body)) out = body.replace(/じゃん$/, 'ではないか');
        if (!out && /[^なさ]かな$/.test(body) && !ask) out = body.replace(/かな$/, 'か');
        if (!out && /[^な]の$/.test(body) && ask) out = body.replace(/の$/, WH.test(body) ? 'のだ' : 'のか');
        if (!out && /なの$/.test(body) && ask) out = body.replace(/なの$/, 'なのか');
        /* 厳格：やわらかい語尾を、硬い言い切りに（「分かってるね」→「分かっているな」） */
        var b4 = out || body;
        if (!ask) {
          if (/てる(ね|よ|よね)?$/.test(b4) && !/(当|捨|育|慌|企|建|隔|果|捉|立|探|保|充)てる(ね|よ|よね)?$/.test(b4)) b4 = b4.replace(/てる(ね|よ|よね)?$/, function (m, e) { return 'ている' + (e === 'ね' ? 'な' : e === 'よね' ? 'な' : ''); });
          else if (/[るうくすつぬむぶぐ]ね$/.test(b4)) b4 = b4.replace(/ね$/, /([おこそとのほもよろごぞどぼょ]う|てる|ている)ね$/.test(b4) ? 'な' : 'ぞ');
          else if (/だよ$/.test(b4)) b4 = b4.replace(/だよ$/, 'だ');
          else if (/[るうくすつぬむぶぐたい]よ$/.test(b4) && !/(でしょ|しよ|よう)$/.test(b4)) b4 = b4.replace(/よ$/, '');
          else if (/かな$/.test(b4)) b4 = b4.replace(/かな$/, 'か');
        }
        if (b4 !== body) out = b4;
        if (out == null && plain0 != null) out = plain0;
      }
    } else if (mode === 'gentle' || mode === 'devoted' || mode === 'shy') {
      out = soften(body);
      var b3 = out || body;
      if (/[ぞぜ]$/.test(b3) && !/(どうぞ|まぜ|かぜ|風)$/.test(b3) && /[だるたいうくすつむぬぶ][ぞぜ]$/.test(b3)) out = b3.replace(/[ぞぜ]$/, /だ[ぞぜ]$/.test(b3) ? 'よ' : 'よ');
      if (/だろう?$/.test(out || body)) out = (out || body).replace(/だろう?$/, 'でしょ');
      if (/^(くそ|クソ)っ?/.test(out || body)) out = (out || body).replace(/^(くそ|クソ)っ?/, mode === 'shy' ? 'う、うう' : 'もう');
      if (/[らかさたまわが]ねえ/.test(out || body)) out = (out || body).replace(/(.)([らかさたまわが])ねえ/g, function (m, p0, c) { return (c === 'た' && p0 === 'っ') || (c === 'わ' && /[たいるだよ]/.test(p0)) ? m : p0 + c + 'ない'; });
      /* やわらかい口調：荒い言い切り・問い詰めを、やわらかく（「呑気だな」→「呑気だね」、「大丈夫か？」→「大丈夫？」、「武器だ」→「武器だよ」） */
      var b5 = out || body;
      b5 = b5.replace(/よな(?=、)/g, 'よね');
      if (/だな$/.test(b5)) b5 = b5.replace(/だな$/, 'だね');
      else if (/よな$/.test(b5)) b5 = b5.replace(/よな$/, 'よね');
      else if (/(?:くれた|だった|やっぱり|やはり|満たした|そうだった)な$/.test(b5)) b5 = b5.replace(/な$/, 'ね');
      else if (ask && WH.test(b5) && /[^ん]だ$/.test(b5)) b5 = b5.replace(/だ$/, 'なの');
      else if (/かよ$/.test(b5)) b5 = b5.replace(/かよ$/, ask ? 'の' : 'なんて');
      else if (ask && /のか$/.test(b5)) b5 = b5.replace(/のか$/, 'の');
      else if (ask && /[^なかしのど何誰]か$/.test(b5) && !/[おこそとのほもよろごぞどぼょ]うか$/.test(b5) && !/(どう|ばか|バカ|まさか|なにか|何か|誰か|いくつか|です|ます|でしょう|ません|ました|でした)か$/.test(b5) && !/(どう|ばか|バカ|まさか|なにか|何か|誰か|いくつか)$/.test(b5)) b5 = b5.replace(/か$/, '');
      else if (WH.test(b5) && /[んの]だよ$/.test(b5)) b5 = b5.replace(/[んの]だよ$/, 'の');
      else if (WH.test(b5) && /だよ$/.test(b5)) b5 = b5.replace(/だよ$/, 'なの');
      else if (!ask && !term.match(/^[！!]/) && /[^んのなそ]だ$/.test(b5) && b5.length >= 3 && !/(だめ|ダメ|まだ|ただ|あいだ|間だ)$/.test(b5)) b5 = b5 + 'よ';
      if (b5 !== (out || body)) out = b5;
      if (mode === 'shy' && h % 3 === 0 && /^[ぁ-ん]/.test(out || body) && (out || body).length >= 3 && !/^.、/.test(out || body) && !/^.、/.test(s0)) out = (out || body).charAt(0) + '、' + (out || body);
    }
    if (out != null && /…$/.test(lead) && /^…/.test(out)) out = out.replace(/^…+/, '');
    /* 決まった言い換え（「礼は言っとく」など）には、元の伸ばし（「ありがとー」の「ー」）を付けない */
    if (out != null && /^[ー〜～]/.test(tail) && out.slice(-1) !== body.slice(-1)) tail = tail.replace(/^[ー〜～]+/, '');
    return out == null ? s0 : lead + out + tail;
  }
  var YOU = /お前さん|おまえさん|(?:お前|おまえ|あんた|てめえ|貴様|あなた)(?!さん|方)|(?:きみ|(?<![大姫主父母諸細若暴])君)(?=(?:たち|達|ら|は|が|も|の|を|に|と|で|って|、|。|！|？|…|」|$|さ|ね|よ|なんか|なら|だけ|しか|だ|じゃ|より|まで|かも|こそ|か|な|から|へ|や|一人|自身))/g;
  var YOU_FOR = { proud: 'お前', tsun: 'あんた', gentle: 'きみ', devoted: 'あなた', shy: 'あなた' };

  /* 丁寧語をくだけた言い方に（口調の追加：tone-plus.js から使う） */
  /* midOnly：文の途中（読点・「…」の前）の丁寧語だけを外し、文末はそのままにする */
  V.casualQuote = function (q, midOnly) {
    var parts = q.split(/([。！？!?\n]+)/);
    return parts.map(function (seg, i) {
      if (i % 2) return seg;
      var tail = (seg.match(/[っッー〜～…♡♪、]+$/) || [''])[0], s = seg.slice(0, seg.length - tail.length);
      var lead = (s.match(/^[…‥・、\s]+/) || [''])[0], body = s.slice(lead.length);
      if (!body) return seg;
      /* 「すき、です……っ、すき」のように、文の途中で丁寧に言い切っている所も直す */
      body = body.replace(/(どう|いかが)ですか、/g, 'どう、').replace(/^すみません、/, 'ごめん、');
      var bits = body.split(/([…‥、っ]+)/);
      if (bits.length > 1) body = bits.map(function (b, j) { if (j % 2 || j === bits.length - 1 || !/(です|ます|ません|でした|ました|ください)(?:よね|よ|ね)?(?:が|けど|けれど|けれども|から|ので|し)?$/.test(b)) return b; var r = plainOne(b); return r == null ? b : r; }).join('').replace(/^([^、]*?)、([…‥っ]+)/, function (m, a, t) { return /[…‥]/.test(t) ? a + t : m; });
      if (midOnly) return lead + body + tail;
      var o = plainOne(body);
      return o == null ? lead + body + tail : lead + o + tail;
    }).join('');
  };
  function plainOne(b) {
    var b0 = b;
    b = b.replace(/(無理|だめ|ダメ|大丈夫|平気)です(?=(?:無理|だめ|ダメ|大丈夫|平気))/g, '$1').replace(/てませんように/g, 'てないように');
    if (/^(です|ます)$/.test(b)) return '';
    if (/^(すみません|失礼しました|失礼いたしました)$/.test(b)) return 'すまない';
    /* 「〜ますが」「〜ですけど」「〜ますから」：つなぎの言葉の前の丁寧語も外す */
    var cj = b.match(/^(.*(?:です|ます|ません|でした|ました|ましょう))(が|けど|けれど|けれども|から|ので|し)$/);
    if (cj) { var cr = /[…‥、っ]です$/.test(cj[1]) ? cj[1].slice(0, -2) + 'だ' : plainOne(cj[1]); if (cr == null) return null; if (cr === '') cr = 'だ'; if (cj[2] === 'ので' && /だ$/.test(cr)) cr = cr.slice(0, -1) + 'な'; return cr + cj[2]; }
    if (/[ちじ]ゃいます$/.test(b)) return b.replace(/([ちじ])ゃいます$/, '$1ゃう');
    if (/[ちじ]ゃいました$/.test(b)) return b.replace(/([ちじ])ゃいました$/, '$1ゃった');
    var tm = b.match(/^(.*)(ちゃ|じゃ)([…‥、っ]+)ます$/);
    if (tm) return tm[1] + tm[2] + 'う' + tm[3].replace(/、$/, '');
    tm = b.match(/^(.*?)([…‥、っ]+)(です|ます)$/);
    if (tm) return tm[1] + tm[2].replace(/、$/, '');
    if (/ありがとうございま(す|した)$/.test(b)) return b.replace(/ございま(す|した)$/, '');
    var m = b.match(/^(.*?)(大丈夫|平気|お願い|好き|すき|本当|ほんと|嬉しい|うれしい|幸せ|だめ|ダメ|無理)です$/);
    if (m) return m[1] + m[2];
    var r = plainSentence(b, 'casual');
    return r == null && b !== b0 ? b : r;
  }
  /* q: 台詞の中身、who: { persona, gender, ... } */
  V.styleQuote = function (q, who) {
    var mode = who && who.persona;
    if (!q) return q;
    /* 男性の台詞から、女性的な語尾を外す */
    /* 男性、または性別なしで強気・厳格・冷静の口調なら、女性的な語尾を外す */
    if (who && (who.gender === 'm' || (who.gender !== 'f' && /^(proud|stern|cool|free)$/.test(who.persona)))) q = q.replace(/ものよ(?=[。！？…、]|$)/g, 'ものだ').replace(/あらあら/g, 'おやおや').replace(/かしら(?=[。！？…」]|$)/g, 'かな').replace(/(だ|た|い)わよ(?=[。！？…、]|$)/g, '$1よ').replace(/([^ぁ-ん])わよ(?=[。！？…、]|$)/g, '$1だよ').replace(/のよ(?=[。！？…、]|$)/g, 'んだよ').replace(/(だ|た)わね(?=[。！？…、]|$)/g, '$1ね').replace(/だわ(?=[。！？…、]|$)/g, 'だ').replace(/(てる|ない|たい|しい)わ(?=[。！？…、]|$)/g, '$1よ').replace(/([るうくすつぬむぐぶ])わよ(?=[。！？…、]|$)/g, '$1よ').replace(/([るうくすつぬむぐぶい])わね(?=[。！？…、]|$)/g, '$1ね').replace(/なのね(?=[。！？…、]|$)/g, 'なんだね');
    if (!mode || mode === 'polite') return q;
    /* 敬語を使わない口調：文の途中の「〜ですから、」「〜ますが、」も外す（文末は下の一文ごとの整形で） */
    if (/^(proud|tsun|free|stern)$/.test(mode)) q = V.casualQuote(q, true);
    var h = hash(q + (who.name || ''));
    var you = YOU_FOR[mode];
    if (you) q = q.replace(/(お前ら|おまえら|あんたら|てめえら|お前たち|あんたたち|君たち|きみたち|あなたたち)/g, { proud: 'お前ら', tsun: 'あんたたち', gentle: 'きみたち', devoted: 'みなさん', shy: 'みなさん' }[mode]).replace(/みなさんたち/g, 'みなさん');
    if (you) q = q.replace(YOU, function (m) { if ((m === '君' || m === 'きみ') && mode === 'stern') return m; return you; });
    if (mode === 'cool') {
      /* 冷静は敬語を使わず、語尾も淡々と */
      q = V.casualQuote(q).replace(/じゃん(?=[。！？…、」]|$)/g, 'じゃないか').replace(/でしょ(?=[。！？…、」]|$)/g, 'だろう').replace(/ちょうだい(?=[。！？…、」]|$)/g, 'くれ');
      return q.replace(/！+(?=[？?])/g, '').replace(/！+[　 ]*(?=.)/g, '。').replace(/[！!]+$/, '').replace(/。。+/g, '。');
    }
    var parts = q.split(/([。！？!?\n]+)/);
    q = parts.map(function (seg, i) { return i % 2 ? seg : sentence(seg, who, /[？?]/.test(parts[i + 1] || ''), h + i, parts[i + 1] || ''); }).join('');
    if (mode === 'shy' && h % 5 === 1 && !/^…/.test(q) && q.length >= 4) q = '……' + q;
    /* 健気は敬語（見本：「精一杯がんばります」）。健気（くだけた）は tone-plus.js で敬語を外す。関西弁は敬語にしない */
    if (mode === 'devoted' && who.tone !== 'devoted_p' && who.tone !== 'kansai' && V.polite) q = V.polite(q);
    /* 語尾に足した「！」と伸ばし・句点の重なり（「ありがと！ー！」「ごめんごめん！。」） */
    return q.replace(/！([ー〜])/g, '$1').replace(/！。/g, '！');
  };
})();
