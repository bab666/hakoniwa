/* 箱庭シミュレーター ui: 住人ごとの設定（⚙️）
   節は ①口調 ②プロフィール ③体と設定 ④恋愛（R18版は恋愛と夜） ⑤相手ごとの設定（殺さない相手・関係・呼び方・二人称/一人称・受け攻め・夜の性格）。
   ①話し方の欄（口調・一人称・語尾・辞書・呼び方・敬語・喘ぎ など）は 2026-10-28（担当LA）に住人タブの「口調・喘ぎの設定」の節（ui-voice.js）へ移した。
   ここには要約と「口調・喘ぎをより細かく設定する」のボタンだけを置く（押すと窓を閉じて、その節をこの住人にして開く）。
   2026-10-28（担当LI）：利用者の要望で、口調〜語尾の設定（かんたん）の欄（口調・一人称・二人称・怒ったとき／恋人になってからの一人称・名前の読み・語尾の記号・説明・台詞の見本）を
   ①口調に戻した。描画と入力は ui-voice.js の HK.VoiceSet.basicHtml・basicField を「口調・喘ぎの設定」と共用する（保存先は同じ c.*）。辞書・呼び方・敬語・喘ぎはボタンの先だけ。
   固定の説明は各節の ？（TIPS）に置く。欄の data-gf は保存との互換のため変えない。
   ※口調や関係は台詞・文面と関係の初期値に効く。行動の判断はエゴグラムの数値で決まる */
(function () {
  'use strict';
  var HK = window.HK, esc = HK.escape;
  if (!HK.UI) return;
  var UI = HK.UI;
  function S() { return UI.state(); }
  function byId(id) { return S().chars.filter(function (c) { return c.id === id; })[0] || null; }
  var GENDERS = [['', 'おまかせ'], ['m', '男性'], ['f', '女性'], ['x', 'その他']];
  var LIKES = [['', 'おまかせ（制限なし）'], ['m', '男性'], ['f', '女性'], ['both', '男女両方'], ['none', 'なし（興味なし）']];
  var POS = [['', 'おまかせ'], ['top', '攻め'], ['bottom', '受け'], ['riba', 'リバ']];
  function lab(list, v) { for (var i = 0; i < list.length; i++) if (list[i][0] === (v || '')) return list[i][1]; return ''; }
  function toneLabel(k) { var t = HK.toneInfo ? HK.toneInfo(k) : HK.PERSONA[k]; return t ? t.label : ''; }
  function callLabel(v) { var l = (HK.CALL_STYLES || []).filter(function (o) { return o.v === (v || ''); })[0]; return l ? l.label : ''; }
  /* 住人のグループ（カンマ区切りで複数）と、同じグループの住人（関係を「グループの全員と」付けるとき） */
  function grpsOf(c) { var g = []; String((c && c.group) || '').split(/[,，、]/).forEach(function (x) { x = x.trim(); if (x && g.indexOf(x) < 0) g.push(x); }); return g; }
  function groupMates(c) { var g = grpsOf(c); return g.length ? S().chars.filter(function (o) { return o !== c && grpsOf(o).some(function (x) { return g.indexOf(x) >= 0; }); }) : []; }
  function tiesOf(c) { UI.cleanTies(); return (S().ties || []).filter(function (t) { return t.a === c.id || t.b === c.id; }); }

  /* ---------- 住人の行に出す要約 ---------- */
  UI.summary = function (c) {
    var bits = [];
    bits.push('口調：' + (c.tone ? toneLabel(c.tone) : 'おまかせ（' + UI.autoTone(c) + '）'));
    if (c.fp) bits.push('一人称：' + c.fp);
    if (c.fpAngry) bits.push('怒ると：' + c.fpAngry);
    if (c.fpLover) bits.push('恋人ができると：' + c.fpLover);
    if (c.marks) bits.push('語尾：' + c.marks);
    if (c.toneCustom && !HK.TONE_CUSTOM_OFF) bits.push('付け替え：' + c.toneCustom);
    /* r18:begin */
    /* 高度設定「喘ぎ声の調整」・この住人の「声の区分」で、この人の声の区分を既定から変えてあれば添える（moan-engine.js の HK.Moan.fitNote。住人の設定なら「（住人）」） */
    var fnote = !HK.SAFE_ON && HK.Moan && HK.Moan.fitNote && HK.Moan.toneOf ? HK.Moan.fitNote(HK.Moan.toneOf(c), c) : '';
    if (c.moanTone && !HK.SAFE_ON) bits.push('喘ぎ：' + toneLabel(c.moanTone) + (fnote ? '（声：' + fnote + '）' : ''));
    else if (fnote) bits.push('声：' + fnote);
    /* 住人の欄の喘ぎの辞書（ui-gear-moan.js）：「喘ぎ辞書：N行」など */
    if (!HK.SAFE_ON && HK.GearMoan) bits = bits.concat(HK.GearMoan.summary(c));
    /* r18:end */
    if (HK.Ending && HK.Ending.on(c)) bits.push(HK.Ending.labelFor(c));
    if (c.call) bits.push('呼び方：' + callLabel(c.call));
    if (c.gender) bits.push(lab(GENDERS, c.gender));
    if (c.likes) bits.push('恋愛対象：' + lab(LIKES, c.likes));
    if (c.faithful) bits.push('一途');
    if (c.pos) bits.push(lab(POS, c.pos));
    var lk = namesOf(c.loveLock);
    if (lk.length) bits.push('恋愛相手：' + lk.join('・') + 'だけ');
    /* r18:begin */
    var sl = !HK.SAFE_ON && (c.sexLock === 'pick' || c.sexLock === 'pickMob') ? namesOf(c.sexLocks) : [];
    if (sl.length) bits.push('体の関係：' + sl.join('・') + (c.sexLock === 'pickMob' ? '＋モブ' : 'だけ'));
    else if (!HK.SAFE_ON && c.sexLock === 'any' && lk.length) bits.push('体の関係：誰とでも');
    if (!HK.SAFE_ON && c.noR18) bits.push('R18に参加しない');
    if (!HK.SAFE_ON && c.trio === 'no') bits.push('三人の場面（3P）：しない');
    /* 体の関係の相手（恋愛対象「なし」の人だけ）・性欲の強さ（attr.js の A.SEXLIKES・A.LIBIDO。判定は pos.js） */
    if (!HK.SAFE_ON && c.likes === 'none' && c.sexLikes && HK.Attr) bits.push('体の関係の相手：' + HK.Attr.label('sexLikes', c.sexLikes));
    if (!HK.SAFE_ON && c.libido && HK.Attr) bits.push('性欲：' + HK.Attr.label('libido', c.libido));
    /* r18:end */
    if (c.alcohol && HK.ALC_LABEL) bits.push('お酒：' + HK.ALC_LABEL[c.alcohol]);
    /* r18:begin */
    if (!HK.SAFE_ON && (c.partWords || c.partM || c.partF)) bits.push('性器の呼び方：' + ([c.partM, c.partF].filter(Boolean).join('・') || { soft: 'ぼかす', direct: '直接的', medical: '医学的' }[c.partWords]));
    if (!HK.SAFE_ON && HK.Pos && HK.Pos.npcValid(c.posNpc)) bits.push('モブには' + ({ top: '攻め', bottom: '受け', riba: 'リバ' })[c.posNpc]);
    /* r18:end */
    if (HK.Attr) bits = bits.concat(HK.Attr.summary(c, byId));
    if (HK.Shared) bits = bits.concat(HK.Shared.summary(c));
    var ngs = (c.loveNG || []).map(byId).filter(Boolean);
    if (ngs.length) bits.push('恋愛にしない：' + ngs.map(function (o) { return o.name; }).join('・'));
    var n = tiesOf(c).length;
    if (n) bits.push('関係 ' + n + '件');
    /* 「仲間」を入れたグループ（ui.js の S.grpComrade） */
    var cg = grpsOf(c).filter(function (g) { return S().grpComrade && S().grpComrade[g]; });
    if (cg.length) bits.push('仲間：' + cg.join('・'));
    return (c.color ? '<i class="csw" style="background:' + esc(c.color) + '" aria-hidden="true"></i>' : '') + esc(bits.join('・'));
  };

  /* ---------- イメージカラー：住人の並び（結果では参加者の並び）の番号の色を上書き ---------- */
  var prev = [];
  UI.applyColors = function (list) {
    var root = document.documentElement;
    if (HK.Icons && HK.Icons.colors) {
      /* アイコンの枠は名前で色を引く（住人の一覧＋結果の参加者の両方） */
      var all = (S().chars || []).concat(list || []);
      HK.Icons.colors(all);
      /* すでに描かれているアイコンの枠も塗り直す */
      Array.prototype.forEach.call(document.querySelectorAll('.av[title]'), function (el) { var c = HK.Icons.color(el.getAttribute('title')); el.style.setProperty('--c', c || 'var(--p' + (el.getAttribute('data-p') || 0) + ')'); });
    }
    prev.forEach(function (p) { root.style.removeProperty(p); });
    prev = [];
    (list || []).forEach(function (c, i) {
      if (c && typeof c.color === 'string' && /^#[0-9a-fA-F]{6}$/.test(c.color)) { root.style.setProperty('--p' + i, c.color); prev.push('--p' + i); }
    });
  };

  /* ---------- 見た目 ---------- */
  /* ⚙ 設定のボタンの絵：住人の行（ui.js）の歯車は inline SVG の線画（.gearic）。ここでは大きさだけそろえる */
  var css = '.gearbtn .gearic{display:inline-flex;flex:none;width:14px;height:14px}.gearbtn .gearic svg{display:block}' +
    '.gearbtn{white-space:nowrap}.csum{font-size:12px;color:var(--muted);flex:1 1 100%;line-height:1.5}.csw{display:inline-block;width:10px;height:10px;border-radius:50%;margin-right:4px;vertical-align:-1px;border:1px solid var(--line)}' +
    '.gearov{position:fixed;inset:0;z-index:30;background:rgba(10,14,18,.45);display:flex;align-items:flex-start;justify-content:center;padding:max(12px,env(safe-area-inset-top,0px)) 12px 12px;overflow-y:auto;-webkit-overflow-scrolling:touch}' +
    '.gearbox{background:var(--paper,var(--surface));color:var(--ink);border:1px solid var(--line2,var(--line));border-radius:var(--r-card,6px);width:100%;max-width:680px;padding:18px 20px 22px}' +
    '.gearhd{display:flex;align-items:center;gap:10px;margin-bottom:6px;padding-bottom:10px;border-bottom:1px solid var(--line)}.gearhd h2{font-size:17px;font-weight:700;margin:0;flex:1}.gearsec{margin-top:18px;border-top:1px solid var(--line);padding-top:14px}.gearsec h3{font-size:14px;font-weight:700;margin:0 0 8px}' +
    '.gearrow{display:flex;flex-wrap:wrap;gap:8px 12px;align-items:center;margin:6px 0}.gearrow label{font-size:13px;color:var(--muted);display:flex;gap:6px;align-items:center;flex-wrap:wrap}.gearrow select,.gearrow input[type=text]{max-width:100%}' +
    '.gearhint{font-size:12px;color:var(--muted);margin:4px 0 0;line-height:1.6}.tonesample{margin:8px 0 2px;padding:8px 12px;border-left:2px solid var(--ink);background:var(--bg1,var(--accent-soft));border-radius:0 4px 4px 0;font-size:13px;line-height:1.7;min-height:1.7em}.tonesample .tsl{display:block}.tonesample.anim .tsl{display:none}.tonesample.anim .tsl.on{display:block;animation:tsfade .5s ease}.tonesample .tsh{font-size:11px;color:var(--muted2,var(--muted));display:block;margin-bottom:2px}@keyframes tsfade{from{opacity:0;transform:translateY(4px)}to{opacity:1;transform:none}}@media (prefers-reduced-motion:reduce){.tonesample.anim .tsl{display:block}.tonesample.anim .tsl.on{animation:none}}.gtie{border:1px solid var(--line);border-radius:var(--r-card,6px);padding:8px 10px;margin:8px 0}.gtie .who{font-weight:600;display:flex;align-items:center;gap:6px;margin-bottom:4px}' +
    /* 関係1本＝1枠（.gtc）。1行目 .gth（種類・向き・外す）、2行目 .gtf（恋愛・仲・過去・出来事などの小さな欄）、説明 .gtd（1行で省略・押すと全文） */
    '.gtie .gtc{border:1px solid var(--line);border-radius:var(--r-card,6px);background:var(--bg1,var(--accent-soft));padding:8px 10px;margin:6px 0 0;min-width:0}.gtie .gtc+.gtc{margin-top:10px}.gtie .gtc+.one{margin-top:10px}' +
    '.gtie .gth{display:flex;flex-wrap:wrap;gap:6px;align-items:center;min-width:0}.gtie .gth select{flex:0 1 auto;min-width:0;max-width:100%;font-weight:600}.gtie .gth .gtx{margin-left:auto;flex:0 0 auto}' +
    /* 2行目は同じ幅の升に並べる（広い窓は3〜4列、スマホ幅は1列）。恋愛の欄は選択肢が長いので、2列以上あるときは2升ぶん。
       過去の二つの欄（一人目から・二人目から。.gtpw）は一段に並べる（狭い幅は縦に積む）。空いた升には後ろの欄を詰める（dense） */
    '.gtie .gtf{display:grid;grid-template-columns:repeat(auto-fill,minmax(11.5em,1fr));gap:6px;margin-top:6px;min-width:0}.gtie .gtf:empty{display:none}' +
    '.gtie .gtf select{width:100%;min-width:0;max-width:100%;font-size:12.5px}@media (min-width:600px){.gtie .gtf .gtlove{grid-column:span 2}}.gtie .gtf{grid-auto-flow:row dense}.gtie .gtf .gtpw{grid-column:1/-1;display:grid;grid-template-columns:repeat(auto-fill,minmax(15em,1fr));gap:6px;min-width:0}' +
    '.gtie .gtc .gearhint{margin-top:6px}.gtie .gtd{font-size:11.5px;color:var(--muted2,var(--muted));white-space:nowrap;overflow:hidden;text-overflow:ellipsis;cursor:pointer}.gtie .gtd.open{white-space:normal;overflow:visible;cursor:default}' +
    '.gtie .one{display:flex;flex-wrap:wrap;gap:6px;align-items:center;margin:4px 0}.gtie input[type=text]{width:12em}' +
    'details.gkeigo,details.gdet{margin:8px 0 0;border:1px solid var(--line);border-radius:var(--r-card,6px);padding:6px 10px}details.gkeigo summary,details.gdet summary{cursor:pointer;font-size:13px;color:var(--muted)}details.gkeigo .gkn,details.gdet .gkn{font-size:12px;margin-left:4px;color:var(--ink)}details.gkeigo[open] summary,details.gdet[open] summary{margin-bottom:4px}' +
    '.gscope{margin:-2px 0 8px;padding:4px 8px;border-left:2px solid var(--line2,var(--line));background:var(--bg1,transparent);border-radius:0 4px 4px 0}.gforh{font-size:12px;color:var(--muted);margin-left:4px}.gfnote{color:var(--accent)}' +
    '.gearrow label{min-width:0;max-width:100%}' +
    '@media (max-width:520px){.gearbox{padding:12px}.gtie input[type=text]{width:100%}.gearsec[data-vroot] .gearrow input[type=text]{max-width:100%;width:100%!important}}' +
    /* 暗くした欄（性欲「なし」のときの夜の欄：.gdim。値は消さず操作もできる）と、効かない欄（攻め・受けを選んだ人の攻め度：.gdis。選べない）。2026-10-27 担当HK */
    '.gdim{opacity:.45}.gdim:hover,.gdim:focus-within{opacity:.75}.gdis{opacity:.5}.gdis select{cursor:not-allowed}.gearrow .gnote{flex:1 1 100%;margin:0}.glibnote{border-left:2px solid var(--line2,var(--line));padding-left:8px}';
  /* この住人の傾向（エゴグラムの説明）と、住人一覧の態度の一語 */
  css += 'details.gego{margin:10px 0 0;border:1px solid var(--line);border-radius:var(--r-card,6px);padding:6px 10px;background:var(--bg1,transparent)}details.gego summary{cursor:pointer;font-size:14px;font-weight:600}details.gego .gegc{font-size:12px;font-weight:400;color:var(--muted);margin-left:6px}details.gego ul{margin:6px 0 2px;padding-left:1.2em;font-size:13px;line-height:1.7}details.gego li{margin:2px 0}' +
    '.egatt{display:inline-block;font-size:11px;line-height:1.5;color:var(--muted2,var(--muted));border:1px solid var(--line);border-radius:999px;padding:0 6px;margin-left:6px;white-space:nowrap;vertical-align:1px}';
  var st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);

  /* ---------- 設定の窓 ---------- */
  var cur = null, ov = null, opener = null, egoOpen = true;
  /* 折りたたみ（恋愛相手の固定・性行為の相手・恋愛にしない相手）の開閉。窓を開いているあいだだけ覚える。基本は閉じる */
  var openMap = {};
  /* 住人が多いとき（61人以上）は、閉じている一覧の中身（住人を並べたチェック）を DOM に作らず、開いたときに入れる（lazyIn。住人1000人で窓を開くのが重かった） */
  var lazyIn = {}, lazyMany = false;
  function lazyBody(k, open, inner) { if (open || !lazyMany) return inner; lazyIn[k] = inner; return ''; }
  function det(k, title, sum, inner) { return '<details class="gdet" data-k="' + k + '"' + (openMap[k] ? ' open' : '') + '><summary>' + title + ' <span class="gkn">' + esc(sum) + '</span></summary><div class="gearrow">' + lazyBody(k, openMap[k], inner) + '</div></details>'; }
  function namesOf(ids) { return (ids || []).map(byId).filter(Boolean).map(function (o) { return o.name; }); }
  function opt(v, label, sel, title) { return '<option value="' + esc(v) + '"' + (v === sel ? ' selected' : '') + (title ? ' title="' + esc(title) + '"' : '') + '>' + esc(label) + '</option>'; }
  function selOf(f, list, v, extra) { return '<select data-gf="' + f + '"' + (extra || '') + '>' + list.map(function (o) { return opt(o[0], o[1], v || ''); }).join('') + '</select>'; }
  function typeOpts(sel) {
    if (HK.tieOptions) return HK.tieOptions(sel);
    return HK.TIE_ORDER.map(function (id) { var d = HK.TIES[id]; return opt(id, d.label, sel); }).join('');
  }
  /* 関係の追加の欄（型・気持ち・様子・愛憎。ties.js の HK.tieExtra）。許嫁は二人それぞれの気持ち */
  function extraSels(t, k, attr) {
    /* hide の欄（敵対の度合い「憎悪」）は出さない（保存済みの値はそのまま残って効く）。愛憎の欄は、一人目・二人目を名前で出す */
    var pw = '';
    return (HK.tieExtra ? HK.tieExtra(t.type) : []).filter(function (x) { return !x.hide; }).map(function (x) {
      var who = x.who ? byId(x.who === 'a' ? t.a : t.b) : null, v = t[x.f] || (t.type === 'fiance' ? 'eager' : '');
      var na = (byId(t.a) || {}).name, nb = (byId(t.b) || {}).name;
      /* 過去の欄（一人目から・二人目から）は、見る人の名前を欄の名前にして、二つを一段（.gtpw）にまとめる */
      var ar = who ? who.name + 'の気持ち' : x.from ? ((x.from === 'a' ? na : nb) || (x.from === 'a' ? '一人目' : '二人目')) + 'から見た過去' : x.aria;
      var h = '<select ' + attr + ' data-xf="' + x.f + '" data-k="' + k + '" aria-label="' + esc(ar) + '"' + (x.from ? ' title="' + esc(PAST_SYM) + '"' : '') + '>' + x.order.map(function (id) { return opt(id, (who ? who.name + 'の気持ち：' : '') + (HK.tieExtraLabel ? HK.tieExtraLabel(x, id, na, nb) : x.map[id].label), v); }).join('') + '</select>';
      if (!x.from) return h;
      pw += h;
      return x.from === 'b' ? '<div class="gtpw">' + pw + '</div>' : '';
    }).join('');
  }
  UI.extraSels = extraSels;
  var PAST_SYM = '過去は二人それぞれから選べます。昔は仲が良かった・昔は敵だった は向きが無いので、どちらか片方で選べば二人ともに効きます';
  /* 関係1本を1枠に描く（2026-10-28 担当MA）：1行目「関係の種類・向き・外す」、2行目「恋愛・仲・過去・出来事」などの小さな欄（狭い幅では折り返す）、
     その下に続柄（きょうだい）と説明（1行で省略。押すと全文）。恋愛の欄はどの関係にもある（ui-ties.js の HK.TiesUI.love） */
  function tieRow(c, o, t, k) {
    var D = HK.TIES[t.type], L = HK.TiesUI && HK.TiesUI.love, CO = HK.coldOpts ? HK.coldOpts(t.type) : null;
    var h = '<div class="gtc" data-k="' + k + '"><div class="gth">' +
      '<select data-gf="ttype" data-k="' + k + '" aria-label="' + esc(o.name) + 'との関係の種類">' + typeOpts(t.type) + '</select>';
    if (D.dir) h += '<select data-gf="tdir" data-k="' + k + '" aria-label="関係の向き">' + opt('a', c.name + 'が' + D.roleA, t.a === c.id ? 'a' : 'b') + opt('b', c.name + 'が' + D.roleB, t.a === c.id ? 'a' : 'b') + '</select>';
    h += '<button type="button" class="btn ghost small gtx" data-gact="tdel" data-k="' + k + '" aria-label="' + esc(o.name) + 'との「' + esc(D.label) + '」を外す">外す</button></div><div class="gtf">';
    if (L) h += L.sel(t, 'class="gtlove" data-gf="tlove" data-k="' + k + '"');
    else if ((D.family && !D.loveOK) || D.loveOpt) h += '<select data-gf="tlove" data-k="' + k + '" aria-label="恋愛">' + opt('', '恋愛：なし', t.love || '') + opt('ok', '恋愛：あり', t.love || '') + '</select>';
    if (CO) h += '<select data-gf="tcold" data-k="' + k + '" aria-label="' + CO.aria + '">' + CO.order.map(function (id) { return opt(id, CO.map[id].label, t.cold || ''); }).join('') + '</select>';
    h += extraSels(t, k, 'data-gf="textra"') + '</div>';
    /* 過去に向きの無い札（昔は仲が良かった・昔は敵だった）を選んだときだけ、片方で足りることを添える */
    if ([t.past, t.pastB].some(function (v) { return HK.TIE_PAST && HK.TIE_PAST[v] && HK.TIE_PAST[v].sym; })) h += '<p class="gearhint gpast">' + esc(PAST_SYM) + '</p>';
    /* きょうだい：続柄と呼び方（自動のときは「自動（姉）」）、注意（年齢が未設定・同じ年齢・庇護の向きと年齢が逆）。sib-word.js */
    var sb = HK.Sib && HK.Sib.ui ? HK.Sib.ui(c, o, t) : null;
    /* 続柄：上下の欄（elder）で決めたときは「姉（上下の設定）」、上下なしは「上下なし（姉妹）」、ほかは「自動（姉）」 */
    if (sb) h += '<p class="gearhint gsib">続柄：' + esc(sb.src === 'none' ? '上下なし（' + sb.pair + '）' : sb.src === 'set' && sb.rel ? sb.rel + '（上下の設定）' : sb.rel ? '自動（' + sb.rel + '）' : '自動（決まっていません）') + '　呼び方：' + esc(sb.auto ? '自動（' + sb.call + '）' : sb.call ? sb.call : '名前（' + o.name + '）') +
      (sb.notes.length ? '<br>' + esc(sb.notes.join('。')) + '。' : '') + '</p>';
    var ln = L ? L.note(t) : '', d = (D.effect || '') + (ln ? '。' + ln : '');
    return h + (d ? '<p class="gearhint gtd" title="' + esc(d) + '">' + esc(d) + '</p>' : '') + '</div>';
  }
  /* 関係を付けずに出した相手ごとの行（窓を開いているあいだだけ。何か決めれば、関係がなくても行は残る） */
  var extra = {};
  function extraOf(c) { return extra[c.id] || {}; }
  function body(c) {
    var s = S(), others = s.chars.filter(function (x) { return x !== c; });
    lazyIn = {}; lazyMany = others.length > 60;
    var ld = '';
    /* r18:begin */
    /* 性欲の強さ「なし」：合意のある夜に効く欄を暗くする（attr.js の A.libDim。値は消さない） */
    ld = HK.Attr && HK.Attr.libDim ? HK.Attr.libDim(c) : '';
    /* r18:end */
    /* 恋愛・R18にしない相手（苦手な組み合わせ）。どちらに付けても、二人のあいだでは恋愛・R18の場面が起きない */
    /* 相手を選ぶ折りたたみ（複数可）：恋愛相手の固定・性行為の相手・恋愛にしない相手。住人が多くても伸びないよう、基本は閉じる */
    var cbs = function (gf, ids) { return others.map(function (o) { return '<label><input type="checkbox" data-gf="' + gf + '" data-o="' + esc(o.id) + '"' + ((ids || []).indexOf(o.id) >= 0 ? ' checked' : '') + '> ' + esc(o.name) + '</label>'; }).join(''); };
    var sumOf = function (ids, none) { var n = namesOf(ids); return n.length ? n.join('・') + (n.length > 1 ? '（' + n.length + '人）' : '') : none; };
    var ngRow = others.length ? det('ng', HK.SAFE_ON ? '恋愛にしない相手' : '恋愛・R18にしない相手', sumOf(c.loveNG, 'なし'), cbs('ng', c.loveNG)) : '';
    var lockBox = others.length ? det('lock', '恋愛相手を固定', sumOf(c.loveLock, '固定しない'), cbs('lockc', c.loveLock)) : '';
    var sexSel = '', sexBox = '';
    /* r18:begin */
    /* 性行為の相手の固定（R18版のみ）：恋愛は縛らず、体の関係（夜・R18の場面）だけをこの相手に限る */
    if (!HK.SAFE_ON) {
      sexSel = '<label' + ld + ' title="固定した相手だけ：住人では選んだ相手とだけ体の関係になり、モブ・魔物など住人でない相手ともなりません（マッサージはふつうの施術、感覚遮断穴は壁の向こうの手を追い払います）。固定した相手＋モブ：住人では選んだ相手とだけ、モブとの場面はふつうに起きます">性行為の相手を固定 <select data-gf="sexlock" aria-label="性行為の相手の固定"><option value="">恋愛相手の固定に合わせる</option>' + opt('any', '誰とでも可（恋愛は固定のまま）', c.sexLock || '') + (others.length ? opt('pick', '固定した相手だけ', c.sexLock || '') + opt('pickMob', '固定した相手＋モブ', c.sexLock || '') : '') + '</select></label>';
      if ((c.sexLock === 'pick' || c.sexLock === 'pickMob') && others.length) sexBox = '<div' + ld + '>' + det('sex', '性行為の相手', sumOf(c.sexLocks, 'まだ選んでいません'), cbs('sexlockc', c.sexLocks)) + '</div>';
    }
    /* r18:end */
    /* R18版だけの欄：体と設定の「性器の呼び方」、恋愛と夜の「ふたなり・モブには・R18に参加しない・濁点喘ぎ」 */
    var partRow = '', r18Row = '';
    /* r18:begin */
    if (!HK.SAFE_ON) {
      partRow = '<div class="gearrow' + (ld ? ' gdim' : '') + '"><label title="R18の場面で、性器をどう呼ぶか。台詞はその人の言葉づかい、地の文はその人の体の描写に使います（名前の書かれていない文は、その場の様子から誰の体か一人に決まるときだけ変えます。自由記入の語は、その人の体にだけ使います）">性器の呼び方 ' + selOf('partWords', [['', 'おまかせ（文のまま）'], ['soft', 'ぼかす'], ['direct', '直接的'], ['medical', '医学的']], c.partWords || '') + '</label>' +
        '<label title="空なら上の作風のまま。決めると、作風より優先します">男性器 <input type="text" data-gf="partM" value="' + esc(c.partM || '') + '" maxlength="10" placeholder="自由に" style="width:6em"></label>' +
        '<label title="空なら上の作風のまま。決めると、作風より優先します">女性器 <input type="text" data-gf="partF" value="' + esc(c.partF || '') + '" maxlength="10" placeholder="自由に" style="width:6em"></label></div>';
      r18Row = (c.gender === 'f' && (c.pos === 'top' || c.pos === 'riba') ? '<label' + ld + ' title="攻めに回る場面を、男性の体を前提にした描写で書きます。オメガバースでは使いません"><input type="checkbox" data-gf="futa"' + (c.futa ? ' checked' : '') + '> ふたなり（攻めのとき）</label>' : '') +
        '<label' + ld + ' title="モブ・魔物・村人・略奪者・罠・星の生命体など、住人でない相手との場面だけの受け攻めです（住人どうしは上の受け攻めのまま）。住人と同じなら上の受け攻めに従います。受け・リバを選ぶと、住人には攻めの人でもモブには受けます。攻めを選ぶと、住人には受けの人でもモブには受けません">モブ相手の受け攻め <select data-gf="posNpc" aria-label="モブ・魔物が相手のときの受け攻め">' + (HK.Pos ? HK.Pos.NPC_OPTS : [['', '住人と同じ']]).map(function (x) { return opt(x[0], x[1], (HK.Pos ? HK.Pos.npcValid(c.posNpc) : '')); }).join('') + '</select></label>' +
        '<label title="受けも攻めもせず、住人どうしの夜・モブや魔物に襲われる場面・執着の監禁の夜に出ません。殺し合いなどほかの出来事にはふつうに出ます。R18が中心の箱庭（エロトラップダンジョン・感覚遮断穴・常識改変・サキュバスの一夜・エロバラエティ・マッサージ）では効きません"><input type="checkbox" data-gf="noR18"' + (c.noR18 ? ' checked' : '') + '> R18に参加しない</label>' +
        /* 三人の場面（3P）：する／しない（attr.js の A.TRIO。判定は pos.js の HK.Pos.trioOptOut・trioPlan。2026-10-27 担当HN） */
        (HK.Attr && HK.Attr.TRIO ? '<label' + ld + ' title="出られない部屋・ロッカー・吹雪の館・エロトラップダンジョンなどの三人以上の場面（3P）に加わるかです。する（既定）でも、性行為の相手を固定している人は固定した相手とだけ触れ合います（受けなら固定した相手からだけ受けます）。直接触れ合えない二人は、同じ場にいても見ている・声をかける程度です。直接触れ合える組が一つしかないときは、三人の場面にならず二人の場面になります。しないにすると、三人以上の場面には加わりません">三人の場面（3P） ' + selOf('trio', HK.Attr.TRIO, c.trio || '') + '</label>' : '') +
        (c.pos !== 'top' ? '<label' + ld + ' title="男性向けの作風で、絶頂や奥を深く突かれた場面の喘ぎを、あ゛・お゛のような濁点の喘ぎにします"><input type="checkbox" data-gf="daku"' + (c.daku ? ' checked' : '') + '> 濁点喘ぎ（男性向け）</label>' : '') +
        /* 性欲の強さ（全住人）・体の関係の相手（恋愛対象「なし」の人だけ）。attr.js の A.LIBIDO・A.SEXLIKES、判定は pos.js（2026-10-27 担当HG） */
        (HK.Attr && HK.Attr.LIBIDO ? '<label title="恋人の夜・勢いの夜・一夜・セフレ・出られない部屋の条件のエッチ・発情の相手を受け入れる・危機の夜・お持ち帰りなど、合意のある体の場面の起こりやすさが変わります（弱いは半分ほど、強いは1.6倍ほど。二人とも強いともっと起きやすい）。なしにすると、合意のある体の場面には乗りません（恋愛はふつうに起きます）。内容のスイッチ「合意のない展開」の場面は、この欄に関係なく起きます">性欲の強さ ' + selOf('libido', HK.Attr.LIBIDO, c.libido || '') + '</label>' : '') +
        (c.likes === 'none' && HK.Attr && HK.Attr.SEXLIKES ? '<label' + ld + ' title="恋愛対象「なし」の人は恋愛（告白・恋人・片想い）にはなりませんが、体だけの関係（セフレ・一夜・勢いの夜・危機の夜・部屋の条件など）にはなれます。その相手の性別を選びます。おまかせは相手の恋愛対象・受け攻めに合わせます。なしにすると、体の関係にもなりません（合意のない展開の場面でも）">体の関係の相手 ' + selOf('sexLikes', HK.Attr.SEXLIKES, c.sexLikes || '') + '</label>' : '');
      if (r18Row) r18Row = '<div class="gearrow">' + r18Row + '</div>' +
        (ld ? '<p class="gearhint glibnote" data-note="libido">性欲が「なし」なので、合意のある夜の出来事は起きません（恋愛は起きます。内容のスイッチ「合意のない展開」の場面はスイッチどおり）。暗くした欄の値は残してあり、性欲を戻すと元どおり効きます（合意のない展開の場面には、いまも効きます）。</p>' : '');
    }
    /* r18:end */
    var nightRow = HK.Attr && HK.Attr.nightHtml ? HK.Attr.nightHtml(c, { esc: esc, opt: opt, selOf: selOf, byId: byId }) : '';
    /* 相手ごとの設定（関係・呼び方・二人称/一人称・受け攻め・夜の性格） */
    var ties = s.ties || [], groups = {};
    ties.forEach(function (t, k) {
      var oid = t.a === c.id ? t.b : t.b === c.id ? t.a : null;
      if (!oid) return;
      (groups[oid] = groups[oid] || []).push([t, k]);
    });
    var calls = c.calls || {};
    var ex = extraOf(c);
    var rel = others.filter(function (o) { return groups[o.id] || calls[o.id] || ex[o.id] || (HK.Attr && HK.Attr.hasVoiceFor(c, o.id)) || o.same === c.id; }).map(function (o) {
      var note = HK.Attr && HK.Attr.forNote ? HK.Attr.forNote(c, o) : '';
      /* 同一人物・闇堕ちVer（以前は「体と設定」。attr.js の A.sameForHtml・A.sameNote。2026-10-27 担当HK） */
      var sameH = HK.Attr && HK.Attr.sameForHtml ? '<div class="one">' + HK.Attr.sameForHtml(c, o, { esc: esc }) + '</div>' : '', sameN = HK.Attr && HK.Attr.sameNote ? HK.Attr.sameNote(c, o) : '';
      var i = s.chars.indexOf(o);
      return '<div class="gtie"><div class="who">' + HK.Icons.html(o.name, i, 22) + esc(o.name) + '</div>' +
        (groups[o.id] || []).map(function (x) { return tieRow(c, o, x[0], x[1]); }).join('') +
        '<div class="one"><label>' + esc(c.name) + 'からの呼び方 <input type="text" data-gf="callone" data-o="' + o.id + '" value="' + esc(calls[o.id] || '') + '" maxlength="16" placeholder="' + esc(o.name + ({ name: '', san: 'さん', kun: 'くん', chan: 'ちゃん', sama: '様', senpai: '先輩', sensei: '先生' }[c.call] || '')) + '"></label>' + (HK.Attr && HK.Attr.voiceForHtml ? HK.Attr.voiceForHtml(c, o, esc) : '') +
        (HK.Attr && HK.Attr.forHtml ? '<span class="gforh">この人には：</span>' + HK.Attr.forHtml(c, o, { esc: esc, opt: opt }) : '') +
        '<button type="button" class="btn ghost small" data-gact="tadd" data-o="' + o.id + '">関係を重ねる</button></div>' + (note ? '<p class="gearhint gfnote">' + esc(note) + '</p>' : '') +
        sameH + (sameN ? '<p class="gearhint gsame">' + esc(sameN) + '</p>' : '') + '</div>';
    }).join('');
    /* 憎悪を持っても殺さない相手（どちらに付けても、二人のあいだでは殺す場面が思いとどまる場面になる。attr.js の HK.Attr.noKillPair） */
    /* 憎悪を持っても殺さない相手：折りたたみ（基本は閉じる）。説明は TIPS の「相手ごとの設定」に */
    var nkRow = others.length ? det('nk', '憎悪を持っても殺さない相手', sumOf(c.noKillFor, 'なし'), cbs('nokill', c.noKillFor)) : '';
    /* 住人が多いときは、相手の欄を最初の人だけで描き、触れたときに全員を入れる（ui-cast-pages.js の lazyAttr） */
    var newoAll = others.map(function (o) { return opt(o.id, o.name, ''); }).join(''), newoLz = others.length && lazyMany && HK.CastPages && HK.CastPages.lazyAttr;
    var addable = others.length ? '<div class="gearrow"><label>相手 <select data-gf="newo" aria-label="関係の相手"' + (newoLz ? HK.CastPages.lazyAttr(newoAll) + '>' + opt(others[0].id, others[0].name, '') : '>' + newoAll) + '</select></label>' +
      '<label>関係 <select data-gf="newt" aria-label="関係の種類">' + typeOpts('friend') + opt('', '（関係は付けずに相手ごとの設定だけ）', 'friend') + (HK.Attr && HK.Attr.sameForHtml ? opt('__same', '同一人物（別の世界・別の時間の自分）', 'friend') : '') + '</select></label>' + (function () { var gm = groupMates(c); return gm.length ? '<label title="' + esc('同じグループ（' + grpsOf(c).join('・') + '）の全員に、選んだ関係を付けます：' + gm.map(function (o) { return o.name; }).join('・') + '。向きのある関係は、' + c.name + 'が左（上司・先輩・師匠など）になります') + '"><input type="checkbox" data-gf="newgrp"> グループの全員と（' + gm.length + '人）</label>' : ''; })() + '<button type="button" class="btn small" data-gact="tnew">追加</button></div>' : '<p class="gearhint">ほかの住人がいません。</p>';
    return '<div class="gearhd">' + HK.Icons.html(c.name, s.chars.indexOf(c), 36) + '<h2 id="geartitle">' + esc(c.name) + 'の設定</h2><button type="button" class="btn small" data-gact="close">閉じる</button></div>' +
      /* 固定の説明は各節の ？（TIPS）に置き、ここには選んだものによって変わる説明（口調・関係・この住人の傾向）だけを出す */
      (HK.egoDesc ? '<details class="gego"' + (egoOpen ? ' open' : '') + '><summary>この住人の傾向<span class="gegc">' + esc(HK.toCode(c.eg)) + '・' + esc(HK.egoAttWord(c)) + '</span></summary><ul id="egodesc">' + HK.egoDesc(c).map(function (l) { return '<li>' + esc(l) + '</li>'; }).join('') + '</ul></details>' : '') +
      /* ①口調：口調〜語尾の設定（かんたん）の欄（ui-voice.js の VS.basicHtml を「口調・喘ぎの設定」と共用）と、そこでだけ決める欄の要約・「口調・喘ぎをより細かく設定する」のボタン */
      (function () {
        var VS = HK.VoiceSet, ms = VS && VS.moreSum ? VS.moreSum(c) : '';
        return '<div class="gearsec" data-vroot><h3>口調' + (HK.Tips ? HK.Tips.btn('gear-talk') : '') + '</h3>' + (VS && VS.basicHtml ? VS.basicHtml(c) : '') +
          '<p class="gearhint">口調の辞書・呼び方・敬語などのほかの欄は「' + esc(VS ? VS.LABEL : '口調の設定') + '」で決めます' + (ms ? '（いま：' + esc(ms) + '）' : '') + '。</p>' +
          '<div class="gearrow"><button type="button" class="btn small" data-gact="tovoice">' + esc(VS ? VS.MORE : '口調をより細かく設定する') + '</button></div></div>';
      })() +
      /* ②プロフィール：性別・誕生月・年齢・お酒・恋愛対象・色 */
      '<div class="gearsec"><h3>プロフィール' + (HK.Tips ? HK.Tips.btn('gear-profile') : '') + '</h3><div class="gearrow"><label>性別 ' + selOf('gender', GENDERS, c.gender) + '</label>' +
        '<label>恋愛対象 ' + selOf('likes', LIKES, c.likes) + '</label>' +
        '<label>誕生月 ' + selOf('bmonth', [['', '決めない']].concat([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(function (m) { return [String(m), m + '月']; })), c.bmonth || '') + '</label>' +
        '<label>年齢 <input type="number" data-gf="age" min="1" max="150" value="' + esc(c.age || '') + '" placeholder="決めない" style="width:5em"></label>' +
        '<label title="酒の強さ。合コン・出られない部屋の酒・オメガバースの飲みの場面・邪神村の歓迎の宴や御神酒などで、酔いやすさや振る舞いが変わります。おまかせは気質から決まります">お酒 ' + selOf('alcohol', [['', 'おまかせ'], ['1', '弱い'], ['2', 'やや弱い'], ['3', 'ふつう'], ['4', '強い'], ['5', 'ザル']], c.alcohol || '') + '</label></div>' +
      '<div class="gearrow"><label><input type="checkbox" data-gf="colorauto"' + (c.color ? '' : ' checked') + '> イメージカラーは自動（並び順の色）</label><label>色 <input type="color" data-gf="color" value="' + esc(c.color || '#3d6f93') + '"' + (c.color ? '' : ' disabled') + ' aria-label="イメージカラー"></label></div></div>' +
      /* ③体と設定：体格・種族・心の強さ・好物（R18版：胸・性器・性器の呼び方）。同一人物は⑤相手ごとの設定の行に */
      '<div class="gearsec"><h3>体と設定' + (HK.Tips ? HK.Tips.btn('gear-body') : '') + '</h3>' + (HK.Attr ? HK.Attr.gearHtml(c, others, { esc: esc, opt: opt, selOf: selOf }) : '') + partRow + '</div>' +
      /* ③'箱庭の能力：箱庭をまたいで共通の能力値・欄（体力・運・推理力・特殊役職 など。shared-stats.js） */
      (HK.Shared && HK.Shared.shown().length ? '<div class="gearsec"><h3>箱庭の能力' + (HK.Tips ? HK.Tips.btn('gear-ab') : '') + '</h3>' + HK.Shared.gearHtml(c, { esc: esc, opt: opt }) + '</div>' : '') +
      /* ④恋愛（R18版は恋愛と夜）：受け攻め・恋愛相手の固定・一途・恋愛にしない相手（R18：性行為の相手の固定・R18に参加しない・夜の性格・ふたなり など） */
      '<div class="gearsec"><h3>' + (HK.SAFE_ON ? '恋愛' : '恋愛と夜') + (HK.Tips ? HK.Tips.btn('gear-love') : '') + '</h3>' +
      '<div class="gearrow"><label>受け攻め ' + selOf('pos', POS, c.pos) + '</label>' +
        nightRow + '</div>' +
      '<div class="gearrow">' + sexSel + '<label title="恋人ができたら、その恋人がいる間は、ほかの人と恋愛・夜の場面になりません（浮気しない）。恋人がいないうちは、ふつうに恋をします"><input type="checkbox" data-gf="faithful"' + (c.faithful ? ' checked' : '') + '> 一途（恋人ができたら、ほかの人に惹かれない・浮気しない）</label></div>' + r18Row +
      lockBox + sexBox + ngRow + '</div>' +
      /* ⑤相手ごとの設定：関係・呼び方・二人称/一人称・受け攻め・夜の性格・同一人物（闇堕ちVer） */
      '<div class="gearsec"><h3>相手ごとの設定' + (HK.Tips ? HK.Tips.btn('gear-ties') : '') + '</h3>' + nkRow + (rel || '<p class="gearhint">まだ相手ごとの設定はありません。下の「相手」と「関係」を選んで追加してください（関係を付けずに、受け攻めや呼び方だけを決めることもできます）。</p>') + addable + '</div>';
  }
  function render() {
    var c = byId(cur);
    if (!c) { close(); return; }
    var box = ov.querySelector('.gearbox'), y = ov.scrollTop;
    box.innerHTML = body(c);
    /* 住人が多いとき（61人以上）：住人を選ぶ欄に「名前で探す」、住人を並べたチェックの一覧に「名前で絞り込む」を添える（ui-cast-pages.js） */
    if (HK.CastPages) HK.CastPages.after(box);
    /* ①口調の台詞の見本を切り替える（ui-voice.js） */
    if (HK.VoiceSet && HK.VoiceSet.sampleTick) HK.VoiceSet.sampleTick();
    ov.scrollTop = y;
  }
  function open(id, from) {
    if (cur !== id) { egoOpen = true; extra = {}; openMap = {}; }
    cur = id; opener = from || null;
    if (!ov) {
      ov = document.createElement('div');
      ov.className = 'gearov';
      ov.innerHTML = '<div class="gearbox" role="dialog" aria-modal="true" aria-labelledby="geartitle"></div>';
      document.body.appendChild(ov);
      ov.addEventListener('toggle', function (e) { if (e.target.classList && e.target.classList.contains('gego')) egoOpen = e.target.open; }, true);
      ov.addEventListener('toggle', function (e) { if (e.target.classList && e.target.classList.contains('gdet')) openMap[e.target.dataset.k] = e.target.open; }, true);
      /* 開いたら、入れずにおいた一覧の中身を入れる（上の lazyIn） */
      ov.addEventListener('toggle', function (e) {
        var d = e.target, k = d.classList && (d.classList.contains('gdet') ? d.dataset.k : null), box = k && d.open && lazyIn[k] != null ? d.querySelector('.gearrow') : null;
        if (!box) return;
        box.innerHTML = lazyIn[k]; delete lazyIn[k];
        if (HK.CastPages) HK.CastPages.after(d);
      }, true);
    }
    ov.hidden = false;
    document.body.style.overflow = 'hidden';
    render();
    var f = ov.querySelector('select,input,button'); if (f) f.focus();
  }
  function close() {
    if (ov) ov.hidden = true;
    document.body.style.overflow = '';
    cur = null;
    UI.renderCast();
    UI.applyColors(S().chars);
    var b = opener && document.querySelector('.res[data-id="' + opener + '"] .gearbtn');
    if (b) b.focus();
  }
  function changed(rerender) { UI.save(); if (rerender) render(); }

  document.addEventListener('click', function (ev) {
    var g = ev.target.closest && ev.target.closest('[data-act="gear"]');
    if (g) { var row = g.closest('.res'); if (row) open(row.dataset.id, row.dataset.id); return; }
    if (!ov || ov.hidden) return;
    if (ev.target === ov) { close(); return; }
    /* 関係の枠の説明：押すと全文（もう一度押すと1行に戻す） */
    var gd = ev.target.closest && ev.target.closest('.gtie .gtd');
    if (gd) { gd.classList.toggle('open'); return; }
    var b = ev.target.closest('[data-gact]');
    if (!b) return;
    var c = byId(cur), s = S(), act = b.dataset.gact;
    if (!c) return;
    s.ties = s.ties || [];
    if (act === 'close') close();
    /* 「口調・喘ぎをより細かく設定する」：窓を閉じて、住人タブの節をこの住人にして開く（ui-voice.js） */
    else if (act === 'tovoice') { var vid = c.id; close(); if (HK.VoiceSet) HK.VoiceSet.open(vid); }
    else if (act === 'tdel') { s.ties.splice(+b.dataset.k, 1); changed(true); }
    else if (act === 'tadd' || act === 'tnew') {
      var oid = act === 'tadd' ? b.dataset.o : (ov.querySelector('[data-gf="newo"]') || {}).value;
      var ty = act === 'tadd' ? 'friend' : (ov.querySelector('[data-gf="newt"]') || {}).value;
      if (ty == null) ty = 'friend';
      /* 「関係は付けずに相手ごとの設定だけ」：行だけ出す（グループの全員にも） */
      /* 「同一人物」：関係ではなく、住人の同一人物（c.same）にする。行の「同一人物」のチェックと同じ（attr.js の A.gearField） */
      if (act === 'tnew' && ty === '__same') {
        if (!oid || !byId(oid)) return;
        (extra[c.id] = extra[c.id] || {})[oid] = 1;
        HK.Attr.gearField(c, 'at_sameC', { checked: true, dataset: { o: oid } }, false, changed, byId);
        UI.toast('「' + c.name + '」を「' + byId(oid).name + '」と同一人物にしました');
        return;
      }
      if (act === 'tnew' && ty === '') {
        var ids = (ov.querySelector('[data-gf="newgrp"]') || {}).checked ? groupMates(c).map(function (o) { return o.id; }) : [oid];
        ids.forEach(function (id) { if (byId(id)) (extra[c.id] = extra[c.id] || {})[id] = 1; });
        render(); return;
      }
      var dupOf = function (x, o2) { return s.ties.some(function (t) { return t.type === x && ((t.a === c.id && t.b === o2) || (t.a === o2 && t.b === c.id)); }); };
      /* 「グループの全員と」：同じグループの全員に、選んだ関係を付ける（すでに同じ関係がある相手は飛ばす） */
      var allG = act === 'tnew' && (ov.querySelector('[data-gf="newgrp"]') || {}).checked;
      if (allG) {
        var gm = groupMates(c), nadd = 0;
        gm.forEach(function (o) { if (!dupOf(ty, o.id)) { s.ties.push({ a: c.id, b: o.id, type: ty }); nadd++; } });
        UI.toast(nadd ? 'グループの' + nadd + '人に「' + HK.TIES[ty].label + '」を付けました' + (gm.length > nadd ? '（' + (gm.length - nadd) + '人はすでに付いていました）' : '') : 'グループの全員に、すでに「' + HK.TIES[ty].label + '」が付いています');
        if (nadd) changed(true);
        return;
      }
      if (!oid || !byId(oid)) return;
      var dup = function (x) { return dupOf(x, oid); };
      if (dup(ty)) {
        /* 同じ関係がすでにある：まだ付いていない関係に替えて足す（行の種類はあとから変えられる） */
        var alt = HK.TIE_ORDER.filter(function (x) { return HK.TIES[x] && !dup(x); })[0];
        if (!alt) { UI.toast('この二人に足せる関係がもうありません'); return; }
        UI.toast('「' + HK.TIES[ty].label + '」はすでにあるので「' + HK.TIES[alt].label + '」で追加しました。種類は行で変えられます');
        ty = alt;
      }
      s.ties.push({ a: c.id, b: oid, type: ty });
      changed(true);
    }
  });
  document.addEventListener('keydown', function (ev) {
    if (ov && !ov.hidden && ev.key === 'Escape') { ev.preventDefault(); close(); }
  });
  function onField(ev) {
    var t = ev.target, f = t.dataset && t.dataset.gf;
    if (!f || !ov || ov.hidden) return;
    var c = byId(cur), s = S();
    if (!c) return;
    var tie = t.dataset.k != null ? (s.ties || [])[+t.dataset.k] : null;
    var isInput = ev.type === 'input';
    /* 同一人物のチェックを外しても、窓を開いているあいだは相手の行を残す */
    if (f === 'at_sameC' && t.dataset.o) (extra[c.id] = extra[c.id] || {})[t.dataset.o] = 1;
    /* ①口調の欄（口調・一人称・二人称・語尾の記号・語尾の設定（かんたん））は「口調・喘ぎの設定」と同じ処理（ui-voice.js）。怒ったとき／恋人になってからの一人称・名前の読みは下の HK.Attr */
    if (HK.VoiceSet && HK.VoiceSet.basicField && HK.VoiceSet.basicField(c, f, t, isInput, changed)) return;
    if (HK.Attr && HK.Attr.gearField(c, f, t, isInput, changed, byId)) return;
    if (HK.Shared && HK.Shared.gearField(c, f, t, isInput, changed)) return;
    switch (f) {
      case 'gender': case 'likes': if (isInput) return; c[f] = t.value; changed(false); if (f === 'gender') render(); else if (!HK.SAFE_ON) render(); break;
      /* 体の関係の相手・性欲の強さ（R18版。attr.js の値の一覧で確かめる） */
      case 'sexLikes': case 'libido': if (isInput) return; c[f] = HK.Attr && HK.Attr.label(f, t.value) && t.value ? t.value : ''; changed(f === 'libido'); break;
      case 'bmonth': if (isInput) return; c.bmonth = t.value; changed(false); break;
      case 'age': c.age = +t.value >= 1 && +t.value <= 150 ? String(Math.floor(+t.value)) : ''; changed(false); break;
      case 'pos': if (isInput) return; c.pos = ['top', 'bottom', 'riba'].indexOf(t.value) >= 0 ? t.value : ''; changed(false); render(); break;
      case 'futa': if (isInput) return; c.futa = t.checked; changed(false); break;
      case 'daku': if (isInput) return; c.daku = t.checked; changed(false); break;
      case 'faithful': if (isInput) return; c.faithful = t.checked; changed(false); break;
      case 'noR18': if (isInput) return; c.noR18 = t.checked; changed(true); break;
      case 'trio': if (isInput) return; c.trio = t.value === 'no' ? 'no' : ''; changed(false); break;
      case 'partWords': if (isInput) return; c.partWords = ['soft', 'direct', 'medical'].indexOf(t.value) >= 0 ? t.value : ''; changed(true); break;
      case 'partM': c.partM = t.value.replace(/[「」『』{}]/g, '').trim().slice(0, 10); changed(false); break;
      case 'partF': c.partF = t.value.replace(/[「」『』{}]/g, '').trim().slice(0, 10); changed(false); break;
      case 'alcohol': if (isInput) return; c.alcohol = HK.ALC_OK(t.value) ? t.value : ''; changed(true); break;
      case 'posNpc': if (isInput) return; c.posNpc = HK.Pos ? HK.Pos.npcValid(t.value) : ''; changed(false); break;
      case 'colorauto': if (isInput) return; if (t.checked) c.color = ''; else c.color = (ov.querySelector('[data-gf="color"]') || {}).value || '#3d6f93'; changed(true); UI.applyColors(s.chars); break;
      case 'color': if (/^#[0-9a-fA-F]{6}$/.test(t.value)) { c.color = t.value; UI.applyColors(s.chars); changed(false); } break;
      /* 恋愛相手の固定（複数可）：印を付けた相手は「恋愛にしない相手」から外す */
      case 'lockc': if (isInput) return; (function () {
        var o = byId(t.dataset.o); if (!o) return;
        c.loveLock = (c.loveLock || []).filter(function (k) { return k !== o.id; });
        if (t.checked) { c.loveLock.push(o.id); c.loveNG = (c.loveNG || []).filter(function (k) { return k !== o.id; }); o.loveNG = (o.loveNG || []).filter(function (k) { return k !== c.id; }); }
        changed(true);
      })(); break;
      case 'sexlock': if (isInput) return; c.sexLock = ['any', 'pick', 'pickMob'].indexOf(t.value) >= 0 ? t.value : ''; if (c.sexLock !== 'pick' && c.sexLock !== 'pickMob') c.sexLocks = []; else openMap.sex = true; changed(true); break;
      case 'sexlockc': if (isInput) return; (function () {
        var o = byId(t.dataset.o); if (!o) return;
        c.sexLocks = (c.sexLocks || []).filter(function (k) { return k !== o.id; });
        if (t.checked) c.sexLocks.push(o.id);
        changed(true);
      })(); break;
      case 'ng': if (isInput) return; (function () {
        var o = byId(t.dataset.o); if (!o) return;
        c.loveNG = (c.loveNG || []).filter(function (k) { return k !== o.id; }); o.loveNG = (o.loveNG || []).filter(function (k) { return k !== c.id; });
        if (t.checked) {
          c.loveNG.push(o.id); o.loveNG.push(c.id);
          c.loveLock = (c.loveLock || []).filter(function (k) { return k !== o.id; }); o.loveLock = (o.loveLock || []).filter(function (k) { return k !== c.id; });
          c.sexLocks = (c.sexLocks || []).filter(function (k) { return k !== o.id; }); o.sexLocks = (o.sexLocks || []).filter(function (k) { return k !== c.id; });
        }
        changed(true);
      })(); break;
      case 'nokill': if (isInput) return; (function () {
        var o = byId(t.dataset.o); if (!o) return;
        c.noKillFor = (c.noKillFor || []).filter(function (k) { return k !== o.id; }); o.noKillFor = (o.noKillFor || []).filter(function (k) { return k !== c.id; });
        if (t.checked) { c.noKillFor.push(o.id); o.noKillFor.push(c.id); }
        changed(true);
      })(); break;
      case 'callone': c.calls = c.calls || {}; if (t.value.trim()) c.calls[t.dataset.o] = t.value.trim().slice(0, 16); else delete c.calls[t.dataset.o]; changed(false); break;
      case 'ttype': if (isInput || !tie) return; tie.type = t.value; var CO = HK.coldOpts ? HK.coldOpts(t.value) : null; if (!CO || !CO.map[tie.cold || '']) delete tie.cold; if (HK.tieExtraNorm) HK.tieExtraNorm(tie); changed(true); break;
      case 'textra': if (isInput || !tie) return; (function () { var xf = t.dataset.xf; if (t.value && !(tie.type === 'fiance' && t.value === 'eager')) tie[xf] = t.value; else delete tie[xf]; })(); changed(true); break;
      case 'tdir': if (isInput || !tie) return; var me = t.value === 'a'; var o = tie.a === c.id ? tie.b : tie.a, a0 = tie.a; tie.a = me ? c.id : o; tie.b = me ? o : c.id; if (tie.a !== a0 && (tie.lh === 'a' || tie.lh === 'b')) tie.lh = tie.lh === 'a' ? 'b' : 'a'; /* 向きを入れ替えても、愛憎を持つ人は同じ人のまま */ if (tie.a !== a0 && (tie.past || tie.pastB)) { var p0 = tie.past; if (tie.pastB) tie.past = tie.pastB; else delete tie.past; if (p0) tie.pastB = p0; else delete tie.pastB; } /* 過去も、持つ人は同じ人のまま */ changed(true); break;
      case 'tlove': if (isInput || !tie) return; if (t.value === 'ok' || t.value === 'no') tie.love = t.value; else delete tie.love; changed(true); break;
      case 'tcold': if (isInput || !tie) return; if (t.value) tie.cold = t.value; else delete tie.cold; changed(false); break;
    }
  }
  document.addEventListener('input', onField);
  document.addEventListener('change', onField);
  UI.openGear = open;
  /* ui.js が先に描いた住人の行に、要約と色を反映する */
  if (UI.refresh) UI.refresh();
})();
