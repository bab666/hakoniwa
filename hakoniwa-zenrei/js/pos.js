/* 箱庭シミュレーター: 受け攻めの指定
   キャラごとの pos = '' (おまかせ) | 'top' (攻め) | 'bottom' (受け) | 'riba' (リバ)
   女性は「攻め」を選ばない限り受けとして扱う（ただし自分で選んだ指定ではないので、女性同士では攻めにも回れる）。
   相手の受け攻めは本人の受け攻めから決まる（攻めなら受けとリバ・受けなら攻めとリバ・リバとおまかせは誰とでも）。
     「恋愛対象（受け攻め）」の欄（posLike）は 2026-10-28 に廃止（利用者の指示：本人の受け攻めで決まるので要らない）。古い保存の posLike は読まない
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

  /* ---------- 相手にできる受け攻め（本人の受け攻めから決まる） ---------- */
  /* c が相手として受け入れる「相手の指定」（o を渡すと、その相手への受け攻めで見る）。
     攻めなら受けとリバ、受けなら攻めとリバ（リバは相手に合わせて回れるので、相手にできる）、リバ・おまかせは誰とでも */
  P.likes = function (c, o) {
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
  /* sex が真なら体の関係の判定：恋愛対象「なし」の人は「体の関係の相手」（P.sexLikeOf。R18版だけ）で見る（2026-10-27 担当HG） */
  function likesOne(a, b, sex) {
    var v = a.likes;
    if (v === 'none') { if (!sex) return false; v = P.sexLikeOf(a); if (v === 'none') return false; }
    if (!v || v === 'both') return true;
    if (!b.gender || b.gender === 'x') return true;
    return v === b.gender;
  }
  /* sex を渡さなければ恋愛の判定（恋愛対象「なし」は誰とも合わない）。sex が真なら体の関係の判定 */
  P.genderOK = function (a, b, sex) { return !!(a && b) && likesOne(a, b, sex) && likesOne(b, a, sex); };
  /* love が真のときは恋愛の判定（P.okLove）として見る：体の関係だけを止める設定（R18に参加しない・性行為の相手の固定・一途の体の縛り）は見ず、
     恋愛・R18にしない組（engine.js の HK.ngPair：恋愛・R18にしない相手・恋愛相手の固定・同じ人の恋人どうし・無関心／恐怖）だけで止める */
  P.orients = function (a, b, love) {
    if (!a || !b || a === b) return [];
    /* 恋愛・R18にしない組（engine.js の HK.ngPair）は、どちらの向きでも成り立たない */
    /* 体の関係にならない組（engine.js の HK.sexBlocked：恋愛・R18にしない相手・同じ人の恋人どうし・性行為の相手の固定）。
       恋愛相手の固定が食い違うだけの組は、性行為の相手の固定で「誰とでも可」などにしていれば体の関係になれる（恋愛には進まない） */
    if (love ? (HK.ngPair && HK.ngPair(a, b)) : HK.sexBlocked ? HK.sexBlocked(a, b) : (HK.ngPair && HK.ngPair(a, b))) return [];
    /* 恋愛対象（キャラの設定の性別）が合わない組：どちらの向きでも成り立たない（恋愛にも体の関係にもしない） */
    if (!P.genderOK(a, b, !love)) return [];
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
    /* 恋愛対象「なし」の人が入る組：体の関係の判定（P.orients の love でないとき）は「体の関係の相手」で見るので、ふつうはここで向きが決まる。
       決まらないときの念のため、体の関係の相手として開いて向きを決める（受け攻めの指定どおりに。openNone） */
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

  /* ---------- 恋愛対象「なし」の人の体の関係と、性欲の強さ（2026-10-27 担当HC・HG） ----------
     恋愛対象「なし」は「恋愛（告白・恋人・片想い・本命）にならない」の意味に留める（HK.canLove・P.okLove は引き続き不可）。
     体の関係（セフレ・一夜・勢いの夜・部屋の条件・執着の監禁・拒めない夜・強引なエッチ）は、R18版だけの欄「体の関係の相手」（sexLikes）で見る：
       ''（おまかせ）＝相手の恋愛対象・受け攻めに合わせる／m 男性／f 女性／both 男女両方／none なし（体の関係にもならない。合意のない展開でも）。
     体の関係の判定（P.orients の love でないとき＝P.okSex・HK.State.pairSex）は、恋愛対象「なし」の人をこの欄の性別で見る（likesOne の sex）。
     恋愛の判定（HK.canLove・ctx.romanceOk の恋愛の出来事）は、体の出来事（ev.sex）のときだけ、この欄で開いて見る（openNone）。
     体の関係になっても恋愛には進まない（惹かれは engine.js の mod が恋愛できない組として育てない。結末は下の TieRel.refine の包みで「セフレ」「一夜の関係」）。
     性欲の強さ（libido。R18版だけ。全住人）：''（ふつう）／none なし／low 弱い／high 強い。
       合意ありの性的な出来事の起こりやすさに、二人の倍率を掛ける（P.libMul：弱い ×0.5・ふつう ×1・強い ×1.6。二人とも強ければ ×2.56）。
       「なし」の人は合意ありの性的な出来事に乗らない（ctx.romanceOk の体の出来事・HK.State.pairSex が偽。恋愛は止めない）。
       合意のない展開の経路（P.forceOpen の中・ev.force の出来事）は、性欲に関係なく内容のスイッチどおり。
       既定（ふつう）の人だけの回は倍率が 1 で、乱数の消費も変えない（倍率は確率・重みの計算にだけ掛ける）
     合意のない展開の、切羽詰まった場面（担当HC）：内容のスイッチ「合意のない展開」が入のとき（展開の重さが穏やかなら切。mood-dial.js）、
     執着の暴走（監禁の夜）・歪んだ関係の拒めない夜・敵対する二人の強引なエッチ・出られない部屋の条件のエッチ では、恋愛対象「なし」の人も
     受け手・攻め手になれる（P.forceOpen の中だけ、恋愛対象「なし」を「体の関係の相手」として判定する）。
     恋愛対象（男性／女性）が相手の性別に合わない組・受け攻めの指定（攻めを選んだ人は受けにしない）・恋愛やR18にしない相手・R18に参加しない・
     性行為の相手の固定・無関心／恐怖・血縁は、これまでどおり越えない。恋愛（告白・恋人になる）にもならない（恋愛の出来事は ev.force を持たない）。
     使う側は、出来事の定義か結果に force: true を付け（engine.js の ctx.romanceOk が下の包みで開く）、理由（why）に P.FORCE_MARK を書く（orient-audit.js が見る） */
  P.FORCE_MARK = '〔合意のない展開〕';
  P.forceOn = function (x) { return !!(x && !HK.SAFE_ON && HK.Content && HK.Content.ok(x, 'force')); };
  /* 体の関係の相手（恋愛対象「なし」の人だけが使う）：''／m／f／both／none。全年齢版・全年齢モードでは 'none'（体の関係にならない） */
  var SEXLIKE_V = { m: 1, f: 1, both: 1, none: 1 };
  P.sexLikeOf = function (c) { if (!c || HK.SAFE_ON) return 'none'; var v = src(c, 'sexLikes'); return SEXLIKE_V[v] ? v : ''; };
  /* 性欲の強さ：''（ふつう）／none／low／high。全年齢版・全年齢モードでは ''（倍率 1） */
  P.LIB_K = { none: 0, low: 0.5, high: 1.6 };
  P.libOf = function (c) { if (!c || HK.SAFE_ON) return ''; var v = src(c, 'libido'); return P.LIB_K[v] != null ? v : ''; };
  P.libK = function (c) { var v = P.libOf(c); return v ? P.LIB_K[v] : 1; };
  /* 合意ありの性的な出来事の倍率（その場の二人・一人。同じ人は一度だけ数える） */
  P.libMul = function (list) { var m = 1; (list || []).forEach(function (c, i, a) { if (c && a.indexOf(c) === i) m *= P.libK(c); }); return m; };
  P.libNone = function (list) { return (list || []).some(function (c) { return P.libOf(c) === 'none'; }); };
  /* 合意のない展開の判定の中か（P.forceOpen の中。性欲「なし」でも止めない） */
  var forcing = 0;
  P.forcing = function () { return forcing > 0; };
  /* 合意ありの性的な出来事に乗れる組か（性欲「なし」の人がいれば偽。合意のない展開の判定の中では真） */
  P.libOK = function (list) { return forcing > 0 || !P.libNone(list); };
  /* 恋愛対象「なし」の人が入っている組か（理由の書き分け・点検用） */
  P.noneIn = function (list) { return (list || []).some(function (c) { return c && c.likes === 'none'; }); };
  /* 理由（why）に足す一文：恋愛対象「なし」の人が入っていて、合意のない展開が入のときだけ「／〔合意のない展開〕恋愛対象「なし」の○○も、…」（bare なら印を付けない。印をもう書いた理由に足すとき）。それ以外は '' */
  P.noneWhy = function (x, list, bare) {
    var L = (list || []).filter(function (c) { return c && c.likes === 'none'; });
    if (!L.length || !P.forceOn(x)) return '';
    return '／' + (bare ? '' : P.FORCE_MARK) + '恋愛対象「なし」の' + L.map(function (c) { return c.name; }).join('・') + 'も、切羽詰まった場面で体の関係になった（恋愛にはならない）';
  };
  /* fn() を、list の恋愛対象「なし」の人を「体の関係の相手」の性別で判定する（体の関係の相手が「なし」の人は開かない） */
  function openNone(list, fn) {
    var L = (list || []).filter(function (c, i, a) { return c && c.likes === 'none' && a.indexOf(c) === i && P.sexLikeOf(c) !== 'none'; });
    if (!L.length) return fn();
    L.forEach(function (c) { c.likes = P.sexLikeOf(c); });
    try { return fn(); } finally { L.forEach(function (c) { c.likes = 'none'; }); }
  }
  P.openNone = openNone;
  /* 合意のない展開の判定：入なら、恋愛対象「なし」を開き、性欲「なし」でも止めない（切なら fn() そのまま） */
  P.forceOpen = function (x, list, fn) {
    if (!P.forceOn(x)) return fn();
    forcing++;
    try { return openNone(list, fn); } finally { forcing--; }
  };
  /* 切羽詰まった場面の体の関係の組か（HK.State.pairSex＝その場にいる・R18に参加する・受け攻めと恋愛対象が合う、を開いて見る） */
  P.okForce = function (x, a, b) { return P.forceOpen(x, [a, b], function () { return !!(HK.State && HK.State.pairSex ? HK.State.pairSex(a, b) : P.okSex(a, b)); }); };
  /* 恋愛の出来事を起こしてよいか（engine.js の ctx.romanceOk）：
     ・合意ありの体の出来事（ev.sex で ev.force でない）：性欲「なし」の人がいれば起こさない。恋愛対象「なし」の人は「体の関係の相手」で開いて見る
     ・切羽詰まった体の場面（ev.force かつ ev.sex）：恋愛対象「なし」を開き、性欲は見ない（合意のない展開が入のとき） */
  if (HK.Ctx && HK.wrap && !HK.Ctx.prototype.romanceOk._force) {
    HK.wrap(HK.Ctx.prototype, 'romanceOk', function (orig) {
      var f = function (actors, ev) {
        if (!(ev && ev.sex) || HK.SAFE_ON) return orig.apply(this, arguments);
        var self = this, args = arguments;
        if (ev.force) return P.forceOpen(this, actors, function () { return orig.apply(self, args); });
        if (!P.libOK(actors)) return false;
        return P.noneIn(actors) ? openNone(actors, function () { return orig.apply(self, args); }) : orig.apply(this, arguments);
      };
      f._force = true;
      return f;
    });
  }
  /* 住人どうしの体の関係（engine.js の HK.State.pairSex）：性欲「なし」の人は、合意のない展開の判定の中でなければ偽 */
  if (HK.State && HK.State.pairSex && HK.wrap && !HK.State.pairSex._lib) {
    HK.wrap(HK.State, 'pairSex', function (orig) { var f = function (a, b) { return orig.apply(this, arguments) && P.libOK([a, b]); }; f._lib = true; return f; });
  }

  /* 恋愛対象「なし」の人が入る組の結末（2026-10-27 担当HC・HG）：恋人・両片想い・片想い（関係図の分類 love／pine）にはしない。
     恋人になっている組（歪んだ関係など、遊ぶ人が決めた関係）はそのまま。夜のある組（分類 night・love）は、
     合意ありの体の場面があれば「セフレ」（体だけの関係の印 pf.fwb か、二度以上）か「一夜の関係」、切羽詰まった場面だけなら「強いられた夜」（R18版だけ）。
     夜のない組は仲のよさ・緊張から「友人」「気まずい」「他人のまま」に（engine.js の結末の分類の最後に通る HK.TieRel.refine を包む） */
  var FORCED = null;
  /* r18:begin */
  FORCED = { name: '強いられた夜', text: '恋愛にはならないまま、拒めなかった夜の記憶だけが残った。' };
  /* r18:end */
  var NONE_CLS = { love: 1, pine: 1, night: 1 };
  /* 二人の性的な場面の数（合意あり／切羽詰まった場面＝理由に P.FORCE_MARK） */
  function nightKinds(ctx, A, B) {
    var o = { con: 0, force: 0 };
    (ctx.log || []).forEach(function (e) {
      if (!e || !e.lewd || !e.actors || e.actors.indexOf(A.i) < 0 || e.actors.indexOf(B.i) < 0) return;
      if (String(e.why || '').indexOf(P.FORCE_MARK) >= 0) o.force++; else o.con++;
    });
    return o;
  }
  P.nightKinds = nightKinds;
  if (HK.TieRel && HK.TieRel.refine && HK.wrap && !HK.TieRel.refine._none) {
    HK.wrap(HK.TieRel, 'refine', function (orig) {
      var f = function (ctx, A, B, pf, cl) {
        var r = orig.apply(this, arguments), c = r || cl, L = c && HK.LABELS && HK.LABELS[c.id];
        if (!c || !L || !NONE_CLS[L.cls] || !pf || pf.couple || !P.noneIn([A, B])) return r;
        if (pf.night && !HK.SAFE_ON) {
          var k = nightKinds(ctx, A, B);
          if (k.con > 0 || pf.fwb || !k.force || !FORCED) return { id: pf.fwb || k.con >= 2 || (pf.nights || 0) >= 2 ? 'fwbsettle' : 'night' };
          if (!HK.LABELS.forced) HK.LABELS.forced = { name: FORCED.name, cls: 'obsess', pol: -1 };
          return { id: 'forced' };
        }
        var ab = ctx.R(A, B), ba = ctx.R(B, A);
        return { id: ab.aff > 24 && ba.aff > 24 ? 'friends' : (ab.ten + ba.ten) / 2 > 34 ? 'awkward' : 'strangers' };
      };
      f._none = true;
      return f;
    });
    if (HK.TieRel.pairText) HK.wrap(HK.TieRel, 'pairText', function (orig) { return function (ctx, A, B, cl) { return cl && cl.id === 'forced' && FORCED ? FORCED.text : orig.apply(this, arguments); }; });
  }

  /* ---------- 三人の場面（3P）の組み方（2026-10-27 担当HL。利用者の決まり） ----------
     HK.Pos.trioPlan(a, b, c, opt) → null、または { pairs: [[x, y], …], hub: 人|null, all: 真偽, watch: [[x, y], …] }
     ・住人の設定「三人の場面（3P）」（c.trio）が 'no' の人がいれば null（未設定・ほかの値は「する」。古い「固定した相手が中心なら参加する」の値は読まない）
     ・pairs：直接の行為をしてよい組。HK.State.pairSex（その場にいる・R18に参加する・受け攻めと恋愛対象（体の関係）・恋愛やR18にしない相手・
       性行為の相手の固定（固定した人は固定した相手とだけ）・性欲「なし」）＋ opt.ok(x, y)（箱庭ごとの条件：恋愛・体だけの関係・合意など）
     ・三組とも直接できれば all（hub は null）。二組なら、両方の組に入る人が中心（hub）。残りの一組（watch）は同じ場にいても触れ合わない（見ている・声をかける程度）
     ・直接できる組が一つ以下なら null（3P にせず、二人の場面に落とす）。全年齢版・全年齢モードでは常に null
     ・形（誰が誰を抱くか）は呼ぶ側が pairs の向き（HK.Pos.order）で決め、作れなければ 3P にしない */
  /* r18:begin */
  /* ---------- 体の関係を持てない理由（2026-10-28 担当JB。利用者の不具合報告「なんで持てないのか、理由を表示してほしい」） ----------
     HK.Pos.noSexInfo(a, b, opt) → null（持てる）か { k: 理由の種類, t: 理由（利用者向けの言葉）, fix: 直し方 }。HK.Pos.whyNoSex(a, b, opt) は t だけ。
     判定は出られない部屋の okSex（scenario-room.js：HK.Pos.okSex＝orients〔HK.sexBlocked・恋愛対象・受け攻め〕＋性欲 libOK＋恋愛にしない関係 HK.roomWsNoSex）と
     同じものを、利用者に伝える順に見る：R18に参加しない／性欲の強さ「なし」／恋愛対象が合わない／体の関係の相手「なし」／恋愛・R18にしない相手／
     同じ人の恋人どうし／性行為の相手の固定（恋愛相手の固定に合わせている場合を含む）／一途／関係「無関心」「恐怖」・恋愛なしの家族／
     部屋の恋愛にしない関係／受け攻め。どれにも当たらないのに持てない組は、受け攻めの理由にまとめる（okSex と食い違わない）。
     opt.ctx（無ければ HK._curCtx）：名前を引く住人の並び・関係。opt.room が偽なら部屋の恋愛にしない関係を、opt.lib が偽なら性欲の強さを見ない（性欲を見ない R18 が中心の箱庭）。opt.ties：入力の関係（物語型・一人用の箱庭で、関係から入った ng を関係の理由で書く）。R18版だけ（全年齢版には無いので、呼ぶ側は HK.Pos.whyNoSex があるときだけ使う） */
  var LIKE_JA = { m: '男性', f: '女性', both: '男女両方', none: 'なし' }, GEN_JA = { m: '男性', f: '女性' };
  var POS_JA = { top: '攻め', bottom: '受け', riba: 'リバ' };
  P.noSexInfo = function (a, b, opt) {
    if (!a || !b || a === b) return null;
    opt = opt || {};
    var ctx = opt.ctx || HK._curCtx, C = ctx && ctx.chars, pr = [[a, b], [b, a]], i, x, y;
    var nameOf = function (k) { var c = C && k >= 0 ? C[k] : null; return c ? c.name : 'この箱庭にいない人'; };
    var gen = function (c) { return GEN_JA[c.gender] ? '（' + GEN_JA[c.gender] + '）' : ''; };
    for (i = 0; i < 2; i++) { x = pr[i][0]; if (x.noR18) return { k: 'noR18', t: x.name + 'が「R18に参加しない」', fix: x.name + 'の「R18に参加しない」を外す' }; }
    for (i = 0; i < 2 && opt.lib !== false; i++) { x = pr[i][0]; if (!P.libOK([x])) return { k: 'lib', t: x.name + 'の性欲の強さが「なし」', fix: x.name + 'の「性欲の強さ」を「ふつう」などにする' }; }
    for (i = 0; i < 2; i++) {
      x = pr[i][0]; y = pr[i][1];
      if (likesOne(x, y, true)) continue;
      if (x.likes === 'none') {
        var sl = P.sexLikeOf(x);
        if (sl === 'none' || !sl) return { k: 'sexLikes', t: x.name + 'の恋愛対象が「なし」で、体の関係の相手も「なし」', fix: x.name + 'の「体の関係の相手」を選ぶ' };
        return { k: 'sexLikes', t: x.name + 'の体の関係の相手「' + (LIKE_JA[sl] || sl) + '」に、' + y.name + gen(y) + 'が合わない', fix: x.name + 'の「体の関係の相手」を変える' };
      }
      return { k: 'likes', t: x.name + 'の恋愛対象「' + (LIKE_JA[x.likes] || x.likes) + '」に、' + y.name + gen(y) + 'が合わない', fix: x.name + 'の「恋愛対象」を変える' };
    }
    /* 物語型・一人用の箱庭は、関係「無関心」「恐怖」・「恋愛：なし」の家族を ng（恋愛・R18にしない相手）に入れて止める（engine.js の HK.fearInput・fam-kin.js の HK.kinNG）。
       opt.ties（入力の関係）を渡されたら、その関係がある組は関係の理由で書く（「恋愛・R18にしない相手」と書くと、利用者は設定を探しても見つからないため） */
    var tieNo = function (x, y) {
      return (opt.ties || []).filter(function (t) { return t && ((t.a === x.i && t.b === y.i) || (t.a === y.i && t.b === x.i)) && (t.type === 'apathy' || t.type === 'fear' || (HK.tieNoLove && HK.tieNoLove(t))); })[0] || null;
    };
    for (i = 0; i < 2; i++) {
      x = pr[i][0]; y = pr[i][1];
      if (!(x.ng && x.ng.indexOf(y.i) >= 0)) continue;
      var tn = tieNo(x, y);
      if (tn) return { k: 'noLove', t: a.name + 'と' + b.name + 'は' + (tn.type === 'apathy' ? '関係「無関心」' : tn.type === 'fear' ? '関係「恐怖」' : '「恋愛：なし」の家族（' + ((HK.TIES && HK.TIES[tn.type] && HK.TIES[tn.type].label) || tn.type) + '）') + 'の二人', fix: '二人の関係を変える（家族なら関係の「恋愛」を「あり」にする）' };
      return { k: 'ng', t: x.name + 'が' + y.name + 'を「恋愛・R18にしない相手」にしている', fix: x.name + 'の「恋愛・R18にしない相手」から' + y.name + 'を外す' };
    }
    if ((a.coNG && a.coNG.indexOf(b.i) >= 0) || (b.coNG && b.coNG.indexOf(a.i) >= 0)) return { k: 'coNG', t: a.name + 'と' + b.name + 'は同じ人の恋人どうし（恋人が複数いる人の恋人どうしは、体の関係にしない）', fix: a.name + 'と' + b.name + 'のあいだに恋愛の関係（恋人・セフレ など）を足すか、恋人の関係を見直す' };
    for (i = 0; i < 2; i++) {
      x = pr[i][0]; y = pr[i][1];
      var s = x.sexLock;
      if (s === 'any') continue;
      if (Array.isArray(x.sexLocks) || typeof s === 'number') {
        if (HK.sexLockOut && HK.sexLockOut(x, y)) return { k: 'sexLock', t: x.name + 'は性行為の相手を' + (Array.isArray(x.sexLocks) ? x.sexLocks : [s]).map(nameOf).join('・') + 'に固定している', fix: x.name + 'の「性行為の相手の固定」に' + y.name + 'を足すか、「誰とでも可」にする' };
      } else if (HK.lockOut && HK.lockOut(x, y)) {
        return { k: 'loveLock', t: x.name + 'は恋愛相手を' + HK.locks(x).map(nameOf).join('・') + 'に固定していて、性行為の相手は「恋愛相手の固定に合わせる」になっている', fix: x.name + 'の「性行為の相手の固定」を「誰とでも可」にすると持てる（恋愛には進まない）' };
      }
    }
    for (i = 0; i < 2; i++) { x = pr[i][0]; y = pr[i][1]; if (HK.Poly && HK.Poly.faithNG && HK.Poly.faithNG(x, y)) return { k: 'faith', t: x.name + 'は一途で、恋人がいる間は恋人以外と体の関係を持たない', fix: x.name + 'の「一途」を外す' }; }
    if (HK.noLovePair && HK.noLovePair(a, b)) {
      var T0 = HK.Ties, kind = ctx && T0 && T0.has ? (T0.has(ctx, a, b, 'apathy') ? '関係「無関心」' : T0.has(ctx, a, b, 'fear') ? '関係「恐怖」' : '「恋愛：なし」の家族') : '関係「無関心」「恐怖」か「恋愛：なし」の家族';
      return { k: 'noLove', t: a.name + 'と' + b.name + 'は' + kind + 'の二人', fix: '二人の関係を変える（家族なら関係の「恋愛」を「あり」にする）' };
    }
    if (opt.room !== false && HK.roomWsNoSex && HK.roomWsNoSex(ctx, a, b)) return { k: 'room', t: a.name + 'と' + b.name + 'は恋愛にしない関係（「恋愛：なし」の家族・信仰）', fix: '二人の関係の「恋愛」を「あり」にする' };
    if (!P.okSex(a, b)) {
      var lab = function (c, o) { return explicit(c, o) ? POS_JA[P.of(c, o)] || 'おまかせ' : 'おまかせ'; };
      return { k: 'pos', t: '受け攻めが合わない（' + a.name + '：' + lab(a, b) + '・' + b.name + '：' + lab(b, a) + '）', fix: '受け攻め（相手ごとの指定・「相手の受け攻め」）を、どちらかが受けかリバに回れるようにする' };
    }
    return null;
  };
  P.whyNoSex = function (a, b, opt) { var r = P.noSexInfo(a, b, opt); return r ? r.t : null; };
  /* r18:end */

  P.trioOptOut = function (c) { return src(c, 'trio') === 'no'; };
  P.trioPlan = function (a, b, c, opt) {
    var m = [a, b, c];
    if (HK.SAFE_ON || !a || !b || !c || a === b || b === c || a === c) return null;
    if (m.some(P.trioOptOut)) return null;
    /* 恋愛・R18にしない相手どうしは、触れ合わない組でも同じ三人に入れない（出られない部屋と同じ扱い。2026-10-27） */
    if (HK.ngExplicit && (HK.ngExplicit(a, b) || HK.ngExplicit(a, c) || HK.ngExplicit(b, c))) return null;
    var ok = function (x, y) { return !!(HK.State && HK.State.pairSex ? HK.State.pairSex(x, y) : P.okSex(x, y)) && (!opt || !opt.ok || !!opt.ok(x, y)); };
    var all = [[a, b], [a, c], [b, c]], pairs = all.filter(function (pr) { return ok(pr[0], pr[1]); });
    if (pairs.length === 3) return { pairs: pairs, hub: null, all: true, watch: [] };
    if (pairs.length < 2) return null;
    var hub = m.filter(function (x) { return pairs[0].indexOf(x) >= 0 && pairs[1].indexOf(x) >= 0; })[0];
    return { pairs: pairs, hub: hub, all: false, watch: all.filter(function (pr) { return pairs.indexOf(pr) < 0; }) };
  };

  /* ---------- 性的な出来事の起こりやすさ（2026-10-28 担当MC。利用者の指示「性的イベントは性欲＋衝動性で判定し、恋愛感情が発生を防がないように」） ----------
     可否は P.okSex（＋R18に参加しない・性欲「なし」・固定。HK.State.pairSex）だけで決め、恋愛の可否（HK.canLove）は門にしない。
     ・P.hostK(a, b)：敵対・不仲の二人の倍率（ties.js の HK.hostMark が付けた hostOf。敵対 0.6・不仲 0.7、愛憎があれば戻す。関係が無ければ 1）
     ・P.sexRel(ctx, a, b)：関係の補正。恋人 1.3・体の関係のある二人 1.2・片想い 1.15、敵対・不仲は hostK。「恋愛：なし」の組は ±0（1）
     ・P.sexDrive(ctx, a, b)：0〜1。性欲（P.libK）＋衝動性（tr.impulse）＋状況（酔い・媚薬・発情・火照り（気分 lust）・ストレス・もう夜を過ごした）を主にし、
       理性（P.reason：CP・慎重さ・A・我慢の値・媚薬ロッカーの理性メーター）で起きにくくする（P.reasonK：理性が高い ×0.55 前後〜低い ×1.25。0 にはしない。
       酒・媚薬・発情・火照り・出られない部屋の条件・もう体の関係がある、は理性の効きを弱める。2026-10-28 利用者の追加の指示「理性なども加味して」）、
       sexRel を掛ける。全年齢版・全年齢モード・体の関係にならない組（HK.State.pairSex）では 0。
       環境値「夜の起こりやすさ」の倍率（P.nightK）はここでは掛けない（惹かれの壁（dv）と出来事の重みの両方に効いて二重になるため。
       出来事の重み（engine.js の act）・物語型の箱庭の夜の見込み・free-sex.js の F.chance の側で一度だけ掛ける。2026-10-29 担当MI）
     ・P.driveWhy(ctx, a, b)：理由（why）に足す内訳の短い語（「性欲 強・衝動 高・理性 低」）
       各箱庭の夜の確率式は今までどおりで、恋愛の条件を外した「体の関係の経路」（free-sex.js の HK.State.freeSex）の起こりやすさに使う */
  P.hostK = function (a, b) {
    if (!a || !b || a === b) return 1;
    var x = a.hostOf && a.hostOf[b.i], y = b.hostOf && b.hostOf[a.i];
    if (x == null && y == null) return 1;
    return Math.min(x == null ? 1 : x, y == null ? 1 : y);
  };
  P.hostile = function (a, b) { return !!(a && b && a !== b && ((a.hostOf && a.hostOf[b.i] != null) || (b.hostOf && b.hostOf[a.i] != null))); };
  function pfOf(ctx, a, b) { return ctx && HK.Ctx && ctx instanceof HK.Ctx ? ctx.pair(a, b) : null; }
  P.sexRel = function (ctx, a, b) {
    var pf = pfOf(ctx, a, b), m = P.hostK(a, b);
    if (pf && pf.couple) m *= 1.3;
    else if (pf && (pf.fwb || pf.night)) m *= 1.2;
    else if (ctx && HK.Ties && HK.Ties.from && pf && (HK.Ties.from(ctx, a, b, 'crush') || HK.Ties.from(ctx, b, a, 'crush'))) m *= 1.15;
    return m;
  };
  P.sexDrive = function (ctx, a, b) {
    if (!a || !b || a === b || HK.SAFE_ON) return 0;
    if (HK.State && HK.State.pairSex ? !HK.State.pairSex(a, b) : !P.okSex(a, b)) return 0;
    var lib = Math.sqrt(P.libK(a) * P.libK(b));
    var imp = (((a.tr && a.tr.impulse) != null ? a.tr.impulse : 0.4) + ((b.tr && b.tr.impulse) != null ? b.tr.impulse : 0.4)) / 2;
    var fl = function (c, k) { return Math.max((c.flags && +c.flags[k]) || 0, k === 'aphro' && c.aphro ? 1 : 0); };
    var drunk = (fl(a, 'drunk') + fl(b, 'drunk')) / 200;
    var aph = Math.min(1, (fl(a, 'aphro') + fl(b, 'aphro')) / 2);
    var heat = Math.min(1, Math.max((a.m && +a.m.heat) || 0, (b.m && +b.m.heat) || 0, (a.om && +a.om.heat > 0 ? 80 : 0), (b.om && +b.om.heat > 0 ? 80 : 0)) / 100);
    var lust = Math.min(1, (((a.emo && a.emo.lust) || 0) + ((b.emo && b.emo.lust) || 0)) / 200);
    var st = ((a.stress || 0) + (b.stress || 0)) / 200;
    var pf = pfOf(ctx, a, b);
    var sit = Math.min(0.4, drunk * 0.25 + aph * 0.25 + heat * 0.2 + lust * 0.15 + st * 0.05 + (pf && pf.night ? 0.08 : 0));
    return HK.clamp((0.12 + imp * 0.45 + sit) * lib * P.reasonK(ctx, a, b) * P.sexRel(ctx, a, b), 0, 1);
  };
  /* ---------- 環境値「夜の起こりやすさ」（R18版の全体の環境値 night。events-common.js。2026-10-29 担当MI。利用者の指示「夜の起こりやすさも環境でできるように」） ----------
     ・P.night(ctx)：値（0〜100）。指定が無い（古い記録・全年齢版・全年齢モード）なら既定の 50
     ・P.nightK(ctx)：倍率。50 で 1・100 で 1.7・0 で 0（恋愛の起こりやすさと同じ形 0.3 + 値/50×0.7）。全年齢モード・R18が中心の箱庭（HK.State.R18_CORE）では 1
       住人どうしの合意の夜の入口（エンジンの出来事の重み・物語型の箱庭の夜の見込み・F.chance）に一度だけ掛ける（sexDrive には掛けない）。合意のない展開（force）・モブの夜・出られない部屋の条件の夜には掛けない
     ・P.nightOff(ctx)：0 で住人どうしの合意の夜を止めるか（engine.js の romanceOk の守り・物語型の箱庭の入口）。出られない部屋で条件に体の関係があるときは止めない（条件の夜） */
  P.night = function (ctx) {
    var v = ctx && ctx.env ? ctx.env.night : null;
    if (v == null || v === '' || isNaN(+v)) return 50;
    return HK.clamp(+v, 0, 100);
  };
  P.nightK = function (ctx) {
    if (HK.SAFE_ON) return 1;
    var v = P.night(ctx);
    if (v === 50) return 1;
    var sid = ctx ? (ctx.scen ? ctx.scen.id : ctx.scenId) : null;   /* scenId：特殊能力（special.js）の受け渡し A */
    if (sid && HK.State && HK.State.R18_CORE && HK.State.R18_CORE[sid]) return 1;
    return v <= 0 ? 0 : 0.3 + v / 50 * 0.7;
  };
  P.roomCond = function (ctx) { return !!(ctx && ctx.scen && ctx.scen.id === 'whiteroom' && Array.isArray(ctx.rules) && ctx.rules.some(function (r) { return r && r.k === 'h'; })); };
  P.nightOff = function (ctx) { return P.nightK(ctx) === 0 && !P.roomCond(ctx); };
  /* 夜の起こりやすさが 0 なのに起きた性的な場面（記録の e.lewd）の理由の欄に、止めなかった理由を添える（engine.js の Ctx.say・solo-story-kit.js の ST.say）。
     o：記録の元（actors・force・why）。止めない場面でなければ ''（住人どうしの合意の夜は 0 では起きないので、ふつうは付かない） */
  P.nightNote = function () { return ''; };
  /* r18:begin */
  P.nightNote = function (ctx, o) {
    if (HK.SAFE_ON || !ctx || !ctx.env || ctx.env.night == null || P.night(ctx) !== 0 || !o) return '';
    var sid = ctx.scen ? ctx.scen.id : ctx.scenId, head = '夜の起こりやすさ 0 でも止めない：';
    if (sid && HK.State && HK.State.R18_CORE && HK.State.R18_CORE[sid]) return head + 'R18が中心の箱庭の題材の場面';
    if (P.roomCond(ctx)) return head + '出られない部屋の条件の夜';
    if (o.force || (ctx._ev && ctx._ev.force) || (P.FORCE_MARK && String(o.why || '').indexOf(P.FORCE_MARK) >= 0)) return head + '合意のない展開';
    var who = {}; (o.actors || []).forEach(function (x) { var i = x != null && typeof x === 'object' ? x.i : x; if (i != null && i >= 0) who[i] = 1; });
    if (Object.keys(who).length < 2) return head + 'モブ・一人の場面';
    return '';
  };
  /* r18:end */
  /* 理性（0〜1）：規範（CP）・慎重さ・冷静さ（A）・我慢の値（stats.gaman 1〜5。あれば）・理性メーター（m.reason 0〜100。媚薬ロッカー） */
  P.reason = function (c) {
    if (!c) return 0.5;
    var t = c.tr || {}, v = (t.cp != null ? t.cp : 0.5) * 0.4 + (t.caution != null ? t.caution : 0.5) * 0.3 + (t.a != null ? t.a : 0.5) * 0.3;
    var g = c.stats && c.stats.gaman != null ? +c.stats.gaman : null;
    if (g != null && !isNaN(g)) v = v * 0.7 + HK.clamp((g - 1) / 4, 0, 1) * 0.3;
    if (c.m && c.m.reason != null && !isNaN(+c.m.reason)) v = Math.min(v, HK.clamp(+c.m.reason / 100, 0, 1));
    return HK.clamp(v, 0, 1);
  };
  /* 理性の効きを弱める状況（0〜0.85）：酒・媚薬（flags.aphro、物語型の箱庭の印 c.aphro）・発情・火照り・ストレス・出られない部屋の条件（体の関係・キス）・もう夜を過ごした */
  P.reasonErode = function (ctx, a, b) {
    var fl = function (c, k) { return Math.max((c.flags && +c.flags[k]) || 0, k === 'aphro' && c.aphro ? 1 : 0); };
    var drunk = (fl(a, 'drunk') + fl(b, 'drunk')) / 200, aph = Math.min(1, (fl(a, 'aphro') + fl(b, 'aphro')) / 2);
    var heat = Math.min(1, Math.max((a.m && +a.m.heat) || 0, (b.m && +b.m.heat) || 0, (a.om && +a.om.heat > 0 ? 80 : 0), (b.om && +b.om.heat > 0 ? 80 : 0)) / 100);
    var lust = Math.min(1, (((a.emo && a.emo.lust) || 0) + ((b.emo && b.emo.lust) || 0)) / 200), st = ((a.stress || 0) + (b.stress || 0)) / 200;
    var room = !!(ctx && ctx.scen && ctx.scen.id === 'whiteroom' && Array.isArray(ctx.rules) && ctx.rules.some(function (r) { return r && (r.k === 'h' || r.k === 'kiss'); }));
    var pf = pfOf(ctx, a, b);
    return Math.min(0.85, drunk * 0.6 + aph * 0.6 + heat * 0.5 + lust * 0.3 + st * 0.2 + (room ? 0.35 : 0) + (pf && (pf.night || pf.fwb) ? 0.25 : 0));
  };
  /* 理性の倍率：二人の理性の平均（状況で削れたあと）が高いほど起きにくい（1 で ×0.55、0 で ×1.25）。止めはしない */
  P.reasonK = function (ctx, a, b) {
    var r = (P.reason(a) + P.reason(b)) / 2 * (1 - P.reasonErode(ctx, a, b));
    return HK.clamp(1.25 - r * 0.7, 0.55, 1.25);
  };
  /* 理性で踏みとどまる見込みの逆（0.61〜1）：起きるかどうかを一度だけ決める箇所（物語型の箱庭の夜など）で、理性がふつうより高い二人だけ起きにくくする（低い二人は 1） */
  P.reasonP = function (ctx, a, b) { return HK.SAFE_ON || !a || !b ? 1 : Math.min(1, P.reasonK(ctx, a, b) / 0.9); };
  var LIB_W = { none: 'なし', low: '弱', high: '強' };
  P.driveWhy = function (ctx, a, b) {
    var lv = function (v) { return v >= 0.62 ? '高' : v <= 0.38 ? '低' : '中'; };
    var lb = function (c) { return LIB_W[P.libOf(c)] || '中'; };
    var imp = ((a.tr && a.tr.impulse != null ? a.tr.impulse : 0.4) + (b.tr && b.tr.impulse != null ? b.tr.impulse : 0.4)) / 2;
    var r = (P.reason(a) + P.reason(b)) / 2 * (1 - P.reasonErode(ctx, a, b));
    return '性欲 ' + (lb(a) === lb(b) ? lb(a) : lb(a) + '／' + lb(b)) + '・衝動 ' + lv(imp) + '・理性 ' + lv(r);
  };

  /* 受け攻めの向きが成り立つかを、恋愛できる相手の判定に加える */
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
