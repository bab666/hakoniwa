/* 箱庭シミュレーター: 穏やかから派生する口調（胡散臭い）
   文面と台詞の言い換えは「穏やか」をそのまま使い（書き下ろし・直しも穏やかのものを借りる。胡散臭いの直しがあればそちらを優先）、
   できあがった台詞の言い回しと語尾を、最後に付け替える（名前・一人称・並びは tone-registry.js）。
   ・胡散臭い … 砕け気味で、のらりくらり。「〜だねえ」「〜だよねえ」「〜なんじゃない？」「〜ってことかい？」「参ったねえ」「ちょいと、あんた」
   語尾の付け替えは台詞の最後の文だけ（毎文「ねえ」だとくどい）。喘ぎ・叫び・敬語の文はそのまま */
(function () {
  'use strict';
  var HK = window.HK, V = HK && HK.Voice, END = HK && HK.TONE_END;
  if (!V || !HK.toneFinish || !END) return;
  var PLAIN_END = END.plain, NA_END = END.na, WH = END.wh;

  var YOU = /(?:あなた|お前|おまえ|てめえ|貴様)(?!さん|方)|(?:きみ|(?<![大姫主父母諸細若暴])君)(?=(?:は|が|も|の|を|に|と|で|って|、|。|！|？|…|」|$|さ|ね|よ|なら|だけ|たち|ら|だ|じゃ|か|な|から|へ|や|しか|まで|より|一人|自身))/g;
  var KEEP = /(?:(?:です|ます|ました|ません|でした)(?:よ|ね|よね|か)?|でしょう|ましょう|ください|なさい|ちょうだい|[てで]|ねえ|かい|だい|さ)$/;
  /* 形容詞・「たい」：「〜ねえ」、動詞・「ない」・「た」：「〜よ」（自分の否定・意志に「ねえ」を付けると他人事に聞こえる） */
  var ADJ_END = /(?<!な)(?:い|たい|しい)$/;
  var WH2 = /(?:何|なに|なん|誰|だれ|どこ|いつ|なぜ|どうして|どんな|どっち|どれ|どう|いくつ|いくら|どの)/;

  /* 「誰にでも」「何か」のような不定のものは問いかけの言葉に数えない */
  function wh(s) { return WH2.test(s.replace(/(?:何|なに|なん|誰|だれ|どこ|いつ|どう)(?:にでも|でも|も|か|とか|度|ぞ)/g, '')); }
  /* 女性的な語尾を中性に（穏やかの女性の台詞から） */
  function unfem(s) {
    return s.replace(/([たいるうくすつむぬぐぶ])わね$/, '$1ねえ').replace(/([たいるうくすつむぬぐぶ])わよ$/, '$1よ').replace(/([一-鿿ァ-ヶー])(?:わね|ね)$/, '$1だねえ').replace(/(?<!いつも)のね$/, 'んだねえ').replace(/かしら$/, 'かねえ')
      .replace(/(?<!ん)のよ$/, 'んだよ').replace(/だわ$/, 'だよ').replace(/([たいるうくすつむぬぐぶ])わ$/, '$1よ').replace(/([一-鿿ァ-ヶー])よ$/, '$1だよ').replace(/^いいの、よ$/, 'いいんだよ');
  }
  function usanOne(s, ask, last, askOK) {
    var m;
    s = unfem(s);
    if (ask) {
      if (!askOK) return s;
      if (KEEP.test(s) && !/[てで]$/.test(s)) return s;
      if (/(?:って|という)こと$/.test(s)) return s + 'かい';
      if (/たくないかな$/.test(s)) return s.replace(/かな$/, 'んだよねえ');
      if (/かな$/.test(s)) return s.replace(/かな$/, 'かねえ');
      if (/(?:でしょう|でしょ|だろ)$/.test(s)) return s.replace(/(?:でしょう|でしょ|だろ)$/, 'だろう');
      if (/じゃない$/.test(s)) return s.replace(/([一-鿿ァ-ヶー])じゃない$/, '$1なんじゃない').replace(/(?<![ん一-鿿ァ-ヶー])じゃない$/, 'んじゃない');
      if (/[るうくすつむたい]か$/.test(s)) return s + 'い';
      /* 疑問詞があれば「〜んだい？」（「何してるの？」→「何してるんだい？」「どう思う？」→「どう思うんだい？」） */
      if (wh(s)) {
        if (/(?:の|ん)(?:だ)?$/.test(s)) return s.replace(/(?:の|ん)(?:だ)?$/, 'んだい');
        if (/(?:何|なに|なん|誰|だれ|どこ|いつ|なぜ|どうして|どんな|どっち|どれ|いくつ|いくら)$/.test(s)) return s + 'だい';
        if (/だ$/.test(s)) return s.replace(/だ$/, 'だい');
        if (PLAIN_END.test(s) && !/[たい]$/.test(s)) return s + 'んだい';
        return s;
      }
      /* 誘い・確認：「飲む？」→「飲むかい？」、「怒ってるの？」→「怒ってるのかい？」 */
      if (/(?:の|ん)$/.test(s)) return s.replace(/(?:の|ん)$/, 'のかい');
      /* 真意を聞き返す問い（「本気で言ってる？」「褒めてる？」）は「〜のかい？」 */
      if (/(?:言って|褒めて|ほめて|思って|考えて|からかって|ふざけて)る$/.test(s)) return s + 'のかい';
      if (/だ$/.test(s)) return s.replace(/だ$/, 'かい');
      if (/[一-鿿ァ-ヶー]$/.test(s) && s.length >= 2) return s + 'かい';
      if (PLAIN_END.test(s) || /ない$/.test(s)) return s + 'かい';
      return s;
    }
    if (KEEP.test(s) || /^(?:ね|はい、おしまい)$/.test(s)) return s;
    /* 「？」のない問いかけ（「何してる」「何だ」）は「〜のさ」「〜だい」 */
    if (wh(s) && !/^(?:あ、)?あの/.test(s)) {
      if (/(?:何|なん)だよ?$/.test(s)) return s.replace(/だよ?$/, 'だい');
      if (PLAIN_END.test(s) && !/た$/.test(s)) return s + 'のさ';
    }
    if (/んだもん$/.test(s)) return s.replace(/もん$/, 'からさ');
    if (/^困った$/.test(s)) return '参ったねえ';
    if (/^ありがとう$/.test(s)) return 'ありがとさん';
    if (/^ごめんね$/.test(s)) return '悪いねえ';
    if (/(?:だろう|だろ)$/.test(s)) return s.replace(/(?:だろう|だろ)$/, 'だろうねえ');
    if (/たくないかな$/.test(s)) return s.replace(/かな$/, 'んだよねえ');
    if (/かな$/.test(s)) return s.replace(/かな$/, 'かねえ');
    if (/じゃん$/.test(s)) return s.replace(/じゃん$/, 'じゃないの');
    if (/[ぞぜ]$/.test(s) && !/どうぞ$/.test(s)) return s.replace(/[ぞぜ]$/, 'よ');
    if (!last) return s;
    /* 最後の文だけ */
    if (/よね$/.test(s)) return s + 'え';
    /* 念押し・約束の「ね」（「今夜だけ、ね」「流してあげるね」）は伸ばさない */
    if (/(?:また|じゃ|[てで]|、|あげる|おく|から|もの)ね$/.test(s)) return s;
    if (/(?:そう|[一-鿿ァ-ヶーの])ね$/.test(s)) return s.replace(/の?ね$/, function (x) { return x === 'のね' ? 'んだねえ' : 'だねえ'; });
    if (/ね$/.test(s)) return s + 'え';
    if (/[んの]だよ$/.test(s)) return s;
    if ((m = s.match(/^(.*[一-鿿々]ん)だ$/))) return s + 'よ';
    if (/(?:ん|の)だ$/.test(s)) return s.replace(/(?:の)?だ$/, 'だよ');
    if (/(?<![まやだ]|あい)だ$/.test(s) && s.length > 2) return s + 'ねえ';
    if (NA_END.test(s) && !/おしまい$/.test(s)) return s + 'だねえ';
    /* 許可の「〜ていい」「今はいい」は「〜よ」（「いいねえ」だと感想になる） */
    if (/(?:[てではも]|なくて)いい$/.test(s)) return s + 'よ';
    if (/よ$/.test(s)) return s;
    /* 「急いでるの」→「急いでるのさ」 */
    if (/いいの$/.test(s)) return s + 'かい';
    if (/[るたい]の$/.test(s)) return s + 'さ';
    /* 短い否定の答え（「怒ってない」「なんでもない」）は「〜さ」、ほかの「ない」は「〜よ」 */
    if (/(?:[てで]ない|でもない)$/.test(s) && s.length <= 5) return s + 'さ';
    if (/ない$/.test(s) && !/じゃない$/.test(s)) return s + 'よ';
    if (s.length >= 3 && PLAIN_END.test(s) && !/じゃない$/.test(s)) return s + (ADJ_END.test(s) ? 'ねえ' : 'よ');
    return s;
  }
  function usan(q) {
    q = q.replace(YOU, 'あんた').replace(/(?:あなた|きみ|君)たち/g, 'あんたたち').replace(/あらあら|あらまあ/g, function (m) { return m === 'あらまあ' ? 'おやまあ' : 'おやおや'; }).replace(/(^|[、…\s])あら(?=[、…])/g, '$1おや')
      .replace(/^ねえ、(?!ちょっと)/, 'ちょいと、').replace(/えへへ|うふふ/g, 'へへ').replace(/困った(?=わ?ね|な)/g, '参った').replace(/だなあ(?=[。！？…、」]|$)/g, 'だねえ').replace(/ごめんなさいね/g, '悪いねえ')
      .replace(/(^|[、…\s])しよ(?:う|っ)か(?=[。！？…、」]|$)/g, '$1しようじゃないの').replace(/(?<=[えけげせぜてでねべめれ見来着寝出]|し)ろよ(?=[。！？…、」]|$)/g, 'なよ');
    q = q.replace(/あんた(?=です|でしょう)/g, 'あなた');
    var moan = /[っッぁぃぅぇぉ♡]/.test(q);
    /* 呆れ・ため息は「やれやれ」（行頭の「はあ」「もう、」「まったく」「ったく」）。喘ぎの台詞・問いかけには使わない */
    if (!moan) q = q.replace(/^(?:はあ+|はぁ+|ふう+|ったく|まったく|全く)(?:[、…‥。]+|$)/, 'やれやれ……').replace(/^もう、(?!一|二|三|少|すこ|ちょっと|いい|無理|だめ|ダメ|限界)(?=[^？?]*$)/, 'やれやれ、')
      .replace(/^(?:しょうがない|しょうがねえ|仕方ない|仕方ないな)(?:なあ|な|ね|よ)?(?=[。…‥！!]|$)/, 'やれやれ、しょうがないねえ').replace(/^呆れた(?=[。…‥！!]|$)/, 'やれやれ、呆れたねえ')
      .replace(/^いい加減にして(?=[。…‥！!]|$)/, 'やれやれ、いい加減にしてくれないかねえ').replace(/(^|…)また(?:か|かよ)?(?=[？?…‥]|$)/, function (m, p) { return p ? p + 'またかい' : 'やれやれ、またかい'; });
    /* 飄々と受け流す（決まった言い回しだけ） */
    q = q.replace(/^大丈夫、大丈夫(?=[。…‥]|$)/, 'まあまあ、大丈夫だって').replace(/^(?:なんとか|何とか)なる(?:よ|って)?(?=[。…‥]|$)/, 'ま、なんとかなるさ').replace(/^気にしないで(?=[。…‥]|$)/, '気にしない、気にしない')
      .replace(/^冗談だって(?=[。…‥]|$)/, '冗談だよ、冗談').replace(/^(?:知らない|わかんない|分かんない|さあ)(?=[。…‥]|$)/, 'さあ、どうだろうねえ').replace(/(^|[、。…\s])まあ、/g, '$1ま、');
    var parts = q.split(/([。！？!?…‥」\n]+)/), lastI = -1, lastAsk = -1;
    var polite = /(?:です|ます|ません)/.test(q);
    parts.forEach(function (seg, i) { if (!(i % 2) && /[^\s、]/.test(seg)) { lastI = i; if (/[？?]/.test(parts[i + 1] || '')) lastAsk = i; } });
    return parts.map(function (seg, i) {
      if (i % 2) return seg;
      var next = parts[i + 1] || '';
      /* 叫び（！）・喘ぎ（っ・ぁ・♡）、「……」で消えていく文はそのまま */
      if (/[！!]/.test(next) || /[っッぁぃぅぇぉー〜～♡]$/.test(seg)) return seg;
      var lead = (seg.match(/^[…‥、\s]+/) || [''])[0], tail = (seg.match(/[、]+$/) || [''])[0];
      var body = seg.slice(lead.length, seg.length - tail.length);
      var trail = /^[…‥]/.test(next) && !/[^…‥」\s]/.test(parts.slice(i + 1).join(''));
      /* 問いかけの「かい」「だい」は台詞の最後の問いだけ。丁寧語の台詞には付けない */
      return body ? lead + usanOne(body, /[？?]/.test(next), i === lastI && !trail, i === lastAsk && !polite) + tail : seg;
    }).join('');
  }
  V.usanQuote = usan;
  HK.toneFinish('usan', usan);
})();
