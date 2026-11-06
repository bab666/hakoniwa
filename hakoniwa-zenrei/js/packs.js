/* 箱庭シミュレーター: 追加パック（HK.Packs）。両方のビルドに同じファイルを置く
   ・追加パックは packs/<枠>/pack.js（枠は set-a〜set-l の決まった名前）。中身は暗号化してあり、コードを入れると開く（HK.PackCrypto）
   ・サイト公開版：packs/index.js（build-pack.js が書く。置いてあるパックの枠の一覧）を読み、そこにある枠だけを読む
     データ配布版：packs/index.js を置かない。決まった名前の枠を全部 script 要素で読みに行き、読めたものだけを使う
     （フォルダの中身を一覧できない file:// でも動くように、fetch は使わない。読めない枠は黙って飛ばす）
   ・開けたパックの中身（かたまりと箱庭の目録）は HK.Load.addPack で本体の目録に足す。かたまりは箱庭を選んだときに読む
   ・入れたコードと開けた鍵は端末の設定（localStorage の hakoniwa-packs。全年齢版は版ごとの鍵）に覚え、次からは聞かない。
     書き出し（portable.js）には入れない
   ・本体とパックの版：パックの api が本体の HK.Packs.API より新しい／本体に無いかたまりが要る → 「本体を新しくしてください」、
     MIN_API より古い → 「追加データを新しくしてください」。R18版のパックは全年齢版では読まない（逆も）
   ・画面（「箱庭を追加」のボタンと入力）は js/packs-ui.js
   設計：docs/reports/2026-11-02/pack-foundation.md */
(function () {
  'use strict';
  var HK = window.HK;
  if (!HK) return;
  /* API 2（2026-11-06）：台詞の印 {一人称}・{二人称} を展開できる本体（voice.js）。印を使うパックは api 2 にする（古い本体では印が画面に出るため「本体を新しくしてください」） */
  var API = 2, MIN_API = 1;
  var SLOTS = ['set-a', 'set-b', 'set-c', 'set-d', 'set-e', 'set-f', 'set-g', 'set-h', 'set-i', 'set-j', 'set-k', 'set-l'];
  var BASE = 'packs/';
  var MF = window.HK_MANIFEST && typeof window.HK_MANIFEST === 'object' ? window.HK_MANIFEST : null;
  var VM = !!(MF && MF.vm);
  function build() { return MF && MF.build ? MF.build : (window.HK_SAFE_BUILD ? 'zenrei' : 'full'); }
  function key() { return HK.STORE && HK.STORE.key ? HK.STORE.key('hakoniwa-packs') : 'hakoniwa-packs'; }
  function readSaved() {
    var o = null;
    try { o = JSON.parse(window.localStorage.getItem(key()) || 'null'); } catch (e) { o = null; }
    return o && typeof o === 'object' && o.p && typeof o.p === 'object' ? o : { v: 1, p: {} };
  }
  function writeSaved(o) { try { window.localStorage.setItem(key(), JSON.stringify(o)); } catch (e) { /* 保存できない環境はこのページ限り */ } }

  var packs = {};     /* 枠 → { pk（pack.js の中身）, st: 'locked'|'open'|'error', err, name, desc, rooms } */
  var subs = [], probing = 0, ready = false, readyFns = [];
  var P = HK.Packs = {
    API: API, MIN_API: MIN_API, SLOTS: SLOTS.slice(), BASE: BASE,
    ready: function () { return ready; },
    onReady: function (fn) { if (ready) fn(); else readyFns.push(fn); },
    on: function (fn) { if (typeof fn === 'function') subs.push(fn); },
    list: function () { return SLOTS.filter(shown).map(function (s) { var x = packs[s]; return { slot: s, id: x.pk.id, name: x.pk.name || x.pk.id, desc: x.pk.desc || '', st: x.st, err: x.err || '', rooms: x.rooms || [] }; }); },
    /* まだ開けていないパックがあるか（「箱庭を追加」のボタンを出すか） */
    hasLocked: function () { return SLOTS.some(function (s) { return shown(s) && packs[s].st !== 'open'; }); },
    /* 追加パックの箱庭か（開けたものだけ分かる） */
    roomOf: function (id) { var r = null; SLOTS.forEach(function (s) { var x = packs[s]; if (x && x.st === 'open' && (x.rooms || []).some(function (q) { return q.id === id; })) r = x; }); return r ? { slot: r.slot, name: r.pk.name } : null; }
  };
  /* 画面に出す枠：R18版の全年齢モードでは、箱庭が全部 R18 のパック（r18only）は出さない */
  function shown(s) { return !!packs[s] && !(packs[s].pk.r18only && HK.SAFE_ON); }
  function emit() { subs.slice().forEach(function (fn) { try { fn(); } catch (e) { setTimeout(function () { throw e; }, 0); } }); }

  /* ---------- 版の確かめ（中身を開く前に、pack.js の表の情報で見る） ---------- */
  function checkHead(pk) {
    if (!pk || pk.f !== 1 || !pk.id) return 'broken';
    if (pk.build && pk.build !== build()) return 'build';
    if ((pk.api || 1) > API) return 'main-old';
    if ((pk.api || 1) < MIN_API) return 'pack-old';
    return '';
  }
  var ERR = {
    broken: '追加データが壊れています。もう一度入れ直してください',
    build: '別の版（R18版と全年齢版）の追加データです',
    'main-old': '本体が古いため開けません。本体を新しくしてください',
    'pack-old': '追加データが古いため開けません。追加データを新しくしてください'
  };
  P.errText = function (code) { return ERR[code] || ERR.broken; };

  /* ---------- 開ける ---------- */
  function register(slot, K) {
    var x = packs[slot], body;
    try { body = JSON.parse(HK.PackCrypto.open(x.pk, K)); } catch (e) { x.st = 'error'; x.err = 'broken'; return false; }
    var bad = checkHead(body);
    if (!bad && HK.Load && HK.Load.missing && HK.Load.missing(body.needs || []).length) bad = 'main-old';
    if (bad) { x.st = 'error'; x.err = bad; return false; }
    x.rooms = (body.order || Object.keys(body.scen || {})).map(function (id) { var s = (body.scen || {})[id] || {}; return { id: id, name: s.name || id }; });
    x.slot = slot;
    if (HK.Load && HK.Load.addPack) HK.Load.addPack({ id: body.id, chunks: body.chunks || {}, scen: body.scen || {}, order: body.order || [] });
    x.st = 'open'; x.err = '';
    return true;
  }
  /* コードを入れる：まだ開けていないパックのうち、そのコードで開くものを全部開ける（まとめ用のコードなら全部）。
     戻り値 { opened: [パックの名前], errors: [{ name, err }], none: 合うパックが無い } */
  P.unlock = function (code) {
    var out = { opened: [], errors: [], none: false }, saved = readSaved(), C = HK.PackCrypto;
    if (!C) { out.none = true; return out; }
    SLOTS.forEach(function (slot) {
      var x = packs[slot];
      if (!x || x.st === 'open' || !shown(slot)) return;
      var head = checkHead(x.pk);
      var K = C.unlock(x.pk, code);
      if (!K) return;
      if (head) { x.st = 'error'; x.err = head; out.errors.push({ name: x.pk.name || x.pk.id, err: head }); return; }
      if (register(slot, K)) {
        out.opened.push(x.pk.name || x.pk.id);
        saved.p[x.pk.id] = { c: C.norm(code), m: x.pk.m, k: C.keyHex(K) };
      } else out.errors.push({ name: x.pk.name || x.pk.id, err: x.err });
    });
    writeSaved(saved);
    out.none = !out.opened.length && !out.errors.length;
    if (out.opened.length || out.errors.length) emit();
    return out;
  };
  /* 覚えているコードで開ける（起動時。中身が同じなら覚えた鍵を、新しい版ならコードから） */
  function autoOpen() {
    var saved = readSaved(), C = HK.PackCrypto, changed = false, any = false;
    if (!C) return;
    SLOTS.forEach(function (slot) {
      var x = packs[slot];
      if (!x || x.st === 'open') return;
      var s = saved.p[x.pk.id];
      if (!s || checkHead(x.pk)) return;
      var K = s.k && s.m === x.pk.m ? C.keyFromHex(s.k) : null;
      if (K) { try { C.open(x.pk, K); } catch (e) { K = null; } }
      if (!K && s.c) { K = C.unlock(x.pk, s.c); if (K) { s.m = x.pk.m; s.k = C.keyHex(K); changed = true; } }
      if (K && register(slot, K)) any = true;
    });
    if (changed) writeSaved(saved);
    if (any) emit();
  }

  /* ---------- pack.js を受け取る（pack.js は window.HK_PACK_Q に積んでから HK.Packs.take() を呼ぶ） ---------- */
  P.take = function () {
    var q = window.HK_PACK_Q;
    if (!Array.isArray(q)) return;
    while (q.length) {
      var pk = q.shift(), slot = pk && pk.slot;
      if (!pk || SLOTS.indexOf(slot) < 0 || packs[slot]) continue;
      packs[slot] = { pk: pk, st: 'locked', err: '' };
      var bad = checkHead(pk);
      if (bad) { packs[slot].st = 'error'; packs[slot].err = bad; }
      /* 起動のあとで届いた枠（遅れて読めたもの）も、覚えているコードで開ける */
      if (ready) { autoOpen(); emit(); }
    }
  };

  /* ---------- 枠を読みに行く ---------- */
  function probe(list) {
    if (!list.length) { finish(); return; }
    probing = list.length;
    list.forEach(function (slot) {
      var s = document.createElement('script');
      s.src = BASE + slot + '/pack.js'; s.async = true;
      s.onload = s.onerror = function () { if (s.parentNode) s.parentNode.removeChild(s); P.take(); if (--probing === 0) finish(); };
      (document.head || document.documentElement).appendChild(s);
    });
  }
  function finish() {
    P.take();
    ready = true;
    autoOpen();
    var fs = readyFns; readyFns = [];
    fs.forEach(function (fn) { try { fn(); } catch (e) { setTimeout(function () { throw e; }, 0); } });
    emit();
  }
  /* packs/index.js（サイト公開版）が呼ぶ */
  window.HK_PACK_INDEX = function (list) { P._index = Array.isArray(list) ? list.filter(function (s) { return SLOTS.indexOf(s) >= 0; }) : []; };
  function start() {
    if (VM || !document.createElement || !(document.head || document.documentElement)) { ready = true; return; }
    var web = /^https?:$/.test(location.protocol);
    if (!web) { probe(SLOTS); return; }
    var s = document.createElement('script');
    s.src = BASE + 'index.js'; s.async = true;
    s.onload = function () { if (s.parentNode) s.parentNode.removeChild(s); probe(P._index || []); };
    s.onerror = function () { if (s.parentNode) s.parentNode.removeChild(s); probe(SLOTS); };
    (document.head || document.documentElement).appendChild(s);
  }
  try { start(); } catch (e) { ready = true; }
})();
