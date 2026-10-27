/* 箱庭シミュレーター: 保存フォルダ（HK.SaveFolder。PC の Chrome／Edge の File System Access API）
   ・住人タブの「別の端末へ移す」の欄（portable.js の html）に「保存フォルダ」を出す。showDirectoryPicker が無いブラウザでは「使えません」と薄く出すだけ。
     file:// で開いた配布版でも、Chrome／Edge ならフォルダを選べる（2026-10-27 に Chromium で確かめた）
   ・［フォルダを選ぶ］で選んだフォルダのハンドルを IndexedDB（state-store.js の store kv、鍵 folder）に覚える。許可は起動時に自動では求めない：
     許可が要るときは画面の上に「保存フォルダ〈名前〉を使う［許可］」の帯を出し、押したら求める（ブラウザが「毎回許可」にしていれば帯は出ずにそのまま使う）
   ・書き出し（どれも「まるごと書き出し」と同じ形の JSON。portable.js の envelope。「まるごと読み込む」でそのまま読める）
       state.json         … 住人・関係・設定（hakoniwa:state。アイコン入り）と高度設定の辞書（hakoniwa:adv）。住人が変わるたびに、まとめて 1.5 秒後に書く
       saves/<id>.json    … セーブ1件（IndexedDB のセーブの形）。保存・名前の変更のたびに書き、削除したら消す
       history/<id>.json  … 履歴1件（一覧の1行 hakoniwa:history と、結果 hakoniwa-history）。増えたら書き、一覧から外れたら消す
       state-prev.json    … フォルダの住人をこのブラウザの内容で上書きしたときの、上書き前の state.json
     消すのは「このブラウザで前に書いた」と覚えている（kv の sig）ものが無くなったときだけ。ブラウザのデータが消えたあとに選び直しても、フォルダのファイルは消さない
   ・読み込み：［フォルダから読み込む］で state.json・saves・history をまとめて、「まるごと読み込む」と同じ「足す／置き換える」で取り込む（HK.Portable.importMany）。
     起動時（と選んだとき）にフォルダの state.json が、このブラウザが最後に書いた（読んだ）ものと違い、中身もこのブラウザと違えば、書き込みを止めて
     「フォルダの住人のほうが新しいです［読み込む］［このブラウザのまま］」の帯を出す */
(function () {
  'use strict';
  var HK = window.HK;
  if (!HK || typeof document === 'undefined') return;
  var KS = HK.STORE, K = function (k) { return KS ? KS.key(k) : k; };
  var CAN = typeof window.showDirectoryPicker === 'function';
  var DELAY = 1500;
  var dir = null, dirName = '', memOnly = false, rec0 = null;
  var st = 'none';            /* none：選んでいない／perm：許可待ち／on：書いている／hold：フォルダのほうが新しいので止めている／err：書けなかった */
  var lastAt = 0, errMsg = '', fInfo = null, busy = Promise.resolve();
  var sig = { s: {}, h: {} }, lastState = null;

  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function pad(n) { return ('0' + n).slice(-2); }
  function hm(t) { var d = new Date(t); return pad(d.getHours()) + ':' + pad(d.getMinutes()) + ':' + pad(d.getSeconds()); }
  function md(t) { var d = new Date(t); return (d.getMonth() + 1) + '/' + d.getDate() + ' ' + pad(d.getHours()) + ':' + pad(d.getMinutes()); }
  function toast(m) { if (HK.UI && HK.UI.toast) HK.UI.toast(m); }
  function parse(s) { try { return JSON.parse(s); } catch (e) { return undefined; } }
  function SS() { return HK.StateStore; }
  function UIS() { return HK.UI && HK.UI.state ? HK.UI.state() : null; }
  function safeName(id) { return String(id || '').replace(/[^\w.-]/g, '_').slice(0, 80) || 'x'; }
  /* フォルダの操作は1本ずつ（同じファイルを同時に書かない） */
  function serial(fn) { var p = busy.then(fn, fn); busy = p.then(null, function () {}); return p; }

  /* ---------- 覚えておくもの（state-store.js の kv。ハンドル・名前・書いたものの印） ---------- */
  function remember() {
    if (!SS() || !dir) return Promise.resolve(false);
    if (memOnly) return Promise.resolve(false);
    return SS().kvPut({ k: 'folder', handle: dir, name: dirName, at: Date.now(), sig: sig, last: lastState }).then(function (ok) {
      if (!ok) memOnly = true;   /* ハンドルを覚えられない（ブラウザの制限など）：このページのあいだだけ使う */
      return ok;
    });
  }

  /* ---------- フォルダの読み書き ---------- */
  function sub(name, create) { return dir.getDirectoryHandle(name, { create: !!create }); }
  function writeFile(d, name, text) {
    return d.getFileHandle(name, { create: true }).then(function (fh) { return fh.createWritable(); }).then(function (w) {
      return Promise.resolve(w.write(text)).then(function () { return w.close(); });
    });
  }
  function readFile(d, name) {
    return d.getFileHandle(name).then(function (fh) { return fh.getFile(); }).then(function (f) { return f.text(); }, function () { return null; });
  }
  function removeFile(d, name) { return Promise.resolve(d.removeEntry(name)).then(null, function () { return false; }); }
  function names(d) {
    var out = [];
    return new Promise(function (ok) {
      try {
        var it = d.values();
        var next = function () {
          it.next().then(function (r) { if (r.done) return ok(out); if (r.value && r.value.kind === 'file') out.push(r.value.name); next(); }, function () { ok(out); });
        };
        next();
      } catch (e) { ok(out); }
    });
  }
  function lost(e) { return e && (e.name === 'NotAllowedError' || e.name === 'SecurityError'); }
  function fail(e) {
    if (lost(e)) { st = 'perm'; bar(); }
    else { st = 'err'; errMsg = (e && (e.message || e.name)) || '書き込めませんでした'; }
    if (window.console) console.warn('保存フォルダに書けませんでした', e);
    paint();
  }
  function perm(ask) {
    if (!dir) return Promise.resolve(false);
    var q = { mode: 'readwrite' };
    var chk = function (r) { return r === 'granted'; };
    try {
      if (typeof dir.queryPermission !== 'function') return Promise.resolve(true);
      return dir.queryPermission(q).then(function (r) {
        if (chk(r) || !ask || typeof dir.requestPermission !== 'function') return chk(r);
        return dir.requestPermission(q).then(chk);
      }, function () { return false; });
    } catch (e) { return Promise.resolve(false); }
  }

  /* ---------- 書くファイルの中身（まるごと書き出しと同じ形） ---------- */
  function env(ls, dbs, extra) {
    if (HK.Portable && HK.Portable.envelope) return HK.Portable.envelope(ls, {}, dbs, extra);
    return { format: 'hakoniwa-all', version: 1, app: 'hakoniwa', exported: new Date().toISOString(), localStorage: ls, localStorageText: {}, indexedDB: dbs || [] };
  }
  function body(S) {
    /* 中身の比べ方：住人（アイコンを除く）と関係・設定。保存日時と版の印は見ない */
    var o = {};
    Object.keys(S || {}).forEach(function (k) { if (k !== 'v' && k !== 'savedAt' && k !== 'sample') o[k] = S[k]; });
    o.chars = (o.chars || []).map(function (c) { var x = {}; Object.keys(c || {}).forEach(function (k) { if (k !== 'icon') x[k] = c[k]; }); return x; });
    return JSON.stringify(o);
  }
  function stateData() {
    var S = UIS();
    if (!S) return null;
    var c = JSON.parse(JSON.stringify(S)), ls = {};
    delete c.sample;
    ls[K('hakoniwa:state')] = c;
    var adv = HK.store.get('adv', null);
    if (adv && typeof adv === 'object') ls[K('hakoniwa:adv')] = adv;
    return env(ls, [], { folder: 'state', summary: { chars: (c.chars || []).length, ties: (c.ties || []).length, saves: 0, history: 0, keys: Object.keys(ls).length } });
  }
  function saveData(r) {
    var db = { name: HK.Saves ? HK.Saves.DB : K('hakoniwa-saves'), version: 1, stores: {} };
    db.stores[HK.Saves ? HK.Saves.STORE : 'saves'] = { keyPath: 'id', autoIncrement: false, records: [r] };
    return env({}, [db], { folder: 'save', summary: { chars: 0, ties: 0, saves: 1, history: 0, keys: 0 } });
  }
  function histData(h, r) {
    var ls = {}; ls[K('hakoniwa:history')] = [h];
    var dbs = [];
    if (r) { var db = { name: HK.History ? HK.History.DB : K('hakoniwa-history'), version: 1, stores: {} }; db.stores[HK.History ? HK.History.STORE : 'results'] = { keyPath: 'id', autoIncrement: false, records: [r] }; dbs.push(db); }
    return env(ls, dbs, { folder: 'history', summary: { chars: 0, ties: 0, saves: 0, history: 1, keys: 1 } });
  }

  /* ---------- 書く ---------- */
  function writeState(force) {
    if (!dir || (st !== 'on' && st !== 'err' && !force)) return Promise.resolve(false);
    return serial(function () {
      var d = stateData();
      if (!d) return false;
      var S = d.localStorage[K('hakoniwa:state')];
      return writeFile(dir, 'state.json', JSON.stringify(d)).then(function () {
        lastAt = Date.now(); lastState = { at: S.savedAt || 0 };
        if (st === 'err') st = 'on';
        paint(); remember();
        return true;
      }, function (e) { fail(e); return false; });
    });
  }
  function sigS(r) { return [r.at, r.name || '', r.memo || '', r.title || ''].join('|'); }
  function sigH(h, r) { return [h.t || 0, h.r ? 1 : 0, r ? 1 : 0].join('|'); }
  /* セーブ：今のセーブと、前に書いた印（sig.s）を比べて、増えた・変わったものを書き、無くなったものを消す（first：印の無いものは、フォルダにファイルがあれば書かない） */
  function syncSaves() {
    if (!dir || (st !== 'on' && st !== 'hold') || !HK.Saves) return Promise.resolve(false);
    return serial(function () {
      return HK.Saves.all().then(function (list) {
        return sub('saves', true).then(function (d) {
          return names(d).then(function (have) {
            var now = {}, jobs = [];
            list.forEach(function (r) {
              if (!r || !r.id) return;
              var nm = safeName(r.id) + '.json', s = sigS(r);
              now[r.id] = s;
              if (sig.s[r.id] === s && have.indexOf(nm) >= 0) return;
              if (sig.s[r.id] == null && have.indexOf(nm) >= 0) return;   /* 前に書いた印は無いが、フォルダにある（選び直したときなど）：書かない */
              jobs.push(function () { return writeFile(d, nm, JSON.stringify(saveData(r))); });
            });
            Object.keys(sig.s).forEach(function (id) { if (now[id] == null) jobs.push(function () { return removeFile(d, safeName(id) + '.json'); }); });
            return jobs.reduce(function (p, f) { return p.then(f); }, Promise.resolve()).then(function () {
              sig.s = now; lastAt = jobs.length ? Date.now() : lastAt; paint(); remember(); return true;
            });
          });
        });
      }).then(null, function (e) { fail(e); return false; });
    });
  }
  function syncHist() {
    if (!dir || (st !== 'on' && st !== 'hold') || !HK.History) return Promise.resolve(false);
    return serial(function () {
      var list = HK.store.get('history', []);
      if (!Array.isArray(list)) list = [];
      return HK.History.all().then(function (res) {
        var byId = {}; (res || []).forEach(function (r) { if (r && r.id) byId[r.id] = r; });
        return sub('history', true).then(function (d) {
          return names(d).then(function (have) {
            var now = {}, jobs = [];
            list.forEach(function (h) {
              if (!h || !h.id) return;
              var r = byId[h.id] || null, nm = safeName(h.id) + '.json', s = sigH(h, r);
              now[h.id] = s;
              if (sig.h[h.id] === s && have.indexOf(nm) >= 0) return;
              if (sig.h[h.id] == null && have.indexOf(nm) >= 0) return;
              jobs.push(function () { return writeFile(d, nm, JSON.stringify(histData(h, r))); });
            });
            Object.keys(sig.h).forEach(function (id) { if (now[id] == null) jobs.push(function () { return removeFile(d, safeName(id) + '.json'); }); });
            return jobs.reduce(function (p, f) { return p.then(f); }, Promise.resolve()).then(function () {
              sig.h = now; lastAt = jobs.length ? Date.now() : lastAt; paint(); remember(); return true;
            });
          });
        });
      }).then(null, function (e) { fail(e); return false; });
    });
  }
  /* まとめて遅らせる（住人：1.5秒。セーブは保存の書き込みを待つので 1.5秒と 6秒の2回） */
  var tState = null, tSaves = [], tHist = null;
  function soonState() { if (st !== 'on' && st !== 'err') return; clearTimeout(tState); tState = setTimeout(function () { tState = null; writeState(); }, DELAY); }
  function soonSaves() { if (st !== 'on' && st !== 'hold') return; tSaves.forEach(clearTimeout); tSaves = [setTimeout(syncSaves, DELAY), setTimeout(syncSaves, 6000)]; }
  function soonHist() { if (st !== 'on' && st !== 'hold') return; clearTimeout(tHist); tHist = setTimeout(function () { tHist = null; syncHist(); }, DELAY); }

  /* ---------- 使い始める（許可があるとき）：フォルダの住人と比べ、書いてよければ全部そろえる ---------- */
  function folderState() {
    return readFile(dir, 'state.json').then(function (t) {
      if (t == null) return null;
      var d = parse(t), s = d && d.localStorage && (d.localStorage[K('hakoniwa:state')] || d.localStorage['hakoniwa:state'] || d.localStorage['hakoniwa-z:state']);
      if (!s || typeof s !== 'object') return null;
      return { text: t, state: s, at: +s.savedAt || 0, n: Array.isArray(s.chars) ? s.chars.length : 0, ties: Array.isArray(s.ties) ? s.ties.length : 0 };
    });
  }
  function activate() {
    st = 'on'; errMsg = ''; fInfo = null;
    paint(); unbar();
    return folderState().then(function (f) {
      var S = UIS();
      /* フォルダの住人が、このブラウザが最後に書いた（読んだ）ものと違い、中身もこのブラウザと違う：書き込みを止めて選んでもらう */
      if (f && f.n && S && !(lastState && lastState.at === f.at) && (S.sample || body(f.state) !== body(S))) {
        st = 'hold'; fInfo = f;
        paint(); bar();
      }
      var p = st === 'on' ? writeState() : Promise.resolve();
      return p.then(syncSaves).then(syncHist);
    }, function (e) { fail(e); });
  }
  function start(ask) {
    if (!dir) return Promise.resolve(false);
    return perm(ask).then(function (ok) {
      if (!ok) {
        st = 'perm';
        /* 起動時（ask なし）は帯を出す前に、ページ上の最初の操作のときに許可を求める（下の arm）。拒否が続いているときは求めない（今回は使わない） */
        if (!ask && arm()) { paint(); return false; }
        paint(); if (!ask && denies() >= DENY_MAX) return false;
        bar(); return false;
      }
      denies(0);
      return activate().then(function () { return true; });
    });
  }
  /* ---------- 最初の操作で許可を求める ----------
     Chrome 122 以降は、覚えたハンドルに操作の中で requestPermission を呼ぶと、「常に許可」を選んだサイトでは確認なしで granted になる。
     queryPermission は次回も 'prompt' を返すことがあるので、起動時にすぐ帯を出すと「毎回許可を求められる」ように見えていた。
     ページ上の最初の操作（click・keydown・touchstart。document に capture で一度だけ）で requestPermission を呼び、許可されれば帯を出さずに使い始める。
     拒否・閉じた・操作の外と言われた（SecurityError）ときだけ帯を出す。拒否が DENY_MAX 回続いたら、自動では求めず「今回は使わない」にする */
  var DENY_MAX = 3, armed = null;
  function denyKey() { return 'hk-sfdeny:' + (SS() ? SS().DB : 'hakoniwa'); }
  function denies(set) {
    try {
      if (set === 0) { window.localStorage.removeItem(denyKey()); return 0; }
      var n = parseInt(window.localStorage.getItem(denyKey()), 10) || 0;
      if (set === 1) { n++; window.localStorage.setItem(denyKey(), String(n)); }
      return n;
    } catch (e) { return 0; }
  }
  var EVS = ['click', 'keydown', 'touchstart'];
  function disarm() { if (armed) { EVS.forEach(function (k) { document.removeEventListener(k, armed, true); }); armed = null; } }
  function arm() {
    disarm();
    if (!dir || typeof dir.requestPermission !== 'function' || denies() >= DENY_MAX) return false;
    var h = dir;
    armed = function (ev) {
      disarm();
      if (dir !== h || st !== 'perm') return;
      /* 保存フォルダの欄のボタン（選び直す・許可する など）は、そのボタンの処理に任せる */
      if (ev && ev.target && ev.target.closest && ev.target.closest('[data-sf]')) return;
      var p;
      try { p = h.requestPermission({ mode: 'readwrite' }); } catch (e) { p = Promise.reject(e); }
      Promise.resolve(p).then(function (r) {
        if (dir !== h) return;
        if (r === 'granted') { denies(0); return activate(); }
        denies(1); paint(); bar();
      }, function (e) {
        if (dir !== h) return;
        if (!(e && e.name === 'SecurityError')) denies(1);
        paint(); bar();
      });
    };
    EVS.forEach(function (k) { document.addEventListener(k, armed, true); });
    return true;
  }
  var FILE = /^file:/.test(location.protocol);
  var ALWAYS = 'Chrome の確認で「常に許可」を選ぶと、次に開いたときは確認なしで使えます。' + (FILE ? '手元のファイル（file://）で開いているので、ブラウザの仕様で毎回確認が要ります。' : '');

  /* ---------- 画面の上の帯（許可・フォルダのほうが新しい） ---------- */
  function unbar() { var b = document.getElementById('sfbar'); if (b) b.remove(); }
  function bar() {
    unbar();
    if (!dir || (st !== 'perm' && st !== 'hold')) return;
    var box = document.createElement('div');
    box.id = 'sfbar'; box.setAttribute('role', 'status'); box.className = 'sfbar';
    if (st === 'perm') {
      box.innerHTML = '<span>保存フォルダ<b>〈' + esc(dirName) + '〉</b>を使う<br><small>' + esc(ALWAYS) + '</small></span><button type="button" class="btn small primary" data-sf="allow">許可</button><button type="button" class="btn small ghost" data-sf="later">今回は使わない</button>';
    } else {
      var S = UIS(), f = fInfo || {};
      box.innerHTML = '<span>保存フォルダ〈' + esc(dirName) + '〉の住人のほうが新しいです（フォルダ：' + (f.at ? md(f.at) + ' 保存・' : '') + '住人' + (f.n || 0) + '人・関係' + (f.ties || 0) + '本／このブラウザ：' + (S && S.sample ? 'サンプルの住人' : '住人' + (S ? S.chars.length : 0) + '人・関係' + (S ? (S.ties || []).length : 0) + '本') + '）。読み込むまで、フォルダへの住人の書き込みを止めています</span>' +
        (S && S.sample ? '<button type="button" class="btn small primary" data-sf="readrep">読み込む</button>'
          : '<button type="button" class="btn small primary" data-sf="readrep">読み込む（置き換え）</button><button type="button" class="btn small" data-sf="readadd">足す</button>') +
        '<button type="button" class="btn small ghost" data-sf="keep">このブラウザのまま</button>';
    }
    var host = document.querySelector('main') || document.body;
    host.insertBefore(box, host.firstChild);
  }

  /* ---------- フォルダから読み込む ---------- */
  function readFolder(how) {
    if (!dir) return;
    if (!HK.Portable || !HK.Portable.importMany) { toast('読み込めませんでした'); return; }
    var say = HK.Portable.say || toast;
    perm(true).then(function (ok) {
      if (!ok) { st = 'perm'; paint(); bar(); say('保存フォルダを使う許可がありません'); return; }
      say('保存フォルダを読んでいます…');
      var items = [], fAt = 0;
      return readFile(dir, 'state.json').then(function (t) {
        if (t != null) { items.push({ name: 'state.json', text: t }); var d = parse(t), s = d && d.localStorage && d.localStorage[K('hakoniwa:state')]; fAt = s && +s.savedAt || 0; }
        var each = function (sd) {
          return sub(sd, false).then(function (d) {
            return names(d).then(function (ns) {
              ns = ns.filter(function (n) { return /\.json$/i.test(n); });
              return ns.reduce(function (p, n) { return p.then(function () { return readFile(d, n).then(function (x) { if (x != null) items.push({ name: sd + '/' + n, text: x }); }); }); }, Promise.resolve());
            });
          }, function () { /* そのフォルダが無い */ });
        };
        return each('saves').then(function () { return each('history'); });
      }).then(function () {
        if (!items.length) { say('保存フォルダに、読み込めるファイル（state.json・saves・history）がありませんでした'); return; }
        /* 読み込んだ住人を「最後に読んだもの」として覚える（読み込み直したあとは、このブラウザの内容をフォルダへ書く） */
        /* 読み込んでいるあいだは住人を書かない（置き換えでは、読み込み直すまで画面の住人が古いまま）。やめたら元に戻す */
        var prev = st, prevLast = lastState;
        lastState = { at: fAt }; st = 'busy'; unbar(); paint();
        return remember().then(function () {
          return HK.Portable.importMany(items, how === 'rep' ? 'rep' : 'add', { label: '保存フォルダから読み込みました（' + (how === 'rep' ? '置き換え' : '足す') + '）' });
        }).then(function (started) {
          if (started !== false) return;
          st = prev; lastState = prevLast; remember(); paint(); if (st === 'hold' || st === 'perm') bar();
        });
      });
    }).then(null, function (e) { fail(e); });
  }
  /* フォルダの住人をこのブラウザの内容で上書きする（上書き前の state.json は state-prev.json に残す） */
  function keepBrowser() {
    var f = fInfo;
    st = 'on'; fInfo = null; unbar(); paint();
    var p = f && f.text ? serial(function () { return writeFile(dir, 'state-prev.json', f.text); }) : Promise.resolve();
    p.then(function () { return writeState(); }).then(function (ok) { if (ok) toast('保存フォルダの住人を、このブラウザの内容にしました（前の内容は state-prev.json に残しました）'); }, fail);
  }

  /* ---------- フォルダを選ぶ・やめる ---------- */
  function pick() {
    if (!CAN) return;
    var o = { id: 'hakoniwa-save', mode: 'readwrite' };
    var p;
    try { p = window.showDirectoryPicker(o); } catch (e) { p = Promise.reject(e); }
    p.then(function (h) {
      disarm(); denies(0);
      dir = h; dirName = h.name || 'フォルダ'; memOnly = false;
      /* 別のフォルダを選んだら、前のフォルダに書いた印は使わない */
      if (!rec0 || rec0.name !== dirName) { sig = { s: {}, h: {} }; lastState = null; }
      return remember().then(function () { return start(true); }).then(function (ok) {
        if (ok) toast('保存フォルダ〈' + dirName + '〉を使います' + (memOnly ? '（このブラウザでは覚えられないので、次に開いたときはもう一度選んでください）' : ''));
      });
    }, function (e) {
      if (e && e.name === 'AbortError') return;
      errMsg = (e && e.name === 'SecurityError') ? 'このページではフォルダを選べませんでした（ブラウザの制限）' : 'フォルダを選べませんでした';
      st = dir ? st : 'none'; paint(); toast(errMsg);
    });
  }
  function forget() {
    if (!window.confirm('保存フォルダ〈' + dirName + '〉を使うのをやめますか？（フォルダの中のファイルはそのまま残ります）')) return;
    disarm(); dir = null; dirName = ''; st = 'none'; sig = { s: {}, h: {} }; lastState = null; rec0 = null; unbar();
    if (SS()) SS().kvPut({ k: 'folder', del: 1 });
    paint(); toast('保存フォルダを使うのをやめました');
  }

  /* ---------- 欄（portable.js の html が差し込む） ---------- */
  function statusText() {
    if (!dir) return errMsg || 'まだフォルダを選んでいません。';
    var nm = '〈' + esc(dirName) + '〉';
    if (st === 'perm') return nm + (armed ? '：ページを操作すると、使う許可を確かめます' : denies() >= DENY_MAX && !document.getElementById('sfbar') ? '：許可されなかったので、今回は使いません（下の［許可する］で使えます）' : '：使うには許可が要ります（画面の上の［許可］か、下の［許可する］）');
    if (st === 'hold') return nm + '：フォルダの住人のほうが新しいので、住人の書き込みを止めています（画面の上の知らせから選んでください）';
    if (st === 'err') return nm + '：書き込めませんでした（' + esc(errMsg) + '）。次に住人が変わったときに、もう一度書きます';
    if (st === 'busy') return nm + 'から読み込んでいます…';
    return nm + 'に保存しています' + (lastAt ? '（最後に書いた時刻 ' + hm(lastAt) + '）' : '') + (memOnly ? '。このブラウザでは選んだフォルダを覚えられないので、次に開いたときはもう一度選んでください' : '');
  }
  function html() {
    /* 見出し（保存フォルダ）は portable.js の折りたたみ（.sfdet）の summary に置く */
    var h = '<div class="sfold" id="sfold">';
    if (!CAN) return h + '<p class="hint sfna">このブラウザでは使えません（PC の Chrome／Edge で使えます）</p></div>';
    return h + '<p class="hint" style="margin:2px 0 6px">選んだフォルダに、住人・関係が変わるたびに state.json、セーブは saves フォルダ、履歴は history フォルダに書き込みます（どれも「まるごと読み込む」で読めるファイルです）。ブラウザのデータが消えても、フォルダから戻せます。' + esc(ALWAYS) + '</p>' +
      '<p class="hint" id="sf-stat" aria-live="polite" style="margin:0 0 6px">' + statusText() + '</p>' +
      '<div class="row" style="flex-wrap:wrap;gap:6px">' +
      '<button class="btn small" data-sf="pick">' + (dir ? 'フォルダを選び直す' : 'フォルダを選ぶ') + '</button>' +
      (dir && st === 'perm' ? '<button class="btn small primary" data-sf="allow">許可する</button>' : '') +
      (dir ? '<button class="btn small" data-sf="read">フォルダから読み込む</button><button class="btn small ghost" data-sf="forget">使うのをやめる</button>' : '') +
      '</div>' + (dir ? '<p class="hint" style="margin:4px 0 0">「フォルダから読み込む」は、上の「読み込み方」（足す／置き換える）で取り込みます。</p>' : '') + '</div>';
  }
  function paint() {
    var el = document.getElementById('sfold');
    if (!el) return;
    var tmp = document.createElement('div'); tmp.innerHTML = html();
    el.parentNode.replaceChild(tmp.firstChild, el);
  }
  (function style() {
    var s = document.createElement('style');
    s.textContent = '.sfold{margin-top:6px}.sfold .sfna{opacity:.7;margin:2px 0 0}' +
      '.sfbar{margin:8px 0 12px;padding:10px 12px;border:1px solid var(--accent);border-radius:var(--r,8px);background:var(--accent-soft,var(--surface));color:var(--ink);line-height:1.6;display:flex;flex-wrap:wrap;gap:6px 8px;align-items:center}.sfbar span{flex:1 1 260px;min-width:0}';
    (document.head || document.documentElement).appendChild(s);
  })();
  document.addEventListener('click', function (ev) {
    var t = ev.target.closest && ev.target.closest('[data-sf]');
    if (t) {
      var k = t.dataset.sf;
      if (k === 'pick') pick();
      else if (k === 'allow') { disarm(); start(true).then(function (ok) { if (!ok) { denies(1); toast('許可されませんでした'); } }); }
      else if (k === 'later') { unbar(); paint(); }
      else if (k === 'read') readFolder(HK.Portable && HK.Portable.mode ? HK.Portable.mode() : 'add');
      else if (k === 'readrep') readFolder('rep');
      else if (k === 'readadd') readFolder('add');
      else if (k === 'keep') keepBrowser();
      else if (k === 'forget') forget();
      return;
    }
    /* セーブの保存・削除（saves.js の中の関数なので、ボタンの操作のあとで今のセーブと比べる） */
    if (ev.target.closest && ev.target.closest('[data-act="saveres"],[data-sv="del"]')) soonSaves();
  });
  document.addEventListener('change', function (ev) {
    var t = ev.target;
    if (t && (t.id === 'savefile' || (t.dataset && t.dataset.sv === 'name'))) soonSaves();
  });
  /* 閉じる前に、待っている住人の書き込みを出しておく（書き終わるかはブラウザしだい） */
  document.addEventListener('visibilitychange', function () {
    if (document.visibilityState === 'hidden' && tState) { clearTimeout(tState); tState = null; writeState(); }
  });

  /* ---------- 変わったときの合図 ---------- */
  function wrapFn(obj, key, after) {
    if (!obj || typeof obj[key] !== 'function') return;
    var f0 = obj[key];
    obj[key] = function () { var r = f0.apply(this, arguments); try { after(); } catch (e) { /* なし */ } return r; };
  }
  function hook() {
    if (SS() && SS().on) SS().on(function (k) { if (k === 'state' || k === 'adv') soonState(); else if (k === 'history') soonHist(); });
    if (HK.Saves) { wrapFn(HK.Saves, 'put', soonSaves); wrapFn(HK.Saves, 'clear', soonSaves); }
    if (HK.History) { wrapFn(HK.History, 'put', soonHist); wrapFn(HK.History, 'keep', soonHist); }
  }

  /* ---------- 起動：覚えているフォルダがあれば、許可を確かめる（求めはしない） ---------- */
  function boot() {
    hook();
    if (!CAN || !SS() || !SS().kvGet) return;
    SS().kvGet('folder').then(function (r) {
      if (!r || !r.handle) return;
      rec0 = r; dir = r.handle; dirName = r.name || r.handle.name || 'フォルダ';
      if (r.sig && typeof r.sig === 'object') sig = { s: r.sig.s || {}, h: r.sig.h || {} };
      lastState = r.last || null;
      return start(false);
    });
  }
  /* 中核をすべて読み終えて（ui.js の HK.UI ができて）から */
  var ready = HK.StateStore && HK.StateStore.ready ? HK.StateStore.ready : Promise.resolve();
  ready.then(function () { setTimeout(boot, 0); });

  HK.SaveFolder = {
    can: CAN, armed: function () { return !!armed; }, html: html, pick: pick, read: readFolder, forget: forget, start: start,
    writeState: writeState, syncSaves: syncSaves, syncHist: syncHist,
    status: function () { return { st: st, name: dirName, lastAt: lastAt, memOnly: memOnly, err: errMsg, sig: sig, last: lastState }; },
    /* 点検用：ハンドルを直接渡して使い始める（Playwright の試験。フォルダの選択の画面を出せないため） */
    useHandle: function (h, ask) { dir = h; dirName = h.name || 'フォルダ'; memOnly = false; if (!rec0 || rec0.name !== dirName) { sig = { s: {}, h: {} }; lastState = null; } return remember().then(function () { return start(ask !== false); }); }
  };
})();
