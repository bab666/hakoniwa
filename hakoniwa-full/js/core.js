/* 箱庭診断 core: 乱数・気質計算・名簿パース・汎用ヘルパー */
(function () {
  'use strict';
  var HK = (window.HK = window.HK || {});

  HK.FACTORS = ['CP', 'NP', 'A', 'FC', 'AC'];
  /* 記録の「エロシーンだけ」の絞り込み（view.js・dungeon-view.js・solo-story-kit.js）：性的な場面の出来事か。
     出来事に e.lewd が付いていればそれ、なければ本文の言葉で見る（「罪を犯した」「到達した」「期待を抱いた」のような、ふつうの言い回しには反応しないように） */
  var LEWD_RE = /繋が(?:っ|る|り)|挿[れ入]|果て(?:た|る|て|そう)|喘|腰を(?:振|打ちつけ|打ち付け|沈め|落と|揺ら|くねら|突き上げ|使)|舐め(?:上げ|回|取|られ)|しゃぶ|愛撫|絶頂|イ(?:っ|か|き|く)(?:ちゃ|そう|た|て|る|ま)|イッ|(?<![到伝調発通配上熟])達し|花芯|胸の先|ナカ|奥を(?:突|抉)|体を重ね|肌を重ね|ローター(?!音)|ディルド|射精|中に出|注ぎ込|潮を|犯され|(?<!罪を)犯し(?:た|て)|凌辱|乱交|一夜を(?:共に|ともに)|一線を越え|♡/;
  HK.lewdEvent = function (e) {
    if (!e || e.kind === 'step') return false;
    if (e.lewd != null) return !!e.lewd;
    return LEWD_RE.test(String(e.text || ''));
  };
  /* 絞り込みの札を出すか（R18版で、全年齢モードでないとき。記録にエロシーンがひとつでもあれば） */
  HK.lewdFilterOn = function (log) { return !HK.SAFE_ON && (log || []).some(HK.lewdEvent); };
  /* 関係の結末（組のカード・テキスト書き出し）に載せる、エロシーンの概要。全文は段落つきで長いので、最初の一文だけに切り詰める */
  HK.lewdBrief = function (e) {
    var t = String(e && e.text || '').replace(/\n+/g, ' ').replace(/^[\s―]+/, '');
    var m = t.match(/^[^。！？]*?(?:「[^」]*」[^。！？]*?)*[。！？]/);
    var s = m ? m[0] : t.slice(0, 60);
    if (s.length > 70) s = s.slice(0, 68) + '…';
    return s + '――夜の場面（全文は経過で）';
  };
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
  /* いちばん強い因子が複数あるとき（BAABC の NP と A など）：箱庭を回しているあいだは、その中からランダムに選ぶ
     （乱数は HK._topRng。engine.js が回すたびに種から作る。本筋の乱数とは別なので、ほかの展開は変わらない）。回していないとき（画面の表示）は先の因子。
     文を選ぶたびに呼ぶ所（HK.voiceTop など）は毎回選び直す。人物に持たせる p.top は、作るときに一度だけ選ぶ（その回の中では、仕組みの判定が揺れないように） */
  HK.egoType = function (eg) {
    var f = HK.FACTORS.slice().sort(function (x, y) { return eg[y] - eg[x]; });
    var tops = f.filter(function (k) { return eg[k] === eg[f[0]]; });
    var top = tops.length > 1 && HK._topRng ? tops[HK._topRng(tops.length)] : f[0], low = f[4];
    return { top: top, tops: tops, low: low, label: tops.join('・') + '優位・' + low + '低め', code: HK.toCode(eg) };
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

  /* 長い場面の整形（表示・書き出しの直前に通す）
     ・140字以上の文だけ。段落ごとに改行し、「名前「……」」の台詞は前後に空行を置いて一行にする
     ・地の文は句点で区切って、だいたい2〜3文（60〜110字）ごとに改行する
     ・もとから改行のある文（段落に分けた山場）は、段落の形は変えず、台詞だけを独立させる
     names：登場人物の名前の一覧（台詞の話者の判定に使う。名前の直後の「 だけを台詞とみなす） */
  /* 長い文の台詞の塊：文頭か句点・閉じ括弧・ダッシュのあとに続く 名前「…」（「…」が続けて並ぶものも一つ）と、文頭の「…」。
     塊の前後に印 TK を入れた行を返す。voice-seg.js（HK.Seg）も同じ関数で seg の塊（h）を決めるので、seg からの改行と結果が同じになる */
  HK.fmtSpeech = function (names) {
    var nm = (names || []).filter(Boolean).map(String).sort(function (a, b) { return b.length - a.length; });
    var NAME = nm.length ? '(?:' + nm.map(function (n) { return n.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }).join('|') + ')' : null;
    return {
      key: nm.join('\u0001'),
      SPEECH: NAME ? new RegExp('(^|[。！？」）\\s―…])(' + NAME + '(?:「[^「」]*」)+)(?!と|って|、と|など)', 'g') : null,
      LONE: /(^|[。！？」）\s―…])((?:「[^「」]*」)+)(?=$|[^と、っな])/g
    };
  };
  HK.fmtMarkLine = function (line, R, TK) {
    var marked = line;
    if (R.SPEECH) marked = marked.replace(R.SPEECH, function (m, pre, sp) { return pre + TK + sp + TK; });
    return marked.replace(R.LONE, function (m, pre, sp) { return pre + TK + sp + TK; });
  };
  /* seg（voice-seg.js の e.seg）を渡すと、塊を seg から取る（名前の並びが seg を作ったときと同じで、文が変わっていないときだけ） */
  HK.fmtLong = function (text, names, seg) {
    var s = String(text == null ? '' : text);
    if (s.length < 140 || !/[。！？」]/.test(s)) return s;
    var R = HK.fmtSpeech(names);
    var hadNL = /\n/.test(s);
    var TK = '\u0000';
    var fromSeg = seg && seg.blk && seg.nk === R.key && HK.Seg && HK.Seg.text(seg) === s ? HK.Seg.markTK(seg, TK).split(/\n+/) : null;
    var out = (fromSeg || s.split(/\n+/)).map(function (line) {
      line = line.trim();
      if (!line) return '';
      var blocks = [];
      var marked = fromSeg ? line : HK.fmtMarkLine(line, R, TK);
      marked.split(TK).forEach(function (seg, k) {
        seg = seg.replace(/^\s+|\s+$/g, '');
        if (!seg) return;
        blocks.push({ sp: k % 2 === 1, t: seg });
      });
      var res = [];
      blocks.forEach(function (b) {
        if (b.sp) { res.push({ sp: true, t: b.t }); return; }
        var paras = [];
        if (hadNL || b.t.length < 120) paras = [b.t.replace(/\s+/g, '')];
        else {
          var sents = b.t.split(/(?<=[。！？](?:」|）)?)\s*/).filter(Boolean), cur = '', n = 0, first = !res.length;
          sents.forEach(function (x) {
            x = x.replace(/^\s+/, '');
            /* 場面の最初の一文が短ければ（情景の一文）、それだけで一段落にする */
            if (cur && ((cur.length >= 60 && n >= 2) || cur.length >= 110 || cur.length + x.length > 150 || (first && !paras.length && n === 1 && cur.length <= 48))) { paras.push(cur); cur = ''; n = 0; }
            cur += x; n++;
          });
          if (cur) paras.push(cur);
        }
        paras.forEach(function (p) { res.push({ sp: false, t: p }); });
      });
      return res.map(function (b, i) {
        var prev = res[i - 1];
        if (!prev) return b.t;
        return (b.sp || prev.sp ? '\n\n' : '\n') + b.t;
      }).join('');
    });
    return out.filter(function (x, i, arr) { return x || (i > 0 && i < arr.length - 1); }).join(hadNL ? '\n\n' : '\n').replace(/\n{3,}/g, '\n\n');
  };

  HK.store = {
    get: function (k, d) { try { var v = window.localStorage.getItem('hakoniwa:' + k); return v ? JSON.parse(v) : d; } catch (e) { return d; } },
    set: function (k, v) { try { window.localStorage.setItem('hakoniwa:' + k, JSON.stringify(v)); return true; } catch (e) { return false; /* 保存できない環境・容量超過 */ } }
  };
})();
