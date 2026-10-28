/* 箱庭シミュレーター: 箱庭カードの「出来事の一覧」（TIPS の隣のボタン → 窓に、関係ごと・種類ごと・内容・R18：夜 の表と一覧）
   ・データは js/event-catalog.js（HK.EVENT_CATALOG。build のたびに hakoniwa-tools/build/event-catalog.js が作り直す）。数え方は docs/reports/2026-10-28/event-catalog.md
     データは族のかたまり pack-catalog に入れてあり（late には入れない。起動時に読む量を増やさないため）、ボタンを押したときに HK.Load.ensure で読む。
     読み込み中は窓に「読み込んでいます」を出し、読めたら表に差し替える。読めなければ「一覧を読み込めませんでした」
   ・ボタンは HK.Tips.scenBtn を包んで、TIPS のボタンの後ろに足す（late のかたまり。カードは late を読んだあと描き直される。データが無くても出す）
   ・全年齢モード（HK.SAFE_ON）では R18 だけの出来事（r）を数えず、「R18：夜」のタブと R18 の内容の軸を出さない（全年齢版のデータにはもともと無い）
   ・窓は TIPS と同じ部品（gearov・gearbox）。表は狭い幅では列を詰め、横にはみ出さない
   ・画面に出すのは利用者向けの言葉だけ（表示名・種類・条件）。出来事の id・出どころのファイル・関係の判定の方法などの作り手向けの情報は出さない
     （それらは docs/reports/2026-10-28/event-catalog.md に残す。2026-10-28 の利用者の指示）。行を押すと、その行の出来事の一覧（表示名と条件）が開く
   両方のビルドに同じファイルを置く */
(function () {
  'use strict';
  var HK = window.HK;
  if (!HK || !HK.Tips || typeof document === 'undefined' || !document.createElement) return;
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function C() { return HK.EVENT_CATALOG || null; }
  function scenOf(id) { var c = C(); return c && c.scen ? c.scen[id] : null; }
  function safe() { return !!HK.SAFE_ON; }
  /* 表示する出来事（全年齢モードでは R18 だけのものを外す） */
  function evsOf(id) {
    var c = C(), s = scenOf(id);
    if (!s) return [];
    return s.ev.map(function (i) { return c.ev[i]; }).filter(function (e) { return e && !(safe() && e.r); });
  }
  function tieName(k) { var c = C(), l = (c && c.ties) || []; for (var i = 0; i < l.length; i++) if (l[i][0] === k) return l[i][1]; return k; }
  function catName(k) { var c = C(); return k ? ((c && c.cats && c.cats[k]) || k) : 'そのほか'; }
  /* 表示名（全件に付けてある。無いものは一覧に出さない） */
  function nm(e) { return String(e.n || '').replace(/\{a\}/g, 'Ａ').replace(/\{b\}/g, 'Ｂ').replace(/\{c\}/g, 'Ｃ'); }
  function named(l) { return l.filter(function (e) { return !!e.n; }); }
  /* 条件の語を利用者向けに */
  function condText(x) { return x === '重い' ? '展開が重いとき' : x; }
  var AX = [['death', '死ネタ'], ['cruel', '残酷な展開']];
  /* R18 の軸・条件の語（全年齢モードでは外す）と、「R18：夜」の注記 */
  var R18C = null, NIGHT_NOTE = '';
  /* r18:begin */
  AX.push(['force', '合意のない展開', 1], ['preg', '妊娠', 1], ['violence', '暴力をともなう性描写', 1], ['abuse', '歪んだ関係（DV など）', 1]);
  R18C = /^(合意のない展開|妊娠|暴力をともなう性描写|歪んだ関係（DV など）|受け攻め|性欲)$/;
  NIGHT_NOTE = '相手の下に書いたのは、その夜が起きる条件（内容のスイッチ・展開の重さ・環境値・関係・受け攻め・性欲）です。条件の書いていない夜も、恋愛対象・受け攻め・描写の設定・「R18に参加しない」などの決まりには従います。';
  /* r18:end */
  var ST = { yes: 'ある', cond: '条件つき', no: 'ない' };
  var CHUNK = 'pack-catalog';
  function info(id) { return HK.Load && HK.Load.info ? HK.Load.info(id) : (HK.SCENARIOS || {})[id]; }

  /* ---------- ボタン ---------- */
  function btn(id) {
    var s = info(id);
    if (!s) return '';
    return '<button type="button" class="tipscen evcbtn" data-evcat="' + esc(id) + '" aria-label="' + esc(s && s.name ? s.name : id) + 'の出来事の一覧"><span class="q" aria-hidden="true">≡</span>出来事の一覧</button>';
  }
  if (HK.wrap) HK.wrap(HK.Tips, 'scenBtn', function (f0) { return function (id) { return (f0 ? f0.apply(this, arguments) : '') + btn(id); }; });

  /* ---------- 窓の中身 ---------- */
  /* 行を押すと開く一覧：表示名と、利用者に意味のある印（種類・夜・モブ・条件・関係）だけ */
  function list(l) {
    l = named(l);
    if (!l.length) return '<p class="evcnone">該当する出来事はありません。</p>';
    return '<ul class="evclist">' + l.map(function (e) {
      var cs = [catName(e.k)].concat(!safe() && e.x ? ['夜（R18）'] : [], e.mo ? ['モブ'] : [],
        (e.c || []).filter(function (x) { return !(safe() && R18C && R18C.test(x)); }).map(condText), (e.t || []).map(function (k) { return '関係：' + tieName(k); }));
      return '<li><span class="evcn">' + esc(nm(e)) + '</span>' + '<span class="evcc">' + cs.map(function (x) { return '<span>' + esc(x) + '</span>'; }).join('') + '</span></li>';
    }).join('') + '</ul>';
  }
  /* 行（押すと一覧が開く）。列：見出し・件数・主な出来事（表示名を 4 件まで） */
  function table(head, rows, key) {
    if (!rows.length) return '<p class="evcnone">該当する出来事はありません。</p>';
    return '<table class="evct"><thead><tr><th scope="col">' + esc(head) + '</th><th scope="col" class="num">件数</th><th scope="col" class="evcmain">主な出来事</th></tr></thead><tbody>' +
      rows.map(function (r, i) {
        var rid = key + i, ns = named(r.l);
        return '<tr class="evcrow" data-evrow="' + rid + '" tabindex="0" aria-expanded="false" aria-controls="evcd-' + rid + '"><th scope="row">' + esc(r.h) + (r.sub ? '<span class="evcsub">' + esc(r.sub) + '</span>' : '') + '</th><td class="num">' + r.l.length + '</td>' +
          '<td class="evcmain">' + ns.slice(0, 4).map(function (e) { return esc(nm(e)); }).join('／') + (ns.length > 4 ? ' ほか' : '') + '</td></tr>' +
          '<tr class="evcdet" id="evcd-' + rid + '" hidden><td colspan="3">' + list(r.l) + '</td></tr>';
      }).join('') + '</tbody></table>';
  }
  function byTie(ev) {
    var c = C(), g = {}, rows = [];
    ev.forEach(function (e) { (e.t && e.t.length ? e.t : ['-']).forEach(function (k) { (g[k] = g[k] || []).push(e); }); });
    (c.ties || []).forEach(function (t) { if (g[t[0]]) rows.push({ h: t[1], l: g[t[0]] }); });
    if (g['-']) rows.push({ h: '関係を問わない', l: g['-'] });
    return rows;
  }
  function byCat(ev) {
    var g = {}, ks = [];
    ev.forEach(function (e) { var k = e.k || ''; if (!g[k]) { g[k] = []; ks.push(k); } g[k].push(e); });
    ks.sort(function (a, b) { return g[b].length - g[a].length || (a < b ? -1 : 1); });
    var rows = ks.map(function (k) { return { h: catName(k), l: g[k] }; });
    if (!safe()) { var n = ev.filter(function (e) { return e.x; }); if (n.length) rows.push({ h: '夜（R18）', sub: '上の種類と重なります', l: n }); }
    return rows;
  }
  function byNight(ev) {
    var g = {}, ks = [];
    ev.filter(function (e) { return e.x; }).forEach(function (e) {
      var cs = (e.c || []).map(condText).concat((e.t || []).map(function (k) { return '関係：' + tieName(k); })), k = (e.mo ? 'モブ' : '住人どうし') + '\n' + (cs.join('・') || '特別な条件なし');
      if (!g[k]) { g[k] = []; ks.push(k); }
      g[k].push(e);
    });
    ks.sort(function (a, b) { var ma = /^モブ/.test(a) ? 1 : 0, mb = /^モブ/.test(b) ? 1 : 0; return ma - mb || g[b].length - g[a].length || (a < b ? -1 : 1); });
    return ks.map(function (k) { var p = k.split('\n'); return { h: p[0], sub: p[1], l: g[k] }; });
  }
  function axes(id) {
    var s = scenOf(id), ev = evsOf(id), A = (s && s.ax) || {};
    var rows = AX.filter(function (a) { return !(a[2] && safe()) && A[a[0]]; });
    if (!rows.length) return '<p class="evcnone">この版では数えていません。</p>';
    return '<table class="evct evcax"><thead><tr><th scope="col">内容</th><th scope="col">この箱庭</th><th scope="col" class="num">件数</th></tr></thead><tbody>' + rows.map(function (a, i) {
      var o0 = A[a[0]], l = ev.filter(function (e) { return (e.a || []).indexOf(a[0]) >= 0; });
      /* 全年齢モードで R18 だけの出来事を外して件数が変わったら、状態と注記は外したあとの出来事から作り直す */
      var o = o0.n === l.length ? o0 : { s: !l.length ? 'no' : l.every(function (e) { return (e.c || []).indexOf('重い') >= 0; }) ? 'cond' : 'yes', n: l.length };
      var rid = 'x' + i;
      return '<tr class="evcrow" data-evrow="' + rid + '" tabindex="0" aria-expanded="false" aria-controls="evcd-' + rid + '"><th scope="row">' + esc(a[1]) + '</th><td>' + esc(l.length ? (ST[o.s] || '') : 'ない') + (o.t ? '<span class="evcsub">' + esc(o.t) + '</span>' : '') + '</td><td class="num">' + l.length + '</td></tr>' +
        '<tr class="evcdet" id="evcd-' + rid + '" hidden><td colspan="3">' + list(l) + '</td></tr>';
    }).join('') + '</tbody></table><p class="evcnote">「条件つき」は、内容のスイッチ・展開の重さ（重い）が要る出来事だけのとき。死ネタ・残酷は、展開の重さ・死ネタの重さで起こりやすさが変わります（穏やかでも起きないわけではありません）。</p>';
  }
  function body(id) {
    var s = scenOf(id), ev = evsOf(id), tied = ev.filter(function (e) { return e.t && e.t.length; }).length;
    var night = safe() ? [] : ev.filter(function (e) { return e.x; }), mob = night.filter(function (e) { return e.mo; }).length;
    var tabs = [['tie', '関係ごと'], ['cat', '種類ごと'], ['ax', '内容']];
    if (!safe() && C().build !== 'zenrei' && NIGHT_NOTE) tabs.push(['night', '夜（R18）']);
    var h = '<p class="tiplead">出来事 ' + ev.length + ' 件（関係が条件 ' + tied + ' 件・関係を問わない ' + (ev.length - tied) + ' 件）' + (night.length ? '。夜（R18）' + night.length + ' 件（うちモブ相手 ' + mob + ' 件）' : '') + '。行を押すと、その出来事の一覧が開きます。</p>';
    h += '<div class="evctabs" role="tablist">' + tabs.map(function (t, i) { return '<button type="button" role="tab" class="evctab" data-evtab="' + t[0] + '" aria-selected="' + (i ? 'false' : 'true') + '" aria-controls="evcp-' + t[0] + '" id="evct-' + t[0] + '">' + esc(t[1]) + '</button>'; }).join('') + '</div>';
    var P = {
      tie: table('関係', byTie(ev), 't'),
      cat: table('種類', byCat(ev), 'k'),
      ax: axes(id),
      night: table('相手', byNight(ev), 'n') + (night.length ? '<p class="evcnote">' + esc(NIGHT_NOTE) + '</p>' : '')
    };
    tabs.forEach(function (t, i) { h += '<div class="evcpane" role="tabpanel" id="evcp-' + t[0] + '" aria-labelledby="evct-' + t[0] + '"' + (i ? ' hidden' : '') + '>' + P[t[0]] + '</div>'; });
    /* 組み合わせや表から選ばれる場面（種類の数だけ） */
    if (s.tables && s.tables.length) h += '<div class="gearsec"><h3>このほかに選ばれる場面</h3><ul class="tipul">' + s.tables.map(function (t) { return '<li>' + esc(t.n) + '：' + t.c + (t.p ? ' 組' : ' 種類') + '</li>'; }).join('') + '</ul></div>';
    h += '<div class="gearsec"><ul class="tipul evcfoot"><li>数は出来事の種類の数で、文の本数ではありません。同じ出来事でも、起きるかどうかは住人の気質・関係・設定しだいです。</li>' +
      '<li>「関係を問わない」出来事も、関係のある二人のあいだで起きることがあります。</li>' +
      (s.story ? '<li>この箱庭は物語型です。筋書きの中で起きる主な場面と、場面の材料になる組み合わせを載せています。</li>' : '<li>どの箱庭にもある出来事と、この箱庭だけの出来事・ハプニングを載せています。</li>') +
      (s.tables && s.tables.some(function (t) { return t.p; }) ? '<li>職業の組み合わせで起きる出来事は、組の数だけを載せています。</li>' : '') + '</ul></div>';
    return h;
  }

  /* ---------- 見た目 ---------- */
  var css = '.evcbtn{margin-left:6px}' +
    '.evctabs{display:flex;flex-wrap:wrap;gap:6px;margin:12px 0 10px}' +
    '.evctab{appearance:none;-webkit-appearance:none;font:inherit;font-size:13px;padding:5px 12px;border:1px solid var(--line);border-radius:999px;background:var(--surface);color:var(--muted);cursor:pointer}' +
    '.evctab[aria-selected="true"]{color:var(--accent-ink,#fff);background:var(--accent);border-color:var(--accent)}' +
    '.evct{width:100%;border-collapse:collapse;font-size:13px;table-layout:fixed}' +
    '.evct th,.evct td{text-align:left;padding:6px 6px;border-bottom:1px solid var(--line);vertical-align:top;overflow-wrap:anywhere}' +
    '.evct thead th{font-size:11.5px;color:var(--muted);font-weight:600}' +
    '.evct th[scope="row"]{font-weight:600;width:34%}.evct .num{width:4.2em;text-align:right;font-variant-numeric:tabular-nums}' +
    '.evcax th[scope="row"]{width:30%}' +
    '.evcrow{cursor:pointer}.evcrow:hover th,.evcrow:hover td,.evcrow:focus-visible th{color:var(--accent)}.evcrow[aria-expanded="true"] th{color:var(--accent)}' +
    '.evcmain{color:var(--muted);font-size:12px}' +
    '.evcsub{display:block;font-weight:400;font-size:11px;color:var(--muted);margin-top:2px}' +
    '.evcdet>td{background:color-mix(in srgb,var(--ink) 4%,transparent);padding:4px 8px}' +
    '.evclist{list-style:none;margin:0;padding:0;font-size:12.5px;line-height:1.6}.evclist li{padding:5px 0;border-bottom:1px dashed var(--line)}.evclist li:last-child{border-bottom:0}' +
    '.evcn{font-weight:600}' +
    '.evcc{display:flex;flex-wrap:wrap;gap:4px;margin-top:2px}.evcc span{font-size:11px;padding:0 6px;border:1px solid var(--line);border-radius:4px;color:var(--muted)}' +
    '.evcnote,.evcnone{font-size:12px;color:var(--muted);margin:8px 0 0}.evcfoot{font-size:12px}.evcwait{color:var(--muted)}' +
    '@media (max-width:560px){.evct th[scope="row"]{width:30%}.evct .num{width:3.2em}.evctab{font-size:12.5px;padding:5px 10px}}';
  var st = document.createElement('style'); st.textContent = css; (document.head || document.documentElement).appendChild(st);

  /* ---------- 窓 ---------- */
  var ov = null, opener = null;
  function close() {
    if (!ov) return;
    ov.remove(); ov = null;
    document.removeEventListener('keydown', onKey, true);
    if (opener && opener.focus) try { opener.focus(); } catch (e) { }
    opener = null;
  }
  function onKey(e) {
    if (e.key === 'Escape') { e.stopPropagation(); close(); return; }
    var r = e.target && e.target.closest && e.target.closest('[data-evrow]');
    if (r && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); toggle(r); }
  }
  function toggle(r) {
    var d = ov && ov.querySelector('#evcd-' + r.getAttribute('data-evrow'));
    if (!d) return;
    var open = d.hidden;
    d.hidden = !open;
    r.setAttribute('aria-expanded', open ? 'true' : 'false');
  }
  /* 窓の本文：データがあれば表、無ければ読み込み中（読み終わったら差し替える）・失敗の表示 */
  function fill(id, mine) {
    if (!ov || ov !== mine) return;
    var b = ov.querySelector('.evcbody');
    if (!b) return;
    b.removeAttribute('aria-busy');
    b.innerHTML = scenOf(id) ? body(id) : '<p class="tiplead">この箱庭の出来事の一覧はありません。</p>';
  }
  function failed(e, mine, id) {
    if (!ov || ov !== mine) return;
    var b = ov.querySelector('.evcbody');
    if (!b) return;
    b.removeAttribute('aria-busy');
    b.innerHTML = '<p class="tiplead">一覧を読み込めませんでした' + (e && HK.Load && HK.Load.errText ? '（' + esc(HK.Load.errText(e)) + '）' : '') + '。</p><p><button type="button" class="btn small" data-evretry="' + esc(id) + '">もう一度</button></p>';
  }
  function load(id) {
    var mine = ov;
    if (C()) { fill(id, mine); return; }
    var p;
    try { p = HK.Load && HK.Load.ensure ? HK.Load.ensure(CHUNK) : null; } catch (e) { p = null; }
    if (!p || typeof p.then !== 'function') { if (C()) fill(id, mine); else failed(null, mine, id); return; }
    p.then(function () { if (C()) fill(id, mine); else failed(null, mine, id); }, function (e) { failed(e, mine, id); });
  }
  function open(id, from) {
    var sc = info(id);
    if (!sc && !scenOf(id)) return;
    close();
    opener = from || document.activeElement;
    ov = document.createElement('div');
    ov.className = 'gearov tipov evcov';
    ov.innerHTML = '<div class="gearbox" role="dialog" aria-modal="true" aria-labelledby="evctitle" tabindex="-1"><div class="gearhd"><h2 id="evctitle">' + esc((sc && sc.name) || (scenOf(id) || {}).name || id) + ' の出来事の一覧</h2><button type="button" class="btn small" data-evclose="1">閉じる</button></div>' +
      '<div class="evcbody" aria-live="polite"' + (C() ? '>' : ' aria-busy="true"><p class="tiplead evcwait">出来事の一覧を読み込んでいます…</p>') + '</div></div>';
    ov.addEventListener('click', function (e) {
      var t = e.target;
      if (t === ov || (t.closest && t.closest('[data-evclose]'))) { close(); return; }
      var tb = t.closest && t.closest('[data-evtab]');
      if (tb) {
        var k = tb.getAttribute('data-evtab');
        Array.prototype.forEach.call(ov.querySelectorAll('[data-evtab]'), function (b) { b.setAttribute('aria-selected', b === tb ? 'true' : 'false'); });
        Array.prototype.forEach.call(ov.querySelectorAll('.evcpane'), function (p) { p.hidden = p.id !== 'evcp-' + k; });
        return;
      }
      var r = t.closest && t.closest('[data-evrow]');
      if (r) { toggle(r); return; }
      var rt = t.closest && t.closest('[data-evretry]');
      if (rt) { var b = ov.querySelector('.evcbody'); if (b) { b.setAttribute('aria-busy', 'true'); b.innerHTML = '<p class="tiplead evcwait">出来事の一覧を読み込んでいます…</p>'; } load(rt.getAttribute('data-evretry')); }
    });
    document.body.appendChild(ov);
    document.addEventListener('keydown', onKey, true);
    var bx = ov.querySelector('.gearbox'); if (bx) bx.focus();
    load(id);
  }
  document.addEventListener('click', function (e) {
    var b = e.target.closest && e.target.closest('[data-evcat]');
    if (!b) return;
    e.preventDefault(); e.stopPropagation();
    open(b.getAttribute('data-evcat'), b);
  }, true);
  HK.EvCatalog = { open: open, close: close, btn: btn };
})();
