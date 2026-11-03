/* 新婚部屋：文を仕上げる部品（両方のビルド。2026-11-03）
   ■ HK.ShinkonKit（K）
     ・K.mark(t)：文の雛形（{a}{b}{g}{s}{w} の印のまま）の台詞「…」に、話し手の目印「＠{x}＠」を付ける（CLAUDE.md「台詞の話し手を明示する目印」。
       利用者の報告：願望の行動で、前の文の主語の台詞が、その前に名前の出た人の台詞として出た）。決め方：
         1. 目印のある台詞・「{x}「」の形・名詞の引用（「…」という／と書いた など）はそのまま
         2. 台詞のすぐ後ろが「と{x}が言った」「――{x}が」の形ならその人
         3. 同じ文の台詞より前の「{x}は」のいちばん後ろ（無ければ「{x}が」「{x}も」、文頭の「{x}の」「{x}から」）
         4. 文頭の台詞などで同じ文に主語が無ければ、前の文の「{x}は」（無ければ「{x}が」のいちばん後ろ）。それも無ければ付けない（話者推定に任せる）
       台詞のすぐ後ろが「と聞かれ／言われ」（受け身）のときは、3・4 で決めた人の相手（{a}↔{b}）にする
     ・K.fill(ctx, t, a, b, ex)：目印を付けてから ex（{g} などの名前）と {a}{b} を当てる。全年齢では飾りの ♡ を ♪ に
   点検：hakoniwa-packs の担当がまとめて回す（台詞の話し手：目印の無い台詞が 0 件・推定と目印の食い違いが 0 件） */
(function () {
  'use strict';
  var HK = window.HK;
  if (!HK) return;
  var K = HK.ShinkonKit = {};
  var NOUNQ = /^(?:という|といった|って(?:書|いう|言う)|と書|の文字|の札|と名|と題|の一言だけ|の一行)/;
  var PASSIVE = /^と(?:[^。「」]{0,4})?(?:聞かれ|言われ|囁かれ|尋ねられ|問われ|頼まれ|笑われ|叱られ|たしなめられ)/;
  function strip(s) { var o = '', d = 0; for (var i = 0; i < s.length; i++) { var c = s.charAt(i); if (c === '「') d++; else if (c === '」') { d = Math.max(0, d - 1); continue; } if (!d) o += c; } return o; }
  function lastSub(s) {
    var m, re, best = null;
    re = /\{([a-z])\}は/g; while ((m = re.exec(s))) best = m[1];
    if (best) return best;
    re = /\{([a-z])\}が/g; while ((m = re.exec(s))) best = m[1];
    if (best) return best;
    re = /\{([a-z])\}も/g; while ((m = re.exec(s))) best = m[1];
    return best;
  }
  function closeOf(t, i) { var d = 0; for (var k = i; k < t.length; k++) { var c = t.charAt(k); if (c === '「') d++; else if (c === '」') { d--; if (!d) return k; } } return -1; }
  /* 台詞一つ（t の i 文字目の「）の話し手の印の文字。決まらなければ null。理由は why[0] に */
  K.who = function (t, i, why) {
    why = why || [];
    if (t.charAt(i + 1) === '＠' || t.charAt(i + 1) === '⁠') { why[0] = 'mark'; return null; }
    if (/\{[a-z]\}$/.test(t.slice(0, i))) { why[0] = 'name'; return null; }
    var j = closeOf(t, i); if (j < 0) return null;
    var after = t.slice(j + 1);
    if (NOUNQ.test(after)) { why[0] = 'noun'; return null; }
    /* 文の頭（いちばん外側の。か改行の直後） */
    var s0 = 0, d = 0;
    for (var k = 0; k < i; k++) { var c = t.charAt(k); if (c === '「') d++; else if (c === '」') d = Math.max(0, d - 1); else if (!d && (c === '。' || c === '\n')) s0 = k + 1; }
    var pre = strip(t.slice(s0, i)), x = null, m;
    var other = function (y) { return y === 'a' ? 'b' : y === 'b' ? 'a' : y; };
    var sub = lastSub(pre);
    var head = strip(t.slice(0, s0)).split(/[。\n]/).filter(function (q) { return q.trim(); });
    var prevSub = function () { for (var h = head.length - 1; h >= Math.max(0, head.length - 2); h--) { var y = lastSub(head[h]); if (y) return y; } var f0 = head.length ? /\{([a-z])\}/.exec(head[head.length - 1]) : null; return f0 ? f0[1] : null; };
    /* 受け身（「…」と言われて、{x}は…）：話し手は「{x}に「」の {x}、なければ、あとに出る人の相手 */
    var aft1 = after.split('。')[0].replace(/「[^」]*」/g, '');
    if (PASSIVE.test(after) || /^(?:――|と)[^{}。]{0,20}?(?:言われ|囁かれ|聞かれ|尋ねられ|問われ|頼まれ)/.test(after)) {
      why[0] = 'passive';
      if ((m = /\{([a-z])\}に$/.exec(pre))) return m[1];
      var am = /\{([a-z])\}/.exec(aft1); if (am) return other(am[1]);
      var y0 = sub || prevSub(); return y0 ? other(y0) : null;
    }
    /* 台詞の直前の「{x}から」「{x}の」「{x}のほうから」 */
    if ((m = /\{([a-z])\}(?:のほう)?(?:から|の)$/.exec(pre))) { why[0] = 'same'; return m[1]; }
    if (sub) { why[0] = 'same'; return sub; }
    if ((m = /\{([a-z])\}から(?:は|も)?[^。{}]{0,10}$/.exec(pre))) { why[0] = 'same'; return m[1]; }
    /* 同じ文に主語が無い：台詞のすぐ後ろで話し手が分かる形 */
    var A0 = [/^(?:と、?)\{([a-z])\}が/, /^と、?\{([a-z])\}は/, /^と[^。「」、]{0,10}ながら、\{([a-z])\}は/, /^と[^。「」、]{0,10}(?:て|で)、\{([a-z])\}は/, /^と[^。「」、]{0,10}のは\{([a-z])\}/,
      /^と[^。「」、]{0,14}?(?:た|る|う|く|す|ぬ|む|ぶ|つ)\{([a-z])\}(?:は|に|を|の|が|も)/];
    for (var q = 0; q < A0.length; q++) if ((m = A0[q].exec(after))) { why[0] = 'after'; return m[1]; }
    /* 前の文の主語 */
    x = prevSub();
    if (x) { why[0] = 'prev'; return x; }
    /* 文章の頭の台詞：「――{x}が言った」の形 */
    if (!head.length && (m = /^――[^。「」]{0,16}?\{([a-z])\}(?:が|の|は)/.exec(after))) { why[0] = 'after'; return m[1]; }
    return x;
  };
  K.mark = function (t) {
    t = String(t || '');
    if (t.indexOf('「') < 0) return t;
    var out = '', d = 0, last = 0;
    for (var i = 0; i < t.length; i++) {
      var c = t.charAt(i);
      if (c === '「') { if (!d) { var x = K.who(t, i); if (x) { out += t.slice(last, i + 1) + '＠{' + x + '}＠'; last = i + 1; } } d++; }
      else if (c === '」') d = Math.max(0, d - 1);
    }
    return out + t.slice(last);
  };
  function soft(t) { return HK.SAFE_ON ? String(t).replace(/♡/g, '♪') : t; }
  K.soft = soft;
  K.fill = function (ctx, t, a, b, ex) {
    t = K.mark(t);
    if (ex) Object.keys(ex).forEach(function (k) { t = t.split('{' + k + '}').join(ex[k]); });
    return soft(ctx.t(t, a, b));
  };
})();
