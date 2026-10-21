/* 箱庭シミュレーター: 受け攻めの指定
   キャラごとの pos = '' (おまかせ) | 'top' (攻め) | 'bottom' (受け) | 'riba' (リバ)
   女性は「攻め」を選ばない限り受けとして扱う。
   リバ同士の組だけは、場面ごとに入れ替わってよい。それ以外の組は、一度決まった向きを最後まで変えない。 */
(function () {
  'use strict';
  var HK = window.HK;
  var P = HK.Pos = {};
  var lock = {};

  /* 実際に効く指定 */
  P.of = function (c) {
    if (!c) return '';
    var v = c.pos || (c.src && c.src.pos) || '';
    if (v === 'top' || v === 'bottom' || v === 'riba') return v;
    return c.gender === 'f' ? 'bottom' : '';
  };
  function explicit(c) { var v = c && (c.pos || (c.src && c.src.pos)); return v === 'top' || v === 'bottom' || v === 'riba'; }
  P.explicit = explicit;
  P.canTop = function (c) { return P.of(c) !== 'bottom'; };
  P.canBottom = function (c) { return P.of(c) !== 'top'; };
  P.isTop = function (c) { return P.of(c) === 'top'; };
  P.isBottom = function (c) { return P.of(c) === 'bottom'; };
  var LBL = { top: '攻め', bottom: '受け', riba: 'リバ' };
  P.label = function (c) { return LBL[P.of(c)] || 'おまかせ'; };

  /* 指定が同じ同士（攻め×攻め・受け×受け）を気質で決める */
  function lean(c) {
    var t = c.tr || {};
    return (t.cp || 0) * 0.4 + (t.lead || 0) * 0.3 + (t.aggr || 0) * 0.3 - (t.ac || 0) * 0.35 + (t.cold || 0) * 0.1;
  }
  function key(a, b) { var x = a.name || String(a.i), y = b.name || String(b.i); return x < y ? x + '\u0001' + y : y + '\u0001' + x; }
  function nameOf(c) { return c.name || String(c.i); }

  /* 二人のうち、挿入する側（攻め）を先にして返す。fb は場面側の希望 [攻め, 受け] */
  P.order = function (a, b, fb) {
    if (!a || !b || a === b) return fb || [a, b];
    var pa = P.of(a), pb = P.of(b), r;
    fb = fb && fb.length === 2 ? fb : [a, b];
    if (pa === 'riba' && pb === 'riba') return fb;
    var k = key(a, b);
    if (lock[k]) return lock[k] === nameOf(a) ? [a, b] : [b, a];
    if (pa === 'top' && pb !== 'top') r = [a, b];
    else if (pb === 'top' && pa !== 'top') r = [b, a];
    else if (pa === 'bottom' && pb !== 'bottom') r = [b, a];
    else if (pb === 'bottom' && pa !== 'bottom') r = [a, b];
    /* 受け×受け：自分で「受け」を選んだ人を優先し、女性の既定（おまかせ）の側が攻めに回る */
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
  /* 名前のない相手（モブ）との組：キャラが攻めなら 'top'、受けなら 'bottom'、どちらでもよければ def */
  P.vsNpc = function (c, def) {
    var v = P.of(c);
    if (v === 'top') return 'top';
    if (v === 'bottom') return 'bottom';
    return def || '';
  };
  P.reset = function () { lock = {}; };
  /* ノリノリな性格（奔放・衝動的）：受けやおまかせでも、自分から跨ったり誘ったりする */
  P.nori = function (c) { var t = (c && c.tr) || {}; if ((t.ac || 0) > 0.62 && (t.fc || 0) < 0.5) return false; return (t.fc || 0) > 0.6 || (t.impulse || 0) > 0.66; };
  /* 仕掛けた側 a がノリノリで、攻めの指定でなければ、自分が受けに回る向きを希望する */
  P.fbFor = function (a, b) { return P.nori(a) && P.of(a) !== 'top' && P.of(b) !== 'bottom' ? [b, a] : [a, b]; };

  /* 一回のシミュレーションごとに、組の向きの記憶をリセットする */
  if (HK.simulate && !HK.simulate._pos) {
    var orig = HK.simulate;
    HK.simulate = function (input) { P.reset(); return orig.apply(this, arguments); };
    HK.simulate._pos = true;
  }
})();
