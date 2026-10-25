/* 箱庭シミュレーター: 展開の重さ（全箱庭で共通の設定。両ビルド共通）
   死・心中・監禁・危害・破局・浮気・失恋・発狂・堕ち・全滅・襲撃・恨みの殺しといった「重い展開」の起こりやすさを、一つの設定でまとめて上げ下げする。
   ・設定は全体の環境値 heavy（mild 穏やか／normal ふつう／dark 重い）。箱庭の ctx.env・物語型の S.env に入る
     （島の「飢えの果て」が env.dark を使っているので、id は heavy にしている）
   ・出来事の側は、確率や重みに HK.Dark.f(ctx, 'kill') を掛けるだけ（ふつうのときは 1 で、乱数も引かない。結果は前と同じ）
       f：悪いことが起きる確率・重みに掛ける倍率　live：生き延びる確率 p を「失敗する側 ×f」に直す　pace：執着などが積もる速さ
       skip：穏やかのとき、まれに重い展開を見送る（ふつう・重いでは乱数を引かずに false）　endings：結末を選ぶとき、悪い結末の重みに掛ける倍率
   ・穏やかでは、内容のスイッチの「合意のない展開」「暴力をともなう性描写」「DVなど歪んだ関係」も切として扱う
     （R18が中心の箱庭 HK.Content.CORE は題材そのものなので効かせない。そこでは堕ちが遅くなるだけ）
   ・穏やかでも「起きないわけではない」：倍率を下げるだけで、死や別れは残る */
(function () {
  'use strict';
  var HK = window.HK;
  if (!HK) return;
  var MUL = {
    mild: { kill: 0.35, shinju: 0.35, cage: 0.35, harm: 0.35, breakup: 0.35, cheat: 0.35, heartbreak: 0.35, madness: 0.35, fall: 0.5, raid: 0.35, wipe: 0.5, grudge: 0.35, night: 0.7 },
    dark: { kill: 1.8, shinju: 1.8, cage: 1.8, harm: 1.8, breakup: 1.8, cheat: 1.8, heartbreak: 1.8, madness: 1.8, fall: 1.8, raid: 1.8, wipe: 1.8, grudge: 1.8 }
  };
  var PACE = { mild: 0.6, dark: 1.4 }, END = { mild: 0.4, dark: 1.6 }, NOTE = { mild: '展開：穏やか', dark: '展開：重い' };
  function envOf(x) { return x && x.env && typeof x.env === 'object' ? x.env : x; }
  var D = HK.Dark = {
    MUL: MUL,
    /* いまの重さ（mild／normal／dark） */
    on: function (x) { var e = envOf(x), v = e && e.heavy; return v === 'mild' || v === 'dark' ? v : 'normal'; },
    f: function (x, kind) { var m = MUL[D.on(x)]; return m ? (m[kind] != null ? m[kind] : 1) : 1; },
    /* 生き延びる・助かる確率 p を、重さに合わせて直す（失敗する側に f を掛ける） */
    live: function (x, p, kind) { var k = D.f(x, kind || 'kill'); return k === 1 ? p : 1 - (1 - p) * k; },
    pace: function (x) { return PACE[D.on(x)] || 1; },
    skip: function (x, kind) { var k = D.f(x, kind); if (!(k < 1)) return false; var r = x && x.rng; return typeof r === 'function' ? r() > k : false; },
    endings: function (x) { return END[D.on(x)] || 1; },
    note: function (x) { return NOTE[D.on(x)] || ''; },
    /* 段階ごとの値（しきい値など）：穏やか・ふつう・重い */
    pick: function (x, mild, normal, dark) { var l = D.on(x); return l === 'mild' ? mild : l === 'dark' ? dark : normal; },
    /* a と b の恋愛・夜が浮気になるか（どちらかに、相手以外の恋人がいる。エンジン型の ctx） */
    cheat: function (ctx, a, b) {
      if (!ctx || !ctx.chars || !ctx.pair || !a || !b || ctx.pair(a, b).couple) return false;
      return ctx.chars.some(function (c) { return c !== a && c !== b && c.alive !== false && (ctx.pair(a, c).couple || ctx.pair(b, c).couple); });
    },
    OFF_MILD: { force: 1, violence: 1, abuse: 1 }
  };
  /* 全体の環境値（events-common.js の HK.GLOBAL_ENV）に足す。all：物語型の箱庭にも出す */
  if (HK.GLOBAL_ENV && !HK.GLOBAL_ENV.some(function (e) { return e.id === 'heavy'; })) {
    var item = {
      id: 'heavy', label: '展開の重さ', type: 'select', def: 'normal', all: 1,
      options: [
        { v: 'mild', label: '穏やか：死・心中・監禁・破局が起こりにくい（起きないわけではない）' },
        { v: 'normal', label: 'ふつう' },
        { v: 'dark', label: '重い：起こりやすい' }
      ]
    };
    Object.defineProperty(item, 'desc', {
      enumerable: true,
      get: function () {
        var s = '死・心中・監禁・危害・別れ・浮気・失恋・発狂・堕ち・全滅・襲撃の起こりやすさをまとめて変える（全箱庭で共通）';
        /* r18:begin */
        if (HK.Content && !HK.SAFE_ON) s += '。穏やかにすると、内容のスイッチの「合意のない展開」「暴力をともなう性描写」「DVなど歪んだ関係」も切として扱う（R18が中心の箱庭では堕ちが遅くなるだけ）';
        /* r18:end */
        return s;
      }
    });
    HK.GLOBAL_ENV.push(item);
  }
  /* 穏やかでは、合意のない展開・暴力・歪んだ関係のスイッチを切として扱う（R18が中心の箱庭は除く） */
  var C = HK.Content;
  if (C && C.on && !C.on._dark) {
    var on0 = C.on;
    C.on = function (env, tag, scenId) {
      if (D.OFF_MILD[tag] && D.on(env) === 'mild' && !(scenId && C.CORE && C.CORE[scenId])) return false;
      return on0.apply(this, arguments);
    };
    C.on._dark = true;
  }
})();
