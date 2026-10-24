/* 箱庭テキスト工房：画面
   データの流れ
   ・/api/index … 構文解析で拾った文の群（ファイル・位置・パス・候補）
   ・iframe（/sb/<ビルド>/index.html）… ビルドの js を個々に読み込んだ試し実行用のページ。window.STUDIO で箱庭を回す
   ・試し実行の記録（言い換え前の文）を、群の候補と突き合わせて「どの文が出たか」を数える */
(function () {
  'use strict';
  var $ = function (s, el) { return (el || document).querySelector(s); };
  var $$ = function (s, el) { return Array.prototype.slice.call((el || document).querySelectorAll(s)); };
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function api(p, body) {
    return fetch(p, body ? { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) } : {})
      .then(function (r) { var ct = r.headers.get('content-type') || ''; return (/json/.test(ct) ? r.json() : r.text()).then(function (d) { if (!r.ok) throw new Error(d && d.error || r.statusText); return d; }); });
  }
  function toast(msg, ms) { var t = $('#toast'); t.textContent = msg; t.hidden = false; clearTimeout(toast._t); toast._t = setTimeout(function () { t.hidden = true; }, ms || 3200); }
  function status(msg) { $('#status').textContent = msg; }

  var PERSONA_KEYS = ['proud', 'stern', 'tsun', 'gentle', 'devoted', 'cool', 'free', 'shy', 'polite'];
  var JA = /[぀-ヿ㐀-鿿]/g;
  function jaN(s) { return (s.match(JA) || []).length; }

  var S = {
    builds: [], b: 0, mode: 'r18', files: [], groups: [], byFile: {}, src: {}, info: null, sb: null,
    toneKeys: {}, scenIds: {}, cov: {}, tab: 'home', dirty: false, sel: { scen: '', tone: '', table: '' }
  };

  /* ---------- 読み込み ---------- */
  function loadBuilds() {
    return api('/api/builds').then(function (d) {
      S.builds = d.builds; S.scenIdList = d.scenIds;
      d.scenIds.forEach(function (id) { S.scenIds[id] = 1; });
      $('#build').innerHTML = d.builds.map(function (b) { return '<option value="' + b.id + '">' + esc(b.name) + (b.safe ? '（全年齢版）' : '') + '</option>'; }).join('');
      $('#build').value = S.b;
    });
  }
  function curBuild() { return S.builds[S.b]; }
  function loadIndex(file) {
    status(file ? '読み直し中…' : '文を読み込み中…');
    return api('/api/index?b=' + S.b + (file ? '&f=' + encodeURIComponent(file) : '')).then(function (d) {
      if (file) {
        var nf = d.files[0];
        var i = S.files.findIndex(function (f) { return f.f === file; });
        if (nf && i >= 0) S.files[i] = nf;
        delete S.src[file];
      } else { S.files = d.files; S.src = {}; }
      rebuildGroups();
      status('群 ' + S.groups.length.toLocaleString() + '・文 ' + S.nItems.toLocaleString());
    });
  }
  function rebuildGroups() {
    var gs = [], n = 0;
    S.byFile = {};
    S.files.forEach(function (f, fi) {
      S.byFile[f.f] = f;
      f.groups.forEach(function (g, gi) {
        g.gid = fi + ':' + gi; g.file = f; n += g.items.length;
        tagGroup(g);
        gs.push(g);
      });
    });
    S.groups = gs; S.nItems = n;
    S.gmap = {}; gs.forEach(function (g) { S.gmap[g.gid] = g; });
    buildMatcher();
  }
  function tagGroup(g) {
    var segs = g.path.split('.');
    var tones = [], scens = [];
    segs.forEach(function (s) {
      var k = s.replace(/^#/, '').replace(/\(.*$/, '');
      if (S.toneKeys[k] || PERSONA_KEYS.indexOf(k) >= 0) tones.push(k);
      var m = s.match(/^(?:addMini|addInc\w*)\((\w+)\)$/); if (m && S.scenIds[m[1]]) scens.push(m[1]);
      if (S.scenIds[k]) scens.push(k);
    });
    if (g.kind === 'tsv') g.items.forEach(function (it) { var k = it.cols[0]; if (S.toneKeys[k] && tones.indexOf(k) < 0) tones.push(k); });
    g.tones = tones;
    g.scens = scens.length ? scens : g.file.scen.filter(function (id) { return S.scenIds[id]; });
    g.scens = g.scens.filter(function (id, k, a) { return a.indexOf(id) === k; });
    g.r18 = !!g.file.only && !curBuild().safe;
  }
  function loadSandbox() {
    S.sb = null;
    status('試し実行のページを準備中…');
    var fr = $('#sandbox');
    fr.src = '/sb/' + S.b + '/index.html?r=' + Date.now() + '#' + (curBuild().safe ? 'safe' : S.mode);
    S.sbPromise = new Promise(function (ok) { S._sbReady = ok; });
    return S.sbPromise;
  }
  window.onSandboxReady = function (st) {
    S.sb = st;
    S.info = st.info();
    S.toneKeys = {}; S.info.tones.forEach(function (t) { S.toneKeys[t.key] = t; });
    S.info.personas.forEach(function (p) { if (!S.toneKeys[p.key]) S.toneKeys[p.key] = p; });
    S.scenById = {}; S.info.scens.forEach(function (s) { S.scenById[s.id] = s; });
    /* 箱庭の id は、実際に読み込まれた箱庭（HK.SCEN_ORDER）から取る */
    S.scenIds = {}; S.info.scens.forEach(function (s) { S.scenIds[s.id] = 1; });
    if (S.files.length) S.groups.forEach(tagGroup);
    if (S._sbReady) S._sbReady();
  };
  function reloadSandbox() { return loadSandbox().then(function () { status('試し実行のページを読み直しました'); }); }

  function srcOf(f) {
    if (S.src[f]) return Promise.resolve(S.src[f]);
    return api('/api/source?b=' + S.b + '&f=' + encodeURIComponent(f)).then(function (t) { S.src[f] = t; return t; });
  }

  /* ---------- 文の突き合わせ：記録の文（言い換え前）→ 群の候補 ---------- */
  function keyOf(text) {
    var parts = text.split(/\{[a-z0-9_]+\}|〈[^〉]*〉|〔[^〕]*〕|\n/);
    var best = '', bn = 0;
    parts.forEach(function (p) { p = p.trim(); var n = jaN(p); if (n > bn) { bn = n; best = p; } });
    return bn >= 3 ? best : '';
  }
  function buildMatcher() {
    var M = new Map();
    S.groups.forEach(function (g) {
      if (g.role === 'ui' || g.role === 'code') return;
      g.items.forEach(function (it, ii) {
        var texts = it.cols ? it.cols.slice(it.cols.length > 2 && S.toneKeys[it.cols[0]] ? 1 : 0) : [it.text];
        texts.forEach(function (t) {
          var k = keyOf(t); if (!k || k.length < 3) return;
          var h = k.slice(0, 3), L = M.get(h);
          if (!L) { L = []; M.set(h, L); }
          /* 短い手がかり（8字未満）は、台詞や文の区切りに挟まれているときだけ一致にする */
          L.push({ k: k, g: g, i: ii, short: k.length < 8 });
        });
      });
    });
    S.matcher = M;
  }
  var BOUND = /[\^「」『』。！？!?…\s　（）]/, BOUND_E = /[$」』。！？!?…\s　（）、]/;
  /* 文の中に出てくる候補（長い一致を先に） */
  function matchText(T) {
    var out = [], seen = {};
    if (!T || typeof T !== 'string') return out;
    for (var i = 0; i + 3 <= T.length; i++) {
      var L = S.matcher.get(T.substr(i, 3)); if (!L) continue;
      for (var j = 0; j < L.length; j++) {
        var x = L[j];
        if (!T.startsWith(x.k, i)) continue;
        if (x.short && !(BOUND.test(T.charAt(i - 1) || '^') && BOUND_E.test(T.charAt(i + x.k.length) || '$'))) continue;
        var id = x.g.gid + '/' + x.i; if (!seen[id]) { seen[id] = 1; out.push(x); }
      }
    }
    out.sort(function (a, b) { return b.k.length - a.k.length; });
    /* 長い一致に含まれる短い一致は落とす */
    var keep = [];
    out.forEach(function (x) { if (!keep.some(function (y) { return y.k.length > x.k.length + 2 && y.k.indexOf(x.k) >= 0; })) keep.push(x); });
    return keep;
  }

  /* ---------- 表示の部品 ---------- */
  function fmtText(t) {
    return esc(t).replace(/\{([a-z0-9_]+)\}/g, '<span class="ph">{$1}</span>').replace(/〔([^〕]*)〕/g, '<span class="ex">〔$1〕</span>').replace(/〈([^〉]*)〉/g, '<span class="ph">〈$1〉</span>');
  }
  function itemText(it) { return it.cols ? it.cols.join('  ｜  ') : it.text; }
  function tagsHtml(g) {
    var h = '';
    if (g.r18) h += '<span class="tag r18">R18専用</span>';
    if (g.ev) h += '<span class="tag ev">イベント ' + esc(g.ev) + '</span>';
    if (g.tones.length > 6) h += '<span class="tag tone">口調 ' + g.tones.length + '種</span>';
    else g.tones.forEach(function (t) { h += '<span class="tag tone">' + esc(S.toneKeys[t] ? S.toneKeys[t].label : t) + '</span>'; });
    if (g.role !== 'text') h += '<span class="tag">' + ({ why: '解説', ui: '画面', code: '言い換えの表' }[g.role] || g.role) + '</span>';
    return h;
  }
  var KIND = { array: '配列', pipe: '|区切り', tsv: '辞書', single: '一文' };
  function groupCard(g, hits, q) {
    var hc = hits && hits[g.gid];
    var lis = g.items.map(function (it, ii) {
      var n = hc ? (hc[ii] || 0) : null;
      var t = fmtText(itemText(it));
      if (q) t = markQ(t, q);
      return '<li data-i="' + ii + '"' + (n === 0 ? ' class="zero"' : '') + '>' + t + (n != null ? '<span class="hit">' + n + '</span>' : '') + '</li>';
    }).join('');
    return '<div class="gcard" data-gid="' + g.gid + '"><div class="ghead"><span class="gpath">' + esc(g.path || '(名前なし)') + '</span>' +
      '<span class="gloc">' + esc(g.file.f) + ':' + g.line + '・' + KIND[g.kind] + '・' + g.items.length + '件</span>' + tagsHtml(g) + '</div><ol>' + lis + '</ol></div>';
  }
  function markQ(html, q) {
    if (!q) return html;
    try { var re = new RegExp('(' + q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + ')', 'g'); return html.replace(/(^|>)([^<]+)/g, function (m, a, b) { return a + b.replace(re, '<mark>$1</mark>'); }); } catch (e) { return html; }
  }
  /* 群の一覧（100件ずつ） */
  function groupList(el, list, opt) {
    opt = opt || {};
    var page = 0, PER = 80;
    function draw() {
      var part = list.slice(0, (page + 1) * PER);
      el.innerHTML = part.map(function (g) { return groupCard(g, opt.hits, opt.q); }).join('') +
        (list.length > part.length ? '<div class="pager"><button class="btn" data-more>もっと見る（残り ' + (list.length - part.length) + ' 群）</button></div>' : '') +
        (!list.length ? '<p class="muted">該当する文がありません</p>' : '');
      var mb = $('[data-more]', el); if (mb) mb.onclick = function () { page++; draw(); };
    }
    el.onclick = function (e) {
      var card = e.target.closest('.gcard'); if (!card) return;
      var li = e.target.closest('li');
      openEditor(S.gmap[card.dataset.gid], li ? +li.dataset.i : -1);
    };
    draw();
  }

  /* ---------- タブ ---------- */
  var VIEWS = {};
  function show(tab) {
    S.tab = tab;
    $$('#tabs button').forEach(function (b) { b.classList.toggle('on', b.dataset.tab === tab); });
    var m = $('#main');
    m.innerHTML = '';
    if (!S.sb && tab !== 'log' && tab !== 'check' && tab !== 'search') {
      m.innerHTML = '<p class="muted">試し実行のページを準備しています…</p>';
      if (S.sbPromise) S.sbPromise.then(function () { if (S.tab === tab && /準備しています/.test($('#main').textContent)) show(tab); });
      return;
    }
    VIEWS[tab](m);
  }

  /* 箱庭ごとの文の群（静的な割り当て＋試しに回して出た群） */
  function groupsOfScen(id) {
    var cov = S.cov[id];
    return S.groups.filter(function (g) {
      if (g.role === 'ui' || g.role === 'code') return false;
      if (g.scens.indexOf(id) >= 0) return true;
      return cov && cov.hits[g.gid];
    });
  }

  /* ===== 概要 ===== */
  VIEWS.home = function (m) {
    var rows = S.info.scens.map(function (sc) {
      var gs = groupsOfScen(sc.id), items = gs.reduce(function (s, g) { return s + g.items.length; }, 0);
      var r18 = gs.filter(function (g) { return g.r18; }).reduce(function (s, g) { return s + g.items.length; }, 0);
      var evs = sc.solo ? 0 : sc.nEvents;
      var defs = S.files.reduce(function (s, f) { return s + (f.scen.indexOf(sc.id) >= 0 ? f.events.length : 0); }, 0);
      var cov = S.cov[sc.id];
      return { sc: sc, gs: gs.length, items: items, r18: r18, evs: evs, defs: defs, cov: cov };
    });
    var max = Math.max.apply(null, rows.map(function (r) { return r.items; }));
    var totalGroups = S.groups.filter(function (g) { return g.role !== 'ui' && g.role !== 'code'; });
    m.innerHTML = '<h2>概要：' + esc(curBuild().name) + '</h2>' +
      '<div class="row muted">文の群 ' + totalGroups.length.toLocaleString() + '（うち共通 ' + totalGroups.filter(function (g) { return !g.scens.length; }).length.toLocaleString() + '）・文 ' + S.nItems.toLocaleString() + '・口調 ' + S.info.tones.length + '種・箱庭 ' + S.info.scens.length + '</div>' +
      '<div class="row"><label>試しに回す回数 <input type="number" id="cov-n" value="20" min="1" max="300" style="width:70px"></label>' +
      '<label><input type="checkbox" id="cov-hot"' + (curBuild().safe ? '' : ' checked') + '> 性的な場面が起きやすい設定も混ぜる</label>' +
      '<button class="btn primary" id="cov-all">全箱庭の使われ方を調べる</button><span class="muted" id="cov-st"></span></div>' +
      '<table class="t"><thead><tr><th>箱庭</th><th>型</th><th class="num">イベント</th><th class="num">文の群</th><th class="num">文</th><th></th><th class="num">うちR18専用</th><th class="num">出た文</th><th>試し実行</th><th></th></tr></thead><tbody>' +
      rows.map(function (r) {
        var c = r.cov;
        var covTxt = c ? c.usedItems.toLocaleString() + '（' + Math.round(c.usedItems / Math.max(1, r.items) * 100) + '%）' + (c.fails ? ' <span class="lvl-error">失敗' + c.fails + '</span>' : '') : '—';
        return '<tr><td><a href="#" data-scen="' + r.sc.id + '">' + esc(r.sc.name) + '</a> <span class="muted">' + r.sc.id + '</span></td>' +
          '<td>' + (r.sc.solo ? '物語型' : 'イベント型') + '</td>' +
          '<td class="num">' + (r.sc.solo ? '<span class="muted" title="物語型は場面ごとの文の群で数える">' + r.defs + '</span>' : r.evs) + '</td>' +
          '<td class="num">' + r.gs.toLocaleString() + '</td><td class="num">' + r.items.toLocaleString() + '</td>' +
          '<td><div class="barbox"><div class="bar" style="width:' + (r.items / max * 100) + '%"></div></div></td>' +
          '<td class="num">' + (r.r18 ? r.r18.toLocaleString() : '') + '</td><td class="num">' + covTxt + '</td>' +
          '<td>' + (c ? c.runs + '回' : '') + '</td>' +
          '<td><button class="btn small" data-cov="' + r.sc.id + '">調べる</button> <button class="btn small" data-sim="' + r.sc.id + '">試し実行</button></td></tr>';
      }).join('') + '</tbody></table>' +
      '<p class="muted">イベント：イベント型の箱庭は、起きうる出来事（共通・箱庭の・小イベント・ハプニング）の数。物語型（自前で話を進める箱庭）は、ファイルの中のイベントの定義の数（場面は「箱庭の文」で群として見られます）。<br>' +
      '文の群は、その箱庭のファイルにある群と、試しに回して出てきた群。「出た文」は試しに回したときに一度でも出た文の数（文の頭の手がかりで突き合わせるので目安）。</p>' +
      '<h3>ファイルごと</h3><div id="files"></div>';
    m.onclick = function (e) {
      var a = e.target.closest('[data-scen]'); if (a) { e.preventDefault(); S.sel.scen = a.dataset.scen; show('scen'); return; }
      var c = e.target.closest('[data-cov]'); if (c) { coverage([c.dataset.cov]).then(function () { show('home'); }); return; }
      var s = e.target.closest('[data-sim]'); if (s) { S.sel.scen = s.dataset.sim; show('sim'); return; }
      if (e.target.id === 'cov-all') coverage(S.info.scens.map(function (s) { return s.id; })).then(function () { show('home'); });
    };
    var fr = S.files.map(function (f) { var n = f.groups.reduce(function (s, g) { return s + g.items.length; }, 0); return { f: f, n: n }; }).sort(function (a, b) { return b.n - a.n; });
    $('#files').innerHTML = '<table class="t"><thead><tr><th>ファイル</th><th>説明</th><th>箱庭</th><th class="num">群</th><th class="num">文</th><th class="num">イベント定義</th></tr></thead><tbody>' +
      fr.map(function (r) { return '<tr><td class="mono">' + esc(r.f.f) + (r.f.only ? ' <span class="tag r18">専用</span>' : '') + (r.f.late ? ' <span class="tag">late</span>' : '') + (r.f.error ? ' <span class="lvl-error">' + esc(r.f.error) + '</span>' : '') + '</td><td class="muted">' + esc((r.f.head || '').slice(0, 60)) + '</td><td>' + esc(r.f.scen.join(' ')) + '</td><td class="num">' + r.f.groups.length + '</td><td class="num">' + r.n + '</td><td class="num">' + (r.f.events.length || '') + '</td></tr>'; }).join('') + '</tbody></table>';
  };

  /* 使われ方を調べる：何回か回して、出てきた文を数える（少しずつ回して画面を止めない） */
  function coverage(ids) {
    if (!S.sb) return S.sbPromise.then(function () { return coverage(ids); });
    var n = +($('#cov-n') ? $('#cov-n').value : 20) || 20, hot = $('#cov-hot') ? $('#cov-hot').checked : false;
    var q = ids.slice();
    return new Promise(function (ok) {
      (function next() {
        var id = q.shift();
        if (!id) { status('使われ方を調べました'); ok(); return; }
        status('使われ方を調べています：' + (S.scenById[id] ? S.scenById[id].name : id) + '（残り ' + q.length + '）');
        setTimeout(function () {
          /* 途中で試し実行のページが読み直されたら（ビルドの切り替え・保存のあと）、準備ができるのを待って続ける */
          if (!S.sb) { q.unshift(id); S.sbPromise.then(next); return; }
          var res = S.sb.batch({ scenId: id, n: n, hot: hot });
          var hits = {}, used = 0;
          res.texts.forEach(function (t) {
            matchText(t).forEach(function (x) {
              /* ほかの箱庭の群は、長い一致のときだけ数える（短い言い回しの偶然の一致を除く） */
              if (x.g.scens.length && x.g.scens.indexOf(id) < 0 && x.k.length < 12) return;
              /* 口調の辞書（tone-fix など）は、どの箱庭にも当たるので数えない（「口調・態度」で見る） */
              if (x.g.kind === 'tsv') return;
              var h = hits[x.g.gid] = hits[x.g.gid] || {};
              if (!h[x.i]) used++;
              h[x.i] = (h[x.i] || 0) + 1;
            });
          });
          /* 箱庭に割り当てた群で、一度も出なかった候補を 0 にする */
          S.groups.forEach(function (g) { if (g.scens.indexOf(id) >= 0 && g.role !== 'ui' && g.role !== 'code' && !hits[g.gid]) hits[g.gid] = {}; });
          var usedItems = 0;
          Object.keys(hits).forEach(function (gid) { usedItems += Object.keys(hits[gid]).length; });
          S.cov[id] = { hits: hits, usedItems: usedItems, runs: n, fails: res.fails.length, failMsg: res.fails[0] || '', bad: res.bad || [], eventCounts: res.eventCounts, hot: hot };
          next();
        }, 20);
      })();
    });
  }

  /* ===== 箱庭の文 ===== */
  VIEWS.scen = function (m) {
    var id = S.sel.scen || S.info.scens[0].id;
    S.sel.scen = id;
    var sc = S.scenById[id];
    m.innerHTML = '<div class="row"><select id="sc">' + S.info.scens.map(function (s) { return '<option value="' + s.id + '"' + (s.id === id ? ' selected' : '') + '>' + esc(s.name) + '</option>'; }).join('') + '</select>' +
      '<input id="q" placeholder="文で絞る" style="width:200px"> <select id="role"><option value="text">台詞・地の文</option><option value="why">解説（なぜ）</option><option value="all">ぜんぶ</option></select>' +
      '<select id="sort"><option value="file">ファイル順</option><option value="hit">よく出る順</option><option value="zero">出なかった文がある群</option><option value="r18">R18専用だけ</option></select>' +
      '<label class="muted"><input type="checkbox" id="common"> 共通の群も入れる</label>' +
      '<button class="btn small" id="cov">使われ方を調べる</button><button class="btn small" id="sim">試し実行へ</button></div>' +
      '<div id="evbox"></div><div id="stat" class="muted"></div><div id="list"></div>';
    $('#sc').onchange = function () { S.sel.scen = this.value; show('scen'); };
    $('#cov').onclick = function () { coverage([id]).then(function () { show('scen'); }); };
    $('#sim').onclick = function () { show('sim'); };
    drawEvents($('#evbox'), sc);
    function draw() {
      var q = $('#q').value.trim(), role = $('#role').value, sort = $('#sort').value, cov = S.cov[id];
      var list = groupsOfScen(id);
      if ($('#common').checked) list = list.concat(S.groups.filter(function (g) { return !g.scens.length && g.role !== 'ui' && g.role !== 'code' && list.indexOf(g) < 0; }));
      list = list.filter(function (g) { return role === 'all' || g.role === role; });
      if (q) list = list.filter(function (g) { return g.path.indexOf(q) >= 0 || g.items.some(function (it) { return itemText(it).indexOf(q) >= 0; }); });
      if (sort === 'r18') list = list.filter(function (g) { return g.r18; });
      var tot = function (g) { var h = cov && cov.hits[g.gid]; return h ? Object.keys(h).reduce(function (s, k) { return s + h[k]; }, 0) : 0; };
      if (sort === 'hit') list = list.slice().sort(function (a, b) { return tot(b) - tot(a); });
      if (sort === 'zero') list = list.filter(function (g) { var h = cov && cov.hits[g.gid]; return h && g.items.some(function (it, i) { return !h[i]; }); });
      var items = list.reduce(function (s, g) { return s + g.items.length; }, 0);
      $('#stat').textContent = '群 ' + list.length + '・文 ' + items + (cov ? '　（' + cov.runs + '回回した結果の出た回数を右に表示' + (cov.fails ? '。失敗 ' + cov.fails + '回：' + cov.failMsg.slice(0, 120) : '') + '）' : '　（「使われ方を調べる」で、文ごとの出た回数が出ます）');
      groupList($('#list'), list, { hits: cov && cov.hits, q: q });
    }
    ['q', 'role', 'sort', 'common'].forEach(function (k) { $('#' + k).oninput = draw; $('#' + k).onchange = draw; });
    draw();
  };
  /* イベントの一覧（イベント型の箱庭） */
  function drawEvents(el, sc) {
    if (sc.solo) { el.innerHTML = '<p class="muted">物語型の箱庭（' + esc(sc.name) + '）：出来事は箱庭のファイルの中で順に組み立てられます。下の文の群が場面ごとの文です。</p>'; return; }
    var evs = S.sb.events(sc.id), cov = S.cov[sc.id];
    var defs = {};
    S.files.forEach(function (f) { f.events.forEach(function (e) { (defs[e.id] = defs[e.id] || []).push({ f: f, e: e }); }); });
    var by = {}; evs.forEach(function (e) { (by[e.kind] = by[e.kind] || []).push(e); });
    el.innerHTML = '<details class="card"><summary>イベント ' + evs.length + '件（' + Object.keys(by).map(function (k) { return k + ' ' + by[k].length; }).join('・') + '）' + (cov ? '　試しに' + cov.runs + '回回して起きた回数つき' : '') + '</summary>' +
      '<table class="t"><thead><tr><th>種類</th><th>id</th><th>分類</th><th>相手</th><th>場所</th><th class="num">起きた回数</th><th></th></tr></thead><tbody>' +
      evs.map(function (e) {
        var d = (defs[e.id] || []).filter(function (x) { return x.f.scen.indexOf(sc.id) >= 0 || !x.f.scen.length; })[0] || (defs[e.id] || [])[0];
        var n = cov ? (cov.eventCounts[e.id] || 0) : '';
        return '<tr><td>' + e.kind + '</td><td class="mono">' + esc(e.id) + '</td><td>' + esc(e.cat) + '</td><td>' + esc(e.scope) + '</td><td class="mono">' + (d ? esc(d.f.f) + ':' + d.e.line : '') + '</td><td class="num' + (cov && !n ? ' lvl-warn' : '') + '">' + n + '</td>' +
          '<td>' + (d ? '<button class="btn small" data-evf="' + esc(d.f.f) + '" data-evs="' + d.e.s + '">文を見る</button>' + (d.e.list ? ' <button class="btn small" data-dup="' + esc(d.f.f) + '" data-evs="' + d.e.s + '">これを元に新しいイベント</button>' : '') : '') + '</td></tr>';
      }).join('') + '</tbody></table></details>';
    el.onclick = function (e) {
      var b = e.target.closest('[data-evf]');
      if (b) { var f = S.byFile[b.dataset.evf], s = +b.dataset.evs, ev = f.events.find(function (x) { return x.s === s; }); var g = f.groups.find(function (g) { return g.s >= ev.s && g.e <= ev.e; }); if (g) openEditor(g, -1); else toast('この出来事には一覧に出る文がありません'); return; }
      var d = e.target.closest('[data-dup]');
      if (d) { var f2 = S.byFile[d.dataset.dup], s2 = +d.dataset.evs; openEventDup(f2, f2.events.find(function (x) { return x.s === s2; })); }
    };
  }

  /* ===== 試し実行 ===== */
  var SIM = { cast: null, seed: 1, raw: false, env: {} };
  VIEWS.sim = function (m) {
    var id = S.sel.scen || S.info.scens[0].id; S.sel.scen = id;
    var sc = S.scenById[id];
    var n = Math.max(sc.minCast, Math.min(sc.maxCast, SIM.cast ? SIM.cast.length : 4));
    if (!SIM.cast || SIM.castFor !== id) {
      var old = SIM.cast || [];
      SIM.cast = []; SIM.castFor = id;
      for (var i = 0; i < n; i++) SIM.cast.push(old[i] || { name: ['アキラ', 'ミナト', 'ユキノ', 'カオル', 'ハルカ', 'レンジ', 'ツバサ', 'シオン'][i], gender: ['m', 'f', 'f', 'm', 'f', 'm', 'f', 'm'][i], tone: '', pos: '' });
      SIM.env = {};
    }
    var toneOpts = '<option value="">口調：おまかせ</option>' + S.info.tones.map(function (t) { return '<option value="' + t.key + '">' + esc(t.label) + '</option>'; }).join('');
    m.innerHTML = '<div class="row"><select id="sc">' + S.info.scens.map(function (s) { return '<option value="' + s.id + '"' + (s.id === id ? ' selected' : '') + '>' + esc(s.name) + '</option>'; }).join('') + '</select>' +
      '<label>人数 <input type="number" id="ncast" min="' + sc.minCast + '" max="' + sc.maxCast + '" value="' + SIM.cast.length + '" style="width:56px"></label>' +
      '<label>乱数の種 <input type="number" id="seed" value="' + SIM.seed + '" style="width:80px"></label><button class="btn small" id="dice">🎲</button>' +
      '<button class="btn small" id="rcast">配役をおまかせで混ぜる</button>' +
      '<button class="btn primary" id="go">実行</button><label class="muted"><input type="checkbox" id="raw"' + (SIM.raw ? ' checked' : '') + '> 口調の言い換え前を見る</label></div>' +
      '<div class="cast" id="cast">' + SIM.cast.map(function (c, i) {
        return '<div class="c" data-i="' + i + '"><input data-k="name" value="' + esc(c.name) + '">' +
          '<select data-k="gender"><option value="">性別：おまかせ</option><option value="m">男性</option><option value="f">女性</option><option value="x">その他</option></select>' +
          '<select data-k="pos"><option value="">受け攻め：おまかせ</option><option value="top">攻め</option><option value="bottom">受け</option><option value="riba">リバ</option></select>' +
          '<select data-k="tone" style="grid-column:span 2">' + toneOpts + '</select></div>';
      }).join('') + '</div>' +
      '<details class="card"><summary>場面の設定</summary><div class="envs">' + sc.env.map(function (e) {
        var v = SIM.env[e.id] != null ? SIM.env[e.id] : (e.def != null ? e.def : (e.options && e.options[0] ? e.options[0].v : e.min));
        if (e.options) return '<label><span title="' + esc(e.label) + '">' + esc(e.label) + '</span><select data-env="' + e.id + '">' + e.options.map(function (o) { return '<option value="' + esc(o.v) + '"' + (String(o.v) === String(v) ? ' selected' : '') + '>' + esc(o.label) + '</option>'; }).join('') + '</select></label>';
        if (e.min != null) return '<label><span title="' + esc(e.label) + '">' + esc(e.label) + '</span><input type="range" data-env="' + e.id + '" min="' + e.min + '" max="' + e.max + '" value="' + v + '"><b>' + v + '</b></label>';
        return '';
      }).join('') + '</div></details>' +
      '<div id="out" class="log card"><p class="muted">「実行」で一回分の記録が出ます。文をクリックすると、その文がどこに書かれているかが出て、その場で直せます。</p></div>';
    $$('#cast .c').forEach(function (el) { var c = SIM.cast[+el.dataset.i]; $$('[data-k]', el).forEach(function (x) { x.value = c[x.dataset.k] || ''; x.oninput = x.onchange = function () { c[x.dataset.k] = x.value; }; }); });
    $$('[data-env]').forEach(function (x) { x.oninput = x.onchange = function () { SIM.env[x.dataset.env] = x.type === 'range' ? +x.value : (isNaN(+x.value) || x.value === '' ? x.value : +x.value); if (x.nextElementSibling) x.nextElementSibling.textContent = x.value; }; });
    $('#sc').onchange = function () { S.sel.scen = this.value; show('sim'); };
    $('#ncast').onchange = function () { var k = Math.max(sc.minCast, Math.min(sc.maxCast, +this.value)); while (SIM.cast.length < k) SIM.cast.push({ name: '住人' + (SIM.cast.length + 1), gender: '', tone: '', pos: '' }); SIM.cast.length = k; show('sim'); };
    $('#seed').onchange = function () { SIM.seed = +this.value; };
    $('#dice').onclick = function () { SIM.seed = Math.floor(Math.random() * 100000); $('#seed').value = SIM.seed; run(); };
    $('#rcast').onclick = function () { SIM.cast.forEach(function (c) { c.tone = S.info.tones[Math.floor(Math.random() * S.info.tones.length)].key; c.gender = ['m', 'f'][Math.floor(Math.random() * 2)]; c.pos = ['', 'top', 'bottom'][Math.floor(Math.random() * 3)]; }); show('sim'); };
    $('#raw').onchange = function () { SIM.raw = this.checked; if (SIM.last) drawLog(SIM.last); };
    $('#go').onclick = run;
    function run() {
      if (!S.sb) { toast('試し実行のページを準備しています。少し待ってから押してください'); return; }
      var r = S.sb.run({ scenId: id, seed: SIM.seed, env: SIM.env, chars: SIM.cast });
      SIM.last = r; drawLog(r);
    }
    if (SIM.last && SIM.lastFor === id) drawLog(SIM.last);
    function drawLog(r) {
      SIM.lastFor = id;
      var out = $('#out');
      if (r.error) { out.innerHTML = '<pre class="out lvl-error">' + esc(r.error) + '</pre>'; return; }
      var lines = r.log.map(function (e, i) { return { t: SIM.raw ? e.raw : e.text, raw: e.raw, why: e.why, step: e.kind === 'step', i: i }; });
      if (r.ending) r.ending.lines.forEach(function (l, i) { lines.push({ t: SIM.raw ? r.ending.raw[i] : l, raw: r.ending.raw[i], why: '', i: 'end' + i, end: true }); });
      out.innerHTML = '<div class="muted">配役：' + r.chars.map(function (c) { return esc(c.name) + '（' + (c.gender === 'm' ? '男' : c.gender === 'f' ? '女' : '—') + '・' + esc(c.tone ? (S.toneKeys[c.tone] || {}).label || c.tone : 'おまかせ') + (c.pos ? '・' + ({ top: '攻め', bottom: '受け', riba: 'リバ' })[c.pos] : '') + '）'; }).join('　') + '</div>' +
        lines.map(function (l) {
          if (typeof l.t !== 'string') return '';
          if (l.step) return '<div class="step">' + esc(l.t) + '</div>';
          var nm = matchText(l.raw).filter(function (x, k, a) { return a.findIndex(function (y) { return y.g === x.g; }) === k; }).length;
          return '<div class="ln" data-i="' + l.i + '">' + esc(l.t).replace(/\n/g, '<br>') + (nm ? '<span class="src">［' + nm + '］</span>' : '') + (l.why ? '<div class="why">' + esc(l.why) + '</div>' : '') + '</div>';
        }).join('');
      out.onclick = function (ev) {
        var ln = ev.target.closest('.ln'); if (!ln) return;
        var l = lines.find(function (x) { return String(x.i) === ln.dataset.i; });
        var hits = matchText(l.raw).concat(l.why ? matchText(l.why) : []);
        showPop(ev, hits, l.raw);
      };
    }
  };
  function showPop(ev, hits, raw) {
    var p = $('#pop');
    if (!hits.length) { p.innerHTML = '<div class="muted">この文の書かれた場所が見つかりませんでした（組み立ての途中で作られる文かもしれません）。<br>「文をさがす」で一部を検索してください。</div><div class="mono">' + esc((raw || '').slice(0, 200)) + '</div>'; }
    else p.innerHTML = '<div class="muted">この文のもと（一致の長い順）</div>' + hits.slice(0, 12).map(function (x, k) { return '<div class="pi" data-k="' + k + '"><div class="mono">' + esc(x.g.file.f) + ':' + x.g.line + '　' + esc(x.g.path) + '</div>' + fmtText(itemText(x.g.items[x.i])) + '</div>'; }).join('');
    p.hidden = false;
    var x = Math.min(ev.clientX + 8, window.innerWidth - 540), y = Math.min(ev.clientY + 8, window.innerHeight - 200);
    p.style.left = Math.max(4, x) + 'px'; p.style.top = Math.max(4, y) + 'px';
    p.onclick = function (e) { var pi = e.target.closest('.pi'); if (!pi) return; var h = hits[+pi.dataset.k]; p.hidden = true; openEditor(h.g, h.i); };
  }
  document.addEventListener('mousedown', function (e) { if (!e.target.closest('#pop') && !e.target.closest('.ln')) $('#pop').hidden = true; });

  /* ===== 口調・態度 ===== */
  /* 口調の辞書（tone-fix*.js の「口調\t元の台詞\t書き直し」）：dict[口調][元の台詞] = { g, i } */
  function toneDict() {
    if (S._dict && S._dictFor === S.groups) return S._dict;
    var D = {};
    S.groups.forEach(function (g) {
      if (g.kind !== 'tsv') return;
      g.items.forEach(function (it, i) { var c = it.cols; if (c.length >= 3 && S.toneKeys[c[0]]) (D[c[0]] = D[c[0]] || {})[c[1]] = { g: g, i: i }; });
    });
    S._dict = D; S._dictFor = S.groups;
    return D;
  }
  /* 箱庭の台詞（「」の中身）を、同じ台詞をまとめて集める。key は辞書と同じ形（名前は〈〉） */
  function quotesOf(scen) {
    var ck = scen + '|' + S.groups.length + '|' + S.nItems;
    if (S._quotes && S._quotes.ck === ck && S._quotesFor === S.groups) return S._quotes.list;
    var gs = (scen ? groupsOfScen(scen) : S.groups).filter(function (g) { return g.kind !== 'tsv' && g.role === 'text'; });
    var map = {}, list = [];
    gs.forEach(function (g) {
      g.items.forEach(function (it, ii) {
        var re = /「([^「」]+)」/g, m;
        while ((m = re.exec(it.text))) {
          var key = m[1].replace(/\{[a-z0-9_]+\}|〔[^〕]*〕/g, '〈〉');
          if (jaN(key) < 2) continue;
          var o = map[key];
          if (!o) { o = map[key] = { key: key, srcs: [], r18: false }; list.push(o); }
          if (o.srcs.length < 50) o.srcs.push({ g: g, i: ii });
          if (g.r18) o.r18 = true;
        }
      });
    });
    S._quotes = { ck: ck, list: list }; S._quotesFor = S.groups;
    return list;
  }
  /* 群の中の位置の行番号（ファイルを読み込んであれば） */
  function lineAt(g, pos) {
    var src = S.src[g.file.f];
    if (!src) { srcOf(g.file.f); return g.line; }
    var n = 1; for (var i = src.indexOf('\n'); i >= 0 && i < pos; i = src.indexOf('\n', i + 1)) n++;
    return n;
  }
  var TU = { scen: '', q: '', st: '', gender: 'm', page: 0, part: 'lines' };
  VIEWS.tone = function (m) {
    var keys = S.info.personas.map(function (p) { return { key: p.key, label: p.label + '（態度）' }; }).concat(S.info.tones.filter(function (t) { return PERSONA_KEYS.indexOf(t.key) < 0; }));
    var k = S.sel.tone || keys[0].key; S.sel.tone = k;
    var base = S.sb.baseOf(k);
    if (TU.scen === '' && S.sel.scen) TU.scen = S.sel.scen;
    if (!TU.scen) TU.scen = S.info.scens[0].id;
    m.innerHTML = '<div class="row"><select id="tk">' + keys.map(function (t) { return '<option value="' + t.key + '"' + (t.key === k ? ' selected' : '') + '>' + esc(t.label) + '</option>'; }).join('') + '</select>' +
      '<select id="sc"><option value="*">すべての箱庭</option>' + S.info.scens.map(function (s) { return '<option value="' + s.id + '"' + (s.id === TU.scen ? ' selected' : '') + '>' + esc(s.name) + '</option>'; }).join('') + '</select>' +
      '<select id="pg"><option value="m">男性が話す</option><option value="f">女性が話す</option><option value="x">性別なし</option></select>' +
      '<span class="muted">文面の表は「' + esc((S.toneKeys[base] || {}).label || base) + '」を借りる・一人称「' + esc(S.sb.fpOf(k, TU.gender)) + '」</span></div>' +
      '<nav class="tabs sub" id="tparts"><button data-p="lines">この箱庭の台詞をこの口調で</button><button data-p="tables">口調ごとの書き分け（表・辞書）</button><button data-p="sample">言い換えの見本</button></nav>' +
      '<div id="tbody"></div>';
    $('#pg').value = TU.gender;
    $('#tk').onchange = function () { S.sel.tone = this.value; TU.page = 0; show('tone'); };
    $('#sc').onchange = function () { TU.scen = this.value; TU.page = 0; show('tone'); };
    $('#pg').onchange = function () { TU.gender = this.value; show('tone'); };
    $('#tparts').onclick = function (e) { var b = e.target.closest('[data-p]'); if (b) { TU.part = b.dataset.p; show('tone'); } };
    $$('#tparts button').forEach(function (b) { b.classList.toggle('on', b.dataset.p === TU.part); });
    var scen = TU.scen === '*' ? '' : TU.scen;
    if (TU.part === 'lines') toneLines($('#tbody'), k, scen);
    else if (TU.part === 'tables') toneTables($('#tbody'), k, base, scen);
    else {
      $('#tbody').innerHTML = '<div class="row"><input id="vs" style="flex:1" value="{a}「私、ちょっと休みたい。……あなたも、無理しないで」"><button class="btn" id="vgo">全口調で見る</button></div><div id="vout"></div>';
      $('#vgo').onclick = function () { if (!S.sb) return; $('#vout').innerHTML = voiceTable($('#vs').value); };
    }
  };
  /* 台詞の一覧：元の台詞 → この口調での出来上がり。辞書の書き直しをその場で足す・直す */
  function toneLines(el, k, scen) {
    var D = toneDict(), dk = D[k] || {};
    var all = quotesOf(scen), SP = 'アキラ', OT = ['ミナト', 'ユキノ', 'カオル', 'ハルカ'];
    var fp = S.sb.fpOf(k, TU.gender);
    function fill(key) { var i = 0; return key.replace(/〈〉/g, function () { return OT[Math.min(i++, OT.length - 1)]; }); }
    function unfill(t) { OT.forEach(function (n) { t = t.split(n).join('〈〉'); }); return t; }
    /* 出来上がり（言い換えのあと）と、どこから来た文か */
    function judge(o) {
      if (o.out != null && o.outFor === k + TU.gender) return o;
      var line = SP + '「' + fill(o.key) + '」';
      var out = S.sb.voice(line, [{ name: SP, tone: k, gender: TU.gender }].concat(OT.map(function (n) { return { name: n, tone: 'gentle', gender: 'f' }; })));
      var a = out.indexOf('「'), b = out.lastIndexOf('」');
      o.out = a >= 0 && b > a ? out.slice(a + 1, b) : out;
      o.outFor = k + TU.gender;
      o.dict = dk[o.key] || null;
      o.st = o.dict ? 'dict' : S.sb.hasOverride(fill(o.key), k, TU.gender, OT) ? 'ovr' : o.out === fill(o.key) ? 'same' : 'auto';
      return o;
    }
    var ST = { dict: '辞書の書き直し', ovr: 'ほかの書き下ろし辞書', auto: '自動の言い換え', same: '変わらない' };
    el.innerHTML = '<div class="row"><input id="q" placeholder="台詞で絞る" style="width:220px" value="' + esc(TU.q) + '">' +
      '<select id="st"><option value="">すべて</option><option value="dict">辞書の書き直しあり</option><option value="ovr">ほかの書き下ろし辞書</option><option value="auto">自動の言い換え</option><option value="same">変わらない（言い換えが効いていない）</option></select>' +
      '<span class="muted" id="stat"></span></div>' +
      '<div class="muted">「」の中の台詞を、この口調の人が話したときの出来上がりで並べます（見本の名前：話し手 ' + SP + '、ほかの名前は ' + OT.join('・') + '）。' +
      '右の欄に書いて「保存」すると、この口調の書き直しとして js/tone-fix.js（R18専用の箱庭の台詞は js/tone-fix-r18.js）に入り、次からその文がそのまま使われます。名前は〈〉、一人称は「私」で書いてください。</div>' +
      '<table class="t" id="tl"><thead><tr><th style="width:34%">元の台詞</th><th>この口調で（直すなら書き換えて保存）</th><th style="width:120px">出どころ</th></tr></thead><tbody></tbody></table><div class="pager" id="pgr"></div>';
    $('#st').value = TU.st;
    var PER = 60;
    function filtered() {
      var L = all;
      if (TU.q) L = L.filter(function (o) { var d = dk[o.key]; return o.key.indexOf(TU.q) >= 0 || (d && d.g.items[d.i].cols[2].indexOf(TU.q) >= 0); });
      if (TU.st) L = L.filter(function (o) { return judge(o).st === TU.st; });
      return L;
    }
    function draw() {
      var L = filtered(), part = L.slice(0, (TU.page + 1) * PER);
      $('#stat').textContent = '台詞 ' + L.length.toLocaleString() + (L.length !== all.length ? ' / ' + all.length.toLocaleString() : '') + '（同じ台詞はまとめて数える）';
      $('#tl tbody').innerHTML = part.map(function (o, n) {
        judge(o);
        var cur = o.dict ? o.dict.g.items[o.dict.i].cols[2] : unfill(o.out).split(fp && fp !== '私' ? fp : '\u0000').join('私');
        var src = o.srcs[0];
        return '<tr data-n="' + n + '"><td>' + fmtText(o.key) + '<div class="muted"><a href="#" data-src>' + esc(src.g.file.f) + ':' + src.g.line + '</a>' + (o.srcs.length > 1 ? '　ほか ' + (o.srcs.length - 1) + ' か所' : '') + (o.r18 ? ' <span class="tag r18">R18</span>' : '') + '</div></td>' +
          '<td>' + (cur !== o.out ? '<div class="prev0" title="出来上がり（一人称・名前を入れたもの）">' + esc(o.out) + '</div>' : '') +
          '<div class="trow"><textarea rows="' + Math.max(1, Math.ceil(cur.length / 40)) + '">' + esc(cur) + '</textarea><button class="btn small primary" data-save>保存</button>' +
          (o.dict ? '<button class="btn small danger" data-del title="この口調の書き直しを消して、自動の言い換えに戻す">消す</button>' : '') + '</div></td>' +
          '<td class="lvl-' + (o.st === 'same' ? 'warn' : 'info') + '">' + ST[o.st] + (o.dict ? '<div class="muted">' + esc(o.dict.g.file.f) + ':' + lineAt(o.dict.g, o.dict.g.items[o.dict.i].s) + '</div>' : '') + '</td></tr>';
      }).join('');
      $('#pgr').innerHTML = L.length > part.length ? '<button class="btn" id="more">もっと見る（残り ' + (L.length - part.length) + '）</button>' : '';
      if ($('#more')) $('#more').onclick = function () { TU.page++; draw(); };
      $('#tl tbody').onclick = function (e) {
        var tr = e.target.closest('tr[data-n]'); if (!tr) return;
        var o = part[+tr.dataset.n];
        if (e.target.closest('[data-src]')) { e.preventDefault(); var sx = o.srcs[0]; openEditor(sx.g, sx.i); return; }
        if (e.target.closest('[data-save]')) saveRow(o, $('textarea', tr).value.trim());
        if (e.target.closest('[data-del]') && confirm('この口調の書き直しを消して、自動の言い換えに戻しますか？')) delRow(o);
      };
    }
    function after() { S._quotes = null; return S.sbPromise.then(function () { if (S.tab === 'tone') show('tone'); }); }
    /* 辞書の行を足す・直す・消す */
    function saveRow(o, val) {
      if (!val) return;
      if (/\t|\n/.test(val)) { toast('タブや改行は入れられません'); return; }
      if (o.dict) {
        var g = o.dict.g, it = g.items[o.dict.i];
        if (it.cols[2] === val) return;
        var cols = it.cols.slice(); cols[2] = val;
        save({ s: it.s, e: it.e, op: 'lit', value: cols.join('\t') }, { g: g, gs: it.s, ge: it.e, noReopen: true }).then(after);
        return;
      }
      var file = o.r18 && S.byFile['js/tone-fix-r18.js'] ? 'js/tone-fix-r18.js' : 'js/tone-fix.js';
      var f = S.byFile[file];
      if (!f) { toast(file + ' がありません'); return; }
      var tg = f.groups.filter(function (g) { return g.kind === 'tsv'; }).sort(function (a, b) { return b.items.length - a.items.length; })[0];
      if (!tg) { toast(file + ' に辞書の配列が見つかりません'); return; }
      srcOf(file).then(function (src) {
        var last = tg.items[tg.items.length - 1], prev = tg.items[tg.items.length - 2];
        var between = prev ? src.slice(prev.e, last.s) : ',\n    ';
        var sep = /\n/.test(between) ? ',' + between.slice(between.indexOf('\n')) : ', ';
        var q = src[last.s] === '"' ? '"' : "'";
        return save({ s: last.e, e: last.e, op: 'raw', value: sep + serialize(k + '\t' + o.key + '\t' + val, q) }, { g: tg, gs: last.s, ge: last.e, noReopen: true });
      }).then(after);
    }
    function delRow(o) {
      var g = o.dict.g, i = o.dict.i, it = g.items[i];
      if (g.items.length < 2) return;
      var r = i > 0 ? { s: g.items[i - 1].e, e: it.e } : { s: it.s, e: g.items[1].s };
      save({ s: r.s, e: r.e, op: 'raw', value: '' }, { g: g, gs: r.s, ge: r.e, noReopen: true }).then(after);
    }
    $('#q').oninput = function () { TU.q = this.value.trim(); TU.page = 0; draw(); };
    $('#st').onchange = function () { TU.st = this.value; TU.page = 0; if (TU.st) $('#stat').textContent = '判定中…'; setTimeout(draw, 20); };
    draw();
  }
  /* 書き分けの表・辞書：パスに口調・態度の名前がある群（借りる態度の表も）と、辞書のこの口調の行 */
  function toneTables(el, k, base, scen) {
    var qs = scen ? quotesOf(scen) : null, inScen = {};
    if (qs) qs.forEach(function (o) { inScen[o.key] = 1; });
    el.innerHTML = '<div class="row"><input id="q" placeholder="文で絞る" style="width:200px"><label class="muted"><input type="checkbox" id="wb" checked> 借りている態度「' + esc((S.toneKeys[base] || {}).label || base) + '」の表も入れる</label></div><div id="stat" class="muted"></div><div id="list"></div>';
    function draw() {
      var q = $('#q').value.trim(), wb = $('#wb').checked && base !== k;
      var list = S.groups.filter(function (g) {
        if (g.role === 'ui' || g.role === 'code') return false;
        var hit = g.tones.indexOf(k) >= 0 || (wb && g.tones.indexOf(base) >= 0 && g.tones.length <= 9);
        if (!hit) return false;
        if (g.kind === 'tsv') return true;
        return !scen || g.scens.indexOf(scen) >= 0 || !g.scens.length;
      });
      /* 辞書は、この口調の行だけ（箱庭を選んでいれば、その箱庭の台詞の行だけ） */
      var shown = list.map(function (g) {
        if (g.kind !== 'tsv' || !g.items.some(function (it) { return S.toneKeys[it.cols[0]]; })) return { g: g, idx: g.items.map(function (x, i) { return i; }) };
        var idx = []; g.items.forEach(function (it, i) { if (it.cols[0] === k && (!qs || inScen[it.cols[1]])) idx.push(i); });
        return { g: g, idx: idx };
      }).filter(function (x) { return x.idx.length; });
      if (q) shown = shown.map(function (x) { return { g: x.g, idx: x.idx.filter(function (i) { return itemText(x.g.items[i]).indexOf(q) >= 0; }) }; }).filter(function (x) { return x.idx.length; });
      $('#stat').textContent = '群 ' + shown.length + '・文 ' + shown.reduce(function (s, x) { return s + x.idx.length; }, 0) + (scen ? '（この箱庭の群と、どの箱庭でも使う共通の群）' : '');
      groupList($('#list'), shown.map(function (x) { var v = Object.create(x.g); v.items = x.idx.map(function (i) { return x.g.items[i]; }); return v; }), { q: q });
      $('#list').onclick = function (e) {
        var card = e.target.closest('.gcard'); if (!card) return;
        var x = shown.find(function (y) { return y.g.gid === card.dataset.gid; }), li = e.target.closest('li');
        openEditor(x.g, li ? x.idx[+li.dataset.i] : -1);
      };
    }
    $('#q').oninput = draw; $('#wb').onchange = draw;
    draw();
  }
  function voiceTable(text, opt) {
    opt = opt || {};
    var A = { name: 'アキラ', gender: 'm' }, B = { name: 'ミナト', gender: 'f' };
    var t = text.replace(/\{a\}/g, A.name).replace(/\{b\}/g, B.name).replace(/\{x\}/g, A.name).replace(/\{y\}/g, B.name).replace(/\{c\}/g, 'ユキノ');
    if (t.indexOf('「') < 0 && !opt.bare) t = A.name + '「' + t + '」';
    var genders = opt.genders || ['m', 'f'];
    return '<table class="t"><thead><tr><th>口調</th>' + genders.map(function (g) { return '<th>' + (g === 'm' ? '男性' : '女性') + 'が話す</th>'; }).join('') + '</tr></thead><tbody>' + S.info.tones.map(function (tn) {
      return '<tr><td>' + esc(tn.label) + '</td>' + genders.map(function (g) {
        var ppl = [{ name: A.name, tone: tn.key, gender: g }, { name: B.name, tone: 'gentle', gender: 'f' }, { name: 'ユキノ', tone: 'gentle', gender: 'f' }];
        return '<td>' + esc(S.sb.voice(t, ppl)) + '</td>';
      }).join('') + '</tr>';
    }).join('') + '</tbody></table>';
  }

  /* ===== 口調別の表（喘ぎなど） ===== */
  function tables() {
    if (S._tables && S._tablesFor === S.groups) return S._tables;
    var T = {};
    S.groups.forEach(function (g) {
      if (g.role === 'ui' || g.role === 'code' || g.kind === 'tsv') return;
      var segs = g.path.split('.');
      for (var i = 0; i < segs.length; i++) {
        var k = segs[i].replace(/^#/, '');
        if (PERSONA_KEYS.indexOf(k) >= 0 || S.toneKeys[k]) {
          var id = g.file.f + '|' + segs.slice(0, i).join('.');
          var t = T[id] = T[id] || { id: id, f: g.file.f, prefix: segs.slice(0, i).join('.'), rows: {}, cols: {}, n: 0, heart: 0, groups: [] };
          var col = segs.slice(i + 1).join('.') || '（本体）';
          ((t.rows[k] = t.rows[k] || {})[col] = t.rows[k][col] || []).push(g);
          t.cols[col] = 1; t.groups.push(g);
          g.items.forEach(function (it) { t.n++; if (/♡|っ……|ぁ|んっ|はぁ/.test(it.text)) t.heart++; });
          break;
        }
      }
    });
    var list = Object.keys(T).map(function (k) { return T[k]; }).filter(function (t) { return Object.keys(t.rows).length >= 3; });
    list.forEach(function (t) { t.moan = /moan|MOAN|climax|CLIMAX|喘|ENDURE|RESIST|SUBDUE|\bV\b|\.V$|^V$|aegi|voice/i.test(t.prefix) || t.heart / Math.max(1, t.n) > 0.35; t.persona = Object.keys(t.rows).every(function (k) { return PERSONA_KEYS.indexOf(k) >= 0; }); });
    list.sort(function (a, b) { return (b.moan - a.moan) || (b.n - a.n); });
    S._tables = list; S._tablesFor = S.groups;
    return list;
  }
  VIEWS.table = function (m) {
    var list = tables();
    m.innerHTML = '<div class="row"><label><input type="checkbox" id="moan" checked> 喘ぎ・山場らしい表だけ</label><input id="q" placeholder="表の名前・ファイルで絞る" style="width:220px"><span class="muted" id="cnt"></span></div>' +
      '<div class="row muted">口調・態度の名前（proud・stern・tsun・gentle・devoted・cool・free・shy・polite や、kansai などの口調）で分かれている表です。行＝口調・態度、列＝その下の区分（序盤・最中・絶頂など）。赤い枠は、態度9種のうち書かれていない行です。</div>' +
      '<table class="t"><thead><tr><th>表</th><th>ファイル</th><th class="num">行</th><th class="num">列</th><th class="num">文</th><th></th></tr></thead><tbody id="tl"></tbody></table><div id="mx"></div><div id="cell"></div>';
    function draw() {
      var q = $('#q').value.trim(), moan = $('#moan').checked;
      var L = list.filter(function (t) { return (!moan || t.moan) && (!q || (t.prefix + t.f).indexOf(q) >= 0); });
      $('#cnt').textContent = L.length + ' 表';
      $('#tl').innerHTML = L.slice(0, 200).map(function (t) { return '<tr><td class="mono"><a href="#" data-t="' + esc(t.id) + '">' + esc(t.prefix || '(ファイル直下)') + '</a>' + (t.moan ? ' <span class="tag r18">喘ぎ・山場</span>' : '') + '</td><td class="mono">' + esc(t.f) + '</td><td class="num">' + Object.keys(t.rows).length + '</td><td class="num">' + Object.keys(t.cols).length + '</td><td class="num">' + t.n + '</td><td></td></tr>'; }).join('');
    }
    $('#moan').onchange = draw; $('#q').oninput = draw;
    $('#tl').onclick = function (e) { var a = e.target.closest('[data-t]'); if (!a) return; e.preventDefault(); S.sel.table = a.dataset.t; matrix(); };
    function matrix() {
      var t = list.find(function (x) { return x.id === S.sel.table; }); if (!t) return;
      var rows = Object.keys(t.rows);
      if (t.persona) rows = PERSONA_KEYS.slice();
      else rows = S.info.tones.map(function (x) { return x.key; }).filter(function (k) { return t.rows[k]; }).concat(rows.filter(function (k) { return !S.toneKeys[k]; }));
      var cols = Object.keys(t.cols);
      $('#mx').innerHTML = '<h3>' + esc(t.prefix) + ' <span class="muted">' + esc(t.f) + '</span></h3><table class="t matrix"><thead><tr><th></th>' + cols.map(function (c) { return '<th>' + esc(c) + '</th>'; }).join('') + '</tr></thead><tbody>' +
        rows.map(function (r) {
          return '<tr><th class="rh">' + esc((S.toneKeys[r] || {}).label || r) + ' <span class="muted">' + r + '</span></th>' + cols.map(function (c) {
            var gs = t.rows[r] && t.rows[r][c];
            if (!gs) return '<td class="miss">—</td>';
            var n = gs.reduce(function (s, g) { return s + g.items.length; }, 0);
            return '<td data-r="' + r + '" data-c="' + esc(c) + '"' + (n < 2 ? ' class="miss"' : '') + '>' + n + '</td>';
          }).join('') + '</tr>';
        }).join('') + '</tbody></table><p class="muted">数字＝候補の数（1つだけのところは赤）。クリックで文を表示・編集。</p>';
      $('#mx').onclick = function (e) {
        var td = e.target.closest('td[data-r]'); if (!td) return;
        $$('#mx td.sel').forEach(function (x) { x.classList.remove('sel'); }); td.classList.add('sel');
        var gs = t.rows[td.dataset.r][td.dataset.c];
        $('#cell').innerHTML = '';
        groupList($('#cell'), gs, {});
        $('#cell').scrollIntoView({ behavior: 'smooth', block: 'start' });
      };
      $('#mx').scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    draw();
    if (S.sel.table) matrix();
  };

  /* ===== 文をさがす ===== */
  VIEWS.search = function (m) {
    m.innerHTML = '<div class="row"><input id="q" placeholder="さがす文字（/…/ で正規表現）" style="flex:1;min-width:240px" value="' + esc(S.sel.q || '') + '">' +
      '<select id="role"><option value="text">台詞・地の文</option><option value="why">解説</option><option value="ui">画面</option><option value="code">言い換えの表（コード）</option><option value="all">ぜんぶ</option></select>' +
      '<select id="sc"><option value="">すべての箱庭</option><option value="_">共通（箱庭の決まっていない群）</option>' + (S.info ? S.info.scens.map(function (s) { return '<option value="' + s.id + '">' + esc(s.name) + '</option>'; }).join('') : '') + '</select>' +
      '<label class="muted"><input type="checkbox" id="r18"> R18専用だけ</label><button class="btn primary" id="go">さがす</button></div><div id="stat" class="muted"></div><div id="list"></div>';
    function go() {
      var q = $('#q').value, role = $('#role').value, sc = $('#sc').value, r18 = $('#r18').checked;
      S.sel.q = q;
      if (!q) { $('#list').innerHTML = ''; return; }
      var test, mk = q;
      var rm = q.match(/^\/(.+)\/([a-z]*)$/);
      if (rm) { try { var re = new RegExp(rm[1], rm[2]); test = function (t) { re.lastIndex = 0; return re.test(t); }; mk = ''; } catch (e) { toast('正規表現が読めません'); return; } }
      else test = function (t) { return t.indexOf(q) >= 0; };
      var list = S.groups.filter(function (g) {
        if (role !== 'all' && g.role !== role) return false;
        if (sc === '_' ? g.scens.length : sc && g.scens.indexOf(sc) < 0) return false;
        if (r18 && !g.r18) return false;
        return test(g.path) || g.items.some(function (it) { return test(itemText(it)); });
      });
      var nIt = list.reduce(function (s, g) { return s + g.items.filter(function (it) { return test(itemText(it)); }).length; }, 0);
      $('#stat').textContent = '群 ' + list.length + '・一致する文 ' + nIt;
      groupList($('#list'), list, { q: mk });
    }
    $('#go').onclick = go; $('#q').onkeydown = function (e) { if (e.key === 'Enter') go(); };
    if (S.sel.q) go();
  };

  /* ===== 点検 ===== */
  VIEWS.check = function (m) {
    m.innerHTML = '<div class="row"><button class="btn primary" id="go">書かれた文を点検</button>' + (S.info ? '<button class="btn" id="rt">全箱庭を試しに回して点検</button>' : '') + '<span class="muted" id="st"></span></div>' +
      '<div class="muted">書かれた文の点検：括弧「」『』（）の対応（つないで使う切れ端は除く）・空の候補（||）・同じ候補の重複・{ } の崩れ・句読点の重なり・態度9種の表の抜け（敬語は健気を借りるので除く）・R18専用ファイルで候補が1つだけの段・全年齢版と同名ファイルの台詞の違い。<br>' +
      '試しに回す点検：各箱庭を回して、止まる（エラーになる）組み合わせ、ページの読み込みエラー、出来上がった文に残った {a}・undefined・NaN・空の「」、一度も出なかった文の数を見ます。</div><div id="res"></div>';
    $('#go').onclick = function () {
      $('#st').textContent = '点検中…';
      api('/api/check?b=' + S.b).then(function (d) {
        S.checkRes = d.items;
        $('#st').textContent = '';
        drawCheck(d);
      }).catch(function (e) { $('#st').textContent = e.message; });
    };
    if ($('#rt')) $('#rt').onclick = function () {
      coverage(S.info.scens.map(function (s) { return s.id; })).then(function () {
        var rows = S.info.scens.map(function (sc) {
          var c = S.cov[sc.id], gs = S.groups.filter(function (g) { return g.scens.indexOf(sc.id) >= 0 && g.role === 'text'; });
          var zero = gs.reduce(function (s, g) { var h = c.hits[g.gid] || {}; return s + g.items.filter(function (it, i) { return !h[i]; }).length; }, 0);
          var all = gs.reduce(function (s, g) { return s + g.items.length; }, 0);
          var bad = c.bad || [];
          return '<tr><td>' + esc(sc.name) + '</td><td class="num' + (c.fails ? ' lvl-error' : '') + '">' + c.fails + '</td><td class="mono">' + esc(c.failMsg.split('\n')[0].slice(0, 140)) + '</td>' +
            '<td class="num' + (bad.length ? ' lvl-error' : '') + '">' + bad.length + '</td><td>' + bad.slice(0, 3).map(function (b) { return '<div class="mono">' + esc(b) + '</div>'; }).join('') + '</td><td class="num">' + zero + ' / ' + all + '</td></tr>';
        }).join('');
        $('#res').innerHTML = '<h3>試しに回した結果（各' + S.cov[S.info.scens[0].id].runs + '回）</h3>' + (S.info.errors.length ? '<pre class="out lvl-error">' + esc(S.info.errors.join('\n')) + '</pre>' : '<p class="muted">ページの読み込みエラーはありません</p>') +
          '<table class="t"><thead><tr><th>箱庭</th><th class="num">失敗</th><th>最初の失敗</th><th class="num">置き換え残り</th><th>例</th><th class="num">出なかった文</th></tr></thead><tbody>' + rows + '</tbody></table><p class="muted">出なかった文は、回数が少ないと多めに出ます。条件が珍しい場面は、「試し実行」で設定を合わせて確かめてください。</p>';
      });
    };
    if (S.checkRes) drawCheck({ items: S.checkRes });
  };
  function drawCheck(d) {
    var by = {}, items = d.items;
    items.forEach(function (r) { (by[r.rule] = by[r.rule] || []).push(r); });
    var rules = Object.keys(by);
    $('#res').innerHTML = '<div class="row">' + rules.map(function (k) { return '<button class="btn small" data-rule="' + esc(k) + '"><span class="lvl-' + by[k][0].level + '">' + esc(k) + '</span> ' + by[k].length + '</button>'; }).join('') + '</div><div id="rl"></div>';
    function draw(k) {
      $('#rl').innerHTML = '<table class="t"><thead><tr><th>場所</th><th>群</th><th>内容</th></tr></thead><tbody>' + by[k].slice(0, 500).map(function (r, i) { return '<tr data-i="' + i + '" style="cursor:pointer"><td class="mono">' + esc(r.f) + ':' + r.line + '</td><td class="mono">' + esc(r.path) + '</td><td class="lvl-' + r.level + '">' + esc(r.msg) + '</td></tr>'; }).join('') + '</tbody></table>' + (by[k].length > 500 ? '<p class="muted">先頭の500件</p>' : '');
      $('#rl').onclick = function (e) {
        var tr = e.target.closest('tr[data-i]'); if (!tr) return;
        var r = by[k][+tr.dataset.i], f = S.byFile[r.f]; if (!f) return;
        var g = f.groups.find(function (g) { return g.s <= r.s && r.e <= g.e; }) || f.groups.find(function (g) { return g.line === r.line; });
        if (!g) { toast('この群は今の索引にありません'); return; }
        var ii = g.items.findIndex(function (it) { return it.s === r.s && (r.seg == null || it.seg === r.seg); });
        openEditor(g, ii);
      };
    }
    $('#res').onclick = function (e) { var b = e.target.closest('[data-rule]'); if (b) draw(b.dataset.rule); };
    if (rules.length) draw(rules[0]);
  }

  /* ===== 依頼と更新履歴 ===== */
  VIEWS.log = function (m) {
    m.innerHTML = '<h2>更新履歴に書き足す</h2><div class="muted">CLAUDE.md の決まり：文を足したり直したりしたら、docs/CHANGELOG.md のいちばん上の日付の節に、利用者向けの言葉で箇条書きを足す（R18は「アップデート（R18）」の下）。</div>' +
      '<div id="cl" class="card">読み込み中…</div>' +
      '<h2>AIへの依頼</h2><div class="muted">編集画面の「AIに依頼」で書いた依頼は hakoniwa-tools/text-studio/ai-requests.md にたまります。Claude Code に「ai-requests.md の未完了の依頼を片付けて」と頼むと順に直します。</div>' +
      '<div class="card"><div class="row"><textarea id="ain" rows="3" placeholder="例：無人島の告白の場面を、態度9種で1つずつ足してほしい（男×女・女×女・女攻め×男の3組）"></textarea></div><div class="row"><select id="akind"><option>直し</option><option>イベントの追加</option><option>書き分けの追加</option><option>点検</option></select><button class="btn" id="aadd">依頼を書き足す</button><button class="btn" id="acopy">Claude Code 用の指示をコピー</button></div></div>' +
      '<pre class="out" id="areq">…</pre>';
    api('/api/ai').then(function (t) { $('#areq').textContent = t || '（まだ依頼はありません）'; });
    $('#aadd').onclick = function () { var v = $('#ain').value.trim(); if (!v) return; api('/api/ai', { kind: $('#akind').value, note: v, targets: [] }).then(function () { toast('依頼を書き足しました'); show('log'); }); };
    $('#acopy').onclick = function () { copy(promptFor($('#akind').value, $('#ain').value.trim(), [])); };
    api('/api/changelog').then(function (d) {
      var isToday = d.top.indexOf(d.today) === 0;
      $('#cl').innerHTML = '<div class="row">いちばん上の節：<b>' + esc(d.top) + '</b>' + (isToday ? '' : ' <span class="lvl-warn">今日（' + d.today + '）の節ではありません</span> <button class="btn small" id="newday">今日の節を作る</button>') + '</div>' +
        '<div class="row"><select id="hd">' + d.heads.map(function (h) { return '<option value="' + h.line + '">' + esc(h.label) + '</option>'; }).join('') + '</select></div>' +
        '<div class="row"><textarea id="ct" rows="2" placeholder="例：無人島の告白の場面を、態度9種で書き分け"></textarea></div><div class="row"><button class="btn primary" id="cadd">箇条書きを足す</button></div>';
      if ($('#newday')) $('#newday').onclick = function () { api('/api/changelog', { newDay: true }).then(function () { toast('今日の節を作りました'); show('log'); }); };
      $('#cadd').onclick = function () { api('/api/changelog', { line: +$('#hd').value, text: $('#ct').value }).then(function () { toast('更新履歴に書き足しました'); show('log'); }).catch(function (e) { toast(e.message); }); };
    }).catch(function (e) { $('#cl').textContent = e.message; });
  };
  function copy(t) {
    (navigator.clipboard ? navigator.clipboard.writeText(t) : Promise.reject()).then(function () { toast('コピーしました（Claude Code に貼りつけてください）'); }, function () {
      var ta = document.createElement('textarea'); ta.value = t; document.body.appendChild(ta); ta.select(); document.execCommand('copy'); ta.remove(); toast('コピーしました');
    });
  }
  function promptFor(kind, note, targets) {
    var s = '箱庭シミュレーターの文の' + kind + 'をお願いします。CLAUDE.md の決まり（両方のビルドに同じ変更・R18の文の基準・更新履歴・ビルド・tone-check での確認）に従ってください。\n\n';
    targets.forEach(function (x) { s += '場所：' + x.build + '/' + x.f + ':' + x.line + '（群 ' + x.path + '）\n' + (x.text ? '今の文：\n' + x.text.split('\n').map(function (l) { return '  ' + l; }).join('\n') + '\n' : ''); });
    s += '\nしてほしいこと：' + note + '\n';
    return s;
  }

  /* ---------- 編集画面 ---------- */
  var ED = { g: null, focus: -1, sp: { a: 'アキラ', b: 'ミナト', tone: '', gender: 'm' } };
  function openEditor(g, focus) {
    if (!g) return;
    ED.g = g; ED.focus = focus;
    document.body.classList.add('with-editor');
    var el = $('#editor'); el.hidden = false;
    el.innerHTML = '<p class="muted">読み込み中…</p>';
    srcOf(g.file.f).then(function (src) { drawEditor(src); });
  }
  function closeEditor() { $('#editor').hidden = true; document.body.classList.remove('with-editor'); ED.g = null; }
  function eventOf(g) { return g.file.events.filter(function (e) { return e.s <= g.s && g.e <= e.e; }).sort(function (a, b) { return (a.e - a.s) - (b.e - b.s); })[0]; }
  function drawEditor(src) {
    var g = ED.g, el = $('#editor');
    var gsrc = src.slice(g.s, g.e);
    var ev = eventOf(g);
    var canDel = (g.kind === 'pipe' && g.items.length > 1) || ((g.kind === 'array' || g.kind === 'tsv') && g.n === g.items.length && g.items.length > 1);
    var canAdd = g.kind === 'pipe' || ((g.kind === 'array' || g.kind === 'tsv') && g.n === g.items.length);
    var toneOpts = '<option value="">話し手の口調：なし（書いたまま）</option>' + (S.info ? S.info.tones.map(function (t) { return '<option value="' + t.key + '"' + (t.key === ED.sp.tone ? ' selected' : '') + '>' + esc(t.label) + '</option>'; }).join('') : '');
    var tsvHead = g.kind === 'tsv' ? tsvHeader(g, src) : null;
    el.innerHTML = '<div class="ehead"><b class="mono" style="flex:1;word-break:break-all">' + esc(g.path || '(名前なし)') + '</b><button class="btn small" id="ex">閉じる</button></div>' +
      '<div class="muted">' + esc(curBuild().name) + '/' + esc(g.file.f) + ':' + g.line + '・' + KIND[g.kind] + '・' + g.items.length + '件 ' + tagsHtml(g) + (g.scens.length ? '・箱庭 ' + esc(g.scens.map(function (id) { return S.scenById && S.scenById[id] ? S.scenById[id].name : id; }).join('・')) : '・共通') + '</div>' +
      '<div class="row"><button class="btn small" id="raw">コードで直す</button><button class="btn small" id="ai">AIに依頼</button>' + (ev && ev.list ? '<button class="btn small" id="dup">このイベント（' + esc(ev.id) + '）を元に新しいイベント</button>' : '') + '<button class="btn small" id="vt">全口調で見る</button></div>' +
      (S.info ? '<div class="row muted">見本の名前 {a}<input id="pa" value="' + esc(ED.sp.a) + '" style="width:80px"> {b}<input id="pb" value="' + esc(ED.sp.b) + '" style="width:80px"> <select id="pt">' + toneOpts + '</select><select id="pg"><option value="m">男性</option><option value="f">女性</option></select></div>' : '') +
      '<div id="items">' + g.items.map(function (it, i) { return itemEditor(it, i, tsvHead); }).join('') + '</div>' +
      (canAdd ? '<div class="eitem"><b>候補を足す</b>' + (g.kind === 'tsv' && tsvHead ? '<div class="cols">' + tsvHead.map(function (h, c) { return '<label>' + esc(h) + '</label><textarea rows="1" data-newc="' + c + '"></textarea>'; }).join('') + '</div>' : '<textarea id="newt" rows="2" placeholder="新しい候補"></textarea>') + '<div class="row"><button class="btn primary small" id="add">足す</button></div></div>' : '') +
      '<div id="rawbox" hidden class="eitem"><b>コードで直す</b><div class="muted">この群のコードを直接直します（保存のときに構文を確かめます）</div><textarea id="rawt" rows="12" class="mono">' + esc(gsrc) + '</textarea><div class="row"><button class="btn primary small" id="rawsave">保存</button></div></div>' +
      '<div id="aibox" hidden class="eitem"><b>AIに依頼</b><textarea id="ain" rows="3" placeholder="例：もっと照れた感じに／男×女・女×女・女攻め×男の3組の専用文を足して"></textarea><div class="row"><button class="btn small" id="aiadd">依頼の控えに書き足す</button><button class="btn small" id="aicopy">Claude Code 用の指示をコピー</button></div></div>' +
      '<div id="vtbox"></div><div id="mir" class="muted"></div>';
    $('#pg', el) && ($('#pg', el).value = ED.sp.gender);
    $('#ex', el).onclick = closeEditor;
    ['pa', 'pb', 'pt', 'pg'].forEach(function (k) { var x = $('#' + k, el); if (x) x.oninput = x.onchange = function () { ED.sp.a = $('#pa', el).value; ED.sp.b = $('#pb', el).value; ED.sp.tone = $('#pt', el).value; ED.sp.gender = $('#pg', el).value; previews(); }; });
    $('#raw', el).onclick = function () { $('#rawbox', el).hidden = !$('#rawbox', el).hidden; };
    $('#ai', el).onclick = function () { $('#aibox', el).hidden = !$('#aibox', el).hidden; };
    $('#vt', el).onclick = function () {
      var i = ED.focus >= 0 ? ED.focus : 0, it = g.items[i];
      var t = it.cols ? it.cols[it.cols.length - 1] : it.text;
      if (!S.sb) { toast('準備中です'); return; }
      $('#vtbox', el).innerHTML = '<h3>全口調で見る（' + (i + 1) + '番目）</h3>' + voiceTable(t);
    };
    if (ev && ev.list) $('#dup', el).onclick = function () { openEventDup(g.file, ev); };
    var targets = function () { return [{ build: curBuild().name, f: g.file.f, line: g.line, path: g.path, text: g.items.map(function (it) { return itemText(it); }).join('\n') }]; };
    $('#aiadd', el).onclick = function () { var v = $('#ain', el).value.trim(); if (!v) return; api('/api/ai', { kind: '直し', note: v, targets: targets() }).then(function (r) { toast(r.file + ' に書き足しました'); }); };
    $('#aicopy', el).onclick = function () { copy(promptFor('直し', $('#ain', el).value.trim(), targets())); };
    $('#rawsave', el).onclick = function () { save({ s: g.s, e: g.e, op: 'raw', value: $('#rawt', el).value }); };
    $$('#items .eitem', el).forEach(function (box) {
      var i = +box.dataset.i, it = g.items[i];
      var sv = $('[data-save]', box), dl = $('[data-del]', box);
      if (sv) sv.onclick = function () {
        if (it.enc === 'expr') { save({ s: it.s, e: it.e, op: 'raw', value: $('textarea', box).value }); return; }
        if (it.enc === 'tsv') { var cols = $$('textarea', box).map(function (t) { return t.value; }); save({ s: it.s, e: it.e, op: 'lit', value: cols.join('\t') }); return; }
        var v = $('textarea', box).value;
        if (it.enc === 'pipe') { if (v.indexOf('|') >= 0 && !confirm('「|」が入っています。候補が分かれますが、よいですか？')) return; var segs = g.items.map(function (x) { return x.text; }); segs[i] = v; save({ s: it.s, e: it.e, op: 'lit', value: segs.join('|') }); return; }
        save({ s: it.s, e: it.e, op: 'lit', value: v });
      };
      if (dl) dl.onclick = function () {
        if (!confirm('この候補を消しますか？')) return;
        if (g.kind === 'pipe') { var segs = g.items.map(function (x) { return x.text; }); segs.splice(i, 1); save({ s: it.s, e: it.e, op: 'lit', value: segs.join('|') }); return; }
        /* 配列の要素を消す：前の要素の終わりから（先頭なら次の要素の始まりまで） */
        if (i > 0) save({ s: g.items[i - 1].e, e: it.e, op: 'raw', value: '' });
        else save({ s: it.s, e: g.items[1].s, op: 'raw', value: '' });
      };
      $$('textarea', box).forEach(function (t) { t.oninput = function () { previews(); }; });
    });
    var ab = $('#add', el);
    if (ab) ab.onclick = function () {
      if (g.kind === 'pipe') { var v = $('#newt', el).value; if (!v) return; var segs = g.items.map(function (x) { return x.text; }).concat([v]); save({ s: g.items[0].s, e: g.items[0].e, op: 'lit', value: segs.join('|') }); return; }
      var val = g.kind === 'tsv' ? $$('[data-newc]', el).map(function (t) { return t.value; }).join('\t') : $('#newt', el).value;
      if (!val.replace(/\t/g, '')) return;
      var last = g.items[g.items.length - 1];
      var q = src[last.s] === '"' || src[last.s] === '`' ? src[last.s] : "'";
      /* 前の要素と同じ並べ方（改行して字下げ／同じ行） */
      var between = g.items.length > 1 ? src.slice(g.items[g.items.length - 2].e, last.s) : ', ';
      var sep = /\n/.test(between) ? ',' + between.slice(between.indexOf('\n')) : ', ';
      save({ s: last.e, e: last.e, op: 'raw', value: sep + serialize(val, q) });
    };
    previews();
    var f = $('.eitem.focus', el); if (f) f.scrollIntoView({ block: 'center' });
  }
  /* 辞書の列の名前（TONES = [...] の並びや、先頭の行から推し量る） */
  function tsvHeader(g, src) {
    var n = Math.max.apply(null, g.items.map(function (it) { return it.cols.length; }));
    var c0 = g.items[0].cols[0];
    if (S.toneKeys[c0]) return ['口調', '元の台詞', '書き直し'].concat([]).slice(0, n).concat(Array(Math.max(0, n - 3)).fill('列'));
    var m = src.slice(Math.max(0, g.s - 3000), g.s).match(/TONES\s*=\s*\[([^\]]*)\]\s*;?[^\[]*$/);
    if (m) { var ks = m[1].match(/'(\w+)'/g).map(function (x) { return x.replace(/'/g, ''); }); return ['元の台詞'].concat(ks.map(function (k) { return (S.toneKeys[k] || {}).label || k; })).slice(0, n); }
    var h = []; for (var i = 0; i < n; i++) h.push(i === 0 ? '元' : (i + 1) + '列目'); return h;
  }
  function itemEditor(it, i, tsvHead) {
    var g = ED.g;
    var canDel = (g.kind === 'pipe' && g.items.length > 1) || ((g.kind === 'array' || g.kind === 'tsv') && g.n === g.items.length && g.items.length > 1);
    var body;
    if (it.enc === 'tsv') body = '<div class="cols">' + it.cols.map(function (c, k) { return '<label>' + esc(tsvHead && tsvHead[k] || (k + 1) + '列目') + '</label><textarea rows="' + Math.max(1, Math.ceil(c.length / 34)) + '">' + esc(c) + '</textarea>'; }).join('') + '</div>';
    else if (it.enc === 'expr') body = '<div class="muted">式でつないだ文です（〔〕の中はコード）。コードのまま直してください</div><div class="prev0">' + fmtText(it.text) + '</div><textarea rows="3" class="mono">' + esc(S.src[g.file.f].slice(it.s, it.e)) + '</textarea>';
    else body = '<textarea rows="' + Math.max(2, Math.ceil(it.text.length / 34)) + '">' + esc(it.text) + '</textarea>';
    return '<div class="eitem' + (i === ED.focus ? ' focus' : '') + '" data-i="' + i + '"><div class="row"><b>' + (i + 1) + '</b>' + (it.enc === 'pipe' ? '<span class="muted">|区切りの' + (it.seg + 1) + '番目</span>' : '') + '<span class="grow"></span><button class="btn small primary" data-save>保存</button>' + (canDel ? '<button class="btn small danger" data-del>消す</button>' : '') + '</div>' + body + '<div class="prev" data-prev></div></div>';
  }
  /* 見本：{a}{b} を名前にして、話し手の口調で言い換える */
  function previews() {
    var el = $('#editor');
    $$('#items .eitem', el).forEach(function (box) {
      var tas = $$('textarea', box), it = ED.g.items[+box.dataset.i];
      var t = it.enc === 'tsv' ? tas[tas.length - 1].value : it.enc === 'expr' ? it.text : tas[0].value;
      var p = t.replace(/\{a\}|\{x\}/g, ED.sp.a).replace(/\{b\}|\{y\}/g, ED.sp.b).replace(/\{c\}/g, 'ユキノ');
      if (ED.sp.tone && S.sb) {
        var q = p.indexOf('「') < 0 ? ED.sp.a + '「' + p + '」' : p;
        p = S.sb.voice(q, [{ name: ED.sp.a, tone: ED.sp.tone, gender: ED.sp.gender }, { name: ED.sp.b, tone: 'gentle', gender: 'f' }]);
      }
      $('[data-prev]', box).textContent = p;
    });
  }
  function serialize(v, q) {
    if (q === '`') return '`' + v.replace(/\\/g, '\\\\').replace(/`/g, '\\`').replace(/\$\{/g, '\\${') + '`';
    q = q === '"' ? '"' : "'";
    return q + v.replace(/\\/g, '\\\\').split(q).join('\\' + q).replace(/\n/g, '\\n').replace(/\t/g, '\\t').replace(/\r/g, '\\r') + q;
  }
  /* 保存：位置 s〜e を置き換える。群の範囲を一緒に送り、もう片方のビルドの同じ群も直す */
  function save(o, opt) {
    opt = opt || {};
    var g = opt.g || ED.g, f = g.file.f;
    return srcOf(f).then(function (src) {
      var req = { b: S.b, f: f, s: o.s, e: o.e, expect: src.slice(o.s, o.e), op: o.op, value: o.value, gs: opt.gs != null ? opt.gs : g.s, ge: opt.ge != null ? opt.ge : g.e };
      if (o.op === 'lit') req.quote = src[o.s];
      return api('/api/edit', req);
    }).then(function (r) {
      S.dirty = true; $('#dirty').hidden = false;
      var mir = r.mirror.map(function (m) { return m.name + '：' + m.status; }).join('　');
      toast('保存しました' + (mir ? '　' + mir : ''), 5000);
      var keep = { path: g.path, line: g.line, focus: ED.focus };
      return loadIndex(f).then(function () {
        var nf = S.byFile[f];
        var ng = nf.groups.find(function (x) { return x.path === keep.path && Math.abs(x.line - keep.line) < 3; }) || nf.groups.find(function (x) { return x.path === keep.path; });
        S._tables = null;
        if (ng && !opt.noReopen) { openEditor(ng, keep.focus); setTimeout(function () { var m = $('#mir'); if (m) m.textContent = mir; }, 300); }
        return reloadSandbox();
      });
    }).catch(function (e) { toast('保存できませんでした：' + e.message, 6000); });
  }

  /* イベントの複製：元のイベントのコードを下書きにして、すぐ後ろに足す */
  function openEventDup(file, ev) {
    srcOf(file.f).then(function (src) {
      var es = src.slice(ev.s, ev.e);
      var nid = ev.id + '_2';
      var draft = es.replace(new RegExp("(['\"])" + ev.id.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + "\\1"), "'" + nid + "'");
      var el = $('#editor'); el.hidden = false; document.body.classList.add('with-editor');
      ED.g = null;
      el.innerHTML = '<div class="ehead"><b style="flex:1">新しいイベント（' + esc(ev.id) + ' を元に）</b><button class="btn small" id="ex">閉じる</button></div>' +
        '<div class="muted">' + esc(file.f) + ':' + ev.line + ' の後ろに足します。id を重ならない名前にして、文・条件を書き換えてください。' + (ev.form === 'E' ? '<br>E(id, 分類, 相手, 重み, 条件, 効果, 文) … 文は「|」区切り。{a}{b} が名前に替わる。書き方は js/mini.js の先頭' : '') + '</div>' +
        '<textarea id="dt" rows="18" class="mono">' + esc(draft) + '</textarea>' +
        '<div class="row"><button class="btn primary" id="ins">足す</button><button class="btn" id="aicp">AIに書いてもらう指示をコピー</button></div>';
      $('#ex', el).onclick = closeEditor;
      $('#aicp', el).onclick = function () { copy(promptFor('イベントの追加', '次のイベントを元に、新しいイベントを ' + file.f + ' の ' + ev.id + ' の後ろに足してください（id は重ならないように。内容：＿＿＿）。\n元のイベント：\n' + es, [])); };
      $('#ins', el).onclick = function () {
        var v = $('#dt', el).value;
        var idm = v.match(/^\s*E\(\s*['"]([^'"]+)['"]|\bid:\s*['"]([^'"]+)['"]/);
        var id = idm && (idm[1] || idm[2]);
        if (id && S.files.some(function (f) { return f.events.some(function (e) { return e.id === id; }); }) && !confirm('id「' + id + '」はもうあります。このまま足しますか？')) return;
        var after = src.slice(ev.e, ev.e + 3);
        var lineStart = src.lastIndexOf('\n', ev.s) + 1, indent = src.slice(lineStart, ev.s).match(/^\s*/)[0];
        var ins = ',\n' + indent + v.trim();
        /* 元の後ろに「,」があればその後ろへ */
        var at = ev.e; if (/^\s*,/.test(after)) at = ev.e + after.indexOf(',') + 1, ins = '\n' + indent + v.trim() + ',';
        var fakeG = { file: file, s: ev.s, e: ev.e, path: '', line: ev.line };
        save({ s: at, e: at, op: 'raw', value: ins }, { g: fakeG, gs: ev.s, ge: ev.e, noReopen: true }).then(function () { toast('イベントを足しました。「試し実行」「使われ方を調べる」で出るか確かめてください', 6000); closeEditor(); });
      };
    });
  }

  /* ---------- はじめ ---------- */
  $('#tabs').onclick = function (e) { var b = e.target.closest('button'); if (b) show(b.dataset.tab); };
  $('#build').onchange = function () { S.b = +this.value; S.cov = {}; S.checkRes = null; start(); };
  $('#mode').onchange = function () { S.mode = this.value; S.cov = {}; loadSandbox().then(function () { status('表示：' + (S.mode === 'r18' ? 'R18' : '全年齢モード')); show(S.tab); }); };
  $('#add-dir').onclick = function () {
    var d = prompt('ビルドのフォルダ（js/_order.txt のあるフォルダ）の場所', '');
    if (!d) return;
    api('/api/open', { dir: d }).then(function (b) { return loadBuilds().then(function () { S.b = b.id; $('#build').value = b.id; start(); }); }).catch(function (e) { toast(e.message, 6000); });
  };
  $('#btn-build').onclick = function () {
    status('ビルド中…');
    api('/api/build', {}).then(function (d) {
      var ok = d.results.every(function (r) { return r.ok; });
      S.dirty = !ok; $('#dirty').hidden = ok;
      status(ok ? 'ビルドしました（' + d.results.map(function (r) { return r.name; }).join('・') + '）' : 'ビルドに失敗');
      if (!ok || d.results.some(function (r) { return /※/.test(r.out); })) alert(d.results.map(function (r) { return r.name + '\n' + r.out; }).join('\n\n'));
    }).catch(function (e) { status(e.message); });
  };
  function start() {
    $('#mode-wrap').hidden = curBuild().safe;
    return loadIndex().then(function () { show(S.tab); return loadSandbox(); }).then(function () {
      status('群 ' + S.groups.length.toLocaleString() + '・文 ' + S.nItems.toLocaleString() + '・試し実行の準備ができました' + (S.info.errors.length ? '（読み込みエラー ' + S.info.errors.length + '）' : ''));
      show(S.tab);
    }).catch(function (e) { status('読み込めませんでした：' + e.message); });
  }
  loadBuilds().then(start);
})();
