/* 箱庭シミュレーター: 台詞の声（一人称と敬語）
   シミュレーションの結果テキストを最後に一度だけ見直し、台詞（「」）ごとに話し手を判定して、
   ・一人称を、その人の一人称（設定がなければ口調と性別から決まるもの）にそろえる
   ・口調が「敬語」の人の台詞を、です・ます調に整える
   すべての箱庭で共通に使う（HK.simulate の結果に対して適用） */
(function () {
  'use strict';
  var HK = window.HK, V = HK.Voice = HK.Voice || {};

  /* ---------- 一人称 ---------- */
  /* 口調×性別の既定の一人称（m 男性 / f 女性 / それ以外） */
  var FP_DEF = {
    proud: { m: '俺', f: 'あたし', x: '俺' }, stern: { m: '私', f: '私', x: '私' }, tsun: { m: '俺', f: 'あたし', x: '私' },
    gentle: { m: '僕', f: 'わたし', x: 'わたし' }, devoted: { m: '僕', f: 'わたし', x: 'わたし' }, cool: { m: '俺', f: '私', x: '私' },
    free: { m: '俺', f: 'あたし', x: 'あたし' }, shy: { m: '僕', f: 'わたし', x: 'わたし' }, polite: { m: '私', f: '私', x: '私' }
  };
  V.fpDefault = function (c) {
    var t = FP_DEF[c && c.persona] || FP_DEF.gentle, g = c && (c.gender === 'm' || c.gender === 'f') ? c.gender : 'x';
    return t[g];
  };
  V.fpFor = function (c) { var fp = String((c && c.fp) || '').trim().slice(0, 8); return fp || V.fpDefault(c); };
  var FP_RE = /(俺様|オレ様|俺|僕|ぼく|オレ|ボク|わたくし|ワタクシ|あたくし|あたし|アタシ|わたし|ワタシ|私|拙者|わらわ|わし|ウチ|うち)(?=(?:たち|達|ら|は|が|も|の|を|に|へ|一人|ひとり|と|で|って|だ|、|。|！|？|…|―|」|）|\s|$|っ|、|ね|よ|さ|じゃ|から|まで|より|だけ|なんか|なんて|なら|かも|ばかり|ばっかり|しか|こそ|以外|自身|一番|いちばん|吊|な(?=の|ん)|か(?=[？?…!！」、]|$)|!|\?))/g;
  /* 一人称の読みの頭（「わ、私」→「ぼ、僕」のように、どもりも一人称に合わせる）
     漢字の一人称は表から、ひらがな・カタカナで始まる一人称は最初の一音（「しょ」のような拗音も）から。
     読みが分からない一人称なら、どもりは省く（「わ、私」→「某」） */
  var FP_READ = { '俺様': 'お', '俺': 'お', '僕': 'ぼ', '私': 'わ', '自分': 'じ', '拙者': 'せ', '儂': 'わ', '我': 'わ', '吾輩': 'わ', '我輩': 'わ', '妾': 'わ', '某': 'そ', '小生': 'しょ', '余': 'よ', '己': 'お', '朕': 'ちん', '麻呂': 'ま', '吾': 'わ' };
  function hira(s) { return s.replace(/[ァ-ヶ]/g, function (ch) { return String.fromCharCode(ch.charCodeAt(0) - 0x60); }); }
  function fpRead(w) {
    if (!w) return null;
    if (FP_READ[w]) return FP_READ[w];
    var k = w.match(/^[ぁ-ゖァ-ヶ][ぁぃぅぇぉゃゅょゎァィゥェォャュョヮ]?/);
    if (k) return k[0];
    for (var key in FP_READ) if (w.indexOf(key) === 0) return FP_READ[key];
    return null;
  }
  V.replaceFP = function (q, c) {
    var fp = V.fpFor(c), out = '', last = 0, m;
    FP_RE.lastIndex = 0;
    while ((m = FP_RE.exec(q))) {
      var w = m[0], rep = w === 'うち' && !(c && c.fp) ? w : fp, pre = q.slice(last, m.index);
      /* 「今のうち」「職務のうち」の「うち」は一人称ではない */
      if (/^(うち|ウチ)$/.test(w) && /(の|[一-鿿々])$/.test(pre)) rep = w;
      /* 「うちへ帰る」「そのうち一人」の「うち」も一人称ではない（へ・一人の続きは、ほかの一人称だけで見る） */
      if (/^(うち|ウチ)$/.test(w) && /^(へ|一人|ひとり)/.test(q.slice(m.index + w.length))) rep = w;
      /* どもり（「わ、」「わ、わ、」「わ……」）が、もとの一人称の頭の音なら、新しい一人称の頭の音にする */
      var sm = rep !== w ? pre.match(/(^|[…‥、。！？!?「っッ\s])(([ぁ-ゖァ-ヶ][ぁぃぅぇぉゃゅょァィゥェォャュョ]?)[、…‥]+(?:\3[、…‥]+)*)$/) : null;
      if (sm) {
        var r0 = hira(fpRead(w) || ''), bits = sm[2].match(/[ぁ-ゖァ-ヶ][ぁぃぅぇぉゃゅょァィゥェォャュョ]?[、…‥]+/g);
        var same = r0 && bits.every(function (b) { return hira(b.replace(/[、…‥]+$/, '')) === r0; });
        if (same) {
          var rd = fpRead(rep);
          pre = pre.slice(0, pre.length - sm[2].length) + (rd ? bits.map(function (b) { return rd + b.replace(/^[ぁ-ゖァ-ヶ][ぁぃぅぇぉゃゅょァィゥェォャュョ]?/, ''); }).join('') : '');
        }
      }
      out += pre + rep; last = m.index + w.length;
    }
    return out + q.slice(last);
  };
  /* お前・あんた などは後ろの語を問わずに置き換える（「お前か」「お前から」「お前一人」も）。「君」は熟語と紛れるので、後ろの語を見る */
  var YOU_RE = /お前さん|おまえさん|(?:お前|おまえ|あんた|てめえ|貴様)(?!さん|方)|(?<![大姫主父母諸細若暴ァ-ヶー一-鿿A-Za-z])君(?=(?:たち|達|ら|は|が|も|の|を|に|と|で|って|、|。|！|？|…|」|$|さ|ね|よ|なんか|なら|だけ|しか|だ|じゃ|より|まで|かも|こそ|か|な|から|へ|や|一人|自身))/g;

  /* ---------- 敬語（です・ます調に整える。完全ではないが、口調として読める程度に） ---------- */
  var POLITE_END = /(です|ます|ました|ません|でした|でしょう|ください|ございます|ませんか|ましょう|ませんでした|なさい|でしょうか|ですか|ますか)$/;
  var ADJ_NAI = /(少ない|危ない|仕方ない|しょうがない|情けない|つまらない|くだらない|もったいない|だらしない|切ない|みっともない|あっけない|頼りない|物足りない|はしたない|ぎこちない|さりげない|なさけない|せつない|あぶない|すくない|間違いない|違いない|申し訳ない|面目ない|容赦ない|迷いない|隙がない|余裕がない|しかたない)$/;
  var NOT_TE = /((?:わ|ら|さ|ま)れて|[がも]いて|(?:緊張|興奮|動揺|混乱|感動|後悔|安心|納得|困惑)して|[てで]て|失礼して|好きで|嫌いで|苦手で|得意で|元気で|平気で|本気で|[てで]しまって|ちまって|いっぱいで|一緒で|一人で|二人で|ここで|そこで|どこで|中で|上で|下で|前で|外で|部屋で|おいで|どうして|そして|初めて|改めて|せめて|かつて|なんて|って|すべて|全て|決して|やがて|あえて|まして|とって|もって|かくして|はじめて|あわてて)$/;
  var NOT_I = /(ください|なさい|はい|おい|ちょうだい|くらい|ぐらい|だい|(?<!温|暖|細|柔ら|やわら|で|ちか)かい|せい|ほしい|欲しい|みたい|ばかり)$/;   /* 「温かい」「柔らかい」「でかい」は形容詞 */
  var GODAN_KANJI = '吊釣寄蹴殴縛刈彫狩絞握振散知当渡登踊触謝張譲黙祈帰知入切走要減散握滑焦蹴喋限参怒登乗取送作座守残黙困止戻通触張売祈光鳴眠混当照渡回移残配語計撮探絞縛擦煽捻弄殴刈剃奢誇謝譲遮粘腐盛練測図頼採治祀絡偏凍茂縋翻嘲罵';
  var KU_ADJ = '早強遠近長深高軽速熱甘痛重薄太細固硬低広狭暗明白黒赤青若古新多少良悪弱優激美辛苦怖寒暑温冷柔鋭鈍濃淡';
  var NAI_STEM = { 'ら': 'り', 'か': 'き', 'さ': 'し', 'た': 'ち', 'な': 'に', 'ば': 'び', 'ま': 'み', 'わ': 'い', 'が': 'ぎ' };
  var U2I = { 'く': 'き', 'ぐ': 'ぎ', 'す': 'し', 'つ': 'ち', 'ぬ': 'に', 'ぶ': 'び', 'む': 'み', 'う': 'い', 'る': 'り' };
  var VOL = { 'こ': 'き', 'ご': 'ぎ', 'と': 'ち', 'の': 'に', 'ぼ': 'び', 'も': 'み', 'ろ': 'り', 'お': 'い' };
  function isKanji(ch) { return /[一-鿿々]/.test(ch || ''); }
  var LEX = [
    [/^(誰か|だれか)$/, '$1'], [/^([一二三四五六七八九十]つ|ひとつ|ふたつ|みっつ|よっつ|いつつ)$/, '$1です'],
    [/^うん$/, 'はい'], [/^ううん$/, 'いいえ'], [/^ありがと(う)?$/, 'ありがとうございます'], [/^ごめん(ね)?$/, 'すみません'],
    [/^おはよう$/, 'おはようございます'], [/^おやすみ$/, 'おやすみなさい'], [/^(じゃあね|またね|じゃね)$/, 'では、また'], [/^(うるさい|しつこい|うざい|やばい|すごい|でかい|ずるい)$/, '$1です'], [/^そっか$/, 'そうですか'],
    [/^わかった$/, 'わかりました'], [/^了解$/, '了解です'], [/^大丈夫$/, '大丈夫です'], [/^いいよ$/, 'いいですよ'], [/^そうだね$/, 'そうですね'],
    [/^ほんと(に)?\?$/, '本当ですか？'], [/^何$/, '何ですか'], [/^は\?$/, 'はい？'], [/^よし$/, 'よし'], [/^ばか$/, 'ばか'],
    [/^(まだ|もう|また|まあ)$/, '$1'], [/てくれ$/, 'てください'], [/でくれ$/, 'でください'], [/([^ん])だって$/, '$1ですって']
  ];
  /* 文末の核を丁寧形に（変えられなければ null） */
  var TA = { 'なった': 'なりました', 'あった': 'ありました', '言った': '言いました', '思った': '思いました', '行った': '行きました', 'やった': 'やりました', '終わった': '終わりました', '困った': '困りました', '待った': '待ちました', '会った': '会いました', '知った': '知りました', '買った': '買いました', '笑った': '笑いました', 'もらった': 'もらいました', 'しまった': 'しまいました', '勝った': '勝ちました', '取った': '取りました', '帰った': '帰りました', '入った': '入りました', '乗った': '乗りました', '作った': '作りました', '使った': '使いました', '違った': '違いました', '持った': '持ちました', '立った': '立ちました', '撮った': '撮りました', '言っちゃった': '言ってしまいました', 'わかった': 'わかりました', '分かった': '分かりました', '良かった': '良かったです', 'よかった': 'よかったです', '泣いた': '泣きました', '書いた': '書きました', '聞いた': '聞きました', '着いた': '着きました', '気づいた': '気づきました', '驚いた': '驚きました', '働いた': '働きました', '歩いた': '歩きました', '死んだ': '死にました', '飲んだ': '飲みました', '読んだ': '読みました', '選んだ': '選びました', '遊んだ': '遊びました', '呼んだ': '呼びました', '住んだ': '住みました', '頼んだ': '頼みました', '休んだ': '休みました', '済んだ': '済みました', '頑張った': '頑張りました', '払った': '払いました', '洗った': '洗いました', '拾った': '拾いました', '迷った': '迷いました', '座った': '座りました', '祈った': '祈りました', '誘った': '誘いました', '謝った': '謝りました', '黙った': '黙りました', '戻った': '戻りました', '残った': '残りました', '送った': '送りました', '怒った': '怒りました', '触った': '触りました', '守った': '守りました', '歌った': '歌いました', '手伝った': '手伝いました', '嫌った': '嫌いました', '失った': '失いました', '救った': '救いました' };
  var IMP2 = [[/行け$/, '行ってください'], [/逃げろ$/, '逃げてください'], [/生きろ$/, '生きてください'], [/起きろ$/, '起きてください'], [/見ろ$/, '見てください'], [/寝ろ$/, '寝てください'], [/出ろ$/, '出てください'], [/残れ$/, '残ってください'], [/走れ$/, '走ってください'], [/帰れ$/, '帰ってください'], [/戻れ$/, '戻ってください'], [/止まれ$/, '止まってください'], [/座れ$/, '座ってください'], [/出せ$/, '出してください'], [/返せ$/, '返してください'], [/貸せ$/, '貸してください'], [/書け$/, '書いてください'], [/聞け$/, '聞いてください'], [/動け$/, '動いてください'], [/進め$/, '進んでください'], [/休め$/, '休んでください'], [/集まれ$/, '集まってください'], [/下がれ$/, '下がってください'], [/伏せろ$/, '伏せてください'], [/答えろ$/, '答えてください'], [/信じろ$/, '信じてください'], [/任せろ$/, '任せてください'], [/掴まれ$/, '掴まってください']];
  /* 五段の命令（飲め・付き合え・引け）。名詞と紛れないよう、動詞として使う漢字だけ */
  var IMP_K = {
    'え': ['言買使払洗歌会笑戦従誓伝合拾祝吸追問思食謝奪救狙酔揃雇扱迷願', 'って'], 'け': ['書聞引置開抱歩動泣拭磨叩吐退突招解巻除導描向働頷囁呟行', 'いて'],
    'げ': ['急泳脱騒稼防注仰塞繋漕剥', 'いで'], 'せ': ['出返貸離探話許殺消押渡隠回落戻倒起鳴指示伸干放正済', 'して'], 'て': ['待持立勝打放', 'って'],
    'ね': ['死', 'んで'], 'べ': ['呼遊選飛運学並浮結喜叫転', 'んで'], 'め': ['飲読休進頼掴込悩噛盗踏包編積揉挟恨望拝住摘', 'んで'],
    'れ': ['眠帰戻座入乗切取残守作送握祈黙殴蹴譲張謝触登踊渡当知散振測計撮釣狩彫刈縛配減絞', 'って']
  };
  function godanImp(s) {
    if (/(時間|電池|期限|品|息|充電|在庫|弾)切れ$/.test(s)) return null;
    var m = s.match(/([一-鿿々])([えけげせてねべめれ])$/), k = m && IMP_K[m[2]];
    if (!k || k[0].indexOf(m[1]) < 0) return null;
    return s.slice(0, -1) + (m[1] === '行' ? 'って' : k[1]) + 'ください';
  }
  V.godanImp = godanImp;
  function core(s, noTe) {
    if (!s || POLITE_END.test(s)) return null;
    var m, ta = s.match(/(なった|あった|言った|思った|行った|やった|終わった|困った|待った|会った|知った|買った|笑った|もらった|しまった|勝った|取った|帰った|入った|乗った|作った|使った|違った|持った|立った|撮った|言っちゃった|わかった|分かった|良かった|よかった|泣いた|書いた|聞いた|着いた|気づいた|驚いた|働いた|歩いた|死んだ|飲んだ|読んだ|選んだ|遊んだ|呼んだ|住んだ|頼んだ|休んだ|済んだ|頑張った|払った|洗った|拾った|迷った|座った|祈った|誘った|謝った|黙った|戻った|残った|送った|怒った|触った|守った|歌った|手伝った|嫌った|失った|救った)$/);
    if (ta) return s.slice(0, -ta[1].length) + TA[ta[1]];
    if (/わけ(?:が)?ない$/.test(s)) return s.replace(/ない$/, 'ありません');
    /* 「頼んだよ」「言ったね」：過去形＋よ・ね（「頼んですよ」にしない） */
    var tp = s.match(/^(.+?)(よ|ね)$/), tc = tp && /(た|だ)$/.test(tp[1]) && !/(なんだ|のだ|んだ)$/.test(tp[1].replace(/([頼読飲住済休呼遊選死])んだ$/, '$1X')) ? core(tp[1], true) : null;
    if (tc && /ました$/.test(tc)) return tc + tp[2];
    if (/ーれだ$/.test(s)) return null;
    if (/ごめん(ね|な)?$/.test(s) && !/ごめんなさい$/.test(s)) return s.replace(/ごめん(ね|な)?$/, 'すみません');
    if (/ありがと(う)?$/.test(s)) return s.replace(/ありがと(う)?$/, 'ありがとうございます');
    for (var k = 0; k < IMP2.length; k++) if (IMP2[k][0].test(s)) return s.replace(IMP2[k][0], IMP2[k][1]);
    if (/(?:^|[^ぁ-ん]|て|で|に|へ|っち)こい$/.test(s)) return s.replace(/こい$/, 'きてください');
    /* 「しとけ」「覚えとけ」→「〜といてください」／五段の命令（飲め・付き合え・読め） */
    if (/とけ$/.test(s) && s.length >= 3) return s.replace(/とけ$/, 'といてください');
    if ((m = godanImp(s))) return m;
    if (!noTe && /(?:^|[^ぁ-ん])(見|寝|出|着|来)て$/.test(s) && !/(見|寝|出|着|来)て(から|も)$/.test(s)) return s + 'ください';
    /* 「〜って」のお願い（「待って」「やって」「奢って」）。「〜と思って」などの言いさしは除く */
    if (!noTe && /(?:[一-鿿々]|や|もら|しま|手伝|使|笑|頑張|がんば|払|行)って$/.test(s) && !/(思|かと|と言|知|[てで]しま)って$/.test(s) && s.length >= 3) return s + 'ください';
    if (/[えけげせぜてでねへべめれ]ろ$/.test(s)) return s.replace(/ろ$/, 'てください');
    if (/だよね$/.test(s)) return s.replace(/だよね$/, 'ですよね');
    if (/だよ$/.test(s)) return s.replace(/だよ$/, 'ですよ');
    if (/だね$/.test(s)) return s.replace(/だね$/, 'ですね');
    if (/だな$/.test(s)) return s.replace(/だな$/, 'ですね');
    if (/だぞ$/.test(s)) return s.replace(/だぞ$/, 'ですよ');
    if (/だろ(う)?$/.test(s)) return s.replace(/だろ(う)?$/, 'でしょう');
    if (/でしょ$/.test(s)) return s + 'う';
    if (/じゃん$/.test(s)) return s.replace(/じゃん$/, 'じゃないですか');
    if (/だった$/.test(s)) return s.replace(/だった$/, 'でした');
    if (/(なの|なんだ)$/.test(s) && !/[こそあど]んなの$/.test(s)) return s.replace(/(なの|なんだ)$/, 'なんです');
    if (/(さん|ちゃん|様|先生)だ$/.test(s)) return s.replace(/だ$/, 'です');
    /* 「頼んだ」「呼んだ」「死んだ」は過去形（「頼んです」にしない） */
    if ((m = s.match(/([頼読飲住済噛産悩踏盗編恨込望楽休進挟睨拝刻組積包澄]|[呼遊選並喜運飛結転叫浮学]|死)んだ$/))) return s.slice(0, -2) + (/[呼遊選並喜運飛結転叫浮学]/.test(m[1]) ? 'び' : m[1] === '死' ? 'に' : 'み') + 'ました';
    if ((m = s.match(/([うくすつぬぶむるぐいたなだ])んだ$/))) return s.replace(/んだ$/, 'んです');
    /* 「雨が降らないんじゃない」→「〜ないんじゃないんです」 */
    if (/ないんじゃない$/.test(s)) return s + 'んです';
    if (/(?:いい|良い)んじゃない$/.test(s)) return s + 'ですか';
    if (/(なんか|なんて|は|も|が|しか|じゃ|では|でも)ない$/.test(s)) return s + 'です';
    if (/んだ$/.test(s)) return s + 'んです';
    if (/[泳脱騒急稼嗅継注仰剥紡]いだ$/.test(s)) return s.replace(/いだ$/, 'ぎました');
    if (/のだ$/.test(s)) return s.replace(/のだ$/, 'のです');
    if (/だ$/.test(s)) return s.replace(/だ$/, 'です');
    /* 命令・禁止・お願い */
    var IMP = [[/しろ$/, 'してください'], [/やめろ$/, 'やめてください'], [/待て$/, '待ってください'], [/黙れ$/, '黙ってください'], [/来い$/, '来てください'], [/寄越せ$/, 'ください'], [/よこせ$/, 'ください'], [/離せ$/, '離してください'], [/見せろ$/, '見せてください'], [/言え$/, '言ってください'], [/するな$/, 'しないでください'], [/見るな$/, '見ないでください'], [/言うな$/, '言わないでください'], [/触るな$/, '触らないでください'], [/笑うな$/, '笑わないでください'], [/来るな$/, '来ないでください']];
    for (var i = 0; i < IMP.length; i++) if (IMP[i][0].test(s)) return s.replace(IMP[i][0], IMP[i][1]);
    /* 「〜て」「〜んで・〜いで」のお願い（「お任せで」「楽しみで」「残業続きで」のような名詞＋「で」はお願いではない） */
    if (!noTe && !NOT_TE.test(s) && (/て$/.test(s) && /[っんしきぎちにびみりいえけげせぜてでねべめれ]$/.test(s.slice(0, -1).slice(-1)) || /(?:[一-鿿ぁ-ん]ん|[泳急稼脱嗅継注仰剥紡騒]い)で$/.test(s)) || /ないで$/.test(s)) return s + 'ください';
    /* 否定 */
    /* 名詞＋ない（関係ない・意味ない・興味ない） */
    if (/(関係|意味|興味|問題|時間|余裕|自信|用|元気|覚え|記憶|心当たり|文句|容赦|金|気|暇)ない$/.test(s) || /[一-鿿々]{2,}ない$/.test(s) && !/[出見寝着来居似煮得経]ない$/.test(s)) return s.replace(/ない$/, 'ありません');
    if (/じゃない$/.test(s)) return s + 'です';
    if (ADJ_NAI.test(s) || /(良く|よく|くて|しく|く)ない$/.test(s)) return s + 'です';
    /* 「待てない」「捨てない」のように、て で終わる語幹の動詞は「待てません」（「待ていません」にしない） */
    if (/(?:待|勝|持|保|捨|建|育|慌|当|立|企|隔|果|打|撃|討|絶|断|満|裁|充|宛)てない$/.test(s)) return s.replace(/ない$/, 'ません');
    if (/てない$/.test(s)) return s.replace(/てない$/, 'ていません');
    if (/しない$/.test(s)) return s.replace(/しない$/, 'しません');
    if (/こない$/.test(s)) return s.replace(/こない$/, 'きません');
    /* 「本当にない」「ここにない」の「に」は助詞（似ない・煮ないは別） */
    if (/[^似煮]にない$/.test(s)) return s.replace(/ない$/, 'ありません');
    if ((m = s.match(/(.)ない$/))) {
      if (NAI_STEM[m[1]]) return s.slice(0, -3) + NAI_STEM[m[1]] + 'ません';
      if (/[えけげせぜてでねへべめれいきぎじちにびみり]/.test(m[1]) || isKanji(m[1])) return s.slice(0, -2) + 'ません';
      return s + 'です';
    }
    /* 「〜ちゃった」「〜ていた」 */
    if (/[ちじ]ゃった$/.test(s)) return s.replace(/ゃった$/, 'ゃいました');
    if (/[てで]いた$/.test(s)) return s.replace(/いた$/, 'いました');
    /* 動詞の「〜なかった」は「〜なかったんです」（形容詞・名詞の否定は「〜なかったです」） */
    if (/なかった$/.test(s)) return /(く|じゃ|では|は|も|が|しか|なんて|なんか)なかった$/.test(s) ? s + 'です' : s + 'んです';
    /* 過去 */
    /* 五段動詞の過去（「助かった」→「助かりました」。形容詞の「〜かった」より先に見る） */
    if ((m = s.match(/(助か|分か|わか|終わ|始ま|決ま|変わ|集ま|捕ま|見つか|戻|帰|入|眠|座|困|触|走|取|作|送|握|祈|謝|頑張|がんば|守|残|知|乗|切|登|踊|降)った$/))) return s.slice(0, -2) + 'りました';
    if ((m = s.match(/(言|会|買|使|払|笑|思|歌|手伝|拾|誘|違|洗|迷|願|吸|追|救|戦|酔|揃|狙|誓|祝|伴|拭|縫|従|補|舞|習|扱|敬|争|奪|雇|養|囲|味わ|戸惑|向か|間に合|似合|話し合|もら|貰|負|背負|食|叶|整|疑|見舞|通|飼|這|沿|添|問|請|唄|繕|弔|逆ら|嫌が|怖が|占|漂|賄|潤)った$/))) return s.slice(0, -2) + 'いました';
    if (/(?:^|[^ぁ-ん])行った$/.test(s)) return s.replace(/行った$/, '行きました');
    /* そのほかの「〜った」は「る」の動詞として（「絞った」「止まった」「上がった」「なった」→「〜りました」） */
    if (/(?:[一-鿿々][まがわらさたなばやざこもど]?|浸か|預か|授か|儲か|掛か|かか|引っかか|な|まわ|かぶ|しゃべ|ねじ|いじ|さわ|くば)った$/.test(s) && !/(?:よ|良|な|無|多|強|弱|高|低|安|早|遅|長|短|広|狭|重|軽|暑|寒|熱|冷|痛|辛|甘|苦|若|古|新|黒|白|赤|青|丸|太|細|深|浅|近|遠|怖|恐|偉|硬|固|柔|眠|暗|明|醜|美|楽|悲|嬉|寂|淋|悔|恋|欲|惜|危|汚|旨|鋭|鈍|濃|薄|固|厚|酸|渋|偉|凄|すご|うま|まず|ひど|えら|つら|ずる|うるさ|ぬる|かわい|かっこよ|かた|やわらか|おもしろ|面白|おいし|美味し|たのし|うれし|かなし|さみし|さびし|くやし|はずかし|恥ずかし|あぶな|きたな|せま|ひろ|おそ|はや|ちか|とお|おも|かる|あつ|さむ|つめた|いた|こわ|ねむ|くら|あか|しろ|くろ|あお|わか|ふる|あたらし|やさし|優し|きびし|厳し|むずかし|難し|たかか)かった$/.test(s)) return s.slice(0, -2) + 'りました';
    if ((m = s.match(/(待|持|立|勝|打|育)った$/))) return s.slice(0, -2) + 'ちました';
    if ((m = s.match(/(読|飲|休|住|済|進|悩|頼|楽し|喜|遊|呼|選|叫|並|学|飛|運|結|転|死)んだ$/))) { var nb = s.slice(-3, -2); return s.slice(0, -2) + ({ '読': 'み', '飲': 'み', '休': 'み', '住': 'み', '済': 'み', '進': 'み', '悩': 'み', '頼': 'み', 'し': 'み', '喜': 'び', '遊': 'び', '呼': 'び', '選': 'び', '叫': 'び', '並': 'び', '学': 'び', '飛': 'び', '運': 'び', '結': 'び', '転': 'び', '死': 'に' }[nb] || 'み') + 'ました'; }
    if ((m = s.match(/(聞|書|置|開|抱|歩|動|泣|吹|描|向|働|頷|気づ|気付|着|届|驚|輝|磨|叩|巻|招|導|続|思いつ|追いつ|片づ|片付|近づ|近付|傷つ|傷付|寝つ|つ)いた$/))) return s.slice(0, -2) + 'きました';
    if (/かった$/.test(s)) return s + 'です';
    /* 「出来すぎ」「やりすぎ」（言いさし）→「〜すぎです」 */
    if (/(?:すぎ|過ぎ)$/.test(s) && s.length >= 3) return s + 'です';
    /* 「〜つもり」「〜はず」（言いさし）→「〜つもりです」 */
    if (/(?:つもり|はず)$/.test(s) && s.length >= 4) return s + 'です';
    /* 「説明がつく」「片がつく」→「〜つきます」 */
    if (/(?:が|に|は|も|で)つく$/.test(s)) return s.replace(/つく$/, 'つきます');
    if (/した$/.test(s)) return s.replace(/した$/, 'しました');
    if ((m = s.match(/(.)た$/)) && (/[えけげせぜてでねへべめれきぎじびみりちに]/.test(m[1]) || isKanji(m[1]))) return s.slice(0, -1) + 'ました';
    /* 意向（〜しよう） */
    if (/しよう$/.test(s)) return s.replace(/しよう$/, 'しましょう');
    if (/[えけげせぜてでねへべめれ]よう$/.test(s)) return s.replace(/よう$/, 'ましょう');
    if ((m = s.match(/(.)(.)う$/)) && isKanji(m[1]) && VOL[m[2]] && !/向こう$/.test(s)) return s.slice(0, -2) + VOL[m[2]] + 'ましょう';
    if (/(出|見|寝|着|来|居)よう$/.test(s)) return s.replace(/よう$/, 'ましょう');
    if ((m = s.match(/(過ごそ|話そ|探そ|流そ|返そ|渡そ|隠そ|消そ|押そ|直そ|試そ|戻ろ|帰ろ|やろ|がんばろ|くっつこ|いこ|あそぼ|かえろ|もどろ|おくろ|はじめよ|たべよ|ねよ|でよ|みよ)(う)$/))) {
      var vb = s.slice(0, -1), vl = vb.slice(-1);
      if (/よ$/.test(vb)) return vb.slice(0, -1) + 'ましょう';
      if (vl === 'そ') return vb.slice(0, -1) + 'しましょう';
      if (VOL[vl]) return vb.slice(0, -1) + VOL[vl] + 'ましょう';
    }
    /* 「いく」「おく」「ちゃう」「もらう」「しまう」 */
    if (/(いく|行く)$/.test(s)) return s.replace(/く$/, 'きます');
    if (/[てで]おく$/.test(s) || /っておく$/.test(s)) return s.replace(/おく$/, 'おきます');
    if (/[ちじ]ゃう$/.test(s)) return s.replace(/ゃう$/, 'ゃいます');
    if (/(もらう|しまう)$/.test(s)) return s.replace(/う$/, 'います');
    /* 名詞・形容動詞で言い切る（好き・嫌い・本当・最悪） */
    if (/(大好き|大嫌い|好き|嫌い|平気|無理|本当|本気|心配|不安|最高|最悪|残念|大事|大切|必要|当然|当たり前|同じ|一緒|大丈夫|嘘|うそ)$/.test(s) && s.length >= 2) return s + 'です';
    /* 動詞の言い切り */
    if (/する$/.test(s)) return s.replace(/する$/, 'します');
    if (/(くる|来る)$/.test(s)) return s.replace(/(くる|来る)$/, function (x) { return x === '来る' ? '来ます' : 'きます'; });
    if (/(いる|ある|できる|なる|わかる|分かる|やる)$/.test(s)) return s.replace(/(いる|ある|できる|なる|わかる|分かる|やる)$/, function (x) { return { 'いる': 'います', 'ある': 'あります', 'できる': 'できます', 'なる': 'なります', 'わかる': 'わかります', '分かる': '分かります', 'やる': 'やります' }[x]; });
    /* ひらがなで書いた五段動詞（「しゃべる」「はしる」）は「ります」（「食べる」型と取り違えない） */
    if (/(しゃべ|にぎ|あせ|すべ|ねば|はし|しげ|ののし)る$/.test(s) || /(^|[にへでをがもはと、])はいる$/.test(s)) return s.slice(0, -1) + 'ります';
    if ((m = s.match(/(.)る$/))) {
      if (/[えけげせぜてでねへべめれいきぎじちにびみり]/.test(m[1])) return s.slice(0, -1) + 'ます';
      if (isKanji(m[1])) return s.slice(0, -1) + (GODAN_KANJI.indexOf(m[1]) >= 0 ? 'ります' : 'ます');
      return s.slice(0, -1) + 'ります';
    }
    if ((m = s.match(/(.)([くぐすつぬぶむう])$/)) && isKanji(m[1]) && !(m[2] === 'く' && KU_ADJ.indexOf(m[1]) >= 0)) return s.slice(0, -1) + U2I[m[2]] + 'ます';
    /* 形容詞 */
    if (/い$/.test(s) && !NOT_I.test(s) && s.length >= 2) return s + 'です';
    if (/(ほしい|欲しい|みたい)$/.test(s)) return s + 'です';
    return null;
  }
  var PART = /(ってば|かしら|よね|よな|かな|だよ|わよ|わね|のよ|もん|よ|ね|な|ぞ|ぜ|わ|の|か)$/;
  /* 禁止（〜するな → 〜しないでください） */
  function prohibit(s) {
    if (/(やる|いる|ある|なる|わかる|分かる|できる)な$/.test(s) || /[おこそとのほもよろごぞどぼょ]うな$/.test(s)) return null;
    /* 独り言の「〜な」（「毎回悩むな」「つい考えちゃうな」）は禁止ではない */
    if (/(毎回|いつも|つい|よく|我ながら|本当に|ほんとに|まったく|やっぱり|しみじみ)[^、。！？]*な$/.test(s) || /か、[^、。！？]*な$/.test(s)) return null;
    if (/するな$/.test(s)) return s.replace(/するな$/, 'しないでください');
    /* くだけた禁止（「すんな」「見んな」「来んな」「触んな」） */
    if (/すんな$/.test(s)) return s.replace(/すんな$/, 'しないでください');
    if (/(来|く)んな$/.test(s)) return s.replace(/(来|く)んな$/, '来ないでください');
    if (/(見|寝|出|着)んな$/.test(s)) return s.replace(/んな$/, 'ないでください');
    if (/(触|帰|乗|入|座|喋|しゃべ|ふざけ|なめ|舐め|調子乗)んな$/.test(s)) return s.replace(/んな$/, /(ふざけ|なめ|舐め)$/.test(s.slice(0, -2)) ? 'ないでください' : 'らないでください');
    if (/(来る|くる)な$/.test(s)) return s.replace(/(来る|くる)な$/, '来ないでください');
    var m = s.match(/(.)(る|う|く|す|つ|む|ぶ|ぐ|ぬ)な$/);
    if (!m) return null;
    var stem = s.slice(0, -2), last = m[2], pre = m[1];
    if (last === 'る' && /[えけげせぜてでねへべめれいきぎじちにびみり]/.test(pre)) return stem + 'ないでください';
    if (last === 'る' && isKanji(pre) && GODAN_KANJI.indexOf(pre) < 0) return stem + 'ないでください';
    return stem + { 'る': 'ら', 'う': 'わ', 'く': 'か', 'す': 'さ', 'つ': 'た', 'む': 'ま', 'ぶ': 'ば', 'ぐ': 'が', 'ぬ': 'な' }[last] + 'ないでください';
  }
  V.politeSentence = function (s0, noTe, ask) {
    /* 問いかけの「〜て？」（「何が、入って……！？」）はお願いではない */
    if (ask) noTe = true;
    var tail = (s0.match(/[っッー〜～…♡♪、]+$/) || [''])[0], s = s0.slice(0, s0.length - tail.length);
    if (!s) return s0;
    var lead = (s.match(/^[…‥・、\s]+/) || [''])[0], body = s.slice(lead.length);
    /* 間投詞の問い（「あれ？」「おや？」）はそのまま */
    if (ask && /^(?:あれ|あれれ|あら|おや|ん|へ|は|え|ほう|へえ)$/.test(body)) return s0;
    /* 「すまない」「だが、」「〜だっけ」「誰が〜したんだ」 */
    if (/^すまない$/.test(body)) return lead + 'すみません' + tail;
    if (/^だが、/.test(body)) { var dg = V.politeSentence(body.slice(3), noTe, ask); return lead + 'でも、' + dg + tail; }
    if (/[んの]だっけ$/.test(body)) return lead + body.replace(/[んの]だっけ$/, 'んでしたっけ') + tail;
    if (/だっけ$/.test(body)) return lead + body.replace(/だっけ$/, 'でしたっけ') + tail;
    if (/(?:何|なに|誰|だれ|どこ|いつ|なぜ|どうして|なんで|どっち|どれ)/.test(body) && /[るたいうくすつむぐぶ]んだ$/.test(body)) return lead + body.replace(/んだ$/, 'んですか') + tail;
    /* 「来なさる」（尊敬の言い切り）→「来なさいます」 */
    if (/なさる$/.test(body)) return lead + body.replace(/(来)?なさる$/, function (x, k) { return k ? '来られます' : 'られます'; }) + tail;
    /* 「仕事帰りの楽しみでね」→「〜楽しみなんですよ」 */
    if (/の[^、。のでに]{1,8}(?<![んい])でね$/.test(body) && !/^(?:それ|あれ|これ|で)でね$/.test(body)) return lead + body.replace(/でね$/, 'なんですよ') + tail;
    for (var i = 0; i < LEX.length; i++) if (LEX[i][0].test(body)) return lead + body.replace(LEX[i][0], LEX[i][1]) + tail;
    /* 敵意のある台詞を敬語にするとき（後輩から先輩へ など）の崩れを防ぐ
       ・「うわ、ハルカ先輩だ」→「うわ、ハルカ先輩」（名前に「です」を付けない）
       ・「消えな」→「消えてください」（命令の「〜な」）
       ・「無事だったか、よかった」→「無事だったんですね、よかったです」
       ・「話したくないかな」→「話したくないです」（自分の気持ちに「でしょうか」を付けない）
       ・「今日はついてない」→「今日はついてないですね」 */
    var ex = body.match(/^(うわ|うっわ|げっ|げ|うげ|うえ)、(.{1,14}?(?:先輩|さん|くん|君|ちゃん|[一-鿿ァ-ヶー]))(?:だ|かよ)?$/);
    if (ex) return lead + ex[1] + '、' + ex[2] + tail;
    var imp = body.match(/^(.*[一-鿿][えけせてねべめれ])な$/);
    if (imp) return lead + imp[1] + 'てください' + tail;
    body = body.replace(/だったか、(?=.)/g, 'だったんですね、');
    if (/(?:たい|たくない)かな$/.test(body)) return lead + body.replace(/かな$/, 'です') + tail;
    if (/ついてない$/.test(body)) return lead + body + 'ですね' + tail;
    s = lead + body;
    if (/^(?:ねえ|ねぇ|なあ|おい)$/.test(body)) return lead + 'あの' + tail;
    if (/^[ぁ-んァ-ヶー…っッ、!！?？\s]{1,4}$/.test(s) && !(/[^まただや]だ$/.test(s) && s.length >= 3)) return s0;
    /* 「〜ねえ」（知らねえ・許さねえ・仕方ねえ）は「〜ない」として言い換える */
    var ne = s.match(/^(.*[ぁ-ん一-鿿])(ねえ|ねぇ|ねー)(ぞ|よ|な|か|って)?$/);
    if (ne && /[うくすつぬぶむる]んじゃ$/.test(ne[1])) { var pj = prohibit(ne[1].slice(0, -3) + 'な'); if (pj) return pj + tail; }
    if (ne && (/[らかさたなばまわがりきしちにびみいけせてねべめれえくじゃもはが]$/.test(ne[1]) || /(仕方|関係|問題|意味|用|興味|容赦|余裕|自信|覚え|文句)$/.test(ne[1])) && !/^(?:ねえ|ねぇ|ねー)$/.test(body)) return V.politeSentence(ne[1].replace(/じゃ$/, 'じゃ') + 'ない' + (ne[3] === 'ぞ' ? 'よ' : ne[3] === 'な' ? 'ね' : ne[3] || '') + tail, noTe, ask);
    /* 「〜かよ」：動詞なら「〜しませんよ」（逃がすかよ）、ほかは「〜ですか」（いきなりかよ） */
    var ky = s.match(/^(.+?)かよ$/);
    if (ky) {
      var kc = /[うくすつぬぶむる]$/.test(ky[1]) && !/(ある|いる)$/.test(ky[1]) ? core(ky[1], true) || (/[ぁ-ん一-鿿][くぐすつぬぶむう]$/.test(ky[1]) ? ky[1].slice(0, -1) + U2I[ky[1].slice(-1)] + 'ます' : null) : null;
      if (kc && /ます$/.test(kc)) return kc.replace(/ます$/, 'ませんよ') + tail;
      return ky[1].replace(/(んだ|のだ|なんだ)$/, 'んです') + (/(です|ます)$/.test(ky[1].replace(/(んだ|のだ|なんだ)$/, 'んです')) ? 'か' : 'ですか') + tail;
    }
    /* 「しよ」「行こ」「くっつこ」（意向の言いさし）→「〜ましょう」、「しよっか」→「しましょうか」 */
    var vs = s.match(/^(.*?)(しよ|行こ|いこ|帰ろ|やろ|遊ぼ|寝よ|くっつこ|食べよ|出よ|戻ろ)(っか|か|よ)?$/);
    if (vs) { var vr = V.politeSentence(vs[1] + vs[2] + 'う', noTe, ask); if (vr !== vs[1] + vs[2] + 'う') return vr + (vs[3] === 'っか' || vs[3] === 'か' ? 'か' : vs[3] || '') + tail; }
    if (/[よそ]っか$/.test(s) && !/^(そっか|まあいっか|いっか)$/.test(body)) { var vk = V.politeSentence(s.replace(/っか$/, 'うか'), noTe, ask); if (vk !== s.replace(/っか$/, 'うか')) return vk + tail; }
    /* 「〜かも」「〜かもよ」 */
    if (/かも(よ|ね)?$/.test(s) && !/しれ/.test(s)) return lead + body.replace(/かも(よ|ね)?$/, function (x, y) { return 'かもしれません' + (y || ''); }) + tail;
    /* 「なんで避けないのよ」→「なんで避けないんですか」 */
    if (/(なんで|どうして|何|誰|どこ|いつ|なぜ)/.test(s) && /のよ$/.test(s)) return lead + body.replace(/のよ$/, 'んですか') + tail;
    /* 言いさし（〜けど・〜し・〜から）：前の言い切りを丁寧にする */
    var cj = s.match(/^(.+?)(けど|けれど|し|から)(ね|な|よ)?$/);
    if (cj && !/(です|ます|ません|でした|ました|でしょう)$/.test(cj[1]) && !(cj[2] === 'し' && !/(ない|なかった|た|い|る|だ)$/.test(cj[1])) && !(cj[2] === 'から' && /[^ぁ-ん]$|だ$/.test(cj[1]))) {
      var cb = cj[1].replace(/^[…‥・、\s]+/, ''), cl = cj[1].slice(0, cj[1].length - cb.length), cc;
      if (/(んだ|のだ)$/.test(cb)) cc = cb.replace(/(んだ|のだ)$/, 'んです');
      else if (cj[2] === 'し' && /(ない|なかった|い|かった)$/.test(cb) && !/(しない|てない|こない)$/.test(cb)) cc = cb + 'です';
      else cc = core(cb, true);
      if (cc && cc !== cb) return cl + cc + cj[2] + (cj[3] === 'な' ? 'ね' : cj[3] || '') + tail;
    }
    /* 「それで……」「なので」などは、お願いの「て」ではない */
    if (/(それで|これで|あれで|そこで|なので|ので|なんで|どうして)$/.test(body)) return s0;
    /* 「〜たりして」は冗談めかした言い切り（お願いではない） */
    if (/[ただ]りして$/.test(s)) return lead + body + 'ね' + tail;
    /* 「なんで〜んだよ」→「なんで〜んですか」／「〜だから」→「〜ですから」 */
    if (/(なんで|どうして|何|誰|どこ|いつ|なぜ)/.test(s) && /[んの]だよ$/.test(s)) return lead + body.replace(/[んの]だよ$/, 'んですか') + tail;
    if (/[^ぁ-ん、]だから$/.test(s) || /(だけ|なん|ん)だから$/.test(s)) return lead + body.replace(/だから$/, 'ですから') + tail;
    /* 〜のか（問い詰め）：「売ったのか」→「売ったんですか」 */
    if (/[^な]のか$/.test(s)) { var st2 = s.slice(0, -2); if (/[るうくすつぬぶむぐたい]$/.test(st2)) return st2 + 'んですか' + tail; }
    /* 〜の（問いかけ・言い切り） */
    if (/[^な]の$/.test(s) && !/(もの|この|その|あの|どの)$/.test(s)) {
      var stem = s.slice(0, -1);
      if (/[るうくすつぬぶむぐたいなだ]$/.test(stem) || /てる$/.test(stem)) return stem.replace(/だ$/, 'な') + 'んです' + (ask || /(なんで|どうして|何|誰|どこ|いつ|どう)/.test(s) ? 'か' : '') + tail;
    }
    /* 「言いなよ」「休みなよ」（すすめ）→「言ってください」 */
    if (/[見寝着出来]なよ$/.test(s)) return lead + body.replace(/なよ$/, 'てください') + tail;
    var nm = s.match(/^(.*[一-鿿ぁ-ん])([いきぎしちにびみりえけげせてねべめれ])なよ$/);
    if (nm && !/(ない|たい|しい|らしい|みたい|きれい|嫌い|好き|大き|小さ|すてき|素敵)なよ$/.test(s)) {
      var TE = { 'い': 'って', 'ち': 'って', 'り': 'って', 'き': 'いて', 'ぎ': 'いで', 'し': 'して', 'に': 'んで', 'び': 'んで', 'み': 'んで' };
      var te = TE[nm[2]] || nm[2] + 'て';
      if (/^(?:見|寝|着|居|似|煮)$/.test(nm[1].slice(-1)) && nm[2] === 'い') te = 'いて';
      /* 「話しかけてみなよ」の「〜てみ」は一段の「みる」（「話しかけてんで」にしない） */
      if (nm[2] === 'み' && /[てで]$/.test(nm[1])) te = 'みて';
      return lead + nm[1] + te + 'ください' + tail;
    }
    var ph = prohibit(s);
    if (ph) return ph + tail;
    var c = core(s, noTe);
    if (c) return c + (ask && /んです$/.test(c) ? 'か' : '') + tail;
    if (ask && (isKanji(s.slice(-1)) || /[ァ-ヶー]$/.test(s) || /(?:こと|あなた|みなさん|いつ|どこ|だれ|なに|どれ|ひま|つもり|ほんと|まじ|マジ)$/.test(s)) && !/(?:^|、)(?:なになに|なに|何何)$/.test(body)) return s + 'ですか' + tail;
    var pm = s.match(PART);
    if (pm && s.length > pm[1].length) {
      var p = pm[1], rest = s.slice(0, -p.length), rc = POLITE_END.test(rest) ? rest : core(rest, noTe);
      var pr = prohibit(rest);
      if (pr && (p === 'よ' || p === 'って')) return pr + 'ね' + tail;
      if (p === 'な' && /る$/.test(rest)) { var rn = core(rest, noTe); return rn ? rn + 'ね' + tail : s0; }
      if (p === 'さ' && !/[ぁ-ん]$/.test(rest)) return s0;
      if (!rc) rc = isKanji(rest.slice(-1)) || /(?:[ァ-ヶーき]|あなた|みなさん)$/.test(rest) ? rest + 'です' : null;
      if (!rc) return s0;
      var np = { 'よ': 'よ', 'ね': 'ね', 'よね': 'よね', 'よな': 'よね', 'さ': 'よ', 'ぞ': 'よ', 'ぜ': 'よ', 'わ': 'よ', 'わよ': 'よ', 'わね': 'ね', 'だよ': 'よ', 'のよ': 'よ', 'な': 'ね', 'か': 'か', 'かな': 'か', 'かしら': 'か', 'もん': 'から', 'ってば': 'ってば', 'の': 'か' }[p];
      if (p === 'の') return rc + 'か' + tail;
      /* 「仕方ないかな」→「仕方ないかもしれません」、「来るかな」→「来るでしょうか」 */
      if ((p === 'かな' || p === 'かしら') && /ない$/.test(rest) && !/(?:てくれ|でくれ|てもらえ|でもらえ)ない$/.test(rest)) return rest + 'かもしれません' + tail;
      if ((p === 'かな' || p === 'かしら') && /[るうくすつむぬぐぶたい]$/.test(rest) && !/(?:たい|[よおこそとのもろごぼ]う)$/.test(rest)) return rest + 'でしょうか' + tail;
      if (p === 'かな' || p === 'かしら') rc = rc.replace(/です$/, 'でしょう');
      return rc + np + tail;
    }
    return s0;
  };
  V.polite = function (q) {
    /* 荒い念押し「〜ただろうが」は「〜たでしょう」に（敬語にしても荒さが残らないように） */
    q = q.replace(/([てで]た|った|た)だろうが(?=[！!。…」]|$)/g, '$1でしょう');
    /* 荒い打ち消し「イかねえ」「分からねえ」は「〜ない」に戻してから丁寧にする */
    q = q.replace(/([かさたなまらわがば])ねえ(?=[。！？!?…、」よ]|$)/g, '$1ない').replace(/(^|[、。！？!?…‥\s])まだだ(?=[。！…」]|$)/g, '$1まだです').replace(/(^|[、。！？!?…‥\s])(だめ|ダメ|駄目)だよ(?=[。！…」]|$)/g, '$1$2ですよ').replace(/([一-鿿]|[^ぁ-ん]い)ねえ(?=[。！…」]|$)/g, '$1ですねえ')
      /* 文の途中の「〜だよ、」「〜のよ、ね」も丁寧に（「好きだよ、〈〉のこと」「いいのよ、ね？」） */
      .replace(/(ん|の)だよ、/g, '$1ですよ、').replace(/([^ぁ-ん]|い|き|し)だよ、/g, '$1ですよ、').replace(/(いい|だめ)のよ、(?=ね)/g, '$1んですよ、');
    var out = q.replace(/てんの(?=よ?[？?！!。…」]|よ?$)/g, 'てるの').replace(/(なん|ん)だけど、/g, '$1ですけど、').replace(/(お前ら|おまえら|あんたら|てめえら|お前たち|あんたたち)/g, 'みなさん').replace(YOU_RE, 'あなた');
    /* くだけた形容詞（うるせえ・すげえ・やべえ）は元の形に戻してから言い換える */
    var EA = { 'うるせえ': 'うるさい', 'しつけえ': 'しつこい', 'うぜえ': 'うざい', 'やべえ': 'やばい', 'すげえ': 'すごい', '痛え': '痛い', '危ねえ': '危ない', 'あぶねえ': '危ない', '遅え': '遅い', 'おせえ': '遅い', 'はええ': '早い', 'こええ': '怖い', '怖え': '怖い', 'つええ': '強い', '強え': '強い', 'でけえ': 'でかい', 'ちっせえ': '小さい', 'くせえ': '臭い', 'めんどくせえ': 'めんどくさい', 'わりい': '悪い', 'わりぃ': '悪い', 'ねみい': '眠い', 'さみい': '寒い', 'あちい': '暑い' };
    out = out.replace(/(めんどくせえ|うるせえ|しつけえ|うぜえ|やべえ|すげえ|痛え|危ねえ|あぶねえ|遅え|おせえ|はええ|こええ|怖え|つええ|強え|でけえ|ちっせえ|くせえ|わりい|わりぃ|ねみい|さみい|あちい)/g, function (w) { return EA[w]; });
    out = out.replace(/なんなんだよ(?=[。！？!?…」]|$)/g, 'なんなんですか');
    out = out.replace(/(?:の|ん)かよ(?=[。！？!?…」]|$)/g, 'んですか').replace(/^やっぱりな(?=[。、…])/, 'やっぱり');
    var noTe = /(です|ます|ください|ございます|ません)/.test(out);
    var parts = out.split(/([。！？!?\n]+)/);
    return parts.map(function (seg, i) {
      if (i % 2) return seg;
      var ask = /[？?]/.test(parts[i + 1] || '');
      /* 倒置（「冷えるな、ここ」「褒めてるのか、それ」）：前半の言い切りを丁寧に */
      var ilead = (seg.match(/^[…‥]+/) || [''])[0], inv = seg.slice(ilead.length).match(/^(.*[^、…])、([^、。…]{1,8})$/);
      if (inv && !/(?:何|なに|誰|だれ|どこ|いつ|どっち|どちら|どれ|どう|なぜ|なんで)/.test(inv[2]) && !/(です|ます|ません|ください)/.test(seg) && !/^(?:この|その|あの|どの)/.test(inv[1]) && !/[てでがをにはもとけど]$/.test(inv[1]) && !/[…‥]/.test(inv[1]) && /([一-鿿々ァ-ヶー]|ここ|それ|これ|あれ|そこ|あそこ|みんな|あなた)$/.test(inv[2]) && !/(だ|です|る|た|い)$/.test(inv[2])) {
        var f = inv[1].replace(/^やだ$/, '嫌です').replace(/^最低だ$/, '最低です').replace(/るな$/, 'ますね').replace(/(てる|ている)のか$/, 'ているんですか').replace(/のか$/, 'んですか');
        if (f === inv[1]) f = V.politeSentence(inv[1], noTe, ask);
        if (f !== inv[1]) return ilead + f + '、' + inv[2];
      }
      /* 読点の前で言い切っている節（「答えろよ、暇なんだから」）も丁寧に */
      if (seg.indexOf('、') > 0) seg = seg.split('、').map(function (cl, k, all) {
        if (k === all.length - 1 || !(/(ろよ?|しとけ|ぞ|ぜ|かよ|だろ|じゃん|ねえ(ぞ|よ)?|てくれ|なよ)$/.test(cl) || godanImp(cl.replace(/よ$/, ''))) || /(です|ます|ません|ください)$/.test(cl)) return cl;
        return V.politeSentence(cl, noTe, false);
      }).join('、');
      return V.politeSentence(seg, noTe, ask);
    }).join('')
      /* 言い換えが重なったところの後始末（「ごめんごめん」→「ごめんすみません」、「気持ちい」→「気持ちいです」） */
      .replace(/ごめん(?:ごめん|すみません)/g, 'すみません').replace(/(^|[。！？!?…\s])ごめん(?:ね)?、(?=.*(?:です|ます|ください))/g, '$1すみません、').replace(/気持ちいです/g, '気持ちいいです').replace(/です([…‥っ]*[？?])/g, 'ですか$1').replace(/(^|[、…\s])([^、…。！？\s]{0,8}?(?:[一-鿿ァ-ヶー]|それ|これ|あれ))([？?])/g, function (m, p0, w, qm) { return /(です|ます|ません|か|の|って)$/.test(w) || /^(?:あれ|あれれ)$/.test(w) ? m : p0 + w + 'ですか' + qm; }).replace(/(ます|です)[ー〜]+(?=[！!。…]|$)/g, '$1').replace(/([たい])です、(の|か)(?=[…‥？?])/g, '$1、$2')
      /* 五段の尊敬語は「〜います」（「くださります」「いらっしゃります」にしない） */
      .replace(/(くださ|いらっしゃ|おっしゃ|なさ)ります/g, '$1います').replace(/(くださ|いらっしゃ|おっしゃ|なさ)りました/g, '$1いました');
  };

  /* ---------- 台詞ごとの話し手判定（名前を埋めたあとのテキストで） ---------- */
  var BOUND = /[。！？!?」\n]|――/g;
  function lastBound(s) { var cut = 0, m; BOUND.lastIndex = 0; while ((m = BOUND.exec(s))) cut = m.index + m[0].length; return cut; }
  function subjectIn(span, people) {
    var best = null, bp = -1;
    people.forEach(function (p) {
      if (!p.name) return;
      var at = -1;
      while ((at = span.indexOf(p.name, at + 1)) >= 0) {
        var nx = span.charAt(at + p.name.length), endHere = !span.slice(at + p.name.length).trim();
        /* 「〇〇の声が」「〇〇の残したメモには」のような所有の形も、話し手として扱う */
        /* 「〇〇の静かな声が」「〇〇の甘い囁きが」のように、声の前に短い飾りがついていても話し手 */
        var poss = nx === 'の' && (/^の(?:声|口|唇|喉|残した|書き残した|書いた|メモ|手紙|字|書き置き|置き手紙)/.test(span.slice(at + p.name.length)) || /^の[^、。「」\s]{1,8}?(?:声|囁き|ささやき)(?:が|で|は)/.test(span.slice(at + p.name.length)));
        if (/[はがも「、]/.test(nx) || endHere || poss) {
          /* 「AはBが果てそうになるたびに、「……」」の B は従属節の主語。前に「Aは」があれば A を話し手にする */
          if (best && nx === 'が' && span.charAt(bp + best.name.length) === 'は' && /^が[^、。「」]{0,20}(?:たびに|たび、|ときに|とき、|うちに|間に|あいだ)/.test(span.slice(at + p.name.length))) continue;
          if (at > bp || (at === bp && best && p.name.length > best.name.length)) { bp = at; best = p; }
        }
      }
    });
    return best;
  }
  /* 「あ、あなた」のどもりは、呼び方が「おぬし」「君」に変わったら「お、おぬし」「き、君」にそろえる */
  var YOU_RD = { 'あなた': 'あ', 'あんた': 'あ', 'お前': 'お', 'おまえ': 'お', 'おぬし': 'お', '君': 'き', 'きみ': 'き', '貴様': 'き', 'てめえ': 'て' };
  var YOU_ST = /(?:^|[^ぁ-ゖ])(?:あ、あなた|あ、あんた|お、お前|お、おまえ|き、君|き、きみ|き、貴様|て、てめえ)/;
  function fixYouStutter(q) {
    return q.replace(/(^|[^ぁ-ゖ])[あおきて]、(あなた|あんた|お前|おまえ|おぬし|君|きみ|貴様|てめえ)/g, function (m, a, w) { return a + YOU_RD[w] + '、' + w; });
  }
  /* 住人以外の人物（村の子ども・他校の生徒・店員…）が言った文か：直前の文の最後の節の主語が住人の名前でなく、話す動詞で終わる */
  var MOB_SAY = /^[^、。「」\s]{1,14}[はが][^「」]*(?:言|囁|告げ|訊|尋ね|答え|呟|続け|促|声をかけ|教え|叫|笑|返|怒鳴|呼びかけ|話しかけ)(?:った|いた|げた|ねた|えた|けた|た|んだ|てくれた|てきた|てくる|る)$/;
  function mobSpoke(sentence, people) {
    var cl = sentence.split('、').pop().trim();
    if (!MOB_SAY.test(cl)) return false;
    var subj = cl.replace(/[はが][^]*$/, '');
    return !people.some(function (p) { return p.name && subj.indexOf(p.name) >= 0; });
  }
  /* 「〇〇は△△に「……」と言われて」の受け身：話し手は「に」「から」の人 */
  var PASSIVE = /^(?:と|って)(?:言われ|頼まれ|告げられ|聞かれ|訊かれ|尋ねられ|返され|囁かれ|呼ばれ|叱られ|笑われ|促され|詰め寄られ|泣きつかれ|せがまれ|ねだられ|怒鳴られ|注意され|誘われ|誤魔化され|ごまかされ)/;
  function speakerOf(text, s, e, people) {
    var seg = text.slice(0, s), cut = lastBound(seg), span = seg.slice(cut);
    if (PASSIVE.test(text.slice(e, e + 16))) {
      var pas = null, pp = -1, where = span.trim() ? span : seg.slice(lastBound(seg.slice(0, Math.max(0, cut - 1))), cut);
      people.forEach(function (p) { if (!p.name) return; var m, re = new RegExp(p.name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '(?:に|から)(?!は)', 'g'); while ((m = re.exec(where))) if (m.index > pp) { pp = m.index; pas = p; } });
      return pas;
    }
    var w = subjectIn(span, people);
    if (w) return w;
    if (!span.trim()) {
      var after = text.slice(e, e + 30), hit = null, quoted = /^(?:と|って)/.test(after);
      people.forEach(function (p) {
        if (!p.name) return;
        var re = new RegExp('^(?:――|と|って)?' + p.name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '(?:は|が|の|も|、|。)');
        if (re.test(after) && (!hit || p.name.length > hit.name.length)) hit = p;
      });
      /* 「……」と言いかけた〇〇の袖を／「……」と呟いた〇〇は：話す動詞のすぐあとの住人が話し手 */
      if (!hit) {
        var vm = text.slice(e, e + 40);
        people.forEach(function (p) {
          if (!p.name) return;
          var re = new RegExp('^(?:と|って)(?:言|呟|囁|叫|笑|漏ら|こぼ|返|答え|口にし|続け|告げ|促|呼び)[^。「」、]{0,10}?' + p.name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '(?=の|は|が|を|も|、|。)');
          if (re.test(vm) && (!hit || p.name.length > hit.name.length)) hit = p;
        });
        if (hit) return hit;
      }
      /* 「……」――〇〇は… の〇〇は次の文の主語のことが多い。直前の文に主語があれば、そちらを話し手にする */
      if (hit && !quoted && cut > 0 && /。$/.test(seg.slice(0, cut))) {
        var pv = seg.slice(0, cut - 1), pvl = pv.slice(lastBound(pv)), pvs = subjectIn(pvl, people);
        /* 「〇〇が話しかけると、村の子どもがこっそり教えてくれた。「……」」は住人以外の台詞 */
        if (mobSpoke(pvl, people)) return null;
        if (pvs) return pvs;
        /* 直前の文の主語が住人以外（「ゴブリンが賭場を開いていた。「……」」）なら、その人物の台詞。住人の口調にはしない */
        /* 「店長はタオルを畳み直して、静かに言った。「……」――〇〇は」も、住人以外の人物の台詞 */
        if (!/^(?:二人|三人|四人|みんな|全員|皆|彼ら|彼女ら)/.test(pvl) && /^[^、。「」\s]{1,10}[はが][^「」]*(?:言|囁|告げ|訊|尋ね|答え|呟|続け|促|声をかけ)(?:った|いた|げた|ねた|えた|けた|た|んだ)$/.test(pvl)) return null;
        if (/(^|、)[^、。「」\s]{1,10}が[^、。「」]*(た|ている|ていた|る|だ)$/.test(pvl) && !/(声|音|風|雨|扉|戸|鍵|灯り|明かり|電気|時計|水|火|鐘)が/.test(pvl)) return null;
      }
      if (hit) return hit;
      /* 「……」と言いながら、〇〇は／「……」と呟いて、〇〇が */
      var am = after.length ? text.slice(e, e + 50).match(/^と(?:言|呟|囁|叫|笑|漏ら|こぼ|返|答え|喘|甘え|ねだ|せが|懇願)[^。「」、]{0,10}、/) : null;
      if (am) {
        var rest = text.slice(e + am[0].length, e + am[0].length + 20);
        people.forEach(function (p) {
          if (p.name && rest.indexOf(p.name) === 0 && /^(?:は|が|も)/.test(rest.slice(p.name.length)) && (!hit || p.name.length > hit.name.length)) hit = p;
        });
        if (hit) return hit;
      }
      /* 直前の文の主語（「〇〇は震える声で訊いた。「……」」）。最後の節の主語が住人以外（「村の子どもが教えてくれた」）なら住人の台詞にしない */
      if (cut > 0 && /。$/.test(seg.slice(0, cut))) {
        var prev = seg.slice(0, cut - 1), pc = lastBound(prev), pl = prev.slice(pc);
        if (mobSpoke(pl, people)) return null;
        return subjectIn(pl, people);
      }
    }
    return null;
  }
  /* ---------- 台詞の相手（敬語で話す相手の判定に使う） ---------- */
  var HON = '(?:さん|くん|君|ちゃん|様|さま|先輩|先生|殿)?';
  function escRe(s) { return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }
  /* 台詞 q（text の s〜e）が誰に向けたものか。actors はその出来事の登場人物（番号か住人） */
  /* 住人以外の人物に向けて話している文脈か（「他校の生徒に」「村人を」）。この文脈では、呼びかけの名前を足さない（tone-plus.js の callAddress） */
  var MOB_TO = /(?:生徒|村人|村の\S{1,4}|子ども|子供|客|店員|店長|警備員|看護師|医師|教師|係員|兵士|観客|司会|スタッフ|男|女|誰か|連中|奴ら|やつら|相手)(?:に|へ|を|と|の前)/;
  function addresseeOf(text, s, e, q, who, people, actors) {
    V._addrHow = 0; V._addrMob = false;
    var others = people.filter(function (p) { return p !== who && p.name; }).sort(function (a, b) { return b.name.length - a.name.length; });
    if (!others.length) return null;
    var i, p;
    var seg = text.slice(0, s), span = seg.slice(Math.max(lastBound(seg), seg.length - 60));
    V._addrMob = MOB_TO.test(span.replace(new RegExp(others.concat(who || []).map(function (x) { return x && x.name ? escRe(x.name) : ''; }).filter(Boolean).join('|'), 'g'), '〇'));
    /* 1. 呼びかけ（「ミナト、……」「ミナトさん！」） */
    for (i = 0; i < others.length; i++) { p = others[i]; if (new RegExp('^[…‥、\\s]*' + escRe(p.name) + HON + '(?:[、。！？!?…‥っ]|$)').test(q)) { V._addrHow = 1; return p; } }
    /* 2. 直前の地の文（「アキラはミナトに言った。」「ミナトの耳元で」「ミナトを見て」）。話しかける向きのはっきりした形（strong）と、そばにいるだけの形（weak）を分ける */
    var best = null, bp = -1, strong = false;
    others.forEach(function (o) {
      var re = new RegExp(escRe(o.name) + '(に|へ|の耳元|の目|の顔|の方|の肩|の手|の背中|の前|と目|を見|を振り返|を呼|を睨|に向)', 'g'), m;
      while ((m = re.exec(span))) if (m.index > bp) { bp = m.index; best = o; strong = /^(?:に|へ|の耳元|を見|を振り返|を呼|を睨|に向)$/.test(m[1]); }
    });
    if (best) { V._addrHow = strong ? 2 : 20; return best; }
    /* 3. 直後の地の文（「……」とミナトに言った） */
    var after = text.slice(e, e + 24);
    for (i = 0; i < others.length; i++) { p = others[i]; if (new RegExp('^(?:と|って)、?' + escRe(p.name) + '(?:に|へ)').test(after)) { V._addrHow = 3; return p; } }
    /* 4. 二人だけの出来事なら、もう一人 */
    if (actors && actors.length === 2) {
      var A = actors.map(function (x) { return typeof x === 'number' ? people[x] : x && (x.i != null && people[x.i] && people[x.i].name === x.name ? people[x.i] : people.filter(function (pp) { return pp.name === x.name; })[0]); });
      if (A[0] === who && A[1] && A[1] !== who) { V._addrHow = 4; return A[1]; }
      if (A[1] === who && A[0] && A[0] !== who) { V._addrHow = 4; return A[0]; }
    }
    /* 5. 住人が二人きり（その場にいるとは限らないので、呼びかけの名前を足す根拠にはしない） */
    V._addrHow = 5;
    return others.length === 1 ? others[0] : null;
  }
  V.addresseeOf = addresseeOf;
  /* who が、この台詞では敬語で話すか（ふだんの口調が敬語なら対象外） */
  /* 二人称を、設定した言い方にそろえる（「あなた」「お前」「きみ」「あんた」「おぬし」など → 設定の二人称）。
     名前のあとの「君」（アキラ君）や「大君」などの言葉は変えない */
  var YOU2 = /(?:あなた|あんた|お前|おまえ|てめえ|貴様|おぬし|そなた|お主)(?!さん|方|様)|(?:きみ|(?<![大姫主父母諸細若暴ァ-ヶー一-鿿A-Za-z])君)(?=(?:は|が|も|の|を|に|と|で|って|、|。|！|？|…|」|$|さ|ね|よ|なら|だけ|たち|ら|だ|じゃ|か|な|から|へ|や|しか|まで|より|一人|自身|こそ|最高|大好き|好き|〜|～|ー|ったら|たって))/g;
  V.applyYou = function (q, you) { return you ? q.replace(YOU2, you) : q; };
  function keigoHere(text, s, e, q, who, people, actors) {
    if (!who || who.persona === 'polite') return false;
    /* 「年上には敬語」：年齢が分かっていて、相手のほうが年上なら敬語 */
    var older = who.keigoOlder && who.age > 0;
    var ks = who.keigo ? Object.keys(who.keigo).filter(function (k) { return who.keigo[k]; }) : [];
    if (!ks.length && !older) return false;
    var to = addresseeOf(text, s, e, q, who, people, actors);
    if (!to) return false;
    if (who.keigo && who.keigo[to.name]) return true;
    return !!(older && to.age > who.age);
  }

  /* people: [{name, fp, tone, persona, gender, keigo}]。actors（任意）はその出来事の登場人物
     台詞の頭の \u2062 は「書き下ろしの敬語の行（tone-lines.js）」。言い換えず、一人称と呼び方だけそろえる */
  V.processText = function (text, people, actors) {
    if (typeof text === 'string' && text.indexOf('\u2062') >= 0 && (text.indexOf('「') < 0 || !people || !people.length)) text = text.replace(/\u2062/g, '');
    if (!text || typeof text !== 'string' || (text.indexOf('「') < 0 && text.indexOf('（') < 0) || !people || !people.length) return text;
    var out = '', last = 0, depth = 0, start = -1;
    for (var i = 0; i < text.length; i++) {
      var ch = text[i];
      if (ch === '（' && depth === 0) {
        /* 心の声（（……））：一人称だけそろえる */
        var close = text.indexOf('）', i);
        if (close > i) {
          var mq = text.slice(i + 1, close), who2 = mq.length < 120 && FP_RE.test(mq) ? speakerOf(text, i, close + 1, people) : null;
          FP_RE.lastIndex = 0;
          if (who2) { out += text.slice(last, i + 1) + V.replaceFP(mq, who2) + '）'; last = close + 1; }
          i = close; continue;
        }
      }
      if (ch === '「') { if (depth === 0) start = i; depth++; }
      else if (ch === '」' && depth > 0) {
        depth--;
        if (depth === 0 && start >= 0) {
          var q = text.slice(start + 1, i), who = q.charAt(0) === '\u2060' ? null : speakerOf(text, start, i + 1, people);
          if (!who && q.indexOf('｜') >= 0 && HK.Tone && HK.Tone.split) q = (HK.Tone.split(q) || { K: q }).K;
          if (who) {
            var q0 = q;
            var nounQ = /^(?:を|の|に|が|へ|や|という|って書|と書|とある|と記|と刻|と彫|と印|と読め)/.test(text.slice(i + 1, i + 4)) ||
              /* 「引いたのは「人妻と配達員」だった」のような題名も台詞ではない */
              (/^だ/.test(text.slice(i + 1, i + 2)) && /(?:のは|お題は|テーマは|題名は|企画は)$/.test(text.slice(Math.max(0, start - 6), start)));
            /* 「ミナト「お加減はいかがですか。強さを調整いたしますね」のぼせた〜」：話し手の名前のすぐ後の、言い切った台詞は台詞（後ろの「の」は地の文） */
            if (nounQ && who && who.name && text.slice(Math.max(0, start - who.name.length), start) === who.name && (/。/.test(q) || /(?:ね|よ|か|わ|ぞ|ぜ|な|です|ます|ください|[！？!?])$/.test(q))) nounQ = false;
            /* 「『12ml。採取完了です』と記録した」：読み上げながら記録する台詞（言い切りのあるもの）は台詞として言い換える */
            if (nounQ && /^と(?:記録|報告|告げ|宣言|読み上げ|書きつけ)/.test(text.slice(i + 1, i + 8)) && /(。|です|ます|だ|よ|ね|ました)$/.test(q)) nounQ = false;
            /* 口調ごとの書き下ろし（voice-override.js）があれば、自動の言い換えより優先する */
            /* 敬語で話す相手への台詞：書き下ろしの敬語の行はそのまま、それ以外は敬語に言い換える */
            var pre = q.charAt(0) === '\u2062';
            if (pre) q = q.slice(1);
            /* 相手ごとの一人称・二人称（住人の設定の fpFor・youFor。attr.js）：相手が分かる台詞では、ふだんの一人称・二人称より優先する。モブへの台詞（印つき）は除く */
            var to1 = !nounQ && (who.fpFor || who.youFor) && q.indexOf('\u2063') < 0 ? addresseeOf(text, start, i + 1, q, who, people, actors) : null;
            var sv1 = null, yf1 = to1 && who.youFor && who.youFor[to1.name], ff1 = to1 && who.fpFor && who.fpFor[to1.name];
            if (yf1 || ff1) { sv1 = { fp: who.fp, you: who.you }; if (ff1) who.fp = ff1; if (yf1) who.you = yf1; }
            var kg = !nounQ && (pre || keigoHere(text, start, i + 1, q, who, people, actors));
            /* 3本のベース「K｜F｜P」で書かれた台詞（tone-engine.js）：口調に合うベースを選び、口調の辞書があればそれで言い換える（辞書がなければ、選んだベースをこれまでの言い換えに流す） */
            var nb = q.indexOf('｜') >= 0 && HK.Tone && HK.Tone.pick ? HK.Tone.pick(q, who, kg) : null;
            if (nb) { q = nb.q; q0 = q; if (nounQ) nb = null; }
            /* 書き下ろし辞書は元の文（1本）で引いてあるので、3本の台詞では選んだベースで引けなければ残りのベースでも引く（既存の書き下ろしをそのまま生かす） */
            var ovFor = function (w) { var r = V.overrideFor(q, w, people); if (r == null && nb && nb.alts) for (var ai = 0; ai < nb.alts.length && r == null; ai++) r = V.overrideFor(nb.alts[ai], w, people); return r; };
            var ov = pre ? null : !nounQ && V.overrideFor ? ovFor(kg ? Object.assign({}, who, { tone: 'polite' }) : who) : null;
            /* 別の口調から派生する口調（tone-registry.js の derive。後輩・お嬢様など）：その口調名の書き下ろし・直しがあれば完成形としてそのまま使い、
               なければ元の口調の書き下ろしを引いて、最後に語尾を付け替える */
            var dv = !kg && !pre && !nounQ && HK.toneOpt ? HK.toneOpt(who.tone, 'derive') : null, own = false;
            if (dv && V.overrideFor) {
              if (ov != null) own = true;
              else {
                ov = ovFor(Object.assign({}, who, { tone: dv, _from: who.tone }));
                /* 派生元の書き下ろしが足した「！」を使わない口調（熱血：言い切りは言い切りのまま） */
                if (ov != null && HK.toneOpt(who.tone, 'noBang') && !/[！!]$/.test(q)) ov = ov.replace(/！$/, '');
              }
            }
            /* 派生元のない仕上げつきの口調（ヤンキーなど）も、その口調名の書き下ろし・直しは完成形として使う */
            else if (ov != null && !kg && HK.TONE_FINISH && HK.TONE_FINISH[who.tone]) own = true;
            q = V.replaceFP(ov != null ? ov : q, who);
            var byDict = ov == null && !pre && nb && nb.dict;
            if (byDict) { q = HK.Tone.apply(q, nb.dict, who); own = true; }
            else if (ov == null && !pre) { if (who.persona === 'polite' || kg) q = V.polite(q); else if (V.styleQuote && !nounQ) q = V.styleQuote(V.unHonor ? V.unHonor(q) : q, who); }
            /* 敬語の口調で、敬語の文とため口の文が混ざる台詞の、ため口の文末を敬語に寄せる（tone-keigo-unify.js。仕上げの前に通し、仕上げが口調の味を付ける） */
            if (V.keigoUnify && !nounQ && !own && !pre) q = V.keigoUnify(q, who);
            /* 口調ごとの仕上げ（後輩の「〜っす」、お嬢様の「〜ですわ」など。HK.toneFinish で登録したもの） */
            var fin = !own && !nounQ && HK.TONE_FINISH && HK.TONE_FINISH[who.tone];
            /* 仕上げには、敬語で話す相手への台詞か（kg）を渡す。派生の口調が敬語の文を崩すときの判断に使う */
            if (fin) q = fin(q, who, { kg: kg, raw: q0 });
            /* 性別の語尾の仕上げ（辞書の書き下ろしにも通す。tone-plus.js の V.genderEnd） */
            if (V.genderEnd && !nounQ && !kg && !byDict) q = V.genderEnd(q, who);
            /* 住人ごとの語尾の付け替え（設定の toneCustom。tone-new2.js の V.applyToneCustom）：口調の仕上げのいちばん最後に */
            if (who.toneCustom && V.applyToneCustom && !HK.TONE_CUSTOM_OFF && !nounQ) q = V.applyToneCustom(q, who.toneCustom);
            /* 二人称の設定（敬語の相手への台詞は除く）。設定が空なら、口調と性別の既定（tone-registry.js の HK.TONE_YOU）でそろえる */
            var youW = who.you || (HK.toneYou ? HK.toneYou(who.tone, who.gender) : '');
            if (youW && (!kg || yf1) && !nounQ) q = V.applyYou(q, youW);
            if (YOU_ST.test(q0)) q = fixYouStutter(q);
            if (V.applyCalls) q = V.applyCalls(q, who, people);
            /* 呼び方を決めてある相手に向けた台詞は、二人称を呼び方にし、ときどき呼びかけを足す（tone-plus.js の callAddress） */
            if (V.callAddress && !nounQ) q = V.callAddress(q, who, addresseeOf(text, start, i + 1, q, who, people, actors), q0);
            /* 語尾の記号（キャラごとの設定。複数あれば文ごとにランダム） */
            if (who.marks && !nounQ) q = V.applyMarks(q, who.marks);
            if (sv1) { who.fp = sv1.fp; who.you = sv1.you; }
          }
          q = q.replace(/([！？!?])。/g, '$1');   /* 「ごめんごめん！。」のような重なりを整える */
          out += text.slice(last, start + 1) + q + '」';
          last = i + 1; start = -1;
        }
      }
    }
    return (out + text.slice(last)).replace(/\u2062/g, '');
  };
  /* シミュレーション結果全体に適用 */
  /* 語尾の記号：文末の「。」「！」を、設定した記号に置き換える（「分かった。引き受けよう」→「分かった！！！引き受けよう！！！」「分かった♣引き受けよう♦」）。
     記号は空白・読点・カンマ区切りで複数（文ごとに台詞の文字から決まるくじで選ぶので、同じ台詞は同じ結果になる）。
     問い（？）・言いよどみ（……）・伸ばし（ー〜）・喘ぎ（っ・♡）で終わる文はそのまま */
  V.marksList = function (m) {
    return String(m || '').split(/[\s、,，　]+/).map(function (x) { return x.replace(/[「」『』]/g, '').slice(0, 6); }).filter(Boolean).slice(0, 8);
  };
  V.applyMarks = function (q, marks) {
    var L = V.marksList(marks);
    if (!L.length || !q) return q;
    var k = 0;
    function pick() { var h = 0, t = q + '#' + (k++); for (var i = 0; i < t.length; i++) h = (h * 31 + t.charCodeAt(i)) >>> 0; return L[h % L.length]; }
    var out = q.replace(/([^。！!？?…‥]*?)([。！!]+)(?![？?])/g, function (m, body, p) {
      if (!body || /[？?…‥ー〜～っッ♡]$/.test(body)) return m;
      return body + pick();
    });
    if (!/[。！!？?…‥ー〜～っッ♡♪」』）)\]]$/.test(out) && L.indexOf(out.slice(-1)) < 0 && !L.some(function (x) { return out.slice(-x.length) === x; })) out += pick();
    return out;
  };
  /* 「」の中の「」を『』に（「演劇「ロミオとジュリエット」」→「演劇『ロミオとジュリエット』」）。
     二人が声を揃える「「いらっしゃい」」（「 が二つ続き、閉じも 」」）はそのまま */
  V.nestQuote = function (t) {
    if (typeof t !== 'string' || t.indexOf('「') < 0) return t;
    var out = '', st = [];
    for (var i = 0; i < t.length; i++) {
      var ch = t[i];
      if (ch === '「') {
        var uni = t[i - 1] === '「' && st[st.length - 1] === 'o' && (function () { var j = t.indexOf('」', i); return j > 0 && t[j + 1] === '」'; })();
        if (st.length && !uni) { st.push('n'); out += '『'; continue; }
        st.push('o'); out += ch; continue;
      }
      if (ch === '」' && st.length) { var k = st.pop(); out += k === 'n' ? '』' : '」'; continue; }
      out += ch;
    }
    return st.length ? t : out;
  };
  V.processResult = function (res, input) {
    if (!res || !input || !input.chars) return res;
    var people = input.chars.map(function (c, i) {
      var r = (res.chars && res.chars[i]) || (res.heroes && res.heroes[i]) || {};
      var p = { name: c.name, fp: c.fp || '', gender: c.gender || '', tone: HK.toneOf ? HK.toneOf(c) : c.tone || '', call: c.call || '', callG: c.callG || null, calls: c.calls || null, keigo: c.keigo || null, age: +c.age || 0, keigoOlder: !!c.keigoOlder, you: c.you || '', marks: c.marks || '' };
      p.persona = r.persona || HK.personaOf({ tone: c.tone, eg: c.eg });
      if (c.toneCustom) p.toneCustom = c.toneCustom;
      /* 相手ごとの二人称・一人称（番号 → 名前。attr.js の HK.Attr.voiceFor） */
      if (HK.Attr && HK.Attr.voiceFor) HK.Attr.voiceFor(p, c, input.chars);
      return p;
    });
    var f = function (t, ac) { return V.processText(t, people, ac); };
    /* 描写の作風「男性向け」（ero-kit.js）の結果では、はっきりした口調でも♡を残す（tone-firm.js） */
    V._keepHeart = !HK.SAFE_ON && !!(input.env && input.env.style === 'ero');
    (res.log || []).forEach(function (e) { if (e && typeof e.text === 'string') e.text = V.nestQuote(f(e.text, e.actors)); });
    var E = res.ending || res.end;
    if (E) {
      if (Array.isArray(E.lines)) E.lines = E.lines.map(function (l) { return typeof l === 'string' ? f(l) : l; });
      if (typeof E.text === 'string') E.text = f(E.text);
    }
    (res.chars || []).forEach(function (c) { if (typeof c.fateNote === 'string') c.fateNote = f(c.fateNote); if (Array.isArray(c.notes)) c.notes = c.notes.map(function (n) { return typeof n === 'string' ? f(n) : n; }); });
    V._keepHeart = false;
    return res;
  };
})();
