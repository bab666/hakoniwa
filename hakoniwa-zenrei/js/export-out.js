/* 箱庭シミュレーター: 結果の書き出し（PDF で保存・記録を画像で保存）
   ・「PDF で保存」：ブラウザの印刷（window.print()）で、結果画面を A4 縦に出す。見た目は index.html の印刷用 CSS（@media print）。
     印刷の前に、節の折りたたみ（ui-fold.js）・似た派閥の畳み・時系列の絞り込み（重要のみ・種類・人・エロシーンだけ）をすべて開き、印刷のあとで元に戻す。
     ライブラリは使わない（ブラウザの印刷画面で「PDF に保存」を選ぶ。iPhone・iPad は印刷画面の共有から「ファイルに保存」）。
   ・「記録を画像で保存」：時系列（記録）だけを PNG にする。いま見えている絞り込みのまま（畳んだ派閥の動きは開いて描く）。
     描く部品 html2canvas は、ボタンを押したときにだけ読み込む（起動時には読まない。フォントは読み込まず、端末の文字で描く）。
     幅 1200px、上に箱庭名・住人・日付、下に小さく「箱庭シミュレーター」。長いときは高さ 16000px（iPhone・iPad・Safari は 13600px）ごとに分けて「1/3」と番号を付ける。
     PC はそのまま保存（ダウンロード）、スマホは画像を出して「共有・保存」（Web Share API が無ければダウンロード・長押し保存）。
   ・ボタンは結果画面の共有バー（share-card.js の #sharebar）の右に差し込む（ui.js・view.js・share-card.js は触らない。#view-result を見張って差し込む） */
(function () {
  'use strict';
  var HK = window.HK;
  if (!HK || HK.ExportOut) return;
  var EX = HK.ExportOut = {};

  /* html2canvas（版を固定。cdnjs が読めないときは jsDelivr。どちらも同じファイルなので同じ integrity で確かめる） */
  var H2C = {
    src: ['https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js', 'https://cdn.jsdelivr.net/npm/html2canvas@1.4.1/dist/html2canvas.min.js'],
    integrity: 'sha512-BNaRQnYJYiPSqHHDb58B0yaPfCu+Wgds8Gp/gU33kqBtgNS4tSPHuGibyoeqMV/TJlSKda6FXzoEyYGjTe+vXA=='
  };
  var SHOT_W = 900, OUT_W = 1200;   /* 時系列は幅 900px で組み、1200/900 倍で描く（文字を大きめに、くっきり） */
  var FONT = '"Noto Sans JP","Hiragino Sans","Hiragino Kaku Gothic ProN","Yu Gothic UI","Yu Gothic",Meiryo,system-ui,sans-serif';
  var FONT_N = '"IBM Plex Mono",ui-monospace,"SF Mono",Menlo,Consolas,monospace';

  var ua = navigator.userAgent || '', plat = navigator.platform || '';
  var isIOS = /iPhone|iPad|iPod/.test(ua) || (/Mac/.test(plat) && navigator.maxTouchPoints > 1);
  var isMobile = isIOS || /Android|Mobile/i.test(ua);
  var isSafari = isIOS || (/Safari\//.test(ua) && !/Chrome\/|Chromium\/|Edg\//.test(ua));
  /* 1枚の高さの上限（Safari の canvas は面積 16,777,216px まで。幅 1200px なら 13981px） */
  var MAX_H = isSafari ? 13600 : 16000;

  function $(s, el) { return (el || document).querySelector(s); }
  function $$(s, el) { return Array.prototype.slice.call((el || document).querySelectorAll(s)); }
  function toast(t) { if (HK.toast) HK.toast(t); }
  function say(t) { var m = $('#sharemsg'); if (m) m.textContent = t; else if (t) toast(t); }
  function host() { return document.getElementById('view-result'); }
  function result() { return HK.UIres && HK.UIres.get ? HK.UIres.get() : null; }
  function safeName(s) { return String(s || '').replace(/[\\/:*?"<>|\s]/g, '').slice(0, 16) || '箱庭'; }
  function plain(s) { return String(s == null ? '' : s).replace(/<[^>]*>/g, ''); }

  /* ---------- ボタンの差し込み ---------- */
  var IC_PDF = '<svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true"><path d="M3 1.5h5.5L11 4v8.5H3z M8.5 1.5V4H11" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linejoin="round"/><path d="M5 8.5h4 M5 10.5h3" stroke="currentColor" stroke-width="1.2"/></svg>';
  var IC_IMG = '<svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true"><rect x="1.5" y="2.5" width="11" height="9" rx="1" fill="none" stroke="currentColor" stroke-width="1.3"/><path d="M2.5 10.5l3-3.2 2.2 2.2 1.6-1.5 2.2 2.5" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linejoin="round"/><circle cx="9.4" cy="5.2" r="1" fill="currentColor"/></svg>';
  function buttons() {
    return '<button class="btn" type="button" data-xo="pdf" id="xo-pdf" title="ブラウザの印刷画面で「PDF に保存」を選ぶと、結果の全体を A4 の PDF にできます">' + IC_PDF + 'PDF で保存</button>' +
      '<button class="btn" type="button" data-xo="tlimg" id="xo-img" title="時系列（記録）だけを画像にします。いまの絞り込みのまま描きます">' + IC_IMG + '記録を画像で保存</button>';
  }
  function inject() {
    var h = host();
    if (!h || $('#xo-pdf', h) || !result()) return;
    var bar = $('#sharebar', h);
    if (bar) {
      var msg = $('#sharemsg', bar);
      if (msg) msg.insertAdjacentHTML('beforebegin', buttons()); else bar.insertAdjacentHTML('beforeend', buttons());
      return;
    }
    /* 共有バーが無いとき（share-card.js が無い版）は見出しの下に並びを作る */
    var hd = $('.resulthead', h);
    if (hd) hd.insertAdjacentHTML('afterend', '<div class="sharebar" id="xo-bar">' + buttons() + '<span class="hint" id="sharemsg" role="status" style="margin:0"></span></div>');
  }
  function watch() {
    var h = host();
    if (!h) return;
    inject();
    if (window.MutationObserver) new MutationObserver(inject).observe(h, { childList: true });
  }

  document.addEventListener('click', function (ev) {
    var b = ev.target.closest && ev.target.closest('[data-xo]');
    if (!b) return;
    var a = b.getAttribute('data-xo');
    if (a === 'pdf') EX.pdf();
    else if (a === 'tlimg') EX.timelineImage();
  });

  /* ---------- PDF（印刷） ---------- */
  var undo = null, pendingRestore = 0;
  /* 時系列の絞り込みの札（押してある札）。押し直すと外れる。戻すときは同じ札をもう一度押す */
  function pressedFilters(h) {
    return $$('#tlbar [aria-pressed="true"], #stbar [aria-pressed="true"], .tlbar [aria-pressed="true"]', h).filter(function (b) {
      return b.getAttribute('data-act') !== 'tlall' && (b.hasAttribute('data-act') || b.hasAttribute('data-st'));
    }).map(function (b) {
      var k = b.hasAttribute('data-act') ? 'data-act' : 'data-st', s = '[' + k + '="' + b.getAttribute(k) + '"]';
      if (b.hasAttribute('data-i')) s += '[data-i="' + b.getAttribute('data-i') + '"]';
      return s;
    }).filter(function (s, i, a) { return a.indexOf(s) === i && !/mapf/.test(s); });
  }
  function press(h, sel, want) {
    var b = $(sel, h);
    if (b && (b.getAttribute('aria-pressed') === 'true') !== want) b.click();
  }
  function expand() {
    if (undo) return;
    var h = host();
    if (!h || h.hidden) return;
    var u = { details: [], filters: [], cat: null };
    try {
      u.filters = pressedFilters(h);
      u.filters.forEach(function (s) { press(h, s, false); });
      var cat = $('#tlcat', h);
      if (cat && cat.value !== 'all') { u.cat = cat.value; cat.value = 'all'; cat.dispatchEvent(new Event('change', { bubbles: true })); }
    } catch (e) { /* 絞り込みが外せなくても印刷はする */ }
    $$('details', h).forEach(function (d) { if (!d.open) { u.details.push(d); d.open = true; } });
    undo = u;
  }
  function restore() {
    var u = undo;
    undo = null;
    if (!u) return;
    var h = host();
    u.details.forEach(function (d) { if (d.isConnected) d.open = false; });
    if (!h) return;
    try {
      if (u.cat) { var cat = $('#tlcat', h); if (cat) { cat.value = u.cat; cat.dispatchEvent(new Event('change', { bubbles: true })); } }
      u.filters.forEach(function (s) { press(h, s, true); });
    } catch (e) { /* 戻せなくても表示は崩れない */ }
  }
  window.addEventListener('beforeprint', expand);
  window.addEventListener('afterprint', function () { setTimeout(restore, 0); });
  /* afterprint が来ないブラウザ向け：印刷の表示が終わったら（または次に画面を触ったら）戻す */
  try {
    var mq = window.matchMedia && window.matchMedia('print');
    if (mq) { var onMq = function (e) { if (e.matches) expand(); else setTimeout(restore, 0); }; if (mq.addEventListener) mq.addEventListener('change', onMq); else if (mq.addListener) mq.addListener(onMq); }
  } catch (e) { /* 見張れなくても印刷はできる */ }
  document.addEventListener('pointerdown', function () { if (undo && Date.now() - pendingRestore > 1500) restore(); }, true);

  /* 印刷の前の展開と後の戻し（ブラウザの印刷メニュー・Ctrl+P でも beforeprint／afterprint で同じことをする） */
  EX.expand = expand;
  EX.restore = restore;
  EX.pdf = function () {
    if (!result()) { toast('結果がありません'); return; }
    toast(isIOS ? '印刷の画面が開きます。右上の共有ボタンから「ファイルに保存」で PDF にできます' : '印刷の画面が開きます。送信先で「PDF に保存」を選んでください');
    say('');
    setTimeout(function () {
      expand();
      pendingRestore = Date.now();
      try { window.print(); } catch (e) { restore(); toast('このブラウザでは印刷の画面を開けませんでした'); }
    }, 450);
  };

  /* ---------- html2canvas を読む（押したときだけ） ---------- */
  var libP = null;
  function loadLib() {
    if (window.html2canvas) return Promise.resolve(window.html2canvas);
    if (libP) return libP;
    libP = new Promise(function (ok, ng) {
      var k = 0;
      (function next() {
        if (k >= H2C.src.length) { libP = null; ng(new Error('load')); return; }
        var s = document.createElement('script'), done = false;
        var tm = setTimeout(function () { fail(); }, 20000);
        function fail() { if (done) return; done = true; clearTimeout(tm); s.remove(); k++; next(); }
        s.src = H2C.src[k]; s.async = true; s.crossOrigin = 'anonymous'; s.integrity = H2C.integrity; s.referrerPolicy = 'no-referrer';
        s.onload = function () { if (done) return; done = true; clearTimeout(tm); if (window.html2canvas) ok(window.html2canvas); else { done = false; fail(); } };
        s.onerror = fail;
        document.head.appendChild(s);
      })();
    });
    return libP;
  }
  EX.loadLib = loadLib;

  /* ---------- 色 ---------- */
  /* 端末の色の計算結果（color-mix は color(srgb …) になる）を rgb() に直す。html2canvas 1.4.1 は color() を読めないため */
  function c255(v) { return Math.max(0, Math.min(255, Math.round(parseFloat(v) * 255))); }
  function fixColor(s) {
    if (!s || s.indexOf('color(') < 0) return s;
    return s.replace(/color\(\s*srgb\s+([-\d.e]+|none)\s+([-\d.e]+|none)\s+([-\d.e]+|none)(?:\s*\/\s*([-\d.e]+%?|none))?\s*\)/g, function (m, r, g, b, a) {
      var al = a == null || a === 'none' ? 1 : /%$/.test(a) ? parseFloat(a) / 100 : parseFloat(a);
      return 'rgba(' + c255(r === 'none' ? 0 : r) + ', ' + c255(g === 'none' ? 0 : g) + ', ' + c255(b === 'none' ? 0 : b) + ', ' + al + ')';
    });
  }
  var COLOR_PROPS = ['color', 'background-color', 'border-top-color', 'border-right-color', 'border-bottom-color', 'border-left-color', 'outline-color', 'text-decoration-color', 'box-shadow', 'text-shadow', 'background-image', '-webkit-text-stroke-color', 'fill', 'stroke', 'stop-color'];
  function fixTree(root, win) {
    var els = [root].concat(Array.prototype.slice.call(root.querySelectorAll('*')));
    els.forEach(function (el) {
      var cs = win.getComputedStyle(el);
      COLOR_PROPS.forEach(function (p) {
        var v = cs.getPropertyValue(p);
        if (v && v.indexOf('color(') >= 0) el.style.setProperty(p, fixColor(v), 'important');
      });
      /* SVG は画像にして描かれる（ページの CSS が届かない）ので、塗り・線を書き込んでおく */
      if (el instanceof win.SVGElement && el.tagName.toLowerCase() !== 'svg') {
        ['fill', 'stroke', 'stroke-width', 'opacity', 'font-size', 'font-weight', 'font-family'].forEach(function (p) { var v = cs.getPropertyValue(p); if (v) el.style.setProperty(p, fixColor(v)); });
      }
    });
  }
  function themeNow() {
    var t = document.documentElement.getAttribute('data-theme');
    if (t === 'light' || t === 'gray' || t === 'dark') return t;
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  /* いまの配色の色（canvas に書く見出し用） */
  function themeColors(white) {
    if (white) return { bg: '#FFFFFF', ink: '#16233B', muted: '#61697A', line: '#DEE0E4' };
    var p = document.createElement('span'), out = {};
    p.style.cssText = 'position:absolute;left:-9999px;top:0';
    document.body.appendChild(p);
    [['bg', 'var(--paper)'], ['ink', 'var(--ink)'], ['muted', 'var(--muted)'], ['line', 'var(--line)']].forEach(function (x) { p.style.color = x[1]; out[x[0]] = fixColor(getComputedStyle(p).color); });
    p.remove();
    return out;
  }

  /* ---------- 記録の画像 ---------- */
  function timelineEl(h) { return $('#tl', h) || $('#sttl', h) || $('#dgtl', h) || $('.tl', h); }
  function headInfo(res, h) {
    var scen = (HK.SCENARIOS && HK.SCENARIOS[res.scenId]) || (HK.SCENARIOS_HIDDEN || {})[res.scenId] || {};
    var who = (res.chars || res.heroes || (res.hero ? [res.hero] : [])).map(function (c) { return c && c.name; }).filter(Boolean);
    var tlh = $('#tlhead', h), title = tlh ? plain(tlh.firstChild && tlh.firstChild.nodeType === 3 ? tlh.firstChild.nodeValue : '記録').trim() || '記録' : '記録';
    /* いま効いている絞り込み（見えているとおりに描くので、何で絞ったかを見出しに書く） */
    var f = $$('#tlbar [aria-pressed="true"], #stbar [aria-pressed="true"], .tlbar [aria-pressed="true"]', h).filter(function (b) { return b.getAttribute('data-act') !== 'tlall'; }).map(function (b) { return b.textContent.replace(/\s+/g, ' ').trim(); });
    var cat = $('#tlcat', h);
    if (cat && cat.value !== 'all' && cat.selectedOptions && cat.selectedOptions[0]) f.unshift(cat.selectedOptions[0].textContent);
    f = f.filter(function (x, i, a) { return x && a.indexOf(x) === i; });
    return { scen: scen.name || String(res.scenId || '箱庭'), title: title, who: who, seed: res.seed, filter: f };
  }
  var SHOT_CSS = '#xo-shot{position:absolute;left:-12000px;top:0;width:' + SHOT_W + 'px;padding:8px 28px 12px;background:var(--paper);color:var(--ink);font-family:var(--f-body);font-size:14px;line-height:1.6;z-index:-1;pointer-events:none}' +
    /* スマホ幅の並び（@media max-width:760px）でも PC と同じ並びで描く */
    '#xo-shot .stepblk{--rail:24px;grid-template-columns:88px minmax(0,1fr);gap:0 20px}' +
    '#xo-shot .stepblk .when{flex-direction:column;flex-wrap:nowrap;align-items:stretch;gap:1px;padding:14px 0 0}' +
    '#xo-shot .stepblk ol{padding-top:12px}' +
    /* html2canvas が苦手な描き方を置き換える：内側の影（アバターの輪）は塗りつぶしになるので枠線に。行をまたぐ枠付きの札は1つの箱に */
    '#xo-shot .av{box-shadow:none!important;border:1.5px solid var(--k)}#xo-shot .av.bold{border-width:3px}#xo-shot .av.dash{border:1px dashed var(--k)}' +
    '#xo-shot .ev .avs .av+.av{box-shadow:0 0 0 2px var(--paper)!important}' +
    '#xo-shot .av.img,#xo-shot .av:has(img){border:1.5px solid var(--k);padding:1.5px;background:var(--paper)}' +
    '#xo-shot .av img{border-radius:50%}' +
    '#xo-shot .oddb,#xo-shot .markb,#xo-shot .goalb{display:inline-block;white-space:nowrap}' +
    '#xo-shot details>summary{list-style:none}#xo-shot details>summary::-webkit-details-marker{display:none}' +
    '#xo-shot *{transition:none!important;animation:none!important}';
  function shotStyle() {
    if ($('#xo-shot-css')) return;
    var st = document.createElement('style');
    st.id = 'xo-shot-css'; st.textContent = SHOT_CSS;
    document.head.appendChild(st);
  }
  /* 時系列の写しを画面の外に作る（id はそのまま＝#tl などの見た目の CSS が効く。#view-result の外に置くので、元の要素の検索とはぶつからない） */
  function buildShot(tl) {
    shotStyle();
    var old = $('#xo-shot');
    if (old) old.remove();
    var w = document.createElement('div');
    w.id = 'xo-shot'; w.setAttribute('aria-hidden', 'true');
    var c = tl.cloneNode(true);
    $$('details', c).forEach(function (d) { d.open = true; });
    $$('img[loading]', c).forEach(function (im) { im.removeAttribute('loading'); });
    $$('button, input, select, textarea', c).forEach(function (x) { x.remove(); });
    w.appendChild(c);
    document.body.appendChild(w);
    return w;
  }
  /* 区切りの位置：区切り（.stepblk）と出来事（li.ev）の上端。途中で文を切らないように、上限の手前のいちばん下の区切りで分ける */
  function cuts(w, maxCss) {
    var top = w.getBoundingClientRect().top, total = Math.ceil(w.scrollHeight || w.getBoundingClientRect().height);
    var marks = $$('.stepblk, li.ev', w).map(function (el) { return Math.floor(el.getBoundingClientRect().top - top); }).filter(function (y) { return y > 0; });
    marks = marks.concat([total]).sort(function (a, b) { return a - b; });
    var out = [], y = 0;
    while (y < total) {
      var lim = y + maxCss, best = 0;
      if (lim >= total) { out.push([y, total - y]); break; }
      marks.forEach(function (m) { if (m > y + 40 && m <= lim) best = m; });
      if (!best) best = lim;
      out.push([y, best - y]);
      y = best;
    }
    /* 2枚目からは、途中で切れた区切りの名前（T30 など）を見出しに「のつづき」として書く */
    var blks = $$('.stepblk', w).map(function (el) { var r = el.getBoundingClientRect(), wh = $('.when', el); return { t: Math.floor(r.top - top), b: Math.floor(r.bottom - top), name: wh ? (wh.children.length ? $$('*', wh).map(function (x) { return x.textContent; }).join(' ') : wh.textContent).replace(/\s+/g, ' ').trim() : '' }; });
    out.forEach(function (pt) {
      if (!pt[0]) return;
      var b = blks.filter(function (x) { return x.t < pt[0] - 2 && x.b > pt[0] + 2; })[0];
      if (b && b.name) pt.push(b.name);
    });
    return out;
  }
  function wrapText(ctx, text, maxW) {
    var out = [], line = '';
    String(text).split('').forEach(function (ch) {
      if (ctx.measureText(line + ch).width > maxW && line && !/[、。」』）！？…・]/.test(ch)) { out.push(line); line = ch; } else line += ch;
    });
    if (line) out.push(line);
    return out;
  }
  function today() { var d = new Date(); return d.getFullYear() + '.' + (d.getMonth() + 1) + '.' + d.getDate(); }
  /* 見出し（上）と署名（下）を canvas に描き、真ん中に時系列の一切れを貼る */
  function compose(slice, info, C, k, n, cont) {
    var W = OUT_W, X = 48, IW = W - X * 2;
    var meas = document.createElement('canvas').getContext('2d');
    meas.font = '400 19px ' + FONT;
    var whoLines = wrapText(meas, '住人　' + info.who.join('・'), IW);
    if (whoLines.length > 3) { whoLines = whoLines.slice(0, 3); whoLines[2] = whoLines[2].slice(0, -2) + '…ほか'; }
    var sub = today() + (info.seed != null ? '　シード ' + info.seed : '') + (info.filter.length ? '　表示：' + info.filter.join('・') : '') + (cont ? '　（' + cont + ' のつづき）' : '');
    meas.font = '400 16px ' + FONT;
    var subLines = wrapText(meas, sub, IW).slice(0, 2);
    var HEAD = 40 + 44 + whoLines.length * 30 + subLines.length * 25 + 26, FOOT = 64;
    var cv = document.createElement('canvas');
    cv.width = W; cv.height = HEAD + slice.height + FOOT;
    var ctx = cv.getContext('2d');
    ctx.fillStyle = C.bg; ctx.fillRect(0, 0, cv.width, cv.height);
    ctx.textBaseline = 'top';
    var y = 40;
    ctx.fillStyle = C.ink; ctx.font = '700 32px ' + FONT;
    ctx.fillText(info.scen, X, y);
    var tw = ctx.measureText(info.scen).width;
    ctx.fillStyle = C.muted; ctx.font = '500 20px ' + FONT;
    ctx.fillText('　' + info.title, X + tw, y + 10);
    if (n > 1) { ctx.font = '600 20px ' + FONT_N; ctx.textAlign = 'right'; ctx.fillStyle = C.ink; ctx.fillText(k + ' / ' + n, W - X, y + 10); ctx.textAlign = 'left'; }
    y += 50;
    ctx.fillStyle = C.ink; ctx.font = '400 19px ' + FONT;
    whoLines.forEach(function (l) { ctx.fillText(l, X, y); y += 30; });
    ctx.fillStyle = C.muted; ctx.font = '400 16px ' + FONT;
    subLines.forEach(function (l) { ctx.fillText(l, X, y); y += 25; });
    ctx.fillStyle = C.line; ctx.fillRect(X, HEAD - 12, IW, 2);
    ctx.drawImage(slice, 0, HEAD);
    var fy = HEAD + slice.height;
    ctx.fillStyle = C.line; ctx.fillRect(X, fy + 14, IW, 1);
    ctx.fillStyle = C.muted; ctx.font = '500 15px ' + FONT; ctx.textAlign = 'right';
    ctx.fillText('箱庭シミュレーター' + (n > 1 ? '　' + k + '/' + n : ''), W - X, fy + 28);
    ctx.textAlign = 'left';
    return cv;
  }
  /* 白地を選んだときは、写しを作る瞬間だけページを白にする（html2canvas は呼んだその場で写しを作るので、画面は白に変わらない） */
  function shoot(h2c, w, y, hgt, white, bg) {
    var R = document.documentElement, was = R.getAttribute('data-theme'), p;
    if (white) R.setAttribute('data-theme', 'light');
    try {
      p = h2c(w, {
        backgroundColor: bg, scale: OUT_W / SHOT_W, useCORS: true, logging: false, imageTimeout: 8000,
        y: y, height: hgt, scrollX: 0, scrollY: 0,
        /* 写しを作るのは時系列の写しと見た目の定義だけ（ページ全体を写すと重い） */
        ignoreElements: function (el) { return el.parentNode === document.body && el.id !== 'xo-shot' && !/^(STYLE|LINK|META)$/.test(el.tagName); },
        onclone: function (doc) {
          var cw = doc.getElementById('xo-shot');
          if (!cw) return;
          /* 写しのページでは時系列の写しだけを残す（重さを減らす） */
          Array.prototype.forEach.call(doc.body.children, function (el) { if (el !== cw && el.tagName !== 'STYLE') el.style.display = 'none'; });
          cw.style.left = '0px';
          fixTree(cw, doc.defaultView);
        }
      });
    } finally {
      if (white) { if (was == null) R.removeAttribute('data-theme'); else R.setAttribute('data-theme', was); }
    }
    return p;
  }
  function toBlob(cv) { return new Promise(function (ok, ng) { cv.toBlob(function (b) { b ? ok(b) : ng(new Error('png')); }, 'image/png'); }); }
  function download(name, blob) {
    var url = URL.createObjectURL(blob), a = document.createElement('a');
    a.href = url; a.download = name; a.rel = 'noopener';
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(function () { URL.revokeObjectURL(url); }, 8000);
  }
  var busy = false;
  EX.render = function (white) {
    var h = host(), res = result();
    if (!h || !res) return Promise.reject(new Error('nores'));
    var tl = timelineEl(h);
    if (!tl) return Promise.reject(new Error('notl'));
    var info = headInfo(res, h), C = themeColors(white), bg = C.bg;
    return loadLib().then(function (h2c) {
      var w = buildShot(tl), scale = OUT_W / SHOT_W;
      /* 見出し・署名のぶん（最大 260px）を引いた高さで分ける */
      var parts = cuts(w, Math.floor((MAX_H - 260) / scale)), outs = [];
      var chain = Promise.resolve();
      parts.forEach(function (pt, k) {
        chain = chain.then(function () {
          say('記録を画像にしています…' + (parts.length > 1 ? '（' + (k + 1) + '/' + parts.length + '）' : ''));
          return shoot(h2c, w, pt[0], pt[1], white, bg).then(function (slice) {
            outs.push(compose(slice, info, C, k + 1, parts.length, pt[2]));
            slice.width = slice.height = 0;
          });
        });
      });
      return chain.then(function () { w.remove(); return { canvases: outs, info: info }; }, function (e) { w.remove(); throw e; });
    });
  };
  function fileName(info, k, n) { return '箱庭記録_' + safeName(info.scen) + (info.seed != null ? '_' + info.seed : '') + (n > 1 ? '_' + k + 'of' + n : '') + '.png'; }

  /* 保存：PC はダウンロード。スマホは画像を出して「共有・保存」を押してもらう（共有は押した直後でないと使えないため） */
  function deliver(out) {
    var cvs = out.canvases, n = cvs.length;
    return Promise.all(cvs.map(toBlob)).then(function (blobs) {
      var files = blobs.map(function (b, i) { return { name: fileName(out.info, i + 1, n), blob: b }; });
      if (!isMobile) {
        files.forEach(function (f, i) { setTimeout(function () { download(f.name, f.blob); }, i * 400); });
        say('記録を画像で保存しました' + (n > 1 ? '（' + n + '枚）' : ''));
        cvs.forEach(function (c) { c.width = c.height = 0; });
        return;
      }
      showResult(files, cvs);
      say('画像を作りました' + (n > 1 ? '（' + n + '枚）' : ''));
    });
  }
  function canShareFiles(fs) {
    try { return !!(navigator.share && navigator.canShare && navigator.canShare({ files: fs })); } catch (e) { return false; }
  }
  function modal(id) {
    var m = document.getElementById(id);
    if (!m) {
      m = document.createElement('div'); m.id = id; m.className = 'modal xo-modal'; m.hidden = true;
      m.innerHTML = '<div class="modal-box" role="dialog" aria-modal="true"></div>';
      document.body.appendChild(m);
      m.addEventListener('click', function (e) { if (e.target === m || (e.target.closest && e.target.closest('[data-xom="close"]'))) close(m); });
    }
    return m;
  }
  function close(m) {
    m.hidden = true;
    $$('img', m).forEach(function (im) { if (/^blob:/.test(im.src)) URL.revokeObjectURL(im.src); });
    $('.modal-box', m).innerHTML = '';
  }
  function showResult(files, cvs) {
    var m = modal('xo-imgmodal'), box = $('.modal-box', m), n = files.length;
    var fs = files.map(function (f) { try { return new File([f.blob], f.name, { type: 'image/png' }); } catch (e) { return null; } }).filter(Boolean);
    var share = fs.length === n && canShareFiles(fs);
    box.setAttribute('aria-label', '記録の画像');
    box.innerHTML = '<p class="hint" style="margin-top:0">' + (share ? '「共有・保存」から「画像を保存」やアプリを選べます。' : '') + '画像を長押し（PC は右クリック）でも保存できます。' + (n > 1 ? '長いので ' + n + ' 枚に分けました。' : '') + '</p>' +
      '<div class="xo-imgs" style="display:grid;gap:10px;max-height:56vh;overflow:auto;-webkit-overflow-scrolling:touch;border:1px solid var(--line);border-radius:6px;padding:6px">' +
      files.map(function (f, i) { return '<img alt="記録の画像 ' + (i + 1) + '/' + n + '" style="width:100%;height:auto;display:block">'; }).join('') + '</div>' +
      '<div class="row" style="margin-top:12px;gap:8px;flex-wrap:wrap">' + (share ? '<button class="btn primary" type="button" data-xom="share">共有・保存</button>' : '') +
      '<button class="btn" type="button" data-xom="dl">ダウンロード</button><span class="spacer"></span><button class="btn" type="button" data-xom="close">閉じる</button></div>';
    $$('img', box).forEach(function (im, i) { im.src = URL.createObjectURL(files[i].blob); });
    cvs.forEach(function (c) { c.width = c.height = 0; });
    box.onclick = function (e) {
      var b = e.target.closest && e.target.closest('[data-xom]');
      if (!b) return;
      var a = b.getAttribute('data-xom');
      if (a === 'share') {
        navigator.share({ files: fs }).catch(function (er) {
          if (er && er.name === 'AbortError') return;
          files.forEach(function (f, i) { setTimeout(function () { download(f.name, f.blob); }, i * 400); });
        });
      } else if (a === 'dl') files.forEach(function (f, i) { setTimeout(function () { download(f.name, f.blob); }, i * 400); });
    };
    m.hidden = false;
  }
  /* 白地か、いまの配色か（白のときは聞かない） */
  function askBg() {
    return new Promise(function (ok) {
      var th = themeNow();
      if (th === 'light') { ok(true); return; }
      var m = modal('xo-bgmodal'), box = $('.modal-box', m);
      box.setAttribute('aria-label', '記録の画像の背景');
      box.style.maxWidth = '420px';
      box.innerHTML = '<h2 style="margin:0 0 6px;font-size:16px">記録を画像で保存</h2><p class="hint" style="margin:0 0 14px">いまの絞り込みのまま、時系列を画像にします。背景を選んでください。</p>' +
        '<div class="row" style="gap:8px;flex-wrap:wrap"><button class="btn primary" type="button" data-xbg="white">白地で作る</button><button class="btn" type="button" data-xbg="theme">いまの配色（' + (th === 'dark' ? '黒' : 'グレー') + '）で作る</button><span class="spacer"></span><button class="btn ghost" type="button" data-xom="close">やめる</button></div>';
      box.onclick = function (e) {
        var b = e.target.closest && e.target.closest('[data-xbg]');
        if (!b) return;
        close(m);
        ok(b.getAttribute('data-xbg') === 'white');
      };
      m.hidden = false;
      var f = $('[data-xbg="white"]', box);
      if (f) f.focus();
    });
  }
  EX.timelineImage = function () {
    if (busy) return;
    var h = host();
    if (!result() || !h || !timelineEl(h)) { toast('画像にする記録がありません'); return; }
    askBg().then(function (white) {
      busy = true;
      var btn = $('#xo-img');
      if (btn) btn.disabled = true;
      say(window.html2canvas ? '記録を画像にしています…' : '画像化の部品を読み込んでいます…');
      return EX.render(white).then(deliver).catch(function (e) {
        if (e && e.message === 'load') { say(''); toast('画像化の部品を読み込めませんでした。通信の状態を確かめて、もう一度お試しください'); }
        else { say(''); toast('記録を画像にできませんでした。もう一度お試しください'); if (window.console) console.warn('[export-out]', e); }
      }).then(function () { busy = false; if (btn) btn.disabled = false; });
    });
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', watch); else watch();
})();
