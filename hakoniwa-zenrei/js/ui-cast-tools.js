/* 箱庭シミュレーター: 住人タブの上部の道具（2026-10-27 の UI リデザイン仕様 7。結果には影響しない）
   ・見出し行「住人 n / 上限 ？」＋1行のヒント。右に「1 人追加 ▾」（分割ボタン：左は 1 人追加、▾ でメニュー）と「データ ▾」（ダイアログ）
     見出し（h2.sec）は ui-fold.js の折りたたみの summary に入るので、ここのボタンを押しても節は開け閉めしない（click の既定の動作を止める）
   ・「1 人追加 ▾」のメニュー：1 人追加／10 人追加／ランダムで 1 人追加／質問に答えて診断して追加／名簿を貼り付けて取り込む（上の「住人をまとめて登録」の欄へ移る）／追加時の名前
     メニューの各項目は ui.js の data-act（add・add10・randadd・quiz）と data-f="randstyle" をそのまま使う。メニューは body の直下に置く（summary の中に select を置かない）
   ・「データ」ダイアログ：タブ「まるごと（別の端末へ）｜名簿・JSON｜保存フォルダ」。中身は portable.js・ui-import.js（ioHtml）・save-folder.js の html。ボタンの処理はそれぞれのファイルのまま
     保存フォルダに確認が要るとき（許可・フォルダのほうが新しい・書けない）は「データ」に印を付け、開いたときは保存フォルダのタブを出す
   ・ツールバー（ui-cast-pages.js が組み立てる）に入れる部品：グループの件数つきチップ（すべて N／各グループ／グループなし）と「並び」select（登録順・グループ順・名前順）
     チップ：「すべて」のときにグループを押すとそのグループだけ。続けて押すと足す／外す。全部外れたら「すべて」に戻る（S.grpHide・S.grpHideNone を書き換える。表示だけ）
     並び：登録順・グループ順は ui.js の data-act（sortreg・sortgrp）を押したのと同じ。名前順はここで並べる
   ・グループ見出し（ui-cast-pages.js の castHead）の「名前を変更」：住人のグループの文字列・隠しているグループ・仲間とみなすグループ・箱庭タブの「ランダムに選ぶ」の元・折りたたみの鍵をまとめて変える
   ui.js が HK.CastTools.bind(ctx) で住人の状態・上限・「名簿・JSON」の欄の中身（選んで書き出す欄の開閉と HTML）を渡す（ui.js より前に読む） */
(function () {
  'use strict';
  var HK = window.HK;
  if (!HK || typeof document === 'undefined') return;
  var esc = HK.escape || function (s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); };
  var P = null;
  var KEY = HK.STORE ? HK.STORE.key('hakoniwa_castdata_v1') : 'hakoniwa_castdata_v1', mem = {};
  try { mem = JSON.parse(localStorage.getItem(KEY) || '{}') || {}; } catch (e) { mem = {}; }
  function put() { try { localStorage.setItem(KEY, JSON.stringify(mem)); } catch (e) { /* 保存できなくてもタブは選べる */ } }
  var coll = null, colN = null;
  try { coll = new Intl.Collator('ja'); colN = new Intl.Collator('ja', { numeric: true }); } catch (e) { coll = colN = { compare: function (a, b) { return String(a).localeCompare(String(b)); } }; }

  /* 線画のアイコン（絵文字は使わない） */
  var PLUS = '<svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true" focusable="false"><path d="M6 1v10M1 6h10" stroke="currentColor" stroke-width="1.5" fill="none"/></svg>';
  var CHEV = '<svg width="10" height="6" viewBox="0 0 10 6" aria-hidden="true" focusable="false"><path d="M1 1l4 4 4-4" fill="none" stroke="currentColor" stroke-width="1.5"/></svg>';
  var FOLD = '<svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true" focusable="false"><path d="M4 2.5l3 3 3-3M4 11.5l3-3 3 3" fill="none" stroke="currentColor" stroke-width="1.4"/></svg>';
  var OPEN = '<svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true" focusable="false"><path d="M4 5.5l3-3 3 3M4 8.5l3 3 3-3" fill="none" stroke="currentColor" stroke-width="1.4"/></svg>';

  var css =
    /* 見出し行 */
    'h2.sec.casthead{display:flex;flex-wrap:wrap;align-items:center;gap:6px 10px;flex:1;min-width:0}' +
    'h2.sec.casthead .ctn{font-family:var(--f-num);font-size:13px;font-weight:400;letter-spacing:.02em;color:var(--muted)}' +
    'h2.sec.casthead .cthacts{order:2;margin-left:auto;display:inline-flex;flex-wrap:wrap;gap:8px;align-items:center;font-size:12px;font-weight:500;letter-spacing:0}' +
    'details.fold:not([open])>summary h2.sec.casthead::after{order:1}' +
    '.ctlead{margin:-2px 0 12px}' +
    '.csplit{display:inline-flex;align-items:stretch;flex:none}.csplit>.btn:first-child{border-top-right-radius:0;border-bottom-right-radius:0}' +
    '.csplit>.csplit-c{border-top-left-radius:0;border-bottom-left-radius:0;border-left-color:var(--paper);padding:0 9px;min-width:30px}' +
    '.csplit>.btn:not(.primary).csplit-c{border-left-color:var(--line2);margin-left:-1px}' +
    '.cthacts .btn.primary{min-height:30px;padding:2px 12px;font-size:12px}.cthacts .csplit-c,.ctbottom .csplit-c{padding:0 9px}' +
    /* スマホの下の帯（ui.js の .uimobar）：取り込み・データ・＋住人を追加 ▾（2026-11-02） */
    '#view-cast .uimobar .csplit{flex:1 1 auto;display:flex;min-width:0}#view-cast .uimobar .csplit [data-act="add"]{flex:1 1 auto;min-width:0;min-height:48px}#view-cast .uimobar .csplit-c{flex:none;min-height:48px}#view-cast .uimobar .ctdata{flex:none;padding:0 14px}#view-cast .uimobar .btn{white-space:nowrap}#view-cast .uimobar [data-uia="imp"]{padding:0 12px}' +
    /* スマホでも住人の数（n / 上限）と TIPS の ？ を出す（見出しの大きな文字は出さない。2026-11-02） */
    '@media (max-width:599px){#view-cast .uihead .uittl{display:flex;align-items:center;gap:8px;order:-1}#view-cast .uihead .uih1{font-size:15px;margin:0}}' +
    '.ctdata.attn::after{content:"";flex:none;width:7px;height:7px;border-radius:50%;background:var(--hot)}' +
    '.ctbottom{margin-top:12px}' +
    /* ツールバー（1本・上下の罫線） */
    '.ctbar{display:flex;flex-wrap:wrap;align-items:center;gap:8px 14px;padding:8px 0;margin:0 0 10px;border-top:1px solid var(--line);border-bottom:1px solid var(--line)}' +
    '.ctbar input[type=search]{flex:0 1 270px;min-width:10em;max-width:100%;min-height:32px;font-size:13px}' +
    '.ctchips{display:flex;flex-wrap:wrap;gap:6px;align-items:center;flex:1 1 180px;min-width:0;padding:2px 0}' +
    '.ctchips .chip{flex:none}.chip .ctc{font-family:var(--f-num);font-size:11px;font-weight:400;opacity:.8}' +
    '.ctsort,.ctview{display:inline-flex;align-items:center;gap:6px;flex:none}.ctbar select{min-height:32px;font-size:12px}' +
    '.ctview .btn.icon{width:32px;min-width:32px;padding:0;justify-content:center}' +
    '.cptags{margin:-2px 0 10px}' +
    /* グループ見出し */
    '.cgrp .cgfold{display:inline-flex;align-items:center;gap:8px}.cgrp .cgfold svg,.bxgin .cgfold svg{flex:none;transition:transform .15s}.cgrp .cgfold[aria-expanded=false] svg{transform:rotate(-90deg)}' +
    '.cgrp .cgn{font-family:var(--f-num);font-size:12px;color:var(--muted)}' +
    '.cgsw{display:inline-flex;align-items:center;gap:6px;font-size:12px;color:var(--muted2);cursor:pointer;white-space:nowrap}.cgsw input{margin:0}' +
    '.cgrp .cgact{display:inline-flex;flex-wrap:wrap;gap:4px}' +
    /* 「1 人追加 ▾」のメニュー */
    '.ctmenu{position:absolute;z-index:40;min-width:250px;max-width:calc(100vw - 16px);background:var(--paper);color:var(--ink);border:1px solid var(--line2);border-radius:var(--r,4px);padding:6px;display:flex;flex-direction:column}' +
    '.ctmenu[hidden]{display:none}' +
    '.ctmi{appearance:none;-webkit-appearance:none;display:flex;align-items:center;gap:8px;width:100%;min-height:36px;padding:0 10px;border:0;border-radius:3px;background:none;color:var(--ink);font:inherit;font-size:13px;text-align:left;cursor:pointer}' +
    '.ctmi:hover,.ctmi:focus-visible{background:var(--bg1);outline:none}.ctmi:focus-visible{box-shadow:inset 0 0 0 2px var(--ink)}.ctmi:disabled{opacity:.45;cursor:default;background:none}' +
    '.ctmn{margin-left:auto;font-family:var(--f-num);font-size:11px;color:var(--muted)}' +
    '.ctmenu hr{border:0;border-top:1px solid var(--line);margin:6px 0;width:100%}' +
    '.ctmsel{display:flex;flex-direction:column;gap:4px;padding:2px 10px 6px;font-size:12px;color:var(--muted)}.ctmsel select{width:100%;min-height:32px;font-size:13px}' +
    /* 「データ」ダイアログ */
    '.ctdov{position:fixed;inset:0;z-index:29;background:rgba(10,16,22,.55);display:flex;align-items:flex-start;justify-content:center;padding:max(24px,env(safe-area-inset-top,0px)) 16px max(16px,env(safe-area-inset-bottom,0px));overflow-y:auto;-webkit-overflow-scrolling:touch}' +
    '.ctdov[hidden]{display:none}' +
    /* 頭（題名・閉じる・種類の切替）は固定し、中身 .ctdbody だけをスクロールする（2026-11-02 担当UG。高さは 100dvh 基準） */
    '.ctdbox{background:var(--paper);color:var(--ink);border:1px solid var(--line2);border-radius:var(--r-card,6px);width:100%;max-width:700px;padding:20px 24px 0;margin:auto 0;min-width:0;box-sizing:border-box;display:flex;flex-direction:column;overflow:hidden;' +
      'max-height:calc(100vh - 40px - env(safe-area-inset-top,0px) - env(safe-area-inset-bottom,0px));max-height:calc(100dvh - 40px - env(safe-area-inset-top,0px) - env(safe-area-inset-bottom,0px))}' +
    '.ctdhd,.ctdtabs{flex:none}.ctdbody{flex:1 1 auto;min-height:0;overflow-x:hidden;overflow-y:auto;margin:0 -24px;padding:0 24px 18px}' +
    '.ctdbox:focus{outline:none}' +
    '.ctdhd{display:flex;align-items:center;gap:8px;margin:0 0 6px}.ctdhd h2{margin:0;font-size:17px;font-weight:700;letter-spacing:.02em}.ctdhd .sp{flex:1}' +
    '.ctdtabs{display:flex;gap:22px;border-bottom:1px solid var(--line);margin:0 0 16px;overflow-x:auto;scrollbar-width:none}' +
    '.ctdtabs [role=tab]{appearance:none;-webkit-appearance:none;flex:none;background:none;border:0;border-bottom:2px solid transparent;margin-bottom:-1px;padding:10px 2px 9px;color:var(--muted);font:inherit;font-size:13px;cursor:pointer;white-space:nowrap}' +
    '.ctdtabs [role=tab][aria-selected=true]{color:var(--ink);border-bottom-color:var(--ink);font-weight:700}.ctdtabs [role=tab]:focus-visible{outline:2px solid var(--ink);outline-offset:-2px}' +
    '.ctdp{display:flex;flex-direction:column;gap:16px;min-width:0}' +
    '.ctblk{display:flex;flex-direction:column;gap:5px;min-width:0}.ctrow{display:flex;flex-wrap:wrap;gap:6px 8px;align-items:center}' +
    '.ctdesc{margin:0;font-size:12px;color:var(--muted);line-height:1.6}' +
    '.ctdbk{margin:18px 0 0;padding-top:10px;border-top:1px solid var(--line);font-size:11.5px;color:var(--muted);line-height:1.6}' +
    '@media (max-width:600px){.ctdsub{display:none}.ctbar input[type=search]{flex:1 1 100%}.ctchips{flex-basis:100%;flex-wrap:nowrap;overflow-x:auto;scrollbar-width:thin}.ctdbox{padding:16px 16px 0}.ctdbody{margin:0 -16px;padding:0 16px 14px}.ctdtabs{gap:16px}h2.sec.casthead .cthacts{margin-left:0;width:100%}}';
  var stEl = document.createElement('style'); stEl.textContent = css; (document.head || document.documentElement).appendChild(stEl);

  function S() { return P ? P.S() : { chars: [] }; }
  function gl(c) { return HK.groupList ? HK.groupList(c) : []; }
  function groupsOf() { var g = [], seen = Object.create(null); S().chars.forEach(function (c) { gl(c).forEach(function (x) { if (!seen[x]) { seen[x] = 1; g.push(x); } }); }); return g; }
  function UI() { return HK.UI || {}; }
  function toast(m) { if (UI().toast) UI().toast(m); }
  function redraw() { if (UI().save) UI().save(); if (UI().renderCast) UI().renderCast(); }
  function top() { if (HK.CastPages && HK.CastPages.top) HK.CastPages.top(); }
  /* ui.js の data-act の処理をそのまま呼ぶ（隠したボタンを押す） */
  function fire(act, data) {
    var b = document.createElement('button');
    b.type = 'button'; b.hidden = true; b.setAttribute('data-act', act);
    Object.keys(data || {}).forEach(function (k) { b.setAttribute('data-' + k, data[k]); });
    document.body.appendChild(b);
    try { b.click(); } finally { if (b.parentNode) b.parentNode.removeChild(b); }
  }
  function scenName() {
    var id = S().scenId, s = id && (HK.Load && HK.Load.info ? HK.Load.info(id) : HK.SCENARIOS && HK.SCENARIOS[id]);
    return s && s.name ? s.name : '';
  }

  /* ---------- 見出し行 ---------- */
  function full() { return P ? S().chars.length >= P.max : false; }
  function split(where) {
    var dis = full() ? ' disabled title="住人が上限まで登録されています"' : '', pri = where === 'top' || where === 'mob' ? ' primary' : '';
    return '<span class="csplit" data-where="' + where + '"><button type="button" class="btn' + pri + '" data-act="add"' + dis + '>' + PLUS + '住人を追加</button>' +
      '<button type="button" class="btn' + pri + ' csplit-c" data-ct="addmenu" aria-haspopup="menu" aria-expanded="false" aria-label="ほかの足し方（10 人・ランダム・サンプルから・複製・診断・名簿）" title="ほかの足し方">' + CHEV + '</button></span>';
  }
  /* 見出し（2026-11-01 担当UA：見本 01）：「住人 n / 上限 人」と、右に節の切替「住人一覧｜口調の全体設定｜話題 n｜関係 n」（切り替えは ui-shell.js）。
     h2.sec にしない（ui-fold.js の折りたたみに入れない）。o：{ topics: 話題の数, ties: 関係の数, pane: 今の節 } */
  var PANE_TABS = [['list', '住人一覧'], ['voice', '口調の全体設定'], ['topics', '話題'], ['ties', '関係']];
  function head(n, o) {
    o = o || {};
    var cnt = { topics: o.topics, ties: o.ties };
    return '<div class="uihead"><div class="uittl"><h2 class="uih1" id="casthead">住人</h2><span class="uicnt num">' + n + ' / ' + (P ? P.max : '') + ' 人</span>' + (HK.Tips ? HK.Tips.btn('cast') : '') + '</div>' +
      '<div class="uitabs" role="tablist" aria-label="住人タブの中">' + PANE_TABS.map(function (t) {
        var on = (o.pane || 'list') === t[0];
        return '<button type="button" role="tab" id="cpane-' + t[0] + '" data-uipane="' + t[0] + '" aria-selected="' + on + '"' + (on ? '' : ' tabindex="-1"') + '>' +
          (t[0] === 'voice' ? '<span class="uitl">' + t[1] + '</span><span class="uits">口調</span>' : t[1]) + (cnt[t[0]] != null ? ' <span class="uitn num">' + cnt[t[0]] + '</span>' : '') + '</button>';
      }).join('') + '</div></div>';
  }
  /* 道具の帯の右：「診断結果をまとめて取り込む」（取り込みの欄を開け閉め。ui-shell.js）「データ ▾」（ダイアログ）「＋住人を追加 ▾」（分割ボタン） */
  var DOC = '<svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M3 2.5h7l3 3v8H3z M5.5 7h5 M5.5 9.5h5 M5.5 12h3"/></svg>';
  function actions() {
    return '<span class="ctacts"><button type="button" class="btn uiimpbtn" data-uia="imp" aria-controls="castimp" aria-expanded="false">' + DOC + '<span>診断結果をまとめて取り込む</span></button>' +
      '<button type="button" class="btn ctdata' + (attn() ? ' attn' : '') + '" data-ct="data" aria-haspopup="dialog" aria-controls="castdata" title="' + (attn() ? '保存フォルダの確認が要ります' : '書き出し・読み込み・別の端末へ・保存フォルダ') + '">データ' + CHEV + '</button>' +
      split('top') + '</span>';
  }
  function bottom() { return ''; }

  /* ---------- ツールバーの部品（ui-cast-pages.js の castParts が差し込む） ---------- */
  function chips() {
    var C = S().chars, cnt = Object.create(null), gs = [], none = 0;
    C.forEach(function (c) { var g = gl(c); if (!g.length) none++; for (var k = 0; k < g.length; k++) { if (!(g[k] in cnt)) { cnt[g[k]] = 0; gs.push(g[k]); } cnt[g[k]]++; } });
    if (!gs.length) return '';
    var h = S().grpHide || {}, all = isAll(gs, none);
    var chip = function (k, g, label, n, on, title) {
      return '<button type="button" class="chip" data-act="cgchip" data-k="' + k + '"' + (g != null ? ' data-g="' + esc(g) + '"' : '') + ' aria-pressed="' + on + '" title="' + esc(title) + '">' + esc(label) + ' <span class="ctc">' + n + '</span></button>';
    };
    return '<div class="ctchips" role="group" aria-label="グループで絞り込む（表示だけ）">' + chip('all', null, 'すべて', C.length, all, '全員を出す') +
      gs.map(function (g) { var on = !all && !h[g]; return chip('g', g, g, cnt[g], on, all ? g + 'の住人だけを出す' : on ? g + 'を外す' : g + 'も出す'); }).join('') +
      (none ? chip('none', null, 'グループなし', none, !all && !S().grpHideNone, 'グループのない住人' + (all ? 'だけを出す' : !S().grpHideNone ? 'を外す' : 'も出す')) : '') + '</div>';
  }
  function isAll(gs, none) { var h = S().grpHide || {}; return !gs.some(function (g) { return h[g]; }) && !(none && S().grpHideNone); }
  function chipClick(k, g) {
    var St = S(), gs = groupsOf(), none = St.chars.some(function (c) { return !gl(c).length; }), h = St.grpHide || {}, all = isAll(gs, none);
    if (k === 'all') { St.grpHide = {}; St.grpHideNone = false; }
    else {
      var shown = Object.create(null), NONE = '\u0000none';
      if (!all) { gs.forEach(function (x) { if (!h[x]) shown[x] = 1; }); if (none && !St.grpHideNone) shown[NONE] = 1; }
      var key = k === 'none' ? NONE : g;
      if (shown[key]) delete shown[key]; else shown[key] = 1;
      St.grpHide = {}; St.grpHideNone = false;
      if (Object.keys(shown).length) { gs.forEach(function (x) { if (!shown[x]) St.grpHide[x] = 1; }); St.grpHideNone = !shown[NONE]; }
    }
    top(); redraw();
  }
  /* 今の並び：登録順／グループ順／名前順のどれに当たるか（どれでもなければ「手で並べ替え」） */
  function sortNow() {
    var C = S().chars, reg = true, grp = groupsOf().length > 0, nam = true;
    for (var i = 1; i < C.length && (reg || grp || nam); i++) {
      var a = C[i - 1], b = C[i];
      if (reg && (a.reg || 0) > (b.reg || 0)) reg = false;
      if (grp) { var ga = gl(a)[0] || '', gb = gl(b)[0] || ''; if (ga !== gb && (!ga || (gb && coll.compare(ga, gb) > 0))) grp = false; }
      if (nam && colN.compare(a.name || '', b.name || '') > 0) nam = false;
    }
    return reg ? 'reg' : grp ? 'grp' : nam ? 'name' : 'custom';
  }
  function sortSel() {
    var v = sortNow(), hasG = groupsOf().length > 0;
    var o = function (k, l, dis) { return '<option value="' + k + '"' + (v === k ? ' selected' : '') + (dis ? ' disabled' : '') + '>' + l + '</option>'; };
    return '<label class="ctsort"><span class="hint" style="margin:0">並び</span><select id="ctsort" aria-label="住人の並び" title="選ぶと、その順に並べ替えます（JSONの書き出しにもこの順番が入ります）">' +
      o('reg', '登録順') + (hasG ? o('grp', 'グループ順') : '') + o('name', '名前順') + (v === 'custom' ? o('custom', '手で並べ替え', true) : '') + '</select></label>';
  }
  function sortName() {
    var C = S().chars, idx = {};
    C.forEach(function (c, i) { idx[c.id] = i; });
    C.sort(function (a, b) { return colN.compare(a.name || '', b.name || '') || (idx[a.id] - idx[b.id]); });
    top(); redraw(); toast('名前順に並べました');
  }
  /* ツールバーの右端：すべて折りたたむ／すべて開く（ui-cast-pages.js の data-act） */
  function foldBtns() {
    return '<button type="button" class="btn small icon" data-act="cpfoldall" aria-label="すべて折りたたむ" title="すべて折りたたむ">' + FOLD + '</button>' +
      '<button type="button" class="btn small icon" data-act="cpopenall" aria-label="すべて開く" title="すべて開く">' + OPEN + '</button>';
  }
  /* グループ見出しの「仲間とみなす」（ui.js の data-act="grpcomrade"）と、右端のボタン */
  function grpTools(g) {
    var on = !!(S().grpComrade && S().grpComrade[g]), sn = scenName();
    return '<label class="cgsw" title="オンにしたグループの住人どうしは、信頼が育ちやすく、助け合い・庇い合い・弔い・一緒に動く出来事が起きます（恋愛や嫉妬には関わりません）。無人島・クラスメイトで「派閥の決め方：「仲間とみなす」グループで固定」にすると、このグループがそのまま派閥になります"><input type="checkbox" class="sw" data-act="grpcomrade" data-g="' + esc(g) + '"' + (on ? ' checked' : '') + ' aria-label="' + esc(g) + 'の住人どうしを仲間とみなす">仲間とみなす</label>' +
      '<span class="cgsp"></span><span class="cgact"><button type="button" class="btn small ghost" data-act="cgjoin" data-g="' + esc(g) + '" title="' + esc((sn ? '箱庭「' + sn + '」' : 'いま選んでいる箱庭') + 'の参加者に、' + g + 'の住人を加えます（入りきらないときは、' + g + 'の住人だけにします）') + '">このグループを箱庭に入れる</button>' +
      '<button type="button" class="btn small ghost" data-act="cgrename" data-g="' + esc(g) + '">名前を変更</button></span>';
  }
  /* グループの名前を変える */
  function rename(o) {
    var n = window.prompt('グループ「' + o + '」の新しい名前（20文字まで）', o);
    if (n == null) return;
    n = String(n).trim().slice(0, 20);
    if (!n || n === o) return;
    if (/[,，、]/.test(n)) { toast('グループの名前に読点（、）やカンマは使えません'); return; }
    var St = S(), mem2 = St.chars.filter(function (c) { return gl(c).indexOf(o) >= 0; }), next = {}, over = 0;
    mem2.forEach(function (c) {
      var l = []; gl(c).forEach(function (x) { x = x === o ? n : x; if (l.indexOf(x) < 0) l.push(x); });
      next[c.id] = l.join('、'); if (next[c.id].length > 40) over++;
    });
    if (over) { toast('グループの欄が40文字を超える住人がいるので、変えられませんでした（短い名前にしてください）'); return; }
    mem2.forEach(function (c) { c.group = next[c.id]; });
    [St.grpHide, St.grpComrade].forEach(function (m) { if (m && m[o]) { m[n] = 1; delete m[o]; } });
    if (St.randFrom === o) St.randFrom = n;
    if (HK.CastPages && HK.CastPages.renameGroup) HK.CastPages.renameGroup(o, n);
    /* 話題のグループ（ui-topics.js）も新しい名前に */
    if (HK.TopicsUI) HK.TopicsUI.renameGroup(o, n);
    redraw(); toast('グループ「' + o + '」を「' + n + '」にしました（' + mem2.length + '人）');
  }

  /* ---------- 「1 人追加 ▾」のメニュー ---------- */
  var menu = null, menuFrom = null, rs = '';
  function menuHtml() {
    var dis = full() ? ' disabled' : '';
    var it = function (act, label, title, extra) { return '<button type="button" role="menuitem" class="ctmi" data-act="' + act + '"' + dis + (title ? ' title="' + esc(title) + '"' : '') + '>' + label + (extra || '') + '</button>'; };
    return it('add', '1 人追加') +
      it('add10', '10 人追加', '名前とエゴグラムが仮の住人を、上限' + (P ? '（' + P.max + '人）' : '') + 'までの範囲で10人まとめて足します') +
      (HK.RandChar ? it('randadd', 'ランダムで 1 人追加', '名前・性別・エゴグラム・口調・年齢・職業・体格・身長・種族' + (HK.SAFE_ON ? '' : '・夜の性格') + 'を乱数で決めた住人を1人足します（足したあとで自由に直せます）') : '') +
      (P && P.sampleLeft && P.sampleLeft() ? it('addsample', 'サンプルの住人から足す', 'サンプルの住人（朝霧・鷹野 など）のうち、まだいない人を足します', '<span class="ctmn">' + P.sampleLeft() + ' 人</span>') : '') +
      (S().chars.length ? '<label class="ctmsel"><span>住人を複製する</span><select id="dupfrom" aria-label="複製する住人"' + dis + '><option value="">選ぶ…</option>' + S().chars.slice(0, 1000).map(function (c) { return '<option value="' + esc(c.id) + '">' + esc(c.name) + '</option>'; }).join('') + '</select></label>' : '') +
      '<hr>' + it('quiz', '質問に答えて診断して追加', '「ふたりのエゴグラム」と同じ25問に答えて、エゴグラムを出して住人にします', '<span class="ctmn">25 問</span>') +
      '<button type="button" role="menuitem" class="ctmi" data-ct="paste" title="「住人をまとめて登録」の欄へ移ります">名簿を貼り付けて取り込む</button>' +
      (HK.RandChar ? '<hr><label class="ctmsel"><span>追加時の名前（ランダムで足すとき）</span><select id="randstyle" data-f="randstyle" aria-label="ランダムで足す住人の名前の雰囲気">' +
        HK.RandChar.STYLES.map(function (o) { return '<option value="' + o[0] + '"' + (rs === o[0] ? ' selected' : '') + '>' + esc(String(o[1]).replace(/^名前：/, '')) + '</option>'; }).join('') + '</select></label>' : '');
  }
  function place() {
    if (!menu || menu.hidden || !menuFrom || !menuFrom.isConnected) return;
    var sp = menuFrom.closest('.csplit') || menuFrom, r = sp.getBoundingClientRect(), w = menu.offsetWidth, h = menu.offsetHeight;
    var vw = document.documentElement.clientWidth, vh = window.innerHeight;
    var left = Math.max(8, Math.min(r.right - w, vw - w - 8)), y = r.bottom + 4;
    if (y + h > vh - 8 && r.top - h - 4 > 8) y = r.top - h - 4;
    menu.style.left = (left + window.pageXOffset) + 'px'; menu.style.top = (y + window.pageYOffset) + 'px';
  }
  function openMenu(btn) {
    if (!menu) { menu = document.createElement('div'); menu.id = 'castaddmenu'; menu.className = 'ctmenu'; menu.setAttribute('role', 'menu'); menu.setAttribute('aria-label', '住人の足し方'); menu.hidden = true; document.body.appendChild(menu); }
    closeMenu();
    menu.innerHTML = menuHtml(); menu.hidden = false; menuFrom = btn;
    btn.setAttribute('aria-expanded', 'true');
    place();
    var f = menu.querySelector('.ctmi:not([disabled])'); if (f) f.focus();
  }
  function closeMenu(back) {
    if (!menu || menu.hidden) return;
    menu.hidden = true;
    if (menuFrom) { menuFrom.setAttribute('aria-expanded', 'false'); if (back && menuFrom.isConnected) menuFrom.focus(); }
    menuFrom = null;
  }
  /* 名簿を貼り付けて取り込む：上の「住人をまとめて登録」の欄へ（節を閉じていれば開く） */
  function toPaste() {
    if (HK.Shell && HK.Shell.pane() !== 'list') HK.Shell.setPane('list');
    var b = document.getElementById('bulk');
    if (!b) return;
    var d = b.closest('details'); if (d && !d.open) d.open = true;
    try { b.scrollIntoView({ block: 'center' }); } catch (e) { b.scrollIntoView(); }
    try { b.focus({ preventScroll: true }); } catch (e) { b.focus(); }
  }

  /* ---------- 「データ」ダイアログ ---------- */
  var TABS = [['all', 'まるごと<span class="ctdsub">（別の端末へ）</span>'], ['io', '名簿・JSON'], ['sf', '保存フォルダ']];
  var dlg = null, dTab = TABS.some(function (t) { return t[0] === mem.tab; }) ? mem.tab : 'all', dFrom = null;
  function attn() { var s = HK.SaveFolder && HK.SaveFolder.status ? HK.SaveFolder.status() : null; return !!(s && s.name && (s.st === 'perm' || s.st === 'hold' || s.st === 'err')); }
  function mark() {
    var a = attn();
    Array.prototype.forEach.call(document.querySelectorAll('[data-ct="data"]'), function (b) { b.classList.toggle('attn', a); b.title = a ? '保存フォルダの確認が要ります' : '書き出し・読み込み・別の端末へ・保存フォルダ'; });
  }
  function dlgEl() {
    if (dlg) return dlg;
    dlg = document.createElement('div');
    dlg.className = 'ctdov'; dlg.id = 'castdata'; dlg.hidden = true;
    dlg.innerHTML = '<div class="ctdbox" role="dialog" aria-modal="true" aria-labelledby="castdata-h" tabindex="-1">' +
      '<div class="ctdhd"><h2 id="castdata-h">データ</h2>' + (HK.Tips ? HK.Tips.btn('portable', 'データの書き出し・読み込み') : '') + '<span class="sp"></span><button type="button" class="btn small" data-ct="dclose">閉じる</button></div>' +
      '<div class="ctdtabs" role="tablist" aria-label="データの種類">' + TABS.map(function (t) { return '<button type="button" role="tab" id="cdt-' + t[0] + '" data-ct="dtab" data-k="' + t[0] + '" aria-controls="castdata-p">' + t[1] + '</button>'; }).join('') + '</div>' +
      '<div class="ctdbody"><div class="ctdp" id="castdata-p" role="tabpanel"></div>' +
      '<p class="ctdbk">念のため、キャラクター設定・セーブデータなどは定期的なバックアップをお願いいたします（「住人をJSONで書き出す」か「まるごと書き出し」でファイルに残せます）。</p></div></div>';
    document.body.appendChild(dlg);
    return dlg;
  }
  function panelHtml(k) {
    if (k === 'io') return HK.CastImport && HK.CastImport.ioHtml ? HK.CastImport.ioHtml(P && P.io ? P.io() : {}) : '';
    if (k === 'sf') return HK.SaveFolder ? HK.SaveFolder.html() : '<p class="hint">この版では使えません。</p>';
    return HK.Portable ? HK.Portable.html() : '';
  }
  function paint() {
    var d = dlgEl(), p = d.querySelector('#castdata-p'), box = d.querySelector('.ctdbox'), sc = d.querySelector('.ctdbody') || d, y = sc.scrollTop;
    TABS.forEach(function (t) { var b = d.querySelector('#cdt-' + t[0]); b.setAttribute('aria-selected', t[0] === dTab ? 'true' : 'false'); b.tabIndex = t[0] === dTab ? 0 : -1; });
    p.setAttribute('aria-labelledby', 'cdt-' + dTab);
    p.innerHTML = panelHtml(dTab);
    if (HK.CastPages && HK.CastPages.after) HK.CastPages.after(p);
    sc.scrollTop = y;
    return box;
  }
  function isOpen() { return !!(dlg && !dlg.hidden); }
  function openData(btn, tab) {
    closeMenu();
    var d = dlgEl();
    dFrom = btn || document.activeElement;
    dTab = tab || (attn() ? 'sf' : dTab);
    d.hidden = false;
    if (HK.Modal) HK.Modal.lock(d);
    paint();
    var t = d.querySelector('#cdt-' + dTab); if (t) t.focus();
  }
  function closeData() {
    if (!isOpen()) return;
    dlg.hidden = true;
    dlg.querySelector('#castdata-p').innerHTML = '';
    if (HK.Modal) HK.Modal.unlock(dlg);
    var f = dFrom && dFrom.isConnected ? dFrom : document.querySelector('[data-ct="data"]');
    if (f && f.focus) try { f.focus({ preventScroll: true }); } catch (e) { f.focus(); }
    dFrom = null;
  }
  function setTab(k, focus) {
    if (!TABS.some(function (t) { return t[0] === k; })) return;
    dTab = mem.tab = k; put(); paint();
    if (focus) { var t = dlg.querySelector('#cdt-' + k); if (t) t.focus(); }
  }
  function focusables(root) {
    return Array.prototype.filter.call(root.querySelectorAll('button,[href],input,select,textarea,[tabindex]:not([tabindex="-1"])'), function (e) { return !e.disabled && e.tabIndex >= 0 && e.type !== 'hidden' && !e.hidden && e.offsetParent !== null; });
  }

  /* ---------- 操作 ---------- */
  document.addEventListener('click', function (ev) {
    var t = ev.target && ev.target.closest ? ev.target.closest('[data-ct],[data-act]') : null;
    /* 見出し（summary の中）のボタン：押しても節を開け閉めしない */
    if (t && t.closest('.cthacts') && t.closest('summary')) ev.preventDefault();
    /* メニューの外を押したら閉じる。項目を押したら閉じる（項目の処理は ui.js がこのあとで行う） */
    if (menu && !menu.hidden) {
      var inMenu = menu.contains(ev.target);
      if (!inMenu || (t && t.classList.contains('ctmi'))) { if (!(t && t.getAttribute('data-ct') === 'addmenu' && t === menuFrom)) closeMenu(); }
    }
    if (isOpen() && ev.target === dlg) { closeData(); return; }
    if (!t) return;
    var ct = t.getAttribute('data-ct'), act = t.getAttribute('data-act');
    if (ct === 'addmenu') { if (menu && !menu.hidden && menuFrom === t) closeMenu(true); else openMenu(t); return; }
    if (ct === 'paste') { closeMenu(); toPaste(); return; }
    if (ct === 'data') { openData(t); return; }
    if (ct === 'dclose') { closeData(); return; }
    if (ct === 'dtab') { setTab(t.getAttribute('data-k'), true); return; }
    if (!P) return;
    if (act === 'cgchip') { chipClick(t.getAttribute('data-k'), t.getAttribute('data-g')); return; }
    if (act === 'cgrename') { rename(t.getAttribute('data-g')); return; }
    /* このグループを箱庭に入れる：ui.js の「参加に加える」（joingrpadd）。上限で入りきらなかったら「このグループだけ」（joingrp） */
    if (act === 'cgjoin') {
      var g = t.getAttribute('data-g');
      fire('joingrpadd', { g: g });
      var St = S(), ids = (St.join && St.join[St.scenId]) || [];
      if (St.chars.some(function (c) { return gl(c).indexOf(g) >= 0 && ids.indexOf(c.id) < 0; })) fire('joingrp', { g: g });
      return;
    }
    /* ダイアログの「名簿を置き換える」：「住人をまとめて登録」の欄が空なら、その欄へ案内する（ui.js の処理は止める） */
    if (act === 'import-replace' && isOpen()) {
      var b = document.getElementById('bulk');
      if (b && !b.value.trim()) { ev.stopImmediatePropagation(); closeData(); toPaste(); toast('「住人をまとめて登録」の欄に名簿を貼ってから押してください'); }
    }
  });
  document.addEventListener('change', function (ev) {
    var t = ev.target;
    if (!t || !P) return;
    if (t.id === 'ctsort') {
      var v = t.value;
      if (v === 'reg') fire('sortreg'); else if (v === 'grp') fire('sortgrp'); else if (v === 'name') sortName();
    } else if (t.id === 'randstyle') rs = t.value;
    /* 「＋住人を追加 ▾」の「住人を複製する」：選んだ住人を複製（ui.js の行の「複製する」と同じ） */
    else if (t.id === 'dupfrom' && t.value) { var v2 = t.value; closeMenu(); if (P.dup) P.dup(v2); }
  });
  document.addEventListener('keydown', function (ev) {
    if (menu && !menu.hidden) {
      if (ev.key === 'Escape') { ev.preventDefault(); closeMenu(true); return; }
      if ((ev.key === 'ArrowDown' || ev.key === 'ArrowUp') && menu.contains(document.activeElement)) {
        var its = Array.prototype.filter.call(menu.querySelectorAll('.ctmi,select'), function (e) { return !e.disabled; }), i = its.indexOf(document.activeElement);
        if (document.activeElement.tagName === 'SELECT') return;
        ev.preventDefault(); var nx = its[(i + (ev.key === 'ArrowDown' ? 1 : its.length - 1)) % its.length]; if (nx) nx.focus(); return;
      }
      if (ev.key === 'Tab' && menu.contains(document.activeElement)) { closeMenu(); return; }
    }
    if (!isOpen()) return;
    if (ev.key === 'Escape') { ev.preventDefault(); closeData(); return; }
    var tb = ev.target && ev.target.getAttribute && ev.target.getAttribute('data-ct') === 'dtab';
    if (tb && (ev.key === 'ArrowRight' || ev.key === 'ArrowLeft')) {
      var ks = TABS.map(function (x) { return x[0]; }), j = ks.indexOf(dTab);
      ev.preventDefault(); setTab(ks[(j + (ev.key === 'ArrowRight' ? 1 : ks.length - 1)) % ks.length], true); return;
    }
    if (ev.key === 'Tab') {
      var fs = focusables(dlg.querySelector('.ctdbox'));
      if (!fs.length) return;
      if (ev.shiftKey && document.activeElement === fs[0]) { ev.preventDefault(); fs[fs.length - 1].focus(); }
      else if (!ev.shiftKey && document.activeElement === fs[fs.length - 1]) { ev.preventDefault(); fs[0].focus(); }
      else if (!dlg.contains(document.activeElement)) { ev.preventDefault(); fs[0].focus(); }
    }
  });
  window.addEventListener('resize', function () { place(); });

  HK.CastTools = {
    /* ui.js から：S（住人の状態を返す関数）・max（上限）・io（「名簿・JSON」の欄に渡す { jp, pick }） */
    bind: function (ctx) { P = ctx; },
    head: head, bottom: bottom, actions: actions, split: split, chips: chips, sortSel: sortSel, foldBtns: foldBtns, grpTools: grpTools, mark: mark,
    /* 住人タブを描き直したあと（ui.js の renderCast）：ダイアログを開いていれば中身を描き直す。メニューの位置も合わせる */
    after: function () { mark(); if (isOpen()) paint(); place(); },
    /* ダイアログの中身だけを描き直す（開いていなければ false：呼んだ側が住人タブを描き直す） */
    refresh: function () { if (!isOpen()) return false; paint(); return true; },
    open: openData, close: closeData, isOpen: isOpen, sortNow: sortNow
  };
})();
