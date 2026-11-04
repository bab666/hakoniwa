/* 箱庭シミュレーター: 画面の保険と不具合の記録（2026-11-04。結果には影響しない。中核の最初のほうで読む）
   利用者の報告「スマホ版で箱庭の設定をしようとスクロールすると画面が真っ白になる（手元では再現しない）」への対処。
   ・不具合の記録 HK.Guard：画面で起きた例外（error・unhandledrejection）・読み込めなかったかたまり（js/ の下だけ）・画面が空になったことを、
     時刻・タブ・箱庭・画面の大きさ・スクロール位置・ブラウザと一緒に、このブラウザに 40 件まで残す（localStorage の hakoniwa-errlog。
     使えなければこのページを開いているあいだだけ）。見る・コピーする・消すのは右上の「表示」のメニューの「不具合の記録」（ui-guard-view.js。late）
   ・壊れても白くならない：画面を描いたあと（例外のあと・スクロールが止まったとき・ページに戻ったとき）に、いま見ているタブの中身が空になっていないかを見て、
     空なら一度だけ描き直し（HK.UI.refresh）、それでも空なら「もう一度表示する／読み込み直す／記録をコピー」の案内を出す。
     例外が起きたときは、画面の下に「もう一度表示する」の小さな知らせを出す（拡張機能など、このページ以外のファイルの例外は記録だけ）
   ・iPhone・iPad・Mac の Safari（WebKit）では content-visibility（隠したタブ・住人の行・関係の行の描画の省略）を使わない：
     WebKit で、省略していた箇所がスクロールしても描かれず白いまま残ることがあるため（html に hk-webkit を付けて上書き）
   ・小窓（HK.Modal）で止めた背景が、窓が無いのに止まったままになっていたら戻す（戻る・別のタブから戻ったとき）
   2026-11-04 追記（報告「iPhone の Safari でスクロールすると文字が見えなくなる（どこかに飛ぶ？）」。docs/reports/2026-11-04/safari-scroll.md）：
   ・WebKit の判定は UA だけでなく navigator.vendor（Apple）でも見る（「デスクトップ用 Web サイトを表示」で UA が Mac になっても外れないように）
   ・空の判定を厳しくする（子が無い、または高さが無くて文字も無いときだけ）。指で触っているあいだ・スクロールの直後は見ない。描き直しは位置を保つ（HK.UI.refresh）
   ・HK.Guard.userAt()：利用者が最後に自分でスクロール・操作した時刻（ui.js が、念押しのスクロールや描き直しの位置の戻しを、利用者のスクロールを邪魔しないように使う）
   ・HK.Guard.note(種類, 文)：直前の出来事の控え（描き直し・プログラムによるスクロール・読み込み。このページを開いているあいだの 30 件）。記録を残すときに直前の 6 件を添える。
     スクロールの見張り（プログラムによるスクロール・大きな飛び・ページの高さの急な変化）は late の ui-guard-scroll.js
   ・HK.Guard.act()／act(true)：利用者の操作で始まった処理（箱庭を回す）の始まり／終わり。HK.Guard.acting() は始まりから 3 秒以内か終わりから 1 秒以内で真
     （その結果のスクロールを「操作から」とみなす。userAt は利用者が自分でスクロールした時刻なので、これでは動かさない）
   ・記録と知らせる文に iOS の版・画面の向きを添える */
(function () {
  'use strict';
  var HK = window.HK = window.HK || {};
  if (typeof document === 'undefined' || HK.Guard) return;
  var KEY = 'hakoniwa-errlog', MAX = 40, log = [], trace = [];
  /* 直前の出来事の控え（保存しない）。記録を残すときに添える */
  function note(k, m) { trace.push({ ts: Date.now(), k: String(k), m: String(m || '').slice(0, 160) }); if (trace.length > 30) trace.splice(0, trace.length - 30); }
  /* 利用者が自分でスクロール・操作した時刻（指・ホイール・キー）。指で触っているあいだ（touching）は空の判定もしない */
  var userT = 0, touching = 0, actS = 0, actE = 0;
  function mark() { userT = Date.now(); }
  ['wheel', 'keydown', 'pointerdown'].forEach(function (k) { window.addEventListener(k, mark, { passive: true, capture: true }); });
  window.addEventListener('touchstart', function () { touching++; mark(); }, { passive: true, capture: true });
  window.addEventListener('touchmove', mark, { passive: true, capture: true });
  ['touchend', 'touchcancel'].forEach(function (k) { window.addEventListener(k, function (ev) { mark(); touching = ev.touches ? ev.touches.length : 0; }, { passive: true, capture: true }); });
  try { var raw = window.localStorage && localStorage.getItem(KEY); log = raw ? JSON.parse(raw) : []; if (!Array.isArray(log)) log = []; } catch (e) { log = []; }

  /* ---------- WebKit ---------- */
  var ua = String(navigator.userAgent || ''), de = document.documentElement;
  var ios = /iP(hone|od|ad)/.test(ua) || (/Macintosh/.test(ua) && (navigator.maxTouchPoints || 0) > 1);
  var vend = String(navigator.vendor || '');
  var webkit = ios || /Apple/.test(vend) || (/AppleWebKit\//.test(ua) && !/(Chrome|Chromium|Edg|OPR|Android)\//.test(ua));
  /* iOS の版（「デスクトップ用」のときは UA に出ないので Version/ の版） */
  var iosV = (ua.match(/OS (\d+)[_.](\d+)(?:[_.](\d+))?/) || [])[0] || '';
  iosV = iosV ? 'iOS ' + iosV.replace(/^OS /, '').replace(/_/g, '.') : (webkit && (navigator.maxTouchPoints || 0) > 1 ? 'iOS/iPadOS（デスクトップ表示）Safari ' + ((ua.match(/Version\/([\d.]+)/) || [])[1] || '?') : '');
  function orient() { var w = window.innerWidth || 0, h = window.innerHeight || 0; return w > h ? '横' : '縦'; }
  if (webkit) {
    de.classList.add('hk-webkit');
    var st = document.createElement('style');
    st.textContent = 'html.hk-webkit #view-box[hidden]{display:none!important;content-visibility:visible!important}' +
      'html.hk-webkit #castlist .res,html.hk-webkit .tiebox .tierow{content-visibility:visible!important}';
    (document.head || de).appendChild(st);
  }

  /* ---------- 記録 ---------- */
  function where() {
    var v = document.querySelector('main>section[role=tabpanel]:not([hidden])'), S = null;
    try { S = HK.UI && HK.UI.state ? HK.UI.state() : null; } catch (e) { S = null; }
    var vv = window.visualViewport, z = vv && vv.scale && Math.abs(vv.scale - 1) > 0.01 ? '・拡大' + Math.round(vv.scale * 100) + '%' : '';
    return { tab: v ? v.id.replace(/^view-/, '') : '', scen: S && S.scenId || '', vw: (window.innerWidth || 0) + 'x' + (window.innerHeight || 0) + orient() + z, y: Math.round(window.pageYOffset || 0) + '/' + Math.round(de.scrollHeight || 0) };
  }
  function save() { try { if (window.localStorage) localStorage.setItem(KEY, JSON.stringify(log)); } catch (e) { /* 保存できなくても記録は続ける */ } }
  function add(kind, msg, stack) {
    msg = String(msg || '').slice(0, 400); stack = String(stack || '').split('\n').slice(0, 6).join('\n').slice(0, 800);
    var now = Date.now(), last = log[log.length - 1];
    if (last && last.msg === msg && last.kind === kind && now - last.ts < 3000) { last.n = (last.n || 1) + 1; save(); return last; }
    var w = where(), e = { ts: now, t: new Date(now).toISOString(), kind: kind, msg: msg, stack: stack, tab: w.tab, scen: w.scen, vw: w.vw, y: w.y, v: (window.HK_MANIFEST && window.HK_MANIFEST.v) || '' };
    if (trace.length) e.tr = trace.slice(-6).map(function (x) { return Math.round((now - x.ts) / 100) / 10 + '秒前 ' + x.k + '：' + x.m; });
    log.push(e);
    if (log.length > MAX) log.splice(0, log.length - MAX);
    save();
    return e;
  }
  /* このページのファイルの例外か（拡張機能・外のウィジェットの例外は案内を出さない） */
  function ours(file, stack) {
    var s = String(file || '') + '\n' + String(stack || '');
    if (/(extension|safari-web-extension|moz-extension):\/\//.test(s)) return false;
    if (!file && !stack) return false;
    return /\/js\/|index\.html|pack:|blob:/.test(s) || String(file).indexOf(location.href.split('#')[0].replace(/[^/]*$/, '')) === 0;
  }
  window.addEventListener('error', function (ev) {
    var t = ev.target;
    if (t && t !== window && t.tagName) {   /* 読み込めなかったファイル（script・link だけ。アイコンの画像などは数えない） */
      /* 本体のかたまり（js/）だけ。追加パックの枠を探す読み込み（packs/<枠>/pack.js。無い枠は失敗するのが普通）・外のウィジェットは数えない */
      var src = String(t.src || t.href || '');
      if (/^(SCRIPT|LINK)$/.test(t.tagName) && /\/js\//.test(src) && !/\/packs\//.test(src)) add('load', '読み込めませんでした：' + src.replace(/^.*\/js\//, 'js/'));
      return;
    }
    var m = ev.message || (ev.error && ev.error.message) || '';
    if (/ResizeObserver loop|^Script error\.?$/.test(m)) return;
    var stk = ev.error && ev.error.stack || '';
    add('error', m, (ev.filename ? ev.filename + ':' + ev.lineno + ':' + ev.colno + '\n' : '') + stk);
    if (ours(ev.filename, stk)) problem();
  }, true);
  window.addEventListener('unhandledrejection', function (ev) {
    var r = ev.reason, m = r && r.message || String(r || '');
    add('promise', m, r && r.stack || '');
  });

  /* ---------- 空の画面を見張る ---------- */
  function booted() { return !!(HK.UI && HK.UI.state && HK.UI.refresh) && !de.classList.contains('hk-locked'); }
  function blank() {
    if (!booted()) return false;
    var vs = document.querySelectorAll('main>section[role=tabpanel]');
    if (!vs.length) return false;
    var v = document.querySelector('main>section[role=tabpanel]:not([hidden])');
    if (!v) return true;
    if (!/^view-(cast|box|result)$/.test(v.id)) return false;   /* セーブのタブは late の画面なので見ない */
    if (!v.firstElementChild) return true;
    /* 描き途中・遅れて描く節（iOS）で高さが一瞬 0 になることがあるので、文字も無いときだけ空とみなす */
    var r = v.getBoundingClientRect();
    return r.height < 8 && !String(v.textContent || '').trim();
  }
  var retried = 0, chkT = 0;
  function check() {
    chkT = 0;
    /* 指で触っている・慣性で動いている（直前に操作があった）あいだは見ない（描き直しでスクロールを邪魔しない） */
    if (touching || Date.now() - userT < 350) { chkT = setTimeout(check, 500); return; }
    if (HK.Modal && HK.Modal.sync) try { HK.Modal.sync(); } catch (e) { /* 何もしない */ }
    if (!blank()) { retried = 0; hideBox(); return; }
    add('blank', '画面の中身が空になっていました');
    if (retried < 1) {
      retried++;
      try { HK.UI.refresh('空の画面'); } catch (e) { add('error', '描き直しに失敗：' + (e && e.message || e), e && e.stack); }
      setTimeout(function () { if (blank()) showBox(); else retried = 0; }, 600);
    } else showBox();
  }
  function soon(ms) { if (!chkT) chkT = setTimeout(check, ms || 400); }
  window.addEventListener('scroll', function () { if (chkT) clearTimeout(chkT); chkT = setTimeout(check, 500); }, { passive: true });
  window.addEventListener('pageshow', function () { soon(300); });
  document.addEventListener('visibilitychange', function () { if (!document.hidden) soon(300); });

  /* ---------- 案内（空のとき：真ん中の板／例外のとき：下の小さな知らせ） ---------- */
  var box = null, bar = null, barT = 0;
  function btn(label, fn, primary) {
    var b = document.createElement('button');
    b.type = 'button'; b.className = 'btn small' + (primary ? ' primary' : ''); b.textContent = label;
    b.addEventListener('click', fn);
    return b;
  }
  function redraw() {
    hideBox(); hideBar(); retried = 0;
    try { if (HK.Modal && HK.Modal.sync) HK.Modal.sync(); HK.UI.refresh('もう一度表示'); } catch (e) { add('error', '描き直しに失敗：' + (e && e.message || e), e && e.stack); }
    setTimeout(function () { if (blank()) showBox(); }, 600);
  }
  function copyLog(b) {
    var txt = G.text(), done = function (ok) { if (b) b.textContent = ok ? 'コピーしました' : 'コピーできませんでした'; };
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) { navigator.clipboard.writeText(txt).then(function () { done(true); }, function () { done(fallback(txt)); }); return; }
    } catch (e) { /* 下でやり直す */ }
    done(fallback(txt));
  }
  function fallback(txt) {
    var ta = document.createElement('textarea'); ta.value = txt; ta.setAttribute('readonly', ''); ta.style.cssText = 'position:fixed;top:0;left:0;opacity:0;font-size:16px';
    document.body.appendChild(ta); ta.select(); try { ta.setSelectionRange(0, txt.length); } catch (e) { /* 古い環境 */ }
    var ok = false; try { ok = document.execCommand('copy'); } catch (e) { ok = false; }
    ta.remove(); return ok;
  }
  var PANEL = 'position:fixed;z-index:2147482000;background:var(--ui-card,var(--paper,#fff));color:var(--ui-ink,var(--ink,#1b232b));border:1px solid var(--ui-line2,var(--line,#ccc));border-radius:12px;box-shadow:0 8px 28px rgba(0,0,0,.18);font-size:14px;line-height:1.7;';
  function showBox() {
    if (box || !document.body) return;
    hideBar();
    box = document.createElement('div');
    box.id = 'hk-guard'; box.setAttribute('role', 'alertdialog'); box.setAttribute('aria-label', '画面を表示できませんでした');
    box.style.cssText = PANEL + 'left:16px;right:16px;top:50%;transform:translateY(-50%);max-width:420px;margin:0 auto;padding:18px 18px 14px';
    box.innerHTML = '<b style="display:block;font-size:16px;margin-bottom:4px">画面をうまく表示できませんでした</b><p style="margin:0 0 12px;font-size:13px">住人や設定は残っています。「もう一度表示する」で戻らないときは、読み込み直してください。不具合の記録をコピーして知らせていただけると、原因を調べられます。</p>';
    var row = document.createElement('div'); row.style.cssText = 'display:flex;flex-wrap:wrap;gap:8px';
    row.appendChild(btn('もう一度表示する', redraw, true));
    row.appendChild(btn('読み込み直す', function () { location.reload(); }));
    var cp = btn('不具合の記録をコピー', function () { copyLog(cp); }); row.appendChild(cp);
    box.appendChild(row);
    document.body.appendChild(box);
  }
  function hideBox() { if (box) { box.remove(); box = null; } }
  function problem() {
    if (!booted() || !document.body) return;
    setTimeout(function () { if (blank()) check(); else showBar(); }, 300);
  }
  function showBar() {
    if (box) return;
    if (!bar) {
      bar = document.createElement('div');
      bar.id = 'hk-guardbar'; bar.setAttribute('role', 'status');
      bar.style.cssText = PANEL + 'left:12px;right:12px;bottom:calc(76px + env(safe-area-inset-bottom,0px));max-width:560px;margin:0 auto;padding:10px 12px;display:flex;flex-wrap:wrap;align-items:center;gap:8px';
      var t = document.createElement('span'); t.style.cssText = 'flex:1 1 12em;font-size:13px'; t.textContent = '画面の処理でエラーが起きました。表示がおかしいときは、もう一度表示してください。';
      bar.appendChild(t);
      bar.appendChild(btn('もう一度表示する', redraw, true));
      var cp = btn('記録をコピー', function () { copyLog(cp); }); bar.appendChild(cp);
      var x = btn('×', hideBar); x.setAttribute('aria-label', 'この知らせを閉じる'); bar.appendChild(x);
      document.body.appendChild(bar);
    }
    if (barT) clearTimeout(barT);
    barT = setTimeout(hideBar, 15000);
  }
  function hideBar() { if (bar) { bar.remove(); bar = null; } if (barT) { clearTimeout(barT); barT = 0; } }

  var G = HK.Guard = {
    add: add,
    list: function () { return log.slice(); },
    clear: function () { log = []; save(); },
    check: function () { soon(0); },
    blank: blank,
    webkit: webkit,
    ios: iosV,
    note: note,
    trace: function () { return trace.slice(); },
    userAt: function () { return userT; },
    act: function (end) { if (end) actE = Date.now(); else actS = Date.now(); },
    acting: function () { var n = Date.now(); return n - actS < 3000 || n - actE < 1000; },
    /* 知らせるための文（新しい順）。ブラウザ・画面・版も添える */
    text: function () {
      var head = '箱庭シミュレーター 不具合の記録（' + new Date().toLocaleString() + '）\n' +
        'ブラウザ：' + ua + (iosV ? '\n端末：' + iosV : '') + '\n画面：' + (window.innerWidth || 0) + 'x' + (window.innerHeight || 0) + '・' + orient() + '・倍率 ' + (window.devicePixelRatio || 1) + (webkit ? '・WebKit' : '') + (window.navigator.standalone ? '・ホーム画面から' : '') + '\n版：' + ((window.HK_MANIFEST && window.HK_MANIFEST.v) || '') + '\n';
      if (!log.length) return head + '（記録はありません）';
      return head + log.slice().reverse().map(function (e) {
        return '---\n' + e.t + '［' + e.kind + (e.n > 1 ? ' ×' + e.n : '') + '］' + e.msg + '\nタブ：' + (e.tab || '-') + '・箱庭：' + (e.scen || '-') + '・画面：' + e.vw + '・位置：' + e.y + (e.stack ? '\n' + e.stack : '') + (e.tr ? '\n直前：' + e.tr.join(' ／ ') : '');
      }).join('\n');
    }
  };
})();
