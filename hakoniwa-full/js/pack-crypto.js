/* 箱庭シミュレーター: 追加パックの暗号（HK.PackCrypto）。両方のビルドに同じファイルを置く。組み立て道具（hakoniwa-tools/build/build-pack.js）も同じファイルを読む
   ・ブラウザの暗号機能（crypto.subtle）は file:// や古い Safari で使えないことがあるので、使わずに素の JavaScript で書く（どの環境でも同じ結果）
   ・鍵の作り方：コードを整えて（全角→半角・大文字・空白と - を除く）、PBKDF2-HMAC-SHA256（塩 16 バイト・it 回）で 32 バイトの鍵にする
   ・中身の鍵 K（32 バイト・乱数）を、コードごとの鍵で ChaCha20 で包み、HMAC-SHA256 の先頭 16 バイトで改ざんを見る（コードが違えば合わない）
   ・中身（JSON の文字列）は K で ChaCha20、HMAC-SHA256（K から作った鍵）で確かめる
   ・パックの形（packs/<枠>/pack.js が HK_PACK_Q に積むもの）：{ f: 1, id, keys: [{ s, n, w, m }], it, n, m, d }（どれも base64）
   設計：docs/reports/2026-11-02/pack-foundation.md */
(function () {
  'use strict';
  var root = typeof window !== 'undefined' ? window : (typeof globalThis !== 'undefined' ? globalThis : this);

  /* ---------- 文字列・base64 ---------- */
  function utf8(s) {
    if (typeof TextEncoder !== 'undefined') return new TextEncoder().encode(s);
    var out = [], i, c;
    s = unescape(encodeURIComponent(s));
    for (i = 0; i < s.length; i++) { c = s.charCodeAt(i); out.push(c); }
    return new Uint8Array(out);
  }
  function fromUtf8(b) {
    if (typeof TextDecoder !== 'undefined') return new TextDecoder('utf-8').decode(b);
    var s = '', i;
    for (i = 0; i < b.length; i += 8192) s += String.fromCharCode.apply(null, b.subarray(i, i + 8192));
    return decodeURIComponent(escape(s));
  }
  var B64 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/', B64R = {};
  (function () { for (var i = 0; i < 64; i++) B64R[B64.charAt(i)] = i; })();
  function b64enc(b) {
    var out = [], i, n;
    for (i = 0; i + 2 < b.length; i += 3) { n = (b[i] << 16) | (b[i + 1] << 8) | b[i + 2]; out.push(B64[n >> 18 & 63] + B64[n >> 12 & 63] + B64[n >> 6 & 63] + B64[n & 63]); }
    if (i < b.length) {
      n = b[i] << 16 | (i + 1 < b.length ? b[i + 1] << 8 : 0);
      out.push(B64[n >> 18 & 63] + B64[n >> 12 & 63] + (i + 1 < b.length ? B64[n >> 6 & 63] : '=') + '=');
    }
    return out.join('');
  }
  function b64dec(s) {
    s = String(s || '').replace(/[^A-Za-z0-9+/]/g, '');
    var len = Math.floor(s.length * 3 / 4), out = new Uint8Array(len), i, j = 0, n;
    for (i = 0; i < s.length; i += 4) {
      n = (B64R[s.charAt(i)] << 18) | (B64R[s.charAt(i + 1)] << 12) | ((B64R[s.charAt(i + 2)] || 0) << 6) | (B64R[s.charAt(i + 3)] || 0);
      if (j < len) out[j++] = n >> 16 & 255;
      if (j < len) out[j++] = n >> 8 & 255;
      if (j < len) out[j++] = n & 255;
    }
    return out;
  }

  /* ---------- SHA-256 ---------- */
  var KS = new Uint32Array([
    0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5, 0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3,
    0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174, 0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
    0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967, 0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13,
    0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85, 0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
    0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3, 0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208,
    0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2]);
  var IV = [0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a, 0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19];
  var Wb = new Uint32Array(64);
  /* 64 バイトの塊を1つ足す（h は長さ8の Uint32Array。その場で書き換える） */
  function block(h, b, o) {
    var W = Wb, i, t1, t2, a, bb, c, d, e, f, g, hh, x, y;
    for (i = 0; i < 16; i++) W[i] = (b[o + i * 4] << 24) | (b[o + i * 4 + 1] << 16) | (b[o + i * 4 + 2] << 8) | b[o + i * 4 + 3];
    for (i = 16; i < 64; i++) {
      x = W[i - 15]; y = W[i - 2];
      W[i] = (((x >>> 7) | (x << 25)) ^ ((x >>> 18) | (x << 14)) ^ (x >>> 3)) + W[i - 7] + (((y >>> 17) | (y << 15)) ^ ((y >>> 19) | (y << 13)) ^ (y >>> 10)) + W[i - 16];
    }
    a = h[0]; bb = h[1]; c = h[2]; d = h[3]; e = h[4]; f = h[5]; g = h[6]; hh = h[7];
    for (i = 0; i < 64; i++) {
      t1 = (hh + (((e >>> 6) | (e << 26)) ^ ((e >>> 11) | (e << 21)) ^ ((e >>> 25) | (e << 7))) + ((e & f) ^ (~e & g)) + KS[i] + W[i]) | 0;
      t2 = ((((a >>> 2) | (a << 30)) ^ ((a >>> 13) | (a << 19)) ^ ((a >>> 22) | (a << 10))) + ((a & bb) ^ (a & c) ^ (bb & c))) | 0;
      hh = g; g = f; f = e; e = (d + t1) | 0; d = c; c = bb; bb = a; a = (t1 + t2) | 0;
    }
    h[0] = (h[0] + a) | 0; h[1] = (h[1] + bb) | 0; h[2] = (h[2] + c) | 0; h[3] = (h[3] + d) | 0;
    h[4] = (h[4] + e) | 0; h[5] = (h[5] + f) | 0; h[6] = (h[6] + g) | 0; h[7] = (h[7] + hh) | 0;
  }
  /* 状態 h（すでに pre バイト分を足したもの）に msg を足して仕上げる */
  function finish(h0, pre, msg) {
    var h = new Uint32Array(h0), n = msg.length, tot = pre + n, padLen = ((n + 9 + 63) >> 6) << 6, buf = new Uint8Array(padLen), i, out = new Uint8Array(32);
    buf.set(msg); buf[n] = 0x80;
    var bits = tot * 8, hi = Math.floor(bits / 0x100000000);
    buf[padLen - 8] = hi >>> 24; buf[padLen - 7] = hi >>> 16 & 255; buf[padLen - 6] = hi >>> 8 & 255; buf[padLen - 5] = hi & 255;
    buf[padLen - 4] = bits >>> 24 & 255; buf[padLen - 3] = bits >>> 16 & 255; buf[padLen - 2] = bits >>> 8 & 255; buf[padLen - 1] = bits & 255;
    for (i = 0; i < padLen; i += 64) block(h, buf, i);
    for (i = 0; i < 8; i++) { out[i * 4] = h[i] >>> 24; out[i * 4 + 1] = h[i] >>> 16 & 255; out[i * 4 + 2] = h[i] >>> 8 & 255; out[i * 4 + 3] = h[i] & 255; }
    return out;
  }
  function sha256(msg) { return finish(new Uint32Array(IV), 0, msg); }

  /* ---------- HMAC-SHA256（鍵の内側・外側の状態を先に作っておき、PBKDF2 で使い回す） ---------- */
  function hmacKey(key) {
    if (key.length > 64) key = sha256(key);
    var ip = new Uint8Array(64), op = new Uint8Array(64), i;
    for (i = 0; i < 64; i++) { ip[i] = (key[i] || 0) ^ 0x36; op[i] = (key[i] || 0) ^ 0x5c; }
    var hi = new Uint32Array(IV), ho = new Uint32Array(IV);
    block(hi, ip, 0); block(ho, op, 0);
    return { i: hi, o: ho };
  }
  function hmacWith(k, msg) { return finish(k.o, 64, finish(k.i, 64, msg)); }
  function hmac(key, msg) { return hmacWith(hmacKey(key), msg); }
  function concat() {
    var n = 0, i, o = 0, out;
    for (i = 0; i < arguments.length; i++) n += arguments[i].length;
    out = new Uint8Array(n);
    for (i = 0; i < arguments.length; i++) { out.set(arguments[i], o); o += arguments[i].length; }
    return out;
  }
  /* PBKDF2-HMAC-SHA256。出力 32 バイト（1 ブロック） */
  function pbkdf2(pass, salt, it) {
    var k = hmacKey(pass), u = hmacWith(k, concat(salt, new Uint8Array([0, 0, 0, 1]))), t = new Uint8Array(u), i, j;
    for (i = 1; i < it; i++) { u = hmacWith(k, u); for (j = 0; j < 32; j++) t[j] ^= u[j]; }
    return t;
  }

  /* ---------- ChaCha20（RFC 8439。鍵 32 バイト・nonce 12 バイト・カウンタは 0 から） ---------- */
  function chacha20(key, nonce, data) {
    var st = new Uint32Array(16), x = new Uint32Array(16), out = new Uint8Array(data.length), ks = new Uint8Array(64), i, j, p, ctr = 0;
    var rd = function (b, o) { return b[o] | (b[o + 1] << 8) | (b[o + 2] << 16) | (b[o + 3] << 24); };
    st[0] = 0x61707865; st[1] = 0x3320646e; st[2] = 0x79622d32; st[3] = 0x6b206574;
    for (i = 0; i < 8; i++) st[4 + i] = rd(key, i * 4);
    st[13] = rd(nonce, 0); st[14] = rd(nonce, 4); st[15] = rd(nonce, 8);
    function qr(a, b, c, d) {
      x[a] = (x[a] + x[b]) | 0; x[d] ^= x[a]; x[d] = (x[d] << 16) | (x[d] >>> 16);
      x[c] = (x[c] + x[d]) | 0; x[b] ^= x[c]; x[b] = (x[b] << 12) | (x[b] >>> 20);
      x[a] = (x[a] + x[b]) | 0; x[d] ^= x[a]; x[d] = (x[d] << 8) | (x[d] >>> 24);
      x[c] = (x[c] + x[d]) | 0; x[b] ^= x[c]; x[b] = (x[b] << 7) | (x[b] >>> 25);
    }
    for (p = 0; p < data.length; p += 64) {
      st[12] = ctr++;
      x.set(st);
      for (i = 0; i < 10; i++) {
        qr(0, 4, 8, 12); qr(1, 5, 9, 13); qr(2, 6, 10, 14); qr(3, 7, 11, 15);
        qr(0, 5, 10, 15); qr(1, 6, 11, 12); qr(2, 7, 8, 13); qr(3, 4, 9, 14);
      }
      for (i = 0; i < 16; i++) { j = (x[i] + st[i]) | 0; ks[i * 4] = j & 255; ks[i * 4 + 1] = j >>> 8 & 255; ks[i * 4 + 2] = j >>> 16 & 255; ks[i * 4 + 3] = j >>> 24 & 255; }
      for (i = 0; i < 64 && p + i < data.length; i++) out[p + i] = data[p + i] ^ ks[i];
    }
    return out;
  }

  /* ---------- パック ---------- */
  var TAGW = utf8('hk-pack-wrap:'), TAGP = utf8('hk-pack-data:'), TAGM = utf8('hk-pack-mac'), IT = 10000;
  /* コードの整え方：全角→半角（NFKC）・大文字・空白と -・_ を除く */
  function norm(code) {
    var s = String(code == null ? '' : code);
    try { s = s.normalize('NFKC'); } catch (e) { /* normalize の無い環境はそのまま */ }
    return s.toUpperCase().replace(/[\s\-_ー－‐]/g, '');
  }
  function same(a, b) { if (a.length !== b.length) return false; var d = 0; for (var i = 0; i < a.length; i++) d |= a[i] ^ b[i]; return d === 0; }
  function macKeyOf(K) { return hmac(K, TAGM); }
  /* コードでパックの鍵 K を開く。合わなければ null（どの枠でも合わない） */
  function unlock(pk, code) {
    if (!pk || !Array.isArray(pk.keys)) return null;
    var c = utf8(norm(code)), it = pk.it || IT, i, s, kek, w, n, m;
    if (!c.length) return null;
    for (i = 0; i < pk.keys.length; i++) {
      s = b64dec(pk.keys[i].s); n = b64dec(pk.keys[i].n); w = b64dec(pk.keys[i].w); m = b64dec(pk.keys[i].m);
      kek = pbkdf2(c, s, it);
      if (same(hmac(kek, concat(TAGW, n, w)).subarray(0, 16), m)) return chacha20(kek, n, w);
    }
    return null;
  }
  /* 鍵 K で中身を開く（文字列）。改ざん・取り違えなら例外 */
  function open(pk, K) {
    var n = b64dec(pk.n), d = b64dec(pk.d), m = b64dec(pk.m);
    if (!same(hmac(macKeyOf(K), concat(TAGP, n, d)).subarray(0, 16), m)) throw new Error('追加データが壊れています');
    return fromUtf8(chacha20(K, n, d));
  }
  /* 組み立て道具から使う：中身の文字列を、コードの一覧で包む（rand(n) は n バイトの乱数を返す関数） */
  function seal(text, codes, rand, it) {
    it = it || IT;
    var K = rand(32), n = rand(12), d = chacha20(K, n, utf8(text));
    var keys = codes.map(function (code) {
      var c = utf8(norm(code));
      if (!c.length) throw new Error('空のコードは使えません');
      var s = rand(16), kn = rand(12), kek = pbkdf2(c, s, it), w = chacha20(kek, kn, K);
      return { s: b64enc(s), n: b64enc(kn), w: b64enc(w), m: b64enc(hmac(kek, concat(TAGW, kn, w)).subarray(0, 16)) };
    });
    return { it: it, keys: keys, n: b64enc(n), m: b64enc(hmac(macKeyOf(K), concat(TAGP, n, d)).subarray(0, 16)), d: b64enc(d) };
  }

  var API = {
    norm: norm, unlock: unlock, open: open, seal: seal,
    keyHex: function (K) { var s = ''; for (var i = 0; i < K.length; i++) s += (K[i] < 16 ? '0' : '') + K[i].toString(16); return s; },
    keyFromHex: function (h) { var o = new Uint8Array(32); for (var i = 0; i < 32; i++) o[i] = parseInt(String(h).substr(i * 2, 2), 16) || 0; return o; },
    /* 試験用（組み立て道具の点検で、node の crypto と結果を比べる） */
    _t: { sha256: sha256, hmac: hmac, pbkdf2: pbkdf2, chacha20: chacha20, utf8: utf8, b64enc: b64enc, b64dec: b64dec }
  };
  if (root && root.HK) root.HK.PackCrypto = API;
  else if (root && typeof root.document !== 'undefined') { root.HK = root.HK || {}; root.HK.PackCrypto = API; }
  if (typeof module !== 'undefined' && module.exports) module.exports = API;
})();
