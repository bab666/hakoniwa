/* 箱庭シミュレーター: 受け攻めの指定
   キャラごとの pos = '' (おまかせ) | 'top' (攻め) | 'bottom' (受け) | 'riba' (リバ)
   女性は「攻め」を選ばない限り受けとして扱う（ただし自分で選んだ指定ではないので、女性同士では攻めにも回れる）。
   恋愛対象（受け攻め）posLike = '' (おまかせ：攻めなら受けとリバ・受けなら攻めとリバ・それ以外は誰とでも)
     | 'tb' (攻めと受け) | 'tr' (攻めとリバ) | 'br' (受けとリバ) | 'any' (誰とでも)
   いちばん大事な決まり：自分で「攻め」を選んだ人は、どの場面でも受ける側に回らない。
   向きを決められない組（攻め×攻めなど）は、恋愛にも体の関係にもならない（HK.canLove が false を返す）。
   リバ同士の組だけは、場面ごとに入れ替わってよい。それ以外の組は、一度決まった向きを最後まで変えない。
   ふたなり（futa、R18版のみ）：攻め・リバを選んだ女性に付けると、攻めに回る場面を男性の体（いちもつ）を前提にした描写で書く（P.isF が false）。
     オメガバースでは使わない（P.isFBody を見る）。双頭の玩具・貝合わせのような対等な繋がりは、二人ともリバ（P.bothRiba）のときだけ。
   性器の有無（genital、R18版のみ。attr.js の欄）：''（おまかせ＝性別どおり：男性→男性器、女性→女性器、ふたなり→両方）／m 男性器／f 女性器／mf 両方／none なし。
     体の描写の判定（P.hasM・P.hasF・P.noGen、それを読む P.isFBody・P.futa・P.isF）は性別ではなくこれを見る。胸・喉仏などは性別どおり。
     none の人は、受けのとき口（口内）まで、攻めのとき指と玩具だけ（pos-nogen.js の HK.NoGen）。P.okSex は変えない（組み立て側が形を選ぶ）。
     全年齢版・全年齢モード（HK.SAFE_ON）では使わない（保存だけ）
   相手ごとの受け攻め posFor（全年齢版・R18版共通）：{ 相手の番号: 'top'|'bottom'|'riba' }。P.of(c, other)・P.explicit(c, other)・P.hardTop(c, other) の
     第2引数に相手を渡すと、その相手への指定（自分で選んだ指定として扱う）を全体の指定より優先する。相手を渡さない（モブ・一人の場面）ときは全体の指定のまま。
     相手は実行時の住人なら .i、入力の住人なら .src.i で引く（attr.js の A.nightOf と同じ）。
     全体で「攻め」の人が受けに回るのは、相手ごとに「受け」「リバ」と自分で決めた相手に対してだけ。モブ・指定の無い相手には今までどおり受けに回らない。
     二人を扱う関数（likes・canRole・orients・order・okSex・fixed・bothRiba・fbFor・ff など）は、二人のそれぞれについて相手への指定を見る。
     三人以上の場面は P.hardTopIn(c, 人の一覧)（その場の誰か一人にでも攻めなら攻め）を使う
     二人がお互いに相手ごとの指定をして食い違う組（どちらも「攻め」など）は、向きの決まらない組（体の関係にならない。画面の相手ごとの設定の行に注意。attr.js の A.forNote）
   攻め度 topLv（全年齢版・R18版共通）：''（おまかせ＝3）／'1'〜'5'。向きが二通り成り立つ組（リバどうし・おまかせどうしなど）で、高い方が攻めに回る（P.lv）。
     優先の順は 相手ごとの指定 ＞ 攻め度 ＞ 全体の受け攻め。自分で選んだ攻め・受け（全体・相手ごと）は変えない。同じなら従来どおり
   モブ相手の受け攻め posNpc（R18版）：''（住人と同じ）／'top'／'bottom'／'riba'。モブ・魔物・村人・罠などとの場面だけに効く（P.npc・P.vsNpc・P.canReceive・P.hardTopNpc）。
     「攻めを選んだ人を受けにしない」は住人どうしの決まり。モブ欄で受け・リバを選んだ人は、全体が攻めでもモブには受けで書く。モブ欄で攻めを選んだ人は、モブには受けない
   夜の主導 lead（R18版）：''（おまかせ）／'top'（攻めが主導）／'sasoi'（受けが主導・誘い受け）／'osoi'（受けが主導・襲い受け）。受け攻めは変えない。
     受けが主導の人は「ノリノリ」（P.nori）として扱い、攻めが主導の人は扱わない。山場の始まりの文は pos-lead-r18.js（HK.PosLead） */
(function () {
  'use strict';
  var HK = window.HK;
  var P = HK.Pos = {};
  var lock = {};

  function src(c, k) { return c ? (c[k] != null && c[k] !== '' ? c[k] : (c.src && c.src[k]) || '') : ''; }
  var POSV = { top: 1, bottom: 1, riba: 1 };
  /* 相手の番号（実行時の住人は .i、入力の住人は .src.i。分からなければ null） */
  function idxOf(o) { return !o ? null : typeof o.i === 'number' ? o.i : o.src && typeof o.src.i === 'number' ? o.src.i : typeof o._pi === 'number' ? o._pi : null; }
  /* c が相手 o に向けて自分で決めた受け攻め（相手ごとの指定。無ければ ''） */
  function pf(c, o) {
    if (!c || !o || c === o) return '';
    var m = (c.posFor && typeof c.posFor === 'object' ? c.posFor : null) || (c.src && c.src.posFor && typeof c.src.posFor === 'object' ? c.src.posFor : null);
    if (!m) return '';
    var k = idxOf(o);
    if (k == null || k === idxOf(c)) return '';
    var v = m[k];
    return POSV[v] ? v : '';
  }
  P.forOf = pf;
  /* 実際に効く指定（o を渡すと、その相手への指定を優先する） */
  P.of = function (c, o) {
    if (!c) return '';
    var f = pf(c, o);
    if (f) return f;
    var v = src(c, 'pos');
    if (v === 'top' || v === 'bottom' || v === 'riba') return v;
    return src(c, 'gender') === 'f' ? 'bottom' : '';
  };
  function explicit(c, o) { if (pf(c, o)) return true; var v = src(c, 'pos'); return v === 'top' || v === 'bottom' || v === 'riba'; }
  P.explicit = explicit;
  P.isTop = function (c, o) { return P.of(c, o) === 'top'; };
  P.isBottom = function (c, o) { return P.of(c, o) === 'bottom'; };
  /* 自分で「攻め」を選んだ人（どの相手・どの場面でも受けに回してはいけない）。o を渡すと、その相手への指定で見る */
  P.hardTop = function (c, o) { return explicit(c, o) && P.of(c, o) === 'top'; };
  /* 三人以上の場面：その場の誰か一人にでも自分で攻めを選んでいれば攻め（一人もいなければ全体の指定） */
  P.hardTopIn = function (c, list) {
    var os = (list || []).filter(function (o) { return o && o !== c; });
    if (!os.length) return P.hardTop(c);
    for (var i = 0; i < os.length; i++) if (P.hardTop(c, os[i])) return true;
    return false;
  };
  /* 相手ごとの指定を一つでも持つ人か */
  P.hasFor = function (c) { var m = c && ((c.posFor && typeof c.posFor === 'object' ? c.posFor : null) || (c.src && c.src.posFor)); if (!m) return false; for (var k in m) if (POSV[m[k]]) return true; return false; };
  /* 入力の住人（input.chars。番号を持たない）を、相手ごとの指定が引ける形に（誰も posFor を持たなければ、そのまま返す） */
  P.withIdx = function (cs) {
    if (!Array.isArray(cs) || !cs.some(P.hasFor)) return cs;
    return cs.map(function (c, i) { if (!c || typeof c !== 'object') return c; var o = {}; for (var k in c) if (Object.prototype.hasOwnProperty.call(c, k)) o[k] = c[k]; o._pi = i; return o; });
  };
  P.canTop = function (c, o) { return P.of(c, o) !== 'bottom' || !explicit(c, o); };
  P.canBottom = function (c, o) { return !P.hardTop(c, o); };
  var LBL = { top: '攻め', bottom: '受け', riba: 'リバ' };
  P.label = function (c) { return LBL[P.of(c)] || 'おまかせ'; };
  /* 性器の有無（R18版のみ）：自分で決めた値（決めていなければ ''。全年齢では常に ''） */
  P.GENITAL = { m: 1, f: 1, mf: 1, none: 1 };
  P.genSet = function (c) { if (HK.SAFE_ON || !c) return ''; var v = src(c, 'genital'); return P.GENITAL[v] ? v : ''; };
  /* ふたなり（性器の欄を決めていない人だけ。女性で、自分で「攻め」か「リバ」を選び、設定で「ふたなり」を付けた人） */
  function futaOld(c, o) { return !HK.SAFE_ON && src(c, 'gender') === 'f' && !!src(c, 'futa') && explicit(c, o) && P.of(c, o) !== 'bottom'; }
  /* 実際の性器：'m'／'f'／'mf'／'none'（おまかせは性別どおり。性別がおまかせ・その他の人は、これまでどおり男性の体） */
  P.gen = function (c) { var g = P.genSet(c); if (g) return g; if (!c) return ''; return src(c, 'gender') === 'f' ? (futaOld(c) ? 'mf' : 'f') : 'm'; };
  P.hasM = function (c) { var g = P.gen(c); return g === 'm' || g === 'mf'; };
  P.hasF = function (c) { var g = P.gen(c); return g === 'f' || g === 'mf'; };
  P.noGen = function (c) { return P.gen(c) === 'none'; };
  /* 体が女性か（オメガバースなど、ふたなりの設定を使わない箱庭はこちらを見る）。性器を決めた人は性器から（女性器のある人＝女性の体。なしの人は性別どおり） */
  P.isFBody = function (c) { var g = P.genSet(c); if (g) return g === 'f' || g === 'mf' || (g === 'none' && src(c, 'gender') === 'f'); return src(c, 'gender') === 'f'; };
  /* ふたなり（R18版のみ）：女性で、自分で「攻め」か「リバ」を選び、設定で「ふたなり」を付けた人。
     攻めに回る場面では男性の体（いちもつ）を前提にした描写で書く。自分で「受け」を選んだ人・おまかせの女性には効かない。
     性器を「両方」にした人は、受けの指定でなければ同じ扱い（性別・ふたなりの欄に関係なく） */
  P.futa = function (c, o) { var g = P.genSet(c); if (g) return g === 'mf' && P.of(c, o) !== 'bottom'; return futaOld(c, o); };
  /* 描写の上で「女性の体」として書く人（ふたなりの攻めは除く）。女性どうし（ff）・女性が攻め（fm）の判定はこれで行う */
  P.isF = function (c, o) { return P.isFBody(c) && !P.futa(c, o); };
  /* 女性どうしの組（いちもつの描写を使わない）。ふたなりの攻めが入る組は、男性の体を前提にした描写でよい */
  P.ff = function (a, b) { return P.isF(a, b) && P.isF(b, a); };
  /* 二人ともリバ（双頭の玩具・貝合わせのように、二人が対等に繋がる描写は、この組だけ） */
  P.bothRiba = function (a, b) { return P.of(a, b) === 'riba' && P.of(b, a) === 'riba'; };
  P.MUTUAL_RE = /双頭の玩具|双頭ディルド|貝合わせ|擦り合わせ|擦りつけ合|擦り付け合|重ね合わせ|上になったり下になったり|濡れたところ同士|熱いところ同士|熱いところを重ね|入れ替わ(?:り|って|った)/;

  /* ---------- 恋愛対象（受け攻め） ---------- */
  P.LIKE_OPTS = [
    { v: '', label: 'おまかせ（攻めなら受けとリバ・受けなら攻めとリバ）' },
    { v: 'tb', label: '攻めと受けの両方' },
    { v: 'tr', label: '攻めとリバだけ' },
    { v: 'br', label: '受けとリバだけ' },
    { v: 'any', label: '誰とでも（リバも含む）' }
  ];
  P.likeValid = function (v) { return v === '' || v === 'tb' || v === 'tr' || v === 'br' || v === 'any'; };
  /* c が相手として受け入れる「相手の指定」（o を渡すと、その相手への受け攻めで見る） */
  P.likes = function (c, o) {
    var v = src(c, 'posLike');
    if (v === 'tb') return { top: 1, bottom: 1 };
    if (v === 'tr') return { top: 1, riba: 1 };
    if (v === 'br') return { bottom: 1, riba: 1 };
    if (v === 'any') return { top: 1, bottom: 1, riba: 1 };
    /* おまかせ：攻めなら受けとリバ、受けなら攻めとリバ（リバは相手に合わせて回れるので、相手にできる。「攻めと受けの両方」を選んだ人だけリバを除く） */
    if (explicit(c, o) && P.of(c, o) === 'top') return { bottom: 1, riba: 1 };
    if (explicit(c, o) && P.of(c, o) === 'bottom') return { top: 1, riba: 1 };
    return { top: 1, bottom: 1, riba: 1 };
  };
  /* c がその役（'top'|'bottom'）に回れるか。partner は相手 */
  function canRole(c, r, partner) {
    if (!explicit(c, partner)) return true;
    var p = P.of(c, partner);
    if (p === 'riba') return true;
    if (p === 'top') return r === 'top';
    /* 受け×受け（どちらも自分で選んだ受け）だけは、どちらかが動く側に回る */
    return r === 'bottom' || (P.of(partner, c) === 'bottom' && explicit(partner, c));
  }
  /* 相手から見た c の指定（おまかせの人は、その場で回る役として見る）。partner は相手 */
  function kindAs(c, r, partner) { return explicit(c, partner) ? P.of(c, partner) : r; }
  /* 成り立つ向き（[攻め, 受け] の並び）の一覧 */
  /* 恋愛対象（c.likes：''＝おまかせ／m／f／both／none）が相手の性別に合うか。両方向で見る。性別がおまかせ・その他の相手は制限しない */
  function likesOne(a, b) {
    if (!a.likes || a.likes === 'both') return true;
    if (a.likes === 'none') return false;
    if (!b.gender || b.gender === 'x') return true;
    return a.likes === b.gender;
  }
  P.genderOK = function (a, b) { return !!(a && b) && likesOne(a, b) && likesOne(b, a); };
  /* love が真のときは恋愛の判定（P.okLove）として見る：体の関係だけを止める設定（R18に参加しない・性行為の相手の固定・一途の体の縛り）は見ず、
     恋愛・R18にしない組（engine.js の HK.ngPair：恋愛・R18にしない相手・恋愛相手の固定・同じ人の恋人どうし・無関心／恐怖）だけで止める */
  P.orients = function (a, b, love) {
    if (!a || !b || a === b) return [];
    /* 恋愛・R18にしない組（engine.js の HK.ngPair）は、どちらの向きでも成り立たない */
    /* 体の関係にならない組（engine.js の HK.sexBlocked：恋愛・R18にしない相手・同じ人の恋人どうし・性行為の相手の固定）。
       恋愛相手の固定が食い違うだけの組は、性行為の相手の固定で「誰とでも可」などにしていれば体の関係になれる（恋愛には進まない） */
    if (love ? (HK.ngPair && HK.ngPair(a, b)) : HK.sexBlocked ? HK.sexBlocked(a, b) : (HK.ngPair && HK.ngPair(a, b))) return [];
    /* 恋愛対象（キャラの設定の性別）が合わない組：どちらの向きでも成り立たない（恋愛にも体の関係にもしない） */
    if (!P.genderOK(a, b)) return [];
    var out = [];
    [[a, b], [b, a]].forEach(function (o) {
      var t = o[0], u = o[1];
      if (!canRole(t, 'top', u) || !canRole(u, 'bottom', t)) return;
      if (!P.likes(t, u)[kindAs(u, 'bottom', t)] || !P.likes(u, t)[kindAs(t, 'top', u)]) return;
      out.push(o);
    });
    return out;
  };
  /* 体の関係が成り立つ組か（受け攻めの指定と恋愛対象・体の関係の縛りから） */
  P.okSex = function (a, b) { return P.orients(a, b).length > 0; };
  /* 恋愛が成り立つ組か：恋愛対象・受け攻めの向き・恋愛・R18にしない相手・恋愛相手の固定は okSex と同じに見るが、
     「R18に参加しない」（noR18）・性行為の相手の固定・一途の体の縛りは体の関係だけを止める設定なので見ない
     （2026-10-26 の利用者の決定「R18に参加しない人でも恋愛はできてほしい」。恋人になった二人の夜・体の関係は、出口ごとに HK.sexBlocked・HK.Pos.okSex で止める） */
  P.okLove = function (a, b) { return P.orients(a, b, true).length > 0; };
  /* 向きを決められない組（攻め×攻め・指定が合わない組）。体の関係には一切ならない */
  P.clash = function (a, b) { return !!(a && b && a !== b && !P.okSex(a, b)); };

  /* 指定が同じ同士（おまかせの女性どうし・受け×受け）を気質で決める */
  function lean(c) {
    var t = c.tr || {};
    return (t.cp || 0) * 0.4 + (t.lead || 0) * 0.3 + (t.aggr || 0) * 0.3 - (t.ac || 0) * 0.35 + (t.cold || 0) * 0.1;
  }
  function key(a, b) { var x = a.name || String(a.i), y = b.name || String(b.i); return x < y ? x + '\u0001' + y : y + '\u0001' + x; }
  function nameOf(c) { return c.name || String(c.i); }

  /* 攻め度（1〜5。決めていなければ 3） */
  P.lv = function (c) { var v = Math.round(+src(c, 'topLv')); return v >= 1 && v <= 5 ? v : 3; };
  P.LV_OPTS = [['', 'おまかせ（ふつう）'], ['1', '1（受けに回りやすい）'], ['2', '2'], ['3', '3（ふつう）'], ['4', '4'], ['5', '5（攻めに回りやすい）']];
  /* 向きが二通り成り立つ組の、優先の決まり（相手ごとの指定 ＞ 攻め度）。決まれば [攻め, 受け]、決まらなければ null */
  function prefer(a, b) {
    /* 相手ごとの指定：片方だけが相手ごとに「受け」と決めていれば、その人が受け（もう片方の全体の受けより優先） */
    var fa = pf(a, b), fb0 = pf(b, a);
    if (fa === 'bottom' && fb0 !== 'bottom') return [b, a];
    if (fb0 === 'bottom' && fa !== 'bottom') return [a, b];
    /* 攻め度：高い方が攻め */
    var la = P.lv(a), lb = P.lv(b);
    if (la > lb) return [a, b];
    if (lb > la) return [b, a];
    return null;
  }
  P.prefer = function (a, b) { if (!a || !b || a === b || P.orients(a, b).length !== 2) return null; return prefer(a, b); };

  /* 二人のうち、攻め（動く側・挿入する側）を先にして返す。fb は場面側の希望 [攻め, 受け]
     指定の合わない組でも、自分で攻めを選んだ人を受けの位置には置かない（呼ぶ側は P.okSex で先に確かめること） */
  P.order = function (a, b, fb) {
    if (!a || !b || a === b) return fb || [a, b];
    fb = fb && fb.length === 2 ? fb : [a, b];
    var os = P.orients(a, b), r;
    /* 恋愛対象「なし」の人が入る組（合意のない展開の切羽詰まった場面だけが、ここまで来る。HK.Pos.forceOpen）：「おまかせ」として向きを決める（受け攻めの指定どおりに） */
    if (!os.length && P.noneIn([a, b])) os = openNone([a, b], function () { return P.orients(a, b); });
    if (!os.length) return P.hardTop(b, a) && !P.hardTop(a, b) ? [b, a] : P.hardTop(a, b) ? [a, b] : fb;
    if (os.length === 1) return os[0];
    var pa = P.of(a, b), pb = P.of(b, a);
    /* 相手ごとの指定・攻め度で決まる組（リバどうしも、攻め度が違えば高い方が攻め） */
    var pr = prefer(a, b);
    if (pr) return pr;
    if (pa === 'riba' && pb === 'riba') return fb;
    var k = key(a, b);
    if (lock[k]) return lock[k] === nameOf(a) ? [a, b] : [b, a];
    if (pa === 'top' && pb !== 'top') r = [a, b];
    else if (pb === 'top' && pa !== 'top') r = [b, a];
    else if (pa === 'bottom' && pb !== 'bottom') r = [b, a];
    else if (pb === 'bottom' && pa !== 'bottom') r = [a, b];
    /* 受け×受け：自分で「受け」を選んだ人を優先し、おまかせの側が攻めに回る */
    else if (pa === 'bottom' && pb === 'bottom' && !!explicit(a, b) !== !!explicit(b, a)) r = explicit(a, b) ? [b, a] : [a, b];
    else if (pa === pb && (pa === 'top' || pa === 'bottom')) {
      var la = lean(a), lb = lean(b);
      r = la > lb + 0.001 ? [a, b] : lb > la + 0.001 ? [b, a] : (nameOf(a) < nameOf(b) ? [a, b] : [b, a]);
    } else r = fb;
    lock[k] = nameOf(r[0]);
    return r;
  };
  /* 向きが決まっている組か（＝途中の逆転・入れ替わりを起こしてはいけない） */
  P.fixed = function (a, b) { return !(P.of(a, b) === 'riba' && P.of(b, a) === 'riba'); };
  /* 二人の組で a が攻めか */
  P.topOf = function (a, b, fb) { return P.order(a, b, fb)[0]; };
  /* 名前のない相手（モブ・魔物・道具）との組：キャラが攻めなら 'top'、受けなら 'bottom'、どちらでもよければ def。
     自分で攻めを選んだ人は、def が何であっても 'top'（受ける場面にしない） */
  /* モブ相手の受け攻め（キャラの設定 posNpc：'top'｜'bottom'｜'riba'。''＝住人と同じ）。R18版だけ（全年齢では ''） */
  var NPCV = { top: 1, bottom: 1, riba: 1 };
  P.npcValid = function (v) { return NPCV[v] ? v : ''; };
  P.npc = function (c) { if (!c || HK.SAFE_ON) return ''; var v = c.posNpc != null && c.posNpc !== '' ? c.posNpc : c.src && c.src.posNpc; return NPCV[v] ? v : ''; };
  P.NPC_OPTS = [['', '住人と同じ'], ['top', '攻め'], ['bottom', '受け'], ['riba', 'リバ']];
  P.vsNpc = function (c, def) {
    /* モブ相手の受け攻め（posNpc）：住人どうしの指定とは別に、モブ・魔物・村人には攻め／受け／どちらでも */
    var n = P.npc(c);
    if (n === 'top' || n === 'bottom') return n;
    if (n === 'riba') return def || '';
    var v = P.of(c);
    if (v === 'top') return 'top';
    if (v === 'bottom') return 'bottom';
    return def || '';
  };
  /* モブ・魔物・道具に「される」場面に入れてよいか（自分で攻めを選んだ人は不可。モブ欄で受け・リバなら可、モブ欄で攻めなら不可） */
  P.canReceive = function (c) { var n = P.npc(c); if (n) return n !== 'top'; return !P.hardTop(c); };
  /* モブ・魔物との場面で、攻めに回る人か（攻め指定でも「モブには受け・リバ」なら受ける。モブ欄で攻めなら、全体が受けでも攻め） */
  P.hardTopNpc = function (c) { var n = P.npc(c); if (n) return n === 'top'; return P.hardTop(c); };
  /* 攻めを挿れる側の体で書いた女性の組（オメガバースの女性のα×Ω・β。omega-heat.js の OM.bodyKind が記録する）。
     女性どうし・女性上位の見直し（pos-ff.js・pos-fm.js）は、この組を直さない。名前の組 攻め\u0001受け */
  P.maleTop = {};
  P.isMaleTop = function (a, b) { return !!(a && b && P.maleTop[a.name + '\u0001' + b.name]); };
  P.reset = function () { lock = {}; P.maleTop = {}; };
  /* ノリノリな性格（奔放・衝動的）：受けやおまかせでも、自分から跨ったり誘ったりする */
  /* 夜の主導（lead。R18版だけ）：受けが主導（誘い受け・襲い受け）の人はノリノリ、攻めが主導の人はノリノリにしない */
  P.leadOf = function (c) { if (!c || HK.SAFE_ON) return ''; var v = src(c, 'lead'); return v === 'top' || v === 'sasoi' || v === 'osoi' ? v : ''; };
  P.nori = function (c) {
    var ld = P.leadOf(c);
    if (ld) return ld !== 'top';
    var t = (c && c.tr) || {}; if ((t.ac || 0) > 0.62 && (t.fc || 0) < 0.5) return false; return (t.fc || 0) > 0.6 || (t.impulse || 0) > 0.66;
  };
  /* 仕掛けた側 a がノリノリで、攻めの指定でなければ、自分が受けに回る向きを希望する */
  P.fbFor = function (a, b) { return P.nori(a) && P.of(a, b) !== 'top' && P.of(b, a) !== 'bottom' ? [b, a] : [a, b]; };

  /* 男性の体を前提にした言葉（女性どうしの場面で使ってはいけない）。点検にも使う */
  P.MALE_RE = /ちんぽ|ちんこ|ペニス|陰茎|肉棒|いちもつ|一物|男根|亀頭|勃起|射精|精液|白濁|種付け|孕ませ|中に出|中出し|子種|睾丸|カリ首|フェラ|裏筋|鈴口|先走り|怒張|剛直|屹立|\{(?:男性器|亀頭|精液)\}/;

  /* ---------- 合意のない展開の、切羽詰まった場面（2026-10-27 担当HC） ----------
     恋愛対象「なし」は「恋愛にならない」の意味に留める。内容のスイッチ「合意のない展開」が入のとき（展開の重さが穏やかなら切。mood-dial.js）、
     執着の暴走（監禁の夜）・歪んだ関係の拒めない夜・敵対する二人の強引なエッチ・出られない部屋の条件のエッチ では、恋愛対象「なし」の人も
     受け手・攻め手になれる（P.forceOpen の中だけ、恋愛対象「なし」を「おまかせ」として判定する）。
     恋愛対象（男性／女性）が相手の性別に合わない組・受け攻めの指定（攻めを選んだ人は受けにしない）・恋愛やR18にしない相手・R18に参加しない・
     性行為の相手の固定・無関心／恐怖・血縁は、これまでどおり越えない。恋愛（告白・恋人になる）にもならない（恋愛の出来事は ev.force を持たない）。
     使う側は、出来事の定義か結果に force: true を付け（engine.js の ctx.romanceOk が下の包みで開く）、理由（why）に P.FORCE_MARK を書く（orient-audit.js が見る） */
  P.FORCE_MARK = '〔合意のない展開〕';
  P.forceOn = function (x) { return !!(x && !HK.SAFE_ON && HK.Content && HK.Content.ok(x, 'force')); };
  /* 恋愛対象「なし」の人が入っている組か（理由の書き分け・点検用） */
  P.noneIn = function (list) { return (list || []).some(function (c) { return c && c.likes === 'none'; }); };
  /* 理由（why）に足す一文：恋愛対象「なし」の人が入っていて、合意のない展開が入のときだけ「／〔合意のない展開〕恋愛対象「なし」の○○も、…」（bare なら印を付けない。印をもう書いた理由に足すとき）。それ以外は '' */
  P.noneWhy = function (x, list, bare) {
    var L = (list || []).filter(function (c) { return c && c.likes === 'none'; });
    if (!L.length || !P.forceOn(x)) return '';
    return '／' + (bare ? '' : P.FORCE_MARK) + '恋愛対象「なし」の' + L.map(function (c) { return c.name; }).join('・') + 'も、切羽詰まった場面で体の関係になった（恋愛にはならない）';
  };
  /* fn() を、list の恋愛対象「なし」の人を「おまかせ」として判定する（合意のない展開が入のときだけ。切なら fn() そのまま） */
  function openNone(list, fn) {
    var L = (list || []).filter(function (c, i, a) { return c && c.likes === 'none' && a.indexOf(c) === i; });
    if (!L.length) return fn();
    L.forEach(function (c) { c.likes = ''; });
    try { return fn(); } finally { L.forEach(function (c) { c.likes = 'none'; }); }
  }
  P.forceOpen = function (x, list, fn) { return P.forceOn(x) ? openNone(list, fn) : fn(); };
  /* 切羽詰まった場面の体の関係の組か（HK.State.pairSex＝その場にいる・R18に参加する・受け攻めと恋愛対象が合う、を開いて見る） */
  P.okForce = function (x, a, b) { return P.forceOpen(x, [a, b], function () { return !!(HK.State && HK.State.pairSex ? HK.State.pairSex(a, b) : P.okSex(a, b)); }); };
  /* 恋愛の出来事を起こしてよいか（engine.js の ctx.romanceOk）：切羽詰まった体の場面（ev.force かつ ev.sex）だけ、恋愛対象「なし」を開いて見る */
  if (HK.Ctx && HK.wrap && !HK.Ctx.prototype.romanceOk._force) {
    HK.wrap(HK.Ctx.prototype, 'romanceOk', function (orig) {
      var f = function (actors, ev) {
        if (!(ev && ev.force && ev.sex)) return orig.apply(this, arguments);
        var self = this, args = arguments;
        return P.forceOpen(this, actors, function () { return orig.apply(self, args); });
      };
      f._force = true;
      return f;
    });
  }

  /* 恋愛対象「なし」の人が入る組の結末（2026-10-27 担当HC）：恋人・両片想い・片想い・夜の関係（関係図の分類 love／pine／night）にはしない。
     恋人になっている組（歪んだ関係など、遊ぶ人が決めた関係）はそのまま。切羽詰まった場面で体の関係になった組は「強いられた夜」（R18版だけ）、
     それ以外は仲のよさ・緊張から「友人」「気まずい」「他人のまま」に（engine.js の結末の分類の最後に通る HK.TieRel.refine を包む） */
  var FORCED = null;
  /* r18:begin */
  FORCED = { name: '強いられた夜', text: '恋愛にはならないまま、拒めなかった夜の記憶だけが残った。' };
  /* r18:end */
  var NONE_CLS = { love: 1, pine: 1, night: 1 };
  if (HK.TieRel && HK.TieRel.refine && HK.wrap && !HK.TieRel.refine._none) {
    HK.wrap(HK.TieRel, 'refine', function (orig) {
      var f = function (ctx, A, B, pf, cl) {
        var r = orig.apply(this, arguments), c = r || cl, L = c && HK.LABELS && HK.LABELS[c.id];
        if (!c || !L || !NONE_CLS[L.cls] || !pf || pf.couple || !P.noneIn([A, B])) return r;
        if (pf.night && FORCED && !HK.SAFE_ON) { if (!HK.LABELS.forced) HK.LABELS.forced = { name: FORCED.name, cls: 'obsess', pol: -1 }; return { id: 'forced' }; }
        var ab = ctx.R(A, B), ba = ctx.R(B, A);
        return { id: ab.aff > 24 && ba.aff > 24 ? 'friends' : (ab.ten + ba.ten) / 2 > 34 ? 'awkward' : 'strangers' };
      };
      f._none = true;
      return f;
    });
    if (HK.TieRel.pairText) HK.wrap(HK.TieRel, 'pairText', function (orig) { return function (ctx, A, B, cl) { return cl && cl.id === 'forced' && FORCED ? FORCED.text : orig.apply(this, arguments); }; });
  }

  /* 恋愛対象（受け攻め）を、恋愛できる相手の判定に加える */
  if (HK.canLove && !HK.canLove._pos) {
    var cl0 = HK.canLove;
    HK.canLove = function (a, b) { return cl0.apply(this, arguments) && (!a || !b || P.okLove(a, b)); };
    HK.canLove._pos = true;
  }
  /* 一回のシミュレーションごとに、組の向きの記憶をリセットする */
  if (HK.simulate && !HK.simulate._pos) {
    var orig = HK.simulate;
    HK.simulate = function (input) { P.reset(); return orig.apply(this, arguments); };
    HK.simulate._pos = true;
  }
})();
