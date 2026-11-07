/* 箱庭シミュレーター: 追加パックの画面（HK.PacksUI）。両方のビルドに同じファイルを置く
   ・箱庭の一覧（窓の一覧と、PC の上の一覧 ui-box-list.js）の最後に「箱庭を追加」のカードを出す（まだ開けていない追加パックがあるときだけ。データ配布版でフォルダを置いていなければ出ない）
   ・押すとコードの入力を出す。入れたコードで開くパックを全部開け（まとめ用のコードなら一度に全部）、一覧に箱庭を足す
   ・開けていない部屋の名前は出さない（入力の画面にセットの名前と紹介だけ）
   ・案内の文のコードの呼び名は版ごと（全年齢版は「全年齢版のコード」、R18版は「R18版のコード」。2026-11-07）
   ・「追加パックはこちら」（2026-11-07）：販売ページ（js/safe.js の HK.CONF.packBoothUrl・packNoteUrl）への BOOTH・note のボタン。
     箱庭の一覧の最後（PC の上の一覧 ui-box-list.js＝全年齢版の「R-18版のご案内」と同じ作り・スマホの窓 ui.js）と、コードの入力の窓に出す。両方の版。
     開けているパックがある端末では「追加パックの管理」（開けているセットの名前と、ほかのセットの案内）
   ・ui.js の renderBox がカードの HTML（HK.PacksUI.card()）を一覧に足す。パックが開いたら HK.UI.refresh で描き直す
   設計：docs/reports/2026-11-02/pack-foundation.md */
(function () {
  'use strict';
  var HK = window.HK;
  if (!HK || typeof document === 'undefined') return;
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function toast(m) { if (HK.UI && HK.UI.toast) HK.UI.toast(m); }
  function locked() { return HK.Packs ? HK.Packs.list().filter(function (x) { return x.st !== 'open'; }) : []; }
  var UI = HK.PacksUI = {};
  /* この版のコードの呼び名（全年齢版は「全年齢版のコード」、R18版は「R18版のコード」。2026-11-07 版ごとのコード） */
  function cname() { return HK.Packs && HK.Packs.codeName ? HK.Packs.codeName() : 'コード'; }
  /* 覚えたコードで開かなくなったセットの案内（コードが変わった recode／全年齢版は別のコード recode-zen／コードを覚えていない古い保存 recode-old。2026-11-07）。無ければ '' */
  function isRe(e) { return HK.Packs && HK.Packs.isRecode ? HK.Packs.isRecode(e) : e === 'recode'; }
  function recode() { var x = locked().filter(function (q) { return isRe(q.err); })[0]; return x ? x.err : ''; }
  /* 「覚えているコードで開き直す」を出すか（覚えたコードで開かないセットがあり、この端末にコードを覚えている） */
  function canRetry() { return !!(recode() && HK.Packs.retry && HK.Packs.hasSavedCode && HK.Packs.hasSavedCode()); }
  /* ---------- 追加パックはこちら（販売ページへの誘導） ---------- */
  function shop() { var C = HK.CONF || {}; return { b: C.packBoothUrl || C.boothUrl || '', n: C.packNoteUrl || C.noteUrl || '' }; }
  function opened() { return HK.Packs ? HK.Packs.list().filter(function (x) { return x.st === 'open'; }) : []; }
  function guideTitle() { return opened().length ? '追加パックの管理' : '追加パックはこちら'; }
  function guideText() {
    var op = opened(), c = cname();
    if (op.length) return 'この端末で開いている追加パック：「' + op.map(function (x) { return x.name; }).join('」「') + '」。' + (HK.Packs.hasLocked() ? 'まだ開けていないセットは、購入した' + c + 'を「箱庭を追加」で入れると加わります。' : '') + 'ほかのセットは BOOTH・note で頒布しています。';
    return '新しい箱庭のセット（追加パック）を BOOTH・note で頒布しています。購入した' + c + 'を「箱庭を追加」で入れると、箱庭が一覧に加わります。';
  }
  function guideLinks(cls) {
    var u = shop();
    return (u.b ? '<a' + (cls ? ' class="' + cls + '"' : '') + ' href="' + esc(u.b) + '" target="_blank" rel="noopener">BOOTHで見る ↗</a>' : '') +
      (u.n ? '<a' + (cls ? ' class="' + cls + '"' : '') + ' href="' + esc(u.n) + '" target="_blank" rel="noopener">noteで見る ↗</a>' : '');
  }
  function guideOn() { var u = shop(); return !!(HK.Packs && (u.b || u.n)); }
  /* 窓の一覧（スマホの「変える」の窓・ui.js）の最後：全年齢版の R-18版の案内（.bxr18c）と同じ作り。押すと一文とボタンが開く（ui.js の r18card） */
  UI.guideCard = function () {
    if (!guideOn()) return '';
    return '<div class="scen pklink bxr18c"><button type="button" class="bxr18c-t" data-act="r18card" aria-expanded="false" aria-controls="bxpk-b" title="' + esc(guideText()) + '">' +
      '<span class="k"><span class="kt">追加の箱庭</span></span><span class="n">' + guideTitle() + '</span><span class="bxr18c-i" aria-hidden="true"></span></button>' +
      '<div class="bxr18c-b" id="bxpk-b" hidden><p class="bxr18c-d">' + esc(guideText()) + '</p><p class="bxr18c-a">' + guideLinks('') + '</p></div></div>';
  };
  /* PC の上の一覧（ui-box-list.js）の最後：全年齢版の .bxlr18c と同じ位置・同じ作り */
  UI.guideItem = function () {
    if (!guideOn()) return '';
    return '<li class="bxlpk"><div class="bxr18c bxlr18c"><button type="button" class="bxr18c-t" data-act="r18card" aria-expanded="false" aria-controls="bxlpk-b" title="' + esc(guideText()) + '">' +
      '<span class="bxlk">追加の箱庭</span><span class="bxln">' + guideTitle() + '</span><span class="bxr18c-i" aria-hidden="true"></span></button>' +
      '<div class="bxr18c-b" id="bxlpk-b" hidden><p class="bxr18c-d">' + esc(guideText()) + '</p><p class="bxr18c-a">' + guideLinks('') + '</p></div></div></li>';
  };
  UI.card = function () {
    if (!HK.Packs || !HK.Packs.ready() || !HK.Packs.hasLocked()) return '';
    return '<div class="scen packadd"><div class="k">追加の箱庭</div><div class="n">箱庭を追加</div><div class="d">' +
      (recode() ? esc(HK.Packs.errText(recode())) : '購入した' + esc(cname()) + 'を入れると、新しい箱庭のセットが一覧に加わります。') + '</div>' +
      '<p style="margin:8px 0 0"><button type="button" class="btn small primary" data-packadd="1">コードを入れる</button></p></div>';
  };

  /* PC の上の一覧（js/ui-box-list.js）の最後に足す1枚 */
  UI.listItem = function () {
    if (!HK.Packs || !HK.Packs.ready() || !HK.Packs.hasLocked()) return '';
    return '<li class="packadd"><button type="button" class="bxlc packadd" data-packadd="1" title="購入した' + esc(cname()) + 'を入れると、新しい箱庭のセットが一覧に加わります"><span class="bxlk">追加の箱庭</span><span class="bxln">＋ 箱庭を追加</span></button></li>';
  };
  var ov = null, opener = null;
  function close() {
    if (!ov) return;
    ov.remove(); ov = null;
    document.removeEventListener('keydown', onKey, true);
    if (opener && opener.focus) try { opener.focus(); } catch (e) { /* 何もしない */ }
    opener = null;
  }
  function onKey(e) { if (e.key === 'Escape') { e.stopPropagation(); close(); } }
  function setsHtml() {
    var ls = locked();
    if (!ls.length) return '<p class="hint">追加できるセットはありません。</p>';
    return '<ul class="packsets" style="margin:6px 0 10px;padding-left:1.2em">' + ls.map(function (x) {
      return '<li><b>' + esc(x.name) + '</b>' + (x.desc ? '<span class="hint small" style="display:block;margin:0">' + esc(x.desc) + '</span>' : '') +
        (x.err ? '<span class="hint small" style="display:block;margin:0;color:var(--hot,#B4232A)">' + esc(HK.Packs.errText(x.err)) + '</span>' : '') + '</li>';
    }).join('') + '</ul>';
  }
  function open(from) {
    if (ov) return;
    opener = from || document.activeElement;
    ov = document.createElement('div');
    ov.className = 'gearov tipov packov';
    ov.innerHTML = '<div class="gearbox" role="dialog" aria-modal="true" aria-labelledby="packtitle" tabindex="-1" style="max-width:min(480px,calc(100vw - 24px))">' +
      '<div class="gearhd"><h2 id="packtitle">箱庭を追加</h2><button type="button" class="btn small" data-packclose="1">閉じる</button></div>' +
      '<form class="packform" style="padding:4px 2px 8px"><p class="tiplead" style="margin:0 0 4px">購入した' + esc(cname()) + 'を入れてください。まとめ買いのコードなら、すべてのセットが一度に加わります。</p>' +
      '<div class="packsetsbox">' + setsHtml() + '</div>' +
      '<label for="packcode" class="hint small" style="display:block;margin:0 0 4px">' + esc(cname()) + '</label>' +
      '<input id="packcode" type="text" autocomplete="off" autocapitalize="characters" spellcheck="false" inputmode="latin" style="width:100%;box-sizing:border-box;font-size:16px;padding:8px 10px">' +
      '<p class="packerr hint small" role="alert" style="min-height:1.4em;margin:6px 0 0;color:var(--hot,#B4232A)"></p>' +
      '<p style="margin:8px 0 0;display:flex;gap:8px;justify-content:flex-end;flex-wrap:wrap">' + (canRetry() ? '<button type="button" class="btn" data-packretry="1">覚えているコードで開き直す</button>' : '') + '<button type="submit" class="btn primary">追加する</button></p>' +
      '<p class="hint small" style="margin:10px 0 0">一度入れたコードはこの端末に覚えておき、次からは入れなくても使えます。ブラウザのデータを消したときは、もう一度入れてください。</p></form>' +
      (guideOn() ? '<div class="packguide" style="margin:6px 2px 4px;padding:10px 0 0;border-top:1px solid var(--line2,#d3d9df)"><p class="hint small" style="margin:0 0 2px"><b>' + guideTitle() + '</b></p><p class="hint small" style="margin:0 0 8px">' + esc(guideText()) + '</p>' +
        '<p style="margin:0;display:flex;gap:8px;flex-wrap:wrap">' + guideLinks('btn small') + '</p></div>' : '') + '</div>';
    ov.addEventListener('click', function (e) {
      var t = e.target;
      if (t === ov || (t.closest && t.closest('[data-packclose]'))) { close(); return; }
      var rb = t.closest && t.closest('[data-packretry]');
      if (!rb) return;
      /* 覚えているコードで開き直す（2026-11-07）：この端末に覚えたコード（ほかのセットのまとめ用のコードも）で、もう一度開けてみる */
      var msg = ov.querySelector('.packerr');
      msg.textContent = '確かめています…'; rb.disabled = true;
      setTimeout(function () {
        var got = HK.Packs.retry();
        rb.disabled = false;
        if (got.length) {
          close();
          toast('「' + got.join('」「') + '」を覚えているコードで開きました');
          return;
        }
        msg.textContent = '覚えているコードでは開けませんでした。' + cname() + 'を入れてください';
        var sb = ov.querySelector('.packsetsbox'); if (sb) sb.innerHTML = setsHtml();
        var inp = ov.querySelector('#packcode'); if (inp) inp.focus();
      }, 30);
    });
    ov.querySelector('form').addEventListener('submit', function (e) {
      e.preventDefault();
      var inp = ov.querySelector('#packcode'), msg = ov.querySelector('.packerr'), btn = ov.querySelector('button[type=submit]');
      var code = inp.value;
      if (!HK.PackCrypto || !String(code).trim()) { msg.textContent = 'コードを入れてください'; inp.focus(); return; }
      msg.textContent = '確かめています…'; btn.disabled = true;
      /* 鍵を作る計算で一瞬止まるので、表示を出してから */
      setTimeout(function () {
        var r = HK.Packs.unlock(code);
        btn.disabled = false;
        if (r.opened.length) {
          close();
          toast('「' + r.opened.join('」「') + '」を追加しました' + (r.errors.length ? '（' + r.errors.map(function (x) { return x.name + '：' + HK.Packs.errText(x.err); }).join('／') + '）' : ''));
          return;
        }
        msg.textContent = r.errors.length ? r.errors.map(function (x) { return x.name + '：' + HK.Packs.errText(x.err); }).join('／') : 'コードが違います（まだ開けていないセットの' + cname() + 'を入れてください）';
        var sb = ov.querySelector('.packsetsbox'); if (sb) sb.innerHTML = setsHtml();
        inp.focus(); inp.select();
      }, 30);
    });
    document.body.appendChild(ov);
    document.addEventListener('keydown', onKey, true);
    var f = ov.querySelector('#packcode'); if (f) f.focus();
  }
  UI.open = open;
  document.addEventListener('click', function (e) {
    var b = e.target.closest && e.target.closest('[data-packadd]');
    if (!b) return;
    e.preventDefault(); e.stopPropagation();
    open(b);
  });
  /* パックが届いた・開いたら一覧を描き直す（箱庭の一覧が出ているときだけ） */
  function redraw() { if (HK.UI && HK.UI.refresh && document.querySelector('.scens')) { try { HK.UI.refresh(); } catch (e) { setTimeout(function () { throw e; }, 0); } } }
  if (HK.Packs) {
    HK.Packs.on(redraw); HK.Packs.onReady(redraw);
    /* 覚えたコードで開かなくなったセットがあれば、起動のときに一度だけ知らせる（覚えた分は消さない） */
    HK.Packs.onReady(function () { var r = recode(); if (r) setTimeout(function () { toast(HK.Packs.errText(r) + '（「箱庭を追加」から）'); }, 600); });
  }
})();
