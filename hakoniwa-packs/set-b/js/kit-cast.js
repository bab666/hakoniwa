/* セットB の部屋の共通部品：配役の組み立て（両方のビルド。2026-11-03。新婚部屋の shinkon.js から、看病の部屋でも使う部分を共通のかたまり kit に移した）
   ■ HK.PairCast.install(ID, couple, endKey)：箱庭 ID の HK.simulate を包む（HK.wrap）。couple(C, input) は二人を選ぶ関数（[一人目, 二人目]）、endKey は結果の end に写す記録の名前（ctx.flags[endKey]）
     ・関係の上書き（override）：設定 env.rel が 'keep' でないとき、二人のあいだの関係を外す（家族などで恋愛が「なし」の関係は残す）。入力はそのまま、写しで動かす。足す関係は箱庭の extraTies
     ・登場しない住人（outsideOf・withOutside）：設定 env.outsideNames が 'no' でなければ、名簿（HK.UI.state()）から、二人のどちらかと関係（家族・擬似親子・友人・同僚・先輩後輩・同級生・元恋人・知人。
       恋人・敵対などの関係が一つでもある人は外す）がある住人を三人まで、名簿の設定のまま「他の住人」（立場 guest・印 outside）として配役の後ろに足す。結果は入力の outsideG に写す
     ・結果から訪れた住人を外す（strip）：関係図・二人ずつ・住人ごと・区切りごとの記録・出来事の顔ぶれ。名前は地の文にだけ残る
     ・出来事の顔ぶれを本文に合わせる（trim）：日常の記録で、本文に名前の出ていない人を actors から外す（経過の「人で絞る」が効くように）
     返り値は { override, outsideOf, withOutside, strip, trim }（点検用） */
(function () {
  'use strict';
  var HK = window.HK;
  if (!HK) return;
  var PC = HK.PairCast = {};
  PC.install = function (ID, couple, endKey) {
    /* なれそめを選んだとき（上書き）：二人のあいだの関係を外す（家族などで恋愛が「なし」の関係は残す）。入力はそのまま、写しで動かす */
    function override(input) {
      var env = input && input.env, ts = input && input.ties;
      if (!env || !env.rel || env.rel === 'keep' || !Array.isArray(ts) || !ts.length || !Array.isArray(input.chars)) return input;
      var C = input.chars.map(function (c, i) { return { i: i }; }), cp = couple(C, input), a = cp[0] && cp[0].i, b = cp[1] && cp[1].i;
      if (a == null || b == null) return input;
      var mine = ts.filter(function (t) { return (t.a === a && t.b === b) || (t.a === b && t.b === a); });
      if (!mine.length) return input;
      if (mine.some(function (t) { return t.love === 'no'; }) || (HK.tiesLove && !HK.tiesLove(mine))) return input;
      var cp2 = {}; Object.keys(input).forEach(function (k) { cp2[k] = input[k]; });
      cp2.ties = ts.filter(function (t) { return mine.indexOf(t) < 0; });
      return cp2;
    }
    /* ---------- 登場しない住人（名簿の住人）を出す（2026-11-03 利用者の指示）----------
       出られない部屋の「登場しない住人の名前を出す」（room-end.js の outsideOf：名簿 HK.UI.state() から、参加していない住人と参加者の関係を読む）と同じ読み方で、
       新婚の二人のどちらかと関係（家族・擬似親子・友人・同僚・先輩後輩・同級生・元恋人・知人。恋人・敵対などの関係が一つでもある人は外す）がある住人を三人まで選び、
       名簿の設定（性格・口調・呼び方・関係）のまま「他の住人」（立場 guest・印 outside）として配役に足す。足し方は画面の入力の組み立て（HK.UI.buildInput）を
       その人たちを加えた参加者で呼び直すだけ（番号で持つ欄も一緒に組み直される）。入力が画面から来たものでない（点検の道具など）ときは何もしない。
       結果は入力の outsideG に写す（記録の入力に残るので、同じ入力で回し直しても同じ。入力の参加者 chars は書き換えない） */
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
      full.perChar.forEach(function (p, k) { var c = full.chars[k]; if (c && add.indexOf(c.id) >= 0) { p.pick = p.pick || {}; p.pick.part = 'guest'; p.pick.outside = 1; } });
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
        var inp = mine ? override(withOutside(input)) : input;
        var r = sim0.apply(this, mine ? [inp].concat([].slice.call(arguments, 1)) : arguments), C0 = HK._curCtx;
        if (r && r.end && mine && C0 && C0.scen && C0.scen.id === ID && C0.flags) r.end[endKey] = C0.flags[endKey] || null;
        if (r && mine && inp && inp._outN) strip(r, inp._outN);
        if (r && mine) trim(r);
        return r;
      };
    });
    return { override: override, outsideOf: outsideOf, withOutside: withOutside, strip: strip, trim: trim };
  };
})();
