/* 箱庭シミュレーター ui: 住人タブ「話題」の節（2026-11-01 担当TA）
   ・利用者が登録した語（S.topics。1件の形と整え方は topics.js の HK.Topics）を、範囲ごとの見出しでまとめて描く。行の中で種類・語・補足を直接直せる
     範囲：全体／箱庭ごと（箱庭タブと同じ名前・同じ絞り方の HK.SCEN_ORDER）／グループ（住人のグループ名。自由入力も可）／住人／住人どうし（順不同）
   ・追加の行（範囲→対象→種類→語→補足→追加）と、一括入力（1行1件『範囲｜種類｜語｜補足』）。件数が多いとき（30件超）は範囲ごとに折りたたむ
     （開いた見出しは表示用の保存 hakoniwa:topicfold。全年齢版は hakoniwa-z:topicfold）
   ・住人が消えたら、その人の話題（住人・住人どうし）を消す。グループの名前を変えたら追随し、グループが無くなったら、そのグループの話題を消す（sync）
   ui.js の renderCast が HK.TopicsUI.html() を「口調・喘ぎの設定」と「住人どうしの既存の関係」のあいだに置き、欄の入力（data-f="topic"）と
   ボタン（data-act="tp:…"）をここへ回す。⚙設定（ui-gear.js）の「相手ごとの設定」に件数と「話題の節へ」（gearHtml・open）。
   住人の JSON の書き出し・読み込み（ui.js の rosterJSON・importJSON）は exportTo・importFrom で話題も運ぶ。HTML に入れる語は必ず HK.escape で逃がす */
(function () {
  'use strict';
  var HK = window.HK;
  if (!HK || !HK.Topics) return;
  var T = HK.Topics, esc = HK.escape;
  function UI() { return HK.UI; }
  function S() { return HK.UI.state(); }
  function list() { var s = S(); if (!Array.isArray(s.topics)) s.topics = []; return s.topics; }
  function gl(c) { return c && HK.groupList ? HK.groupList(c) : []; }
  var FOLD_MIN = 30;

  (function () {
    if (typeof document === 'undefined' || !document.head) return;
    var css =
      '.tpbox{min-width:0}' +
      /* 追加の行：範囲・対象・種類・語・補足・追加。狭い画面では折り返す */
      '.tpbox .tpnew{display:flex;flex-wrap:wrap;gap:6px 8px;align-items:center;padding:8px 10px;border:1px solid var(--line);border-radius:var(--r,4px);min-width:0}' +
      '.tpbox .tpnew select,.tpbox .tpnew input{min-width:0;max-width:100%}' +
      '.tpbox .tpnew .tpsc{flex:0 1 8.5em}.tpbox .tpnew .tpk{flex:0 1 8em}' +
      '.tpbox .tpnew .tptg{display:flex;flex-wrap:wrap;gap:6px;align-items:center;flex:1 1 12em;min-width:0}.tpbox .tpnew .tptg:empty{display:none}' +
      '.tpbox .tpnew .tptg select,.tpbox .tpnew .tptg input{flex:1 1 7em}.tpbox .tpnew .tptg .tpand{flex:0 0 auto;font-size:13px;color:var(--muted)}' +
      '.tpbox .tpnew .tpw{flex:1 1 9em}.tpbox .tpnew .tpn{flex:2 1 12em}' +
      '.tpbox .tpnew .tpall{font-size:13px;color:var(--muted)}' +
      '@media (max-width:599px){.tpbox .tpnew .tpsc,.tpbox .tpnew .tpk{flex:1 1 40%}.tpbox .tpnew .tptg{flex-basis:100%}.tpbox .tpnew .tpw,.tpbox .tpnew .tpn{flex:1 1 100%}.tpbox .tpnew .btn{flex:1 1 100%}}' +
      /* 登録済みの行：種類｜語｜補足｜削除。スマホ幅は「種類 語 削除」「補足」の2段 */
      '.tpbox .tplist{margin-top:10px;min-width:0}' +
      '.tpbox .tpg{margin:10px 0 0;min-width:0}.tpbox .tpg:first-child{margin-top:0}' +
      '.tpbox .tpgh,.tpbox details.tpg>summary{display:flex;flex-wrap:wrap;gap:2px 10px;align-items:baseline;padding:5px 12px;border-left:2px solid var(--ink);background:var(--bg1,var(--accent-soft));border-radius:0 4px 4px 0;font-weight:700;overflow-wrap:anywhere}' +
      '.tpbox details.tpg>summary{cursor:pointer;list-style:none}.tpbox details.tpg>summary::-webkit-details-marker{display:none}' +
      '.tpbox details.tpg>summary:before{content:"▸";font-weight:400;margin-right:-4px}.tpbox details.tpg[open]>summary:before{content:"▾"}' +
      '.tpbox .tpgc{font-weight:400;font-size:12.5px;color:var(--muted)}.tpbox .tpgo{font-weight:400;font-size:12px;color:var(--warn)}' +
      '.tpbox .tprow{display:grid;grid-template-columns:minmax(6.5em,auto) minmax(0,1fr) auto;grid-template-areas:"k w d" "n n n";gap:4px 6px;align-items:center;padding:6px 0;border-bottom:1px solid var(--line);min-width:0}' +
      '.tpbox .tprow:last-child{border-bottom:0}' +
      '.tpbox .tprow select,.tpbox .tprow input{min-width:0;width:100%;max-width:100%}' +
      '.tpbox .tprow .tpk{grid-area:k}.tpbox .tprow .tpw{grid-area:w}.tpbox .tprow .tpn{grid-area:n}.tpbox .tprow .tpd{grid-area:d;justify-self:end}' +
      '@media (min-width:600px){.tpbox .tprow{grid-template-columns:minmax(7em,9em) minmax(0,1fr) minmax(0,1.5fr) auto;grid-template-areas:"k w n d"}}' +
      /* 一括入力 */
      '.tpbox .tpbulk{margin-top:12px;min-width:0}.tpbox .tpbulk textarea{width:100%;max-width:100%;box-sizing:border-box}' +
      '.tpbox .tpbn{font-size:12.5px;color:var(--muted)}' +
      '.gearhint.gtopic{font-size:12px;display:flex;flex-wrap:wrap;gap:4px 10px;align-items:center;margin:2px 0 8px}';
    var st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);
  })();

  /* ---------- 表示用の保存（件数が多いときに開いている見出し） ---------- */
  var FOLD = (function () { var v = null; try { v = HK.store ? HK.store.get('topicfold', null) : null; } catch (e) { v = null; } return v && typeof v === 'object' && !Array.isArray(v) ? v : {}; })();
  function keepFold() { try { if (HK.store) HK.store.set('topicfold', FOLD); } catch (e) { /* 保存できなくても表示は変えられる */ } }

  /* ---------- 住人・グループ・箱庭の引き方 ---------- */
  function byId() { var m = Object.create(null); S().chars.forEach(function (c) { m[c.id] = c; }); return m; }
  function groups() { var g = [], seen = Object.create(null); S().chars.forEach(function (c) { gl(c).forEach(function (x) { if (!seen[x]) { seen[x] = 1; g.push(x); } }); }); return g; }
  function scenOf(id) { return (HK.SCENARIOS && HK.SCENARIOS[id]) || (HK.Load && HK.Load.info ? HK.Load.info(id) : null); }
  /* 箱庭タブと同じ並び（R18版では、ダンジョンRPGと人狼をゾンビの街のすぐ後ろ。ui.js の renderBox） */
  function scenIds() {
    var order = (HK.SCEN_ORDER || []).filter(function (x, i, arr) { return arr.indexOf(x) === i && !!scenOf(x); });
    if (!HK.SAFE_ON && order.indexOf('zombie') >= 0) {
      var mv = ['rpg', 'jinro'].filter(function (x) { return order.indexOf(x) >= 0; });
      order = order.filter(function (x) { return mv.indexOf(x) < 0; });
      order.splice.apply(order, [order.indexOf('zombie') + 1, 0].concat(mv));
    }
    return order;
  }
  function scenName(id) { var s = scenOf(id); return s && s.name ? String(s.name) : ''; }
  function opt(v, label, sel) { return '<option value="' + esc(v) + '"' + (v === sel ? ' selected' : '') + '>' + esc(label) + '</option>'; }
  function kindOpts(sel) { return T.KINDS.map(function (k) { return opt(k[0], k[1], sel); }).join(''); }
  function charOpts(sel, skip) { return S().chars.filter(function (c) { return c.id !== skip; }).map(function (c) { return opt(c.id, c.name, sel); }).join(''); }
  function newId() {
    var have = Object.create(null); list().forEach(function (t) { have[t.id] = 1; });
    var id; do { id = 'tp' + Math.random().toString(36).slice(2, 9); } while (have[id]);
    return id;
  }
  /* 同じ範囲・対象・語の話題（住人どうしは順不同） */
  function sameKey(t) { var a = t.a, b = t.b; if (t.scope === 'pair' && a > b) { var x = a; a = b; b = x; } return [t.scope, t.scen, t.group, a, b, t.word].join('\u0001'); }
  function hasSame(t, skip) { var k = sameKey(t); return list().some(function (x) { return x !== skip && sameKey(x) === k; }); }

  /* ---------- 範囲ごとの見出し ---------- */
  function secOf(t, by, G) {
    if (t.scope === 'all') return { key: 'all', o: 0, name: '全体' };
    if (t.scope === 'scen') { var ids = scenIds(), i = ids.indexOf(t.scen), nm = scenName(t.scen); return { key: 's:' + t.scen, o: 1e6 + (i >= 0 ? i : 9999), name: '箱庭「' + (nm || 'この画面では出ない箱庭') + '」', off: i < 0 ? 'この画面では出ない箱庭です' : '' }; }
    if (t.scope === 'group') { var gi = G.indexOf(t.group); return { key: 'g:' + t.group, o: 2e6 + (gi >= 0 ? gi : 9999), name: 'グループ「' + t.group + '」', off: gi < 0 ? '今このグループの住人はいません' : '' }; }
    var C = S().chars, ia = C.indexOf(by[t.a]), ib = C.indexOf(by[t.b]);
    if (t.scope === 'char') return { key: 'c:' + t.a, o: 3e6 + ia, name: (by[t.a] || {}).name || '' };
    var lo = Math.min(ia, ib), hi = Math.max(ia, ib), A = C[lo], B = C[hi];
    return { key: 'p:' + (A ? A.id : '') + '\u0001' + (B ? B.id : ''), o: 4e6 + lo * 1000 + hi, name: (A ? A.name : '') + ' と ' + (B ? B.name : '') };
  }
  function rowHtml(t) {
    var id = esc(t.id), w = esc(t.word);
    return '<div class="tprow" data-tid="' + id + '">' +
      '<select class="tpk" data-f="topic" data-p="kind" data-tid="' + id + '" aria-label="「' + w + '」の種類">' + kindOpts(t.kind) + '</select>' +
      '<input type="text" class="tpw" data-f="topic" data-p="word" data-tid="' + id + '" value="' + w + '" maxlength="' + T.WORD_LEN + '" aria-label="語">' +
      '<input type="text" class="tpn" data-f="topic" data-p="note" data-tid="' + id + '" value="' + esc(t.note) + '" maxlength="' + T.NOTE_LEN + '" placeholder="補足（任意）" aria-label="「' + w + '」の補足">' +
      '<button type="button" class="btn ghost small tpd" data-act="tp:del" data-tid="' + id + '" aria-label="「' + w + '」を削除">削除</button></div>';
  }
  function listHtml() {
    var L = list();
    if (!L.length) return '<p class="hint" style="margin:0">まだ話題は登録されていません。</p>';
    var by = byId(), G = groups(), secs = Object.create(null), order = [];
    L.forEach(function (t, i) {
      var s = secOf(t, by, G);
      if (!secs[s.key]) { secs[s.key] = { s: s, rows: [] }; order.push(s.key); }
      secs[s.key].rows.push(t);
    });
    order.sort(function (a, b) { return (secs[a].s.o - secs[b].s.o) || (a < b ? -1 : a > b ? 1 : 0); });
    var many = L.length > FOLD_MIN;
    return order.map(function (k) {
      var x = secs[k], s = x.s, head = '<span class="tpgn">' + esc(s.name) + '</span><span class="tpgc">' + x.rows.length + '件</span>' + (s.off ? '<span class="tpgo">' + esc(s.off) + '</span>' : '');
      var rows = x.rows.map(rowHtml).join('');
      if (!many) return '<div class="tpg"><div class="tpgh">' + head + '</div>' + rows + '</div>';
      return '<details class="tpg" data-g="' + esc(k) + '"' + (FOLD[k] ? ' open' : '') + '><summary>' + head + '</summary>' + rows + '</details>';
    }).join('');
  }

  /* ---------- 追加の行（このページを開いているあいだだけ覚える） ---------- */
  var NEW = { scope: 'all', scen: '', group: '', gfree: false, a: '', b: '', kind: 'food', word: '', note: '' };
  function fixNew() {
    var C = S().chars, ids = Object.create(null), sc = scenIds(), G = groups();
    C.forEach(function (c) { ids[c.id] = 1; });
    if (sc.indexOf(NEW.scen) < 0) NEW.scen = sc.indexOf(S().scenId) >= 0 ? S().scenId : (sc[0] || '');
    if (!NEW.gfree && G.indexOf(NEW.group) < 0) NEW.group = G[0] || '';
    if (!G.length) NEW.gfree = true;
    if (!ids[NEW.a]) NEW.a = C[0] ? C[0].id : '';
    if (!ids[NEW.b] || NEW.b === NEW.a) { var o = C.filter(function (c) { return c.id !== NEW.a; })[0]; NEW.b = o ? o.id : ''; }
    if (NEW.scope === 'char' && !C.length) NEW.scope = 'all';
    if (NEW.scope === 'pair' && C.length < 2) NEW.scope = 'all';
  }
  function targetHtml() {
    var sc = NEW.scope;
    if (sc === 'all') return '<span class="tpall">全員・全部の箱庭</span>';
    if (sc === 'scen') return '<select data-f="topic" data-p="nscen" aria-label="箱庭">' + scenIds().map(function (id) { return opt(id, scenName(id), NEW.scen); }).join('') + '</select>';
    if (sc === 'group') {
      var G = groups();
      return (G.length ? '<select data-f="topic" data-p="ngsel" aria-label="グループ">' + G.map(function (g) { return opt(g, g, NEW.gfree ? '' : NEW.group); }).join('') + opt('\u0001', 'ほかの名前を入力…', NEW.gfree ? '\u0001' : '') + '</select>' : '') +
        (NEW.gfree ? '<input type="text" data-f="topic" data-p="ngroup" value="' + esc(NEW.group) + '" maxlength="40" placeholder="グループ名" aria-label="グループ名">' : '');
    }
    if (sc === 'char') return '<select data-f="topic" data-p="na" aria-label="住人">' + charOpts(NEW.a) + '</select>';
    return '<select data-f="topic" data-p="na" aria-label="一人目">' + charOpts(NEW.a) + '</select><span class="tpand">と</span><select data-f="topic" data-p="nb" aria-label="二人目">' + charOpts(NEW.b, NEW.a) + '</select>';
  }
  function newHtml() {
    fixNew();
    var n = S().chars.length, full = list().length >= T.MAX;
    var scs = T.SCOPES.map(function (x) { return '<option value="' + x[0] + '"' + (x[0] === NEW.scope ? ' selected' : '') + ((x[0] === 'char' && !n) || (x[0] === 'pair' && n < 2) ? ' disabled' : '') + '>' + esc(x[1]) + '</option>'; }).join('');
    return '<div class="tpnew" id="tpnew">' +
      '<select class="tpsc" data-f="topic" data-p="nscope" aria-label="範囲">' + scs + '</select>' +
      '<span class="tptg" id="tptg">' + targetHtml() + '</span>' +
      '<select class="tpk" data-f="topic" data-p="nkind" aria-label="種類">' + kindOpts(NEW.kind) + '</select>' +
      '<input type="text" class="tpw" id="tpword" data-f="topic" data-p="nword" value="' + esc(NEW.word) + '" maxlength="' + T.WORD_LEN + '" placeholder="語（例：ラーメン）" aria-label="語">' +
      '<input type="text" class="tpn" data-f="topic" data-p="nnote" value="' + esc(NEW.note) + '" maxlength="' + T.NOTE_LEN + '" placeholder="補足（任意）" aria-label="補足">' +
      '<button type="button" class="btn" data-act="tp:add"' + (full ? ' disabled' : '') + '>追加</button></div>' +
      (full ? '<p class="hint" style="color:var(--warn);margin:4px 0 0">話題は' + T.MAX + '件までです。追加するには、どれかを削除してください。</p>' : '');
  }

  /* ---------- 節 ---------- */
  var BULK_PH = '全体｜食べ物｜ラーメン｜駅前の店の味噌ラーメン\n箱庭:出られない部屋｜物｜鍵\nグループ:3年A組｜こと｜文化祭\n朝霧｜趣味｜猫\n朝霧×鷹野｜作品｜同じ映画';
  /* 見出しは住人タブの直下に置く（ui-fold.js が h2.sec から次の見出しまでを折りたたみにまとめる）。描き直すのは本体 #tp-sec だけ */
  function html() {
    if (sync() && UI().save) UI().save();
    return '<h2 class="sec" id="tp-h">話題　<span class="num" id="tp-num">' + list().length + '/' + T.MAX + '</span></h2>' + bodyHtml();
  }
  function bodyHtml() {
    return '<div id="tp-sec"><p class="hint">登録した語が、交流や独りの場面などの出来事に時々出ます。範囲（全体・箱庭ごと・グループ・住人・住人どうし）と種類を選んで、語を登録してください。</p>' +
      '<div class="tpbox">' + newHtml() + '<div class="tplist" id="tplist">' + listHtml() + '</div>' +
      '<div class="tpbulk"><textarea id="tpbulk" rows="3" data-f="topic" data-p="bulk" placeholder="' + esc(BULK_PH) + '" aria-label="話題をまとめて登録"></textarea>' +
      '<div class="row" style="margin-top:6px"><button class="btn" data-act="tp:import">まとめて読み込む</button><span class="tpbn" id="tpbulkn"></span>' +
      '<span class="fmt">1行に1件、『範囲｜種類｜語｜補足』（補足は省けます）。範囲は「全体」「箱庭:出られない部屋」「グループ:3年A組」、住人の名前（「朝霧」）、二人なら「朝霧×鷹野」。種類は' + esc(T.KINDS.map(function (k) { return k[1]; }).join('・')) + '。区切りは ｜ か | かタブ。</span></div>' +
      '<ul class="warn" id="tpwarns" hidden></ul></div></div></div>';
  }
  function redraw(focusSel) {
    var el = document.getElementById('tp-sec');
    if (!el) return;
    var bulk = document.getElementById('tpbulk'), bv = bulk ? bulk.value : '';
    if (sync() && UI().save) UI().save();
    el.outerHTML = bodyHtml();
    var num = document.getElementById('tp-num'); if (num) num.textContent = list().length + '/' + T.MAX;
    var tn = document.querySelector('#cpane-topics .uitn'); if (tn) tn.textContent = list().length;   /* 住人タブの節の切替の数（2026-11-01 担当UA） */
    var nb = document.getElementById('tpbulk'); if (nb && bv) nb.value = bv;
    if (focusSel) { var f = document.querySelector(focusSel); if (f) { try { f.focus({ preventScroll: true }); } catch (e) { f.focus(); } } }
  }

  /* ---------- 住人・グループの変化への追随 ----------
     住人が消えた話題（住人・住人どうし）は消す。グループは前に見たグループの並び（known）と比べ、一つ消えて一つ増えたときは名前の変更として追随し、
     ほかで消えたグループの話題は消す（打っている途中で消えないよう、グループの欄は確定（change）したときだけ見る。ui.js の onField） */
  var known = null;
  function sync() {
    var s = S(), L = list(), ids = Object.create(null), G = groups(), ch = false;
    s.chars.forEach(function (c) { ids[c.id] = 1; });
    var keep = L.filter(function (t) { return t.scope === 'char' ? !!ids[t.a] : t.scope === 'pair' ? !!(ids[t.a] && ids[t.b]) : true; });
    if (keep.length !== L.length) { s.topics = L = keep; ch = true; }
    if (known) {
      var gone = known.filter(function (g) { return G.indexOf(g) < 0; }), came = G.filter(function (g) { return known.indexOf(g) < 0; });
      if (gone.length === 1 && came.length === 1) { if (renameIn(gone[0], came[0])) ch = true; }
      else if (gone.length) { var k2 = L.filter(function (t) { return !(t.scope === 'group' && gone.indexOf(t.group) >= 0); }); if (k2.length !== L.length) { s.topics = L = k2; ch = true; } }
    }
    known = G;
    return ch;
  }
  function renameIn(o, n) {
    var ch = false;
    list().forEach(function (t) { if (t.scope === 'group' && t.group === o) { t.group = String(n).slice(0, 40); ch = true; } });
    if (ch) S().topics = list().filter(function (t, i, L) { return t.scope !== 'group' || !L.slice(0, i).some(function (x) { return sameKey(x) === sameKey(t); }); });
    return ch;
  }
  /* グループの名前を変えた（ui-cast-tools.js の rename） */
  function renameGroup(o, n) { var ch = renameIn(o, n); known = groups(); if (ch) UI().save(); return ch; }
  /* 住人を消した・グループの欄を確定した・読み込んだあと（変われば保存する） */
  function syncSave() { if (sync()) { UI().save(); redraw(); return true; } return false; }

  /* ---------- 一括入力 ---------- */
  var KIND_ALIAS = { '食べもの': 'food', '食物': 'food', '料理': 'food', '人物': 'person', 'もの': 'thing', 'モノ': 'thing', '事': 'koto', 'コト': 'koto', '出来事': 'koto', '話': 'koto', '所': 'place', '地名': 'place', '作品名': 'work', '好き': 'like', '好きな物': 'like', '好きなこと': 'like', '嫌い': 'hate', '嫌いなもの': 'hate', '嫌いな物': 'hate', '苦手': 'hate' };
  function kindOf(v) {
    v = String(v || '').trim();
    for (var i = 0; i < T.KINDS.length; i++) if (T.KINDS[i][1] === v || T.KINDS[i][0] === v) return T.KINDS[i][0];
    return KIND_ALIAS[v] || '';
  }
  function charByName(nm) { nm = String(nm || '').trim(); var C = S().chars; for (var i = 0; i < C.length; i++) if (C[i].name === nm) return C[i]; return null; }
  function scenByName(nm) {
    nm = String(nm || '').trim().replace(/^[「『]|[」』]$/g, '');
    var ids = scenIds();
    for (var i = 0; i < ids.length; i++) if (scenName(ids[i]) === nm || ids[i] === nm) return ids[i];
    for (var j = 0; j < ids.length; j++) if (scenName(ids[j]).replace(/\s+/g, '') === nm.replace(/\s+/g, '')) return ids[j];
    return '';
  }
  /* 「範囲」の書き方 → { scope, scen, group, a, b } か { err } */
  function scopeOf(v) {
    v = String(v || '').trim();
    var m;
    if (/^(?:全体|全員|すべて|全部)$/.test(v)) return { scope: 'all' };
    if ((m = v.match(/^箱庭\s*[:：]\s*(.+)$/))) { var sid = scenByName(m[1]); return sid ? { scope: 'scen', scen: sid } : { err: '箱庭「' + m[1].trim() + '」が見つかりません' }; }
    if ((m = v.match(/^グループ\s*[:：]\s*(.+)$/))) return { scope: 'group', group: m[1].trim().slice(0, 40) };
    var ps = v.split(/\s*[×✕✖]\s*/);
    if (ps.length === 2) {
      var A = charByName(ps[0]), B = charByName(ps[1]);
      if (!A || !B) return { err: '住人「' + (!A ? ps[0] : ps[1]).trim() + '」が見つかりません' };
      if (A === B) return { err: '同じ住人どうしは選べません' };
      return { scope: 'pair', a: A.id, b: B.id };
    }
    var C = charByName(v);
    return C ? { scope: 'char', a: C.id } : { err: '範囲「' + v + '」が読めません（全体・箱庭:名前・グループ:名前・住人の名前・名前×名前）' };
  }
  function parseBulk(text) {
    var out = [], warns = [];
    String(text || '').split(/\r?\n/).forEach(function (line, ln) {
      var l = line.trim();
      if (!l || /^(?:#|＃|\/\/)/.test(l)) return;
      var p = l.split(/\s*[｜|\t]\s*/), at = (ln + 1) + '行目：';
      if (p.length === 2 && kindOf(p[0])) p.unshift('全体');
      if (p.length < 3) { warns.push(at + '「範囲｜種類｜語」の形で書いてください'); return; }
      var sc = scopeOf(p[0]);
      if (sc.err) { warns.push(at + sc.err); return; }
      var kd = kindOf(p[1]);
      if (!kd) { warns.push(at + '種類「' + p[1] + '」が読めません（' + T.KINDS.map(function (k) { return k[1]; }).join('・') + '）'); return; }
      var w = String(p[2] || '').trim(), note = p.slice(3).join(' ').trim();
      if (!w) { warns.push(at + '語がありません'); return; }
      if (w.length > T.WORD_LEN) warns.push(at + '語は' + T.WORD_LEN + '字までなので切りました');
      if (note.length > T.NOTE_LEN) warns.push(at + '補足は' + T.NOTE_LEN + '字までなので切りました');
      var t = T.norm({ id: 'x', scope: sc.scope, scen: sc.scen, group: sc.group, a: sc.a, b: sc.b, kind: kd, word: w, note: note });
      if (!t) { warns.push(at + '読めませんでした'); return; }
      out.push(t);
    });
    return { topics: out, warnings: warns };
  }
  function bulkCount(v) {
    var n = document.getElementById('tpbulkn');
    if (!n) return;
    var r = String(v || '').trim() ? parseBulk(v) : null;
    n.textContent = r ? r.topics.length + '件を検出' + (r.warnings.length ? '（読めない行など ' + r.warnings.length + '）' : '') : '';
  }
  function runBulk() {
    var ta = document.getElementById('tpbulk'), r = parseBulk(ta ? ta.value : ''), added = 0, dup = 0, over = 0;
    r.topics.forEach(function (t) {
      if (hasSame(t)) { dup++; return; }
      if (list().length >= T.MAX) { over++; return; }
      t.id = newId(); list().push(t); added++;
    });
    if (over) r.warnings.push(T.MAX + '件までなので、' + over + '件は入れませんでした');
    if (added) UI().save();
    redraw();
    var w = document.getElementById('tpwarns');
    if (w && r.warnings.length) { w.hidden = false; w.innerHTML = r.warnings.map(function (x) { return '<li>' + esc(x) + '</li>'; }).join(''); }
    if (added && !r.warnings.length) { var nt = document.getElementById('tpbulk'); if (nt) nt.value = ''; bulkCount(''); }
    UI().toast(added ? '話題を' + added + '件登録しました' + (dup ? '（同じものが' + dup + '件あったので省きました）' : '') : r.topics.length ? '新しい話題はありませんでした（すべて登録済み）' : '読み込める行がありませんでした');
    return { added: added, dup: dup, warnings: r.warnings };
  }

  /* ---------- 入力（ui.js の onField から。data-f="topic"） ---------- */
  function byTid(id) { var L = list(); for (var i = 0; i < L.length; i++) if (L[i].id === id) return L[i]; return null; }
  function onField(t, ev) {
    var p = t.getAttribute('data-p'), v = t.value, typing = ev && ev.type === 'input';
    if (p === 'bulk') { bulkCount(v); return; }
    if (p === 'nscope') { NEW.scope = v; fixNew(); var tg = document.getElementById('tptg'); if (tg) tg.innerHTML = targetHtml(); return; }
    if (p === 'nscen') { NEW.scen = v; return; }
    if (p === 'ngsel') { if (v === '\u0001') { NEW.gfree = true; NEW.group = ''; } else { NEW.gfree = false; NEW.group = v; } var tg2 = document.getElementById('tptg'); if (tg2) tg2.innerHTML = targetHtml(); if (NEW.gfree) { var gi = tg2 && tg2.querySelector('input'); if (gi) gi.focus(); } return; }
    if (p === 'ngroup') { NEW.group = v.trim().slice(0, 40); return; }
    if (p === 'na' || p === 'nb') { NEW[p.slice(1)] = v; if (p === 'na' && NEW.scope === 'pair') { fixNew(); var tg3 = document.getElementById('tptg'); if (tg3) tg3.innerHTML = targetHtml(); } return; }
    if (p === 'nkind') { NEW.kind = v; return; }
    if (p === 'nword') { NEW.word = v; return; }
    if (p === 'nnote') { NEW.note = v; return; }
    /* 登録済みの行 */
    var x = byTid(t.getAttribute('data-tid'));
    if (!x) return;
    if (p === 'kind') { if (kindOf(v)) x.kind = kindOf(v); }
    else if (p === 'word') {
      var w = String(v).replace(/[\r\n\t]+/g, ' ').trim().slice(0, T.WORD_LEN);
      if (!w) { if (!typing) { t.value = x.word; UI().toast('語は空にできません。消すときは「削除」を押してください'); } return; }
      x.word = w;
    }
    else if (p === 'note') x.note = String(v).replace(/[\r\n\t]+/g, ' ').trim().slice(0, T.NOTE_LEN);
    else return;
    UI().save();
  }
  function add() {
    fixNew();
    if (list().length >= T.MAX) { UI().toast('話題は' + T.MAX + '件までです'); return null; }
    var t = T.norm({ id: newId(), scope: NEW.scope, scen: NEW.scen, group: NEW.group, a: NEW.a, b: NEW.b, kind: NEW.kind, word: NEW.word, note: NEW.note });
    if (!t) { UI().toast(!String(NEW.word).trim() ? '語を入れてください' : NEW.scope === 'group' ? 'グループ名を入れてください' : '範囲の対象を選んでください'); var wi = document.getElementById('tpword'); if (wi && !String(NEW.word).trim()) wi.focus(); return null; }
    if (hasSame(t)) { UI().toast('「' + t.word + '」はその範囲にもう登録されています'); return null; }
    list().push(t);
    if (t.scope === 'group' && groups().indexOf(t.group) < 0) UI().toast('グループ「' + t.group + '」の住人はまだいません（そのグループの住人ができると出ます）');
    NEW.word = ''; NEW.note = '';
    UI().save();
    redraw('#tpword');
    return t;
  }
  function del(id) {
    var s = S(), n = list().length;
    s.topics = list().filter(function (t) { return t.id !== id; });
    if (s.topics.length !== n) { UI().save(); redraw(); }
  }
  /* ボタン（ui.js の onClick から。data-act="tp:…"） */
  function onAct(act, el) {
    if (act === 'tp:add') add();
    else if (act === 'tp:del') del(el.getAttribute('data-tid'));
    else if (act === 'tp:import') runBulk();
  }

  /* ---------- ⚙設定（ui-gear.js）の「相手ごとの設定」に出す 1 行 ---------- */
  function countFor(id) {
    var c = 0, p = 0;
    list().forEach(function (t) { if (t.scope === 'char' && t.a === id) c++; else if (t.scope === 'pair' && (t.a === id || t.b === id)) p++; });
    return { c: c, p: p };
  }
  function gearHtml(c) {
    var n = countFor(c.id);
    return '<p class="gearhint gtopic"><span>話題：この人 ' + n.c + '件・二人の話題 ' + n.p + '件</span><button type="button" class="btn ghost small" data-gact="totopic">話題の節へ</button></p>';
  }
  /* 節へ動く（追加の行の範囲を「住人」にして、その住人を選んでおく） */
  function open(id) {
    var by = byId();
    if (id && by[id]) { NEW.scope = 'char'; NEW.a = id; }
    /* 住人タブの節の切替を「話題」に（ui-shell.js。2026-11-01 担当UA） */
    if (HK.Shell) HK.Shell.setPane('topics');
    if (!document.getElementById('tp-sec')) { if (UI().refresh) UI().refresh(); } else redraw();
    var go = function () {
      var el = document.getElementById('tp-h'), fd = document.getElementById('fold-tp-h');
      if (!el) return;
      if (fd && !fd.open) fd.open = true;
      try { el.scrollIntoView({ block: 'start', behavior: 'auto' }); } catch (e) { el.scrollIntoView(); }
      var w = document.getElementById('tpword'); if (w) { try { w.focus({ preventScroll: true }); } catch (e2) { /* 動かせなくてもよい */ } }
    };
    if (window.requestAnimationFrame) requestAnimationFrame(function () { requestAnimationFrame(go); }); else setTimeout(go, 30);
  }

  /* ---------- 住人の JSON（ui.js の rosterJSON・importJSON）で運ぶ ----------
     住人は書き出す住人の番号（一部だけ書き出すときは、書き出さない相手は名前）。一部だけのときは、その人たちの話題と、その人たちのグループの話題だけ */
  function exportTo(R, ref, idx, only) {
    var L = Array.isArray(R.topics) ? R.topics : [], gs = Object.create(null);
    if (only) R.chars.forEach(function (c) { if (idx[c.id] != null) gl(c).forEach(function (g) { gs[g] = 1; }); });
    var out = [];
    L.forEach(function (t) {
      var o = { scope: t.scope, kind: t.kind, word: t.word };
      if (t.note) o.note = t.note;
      if (t.scope === 'all' || t.scope === 'scen') { if (only) return; if (t.scope === 'scen') o.scen = t.scen; }
      else if (t.scope === 'group') { if (only && !gs[t.group]) return; o.group = t.group; }
      else {
        var a = ref(t.a), b = t.scope === 'pair' ? ref(t.b) : 0;
        if (a == null || b == null) return;
        if (only && idx[t.a] == null && (t.scope !== 'pair' || idx[t.b] == null)) return;
        o.a = a; if (t.scope === 'pair') o.b = b;
      }
      out.push(o);
    });
    return out.length ? out : undefined;
  }
  /* refId：番号・名前 → 住人の id。replace：置き換えの読み込み（今の話題を消してから） */
  function importFrom(data, refId, replace) {
    var s = S();
    if (replace) s.topics = [];
    var src = data && Array.isArray(data.topics) ? data.topics : [], n = 0;
    src.forEach(function (o) {
      if (!o || typeof o !== 'object' || list().length >= T.MAX) return;
      var x = { id: newId(), scope: o.scope, scen: o.scen, group: o.group, kind: o.kind, word: o.word, note: o.note };
      if (o.scope === 'char' || o.scope === 'pair') { x.a = o.a != null ? refId(o.a) : ''; x.b = o.scope === 'pair' && o.b != null ? refId(o.b) : ''; }
      var t = T.norm(x);
      if (!t || hasSame(t)) return;
      list().push(t); n++;
    });
    known = null;
    return n;
  }

  /* 件数が多いときの見出しの開け閉め */
  if (typeof document !== 'undefined' && document.addEventListener) {
    document.addEventListener('toggle', function (ev) {
      var d = ev.target;
      if (!d || d.tagName !== 'DETAILS' || !d.classList.contains('tpg')) return;
      var k = d.getAttribute('data-g');
      if (d.open) FOLD[k] = 1; else delete FOLD[k];
      keepFold();
    }, true);
  }

  HK.TopicsUI = {
    html: html, redraw: redraw, onField: onField, onAct: onAct, sync: sync, syncSave: syncSave, renameGroup: renameGroup,
    gearHtml: gearHtml, countFor: countFor, open: open, count: function () { return list().length; }, exportTo: exportTo, importFrom: importFrom,
    /* 点検・試験用：一括入力の読み取り（画面と同じ）・追加の行の選択 */
    parse: parseBulk, add: function (o) { Object.keys(o || {}).forEach(function (k) { NEW[k] = o[k]; }); return add(); }, newState: function () { return NEW; }
  };
})();
