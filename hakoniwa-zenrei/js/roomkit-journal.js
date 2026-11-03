/* 箱庭シミュレーター: 部屋の部品「ジャーナル」（HK.Journal。かたまり pack-roomkit。追加パックの部屋が使う。両方のビルドに同じファイルを置く）
   表を振って一日を組み立て、遊んだあとに「プレイログ」のような記録が残る部屋のための部品（利用者のソロジャーナルの遊び方を写したもの）。
   ・願望pt：HK.Journal.wish(ctx, c, 願望の番号, 初期値)。add(ctx, c, n) は増やして、越えた 10 の倍数の数を返す（願望の行動を起こす回数）
   ・表を引く：pick(ctx, 鍵, 表, 重み?) は一回の遊びの中で同じ行を続けて出さない（使った行は重みを 0.05 に。全部使ったら戻す）
   ・記録：prompt(ctx, 人, 行の並び) は「〇プロンプト：表の名前＞結果／…」の一件（理由の欄は「プレイログ」）。pts(ctx, 人々, 前の値) は「〇願望pt：A 3→13」
   ・日ごとの記録：note(ctx, 日, 鍵, 値) と、結末に出す days(ctx)
   設計：docs/reports/2026-11-03/shinkon-design.md */
(function () {
  'use strict';
  var HK = window.HK;
  if (!HK) return;
  function st(ctx) { return ctx.flags.journal = ctx.flags.journal || { used: {}, wish: {}, days: {}, acts: 0 }; }
  var J = HK.Journal = {
    wish: function (ctx, c, d, init) { var w = st(ctx).wish[c.i] = { d: d, pt: init || 0, acts: [] }; return w; },
    of: function (ctx, c) { return st(ctx).wish[c.i] || null; },
    add: function (ctx, c, n) {
      var w = J.of(ctx, c); if (!w || !n) return 0;
      var before = w.pt; w.pt = Math.max(0, w.pt + n);
      return Math.max(0, Math.floor(w.pt / 10) - Math.floor(before / 10));
    },
    pick: function (ctx, key, list, wfn) {
      if (!list || !list.length) return null;
      var u = st(ctx).used[key] = st(ctx).used[key] || {}, idx = list.map(function (x, i) { return i; });
      if (idx.every(function (i) { return u[i]; })) { st(ctx).used[key] = u = {}; }
      var i = HK.weighted ? HK.weighted(ctx.rng, idx, function (k) { var w = wfn ? wfn(list[k], k) : 1; return (u[k] ? 0.05 : 1) * Math.max(0, w); }) : idx[Math.floor(ctx.rng() * idx.length)];
      if (i == null) return null;
      u[i] = 1;
      return list[i];
    },
    /* 振った表の記録：rows = [[表の名前, 結果], …] */
    prompt: function (ctx, actors, rows, head) {
      rows = (rows || []).filter(function (r) { return r && r[1]; });
      if (!rows.length) return null;
      return ctx.say({ kind: 'event', cat: 'solo', actors: actors || [], text: (head || '〇プロンプト') + '：' + rows.map(function (r) { return r[0] + '＞' + r[1]; }).join('／'), why: 'プレイログ', mag: 0 });
    },
    pts: function (ctx, chars, before) {
      var parts = chars.map(function (c) { var w = J.of(ctx, c); return w ? c.name + ' ' + (before[c.i] != null ? before[c.i] : w.pt) + '→' + w.pt : ''; }).filter(Boolean);
      if (!parts.length) return null;
      return ctx.say({ kind: 'event', cat: 'solo', actors: chars, text: '〇願望pt：' + parts.join('／'), why: 'プレイログ', mag: 0 });
    },
    note: function (ctx, d, k, v) { var D = st(ctx).days[d] = st(ctx).days[d] || {}; D[k] = v; },
    days: function (ctx) { return st(ctx).days; },
    count: function (ctx, k) { var s = st(ctx); s[k] = (s[k] || 0) + 1; return s[k]; },
    num: function (ctx, k) { return st(ctx)[k] || 0; }
  };
})();
