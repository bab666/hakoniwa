/* 箱庭シミュレーター ui: グループ・タグの小さな一覧と、まとめて付ける操作（2026-11-04。late。結果には影響しない）
   描くのは中核の ui-tagsel.js（HK.TagSel）。ここは押したあと：
   ・住人の行の「グループ ▾」「＋タグ」、まとめて付ける帯の「グループに入れる ▾」「タグを付ける ▾」、設定の窓の同じ部品（ui-gear-basic.js が open を呼ぶ）
     → 今ある全グループ／全タグ（名簿の全員から集める）のチェックの一覧。押すたびに入る／外れる（いくつでも）。グループは「なし」で全部外す
     → 「＋ 新しいグループ…」「＋ 新しいタグ…」：名前を入れると、その人（まとめてなら選んだ全員）に付き、以後は一覧に出る
     → 各名前の「⋯」：名前の変更・削除（全員から外す）。グループの名前の変更は ui-cast-tools.js の renameTo（隠す・仲間・ランダムの元・折りたたみ・話題も移す）
   ・PC は押した所の下に浮かぶ小さな一覧、スマホ（599px 以下）は下から出る一覧（幕を押すか × で閉じる）。標準の select は使わない（Windows・Mac・iOS で同じ見た目）
   ・変えたらすぐ保存（HK.UI.save）。行の札はその場で描き直し、閉じたときに住人タブを描き直す（節・絞り込みの札・人数が変わるため）
   ・保存の形は今までどおり c.group・c.tags（読点区切り。グループは 40 字、タグは 80 字まで。超える人には付けずに知らせる） */
(function () {
  'use strict';
  var HK = window.HK;
  if (!HK || !HK.TagSel || typeof document === 'undefined') return;
  var TS = HK.TagSel, esc = HK.escape, B = TS.bulk;
  function UI() { return HK.UI || {}; }
  function S() { return UI().state(); }
  function toast(m) { if (UI().toast) UI().toast(m); }
  function byId(id) { var r = null; S().chars.forEach(function (c) { if (c.id === id) r = c; }); return r; }
  function NM(k) { return TS.K[k].name; }

  var css = '.tspop{outline:none;position:fixed;z-index:80;width:300px;max-width:calc(100vw - 16px);display:flex;flex-direction:column;background:var(--ui-card,var(--paper));color:var(--ui-ink,var(--ink));border:1px solid var(--ui-line2,var(--line));border-radius:12px;box-shadow:0 12px 32px rgba(0,0,0,.18);font-size:13px;overflow:hidden}' +
    '.tsph{display:flex;align-items:center;gap:8px;padding:8px 8px 8px 14px;border-bottom:1px solid var(--ui-line,var(--line))}.tsph b{font-size:14px}.tsph .tspw{flex:1 1 auto;min-width:0;color:var(--ui-muted,var(--muted));font-size:12px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}' +
    '.tspx{appearance:none;-webkit-appearance:none;width:36px;height:36px;border:0;border-radius:8px;background:none;color:var(--ui-muted,var(--muted));font:inherit;font-size:18px;cursor:pointer}.tspx:hover{background:var(--ui-soft,var(--bg1))}' +
    '.tspl{flex:1 1 auto;overflow-y:auto;padding:4px 6px}' +
    '.tspr{display:flex;align-items:stretch;gap:2px}.tspr+.tspr{border-top:1px solid var(--ui-soft2,var(--line))}' +
    '.tspi,.tspm,.tspb{appearance:none;-webkit-appearance:none;font:inherit;color:inherit;cursor:pointer;background:none;border:0;border-radius:8px}' +
    '.tspi{flex:1 1 auto;min-width:0;display:flex;align-items:center;gap:10px;min-height:36px;padding:0 8px;text-align:left}.tspi:hover,.tspm:hover{background:var(--ui-soft,var(--bg1))}' +
    '.tspck{flex:none;width:18px;height:18px;border:1.5px solid var(--ui-line3,var(--muted));border-radius:4px;display:inline-flex;align-items:center;justify-content:center;font-size:12px;line-height:1;color:var(--ui-card,var(--paper))}' +
    '.tspi[aria-checked="true"] .tspck{background:var(--ui-ink,var(--ink));border-color:var(--ui-ink,var(--ink))}.tspi[aria-checked="mixed"] .tspck{background:var(--ui-line3,var(--muted));border-color:var(--ui-line3,var(--muted))}' +
    '.tsp1 .tspck{border-radius:50%}.tspn{flex:1 1 auto;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.tspc{flex:none;color:var(--ui-muted,var(--muted));font-size:11px;font-family:var(--f-num,inherit)}' +
    '.tspm{flex:none;width:36px;color:var(--ui-muted,var(--muted));font-size:16px;letter-spacing:1px}' +
    '.tspsub{display:flex;flex-wrap:wrap;gap:6px;align-items:center;padding:6px 8px 8px 36px}.tspsub p{margin:0;flex:1 1 100%;font-size:12px}' +
    '.tspb{min-height:32px;padding:0 12px;border:1px solid var(--ui-line2,var(--line));background:var(--ui-card,var(--paper))}.tspb.dang{color:var(--ui-danger,#b3261e);border-color:currentColor}.tspb.pri{background:var(--ui-primary,var(--ink));color:var(--ui-primary-ink,var(--paper));border-color:var(--ui-primary,var(--ink))}' +
    '.tspnew{padding:6px;border-top:1px solid var(--ui-line,var(--line))}.tspnew .tspi{color:var(--ui-accent,var(--ink));font-weight:700}' +
    '.tspf{display:flex;gap:6px;align-items:center}.tspf input{flex:1 1 auto;min-width:0;min-height:36px;font-size:16px}' +
    '.tsphint{margin:0;padding:0 14px 8px;color:var(--ui-muted,var(--muted));font-size:11.5px}.tspe{padding:10px 8px;color:var(--ui-muted,var(--muted));font-size:12px}' +
    '.tspscrim{position:fixed;inset:0;z-index:79;background:rgba(10,14,18,.35)}' +
    '@media (max-width:900px),(pointer:coarse){.tspi,.tspm,.tspx{min-height:44px}.tspm{width:44px}.tspx{width:44px;height:44px}.tspb{min-height:40px}.tspf input{min-height:44px}}' +
    '@media (max-width:599px){.tspop{left:0!important;right:0;top:auto!important;bottom:0;width:auto;max-width:none;max-height:78vh!important;border-radius:16px 16px 0 0;padding-bottom:env(safe-area-inset-bottom,0px)}}';
  var stEl = document.createElement('style'); stEl.textContent = css; document.head.appendChild(stEl);

  /* ---------- 書き換え ---------- */
  function setList(c, k, arr) {
    var s = arr.join('、');
    if (s.length > TS.K[k].max) return false;
    c[TS.K[k].f] = s; return true;
  }
  function has(c, k, v) { return TS.list(c, k).indexOf(v) >= 0; }
  function okName(k, v) {
    v = String(v || '').trim().slice(0, 20);
    if (!v) return '';
    if (/[,，、]/.test(v)) { toast(NM(k) + 'の名前に読点（、）やカンマは使えません'); return ''; }
    return v;
  }
  /* targets に v を付ける（on）／外す（!on）。付けられなかった人数を返す */
  function apply(targets, k, v, on) {
    var bad = 0;
    targets.forEach(function (c) {
      var l = TS.list(c, k).slice(), i = l.indexOf(v);
      if (on && i < 0) { l.push(v); if (!setList(c, k, l)) bad++; } else if (!on && i >= 0) { l.splice(i, 1); setList(c, k, l); }
    });
    if (bad) toast((bad === 1 ? '1人' : bad + '人') + 'は' + NM(k) + 'の欄が' + TS.K[k].max + '文字を超えるので、「' + v + '」を付けられませんでした');
    return bad;
  }
  function renameAll(k, o, n) {
    if (k === 'g') { var CT = HK.CastTools; if (!CT || !CT.renameTo) return ''; return CT.renameTo(o, n); }
    n = okName(k, n);
    if (!n || n === o) return '';
    var mem = S().chars.filter(function (c) { return has(c, k, o); }), next = {}, over = 0;
    mem.forEach(function (c) { var l = []; TS.list(c, k).forEach(function (x) { x = x === o ? n : x; if (l.indexOf(x) < 0) l.push(x); }); next[c.id] = l.join('、'); if (next[c.id].length > TS.K[k].max) over++; });
    if (over) { toast('タグの欄が80文字を超える住人がいるので、変えられませんでした（短い名前にしてください）'); return ''; }
    mem.forEach(function (c) { c.tags = next[c.id]; });
    return 'タグ「' + o + '」を「' + n + '」にしました（' + mem.length + '人）';
  }
  function deleteAll(k, v) {
    var St = S(), n = 0;
    St.chars.forEach(function (c) { if (has(c, k, v)) { apply([c], k, v, false); n++; } });
    if (k === 'g') {
      [St.grpHide, St.grpComrade].forEach(function (m) { if (m && m[v]) delete m[v]; });
      if (St.randFrom === v) St.randFrom = '';
    }
    return NM(k) + '「' + v + '」を全員（' + n + '人）から外しました';
  }

  /* ---------- 小さな一覧 ---------- */
  var P = null;   /* { k, ids, bulk, key, done, dirty, mode, el, scrim, gear } */
  function targets() { return P.ids.map(byId).filter(Boolean); }
  function anchor() {
    if (!P) return null;
    var root = P.gear ? document.querySelector('.gearov') : document;
    return root ? root.querySelector(P.bulk ? '[data-ts="' + P.k + '"][data-tsbulk]' : '[data-ts="' + P.k + '"][data-tsid="' + P.key + '"]') : null;
  }
  function paint() {
    /* 描き直しても、押していた所（同じ data-pa・data-v）に注目を戻す（キーボードで続けて選べるように） */
    var fa = document.activeElement, keep = fa && P.el.contains(fa) && fa.getAttribute('data-pa') ? '[data-pa="' + fa.getAttribute('data-pa') + '"]' + (fa.getAttribute('data-v') ? '[data-v="' + (window.CSS && CSS.escape ? CSS.escape(fa.getAttribute('data-v')) : fa.getAttribute('data-v')) + '"]' : '') : '';
    var k = P.k, T = targets(), A = TS.all(k), nm = NM(k), mode = P.mode || '';
    var who = P.bulk ? '選んだ ' + T.length + ' 人に' : (T[0] ? T[0].name + 'に' : '');
    var item = function (v) {
      var n = 0; T.forEach(function (c) { if (has(c, k, v)) n++; });
      var st = !T.length || !n ? 'false' : n === T.length ? 'true' : 'mixed', ev = esc(v);
      var row = '<div class="tspr"><button type="button" class="tspi" role="checkbox" aria-checked="' + st + '" data-pa="tog" data-v="' + ev + '"><span class="tspck" aria-hidden="true">' + (st === 'true' ? '✓' : st === 'mixed' ? '−' : '') + '</span><span class="tspn">' + ev + '</span><span class="tspc">' + A.n[v] + '人</span></button>' +
        '<button type="button" class="tspm" data-pa="menu" data-v="' + ev + '" aria-expanded="' + (mode === 'menu:' + v) + '" aria-label="' + nm + '「' + ev + '」の名前の変更・削除" title="名前の変更・削除">⋯</button></div>';
      if (mode === 'menu:' + v) row += '<div class="tspsub"><button type="button" class="tspb" data-pa="ren" data-v="' + ev + '">名前を変更</button><button type="button" class="tspb dang" data-pa="del" data-v="' + ev + '">削除（全員から外す）</button></div>';
      if (mode === 'ren:' + v) row += '<div class="tspsub tspf"><input type="text" maxlength="20" value="' + ev + '" data-pin="ren" data-v="' + ev + '" aria-label="' + nm + '「' + ev + '」の新しい名前" enterkeyhint="done"><button type="button" class="tspb pri" data-pa="rendo" data-v="' + ev + '">変える</button><button type="button" class="tspb" data-pa="back">やめる</button></div>';
      if (mode === 'del:' + v) row += '<div class="tspsub"><p>「' + ev + '」を全員（' + A.n[v] + '人）から外します。よろしいですか？</p><button type="button" class="tspb dang" data-pa="deldo" data-v="' + ev + '">外す</button><button type="button" class="tspb" data-pa="back">やめる</button></div>';
      return row;
    };
    var none = '';
    if (k === 'g') {
      var any = T.some(function (c) { return TS.list(c, 'g').length; });
      none = '<div class="tspr tsp1"><button type="button" class="tspi" role="checkbox" aria-checked="' + !any + '" data-pa="none"><span class="tspck" aria-hidden="true">' + (any ? '' : '✓') + '</span><span class="tspn">' + (P.bulk ? 'なし（グループから全部外す）' : 'なし') + '</span></button></div>';
    }
    var newRow = mode === 'new' ? '<div class="tspf"><input type="text" maxlength="20" data-pin="new" placeholder="新しい' + nm + 'の名前" aria-label="新しい' + nm + 'の名前" enterkeyhint="done" autocomplete="off"><button type="button" class="tspb pri" data-pa="newdo">付ける</button><button type="button" class="tspb" data-pa="back">やめる</button></div>'
      : '<button type="button" class="tspi" data-pa="new">＋ 新しい' + nm + '…</button>';
    P.el.innerHTML = '<div class="tsph"><b>' + nm + '</b><span class="tspw">' + esc(who) + '</span><button type="button" class="tspx" data-pa="close" aria-label="閉じる">×</button></div>' +
      '<div class="tspl" role="group" aria-label="' + nm + 'を選ぶ（いくつでも）">' + none + A.list.map(item).join('') + (A.list.length ? '' : '<p class="tspe">まだ' + nm + 'はありません。下の「＋ 新しい' + nm + '…」で作れます。</p>') + '</div>' +
      '<div class="tspnew">' + newRow + '</div>' +
      '<p class="tsphint">' + (k === 'g' ? '同じグループの住人は、箱庭でまとめて参加させたり、一覧で絞り込んだり、関係を「グループの全員と」付けたりできます。いくつでも入れられます。' : 'タグは探す・絞り込むための目印です（結果には影響しません）。いくつでも付けられます。') + '</p>';
    var inp = P.el.querySelector('[data-pin]');
    if (inp) { inp.focus(); if (inp.select && mode.indexOf('ren:') === 0) inp.select(); }
    else { var kf = keep && P.el.querySelector(keep); if (kf) kf.focus(); else if (!P.el.contains(document.activeElement)) P.el.focus(); }
    place();
  }
  function place() {
    if (!P) return;
    var el = P.el;
    if (window.innerWidth <= 599) {
      var vv = window.visualViewport, off = vv ? Math.max(0, window.innerHeight - vv.height - vv.offsetTop) : 0;
      el.style.bottom = off + 'px'; return;
    }
    var a = anchor();
    if (!a) return;
    var r = a.getBoundingClientRect(), W = el.offsetWidth || 300, H = window.innerHeight, below = H - r.bottom - 12, above = r.top - 12;
    el.style.left = Math.max(8, Math.min(r.left, window.innerWidth - W - 8)) + 'px';
    if (below >= 260 || below >= above) { el.style.top = (r.bottom + 6) + 'px'; el.style.bottom = 'auto'; el.style.maxHeight = Math.max(160, below) + 'px'; }
    else { el.style.top = 'auto'; el.style.bottom = (H - r.top + 6) + 'px'; el.style.maxHeight = Math.max(160, above) + 'px'; }
  }
  function setExpanded(v) { var a = anchor(); if (a) a.setAttribute('aria-expanded', String(v)); }
  function open(a, opt) {
    close(true);
    var el = document.createElement('div');
    el.className = 'tspop'; el.tabIndex = -1; el.setAttribute('role', 'dialog'); el.setAttribute('aria-label', NM(opt.k) + 'を選ぶ');
    P = { k: opt.k, ids: opt.ids, bulk: !!opt.bulk, key: opt.bulk ? '' : opt.ids[0], done: opt.done, dirty: false, mode: '', el: el, gear: !!(a.closest && a.closest('.gearov')) };
    if (window.innerWidth <= 599) { P.scrim = document.createElement('div'); P.scrim.className = 'tspscrim'; P.scrim.addEventListener('click', function () { close(); }); document.body.appendChild(P.scrim); }
    document.body.appendChild(el);
    el.addEventListener('click', onPop);
    el.addEventListener('keydown', onKey);
    paint();
    setExpanded(true);
    var f = el.querySelector('.tspi'); if (f && f.focus && window.innerWidth > 599) f.focus();
  }
  function close(quiet) {
    if (!P) return;
    var p = P; P = null;
    p.el.remove(); if (p.scrim) p.scrim.remove();
    if (p.dirty) { if (p.k === 'g' && HK.TopicsUI && HK.TopicsUI.syncSave) HK.TopicsUI.syncSave(); if (p.done) p.done(); }
    if (quiet) return;
    P = p; var a = anchor(); P = null;
    if (a) { a.setAttribute('aria-expanded', 'false'); try { a.focus({ preventScroll: true }); } catch (e) { a.focus(); } }
  }
  /* 変えたあと：保存して、見えている行の札を描き直す（住人タブ全体は閉じたときに） */
  function changed(msg) {
    UI().save(); P.dirty = true; P.mode = '';
    if (!P.gear) lines();
    paint(); setExpanded(true);
    if (msg) toast(msg);
  }
  function lines() {
    Array.prototype.forEach.call(document.querySelectorAll('#view-cast .res[data-id] > .tsline'), function (ln) {
      var c = byId(ln.parentNode.getAttribute('data-id')); if (c) ln.outerHTML = TS.line(c);
    });
  }
  function onKey(ev) {
    if (ev.key === 'Escape') { ev.stopPropagation(); ev.preventDefault(); if (P && P.mode) { P.mode = ''; paint(); } else close(); return; }
    if (ev.key === 'Enter' && ev.target.getAttribute && ev.target.getAttribute('data-pin')) {
      ev.preventDefault(); var w = ev.target.getAttribute('data-pin');
      act(w === 'new' ? 'newdo' : 'rendo', ev.target.getAttribute('data-v'));
    }
  }
  function onPop(ev) {
    ev.stopPropagation();
    var b = ev.target.closest('[data-pa]');
    if (b) act(b.getAttribute('data-pa'), b.getAttribute('data-v'));
  }
  function act(a, v) {
    if (!P) return;
    var k = P.k, T = targets();
    switch (a) {
      case 'close': close(); return;
      case 'back': P.mode = ''; paint(); return;
      case 'new': P.mode = 'new'; paint(); return;
      case 'menu': P.mode = P.mode === 'menu:' + v ? '' : 'menu:' + v; paint(); return;
      case 'ren': P.mode = 'ren:' + v; paint(); return;
      case 'del': P.mode = 'del:' + v; paint(); return;
      case 'none': T.forEach(function (c) { c.group = ''; }); changed(); return;
      case 'tog': {
        if (!T.length) { toast('先に住人を選んでください'); return; }
        var all = T.every(function (c) { return has(c, k, v); });
        apply(T, k, v, !all); changed(); return;
      }
      case 'newdo': {
        var inp = P.el.querySelector('[data-pin="new"]'), n = okName(k, inp && inp.value);
        if (!n) { if (inp) inp.focus(); return; }
        if (!T.length) { toast('先に住人を選んでください'); return; }
        var bad = apply(T, k, n, true);
        changed(bad < T.length ? (P.bulk ? (T.length - bad) + '人を' : '') + NM(k) + '「' + n + '」' + (k === 'g' ? 'に入れました' : 'を付けました') : ''); return;
      }
      case 'rendo': {
        var ri = P.el.querySelector('[data-pin="ren"]'), msg = renameAll(k, v, ri ? ri.value : '');
        if (msg) changed(msg); else { P.mode = ''; paint(); }
        return;
      }
      case 'deldo': changed(deleteAll(k, v)); return;
    }
  }

  /* ---------- 住人の行・まとめて付ける帯 ---------- */
  function host() { return document.getElementById('view-cast'); }
  function redrawCast() { UI().save(); if (UI().renderCast) UI().renderCast(); }
  function bar() { var b = document.querySelector('#view-cast .tsbulk'); if (b) b.outerHTML = TS.bulkBar(); }
  function bulk(on) {
    B.on = on; if (!on) B.sel = Object.create(null);
    var h = host(); if (h) { if (on) h.setAttribute('data-tsbulk', ''); else h.removeAttribute('data-tsbulk'); }
    /* PC・タブレットは帯を上に止める：上に止まるタブ（nav.tabs）の下に */
    var nav = document.querySelector('nav.tabs'); if (h && nav) h.style.setProperty('--tsb-top', Math.round(nav.getBoundingClientRect().height) + 'px');
    redrawCast();
    if (on) toast('住人の左のチェックで選んで、「グループに入れる」「タグを付ける」を押してください');
  }
  document.addEventListener('click', function (ev) {
    var t = ev.target;
    if (!t.closest) return;
    /* 一覧の外を押したら閉じる（PC。スマホは幕） */
    if (P && !P.el.contains(t) && !t.closest('[data-ts]')) close(true);
    if (t.closest('.gearov')) return;   /* 設定の窓の中は ui-gear-basic.js が受ける */
    var o = t.closest('[data-ts]');
    if (o) {
      ev.preventDefault();
      var k = o.getAttribute('data-ts'), isB = o.hasAttribute('data-tsbulk');
      if (P && P.k === k && (isB ? P.bulk : P.key === o.getAttribute('data-tsid'))) { close(); return; }
      var ids = isB ? Object.keys(B.sel).filter(byId) : [o.getAttribute('data-tsid')];
      if (!ids.length) { toast('先に住人を選んでください'); return; }
      open(o, { k: k, ids: ids, bulk: isB, done: function () { if (UI().renderCast) UI().renderCast(); } });
      return;
    }
    var x = t.closest('[data-tsx]');
    if (x) {
      var c = byId(x.getAttribute('data-tsid')), v = x.getAttribute('data-v');
      if (!c) return;
      apply([c], x.getAttribute('data-tsx'), v, false); redrawCast();
      var ad = document.querySelector('#view-cast .res[data-id="' + c.id + '"] .tsadd'); if (ad) ad.focus();
      toast(c.name + 'のタグ「' + v + '」を外しました');
      return;
    }
    var bb = t.closest('[data-tsb]');
    if (bb) {
      var w = bb.getAttribute('data-tsb');
      if (w === 'on' || w === 'off') { bulk(w === 'on'); return; }
      if (w === 'none') B.sel = Object.create(null);
      if (w === 'page') Array.prototype.forEach.call(document.querySelectorAll('#view-cast .res[data-id]:not([hidden])'), function (r) { B.sel[r.getAttribute('data-id')] = 1; });
      Array.prototype.forEach.call(document.querySelectorAll('#view-cast [data-tssel]'), function (cb) { cb.checked = !!B.sel[cb.getAttribute('data-tssel')]; });
      bar();
    }
  });
  document.addEventListener('change', function (ev) {
    var cb = ev.target;
    if (!cb.getAttribute || !cb.hasAttribute('data-tssel')) return;
    var id = cb.getAttribute('data-tssel');
    if (cb.checked) B.sel[id] = 1; else delete B.sel[id];
    bar();
  });
  /* 注目が一覧の外にあっても Esc で閉じる（設定の窓は閉じない） */
  document.addEventListener('keydown', function (ev) { if (P && ev.key === 'Escape' && !P.el.contains(ev.target)) { ev.stopPropagation(); ev.preventDefault(); close(); } }, true);
  window.addEventListener('resize', place);
  window.addEventListener('scroll', function () { if (P && window.innerWidth > 599) place(); }, true);
  if (window.visualViewport) window.visualViewport.addEventListener('resize', place);

  /* 設定の窓（ui-gear-basic.js）から：開く・札の × で外す */
  HK.TagSelPop = {
    open: function (a, c, done) { open(a, { k: a.getAttribute('data-ts'), ids: [c.id], done: done }); },
    remove: function (c, k, v) { apply([c], k, v, false); UI().save(); },
    close: close, isOpen: function () { return !!P; }
  };
})();
