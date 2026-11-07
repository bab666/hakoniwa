/* Cセット（闇の過激セット）の共通部品：巻き戻らない計器・段の札で表を引く・一度だけ・文の仕上げ・話し手の目印・同じ文を二度出さない（R18版だけ。2026-11-07）
   ■ HK.DarkKit（DK。本体の HK.Dark は展開の重さ（mood-dial.js）の名前なので、kit は HK.DarkKit にする）
     ・計器（部屋の状態 S に持つ。巻き戻らない）
         DK.gauge(S, name, { v, min: 0, max: 100, dir: 'up'|'down', stages: [しきい値…], label })：計器を作る（同じ名前が既にあれば作り直さずそれを返す）。
           dir 'up' は上がるだけ（stages は値がしきい値以上で 1 段ずつ）、'down' は下がるだけ（値がしきい値以下で 1 段ずつ）。label は作り手向けの名前（本文に出さない）
         DK.push(S, name, delta)：進む向きにだけ動かす（逆向きの delta は 0 に丸める）。返り値 { v, d（実際に動いた量）, stage, rose（段が上がったか）}
         DK.val(S, name)：今の値。DK.stage(S, name)：到達した最高の段（stageMax）
         一時の揺れ（薬が切れて少し戻る など）は計器ではなく S.tmp に置き、区切りの初めに DK.tmpReset(S) で消す
     ・表を引く
         DK.pick(ctx, S, list, o)：行は文字列か { t, st, g, sh, when(ctx, S, a, b), w }。
           st（段の札）：'2'（ちょうど 2）・'2+'（2 以上）・'-1'（1 以下）・'1-2'（1〜2）。'名前:2+' と書くとその計器の段で、名前が無ければ o.g の計器（o.stage を渡せばその数）で見る
           sh：'mf'|'ff'|'fm' か配列。o.sh と合わない行を外す。when が偽の行を外す。w は重み（既定 1）
           一回の遊びで同じ文を二度出さない（S.used）。使い切ったら o.again が真のときだけ、使った回数が少なく古いもの（S.lru）から戻す。
           o.full なら行（{ t, … }）を、そうでなければ文字列を返す。何も無ければ ''（o.full なら null）
         DK.once(S, key)：初回だけ真。DK.seen(S, key)：もう出たか（印は付けない）
         DK.use(S, t)：表を通さずに書いた文を「使った」にする。DK.fresh(S, t)：まだ使っていないか
     ・文の仕上げ
         DK.who(t, i, why)・DK.mark(t)：台詞に話し手の目印「＠{x}＠」を付ける（セット B の HK.PairKit と同じ働き。別のパックのかたまりには頼れないので写した）
         DK.fill(ctx, t, a, b, ex)：目印を付けてから ex（{g} などの名前）と {a}{b} を当てる（{一人称}{二人称} は本体が展開）
         DK.say(ctx, o)：ctx.act2 を包む。o は act2 と同じ（cat・actors・text・why・mag・fx・lewd…）に、id（出来事の id → e.ev）・tag（e.tag）・
           face（{ 住人の番号: 表情の鍵 } → e.dkf。kit-dark-face.js が読む）・S（渡せば本文を「使った」にする）を足す。o.t（雛形）と o.a・o.b を渡せば fill してから出す。
           本文に作り手の語（DK.NG）が出たら出さずに null を返し、ctx._dkLeak に残す（部屋の計測で 0 を確かめる）
   文は持たない（文は部屋のファイルに書く）。 */
(function () {
  'use strict';
  var HK = window.HK;
  if (!HK) return;
  var DK = HK.DarkKit = HK.DarkKit || {};
  function clamp(v, lo, hi) { return v < lo ? lo : v > hi ? hi : v; }

  /* ---------- 巻き戻らない計器 ---------- */
  function stageOf(g) {
    var n = 0;
    for (var i = 0; i < g.stages.length; i++) if (g.dir === 'up' ? g.v >= g.stages[i] : g.v <= g.stages[i]) n++;
    return n;
  }
  DK.gauge = function (S, name, o) {
    o = o || {};
    var G = S.gauges = S.gauges || {};
    if (G[name]) return G[name];
    var min = o.min != null ? +o.min : 0, max = o.max != null ? +o.max : 100, dir = o.dir === 'down' ? 'down' : 'up';
    var st = (o.stages || []).map(Number).filter(function (x) { return !isNaN(x); });
    st.sort(function (x, y) { return dir === 'up' ? x - y : y - x; });
    var g = G[name] = { v: clamp(o.v != null ? +o.v : (dir === 'up' ? min : max), min, max), min: min, max: max, dir: dir, stages: st, label: o.label || name, stageMax: 0 };
    g.stageMax = stageOf(g);
    return g;
  };
  function gOf(S, name) { var g = S && S.gauges && S.gauges[name]; if (!g) throw new Error('HK.DarkKit：計器 ' + name + ' がありません（DK.gauge で作る）'); return g; }
  DK.push = function (S, name, delta) {
    var g = gOf(S, name), d = +delta || 0;
    if (g.dir === 'up' ? d < 0 : d > 0) d = 0;
    var v0 = g.v; g.v = clamp(g.v + d, g.min, g.max);
    var s0 = g.stageMax, s1 = stageOf(g);
    if (s1 > g.stageMax) g.stageMax = s1;
    return { v: g.v, d: g.v - v0, stage: g.stageMax, rose: g.stageMax > s0 };
  };
  DK.val = function (S, name) { return gOf(S, name).v; };
  DK.stage = function (S, name) { return gOf(S, name).stageMax; };
  DK.tmpReset = function (S) { S.tmp = {}; return S.tmp; };

  /* ---------- 段の札 ---------- */
  DK.stOk = function (st, n) {
    if (st == null || st === '') return true;
    var m = /^(\d+)\+$/.exec(st); if (m) return n >= +m[1];
    m = /^-(\d+)$/.exec(st); if (m) return n <= +m[1];
    m = /^(\d+)-(\d+)$/.exec(st); if (m) return n >= +m[1] && n <= +m[2];
    m = /^(\d+)$/.exec(st); if (m) return n === +m[1];
    throw new Error('HK.DarkKit：段の札の形が違います: ' + st);
  };
  function rowOk(ctx, S, r, o) {
    if (r.st != null) {
      var parts = String(r.st).split(/\s+/);
      for (var i = 0; i < parts.length; i++) {
        var p = parts[i], c = p.indexOf(':'), n;
        if (c >= 0) n = DK.stage(S, p.slice(0, c)), p = p.slice(c + 1);
        else n = o.stage != null ? +o.stage : o.g ? DK.stage(S, o.g) : 0;
        if (!DK.stOk(p, n)) return false;
      }
    }
    if (r.sh && o.sh) { var sh = Array.isArray(r.sh) ? r.sh : String(r.sh).split(/\s+/); if (sh.indexOf(o.sh) < 0) return false; }
    if (typeof r.when === 'function' && !r.when(ctx, S, o.a, o.b)) return false;
    return true;
  }
  function norm(r) { return typeof r === 'string' ? { t: r } : r; }
  function U(S) { S.used = S.used || {}; S.lru = S.lru || {}; S._tick = S._tick || 0; return S.used; }
  DK.use = function (S, t) { if (!t) return; var u = U(S); u[t] = (u[t] || 0) + 1; S.lru[t] = ++S._tick; };
  DK.fresh = function (S, t) { return !U(S)[t]; };
  DK.pick = function (ctx, S, list, o) {
    o = o || {};
    var rows = (list || []).map(norm).filter(function (r) { return r && r.t && rowOk(ctx, S, r, o); }), u = U(S);
    var fr = rows.filter(function (r) { return !u[r.t]; }), pool = fr;
    if (!pool.length && o.again && rows.length) {
      var lo = Math.min.apply(null, rows.map(function (r) { return u[r.t] || 0; }));
      pool = rows.filter(function (r) { return (u[r.t] || 0) === lo; });
      var old = Math.min.apply(null, pool.map(function (r) { return S.lru[r.t] || 0; }));
      pool = pool.filter(function (r) { return (S.lru[r.t] || 0) === old; });
    }
    if (!pool.length) return o.full ? null : '';
    var sum = 0; pool.forEach(function (r) { sum += r.w != null ? Math.max(0, +r.w) : 1; });
    var x = ctx.rng() * sum, got = pool[pool.length - 1];
    for (var i = 0; i < pool.length; i++) { x -= pool[i].w != null ? Math.max(0, +pool[i].w) : 1; if (x < 0) { got = pool[i]; break; } }
    DK.use(S, got.t);
    return o.full ? got : got.t;
  };
  DK.once = function (S, key) { var O = S.once = S.once || {}; if (O[key]) return false; O[key] = 1; return true; };
  DK.seen = function (S, key) { return !!(S.once && S.once[key]); };

  /* ---------- 話し手の目印（セット B の HK.PairKit.who・mark の写し） ---------- */
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
  DK.who = function (t, i, why) {
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
  DK.mark = function (t) {
    t = String(t || '');
    if (t.indexOf('「') < 0) return t;
    var out = '', d = 0, last = 0;
    for (var i = 0; i < t.length; i++) {
      var c = t.charAt(i);
      if (c === '「') { if (!d) { var x = DK.who(t, i); if (x) { out += t.slice(last, i + 1) + '＠{' + x + '}＠'; last = i + 1; } } d++; }
      else if (c === '」') d = Math.max(0, d - 1);
    }
    return out + t.slice(last);
  };

  /* ---------- 文の仕上げ・記録 ---------- */
  DK.fill = function (ctx, t, a, b, ex) {
    t = DK.mark(t);
    if (ex) Object.keys(ex).forEach(function (k) { t = t.split('{' + k + '}').join(ex[k]); });
    return ctx.t(t, a, b);
  };
  /* 作り手の語（本文に出してはいけない）：計器・段・分岐の名前、英字の鍵 */
  DK.NG = /計器|段の札|分岐|ゲージ|stage|gauge|\{[a-z]\}|undefined|NaN/;
  DK.say = function (ctx, o) {
    o = o || {};
    var o2 = {}; Object.keys(o).forEach(function (k) { if (!/^(id|tag|face|S|t|a|b|ex)$/.test(k)) o2[k] = o[k]; });
    if (o.t != null && o.text == null) o2.text = DK.fill(ctx, o.t, o.a, o.b, o.ex);
    var t0 = o2.text;
    o2.text = function (r) {
      var t = typeof t0 === 'function' ? t0(r) : t0;
      if (t && DK.NG.test(String(t))) { (ctx._dkLeak = ctx._dkLeak || []).push(String(t).slice(0, 60)); return ''; }
      return t;
    };
    var e = ctx.act2(o2);
    if (!e) return null;
    if (o.id) e.ev = String(o.id);
    if (o.tag) e.tag = o.tag;
    if (o.face) { var f = {}; Object.keys(o.face).forEach(function (k) { if (HK.Face && HK.Face.KEYS.indexOf(o.face[k]) >= 0 && !/^moan_/.test(o.face[k])) f[k] = o.face[k]; }); if (Object.keys(f).length) e.dkf = f; }
    if (o.S && typeof t0 === 'string') DK.use(o.S, t0);
    return e;
  };
})();
