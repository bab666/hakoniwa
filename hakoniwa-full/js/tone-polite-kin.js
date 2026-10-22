/* 箱庭シミュレーター: 敬語から派生する口調（後輩・お嬢様）
   どちらも文面と台詞の言い換えは「敬語」をそのまま使い（書き下ろし・直しも敬語のものを借りる）、
   できあがった敬語の台詞の語尾だけを、最後に付け替える。
   ・後輩 … 「〜っす」「〜っすか」「〜じゃないっすか」「〜たっす」
   ・お嬢様 … 「〜ですわ」「〜ですの？」「〜ますわ」「〜くださいまし」 */
(function () {
  'use strict';
  var HK = window.HK, V = HK && HK.Voice, EX = HK && HK.TONE_EXTRA;
  if (!V || !EX) return;
  EX.kohai = { label: '後輩（〜っす）', desc: '「〜っす」「〜じゃないっすか」。人なつっこい後輩の話し方。文面は敬語のものを使う', base: 'polite', top: 'AC', fp: { m: '俺', f: '私', x: '自分' } };
  EX.ojou = { label: 'お嬢様（〜ですわ）', desc: '「〜ですわ」「〜ですの？」「〜くださいまし」。上品なお嬢様の話し方。文面は敬語のものを使う', base: 'polite', top: 'CP', fp: { m: 'わたくし', f: 'わたくし', x: 'わたくし' } };
  /* 選択欄では、後輩は健気（くだけた）の後ろ、お嬢様は敬語の後ろに並べる */
  [['kohai', 'devoted_p'], ['ojou', 'polite']].forEach(function (p) {
    var K = HK.TONE_KEYS; if (!K || K.indexOf(p[0]) >= 0) return;
    var i = K.indexOf(p[1]); if (i < 0) K.push(p[0]); else K.splice(i + 1, 0, p[0]);
  });
  var KIN = { kohai: 1, ojou: 1 };

  /* 書き下ろし・直しは敬語のものを引く */
  var of0 = V.overrideFor;
  V.overrideFor = function (q, who, people) {
    if (who && KIN[who.tone]) return of0 ? of0.call(this, q, Object.assign({}, who, { tone: 'polite' }), people) : null;
    return of0 ? of0.apply(this, arguments) : null;
  };

  var P = '(よね|よ|ね|か)?';
  function casual(s) { return V.casualQuote ? V.casualQuote(s) : s; }

  /* ---------- 後輩 ---------- */
  function kohaiOne(s, ask) {
    var m;
    if (/どうしましょう$/.test(s)) return s.replace(/どうしましょう$/, 'どうしたらいいっすか');
    if (/ありがとうございま(?:す|した)$/.test(s)) return s.replace(/ございま(す|した)$/, function (x, e) { return e === 'す' ? 'ございまっす' : 'ございましたっす'; });
    if (/(?:すみません|すいません)$/.test(s)) return s.replace(/(?:すみません|すいません)$/, 'すんません');
    if (/失礼しま(?:す|した)$/.test(s)) return s.replace(/しま(す|した)$/, function (x, e) { return e === 'す' ? 'しまっす' : 'しましたっす'; });
    if (/お願いします$/.test(s)) return s.replace(/お願いします$/, 'お願いしまっす');
    if (/ください$/.test(s)) return s + 'っす';
    if (/^ですよね$/.test(s)) return 'そうっすよね';
    if (/(?:ませんでした|でした)$/.test(s) && /(?:すみません|申し訳)/.test(s)) return s.replace(/(?:すみません|すいません)でした$/, 'すんませんでした');
    if (/でしょう?か?$/.test(s) && /(何|誰|どこ|いつ|どれ|どっち|なん)/.test(s)) return s;
    if (/でしょう?か?$/.test(s)) return s.replace(/でしょう?か?$/, 'っしょ');
    if (/(?:ではありませんでした|じゃありませんでした)$/.test(s)) return s.replace(/(?:では|じゃ)ありませんでした$/, 'じゃなかったっす');
    if (/ましょう(?:ね|か)?$/.test(s)) return s;
    if ((m = s.match(new RegExp('^(.*)(?:ではありません|じゃありません|じゃないです)' + P + '$')))) return m[1] + 'じゃないっす' + (m[2] || '');
    if ((m = s.match(new RegExp('^(.*)でした' + P + '$')))) return m[1] + 'だったっす' + (m[2] || '');
    if ((m = s.match(new RegExp('^(.*)です' + P + '$')))) return m[1] + 'っす' + (m[2] || '');
    /* 「〜ます」「〜ました」「〜ません」「〜ましょう」：ふつうの形にしてから「っす」 */
    if ((m = s.match(new RegExp('^(.*(?:ます|ました|ません|ませんでした|ましょう))' + P + '$')))) {
      var c = casual(m[1]);
      if (c === m[1]) return s;
      return c + 'っす' + (m[2] || '');
    }
    return s;
  }
  function kohai(q) {
    /* 尊敬語は後輩らしく言い直す（「おっしゃっているっすか」にしない） */
    /* 謙譲・尊敬の言い回しを、後輩らしいふつうの言い方に（「お持ちします」→「持ちます」、「いらっしゃいます」→「います」） */
    q = q.replace(/お([一-鿿][いきしちにひみりぎじびぴ]?)しま(す|した|しょう)/g, '$1ま$2').replace(/いらっしゃ(います|いました|る)/g, function (m, e) { return { 'います': 'います', 'いました': 'いました', 'る': 'いる' }[e]; }).replace(/いかが/g, 'どう').replace(/いただけ(?=ます|ません|る)/g, 'もらえ').replace(/伺(い|う)/g, '聞$1').replace(/なさって/g, 'して').replace(/おつらい/g, 'つらい').replace(/お疲れのご様子/g, '疲れてる感じ')
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
    }).join('').replace(/です(?=けど|から|が、|し、)/g, 'っす').replace(/っすっす/g, 'っす').replace(/(?:の|ん)っす/g, 'んす').replace(/だっす/g, 'っす');
  }

  /* ---------- お嬢様 ---------- */
  function ojouOne(s, ask, last) {
    var m;
    if (/^ですよね$/.test(s)) s = 'そうですよね';
    if (/ください$/.test(s)) return s.replace(/ください$/, 'くださいまし');
    if (ask && /(?:です|ます)か$/.test(s)) return s.replace(/(です|ます)か$/, function (x, e) { return e === 'です' ? 'ですの' : 'ますの'; });
    if (ask && /です$/.test(s)) return s.replace(/です$/, 'ですの');
    if (ask && /(?:ました|ません|でした|ます)$/.test(s)) return s + 'の';
    s = s.replace(/んです(?=(?:よね|よ|ね)?$)/, 'のです').replace(/ないです(?=(?:よね|よ|ね)?$)/, 'ありません');
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

  var tf0 = V.toneFinish;
  V.toneFinish = function (q, who) {
    if (tf0) q = tf0(q, who);
    var t = who && who.tone;
    if (t === 'kohai') return kohai(q);
    if (t === 'ojou') return ojou(q);
    return q;
  };
})();
