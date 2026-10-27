/* 箱庭シミュレーター: 読み込む順に左右されないための部品（中核 core。js/load.js のすぐ後）
   分割読み込みでは、かたまり（core・late・pack-<族>・scen-<id>）が選んだ順・届いた順に実行される。
   「全部を元の順（_order.txt の並び）で読んだとき」と同じ結果になるように、次の二つを元のファイルの通し番号で並べ直す。
   ・HK.wrap(obj, key, make[, n])：関数の包み直し。make(prev) が新しい関数を返す（prev は内側＝それより前の番号の包みまで済んだ関数）。
       包みは「包んだファイルの通し番号（HK.Load.cur）」の昇順に組み直す。遅れて届いたかたまりの包みが、すでに有る包みの内側に割り込める。
       同じ番号から何回も呼んだときは呼んだ順。make は組み直しのたびに呼び直されるので、関数を作って返すだけにする（表への登録などの副作用を書かない）。
       make が関数以外（undefined など）を返したときは、その包みは無いものとして prev のまま。
       持ち主の定義そのもの（prev を使わずに置き換える）も、包みより後のかたまりにあるなら HK.wrap(obj, key, function () { return f; }) で書く。
   ・HK.addTo(list, items[, n])：共有の配列への追加。足したファイルの通し番号の順に並ぶように差し込む（list に見えない印 __ord を持たせる）。
       印を付ける前から有った要素は、どの追加よりも前（番号 0）として扱う。
   ・n を省くと HK.Load.cur（いま実行中のファイルの番号。取り付け役 HK.Load.onChunk の中では登録したファイルの番号）。
     HK.Load が無い・番号が 0（js を1本ずつ読む開発中・text-studio）なら、呼んだ順にそのまま足す（今までの包み直し・push と同じ）。
   ・書き換えるのは「かたまりをまたぐ」包み直しと表への追加だけ。一度 HK.wrap にした鍵は、それより後の番号の包みもすべて HK.wrap で書く
     （素の代入で包むと、その上には並べ直せない。見つけたら HK.wrap.odd に記録する。点検 chunk-audit が見る）。
   設計：docs/reports/2026-10-27/chunk-loading-design.md（2-3）。両方のビルドに同じファイルを置く */
(function () {
  'use strict';
  var HK = window.HK = window.HK || {};
  if (HK.wrap && HK.wrap.api) return;
  function cur() { var L = HK.Load; return (L && L.cur) || 0; }
  var REG = typeof WeakMap === 'function' ? new WeakMap() : null;
  var odd = [];

  /* ---------- 包み直し ---------- */
  function regOf(obj, key, mk) {
    var m = REG ? REG.get(obj) : obj.__wraps;
    if (!m) {
      if (!mk) return null;
      m = {};
      if (REG) REG.set(obj, m); else Object.defineProperty(obj, '__wraps', { value: m, enumerable: false, configurable: true });
    }
    if (!Object.prototype.hasOwnProperty.call(m, key)) {
      if (!mk) return null;
      m[key] = { base: obj[key], list: [], fn: obj[key] };
    }
    return m[key];
  }
  function wrap(obj, key, make, n) {
    if (!obj || typeof make !== 'function') return obj ? obj[key] : undefined;
    if (n == null) n = cur();
    var r = regOf(obj, key, true);
    /* 前の HK.wrap のあとに素の代入で書き換えられていたら、今の値を土台にして続ける（並べ直しはそこで切れる） */
    if (obj[key] !== r.fn) {
      odd.push({ key: key, n: n, file: HK.Load && HK.Load.file || '' });
      r.base = obj[key]; r.list = []; r.fn = obj[key];
    }
    /* 差し込む位置：同じ番号どうしは呼んだ順（番号が n 以下のものの後ろ） */
    var at = r.list.length;
    while (at > 0 && r.list[at - 1].n > n) at--;
    r.list.splice(at, 0, { n: n, make: make, out: null });
    var f = at > 0 ? r.list[at - 1].out : r.base;
    for (var i = at; i < r.list.length; i++) {
      var g = r.list[i].make(f);
      if (typeof g === 'function') f = g;
      r.list[i].out = f;
    }
    obj[key] = r.fn = f;
    return f;
  }
  wrap.api = 1;
  wrap.odd = odd;
  /* 点検用：その鍵の包みの番号の並び */
  wrap.order = function (obj, key) { var r = regOf(obj, key, false); return r ? r.list.map(function (e) { return e.n; }) : []; };
  HK.wrap = wrap;

  /* ---------- 共有の配列への追加 ---------- */
  HK.addTo = function (list, items, n) {
    if (!list) return list;
    if (!Array.isArray(items)) items = [items];
    if (n == null) n = cur();
    var ord = list.__ord;
    if (!ord) { ord = []; Object.defineProperty(list, '__ord', { value: ord, enumerable: false, configurable: true, writable: true }); }
    /* 印のあとに素の push で足された要素：直前の要素と同じ番号として扱う（置き場所は今のまま） */
    while (ord.length < list.length) ord.push(ord.length ? ord[ord.length - 1] : 0);
    if (ord.length > list.length) ord.length = list.length;
    var at = list.length;
    while (at > 0 && ord[at - 1] > n) at--;
    var nn = items.map(function () { return n; });
    list.splice.apply(list, [at, 0].concat(items));
    ord.splice.apply(ord, [at, 0].concat(nn));
    return list;
  };
})();
