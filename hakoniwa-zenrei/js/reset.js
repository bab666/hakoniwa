/* 箱庭シミュレーター: 保存データ（キャッシュ）の消去
   新しい箱庭が動かないときのために、このブラウザに保存した名簿・設定・履歴・表示の状態をまとめて消す。
   うっかり消さないよう、赤いボタン → 説明 → 「削除する」と入力 → 実行、の三段階にしている */
(function () {
  'use strict';
  var HK = window.HK;
  function keys(st) {
    var out = [];
    /* セーブデータ（saves.js）は消さない：IndexedDB に置いたセーブはもともと消えないので、IndexedDB が使えない環境の localStorage のセーブ（hakoniwa:saves）も残してそろえる。
       消すのはこの版の鍵だけ（safe.js の HK.STORE。R18版で消しても全年齢版の保存は残り、その逆も同じ）。全年齢版の移行の印は残す（消すと、R18版の保存をまた写してしまう） */
    var KS = HK.STORE, mine = function (k) { return KS ? KS.mine(k) : /^hakoniwa/.test(k); };
    var keep = KS ? [KS.key('hakoniwa:saves'), KS.FLAG] : ['hakoniwa:saves'];
    try { for (var i = 0; i < st.length; i++) { var k = st.key(i); if (k && mine(k) && keep.indexOf(k) < 0) out.push(k); } } catch (e) { /* 使えない環境 */ }
    return out;
  }
  function wipe() {
    [window.localStorage, window.sessionStorage].forEach(function (st) {
      try { keys(st).forEach(function (k) { st.removeItem(k); }); } catch (e) { /* 使えない環境 */ }
    });
    try { if (window.caches && caches.keys) caches.keys().then(function (ks) { ks.forEach(function (k) { if (/hakoniwa/.test(k)) caches.delete(k); }); }); } catch (e) { /* なし */ }
    /* 履歴の結果（history.js の IndexedDB）も消す。一覧（history）は上で消える。消し終わるのを待てるよう Promise を返す */
    try { if (HK && HK.History && HK.History.clear) return HK.History.clear(); } catch (e) { /* なし */ }
    return Promise.resolve(true);
  }
  function build() {
    var host = document.querySelector('.foot-body');
    if (!host || document.getElementById('resetbox')) return;
    var st = document.createElement('style');
    st.textContent = '.resetbox{margin-top:14px;border-top:1px solid var(--line);padding-top:12px}.btn.danger{background:#b3261e;border-color:#b3261e;color:#fff;font-weight:600}.btn.danger:hover{background:#8c1d18;border-color:#8c1d18}.btn.danger:disabled{opacity:.45;cursor:not-allowed}' +
      '.resetstep{margin-top:8px;padding:10px 12px;border:1px solid #b3261e;border-radius:8px;background:color-mix(in srgb,#b3261e 7%,var(--surface))}.resetstep[hidden]{display:none}.resetstep input{width:9em}.resetrow{display:flex;flex-wrap:wrap;gap:8px;align-items:center;margin-top:8px}';
    document.head.appendChild(st);
    var box = document.createElement('div');
    box.className = 'resetbox'; box.id = 'resetbox';
    box.innerHTML = '<p><b>動かないときは</b>　新しい箱庭が動かない・表示が崩れるときは、このブラウザに保存された古いデータが原因のことがあります。消すと、住人の名簿・関係・箱庭ごとの設定・結果の履歴・全年齢／R18の切り替えが、すべて初期状態に戻ります（「セーブ」タブのセーブデータは残ります）。</p>' +
      '<button type="button" class="btn danger" id="reset-open">保存データを消去する…</button>' +
      '<div class="resetstep" id="reset-step" hidden role="group" aria-labelledby="reset-warn">' +
      '<p id="reset-warn" style="margin:0"><b>本当に消しますか？</b>　元には戻せません。住人を残したいときは、先にJSONで書き出してください。</p>' +
      '<div class="resetrow"><button type="button" class="btn" data-act="jsonout">住人をJSONで書き出す</button></div>' +
      '<div class="resetrow"><label for="reset-word">確認のため「削除する」と入力</label><input type="text" id="reset-word" autocomplete="off" spellcheck="false" placeholder="削除する"></div>' +
      '<div class="resetrow"><button type="button" class="btn danger" id="reset-go" disabled>消去して読み込み直す</button><button type="button" class="btn" id="reset-cancel">やめる</button></div></div>';
    host.appendChild(box);
    var step = box.querySelector('#reset-step'), word = box.querySelector('#reset-word'), go = box.querySelector('#reset-go');
    box.querySelector('#reset-open').addEventListener('click', function () { step.hidden = false; word.value = ''; go.disabled = true; word.focus(); });
    box.querySelector('#reset-cancel').addEventListener('click', function () { step.hidden = true; word.value = ''; go.disabled = true; });
    word.addEventListener('input', function () { go.disabled = word.value.trim() !== '削除する'; });
    go.addEventListener('click', function () {
      if (word.value.trim() !== '削除する') return;
      var again = function () { setTimeout(function () { location.replace(location.href.split('#')[0]); }, 400); };
      wipe().then(again, again);
      if (HK && HK.toast) HK.toast('保存データを消しました。読み込み直します');
    });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', build); else build();
  HK.resetStorage = wipe;
})();
