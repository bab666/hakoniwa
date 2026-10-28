/* 箱庭シミュレーター: 性器の呼び方（R18版のみ。キャラの設定「性器の呼び方」）
   キャラごとに、性器をどう呼ぶか（作風）を決める。結果の文を仕上げる最後（HK.Voice.processResult のあと）に言い換える。
   ・作風 partWords：''＝おまかせ（言い換えない）／soft＝ぼかす／direct＝直接的／medical＝医学的
   ・自由記入 partM（男性器）・partF（女性器）：決めてあれば作風より優先する
   ・台詞（「」の中）は話し手の作風で言い換える（話し手は「名前「…」」の形で分かるものだけ）
   ・地の文は、その体の持ち主の作風で言い換える。持ち主は「名前の〇〇」（いちばん近い「名前の」）で分かるものだけ
   ・誰の体か分からない地の文・話し手の分からない台詞は言い換えない
   ・男性器の持ち主は男性かふたなり（HK.Pos.futa）、女性器の持ち主は女性
   点検：pos-audit の V1（女性どうしに男性の体の言葉）は、言い換えたあとの語（モノ）も見る */
(function () {
  'use strict';
  var HK = window.HK, V = HK && HK.Voice;
  if (!V || !V.processResult) return;
  var MARK = '⁤';
  /* 言い換える元の語（長いものから） */
  var M_SRC = ['おちんちん', 'おちんぽ', 'ちんぽ', 'ちんこ', 'いちもつ', '肉棒', 'ペニス', '陰茎', '男根', '一物', '剛直', '怒張'];
  var F_SRC = ['おまんこ', 'まんこ', '膣内', '蜜壺', '秘裂', '秘所', '秘部', '陰部', '割れ目', '膣'];
  /* 作風ごとの語：n＝地の文、q＝台詞。膣内は「中」の意味が強いので別にする */
  var STYLE = {
    soft: { m: { n: 'モノ', q: 'それ' }, f: { n: '秘めたところ', q: 'そこ' }, fin: { n: '奥', q: '奥' } },
    direct: { m: { n: 'ちんぽ', q: 'ちんぽ' }, f: { n: 'まんこ', q: 'おまんこ' }, fin: { n: 'まんこの中', q: 'おまんこの中' } },
    medical: { m: { n: 'ペニス', q: 'ペニス' }, f: { n: '膣', q: '膣' }, fin: { n: '膣内', q: '膣内' } }
  };
  function esc(s) { return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }
  var M_RE = new RegExp(M_SRC.map(esc).join('|'), 'g'), F_RE = new RegExp(F_SRC.map(esc).join('|'), 'g');
  var P = function () { return HK.Pos; };
  /* 持ち主の判定は性器（HK.Pos.hasM・hasF。attr.js の genital。決めていなければ性別・ふたなりどおり） */
  function hasM(c) { var Q = P(); if (Q && Q.genSet && Q.genSet(c)) return Q.hasM(c); return c.gender === 'm' || !!(Q && Q.futa && Q.futa(c)); }
  function hasF(c) { var Q = P(); if (Q && Q.genSet && Q.genSet(c)) return Q.hasF(c); return c.gender === 'f'; }
  function word(c, kind, src, inQ) {
    if (!c) return null;
    var custom = kind === 'm' ? c.partM : c.partF;
    if (custom) return src === '膣内' ? custom + 'の中' : custom;
    var st = STYLE[c.partWords];
    if (!st) return null;
    /* 直接的：もとから直接的な語（おちんぽ・おまんこ など）はそのまま */
    if (c.partWords === 'direct' && /^(?:お?ちん[ぽこ]|おちんちん|お?まんこ)$/.test(src)) return src;
    var w = kind === 'm' ? st.m : src === '膣内' ? st.fin : st.f;
    return inQ ? w.q : w.n;
  }
  function used(c) { return !!(c && (STYLE[c.partWords] || c.partM || c.partF)); }
  /* 地の文の一文を言い換える */
  function narr(sent, people) {
    var here = people.filter(function (c) { return c.name && sent.indexOf(c.name) >= 0; });
    if (!here.some(used)) return sent;
    function rep(kind) {
      return function (w, off) {
        var before = sent.slice(Math.max(0, off - 14), off).replace(new RegExp(MARK, 'g'), '');
        /* 「名前の」がいちばん近くにある人（「アキラの手がミナトの肉棒を」ならミナト）。その人がその体を持っていなければ言い換えない */
        var best = null, bi = -1;
        here.forEach(function (c) { var m = before.match(new RegExp(esc(c.name) + '(?:の|が持つ)(?=[^。、「」のにをがはでとへ]{0,6}$)')); if (m && m.index > bi) { bi = m.index; best = c; } });
        /* 「名前の」がない文は、モブ・客・魔物の体のこともあるので変えない */
        var own = best ? [best].filter(kind === 'm' ? hasM : hasF) : [];
        if (own.length !== 1) return w;
        return word(own[0], kind, w, false) || w;
      };
    }
    return sent.replace(M_RE, rep('m')).replace(F_RE, rep('f'));
  }
  /* 台詞を、話し手の作風で言い換える */
  function quote(q, who) {
    if (!used(who)) return q;
    return q.replace(M_RE, function (w) { return word(who, 'm', w, true) || w; }).replace(F_RE, function (w) { return word(who, 'f', w, true) || w; });
  }
  function speaker(text, start, people) {
    var pre = text.slice(Math.max(0, start - 20), start).replace(new RegExp(MARK, 'g'), '');
    var hit = null;
    people.forEach(function (c) { if (c.name && pre.slice(-c.name.length) === c.name && (!hit || c.name.length > hit.name.length)) hit = c; });
    return hit;
  }
  HK.PartWords = {
    STYLE: STYLE,
    apply: function (text, people) {
      if (!text || typeof text !== 'string' || !people.some(used)) return text;
      M_RE.lastIndex = 0; F_RE.lastIndex = 0;
      if (!M_RE.test(text) && !F_RE.test(text)) return text;
      M_RE.lastIndex = 0; F_RE.lastIndex = 0;
      var out = '', i = 0, depth = 0, buf = '', qs = -1;
      for (; i < text.length; i++) {
        var ch = text[i];
        if (ch === '「') {
          if (depth === 0) { out += buf.split(/(?<=。)/).map(function (s) { return narr(s, people); }).join(''); buf = ''; qs = i; }
          depth++; buf += ch; continue;
        }
        if (ch === '」' && depth > 0) {
          depth--; buf += ch;
          if (depth === 0) { var who = speaker(text, qs, people); out += who ? '「' + quote(buf.slice(1, -1), who) + '」' : buf; buf = ''; }
          continue;
        }
        buf += ch;
      }
      return out + (depth ? buf : buf.split(/(?<=。)/).map(function (s) { return narr(s, people); }).join(''));
    }
  };
  var pr0 = V.processResult;
  V.processResult = function (res, input) {
    var r = pr0.apply(this, arguments);
    if (HK.SAFE_ON || !res || !input || !input.chars) return r;
    var people = input.chars.map(function (c) { return { name: c.name, gender: c.gender || '', pos: c.pos || '', futa: !!c.futa, genital: c.genital || '', partWords: STYLE[c.partWords] ? c.partWords : '', partM: (c.partM || '').trim(), partF: (c.partF || '').trim() }; });
    if (!people.some(used)) return r;
    /* 住人の名前・呼び名は言い換えない（「剛直」さんの名前を「モノ」にしない。voice.js の HK.NameGuard で伏せてから通す） */
    var NG = HK.NameGuard;
    (res.log || []).forEach(function (e) {
      if (!e || typeof e.text !== 'string') return;
      e.text = NG ? NG.guard(e.text, input.chars, function (t, g) { return HK.PartWords.apply(t, g ? people.map(function (c) { return Object.assign({}, c, { name: g.enc(c.name) }); }) : people); }) : HK.PartWords.apply(e.text, people);
    });
    return r;
  };
})();
