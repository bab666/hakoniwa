/* 箱庭シミュレーター: 画面の土台（2026-11-01 担当UA。参考デザイン docs/reports/2026-11-01/ui-redesign.md の見本 01〜04。結果には影響しない）
   ・ヘッダーの「表示（色・明るさ・書体）▾」のメニュー：開く・閉じる（外を押す・Esc）。中の 色味 標準／ブルー（data-scm。2026-11-02 担当UD）・単色／キャラ色／フル（data-pal）・明るさ（data-thm）・書体（data-fnt）は
     index.html の先頭のスクリプトが処理する。データの先読み（http(s) で配っているときだけ。load.js の HK.Load.pref／setPref）はここで描いて、
     選んだときは ui.js の data-f="prefetch" の処理（箱庭タブの欄と同じ）に任せる
   ・住人タブの節の切替「住人一覧｜口調の全体設定｜話題 n｜関係 n」（HK.Shell.pane／setPane）。描き直さずに [data-pane] の hidden を付け替える。
     選んだ節は表示用の保存 castpane に置く（住人の保存 state には入れない）
   ・小さなメニュー（住人の行の「⋯」など）：[data-uimenu] のボタンが aria-controls の要素を開け閉めする（外を押す・Esc・項目を押すと閉じる）
   ・「診断結果をまとめて取り込む」（data-uia="imp"）：住人タブの取り込みの欄（#castimp。details）を開け閉めする
   ・サンプルの住人の案内の「×」（data-uia="samplehide"）：このページを開いているあいだだけ隠す
   ui.js より前に読む（renderCast が HK.Shell.pane() で今の節を読む） */
(function () {
  'use strict';
  var HK = window.HK;
  if (!HK || typeof document === 'undefined') return;
  var PANES = ['list', 'voice', 'topics', 'ties'];
  var pane = 'list';
  try { var v = HK.store ? HK.store.get('castpane', null) : null; if (PANES.indexOf(v) >= 0) pane = v; } catch (e) { /* 読めなければ住人一覧 */ }
  var sampleHidden = false;

  function setPane(k, focus) {
    if (PANES.indexOf(k) < 0) k = 'list';
    pane = k;
    try { if (HK.store) HK.store.set('castpane', k); } catch (e) { /* 保存できなくても切り替えはできる */ }
    var host = document.getElementById('view-cast');
    if (!host) return;
    Array.prototype.forEach.call(host.querySelectorAll('[data-pane]'), function (p) { p.hidden = p.getAttribute('data-pane') !== k; });
    Array.prototype.forEach.call(host.querySelectorAll('[data-uipane]'), function (b) {
      var on = b.getAttribute('data-uipane') === k;
      b.setAttribute('aria-selected', on ? 'true' : 'false'); b.tabIndex = on ? 0 : -1;
      if (on && focus) b.focus();
    });
    host.setAttribute('data-castpane', k);
  }

  /* ---------- 表示のメニュー ---------- */
  function dispBtn() { return document.querySelector('[data-uidisp]'); }
  function dispMenu() { return document.getElementById('uidisp-menu'); }
  function prefHtml() {
    if (!HK.Load || !HK.Load.manifest || !HK.Load.setPref || !/^https?:$/.test(location.protocol)) return '';
    var v = HK.Load.pref(), o = function (k, l) { return '<option value="' + k + '"' + (v === k ? ' selected' : '') + '>' + l + '</option>'; };
    return '<div class="uidm-row"><label class="uidm-h" for="prefetch-top">データの先読み</label><select id="prefetch-top" data-f="prefetch">' + o('auto', '自動（おすすめ）') + o('all', 'すべて先読み') + o('pick', '選んだ箱庭だけ') + '</select>' +
      '<span class="uidm-note">パソコンでは裏で先に読み込みます。スマホでは選んだ箱庭だけ読みます</span></div>';
  }
  function openDisp() {
    var m = dispMenu(), b = dispBtn();
    if (!m || !b) return;
    var pf = m.querySelector('.uidm-pref'); if (pf) pf.innerHTML = prefHtml();
    m.hidden = false; b.setAttribute('aria-expanded', 'true');
    var f = m.querySelector('button,select'); if (f) try { f.focus({ preventScroll: true }); } catch (e) { f.focus(); }
  }
  function closeDisp(back) {
    var m = dispMenu(), b = dispBtn();
    if (!m || m.hidden) return;
    m.hidden = true; if (b) { b.setAttribute('aria-expanded', 'false'); if (back) b.focus(); }
  }

  /* ---------- 小さなメニュー（⋯） ---------- */
  var openMenu = null;
  function closeMenu(back) {
    if (!openMenu) return;
    var m = openMenu; openMenu = null;
    m.menu.hidden = true; m.btn.setAttribute('aria-expanded', 'false');
    var row = m.btn.closest('.res'); if (row) row.classList.remove('menuon');
    if (back && m.btn.isConnected) m.btn.focus();
  }
  function toggleMenu(btn) {
    var id = btn.getAttribute('aria-controls'), menu = id && document.getElementById(id);
    if (!menu) return;
    if (openMenu && openMenu.menu === menu) { closeMenu(true); return; }
    closeMenu();
    menu.hidden = false; btn.setAttribute('aria-expanded', 'true');
    var row = btn.closest('.res'); if (row) row.classList.add('menuon');
    /* 画面の下にはみ出すときは上に開く */
    menu.classList.remove('up');
    var r = menu.getBoundingClientRect();
    if (r.bottom > window.innerHeight - 8 && btn.getBoundingClientRect().top - r.height > 8) menu.classList.add('up');
    openMenu = { btn: btn, menu: menu };
    var f = menu.querySelector('[role=menuitem]:not([disabled])'); if (f) f.focus();
  }

  document.addEventListener('click', function (ev) {
    var t = ev.target && ev.target.closest ? ev.target : null;
    if (!t) return;
    /* 表示のメニュー */
    var db = t.closest('[data-uidisp]'), dm = dispMenu();
    if (db) { if (dm && dm.hidden) openDisp(); else closeDisp(); return; }
    if (dm && !dm.hidden && !dm.contains(t)) closeDisp();
    /* 小さなメニュー：項目を押したら閉じる（項目の処理は ui.js などが続けて行う）。外を押したら閉じる */
    var mb = t.closest('[data-uimenu]');
    if (mb) { toggleMenu(mb); return; }
    if (openMenu) { if (!openMenu.menu.contains(t) || t.closest('[role=menuitem]')) closeMenu(); }
    /* 節の切替 */
    var pb = t.closest('[data-uipane]');
    if (pb) { setPane(pb.getAttribute('data-uipane')); return; }
    var ua = t.closest('[data-uia]');
    if (!ua) return;
    var k = ua.getAttribute('data-uia');
    if (k === 'imp') {
      var d = document.getElementById('castimp');
      if (!d) return;
      if (pane !== 'list') setPane('list');
      d.open = !d.open || ua.hasAttribute('data-only-open');
      ua.setAttribute('aria-expanded', d.open ? 'true' : 'false');
      if (d.open) { var b = document.getElementById('bulk'); if (b) { try { d.scrollIntoView({ block: 'nearest' }); } catch (e) { /* 古い環境 */ } try { b.focus({ preventScroll: true }); } catch (e2) { b.focus(); } } }
    } else if (k === 'samplehide') {
      sampleHidden = true;
      var n = document.getElementById('samplebar'); if (n) n.hidden = true;
    } else if (k === 'tolist') setPane('list');
  });
  document.addEventListener('keydown', function (ev) {
    if (ev.key === 'Escape') {
      var dm = dispMenu();
      if (dm && !dm.hidden) { ev.preventDefault(); closeDisp(true); return; }
      if (openMenu) { ev.preventDefault(); closeMenu(true); return; }
    }
    /* 小さなメニューの中は上下の矢印で動く */
    if (openMenu && (ev.key === 'ArrowDown' || ev.key === 'ArrowUp') && openMenu.menu.contains(document.activeElement)) {
      var its = Array.prototype.filter.call(openMenu.menu.querySelectorAll('[role=menuitem]'), function (e) { return !e.disabled; }), i = its.indexOf(document.activeElement);
      ev.preventDefault(); var nx = its[(i + (ev.key === 'ArrowDown' ? 1 : its.length - 1)) % its.length]; if (nx) nx.focus();
      return;
    }
    /* 節の切替は左右の矢印でも */
    var pb = ev.target && ev.target.closest && ev.target.closest('[data-uipane]');
    if (pb && (ev.key === 'ArrowRight' || ev.key === 'ArrowLeft')) {
      var bs = Array.prototype.slice.call(pb.parentNode.querySelectorAll('[data-uipane]')), j = bs.indexOf(pb);
      ev.preventDefault(); var to = bs[(j + (ev.key === 'ArrowRight' ? 1 : bs.length - 1)) % bs.length]; if (to) setPane(to.getAttribute('data-uipane'), true);
    }
  });

  HK.Shell = {
    pane: function () { return pane; },
    setPane: setPane,
    sampleHidden: function () { return sampleHidden; },
    closeMenu: closeMenu
  };
})();
