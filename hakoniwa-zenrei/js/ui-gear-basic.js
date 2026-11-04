/* 箱庭シミュレーター ui: 住人の設定の窓の節「グループ・メモ」（2026-11-04。結果には影響しない）
   利用者の報告「スマホ版でグループを設定する方法がない」への対処。スマホ幅（599px 以下）では、住人の行のグループ・タグ・メモ・
   エゴグラムの数値（0〜20）の欄を出していない（index.html の @media (max-width: 599px)）ので、同じことを住人の設定の窓でもできるようにする。
   PC でも同じ節を出す（行の欄と同じ値を書き換えるだけ：c.name・c.group・c.tags・c.memo・c.eg）。
   ・ui-gear.js が HK.GearBasic.sec(c) で節を足し、HK.GearBasic.field（入力）・act（ボタン）を先に呼ぶ。住人の行の「⋯」の「グループ・メモ・エゴグラム」から
     この節を開く（data-act="gearbasic"。ui-gear.js）
   ・グループ：今あるグループの札を押すと入る／外れる（複数可）。新しいグループは欄に書く（読点・カンマ区切り）。iOS でも datalist の候補が出る
   ・late に置く（読み終えるまでは節を出さない。読み終えたら HK.onLate で窓を描き直す必要はない：窓は開くたびに描く） */
(function () {
  'use strict';
  var HK = window.HK;
  if (!HK || !HK.UI || typeof document === 'undefined') return;
  var UI = HK.UI, esc = HK.escape;
  function S() { return UI.state(); }
  function grps(c) { return HK.groupList ? HK.groupList(c).slice() : String((c && c.group) || '').split(/[,，、]/).map(function (x) { return x.trim(); }).filter(Boolean); }
  function allGroups() { var g = [], seen = Object.create(null); S().chars.forEach(function (c) { grps(c).forEach(function (x) { if (!seen[x]) { seen[x] = 1; g.push(x); } }); }); return g; }
  var css = '.gearov .gbgrp{display:flex;flex-wrap:wrap;gap:6px;margin:0 0 12px}' +
    '.gearov .gbgrp button{appearance:none;-webkit-appearance:none;border:1px solid var(--ui-line2,var(--line));background:var(--ui-card,var(--paper));color:var(--ui-ink,var(--ink));border-radius:999px;padding:0 14px;min-height:36px;font:inherit;font-size:13px;cursor:pointer}' +
    '.gearov .gbgrp button[aria-pressed="true"]{background:var(--ui-ink,var(--ink));color:var(--ui-card,var(--paper));border-color:var(--ui-ink,var(--ink))}' +
    '.gearov .gbego{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:8px;margin:0 0 8px}' +
    '.gearov .gbego label{display:flex;flex-direction:column;gap:4px;font-size:12px;font-weight:700;text-align:center}' +
    '.gearov .gbego input{width:100%;min-height:42px;text-align:center;font-size:16px}' +
    '.gearov .gbh{margin:8px 0 8px;font-size:13px}.gearov .gbego small{font-weight:400;color:var(--ui-muted,var(--muted));font-size:10.5px;line-height:1.3}';
  var st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);

  function sec(c) {
    var mine = grps(c), all = allGroups(), F = HK.FACTORS || ['CP', 'NP', 'A', 'FC', 'AC'], FULL = HK.FACTOR_FULL || {};
    var chips = all.length ? '<div class="gbgrp" role="group" aria-label="グループに入れる・外す">' + all.map(function (g) {
      var on = mine.indexOf(g) >= 0;
      return '<button type="button" data-gact="bgrp" data-g="' + esc(g) + '" aria-pressed="' + on + '" title="' + esc(g) + (on ? 'から外す' : 'に入れる') + '">' + (on ? '✓ ' : '＋ ') + esc(g) + '</button>';
    }).join('') + '</div>' : '';
    var html =
      '<div class="gearrow"><label>名前 <input type="text" data-gf="bname" value="' + esc(c.name) + '" maxlength="24" autocomplete="off"></label>' +
      '<label>グループ <input type="text" data-gf="bgroup" value="' + esc(c.group || '') + '" maxlength="40" list="gbgrplist" placeholder="例：生徒会、2年A組" autocomplete="off"></label>' +
      '<p class="gearhint">同じグループの住人は、箱庭タブでまとめて参加させたり、住人の一覧で絞り込んだり、関係を「グループの全員と」付けたりできます。読点（、）かカンマで区切ると複数のグループに入れられます' + (all.length ? '。下の札を押しても入れる・外すができます' : '') + '。</p></div>' +
      chips + '<datalist id="gbgrplist">' + all.map(function (g) { return '<option value="' + esc(g) + '">'; }).join('') + '</datalist>' +
      '<div class="gearrow"><label>タグ <input type="text" data-gf="btags" value="' + esc(c.tags || '') + '" maxlength="80" placeholder="例：主人公、敵役" autocomplete="off"></label>' +
      '<label>メモ <input type="text" data-gf="bmemo" value="' + esc(c.memo || '') + '" maxlength="80" placeholder="任意・結果には影響しません" autocomplete="off"></label></div>' +
      '<h4 class="gbh">エゴグラム（0〜20）</h4><div class="gbego">' + F.map(function (k) {
        return '<label>' + esc(k) + '<input type="number" inputmode="numeric" min="0" max="20" step="1" data-gf="beg" data-k="' + k + '" value="' + esc(String(c.eg[k])) + '" aria-label="' + esc(FULL[k] || k) + '（0〜20）"><small>' + esc(String(FULL[k] || '').replace(/（.*$/, '')) + '</small></label>';
      }).join('') + '</div><p class="gearhint">5文字コード（' + esc(HK.toCode(c.eg)) + '）より細かく決められます。行動の判断はこの数値で決まります。</p>';
    return { k: 'basic', name: 'グループ・メモ', tip: '', desc: '名前・グループ・タグ・メモと、エゴグラムの数値です。', set: !!(c.group || c.tags || c.memo),
      sum: [mine.join('・'), c.memo ? 'メモあり' : ''].filter(Boolean).join('・'), html: html };
  }
  function setGroups(c, list) { c.group = list.join('、').slice(0, 40); }
  function syncTopics() { if (HK.TopicsUI && HK.TopicsUI.syncSave) HK.TopicsUI.syncSave(); }
  /* 入力（true を返したら ui-gear.js はほかの処理をしない）。打っているあいだ（input）は保存だけ、確定（change）で窓を描き直す */
  function field(c, f, t, ev, changed) {
    var fin = ev.type === 'change', s = S();
    switch (f) {
      case 'bname': c.name = t.value.trim() || '名無し'; s.sample = false; changed(fin); return true;
      case 'btags': c.tags = t.value.trim().slice(0, 80); changed(false); return true;
      case 'bmemo': c.memo = t.value.slice(0, 80); changed(false); return true;
      case 'bgroup': c.group = t.value.trim().slice(0, 40); changed(fin); if (fin) syncTopics(); return true;
      case 'beg': {
        var v = parseFloat(t.value);
        if (isNaN(v)) return true;
        c.eg[t.dataset.k] = HK.clamp ? HK.clamp(Math.round(v), 0, 20) : Math.max(0, Math.min(20, Math.round(v)));
        s.sample = false; changed(fin); return true;
      }
    }
    return false;
  }
  function act(c, a, b, changed) {
    if (a !== 'bgrp') return false;
    var g = b.dataset.g, list = grps(c), i = list.indexOf(g);
    if (i >= 0) list.splice(i, 1); else list.push(g);
    setGroups(c, list);
    changed(true); syncTopics();
    if (UI.toast) UI.toast(c.name + 'を「' + g + '」' + (i >= 0 ? 'から外しました' : 'に入れました'));
    return true;
  }
  HK.GearBasic = { sec: sec, field: field, act: act };
})();
