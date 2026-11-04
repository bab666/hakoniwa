/* 箱庭シミュレーター: スクロールの見張り（2026-11-04。late。結果には影響しない。記録は中核の ui-guard.js の HK.Guard）
   報告「iPhone の Safari で画面をスクロールすると文字が見えなくなる（どこかに飛ぶ？）」の原因を、次の報告で突き止めるための記録。
   ・プログラムによるスクロール：window.scrollTo・scrollBy・要素の scrollIntoView・ページの scrollTop の書き換えを包み、呼んだ関数の名前を控える
     （HK.Guard.note。押した・キーを打った直後 1.2 秒の外で呼ばれたものは「操作なしのスクロール」として記録にも残す。同じ呼び元は回数だけ数える）
   ・大きな飛び：スクロールの知らせの間で、位置が画面の高さの 1.5 倍（と 900px）より大きく一度に動いたら記録する（直前のプログラムによるスクロールと、ページの高さの変化を添える）
   ・ページの高さの急な変化：スクロール中にページの高さが 3 割以上・1000px 以上縮んだら記録する（描き直しで中身が消えた・畳まれた）
   ・画面の向きの変化・ページに戻ったことは控えにだけ書く
   記録には住人の名前や設定を入れない（関数の名前・位置・高さだけ）。docs/reports/2026-11-04/safari-scroll.md */
(function () {
  'use strict';
  var HK = window.HK;
  if (!HK || !HK.Guard || HK.Guard.scrollWatch || typeof document === 'undefined') return;
  var G = HK.Guard, de = document.documentElement;
  var lastAct = 0, lastProg = null;
  ['click', 'keydown'].forEach(function (k) { window.addEventListener(k, function () { lastAct = Date.now(); }, true); });
  /* 呼び元の関数の名前（スタックの 2〜4 段目。ファイルの場所は js/ からの短い形） */
  function caller() {
    var s = '';
    try { s = String(new Error().stack || ''); } catch (e) { s = ''; }
    /* 先頭の「Error」（Chrome）を除き、ここの 3 段（caller・prog・包み）を飛ばす */
    return s.split('\n').filter(function (l) { return l.trim() && !/^Error/.test(l.trim()); }).slice(3, 6).map(function (l) {
      l = l.trim().replace(/^at\s+/, '');
      return l.replace(/\(?(?:https?|file|blob):\/\/[^)\s]*?\/(js\/[^)\s/]+|index\.html)[^)\s]*\)?/, '[$1]').replace(/\s+/g, ' ').slice(0, 80);
    }).filter(Boolean).join(' ← ') || '（不明）';
  }
  function prog(fn, el) {
    var now = Date.now(), who = caller(), user = now - lastAct < 1200;
    lastProg = { ts: now, fn: fn, who: who };
    G.note('scroll', fn + (el ? '(' + el + ')' : '') + ' ' + Math.round(window.pageYOffset) + ' ← ' + who + (user ? '（操作から）' : ''));
    if (!user) G.add('scroll', '操作なしでページのスクロール位置を動かしました：' + fn + ' ← ' + who);
  }
  function wrap(o, k, name, page) {
    var f = o && o[k];
    if (typeof f !== 'function') return;
    o[k] = function () {
      try { if (!page || this === window || this === de || this === document.body) prog(name, page ? '' : (this && this.id ? '#' + this.id : this && this.className ? '.' + String(this.className).split(' ')[0] : '')); } catch (e) { /* 記録できなくても動かす */ }
      return f.apply(this, arguments);
    };
  }
  wrap(window, 'scrollTo', 'scrollTo', true);
  wrap(window, 'scrollBy', 'scrollBy', true);
  wrap(window, 'scroll', 'scroll', true);
  if (window.Element) wrap(Element.prototype, 'scrollIntoView', 'scrollIntoView', false);
  try {
    var d = window.Element && Object.getOwnPropertyDescriptor(Element.prototype, 'scrollTop');
    if (d && d.set && d.configurable) Object.defineProperty(Element.prototype, 'scrollTop', {
      configurable: true, enumerable: d.enumerable, get: d.get,
      set: function (v) { if ((this === de || this === document.body) && Math.abs((+v || 0) - (window.pageYOffset || 0)) > 1) { try { prog('scrollTop=' + Math.round(+v || 0)); } catch (e) { /* 何もしない */ } } d.set.call(this, v); }
    });
  } catch (e) { /* 包めない環境 */ }

  /* ---------- 大きな飛び・高さの急な変化 ---------- */
  var ly = window.pageYOffset || 0, lt = 0, lh = de.scrollHeight || 0, jumps = 0;
  window.addEventListener('scroll', function () {
    var y = window.pageYOffset || 0, t = Date.now(), h = de.scrollHeight || 0, vh = window.innerHeight || 600;
    if (lt && t - lt < 250 && t - lastAct > 1200 && Math.abs(y - ly) > Math.max(vh * 1.5, 900) && jumps < 20 && !document.documentElement.classList.contains('hk-modal-open')) {
      jumps++;
      var p = lastProg && t - lastProg.ts < 600 ? lastProg.fn + ' ← ' + lastProg.who : 'プログラムによるスクロールなし' + (y === 0 ? '（上端へ。画面の上端を押したときもこうなります）' : '');
      G.add('jump', 'スクロール位置が飛びました：' + Math.round(ly) + '→' + Math.round(y) + '（' + (t - lt) + 'ms・ページの高さ ' + lh + '→' + h + '）・' + p);
    }
    if (lh > 0 && h < lh * 0.7 && lh - h > 1000) G.add('shrink', 'ページの高さが急に縮みました：' + lh + '→' + h + '（位置 ' + Math.round(y) + '）');
    ly = y; lt = t; lh = h;
  }, { passive: true });
  window.addEventListener('orientationchange', function () { G.note('orient', '画面の向きが変わりました'); });
  window.addEventListener('pageshow', function (e) { G.note('page', 'ページに戻りました' + (e.persisted ? '（前の状態のまま）' : '')); });
  G.scrollWatch = true;
})();
