/* 箱庭シミュレーター: 追加パックの画面（HK.PacksUI）。両方のビルドに同じファイルを置く
   ・箱庭の一覧の最後に「箱庭を追加」のカードを出す（まだ開けていない追加パックがあるときだけ。データ配布版でフォルダを置いていなければ出ない）
   ・押すとコードの入力を出す。入れたコードで開くパックを全部開け（まとめ用のコードなら一度に全部）、一覧に箱庭を足す
   ・開けていない部屋の名前は出さない（入力の画面にセットの名前と紹介だけ）
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
  UI.card = function () {
    if (!HK.Packs || !HK.Packs.ready() || !HK.Packs.hasLocked()) return '';
    return '<div class="scen packadd"><div class="k">追加の箱庭</div><div class="n">箱庭を追加</div><div class="d">購入したコードを入れると、新しい箱庭のセットが一覧に加わります。</div>' +
      '<p style="margin:8px 0 0"><button type="button" class="btn small primary" data-packadd="1">コードを入れる</button></p></div>';
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
        (x.st === 'error' && x.err ? '<span class="hint small" style="display:block;margin:0;color:var(--hot,#B4232A)">' + esc(HK.Packs.errText(x.err)) + '</span>' : '') + '</li>';
    }).join('') + '</ul>';
  }
  function open(from) {
    if (ov) return;
    opener = from || document.activeElement;
    ov = document.createElement('div');
    ov.className = 'gearov tipov packov';
    ov.innerHTML = '<div class="gearbox" role="dialog" aria-modal="true" aria-labelledby="packtitle" tabindex="-1" style="max-width:min(480px,calc(100vw - 24px))">' +
      '<div class="gearhd"><h2 id="packtitle">箱庭を追加</h2><button type="button" class="btn small" data-packclose="1">閉じる</button></div>' +
      '<form class="packform" style="padding:4px 2px 8px"><p class="tiplead" style="margin:0 0 4px">購入したコードを入れてください。まとめ買いのコードなら、すべてのセットが一度に加わります。</p>' +
      '<div class="packsetsbox">' + setsHtml() + '</div>' +
      '<label for="packcode" class="hint small" style="display:block;margin:0 0 4px">コード</label>' +
      '<input id="packcode" type="text" autocomplete="off" autocapitalize="characters" spellcheck="false" inputmode="latin" style="width:100%;box-sizing:border-box;font-size:16px;padding:8px 10px">' +
      '<p class="packerr hint small" role="alert" style="min-height:1.4em;margin:6px 0 0;color:var(--hot,#B4232A)"></p>' +
      '<p style="margin:8px 0 0;display:flex;gap:8px;justify-content:flex-end"><button type="submit" class="btn primary">追加する</button></p>' +
      '<p class="hint small" style="margin:10px 0 0">一度入れたコードはこの端末に覚えておき、次からは入れなくても使えます。ブラウザのデータを消したときは、もう一度入れてください。</p></form></div>';
    ov.addEventListener('click', function (e) {
      var t = e.target;
      if (t === ov || (t.closest && t.closest('[data-packclose]'))) close();
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
        msg.textContent = r.errors.length ? r.errors.map(function (x) { return x.name + '：' + HK.Packs.errText(x.err); }).join('／') : 'コードが違います（まだ開けていないセットのコードを入れてください）';
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
  if (HK.Packs) { HK.Packs.on(redraw); HK.Packs.onReady(redraw); }
})();
