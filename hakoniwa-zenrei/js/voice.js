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
  var FP_RE = /(俺様|オレ様|俺|僕|ぼく|オレ|ボク|わたくし|ワタクシ|あたくし|あたし|アタシ|わたし|ワタシ|私|拙者|わらわ|わし|ウチ|うち)(?=(?:たち|達|ら|は|が|も|の|を|に|と|で|って|だ|、|。|！|？|…|―|」|）|\s|$|っ|、|ね|よ|さ|じゃ|から|まで|より|だけ|なんか|なんて|なら|かも|ばかり|ばっかり|しか|こそ|!|\?))/g;
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
  var YOU_RE = /お前さん|おまえさん|(?:お前|おまえ|あんた|てめえ|貴様)(?!さん|方)|君(?=(?:たち|達|ら|は|が|も|の|を|に|と|で|って|、|。|！|？|…|」|$|さ|ね|よ|なんか|なら|だけ|しか|だ|じゃ|より|まで|かも|こそ|か|な|から|へ|や|一人|自身))/g;

  /* ---------- 敬語（です・ます調に整える。完全ではないが、口調として読める程度に） ---------- */
  var POLITE_END = /(です|ます|ました|ません|でした|でしょう|ください|ございます|ませんか|ましょう|ませんでした|なさい|でしょうか|ですか|ますか)$/;
  var ADJ_NAI = /(少ない|危ない|仕方ない|しょうがない|情けない|つまらない|くだらない|もったいない|だらしない|切ない|みっともない|あっけない|頼りない|物足りない|はしたない|ぎこちない|さりげない|なさけない|せつない|あぶない|すくない|間違いない|違いない|申し訳ない|面目ない|容赦ない|迷いない|隙がない|余裕がない|しかたない)$/;
  var NOT_TE = /([てで]しまって|ちまって|いっぱいで|一緒で|一人で|二人で|ここで|そこで|どこで|中で|上で|下で|前で|外で|部屋で|おいで|どうして|そして|初めて|改めて|せめて|かつて|なんて|って|すべて|全て|決して|やがて|あえて|まして|とって|もって|かくして|はじめて|あわてて)$/;
  var NOT_I = /(ください|なさい|はい|おい|ちょうだい|くらい|ぐらい|だい|かい|せい|ほしい|欲しい|みたい|ばかり)$/;
  var GODAN_KANJI = '吊釣寄蹴殴縛刈彫狩絞握振散知当渡登踊触謝張譲黙祈帰知入切走要減散握滑焦蹴喋限参怒登乗取送作座守残黙困止戻通触張売祈光鳴眠混当照渡回移残配語計撮探絞縛擦煽捻弄殴刈剃奢誇謝譲遮粘腐盛練測図頼';
  var KU_ADJ = '早強遠近長深高軽速熱甘痛重薄太細固硬低広狭暗明白黒赤青若古新多少良悪弱優激美辛苦怖寒暑温冷柔鋭鈍濃淡';
  var NAI_STEM = { 'ら': 'り', 'か': 'き', 'さ': 'し', 'た': 'ち', 'な': 'に', 'ば': 'び', 'ま': 'み', 'わ': 'い', 'が': 'ぎ' };
  var U2I = { 'く': 'き', 'ぐ': 'ぎ', 'す': 'し', 'つ': 'ち', 'ぬ': 'に', 'ぶ': 'び', 'む': 'み', 'う': 'い', 'る': 'り' };
  var VOL = { 'こ': 'き', 'ご': 'ぎ', 'と': 'ち', 'の': 'に', 'ぼ': 'び', 'も': 'み', 'ろ': 'り', 'お': 'い' };
  function isKanji(ch) { return /[一-鿿々]/.test(ch || ''); }
  var LEX = [
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
    var m = s.match(/([一-鿿々])([えけげせてねべめれ])$/), k = m && IMP_K[m[2]];
    if (!k || k[0].indexOf(m[1]) < 0) return null;
    return s.slice(0, -1) + (m[1] === '行' ? 'って' : k[1]) + 'ください';
  }
  V.godanImp = godanImp;
  function core(s, noTe) {
    if (!s || POLITE_END.test(s)) return null;
    var m, ta = s.match(/(なった|あった|言った|思った|行った|やった|終わった|困った|待った|会った|知った|買った|笑った|もらった|しまった|勝った|取った|帰った|入った|乗った|作った|使った|違った|持った|立った|撮った|言っちゃった|わかった|分かった|良かった|よかった|泣いた|書いた|聞いた|着いた|気づいた|驚いた|働いた|歩いた|死んだ|飲んだ|読んだ|選んだ|遊んだ|呼んだ|住んだ|頼んだ|休んだ|済んだ|頑張った|払った|洗った|拾った|迷った|座った|祈った|誘った|謝った|黙った|戻った|残った|送った|怒った|触った|守った|歌った|手伝った|嫌った|失った|救った)$/);
    if (ta) return s.slice(0, -ta[1].length) + TA[ta[1]];
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
    if (/(なの|なんだ)$/.test(s)) return s.replace(/(なの|なんだ)$/, 'なんです');
    if ((m = s.match(/([うくすつぬぶむるぐいたなだ])んだ$/))) return s.replace(/んだ$/, 'んです');
    if (/(なんか|なんて|は|も|が|しか|じゃ|では|でも)ない$/.test(s)) return s + 'です';
    if (/んだ$/.test(s)) return s + 'んです';
    if (/[泳脱騒急稼嗅継注仰剥紡]いだ$/.test(s)) return s.replace(/いだ$/, 'ぎました');
    if (/のだ$/.test(s)) return s.replace(/のだ$/, 'のです');
    if (/だ$/.test(s)) return s.replace(/だ$/, 'です');
    /* 命令・禁止・お願い */
    var IMP = [[/しろ$/, 'してください'], [/やめろ$/, 'やめてください'], [/待て$/, '待ってください'], [/黙れ$/, '黙ってください'], [/来い$/, '来てください'], [/寄越せ$/, 'ください'], [/よこせ$/, 'ください'], [/離せ$/, '離してください'], [/見せろ$/, '見せてください'], [/言え$/, '言ってください'], [/するな$/, 'しないでください'], [/見るな$/, '見ないでください'], [/言うな$/, '言わないでください'], [/触るな$/, '触らないでください'], [/笑うな$/, '笑わないでください'], [/来るな$/, '来ないでください']];
    for (var i = 0; i < IMP.length; i++) if (IMP[i][0].test(s)) return s.replace(IMP[i][0], IMP[i][1]);
    if (!noTe && /[てで]$/.test(s) && !NOT_TE.test(s) && /[っんしきぎちにびみりいえけげせぜてでねべめれ]$/.test(s.slice(0, -1).slice(-1)) || /ないで$/.test(s)) return s + 'ください';
    /* 否定 */
    /* 名詞＋ない（関係ない・意味ない・興味ない） */
    if (/(関係|意味|興味|問題|時間|余裕|自信|用|元気|覚え|記憶|心当たり|文句|容赦|金|気|暇)ない$/.test(s) || /[一-鿿々]{2,}ない$/.test(s) && !/[出見寝着来居似煮得経]ない$/.test(s)) return s.replace(/ない$/, 'ありません');
    if (/じゃない$/.test(s)) return s + 'です';
    if (ADJ_NAI.test(s) || /(良く|よく|くて|しく|く)ない$/.test(s)) return s + 'です';
    if (/てない$/.test(s)) return s.replace(/てない$/, 'ていません');
    if (/しない$/.test(s)) return s.replace(/しない$/, 'しません');
    if (/こない$/.test(s)) return s.replace(/こない$/, 'きません');
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
    if (/かった$/.test(s)) return s + 'です';
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
    if (/(やる|いる|ある|なる|わかる|分かる|できる)な$/.test(s) || /[よょろそ]うな$/.test(s)) return null;
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
    var tail = (s0.match(/[っッー〜～…♡♪、]+$/) || [''])[0], s = s0.slice(0, s0.length - tail.length);
    if (!s) return s0;
    var lead = (s.match(/^[…‥・、\s]+/) || [''])[0], body = s.slice(lead.length);
    for (var i = 0; i < LEX.length; i++) if (LEX[i][0].test(body)) return lead + body.replace(LEX[i][0], LEX[i][1]) + tail;
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
      if (p === 'かな' || p === 'かしら') rc = rc.replace(/です$/, 'でしょう');
      return rc + np + tail;
    }
    return s0;
  };
  V.polite = function (q) {
    var out = q.replace(/(お前ら|おまえら|あんたら|てめえら|お前たち|あんたたち)/g, 'みなさん').replace(YOU_RE, 'あなた');
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
      var inv = seg.match(/^(.*[^、…])、([^、。…]{1,8})$/);
      if (inv && !/(です|ます|ません|ください)/.test(seg) && !/^(?:この|その|あの|どの)/.test(inv[1]) && !/[てでがをにはもとけど]$/.test(inv[1]) && !/[…‥]/.test(inv[1]) && /([一-鿿々ァ-ヶー]|ここ|それ|これ|あれ|そこ|あそこ|みんな|あなた)$/.test(inv[2]) && !/(だ|です|る|た|い)$/.test(inv[2])) {
        var f = inv[1].replace(/^やだ$/, '嫌です').replace(/^最低だ$/, '最低です').replace(/るな$/, 'ますね').replace(/(てる|ている)のか$/, 'ているんですか').replace(/のか$/, 'んですか');
        if (f === inv[1]) f = V.politeSentence(inv[1], noTe, ask);
        if (f !== inv[1]) return f + '、' + inv[2];
      }
      /* 読点の前で言い切っている節（「答えろよ、暇なんだから」）も丁寧に */
      if (seg.indexOf('、') > 0) seg = seg.split('、').map(function (cl, k, all) {
        if (k === all.length - 1 || !(/(ろよ?|しとけ|ぞ|ぜ|かよ|だろ|じゃん|ねえ(ぞ|よ)?|てくれ|なよ)$/.test(cl) || godanImp(cl.replace(/よ$/, ''))) || /(です|ます|ません|ください)$/.test(cl)) return cl;
        return V.politeSentence(cl, noTe, false);
      }).join('、');
      return V.politeSentence(seg, noTe, ask);
    }).join('');
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
        var poss = nx === 'の' && /^の(?:声|口|唇|喉|残した|書き残した|書いた|メモ|手紙|字|書き置き|置き手紙)/.test(span.slice(at + p.name.length));
        if (/[はがも「、]/.test(nx) || endHere || poss) {
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
  function speakerOf(text, s, e, people) {
    var seg = text.slice(0, s), cut = lastBound(seg), span = seg.slice(cut);
    var w = subjectIn(span, people);
    if (w) return w;
    if (!span.trim()) {
      var after = text.slice(e, e + 30), hit = null, quoted = /^(?:と|って)/.test(after);
      people.forEach(function (p) {
        if (!p.name) return;
        var re = new RegExp('^(?:――|と|って)?' + p.name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '(?:は|が|の|も|、|。)');
        if (re.test(after) && (!hit || p.name.length > hit.name.length)) hit = p;
      });
      /* 「……」――〇〇は… の〇〇は次の文の主語のことが多い。直前の文に主語があれば、そちらを話し手にする */
      if (hit && !quoted && cut > 0 && /。$/.test(seg.slice(0, cut))) {
        var pv = seg.slice(0, cut - 1), pvl = pv.slice(lastBound(pv)), pvs = subjectIn(pvl, people);
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
      /* 直前の文の主語（「〇〇は震える声で訊いた。「……」」） */
      if (cut > 0 && /。$/.test(seg.slice(0, cut))) {
        var prev = seg.slice(0, cut - 1), pc = lastBound(prev);
        return subjectIn(prev.slice(pc), people);
      }
    }
    return null;
  }
  /* ---------- 台詞の相手（敬語で話す相手の判定に使う） ---------- */
  var HON = '(?:さん|くん|君|ちゃん|様|さま|先輩|先生|殿)?';
  function escRe(s) { return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }
  /* 台詞 q（text の s〜e）が誰に向けたものか。actors はその出来事の登場人物（番号か住人） */
  function addresseeOf(text, s, e, q, who, people, actors) {
    var others = people.filter(function (p) { return p !== who && p.name; }).sort(function (a, b) { return b.name.length - a.name.length; });
    if (!others.length) return null;
    var i, p;
    /* 1. 呼びかけ（「ミナト、……」「ミナトさん！」） */
    for (i = 0; i < others.length; i++) { p = others[i]; if (new RegExp('^[…‥、\\s]*' + escRe(p.name) + HON + '(?:[、。！？!?…‥っ]|$)').test(q)) return p; }
    /* 2. 直前の地の文（「アキラはミナトに言った。」「ミナトの耳元で」「ミナトを見て」） */
    var seg = text.slice(0, s), span = seg.slice(Math.max(lastBound(seg), seg.length - 60)), best = null, bp = -1;
    others.forEach(function (o) {
      var re = new RegExp(escRe(o.name) + '(?:に|へ|の耳元|の目|の顔|の方|の肩|の手|の背中|の前|と目|を見|を振り返|を呼|を睨|に向)', 'g'), m;
      while ((m = re.exec(span))) if (m.index > bp) { bp = m.index; best = o; }
    });
    if (best) return best;
    /* 3. 直後の地の文（「……」とミナトに言った） */
    var after = text.slice(e, e + 24);
    for (i = 0; i < others.length; i++) { p = others[i]; if (new RegExp('^(?:と|って)、?' + escRe(p.name) + '(?:に|へ)').test(after)) return p; }
    /* 4. 二人だけの出来事なら、もう一人 */
    if (actors && actors.length === 2) {
      var A = actors.map(function (x) { return typeof x === 'number' ? people[x] : x && (x.i != null && people[x.i] && people[x.i].name === x.name ? people[x.i] : people.filter(function (pp) { return pp.name === x.name; })[0]); });
      if (A[0] === who && A[1] && A[1] !== who) return A[1];
      if (A[1] === who && A[0] && A[0] !== who) return A[0];
    }
    /* 5. 住人が二人きり */
    return others.length === 1 ? others[0] : null;
  }
  V.addresseeOf = addresseeOf;
  /* who が、この台詞では敬語で話すか（ふだんの口調が敬語なら対象外） */
  function keigoHere(text, s, e, q, who, people, actors) {
    if (!who || !who.keigo || who.persona === 'polite') return false;
    var ks = Object.keys(who.keigo).filter(function (k) { return who.keigo[k]; });
    if (!ks.length) return false;
    var to = addresseeOf(text, s, e, q, who, people, actors);
    return !!(to && who.keigo[to.name]);
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
          if (who) {
            var q0 = q;
            var nounQ = /^(?:を|の|に|が|へ|や|という|って書|と書)/.test(text.slice(i + 1, i + 4)) ||
              /* 「引いたのは「人妻と配達員」だった」のような題名も台詞ではない */
              (/^だ/.test(text.slice(i + 1, i + 2)) && /(?:のは|お題は|テーマは|題名は|企画は)$/.test(text.slice(Math.max(0, start - 6), start)));
            /* 口調ごとの書き下ろし（voice-override.js）があれば、自動の言い換えより優先する */
            /* 敬語で話す相手への台詞：書き下ろしの敬語の行はそのまま、それ以外は敬語に言い換える */
            var pre = q.charAt(0) === '\u2062';
            if (pre) q = q.slice(1);
            var kg = !nounQ && (pre || keigoHere(text, start, i + 1, q, who, people, actors));
            var ov = pre ? null : !nounQ && V.overrideFor ? V.overrideFor(q, kg ? Object.assign({}, who, { tone: 'polite' }) : who, people) : null;
            q = V.replaceFP(ov != null ? ov : q, who);
            if (ov == null && !pre) { if (who.persona === 'polite' || kg) q = V.polite(q); else if (V.styleQuote && !nounQ) q = V.styleQuote(q, who); }
            if (YOU_ST.test(q0)) q = fixYouStutter(q);
            if (V.applyCalls) q = V.applyCalls(q, who, people);
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
  V.processResult = function (res, input) {
    if (!res || !input || !input.chars) return res;
    var people = input.chars.map(function (c, i) {
      var r = (res.chars && res.chars[i]) || (res.heroes && res.heroes[i]) || {};
      var p = { name: c.name, fp: c.fp || '', gender: c.gender || '', tone: HK.toneOf ? HK.toneOf(c) : c.tone || '', call: c.call || '', calls: c.calls || null, keigo: c.keigo || null };
      p.persona = r.persona || HK.personaOf({ tone: c.tone, eg: c.eg });
      return p;
    });
    var f = function (t, ac) { return V.processText(t, people, ac); };
    (res.log || []).forEach(function (e) { if (e && typeof e.text === 'string') e.text = f(e.text, e.actors); });
    var E = res.ending || res.end;
    if (E) {
      if (Array.isArray(E.lines)) E.lines = E.lines.map(function (l) { return typeof l === 'string' ? f(l) : l; });
      if (typeof E.text === 'string') E.text = f(E.text);
    }
    (res.chars || []).forEach(function (c) { if (typeof c.fateNote === 'string') c.fateNote = f(c.fateNote); if (Array.isArray(c.notes)) c.notes = c.notes.map(function (n) { return typeof n === 'string' ? f(n) : n; }); });
    return res;
  };
})();
