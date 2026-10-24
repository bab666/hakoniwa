/* 箱庭シミュレーター（有料版）: 初回だけパスワードを聞く
   ・合っていれば、このブラウザに覚えておき（localStorage の hakoniwa-r18-unlock）、次からは聞かない。ブラウザのデータを消すと、また聞く
   ・パスワードそのものはここに書かず、SHA-256 のハッシュと比べる
   ・このファイルを消すと（index.html の読み込みは失敗しても何も起きない）、パスワードなしの配布版になる */
(function () {
  'use strict';
  var CSS = [
    'html.hk-locked body > *:not(#hk-gate) { visibility: hidden; }',
    '#hk-gate { position: fixed; inset: 0; z-index: 2147483000; display: flex; align-items: center; justify-content: center; padding: 16px; background: #edf0f2; color: #1b232b; font: 14px/1.7 -apple-system, BlinkMacSystemFont, "Hiragino Sans", "Yu Gothic UI", "Noto Sans JP", sans-serif; }',
    '#hk-gate form { width: min(360px, 100%); background: #fbfcfc; border: 1px solid #d3d9df; border-radius: 10px; padding: 22px 20px; box-shadow: 0 8px 28px rgba(0,0,0,.08); }',
    '#hk-gate h2 { margin: 0 0 4px; font: 700 20px/1.3 "Hiragino Mincho ProN", "Yu Mincho", "Noto Serif JP", serif; letter-spacing: .08em; }',
    '#hk-gate p { margin: 0 0 14px; color: #5b6672; font-size: 13px; }',
    '#hk-gate input { width: 100%; box-sizing: border-box; font: inherit; font-size: 16px; padding: 8px 10px; border: 1px solid #d3d9df; border-radius: 6px; background: #fff; color: inherit; }',
    '#hk-gate button { margin-top: 12px; width: 100%; font: inherit; font-weight: 600; padding: 9px; border: 0; border-radius: 6px; background: #2b5b7c; color: #fff; cursor: pointer; }',
    '#hk-gate .err { color: #c0392b; font-size: 12px; margin: 8px 0 0; min-height: 1.4em; }',
    '@media (prefers-color-scheme: dark) {',
    '  #hk-gate { background: #11161b; color: #e3e8ed; }',
    '  #hk-gate form { background: #182027; border-color: #2b3640; }',
    '  #hk-gate p { color: #95a1ad; }',
    '  #hk-gate input { background: #11161b; border-color: #2b3640; }',
    '  #hk-gate button { background: #7fb2d9; color: #0d1820; }',
    '}'
  ].join('\n');
  var KEY = 'hakoniwa-r18-unlock', H = 'bb84771c0cdcba81d79e8384fa0aa416956d2093fdc0559b1d80f07a056c547e';
  function get() { try { return localStorage.getItem(KEY); } catch (e) { return null; } }
  function put() { try { localStorage.setItem(KEY, H); } catch (e) {} }
  if (get() === H) return;
  var st = document.createElement('style');
  st.textContent = CSS;
  (document.head || document.documentElement).appendChild(st);
  /* SHA-256（パスワードそのものはページに書かない） */
  function sha256(str) {
    var K = [], W = [], h = [], i, j, isP = function (n) { for (var d = 2; d * d <= n; d++) if (n % d === 0) return false; return true; };
    for (i = 2, j = 0; j < 64; i++) if (isP(i)) { if (j < 8) h[j] = (Math.pow(i, 1 / 2) * 4294967296) | 0; K[j++] = (Math.pow(i, 1 / 3) * 4294967296) | 0; }
    var b = unescape(encodeURIComponent(str)), L = b.length * 8, w = [];
    for (i = 0; i < b.length; i++) w[i >> 2] |= b.charCodeAt(i) << ((3 - i % 4) * 8);
    w[L >> 5] |= 0x80 << (24 - L % 32); w[((L + 64 >> 9) << 4) + 15] = L;
    function r(x, n) { return (x >>> n) | (x << (32 - n)); }
    for (j = 0; j < w.length; j += 16) {
      var a = h.slice(0);
      for (i = 0; i < 64; i++) {
        if (i < 16) W[i] = w[j + i] | 0;
        else W[i] = (r(W[i - 2], 17) ^ r(W[i - 2], 19) ^ (W[i - 2] >>> 10)) + W[i - 7] + (r(W[i - 15], 7) ^ r(W[i - 15], 18) ^ (W[i - 15] >>> 3)) + W[i - 16] | 0;
        var t1 = a[7] + (r(a[4], 6) ^ r(a[4], 11) ^ r(a[4], 25)) + ((a[4] & a[5]) ^ (~a[4] & a[6])) + K[i] + W[i] | 0;
        var t2 = (r(a[0], 2) ^ r(a[0], 13) ^ r(a[0], 22)) + ((a[0] & a[1]) ^ (a[0] & a[2]) ^ (a[1] & a[2])) | 0;
        a = [t1 + t2 | 0].concat(a.slice(0, 7)); a[4] = a[4] + t1 | 0;
      }
      for (i = 0; i < 8; i++) h[i] = h[i] + a[i] | 0;
    }
    return h.map(function (x) { return ('00000000' + (x >>> 0).toString(16)).slice(-8); }).join('');
  }
  document.documentElement.classList.add('hk-locked');
  function show() {
    var g = document.createElement('div');
    g.id = 'hk-gate';
    g.innerHTML = '<form autocomplete="off"><h2>箱庭シミュレーター</h2><p>有料版をお使いいただきありがとうございます。初回のみ、購入時にお知らせしたパスワードを入力してください。</p>' +
      '<input type="password" aria-label="パスワード" placeholder="パスワード" autofocus><button type="submit">はじめる</button><div class="err" role="alert"></div></form>';
    document.body.appendChild(g);
    var f = g.querySelector('form'), inp = g.querySelector('input'), err = g.querySelector('.err');
    inp.focus();
    f.addEventListener('submit', function (e) {
      e.preventDefault();
      if (sha256(inp.value.trim()) === H) { put(); g.remove(); document.documentElement.classList.remove('hk-locked'); }
      else { err.textContent = 'パスワードが違います。'; inp.select(); }
    });
  }
  if (document.body) show(); else document.addEventListener('DOMContentLoaded', show);
})();
