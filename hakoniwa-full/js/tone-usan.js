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
  /* 形容詞・「ない」「たい」：「〜ねえ」、動詞・「た」：「〜よ」 */
  var ADJ_END = /(?:い|ない|たい|しい)$/;

  /* 「誰にでも」「何か」のような不定のものは問いかけの言葉に数えない */
  function wh(s) { return WH.test(s.replace(/(?:何|なに|なん|誰|だれ|どこ|いつ)(?:にでも|でも|も|か|とか|度)/g, '')); }
  function usanOne(s, ask, last) {
    var m;
    if (ask) {
      if (KEEP.test(s) && !/[てで]$/.test(s)) return s;
      if (/(?:って|という)こと$/.test(s)) return s + 'かい';
      if (/かな$/.test(s)) return s.replace(/かな$/, 'かねえ');
      if (/(?:でしょう|でしょ|だろ)$/.test(s)) return s.replace(/(?:でしょう|でしょ|だろ)$/, 'だろう');
      if (/じゃない$/.test(s)) return s.replace(/(?<!ん)じゃない$/, 'んじゃない');
      /* 「何してるの？」→「何してるんだい？」、「怒ってるの？」→「怒ってるのかい？」 */
      if (/(?:の|ん)(?:だ)?$/.test(s)) return wh(s) ? s.replace(/(?:の|ん)(?:だ)?$/, 'んだい') : s.replace(/(?:の|ん)(?:だ)?$/, 'のかい');
      if (/(?:何|なに|なん|誰|だれ|どこ|いつ|なぜ|どうして|どんな|どっち|どれ)$/.test(s)) return s + 'だい';
      if (/だ$/.test(s)) return s.replace(/だ$/, wh(s) ? 'だい' : 'かい');
      if (wh(s)) return s;
      if (/[一-鿿ァ-ヶー]$/.test(s) && s.length >= 2) return s + 'かい';
      if (/た$/.test(s) || ADJ_END.test(s)) return s + 'かい';
      if (PLAIN_END.test(s)) return s + 'のかい';
      return s;
    }
    if (KEEP.test(s)) return s;
    if (/^困った$/.test(s)) return '参ったねえ';
    if (/^ありがとう$/.test(s)) return 'ありがとさん';
    if (/^ごめんね$/.test(s)) return '悪いねえ';
    if (/(?:だろう|だろ)$/.test(s)) return s.replace(/(?:だろう|だろ)$/, 'だろうねえ');
    if (/かな$/.test(s)) return s.replace(/かな$/, 'かねえ');
    if (/じゃん$/.test(s)) return s.replace(/じゃん$/, 'じゃないの');
    if (/[ぞぜ]$/.test(s) && !/どうぞ$/.test(s)) return s.replace(/[ぞぜ]$/, 'よ');
    if (!last) return s;
    /* 最後の文だけ */
    if (/よね$/.test(s)) return s + 'え';
    if (/(?:また|じゃ)ね$/.test(s)) return s;
    if (/ね$/.test(s)) return s + 'え';
    if (/(?<![まやだ]|あい)だよ$/.test(s)) return s.replace(/だよ$/, 'さ');
    if ((m = s.match(/^(.*[一-鿿々]ん)だ$/))) return s + 'よ';
    if (/(?:ん|の)だ$/.test(s)) return s.replace(/(?:の)?だ$/, 'だよ');
    if (/(?<![まやだ]|あい)だ$/.test(s) && s.length > 2) return s + 'ねえ';
    if (NA_END.test(s)) return s + 'だねえ';
    if (/よ$/.test(s)) return s;
    if (s.length >= 3 && PLAIN_END.test(s) && !/じゃない$/.test(s)) return s + (ADJ_END.test(s) ? 'ねえ' : 'よ');
    return s;
  }
  function usan(q) {
    q = q.replace(YOU, 'あんた').replace(/(?:あなた|きみ|君)たち/g, 'あんたたち').replace(/あらあら/g, 'おやおや').replace(/(^|[、…\s])あら(?=[、…])/g, '$1おや')
      .replace(/^ねえ、/, 'ちょいと、').replace(/えへへ/g, 'へへ').replace(/困った(?=ね|な)/g, '参った').replace(/だなあ(?=[。！？…、」]|$)/g, 'だねえ')
      .replace(/(^|[、…\s])しよ(?:う|っ)か(?=[。！？…、」]|$)/g, '$1しようじゃないの');
    /* 呆れ・ため息は「やれやれ」（行頭の「はあ」「もう、」「まったく」「ったく」） */
    q = q.replace(/^(?:はあ+|はぁ+|ふう+|ったく|まったく|全く)(?:[、…‥。]+|$)/, 'やれやれ……').replace(/^もう、(?!一|二|三|少|すこ|ちょっと|いい|無理|だめ|ダメ|限界)/, 'やれやれ、')
      .replace(/^(?:しょうがない|しょうがねえ|仕方ない|仕方ないな)(?:なあ|な|ね|よ)?(?=[。…‥！!]|$)/, 'やれやれ、しょうがないねえ').replace(/^呆れた(?=[。…‥！!]|$)/, 'やれやれ、呆れたねえ')
      .replace(/^いい加減にして(?=[。…‥！!]|$)/, 'やれやれ、いい加減にしてくれないかねえ').replace(/^また(?:か|かよ)?(?=[？?…‥]|$)/, 'やれやれ、またかい');
    /* 飄々と受け流す（決まった言い回しだけ） */
    q = q.replace(/^大丈夫、大丈夫(?=[。…‥]|$)/, 'まあまあ、大丈夫だって').replace(/^(?:なんとか|何とか)なる(?:よ|って)?(?=[。…‥]|$)/, 'ま、なんとかなるさ').replace(/^気にしないで(?=[。…‥]|$)/, '気にしない、気にしない')
      .replace(/^冗談だって(?=[。…‥]|$)/, '冗談だよ、冗談').replace(/^(?:知らない|わかんない|分かんない|さあ)(?=[。…‥]|$)/, 'さあ、どうだろうねえ').replace(/(^|[、。…\s])まあ、/g, '$1ま、');
    var parts = q.split(/([。！？!?…‥」\n]+)/), lastI = -1;
    parts.forEach(function (seg, i) { if (!(i % 2) && /[^\s、]/.test(seg)) lastI = i; });
    return parts.map(function (seg, i) {
      if (i % 2) return seg;
      var next = parts[i + 1] || '';
      /* 叫び（！）・喘ぎ（っ・ぁ・♡）、「……」で消えていく文はそのまま */
      if (/[！!]/.test(next) || /[っッぁぃぅぇぉー〜～♡]$/.test(seg)) return seg;
      var lead = (seg.match(/^[…‥、\s]+/) || [''])[0], tail = (seg.match(/[、]+$/) || [''])[0];
      var body = seg.slice(lead.length, seg.length - tail.length);
      var trail = /^[…‥]/.test(next) && !/[^…‥」\s]/.test(parts.slice(i + 1).join(''));
      return body ? lead + usanOne(body, /[？?]/.test(next), i === lastI && !trail) + tail : seg;
    }).join('');
  }
  V.usanQuote = usan;
  HK.toneFinish('usan', usan);
})();
