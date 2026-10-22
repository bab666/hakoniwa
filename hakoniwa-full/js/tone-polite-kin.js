/* 箱庭シミュレーター: 敬語から派生する口調（後輩・お嬢様）
   どちらも文面と台詞の言い換えは「敬語」をそのまま使い（書き下ろし・直しも敬語のものを借りる。その口調の直しがあればそちらを優先）、
   できあがった敬語の台詞の語尾だけを、最後に付け替える。
   ・後輩 … 「〜っす」「〜っすか」「〜じゃないっすか」「〜たっす」
   ・お嬢様 … 「〜ですわ」「〜ですの？」「〜ますわ」「〜くださいまし」 */
(function () {
  'use strict';
  var HK = window.HK, V = HK && HK.Voice;
  if (!V || !HK.toneFinish) return;
  /* 名前・一人称・並び・派生元（derive: 'polite'）は tone-registry.js。
     その口調名の直し（tone-fix.js）があればそれを完成形として使い、なければ敬語の書き下ろし・直しを引いて、ここで語尾を付け替える（voice.js） */

  var P = '(よね|よ|ね|か)?';
  function casual(s) { return V.casualQuote ? V.casualQuote(s) : s; }

  /* ---------- 後輩 ---------- */
  function kohaiOne(s, ask) {
    var m;
    if (/どうしましょう$/.test(s)) return s.replace(/どうしましょう$/, 'どうしたらいいっすか');
    if (/ありがとうございま(?:す|した)$/.test(s)) return s.replace(/ございま(す|した)$/, function (x, e) { return e === 'す' ? 'ございまっす' : 'ございましたっす'; });
    if (/(?:すみません|すいません)$/.test(s)) return s.replace(/(?:すみません|すいません)$/, 'すんません');
    if (/失礼しま(?:す|した)$/.test(s)) return s.replace(/しま(す|した)$/, function (x, e) { return e === 'す' ? 'しまっす' : 'しましたっす'; });
    if (/お願いします(?:よね|よ|ね)?$/.test(s)) return s.replace(/お願いします((?:よね|よ|ね)?)$/, 'お願いしまっす$1');
    if (/ください$/.test(s)) return s + 'っす';
    if (/^ですよね$/.test(s)) return 'そうっすよね';
    if (/(?:ませんでした|でした)$/.test(s) && /(?:すみません|申し訳)/.test(s)) return s.replace(/(?:すみません|すいません)でした$/, 'すんませんでした');
    if (/でしょう?か?$/.test(s) && /(何|誰|どこ|いつ|どれ|どっち|なん)/.test(s)) return s;
    if (/でしょうか$/.test(s)) return s.replace(/でしょうか$/, 'っすか');
    if (/でしょう?$/.test(s)) return s.replace(/でしょう?$/, 'っしょ');
    if (/(?:ではありませんでした|じゃありませんでした)$/.test(s)) return s.replace(/(?:では|じゃ)ありませんでした$/, 'じゃなかったっす');
    if (/ましょう(?:ね|か)?$/.test(s)) return s;
    if ((m = s.match(new RegExp('^(.*)(?:ではありません|じゃありません|じゃないです)' + P + '$')))) return m[1] + 'じゃないっす' + (m[2] || '');
    if ((m = s.match(new RegExp('^(.*ませんでした)' + P + '$')))) { var c0 = casual(m[1]); return (c0 === m[1] ? m[1] : c0 + 'っす') + (m[2] || ''); }
    if ((m = s.match(new RegExp('^(.*)でした' + P + '$')))) return m[1] + 'だったっす' + (m[2] || '');
    if ((m = s.match(new RegExp('^(.*)です' + P + '$')))) return m[1] + 'っす' + (m[2] || '');
    /* 「〜ます」「〜ました」「〜ません」「〜ましょう」：ふつうの形にしてから「っす」 */
    if ((m = s.match(new RegExp('^(.*(?:ます|ました|ません|ませんでした|ましょう))' + P + '$')))) {
      /* 「すぎます」は「すぎっす」（ふつうの形にすると「すぐ」と崩れる） */
      var c = /すぎます$/.test(m[1]) ? m[1].replace(/すぎます$/, 'すぎ') : casual(m[1]);
      if (c === m[1]) return s;
      return c + 'っす' + (m[2] || '');
    }
    return s;
  }
  function kohai(q) {
    /* 尊敬語は後輩らしく言い直す（「おっしゃっているっすか」にしない） */
    /* 謙譲・尊敬の言い回しを、後輩らしいふつうの言い方に（「お持ちします」→「持ちます」、「いらっしゃいます」→「います」） */
    q = q.replace(/([ぁ-ん一-鿿]*?)しゅうございま(す|した)/g, function (m, a, e) { return a + (e === 'す' ? 'しいっす' : 'しかったっす'); }).replace(/恐れ入(?:ります|りますが)/g, 'すんません').replace(/かしこまりました/g, '了解っす').replace(/参りま(す|した|しょう)/g, '来ま$1').replace(/お申し付けください/g, '言ってください').replace(/(?:いけません|なりません)(?=[。！？…、」っ]|$)/g, 'ダメっす').replace(/お許しください/g, '許してください').replace(/申し訳(?:ありませ|ございませ)/g, 'すんませ').replace(/皆様/g, 'みなさん').replace(/今宵/g, '今夜')
      .replace(/(?:大変|誠に)?失礼いたしました/g, 'すんません').replace(/いたしま(す|した|しょう)/g, 'しま$1').replace(/申し上げ/g, '言い').replace(/ご自分/g, '自分').replace(/(?<!ありがとう)ございました/g, 'ありました').replace(/なさいま(す|した)/g, 'しま$1').replace(/すまない/g, 'すんません')
      .replace(/お(下がり|待ち|座り|入り|掛け|休み|召し上がり)ください/g, function (m, v) { return { '下がり': '下がって', '待ち': '待って', '座り': '座って', '入り': '入って', '掛け': '掛けて', '休み': '休んで', '召し上がり': '食べて' }[v] + 'ください'; })
      .replace(/お(?!願い)([一-鿿][いきしちにひみりぎじびぴ]?)しま(す|した|しょう)/g, '$1ま$2').replace(/いらっしゃ(います|いました|る)/g, function (m, e) { return { 'います': 'います', 'いました': 'いました', 'る': 'いる' }[e]; }).replace(/いかが/g, 'どう').replace(/いただけ(?=ます|ません|る)/g, 'もらえ').replace(/伺(い|う)/g, '聞$1').replace(/なさって/g, 'して').replace(/おつらい/g, 'つらい').replace(/お疲れのご様子/g, '疲れてる感じ')
      .replace(/(?:いたし|し|でき)かね(?:ます|る)(?=[。！？…、」っ]|$)/g, 'できないっす').replace(/おっしゃって(?=ください)/g, '言って').replace(/存じて(?:い)?(?=る|ます|ました)/g, '知って').replace(/存じ(?:ません|ない)/g, '知らない').replace(/申し訳(?:ありません|ございません)/g, 'すんません')
      .replace(/(?:お任せ|任せて)ください/g, '任せてください').replace(/させていただ(きます|く)/g, 'させてもらいます').replace(/ですが、/g, 'っすけど、').replace(/ていま(す|した|せん)/g, 'てま$1').replace(/ている(?=[。！？…、」っ]|$)/g, 'てる')
      .replace(/([てで])、?しま(い|う|った|いました|います)/g, function (m, t, e) { var c = t === 'て' ? 'ちゃ' : 'じゃ'; return c + ({ 'い': 'い', 'う': 'う', 'った': 'った', 'いました': 'いました', 'います': 'います' })[e]; });
    q = q.replace(/おっしゃって(?:い)?(る|ます|ました)/g, '言って$1').replace(/おっしゃ(る|います|いました)/g, function (m, e) { return { 'る': '言う', 'います': '言います', 'いました': '言いました' }[e]; });
    var parts = q.split(/([。！？!?…‥」\n]+)/);
    return parts.map(function (seg, i) {
      if (i % 2) return seg;
      var lead = (seg.match(/^[…‥、\s]+/) || [''])[0], tail = (seg.match(/[っッー〜～♡、]+$/) || [''])[0];
      var body = seg.slice(lead.length, seg.length - tail.length);
      var o = body ? kohaiOne(body, /[？?]/.test(parts[i + 1] || '')) : '';
      if (o && /[？?]/.test(parts[i + 1] || '') && /っす$/.test(o)) o += 'か';
      return body ? lead + o + tail : seg;
    }).join('').replace(/([^、。！？!?…‥\s「」]*?)ます(?=から|けど|が、|し、)/g, function (m) { var c = casual(m); return c === m ? m : c + 'っす'; }).replace(/です(?=けど|から|が、|し、)/g, 'っす').replace(/っすっす/g, 'っす').replace(/([るたいうなだ])(?:の|ん)っす/g, '$1んす').replace(/だっす/g, 'っす');
  }

  /* ---------- お嬢様 ---------- */
  function ojouOne(s, ask, last) {
    var m;
    if (/^ですよね$/.test(s)) s = 'そうですよね';
    if (/ください$/.test(s)) return s.replace(/ください$/, 'くださいまし');
    if (ask && /(?:です|ます)か$/.test(s)) return s.replace(/(です|ます)か$/, function (x, e) { return e === 'です' ? 'ですの' : 'ますの'; });
    if (ask && /です$/.test(s)) return s.replace(/です$/, 'ですの');
    if (ask && /(?:ました|ません|でした|ます)$/.test(s)) return s + 'の';
    s = s.replace(/んです(?=(?:よね|よ|ね)?$)/, 'のです')
      /* 「〜ないです」→「〜ありません」は、形容詞の「く」・「じゃ／では」・名詞＋ない だけ（「危ない」「分からない」はそのまま） */
      .replace(/(^|[…‥、]|が|は|も|しか|く|じゃ|では|関係|意味|興味|問題|時間|余裕|自信|用|元気|覚え|記憶|心当たり|文句|容赦|金|気|暇)ないです(?=(?:よね|よ|ね)?$)/, '$1ありません');
    if (/(?:すみません|すいません)$/.test(s)) return s.replace(/(?:すみません|すいません)$/, '失礼いたしましたわ');
    /* 「〜わ」は台詞の最後の文だけ（毎文につけるとくどい） */
    if (last && (m = s.match(/^(.*(?:です|ます|ました|ません|でした))(よね|よ|ね)?$/))) return m[1] + 'わ' + (m[2] === 'よね' ? 'よね' : m[2] || '');
    return s;
  }
  function ojou(q) {
    var parts = q.split(/([。！？!?…‥」\n]+)/), lastI = -1;
    parts.forEach(function (seg, i) { if (!(i % 2) && /[^…‥、\s]/.test(seg)) lastI = i; });
    return parts.map(function (seg, i) {
      if (i % 2) return seg;
      var lead = (seg.match(/^[…‥、\s]+/) || [''])[0], tail = (seg.match(/[っッー〜～♡、]+$/) || [''])[0];
      var body = seg.slice(lead.length, seg.length - tail.length);
      return body ? lead + ojouOne(body, /[？?]/.test(parts[i + 1] || ''), i === lastI) + tail : seg;
    }).join('');
  }

  HK.toneFinish('kohai', kohai);
  HK.toneFinish('ojou', ojou);
})();
