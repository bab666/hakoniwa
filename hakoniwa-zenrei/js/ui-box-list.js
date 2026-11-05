/* 箱庭シミュレーター: 箱庭タブの上の一覧（PC）と、箱庭タブ・結果タブの目次（2026-11-02 担当UI。全年齢版・R18版共通。表示だけで、結果・保存には触らない）
   利用者の声（2026-11-01 の整え直しのあと「PC で動かしにくくなった」）への手当て：
   ・箱庭の一覧を箱庭タブの上に戻す（幅 900px 以上）。詰めたカード（分類・人数・名前・R18 の札）を 1440px で 6 列。押したらその場で選ぶ（ui.js の pickGo と同じ。窓は開かない）。
     選んでいるカードは強調の色（--ui-hot*）の枠と地。R18版にしかない箱庭は前の版の薄いピンク（--r18only-*）。絞りの札（すべて／日常／極限／ひとり用／R-18 のみ。分類は ui-filter.js の HK.ScenCat）と
     「いまの住人で遊べるものだけ」。たたむ／ひらく・絞り・遊べるものだけはブラウザに残す（鍵 hakoniwa:boxlist）。説明はカードの title と、下の選んだ箱庭のカードで読める。
     「箱庭を変える」は PC ではこの一覧へ移る（たたんでいたら開く）。スマホ幅（900px 未満）は今までどおり窓（#bxpick）。
     HTML は ui.js の renderBox が節 'list'（ui-box-draw.js の now の節）として描く。読み込み前の箱庭（仮の箱庭）も窓と同じ情報源（ui.js の cardInfo）で出す。
   ・目次（HK.Toc）：箱庭タブの設定（参加者と初動／場の設定／起こりやすさ／展開と内容）と、結果タブ（結末／関係図／二人ずつ／住人ごと／経過）は節を全部縦に並べ、
     切替の帯は画面の上（上の段の切替 .tabs の下）に貼り付く目次にした。押すとその節へスクロールし、いま見ている節を aria-current で強調する。 */
(function () {
  'use strict';
  var HK = window.HK;
  if (!HK || typeof document === 'undefined') return;
  var esc = HK.escape || function (s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return '&#' + c.charCodeAt(0) + ';'; }); };
  var KEY = HK.STORE && HK.STORE.key ? HK.STORE.key('hakoniwa:boxlist') : 'hakoniwa:boxlist';
  var pref = { fold: false, cat: 'all', fit: false };
  try { var sv = JSON.parse(localStorage.getItem(KEY) || 'null'); if (sv && typeof sv === 'object') { pref.fold = sv.fold === true; pref.fit = sv.fit === true; if (typeof sv.cat === 'string') pref.cat = sv.cat; } } catch (e) { /* 読めなければ既定 */ }
  function prefSave() { try { localStorage.setItem(KEY, JSON.stringify(pref)); } catch (e) { /* 残せなくても使える */ } }
  function mq(q) { return !!(window.matchMedia && window.matchMedia(q).matches); }
  function wide() { return mq('(min-width:900px)'); }
  function reduce() { return mq('(prefers-reduced-motion:reduce)'); }

  var css =
    /* ---------- 箱庭の一覧（PC） ---------- */
    '#view-box .bxlist{padding:14px 18px 16px;background:var(--ui-card,var(--paper));border:1px solid var(--ui-line,var(--line));border-radius:var(--ui-radius-l,14px);box-shadow:var(--ui-shadow,none)}' +
    '#view-box .bxlh{display:flex;flex-wrap:wrap;align-items:center;gap:8px 12px}' +
    '#view-box .bxlh h2{margin:0;font-size:16px;font-weight:700;letter-spacing:.04em;color:var(--ui-ink,var(--ink))}' +
    '#view-box .bxlh .bxlnum{font-size:12px;color:var(--ui-muted,var(--muted))}' +
    '#view-box .bxlf{display:flex;flex-wrap:wrap;gap:6px}' +
    '#view-box .bxlf button{height:32px;padding:0 12px;border:1px solid var(--ui-line2,var(--line2));border-radius:16px;background:var(--ui-card,var(--paper));color:var(--ui-ink,var(--ink));font:inherit;font-size:12.5px;cursor:pointer;white-space:nowrap}' +
    '#view-box .bxlf button:hover{border-color:var(--ui-ink,var(--ink))}' +
    '#view-box .bxlf button[aria-pressed="true"]{border-color:var(--ui-primary,var(--ink));background:var(--ui-primary,var(--ink));color:var(--ui-primary-ink,var(--paper));font-weight:700}' +
    '#view-box .bxlf .fn{margin-left:4px;font-size:11px;opacity:.85;font-family:var(--f-num,inherit)}' +
    '#view-box .bxlfit{display:inline-flex;align-items:center;gap:6px;font-size:12.5px;color:var(--ui-ink,var(--ink));cursor:pointer;white-space:nowrap}' +
    '#view-box .bxlfit input{width:16px;height:16px;margin:0;accent-color:var(--ui-primary,var(--ink))}' +
    '#view-box .bxlfold{height:32px!important;font-size:12.5px!important}' +
    '#view-box .bxlfold::after{content:"";width:6px;height:6px;margin:-3px 0 0 2px;border-right:1.5px solid currentColor;border-bottom:1.5px solid currentColor;transform:rotate(-135deg)}' +
    '#view-box .bxlfold[aria-expanded="false"]::after{margin-top:-6px;transform:rotate(45deg)}' +
    '#view-box .bxlcur{font-size:13px;color:var(--ui-muted,var(--muted))}#view-box .bxlcur b{color:var(--ui-ink,var(--ink))}' +
    '#view-box .bxlist[data-fold="0"] .bxlcur{display:none}#view-box .bxlist[data-fold="1"] :is(.bxlf,.bxlfit){display:none}' +
    '#view-box .bxlg{display:grid;grid-template-columns:repeat(auto-fill,minmax(168px,1fr));gap:8px;margin:12px 0 0;padding:0;list-style:none}' +
    '#view-box .bxlg[hidden],#view-box .bxlg>li[hidden]{display:none}' +
    '#view-box .bxlg>li{display:flex;min-width:0}' +
    '#view-box .bxlc{position:relative;display:flex;flex-direction:column;align-items:flex-start;gap:1px;width:100%;min-height:58px;margin:0;padding:8px 12px 9px;box-sizing:border-box;border:1px solid var(--ui-line2,var(--line2));border-radius:10px;background:var(--ui-card,var(--paper));color:var(--ui-ink,var(--ink));font:inherit;text-align:left;cursor:pointer}' +
    '#view-box .bxlc:hover{border-color:var(--ui-ink,var(--ink))}' +
    '#view-box .bxlc:focus-visible{outline:2px solid var(--ui-accent2,var(--ink));outline-offset:2px}' +
    '#view-box .bxlc.r18only{background:var(--r18only-bg);border-color:var(--r18only-line)}' +
    '#view-box .bxlc.lack{opacity:.62}' +
    '#view-box .bxlc.on{opacity:1;border-color:var(--ui-hot-line);box-shadow:inset 0 0 0 1px var(--ui-hot-line);background:var(--ui-hot-soft)}' +
    '#view-box .bxlc.r18 .bxlk{padding-right:38px;box-sizing:border-box}#view-box .bxlc .bxlt{position:absolute;top:9px;right:8px;font-size:9.5px;padding:0 4px;margin:0}' +
    '#view-box .bxlk{max-width:100%;font-size:11px;line-height:1.5;color:var(--ui-muted,var(--muted));white-space:nowrap;overflow:hidden;text-overflow:ellipsis}' +
    '#view-box .bxln{display:flex;flex-wrap:wrap;align-items:center;gap:2px 6px;font-size:14px;font-weight:700;line-height:1.35;letter-spacing:0}' +
        '#view-box .bxlw{font-size:11px;line-height:1.4;color:var(--ui-danger,#b03a2e)}' +
    '#view-box .bxlon{position:absolute;top:-8px;left:10px;padding:0 6px;border-radius:4px;background:var(--ui-hot);color:var(--ui-hot-ink);font-size:10px;font-weight:700;line-height:16px;letter-spacing:.04em}' +
    '#view-box .bxlc .scload{position:static;font-size:10.5px;padding:0 6px;border:1px solid var(--ui-line2,var(--line2));border-radius:999px;color:var(--ui-muted,var(--muted))}' +
    '#view-box .bxlc .scload.ng{color:var(--ui-danger,#b03a2e);border-style:dashed}' +
    /* 全年齢版だけ、一覧の最後に R-18版の案内（窓の .bxr18c と同じ中身。開くと行いっぱいに広げる） */
    '#view-box .bxlr18c{width:100%;box-sizing:border-box;border:1px dashed var(--ui-line2,var(--line2));border-radius:10px;background:var(--ui-card,var(--paper))}' +
    '#view-box .bxlr18c:hover,#view-box .bxlr18c:focus-within{border-color:var(--ui-ink,var(--ink))}' +
    '#view-box .bxlr18c .bxr18c-t{min-height:58px;padding:8px 36px 9px 12px;gap:1px}' +
    '#view-box .bxlg>li.bxlr18:has(.bxr18c-t[aria-expanded="true"]){grid-column:1/-1}' +
    /* 一覧は PC だけ。スマホ幅では窓（#bxpick） */
    '@media (max-width:899px){#view-box .bxlist{display:none}}' +
    '@media print{#view-box .bxlist{display:none}}';
  var st = document.createElement('style'); st.id = 'ui-box-list'; st.textContent = css; document.head.appendChild(st);

  /* ---------- 一覧の HTML（ui.js の renderBox から。order：並び、sel：選んでいる箱庭、badge：選んでいる箱庭の読み込み中の印） ---------- */
  var memo = {}, memoKey = '';
  function meta(id) { return (HK.SCENARIOS && HK.SCENARIOS[id]) || (HK.Load && HK.Load.meta && HK.Load.meta(id)) || {}; }
  function catOf(id, r18only) {
    var ex = ((HK.ScenCat && HK.ScenCat.extreme) || []).indexOf(id) >= 0, so = !ex && !!meta(id).solo;
    return { all: true, extreme: ex, solo: so, daily: !ex && !so, r18: !!r18only };
  }
  function cardOf(id) {
    var ci = HK.UI.cardInfo(id), s = ci.s || {};
    return { cat: catOf(id, ci.r18only), r18only: ci.r18only, adult: ci.adult, html: '<span class="bxlk">' + esc(ci.kt ? ci.kt + '・' + ci.cnt : ci.cnt) + '</span><span class="bxln">' + esc(s.name) + '</span>' + (ci.adult ? '<span class="r18tag bxlt">R18</span>' : ''), title: ci.full };
  }
  /* 全年齢版だけ：一覧の最後の「R-18版のご案内」（URL は中核の js/safe.js の HK.CONF。押すと一文と BOOTH・note のリンクが開く＝ui.js の r18card。絞りの札が「すべて」のときだけ出す） */
  function r18Item(cat) {
    var C = HK.CONF;
    if (!HK.SAFE_BUILD || !C || !C.r18Url) return '';
    return '<li class="bxlr18"' + (cat === 'all' ? '' : ' hidden') + '><div class="bxr18c bxlr18c"><button type="button" class="bxr18c-t" data-act="r18card" aria-expanded="false" aria-controls="bxlr18c-b" title="成人向けの箱庭を5つ追加。夜の場面もぼかさずに描きます。">' +
      '<span class="bxlk">18歳以上向け</span><span class="bxln">R-18版のご案内</span><span class="bxr18c-i" aria-hidden="true"></span></button>' +
      '<div class="bxr18c-b" id="bxlr18c-b" hidden><p class="bxr18c-d">R-18版（BOOTH・noteで頒布中・18歳以上向け）では成人向けの箱庭を5つ追加。夜の場面もぼかさずに描きます。</p><p class="bxr18c-a">' +
      '<a href="' + esc(C.r18Url) + '" target="_blank" rel="noopener">BOOTHで買う ↗</a>' + (C.noteUrl ? '<a href="' + esc(C.noteUrl) + '" target="_blank" rel="noopener">noteで買う ↗</a>' : '') + '</p></div></div></li>';
  }
  var CATS = [['all', 'すべて'], ['daily', '日常'], ['extreme', '極限'], ['solo', 'ひとり用'], ['r18', 'R-18 のみ']];
  var BL = HK.BoxList = {};
  BL.html = function (order, sel, badge) {
    if (!HK.UI || !HK.UI.cardInfo) return '';
    var S = HK.UI.state ? HK.UI.state() : { chars: [] }, n = (S.chars || []).length, smin = HK.UI.smin || function () { return 1; };
    var key = (HK.Load ? HK.Load.gen : 0) + '|' + !!HK.SAFE_ON + '|' + order.join(',');
    if (key !== memoKey) { memo = {}; memoKey = key; }
    var cnt = {}, cards = order.map(function (id) { var c = memo[id] || (memo[id] = cardOf(id)); CATS.forEach(function (x) { if (c.cat[x[0]]) cnt[x[0]] = (cnt[x[0]] || 0) + 1; }); return [id, c]; });
    var cat = cnt[pref.cat] ? pref.cat : 'all', open = !pref.fold, curName = esc(meta(sel).name || '');
    var items = cards.map(function (x) {
      var id = x[0], c = x[1], on = id === sel, lack = n ? Math.max(0, smin(id) - n) : 0, hide = !on && (!c.cat[cat] || (pref.fit && lack > 0));
      return '<li' + (hide ? ' hidden' : '') + ' data-id="' + esc(id) + '"><button type="button" class="bxlc' + (c.r18only ? ' r18only' : '') + (c.adult ? ' r18' : '') + (on ? ' on' : '') + (lack ? ' lack' : '') + '" data-act="bxlpick" data-id="' + esc(id) + '" aria-pressed="' + on + '" title="' + esc(c.title) + '">' + c.html +
        (lack ? '<span class="bxlw">住人が' + lack + '人足りません</span>' : '') + (on ? '<span class="bxlon">選択中</span>' + (badge || '') : '') + '</button></li>';
    }).join('') + (HK.PacksUI && HK.PacksUI.listItem ? HK.PacksUI.listItem() : '') + r18Item(cat);   /* 追加パック：まだ開けていないセットがあれば「箱庭を追加」（js/packs-ui.js）。全年齢版は最後に R-18版の案内 */
    return '<section class="bxlist" id="bxlist" aria-labelledby="bxlist-h" data-fold="' + (open ? 0 : 1) + '"><div class="bxlh"><h2 id="bxlist-h">箱庭を選ぶ</h2><span class="bxlnum">' + order.length + '種類</span>' +
      '<span class="bxlcur">いま：<b>' + curName + '</b></span>' +
      '<div class="bxlf" role="group" aria-label="箱庭の絞り込み">' + CATS.filter(function (x) { return x[0] === 'all' || cnt[x[0]]; }).map(function (x) {
        return '<button type="button" data-act="bxlcat" data-c="' + x[0] + '" aria-pressed="' + (cat === x[0]) + '">' + x[1] + (x[0] === 'all' ? '<span class="fn">' + order.length + '</span>' : '') + '</button>';
      }).join('') + '</div>' +
      (n ? '<label class="bxlfit"><input type="checkbox" data-bxl="fit"' + (pref.fit ? ' checked' : '') + '>いまの住人 ' + n + '人で遊べるものだけ</label>' : '') +
      '<span class="bxsp"></span><button type="button" class="bxbtn bxlfold" data-act="bxlfold" aria-expanded="' + open + '" aria-controls="bxlist-g">' + (open ? 'たたむ' : 'ひらく') + '</button></div>' +
      '<ul class="bxlg" id="bxlist-g" aria-label="箱庭のカード"' + (open ? '' : ' hidden') + '>' + items + '</ul></section>';
  };
  /* 絞り・遊べるものだけ・たたむは、描き直さずにその場で書き換える（次に描くときも同じ HTML になる） */
  function apply() {
    var box = document.getElementById('bxlist');
    if (!box) return;
    var S = HK.UI.state(), n = (S.chars || []).length, smin = HK.UI.smin;
    var bs = box.querySelectorAll('[data-act="bxlcat"]'), has = Array.prototype.some.call(bs, function (b) { return b.dataset.c === pref.cat; }), cat = has ? pref.cat : 'all';
    Array.prototype.forEach.call(bs, function (b) { b.setAttribute('aria-pressed', String(b.dataset.c === cat)); });
    Array.prototype.forEach.call(box.querySelectorAll('.bxlg>li'), function (li) {
      if (li.classList.contains('bxlr18')) { li.hidden = cat !== 'all'; return; }
      var id = li.getAttribute('data-id'), c = memo[id], on = id === S.scenId, lack = n ? Math.max(0, smin(id) - n) : 0;
      li.hidden = !on && !!c && (!c.cat[cat] || (pref.fit && lack > 0));
    });
    var g = document.getElementById('bxlist-g'), fb = box.querySelector('.bxlfold');
    box.setAttribute('data-fold', pref.fold ? 1 : 0);
    if (g) g.hidden = pref.fold;
    if (fb) { fb.setAttribute('aria-expanded', String(!pref.fold)); fb.textContent = pref.fold ? 'ひらく' : 'たたむ'; }
  }
  /* 「箱庭を変える」（PC）：一覧へ移る（たたんでいたら開く）。選んでいるカードにフォーカス */
  function toList() {
    var box = document.getElementById('bxlist');
    if (!box) return false;
    if (pref.fold) { pref.fold = false; prefSave(); apply(); }
    go(box, null);
    var f = box.querySelector('.bxlc.on') || box.querySelector('.bxlc');
    if (f) { try { f.focus({ preventScroll: true }); } catch (e) { f.focus(); } }
    return true;
  }
  document.addEventListener('click', function (ev) {
    var t = ev.target && ev.target.closest && ev.target.closest('[data-act]');
    if (!t || !t.closest('#view-box')) return;
    if (t.dataset.act === 'pickopen' && wide() && document.getElementById('bxlist') && toList()) { ev.preventDefault(); ev.stopImmediatePropagation(); }
  }, true);
  document.addEventListener('click', function (ev) {
    var t = ev.target && ev.target.closest && ev.target.closest('[data-act]');
    if (!t) return;
    var a = t.dataset.act;
    if (a === 'bxlpick' && HK.UI && HK.UI.pickGo) {
      var id = t.dataset.id;
      HK.UI.pickGo(id);
      var b = document.querySelector('#bxlist .bxlc[data-id="' + id + '"]');
      if (b) { try { b.focus({ preventScroll: true }); } catch (e) { b.focus(); } }
    } else if (a === 'bxlcat') { pref.cat = t.dataset.c || 'all'; prefSave(); apply(); }
    else if (a === 'bxlfold') { pref.fold = !pref.fold; prefSave(); apply(); }
    else if (a === 'bxtab') { var sec = document.getElementById('bxp-' + t.dataset.k); if (sec) go(sec, t.closest('.bxtabs'), 'box', t.dataset.k); }
  });
  document.addEventListener('change', function (ev) {
    var t = ev.target;
    if (t && t.getAttribute && t.getAttribute('data-bxl') === 'fit') { pref.fit = !!t.checked; prefSave(); apply(); }
  });

  /* ---------- 目次（HK.Toc） ---------- */
  var pin = null, raf = 0, lastStick = -1;
  /* 上の段の切替（.tabs）が画面の上に貼り付いているときの下端（貼り付く位置 top＋高さ）。目次はその下に貼り付く（CSS の --hk-stick）。
     top は iPhone の画面上の切り欠き・状態表示の分（env(safe-area-inset-top)）だけ下がるので、高さだけだと目次が .tabs に重なって文が隠れた（2026-11-03） */
  function stickH() {
    var tb = document.querySelector('.tabs');
    if (!tb) return 0;
    var cs = getComputedStyle(tb), p = cs.position;
    return p === 'sticky' || p === 'fixed' ? Math.round((parseFloat(cs.top) || 0) + tb.getBoundingClientRect().height) : 0;
  }
  function setStick() { var h = stickH(); if (h !== lastStick) { lastStick = h; document.documentElement.style.setProperty('--hk-stick', h + 'px'); } return h; }
  /* el の頭が目次の下に来るようにスクロールする（kind・k：押した目次。スクロールが終わるまで、その節を強調する） */
  function go(el, toc, kind, k) {
    var off = setStick() + (toc ? toc.getBoundingClientRect().height : 0) + 10, y = Math.max(0, el.getBoundingClientRect().top + window.pageYOffset - off);
    pin = kind ? { kind: kind, k: k, until: Date.now() + 1200 } : null;
    try { window.scrollTo({ top: y, behavior: reduce() ? 'auto' : 'smooth' }); } catch (e) { window.scrollTo(0, y); }
    sync();
  }
  function spyIn(toc, sel, find, kind) {
    if (!toc) return;
    var bs = Array.prototype.slice.call(toc.querySelectorAll(sel));
    if (!bs.length) return;
    var off = lastStick + toc.getBoundingClientRect().height + 48, cur = bs[0].getAttribute('data-k'), vh = window.innerHeight || 0;
    var end = window.pageYOffset + vh >= (document.documentElement.scrollHeight || 0) - 4;
    bs.forEach(function (b) {
      var s = find(b.getAttribute('data-k'));
      if (!s || !s.getClientRects().length) return;
      var top = s.getBoundingClientRect().top;
      if (top <= off || (end && top < vh - 80)) cur = b.getAttribute('data-k');
    });
    if (pin && pin.kind === kind && Date.now() < pin.until) cur = pin.k;
    bs.forEach(function (b) {
      var on = b.getAttribute('data-k') === cur;
      if (on !== (b.getAttribute('aria-current') === 'true')) {
        if (on) b.setAttribute('aria-current', 'true'); else b.removeAttribute('aria-current');
        /* 横に流れる目次（スマホ）：強調した札が見えるように */
        if (on && toc.scrollWidth > toc.clientWidth + 2) { var r = b.getBoundingClientRect(), tr = toc.getBoundingClientRect(); if (r.left < tr.left || r.right > tr.right) toc.scrollLeft += r.left - tr.left - 16; }
      }
    });
  }
  function sync() {
    raf = 0;
    setStick();
    var vb = document.getElementById('view-box'), vr = document.getElementById('view-result');
    if (vb && !vb.hidden) spyIn(vb.querySelector('.bxtl'), '[data-act="bxtab"]', function (k) { return document.getElementById('bxp-' + k); }, 'box');
    if (vr && !vr.hidden) spyIn(vr.querySelector('.rvw .rvtabs'), '.rvtab', function (k) { return vr.querySelector('#rvp-' + k); }, 'rv');
  }
  function later() { if (!raf) raf = (window.requestAnimationFrame || setTimeout)(sync); }
  window.addEventListener('scroll', later, { passive: true });
  window.addEventListener('resize', function () { lastStick = -1; later(); });
  /* 自分でスクロールし始めたら、押した目次の強調を外す */
  ['wheel', 'touchstart'].forEach(function (k) { window.addEventListener(k, function () { pin = null; }, { passive: true }); });
  HK.Toc = { go: go, sync: later, stick: setStick };
})();
