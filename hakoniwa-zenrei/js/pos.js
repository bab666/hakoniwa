/* 箱庭シミュレーター: 受け攻めの指定
   キャラごとの pos = '' (おまかせ) | 'top' (攻め) | 'bottom' (受け) | 'riba' (リバ)
   女性は「攻め」を選ばない限り受けとして扱う（ただし自分で選んだ指定ではないので、女性同士では攻めにも回れる）。
   恋愛対象（受け攻め）posLike = '' (おまかせ：攻めなら受けだけ・受けなら攻めだけ・それ以外は誰とでも)
     | 'tb' (攻めと受け) | 'tr' (攻めとリバ) | 'br' (受けとリバ) | 'any' (誰とでも)
   いちばん大事な決まり：自分で「攻め」を選んだ人は、どの場面でも受ける側に回らない。
   向きを決められない組（攻め×攻めなど）は、恋愛にも体の関係にもならない（HK.canLove が false を返す）。
   リバ同士の組だけは、場面ごとに入れ替わってよい。それ以外の組は、一度決まった向きを最後まで変えない。
   ふたなり（futa、R18版のみ）：攻め・リバを選んだ女性に付けると、攻めに回る場面を男性の体（いちもつ）を前提にした描写で書く（P.isF が false）。
     オメガバースでは使わない（P.isFBody を見る）。双頭の玩具・貝合わせのような対等な繋がりは、二人ともリバ（P.bothRiba）のときだけ。 */
(function () {
  'use strict';
  var HK = window.HK;
  var P = HK.Pos = {};
  var lock = {};

  function src(c, k) { return c ? (c[k] != null && c[k] !== '' ? c[k] : (c.src && c.src[k]) || '') : ''; }
  /* 実際に効く指定 */
  P.of = function (c) {
    if (!c) return '';
    var v = src(c, 'pos');
    if (v === 'top' || v === 'bottom' || v === 'riba') return v;
    return src(c, 'gender') === 'f' ? 'bottom' : '';
  };
  function explicit(c) { var v = src(c, 'pos'); return v === 'top' || v === 'bottom' || v === 'riba'; }
  P.explicit = explicit;
  P.isTop = function (c) { return P.of(c) === 'top'; };
  P.isBottom = function (c) { return P.of(c) === 'bottom'; };
  /* 自分で「攻め」を選んだ人（どの相手・どの場面でも受けに回してはいけない） */
  P.hardTop = function (c) { return explicit(c) && P.of(c) === 'top'; };
  P.canTop = function (c) { return P.of(c) !== 'bottom' || !explicit(c); };
  P.canBottom = function (c) { return !P.hardTop(c); };
  var LBL = { top: '攻め', bottom: '受け', riba: 'リバ' };
  P.label = function (c) { return LBL[P.of(c)] || 'おまかせ'; };
  /* 体が女性か（性別の設定そのもの。オメガバースなど、ふたなりの設定を使わない箱庭はこちらを見る） */
  P.isFBody = function (c) { return src(c, 'gender') === 'f'; };
  /* ふたなり（R18版のみ）：女性で、自分で「攻め」か「リバ」を選び、設定で「ふたなり」を付けた人。
     攻めに回る場面では男性の体（いちもつ）を前提にした描写で書く。自分で「受け」を選んだ人・おまかせの女性には効かない */
  P.futa = function (c) { return !HK.SAFE_ON && P.isFBody(c) && !!src(c, 'futa') && explicit(c) && P.of(c) !== 'bottom'; };
  /* 描写の上で「女性の体」として書く人（ふたなりの攻めは除く）。女性どうし（ff）・女性が攻め（fm）の判定はこれで行う */
  P.isF = function (c) { return P.isFBody(c) && !P.futa(c); };
  /* 女性どうしの組（いちもつの描写を使わない）。ふたなりの攻めが入る組は、男性の体を前提にした描写でよい */
  P.ff = function (a, b) { return P.isF(a) && P.isF(b); };
  /* 二人ともリバ（双頭の玩具・貝合わせのように、二人が対等に繋がる描写は、この組だけ） */
  P.bothRiba = function (a, b) { return P.of(a) === 'riba' && P.of(b) === 'riba'; };
  P.MUTUAL_RE = /双頭|貝合わせ|擦り合わせ|擦りつけ合|擦り付け合|重ね合わせ|上になったり下になったり|濡れたところ同士|熱いところ同士|熱いところを重ね|入れ替わ(?:り|って|った)/;

  /* ---------- 恋愛対象（受け攻め） ---------- */
  P.LIKE_OPTS = [
    { v: '', label: 'おまかせ（攻めなら受けだけ・受けなら攻めだけ）' },
    { v: 'tb', label: '攻めと受けの両方' },
    { v: 'tr', label: '攻めとリバだけ' },
    { v: 'br', label: '受けとリバだけ' },
    { v: 'any', label: '誰とでも（リバも含む）' }
  ];
  P.likeValid = function (v) { return v === '' || v === 'tb' || v === 'tr' || v === 'br' || v === 'any'; };
  /* c が相手として受け入れる「相手の指定」 */
  P.likes = function (c) {
    var v = src(c, 'posLike');
    if (v === 'tb') return { top: 1, bottom: 1 };
    if (v === 'tr') return { top: 1, riba: 1 };
    if (v === 'br') return { bottom: 1, riba: 1 };
    if (v === 'any') return { top: 1, bottom: 1, riba: 1 };
    if (explicit(c) && P.of(c) === 'top') return { bottom: 1 };
    if (explicit(c) && P.of(c) === 'bottom') return { top: 1 };
    return { top: 1, bottom: 1, riba: 1 };
  };
  /* c がその役（'top'|'bottom'）に回れるか。partner は相手 */
  function canRole(c, r, partner) {
    if (!explicit(c)) return true;
    var p = P.of(c);
    if (p === 'riba') return true;
    if (p === 'top') return r === 'top';
    /* 受け×受け（どちらも自分で選んだ受け）だけは、どちらかが動く側に回る */
    return r === 'bottom' || (P.of(partner) === 'bottom' && explicit(partner));
  }
  /* 相手から見た c の指定（おまかせの人は、その場で回る役として見る） */
  function kindAs(c, r) { return explicit(c) ? P.of(c) : r; }
  /* 成り立つ向き（[攻め, 受け] の並び）の一覧 */
  P.orients = function (a, b) {
    if (!a || !b || a === b) return [];
    var out = [];
    [[a, b], [b, a]].forEach(function (o) {
      var t = o[0], u = o[1];
      if (!canRole(t, 'top', u) || !canRole(u, 'bottom', t)) return;
      if (!P.likes(t)[kindAs(u, 'bottom')] || !P.likes(u)[kindAs(t, 'top')]) return;
      out.push(o);
    });
    return out;
  };
  /* 恋愛・体の関係が成り立つ組か（受け攻めの指定と恋愛対象から） */
  P.okSex = function (a, b) { return P.orients(a, b).length > 0; };
  P.okLove = P.okSex;
  /* 向きを決められない組（攻め×攻め・指定が合わない組）。体の関係には一切ならない */
  P.clash = function (a, b) { return !!(a && b && a !== b && !P.okSex(a, b)); };

  /* 指定が同じ同士（おまかせの女性どうし・受け×受け）を気質で決める */
  function lean(c) {
    var t = c.tr || {};
    return (t.cp || 0) * 0.4 + (t.lead || 0) * 0.3 + (t.aggr || 0) * 0.3 - (t.ac || 0) * 0.35 + (t.cold || 0) * 0.1;
  }
  function key(a, b) { var x = a.name || String(a.i), y = b.name || String(b.i); return x < y ? x + '\u0001' + y : y + '\u0001' + x; }
  function nameOf(c) { return c.name || String(c.i); }

  /* 二人のうち、攻め（動く側・挿入する側）を先にして返す。fb は場面側の希望 [攻め, 受け]
     指定の合わない組でも、自分で攻めを選んだ人を受けの位置には置かない（呼ぶ側は P.okSex で先に確かめること） */
  P.order = function (a, b, fb) {
    if (!a || !b || a === b) return fb || [a, b];
    fb = fb && fb.length === 2 ? fb : [a, b];
    var os = P.orients(a, b), r;
    if (!os.length) return P.hardTop(b) && !P.hardTop(a) ? [b, a] : P.hardTop(a) ? [a, b] : fb;
    if (os.length === 1) return os[0];
    var pa = P.of(a), pb = P.of(b);
    if (pa === 'riba' && pb === 'riba') return fb;
    var k = key(a, b);
    if (lock[k]) return lock[k] === nameOf(a) ? [a, b] : [b, a];
    if (pa === 'top' && pb !== 'top') r = [a, b];
    else if (pb === 'top' && pa !== 'top') r = [b, a];
    else if (pa === 'bottom' && pb !== 'bottom') r = [b, a];
    else if (pb === 'bottom' && pa !== 'bottom') r = [a, b];
    /* 受け×受け：自分で「受け」を選んだ人を優先し、おまかせの側が攻めに回る */
    else if (pa === 'bottom' && pb === 'bottom' && !!explicit(a) !== !!explicit(b)) r = explicit(a) ? [b, a] : [a, b];
    else if (pa === pb && (pa === 'top' || pa === 'bottom')) {
      var la = lean(a), lb = lean(b);
      r = la > lb + 0.001 ? [a, b] : lb > la + 0.001 ? [b, a] : (nameOf(a) < nameOf(b) ? [a, b] : [b, a]);
    } else r = fb;
    lock[k] = nameOf(r[0]);
    return r;
  };
  /* 向きが決まっている組か（＝途中の逆転・入れ替わりを起こしてはいけない） */
  P.fixed = function (a, b) { return !(P.of(a) === 'riba' && P.of(b) === 'riba'); };
  /* 二人の組で a が攻めか */
  P.topOf = function (a, b, fb) { return P.order(a, b, fb)[0]; };
  /* 名前のない相手（モブ・魔物・道具）との組：キャラが攻めなら 'top'、受けなら 'bottom'、どちらでもよければ def。
     自分で攻めを選んだ人は、def が何であっても 'top'（受ける場面にしない） */
  P.vsNpc = function (c, def) {
    var v = P.of(c);
    if (v === 'top') return 'top';
    if (v === 'bottom') return 'bottom';
    return def || '';
  };
  /* モブ・魔物・道具に「される」場面に入れてよいか（自分で攻めを選んだ人は不可） */
  P.canReceive = function (c) { return !P.hardTop(c); };
  P.reset = function () { lock = {}; };
  /* ノリノリな性格（奔放・衝動的）：受けやおまかせでも、自分から跨ったり誘ったりする */
  P.nori = function (c) { var t = (c && c.tr) || {}; if ((t.ac || 0) > 0.62 && (t.fc || 0) < 0.5) return false; return (t.fc || 0) > 0.6 || (t.impulse || 0) > 0.66; };
  /* 仕掛けた側 a がノリノリで、攻めの指定でなければ、自分が受けに回る向きを希望する */
  P.fbFor = function (a, b) { return P.nori(a) && P.of(a) !== 'top' && P.of(b) !== 'bottom' ? [b, a] : [a, b]; };

  /* 男性の体を前提にした言葉（女性どうしの場面で使ってはいけない）。点検にも使う */
  P.MALE_RE = /ちんぽ|ちんこ|ペニス|陰茎|肉棒|いちもつ|一物|男根|亀頭|勃起|射精|精液|白濁|種付け|孕ませ|中に出|中出し|子種|睾丸|カリ首|フェラ|裏筋|鈴口|先走り|怒張|剛直|屹立/;

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
