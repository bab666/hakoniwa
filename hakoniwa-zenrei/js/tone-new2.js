/* 箱庭シミュレーター: アンケートで希望のあった口調（2026-10-25・二回目）と、住人ごとの語尾の付け替え（toneCustom）
   どれも既存の口調の文面と言い換えを借り、できあがった台詞を最後に整える（tone-registry.js の derive・HK.toneFinish）。
   ・冷静（丸い）cool_soft … 冷静から。言い切りを丸くし（「〜だな」→「〜だね」、命令→「〜して」、「〜ている」→「〜てる」）、
     最後の文にときどき「よ」「ね」を添える。「……」は半分に
   ・けだるげ（軽）darui_lite … けだるげの言い換えのあと、「……」を台詞の頭の一つまでに
   ・中性的（僕）boku_n … 穏やか（中性的）の言い換えのあと、最後の文を「〜だね」「〜かな」に寄せる。一人称は「僕」
   ・神の命令口調 god … 尊大（紳士の言い換え＋尊大の語尾）のあと、「〜たまえ」を「〜せよ」「〜よ」に、「〜かね」を「〜か」に、
     「だろう」を「であろう」に、言い切りをときどき「〜である」「〜ぞ」「〜ぬ」に。一人称は「我」、二人称は「汝」
   喘ぎ（っ・♡・ぁ などを含む台詞）は崩さない（喘ぎは ero-moan-tone.js・novel-moan-tone.js の口調の表）。
   住人ごとの語尾の付け替え（toneCustom：「です→っす、だ→だぜ」を5つまで）は、口調の仕上げのあとに voice.js から V.applyToneCustom で通す（辞書には入れない） */
(function () {
  'use strict';
  var HK = window.HK, V = HK && HK.Voice;
  if (!V || !HK.toneFinish) return;
  var MOAN = /[♡ぁぃぅぇぉ゛]|[っッ](?=[…‥、。！!？?\s」〜ー]|$)/;
  function lot(q, n) { return HK.lineLot ? HK.lineLot(q, n) : false; }
  /* 文ごとに直す。fn(本文, 本文の後ろの「……」など, 区切り, 最後の文か) */
  function bySent(q, fn) {
    var parts = q.match(/[^。！？!?]+[。！？!?]*|[。！？!?]+/g) || [q], lastI = -1;
    parts.forEach(function (p, i) { if (/[^。！？!?…‥、\s]/.test(p)) lastI = i; });
    return parts.map(function (p, i) {
      var m = p.match(/^([\s\S]*?)([。！？!?]*)$/), body = m[1], pun = m[2];
      var tl = (body.match(/[…‥〜ー、\s]*$/) || [''])[0], core = body.slice(0, body.length - tl.length);
      if (!core || /[」』]$/.test(core)) return p;
      return fn(core, tl, pun, i === lastI);
    }).join('');
  }
  function tidy(q) { return q.replace(/、{2,}/g, '、').replace(/、(?=[。！？!?」]|$)/g, '').replace(/^、/, '').replace(/([！？!?])。/g, '$1'); }
  /* 「……」を減らす。keep(k, 頭か) が true の k 番目だけ残す。消す所は、文の頭・終わりなら何も置かず、文の途中なら読点に */
  function dots(q, keep) {
    var k = 0;
    return tidy(q.replace(/[…‥]+/g, function (m, at, all) {
      k++;
      var prev = all.charAt(at - 1), next = all.charAt(at + m.length);
      if (keep(k, !prev)) return m;
      if (!prev || /[。！？!?、「\s]/.test(prev)) return '';
      if (!next || /[。！？!?、」\s]/.test(next)) return '';
      return '、';
    }));
  }
  /* 命令を頼みに（冷静（丸い））。よく出る動詞だけ */
  var IMP = { '待て': '待って', '行け': '行って', '黙れ': '黙って', '止まれ': '止まって', '急げ': '急いで', '聞け': '聞いて', '言え': '言って', '動け': '動いて', '座れ': '座って', '帰れ': '帰って', '戻れ': '戻って', '走れ': '走って', '下がれ': '下がって', '離せ': '離して', '話せ': '話して', '出せ': '出して', '探せ': '探して', '休め': '休んで', '読め': '読んで', '飲め': '飲んで', '掴まれ': '掴まって', '手伝え': '手伝って', '使え': '使って', '笑え': '笑って', '来い': '来て', '見ろ': '見て', '寝ろ': '寝て', '着ろ': '着て', '食え': '食べて' };
  var IMP_RE = new RegExp('(' + Object.keys(IMP).join('|') + ')(?:よ)?$');
  /* 禁止の「〜な」を「〜ないで」に（言い切りの「〜な」と取り違えないよう、表にある動詞だけ） */
  var NEG = { '出すな': '出さないで', '触るな': '触らないで', '来るな': '来ないで', '見るな': '見ないで', '動くな': '動かないで', '言うな': '言わないで', '行くな': '行かないで', '笑うな': '笑わないで', '逃げるな': '逃げないで', '泣くな': '泣かないで', 'するな': 'しないで', '騒ぐな': '騒がないで', '近づくな': '近づかないで', '離れるな': '離れないで', '忘れるな': '忘れないで', '止まるな': '止まらないで', '振り向くな': '振り向かないで', '決めつけるな': '決めつけないで', 'ふざけるな': 'ふざけないで', '焦るな': '焦らないで', '死ぬな': '死なないで', '無茶するな': '無茶しないで', '油断するな': '油断しないで', '気にするな': '気にしないで', '心配するな': '心配しないで', '黙るな': '黙らないで', '隠すな': '隠さないで', '急ぐな': '急がないで' };
  var NEG_RE = new RegExp('(' + Object.keys(NEG).join('|') + ')(?:よ)?$');

  /* ---------- 冷静（丸い） ---------- */
  function coolSoft(q, who, ctx) {
    if (!q) return q;
    /* 喘ぎは言い回しを変えず、「……」だけ半分に（二つ目・四つ目…を外す） */
    if (MOAN.test(q)) return dots(q, function (k) { return k % 2 === 1; });
    q = q.replace(/([てで])い(る|た|な)/g, '$1$2').replace(/ではない/g, 'じゃない').replace(/(?<=[ぁ-ん])のだ(?=[。、！？!?…‥」よね]|$)/g, 'んだ')
      .replace(/^([…‥]*)そうか。/, '$1そう、').replace(/^([…‥]*)そうか$/, '$1そっか').replace(/する必要がある/g, 'したほうがいい').replace(/必要がある/g, 'ほうがいい');
    q = bySent(q, function (s, tl, pun, last) {
      var ask = /[？?]/.test(pun);
      s = s.replace(/だぜ$/, 'だよ').replace(/(?<=[ぁ-ん])ぜ$/, 'よ').replace(/(?<!どう)ぞ$/, 'よ').replace(/(?<![まやだ])だな$/, 'だね').replace(/よな$/, 'よね').replace(/からな$/, 'からね').replace(/(?<=[いた])(?<!みたい)な$/, 'ね')
        .replace(/しろ(?:よ)?$/, 'して').replace(IMP_RE, function (m, v) { return IMP[v]; }).replace(/(?<=[ぁ-ん一-鿿])([えけげせてねべめれ])ろ(?:よ)?$/, '$1て').replace(/(?<=[ぁ-ん一-鿿])([てで])くれ$/, '$1').replace(NEG_RE, function (m, v) { return NEG[v]; });
      if (ask) {
        var s0 = s;
        s = s.replace(/だろうか$/, 'かな').replace(/だろ(?:う)?$/, 'でしょ').replace(/なのか$/, 'なの').replace(/(?<=[るたいう])のか$/, 'の').replace(/(?<=[るたうく]|ない|いい)か$/, '');
        /* 素の問いかけは、ときどき「〜の？」に（「何したい？」→「何したいの？」） */
        if (s === s0 && last && !tl && /(?:[るたう]|ない|いい|たい)$/.test(s) && !lot(s, 3)) s += 'の';
        return s + tl + pun;
      }
      s = s.replace(/だろう?$/, 'だろうね').replace(/じゃん$/, 'じゃない');
      if (!last || tl) return s + tl + pun;
      if (/(?:[るたい]|ない)の$/.test(s) && !/(?:もの|その|この|あの|どの)$/.test(s)) return s.replace(/の$/, 'んだ') + tl + pun;
      if (/かも$/.test(s)) return s + 'ね' + tl + pun;
      if (/(?:よ|ね|さ|か|の|って|けど|し|わ|な|じゃん|ば|て|で|ら|もん|から)$/.test(s)) return s + tl + pun;
      if (/(?<![まやだ]|ん|の)だ$/.test(s) && s.length > 2) return (lot(s, 2) ? s.replace(/だ$/, 'だね') : /[一-鿿ァ-ヶー々]だ$/.test(s) ? s.replace(/だ$/, '') : s) + tl + pun;
      if (/んだ$/.test(s)) return (lot(s, 2) ? s + 'よ' : s) + tl + pun;
      if (/と思う$/.test(s)) return (lot(s, 3) ? s : s + 'よ') + tl + pun;
      if (/(?:[るうくすつむぶぐ]|た|い)$/.test(s) && s.length > 2) return (lot(s, 6) ? s : s + (lot(s + 'y', 2) ? 'よ' : 'ね')) + tl + pun;
      if (/[一-鿿ァ-ヶー々]$/.test(s) && s.length > 1) return (lot(s, 5) ? s : s + 'だね') + tl + pun;
      return s + tl + pun;
    });
    /* 「……」は半分に（一つ目・三つ目…を残す。台詞の頭の一つ目は二回に一回だけ残す） */
    return dots(q, function (k, head) { return k % 2 === 1 && !(k === 1 && head && lot(q, 2)); });
  }
  /* ---------- けだるげ（軽） ---------- */
  function daruiLite(q) {
    if (!q) return q;
    return dots(q, function (k) { return k === 1; });
  }
  /* ---------- 中性的（僕） ---------- */
  function boku(q, who, ctx) {
    var g = HK.TONE_FINISH && HK.TONE_FINISH.gentle_n;
    if (g) q = g(q, who, ctx);
    if (!q || MOAN.test(q) || (ctx && ctx.kg)) return q;
    return bySent(q, function (s, tl, pun, last) {
      var ask = /[？?]/.test(pun);
      if (!last) return s + tl + pun;
      if (ask) {
        if (/(?:かな|かい|だい|か|です|ます)$/.test(s) || lot(s, 4)) return s + tl + pun;
        if (/(?<=[るたい])の$/.test(s)) return s.replace(/の$/, 'のかな') + tl + pun;
        if (/(?:[るたうく]|ない|いい)$/.test(s) || /[一-鿿ァ-ヶー々]$/.test(s)) return s + 'かな' + tl + pun;
        return s + tl + pun;
      }
      if (tl && /[…‥]/.test(tl)) return s + tl + pun;
      /* 「〜じゃん」は「〜じゃないか」、言い切りの「〜の」は「〜んだ」、「〜かも」は「〜かもね」、「ありがと」は「ありがとう」 */
      if (/じゃん$/.test(s)) return s.replace(/じゃん$/, 'じゃないか') + tl + pun;
      if (/でしょ$/.test(s)) return s.replace(/でしょ$/, /[一-鿿ァ-ヶー々]でしょ$/.test(s) ? 'だよね' : 'よね') + tl + pun;
      if (/(?:[るたい]|ない)の$/.test(s) && !/(?:もの|その|この|あの|どの)$/.test(s)) return s.replace(/の$/, 'んだ') + tl + pun;
      if (/かも$/.test(s)) return s + 'ね' + tl + pun;
      if (/(?:^|[、。…‥\s])ありがと$/.test(s)) return s + 'う' + tl + pun;
      if (/だよ$/.test(s)) return (lot(s, 2) ? s.replace(/よ$/, 'ね') : s) + tl + pun;
      if (/(?:よ|ね|な|さ|か|の|って|けど|し|から|て|で|ば|ら|もん|です|ます)$/.test(s)) return s + tl + pun;
      if (/だと思う$/.test(s)) return (lot(s, 2) ? s.replace(/だと思う$/, 'なんじゃないかな') : s + 'な') + tl + pun;
      if (/と思う$/.test(s)) return (lot(s, 2) ? s.replace(/と思う$/, 'んじゃないかな') : s + 'よ') + tl + pun;
      if (/だろう$/.test(s)) return s + 'ね' + tl + pun;
      if (/(?<![まやだ]|ん)だ$/.test(s) && s.length > 2) return s + (lot(s, 2) ? 'ね' : 'よ') + tl + pun;
      if (/(?:[るうくすつむぶぐ]|た|い)$/.test(s) && s.length > 2) return (lot(s, 6) ? s : s + (lot(s + 'b', 2) ? 'ね' : 'よ')) + tl + pun;
      if (/[一-鿿ァ-ヶー々]$/.test(s) && s.length > 1) return (lot(s, 6) ? s : s + (lot(s + 'n', 3) ? 'かな' : 'だね')) + tl + pun;
      return s + tl + pun;
    });
  }
  /* ---------- 神の命令口調 ---------- */
  /* 「〜たまえ」の動詞（連用形）を命令形に：一段は「〜よ」、五段は え段 */
  var ICHI = /(?:起き|生き|落ち|信じ|感じ|借り|降り|浴び|尽き|飽き|過ぎ|閉じ|恥じ|応じ|案じ|伸び|延び|満ち|老い|悔い|居|見|寝|出|着|似|煮|射|得|経)$/;
  var I2E = { 'い': 'え', 'き': 'け', 'ぎ': 'げ', 'し': 'せ', 'ち': 'て', 'に': 'ね', 'び': 'べ', 'み': 'め', 'り': 'れ' };
  function tamae(q) {
    return q.replace(/([てで])いたまえ(?:よ)?/g, '$1おれ').replace(/([てで])くれたまえ(?:よ)?/g, '$1くれ').replace(/([てで])みたまえ(?:よ)?/g, '$1みよ')
      .replace(/(話|離|返|渡|探|隠|許|示|残|消|貸|押|出|指|刺|倒|直|治|戻|写|移|回|下ろ|落と|動か|鳴ら|濡ら|揺ら|晒|試|乾か|生か|逃が|外|放|伸ば|飛ば|見逃|見せびらか)したまえ(?:よ)?/g, '$1せ')
      .replace(/(^|[^ぁ-ん]|[をにがはもとへ])したまえ(?:よ)?/g, '$1せよ').replace(/来たまえ(?:よ)?/g, '来い')
      .replace(/([ぁ-ん一-鿿々]+?)たまえ(?:よ)?/g, function (m, st) {
        if (ICHI.test(st) || /[えけげせてねべめれ]$/.test(st) || /[一-鿿々]$/.test(st)) return st + 'よ';
        /* 「早くしたまえ」のような、かなのあとの「し」は「する」（五段の「〜す」は上の表で先に直す） */
        if (/し$/.test(st)) return st.slice(0, -1) + 'せよ';
        var e = I2E[st.slice(-1)];
        return e ? st.slice(0, -1) + e : st + 'よ';
      });
  }
  var NAI_NG = /(?:じゃ|では|危|少|汚|切|幼|情け|せわし|はかな|ぎこち|味気|つまんな|しょうが|仕方が|しかた|間違い|違い|もったい|勿体|足り)ない$/;
  function god(q, who, ctx) {
    if (V.sondaiQuote) q = V.sondaiQuote(q);
    if (!q || MOAN.test(q)) return q;
    var fp = V.fpFor ? V.fpFor(who) : '我';
    q = tamae(q);
    q = q.replace(/(?:君|きみ|あなた)(?:たち|達|がた|方)/g, '汝ら').replace(/のかね(?=[？?。…‥」]|$)/g, 'のか').replace(/かね(?=[？?。…‥」]|$)/g, 'か')
      .replace(/(?<![であ])だろう/g, 'であろう').replace(/(な?)のだがね/g, '$1のだがな').replace(/(?<=[ぁ-ん一-鿿])だね(?=[。！!]?$)/, 'だな')
      .replace(/すまない/g, 'すまぬ').replace(/^ありがとう(?:ございます)?(?=[。！!]|$)/, '大儀であった').replace(/^ほう、?ありがとう/, 'ほう、大儀であった').replace(/いいだろう/g, 'よかろう');
    if (fp === '我') q = q.replace(/我(?:たち|達)/g, '我ら');
    return bySent(q, function (s, tl, pun, last) {
      var ask = /[？?]/.test(pun);
      if (ask || !last || tl) return s + tl + pun;
      if (/[てで]いろ$/.test(s)) return s.replace(/いろ$/, 'おれ') + tl + pun;
      if (/(?:いない|居ない)$/.test(s)) return s.replace(/(?:いない|居ない)$/, 'おらぬ') + tl + pun;
      if (/しない$/.test(s)) return s.replace(/しない$/, 'せぬ') + tl + pun;
      if (/[らかたまさわがばなけれせめべてげじちみびにひきりえ]ない$/.test(s) && !NAI_NG.test(s) && !lot(s, 5)) return s.replace(/ない$/, 'ぬ') + tl + pun;
      if (/てやる$/.test(s)) return s.replace(/てやる$/, 'てやろう') + tl + pun;
      if (/(?<![まやだ]|ん|の)だ$/.test(s) && /[一-鿿ァ-ヶー々]だ$/.test(s) && !lot(s, 5)) return s.replace(/だ$/, 'である') + tl + pun;
      if (/(?:[るうくすつむぶぐ])$/.test(s) && s.length > 2 && !lot(s, 3)) return s + 'ぞ' + tl + pun;
      return s + tl + pun;
    });
  }
  /* 言い換えの元になる口調の話し方：けだるげ（軽）はけだるげ、神は古風な紳士（尊大と同じ） */
  var sq0 = V.styleQuote;
  V.styleQuote = function (q, who) {
    if (!who) return sq0(q, who);
    if (who.tone === 'darui_lite') { var r = sq0(q, who); return V.toneConv2 && V.toneConv2.darui ? V.toneConv2.darui(r) : r; }
    if (who.tone === 'god') return sq0(q, Object.assign({}, who, { tone: 'gentleman' }));
    return sq0(q, who);
  };
  HK.toneFinish('cool_soft', coolSoft);
  HK.toneFinish('darui_lite', function (q) { return daruiLite(q); });
  HK.toneFinish('boku_n', boku);
  HK.toneFinish('god', god);
  V.newToneFinish2 = { cool_soft: coolSoft, darui_lite: daruiLite, boku_n: boku, god: god };

  /* ---------- 住人ごとの語尾の付け替え（toneCustom） ----------
     設定は「です→っす、だ→だぜ」のような文字列（区切りは読点・カンマ・改行。矢印は → > = のどれでも）。5つまで。
     文の終わり（。！？…、」の前か台詞の終わり）にある語尾だけを付け替える。喘ぎ（♡）の台詞はそのまま */
  var TC_MAX = 5;
  /* 2026-10-25：細かい制御（っす→っすか？ など）が難しく、思ったとおりに動かないため、画面から外して効果も止めた（オミット）。
     コードと保存の値（JSON の toneCustom）は残す。戻すときは false にして、ui-gear.js の欄を出す */
  HK.TONE_CUSTOM_OFF = true;
  V.toneCustomRows = function (v) {
    var out = [];
    String(v || '').split(/[、,，\n]+/).forEach(function (row) {
      if (out.length >= TC_MAX) return;
      var m = row.replace(/[「」『』{}]/g, '').match(/^\s*([^→>＞=＝\s]{1,8})\s*(?:→|->|＞|>|=|＝)\s*([^→>＞=＝\s]{0,10})\s*$/);
      if (m && m[1] !== m[2]) out.push([m[1], m[2]]);
    });
    return out;
  };
  /* 保存用に整える（読めない行は捨てる） */
  HK.normToneCustom = function (v) { return V.toneCustomRows(v).map(function (r) { return r[0] + '→' + r[1]; }).join('、'); };
  function esc(s) { return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }
  V.applyToneCustom = function (q, v) {
    var rows = V.toneCustomRows(v);
    if (!q || !rows.length || /♡/.test(q)) return q;
    var map = {};
    rows.forEach(function (r) { if (map[r[0]] == null) map[r[0]] = r[1]; });
    var keys = Object.keys(map).sort(function (a, b) { return b.length - a.length; });
    var re = new RegExp('(' + keys.map(esc).join('|') + ')(?=[。！？!?…‥、」〜ー]|$)', 'g');
    return q.replace(re, function (m) { return map[m]; });
  };
})();
