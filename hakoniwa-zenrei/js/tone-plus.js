/* 箱庭シミュレーター: 口調の追加と、呼び方（呼称）
   口調は「台詞の話し方」と「その口調の人らしい文面」を決めるだけで、行動の判断はエゴグラムの数値だけで決まる。
   追加の口調は、文面の表（口調ごとの台詞・反応）を近い口調から借り、台詞を話し方に合わせて整える。
   ・穏やか（中性的）／意地っ張り（中性的）… 女性的な語尾を外す
   ・冷静（落ち着き）… 冷静の文面から、分析・計算めいた言い回しを外す
   ・健気（くだけた）… 敬語をくだけた言い方に
   ・頼れる兄貴・姉貴分 … 面倒見のいい、さっぱりした言い方（おまかせのとき、CPとNPが両方高い人）
   ・関西弁（軽め）… 語尾と一部の言葉だけを関西弁に。文面の表はエゴグラムから決まる口調のもの
   呼称：住人ごとの基本の呼び方（呼び捨て・さん付けなど）と、相手ごとの呼び方を、台詞の中の名前に反映する */
(function () {
  'use strict';
  var HK = window.HK, V = HK.Voice;
  if (!HK.PERSONA || !V) return;

  HK.TONE_EXTRA = {
    aniki: { label: '頼れる兄貴・姉貴分', desc: 'CP・NP高。面倒見がよく、さっぱりした物言い／兄貴肌・姉御肌', base: 'proud', top: 'NP', fp: { m: '俺', f: 'あたし', x: '俺' } },
    tsun_n: { label: '意地っ張り（中性的）', desc: '意地っ張りの、語尾が中性的な話し方', base: 'tsun', top: 'CP', neutral: true, fp: { m: '俺', f: '私', x: '僕' } },
    gentle_n: { label: '穏やか（中性的）', desc: '穏やかの、語尾が中性的な話し方', base: 'gentle', top: 'NP', neutral: true, fp: { m: '僕', f: '私', x: '僕' } },
    devoted_p: { label: '健気（くだけた）', desc: '健気の、敬語を使わない話し方', base: 'devoted', top: 'AC', plain: true },
    calm: { label: '冷静（落ち着き）', desc: '動じない、落ち着いた話し方。分析や計算はしない', base: 'cool', top: 'A', calm: true, fp: { m: '俺', f: '私', x: '私' } },
    kansai: { label: '関西弁（軽め）', desc: '語尾がやわらかい関西弁。態度はエゴグラムから決まる', base: null, top: null, kansai: true, fp: { m: '俺', f: 'うち', x: 'うち' } }
  };
  var EX = HK.TONE_EXTRA;
  /* 選択欄の並び */
  HK.TONE_KEYS = ['proud', 'aniki', 'stern', 'tsun', 'tsun_n', 'gentle', 'gentle_n', 'devoted', 'devoted_p', 'cool', 'calm', 'free', 'shy', 'polite', 'kansai'].filter(function (k) { return HK.PERSONA[k] || EX[k]; });
  HK.toneValid = function (k) { return !!(k && (HK.PERSONA[k] || EX[k])); };
  HK.toneInfo = function (k) { return HK.PERSONA[k] || EX[k] || null; };
  function trOf(c) { return (c && c.tr) || HK.traits((c && c.eg) || { CP: 10, NP: 10, A: 10, FC: 10, AC: 10 }); }
  /* おまかせの口調：CPとNPが両方高ければ兄貴・姉貴分、それ以外はエゴグラムでいちばん合う口調 */
  HK.toneAuto = function (tr) {
    if (tr.cp >= 0.6 && tr.np >= 0.6 && Math.abs(tr.cp - tr.np) < 0.25) return 'aniki';
    return HK.personaAuto(tr);
  };
  HK.toneOf = function (c) { return c && HK.toneValid(c.tone) ? c.tone : HK.toneAuto(trOf(c)); };
  HK.toneLabel = function (c) { var t = HK.toneOf(c); return (HK.toneInfo(t) || HK.PERSONA.gentle).label; };
  /* 文面の表を引く口調（8つ＋敬語のどれか） */
  HK.personaOf = function (c) {
    var t = HK.toneOf(c);
    if (HK.PERSONA[t]) return t;
    return (EX[t] && EX[t].base) || HK.personaAuto(trOf(c));
  };
  var vt0 = HK.voiceTop;
  HK.voiceTop = function (c) {
    var t = c && c.tone, ex = EX[t];
    if (ex) return ex.top || HK.egoType((c && c.eg) || { CP: 10, NP: 10, A: 10, FC: 10, AC: 10 }).top;
    return vt0(c);
  };
  var vw0 = HK.voiceTopWhy;
  HK.voiceTopWhy = function (c) { return c && EX[c.tone] ? '口調「' + EX[c.tone].label + '」' : vw0(c); };

  /* ---------- 一人称 ---------- */
  var fp0 = V.fpDefault;
  V.fpDefault = function (c) {
    var ex = c && EX[c.tone];
    if (ex && ex.fp) { var g = c.gender === 'm' || c.gender === 'f' ? c.gender : 'x'; return ex.fp[g]; }
    return fp0(c);
  };

  /* ---------- 話し方の整形 ---------- */
  function endRe(s) { return new RegExp(s + '(?=[。！？!?…、」]|$)', 'g'); }
  function neutral(q) {
    return q.replace(/あらあら/g, 'おやおや').replace(/あら(?=[、…])/g, 'おや').replace(endRe('かしら'), 'かな').replace(endRe('ですわ'), 'です').replace(endRe('(だ|た|い)わよ'), '$1よ').replace(endRe('([るうくすつぬむぐぶ])わよ'), '$1よ').replace(endRe('([るうくすつぬむぐぶ])わね'), '$1ね').replace(endRe('(だ|た|い)わね'), '$1ね')
      .replace(endRe('のよ'), 'んだ').replace(endRe('なのね'), 'なんだね').replace(endRe('だわ'), 'だ').replace(endRe('([いたくうすつぬむるよ])わ'), '$1').replace(endRe('よね'), 'よね').replace(endRe('ちょうだい'), 'くれる？');
  }
  var KANSAI = [
    [/本当に/g, 'ほんまに'], [/本当/g, 'ほんま'], [/ほんとに/g, 'ほんまに'], [/とても|すごく/g, 'めっちゃ'],
    [/だ、(?=だめ|ダメ|駄目)/g, 'あ、'], [/(?:駄目|ダメ|だめ)、(?=だめ|ダメ)/g, 'あかん、'], [/(?:駄目|ダメ|だめ)だ(?=[。！？!?…、」]|$)/g, 'あかん'], [/(?:駄目|ダメ|だめ)(?:なんだ|なの)(?=[。！？!?…、」]|$)/g, 'あかんねん'], [/(?:駄目|ダメ|だめ)、?ぇ/g, 'あかぁん'], [/駄目|ダメ|だめ/g, 'あかん'], [/あかん(、)?です/g, 'あきません'], [/あかん([…‥っ]+)です[…‥]*/g, 'あかん$1'], [/分からない/g, '分からへん'], [/わからない/g, 'わからへん'], [/知らない/g, '知らん'], [/いらない/g, 'いらん'],
    [/できない/g, 'できへん'], [/行かない/g, '行かへん'], [/言わない/g, '言わへん'], [/構わない/g, 'かまへん'], [/しない(?=[。！？…、」よでのかぞ]|$)/g, 'せえへん'],
    [/じゃないか/g, 'やないか'], [/じゃない(?=[？?])/g, 'ちゃう'], [/じゃん/g, 'やん'], [/違う(?=[。！？…、」よのか]|$)/g, 'ちゃう'],
    [/だよね/g, 'やんな'], [/だよな/g, 'やんな'], [/だよ/g, 'やで'], [/だぞ(?=[。！？!?…、」]|$)/g, 'やで'], [/だね/g, 'やな'], [/だな(?=[。！？…、」]|$)/g, 'やな'],
    [/だろう?/g, 'やろ'], [/でしょう?(?=[。！？…、」]|$)/g, 'やろ'], [/だから/g, 'やから'], [/だけど/g, 'やけど'], [/だった/g, 'やった'], [/だって/g, 'やって'],
    [/んじゃない(?=[。！…、」]|$)/g, 'んやない'], [/じゃない(?=[。！…、」]|$)/g, 'やない'], [/じゃない(?=、)/g, 'やない'],
    [/(見|来|こ)ないで(?=くれ|[。！？…、」っ]|$)/g, '$1んといて'], [/しないで(?=くれ|[。！？…、」っ]|$)/g, 'せんといて'], [/([かさたなまらわがば])ないで(?=くれ|[。！？…、」っ]|$)/g, '$1んといて'],
    [/(?<!い)や、やだ/g, 'い、いやや'], [/(?<!い)やだ/g, 'いやや'],
    [/([こそあど])んなの/g, '$1んなん'], [/なに、これ/g, 'なんや、これ'], [/(出|き|来|イっ)ちゃ(?=う|っ|…|、|$)/g, '$1てま'],
    [/よね(?=[。！？…、」]|$)/g, 'よな'], [/あかんやで/g, 'あかんで'], [/あなた(?=[はがもをにとのって、。！？…」])/g, 'あんた']
  ];
  /* 関西弁の敬語：標準語のです・ますを、やわらかい関西の丁寧語に（「〜まへん」「〜ですわ」「〜ですやろ」）。
     全部の文を同じ語尾にしないよう、文ごとに台詞の中身で言い方を変える */
  var KEND = '(?=[。！？!?…、」♡〜ー]|$)';
  function kre(s) { return new RegExp(s + KEND, 'g'); }
  function khash(s) { var h = 7; for (var i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) % 100003; return h; }
  function kansaiKeigo(q) {
    if (!/(です|ます|ません|でしょう|ました|でした|ください)/.test(q)) return q;
    var n = 0, h = khash(q);
    function alt(a, b) { n++; return (h + n) % 3 ? a : b; }
    return q.replace(/じゃないですか/g, 'やないですか').replace(/じゃありません/g, 'やあらしません')
      .replace(kre('ませんよ'), 'まへんで').replace(kre('ませんね'), 'まへんなあ').replace(kre('ませんか'), 'まへんか').replace(kre('ません'), 'まへん')
      .replace(kre('でしょう(?:か)?'), 'ですやろ').replace(kre('ですよね'), 'ですやんな').replace(kre('ですよ'), function () { return alt('ですわ', 'ですで'); })
      .replace(kre('ですね'), 'ですなあ').replace(kre('ますね'), 'ますなあ')
      .replace(kre('ますよ'), function () { return alt('ますわ', 'ますで'); }).replace(kre('んです'), 'んですわ')
      .replace(/ました(?=[。！!…」]|$)/g, function () { return alt('ましたわ', 'ましたで'); })
      .replace(/でした(?=[。！!…」]|$)/g, function () { return alt('でしたわ', 'でしてん'); })
      .replace(/てください(?=[。！!…」]|$)/g, function () { return alt('ておくれやす', 'てください'); })
      .replace(/([^とけで、])です(?=[。！!…」]|$)/g, function (m, c) { return c + alt('ですわ', 'ですねん'); }).replace(/、です(?=[。！!…」]|$)/g, '、ですわ')
      .replace(/([^しいき])ます(?=[。！!…」]|$)/g, function (m, c) { return c + alt('ますわ', 'ますねん'); }).replace(/([しいき])ます(?=[。！!…」]|$)/g, '$1ますわ');
  }
  function kansai(q) {
    q = kansaiKeigo(q);
    q = q.replace(/(?:わよ|のよ)(?=[。！？!?…、」]|$)/g, 'で').replace(/(だ|た)わね(?=[。！？!?…、」]|$)/g, '$1なあ').replace(/(?:ないわね|ないわねえ)(?=[。！？!?…、」]|$)/g, 'へんなあ').replace(/わね(?=[。！？!?…、」]|$)/g, 'なあ');
    KANSAI.forEach(function (r) { q = q.replace(r[0], r[1]); });
    /* 言い切りの「だ」→「や」（まだ・ただ などは除く） */
    return q.replace(/([^まただ])だ(?=[。！？!?…、」]|$)/g, '$1や');
  }
  function aniki(q, who) {
    var f = who.gender === 'f';
    q = q.replace(/(あなた|きみ|君)(?=(?:は|が|も|の|を|に|と|で|って|、|。|！|？|…|$|さ|ね|よ|なら|だけ))/g, f ? 'あんた' : 'お前');
    q = q.replace(/^(ありがとう|ありがと)(?=[。！…]|$)/, f ? 'ありがとね' : 'ありがとな').replace(/^(ごめん(なさい)?|すみません)(?=[。！…]|$)/, f ? '悪いね' : '悪いな').replace(/お願い(?=[。！…]|$)/, '頼む');
    /* 兄貴・姉貴分は性別に関係なく、さっぱりした語尾。「〜のよ」「〜わよ」「〜かしら」は外す */
    q = q.replace(/あらあら/g, 'まあまあ').replace(endRe('([一-鿿ァ-ヶー]|大丈夫|平気|きれい|綺麗|素敵|すてき)よ'), '$1だよ').replace(endRe('かしら'), 'かな').replace(endRe('(だ|た|い)わよ'), '$1よ').replace(endRe('([^ぁ-ん])わよ'), '$1だよ')
      .replace(endRe('いいのよ'), 'いいんだよ').replace(endRe('のよ'), 'んだよ').replace(endRe('なのね'), 'なんだね').replace(endRe('(だ|た)わね'), '$1ね').replace(endRe('だわ'), 'だ')
      .replace(endRe('(てる|ない|たい|しい)わ'), '$1よ').replace(endRe('([るうくすつぬむぐぶ])わよ'), '$1よ').replace(endRe('([るうくすつぬむぐぶい])わね'), '$1ね');
    q = q.replace(/(?:少々)?お待ち(?:くださいませ|ください|ちょうだい)/g, 'ちょっと待ってて').replace(/お忘れ(?:くださいませ|ください|ちょうだい)/g, '忘れちまいな');
    if (who.gender === 'm') q = q.replace(endRe('ちょうだい'), 'くれ').replace(endRe('([^だ])よね'), '$1よな');
    if (who.gender === 'm') q = q.replace(endRe('だよ'), 'だぜ').replace(endRe('(だ|た|い)ね'), '$1な');
    else q = q.replace(endRe('だよ'), 'だよ').replace(endRe('かな'), 'かね');
    return q;
  }
  /* 冷静（落ち着き）：分析・計算めいた言葉を外す */
  var CALM = [[/統計的に|確率的に|論理的に|合理的に考えて/g, ''], [/分析した/g, '見極めた'], [/分析/g, '見極め'], [/計算した/g, '見積もった'], [/計算/g, '見当'], [/確率/g, '見込み'],
    [/観察した/g, '見ていた'], [/観察/g, '様子見'], [/データ/g, '様子'], [/合理的/g, '落ち着いた'], [/効率/g, '手際'], [/想定外/g, '予想外'], [/想定/g, '予想'], [/記録した/g, '覚えておいた'], [/仮説/g, '見立て'], [/検証/g, '確かめ'], [/パーセント|％/g, '割']];
  function calmText(t) { CALM.forEach(function (r) { t = t.replace(r[0], r[1]); }); return t; }

  var sq0 = V.styleQuote;
  V.styleQuote = function (q, who) {
    var ex = who && EX[who.tone];
    if (!ex) return sq0(q, who);
    if (ex.plain) q = V.casualQuote ? V.casualQuote(q) : q;
    if (ex.neutral) q = sq0(q, Object.assign({}, who, { gender: 'm' }));
    else if (who.tone === 'aniki') q = sq0(q, Object.assign({}, who, { persona: 'free' }));
    else q = sq0(q, who);
    if (ex.neutral) q = neutral(q);
    if (who.tone === 'aniki') q = aniki(q, who);
    if (ex.plain && V.casualQuote) q = V.casualQuote(q);
    if (ex.kansai) q = kansai(q);
    if (ex.calm) q = calmText(q);
    return q.replace(/([！？!?])。/g, '$1');
  };

  /* ---------- 呼称 ---------- */
  var SUFFIX = { san: 'さん', kun: 'くん', chan: 'ちゃん', sama: '様', senpai: '先輩', sensei: '先生', name: '' };
  HK.CALL_STYLES = [
    { v: '', label: 'おまかせ（文のまま）' }, { v: 'name', label: '呼び捨て' }, { v: 'san', label: 'さん付け' }, { v: 'kun', label: 'くん付け' },
    { v: 'chan', label: 'ちゃん付け' }, { v: 'sama', label: '様付け' }, { v: 'senpai', label: '先輩' }, { v: 'sensei', label: '先生' }
  ];
  function esc(s) { return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }
  /* who が target をどう呼ぶか（null なら文のまま） */
  V.callFor = function (who, target) {
    if (!who || !target || who === target) return null;
    var own = who.calls && who.calls[target.name];
    if (own) return String(own).trim().slice(0, 16) || null;
    if (who.call && SUFFIX[who.call] != null) return target.name + SUFFIX[who.call];
    return null;
  };
  V.applyCalls = function (q, who, people) {
    if (!who || (!who.call && !who.calls)) return q;
    people.forEach(function (p) {
      if (p === who || !p.name) return;
      var c = V.callFor(who, p);
      if (!c) return;
      q = q.replace(new RegExp(esc(p.name) + '(?:さん|くん|君|ちゃん|様|さま|先輩|先生|殿)?', 'g'), c);
    });
    return q;
  };

  /* voice.js の話し手判定のあとで、呼称と冷静（落ち着き）の地の文を整える */
  var pr0 = V.processResult;
  V.processResult = function (res, input) {
    if (!res || !input || !input.chars) return pr0(res, input);
    var calmNames = [];
    input.chars.forEach(function (c) { if (HK.toneOf(c) === 'calm') calmNames.push(c.name); });
    var out = pr0(res, input);
    if (calmNames.length) {
      var re = new RegExp(calmNames.map(esc).join('|'));
      var f = function (t) { return typeof t === 'string' ? t.replace(/[^。！？]*[。！？]?/g, function (sen) { return re.test(sen) ? calmText(sen) : sen; }) : t; };
      (out.log || []).forEach(function (e) { if (e && typeof e.text === 'string') e.text = f(e.text); });
    }
    return out;
  };
})();
