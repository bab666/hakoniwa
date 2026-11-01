/* 箱庭シミュレーター: 話題（利用者が登録した語を、交流・独り・結末などの出来事に時々出す）
   データ（住人タブ「話題」の節 ui-topics.js が S.topics に保存し、buildInput が input.topics に写す）：
     { id, scope, scen, group, a, b, kind, word, note }
     scope：'all' 全体／'scen' 箱庭ごと（scen=箱庭 id）／'group' グループ（group=グループ名）／'char' 住人（a=住人 id）／'pair' 住人どうし（a,b=住人 id。順不同）
     kind：KINDS の鍵（食べ物・人・物・こと・場所・作品・趣味・好きなもの・嫌いなこと）
     word：語（24字まで）、note：補足（40字まで。任意）
   実行時の口は HK.Topics.*（下）。語は利用者の入力なので、文に入れるときはそのまま（HTML の逃がしは表示側）。 */
(function () {
  'use strict';
  var HK = window.HK;
  if (!HK) return;
  var T = HK.Topics = HK.Topics || {};
  T.KINDS = [['food', '食べ物'], ['person', '人'], ['thing', '物'], ['koto', 'こと'], ['place', '場所'], ['work', '作品'], ['hobby', '趣味'], ['like', '好きなもの'], ['hate', '嫌いなこと']];
  T.SCOPES = [['all', '全体'], ['scen', '箱庭ごと'], ['group', 'グループ'], ['char', '住人'], ['pair', '住人どうし']];
  T.MAX = 300; T.WORD_LEN = 24; T.NOTE_LEN = 40;
  function has(list, k) { for (var i = 0; i < list.length; i++) if (list[i][0] === k) return true; return false; }
  function str(v, n) { return String(v == null ? '' : v).replace(/[\r\n\t]+/g, ' ').trim().slice(0, n); }
  /* 1件を整える（壊れていれば null）。UI の保存・読み込み・一括入力と、input の受け取りの両方で使う */
  T.norm = function (t) {
    if (!t || typeof t !== 'object') return null;
    var o = { id: str(t.id, 24) || ('t' + Math.random().toString(36).slice(2, 8)), scope: has(T.SCOPES, t.scope) ? t.scope : 'all',
      scen: str(t.scen, 32), group: str(t.group, 40), a: str(t.a, 32), b: str(t.b, 32), kind: has(T.KINDS, t.kind) ? t.kind : 'koto',
      word: str(t.word, T.WORD_LEN), note: str(t.note, T.NOTE_LEN) };
    if (!o.word) return null;
    if (o.scope === 'scen' && !o.scen) return null;
    if (o.scope === 'group' && !o.group) return null;
    if (o.scope === 'char' && !o.a) return null;
    if (o.scope === 'pair' && (!o.a || !o.b || o.a === o.b)) return null;
    if (o.scope !== 'scen') o.scen = ''; if (o.scope !== 'group') o.group = ''; if (o.scope !== 'char' && o.scope !== 'pair') o.a = ''; if (o.scope !== 'pair') o.b = '';
    return o;
  };
  T.kindLabel = function (k) { for (var i = 0; i < T.KINDS.length; i++) if (T.KINDS[i][0] === k) return T.KINDS[i][1]; return ''; };
  T.scopeLabel = function (k) { for (var i = 0; i < T.SCOPES.length; i++) if (T.SCOPES[i][0] === k) return T.SCOPES[i][1]; return ''; };
})();

/* ================= 実行時（担当TB。2026-11-01） =================
   ■ 口（x はエンジン型の ctx（engine.js の Ctx。x.input.topics）か、物語型の S（HK.Story。ST.state の包みが入力の話題を覚える））
     list(x)：この回で生きている話題（全体／今の箱庭／配役の誰かのグループ／配役にいる住人・住人どうし）。住人は input.chars[i].id、グループは input.chars[i].group（読点・カンマ区切り）で引く
     forChar(x, a)：a が持ち出せる話題。shared(x, a, b)：二人に合う話題（重さは weight：住人どうし 5 ＞ 二人とも同じグループ 3 ＞ 住人 2 ＞ 箱庭 1.5 ＞ 片方のグループ 1.2 ＞ 全体 1）
     pick(x, a, b|null, { kinds })：重み付きで 1 件（{ word, note, kind, scope, owner }。直近に出た語は避ける）。pair2(x, a, b)：違う語の 2 件。
     conflict(x, a, b)：一方の「好きなもの」と他方の「嫌いなこと」が同じ語（{ word, liker, hater }）。phrase(t, form)：種類に合う言い回し
   ■ 乱数は x.rng だけ（結果は種で決まる）。話題が 1 件も無い回では、何も覚えず乱数も引かない（今までの結果と同じ）
   ■ 出来事（HK.COMMON）：二人 10 種（好き嫌いが割れて言い合う 1 種を含む）・不仲の組 1 種・独り 6 種・三人 2 種と、雑談（talk）に話題の一文を添える包み。
     頻度は T.RATE（重み）と T.SCEN_K（箱庭ごとの倍率）。話題を 3〜5 件登録した 6 人の配役で、語の出る記録が 5〜10% になるようにしてある
     物語型（宇宙船・RPG は区切りの見出しの後、邪神村・吹雪の館・人狼は HateKit.storyTick の番）で、話題のひと言を記録に一つ（低い頻度）
   ■ 語は利用者の入力なので、文の中では名詞として扱える形（「{w}の話」「{w}のこと」）にする。「」｜{} など文の組み立てを壊す文字は置き換える
   ■ 性的な文・死・残酷は書かない（全年齢版と同じ中身）。初対面・知り合いの前提の語（初めて会った・久しぶり・連絡先 など）は使わない */
/* @event scen=ship,rpg,jashin,yakata,jinro id=tp_story cat=交流 tie=- label=登録した話題でひと言交わす */
(function () {
  'use strict';
  var HK = window.HK, T = HK && HK.Topics;
  if (!T || !HK.COMMON || !HK.addTo || !HK.wrap) return;
  var EMPTY = [];
  /* 頻度の調整（話題を 3〜5 件登録した 6 人の配役で、語の出る出来事が 5〜10% になるように） */
  T.RATE = { pair: 0.5, solo: 0.3, group: 0.4, sour: 0.4, clash: 0.7, talk: 0.5, step: 0.45, tick: 0.3, damp: 0.5 };
  /* 箱庭ごとの倍率（出来事の数や重みの違いをならす。物語型の step・tick にも掛ける） */
  T.SCEN_K = { omega: 0.35, island: 1.4, zombie: 1.4, goukon: 1.1, br: 0.8, jashin: 2, rpg: 0.4, jinro: 2.5 };
  function sk(x) { var k = x && x.scen && T.SCEN_K[x.scen.id]; return k == null ? 1 : k; }
  function def(o, k, v) { Object.defineProperty(o, k, { value: v, writable: true, configurable: true, enumerable: false }); return v; }
  /* 文の組み立てを壊す文字を置き換える（台詞の 3 本の区切り・かぎかっこ・差し込みの印・話し手の印） */
  function clean(s) {
    return String(s == null ? '' : s).replace(/[｜|]/g, '／').replace(/「/g, '『').replace(/」/g, '』').replace(/\{/g, '｛').replace(/\}/g, '｝')
      .replace(/＠/g, '@').replace(/[⁠-]/g, '').trim();
  }
  T.clean = clean;
  function grpOf(c) { var g = []; String((c && c.group) || '').split(/[,，、]/).forEach(function (s) { s = s.trim(); if (s && g.indexOf(s) < 0) g.push(s); }); return g; }
  function castOf(x) { return (x && (x.chars || x.P)) || []; }
  function inpOf(x) { return x ? x.input || x._tpInput || null : null; }
  T.list = function (x) {
    if (!x) return EMPTY;
    if (x._tpL) return x._tpL;
    var I = inpOf(x), raw = I && Array.isArray(I.topics) ? I.topics : null;
    if (!raw || !raw.length) return EMPTY;
    var src = I.chars || [], C = castOf(x), idx = {}, grp = {}, sid = x.scen ? x.scen.id : '', out = [];
    src.forEach(function (c, i) {
      var p = C[i]; if (!c || !p) return;
      if (c.id != null && c.id !== '') idx[String(c.id)] = p;
      grpOf(c).forEach(function (g) { (grp[g] = grp[g] || []).push(p); });
    });
    raw.forEach(function (r) {
      var t = r && r.word ? T.norm({ id: 'x', scope: r.scope, scen: r.scen, group: r.group, a: r.a, b: r.b, kind: r.kind, word: r.word, note: r.note }) : null;
      if (!t) return;
      var o = { word: clean(t.word), note: clean(t.note), kind: t.kind, scope: t.scope, mem: null, group: '' };
      if (!o.word) return;
      if (t.scope === 'scen') { if (t.scen !== sid) return; }
      else if (t.scope === 'group') { if (!grp[t.group]) return; o.mem = grp[t.group]; o.group = t.group; }
      else if (t.scope === 'char') { if (!idx[t.a]) return; o.mem = [idx[t.a]]; }
      else if (t.scope === 'pair') { var p1 = idx[t.a], p2 = idx[t.b]; if (!p1 || !p2 || p1 === p2) return; o.mem = [p1, p2]; }
      out.push(o);
    });
    return def(x, '_tpL', out);
  };
  T.has = function (x) { return T.list(x).length > 0; };
  function on(o, c) { return !o.mem || o.mem.indexOf(c) >= 0; }
  T.forChar = function (x, a) { return T.list(x).filter(function (o) { return on(o, a); }); };
  /* 二人の場面での重さ（0 なら二人の話題ではない） */
  T.weight = function (o, a, b) {
    if (!b) return o.scope === 'char' ? 2 : o.scope === 'group' || o.scope === 'scen' ? 1.5 : 1;
    var ia = on(o, a), ib = on(o, b);
    if (o.scope === 'pair') return ia && ib ? 5 : 0;
    if (o.scope === 'group') return ia && ib ? 3 : ia || ib ? 1.2 : 0;
    if (o.scope === 'char') return ia || ib ? 2 : 0;
    return o.scope === 'scen' ? 1.5 : 1;
  };
  T.shared = function (x, a, b) { return T.list(x).filter(function (o) { return T.weight(o, a, b) > 0; }); };
  function kindOk(o, kinds) { return !kinds || kinds.indexOf(o.kind) >= 0; }
  T.avail = function (x, a, b, kinds) {
    var L = T.list(x);
    for (var i = 0; i < L.length; i++) if (kindOk(L[i], kinds) && (b ? T.weight(L[i], a, b) > 0 : on(L[i], a))) return true;
    return false;
  };
  function recent(x) { return x._tpRec || def(x, '_tpRec', []); }
  function remember(x, w) { var r = recent(x); r.push(w); if (r.length > 2) r.shift(); }
  function owner(o) { return o.scope === 'char' ? o.mem[0] : o.scope === 'pair' ? o.mem.slice() : o.scope === 'group' ? o.group : null; }
  /* side：その話題を持ち出す側（'a'／'b'／'both'。住人・グループの話題で、持ち主が二人のうち片方だけなら、その人） */
  function out(o, a, b) {
    var side = 'both';
    if (b && o.mem && (o.scope === 'char' || o.scope === 'group')) { var ia = on(o, a), ib = on(o, b); side = ia && !ib ? 'a' : ib && !ia ? 'b' : 'both'; }
    return { word: o.word, note: o.note, kind: o.kind, scope: o.scope, owner: owner(o), side: side };
  }
  T.pick = function (x, a, b, opts) {
    var kinds = opts && opts.kinds, not = ((opts && opts.not) || []).slice();
    /* 二人で好き嫌いが割れる語は、意見が割れる場面（conflict）だけで使う */
    if (b && !(opts && opts.clash)) { var cf = T.conflict(x, a, b); if (cf) not.push(cf.word); }
    var c = (b ? T.shared(x, a, b) : T.forChar(x, a)).filter(function (o) { return kindOk(o, kinds) && not.indexOf(o.word) < 0; });
    if (!c.length) return null;
    var r = recent(x), fresh = c.filter(function (o) { return r.indexOf(o.word) < 0; });
    if (fresh.length) c = fresh;
    var o = c.length === 1 ? c[0] : HK.weighted(x.rng, c, function (y) { return T.weight(y, a, b); });
    if (!o) return null;
    if (!(opts && opts.peek)) remember(x, o.word);
    return out(o, a, b);
  };
  T.pair2 = function (x, a, b) {
    var L = T.shared(x, a, b), seen = {};
    if (L.filter(function (o) { if (seen[o.word]) return false; seen[o.word] = 1; return true; }).length < 2) return null;
    var t1 = T.pick(x, a, b); if (!t1) return null;
    var t2 = T.pick(x, a, b, { not: [t1.word] });
    return t2 ? [t1, t2] : null;
  };
  T.conflict = function (x, a, b) {
    var L = T.list(x);
    for (var i = 0; i < L.length; i++) {
      var o = L[i]; if (o.kind !== 'like') continue;
      for (var j = 0; j < L.length; j++) {
        var h = L[j]; if (h.kind !== 'hate' || h.word !== o.word) continue;
        if (on(o, a) && !on(h, a) && on(h, b) && !on(o, b)) return { word: o.word, note: o.note || h.note, liker: a, hater: b };
        if (on(o, b) && !on(h, b) && on(h, a) && !on(o, a)) return { word: o.word, note: o.note || h.note, liker: b, hater: a };
      }
    }
    return null;
  };
  /* 種類に合う言い回し（{w} に語）。form：番号（その番目）／'list'（全部の並び）／省略（いちばん素直な形） */
  var PHR = {
    food: ['{w}の話', '{w}の味の話', '{w}を食べに行く話', 'おいしい{w}の話'],
    person: ['{w}の話', '{w}の噂', '{w}にまつわる話'],
    thing: ['{w}の話', '{w}の使い道の話'],
    koto: ['{w}の話', '{w}についての話'],
    place: ['{w}の話', '{w}に行った話', 'いつか{w}に行きたいという話'],
    work: ['{w}の話', '{w}の感想', '{w}のどこが良いかという話'],
    hobby: ['{w}の話', '{w}のコツの話'],
    like: ['{w}の話', '{w}が好きだという話'],
    hate: ['{w}が苦手だという愚痴', '{w}が嫌いだという愚痴']
  };
  T.phrase = function (t, form) {
    var L = PHR[t && t.kind] || PHR.koto, w = t ? clean(t.word) : '';
    if (form === 'list') return L.map(function (s) { return s.replace(/\{w\}/g, w); });
    var i = typeof form === 'number' ? Math.abs(form) % L.length : 0;
    return L[i].replace(/\{w\}/g, w);
  };

  /* ---------- 文（{a}{b}{c}：住人、{w}：語、{W}：語（補足があれば時々「（補足）」を添える）、{w2}：二つ目の語、{p}：言い回し） ---------- */
  var TX = {
    match: [
      '{a}が何気なく{W}の名前を出すと、{b}の顔がぱっと明るくなった。そこから先は、二人とも話が止まらなかった。気づけば、ずいぶん長い時間が経っていた。',
      '{a}と{b}は、{p}で妙に意気投合した。話せば話すほど、好みの細かいところまで一致していった。最後には、二人で顔を見合わせて笑った。',
      '{a}「{w}、いいよね｜{w}は、いいな｜{w}、いいですよね」――{b}は思わず身を乗り出した。そこから二人は、{w}のどこが良いのかを夢中で語り合った。話が途切れる気配はなかった。',
      '{p}になると、{b}の口数が急に増えた。{a}もつられて、いつもより饒舌になった。{w}という一語だけで、二人の話はどこまでも転がっていった。'
    ],
    food: [
      '{a}と{b}は、{W}の話で盛り上がった。どう食べるのがいちばんおいしいか、話は尽きなかった。話しているうちに、二人ともお腹が空いてきた。',
      '{a}「{w}、食べたいな｜{w}が食べたいな｜{w}、食べたいですね」――{a}のひと言に、{b}も深く頷いた。二人は{w}の好きな食べ方を言い合った。想像しただけで、ますますお腹が鳴った。',
      '{b}が{w}の話を出すと、{a}は待っていたとばかりに語り出した。好きな味、好きな食べ方、忘れられない一皿。{b}は聞きながら、次に{w}を食べる日のことを考えていた。'
    ],
    link: [
      '{a}と{b}は、{w}と{w2}の意外な関係について盛り上がった。最初は冗談のつもりだったのに、話すうちに妙に筋が通ってきた。二人とも、最後には本気で感心していた。',
      '{a}「{w}と{w2}って、実は似てると思う｜{w}と{w2}は、実は似ていると思う｜{w}と{w2}って、実は似ていると思うんです」――{a}が言い出すと、{b}は笑いかけて、途中で考え込んだ。やがて二人は、{w}と{w2}の共通点を次々に挙げ始めた。思いのほか、たくさん見つかった。',
      '{w}の話をしていたはずが、いつの間にか{w2}の話になっていた。{a}がそのつながりを説明すると、{b}は感心したように頷いた。二人は、思わぬ話の広がりを面白がった。'
    ],
    grumble: [
      '{a}が{p}を始めると、{b}も「分かる｜分かる｜分かります」と大きく頷いた。二人とも、{w}には言いたいことが山ほどあった。ひとしきり愚痴をこぼし合うと、妙にすっきりした顔になっていた。',
      '{a}と{b}は、{w}がどれほど苦手かを競うように語り合った。話が大げさになるたびに、どちらからともなく吹き出した。苦手なものが同じというだけで、不思議と気が合った。',
      '{b}が{w}の話を出すと、{a}は露骨に顔をしかめた。それを見た{b}は、実は自分も苦手だと打ち明けた。二人はそこから、{w}への不満で大いに盛り上がった。'
    ],
    grumble1: [
      '{a}が{p}を始めると、{b}は苦笑いしながら最後まで付き合った。{a}の話しぶりからは、{w}への積年の恨みがにじんでいた。言うだけ言うと、{a}は少しすっきりした顔になった。',
      '{a}「{w}だけは、どうしても苦手で｜{w}だけは、どうしても苦手だ｜{w}だけは、どうしても苦手なんです」――{a}がこぼすと、{b}は意外そうに目を瞬かせた。{b}は茶化さずに、{a}の話にじっと耳を傾けた。話し終えた{a}は、少し照れくさそうに笑った。',
      '{w}の話が出た途端、{a}の顔が曇った。{b}が理由を尋ねると、{a}は苦手な理由をとうとうと語り出した。{b}は相づちを打ちながら、その熱量に少し笑ってしまった。'
    ],
    rumor: [
      '{a}は{b}に、{W}にまつわる話を小声で聞かせた。{b}は相づちを打ちながら、最後まで聞き入った。話が終わるころには、二人とも{w}のことが少し気になり始めていた。',
      '{a}と{b}のあいだで、なぜか{w}の噂が話題になった。二人は知っていることを出し合ったが、話はかみ合ったり、かみ合わなかったりした。それでも、話している二人は楽しそうだった。',
      '{a}が{w}のことを話し始めると、{b}は興味深そうに耳を傾けた。{a}の話しぶりには、{w}への思いがにじんでいた。{b}は、その横顔を少し意外そうに眺めた。'
    ],
    invite: [
      '{a}は{b}に、{W}の話をした。話しているうちに、いつか一緒に行ってみようという流れになった。{b}は笑って、その話に乗った。',
      '{a}「いつか、{w}に行ってみたいな｜いつか、{w}に行ってみたいものだ｜いつか、{w}に行ってみたいです」――{a}がそう言うと、{b}も「いいね、行こう｜いいな、行こう｜いいですね、行きましょう」と返した。具体的な日取りは決まらなかった。それでも、二人の顔は明るかった。',
      '{w}の話になると、{a}は身振りを交えて、その場所の様子を語った。{b}は話を聞きながら、その景色を思い浮かべた。いつか自分の目でも見てみたいと、{b}は思った。'
    ],
    show: [
      '{a}は{b}に、{W}のことを熱心に説明した。手振りで形や大きさまで示してみせた。{b}はその熱の入りように、思わず笑ってしまった。',
      '{a}と{b}は、{w}の使い道について話し込んだ。{b}の思いつきに、{a}は感心したように何度も頷いた。話は意外なほど弾んだ。',
      '{a}「機会があったら、{w}を貸すよ｜機会があれば、{w}を貸そう｜機会があったら、{w}をお貸ししますね」――{a}がそう約束すると、{b}は少し驚いてから、素直に礼を言った。二人のあいだに、小さな約束が一つ増えた。{b}は、その日を少し楽しみにした。'
    ],
    teach: [
      '{a}は{b}に、{W}のコツを教えた。{b}は最初こそ戸惑っていたが、すぐに飲み込みの良さを見せた。{a}はうれしそうに、次から次へと話を続けた。',
      '{a}が{w}の話をすると、{b}は「やってみたい｜やってみたいな｜やってみたいです」と目を輝かせた。{a}は張り切って、始め方から丁寧に説明した。二人の話は、思いのほか長く続いた。',
      '{a}と{b}は、{w}の話でひとしきり盛り上がった。お互いのやり方の違いを話すうちに、話はますます弾んだ。{b}は、楽しそうに話す{a}の横顔をしばらく眺めていた。'
    ],
    debate: [
      '{a}と{b}は、{W}について語り合った。考え方は少しずつ違ったが、それがかえって面白かった。気づけば、話はずいぶん深いところまで進んでいた。',
      '{a}が{w}のことを持ち出すと、{b}は少し考えてから自分の意見を口にした。{a}はうなずきつつ、別の見方を返した。二人の話は、意外なほど真剣なものになった。',
      '{a}「{w}のこと、どう思う？｜{w}のことを、どう思う？｜{w}のこと、どう思いますか？」――{b}はしばらく言葉を探してから、ゆっくり答えた。{a}はその答えに、感心したように頷いた。二人はそのまま、{w}の話を続けた。'
    ],
    clash: [
      '{a}が{w}の良さを語り始めると、{b}は露骨に顔をしかめた。{b}にとって、{w}はどうしても好きになれないものだった。二人の意見は平行線のまま、話は終わった。',
      '{a}「{w}の、何がそんなに嫌なの？｜{w}の、何がそんなに嫌なんだ？｜{w}の、何がそんなに嫌なんですか？」――{b}は答える代わりに、苦手な理由を一つずつ挙げた。{a}はそのたびに言い返した。どちらも一歩も引かなかった。',
      '{w}をめぐって、{a}と{b}の好みはきっぱり分かれた。{a}は好きだと言い張り、{b}は苦手だと譲らなかった。言い合いは小さなものだったが、少しだけ気まずさが残った。'
    ],
    sour: [
      '{a}が{w}の話を振ったが、{b}は素っ気なく聞き流した。{a}が言葉を重ねるほど、{b}の返事は短くなった。話はそれきり、続かなかった。',
      '{b}は、{a}の{w}の話に皮肉で返した。{a}はむっとして口をつぐんだ。二人のあいだの空気が、また少し冷えた。',
      '{w}の話になると、{a}と{b}は珍しく同じ意見だった。それに気づいた二人は、気まずそうに目をそらした。張り合う相手と好みが同じなのは、どうにも落ち着かなかった。'
    ],
    crowd: [
      '{a}が{W}の話を出すと、{b}と{c}もすぐに乗ってきた。三人はそれぞれ知っていることを出し合って、何度も笑い声を上げた。話の輪は、なかなか解けなかった。',
      '{w}の話題で、{a}・{b}・{c}の三人は大いに盛り上がった。{b}がひと言足すたびに、{c}が大げさに反応した。{a}は二人のやりとりを見て、楽しそうに笑った。',
      '{a}・{b}・{c}の三人は、{p}で意外なほど話が弾んだ。誰かが話し終えるたびに、別の誰かが続きを引き取った。気づけば、ずいぶん長いこと話し込んでいた。'
    ],
    lost: [
      '{a}と{b}が{w}の話で盛り上がるなか、{c}だけは話についていけなかった。{c}は曖昧に笑いながら、二人の顔を交互に見ていた。それに気づいた{a}が、慌てて{w}のことを説明し始めた。',
      '{a}と{b}は、{w}の細かい話に夢中になっていた。{c}は相づちを打とうとしたが、どこで打てばいいのか分からなかった。{c}はそっと、二人から目をそらした。',
      '{w}の話になった途端、{a}と{b}の口調が熱を帯びた。取り残された{c}は、苦笑いするしかなかった。それでも、楽しそうな二人を見ているのは悪い気分ではなかった。'
    ],
    /* 独り（{a}） */
    crave: [
      '{a}は、ふと{W}が食べたくなった。一度そう思うと、頭から離れなかった。{a}は小さくため息をついて、気を紛らわせようとした。',
      '{a}の頭に、なぜか{w}の味がよみがえった。お腹が小さく鳴った。{a}は聞こえていないことを確かめて、そっとお腹を押さえた。',
      '{a}「{w}、食べたいな｜{w}が食べたいな｜{w}、食べたいです」――{a}はひとりごとのようにつぶやいた。口に出すと、ますます食べたくなった。{a}は苦笑いして、考えるのをやめた。'
    ],
    recall: [
      '{a}は、{W}のことを思い出していた。思い出すだけで、自然と口元がゆるんだ。少しだけ、気持ちが軽くなった。',
      'ひと息ついたとき、{a}の頭に{w}のことが浮かんだ。{a}はしばらく、そのことを考えて過ごした。張りつめていた気持ちが、少しほどけた。',
      '{a}は、{w}のことを考えて時間をつぶした。好きなものの話なら、いくらでも考えていられた。{a}は少しだけ、元気を取り戻した。'
    ],
    person: [
      '{a}は、ふと{W}のことを思い出した。今ごろどうしているだろうと、ぼんやり考えた。{a}は小さく息をついて、気持ちを切り替えた。',
      'ひと息ついたとき、{a}の頭に{w}の顔が浮かんだ。思い出すと、少しだけ心が温かくなった。{a}は、その気持ちをそっと胸にしまった。',
      '{a}は、{w}にまつわる話を思い返していた。思い出すたびに、小さく笑ってしまう話だった。{a}の表情が、少しやわらいだ。'
    ],
    irk: [
      '{a}は、ふとしたきっかけで{W}のことを思い出してしまった。一度思い出すと、なかなか頭から離れなかった。{a}はしばらく、むすっとした顔をしていた。',
      '{a}の機嫌が、目に見えて悪くなった。どうやら、{w}を連想させる何かがあったらしい。{a}は眉間にしわを寄せたまま、黙り込んだ。',
      '{a}「{w}だけは、本当に無理｜{w}だけは、本当に無理だ｜{w}だけは、本当に無理です」――{a}はひとりごとのようにぼやいた。言ってしまうと、少しだけすっきりした。それでも、しばらく機嫌は直らなかった。'
    ],
    dream: [
      '{a}は、{W}のことを思い浮かべていた。その場所の空気や景色が、目の前に広がるような気がした。いつか行けたら、と{a}は思った。',
      '{a}はぼんやりと、{w}のことを考えていた。そこで何をしようか、思いつくままに並べてみた。考えているあいだだけは、今いる場所のことを忘れられた。',
      '{a}「{w}に行きたいな｜{w}に行きたいものだ｜{w}に行きたいです」――{a}は小さくつぶやいた。言葉にすると、その思いは少し強くなった。{a}は、いつかの楽しみとして胸にしまった。'
    ],
    reread: [
      '{a}は、{W}の好きな場面を頭の中でなぞっていた。何度も思い返した場面なのに、まだ胸が熱くなった。{a}は小さく笑みを浮かべた。',
      'ふとした拍子に、{a}は{w}のことを思い出した。あの続きはどうなるのか、あれこれと想像をめぐらせた。気づけば、すっかり夢中になっていた。',
      '{a}は、{w}の感想を誰かと話したくてたまらなくなった。けれど、今はその相手が見つからなかった。{a}は感想を胸の中で何度も言い直した。'
    ],
    ponder: [
      '{a}は、{W}のことを考え込んでいた。考えれば考えるほど、分からないことが増えていった。{a}は首をかしげたまま、しばらく動かなかった。',
      '{a}の頭の片隅に、{w}のことがずっと引っかかっていた。{a}はそれについて、自分なりに考えをまとめてみた。少しだけ、すっきりした気がした。',
      '手が空いたとき、{a}は{w}について思いをめぐらせた。答えが出ないと分かっていても、考えずにはいられなかった。{a}は小さく息をついた。'
    ],
    /* 雑談（talk）に添える一文 */
    talk: ['話題は、{p}だった。', '途中から、なぜか{p}になった。', '{p}になると、二人とも少し口数が増えた。']
  };
  T.TEXT = TX;
  /* 種類ごとの、二人の場面・独りの場面の文の表（物語型でも使う） */
  var PAIR_OF = { food: 'food', like: 'match', hobby: 'teach', work: 'match', thing: 'show', hate: 'grumble', person: 'rumor', place: 'invite', koto: 'debate' };
  var SOLO_OF = { food: 'crave', like: 'recall', hobby: 'recall', work: 'reread', thing: 'ponder', hate: 'irk', person: 'person', place: 'dream', koto: 'ponder' };
  T.PAIR_OF = PAIR_OF; T.SOLO_OF = SOLO_OF;

  function pickOf(x, arr) { return x.pick && x.R ? x.pick(arr) : HK.Story && HK.Story.pick ? HK.Story.pick(x, arr) : arr[Math.floor(x.rng() * arr.length)]; }
  /* {w}{W}{w2}{p} を埋める（{a}{b}{c} はあとで ctx.t か名前で） */
  function fill(x, s, t, t2) {
    var w = t.word, W = w;
    if (t.note && /\{W\}/.test(s) && x.rng() < 0.35) W = w + '（' + t.note + '）';
    var p = /\{p\}/.test(s) ? pickOf(x, T.phrase(t, 'list')) : '';
    return s.replace(/\{W\}/g, W).replace(/\{w2\}/g, t2 ? t2.word : '').replace(/\{p\}/g, p).replace(/\{w\}/g, w);
  }
  function names(s, a, b, c) { return s.replace(/\{a\}/g, a ? a.name : '').replace(/\{b\}/g, b ? b.name : '').replace(/\{c\}/g, c ? c.name : ''); }
  T.fill = fill;

  /* 不仲・恐怖・無関心の組（仲良く話題で盛り上がる文は出さない） */
  function bad(x, a, b) {
    if (!a || !b) return false;
    var l = x.tiesAll && HK.Ties && HK.Ties.all ? HK.Ties.all(x, a, b) : (Array.isArray(x.ties) ? x.ties : []).filter(function (t) { return t && ((t.a === a.i && t.b === b.i) || (t.a === b.i && t.b === a.i)); });
    for (var i = 0; i < l.length; i++) {
      var t = l[i], D = HK.TIES && HK.TIES[t.type];
      if ((D && D.hate) || t.cold === 'bad' || t.kg === 'bad' || /^(?:fear|apathy|sibbad|bad|enemy|rival)$/.test(t.type)) return true;
    }
    if (x.R) { var r1 = x.R(a, b), r2 = x.R(b, a); if ((r1 && r1.aff < -20) || (r2 && r2.aff < -20) || (r1 && r2 && (r1.ten + r2.ten) / 2 > 60)) return true; }
    return false;
  }
  T.bad = bad;
  /* 同じ区切りに話題の出来事が続かないように（区切りごとの回数） */
  function damp(ctx) { var s = ctx._tpStep; return (s && s.s === ctx.stepIndex ? Math.pow(T.RATE.damp, s.n) : 1) * sk(ctx); }
  function count(ctx) { var s = ctx._tpStep; if (!s || s.s !== ctx.stepIndex) s = def(ctx, '_tpStep', { s: ctx.stepIndex, n: 0 }); s.n++; }
  function why(a, b, t, c) { return (b ? a.name + 'と' + b.name + (c ? 'と' + c.name : '') : a.name) + 'の話題（' + T.kindLabel(t.kind) + '：' + t.word + '）'; }
  function tr(c) { return c.tr || {}; }

  /* ---------- 二人の場面 ---------- */
  function pairEv(id, label, kinds, key, fx, wk) {
    return {
      id: id, label: label, cat: 'bond', scope: 'pair', tie: '-', noOdd: true,
      when: function (ctx, a, b) { return !!b && T.has(ctx) && T.avail(ctx, a, b, kinds) && !bad(ctx, a, b); },
      w: function (ctx, a) { var q = tr(a); return T.RATE.pair * (wk || 1) * (0.5 + (q.warmth || 0.5) * 0.6 + (q.fc || 0.5) * 0.4) * damp(ctx); },
      run: function (ctx, a, b) {
        var t = T.pick(ctx, a, b, { kinds: kinds }); if (!t) return null;
        var tbl = typeof key === 'function' ? key(t) : key;
        /* 持ち出すのは話題の持ち主（片方だけの話題なら、その人を文の {a} に）。苦手なものが片方だけなら、愚痴を聞いてもらう文 */
        var x = t.side === 'b' ? b : a, y = x === a ? b : a;
        if (tbl === 'grumble' && t.side !== 'both') tbl = 'grumble1';
        ctx.mod2(a, b, fx[0], fx[1]); count(ctx);
        return { text: ctx.t(fill(ctx, ctx.pick(TX[tbl]), t), x, y), why: why(x, y, t), mag: 6 };
      }
    };
  }
  var FX = [{ aff: 4, trust: 2 }, { aff: 4, trust: 2 }];
  var EV = [
    pairEv('tp_match', '好きなものの話題で意気投合', ['like', 'work', 'hobby', 'food'], 'match', [{ aff: 5, trust: 2 }, { aff: 5, trust: 2 }], 1.2),
    pairEv('tp_food', '食べ物の話題でお腹が空く', ['food'], 'food', FX),
    pairEv('tp_grumble', '苦手なものの愚痴で盛り上がる', ['hate'], 'grumble', [{ aff: 4, trust: 3 }, { aff: 4, trust: 3 }]),
    pairEv('tp_rumor', '人の噂や思い出話をする', ['person'], 'rumor', [{ aff: 3, trust: 3 }, { aff: 3, trust: 2 }]),
    pairEv('tp_invite', '話題の場所にいつか行こうと誘う', ['place'], 'invite', [{ aff: 4, trust: 2 }, { aff: 4, trust: 2 }]),
    pairEv('tp_show', '話題の物を説明したり貸す約束をする', ['thing', 'work'], 'show', FX, 0.8),
    pairEv('tp_teach', '趣味のコツを教える', ['hobby'], 'teach', [{ aff: 3, trust: 3 }, { aff: 4, trust: 3 }]),
    pairEv('tp_debate', '話題について真剣に語り合う', ['koto', 'thing'], 'debate', [{ aff: 3, trust: 4 }, { aff: 3, trust: 4 }]),
    {
      id: 'tp_link', label: '二つの話題の関係で盛り上がる', cat: 'bond', scope: 'pair', tie: '-', noOdd: true,
      when: function (ctx, a, b) { return !!b && T.has(ctx) && !bad(ctx, a, b) && T.shared(ctx, a, b).length >= 2; },
      w: function (ctx, a) { var q = tr(a); return T.RATE.pair * 0.7 * (0.5 + (q.fc || 0.5) * 0.8) * damp(ctx); },
      run: function (ctx, a, b) {
        var p = T.pair2(ctx, a, b); if (!p) return null;
        ctx.mod2(a, b, { aff: 4, trust: 2 }, { aff: 4, trust: 2 }); count(ctx);
        return { text: ctx.t(fill(ctx, ctx.pick(TX.link), p[0], p[1]), a, b), why: a.name + 'と' + b.name + 'の話題（' + p[0].word + '・' + p[1].word + '）', mag: 6 };
      }
    },
    {
      id: 'tp_clash', label: '好き嫌いが分かれて言い合う', cat: 'conflict', scope: 'pair', tie: '-', noOdd: true,
      when: function (ctx, a, b) { return !!b && T.has(ctx) && !!T.conflict(ctx, a, b); },
      w: function (ctx, a) { var q = tr(a); return T.RATE.clash * (0.4 + (q.cp || 0.5) * 0.6 + (q.fc || 0.5) * 0.3) * damp(ctx); },
      run: function (ctx, a, b) {
        var c = T.conflict(ctx, a, b); if (!c) return null;
        remember(ctx, c.word);
        ctx.mod2(a, b, { ten: 6, aff: -1 }, { ten: 6, aff: -1 }); count(ctx);
        return { text: ctx.t(fill(ctx, ctx.pick(TX.clash), c), c.liker, c.hater), why: c.liker.name + 'の好きな' + c.word + 'が、' + c.hater.name + 'には苦手なもの（話題）', mag: 6 };
      }
    },
    {
      id: 'tp_sour', label: '不仲の相手と話題が噛み合わない', cat: 'conflict', scope: 'pair', tie: '-', noOdd: true,
      when: function (ctx, a, b) { return !!b && T.has(ctx) && bad(ctx, a, b) && T.avail(ctx, a, b); },
      w: function (ctx) { return T.RATE.sour * damp(ctx); },
      run: function (ctx, a, b) {
        var t = T.pick(ctx, a, b); if (!t) return null;
        ctx.mod2(a, b, { ten: 4 }, { ten: 4 }); count(ctx);
        var x = t.side === 'b' ? b : a, y = x === a ? b : a;
        return { text: ctx.t(fill(ctx, ctx.pick(TX.sour), t), x, y), why: why(x, y, t) + '。不仲の二人では話が噛み合わない', mag: 5 };
      }
    }
  ];
  /* ---------- 独りの場面 ---------- */
  function soloEv(id, label, kinds, fx) {
    return {
      id: id, label: label, cat: 'solo', scope: 'solo', tie: '-', noOdd: true,
      when: function (ctx, a) { return T.has(ctx) && T.avail(ctx, a, null, kinds); },
      w: function (ctx) { return T.RATE.solo * damp(ctx); },
      run: function (ctx, a) {
        var t = T.pick(ctx, a, null, { kinds: kinds }); if (!t) return null;
        if (fx) ctx.stress(a, fx); count(ctx);
        return { text: ctx.t(fill(ctx, ctx.pick(TX[SOLO_OF[t.kind]]), t), a), why: why(a, null, t), mag: 3 };
      }
    };
  }
  EV.push(
    soloEv('tp_crave', '話題の食べ物が無性に食べたくなる', ['food'], 2),
    soloEv('tp_recall', '好きなものを思い出して和む', ['like', 'hobby', 'person'], -4),
    soloEv('tp_irk', '苦手なものを思い出して不機嫌になる', ['hate'], 4),
    soloEv('tp_dream', '話題の場所に思いをはせる', ['place'], -3),
    soloEv('tp_reread', '好きな作品の場面を思い返す', ['work'], -3),
    soloEv('tp_ponder', '話題の物事について考え込む', ['koto', 'thing'], 0)
  );
  /* ---------- 三人の場面（a・b が話し、c はその場にいる三人目） ---------- */
  function third(ctx, a, b) {
    var o = (ctx.others ? ctx.others(a) : []).filter(function (c) { return c !== b && !bad(ctx, a, c) && !bad(ctx, b, c); });
    return o.length ? o : null;
  }
  EV.push(
    {
      id: 'tp_crowd', label: '三人で話題に花を咲かせる', cat: 'bond', scope: 'pair', tie: '-', noOdd: true,
      when: function (ctx, a, b) { return !!b && T.has(ctx) && !bad(ctx, a, b) && T.avail(ctx, a, b) && !!third(ctx, a, b); },
      w: function (ctx, a) { var q = tr(a); return T.RATE.group * (0.5 + (q.warmth || 0.5) * 0.5 + (q.fc || 0.5) * 0.5) * damp(ctx); },
      run: function (ctx, a, b) {
        var cs = third(ctx, a, b); if (!cs) return null;
        var c = ctx.pick(cs), t = T.pick(ctx, a, b); if (!t) return null;
        ctx.mod2(a, b, { aff: 3 }, { aff: 3 }); ctx.mod2(a, c, { aff: 2 }, { aff: 2 }); ctx.mod2(b, c, { aff: 2 }, { aff: 2 }); count(ctx);
        var x = t.side === 'b' ? b : a, y = x === a ? b : a;
        return { with: [c], text: ctx.t(fill(ctx, ctx.pick(TX.crowd), t), x, y, c), why: why(x, y, t, c), mag: 6 };
      }
    },
    {
      id: 'tp_lost', label: '話題に一人だけついていけない', cat: 'bond', scope: 'pair', tie: '-', noOdd: true,
      when: function (ctx, a, b) { return !!b && T.has(ctx) && !bad(ctx, a, b) && T.avail(ctx, a, b) && !!third(ctx, a, b); },
      w: function (ctx, a) { var q = tr(a); return T.RATE.group * 0.7 * (0.5 + (q.fc || 0.5) * 0.7) * damp(ctx); },
      run: function (ctx, a, b) {
        var cs = third(ctx, a, b); if (!cs) return null;
        var c = ctx.pick(cs), t = T.pick(ctx, a, b); if (!t) return null;
        ctx.mod2(a, b, { aff: 4 }, { aff: 4 }); ctx.stress(c, 2); count(ctx);
        var x = t.side === 'b' ? b : a, y = x === a ? b : a;
        return { with: [c], text: ctx.t(fill(ctx, ctx.pick(TX.lost), t), x, y, c), why: a.name + 'と' + b.name + 'の話題（' + T.kindLabel(t.kind) + '：' + t.word + '）に、' + c.name + 'はついていけなかった', mag: 4 };
      }
    }
  );
  HK.addTo(HK.COMMON, EV);
  T.EVENTS = EV;

  /* ---------- 雑談（talk）に話題の一文を添える（話題が無い・二人に合う話題が無いときは今までのまま。乱数も引かない） ---------- */
  var talk = HK.COMMON.filter(function (e) { return e && e.id === 'talk'; })[0];
  if (talk) HK.wrap(talk, 'run', function (prev) {
    return function (ctx, a, b) {
      var r = prev.apply(this, arguments);
      if (r && typeof r.text === 'string' && b && T.has(ctx) && T.avail(ctx, a, b) && !bad(ctx, a, b) && ctx.rng() < T.RATE.talk * sk(ctx)) {
        var t = T.pick(ctx, a, b);
        if (t) { r.text += ctx.t(fill(ctx, ctx.pick(TX.talk), t), a, b); r.why = (r.why ? r.why + '／' : '') + '話題：' + t.word; }
      }
      return r;
    };
  });

  /* ---------- 物語型（宇宙船・RPG：区切りの見出しの後／邪神村・吹雪の館・人狼：敵視の出来事 HateKit.storyTick の番） ---------- */
  var STEP_SC = { ship: 1, rpg: 1 }, TICK_SC = { jashin: 1, yakata: 1, jinro: 1 };
  function hereS(p) { return !!p && (HK.State && HK.State.here ? HK.State.here(p) : p.alive !== false) && !p.bound && !p.locked && !p.mad && !p.away && !p.panic && !p.out && !p.taken; }
  function storyEmit(S, live) {
    var ST = HK.Story;
    if (!ST || !S || !S.P || !T.has(S)) return false;
    var P = (live || S.P).filter(hereS);
    if (!P.length) return false;
    var a = P[Math.floor(S.rng() * P.length)], os = P.filter(function (p) { return p !== a && !bad(S, a, p) && T.avail(S, a, p); });
    var text = '', wy = '', actors = [a];
    if (os.length && S.rng() < 0.6) {
      var b = os[Math.floor(S.rng() * os.length)], t = T.pick(S, a, b);
      if (t) {
        var x = t.side === 'b' ? b : a, y = x === a ? b : a, tb = PAIR_OF[t.kind];
        if (tb === 'grumble' && t.side !== 'both') tb = 'grumble1';
        text = names(fill(S, ST.pick(S, TX[tb]), t), x, y); wy = why(x, y, t); actors = [x, y];
      }
    }
    if (!text) {
      var t1 = T.pick(S, a, null); if (!t1) return false;
      text = names(fill(S, ST.pick(S, TX[SOLO_OF[t1.kind]]), t1), a); wy = why(a, null, t1);
    }
    ST.say(S, { actors: actors, tag: '話題', text: text, why: wy, mag: 3 });
    return true;
  }
  T.storyEmit = storyEmit;
  var done = false;
  function install() {
    if (done) return;
    var ST = HK.Story, H = HK.HateKit;
    if (!ST || !ST.state || !ST.step || !H || !H.storyTick) return;
    done = true;
    HK.wrap(ST, 'state', function (prev) {
      return function (input) {
        var S = prev.apply(this, arguments);
        if (S && input && Array.isArray(input.topics) && input.topics.length) def(S, '_tpInput', { topics: input.topics, chars: input.chars || [] });
        return S;
      };
    });
    HK.wrap(ST, 'step', function (prev) {
      return function (S) {
        var r = prev.apply(this, arguments);
        try { if (S && S.scen && STEP_SC[S.scen.id] && T.has(S) && S.rng() < T.RATE.step * sk(S)) storyEmit(S); } catch (e) { if (HK.DEBUG) throw e; }
        return r;
      };
    });
    HK.wrap(H, 'storyTick', function (prev) {
      return function (S, live) {
        if (S && S.scen && TICK_SC[S.scen.id] && T.has(S) && S.rng() < Math.min(0.9, T.RATE.tick * sk(S)) && storyEmit(S, live)) return null;
        return prev.apply(this, arguments);
      };
    });
  }
  install();
  if (!done && HK.Load && HK.Load.onChunk) HK.Load.onChunk(install);
})();
