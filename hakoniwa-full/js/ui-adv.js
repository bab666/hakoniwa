/* 箱庭シミュレーター: 高度設定（利用者が書き換えられる辞書の欄）
   「箱庭と環境」タブの環境値の下に「高度設定」の節を出す。節の中身は HK.Adv.add で登録する：
     ・口調の辞書（tone-engine.js の HK.Tone。両ビルド）… ここで登録
     ・喘ぎの辞書（moan-engine.js の HK.Moan。R18版だけ）… ui-adv-moan.js が登録
   書いた文字列はブラウザに保存し（HK.store の adv）、JSON の書き出し（全員のとき）にも adv として入る。
   欄を変えるたびに各エンジンの setUser に渡し、読めなかった行は欄の下に出す */
(function () {
  'use strict';
  var HK = window.HK;
  if (!HK) return;
  var A = HK.Adv = { secs: [] };
  var data = HK.store && HK.store.get('adv', null);
  if (!data || typeof data !== 'object') data = {};
  A.data = data;
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  A.esc = esc;
  /* sec: { id, title, desc, placeholder, rows, apply(text) → { errors: [] }, extra() → html（任意）, onAct(act, el)（任意） } */
  A.add = function (sec) { if (!A.secs.some(function (s) { return s.id === sec.id; })) A.secs.push(sec); if (data[sec.id] && sec.apply) try { sec.apply(data[sec.id]); } catch (e) { /* 読めない辞書は無視 */ } };
  A.get = function (id) { return data[id] || ''; };
  A.set = function (id, text, quiet) {
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
    var what = '口調';
    /* r18:begin */
    if (!HK.SAFE_ON) what = '口調や喘ぎ';
    /* r18:end */
    return '<h2 class="sec">高度設定</h2><div class="panel"><p class="hint" style="margin-top:0">辞書を書き換えて、' + what + 'を自分好みにできます。空欄なら組み込みのまま。書いた内容はこのブラウザに保存され、JSONの書き出し（全員）にも入ります。</p>' +
      A.secs.map(function (s) {
        return '<div class="advsec" style="margin-top:12px"><div class="lab" style="font-weight:600">' + esc(s.title) + '</div>' +
          (s.desc ? '<div class="desc" style="font-size:12px;color:var(--muted);white-space:pre-wrap;margin:4px 0">' + esc(s.desc) + '</div>' : '') +
          '<textarea data-f="adv" data-k="' + esc(s.id) + '" rows="' + (s.rows || 8) + '" placeholder="' + esc(s.placeholder || '') + '" spellcheck="false">' + esc(data[s.id] || '') + '</textarea>' +
          '<div class="desc" id="adv-err-' + esc(s.id) + '" style="font-size:12px;color:#b00;min-height:1.2em"></div>' +
          (s.extra ? s.extra() : '') + '</div>';
      }).join('') + '</div>';
  };
  /* 欄の入力（ui.js の onField から） */
  A.onInput = function (t) { A.set(t.dataset.k, t.value); };
  /* 節ごとのボタン（data-act="adv:…"） */
  A.onAct = function (act, el) { A.secs.forEach(function (s) { if (s.onAct) s.onAct(act, el); }); };
  /* JSON の書き出し・読み込み */
  A.exportTo = function (o) { var any = false, m = {}; Object.keys(data).forEach(function (k) { if (data[k]) { m[k] = data[k]; any = true; } }); if (any) o.adv = m; };
  A.importFrom = function (o) { if (!o || !o.adv || typeof o.adv !== 'object') return; Object.keys(o.adv).forEach(function (k) { if (typeof o.adv[k] === 'string') A.set(k, o.adv[k].slice(0, 20000), true); }); };
  /* 描いたあとに、読めなかった行を出す */
  A.afterRender = function () { A.secs.forEach(function (s) { var r = s.apply && data[s.id] ? s.apply(data[s.id]) : null; A.showErrors(s.id, r && r.errors); }); };

  /* ---------- 口調の辞書（tone-engine.js） ---------- */
  if (HK.Tone) {
    A.add({
      id: 'tone', title: '口調の辞書', rows: 10,
      desc: '自分の口調を作れます。ベース（K くだけた常体／F 硬い常体／P 敬語）を選び、[文末]・[語彙]・[規則]・[効果] で言い換えを書きます。作った口調は住人の「口調」の選択欄の末尾に出ます。ここは全員で共有する辞書です。住人ごとに書きたいときは、住人の設定の「辞書を直接書く」に書いてください。\n' + (HK.Tone.help ? HK.Tone.help() : ''),
      placeholder: HK.Tone.sample ? HK.Tone.sample() : '[口調]\n名前=ですぞ侍\nベース=P\n一人称=拙者\n[文末]\nです=ですぞ／ですな\nますか=ますかな\n[語彙]\nありがとうございます=かたじけない',
      apply: function (text) { return HK.Tone.setUser(text); },
      extra: function () { return '<div class="row" style="margin-top:4px"><button type="button" class="mini" data-act="adv:tone-demo">見本の台詞で試す</button><span class="desc" id="adv-tone-demo" style="font-size:12px;white-space:pre-wrap"></span></div>'; },
      onAct: function (act) {
        if (act !== 'adv:tone-demo') return;
        var el = document.getElementById('adv-tone-demo'); if (!el) return;
        var keys = HK.Tone.userKeys ? HK.Tone.userKeys() : [];
        if (!keys.length) { el.textContent = '辞書に [口調] がありません'; return; }
        el.textContent = keys.map(function (k) { return (HK.Tone.labelOf ? HK.Tone.labelOf(k) : k) + '：' + (HK.Tone.demo ? HK.Tone.demo(k).join('　') : ''); }).join('\n');
      }
    });
  }
})();
