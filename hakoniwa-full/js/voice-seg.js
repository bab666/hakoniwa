/* 箱庭シミュレーター: 台詞・地の文・引用の区分（seg）
   結果の記録（log）の各項目 e に、文を区分ごとに分けた e.seg を付ける（e.text はこれまでどおり残す）。
     e.seg = [{ t:'n', s:'地の文' }, { t:'l', who:0, s:'アキラ「台詞」', nm:3, h:1 }, …]（s をつなぐと e.text と同じ）
     t … n 地の文／l 台詞行（文の頭か、名前「 の直後。話し手あり）／q 地の文に埋まった発話（話し手あり）／
         c 名詞の引用（「〜」という話・札の文字。口調を変えない）／m 喘ぎ・モブ（話し手なし。名前「 の形なら who にその人）／u 話し手が決まらない発話
     who … 話し手の住人の番号（input.chars・res.chars・res.heroes の番号）。nm … s の頭の名前の長さ（名前「 の形のとき）
     h … 長い文の改行で一つの台詞の塊になるもの（core.js の HK.fmtLong と同じ規則。同じ番号が一つの塊）
   区分と話し手は voice.js の processText が台詞を整えるときに決め（V._segBuf）、この包みが、ほかの仕上げ（全年齢の言い換え・
   語の差し替えなど）がすべて済んだあとで、できあがった文に合わせて e.seg にする。台詞の中身が変わって合わせられないときは、文から決め直す。
   e.seg は数え上げない属性（保存・共有・履歴の JSON には入らない）。保存から開いた記録は HK.Seg.of(e, 名前の一覧) で作り直す。
   この包みは、HK.simulate を包むほかのどの処理よりも後（_order.txt の最後の方）に読むこと。
   名前に記号のある住人の置き換え（HK.NameSafe）の包みは、さらにその外側（このファイルの最後） */
(function () {
  'use strict';
  var HK = window.HK, V = HK.Voice || {};
  var S = HK.Seg = {};
  /* 合わせ方の件数（点検用。seg-audit.js）：中身で合った／順番で合った／文から決め直した */
  S.stat = { content: 0, order: 0, redo: 0 };
  var NM = /⁤/g;
  function hide(o, k, v) { Object.defineProperty(o, k, { value: v, configurable: true, writable: true, enumerable: false }); }

  /* いちばん外側の「」の位置（voice.js の processText と同じ数え方：（……）の心の声は飛ばす） */
  function quotes(t) {
    var out = [], depth = 0, st = -1;
    for (var i = 0; i < t.length; i++) {
      var ch = t[i];
      if (ch === '（' && depth === 0) { var cl = t.indexOf('）', i); if (cl > i) { i = cl; continue; } }
      if (ch === '「') { if (depth === 0) st = i; depth++; }
      else if (ch === '」' && depth > 0) { depth--; if (depth === 0 && st >= 0) { out.push({ a: st, b: i }); st = -1; } }
    }
    return out;
  }
  S.quotes = quotes;

  /* processText が集めた区分（buf）に、整えたあとの台詞の中身を添えて、記録に隠して持たせる（voice.js の processResult から） */
  S.keep = function (e, buf) {
    if (!e || !buf || !buf.length) return;
    var Q = quotes(e.text);
    if (Q.length === buf.length) Q.forEach(function (x, k) { buf[k].s = e.text.slice(x.a + 1, x.b).replace(NM, ''); });
    hide(e, '_sq', buf);
  };

  /* 長い文の改行の塊（core.js の HK.fmtLong と同じ規則）：[開始, 終わり) の一覧 */
  function blocks(text, R) {
    var out = [], TK = '\u0000', pos = 0;
    text.split(/(\n+)/).forEach(function (part, k) {
      if (k % 2) { pos += part.length; return; }
      var lead = part.length - part.replace(/^\s+/, '').length, line = part.trim();
      if (line && HK.fmtMarkLine) {
        var marked = HK.fmtMarkLine(line, R, TK), o = pos + lead, inB = false, bs = 0;
        for (var i = 0; i < marked.length; i++) {
          if (marked[i] === TK) { if (inB) out.push([bs, o]); else bs = o; inB = !inB; continue; }
          o++;
        }
      }
      pos += part.length;
    });
    return out;
  }

  /* 話し手の決まらない「」（u）を、文の形で分け直す（言い換えには使わない。区分だけ）：
     題名・名詞の引用（c）／住人でない誰かの発話（m。「司会の〇〇「……」」「誰かが「……」と漏らした」）／それ以外は u のまま */
  var BOUND = /[。！？!?」\n]|――/g;
  function lastBound(s) { var cut = 0, m; BOUND.lastIndex = 0; while ((m = BOUND.exec(s))) cut = m.index + m[0].length; return cut; }
  var FRAME = /(?:目標|最初|型|名前|名|題|題名|テーマ|お題|命令|暗示|合言葉|看板|札|文字|口癖|モットー|メニュー|コース|項目|内容|方針|作戦|役|役割|職業|称号|あだ名|呼び名|答え|正解|お告げ|条件|ルール|指示|罰ゲーム|ゲーム|種目|企画)(?:は|が|も)?、?\s*$/;
  function refine(text, a, b, names) {
    var q = text.slice(a + 1, b), post = text.slice(b + 1, b + 9), pre = text.slice(0, a), cut = lastBound(pre), span = pre.slice(cut);
    var sp = V.speechy ? V.speechy(q) : true;
    if (FRAME.test(span) || /[：:→]\s*$/.test(span)) return 'c';
    if (!sp && (/^(?:する|して|し[、た]|され|な(?!が)|だ|です|とか|など|まで|より|から|で|も|は|。|、)/.test(post) || text[a - 1] === '」' || text[b + 1] === '「' || /[^、。\sはがもをにでとへのや]$/.test(span))) return 'c';
    if (span.trim()) return 'm';
    if (cut > 0 && V.mobSubj) { var pv = pre.slice(0, cut - 1); if (V.mobSubj(pv.slice(lastBound(pv)), names.map(function (n) { return { name: n }; }))) return 'm'; }
    return 'u';
  }

  /* 文 text を seg に分ける。names は住人の名前（番号順）、sq は processText が集めた区分（なければ文から決める） */
  S.build = function (text, names, sq) {
    text = String(text == null ? '' : text);
    var R = HK.fmtSpeech ? HK.fmtSpeech(names) : null, Q = quotes(text), people = null;
    var B = R ? blocks(text, R) : [];
    /* 区分を台詞に合わせる：中身が同じものを先に（全年齢の言い換えで消えた台詞は飛ばす）、数が同じなら順番で */
    var j = 0, D = Q.map(function (x, k) {
      var s = text.slice(x.a + 1, x.b);
      if (sq && j < sq.length) {
        for (var d = j; d < Math.min(sq.length, j + 5); d++) if (sq[d].s != null && sq[d].s === s) { j = d + 1; S.stat.content++; return sq[d]; }
        if (sq.length === Q.length) { j = k + 1; S.stat.order++; return sq[k]; }
      }
      /* 文から決め直す（voice.js の V.quoteKind） */
      S.stat.redo++;
      if (!V.quoteKind) return { k: 'u', w: -1 };
      people = people || names.map(function (n) { return { name: n || '' }; });
      return V.quoteKind(text, x.a, x.b, people);
    });
    /* 塊が台詞の区切りとそろっているか（そろっていなければ HK.fmtLong は seg を使わず、これまでの方法で改行する） */
    var blk = true, hOf = [], pre = [];
    B.forEach(function (b, bi) {
      var inside = Q.map(function (x, k) { return k; }).filter(function (k) { return Q[k].a >= b[0] && Q[k].b < b[1]; });
      if (!inside.length) { blk = false; return; }
      var f = inside[0], l = inside[inside.length - 1];
      if (Q[l].b + 1 !== b[1]) blk = false;
      for (var k = f; k < l; k++) if (Q[k].b + 1 !== Q[k + 1].a) blk = false;
      if (inside.length !== l - f + 1) blk = false;
      pre[f] = Q[f].a - b[0];
      if (/[「」]/.test(text.slice(b[0], Q[f].a))) blk = false;
      inside.forEach(function (k) { hOf[k] = bi + 1; });
    });
    var seg = [], at = 0;
    Q.forEach(function (x, k) {
      var d = D[k] || { k: 'u', w: -1 }, h = hOf[k] || 0, nm = h && pre[k] > 0 ? pre[k] : 0;
      /* 塊でない「名前「……」」（前の台詞に続く「アキラ「……」ミナト「……」」の二つ目など）も台詞行。名前は台詞の側に入れる */
      if (!nm && !h) nm = nameAt(text, x.a, names);
      if (nm && x.a - nm < at) { nm = 0; if (h) blk = false; }
      var from = x.a - nm;
      if (from > at) seg.push({ t: 'n', s: text.slice(at, from) });
      var t = d.k === 's' ? (h || nm ? 'l' : 'q') : d.k === 'u' ? refine(text, x.a, x.b, names) : d.k;
      var o = { t: t, s: text.slice(from, x.b + 1) };
      if (d.w >= 0) o.who = d.w;
      if (nm) o.nm = nm;
      if (h) o.h = h;
      seg.push(o);
      at = x.b + 1;
    });
    if (at < text.length || !seg.length) seg.push({ t: 'n', s: text.slice(at) });
    seg.blk = blk;
    seg.nk = R ? R.key : '';
    return seg;
  };
  /* 「 の直前の住人の名前の長さ（名前の前が文の切れ目・閉じ括弧などのとき。なければ 0） */
  function nameAt(text, a, names) {
    var best = 0;
    names.forEach(function (n) {
      if (!n || n.length <= best || text.slice(a - n.length, a) !== n) return;
      var c = text.charAt(a - n.length - 1);
      if (!c || !/[ぁ-んァ-ヶー一-鿿々A-Za-z0-9０-９Ａ-Ｚａ-ｚ]/.test(c)) best = n.length;
    });
    return best;
  }
  S.text = function (seg) { return (seg || []).map(function (x) { return x.s; }).join(''); };
  /* HK.fmtLong 用：塊の前後に印を入れた文 */
  S.markTK = function (seg, TK) {
    return seg.map(function (x, i) {
      if (!x.h) return x.s;
      var p = seg[i - 1], n = seg[i + 1];
      return (p && p.h === x.h ? '' : TK) + x.s + (n && n.h === x.h ? '' : TK);
    }).join('');
  };
  /* 記録 e の seg（なければ・文が変わっていれば作り直す）。names は住人の名前の一覧か、res（res.chars・res.heroes から取る） */
  function namesOf(x) {
    if (Array.isArray(x)) return x.map(function (c) { return typeof c === 'string' ? c : c && c.name || ''; });
    var L = x && (x.chars && x.chars.length ? x.chars : x.heroes) || [];
    return L.map(function (c) { return c && c.name || ''; });
  }
  S.of = function (e, names) {
    if (!e || typeof e.text !== 'string') return [];
    if (e.seg && S.text(e.seg) === e.text) return e.seg;
    var seg = S.build(e.text, namesOf(names));
    hide(e, 'seg', seg);
    return seg;
  };
  /* 台詞行（l）の話し手（出た順・重なりなし） */
  S.speakers = function (seg, kinds) {
    var out = [], K = kinds || 'l';
    (seg || []).forEach(function (x) { if (K.indexOf(x.t) >= 0 && x.who >= 0 && out.indexOf(x.who) < 0) out.push(x.who); });
    return out;
  };
  /* 発話（台詞行・埋まった発話・モブ・決まらない発話）があるか（画面の吹き出し） */
  S.talk = function (seg) { return (seg || []).some(function (x) { return /^[lqmu]$/.test(x.t); }); };

  /* いちばん外側の包み：ほかの仕上げがすべて済んだ文に合わせて e.seg を作る */
  if (HK.simulate && !HK.simulate._seg) {
    var sim0 = HK.simulate;
    HK.simulate = function (input) {
      var r = sim0.apply(this, arguments);
      if (r && Array.isArray(r.log)) {
        var names = namesOf(input && input.chars && input.chars.length ? input.chars : r);
        r.log.forEach(function (e) {
          if (!e || typeof e !== 'object') return;
          try { if (typeof e.text === 'string') hide(e, 'seg', S.build(e.text, names, e._sq)); } catch (err) { /* 区分に失敗しても結果は返す */ }
          if (e._sq) delete e._sq;
        });
      }
      return r;
    };
    for (var k in sim0) if (Object.prototype.hasOwnProperty.call(sim0, k)) HK.simulate[k] = sim0[k];
    HK.simulate._seg = true;
  }
  /* さらに外側の包み：名前に記号（！。？（）など）のある住人は、箱庭を動かしているあいだだけ、記号を私用領域の文字にした名前で動かす（core.js の HK.NameSafe）。
     話し手の判定・口調の置き換え・seg・呼び方が、記号のない名前と同じように効く。結果を返す前に、文・seg・キーの名前を全部元に戻す */
  var NS = HK.NameSafe;
  /* 保存から開いた記録の seg を作り直すとき（HK.Seg.of → S.build）も、名前の記号を置き換えてから区分を決め、文と nk を戻す */
  if (NS) {
    var build0 = S.build;
    S.build = function (text, names, sq) {
      if (typeof text !== 'string' || !Array.isArray(names) || !names.some(function (n) { return NS.need(n); })) return build0.apply(this, arguments);
      var seg = build0.call(this, NS.encText(text, names), names.map(function (n) { return NS.enc(n); }), sq);
      seg.forEach(function (x) { if (x && typeof x.s === 'string') x.s = NS.dec(x.s); });
      if (typeof seg.nk === 'string') seg.nk = NS.dec(seg.nk);
      return seg;
    };
  }
  if (NS && HK.simulate && !HK.simulate._nameSafe) {
    var sim2 = HK.simulate;
    HK.simulate = function (input) {
      var cs = input && input.chars;
      if (!Array.isArray(cs) || !cs.some(function (c) { return c && NS.need(c.name); })) return sim2.apply(this, arguments);
      /* 置き換え表は、名前が「constructor」「toString」などでも Object の持ち物を拾わないように、自分の持つ鍵だけを引く */
      var ren = Object.create(null), rn = function (k) { return Object.prototype.hasOwnProperty.call(ren, k) ? ren[k] : k; };
      cs.forEach(function (c) { if (c && NS.need(c.name)) ren[c.name] = NS.enc(c.name); });
      /* 名前をキーにした設定（相手ごとの呼び方 calls・敬語 keigo）も置き換える */
      var rk = function (m) { if (!m || typeof m !== 'object' || Array.isArray(m)) return m; var o = {}; Object.keys(m).forEach(function (k) { o[rn(k)] = m[k]; }); return o; };
      var in2 = Object.assign({}, input, { chars: cs.map(function (c) { return c && typeof c === 'object' ? Object.assign({}, c, { name: rn(c.name), calls: rk(c.calls), keigo: rk(c.keigo) }) : c; }) });
      var r = sim2.call(this, in2);
      try { NS.decDeep(r); } catch (err) { /* 戻しに失敗しても結果は返す */ }
      return r;
    };
    for (var k2 in sim2) if (Object.prototype.hasOwnProperty.call(sim2, k2)) HK.simulate[k2] = sim2[k2];
    HK.simulate._nameSafe = true;
  }
})();
