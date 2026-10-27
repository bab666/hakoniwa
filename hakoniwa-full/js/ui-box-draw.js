/* 箱庭シミュレーター: 箱庭タブの描き方を軽くする（ui.js の renderBox から。全年齢版・R18版共通。ui.js の前に読む）
   箱庭タブ（#view-box）は、カード19枚・環境値・高度設定・効くもの・参加表・「箱庭を動かす」の帯の節に分かれる。
   いままでは描くたびに全部を innerHTML で作り直していて、CPU 4倍遅延で住人10人でも 300〜400ms かかっていた
   （時間のほとんどは、作り直した欄の CSS の計算・レイアウト・文字の組み立て。選択肢の多いセレクトと日本語の文が重い）。
   ・節ごとに HTML の文字列を覚えておき、変わった節だけ作り直す（住人の変化で変わるのは参加表だけ。カードは選択と読み込み中の印だけ書き換える）。
     参加表は行ごとに覚えて、変わった行だけ入れ替える（表の外の見出し・ボタン・注記は作り直す）。
     欄を手で変えた節（その場で表示を書き換える欄がある）は、文字列が同じでも次に描くときに作り直す
   ・タブを押した直後・箱庭を選び替えた直後（defer）は、カードだけ先に描き、作り直す節は次の描画のあとで1節ずつ描く。
     作り直すまでの古い節には印（.bxstale。節ごと作り直すものは薄くする .bxdim）を付け、そこへの操作は箱庭の設定に届けない。描き終えるまで #view-box に data-pending と aria-busy を付ける
   ・節の作り直しは、外の要素の上で折りたたみ（ui-fold.js の HK.Fold.apply）まで済ませてから入れる（入れたあとに組み替えて二度レイアウトしないように）
   ・隠しているあいだの箱庭タブは display:none ではなく content-visibility:hidden にして、レイアウトを捨てない（対応していないブラウザでは今までどおり）
   ・カードの HTML（選択・読み込み中の印を除く）は箱庭ごとに1回だけ作る（かたまりを読んだら作り直す：HK.Load.gen ほか、ui.js が鍵を渡す）
   画面に出るもの（HTML）は、作り直したときと同じになる。 */
(function () {
  'use strict';
  var HK = window.HK;
  if (!HK || typeof document === 'undefined') return;

  var css =
    /* 隠しているあいだもレイアウトを保つ（[hidden] の display:none!important より強い指定で上書き。対応していないブラウザでは display:none のまま） */
    '@supports (content-visibility:hidden){#view-box[hidden]{display:block!important;content-visibility:hidden}}' +
    /* 作り直す前の古い節（.bxstale。次の描画で入れ替わる）。節ごと作り直すものだけ薄くする（.bxdim）。行だけ入れ替える参加表は薄くしない（ちらつかないように）。
       pointer-events のような受け継ぐ性質を変えると節の中の全要素の CSS を計算し直すので、操作は下の mark で止める */
    '#view-box .bxdim{opacity:.5}';
  var st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);

  var BD = HK.BoxDraw = {};
  /* 最後に描いた節：kind → { html, nodes: [直下の要素], dirty（作り直す）, stale（古い印を付けた）, tail（カード）, t（参加表の行ごとの覚え） } */
  var rec = {}, host0 = null, pend = null, seq = 0;
  BD.stat = { draws: 0, built: 0, kept: 0, rows: 0, pendStart: 0, pendEnd: 0, steps: [] };

  /* ---------- カードの HTML の覚え（箱庭 id ごと。鍵が変わったら作り直す） ---------- */
  var cardMemo = {}, cardKey = null;
  BD.card = function (id, key, make) {
    if (key !== cardKey) { cardMemo = {}; cardKey = key; }
    var h = cardMemo[id];
    if (h == null) h = cardMemo[id] = make();
    return h;
  };

  /* ---------- 節の要素を作る（外の要素の上で折りたたみまで済ませる） ---------- */
  function build(host, html) {
    var tmp = document.createElement('div');
    tmp.id = host.id;   /* 折りたたみの開閉の覚え（ui-fold.js）はタブの id で引くので、同じ id にする（文書には入れない） */
    tmp.innerHTML = html;
    if (HK.Fold && HK.Fold.apply) HK.Fold.apply(tmp);
    BD.stat.built++;
    return Array.prototype.slice.call(tmp.childNodes);
  }
  function nodesOk(host) {
    if (host !== host0) return false;
    var n = 0, ok = true;
    Object.keys(rec).forEach(function (k) { rec[k].nodes.forEach(function (x) { n++; if (x.parentNode !== host) ok = false; }); });
    return ok && n === host.childNodes.length;
  }
  function remove(r) { r.nodes.forEach(function (x) { if (x.parentNode) x.parentNode.removeChild(x); }); r.nodes = []; }
  /* 節 k を、並び order の中の前の節の後ろ（なければ先頭）に置く */
  function place(host, order, k, nodes) {
    var at = null;
    for (var i = order.indexOf(k) - 1; i >= 0 && !at; i--) { var r = rec[order[i]]; if (r && r.nodes.length) at = r.nodes[r.nodes.length - 1]; }
    var ref = at ? at.nextSibling : host.firstChild;
    nodes.forEach(function (x) { host.insertBefore(x, ref); });
  }
  function put(host, order, seg) {
    var r = rec[seg.k], nodes = build(host, seg.html);
    if (r && r.nodes.length) { var ref = r.nodes[r.nodes.length - 1].nextSibling; remove(r); nodes.forEach(function (x) { host.insertBefore(x, ref); }); }
    else place(host, order, seg.k, nodes);
    var nr = rec[seg.k] = { html: seg.html, nodes: nodes, dirty: false, stale: false, tail: null, t: null };
    if (seg.rows) nr.t = rowsOf(nodes, seg);
  }

  /* ---------- 参加表（seg.rows のある節）：表の外（見出し・ボタン・注記）と行を分けて、変わった行だけ入れ替える ----------
     seg.pre は '<tbody>' まで、seg.post は '</tbody>' から。表の頭（列の見出し）が変わったら節ごと作り直す */
  var TW = '<div class="tblwrap">', TT = '</tbody></table></div>';
  function split(seg) {
    var i = seg.pre.lastIndexOf(TW);
    if (i < 0 || seg.post.indexOf(TT) !== 0) return null;
    return { outerPre: seg.pre.slice(0, i), head: seg.pre.slice(i), outerPost: seg.post.slice(TT.length) };
  }
  function rowsOf(nodes, seg) {
    var sp = split(seg), det = nodes.length === 1 && nodes[0].nodeType === 1 ? nodes[0] : null;
    var wrap = det && Array.prototype.filter.call(det.children, function (x) { return x.classList.contains('tblwrap'); })[0];
    var tb = wrap && wrap.querySelector('table.per > tbody');
    if (!sp || !tb || tb.children.length !== seg.rows.length) return null;
    return { sp: sp, det: det, wrap: wrap, tbody: tb, rows: seg.rows.slice(), trs: Array.prototype.slice.call(tb.children), dirtyTr: [], outerDirty: false };
  }
  /* 行と表の外を入れ替えられたら true（できないときは false：呼び手が節ごと作り直す） */
  function putRows(host, seg) {
    var r = rec[seg.k], t = r && r.t, sp = split(seg);
    if (!t || !sp || r.dirty || t.sp.head !== sp.head || !t.wrap.isConnected || t.wrap.parentNode !== t.det || t.tbody.parentNode.parentNode !== t.wrap) return false;
    /* 行：変わった行（と、手で変えた行）だけ。まとめて1回で読み取る */
    var n = seg.rows.length, ch = [], i;
    for (i = 0; i < n; i++) if (i >= t.trs.length || t.rows[i] !== seg.rows[i] || t.dirtyTr.indexOf(t.trs[i]) >= 0) ch.push(i);
    var made = null;
    if (ch.length) {
      var tb = document.createElement('tbody');
      tb.innerHTML = ch.map(function (k) { return seg.rows[k]; }).join('');
      if (tb.children.length !== ch.length) return false;
      made = Array.prototype.slice.call(tb.children);
    }
    /* 表の外：文字列が変わった・手で変えたときは、details の中の表（.tblwrap）以外を入れ替える */
    if (t.sp.outerPre !== sp.outerPre || t.sp.outerPost !== sp.outerPost || t.outerDirty) {
      var nn = build(host, sp.outerPre + sp.head + TT + sp.outerPost), nd = nn.length === 1 && nn[0].nodeType === 1 ? nn[0] : null;
      var nw = nd && Array.prototype.filter.call(nd.children, function (x) { return x.classList.contains('tblwrap'); })[0];
      if (!nw || nd.tagName !== t.det.tagName) return false;
      Array.prototype.slice.call(t.det.childNodes).forEach(function (x) { if (x !== t.wrap) t.det.removeChild(x); });
      var before = true;
      Array.prototype.slice.call(nd.childNodes).forEach(function (x) { if (x === nw) { before = false; return; } if (before) t.det.insertBefore(x, t.wrap); else t.det.appendChild(x); });
    }
    if (made) ch.forEach(function (k, j) { if (k < t.trs.length) t.tbody.replaceChild(made[j], t.trs[k]); else t.tbody.appendChild(made[j]); t.trs[k] = made[j]; });
    for (i = t.trs.length - 1; i >= n; i--) t.tbody.removeChild(t.trs[i]);
    t.trs.length = n;
    BD.stat.rows += ch.length;
    t.rows = seg.rows.slice(); t.sp = sp; t.dirtyTr = []; t.outerDirty = false;
    r.html = seg.html; r.stale = false;
    r.nodes.forEach(function (x) { if (x.nodeType === 1) x.classList.remove('bxstale', 'bxdim'); });
    return true;
  }
  function apply(host, order, seg, o) {
    if (!(seg.rows && putRows(host, seg))) put(host, order, seg);
    if (seg.k === 'cards') patchCards(rec[seg.k], o);
  }

  /* ---------- カードの選択・読み込み中の印・カードの下の「読み込んでいます」の欄（tail）を書き換える ---------- */
  function patchCards(r, o) {
    var box = r.nodes.filter(function (x) { return x.nodeType === 1; })[0];
    if (!box) return;
    Array.prototype.forEach.call(box.querySelectorAll('label.scen'), function (l) {
      var inp = l.querySelector('input[data-f=scen]');
      if (!inp) return;
      var on = inp.value === o.sel;
      if (l.classList.contains('on') !== on) l.classList.toggle('on', on);
      if (inp.hasAttribute('checked') !== on) { if (on) inp.setAttribute('checked', ''); else inp.removeAttribute('checked'); }
      if (inp.checked !== on) inp.checked = on;
      var b = l.querySelector('.scload'), want = on ? o.badge || '' : '';
      if (b && (!want || b.outerHTML !== want)) { b.remove(); b = null; }
      if (want && !b) inp.insertAdjacentHTML('afterend', want);
    });
    /* 「読み込んでいます」の欄は、カードの節（折りたたみの details）の末尾に置く（今までの描き方で折りたたみが入れる場所） */
    var tail = o.tail || '';
    if (r.tail !== tail && box.tagName === 'DETAILS') {
      Array.prototype.forEach.call(box.querySelectorAll('.boxwait'), function (x) { if (x.parentNode === box) x.remove(); });
      if (tail) box.insertAdjacentHTML('beforeend', tail);
      r.tail = tail;
    }
  }

  /* ---------- 描く ----------
     segs：[{ k, html }]（並びの順。k は節の種類で重ならない。先頭はカード 'cards'。参加表は { k, pre, rows: [行の HTML], post }）
     o：{ defer, sel（選んでいる箱庭）, badge（その箱庭のカードの印の HTML）, tail（カードの節の末尾の HTML）, after（描いたあとに呼ぶ）, live（まだ箱庭タブを見ているか） } */
  BD.draw = function (host, segs, o) {
    o = o || {};
    BD.stat.draws++; BD.stat.at = performance.now();
    cancel(host);
    segs.forEach(function (seg) { if (seg.rows) seg.html = seg.pre + seg.rows.join('') + seg.post; });
    /* 折りたたみが無い（ui-fold.js が無い）ときと、カードの節の「読み込んでいます」の欄が変わるときの折りたたみ無しは、今までどおり全部を作り直す */
    if (!nodesOk(host) || !(HK.Fold && HK.Fold.apply)) { rec = {}; host.innerHTML = ''; host0 = host; }
    if (!(HK.Fold && HK.Fold.apply)) { host.innerHTML = segs[0].html + (o.tail || '') + segs.slice(1).map(function (x) { return x.html; }).join(''); if (o.after) o.after(); return; }
    var order = segs.map(function (s) { return s.k; }), later = [];
    /* 今回ない節は外す */
    Object.keys(rec).forEach(function (k) { if (order.indexOf(k) < 0) { remove(rec[k]); delete rec[k]; } });
    segs.forEach(function (seg, i) {
      var r = rec[seg.k];
      if (r && r.html === seg.html && !r.dirty && !r.stale && !(r.t && (r.t.outerDirty || r.t.dirtyTr.length))) { BD.stat.kept++; if (seg.k === 'cards') patchCards(r, o); return; }
      if (o.defer && i > 0) {
        later.push(seg);
        if (r && !r.stale) {
          var sp = seg.rows && r.t && !r.dirty ? split(seg) : null, dim = !(sp && sp.head === r.t.sp.head);
          r.stale = true; r.nodes.forEach(function (x) { if (x.nodeType === 1) { x.classList.add('bxstale'); if (dim) x.classList.add('bxdim'); } });
        }
        return;
      }
      apply(host, order, seg, o);
    });
    if (o.after) o.after();
    if (!later.length) return;
    /* 次の描画のあとで1節ずつ（古い節は薄くして押せなくしておく） */
    host.setAttribute('data-pending', '');
    host.setAttribute('aria-busy', 'true');
    var my = pend = { id: ++seq, host: host, order: order, list: later, o: o, raf: 0, tm: 0 };
    var step = function () {
      if (pend !== my) return;
      my.raf = 0; clearTimeout(my.tm); my.tm = 0;
      if (o.live && !o.live()) { stop(host); return; }   /* 別のタブに移った：古い節は印を付けたまま残し、次に箱庭タブを開いたときに描く */
      if (!BD.stat.pendStart) BD.stat.pendStart = performance.now();
      var t0 = performance.now(), seg = my.list.shift();
      if (seg) apply(host, order, seg, o);
      if (o.after) o.after();
      BD.stat.steps.push((seg ? seg.k : '') + ' ' + Math.round(t0 - BD.stat.at) + '+' + Math.round(performance.now() - t0) + 'ms');
      if (my.list.length) next(); else { stop(host); BD.stat.pendEnd = performance.now(); }
    };
    var next = function () {
      /* rAF の中で次の処理を積む＝その描画（ペイント）のあとに動く。rAF が止まっている（裏のタブ）ときは 200ms で */
      my.raf = requestAnimationFrame(function () { my.raf = 0; clearTimeout(my.tm); my.tm = setTimeout(step, 0); });
      my.tm = setTimeout(function () { if (my.raf) { cancelAnimationFrame(my.raf); my.raf = 0; } step(); }, 200);
    };
    BD.stat.pendStart = 0; BD.stat.pendEnd = 0; BD.stat.steps = [];
    next();
  };
  function stop(host) { pend = null; host.removeAttribute('data-pending'); host.removeAttribute('aria-busy'); }
  function cancel(host) {
    if (!pend) return;
    if (pend.raf) cancelAnimationFrame(pend.raf);
    clearTimeout(pend.tm);
    stop(pend.host || host);
  }
  /* 後回しの節を今すぐ描く（点検・試験用） */
  BD.flush = function () {
    var my = pend;
    if (!my) return;
    cancel(my.host);
    my.list.forEach(function (seg) { apply(my.host, my.order, seg, my.o); });
    if (my.o.after) my.o.after();
  };
  BD.pending = function () { return !!pend; };
  /* 描いた節を全部捨てる（次は作り直す） */
  BD.reset = function () { cancel(host0); rec = {}; };

  /* ---------- 欄を手で変えた節は、文字列が同じでも次は作り直す（その場で書き換えた表示と、作り直した表示がずれないように） ---------- */
  function segOf(el) {
    if (!host0 || !el || !host0.contains(el)) return null;
    var top = el;
    while (top && top.parentNode !== host0) top = top.parentNode;
    if (!top) return null;
    var ks = Object.keys(rec);
    for (var i = 0; i < ks.length; i++) if (rec[ks[i]].nodes.indexOf(top) >= 0) return rec[ks[i]];
    return null;
  }
  function mark(ev) {
    var t = ev.target;
    if (!t || !t.closest || !host0 || !host0.contains(t)) return;
    var stale = !!t.closest('.bxstale');
    if (ev.type !== 'click' && !(t.getAttribute && t.getAttribute('data-f') === 'scen')) {   /* 箱庭の選択はカードの書き換えで合わせる */
      var r = segOf(t);
      /* 参加表：手で変えた行と、表の外（参加の人数・注意書きはその場で書き換わる）を、次に描くときに作り直す */
      if (r && r.t) { var tr = t.closest('tr'); if (tr && tr.parentNode === r.t.tbody && r.t.dirtyTr.indexOf(tr) < 0) r.t.dirtyTr.push(tr); r.t.outerDirty = true; }
      else if (r) r.dirty = true;
    }
    /* 古い節（作り直し待ち）への操作は、箱庭の設定に届けない（欄の表示は上の印で次に作り直す） */
    if (stale) { ev.stopImmediatePropagation(); if (ev.type === 'click' && ev.cancelable) ev.preventDefault(); }
  }
  ['input', 'change', 'click'].forEach(function (k) { document.addEventListener(k, mark, true); });
})();
