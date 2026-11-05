/* 箱庭シミュレーター（R18版のみ）: ソロ型の箱庭の、受け攻めから見た開始前の注意（2026-11-05 担当SW。表は docs/reports/2026-11-05/solo-pos-warnings.md）
   利用者の指示「ソロ型の箱庭に、攻めを投入するとどうなるのか（ソロで入れた場合・複数で入れた場合に何が起きるか）を開始前に警告し、成立しない配役は開始不可にする」への対応。
   ■ HK.SoloWarn.add(箱庭の id, warn)：warn(input, T) → [{ level: 'block'|'warn', text }]。input は箱庭タブの HK.UI.buildInput と同じ形（動かすときの入力）、
     T は判定の道具（T.C＝番号 i を付けた住人の写し、T.top(c)＝モブ・罠・魔物の相手に攻めに回る人（HK.Pos.hardTopNpc）、T.hard(c, o)＝相手 o に自分で攻めを選んだ人、
     T.ok(a, b)＝体の関係になれる組（HK.Pos.okSex）、T.pick(i, 欄)＝住人ごとの欄の値、T.nm(並び)＝名前を「と」「・」でつなぐ、T.env＝環境値）。
   ■ 出し方は電車（solo-train.js）の注意と同じ：参加者の欄の下（joinNote）に「※このままでは始められません：…」（block）と「注意：…」（warn）、
     「場の設定」の頭（envHead）に始められない理由だけ。「箱庭を動かす」を押したときは scen.check（HK.wrap で包む。元の check が先）が block の文を返し、ui.js が知らせて止める。
     参加者・住人ごとの欄・場の設定を変えたら書き直す（ui.js は参加の印・住人ごとの欄では箱庭タブを描き直さないので、change を見張る。saimin-note.js と同じ見張り方）。
   ■ 全年齢モード（HK.SAFE_ON）では何も出さない（受け攻めの性的な扱いの注意のため）。中核には入れない（@pack:sim。箱庭のかたまりより先に届く）。
   結果は変えない（注意を出すだけ。block の配役は動かさない） */
/* @event-ok 開始前の注意の仕組み（新しい出来事は無い） */
(function () {
  'use strict';
  var HK = window.HK;
  if (!HK) return;
  var SW = HK.SoloWarn = HK.SoloWarn || { list: {} };
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function tools(input) {
    var P = HK.Pos, chars = (input && input.chars) || [], pc = (input && input.perChar) || [];
    var C = chars.map(function (c, i) { var o = Object.assign({}, c); o.i = i; return o; });
    return {
      C: C, env: (input && input.env) || {}, input: input,
      top: function (c) { return !!(P && P.hardTopNpc && P.hardTopNpc(c)); },
      hard: function (c, o) { return !!(P && P.hardTop && P.hardTop(c, o)); },
      ok: function (a, b) { return !P || !P.okSex || P.okSex(a, b); },
      pick: function (i, k) { var x = pc[i] && pc[i].pick; return (x && x[k]) || ''; },
      nm: function (l) { return l.map(function (c) { return c.name; }).join(l.length > 2 ? '・' : 'と'); }
    };
  }
  /* その箱庭の注意（全年齢モード・登録の無い箱庭は空） */
  SW.of = function (id, input) {
    var f = SW.list[id];
    if (!f || HK.SAFE_ON || !input || !(input.chars || []).length) return [];
    try { return (f(input, tools(input)) || []).filter(function (x) { return x && x.text; }); }
    catch (e) { if (typeof console !== 'undefined') console.error('開始前の注意：' + id, e); return []; }
  };
  /* 始められない理由（無ければ ''） */
  SW.block = function (id, input) {
    var b = SW.of(id, input).filter(function (x) { return x.level === 'block'; });
    return b.length ? b.map(function (x) { return x.text; }).join('／') : '';
  };
  /* 箱庭タブの表示（head＝「場の設定」の頭：始められない理由だけ） */
  SW.html = function (id, input, head) {
    var L = SW.of(id, input), h = '';
    L.filter(function (x) { return x.level === 'block'; }).forEach(function (x) { h += '<p class="hint" role="alert" style="margin-top:6px;color:var(--warn,#b45309);font-weight:600">※このままでは始められません：' + esc(x.text) + '</p>'; });
    if (!head) L.filter(function (x) { return x.level !== 'block'; }).forEach(function (x) { h += '<p class="hint" style="margin-top:6px;color:var(--warn,#b45309)">注意：' + esc(x.text) + '</p>'; });
    return '<div id="' + (head ? 'swnote2' : 'swnote') + '" aria-live="polite">' + h + '</div>';
  };
  function nowInput() { var UI = HK.UI; try { return UI && UI.buildInput ? UI.buildInput(0) : null; } catch (e) { return null; } }
  function curId() { var UI = HK.UI, S = UI && UI.state ? UI.state() : null; return S && S.scenId; }
  function redraw() {
    if (typeof document === 'undefined') return;
    var id = curId(), a = document.getElementById('swnote'), b = document.getElementById('swnote2');
    if (!id || !SW.list[id] || !(a || b)) return;
    var inp = nowInput();
    if (a) a.outerHTML = SW.html(id, inp, false);
    if (b) b.outerHTML = SW.html(id, inp, true);
  }
  SW.redraw = redraw;
  /* 登録：箱庭タブの差し込み（HK.ScenUI）に足し、始める前の検査（scen.check）を包む。箱庭の本体（HK.SCENARIOS[id]）を登録したあとに呼ぶ */
  SW.add = function (id, f) {
    if (!id || typeof f !== 'function') return;
    SW.list[id] = f;
    /* 箱庭タブの差し込み（ui.js の HK.ScenUI。ui.js より先に読まれても、ui.js は同じ表をそのまま使う） */
    var SUI = HK.ScenUI = HK.ScenUI || { list: {} }, old = SUI.list[id];
    SUI.list[id] = {
      joinNote: function (S0) { return (old && old.joinNote ? old.joinNote(S0) || '' : '') + SW.html(id, nowInput(), false); },
      envHead: function (S0, env) { return (old && old.envHead ? old.envHead(S0, env) || '' : '') + SW.html(id, nowInput(), true); },
      envChange: function (S0, env) { if (old && old.envChange) old.envChange(S0, env); redraw(); }
    };
    var sc = HK.SCENARIOS && HK.SCENARIOS[id];
    if (sc && HK.wrap) HK.wrap(sc, 'check', function (prev) {
      return function (input) {
        var w = typeof prev === 'function' ? prev.call(this, input) : '';
        if (w) return w;
        var b = SW.block(id, input);
        return b ? (sc.name || id) + '：' + b : '';
      };
    });
  };
  /* 参加の印・住人ごとの欄を変えたら書き直す（ui.js が状態を書き換えたあとに） */
  if (typeof document !== 'undefined' && document.addEventListener && !SW._watch) {
    SW._watch = 1;
    var tm = 0;
    document.addEventListener('change', function () { clearTimeout(tm); tm = setTimeout(redraw, 0); });
  }
})();
