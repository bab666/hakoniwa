/* 箱庭シミュレーター: 住人が多いとき（最大1000人）の住人タブ・箱庭タブ（2026-10-27）
   ・住人の一覧をグループごとの節に分けて描く（見出し・人数・［折りたたむ／開く］）。複数のグループの住人は、最初のグループの節に出す
     （「グループで絞り込む」で最初のグループが隠れていれば、隠れていない次のグループの節）。折りたたんだ節の住人は DOM に作らない
   ・開いている節の住人を通して数え、1ページ 25／50／100 人に分ける（上と下にページ送り）。住人を足す・複製・並び替えたら、その人が見えるページへ
   ・名前・メモで探す（一致した人は、折りたたんだ節の中でも出す）
   ・関係の表：住人のページ送りがあるときは「このページの住人に関わる関係／すべての関係」を選べる。名前で探す。50本ずつのページ送り
   ・箱庭タブの参加者選び（住人が41人以上のとき）：グループごとの折りたたみ・名前で探す・選んでいる人だけ表示。参加している人はいつも出す
   ・住人を選ぶセレクト（関係の起点・相手、担任の先生、⚙️ 設定の相手）が長いとき（住人61人以上）は、名前で探せる入力（datalist）を添える。
     ⚙️ 設定の、住人を並べたチェックの一覧（恋愛相手の固定など）には、名前で絞り込む欄を添える
   表示の状態（節の折りたたみ・1ページの人数）は住人の保存（state）ではなく、表示用の保存 hakoniwa:castview に置く（全年齢版は hakoniwa-z:castview。HK.store が版ごとの鍵にする）。
   ui.js が HK.CastPages.bind(ctx) で住人の状態と行の描画などを渡す（ui.js より前に読む） */
(function () {
  'use strict';
  var HK = window.HK;
  if (!HK) return;
  var esc = HK.escape;
  var SIZES = [25, 50, 100], TIE_PAGE = 50, BOX_FOLD = 100, BOX_CAP = 100, FIND_MIN = 60;
  var X = null;
  function obj(v) { return v && typeof v === 'object' && !Array.isArray(v) ? v : {}; }
  /* 表示用の保存：fold（住人タブの節。鍵 → 1 で折りたたみ）・bfold（箱庭タブの節。1 折りたたみ／0 開く。無ければ住人が多いときは折りたたみ）・size（1ページの人数） */
  var V = (function () {
    var v = null;
    try { v = HK.store ? HK.store.get('castview', null) : null; } catch (e) { v = null; }
    v = obj(v);
    return { fold: obj(v.fold), bfold: obj(v.bfold), size: SIZES.indexOf(+v.size) >= 0 ? +v.size : 50 };
  })();
  function keep() { try { if (HK.store) HK.store.set('castview', V); } catch (e) { /* 保存できなくても表示は変えられる */ } }
  /* このページを開いているあいだだけの状態：住人のページ・探す語、関係の表示・ページ・探す語、箱庭タブの探す語・選んでいる人だけ・出す人数 */
  var st = { want: '', tagSel: {}, page: 0, q: '', tmode: '', tpage: 0, tq: '', bq: '', bonly: false, bcap: BOX_CAP };

  (function () {
    if (typeof document === 'undefined' || !document.head) return;
    var css = '.cptools{display:flex;flex-wrap:wrap;gap:6px 8px;align-items:center;margin:2px 0 8px}' +
      '.cptools input[type=search]{flex:0 1 15em;min-width:9em;max-width:100%}.cptools .hint{margin:0}' +
      '.cppager{display:flex;flex-wrap:wrap;gap:4px 6px;align-items:center;margin:8px 0}' +
      '.cppager .cprange{font-size:13px;color:var(--muted);margin-right:4px}' +
      '.cppager button{min-width:36px;min-height:36px;padding:3px 9px;border:1px solid var(--line2,var(--line));border-radius:var(--r,4px);background:var(--paper,var(--surface));color:var(--ink);font:inherit;font-family:var(--f-num);font-size:13px;cursor:pointer}' +
      '.cppager button[aria-current=page]{background:var(--accent);color:var(--accent-ink);border-color:var(--accent);font-weight:700}' +
      '.cppager button:disabled{opacity:.4;cursor:default}.cppager .cpgap{color:var(--muted);padding:0 2px}' +
      '.cgrp{display:flex;flex-wrap:wrap;gap:4px 10px;align-items:center;padding:6px 12px;border-left:2px solid var(--ink);background:var(--bg1,var(--accent-soft));border-radius:0 4px 4px 0;min-width:0;margin-top:10px}' +
      '.cgrp .cgfold,.bxgin .cgfold{font:inherit;font-weight:700;background:none;border:0;padding:4px 2px;cursor:pointer;color:var(--ink);text-align:left;max-width:100%;overflow-wrap:anywhere}' +
      '.cgrp .cgn,.bxgin .cgn{font-size:13px}.cgrp .cgnote,.bxgin .cgnote{font-size:12px;color:var(--muted)}.cgrp .cgsp{flex:1 1 auto}' +
      'table.per tr.bxg td,table.per tr.bxmore td{position:static;max-width:none;width:auto;min-width:0;text-align:left;background:var(--bg1,var(--accent-soft));padding:4px 10px;box-shadow:none}' +
      'table.per tr.bxmore td{background:var(--bg)}' +
      '.bxgin{position:sticky;left:10px;display:inline-flex;flex-wrap:wrap;gap:4px 10px;align-items:center;max-width:calc(100vw - 60px)}' +
      '.res .memo input.tags{flex:0 1 150px}.cptags .chip{cursor:pointer}' +
      '.cpfind{width:9em;max-width:100%;font-size:12px}.cpfind.bad{border-color:var(--warn)}' +
      '.cpfilt{display:block;width:100%;max-width:20em;margin:0 0 6px;font-size:13px}' +
      '#tiepages,#tiebody{min-width:0;max-width:100%}#tiepages select{max-width:100%}#tiepages .cptools{margin-top:0}#castlist .res-ph{height:220px;border:1px dashed var(--line);border-radius:var(--r);background:var(--surface)}@media (max-width:600px){#castlist .res-ph{height:370px}}';
    var s = document.createElement('style'); s.textContent = css; document.head.appendChild(s);
  })();

  /* ---------- 探す：全角半角・大文字小文字・カタカナとひらがな・空白の違いを無視した部分一致 ---------- */
  function norm(s) {
    s = String(s == null ? '' : s);
    try { s = s.normalize('NFKC'); } catch (e) { /* 古い環境 */ }
    return s.toLowerCase().replace(/[ァ-ヶ]/g, function (ch) { return String.fromCharCode(ch.charCodeAt(0) - 0x60); }).replace(/[\s　]+/g, '');
  }
  /* how：省略＝名前だけ（関係の表）／'box'＝名前・グループ・タグ（箱庭タブの参加者選び）／true＝名前・メモ・グループ・タグ（住人の一覧） */
  function hit(c, q, how) {
    if (!q) return true;
    if (!c) return false;
    if (norm(c.name).indexOf(q) >= 0) return true;
    if (!how) return false;
    if (norm(c.group).indexOf(q) >= 0 || norm(c.tags).indexOf(q) >= 0) return true;
    return how === true && norm(c.memo).indexOf(q) >= 0;
  }
  /* タグ（グループとは別の目印。c.tags は読点・カンマ区切りの文字列）。文字列ごとに一度だけ分ける */
  var tagMemo = Object.create(null), tagMemoN = 0;
  function tagList(c) {
    var s = String((c && c.tags) || ''), m = tagMemo[s];
    if (m) return m;
    var t = []; s.split(/[,，、]/).forEach(function (x) { x = x.trim(); if (x && t.indexOf(x) < 0) t.push(x); });
    if (++tagMemoN > 5000) { tagMemo = Object.create(null); tagMemoN = 0; }
    return (tagMemo[s] = t);
  }
  /* 住人に付いているタグ（最初に出てきた順）と人数 */
  function allTags() {
    var out = [], n = Object.create(null);
    X.S().chars.forEach(function (c) { tagList(c).forEach(function (t) { if (!n[t]) { n[t] = 0; out.push(t); } n[t]++; }); });
    return { list: out, n: n };
  }
  /* 「タグで絞り込む」で選んだタグをすべて持つか（AND） */
  function tagOk(c) {
    var ks = Object.keys(st.tagSel);
    if (!ks.length) return true;
    var t = tagList(c);
    return ks.every(function (k) { return t.indexOf(k) >= 0; });
  }
  function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }

  /* ---------- 節（グループごと） ----------
     forBox：箱庭タブ（「グループで絞り込む」は住人の一覧だけのものなので効かせない）。
     list：その節に出す住人（S.chars の番号）、multi：そのうちほかのグループにも入っている人、also：このグループにも入っているが、ほかの節に出している人 */
  function secKey(g) { return g ? 'g:' + g : 'none'; }
  /* グループの分け方は同じ文字列なら同じなので、文字列ごとに一度だけ分ける（住人1000人で何度も呼ぶため） */
  function glCache() { var m = Object.create(null); return function (c) { var k = (c && c.group) || ''; return m[k] || (m[k] = X.grpList(c)); }; }
  /* グループの並び（ui.js の groupsOf と同じ：住人の並びで最初に出てきた順） */
  function groupsOf(gl) { var g = [], seen = Object.create(null); X.S().chars.forEach(function (c) { gl(c).forEach(function (x) { if (!seen[x]) { seen[x] = 1; g.push(x); } }); }); return g; }
  function sections(forBox) {
    var S = X.S(), gl = glCache(), gs = groupsOf(gl), h = forBox ? {} : (S.grpHide || {}), by = Object.create(null), out = [];
    gs.forEach(function (g) { if (!h[g]) { by[g] = { g: g, key: secKey(g), list: [], multi: 0, also: 0 }; out.push(by[g]); } });
    var none = { g: '', key: 'none', list: [], multi: 0, also: 0 };
    S.chars.forEach(function (c, i) {
      var g = gl(c), home = null;
      /* 「グループで絞り込む」で隠している住人（ui.js の grpHidden と同じ：つけたグループがすべて隠れているか、グループなしを隠しているとき） */
      if (!forBox && (g.length ? g.every(function (x) { return h[x]; }) : !!S.grpHideNone)) return;
      if (!g.length) home = none;
      else for (var k = 0; k < g.length && !home; k++) home = by[g[k]] || null;
      if (!home) return;
      home.list.push(i);
      if (g.length > 1) { home.multi++; g.forEach(function (x) { if (by[x] && by[x] !== home) by[x].also++; }); }
    });
    if (none.list.length) out.push(none);
    out = out.filter(function (s) { return s.list.length || s.also; });
    out.grouped = gs.length > 0;
    return out;
  }
  /* 住人の一覧の見え方：節・ページ・このページに出す人 */
  function castView() {
    var S = X.S(), secs = sections(false), grouped = secs.grouped, q = norm(st.q), flat = [], folded = 0;
    /* 探す語かタグの絞り込みがあるときは、一致した人を折りたたんだ節の中でも出す */
    var tf = Object.keys(st.tagSel).length > 0;
    if (tf && !q) q = '\u0000';
    secs.forEach(function (s) {
      s.open = !grouped || !V.fold[s.key];
      s.show = q ? s.list.filter(function (i) { return hit(S.chars[i], q === '\u0000' ? '' : q, true) && tagOk(S.chars[i]); }) : s.list;
      if (q || s.open) s.show.forEach(function (i) { flat.push(i); }); else folded += s.list.length;
    });
    var size = V.size, total = flat.length, pages = Math.max(1, Math.ceil(total / size));
    st.page = clamp(st.page | 0, 0, pages - 1);
    var from = st.page * size;
    return { secs: secs, grouped: grouped, flat: flat, total: total, pages: pages, from: from, size: size, onPage: flat.slice(from, from + size), paged: total > size, q: q, folded: folded };
  }
  /* ページ番号の並び（1 … 4 5 [6] 7 8 … 20）。-1 は「…」 */
  function pageNums(p, n) {
    var out = [];
    for (var k = 0; k < n; k++) {
      if (k === 0 || k === n - 1 || Math.abs(k - p) <= 2) out.push(k);
      else if (out[out.length - 1] !== -1) out.push(-1);
    }
    return out;
  }
  /* ページ送り（act：押したときの動作、unit：人／本、note：範囲の後ろに足す注記） */
  function pager(act, label, p, n, from, size, total, unit, note, where) {
    if (total <= size) return '';
    return '<nav class="cppager" data-where="' + where + '" aria-label="' + label + 'のページ送り（' + (where === 'top' ? '上' : '下') + '）"><span class="cprange">' + (from + 1) + '〜' + Math.min(total, from + size) + unit + '目／全' + total + unit + (note || '') + '</span>' +
      '<button type="button" id="' + act + '-' + where + '-prev" data-act="' + act + '" data-p="' + (p - 1) + '"' + (p > 0 ? '' : ' disabled') + '>‹ 前へ</button>' +
      pageNums(p, n).map(function (k) { return k < 0 ? '<span class="cpgap" aria-hidden="true">…</span>' : '<button type="button" id="' + act + '-' + where + '-' + k + '" data-act="' + act + '" data-p="' + k + '"' + (k === p ? ' aria-current="page"' : '') + ' aria-label="' + (k + 1) + 'ページ目">' + (k + 1) + '</button>'; }).join('') +
      '<button type="button" id="' + act + '-' + where + '-next" data-act="' + act + '" data-p="' + (p + 1) + '"' + (p < n - 1 ? '' : ' disabled') + '>次へ ›</button></nav>';
  }

  /* ---------- 住人の一覧（ui.js の renderCast が差し込む） ---------- */
  /* グループの見出し：折りたたみの矢印・グループ名・人数（Mono）・注記・「仲間とみなす」・右端に「このグループを箱庭に入れる」「名前を変更」（ui-cast-tools.js の grpTools） */
  var ARROW = '<svg width="10" height="6" viewBox="0 0 10 6" aria-hidden="true" focusable="false"><path d="M1 1l4 4 4-4" fill="none" stroke="currentColor" stroke-width="1.5"/></svg>';
  function castHead(s, n, v, no) {
    if (v.q && !s.show.length) return '';
    var name = s.g || 'グループなし', open = s.open || !!v.q, notes = [], CT = HK.CastTools;
    if (s.multi) notes.push('うち' + s.multi + '人はほかのグループにも');
    if (s.also) notes.push('ほかのグループの節にも' + s.also + '人');
    if (!open) notes.push('折りたたみ中');
    var go = '';
    if (open && s.show.length && !n && v.paged) { var at = Math.floor(v.flat.indexOf(s.show[0]) / v.size); go = '<button type="button" class="btn small ghost" data-act="cppage" data-p="' + at + '" title="このグループの住人が出ているページへ">' + (at + 1) + 'ページ目へ</button>'; }
    return '<div class="cgrp" data-g="' + esc(s.key) + '"><button type="button" class="cgfold" id="cgf-' + no + '" data-act="cpfold" data-g="' + esc(s.key) + '" aria-expanded="' + open + '" aria-label="' + esc(name) + 'を' + (open ? '折りたたむ' : '開く') + '"' + (v.q ? ' disabled title="探しているあいだは、一致した人をどのグループでも出します"' : '') + '>' + ARROW + '<span>' + esc(name) + '</span></button>' +
      '<span class="cgn">' + (v.q ? s.show.length + ' / ' : '') + s.list.length + '</span>' + (notes.length ? '<span class="cgnote">' + esc(notes.join('・')) + '</span>' : '') +
      (s.g && CT ? CT.grpTools(s.g).replace('<span class="cgsp"></span>', '<span class="cgsp"></span>' + go) : '<span class="cgsp"></span>' + go) + '</div>';
  }
  /* 仮の枠を住人の行に入れ替える（描き直しが続いたら、古い分は捨てる） */
  var SYNC = 6, fillGen = 0;
  function fillPh() {
    var S = X.S(), box = document.getElementById('castlist');
    if (!box) return;
    var phs = [], html = '';
    Array.prototype.forEach.call(box.querySelectorAll('.res-ph'), function (ph) { var i = +ph.getAttribute('data-ph'), c = S.chars[i]; if (c) { html += X.resRow(c, i); phs.push(ph); } });
    if (!phs.length) return;
    /* まとめて一度に組み立ててから、枠と入れ替える */
    var tpl = document.createElement('template');
    tpl.innerHTML = html;
    var kids = Array.prototype.slice.call(tpl.content.children);
    phs.forEach(function (ph, k) { if (kids[k] && ph.parentNode) ph.parentNode.replaceChild(kids[k], ph); });
  }
  function fillLater(list) {
    var g = ++fillGen;
    if (!list.length) return;
    setTimeout(function () { if (g === fillGen && X) fillPh(); }, 0);
  }
  /* いますぐ全部描く（点検・試験用） */
  function fillNow() {
    fillGen++; fillPh();
    var b = document.getElementById('tiebody');
    if (b && lastTieRow && b.querySelector('p.hint') && !b.querySelector('.tierow')) { tieGen++; b.innerHTML = tieBody(castView()); after(b); }
  }
  function castHtml() { var p = castParts(); return '<div id="castpages">' + p.tools + '<div id="castbody">' + p.body + '</div></div>'; }
  /* bodyOnly：一覧だけ描き直すとき（ページ送り・折りたたみ・探す）は道具の行を組み立てない */
  function castParts(bodyOnly) {
    var S = X.S(), v = castView(), on = {}, many = S.chars.length > SIZES[0], body = '', n = 0, later = [];
    v.onPage.forEach(function (i) { on[i] = 1; });
    var TG = allTags(), sel = st.tagSel;
    st.tagKey = TG.list.join('\u0001');
    Object.keys(sel).forEach(function (k) { if (!TG.n[k]) delete sel[k]; });
    /* タグで絞り込む：札を押すと、その札のタグを持つ人だけ（いくつも押すと、すべてのタグを持つ人＝AND） */
    var tagRow = TG.list.length ? '<div class="row cptools cptags"><span class="hint">タグで絞り込む：</span>' + TG.list.map(function (t) { var on = !!sel[t]; return '<button type="button" class="chip" data-act="cptag" data-t="' + esc(t) + '" aria-pressed="' + on + '" title="' + esc(t) + 'のタグを持つ住人' + (on ? 'の絞り込みをやめる' : 'だけを出す（いくつも選ぶと、すべてを持つ人）') + '">' + esc(t) + '（' + TG.n[t] + '）</button>'; }).join('') +
      (Object.keys(sel).length ? '<button type="button" class="btn small ghost" data-act="cptagclear">タグの絞り込みをやめる</button>' : '') + '</div>' : '';
    var dl = '<datalist id="taglist">' + TG.list.map(function (t) { return '<option value="' + esc(t) + '">'; }).join('') + '</datalist>';
    /* ツールバー（1本）：探す｜グループの件数つきチップ｜並び｜すべて折りたたむ・すべて開く＋「50 人 / 頁」（チップと並びは ui-cast-tools.js） */
    var CT = HK.CastTools;
    var tools = bodyOnly ? '' : dl + (S.chars.length > 1 ? '<div class="ctbar cptools" role="group" aria-label="住人の一覧の表示">' +
      '<input type="search" id="cpq" value="' + esc(st.q) + '" placeholder="名前・メモ・グループ・タグで探す" aria-label="住人を名前・メモ・グループ・タグで探す" autocomplete="off" enterkeyhint="search">' +
      (CT ? CT.chips() + CT.sortSel() : '') +
      (v.grouped || many ? '<span class="ctview">' + (v.grouped && CT ? CT.foldBtns() : '') +
        (many ? '<select id="cpsize" aria-label="1ページに出す住人の数">' + SIZES.map(function (n) { return '<option value="' + n + '"' + (n === V.size ? ' selected' : '') + '>' + n + ' 人 / 頁</option>'; }).join('') + '</select>' : '') + '</span>' : '') +
      '</div>' : '') + tagRow;
    v.secs.forEach(function (s, no) {
      var rows = (v.q || s.open) ? s.show.filter(function (i) { return on[i]; }) : [];
      if (v.grouped) body += castHead(s, rows.length, v, no);
      rows.forEach(function (i) {
        /* このページの住人が多いとき（13人以上）は、画面の上のほうの住人（SYNC 人）と、これから選ぶ住人（st.want）だけをすぐに描き、残りは仮の枠にして、すぐあとに描く（上の fillLater） */
        if (v.onPage.length <= SYNC * 2 || n++ < SYNC || S.chars[i].id === st.want || S.chars[i].id === st.wantGear) body += X.resRow(S.chars[i], i);
        else { body += '<div class="res-ph" data-ph="' + i + '" aria-hidden="true"></div>'; later.push(i); }
      });
    });
    if (v.q && !v.total) body += '<p class="hint" style="margin:0">' + (st.q ? '「' + esc(st.q) + '」に合う' : '') + (Object.keys(st.tagSel).length ? (st.q ? '、' : '') + '選んだタグをすべて持つ' : '') + '住人はいません。</p>';
    var note = v.folded && !v.q ? '（折りたたみ中の' + v.folded + '人を除く）' : '';
    st.want = '';
    fillLater(later);
    return { tools: tools, view: v, body: pager('cppage', '住人', st.page, v.pages, v.from, v.size, v.total, '人', note, 'top') +
      '<div class="cast" id="castlist">' + body + '</div>' + pager('cppage', '住人', st.page, v.pages, v.from, v.size, v.total, '人', note, 'bottom') };
  }
  /* ページを移る・節を開け閉めする・探すとき：住人の一覧と、関係の表（このページの住人に関わる関係のとき）だけを描き直す（住人タブ全体は描き直さない）。
     関係の表の形（表示する関係の選択・ページ送りの有無）が変わるときは、住人タブ全体を描き直す */
  function pageRedraw() {
    var b = document.getElementById('castbody'), T = X.S().ties || [], v = castView();
    var big = !!T.length && (v.paged || T.length > TIE_PAGE);
    if (!b || big !== !!document.getElementById('tiepages') || (big && v.paged !== !!document.getElementById('tmode'))) { castRedraw(); return; }
    var p = castParts(true);
    b.innerHTML = p.body;
    after(b);
    var tb = document.getElementById('tiebody');
    if (tb && lastTieRow && tieMode(p.view) === 'page') { st.tpage = 0; tb.innerHTML = tieLater(); }
  }
  /* その住人が見えるページへ（探す語に合わなければ語を消し、節を折りたたんでいれば開く。「グループで絞り込む」で隠している人はそのまま） */
  function reveal(id) {
    if (!X) return;
    var S = X.S(), i = -1;
    S.chars.forEach(function (c, k) { if (c.id === id) i = k; });
    if (i < 0) return;
    if (st.q && !hit(S.chars[i], norm(st.q), true)) st.q = '';
    if (!tagOk(S.chars[i])) st.tagSel = {};
    var v = castView();
    v.secs.forEach(function (s) { if (s.list.indexOf(i) >= 0 && !s.open) { delete V.fold[s.key]; keep(); } });
    v = castView();
    var at = v.flat.indexOf(i);
    if (at >= 0) st.page = Math.floor(at / v.size);
    st.want = id;
  }
  /* 上下の矢印キーでの並び替え：同じ節の、一つ上（下）に見えている人の S.chars の番号（いなければ -1） */
  function step(id, dir) {
    var S = X.S(), v = castView(), i = -1;
    S.chars.forEach(function (c, k) { if (c.id === id) i = k; });
    var sec = v.secs.filter(function (s) { return s.list.indexOf(i) >= 0; })[0];
    if (!sec) return -1;
    var at = sec.show.indexOf(i), to = sec.show[at + dir];
    return at < 0 || to == null ? -1 : to;
  }

  /* ---------- 関係の表（ui.js の tiesSection が行の描画 rowOf を渡す） ---------- */
  var lastTieRow = null;
  function tieMode(cv) { return cv.paged ? (st.tmode || 'page') : 'all'; }
  function tieList(cv) {
    var S = X.S(), T = S.ties || [], mode = tieMode(cv), q = norm(st.tq), on = {}, by = {}, ks = [];
    S.chars.forEach(function (c) { by[c.id] = c; });
    if (mode === 'page') cv.onPage.forEach(function (i) { on[S.chars[i].id] = 1; });
    T.forEach(function (t, k) {
      if (mode === 'page' && !on[t.a] && !on[t.b]) return;
      if (q && !(hit(by[t.a], q) || hit(by[t.b], q))) return;
      ks.push(k);
    });
    return ks;
  }
  function tieBody(cv) {
    var T = X.S().ties || [], ks = tieList(cv), pages = Math.max(1, Math.ceil(ks.length / TIE_PAGE));
    st.tpage = clamp(st.tpage | 0, 0, pages - 1);
    var from = st.tpage * TIE_PAGE, rows = ks.slice(from, from + TIE_PAGE).map(function (k) { return lastTieRow(T[k], k); }).join('');
    if (!ks.length) rows = '<p class="hint" style="margin:0">' + (st.tq ? '「' + esc(st.tq) + '」に合う関係はありません。' : 'このページの住人に関わる関係はありません（「すべての関係」で、ほかの関係も見られます）。') + '</p>';
    return pager('tpage', '関係', st.tpage, pages, from, TIE_PAGE, ks.length, '本', '', 'top') + rows + pager('tpage', '関係', st.tpage, pages, from, TIE_PAGE, ks.length, '本', '', 'bottom');
  }
  function tieHtml(rowOf) {
    var T = X.S().ties || [];
    lastTieRow = rowOf;
    if (!T.length) return '';
    var cv = castView();
    if (!cv.paged && T.length <= TIE_PAGE) return T.map(rowOf).join('');
    var mode = tieMode(cv);
    return '<div id="tiepages"><div class="row cptools">' +
      (cv.paged ? '<label class="hint">表示する関係 <select id="tmode" aria-label="表示する関係"><option value="page"' + (mode === 'page' ? ' selected' : '') + '>このページの住人に関わる関係</option><option value="all"' + (mode === 'all' ? ' selected' : '') + '>すべての関係（' + T.length + '本）</option></select></label>' : '') +
      '<input type="search" id="tq" value="' + esc(st.tq) + '" placeholder="関係を名前で探す" aria-label="関係を住人の名前で探す" autocomplete="off" enterkeyhint="search"></div>' +
      '<div id="tiebody">' + tieLater() + '</div></div>';
  }
  /* 関係の行は住人の一覧より下にあるので、住人の一覧を描いたすぐあとに描く（描き直しが続いたら、古い分は捨てる） */
  var tieGen = 0;
  function tieLater() {
    var g = ++tieGen;
    setTimeout(function () {
      if (g !== tieGen || !X || !lastTieRow) return;
      var b = document.getElementById('tiebody');
      if (b) { b.innerHTML = tieBody(castView()); after(b); }
    }, 0);
    return '<p class="hint" style="margin:0">関係を表示しています…</p>';
  }
  /* 足した関係（S.ties の k 番目）が見えるように：今の表示に無ければ「すべての関係」にして、そのページへ */
  function revealTie(k) {
    if (!X) return;
    st.tq = '';
    var cv = castView(), ks = tieList(cv);
    if (ks.indexOf(k) < 0) { st.tmode = 'all'; ks = tieList(cv); }
    var at = ks.indexOf(k);
    if (at >= 0) st.tpage = Math.floor(at / TIE_PAGE);
  }

  /* ---------- 箱庭タブの参加者選び（住人が41人以上のとき。ui.js の renderBox が行の描画 rowOf を渡す） ---------- */
  function boxOpen(s, grouped) {
    if (!grouped) return true;
    var f = V.bfold[s.key];
    return f != null ? !f : X.S().chars.length <= BOX_FOLD;
  }
  function boxTools() {
    var grouped = groupsOf(glCache()).length > 0;
    return '<div class="row cptools bxtools"><input type="search" id="bxq" value="' + esc(st.bq) + '" placeholder="名前・グループ・タグで探す" aria-label="参加者を選ぶ住人を名前・グループ・タグで探す" autocomplete="off" enterkeyhint="search">' +
      '<label class="hint"><input type="checkbox" id="bxonly"' + (st.bonly ? ' checked' : '') + '> 選んでいる人だけ表示</label>' +
      (grouped ? '<button type="button" class="btn small" data-act="bxfoldall">すべて折りたたむ</button><button type="button" class="btn small" data-act="bxopenall">すべて開く</button>' : '') +
      '<span class="hint">参加している人は、折りたたんだグループの中でもいつも表示します。</span></div>';
  }
  function boxRows(rowOf, J, ncol) {
    var S = X.S(), q = norm(st.bq), jn = {}, html = '';
    J.forEach(function (c) { jn[c.id] = 1; });
    var line = function (cls, inner) { return '<tr class="' + cls + '"><td colspan="' + ncol + '"><div class="bxgin">' + inner + '</div></td></tr>'; };
    if (st.bonly) {
      S.chars.forEach(function (c, i) { if (jn[c.id] && hit(c, q, 'box')) html += rowOf(c, i); });
      return html || line('bxg', '<span class="cgnote">' + (q ? '「' + esc(st.bq) + '」に合う、選んでいる人はいません。' : 'まだ誰も選んでいません。') + '</span>');
    }
    var secs = sections(true), grouped = secs.grouped, shown = 0, rest = 0;
    secs.forEach(function (s) {
      var open = boxOpen(s, grouped), nj = 0, nm = 0, rows = '';
      s.list.forEach(function (i) {
        var c = S.chars[i], j = !!jn[c.id];
        if (j) nj++;
        if (q && !hit(c, q, 'box')) return;
        nm++;
        if (!j && !open && !q) return;
        if (!j) { if (shown >= st.bcap) { rest++; return; } shown++; }
        rows += rowOf(c, i);
      });
      if (grouped && (!q || nm)) {
        var name = s.g || 'グループなし';
        html += line('bxg', '<button type="button" class="cgfold" data-act="bxfold" data-g="' + esc(s.key) + '" aria-expanded="' + (open || !!q) + '"' + (q ? ' disabled' : '') + ' aria-label="' + esc(name) + 'を' + (open ? '折りたたむ' : '開く') + '"><span aria-hidden="true">' + (open || q ? '▾' : '▸') + '</span> ' + esc(name) + '</button>' +
          '<span class="cgn">' + (q ? nm + '人が一致・' : '') + '参加 ' + nj + '／' + s.list.length + '人</span>' + (!open && !q ? '<span class="cgnote">折りたたみ中（参加している人だけ表示）</span>' : ''));
      }
      html += rows;
    });
    if (rest) html += line('bxmore', '<span class="cgnote">ほかに' + rest + '人います（グループを折りたたむか、名前で探すと絞れます）</span><button type="button" class="btn small" data-act="bxmore">さらに' + BOX_CAP + '人を表示</button>');
    if (q && !html) html = line('bxg', '<span class="cgnote">「' + esc(st.bq) + '」に合う住人はいません。</span>');
    return html;
  }

  /* ---------- 関係の種類の欄（住人が多いとき）：選んでいる種類だけで描き（data-lazyt）、触れたときに全部の種類を入れる ---------- */
  function typeOpt(ty) {
    var d = HK.TIES[ty];
    return d ? '<option value="' + esc(ty) + '" selected>' + esc(d.label) + (d.dir ? '（' + d.roleA + '→' + d.roleB + '）' : '') + '</option>' : '';
  }
  function typeFill(ev) {
    var t = ev.target;
    if (!t || t.tagName !== 'SELECT' || !t.hasAttribute('data-lazyt')) return;
    t.removeAttribute('data-lazyt');
    var v = t.value;
    t.innerHTML = HK.tieOptions ? HK.tieOptions(v, { dir: true }) : HK.TIE_ORDER.map(typeOpt).join('');
    t.value = v;
  }
  if (typeof document !== 'undefined' && document.addEventListener) ['focusin', 'mousedown', 'touchstart', 'keydown'].forEach(function (k) { document.addEventListener(k, typeFill, true); document.addEventListener(k, lazyFill, true); });
  /* 住人を全員並べるセレクト（⚙️ 設定の「相手」「同一人物」）：選んでいる人だけで描き（data-cplazy）、触れたときに全員の選択肢を入れる。
     住人1000人だと1つで数十msかかり、窓を開くのが重かった。lazyAttr(全部の選択肢の HTML) が属性を返す（最近の 30 個だけ覚える） */
  var lazyMap = {}, lazyIds = [], lazyN = 0;
  function lazyAttr(full) {
    var id = 'z' + (++lazyN);
    lazyMap[id] = full; lazyIds.push(id);
    while (lazyIds.length > 30) delete lazyMap[lazyIds.shift()];
    return ' data-cplazy="' + id + '"';
  }
  function lazyOpen(sel) {
    var id = sel.getAttribute('data-cplazy');
    if (!id) return;
    sel.removeAttribute('data-cplazy');
    if (lazyMap[id] == null) return;
    var v = sel.value;
    sel.innerHTML = lazyMap[id];
    sel.value = v;
  }
  function lazyFill(ev) { var t = ev.target; if (t && t.tagName === 'SELECT' && t.hasAttribute('data-cplazy')) lazyOpen(t); }

  /* ---------- 住人を選ぶセレクトに「名前で探す」を添える・チェックの一覧を名前で絞る ---------- */
  var DL = 'hk-cpnames', dlKey = '', dlMap = {}, filt = {};
  function charIds() { var m = {}; X.S().chars.forEach(function (c) { m[c.id] = 1; }); return m; }
  function isCharSel(sel, ids) {
    if (sel.hasAttribute('data-lazy') || sel.hasAttribute('data-cplazy')) return true;
    if (sel.options.length <= FIND_MIN) return false;
    var n = 0;
    for (var i = 0; i < sel.options.length; i++) if (ids[sel.options[i].value]) n++;
    return n > FIND_MIN;
  }
  /* 名前の候補（同じ名前が二人以上いれば「名前（3番目）」で分ける）。名前が変わったときだけ作り直す */
  function names() {
    var S = X.S(), key = S.chars.length + '\u0001' + S.chars.map(function (c) { return c.id + '\u0002' + c.name; }).join('\u0001');
    var dl = document.getElementById(DL);
    if (dl && key === dlKey) return;
    dlKey = key; dlMap = {};
    var cnt = {};
    S.chars.forEach(function (c) { cnt[c.name] = (cnt[c.name] || 0) + 1; });
    var opts = S.chars.map(function (c, i) {
      var lb = cnt[c.name] > 1 ? c.name + '（' + (i + 1) + '番目）' : c.name;
      dlMap[lb] = c.id;
      if (cnt[c.name] === 1) dlMap[norm(c.name)] = c.id;
      return '<option value="' + esc(lb) + '">';
    }).join('');
    if (!dl) { dl = document.createElement('datalist'); dl.id = DL; document.body.appendChild(dl); }
    dl.innerHTML = opts;
  }
  function resolve(v) {
    v = String(v || '').trim();
    if (!v) return '';
    names();
    if (dlMap[v]) return dlMap[v];
    var n = norm(v);
    if (dlMap[n]) return dlMap[n];
    /* 部分一致で一人だけに決まるなら、その人 */
    var S = X.S(), got = S.chars.filter(function (c) { return norm(c.name).indexOf(n) >= 0; });
    return got.length === 1 ? got[0].id : '';
  }
  /* 描き直したあと、項目ごとの折りたたみ（ui-fold.js）が節を <details> に移すと、そのとき選んでいた欄のフォーカスが外れる。
     描き直しから折りたたみまでのあいだに選ばれた欄（名前の欄・探す欄・並び替えの ≡ など）を、折りたたみのあとで選び直す */
  var refo = { on: false, el: null, s0: null, s1: null };
  if (typeof document !== 'undefined' && document.addEventListener) document.addEventListener('focusin', function (ev) { if (refo.on) { refo.el = ev.target; refo.s0 = refo.s1 = null; } }, true);
  function refocusLater() {
    if (refo.on) return;
    refo.on = true; refo.el = null;
    Promise.resolve().then(function () {
      refo.on = false;
      var el = refo.el; refo.el = null;
      if (!el || !el.isConnected || document.activeElement === el) return;
      try { el.focus({ preventScroll: true }); } catch (e) { el.focus(); }
      try { if (refo.s0 != null) el.setSelectionRange(refo.s0, refo.s1); } catch (e) { /* 選択の無い欄 */ }
    });
  }
  function after(root) {
    if (root && (root.id === 'view-cast' || root.id === 'view-box')) refocusLater();
    if (!X || !root || X.S().chars.length <= FIND_MIN) return;
    var ids = charIds();
    Array.prototype.forEach.call(root.querySelectorAll('select'), function (sel) {
      if (sel.disabled || !isCharSel(sel, ids)) return;
      var nx = sel.nextElementSibling;
      if (nx && nx.classList.contains('cpfind')) return;
      var inp = document.createElement('input');
      inp.type = 'search'; inp.className = 'cpfind'; inp.setAttribute('list', DL); inp.placeholder = '名前で探す'; inp.autocomplete = 'off';
      inp.setAttribute('aria-label', (sel.getAttribute('aria-label') || '住人') + 'を名前で探して選ぶ');
      inp.title = '名前を入れて候補から選ぶと、左の欄がその人になります';
      sel.parentNode.insertBefore(inp, sel.nextSibling);
    });
    /* チェックの一覧（⚙️ 設定の、恋愛相手の固定・恋愛にしない相手・敬語で話す相手 など） */
    var dets = Array.prototype.slice.call(root.querySelectorAll('details'));
    if (root.tagName === 'DETAILS') dets.unshift(root);
    dets.forEach(function (d) {
      var box = d.querySelector('.gearrow');
      if (!box || box.querySelector('.cpfilt')) return;
      var labs = box.querySelectorAll('label');
      if (labs.length <= FIND_MIN || !box.querySelector('input[type=checkbox]')) return;
      var k = d.getAttribute('data-k') || d.className, inp = document.createElement('input');
      inp.type = 'search'; inp.className = 'cpfilt'; inp.placeholder = '名前で絞り込む'; inp.autocomplete = 'off';
      inp.setAttribute('aria-label', '一覧を名前で絞り込む'); inp.setAttribute('data-cpk', k);
      box.insertBefore(inp, box.firstChild);
      if (filt[k]) { inp.value = filt[k]; applyFilt(inp); }
    });
  }
  function applyFilt(inp) {
    var q = norm(inp.value);
    filt[inp.getAttribute('data-cpk')] = inp.value;
    Array.prototype.forEach.call(inp.parentNode.querySelectorAll('label'), function (l) {
      var on = !q || norm(l.textContent).indexOf(q) >= 0;
      l.style.display = on ? '' : 'none';
    });
  }
  function pick(inp) {
    var sel = inp.previousElementSibling;
    if (!sel || sel.tagName !== 'SELECT' || !inp.value.trim()) { inp.classList.remove('bad'); return; }
    var id = resolve(inp.value), has = function () { return Array.prototype.some.call(sel.options, function (o) { return o.value === id; }); };
    if (id && !has() && sel.hasAttribute('data-cplazy')) lazyOpen(sel);
    if (id && !has() && sel.hasAttribute('data-lazy')) {
      /* 関係の行の住人の欄（ui.js の tieFill）：触れたときに全員の選択肢を入れる */
      try { sel.dispatchEvent(new FocusEvent('focusin', { bubbles: true })); } catch (e) { /* 古い環境 */ }
      if (!has()) { var c = X.S().chars.filter(function (x) { return x.id === id; })[0]; if (c) sel.appendChild(new Option(c.name, c.id)); }
    }
    if (!id || !has()) { inp.classList.add('bad'); inp.title = id ? 'この欄では選べない人です' : 'その名前の住人は見つかりません（候補から選んでください）'; return; }
    inp.classList.remove('bad'); inp.title = '名前を入れて候補から選ぶと、左の欄がその人になります';
    inp.value = '';
    if (sel.value === id) return;
    sel.value = id;
    sel.dispatchEvent(new Event('change', { bubbles: true }));
  }

  /* ---------- 描き直し（入力中の欄・見ている位置を保つ） ---------- */
  function redraw(fn, focusId) {
    var ae = document.activeElement, fid = focusId || (ae && ae.id), s0 = null, s1 = null, y = window.pageYOffset;
    try { if (ae && ae.id === fid && typeof ae.selectionStart === 'number') { s0 = ae.selectionStart; s1 = ae.selectionEnd; } } catch (e) { /* 選択の無い欄 */ }
    fn();
    if (Math.abs(window.pageYOffset - y) > 1) window.scrollTo(0, y);
    var el = fid && document.getElementById(fid);
    if (el && el !== document.activeElement && el.focus) {
      try { el.focus({ preventScroll: true }); } catch (e) { el.focus(); }
      try { if (s0 != null) el.setSelectionRange(s0, s1); } catch (e) { /* 選択の無い欄 */ }
    }
    if (el && refo.on && refo.el === el) { refo.s0 = s0; refo.s1 = s1; }
  }
  function castRedraw(focusId) { redraw(function () { X.renderCast(); }, focusId); }
  function boxRedraw(focusId) { redraw(function () { X.boxRedraw(); }, focusId); }
  /* ページを移ったら、下のページ送りで押したときは一覧の頭へ */
  function toTop(id, where) {
    if (where !== 'bottom') return;
    var el = document.getElementById(id);
    if (el && el.scrollIntoView) { try { el.scrollIntoView({ block: 'start' }); } catch (e) { el.scrollIntoView(); } }
  }

  if (typeof document !== 'undefined' && document.addEventListener) {
    /* ⚙️ 設定を開いた住人：閉じたときの描き直しで、すぐに描く（ui-gear.js が閉じたあとでその人の ⚙️ に戻る） */
    document.addEventListener('click', function (ev) { var g = ev.target && ev.target.closest && ev.target.closest('#castlist [data-act=gear]'), r = g && g.closest('.res'); if (r) st.wantGear = r.getAttribute('data-id'); }, true);
    document.addEventListener('click', function (ev) {
      var t = ev.target && ev.target.closest && ev.target.closest('[data-act]');
      if (!t || !X) return;
      var act = t.getAttribute('data-act'), g = t.getAttribute('data-g'), where = (t.closest('.cppager') || { dataset: {} }).dataset.where;
      switch (act) {
        case 'cptag': var tk = t.getAttribute('data-t'); if (st.tagSel[tk]) delete st.tagSel[tk]; else st.tagSel[tk] = 1; st.page = 0; castRedraw(); break;
        case 'cptagclear': st.tagSel = {}; st.page = 0; castRedraw(); break;
        case 'cpfold': if (V.fold[g]) delete V.fold[g]; else V.fold[g] = 1; keep(); redraw(pageRedraw); break;
        case 'cpfoldall': case 'cpopenall':
          V.fold = {};
          if (act === 'cpfoldall') sections(false).forEach(function (s) { V.fold[s.key] = 1; });
          st.page = 0; keep(); redraw(pageRedraw); break;
        case 'cppage': st.page = +t.getAttribute('data-p') || 0; redraw(pageRedraw); toTop('castpages', where); break;
        case 'tpage': st.tpage = +t.getAttribute('data-p') || 0; redraw(tieRedraw); toTop('tiepages', where); break;
        case 'bxfold': var bs = sections(true).filter(function (s) { return s.key === g; })[0], bo = bs ? boxOpen(bs, true) : true; V.bfold[g] = bo ? 1 : 0; keep(); boxRedraw(); break;
        case 'bxfoldall': case 'bxopenall':
          V.bfold = {};
          sections(true).forEach(function (s) { V.bfold[s.key] = act === 'bxfoldall' ? 1 : 0; });
          st.bcap = BOX_CAP; keep(); boxRedraw(); break;
        case 'bxmore': st.bcap += BOX_CAP; boxRedraw(); break;
      }
    });
    /* 関係の表だけ描き直す（探す語・ページ）。住人の欄の「名前で探す」も添え直す */
    var tieRedraw = function () {
      var b = document.getElementById('tiebody');
      if (!b || !lastTieRow) { castRedraw(); return; }
      tieGen++;
      b.innerHTML = tieBody(castView());
      after(b);
    };
    /* 探す欄：文字を変換している途中（IME）は描き直さない。打ち終えて少し待ってから */
    var timer = null;
    var onQuery = function (t) {
      clearTimeout(timer);
      timer = setTimeout(function () {
        if (t.id === 'cpq') { if (st.q === t.value) return; st.q = t.value; st.page = 0; redraw(pageRedraw, 'cpq'); }
        else if (t.id === 'tq') { if (st.tq === t.value) return; st.tq = t.value; st.tpage = 0; tieRedraw(); }
        else if (t.id === 'bxq') { if (st.bq === t.value) return; st.bq = t.value; st.bcap = BOX_CAP; boxRedraw('bxq'); }
      }, 180);
    };
    document.addEventListener('input', function (ev) {
      var t = ev.target;
      if (!t || !X) return;
      if (t.id === 'cpq' || t.id === 'tq' || t.id === 'bxq') { if (!ev.isComposing) onQuery(t); return; }
      if (t.classList && t.classList.contains('cpfilt')) { applyFilt(t); return; }
      /* datalist の候補を選んだとき（打っている途中は選ばない。打ち終えたら Enter か、欄を離れたとき＝change） */
      if (t.classList && t.classList.contains('cpfind') && !ev.isComposing && ev.inputType === 'insertReplacementText') pick(t);
    });
    document.addEventListener('compositionend', function (ev) { var t = ev.target; if (t && (t.id === 'cpq' || t.id === 'tq' || t.id === 'bxq')) onQuery(t); });
    document.addEventListener('change', function (ev) {
      var t = ev.target;
      if (!t || !X) return;
      if (t.id === 'cpsize') { var n = +t.value; if (SIZES.indexOf(n) < 0) return; var first = st.page * V.size; V.size = n; st.page = Math.floor(first / n); keep(); castRedraw('cpsize'); }
      else if (t.id === 'tmode') { st.tmode = t.value === 'all' ? 'all' : 'page'; st.tpage = 0; castRedraw('tmode'); }
      else if (t.id === 'bxonly') { st.bonly = !!t.checked; boxRedraw('bxonly'); }
      /* 住人のタグを書き終えたら：タグの札・候補が変わったときだけ、住人タブを描き直す（ui.js の onField が c.tags に入れたあと） */
      else if (t.getAttribute && t.getAttribute('data-f') === 'tags') {
        setTimeout(function () { if (X && allTags().list.join('\u0001') !== st.tagKey && document.getElementById('castpages')) castRedraw(); }, 0);
      }
      else if (t.classList && t.classList.contains('cpfind')) pick(t);
    });
    document.addEventListener('keydown', function (ev) { var t = ev.target; if (ev.key === 'Enter' && t && t.classList && t.classList.contains('cpfind')) { ev.preventDefault(); pick(t); } });
    document.addEventListener('focusin', function (ev) { var t = ev.target; if (X && t && t.classList && t.classList.contains('cpfind')) names(); });
  }

  HK.CastPages = {
    /* ui.js から：S（住人の状態を返す関数）・grpList・grpHidden・groupsOf・resRow・renderCast・boxRedraw */
    bind: function (ctx) { X = ctx; },
    castHtml: castHtml, tieHtml: tieHtml, typeOpt: typeOpt, lazyAttr: lazyAttr, LAZY_MIN: FIND_MIN, boxTools: boxTools, boxRows: boxRows, after: after,
    reveal: reveal, revealTie: revealTie, step: step,
    /* グループの名前を変えたとき（ui-cast-tools.js）：節の折りたたみの鍵も移す */
    renameGroup: function (o, n) { [V.fold, V.bfold].forEach(function (m) { var a = 'g:' + o, b = 'g:' + n; if (a in m) { if (!(b in m)) m[b] = m[a]; delete m[a]; } }); keep(); },
    /* 並び替え・絞り込みを変えたとき：住人の一覧の1ページ目へ */
    top: function () { st.page = 0; },
    /* 点検・試験用 */
    view: function () { return X ? castView() : null; }, fillNow: function () { if (X) fillNow(); }, state: function () { return { page: st.page, size: V.size, fold: V.fold, bfold: V.bfold, q: st.q, tq: st.tq, tmode: st.tmode, bq: st.bq, bonly: st.bonly }; },
    SIZES: SIZES
  };
})();
