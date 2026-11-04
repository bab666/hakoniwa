/* 箱庭シミュレーター: iPhone・iPad・Mac の Safari（WebKit）だけの「描き直しの一押し」（2026-11-04。late。結果・記録には影響しない）
   利用者の報告「iPhone（iOS 16.7）の Safari で、結果タブをスクロールした先の文字が見えない（白いまま）。文字のコピーはできる」への保険。
   DOM にあって選択・コピーできるのに描かれないのは、WebKit が合成した層のタイルを描き直さない不具合（docs/reports/2026-11-04/safari-scroll.md の 7）。
   層を作る指定（古い慣性スクロールの指定など）は外したが、原因を確かめられないので、次のときに、いま見えているタブの文の容器へ
   「レイアウトを変えずに再描画だけ起こす一押し」を当てる：
   ・スクロールが止まったとき（最後の scroll から 120ms）・指を離したとき（touchend）・ページに戻ったとき（pageshow・visibilitychange）・向きや大きさが変わったとき
   ・一押しは outline: 1px solid transparent を 1 フレームだけ付けて外す（クラス hk-repaint）。outline は大きさも位置も変えず、層も作らない
     （transform・opacity・will-change は層を作るので使わない）
   ・1 秒に 1 回まで。指で触っているあいだは待つ。効いたかどうかは JS からは読めないので、不具合の記録の控えには最初の 1 回だけ残す
   ・対象は html.hk-webkit（ui-guard.js の判定。UA が Mac になる「デスクトップ用 Web サイトを表示」も含む）のときだけ。それ以外のブラウザでは何もしない */
(function () {
  'use strict';
  var HK = window.HK = window.HK || {};
  if (typeof document === 'undefined' || HK.IosPaint) return;
  var de = document.documentElement;
  var on = !!((HK.Guard && HK.Guard.webkit) || de.classList.contains('hk-webkit'));
  var P = HK.IosPaint = { on: on, n: 0, kick: function () { return false; } };
  if (!on) return;

  var st = document.createElement('style');
  st.id = 'hk-ios-paint';
  st.textContent = 'html.hk-webkit .hk-repaint{outline:1px solid transparent!important}';
  (document.head || de).appendChild(st);

  /* いま見えているタブの文の容器のうち、画面に重なっているもの（無ければタブパネル全体） */
  var SEL = '.rvpane,.rvcard,.stepblk,.rvgrid,.ending,.cards>*,.res,.tiebox';
  function targets() {
    var panel = document.querySelector('main>section[role=tabpanel]:not([hidden])');
    if (!panel) return [];
    var vh = window.innerHeight || de.clientHeight || 0, out = [];
    var all = panel.querySelectorAll(SEL);
    for (var i = 0; i < all.length && out.length < 48; i++) {
      var r = all[i].getBoundingClientRect();
      if (r.bottom > 0 && r.top < vh && r.height > 0) out.push(all[i]);
    }
    return out.length ? out : [panel];
  }

  var last = 0, timer = 0, touching = 0, pend = false, noted = false;
  function kick(why) {
    if (touching) { pend = true; return false; }
    var now = Date.now();
    if (now - last < 1000) { if (!timer) timer = setTimeout(function () { timer = 0; kick(why); }, 1000 - (now - last) + 10); return false; }
    var els = targets();
    if (!els.length) return false;
    last = now; pend = false; P.n++;
    els.forEach(function (el) { el.classList.add('hk-repaint'); });
    var raf = window.requestAnimationFrame || function (f) { return setTimeout(f, 16); };
    /* 付けたフレームを描かせてから外す */
    raf(function () { raf(function () { els.forEach(function (el) { el.classList.remove('hk-repaint'); }); }); });
    if (!noted && HK.Guard && HK.Guard.note) { noted = true; HK.Guard.note('paint', '描き直しの一押し（' + (why || '') + '・' + els.length + ' か所）'); }
    return true;
  }
  P.kick = kick;

  var idle = 0;
  function soon(why, ms) { if (idle) clearTimeout(idle); idle = setTimeout(function () { idle = 0; kick(why); }, ms); }
  window.addEventListener('scroll', function () { soon('スクロール', 120); }, { passive: true });
  window.addEventListener('touchstart', function (ev) { touching = ev.touches ? ev.touches.length : 1; }, { passive: true, capture: true });
  ['touchend', 'touchcancel'].forEach(function (k) {
    window.addEventListener(k, function (ev) { touching = ev.touches ? ev.touches.length : 0; if (!touching) soon(pend ? '指を離した（待ち）' : '指を離した', 120); }, { passive: true, capture: true });
  });
  window.addEventListener('pageshow', function () { soon('ページに戻った', 60); });
  document.addEventListener('visibilitychange', function () { if (document.visibilityState === 'visible') soon('ページに戻った', 60); });
  window.addEventListener('orientationchange', function () { soon('向き', 300); });
  window.addEventListener('resize', function () { soon('大きさ', 200); });
})();
