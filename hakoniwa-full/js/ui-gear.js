/* 箱庭シミュレーター ui: 住人ごとの設定（⚙️）
   節は ①話し方 ②プロフィール ③体と設定 ④恋愛（R18版は恋愛と夜） ⑤相手ごとの設定（殺さない相手・関係・呼び方・二人称/一人称・受け攻め・夜の性格）。
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
    if (c.marks) bits.push('語尾：' + c.marks);
    if (c.toneCustom && !HK.TONE_CUSTOM_OFF) bits.push('付け替え：' + c.toneCustom);
    /* r18:begin */
    if (c.moanTone && !HK.SAFE_ON) bits.push('喘ぎ：' + toneLabel(c.moanTone));
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
    if (!HK.SAFE_ON && c.trioHub) bits.push('三人の場面：固定の相手が中心なら');
    /* r18:end */
    if (c.alcohol && HK.ALC_LABEL) bits.push('お酒：' + HK.ALC_LABEL[c.alcohol]);
    /* r18:begin */
    if (!HK.SAFE_ON && (c.partWords || c.partM || c.partF)) bits.push('性器の呼び方：' + ([c.partM, c.partF].filter(Boolean).join('・') || { soft: 'ぼかす', direct: '直接的', medical: '医学的' }[c.partWords]));
    if (!HK.SAFE_ON && c.posNpc === 'bottom' && (c.pos === 'top' || c.pos === 'riba')) bits.push('モブには受け');
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
  var css = '.gearbtn{white-space:nowrap}.csum{font-size:12px;color:var(--muted);flex:1 1 100%;line-height:1.5}.csw{display:inline-block;width:10px;height:10px;border-radius:50%;margin-right:4px;vertical-align:-1px;border:1px solid var(--line)}' +
    '.gearov{position:fixed;inset:0;z-index:30;background:rgba(10,14,18,.45);display:flex;align-items:flex-start;justify-content:center;padding:max(12px,env(safe-area-inset-top,0px)) 12px 12px;overflow-y:auto;-webkit-overflow-scrolling:touch}' +
    '.gearbox{background:var(--surface);color:var(--ink);border:1px solid var(--line);border-radius:10px;width:100%;max-width:680px;padding:16px 16px 20px;box-shadow:0 10px 40px rgba(0,0,0,.25)}' +
    '.gearhd{display:flex;align-items:center;gap:10px;margin-bottom:6px}.gearhd h2{font-size:18px;margin:0;flex:1}.gearsec{margin-top:16px;border-top:1px solid var(--line);padding-top:12px}.gearsec h3{font-size:14px;margin:0 0 8px}' +
    '.gearrow{display:flex;flex-wrap:wrap;gap:8px 12px;align-items:center;margin:6px 0}.gearrow label{font-size:13px;color:var(--muted);display:flex;gap:6px;align-items:center;flex-wrap:wrap}.gearrow select,.gearrow input[type=text]{max-width:100%}' +
    '.gearhint{font-size:12px;color:var(--muted);margin:4px 0 0;line-height:1.6}.tonesample{margin:8px 0 2px;padding:8px 12px;border-left:3px solid var(--accent);background:color-mix(in srgb,var(--accent) 7%,transparent);border-radius:0 8px 8px 0;font-size:13px;line-height:1.7;min-height:1.7em}.tonesample .tsl{display:block}.tonesample.anim .tsl{display:none}.tonesample.anim .tsl.on{display:block;animation:tsfade .5s ease}.tonesample .tsh{font-size:11px;color:var(--muted);display:block;margin-bottom:2px}@keyframes tsfade{from{opacity:0;transform:translateY(4px)}to{opacity:1;transform:none}}@media (prefers-reduced-motion:reduce){.tonesample.anim .tsl{display:block}.tonesample.anim .tsl.on{animation:none}}.gtie{border:1px solid var(--line);border-radius:8px;padding:8px 10px;margin:8px 0}.gtie .who{font-weight:600;display:flex;align-items:center;gap:6px;margin-bottom:4px}' +
    '.gtie .one{display:flex;flex-wrap:wrap;gap:6px;align-items:center;margin:4px 0}.gtie input[type=text]{width:12em}' +
    'details.gkeigo,details.gdet{margin:8px 0 0;border:1px solid var(--line);border-radius:8px;padding:6px 10px}details.gkeigo summary,details.gdet summary{cursor:pointer;font-size:13px;color:var(--muted)}details.gkeigo .gkn,details.gdet .gkn{font-size:12px;margin-left:4px;color:var(--ink)}details.gkeigo[open] summary,details.gdet[open] summary{margin-bottom:4px}' +
    '.gscope{margin:-2px 0 8px;padding:4px 8px;border-left:3px solid var(--line);background:color-mix(in srgb,var(--ink) 3%,transparent);border-radius:0 6px 6px 0}.gforh{font-size:12px;color:var(--muted);margin-left:4px}.gfnote{color:var(--accent)}' +
    '@media (max-width:520px){.gearbox{padding:12px}.gtie input[type=text]{width:100%}}';
  /* この住人の傾向（エゴグラムの説明）と、住人一覧の態度の一語 */
  css += 'details.gego{margin:10px 0 0;border:1px solid var(--line);border-radius:8px;padding:6px 10px;background:color-mix(in srgb,var(--accent) 5%,transparent)}details.gego summary{cursor:pointer;font-size:14px;font-weight:600}details.gego .gegc{font-size:12px;font-weight:400;color:var(--muted);margin-left:6px}details.gego ul{margin:6px 0 2px;padding-left:1.2em;font-size:13px;line-height:1.7}details.gego li{margin:2px 0}' +
    '.egatt{display:inline-block;font-size:11px;line-height:1.5;color:var(--muted);border:1px solid var(--line);border-radius:999px;padding:0 6px;margin-left:6px;white-space:nowrap;vertical-align:1px}';
  var st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);

  /* ---------- 設定の窓 ---------- */
  var cur = null, ov = null, opener = null, keigoOpen = false, egoOpen = true;
  /* 折りたたみ（恋愛相手の固定・性行為の相手・恋愛にしない相手）の開閉。窓を開いているあいだだけ覚える。基本は閉じる */
  var openMap = {};
  function det(k, title, sum, inner) { return '<details class="gdet" data-k="' + k + '"' + (openMap[k] ? ' open' : '') + '><summary>' + title + ' <span class="gkn">' + esc(sum) + '</span></summary><div class="gearrow">' + inner + '</div></details>'; }
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
    return (HK.tieExtra ? HK.tieExtra(t.type) : []).filter(function (x) { return !x.hide; }).map(function (x) {
      var who = x.who ? byId(x.who === 'a' ? t.a : t.b) : null, v = t[x.f] || (t.type === 'fiance' ? 'eager' : '');
      var na = (byId(t.a) || {}).name, nb = (byId(t.b) || {}).name;
      return '<select ' + attr + ' data-xf="' + x.f + '" data-k="' + k + '" aria-label="' + esc(who ? who.name + 'の気持ち' : x.aria) + '">' + x.order.map(function (id) { return opt(id, (who ? who.name + 'の気持ち：' : '') + (HK.tieExtraLabel ? HK.tieExtraLabel(x, id, na, nb) : x.map[id].label), v); }).join('') + '</select>';
    }).join('');
  }
  UI.extraSels = extraSels;
  function tieRow(c, o, t, k) {
    var D = HK.TIES[t.type], h = '<div class="one">' +
      '<select data-gf="ttype" data-k="' + k + '" aria-label="' + esc(o.name) + 'との関係の種類">' + typeOpts(t.type) + '</select>';
    if (D.dir) h += '<select data-gf="tdir" data-k="' + k + '" aria-label="関係の向き">' + opt('a', c.name + 'が' + D.roleA, t.a === c.id ? 'a' : 'b') + opt('b', c.name + 'が' + D.roleB, t.a === c.id ? 'a' : 'b') + '</select>';
    var CO = HK.coldOpts ? HK.coldOpts(t.type) : null;
    if ((D.family && !D.loveOK) || D.loveOpt) h += '<select data-gf="tlove" data-k="' + k + '" aria-label="恋愛">' + opt('', D.loveOpt ? '恋愛に発展：しない' : '恋愛：なし', t.love || '') + opt('ok', D.loveOpt ? '恋愛に発展：する' : '恋愛：あり', t.love || '') + '</select>';
    if (CO) h += '<select data-gf="tcold" data-k="' + k + '" aria-label="' + CO.aria + '">' + CO.order.map(function (id) { return opt(id, CO.map[id].label, t.cold || ''); }).join('') + '</select>';
    h += extraSels(t, k, 'data-gf="textra"');
    h += '<button type="button" class="btn ghost small" data-gact="tdel" data-k="' + k + '">外す</button></div>';
    /* きょうだい：続柄と呼び方（自動のときは「自動（姉）」）、注意（年齢が未設定・同じ年齢・庇護の向きと年齢が逆）。sib-word.js */
    var sb = HK.Sib && HK.Sib.ui ? HK.Sib.ui(c, o, t) : null;
    /* 続柄：上下の欄（elder）で決めたときは「姉（上下の設定）」、上下なしは「上下なし（姉妹）」、ほかは「自動（姉）」 */
    if (sb) h += '<p class="gearhint gsib">続柄：' + esc(sb.src === 'none' ? '上下なし（' + sb.pair + '）' : sb.src === 'set' && sb.rel ? sb.rel + '（上下の設定）' : sb.rel ? '自動（' + sb.rel + '）' : '自動（決まっていません）') + '　呼び方：' + esc(sb.auto ? '自動（' + sb.call + '）' : sb.call ? sb.call : '名前（' + o.name + '）') +
      (sb.notes.length ? '<br>' + esc(sb.notes.join('。')) + '。' : '') + '</p>';
    return h + '<p class="gearhint">' + esc(D.effect || '') + (t.love === 'ok' && D.family ? '。恋愛：ありにしているので、恋愛に発展することもある（信頼が崩れにくいのは同じ）' : '') + (D.loveOpt ? (t.love === 'ok' ? '。恋愛に発展：するにしているので、想いが恋に変わることもある' : '。恋愛に発展：しないにしているので、想いは恋にならない') : '') + '</p>';
  }
  /* 口調の見本：ふつうの言い回しの台詞を、この住人の口調・一人称・呼び方に直して見せる（数秒ごとに切り替わる） */
  /* 口調ごとの見本は tone-registry.js の sample（一人称は「私」、相手は{o}で書き、表示のときに本人の一人称・呼び方に直す） */
  var SAMPLE = {};
  Object.keys(HK.TONES || {}).forEach(function (k) { if (HK.TONES[k].sample) SAMPLE[k] = HK.TONES[k].sample; });
  /* 性別で見本を分けている口調（sampleF / sampleM）は、その性別のときだけそちらを使う */
  /* 台詞の見本は全口調で同じ文（tone-registry.js の HK.TONE_SAMPLE。いまは6文。文の数は固定しない）。口調の辞書と書き下ろしで口調ごとの形になる */
  function sampleOf(tk, g) { var T = HK.TONES[tk] || {}; return HK.TONE_SAMPLE || (g === 'f' && T.sampleF) || (g === 'm' && T.sampleM) || SAMPLE[tk]; }
  function sampleLines(c) {
    var V = HK.Voice;
    if (!V || !V.processText) return '';
    var s = S(), o = s.chars.filter(function (x) { return x !== c; })[0] || { name: '相手', id: '' };
    var me = { name: c.name, fp: (c.fpFor && o.id && c.fpFor[o.id]) || c.fp || '', you: (c.youFor && o.id && c.youFor[o.id]) || c.you || '', marks: c.marks || '', toneCustom: c.toneCustom || '', gender: c.gender || '', tone: HK.Ending ? HK.Ending.toneOf(c) : HK.toneOf ? HK.toneOf(c) : c.tone || '', call: c.call || '', callG: c.callG || null, calls: c.calls || null };
    var kgo = c.keigo ? s.chars.filter(function (x) { return x !== c && c.keigo[x.id]; })[0] : null;
    me.persona = HK.personaOf ? HK.personaOf({ tone: c.tone, eg: c.eg }) : 'gentle';
    var ppl = [me, { name: o.name, fp: '', gender: o.gender || '', tone: '', persona: 'gentle' }];
    if (me.calls && o.id && me.calls[o.id]) { me.calls = {}; me.calls[o.name] = c.calls[o.id]; } else me.calls = null;
    var tk = me.tone && (HK.TONE_SAMPLE || SAMPLE[me.tone]) ? me.tone : SAMPLE[me.persona] ? me.persona : 'gentle';
    var SL = sampleOf(tk, c.gender);
    var lines = SL.map(function (t) { return esc(V.processText(t.replace(/\{n\}/g, c.name).replace(/\{o\}/g, o.name), ppl).replace(new RegExp('^' + c.name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')), '')); });
    /* 敬語で話す相手がいれば、その相手への一言も見本に足す */
    if (kgo && me.persona !== 'polite' && me.tone !== 'polite') {
      var km = Object.assign({}, me, { keigo: {}, calls: c.calls && c.calls[kgo.id] ? {} : null }); km.keigo[kgo.name] = 1; if (km.calls) km.calls[kgo.name] = c.calls[kgo.id];
      lines.push(esc(V.processText(SL[2].replace(/\{n\}/g, c.name).replace(/\{o\}/g, kgo.name), [km, { name: kgo.name, fp: '', gender: kgo.gender || '', tone: '', persona: 'gentle' }]).replace(new RegExp('^' + c.name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')), '')) + '（敬語の相手へ）');
    }
    return '<span class="tsh">台詞の見本（' + esc(toneLabel(tk)) + '・一人称と呼び方も反映）</span>' + lines.map(function (l, i) { return '<span class="tsl' + (i === 0 ? ' on' : '') + '">' + l + '</span>'; }).join('');
  }
  var tsTimer = null;
  function sampleTick() {
    if (tsTimer) clearInterval(tsTimer);
    tsTimer = setInterval(function () {
      var box = document.getElementById('tonesample');
      if (!box || !ov || ov.hidden) { clearInterval(tsTimer); tsTimer = null; return; }
      var ls = box.querySelectorAll('.tsl'); if (!ls.length) return;
      var k = 0; ls.forEach(function (x, i) { if (x.classList.contains('on')) k = i; });
      ls[k].classList.remove('on'); ls[(k + 1) % ls.length].classList.add('on');
    }, 2600);
  }
  function sampleRefresh() { var c = byId(cur), box = document.getElementById('tonesample'); if (c && box) box.innerHTML = sampleLines(c); }
  /* 関係を付けずに出した相手ごとの行（窓を開いているあいだだけ。何か決めれば、関係がなくても行は残る） */
  var extra = {};
  function extraOf(c) { return extra[c.id] || {}; }
  function body(c) {
    var s = S(), others = s.chars.filter(function (x) { return x !== c; });
    var autoK = HK.toneAuto ? HK.toneAuto(HK.traits(c.eg)) : HK.personaAuto(HK.traits(c.eg));
    var keys = HK.TONE_KEYS || HK.PERSONA_KEYS;
    var toneSel = '<select data-gf="tone" aria-label="口調">' + opt('', 'おまかせ（' + toneLabel(autoK) + '）', c.tone || '') + keys.map(function (k) { var t = HK.toneInfo ? HK.toneInfo(k) : HK.PERSONA[k]; return opt(k, t.label, c.tone || '', t.desc); }).join('') + '</select>';
    var tInfo = HK.toneInfo ? HK.toneInfo(c.tone || autoK) : HK.PERSONA[c.tone || autoK];
    /* 喘ぎの口調（R18版だけ。moan-engine.js が喘ぎを作るときにいつもの口調の代わりに使う）：口調の欄のすぐ下 */
    var moanRow = '';
    /* r18:begin */
    if (!HK.SAFE_ON) moanRow = '<div class="gearrow"><label>喘ぎの口調 <select data-gf="moanTone" aria-label="喘ぎの口調">' + opt('', 'いつもの口調と同じ', c.moanTone || '') + keys.map(function (k) { var t = HK.toneInfo ? HK.toneInfo(k) : HK.PERSONA[k]; return opt(k, t.label, c.moanTone || '', t.desc); }).join('') + '</select></label></div>' +
      '<p class="gearhint">喘ぎ声・夜の場面の声だけ、この口調で出します（普段は作った口調で話す人の、素の声が出る様子に）。</p>';
    /* r18:end */
    var callSel = '<select data-gf="call" aria-label="基本の呼び方">' + (HK.CALL_STYLES || [{ v: '', label: 'おまかせ' }]).map(function (o) { return opt(o.v, o.label, c.call || ''); }).join('') + '</select>';
    /* 相手の性別で分けるとき：男性・女性・その他ごとの敬称 */
    var SUF = (HK.CALL_STYLES || []).filter(function (o) { return o.v && o.v !== 'gender'; }), CGD = { m: 'kun', f: 'chan', x: 'san' };
    if (c.call === 'gender') callSel += [['m', '男性'], ['f', '女性'], ['x', 'その他']].map(function (g) { return '<label>' + g[1] + 'には <select data-gf="callG" data-g="' + g[0] + '" aria-label="' + g[1] + 'の呼び方">' + SUF.map(function (o) { return opt(o.v, o.label, (c.callG && c.callG[g[0]]) || CGD[g[0]]); }).join('') + '</select></label>'; }).join('');
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
      sexSel = '<label title="固定した相手だけ：住人では選んだ相手とだけ体の関係になり、モブ・魔物など住人でない相手ともなりません（マッサージはふつうの施術、感覚遮断穴は壁の向こうの手を追い払います）。固定した相手＋モブ：住人では選んだ相手とだけ、モブとの場面はふつうに起きます">性行為の相手を固定 <select data-gf="sexlock" aria-label="性行為の相手の固定"><option value="">恋愛相手の固定に合わせる</option>' + opt('any', '誰とでも可（恋愛は固定のまま）', c.sexLock || '') + (others.length ? opt('pick', '固定した相手だけ', c.sexLock || '') + opt('pickMob', '固定した相手＋モブ', c.sexLock || '') : '') + '</select></label>';
      if ((c.sexLock === 'pick' || c.sexLock === 'pickMob') && others.length) sexBox = det('sex', '性行為の相手', sumOf(c.sexLocks, 'まだ選んでいません'), cbs('sexlockc', c.sexLocks));
    }
    /* r18:end */
    /* R18版だけの欄：体と設定の「性器の呼び方」、恋愛と夜の「ふたなり・モブには・R18に参加しない・濁点喘ぎ」 */
    var partRow = '', r18Row = '';
    /* r18:begin */
    if (!HK.SAFE_ON) {
      partRow = '<div class="gearrow"><label title="R18の場面で、性器をどう呼ぶか。台詞はその人の言葉づかい、地の文はその人の体の描写に使います（誰の体か分からない文は変えません）">性器の呼び方 ' + selOf('partWords', [['', 'おまかせ（文のまま）'], ['soft', 'ぼかす'], ['direct', '直接的'], ['medical', '医学的']], c.partWords || '') + '</label>' +
        '<label title="空なら上の作風のまま。決めると、作風より優先します">男性器 <input type="text" data-gf="partM" value="' + esc(c.partM || '') + '" maxlength="10" placeholder="自由に" style="width:6em"></label>' +
        '<label title="空なら上の作風のまま。決めると、作風より優先します">女性器 <input type="text" data-gf="partF" value="' + esc(c.partF || '') + '" maxlength="10" placeholder="自由に" style="width:6em"></label></div>';
      r18Row = (c.gender === 'f' && (c.pos === 'top' || c.pos === 'riba') ? '<label title="攻めに回る場面を、男性の体を前提にした描写で書きます。オメガバースでは使いません"><input type="checkbox" data-gf="futa"' + (c.futa ? ' checked' : '') + '> ふたなり（攻めのとき）</label>' : '') +
        (c.pos === 'top' || c.pos === 'riba' ? '<label title="住人どうしでは受け攻めの指定どおりで、モブ・魔物・村人・略奪者・星の生命体などの相手には受ける側になります">モブには <select data-gf="posNpc" aria-label="モブ・魔物が相手のとき"><option value=""' + (c.posNpc !== 'bottom' ? ' selected' : '') + '>受け攻めの指定どおり</option><option value="bottom"' + (c.posNpc === 'bottom' ? ' selected' : '') + '>受け</option></select></label>' : '') +
        '<label title="受けも攻めもせず、住人どうしの夜・モブや魔物に襲われる場面・執着の監禁の夜に出ません。殺し合いなどほかの出来事にはふつうに出ます。R18が中心の箱庭（エロトラップダンジョン・感覚遮断穴・常識改変・サキュバスの一夜・エロバラエティ・マッサージ）では効きません"><input type="checkbox" data-gf="noR18"' + (c.noR18 ? ' checked' : '') + '> R18に参加しない</label>' +
        '<label title="出られない部屋の三人の場面で、固定した相手（恋愛相手・性行為の相手）が中心にいれば、固定していない人が一緒でも参加します。その人とは直接触れ合わず、恋愛にもなりません。苦手な組み合わせの人とは一緒になりません"><input type="checkbox" data-gf="trioHub"' + (c.trioHub ? ' checked' : '') + '> 三人の場面：固定した相手が中心なら参加する</label>' +
        (c.pos !== 'top' ? '<label title="男性向けの作風で、絶頂や奥を深く突かれた場面の喘ぎを、あ゛・お゛のような濁点の喘ぎにします"><input type="checkbox" data-gf="daku"' + (c.daku ? ' checked' : '') + '> 濁点喘ぎ（男性向け）</label>' : '');
      if (r18Row) r18Row = '<div class="gearrow">' + r18Row + '</div>';
    }
    /* r18:end */
    var nightRow = HK.Attr && HK.Attr.nightHtml ? HK.Attr.nightHtml(c, { esc: esc, opt: opt, selOf: selOf }) : '';
    /* 相手ごとの設定（関係・呼び方・二人称/一人称・受け攻め・夜の性格） */
    var ties = s.ties || [], groups = {};
    ties.forEach(function (t, k) {
      var oid = t.a === c.id ? t.b : t.b === c.id ? t.a : null;
      if (!oid) return;
      (groups[oid] = groups[oid] || []).push([t, k]);
    });
    var calls = c.calls || {};
    var ex = extraOf(c);
    var rel = others.filter(function (o) { return groups[o.id] || calls[o.id] || ex[o.id] || (HK.Attr && HK.Attr.hasVoiceFor(c, o.id)); }).map(function (o) {
      var note = HK.Attr && HK.Attr.forNote ? HK.Attr.forNote(c, o) : '';
      var i = s.chars.indexOf(o);
      return '<div class="gtie"><div class="who">' + HK.Icons.html(o.name, i, 22) + esc(o.name) + '</div>' +
        (groups[o.id] || []).map(function (x) { return tieRow(c, o, x[0], x[1]); }).join('') +
        '<div class="one"><label>' + esc(c.name) + 'からの呼び方 <input type="text" data-gf="callone" data-o="' + o.id + '" value="' + esc(calls[o.id] || '') + '" maxlength="16" placeholder="' + esc(o.name + ({ name: '', san: 'さん', kun: 'くん', chan: 'ちゃん', sama: '様', senpai: '先輩', sensei: '先生' }[c.call] || '')) + '"></label>' + (HK.Attr && HK.Attr.voiceForHtml ? HK.Attr.voiceForHtml(c, o, esc) : '') +
        (HK.Attr && HK.Attr.forHtml ? '<span class="gforh">この人には：</span>' + HK.Attr.forHtml(c, o, { esc: esc, opt: opt }) : '') +
        '<button type="button" class="btn ghost small" data-gact="tadd" data-o="' + o.id + '">関係を重ねる</button></div>' + (note ? '<p class="gearhint gfnote">' + esc(note) + '</p>' : '') + '</div>';
    }).join('');
    /* 憎悪を持っても殺さない相手（どちらに付けても、二人のあいだでは殺す場面が思いとどまる場面になる。attr.js の HK.Attr.noKillPair） */
    /* 憎悪を持っても殺さない相手：折りたたみ（基本は閉じる）。説明は TIPS の「相手ごとの設定」に */
    var nkRow = others.length ? det('nk', '憎悪を持っても殺さない相手', sumOf(c.noKillFor, 'なし'), cbs('nokill', c.noKillFor)) : '';
    var addable = others.length ? '<div class="gearrow"><label>相手 <select data-gf="newo" aria-label="関係の相手">' + others.map(function (o) { return opt(o.id, o.name, ''); }).join('') + '</select></label>' +
      '<label>関係 <select data-gf="newt" aria-label="関係の種類">' + typeOpts('friend') + opt('', '（関係は付けずに相手ごとの設定だけ）', 'friend') + '</select></label>' + (function () { var gm = groupMates(c); return gm.length ? '<label title="' + esc('同じグループ（' + grpsOf(c).join('・') + '）の全員に、選んだ関係を付けます：' + gm.map(function (o) { return o.name; }).join('・') + '。向きのある関係は、' + c.name + 'が左（上司・先輩・師匠など）になります') + '"><input type="checkbox" data-gf="newgrp"> グループの全員と（' + gm.length + '人）</label>' : ''; })() + '<button type="button" class="btn small" data-gact="tnew">追加</button></div>' : '<p class="gearhint">ほかの住人がいません。</p>';
    return '<div class="gearhd">' + HK.Icons.html(c.name, s.chars.indexOf(c), 36) + '<h2 id="geartitle">' + esc(c.name) + 'の設定</h2><button type="button" class="btn small" data-gact="close">閉じる</button></div>' +
      /* 固定の説明は各節の ？（TIPS）に置き、ここには選んだものによって変わる説明（口調・関係・この住人の傾向）だけを出す */
      (HK.egoDesc ? '<details class="gego"' + (egoOpen ? ' open' : '') + '><summary>この住人の傾向<span class="gegc">' + esc(HK.toCode(c.eg)) + '・' + esc(HK.egoAttWord(c)) + '</span></summary><ul id="egodesc">' + HK.egoDesc(c).map(function (l) { return '<li>' + esc(l) + '</li>'; }).join('') + '</ul></details>' : '') +
      '<div class="gearsec"><h3>話し方' + (HK.Tips ? HK.Tips.btn('gear-talk') : '') + '</h3><div class="gearrow"><label>口調 ' + toneSel + '</label>' + (HK.Ending ? HK.Ending.badge(c) : '') + '<label>一人称 <input type="text" data-gf="fp" value="' + esc(c.fp || '') + '" maxlength="8" placeholder="空なら口調から"></label><label>二人称 <input type="text" data-gf="you" value="' + esc(c.you || '') + '" maxlength="8" placeholder="空なら口調から"></label></div>' + moanRow +
      '<div class="gearrow"><label title="文末の「。」「！」がこの記号になります。空白で区切って複数書くと、文ごとにランダムに選びます">語尾の記号 <input type="text" data-gf="marks" value="' + esc(c.marks || '') + '" maxlength="30" placeholder="例：！！！　または　♣ ♦" style="width:14em"></label>' +
      (HK.TONE_CUSTOM_OFF ? '' : '<label title="口調で言い換えたあとの台詞の語尾を、さらに付け替えます。「元→先」を読点で区切って5つまで">語尾の付け替え <input type="text" data-gf="toneCustom" value="' + esc(c.toneCustom || '') + '" maxlength="120" placeholder="例：です→っす、だ→だぜ" style="width:16em"></label>') + '</div>' +
      '<p class="gearhint">' + esc(tInfo ? tInfo.desc : '') + '</p>' +
      '<div class="tonesample anim" id="tonesample" aria-live="polite">' + sampleLines(c) + '</div>' +
      /* 語尾の設定（かんたん）：欄と見本は tone-ending.js */
      (HK.Ending ? HK.Ending.gearHtml(c, others[0], { esc: esc, opt: opt }) : '') +
      '<div class="gearrow"><label>基本の呼び方 ' + callSel + '</label><label><input type="checkbox" data-gf="keigoOlder"' + (c.keigoOlder ? ' checked' : '') + '> 年上の相手には敬語（年齢を決めた人どうし）</label></div>' +
      (others.length ? '<details class="gkeigo"' + (keigoOpen ? ' open' : '') + '><summary>敬語で話す相手 <span class="gkn">' + (function () { var n = others.filter(function (o) { return c.keigo && c.keigo[o.id]; }).length; return n ? n + '人' : 'なし'; })() + '</span></summary><div class="gearrow">' + others.map(function (o) { return '<label><input type="checkbox" data-gf="keigo" data-o="' + o.id + '"' + (c.keigo && c.keigo[o.id] ? ' checked' : '') + '> ' + esc(o.name) + '</label>'; }).join('') + '</div>' +
        ((c.tone || autoK) === 'polite' ? '<p class="gearhint">いまの口調は敬語なので、誰にでも敬語で話します。</p>' : '') + '</details>' : '') + '</div>' +
      /* ②プロフィール：性別・誕生月・年齢・お酒・恋愛対象・色 */
      '<div class="gearsec"><h3>プロフィール' + (HK.Tips ? HK.Tips.btn('gear-profile') : '') + '</h3><div class="gearrow"><label>性別 ' + selOf('gender', GENDERS, c.gender) + '</label>' +
        '<label>恋愛対象 ' + selOf('likes', LIKES, c.likes) + '</label>' +
        '<label>誕生月 ' + selOf('bmonth', [['', '決めない']].concat([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(function (m) { return [String(m), m + '月']; })), c.bmonth || '') + '</label>' +
        '<label>年齢 <input type="number" data-gf="age" min="1" max="150" value="' + esc(c.age || '') + '" placeholder="決めない" style="width:5em"></label>' +
        '<label title="酒の強さ。合コン・出られない部屋の酒・オメガバースの飲みの場面・邪神村の歓迎の宴や御神酒などで、酔いやすさや振る舞いが変わります。おまかせは気質から決まります">お酒 ' + selOf('alcohol', [['', 'おまかせ'], ['1', '弱い'], ['2', 'やや弱い'], ['3', 'ふつう'], ['4', '強い'], ['5', 'ザル']], c.alcohol || '') + '</label></div>' +
      '<div class="gearrow"><label><input type="checkbox" data-gf="colorauto"' + (c.color ? '' : ' checked') + '> イメージカラーは自動（並び順の色）</label><label>色 <input type="color" data-gf="color" value="' + esc(c.color || '#3d6f93') + '"' + (c.color ? '' : ' disabled') + ' aria-label="イメージカラー"></label></div></div>' +
      /* ③体と設定：体格・種族・心の強さ・同一人物・好物（R18版：胸・性器・性器の呼び方） */
      '<div class="gearsec"><h3>体と設定' + (HK.Tips ? HK.Tips.btn('gear-body') : '') + '</h3>' + (HK.Attr ? HK.Attr.gearHtml(c, others, { esc: esc, opt: opt, selOf: selOf }) : '') + partRow + '</div>' +
      /* ③'箱庭の能力：箱庭をまたいで共通の能力値・欄（体力・運・推理力・特殊役職 など。shared-stats.js） */
      (HK.Shared && HK.Shared.shown().length ? '<div class="gearsec"><h3>箱庭の能力' + (HK.Tips ? HK.Tips.btn('gear-ab') : '') + '</h3>' + HK.Shared.gearHtml(c, { esc: esc, opt: opt }) + '</div>' : '') +
      /* ④恋愛（R18版は恋愛と夜）：受け攻め・恋愛対象（受け攻め）・恋愛相手の固定・一途・恋愛にしない相手（R18：性行為の相手の固定・R18に参加しない・夜の性格・ふたなり など） */
      '<div class="gearsec"><h3>' + (HK.SAFE_ON ? '恋愛' : '恋愛と夜') + (HK.Tips ? HK.Tips.btn('gear-love') : '') + '</h3>' +
      '<div class="gearrow"><label>受け攻め ' + selOf('pos', POS, c.pos) + '</label>' +
        '<label>恋愛対象（受け攻め） ' + selOf('posLike', (HK.Pos ? HK.Pos.LIKE_OPTS : []).map(function (o) { return [o.v, o.label]; }), c.posLike || '') + '</label>' + nightRow + '</div>' +
      '<div class="gearrow">' + sexSel + '<label title="恋人ができたら、その恋人がいる間は、ほかの人と恋愛・夜の場面になりません（浮気しない）。恋人がいないうちは、ふつうに恋をします"><input type="checkbox" data-gf="faithful"' + (c.faithful ? ' checked' : '') + '> 一途（恋人ができたら、ほかの人に惹かれない・浮気しない）</label></div>' + r18Row +
      lockBox + sexBox + ngRow + '</div>' +
      /* ⑤相手ごとの設定：関係・呼び方・二人称/一人称・受け攻め・夜の性格 */
      '<div class="gearsec"><h3>相手ごとの設定' + (HK.Tips ? HK.Tips.btn('gear-ties') : '') + '</h3>' + nkRow + (rel || '<p class="gearhint">まだ相手ごとの設定はありません。下の「相手」と「関係」を選んで追加してください（関係を付けずに、受け攻めや呼び方だけを決めることもできます）。</p>') + addable + '</div>';
  }
  function render() {
    var c = byId(cur);
    if (!c) { close(); return; }
    var box = ov.querySelector('.gearbox'), y = ov.scrollTop;
    box.innerHTML = body(c);
    ov.scrollTop = y;
    sampleTick();
  }
  function open(id, from) {
    if (cur !== id) { keigoOpen = false; egoOpen = true; extra = {}; openMap = {}; }
    cur = id; opener = from || null;
    if (!ov) {
      ov = document.createElement('div');
      ov.className = 'gearov';
      ov.innerHTML = '<div class="gearbox" role="dialog" aria-modal="true" aria-labelledby="geartitle"></div>';
      document.body.appendChild(ov);
      ov.addEventListener('toggle', function (e) { if (e.target.classList && e.target.classList.contains('gkeigo')) keigoOpen = e.target.open; }, true);
      ov.addEventListener('toggle', function (e) { if (e.target.classList && e.target.classList.contains('gego')) egoOpen = e.target.open; }, true);
      ov.addEventListener('toggle', function (e) { if (e.target.classList && e.target.classList.contains('gdet')) openMap[e.target.dataset.k] = e.target.open; }, true);
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
    var b = ev.target.closest('[data-gact]');
    if (!b) return;
    var c = byId(cur), s = S(), act = b.dataset.gact;
    if (!c) return;
    s.ties = s.ties || [];
    if (act === 'close') close();
    else if (act === 'tdel') { s.ties.splice(+b.dataset.k, 1); changed(true); }
    else if (act === 'tadd' || act === 'tnew') {
      var oid = act === 'tadd' ? b.dataset.o : (ov.querySelector('[data-gf="newo"]') || {}).value;
      var ty = act === 'tadd' ? 'friend' : (ov.querySelector('[data-gf="newt"]') || {}).value;
      if (ty == null) ty = 'friend';
      /* 「関係は付けずに相手ごとの設定だけ」：行だけ出す（グループの全員にも） */
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
    if (HK.Attr && HK.Attr.gearField(c, f, t, isInput, changed, byId)) return;
    if (HK.Shared && HK.Shared.gearField(c, f, t, isInput, changed)) return;
    if (HK.Ending && HK.Ending.gearField(c, f, t, isInput, changed, sampleRefresh, s.chars.filter(function (x) { return x !== c; })[0])) return;
    switch (f) {
      case 'tone': if (isInput) return; c.tone = HK.toneValid && HK.toneValid(t.value) ? t.value : ''; changed(true); break;
      case 'moanTone': if (isInput) return; if (HK.toneValid && HK.toneValid(t.value)) c.moanTone = t.value; else delete c.moanTone; changed(true); break;
      case 'fp': c.fp = t.value.trim().slice(0, 8); changed(false); sampleRefresh(); break;
      case 'you': c.you = t.value.trim().slice(0, 8); changed(false); sampleRefresh(); break;
      case 'marks': c.marks = t.value.trim().slice(0, 30); changed(false); sampleRefresh(); break;
      case 'toneCustom': c.toneCustom = String(t.value).slice(0, 120); if (!isInput) c.toneCustom = HK.normToneCustom ? HK.normToneCustom(c.toneCustom) : ''; changed(false); sampleRefresh(); break;
      case 'call': if (isInput) return; c.call = t.value; changed(true); break;
      case 'callG': if (isInput) return; c.callG = c.callG || {}; c.callG[t.dataset.g] = t.value; changed(false); sampleRefresh(); break;
      case 'gender': case 'likes': if (isInput) return; c[f] = t.value; changed(false); if (f === 'gender') { sampleRefresh(); render(); } break;
      case 'bmonth': if (isInput) return; c.bmonth = t.value; changed(false); break;
      case 'age': c.age = +t.value >= 1 && +t.value <= 150 ? String(Math.floor(+t.value)) : ''; changed(false); break;
      case 'keigoOlder': if (isInput) return; c.keigoOlder = t.checked; changed(false); sampleRefresh(); break;
      case 'pos': if (isInput) return; c.pos = ['top', 'bottom', 'riba'].indexOf(t.value) >= 0 ? t.value : ''; changed(false); render(); break;
      case 'futa': if (isInput) return; c.futa = t.checked; changed(false); break;
      case 'daku': if (isInput) return; c.daku = t.checked; changed(false); break;
      case 'faithful': if (isInput) return; c.faithful = t.checked; changed(false); break;
      case 'noR18': if (isInput) return; c.noR18 = t.checked; changed(true); break;
      case 'trioHub': if (isInput) return; c.trioHub = t.checked; changed(false); break;
      case 'partWords': if (isInput) return; c.partWords = ['soft', 'direct', 'medical'].indexOf(t.value) >= 0 ? t.value : ''; changed(true); break;
      case 'partM': c.partM = t.value.replace(/[「」『』{}]/g, '').trim().slice(0, 10); changed(false); break;
      case 'partF': c.partF = t.value.replace(/[「」『』{}]/g, '').trim().slice(0, 10); changed(false); break;
      case 'alcohol': if (isInput) return; c.alcohol = HK.ALC_OK(t.value) ? t.value : ''; changed(true); break;
      case 'posNpc': if (isInput) return; c.posNpc = t.value === 'bottom' ? 'bottom' : ''; changed(false); break;
      case 'posLike': if (isInput) return; c.posLike = HK.Pos && HK.Pos.likeValid(t.value) ? t.value : ''; changed(false); break;
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
      case 'keigo': if (isInput) return; c.keigo = c.keigo || {}; if (t.checked) c.keigo[t.dataset.o] = 1; else delete c.keigo[t.dataset.o]; changed(false); sampleRefresh(); (function () { var kn = ov && ov.querySelector('.gkn'), n = ov ? ov.querySelectorAll('[data-gf="keigo"]:checked').length : 0; if (kn) kn.textContent = n ? n + '人' : 'なし'; })(); break;
      case 'callone': c.calls = c.calls || {}; if (t.value.trim()) c.calls[t.dataset.o] = t.value.trim().slice(0, 16); else delete c.calls[t.dataset.o]; changed(false); sampleRefresh(); break;
      case 'ttype': if (isInput || !tie) return; tie.type = t.value; var CO = HK.coldOpts ? HK.coldOpts(t.value) : null; if (!CO || !CO.map[tie.cold || '']) delete tie.cold; if (HK.tieExtraNorm) HK.tieExtraNorm(tie); changed(true); break;
      case 'textra': if (isInput || !tie) return; (function () { var xf = t.dataset.xf; if (t.value && !(tie.type === 'fiance' && t.value === 'eager')) tie[xf] = t.value; else delete tie[xf]; })(); changed(true); break;
      case 'tdir': if (isInput || !tie) return; var me = t.value === 'a'; var o = tie.a === c.id ? tie.b : tie.a, a0 = tie.a; tie.a = me ? c.id : o; tie.b = me ? o : c.id; if (tie.a !== a0 && (tie.lh === 'a' || tie.lh === 'b')) tie.lh = tie.lh === 'a' ? 'b' : 'a'; /* 向きを入れ替えても、愛憎を持つ人は同じ人のまま */ changed(true); break;
      case 'tlove': if (isInput || !tie) return; if (t.value === 'ok') tie.love = 'ok'; else delete tie.love; changed(false); break;
      case 'tcold': if (isInput || !tie) return; if (t.value) tie.cold = t.value; else delete tie.cold; changed(false); break;
    }
  }
  document.addEventListener('input', onField);
  document.addEventListener('change', onField);
  UI.openGear = open;
  /* ui.js が先に描いた住人の行に、要約と色を反映する */
  if (UI.refresh) UI.refresh();
})();
