/* 箱庭シミュレーター ui: 環境値の説明の「？」と、体の関係にならない組の帯（両ビルド共通。ui.js の前に読む。2026-10-28 担当LH）
   利用者の指示「環境値欄にテキストが多いため、『？』にしまうかオンマウスチップスに」「体の関係を持てない理由をもう少し目立つ位置に」
   「体の関係を持てない理由など、キャラのオンオフで書き換わるテキストはそのまま」への対応。
   ■ HK.EnvHelp：環境値の欄（ui.js の envItem）の説明 e.desc を、ラベルの横の小さな「？」にしまう。
     ・HK.EnvHelp.q(key, label, desc)：「？」のボタン（title に全文。PC はマウスを乗せると読める）。押すと欄の下に説明が開き、もう一度押すと閉じる（aria-expanded）。
     ・HK.EnvHelp.body(key, desc)：開いたときに出る説明（閉じているあいだは hidden）。開いた欄は覚えておき、描き直しても開いたまま。
     ・しまうのは固定の説明（e.desc はすべて文字列。読み込むときに一度だけ書き足されるものはあるが、住人の設定では変わらない）と、内容のスイッチの固定の説明だけ。
       住人のオン／オフ・関係・受け攻めで書き換わる文（内容のスイッチの「起きます／起きません」・出られない部屋の「三人で」の事前の表示・恋人の多い人の注意書き・部屋の名前）は今までどおり見えたまま。
   ■ HK.NgBand：体の関係にならない組の帯（薄い黄色の面・藍の枠・「⚠」・見出し「体の関係にならない組」）。1組1行に「誰と誰：理由。直し方」と、その人の ⚙設定を開くボタン。
     ・HK.NgBand.html({ title, lead, rows: [{ a, b, who, t, fix }], notes: [], foot })：帯の HTML
       （red: true で赤い帯〔薄い赤の面・赤い枠・「⛔」・見出しと前書きは赤字。出られない部屋の「この状況では脱出できません」room-noexit-note.js〕。count: false で見出しに組の数を付けない）
     ・HK.NgBand.ending(res, E)：結末の但し書きを帯にする（出られない部屋：最初の記録の「扉の紙の但し書き」から組と理由を読む。常識改変：結末の行
       「住人どうしの施術にならない組：…」。マッサージ：結末の「理由」「直し方」）。帯に移した行は E.lines から外す（文字の書き出しは今までどおり）。
       記録（seed・result）は読むだけで、書き換えない・回し直さない。直し方の文は記録に無いので、理由の文（pos.js の HK.Pos.noSexInfo の t）から引く（下の FIX。noSexInfo の文を変えたらここも合わせる）
     ・内容のスイッチの「起きません」の注記（ui.js の ctItems）も、同じ色の小さな帯にする（.ngmini。文は変えない）
   画面だけの部品で、箱庭の結果には効かない。R18 の語を含む文は r18 の印の中（全年齢版では帯の中身を作らない） */
(function () {
  'use strict';
  var HK = window.HK;
  if (!HK || typeof document === 'undefined') return;
  var esc = HK.escape || function (s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); };

  /* 色：帯は紙に黄色を少し混ぜた面と藍の枠（白・グレー・黒のどれでも、文字は藍＝本文の色のまま読める）。color-mix の無い古い Safari は上の固定色 */
  var css =
    '.envq{position:relative;display:inline-flex;align-items:center;justify-content:center;width:18px;height:18px;min-width:18px;box-sizing:border-box;border-radius:50%;border:1px solid var(--line2);background:var(--surface,var(--paper));color:var(--muted);font-size:11px;font-weight:700;line-height:1;padding:0;margin:0 0 0 5px;vertical-align:1px;cursor:pointer;font-family:inherit;-webkit-appearance:none;appearance:none}' +
    '.envq::after{content:"";position:absolute;top:-8px;right:-8px;bottom:-8px;left:-8px}' +
    '.envq:hover,.envq:focus-visible{color:var(--accent);border-color:var(--accent)}' +
    '.envq[aria-expanded="true"]{color:var(--accent-ink,var(--paper));background:var(--accent);border-color:var(--accent)}' +
    '.envitem .labt{min-width:0}' +
    '.envitem .desc.envd{margin-top:4px;padding:6px 8px;border-radius:4px;background:var(--bg1);overflow-wrap:anywhere;word-break:break-word}' +
    '.envitem .desc.envd[hidden]{display:none}' +
    '.ngband{margin:10px 0;padding:8px 10px 8px 12px;border:1px solid var(--ai,var(--ink));border-left-width:4px;border-radius:var(--r-card,6px);background:#FFF6D6;background:color-mix(in srgb,#F2C230 17%,var(--paper));color:var(--ink);font-size:12.5px;line-height:1.65;overflow-wrap:anywhere;word-break:break-word;max-width:100%;box-sizing:border-box}' +
    '.ngband .nghead{display:flex;align-items:center;gap:6px;margin:0;font-weight:700;font-size:13.5px;color:var(--ink)}' +
    '.ngband .ngic{flex:0 0 auto;font-size:15px;line-height:1}' +
    '.ngband .nglead,.ngband .ngfoot{margin:2px 0 0;font-size:12px;color:var(--muted2)}' +
    '.ngband ul{margin:4px 0 0;padding:0;list-style:none}' +
    '.ngband li{margin:0;padding:4px 0;border-top:1px dashed var(--line2)}' +
    '.ngband li:first-child{border-top:0}' +
    '.ngband .ngwho{font-weight:700}' +
    '.ngband .ngfix{color:var(--muted2)}' +
    '.ngband .nggear{display:inline-flex;align-items:center;gap:3px;margin:0 0 0 6px;padding:1px 8px;border:1px solid var(--line2);border-radius:999px;background:var(--paper);color:var(--ink);font-size:11.5px;line-height:1.5;font-family:inherit;cursor:pointer;vertical-align:1px;white-space:nowrap;-webkit-appearance:none;appearance:none}' +
    '.ngband .nggear:hover,.ngband .nggear:focus-visible{border-color:var(--accent);color:var(--accent)}' +
    '.ngband .nggear svg{flex:0 0 auto}' +
    '.ending .ngband{margin:10px 0 6px}' +
    '#trio-note{margin:0 0 4px}#trio-note .desc{margin:0 0 8px;font-size:12px;color:var(--muted2)}' +
    /* 赤い帯（脱出できない）：紙に赤を少し混ぜた面と赤い枠。見出しと前書きは赤字（暗い面では、文字の色に寄せて明るい赤になる） */
    '.ngband.ngred{border-color:#C62F3A;background:#FCEBEC;background:color-mix(in srgb,#E5484D 12%,var(--paper))}' +
    '.ngband.ngred .nghead,.ngband.ngred .nglead{color:#B3232D;color:color-mix(in srgb,#D93A44 78%,var(--ink))}' +
    '.ngband.ngred .nglead{font-weight:700;font-size:12.5px}' +
    '.ngband.ngred li{border-top-color:color-mix(in srgb,#E5484D 35%,var(--line2))}' +
    '#noexit-note{margin:0 0 4px}' +
    '#view-box .ctw.ngmini{display:block!important;margin:3px 0 2px 22px!important;padding:2px 8px;border-left:3px solid var(--ai,var(--ink));border-radius:4px;background:#FFF6D6;background:color-mix(in srgb,#F2C230 17%,var(--paper));color:var(--ink);font-size:11.5px;line-height:1.6;opacity:1!important}' +
    '#view-box .ctw.ngmini::before{content:"\\26A0\\FE0E\\00A0";font-weight:700}' +
    '@supports not (color: color-mix(in srgb, red 50%, blue)){' +
      '@media (prefers-color-scheme: dark){:root:not([data-theme="light"]):not([data-theme="gray"]) .ngband,:root:not([data-theme="light"]):not([data-theme="gray"]) #view-box .ctw.ngmini{background:#2A2715}}' +
      ':root[data-theme="dark"] .ngband,:root[data-theme="dark"] #view-box .ctw.ngmini{background:#2A2715}' +
      ':root[data-theme="gray"] .ngband,:root[data-theme="gray"] #view-box .ctw.ngmini{background:#EEE6C8}' +
      '@media (prefers-color-scheme: dark){:root:not([data-theme="light"]):not([data-theme="gray"]) .ngband.ngred{background:#3A1E21}:root:not([data-theme="light"]):not([data-theme="gray"]) .ngband.ngred .nghead,:root:not([data-theme="light"]):not([data-theme="gray"]) .ngband.ngred .nglead{color:#FF9C9C}}' +
      ':root[data-theme="dark"] .ngband.ngred{background:#3A1E21}:root[data-theme="dark"] .ngband.ngred .nghead,:root[data-theme="dark"] .ngband.ngred .nglead{color:#FF9C9C}' +
      ':root[data-theme="gray"] .ngband.ngred{background:#F2DADB}}';
  var st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);

  /* ---------- 環境値の説明の「？」 ---------- */
  var H = HK.EnvHelp = { open: {} };
  function did(key) { return 'envd-' + String(key).replace(/[^\w-]/g, '_'); }
  H.q = function (key, label, desc) {
    if (!desc) return '';
    var on = !!H.open[key];
    return '<button type="button" class="envq" data-envq="' + esc(key) + '" aria-expanded="' + on + '" aria-controls="' + did(key) + '" aria-label="「' + esc(label) + '」の説明" title="' + esc(desc) + '">？</button>';
  };
  H.body = function (key, desc) {
    if (!desc) return '';
    return '<div class="desc envd" id="' + did(key) + '"' + (H.open[key] ? '' : ' hidden') + '>' + esc(desc) + '</div>';
  };
  H.toggle = function (b) {
    var key = b.getAttribute('data-envq'), d = document.getElementById(did(key)), on = b.getAttribute('aria-expanded') !== 'true';
    if (on) H.open[key] = 1; else delete H.open[key];
    b.setAttribute('aria-expanded', String(on));
    if (d) d.hidden = !on;
  };
  document.addEventListener('click', function (ev) {
    var b = ev.target && ev.target.closest && ev.target.closest('[data-envq]');
    if (b) { ev.preventDefault(); H.toggle(b); return; }
    var g = ev.target && ev.target.closest && ev.target.closest('[data-nggear]');
    if (g) { ev.preventDefault(); B.gear(g.getAttribute('data-nggear')); }
  });

  /* ---------- 体の関係にならない組の帯 ---------- */
  var B = HK.NgBand = {};
  var GEAR = '<svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round" aria-hidden="true"><path d="M6.8 3.1L7.0 1.4L9.0 1.4L9.2 3.1L10.6 3.7L12.0 2.6L13.4 4.0L12.3 5.4L12.9 6.8L14.6 7.0L14.6 9.0L12.9 9.2L12.3 10.6L13.4 12.0L12.0 13.4L10.6 12.3L9.2 12.9L9.0 14.6L7.0 14.6L6.8 12.9L5.4 12.3L4.0 13.4L2.6 12.0L3.7 10.6L3.1 9.2L1.4 9.0L1.4 7.0L3.1 6.8L3.7 5.4L2.6 4.0L4.0 2.6L5.4 3.7Z"/><circle cx="8" cy="8" r="2.1"/></svg>';
  function charByName(n) {
    var S = HK.UI && HK.UI.state ? HK.UI.state() : null;
    return S && S.chars ? S.chars.filter(function (c) { return c.name === n; })[0] || null : null;
  }
  /* ⚙：その人の設定（ui-gear.js の HK.UI.openGear）を開く。住人の一覧にいない名前（消した住人など）にはボタンを付けない */
  B.gear = function (name) {
    var c = charByName(name);
    if (c && HK.UI && HK.UI.openGear) HK.UI.openGear(c.id);
  };
  function gearBtn(name) {
    if (!name || !charByName(name) || !(HK.UI && HK.UI.openGear)) return '';
    return '<button type="button" class="nggear" data-nggear="' + esc(name) + '" title="' + esc(name) + 'の設定を開く">' + GEAR + esc(name) + 'の設定</button>';
  }
  /* 直し方の文の頭の名前（「ミナトの『性欲の強さ』を…」）：その人の ⚙ を出す。二人の関係・受け攻めの直し方は、組の左の人 */
  function fixWho(r) {
    var f = r.fix || '';
    if (r.b && f.indexOf(r.b + 'の') === 0 && !(r.a && f.indexOf(r.a + 'の') === 0 && r.a.length >= r.b.length)) return r.b;
    return r.a || '';
  }
  B.html = function (o) {
    var rows = o.rows || [], notes = o.notes || [];
    if (!rows.length && !notes.length) return '';
    /* o.red：脱出できない・成り立たないことを知らせる赤い帯（room-noexit-note.js。印は ⛔）。o.count === false なら見出しに組の数を付けない */
    return '<div class="ngband' + (o.red ? ' ngred' : '') + '" role="note"' + (o.id ? ' id="' + esc(o.id) + '"' : '') + '><p class="nghead"><span class="ngic" aria-hidden="true">' + (o.red ? '⛔' : '⚠︎') + '</span>' + esc(o.title || '') + (rows.length && o.count !== false ? '（' + rows.length + '組）' : '') + '</p>' +
      (o.lead ? '<p class="nglead">' + esc(o.lead) + '</p>' : '') +
      '<ul>' + rows.map(function (r) {
        var who = r.who || (r.a && r.b ? r.a + 'と' + r.b : '');
        return '<li>' + (who ? '<span class="ngwho">' + esc(who) + '</span>：' : '') + esc(r.t || '') + (/。$/.test(r.t || '') ? '' : '。') +
          (r.fix ? '<span class="ngfix">直し方：' + esc(r.fix) + '</span>' : '') + (o.gear === false ? '' : gearBtn(fixWho(r))) + '</li>';
      }).join('') + notes.map(function (t) { return '<li>' + esc(t) + '</li>'; }).join('') + '</ul>' +
      (o.foot ? '<p class="ngfoot">' + esc(o.foot) + '</p>' : '') + '</div>';
  };
  /* 内容のスイッチの注記（ui.js の ctItems）：「起きません」のときだけ小さな帯の印 */
  B.ctCls = function (off, t) { return off && t ? 'desc ctw ngmini' : 'desc ctw'; };

  /* ---------- 結末の但し書き ---------- */
  B.ending = function () { return ''; };
  /* r18:begin */
  /* 括弧・かぎ括弧の外にある区切りで分ける */
  function splitTop(s, seps) {
    var out = [], d = 0, cur = '';
    for (var i = 0; i < s.length; i++) {
      var ch = s.charAt(i);
      if (ch === '（' || ch === '「' || ch === '(') d++;
      else if ((ch === '）' || ch === '」' || ch === ')') && d > 0) d--;
      if (!d && seps.indexOf(ch) >= 0) { out.push(cur); cur = ''; continue; }
      cur += ch;
    }
    out.push(cur);
    return out;
  }
  /* 「AとB（理由）」→ { a, b, t }。名前は結果の住人の名前から引く（名前に「と」が入っていても取り違えない） */
  function pairOf(item, names) {
    var d = 0, p = -1;
    for (var i = 0; i < item.length; i++) { var ch = item.charAt(i); if (ch === '（' && !d) { p = i; break; } if (ch === '「') d++; else if (ch === '」') d--; }
    if (p < 0 || item.charAt(item.length - 1) !== '）') return null;
    var who = item.slice(0, p).trim(), t = item.slice(p + 1, -1), a = '', b = '';
    for (var x = 0; x < names.length && !a; x++) for (var y = 0; y < names.length; y++) if (x !== y && who === names[x] + 'と' + names[y]) { a = names[x]; b = names[y]; break; }
    return { a: a, b: b, who: a ? '' : who, t: t };
  }
  function reEsc(s) { return String(s).replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }
  /* 直し方：pos.js の HK.Pos.noSexInfo の理由の文 t から、同じ関数が付ける直し方 fix を引く（記録には理由だけが残るため） */
  function fixOf(r) {
    var t = r.t || '', ns = [r.a, r.b].filter(Boolean), i, n, o, m;
    if (/^受け攻めが合わない/.test(t)) return '受け攻め（相手ごとの指定・「相手の受け攻め」）を、どちらかが受けかリバに回れるようにする';
    if (/は同じ人の恋人どうし/.test(t) && r.a) return r.a + 'と' + r.b + 'のあいだに恋愛の関係（恋人・セフレ など）を足すか、恋人の関係を見直す';
    if (/は恋愛にしない関係（/.test(t)) return '二人の関係の「恋愛」を「あり」にする';
    /* 関係「恐怖」の二人（pos.js の HK.Pos.fearSexInfo と noSexInfo の fearOK。2026-10-30 担当FS） */
    if (/は関係「恐怖」の二人（[^）]*）。合意のない展開でだけ/.test(t)) return '';
    if (/は互いに恐れ合っている/.test(t)) return 'どちらかの「恐怖」を外す';
    if (/は関係「恐怖」の二人（[^）]*）。恋愛にはならず、体の関係は内容のスイッチ/.test(t)) return '内容のスイッチ「合意のない展開」を入にする（または二人の関係を変える）';
    if ((m = /恐れられる側の(.+?)の性欲の強さが「なし」/.exec(t))) return m[1] + 'の「性欲の強さ」を「ふつう」などにする';
    if ((m = /恐れられる側の(.+?)が攻め・(.+?)が受けに回れない/.exec(t))) return m[1] + 'が攻めかリバ、' + m[2] + 'が受けかリバに回れるように、受け攻め（相手ごとの指定・「相手の受け攻め」）を変える';
    if ((m = /^.+?は関係「恐怖」の二人（[^）]*）。(.+)$/.exec(t))) return fixOf({ a: r.a, b: r.b, t: m[1] });
    if (/は(関係「無関心」|関係「恐怖」|「恋愛：なし」の家族).*の二人$/.test(t)) return '二人の関係を変える（家族なら関係の「恋愛」を「あり」にする）';
    for (i = 0; i < ns.length; i++) {
      n = reEsc(ns[i]); o = ns[1 - i] || '';
      if (new RegExp('^' + n + 'が「R18に参加しない」$').test(t)) return ns[i] + 'の「R18に参加しない」を外す';
      if (new RegExp('^' + n + 'の性欲の強さが「なし」$').test(t)) return ns[i] + 'の「性欲の強さ」を「ふつう」などにする';
      if (new RegExp('^' + n + 'の恋愛対象が「なし」で、体の関係の相手も「なし」').test(t)) return ns[i] + 'の「体の関係の相手」を選ぶ';
      if (new RegExp('^' + n + 'の体の関係の相手「').test(t)) return ns[i] + 'の「体の関係の相手」を変える';
      if (new RegExp('^' + n + 'の恋愛対象「').test(t)) return ns[i] + 'の「恋愛対象」を変える';
      if ((m = new RegExp('^' + n + 'が(.+)を「恋愛・R18にしない相手」にしている$').exec(t))) return ns[i] + 'の「恋愛・R18にしない相手」から' + m[1] + 'を外す';
      if (new RegExp('^' + n + 'は性行為の相手を.+に固定している$').test(t)) return ns[i] + 'の「性行為の相手の固定」に' + o + 'を足すか、「誰とでも可」にする';
      if (new RegExp('^' + n + 'は恋愛相手を.+に固定していて').test(t)) return ns[i] + 'の「性行為の相手の固定」を「誰とでも可」にすると持てる（恋愛には進まない）';
      if (new RegExp('^' + n + 'は一途で').test(t)) return ns[i] + 'の「一途」を外す';
    }
    return '';
  }
  B.fixOf = fixOf;
  var MARK = 'は体の関係を持てない組なので';
  /* 出られない部屋：最初の記録の「扉の紙の但し書き」（room-games.js の NG_NOTE）から、組と理由・三人に加わらない人 */
  function roomBand(res) {
    var e = null, L = res.log || [];
    for (var k = 0; k < L.length && k < 12; k++) if (L[k] && typeof L[k].text === 'string' && L[k].text.indexOf(MARK) > 0) { e = L[k]; break; }
    if (!e) return '';
    var s = e.text, cut = s.indexOf(MARK), pre = s.slice(0, cut), names = (res.chars || []).map(function (c) { return c.name; });
    /* 組の並びの前（「扉の紙の但し書き：」と、三人に加わらない人の文）を切る */
    var parts = splitTop(pre, ['：', '。']), list = parts[parts.length - 1], head = pre.slice(0, pre.length - list.length);
    var rows = splitTop(list, ['、']).map(function (x) { return pairOf(x.trim(), names); }).filter(Boolean);
    rows.forEach(function (r) { r.fix = fixOf(r); });
    var notes = (head.match(/[^。：]*(?:三人の場面に加わらない|三人には加わらない)。/g) || []);
    var fall = /三人で抱き合う/.test(s.slice(cut));
    return B.html({ title: '体の関係にならない組', rows: rows, notes: notes,
      lead: fall ? 'この組があるため、三人の場面でだけ数える部屋の条件は「三人で抱き合う」に替わりました。' : 'この組を含む三人は、二人の両方と持てる人を真ん中にしたときだけ、三人の場面になります（二人は直接は触れ合いません）。',
      foot: '「○○の設定」を押すと、その人の設定が開きます。直すと次に動かすときに効きます（この記録は変わりません）。' });
  }
  /* 常識改変：結末の行「住人どうしの施術にならない組：AとB（理由。直し方：…）、…、ほかN組。」（solo-kaihen.js） */
  var KH = '住人どうしの施術にならない組：';
  function kaihenBand(res, lines) {
    var k = -1;
    for (var i = 0; i < lines.length; i++) if (typeof lines[i] === 'string' && lines[i].indexOf(KH) === 0) { k = i; break; }
    if (k < 0) return '';
    var s = lines[k].slice(KH.length).replace(/。$/, ''), more = '', names = (res.chars || (res.heroes || [])).map(function (c) { return c.name; });
    var items = splitTop(s, ['、']);
    if (/^ほか\d+組$/.test(items[items.length - 1])) more = items.pop();
    var rows = items.map(function (x) {
      var r = pairOf(x.trim(), names); if (!r) return null;
      var j = r.t.lastIndexOf('。直し方：'); if (j >= 0) { r.fix = r.t.slice(j + 5); r.t = r.t.slice(0, j); }
      return r;
    }).filter(Boolean);
    if (!rows.length) return '';
    lines.splice(k, 1);
    return B.html({ title: '住人どうしの施術で体の関係にならない組', rows: rows, foot: more ? more + 'は書ききれませんでした。' : '' });
  }
  /* マッサージ：住人どうしの施術が普通のマッサージのままだった結末の「理由」「直し方」（solo-massage.js。施術者が住人のときだけ） */
  function massageBand(res, lines, stats) {
    if (!stats) return '';
    var g = function (n) { var x = stats.filter(function (s) { return s[0] === n; })[0]; return x ? String(x[1]) : ''; };
    var t = g('理由'), fix = g('直し方'), staff = g('施術者'), hero = res.hero && res.hero.name;
    var names = (res.chars || res.heroes || []).map(function (c) { return c.name; }).concat(hero ? [hero] : []);
    if (!t || g('施術') !== '普通のマッサージ' || !staff || names.indexOf(staff) < 0 || !hero || staff === hero) return '';
    return B.html({ title: '住人どうしの施術で体の関係にならない組', rows: [{ a: staff, b: hero, t: t, fix: fix || fixOf({ a: staff, b: hero, t: t }) }], lead: '最後まで普通のマッサージのままでした。' });
  }
  B.ending = function (res, E, stats) {
    if (!res || !E || HK.SAFE_ON) return '';
    try {
      if (res.scenId === 'whiteroom') return roomBand(res);
      if (res.scenId === 'kaihen') return kaihenBand(res, E.lines || []);
      if (res.scenId === 'massage') return massageBand(res, E.lines || [], stats || res.estats);
      if (res.scenId === 'locker') return HK.LockerNote && HK.LockerNote.ending ? HK.LockerNote.ending(res) : '';   /* 媚薬ロッカー（locker-note.js） */
    } catch (e) { /* 読めない記録では帯を出さない（結末はそのまま） */ }
    return '';
  };
  /* r18:end */
})();
