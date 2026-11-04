/* 箱庭シミュレーター ui: 住人の一覧のグループ・タグの付け方（2026-11-04。結果には影響しない）
   利用者の指示「グループは住人の一覧にプルダウンを設けて、既定は『なし』、設定があれば選んだり新しく追加できる形に（一人ずつ設定を開くのは面倒）。スマホでも」
   「タグも同じ考え方で（札が並び、＋で今あるタグから選ぶか新しく足す。札の × で外す）」。
   ・ここ（中核）は描くだけ：住人の行の .tsline（グループの選択＋タグの札と「＋タグ」）、まとめて付ける帯、行のチェック、見た目（CSS）
   ・押したあとの小さな一覧（今ある全グループ／全タグのチェック・新しく作る・名前の変更・削除）と、まとめて付ける操作は late の ui-tagsel-pop.js（HK.TagSelPop）
   ・住人の設定の窓の節「グループ・メモ」（ui-gear-basic.js）も同じ部品（field）を使う
   ・保存の形は今までどおり：c.group（読点区切り、40 字まで）・c.tags（同、80 字まで） */
(function () {
  'use strict';
  var HK = window.HK;
  if (!HK || typeof document === 'undefined') return;
  var esc = HK.escape;
  /* g：グループ（選択の見た目）／t：タグ（札＋「＋」） */
  var K = { g: { f: 'group', max: 40, name: 'グループ' }, t: { f: 'tags', max: 80, name: 'タグ' } };
  var memo = Object.create(null), memoN = 0;
  function split(s) {
    s = String(s || '');
    var m = memo[s];
    if (m) return m;
    var out = []; s.split(/[,，、]/).forEach(function (x) { x = x.trim(); if (x && out.indexOf(x) < 0) out.push(x); });
    if (++memoN > 5000) { memo = Object.create(null); memoN = 0; }
    return (memo[s] = out);
  }
  function list(c, k) { return split(c && c[K[k].f]); }
  function S() { return HK.UI && HK.UI.state ? HK.UI.state() : { chars: [] }; }
  /* 名簿の全員から集めた名前（最初に出てきた順）と人数 */
  function all(k) {
    var out = [], n = Object.create(null);
    S().chars.forEach(function (c) { list(c, k).forEach(function (x) { if (!n[x]) { n[x] = 0; out.push(x); } n[x]++; }); });
    return { list: out, n: n };
  }
  var CHEV = '<svg class="tschev" width="10" height="6" viewBox="0 0 10 6" aria-hidden="true" focusable="false"><path d="M1 1l4 4 4-4" fill="none" stroke="currentColor" stroke-width="1.5"/></svg>';
  /* 一人分の部品。where：'row'（住人の行）／'gear'（設定の窓。押すと ui-gear-basic.js の act に回る） */
  function field(c, k, where) {
    var v = list(c, k), nm = esc(c.name), id = esc(c.id), g = where === 'gear' ? ' data-gact="tsopen"' : '';
    if (k === 'g') {
      return '<button type="button" class="tsg' + (v.length ? '' : ' none') + '" data-ts="g" data-tsid="' + id + '"' + g + ' aria-haspopup="dialog" aria-expanded="false" aria-label="' + nm + 'のグループ：' + esc(v.length ? v.join('・') : 'なし') + '（押すと選べます）" title="押すと、今あるグループから選んだり、新しいグループを作ったりできます（いくつでも）">' +
        '<span class="tsl">グループ</span>' + (v.length ? v.map(function (x) { return '<span class="tsv">' + esc(x) + '</span>'; }).join('') : '<span class="tsv0">なし</span>') + CHEV + '</button>';
    }
    var x = where === 'gear' ? ' data-gact="tsx"' : '';
    return '<span class="tst" role="group" aria-label="' + nm + 'のタグ">' + v.map(function (t) {
      return '<span class="tsc"><span class="tsct">' + esc(t) + '</span><button type="button" class="tsx" data-tsx="t" data-tsid="' + id + '" data-v="' + esc(t) + '"' + x + ' aria-label="' + nm + 'のタグ「' + esc(t) + '」を外す" title="外す">×</button></span>';
    }).join('') + '<button type="button" class="tsadd" data-ts="t" data-tsid="' + id + '"' + g + ' aria-haspopup="dialog" aria-expanded="false" aria-label="' + nm + 'にタグを付ける" title="今あるタグから選ぶか、新しいタグを作って付けます（グループとは別の目印。結果には影響しません）">＋タグ</button></span>';
  }
  /* 住人の行のいちばん下の段（PC は住人の列から右へ、スマホは行の幅いっぱい） */
  function line(c) { return '<div class="tsline">' + field(c, 'g', 'row') + field(c, 't', 'row') + '</div>'; }

  /* ---------- まとめて付ける：住人をチェックで選んで、グループ・タグを一度に ---------- */
  var B = { on: false, sel: Object.create(null) };
  function count() { var n = 0, ids = Object.create(null); S().chars.forEach(function (c) { ids[c.id] = 1; }); Object.keys(B.sel).forEach(function (k) { if (ids[k]) n++; else delete B.sel[k]; }); return n; }
  function check(c) {
    if (!B.on) return '';
    return '<label class="tsck" title="まとめて付ける住人に選ぶ"><input type="checkbox" data-tssel="' + esc(c.id) + '"' + (B.sel[c.id] ? ' checked' : '') + ' aria-label="' + esc(c.name) + 'を選ぶ"></label>';
  }
  function bulkBar() {
    if (S().chars.length < 2) return '';
    if (!B.on) return '<div class="tsbulk"><button type="button" class="btn small" data-tsb="on" title="住人をチェックで選んで、グループやタグを一度に付けます（一人ずつ開かなくて済みます）">まとめてグループ・タグを付ける</button></div>';
    var n = count();
    return '<div class="tsbulk on" role="group" aria-label="選んだ住人にまとめて付ける"><span class="tsbn" aria-live="polite"><b>' + n + '</b> 人を選択中</span>' +
      '<button type="button" class="btn small ghost" data-tsb="page" title="いま一覧に見えている住人を全員選びます">全員を選ぶ</button><button type="button" class="btn small ghost" data-tsb="none"' + (n ? '' : ' disabled') + '>選択を外す</button>' +
      '<span class="tsbsp"></span><button type="button" class="btn small" data-ts="g" data-tsbulk="1" aria-haspopup="dialog" aria-expanded="false"' + (n ? '' : ' disabled') + '>グループに入れる' + CHEV + '</button>' +
      '<button type="button" class="btn small" data-ts="t" data-tsbulk="1" aria-haspopup="dialog" aria-expanded="false"' + (n ? '' : ' disabled') + '>タグを付ける' + CHEV + '</button>' +
      '<button type="button" class="btn small primary" data-tsb="off">終わる</button></div>';
  }

  /* 見た目。PC はマウス向けに小さく、幅 900px 以下・指で触る端末は押す所を 40px 以上に */
  var css =
    '.tsline{display:flex;flex-wrap:wrap;gap:6px;align-items:center;min-width:0}' +
    '.tsg,.tsadd,.tsc{font:inherit;font-size:12px;line-height:1.2;min-height:28px;box-sizing:border-box;color:var(--ui-ink,var(--ink))}' +
    '.tsg{appearance:none;-webkit-appearance:none;display:inline-flex;flex-wrap:wrap;align-items:center;gap:4px;max-width:100%;padding:3px 8px 3px 10px;border:1px solid var(--ui-line2,var(--line));border-radius:8px;background:var(--ui-card,var(--paper));cursor:pointer;text-align:left}' +
    '.tsg:hover{border-color:var(--ui-line3,var(--ink))}.tsg[aria-expanded="true"]{border-color:var(--ui-ink,var(--ink));box-shadow:0 0 0 1px var(--ui-ink,var(--ink))}' +
    '.tsg .tsl{color:var(--ui-muted,var(--muted));font-size:11px;margin-right:2px}.tsg .tsv0{color:var(--ui-muted,var(--muted))}' +
    '.tsg .tsv{display:inline-block;max-width:12em;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;padding:1px 7px;border-radius:4px;background:var(--ui-accent-soft,var(--bg1));color:var(--ui-accent,var(--ink));font-weight:700}' +
    '.tsg .tschev{flex:none;margin-left:2px;color:var(--ui-muted,var(--muted))}.tsg.none{border-style:dashed}' +
    '.tst{display:inline-flex;flex-wrap:wrap;gap:4px 6px;align-items:center;min-width:0}' +
    '.tsc{display:inline-flex;align-items:center;max-width:14em;padding:0 0 0 10px;border:1px solid var(--ui-line,var(--line));border-radius:999px;background:var(--ui-soft,var(--bg1))}' +
    '.tsc .tsct{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.tsc .tsct::before{content:"#";color:var(--ui-muted,var(--muted));margin-right:1px}' +
    '.tsx{appearance:none;-webkit-appearance:none;flex:none;width:26px;min-height:26px;padding:0;border:0;border-radius:999px;background:none;color:var(--ui-muted,var(--muted));font:inherit;font-size:13px;line-height:1;cursor:pointer}' +
    '.tsx:hover,.tsx:focus-visible{color:var(--ui-ink,var(--ink));background:var(--ui-line,var(--line))}' +
    '.tsadd{appearance:none;-webkit-appearance:none;padding:0 10px;border:1px dashed var(--ui-line2,var(--line));border-radius:999px;background:none;color:var(--ui-muted2,var(--muted));cursor:pointer}' +
    '.tsadd:hover,.tsadd[aria-expanded="true"]{border-style:solid;color:var(--ui-ink,var(--ink))}' +
    '#view-cast .res .tsline{grid-column:2/-1;grid-row:2}#view-cast .res .draghandle{grid-row:span 2}#view-cast .res{row-gap:4px}' +
    '.tsck{display:inline-flex;align-items:center;justify-content:center;flex:none;width:32px;min-height:40px;margin:0 -4px 0 -6px;cursor:pointer}.tsck input{width:18px;height:18px;margin:0}' +
    '.tsbulk{display:flex;flex-wrap:wrap;gap:6px 8px;align-items:center;margin:2px 0 10px}' +
    '#view-cast .tsbulk.on{position:sticky;top:var(--tsb-top,44px);z-index:6;padding:8px 10px;border:1px solid var(--ui-ink,var(--ink));border-radius:10px;background:var(--ui-card,var(--paper));box-shadow:0 4px 12px rgba(0,0,0,.08)}' +
    '.tsbulk .tsbsp{flex:1 1 auto}.tsbulk .tsbn{font-size:13px}.tsbulk .btn .tschev{margin-left:6px}' +
    '@media (max-width:900px),(pointer:coarse){.tsg,.tsadd,.tsc{min-height:40px;font-size:13px}.tsx{width:40px;min-height:40px}.tsc{padding-left:12px}.tsck{width:40px;min-height:44px}#view-cast .tsbulk .btn{min-height:40px}}' +
    '@media (max-width:599px){#view-cast .res .tsline{grid-column:1/-1;grid-row:auto;padding:2px 0 2px}' +
      '#view-cast[data-tsbulk] .uimobar{display:none!important}#view-cast[data-tsbulk]:not([hidden]){padding-bottom:130px}' +
      '#view-cast .tsbulk.on{position:fixed;left:0;right:0;bottom:0;top:auto;z-index:26;margin:0;border:0;border-top:1px solid var(--ui-line,var(--line));border-radius:0;padding:8px 12px calc(10px + env(safe-area-inset-bottom,0px));box-shadow:0 -4px 12px rgba(0,0,0,.08)}' +
      '#view-cast .tsbulk.on .tsbn{flex:1 1 auto}#view-cast .tsbulk.on .tsbsp{flex:1 1 100%;height:0}#view-cast .tsbulk.on .btn.ghost{padding:0 8px}#view-cast .tsbulk.on [data-tsbulk]{flex:1 1 auto;padding:0 8px;white-space:nowrap}#view-cast .tsbulk.on .btn .tschev{margin-left:4px}' +
      'html body:has(#view-cast[data-tsbulk]:not([hidden])) #pagejump,html body:has(#view-cast[data-tsbulk]:not([hidden])) .toast{bottom:calc(124px + env(safe-area-inset-bottom,0px))}}';
  var st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);

  /* 押したとき：小さな一覧は late（ui-tagsel-pop.js）。読み終える前に押されたら知らせるだけ */
  document.addEventListener('click', function (ev) {
    if (HK.TagSelPop) return;
    var b = ev.target.closest && ev.target.closest('[data-ts],[data-tsx],[data-tsb]');
    if (b && HK.UI && HK.UI.toast) HK.UI.toast('読み込み中です。少し待ってからもう一度押してください');
  });

  HK.TagSel = { K: K, split: split, list: list, all: all, field: field, line: line, check: check, bulkBar: bulkBar, bulk: B, count: count };
})();
