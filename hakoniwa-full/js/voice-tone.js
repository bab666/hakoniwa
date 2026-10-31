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
  var ICHI = /(起き|生き|落ち|信じ|感じ|閉じ|浴び|借り|降り|過ぎ|すぎ|足り|伸び|満ち|飽き|尽き|老い|報い|できる|でき)$/;
  var FORMS = { 'する': ['する', 'しない', 'した', 'しよう'], 'くる': ['くる', 'こない', 'きた', 'こよう'], '来る': ['来る', '来ない', '来た', '来よう'], 'いる': ['いる', 'いない', 'いた', 'いよう'], 'ある': ['ある', 'ない', 'あった', 'あろう'], 'できる': ['できる', 'できない', 'できた', 'しよう'], '行く': ['行く', '行かない', '行った', '行こう'], 'いく': ['いく', 'いかない', 'いった', 'いこう'] };
  var FI = { u: 0, nai: 1, ta: 2, vol: 3 };
  /* 連用形の語幹 stem を活用させる（form: u 言い切り / nai 否定 / ta 過去 / vol 意向） */
  function conj(stem, form) {
    var fi = FI[form], irr = null, cut = 0;
    if (/でき$/.test(stem)) { irr = 'できる'; cut = 2; }
    else if (/(^|[^ぁ-ん]|[はがもにでと、くてりい])あり$/.test(stem) || stem === 'あり' || /(では|じゃ|て|で)あり$/.test(stem)) { irr = 'ある'; cut = 2; }
    else if (/行き$/.test(stem)) { irr = '行く'; cut = 2; }
    else if (/[てで]いき$/.test(stem) || stem === 'いき') { irr = 'いく'; cut = 2; }
    else if (stem === 'い' || /[てで]い$/.test(stem) || (/[ぁ-んァ-ヶー、\s]い$/.test(stem) && !/(ととのい|もらい|しまい|かまい|ちがい|あらい|うたい|あい|かい|すい|ぬぐい|はらい|わらい|まよい|ねがい|つかい|おもい|いい)$/.test(stem))) { irr = 'いる'; cut = 1; }
    else if (stem === 'き' || /[てで]き$/.test(stem)) { irr = 'くる'; cut = 1; }
    else if (/来$/.test(stem)) { irr = '来る'; cut = 1; }
    else if (/し$/.test(stem)) {
      var b1 = stem.slice(-2, -1), b2 = stem.slice(-3, -2);
      var sahen = stem === 'し' || /(何|とか)し$/.test(stem) || /([ぁ-んァ-ヶ]{2})\1し$/.test(stem) || (b1 === 'が' && !/(逃|焦|転|騒|揺る|剥|脱|泳|急|嗅|稼|注|仰|繋)がし$/.test(stem)) || /[ァ-ヶーにとうくでをよいもは]/.test(b1) || (isKanji(b1) && (isKanji(b2) || /[ァ-ヶー]/.test(b2)))
        /* 「手当てし」「おかけし」「お知らせし」：名詞・謙譲の「お〜」のあとの「し」はサ変 */
        || /(?:当て|かけ|掛け|付け|受け|詫び|知らせ|任せ|合わせ|仕上げ|届け|待たせ|見せ|お[一-鿿]?[ぁ-ん]{1,3})し$/.test(stem) && !/(?:て|で)し$/.test(stem.replace(/(?:当て|お[一-鿿]?[ぁ-ん]{1,3})し$/, 'し'));
      /* 「全部出し」「全部話し」：副詞的な名詞のあとの一字の動詞は、サ変ではない */
      if (/(全部|全て|一度|一回)[出話探返渡貸消残戻押回落起干試指隠許殺倒通直足]し$/.test(stem)) sahen = false;
      if (sahen) { irr = 'する'; cut = 1; }
    }
    if (irr) return stem.slice(0, stem.length - cut) + FORMS[irr][fi];
    var c = stem.slice(-1), pre = stem.slice(-2, -1);
    /* 「人います」「猫います」：名詞のあとの「い」は「いる」（「言い」「会い」などの動詞は除く） */
    if (c === 'い' && isKanji(pre) && !/[言思会買使払笑願迷歌洗拭誘違吸追争祝救狙雇酔結揃匂舞這繕伴担戦失奪補従扱漂味叶通構呪貰養行誓拾庇伺敬繕問負合占縫狂]/.test(pre)) return stem.slice(0, -1) + FORMS['いる'][fi];
    var ichidan = /[えけげせぜてでねへべめれ]$/.test(stem) || /[てで]み$/.test(stem) || ICHI.test(stem) || (isKanji(c) && !I2U[c]);
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
    /* 「確認します」「お受けします」「お断りします」（する動詞）→「確認する」など。一字の漢字＋「します」は五段（「話します」→「話す」）なので除く */
    if ((m = s.match(/^(.*?(?:[一-鿿々]{2,}|[ァ-ヶー]{2,}|お[一-鿿]{1,2}[ぁ-ん]?[いきしちにびみりけげせてねべめれ]|受け|断り))し(ます|ました|ません|ましょう)$/)) && !/(全部|全て|一度|一回)[出話探返渡貸消残戻押回落起干試指隠許殺倒通直足]$/.test(m[1])) return m[1] + { 'ます': 'する', 'ました': 'した', 'ません': 'しない', 'ましょう': 'しよう' }[m[2]];
    if (/[ちじ]ゃいます$/.test(s)) return s.replace(/([ちじ])ゃいます$/, '$1ゃう');
    if (/[ちじ]ゃいましょう$/.test(s)) return s.replace(/([ちじ])ゃいましょう$/, '$1ゃおう');
    if (/[ちじ]ゃいました$/.test(s)) return s.replace(/([ちじ])ゃいました$/, '$1ゃった');
    if ((m = s.match(/^(.*)ませんでした$/))) { var n0 = conj(m[1], 'nai'); return n0 ? n0.replace(/ない$/, 'なかった') : null; }
    if ((m = s.match(/^(.*)ません$/))) return conj(m[1], 'nai');
    if ((m = s.match(/^(.*)ましょう$/))) return conj(m[1], 'vol');
    /* 「ありがとうございました」は動詞の「〜ました」ではない（一言なら丁寧なまま、文の一部なら「ありがとう」） */
    if (/^ありがとうございま(?:す|した)$/.test(s)) return null;
    if (/ありがとうございま(?:す|した)$/.test(s)) return s.replace(/ありがとうございま(?:す|した)$/, 'ありがとう');
    if ((m = s.match(/^(.*)ました$/))) return conj(m[1], 'ta');
    if ((m = s.match(/^(.*)ます$/))) return conj(m[1], 'u');
    if (/かったです$/.test(s)) return s.replace(/です$/, '');
    if (/でした$/.test(s)) return s.replace(/でした$/, 'だった');
    /* クイズの「誰でしょう？」「なんて書いたでしょう？」は、独り言の「だろ」にせず「〜と思う？」に */
    if (/でしょう$/.test(s) && rough && /(何|なに|なん|誰|だれ|どこ|いつ|どう|どれ|どっち|どんな|どの|なぜ)/.test(s)) return s.replace(/でしょう$/, /[たるいうくすつむぬぶぐ]でしょう$/.test(s) ? 'と思う' : 'だと思う');
    if (/でしょう$/.test(s)) return s.replace(/でしょう$/, rough ? 'だろ' : 'でしょ');
    if (/んです$/.test(s)) return s.replace(/んです$/, 'んだ');
    if (/(きれい|綺麗|嫌い|きらい|大嫌い)です$/.test(s)) return s.replace(/です$/, 'だ');
    if (/[^し]いです$/.test(s) || /(ない|たい|しい)です$/.test(s)) return s.replace(/です$/, '');
    if (/です$/.test(s)) return s.replace(/です$/, 'だ');
    if (/(て|で)ください$/.test(s)) return s.replace(/ください$/, rough ? 'くれ' : '');
    if (/ください$/.test(s)) return s.replace(/ください$/, rough ? 'くれ' : 'ちょうだい');
    return null;
  }
  var PPART = /(よね|ね|よ|か)$/;
  function plainSentence(s, mode) {
    var r0 = plainSentence0(s, mode);
    /* 丁寧語を外したあとに残る謙譲語・尊敬語を、ふつうの言い方に */
    return r0 == null ? r0 : r0.replace(/いただけ(?=る|ない|た)/g, 'もらえ').replace(/(ない|しい|たい|かった|いい)だ(?=よね$|よ$|ね$)/, '$1').replace(/させていただく$/, 'させてもらう').replace(/ていただく$/, 'てもらう').replace(/お喜びいただいた/g, '喜んでもらった').replace(/いただいた(?=[^ぁ-ん]|$)/g, 'もらった').replace(/参る(?=[ねよ]?$)/, 'いく').replace(/お一人ずつ/g, '一人ずつ');
  }
  function plainSentence0(s, mode) {
    var rough = mode === 'proud', s1 = s;
    /* 「〜ますから」「〜ですけど」：つなぎの言葉の前の丁寧語も外す */
    var cj = s.match(/^(.*(?:です|ます|ません|でした|ました|ましょう))(が|けど|けれど|けれども|から|ので|し)$/);
    if (cj) { var cr = /^(です|ます)$/.test(cj[1]) ? 'だ' : plainSentence(cj[1], mode); if (cr == null) return null; if (cj[2] === 'ので' && /だ$/.test(cr)) cr = cr.slice(0, -1) + 'な'; return cr + cj[2]; }
    s = s.replace(/くださいませ$/, 'ください').replace(/ありがとう、ございま(?:す|した)$/, 'ありがとう').replace(/^お疲れ(?:さま|様)(?:でした|です)$/, 'お疲れ').replace(/(ごちそう|ご馳走|お粗末|お疲れ|おつかれ)(さま|様)(?:でした|です)$/, '$1$2').replace(/ございません$/, 'ありません').replace(/(?<!ありがとう、?)ございました$/, 'ありました').replace(/([てで])おり(ます|ました|ません|ましょう)/, '$1い$2').replace(/おります$/, 'いる').replace(/でございます$/, 'だ').replace(/でございました$/, 'だった').replace(/(?<!おはよう|おめでとう|ありがとう、?)ございます$/, 'ある').replace(/いたします$/, 'する').replace(/いたしました$/, 'した').replace(/いたしましょう$/, 'しよう');
    if (/^(ありがとうございます|ありがとうございました)$/.test(s)) return null;
    /* 「範囲でしょうか」→「範囲なの／範囲か」、「行くでしょうか」→「行くの／行くのか」 */
    if (/.でしょうか$/.test(s)) { var nn = /[一-鿿ァ-ヶー]でしょうか$/.test(s); return s.replace(/でしょうか$/, rough ? (nn ? 'か' : 'のか') : (nn ? 'なの' : 'の')); }
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
      if (/(?<!さ)んですか$/.test(s)) return s.replace(/んですか$/, rough ? (WH.test(s) ? 'んだ' : 'のか') : 'の');
      if (/いですか$/.test(s)) return s.replace(/ですか$/, rough ? 'のか' : 'の');
      /* 「多くなかったですか」→「多くなかったの」（「〜たなの」にしない） */
      if (/たですか$/.test(s)) return s.replace(/ですか$/, 'のか');
      return s.replace(/ですか$/, rough ? (WH.test(s) ? 'だ' : /(好き|嫌い|苦手|得意)ですか$/.test(s) ? 'なのか' : 'か') : 'なの');
    }
    var rc = plainCore(rest, rough) || (/(が|けど|けれど|から|ので|し)$/.test(rest) && rest !== s ? plainSentence(rest, mode) : null);
    if (!rc) return null;
    if (p === 'か' && /[よお]う$/.test(rc)) return rc + 'か';
    if (p === 'ね' && /でしょ$/.test(rc)) return rc + 'うね';
    if (p === 'ね' && rough && /よろしく$/.test(rc)) return rc;
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
  var GNOUN = /(清め|潰れ|仕掛け|負け|賭け|助け|流れ|別れ|疲れ|遅れ|恐れ|晴れ|憧れ|汚れ|乱れ|揺れ|崩れ|外れ|生まれ|受け|儲け|分け|明け|抜け|焼け|情け|化け|群れ|切れ|売れ|触れ|慣れ|照れ|腫れ|痺れ|攣れ|捩れ|狙え|見え|答え|考え|教え|支え|鍛え|構え|迎え|訴え|蓄え|植え|飢え|冷え|震え|甘え|怯え|越え|超え|手当て|目当て|仕立て|見立て|組み立て|子育て|手立て|企て|隔て|当て|捨て|果て|責め|攻め|眺め|締め|戒め|勧め|決め|詰め|初め|始め|諦め|慰め|並べ|調べ|比べ|述べ|重ね|真似|束ね|兼ね|尋ね|跳ね|寝|任せ|知らせ|幸せ|合わせ|仕合せ|寄せ|見せ|着せ|乗せ|載せ|浴びせ|出せ|入れ|逃げ|上げ|下げ|投げ|揚げ|曲げ|焦げ|開け|止め|閉め|眺め|集め|求め|染め|込め|笑顔|姉|兄|手|目|歯|芽|胸|腕|指|舌|耳|首|腰)$/;
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
    if (gm && gm[2] === 'て' && /(来|見|診|着|寝|出|居|似|煮|得|経|捨|当|育|慌|企|建|隔|果|捉)て$/.test(core)) return null;
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
    if (/が[…‥、\s]*[ぁ-ん一-鿿]{1,4}て$/.test(s) || /失礼して$/.test(s)) return null;
    for (i = 0; i < NAIDE.length; i++) if (s.slice(-NAIDE[i][0].length) === NAIDE[i][0]) return s.slice(0, -NAIDE[i][0].length) + NAIDE[i][1];
    for (i = 0; i < TE2IMP.length; i++) {
      k = TE2IMP[i][0];
      if (s.slice(-k.length) !== k) continue;
      pre = s.slice(0, -k.length);
      if (k === 'して' && pre && !(/[、を\s]$/.test(pre) || /[ァ-ヶー]$/.test(pre) || (isKanji(pre.slice(-1)) && (isKanji(pre.slice(-2, -1)) || /[ァ-ヶー]/.test(pre.slice(-2, -1)))))) continue;
      /* 「何が…起きて…」のように主語のあとのて形は、お願いではない */
      if (/が[…‥、\s]*$/.test(pre)) continue;
      /* 「〜だって聞いて」「〜と聞いて」は、聞いた話（お願いではない） */
      if (k === '聞いて' && /((?<!思)って|と)$/.test(pre)) continue;
      /* 「待って待って」の後ろだけを「待て」にしない */
      if (k === '待って' && /待って$/.test(pre)) continue;
      /* 「緊張して」「興奮して」は気持ちの言いさし（命令ではない） */
      if (k === 'して' && /(緊張|興奮|動揺|混乱|感動|後悔|苦労|安心|納得|困惑)$/.test(pre)) continue;
      if (pre && /[ぁ-ん]$/.test(pre) && k.length <= 2 && !/[、をからでもにはがよねっ]$/.test(pre)) continue;
      return pre + TE2IMP[i][1];
    }
    if (/ないで$/.test(s)) return s + 'くれ';
    var isReq = /[てで]$/.test(s) && !/((?:緊張|興奮|動揺|混乱|感動|後悔|苦労|安心|納得|困惑)して|(?<!思)って聞いて|と聞いて|われて|られて|されて|なんで|ので|たりして|だりして|なんて|として|にして|って|けど|かもしれなくて|すぎて|ないで|くて|てで|せいで|おかげで|てて|でて)$/.test(s) && V.politeSentence(s, false, false) === s + 'ください';
    return isReq ? s + 'くれ' : null;
  }

  /* ---------- 厳格の短い返事・相づち（2026-10-31 TS7） ----------
     文の頭の相づち（うん・ううん・そっか・へえ・ふーん・あのさ・まじ）と、短い文（12 字以下）の砕けた文末（〜ね・名詞＋よ・かも・〜っか・〜なんだ）を硬い言い方に */
  var STERN_HEAD = [[/^うん(?:、うん)?(?=[、…‥]|$)/, 'ああ'], [/^ううん(?=[、…‥]|$)/, 'いや'], [/^そっか(?=[、…‥]|$)/, 'そうか'], [/^へえ(?=[、…‥]|$)/, 'ほう'], [/^ふーん(?=[、…‥]|$)/, 'ふむ'],
    [/^あのさ(?=[、…‥]|$)/, 'いいか'], [/^え、(?:まじ|マジ)(?:で)?$/, '本当か'], [/^(?:まじ|マジ)(?:で)?$/, '本当か'], [/^いいよ、/, 'いい、'], [/^いいじゃん、/, 'いいだろう、'], [/^はいはい$/, '分かった、分かった'],
    [/^(?:また、ね|またね)$/, 'またな'], [/^おはよ$/, 'おはよう'], [/^ありがとね$/, '感謝する'], [/^だいじょぶ$/, '大丈夫だ'], [/^それな$/, 'その通りだ'], [/^お疲れ$/, 'ご苦労'],
    [/^だね$/, 'そうだな'], [/^なるほどね$/, 'なるほどな'], [/(^|、)そうなんだ$/, '$1そうなのか'], [/^変なの$/, '妙だな'], [/^わかんない$/, '分からない'], [/^なんか(?=[一-鿿ぁ-ゖ])/, '何か'],
    [/^(行こ|帰ろ|寝よ|始めよ|やろ)っか$/, function (m, v) { return { '行こ': '行くか', '帰ろ': '帰るか', '寝よ': '寝るか', '始めよ': '始めるか', 'やろ': 'やるか' }[v]; }],
    [/^(行こ|帰ろ|寝よ|始めよ|やろ)$/, '$1う']];
  function sternShort(b, ask) {
    for (var i = 0; i < STERN_HEAD.length; i++) b = b.replace(STERN_HEAD[i][0], STERN_HEAD[i][1]);
    if (b.replace(/[…‥、\s　]/g, '').length > 12) return b;
    return b.replace(/(?:かもね|かも)$/, 'かもしれない').replace(/(たら|れば|なら)ね$/, '$1な')
      .replace(/([一-鿿ァ-ヶー]{2,})よ$/, '$1だ')
      .replace(/^([一-鿿]{1,3})$/, function (m, w) { return ask && /^(本当|平気|大丈夫|無事|本気|正気)$/.test(w) ? w + 'か' : m; });
  }

  /* ---------- 一文ごとの整形 ---------- */
  function sentence(s0, who, ask, h, term) {
    var mode = who.persona, f = who.gender === 'f';
    var tail = (s0.match(/[っッー〜～…♡♪、]+$/) || [''])[0], s = s0.slice(0, s0.length - tail.length);
    /* 厳格の 2 字の相づち（2026-10-31 TS7）：「うん」→「ああ」、「だね」→「そうだな」、「へえ」→「ほう」 */
    if (mode === 'stern' && /^(?:うん|だね|へえ)$/.test(s)) return { 'うん': 'ああ', 'だね': 'そうだな', 'へえ': 'ほう' }[s] + tail;
    if (!s || /^[ぁ-んァ-ヶー…っッ、\s]{1,2}$/.test(s)) return s0;
    var lead = (s.match(/^[…‥・、\s]+/) || [''])[0], body = s.slice(lead.length), out = null;
    if (!body) return s0;
    /* 「？」のない「〜ですか」「〜ますか」も問いかけ */
    if (/(です|ます|でしょう)か$/.test(body)) ask = true;
    if (mode === 'proud' || mode === 'tsun' || mode === 'free') {
      if (/^(ありがとう(ございます|ございました)?|ありがと)$/.test(body)) out = { proud: '……礼は言っとく', tsun: '……ありがと。べ、別に、感謝してるわけじゃないから', free: who.tone === 'hero' ? 'ありがと' : 'ありがと！' }[mode];
      else if (/^(ごめん(ね|なさい)?|すみません|すまない|申し訳(ありません|ございません|ない)|失礼(しました|いたしました))$/.test(body)) out = { proud: '……悪かった', tsun: f ? '……悪かったわよ' : '……悪かったな', free: null }[mode];
      else if (mode === 'tsun' && /^(好き|好きだ|好きです|大好き)(よ|だよ)?$/.test(body)) out = '……す、好き。……悪い？';
      else if (mode === 'tsun' && /^(嬉しい|うれしい)(です|よ)?$/.test(body)) out = '……別に、嬉しくなんか';
      else out = plainSentence(body, mode === 'proud' ? 'proud' : 'casual');
      /* 奔放の女性は、男っぽい命令（「選ばせろ」「聞かせろ」「飲め」）をお願いの形に（「選ばせて」「聞かせて」「飲んで」） */
      /* 熱血・兄貴分・ヤンキーは、女性でも命令は命令のまま（「伏せろ！」を「伏せて！」にしない） */
      if (mode === 'free' && f && !/^(?:hero|aniki|yankee)$/.test(who.tone)) {
        var sf = /って$/.test(body) ? null : soften(out || body); if (sf) out = sf;
        /* 「お前」→「あんた」、「行くぞ」→「行くよ」 */
        var sx = (out || body).replace(/お前(?=[^らた達]|$)/g, 'あんた'); if (!tail) sx = sx.replace(/(?<!どう)ぞ$/, 'よ');
        if (sx !== (out || body)) out = sx;
      }
      var b2 = out || body;
      if (mode === 'proud') { var hd = ask ? null : harden(b2, 'proud'); if (hd) out = hd; }
      if (mode === 'proud' && !out && !ask && /[たるうくいてっ]の$/.test(b2) && !/(もの|この|その|あの|どの)$/.test(b2)) out = b2.replace(/の$/, 'んだ');
      if (mode === 'proud' && !out) {
        if (/(だ|た|い|ない)ね$/.test(b2)) out = b2.replace(/ね$/, 'な');
        /* 「記録するね」を「記録するな」にすると禁止に読めるので「ぞ」に */
        else if (/[るうくすつぬむぶぐ]ね$/.test(b2) && !ask) out = b2.replace(/ね$/, /よろしくね$/.test(b2) ? '' : /([おこそとのほもよろごぞどぼょ]う|てる|ている)ね$/.test(b2) ? 'な' : 'ぞ');
        else if (/よね$/.test(b2) && !/[てで]よね$/.test(b2) && !f) out = b2.replace(/よね$/, 'よな');
        else if (/[^な]の$/.test(b2) && ask && !/(もの|この|その|あの|どの)$/.test(b2)) out = b2.replace(/の$/, WH.test(b2) ? 'んだ' : 'のか');
      }
      /* 伸ばし（「下がるー」）や「……」で沈んだ文（「…わかった」）には「！」を足さない */
      if (mode === 'free' && who.tone !== 'aniki' && who.tone !== 'hero' && !ask && !term && !tail && !lead && b2.length <= 8 && h % 2 === 0 && !/なさい$/.test(b2) && /[だいたるう]$/.test(out || body)) out = (out || body) + '！';
    } else if (mode === 'stern') {
      /* 厳格は敬語を使わない（「一人暮らしですか？」→「一人暮らしか？」） */
      /* 厳格：若い口語の言い回しを硬く（「ねえ、」「えへへ」「ほんと」「じゃあ、」「ごめん、」） */
      var bodyS = body;
      body = body.replace(/^(?:ねえ|ねぇ)、/, 'おい、').replace(/えへへ/g, 'ふっ').replace(/ほんと(?=[、に無]|$)/g, '本当に').replace(/本当にに/g, '本当に').replace(/^じゃあ、/, 'では、').replace(/^ごめん(?:ね)?、/, 'すまない、');
      /* 2026-10-31（TS7）：短い返事・相づち・掛け声の砕けた形も硬く（「うん」→「ああ」、「そっか」→「そうか」、「まじで？」→「本当か？」、「またね」→「またな」、「かもね」→「かもしれない」）。
         利用者の報告「厳格も短い台詞だと砕けすぎ」。1本で書かれた台詞だけ（3本の台詞は硬い常体のベースを使う） */
      body = sternShort(body, ask);
      if (body !== bodyS) out = body;
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
        /* 「見てて」「待ってて」→「見ていろ」「待っていろ」 */
        if (!ask && /(?:見|待っ|聞い|黙っ)てて$/.test(body)) body = body.replace(/てて$/, 'ていろ');
        out = ask ? null : harden(body, 'stern');
        if (!out && body !== bm) out = body;
        if (!out && /(だ|た|い|ない)ね$/.test(body) && !/くださいね$/.test(body)) out = body.replace(/ね$/, 'な');
        if (!out && /よね$/.test(body) && !/[てで]よね$/.test(body)) out = body.replace(/よね$/, 'よな');
        if (!out && /じゃん$/.test(body)) out = body.replace(/じゃん$/, 'ではないか');
        if (!out && /[^なさ]かな$/.test(body) && !ask) out = body.replace(/かな$/, 'か');
        if (!out && /[^な]の$/.test(body) && ask) out = body.replace(/の$/, WH.test(body) ? 'のだ' : 'のか');
        /* 「どこ行ってたのだ」→「どこ行っていたのだ」（縮めた言い方と硬い語尾を混ぜない） */
        if (out && /[てで]た(のだ|のか)$/.test(out)) out = out.replace(/([てで])た(のだ|のか)$/, '$1いた$2');
        if (!out && /なの$/.test(body) && ask) out = body.replace(/なの$/, 'なのか');
        /* 厳格：やわらかい語尾を、硬い言い切りに（「分かってるね」→「分かっているな」） */
        var b4 = out || body;
        if (!ask) {
          if (/てる(ね|よ|よね)?$/.test(b4) && !/(当|捨|育|慌|企|建|隔|果|捉|立|探|保|充|勝|待|持|打|放|撃)てる(ね|よ|よね)?$/.test(b4)) b4 = b4.replace(/てる(ね|よ|よね)?$/, function (m, e) { return 'ている' + (e === 'ね' ? 'な' : e === 'よね' ? 'な' : ''); });
          else if (/[るうくすつぬむぶぐ]ね$/.test(b4)) b4 = b4.replace(/ね$/, /よろしくね$/.test(b4) ? '' : /([おこそとのほもよろごぞどぼょ]う|てる|ている)ね$/.test(b4) ? 'な' : 'ぞ');
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
      if (/だろう?$/.test(out || body) && !/んだろう?$/.test(out || body)) out = (out || body).replace(/だろう?$/, 'でしょ');
      if (/^(くそ|クソ)っ?/.test(out || body)) out = (out || body).replace(/^(くそ|クソ)っ?/, mode === 'shy' ? 'う、うう' : 'もう');
      if (/[らかさたまわが]ねえ/.test(out || body)) out = (out || body).replace(/(.)([らかさたまわが])ねえ/g, function (m, p0, c) { return (c === 'た' && p0 === 'っ') || (c === 'わ' && /[たいるだよ]/.test(p0)) ? m : p0 + c + 'ない'; });
      /* やわらかい口調：荒い言い切り・問い詰めを、やわらかく（「呑気だな」→「呑気だね」、「大丈夫か？」→「大丈夫？」、「武器だ」→「武器だよ」） */
      var b5 = out || body;
      b5 = b5.replace(/よな(?=、)/g, 'よね');
      if (/だな$/.test(b5)) b5 = b5.replace(/だな$/, 'だね');
      else if (/よな$/.test(b5)) b5 = b5.replace(/よな$/, 'よね');
      else if (/(?:くれた|だった|やっぱり|やはり|満たした|そうだった)な$/.test(b5)) b5 = b5.replace(/な$/, 'ね');
      else if (ask && WH.test(b5) && /[^ん]だ$/.test(b5)) b5 = b5.replace(/だ$/, 'なの');
      /* 「ないのかよ」→「ないの」、「本気かよ」→「本気なの」（「〜のなんて」にしない） */
      else if (/かよ$/.test(b5)) b5 = /[一-鿿ァ-ヶー]かよ$/.test(b5) ? b5.replace(/かよ$/, 'なの') : b5.replace(/(?:の|ん)?かよ$/, 'の');
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
  var YOU = /お前さん|おまえさん|(?:お前|おまえ|あんた|てめえ|貴様|あなた)(?!さん|方)|(?:きみ|(?<![大姫主父母諸細若暴ァ-ヶー一-鿿A-Za-z])君)(?=(?:たち|達|ら|は|が|も|の|を|に|と|で|って|、|。|！|？|…|」|$|さ|ね|よ|なんか|なら|だけ|しか|だ|じゃ|より|まで|かも|こそ|か|な|から|へ|や|一人|自身))/g;
  var YOU_FOR = { proud: 'お前', tsun: 'あんた', gentle: 'きみ', devoted: 'あなた', shy: 'あなた' };

  /* 丁寧語をくだけた言い方に（口調の追加：tone-plus.js から使う） */
  /* midOnly：文の途中（読点・「…」の前）の丁寧語だけを外し、文末はそのままにする */
  /* 派生の口調（胡散臭い・姉）が、借りた文面に残った敬語の文を崩すときの入口。
     喘ぎ（「だめです……っ」）・短いつぶやき（「いや……です……」）・敬語の語尾のない台詞は、そのまま返す */
  var POLITE_Q = /(?:です|ます|ました|ません|でした|でしょう|ましょう|ございます|ください)(?:よ|ね|よね|か|の)?(?=[。！？!?…‥、」―]|$)/;
  V.unPoliteQuote = function (q) {
    if (!POLITE_Q.test(q)) return q;
    if (/[ぁぃぅぇぉ♡]|っ(?=[…‥、！!」]|$)|[…‥]っ/.test(q) || /^[ぁ-ん、]{1,4}[…‥]+[ぁ-ん]{1,3}[…‥]*$/.test(q)) return q;
    return V.casualQuote(q);
  };
  V.casualQuote = function (q, midOnly) {
    /* 「ありがとう、ございました」（言いよどみ）は、ひと続きのお礼として扱う */
    q = q.replace(/ありがとう、(ございま(?:す|した))/g, 'ありがとう$1');
    /* 「〜ていただけますか」→「〜てもらえる？」（「〜もらえるのか？」と詰問にしない）。「ご説明いただけますか」→「説明してもらえる？」 */
    q = q.replace(/(?:ご|お)([一-鿿]{1,3})いただけ(ます|ません)か[？?]?(?=[。！!…」]|$)/g, '$1していただけ$2か').replace(/([てで])いただけ(ます|ません)か[？?]?(?=[。！!…」]|$)/g, function (m, te, n) { return te + 'もらえ' + (n === 'ます' ? 'る？' : 'ない？'); });
    /* 「？」のない「〜ませんか」「〜ますか」は問いとして扱う（「戻りませんか」→「戻らない？」。言い切りの「戻らないの」にしない） */
    q = q.replace(/(ませんか|ますか|でしょうか)(?=[。！」]|$)/g, '$1？');
    /* 丁寧語を外す前に、崩し切れない敬語をふつうの形に（「ございません」「嬉しゅうございます」「なさいませんか」「いらっしゃいませんか」「ついてまいります」） */
    q = q.replace(/申し訳(?:ございません|ありません)(?:でした)?/g, '申し訳ない').replace(/お許しいただけ/g, '許していただけ').replace(/([ぁ-ん一-鿿])しゅう(?:ございま|ありま)(す|した)/g, function (m, a, e) { return a + (e === 'す' ? 'しい' : 'しかった'); })
      .replace(/ございませんでした/g, 'なかった').replace(/(?:お|ご)申し付けください/g, '言って').replace(/(ございません|なさいません|いらっしゃいません)か(?=[。！」]|$)/g, '$1か？').replace(/ございません/g, 'ない').replace(/なさいません/g, 'しない').replace(/いらっしゃいません/g, 'いない').replace(/いらっしゃいま(す|した)/g, function (m, e) { return e === 'す' ? 'いる' : 'いた'; })
      .replace(/(?<=て)まいり(ます|ました)/g, function (m, e) { return e === 'ます' ? 'いく' : 'いった'; }).replace(/(^|[、。！？!?…‥\s])(?:お|ご)(?!邪魔|願|疲|世話|久|気|礼|用|供|馳走)([一-鿿]{1,3})(?:いたし|し)ま(す|した)(?=[。！？!?…‥、」]|$)/g, function (m, p, a, e) { return p + a + (e === 'す' ? 'する' : 'した'); });
    var parts = q.split(/([。！？!?\n]+)/);
    return parts.map(function (seg, i) {
      if (i % 2) return seg;
      var tail = (seg.match(/[っッー〜～…♡♪、―]+$/) || [''])[0], s = seg.slice(0, seg.length - tail.length);
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
    /* 「大丈夫ですって」→「大丈夫だって」（形容詞のあとは「いいって」） */
    if (/.ですって$/.test(b)) return b.replace(/ですって$/, /い$/.test(b.slice(0, -4)) ? 'って' : 'だって');
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
  /* 尊敬の「お〜ください」「〜なさってください」はふつうのお願いにしてから言い換える（「お待ちくれ」「お好きになさって」にしない）。
     「？」のない「〜ですか」「〜ますか」には「？」を付ける（ため口にしたあとも問いのまま）。敬語を使わない口調の言い換えの前に voice.js から呼ぶ */
  V.unHonor = function (q) {
    /* 「ありがとう、ございました」（言いよどみ）は、ひと続きのお礼として扱う */
    q = q.replace(/ありがとう、(ございま(?:す|した))/g, 'ありがとう$1');
    /* 「〜ていただけますか」→「〜てもらえる？」（「〜もらえるのか？」と詰問にしない） */
    q = q.replace(/([てで])いただけ(ます|ません)か[？?]?(?=[。！!…」]|$)/g, function (m, te, n) { return te + 'もらえ' + (n === 'ます' ? 'る？' : 'ない？'); });
    return q.replace(/(?:いた|致)し(?=ま[すしせ])/g, 'し').replace(/いかが(?=です|でしょう)/g, 'どう').replace(/でございま(?=[すし])/g, 'で').replace(/(?<!ありがとう|おはよう|おめでとう)ございま(?=[すし])/g, 'ありま').replace(/恐れ入りますが、?/g, 'すみません、').replace(/かしこまりました/g, 'わかりました')
      .replace(/お好きになさってください/g, '好きにしてください').replace(/なさってください/g, 'してください').replace(/少々お待ち/g, 'ちょっとお待ち').replace(/少々/g, 'ちょっと').replace(/おどきください/g, 'どいてください').replace(/おやめください/g, 'やめてください')
      .replace(/お(?!願い|疲れ|待たせ|世話|大事|元気|気を)([一-鿿]{1,2}[ぁ-ん]?)([いきぎしちにびみりえけげせてねべめれ])ください/g, function (m, k, e) {
        var TE = { 'い': 'って', 'ち': 'って', 'り': 'って', 'き': 'いて', 'ぎ': 'いで', 'し': 'して', 'に': 'んで', 'び': 'んで', 'み': 'んで' };
        return k + (/[えけげせてねべめれ]/.test(e) ? e + 'て' : TE[e]) + 'ください';
      })
      .replace(/((?:です|ます|でしょう)か)(?=[。」]|$)/g, '$1？');
  };
  V.styleQuote = function (q, who) {
    var mode = who && who.persona;
    if (!q) return q;
    /* 「何してんの」は「何してるの」として言い換える（「何しての」「何してくださいか」にしない） */
    q = q.replace(/てんの(?=よ?[？?！!。…、」]|よ?$)/g, 'てるの');
    /* 男性の台詞から、女性的な語尾を外す */
    /* 男性、または性別なしで強気・厳格・冷静の口調なら、女性的な語尾を外す */
    if (who && (who.gender === 'm' || (who.gender !== 'f' && /^(proud|stern|cool|free)$/.test(who.persona)))) q = (HK.thinIntj ? HK.thinIntj(q, { 'あらあら': 'おやおや', 'あらまあ': 'おやまあ' }) : q).replace(/ものよ(?=[。！？…、]|$)/g, 'ものだ').replace(/かしら(?=[。！？…」]|$)/g, 'かな').replace(/(だ|た|い)わよ(?=[。！？…、]|$)/g, '$1よ').replace(/([^ぁ-ん])わよ(?=[。！？…、]|$)/g, '$1だよ').replace(/んのよ(?=[。！？…、]|$)/g, 'んだよ').replace(/のよ(?=[。！？…、]|$)/g, 'んだよ').replace(/(だ|た)わね(?=[。！？…、]|$)/g, '$1ね').replace(/だわ(?=[。！？…、]|$)/g, 'だ').replace(/(てる|ない|たい|しい)わ(?=[。！？…、]|$)/g, '$1よ').replace(/([るうくすつぬむぐぶ])わよ(?=[。！？…、]|$)/g, '$1よ').replace(/([るうくすつぬむぐぶい])わね(?=[。！？…、]|$)/g, '$1ね').replace(/なのね(?=[。！？…、]|$)/g, 'なんだね');
    if (!mode || mode === 'polite') return q;
    /* 敬語を使わない口調：文の途中の「〜ですから、」「〜ますが、」も外す（文末は下の一文ごとの整形で） */
    if (/^(proud|tsun|free|stern)$/.test(mode)) q = V.casualQuote(q, true);
    /* 名前の伏せ字（voice.js の HK.NameGuard）の中では、元の名前でくじを引く */
    var h = hash(HK.NameGuard && HK.NameGuard.stack.length ? HK.NameGuard.decAll(q + (who.name || '')) : q + (who.name || ''));
    var you = YOU_FOR[mode];
    if (you) q = q.replace(/(お前ら|おまえら|あんたら|てめえら|お前たち|あんたたち|君たち|きみたち|あなたたち)/g, { proud: 'お前ら', tsun: 'あんたたち', gentle: 'きみたち', devoted: 'みなさん', shy: 'みなさん' }[mode]).replace(/みなさんたち/g, 'みなさん');
    if (you) q = q.replace(YOU, function (m) { if ((m === '君' || m === 'きみ') && mode === 'stern') return m; return you; });
    if (mode === 'cool') {
      /* 冷静は敬語を使わず、語尾も淡々と */
      q = V.casualQuote(q).replace(/じゃん(?=[。！？…、」]|$)/g, 'じゃないか').replace(/でしょ(?=[。！？…、」]|$)/g, 'だろう').replace(/ちょうだい(?=[。！？…、」]|$)/g, 'くれ');
      /* 助けを呼ぶ・危険を知らせる叫びは、冷静な人でも「！」を残す */
      if (/誰か|助け|逃げ|危な|伏せ|出して|やめろ|止まれ|離れろ|火事|来るな/.test(q)) return q;
      return q.replace(/！+(?=[？?])/g, '').replace(/！+[　 ]*(?=.)/g, '。').replace(/[！!]+$/, '').replace(/。。+/g, '。');
    }
    var parts = q.split(/([。！？!?\n]+)/);
    q = parts.map(function (seg, i) { return i % 2 ? seg : sentence(seg, who, /[？?]/.test(parts[i + 1] || ''), h + i, parts[i + 1] || ''); }).join('');
    if (mode === 'shy' && h % 5 === 1 && !/^…/.test(q) && q.length >= 4) q = '……' + q;
    /* 健気は敬語（見本：「精一杯がんばります」）。健気（くだけた）は tone-plus.js で敬語を外す。関西弁は敬語にしない */
    if (mode === 'devoted' && who.tone !== 'devoted_p' && who.tone !== 'kansai' && V.polite) q = V.polite(q);
    /* 敬語を使わない口調では、人狼の結果発表（「人狼ではありませんでした」）もため口に */
    if (!/^(devoted|polite)$/.test(mode) && !/^(polite|devoted|mixed)$/.test(who.tone || '') && !/(です|ます|ました)[。！？!?…]/.test(q)) q = q.replace(/人狼(?:では|じゃ)ありませんでした/g, '人狼じゃなかった').replace(/人狼でした/g, '人狼だった').replace(/人間でした/g, '人間だった');
    /* 語尾に足した「！」と伸ばし・句点の重なり（「ありがと！ー！」「ごめんごめん！。」） */
    return q.replace(/！([ー〜])/g, '$1').replace(/！。/g, '！');
  };
})();
