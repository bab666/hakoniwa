/* 箱庭シミュレーター: 箱庭タブの参加表（住人ごとの初動と目標）の縮尺と表の形／PC の「箱庭を動かす」の浮いたボタン（全年齢版・R18版共通。late）
   ・参加表の上に「表示：縮尺 [−] 100% [＋] 全体を表示、表の形：積む／並べる」を置く（ui-box-draw.js が表の外を作り直しても、見張って置き直す）。
     縮尺は 50〜100%（10% 刻み）。CSS の zoom で表だけを縮める（zoom が効かないブラウザは transform: scale() と余白の補正）。
     「全体を表示」は、表が枠の幅に収まる縮尺を計算して当てる（枠の幅が変わったら計算し直す。もう一度押すと 100% と元の表の形に戻る）。
     「積む」は住人ごとに欄を縦に積む形（列の見出しは各欄の上。ui-mobile.js の data-label）、「並べる」はいつもの表。既定はどちらの幅でも「並べる」
     （スマホの参加表は第5ラウンドで利用者の希望により表の形に戻しているため）。「全体を表示」のときは「並べる」で収める。
     選んだ縮尺・形はブラウザに残す（鍵 hakoniwa:perzoom。箱庭を変えても同じ）。
     スマホ（幅 760px 以下・指で触る画面）では、触った（押し始めた）・選んだ入力欄だけ文字を「16px ÷ 縮尺」にして（.pz-focus。CSS は index.html）、
     iOS が欄を選んだときに自動で拡大しないようにする（実際の大きさを 16px 以上に。欄の幅はそのまま。離れたら戻す）。ほかの欄は表といっしょに縮む。
   ・PC 幅（601px 以上。600px 以下は ui-mobile.js が帯を画面の下に固定する）で箱庭タブを見ているあいだ、本物の帯（.runbar）が画面に見えていなければ
     右下（上へ／下へのボタンの左）に「箱庭を動かす」の浮いたボタン（.runfab）を出す。押すと帯のボタンと同じ動作（data-act="run"。シードの欄はそのまま）。
     参加する人数が足りない・箱庭が選ばれていないときは押せない（帯のボタンが押せないときも同じ disabled と title）。 */
(function () {
  'use strict';
  var HK = window.HK;
  if (!HK || typeof document === 'undefined') return;

  var STEPS = [0.5, 0.6, 0.7, 0.8, 0.9, 1], FIT_MIN = 0.3;
  var KEY = HK.STORE && HK.STORE.key ? HK.STORE.key('hakoniwa:perzoom') : 'hakoniwa:perzoom';
  var st = { z: 1, fit: false, form: '', back: '' };
  try { var sv = JSON.parse(localStorage.getItem(KEY) || 'null'); if (sv && typeof sv === 'object') { if (STEPS.indexOf(+sv.z) >= 0) st.z = +sv.z; st.fit = !!sv.fit; if (sv.form === 'stack' || sv.form === 'row') st.form = sv.form; if (sv.back === 'stack' || sv.back === 'row') st.back = sv.back; } } catch (e) { /* 読めなければ既定 */ }
  function save() { try { localStorage.setItem(KEY, JSON.stringify(st)); } catch (e) { /* 残せなくても操作はできる */ } }
  var ZOOM = typeof CSS !== 'undefined' && CSS.supports && CSS.supports('zoom', '0.8');
  var mq = function (q) { return !!(window.matchMedia && window.matchMedia(q).matches); };
  function form() { return st.fit ? 'row' : st.form || 'row'; }
  function pct(z) { return Math.round(z * 100) + '%'; }

  /* ---------- 参加表の操作の帯 ---------- */
  var BAR = '<span class="pz-k">表示</span><span class="pz-g"><span class="pz-k2">縮尺</span>' +
    '<button type="button" data-pz="out" aria-label="参加表を縮小">−</button><output class="pz-v" aria-live="polite">100%</output><button type="button" data-pz="in" aria-label="参加表を拡大">＋</button>' +
    '<button type="button" data-pz="fit" class="pz-fit" aria-pressed="false" title="表の全体が横にスクロールせずに見える大きさにします（もう一度押すと 100% に戻ります）">全体を表示</button></span>' +
    '<span class="pz-g" role="group" aria-label="表の形"><span class="pz-k2">表の形</span><span class="pz-seg"><button type="button" data-pz="stack" aria-pressed="false" title="住人ごとに欄を縦に積みます">積む</button><button type="button" data-pz="row" aria-pressed="false" title="住人を1行ずつ表に並べます">並べる</button></span></span>';
  /* 参加表（見出しの先頭が「参加」の表）の枠 */
  function wraps(host) {
    return Array.prototype.filter.call(host.querySelectorAll('.tblwrap'), function (w) {
      var th = w.querySelector(':scope>table.per>thead th');
      return th && th.textContent.trim() === '参加';
    });
  }
  /* 枠の前の操作の帯（間に「横にスクロールできます」の一文があってもよい） */
  function barOf(w) {
    var p = w.previousElementSibling;
    if (p && p.classList.contains('tblhint')) p = p.previousElementSibling;
    return p && p.classList.contains('perzoom') ? p : null;
  }
  function ensure(w) {
    var b = barOf(w);
    if (b) return b;
    b = document.createElement('div');
    b.className = 'perzoom nofold';
    b.setAttribute('role', 'group');
    b.setAttribute('aria-label', '参加表の表示');
    b.innerHTML = BAR;
    var p = w.previousElementSibling;
    w.parentNode.insertBefore(b, p && p.classList.contains('tblhint') ? p : w);
    return b;
  }
  /* 縮尺を当てる（zoom。効かないときは transform と、縮んだぶんの余白を負の margin で詰める） */
  function setZ(w, z) {
    var t = w.querySelector(':scope>table.per');
    if (!t) return;
    w.style.setProperty('--pz', String(z));
    if (ZOOM) return;
    w.classList.add('pz-tf');
    t.style.width = z < 1 ? (100 / z) + '%' : '';
    t.style.marginRight = t.style.marginBottom = '';
    if (z < 1) { t.style.marginRight = -(t.offsetWidth * (1 - z)) + 'px'; t.style.marginBottom = -(t.offsetHeight * (1 - z)) + 'px'; }
  }
  /* 表が枠の幅に収まる縮尺（丸めで少しはみ出すことがあるので、数回あてて詰める） */
  function fitZ(w) {
    var t = w.querySelector(':scope>table.per'), W = w.clientWidth;
    if (!t || !W) return null;
    var z = 1;
    for (var i = 0; i < 6; i++) {
      setZ(w, z);
      var tw = t.getBoundingClientRect().width;
      if (tw <= W + 0.5 || z <= FIT_MIN) break;
      var nz = Math.floor(z * W / tw * 100) / 100;
      z = Math.max(FIT_MIN, nz < z ? nz : z - 0.01);
    }
    return z;
  }
  function apply(w) {
    var b = ensure(w), f = form();
    if (w.classList.contains('pz-stack') !== (f === 'stack')) w.classList.toggle('pz-stack', f === 'stack');
    w.classList.add('pz');
    var z = st.fit ? fitZ(w) : st.z;
    if (z == null) z = +w.dataset.pzFit || 1;
    if (st.fit) { w.dataset.pzFit = String(z); w.dataset.pzW = String(w.clientWidth); } else { delete w.dataset.pzFit; delete w.dataset.pzW; }
    setZ(w, z);
    b.setAttribute('data-form', f);
    if (st.fit) b.setAttribute('data-fit', ''); else b.removeAttribute('data-fit');
    var v = b.querySelector('.pz-v'); if (v && v.textContent !== pct(z)) v.textContent = pct(z);
    var q = function (k) { return b.querySelector('[data-pz="' + k + '"]'); };
    q('out').disabled = !st.fit && st.z <= STEPS[0];
    q('in').disabled = !st.fit && st.z >= 1;
    q('fit').setAttribute('aria-pressed', String(st.fit));
    q('stack').setAttribute('aria-pressed', String(f === 'stack'));
    q('row').setAttribute('aria-pressed', String(f === 'row'));
  }
  var vb = null, raf = 0;
  function all() { raf = 0; if (vb) wraps(vb).forEach(apply); }
  function soon() { if (!raf) raf = (window.requestAnimationFrame || setTimeout)(all); }
  function act(k, w) {
    var cur = st.fit ? +(w && w.dataset.pzFit) || 1 : st.z;
    if (k === 'out' || k === 'in') {
      var nx = k === 'out' ? STEPS.filter(function (s) { return s < cur - 0.001; }).pop() : STEPS.filter(function (s) { return s > cur + 0.001; })[0];
      if (st.fit) { st.fit = false; st.form = st.back || st.form; }
      st.z = nx || (k === 'out' ? STEPS[0] : 1);
    } else if (k === 'fit') {
      if (st.fit) { st.fit = false; st.z = 1; st.form = st.back || ''; }
      else { st.back = st.form; st.fit = true; }
    } else if (k === 'stack' || k === 'row') {
      if (st.fit) { st.fit = false; st.z = STEPS.filter(function (s) { return s <= cur + 0.001; }).pop() || STEPS[0]; }
      st.form = k;
    }
    save();
    all();
  }

  /* ---------- スマホ：触った・選んだ入力欄だけ文字を 16px 相当に（iOS の自動ズームを避ける） ---------- */
  var FOCUS_Q = '.tblwrap.pz>table.per td select, .tblwrap.pz>table.per td input[type="text"]';
  function grow(el) {
    if (!el || el.classList.contains('pz-focus') || !mq('(max-width: 760px), (pointer: coarse)')) return;
    el.style.width = el.offsetWidth + 'px';   /* 文字が大きくなっても欄の幅（と表の並び）は変えない */
    el.classList.add('pz-focus');
  }
  function shrink(el) { if (el && el.classList.contains('pz-focus')) { el.classList.remove('pz-focus'); el.style.width = ''; } }
  function inField(t) { return t && t.closest && vb && vb.contains(t) ? t.closest(FOCUS_Q) : null; }

  /* ---------- PC の浮いたボタン ---------- */
  var fab = document.createElement('button');
  fab.type = 'button';
  fab.className = 'runfab';
  fab.setAttribute('data-act', 'run');
  fab.setAttribute('aria-label', '箱庭を動かす（画面の下の帯と同じ）');
  fab.textContent = '箱庭を動かす';
  fab.hidden = true;
  var barSeen = false, io = null, seenBar = null;
  /* 参加する人数（ui.js の joined と同じ数え方：未設定なら先頭から上限まで） */
  function lack() {
    var S = HK.UI && HK.UI.state ? HK.UI.state() : null;
    if (!S) return '';
    var sc = !S.scenId ? null : HK.Load && HK.Load.info ? HK.Load.info(S.scenId) : HK.SCENARIOS && HK.SCENARIOS[S.scenId];
    if (!sc) return '箱庭を選んでください';
    var mn = sc.minCast || 2, mx = Math.min(sc.maxCast || 12, 35), list = S.join && S.join[S.scenId], chars = S.chars || [];
    var n = list ? chars.filter(function (c) { return list.indexOf(c.id) >= 0; }).length : Math.min(chars.length, mx);
    if (n < mn) return mn === 1 ? '挑戦する住人を1人選んでください' : '参加する住人を' + mn + '人以上選んでください';
    return '';
  }
  function runBtn() { return vb && vb.querySelector(':scope>.runbar [data-act="run"]'); }
  function fabSync() {
    var rb = runBtn(), bar = rb && rb.closest('.runbar');
    if (bar !== seenBar) {
      if (io) { io.disconnect(); if (bar) io.observe(bar); }
      seenBar = bar; barSeen = false;
      if (bar) barSeen = (function () { var r = bar.getBoundingClientRect(); return r.bottom > 0 && r.top < window.innerHeight; })();
    }
    var show = !!rb && !vb.hidden && mq('(min-width: 601px)') && !barSeen && !mq('print');
    if (fab.hidden === show) fab.hidden = !show;
    if (!show) return;
    var why = rb.disabled ? rb.title || '' : lack();
    fab.disabled = !!(rb.disabled || why);
    if (why) fab.title = why; else fab.removeAttribute('title');
  }
  if (typeof IntersectionObserver !== 'undefined') io = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.target === seenBar) barSeen = e.isIntersecting; }); fabSync(); });
  else window.addEventListener('scroll', function () { seenBar = null; fabSync(); }, { passive: true });

  function init() {
    vb = document.getElementById('view-box');
    if (!vb) return;
    document.body.appendChild(fab);
    vb.addEventListener('click', function (ev) {
      var b = ev.target.closest && ev.target.closest('.perzoom [data-pz]');
      if (!b || b.disabled) return;
      var bar = b.closest('.perzoom'), w = bar.nextElementSibling;
      if (w && w.classList.contains('tblhint')) w = w.nextElementSibling;
      act(b.getAttribute('data-pz'), w);
    });
    vb.addEventListener('pointerdown', function (ev) {
      var el = inField(ev.target);
      if (!el) return;
      grow(el);
      /* 押しただけで選ばなかった（なぞってスクロールした）ときは戻す */
      setTimeout(function () { if (document.activeElement !== el) shrink(el); }, 700);
    }, true);
    vb.addEventListener('focusin', function (ev) { grow(inField(ev.target)); });
    vb.addEventListener('focusout', function (ev) { shrink(inField(ev.target)); });
    var tick = function () { soon(); fabSync(); };
    if (typeof MutationObserver !== 'undefined') {
      new MutationObserver(tick).observe(vb, { childList: true, subtree: true });
      new MutationObserver(tick).observe(vb, { attributes: true, attributeFilter: ['hidden'] });
    }
    /* 枠の幅が変わった（画面の回転・窓の大きさ）ら「全体を表示」を計算し直す */
    if (typeof ResizeObserver !== 'undefined') {
      var ro = new ResizeObserver(function () { if (st.fit && wraps(vb).some(function (w) { return Math.abs(w.clientWidth - (+w.dataset.pzW || 0)) > 16; })) soon(); });
      new MutationObserver(function () { wraps(vb).forEach(function (w) { if (!w.dataset.pzRo) { w.dataset.pzRo = '1'; ro.observe(w); } }); }).observe(vb, { childList: true, subtree: true });
      wraps(vb).forEach(function (w) { w.dataset.pzRo = '1'; ro.observe(w); });
    }
    window.addEventListener('resize', tick);
    /* 箱庭の選び替え・参加の切り替えで押せるかが変わる */
    document.addEventListener('change', function () { setTimeout(fabSync, 0); });
    document.addEventListener('click', function () { setTimeout(fabSync, 0); });
    tick();
  }
  HK.PerZoom = { state: function () { return { z: st.z, fit: st.fit, form: form() }; }, act: function (k) { var w = vb && wraps(vb)[0]; act(k, w); }, sync: function () { all(); fabSync(); } };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
