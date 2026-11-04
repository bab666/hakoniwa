/* 箱庭シミュレーター（R18版のみ）: 合意のない展開の二回目・三回目（HK.ForceRep）。2026-11-04
   利用者の報告（2026-11-04）：「無理やりの展開のとき、受け側の反応が二回目も同じ。2、3 回目には対応しておこう。
     無理やりのときに毎回同じ台詞にならないよう工夫がほしい。攻めも受けも」
   ■ 回数を数える場所
     ・同じ二人（攻め＝HK.Pos.order の先・受け＝後。向きは数えない）の合意のない場面の回数を、その回の ctx（物語型は S）の _frN に持つ。
       合意のない場面＝出来事の印 force（記録の o.force か、いま起きている出来事 ctx._ev.force）があり、記録が性的な場面（HK.EroScene.hit）のもの。
       理由の印〔合意のない展開〕（HK.Pos.FORCE_MARK）だけの記録は数えない（モブ・略奪者に襲われる場面、割って入った人が並ぶ場面があるため）。内容のスイッチ「合意のない展開」が切なら数えない（FR.on）。
       一つの区切り（ctx.stepIndex／物語型は S.label）の同じ二人には一度だけ数える。記録が言われてから数えるので、場面を組み立てている間の FR.n は「今度が何回目か」。
     ・四回目以降は三回目の表（n3）から選ぶ。
   ■ していること（二回目から。一回目は今までどおり）
     ・きっかけの段：受けの「拒みきれなかった理由」を回数で（LEAD：二回目＝前のときを知っている／三回目以降＝慣れ・諦め（give）か、心が折れない人は変わらず抗う（hold））。
       二回目は心の強さ（HK.Attr.willK の weak／avg／strong）の一文（LEADW）も。攻めの一言（SAY.push）。
       出られない部屋は HK.SexLead の段に入れる（sex-lead-r18.js が FR.lead を呼ぶ）。前振りの無い箱庭は、場面の直前にきっかけの段を足す。
     ・場面の頭：受けの最初の抵抗（RESIST）と攻めの構え（TOP：二回目＝前回を引き合いに出す・余裕・手慣れる／三回目以降＝日課のように）、三回目以降は攻めが受けの変化に気づく（NOTICE）。
       場面の側が回数の台詞（FR.pool）を使っていなければ、攻めと受けの台詞を一つずつ。
     ・最中：受けの崩れ方（MID：回数 × 心の強さ × 性別の組 mf／ff／fm）を、山場の手前に。ほのめかす描写・性器なしの人がいる組・短い場面には足さない。
     ・事後：受けの事後（AFTER＋台詞 SAY.after）を場面の終わり（部屋の数え上げの一文の前）に。場面の側が回数の事後（FR.pool の after）を使っていれば足さない。
   ■ 台詞の繰り返しを避ける：FR.pool(Z, 役, 話し手, 相手, 元の表) が、元の表に回数の表を足す（一回目は元の表＋SAY.<役>.n1、二回目からは回数の表だけ）。
     選ぶのは各場面の HK.Ero.fresh（一回の遊びの中で同じ文を出し尽くすまで繰り返さない）。役：push（攻めが迫る）・last（攻めの終わりの一言）・protest（受けの拒む言葉）・after（受けの事後）。
     使う場面：出られない部屋の前振り（Q.push）・敵対の強引なエッチ（HK.HateSex.scene と最後まで拒む回）・恐れ・無関心の相手に力ずくで（cold-fear-r18.js）・主従の命令でねじ伏せる（tie-order-r18.js）
   ■ 書式：{a}＝攻め {b}＝受け。地の文は 1 分岐 3 文以上、性別の語・体の位置（上・下・跨る）・脱がせる・手を繋ぐ／抱きしめる／口づけは書かない（MID だけ体の語の印で、性別の組ごと）。
     台詞は 3 本「くだけた常体｜硬い常体｜敬語」（一人称「私」・二人称「あなた」）。全年齢版にはこのファイルは無い。登場人物はすべて成人として扱う。
   ■ 点検：FR.log に一場面ずつ { n, key, parts } を残す（docs/reports/2026-11-04/force-repeat.md の計測）。受け攻めは入れ替えない（向きは HK.Pos.order のまま） */
/* @event-ok 合意のない展開の二回目・三回目の反応（既にある場面に回数の段を足すだけ。新しい出来事ではない） */
(function () {
  'use strict';
  var HK = window.HK;
  if (!HK || HK.ForceRep) return;
  var FR = HK.ForceRep = { log: null, X: {} };
  var PS = ['proud', 'stern', 'tsun', 'gentle', 'devoted', 'cool', 'free', 'shy', 'polite'];
  function ps(c) { var p = c && (HK.personaOf ? HK.personaOf(c) : c.persona); return PS.indexOf(p) >= 0 ? p : 'gentle'; }
  /* 心の強さ（attr.js の will）：weak／avg／strong（未設定は avg） */
  function will(c) { var w = c && c.will; return w === 'weak' || w === 'strong' ? w : 'avg'; }
  FR.will = will;
  /* 三回目以降：心が折れない人（心の強さ「強い」、ふつうでも強気・厳格）は変わらず抗う（hold）、それ以外は慣れ・諦め（give） */
  function holds(c) { var w = will(c); return w === 'strong' || (w === 'avg' && /^(proud|stern)$/.test(ps(c))); }
  FR.holds = holds;
  function lv(n) { return n >= 3 ? 3 : n >= 2 ? 2 : 1; }
  function ord(a, b) { return HK.Pos && HK.Pos.order ? HK.Pos.order(a, b, [a, b]) : [a, b]; }
  function keyOf(a, b) { var x = a.i != null ? a.i : a.name, y = b.i != null ? b.i : b.name; return x < y ? x + '-' + y : y + '-' + x; }
  function cnt(Z) { return Z._frN || (Z._frN = {}); }
  /* 今度が何回目か（数え終えた回数＋1） */
  /* 内容のスイッチ「合意のない展開」が切なら数えない（出られない部屋の条件の場面のように、スイッチに関わらず起きる場面も今までどおり。HK.Pos.forceOn） */
  FR.on = function (Z) { return !!(Z && !HK.SAFE_ON && HK.Pos && HK.Pos.forceOn && HK.Pos.forceOn(Z)); };
  FR.n = function (Z, a, b) { if (!Z || !a || !b || !FR.on(Z)) return 1; return (cnt(Z)[keyOf(a, b)] || 0) + 1; };
  function stepOf(Z) { return Z.stepIndex != null ? Z.stepIndex : String(Z.label || ''); }
  FR.dk = function (Z, a, b) { return stepOf(Z) + ':' + keyOf(a, b); };
  /* 選び方：一回の遊びの中で繰り返さない（HK.Ero.fresh） */
  function rngOf(Z) { return Z && Z.rng; }
  function pick(Z, arr) {
    if (!arr || !arr.length) return '';
    var r = rngOf(Z), base = function (l) { return l[Math.floor((typeof r === 'function' ? r() : Math.random()) * l.length) % l.length]; };
    return HK.Ero && HK.Ero.fresh ? HK.Ero.fresh(Z, arr, base) : base(arr);
  }
  /* その回で、この台詞（中身）を含む文を一度でも出したか（HK.Ero.fresh の覚え。呼ぶ側の「」・話し手の印の付け方によらない） */
  function usedAny(Z, l) {
    var own = Z && (Z.rng || Z), m = own && own._fresh && own._fresh.m;
    if (!m) return false;
    if (m[l] != null) return true;
    for (var k in m) if (k.length > l.length && k.indexOf(l) >= 0) return true;
    return false;
  }
  function fill(s, T, U) { return String(s || '').replace(/\{a\}/g, T.name).replace(/\{b\}/g, U.name); }
  /* 表の鍵：二回目＝n2、三回目以降＝n3（受けの表は n3g／n3h） */
  function tab(o, n, U, recv) {
    if (!o) return null;
    if (n <= 1) return o.n1 || null;
    if (n === 2) return o.n2 || null;
    return recv ? (holds(U) ? o.n3h : o.n3g) || o.n3 || null : o.n3 || null;
  }
  var RECV = { protest: 1, after: 1 };
  /* 回数の台詞の表を足す。who＝話し手、other＝相手（向きは中で決める）。arr＝元の表（その話し手の態度の行）。fmt があれば回数の台詞をその形に（'{b}「…」' など） */
  FR.pool = function (Z, role, who, other, arr, fmt) {
    arr = arr || [];
    if (HK.SAFE_ON || !Z || !who || !other || !FR.X.SAY || !FR.X.SAY[role]) return arr;
    var o = ord(who, other), T = o[0], U = o[1], n = FR.n(Z, T, U), t = tab(FR.X.SAY[role], n, U, !!RECV[role]);
    var add = t ? (t[ps(who)] || t.gentle || []) : [];
    /* 同じ遊びの中で一度出した回数の台詞は外す（呼ぶ側ごとに「」の付け方が違うので、中身で見る） */
    var rest = add.filter(function (l) { return !usedAny(Z, l); });
    var fm = function (l) { return fmt ? fmt.replace('…', l) : l; };
    if (n >= 2 && add.length) {
      var u = Z._frUsed || (Z._frUsed = {}), k = FR.dk(Z, T, U);
      (u[k] = u[k] || {})[role] = 1;
      /* 回数の台詞を出し尽くしたら、元の表も混ぜる */
      return rest.length ? rest.map(fm) : add.map(fm).concat(arr);
    }
    return arr.concat(rest.map(fm));
  };
  function say(Z, role, who, T, U, n) {
    var t = tab(FR.X.SAY[role], n, U, !!RECV[role]), row = t ? t[ps(who)] || t.gentle : null;
    var rest = row ? row.filter(function (l) { return !usedAny(Z, l); }) : null;
    var l = row ? pick(Z, rest && rest.length ? rest : row) : '';
    return l ? who.name + '「' + l + '」' : '';
  }
  /* きっかけの段（受けの拒みきれなかった理由＋二回目は心の強さの一文＋攻めの一言）。二回目からだけ。a・b はどちらが先でもよい */
  FR.lead = function (Z, a, b, o) {
    if (HK.SAFE_ON || !Z || !a || !b || !FR.X.LEAD) return null;
    var od = ord(a, b), T = od[0], U = od[1], n = FR.n(Z, T, U);
    if (n < 2) return null;
    var X = FR.X, k = n === 2 ? 'n2' : holds(U) ? 'n3h' : 'n3g', parts = [];
    parts.push(fill(pick(Z, X.LEAD[k][ps(U)]), T, U));
    if (n === 2) parts.push(fill(pick(Z, X.LEADW[will(U)]), T, U));
    /* 攻めの一言は場面の側で一度だけ（場面の頭か、場面の表の FR.pool）。前振りには入れない（同じ表を一つの場面で二度引かない） */
    var q = '';
    Z._frLead = FR.dk(Z, T, U);
    var wj = { weak: '弱い', avg: 'ふつう', strong: '強い' }[will(U)];
    return {
      text: parts.join(''), say: q, n: n,
      why: '拒みきれなかった理由：' + U.name + 'にとって' + T.name + 'との合意のない場面は' + (n === 2 ? '二回目（前のときを覚えている' : n + '回目（' + (holds(U) ? '心は折れず、変わらず抗う' : '慣れと諦め')) + '・心の強さ ' + wj + '）'
    };
  };

  /* ---------- 場面の文に差す ---------- */
  var CLIMAX = /果て|達し|絶頂|イっ|イッ|イく|イク|白く(弾|染|は)|弾けた|呻いて止ま|昇りつめ|上り詰め|吐き出|注ぎ込/;
  function modeOf(T, U) { var f = HK.Pos && HK.Pos.isF; return f && f(T) ? (f(U) ? 'ff' : 'fm') : 'mf'; }
  /* 「」の外の句点の位置（insert の候補） */
  function stops(t) { var r = [], d = 0; for (var i = 0; i < t.length; i++) { var c = t[i]; if (c === '「') d++; else if (c === '」') { d = Math.max(0, d - 1); if (!d) r.push(i + 1); } else if (c === '。' && !d) r.push(i + 1); } return r; }
  var TAIL = /（エッチ \d+\/\d+）|扉はまだ開かない|扉が[^。]{0,12}開|ロックが外れ|カチリと/;
  function decorate(Z, T, U, text, env) {
    var X = FR.X, n = FR.n(Z, T, U), p = ps(U), tp = ps(T), w = will(U), h = holds(U), k = n === 2 ? 'n2' : h ? 'n3h' : 'n3g', used = (Z._frUsed || {})[FR.dk(Z, T, U)] || {};
    var head = [fill(pick(Z, X.RESIST[k][p]), T, U), fill(pick(Z, X.TOP[n === 2 ? 'n2' : 'n3'][tp]), T, U)];
    if (n >= 3) head.push(fill(pick(Z, X.NOTICE[h ? 'h' : 'g']), T, U));
    if (!used.push) { var q1 = say(Z, 'push', T, T, U, n); if (q1) head.push(q1); }
    if (!used.protest) { var q2 = say(Z, 'protest', U, T, U, n); if (q2) head.push(q2); }
    var parts = { resist: 1, top: 1, notice: n >= 3 ? 1 : 0, mid: 0, after: 0 };
    var body = String(text);
    /* 最中：山場の手前の句点に（ほのめかす描写・性器なしの組・短い場面は足さない） */
    var low = HK.Lewd && HK.Lewd.lv && HK.Lewd.lv(env || Z.env || {}) === 'low', ng = HK.NoGen && HK.NoGen.on && HK.NoGen.on(T, U);
    if (!low && !ng && body.length >= 360) {
      /* 差す所：受けの最初の喘ぎ（「⁠…」。HK.Moan の印 U+2060）の直後。喘ぎが無ければ、山場の言い回しより前の句点 */
      var at = -1, mo = body.indexOf('「\u2060');
      if (mo >= 0) { var mc = body.indexOf('」', mo); if (mc > 0 && body.slice(0, mc).search(CLIMAX) < 0) at = mc + 1; }
      var ci = body.search(CLIMAX), st = stops(body);
      for (var i = st.length - 1; at < 0 && i >= 0; i--) { if ((ci < 0 || st[i] <= ci) && st[i] >= body.length * 0.3 && st[i] <= body.length * 0.75) { at = st[i]; break; } }
      if (at > 0) {
        var mt = X.MID[n === 2 ? 'n2' : 'n3'][n >= 3 && h ? 'strong' : n >= 3 && w === 'strong' ? 'avg' : w][modeOf(T, U)];
        body = body.slice(0, at) + fill(pick(Z, mt), T, U) + body.slice(at);
        parts.mid = 1;
      }
    }
    /* 事後：部屋の数え上げの一文の前に */
    if (!used.after) {
      var af = fill(pick(Z, X.AFTER[k][p]), T, U) + say(Z, 'after', U, T, U, n), tm = body.slice(Math.floor(body.length * 0.6)).search(TAIL);
      if (tm >= 0) { var cut = Math.floor(body.length * 0.6) + tm; body = body.slice(0, cut) + af + body.slice(cut); }
      else body += af;
      parts.after = 1;
    }
    return { text: head.join('') + body, n: n, parts: parts };
  }
  FR.decorate = decorate;
  /* 住人どうしの合意のない場面：出来事の印 force だけを見る（理由の印〔合意のない展開〕だけの記録は、モブ・略奪者に襲われる場面や、割って入った人が並ぶ場面を含むので数えない） */
  function forced(Z, o) {
    if (o.force != null) return !!o.force;
    return !!(Z._ev && Z._ev.force);
  }
  function pairOf(P, acts) {
    var L0 = (acts || []).map(function (c) { return typeof c === 'number' ? P && P[c] : c; }).filter(Boolean);
    return L0.length >= 2 && L0[0] !== L0[1] ? ord(L0[0], L0[1]) : null;
  }
  function lewdOf(Z, o) { return !!(HK.EroScene && HK.EroScene.hit(Z, o)); }
  function fits(Z, o) { return !HK.SAFE_ON && o && o.kind !== 'step' && o.kind !== 'phase' && o.kind !== 'death' && typeof o.text === 'string' && o.text.length >= 120 && o.actors && o.actors.length >= 2 && !/^きっかけ：/.test(String(o.why || '')) && !Z._frBusy; }
  function bump(Z, T, U, D0, dk) { var m = cnt(Z), k = keyOf(T, U); m[k] = (m[k] || 0) + 1; D0[dk] = 1; }
  function why0(n, U, T) { return '／合意のない場面の' + n + '回目（' + U.name + 'は' + T.name + 'との' + (n === 2 ? '前のときを覚えていた' : holds(U) ? '何度目でも心は折れていない' : '繰り返しに慣れ、諦めかけていた') + '）'; }

  /* ---------- エンジン型（Ctx.say） ---------- */
  if (HK.Ctx && HK.Ctx.prototype.say) HK.wrap(HK.Ctx.prototype, 'say', function (prev) {
    return function (o) {
      if (!fits(this, o) || !FR.on(this) || !forced(this, o) || !lewdOf(this, o)) return prev.apply(this, arguments);
      var pr = pairOf(this.chars, o.actors);
      if (!pr) return prev.apply(this, arguments);
      var T = pr[0], U = pr[1], dk = FR.dk(this, T, U), D0 = this._frDone = this._frDone || {};
      if (D0[dk]) return prev.apply(this, arguments);
      var n = FR.n(this, T, U);
      if (n < 2) { var e1 = prev.apply(this, arguments); if (e1 && !e1.skipped) { bump(this, T, U, D0, dk); if (FR.log) FR.log.push({ n: 1, key: keyOf(T, U), e: e1.n }); } return e1; }
      var log = this.log, at = log.length, last = log[at - 1], e0 = null, L0 = null, t0 = o.text, w0 = o.why;
      /* きっかけの段：前振り（HK.SexLead）が回数の理由を入れていればそのまま。前振りがあれば足し、無ければ段を足す */
      if (this._frLead !== dk) {
        L0 = FR.lead(this, T, U);
        if (L0) {
          if (last && last.tag === 'きっかけ' && last.step === this.stepIndex && last.actors && last.actors.indexOf(T.i) >= 0 && last.actors.indexOf(U.i) >= 0) { last.text += L0.text; last.why = String(last.why || '') + '／' + L0.why; }
          else {
            e0 = { n: at, step: this.stepIndex, label: this.label, cat: o.cat || 'romance', actors: [T.i, U.i], text: L0.text, why: 'きっかけ：' + L0.why, odd: false, mag: 3, kind: 'event', tag: 'きっかけ', lewd: false };
            log.push(e0);
            if (this._eroN === at) this._eroN = at + 1;
          }
        }
      }
      var d = decorate(this, T, U, t0, this.env);
      o.text = d.text; o.why = (w0 || '') + why0(n, U, T);
      var e = prev.apply(this, arguments);
      if (!e || e.skipped) {
        o.text = t0; o.why = w0;
        if (e0) { var kk = log.indexOf(e0); if (kk >= 0) { log.splice(kk, 1); for (var j = kk; j < log.length; j++) if (log[j]) log[j].n = j; } if (this._eroN === at + 1) this._eroN = at; }
        return e;
      }
      bump(this, T, U, D0, dk);
      if (FR.log) FR.log.push({ n: n, key: keyOf(T, U), e: e.n, lead: !!(L0 || this._frLead === dk), parts: d.parts, ev: this._ev && this._ev.id || '' });
      if (HK.SexLead && HK.SexLead.log && e0) HK.SexLead.log.push({ kind: 'forceRep', ev: this._ev && this._ev.id || '', n: e0.n, scene: e.n, gens: ['forceRep'] });
      return e;
    };
  });

  /* ---------- 物語型（HK.Story.say）：合意のない展開の印（force・理由の印）のある記録だけ ---------- */
  var ST = HK.Story;
  if (ST && ST.say) HK.wrap(ST, 'say', function (prev) {
    return function (S, o) {
      if (!S || !S.P || !fits(S, o) || !FR.on(S) || !o.force || !lewdOf(S, o)) return prev.apply(this, arguments);
      var pr = pairOf(S.P, o.actors);
      if (!pr) return prev.apply(this, arguments);
      var T = pr[0], U = pr[1], dk = FR.dk(S, T, U), D0 = S._frDone = S._frDone || {};
      if (D0[dk]) return prev.apply(this, arguments);
      var n = FR.n(S, T, U);
      if (n >= 2) {
        var L0 = S._frLead !== dk ? FR.lead(S, T, U) : null, last = S.log[S.log.length - 1];
        if (L0) {
          S._frBusy = true;
          try {
            if (last && last.tag === 'きっかけ' && last.actors && last.actors.indexOf(T.i) >= 0 && last.actors.indexOf(U.i) >= 0) { last.text += L0.text; last.why = String(last.why || '') + '／' + L0.why; }
            else { var tch = S._eroN === S.log.length; prev.call(this, S, { actors: [T, U], tag: 'きっかけ', text: L0.text, why: 'きっかけ：' + L0.why, mag: 3, lewd: false }); if (tch) S._eroN = S.log.length; }
          } finally { S._frBusy = false; }
        }
        var d = decorate(S, T, U, o.text, S.env);
        o.text = d.text; o.why = (o.why || '') + why0(n, U, T);
        if (FR.log) FR.log.push({ n: n, key: keyOf(T, U), lead: !!L0, parts: d.parts, story: true });
      } else if (FR.log) FR.log.push({ n: 1, key: keyOf(T, U), story: true });
      bump(S, T, U, D0, dk);
      return prev.apply(this, arguments);
    };
  });
})();
