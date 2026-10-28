/* 箱庭シミュレーター: 「これまでの箱庭」（履歴）の結果の置き場
   ・履歴の一覧（日時・箱庭・住人名・シード・短い要約・入力）は、これまでどおり localStorage の history（ui.js）。軽いまま残す
   ・結果そのもの（経過・結末・関係図。セーブと同じく JSON にしたもの）は、ここで IndexedDB に置く。開くときはこれをそのまま表示し、回し直さない
     （2026-10-28：結果の無い履歴＝以前の形式・置けなかったもの・見つからないものは、回し直さずに「開けません」とする。ui.js の histOpen）
     （版の更新・R18／全年齢の切り替え・辞書や口調の変更で、開くたびに内容が変わらないように）
   ・置き場の名前は版ごと（safe.js の HK.STORE）：R18版は hakoniwa-history、全年齢版は hakoniwa-z-history。セーブの DB（hakoniwa-saves）とは別にする
     （セーブの DB の版を上げると、古い版のページがセーブの DB を開けなくなるため）
   ・IndexedDB が使えない環境は localStorage の history:res（{ id: 記録 }）に置く。容量が限られる（住人の保存と分け合う）ので、新しいものから RES_LS 件・合わせて LS_BUDGET 文字まで。
     はみ出した履歴は結果が無くなるので開けない（一覧に「結果なし」と出す）
   ・結果の大きさの目安（住人10人）：合コン 130KB・ゾンビの街 320KB・オメガバース 450KB、一人用は 10〜30KB。IndexedDB では一覧の上限（12件。ui.js の HIST_MAX）まで置く
   ・記録の形：{ id, at, r18, v: 1, result }。r18 は R18モードで動かした結果か（全年齢モード・全年齢版では表示しない。全年齢版の移行・読み込みでも写さない）
   ・全年齢版の初回の移行：safe.js の印の hdb が 'wait' のあいだに、R18版の置き場（hakoniwa-history）から r18 でない記録を一度だけ写す */
(function () {
  'use strict';
  var HK = window.HK;
  if (!HK) return;
  var KS = HK.STORE, K = function (k) { return KS ? KS.key(k) : k; };
  var DB = K('hakoniwa-history'), OLD = 'hakoniwa-history', ST = 'results', VER = 1, LSK = K('hakoniwa:history:res'), RES_LS = 3, LS_BUDGET = 1000000;

  function idbOk() { try { return !!window.indexedDB; } catch (e) { return false; } }
  function lsGet() { try { var o = JSON.parse(window.localStorage.getItem(LSK) || '{}'); return o && typeof o === 'object' && !Array.isArray(o) ? o : {}; } catch (e) { return {}; } }
  function lsSet(o) {
    try { if (Object.keys(o).length) window.localStorage.setItem(LSK, JSON.stringify(o)); else window.localStorage.removeItem(LSK); return true; }
    catch (e) { return false; }
  }

  /* ---------- 開く（無ければ作る）。使えなければ false ---------- */
  var idb = null, opening = null;
  function open() {
    if (idb !== null) return Promise.resolve(idb);
    if (opening) return opening;
    opening = new Promise(function (ok) {
      var done = function (d) { idb = d; opening = null; ok(d); };
      try {
        if (!idbOk()) return done(false);
        var rq = indexedDB.open(DB, VER);
        rq.onupgradeneeded = function () { var d = rq.result; if (!d.objectStoreNames.contains(ST)) d.createObjectStore(ST, { keyPath: 'id' }); };
        rq.onsuccess = function () {
          var d = rq.result;
          /* ほかのタブが版を上げるときは閉じて譲る（次に使うとき開き直す） */
          d.onversionchange = function () { try { d.close(); } catch (e) { /* なし */ } idb = null; };
          migrate(d).then(function () { done(d); });
        };
        rq.onerror = function (e) { if (e && e.preventDefault) e.preventDefault(); done(false); };
        rq.onblocked = function () { done(false); };
      } catch (e) { done(false); }
    });
    return opening;
  }
  /* 全年齢版の初回の移行（safe.js の続き）：R18版の置き場から、r18 でない記録だけを写す。旧い置き場は消さず、無ければ作らない */
  function migrate(d) {
    var f = KS && KS.zenrei && KS.flag();
    if (!f || f.hdb !== 'wait' || OLD === DB) return Promise.resolve();
    var fin = function (n) { KS.setFlag({ hdb: n }); };
    return new Promise(function (ok) {
      try {
        var rq = indexedDB.open(OLD), fresh = false;
        rq.onupgradeneeded = function (e) { if (!e.oldVersion) { fresh = true; try { rq.transaction.abort(); } catch (x) { /* なし */ } } };
        rq.onerror = function (e) { if (e && e.preventDefault) e.preventDefault(); if (fresh) fin(0); ok(); };
        rq.onblocked = function () { ok(); };
        rq.onsuccess = function () {
          var od = rq.result;
          if (fresh || !od.objectStoreNames.contains(ST)) { od.close(); fin(0); return ok(); }
          var g = od.transaction(ST, 'readonly').objectStore(ST).getAll();
          g.onerror = function () { od.close(); ok(); };
          g.onsuccess = function () {
            od.close();
            var list = (g.result || []).filter(function (r) { return r && r.id && r.result && !r.r18; }), n = 0;
            if (!list.length) { fin(0); return ok(); }
            var tx = d.transaction(ST, 'readwrite'), os = tx.objectStore(ST);
            list.forEach(function (r) { var c = os.count(r.id); c.onsuccess = function () { if (!c.result) { os.put(r); n++; } }; });
            tx.oncomplete = function () { fin(n); ok(); };
            /* 入りきらなかったときは写さない（一覧の履歴は残るので、開くと今の版で回し直す）。印は済みにして、毎回やり直さない */
            tx.onerror = tx.onabort = function (e) { if (e && e.preventDefault) e.preventDefault(); fin(-1); ok(); };
          };
        };
      } catch (e) { ok(); }
    });
  }
  function tx(mode, fn) {
    return open().then(function (d) {
      if (!d) return null;
      return new Promise(function (ok) {
        try {
          var t = d.transaction(ST, mode), os = t.objectStore(ST), out = fn(os);
          t.oncomplete = function () { ok(out && 'result' in out && out.readyState ? out.result : true); };
          t.onerror = t.onabort = function (e) { if (e && e.preventDefault) e.preventDefault(); ok(false); };
        } catch (e) { ok(false); }
      });
    });
  }

  /* ---------- 結果の記録を作る ---------- */
  function make(id, res) {
    /* ver：動かしたときの版の印（saves.js の HK.VerMark。ui.js の simulate が res.ver に入れる） */
    var data = JSON.parse(JSON.stringify(res));
    if (!data.ver && HK.VerMark) data.ver = HK.VerMark.now();
    return { id: id, at: Date.now(), v: 1, r18: !HK.SAFE_ON, ver: data.ver || null, result: data };
  }
  /* 置く（新しく足すだけ。同じ id の結果がすでにあれば書き換えずに残す＝保存した結果は保存後に書き換えない。2026-10-28 の決まり）。
     入りきらなければ false（呼ぶ側が「残せなかった」と知らせる） */
  function put(rec) {
    if (!rec || !rec.id || !rec.result) return Promise.resolve(false);
    return tx('readwrite', function (os) { var c = os.count(rec.id); c.onsuccess = function () { if (!c.result) os.put(rec); }; }).then(function (r) {
      if (r !== null) return !!r;
      /* IndexedDB が使えない：localStorage に、新しいものから RES_LS 件まで・合わせて LS_BUDGET 文字まで（住人の保存の場所を残す）。
         入らなければ古いものから落とす。1件だけで超えるなら置かない */
      var o = lsGet(), sz = function (k) { return JSON.stringify(o[k]).length; };
      if (o[rec.id] && o[rec.id].result) return true;
      o[rec.id] = rec;
      if (sz(rec.id) > LS_BUDGET) { delete o[rec.id]; return false; }
      var ids = Object.keys(o).sort(function (a, b) { return (o[b].at || 0) - (o[a].at || 0); }), tot = 0;
      ids.forEach(function (k, i) { tot += sz(k); if (k !== rec.id && (i >= RES_LS || tot > LS_BUDGET)) { tot -= sz(k); delete o[k]; } });
      while (!lsSet(o)) {
        var rest = Object.keys(o).filter(function (k) { return k !== rec.id; }).sort(function (a, b) { return (o[a].at || 0) - (o[b].at || 0); });
        if (!rest.length) { delete o[rec.id]; lsSet(o); return false; }
        delete o[rest[0]];
      }
      return true;
    });
  }
  function get(id) {
    if (!id) return Promise.resolve(null);
    return tx('readonly', function (os) { return os.get(id); }).then(function (r) {
      if (r && typeof r === 'object' && r.result) return r;
      var o = lsGet();
      return o[id] && o[id].result ? o[id] : null;
    });
  }
  function all() {
    return tx('readonly', function (os) { return os.getAll(); }).then(function (r) {
      var out = Array.isArray(r) ? r.slice() : [], o = lsGet(), seen = {};
      out.forEach(function (x) { if (x && x.id) seen[x.id] = 1; });
      Object.keys(o).forEach(function (k) { if (o[k] && o[k].id && !seen[o[k].id]) out.push(o[k]); });
      return out;
    });
  }
  /* 一覧に残っている id 以外を消す（件数の上限からはみ出した履歴の結果） */
  function keep(ids) {
    var want = {}; (ids || []).forEach(function (k) { if (k) want[k] = 1; });
    var o = lsGet(), ch = false;
    Object.keys(o).forEach(function (k) { if (!want[k]) { delete o[k]; ch = true; } });
    if (ch) lsSet(o);
    return tx('readwrite', function (os) {
      var c = os.getAllKeys();
      c.onsuccess = function () { (c.result || []).forEach(function (k) { if (!want[k]) os.delete(k); }); };
    });
  }
  /* すべて消す（保存データの消去・まるごと読み込みの「置き換える」） */
  function clear() {
    try { window.localStorage.removeItem(LSK); } catch (e) { /* 使えない環境 */ }
    return tx('readwrite', function (os) { os.clear(); }).then(function (r) { return r !== false; });
  }

  /* 全年齢版の初回：ページを開いたらすぐ写しておく（あとで R18版に足された履歴の結果まで写さないように） */
  if (KS && KS.zenrei) { var f0 = KS.flag(); if (f0 && f0.hdb === 'wait') open(); }
  HK.History = { DB: DB, STORE: ST, LS: LSK, RES_LS: RES_LS, open: open, make: make, put: put, get: get, all: all, keep: keep, clear: clear };
})();
