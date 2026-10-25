/* 箱庭シミュレーター: 結果を画像にする・Xに投稿する
   画像は端末の標準フォントだけで描く（フォントファイルは読み込まない）。
   Xへは「投稿画面を開く＋画像をクリップボードへ（PC）／共有シート（スマホ）」の手動添付方式 */
(function () {
  'use strict';
  var HK = window.HK;
  var CONF = HK.CONF = HK.CONF || {};
  /* 投稿に付けるリンク。公開先が決まったらここにURLを入れる（空なら Tool置き場） */
  if (CONF.siteUrl == null) CONF.siteUrl = '';
  CONF.toolsUrl = CONF.toolsUrl || 'https://kaimin.sakura.ne.jp/archive/#/links';
  CONF.boothUrl = CONF.boothUrl || 'https://bab666.booth.pm';
  /* R-18版の販売ページ。全年齢版の箱庭一覧の「R-18版」欄からここへ飛ぶ。商品ページができたらURLを書き換える */
  CONF.r18Url = CONF.r18Url || 'https://bab666.booth.pm/items/9016418';
  var TAG = '#箱庭シミュレーター';
  var FONT_D = '"Hiragino Mincho ProN","Yu Mincho","YuMincho","Noto Serif JP",serif';
  var FONT_B = '"Hiragino Sans","Hiragino Kaku Gothic ProN","Yu Gothic UI","Yu Gothic","Meiryo","Noto Sans JP",sans-serif';
  var SH = HK.Share = {};

  var ua = navigator.userAgent || '', plat = navigator.platform || '';
  var isMobile = /Android|iPhone|iPad|iPod/i.test(ua) || (/Mac/.test(plat) && navigator.maxTouchPoints > 1);
  var isMac = /Mac/.test(plat) && !isMobile;

  function link() { return CONF.siteUrl || CONF.toolsUrl; }
  function plain(s) { return String(s == null ? '' : s).replace(/<[^>]*>/g, '').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'"); }
  function safe(s) { return String(s).replace(/[\\/:*?"<>|\s]/g, '').slice(0, 16) || '箱庭'; }

  function palette() {
    var cs = getComputedStyle(document.documentElement);
    var g = function (n, fb) { return (cs.getPropertyValue(n) || '').trim() || fb; };
    return { bg: g('--bg', '#edf0f2'), card: g('--surface', '#fbfcfc'), ink: g('--ink', '#1b232b'), muted: g('--muted', '#5b6672'), line: g('--line', '#d3d9df'), accent: g('--accent', '#2b5b7c'), sand: g('--sand', '#e8e0cc'), tray: g('--tray', '#3d6f93'), love: g('--love', '#b83f66'), p: function (i) { return g('--p' + (i % 12), '#2b5b7c'); } };
  }
  /* 日本語は1文字ずつ折り返す（禁則は句読点だけ簡易に） */
  function wrap(ctx, text, maxW) {
    var out = [], line = '';
    String(text).split('').forEach(function (ch) {
      if (ch === '\n') { out.push(line); line = ''; return; }
      if (ctx.measureText(line + ch).width > maxW && line && !/[、。」』）！？…]/.test(ch)) { out.push(line); line = ch; }
      else line += ch;
    });
    if (line) out.push(line);
    return out;
  }
  function para(ctx, text, x, y, maxW, size, color, lh, font, maxLines) {
    ctx.font = font || ('400 ' + size + 'px ' + FONT_B); ctx.fillStyle = color;
    var lines = wrap(ctx, text, maxW);
    if (maxLines && lines.length > maxLines) { lines = lines.slice(0, maxLines); lines[maxLines - 1] = lines[maxLines - 1].slice(0, -1) + '…'; }
    lines.forEach(function (l, i) { ctx.fillText(l, x, y + i * size * (lh || 1.6)); });
    return y + lines.length * size * (lh || 1.6);
  }
  function rr(ctx, x, y, w, h, r) {
    ctx.beginPath(); ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath();
  }
  function render(drawFn) {
    var W = 1080, big = document.createElement('canvas');
    big.width = W; big.height = 4200;
    var ctx = big.getContext('2d'), C = palette();
    ctx.textBaseline = 'top';
    ctx.fillStyle = C.bg; ctx.fillRect(0, 0, W, big.height);
    var h = Math.min(big.height, Math.ceil(drawFn(ctx, C, W)));
    var out = document.createElement('canvas');
    out.width = W; out.height = h;
    out.getContext('2d').drawImage(big, 0, 0);
    big.width = big.height = 0;
    return out;
  }
  function head(ctx, C, W, sub) {
    ctx.fillStyle = C.tray; ctx.fillRect(0, 0, W, 132);
    ctx.fillStyle = C.sand; ctx.fillRect(0, 132, W, 10);
    ctx.fillStyle = '#ffffff'; ctx.font = '700 46px ' + FONT_D; ctx.fillText('箱庭シミュレーター', 60, 34);
    ctx.font = '400 22px ' + FONT_B; ctx.globalAlpha = 0.85; ctx.fillText(sub, 60, 92); ctx.globalAlpha = 1;
    return 180;
  }
  function foot(ctx, C, W, y) {
    ctx.strokeStyle = C.line; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(60, y); ctx.lineTo(W - 60, y); ctx.stroke();
    ctx.font = '600 22px ' + FONT_D; ctx.fillStyle = C.ink; ctx.fillText('箱庭シミュレーター', 60, y + 22);
    var d = new Date();
    ctx.font = '400 18px ' + FONT_B; ctx.fillStyle = C.muted; ctx.textAlign = 'right';
    ctx.fillText('エゴグラム × 箱庭シミュレーション　' + d.getFullYear() + '.' + (d.getMonth() + 1) + '.' + d.getDate(), W - 60, y + 26);
    ctx.textAlign = 'left';
    return y + 80;
  }
  /* 丸いキャラアイコン：画像があれば丸く切り抜き、なければキャラ色のパステル丸にイニシャル */
  function avatar(ctx, C, name, i, x, y, r) {
    var im = HK.Icons && HK.Icons.img(name), col = (HK.Icons && HK.Icons.color && HK.Icons.color(name)) || C.p(i);
    ctx.save();
    ctx.beginPath(); ctx.arc(x, y, r + 3.5, 0, Math.PI * 2); ctx.fillStyle = col; ctx.fill();
    ctx.beginPath(); ctx.arc(x, y, r + 1.5, 0, Math.PI * 2); ctx.fillStyle = C.card; ctx.fill();
    ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.closePath();
    if (im) { ctx.clip(); ctx.drawImage(im, x - r, y - r, r * 2, r * 2); }
    else {
      ctx.fillStyle = C.card; ctx.fill();
      ctx.globalAlpha = 0.2; ctx.fillStyle = col; ctx.fill(); ctx.globalAlpha = 1;
      ctx.fillStyle = col; ctx.font = '800 ' + Math.round(r * 1.0) + 'px ' + FONT_B; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText(HK.Icons ? HK.Icons.initial(name) : String(name).charAt(0), x, y + r * 0.04);
    }
    ctx.restore();
  }
  function egoChart(ctx, C, eg, x, y, w, h, color) {
    var n = HK.FACTORS.length, cw = w / (n - 1);
    ctx.strokeStyle = C.line; ctx.lineWidth = 1;
    [0, 5, 10, 15, 20].forEach(function (v) { var yy = y + h - v / 20 * h; ctx.beginPath(); ctx.moveTo(x, yy); ctx.lineTo(x + w, yy); ctx.stroke(); });
    ctx.strokeStyle = color; ctx.lineWidth = 4; ctx.beginPath();
    HK.FACTORS.forEach(function (k, i) { var px = x + cw * i, py = y + h - eg[k] / 20 * h; if (i) ctx.lineTo(px, py); else ctx.moveTo(px, py); });
    ctx.stroke();
    ctx.fillStyle = color; ctx.font = '600 20px ' + FONT_B; ctx.textAlign = 'center';
    HK.FACTORS.forEach(function (k, i) {
      var px = x + cw * i, py = y + h - eg[k] / 20 * h;
      ctx.beginPath(); ctx.arc(px, py, 7, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = C.muted; ctx.fillText(k, px, y + h + 14); ctx.fillStyle = color;
    });
    ctx.textAlign = 'left';
  }

  /* ---------- 結果を画像向けの文字にまとめる ---------- */
  SH.digest = function (res) {
    var scen = HK.SCENARIOS[res.scenId] || { name: res.scenId };
    var names = (res.chars || []).map(function (c) { return c.name; });
    var d = { scen: scen.name, names: names, codes: (res.input && res.input.chars || []).map(function (c) { return HK.toCode(c.eg); }), headline: '', stats: [], lines: [], pairs: [] };
    if (res.solo) {
      var E = res.ending || {};
      d.headline = (E.kind === 'over' ? 'GAME OVER　' : '') + plain(E.title || res.outcome || '');
      d.lines = (E.lines || []).map(plain);
      d.stats = (res.estats || []).map(function (s) { return [plain(s[0]), plain(s[1])]; });
      if (res.heroes && res.heroes.length > 1) d.pairs = res.heroes.map(function (h, k) { return { who: [k], text: h.name + '：' + (h.fate || '生還') }; });
    } else {
      var B = HK.Endings ? HK.Endings.build(res) : { headline: res.outcome || '', stats: [], lines: [] };
      d.headline = plain(B.headline);
      d.stats = (B.stats || []).map(function (s) { return [plain(s[0]), plain(s[1])]; });
      d.lines = (B.lines || []).map(plain).filter(function (l) { return l.indexOf('主な関係：') !== 0; });
      if (B.last && B.last.length) d.lines = d.lines.concat(B.last.slice(0, 2).map(function (x) { return plain('最期の言葉　' + x.text); }));
      d.pairs = (res.pairs || []).filter(function (p) { return p.label !== 'strangers'; }).slice(0, 8).map(function (p) { return { who: [p.a, p.b], text: names[p.a] + ' × ' + names[p.b] + '　' + plain(p.name) }; });
    }
    return d;
  };

  SH.drawResult = function (res) {
    var d = SH.digest(res);
    return render(function (ctx, C, W) {
      var y = head(ctx, C, W, d.scen + '　住人 ' + d.names.length + '人');
      var X = 60, IW = W - 120;
      // 住人
      ctx.font = '600 24px ' + FONT_B;
      var cx = X, cy = y;
      d.names.forEach(function (n, i) {
        var label = n + (d.codes[i] ? ' ' + d.codes[i] : '');
        var w = ctx.measureText(label).width + 76;
        if (cx + w > X + IW) { cx = X; cy += 62; }
        ctx.fillStyle = C.card; rr(ctx, cx, cy, w, 52, 26); ctx.fill();
        avatar(ctx, C, n, i, cx + 26, cy + 26, 19);
        ctx.font = '600 24px ' + FONT_B; ctx.fillStyle = C.ink; ctx.fillText(label, cx + 56, cy + 14);
        cx += w + 10;
      });
      y = cy + 86;
      // 結末：透明なキャンバスに本文を描いて高さを測り、カードを敷いてから重ねる
      var IWc = IW, blk = document.createElement('canvas'); blk.width = W; blk.height = 2000;
      var bx = blk.getContext('2d'); bx.textBaseline = 'top';
      var by = 0;
      bx.fillStyle = C.accent; bx.font = '600 20px ' + FONT_B; bx.fillText('結末', X, by); by += 36;
      by = para(bx, d.headline || '—', X, by, IWc, 38, C.ink, 1.45, '700 38px ' + FONT_D, 4) + 10;
      if (d.stats.length) {
        bx.font = '400 22px ' + FONT_B;
        var sx = X;
        d.stats.slice(0, 6).forEach(function (s) {
          var t = s[0] + '　' + s[1], w = bx.measureText(t).width + 30;
          if (sx + w > X + IWc) { sx = X; by += 46; }
          bx.fillStyle = C.bg; rr(bx, sx, by, w, 38, 8); bx.fill();
          bx.fillStyle = C.ink; bx.font = '400 22px ' + FONT_B; bx.fillText(t, sx + 15, by + 8);
          sx += w + 10;
        });
        by += 60;
      }
      d.lines.slice(0, 7).forEach(function (l) { by = para(bx, '・' + l, X, by, IWc, 24, C.ink, 1.6, null, 3) + 6; });
      ctx.fillStyle = C.card; rr(ctx, X - 24, y - 24, IW + 48, by + 44, 16); ctx.fill();
      ctx.drawImage(blk, 0, 0, W, by, 0, y, W, by);
      blk.width = blk.height = 0;
      y += by + 70;
      // 関係
      if (d.pairs.length) {
        ctx.fillStyle = C.accent; ctx.font = '600 20px ' + FONT_B; ctx.fillText(res.solo ? '挑戦者' : '主な関係', X, y); y += 38;
        d.pairs.forEach(function (p) {
          p.who.forEach(function (k, j) { avatar(ctx, C, d.names[k], k, X + 22 + j * 30, y + 19, 19); });
          var tx = X + 22 + (p.who.length - 1) * 30 + 34;
          para(ctx, p.text, tx, y + 4, IW - (tx - X), 26, C.ink, 1.5, '500 26px ' + FONT_B, 1);
          y += 52;
        });
        y += 24;
      }
      return foot(ctx, C, W, y);
    });
  };
  SH.drawPersonal = function (name, eg) {
    return render(function (ctx, C, W) {
      var y = head(ctx, C, W, 'エゴグラム簡易診断（25問）');
      var X = 60, code = HK.toCode(eg), ty = HK.egoType(eg);
      var hasIc = HK.Icons && HK.Icons.img(name);
      if (hasIc) { avatar(ctx, C, name, 0, W - 150, y + 90, 72); }
      ctx.fillStyle = C.muted; ctx.font = '400 24px ' + FONT_B; ctx.fillText(name + 'のエゴグラム', X, y); y += 44;
      ctx.fillStyle = C.ink; ctx.font = '700 96px ' + FONT_D; ctx.fillText(code, X, y); y += 118;
      ctx.font = '500 28px ' + FONT_B; ctx.fillText(ty.label, X, y); y += 64;
      ctx.fillStyle = C.card; rr(ctx, X - 20, y, W - 80, 360, 16); ctx.fill();
      egoChart(ctx, C, eg, X + 60, y + 40, W - 240, 240, C.accent);
      y += 400;
      ctx.font = '400 22px ' + FONT_B; ctx.fillStyle = C.muted;
      ctx.fillText(HK.FACTORS.map(function (k) { return k + ' ' + eg[k]; }).join('　') + '（20点満点）', X, y); y += 60;
      return foot(ctx, C, W, y);
    });
  };

  /* ---------- 保存 ---------- */
  function toBlob(canvas) { return new Promise(function (ok, ng) { canvas.toBlob(function (b) { b ? ok(b) : ng(new Error('png')); }, 'image/png'); }); }
  function download(name, blob) {
    var url = URL.createObjectURL(blob), a = document.createElement('a');
    a.href = url; a.download = name; a.rel = 'noopener';
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(function () { URL.revokeObjectURL(url); }, 4000);
  }
  function showModal(canvas) {
    var m = document.getElementById('imgmodal');
    if (!m) {
      m = document.createElement('div'); m.id = 'imgmodal'; m.className = 'modal'; m.hidden = true;
      m.innerHTML = '<div class="modal-box" role="dialog" aria-modal="true" aria-label="結果画像"><p class="hint">長押し（PCは右クリック）で画像を保存できます。</p><img id="imgmodal-img" alt="結果の画像" style="width:100%;height:auto;border-radius:6px"><div class="row" style="margin-top:10px"><span class="spacer"></span><button class="btn" id="imgmodal-close">閉じる</button></div></div>';
      document.body.appendChild(m);
      m.addEventListener('click', function (e) { if (e.target === m || e.target.id === 'imgmodal-close') m.hidden = true; });
    }
    document.getElementById('imgmodal-img').src = canvas.toDataURL('image/png');
    m.hidden = false;
  }
  function save(canvas, name, msg) {
    say(msg, '画像を作成しています…');
    toBlob(canvas).then(function (blob) {
      // iOSのSafariはdownload属性で保存できないことがあるので、画像を表示して長押し保存に切り替える
      if (isMobile && /iPhone|iPad|iPod/.test(ua) || !('download' in document.createElement('a'))) { showModal(canvas); say(msg, '画像を表示しました。長押しで保存できます'); return; }
      download(name, blob); say(msg, '画像を保存しました');
    }).catch(function () { say(msg, '画像を作れませんでした。もう一度お試しください'); });
  }
  function say(el, t) { if (el) { el.textContent = t; } else if (HK.toast) HK.toast(t); }

  /* ---------- Xに投稿 ---------- */
  function intent(text, url) { return 'https://x.com/intent/post?text=' + encodeURIComponent(text) + '&url=' + encodeURIComponent(url); }
  function openX(url, msg) {
    var w = null;
    try { w = window.open(url, '_blank', 'noopener'); } catch (e) { w = null; }
    if (!w && msg) msg.innerHTML = 'ポップアップが止められました。<a href="' + url.replace(/"/g, '&quot;') + '" target="_blank" rel="noopener">ここを押してXを開く</a>';
    return !!w;
  }
  function post(canvas, text, name, msg) {
    var url = link(), it = intent(text, url), blobP = toBlob(canvas);
    if (isMobile && navigator.share && navigator.canShare) {
      blobP.then(function (blob) {
        var file = new File([blob], name, { type: 'image/png' });
        if (!navigator.canShare({ files: [file] })) throw new Error('noshare');
        return navigator.share({ files: [file], text: text + '\n' + url }).then(function () { say(msg, '共有画面を開きました。Xを選んでください'); });
      }).catch(function (e) {
        if (e && e.name === 'AbortError') return;
        showModal(canvas);
        if (openX(it, msg)) say(msg, 'Xの投稿画面を開きました。表示した画像を保存して添付してください');
      });
      return;
    }
    // PC：投稿画面を開き、画像はクリップボードへ（Safari向けに Promise のまま渡す）
    var opened = openX(it, msg), key = isMac ? '⌘+V' : 'Ctrl+V';
    var fail = function () {
      blobP.then(function (blob) { download(name, blob); if (opened) say(msg, 'Xの投稿画面を開きました。保存した画像を投稿欄にドラッグするか、画像ボタンから添付してください'); });
    };
    try {
      navigator.clipboard.write([new ClipboardItem({ 'image/png': blobP })]).then(function () {
        if (opened) say(msg, 'Xの投稿画面を開きました。画像をコピー済みなので、投稿欄で貼り付けてください（' + key + '）');
      }, fail);
    } catch (e) { fail(); }
  }
  function resultText(res) {
    var d = SH.digest(res), who = d.names.length > 3 ? d.names.slice(0, 3).join('・') + 'ほか' : d.names.join('・');
    var h = d.headline.length > 60 ? d.headline.slice(0, 59) + '…' : d.headline;
    return '箱庭「' + d.scen + '」に' + who + 'を放った結果――' + (h ? '「' + h + '」' : '') + ' ' + TAG;
  }

  SH.saveResult = function (res, msg) { save(SH.drawResult(res), '箱庭シミュレーター_' + safe((HK.SCENARIOS[res.scenId] || {}).name || '') + '_' + res.seed + '.png', msg); };
  SH.postResult = function (res, msg) { post(SH.drawResult(res), resultText(res), '箱庭シミュレーター_' + res.seed + '.png', msg); };
  SH.savePersonal = function (name, eg, msg) { save(SH.drawPersonal(name, eg), 'エゴグラム_' + safe(name) + '_' + HK.toCode(eg) + '.png', msg); };
  SH.postPersonal = function (name, eg, msg) { post(SH.drawPersonal(name, eg), name + 'のエゴグラムは「' + HK.toCode(eg) + '」' + HK.egoType(eg).label + 'でした ' + TAG, 'エゴグラム_' + HK.toCode(eg) + '.png', msg); };

  /* 結果画面の上に差し込む共有バー */
  SH.bar = function () {
    return '<div class="sharebar" id="sharebar"><button class="btn" data-act="sharepng">結果を画像で保存</button><button class="btn" data-act="sharex">𝕏 に投稿</button><span class="hint" id="sharemsg" role="status" style="margin:0"></span></div>';
  };
})();
