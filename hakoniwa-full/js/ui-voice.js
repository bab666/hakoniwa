/* 箱庭シミュレーター ui: 住人タブの「口調の設定」の節（R18版は「口調・喘ぎの設定」。ui-voice-moan.js が喘ぎの折りたたみを足す）。2026-10-28 担当LA
   ・節の頭のプルダウン「対象」で「全体（箱庭全体の既定）」か住人一人を選び、その対象の設定を 1 画面で編集する。
       全体 … 口調の決まり方の説明・口調の見本・口調を決めた住人の一覧（口調に箱庭全体の上書きは無い。adv.tone は 2026-10-26 に廃止・復活させない）と、
              HK.Adv の節（もとの箱庭タブの「高度設定」。R18版の喘ぎ声の調整・喘ぎの辞書）。保存先は今までどおり HK.store の adv（ui-adv.js）
       住人 … もとの ⚙設定の ①話し方の欄すべて（口調・一人称・二人称・怒ったとき／恋人になってからの一人称・名前の読み・語尾の記号・語尾の付け替え・
              語尾の設定・口調の辞書・基本の呼び方・敬語で話す相手）と、R18版は喘ぎの欄。保存先は今までどおり住人の c.*（欄の data-gf も同じ名前）
   ・保存の鍵も形も変えない。描くときは読むだけで、利用者が欄を変えたときだけ書く（新しい鍵への移し替え・変換はしない）。
     この節の表示の状態（選んだ対象・折りたたみの開閉）だけを表示用の保存 voiceview に置く（住人の保存 state には入れない）
   ・節の中は部品（VS.add で登録）ごとの折りたたみ。部品：{ id, label, keys（コピーする c.* の欄）, resetKeys, charHtml(c, h), globalHtml(h), field(c, f, t, isInput, changed),
       act(act, c, el), sum(c), after(c|null), toChar(c, mode, dry), fromChar(c, mode, dry), mergeAdv(id, cur, inc) }
   ・コピー・全体⇄住人・文字列で書き出す／読み込む・初期化は ui-voice-copy.js（VS.tools と VS.onTool）
   ・⚙設定の「口調・喘ぎをより細かく設定する」は VS.open(住人の id)：その住人を選んで節を開き、節の頭へ動かす
   ・口調の基本の欄（口調〜語尾の設定（かんたん））は VS.basicHtml(c)・VS.basicField(…) を、この節の「口調」と ⚙設定の「口調」（ui-gear.js）の両方から呼ぶ（2026-10-28 担当LI）。
     台詞の見本の箱は .vs-ts（data-cid の住人で描く）で、VS.sampleRefresh が両方を描き直す。語尾の設定の欄は [data-vroot] の中だけを書き換える（tone-ending.js）
   ui.js の renderCast が VS.html() を住人の一覧の下に差し込み、描いたあとに VS.after() を呼ぶ */
(function () {
  'use strict';
  var HK = window.HK, UI = HK && HK.UI;
  if (!HK || !UI || !UI.state) return;
  var esc = HK.escape;
  var VS = HK.VoiceSet = { parts: [], LABEL: '口調の設定', MORE: '口調をより細かく設定する' };
  function S() { return UI.state(); }
  function byId(id) { return id ? S().chars.filter(function (c) { return c.id === id; })[0] || null : null; }
  VS.byId = byId;
  VS.esc = esc;
  function opt(v, label, sel, title) { return '<option value="' + esc(v) + '"' + (v === sel ? ' selected' : '') + (title ? ' title="' + esc(title) + '"' : '') + '>' + esc(label) + '</option>'; }
  VS.opt = opt;
  function toneLabel(k) { var t = HK.toneInfo ? HK.toneInfo(k) : HK.PERSONA[k]; return t ? t.label : ''; }
  VS.toneLabel = toneLabel;
  function autoKey(c) { return HK.toneAuto ? HK.toneAuto(HK.traits(c.eg)) : HK.personaAuto(HK.traits(c.eg)); }

  /* ---------- 表示の状態（このブラウザだけ。住人の保存には入れない） ---------- */
  var VIEW = (function () {
    var v = null;
    try { v = HK.store ? HK.store.get('voiceview', null) : null; } catch (e) { v = null; }
    v = v && typeof v === 'object' && !Array.isArray(v) ? v : {};
    return { t: typeof v.t === 'string' ? v.t : '', fold: v.fold && typeof v.fold === 'object' ? v.fold : {} };
  })();
  function keep() { try { if (HK.store) HK.store.set('voiceview', VIEW); } catch (e) { /* 保存できなくても選べる */ } }
  /* 選んでいる住人（いなくなった人なら全体） */
  function cur() { return byId(VIEW.t); }
  VS.cur = cur;
  function foldKey(c, id) { return (c ? 'c:' : 'a:') + id; }
  function isOpen(c, id) { var v = VIEW.fold[foldKey(c, id)]; return v == null ? id === 'tone' || !c : !!v; }

  /* ---------- 部品の登録 ---------- */
  VS.add = function (p) {
    if (!p || !p.id || VS.parts.some(function (x) { return x.id === p.id; })) return;
    VS.parts.push(p);
  };
  VS.part = function (id) { return VS.parts.filter(function (p) { return p.id === id; })[0] || null; };

  /* ---------- 見た目 ---------- */
  var css = '#vs-panel .vs-head{display:flex;flex-wrap:wrap;gap:8px 12px;align-items:center}#vs-panel .vs-head label{display:flex;flex-wrap:wrap;gap:6px;align-items:center;font-weight:600;min-width:0;max-width:100%}' +
    '#vs-panel .vs-head select{max-width:100%;min-width:0}#vs-panel .vs-head .cpfind{width:10em;max-width:100%}' +
    '#vs-panel .vs-tools{display:flex;flex-wrap:wrap;gap:6px;margin:10px 0 4px}#vs-panel .vs-tools .btn{white-space:normal;text-align:left;border:1px solid var(--line2,var(--line));padding:4px 10px;line-height:1.5;min-height:0}' +
    '#vs-panel .vs-lead{margin:8px 0 0}#vs-panel details.vsf{margin:12px 0 0;border:1px solid var(--line);border-radius:var(--r-card,6px);padding:6px 12px 10px;min-width:0}' +
    '#vs-panel details.vsf>summary{cursor:pointer;font-weight:700;padding:4px 0;font-size:15px}#vs-panel details.vsf>summary .vsum{font-weight:400;font-size:12px;color:var(--muted);margin-left:8px}' +
    '#vs-panel .gearrow{display:flex;flex-wrap:wrap;gap:8px 12px;align-items:center;margin:6px 0}#vs-panel .gearrow label{font-size:13px;color:var(--muted);display:flex;gap:6px;align-items:center;flex-wrap:wrap;min-width:0;max-width:100%}' +
    '#vs-panel .gearrow select,#vs-panel .gearrow input[type=text]{max-width:100%;min-width:0}#vs-panel .gearrow input[type=text]{min-width:6.5em}#vs-panel textarea{max-width:100%;box-sizing:border-box}' +
    '#vs-panel .vs-who{display:flex;flex-wrap:wrap;gap:4px 6px;margin:6px 0}#vs-panel .vs-who .btn{font-weight:400}' +
    '#vs-panel .advsec textarea{width:100%}' +
    '@media (max-width:520px){#vs-panel{padding:12px}#vs-panel .vs-tools .btn{font-size:12px;padding:3px 8px}#vs-panel details.vsf{padding:6px 8px 8px}#vs-panel .gearrow input[type=text]{width:100%!important}#vs-panel .gend .gearrow input[type=text]{width:100%}}' +
    '.vsdlg .vs-list{max-height:min(46vh,420px);overflow:auto;border:1px solid var(--line);border-radius:var(--r-card,6px);padding:6px 8px;display:flex;flex-wrap:wrap;gap:4px 14px}' +
    '.vsdlg .vs-list label{font-size:13px;display:inline-flex;gap:4px;align-items:center}.vsdlg .vs-pv{font-size:13px;line-height:1.7;margin:6px 0;padding-left:1.2em}.vsdlg .vs-pv li{margin:2px 0}' +
    '.vsdlg textarea{width:100%;box-sizing:border-box;font-size:12px;font-family:ui-monospace,Menlo,monospace}.vsdlg .gearrow label{font-size:13px}';
  var st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);

  /* ---------- 口調の見本（もとは ui-gear.js）：ふつうの言い回しの台詞を、この住人の口調・一人称・呼び方に直して見せる（数秒ごとに切り替わる） ---------- */
  var SAMPLE = {};
  Object.keys(HK.TONES || {}).forEach(function (k) { if (HK.TONES[k].sample) SAMPLE[k] = HK.TONES[k].sample; });
  function sampleOf(tk, g) { var T = HK.TONES[tk] || {}; return HK.TONE_SAMPLE || (g === 'f' && T.sampleF) || (g === 'm' && T.sampleM) || SAMPLE[tk]; }
  function reName(s, n) { return s.replace(new RegExp('^' + String(n).replace(/[.*+?^${}()|[\]\\]/g, '\\$&')), ''); }
  /* c：住人（全体の見本では仮の住人 { name, tone, gender, eg }）。others：ほかの住人 */
  function sampleLines(c, others) {
    var V = HK.Voice;
    if (!V || !V.processText) return '';
    if (HK.Load && HK.Load.tonesReady && !HK.Load.tonesReady([c])) {
      HK.Load.ensureTones([c]).then(function () { VS.sampleRefresh(); }, function () {
        boxes().forEach(function (b) { if ((b.getAttribute('data-cid') || '') === (c.id || '')) b.innerHTML = '<span class="tsh">台詞の見本</span><span class="tsl on">口調のデータを読み込めませんでした。対象を選び直すと、もう一度読み込みます</span>'; });
      });
      return '<span class="tsh">台詞の見本</span><span class="tsl on">読み込んでいます…</span>';
    }
    var o = (others || [])[0] || { name: '相手', id: '' };
    var me = { name: c.name, fp: (c.fpFor && o.id && c.fpFor[o.id]) || c.fp || '', you: (c.youFor && o.id && c.youFor[o.id]) || c.you || '', marks: c.marks || '', toneCustom: c.toneCustom || '', gender: c.gender || '', tone: HK.Ending ? HK.Ending.toneOf(c) : HK.toneOf ? HK.toneOf(c) : c.tone || '', call: c.call || '', callG: c.callG || null, calls: c.calls || null };
    var kgo = c.keigo ? (others || []).filter(function (x) { return c.keigo[x.id]; })[0] : null;
    me.persona = HK.personaOf ? HK.personaOf({ tone: c.tone, eg: c.eg }) : 'gentle';
    var ppl = [me, { name: o.name, fp: '', gender: o.gender || '', tone: '', persona: 'gentle' }];
    if (me.calls && o.id && me.calls[o.id]) { me.calls = {}; me.calls[o.name] = c.calls[o.id]; } else me.calls = null;
    var tk = me.tone && (HK.TONE_SAMPLE || SAMPLE[me.tone]) ? me.tone : SAMPLE[me.persona] ? me.persona : 'gentle';
    var SL = sampleOf(tk, c.gender) || [];
    var lines = SL.map(function (t) { return esc(reName(V.processText(t.replace(/\{n\}/g, c.name).replace(/\{o\}/g, o.name), ppl), c.name)); });
    if (kgo && SL[2] && me.persona !== 'polite' && me.tone !== 'polite') {
      var km = Object.assign({}, me, { keigo: {}, calls: c.calls && c.calls[kgo.id] ? {} : null }); km.keigo[kgo.name] = 1; if (km.calls) km.calls[kgo.name] = c.calls[kgo.id];
      lines.push(esc(reName(V.processText(SL[2].replace(/\{n\}/g, c.name).replace(/\{o\}/g, kgo.name), [km, { name: kgo.name, fp: '', gender: kgo.gender || '', tone: '', persona: 'gentle' }]), c.name)) + '（敬語の相手へ）');
    }
    return '<span class="tsh">台詞の見本（' + esc(toneLabel(tk)) + (c.id ? '・一人称と呼び方も反映' : '') + '）</span>' + lines.map(function (l, i) { return '<span class="tsl' + (i === 0 ? ' on' : '') + '">' + l + '</span>'; }).join('');
  }
  /* 全体の見本で選んでいる口調・性別（このページを開いているあいだだけ） */
  var GS = { tone: 'gentle', g: 'f' };
  function demoChar() { return { id: '', name: '見本', tone: GS.tone, gender: GS.g, eg: { CP: 10, NP: 10, A: 10, FC: 10, AC: 10 } }; }
  /* 見本の箱（この節と ⚙設定の両方に出る。data-cid の住人で描き、空なら全体の見本） */
  function sampleBox(c, others) { return '<div class="tonesample anim vs-ts" data-cid="' + esc(c.id || '') + '" aria-live="polite">' + sampleLines(c, others) + '</div>'; }
  function boxes() { return Array.prototype.slice.call(document.querySelectorAll('.vs-ts')); }
  VS.sampleRefresh = function () {
    boxes().forEach(function (box) {
      var id = box.getAttribute('data-cid'), c = id ? byId(id) : null;
      if (id && !c) return;
      box.innerHTML = c ? sampleLines(c, S().chars.filter(function (x) { return x !== c; })) : sampleLines(demoChar(), []);
    });
  };
  var tsTimer = null;
  function sampleTick() {
    if (tsTimer) clearInterval(tsTimer);
    tsTimer = setInterval(function () {
      var bs = boxes();
      if (!bs.length) { clearInterval(tsTimer); tsTimer = null; return; }
      bs.forEach(function (box) {
        if (!box.offsetParent) return;
        var ls = box.querySelectorAll('.tsl'); if (ls.length < 2) return;
        var k = 0; ls.forEach(function (x, i) { if (x.classList.contains('on')) k = i; });
        ls[k].classList.remove('on'); ls[(k + 1) % ls.length].classList.add('on');
      });
    }, 2600);
  }
  VS.sampleTick = sampleTick;

  /* ---------- 部品「口調」 ---------- */
  /* コピー・文字列にする欄（名前の読み c.yomi は本人の名前のことなので写さない。敬語で話す相手 c.keigo はほかの住人を指すので写さない） */
  var TONE_KEYS = ['tone', 'fp', 'you', 'fpAngry', 'fpLover', 'marks', 'toneCustom', 'ending', 'toneDict', 'call', 'callG', 'keigoOlder'];
  var keigoOpen = false;
  /* 口調の基本の欄（⚙設定の「口調」と、この節の住人の「口調」の前半で同じものを描く。2026-10-28 担当LI）：
     口調・一人称・二人称・怒ったとき／恋人になってからの一人称・名前の読み・語尾の記号（・語尾の付け替え）・口調の説明・台詞の見本・語尾の設定（かんたん）。
     保存先はどちらも住人の c.*（data-gf も同じ）。入力は basicField（この節は toneField から、⚙設定は ui-gear.js の onField から） */
  function basicHtml(c, others) {
    var autoK = autoKey(c), keys = HK.TONE_KEYS || HK.PERSONA_KEYS;
    var toneSel = '<select data-gf="tone" aria-label="口調">' + opt('', 'おまかせ（' + toneLabel(autoK) + '）', c.tone || '') + keys.map(function (k) { var t = HK.toneInfo ? HK.toneInfo(k) : HK.PERSONA[k]; return opt(k, t.label, c.tone || '', t.desc); }).join('') + '</select>';
    var tInfo = HK.toneInfo ? HK.toneInfo(c.tone || autoK) : HK.PERSONA[c.tone || autoK];
    return '<div class="gearrow"><label>口調 ' + toneSel + '</label>' + (HK.Ending ? HK.Ending.badge(c) : '') + '<label>一人称 <input type="text" data-gf="fp" value="' + esc(c.fp || '') + '" maxlength="8" placeholder="空なら口調から"></label><label>二人称 <input type="text" data-gf="you" value="' + esc(c.you || '') + '" maxlength="8" placeholder="空なら口調から"></label></div>' +
      (HK.Attr && HK.Attr.fpMoreHtml ? HK.Attr.fpMoreHtml(c, esc) : '') +
      '<div class="gearrow"><label title="文末の「。」「！」がこの記号になります。空白で区切って複数書くと、文ごとにランダムに選びます">語尾の記号 <input type="text" data-gf="marks" value="' + esc(c.marks || '') + '" maxlength="30" placeholder="例：！！！　または　♣ ♦" style="width:14em"></label>' +
      (HK.TONE_CUSTOM_OFF ? '' : '<label title="口調で言い換えたあとの台詞の語尾を、さらに付け替えます。「元→先」を読点で区切って5つまで">語尾の付け替え <input type="text" data-gf="toneCustom" value="' + esc(c.toneCustom || '') + '" maxlength="120" placeholder="例：です→っす、だ→だぜ" style="width:16em"></label>') + '</div>' +
      '<p class="gearhint">' + esc(tInfo ? tInfo.desc : '') + '</p>' +
      sampleBox(c, others) +
      (HK.Ending ? HK.Ending.gearHtml(c, others[0], { esc: esc, opt: opt, part: 'easy' }) : '');
  }
  VS.basicHtml = function (c) { return basicHtml(c, S().chars.filter(function (x) { return x !== c; })); };
  /* 基本の欄の入力：扱った欄なら true。changed(rerender) は呼んだ側の保存と描き直し */
  function basicField(c, f, t, isInput, changed) {
    if (/^end:/.test(f) && HK.Ending) return HK.Ending.gearField(c, f, t, isInput, changed, VS.sampleRefresh, S().chars.filter(function (x) { return x !== c; })[0]);
    switch (f) {
      case 'tone': if (isInput) return true; c.tone = HK.toneValid && HK.toneValid(t.value) ? t.value : ''; if (HK.Load && HK.Load.ensureTones) HK.Load.ensureTones([c]).then(null, function () { /* 動かすときに知らせる */ }); changed(true); return true;
      case 'fp': c.fp = t.value.trim().slice(0, 8); changed(false); VS.sampleRefresh(); return true;
      case 'you': c.you = t.value.trim().slice(0, 8); changed(false); VS.sampleRefresh(); return true;
      case 'marks': c.marks = t.value.trim().slice(0, 30); changed(false); VS.sampleRefresh(); return true;
      case 'toneCustom': c.toneCustom = String(t.value).slice(0, 120); if (!isInput) c.toneCustom = HK.normToneCustom ? HK.normToneCustom(c.toneCustom) : ''; changed(false); VS.sampleRefresh(); return true;
    }
    return false;
  }
  VS.basicField = basicField;
  function toneCharHtml(c) {
    var s = S(), others = s.chars.filter(function (x) { return x !== c; }), autoK = autoKey(c);
    var callSel = '<select data-gf="call" aria-label="基本の呼び方">' + (HK.CALL_STYLES || [{ v: '', label: 'おまかせ' }]).map(function (o) { return opt(o.v, o.label, c.call || ''); }).join('') + '</select>';
    var SUF = (HK.CALL_STYLES || []).filter(function (o) { return o.v && o.v !== 'gender'; }), CGD = { m: 'kun', f: 'chan', x: 'san' };
    if (c.call === 'gender') callSel += [['m', '男性'], ['f', '女性'], ['x', 'その他']].map(function (g) { return '<label>' + g[1] + 'には <select data-gf="callG" data-g="' + g[0] + '" aria-label="' + g[1] + 'の呼び方">' + SUF.map(function (o) { return opt(o.v, o.label, (c.callG && c.callG[g[0]]) || CGD[g[0]]); }).join('') + '</select></label>'; }).join('');
    /* 敬語で話す相手：住人が多いとき（61人以上）は、閉じているあいだ一覧を作らない（開いたときに入れる） */
    var many = others.length > 60, kn = others.filter(function (o) { return c.keigo && c.keigo[o.id]; }).length;
    var kList = function () { return others.map(function (o) { return '<label><input type="checkbox" data-gf="keigo" data-o="' + esc(o.id) + '"' + (c.keigo && c.keigo[o.id] ? ' checked' : '') + '> ' + esc(o.name) + '</label>'; }).join(''); };
    return basicHtml(c, others) +
      (HK.Ending ? HK.Ending.gearHtml(c, others[0], { esc: esc, opt: opt, part: 'dict' }) : '') +
      '<div class="gearrow"><label>基本の呼び方 ' + callSel + '</label><label><input type="checkbox" data-gf="keigoOlder"' + (c.keigoOlder ? ' checked' : '') + '> 年上の相手には敬語（年齢を決めた人どうし）</label></div>' +
      (others.length ? '<details class="gkeigo" id="vs-keigo"' + (keigoOpen ? ' open' : '') + '><summary>敬語で話す相手 <span class="gkn" id="vs-kn">' + (kn ? kn + '人' : 'なし') + '</span></summary><div class="gearrow">' + (keigoOpen || !many ? kList() : '') + '</div>' +
        ((c.tone || autoK) === 'polite' ? '<p class="gearhint">いまの口調は敬語なので、誰にでも敬語で話します。</p>' : '') + '</details>' : '') +
      '<p class="gearhint">相手ごとの呼び方・二人称・一人称は、⚙設定の「相手ごとの設定」で決めます。</p>';
  }
  /* 敬語で話す相手の一覧を、開いたときに入れる（住人が多いとき） */
  document.addEventListener('toggle', function (e) {
    var d = e.target;
    if (!d || d.id !== 'vs-keigo') return;
    keigoOpen = d.open;
    var box = d.querySelector('.gearrow'), c = cur();
    if (d.open && box && !box.children.length && c) {
      box.innerHTML = S().chars.filter(function (x) { return x !== c; }).map(function (o) { return '<label><input type="checkbox" data-gf="keigo" data-o="' + esc(o.id) + '"' + (c.keigo && c.keigo[o.id] ? ' checked' : '') + '> ' + esc(o.name) + '</label>'; }).join('');
      if (HK.CastPages) HK.CastPages.after(d);
    }
  }, true);
  function toneGlobalHtml() {
    var keys = HK.TONE_KEYS || HK.PERSONA_KEYS, chars = S().chars;
    var set = chars.filter(function (c) { return c.tone; }), ed = chars.filter(function (c) { return HK.Ending && HK.Ending.on(c); });
    var who = set.concat(ed.filter(function (c) { return set.indexOf(c) < 0; }));
    var chip = function (c) { return '<button type="button" class="btn small ghost" data-vact="pick" data-id="' + esc(c.id) + '" title="この住人の設定を開く">' + esc(c.name) + '（' + esc(c.tone ? toneLabel(c.tone) : 'おまかせ') + (HK.Ending && HK.Ending.on(c) ? '・語尾の設定' : '') + '）</button>'; };
    return '<p class="gearhint">口調は住人ごとに決めます（箱庭全体の口調の上書きはありません）。上の「対象」で住人を選ぶと、口調・一人称・語尾の設定・口調の辞書・呼び方・敬語を編集できます。</p>' +
      '<p class="gearhint">口調が「おまかせ」の住人は、エゴグラムから口調を選びます（同じ口調でも、気質によって荒さや優しさが変わります）。女性の住人の男性的な言い方は、口調に合わせて整えます。</p>' +
      '<div class="gearrow"><label>見本の口調 <select data-vf="gtone" aria-label="見本の口調">' + keys.map(function (k) { return opt(k, toneLabel(k), GS.tone); }).join('') + '</select></label>' +
      '<label>性別 <select data-vf="gsex" aria-label="見本の性別">' + opt('f', '女性', GS.g) + opt('m', '男性', GS.g) + opt('', 'その他', GS.g) + '</select></label></div>' +
      sampleBox(demoChar(), []) +
      '<p class="gearhint" style="margin-top:10px">口調か語尾の設定を決めている住人：' + (who.length ? who.length + '人' : 'いません（全員おまかせ）') + '</p>' +
      (who.length ? '<div class="vs-who">' + who.slice(0, 40).map(chip).join('') + (who.length > 40 ? '<span class="gearhint" style="margin:0">ほか ' + (who.length - 40) + '人</span>' : '') + '</div>' : '');
  }
  function toneSum(c) {
    if (!c) return '';
    var b = ['口調：' + (c.tone ? toneLabel(c.tone) : 'おまかせ（' + toneLabel(autoKey(c)) + '）')];
    if (c.fp) b.push('一人称：' + c.fp);
    if (c.you) b.push('二人称：' + c.you);
    if (HK.Ending && HK.Ending.on(c)) b.push(HK.Ending.labelFor(c));
    return b.join('・');
  }
  function toneField(c, f, t, isInput, changed) {
    if (/^at_/.test(f) && HK.Attr) return HK.Attr.gearField(c, f, t, isInput, changed, byId);
    if (basicField(c, f, t, isInput, changed)) return true;
    switch (f) {
      case 'call': if (isInput) return true; c.call = t.value; changed(true); return true;
      case 'callG': if (isInput) return true; c.callG = c.callG || {}; c.callG[t.dataset.g] = t.value; changed(false); VS.sampleRefresh(); return true;
      case 'keigoOlder': if (isInput) return true; c.keigoOlder = t.checked; changed(false); VS.sampleRefresh(); return true;
      case 'keigo': if (isInput) return true; c.keigo = c.keigo || {}; if (t.checked) c.keigo[t.dataset.o] = 1; else delete c.keigo[t.dataset.o]; changed(false); VS.sampleRefresh();
        (function () { var kn = document.getElementById('vs-kn'), n = Object.keys(c.keigo).filter(function (k) { return c.keigo[k] && byId(k); }).length; if (kn) kn.textContent = n ? n + '人' : 'なし'; })(); return true;
    }
    return false;
  }
  var NO_TONE_ALL = '口調：箱庭全体の口調の設定はありません（口調は住人ごとに決めます）';
  VS.add({
    id: 'tone', label: '口調', keys: TONE_KEYS, resetKeys: TONE_KEYS.concat(['keigo']),
    charHtml: toneCharHtml, globalHtml: toneGlobalHtml, field: toneField, sum: toneSum,
    toChar: function () { return { done: [], skip: [NO_TONE_ALL] }; },
    fromChar: function () { return { done: [], skip: [NO_TONE_ALL] }; }
  });

  /* ---------- 節の描画 ---------- */
  function targetSel(c) {
    var chars = S().chars, many = chars.length > ((HK.CastPages && HK.CastPages.LAZY_MIN) || 60);
    var all = chars.map(function (x) { return opt(x.id, x.name, c ? c.id : ''); }).join('');
    /* 住人が多いときは、選んでいる人だけで描き、触れたときに全員を入れる（ui-cast-pages.js の lazyAttr。名前で探す欄も自動で付く） */
    var lz = many && HK.CastPages && HK.CastPages.lazyAttr;
    return '<select id="vs-target" data-vf="target" aria-label="設定する対象（全体か住人）"' + (lz ? HK.CastPages.lazyAttr(opt('', '全体（箱庭全体の既定）', c ? c.id : '') + '<optgroup label="住人（' + chars.length + '人）">' + all + '</optgroup>') : '') + '>' +
      opt('', '全体（箱庭全体の既定）', c ? c.id : '') + (chars.length ? '<optgroup label="住人（' + chars.length + '人）">' + (lz ? (c ? opt(c.id, c.name, c.id) : '') : all) + '</optgroup>' : '') + '</select>';
  }
  function partsFor(c) { return VS.parts.filter(function (p) { return c ? !!p.charHtml : !!p.globalHtml; }); }
  function bodyHtml(c) {
    return partsFor(c).map(function (p) {
      var inner = c ? p.charHtml(c) : p.globalHtml(), sm = c && p.sum ? p.sum(c) : '';
      if (!inner) return '';
      return '<details class="vsf" data-vk="' + esc(p.id) + '"' + (isOpen(c, p.id) ? ' open' : '') + '><summary>' + esc(p.label) + (c ? '' : '（全体）') + '<span class="vsum" data-vsum="' + esc(p.id) + '">' + esc(sm) + '</span></summary><div class="vsb">' + inner + '</div></details>';
    }).join('');
  }
  function panelHtml() {
    var c = cur(), chars = S().chars, i = c ? chars.indexOf(c) : -1;
    var lead = c ? esc(c.name) + 'だけの設定です。保存先はこの住人（住人のJSON・セーブの住人にも入ります）。' : '全員に効く既定です。保存先はこのブラウザの全体の設定（全員のJSONの書き出し・セーブと履歴の写しにも入ります）。';
    return '<div class="panel" id="vs-panel" data-vroot><div class="vs-head"><label for="vs-target">対象 ' + targetSel(c) + '</label>' +
      (chars.length ? '<span class="vs-nav" style="display:inline-flex;gap:6px"><button type="button" class="btn small ghost" data-vact="prev" aria-label="前の住人">← 前</button><button type="button" class="btn small ghost" data-vact="next" aria-label="次の住人">次 →</button></span>' : '') + '</div>' +
      '<p class="hint vs-lead">' + lead + '</p>' +
      (function () { var t = VS.tools ? VS.tools(c) : ''; return t ? '<div class="vs-tools">' + t + '</div>' : ''; })() +
      '<div class="vs-body">' + bodyHtml(c) + '</div></div>';
  }
  VS.html = function () {
    return '<h2 class="sec" id="voiceset">' + esc(VS.LABEL) + (HK.Tips ? HK.Tips.btn('gear-talk') : '') + '</h2>' + panelHtml();
  };
  /* 描いたあと（ui.js の renderCast・この節の描き直し） */
  VS.after = function () {
    var p = document.getElementById('vs-panel');
    if (!p) return;
    var c = cur();
    if (HK.CastPages) HK.CastPages.after(p);
    VS.parts.forEach(function (x) { if (x.after) x.after(c); });
    if (p.querySelector('.vs-ts')) sampleTick();
  };
  /* 節だけを描き直す（入力中の欄にフォーカスを戻す） */
  VS.refresh = function () {
    var p = document.getElementById('vs-panel');
    if (!p) return;
    var ae = document.activeElement, key = ae && p.contains(ae) ? (ae.id ? '#' + ae.id : ae.getAttribute('data-gf') ? '[data-gf="' + ae.getAttribute('data-gf') + '"]' + (ae.getAttribute('data-o') ? '[data-o="' + ae.getAttribute('data-o') + '"]' : '') + (ae.getAttribute('data-g') ? '[data-g="' + ae.getAttribute('data-g') + '"]' : '') : null) : null;
    var y = window.pageYOffset;
    p.outerHTML = panelHtml();
    VS.after();
    if (Math.abs(window.pageYOffset - y) > 1) window.scrollTo(0, y);
    if (key) { var el = document.querySelector('#vs-panel ' + key); if (el && el.focus) try { el.focus({ preventScroll: true }); } catch (e) { el.focus(); } }
  };
  /* 住人の行の要約を合わせる（一覧全体は描き直さない） */
  VS.rowSync = function (c) {
    var row = c && document.querySelector('#view-cast .res[data-id="' + String(c.id).replace(/["\\]/g, '') + '"] .csum');
    if (row && UI.summary) row.innerHTML = UI.summary(c);
    Array.prototype.forEach.call(document.querySelectorAll('#vs-panel [data-vsum]'), function (el) { var p = VS.part(el.getAttribute('data-vsum')); if (p && p.sum && c) el.textContent = p.sum(c); });
  };
  /* ⚙設定の「口調」の節の下に出す、この節でだけ決める欄の要約（口調の辞書・呼び方・敬語と、ほかの部品。ui-gear.js） */
  VS.moreSum = function (c) {
    var b = [], kn = Object.keys(c.keigo || {}).filter(function (k) { return c.keigo[k] && byId(k); }).length;
    var cl = (HK.CALL_STYLES || []).filter(function (o) { return o.v && o.v === c.call; })[0];
    if (typeof c.toneDict === 'string' && c.toneDict.trim()) b.push('口調の辞書：あり');
    if (cl) b.push('呼び方：' + cl.label);
    if (kn) b.push('敬語の相手：' + kn + '人');
    if (c.keigoOlder) b.push('年上には敬語');
    VS.parts.forEach(function (p) { var s = p.id !== 'tone' && p.sum ? p.sum(c) : ''; if (s) b.push(s); });
    return b.join('・');
  };
  /* 節の頭へ（見えていなければ） */
  function toHead(force) {
    var d = document.getElementById('fold-voiceset') || document.getElementById('voiceset');
    if (!d) return;
    if (d.tagName === 'DETAILS' && !d.open) d.open = true;
    var r = d.getBoundingClientRect();
    if (force || r.top < 0 || r.top > window.innerHeight * 0.6) { try { d.scrollIntoView({ block: 'start', behavior: 'auto' }); } catch (e) { d.scrollIntoView(); } }
  }
  function select(id, scroll) {
    VIEW.t = id && byId(id) ? id : '';
    keep();
    VS.refresh();
    if (scroll) toHead(false);
  }
  VS.select = select;
  /* ⚙設定の「口調・喘ぎをより細かく設定する」：その住人を選び、節を開いて頭へ */
  VS.open = function (id) {
    VIEW.t = byId(id) ? id : '';
    VIEW.fold[foldKey(true, 'tone')] = true;
    keep();
    if (!document.getElementById('vs-panel')) UI.refresh(); else VS.refresh();
    var go = function () { toHead(true); var s = document.getElementById('vs-target'); if (s) try { s.focus({ preventScroll: true }); } catch (e) { s.focus(); } };
    if (window.requestAnimationFrame) requestAnimationFrame(function () { requestAnimationFrame(go); }); else setTimeout(go, 30);
  };

  /* ---------- 入力 ---------- */
  function changedFor(c) {
    return function (rerender) {
      UI.save();
      VS.rowSync(c);
      if (rerender) VS.refresh();
    };
  }
  function onField(ev) {
    var t = ev.target, p = t && t.closest && t.closest('#vs-panel');
    if (!p) return;
    var isInput = ev.type === 'input', vf = t.dataset.vf;
    if (vf) {
      if (isInput && t.tagName === 'SELECT') return;
      if (vf === 'target') { if (!isInput) select(t.value, true); return; }
      if (vf === 'gtone' || vf === 'gsex') { if (isInput) return; if (vf === 'gtone') GS.tone = t.value; else GS.g = t.value; VS.sampleRefresh(); return; }
      return;
    }
    var f = t.dataset.gf, c = cur();
    if (!f || !c) return;
    for (var i = 0; i < VS.parts.length; i++) if (VS.parts[i].field && VS.parts[i].field(c, f, t, isInput, changedFor(c))) return;
  }
  document.addEventListener('input', onField);
  document.addEventListener('change', onField);
  document.addEventListener('toggle', function (e) {
    var d = e.target;
    if (!d || !d.classList || !d.classList.contains('vsf') || !d.closest('#vs-panel')) return;
    VIEW.fold[foldKey(cur(), d.getAttribute('data-vk'))] = d.open;
    keep();
  }, true);
  document.addEventListener('click', function (ev) {
    var b = ev.target && ev.target.closest && ev.target.closest('#vs-panel [data-vact],#vs-panel [data-gact]');
    if (!b) return;
    var c = cur(), act = b.getAttribute('data-vact');
    if (!act) { var g = b.getAttribute('data-gact'); VS.parts.forEach(function (p) { if (p.act && c) p.act(g, c, b); }); return; }
    var chars = S().chars, i = c ? chars.indexOf(c) : -1;
    if (act === 'prev' || act === 'next') {
      if (!chars.length) return;
      var j = act === 'next' ? (i + 1) % chars.length : i <= 0 ? chars.length - 1 : i - 1;
      select(chars[j].id, false);
      var nb = document.querySelector('#vs-panel [data-vact="' + act + '"]'); if (nb) nb.focus();
      return;
    }
    if (act === 'pick') { select(b.getAttribute('data-id'), true); return; }
    if (VS.onTool) VS.onTool(act, c, b);
  });
})();
