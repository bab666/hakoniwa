/* 箱庭診断 core: 乱数・気質計算・名簿パース・汎用ヘルパー */
(function () {
  'use strict';
  var HK = (window.HK = window.HK || {});

  HK.FACTORS = ['CP', 'NP', 'A', 'FC', 'AC'];
  HK.FACTOR_NAME = { CP: '厳しさ', NP: '優しさ', A: '冷静さ', FC: '奔放さ', AC: '遠慮・協調' };
  HK.FACTOR_FULL = {
    CP: '批判的な親（CP）', NP: '養育的な親（NP）', A: '大人（A）',
    FC: '自由な子ども（FC）', AC: '順応した子ども（AC）'
  };
  HK.FACTOR_HIGH = {
    CP: '規範に厳しく、主導権を握りたがる', NP: '面倒見がよく、弱った相手を放っておけない',
    A: '状況を冷静に計算する', FC: '感情に正直で、楽しいことに飛びつく', AC: '空気を読み、相手に合わせて我慢する'
  };
  HK.FACTOR_LOW = {
    CP: 'ルールに縛られない', NP: '他人の世話に関心が薄い', A: '理屈より勢いで動く',
    FC: '感情を表に出しにくい', AC: '周りに合わせない'
  };

  HK.clamp = function (v, lo, hi) {
    if (lo === undefined) lo = 0;
    if (hi === undefined) hi = 1;
    return v < lo ? lo : v > hi ? hi : v;
  };

  /* mulberry32: シードで再現できる乱数 */
  HK.rng = function (seed) {
    var s = seed >>> 0;
    var f = function () {
      s = (s + 0x6d2b79f5) | 0;
      var t = Math.imul(s ^ (s >>> 15), 1 | s);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
    f.int = function (n) { return Math.floor(f() * n); };
    f.pick = function (arr) { return arr[Math.floor(f() * arr.length)]; };
    f.range = function (a, b) { return a + (b - a) * f(); };
    f.chance = function (p) { return f() < p; };
    f.shuffle = function (arr) {
      var a = arr.slice();
      for (var i = a.length - 1; i > 0; i--) {
        var j = Math.floor(f() * (i + 1));
        var t = a[i]; a[i] = a[j]; a[j] = t;
      }
      return a;
    };
    return f;
  };

  HK.newSeed = function () {
    if (window.crypto && window.crypto.getRandomValues) {
      var a = new Uint32Array(1);
      window.crypto.getRandomValues(a);
      return a[0] % 1000000;
    }
    return Math.floor(Math.random() * 1000000);
  };

  HK.weighted = function (rng, items, wfn) {
    var tot = 0, ws = [];
    for (var i = 0; i < items.length; i++) {
      var w = Math.max(0, wfn(items[i], i) || 0);
      ws.push(w); tot += w;
    }
    if (tot <= 0) return null;
    var r = rng() * tot;
    for (var k = 0; k < items.length; k++) {
      r -= ws[k];
      if (r <= 0) return items[k];
    }
    return items[items.length - 1];
  };

  /* エゴグラム（各0〜20）から派生気質（0〜1）を計算 */
  HK.traits = function (eg) {
    var c = HK.clamp;
    var n = function (k) { return c((eg[k] == null ? 10 : eg[k]) / 20); };
    var cp = n('CP'), np = n('NP'), a = n('A'), fc = n('FC'), ac = n('AC');
    return {
      cp: cp, np: np, a: a, fc: fc, ac: ac,
      caution: c(a * 0.45 + ac * 0.4 + (1 - fc) * 0.15),
      aggr: c(cp * 0.45 + fc * 0.35 + (1 - np) * 0.2),
      warmth: c(np * 0.6 + fc * 0.4),
      honesty: c(fc * 0.5 + (1 - ac) * 0.5),
      impulse: c(fc * 0.65 + (1 - a) * 0.35),
      jealous: c(ac * 0.45 + cp * 0.3 + (1 - a) * 0.25),
      lead: c(cp * 0.5 + a * 0.3 + (1 - ac) * 0.2),
      cold: c(a * 0.4 + (1 - np) * 0.6)
    };
  };
  HK.TRAIT_NAME = {
    caution: '慎重さ', aggr: '攻撃性', warmth: '人懐こさ', honesty: '本音の出やすさ',
    impulse: '衝動性', jealous: '嫉妬・執着', lead: '主導性', cold: 'ドライさ'
  };
  HK.TRAIT_SRC = {
    caution: 'A・AC高／FC低', aggr: 'CP・FC高／NP低', warmth: 'NP・FC高', honesty: 'FC高／AC低',
    impulse: 'FC高／A低', jealous: 'AC・CP高／A低', lead: 'CP・A高／AC低', cold: 'A高／NP低'
  };

  /* エゴグラムの型を短く言語化 */
  HK.egoType = function (eg) {
    var f = HK.FACTORS.slice().sort(function (x, y) { return eg[y] - eg[x]; });
    var top = f[0], low = f[4];
    return { top: top, low: low, label: top + '優位・' + low + '低め', code: HK.toCode(eg) };
  };
  HK.lvl = function (v) { return v >= 14 ? '高' : v <= 6 ? '低' : '中'; };
  HK.fdesc = function (c, k) {
    return k + (c.eg[k] >= 14 ? '高' : c.eg[k] <= 6 ? '低' : '中') + '（' + Math.round(c.eg[k]) + '）';
  };

  /* ---------- 名簿パース ---------- */
  var GRADE = { '高': 16, '中': 10, '低': 4, 'H': 16, 'M': 10, 'L': 4 };

  function normalize(text) {
    return text
      .replace(/[０-９]/g, function (d) { return String.fromCharCode(d.charCodeAt(0) - 0xfee0); })
      .replace(/[Ａ-Ｚａ-ｚ]/g, function (d) { return String.fromCharCode(d.charCodeAt(0) - 0xfee0); })
      .replace(/[：]/g, ':').replace(/[，、]/g, ',').replace(/[＝]/g, '=')
      .replace(/[／｜]/g, '/').replace(/[．]/g, '.').replace(/　/g, ' ');
  }

  function cleanName(s) {
    return s.replace(/[「」『』【】\[\]]/g, '').replace(/[\s:=\/|,\-–—]+$/g, '').replace(/^[\s:=\/|,\-]+/g, '').trim();
  }

  HK.parseRoster = function (text) {
    var out = [], warnings = [];
    var lines = normalize(text || '').split(/\r?\n/);
    var header = null, lastCode = '';
    lines.forEach(function (raw, idx) {
      var line = raw.replace(/^\s*(?:[-*+・●○◆◇■□▶►>※]|\d+[.)])\s*/, '').trim();
      if (!line || /^#/.test(line)) return;
      /* 「ふたりのエゴグラム」の結果文：「名前のエゴグラムは「ABADC」筋を通す観測者でした。」 */
      var fm = line.match(/^(.+?)の(?:エゴグラム|診断結果|結果)(?:は|：|:)\s*[「『"]?\s*([A-Da-d]{5})\s*[」』"]?\s*(.*)$/);
      if (fm) {
        var lbl = fm[3].replace(/(でした|です)?[。.!！]*\s*$/, '').trim();
        lastCode = fm[2].toUpperCase();
        out.push({ name: cleanName(fm[1]).slice(0, 24) || 'キャラ' + (out.length + 1), eg: HK.fromCode(fm[2]), memo: lbl.slice(0, 80) });
        return;
      }
      /* 結果ページのURL（…/ego/#p.ABADC）。直前の行と同じコードなら読み飛ばす */
      if (/^https?:\/\//i.test(line)) {
        var um = line.match(/#p\.([A-Da-d]{5})/);
        if (um && um[1].toUpperCase() !== lastCode) { lastCode = um[1].toUpperCase(); out.push({ name: 'キャラ' + (out.length + 1), eg: HK.fromCode(um[1]), memo: '' }); }
        return;
      }
      var memo = '';
      var mi = line.indexOf('//');
      if (mi >= 0) { memo = line.slice(mi + 2).trim(); line = line.slice(0, mi).trim(); }

      var cells = line.split(/\s*[,\t]\s*/);
      if (cells.length >= 5 && cells.filter(function (x) { return /^(CP|NP|A|FC|AC)$/i.test(x); }).length >= 4) {
        header = cells.map(function (x) { return x.toUpperCase(); });
        return;
      }
      var eg = {}, name = '', got = 0;

      if (header && cells.length >= 6) {
        header.forEach(function (h, i) {
          if (HK.FACTORS.indexOf(h) >= 0) { var v = parseFloat(cells[i]); if (!isNaN(v)) { eg[h] = v; got++; } }
          else if (!name && cells[i] && isNaN(parseFloat(cells[i]))) name = cells[i];
        });
      }
      if (got < 5) {
        eg = {}; got = 0;
        var re = /(^|[^A-Za-z])(CP|NP|FC|AC|A)\s*[:=]?\s*(\d+(?:\.\d+)?|高|中|低|H|M|L)(?![A-Za-z])/gi;
        var m, first = -1;
        while ((m = re.exec(line))) {
          var k = m[2].toUpperCase();
          var raw2 = m[3].toUpperCase();
          var v2 = GRADE[raw2] != null ? GRADE[raw2] : parseFloat(raw2);
          if (eg[k] == null) { eg[k] = v2; got++; }
          if (first < 0) first = m.index + m[1].length;
        }
        if (got >= 3) name = cleanName(line.slice(0, first));
      }
      if (got < 3) {
        var cm = line.match(/(^|[^A-Za-z])([A-Da-d]{5})(?![A-Za-z])/);
        if (cm) {
          eg = HK.fromCode(cm[2]); got = 5;
          var at = cm.index + cm[1].length;
          name = cleanName(line.slice(0, at).replace(/(のエゴグラム)?(は|：|:)?\s*[「『"]?\s*$/, '')) || cleanName(line.slice(at + 5));
          lastCode = cm[2].toUpperCase();
          out.push({ name: (name || 'キャラ' + (out.length + 1)).slice(0, 24), eg: eg, memo: memo.slice(0, 80) });
          return;
        }
      }
      if (got < 3) {
        eg = {}; got = 0;
        var nums = line.match(/\d+(?:\.\d+)?/g);
        if (nums && nums.length >= 5) {
          var pos = line.search(/\d/);
          name = cleanName(line.slice(0, pos));
          HK.FACTORS.forEach(function (k, i) { eg[k] = parseFloat(nums[i]); got++; });
        }
      }
      if (got < 3) {
        warnings.push((idx + 1) + '行目「' + raw.trim().slice(0, 20) + '」は数値を読み取れませんでした');
        return;
      }
      var max = 0;
      HK.FACTORS.forEach(function (k) { if (eg[k] != null && eg[k] > max) max = eg[k]; });
      var scale = max > 20 ? 20 / (max > 100 ? max : 100) : 1;
      HK.FACTORS.forEach(function (k) {
        if (eg[k] == null) {
          eg[k] = 10;
          warnings.push((name || (idx + 1) + '行目') + ' の ' + k + ' が無いので 10 として扱いました');
        } else eg[k] = Math.round(HK.clamp(eg[k] * scale, 0, 20) * 10) / 10;
      });
      if (!name) name = 'キャラ' + (out.length + 1);
      out.push({ name: name.slice(0, 24), eg: eg, memo: memo.slice(0, 80) });
    });
    return { chars: out, warnings: warnings };
  };

  /* ---------- 5文字コード（ふたりのエゴグラム形式：CP→NP→A→FC→AC、A強〜D控えめ） ---------- */
  HK.LETTER_VAL = { A: 17, B: 12, C: 8, D: 3 };
  HK.LETTER_NAME = { A: 'とても強い', B: '強め', C: 'ふつう', D: '控えめ' };
  HK.letterOf = function (v) { return v >= 14.5 ? 'A' : v >= 10 ? 'B' : v >= 5.5 ? 'C' : 'D'; };
  HK.toCode = function (eg) { return HK.FACTORS.map(function (k) { return HK.letterOf(eg[k]); }).join(''); };
  HK.fromCode = function (code) {
    var eg = {}, up = String(code).toUpperCase();
    HK.FACTORS.forEach(function (k, i) { eg[k] = HK.LETTER_VAL[up.charAt(i)] || 10; });
    return eg;
  };
  HK.isCode = function (s) { return /^[A-Da-d]{5}$/.test(String(s).trim()); };
  HK.isExactCode = function (eg) {
    return HK.FACTORS.every(function (k) { return eg[k] === HK.LETTER_VAL[HK.letterOf(eg[k])]; });
  };

  /* 名簿 → テキスト（書き出し用）。コードどおりの値ならコードだけ、細かく調整していれば数値も添える */
  HK.rosterToText = function (chars) {
    return chars.map(function (c) {
      var body = HK.isExactCode(c.eg) ? HK.toCode(c.eg) : HK.FACTORS.map(function (k) { return k + c.eg[k]; }).join(' ');
      return '- ' + c.name + ' ' + body + (c.memo ? ' // ' + c.memo : '');
    }).join('\n');
  };

  /* ---------- ペアの基本相性（シミュ前の予想） ---------- */
  HK.baseCompat = function (A, B) {
    var a = A.tr, b = B.tr, notes = [], aff = 0, ten = 0, att = 0;
    function add(v, t, x, s) { if (v > 0.12) { notes.push({ w: v, text: s }); aff += x.aff * v; ten += x.ten * v; att += x.att * v; } }
    add(a.np * b.ac, 0, { aff: 40, ten: 0, att: 15 }, A.name + 'のNP（世話焼き）と' + B.name + 'のAC（甘え下手な遠慮）が噛み合う');
    add(b.np * a.ac, 0, { aff: 40, ten: 0, att: 15 }, B.name + 'のNPが' + A.name + 'のACを包む');
    add(a.cp * b.cp, 0, { aff: -10, ten: 45, att: 5 }, '二人ともCPが高く、主導権がぶつかる');
    add(a.cp * b.fc, 0, { aff: -5, ten: 35, att: 15 }, A.name + 'のCPが' + B.name + 'の奔放さ（FC）を締めつける');
    add(b.cp * a.fc, 0, { aff: -5, ten: 35, att: 15 }, B.name + 'のCPが' + A.name + 'のFCとぶつかる');
    add(a.fc * b.fc, 0, { aff: 30, ten: 10, att: 25 }, '二人ともFCが高く、ノリが合う');
    add(a.a * b.a, 0, { aff: 10, ten: 0, att: 0 }, '二人ともA優位で、互いを合理的に評価する');
    add(a.ac * b.ac, 0, { aff: 5, ten: 10, att: 5 }, '二人ともACが高く、遠慮し合って距離が縮まらない');
    add(a.np * b.np, 0, { aff: 25, ten: 0, att: 5 }, '二人ともNPが高く、穏やかな関係になりやすい');
    add(a.cold * b.warmth, 0, { aff: 5, ten: 10, att: 25 }, A.name + 'のドライさに' + B.name + 'が惹かれやすい');
    add(b.cold * a.warmth, 0, { aff: 5, ten: 10, att: 25 }, B.name + 'のドライさに' + A.name + 'が惹かれやすい');
    notes.sort(function (x, y) { return y.w - x.w; });
    var score = aff + att * 0.5 - ten * 0.8;
    var kind = ten > 25 && aff < 15 ? 'clash' : att > 18 && aff > 15 ? 'spark' : aff > 25 ? 'warm' : ten > 20 ? 'friction' : 'flat';
    var KIND = { clash: '衝突しやすい', spark: '惹かれ合いやすい', warm: '穏やかに打ち解ける', friction: '摩擦が出やすい', flat: '淡泊な関係になりやすい' };
    return { aff: aff, ten: ten, att: att, score: score, kind: kind, kindLabel: KIND[kind], notes: notes.slice(0, 3).map(function (n) { return n.text; }) };
  };

  HK.escape = function (s) {
    return String(s).replace(/[&<>"']/g, function (ch) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch];
    });
  };

  HK.store = {
    get: function (k, d) { try { var v = window.localStorage.getItem('hakoniwa:' + k); return v ? JSON.parse(v) : d; } catch (e) { return d; } },
    set: function (k, v) { try { window.localStorage.setItem('hakoniwa:' + k, JSON.stringify(v)); return true; } catch (e) { return false; /* 保存できない環境・容量超過 */ } }
  };
})();
