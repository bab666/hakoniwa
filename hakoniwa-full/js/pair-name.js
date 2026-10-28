/* 箱庭シミュレーター: 結果の組の表記（攻め×受け）
   結果の要約・結末・関係のカード・画像で、二人の組を「攻め×受け」の順に書く（受け攻めを決めている組が「受け×攻め」と出ないように）。
   向きは HK.Pos.order（pos.js）と同じ決まりで決める：自分で選んだ攻め・受けで一つに決まる組、
   指定が同じどうし（おまかせの女性どうし・受けどうし）は気質。場面の希望で変わる組（リバどうし・おまかせの男性どうしなど）は、住人の並び順のまま。
   相手ごとの受け攻め（入力の posFor { 相手の番号: 指定 }）があれば、その二人の向きはそちらで決める（pos.js の P.of(c, 相手)）。
   判定には結果の入力（res.input.chars の受け攻め・相手ごとの受け攻め・性別・恋愛対象）と結果の気質（res.chars[i].tr）だけを使うので、セーブから開いた結果でも同じ順になる */
(function () {
  'use strict';
  var HK = window.HK;
  if (!HK) return;
  /* 結果の i 番目の住人を、受け攻めの判定に使える形に（設定は入力から、気質は結果から） */
  function who(res, i) {
    var c = (res.input && res.input.chars && res.input.chars[i]) || {}, r = (res.chars && res.chars[i]) || {};
    return { i: i, name: r.name || c.name || String(i), gender: c.gender || '', pos: c.pos || '', likes: c.likes || '', futa: !!c.futa, posFor: c.posFor && typeof c.posFor === 'object' ? c.posFor : null, topLv: c.topLv || '', tr: r.tr || {} };
  }
  /* pos.js の lean と同じ（指定が同じどうしで、どちらが動く側に回りやすいか） */
  function lean(c) {
    var t = c.tr || {};
    return (t.cp || 0) * 0.4 + (t.lead || 0) * 0.3 + (t.aggr || 0) * 0.3 - (t.ac || 0) * 0.35 + (t.cold || 0) * 0.1;
  }
  /* 向きが決まっていれば [攻め, 受け]、場面の希望しだいで変わる組なら null */
  function decided(A, B) {
    var P = HK.Pos;
    if (!P || !P.orients) return null;
    var os = P.orients(A, B);
    if (!os.length) return P.hardTop(B, A) && !P.hardTop(A, B) ? [B, A] : P.hardTop(A, B) ? [A, B] : null;
    if (os.length === 1) return os[0];
    /* 相手ごとの指定・攻め度で決まる組（pos.js の P.order と同じ） */
    var pr = P.prefer ? P.prefer(A, B) : null;
    if (pr) return pr;
    var pa = P.of(A, B), pb = P.of(B, A);
    if (pa === 'riba' && pb === 'riba') return null;
    if (pa === 'top' && pb !== 'top') return [A, B];
    if (pb === 'top' && pa !== 'top') return [B, A];
    if (pa === 'bottom' && pb !== 'bottom') return [B, A];
    if (pb === 'bottom' && pa !== 'bottom') return [A, B];
    if (pa === 'bottom' && pb === 'bottom' && !!P.explicit(A, B) !== !!P.explicit(B, A)) return P.explicit(A, B) ? [B, A] : [A, B];
    if (pa === pb && (pa === 'top' || pa === 'bottom')) {
      var la = lean(A), lb = lean(B);
      return la > lb + 0.001 ? [A, B] : lb > la + 0.001 ? [B, A] : (A.name < B.name ? [A, B] : [B, A]);
    }
    return null;
  }
  /* 組 p（{a, b}）の並び [先, 後]（住人の番号） */
  HK.pairIdx = function (res, p) {
    var a = p && p.a, b = p && p.b;
    if (a == null || b == null || !res) return [a, b];
    var lo = Math.min(a, b), hi = Math.max(a, b);
    if (!res.input || !res.input.chars || !res.input.chars[hi]) return [lo, hi];
    var d = decided(who(res, lo), who(res, hi));
    return d ? [d[0].i, d[1].i] : [lo, hi];
  };
  /* 組の名前「攻め×受け」。sep は区切り（省略は「×」） */
  HK.pairName = function (res, p, sep) {
    var o = HK.pairIdx(res, p), C = (res && res.chars) || [];
    var n = function (i) { return (C[i] && C[i].name) || ''; };
    return n(o[0]) + (sep == null ? '×' : sep) + n(o[1]);
  };
  /* 箱庭を回している最中（結果がまだない）の二人 a・b（箱庭の住人）の並び [攻め, 受け]。向きが決まらない組は [a, b] のまま */
  HK.pairOrder = function (a, b) {
    if (!a || !b || a === b || a.mob || b.mob) return [a, b];
    var lo = a.i != null && b.i != null && b.i < a.i ? b : a, hi = lo === a ? b : a;
    var d = null;
    try { d = decided(lo, hi); } catch (e) { d = null; }
    return d ? [d[0], d[1]] : [a, b];
  };
  /* 箱庭を回している最中の組の名前「攻め×受け」（記録の札・条件の数え方などに書く組）。sep は区切り（省略は「×」） */
  HK.pairNameOf = function (a, b, sep) {
    var o = HK.pairOrder(a, b);
    return ((o[0] && o[0].name) || '') + (sep == null ? '×' : sep) + ((o[1] && o[1].name) || '');
  };
})();
