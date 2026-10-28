/* 箱庭シミュレーター: 結果のセーブと、セーブデータの閲覧
   ・「経過と結末」の「この結果をセーブ」で、結果をまるごと（入力・経過・結末・関係図）ブラウザに保存する
   ・「セーブ」タブで一覧を見て、開く／名前を付ける／同じ条件でもう一度回す／JSONで書き出す／削除する
   ・JSONファイルの読み込み（1件でも、まとめて書き出したものでも）で、別のパソコンやブラウザに移せる
   保存先はブラウザのIndexedDB（容量が大きい）。使えない環境ではlocalStorage。どちらもこのブラウザの中だけに残る */
(function () {
  'use strict';
  var HK = window.HK;
  if (!HK || typeof document === 'undefined') return;
  /* 保存先の名前は版ごと（safe.js の HK.STORE。R18版は hakoniwa-saves／hakoniwa:saves、全年齢版は hakoniwa-z-saves／hakoniwa-z:saves） */
  var KS = HK.STORE, DB = KS ? KS.db : 'hakoniwa-saves', ST = 'saves', LS = KS ? KS.key('hakoniwa:saves') : 'hakoniwa:saves', VER = 1;
  var cache = null;

  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function toast(m) { if (HK.toast) HK.toast(m); }
  function pad(n) { return ('0' + n).slice(-2); }
  function fmtDate(t) { var d = new Date(t); return d.getFullYear() + '/' + pad(d.getMonth() + 1) + '/' + pad(d.getDate()) + ' ' + pad(d.getHours()) + ':' + pad(d.getMinutes()); }
  function uid() { return 's' + Date.now().toString(36) + Math.random().toString(36).slice(2, 7); }

  /* ---------- 版の印（HK.VerMark。セーブ・履歴・結果に入れ、一覧と開いた画面に「保存時の版」として出す）----------
     { v：目録の版（index.html の HK_MANIFEST.v。build ごとに変わる）, d：ページの「最終更新」の日付, b：full／zenrei }。
     2026-10-28 より前のセーブ・履歴には印が無い（保存日だけ出す）。版が変わると同じシードでも結果が変わることがあるので、
     開くときは保存した結果だけを表示し、回し直さない（結果の無いものは開けない） */
  var VM = HK.VerMark = {
    now: function () {
      var M = HK.Load && HK.Load.manifest, d = '';
      try { var t = document.querySelector('.site-foot .updated time[datetime]'); d = t ? String(t.getAttribute('datetime') || '') : ''; } catch (e) { d = ''; }
      return { v: M && M.v ? String(M.v) : '', d: d, b: HK.SAFE_BUILD ? 'zenrei' : 'full' };
    },
    /* 表示用の短い名前（「10/27の版（fdbbb5）」／印なし：「版の印なし（10/26 に保存）」） */
    label: function (m, at) {
      if (m && typeof m === 'object' && (m.d || m.v)) {
        var p = /^(\d{4})-(\d{2})-(\d{2})$/.exec(m.d || '');
        return (p ? +p[2] + '/' + +p[3] + 'の版' : '版') + (m.v ? '（' + String(m.v).slice(0, 6) + '）' : '');
      }
      var d = at ? new Date(at) : null;
      return '版の印なし' + (d && !isNaN(d) ? '（' + (d.getMonth() + 1) + '/' + d.getDate() + ' に保存）' : '（10/28 より前の版）');
    },
    /* 今の版と同じか（印の無いものは「違う」扱い） */
    same: function (m) { var n = VM.now(); return !!(m && m.v && n.v && m.v === n.v); }
  };
  /* 開ける結果か（経過か結末がある） */
  function hasRes(res) { return !!(res && typeof res === 'object' && ((Array.isArray(res.log) && res.log.length) || res.ending || res.end)); }

  /* ---------- 保存先（IndexedDB → だめならlocalStorage） ---------- */
  var idb = null;
  function open() {
    return new Promise(function (ok) {
      if (idb !== null) return ok(idb);
      try {
        if (!window.indexedDB) { idb = false; return ok(false); }
        var rq = indexedDB.open(DB, VER);
        rq.onupgradeneeded = function () { var d = rq.result; if (!d.objectStoreNames.contains(ST)) d.createObjectStore(ST, { keyPath: 'id' }); };
        rq.onsuccess = function () { idb = rq.result; migrate(idb).then(function () { ok(idb); }); };
        rq.onerror = function () { idb = false; ok(false); };
        rq.onblocked = function () { idb = false; ok(false); };
      } catch (e) { idb = false; ok(false); }
    });
  }
  /* 全年齢版：分ける前の共有のセーブ（hakoniwa-saves）を一度だけ写す（safe.js の移行の続き。印の db が 'wait' のときだけ）。
     R18モードで保存したもの（r18）は写さない。同じ id がもうあれば写さない。旧い DB は消さず、無ければ作らない */
  function migrate(d) {
    var f = KS && KS.zenrei && KS.flag();
    if (!f || f.db !== 'wait' || KS.oldDb === DB) return Promise.resolve();
    var done = function (n) { KS.setFlag({ db: n }); };
    return new Promise(function (ok) {
      try {
        var rq = indexedDB.open(KS.oldDb), fresh = false;
        rq.onupgradeneeded = function (e) { if (!e.oldVersion) { fresh = true; try { rq.transaction.abort(); } catch (x) { /* なし */ } } };
        rq.onerror = function (e) { if (e && e.preventDefault) e.preventDefault(); if (fresh) done(0); ok(); };
        rq.onblocked = function () { ok(); };
        rq.onsuccess = function () {
          var od = rq.result;
          if (fresh || !od.objectStoreNames.contains(ST)) { od.close(); done(0); return ok(); }
          var g = od.transaction(ST, 'readonly').objectStore(ST).getAll();
          g.onerror = function () { od.close(); ok(); };
          g.onsuccess = function () {
            od.close();
            var list = (g.result || []).filter(function (r) { return r && r.id && !r.r18; });
            var tx = d.transaction(ST, 'readwrite'), os = tx.objectStore(ST), n = 0;
            list.forEach(function (r) { var c = os.count(r.id); c.onsuccess = function () { if (!c.result) { os.put(r); n++; } }; });
            tx.oncomplete = function () { done(n); ok(); };
            tx.onerror = tx.onabort = function () { ok(); };
          };
        };
      } catch (e) { ok(); }
    });
  }
  function lsAll() { try { return JSON.parse(localStorage.getItem(LS) || '[]'); } catch (e) { return []; } }
  function lsPut(list) { try { localStorage.setItem(LS, JSON.stringify(list)); return true; } catch (e) { return false; } }
  function all() {
    return open().then(function (d) {
      if (!d) return lsAll();
      return new Promise(function (ok) {
        try { var rq = d.transaction(ST, 'readonly').objectStore(ST).getAll(); rq.onsuccess = function () { ok(rq.result || []); }; rq.onerror = function () { ok(lsAll()); }; }
        catch (e) { ok(lsAll()); }
      });
    }).then(function (list) { list.sort(function (a, b) { return b.at - a.at; }); cache = list; return list; });
  }
  /* セーブの記録を書くのは「新しく足す（addNew）」「名前だけを変える（rename）」「消す（del・clear）」の3つだけ（2026-10-28 の決まり）。
     保存した記録（seed・result・memo）は保存後に書き換えない。同じ id の記録がすでにあれば、足さずにそのまま残す */
  function addNew(rec) {
    if (!rec || !rec.id) return Promise.resolve(false);
    return open().then(function (d) {
      if (!d) { var l = lsAll(); if (l.some(function (x) { return x && x.id === rec.id; })) return true; l.push(rec); return lsPut(l); }
      return new Promise(function (ok) {
        try {
          var tx = d.transaction(ST, 'readwrite'), os = tx.objectStore(ST), c = os.count(rec.id);
          c.onsuccess = function () { if (!c.result) os.put(rec); };
          tx.oncomplete = function () { ok(true); }; tx.onerror = function () { ok(false); }; tx.onabort = function () { ok(false); };
        } catch (e) { ok(false); }
      });
    });
  }
  /* 名前（利用者が書く欄）だけを変える。同じ書き込みの中で読み直し、名前のほかは触らない */
  function rename(id, name) {
    return open().then(function (d) {
      if (!d) { var l = lsAll(), x = l.filter(function (r) { return r && r.id === id; })[0]; if (!x) return false; x.name = name; return lsPut(l); }
      return new Promise(function (ok) {
        try {
          var tx = d.transaction(ST, 'readwrite'), os = tx.objectStore(ST), g = os.get(id), hit = false;
          g.onsuccess = function () { var r = g.result; if (r) { hit = true; r.name = name; os.put(r); } };
          tx.oncomplete = function () { ok(hit); }; tx.onerror = function () { ok(false); }; tx.onabort = function () { ok(false); };
        } catch (e) { ok(false); }
      });
    });
  }
  function del(id) {
    return open().then(function (d) {
      if (!d) return lsPut(lsAll().filter(function (x) { return x.id !== id; }));
      return new Promise(function (ok) { try { var tx = d.transaction(ST, 'readwrite'); tx.objectStore(ST).delete(id); tx.oncomplete = function () { ok(true); }; tx.onerror = function () { ok(false); }; } catch (e) { ok(false); } });
    });
  }

  /* すべて消す（まるごと読み込みの「置き換える」。portable.js） */
  function clear() {
    try { localStorage.removeItem(LS); } catch (e) { /* 使えない環境 */ }
    return open().then(function (d) {
      if (!d) return true;
      return new Promise(function (ok) { try { var tx = d.transaction(ST, 'readwrite'); tx.objectStore(ST).clear(); tx.oncomplete = function () { ok(true); }; tx.onerror = function () { ok(false); }; } catch (e) { ok(false); } });
    }).then(function (r) { cache = null; return r; });
  }

  /* ---------- 結果からセーブデータを作る ---------- */
  function titleOf(res) { var e = res && (res.ending || res.end); return (e && e.title) || (res && res.summary) || ''; }
  function make(res) {
    var input = res.input || {}, sc = HK.SCENARIOS[input.scenId] || {};
    var data = JSON.parse(JSON.stringify(res));   /* 関数などを落として、まるごと写す */
    /* 版の印：動かしたときの印（ui.js の simulate が res.ver に入れる）を引き継ぐ。履歴から開いた古い結果を今セーブしても、今の版の印にはしない */
    var opened = HK.UIres && HK.UIres.opened && (HK.UIres.shown ? HK.UIres.shown() : HK.UIres.get()) === res ? HK.UIres.opened() : null;
    var ver = data.ver || (opened ? null : VM.now());
    if (ver) data.ver = ver;
    /* 高度設定（adv）：動かしたときの写し（ui-adv.js の HK.Adv.of）。セーブ・履歴から開いた結果を今セーブするときは、その記録の adv を引き継ぐ（今の設定にはしない） */
    var adv = advOf(opened ? opened.adv : HK.Adv && HK.Adv.of ? HK.Adv.of(res) : null);
    var rec = {
      id: uid(), at: Date.now(), v: 1, app: 'hakoniwa',
      name: '', scenId: input.scenId, scenName: sc.name || input.scenId || '',
      names: (input.chars || []).map(function (c) { return c.name; }).join('・'),
      seed: input.seed != null ? input.seed : data.seed, title: titleOf(res), memo: '', r18: !HK.SAFE_ON, ver: ver || null, savedVer: VM.now(), result: data
    };
    if (adv) rec.adv = adv;
    return rec;
  }
  /* 記録に入れる高度設定の形：文字列の欄だけ（空・やめた欄は落とす）。何も無ければ null（記録に adv を持たせない） */
  function advOf(o) {
    if (!o || typeof o !== 'object' || Array.isArray(o)) return null;
    var m = {}, any = false, RT = HK.Adv && HK.Adv.RETIRED || {};
    Object.keys(o).forEach(function (k) { if (typeof o[k] === 'string' && o[k] && !RT[k]) { m[k] = o[k].slice(0, 20000); any = true; } });
    return any ? m : null;
  }
  function save(res) {
    if (!res) { toast('セーブする結果がありません'); return; }
    var rec;
    try { rec = make(res); } catch (e) { toast('この結果はセーブできませんでした'); return; }
    if (!hasRes(rec.result)) { toast('この結果はセーブできませんでした（経過が空です）'); return; }
    /* 置いたあと読み直して、結果まで残ったかを確かめる（入りきらずに結果が落ちたセーブを作らない） */
    addNew(rec).then(function (ok) { return ok ? all().then(function (l) { var x = l.filter(function (r) { return r.id === rec.id; })[0]; return !!(x && hasRes(x.result)); }) : false; }).then(function (ok) {
      if (!ok) { toast('保存できませんでした（ブラウザの保存領域がいっぱいかもしれません。結果を残せていません。古いセーブを消すか、「JSONで書き出す」でファイルに残してください）'); del(rec.id); return; }
      cache = null;
      toast('セーブしました（「セーブ」タブで見られます）');
      var b = document.getElementById('savebtn'); if (b) { b.innerHTML = IC_DONE + 'セーブ済み'; b.disabled = true; }
    });
  }

  /* ---------- JSONの書き出し・読み込み ---------- */
  function fileName(base) { var d = new Date(); return base + '-' + d.getFullYear() + pad(d.getMonth() + 1) + pad(d.getDate()) + '-' + pad(d.getHours()) + pad(d.getMinutes()) + '.json'; }
  function download(text, name, n) {
    try {
      var blob = new Blob([text], { type: 'application/json' }), url = URL.createObjectURL(blob), a = document.createElement('a');
      if (!('download' in a)) throw new Error('nodl');
      a.href = url; a.download = name; document.body.appendChild(a); a.click(); a.remove();
      setTimeout(function () { URL.revokeObjectURL(url); }, 4000);
      toast(n + '件のセーブデータをJSONで書き出しました');
    } catch (e) {
      try { navigator.clipboard.writeText(text).then(function () { toast('ファイルを保存できない環境なので、JSONをクリップボードにコピーしました'); }); } catch (e2) { toast('書き出せませんでした'); }
    }
  }
  function exportRecs(recs, base) {
    if (!recs.length) { toast('書き出すセーブデータがありません'); return; }
    var text = JSON.stringify(recs.length === 1 ? recs[0] : { app: 'hakoniwa', kind: 'saves', v: 1, saves: recs });
    download(text, fileName(base), recs.length);
  }
  function importText(text) {
    var data;
    try { data = JSON.parse(text); } catch (e) { toast('JSONとして読めませんでした'); return; }
    var arr = Array.isArray(data) ? data : data && Array.isArray(data.saves) ? data.saves : [data];
    var ok = arr.filter(function (r) { return r && hasRes(r.result); });
    if (!ok.length) {
      if (data && (Array.isArray(data.chars) || Array.isArray(data))) toast('これは住人の名簿のJSONです。「住人」タブの「JSONを読み込む」から読み込んでください');
      else toast('セーブデータが見つかりませんでした');
      return;
    }
    /* 今あるセーブは書き換えない：同じ id のセーブがあれば読み込まない（省略）。一覧（cache）をまだ読んでいなくても、先に読んでから比べる */
    all().then(function (cur) {
    var have = cur.map(function (x) { return x.id; }), skip = 0;
    ok = ok.filter(function (r) { if (r.id && have.indexOf(r.id) >= 0) { skip++; return false; } return true; });
    Promise.all(ok.map(function (r) {
      var rec = { id: r.id || uid(), at: r.at || Date.now(), v: 1, app: 'hakoniwa', name: r.name || '', scenId: r.scenId || (r.result.input || {}).scenId, scenName: r.scenName || '', names: r.names || '', seed: r.seed, title: r.title || titleOf(r.result), memo: r.memo || '', r18: r.r18 !== false, ver: r.ver || (r.result && r.result.ver) || null, savedVer: r.savedVer || null, result: r.result };
      var adv = advOf(r.adv); if (adv) rec.adv = adv;   /* ファイルの記録が持つ高度設定はそのまま運ぶ */
      return addNew(rec);
    })).then(function (rs) { var n = rs.filter(Boolean).length; cache = null; toast(n + '件のセーブデータを読み込みました' + (skip ? '（同じセーブ' + skip + '件は今あるものを残して省略）' : '')); render(); });
    });
  }

  /* ---------- セーブタブ ---------- */
  var filter = '';
  function render() {
    var host = document.getElementById('view-saves');
    if (!host) return;
    all().then(function (list) {
      var scs = {}; list.forEach(function (r) { scs[r.scenId] = r.scenName || r.scenId; });
      /* 全年齢モードでは、R18モードで保存したものは出さない */
      var hid = HK.SAFE_ON ? list.filter(function (r) { return r.r18; }).length : 0;
      if (HK.SAFE_ON) list = list.filter(function (r) { return !r.r18; });
      var shown = list.filter(function (r) { return !filter || r.scenId === filter; });
      host.innerHTML =
        '<div class="savehead"><h2>セーブデータ</h2>' +
        '<p class="hint">「経過と結末」で「この結果をセーブ」を押すと、ここに残ります。保存先はこのブラウザの中だけなので、大事な結果はJSONで書き出して保管してください。</p>' +
        '<div class="row saverow">' +
        '<button class="btn small" data-sv="importfile">JSONを読み込む</button>' +
        '<button class="btn small ghost" data-sv="exportall"' + (list.length ? '' : ' disabled') + '>すべてJSONで書き出す（' + list.length + '件）</button>' +
        (Object.keys(scs).length > 1 ? '<select id="savefilter" aria-label="箱庭で絞り込む"><option value="">すべての箱庭</option>' + Object.keys(scs).map(function (k) { return '<option value="' + esc(k) + '"' + (filter === k ? ' selected' : '') + '>' + esc(scs[k]) + '</option>'; }).join('') + '</select>' : '') +
        '<input type="file" id="savefile" accept="application/json,.json" hidden></div></div>' +
        (shown.length ? '<ul class="savelist">' + shown.map(item).join('') + '</ul>' : '<p class="empty">まだセーブデータはありません。</p>') +
        (HK.SAFE_BUILD ? '<p class="hint small">保存は版ごとに別になりました（全年齢版とR18版のセーブ・住人・履歴は、同じブラウザでも別々に残ります）。R18版のセーブを全年齢版で使うには、R18版の「まるごと書き出し」と全年齢版の「まるごと読み込む」（住人タブの「別の端末へ移す」）で移せます（R18モードで保存したものは移りません）。' + (hid ? 'R18モードで保存した' + hid + '件は、全年齢版では表示しません。' : '') + '</p>' :
          hid ? '<p class="hint small">R18モードで保存した' + hid + '件は、R18モードのときだけ表示します。</p>' : '') +
        '<p class="hint small">※ 保存した結果は、そのときの内容のまま開きます（回し直しはしません）。版が変わると、同じ住人・シードで動かしても結果が変わることがあります。結果が残っていないセーブは開けません（保存時の版でのみ再現できます）。</p>';
    });
  }
  function item(r) {
    var res = r.result || {}, inp = res.input || {}, okr = hasRes(r.result);
    return '<li class="saveitem' + (okr ? '' : ' noresult') + '" data-id="' + esc(r.id) + '">' +
      '<div class="savemain"><div class="savetop"><span class="savescen">' + esc(r.scenName) + '</span><span class="savedate">' + esc(fmtDate(r.at)) + '</span></div>' +
      '<input type="text" class="savename" data-sv="name" value="' + esc(r.name) + '" placeholder="名前を付ける（任意）" maxlength="40" aria-label="セーブデータの名前">' +
      '<p class="savetitle">' + esc(r.title) + '</p>' +
      '<p class="savecast">' + esc(r.names) + (seedOf(r) != null ? '　<span class="saveseed">シード ' + esc(seedOf(r)) + '</span>' : '') + '</p>' +
      '<p class="savever hint small" style="margin:2px 0 0">保存時の版：' + esc(VM.label(r.ver || res.ver, r.at)) + '</p>' +
      (advLabel(r.adv) ? '<p class="saveadv hint small" style="margin:2px 0 0">' + esc(advLB()) + '：' + esc(advLabel(r.adv)) + '</p>' : '') +
      (okr ? '' : '<p class="savelost hint small" style="margin:2px 0 0;color:var(--hot,#B4232A)">結果が残っていないため開けません（保存時の版でのみ再現できます）</p>') + '</div>' +
      '<div class="saveact">' +
      (okr ? '<button class="btn small" data-sv="open">開く</button>' : '') +
      (!okr && inp.scenId && Array.isArray(inp.chars) && (HK.SCENARIOS[inp.scenId] || (HK.Load && HK.Load.info && HK.Load.info(inp.scenId))) ? '<button class="btn small ghost" data-sv="copycond" title="住人・環境・シードを箱庭タブに写す（自動では動かしません）">条件を箱庭タブに写す</button>' : '') +
      '<button class="btn small ghost" data-sv="export">JSON</button>' +
      '<button class="btn small ghost" data-sv="del" aria-label="削除">削除</button></div></li>';
  }
  /* 表示するシード：保存した結果の入力のシード（無ければ記録の seed） */
  function seedOf(r) { var i = r && r.result && r.result.input; return i && i.seed != null && i.seed !== '' ? i.seed : r && r.seed != null && r.seed !== '' ? r.seed : null; }
  function rec(id) { return (cache || []).filter(function (r) { return r.id === id; })[0]; }

  document.addEventListener('click', function (ev) {
    var t = ev.target.closest('[data-act="saveres"],[data-act="saveresjson"],[data-sv]');
    if (!t) return;
    /* 画面に出ている結果（最後に描けた結果。HK.UIres.shown）をセーブする。描画の途中で失敗して、画面と中身が食い違ったときに別の結果を残さない */
    if (t.dataset.act === 'saveres') { save(HK.UIres && (HK.UIres.shown ? HK.UIres.shown() : HK.UIres.get())); return; }
    if (t.dataset.act === 'saveresjson') { var cur = HK.UIres && (HK.UIres.shown ? HK.UIres.shown() : HK.UIres.get()); if (cur) { try { exportRecs([make(cur)], 'hakoniwa-save'); } catch (e) { toast('書き出せませんでした'); } } return; }
    var k = t.dataset.sv, li = t.closest('.saveitem'), r = li ? rec(li.dataset.id) : null;
    if (k === 'importfile') { var f = document.getElementById('savefile'); if (f) { f.value = ''; f.click(); } return; }
    if (k === 'exportall') { all().then(function (l) { exportRecs(HK.SAFE_ON ? l.filter(function (r) { return !r.r18; }) : l, 'hakoniwa-saves'); }); return; }
    /* 開いた画面（セーブ・履歴から開いた結果）の「条件を箱庭タブに写す」「高度設定を写す」。記録そのものは変えない */
    if (k === 'ocond' || k === 'oadv') {
      var oo = HK.UIres && HK.UIres.opened && HK.UIres.opened(), cr = HK.UIres && HK.UIres.get();
      if (!oo || !cr) return;
      if (k === 'ocond') { if (cr.input && HK.UIres.copyCond) HK.UIres.copyCond(cr.input, oo.adv); }
      else advCopy(oo.adv);
      return;
    }
    if (!r) return;
    /* 開く：保存した結果だけを表示する（回し直さない）。結果の無いセーブは開かない */
    if (k === 'open') {
      if (!hasRes(r.result)) { toast('このセーブは結果が残っていないため開けません（保存時の版でのみ再現できます）'); return; }
      var shown = JSON.parse(JSON.stringify(r.result));
      if (!shown.ver && r.ver) shown.ver = r.ver;
      if (HK.UIres) HK.UIres.show(shown, { from: 'save', at: r.at, adv: advOf(r.adv) });
      return;
    }
    if (k === 'copycond') { if (HK.UIres && HK.UIres.copyCond && r.result && r.result.input) HK.UIres.copyCond(r.result.input); return; }
    if (k === 'export') { exportRecs([r], 'hakoniwa-save'); return; }
    if (k === 'del') {
      if (!window.confirm('「' + (r.name || r.title || r.scenName) + '」を削除しますか？（元に戻せません）')) return;
      del(r.id).then(function () { cache = null; toast('削除しました'); render(); });
    }
  });
  document.addEventListener('change', function (ev) {
    var t = ev.target;
    if (t.id === 'savefile' && t.files && t.files[0]) {
      var fr = new FileReader();
      fr.onload = function () { importText(String(fr.result)); };
      fr.readAsText(t.files[0]);
      return;
    }
    if (t.id === 'savefilter') { filter = t.value; render(); return; }
    if (t.dataset && t.dataset.sv === 'name') {
      /* 名前だけを書き換える（保存した結果・シードには触れない。rename） */
      var li = t.closest('.saveitem'), id = li && li.dataset.id, nm = t.value.trim().slice(0, 40);
      if (id) rename(id, nm).then(function (ok) { cache = null; toast(ok ? '名前を付けました' : '名前を保存できませんでした'); });
    }
  });

  /* 「経過と結末」に置くボタン。絵は絵文字を使わず線画の SVG（ヘッダーの「セーブ」と同じ形／セーブ済みはチェック） */
  var IC_SAVE = '<svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true"><path d="M2 2.5h7.5L12 5v6.5H2z M4.5 2.5v3h4v-3 M4 11.5V8h6v3.5" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linejoin="round"/></svg>';
  var IC_DONE = '<svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true"><path d="M2.5 7.5l3 3 6-7" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  function button() { return '<div class="row savebar"><button class="btn" id="savebtn" data-act="saveres">' + IC_SAVE + 'この結果をセーブ</button><button class="btn ghost small" data-act="saveresjson" title="ブラウザに保存せず、この結果をそのままJSONファイルに書き出す">JSONで書き出す</button><button class="btn ghost small" data-tab="saves">セーブデータを見る</button></div>'; }

  /* ---------- 保存時の高度設定（2026-10-28）：記録の adv の要約・今の設定との比べ・写す・開いた画面の飾り ----------
     記録（セーブの rec.adv・履歴の rec.adv）は読むだけ。写すのは今の高度設定（HK.Adv.set。欄とエンジンに当たる）で、記録は変えない。
     この画面に節がある欄だけを見る（全年齢版・全年齢モードでは R18 の欄を写さない・数えない） */
  /* 画面での呼び名（ui-adv.js の HK.Adv.LABEL。もとの「高度設定」。2026-10-28 から住人タブの「口調・喘ぎの設定」の対象「全体」） */
  function advLB() { return (HK.Adv && HK.Adv.LABEL) || '全体の口調の設定'; }
  function advSecs() { var A = HK.Adv; return A && A.secs ? A.secs.filter(function (s) { return !(A.RETIRED && A.RETIRED[s.id]); }) : []; }
  function advName(s) { return String(s.title || s.id).replace(/（[^（）]*）\s*$/, ''); }
  /* 要約：「喘ぎの辞書 12行・喘ぎ声の調整あり」の形（文字の欄は空でない行の数、選択欄の節は「あり」）。何も無ければ '' */
  function advLabel(adv) {
    adv = advOf(adv);
    if (!adv) return '';
    var secs = advSecs(), known = {}, txt = [], ui = [], other = 0;
    secs.forEach(function (s) {
      known[s.id] = 1;
      var v = adv[s.id];
      if (!v) return;
      if (s.html) { ui.push(advName(s) + 'あり'); return; }
      var n = v.split(/\r?\n/).filter(function (l) { return l.trim(); }).length;
      txt.push(advName(s) + (n ? ' ' + n + '行' : 'あり'));
    });
    Object.keys(adv).forEach(function (k) { if (!known[k]) other++; });
    /* この画面に節の無い欄（ほかの版・ほかのモードの欄）は、全年齢モード・全年齢版では数えない */
    if (other && !HK.SAFE_ON) ui.push('ほか' + other + '件');
    return txt.concat(ui).join('・');
  }
  /* 写す対象（この画面に節がある欄）：{ id: 文字列 } */
  function advWant(adv) { var a = advOf(adv) || {}, m = {}; advSecs().forEach(function (s) { if (a[s.id]) m[s.id] = a[s.id]; }); return m; }
  function advSame(want) { var A = HK.Adv; return advSecs().every(function (s) { return (A.get(s.id) || '') === (want[s.id] || ''); }); }
  /* 記録の高度設定が今のものと違うか（「条件を箱庭タブに写す」の知らせに1行添えるか） */
  function advDiffers(adv) { var w = advWant(adv); return !!(HK.Adv && Object.keys(w).length && !advSame(w)); }
  function advCopy(adv) {
    var A = HK.Adv, want = advWant(adv), ids = Object.keys(want);
    if (!A || !ids.length) { toast('この記録には、今の版で写せる' + advLB() + 'がありません'); return; }
    if (advSame(want)) { toast('今の' + advLB() + 'は、この記録の保存時と同じです'); return; }
    var cur = A.snap ? A.snap() : null, curAny = cur && advSecs().some(function (s) { return cur[s.id]; });
    if (curAny && !window.confirm('今の' + advLB() + 'を、この記録の保存時のものに置き換えます。よろしいですか？')) return;
    advSecs().forEach(function (s) {
      var v = want[s.id] || '';
      if ((A.get(s.id) || '') === v) return;
      A.set(s.id, v);
    });
    /* 住人タブの「口調・喘ぎの設定」の節が描いてあれば、描き直して合わせる（ui-voice.js） */
    if (HK.VoiceSet && HK.VoiceSet.refresh) HK.VoiceSet.refresh();
    var names = advSecs().filter(function (s) { return want[s.id]; }).map(advName);
    toast(advLB() + 'を写しました（' + names.join('・') + '）。次に箱庭を動かしたときから効きます');
  }
  /* 結果の画面の飾り（ui.js の renderResult から）：セーブ・履歴から開いた結果なら、保存時の版のとなりに高度設定の要約と、
     「条件を箱庭タブに写す」「高度設定を写す」を出す（高度設定の無い記録は要約もボタンも出さない）。履歴の一覧には「高度設定あり」の印 */
  function advDeco(host, res, opened, hist) {
    if (!host) return;
    if (res && opened && !host.querySelector('#advbar')) {
      var lab = advLabel(opened.adv), canCond = !!(res.input && Array.isArray(res.input.chars) && HK.UIres && HK.UIres.copyCond);
      var html = (lab ? '<p class="hint small" id="advnote" style="margin:2px 0 0">' + esc(advLB()) + '：' + esc(lab) + '</p>' : '') +
        '<div class="row openbar" id="advbar" style="margin-top:6px;gap:6px;flex-wrap:wrap">' +
        (canCond ? '<button type="button" class="btn small ghost" data-sv="ocond" title="' + esc('住人・環境・シードを箱庭タブに写す（自動では動かしません。' + advLB() + 'は写しません）') + '">条件を箱庭タブに写す</button>' : '') +
        (lab ? '<button type="button" class="btn small ghost" data-sv="oadv" title="' + esc('今の' + advLB() + 'を、この記録の保存時のものに置き換える（記録は変えません）') + '">' + esc(advLB()) + 'を写す</button>' : '') + '</div>';
      if (!canCond && !lab) html = '';
      var anchor = host.querySelector('#vernote') || host.querySelector('#histnote') || host.querySelector('.resulthead');
      if (html) { if (anchor) anchor.insertAdjacentHTML('afterend', html); else host.insertAdjacentHTML('afterbegin', html); }
    }
    var box = host.querySelector('.hist');
    if (box && Array.isArray(hist)) Array.prototype.forEach.call(box.querySelectorAll('[data-act="hist"]'), function (b) {
      var it = hist[+b.dataset.k];
      if (it && it.ad && it.r && !b.querySelector('.advmark')) b.insertAdjacentHTML('beforeend', '<span class="nums advmark">' + esc(advLB()) + 'あり</span>');
    });
  }
  HK.SavesAdv = { advOf: advOf, label: advLabel, differs: advDiffers, copy: advCopy, deco: advDeco };

  /* put は「新しく足す」だけ（同じ id があれば残す）。portable.js・save-folder.js もこれを使う */
  HK.Saves = { render: render, button: button, save: save, all: all, importText: importText, put: addNew, rename: rename, clear: clear, hasRes: hasRes, DB: DB, STORE: ST, LS: LS };

  /* ---------- 住人のアイコン（画像）の置き場（HK.IconStore）----------
     住人の上限を 200 人にしたので、アイコン（1枚 10〜15KB の data URL）を住人の保存（localStorage の state。控えと合わせて2倍）に入れると、
     ブラウザの保存領域（約5MB。Safari ではもっと少ないことがある）に入りきらない。アイコンだけを IndexedDB（版ごとの名前 HK.STORE.iconDb：
     R18版 hakoniwa-icons／全年齢版 hakoniwa-z-icons）に住人の id で置き、住人の保存からは外す。
     ・セーブの DB（hakoniwa-saves）とは別にする（版を上げると、旧版のページが同じ DB を開けなくなるため）
     ・IndexedDB が使えない環境（プライベートブラウズなど）では、従来どおり住人の保存に入れたまま（strip が何もしない）
     ・ui.js の save()：strip(S) で、IndexedDB に置き終えたアイコンだけを外して書く → sync(S.chars, again) で、まだ置いていないアイコンを置き、
       置き終えたら again()（もう一度 save して外す）。load() が終わるまでは、IndexedDB にあって今の住人にないアイコンを消さない
     ・全年齢版の初めての移行（safe.js の印の ic が 'wait'）では、R18版の置き場（hakoniwa-icons）からアイコンを写す（住人の id は同じ）
     ・まるごと書き出し（portable.js）は、アイコンを住人の保存の中に入れて書き出し（この置き場は書き出さない）、読み込むときに外してここへ置く */
  var IDBN = KS && KS.iconDb ? KS.iconDb : 'hakoniwa-icons', IST = 'icons', ic = { db: null, persisted: {}, loaded: false, busy: false, redo: null };
  function icOpen() {
    if (ic.opening) return ic.opening;
    return (ic.opening = new Promise(function (ok) {
      if (ic.db !== null) return ok(ic.db);
      /* 開くのに返事がない環境（古い Safari の不具合など）では、このページではアイコンの置き場を使わない（住人の保存に入れたまま） */
      var done = false, fin = function (d) { if (done) return; done = true; ic.db = d; ok(d); };
      setTimeout(function () { fin(false); }, 10000);
      try {
        if (!window.indexedDB) return fin(false);
        var rq = indexedDB.open(IDBN, 1);
        rq.onupgradeneeded = function () { var d = rq.result; if (!d.objectStoreNames.contains(IST)) d.createObjectStore(IST, { keyPath: 'id' }); };
        rq.onsuccess = function () { var d = rq.result; if (done) { try { d.close(); } catch (x) { /* なし */ } return; } icMigrate(d).then(function () { fin(d); }); };
        rq.onerror = function (e) { if (e && e.preventDefault) e.preventDefault(); fin(false); };
        rq.onblocked = function () { fin(false); };
      } catch (e) { fin(false); }
    }));
  }
  /* 全年齢版：R18版の置き場から一度だけ写す（無い DB は作らない） */
  function icMigrate(d) {
    var f = KS && KS.zenrei && KS.flag(), OLD = 'hakoniwa-icons';
    if (!f || f.ic !== 'wait' || OLD === IDBN) return Promise.resolve();
    var done = function (n) { KS.setFlag({ ic: n }); };
    return new Promise(function (ok) {
      try {
        var rq = indexedDB.open(OLD), fresh = false;
        rq.onupgradeneeded = function (e) { if (!e.oldVersion) { fresh = true; try { rq.transaction.abort(); } catch (x) { /* なし */ } } };
        rq.onerror = function (e) { if (e && e.preventDefault) e.preventDefault(); if (fresh) done(0); ok(); };
        rq.onblocked = function () { ok(); };
        rq.onsuccess = function () {
          var od = rq.result;
          if (fresh || !od.objectStoreNames.contains(IST)) { od.close(); done(0); return ok(); }
          var g = od.transaction(IST, 'readonly').objectStore(IST).getAll();
          g.onerror = function () { od.close(); ok(); };
          g.onsuccess = function () {
            od.close();
            var list = (g.result || []).filter(function (r) { return r && typeof r.id === 'string' && typeof r.url === 'string'; });
            var tx = d.transaction(IST, 'readwrite'), os = tx.objectStore(IST);
            list.forEach(function (r) { os.put(r); });
            tx.oncomplete = function () { done(list.length); ok(); };
            tx.onerror = tx.onabort = function () { ok(); };
          };
        };
      } catch (e) { ok(); }
    });
  }
  function okUrl(u) { return typeof u === 'string' && /^data:image\//.test(u); }
  /* 書き込み：puts { id: url }、dels [id]、wipe（先に全部消す）。成功したら persisted を合わせて true */
  function icWrite(puts, dels, wipe) {
    return icOpen().then(function (d) {
      if (!d) return false;
      return new Promise(function (ok) {
        try {
          var tx = d.transaction(IST, 'readwrite'), os = tx.objectStore(IST), at = Date.now();
          if (wipe) os.clear();
          Object.keys(puts).forEach(function (id) { os.put({ id: id, url: puts[id], at: at }); });
          (dels || []).forEach(function (id) { os.delete(id); });
          tx.oncomplete = function () {
            if (wipe) ic.persisted = {};
            Object.keys(puts).forEach(function (id) { ic.persisted[id] = puts[id]; });
            (dels || []).forEach(function (id) { delete ic.persisted[id]; });
            ok(true);
          };
          tx.onerror = tx.onabort = function () { ok(false); };
        } catch (e) { ok(false); }
      });
    });
  }
  var IS = HK.IconStore = {
    DB: IDBN, STORE: IST,
    /* 置いてあるアイコンを読む（{ id: url }）。使えなければ {} */
    load: function () {
      return icOpen().then(function (d) {
        if (!d) { ic.loaded = true; return {}; }
        return new Promise(function (ok) {
          try {
            var rq = d.transaction(IST, 'readonly').objectStore(IST).getAll();
            rq.onsuccess = function () { var m = {}; (rq.result || []).forEach(function (r) { if (r && typeof r.id === 'string' && okUrl(r.url)) m[r.id] = r.url; }); ic.persisted = JSON.parse(JSON.stringify(m)); ic.loaded = true; ok(m); };
            rq.onerror = function () { ok({}); };
          } catch (e) { ok({}); }
        });
      });
    },
    /* 住人の保存に書く形：IndexedDB に置き終えたアイコン（同じ画像）だけを外した浅い写し。外すものがなければ S のまま */
    strip: function (S) {
      if (!ic.db || !S || !Array.isArray(S.chars)) return S;
      var any = false, chars = S.chars.map(function (c) {
        if (!c || !c.icon || ic.persisted[c.id] !== c.icon) return c;
        any = true;
        var o = {}; Object.keys(c).forEach(function (k) { if (k !== 'icon') o[k] = c[k]; });
        return o;
      });
      if (!any) return S;
      var o = {}; Object.keys(S).forEach(function (k) { o[k] = S[k]; });
      o.chars = chars;
      return o;
    },
    /* 今の住人に合わせる：まだ置いていないアイコンを置き、（読み込み済みなら）いない住人・外したアイコンを消す。新しく置けたら again() */
    sync: function (chars, again) {
      if (ic.frozen) return;
      if (ic.busy) { ic.redo = { chars: chars, again: again }; return; }
      var want = {}; (chars || []).forEach(function (c) { if (c && c.id && okUrl(c.icon)) want[c.id] = c.icon; });
      var puts = {}, n = 0;
      Object.keys(want).forEach(function (id) { if (ic.persisted[id] !== want[id]) { puts[id] = want[id]; n++; } });
      var dels = ic.loaded ? Object.keys(ic.persisted).filter(function (id) { return !want[id]; }) : [];
      if (!n && !dels.length) return;
      ic.busy = true;
      icWrite(puts, dels, false).then(function (ok) {
        ic.busy = false;
        var r = ic.redo; ic.redo = null;
        /* 新しく置けたら again（save → もう一度 sync するので、待っていた分もそこで合わせる）。でなければ待っていた分を合わせる */
        if (ok && n && again) again();
        else if (r) IS.sync(r.chars, r.again);
      });
    },
    /* まるごと読み込む（置き換え）など：全部を入れ替える。置けたら true（置けなければ、呼ぶ側は住人の保存に入れたまま書く）。
       freeze：読み込み直すまで sync を止める（入れ替えたあと、読み込み直す前のこの画面の住人で消さないように） */
    replaceAll: function (map, freeze) {
      var puts = {}; Object.keys(map || {}).forEach(function (id) { if (okUrl(map[id])) puts[id] = map[id]; });
      ic.frozen = !!freeze;
      return icWrite(puts, [], true).then(function (ok) { if (ok) ic.loaded = true; else ic.frozen = false; return ok; });
    },
    /* 住人の保存の形（JSON の文字列か物）から、アイコンを外して { text, icons } を返す（portable.js の読み込み用） */
    split: function (st) {
      var o = typeof st === 'string' ? (function () { try { return JSON.parse(st); } catch (e) { return null; } })() : st, icons = {};
      if (!o || typeof o !== 'object' || !Array.isArray(o.chars)) return { state: o, icons: icons };
      o = JSON.parse(JSON.stringify(o));
      o.chars.forEach(function (c) { if (c && typeof c.id === 'string' && okUrl(c.icon)) { icons[c.id] = c.icon; delete c.icon; } });
      return { state: o, icons: icons };
    },
    ok: function () { return !!ic.db; }
  };
})();
