/* 箱庭シミュレーター: アンケートで希望の多かった口調（2026-10-25）
   どれも既存の口調の文面と言い換えを借り、できあがった台詞の語尾だけを最後に付け替える（tone-registry.js の derive・HK.toneFinish）。
   ・無愛想な敬語（〜ですが、何か） … 敬語から。感嘆を削り、言い切りと皮肉の一言で突き放す
   ・偉そうな敬語（〜なさい） … 敬語から。頼みを「〜なさい」、誘いを「〜しますよ」に
   ・無機質な敬語 … 敬語から。感嘆・間投詞・「ね」「よ」を削り、報告のような言い切りに
   ・ふつうのタメ口 … 気質の文面から敬語を外す（tone-plus.js の plain）。語尾の付け替えはしない
   ・ダウナー系チャラ男（〜ですよー） … 敬語から。語尾を伸ばし、「〜けど」で軽く逃げる
   喘ぎ（っ・♡・ぁ などを含む台詞）は崩さない */
(function () {
  'use strict';
  var HK = window.HK, V = HK && HK.Voice;
  if (!V || !HK.toneFinish) return;
  var MOAN = /[っッ♡ぁぃぅぇぉ゛]|……$/;
  var E = '(?=[。！？!?…‥」]|$)';
  function base(q, who, o) { return V.iIre ? V.iIre(q, who, o) : q; }
  /* 文ごとに直す（句点・感嘆・疑問で区切る） */
  function bySent(q, fn) {
    return q.replace(/[^。！？!?]+[。！？!?]*/g, function (s) {
      var m = s.match(/^(.*?)([。！？!?]*)$/);
      return fn(m[1], m[2]) ;
    });
  }
  /* 言いよどみ（……で始まる）・告白の台詞には、皮肉や念押しの一言を足さない */
  function quiet(q) { return /^[…‥]/.test(q) || /好き|愛して|付き合って/.test(q); }
  function lot(q, n) { return HK.lineLot ? HK.lineLot(q, n) : false; }
  /* 「〜てください」→「〜なさい」（よく出る動詞だけ。分からなければそのまま） */
  var TE = { 'して': 'し', '来て': '来', '見て': '見', '待って': '待ち', '言って': '言い', '行って': '行き', '座って': '座り', '黙って': '黙り', '帰って': '帰り', '休んで': '休み', '飲んで': '飲み', '読んで': '読み', '呼んで': '呼び', '書いて': '書き', '聞いて': '聞き', '急いで': '急ぎ', '離れて': '離れ', '落ち着いて': '落ち着き', '答えて': '答え', '教えて': '教え', '決めて': '決め', 'やめて': 'やめ', '止めて': 'やめ', '見せて': '見せ', '任せて': '任せ', '寝て': '寝', '出て': '出', '起きて': '起き', '下がって': '下がり', '気をつけて': '気をつけ', '信じて': '信じ', '入って': '入り', '戻って': '戻り', '頑張って': '頑張り', '笑って': '笑い', '泣いて': '泣き', '動いて': '動き', '隠れて': '隠れ', '逃げて': '逃げ', '考えて': '考え', '手伝って': '手伝い', '使って': '使い', '食べて': '食べ', '開けて': '開け', '閉めて': '閉め' };
  var TE_RE = new RegExp('(' + Object.keys(TE).sort(function (a, b) { return b.length - a.length; }).join('|') + ')ください');

  /* ---------- 無愛想な敬語 ---------- */
  function sarc(q, who, o) {
    q = base(q, who, o);
    if (MOAN.test(q)) return q;
    q = q.replace(/^(?:わあ|わぁ|えっと|あの|あのー|うわ|やった|よかった)[、！!]*/, '');
    q = q.replace(/ありがとうございま(?:す|した)/g, 'どうも').replace(/よろしくお願いします/g, 'よろしく')
      .replace(/すみません(?=[、。！!]|$)/g, 'すみませんね');
    q = bySent(q, function (s, p) {
      s = s.replace(/(です|ます|ました|ません)(?:よね|よ|ね)$/, '$1');
      return s + (p ? p.replace(/[！!]+/g, '。') : '');
    });
    /* 言い切りの敬語で終わる台詞には、ときどき皮肉の一言を足す */
    if (!quiet(q) && /(です|ます|ました|ません)。?$/.test(q) && lot(q, 4)) q = q.replace(/。?$/, '。') + (lot(q + 'x', 2) ? '……何か？' : '……で？');
    return q;
  }
  /* ---------- 偉そうな敬語 ---------- */
  function bossy(q, who, o) {
    q = base(q, who, o);
    if (MOAN.test(q)) return q;
    q = q.replace(TE_RE, function (m, v) { return TE[v] + 'なさい'; });
    q = q.replace(/ないでください/g, 'ないように').replace(/てほしいです/g, 'てもらいます').replace(/でほしいです/g, 'でもらいます').replace(/でしょうか(?=[。？?…」]|$)/g, 'ですか')
      .replace(/(?:よろしい|いい)でしょうか/g, 'よろしいですね').replace(/お願いします(?=[。！!…]|$)/g, '頼みましたよ');
    q = q.replace(/しましょう(?=か?[。！？!?…」]|$)/g, 'しますよ').replace(/ませんか(?=[？?]|$)/g, 'なさい');
    q = q.replace(/すみません(?=[、。！!]|$)/g, '悪かったですね').replace(/ありがとうございま(?:す|した)/g, '礼を言います');
    q = bySent(q, function (s, p) { return s + (p ? p.replace(/[！!]+/g, '。') : ''); });
    if (quiet(q)) return q;
    if (/なさい。?$/.test(q) && lot(q, 3)) q = q.replace(/。?$/, '。') + '……聞こえませんでしたか？';
    else if (/(?:ですか|ますか)[？?]$/.test(q) && lot(q, 3)) q += '　答えなさい。';
    else if (/(?:です|ます|ません)。?$/.test(q) && lot(q + 'b', 5)) q = q.replace(/。?$/, '。') + '当然でしょう。';
    return q;
  }
  /* ---------- 無機質な敬語 ---------- */
  function flat(q, who, o) {
    q = base(q, who, o);
    if (MOAN.test(q)) return q;
    q = q.replace(/^(?:わあ|わぁ|えっと|あの|あのー|うわ|やった|よかった|ふふ|あはは|へえ|うん|ええと|はは)[、！!…]*/, '');
    q = q.replace(/ありがとうございま(?:す|した)/g, '感謝します').replace(/すみません(?=[、。！!]|$)/g, '失礼しました');
    q = q.replace(/でしょうか(?=[。？?…」]|$)/g, 'ですか').replace(/([るたいう])かもしれません/g, '$1可能性があります').replace(/分かりません(?=[。！？!?…」]|$)/g, '不明です')
      .replace(/大丈夫です(?=[。！？!?…」、]|$)/g, '問題ありません').replace(/(?:みたい|よう)です(?=[。！!…」]|$)/g, 'と判断します').replace(/と思います(?=[。！!…」]|$)/g, 'と判断します')
      .replace(/てほしいです/g, 'てください').replace(/でほしいです/g, 'でください').replace(/嬉しいです/g, '好ましい結果です');
    q = bySent(q, function (s, p) {
      s = s.replace(/(です|ます|ました|ません|でした)(?:よね|よ|ね|ねえ)$/, '$1').replace(/[〜ー♪]+$/, '');
      return s + (p ? p.replace(/[！!]+/g, '。') : '');
    });
    return q.replace(/[♪]/g, '');
  }
  /* ---------- ダウナー系チャラ男 ---------- */
  function downer(q, who, o) {
    q = base(q, who, o);
    if (MOAN.test(q)) return q;
    q = q.replace(/ありがとうございま(?:す|した)/g, 'あざーす').replace(/すみません(?=[、。！!]|$)/g, 'さーせん').replace(/よろしくお願いします/g, 'よろしくでーす');
    q = q.replace(/でしょうか(?=[。？?…」]|$)/g, 'ですかねー').replace(/ください(?=[。！!…」]|$)/g, 'くださいよー').replace(/てほしいです/g, 'てほしいなー、なんて').replace(/でほしいです/g, 'でほしいなー、なんて');
    q = bySent(q, function (s, p) {
      var P = p ? p.replace(/[！!]+/g, '。') : '';
      /* 問いかけは「〜ですかー？」にすることがある（「〜けど」「〜よー」は付けない） */
      if (/[？?]/.test(p)) return (/(ですか|ますか)$/.test(s) && lot(s, 2) ? s + 'ー' : s) + p;
      if (/(です|ます)よ$/.test(s)) return s + 'ー' + P;
      if (/(です|ます|ません)$/.test(s) && lot(s, 3)) return s + 'けど' + P;
      if (/(です|ます)$/.test(s) && lot(s + 'y', 3)) return s + 'よー' + P;
      return s + P;
    });
    return q;
  }
  HK.toneFinish('keigo_sarc', sarc);
  HK.toneFinish('keigo_bossy', bossy);
  HK.toneFinish('keigo_flat', flat);
  HK.toneFinish('chara_down', downer);
  V.newToneFinish = { keigo_sarc: sarc, keigo_bossy: bossy, keigo_flat: flat, chara_down: downer };
})();
