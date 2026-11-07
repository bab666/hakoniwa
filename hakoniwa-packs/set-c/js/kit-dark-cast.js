/* Cセット（闇の過激セット）の共通部品：役・可否・周りの人・展開の重さ・内容のスイッチ・運命の揺らぎ・態度 9 種（R18版だけ。2026-11-07）
   ■ HK.DarkKit（DK。kit-dark.js と同じ入れ物）
     ・DK.per(c)：態度 9 種（proud・stern・tsun・gentle・devoted・cool・free・shy・polite。HK.Emo.att か HK.personaOf。無ければ gentle）
     ・DK.pOdd(ctx)：らしくない分岐の確率（運命の揺らぎ ctx.chaos に比例。0〜0.45。セット B の HK.PairReact.pOdd と同じ考え方）
     ・DK.branch(ctx, c, table, keys)：態度 9 種 → 既定の分岐の表（{ proud: 'k1', …, _: 既定 }）から c の分岐を決める。運命の揺らぎで keys のうち既定でないものに。
       返り値 { k, odd, per }
     ・DK.part(ctx, c, field)：住人ごとの欄（input.perChar[c.i].pick[field]）。'auto' や空は null
     ・DK.cast(ctx, { field: 'part', top: '攻め側の値', bottom: '受け側の値', others: ['周りの値'…], auto(ctx, X, Y) → [A, B] })：
       参加者の上の二人から攻め側 A・受け側 B を決める（立場で選んだ人を先に。片方だけ決まっていれば相手を埋め、両方おまかせなら auto（無ければ上の人が A））。
       返り値 { A, B, G（ほかの参加者）, noBody, why }。noBody：体の場面を出さない印（A が自分で受けを選んだ・B が自分で攻めを選んだ（HK.Pos.hardTop）・
       恋愛対象や性行為の相手の固定が合わない（HK.bodyOK が偽））。why は理由の鍵（'topIsBottom'・'bottomIsTop'・'body'）
     ・DK.couple(field, top, bottom, others)：DK.install に渡す、二人を選ぶ関数 couple(C, input)（立場で選んだ人を先に。周りの値の人は後ろ）
     ・DK.install(ID, couple, endKey, o)：箱庭 ID の HK.simulate を包む（HK.wrap）。o.outside が偽でなければ、名簿から二人のどちらかと関係のある住人を三人まで
       「周りの人」（欄 o.field（既定 'part'）の値 o.guest（既定 'guest'）・印 outside）として配役の後ろに足し、結果から外す（セット B の HK.PairCast の outsideOf・withOutside・strip・trim の写し。
       設定 env.outsideNames が 'no' なら足さない）。結果の end[endKey] に ctx.flags[endKey] を写す。返り値 { outsideOf, withOutside, strip, trim }
     ・DK.heavy(ctx)：展開の重さ（mild／normal／dark）。設定が空なら 'dark'。DK.heavyDefault(ctx)：部屋の setup で呼ぶと、env.heavy が空のとき 'dark' にする
     ・DK.content(ctx, key)：内容のスイッチ（HK.Content.ok の包み。利用者のスイッチどおり。kit は上書きしない）
   文は持たない。 */
(function () {
  'use strict';
  var HK = window.HK;
  if (!HK) return;
  var DK = HK.DarkKit = HK.DarkKit || {};
  var PK = DK.PER = ['proud', 'stern', 'tsun', 'gentle', 'devoted', 'cool', 'free', 'shy', 'polite'];
  DK.per = function (c) {
    var k = HK.Emo && HK.Emo.att ? HK.Emo.att(c) : null;
    if (PK.indexOf(k) < 0) k = HK.personaOf ? HK.personaOf(c) : c && c.persona;
    return PK.indexOf(k) >= 0 ? k : 'gentle';
  };
  DK.pOdd = function (ctx) { var ch = ctx && ctx.chaos != null ? ctx.chaos : 0.4; return Math.max(0, Math.min(0.45, ch * 0.32)); };
  DK.branch = function (ctx, c, table, keys) {
    var p = DK.per(c), k = table[p] || table._ || (keys && keys[0]), odd = false;
    var alt = (keys || []).filter(function (x) { return x !== k; });
    if (alt.length && ctx.rng() < DK.pOdd(ctx)) { k = alt[Math.floor(ctx.rng() * alt.length)]; odd = true; }
    return { k: k, odd: odd, per: p };
  };
  function pickOf(input, i, field) { var p = input && input.perChar && input.perChar[i], v = p && p.pick ? p.pick[field] : null; return v && v !== 'auto' ? v : null; }
  DK.part = function (ctx, c, field) { return c ? pickOf(ctx.input, c.i, field || 'part') : null; };
  DK.couple = function (field, top, bottom, others) {
    others = others || [];
    return function (C, input) {
      var two = function (c) { var v = pickOf(input, c.i, field); return v === top || v === bottom; }, side = function (c) { return others.indexOf(pickOf(input, c.i, field)) >= 0; };
      var ok = C.filter(two).slice(0, 2);
      C.forEach(function (c) { if (ok.length < 2 && ok.indexOf(c) < 0 && !side(c)) ok.push(c); });
      C.forEach(function (c) { if (ok.length < 2 && ok.indexOf(c) < 0) ok.push(c); });
      return ok.slice(0, 2);
    };
  };
  DK.noBody = function (A, B) {
    var P = HK.Pos;
    if (P && P.canTop && !P.canTop(A, B)) return 'topIsBottom';
    if (P && P.hardTop && P.hardTop(B, A)) return 'bottomIsTop';
    if (HK.bodyOK && !HK.bodyOK(A, B)) return 'body';
    return '';
  };
  DK.cast = function (ctx, o) {
    o = o || {};
    var f = o.field || 'part', C = (ctx.chars || []).slice(), cp = DK.couple(f, o.top, o.bottom, o.others)(C, ctx.input), X = cp[0], Y = cp[1], A, B;
    if (!X || !Y) return null;
    var px = pickOf(ctx.input, X.i, f), py = pickOf(ctx.input, Y.i, f);
    if (px === o.bottom || py === o.top) { A = Y; B = X; }
    else if (px === o.top || py === o.bottom) { A = X; B = Y; }
    else { var r = typeof o.auto === 'function' ? o.auto(ctx, X, Y) : null; A = r && r[0] || X; B = r && r[1] || (A === X ? Y : X); }
    var why = DK.noBody(A, B);
    return { A: A, B: B, G: C.filter(function (c) { return c !== A && c !== B; }), noBody: !!why, why: why };
  };
  DK.heavy = function (ctx) { var e = ctx && ctx.env; var v = e && e.heavy; return v === 'mild' || v === 'normal' || v === 'dark' ? v : 'dark'; };
  DK.heavyDefault = function (ctx) { if (ctx && ctx.env && (ctx.env.heavy == null || ctx.env.heavy === '')) ctx.env.heavy = 'dark'; return DK.heavy(ctx); };
  DK.content = function (ctx, key) { return !!(HK.Content && HK.Content.ok && HK.Content.ok(ctx, key)); };

  /* ---------- 周りの人（名簿から）：セット B の HK.PairCast の写し ---------- */
  DK.install = function (ID, couple, endKey, opt) {
    opt = opt || {};
    var GUEST = opt.guest || 'guest', FIELD = opt.field || 'part';
    var OUT_CLS = { parent: 1, sibling: 1, sibprot: 1, sibclose: 1, twin: 1, stepsib: 1, relative: 1, pparent: 1, ex: 0, friend: 2, best: 2, buddy: 2, childhood: 2, benefactor: 2,
      colleague: 3, boss: 3, senpai: 3, classmate: 4, teacher: 4, mentor: 4, acq: 5 };
    var OUT_NG = /^(lover|spouse|mate|fated|fiance|fwb|crush|almost|honmei|yan|enemy|bad|sibbad|rival|abuse|master|worship|apathy|fear|noobs)$/;
    function outsideOf(input) {
      var UI = HK.UI, S = UI && UI.state ? UI.state() : null;
      if (!S || !UI.buildInput || !Array.isArray(S.chars) || !Array.isArray(S.ties) || !Array.isArray(input.chars) || !input.chars.length) return null;
      var byName = {}, dup = {}, mine = [];
      S.chars.forEach(function (c) { if (!c || !c.name) return; if (byName[c.name]) dup[c.name] = 1; byName[c.name] = c; });
      for (var i = 0; i < input.chars.length; i++) { var r = input.chars[i] && byName[input.chars[i].name]; if (!r || dup[r.name]) return null; mine.push(r.id); }
      var cpI = couple(input.chars.map(function (c, k) { return { i: k }; }), input).map(function (c) { return mine[c.i]; });
      var best = {};
      S.ties.forEach(function (t) {
        [[t.a, t.b], [t.b, t.a]].forEach(function (p) {
          if (cpI.indexOf(p[0]) < 0 || mine.indexOf(p[1]) >= 0) return;
          var o = best[p[1]] = best[p[1]] || { id: p[1], pr: 9, ng: false };
          if (OUT_NG.test(t.type) || t.cold === 'fear' || t.cold === 'apathy') o.ng = true;
          else if (OUT_CLS[t.type] != null && (t.type === 'ex' || (t.cold !== 'separated' && t.cold !== 'divorced'))) o.pr = Math.min(o.pr, OUT_CLS[t.type]);
        });
      });
      var ord = {}; S.chars.forEach(function (c, k) { ord[c.id] = k; });
      var add = Object.keys(best).map(function (k) { return best[k]; }).filter(function (o) { var c = S.chars.filter(function (x) { return x.id === o.id; })[0]; return !o.ng && o.pr < 9 && c && c.name && !dup[c.name]; })
        .sort(function (x, y) { return x.pr - y.pr || ord[x.id] - ord[y.id]; }).slice(0, 3).map(function (o) { return o.id; });
      if (!add.length) return [];
      var sid0 = S.scenId, hadJ = !!S.join, j0 = S.join && S.join[ID], ch0 = S.chars, base, full;
      try {
        S.scenId = ID; S.join = S.join || {};
        S.join[ID] = mine.slice(); base = UI.buildInput(input.seed);
        /* 画面の入力と同じ参加者・同じ設定でなければ（点検の道具が名前の同じ住人で回したときなど）足さない */
        if (JSON.stringify(base.chars) !== JSON.stringify(input.chars)) return null;
        /* 名簿の並びを一時的に「参加者 → 訪れる住人 → ほか」にして組み立てる（参加者の番号を変えないため。訪れる住人は後ろにまとまり、結果から外しやすい） */
        var head = ch0.filter(function (c) { return mine.indexOf(c.id) >= 0; }), mid = add.map(function (id) { return ch0.filter(function (c) { return c.id === id; })[0]; });
        S.chars = head.concat(mid, ch0.filter(function (c) { return head.indexOf(c) < 0 && mid.indexOf(c) < 0; }));
        S.join[ID] = mine.concat(add); full = UI.buildInput(input.seed);
      } finally { S.chars = ch0; S.scenId = sid0; if (!hadJ) delete S.join; else if (j0 === undefined) delete S.join[ID]; else S.join[ID] = j0; }
      if (JSON.stringify(full.chars.slice(0, input.chars.length).map(function (c) { return c.name; })) !== JSON.stringify(input.chars.map(function (c) { return c.name; }))) return null;
      full.perChar.forEach(function (p, k) { var c = full.chars[k]; if (c && add.indexOf(c.id) >= 0) { p.pick = p.pick || {}; p.pick[FIELD] = GUEST; p.pick.outside = 1; } });
      return { names: full.chars.filter(function (c) { return add.indexOf(c.id) >= 0; }).map(function (c) { return c.name; }), chars: full.chars, perChar: full.perChar, ties: full.ties, topics: full.topics || [] };
    }
    function withOutside(input) {
      var env = input && input.env;
      if (!env || env.outsideNames === 'no') return input;
      if (input.outsideG === undefined) { try { var o = outsideOf(input); if (o && o.names && o.names.length) input.outsideG = o; } catch (e) { /* 名簿が読めなくても動かす */ } }
      var G = input.outsideG, n = input.chars.length;
      if (!G || !Array.isArray(G.chars) || !Array.isArray(G.perChar) || G.chars.length <= n) return input;
      /* 参加者が先頭に同じ並びで入っているものだけ使う（以前の並び（名簿の順に混ざる）の入力では、訪れる住人を出さない） */
      for (var i = 0; i < n; i++) if (!G.chars[i] || G.chars[i].name !== input.chars[i].name) return input;
      var cp2 = {}; Object.keys(input).forEach(function (k) { cp2[k] = input[k]; });
      cp2._outN = n;
      cp2.chars = G.chars; cp2.perChar = G.perChar; cp2.ties = G.ties || []; cp2.topics = G.topics || [];
      return cp2;
    }
    /* 結果から、名簿から訪れた住人（参加者の後ろ n 番目から）を外す（2026-11-03 利用者の指示「人間関係図に表示するのは実際に選んだ住人だけ」）：
       住人ごとの結果・二人ずつ（pairs）・区切りごとの記録（関係の値・在不在・気分）・出来事の顔ぶれ（actors）。名前は地の文にだけ残る。
       住人ごとの結果の一言（「最も心を寄せた相手は…」）に訪れた住人の名前があれば外す */
    function strip(r, n) {
      if (!r || !Array.isArray(r.chars) || r.chars.length <= n) return;
      var gone = r.chars.slice(n).map(function (c) { return c.name; }).filter(Boolean);
      var hasG = function (t) { return typeof t === 'string' && gone.some(function (nm) { return t.indexOf(nm) >= 0; }); };
      r.chars = r.chars.slice(0, n);
      r.chars.forEach(function (c) {
        if (c.focus != null && c.focus >= n) c.focus = null;
        if (c.killedBy != null && c.killedBy >= n) c.killedBy = null;
        if (Array.isArray(c.notes)) c.notes = c.notes.filter(function (t) { return !hasG(t); });
      });
      if (Array.isArray(r.pairs)) r.pairs = r.pairs.filter(function (p) { return p.a < n && p.b < n; });
      (r.history || []).forEach(function (h) {
        if (h.rel) Object.keys(h.rel).forEach(function (k) { var m = /^(\d+)-(\d+)$/.exec(k); if (m && (+m[1] >= n || +m[2] >= n)) delete h.rel[k]; });
        if (Array.isArray(h.alive)) h.alive = h.alive.slice(0, n);
        if (h.emo) Object.keys(h.emo).forEach(function (k) { if (+k >= n) delete h.emo[k]; });
      });
      (r.log || []).forEach(function (e) { if (Array.isArray(e.actors)) e.actors = e.actors.filter(function (i) { return typeof i !== 'number' || i < n; }); });
    }
    /* 出来事の顔ぶれ（actors）を本文に合わせる（2026-11-07 利用者の報告「人で絞っても記録が減らない」）：二人の部屋は、日常の記録でも二人そろって actors に入っていて、
       経過の「人で絞る」で一人を選んでも記録が減らなかった。本文に名前が一人以上出ている記録は、名前の出ていない人を actors から外す（だれの名前も出ない記録はそのまま）。
       日常の記録（kind が event・cat が romance でない）だけを見る。恋愛・夜・合意のない場面・三人の場面・コメント欄・重要な出来事（mag 20 以上・関係の節目・条件）は組を崩さない */
    function trim(r) {
      if (!r || !Array.isArray(r.chars) || !Array.isArray(r.log)) return;
      var nm = r.chars.map(function (c) { return c && c.name ? String(c.name) : ''; });
      r.log.forEach(function (e) {
        if (!e || e.kind !== 'event' || e.cat === 'romance' || e.ch || e.sex || e.lewd || e.force || e.trioPairs || (e.mag || 0) >= 20 || (e.mark && e.mark.length) || e.goal || e.goalExit) return;
        var a = e.actors, t = e.text;
        if (!Array.isArray(a) || a.length < 2 || typeof t !== 'string') return;
        var keep = a.filter(function (i) { return typeof i !== 'number' || (nm[i] && t.indexOf(nm[i]) >= 0); });
        if (keep.length && keep.length < a.length) e.actors = keep;
      });
    }
    if (HK.wrap && HK.simulate) HK.wrap(HK, 'simulate', function (sim0) {
      return function (input) {
        var mine = input && input.scenId === ID;
        var inp = mine && opt.outside !== false ? withOutside(input) : input;
        var r = sim0.apply(this, mine ? [inp].concat([].slice.call(arguments, 1)) : arguments), C0 = HK._curCtx;
        if (r && r.end && mine && endKey && C0 && C0.scen && C0.scen.id === ID && C0.flags) r.end[endKey] = C0.flags[endKey] || null;
        if (r && mine && inp && inp._outN) strip(r, inp._outN);
        if (r && mine) trim(r);
        return r;
      };
    });
    return { outsideOf: outsideOf, withOutside: withOutside, strip: strip, trim: trim };
  };
})();
