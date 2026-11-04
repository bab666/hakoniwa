/* 箱庭シミュレーター ui: 小窓（モーダル）の共通の仕組み（2026-11-02 担当UG。結果には影響しない）
   利用者の報告「スマホ（iPhone の Safari）で出来事の一覧や TIPS などの小窓がスクロールできず、背景がスクロールされる」への対処。
   ・HK.Modal.lock(el)：窓を開いたときに呼ぶ。最初の窓で html・body に .hk-modal-open を付け、背景のスクロールを止める。
       iOS の Safari は overflow:hidden だけでは止まらないので、body を position:fixed・top:-（いまの位置）にして、位置を覚えておく。
     HK.Modal.unlock(el)：窓を閉じたときに呼ぶ。開いている窓を数え、最後の窓が閉じたときだけ body を戻して元の位置へスクロールし直す
       （窓の上に窓＝箱庭を選ぶの上に TIPS なども、閉じた順にかかわらず数で合わせる）。
     閉じる道（×・外側・Esc・窓を描き直して消したとき）で unlock を呼び忘れても残らないよう、窓が開いているあいだだけ DOM を見張り、
     消えた・隠れた（hidden）窓は数から外す（HK.Modal.sync でも同じ）。同じ窓を二度 lock しても一つと数える。
   ・窓が開いているあいだ、touchmove が背景へ伝わらないようにする：指の下から窓までの間に、その向きにまだスクロールできる箱があるときだけ通し、
     無いとき（窓の外・スクロールしない頭・端まで来た箱）は止める（iOS で端まで来たスクロールが背景へ移るのを防ぐ）。
     スライダー（input[type=range]）と、data-hk-touch を付けた要素の中は止めない。二本指（拡大）も止めない。
   ・窓の中身は「頭（題名・閉じる）は固定、本文 .gearbody だけがスクロール」にそろえる（TIPS・出来事の一覧・口調の窓。住人の設定は .gearpane、
     データの窓は .ctdbody、箱庭を選ぶは .scens・.bxpick-s、.modal は .modal-box がスクロールする箱）。高さは 100dvh（無ければ 100vh）基準で、
     下に env(safe-area-inset-bottom) の余白
   ui-shell.js より前に読む（中核。窓を開くファイルは HK.Modal && … で呼ぶ） */
(function () {
  'use strict';
  var HK = window.HK = window.HK || {};
  if (typeof document === 'undefined') return;

  var css = 'html.hk-modal-open{overflow:hidden!important;overscroll-behavior:none}' +
    'body.hk-modal-open{position:fixed!important;left:0;right:0;width:100%;overflow:hidden!important;overscroll-behavior:none}' +
    /* 窓を開いているあいだは、右下の「上へ／下へ」（ページの移動。窓の上に重なる）を出さない */
    'html.hk-modal-open #pagejump{display:none!important}' +
    /* 窓の幕と、窓の中のスクロールする箱：端まで来ても背景へ移さない */
    '.gearov,.ctdov,.modal,.bxpick{overscroll-behavior:contain}' +
    '.modal-box,.gearov .gearpane,.gearov .geartoc,.gearov .gearbody,.ctdov .ctdbody,.bxpick .scens,.bxpick .bxpick-s,.bxpick .scfilt{-webkit-overflow-scrolling:touch;overscroll-behavior:contain}' +
    /* 頭は固定・本文だけスクロール（TIPS・出来事の一覧・口調の窓。.gearbox は ui-gear.js・index.html で縦の flex・overflow:hidden） */
    '.gearov .gearbox>.gearhd{flex:none}' +
    '.gearov .gearbox:focus{outline:none}' +
    /* TIPS・出来事の一覧・口調の窓の頭：題名を伸ばして「閉じる」を右端に（スマホの頭の詰めた余白は住人の設定の「‹」用なので、左を空ける） */
    '.gearov:is(.tipov,.vsdlg) .gearhd h2{flex:1 1 auto;min-width:0}' +
    '@media (max-width:599px){.gearov:is(.tipov,.vsdlg) .gearhd{padding:8px 12px 8px 16px;padding-top:max(8px,env(safe-area-inset-top,0px))}}' +
    /* TIPS・出来事の一覧は、箱庭を選ぶ（.bxpick。z-index 80）の板からも開くので、その上に出す（前は窓の裏に隠れていた） */
    '.gearov.tipov{z-index:90}' +
    '.gearov .gearbox>.gearbody{flex:1 1 auto;min-height:0;overflow-x:hidden;overflow-y:auto;box-sizing:border-box;padding:12px 20px calc(20px + env(safe-area-inset-bottom,0px))}' +
    '.gearov .gearbox>.gearbody>.gearsec:last-child{padding-bottom:0}' +
    '@media (max-width:599px){.gearov .gearbox>.gearbody{padding:10px 16px calc(16px + env(safe-area-inset-bottom,0px))}}' +
    /* .modal（注意事項・25問診断・画像）：箱の高さは 100dvh 基準、下の余白は iOS の下のバーの分も */
    '.modal{padding:max(16px,env(safe-area-inset-top,0px)) 16px max(16px,env(safe-area-inset-bottom,0px))}' +
    '.modal-box{max-height:calc(100vh - 32px - env(safe-area-inset-top,0px) - env(safe-area-inset-bottom,0px));max-height:calc(100dvh - 32px - env(safe-area-inset-top,0px) - env(safe-area-inset-bottom,0px))}' +
    /* 注意事項：題名と「閉じる」を固定し、箇条書きだけをスクロール（notice.js が初めて開くときに .nobody・.nofoot に組み直す） */
    '#notice .modal-box{display:flex;flex-direction:column;overflow:hidden;padding:0}' +
    '#notice .notice-title{flex:none;margin:0;padding:20px 24px 10px;border-bottom:1px solid var(--line)}' +
    '#notice .nobody{flex:1 1 auto;min-height:0;overflow-y:auto;padding:12px 24px 4px}' +
    '#notice .nofoot{flex:none;display:flex;justify-content:flex-end;padding:10px 24px 14px;border-top:1px solid var(--line)}' +
    '@media (max-width:599px){#notice .notice-title{padding:16px 16px 8px}#notice .nobody{padding:10px 16px 4px}#notice .nofoot{padding:10px 16px 12px}}';
  var st = document.createElement('style'); st.textContent = css; (document.head || document.documentElement).appendChild(st);

  var list = [];            /* 開いている窓（開いた順） */
  var saved = null;         /* 止める前の位置と body の style */
  var mo = null;

  function shown(el) {
    if (!el || !el.isConnected || el.hidden) return false;
    if (el.closest && el.closest('[hidden]')) return false;
    try { if (getComputedStyle(el).display === 'none') return false; } catch (e) { /* 測れなければ出ているとみなす */ }
    return true;
  }
  function topEl() { for (var i = list.length - 1; i >= 0; i--) if (shown(list[i])) return list[i]; return null; }

  function freeze() {
    var de = document.documentElement, b = document.body;
    if (!b || saved) return;
    var y = window.pageYOffset || de.scrollTop || 0, x = window.pageXOffset || de.scrollLeft || 0;
    var sbw = Math.max(0, (window.innerWidth || 0) - de.clientWidth);
    saved = { y: y, x: x, top: b.style.top, left: b.style.left, pr: b.style.paddingRight };
    if (sbw > 0) { var pr = parseFloat(getComputedStyle(b).paddingRight) || 0; b.style.paddingRight = (pr + sbw) + 'px'; }
    b.style.top = -y + 'px';
    if (x) b.style.left = -x + 'px';
    de.classList.add('hk-modal-open'); b.classList.add('hk-modal-open');
    if (HK.Guard && HK.Guard.note) HK.Guard.note('modal', '窓を開きました（止めた位置 ' + Math.round(y) + '）');
    document.addEventListener('touchstart', onStart, { passive: true, capture: true });
    document.addEventListener('touchmove', onMove, { passive: false, capture: true });
    if (typeof MutationObserver !== 'undefined') {
      mo = mo || new MutationObserver(sync);
      mo.observe(b, { childList: true, subtree: true, attributes: true, attributeFilter: ['hidden'] });
    }
  }
  function thaw() {
    var de = document.documentElement, b = document.body;
    if (!saved || !b) { saved = null; return; }
    var s = saved; saved = null;
    if (HK.Guard && HK.Guard.note) HK.Guard.note('modal', '窓を閉じました（' + Math.round(s.y) + ' へ戻す）');
    if (mo) mo.disconnect();
    document.removeEventListener('touchstart', onStart, { capture: true });
    document.removeEventListener('touchmove', onMove, { capture: true });
    de.classList.remove('hk-modal-open'); b.classList.remove('hk-modal-open');
    b.style.top = s.top; b.style.left = s.left; b.style.paddingRight = s.pr;
    /* 元の位置へ（なめらかなスクロールの指定があっても一度に戻す） */
    var sb = de.style.scrollBehavior; de.style.scrollBehavior = 'auto';
    try { window.scrollTo(s.x, s.y); } catch (e) { /* 古い環境 */ }
    de.style.scrollBehavior = sb;
  }
  /* 消えた・隠れた窓を数から外し、0 になったら戻す */
  function sync() {
    list = list.filter(shown);
    if (!list.length) thaw();
    return list.length;
  }
  function lock(el) {
    if (!el) return;
    if (list.indexOf(el) < 0) list.push(el);
    list = list.filter(function (x) { return x === el || shown(x); });
    freeze();
  }
  function unlock(el) {
    if (el) { var i = list.indexOf(el); if (i >= 0) list.splice(i, 1); }
    sync();
  }

  /* ---------- 指でのスクロール（iOS） ---------- */
  var lx = 0, ly = 0, axis = '';
  function onStart(e) {
    var t = e.touches && e.touches[0];
    if (!t) return;
    lx = t.clientX; ly = t.clientY; axis = '';
  }
  function canScroll(el, d, ax) {
    var cs;
    try { cs = getComputedStyle(el); } catch (e) { return false; }
    if (ax === 'x') {
      if (!/(auto|scroll)/.test(cs.overflowX) || el.scrollWidth <= el.clientWidth + 1) return false;
      return d > 0 ? el.scrollLeft > 0 : el.scrollLeft + el.clientWidth < el.scrollWidth - 1;
    }
    if (!/(auto|scroll)/.test(cs.overflowY) || el.scrollHeight <= el.clientHeight + 1) return false;
    return d > 0 ? el.scrollTop > 0 : el.scrollTop + el.clientHeight < el.scrollHeight - 1;
  }
  function onMove(e) {
    if (!list.length || !e.touches || e.touches.length !== 1) return;
    var t = e.touches[0], dx = t.clientX - lx, dy = t.clientY - ly;
    lx = t.clientX; ly = t.clientY;
    if (!dx && !dy) return;
    if (!axis) axis = Math.abs(dx) > Math.abs(dy) ? 'x' : 'y';
    var top = topEl(), tg = e.target && e.target.nodeType === 1 ? e.target : e.target && e.target.parentElement;
    if (top && tg && top.contains(tg)) {
      if (tg.closest && tg.closest('input[type=range],[data-hk-touch]')) return;
      for (var el = tg; el && el !== document.body; el = el.parentElement) {
        if (canScroll(el, axis === 'x' ? dx : dy, axis)) return;
        if (el === top) break;
      }
    }
    if (e.cancelable) e.preventDefault();
  }

  HK.Modal = {
    lock: lock,
    unlock: unlock,
    sync: sync,
    count: function () { return sync(); },
    isOpen: function () { return sync() > 0; },
    /* 止めているあいだの背景の位置（止めていなければ今の位置） */
    scrollY: function () { return saved ? saved.y : (window.pageYOffset || 0); }
  };
})();
