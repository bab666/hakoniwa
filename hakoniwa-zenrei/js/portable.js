/* 箱庭シミュレーター: 別の端末へ移す（PCで作った設定をスマホで読む。サーバーは使わない）
   ・まるごと書き出し：このブラウザに保存しているもの（localStorage の hakoniwa で始まる鍵すべてと、IndexedDB の hakoniwa で始まるデータベースすべて）を
     1つの JSON（format: 'hakoniwa-all'）にまとめてファイルにする。鍵の一覧は決め打ちせず、その場で列挙する
   ・共有：Web Share API でファイルを送れる端末（iPhone の Safari・Android の Chrome など）では、LINE・メール・ドライブへ。できなければダウンロード
   ・まるごと読み込む：「足す」（セーブは追加、同じ名前の住人は上書きするか確認）か「置き換える」。住人の JSON・セーブの JSON（古い形式）もここから読める
   ・設定を文字列で：住人・関係・環境値・高度設定（セーブ・履歴・アイコンは除く）を短い文字列（hakoniwa1z. 圧縮／hakoniwa1n. 圧縮なし ＋ base64url）にする
   全年齢版では、R18版で保存したセーブと R18 だけの辞書（喘ぎなど）は読み込まない。住人の R18 だけの設定は normState（ui.js）に任せる。
   全年齢／R18 の切り替え（hakoniwa-safe-mode）と R18版のパスワードの印（hakoniwa-r18-unlock）はその端末の設定として、書き出さず、読み込みでも変えない
   保存の鍵は版ごと（safe.js の HK.STORE）：書き出すのはこの版の鍵だけ。読み込むときは、ファイルの鍵（R18版の hakoniwa:… でも全年齢版の hakoniwa-z:… でも、
   分ける前の古いファイルでも）をこの版の鍵に読み替える（own）。全年齢版の移行の印（hakoniwa-z:migrated）も端末ごとの印として書き出さない
   住人・関係（state）・控え・退避は state-store.js（HK.StateStore。IndexedDB の hakoniwa-state）が受け持つ。書き出すときはそこから丸ごと（localStorage に
   「IndexedDB にある」印しか無くても）hakoniwa:state として入れ、読み込むときもそこへ書く。hakoniwa-state の DB そのものは書き出さない（保存フォルダのハンドルも入るため）
   ・複数のファイルをまとめて読み込める（「足す」で順に。同じ名前で設定も同じ住人は飛ばす。進み具合を出す）。保存フォルダ（save-folder.js）からの読み込みも同じ関数（importMany） */
(function () {
  'use strict';
  var HK = window.HK;
  if (!HK || typeof document === 'undefined') return;
  var FMT = 'hakoniwa-all', VER = 1, SFMT = 'hakoniwa-settings', PFX = 'hakoniwa1', LONG = 20000, LINE_MAX = 10000;
  var KS = HK.STORE;
  function K(k) { return KS ? KS.key(k) : k; }                  /* R18版の鍵の名前 → この版の鍵 */
  function mine(k) { return KS ? KS.mine(k) : /^hakoniwa/.test(k); }
  var MSG = K('hakoniwa-portable-msg');              /* 読み込み直したあとに出す知らせ（sessionStorage） */
  /* 書き出さず、読み込みでも変えない鍵（端末ごとの設定）：全年齢／R18 の切り替え、R18版のパスワードを入れた印（pass-gate.js）、全年齢版の移行の印 */
  var KEEP = { 'hakoniwa-safe-mode': 1, 'hakoniwa-r18-unlock': 1 };
  if (KS) { KEEP[KS.FLAG] = 1; KEEP[K('hakoniwa-safe-mode')] = 1; KEEP[K('hakoniwa-r18-unlock')] = 1; }
  var mode = 'add', strOpen = false, strVal = '', lastMsg = '', ready = null;

  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function pad(n) { return ('0' + n).slice(-2); }
  function toast(m) { if (HK.UI && HK.UI.toast) HK.UI.toast(m); else if (HK.toast) HK.toast(m); }
  function say(m) { lastMsg = m; var el = document.getElementById('pt-msg'); if (el) el.textContent = m; toast(m); }
  function clone(o) { return JSON.parse(JSON.stringify(o)); }
  function parse(s) { try { return JSON.parse(s); } catch (e) { return undefined; } }
  function stamp() { var d = new Date(); return d.getFullYear() + pad(d.getMonth() + 1) + pad(d.getDate()); }

  /* ---------- 集める ---------- */
  /* localStorage：値が JSON ならそのまま（読みやすく）、JSON として往復しない値は文字列のまま */
  function lsRaw() {
    var o = {};
    try { var st = window.localStorage; for (var i = 0; i < st.length; i++) { var k = st.key(i); if (k && mine(k)) o[k] = st.getItem(k); } } catch (e) { /* 使えない環境 */ }
    return o;
  }
  function lsPack() {
    var raw = lsRaw(), json = {}, text = {};
    Object.keys(raw).forEach(function (k) { if (KEEP[k]) return; var v = parse(raw[k]); if (v !== undefined && JSON.stringify(v) === raw[k]) json[k] = v; else text[k] = raw[k]; });
    return { json: json, text: text };
  }
  /* IndexedDB：hakoniwa で始まるデータベースを列挙（databases() が無い環境はセーブの DB だけ）。無い DB をうっかり作らない */
  function idbNames() {
    var base = [HK.Saves ? HK.Saves.DB : K('hakoniwa-saves')];
    return new Promise(function (ok) {
      try {
        if (!window.indexedDB || !indexedDB.databases) return ok(base);
        indexedDB.databases().then(function (l) {
          var n = (l || []).map(function (d) { return d && d.name; }).filter(function (x) { return x && mine(x); });
          base.forEach(function (b) { if (n.indexOf(b) < 0) n.push(b); });
          ok(n);
        }, function () { ok(base); });
      } catch (e) { ok(base); }
    });
  }
  function openExisting(name) {
    return new Promise(function (ok) {
      try {
        if (!window.indexedDB) return ok(null);
        var rq = indexedDB.open(name), fresh = false;
        rq.onupgradeneeded = function (e) { if (!e.oldVersion) { fresh = true; try { rq.transaction.abort(); } catch (x) { /* なし */ } } };
        rq.onsuccess = function () { if (fresh) { rq.result.close(); ok(null); } else ok(rq.result); };
        rq.onerror = function (e) { if (e && e.preventDefault) e.preventDefault(); ok(null); };
        rq.onblocked = function () { ok(null); };
      } catch (e) { ok(null); }
    });
  }
  function dumpDB(name) {
    return openExisting(name).then(function (db) {
      if (!db) return null;
      var out = { name: name, version: db.version, stores: {} };
      return Promise.all(Array.prototype.slice.call(db.objectStoreNames).map(function (sn) {
        return new Promise(function (ok) {
          try {
            var os = db.transaction(sn, 'readonly').objectStore(sn), rec = { keyPath: os.keyPath, autoIncrement: !!os.autoIncrement, records: [] };
            var rq = os.getAll();
            rq.onsuccess = function () {
              rec.records = rq.result || [];
              if (os.keyPath != null) { out.stores[sn] = rec; return ok(); }
              var rk = os.getAllKeys();
              rk.onsuccess = function () { rec.keys = rk.result || []; out.stores[sn] = rec; ok(); };
              rk.onerror = function () { ok(); };
            };
            rq.onerror = function () { ok(); };
          } catch (e) { ok(); }
        });
      })).then(function () { try { db.close(); } catch (e) { /* なし */ } return out; });
    });
  }
  /* ファイルの中のセーブ（IndexedDB のセーブの store と、localStorage に置いたセーブ）を、id で重ならないよう一列に */
  function savesOf(data) {
    var out = [], seen = {}, SDB = HK.Saves ? HK.Saves.DB : K('hakoniwa-saves'), SST = HK.Saves ? HK.Saves.STORE : 'saves', SLS = HK.Saves ? HK.Saves.LS : K('hakoniwa:saves');
    var add = function (r) { if (r && r.result && (r.result.log || r.result.ending) && !(r.id && seen[r.id])) { if (r.id) seen[r.id] = 1; out.push(r); } };
    (Array.isArray(data.indexedDB) ? data.indexedDB : []).forEach(function (d) { var s = d && d.name === SDB && d.stores && d.stores[SST]; if (s && Array.isArray(s.records)) s.records.forEach(add); });
    var ls = data.localStorage && data.localStorage[SLS];
    if (Array.isArray(ls)) ls.forEach(add);
    return out;
  }
  function stateOf(data) { var s = data.localStorage && data.localStorage[K('hakoniwa:state')]; return s && typeof s === 'object' ? s : null; }
  function histOf(data) { var h = data.localStorage && data.localStorage[K('hakoniwa:history')]; return Array.isArray(h) ? h : []; }
  /* ファイルの中の履歴の結果（history.js：IndexedDB の hakoniwa-history と、IndexedDB が使えない環境の localStorage の history:res）を id ごとに。
     全年齢版では R18モードで動かした結果は入れない（一覧の履歴は入るので、開くと全年齢版で回し直す） */
  function histResOf(data) {
    var out = {}, HDB = HK.History ? HK.History.DB : K('hakoniwa-history'), HST = HK.History ? HK.History.STORE : 'results', HLS = HK.History ? HK.History.LS : K('hakoniwa:history:res');
    var add = function (r) { if (r && r.id && r.result && typeof r.result === 'object' && !(HK.SAFE_BUILD && r.r18) && !out[r.id]) out[r.id] = r; };
    (Array.isArray(data.indexedDB) ? data.indexedDB : []).forEach(function (d) { var s = d && d.name === HDB && d.stores && d.stores[HST]; if (s && Array.isArray(s.records)) s.records.forEach(add); });
    var ls = data.localStorage && data.localStorage[HLS];
    if (ls && typeof ls === 'object' && !Array.isArray(ls)) Object.keys(ls).forEach(function (k) { add(ls[k]); });
    return out;
  }
  /* 履歴の結果を置く（list の履歴が指すものだけ）。置けなかった・ファイルに無い履歴は、結果を置いた印（r）を外す（開くと今の版で回し直す）。置けた数を返す */
  function putHist(list, res) {
    if (!HK.History) return Promise.resolve(0);
    return Promise.all(list.map(function (h) {
      var r = h && h.id && res[h.id];
      /* 全年齢版で R18モードの結果を入れなかった履歴は、印を残す（開くと「R18版で動かした結果なので回し直した」と知らせる。ui.js の histOpen） */
      if (!r) { if (h && !(HK.SAFE_BUILD && h.r18)) delete h.r; return Promise.resolve(false); }
      return HK.History.put(r).then(function (ok) { if (ok) { h.r = 1; h.r18 = !!r.r18; } else delete h.r; return ok; });
    })).then(function (rs) { return rs.filter(Boolean).length; });
  }
  /* 読み込むファイルの鍵を、この版の鍵に読み替える（R18版のファイルを全年齢版で読む・その逆・分ける前のファイル）。鍵が重なったら、この版の名前のものを優先 */
  function own(data) {
    var conv = function (o) {
      var m = {};
      Object.keys(o || {}).forEach(function (k) { if (/^hakoniwa/.test(k) && !(K(k) in m && k !== K(k))) m[K(k)] = o[k]; });
      return m;
    };
    var d = {}; Object.keys(data).forEach(function (k) { d[k] = data[k]; });
    d.localStorage = conv(data.localStorage); d.localStorageText = conv(data.localStorageText);
    d.indexedDB = (Array.isArray(data.indexedDB) ? data.indexedDB : []).map(function (x) {
      if (!x || typeof x.name !== 'string') return x;
      var y = {}; Object.keys(x).forEach(function (k) { y[k] = x[k]; }); y.name = K(x.name); return y;
    });
    return d;
  }
  function advOf(o) { var a = o && typeof o === 'object' ? o : {}, m = {}; Object.keys(a).forEach(function (k) { if (typeof a[k] === 'string' && a[k] && advOk(k)) m[k] = a[k].slice(0, 20000); }); return m; }
  /* 全年齢版では、この版に節がある辞書だけ（R18版の喘ぎの辞書などは入れない）。
     やめた欄（箱庭全体の口調の辞書 tone。ui-adv.js の RETIRED）は、どちらの版でも書き出さず、読み込まない */
  function advOk(k) { if (HK.Adv && HK.Adv.RETIRED && HK.Adv.RETIRED[k]) return false; return !HK.SAFE_BUILD || !HK.Adv || HK.Adv.secs.some(function (s) { return s.id === k; }); }

  /* 住人のアイコンの置き場（saves.js の HK.IconStore）。まるごと書き出しには DB として入れず、住人の保存（state）の中に戻して書き出す（古い版でも読める形） */
  function iconDb() { return HK.IconStore ? HK.IconStore.DB : K('hakoniwa-icons'); }
  /* 住人の保存の DB（state-store.js）。書き出さず、読み込みでも直接は書かない（hakoniwa:state の鍵として扱う） */
  function stateDb() { return HK.StateStore ? HK.StateStore.DB : K('hakoniwa-state'); }
  function skipDb(n) { return n === iconDb() || n === stateDb(); }
  /* 住人・控え・退避の鍵（短い名前 → この版の鍵）。HK.StateStore が無いとき（古い構成）は空 */
  function bigKeys() { var m = {}; ((HK.StateStore && HK.StateStore.KEYS) || []).forEach(function (k) { m[k] = K('hakoniwa:' + k); }); return m; }
  /* localStorage の中身に、住人・控え・退避を HK.StateStore から丸ごと入れる（localStorage に印しか無くても） */
  function bigPack(ls) {
    var bk = bigKeys();
    Object.keys(bk).forEach(function (k) {
      var fk = bk[k], t = HK.StateStore.getText(k);
      delete ls.json[fk]; delete ls.text[fk];
      if (t == null) return;
      var v = parse(t);
      if (v !== undefined && JSON.stringify(v) === t) ls.json[fk] = v; else ls.text[fk] = t;
    });
    return ls;
  }
  /* まるごと書き出しと同じ形の入れ物（保存フォルダの state.json・saves/・history/ も、この形で書く） */
  function envelope(ls, lsText, dbs, extra) {
    var d = new Date(), o = {
      format: FMT, version: VER, app: 'hakoniwa',
      build: HK.SAFE_BUILD ? 'zenrei' : 'full', mode: HK.SAFE_ON ? 'safe' : 'r18',
      exported: d.toISOString(), exportedLocal: d.getFullYear() + '/' + pad(d.getMonth() + 1) + '/' + pad(d.getDate()) + ' ' + pad(d.getHours()) + ':' + pad(d.getMinutes()),
      localStorage: ls || {}, localStorageText: lsText || {}, indexedDB: dbs || []
    };
    Object.keys(extra || {}).forEach(function (k) { o[k] = extra[k]; });
    return o;
  }
  function collect() {
    return idbNames().then(function (ns) { return Promise.all(ns.filter(function (n) { return !skipDb(n); }).map(dumpDB)); }).then(function (dbs) {
      var ls = lsPack(), d = new Date();
      if (HK.StateStore) bigPack(ls);
      var data = {
        format: FMT, version: VER, app: 'hakoniwa',
        build: HK.SAFE_BUILD ? 'zenrei' : 'full', mode: HK.SAFE_ON ? 'safe' : 'r18',
        exported: d.toISOString(), exportedLocal: d.getFullYear() + '/' + pad(d.getMonth() + 1) + '/' + pad(d.getDate()) + ' ' + pad(d.getHours()) + ':' + pad(d.getMinutes()),
        localStorage: ls.json, localStorageText: ls.text, indexedDB: dbs.filter(Boolean)
      };
      var st = stateOf(data) || {};
      /* アイコン：この画面の住人（置き場から読んだもの）を、同じ id の住人に入れる */
      if (Array.isArray(st.chars) && HK.UI && HK.UI.state) {
        var mem = {}; (HK.UI.state().chars || []).forEach(function (c) { if (c && c.icon) mem[c.id] = c.icon; });
        st.chars.forEach(function (c) { if (c && !c.icon && mem[c.id]) c.icon = mem[c.id]; });
      }
      data.summary = { chars: (st.chars || []).length, ties: (st.ties || []).length, saves: savesOf(data).length, history: histOf(data).length, keys: Object.keys(ls.json).length + Object.keys(ls.text).length };
      var text = JSON.stringify(data);
      return { data: data, text: text, name: 'hakoniwa-全部-' + stamp() + '.json' };
    });
  }
  function sumText(s) { return '住人' + (s.chars || 0) + '人・関係' + (s.ties || 0) + '本・セーブ' + (s.saves || 0) + '件・履歴' + (s.history || 0) + '件'; }
  function mb(n) { return n >= 1048576 ? (n / 1048576).toFixed(1) + 'MB' : Math.max(1, Math.round(n / 1024)) + 'KB'; }

  /* ---------- 書き出す・共有する ---------- */
  function download(pack) {
    try {
      var blob = new Blob([pack.text], { type: 'application/json' }), url = URL.createObjectURL(blob), a = document.createElement('a');
      if ('download' in a) { a.href = url; a.download = pack.name; document.body.appendChild(a); a.click(); a.remove(); }
      else window.open(url, '_blank');
      setTimeout(function () { URL.revokeObjectURL(url); }, 60000);
      return true;
    } catch (e) { return false; }
  }
  function exportFile() {
    say('書き出しの準備をしています…');
    collect().then(function (p) {
      if (download(p)) say('「' + p.name + '」に書き出しました（' + sumText(p.data.summary) + '、' + mb(new Blob([p.text]).size) + '）。スマホへはLINE・メール・ドライブなどで送り、スマホの「まるごと読み込む」で読み込んでください');
      else say('このブラウザではファイルを保存できませんでした');
    }, function () { say('書き出せませんでした'); });
  }
  function fileOf(p) { try { return new File([p.text], p.name, { type: 'application/json' }); } catch (e) { return null; } }
  function canShare(f) { try { return !!(f && navigator.share && navigator.canShare && navigator.canShare({ files: [f] })); } catch (e) { return false; } }
  function shareNow(p) {
    var f = fileOf(p);
    if (!canShare(f)) {
      if (download(p)) say('この端末ではファイルの共有が使えないので、「' + p.name + '」として保存しました（' + sumText(p.data.summary) + '）');
      else say('このブラウザではファイルを保存できませんでした');
      return;
    }
    navigator.share({ files: [f], title: '箱庭シミュレーターのデータ' }).then(function () {
      say('共有しました（' + sumText(p.data.summary) + '）。受け取った端末で「まるごと読み込む」から読み込んでください');
    }, function (e) {
      var n = e && e.name;
      if (n === 'AbortError') { say('共有をやめました'); return; }
      /* 準備に時間がかかり、押した操作の扱いが切れたとき（Safari など）：作ったファイルを持っておき、もう一度押してもらう */
      if (n === 'NotAllowedError') { ready = { p: p, at: Date.now() }; say('共有の準備ができました。もう一度「共有」を押してください'); return; }
      if (download(p)) say('共有できなかったので、「' + p.name + '」として保存しました');
      else say('共有できませんでした');
    });
  }
  function share() {
    if (ready && Date.now() - ready.at < 120000) { var p = ready.p; ready = null; shareNow(p); return; }
    ready = null;
    say('共有の準備をしています…');
    collect().then(shareNow, function () { say('書き出せませんでした'); });
  }

  /* ---------- 書き込む道具 ---------- */
  /* localStorage に書く。wipe なら hakoniwa で始まる鍵を先に消す（KEEP は残す）。一つでも書けなければ、元に戻して false */
  function writeLS(map, wipe) {
    var st, snap = lsRaw(), bad = false;
    try { st = window.localStorage; } catch (e) { return false; }
    try {
      if (wipe) Object.keys(snap).forEach(function (k) { if (!KEEP[k]) st.removeItem(k); });
      Object.keys(map).forEach(function (k) { if (KEEP[k]) return; if (map[k] == null) st.removeItem(k); else st.setItem(k, map[k]); });
    } catch (e) { bad = true; }
    if (bad) {
      try { Object.keys(lsRaw()).forEach(function (k) { st.removeItem(k); }); Object.keys(snap).forEach(function (k) { st.setItem(k, snap[k]); }); } catch (e) { /* 戻せる範囲で */ }
      return false;
    }
    return true;
  }
  /* writeLS ＋ 住人・控え・退避（HK.StateStore）：map の住人の鍵は HK.StateStore に書く（wipe なら map に無い住人の鍵は消す）。
     どれか書けなければ、localStorage と住人の保存を元に戻して false */
  function writeAll(map, wipe) {
    var SS = HK.StateStore;
    if (!SS) return writeLS(map, wipe);
    var bk = bigKeys(), big = {}, m2 = {};
    Object.keys(map).forEach(function (k) { m2[k] = map[k]; });
    Object.keys(bk).forEach(function (k) { var fk = bk[k]; if (fk in m2) { big[k] = m2[fk]; delete m2[fk]; } else if (wipe) big[k] = null; });
    var snap = lsRaw(), prev = {};
    Object.keys(big).forEach(function (k) { prev[k] = SS.getText(k); });
    if (!writeLS(m2, wipe)) return false;
    var bad = Object.keys(big).some(function (k) { return !SS.setText(k, big[k]); });
    if (!bad) return true;
    try { var st = window.localStorage; Object.keys(lsRaw()).forEach(function (k) { if (!KEEP[k]) st.removeItem(k); }); Object.keys(snap).forEach(function (k) { if (!KEEP[k]) st.setItem(k, snap[k]); }); } catch (e) { /* 戻せる範囲で */ }
    Object.keys(prev).forEach(function (k) { SS.setText(k, prev[k]); });
    return false;
  }
  /* セーブと履歴の結果（history.js。上の putHist で入れる）以外の IndexedDB（今はない。増えたときのため）：ある store にだけ入れる */
  function putOther(dbs, wipe) {
    var SDB = HK.Saves ? HK.Saves.DB : K('hakoniwa-saves'), HDB = HK.History ? HK.History.DB : K('hakoniwa-history');
    return Promise.all((dbs || []).filter(function (d) { return d && d.name && d.name !== SDB && d.name !== HDB && !skipDb(d.name) && mine(d.name) && d.stores; }).map(function (d) {
      return openExisting(d.name).then(function (db) {
        if (!db) return 0;
        var names = Object.keys(d.stores).filter(function (sn) { return db.objectStoreNames.contains(sn); });
        if (!names.length) { db.close(); return 0; }
        return new Promise(function (ok) {
          try {
            var tx = db.transaction(names, 'readwrite');
            names.forEach(function (sn) {
              var os = tx.objectStore(sn), s = d.stores[sn];
              if (wipe) os.clear();
              (s.records || []).forEach(function (r, i) { if (os.keyPath == null && s.keys) os.put(r, s.keys[i]); else os.put(r); });
            });
            tx.oncomplete = function () { db.close(); ok(1); };
            tx.onerror = tx.onabort = function () { db.close(); ok(0); };
          } catch (e) { try { db.close(); } catch (x) { /* なし */ } ok(0); }
        });
      });
    }));
  }
  /* 書き込む localStorage の中身（鍵 → JSON の文字列）の住人の保存・控えからアイコンを外し、アイコンの置き場（HK.IconStore）を入れ替える。
     置き場が使えない・置けないときは、住人の保存に入れたまま（従来どおり）。map を書き換える */
  function iconsOut(map) {
    var SK = K('hakoniwa:state'), BK = K('hakoniwa:state:backup');
    if (!HK.IconStore || map[SK] == null) return Promise.resolve(false);
    var sp = HK.IconStore.split(map[SK]);
    if (!sp.state) return Promise.resolve(false);
    return HK.IconStore.replaceAll(sp.icons, true).then(function (ok) {
      if (!ok) return false;
      map[SK] = JSON.stringify(sp.state);
      var bk = map[BK] != null ? parse(map[BK]) : null;
      if (bk && bk.state) { bk.state = HK.IconStore.split(bk.state).state; map[BK] = JSON.stringify(bk); }
      return true;
    });
  }
  /* 読み込めなかったとき：アイコンの置き場を、この画面の住人のアイコンに戻す */
  function iconsBack() {
    if (!HK.IconStore || !HK.UI || !HK.UI.state) return;
    var m = {}; (HK.UI.state().chars || []).forEach(function (c) { if (c && c.icon) m[c.id] = c.icon; });
    HK.IconStore.replaceAll(m);
  }
  function putSaves(list) {
    if (!HK.Saves || !list.length) return Promise.resolve(0);
    return Promise.all(list.map(function (r) { return HK.Saves.put(r); })).then(function (rs) { return rs.filter(Boolean).length; });
  }
  function reload(msg) {
    try { window.sessionStorage.setItem(MSG, msg); } catch (e) { /* 知らせは出せなくてもよい */ }
    /* 住人の保存（IndexedDB。state-store.js）を書き終えてから読み込み直す */
    var go = function () { setTimeout(function () { location.reload(); }, 300); };
    if (HK.StateStore && HK.StateStore.flush) HK.StateStore.flush().then(go, go); else go();
  }
  /* 全年齢版：R18版（R18モード）で保存したセーブは入れない */
  function safeSaves(list) { return HK.SAFE_BUILD ? list.filter(function (r) { return !r.r18; }) : list; }

  /* 住人・関係を「足す」：読み込む状態を normState で整え、住人の JSON（rosterJSON）にして ui.js の importJSON（追加）へ。
     同じ名前で設定もすべて同じ住人（アイコン・登録順は見ない）は飛ばす（関係は名前でつなぐ）。同じ名前で設定が違う住人は上書きするか確認し、
     残すときは、その人との関係・固定・呼び方を名前でつなぐ（rosterJSON の only）。ctx（複数のファイル）があれば、確認の答えを次のファイルにも使う */
  function fpOf(c, St) {
    var o = HK.UI.rosterJSON([c.id], St).chars[0] || {};
    delete o.reg; delete o.icon;
    return JSON.stringify(o);
  }
  function addRoster(st0, ctx) {
    var UI = HK.UI;
    if (!st0 || !UI || !UI.normState || !UI.rosterJSON || !UI.importJSON) return { n: 0, over: 0 };
    var St = UI.normState(clone(st0));
    if (!St.chars.length) return { n: 0, over: 0 };
    var cur = UI.state(), byName = {}, curFp = {};
    if (!cur.sample) cur.chars.forEach(function (c) { (byName[c.name] = byName[c.name] || []).push(c); });
    var same = [], dup = [];
    St.chars.forEach(function (c) {
      var hs = byName[c.name];
      if (!hs) return;
      var f = fpOf(c, St);
      if (hs.some(function (h) { if (!(h.id in curFp)) curFp[h.id] = fpOf(h, cur); return curFp[h.id] === f; })) same.push(c.id); else dup.push(c);
    });
    var over = true;
    if (dup.length) {
      if (ctx && ctx.dupAns != null) over = ctx.dupAns;
      else {
        over = window.confirm('同じ名前の住人が' + dup.length + '人います（' + dup.slice(0, 8).map(function (c) { return c.name; }).join('・') + (dup.length > 8 ? 'ほか' : '') + '）。\n読み込むもので上書きしますか？' + (ctx && ctx.multi ? '（このあとのファイルも同じにします）' : '') + '\n\n［OK］上書きする\n［キャンセル］今の住人をそのまま残す（関係は名前でつなぎます）');
        if (ctx) ctx.dupAns = over;
      }
    }
    var skip = {};
    same.forEach(function (id) { skip[id] = 1; });
    if (!over) dup.forEach(function (c) { skip[c.id] = 1; });
    var ids = St.chars.filter(function (c) { return !skip[c.id]; }).map(function (c) { return c.id; });
    var res = { n: 0, over: 0, kept: over ? 0 : dup.length, same: same.length };
    if (!ids.length) return res;
    var ros = UI.rosterJSON(ids.length === St.chars.length ? null : ids, St);
    delete ros.ct; delete ros.adv;                     /* 内容のスイッチ・辞書は今のものを残す（辞書は下で別に聞く） */
    UI.importJSON(JSON.stringify(ros), false);
    res.n = ros.chars.length; res.over = over ? dup.length : 0;
    return res;
  }
  /* 高度設定の辞書を「足す」：今が空の欄は入れ、違う中身があれば置き換えるか聞く（ctx があれば答えを次のファイルにも使う） */
  function addAdv(adv, ctx) {
    if (!HK.Adv) return 0;
    var keys = Object.keys(adv), diff = keys.filter(function (k) { return HK.Adv.get(k) && HK.Adv.get(k) !== adv[k]; }), n = 0;
    var rep = false;
    if (diff.length) {
      if (ctx && ctx.advAns != null) rep = ctx.advAns;
      else { rep = window.confirm('高度設定の辞書の中身が、今のものと読み込むもので違います。\n読み込むものに置き換えますか？' + (ctx && ctx.multi ? '（このあとのファイルも同じにします）' : '') + '\n\n［OK］置き換える\n［キャンセル］今のものを残す'); if (ctx) ctx.advAns = rep; }
    }
    keys.forEach(function (k) { if (!HK.Adv.get(k) || (rep && diff.indexOf(k) >= 0)) { if (HK.Adv.get(k) !== adv[k]) { HK.Adv.set(k, adv[k], true); n++; } } });
    return n;
  }

  /* ---------- まるごと読み込む ---------- */
  function importAll(data, how, label) {
    data = own(data);
    var st = stateOf(data) || {}, saves = savesOf(data), sv = safeSaves(saves), drop = saves.length - sv.length, hist = histOf(data);
    var from = (data.exportedLocal || data.exported || '') + (data.build === 'zenrei' ? '（全年齢版）' : data.build === 'full' ? '（R18版）' : '');
    var what = '住人' + (st.chars || []).length + '人・関係' + (st.ties || []).length + '本・セーブ' + sv.length + '件・履歴' + hist.length + '件';
    if (how === 'rep') {
      if (!window.confirm(from + ' に書き出したデータ（' + what + '）で、このブラウザの住人・関係・設定・セーブ・履歴・辞書をすべて置き換えます。\n今のデータは消えます（元に戻せません）。よろしいですか？')) { say('読み込みをやめました'); return false; }
      /* 履歴の結果の localStorage の置き場（history.js）は、下の putHist で入れ直す（全年齢版では R18モードの結果を入れない） */
      var map = {}, SLS = HK.Saves ? HK.Saves.LS : K('hakoniwa:saves'), AK = K('hakoniwa:adv'), HLS = HK.History ? HK.History.LS : K('hakoniwa:history:res');
      Object.keys(data.localStorage || {}).forEach(function (k) { if (mine(k) && k !== SLS && k !== HLS) map[k] = JSON.stringify(data.localStorage[k]); });
      Object.keys(data.localStorageText || {}).forEach(function (k) { if (mine(k) && k !== SLS && k !== HLS && typeof data.localStorageText[k] === 'string') map[k] = data.localStorageText[k]; });
      if (HK.SAFE_BUILD && map[AK]) map[AK] = JSON.stringify(advOf(parse(map[AK])));
      var hl = hist.filter(function (h) { return h && h.input; }), hm = 0;
      iconsOut(map).then(function () {
        if (!writeAll(map, true)) { iconsBack(); say('ブラウザの保存領域に入りきらず、読み込めませんでした（今のデータはそのままです）'); return; }
        return (HK.Saves ? HK.Saves.clear() : Promise.resolve(true)).then(function () { return putSaves(sv); }).then(function (n) {
        /* 履歴の結果：今のものを消してから、ファイルの一覧が指すものを入れ、置けたかどうかの印を一覧に書き戻す */
        var want = hl.filter(function (h) { return h.id && h.r && !(HK.SAFE_BUILD && h.r18); }).length;
        return (HK.History ? HK.History.clear() : Promise.resolve(true)).then(function () { return putHist(hl, histResOf(data)); }).then(function (m) {
          hm = want - m;
          if (hl.length) HK.store.set('history', hl);
          return n;
        });
      }).then(function (n) {
        return putOther(data.indexedDB, true).then(function () {
          reload((label || 'まるごと読み込みました（置き換え）') + '：' + what.replace(/セーブ\d+件/, 'セーブ' + n + '件') + (n < sv.length ? '（セーブ' + (sv.length - n) + '件は保存しきれませんでした）' : '') + (hm > 0 ? '（履歴' + hm + '件は結果を読み込めなかったので、開くと今の版で回し直します）' : '') + (drop ? '。R18版で保存したセーブ' + drop + '件は、全年齢版では読み込みません' : ''));
        });
      });
      });
      return true;
    }
    /* 足す */
    var ctx = addStart();
    addPart(data, ctx, true);
    addFinish(ctx).then(function (msg) { reload('まるごと読み込みました（足す）：' + msg); });
  }
  /* 「足す」を1つ以上のファイルで：addStart → ファイルごとに addPart → addFinish（履歴・セーブはまとめて入れる） */
  function addStart(multi) { return { multi: !!multi, files: 0, n: 0, over: 0, kept: 0, same: 0, na: 0, hist: [], res: {}, saves: [], sid: {}, drop: 0, dbs: [], dupAns: null, advAns: null }; }
  function addPart(data, ctx, owned) {
    if (!owned) data = own(data);
    var st = stateOf(data), saves = savesOf(data), sv = safeSaves(saves);
    ctx.drop += saves.length - sv.length;
    if (st) { var r = addRoster(st, ctx); ctx.n += r.n; ctx.over += r.over || 0; ctx.kept += r.kept || 0; ctx.same += r.same || 0; }
    ctx.na += addAdv(advOf(data.localStorage && data.localStorage[K('hakoniwa:adv')]), ctx);
    histOf(data).forEach(function (h) { ctx.hist.push(h); });
    var hr = histResOf(data);
    Object.keys(hr).forEach(function (k) { if (!ctx.res[k]) ctx.res[k] = hr[k]; });
    sv.forEach(function (x) { if (x.id && ctx.sid[x.id]) return; if (x.id) ctx.sid[x.id] = 1; ctx.saves.push(x); });
    ctx.dbs = ctx.dbs.concat(Array.isArray(data.indexedDB) ? data.indexedDB : []);
    ctx.files++;
  }
  function addFinish(ctx) {
    /* 履歴：重ならないものを足して、新しい順に12件。足した履歴の結果も入れる（一覧からはみ出した履歴の結果は消す） */
    var cur = HK.store.get('history', []), key = function (h) { return [h.t, h.seed, h.names, h.input && h.input.scenId].join('|'); };
    if (!Array.isArray(cur)) cur = [];
    var ks = cur.map(key), hn = 0, added = [];
    /* 箱庭がこの版にあるか：まだ読んでいない箱庭（分割読み込み）は目録の仮の箱庭（load.js の HK.Load.info）で見る */
    var scenOk = function (id) { return !!(HK.SCENARIOS[id] || (HK.Load && HK.Load.info && HK.Load.info(id))); };
    ctx.hist.forEach(function (h) { if (h && h.input && scenOk(h.input.scenId) && ks.indexOf(key(h)) < 0) { cur.push(h); added.push(h); ks.push(key(h)); hn++; } });
    cur.sort(function (a, b) { return (b.t || 0) - (a.t || 0); });
    cur = cur.slice(0, 12);
    added = added.filter(function (h) { return cur.indexOf(h) >= 0; });
    var sv = ctx.saves;
    return putHist(added, hn ? ctx.res : {}).then(function () {
      if (hn && HK.store.set('history', cur) && HK.History) return HK.History.keep(cur.map(function (h) { return h.id; }));
    }).then(function () { return HK.Saves ? HK.Saves.all() : []; }).then(function (list) {
      var ids = {}; list.forEach(function (x) { ids[x.id] = 1; });
      var nw = sv.filter(function (x) { return !(x.id && ids[x.id]); });
      return putSaves(nw).then(function (n) {
        return putOther(ctx.dbs, false).then(function () {
          var parts = [];
          parts.push('住人' + ctx.n + '人' + (ctx.over ? '（うち同じ名前の' + ctx.over + '人を上書き）' : '') + (ctx.kept ? '・同じ名前の' + ctx.kept + '人は今のまま' : '') + (ctx.same ? '・同じ住人' + ctx.same + '人は省略' : ''));
          parts.push('セーブ' + n + '件を追加' + (sv.length - nw.length ? '（同じセーブ' + (sv.length - nw.length) + '件は省略）' : ''));
          parts.push('履歴' + hn + '件');
          if (ctx.na) parts.push('辞書' + ctx.na + '件');
          return parts.join('・') + (ctx.drop ? '。R18版で保存したセーブ' + ctx.drop + '件は、全年齢版では読み込みません' : '');
        });
      });
    });
  }
  /* ---------- 複数のファイルをまとめて読み込む ----------
     items：[{ name, text }]。how：'add'（順に「足す」。同じ名前で設定も同じ住人は飛ばす）／'rep'（1つにまとめてから置き換える。保存フォルダの読み込み）。
     まるごと（hakoniwa-all。保存フォルダの state.json・saves/・history/ も同じ形）・設定（hakoniwa-settings）・住人の JSON・セーブの JSON を読める。
     opt.label：終わったときの知らせの頭（既定は「Nこのファイルをまとめて読み込みました」） */
  var isSaveRec = function (r) { return r && typeof r === 'object' && r.result && (r.result.log || r.result.ending); };
  function sid() { return 's' + Date.now().toString(36) + Math.random().toString(36).slice(2, 7); }
  function addItem(d, ctx) {
    if (d.format === FMT) { addPart(d, ctx); return; }
    if (d.f === SFMT) {
      if (d.state && typeof d.state === 'object') { var r = addRoster(d.state, ctx); ctx.n += r.n; ctx.over += r.over || 0; ctx.kept += r.kept || 0; ctx.same += r.same || 0; }
      ctx.na += addAdv(advOf(d.adv), ctx); ctx.files++; return;
    }
    var arr = Array.isArray(d) && d.length && d.every(isSaveRec) ? d : Array.isArray(d.saves) ? d.saves : isSaveRec(d) ? [d] : null;
    if (arr) {
      /* セーブの JSON（saves.js の書き出し）：saves.js の読み込みと同じ形に整える */
      var sv = safeSaves(arr.filter(isSaveRec).map(function (x) {
        return { id: x.id || sid(), at: x.at || Date.now(), v: 1, app: 'hakoniwa', name: x.name || '', scenId: x.scenId || (x.result.input || {}).scenId, scenName: x.scenName || '', names: x.names || '', seed: x.seed, title: x.title || '', memo: x.memo || '', r18: x.r18 !== false, result: x.result };
      }));
      ctx.drop += arr.filter(isSaveRec).length - sv.length;
      sv.forEach(function (x) { if (ctx.sid[x.id]) return; ctx.sid[x.id] = 1; ctx.saves.push(x); });
      ctx.files++; return;
    }
    if (Array.isArray(d.chars) || Array.isArray(d)) {
      var n0 = HK.UI.state().chars.length;
      HK.UI.importJSON(JSON.stringify(d), false);
      ctx.n += Math.max(0, HK.UI.state().chars.length - n0); ctx.files++; return;
    }
    throw new Error('unknown');
  }
  /* 保存フォルダの読み込み（置き換える）：state.json（住人・関係・設定）と saves/・history/ のファイルを、まるごと書き出し1つの形にまとめる */
  function mergeAll(datas) {
    var ds = datas.filter(function (d) { return d && d.format === FMT; }).map(own);
    if (!ds.length) return null;
    var base = ds.filter(function (d) { return stateOf(d); })[0] || ds[0];
    var SDB = HK.Saves ? HK.Saves.DB : K('hakoniwa-saves'), SST = HK.Saves ? HK.Saves.STORE : 'saves', SLS = HK.Saves ? HK.Saves.LS : K('hakoniwa:saves');
    var HDB = HK.History ? HK.History.DB : K('hakoniwa-history'), HST = HK.History ? HK.History.STORE : 'results', HLS = HK.History ? HK.History.LS : K('hakoniwa:history:res');
    var ls = clone(base.localStorage || {}), lst = clone(base.localStorageText || {}), hl = [], hseen = {}, saves = [], seen = {}, res = {};
    ds.forEach(function (d) {
      histOf(d).forEach(function (h) { var k = h && (h.id || [h.t, h.seed, h.names].join('|')); if (h && !hseen[k]) { hseen[k] = 1; hl.push(h); } });
      savesOf(d).forEach(function (r) { if (r.id && seen[r.id]) return; if (r.id) seen[r.id] = 1; saves.push(r); });
      var hr = histResOf(d); Object.keys(hr).forEach(function (k) { if (!res[k]) res[k] = hr[k]; });
    });
    hl.sort(function (a, b) { return (b.t || 0) - (a.t || 0); });
    delete ls[SLS]; delete ls[HLS];
    if (hl.length) ls[K('hakoniwa:history')] = hl.slice(0, 12);
    var dbs = [{ name: SDB, version: 1, stores: {} }, { name: HDB, version: 1, stores: {} }];
    dbs[0].stores[SST] = { keyPath: 'id', autoIncrement: false, records: saves };
    dbs[1].stores[HST] = { keyPath: 'id', autoIncrement: false, records: Object.keys(res).map(function (k) { return res[k]; }) };
    return envelope(ls, lst, dbs, { build: base.build, mode: base.mode, exported: base.exported, exportedLocal: base.exportedLocal });
  }
  function importMany(items, how, opt) {
    opt = opt || {};
    var list = [], bad = [];
    (items || []).forEach(function (it) {
      var d = it && it.data !== undefined ? it.data : parse(String((it && it.text) || '').replace(/^\uFEFF/, ''));
      if (!d || typeof d !== 'object') bad.push(it && it.name || '?'); else list.push({ name: (it && it.name) || '', data: d });
    });
    var badNote = function () { return bad.length ? '。読めなかったファイル' + bad.length + '個（' + bad.slice(0, 3).join('・') + (bad.length > 3 ? 'ほか' : '') + '）' : ''; };
    if (!list.length) { say('読み込めるファイルがありませんでした' + badNote()); return Promise.resolve(false); }
    if (how === 'rep') {
      var m = mergeAll(list.map(function (x) { return x.data; }));
      if (!m) { say('まるごと書き出しの形のファイルが見つかりませんでした'); return Promise.resolve(false); }
      return Promise.resolve(importAll(m, 'rep', opt.label) !== false);
    }
    var ctx = addStart(list.length > 1), i = 0;
    return new Promise(function (done) {
      function step() {
        if (i >= list.length) {
          say('仕上げています…（' + list.length + '/' + list.length + '）');
          addFinish(ctx).then(function (msg) {
            reload((opt.label || (list.length > 1 ? list.length + '個のファイルをまとめて読み込みました（足す）' : 'まるごと読み込みました（足す）')) + '：' + msg + badNote());
            done(true);
          }, function () { say('読み込みの途中でエラーが起きました'); done(false); });
          return;
        }
        var it = list[i++];
        say('読み込んでいます… ' + i + '/' + list.length + (it.name ? '：' + it.name : ''));
        setTimeout(function () {
          try { addItem(it.data, ctx); } catch (e) { bad.push(it.name || String(i)); if (window.console && e && e.message !== 'unknown') console.error(e); }
          step();
        }, 20);
      }
      step();
    });
  }
  /* 選んだファイル（1つ以上）を読む。1つなら今までどおり（まるごと・設定・住人・セーブの振り分け）、2つ以上なら「足す」で順に */
  function readFiles(files) {
    files = Array.prototype.slice.call(files || []);
    if (!files.length) return;
    var big = files.filter(function (f) { return f.size > 200 * 1024 * 1024; });
    if (big.length) { say('ファイルが大きすぎます（1つ200MBまで）：' + big.map(function (f) { return f.name; }).join('・')); return; }
    var readOne = function (f) {
      return new Promise(function (ok) {
        var rd = new FileReader();
        rd.onload = function () { ok({ name: f.name, text: String(rd.result || '') }); };
        rd.onerror = function () { ok({ name: f.name, text: '' }); };
        rd.readAsText(f, 'utf-8');
      });
    };
    if (files.length === 1) { readOne(files[0]).then(function (it) { if (!it.text) say('ファイルを読み込めませんでした'); else importText(it.text, mode); }); return; }
    if (mode === 'rep' && !window.confirm('ファイルを' + files.length + '個選びました。複数のファイルは「足す」で順に読み込みます（置き換えはしません）。よろしいですか？')) { say('読み込みをやめました'); return; }
    say(files.length + '個のファイルを開いています…');
    Promise.all(files.map(readOne)).then(function (items) { importMany(items, 'add'); });
  }
  /* ファイル・貼り付けた JSON の振り分け：まるごと／設定の文字列の中身／住人の JSON（古い形式）／セーブの JSON */
  function importText(text, how) {
    var data = parse(String(text || '').replace(/^﻿/, ''));
    if (data === undefined) { say('JSONとして読めませんでした'); return; }
    if (data && data.format === FMT) { importAll(data, how); return; }
    if (data && data.f === SFMT) { importSettings(data, how); return; }
    var isSave = function (r) { return r && r.result && (r.result.log || r.result.ending); };
    if (data && (Array.isArray(data.saves) || isSave(data) || (Array.isArray(data) && data.length && data.every(isSave)))) { if (HK.Saves) HK.Saves.importText(text); say('セーブデータのJSONとして読み込みました（「セーブ」タブで見られます）'); return; }
    if (data && (Array.isArray(data.chars) || Array.isArray(data))) {
      if (how === 'rep' && !window.confirm('住人のJSONで、今の住人と関係を置き換えます。よろしいですか？')) { say('読み込みをやめました'); return; }
      HK.UI.importJSON(text, how === 'rep'); return;
    }
    say('箱庭のデータが見つかりませんでした');
  }

  /* ---------- 設定だけの短い文字列 ---------- */
  function b64u(bytes) {
    var s = '', CH = 0x8000;
    for (var i = 0; i < bytes.length; i += CH) s += String.fromCharCode.apply(null, bytes.subarray(i, i + CH));
    return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  }
  function unb64u(s) {
    s = s.replace(/-/g, '+').replace(/_/g, '/'); while (s.length % 4) s += '=';
    var b = atob(s), u = new Uint8Array(b.length);
    for (var i = 0; i < b.length; i++) u[i] = b.charCodeAt(i);
    return u;
  }
  function utf8(s) { if (window.TextEncoder) return new TextEncoder().encode(s); var b = unescape(encodeURIComponent(s)), u = new Uint8Array(b.length); for (var i = 0; i < b.length; i++) u[i] = b.charCodeAt(i); return u; }
  function deutf8(u) { if (window.TextDecoder) return new TextDecoder().decode(u); var s = ''; for (var i = 0; i < u.length; i++) s += String.fromCharCode(u[i]); return decodeURIComponent(escape(s)); }
  function through(bytes, Kind) { return new Response(new Blob([bytes]).stream().pipeThrough(new Kind('deflate-raw'))).arrayBuffer().then(function (b) { return new Uint8Array(b); }); }
  /* 住人・関係・環境値・高度設定。アイコン（画像）は長くなるので入れない（読み込む側の同じ名前の住人のアイコンは残す） */
  function settingsData() {
    var S = clone(HK.UI.state());
    (S.chars || []).forEach(function (c) { delete c.icon; });
    delete S.savedAt;
    var adv = HK.Adv ? advOf(HK.Adv.data) : {};
    return { f: SFMT, v: VER, at: new Date().toISOString(), b: HK.SAFE_BUILD ? 'zenrei' : 'full', m: HK.SAFE_ON ? 'safe' : 'r18', state: S, adv: adv };
  }
  function toStr() {
    var bytes = utf8(JSON.stringify(settingsData()));
    var plain = function () { return PFX + 'n.' + b64u(bytes); };
    try {
      if (typeof CompressionStream !== 'function') return Promise.resolve(plain());
      return through(bytes, CompressionStream).then(function (z) { return PFX + 'z.' + b64u(z); }, plain);
    } catch (e) { return Promise.resolve(plain()); }
  }
  function fromStr(s) {
    var m = String(s || '').replace(/[\s　]+/g, '').match(/hakoniwa1([zn])\.([A-Za-z0-9_-]+)/);
    if (!m) return Promise.reject(new Error('nostr'));
    var bytes;
    try { bytes = unb64u(m[2]); } catch (e) { return Promise.reject(new Error('broken')); }
    var done = function (u) { var d = parse(deutf8(u)); if (!d || d.f !== SFMT) throw new Error('broken'); return d; };
    if (m[1] === 'n') { try { return Promise.resolve(done(bytes)); } catch (e) { return Promise.reject(e); } }
    if (typeof DecompressionStream !== 'function') return Promise.reject(new Error('nozip'));
    try { return through(bytes, DecompressionStream).then(done, function () { throw new Error('broken'); }); } catch (e) { return Promise.reject(new Error('nozip')); }
  }
  function lenNote(n) {
    if (n > LONG) return n + '字あります。長いので、「まるごと書き出し」でファイルにして送るのがおすすめです';
    if (n > LINE_MAX) return n + '字あります。LINEのトークは1万字までなので、メールやメモで送るか、「まるごと書き出し」のファイルを使ってください';
    return n + '字';
  }
  function setText(v) { strVal = v; var ta = document.getElementById('pt-text'); if (ta) ta.value = v; return ta; }
  function copyStr() {
    if (!HK.UI || !HK.UI.state) return;
    var p = toStr();
    strOpen = true; refresh();
    var fin = function (s, how) { var ta = setText(s); say((how ? 'コピーしました' : '下の欄に文字列を出しました。長押し（PCは Ctrl+C）でコピーしてください') + '（' + lenNote(s.length) + '）。別の端末の「文字列から読み込む」に貼り付けると読み込めます'); if (!how && ta) { ta.focus(); ta.select(); } };
    /* Safari は押した操作のうちにクリップボードへ書く必要があるので、出来上がりを待つ ClipboardItem を先に渡す */
    var cb = navigator.clipboard;
    try {
      if (cb && cb.write && window.ClipboardItem) {
        cb.write([new window.ClipboardItem({ 'text/plain': p.then(function (s) { return new Blob([s], { type: 'text/plain' }); }) })])
          .then(function () { p.then(function (s) { fin(s, 1); }); }, function () { p.then(writeText); });
        return;
      }
    } catch (e) { /* 下へ */ }
    p.then(writeText);
    function writeText(s) {
      if (cb && cb.writeText) cb.writeText(s).then(function () { fin(s, 1); }, function () { fin(s, 0); });
      else { var ta = setText(s), ok = false; if (ta) { ta.focus(); ta.select(); try { ok = document.execCommand('copy'); } catch (e) { ok = false; } } fin(s, ok ? 1 : 0); }
    }
  }
  function importSettings(d, how) {
    var st = d.state && typeof d.state === 'object' ? d.state : null, adv = advOf(d.adv);
    if (!st) { say('設定が見つかりませんでした'); return; }
    var what = '住人' + (st.chars || []).length + '人・関係' + (st.ties || []).length + '本';
    if (how === 'rep') {
      if (!window.confirm('文字列の設定（' + what + '）で、このブラウザの住人・関係・環境値・辞書を置き換えます（セーブと履歴はそのまま）。よろしいですか？')) { say('読み込みをやめました'); return; }
      /* アイコンは文字列に入っていないので、同じ名前の住人のアイコンを引き継ぐ */
      var icon = {}; (HK.UI.state().chars || []).forEach(function (c) { if (c.icon) icon[c.name] = c.icon; });
      var S = clone(st); (S.chars || []).forEach(function (c) { if (c && icon[c.name] && !c.icon) c.icon = icon[c.name]; });
      S.savedAt = Date.now();
      /* 控え（state:backup）は消して、読み込み直したときに今の内容で作り直す（古い控えとの食い違いの知らせを出さない） */
      var map = {}; map[K('hakoniwa:state')] = JSON.stringify(S); map[K('hakoniwa:state:backup')] = null;
      if (HK.Adv) { var a = {}; Object.keys(HK.Adv.data || {}).forEach(function (k) { if (!advOk(k)) return; a[k] = ''; }); Object.keys(adv).forEach(function (k) { a[k] = adv[k]; }); map[K('hakoniwa:adv')] = JSON.stringify(a); }
      iconsOut(map).then(function () {
        if (!writeAll(map, false)) { iconsBack(); say('ブラウザの保存領域に入りきらず、読み込めませんでした（今のデータはそのままです）'); return; }
        reload('文字列から設定を読み込みました（置き換え）：' + what);
      });
      return;
    }
    var r = addRoster(st), na = addAdv(adv);
    reload('文字列から設定を読み込みました（足す）：住人' + r.n + '人' + (r.over ? '（うち同じ名前の' + r.over + '人を上書き）' : '') + (r.kept ? '・同じ名前の' + r.kept + '人は今のまま' : '') + (na ? '・辞書' + na + '件' : ''));
  }
  function readStr() {
    var ta = document.getElementById('pt-text'), v = ta ? ta.value : strVal;
    strVal = v;
    if (/^\s*[{[]/.test(v)) { importText(v, mode); return; }
    fromStr(v).then(function (d) { importSettings(d, mode); }, function (e) {
      var k = e && e.message;
      say(k === 'nozip' ? 'このブラウザは圧縮した文字列を読めません。ブラウザを新しくするか、「まるごと書き出し」のファイルで移してください'
        : k === 'nostr' ? '「hakoniwa1」で始まる文字列が見つかりませんでした。コピーした文字列をそのまま貼り付けてください'
        : '文字列が途中で切れているか、壊れているようです。もう一度コピーして貼り付けてください');
    });
  }

  /* ---------- 画面（住人タブ。ui.js の renderCast が html() を差し込む） ---------- */
  function html() {
    var q = function (v, l) { return '<label class="ptmode"><input type="radio" name="ptmode" value="' + v + '"' + (mode === v ? ' checked' : '') + '> ' + l + '</label>'; };
    return '<div class="portable" id="portable">' +
      '<div class="pthead">別の端末へ移す（PC→スマホなど）' + (HK.Tips ? HK.Tips.btn('portable') : '') + '</div>' +
      '<p class="hint" style="margin:2px 0 6px">住人・関係・設定・セーブ・履歴・辞書を、まるごと1つのファイルにして別のブラウザへ移せます。PCで「まるごと書き出し」→ LINE・メール・ドライブなどでスマホへ送る → スマホで「まるごと読み込む」。スマホからは「共有」で送れます。</p>' +
      '<div class="row" style="flex-wrap:wrap;gap:6px"><button class="btn" data-pt="out">まるごと書き出し</button><button class="btn" data-pt="share">共有（LINE・メールなど）</button><button class="btn" data-pt="in">まるごと読み込む</button></div>' +
      '<div class="row ptmodes" role="radiogroup" aria-label="読み込み方"><span class="hint" style="margin:0">読み込み方：</span>' + q('add', '足す（セーブは追加。同じ名前の住人は確認）') + q('rep', '置き換える') + '</div>' +
      '<p class="hint" style="margin:2px 0 0">「まるごと読み込む」では、書き出したファイルを複数まとめて選べます（「足す」で順に読み込み、同じ名前で設定も同じ住人は飛ばします）。</p>' +
      '<div class="row" style="flex-wrap:wrap;gap:6px;margin-top:6px"><button class="btn small" data-pt="strout" title="住人・関係・環境値・辞書（セーブ・履歴・アイコンは除く）を短い文字列にしてコピー">設定を文字列でコピー</button><button class="btn small" data-pt="strin" aria-expanded="' + strOpen + '">文字列から読み込む</button></div>' +
      '<div class="ptstr"' + (strOpen ? '' : ' hidden') + '><textarea id="pt-text" rows="3" spellcheck="false" autocomplete="off" placeholder="別の端末でコピーした「hakoniwa1」で始まる文字列を貼り付け">' + esc(strVal) + '</textarea>' +
      '<div class="row" style="margin-top:4px"><button class="btn small primary" data-pt="strgo">貼り付けた文字列を読み込む</button><span class="hint" style="margin:0">設定だけ（セーブ・履歴・アイコンは入りません）</span></div></div>' +
      '<p class="hint" id="pt-msg" aria-live="polite" style="margin:4px 0 0">' + esc(lastMsg) + '</p>' +
      '<input type="file" id="pt-file" accept=".json,application/json" multiple hidden>' +
      /* 保存フォルダ（PC の Chrome／Edge。save-folder.js） */
      (HK.SaveFolder ? HK.SaveFolder.html() : '') + '</div>';
  }
  function refresh() { if (HK.UI && HK.UI.renderCast && document.getElementById('portable')) HK.UI.renderCast(); }
  (function style() {
    var st = document.createElement('style');
    st.textContent = '.portable{margin-top:10px;padding:10px 12px;border:1px solid var(--line);border-radius:var(--r,8px);background:var(--surface)}.portable .pthead{font-weight:600}.portable .ptmodes{flex-wrap:wrap;gap:4px 12px;margin-top:6px;align-items:center}.portable .ptmode{white-space:nowrap}.portable .ptstr{margin-top:6px}.portable .ptstr[hidden]{display:none}.portable textarea{width:100%;box-sizing:border-box;font-family:ui-monospace,Menlo,Consolas,monospace;font-size:12px;word-break:break-all}';
    (document.head || document.documentElement).appendChild(st);
  })();
  document.addEventListener('click', function (ev) {
    var t = ev.target.closest && ev.target.closest('[data-pt]');
    if (!t) return;
    var k = t.dataset.pt;
    if (k === 'out') exportFile();
    else if (k === 'share') share();
    else if (k === 'in') { var f = document.getElementById('pt-file'); if (f) { f.value = ''; f.click(); } }
    else if (k === 'strout') copyStr();
    else if (k === 'strin') { strOpen = !strOpen; refresh(); if (strOpen) { var ta = document.getElementById('pt-text'); if (ta) ta.focus(); } }
    else if (k === 'strgo') readStr();
  });
  document.addEventListener('change', function (ev) {
    var t = ev.target;
    if (t.name === 'ptmode') { mode = t.value === 'rep' ? 'rep' : 'add'; return; }
    if (t.id !== 'pt-file' || !t.files || !t.files[0]) return;
    readFiles(t.files);
  });
  document.addEventListener('input', function (ev) { if (ev.target.id === 'pt-text') strVal = ev.target.value; });
  /* 読み込み直したあとの知らせ */
  try { var m0 = window.sessionStorage.getItem(MSG); if (m0) { window.sessionStorage.removeItem(MSG); lastMsg = m0; setTimeout(function () { toast(m0); }, 600); } } catch (e) { /* なし */ }

  HK.Portable = {
    html: html, collect: collect, importText: importText, importAll: importAll, importMany: importMany, readFiles: readFiles, envelope: envelope, mergeAll: mergeAll,
    toStr: toStr, fromStr: fromStr, importSettings: importSettings, settingsData: settingsData, say: say, mode: function () { return mode; }, FORMAT: FMT, VERSION: VER
  };
})();
