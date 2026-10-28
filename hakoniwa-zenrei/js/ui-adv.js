/* 箱庭シミュレーター: 高度設定（利用者が書き換えられる辞書の欄）
   「箱庭と環境」タブの環境値の下に「高度設定」の節を出す。節の中身は HK.Adv.add で登録する（節が一つもなければ何も出さない）：
     ・喘ぎ声の調整（moan-engine.js の HK.Moan.setFit。R18版だけ）… ui-adv-moan-fit.js が登録（選択欄とスライダーの節。sec.html）
     ・喘ぎの辞書（moan-engine.js の HK.Moan。R18版だけ）… ui-adv-moan.js が登録
   書いた文字列はブラウザに保存し（HK.store の adv）、JSON の書き出し（全員のとき）にも adv として入る。
   欄を変えるたびに各エンジンの setUser に渡し、読めなかった行は欄の下に出す。
   ※箱庭全体の「口調の辞書」（adv.tone）は 2026-10-26 にやめた（口調は住人ごとの「語尾の設定」「辞書を直接書く」で決める。tone-ending.js）。
     保存済みの値は消さずに残すが、画面に出さず、当てず（ui.js の oldTone が tone-engine.js の当てた分を外す）、書き出し・読み込みにも乗せない（A.RETIRED） */
(function () {
  'use strict';
  var HK = window.HK;
  if (!HK) return;
  var A = HK.Adv = { secs: [], RETIRED: { tone: 1 } };
  var data = HK.store && HK.store.get('adv', null);
  if (!data || typeof data !== 'object') data = {};
  A.data = data;
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  A.esc = esc;
  /* sec: { id, title, desc, placeholder, rows, apply(text) → { errors: [] }, extra() → html（任意）, onAct(act, el)（任意）,
       html() → 欄の中身（任意。textarea の代わり。中の入力は data-f="adv" data-k="<id>" にすると onInput(el) に届く）, onInput(el)（任意）, after()（任意。描いたあと）,
       before: 先に出す節の id（任意。その節の上に並べる） } */
  A.add = function (sec) {
    if (A.RETIRED[sec.id]) return;
    if (!A.secs.some(function (s) { return s.id === sec.id; })) {
      var at = sec.before ? A.secs.map(function (s) { return s.id; }).indexOf(sec.before) : -1;
      if (at >= 0) A.secs.splice(at, 0, sec); else A.secs.push(sec);
    }
    if (data[sec.id] && sec.apply) try { sec.apply(data[sec.id]); } catch (e) { /* 読めない辞書は無視 */ } };
  A.get = function (id) { return data[id] || ''; };
  A.set = function (id, text, quiet) {
    if (A.RETIRED[id]) return null;
    data[id] = String(text || '');
    if (HK.store) HK.store.set('adv', data);
    var sec = A.secs.filter(function (s) { return s.id === id; })[0], r = sec && sec.apply ? sec.apply(data[id]) : null;
    if (!quiet) A.showErrors(id, r && r.errors);
    return r;
  };
  A.showErrors = function (id, errors) {
    var el = document.getElementById('adv-err-' + id);
    if (!el) return;
    el.textContent = errors && errors.length ? '読めなかった行：' + errors.slice(0, 5).join('／') + (errors.length > 5 ? '（ほか' + (errors.length - 5) + '件）' : '') : '';
  };
  A.html = function () {
    if (!A.secs.length) return '';
    var what = '';
    /* r18:begin */
    if (!HK.SAFE_ON) what = '喘ぎ';
    /* r18:end */
    return '<h2 class="sec">高度設定</h2><div class="panel"><p class="hint" style="margin-top:0">辞書や調整を変えて、' + (what ? what + 'を' : '') + '自分好みにできます。空欄なら組み込みのまま。書いた内容はこのブラウザに保存され、JSONの書き出し（全員）にも入ります。</p>' +
      A.secs.map(function (s) {
        return '<div class="advsec" style="margin-top:12px"><div class="lab" style="font-weight:600">' + esc(s.title) + '</div>' +
          (s.desc ? '<div class="desc" style="font-size:12px;color:var(--muted);white-space:pre-wrap;margin:4px 0">' + esc(s.desc) + '</div>' : '') +
          (s.html ? s.html() : '<textarea data-f="adv" data-k="' + esc(s.id) + '" rows="' + (s.rows || 8) + '" placeholder="' + esc(s.placeholder || '') + '" spellcheck="false">' + esc(data[s.id] || '') + '</textarea>' +
          '<div class="desc" id="adv-err-' + esc(s.id) + '" style="font-size:12px;color:#b00;min-height:1.2em"></div>') +
          (s.extra ? s.extra() : '') + '</div>';
      }).join('') + '</div>';
  };
  /* 欄の入力（ui.js の onField から） */
  A.onInput = function (t) { var sec = A.secs.filter(function (s) { return s.id === t.dataset.k; })[0]; if (sec && sec.onInput) sec.onInput(t); else A.set(t.dataset.k, t.value); };
  /* 節ごとのボタン（data-act="adv:…"） */
  A.onAct = function (act, el) { A.secs.forEach(function (s) { if (s.onAct) s.onAct(act, el); }); };
  /* JSON の書き出し・読み込み */
  A.exportTo = function (o) { var any = false, m = {}; Object.keys(data).forEach(function (k) { if (data[k] && !A.RETIRED[k]) { m[k] = data[k]; any = true; } }); if (any) o.adv = m; };
  A.importFrom = function (o) { if (!o || !o.adv || typeof o.adv !== 'object') return; Object.keys(o.adv).forEach(function (k) { if (typeof o.adv[k] === 'string' && !A.RETIRED[k]) A.set(k, o.adv[k].slice(0, 20000), true); }); };
  /* 描いたあとに、読めなかった行を出す */
  A.afterRender = function () { A.secs.forEach(function (s) { var r = s.apply && data[s.id] ? s.apply(data[s.id]) : null; A.showErrors(s.id, r && r.errors); if (s.after) s.after(); }); };
})();
