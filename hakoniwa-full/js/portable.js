/* 箱庭シミュレーター: 別の端末へ移す（PCで作った設定をスマホで読む。サーバーは使わない）
   ・まるごと書き出し：このブラウザに保存しているもの（localStorage の hakoniwa で始まる鍵すべてと、IndexedDB の hakoniwa で始まるデータベースすべて）を
     1つの JSON（format: 'hakoniwa-all'）にまとめてファイルにする。鍵の一覧は決め打ちせず、その場で列挙する
   ・共有：Web Share API でファイルを送れる端末（iPhone の Safari・Android の Chrome など）では、LINE・メール・ドライブへ。できなければダウンロード
   ・まるごと読み込む：「足す」（セーブは追加、同じ名前の住人は上書きするか確認）か「置き換える」。住人の JSON・セーブの JSON（古い形式）もここから読める
   ・設定を文字列で：住人・関係・環境値・高度設定（セーブ・履歴・アイコンは除く）を短い文字列（hakoniwa1z. 圧縮／hakoniwa1n. 圧縮なし ＋ base64url）にする
   全年齢版では、R18版で保存したセーブと R18 だけの辞書（喘ぎなど）は読み込まない。住人の R18 だけの設定は normState（ui.js）に任せる。
   全年齢／R18 の切り替え（hakoniwa-safe-mode）と R18版のパスワードの印（hakoniwa-r18-unlock）はその端末の設定として、書き出さず、読み込みでも変えない */
(function () {
  'use strict';
  var HK = window.HK;
  if (!HK || typeof document === 'undefined') return;
  var FMT = 'hakoniwa-all', VER = 1, SFMT = 'hakoniwa-settings', PFX = 'hakoniwa1', LONG = 20000, LINE_MAX = 10000;
  var MSG = 'hakoniwa-portable-msg';                 /* 読み込み直したあとに出す知らせ（sessionStorage） */
  /* 書き出さず、読み込みでも変えない鍵（端末ごとの設定）：全年齢／R18 の切り替え、R18版のパスワードを入れた印（pass-gate.js） */
  var KEEP = { 'hakoniwa-safe-mode': 1, 'hakoniwa-r18-unlock': 1 };
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
    try { var st = window.localStorage; for (var i = 0; i < st.length; i++) { var k = st.key(i); if (k && /^hakoniwa/.test(k)) o[k] = st.getItem(k); } } catch (e) { /* 使えない環境 */ }
    return o;
  }
  function lsPack() {
    var raw = lsRaw(), json = {}, text = {};
    Object.keys(raw).forEach(function (k) { if (KEEP[k]) return; var v = parse(raw[k]); if (v !== undefined && JSON.stringify(v) === raw[k]) json[k] = v; else text[k] = raw[k]; });
    return { json: json, text: text };
  }
  /* IndexedDB：hakoniwa で始まるデータベースを列挙（databases() が無い環境はセーブの DB だけ）。無い DB をうっかり作らない */
  function idbNames() {
    var base = [HK.Saves ? HK.Saves.DB : 'hakoniwa-saves'];
    return new Promise(function (ok) {
      try {
        if (!window.indexedDB || !indexedDB.databases) return ok(base);
        indexedDB.databases().then(function (l) {
          var n = (l || []).map(function (d) { return d && d.name; }).filter(function (x) { return x && /^hakoniwa/.test(x); });
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
    var out = [], seen = {}, SDB = HK.Saves ? HK.Saves.DB : 'hakoniwa-saves', SST = HK.Saves ? HK.Saves.STORE : 'saves', SLS = HK.Saves ? HK.Saves.LS : 'hakoniwa:saves';
    var add = function (r) { if (r && r.result && (r.result.log || r.result.ending) && !(r.id && seen[r.id])) { if (r.id) seen[r.id] = 1; out.push(r); } };
    (Array.isArray(data.indexedDB) ? data.indexedDB : []).forEach(function (d) { var s = d && d.name === SDB && d.stores && d.stores[SST]; if (s && Array.isArray(s.records)) s.records.forEach(add); });
    var ls = data.localStorage && data.localStorage[SLS];
    if (Array.isArray(ls)) ls.forEach(add);
    return out;
  }
  function stateOf(data) { var s = data.localStorage && data.localStorage['hakoniwa:state']; return s && typeof s === 'object' ? s : null; }
  function histOf(data) { var h = data.localStorage && data.localStorage['hakoniwa:history']; return Array.isArray(h) ? h : []; }
  function advOf(o) { var a = o && typeof o === 'object' ? o : {}, m = {}; Object.keys(a).forEach(function (k) { if (typeof a[k] === 'string' && a[k] && advOk(k)) m[k] = a[k].slice(0, 20000); }); return m; }
  /* 全年齢版では、この版に節がある辞書だけ（R18版の喘ぎの辞書などは入れない） */
  function advOk(k) { return !HK.SAFE_BUILD || !HK.Adv || HK.Adv.secs.some(function (s) { return s.id === k; }); }

  function collect() {
    return idbNames().then(function (ns) { return Promise.all(ns.map(dumpDB)); }).then(function (dbs) {
      var ls = lsPack(), d = new Date();
      var data = {
        format: FMT, version: VER, app: 'hakoniwa',
        build: HK.SAFE_BUILD ? 'zenrei' : 'full', mode: HK.SAFE_ON ? 'safe' : 'r18',
        exported: d.toISOString(), exportedLocal: d.getFullYear() + '/' + pad(d.getMonth() + 1) + '/' + pad(d.getDate()) + ' ' + pad(d.getHours()) + ':' + pad(d.getMinutes()),
        localStorage: ls.json, localStorageText: ls.text, indexedDB: dbs.filter(Boolean)
      };
      var st = stateOf(data) || {};
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
  /* セーブ以外の IndexedDB（今はない。増えたときのため）：ある store にだけ入れる */
  function putOther(dbs, wipe) {
    var SDB = HK.Saves ? HK.Saves.DB : 'hakoniwa-saves';
    return Promise.all((dbs || []).filter(function (d) { return d && d.name && d.name !== SDB && /^hakoniwa/.test(d.name) && d.stores; }).map(function (d) {
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
  function putSaves(list) {
    if (!HK.Saves || !list.length) return Promise.resolve(0);
    return Promise.all(list.map(function (r) { return HK.Saves.put(r); })).then(function (rs) { return rs.filter(Boolean).length; });
  }
  function reload(msg) {
    try { window.sessionStorage.setItem(MSG, msg); } catch (e) { /* 知らせは出せなくてもよい */ }
    setTimeout(function () { location.reload(); }, 300);
  }
  /* 全年齢版：R18版（R18モード）で保存したセーブは入れない */
  function safeSaves(list) { return HK.SAFE_BUILD ? list.filter(function (r) { return !r.r18; }) : list; }

  /* 住人・関係を「足す」：読み込む状態を normState で整え、住人の JSON（rosterJSON）にして ui.js の importJSON（追加）へ。
     同じ名前の住人は上書きするか確認し、残すときは、その人との関係・固定・呼び方を名前でつなぐ（rosterJSON の only） */
  function addRoster(st0) {
    var UI = HK.UI;
    if (!st0 || !UI || !UI.normState || !UI.rosterJSON || !UI.importJSON) return { n: 0, over: 0 };
    var St = UI.normState(clone(st0));
    if (!St.chars.length) return { n: 0, over: 0 };
    var cur = UI.state(), have = cur.sample ? [] : cur.chars.map(function (c) { return c.name; });
    var dup = St.chars.filter(function (c) { return have.indexOf(c.name) >= 0; }), over = true;
    if (dup.length) over = window.confirm('同じ名前の住人が' + dup.length + '人います（' + dup.slice(0, 8).map(function (c) { return c.name; }).join('・') + (dup.length > 8 ? 'ほか' : '') + '）。\n読み込むもので上書きしますか？\n\n［OK］上書きする\n［キャンセル］今の住人をそのまま残す（関係は名前でつなぎます）');
    var only = over ? null : St.chars.filter(function (c) { return have.indexOf(c.name) < 0; }).map(function (c) { return c.id; });
    if (only && !only.length) return { n: 0, over: 0, kept: dup.length };
    var ros = UI.rosterJSON(only, St);
    delete ros.ct; delete ros.adv;                     /* 内容のスイッチ・辞書は今のものを残す（辞書は下で別に聞く） */
    UI.importJSON(JSON.stringify(ros), false);
    return { n: ros.chars.length, over: over ? dup.length : 0, kept: over ? 0 : dup.length };
  }
  /* 高度設定（口調の辞書など）を「足す」：今が空の欄は入れ、違う中身があれば置き換えるか聞く */
  function addAdv(adv) {
    if (!HK.Adv) return 0;
    var keys = Object.keys(adv), diff = keys.filter(function (k) { return HK.Adv.get(k) && HK.Adv.get(k) !== adv[k]; }), n = 0;
    var rep = diff.length ? window.confirm('高度設定（口調の辞書など）の中身が、今のものと読み込むもので違います。\n読み込むものに置き換えますか？\n\n［OK］置き換える\n［キャンセル］今のものを残す') : false;
    keys.forEach(function (k) { if (!HK.Adv.get(k) || (rep && diff.indexOf(k) >= 0)) { if (HK.Adv.get(k) !== adv[k]) { HK.Adv.set(k, adv[k], true); n++; } } });
    return n;
  }

  /* ---------- まるごと読み込む ---------- */
  function importAll(data, how) {
    var st = stateOf(data) || {}, saves = savesOf(data), sv = safeSaves(saves), drop = saves.length - sv.length, hist = histOf(data);
    var from = (data.exportedLocal || data.exported || '') + (data.build === 'zenrei' ? '（全年齢版）' : data.build === 'full' ? '（R18版）' : '');
    var what = '住人' + (st.chars || []).length + '人・関係' + (st.ties || []).length + '本・セーブ' + sv.length + '件・履歴' + hist.length + '件';
    if (how === 'rep') {
      if (!window.confirm(from + ' に書き出したデータ（' + what + '）で、このブラウザの住人・関係・設定・セーブ・履歴・辞書をすべて置き換えます。\n今のデータは消えます（元に戻せません）。よろしいですか？')) { say('読み込みをやめました'); return; }
      var map = {}, SLS = HK.Saves ? HK.Saves.LS : 'hakoniwa:saves';
      Object.keys(data.localStorage || {}).forEach(function (k) { if (/^hakoniwa/.test(k) && k !== SLS) map[k] = JSON.stringify(data.localStorage[k]); });
      Object.keys(data.localStorageText || {}).forEach(function (k) { if (/^hakoniwa/.test(k) && k !== SLS && typeof data.localStorageText[k] === 'string') map[k] = data.localStorageText[k]; });
      if (HK.SAFE_BUILD && map['hakoniwa:adv']) map['hakoniwa:adv'] = JSON.stringify(advOf(parse(map['hakoniwa:adv'])));
      if (!writeLS(map, true)) { say('ブラウザの保存領域に入りきらず、読み込めませんでした（今のデータはそのままです）'); return; }
      var p = HK.Saves ? HK.Saves.clear() : Promise.resolve(true);
      p.then(function () { return putSaves(sv); }).then(function (n) {
        return putOther(data.indexedDB, true).then(function () {
          reload('まるごと読み込みました（置き換え）：' + what.replace(/セーブ\d+件/, 'セーブ' + n + '件') + (n < sv.length ? '（セーブ' + (sv.length - n) + '件は保存しきれませんでした）' : '') + (drop ? '。R18版で保存したセーブ' + drop + '件は、全年齢版では読み込みません' : ''));
        });
      });
      return;
    }
    /* 足す */
    var r = addRoster(st), na = addAdv(advOf(data.localStorage && data.localStorage['hakoniwa:adv']));
    /* 履歴：重ならないものを足して、新しい順に12件 */
    var cur = HK.store.get('history', []), key = function (h) { return [h.t, h.seed, h.names, h.input && h.input.scenId].join('|'); };
    if (!Array.isArray(cur)) cur = [];
    var ks = cur.map(key), hn = 0;
    hist.forEach(function (h) { if (h && h.input && HK.SCENARIOS[h.input.scenId] && ks.indexOf(key(h)) < 0) { cur.push(h); ks.push(key(h)); hn++; } });
    cur.sort(function (a, b) { return (b.t || 0) - (a.t || 0); });
    if (hn) HK.store.set('history', cur.slice(0, 12));
    var getAll = HK.Saves ? HK.Saves.all() : Promise.resolve([]);
    getAll.then(function (list) {
      var ids = {}; list.forEach(function (x) { ids[x.id] = 1; });
      var nw = sv.filter(function (x) { return !(x.id && ids[x.id]); });
      return putSaves(nw).then(function (n) {
        return putOther(data.indexedDB, false).then(function () {
          var parts = [];
          parts.push('住人' + r.n + '人' + (r.over ? '（うち同じ名前の' + r.over + '人を上書き）' : '') + (r.kept ? '・同じ名前の' + r.kept + '人は今のまま' : ''));
          parts.push('セーブ' + n + '件を追加' + (sv.length - nw.length ? '（同じセーブ' + (sv.length - nw.length) + '件は省略）' : ''));
          parts.push('履歴' + hn + '件');
          if (na) parts.push('辞書' + na + '件');
          reload('まるごと読み込みました（足す）：' + parts.join('・') + (drop ? '。R18版で保存したセーブ' + drop + '件は、全年齢版では読み込みません' : ''));
        });
      });
    });
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
      var map = { 'hakoniwa:state': JSON.stringify(S), 'hakoniwa:state:backup': null };
      if (HK.Adv) { var a = {}; Object.keys(HK.Adv.data || {}).forEach(function (k) { if (!advOk(k)) return; a[k] = ''; }); Object.keys(adv).forEach(function (k) { a[k] = adv[k]; }); map['hakoniwa:adv'] = JSON.stringify(a); }
      if (!writeLS(map, false)) { say('ブラウザの保存領域に入りきらず、読み込めませんでした（今のデータはそのままです）'); return; }
      reload('文字列から設定を読み込みました（置き換え）：' + what);
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
      '<div class="row" style="flex-wrap:wrap;gap:6px;margin-top:6px"><button class="btn small" data-pt="strout" title="住人・関係・環境値・辞書（セーブ・履歴・アイコンは除く）を短い文字列にしてコピー">設定を文字列でコピー</button><button class="btn small" data-pt="strin" aria-expanded="' + strOpen + '">文字列から読み込む</button></div>' +
      '<div class="ptstr"' + (strOpen ? '' : ' hidden') + '><textarea id="pt-text" rows="3" spellcheck="false" autocomplete="off" placeholder="別の端末でコピーした「hakoniwa1」で始まる文字列を貼り付け">' + esc(strVal) + '</textarea>' +
      '<div class="row" style="margin-top:4px"><button class="btn small primary" data-pt="strgo">貼り付けた文字列を読み込む</button><span class="hint" style="margin:0">設定だけ（セーブ・履歴・アイコンは入りません）</span></div></div>' +
      '<p class="hint" id="pt-msg" aria-live="polite" style="margin:4px 0 0">' + esc(lastMsg) + '</p>' +
      '<input type="file" id="pt-file" hidden></div>';
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
    var f = t.files[0];
    if (f.size > 200 * 1024 * 1024) { say('ファイルが大きすぎます（200MBまで）'); return; }
    var rd = new FileReader();
    rd.onload = function () { importText(String(rd.result || ''), mode); };
    rd.onerror = function () { say('ファイルを読み込めませんでした'); };
    rd.readAsText(f, 'utf-8');
  });
  document.addEventListener('input', function (ev) { if (ev.target.id === 'pt-text') strVal = ev.target.value; });
  /* 読み込み直したあとの知らせ */
  try { var m0 = window.sessionStorage.getItem(MSG); if (m0) { window.sessionStorage.removeItem(MSG); lastMsg = m0; setTimeout(function () { toast(m0); }, 600); } } catch (e) { /* なし */ }

  HK.Portable = { html: html, collect: collect, importText: importText, importAll: importAll, toStr: toStr, fromStr: fromStr, importSettings: importSettings, settingsData: settingsData, FORMAT: FMT, VERSION: VER };
})();
