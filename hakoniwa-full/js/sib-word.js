/* 箱庭シミュレーター: きょうだいの続柄（姉・兄・妹・弟・双子）を性別と年齢から決める
   ・住人の性別（gender：m/f）と年齢（age。未設定は '' や 0）から、a から見た b の続柄を決める。
     エンジン型の住人（ctx.chars）・物語型の住人（S.P）・素の設定（input.chars）のどれでも動く（gender・age・i を見るだけ）。
   ・決め方：
     1. b の性別が m/f でなければ「きょうだい」
     2. 向きのある関係（兄弟（庇護）：roleA＝兄姉側）があれば、その向きで上下を決める（年齢より優先。利用者が選んだ向きなので）
        関係の追加の欄「上下」（t.elder。ties.js の HK.SIB_ELDER）：'a'／'b' ならその人が上（年齢より優先。同じ年齢なら「双子の姉」の形）、
        'none' なら年齢差があっても上下を付けない（双子とも呼ばない。「姉妹」「兄弟」「きょうだい」と名前での呼びかけ）。'' は自動（3・4）
     3. 両方の年齢があれば、年上が上。同じ年齢なら双子（義理のきょうだいは双子にせず、上下を決めない）
     4. どちらかの年齢が未設定で向きもなければ、上下は決めない（続柄は ''。地の文では「姉妹」「兄弟」「きょうだい」にする）
   ・双子：向き（兄弟（庇護））があれば「双子の姉／双子の妹」。向きがなければ上下を付けない。
     同性の双子は互いに「双子」（二人のまとめは「双子の姉妹」「双子の兄弟」）、異性の双子は性別で「双子の兄」「双子の妹」（まとめは「双子の兄妹」）。
     どちらも上下は年齢で決まらないので、呼びかけ（{sibcall}）は名前
   ・関係名の表示（HK.tieLabel から）：「兄弟姉妹」→「姉弟」、「兄弟（庇護）」→「姉弟（庇護）」、「義理の兄弟」→「義理の姉弟」のように言い換える。
     性別が分からず言い換えられないときは、元の関係名のまま。男女で上下が決まらないとき（年齢が未設定・上下なし）は「きょうだい」「きょうだい（不仲）」「義理のきょうだい」
   ・文の印（地の文・台詞の中で使える。{a}{b}{c} と同じ人を指す）
       {sib:a→b}    a から見た b の続柄（姉・兄・妹・弟・双子の姉…。上下が分からなければ 姉妹・兄弟・きょうだい）
       {sibs}       a と b をまとめた言い方（姉弟・兄妹・姉妹・兄弟・双子の姉妹・きょうだい）。{sibs:ac} のように二人を選べる
       {sibcall:a→b} a が b に呼びかける語（台詞の中）。b が上なら a の口調に合う「姉さん」「兄貴」「お姉ちゃん」など、
                    a の相手ごとの呼び方（calls）があればそれ、b が下・双子・不明なら b の名前（呼び方の仕組みにまかせる）
     → は半角の > でもよい。印は ctx.t（エンジン型の差し込み）で解決し、残った印は箱庭を回し終えたところ（口調の整形の前）で
       記録の actors（0番目＝a、1番目＝b、2番目＝c）から解決する。物語型の ST.fmt・K.fmt などは印をそのまま通すので、こちらで解ける */
(function () {
  'use strict';
  var HK = window.HK;
  if (!HK) return;
  var S = (HK.Sib = HK.Sib || {});

  var SIB_TYPES = { sibling: 1, sibprot: 1, sibclose: 1, sibbad: 1, twin: 1, stepsib: 1 };
  var SUFFIX = { sibling: '', sibprot: '（庇護）', sibclose: '（親友のよう）', sibbad: '（不仲）', twin: '', stepsib: '', relative: '' };

  function gen(x) { var g = x && x.gender; return g === 'm' || g === 'f' ? g : ''; }
  function age(x) { var n = +(x && x.age); return n > 0 && isFinite(n) ? n : 0; }
  function idx(x, fb) { return x && x.i != null ? x.i : fb != null ? fb : null; }
  /* きょうだいの関係か（義理のきょうだいは、箱庭に渡したあと「親族」＋ step の印になる） */
  S.isSibTie = function (t) { return !!(t && (SIB_TYPES[t.type] || (t.type === 'relative' && t.step))); };
  S.isStep = function (t) { return !!(t && (t.type === 'stepsib' || t.step)); };

  /* a・b のあいだのきょうだいの関係を探す。env はエンジンの ctx（tiesAll）・物語型の S（ties）・{ tie } のどれか。なければ回している箱庭の入力（S._cur） */
  function tieList(env) {
    if (env && Array.isArray(env.ties)) return env.ties;
    if (S._cur && Array.isArray(S._cur.ties)) return S._cur.ties;
    return [];
  }
  function findTie(env, a, b) {
    if (env && env.tie) return env.tie;
    var ia = idx(a), ib = idx(b);
    if (ia == null || ib == null) return null;
    var L = null;
    if (env && env.tiesAll) { var k = ia < ib ? ia + '-' + ib : ib + '-' + ia; L = env.tiesAll[k] || []; }
    else L = tieList(env).filter(function (t) { return t && ((t.a === ia && t.b === ib) || (t.a === ib && t.b === ia)); });
    var best = null;
    for (var i = 0; i < L.length; i++) {
      var t = L[i];
      if (!S.isSibTie(t)) continue;
      /* 向きのある庇護をいちばん優先（上下が決まる） */
      if (t.type === 'sibprot') return t;
      if (!best) best = t;
    }
    return best;
  }
  S.findTie = findTie;

  /* 関係の「上下」の欄（t.elder）：'a'／'b'／'none'。きょうだいの関係（庇護を除く）にだけ効く */
  function elderOf(t) { var e = t && t.type !== 'sibprot' && S.isSibTie(t) ? t.elder : ''; return e === 'a' || e === 'b' || e === 'none' ? e : ''; }
  S.elderOf = elderOf;
  /* a から見た b の位置：{ g: b の性別, pos: 'ue'（b が上）/'shita'（b が下）/'twin'（双子・上下なし）/''（分からない・上下なし）, twin, dir, set（上下の欄で決めた）, flat（上下なし）, step, tie } */
  S.info = function (a, b, env) {
    var t = findTie(env, a, b), ia = idx(a), ib = idx(b), el = elderOf(t);
    var o = { g: gen(b), ga: gen(a), pos: '', twin: false, dir: false, set: false, flat: false, step: S.isStep(t), tie: t };
    var aa = age(a), ab = age(b);
    /* 関係「双子」（2026-10-31）：年齢によらず双子。上下の欄で一人目・二人目を選べば「双子の姉」「双子の弟」の形、ほかは上下なし（呼びかけは名前） */
    if (t && t.type === 'twin') {
      o.twin = true;
      if ((el === 'a' || el === 'b') && ia != null && ib != null && (t.a === ia || t.a === ib) && (t.b === ia || t.b === ib)) { var up0 = el === 'a' ? t.a : t.b; o.set = true; o.pos = up0 === ib ? 'ue' : 'shita'; }
      else { o.pos = 'twin'; if (el === 'none') o.flat = true; }
      return o;
    }
    /* 上下なし：年齢差があっても上下を付けない（双子にもしない） */
    if (el === 'none') { o.flat = true; return o; }
    /* 義理のきょうだいは、同じ年齢でも双子にしない（上下は決めない） */
    if (aa && ab && aa === ab && !o.step) o.twin = true;
    if (t && t.type === 'sibprot' && ia != null && ib != null && (t.a === ia || t.a === ib)) {
      o.dir = true; o.pos = t.a === ib ? 'ue' : 'shita';
    } else if (el && ia != null && ib != null && (t.a === ia || t.a === ib) && (t.b === ia || t.b === ib)) {
      /* 上下の欄で決めた人が上（年齢より優先） */
      var up = el === 'a' ? t.a : t.b;
      o.set = true; o.pos = up === ib ? 'ue' : 'shita';
    } else if (aa && ab && aa !== ab) o.pos = ab > aa ? 'ue' : 'shita';
    else if (o.twin) o.pos = 'twin';
    return o;
  };

  var UE = { f: '姉', m: '兄' }, SHITA = { f: '妹', m: '弟' };
  /* a から見た b の続柄。性別が分からなければ「きょうだい」、上下が分からなければ '' */
  S.rel = function (a, b, env) {
    var o = S.info(a, b, env);
    if (!o.g) return 'きょうだい';
    /* 向きのない双子：同性は「双子」、異性は男を「双子の兄」・女を「双子の妹」（a の性別が分からなければ「双子」） */
    if (o.pos === 'twin') return o.ga && o.ga !== o.g ? '双子の' + (o.g === 'm' ? '兄' : '妹') : '双子';
    if (!o.pos) return '';
    return (o.twin ? '双子の' : '') + (o.pos === 'ue' ? UE[o.g] : SHITA[o.g]);
  };

  /* 二人をまとめた言い方：姉弟・兄妹・姉妹・兄弟・双子の姉妹・双子の兄弟・双子の兄妹（向きがあれば双子の姉弟も）・きょうだい */
  S.pairWord = function (a, b, env) {
    var o = S.info(a, b, env), ga = o.ga, gb = o.g;
    if (!ga || !gb) return 'きょうだい';
    var tw = o.twin || o.pos === 'twin';
    if (ga === gb) return (tw ? '双子の' : '') + (ga === 'f' ? '姉妹' : '兄弟');
    /* 男女：上の人の性別で「姉弟」か「兄妹」 */
    if (o.pos === 'twin') return '双子の兄妹';
    if (!o.pos) return 'きょうだい';
    var up = o.pos === 'ue' ? gb : ga;
    return (tw ? '双子の' : '') + (up === 'f' ? '姉弟' : '兄妹');
  };

  /* 呼びかけの候補（話し手 a の口調で並べる。先頭がいちばん合うもの） */
  var CALL = {
    rough: { f: ['姉貴', '姉さん', 'お姉ちゃん'], m: ['兄貴', '兄さん', 'お兄ちゃん'] },
    soft: { f: ['お姉ちゃん', '姉さん', '姉貴'], m: ['お兄ちゃん', '兄さん', '兄貴'] },
    plain: { f: ['姉さん', 'お姉ちゃん', '姉貴'], m: ['兄さん', 'お兄ちゃん', '兄貴'] },
    polite: { f: ['姉さん', 'お姉さん', '姉上'], m: ['兄さん', 'お兄さん', '兄上'] },
    ojou: { f: ['お姉様', '姉さん', 'お姉ちゃん'], m: ['お兄様', '兄さん', 'お兄ちゃん'] },
    old: { f: ['姉上', '姉さん', '姉貴'], m: ['兄上', '兄さん', '兄貴'] }
  };
  var TONE_CALL = {
    proud: 'rough', aniki: 'rough', yankee: 'rough', hero: 'rough', chara: 'rough', tsun: 'rough', tsun_n: 'rough', kohai: 'rough', kansai: 'rough',
    free: 'soft', gyaru: 'soft', shy: 'soft', devoted_p: 'soft', genki: 'soft',
    gentle: 'plain', gentle_n: 'plain', ane: 'plain', usan: 'plain', mukuchi: 'plain', mystic: 'plain', cool: 'plain', calm: 'plain',
    polite: 'polite', devoted: 'polite', stern: 'polite', mixed: 'polite',
    ojou: 'ojou', noja: 'old', gentleman: 'old', sondai: 'old'
  };
  S.CALL = CALL; S.TONE_CALL = TONE_CALL;
  function toneOf(c) {
    if (!c) return '';
    if (c.tone) return c.tone;
    if (c.persona) return c.persona;
    try { return HK.toneOf ? HK.toneOf(c) : HK.personaOf ? HK.personaOf(c) : ''; } catch (e) { return ''; }
  }
  S.callGroup = function (c) { return TONE_CALL[toneOf(c)] || 'plain'; };

  /* 地の文・呼びかけの語。kind：'plain'（姉・弟。上下が分からなければ 姉妹・兄弟・きょうだい）／'call'（呼びかけの候補の配列。b が上のときだけ。下・双子・不明は []）／'pair'（二人のまとめ） */
  S.word = function (a, b, kind, env) {
    if (kind === 'pair') return S.pairWord(a, b, env);
    if (kind === 'call') {
      var o = S.info(a, b, env);
      if (!o.g || o.pos !== 'ue' || (o.tie && o.tie.type === 'twin')) return [];
      return CALL[S.callGroup(a)][o.g].slice();
    }
    return S.rel(a, b, env) || S.pairWord(a, b, env);
  };
  /* 台詞の中の呼びかけ一つ（{sibcall:a→b}）：相手ごとの呼び方 → 口調に合う「姉さん」など → 名前 */
  S.callFor = function (a, b, env) {
    if (!b) return '';
    if (a && a.calls && b.name && a.calls[b.name]) return a.calls[b.name];
    var L = S.word(a, b, 'call', env);
    return L.length ? L[0] : b.name || '';
  };

  /* ---------- 関係名の表示 ----------
     t：関係（type・a・b。エンジンの関係・物語型の S.ties・結果の p.tie のどれでも）、A・B：t.a・t.b の住人。
     mode 'dir'：向きのある庇護を「姉（庇護）→弟」の形に。言い換えられなければ '' */
  function withI(x, i) { if (!x || x.i != null || i == null) return x; var o = {}; for (var k in x) o[k] = x[k]; o.i = i; return o; }
  S.tieLabel = function (t, A, B, mode) {
    if (!t || !A || !B) return '';
    A = withI(A, t.a); B = withI(B, t.b);
    var step = S.isStep(t);
    if (!SIB_TYPES[t.type] && !(t.type === 'relative' && step)) return '';
    var env = { tie: t };
    if (mode === 'dir' && t.type === 'sibprot') {
      var ga = gen(A), gb = gen(B);
      if (!ga && !gb) return '';
      return (ga ? UE[ga] : '兄姉') + '（庇護）→' + (gb ? SHITA[gb] : '弟妹');
    }
    var w = S.pairWord(A, B, env);
    /* 男女で上下が決まらない（年齢が未設定・上下なし）ときは「きょうだい」（「兄弟（不仲）」のように片方の性別の語にしない）。性別が分からなければ元の関係名 */
    if (w === 'きょうだい' && !(gen(A) && gen(B) && gen(A) !== gen(B))) return '';
    return (step ? '義理の' : '') + w + (SUFFIX[step ? 'stepsib' : t.type] || '');
  };
  /* HK.tieLabel（ties.js）から：関係を当てたときに覚えた名前（t.sibLab）、なければ who（住人の配列か 番号→住人 の関数）、
     それもなければ回している箱庭の入力（S._cur）から住人を引く */
  S.labelOf = function (t, who) {
    if (!S.isSibTie(t)) return '';
    if (t.sibLab) return t.sibLab;
    var get = typeof who === 'function' ? who : Array.isArray(who) ? function (i) { return who[i]; } : S._cur ? function (i) { return S._cur.chars[i]; } : null;
    return get ? S.tieLabel(t, get(t.a), get(t.b)) : '';
  };
  /* 上の人の名前と続柄（「美咲が姉」）を出すための情報：{ who: 上の人, word: '姉' } または null */
  S.elder = function (t, A, B) {
    if (!t || !A || !B) return null;
    A = withI(A, t.a); B = withI(B, t.b);
    var env = { tie: t }, o = S.info(A, B, env);
    if (o.pos === 'ue' && o.g) return { who: B, word: UE[o.g] };
    if (o.pos === 'shita' && o.ga) return { who: A, word: UE[o.ga] };
    return null;
  };
  /* 結果（res）から住人を引く：res.input.chars（性別・年齢を持つ）に番号を付けたもの */
  function resPerson(res, i) {
    var c = res && res.input && res.input.chars && res.input.chars[i];
    if (!c) return null;
    var nm = res.chars && res.chars[i] ? res.chars[i].name : c.name;
    return { i: i, name: nm, gender: c.gender || '', age: c.age || '', tone: c.tone || '', calls: c.calls || null };
  }
  S.resPerson = resPerson;
  /* 結果の p.tie には上下の欄（elder）が乗っていないことがあるので、入力の関係（res.input.ties）から写す。
     入力の関係の a・b と向きが逆でも、上の人が同じになるように直す */
  function resWithElder(tie, res) {
    if (!tie || tie.elder != null || tie.type === 'sibprot') return tie;
    var it = ((res && res.input && res.input.ties) || []).filter(function (x) {
      return x && x.elder && (x.type === tie.type || (x.type === 'stepsib' && (tie.type === 'relative' || tie.step))) && ((x.a === tie.a && x.b === tie.b) || (x.a === tie.b && x.b === tie.a));
    })[0];
    if (!it) return tie;
    var o = {}, k;
    for (k in tie) o[k] = tie[k];
    if (it.type === 'stepsib') o.step = true;
    if (it.elder === 'none') o.elder = 'none';
    else { var up = it.elder === 'a' ? it.a : it.b; o.elder = up === tie.a ? 'a' : 'b'; }
    return o;
  }
  S.resWithElder = resWithElder;
  /* 結果の p.tie（type・label・a・b）の表示名。義理のきょうだいは結果では「親族」になっているので、入力の関係も見る。言い換えられなければ '' */
  S.resLabel = function (tie, res, mode) {
    if (!tie || !res) return '';
    var A = resPerson(res, tie.a), B = resPerson(res, tie.b);
    if (!A || !B) return '';
    var t = resWithElder(tie, res);
    if (tie.type === 'relative' && !tie.step) {
      var st = ((res.input && res.input.ties) || []).filter(function (x) { return x && x.type === 'stepsib' && ((x.a === tie.a && x.b === tie.b) || (x.a === tie.b && x.b === tie.a)); })[0];
      if (!st && !/義理/.test(tie.label || '')) return '';
      t = { type: 'relative', step: true, a: tie.a, b: tie.b };
      if (st && st.elder) t.elder = st.elder === 'none' ? 'none' : (st.elder === 'a' ? st.a : st.b) === tie.a ? 'a' : 'b';
    }
    return S.tieLabel(t, A, B, mode);
  };
  S.resElder = function (tie, res) {
    if (!tie || !res || !S.isSibTie(tie) && !(tie.type === 'relative' && /義理/.test(tie.label || ''))) return null;
    return S.elder(resWithElder(tie, res), resPerson(res, tie.a), resPerson(res, tie.b));
  };

  /* ---------- 弟妹から上のきょうだいへの呼び方（既定） ----------
     弟妹側の住人が、上のきょうだいを呼ぶ語を決めていない（相手ごとの呼び方 calls も、相手ごとの二人称 youFor もない）とき、
     台詞の仕上げ（HK.Voice.processResult）のあいだだけ、口調に合う語（姉さん・姉貴・お姉ちゃん・お姉様・姉上…）を
     相手ごとの呼び方として足す。保存された設定は変えない（入力の写しにだけ足す）。
     こうすると tone-plus.js の呼び方の仕組み（名前・二人称の置き換え）がそのまま効く */
  function sibTiesOf(input) { return ((input && input.ties) || []).filter(function (t) { return t && (SIB_TYPES[t.type] || (t.type === 'relative' && t.step)); }); }
  S.autoCalls = function (input) {
    var C = (input && input.chars) || [], out = [];
    sibTiesOf(input).forEach(function (t) {
      [[t.a, t.b], [t.b, t.a]].forEach(function (p) {
        var A = C[p[0]], B = C[p[1]];
        if (!A || !B || !B.name || A === B) return;
        if (A.calls && A.calls[B.name]) return;
        if (A.youFor && A.youFor[p[1]]) return;
        var a = withI(A, p[0]), b = withI(B, p[1]), o = S.info(a, b, { tie: t });
        if (o.pos !== 'ue' || !o.g || t.type === 'twin') return;
        out.push({ who: p[0], to: p[1], name: B.name, call: CALL[S.callGroup(a)][o.g][0] });
      });
    });
    return out;
  };
  S.withCalls = function (input) {
    var L = S.autoCalls(input);
    if (!L.length) return input;
    var inp = {}, k;
    for (k in input) inp[k] = input[k];
    inp.chars = input.chars.map(function (c) {
      var mine = L.filter(function (x) { return input.chars[x.who] === c; });
      if (!mine.length) return c;
      var o = {}, j;
      for (j in c) o[j] = c[j];
      o.calls = {};
      for (j in (c.calls || {})) o.calls[j] = c.calls[j];
      mine.forEach(function (x) { if (!o.calls[x.name]) o.calls[x.name] = x.call; });
      return o;
    });
    return inp;
  };
  var V = HK.Voice;
  if (V && V.processResult && !V.processResult._sib) {
    var pr0 = V.processResult;
    V.processResult = function (res, input) { return pr0.call(this, res, S.withCalls(input)); };
    V.processResult._sib = true;
  }

  /* ---------- 設定欄（ui-gear.js・ui.js）向け ----------
     c・o：画面の住人（id を持つ）、t：画面の関係（a・b は住人の id）。
     { rel: o の続柄（c から見て）, call: c が o を呼ぶ語（呼び方の設定があればそれ、自動なら「姉さん」など、名前なら ''）, auto: 自動の呼び方か, notes: 注意の文 } */
  S.ui = function (c, o, t) {
    if (!c || !o || !t || !S.isSibTie(t) && t.type !== 'stepsib') return null;
    var a = withI(c, c.id), b = withI(o, o.id), env = { tie: t }, inf = S.info(a, b, env);
    var r = { rel: S.rel(a, b, env) || '', call: '', auto: false, notes: [], src: inf.flat ? 'none' : inf.set ? 'set' : inf.dir ? 'dir' : 'auto', pair: S.pairWord(a, b, env) };
    var own = c.calls && c.calls[o.id];
    if (own) r.call = own;
    else if (inf.pos === 'ue' && inf.g && t.type !== 'twin' && !(c.youFor && c.youFor[o.id])) { r.call = CALL[S.callGroup(c)][inf.g][0]; r.auto = true; }
    var aa = age(c), ab = age(o), gw = { f: '姉か妹', m: '兄か弟' }[inf.g] || '上か下';
    if (t.type === 'twin') {
      /* 双子：年齢が違っても双子として扱う。上下は「上下」の欄で選んだときだけ */
      if (aa && ab && aa !== ab) r.notes.push('双子なので、年齢の違いは見ずに同い年として扱います');
      if (inf.set) r.notes.push('上下の設定どおり' + (inf.pos === 'ue' ? o : c).name + 'を上にします（文では『' + r.pair + '』）');
      return r;
    }
    if (inf.dir) {
      /* 庇護の向きと年齢が逆 */
      var upIsO = inf.pos === 'ue';
      if (aa && ab && aa !== ab && (ab > aa) !== upIsO) {
        var older = ab > aa ? o : c, prot = upIsO ? o : c;
        r.notes.push('年齢では' + older.name + 'が年上ですが、庇護の向き（' + prot.name + 'が兄姉）を優先します');
      }
    } else if (inf.flat) {
      r.notes.push('上下なしにしているので、' + (aa && ab && aa !== ab ? '年齢差があっても' : '') + '上下を付けずに対等に扱います（文では『' + r.pair + '』、呼びかけは名前になります）');
    } else if (inf.set) {
      var upO = inf.pos === 'ue', upP = upO ? o : c;
      if (aa && ab && aa === ab && !inf.step) r.notes.push('同じ年齢なので双子として扱い、上下の設定どおり' + upP.name + 'を上にします');
      else if (aa && ab && aa !== ab && (ab > aa) !== upO) r.notes.push('年齢では' + (ab > aa ? o : c).name + 'が年上ですが、上下の設定（' + upP.name + 'が上）を優先します');
    } else if (!aa || !ab) {
      r.notes.push('年齢が未設定なので' + gw + 'か決められません（文では『' + r.pair + '』になります）。年齢か『上下』を決めてください');
    } else if (aa === ab) {
      if (inf.step) r.notes.push('義理のきょうだいで同じ年齢なので、' + gw + 'かは決めません（文では『' + r.pair + '』になります）。上下を付けるなら『上下』で選べます');
      else r.notes.push('同じ年齢なので双子として扱います。上下を付けるなら『上下』で選べます');
    }
    return r;
  };
  /* 関係の一覧の行の名前に添える続柄（「美咲（姉）」）。分からなければ '' */
  S.uiRole = function (t, A, B, who) {
    if (!t || !A || !B) return '';
    var a = withI(A, t.a), b = withI(B, t.b), env = { tie: t };
    var x = who === 'a' ? S.rel(b, a, env) : S.rel(a, b, env);
    return x === 'きょうだい' ? '' : x;
  };

  /* ---------- 文の印 ---------- */
  var RE = /\{(sib|sibcall):([abc])(?:→|>)([abc])\}|\{sibs(?::([abc])([abc]))?\}/g;
  S.RE = RE;
  S.has = function (s) { return typeof s === 'string' && s.indexOf('{sib') >= 0; };
  S.fill = function (text, a, b, c, env) {
    if (!S.has(text)) return text;
    var P = { a: a, b: b, c: c };
    return text.replace(RE, function (m, k, x, y, p, q) {
      if (!k) { x = p || 'a'; y = q || 'b'; k = 'sibs'; }
      var X = P[x], Y = P[y];
      if (!X || !Y) return k === 'sibcall' ? (Y && Y.name) || '' : 'きょうだい';
      if (k === 'sibs') return S.pairWord(X, Y, env);
      if (k === 'sibcall') return S.callFor(X, Y, env);
      return S.word(X, Y, 'plain', env);
    });
  };

  /* エンジン型の差し込み（ctx.t）で印を解く */
  if (HK.Ctx && HK.Ctx.prototype.t && !HK.Ctx.prototype.t._sib) {
    var t0 = HK.Ctx.prototype.t;
    HK.Ctx.prototype.t = function (str, a, b, c) {
      if (S.has(str)) str = S.fill(str, a, b, c, this);
      return t0.call(this, str, a, b, c);
    };
    HK.Ctx.prototype.t._sib = true;
  }

  /* 回し終えた記録に残った印を、記録の actors と入力の住人から解く（口調の整形 persona-final.js より前） */
  function fixLog(res, cur) {
    var C = (cur && cur.chars) || [];
    var per = function (i) { var c = C[i]; if (!c) return null; var o = {}; for (var k in c) o[k] = c[k]; o.i = i; return o; };
    var env = { ties: (cur && cur.ties) || [] };
    (res.log || []).forEach(function (e) {
      if (!e || typeof e !== 'object') return;
      var ac = (e.actors || []).map(function (x) { return per(typeof x === 'number' ? x : x && x.i); });
      Object.keys(e).forEach(function (k) {
        var v = e[k];
        if (typeof v === 'string') { if (S.has(v)) e[k] = S.fill(v, ac[0], ac[1], ac[2], env); }
        else if (Array.isArray(v)) v.forEach(function (s, j) { if (S.has(s)) v[j] = S.fill(s, ac[0], ac[1], ac[2], env); });
      });
    });
  }
  S.fixLog = fixLog;
  var sim0 = HK.simulate;
  if (sim0 && !sim0._sib) {
    HK.simulate = function (input) {
      var prev = S._cur;
      S._cur = { chars: (input && input.chars) || [], ties: (input && input.ties) || [] };
      try {
        var res = sim0.apply(this, arguments);
        if (res && res.log) fixLog(res, S._cur);
        return res;
      } finally { S._cur = prev; }
    };
    HK.simulate._sib = true;
  }
})();
