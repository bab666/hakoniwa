/* 箱庭シミュレーター（R18版のみ）― 交わりの描写を組み立てる
   前戯 → 体位（どう繋がったか）→ 受けの喘ぎ → 最中 → 攻めの台詞 → 果てる声 → 果てる瞬間 → 事後の一言
   喘ぎと台詞は口調ごと（15種類）。体位は、関係（恋人・敵・媚薬など）と気質で選ばれやすさが変わり、同じゲームでは続きにくい。
   HK.R18M.sex(S, 攻め, 受け, {mood, allow:[体位id], fore, short}) … mood: love（恋人・想い）/ rough（敵・荒々しく）/ drug（媚薬）/ plain（その場の勢い）
   全年齢版ではこのファイルは読み込まれない。登場人物はすべて成人として扱う */
(function () {
  'use strict';
  var HK = window.HK, ST = HK.Story, D = HK.R18M_DATA;
  if (!D || !ST) return;
  function F(t, m) { return ST.fmt(t, m); }
  function pick(S, a) { return ST.pick(S, a); }
  function toneKey(p) {
    var t = HK.toneOf ? HK.toneOf(p) : p.tone;
    if (D.V[t]) return t;
    var b = HK.personaOf ? HK.personaOf(p) : 'gentle';
    return D.V[b] ? b : 'gentle';
  }
  function say(S, p, kind) {
    var t = toneKey(p);
    if (kind === 'endure') return p.name + '「' + pick(S, D.ENDURE[t] || D.ENDURE.gentle) + '」';
    var v = D.V[t]; return p.name + '「' + pick(S, v[kind] || v.mid) + '」';
  }
  function moodOf(m) { return m === 'rough' || m === 'drug' || m === 'love' ? m : 'plain'; }

  /* 体位を選ぶ */
  function pickPos(S, x, y, mood, allow) {
    var list = allow ? D.POS.filter(function (p) { return allow.indexOf(p.id) >= 0; }) : D.POS;
    if (!list.length) list = D.POS;
    var used = S.r18Pos || (S.r18Pos = []), tx = x.tr || {}, ty = y.tr || {};
    var tone = toneKey(y);
    return HK.weighted(S.rng, list, function (p) {
      var w = mood === 'love' ? 0.5 + p.love : mood === 'rough' ? 0.5 + p.rough : 1 + (p.love + p.rough) * 0.35;
      if (p.id === 'kijo') w *= 1 + (ty.fc || 0) * 2 + (tone === 'free' ? 1 : 0);
      if (p.id === 'back' || p.id === 'tachi' || p.id === 'neback') w *= 1 + (tx.aggr || 0) + (tx.cp || 0) * 0.5;
      if (p.id === 'seijo' || p.id === 'soku') w *= 1 + (tone === 'shy' || tone === 'devoted' ? 1 : 0) + (tx.np || 0) * 0.5;
      if (p.id === 'ekiben') w *= 0.4 + (x.stats && x.stats.nerve ? x.stats.nerve / 100 : 0.4);
      if (p.oral) w *= 0.45;
      var n = used.filter(function (u) { return u === p.id; }).length;
      return Math.max(0.02, w / (1 + n * 2.5));
    });
  }

  HK.R18M = {
    tone: toneKey,
    say: say,
    /* 一人の喘ぎ（kinds: ['start','mid','climax'] など） */
    moans: function (S, p, kinds) { return (kinds || ['start', 'climax']).map(function (k) { return say(S, p, k); }).join(''); },
    /* 二人の交わり。opt.fore=false で前戯を省く（すでに場面の文があるとき）。opt.short で短く */
    sex: function (S, x, y, opt) {
      opt = opt || {};
      var mood = moodOf(opt.mood), rng = S.rng, m = { x: x.name, y: y.name };
      var pos = opt.pos ? D.POS.filter(function (p) { return p.id === opt.pos; })[0] : pickPos(S, x, y, mood, opt.allow);
      if (!pos) pos = pickPos(S, x, y, mood);
      (S.r18Pos || (S.r18Pos = [])).push(pos.id);
      var mid = mood === 'plain' ? (rng() < 0.25 + ((x.tr && x.tr.aggr) || 0) * 0.4 ? 'rough' : 'love') : mood;
      var out = [];
      if (opt.fore !== false) out.push(F(pick(S, D.FORE[mood === 'plain' || rng() < 0.3 ? 'plain' : mood]), m));
      out.push(F(pick(S, pos.t), m));
      if (pos.id === 'kuchi') {
        /* 口での奉仕：喘ぐのは攻め */
        out.push(say(S, x, 'top'));
        if (!opt.short) out.push(say(S, x, 'topc'));
        out.push(F(D.CLIMAX.oral[0], m));
      } else {
        out.push(say(S, y, 'start'));
        if (!opt.short) {
          out.push(F(pick(S, D.MID[mid]), m));
          out.push(say(S, x, 'top'));
          out.push(say(S, y, 'mid'));
        }
        out.push(say(S, y, 'climax'));
        if (pos.id !== 'yubi' && rng() < 0.45) out.push(say(S, x, 'topc'));
        out.push(F(pos.id === 'yubi' ? D.CLIMAX.oral[1] : pick(S, D.CLIMAX[mid]), m));
      }
      if (!opt.short && rng() < 0.6) out.push(say(S, rng() < 0.6 ? y : x, 'after'));
      S.r18Last = pos.label;
      return out.join('');
    },
    /* 体位の名前（直前の sex で使ったもの。理由の欄に出す） */
    lastPos: function (S) { return S.r18Last || ''; },
    /* 一人で */
    solo: function (S, p) { return say(S, p, 'start') + say(S, p, 'climax'); },
    /* 乱交：何人かの喘ぎを重ねる */
    group: function (S, ps) {
      var a = ps.slice().sort(function () { return S.rng() - 0.5; }).slice(0, 3);
      return a.map(function (p, i) { return say(S, p, i === a.length - 1 ? 'climax' : i ? 'mid' : 'start'); }).join('');
    },
    /* 無理やりの場面：抵抗の台詞 → 抵抗できなくされる一文 → 耐える声。by: 襲う側（人なら名前、'crowd'=村人たち、'god'=人でないもの）
       気の強い口調・CPの高い人ほど食ってかかって手荒く黙らされ、気の弱い人は懇願して押さえ込まれる */
    isStrong: function (y) { return !!(D.STRONG[toneKey(y)] || ((y.tr && y.tr.cp) || 0) > 0.6); },
    resist: function (S, by, y, opt) {
      opt = opt || {};
      var t = toneKey(y), tr = y.tr || {}, strong = D.STRONG[t] || (tr.cp || 0) > 0.6;
      var kind = by === 'crowd' || by === 'god' ? by : strong ? 'hard' : 'soft';
      var xn = typeof by === 'string' ? '' : by.name;
      var out = y.name + '「' + pick(S, D.RESIST[t] || D.RESIST.gentle) + '」' + F(pick(S, D.SUBDUE[kind]), { x: xn, y: y.name });
      if (opt.endure !== false) out += y.name + '「' + pick(S, D.ENDURE[t] || D.ENDURE.gentle) + '」';
      return out;
    },
    /* 人でないもの・村人・使用人の声 */
    npc: function (S, kind, a) { return F(pick(S, D.NPC[kind]), { a: a ? a.name : '' }); }
  };
})();
