/* 箱庭シミュレーター: 展開の重さ・死ネタの重さ（全箱庭で共通の設定。両ビルド共通）
   重い展開の起こりやすさを、二つの設定で上げ下げする。
   ・展開の重さ（環境値 heavy：mild 穏やか／normal ふつう／dark 重い）……死なない重い展開：監禁・危害（死なない）・別れ・浮気・失恋・堕ち・歪んだ関係・恨み（spite）
     （島の「飢えの果て」が env.dark を使っているので、id は heavy にしている）
   ・死ネタの重さ（環境値 death：auto 展開の重さに合わせる（既定）／mild／normal／dark）……死・心中・殺し合い・命に関わる危害・発狂・全滅・襲撃での死
     auto のときは展開の重さと同じ段になるので、既定のままなら前と同じ結果になる
   ・どちらに効くかは、出来事の側が渡す種類（kind）で決まる。死ネタ側の種類は DEATH の一覧
       死ネタ：kill 殺す・死ぬ　shinju 心中　madness 発狂　raid 襲撃　wipe 全滅　night 人狼の夜の襲撃　grudge 恨みの殺し
       展開　：cage 監禁　harm 危害（死なない。命に関わるときは kill を渡す）　breakup 別れ　cheat 浮気　heartbreak 失恋　fall 堕ち　spite 恨み・仕返し（殺さない）　assault 襲われる・強引に抱かれる（合意のない展開。媚薬ロッカー・ゾンビの街）
   ・出来事の側は、確率や重みに HK.Dark.f(ctx, 'kill') を掛けるだけ（ふつうのときは 1 で、乱数も引かない。結果は前と同じ）
       f：悪いことが起きる確率・重みに掛ける倍率　live：生き延びる確率 p を「失敗する側 ×f」に直す　pace：執着などが積もる速さ
       skip：穏やかのとき、まれに重い展開を見送る（ふつう・重いでは乱数を引かずに false）　endings：結末を選ぶとき、悪い結末の重みに掛ける倍率
       on・pick・pace・endings は最後に種類を渡せる（渡さなければ展開の重さ。死に関わる所は 'kill' などを渡す）
   ・穏やか（展開の重さ）では、内容のスイッチの「合意のない展開」「暴力をともなう性描写」「DVなど歪んだ関係」も切として扱う
     （性描写の題材のスイッチなので、死ネタの重さではなく展開の重さに従う。R18が中心の箱庭 HK.Content.CORE は題材そのものなので効かせない。そこでは堕ちが遅くなるだけ）
   ・穏やかでも「起きないわけではない」：倍率を下げるだけで、死や別れは残る */
(function () {
  'use strict';
  var HK = window.HK;
  if (!HK) return;
  var MUL = {
    mild: { kill: 0.35, shinju: 0.35, cage: 0.35, harm: 0.35, breakup: 0.35, cheat: 0.35, heartbreak: 0.35, madness: 0.35, fall: 0.5, raid: 0.35, wipe: 0.5, grudge: 0.35, spite: 0.35, assault: 0.35, night: 0.7 },
    dark: { kill: 1.8, shinju: 1.8, cage: 1.8, harm: 1.8, breakup: 1.8, cheat: 1.8, heartbreak: 1.8, madness: 1.8, fall: 1.8, raid: 1.8, wipe: 1.8, grudge: 1.8, spite: 1.8, assault: 1.8 }
  };
  /* 死ネタの重さに従う種類 */
  var DEATH = { kill: 1, shinju: 1, madness: 1, raid: 1, wipe: 1, night: 1, grudge: 1 };
  var PACE = { mild: 0.6, dark: 1.4 }, END = { mild: 0.4, dark: 1.6 }, NOTE = { mild: '展開：穏やか', dark: '展開：重い' };
  var LBL = { mild: '穏やか', normal: 'ふつう', dark: '重い' };
  function envOf(x) { return x && x.env && typeof x.env === 'object' ? x.env : x; }
  function lv(v) { return v === 'mild' || v === 'dark' || v === 'normal' ? v : ''; }
  var D = HK.Dark = {
    MUL: MUL, DEATH: DEATH,
    /* いまの重さ（mild／normal／dark）。kind が死ネタ側なら、死ネタの重さ（合わせるなら展開の重さ） */
    on: function (x, kind) {
      var e = envOf(x);
      if (kind && DEATH[kind]) { var d = lv(e && e.death); if (d) return d; }
      var v = e && e.heavy; return v === 'mild' || v === 'dark' ? v : 'normal';
    },
    /* 死ネタの重さを別に決めているか（合わせるなら false） */
    split: function (x) { var e = envOf(x); return !!lv(e && e.death); },
    f: function (x, kind) { var m = MUL[D.on(x, kind)]; return m ? (m[kind] != null ? m[kind] : 1) : 1; },
    /* 生き延びる・助かる確率 p を、重さに合わせて直す（失敗する側に f を掛ける） */
    live: function (x, p, kind) { var k = D.f(x, kind || 'kill'); return k === 1 ? p : 1 - (1 - p) * k; },
    pace: function (x, kind) { return PACE[D.on(x, kind)] || 1; },
    skip: function (x, kind) { var k = D.f(x, kind); if (!(k < 1)) return false; var r = x && x.rng; return typeof r === 'function' ? r() > k : false; },
    endings: function (x, kind) { return END[D.on(x, kind)] || 1; },
    /* 結末の一行：「展開：重い」、死ネタの重さが別なら「死ネタ：穏やか」を添える */
    note: function (x) {
      var h = D.on(x), d = D.on(x, 'kill'), out = [];
      if (NOTE[h]) out.push(NOTE[h]);
      if (d !== h) out.push('死ネタ：' + LBL[d]);
      return out.join('／');
    },
    /* 記録の理由に添える名前（「展開の重さ：穏やか」／死ネタの重さを別に決めていれば「死ネタの重さ：穏やか」） */
    tag: function (x, kind) { var l = D.on(x, kind); return (kind && DEATH[kind] && D.split(x) ? '死ネタの重さ：' : '展開の重さ：') + LBL[l]; },
    /* 段階ごとの値（しきい値など）：穏やか・ふつう・重い。kind が死ネタ側なら死ネタの重さで選ぶ */
    pick: function (x, mild, normal, dark, kind) { var l = D.on(x, kind); return l === 'mild' ? mild : l === 'dark' ? dark : normal; },
    /* 物語型の箱庭の env を作るとき、全体の設定を写す（死ネタの重さは、別に決めているときだけ写す。合わせるなら前と同じ env） */
    keep: function (src, env) {
      env.heavy = D.on(src);
      var d = lv(src && src.death); if (d) env.death = d;
      return env;
    },
    /* a と b の恋愛・夜が浮気になるか（どちらかに、相手以外の恋人がいる。エンジン型の ctx） */
    cheat: function (ctx, a, b) {
      if (!ctx || !ctx.chars || !ctx.pair || !a || !b || ctx.pair(a, b).couple) return false;
      return ctx.chars.some(function (c) { return c !== a && c !== b && c.alive !== false && (ctx.pair(a, c).couple || ctx.pair(b, c).couple); });
    },
    OFF_MILD: { force: 1, violence: 1, abuse: 1 },
    /* 少人数の係数（2026-10-28 担当JA。サバイバル系：ゾンビの街・無人島）：住人が少ないとき、死の判定の確率に掛けて下げる
       （4人以下 0.3・5人 0.5・6人以上 1）。ゾンビの街で「一人以上死ぬ回」が4人以下で5割前後・全滅が1割以下になるように合わせた値
       （直す前は2〜4人で9割以上が死に、2人では7割が全滅していた。人が多いほど誰かが死ぬ回は増えるので、4人以下は同じ値にしている）。
       6人以上は 1 なので、呼ぶ側は乱数を引かずに前と同じ結果になる。展開の重さ・死ネタの重さの倍率（f・live）とは別に掛ける（穏やか・重いの差はそのまま効く） */
    FEW: [0.3, 0.3, 0.3, 0.3, 0.3, 0.5],
    few: function (ctx) { var n = ctx && ctx.chars ? ctx.chars.length : 99; return n < D.FEW.length ? D.FEW[n] : 1; }
  };
  /* 全体の環境値（events-common.js の HK.GLOBAL_ENV）に足す。all：物語型の箱庭にも出す */
  if (HK.GLOBAL_ENV && !HK.GLOBAL_ENV.some(function (e) { return e.id === 'heavy'; })) {
    var item = {
      id: 'heavy', label: '展開の重さ', type: 'select', def: 'normal', all: 1,
      options: [
        { v: 'mild', label: '穏やか：別れ・浮気・監禁・堕ちなどが起こりにくい（起きないわけではない）' },
        { v: 'normal', label: 'ふつう' },
        { v: 'dark', label: '重い：起こりやすい' }
      ]
    };
    Object.defineProperty(item, 'desc', {
      enumerable: true,
      get: function () {
        var s = '監禁・危害・別れ・浮気・失恋・堕ちなど、死なない重い展開の起こりやすさを変える（全箱庭で共通）。下の「死ネタの重さ」が「展開の重さに合わせる」のままなら、死・心中などもこれに合わせて変わる';
        /* r18:begin */
        if (HK.Content && !HK.SAFE_ON) s += '。穏やかにすると、内容のスイッチの「合意のない展開」「暴力をともなう性描写」「DVなど歪んだ関係」も切として扱う（R18が中心の箱庭では堕ちが遅くなるだけ）';
        /* r18:end */
        return s;
      }
    });
    HK.GLOBAL_ENV.push(item);
  }
  if (HK.GLOBAL_ENV && !HK.GLOBAL_ENV.some(function (e) { return e.id === 'death'; })) {
    HK.GLOBAL_ENV.push({
      id: 'death', label: '死ネタの重さ', type: 'select', def: 'auto', all: 1,
      options: [
        { v: 'auto', label: '展開の重さに合わせる' },
        { v: 'mild', label: '穏やか：死・心中・殺し合い・発狂が起こりにくい（起きないわけではない）' },
        { v: 'normal', label: 'ふつう' },
        { v: 'dark', label: '重い：起こりやすい' }
      ],
      desc: '死・心中・殺し合い・命に関わる危害・発狂・全滅・襲撃での死の起こりやすさだけを変える（全箱庭で共通）。死ネタだけ軽くしたいときは「穏やか」に。浮気・別れなどは「展開の重さ」で変わり、住人の設定の「一途」「恋愛相手の固定」でも防げる'
    });
  }
  /* 穏やか（展開の重さ）では、合意のない展開・暴力・歪んだ関係のスイッチを切として扱う（R18が中心の箱庭は除く） */
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
