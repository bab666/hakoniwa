/* 箱庭シミュレーター: 住人・関係の保存先（HK.StateStore）
   ・住人・関係（HK.store の state）と、その控え（state:backup）・読めなかった保存の退避（state:rescue）を、IndexedDB に置く。
     住人の上限を 1000 人にしたので、localStorage（約5MB。控えと合わせて2倍）では入りきらないため。
   ・IndexedDB の名前は版ごと（safe.js の HK.STORE）：R18版は hakoniwa-state、全年齢版は hakoniwa-z-state。
     store「state」（keyPath k：'state'・'state:backup'・'state:rescue'。{ k, text（JSON の文字列）, seq, at, meta: { v, at, n, ties } }）と、
     store「kv」（保存フォルダのハンドルなど。save-folder.js）。セーブの DB（hakoniwa-saves）とは別にする（版を上げると旧版のページがセーブの DB を開けなくなるため）
   ・localStorage にも今までどおり書く：約1MB（LS_MAX 文字）までは丸ごと。超えたら（または入りきらなければ）、IndexedDB に書き終えてから
     「IndexedDB にある」印 { "hakoniwa-idb": DB の名前, n: 住人の数, ties, at, v, scenId } だけを置く（旧版で開くと住人が空に見えるが、
     旧版が上書きしても、下の「旧版が書き換えた」の照らし合わせで、IndexedDB の写しを控えとして出す。ui.js の「控えから戻す」で戻せる）
   ・読み込み：localStorage に丸ごとあればそれ（IndexedDB と同じ中身か、IndexedDB に書き終える前に閉じたか、旧版が書いたもの＝どれもいちばん新しい）。
     印か、何も無ければ IndexedDB。全年齢版の移行（safe.js）で R18版の印を写したときは、印の DB（hakoniwa-state）から読む
   ・起動：ui.js などはこの保存を同期で読む（HK.store.get）ので、IndexedDB を読み終えるまで、このファイルより後ろの中核のファイルの実行を待たせる
     （読み込み器 HK.Load.def／done を読み終えるまで溜めて、終わったら同じ順に流す。分割読み込みの版だけ。js を1本ずつ読む開発中は待たせられないので、
     印のある鍵は IndexedDB を読み終えるまで書き込まない）。IndexedDB が使えない環境は localStorage だけ（今までどおり）
   ・ほかのファイルへ：HK.StateStore.ready（読み込み終わりの約束）・get/getText/setText（鍵は 'state' など HK.store と同じ短い名前）・flush（書き終わりの約束）・
     clear（保存データの消去。reset.js）・on(fn)（state・adv・history が変わったら fn(鍵)。save-folder.js）・kvGet/kvPut（store kv）・info() */
(function () {
  'use strict';
  var HK = window.HK;
  if (!HK || !HK.store) return;
  var KS = HK.STORE, K = function (k) { return KS ? KS.key(k) : k; };
  var PFX = KS ? KS.prefix : 'hakoniwa:';
  var DB = K('hakoniwa-state'), OLD = 'hakoniwa-state', ST = 'state', KV = 'kv', VER = 1;
  var BIG = ['state', 'state:backup', 'state:rescue'], WATCH = { state: 1, adv: 1, history: 1 };
  var LS_MAX = 1000000, MARK = 'hakoniwa-idb', WAIT_MAX = 8000;
  var mem = {}, memSeq = {}, meta = {}, lsSeq = {}, seq = 0, held = {}, fails = 0;
  var mode = 'ls';            /* 'ls'：localStorage だけ（今までどおり）／'idb'：IndexedDB と localStorage／'wait'：読み込み中 */
  var subs = [];

  function isBig(k) { return BIG.indexOf(k) >= 0; }
  function hasIDB() { try { return !!window.indexedDB; } catch (e) { return false; } }
  function lsGet(k) { try { return window.localStorage.getItem(PFX + k); } catch (e) { return null; } }
  function lsSet(k, v) { try { window.localStorage.setItem(PFX + k, v); return true; } catch (e) { return false; } }
  function lsDel(k) { try { window.localStorage.removeItem(PFX + k); } catch (e) { /* 使えない環境 */ } }
  /* 「localStorage に丸ごと無い（IndexedDB にだけある）」の目印。丸ごと置けなかった書き込みのときに付け、丸ごと置けたら外す。
     起動時に、印（MARK）かこの目印のある鍵があるときだけ IndexedDB を読み終えるまで待たせる（旧版が印を丸ごとで上書きしても気づける）。
     鍵は hakoniwa で始めない（まるごと書き出し・保存データの消去の対象にしない。消去では clear が外す） */
  function flagKey(k) { return 'hk-stateidb:' + DB + ':' + k; }
  function flagGet(k) { try { return window.localStorage.getItem(flagKey(k)) != null; } catch (e) { return false; } }
  function flagSet(k, on) { try { if (on) window.localStorage.setItem(flagKey(k), '1'); else window.localStorage.removeItem(flagKey(k)); } catch (e) { /* なし */ } }
  function markerOf(text) {
    if (typeof text !== 'string' || text.length > 4000 || text.indexOf('"' + MARK + '"') < 0) return null;
    try { var o = JSON.parse(text); return o && typeof o === 'object' && o[MARK] ? o : null; } catch (e) { return null; }
  }
  function metaOf(k, o) {
    var st = k === 'state' ? o : o && o.state;
    return {
      v: o && o.v || 0, at: (o && (o.savedAt || o.at)) || 0,
      n: st && Array.isArray(st.chars) ? st.chars.length : 0, ties: st && Array.isArray(st.ties) ? st.ties.length : 0,
      scenId: k === 'state' && o && typeof o.scenId === 'string' ? o.scenId : undefined
    };
  }
  function toast(m) { try { if (HK.UI && HK.UI.toast) HK.UI.toast(m); else if (HK.toast) HK.toast(m); } catch (e) { /* なし */ } }
  function emit(k) { subs.forEach(function (f) { try { f(k); } catch (e) { if (window.console) console.error(e); } }); }

  /* ---------- IndexedDB ---------- */
  var idb = null, opening = null;
  function open() {
    if (idb !== null) return Promise.resolve(idb);
    if (opening) return opening;
    opening = new Promise(function (ok) {
      var done = function (d) { idb = d; opening = null; ok(d); };
      try {
        if (!hasIDB()) return done(false);
        var rq = indexedDB.open(DB, VER);
        rq.onupgradeneeded = function () {
          var d = rq.result;
          if (!d.objectStoreNames.contains(ST)) d.createObjectStore(ST, { keyPath: 'k' });
          if (!d.objectStoreNames.contains(KV)) d.createObjectStore(KV, { keyPath: 'k' });
        };
        rq.onsuccess = function () {
          var d = rq.result;
          d.onversionchange = function () { try { d.close(); } catch (e) { /* なし */ } idb = null; };
          done(d);
        };
        rq.onerror = function (e) { if (e && e.preventDefault) e.preventDefault(); done(false); };
        rq.onblocked = function () { done(false); };
      } catch (e) { done(false); }
    });
    return opening;
  }
  /* 起動時に要る鍵だけを1つの読み取りで引く */
  function getKeys(d, store, keys) {
    return new Promise(function (ok) {
      try {
        var os = d.transaction(store, 'readonly').objectStore(store), m = {}, left = keys.length;
        if (!left) return ok(m);
        keys.forEach(function (k) {
          var rq = os.get(k);
          rq.onsuccess = function () { if (rq.result) m[k] = rq.result; if (!--left) ok(m); };
          rq.onerror = function () { if (!--left) ok(m); };
        });
      } catch (e) { ok(null); }
    });
  }
  function getAll(d, store) {
    return new Promise(function (ok) {
      try {
        var rq = d.transaction(store, 'readonly').objectStore(store).getAll();
        rq.onsuccess = function () { var m = {}; (rq.result || []).forEach(function (r) { if (r && r.k) m[r.k] = r; }); ok(m); };
        rq.onerror = function () { ok(null); };
      } catch (e) { ok(null); }
    });
  }
  /* 全年齢版の移行で R18版の印を写したとき：R18版の置き場（無ければ作らない）から読む */
  function readOther(name, k) {
    return new Promise(function (ok) {
      try {
        var rq = indexedDB.open(name), fresh = false;
        rq.onupgradeneeded = function (e) { if (!e.oldVersion) { fresh = true; try { rq.transaction.abort(); } catch (x) { /* なし */ } } };
        rq.onerror = function (e) { if (e && e.preventDefault) e.preventDefault(); ok(null); };
        rq.onblocked = function () { ok(null); };
        rq.onsuccess = function () {
          var d = rq.result;
          if (fresh || !d.objectStoreNames.contains(ST)) { d.close(); return ok(null); }
          getAll(d, ST).then(function (m) { d.close(); ok(m && m[k] && typeof m[k].text === 'string' ? m[k] : null); });
        };
      } catch (e) { ok(null); }
    });
  }

  /* ---------- 書き込み（いちばん新しい中身だけを、1本ずつ IndexedDB へ） ---------- */
  var pend = {}, busy = false, waiters = [];
  function queue(k) { pend[k] = 1; pump(); }
  function pump() {
    if (busy) return;
    var ks = Object.keys(pend);
    if (!ks.length) { var w = waiters; waiters = []; w.forEach(function (f) { f(); }); return; }
    busy = true; pend = {};
    var at = {}; ks.forEach(function (k) { at[k] = memSeq[k] || 0; });
    open().then(function (d) {
      if (!d) return false;
      return new Promise(function (ok) {
        try {
          var tx = d.transaction(ST, 'readwrite'), os = tx.objectStore(ST);
          ks.forEach(function (k) { if (mem[k] == null) os.delete(k); else os.put({ k: k, text: mem[k], seq: at[k], at: Date.now(), meta: meta[k] || {} }); });
          tx.oncomplete = function () { ok(true); };
          tx.onerror = tx.onabort = function (e) { if (e && e.preventDefault) e.preventDefault(); ok(false); };
        } catch (e) { ok(false); }
      });
    }).then(function (ok) {
      ks.forEach(function (k) { after(k, at[k], ok); });
      busy = false; pump();
    });
  }
  /* IndexedDB に書けたら、localStorage に丸ごと（それより新しいもの）が無いときだけ印を置く。書けなかったら localStorage に丸ごと置いてみる */
  function after(k, s, ok) {
    if (ok) {
      if ((lsSeq[k] || 0) >= s) return;
      if (mem[k] == null) { lsDel(k); return; }
      if (memSeq[k] !== s) return;   /* もっと新しい書き込みが続く（その書き込みのあとで置く） */
      var m = meta[k] || {}, mk = { n: m.n || 0, ties: m.ties || 0, at: m.at || 0, v: m.v || 0, note: '住人・関係はこのブラウザの IndexedDB にあります（' + DB + '）' };
      mk[MARK] = DB;
      if (m.scenId) mk.scenId = m.scenId;
      if (!lsSet(k, JSON.stringify(mk))) lsDel(k);   /* 印も置けないときは、古い丸ごとを残さない（次に開いたとき IndexedDB から読む） */
      return;
    }
    fails++;
    if (mem[k] != null && memSeq[k] === s && (lsSeq[k] || 0) < s && lsSet(k, mem[k])) { lsSeq[k] = s; return; }
    if (k === 'state' && mem[k] != null) toast('住人をブラウザに保存できませんでした（保存領域がいっぱいかもしれません）。「まるごと書き出し」でファイルに残してください');
    if (window.console) console.warn('住人の保存を IndexedDB に書けませんでした：' + k);
  }

  /* 書く（文字列か null＝消す）。HK.store.set と同じく、すぐに true／false を返す（IndexedDB はあとで書き終える） */
  function setText(k, text, obj) {
    if (text != null && typeof text !== 'string') text = JSON.stringify(text);
    if (held[k]) return false;   /* 印のある鍵を IndexedDB から読めていない（待たせられない環境・開けなかった）：上書きしない */
    if (mode !== 'idb') {
      if (text == null) { lsDel(k); emit(k); return true; }
      if (!lsSet(k, text)) return false;
      emit(k);
      return true;
    }
    seq++;
    mem[k] = text; memSeq[k] = seq;
    if (text != null) { var o = obj; if (!o) { try { o = JSON.parse(text); } catch (e) { o = null; } } meta[k] = metaOf(k, o); } else delete meta[k];
    if (text == null) { lsDel(k); lsSeq[k] = seq; flagSet(k, false); }
    else if (text.length <= LS_MAX && lsSet(k, text)) { lsSeq[k] = seq; flagSet(k, false); }
    /* 丸ごと置けないときは、古い丸ごとをすぐ外す（IndexedDB に書き終える前に閉じても、古い丸ごとが新しい保存より優先されないように）。印は書き終えてから */
    else { lsDel(k); flagSet(k, true); }
    queue(k);
    emit(k);
    return true;
  }
  function getText(k) {
    if (mode === 'idb') return mem[k] != null ? mem[k] : null;
    var t = lsGet(k);
    return markerOf(t) ? null : t;
  }
  function get(k, d) { var t = getText(k); if (t == null) return d; try { return JSON.parse(t); } catch (e) { return d; } }
  function flush() {
    if (mode !== 'idb') return Promise.resolve(true);
    return new Promise(function (ok) { waiters.push(function () { ok(true); }); pump(); });
  }
  /* 保存データの消去（reset.js）：住人・控え・退避を IndexedDB と localStorage の両方から消す（保存フォルダのハンドル kv は残す） */
  function clear() {
    BIG.forEach(function (k) { lsDel(k); flagSet(k, false); delete mem[k]; delete meta[k]; });
    if (mode !== 'idb') return Promise.resolve(true);
    return open().then(function (d) {
      if (!d) return true;
      return new Promise(function (ok) { try { var tx = d.transaction(ST, 'readwrite'); tx.objectStore(ST).clear(); tx.oncomplete = function () { ok(true); }; tx.onerror = tx.onabort = function () { ok(false); }; } catch (e) { ok(false); } });
    });
  }
  function kvGet(key) {
    return open().then(function (d) {
      if (!d) return null;
      return new Promise(function (ok) { try { var rq = d.transaction(KV, 'readonly').objectStore(KV).get(key); rq.onsuccess = function () { ok(rq.result || null); }; rq.onerror = function () { ok(null); }; } catch (e) { ok(null); } });
    });
  }
  function kvPut(rec) {
    return open().then(function (d) {
      if (!d) return false;
      return new Promise(function (ok) {
        try {
          var tx = d.transaction(KV, 'readwrite');
          if (rec && rec.del) tx.objectStore(KV).delete(rec.k); else tx.objectStore(KV).put(rec);
          tx.oncomplete = function () { ok(true); }; tx.onerror = tx.onabort = function (e) { if (e && e.preventDefault) e.preventDefault(); ok(false); };
        } catch (e) { ok(false); }
      });
    });
  }

  /* ---------- HK.store の住人の鍵を受け持つ（safe.js が作り直した HK.store の中身を置き換える。参照はそのまま） ---------- */
  var get0 = HK.store.get, set0 = HK.store.set;
  HK.store.get = function (k, d) { return isBig(k) ? get(k, d) : get0.apply(this, arguments); };
  HK.store.set = function (k, v) {
    if (!isBig(k)) { var r = set0.apply(this, arguments); if (r && WATCH[k]) emit(k); return r; }
    var t;
    try { t = JSON.stringify(v); } catch (e) { return false; }
    return setText(k, t === undefined ? null : t, v);
  };

  /* ---------- 起動：IndexedDB を読み終えるまで、後ろのファイルを待たせる ---------- */
  var readyFn, ready = new Promise(function (ok) { readyFn = ok; });
  var L = HK.Load, gate = null;
  function hold() {
    if (!L || typeof L.def !== 'function' || typeof L.done !== 'function' || L.file !== 'js/state-store.js') return false;
    var def0 = L.def, done0 = L.done, q = [];
    L.def = function () { q.push([def0, arguments]); };
    L.done = function () { q.push([done0, arguments]); };
    gate = function () {
      L.def = def0; L.done = done0;
      /* 溜めた順に流す（流している途中のファイルがまた def を呼んでも、元の def なのでその場で動く） */
      q.forEach(function (x) { x[0].apply(L, x[1]); });
      q = [];
    };
    return true;
  }
  function finish(m, keep) {
    mode = m;
    if (!keep) held = {};
    if (gate) { var g = gate; gate = null; g(); }
    readyFn(mode);
  }
  /* 読み込む鍵ごとに決める：localStorage の丸ごと（L）／印（mk）／IndexedDB の記録（R） */
  function resolve(recs) {
    var other = [];
    BIG.forEach(function (k) {
      var t = lsGet(k), mk = markerOf(t), R = recs && recs[k];
      if (t != null && !mk) {
        mem[k] = t; lsSeq[k] = 0;
        if (!R) { memSeq[k] = 0; try { meta[k] = metaOf(k, JSON.parse(t)); } catch (e) { meta[k] = {}; } queue(k); }   /* 旧版からの移行：IndexedDB にも写す */
        else if (R.text === t) { memSeq[k] = R.seq || 0; meta[k] = R.meta || {}; }
        return;
      }
      if (R && typeof R.text === 'string') { mem[k] = R.text; memSeq[k] = R.seq || 0; meta[k] = R.meta || {}; return; }
      if (mk && mk[MARK] && mk[MARK] !== DB) other.push([k, mk[MARK]]);
      else if (mk && window.console) console.warn('住人の保存の印はありますが、IndexedDB に見つかりませんでした：' + k);
    });
    /* 旧版が localStorage の住人を書き換えた（版の印 v が IndexedDB の写しと違う）：IndexedDB の写しを控えにする（ui.js の「控えから戻す」で戻せる） */
    var R = recs && recs.state, t = lsGet('state');
    if (R && typeof R.text === 'string' && t != null && !markerOf(t) && t !== R.text && R.meta && R.meta.n) {
      var lv = 0; try { var lo = JSON.parse(t); lv = lo && lo.v || 0; } catch (e) { lv = -1; }
      var bk = get('state:backup', null);
      if (lv !== R.meta.v && !(bk && bk.at === R.meta.at)) {
        try { var rs = JSON.parse(R.text); mode = 'idb'; setText('state:backup', JSON.stringify({ v: R.meta.v, at: R.meta.at || Date.now(), state: rs })); } catch (e) { /* 写しが読めなければ何もしない */ }
      }
    }
    return Promise.all(other.map(function (x) {
      return readOther(x[1], x[0]).then(function (r) { if (r && mem[x[0]] == null) { mem[x[0]] = r.text; memSeq[x[0]] = 0; meta[x[0]] = r.meta || {}; queue(x[0]); } });
    }));
  }
  (function boot() {
    if (!hasIDB()) { mode = 'ls'; readyFn(mode); return; }
    /* ふつう（localStorage に丸ごとある・何も無い）は待たない：localStorage の中身で動かし、IndexedDB は書くときに開く（旧版からの移行も、起動時の保存で写る）。
       待つのは、印か「IndexedDB にだけある」の目印のある鍵があるときだけ（第3段より画面が約0.2〜0.5秒遅れたため、2026-10-27 に変更） */
    var need = BIG.some(function (k) { return markerOf(lsGet(k)) || flagGet(k); });
    if (!need) {
      mode = 'idb';
      BIG.forEach(function (k) { var t = lsGet(k); if (t != null) { mem[k] = t; memSeq[k] = 0; lsSeq[k] = 0; } });
      readyFn(mode);
      open().then(function (d) { if (!d && mode === 'idb') mode = 'ls'; });
      return;
    }
    var gated = hold();
    if (!gated) {
      /* 待たせられない（js を1本ずつ読む開発中など）：今は localStorage で動かし、印のある鍵は IndexedDB を読み終えるまで書かない */
      BIG.forEach(function (k) { if (markerOf(lsGet(k))) held[k] = 1; });
      if (!Object.keys(held).length) { mode = 'ls'; readyFn(mode); return; }
    }
    mode = 'wait';
    var over = false, timer = setTimeout(function () {
      over = true;
      if (window.console) console.warn('IndexedDB を開けなかったので、住人の保存は localStorage だけを使います');
      idb = false;
      BIG.forEach(function (k) { if (markerOf(lsGet(k))) held[k] = 1; });
      finish('ls', true);
    }, WAIT_MAX);
    /* 待たせられなかったときは、画面はもう localStorage の中身で動いているので、印のある鍵は書かないまま（held を残す。読み込み直すと待たせて読む版で動く） */
    open().then(function (d) {
      if (over) return;
      if (!d) { clearTimeout(timer); finish('ls', !gated); return; }
      return getKeys(d, ST, BIG).then(function (recs) {
        if (over) return;
        mode = 'idb';
        return resolve(recs || {}).then(function () { if (!over) { clearTimeout(timer); finish('idb', !gated); } });
      });
    }).catch(function (e) {
      if (over) return;
      clearTimeout(timer);
      if (window.console) console.error('住人の保存の読み込みでエラー', e);
      finish(idb ? 'idb' : 'ls', !gated);
    });
  })();

  HK.StateStore = {
    DB: DB, STORE: ST, KV: KV, LS_MAX: LS_MAX, MARK: MARK, KEYS: BIG.slice(),
    ready: ready, get: get, getText: getText, setText: setText, flush: flush, clear: clear,
    kvGet: kvGet, kvPut: kvPut, isMarker: function (t) { return !!markerOf(t); },
    /* 点検用：localStorage に丸ごと写す上限（文字数）を変える（Playwright の試験で「印だけ」の形を作るため） */
    setLimit: function (n) { if (n > 0) LS_MAX = n; },
    on: function (fn) { if (typeof fn === 'function') subs.push(fn); },
    info: function () {
      var t = lsGet('state');
      return { mode: mode, db: DB, lsFull: t != null && !markerOf(t), lsMarker: !!markerOf(t), bytes: mem.state ? mem.state.length : (t ? t.length : 0), fails: fails };
    }
  };
})();
