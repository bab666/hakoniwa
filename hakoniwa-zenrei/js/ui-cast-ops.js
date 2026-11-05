/* 箱庭診断 ui の部品：住人の行の操作（複製・並び替えのドラッグと上下キー）と、画面の上へ／下へのボタン（2026-11-04 に ui.js から分けた。中核 core。ui.js のすぐ後）
   ui.js の中の状態・関数は HK.UI._k から引く。中身は ui.js にあったときと同じ */
(function () {
  'use strict';
  var HK = window.HK, esc = HK.escape;
  var K = HK.UI && HK.UI._k, UN = HK.UINorm;
  if (!K || !UN) return;
  var MAX = UN.MAX, uid = UN.uid, newReg = UN.newReg, normChar = UN.normChar;
  var save = K.save, renderCast = K.renderCast, toast = K.toast, CP = HK.CastPages || null;
  /* ---------- 住人の複製（住人の行の「複製」） ----------
     その住人の設定（エゴグラム・口調・語尾の設定・辞書・一人称/二人称・性別・恋愛対象・受け攻め・体の設定・好物・箱庭の能力・アイコン・箱庭ごとの設定 など）を
     すべて写した住人を、すぐ下に足す。関係（K.S().ties）と、ほかの住人を指す設定（恋愛相手の固定・性行為の相手の固定・相手ごとの設定・恋愛にしない相手・
     殺さない相手・同一人物）は写さない。名前は「〇〇２」のように、今いる住人と重ならないものにする */
  var DUP_CLEAR = { loveLock: [], sexLocks: [], loveNG: [], loveNo: [], r18No: [], noKillFor: [], calls: {}, keigo: {}, nightFor: {}, posFor: {}, youFor: {}, fpFor: {}, same: '', sameDark: false };
  function zen(n) { return String(n).replace(/\d/g, function (d) { return String.fromCharCode(d.charCodeAt(0) + 0xFEE0); }); }
  function dupName(name) {
    var used = {}; K.S().chars.forEach(function (c) { used[c.name] = 1; });
    var base = String(name || '').replace(/[０-９]+$/, '') || String(name || '名無し');
    for (var n = 2; n < 1000; n++) { var suf = zen(n), nm = base.slice(0, 24 - suf.length) + suf; if (!used[nm]) return nm; }
    return base.slice(0, 16) + Date.now().toString(36).slice(-8);
  }
  function dupChar(src) {
    var ids = {}; K.S().chars.forEach(function (c) { ids[c.id] = 1; });
    var c = JSON.parse(JSON.stringify(src));
    do { c.id = uid(); } while (ids[c.id]);
    c.reg = newReg();
    c.name = dupName(src.name);
    Object.keys(DUP_CLEAR).forEach(function (k) { c[k] = JSON.parse(JSON.stringify(DUP_CLEAR[k])); });
    if (c.sexLock === 'pick' || c.sexLock === 'pickMob') c.sexLock = '';
    /* 念のため：ほかの欄に残った住人の id（あとから足した相手ごとの欄）も外す */
    Object.keys(c).forEach(function (k) {
      var v = c[k];
      if (k === 'id' || k === 'name') return;
      if (typeof v === 'string') { if (ids[v]) c[k] = ''; }
      else if (Array.isArray(v)) c[k] = v.filter(function (x) { return !(typeof x === 'string' && ids[x]); });
      else if (v && typeof v === 'object') Object.keys(v).forEach(function (kk) { if (ids[kk]) delete v[kk]; });
    });
    c = normChar(c);
    /* 箱庭ごとの設定（最初の行動・短期目標・能力値・武器・箱庭の欄）も写す。住人を指す値は外す */
    if (K.S().per && K.S().per[src.id]) {
      var pp = JSON.parse(JSON.stringify(K.S().per[src.id]));
      Object.keys(pp).forEach(function (sid) { var o = pp[sid]; if (o && typeof o === 'object') Object.keys(o).forEach(function (k) { if (typeof o[k] === 'string' && ids[o[k]]) delete o[k]; }); });
      K.S().per[c.id] = pp;
    }
    return c;
  }
  function dupRes(id) {
    var src = K.S().chars.filter(function (c) { return c.id === id; })[0];
    if (!src) return;
    if (K.S().chars.length >= MAX) { toast('住人が上限の' + MAX + '人まで登録されているので、複製できません'); return; }
    var c = dupChar(src);
    K.S().sample = false;
    K.S().chars.splice(K.S().chars.indexOf(src) + 1, 0, c);
    if (CP) CP.reveal(c.id);
    save(); renderCast();
    var q = '「' + src.name + '」を複製して「' + c.name + '」を足しました（関係と、ほかの住人を指す設定は写していません）。\n\n' +
      '「' + c.name + '」を「' + src.name + '」と同一人物にしますか？' +
      (src.same && src.same !== c.id ? '\n（' + src.name + 'はいま別の人と同一人物です。はいを選ぶと、' + c.name + 'の側だけに付けます）' : '') +
      '\n\n［OK］はい（同一人物にする）\n［キャンセル］いいえ';
    if (window.confirm(q)) {
      c.same = src.id;
      if (!src.same) src.same = c.id;
      save(); renderCast();
      toast('「' + c.name + '」を「' + src.name + '」と同一人物にしました');
    } else toast('「' + c.name + '」を足しました');
    var nm = document.getElementById('nm-' + c.id);
    if (nm) { nm.focus(); nm.select(); }
  }
  /* ---------- 住人の並び替え（ドラッグ／上下キー）。Windows・Mac・タッチ共通の Pointer Events ---------- */
  function moveChar(id, to) {
    var from = -1;
    K.S().chars.forEach(function (c, i) { if (c.id === id) from = i; });
    if (from < 0) return;
    to = Math.max(0, Math.min(K.S().chars.length - 1, to));
    if (to === from) return;
    var c = K.S().chars.splice(from, 1)[0];
    K.S().chars.splice(to, 0, c);
    K.S().sample = false;
    if (CP) CP.reveal(id);
    save(); renderCast();
    var h = document.querySelector('.res[data-id="' + id + '"] .draghandle');
    if (h) h.focus();
  }
  var drag = null;
  function clearMarks() { Array.prototype.forEach.call(document.querySelectorAll('.drop-before,.drop-after'), function (r) { r.classList.remove('drop-before', 'drop-after'); }); }
  document.addEventListener('pointerdown', function (ev) {
    var h = ev.target.closest && ev.target.closest('.draghandle');
    if (!h || (ev.pointerType === 'mouse' && ev.button !== 0)) return;
    var row = h.closest('.res');
    if (!row) return;
    ev.preventDefault();
    drag = { row: row, id: row.dataset.id, over: null, before: true, h: h };
    row.classList.add('dragging'); document.body.classList.add('noselect');
    try { h.setPointerCapture(ev.pointerId); } catch (e) {}
  });
  document.addEventListener('pointermove', function (ev) {
    if (!drag) return;
    ev.preventDefault();
    clearMarks();
    var el = document.elementFromPoint(ev.clientX, ev.clientY), r = el && el.closest ? el.closest('#castlist .res') : null;
    if (r && r !== drag.row) {
      var b = r.getBoundingClientRect();
      drag.over = r; drag.before = ev.clientY < b.top + b.height / 2;
      r.classList.add(drag.before ? 'drop-before' : 'drop-after');
    } else drag.over = null;
    if (ev.clientY < 70) window.scrollBy(0, -14); else if (ev.clientY > window.innerHeight - 70) window.scrollBy(0, 14);
  });
  function endDrag() {
    if (!drag) return;
    var d = drag; drag = null;
    clearMarks(); d.row.classList.remove('dragging'); document.body.classList.remove('noselect');
    if (!d.over) return;
    var ids = K.S().chars.map(function (c) { return c.id; }), from = ids.indexOf(d.id), at = ids.indexOf(d.over.dataset.id);
    var to = at + (d.before ? 0 : 1);
    if (from < to) to--;
    moveChar(d.id, to);
    toast('並び順を変えました');
  }
  document.addEventListener('pointerup', endDrag);
  document.addEventListener('pointercancel', endDrag);
  document.addEventListener('keydown', function (ev) {
    var h = ev.target.closest && ev.target.closest('.draghandle');
    if (!h || (ev.key !== 'ArrowUp' && ev.key !== 'ArrowDown')) return;
    ev.preventDefault();
    var id = h.closest('.res').dataset.id, i = K.S().chars.map(function (c) { return c.id; }).indexOf(id);
    /* グループごとの節に分けているときは、同じ節で一つ上（下）に見えている人と入れ替える（ui-cast-pages.js） */
    var to = CP ? CP.step(id, ev.key === 'ArrowUp' ? -1 : 1) : i + (ev.key === 'ArrowUp' ? -1 : 1);
    if (to >= 0) moveChar(id, to);
  });

  /* 画面の上へ／下へ移動するボタン（右下に固定） */
  (function () {
    if (document.getElementById('pagejump')) return;
    var st = document.createElement('style');
    st.textContent = '#pagejump{position:fixed;right:max(10px,env(safe-area-inset-right,0px));bottom:calc(12px + env(safe-area-inset-bottom,0px));display:flex;flex-direction:column;gap:6px;z-index:50}' +
      '#pagejump button{width:40px;height:40px;border-radius:50%;border:1px solid var(--line2,var(--line));background:var(--paper,var(--surface));color:var(--ink);font-size:18px;line-height:1;cursor:pointer;opacity:.92}' +
      '#pagejump button:hover{opacity:1;border-color:var(--ink)}@media print{#pagejump{display:none}}';
    document.head.appendChild(st);
    var d = document.createElement('div');
    d.id = 'pagejump';
    d.innerHTML = '<button type="button" data-jump="top" aria-label="画面のいちばん上へ" title="いちばん上へ">↑</button><button type="button" data-jump="bottom" aria-label="画面のいちばん下へ" title="いちばん下へ">↓</button>';
    d.addEventListener('click', function (ev) {
      var b = ev.target.closest('[data-jump]');
      if (!b) return;
      var y = b.dataset.jump === 'top' ? 0 : Math.max(document.documentElement.scrollHeight, document.body.scrollHeight);
      try { window.scrollTo({ top: y, behavior: 'smooth' }); } catch (e) { window.scrollTo(0, y); }
    });
    document.body.appendChild(d);
  })();

  HK.UI.dupRes = dupRes;
})();
