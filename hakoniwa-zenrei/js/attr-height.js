/* 箱庭シミュレーター attr-height: 住人の身長（cm）と、二人の背の差の一文（全年齢版・R18版共通。attr.js の直後に読む）
   ・height 身長：'100'〜'250'（cm の整数の文字列。全角の数字・「cm」「センチ」は読み替える）。空欄なら身長の文は出さない（体格から推定しない）
   ・A.heightOf(c)：数（決めていなければ 0）。実行時の住人は c.src も見る
   ・A.heightDiff(a, b)：二人とも身長を決めていて、差が 10cm 以上なら 'a>b'（a のほうが高い）／'b>a'。ほかは ''
   ・文（地の文）：ふだんの場面（見上げる・見下ろす・頭を撫でる）＝ HT.look、恋人の場面（抱きしめる・背伸びのキス）＝ HT.love、
     R18 の抱き方（攻め＝{a} が高いとき big／低いとき small）＝ HT.hold（R18版だけ。印で挟む）。{L}＝背の高いほう、{S}＝低いほう
   ・どこに出すか：attr.js の A.pairLine（attr-look.js のふだんの場面・tie-rel.js の A.daily・R18 の体の感触の段 touch／抱き方 hold）と、
     daily-kit.js の日常の場面（A.heightDaily。恋人どうしは love、ほかは look）
   ・二人とも身長を決めていなければ乱数を使わない（決めていない人の結果は、これまでと変わらない）
   ・二人とも身長を決めているときは、体格の差の「背の差」の文（見上げて話した 等。pairLine の look）は出さない（身長を優先。体格の差の抱き方の文は残す）
   ・保存の欄：ui.js の mk・normChar・rosterJSON・importJSON・buildInput は attr.js の A.mk・A.norm・A.exportTo・A.importFrom・A.toInput を通るので、ここで包む。
     ⚙️ 設定の「体と設定」の体格の隣に数の欄（A.gearHtml・A.gearField）。住人の行の要約（A.summary）にも出す
   登場人物はすべて成人として扱う */
(function () {
  'use strict';
  var HK = window.HK, A = HK && HK.Attr;
  if (!A || A.heightDiff) return;
  function L(s) { return s.split('|'); }
  var MIN = 100, MAX = 250, GAP = 10;
  function hv(v) {
    if (v == null || v === '') return '';
    var s = String(v).replace(/[０-９．]/g, function (d) { return d === '．' ? '.' : String.fromCharCode(d.charCodeAt(0) - 0xFEE0); }).replace(/\s|cm|ｃｍ|センチ(?:メートル)?/gi, '');
    if (!/^\d+(?:\.\d+)?$/.test(s)) return '';
    var n = Math.round(+s);
    return n >= MIN && n <= MAX ? String(n) : '';
  }
  A.heightVal = hv;
  A.heightOf = function (c) {
    if (!c) return 0;
    var v = c.height != null && c.height !== '' ? c.height : c.src ? c.src.height : '';
    return +hv(v) || 0;
  };
  A.heightDiff = function (a, b) {
    var x = A.heightOf(a), y = A.heightOf(b);
    if (!x || !y || Math.abs(x - y) < GAP) return '';
    return x > y ? 'a>b' : 'b>a';
  };
  A.heightBoth = function (a, b) { return !!(A.heightOf(a) && A.heightOf(b)); };

  /* ---------- 文 ---------- */
  var HT = A.HEIGHT_FL = {
    look: L('{S}が話しかけると、{L}は少し首を傾けて{S}を見下ろした。{S}は顔を上げたまま、話を続けた。|{L}は高いところのものを、{S}の頭越しにひょいと取ってみせた。{S}は見上げて、小さく礼を言った。|{L}は何気なく、{S}の頭にぽんと手を置いた。{S}は見上げて、その手をどけようともしなかった。|並んで歩くと、{S}の目の高さは{L}の肩のあたりだった。{S}は話すたびに、少し顔を上げた。'),
    love: L('{S}は背伸びをして、{L}の唇にそっと口づけた。{L}は少し身をかがめて、それを迎えた。|{L}は{S}を胸に抱きしめ、その頭に顎をのせた。{S}は{L}の胸に頬を寄せて、目を閉じた。|{L}は身をかがめて、{S}の額に口づけを落とした。{S}は見上げて、照れたように笑った。|{S}が見上げると、{L}は目を細めて、{S}の髪をくしゃりと撫でた。')
  };
  /* r18:begin */
  /* R18 の抱き方：{a}＝攻め、{b}＝受け。big は攻めのほうが背が高いとき、small は攻めのほうが低いとき */
  HT.hold = {
    big: L('{a}は身をかがめて、腕の中の{b}を見下ろした。背の差のぶん、{b}の体はすっぽりと{a}の影に収まった。|{a}は{b}の顎をすくい上げ、見下ろしたまま唇を重ねた。{b}は爪先立ちになって、それに応えた。|{a}は{b}を抱きしめたまま、その頭に頬を寄せた。見上げる{b}の目が、熱に潤んでいた。'),
    small: L('{a}は背伸びをして{b}の首に腕を回し、自分のほうへ引き寄せた。見上げる角度のまま、{a}は{b}の唇を奪った。|見上げるほど背の高い{b}を、{a}は胸元から崩していった。{b}は身をかがめて、{a}にされるがままになった。|{a}は{b}の襟元をつかんで引き下ろし、届かない分を背伸びで埋めて口づけた。{b}の大きな体が、{a}の腕の中で震えた。')
  };
  /* r18:end */
  function fill(t, v) { return t.replace(/\{(\w+)\}/g, function (m, k) { return v[k] != null ? v[k] : m; }); }
  /* 同じ回（owner＝ctx か S。なければ attr.js の A.curOwner）の中で、同じ二人に同じ文を二度使わない。使い切ったら '' */
  function fresh(owner, l, key) {
    owner = owner && typeof owner === 'object' ? owner : A.curOwner && typeof A.curOwner === 'object' ? A.curOwner : null;
    if (!owner) return l;
    var u = owner._hgtUsed || (owner._hgtUsed = {});
    return l.filter(function (t) { return !u[key + t]; });
  }
  function mark(owner, t, key) {
    owner = owner && typeof owner === 'object' ? owner : A.curOwner && typeof A.curOwner === 'object' ? A.curOwner : null;
    if (owner) (owner._hgtUsed || (owner._hgtUsed = {}))[key + t] = 1;
  }
  /* kind（look／love／touch／hold）の一文。出せる文がなければ '' */
  function line(a, b, kind, pick, owner) {
    var hd = A.heightDiff(a, b);
    if (!hd) return '';
    var tall = hd === 'a>b' ? a : b, short = tall === a ? b : a, l, v, key = a.name + '\u0001' + b.name + '\u0001';
    if (kind === 'touch' || kind === 'hold') {
      var H = HT.hold;
      if (!H || HK.SAFE_ON) return '';
      l = H[hd === 'a>b' ? 'big' : 'small']; v = { a: a.name, b: b.name };
    } else { l = HT[kind === 'love' ? 'love' : 'look']; v = { L: tall.name, S: short.name }; }
    var f = fresh(owner, l, key);
    if (!f.length) return '';
    var t = pick(f);
    mark(owner, t, key);
    var ow = own(owner);
    if (ow) ow._hgtRec = recNo(ow);
    return fill(t, v);
  }
  function own(o) { return o && typeof o === 'object' ? o : A.curOwner && typeof A.curOwner === 'object' ? A.curOwner : null; }
  function recNo(o) { return Array.isArray(o.log) ? o.log.length : -1; }
  /* この記録（owner の log の長さ）にもう身長の文を出したか（一つの記録に身長の文は一文まで） */
  function usedHere(owner) { var o = own(owner); return !!(o && o._hgtRec != null && o._hgtRec === recNo(o) && recNo(o) >= 0); }
  A.heightLine = line;

  /* ---------- 二人の場面の一文（attr.js の pairLine を包む） ---------- */
  var pl0 = A.pairLine;
  A.pairLine = function (a, b, kind, pick, owner) {
    if (!a || !b) return pl0.apply(this, arguments);
    var both = A.heightBoth(a, b), hd = A.heightDiff(a, b), self = this, args = arguments;
    var orig = function () {
      /* 二人とも身長を決めていれば、体格の「背の差」の文（look）は出さない */
      if (!(both && kind === 'look')) return pl0.apply(self, args);
      var sd0 = A.sizeDiff;
      A.sizeDiff = function () { return ''; };
      try { return pl0.apply(self, args); } finally { A.sizeDiff = sd0; }
    };
    if (!hd || typeof pick !== 'function' || usedHere(owner)) return orig();
    var ht = (kind === 'touch' || kind === 'hold') && (!HT.hold || HK.SAFE_ON) ? '' : 'ok';
    if (!ht) return orig();
    /* 身長の文か、ほかの飾り（体の特徴・目につく特徴など）か：半々。ほかの飾りが無ければ身長の文（同じ回で使い切ったら、ほかの飾りだけ） */
    if (pick([0, 1])) { var t = orig(); if (t) return t; return line(a, b, kind, pick, owner); }
    return line(a, b, kind, pick, owner) || orig();
  };
  /* tie-rel.js のふだんの場面：身長の差しかない二人にも、ときどき見た目の一文を添える（A.daily は体格・特徴が無いと何もしない） */
  var dl0 = A.daily;
  A.daily = function (ctx, a, b, r, cat) {
    if (!a || !b || A.sizeDiff(a, b) || A.hasLook(a) || A.hasLook(b) || !A.heightDiff(a, b)) return dl0.apply(this, arguments);
    if (!r || typeof r.text !== 'string' || !/^(?:bond|help)$/.test(r.cat || cat || '')) return r;
    if (ctx.rng() >= 0.35) return r;
    var t = A.pairLine(a, b, 'look', function (l) { return ctx.pick(l); }, ctx);
    if (t) r.text += t;
    return r;
  };
  /* daily-kit.js の日常の場面：二人の背の差が 10cm 以上なら、3割で一文（恋人どうしは love、ほかは look）。同じ回で同じ文は繰り返さない（used） */
  A.heightDaily = function (ctx, a, b, lovers, used) {
    if (!A.heightDiff(a, b) || ctx.rng() >= 0.3) return '';
    return line(a, b, lovers ? 'love' : 'look', function (l) { return ctx.rng.pick(l); }, ctx);
  };

  /* ---------- 保存・書き出し・読み込み・実行への写し（attr.js の関数を包む） ---------- */
  var mk0 = A.mk, norm0 = A.norm, ex0 = A.exportTo, im0 = A.importFrom, ti0 = A.toInput, cp0 = A.copy, sum0 = A.summary, gh0 = A.gearHtml, gf0 = A.gearField;
  A.mk = function (o, c) { o = mk0.apply(this, arguments); o.height = hv(c && c.height); return o; };
  A.norm = function (c) { var r = norm0.apply(this, arguments); c.height = hv(c.height); return r; };
  A.exportTo = function (o, c) { var r = ex0.apply(this, arguments); if (hv(c.height)) o.height = +hv(c.height); return r; };
  A.importFrom = function (c, o) { var r = im0.apply(this, arguments); if (o.height != null) c.height = hv(o.height); return r; };
  A.toInput = function (o, c) { var r = ti0.apply(this, arguments); if (hv(c.height)) o.height = +hv(c.height); return r; };
  A.copy = function (dst, src) { var r = cp0.apply(this, arguments); if (dst && src && hv(src.height)) dst.height = +hv(src.height); return r; };
  A.summary = function (c) {
    var bits = sum0.apply(this, arguments);
    if (hv(c.height)) { var at = 0; bits.forEach(function (x, i) { if (/^体格：/.test(x)) at = i + 1; }); bits.splice(at, 0, '身長：' + hv(c.height) + 'cm'); }
    return bits;
  };
  /* ⚙️ 設定の「体と設定」：体格の隣に身長の欄 */
  A.gearHtml = function (c, others, h) {
    var html = gh0.apply(this, arguments);
    var f = '<label title="cm の数で。二人とも決めていて、10cm 以上の差があると、見上げる・見下ろす・頭を撫でる・抱きしめる・背伸びのキスといった一文が出ます。空欄なら身長の文は出ません（体格からは決めません）">身長 <input type="number" data-gf="at_height" value="' + h.esc(hv(c.height)) + '" min="' + MIN + '" max="' + MAX + '" step="1" inputmode="numeric" placeholder="空欄" aria-label="身長（cm）" style="width:5.5em"> cm</label>';
    var p = html.indexOf('</label>');
    return p >= 0 ? html.slice(0, p + 8) + f + html.slice(p + 8) : '<div class="gearrow">' + f + '</div>' + html;
  };
  A.gearField = function (c, f, t) {
    if (f === 'at_height') { c.height = hv(t.value); arguments[4](false); return true; }
    return gf0.apply(this, arguments);
  };
})();
