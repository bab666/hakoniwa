/* 箱庭シミュレーター: 読み込み器 HK.Load（中核 core の先頭。build はこのファイルだけ def で包まない）
   ・index.html の目録 window.HK_MANIFEST（build が書く）を見て、中核のあとに要るかたまり（late・pack-<族>・scen-<id>）を script 要素で読む。
     かたまりの中身は HK.Load.def(元の通し番号, 'js/xx.js', function () { …元のファイル… }) の並びで、最後に HK.Load.done(名前, ハッシュ, api)。
   ・目録が無いとき（古い index.html・js を1本ずつ読む開発中・text-studio）は何もしない：def はその場で実行するだけ、ensure はすぐ済む（今までどおり動く）。
   ・起動の流れ（core の done から start）：#all なら全部読む／そうでなければ late と前回の箱庭のかたまりを読む／
     先読みの設定が「すべて」か、「自動」でパソコンと判定したら、数秒後から残りを1本ずつダウンロードだけしておく（実行は選んだとき）。
   ・HK.LATE_READY／HK.onLate／HK.LATE_FAILED は今までと同じ意味（late を読み終えたら true にして onLate。#all のときは全部を読み終えてから）。
   ・HK.SCEN_ORDER は目録の order から中核の最初に作る（全年齢モードでは safe.js が絞る）。
   ・仮の箱庭は HK.SCENARIOS に入れない（HK.SCENARIOS[id] の有無で箱庭を見るコードが多いため。HK.SCENARIOS は今までどおり本体の登録だけ）。
     画面（一覧・「選べる箱庭か」）は HK.Load.info(id) で引く：本体があれば本体、無ければ目録から作った仮の箱庭（stub: true と目録の scen の中身。SCEN_ORDER にある箱庭だけ）。
     目録そのものは HK.Load.meta(id)（書き換えない）
   ・口調の書き下ろし（第4段）：ビルドが最終の表を口調ごとのデータにしたかたまり tone-base（自動の10口調）・tone-<口調>、
     箱庭だけの行は scen-<id> の中。どれも HK.Load.toneData(口調, {F, S, O, M, N}) で表に上書きで入れる。
     ensureTones(口調・住人・入力) は口調の閉包（HK.TONES の base・derive・endingOf など・喘ぎの口調・語尾の設定の元の口調・自動の10）のかたまりを読む。
     LATE_READY は late と tone-base を読み終えたら true
   設計：docs/reports/2026-10-27/chunk-loading-design.md（2-3〜2-6）。両方のビルドに同じファイルを置く */
(function () {
  'use strict';
  var HK = window.HK = window.HK || {};
  if (HK.Load && HK.Load.api) return;   /* 二重に読まれても作り直さない */
  var API = 1;
  var M = window.HK_MANIFEST && typeof window.HK_MANIFEST === 'object' ? window.HK_MANIFEST : null;
  /* build が目録を作るとき（node の vm）は空の目録 {vm: true} が来る：目録が無いときと同じに動く */
  if (M && M.vm) M = null;
  var CH = (M && M.chunks) || {}, SC = (M && M.scen) || {};
  /* 口調のかたまり：tones.auto＝自動の10口調（tone-base に入っている）、tones.pack＝口調 → かたまりの名前 */
  var TN = (M && M.tones) || {}, TPACK = TN.pack || {};
  function isTone(name) { return name === 'tone-base' || /^tone-/.test(name); }
  var RETRY = [1000, 3000, 9000];

  /* ---------- URL の印（#safe&all・#safe,all・#all・#r18・#futari、?all=1） ---------- */
  var flags = {};
  try {
    String(location.hash || '').replace(/^#/, '').split(/[&,]/).forEach(function (x) { x = x.trim(); if (x) flags[x] = true; });
    if (/[?&]all=1(?:&|$)/.test(location.search || '')) flags.all = true;
  } catch (e) { /* location を読めない環境 */ }

  /* ---------- かたまりの状態 ---------- */
  var st = {};   /* 名前 → { done, p（読み込み中の約束）, failed, pre（先読み済み・中）} */
  function S(name) { return st[name] || (st[name] = { done: false, p: null, failed: false, pre: 0 }); }
  var handlers = [], nDone = 0, active = 0;

  var L = HK.Load = {
    api: API,
    manifest: M,
    flags: flags,
    cur: 0,
    file: '',
    gen: 0,
    stale: false,
    errors: []
  };

  /* ---------- 目録から SCEN_ORDER を作る（中核のほかのファイルより前）。画面用の仮の箱庭は HK.Load.info（HK.SCENARIOS には入れない） ---------- */
  function clone(v) { return v == null || typeof v !== 'object' ? v : JSON.parse(JSON.stringify(v)); }
  L.meta = function (id) { return Object.prototype.hasOwnProperty.call(SC, id) ? SC[id] : null; };
  var stubs = {};
  L.info = function (id) {
    var real = HK.SCENARIOS && HK.SCENARIOS[id];
    if (real) return real;
    if (!L.meta(id) || (HK.SCEN_ORDER || []).indexOf(id) < 0) return null;
    if (!stubs[id]) { var o = clone(SC[id]) || {}; o.id = id; o.stub = true; stubs[id] = o; }
    return stubs[id];
  };
  if (M) {
    HK.SCENARIOS = HK.SCENARIOS || {};
    HK.SCEN_ORDER = Array.isArray(M.order) ? M.order.slice() : [];
    /* late を読み終えるまでは「まだ」（今の index.html と同じ。点検道具は LATE_READY !== false を待つ） */
    HK.LATE_READY = false;
  }

  /* ---------- ファイルの定義・かたまりの終わり ---------- */
  L.def = function (n, file, fn) {
    var pc = L.cur, pf = L.file;
    L.cur = n; L.file = file;
    try { fn.call(window); }
    catch (e) {
      /* 1本が落ちても残りのファイルは続ける。エラーは画面の点検（pageerror）にも出るように投げ直す */
      L.errors.push({ n: n, file: file, err: String(e && e.message || e) });
      if (window.console) console.error('読み込みのエラー：' + file, e);
      setTimeout(function () { throw e; }, 0);
    }
    L.cur = pc || 0; L.file = pf || '';
  };
  L.done = function (name, hash, api) {
    var s = S(name);
    if (s.done) return;
    if (api != null && api !== API) staleNotice();
    s.done = true; s.failed = false; s.hash = hash || '';
    /* 取り付け役：このかたまりより前に読み終えたかたまりのファイルが登録したものを、登録したファイルの通し番号の順に呼ぶ */
    var born = nDone;
    nDone++;
    L.gen++;
    handlers.filter(function (h) { return h.born < born; }).sort(function (a, b) { return (a.ord - b.ord) || (a.k - b.k); }).forEach(function (h) {
      var pc = L.cur; L.cur = h.ord;
      try { h.fn(name); }
      catch (e) { if (window.console) console.error('取り付けのエラー：' + name, e); setTimeout(function () { throw e; }, 0); }
      L.cur = pc;
    });
    sortOrder();
    if (name === 'core') L.start();
  };
  /* 箱庭のファイルが SCEN_ORDER の後ろに足した箱庭（全年齢モードで一度外れたものなど）を、目録の並び（全部読んだときの並び）の位置に戻す。
     目録に無い箱庭（#futari のふたり暮らしなど）は、今の並びで直前にある箱庭のすぐ後ろのまま */
  function sortOrder() {
    if (!M || !Array.isArray(M.order) || !Array.isArray(HK.SCEN_ORDER)) return;
    var cur = HK.SCEN_ORDER, last = -1;
    var keyed = cur.map(function (id, i) { var k = M.order.indexOf(id); if (k >= 0) last = k; else k = last + 0.5; return [k, i, id]; })
      .sort(function (a, b) { return (a[0] - b[0]) || (a[1] - b[1]); });
    if (keyed.some(function (x, i) { return x[2] !== cur[i]; })) {
      var next = keyed.map(function (x) { return x[2]; });
      cur.length = 0; Array.prototype.push.apply(cur, next);   /* 同じ配列のまま並べ替える（ほかが持っている参照を保つ） */
    }
  }
  L.onChunk = function (fn) {
    if (typeof fn === 'function') handlers.push({ fn: fn, ord: L.cur || 0, born: nDone, k: handlers.length });
  };

  /* ---------- 名前を解く（箱庭の id・かたまりの名前・配列 → 読む順に並べたかたまりの名前） ---------- */
  function chunksOfScen(id) { var s = SC[id]; return s && Array.isArray(s.chunks) ? s.chunks : null; }
  function closure(x) {
    var out = [], seen = {};
    function add(name, path) {
      if (seen[name] || name === 'core' || !CH[name]) return;
      if (path.indexOf(name) >= 0) return;   /* 依存の輪は無視（build が作らない） */
      (CH[name].deps || []).forEach(function (d) { add(d, path.concat([name])); });
      if (!seen[name]) { seen[name] = 1; out.push(name); }
    }
    (Array.isArray(x) ? x : [x]).forEach(function (v) {
      if (v == null || v === '') return;
      v = String(v);
      if (CH[v]) add(v, []);
      else (chunksOfScen(v) || []).forEach(function (c) { add(c, []); });
    });
    return out;
  }
  L.closure = closure;
  L.isDone = function (name) { return !!(st[name] && st[name].done); };
  L.has = function (id) {
    var cs = chunksOfScen(id);
    if (!cs) return true;
    return closure(id).every(function (c) { return S(c).done; });
  };
  L.scen = function (id) { return SC[id] || null; };

  /* ---------- 口調の書き下ろしのデータ（ビルドが書き出したかたまり tone-base・tone-<口調>・scen-<id> の中から呼ばれる） ----------
     d.F＝[[元, 書き下ろし(, 1＝TONE_FIX_G の印)], …]（HK.Voice.TONE_FIX[tone]）、d.S＝[元, …]（書き下ろし＝元。[元, 1] なら G の印つき）、
     d.O＝HK.Voice.OVR[tone]、d.I＝{ 決まり文句の id: HK.Voice.INTENT の id の項目の [tone] }（voice-override.js の INTENT。voice-override-rows.js が口調ごとに足す）、
     d.M＝HK.Ero.TONE_MOAN[tone]、d.N＝HK.NovelMoan.T[tone]（M・N は R18版だけ）。
     どれも鍵ごとに上書きで入れる（同じ口調に何回来てもよい。最終の表の値なので、来た順に左右されない）。
     表そのもの・口調ごとの表は置き換えずに足す（voice-override.js・ero-kit.js・novel-moan-tone.js が同じものを持っているため） */
  function put(tab, tone, src) {
    var t = tab[tone] = tab[tone] || {};
    for (var k in src) if (Object.prototype.hasOwnProperty.call(src, k)) t[k] = src[k];
  }
  L.toneData = function (tone, d) {
    if (!tone || !d) return;
    var V = HK.Voice, i, r;
    if (V && (d.F || d.S)) {
      var FIX = V.TONE_FIX = V.TONE_FIX || {}, T = FIX[tone] = FIX[tone] || {}, G = null;
      var mark = function (k) { if (!G) { var GG = V.TONE_FIX_G = V.TONE_FIX_G || {}; G = GG[tone] = GG[tone] || {}; } G[k] = 1; };
      for (i = 0; i < (d.F || []).length; i++) { r = d.F[i]; T[r[0]] = r[1]; if (r[2]) mark(r[0]); }
      for (i = 0; i < (d.S || []).length; i++) { r = d.S[i]; if (Array.isArray(r)) { T[r[0]] = r[0]; if (r[1]) mark(r[0]); } else T[r] = r; }
    }
    if (V && d.O) put(V.OVR = V.OVR || {}, tone, d.O);
    if (V && d.I && Array.isArray(V.INTENT)) V.INTENT.forEach(function (x) { if (x && x.id != null && Object.prototype.hasOwnProperty.call(d.I, x.id)) x[tone] = d.I[x.id]; });
    if (d.M && HK.Ero) put(HK.Ero.TONE_MOAN = HK.Ero.TONE_MOAN || {}, tone, d.M);
    if (d.N && HK.NovelMoan && HK.NovelMoan.T) put(HK.NovelMoan.T, tone, d.N);
    /* 表から作る索引（tone-fix-loose.js のゆるい引き方など）を作り直させる */
    L.gen++;
  };

  /* ---------- 口調の閉包：口調の鍵・住人（名簿の住人・動かす入力の chars）・入力そのもの → 要る口調の鍵 ---------- */
  function tonesOfChar(c, add) {
    if (!c || typeof c !== 'object') return;
    if (c.tone) add(c.tone);
    try { if (HK.toneOf) add(HK.toneOf(c)); } catch (e) { /* 気質が無い住人など */ }
    /* 語尾の設定（tone-ending.js）：e:… の口調は書き下ろしを持たないので、元の口調 */
    try { if (c.ending && HK.Ending && HK.Ending.baseTone) add(HK.Ending.baseTone(c)); } catch (e) { /* 設定が壊れている */ }
    /* 喘ぎの口調（R18版。全年齢モードでは使わない） */
    if (c.moanTone && !HK.SAFE_ON) add(c.moanTone);
  }
  L.toneClosure = function (x) {
    var out = [], seen = {}, TONES = HK.TONES || {};
    function add(t) {
      if (!t || typeof t !== 'string' || seen[t]) return;
      seen[t] = 1; out.push(t);
      /* base＝文面を借りる口調、derive＝派生元（その書き下ろしを引く）、endingOf＝語尾の設定の元の口調 もたどる */
      var d = TONES[t];
      if (d && typeof d === 'object') ['base', 'derive', 'endingOf'].forEach(function (k) { if (typeof d[k] === 'string') add(d[k]); });
    }
    (TN.auto || []).forEach(add);
    (Array.isArray(x) ? x : [x]).forEach(function (v) {
      if (v == null || v === '') return;
      if (typeof v === 'string') add(v);
      else if (Array.isArray(v.chars)) v.chars.forEach(function (c) { tonesOfChar(c, add); });   /* 動かす入力 */
      else tonesOfChar(v, add);
    });
    return out;
  };
  /* 口調 → 読むかたまり（tone-base と、目録の tones.pack にある口調のかたまり。自動の10・自作・不明の口調は読まない） */
  function toneChunks(x) {
    var names = CH['tone-base'] ? ['tone-base'] : [];
    L.toneClosure(x).forEach(function (t) { var n = TPACK[t]; if (n && CH[n] && names.indexOf(n) < 0) names.push(n); });
    return names;
  }
  L.toneChunks = function (x) { return M ? toneChunks(x) : []; };
  L.tonesReady = function (x) { return !M || toneChunks(x).every(function (n) { return S(n).done; }); };

  /* ---------- 1本読む（失敗は 1・3・9秒で3回まで再試行） ---------- */
  var waiting = [];   /* 止まっている再試行（裏から戻ったらすぐやり直す） */
  function later(fn, ms) {
    var w = { fn: fn, t: 0 };
    w.t = setTimeout(function () { waiting = waiting.filter(function (x) { return x !== w; }); fn(); }, ms);
    waiting.push(w);
  }
  function offline() { try { return navigator.onLine === false; } catch (e) { return false; } }
  function web() { return /^https?:$/.test(location.protocol); }
  function fail(reason, name) {
    var msg = reason === 'offline' ? '通信できないため読み込めません' : reason === 'stale' ? '新しい版があります。ページを読み込み直してください' :
      reason === 'broken' ? 'データが壊れているため読み込めません' : 'データを読み込めませんでした';
    var e = new Error(msg); e.reason = reason; e.chunk = name;
    return e;
  }
  L.errText = function (e) { return (e && e.message) || 'データを読み込めませんでした'; };
  function inject(name) {
    var src = CH[name].src;
    return new Promise(function (ok, ng) {
      var tries = 0;
      function go() {
        var s = document.createElement('script');
        s.src = src; s.async = true;
        s.onload = function () {
          if (S(name).done) { ok(); return; }
          /* 読めたのに done が来ない＝中身が壊れている（構文エラーなど）。やり直しても同じなので止める */
          if (s.parentNode) s.parentNode.removeChild(s);
          ng(fail('broken', name));
        };
        s.onerror = function () {
          if (s.parentNode) s.parentNode.removeChild(s);
          if (tries < RETRY.length) { later(go, RETRY[tries++]); return; }
          if (offline()) { ng(fail('offline', name)); return; }
          /* http で配っていて 404 なら、開いたあとに新しい版が出て古いかたまりが消えた（1世代前も無い） */
          if (web() && window.fetch) {
            window.fetch(src, { method: 'HEAD', cache: 'no-store' }).then(function (r) {
              if (r.status === 404 || r.status === 410) { staleNotice(); ng(fail('stale', name)); } else ng(fail('net', name));
            }, function () { ng(fail(offline() ? 'offline' : 'net', name)); });
            return;
          }
          ng(fail('net', name));
        };
        (document.head || document.documentElement).appendChild(s);
      }
      go();
    });
  }
  function load(name) {
    var s = S(name);
    if (s.done) return Promise.resolve();
    if (s.p) return s.p;
    var deps = (CH[name] && CH[name].deps) || [];
    active++; pauseQueue();
    s.p = Promise.all(deps.map(load)).then(function () { return s.done ? null : inject(name); }).then(function () {
      active--; s.p = null; s.failed = false; resumeQueue();
    }, function (e) {
      active--; s.p = null; s.failed = true; resumeQueue();
      throw e;
    });
    return s.p;
  }
  L.ensure = function (x) {
    if (!M) return Promise.resolve();
    var names = closure(x);
    return Promise.all(names.map(load)).then(function () { return undefined; });
  };
  L.ensureTones = function (x) {
    if (!M) return Promise.resolve();
    return Promise.all(toneChunks(x).map(load)).then(function () { return undefined; });
  };
  L.status = function (x) {
    var names = closure(x);
    if (names.every(function (n) { return S(n).done; })) return 'done';
    if (names.some(function (n) { return S(n).p; })) return 'loading';
    if (names.some(function (n) { return S(n).failed; })) return 'failed';
    return '';
  };
  /* 全部読む（点検用・#all）。late と口調のかたまりを最後に、ほかは目録の並びで1本ずつ（読む順が毎回同じになるように） */
  var allP = null;
  L.all = function () {
    if (!M) return Promise.resolve();
    if (allP) return allP;
    /* 口調のかたまりは late の後ろ（元の並びで口調の書き下ろしがあった位置） */
    var tones = Object.keys(CH).filter(isTone).sort(function (a, b) { return (b === 'tone-base') - (a === 'tone-base'); });
    var names = Object.keys(CH).filter(function (n) { return n !== 'late' && !isTone(n); });
    if (CH.late) names.push('late');
    names = closure(names);
    if (CH.late && names[names.length - 1] !== 'late') names = names.filter(function (n) { return n !== 'late'; }).concat(['late']);
    names = names.concat(closure(tones).filter(function (n) { return names.indexOf(n) < 0; }));
    var p = Promise.resolve();
    names.forEach(function (n) { p = p.then(function () { return load(n); }); });
    allP = p.then(function () { return undefined; }, function (e) { allP = null; throw e; });
    return allP;
  };

  /* ---------- 先読み（ダウンロードだけ。実行しない） ---------- */
  var queue = [], qBusy = null, qPaused = false, qTimer = 0;
  function canLink() { try { var l = document.createElement('link'); return !!(l.relList && l.relList.supports && l.relList.supports('prefetch')); } catch (e) { return false; } }
  function pauseQueue() {
    qPaused = true;
    /* Safari の fetch による先読みは止めて、あとでやり直す（読み込みを先にする） */
    if (qBusy && qBusy.ac) { try { qBusy.ac.abort(); } catch (e) { /* 止められない */ } }
  }
  function resumeQueue() { if (active <= 0) { active = 0; qPaused = false; pump(); } }
  function pump() {
    if (qBusy || qPaused || !queue.length) return;
    if (document.visibilityState === 'hidden') return;   /* 裏に回っているあいだは止める（戻ったら再開） */
    var name = queue.shift(), s = S(name);
    if (s.done || s.p || s.pre === 2) { pump(); return; }
    var src = CH[name].src, job = { name: name, ac: null };
    qBusy = job;
    var next = function (okd) {
      if (qBusy !== job) return;
      qBusy = null;
      if (okd) s.pre = 2; else if (job.aborted) queue.unshift(name);
      clearTimeout(qTimer); qTimer = setTimeout(pump, 50);
    };
    s.pre = 1;
    if (canLink()) {
      var l = document.createElement('link');
      l.rel = 'prefetch'; l.href = src;
      l.onload = function () { next(true); };
      l.onerror = function () { s.pre = 0; next(false); };
      /* ブラウザが先読みを後回しにして知らせが来ないときも、30秒で次へ進む */
      setTimeout(function () { next(true); }, 30000);
      (document.head || document.documentElement).appendChild(l);
    } else if (window.fetch) {
      /* Safari：rel=prefetch が無いので、低い優先度の fetch で HTTP キャッシュに入れる */
      try { job.ac = window.AbortController ? new AbortController() : null; } catch (e) { job.ac = null; }
      var opt = { credentials: 'same-origin', priority: 'low' };
      if (job.ac) opt.signal = job.ac.signal;
      window.fetch(src, opt).then(function (r) { return r.ok ? r.blob() : null; }).then(function (b) { if (!b) s.pre = 0; next(!!b); }, function (e) {
        s.pre = 0; job.aborted = !!(e && e.name === 'AbortError'); next(false);
      });
    } else { s.pre = 0; qBusy = null; }
  }
  L.prefetch = function (x) {
    if (!M || !web()) return;   /* file:// は手元のファイルなので先読みしない */
    closure(x).forEach(function (n) { var s = S(n); if (!s.done && !s.p && !s.pre && queue.indexOf(n) < 0) queue.push(n); });
    pump();
  };

  /* ---------- 先読みの設定（localStorage。全年齢版は HK.STORE.key で版ごとの鍵） ---------- */
  var PREF = ['auto', 'all', 'pick'];
  function prefKey() { return HK.STORE && HK.STORE.key ? HK.STORE.key('hakoniwa:prefetch') : 'hakoniwa:prefetch'; }
  L.pref = function () { var v = null; try { v = window.localStorage.getItem(prefKey()); } catch (e) { v = null; } return PREF.indexOf(v) >= 0 ? v : 'auto'; };
  L.setPref = function (v) {
    if (PREF.indexOf(v) < 0) v = 'auto';
    try { if (v === 'auto') window.localStorage.removeItem(prefKey()); else window.localStorage.setItem(prefKey(), v); } catch (e) { /* 保存できない環境はこのページ限り */ }
    prefMem = v;
    if (willPrefetch()) bgPrefetch(0);
  };
  var prefMem = null;
  /* パソコンの判定：マウスなどの細かい指し示し＋幅 900px 以上＋データ節約でない */
  L.isPC = function () {
    try {
      return !!(window.matchMedia && window.matchMedia('(hover: hover) and (pointer: fine)').matches && window.innerWidth >= 900 &&
        !(navigator.connection && navigator.connection.saveData));
    } catch (e) { return false; }
  };
  function willPrefetch() { var p = prefMem || L.pref(); return p === 'all' || (p === 'auto' && L.isPC()); }
  var bgT = 0;
  function bgPrefetch(ms) {
    if (!M || !web()) return;
    clearTimeout(bgT);
    /* 口調のかたまりは小さいので後ろに */
    bgT = setTimeout(function () { if (willPrefetch()) L.prefetch(Object.keys(CH).filter(function (n) { return !isTone(n); }).concat(Object.keys(CH).filter(isTone))); }, ms);
  }

  /* ---------- 新しい版があるときの知らせ（画面の上に1つだけ） ---------- */
  function staleNotice() {
    /* 閉じたあとにまた古いかたまりを読もうとしたら、もう一度出す */
    L.stale = true;
    var show = function () {
      if (document.getElementById('hkstale')) return;
      var d = document.createElement('div');
      d.id = 'hkstale'; d.setAttribute('role', 'alert');
      d.style.cssText = 'position:fixed;left:50%;top:max(8px,env(safe-area-inset-top,0px));transform:translateX(-50%);z-index:100;max-width:calc(100vw - 24px);box-sizing:border-box;' +
        'padding:10px 14px;border:1px solid var(--ink,#16233B);border-radius:6px;background:var(--paper,#fff);color:var(--ink,#16233B);' +
        'display:flex;gap:10px;align-items:center;flex-wrap:wrap;font-size:14px';
      d.innerHTML = '<span>新しい版があります。ページを読み込み直してください</span><button type="button" class="btn small primary">読み込み直す</button><button type="button" class="btn small ghost" aria-label="閉じる">×</button>';
      var bs = d.querySelectorAll('button');
      bs[0].onclick = function () { location.reload(); };
      bs[1].onclick = function () { d.remove(); };
      document.body.appendChild(d);
    };
    if (document.body) show(); else document.addEventListener('DOMContentLoaded', show);
  }
  L.staleNotice = staleNotice;
  if (M && M.api != null && M.api !== API) staleNotice();

  /* ---------- 裏から戻ったら、止まっていた再試行・先読みを再開 ---------- */
  if (typeof document !== 'undefined' && document.addEventListener) document.addEventListener('visibilitychange', function () {
    if (document.visibilityState === 'hidden') return;
    var w = waiting; waiting = [];
    w.forEach(function (x) { clearTimeout(x.t); x.fn(); });
    pump();
  });
  if (window.addEventListener) window.addEventListener('online', function () {
    var w = waiting; waiting = [];
    w.forEach(function (x) { clearTimeout(x.t); x.fn(); });
  });

  /* ---------- 起動（core の done から） ---------- */
  var started = false;
  function lateDone(failed) {
    if (failed) HK.LATE_FAILED = true;
    HK.LATE_READY = true;
    if (HK.onLate) { try { HK.onLate(); } catch (e) { setTimeout(function () { throw e; }, 0); } }
  }
  L.start = function () {
    if (started || !M) return;
    started = true;
    if (flags.all) {
      L.all().then(function () { lateDone(false); }, function () { lateDone(true); });
      return;
    }
    /* late（口調以外のあとで読む分）と tone-base（自動の10口調の書き下ろし）を読み終えたら LATE_READY */
    var first = ['late', 'tone-base'].filter(function (n) { return CH[n]; });
    if (first.length) Promise.all(first.map(function (n) { return L.ensure(n); })).then(function () { lateDone(false); }, function () { lateDone(true); });
    else setTimeout(function () { lateDone(false); }, 0);
    /* 前回の箱庭（住人の保存の scenId）と住人の口調。ui.js が S を決めていればそれ、なければ保存から */
    var sid = '', chars = null;
    try { var us = HK.UI && HK.UI.state ? HK.UI.state() : null; sid = us ? us.scenId : ''; chars = us ? us.chars : null; } catch (e) { sid = ''; }
    if (!sid || !chars) { try { var raw = HK.store && HK.store.get ? HK.store.get('state', null) : null; if (!sid) sid = raw && raw.scenId; if (!chars) chars = raw && raw.chars; } catch (e) { /* 保存を読めない */ } }
    if (sid && SC[sid]) L.ensure(sid).then(null, function () { /* 失敗は選んだときに知らせる */ });
    /* 住人の口調の書き下ろし（小さいので、動かす前に裏で読んでおく。失敗は動かすときに知らせる） */
    if (Array.isArray(chars) && chars.length) L.ensureTones(chars).then(null, function () { /* 同上 */ });
    bgPrefetch(4000);
  };
})();
