/* 箱庭シミュレーター ui: 見本の台詞で試す（HK.ToneLab。2026-11-05。設計は docs/reports/2026-11-05/tone-editor.md）
   住人の口調の自作（語尾の設定（かんたん）・口調の辞書（上級））を、たくさんの見本の台詞でその場で試す箱。
   ・語尾の設定・辞書を打つたびに（300ms 待って）言い換え直す（ui-voice.js の VS.sampleRefresh から refreshAll）
   ・各行に、言い換える前の文（この住人が使うベース：くだけた常体・硬い常体・敬語）・当たった行（辞書・語尾の設定・口調の辞書）・
     書いたのに当たらなかった行とその理由（ベースが違う・文の途中・長い項目が先・不自然になる文・書き下ろし・敬語の相手…）を出す
   ・理由は、言い換えの経路の記録（voice.js の V.trace・tone-engine.js の T.trace。配列のときだけ足す）から読む。出力は変えない
   ・見本の台詞は 3 本（くだけた常体｜硬い常体｜敬語）。番号は辞書の見本（tone-ending.js の「ござる」）のコメントが指す。
     R18版の夜の台詞は全年齢モードでないときだけ（r18 の印の中。全年齢版には入らない）
   画面：tone-ending.js の E.gearHtml が HK.ToneLab.box(c, 相手) を差し込む（⚙設定の「口調」と、住人タブの口調の辞書（上級）の下）。late で読む */
(function () {
  'use strict';
  var HK = window.HK;
  if (!HK || !HK.Tone || !HK.Ending) return;
  var L = HK.ToneLab = {};
  var T = HK.Tone, E = HK.Ending;
  function esc(s) { return (HK.escape || function (x) { return String(x); })(s); }
  var FORM = { K: 'くだけた常体', F: '硬い常体', P: '敬語' };

  /* ---------- 見本の台詞（{n}=本人、{o}=相手。一人称は {一人称}、二人称は {二人称}。古い行の「私」「あなた」もそのまま動く） ---------- */
  var CATS = [['day', '日常・あいさつ'], ['thx', '感謝・謝罪'], ['mad', '怒り・ケンカ'], ['love', '照れ・恋愛'], ['care', '弱音・気遣い'], ['ask', '問い・相談']];
  var LINES = [
    ['day', '私は{n}。よろしくね｜私は{n}だ。よろしく頼む｜私は{n}です。よろしくお願いします'],
    ['day', 'おはよう。よく眠れた？｜おはよう。よく眠れたか｜おはようございます。よく眠れましたか？'],
    ['day', 'ただいま。今日は疲れた｜戻った。今日は疲れた｜ただいま戻りました。今日は疲れました'],
    ['day', 'ご飯できたよ。冷めないうちに食べて｜飯ができた。冷めないうちに食べろ｜ご飯ができました。冷めないうちに食べてください'],
    ['day', '今日はいい天気だね｜今日はいい天気だな｜今日はいい天気ですね'],
    ['day', '{一人称}の家、すぐそこなんだ。冷めないうちに寄っていって｜{一人称}の家はすぐそこだ。冷めないうちに寄っていけ｜{一人称}の家はすぐそこです。冷めないうちに寄っていってください'],
    ['day', 'ちょっと出かけてくる。すぐ戻るから｜少し出てくる。すぐ戻る｜少し出かけてきます。すぐ戻りますから'],
    ['day', 'それ、どこで買ったの？｜それはどこで買った｜それ、どこで買ったんですか？'],
    ['day', 'もう寝る？　明日も早いよ｜もう寝るのか。明日も早いぞ｜もう寝ますか？　明日も早いですよ'],
    ['day', '知ってるよ｜知っている｜知っています'],
    ['day', 'え、それ聞いてない｜何、それは聞いていない｜え、それは聞いていません'],
    ['thx', 'ありがとう。ほんとに助かった｜助かった。感謝する｜ありがとうございます。本当に助かりました'],
    ['thx', 'ごめん、遅れちゃった｜すまない、遅れた｜すみません、遅れてしまいました'],
    ['thx', '手伝ってくれてありがとう。一人じゃ無理だった｜手伝ってくれて感謝する。一人では無理だった｜手伝ってくださってありがとうございます。一人では無理でした'],
    ['thx', '{o}、あのときは疑ってごめん。……まだ、私と組んでてくれる？｜{o}、あのときは疑ってすまなかった。……まだ、私と組んでくれるか？｜{o}さん、あのときは疑ってすみません。……まだ、私と組んでいてくれますか？'],
    ['thx', '気にしないで。お互いさまだよ｜気にするな。お互いさまだ｜気にしないでください。お互いさまですよ'],
    ['love', '{二人称}がいてくれて、{一人称}はうれしい｜{二人称}がいてくれて、{一人称}はうれしい｜{二人称}がいてくださって、{一人称}はうれしいです'],
    ['care', 'わ、{一人称}でよければ、{二人称}の話を聞くよ｜わ、{一人称}でよければ、{二人称}の話を聞こう｜わ、{一人称}でよければ、{二人称}のお話を聞きます'],
    ['mad', 'いい加減にして！　もう知らない｜いい加減にしろ！　もう知らん｜いい加減にしてください！　もう知りません'],
    ['mad', 'こっちの台詞。子どものころ物置に閉じ込められたのも、あなたのせいだった！｜こちらの台詞だ。子どものころ物置に閉じ込められたのも、あなたのせいだった！｜こちらの台詞です。子どものころ物置に閉じ込められたのも、あなたのせいでした！'],
    ['mad', 'なんで黙ってたの？｜なぜ黙っていた｜どうして黙っていたんですか？'],
    ['mad', 'そんな言い方しなくてもいいでしょ｜そんな言い方をしなくてもいいだろう｜そんな言い方をしなくてもいいでしょう'],
    ['mad', '勝手に決めないで。私の話も聞いて｜勝手に決めるな。私の話も聞け｜勝手に決めないでください。私の話も聞いてください'],
    ['mad', '別に怒ってない。ちょっと疲れただけ｜別に怒っていない。少し疲れただけだ｜別に怒っていません。少し疲れただけです'],
    ['mad', 'うそ、本当に？　すごいね｜まさか、本当か。すごいな｜うそ、本当ですか？　すごいですね'],
    ['love', 'べ、別にあなたのためじゃないから｜別にあなたのためではない｜べ、別にあなたのためではありません'],
    ['love', 'そんなに見ないで。恥ずかしいよ｜そんなに見るな。恥ずかしい｜そんなに見ないでください。恥ずかしいです'],
    ['love', 'あなたのこと、好きなんだ｜あなたのことが好きだ｜あなたのことが好きなんです'],
    ['love', '今度の休み、二人でどこか行かない？｜今度の休みに、二人でどこか行かないか｜今度のお休み、二人でどこかへ行きませんか？'],
    ['love', '手、つないでもいい？｜手をつないでもいいか｜手をつないでもいいですか？'],
    ['love', 'ずっと一緒にいたい｜＝｜ずっと一緒にいたいです'],
    ['love', '似合ってるよ、その服｜その服、似合っている｜その服、似合っていますよ'],
    ['care', '{o}、無理しないで。ほら、座って｜{o}、無理をするな。座れ｜{o}さん、無理をしないでください。ほら、座ってください'],
    ['care', '大丈夫。何とかなるよ｜大丈夫だ。何とかなる｜大丈夫です。何とかなります'],
    ['care', 'こういうの、もうやめて。あなたが倒れたら意味がない｜こういうのは、もうやめろ。あなたが倒れたら意味がない｜こういうの、もうやめてください。あなたが倒れたら意味がありません'],
    ['care', '正直、ちょっと怖い｜正直、少し怖い｜正直、少し怖いです'],
    ['care', 'もう、どうしたらいいか分からない｜もう、どうすればいいか分からない｜もう、どうしたらいいか分かりません'],
    ['care', '顔色悪いよ。熱があるんじゃない？｜顔色が悪いな。熱があるんじゃないか｜顔色が悪いですよ。熱があるんじゃないですか？'],
    ['care', '泣いてもいいよ。ここにいるから｜泣いてもいい。ここにいる｜泣いてもいいですよ。ここにいますから'],
    ['ask', '{o}、あなたはどうしたい？　私は、あなたの決めたことに乗るよ｜{o}、あなたはどうしたい。私は、あなたの決めたことに乗る｜{o}さん、あなたはどうしたいですか？　私は、あなたの決めたことに乗ります'],
    ['ask', 'これからどうする？｜これからどうする｜これからどうしましょうか？'],
    ['ask', '少し話があるんだけど、いい？｜少し話がある。いいか｜少しお話があるんですけど、いいですか？'],
    ['ask', '一緒に行こう。一人より二人のほうが安全だ｜一緒に行くぞ。一人より二人のほうが安全だ｜一緒に行きましょう。一人より二人のほうが安全です'],
    ['ask', '分かった。任せて｜分かった。任せろ｜分かりました。任せてください'],
    ['ask', '静かに。誰か来る｜＝｜静かに。誰か来ます'],
    ['ask', '待って、まだ行かないで｜待て、まだ行くな｜待ってください、まだ行かないでください'],
    ['ask', 'それ、本当にすごいね｜それは本当にすごいな｜それは本当にすごいですね']
  ];
  /* r18:begin */
  var NIGHT = [
    ['love', '今夜は、そばにいて｜今夜は、そばにいろ｜今夜は、そばにいてください'],
    ['love', 'もっと触れてもいい？｜もっと触れてもいいか｜もっと触れてもいいですか？'],
    ['love', '痛くない？　ゆっくりするから｜痛くないか。ゆっくりする｜痛くないですか？　ゆっくりしますから'],
    ['love', '声、我慢しないで｜声を我慢するな｜声を我慢しないでください']
  ];
  /* r18:end */
  L.LINES = LINES;
  CATS.push(['night', '夜（R18版）']);
  /* いま使う見本（番号は 1 から。夜の台詞は全年齢モードでないときだけ、番号は続き） */
  function pool() {
    var out = LINES.map(function (x, i) { return { n: i + 1, cat: x[0], q: x[1] }; });
    var ng = typeof NIGHT !== 'undefined' && !HK.SAFE_ON ? NIGHT : [];
    ng.forEach(function (x, i) { out.push({ n: LINES.length + i + 1, cat: 'night', q: x[1] }); });
    return out;
  }
  L.pool = pool;

  /* ---------- 一行を言い換えて、経路を読む ---------- */
  function person(c, o) {
    var me = { name: c.name, fp: (c.fpFor && o.id && c.fpFor[o.id]) || c.fp || '', you: (c.youFor && o.id && c.youFor[o.id]) || c.you || '', marks: c.marks || '', toneCustom: c.toneCustom || '', gender: c.gender || '', tone: E.toneOf(c), call: c.call || '', callG: c.callG || null, calls: null };
    me.persona = HK.personaOf ? HK.personaOf({ tone: c.tone, eg: c.eg }) : 'gentle';
    if (c.keigo && o.id && c.keigo[o.id]) { me.keigo = {}; me.keigo[o.name] = 1; }
    if (c.calls && o.id && c.calls[o.id]) { me.calls = {}; me.calls[o.name] = c.calls[o.id]; }
    return [me, { name: o.name, fp: '', gender: o.gender || '', tone: '', persona: 'gentle' }];
  }
  function fill(q, c, o) { return q.replace(/\{n\}/g, function () { return c.name; }).replace(/\{o\}/g, function () { return o.name; }); }
  function stripQ(k) { return k.replace(/[？?]$/, ''); }
  /* fb：'K'・'F'・'P' なら、そのベースの文を今の辞書で言い換える（T.forceBase。3本を並べて見せるとき） */
  L.run = function (c, o, raw, fb) {
    var V = HK.Voice, ppl = person(c, o), inner = fill(raw, c, o), text = c.name + '「' + inner + '」', out = text, vt, tt;
    V.trace = []; T.trace = []; T.forceBase = fb || null;
    try { out = V.processText(text, ppl); } catch (e) { out = text; }
    vt = V.trace; tt = T.trace; V.trace = null; T.trace = null; T.forceBase = null;
    var s3 = T.split(inner) || { K: inner, F: inner, P: inner }, path = vt[0] || { path: 'none' };
    var base = path.base || 'K';
    return { s3: s3, base: base, before: s3[base] || s3.K, after: out.slice(c.name.length).replace(/^「|」$/g, ''), path: path, tt: tt };
  };

  /* ---------- 当たった行・当たらなかった理由 ---------- */
  var WX = { grave: '重い台詞なので、勢いを足す言い換えはしません', refuse: '「ごめんだ」のような断りの言い方なので、謝りの言い換えはしません', conj: '語の続き（〜たい・〜かった・〜なさい など）を切ってしまうので当てません',
    cont: '「！」で終わる言い換えの後ろに、かなが続くので当てません', inword: '短い語が、別の語の中（「言うんだ」の「うん」など）にあるので当てません', mid: '文の途中なので、頭に付ける言葉は足しません', dup: '同じ言葉が重なるので当てません' };
  function srcOf(P, kind, from) {
    var u = P.user;
    if (u && (kind === 'w' ? u.words : u.ends).some(function (x) { return x[0] === from; })) return 'dict';
    if (kind === 'e' && P.easy[from]) return 'easy';
    return 'base';
  }
  function toneName(t) { var i = HK.toneInfo && HK.toneInfo(t); return (i && i.label) || t; }
  /* 一行の説明：{ hits: [文字列], miss: [文字列], note: 行全体の注意 } */
  L.explain = function (c, P, r) {
    var out = { hits: [], miss: [], note: '' }, p = r.path;
    if (!E.on(c)) return out;
    if (p.path === 'none') { out.note = '話し手が分からない台詞なので、言い換えていません'; return out; }
    if (p.moan) out.note = 'とっさの短い声（息や声だけの台詞）なので、語尾の設定と辞書は当てず、ベースの口調（' + toneName(P.tone) + '）で整えます';
    else if (p.kg) out.note = '敬語で話す相手への台詞なので、敬語のままです（語尾の設定と辞書は当たりません）';
    else if (p.path === 'ov') out.note = '口調ごとの書き下ろしの台詞なので、辞書は当たりません';
    else if (p.noun) out.note = '「〜」という話（引用）なので、言い換えていません';
    if (out.note) return out;
    var tt = r.tt || [], eh = tt.filter(function (x) { return x.t === 'e'; }), wh = tt.filter(function (x) { return x.t === 'w'; }), wx = tt.filter(function (x) { return x.t === 'wx'; });
    var hitE = {}, hitW = {};
    eh.forEach(function (x) {
      var h = x.hit;
      if (!h) return;
      if (h.app) { out.hits.push({ s: P.user && P.user.rules && P.user.rules.append ? 'dict' : P.e.add ? 'easy' : 'base', t: '文末に足す「' + h.app + '」' }); return; }
      if (h.mark || h.filt) return;
      hitE[h.from] = 1;
      var src = srcOf(P, 'e', h.from);
      /* 口調の辞書がくじで元の形を選んだだけの行は出さない（書いた行・語尾の設定のときだけ「元の形のまま」を出す） */
      if (h.same && src === 'base') return;
      out.hits.push({ s: src, t: '「' + h.from + '」→「' + h.to + '」' + (h.same ? '（くじで元の形のまま）' : '') });
    });
    wh.forEach(function (x) { hitW[x.from] = 1; out.hits.push({ s: srcOf(P, 'w', x.from), t: '「' + x.from + '」→「' + x.to + '」' }); });
    var before = r.before, others = ['K', 'F', 'P'].filter(function (b) { return b !== r.base; });
    /* ベースが違うので当たらない行は、一つにまとめて出す */
    var bm = { keys: [], forms: {} };
    var baseWhy = function (k) {
      var inO = others.filter(function (b) { return r.s3[b] && r.s3[b] !== before && r.s3[b].indexOf(k) >= 0; });
      if (!inO.length) return '';
      if (bm.keys.indexOf(k) < 0) bm.keys.push(k);
      inO.forEach(function (b) { bm.forms[b] = 1; });
      return '';
    };
    var u = P.user;
    if (u) {
      var seenE = {};
      u.ends.forEach(function (x) {
        var k = x[0], ks = stripQ(k);
        if (seenE[k] || hitE[k]) return;
        seenE[k] = 1;
        if (!ks) return;
        var inAny = ['K', 'F', 'P'].some(function (b) { return r.s3[b] && r.s3[b].indexOf(ks) >= 0; });
        if (!inAny) return;
        if (before.indexOf(ks) < 0) { var bw = baseWhy(ks); if (bw) out.miss.push('「' + k + '」：' + bw); return; }
        var rawOf = function (e) { return e.raw || e.core || ''; };
        var mine = function (e) { var h = e && e.hit; return !!(h && ((h.from && !h.filt && srcOf(P, 'e', h.from) !== 'base') || h.app)); };
        /* その語が [語彙] で置き換えた語の中にある（ございます の ます）なら数えない */
        if (wh.some(function (y) { return y.from.indexOf(ks) >= 0; })) return;
        var seg = eh.filter(function (e) { return rawOf(e).slice(-ks.length) === ks; })[0];
        var why, near = null, nearSeg = null;
        if (!seg) eh.forEach(function (e) { var cr = rawOf(e), at = cr.lastIndexOf(ks), rest = at >= 0 ? cr.slice(at + ks.length) : ''; if (at >= 0 && rest && rest.length <= 4 && /^[ぁ-ゖー〜]+$/.test(rest) && !near) { near = ks + rest; nearSeg = e; } });
        /* 同じ文に、書いたほかの行（長い項目「ですね」など）・語尾の設定が当たっていれば、それで足りているので出さない */
        if ((seg && mine(seg) && seg.hit.from !== k) || (nearSeg && mine(nearSeg))) return;
        if (near) why = 'この文の終わりは「' + near + '」なので当たりません（[文末] は終わりまでそろったときだけ当たります。「' + near + '=…」も書くと当たります）';
        else if (!seg) why = '文の途中にあります。[文末] は文の終わり（。！？の手前）だけに当たります（文のどこでも当てるなら [語彙] に書きます）';
        else if (/[？?]$/.test(k) && !seg.q) why = '「？」付きの行は問いの文だけに当たります';
        else if (seg.sc) why = '短い一言なので、決まった ため口の形にしました（規則「短い文はため口」）';
        else if (seg.flat) why = '言い切りの規則で、先に語尾を落としました';
        else if (seg.twist) why = '皮肉の型（規則）で文末を決めました';
        else if (seg.hit && seg.hit.mark) why = 'その文の終わりは [語彙] で置き換えた語なので、[文末] は重ねて当てません';
        else if (seg.hit && seg.hit.filt && seg.hit.from === k) why = 'この文に当てると不自然になる（問い・強い文・あいさつ・重い台詞など）ので、当てませんでした';
        else if (seg.hit && seg.hit.from && seg.hit.from !== k) { var sx = srcOf(P, 'e', seg.hit.from); why = (seg.hit.from.length > k.length ? '長い項目' : '先の項目') + '「' + seg.hit.from + '」（' + SRC[sx] + '）が先に当たりました' + (sx !== 'dict' ? '。辞書に「' + seg.hit.from + '=…」と書けば、そちらが優先されます' : ''); }
        else if (x[2] || x[3]) why = '条件（かっこの中）に合いませんでした';
        else why = '問いの形が違うなどで、当たりませんでした';
        out.miss.push('「' + k + '」：' + why);
      });
      u.words.forEach(function (x) {
        var k = x[0];
        if (hitW[k] || !k) return;
        var inAny = ['K', 'F', 'P'].some(function (b) { return r.s3[b] && r.s3[b].indexOf(k) >= 0; });
        if (!inAny) return;
        if (before.indexOf(k) < 0) { var bw = baseWhy(k); if (bw) out.miss.push('「' + k + '」：' + bw); return; }
        var w = wx.filter(function (y) { return y.from === k; })[0], lg = wh.filter(function (y) { return y.from !== k && y.from.indexOf(k) >= 0; })[0];
        var why = w ? WX[w.why] || '当てませんでした' : lg ? '長い語「' + lg.from + '」が先に当たりました' : tt.some(function (y) { return y.t === 'r'; }) ? '規則（進行・存在・縮約）で先に形が変わりました' : '先に別の言い換えで形が変わりました';
        out.miss.push('「' + k + '」：' + why);
      });
    }
    if (bm.keys.length) out.miss.unshift(bm.keys.map(function (k) { return '「' + k + '」'; }).join('') + '：この住人は' + FORM[r.base] + 'の文から作るので、' + Object.keys(bm.forms).map(function (b) { return FORM[b]; }).join('・') + 'の文にしか無い語には当たりません');
    /* 語尾の設定（ふだん）を決めたのに、どの項目も当たらなかった文（大丈夫。・座って。・怖い。）。あいさつ・言いさし（から・けど）は除く */
    if (P.e.plain && !P.e.add && !(u && u.rules && u.rules.append) && !P.e.flat) {
      var bare = eh.filter(function (e) { return !e.hit && !e.q && !e.sc && !e.flat && e.core && e.core.length >= 2 && (/[一-鿿々ァ-ヶ]$/.test(e.core) || /[てでい]$/.test(e.core)) && !GREETS.test(e.core.replace(/^.*[、…]/, '')); })[0];
      if (bare) out.miss.push('「…' + bare.core.slice(-6) + '」：語尾（ふだん）は、この終わり方（名詞・て・形容詞など）には付きません。足すなら「文末に足す」に書きます');
    }
    return out;
  };
  var SRC = { dict: '辞書', easy: '語尾の設定', base: '口調の辞書' };
  var GREETS = /^(?:ありがとう|おはよう|ただいま|おかえり|おやすみ|ごめん|よろしく|こんにちは|こんばんは|いただきます|ごちそうさま|はい|うん|いいえ)$/;

  /* 一覧の上の注意（辞書全体を見て分かること） */
  L.notes = function (c, P) {
    var n = [], u = P.user;
    if (!E.on(c)) { n.push('語尾の設定か口調の辞書を書くと、ここで言い換わります（いまはふだんの口調）'); return n; }
    var keys = u ? u.ends.map(function (x) { return x[0]; }).concat(u.words.map(function (x) { return x[0]; })) : [];
    if (P.base !== 'P' && keys.some(function (k) { return /^(?:です|ます|ません|ました|でした|でしょう|ください|ございます)/.test(stripQ(k)); }))
      n.push('辞書に「です・ます」の行がありますが、この住人は' + FORM[P.base] + 'の文から作るので、ほとんど当たりません。敬語の文に当てるなら、辞書の頭に「ベース=P」と書きます');
    if (P.base === 'P' && keys.some(function (k) { return /^(?:だよ|だね|だ|じゃん|よね)$/.test(stripQ(k)); }))
      n.push('この住人は敬語の文から作るので、「だ・だよ」の行はほとんど当たりません。くだけた文に当てるなら「ベース=K」と書きます');
    return n;
  };

  /* ---------- 画面 ---------- */
  var ST = { page: 0, cat: '', all: false, before: true, three: true, why: true, open: {} };
  try { var sv = JSON.parse(localStorage.getItem('hk.toneLab') || 'null'); if (sv) { ST.before = sv.before !== false; ST.three = sv.three !== false; ST.why = sv.why !== false; } } catch (e) { /* 保存できない環境 */ }
  function save() { try { localStorage.setItem('hk.toneLab', JSON.stringify({ before: ST.before, three: ST.three, why: ST.why })); } catch (e) { /* 保存できない環境 */ } }
  var PER = 12;
  var css = '.tlab{margin:10px 0 0;border:1px solid var(--line);border-radius:var(--r-card,6px);padding:6px 10px}.tlab>summary{cursor:pointer;font-size:13px;color:var(--muted)}.tlab>summary b{color:var(--ink);font-weight:600}' +
    '.tlab .tl-bar{display:flex;flex-wrap:wrap;gap:6px 12px;align-items:center;margin:6px 0;font-size:12.5px}.tlab .tl-bar label{display:inline-flex;gap:4px;align-items:center}' +
    '.tlab .tl-note{font-size:12px;color:var(--hot,#D7263D);margin:4px 0;line-height:1.6}' +
    '.tlab ol{list-style:none;margin:0;padding:0;max-height:min(60vh,520px);overflow:auto;border-top:1px solid var(--line)}.tlab li{padding:6px 2px;border-bottom:1px solid var(--line);font-size:13.5px;line-height:1.65;overflow-wrap:anywhere}' +
    '.tlab .tl-n{display:inline-block;min-width:2.2em;color:var(--muted);font-size:11px}.tlab .tl-b{color:var(--muted);font-size:12px;margin-right:4px}.tlab .tl-b+.tl-a{display:block}' +
    '.tlab .tl-r{display:block;padding:2px 0 2px 6px;border-left:2px solid transparent;opacity:.72}.tlab .tl-r.tl-sel{border-left-color:var(--accent);opacity:1}.tlab .tl-k{display:inline-block;font-size:10.5px;color:var(--muted);border:1px solid var(--line);border-radius:3px;padding:0 4px;margin-right:4px}.tlab .tl-sel .tl-k{color:var(--accent);border-color:var(--accent)}' +
    '.tlab .tl-h{display:block;color:var(--muted);font-size:11.5px}.tlab .tl-x{display:block;color:var(--hot,#D7263D);font-size:11.5px;opacity:.9}.tlab .tl-h i,.tlab .tl-x i{font-style:normal;border:1px solid currentColor;border-radius:3px;padding:0 3px;margin-right:3px;font-size:10px}';
  if (typeof document !== 'undefined' && document.head) { var st = document.createElement('style'); st.textContent = css; document.head.appendChild(st); }
  function view() {
    var p = pool().filter(function (x) { return !ST.cat || x.cat === ST.cat; });
    if (ST.all || p.length <= PER) return p;
    var pages = Math.ceil(p.length / PER), k = ST.page % pages;
    return p.slice(k * PER, k * PER + PER);
  }
  /* 一行の中の一つのベース（K／F／P）の段：印（★ この住人が使うベース）・言い換える前・言い換えたあと・当たった行 */
  function baseRow(b, label, sel, r, hits) {
    var seen = {};
    hits = hits.filter(function (h) { var k = h.s + h.t; if (seen[k]) return false; seen[k] = 1; return true; });
    return '<span class="tl-r' + (sel ? ' tl-sel' : '') + '"><span class="tl-k">' + (sel ? '★' : '') + esc(label) + '</span>' +
      (ST.before ? '<span class="tl-b">' + esc(r.before) + '</span>' : '') +
      '<span class="tl-a">' + (ST.before ? '→' : '') + '「' + esc(r.after) + '」</span>' +
      (hits.length ? '<span class="tl-h">当たった：' + hits.slice(0, 5).map(function (h) { return '<i>' + SRC[h.s] + '</i>' + esc(h.t); }).join('　') + '</span>' : '') + '</span>';
  }
  function rowsHtml(c, o) {
    var P = E.parts(c), notes = L.notes(c, P), V = HK.Voice;
    if (!V || !V.processText) return '';
    var lis = view().map(function (x) {
      var r = L.run(c, o, x.q), ex = ST.why ? L.explain(c, P, r) : { hits: [], miss: [], note: '' }, body = '';
      if (ST.three && !ex.note) {
        /* 3本のベースを並べる。同じ文のベース（硬い常体＝くだけた常体）は一つの段にまとめる */
        var done = {};
        ['K', 'F', 'P'].forEach(function (b) {
          if (done[b]) return;
          var same = ['K', 'F', 'P'].filter(function (z) { return !done[z] && r.s3[z] === r.s3[b]; });
          same.forEach(function (z) { done[z] = 1; });
          var sel = same.indexOf(r.base) >= 0, rb = sel ? r : L.run(c, o, x.q, b);
          var hb = !ST.why ? [] : sel ? ex.hits : L.explain(c, P, rb).hits;
          body += baseRow(b, same.map(function (z) { return FORM[z]; }).join('・'), sel, rb, hb);
        });
      } else body = baseRow(r.base, FORM[r.base], true, r, ex.hits);
      return '<li><span class="tl-n">' + x.n + '</span>' + body +
        (ex.note ? '<span class="tl-x">' + esc(ex.note) + '</span>' : '') +
        ex.miss.slice(0, 4).map(function (m) { return '<span class="tl-x"><i>★の文で当たらない</i>' + esc(m) + '</span>'; }).join('') + '</li>';
    }).join('');
    return notes.map(function (n) { return '<p class="tl-note">' + esc(n) + '</p>'; }).join('') + '<ol aria-label="見本の台詞">' + lis + '</ol>';
  }
  function opt(v, label, cur) { return '<option value="' + esc(v) + '"' + (v === cur ? ' selected' : '') + '>' + esc(label) + '</option>'; }
  L.box = function (c, o) {
    o = o || { name: '相手', id: '', gender: '' };
    var cid = esc(c.id || ''), n = pool().length, open = ST.open[c.id || ''];
    var cats = CATS.filter(function (x) { return x[0] !== 'night' || n > LINES.length; });
    return '<details class="tlab" data-cid="' + cid + '" data-oid="' + esc(o.id || '') + '"' + (open ? ' open' : '') + '><summary><b>見本の台詞で試す</b>（' + n + '行・言い換える前と後・当たった行）</summary>' +
      '<p class="gearhint">語尾の設定・辞書を打つと、その場で言い換え直します。台詞は「くだけた常体・硬い常体・敬語」の3本の文から、この住人の口調に合う一本（★）を選んで言い換えます（ほかの2本は、そのベースだったらどうなるかの見本）。「当たらない」は、書いた行が★の文に効かなかった理由です。</p>' +
      '<div class="tl-bar"><label>種類 <select data-tlact="cat" aria-label="見本の種類">' + opt('', 'すべて', ST.cat) + cats.map(function (x) { return opt(x[0], x[1], ST.cat); }).join('') + '</select></label>' +
      '<button type="button" class="btn ghost small" data-tlact="next">別の例</button>' +
      '<label><input type="checkbox" data-tlact="all"' + (ST.all ? ' checked' : '') + '> 全部出す</label>' +
      '<label><input type="checkbox" data-tlact="three"' + (ST.three ? ' checked' : '') + '> 3本のベースを並べる</label>' +
      '<label><input type="checkbox" data-tlact="before"' + (ST.before ? ' checked' : '') + '> 言い換える前の文</label>' +
      '<label><input type="checkbox" data-tlact="why"' + (ST.why ? ' checked' : '') + '> 当たった行・理由</label></div>' +
      '<div class="tl-rows" aria-live="polite">' + (open ? rowsHtml(c, o) : '') + '</div></details>';
  };
  function charsOf(box) {
    var VS = HK.VoiceSet, cid = box.getAttribute('data-cid'), c = VS && VS.byId ? VS.byId(cid) : null;
    if (!c) return null;
    var all = HK.UI && HK.UI.state ? HK.UI.state().chars : [], oid = box.getAttribute('data-oid');
    var o = all.filter(function (x) { return x.id === oid && x !== c; })[0] || all.filter(function (x) { return x !== c; })[0] || { name: '相手', id: '', gender: '' };
    return { c: c, o: o };
  }
  function draw(box) {
    if (!box.open) return;
    var co = charsOf(box), rows = box.querySelector('.tl-rows');
    if (!co || !rows) return;
    var ol = rows.querySelector('ol'), y = ol ? ol.scrollTop : 0;
    rows.innerHTML = rowsHtml(co.c, co.o);
    ol = rows.querySelector('ol'); if (ol) ol.scrollTop = y;
  }
  var timer = null;
  L.refreshAll = function () {
    if (typeof document === 'undefined') return;
    if (timer) clearTimeout(timer);
    timer = setTimeout(function () { timer = null; Array.prototype.forEach.call(document.querySelectorAll('.tlab'), draw); }, 300);
  };
  if (typeof document !== 'undefined') {
    document.addEventListener('toggle', function (ev) {
      var d = ev.target;
      if (!d || !d.classList || !d.classList.contains('tlab')) return;
      ST.open[d.getAttribute('data-cid') || ''] = d.open;
      if (d.open) draw(d);
    }, true);
    var act = function (ev) {
      var t = ev.target, a = t && t.getAttribute && t.getAttribute('data-tlact');
      if (!a) return;
      var box = t.closest('.tlab');
      if (a === 'next') { if (ev.type !== 'click') return; ST.page++; }
      else if (ev.type !== 'change') return;
      else if (a === 'cat') { ST.cat = t.value; ST.page = 0; }
      else if (a === 'all' || a === 'before' || a === 'three' || a === 'why') { ST[a] = t.checked; save(); }
      ev.stopPropagation();
      /* 同じ住人の箱が二つ（⚙設定と住人タブ）あっても、表示の切り替えはそろえる */
      Array.prototype.forEach.call(document.querySelectorAll('.tlab'), function (b) {
        if (b !== box) b.querySelectorAll('[data-tlact]').forEach(function (x) { var k = x.getAttribute('data-tlact'); if (k === 'cat') x.value = ST.cat; else if (x.type === 'checkbox') x.checked = !!ST[k]; });
        draw(b);
      });
    };
    document.addEventListener('click', act, true);
    document.addEventListener('change', act, true);
  }
})();
