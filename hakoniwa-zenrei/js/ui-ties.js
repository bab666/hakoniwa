/* 箱庭シミュレーター: 住人タブ「住人どうしの既存の関係」の表と一括設定（2026-10-28）
   ・関係1本を、列のそろった1行に描く（左の人｜関係｜右の人｜気持ち・様子｜過去（左の人から・右の人から）｜出来事｜削除）。広い画面は1行、中くらいは2段、スマホ幅は縦に積む。
     関係の説明は行の下に薄い字で1行（押すと全文。title にも全文）
   ・二人の住人のグループ（c.group）で見出しを付けてまとめる：同じグループ→そのグループ、違うグループ→「○○ と ××」、どちらもなし→「グループなし」。
     見出しは件数つきの折りたたみ（details）。折りたたみは表示用の保存 hakoniwa:tiefold（全年齢版は hakoniwa-z:tiefold）に覚える。グループが一つも無いときは見出しを出さない
   ・一括設定：関係をまとめて付ける／恋愛（・R18）にしない相手／恋愛相手の固定／性行為の相手の固定（R18版）／殺さない相手／関係の欄（出来事・過去）／まとめて削除／写す／取り消し
   ui.js の tiesSection が HK.TiesUI.section(ctx) で節を描く。関係が多いとき・住人のページ送りがあるとき（ui-cast-pages.js）は、HK.TiesUI.sortKs（グループの順に並べる）と
   HK.TiesUI.rowsHtml（見出しを付けて描く）を通す。ui.js・ui-cast-pages.js より前に読む（どちらも描くときに呼ぶだけ） */
(function () {
  'use strict';
  var HK = window.HK;
  if (!HK) return;
  var esc = HK.escape;
  function UI() { return HK.UI; }
  function S() { return HK.UI.state(); }
  function gl(c) { return c && HK.groupList ? HK.groupList(c) : []; }
  function idl(v) { return Array.isArray(v) ? v : []; }

  (function () {
    if (typeof document === 'undefined' || !document.head) return;
    var css =
      /* 関係の行：スマホ幅（〜599px）は「左の人 右の人 削除」「関係」「気持ち・様子」「過去（二人それぞれから）」「出来事」「説明」の順に積む */
      '.tiebox .ties{display:block}' +
      '.tiebox .tierow,.tiebox .tiehead{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr) auto;grid-template-areas:"a b d" "t t t" "x x x" "p p p" "e e e" "h h h";gap:4px 6px;align-items:center;min-width:0}' +
      '.tiebox .tierow{padding:7px 0;border-bottom:1px solid var(--line);content-visibility:auto;contain-intrinsic-size:auto 120px}' +
      '.tiebox .tierow:last-child{border-bottom:0}' +
      '.tiebox .tc{min-width:0;display:flex;flex-wrap:wrap;gap:4px;align-items:center}' +
      '.tiebox .tc select{flex:1 1 7em;min-width:0;width:100%;max-width:100%}.tiebox .tcx select{flex-basis:9em}.tiebox .tc .cpfind{flex:1 1 100%;width:auto}' +
      '.tiebox .tca{grid-area:a}.tiebox .tct{grid-area:t}.tiebox .tcb{grid-area:b}.tiebox .tcx{grid-area:x}.tiebox .tcp{grid-area:p}.tiebox .tce{grid-area:e}.tiebox .tcd{grid-area:d;justify-content:flex-end}' +
      '.tiebox .tcx:empty{display:none}.tiebox .tcp select{flex-basis:100%}' +
      '.tiebox .tiehint{grid-area:h;display:block;min-width:0;font-size:11.5px;line-height:1.5;color:var(--muted2);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;cursor:pointer}' +
      '.tiebox .tiehint.open{white-space:normal;overflow:visible;cursor:default}.tiebox .tiehint:empty{display:none}' +
      '.tiebox .tiehead{display:none;font-size:11.5px;color:var(--muted);padding:0 0 4px;border-bottom:1px solid var(--line2)}' +
      /* 中くらい（600px〜）：「左の人 関係 右の人 削除」「気持ち・様子 過去 出来事」の2段（列は縦にそろう） */
      '@media (min-width:600px){.tiebox .tierow,.tiebox .tiehead{grid-template-columns:minmax(0,1fr) minmax(0,1.5fr) minmax(0,1fr) auto;grid-template-areas:"a t b d" "x p e ." "h h h h"}.tiebox .tierow{contain-intrinsic-size:auto 96px}}' +
      /* 広い画面（1000px〜）：1行（見出しの行も出す） */
      '@media (min-width:1000px){.tiebox .tierow,.tiebox .tiehead{grid-template-columns:minmax(5.5em,1fr) minmax(9em,1.5fr) minmax(5.5em,1fr) minmax(0,1.3fr) minmax(0,2.3fr) minmax(9.5em,1fr) auto;grid-template-areas:"a t b x p e d" "h h h h h h h"}' +
      '.tiebox .tiehead{display:grid}.tiebox .tierow{contain-intrinsic-size:auto 64px}}' +
      '.tiebox .tiehead span{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}' +
      /* グループの見出し */
      '.tiebox details.tieg{margin:10px 0 0;min-width:0}.tiebox details.tieg:first-child{margin-top:0}' +
      '.tiebox details.tieg>summary{display:flex;flex-wrap:wrap;gap:2px 10px;align-items:baseline;padding:6px 12px;border-left:2px solid var(--ink);background:var(--bg1,var(--accent-soft));border-radius:0 4px 4px 0;cursor:pointer;font-weight:700;overflow-wrap:anywhere;list-style:none}' +
      '.tiebox details.tieg>summary::-webkit-details-marker{display:none}' +
      '.tiebox details.tieg>summary:before{content:"▸";font-weight:400;margin-right:-4px}.tiebox details.tieg[open]>summary:before{content:"▾"}' +
      '.tiebox details.tieg>summary .tgc{font-weight:400;font-size:12.5px;color:var(--muted)}' +
      /* 一括設定 */
      '.tiebox details.tbx{margin-top:10px;border:1px solid var(--line);border-radius:var(--r,4px);padding:0 12px;min-width:0}' +
      '.tiebox details.tbx>summary{cursor:pointer;font-weight:700;padding:8px 0}.tiebox details.tbx[open]>summary{border-bottom:1px solid var(--line);margin-bottom:6px}' +
      '.tbx .tbxr{display:flex;flex-wrap:wrap;gap:6px 10px;align-items:center;margin:8px 0;min-width:0}' +
      '.tbx .tbxl{flex:0 0 7.5em;font-size:13px;color:var(--muted)}.tbx .tbxr select{flex:0 1 auto;min-width:0;max-width:100%}' +
      '.tbx .tbxr .cpfind{width:9em}' +
      '@media (max-width:599px){.tbx .tbxl{flex-basis:100%}.tbx .tbxr select{flex:1 1 100%}}' +
      '.tbx .tbxm{display:flex;flex-wrap:wrap;gap:2px 12px;max-height:13em;overflow:auto;padding:6px 8px;border:1px solid var(--line);border-radius:var(--r,4px);min-width:0}' +
      '.tbx .tbxm .cpfilt{flex:1 1 100%}.tbx .tbxm label{white-space:nowrap;font-size:13px}' +
      '.tbx .tbxpv{font-size:13px;margin:8px 0;padding:6px 10px;background:var(--bg1,var(--accent-soft));border-radius:var(--r,4px)}' +
      '.tbx .tbxpv.ng{color:var(--warn)}.tbx .tbxnote{font-size:12px;color:var(--muted);margin:4px 0 8px}';
    var st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);
  })();

  /* ---------- 表示用の保存（グループの見出しの折りたたみ） ---------- */
  var FOLD = (function () { var v = null; try { v = HK.store ? HK.store.get('tiefold', null) : null; } catch (e) { v = null; } return v && typeof v === 'object' && !Array.isArray(v) ? v : {}; })();
  function keepFold() { try { if (HK.store) HK.store.set('tiefold', FOLD); } catch (e) { /* 保存できなくても表示は変えられる */ } }
  function query() { try { return HK.CastPages && HK.CastPages.state ? String(HK.CastPages.state().tq || '').trim() : ''; } catch (e) { return ''; } }

  /* ---------- 恋愛の欄（どの関係にもある。t.love：''＝自動／'ok'＝あり／'no'＝なし。2026-10-28 担当MA） ----------
     既定（自動のとき）は ties.js の HK.tieLoveDefault(t)。無い版では、血縁・執着（信仰）・教師と生徒を「なし」、ほかを「あり」とみなす。
     「なし」は恋愛（告白・恋人・片想い）だけを止める（体の関係は止めない。止めるのは「恋愛・R18にしない相手」）。⚙️ 設定（ui-gear.js）とも共用 */
  function loveVal(t) { return t && (t.love === 'ok' || t.love === 'no') ? t.love : ''; }
  function loveDef(t) {
    if (HK.tieLoveDefault) { try { return HK.tieLoveDefault(t) === 'no' ? 'no' : 'ok'; } catch (e) { /* 下の決まりで */ } }
    var D = t && HK.TIES[t.type];
    return D && ((D.family && !D.loveOK) || D.loveOpt || t.type === 'teacher') ? 'no' : 'ok';
  }
  function loveHelp(t) {
    var h = '';
    if (HK.tieLoveHelp) { try { h = String(HK.tieLoveHelp(t) || ''); } catch (e) { h = ''; } }
    return h || '自動：この関係は恋愛' + (loveDef(t) === 'no' ? 'なし' : 'あり');
  }
  /* 選択肢（「自動」は今の既定が分かる形）。short：狭い欄（関係の一覧）向けの短い形「自動（あり）」 */
  function loveOpts(t, short) {
    var v = loveVal(t), o = function (id, label) { return '<option value="' + id + '"' + (v === id ? ' selected' : '') + '>' + esc(label) + '</option>'; }, d = loveDef(t) === 'no' ? 'なし' : 'あり';
    return o('', '恋愛：自動（' + (short ? d : 'この関係は恋愛' + d) + '）') + o('ok', '恋愛：あり') + o('no', '恋愛：なし');
  }
  /* attr：欄の属性（id・data-* など）。title に自動のときの説明 */
  function loveSel(t, attr, short) { return '<select ' + attr + ' aria-label="恋愛" title="' + esc(loveHelp(t)) + '">' + loveOpts(t, short) + '</select>'; }
  /* 説明の行に添える文（自動のときは足さない。選択肢に既定が出ているため） */
  function loveNote(t) {
    var D = t && HK.TIES[t.type], v = loveVal(t), fam = !!(D && D.family && !D.loveOK);
    if (!D || !v) return '';
    if (v === 'ok') return D.loveOpt ? '恋愛：ありにしているので、想いが恋に変わることもある' : fam ? '恋愛：ありにしているので、恋愛に発展することもある（信頼が崩れにくいのは同じ）' : loveDef(t) === 'no' ? '恋愛：ありにしているので、この二人は恋愛に発展することがある' : '';
    /* なし：血縁は自動と同じ（説明の「恋愛にはならない」のまま） */
    if (D.loveOpt) return '恋愛：なしにしているので、想いは恋にならない';
    return fam ? '' : '恋愛：なしにしているので、この二人のあいだでは恋愛（告白・恋人・片想い）にならない' + (HK.SAFE_ON ? '' : '（R18の場面は止めない。止めるときは「恋愛・R18にしない相手」）');
  }

  /* ---------- 関係の行 ---------- */
  /* きょうだいの関係の行：二人の続柄（「美咲（姉）→ 健（弟）：兄弟（庇護）」）と注意（年齢が未設定・同じ年齢・庇護の向きと年齢が逆）を添える（sib-word.js） */
  function sibText(t, by) {
    if (!HK.Sib || !HK.Sib.ui || !HK.tieText || !(HK.Sib.isSibTie(t) || t.type === 'stepsib')) return '';
    var A = by[t.a], B = by[t.b];
    if (!A || !B) return '';
    var tx = HK.tieText(t, function (id) { var c = by[id]; return c ? c.name : ''; }, function (id) { return by[id] || null; }), u = HK.Sib.ui(A, B, t);
    return '<b>' + esc(tx) + '</b>。' + (u && u.notes.length ? esc(u.notes.join('。')) + '。' : '');
  }
  /* X：{ by（id→住人）, lz（住人の欄を遅延にする属性）, CP, opts（住人の選択肢を作る関数） } */
  function rowHtml(t, k, X) {
    var D = HK.TIES[t.type], by = X.by, lz = X.lz, CP = X.CP;
    if (!D) return '';
    var na = (by[t.a] || {}).name, nb = (by[t.b] || {}).name;
    var typeIn = lz && CP ? CP.typeOpt(t.type) : HK.tieOptions ? HK.tieOptions(t.type, { dir: true }) : HK.TIE_ORDER.map(function (id) { var d = HK.TIES[id]; return '<option value="' + id + '"' + (id === t.type ? ' selected' : '') + '>' + esc(d.label) + (d.dir ? '（' + d.roleA + '→' + d.roleB + '）' : '') + '</option>'; }).join('');
    var xs = '', past = '', ev = '';
    xs += loveSel(t, 'id="tl-' + k + '" data-f="tie" data-k="' + k + '" data-p="love"', true);
    var CO = HK.coldOpts ? HK.coldOpts(t.type) : null;
    if (CO) xs += '<select id="tc-' + k + '" data-f="tie" data-k="' + k + '" data-p="cold" aria-label="' + CO.aria + '">' + CO.order.map(function (id) { return '<option value="' + id + '"' + ((t.cold || '') === id ? ' selected' : '') + '>' + esc(CO.map[id].label) + '</option>'; }).join('') + '</select>';
    /* 追加の欄（型・度合い・気持ち・様子。許嫁・元恋人は二人それぞれの気持ち）。hide の欄（敵対の度合い「憎悪」）は出さない（保存済みの値は残って効く）。
       過去・出来事はどの関係にもある欄なので、それぞれの列にそろえて置く */
    /* 過去の欄は同じ二人の組に一か所（組で最初の関係の行だけ。値は組の中で向きごとに最初に見つかったもの。ties.js の HK.tiePastIndex） */
    var PV = X.pi ? X.pi.get(t) || null : { past: t.past || '', pastB: t.pastB || '' };
    (HK.tieExtra ? HK.tieExtra(t.type) : []).filter(function (x) { return !x.hide && (!x.from || PV); }).forEach(function (x) {
      var who = x.who ? by[x.who === 'a' ? t.a : t.b] : null, v = x.from ? PV[x.f] : t[x.f] || (t.type === 'fiance' ? 'eager' : '');
      var h = '<select id="tx' + x.f + '-' + k + '" data-f="tie" data-k="' + k + '" data-p="' + x.f + '" aria-label="' + esc(who ? who.name + 'の気持ち' : x.from ? ((x.from === 'a' ? na : nb) || x.aria.slice(0, 3)) + 'から見た過去' : x.aria) + '">' + x.order.map(function (id) { return '<option value="' + id + '"' + (v === id ? ' selected' : '') + '>' + esc((who ? who.name + 'の気持ち：' : '') + (HK.tieExtraLabel ? HK.tieExtraLabel(x, id, na, nb) : x.map[id].label)) + '</option>'; }).join('') + '</select>';
      if (x.from) past += h; else if (x.f === 'noev') ev = h; else xs += h;
    });
    var hint = sibText(t, by) + (D.dir ? esc(D.roleA) + 'は左、' + esc(D.roleB) + 'は右。' : '') + esc(D.effect || '') + (loveNote(t) ? '。' + esc(loveNote(t)) : '') + (t.type === 'crush' && t.cold === 'other' ? '。想われる側に恋人や片想いなどの関係を別に登録すると、その人が「好きな人」として扱われる' : '');
    return '<div class="tierow" data-k="' + k + '">' +
      '<div class="tc tca"><select id="ta-' + k + '" data-f="tie" data-k="' + k + '" data-p="a"' + lz + ' aria-label="関係の起点">' + X.opts(t.a, by) + '</select></div>' +
      '<div class="tc tct"><select id="tt-' + k + '" data-f="tie" data-k="' + k + '" data-p="type"' + (lz && CP ? ' data-lazyt="1"' : '') + ' aria-label="関係の種類">' + typeIn + '</select></div>' +
      '<div class="tc tcb"><select id="tb-' + k + '" data-f="tie" data-k="' + k + '" data-p="b"' + lz + ' aria-label="関係の相手">' + X.opts(t.b, by) + '</select></div>' +
      '<div class="tc tcx">' + xs + '</div><div class="tc tcp">' + past + '</div><div class="tc tce">' + ev + '</div>' +
      '<div class="tc tcd"><button class="btn ghost small" data-act="tiedel" data-k="' + k + '">削除</button></div>' +
      '<span class="tiehint" title="' + hint.replace(/<[^>]*>/g, '') + '">' + hint + '</span></div>';
  }
  var HEAD = '<div class="tiehead" aria-hidden="true"><span style="grid-area:a">左の人</span><span style="grid-area:t">関係</span><span style="grid-area:b">右の人</span><span style="grid-area:x">恋愛・気持ち・様子</span><span style="grid-area:p">過去</span><span style="grid-area:e">出来事</span></div>';

  /* ---------- グループの見出し ---------- */
  /* 住人の表・グループの並び（名簿で最初に出てきた順） */
  function secCtx() {
    var by = Object.create(null), ord = Object.create(null), n = 0;
    S().chars.forEach(function (c) { by[c.id] = c; gl(c).forEach(function (g) { if (!(g in ord)) ord[g] = n++; }); });
    return { by: by, ord: ord, n: n };
  }
  /* 関係の節：二人に共通のグループがあればそのグループ（最初の一つ）。なければ二人の最初のグループどうし（「○○ と ××」）。二人ともグループなしは「グループなし」 */
  function secOf(t, C) {
    var ga = gl(C.by[t.a]), gb = gl(C.by[t.b]), N = C.n;
    if (!ga.length && !gb.length) return { key: 'n', name: 'グループなし', i: N, j: N };
    for (var q = 0; q < ga.length; q++) if (gb.indexOf(ga[q]) >= 0) return { key: 'g:' + ga[q], name: ga[q], i: C.ord[ga[q]], j: C.ord[ga[q]] };
    var x = ga[0] || '', y = gb[0] || '', ix = x ? C.ord[x] : N, iy = y ? C.ord[y] : N;
    if (ix > iy) { var s = x; x = y; y = s; s = ix; ix = iy; iy = s; }
    return { key: 'x:' + x + '\u0001' + y, name: (x || 'グループなし') + ' と ' + (y || 'グループなし'), i: ix, j: iy };
  }
  /* 関係の番号の並びを、節の順（グループの順。同じグループの節→またぐ節→グループなし）に並べ替える（節の中は元の順） */
  function sortKs(ks) {
    var C = secCtx();
    if (!C.n) return ks;
    var T = S().ties || [], key = {};
    ks.forEach(function (k, p) { var s = secOf(T[k], C); key[k] = (s.i * (C.n + 1) + s.j) * 1e6 + p; });
    return ks.slice().sort(function (a, b) { return key[a] - key[b]; });
  }
  /* ks：描く関係（このページの分。sortKs の順）、all：表示する関係すべて（節の件数に使う） */
  var lastRow = null;
  function rowsHtml(T, ks, rowOf, all) {
    lastRow = rowOf;
    if (!ks.length) return '';
    var C = secCtx();
    if (!C.n) return HEAD + ks.map(function (k) { return rowOf(T[k], k); }).join('');
    var cnt = {}, q = query(), out = HEAD, cur = null, buf = [];
    (all || ks).forEach(function (k) { var s = secOf(T[k], C); cnt[s.key] = (cnt[s.key] || 0) + 1; });
    var flush = function () {
      if (!cur) return;
      var open = !!q || !FOLD[cur.key], n = cnt[cur.key] || buf.length;
      out += '<details class="tieg" data-g="' + esc(cur.key) + '" data-ks="' + buf.join(',') + '"' + (open ? ' open' : '') + '><summary><span class="tgn">' + esc(cur.name) + '</span><span class="tgc">' + n + '本' + (buf.length < n ? '（このページ ' + buf.length + '本）' : '') + '</span></summary>' +
        (open ? buf.map(function (k) { return rowOf(T[k], k); }).join('') : '') + '</details>';
    };
    ks.forEach(function (k) {
      var s = secOf(T[k], C);
      if (!cur || cur.key !== s.key) { flush(); cur = s; buf = []; }
      buf.push(k);
    });
    flush();
    return out;
  }
  /* 足した関係が見えるように、その節を開く（ui-cast-pages.js の revealTie から） */
  function reveal(k) {
    var t = (S().ties || [])[k];
    if (!t) return;
    var C = secCtx();
    if (!C.n) return;
    var s = secOf(t, C);
    if (FOLD[s.key]) { delete FOLD[s.key]; keepFold(); }
  }

  /* ---------- 節（ui.js の tiesSection から） ---------- */
  /* ctx：{ opts（住人の選択肢：選んでいる id・住人の表 → option の HTML）, lazy（住人が多く、住人の欄を遅延にするか） } */
  function section(ctx) {
    var s = S(), CP = HK.CastPages || null, by = Object.create(null);
    s.chars.forEach(function (c) { by[c.id] = c; });
    var X = { by: by, lz: ctx.lazy ? ' data-lazy="1"' : '', CP: CP, opts: ctx.opts, pi: HK.tiePastIndex ? HK.tiePastIndex(s.ties) : null };
    var row = function (t, k) { return rowHtml(t, k, X); };
    lastRow = row;
    var T = s.ties || [], idx = T.map(function (t, k) { return k; });
    /* 関係が多いとき・住人のページ送りがあるときは、表示する関係の選択・名前で探す・50本ずつのページ送り（ui-cast-pages.js） */
    var rows = CP ? CP.tieHtml(row) : rowsHtml(T, sortKs(idx), row, idx);
    return '<h2 class="sec">住人どうしの既存の関係' + (HK.Tips ? HK.Tips.btn('ties') : '') + '</h2>' +
      '<p class="hint">箱庭に入る前からある関係です。初期の好意や信頼が変わり、行動の傾向にも補正がかかります。各住人の「設定」からも編集できます。</p>' +
      '<div class="tiebox"><div class="ties">' + (rows || '<p class="hint" style="margin:0">まだ関係は登録されていません。</p>') + '</div>' +
      '<div class="row" style="margin-top:8px"><button class="btn" data-act="tieadd"' + (s.chars.length < 2 ? ' disabled' : '') + '>関係を1つ追加</button></div>' +
      (s.chars.length >= 2 ? bulkHtml() : '') +
      '<div style="margin-top:12px"><textarea id="tiebulk" rows="3" placeholder="朝霧→鷹野 片想い（脈なし）\n鷹野-白石 親友\n白石とミナトは恋人\n朝霧 鷹野 白石 同僚\n3年A組 同級生"></textarea>' +
      '<div class="row" style="margin-top:6px"><button class="btn" data-act="tieimport">まとめて読み込む</button><span class="fmt">1行に「名前 名前 関係」。3人以上の名前（「名前 名前 名前 チーム」）や、グループ名（「3年A組 同級生」）を書くと、全員の組にまとめて付けます（上司と部下などの向きのある関係は、最初の人→残りの全員）。書き方は見出しの ？ にあります。</span></div>' +
      '<ul class="warn" id="tiewarns" hidden></ul></div></div>';
  }

  /* ======================= 一括設定 ======================= */
  /* 画面の選択（このページを開いているあいだだけ覚える） */
  var B = { open: false, op: 'tie', sc: '', tg: 'g', ts: 'gin', lv: 'no', p: '', g1: '', g2: '', m: {}, ty: 'friend', dir: 'l', rep: false, mode: 'add', both: false, lk: '', tf: '', fv: 'noev:off', cp: { tie: 1, ng: 1, lock: 1, sex: 1, nk: 1 } };
  var undo = null;
  var CAP_TIES = 3000, CAP_PAIRS = 30000;
  function ngLabel() { return HK.SAFE_ON ? '恋愛にしない相手' : '恋愛・R18にしない相手'; }
  /* R18版だけの操作（性行為の相手の固定）。全年齢版のビルドでは中身ごと落ちる */
  var SEX = null;
  /* r18:begin */
  SEX = { label: '性行為の相手の固定', short: '性行為の相手' };
  /* r18:end */
  function sexOn() { return !!SEX && !HK.SAFE_ON; }
  function OPS() {
    var l = [['tie', '関係をまとめて付ける'], ['ng', ngLabel() + 'をまとめて付ける・外す'], ['lock', '恋愛相手の固定をまとめて足す・外す']];
    if (sexOn()) l.push(['sex', SEX.label + 'をまとめて足す・外す']);
    return l.concat([['nk', '殺さない相手をまとめて付ける・外す'], ['fld', '関係の欄（出来事・過去）をまとめて変える'], ['love', '関係の恋愛（自動・あり・なし）をまとめて変える'], ['del', '関係をまとめて削除する'], ['copy', 'ある人の関係・設定をほかの人に写す']]);
  }
  /* 範囲の選択肢（グループが無いときはグループを使うものを出さない） */
  var PAIR_SC = [['gg', 'グループの全員どうし', 1], ['pg', '選んだ人 × グループの全員', 1], ['pa', '選んだ人 × 全員', 0], ['pm', '選んだ人 × 選んだ住人たち', 0], ['g2', 'グループ × グループ', 2], ['mm', '選んだ住人たちどうし', 0]];
  var TG_SC = [['g', 'グループの全員', 1], ['m', '選んだ住人たち', 0], ['a', '全員', 0]];
  var CP_SC = [['m', '選んだ住人たち', 0], ['g', 'グループの全員', 1], ['a', '全員', 0]];
  var TIE_SC = [['all', 'すべての関係', 0], ['gin', 'グループの中の関係（二人ともそのグループ）', 1], ['gany', 'グループの人が関わる関係', 1], ['g2', 'グループとグループのあいだの関係', 2], ['p', '選んだ人の関係', 0], ['mm', '選んだ住人たちのあいだの関係', 0]];
  /* 恋愛の欄の一括（t.love。''＝自動に戻す） */
  var LV = [['no', '恋愛：なし'], ['ok', '恋愛：あり'], ['', '恋愛：自動に戻す']];
  var FV = [['noev:off', '出来事：起こさない（関係の色は残す）'], ['noev:', '出来事：起こす'], ['past:', '過去：なし'], ['past:friend', '過去：昔は仲が良かった'], ['past:foe', '過去：昔は敵だった']];
  function groups() { var g = [], seen = Object.create(null); S().chars.forEach(function (c) { gl(c).forEach(function (x) { if (!seen[x]) { seen[x] = 1; g.push(x); } }); }); return g; }
  function scList(L, ng) { return L.filter(function (x) { return x[2] <= ng; }); }
  function scKey(op) { return op === 'tie' || op === 'ng' || op === 'nk' ? 'sc' : op === 'fld' || op === 'del' || op === 'love' ? 'ts' : 'tg'; }
  function scOpts(op) { return op === 'tie' || op === 'ng' || op === 'nk' ? PAIR_SC : op === 'fld' || op === 'del' || op === 'love' ? TIE_SC : op === 'copy' ? CP_SC : TG_SC; }
  /* 選択を今の住人・グループに合わせて直す */
  function fix() {
    var s = S(), gs = groups(), ng = Math.min(2, gs.length), ids = Object.create(null);
    s.chars.forEach(function (c) { ids[c.id] = 1; });
    if (!OPS().some(function (o) { return o[0] === B.op; })) B.op = 'tie';
    var k = scKey(B.op), L = scList(scOpts(B.op), ng);
    if (B.op === 'copy' && B.tg !== 'm' && B.tg !== 'g' && B.tg !== 'a') B.tg = 'm';
    if (!L.some(function (x) { return x[0] === B[k]; })) B[k] = L[0][0];
    if (!ids[B.p] && s.chars[0]) B.p = s.chars[0].id;
    if (gs.indexOf(B.g1) < 0) B.g1 = gs[0] || '';
    if (gs.indexOf(B.g2) < 0 || B.g2 === B.g1) B.g2 = gs.filter(function (g) { return g !== B.g1; })[0] || '';
    Object.keys(B.m).forEach(function (id) { if (!ids[id]) delete B.m[id]; });
    if (!HK.TIES[B.ty] || (HK.tieHidden && HK.tieHidden(B.ty))) B.ty = 'friend';
    if (B.tf && !HK.TIES[B.tf]) B.tf = '';
    if (B.lv !== 'ok' && B.lv !== 'no') B.lv = '';
  }
  function needs() {
    var k = scKey(B.op), v = B[k], r = { p: false, g1: false, g2: false, m: false };
    if (k === 'sc') { r.p = /^p/.test(v); r.g1 = v === 'gg' || v === 'pg' || v === 'g2'; r.g2 = v === 'g2'; r.m = v === 'pm' || v === 'mm'; }
    else if (k === 'ts') { r.p = v === 'p'; r.g1 = v === 'gin' || v === 'gany' || v === 'g2'; r.g2 = v === 'g2'; r.m = v === 'mm'; }
    else { r.p = true; r.g1 = v === 'g'; r.m = v === 'm'; }
    return r;
  }
  function byMap() { var m = Object.create(null); S().chars.forEach(function (c) { m[c.id] = c; }); return m; }
  function inG(c, g) { return gl(c).indexOf(g) >= 0; }
  function members(g) { return S().chars.filter(function (c) { return inG(c, g); }); }
  function picked() { return S().chars.filter(function (c) { return B.m[c.id]; }); }
  function pk(a, b) { return a < b ? a + '\u0001' + b : b + '\u0001' + a; }
  /* 二人の組の一覧（向きは [選んだ側・名簿で上の人・一つ目のグループの側, 相手]）。err があれば実行しない */
  function pairs() {
    var s = S(), P = byMap()[B.p], out = [], seen = Object.create(null), v = B.sc;
    var add = function (x, y) { if (!x || !y || x === y) return; var k = pk(x.id, y.id); if (seen[k]) return; seen[k] = 1; out.push([x, y]); };
    var all2 = function (L) { for (var i = 0; i < L.length; i++) for (var j = i + 1; j < L.length; j++) { add(L[i], L[j]); if (out.length > CAP_PAIRS) return; } };
    if ((v === 'pg' || v === 'pa' || v === 'pm') && !P) return { err: '人を選んでください', list: [] };
    if (v === 'gg') all2(members(B.g1));
    else if (v === 'mm') all2(picked());
    else if (v === 'pg') members(B.g1).forEach(function (o) { add(P, o); });
    else if (v === 'pa') s.chars.forEach(function (o) { add(P, o); });
    else if (v === 'pm') picked().forEach(function (o) { add(P, o); });
    else if (v === 'g2') { var L2 = members(B.g2); members(B.g1).forEach(function (x) { L2.forEach(function (y) { add(x, y); }); }); }
    if (out.length > CAP_PAIRS) return { err: '組が多すぎます（' + CAP_PAIRS + '組まで）。範囲を絞ってください', list: [] };
    if (!out.length) return { err: v === 'mm' || v === 'pm' ? '住人を選んでください（下の一覧）' : '対象になる二人の組がありません', list: [] };
    return { list: out };
  }
  /* 相手の一覧（恋愛相手の固定・性行為の相手・写す先）。選んだ人は除く */
  function targets() {
    var P = byMap()[B.p], L = B.tg === 'g' ? members(B.g1) : B.tg === 'a' ? S().chars : picked();
    return L.filter(function (c) { return c !== P; });
  }
  /* 関係の範囲（出来事・過去の一括・まとめて削除） */
  function tieHit(t, by) {
    if (B.tf && t.type !== B.tf) return false;
    var A = by[t.a], Bc = by[t.b], v = B.ts;
    if (!A || !Bc) return false;
    if (v === 'gin') return inG(A, B.g1) && inG(Bc, B.g1);
    if (v === 'gany') return inG(A, B.g1) || inG(Bc, B.g1);
    if (v === 'g2') return (inG(A, B.g1) && inG(Bc, B.g2)) || (inG(A, B.g2) && inG(Bc, B.g1));
    if (v === 'p') return t.a === B.p || t.b === B.p;
    if (v === 'mm') return !!(B.m[t.a] && B.m[t.b]);
    return true;
  }
  function has(c, f, id) { return idl(c[f]).indexOf(id) >= 0; }
  function put(c, f, id) { var l = idl(c[f]).filter(function (x) { return x !== id; }); l.push(id); c[f] = l; }
  function pull(c, f, id) { if (!Array.isArray(c[f])) return false; var n = c[f].length; c[f] = c[f].filter(function (x) { return x !== id; }); return c[f].length !== n; }
  /* 恋愛（・R18）にしない相手に入れる：双方向。二人のあいだの恋愛相手の固定・性行為の相手の固定は外す（⚙️ 設定と同じ決まり） */
  function ngOn(x, y) { put(x, 'loveNG', y.id); put(y, 'loveNG', x.id); pull(x, 'loveLock', y.id); pull(y, 'loveLock', x.id); pull(x, 'sexLocks', y.id); pull(y, 'sexLocks', x.id); }
  /* 恋愛相手の固定に足す：二人のあいだの「恋愛にしない相手」は外す（⚙️ 設定と同じ決まり） */
  function lockOn(x, y) { put(x, 'loveLock', y.id); pull(x, 'loveNG', y.id); pull(y, 'loveNG', x.id); }
  function sexMode(c) { return c.sexLock === 'pick' || c.sexLock === 'pickMob'; }
  function sexOnTo(x, y) { if (!sexMode(x) || B.lk) x.sexLock = B.lk || 'pick'; put(x, 'sexLocks', y.id); }
  function sexOff(x, y) { pull(x, 'sexLocks', y.id); if (sexMode(x) && !idl(x.sexLocks).length) x.sexLock = ''; }
  function tieName(ty) { var d = HK.TIES[ty]; return d ? d.label : ty; }

  /* 実行の計画：{ n（変わる数）, msg（下に出す説明）, ask（確かめの文）, label（取り消しに出す名前）, run（実行） } */
  function plan() {
    var s = S(), by = byMap(), P = by[B.p], op = B.op;
    if (op === 'tie') {
      var PR = pairs(); if (PR.err) return { n: 0, msg: PR.err };
      var D = HK.TIES[B.ty], ix = Object.create(null), cnt = Object.create(null);
      (s.ties || []).forEach(function (t) { var k = pk(t.a, t.b); ix[k + '|' + t.type] = 1; cnt[k] = (cnt[k] || 0) + 1; });
      var add = [], skip = 0, gone = 0;
      PR.list.forEach(function (p) {
        var a = p[0], b = p[1], k = pk(a.id, b.id);
        if (D.dir && B.dir === 'r') { a = p[1]; b = p[0]; }
        if (B.rep) { gone += cnt[k] || 0; add.push([a, b]); } else if (ix[k + '|' + B.ty]) skip++; else add.push([a, b]);
      });
      if (add.length > CAP_TIES) return { n: 0, msg: '一度に付けられる関係は' + CAP_TIES + '本までです（' + add.length + '本になります）。範囲を絞ってください' };
      var tx = '「' + D.label + '」を' + add.length + '本付けます' + (skip ? '（すでに「' + D.label + '」がある' + skip + '組は飛ばします）' : '') + (B.rep && gone ? '（この二人たちにある関係' + gone + '本は外します）' : '');
      return { n: add.length, msg: add.length ? tx : 'どの組にもすでに「' + D.label + '」があります', ask: tx + '。よろしいですか？', label: '「' + D.label + '」を' + add.length + '本付けた',
        run: function () {
          if (B.rep) { var drop = Object.create(null); add.forEach(function (p) { drop[pk(p[0].id, p[1].id)] = 1; }); s.ties = (s.ties || []).filter(function (t) { return !drop[pk(t.a, t.b)]; }); }
          s.ties = s.ties || [];
          add.forEach(function (p) { var nt = { a: p[0].id, b: p[1].id, type: B.ty }; if (HK.tieExtraNorm) HK.tieExtraNorm(nt); s.ties.push(nt); });
          return '「' + D.label + '」を' + add.length + '本付けました';
        } };
    }
    if (op === 'ng' || op === 'nk') {
      var PR2 = pairs(); if (PR2.err) return { n: 0, msg: PR2.err };
      var f = op === 'ng' ? 'loveNG' : 'noKillFor', nm = op === 'ng' ? ngLabel() : '殺さない相手', on = B.mode !== 'del', lockHit = 0;
      var L = PR2.list.filter(function (p) { var x = p[0], y = p[1], h = has(x, f, y.id) && has(y, f, x.id), any = has(x, f, y.id) || has(y, f, x.id); return on ? !h : any; });
      if (op === 'ng' && on) L.forEach(function (p) { var x = p[0], y = p[1]; if (has(x, 'loveLock', y.id) || has(y, 'loveLock', x.id) || has(x, 'sexLocks', y.id) || has(y, 'sexLocks', x.id)) lockHit++; });
      var tx2 = PR2.list.length + '組のうち' + L.length + '組を、' + (on ? '二人とも互いの「' + nm + '」にします' : '二人とも「' + nm + '」から外します') + (lockHit ? '。' + lockHit + '組は恋愛相手の固定' + (sexOn() ? '・' + SEX.short + 'の固定' : '') + 'から外れます' : '');
      return { n: L.length, msg: L.length ? tx2 : (on ? 'どの組もすでに' + nm + 'です' : 'どの組も' + nm + 'ではありません'), ask: tx2 + '。よろしいですか？', label: nm + 'を' + L.length + '組' + (on ? '付けた' : '外した'),
        run: function () {
          L.forEach(function (p) { var x = p[0], y = p[1]; if (!on) { pull(x, f, y.id); pull(y, f, x.id); } else if (op === 'ng') ngOn(x, y); else { put(x, f, y.id); put(y, f, x.id); } });
          return nm + 'を' + L.length + '組' + (on ? '付けました' : '外しました');
        } };
    }
    if (op === 'lock' || op === 'sex') {
      if (!P) return { n: 0, msg: '人を選んでください' };
      var TG = targets(), lf = op === 'lock' ? 'loveLock' : 'sexLocks', on2 = B.mode !== 'del', ngHit = 0;
      var nm2 = op === 'lock' ? '恋愛相手の固定' : SEX.label;
      if (!TG.length) return { n: 0, msg: B.tg === 'm' ? '相手の住人を選んでください（下の一覧）' : '相手になる住人がいません' };
      var need = function (x, y) { return on2 ? !has(x, lf, y.id) || (op === 'sex' && !sexMode(x)) : has(x, lf, y.id); };
      var L2 = TG.filter(function (o) { return need(P, o) || (B.both && need(o, P)); });
      if (op === 'lock' && on2) L2.forEach(function (o) { if (has(P, 'loveNG', o.id) || has(o, 'loveNG', P.id)) ngHit++; });
      var tx3 = P.name + 'の' + nm2 + (on2 ? 'に' : 'から') + L2.length + '人を' + (on2 ? '足します' : '外します') + (B.both ? '（相手の側の' + P.name + 'も' + (on2 ? '足します' : '外します') + '）' : '') + (ngHit ? '。' + ngHit + '人は「' + ngLabel() + '」から外れます' : '');
      return { n: L2.length, msg: L2.length ? tx3 : (on2 ? 'すでに全員が入っています' : '外す相手がいません'), ask: tx3 + '。よろしいですか？', label: P.name + 'の' + nm2 + (on2 ? 'に' : 'から') + L2.length + '人を' + (on2 ? '足した' : '外した'),
        run: function () {
          L2.forEach(function (o) {
            var go = function (x, y) { if (on2) { if (op === 'lock') lockOn(x, y); else sexOnTo(x, y); } else if (op === 'lock') pull(x, 'loveLock', y.id); else sexOff(x, y); };
            go(P, o); if (B.both) go(o, P);
          });
          return P.name + 'の' + nm2 + (on2 ? 'に' : 'から') + L2.length + '人を' + (on2 ? '足しました' : '外しました');
        } };
    }
    if (op === 'fld' || op === 'del' || op === 'love') {
      if (B.ts === 'p' && !P) return { n: 0, msg: '人を選んでください' };
      if (B.ts === 'mm' && picked().length < 2) return { n: 0, msg: '住人を二人以上選んでください（下の一覧）' };
      var hit = (s.ties || []).filter(function (t) { return tieHit(t, by); });
      if (op === 'del') {
        var tx4 = '関係を' + hit.length + '本削除します';
        return { n: hit.length, msg: hit.length ? tx4 : '当てはまる関係はありません', ask: tx4 + '。よろしいですか？', label: '関係を' + hit.length + '本削除した',
          run: function () { var gone = hit.slice(); if (HK.tiePastRemove) HK.tiePastRemove(s.ties, gone); /* 組の過去は残る関係へ移す */ s.ties =(s.ties || []).filter(function (t) { return gone.indexOf(t) < 0; }); return '関係を' + gone.length + '本削除しました'; } };
      }
      if (op === 'love') {
        var lv = B.lv, ll = (LV.filter(function (x) { return x[0] === lv; })[0] || ['', ''])[1];
        var L4 = hit.filter(function (t) { return (t.love === 'ok' || t.love === 'no' ? t.love : '') !== lv; });
        var tx7 = hit.length + '本のうち' + L4.length + '本を「' + ll + '」にします';
        return { n: L4.length, msg: L4.length ? tx7 : '変わる関係はありません（' + hit.length + '本が当てはまり、すべてすでに「' + ll + '」です）', ask: tx7 + '。よろしいですか？', label: '関係' + L4.length + '本を「' + ll + '」にした',
          run: function () { L4.forEach(function (t) { if (lv) t.love = lv; else delete t.love; }); return '関係' + L4.length + '本を「' + ll + '」にしました'; } };
      }
      var fv = B.fv.split(':'), ff = fv[0], val = fv[1] || '', fl = (FV.filter(function (x) { return x[0] === B.fv; })[0] || ['', ''])[1];
      var okF = function (t) { return (HK.tieExtra ? HK.tieExtra(t.type) : []).some(function (x) { return x.f === ff; }); };
      /* 過去は組（同じ二人）につき一か所：組の家にまとめて、一人目から（家の向き）を変える。「過去：なし」は二人それぞれからの過去を両方消す */
      if (ff === 'past' && HK.tiePastHome) {
        var seenP = {}, PL = [], nP = 0, noP = hit.filter(function (t) { return !okF(t); }).length;
        hit.forEach(function (t) { var h = HK.tiePastHome(s.ties, t), kp = h && HK.tiePastKey(h.a, h.b); if (!h || seenP[kp]) return; seenP[kp] = 1; nP++; var cur = HK.tiePastGet(s.ties, h); if (val ? cur.past !== val : cur.past || cur.pastB) PL.push(h); });
        var tx8 = hit.length + '本（' + nP + '組）のうち' + PL.length + '組の過去を「' + fl + '」にします（過去は二人の組に一つ）' + (noP ? '（' + noP + '本はこの欄のない関係です）' : '');
        return { n: PL.length, msg: PL.length ? tx8 : '変わる組はありません（' + hit.length + '本が当てはまり、すでに「' + fl + '」か、この欄のない関係です）', ask: tx8 + '。よろしいですか？', label: PL.length + '組の過去を「' + fl + '」にした',
          run: function () { PL.forEach(function (h) { HK.tiePastGather(s.ties, h); if (val) h.past = val; else { delete h.past; delete h.pastB; } }); return PL.length + '組の過去を「' + fl + '」にしました'; } };
      }
      var L3 = hit.filter(function (t) { return okF(t) && (t[ff] || '') !== val; }), no = hit.filter(function (t) { return !okF(t); }).length;
      var tx5 = hit.length + '本のうち' + L3.length + '本を「' + fl + '」にします' + (no ? '（' + no + '本はこの欄のない関係です）' : '');
      return { n: L3.length, msg: L3.length ? tx5 : '変わる関係はありません（' + hit.length + '本が当てはまり、すでに「' + fl + '」か、この欄のない関係です）', ask: tx5 + '。よろしいですか？', label: '関係' + L3.length + '本を「' + fl + '」にした',
        run: function () { L3.forEach(function (t) { if (val) t[ff] = val; else delete t[ff]; }); return '関係' + L3.length + '本を「' + fl + '」にしました'; } };
    }
    if (op === 'copy') {
      if (!P) return { n: 0, msg: '写す元の人を選んでください' };
      var TG2 = targets();
      if (!TG2.length) return { n: 0, msg: B.tg === 'm' ? '写す先の住人を選んでください（下の一覧）' : '写す先の住人がいません' };
      var C = B.cp, mine = (s.ties || []).filter(function (t) { return t.a === P.id || t.b === P.id; }), ix2 = Object.create(null);
      (s.ties || []).forEach(function (t) { ix2[pk(t.a, t.b) + '|' + t.type] = 1; });
      var newT = [], nNG = 0, nLk = 0, nSx = 0, nNk = 0;
      TG2.forEach(function (T) {
        if (C.tie) mine.forEach(function (t) {
          var o = t.a === P.id ? t.b : t.a;
          if (o === T.id || ix2[pk(T.id, o) + '|' + t.type]) return;
          var nt = JSON.parse(JSON.stringify(t));
          if (nt.a === P.id) nt.a = T.id; else nt.b = T.id;
          ix2[pk(T.id, o) + '|' + t.type] = 1; newT.push(nt);
        });
        var cnt2 = function (f, flag) { return flag ? idl(P[f]).filter(function (id) { return id !== T.id && by[id] && !has(T, f, id); }).length : 0; };
        nNG += cnt2('loveNG', C.ng); nLk += cnt2('loveLock', C.lock); nNk += cnt2('noKillFor', C.nk);
        if (sexOn() && sexMode(P)) nSx += cnt2('sexLocks', C.sex);
      });
      var bits = [];
      if (newT.length) bits.push('関係' + newT.length + '本');
      if (nNG) bits.push(ngLabel() + ' のべ' + nNG + '人');
      if (nLk) bits.push('恋愛相手の固定 のべ' + nLk + '人');
      if (nSx) bits.push(SEX.short + 'の固定 のべ' + nSx + '人');
      if (nNk) bits.push('殺さない相手 のべ' + nNk + '人');
      var n6 = newT.length + nNG + nLk + nSx + nNk, who = TG2.length === 1 ? TG2[0].name : TG2.length + '人';
      var tx6 = P.name + 'の設定を' + who + 'に写します（' + bits.join('・') + 'を足します。同じ相手にすでにあるものは飛ばします）';
      return { n: n6, msg: n6 ? tx6 : '写すものがありません（' + P.name + 'の関係・設定は、写す先にすでにあります）', ask: tx6 + '。よろしいですか？', label: P.name + 'の設定を' + who + 'に写した',
        run: function () {
          s.ties = (s.ties || []).concat(newT);
          TG2.forEach(function (T) {
            var each = function (f, fn) { idl(P[f]).slice().forEach(function (id) { var o = by[id]; if (o && o !== T && !has(T, f, id)) fn(o); }); };
            if (C.ng) each('loveNG', function (o) { ngOn(T, o); });
            if (C.lock) each('loveLock', function (o) { lockOn(T, o); });
            if (C.nk) each('noKillFor', function (o) { put(T, 'noKillFor', o.id); put(o, 'noKillFor', T.id); });
            if (sexOn() && C.sex && sexMode(P)) { var any = false; each('sexLocks', function (o) { put(T, 'sexLocks', o.id); any = true; }); if (any || !sexMode(T)) T.sexLock = P.sexLock; }
          });
          return P.name + 'の設定を' + who + 'に写しました';
        } };
    }
    return { n: 0, msg: '' };
  }

  /* ---------- 取り消し：一括の前の関係と、住人の「相手を指す設定」の写し ---------- */
  var SNAP_F = ['loveNG', 'loveLock', 'sexLock', 'sexLocks', 'noKillFor'];
  function snap() {
    var s = S();
    return { ties: JSON.parse(JSON.stringify(s.ties || [])), ch: s.chars.map(function (c) { var o = { id: c.id }; SNAP_F.forEach(function (f) { if (Object.prototype.hasOwnProperty.call(c, f)) o[f] = JSON.parse(JSON.stringify(c[f])); }); return o; }) };
  }
  function restore(sn) {
    var s = S(), by = byMap();
    s.ties = JSON.parse(JSON.stringify(sn.ties));
    sn.ch.forEach(function (o) { var c = by[o.id]; if (!c) return; SNAP_F.forEach(function (f) { if (f in o) c[f] = JSON.parse(JSON.stringify(o[f])); else delete c[f]; }); });
  }
  function finish(msg) {
    var y = window.pageYOffset;
    UI().cleanTies(); UI().save(); UI().renderCast();
    try { window.scrollTo(0, y); } catch (e) { /* 古い環境 */ }
    UI().toast(msg);
  }
  function runOp() {
    fix();
    var p = plan();
    if (!p.n || !p.run) { UI().toast(p.msg || 'できることがありません'); return; }
    if (!window.confirm(p.ask)) return;
    var before = snap(), msg = p.run();
    UI().cleanTies();
    undo = { label: p.label, before: before, after: JSON.stringify(snap()) };
    finish(msg + '（一括設定の「取り消す」で戻せます）');
  }
  function runUndo() {
    if (!undo) return;
    if (JSON.stringify(snap()) !== undo.after && !window.confirm('一括設定のあとで変えた関係・設定も、一括設定の前の状態に戻ります。取り消しますか？')) return;
    var u = undo; undo = null;
    restore(u.before);
    finish('「' + u.label + '」を取り消しました');
  }

  /* ---------- 一括設定の欄 ---------- */
  function opt(v, label, cur) { return '<option value="' + esc(v) + '"' + (v === cur ? ' selected' : '') + '>' + esc(label) + '</option>'; }
  function row(label, inner) { return '<div class="tbxr"><span class="tbxl">' + label + '</span>' + inner + '</div>'; }
  function sel(f, inner, aria) { return '<select id="tbx-' + f + '" data-tbf="' + f + '" aria-label="' + esc(aria) + '">' + inner + '</select>'; }
  function personSel(aria) { return sel('p', S().chars.map(function (c) { return opt(c.id, c.name, B.p); }).join(''), aria); }
  function groupSel(f, aria) { return sel(f, groups().map(function (g) { return opt(g, g, B[f]); }).join(''), aria); }
  function bodyHtml() {
    fix();
    var op = B.op, k = scKey(op), gs = groups(), N = needs(), h = '';
    h += row('やること', sel('op', OPS().map(function (o) { return opt(o[0], o[1], op); }).join(''), '一括設定でやること'));
    if (op === 'ng' || op === 'nk' || op === 'lock' || op === 'sex') h += row('付ける／外す', sel('mode', opt('add', op === 'lock' || op === 'sex' ? '足す' : '付ける', B.mode) + opt('del', '外す', B.mode), '付けるか外すか'));
    var scLab = k === 'sc' ? '範囲' : k === 'ts' ? '対象の関係' : op === 'copy' ? '写す先' : '相手';
    if (op === 'lock' || op === 'sex' || op === 'copy') h += row(op === 'copy' ? '写す元の人' : '選んだ人', personSel(op === 'copy' ? '写す元の人' : '選んだ人'));
    h += row(scLab, sel(k, scList(scOpts(op), Math.min(2, gs.length)).map(function (x) { return opt(x[0], x[1], B[k]); }).join(''), scLab));
    if (N.p && op !== 'lock' && op !== 'sex' && op !== 'copy') h += row('選んだ人', personSel('選んだ人'));
    if (N.g1) h += row(N.g2 ? 'グループ（1）' : 'グループ', groupSel('g1', 'グループ'));
    if (N.g2) h += row('グループ（2）', groupSel('g2', '二つ目のグループ'));
    if (op === 'tie') {
      var D = HK.TIES[B.ty];
      h += row('関係', sel('ty', HK.tieOptions ? HK.tieOptions(B.ty, { dir: true }) : HK.TIE_ORDER.map(function (id) { return opt(id, HK.TIES[id].label, B.ty); }).join(''), '付ける関係'));
      if (D && D.dir) {
        var who = /^p/.test(B.sc) ? ((byMap()[B.p] || {}).name || '選んだ人') : B.sc === 'g2' ? B.g1 + 'の人' : '名簿で上の人';
        h += row('向き', sel('dir', opt('l', who + 'が' + D.roleA + '（左）', B.dir) + opt('r', who + 'が' + D.roleB + '（右）', B.dir), '関係の向き'));
      }
      h += row('', '<label><input type="checkbox" data-tbf="rep" id="tbx-rep"' + (B.rep ? ' checked' : '') + '> 同じ二人にある関係を外して、この関係だけにする</label>');
    }
    if (op === 'lock' || op === 'sex') h += row('', '<label><input type="checkbox" data-tbf="both" id="tbx-both"' + (B.both ? ' checked' : '') + '> 相手の側にも、選んだ人を' + (B.mode === 'del' ? '外す' : '足す') + '（両方向）</label>');
    if (op === 'sex' && B.mode !== 'del') h += row('固定のしかた', sel('lk', opt('', '今の設定のまま（未設定なら「固定した相手だけ」）', B.lk) + opt('pick', '固定した相手だけ', B.lk) + opt('pickMob', '固定した相手＋モブ', B.lk), '固定のしかた'));
    if (op === 'fld' || op === 'del' || op === 'love') {
      var present = Object.create(null); (S().ties || []).forEach(function (t) { present[t.type] = 1; });
      h += row('関係の種類', sel('tf', opt('', 'すべての種類', B.tf) + HK.TIE_ORDER.filter(function (id) { return present[id] && HK.TIES[id]; }).map(function (id) { return opt(id, HK.TIES[id].label, B.tf); }).join(''), '関係の種類で絞る'));
      if (op === 'fld') h += row('変える内容', sel('fv', FV.map(function (x) { return opt(x[0], x[1], B.fv); }).join(''), '変える内容'));
      if (op === 'love') h += row('恋愛', sel('lv', LV.map(function (x) { return opt(x[0], x[1], B.lv); }).join(''), '恋愛のあり・なし')) +
        '<p class="tbxnote">「自動」は関係ごとの決まり（血縁・執着（信仰）・教師と生徒などは恋愛なし、ほかは恋愛あり）に戻します。「なし」は恋愛（告白・恋人・片想い）だけを止めます' + (HK.SAFE_ON ? '' : '（R18の場面も止めるときは「' + ngLabel() + '」）') + '。</p>';
    }
    if (op === 'copy') {
      var cb = function (v, label) { return '<label><input type="checkbox" data-tbf="cp" data-v="' + v + '"' + (B.cp[v] ? ' checked' : '') + '> ' + label + '</label>'; };
      h += row('写すもの', cb('tie', '関係') + cb('ng', ngLabel()) + cb('lock', '恋愛相手の固定') + (sexOn() ? cb('sex', SEX.label) : '') + cb('nk', '殺さない相手'));
      h += '<p class="tbxnote">同じ相手に対して付けます（写す元の人と写す先の人のあいだの関係は写しません）。今ある設定は消さずに足します。</p>';
    }
    if (op === 'ng') h += '<p class="tbxnote">二人とも、相手を「' + ngLabel() + '」に入れます。付けた二人のあいだの恋愛相手の固定' + (sexOn() ? '・' + SEX.short + 'の固定' : '') + 'は外れます（⚙️ 設定と同じ）。</p>';
    if (op === 'lock') h += '<p class="tbxnote">足した相手との「' + ngLabel() + '」は外れます（⚙️ 設定と同じ）。</p>';
    if (N.m) {
      var sel2 = picked().length;
      h += '<div class="tbxr"><span class="tbxl">選んだ住人たち</span><span id="tbxmn">' + sel2 + '人</span>' +
        '<button type="button" class="btn small" data-tba="mall">全員</button><button type="button" class="btn small" data-tba="mnone">選ぶのをやめる</button>' +
        gs.map(function (g) { return '<button type="button" class="btn small ghost" data-tba="mgrp" data-g="' + esc(g) + '" title="' + esc(g) + 'の全員を選ぶ">＋' + esc(g) + '</button>'; }).join('') + '</div>' +
        '<div class="gearrow tbxm">' + S().chars.map(function (c) { return '<label><input type="checkbox" data-tbf="m" data-o="' + esc(c.id) + '"' + (B.m[c.id] ? ' checked' : '') + '> ' + esc(c.name) + '</label>'; }).join('') + '</div>';
    }
    h += '<div id="tbxpv">' + pvHtml() + '</div>';
    if (undo) h += '<div class="tbxr"><button type="button" class="btn small" data-tba="undo">直前の一括設定を取り消す</button><span class="tbxnote" style="margin:0">（' + esc(undo.label) + '）</span></div>';
    return h;
  }
  function pvHtml() {
    var p;
    try { p = plan(); } catch (e) { p = { n: 0, msg: '計算できませんでした' }; }
    return '<p class="tbxpv' + (p.n ? '' : ' ng') + '">' + esc(p.msg || '') + '</p>' +
      '<div class="tbxr"><button type="button" class="btn primary" data-tba="run"' + (p.n ? '' : ' disabled') + '>実行する</button></div>';
  }
  function bulkHtml() {
    return '<details class="tbx" id="tiebx"' + (B.open ? ' open' : '') + '><summary>一括設定</summary><div id="tbxbody">' + (B.open ? bodyHtml() : '') + '</div></details>';
  }
  function redrawPanel(focusId) {
    var d = document.getElementById('tiebx'), b = document.getElementById('tbxbody');
    if (!d || !b) return;
    b.innerHTML = bodyHtml();
    if (HK.CastPages && HK.CastPages.after) HK.CastPages.after(d);
    var el = focusId && document.getElementById(focusId);
    if (el && el.focus) { try { el.focus({ preventScroll: true }); } catch (e) { el.focus(); } }
  }
  function redrawPv() {
    var b = document.getElementById('tbxpv'), n = document.getElementById('tbxmn');
    if (b) b.innerHTML = pvHtml();
    if (n) n.textContent = picked().length + '人';
  }

  if (typeof document !== 'undefined' && document.addEventListener) {
    /* 折りたたみ：グループの見出し（開いたときに中の行を描く）・一括設定 */
    document.addEventListener('toggle', function (ev) {
      var d = ev.target;
      if (!d || d.tagName !== 'DETAILS') return;
      if (d.id === 'tiebx') { B.open = d.open; if (d.open) redrawPanel(); return; }
      if (!d.classList.contains('tieg') || !d.closest('.tiebox')) return;
      var key = d.getAttribute('data-g');
      if (!query()) { if (d.open) delete FOLD[key]; else FOLD[key] = 1; keepFold(); }
      if (d.open && !d.querySelector('.tierow') && lastRow) {
        var T = S().ties || [], ks = (d.getAttribute('data-ks') || '').split(',').filter(Boolean).map(Number);
        d.insertAdjacentHTML('beforeend', ks.map(function (k) { return T[k] ? lastRow(T[k], k) : ''; }).join(''));
        if (HK.CastPages && HK.CastPages.after) HK.CastPages.after(d);
      }
    }, true);
    document.addEventListener('click', function (ev) {
      var t = ev.target;
      if (!t || !t.closest) return;
      var hn = t.closest('.tiebox .tiehint');
      if (hn) { hn.classList.toggle('open'); return; }
      var b = t.closest('[data-tba]');
      if (!b || !b.closest('#tiebx')) return;
      var a = b.getAttribute('data-tba');
      if (a === 'run') runOp();
      else if (a === 'undo') runUndo();
      else if (a === 'mall' || a === 'mnone' || a === 'mgrp') {
        if (a === 'mnone') B.m = {};
        S().chars.forEach(function (c) { if (a === 'mall' || (a === 'mgrp' && inG(c, b.getAttribute('data-g')))) B.m[c.id] = 1; });
        Array.prototype.forEach.call(document.querySelectorAll('#tiebx input[data-tbf="m"]'), function (x) { x.checked = !!B.m[x.getAttribute('data-o')]; });
        redrawPv();
      }
    });
    var LAYOUT = { op: 1, sc: 1, tg: 1, ts: 1, mode: 1, ty: 1, p: 1, g1: 1 };
    document.addEventListener('change', function (ev) {
      var t = ev.target, f = t && t.getAttribute && t.getAttribute('data-tbf');
      if (!f || !t.closest('#tiebx')) return;
      if (f === 'm') { if (t.checked) B.m[t.getAttribute('data-o')] = 1; else delete B.m[t.getAttribute('data-o')]; redrawPv(); return; }
      if (f === 'cp') { B.cp[t.getAttribute('data-v')] = t.checked ? 1 : 0; redrawPv(); return; }
      if (f === 'rep' || f === 'both') B[f] = !!t.checked;
      else B[f] = t.value;
      if (f === 'op') { var k = scKey(B.op); if (B.op === 'copy') B.tg = 'm'; else if (k === 'tg' && B.tg !== 'g' && B.tg !== 'm' && B.tg !== 'a') B.tg = 'g'; }
      if (LAYOUT[f] || f === 'both') redrawPanel('tbx-' + f); else redrawPv();
    });
  }

  HK.TiesUI = {
    section: section, rowsHtml: rowsHtml, sortKs: sortKs, reveal: reveal,
    /* 恋愛の欄（⚙️ 設定の相手ごとの関係の枠でも使う） */
    love: { val: loveVal, def: loveDef, help: loveHelp, sel: loveSel, note: loveNote },
    /* 点検・試験用：一括設定の選択を変える（画面の欄と同じ）・計画・実行（確かめなし）・取り消し */
    bulk: {
      set: function (o) { Object.keys(o || {}).forEach(function (k) { B[k] = o[k]; }); fix(); return B; },
      plan: function () { fix(); var p = plan(); return { n: p.n, msg: p.msg }; },
      run: function () { fix(); var p = plan(); if (!p.n || !p.run) return null; var before = snap(), msg = p.run(); UI().cleanTies(); undo = { label: p.label, before: before, after: JSON.stringify(snap()) }; UI().save(); UI().renderCast(); return msg; },
      undo: function () { if (!undo) return false; var u = undo; undo = null; restore(u.before); UI().cleanTies(); UI().save(); UI().renderCast(); return true; },
      state: function () { return B; }
    }
  };
})();
