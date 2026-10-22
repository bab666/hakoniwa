/* 箱庭シミュレーター: クールから派生する口調（ミステリアス）
   文面と台詞の言い換えは「クール」をそのまま使い、できあがった台詞の言い回しと語尾を、最後に付け替える（名前・一人称・見本・並びは tone-registry.js）。
   ・ミステリアス … 若く、つかみどころがない。「〜さ」「〜なのさ」「〜だろうね」「〜かもしれないね」「〜じゃないかい？」「〜かい？」「〜のかな」「ふふ」「さあ、どうだろうね」
     古風な紳士（「〜なのだよ」「〜したまえ」）より若く、胡散臭い（「〜だねえ」「ちょいと」）ほど崩さない
   語尾の付け替えは台詞の最後の文だけで、三回に一回ほどは付けずに残す。喘ぎ・叫び・敬語の文、謝罪や深刻な台詞はそのまま */
(function () {
  'use strict';
  var HK = window.HK, V = HK && HK.Voice, END = HK && HK.TONE_END;
  if (!V || !HK.toneFinish || !END) return;
  var PLAIN_END = END.plain, NA_END = END.na;

  var E = '(?=[。！？!?…‥、」\\s]|$)';
  var YOU = /(?:あなた|お前|おまえ|てめえ|貴様)(?!さん|方|たち|がた)/g;
  /* 敬語・頼みごと・もう柔らかい語尾で終わる文は触らない */
  var KEEP = /(?:(?:です|ます|ました|ません|でした|ましょう|でしょう)(?:よ|ね|よね|か)?|ください|なさい|ちょうだい|ごらん|おいで|[てで]|[よねさわなぞぜか]|かい|だい|かな|かしら|もん|もの|って|けど|けれど|から|のに|ので|し|たら|なら|ば)$/;
  var WH2 = /(?:何|(?<![あこそど])なに|なんで|誰|だれ|どこ|いつ|なぜ|どうして|どんな|どっち|どれ|どう|いくつ|いくら|どの)/;
  /* 謝罪・弱音・痛みの台詞は、茶化さない（「ふふ」も「〜のさ」も付けない） */
  var GRAVE = /(?:ごめん|すまな|すみませ|悪かった|許して|無理|死|殺|怖|こわ|助けて|痛|いた[いく]|泣|つら|辛|寂し|さみし|苦し|嫌だ|いやだ|やめて|だめ|ダメ|最低|消え|犯人|吊)/;

  function wh(s) { if (/か、/.test(s)) return false; return WH2.test(s.replace(/(?:何|なに|なん|誰|だれ|どこ|いつ|どう)(?:にでも|でも|も|か|とか|度|ぞ|ら)/g, '').replace(/なんて|なんか|なんだか|なんと/g, '')); }
  /* 女性的な語尾を中性に（クールの台詞にまれに残るもの） */
  function unfem(s) {
    return s.replace(/([たいるうくすつむぬぐぶ])わね$/, '$1ね').replace(/([たいるうくすつむぬぐぶ])わよ$/, '$1よ').replace(/(?<!ん)のよ$/, 'のさ').replace(/かしら$/, 'かな').replace(/だわ$/, 'だね').replace(/([たいるうくすつむぬぐぶ])わ$/, '$1よ');
  }

  function mysOne(s, ask, last, askOK, grave) {
    var m;
    s = unfem(s);
    /* 粗い語尾はいつでも和らげる */
    s = s.replace(/だぜ$/, 'だよ').replace(/(?<=[ぁ-ん])ぜ$/, 'よ').replace(/(?<!どう)ぞ$/, 'よ').replace(/(?<![まやだ])だな$/, 'だね').replace(/よな$/, 'よね').replace(/(いる|ある|ない|てる|いい)な$/, '$1ね')
      .replace(/じゃん$/, 'じゃないか').replace(/(?:のだ|んだ)よ$/, function (x) { return last && !grave ? 'のさ' : x; });
    if (ask) {
      if (!askOK) return s;
      if (/(?:です|ます|ません|でしょう|ください)$/.test(s)) return s;
      if (/(?:かい|だい|かな|かしら)$/.test(s)) return s;
      if (/(?:って|という)こと$/.test(s)) return s + 'かい';
      if (/(?:でしょう|でしょ|だろ)$/.test(s)) return s.replace(/(?:でしょう|でしょ|だろ)$/, 'だろう');
      if (/じゃない(?:の|か)?$/.test(s)) return s.replace(/じゃない(?:の|か)?$/, 'じゃないかい');
      if (/(?:の|ん)か$/.test(s)) return s.replace(/(?:の|ん)か$/, 'のかい');
      if (/[るうくすつむたい]か$/.test(s)) return s + 'い';
      /* 疑問詞があれば「〜んだい？」（「何してるの？」→「何してるんだい？」「ここ、どこ？」→「ここ、どこだい？」） */
      if (wh(s)) {
        if (/(?:の|ん)(?:だ)?$/.test(s)) return s.replace(/(?:の|ん)(?:だ)?$/, 'んだい');
        if (/(?:何|なに|なん|誰|だれ|どこ|いつ|なぜ|どうして|どんな|どっち|どれ|いくつ|いくら)$/.test(s)) return s + 'だい';
        if (/(?<![まやだ])だ$/.test(s)) return s.replace(/だ$/, 'だい');
        if (PLAIN_END.test(s) && !/[たい]$/.test(s)) return s + 'んだい';
        return s;
      }
      /* 誘い・確認：「やめるの？」→「やめるのかい？」、「僕のせい？」→「僕のせいかい？」 */
      if (/の$/.test(s)) return s.replace(/の$/, 'のかい');
      if (/(?<![まやだ])だ$/.test(s)) return s.replace(/だ$/, 'かい');
      /* 名前の呼びかけ（「ミナト……？」「ユキノ？」）には付けない */
      if (/[一-鿿]$/.test(s) && s.length >= 2 && !/^[ァ-ヶー]+$/.test(s)) return s + 'かい';
      if (/(?:[てで]る|ない|いい|ある|いる|[るうくすつむ])$/.test(s) && PLAIN_END.test(s) || /ない$/.test(s)) return s + 'かい';
      return s;
    }
    if (/(?:です|ます|ました|ません|でした|ください)(?:よ|ね|よね)?$/.test(s)) return s;
    /* 「？」のない問いかけ（「誰が決めたんだ」「何だ」） */
    if (wh(s) && !/^(?:あ、)?あの/.test(s) && !/(?:ない|た)$/.test(s)) {
      if (/(?:何|なん)だよ?$/.test(s)) return s.replace(/だよ?$/, 'だい');
      if (/(?:の|ん)だ$/.test(s)) return s.replace(/(?:の|ん)だ$/, 'んだい');
    }
    if (/たくないかな$/.test(s)) return s;
    if (/(?:だろう|だろ)$/.test(s)) return last ? s.replace(/(?:だろう|だろ)$/, 'だろうね') : s.replace(/だろ$/, 'だろう');
    if (/かもしれない$/.test(s) || /かもね$/.test(s)) return last ? s.replace(/かもね$/, 'かもしれないね').replace(/かもしれない$/, 'かもしれないね') : s;
    if (/んだもん$/.test(s)) return s.replace(/もん$/, 'からさ');
    if (!last || grave) return s;
    /* ここから最後の文だけ */
    if (KEEP.test(s)) return s;
    /* 三回に一回は付けずに残す（毎回「さ」だとくどい） */
    if (HK.lineLot(s, 3)) return s;
    /* 「〜んだ」「〜のだ」→「〜のさ」（「なんだ」→「なのさ」）。「飲んだ」「選んだ」の過去形は除く */
    if (/^(?:そう|そっか|そうか)なんだ$/.test(s)) return s;
    if (/なんだ$/.test(s) && s.length > 3) return s.replace(/なんだ$/, 'なのさ');
    if (/[一-鿿々]んだ$/.test(s)) return s;
    if (/(?:の|ん)だ$/.test(s) && s.length > 3) return s.replace(/(?:の|ん)だ$/, 'のさ');
    /* 「ものだ」「ことだ」→「ものさ」「ことさ」、名詞＋だ → 「〜さ」（短い言い切り「これだ」「まだ」はそのまま） */
    if (/(?<![まやだ]|あい|た)だ$/.test(s) && s.replace(/^[…‥、\s]+/, '').length > 4) return s.replace(/だ$/, 'さ');
    /* 「〜だよ」は二回に一回「〜さ」に */
    if (/(?<![まやだ]|[一-鿿々]ん|もの|こと)だよ$/.test(s) && s.length > 4 && HK.lineLot(s + '+', 2)) return s.replace(/だよ$/, 'さ');
    if (/よ$/.test(s)) return s;
    if (s.replace(/^[…‥、\s]+/, '').length <= 3) return s;
    /* 否定の言い切り：「譲る気はない」→「譲る気はないさ」。形容詞の「危ない」「少ない」は「〜ね」 */
    if (/ない$/.test(s) && !/じゃない$/.test(s)) return s + (/(?:[一-鿿]|[ぁ-ん]く|^)ない$/.test(s) && !/[一-鿿]らない$/.test(s) ? 'ね' : 'さ');
    /* 「たい」「〜しい」などの形容詞は「〜ね」 */
    if (/(?:しい|(?<![なた])い)$/.test(s) && PLAIN_END.test(s) && !NA_END.test(s)) return s + 'ね';
    /* 過去の言い切り「思った」「見つけた」は「〜よ」 */
    if (/た$/.test(s)) return s + 'よ';
    /* 動詞の言い切りは、見通し・請け合いのもの（「なる」「できる」「やれる」「わかる」）だけ「〜さ」 */
    if (/(?:なる|できる|出来る|やれる|いける|わかる|分かる|ある|変わる)$/.test(s) && !/(?:ことがある|たくなる)$/.test(s)) return s + 'さ';
    return s;
  }

  function mystic(q, who) {
    q = HK.thinIntj(q.replace(YOU, '君'), { 'あらあら': 'おやおや', 'あらまあ': 'おやおや', 'あら': 'おや' }).replace(/えへへ|うふふ|へへっ?/g, 'ふふ');
    var moan = /[っッぁぃぅぇぉ♡]/.test(q);
    if (!moan) {
      /* 「知らない」「わからない」だけの返事ははぐらかす */
      q = q.replace(/^(?:(?:さあ、|さあ……)?(?:知らない|知らん|わからない|分からない|わかんない|分かんない|さあ)(?:な|よ|ね)?)(?=[。…‥]|$)/, 'さあ、どうだろうね')
        /* 命令はときどき「〜てごらん」「おいで」に（「来い」「見ろ」「〜てみろ」） */
        .replace(new RegExp('(^|[、。…\\s])来い' + E, 'g'), '$1おいで').replace(new RegExp('てみろ(?:よ)?' + E, 'g'), 'てごらん')
        .replace(new RegExp('(^|[、。…\\s])見ろ(?:よ)?' + E, 'g'), '$1見てごらん').replace(new RegExp('(^|[、。…\\s])見て' + '(?=[。…‥]|$)'), function (m, p) { return HK.lineLot(q, 2) ? p + '見てごらん' : m; })
        .replace(new RegExp('(?:のだ|んだ)よ(?=ね)', 'g'), 'んだ');
    }
    var parts = q.split(/([。！？!?…‥」\n]+)/), lastI = -1, lastAsk = -1;
    var polite = /(?:です|ます|ません|ください)/.test(q), grave = GRAVE.test(q);
    parts.forEach(function (seg, i) { if (!(i % 2) && /[^\s、]/.test(seg)) { lastI = i; if (/[？?]/.test(parts[i + 1] || '')) lastAsk = i; } });
    var out = parts.map(function (seg, i) {
      if (i % 2) return seg;
      var next = parts[i + 1] || '';
      /* 叫び（！）・喘ぎ（っ・ぁ・♡）、「……」で消えていく文はそのまま */
      if (/[！!]/.test(next) || /[っッぁぃぅぇぉー〜～♡]$/.test(seg)) return seg;
      var lead = (seg.match(/^[…‥、\s]+/) || [''])[0], tail = (seg.match(/[、]+$/) || [''])[0];
      var body = seg.slice(lead.length, seg.length - tail.length);
      var trail = /^[…‥]/.test(next) && !/[^…‥」\s]/.test(parts.slice(i + 1).join(''));
      if (!body || moan && /^[…‥]/.test(next)) return seg;
      /* 「……？」で途切れる問いかけ（呼びかけ・つぶやき）はそのまま */
      if (/^[…‥]+[？?]/.test(next)) return seg;
      return lead + mysOne(body, /[？?]/.test(next), i === lastI && !trail && !polite, i === lastAsk && !polite, grave) + tail;
    }).join('');
    /* ときどき行頭に「ふふ、」（深刻な台詞・喘ぎ・叫び・敬語・もう感嘆詞で始まる台詞には付けない） */
    if (!moan && !grave && !polite && !/[！!]/.test(out) && !/^(?:[…‥―ー、\s]|ふふ|ふっ|はは|ほう|へえ|おや|ああ|あ、|あの|え|う|ん|いや|はい|さあ|ほら|よし|まあ|ね)/.test(out)
      && out.length >= 6 && out.length <= 40 && !/[0-9０-９]/.test(out) && !/[。…‥]/.test(out.replace(/[。…‥？?]+$/, '')) && /(?:さ|だろうね|かもしれないね|かい|だい|のかな|だね|かな)[。？?]?$/.test(out) && HK.lineLot(out, 5)) out = 'ふふ、' + out;
    return out.replace(/かいかい/g, 'かい').replace(/さ(?:さ)+(?=[。！？…、」]|$)/g, 'さ').replace(/([！？!?])。/g, '$1');
  }
  V.mysticQuote = mystic;
  HK.toneFinish('mystic', mystic);
})();
