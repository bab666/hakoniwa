/* 箱庭シミュレーター: 敬語の口調で「一つの台詞の中で敬語とため口が混ざる」を減らす仕上げ（V.keigoUnify）
   対象は敬語の口調（tone-registry.js の axis.polite === 2、または derive: 'polite' の口調）。
   台詞（「」の中）を文（。！？で区切る）に分け、敬語の文とため口の文が両方あるときだけ、ため口の文末を敬語に寄せる。
   voice.js の V.processText から、言い換え（styleQuote・V.polite）の直後、口調の仕上げ（HK.TONE_FINISH）の前に呼ぶ。
   順番を仕上げの前にするのは、仕上げ（お嬢様の「〜ですわ」、偉そうな敬語の「〜なさい」、明るい敬語の「〜まーす」など）が
   「です・ます」の文を見て味を付けるので、先にため口の文を「です・ます」にそろえておけば、寄せた文にも口調の味が付くから。
   変換は、確かな形だけに限る（判断のつかない語は触らない。取りこぼしは許す）。
   喘ぎ（♡・「……っ」・小さい母音）の台詞、変換を飛ばす印（先頭の U+2060）の台詞、置き換えの印（U+2060・{ }）が文末にある文は触らない */
(function () {
  'use strict';
  var HK = window.HK, V = HK && HK.Voice;
  if (!V) return;

  /* ---------- 対象の口調 ---------- */
  var tcache = {};
  function isTarget(tone) {
    if (!tone) return false;
    if (tone in tcache) return tcache[tone];
    var ax = HK.toneAxis ? HK.toneAxis(tone) : null;
    var dv = HK.toneOpt ? HK.toneOpt(tone, 'derive') : null;
    /* 後輩（〜っす）とダウナー系チャラ男（〜ですよー）は、ため口まじりが味の口調なので外す */
    return (tcache[tone] = tone !== 'chara_down' && tone !== 'kohai' && (!!(ax && ax.polite === 2) || dv === 'polite'));
  }

  var NO_TSU = { keigo_sarc: 1, keigo_bossy: 1, keigo_flat: 1 };
  /* ---------- 文の見分け ---------- */
  /* 敬語の文末（後ろの「か・よ・ね・けど・から」なども含む） */
  var KEIGO = /(?:です|ます|ません|でした|ました|ください|くださいませ|でしょう|でしょうか|ございます|ございました|ましょう|ませ|なさい)(?:か|よ|ね|よね|けど|けれど|から|ので|が|わ|の)*$/;
  /* 喘ぎ・息の乱れ（台詞ごと触らない） */
  var MOAN = /♡|[ぁぃぅぇぉ]|…っ|っ…|っ、|っ$|^[あんひふはぅ]+[…、]/;
  var K = '[一-鿿々〆ヵヶ]';
  var KR = new RegExp(K);
  function isK(c) { return !!c && KR.test(c); }
  /* 文末の一字前が漢字か */
  function kBefore(s, n) { return isK(s.charAt(s.length - n - 1)); }

  /* ---------- 動詞（終止形）→ ます形の語幹 ---------- */
  /* 一段の一字の漢字（見る・着る・寝る…）。それ以外の「漢字＋る」は五段（帰る・知る・入る） */
  var ICHI1 = '見着寝似煮居出得経干射';
  /* 「漢字＋く」の五段（「早く」「近く」のような形容詞の連用形と見分けるため、確かな動詞だけ） */
  var KU = '行書聞着付置開抱描引歩動働届続泣向吐驚輝浮叩弾効解招巻咲敷拭履頷囁呟焼突導退欠空傾嘆磨湧沸乾渇貫省除築抜覗剥';
  /* 「い」で終わる五段の音便（〜いだ）の漢字 */
  var GU = '泳急脱騒防繋注稼塞嗅';
  var NUM = '一二三四五六七八九十百千幾何';
  var A2I = { 'か': 'き', 'が': 'ぎ', 'さ': 'し', 'た': 'ち', 'な': 'に', 'ば': 'び', 'ま': 'み', 'ら': 'り', 'わ': 'い' };
  /* かなだけで書く、よく出る動詞（終止形 → ます形の語幹） */
  var KANA_V = { 'できる': 'でき', 'わかる': 'わかり', 'がんばる': 'がんばり', 'くれる': 'くれ', 'あげる': 'あげ', 'やる': 'やり', 'いける': 'いけ', 'かまう': 'かまい', 'もらう': 'もらい' };
  /* 一段なのに五段に見える／五段なのに一段に見える語（触らない） */
  var V_STOP = /(?:混じる|交じる|捻じる|しゃべる|すべる|かえる|へる|ける|ねる|いじる|まくる)$/;
  /* 終止形の動詞で終わる文の、ます形の語幹（分からなければ null） */
  function masuStem(s) {
    var m;
    if (V_STOP.test(s)) return null;
    if (/する$/.test(s)) return s.slice(0, -2) + 'し';
    if (/来る$/.test(s)) return s.slice(0, -1);
    if (/[てで]くる$/.test(s)) return s.slice(0, -2) + 'き';
    if (/行く$/.test(s)) return s.slice(0, -1) + 'き';
    if (/(?:^|[てでがにもはへ、])いく$/.test(s)) return s.slice(0, -1) + 'き';
    if (/(?:^|[がはもにてと、]|こと|わけ|はず)ある$/.test(s)) return s.slice(0, -1) + 'り';
    if (/(?:^|[てでがにもは、])いる$/.test(s)) return s.slice(0, -1);
    /* い抜きの「〜てる」「〜でる」（「〜てます」にしておけば、敬語の仕上げが「〜ています」に戻す） */
    if (/(?:っ|[いんし]|[えけげせてねべめれきみり]|[見来着寝出])[てで]る$/.test(s)) return s.slice(0, -1);
    if (/[ちじ]ゃう$/.test(s)) return s.slice(0, -1) + 'い';
    if (/(?:^|[にくとがも、])なる$/.test(s)) return s.slice(0, -1) + 'り';
    if (/[てで]しまう$/.test(s)) return s.slice(0, -1) + 'い';
    if (/[てで]みる$/.test(s)) return s.slice(0, -1);
    if (/[てで]おく$/.test(s)) return s.slice(0, -1) + 'き';
    for (var kv in KANA_V) if (s.slice(-kv.length) === kv && (s.length === kv.length || !/[ぁ-ん]/.test(s.charAt(s.length - kv.length - 1)) || /[てでがにもはを、]/.test(s.charAt(s.length - kv.length - 1)))) return s.slice(0, -kv.length) + KANA_V[kv];
    /* 漢字＋る */
    if ((m = s.match(new RegExp('(' + K + ')る$')))) return ICHI1.indexOf(m[1]) >= 0 ? s.slice(0, -1) : s.slice(0, -1) + 'り';
    /* 漢字＋え段・い段＋る（考える・生きる：一段） */
    if (new RegExp(K + '[えけげせぜてでねべぺめれきぎじちにびみり]る$').test(s)) return s.slice(0, -1);
    /* 漢字＋あ段・う段・お段のかな＋る（始まる・終わる・助かる：五段） */
    if (new RegExp(K + '[ぁ-ん]?[あかがさざただなはばまやらわうくぐすずつぬふぶむゆおこごそぞとどのほぼもよろ]る$').test(s)) return s.slice(0, -1) + 'り';
    /* 漢字＋く・ぐ・す・つ・ぬ・ぶ・む・う */
    if ((m = s.match(new RegExp('(' + K + ')(?:ち|づ)?く$'))) && KU.indexOf(m[1]) >= 0) return s.slice(0, -1) + 'き';
    if (/近づく$|気づく$/.test(s)) return s.slice(0, -1) + 'き';
    if (new RegExp(K + 'ぐ$').test(s)) return s.slice(0, -1) + 'ぎ';
    if (new RegExp(K + '[こらやわとかへ]?す$').test(s)) return s.slice(0, -1) + 'し';
    if ((m = s.match(new RegExp('(' + K + ')つ$'))) && NUM.indexOf(m[1]) < 0) return s.slice(0, -1) + 'ち';
    if (/死ぬ$/.test(s)) return s.slice(0, -1) + 'に';
    if (new RegExp(K + 'か?ぶ$').test(s)) return s.slice(0, -1) + 'び';
    if (new RegExp(K + 'し?む$').test(s)) return s.slice(0, -1) + 'み';
    if (new RegExp(K + '[かあ]?う$').test(s)) return s.slice(0, -1) + 'い';
    return null;
  }

  /* ---------- 否定（〜ない → 〜ません） ---------- */
  var NAI_STOP = /(?:下らない|詰まらない|情けない|頼りない|物足りない|違いない|申し訳ない|仕方ない|しょうがない|しかたない|だらしない|つまらない|くだらない|もったいない|勿体ない|危ない|少ない|切ない|汚い|ぎこちない|あどけない|そっけない|素っ気ない|呆気ない|あっけない|味気ない|心もとない|心許ない|やるせない|おぼつかない|はかない|儚い|えげつない)$/;
  function negPolite(s) {
    var m;
    if (NAI_STOP.test(s)) return null;
    if (/(?:じゃ|では)ない$/.test(s)) return null;
    if (/くない$/.test(s)) return s + 'です';
    if (/しない$/.test(s)) return s.slice(0, -3) + 'しません';
    if (/来ない$/.test(s)) return s.slice(0, -2) + 'ません';
    if (/(?:^|[てで])こない$/.test(s)) return s.slice(0, -3) + 'きません';
    if (/(?:できない|いけない|いない|足りない|たりない)$/.test(s)) return s.slice(0, -2) + 'ません';
    if (/(?:わから|分から|知ら|しら|なら|かまわ|構わ|たまら|止まら|やら|いか)ない$/.test(s)) { var b = s.slice(0, -2); return b.slice(0, -1) + A2I[b.slice(-1)] + 'ません'; }
    if (new RegExp('[' + GU + ']がない$').test(s)) return s.slice(0, -3) + 'ぎません';
    if (/(?:^|[がはも、]|しか|まだ|もう)ない$/.test(s)) return s.slice(0, -2) + 'ありません';
    if ((m = s.match(new RegExp(K + '[ぁ-ん]?([かがさたなばまらわ])ない$'))) && A2I[m[1]]) return s.slice(0, -3) + A2I[m[1]] + 'ません';
    if (new RegExp(K + '[えけげせぜてでねべめれきぎじちにびみり]ない$').test(s)) return s.slice(0, -2) + 'ません';
    if (new RegExp('[' + ICHI1 + ']ない$').test(s)) return s.slice(0, -2) + 'ません';
    return null;
  }

  /* ---------- 過去（〜た → 〜ました） ---------- */
  /* 「漢字＋った」の元の形（い：言う、ち：待つ、り：帰る） */
  var TTA = {};
  '言思会買使笑違払誘習歌拾失願疑狙誓伝合揃酔迷戦従扱叶貰問争救奪補追吸洗祝養'.split('').forEach(function (c) { TTA[c] = 'い'; });
  '待持立勝打撃育保経'.split('').forEach(function (c) { TTA[c] = 'ち'; });
  '帰知入取作困戻守怒眠乗祈送残走黙座断切触撮頼渡通踊光鳴売減余移張握割降登限当叱殴蹴刺治直泊止集終始決曲上下繋掴回謝祭居照'.split('').forEach(function (c) { TTA[c] = 'り'; });
  var NDA = { b: '呼遊選喜叫学飛転結並運及滅浮', n: '死' };
  function pastPolite(s) {
    var m;
    if (/だった$/.test(s)) return s.slice(0, -3) + 'でした';
    if (/(?:分か|(?:^|[^ぁ-ん]|[がもはをにと])わか|助か|見つか|掛か|(?:^|[てでがに])かか|向か|ぶつか|受か)った$/.test(s)) return s.slice(0, -2) + 'りました';
    if (/かった$/.test(s)) return s + 'です';
    if (/[てで]しまった$/.test(s)) return s.slice(0, -2) + 'いました';
    if (/[ちじ]ゃった$/.test(s)) return s.slice(0, -2) + 'いました';
    if (/した$/.test(s)) return s.slice(0, -1) + 'ました';
    if (/(?:っ|[いんし]|[えけげせてねべめれきみり]|[見来着寝出])[てで]た$/.test(s)) return s.slice(0, -1) + 'ました';
    if (/[てで]いた$/.test(s) || /(?:^|[にがもはで、])いた$/.test(s)) return s.slice(0, -1) + 'ました';
    if (/[てで]きた$/.test(s) || /来た$/.test(s)) return s.slice(0, -1) + 'ました';
    if (/行った$/.test(s) || /(?:く|が|に|まく)いった$/.test(s)) return s.slice(0, -2) + 'きました';
    if (/(?:^|[にくとがも、])なった$/.test(s)) return s.slice(0, -2) + 'りました';
    if (/(?:^|[がはもにてと、])あった$/.test(s)) return s.slice(0, -2) + 'りました';
    if (/(?:もら|かま)った$/.test(s)) return s.slice(0, -2) + 'いました';
    if (/(?:がんば|頑張)った$/.test(s)) return s.slice(0, -2) + 'りました';
    if ((m = s.match(new RegExp('(' + K + ')った$'))) && TTA[m[1]]) return s.slice(0, -2) + TTA[m[1]] + 'ました';
    if (new RegExp(K + '[わまがら]った$').test(s)) return s.slice(0, -2) + 'りました';
    if ((m = s.match(new RegExp('(' + K + ')(し)?んだ$')))) return s.slice(0, -2) + (m[2] ? 'み' : NDA.b.indexOf(m[1]) >= 0 ? 'び' : NDA.n.indexOf(m[1]) >= 0 ? 'に' : 'み') + 'ました';
    if ((m = s.match(new RegExp('(' + K + ')いた$'))) && KU.indexOf(m[1]) >= 0) return s.slice(0, -2) + 'きました';
    if ((m = s.match(new RegExp('(' + K + ')いだ$'))) && GU.indexOf(m[1]) >= 0) return s.slice(0, -2) + 'ぎました';
    if (new RegExp(K + '[ぁ-ゖ]{0,2}[えけげせぜてでねべめれきぎじちにびみり]た$').test(s) && !/[っんい][えけげせぜてでねべめれきぎじちにびみり]た$/.test(s)) return s.slice(0, -1) + 'ました';
    if (new RegExp('[' + ICHI1 + ']た$').test(s)) return s.slice(0, -1) + 'ました';
    if (/(?:できた|くれた|あげた)$/.test(s)) return s.slice(0, -1) + 'ました';
    return null;
  }

  /* ---------- 命令・禁止 ---------- */
  /* 命令形 → [て形, ます形の語幹] */
  var IMP = {
    'しろ': ['して', 'し'], '見ろ': ['見て', '見'], '逃げろ': ['逃げて', '逃げ'], '起きろ': ['起きて', '起き'], 'やめろ': ['やめて', 'やめ'], '止めろ': ['止めて', 'やめ'],
    '生きろ': ['生きて', '生き'], '信じろ': ['信じて', '信じ'], '答えろ': ['答えて', '答え'], '離れろ': ['離れて', '離れ'], '伏せろ': ['伏せて', '伏せ'], '寝ろ': ['寝て', '寝'],
    '食べろ': ['食べて', '食べ'], '隠れろ': ['隠れて', '隠れ'], '開けろ': ['開けて', '開け'], '決めろ': ['決めて', '決め'], '見せろ': ['見せて', '見せ'], '教えろ': ['教えて', '教え'],
    '出ろ': ['出て', '出'], '落ち着け': ['落ち着いて', '落ち着き'], '待て': ['待って', '待ち'], '行け': ['行って', '行き'], '走れ': ['走って', '走り'], '黙れ': ['黙って', '黙り'],
    '座れ': ['座って', '座り'], '帰れ': ['帰って', '帰り'], '急げ': ['急いで', '急ぎ'], '下がれ': ['下がって', '下がり'], '止まれ': ['止まって', '止まり'], '戦え': ['戦って', '戦い'],
    '言え': ['言って', '言い'], '聞け': ['聞いて', '聞き'], '飲め': ['飲んで', '飲み'], '休め': ['休んで', '休み'], '進め': ['進んで', '進み'], '来い': ['来て', '来'],
    '頑張れ': ['頑張って', '頑張り'], 'がんばれ': ['がんばって', 'がんばり'], '戻れ': ['戻って', '戻り'], '掴まれ': ['掴まって', '掴まり'], '動け': ['動いて', '動き'], '立て': ['立って', '立ち']
  };
  /* 禁止（〜するな）→ [ない形, て形] */
  var PROH = {
    'する': ['しない', 'して'], '動く': ['動かない', '動いて'], '触る': ['触らない', '触って'], '来る': ['来ない', '来て'], '見る': ['見ない', '見て'], '逃げる': ['逃げない', '逃げて'],
    '死ぬ': ['死なない', '死んで'], '行く': ['行かない', '行って'], '泣く': ['泣かない', '泣いて'], '喋る': ['喋らない', '喋って'], '近づく': ['近づかない', '近づいて'], '離れる': ['離れない', '離れて'],
    '笑う': ['笑わない', '笑って'], '言う': ['言わない', '言って'], '諦める': ['諦めない', '諦めて'], '忘れる': ['忘れない', '忘れて'], '振り向く': ['振り向かない', '振り向いて'],
    '開ける': ['開けない', '開けて'], '入る': ['入らない', '入って'], '出る': ['出ない', '出て'], '出す': ['出さない', '出して'], '騒ぐ': ['騒がない', '騒いで'], '負ける': ['負けない', '負けて'], '迷う': ['迷わない', '迷って']
  };
  /* 誘い（〜しよう → 〜しましょう） */
  var VOL = {
    'しよう': 'し', '行こう': '行き', '帰ろう': '帰り', '戻ろう': '戻り', '急ごう': '急ぎ', '休もう': '休み', '進もう': '進み', '待とう': '待ち', '遊ぼう': '遊び', '呼ぼう': '呼び',
    '選ぼう': '選び', '頑張ろう': '頑張り', 'がんばろう': 'がんばり', 'やろう': 'やり', '始めよう': '始め', '逃げよう': '逃げ', '食べよう': '食べ', '寝よう': '寝', '決めよう': '決め',
    '調べよう': '調べ', '探そう': '探し', '祈ろう': '祈り', '乗ろう': '乗り', '入ろう': '入り', '作ろう': '作り', '守ろう': '守り', '歩こう': '歩き', '聞こう': '聞き', '続けよう': '続け', '考えよう': '考え', '確かめよう': '確かめ', '出よう': '出'
  };

  /* ---------- 頼み（〜て → 〜てください） ---------- */
  var TE_STOP = /(?:なんて|として|にとって|について|によって|に対して|に関して|に向けて|すべて|全て|初めて|はじめて|改めて|あらためて|せめて|あえて|敢えて|かつて|決して|極めて|きわめて|努めて|強いて|かえって|却って|至って|果たして|揃って|前もって|もって|そして|まして|どうして|こうして|そうして|ああして|なんで|それで|そこで|ここで|あとで|後で|ので|まで|くれて|って言って|と言って|併せて|合わせて|あわせて|喜んで|謹んで|進んで|好んで|思って|考えて|感じて|を通して|しばらくして|少しして|ほどなくして|程なくして|一瞬にして|一夜にして|幸いにして|往々にして|もしかして|ひょっとして|続いて|誓って|次いで|たりして|だりして|とかして|なんかして|やがって|甘えて|って聞いて|と聞いて|まで頑張って|まで頑張って|(?:緊張|感動|興奮|後悔|期待|満足|混乱|困惑|動揺|失敗|成功|感謝|びっくり|どきどき|ドキドキ|ほっと|イライラ|うっとり)して)$/;
  function teForm(s) {
    if (TE_STOP.test(s)) return false;
    var m;
    if (/(?:^|[をにがもは、])(?:やめ|あげ|かけ|つけ)て$/.test(s)) return true;
    if (/[てで](?:みて|おいて)$/.test(s)) return true;
    if (/(?:^|[にでへ、])いて$/.test(s)) return true;
    if (/からって$/.test(s)) return false;
    if ((m = s.match(/(.)って$/)) && (TTA[m[1]] || m[1] === '行' || /[やばまがらわ]/.test(m[1]))) return true;
    if ((m = s.match(new RegExp('(' + K + ')(?:ち)?いて$'))) && KU.indexOf(m[1]) >= 0) return true;
    if ((m = s.match(new RegExp('(' + K + ')いで$'))) && GU.indexOf(m[1]) >= 0) return true;
    if (/して$/.test(s)) return true;
    if (new RegExp(K + 'し?んで$').test(s)) return true;
    if (/(?:[かがさたなばまらわえけげせてねべめれきぎじちにびみり]|し|来|こ|見|寝|出)ないで$/.test(s)) return true;
    if (new RegExp(K + '[えけげせぜてでねべめれきぎじちにびみり]て$').test(s)) return true;
    if (/[見来寝出着]て$/.test(s)) return true;
    return false;
  }
  /* 「〜てください」を偉そうな敬語の「〜なさい」に（て形 → ます形の語幹が分かるものだけ） */
  function teStem(s) {
    for (var k in IMP) if (s.slice(-IMP[k][0].length) === IMP[k][0]) return s.slice(0, -IMP[k][0].length) + IMP[k][1];
    if (/して$/.test(s)) return s.slice(0, -1);
    return null;
  }

  /* ---------- 形容詞・名詞＋い（〜い → 〜いです） ---------- */
  var I_STOP = /(?:なさい|ください|しゃい|ちょうだい|まい|[^暖温柔細]かい|^かい|だい|来い|こい|くらい|ぐらい|ほしい|欲しい|洗い|占い|願い)$|(?:^|[、…‥\s])(?:はい|おい|ほい|あい|うい|へい|ええい)$/;
  function adjI(s) {
    if (I_STOP.test(s)) return false;
    return /[ぁ-ん一-鿿]い$/.test(s) && s.length >= 2;
  }

  /* ---------- 一つの文末を敬語に（できなければ null） ---------- */
  var NOUNEND = new RegExp('(?:' + K + '|[ァ-ヶー]|[A-Za-zＡ-Ｚａ-ｚ0-9０-９]|の|よう|そう|はず|つもり|ところ|こと|もの|ため|まま|ばかり|だけ|ほど|きれい|ぎりぎり|ここ|そこ|あそこ|どこ|これ|それ|あれ|どれ|だれ|なに|いつ|ほんと|みんな|あなた|わたし|ダメ|だめ|みたい)$');
  function convCore(c, ask, tone, bang) {
    var m, r;
    if (!c) return null;
    /* 推し量り・念押し */
    if ((m = c.match(/^(.+?)(?:だろう|だろ|でしょ)$/))) return m[1] + 'でしょう';
    if (/じゃん$/.test(c)) return c.slice(0, -3) + 'じゃないですか';
    if (/じゃないか$/.test(c)) return c.slice(0, -1) + 'ですか';
    /* 「〜じゃない」：名詞の後ろは打ち消し（「学生じゃない」→「学生じゃないです」）、動詞の後ろは念押し（「いないじゃない」→「いないじゃないですか」）。
       「〜んじゃない」「〜いじゃない」はどちらか決められないので触らない */
    if (/じゃない$/.test(c)) {
      var pj = c.charAt(c.length - 5);
      if (isK(pj) || /[ァ-ヶーの]/.test(pj)) return c + 'です' + (ask ? 'か' : '');
      if (/[るた]/.test(pj) || /ないじゃない$/.test(c)) return c + 'ですか';
      return null;
    }
    if (/ではない$/.test(c)) return c.slice(0, -2) + 'ありません' + (ask ? 'か' : '');
    /* 「〜かな」：問いかけは「〜でしょうか」。独り言は、名詞の後ろなら「〜ですかね」、「〜のかな」なら「〜のでしょうか」。
       「話したくないかな」「したいかな」のような自分のことをぼかす言い方は触らない */
    if (/(?:ない|たい)かな$/.test(c)) return null;
    if (new RegExp('(?:[るうくぐすつぬぶむただのん]|' + K + '|[ァ-ヶー])かな$').test(c)) {
      if (ask || /のかな$/.test(c)) return c.slice(0, -2) + 'でしょうか';
      if (new RegExp('(?:' + K + '|[ァ-ヶー])かな$').test(c)) return c.slice(0, -2) + 'ですかね';
      return null;
    }
    /* 問いかけの「〜なの？」「〜の？」 */
    if (ask && /なの$/.test(c) && c.length >= 3) return c.slice(0, -2) + 'なんですか';
    if (ask && /(?:[るうくぐすつぬぶむた]|い)の$/.test(c) && c.length >= 3) return c.slice(0, -1) + 'んですか';
    /* 「〜なんだ」「〜んだ」（説明） */
    if (/(?:な|の)んだ$/.test(c)) return c.slice(0, -1) + 'です';
    if (/(?:[るうくぐすつぬぶむた]|たい|いい|ない)んだ$/.test(c)) return c.slice(0, -1) + 'です';
    /* 名詞＋だ */
    if (/だ$/.test(c) && c.length >= 2 && NOUNEND.test(c.slice(0, -1))) return c.slice(0, -1) + 'です' + (ask ? 'か' : '');
    /* 過去 */
    if (/た$|だ$/.test(c) && (r = pastPolite(c))) return r + (ask && /(?:ました|でした|です)$/.test(r) ? 'か' : '');
    /* 命令・禁止・誘い */
    var ik = Object.keys(IMP).filter(function (k) {
      if (c.slice(-k.length) !== k) return false;
      if (c.length === k.length) return true;
      var pv = c.charAt(c.length - k.length - 1);
      /* 「静かにしろ」「早くしろ」：「しろ」は前の語を問わない（「おもしろ」は除く） */
      if (k === 'しろ') return !/[もお]/.test(pv);
      return /[をにへでとがは、]/.test(pv);
    }).sort(function (a, b) { return b.length - a.length; })[0];
    if (ik) {
      if (ask) return null;
      var head = c.slice(0, c.length - ik.length);
      return tone === 'keigo_bossy' ? head + IMP[ik][1] + 'なさい' : head + IMP[ik][0] + 'ください';
    }
    if ((m = c.match(/^(.*?)(する|動く|触る|来る|見る|逃げる|死ぬ|行く|泣く|喋る|近づく|離れる|笑う|言う|諦める|忘れる|振り向く|開ける|入る|出る|出す|騒ぐ|負ける|迷う)な$/)) && !ask) {
      var p = PROH[m[2]];
      return tone === 'keigo_bossy' ? m[1] + p[1] + 'はいけません' : m[1] + p[0] + 'でください';
    }
    for (var vk in VOL) if (c.slice(-vk.length) === vk && (c.length === vk.length || /[をにへでとがは、もう]/.test(c.charAt(c.length - vk.length - 1)) || (vk === 'しよう' && c.length > 3))) return c.slice(0, -vk.length) + VOL[vk] + 'ましょう' + (ask ? 'か' : '');
    /* 否定 */
    /* 「呼吸、止めない！」「慌てない、走らない」のような言いつけを「〜ません」（自分の打ち消し）にしない */
    if (/ない$/.test(c) && !/くない$/.test(c) && (bang || /ない、/.test(c))) return null;
    if (/ない$/.test(c) && (r = negPolite(c))) return r + (ask ? 'か' : '');
    /* 頼み（〜て）。問いかけは除く */
    if (!ask && /てて$/.test(c) && teForm(c.slice(0, -1))) return c.slice(0, -1) + 'いてください';
    if (!ask && /[てで]$/.test(c) && teForm(c)) {
      if (tone === 'keigo_bossy' && (r = teStem(c))) return r + 'なさい';
      return c + 'ください';
    }
    /* 動詞の終止形 */
    if (/[うくぐすつぬぶむる]$/.test(c) && (r = masuStem(c))) return r + 'ます' + (ask ? 'か' : '');
    /* 形容詞 */
    /* 「やらない？」のような誘いを「〜ないですか」にしない（「〜くない？」は形容詞なのでよい） */
    if (ask && /ない$/.test(c) && !/くない$/.test(c)) return null;
    if (adjI(c)) return c + 'です' + (ask ? 'か' : '');
    return null;
  }
  /* 文の本体（記号を除いたもの）を変換。後ろの「よ・ね・よね・ぞ・ぜ・から・けど」は付け直す */
  /* 一文まるごとのあいさつ */
  var GREET = { 'おつかれ': 'お疲れさまです', 'お疲れ': 'お疲れさまです', 'おつかれさま': 'お疲れさまです', 'お疲れさま': 'お疲れさまです', 'ありがとう': 'ありがとうございます', 'ごめん': 'ごめんなさい', 'おはよう': 'おはようございます', 'おやすみ': 'おやすみなさい', 'よろしく': 'よろしくお願いします', 'すまない': 'すみません', 'すまん': 'すみません' };
  function convBody(b, ask, tone, bang) {
    if (GREET[b] && !ask) return GREET[b];
    /* 「するする」「痛い痛い」「騙された騙された」のような繰り返しは、片方だけ変えると崩れるので触らない */
    if (/^(.{1,8}?)、?\1(?:よ|ね)?$/.test(b)) return null;
    /* 「お願い」「……お願い……」は「お願いします」 */
    if (/(?:^|[、…‥\s])お願い$/.test(b) && !ask) return b + 'します';
    /* 「また話そうって」（誘いを引いて言う） */
    var mv = b.match(/^(.*?)(しよう|行こう|話そう|会おう|帰ろう|遊ぼう|頑張ろう|がんばろう)って$/);
    if (mv) return mv[1] + ({ 'しよう': 'し', '行こう': '行き', '話そう': '話し', '会おう': '会い', '帰ろう': '帰り', '遊ぼう': '遊び', '頑張ろう': '頑張り', 'がんばろう': 'がんばり' })[mv[2]] + 'ましょうって';
    var m = b.match(/^(.*?)(よね|よ|ね|ぞ|ぜ|から|けど|けれど|だな)?$/), c = m[1], p = m[2] || '';
    if (p === 'だな') { c += 'だ'; p = 'ね'; }
    if (p === 'ぞ' || p === 'ぜ') p = 'よ';
    /* 「？」のない問い（「何が変わる」「何のポイントだよ」）は、言い切りの敬語にすると意味が変わるので触らない（頼みの「〜て」は除く） */
    if (!ask && /何|なに|なんで|なんの|誰|だれ|どこ|なぜ|どうして|どう(?!ぞ|も)|どれ|どっち|いつ(?!も)/.test(c) && !/[てで]$/.test(c)) return null;
    /* 「うわ、ミナトだ」（見つけて驚く）を「ミナトです」にしない */
    if (/^(?:うわ|うげ|げっ|げ|わっ|おっ)[、っ]/.test(c) && /だ$/.test(c)) return null;
    /* 問いの「か」を付けた形には、念押しの「よ・ね」を重ねない */
    var r = convCore(c, ask && !p, tone, bang);
    if (r == null) return null;
    if (p && /か$/.test(r) && /^(?:よ|ね|よね)$/.test(p)) return null;
    /* 頼み・禁止・命令の後ろには「から・けど」を付けない（「待ってくださいから」にしない） */
    if (/(?:ください|なさい|いけません|ましょう)$/.test(r) && /^(?:から|けど|けれど)$/.test(p)) return null;
    /* 無機質な敬語は言い切り（「よ・ね」を付けない） */
    if (tone === 'keigo_flat' && /^(?:よ|ね|よね)$/.test(p)) p = '';
    return r + p;
  }

  V.keigoUnify = function (q, who) {
    if (!q || typeof q !== 'string' || !who || !isTarget(who.tone)) return q;
    if (q.charAt(0) === '\u2060' || MOAN.test(q) || /[「」『』（）]/.test(q)) return q;
    var segs = q.match(/[^。！？!?]+[。！？!?]*|[。！？!?]+/g);
    if (!segs || segs.length < 2) return q;
    var info = segs.map(function (s) {
      var pm = s.match(/^(.*?)([。！？!?]*)$/), core = pm[1], punct = pm[2];
      var lead = (core.match(/^[…‥、\s　]*/) || [''])[0];
      var tail = (core.slice(lead.length).match(/[…‥ー〜～―、\s　]*$/) || [''])[0];
      var body = core.slice(lead.length, core.length - tail.length);
      return { lead: lead, body: body, tail: tail, punct: punct, ask: /[？?]/.test(punct) };
    });
    var hasK = info.some(function (x) { return x.body.length >= 2 && KEIGO.test(x.body); });
    if (!hasK) return q;
    var changed = false, hasTsu = /っ/.test(q);
    var out = info.map(function (x) {
      var s = x.lead + x.body + x.tail + x.punct;
      if (x.body.length < 2 || KEIGO.test(x.body)) return s;
      /* 置き換えの印が文末にある文は触らない */
      if (!/[ぁ-ん一-鿿]$/.test(x.body) || /[\u2060-\u2064{}]/.test(x.body.slice(-3))) return s;
      /* 「……教わって……」のように「……」で切れる「〜て」は言いさしなので、頼みにしない */
      if (/[…‥]/.test(x.tail) && /[てで](?:よ|ね)?$/.test(x.body)) return s;
      /* 「お宝だー！」「きもちいー」のように伸ばした言い切りは、はしゃいだ声なので触らない */
      if (/[ー〜～]/.test(x.tail)) return s;
      var r = convBody(x.body, x.ask, who.tone, /[！!]/.test(x.punct));
      if (r == null || r === x.body) return s;
      /* 無愛想・偉そう・無機質な敬語の仕上げ（tone-new.js）は「っ」のある台詞を喘ぎとみて触らないので、「っ」のない台詞に「っ」を持ち込まない */
      if (NO_TSU[who.tone] && !hasTsu && /っ/.test(r)) return s;
      changed = true;
      return x.lead + r + x.tail + x.punct;
    }).join('');
    return changed ? out : q;
  };
  V.keigoUnifyTarget = isTarget;
})();
