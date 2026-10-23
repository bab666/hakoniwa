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

  /* 追加の口調の名前・一人称・借りる表と、選択欄の並びは tone-registry.js（HK.TONES）から */
  var EX = HK.TONE_EXTRA;
  if (!EX) return;
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
    var p = (EX[t] && EX[t].base) || HK.personaAuto(trOf(c));
    /* 文面の表がエゴグラムから決まる口調（egoTable）は、敬語の表だと話し方の整形が効かないので、穏やかの表を使う */
    /* noPolite（ヤンキーなど）は、敬語で話す健気の表も穏やかの表に替える */
    return EX[t] && EX[t].egoTable && (p === 'polite' || (EX[t].noPolite && p === 'devoted')) ? 'gentle' : p;
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
  function neutral(q, t) {
    return HK.thinIntj(q, { 'あらあら': 'おやおや', 'あらまあ': 'おやまあ', 'あら': 'おや' }).replace(endRe('かしら'), 'かな').replace(endRe('ですわ'), 'です').replace(endRe('(だ|た|い)わよ'), '$1よ').replace(endRe('([るうくすつぬむぐぶ])わよ'), '$1よ').replace(endRe('([るうくすつぬむぐぶ])わね'), '$1ね').replace(endRe('(だ|た|い)わね'), '$1ね')
      .replace(endRe('のよ'), 'んだ').replace(endRe('なのね'), 'なんだね').replace(endRe('だわ'), 'だ').replace(endRe('([いたくすつぬむるよ]|(?<!^|[、…‥。！？!?「\\s])う)わ'), '$1').replace(endRe('よね'), 'よね').replace(endRe('ちょうだい'), 'くれる？').replace(endRe('([一-鿿ァ-ヶー])ね'), '$1だね')
      /* 「倒れなさいよ」「何よ」「まだよ」も中性的に */
      .replace(endRe('(?<!ごめん|お帰り|おかえり|いらっしゃい|おやすみ)なさい(よ|ってば)?'), function (m, e) { return (t === 'gentle_n' ? 'て' : 'な') + (e || ''); }).replace(/(^|[、…「\s])何よ(?=もう|[！？!?…。、」]|$)/g, '$1何だよ').replace(/(^|[、…「\s])まだよ(?=[！!…。、」]|$)/g, '$1まだだ');
  }
  var KANSAI = [
    /* 「なんでお前なんだよ」→「なんでお前なんや」、「ないのかよ」→「ないんかい」、「企画じゃないの？」→「企画やないん？」 */
[/(?<=^|[、。！？!?…「\s]|[でとにがはも])(?:きみ|君)(?=[はがもをにとのって、。！？…」]|な|$)/g, 'あんた'],
    [/なんだよ(?=[。！？!?…、」]|$)/g, 'なんや'], [/のかよ(?=[。！？!?…、」]|$)/g, 'んかい'], [/じゃないのか(?=[？?])/g, 'やないんか'], [/じゃないの(?=[？?])/g, 'やないん'], [/(?<=[^ぁ-ん]|[こそあど]ん|[いた])なの(?=[。！？!?…、」]|$)/g, 'なん'],
    /* 「何してると思う」→「何しとると思う」、「待ってた」→「待っとった」（「捨てる」などの動詞そのものは変えない） */
    [/([しいっきちにひみりびぎ])てる(?=[とのんかよなで。！？!?…、」]|$)/g, '$1とる'], [/んでる(?=[とのんかよなで。！？!?…、」]|$)/g, 'んどる'], [/([しいっきちにひみりびぎ])てた(?=[とのんかよなで。！？!?…、」]|$)/g, '$1とった'], [/んでた(?=[とのんかよなで。！？!?…、」]|$)/g, 'んどった'],
    /* 「帰るぞ」「行くよ」→「帰るで」「行くで」 */
    [/([るうくすつぬむぐぶ])[ぞよ](?=[。！!…、」]|$)/g, '$1で'],
    [/本当に/g, 'ほんまに'], [/本当/g, 'ほんま'], [/ほんとに/g, 'ほんまに'], [/とても|すごく/g, 'めっちゃ'],
    [/だ、(?=だめ|ダメ|駄目)/g, 'あ、'], [/(?:駄目|ダメ|だめ)、(?=だめ|ダメ)/g, 'あかん、'], [/(?:駄目|ダメ|だめ)だ(?=[。！？!?…、」]|$)/g, 'あかん'], [/(?:駄目|ダメ|だめ)(?:なんだ|なの)(?=[。！？!?…、」]|$)/g, 'あかんねん'], [/(?:駄目|ダメ|だめ)、?ぇ/g, 'あかぁん'], [/駄目|ダメ|だめ/g, 'あかん'], [/あかん(、)?です/g, 'あきません'], [/あかん([…‥っ]+)です[…‥]*/g, 'あかん$1'], [/分からない(?!で)/g, '分からへん'], [/わからない(?!で)/g, 'わからへん'], [/知らない(?!で)/g, '知らん'], [/いらない(?!で)/g, 'いらん'],
    [/できない(?!で)/g, 'できへん'], [/行かない(?!で)/g, '行かへん'], [/言わない(?!で)/g, '言わへん'], [/構わない(?!で)/g, 'かまへん'], [/しない(?=[。？…、」よのかぞ]|$)/g, 'せえへん'], [/しない(?=！)/g, 'せえへん'],
    [/じゃないか/g, 'やないか'], [/じゃない(?=[？?])/g, 'ちゃう'], [/じゃん(?!けん)/g, 'やん'], [/違う(?=[。！？…、」よのか]|$)/g, 'ちゃう'],
    [/だよね/g, 'やんな'], [/だよな/g, 'やんな'], [/(?<![まただ])だよ/g, 'やで'], [/(?<![まただ])だぞ(?=[。！？!?…、」]|$)/g, 'やで'], [/(?<![まただ])だね/g, 'やな'], [/(?<![まただ])だな(?=[。！？…、」]|$)/g, 'やな'],
    [/だろう?/g, 'やろ'], [/でしょう?(?=[。！？…、」]|$)/g, 'やろ'], [/だから/g, 'やから'], [/だけど/g, 'やけど'], [/だった/g, 'やった'], [/だって/g, 'やって'],
    [/んじゃない(?=[。！…、」]|$)/g, 'んやない'], [/じゃない(?=[。！…、」]|$)/g, 'やない'], [/じゃない(?=、)/g, 'やない'],
    [/(見|来|こ)ないで(?:くれ)?(?=[。！？…、」っ]|$)/g, '$1んといて'], [/しないで(?:くれ)?(?=[。！？…、」っ]|$)/g, 'せんといて'], [/([かさたなまらわがば])ないで(?:くれ)?(?=[。！？…、」っ]|$)/g, '$1んといて'],
    [/(?<!い)や、やだ/g, 'い、いやや'], [/(?<!い)やだ/g, 'いやや'],
    [/([こそあど])んなの/g, '$1んなん'], [/なに、これ/g, 'なんや、これ'], [/(出|き|来|イっ)ちゃ(?=う|っ|…|、|$)/g, '$1てま'],
    [/なさい(?:よ)?(?=[。！？…、」]|$)/g, 'や'], [/てちょうだい/g, 'てや'], [/大丈夫よ(?=[。！？…、」]|$)/g, '大丈夫やで'], [/あかん(?:やった|だった)/g, 'あかんかった'],
    [/((?<![しとんこ])か|(?<=[泳急稼騒防脱繋注嗅剥塞継担仰研漕紡揺焦跨]|つな|ぬ|いそ|さわ|およ|かせ)が|[さたなまらわば])ない(?=[。！？…、」よでのかぞ]|$)/g, '$1へん'], [/(^|[^ぁ-ん]|[はがもをにで])いい(?=よ|で|[。！？…、」]|$)/g, '$1ええ'], [/しろ(?=[。！？…、」]|$)/g, 'せえ'],
    [/よね(?=[。！？…、」]|$)/g, 'よな'], [/あかんやで/g, 'あかんで'], [/あなた(?=[はがもをにとのって、。！？…」])/g, 'あんた']
  ];
  /* 関西弁の敬語：標準語のです・ますを、やわらかい関西の丁寧語に（「〜まへん」「〜ですわ」「〜ですやろ」）。
     全部の文を同じ語尾にしないよう、文ごとに台詞の中身で言い方を変える */
  var KEND = '(?=[。！？!?…、」♡〜ー]|$)';
  function kre(s) { return new RegExp(s + KEND, 'g'); }
  function kansaiKeigo(q) {
    if (!/(です|ます|ません|でしょう)/.test(q)) return q;
    /* 「ですわ」「でしたわ」「ですねん」「おくれやす」は、お嬢様言葉や京言葉に聞こえるので使わない */
    return q.replace(/じゃないですか/g, 'やないですか').replace(/じゃありません/g, 'やあらしません')
      .replace(kre('ませんか'), 'まへんか').replace(kre('ませんよ'), 'まへんで').replace(kre('ません'), 'まへん')
      .replace(kre('でしょう(?:か)?'), 'ですやろ').replace(kre('ですよね'), 'ですやんな').replace(kre('ですね'), 'ですなあ').replace(kre('ますね'), 'ますなあ');
  }
  function kansai(q) {
    /* 関西弁は敬語を使わない（標準語の「〜です」「〜ますか」を残さない） */
    if (V.casualQuote) q = V.casualQuote(q);
    q = kansaiKeigo(q);
    q = q.replace(/(?:わよ|のよ)(?=[。！？!?…、」]|$)/g, 'で').replace(/(だ|た)わね(?=[。！？!?…、」]|$)/g, '$1なあ').replace(/(?:ないわね|ないわねえ)(?=[。！？!?…、」]|$)/g, 'へんなあ').replace(/わね(?=[。！？!?…、」]|$)/g, 'なあ');
    /* 標準語の残り：「〜しちゃう」→「〜してまう」、「〜なきゃ」→「〜な」、「〜られない／〜れない」→「〜られへん／〜れへん」、「〜ないの？」→「〜へんの？」 */
    q = q.replace(/しちゃう(?=[！!])/g, 'したる').replace(/([べめれせてねけげえいきしちにびみりぎじ])ちゃう(?=[。！？!?…、」]|$)/g, '$1てまう').replace(/っちゃう(?=[。！？!?…、」]|$)/g, 'ってまう')
      .replace(/なきゃ(?=[。！？!?…、」]|$)/g, 'な').replace(/(られ|れ)ない(?=[。！？!?…、」]|$)/g, '$1へん').replace(/(?<!じゃ|しか|なんか|[がもはゃ])ないの(?=[？?])/g, 'へんの');
    KANSAI.forEach(function (r) { q = q.replace(r[0], r[1]); });
    /* 「まだだ」「まだだよ」→「まだや」「まだやで」 */
    q = q.replace(/まだだ(よ|ね|な)?(?=[。！？!?…、」]|$)/g, function (m, e) { return 'まだや' + (e === 'よ' ? 'で' : e ? 'な' : ''); });
    /* 言い切りの「だ」→「や」（まだ・ただ などは除く） */
    q = q.replace(/ごめんや(?=[。！？!?…、」]|$)/g, 'ごめんな');
    return q.replace(/([^まただ])だ(?=[。！？!?…、」]|$)/g, function (m, c, off, str) { return c === 'ん' && /[一-鿿]$/.test(str.slice(0, off)) || c === 'ら' && /(?:^|[…‥、\s])か$/.test(str.slice(0, off)) ? m : c + 'や'; });
  }
  function aniki(q, who) {
    var f = who.gender === 'f';
    q = q.replace(/(あなた|きみ|君)(?=(?:は|が|も|の|を|に|と|で|って|、|。|！|？|…|$|さ|ね|よ|なら|だけ))/g, f ? 'あんた' : 'お前');
    q = q.replace(/^(ありがとう|ありがと)(?=[。！…]|$)/, f ? 'ありがとね' : 'ありがとな').replace(/^(ごめん(なさい)?|すみません)(?=[。！…]|$)/, f ? '悪いね' : '悪いな').replace(/お願い(?=[。！…]|$)/, '頼む');
    /* 兄貴・姉貴分は性別に関係なく、さっぱりした語尾。「〜のよ」「〜わよ」「〜かしら」は外す */
    q = HK.thinIntj(q, { 'あらあら': 'まあまあ', 'あらまあ': 'へえ', 'あら': 'お' }).replace(endRe('([一-鿿ァ-ヶー]|大丈夫|平気|きれい|綺麗|素敵|すてき)よ'), '$1だよ').replace(endRe('かしら'), 'かな').replace(endRe('(だ|た|い)わよ'), '$1よ').replace(endRe('([^ぁ-ん])わよ'), '$1だよ')
      .replace(endRe('いいのよ'), 'いいんだよ').replace(endRe('のよ'), 'んだよ').replace(endRe('なのね'), 'なんだね').replace(endRe('(だ|た)わね'), '$1ね').replace(endRe('だわ'), 'だ')
      .replace(endRe('(てる|ない|たい|しい)わ'), '$1よ').replace(endRe('([るうくすつぬむぐぶ])わよ'), '$1よ').replace(endRe('([るうくすつぬむぐぶい])わね'), '$1ね');
    q = q.replace(/(?:少々)?お待ち(?:くださいませ|ください|ちょうだい)/g, 'ちょっと待ってて').replace(/お忘れ(?:くださいませ|ください|ちょうだい)/g, '忘れちまいな');
    if (who.gender === 'm') q = q.replace(endRe('ちょうだい'), 'くれ').replace(endRe('([^だてで])よね'), '$1よな');
    if (who.gender === 'm') q = q.replace(endRe('(?<!ん)(?<!(?:何|なん|誰|どこ|いつ|どう)[^。！？!?]{0,10})だよ'), 'だぜ').replace(endRe('(だ|た|い)ね'), '$1な');
    else q = q.replace(endRe('だよ'), 'だよ').replace(endRe('かな'), 'かね');
    return q;
  }
  /* 冷静（落ち着き）：分析・計算めいた言葉を外す */
  var CALM = [[/統計的に|確率的に|論理的に/g, ''], [/計算外(?:だな?|です)?(?=[。！？!?…、」]|$)/g, 'こんなはずじゃ、なかった'], [/計算外/g, 'こんなはずじゃ'], [/分析できない/g, 'わからない'], [/観測できない/g, 'もう何も'], [/データ/g, '手がかり'], [/統計/g, 'これまで'], [/合理的に考え(れば|ると|て)/g, 'よく考え$1'], [/合理的に/g, '冷静に'], [/計算通り|計算どおり/g, '思ったとおり'], [/計算済み/g, 'もう分かっている'], [/比較する/g, '比べる'], [/比較/g, '比べ'], [/処理時間/g, 'かかる時間'], [/予測通り|予測どおり/g, '思ったとおり'], [/生存率/g, '生き残る見込み'], [/特定済み/g, 'もう分かっている'], [/分析した/g, '見極めた'], [/分析/g, '見極め'], [/計算した/g, '見積もった'], [/計算だ/g, 'はずだ'], [/計算になる/g, 'ことになる'], [/確率/g, '見込み'],
    [/観察した/g, '見ていた'], [/観察/g, '様子見'], [/合理的では(?:ある)?/g, '筋は通って'], [/合理的な/g, '筋の通った'], [/合理的/g, '筋の通った'], [/採取効率が(?:いい|良い)/g, '採りやすい'], [/再現性があるか/g, 'もう一度起きるか'], [/採取効率/g, '採りやすさ'], [/効率/g, '手際'], [/想定外/g, '予想外'], [/記録した/g, '覚えておいた'], [/仮説/g, '見立て'], [/検証/g, '確かめ'], [/再現性を確かめ/g, 'もう一度確かめ'], [/再現性/g, '同じことが起きるか'], [/興味深い/g, '面白い'], [/数値/g, '数字'], [/説明がつく/g, '納得がいく']];
  HK.calmText = function (t) { return calmText(t); };
  function calmText(t) { CALM.forEach(function (r) { t = t.replace(r[0], r[1]); }); return t.replace(/^、+/, '').replace(/([。！？…])、+/g, '$1'); }

  var sq0 = V.styleQuote;
  V.styleQuote = function (q, who) {
    var ex = who && EX[who.tone];
    if (!ex) return sq0(q, who);
    if (ex.plain) q = V.casualQuote ? V.casualQuote(q) : q;
    /* やわらかい口調（健気くだけなど）は、敬語を外しても「すまない」と硬くしない */
    if (ex.plain && ex.group === 'soft') q = q.replace(/(^|[、…‥「\s])((?:す、)?)すまな(い|かった)(?=[。！!…‥、」]|$)/g, function (m, p, st, e) { return p + (st ? 'ご、' : '') + (e === 'い' ? 'ごめん' : 'ごめんね'); });
    if (ex.neutral) q = sq0(q, Object.assign({}, who, { gender: 'm' }));
    else if (who.tone === 'aniki') q = sq0(q, Object.assign({}, who, { persona: 'free' }));
    else q = sq0(q, who);
    if (ex.neutral) q = neutral(q, who.tone);
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
    { v: 'chan', label: 'ちゃん付け' }, { v: 'sama', label: '様付け' }, { v: 'senpai', label: '先輩' }, { v: 'sensei', label: '先生' },
    { v: 'gender', label: '相手の性別で分ける（男性・女性・その他ごとに選ぶ）' }
  ];
  function esc(s) { return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }
  /* who が target をどう呼ぶか（null なら文のまま） */
  V.callFor = function (who, target) {
    if (!who || !target || who === target) return null;
    var own = who.calls && who.calls[target.name];
    if (own) return String(own).trim().slice(0, 16) || null;
    /* 相手の性別で分ける：男性・女性・その他ごとに決めた敬称（決めていなければ くん・ちゃん・さん） */
    if (who.call === 'gender') { var gk = target.gender === 'm' ? 'm' : target.gender === 'f' ? 'f' : 'x', cg = (who.callG || {})[gk] || { m: 'kun', f: 'chan', x: 'san' }[gk]; return SUFFIX[cg] != null ? target.name + SUFFIX[cg] : null; }
    if (who.call && SUFFIX[who.call] != null) return target.name + SUFFIX[who.call];
    /* 呼び方が「おまかせ」で、敬語で話す口調（敬語・明るい敬語・お嬢様・健気）は「〇〇さん」（呼び捨てと「さん」付けが混ざらないように） */
    if (!who.call && /^(?:polite|genki|ojou|devoted)$/.test(who.tone || '')) return target.name + 'さん';
    return null;
  };
  /* 名前が普通の言葉と同じとき（「楽」「敬語」など）、言葉として使われている所には呼び方をつけない。
     ・漢字の名前の前後に漢字、カタカナの名前の前後にカタカナが続く（「快楽」「楽園」）
     ・名前のあとに動詞や形容詞が続く（「敬語やめよ」「楽しい」）
     ・「〜が楽」「〜は楽」のように、助詞のすぐあとで文が終わる（述語として使われている） */
  var KJ = /[一-鿿々]/, KT = /[ァ-ヶー]/, HR = /[ぁ-ゖ]/;
  var NEXT_OK = /^(?:[、。！？!?…‥」』）)\s〜ー♡っ]|$|は|が|を|に|と|も|の|って|なら|だけ|まで|から|より|へ|さ(?![ぁ-ゖ])|ね|よ|こそ|しか|たち|ら(?![ぁ-ゖ])|ってば|ってさ|か(?=[？?、。」]|$)|だ|です|じゃ)/;
  function nameHere(name, prev, next) {
    var first = name.charAt(0), last = name.charAt(name.length - 1);
    if (KJ.test(first) && KJ.test(prev || '')) return false;
    if (KT.test(first) && KT.test(prev || '')) return false;
    if (KJ.test(last) && KJ.test(next.charAt(0))) return false;
    if (KT.test(last) && KT.test(next.charAt(0))) return false;
    if (!NEXT_OK.test(next)) return false;
    /* 一、二字の漢字やひらがなの名前（普通の言葉と重なりやすい）だけ、述語に使われていないかも見る */
    if (/^(?:[一-鿿々]{1,2}|[ぁ-ゖ]{1,3})$/.test(name) && /[がはもをでの]$/.test(prev || '') && /^(?:[。！？!?…‥」]|$|に|だ|です|じゃ|な(?!ら))/.test(next)) return false;
    return true;
  }
  V.applyCalls = function (q, who, people) {
    if (!who || (!who.call && !who.calls && !/^(?:polite|genki|ojou|devoted)$/.test(who.tone || ''))) return q;
    people.forEach(function (p) {
      if (p === who || !p.name) return;
      var c = V.callFor(who, p);
      if (!c) return;
      /* 呼び方を決めていない敬語の口調の「さん」は、台詞にもともと付いている呼び方（「〇〇先輩」「〇〇くん」）を上書きしない */
      var dflt = !who.call && !(who.calls && who.calls[p.name]);
      q = q.replace(new RegExp(esc(p.name) + '(?:さん|くん|君|ちゃん|様|さま|先輩|先生|殿)?', 'g'), function (m, off, str) {
        if (m !== p.name) return dflt ? m : c;
        /* 印（U+2064）付きの名前は、名前として差し込まれた所なので、そのまま呼び方を付ける */
        if (p.name.charAt(0) !== (HK.NAME_MARK || '\u2064') && !nameHere(p.name, str.charAt(off - 1), str.slice(off + m.length))) return m;
        return c;
      });
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

  /* ---------- 穏やか・穏やか（中性的）・内気：借りた文面に残った敬語の文（「規定の深さです」「幽霊って信じます？」）は、
     敬語で話す相手（ctx.kg）でなければ崩してから、その口調の言い回しに通す（「規定の深さだよ」「幽霊って信じる？」）。
     喘ぎ・短いつぶやきは V.unPoliteQuote が触らない。書き下ろしの敬語の行はそのまま（voice.js で仕上げを通らない） ---------- */
  if (HK.toneFinish && V.unPoliteQuote) ['gentle', 'gentle_n'].forEach(function (t) {
    HK.toneFinish(t, function (q, who, ctx) {
      if (ctx && ctx.kg) return q;
      var c = V.unPoliteQuote(q);
      if (c === q) return q;
      c = c.replace(/お疲れさま(?:だった|だ)(?=[。…‥」！!]|$)/g, 'お疲れさま').replace(/(?<=[、。…‥\s]|^)お疲れ(?=[。…‥」]|$)/g, 'お疲れさま');
      /* 崩したあとの硬い言い残し（「失礼だが」「すまない」）は、やわらかい口調に合わせる */
      c = c.replace(/(だ|た)が(?=、)/g, '$1けど').replace(/(^|[、。…‥\s])すまない(?=[、。…‥」]|$)/g, function (m, p) { return p + (p === '' || /[。]/.test(p) ? 'ごめんね' : 'ごめん'); });
      c = c.replace(/す、ごめん/g, 'ご、ごめん');
      return V.styleQuote ? V.styleQuote(c, who) : c;
    });
  });
  /* 内気：手書きの台詞が「〜、です……」調なので敬語は崩さず、残った敬語の文に内気らしい間を入れる（「規定の深さです」→「規定の深さ、です……」）。
     喘ぎ・短いつぶやき・敬語で話す相手への台詞はそのまま */
  if (HK.toneFinish && V.unPoliteQuote) HK.toneFinish('shy', function (q, who, ctx) {
    if ((ctx && ctx.kg) || V.unPoliteQuote(q) === q) return q;
    var parts = q.split(/([。！？!?…‥」\n]+)/), lastI = -1;
    parts.forEach(function (seg, i) { if (!(i % 2) && /[^\s、]/.test(seg)) lastI = i; });
    if (lastI < 0) return q;
    var seg = parts[lastI], next = parts[lastI + 1] || '';
    if (/[！!]/.test(next)) return q;
    seg = seg.replace(/([^、\s…‥っ])(です|でした|ですね|でしたね)$/, '$1、$2');
    if (!/[？?…‥]/.test(next)) parts[lastI + 1] = '……' + next.replace(/^。/, '');
    parts[lastI] = seg;
    return parts.join('');
  });
})();
