/* 箱庭シミュレーター: 奔放から派生する口調（熱血）
   文面と台詞の言い換えは「奔放」をそのまま使い、できあがった台詞の言い回しと語尾を、最後に付け替える（名前・一人称・見本・派生元は tone-registry.js）。
   ・熱血 … まっすぐで暑苦しい主人公。「〜だぜ！」「任せとけ！」「行こうぜ！」「ありがとな！」「よっしゃ！」「〜だろ？」「〜じゃねえか！」
   男女とも同じ話し方（奔放の「〜だよ」「〜ね」「〜の」「〜わ」は「〜だぜ」「〜な」「〜んだ」に）。
   言い足す「ぜ」は叫び（！）の文と台詞の最後の文だけ、しかも間引く（毎文「ぜ」だとくどい）。喘ぎ・つぶやき（……）・敬語の文はそのまま */
(function () {
  'use strict';
  var HK = window.HK, V = HK && HK.Voice;
  if (!V || !HK.toneFinish) return;

  var E = '(?=[。！？!?…‥、」\\n]|$)';
  function re(s, f) { return new RegExp(s + E, f || 'g'); }
  var MOAN = /[っッぁぃぅぇぉ♡]/;
  /* 敬語の文（触らない） */
  var POLITE = /(?:です|ます|ました|ません|でした|ましょう|ください|ございま|でしょう|なさい|いたし|致し|申し|いただ|頂|さしあげ|差し上げ|参り|参る|存じ|おっしゃ|いらっしゃ)/;
  /* 動詞・形容詞・「た」「ない」の言い切り（「ぜ」を足してよい終わり方） */
  var PLAIN = /(?:[るすむぐぶ]|(?<![一二三四五六七八九十幾いさ])つ|(?<![しかた]|なんとな|ようや|おそら|しばら|まった|な|全|早|遅|強|弱|多|軽|深|長|短|近|遠|よ|ぼ|ぶ|び)く|(?<![おこそとのほもよろごぞどぼぽょ])う|(?<!ちょうだ|なさ|くださ|^は|^お|^ね|^ほ|願|違|遣|合|伝|会|払|迷|戦|争|使|扱|祝|誘|呪|占|酔|匂|類|お互|そろ|揃|みた|きれ|嫌|きら|せ|ぐら|くら|おしま|あいま|曖昧|愉快|ぱ)い|た)$/;
  /* 意志・勧誘（行こう・しよう・やろう） */
  var VOL = /(?:(?<=[一-鿿])(?:[こごとぼ]う|(?<=[話探渡返出起戻逃残回消隠直通落許指押流離貸倒試])そう)|(?<=[一-鿿]|し|飲|読|楽し|込)もう|(?<=[一-鿿]|[やが張帰])ろう|(?<=[えけげせぜてでねべめれ見寝着出来]|^し|[^うこそ]し)よう)$/;
  var VOL_NG = /(?:向こう|だろう|どうしよう|こうしよう|そうしよう|ありがとう|おめでとう)$/;
  function vol(s) { return VOL.test(s) && !VOL_NG.test(s); }
  var WH = /(?:何|(?<![あこそど])なに|(?<![あこそど])なん(?!か|て|だか|とか)|誰|だれ|どこ|いつ|なぜ|どうして|どんな|どっち|どれ|どう|いくつ|いくら|どの)/;
  function wh(s) { return WH.test(s.replace(/(?:何|なに|なん|誰|だれ|どこ|いつ|どう)(?:にでも|でも|も|か|とか|度|ぞ|だか)/g, '')); }

  /* 言い回し（台詞全体）。喘ぎの台詞では使わない */
  function phrase(q) {
    return q
      /* 女性的な語尾を外す */
      .replace(re('かしら'), 'かな').replace(re('(?<!ん)のよ'), 'んだ').replace(re('だわ'), 'だ').replace(re('([たいるうくすつむぬぐぶ])わね'), '$1な').replace(re('([たいるうくすつむぬぐぶ])わよ'), '$1ぜ')
      .replace(/([てで]、?|^|[、。…‥\s]|に)ちょうだい(?=[。！？!?…‥」]|$)/g, function (m, p) { return (p === 'に' ? 'に' : p) + 'くれ'; })
      .replace(/([てで])なさいよ(?=[！!])/g, '$1ろよ').replace(/([てで])なさい(?=[。！？!?…‥」]|$)/g, '$1ろ')
      /* 礼・詫び・任せろ */
      .replace(/ありがと(?:う)?(?=[、。！!…‥」\s　]|$)/g, 'ありがとな')
      .replace(/(^|[、。…‥！!\s])ごめんね(?=[、。！!…‥」]|$)/g, '$1ごめんな').replace(/(^|[、。…‥\s])(?:任せて|まかせて)(?=[！!])/g, '$1任せとけ').replace(/任せたからね/g, '任せたからな')
      /* 喜び・驚き（その一言だけの台詞） */
      .replace(/^(?:やった|やったあ|やったー|やったぁ)(?:ー|〜|～)*[！!]*$/, 'よっしゃ！').replace(/^(?:やった|やったあ|やったー|やったぁ)[ー〜～]*[！!]+(?=.)/, 'よっしゃ！')
      .replace(/^え[えー〜～]+っ?[！!？?]*$/, 'なんだって！？');
  }

  /* 一文の語尾。ask: 問い、shout: 叫び（！）、last: 台詞の最後の文、add: 「ぜ」を言い足してよいか */
  function heroOne(s, ask, shout, last, add) {
    var m;
    if (POLITE.test(s)) return s;
    if (ask) {
      if (/でしょ$/.test(s)) return s.replace(/でしょ$/, 'だろ');
      if (/だよ[ねな]$/.test(s)) return s.replace(/だよ[ねな]$/, 'だよな');
      if (/よね$/.test(s)) return s.replace(/よね$/, 'よな');
      /* 「何してるの？」→「何してるんだ？」、「帰るの？」→「帰るのか？」、「普通なの？」→「普通なのか？」（「いつもの？」はそのまま） */
      if (/(?:[るたいうくすつむぐぶ]|てる|なの)の$/.test(s) || /なの$/.test(s)) {
        if (wh(s)) return s.replace(/なの$/, 'なんだ').replace(/([^な])の$/, '$1んだ');
        return s + 'か';
      }
      if (wh(s)) return s;
      /* 「どいてくれる？」→「どいてくれるか？」、「入っていい？」→「入っていいか？」 */
      if (/(?:くれる|もらえる|くれない|もらえない|[てでも]いい|いける|できる|わかる|分かる|行ける|平気)$/.test(s)) return s + 'か';
      return s;
    }
    /* 「〜てね」の頼み →「〜てくれよ」 */
    if (/[てで]ね$/.test(s) && s.length >= 3) return s.replace(/ね$/, 'くれよ');
    if (/でしょ$/.test(s)) return s.replace(/でしょ$/, 'だろ');
    if (/(?:だろう|だろ)$/.test(s)) return s;
    /* 「じゃん」→「じゃねえか」は叫びだけ（ほかは「だろ」の念押し） */
    if (/じゃん$/.test(s)) return shout || last && HK.lineLot(s, 2) ? s.replace(/じゃん$/, 'じゃねえか') : s.replace(/じゃん$/, 'じゃないか');
    if (/だよ[ねな]$/.test(s)) return s.replace(/だよ[ねな]$/, 'だよな');
    if (/よね$/.test(s)) return s.replace(/よね$/, 'よな');
    /* 「邪魔なの」「急いでるの」→「〜なんだ」「〜んだ」（女性的な「の」） */
    if (/なの$/.test(s) && s.length >= 3) return s.replace(/なの$/, 'なんだ');
    if (/(?:[るたいう]|てる)の$/.test(s) && !/(?:もの|その|この|あの|どの|じゃないの)$/.test(s)) return s.replace(/の$/, 'んだ');
    /* 「わ」：「目、覚めたわ」→「目、覚めたぜ」 */
    if (/([たいるうくすつむぬぐぶ])わ$/.test(s) && s.length >= 3) return s.replace(/わ$/, last || shout ? 'ぜ' : '');
    /* 念押し・約束の「ね」（「〜からね」「頑張ろうね」）→「な」「ぜ」 */
    if (/(?:また|じゃ|じゃあ)ね$/.test(s)) return s.replace(/ね$/, 'な');
    if (/ね$/.test(s) && vol(s.slice(0, -1))) return s.replace(/ね$/, 'ぜ');
    /* 動詞＋ね（「大事にするね」「交互にいくね」）は「ぜ」（「な」だと禁止に読める）。「〜てるね」は「〜てるな」 */
    if (/(?:[うくすつぬむぐぶ]|(?<!て)る)ね$/.test(s) && !/(?:でしょう|ましょう)ね$/.test(s) && s.length >= 3) return s.replace(/ね$/, 'ぜ');
    if ((m = s.match(/^(.*[一-鿿ァ-ヶーａ-ｚＡ-Ｚa-zA-Z0-9０-９々])ね$/)) && s.length >= 3) return m[1] + 'だな';
    if (/のね$/.test(s)) return s.replace(/のね$/, 'んだな');
    if (/だね$/.test(s)) return s.replace(/だね$/, 'だな');
    if (/(?<![まじ])ね$/.test(s) && s.length >= 3) return s.replace(/ね$/, 'な');
    /* 「〜だよ」→「〜だぜ」、「いいよ」→「いいぜ」。叫びと最後の文だけ（ほかは「〜だ」「〜よ」のまま） */
    if (/(?:ん|の)だよ$/.test(s)) return shout || last ? s.replace(/(?:の)?だよ$/, 'だぜ').replace(/^(.*[^ん])だぜ$/, function (x, a) { return /[一-鿿ァ-ヶー]$/.test(a) ? x : a + 'んだぜ'; }) : s.replace(/(?:の)?だよ$/, 'だ').replace(/^(.*[^ん])だ$/, function (x, a) { return /[一-鿿ァ-ヶー]$/.test(a) ? x : a + 'んだ'; });
    if (/だよ$/.test(s) && s.length >= 3) return shout || last ? s.replace(/だよ$/, 'だぜ') : s.replace(/だよ$/, 'だ');
    if (/(?:いい|ない|た|る|う|す|く|つ|む|ぶ|ぐ)よ$/.test(s) && s.length >= 3 && !/(?:どうぞ|ぞ)よ$/.test(s)) return shout || last ? s.replace(/よ$/, 'ぜ') : s;
    /* 「名詞＋よ」（「大丈夫よ」）→「大丈夫だ」 */
    if (/[一-鿿ァ-ヶー]よ$/.test(s) && s.length >= 3) return s.replace(/よ$/, shout || last ? 'だぜ' : 'だ');
    if (/[ぞぜなさ]$/.test(s)) return s;
    if (!add) return s;
    /* ここから先は語尾を言い足すだけ。叫びと最後の文だけ、短い一言はそのまま */
    var core = s.replace(/^[…‥、\s]+/, '');
    if (core.length <= 3) return s;
    /* 「行こう！」「しよう！」→「〜ぜ！」 */
    if (vol(s)) return s + 'ぜ';
    /* 「良好だ！」→ 三回に一回「良好だぜ！」 */
    if (/(?<![まやだ]|あい|ん)だ$/.test(s) && core.length >= 4) return HK.lineLot(s, 3) ? s + 'ぜ' : s;
    if (/[一-鿿]んだ$/.test(s)) return s;
    if (/(?:ん|の)だ$/.test(s)) return HK.lineLot(s, 2) ? s.replace(/[んの]だ$/, 'んだぜ') : s;
    if (core.length < 5 || !PLAIN.test(s) || /(?:じゃない|たい|ちゃう|ちゃった|ている|ていた)$/.test(s)) return s;
    /* 叫びでない文の否定（「許せなかった」「向かない」）には言い足さない */
    if (!shout && /(?:ない|なかった)$/.test(s)) return s;
    return HK.lineLot(s, shout ? 2 : 3) ? s + 'ぜ' : s;
  }

  function hero(q, who) {
    /* 喘ぎの台詞はそのまま */
    if (/(?:[ぁぃぅぇぉ♡]|っ[…‥、！!？?]|[…‥、]っ|っ$)/.test(q)) return q;
    var moanQ = false;
    q = phrase(q);
    var parts = q.split(/([。！？!?…‥」\n]+)/), lastI = -1;
    parts.forEach(function (seg, i) { if (!(i % 2) && /[^\s、…‥]/.test(seg)) lastI = i; });
    return parts.map(function (seg, i) {
      if (i % 2) return seg;
      var next = parts[i + 1] || '', prev = parts[i - 1] || '';
      /* 喘ぎ・叫び声（っ・ぁ・♡・伸ばし）の文はそのまま */
      if (MOAN.test(seg.slice(-1)) || /[ー〜～]$/.test(seg)) return seg;
      var lead = (seg.match(/^[…‥、\s　]+/) || [''])[0], tail = (seg.match(/[、]+$/) || [''])[0];
      var body = seg.slice(lead.length, seg.length - tail.length);
      if (!body) return seg;
      var ask = /[？?]/.test(next), shout = /[！!]/.test(next) && !ask;
      /* 「……」で消えていく文・つぶやき（……で始まる台詞）には言い足さない */
      var trail = /^[…‥]/.test(next) || /[…‥]$/.test(prev) || /^[…‥]/.test(lead);
      var add = !moanQ && !trail && (shout || i === lastI && !/[…‥]/.test(q.slice(0, 2)));
      return lead + heroOne(body, ask, shout, i === lastI || shout, add) + tail;
    }).join('').replace(/ぜぜ/g, 'ぜ').replace(/だだ(?=[ぜよな。！？!?…‥、」]|$)/g, 'だ');
  }
  V.heroQuote = hero;
  HK.toneFinish('hero', hero);
})();
