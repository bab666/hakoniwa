/* 箱庭シミュレーター: 住人・関係の保存先（HK.StateStore）
   ・住人・関係（HK.store の state）と、その控え（state:backup）・読めなかった保存の退避（state:rescue）を、IndexedDB に置く。
     住人の上限を 1000 人にしたので、localStorage（約5MB。控えと合わせて2倍）では入りきらないため。
   ・IndexedDB の名前は版ごと（safe.js の HK.STORE）：R18版は hakoniwa-state、全年齢版は hakoniwa-z-state。
     store「state」（keyPath k：'state'・'state:backup'・'state:rescue'。{ k, text（JSON の文字列）, seq, at, meta: { v, at, n, ties } }）と、
     store「kv」（保存フォルダのハンドルなど。save-folder.js）。セーブの DB（hakoniwa-saves）とは別にする（版を上げると旧版のページがセーブの DB を開けなくなるため）
   ・localStorage にも今までどおり書く：約1MB（LS_MAX 文字）までは丸ごと。超えたら（または入りきらなければ）、IndexedDB に書き終えてから
     「IndexedDB にある」印 { "hakoniwa-idb": DB の名前, n: 住人の数, ties, at, v, scenId } だけを置く（旧版で開くと住人が空に見えるが、
     旧版が上書きしても、下の「旧版が書き換えた」の照らし合わせで、IndexedDB の写しを控えとして出す。ui.js の「控えから戻す」で戻せる）
   ・読み込み：localStorage に丸ごとあればそれ（IndexedDB と同じ中身か、IndexedDB に書き終える前に閉じたか、旧版が書いたもの＝ふつうはいちばん新しい）。
     印か、何も無ければ IndexedDB。全年齢版の移行（safe.js）で R18版の印を写したときは、印の DB（hakoniwa-state）から読む
   ・localStorage の書き込みが次のページに届かないことがある（Chromium で、開いた直後のページの書き込みが、すぐ読み込み直すと丸ごと見えない。
     2026-10-29 に headless の点検で約1割。IndexedDB には残る）。そのため
     ① IndexedDB へは、書いた処理が終わったらすぐ取引を始めて閉じる（commit）。前の取引の書き終わりを待たない（下の「書き込み」）
     ② localStorage の住人が無いか、サンプルのままなら、IndexedDB を読み終えるまで待ってから決める（初めて開いた人と、書き込みが消えた人だけ待つ）
     ③ 丸ごとがあれば待たずに動かし、裏で IndexedDB と比べる（比べ終わるまでこのページは IndexedDB に書かない）。IndexedDB に
       書いた時刻のほうが localStorage の中身の保存日時（savedAt・at）より新しければ localStorage の書き込みが消えたので、まだ住人を変えていなければ IndexedDB の中身を localStorage に
       戻して読み込み直す（1回だけ）。待って読むとき（②・印のとき）も、同じ決まりで新しいほうを使う
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
  var checking = false, boot0 = null, recovered = '', first = null, dirty = false;   /* ③ 裏で IndexedDB と比べているあいだ（書き込みを待たせる）・起動時の localStorage の中身・戻したか・比べているあいだの最初の住人の保存（起動時の保存）の中身・それと違う保存があったか（利用者が変えた） */
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

  /* ---------- 書き込み（いちばん新しい中身だけを IndexedDB へ。同時に 3 本まで） ----------
     前の取引が書き終わるのを待ってから次を始めると、そのあいだに読み込み直したとき、最後の変更が IndexedDB に届かない（2026-10-29）。
     同じ処理の中の書き込み（ui.js の save の住人と控え）は1つの取引にまとめ、その処理が終わったらすぐ始めて閉じる（commit）。
     IndexedDB は同じ store の読み書きの取引を始めた順に通すので、前の取引を待たない。4 本目からは、どれかが終わるまで溜めて、いちばん新しい中身だけを書く
     （名前の入力のように1文字ごとに保存しても、大きな住人の写しが溜まりすぎないように） */
  var pend = {}, inflight = 0, FLIGHT = 3, waiters = [], sched = false;
  function queue(k) {
    pend[k] = 1;
    if (sched) return;
    sched = true;
    Promise.resolve().then(function () { sched = false; pump(); });
  }
  function pump() {
    if (checking || inflight >= FLIGHT) return;
    var ks = Object.keys(pend);
    if (!ks.length) { if (!inflight) { var w = waiters; waiters = []; w.forEach(function (f) { f(); }); } return; }
    inflight++; pend = {};
    var at = {}; ks.forEach(function (k) { at[k] = memSeq[k] || 0; });
    var write = function (d) {
      if (!d) return false;
      return new Promise(function (ok) {
        try {
          var tx = d.transaction(ST, 'readwrite'), os = tx.objectStore(ST);
          ks.forEach(function (k) { if (mem[k] == null) os.delete(k); else os.put({ k: k, text: mem[k], seq: at[k], at: Date.now(), meta: meta[k] || {} }); });
          tx.oncomplete = function () { ok(true); };
          tx.onerror = tx.onabort = function (e) { if (e && e.preventDefault) e.preventDefault(); ok(false); };
          /* すぐ閉じる（このあと描画などで長く止まっても、読み込み直す前に書き終えるように） */
          if (typeof tx.commit === 'function') try { tx.commit(); } catch (e) { /* 古いブラウザは自動で閉じる */ }
        } catch (e) { ok(false); }
      });
    };
    /* 開いてあれば、その場で取引を始める（open().then だと、呼んだ側の処理が終わるまで始まらない） */
    (idb ? Promise.resolve(write(idb)) : open().then(write)).then(function (ok) {
      ks.forEach(function (k) { after(k, at[k], ok); });
      inflight--; pump();
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
    if (k === 'state' && mem[k] != null && memSeq[k] === s) toast('住人をブラウザに保存できませんでした（保存領域がいっぱいかもしれません）。「まるごと書き出し」でファイルに残してください');
    if (window.console) console.warn('住人の保存を IndexedDB に書けませんでした：' + k);
  }

  /* 書く（文字列か null＝消す）。HK.store.set と同じく、すぐに true／false を返す（IndexedDB はあとで書き終える） */
  function setText(k, text, obj) {
    if (text != null && typeof text !== 'string') text = JSON.stringify(text);
    if (held[k]) return false;   /* 印のある鍵を IndexedDB から読めていない（待たせられない環境・開けなかった）：上書きしない */
    if (recovered === 'reload') return true;   /* ③ で戻して読み込み直す途中：古い住人で書き戻さない（読み込み直すまで、このページの起動時の保存などが続くため） */
    if (mode !== 'idb') {
      if (text == null) { lsDel(k); emit(k); return true; }
      if (!lsSet(k, text)) return false;
      emit(k);
      return true;
    }
    if (checking && k === 'state') { var b = text == null ? '' : body(text); if (first == null) first = b; else if (b !== first) dirty = true; }
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
  function canHold() { return !!(L && typeof L.def === 'function' && typeof L.done === 'function' && L.file === 'js/state-store.js'); }
  function hold() {
    if (!canHold()) return false;
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
  /* IndexedDB の記録 R が localStorage の丸ごと t より新しいか（③）：R を IndexedDB に書いた時刻（R.at。無ければ中身の保存日時）が、
     t の中身の保存日時（state は savedAt、控え・退避は at）より後。IndexedDB へはいつも localStorage と同じ最新の中身を、localStorage の後に書くので、
     後に書かれた R が t と違うのは t への書き込みが消えたときだけ。t に保存日時が無い（旧版が書いた）ときは、今までどおり t を使う
     （旧版は IndexedDB に書かないので、旧版が書き換えた t は、保存日時があれば R より後になる） */
  function atOf(k, text) {
    try { var o = JSON.parse(text); return o && typeof o === 'object' ? +(k === 'state' ? o.savedAt : o.at) || 0 : 0; } catch (e) { return 0; }
  }
  function newer(k, t, R) {
    if (!R || typeof R.text !== 'string' || t == null || markerOf(t) || R.text === t) return false;
    var a = atOf(k, t), b = +R.at || atOf(k, R.text);
    return a > 0 && b > a;
  }
  /* 住人の中身（版の印・保存日時を除く）：このページで住人を変えたかを比べる */
  function body(text) {
    try { var o = JSON.parse(text); if (o && typeof o === 'object') { delete o.v; delete o.savedAt; return JSON.stringify(o); } } catch (e) { /* なし */ }
    return text;
  }
  /* 読み込む鍵ごとに決める：localStorage の丸ごと（L）／印（mk）／IndexedDB の記録（R） */
  function resolve(recs) {
    var other = [];
    BIG.forEach(function (k) {
      var t = lsGet(k), mk = markerOf(t), R = recs && recs[k];
      if (t != null && !mk && newer(k, t, R)) {
        /* localStorage の書き込みが消えていた：IndexedDB の新しいほうを使い、localStorage も直す */
        mem[k] = R.text; memSeq[k] = R.seq || 0; meta[k] = R.meta || {}; recovered = recovered || 'wait';
        if (R.text.length <= LS_MAX && lsSet(k, R.text)) lsSeq[k] = 0; else { lsDel(k); flagSet(k, true); }
        if (window.console) console.warn('住人の保存：localStorage より IndexedDB のほうが新しいので、IndexedDB から読みました：' + k);
        return;
      }
      if (t != null && !mk) {
        mem[k] = t; lsSeq[k] = 0;
        if (!R) { memSeq[k] = 0; try { meta[k] = metaOf(k, JSON.parse(t)); } catch (e) { meta[k] = {}; } queue(k); }   /* 旧版からの移行：IndexedDB にも写す */
        else if (R.text === t) { memSeq[k] = R.seq || 0; meta[k] = R.meta || {}; }
        return;
      }
      if (R && typeof R.text === 'string') { mem[k] = R.text; memSeq[k] = R.seq || 0; meta[k] = R.meta || {}; if (t == null && k === 'state' && !flagGet(k)) recovered = recovered || 'idb'; return; }
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
  /* ③ 待たずに動かしたとき：裏で IndexedDB を読み、localStorage より新しければ（書き込みが消えた）戻して読み込み直す。比べ終わるまで IndexedDB に書かない */
  var RKEY = 'hk-staterecover:' + DB;
  function check() {
    checking = true;
    var end = function () { if (!checking) return; checking = false; clearTimeout(tm); pump(); };
    var tm = setTimeout(end, WAIT_MAX);
    open().then(function (d) {
      if (!d) { if (mode === 'idb') mode = 'ls'; return end(); }
      return getKeys(d, ST, BIG).then(function (recs) {
        if (!checking) return;
        /* 消えた鍵：IndexedDB のほうが新しい、または localStorage に無い（待たせられない開発中の版で、localStorage の住人が丸ごと消えたとき） */
        var lost = function (k) { var R = recs[k]; return boot0[k] == null ? !!(R && typeof R.text === 'string') : newer(k, boot0[k], R); };
        if (!recs || !lost('state')) return end();
        var ks = BIG.filter(lost);
        /* このページで住人を変えていたら（起動時の保存どうしは中身が同じ）、今の中身がいちばん新しいので、そのまま */
        if (dirty) {
          if (window.console) console.warn('住人の保存：IndexedDB に新しい保存がありましたが、このページで住人を変えたので、今の住人を保存します');
          return end();
        }
        var last = 0; try { last = +window.sessionStorage.getItem(RKEY) || 0; } catch (e) { last = 0; }
        if (Date.now() - last < 30000) { if (window.console) console.warn('住人の保存：IndexedDB から戻すのは続けて行いません'); return end(); }
        try { window.sessionStorage.setItem(RKEY, String(Date.now())); } catch (e) { /* なし */ }
        ks.forEach(function (k) {
          var R = recs[k];
          mem[k] = R.text; memSeq[k] = ++seq; meta[k] = R.meta || {};
          if (R.text.length <= LS_MAX && lsSet(k, R.text)) { lsSeq[k] = seq; flagSet(k, false); } else { lsDel(k); flagSet(k, true); }
        });
        recovered = 'reload';
        if (window.console) console.warn('住人の保存：localStorage の書き込みが消えていたので、IndexedDB の新しい保存に戻して読み込み直します：' + ks.join(','));
        location.reload();
      });
    }).catch(function (e) { if (window.console) console.error('住人の保存の照らし合わせでエラー', e); end(); });
  }
  (function boot() {
    if (!hasIDB()) { mode = 'ls'; readyFn(mode); return; }
    /* ふつう（localStorage に丸ごとある・何も無い）は待たない：localStorage の中身で動かし、IndexedDB は書くときに開く（旧版からの移行も、起動時の保存で写る）。
       待つのは、印か「IndexedDB にだけある」の目印のある鍵があるときだけ（第3段より画面が約0.2〜0.5秒遅れたため、2026-10-27 に変更）。
       2026-10-29：住人が無い・サンプルのままのときも待つ（②）。待たないときは裏で比べる（③） */
    var need = BIG.some(function (k) { return markerOf(lsGet(k)) || flagGet(k); });
    /* ② localStorage に住人が無い・サンプルのまま：IndexedDB に利用者の住人が残っているかもしれないので、待たせられるなら待って読む */
    var st0 = lsGet('state'), weak = st0 == null || st0.indexOf('"sample":true') >= 0;
    if (!need && !(weak && canHold())) {
      mode = 'idb';
      boot0 = {};
      BIG.forEach(function (k) { var t = lsGet(k); boot0[k] = t; if (t != null) { mem[k] = t; memSeq[k] = 0; lsSeq[k] = 0; } });
      readyFn(mode);
      check();
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
      return { mode: mode, db: DB, lsFull: t != null && !markerOf(t), lsMarker: !!markerOf(t), bytes: mem.state ? mem.state.length : (t ? t.length : 0), fails: fails, checking: checking, recovered: recovered };
    }
  };
})();
