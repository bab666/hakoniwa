/* 箱庭シミュレーター ui: 住人ごとの設定（⚙️）
   口調・一人称・基本の呼び方・性別・恋愛対象・受け攻め・イメージカラー・恋愛相手の固定と、
   その住人が関わる既存の関係・相手ごとの呼び方を、住人ごとにまとめて設定する。
   ※口調や関係は台詞・文面と関係の初期値に効く。行動の判断はエゴグラムの数値で決まる */
(function () {
  'use strict';
  var HK = window.HK, esc = HK.escape;
  if (!HK.UI) return;
  var UI = HK.UI;
  function S() { return UI.state(); }
  function byId(id) { return S().chars.filter(function (c) { return c.id === id; })[0] || null; }
  var GENDERS = [['', 'おまかせ'], ['m', '男性'], ['f', '女性'], ['x', 'その他']];
  var LIKES = [['', 'おまかせ（制限なし）'], ['m', '男性'], ['f', '女性'], ['both', '男女両方'], ['none', 'なし']];
  var POS = [['', 'おまかせ'], ['top', '攻め'], ['bottom', '受け'], ['riba', 'リバ']];
  function lab(list, v) { for (var i = 0; i < list.length; i++) if (list[i][0] === (v || '')) return list[i][1]; return ''; }
  function toneLabel(k) { var t = HK.toneInfo ? HK.toneInfo(k) : HK.PERSONA[k]; return t ? t.label : ''; }
  function callLabel(v) { var l = (HK.CALL_STYLES || []).filter(function (o) { return o.v === (v || ''); })[0]; return l ? l.label : ''; }
  function tiesOf(c) { UI.cleanTies(); return (S().ties || []).filter(function (t) { return t.a === c.id || t.b === c.id; }); }

  /* ---------- 住人の行に出す要約 ---------- */
  UI.summary = function (c) {
    var bits = [];
    bits.push('口調：' + (c.tone ? toneLabel(c.tone) : 'おまかせ（' + UI.autoTone(c) + '）'));
    if (c.fp) bits.push('一人称：' + c.fp);
    if (c.marks) bits.push('語尾：' + c.marks);
    if (c.call) bits.push('呼び方：' + callLabel(c.call));
    if (c.gender) bits.push(lab(GENDERS, c.gender));
    if (c.likes) bits.push('恋愛対象：' + lab(LIKES, c.likes));
    if (c.pos) bits.push(lab(POS, c.pos));
    var lk = c.loveLock && byId(c.loveLock);
    if (lk) bits.push('恋愛相手：' + lk.name + 'だけ');
    var sl = !HK.SAFE_ON && c.sexLock && byId(c.sexLock);
    if (sl) bits.push('体の関係：' + sl.name + 'だけ');
    else if (!HK.SAFE_ON && c.sexLock === 'any' && c.loveLock) bits.push('体の関係：誰とでも');
    else if (!HK.SAFE_ON && c.sexLock === 'lover') bits.push('体の関係：恋人とモブだけ');
    else if (!HK.SAFE_ON && c.sexLock === 'loverOnly') bits.push('体の関係：恋人だけ');
    if (!HK.SAFE_ON && c.noR18) bits.push('R18に参加しない');
    var ngs = (c.loveNG || []).map(byId).filter(Boolean);
    if (ngs.length) bits.push('恋愛にしない：' + ngs.map(function (o) { return o.name; }).join('・'));
    var n = tiesOf(c).length;
    if (n) bits.push('関係 ' + n + '件');
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
    'details.gkeigo{margin:8px 0 0;border:1px solid var(--line);border-radius:8px;padding:6px 10px}details.gkeigo summary{cursor:pointer;font-size:13px;color:var(--muted)}details.gkeigo .gkn{font-size:12px;margin-left:4px;color:var(--ink)}details.gkeigo[open] summary{margin-bottom:4px}' +
    '@media (max-width:520px){.gearbox{padding:12px}.gtie input[type=text]{width:100%}}';
  var st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);

  /* ---------- 設定の窓 ---------- */
  var cur = null, ov = null, opener = null, keigoOpen = false;
  function opt(v, label, sel, title) { return '<option value="' + esc(v) + '"' + (v === sel ? ' selected' : '') + (title ? ' title="' + esc(title) + '"' : '') + '>' + esc(label) + '</option>'; }
  function selOf(f, list, v, extra) { return '<select data-gf="' + f + '"' + (extra || '') + '>' + list.map(function (o) { return opt(o[0], o[1], v || ''); }).join('') + '</select>'; }
  function typeOpts(sel) {
    return HK.TIE_ORDER.map(function (id) { var d = HK.TIES[id]; return opt(id, d.label, sel); }).join('');
  }
  function tieRow(c, o, t, k) {
    var D = HK.TIES[t.type], h = '<div class="one">' +
      '<select data-gf="ttype" data-k="' + k + '" aria-label="' + esc(o.name) + 'との関係の種類">' + typeOpts(t.type) + '</select>';
    if (D.dir) h += '<select data-gf="tdir" data-k="' + k + '" aria-label="関係の向き">' + opt('a', c.name + 'が' + D.roleA, t.a === c.id ? 'a' : 'b') + opt('b', c.name + 'が' + D.roleB, t.a === c.id ? 'a' : 'b') + '</select>';
    var CO = HK.coldOpts ? HK.coldOpts(t.type) : null;
    if ((D.family && !D.loveOK) || D.loveOpt) h += '<select data-gf="tlove" data-k="' + k + '" aria-label="恋愛">' + opt('', D.loveOpt ? '恋愛に発展：しない' : '恋愛：なし', t.love || '') + opt('ok', D.loveOpt ? '恋愛に発展：する' : '恋愛：あり', t.love || '') + '</select>';
    if (CO) h += '<select data-gf="tcold" data-k="' + k + '" aria-label="' + CO.aria + '">' + CO.order.map(function (id) { return opt(id, CO.map[id].label, t.cold || ''); }).join('') + '</select>';
    h += '<button type="button" class="btn ghost small" data-gact="tdel" data-k="' + k + '">外す</button></div>';
    return h + '<p class="gearhint">' + esc(D.effect || '') + (t.love === 'ok' && D.family ? '。恋愛：ありにしているので、恋愛に発展することもある（信頼が崩れにくいのは同じ）' : '') + (D.loveOpt ? (t.love === 'ok' ? '。恋愛に発展：するにしているので、想いが恋に変わることもある' : '。恋愛に発展：しないにしているので、想いは恋にならない') : '') + '</p>';
  }
  /* 口調の見本：ふつうの言い回しの台詞を、この住人の口調・一人称・呼び方に直して見せる（数秒ごとに切り替わる） */
  /* 口調ごとの見本は tone-registry.js の sample（一人称は「私」、相手は{o}で書き、表示のときに本人の一人称・呼び方に直す） */
  var SAMPLE = {};
  Object.keys(HK.TONES || {}).forEach(function (k) { if (HK.TONES[k].sample) SAMPLE[k] = HK.TONES[k].sample; });
  /* 性別で見本を分けている口調（sampleF / sampleM）は、その性別のときだけそちらを使う */
  function sampleOf(tk, g) { var T = HK.TONES[tk] || {}; return (g === 'f' && T.sampleF) || (g === 'm' && T.sampleM) || SAMPLE[tk]; }
  function sampleLines(c) {
    var V = HK.Voice;
    if (!V || !V.processText) return '';
    var s = S(), o = s.chars.filter(function (x) { return x !== c; })[0] || { name: '相手', id: '' };
    var me = { name: c.name, fp: c.fp || '', you: c.you || '', marks: c.marks || '', gender: c.gender || '', tone: HK.toneOf ? HK.toneOf(c) : c.tone || '', call: c.call || '', callG: c.callG || null, calls: c.calls || null };
    var kgo = c.keigo ? s.chars.filter(function (x) { return x !== c && c.keigo[x.id]; })[0] : null;
    me.persona = HK.personaOf ? HK.personaOf({ tone: c.tone, eg: c.eg }) : 'gentle';
    var ppl = [me, { name: o.name, fp: '', gender: o.gender || '', tone: '', persona: 'gentle' }];
    if (me.calls && o.id && me.calls[o.id]) { me.calls = {}; me.calls[o.name] = c.calls[o.id]; } else me.calls = null;
    var tk = me.tone && SAMPLE[me.tone] ? me.tone : SAMPLE[me.persona] ? me.persona : 'gentle';
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
  function body(c) {
    var s = S(), others = s.chars.filter(function (x) { return x !== c; });
    var autoK = HK.toneAuto ? HK.toneAuto(HK.traits(c.eg)) : HK.personaAuto(HK.traits(c.eg));
    var keys = HK.TONE_KEYS || HK.PERSONA_KEYS;
    var toneSel = '<select data-gf="tone" aria-label="口調">' + opt('', 'おまかせ（' + toneLabel(autoK) + '）', c.tone || '') + keys.map(function (k) { var t = HK.toneInfo ? HK.toneInfo(k) : HK.PERSONA[k]; return opt(k, t.label, c.tone || '', t.desc); }).join('') + '</select>';
    var tInfo = HK.toneInfo ? HK.toneInfo(c.tone || autoK) : HK.PERSONA[c.tone || autoK];
    var callSel = '<select data-gf="call" aria-label="基本の呼び方">' + (HK.CALL_STYLES || [{ v: '', label: 'おまかせ' }]).map(function (o) { return opt(o.v, o.label, c.call || ''); }).join('') + '</select>';
    /* 相手の性別で分けるとき：男性・女性・その他ごとの敬称 */
    var SUF = (HK.CALL_STYLES || []).filter(function (o) { return o.v && o.v !== 'gender'; }), CGD = { m: 'kun', f: 'chan', x: 'san' };
    if (c.call === 'gender') callSel += [['m', '男性'], ['f', '女性'], ['x', 'その他']].map(function (g) { return '<label>' + g[1] + 'には <select data-gf="callG" data-g="' + g[0] + '" aria-label="' + g[1] + 'の呼び方">' + SUF.map(function (o) { return opt(o.v, o.label, (c.callG && c.callG[g[0]]) || CGD[g[0]]); }).join('') + '</select></label>'; }).join('');
    /* 恋愛・R18にしない相手（苦手な組み合わせ）。どちらに付けても、二人のあいだでは恋愛・R18の場面が起きない */
    var ngRow = others.length ? '<div class="gearrow"><span class="gearhint" style="flex:1 1 100%;margin:0">' + (HK.SAFE_ON ? '恋愛にしない相手' : '恋愛・R18にしない相手') + '（この人との恋愛・夜の場面を起こさない。相手の設定にも同じ印が付きます）</span>' + others.map(function (o) { return '<label><input type="checkbox" data-gf="ng" data-o="' + esc(o.id) + '"' + ((c.loveNG || []).indexOf(o.id) >= 0 ? ' checked' : '') + '> ' + esc(o.name) + '</label>'; }).join('') + '</div>' : '';
    var lockSel = '<select data-gf="lock" aria-label="恋愛相手の固定"><option value="">固定しない</option>' + others.map(function (o) { return opt(o.id, o.name + 'だけ', c.loveLock || ''); }).join('') + '</select>';
    /* 性行為の相手の固定（R18版のみ）：恋愛は縛らず、体の関係（夜・R18の場面）だけをこの相手に限る */
    var sexSel = HK.SAFE_ON ? '' : '<label>性行為の相手を固定 <select data-gf="sexlock" aria-label="性行為の相手の固定"><option value="">恋愛相手の固定に合わせる</option>' + opt('any', '誰とでも可（恋愛は固定のまま）', c.sexLock || '') + opt('lover', '恋人とモブだけ', c.sexLock || '') + opt('loverOnly', '恋人だけ（モブにも襲われない）', c.sexLock || '') + others.map(function (o) { return opt(o.id, o.name + 'だけ', c.sexLock || ''); }).join('') + '</select></label>';
    /* 関係（相手ごと） */
    var ties = s.ties || [], groups = {};
    ties.forEach(function (t, k) {
      var oid = t.a === c.id ? t.b : t.b === c.id ? t.a : null;
      if (!oid) return;
      (groups[oid] = groups[oid] || []).push([t, k]);
    });
    var calls = c.calls || {};
    var rel = others.filter(function (o) { return groups[o.id] || calls[o.id]; }).map(function (o) {
      var i = s.chars.indexOf(o);
      return '<div class="gtie"><div class="who">' + HK.Icons.html(o.name, i, 22) + esc(o.name) + '</div>' +
        (groups[o.id] || []).map(function (x) { return tieRow(c, o, x[0], x[1]); }).join('') +
        '<div class="one"><label>' + esc(c.name) + 'からの呼び方 <input type="text" data-gf="callone" data-o="' + o.id + '" value="' + esc(calls[o.id] || '') + '" maxlength="16" placeholder="' + esc(o.name + ({ name: '', san: 'さん', kun: 'くん', chan: 'ちゃん', sama: '様', senpai: '先輩', sensei: '先生' }[c.call] || '')) + '"></label>' +
        '<button type="button" class="btn ghost small" data-gact="tadd" data-o="' + o.id + '">関係を重ねる</button></div></div>';
    }).join('');
    var addable = others.length ? '<div class="gearrow"><label>相手 <select data-gf="newo" aria-label="関係の相手">' + others.map(function (o) { return opt(o.id, o.name, ''); }).join('') + '</select></label>' +
      '<label>関係 <select data-gf="newt" aria-label="関係の種類">' + typeOpts('friend') + '</select></label><button type="button" class="btn small" data-gact="tnew">関係を追加</button></div>' : '<p class="gearhint">ほかの住人がいません。</p>';
    return '<div class="gearhd">' + HK.Icons.html(c.name, s.chars.indexOf(c), 36) + '<h2 id="geartitle">' + esc(c.name) + 'の設定</h2><button type="button" class="btn small" data-gact="close">閉じる</button></div>' +
      '<p class="gearhint">行動はエゴグラムだけで決まります。ここで決めるのは台詞の見た目と関係の初期値です。見出しの ？ に詳しい説明があります。</p>' +
      '<div class="gearsec"><h3>話し方' + (HK.Tips ? HK.Tips.btn('gear-talk') : '') + '</h3><div class="gearrow"><label>口調 ' + toneSel + '</label><label>一人称 <input type="text" data-gf="fp" value="' + esc(c.fp || '') + '" maxlength="8" placeholder="空なら口調から"></label><label>二人称 <input type="text" data-gf="you" value="' + esc(c.you || '') + '" maxlength="8" placeholder="空なら口調から"></label></div>' +
      '<div class="gearrow"><label>語尾の記号 <input type="text" data-gf="marks" value="' + esc(c.marks || '') + '" maxlength="30" placeholder="例：！！！　または　♣ ♦" style="width:14em"></label></div>' +
      '<p class="gearhint">文末の「。」「！」がこの記号になります。空白で区切って複数書くと、文ごとにランダムに選びます。空なら付けません。</p>' +
      '<p class="gearhint">' + esc(tInfo ? tInfo.desc : '') + '</p>' +
      '<div class="tonesample anim" id="tonesample" aria-live="polite">' + sampleLines(c) + '</div>' +
      '<div class="gearrow"><label>基本の呼び方 ' + callSel + '</label><label><input type="checkbox" data-gf="keigoOlder"' + (c.keigoOlder ? ' checked' : '') + '> 年上の相手には敬語（年齢を決めた人どうし）</label></div>' +
      (others.length ? '<details class="gkeigo"' + (keigoOpen ? ' open' : '') + '><summary>敬語で話す相手 <span class="gkn">' + (function () { var n = others.filter(function (o) { return c.keigo && c.keigo[o.id]; }).length; return n ? n + '人' : 'なし'; })() + '</span></summary><div class="gearrow">' + others.map(function (o) { return '<label><input type="checkbox" data-gf="keigo" data-o="' + o.id + '"' + (c.keigo && c.keigo[o.id] ? ' checked' : '') + '> ' + esc(o.name) + '</label>'; }).join('') + '</div>' +
        ((c.tone || autoK) === 'polite' ? '<p class="gearhint">いまの口調は敬語なので、誰にでも敬語で話します。</p>' : '') + '</details>' : '') + '</div>' +
      '<div class="gearsec"><h3>プロフィール' + (HK.Tips ? HK.Tips.btn('gear-profile') : '') + '</h3><div class="gearrow"><label>性別 ' + selOf('gender', GENDERS, c.gender) + '</label>' +
        '<label>誕生月 ' + selOf('bmonth', [['', '決めない']].concat([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(function (m) { return [String(m), m + '月']; })), c.bmonth || '') + '</label>' +
        '<label>年齢 <input type="number" data-gf="age" min="1" max="150" value="' + esc(c.age || '') + '" placeholder="決めない" style="width:5em"></label>' +
        '<label>恋愛対象 ' + selOf('likes', LIKES, c.likes) + '</label><label>受け攻め ' + selOf('pos', POS, c.pos) + '</label>' +
        (!HK.SAFE_ON && c.gender === 'f' && (c.pos === 'top' || c.pos === 'riba') ? '<label title="攻めに回る場面を、男性の体を前提にした描写で書きます。オメガバースでは使いません"><input type="checkbox" data-gf="futa"' + (c.futa ? ' checked' : '') + '> ふたなり（攻めのとき）</label>' : '') +
        (!HK.SAFE_ON ? '<label title="受けも攻めもせず、住人どうしの夜・モブや魔物に襲われる場面・執着の監禁の夜に出ません。殺し合いなどほかの出来事にはふつうに出ます。R18が中心の箱庭（エロトラップダンジョン・感覚遮断穴・常識改変・サキュバスの一夜・エロバラエティ・マッサージ）では効きません"><input type="checkbox" data-gf="noR18"' + (c.noR18 ? ' checked' : '') + '> R18に参加しない</label>' : '') +
        (!HK.SAFE_ON && c.pos !== 'top' ? '<label title="男性向けの作風で、絶頂や奥を深く突かれた場面の喘ぎを、あ゛・お゛のような濁点の喘ぎにします"><input type="checkbox" data-gf="daku"' + (c.daku ? ' checked' : '') + '> 濁点喘ぎ（男性向け）</label>' : '') +
        '<label>恋愛対象（受け攻め） ' + selOf('posLike', (HK.Pos ? HK.Pos.LIKE_OPTS : []).map(function (o) { return [o.v, o.label]; }), c.posLike || '') + '</label></div>' +
      '<div class="gearrow"><label><input type="checkbox" data-gf="colorauto"' + (c.color ? '' : ' checked') + '> イメージカラーは自動（並び順の色）</label><label>色 <input type="color" data-gf="color" value="' + esc(c.color || '#3d6f93') + '"' + (c.color ? '' : ' disabled') + ' aria-label="イメージカラー"></label></div></div>' +
      '<div class="gearsec"><h3>恋愛' + (HK.Tips ? HK.Tips.btn('gear-love') : '') + '</h3><div class="gearrow"><label>恋愛相手を固定 ' + lockSel + '</label>' + sexSel + '</div>' + (sexSel ? '<p class="gearhint">性行為の相手の固定：「恋愛相手の固定に合わせる」は、恋愛相手を固定していればその相手とだけ（していなければ誰とでも）。「誰とでも可」は、恋愛は固定した相手とだけ・体の関係はほかの住人とも（体の関係があっても恋人にはならない）。「恋人とモブだけ」は、住人では恋人（固定した恋愛相手・関係の恋人・その場で恋人になった相手）とだけ。「〇〇だけ」は、恋愛はほかの人ともするが、住人どうしの夜・R18の場面（三人の場面も）はその相手とだけ（その相手が箱庭にいなければ誰とも）。魔物・マッサージ師など、箱庭の仕掛けの相手の場面は縛りません。</p>' : '') + ngRow + '</div>' +
      '<div class="gearsec"><h3>関係と呼び方' + (HK.Tips ? HK.Tips.btn('gear-ties') : '') + '</h3>' + (rel || '<p class="gearhint">まだ関係はありません。</p>') + addable + '</div>';
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
    if (cur !== id) keigoOpen = false;
    cur = id; opener = from || null;
    if (!ov) {
      ov = document.createElement('div');
      ov.className = 'gearov';
      ov.innerHTML = '<div class="gearbox" role="dialog" aria-modal="true" aria-labelledby="geartitle"></div>';
      document.body.appendChild(ov);
      ov.addEventListener('toggle', function (e) { if (e.target.classList && e.target.classList.contains('gkeigo')) keigoOpen = e.target.open; }, true);
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
      var ty = act === 'tadd' ? 'friend' : (ov.querySelector('[data-gf="newt"]') || {}).value || 'friend';
      if (!oid || !byId(oid)) return;
      if (s.ties.some(function (t) { return t.type === ty && ((t.a === c.id && t.b === oid) || (t.a === oid && t.b === c.id)); })) { UI.toast('同じ関係がすでにあります'); return; }
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
    switch (f) {
      case 'tone': if (isInput) return; c.tone = HK.toneValid && HK.toneValid(t.value) ? t.value : ''; changed(true); break;
      case 'fp': c.fp = t.value.trim().slice(0, 8); changed(false); sampleRefresh(); break;
      case 'you': c.you = t.value.trim().slice(0, 8); changed(false); sampleRefresh(); break;
      case 'marks': c.marks = t.value.trim().slice(0, 30); changed(false); sampleRefresh(); break;
      case 'call': if (isInput) return; c.call = t.value; changed(true); break;
      case 'callG': if (isInput) return; c.callG = c.callG || {}; c.callG[t.dataset.g] = t.value; changed(false); sampleRefresh(); break;
      case 'gender': case 'likes': if (isInput) return; c[f] = t.value; changed(false); if (f === 'gender') { sampleRefresh(); render(); } break;
      case 'bmonth': if (isInput) return; c.bmonth = t.value; changed(false); break;
      case 'age': c.age = +t.value >= 1 && +t.value <= 150 ? String(Math.floor(+t.value)) : ''; changed(false); break;
      case 'keigoOlder': if (isInput) return; c.keigoOlder = t.checked; changed(false); sampleRefresh(); break;
      case 'pos': if (isInput) return; c.pos = ['top', 'bottom', 'riba'].indexOf(t.value) >= 0 ? t.value : ''; changed(false); render(); break;
      case 'futa': if (isInput) return; c.futa = t.checked; changed(false); break;
      case 'daku': if (isInput) return; c.daku = t.checked; changed(false); break;
      case 'noR18': if (isInput) return; c.noR18 = t.checked; changed(true); break;
      case 'posLike': if (isInput) return; c.posLike = HK.Pos && HK.Pos.likeValid(t.value) ? t.value : ''; changed(false); break;
      case 'colorauto': if (isInput) return; if (t.checked) c.color = ''; else c.color = (ov.querySelector('[data-gf="color"]') || {}).value || '#3d6f93'; changed(true); UI.applyColors(s.chars); break;
      case 'color': if (/^#[0-9a-fA-F]{6}$/.test(t.value)) { c.color = t.value; UI.applyColors(s.chars); changed(false); } break;
      case 'lock': if (isInput) return; c.loveLock = t.value; changed(false); break;
      case 'sexlock': if (isInput) return; c.sexLock = t.value; changed(false); break;
      case 'ng': if (isInput) return; (function () {
        var o = byId(t.dataset.o); if (!o) return;
        c.loveNG = (c.loveNG || []).filter(function (k) { return k !== o.id; }); o.loveNG = (o.loveNG || []).filter(function (k) { return k !== c.id; });
        if (t.checked) { c.loveNG.push(o.id); o.loveNG.push(c.id); if (c.loveLock === o.id) c.loveLock = ''; if (o.loveLock === c.id) o.loveLock = ''; }
        changed(true);
      })(); break;
      case 'keigo': if (isInput) return; c.keigo = c.keigo || {}; if (t.checked) c.keigo[t.dataset.o] = 1; else delete c.keigo[t.dataset.o]; changed(false); sampleRefresh(); (function () { var kn = ov && ov.querySelector('.gkn'), n = ov ? ov.querySelectorAll('[data-gf="keigo"]:checked').length : 0; if (kn) kn.textContent = n ? n + '人' : 'なし'; })(); break;
      case 'callone': c.calls = c.calls || {}; if (t.value.trim()) c.calls[t.dataset.o] = t.value.trim().slice(0, 16); else delete c.calls[t.dataset.o]; changed(false); sampleRefresh(); break;
      case 'ttype': if (isInput || !tie) return; tie.type = t.value; var CO = HK.coldOpts ? HK.coldOpts(t.value) : null; if (!CO || !CO.map[tie.cold || '']) delete tie.cold; changed(true); break;
      case 'tdir': if (isInput || !tie) return; var me = t.value === 'a'; var o = tie.a === c.id ? tie.b : tie.a; tie.a = me ? c.id : o; tie.b = me ? o : c.id; changed(true); break;
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
