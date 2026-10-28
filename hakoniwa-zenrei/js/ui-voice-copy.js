/* 箱庭シミュレーター ui: 「口調・喘ぎの設定」の節のコピー・写し・文字列・初期化（ui-voice.js の VS.tools・VS.onTool）。2026-10-28 担当LA
   ・この設定を別の住人へコピー（対象が住人）：写す相手を複数選ぶ（チェック・グループ単位・全員）。写す内容（部品：口調／喘ぎ）と写し方（足す／置き換える）を選ぶ。
       足す … 相手の空の欄だけ埋め、辞書（口調の辞書・喘ぎの辞書）は後ろに足し、語尾の設定などの組は欠けている項目だけ埋める（相手の値は消さない）
       置き換える … 相手のその欄を、この住人と同じにする（この住人が空の欄は、相手も空にする）
   ・全体の設定を住人へ写す（対象が全体）・全体の設定をこの住人へ写す・この住人の設定を全体の既定にする：部品の toChar／fromChar（変換。写せない欄は理由を出す）
   ・設定を文字列で書き出す／貼り付けて読み込む：JSON の抜粋 { hakoniwaVoice: 1, scope: 'char'|'all', name, data: { c.* の欄 } | adv: { 全体の欄 } }。
     住人の JSON（hakoniwa-residents）の最初の住人・全員の JSON の adv もそのまま貼り付けられる。読み込むときは住人の保存と同じ整え方（ui.js の normState）を通す
   ・この住人の設定を初期化：選んだ部品の欄だけ、この住人だけ空にする（名前の読みは残す）
   どれも確認を出してから書く。保存の鍵と形は変えない（新しい鍵は作らない）。セーブ・履歴の記録は書き換えない */
(function () {
  'use strict';
  var HK = window.HK, VS = HK && HK.VoiceSet, UI = HK && HK.UI;
  if (!VS || !UI) return;
  var esc = VS.esc;
  function S() { return UI.state(); }
  function toast(m) { if (UI.toast) UI.toast(m); }
  function A() { return HK.Adv && HK.Adv.secs && HK.Adv.secs.length ? HK.Adv : null; }
  function partsWith(fn) { return VS.parts.filter(function (p) { return !!p[fn]; }); }
  /* 部品の名前の並び（口調・喘ぎ） */
  function names(ps) { return ps.map(function (p) { return p.label; }).join('・'); }

  /* ---------- 節の頭のボタン ---------- */
  VS.tools = function (c) {
    var b = function (act, label, title) { return '<button type="button" class="btn small ghost" data-vact="' + act + '" title="' + esc(title) + '">' + esc(label) + '</button>'; };
    var all = names(VS.parts);
    if (!c) return !A() ? '' : b('copy', '全体の設定を住人へ写す', '全体の' + all + 'の設定を、選んだ住人の設定に変換して入れます（変換できない欄は理由を出します）') +
      b('io', '設定を文字列で書き出す・読み込む', '全体の設定を短い文字列にして、別の端末やほかの人と受け渡しできます');
    return b('copy', 'この設定を別の住人へコピー', c.name + 'の' + all + 'の設定を、選んだ住人に写します（足す／置き換えるを選べます）') +
      (A() ? b('g2c', '全体の設定をこの住人へ写す', '全体の設定を、' + c.name + 'だけの設定に変換して入れます') + b('c2g', 'この住人の設定を全体の既定にする', c.name + 'の設定を、全体の設定に変換して入れます') : '') +
      b('io', '設定を文字列で書き出す・読み込む', c.name + 'の' + all + 'の設定を文字列にして受け渡しします') +
      b('reset', 'この住人の設定を初期化', c.name + 'の' + all + 'の欄を空に戻します（確認を出します）');
  };

  /* ---------- 窓 ---------- */
  var ov = null, onAct = null, onChg = null;
  function openDlg(title, body, handler, change) {
    if (!ov) {
      ov = document.createElement('div');
      ov.className = 'gearov vsdlg';
      ov.innerHTML = '<div class="gearbox" role="dialog" aria-modal="true" aria-labelledby="vsdlgt"></div>';
      document.body.appendChild(ov);
      ov.addEventListener('click', function (ev) {
        if (ev.target === ov) { closeDlg(); return; }
        var b = ev.target.closest('[data-dact]');
        if (b && onAct) onAct(b.getAttribute('data-dact'), b);
      });
      ov.addEventListener('input', function (ev) { if (ev.target.classList.contains('vs-filt')) filt(ev.target.value); });
      ov.addEventListener('change', function (ev) { if (ev.target.hasAttribute('data-vto')) count(); if (onChg) onChg(ev); });
      document.addEventListener('keydown', function (ev) { if (ov && !ov.hidden && ev.key === 'Escape') { ev.preventDefault(); closeDlg(); } });
    }
    onAct = handler; onChg = change || null;
    ov.querySelector('.gearbox').innerHTML = '<div class="gearhd"><h2 id="vsdlgt">' + esc(title) + '</h2><button type="button" class="btn small" data-dact="close">閉じる</button></div>' + body;
    ov.hidden = false;
    document.body.style.overflow = 'hidden';
    var f = ov.querySelector('.gearbox input,.gearbox textarea,.gearbox select'); if (f) try { f.focus({ preventScroll: true }); } catch (e) { f.focus(); }
  }
  function closeDlg() {
    if (!ov) return;
    ov.hidden = true; onAct = null; onChg = null;
    document.body.style.overflow = '';
    var t = document.getElementById('vs-target'); if (t) try { t.focus({ preventScroll: true }); } catch (e) { t.focus(); }
  }
  function q(sel) { return ov ? ov.querySelector(sel) : null; }
  function radio(name) { var r = q('input[name="' + name + '"]:checked'); return r ? r.value : ''; }
  function whatRow(ps) {
    if (ps.length < 2) return '';
    return '<div class="gearrow"><span class="gearhint" style="margin:0;flex:0 0 auto">写す内容</span><label><input type="radio" name="vs-what" value="" checked> ' + esc(names(ps)) + 'の両方</label>' +
      ps.map(function (p) { return '<label><input type="radio" name="vs-what" value="' + esc(p.id) + '"> ' + esc(p.label) + 'だけ</label>'; }).join('') + '</div>';
  }
  function chosen(ps) { var w = radio('vs-what'); return w ? ps.filter(function (p) { return p.id === w; }) : ps; }
  function modeRow(addText, repText) {
    return '<div class="gearrow"><span class="gearhint" style="margin:0;flex:0 0 auto">写し方</span><label><input type="radio" name="vs-mode" value="add" checked> 足す（' + esc(addText) + '）</label>' +
      '<label><input type="radio" name="vs-mode" value="rep"> 置き換える（' + esc(repText) + '）</label></div>';
  }
  function after(list) { UI.save(); list.forEach(function (c) { VS.rowSync(c); }); VS.refresh(); }

  /* ---------- 住人どうしのコピー ---------- */
  /* 空にするときの形（住人の保存の整え方 ui.js の normChar と同じ形。無い欄は消す） */
  var EMPTY = { tone: '', fp: '', you: '', marks: '', toneCustom: '', call: '', keigoOlder: false, callG: null, ending: {}, toneDict: '' };
  function filled(v) { return v != null && v !== '' && v !== false && !(typeof v === 'string' && !v.trim()) && !(typeof v === 'object' && !Object.keys(v).length); }
  function clone(v) { return v && typeof v === 'object' ? JSON.parse(JSON.stringify(v)) : v; }
  var TEXT_MAX = { toneDict: 4000, moanDict: 4000, moanDictT: 4000 };
  function clear(c, k) { if (Object.prototype.hasOwnProperty.call(EMPTY, k)) c[k] = clone(EMPTY[k]); else delete c[k]; }
  /* src の欄 keys を dst に写す。変わった欄の数を返す */
  function putKeys(src, dst, keys, mode) {
    var n = 0;
    keys.forEach(function (k) {
      var sv = src[k], dv = dst[k], before = JSON.stringify(dv === undefined ? null : dv);
      if (mode === 'rep') { if (filled(sv)) dst[k] = clone(sv); else clear(dst, k); }
      else if (filled(sv)) {
        if (TEXT_MAX[k]) dst[k] = filled(dv) ? (String(dv).replace(/\s+$/, '') + '\n' + sv).slice(0, TEXT_MAX[k]) : sv;
        else if (typeof sv === 'object') { var o = dv && typeof dv === 'object' ? clone(dv) : {}; Object.keys(sv).forEach(function (x) { if (!filled(o[x])) o[x] = clone(sv[x]); }); dst[k] = o; }
        else if (!filled(dv)) dst[k] = clone(sv);
      }
      if (JSON.stringify(dst[k] === undefined ? null : dst[k]) !== before) n++;
    });
    return n;
  }
  function keysOf(ps) { var k = []; ps.forEach(function (p) { (p.keys || []).forEach(function (x) { if (k.indexOf(x) < 0) k.push(x); }); }); return k; }
  function grpsOf(c) { var g = []; String((c && c.group) || '').split(/[,，、]/).forEach(function (x) { x = x.trim(); if (x && g.indexOf(x) < 0) g.push(x); }); return g; }
  function filt(v) {
    var n = String(v || '').trim().toLowerCase();
    Array.prototype.forEach.call(ov.querySelectorAll('.vs-list label'), function (l) { l.style.display = !n || l.textContent.toLowerCase().indexOf(n) >= 0 ? '' : 'none'; });
  }
  function count() { var el = q('#vs-cnt'); if (el) el.textContent = ov.querySelectorAll('[data-vto]:checked').length + '人を選んでいます'; }
  function copyDlg(src) {
    var chars = S().chars.filter(function (x) { return x !== src; }), groups = [];
    chars.forEach(function (c) { grpsOf(c).forEach(function (g) { if (groups.indexOf(g) < 0) groups.push(g); }); });
    var ps = src ? VS.parts.filter(function (p) { return p.keys; }) : partsWith('toChar');
    if (!chars.length) { toast('ほかの住人がいません'); return; }
    var body = (src ? '<p class="gearhint">' + esc(src.name) + 'の設定を、選んだ住人に写します。' + esc(src.name) + 'の設定は変わりません。名前の読み・敬語で話す相手（ほかの住人を指す欄）は写しません。</p>' :
      '<p class="gearhint">全体の設定を、選んだ住人それぞれの設定に変換して入れます（その人に効く分だけ。変換できない欄は、写したあとに理由を出します）。全体の設定は変わりません。</p>') +
      whatRow(ps) + modeRow(src ? '相手の空の欄だけ埋め、辞書は後ろに足す' : '相手が決めていない欄だけ埋め、辞書は後ろに足す', '相手のその欄を' + (src ? src.name : '全体') + 'と同じにする') +
      '<div class="gearrow"><span class="gearhint" style="margin:0;flex:0 0 auto">写す相手</span><button type="button" class="btn small" data-dact="all">全員</button><button type="button" class="btn small ghost" data-dact="none">全員外す</button>' +
      groups.map(function (g) { var n = chars.filter(function (c) { return grpsOf(c).indexOf(g) >= 0; }).length; return '<button type="button" class="btn small ghost" data-dact="grp" data-g="' + esc(g) + '" title="このグループの全員に印を付けます（もう一度押すと外します）">' + esc(g) + '（' + n + '）</button>'; }).join('') +
      '<input type="search" class="vs-filt" placeholder="名前で絞り込む" aria-label="写す相手を名前で絞り込む" style="width:10em;max-width:100%"></div>' +
      '<div class="vs-list">' + chars.map(function (c) { return '<label><input type="checkbox" data-vto="' + esc(c.id) + '"> ' + esc(c.name) + '</label>'; }).join('') + '</div>' +
      '<p class="gearhint" id="vs-cnt">0人を選んでいます</p>' +
      '<div class="row" style="margin-top:10px;gap:8px"><button type="button" class="btn primary" data-dact="run">' + (src ? 'コピーする' : '写す') + '</button><button type="button" class="btn ghost" data-dact="close">やめる</button></div>';
    openDlg(src ? src.name + 'の設定を別の住人へコピー' : '全体の設定を住人へ写す', body, function (act, b) {
      var boxes = ov.querySelectorAll('[data-vto]');
      if (act === 'close') { closeDlg(); return; }
      if (act === 'all' || act === 'none') { Array.prototype.forEach.call(boxes, function (x) { if (act === 'none' || x.closest('label').style.display !== 'none') x.checked = act === 'all'; }); count(); return; }
      if (act === 'grp') {
        var g = b.getAttribute('data-g'), ids = {}, on;
        chars.forEach(function (c) { if (grpsOf(c).indexOf(g) >= 0) ids[c.id] = 1; });
        on = Array.prototype.some.call(boxes, function (x) { return ids[x.getAttribute('data-vto')] && !x.checked; });
        Array.prototype.forEach.call(boxes, function (x) { if (ids[x.getAttribute('data-vto')]) x.checked = on; });
        count(); return;
      }
      if (act !== 'run') return;
      var pick = Array.prototype.filter.call(boxes, function (x) { return x.checked; }).map(function (x) { return VS.byId(x.getAttribute('data-vto')); }).filter(Boolean);
      if (!pick.length) { toast('写す相手を選んでください'); return; }
      var use = chosen(ps), mode = radio('vs-mode') || 'add', who = pick.slice(0, 6).map(function (c) { return c.name; }).join('・') + (pick.length > 6 ? ' ほか' + (pick.length - 6) + '人' : '');
      var msg = (src ? src.name + 'の' : '全体の') + names(use) + 'の設定を、' + pick.length + '人（' + who + '）に' + (mode === 'rep' ? '写して置き換えます。\n相手の今の' + names(use) + 'の設定は消えて、' + (src ? src.name : '全体') + 'と同じになります（元に戻せません）。' : '足します。\n相手が決めている欄はそのまま残し、空の欄だけ埋めて、辞書は後ろに足します。') + '\nよろしいですか？';
      if (!window.confirm(msg)) return;
      var n = 0, skips = [];
      if (src) { var keys = keysOf(use); pick.forEach(function (c) { if (putKeys(src, c, keys, mode)) n++; }); }
      else pick.forEach(function (c) { var hit = false; use.forEach(function (p) { var r = p.toChar(c, mode, false); if (r.done.length) hit = true; r.skip.forEach(function (s) { if (skips.indexOf(s) < 0) skips.push(s); }); }); if (hit) n++; });
      closeDlg();
      after(pick);
      toast(n ? pick.length + '人のうち' + n + '人の設定を' + (mode === 'rep' ? '置き換えました' : '足しました') + (skips.length ? '（写せなかったもの：' + skips.slice(0, 2).join('／') + (skips.length > 2 ? ' ほか' : '') + '）' : '') : '変わった住人はいません（同じ設定か、写せる欄がありません' + (skips.length ? '：' + skips[0] : '') + '）');
    });
  }

  /* ---------- 全体 ⇄ 住人（変換） ---------- */
  function convDlg(c, dir) {
    var fn = dir === 'g2c' ? 'toChar' : 'fromChar', ps = partsWith(fn);
    var title = dir === 'g2c' ? '全体の設定を' + c.name + 'へ写す' : c.name + 'の設定を全体の既定にする';
    var pv = function () {
      var mode = radio('vs-mode') || 'add', done = [], skip = [];
      chosen(ps).forEach(function (p) { var r = p[fn](c, mode, true); done = done.concat(r.done); skip = skip.concat(r.skip); });
      var el = q('#vs-pv');
      if (el) el.innerHTML = '<b>写すもの</b>' + (done.length ? '<ul class="vs-pv">' + done.map(function (x) { return '<li>' + esc(x) + '</li>'; }).join('') + '</ul>' : '<p class="gearhint">ありません</p>') +
        (skip.length ? '<b>写せないもの・写さないもの</b><ul class="vs-pv">' + skip.map(function (x) { return '<li>' + esc(x) + '</li>'; }).join('') + '</ul>' : '');
      return done.length;
    };
    var body = '<p class="gearhint">' + (dir === 'g2c' ? '全体の設定のうち、' + esc(c.name) + 'に効く分を、' + esc(c.name) + 'だけの設定に変換して入れます。全体の設定は変わりません。' : esc(c.name) + 'の設定を、全員に効く全体の設定に変換して入れます。' + esc(c.name) + 'の設定は変わりません。') + '</p>' +
      whatRow(ps) + modeRow(dir === 'g2c' ? 'この住人が決めていない欄だけ埋め、辞書は後ろに足す' : '全体が決めていない欄だけ埋め、辞書は後ろに足す', dir === 'g2c' ? 'この住人のその欄を全体から作り直す' : '全体のその欄をこの住人から作り直す') +
      '<div id="vs-pv"></div>' +
      '<div class="row" style="margin-top:10px;gap:8px"><button type="button" class="btn primary" data-dact="run">写す</button><button type="button" class="btn ghost" data-dact="close">やめる</button></div>';
    openDlg(title, body, function (act) {
      if (act === 'close') { closeDlg(); return; }
      if (act !== 'run') return;
      var mode = radio('vs-mode') || 'add';
      if (!pv()) { toast('写せるものがありません'); return; }
      if (!window.confirm(title + '：' + (mode === 'rep' ? '置き換えます。今の' + (dir === 'g2c' ? c.name + 'の' : '全体の') + 'その欄の内容は消えます（元に戻せません）。' : '足します（今の内容は残します）。') + '\nよろしいですか？')) return;
      chosen(ps).forEach(function (p) { p[fn](c, mode, false); });
      closeDlg();
      after([c]);
      toast(dir === 'g2c' ? '全体の設定を' + c.name + 'へ写しました' : c.name + 'の設定を全体の既定に入れました。次に箱庭を動かしたときから効きます');
    }, function (ev) { if (ev.target.name === 'vs-mode' || ev.target.name === 'vs-what') pv(); });
    pv();
  }

  /* ---------- 文字列 ---------- */
  function packChar(c) {
    var d = {};
    keysOf(VS.parts.filter(function (p) { return p.keys; })).forEach(function (k) { if (filled(c[k])) d[k] = clone(c[k]); });
    return JSON.stringify({ hakoniwaVoice: 1, scope: 'char', name: c.name, data: d });
  }
  function packAll() { var m = HK.Adv && HK.Adv.snap ? HK.Adv.snap() : null; return JSON.stringify({ hakoniwaVoice: 1, scope: 'all', adv: m || {} }); }
  /* 貼り付けた文字列 → { scope, data|adv } か、読めなければ理由の文字列 */
  function unpack(text) {
    var o;
    try { o = JSON.parse(String(text || '').trim()); } catch (e) { return '読めませんでした（書き出した文字列をそのまま貼り付けてください）'; }
    if (!o || typeof o !== 'object') return '読めませんでした';
    if (o.hakoniwaVoice && o.scope === 'char' && o.data && typeof o.data === 'object') return { scope: 'char', data: o.data, name: o.name };
    if (o.hakoniwaVoice && o.scope === 'all' && o.adv && typeof o.adv === 'object') return { scope: 'all', adv: o.adv };
    /* 住人の JSON（1人・全員）：最初の住人の欄（全員の JSON の adv があれば全体として読む） */
    if (o.format === 'hakoniwa-residents' && Array.isArray(o.chars)) return { scope: 'char', data: o.chars[0] || {}, name: (o.chars[0] || {}).name, adv: o.adv || null };
    return VS.LABEL + 'の文字列ではありません';
  }
  function norm1(data) {
    var tmp = Object.assign({}, data, { id: '', name: '仮', eg: { CP: 10, NP: 10, A: 10, FC: 10, AC: 10 } });
    try { return UI.normState({ chars: [tmp], ties: [] }).chars[0]; } catch (e) { return null; }
  }
  function ioDlg(c) {
    var ps = c ? VS.parts.filter(function (p) { return p.keys; }) : [];
    var body = '<p class="gearhint">' + (c ? esc(c.name) + 'の' + esc(names(ps)) + 'の設定' : '全体の設定（' + esc(names(VS.parts)) + '）') + 'を文字列にします。コピーして、別の端末やほかの人の箱庭の同じ節で「読み込む」に貼り付けてください。' + (c ? '名前の読み・敬語で話す相手は入りません。' : '') + '</p>' +
      '<textarea id="vs-out" rows="4" readonly aria-label="書き出した文字列">' + esc(c ? packChar(c) : packAll()) + '</textarea>' +
      '<div class="row" style="margin:6px 0 14px;gap:8px"><button type="button" class="btn small" data-dact="copy">コピーする</button></div>' +
      '<p class="gearhint"><b>読み込む</b>：書き出した文字列（または住人の JSON）を貼り付けて、' + (c ? esc(c.name) + 'に' : '全体に') + '入れます。</p>' +
      '<textarea id="vs-in" rows="4" aria-label="読み込む文字列" placeholder="ここに貼り付け"></textarea>' +
      whatRow(ps) + modeRow('今の設定に足す（空の欄だけ埋め、辞書は後ろに足す）', '今の設定を消して、文字列の内容にする') +
      '<div class="row" style="margin-top:8px;gap:8px"><button type="button" class="btn primary" data-dact="load">読み込む</button><button type="button" class="btn ghost" data-dact="close">閉じる</button></div>';
    openDlg(c ? c.name + 'の設定を文字列で' : '全体の設定を文字列で', body, function (act) {
      if (act === 'close') { closeDlg(); return; }
      if (act === 'copy') {
        var ta = q('#vs-out'), txt = ta.value, fb = function () { ta.focus(); ta.select(); try { ta.setSelectionRange(0, txt.length); } catch (e) { /* 古い環境 */ } var ok = false; try { ok = document.execCommand('copy'); } catch (e) { ok = false; } toast(ok ? 'コピーしました' : '文字列を選択しました。コピーしてください'); };
        if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(txt).then(function () { toast('コピーしました'); }, fb); else fb();
        return;
      }
      if (act !== 'load') return;
      var r = unpack(q('#vs-in').value), mode = radio('vs-mode') || 'add';
      if (typeof r === 'string') { toast(r); return; }
      if (!c) {
        var adv = r.adv;
        if (!adv) { toast('これは住人の設定の文字列です。上の「対象」でその住人を選んでから読み込んでください'); return; }
        var A0 = HK.Adv, ids = (A0 ? A0.secs : []).map(function (s) { return s.id; }).filter(function (k) { return typeof adv[k] === 'string'; });
        if (!ids.length) { toast('この文字列には、この版で読める全体の設定がありません'); return; }
        if (!window.confirm('全体の設定に' + (mode === 'rep' ? '読み込んで置き換えます。今の全体の設定は消えます（元に戻せません）。' : '足します（今の内容は残し、空の欄だけ埋めて、辞書は後ろに足します）。') + '\nよろしいですか？')) return;
        A0.secs.forEach(function (s) {
          var inc = typeof adv[s.id] === 'string' ? adv[s.id].slice(0, 20000) : '', cur0 = A0.get(s.id);
          if (mode === 'rep') { if (inc !== cur0) A0.set(s.id, inc, true); return; }
          if (!inc) return;
          if (!cur0) { A0.set(s.id, inc, true); return; }
          var mg = null; VS.parts.forEach(function (p) { if (mg == null && p.mergeAdv) mg = p.mergeAdv(s.id, cur0, inc); });
          A0.set(s.id, mg != null ? mg : s.html ? cur0 : (cur0.replace(/\s+$/, '') + '\n' + inc).slice(0, 20000), true);
        });
        closeDlg(); VS.refresh();
        toast('全体の設定を読み込みました。次に箱庭を動かしたときから効きます');
        return;
      }
      if (r.scope !== 'char') { toast('これは全体の設定の文字列です。上の「対象」を「全体」にしてから読み込んでください'); return; }
      var nc = norm1(r.data);
      if (!nc) { toast('読めませんでした'); return; }
      var use = chosen(ps);
      if (!window.confirm(c.name + 'の' + names(use) + 'の設定に、' + (r.name ? '「' + r.name + '」の' : '') + '文字列の内容を' + (mode === 'rep' ? '読み込んで置き換えます。今の設定は消えます（元に戻せません）。' : '足します（決めている欄は残し、空の欄だけ埋めて、辞書は後ろに足します）。') + '\nよろしいですか？')) return;
      var keys = keysOf(use).filter(function (k) { return mode === 'rep' || Object.prototype.hasOwnProperty.call(r.data, k); });
      putKeys(nc, c, keys, mode);
      closeDlg(); after([c]);
      toast(c.name + 'の設定を読み込みました');
    });
  }

  /* ---------- 初期化 ---------- */
  function resetDlg(c) {
    var ps = VS.parts.filter(function (p) { return p.resetKeys; });
    var body = '<p class="gearhint">' + esc(c.name) + 'だけの、選んだ欄を空に戻します（口調はおまかせ、辞書は空）。ほかの住人・全体の設定・名前の読み・⚙設定の欄はそのままです。</p>' +
      '<div class="gearrow">' + ps.map(function (p) { return '<label><input type="checkbox" data-rp="' + esc(p.id) + '" checked> ' + esc(p.label) + '</label>'; }).join('') + '</div>' +
      '<div class="row" style="margin-top:10px;gap:8px"><button type="button" class="btn primary" data-dact="run">初期化する</button><button type="button" class="btn ghost" data-dact="close">やめる</button></div>';
    openDlg(c.name + 'の設定を初期化', body, function (act) {
      if (act === 'close') { closeDlg(); return; }
      if (act !== 'run') return;
      var use = ps.filter(function (p) { var x = q('[data-rp="' + p.id + '"]'); return x && x.checked; });
      if (!use.length) { toast('初期化する欄を選んでください'); return; }
      if (!window.confirm(c.name + 'の' + names(use) + 'の設定を初期化します。書いた辞書も消えます（元に戻せません）。\nよろしいですか？')) return;
      use.forEach(function (p) { p.resetKeys.forEach(function (k) { if (k === 'keigo') c.keigo = {}; else clear(c, k); }); });
      closeDlg(); after([c]);
      toast(c.name + 'の' + names(use) + 'の設定を初期化しました');
    });
  }

  VS.onTool = function (act, c) {
    if (act === 'copy') copyDlg(c);
    else if (act === 'io') ioDlg(c);
    else if (c && (act === 'g2c' || act === 'c2g')) convDlg(c, act);
    else if (c && act === 'reset') resetDlg(c);
  };
  /* 点検・試験から（画面と同じ関数） */
  VS._t = { putKeys: putKeys, packChar: packChar, packAll: packAll, unpack: unpack, norm1: norm1 };
  /* ui.js が先に描いた住人タブに、この節を入れ直す */
  if (UI.refresh) UI.refresh();
})();
