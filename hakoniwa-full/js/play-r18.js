/* @event-ok 温度の重み・飽きない決まり（同じ組の入り方・責めを続けない・道具は 2 回まで）・部屋だけの新しい値の口 addValue を足した（2026-11-06。新しい出来事ではない） */
/* @event-ok エッチの型（入り方・主な責め・道具・体位・終わり方）と性格が目立つ行為の段を、既にある長い場面に差すだけ。部屋ごとの場面の登録口（HK.Play.addScene）も、登録した部屋の側で @event を付ける。2026-11-03 */
/* 箱庭シミュレーター（R18版のみ）: エッチの型（HK.Play）
   設計：docs/reports/2026-11-03/play-design.md（仕様書の「エッチの型：入り方・主な責め・道具・体位・終わり方の 5 つを組み合わせて一回のエッチを作る」）
   ■ 一回の長い場面（HK.ThickSex.scene・HK.ThickEro.scene）ごとに、型 play = { entry, focus, prop, pos, finish } を一つ決め、
     本体の組み立てが出した本文を型に沿って組み替える（sex-flow-r18.js の包みが、流れの管理 F.fix の前に P.apply を呼ぶ）：
       入り方 entry  … 前戯の段の前に「入り方」の段を置く（夜の主導で受けから始める夜は、夜の主導の段がそのまま入り方：entry='lead'）
       主な責め focus … 前戯の段（T.FORE・X.FORE）を、その責めの前戯の段に置き換える。最中の段にも責めの一文
       道具・状況 prop … 前戯の段の頭と最中の段に一文。着衣（chakui）は「脱がせる」文を全部の段から外し、事後まで服の描写を続ける
       体位 pos      … 繋がる段（T.BODY・ROUGH_BODY・FM_BODY・FF_BODY…）を、その体位で繋がる段に置き換え、最中の段（「そのまま、…」）を足す。
                       体位はそのあと固定（流れの管理が、別の体位を前提にした言い回しをつなぎの段ではなく一文を外して直す）
       終わり方 finish … 果てる段の文（T.CLIMAX…・X.CLIMAX…）を、その終わり方の文に置き換える（受けの果てる声はそのまま）
     そのうえで、性格が目立つ行為の段（叩く・噛む・髪を掴む・言葉責め・名前を呼ばせる・甘やかす…。HK.PlayAct：攻めの態度 9 種 × 夜の性格 6 種）と受けの反応を最中に一つ。
   ■ 選び方（P.choose）：二人の態度・夜の性格・性欲・体の特徴（獣の耳・尻尾・体格差・身長差・胸）・関係・きっかけ（嫉妬・強引・愛憎・受けから・夜の主導）・場所（opt.place・箱庭）で重み付け。
     同じ二人の前の型と同じ値は選ばれにくく（HK.SexFlow.memo。一回の遊びのあいだ）。乱数は本筋の乱数を使わない（名前・回ごとの通し番号・シードから）
   ■ 短い・中くらいの場面（HK.ThickEro.short、HK.Attr.nightText を長い場面の外から呼ぶ追加パックの場面など）には、主な責めと体位の一文だけを足す（P.shortLine）
   ■ 部屋ごとの専用の長い場面（P.addScene）・部屋の小道具の重み（P.addRoom）：下の「部屋の受け口」と play-design.md の 4
   ■ 全年齢（HK.SAFE_ON）では何もしない。全年齢版にはこのファイルはない。登場人物はすべて成人として扱う */
(function () {
  'use strict';
  var HK = window.HK;
  if (!HK || HK.Play) return;
  var P = HK.Play = { off: false, log: null, ROOM: {}, SCENES: {}, SHORT: {} };
  function TX() { return HK.PlayText || {}; }
  function AC() { return HK.PlayAct || null; }

  /* ---------- 軸と値（表示名は点検・文書用） ---------- */
  P.AXES = {
    entry: { kiss: 'キスから', push: '押し倒す', backhug: '後ろから抱きすくめる', whisper: '耳元で囁いて', amae: '甘えて', bath: '風呂上がりに', nekomi: '寝入りばなに', hurry: '我慢できずに', jealous: '嫉妬で迫る', lead: '受けから誘う（夜の主導）' },
    focus: { mune: '胸を責める', chikubi: '乳首を責める', mimi: '耳と首筋', kotoba: '言葉責め', jirashi: '焦らし', koshi: '背中と腰', te: '手だけ', kuchi: '口だけ', zenshin: '全身にキス' },
    prop: { none: '無し', chakui: '着衣のまま', mekakushi: '目隠し', kagami: '鏡の前', omocha: '玩具', lotion: 'ローション' },
    pos: { seijo: '正常位', back: '後背位', kijo: '騎乗位（受けが上）', zai: '座位', tachi: '立ったまま', osae: '押さえつけ', nebak: '寝バック', kakae: '抱え上げ' },
    finish: { naka: '中で', soto: '外で', issho: '一緒に', uke: '受けだけ先に', again: '二度目へ', renzoku: '続けて何度も' }
  };
  /* 組ごとに使える値（女性の攻め（男性器なし）×男性器のある受け fm は、指と手・ペニバンで攻めが受けの{後ろ}を責める組なので「受けが上」「寝バック」「抱え上げ」は無い。女性どうし ff は中・外が無い） */
  P.MODE = {
    pos: { mf: ['seijo', 'back', 'kijo', 'zai', 'tachi', 'osae', 'nebak', 'kakae'], ff: ['seijo', 'back', 'kijo', 'zai', 'tachi', 'osae', 'nebak'], fm: ['seijo', 'back', 'zai', 'tachi', 'osae'] },
    finish: { mf: ['naka', 'soto', 'issho', 'uke', 'again'], ff: ['issho', 'uke', 'again', 'renzoku'], fm: ['naka', 'soto', 'issho', 'uke', 'again'] }
  };
  /* 体位 → 流れの管理の体位（HK.SexFlow の posture）。立ったまま・抱え上げは数えない */
  P.POSTURE = { seijo: 'aUp', back: 'rear', kijo: 'bUp', zai: 'sit', tachi: null, osae: 'aUp', nebak: 'rear', kakae: null };

  /* ---------- 乱数（本筋の乱数を使わない） ---------- */
  function hashOf(s) { var h = 2166136261; s = String(s); if (HK.Voice && HK.Voice.markOut) s = HK.Voice.markOut(s); for (var i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }
  function rngOf(seed) { var h = seed >>> 0; var f = function () { h = (h + 0x6D2B79F5) >>> 0; var t = h; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; f.int = function (n) { return Math.floor(f() * n); }; return f; }
  P.rngOf = rngOf; P.hashOf = hashOf;
  /* 一回の遊び（シミュレーション）の覚え書き：HK.SexFlow.memo（シミュレーションごとに作り直される） */
  function memo() {
    var F = HK.SexFlow, M = (F && F.memo) || P._memo || (P._memo = {});
    if (!M.play) M.play = { n: 0, pair: {}, used: {}, cnt: 0, fs: null };
    return M.play;
  }
  P.memo = memo;
  /* 使っていない文から選ぶ（一回の遊びで同じ文を二度出さない。全部使ったら、いちばん前に使ったものから戻す） */
  function pickFresh(R, arr) {
    if (!arr || !arr.length) return '';
    if (HK.SceneTime && HK.SceneTime.cur) arr = HK.SceneTime.filter(arr);
    var m = memo(), best = Infinity, sub = [];
    arr.forEach(function (x) { var v = m.used[x] == null ? -1 : m.used[x]; if (v < best) { best = v; sub = [x]; } else if (v === best) sub.push(x); });
    var s = sub[Math.floor(R() * sub.length)];
    m.used[s] = ++m.cnt;
    return s;
  }
  P.pickFresh = pickFresh;
  function wpick(R, w) {
    var ks = Object.keys(w).filter(function (k) { return w[k] > 0; }), tot = 0;
    if (!ks.length) return '';
    ks.forEach(function (k) { tot += w[k]; });
    var x = R() * tot;
    for (var i = 0; i < ks.length; i++) { x -= w[ks[i]]; if (x < 0) return ks[i]; }
    return ks[ks.length - 1];
  }

  /* ---------- 二人の様子 ---------- */
  function psOf(c, o) {
    var A = HK.Attr, v = A && A.nightAtt ? A.nightAtt(c, o) : '';
    if (!v) v = HK.personaOf ? HK.personaOf(c) : c && c.persona;
    return /^(proud|stern|tsun|gentle|devoted|cool|free|shy|polite)$/.test(v || '') ? v : 'gentle';
  }
  P.psOf = psOf;
  function kindOf(c, o) { var A = HK.Attr; return A && A.nightKind ? A.nightKind(c, o) || '' : ''; }
  function feat(c, k) { var A = HK.Attr; return !!(A && A.feat && A.feat(c, k)); }
  function bust(c) { return (c && (c.bust || (c.src && c.src.bust))) || ''; }
  function libOf(c) { var Q = HK.Pos; return Q && Q.libOf ? Q.libOf(c) : ''; }
  function scenIdOf(opt) {
    var c = (opt && (opt.ctx || opt.S)) || HK._curCtx;
    if (c && c.input && c.input.scenId) return c.input.scenId;
    if (c && c.S && c.S.input && c.S.input.scenId) return c.S.input.scenId;
    return HK._curCtx && HK._curCtx.input ? HK._curCtx.input.scenId : '';
  }
  P.scenIdOf = scenIdOf;
  function relOf(opt, a, b) {
    if (opt.rel) return opt.rel;
    var ET = HK.EroTop;
    try { return ET && ET.relOf ? ET.relOf(opt.ctx || opt.S || opt.rng, a, b) || '' : ''; } catch (e) { return ''; }
  }
  /* 型を付けられる組か（性器の指定で文の前提が崩れる組・性器なしの人がいる組は付けない） */
  P.ok = function (a, b, mode) {
    if (P.off || HK.SAFE_ON || !a || !b || !TX().POS) return false;
    var Q = HK.Pos;
    if (HK.NoGen && HK.NoGen.on && HK.NoGen.on(a, b)) return false;
    if (Q && Q.hasM && Q.hasF) {
      if (mode === 'mf' && !Q.hasM(a)) return false;
      if (mode === 'fm' && (!Q.hasM(b) || !Q.hasF(a))) return false;
      if (mode === 'ff' && !Q.hasF(b)) return false;
    }
    return true;
  };
  /* 女性の攻め（男性器なし）× 男性器のある受け（fm）：型の共通の文（play-text*-r18.js の fm）は指と手で受けの{後ろ}を責める書き方。
     本体の場面がペニバンの回（thick-sex.js の T.strapPick。sex-flow-r18.js が info.strap で渡す。無ければ本文の「ペニバン・張り型」）なら、
     体位・最中の頭・終わり方は fsp（腰に着けた張り型の文）を使う（同じ場面の中で指とペニバンを混ぜない。2026-11-05。それまでは HK.Play.fmNoPen で fm には型を使わなかった）。
     フタナリの攻め（男性器のある女性）は mf の組なので当たらない */
  P.strapOf = function (info, t, mode) {
    var Q = HK.Pos, a = info && info.a;
    if (mode !== 'fm' || !a || (Q && Q.hasM && Q.hasM(a))) return false;
    if (info.strap != null) return !!info.strap;
    return /ペニバン|張り型/.test(narrOf(String(t || '')));
  };
  /* 場所の決まり：この場所では使わない値 */
  var PLACE_NG = {
    room: { entry: ['bath', 'nekomi'], prop: ['kagami', 'omocha'] },
    locker: { entry: ['nekomi'] },
    island: { entry: ['nekomi'], prop: ['kagami', 'omocha', 'lotion'] },
    zombie: { entry: ['bath'], prop: ['kagami', 'omocha', 'lotion'] },
    ship: { entry: ['bath'] },
    dream: { entry: ['bath', 'nekomi'] }
  };

  /* ---------- 夜の性格の展開（HK.PlayArc） ---------- */
  function arcChoose(a, b, mode, ka, kb, last, key, m) {
    var PA = HK.PlayArc, AR = PA && PA.ARC;
    if (!AR || P.arcOff) return null;
    var ta = (AR.top || {})[ka], tb = (AR.bot || {})[kb];
    /* 受けが攻め指定の組（向きの決まらない組）・受けに回らない人には受けの展開を付けない */
    if (tb && HK.Pos && HK.Pos.hardTop && HK.Pos.hardTop(b, a)) tb = null;
    if (!(ta && ta.length) && !(tb && tb.length)) return null;
    var R2 = rngOf(hashOf(key + '|arc|' + m.n + '|' + ((HK.SexFlow && HK.SexFlow.seed) || 0) + '|' + mode));
    var side = ta && ta.length && tb && tb.length ? (R2() < 0.6 ? 'a' : 'b') : ta && ta.length ? 'a' : 'b', list = side === 'a' ? ta : tb;
    var w = {}; list.forEach(function (d) { w[d.key] = d.w || 1; });
    var lk = last && last.arc ? String(last.arc).split('.').pop() : '';
    if (lk && w[lk] != null && list.length > 1) w[lk] *= 0.15;
    var k = wpick(R2, w), def = list.filter(function (d) { return d.key === k; })[0];
    return def ? { side: side, kind: side === 'a' ? ka : kb, def: def } : null;
  }
  /* ---------- 体位の語（2026-11-06。短い場面・夜の性格の一文の差し込みで、本文の体位と合わない言い回しを並べない） ----------
     P.postureOf(本文, a, b)：本文の体位（流れの管理 HK.SexFlow.POS の chg・at と「後ろから」などの語。最後に出たもの）。'' は分からない
     P.posConflict(文, 体位)：その文に、体位と合わない体位の語があるか（台詞の中は見ない）
     P.fitPos(差し込む文, 本文)：合わない体位の語のある文（。で区切った一文）を外す */
  var POSW = P.POSW = {
    aUp: /覆いかぶさ|押し倒|組み敷|見下ろ|仰向け|頭の上で(?:押さえ|縫いと)/,
    rear: /後ろから|背後から|背中に覆|四つん這い|うつ伏せ|寝バック/,
    bUp: /跨|馬乗り|上に乗|騎乗/,
    sit: /膝の上|向かい合わせに膝|対面座位/,
    face: /向かい合|見上げ|見下ろ|見つめ合|目を合わせ|額を合わせ|額と額/
  };
  var POS_NG = { rear: ['aUp', 'bUp', 'sit', 'face'], aUp: ['rear', 'bUp', 'sit'], bUp: ['aUp', 'rear', 'sit'], sit: ['aUp', 'rear', 'bUp'] };
  P.postureOf = function (t, a, b) {
    if (!t) return '';
    var n = narrOf(a && b ? normNames(t, a, b) : String(t)), F = HK.SexFlow, PO = F && F.POS, best = '', at = -1;
    var look = function (k, re) { if (!re) return; var g = new RegExp(re.source, 'g'), mm; while ((mm = g.exec(n))) { if (mm.index >= at) { at = mm.index; best = k; } if (!mm[0].length) g.lastIndex++; } };
    ['aUp', 'rear', 'bUp', 'sit'].forEach(function (k) { if (PO) { look(k, PO.chg[k]); look(k, PO.at[k]); } });
    look('rear', /後ろから|背後から|四つん這い|うつ伏せ/);
    look('bUp', /\{b\}[はが][^。]{0,20}跨/);
    look('sit', /膝の上で|対面座位/);
    return best;
  };
  P.posConflict = function (t, hint) {
    var ng = POS_NG[hint]; if (!ng || !t) return false;
    var n = narrOf(String(t));
    return ng.some(function (k) { return POSW[k].test(n); });
  };
  P.fitPos = function (ins, body) {
    if (!ins || !body) return ins;
    var hint = P.postureOf(body);
    if (!hint || !P.posConflict(ins, hint)) return ins;
    return ins.split(/\n\n/).map(function (pa) { return sentences(pa).filter(function (x) { return !P.posConflict(x, hint); }).join(''); }).filter(function (x) { return /\S/.test(x); }).join('\n\n');
  };

  /* ---------- 選び方 ---------- */
  /* ctx：{ a, b, mode, opt, lead（夜の主導でこの夜は受けから）, press（'jealous'|'rough'|''）, leadPart（受けから始める部品が本文にある）, againAfter（呼ぶ側の事後にもう一度がある） } */
  P.choose = function (x) {
    var a = x.a, b = x.b, mode = x.mode, opt = x.opt || {}, m = memo();
    var key = a.name + '|' + b.name, last = m.pair[key] || null;
    var R = rngOf(hashOf(key + '|' + (m.n++) + '|' + ((HK.SexFlow && HK.SexFlow.seed) || 0) + '|' + mode));
    var pa = psOf(a, b), pb = psOf(b, a), ka = kindOf(a, b), kb = kindOf(b, a), la = libOf(a), lb = libOf(b), hi = la === 'high' || lb === 'high', lo = la === 'low' && lb !== 'high';
    var rel = relOf(opt, a, b), rough = !!(opt.force || opt.hate || rel === 'hate' || opt.rel === 'enemy'), jeal = !!opt.jealous || x.press === 'jealous';
    var place = opt.place || '', sid = scenIdOf(opt), room = P.ROOM[sid] || {}, ng = PLACE_NG[place] || {};
    var A = HK.Attr, size = A && A.sizeDiff ? A.sizeDiff(a, b) : '', tall = A && A.heightDiff ? A.heightDiff(a, b) : '';
    var why = [];
    var fix = opt.play || {};
    /* 温度（heat.js の HK.Heat）：温度の場面のあいだは温度の重みを掛け、飽きない決まり（同じ組の前の夜と同じ入り方・主な責めを選ばない・道具は一回の遊びに 2 回まで）を守る。
       温度を読む部屋（HK.Heat.use）・P.strict の部屋だけ。既存の箱庭は今までどおり（前の夜と同じ値は ×0.25） */
    var HS = HK.Heat && HK.Heat.cur && HK.Heat.cur.key ? HK.Heat.cur : null, strict = !!HS || P.strict(sid);
    var propN = m.propN = m.propN || {};
    var SPK = HK.SexSpot, spot = SPK ? SPK.of(opt) || SPK.cur || '' : '';
    /* 場所（opt.spot）：その場所で使わない値と、文の候補が一つも場所に合わない値は選ばない（全部 0 になるなら場所の絞りはしない） */
    function spotOk(axis, k) {
      if (!spot) return true;
      if (axis === 'pos' && !SPK.okPos(spot, k)) return false;
      if (axis === 'entry' && !SPK.okEntry(spot, k)) return false;
      if (axis === 'prop' && !SPK.okProp(spot, k)) return false;
      var T0 = TX(), tb = axis === 'pos' ? (T0.POS || {})[k] : axis === 'entry' ? (T0.ENTRY || {})[k] : axis === 'prop' ? ((T0.PROP || {})[k] || {}).fore : null;
      var l = tb ? (Array.isArray(tb) ? tb : tb[mode] || tb.all) : null;
      return !l || !l.length || l.some(function (t) { return SPK.fits(t, spot); });
    }
    function done(axis, w) {
      (ng[axis] || []).forEach(function (k) { if (w[k] != null) w[k] = 0; });
      var rw = room[axis]; if (rw) Object.keys(rw).forEach(function (k) { if (w[k] != null || (TX()[axis.toUpperCase()] || {})[k] || ((P.VALUES[sid] || {})[axis] || {})[k]) w[k] = (w[k] || 0) + rw[k]; });
      if (HS) HK.Heat.weigh(axis, w);
      if (strict && axis === 'prop') Object.keys(w).forEach(function (k) { if (k !== 'none' && (propN[k] || 0) >= 2) w[k] = 0; });
      if (spot) { var w2 = {}, any = false; Object.keys(w).forEach(function (k) { w2[k] = spotOk(axis, k) ? w[k] : 0; if (w2[k] > 0) any = true; }); if (any) Object.keys(w2).forEach(function (k) { w[k] = w2[k]; }); }
      /* 前の夜と同じ値は選ばれにくく */
      if (last && last[axis] && w[last[axis]] > 0) {
        var others = Object.keys(w).some(function (k) { return k !== last[axis] && w[k] > 0; });
        w[last[axis]] *= strict && (axis === 'entry' || axis === 'focus') && last[axis] !== 'lead' && others ? 0 : 0.25;
      }
      if (fix[axis] && w[fix[axis]] != null) return fix[axis];
      return wpick(R, w);
    }
    /* 入り方 */
    var entry;
    if (x.leadPart) entry = 'lead';
    else {
      var we = { kiss: 2, push: 1, backhug: 1, whisper: 1, amae: 1, bath: 1, nekomi: 0.7, hurry: 1, jealous: 0 };
      if (jeal) { we.jealous = 8; we.push += 2; we.amae = 0; we.nekomi = 0; }
      if (rough) { we.push += 3; we.hurry += 1; we.amae = 0; we.nekomi = 0; we.bath = 0; we.backhug *= 0.5; }
      if (x.press === 'rough') { we.amae = 0; }
      if (ka === 'sadist') { we.push += 2; we.backhug += 0.5; }
      if (ka === 'mean') { we.whisper += 2.5; }
      if (ka === 'sweet') { we.kiss += 2; we.backhug += 1; }
      if (ka === 'shy') { we.kiss += 1; we.amae += 0.5; }
      if (hi) { we.hurry += 1.5; we.push += 0.5; }
      if (lo) { we.hurry *= 0.3; we.kiss += 1; }
      if (/^(devoted|free)$/.test(pb)) we.amae += 1;
      if (pb === 'shy' || pb === 'stern') we.amae *= 0.5;
      if (/^(proud|cool)$/.test(pa)) we.push += 0.5;
      if (pa === 'gentle' || pa === 'polite') we.kiss += 0.5;
      if (rel === 'lover') { we.nekomi += 1; we.bath += 0.6; we.backhug += 0.6; }
      if (rel === 'casual') { we.hurry += 0.6; we.nekomi = 0; }
      if (!rel && !opt.rel) we.nekomi *= 0.4;
      if (feat(b, 'ear')) we.whisper += 1;
      entry = done('entry', we);
      if (rough && entry === 'amae') entry = 'push';
    }
    /* 道具・状況 */
    var wp = { none: 4, chakui: 1, mekakushi: 0.7, kagami: 0.9, omocha: 0.7, lotion: 0.7 };
    if (entry === 'hurry') wp.chakui += 6; else if (entry === 'jealous') wp.chakui += 2; else if (entry === 'bath') { wp.chakui = 0; wp.lotion += 1; }
    if (entry === 'nekomi') { wp.chakui += 1; wp.kagami = 0; }
    if (hi) wp.chakui += 1;
    if (ka === 'mean' || ka === 'sadist') { wp.mekakushi += 1.2; wp.kagami += 1; wp.omocha += 0.8; }
    if (ka === 'sweet') { wp.lotion += 0.8; }
    if (pb === 'shy' || kb === 'shy') { wp.kagami += 0.8; wp.mekakushi += 0.5; }
    if (kb === 'maso') wp.mekakushi += 1;
    if (pa === 'free') wp.omocha += 0.8;
    if (rough) { wp.mekakushi = 0; wp.omocha = 0; wp.kagami = 0; wp.lotion = 0; wp.chakui += 1; }
    var prop = done('prop', wp);
    /* 夜の性格の展開（play-arc-r18.js の HK.PlayArc。2026-11-06）：攻めか受けの夜の性格ごとの小さな展開（サドなら焦らし・言葉責め・痕を付ける・命令…）を一つ選び、
       主な責めの重みに足す。同じ二人の前の夜と同じ展開は選ばれにくく。乱数は型の乱数とは別（ほかの軸の選び方を変えない） */
    var arc = arcChoose(a, b, mode, ka, kb, last, key, m);
    /* 主な責め */
    var wf = { mune: 1.2, chikubi: 1, mimi: 1, kotoba: 1, jirashi: 1, koshi: 1, te: 1.2, kuchi: 1, zenshin: 1 };
    if (feat(b, 'ear')) wf.mimi += 3;
    if (feat(b, 'tail')) wf.koshi += 2.5;
    if (feat(b, 'wing')) wf.koshi += 1.5;
    if (feat(b, 'horn')) wf.mimi += 0.8;
    if (bust(b) === 'l') wf.mune += 3; else if (bust(b) === 's') wf.chikubi += 1.2;
    if (ka === 'mean') { wf.jirashi += 3; wf.kotoba += 2; }
    if (ka === 'sadist') { wf.kotoba += 2; wf.chikubi += 1; wf.jirashi += 0.5; }
    if (ka === 'sweet') { wf.zenshin += 3; wf.mimi += 0.5; wf.kotoba *= 0.4; }
    if (ka === 'shy') { wf.te += 1; wf.zenshin += 1; wf.kotoba *= 0.3; }
    if (kb === 'maso') { wf.chikubi += 1; wf.kotoba += 1; }
    if (kb === 'shy') { wf.kotoba += 0.8; wf.mimi += 0.5; }
    if (pa === 'proud') wf.kotoba += 1;
    if (pa === 'cool' || pa === 'stern') wf.te += 1;
    if (pa === 'free') wf.kuchi += 1;
    if (pa === 'gentle' || pa === 'devoted') wf.zenshin += 0.8;
    if (hi) wf.kuchi += 0.8;
    if (entry === 'whisper') wf.mimi += 1.5;
    if (entry === 'hurry' || prop === 'chakui') { wf.zenshin *= 0.4; wf.jirashi *= 0.5; wf.te += 1; }
    if (prop === 'mekakushi') wf.jirashi += 1;
    if (prop === 'kagami') wf.kotoba += 1;
    if (prop === 'lotion') { wf.te += 1; wf.mune += 0.5; }
    if (arc && arc.def.focus) Object.keys(arc.def.focus).forEach(function (k) { if (wf[k] != null) wf[k] += arc.def.focus[k]; });
    if (rough) { wf.zenshin = 0; wf.kuchi *= 0.5; }
    var focus = done('focus', wf);
    /* 体位 */
    var ok = P.MODE.pos[mode] || P.MODE.pos.mf, wq = {};
    ok.forEach(function (k) { wq[k] = 1; });
    wq.seijo = 2;
    var big = size === 'a>b' || tall === 'a>b';
    if (big) { if (wq.kakae) wq.kakae += 3; if (wq.zai) wq.zai += 0.8; } else if (wq.kakae) wq.kakae = 0.15;
    if (ka === 'sadist' || jeal) { if (wq.osae) wq.osae += 3; if (wq.back) wq.back += 1.2; if (wq.nebak) wq.nebak += 1; if (wq.kijo) wq.kijo = 0; }
    if (rough || x.press === 'rough') { if (wq.osae) wq.osae += 2; if (wq.back) wq.back += 1.5; if (wq.kijo) wq.kijo = 0; }
    if (ka === 'sweet') { wq.seijo += 2; if (wq.zai) wq.zai += 2; if (wq.osae) wq.osae *= 0.3; }
    if (ka === 'shy') { wq.seijo += 2; if (wq.osae) wq.osae *= 0.3; }
    if (ka === 'mean') { if (wq.kijo) wq.kijo += 1.5; if (wq.zai) wq.zai += 1; }
    if (x.lead || entry === 'amae' || entry === 'lead') { if (wq.kijo) wq.kijo += 3; if (wq.zai) wq.zai += 1.5; if (wq.osae) wq.osae *= 0.3; }
    if (/^(free|proud)$/.test(pb) && wq.kijo) wq.kijo += 1;
    if (feat(b, 'tail') && wq.back) wq.back += 1;
    if (hi) { if (wq.tachi) wq.tachi += 1; if (wq.nebak) wq.nebak += 1; }
    if (entry === 'hurry' || prop === 'chakui') { if (wq.tachi) wq.tachi += 3; if (wq.back) wq.back += 0.5; }
    if (entry === 'bath') { if (wq.tachi) wq.tachi += 1; if (wq.zai) wq.zai += 1; }
    if (entry === 'backhug') { if (wq.back) wq.back += 1.5; if (wq.zai) wq.zai += 0.5; }
    if (prop === 'kagami') { if (wq.back) wq.back += 1.5; if (wq.zai) wq.zai += 1.5; if (wq.tachi) wq.tachi += 1; }
    if (x.press && wq.kijo) wq.kijo = 0;
    var pos = done('pos', wq);
    /* 終わり方 */
    var okf = P.MODE.finish[mode] || P.MODE.finish.mf, wn = {};
    okf.forEach(function (k) { wn[k] = 1; });
    if (wn.naka) wn.naka = 2;
    if (rel === 'lover') { if (wn.naka) wn.naka += 1; wn.issho += 1; }
    if (rel === 'casual' && wn.soto) wn.soto += 1;
    if (ka === 'sweet' || pa === 'gentle' || pa === 'devoted') wn.issho += 2;
    if (ka === 'mean' || ka === 'sadist') { wn.uke += 2; if (wn.renzoku) wn.renzoku += 2; }
    if (kb === 'maso' && wn.renzoku) wn.renzoku += 1;
    if (hi) { wn.again += 2; if (wn.renzoku) wn.renzoku += 1; } else if (lo) wn.again *= 0.2;
    if (x.againAfter) { wn.again = 0; if (wn.renzoku) wn.renzoku = 0; }
    if (rough) { wn.issho *= 0.3; }
    var finish = done('finish', wn);
    var play = { entry: entry, focus: focus, prop: prop, pos: pos, finish: finish, mode: mode, arc: arc ? arc.side + '.' + arc.kind + '.' + arc.def.key : '' };
    if (arc) play._arc = arc;
    m.pair[key] = play;
    if (strict && prop && prop !== 'none') propN[prop] = (propN[prop] || 0) + 1;
    if (HS) HS.plays.push({ entry: entry, focus: focus, prop: prop, pos: pos, finish: finish, a: a.name, b: b.name });
    if (strict && HK.Heat && Array.isArray(HK.Heat.playLog)) HK.Heat.playLog.push({ entry: entry, focus: focus, prop: prop, a: a.name, b: b.name, heat: HS ? HS.key : '' });
    play.R = R;
    return play;
  };

  /* ---------- 本文の中の場所を探す ---------- */
  function flat(o, out) {
    if (!o) return out;
    if (typeof o === 'string') out.push(o);
    else if (Array.isArray(o)) o.forEach(function (x) { flat(x, out); });
    else if (typeof o === 'object') Object.keys(o).forEach(function (k) { flat(o[k], out); });
    return out;
  }
  var LISTS = null, LSIG = '';
  function lists() {
    var T = HK.ThickSex || {}, X = HK.ThickEro || {};
    var sig = [T.FORE, T.BODY, X.FORE, X.BODY].map(function (o) { return flat(o, []).length; }).join(',') + ',' + flat([T.CLIMAX, X.CLIMAX], []).length;
    if (LISTS && sig === LSIG) return LISTS;
    LSIG = sig;
    var uniq = function (l) { var s = {}; return l.filter(function (x) { if (!x || x.length < 20 || s[x]) return false; s[x] = 1; return true; }).sort(function (p, q) { return q.length - p.length; }); };
    LISTS = {
      fore: uniq(flat([T.FORE, X.FORE], [])),
      body: uniq(flat([T.BODY, T.ROUGH_BODY, T.JEALOUS_BODY, T.FM_BODY, T.FM_BODY_SP, T.FF_BODY, X.BODY, X.FM_BODY, X.FM_BODY_SP, X.FF_BODY], [])),
      climax: uniq(flat([T.CLIMAX, T.ROUGH_CLIMAX, T.JEALOUS_CLIMAX, T.FM_CLIMAX, T.FM_CLIMAX_SP, T.FF_CLIMAX, X.CLIMAX, X.FM_CLIMAX, X.FM_CLIMAX_SP, X.FF_CLIMAX], [])),
      fout: uniq(flat([T.FINGER_OUT], [])),
      /* 感じていく段（受けの快感）の地の文の段落 */
      feel: uniq(flat([T.FEEL, T.FEEL_FF, T.FEEL_FM, X.FEEL], []).map(function (x) { return String(x).split(/\n\n/)[0]; }))
    };
    return LISTS;
  }
  var RE_CACHE = {};
  function esc(s) { return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }
  function reOf(e) {
    if (RE_CACHE[e] !== undefined) return RE_CACHE[e];
    var r = null;
    if (/\{(?:mf|mb[012]?|ma[012]?|m[012]|s:\w+)\}/.test(e)) {
      try { r = new RegExp(esc(e).replace(/\\\{(?:mf|mb[012]?|ma[012]?|m[012]|s:\w+)\\\}/g, '[\\s\\S]{0,200}?')); } catch (x) { r = null; }
    }
    RE_CACHE[e] = r;
    return r;
  }
  /* 本文 t の中で、表 list のどれかの文が出ているところ { s, e } */
  function locate(t, list) {
    for (var i = 0; i < list.length; i++) { var k = t.indexOf(list[i]); if (k >= 0) return { s: k, e: k + list[i].length, x: list[i] }; }
    for (var j = 0; j < list.length; j++) { var r = reOf(list[j]); if (!r) continue; var m = r.exec(t); if (m) return { s: m.index, e: m.index + m[0].length, x: list[j] }; }
    return null;
  }
  P.locate = function (t, kind) { return locate(t, lists()[kind] || []); };

  /* ---------- 文を選んで埋める ---------- */
  /* 組の文：fsp（女性の攻めのペニバンの回）は fsp の文、無ければ fm の文（指でもペニバンでも読める書き方の表） */
  function byMode(tbl, mode) { if (!tbl) return null; if (Array.isArray(tbl)) return tbl; return tbl[mode] || (mode === 'fsp' ? tbl.fm : null) || tbl.all || null; }
  function fakeS() { var m = memo(); if (!m.fs) { var R = rngOf(hashOf('fs|' + ((HK.SexFlow && HK.SexFlow.seed) || 0))); m.fs = { rng: R }; } return m.fs; }
  function moanPre(b, ero) {
    var X = HK.ThickEro, T = HK.ThickSex, S = fakeS(), pick = function (l) { return pickFresh(S.rng, l); };
    try {
      if (ero && X && X.okMoan) return X.okMoan(S, b, 0);
      if (T && T.moan0) return T.moan0(pick, b);
    } catch (e) { /* 喘ぎの部品が無ければ短い吐息 */ }
    return '……っ、ん……';
  }
  /* 受けのこらえる声（性格が目立つ行為の段の、相手がモブ・恋人でない二人の受けの反応が使う。2026-11-06） */
  P.moanOf = moanPre;
  function fillE(t, a, b) { var X = HK.ThickEro; try { return X && X.fill ? X.fill(fakeS(), t, a, b) : t; } catch (e) { return t; } }
  /* 女性の攻め×男性で受けに男性器が無い組の文は使わない（P.ok で外しているが、念のため） */
  var NOM = /根元|竿|\{男性器\}|\{亀頭\}|ものが|ものを|吐き出|射精/;
  function pickT(R, tbl, mode, b) {
    var l = byMode(tbl, mode);
    if (!l || !l.length) return '';
    if ((mode === 'fm' || mode === 'fsp') && HK.Pos && HK.Pos.hasM && !HK.Pos.hasM(b)) { var f = l.filter(function (s) { return !NOM.test(s); }); if (f.length) l = f; }
    return pickL(R, l);
  }
  /* 相手の種類で台詞を絞る（2026-11-06 利用者の指摘（痴漢電車の記録））：受けが誘う・甘える・恋人向けの言い回し（WARM）は、
     相手がモブ・合意のない場面（強引・愛憎・敵対）・恋人でも体の関係でもない二人（COLD.on）には出さない。候補が全部 WARM なら
     受けの反応の段（ENTRY_B・FOCUS_B・MID_B）は短い声（COLD_B）に、ほかの段はそのまま（地の文が主で、台詞を持たない段のため） */
  var WARM = P.WARM = HK.Voice.reMk(/大好き|好き(?![嫌勝])|愛して|愛おし|どきどき|鼓動|幸せ|ありがとう|嬉し|うれし|ずっと、?こうして|あなたなら|好きにして|何でもする|任せ|同じこと(?:を)?思って|胸に当て|口づけを返|擦り寄|すり寄|わ、私も|恋人|落ち着く|あったか|温かい|もっと、?していい|全部、?いい|甘えて|甘やか/);
  var COLD = { on: false };
  P.coldOf = function (a, b, opt, rel) {
    var mob = function (c) { return !!(c && (c.mob || c.npc || c.i == null || c.i < 0)); };
    opt = opt || {};
    if (mob(a) || mob(b) || opt.force || opt.hate || rel === 'hate' || opt.rel === 'enemy' || opt.mob) return true;
    if (rel === 'lover' || rel === 'casual') return false;
    /* 恋人・体の関係の二人か：性格が目立つ行為の段と同じ見方（play-act-r18.js の HK.PlayAct.bondOf。関係の表・物語型の関係・二人の状態） */
    var AC0 = HK.PlayAct;
    return AC0 && AC0.bondOf ? !AC0.bondOf(opt.ctx || opt.S || HK._curCtx, a, b) : true;
  };
  P.COLD_B = ['{b}は息を詰めて、喉の奥で短い声を漏らした。{b}「……っ」', '{b}の肩が小さく跳ねた。噛みしめた唇の隙間から、こらえきれない吐息がこぼれた。', '{b}はぎゅっと目を閉じて、声にならない息を吐いた。{b}「……ん、っ……」', '{b}の体がびくりと強ばり、浅い息が一つ漏れた。'];
  function coldF(l) { if (!COLD.on || !l || !l.length) return l; var f = l.filter(function (x) { return !WARM.test(x); }); return f.length ? f : l; }
  function coldB(R, l) { if (!COLD.on || !l) return pickFresh(R, l); var f = l.filter(function (x) { return !WARM.test(x); }); return pickFresh(R, f.length ? f : P.COLD_B); }
  /* 型の段の文を選ぶ：場所（opt.spot。sex-spot-r18.js）に合わない文と、もう出た動きの文を避ける */
  function pickL(R, l) {
    if (!l || !l.length) return '';
    l = coldF(l);
    if (HK.SexSpot && HK.SexSpot.cur) l = HK.SexSpot.filter(l, HK.SexSpot.cur);
    /* 同じ動き（手首を押さえる など。HK.SexFlow.MOTION）が、もう本文か、この型で選んだ文にあれば、その動きのない文を選ぶ（P.apply の間だけ） */
    if (MOV.on && l.length > 1) { var g = l.filter(function (s) { return !motionsOf(s).some(function (k) { return MOV.used[k]; }); }); if (g.length) l = g; }
    var r = pickFresh(R, l);
    if (MOV.on) motionsOf(r).forEach(function (k) { MOV.used[k] = 1; });
    return r;
  }
  /* 型の段で使った動き（一回の場面の間。P.apply が本文の動きを入れて始める） */
  var MOV = { on: false, used: {} };
  function motionsOf(s) {
    var MO = HK.SexFlow && HK.SexFlow.MOTION, n = narrOf(normPh(s)), out = [];
    if (!MO || !s) return out;
    Object.keys(MO).forEach(function (k) { if (k !== 'stop' && MO[k].test(n)) out.push(k); });
    return out;
  }
  function normPh(s) { return String(s || ''); }
  P.pickT = pickT;
  /* 名前を {a}{b} にそろえる（sex-flow-r18.js と同じ） */
  function normNames(t, a, b) {
    t = String(t);
    var an = a && a.name, bn = b && b.name;
    if (an && bn && an !== bn) {
      var A0 = '\u0001A\u0001', B0 = '\u0001B\u0001';
      if (an.length >= bn.length) t = t.split(an).join(A0).split(bn).join(B0); else t = t.split(bn).join(B0).split(an).join(A0);
      t = t.split(A0).join('{a}').split(B0).join('{b}');
    }
    return t;
  }
  var UNDRESS = /服を(?:脱が|はだけ|剥|たくし上げ)|脱がせ|脱がされ|ボタンを外|下着を(?:下ろ|ずら|剥ぎ|脱が)|シャツを(?:たくし上げ|脱が|はだけ)|はだけ(?:させ|られ)|裸に(?:し|され)|服は一枚ずつ|脱ご|脱いで|脱ぎ/;
  P.UNDRESS = UNDRESS;
  function sentences(s) {
    var out = [], d = 0, st = 0;
    for (var i = 0; i < s.length; i++) {
      var c = s.charAt(i);
      if (c === '「' || c === '『') d++;
      else if (c === '」' || c === '』') d = Math.max(0, d - 1);
      else if (!d && (c === '。' || c === '！' || c === '？')) { out.push(s.slice(st, i + 1)); st = i + 1; }
    }
    if (st < s.length) out.push(s.slice(st));
    return out;
  }
  function narrOf(s) { return String(s).replace(/\uE3A0[^\uE3A1]*\uE3A1/g, '').replace(/「[^」]*」/g, ''); }
  /* 着衣：「脱がせる」文を外す。外せない（外すと段が空になる）なら null */
  function stripUndress(t, keepFrom, keepTo) {
    var ps = t.split(/\n\n/), pos = 0, out = [];
    for (var i = 0; i < ps.length; i++) {
      var p = ps[i], s0 = pos; pos += p.length + 2;
      if (s0 >= keepFrom && s0 < keepTo) { out.push(p); continue; }
      if (!UNDRESS.test(narrOf(p))) { out.push(p); continue; }
      var ss = sentences(p), kept = ss.filter(function (x) { return !UNDRESS.test(narrOf(x)); });
      var rest = kept.join('');
      if (!/\S/.test(narrOf(rest).replace(/\{[ab]\}/g, ''))) { if (/^\{[ab]\}「/.test(p) || narrOf(p).replace(/\{[ab]\}|[\s　]/g, '').length < 40) continue; return null; }
      /* 主語の無い文が頭に来たら、主語を補えないので諦める */
      if (kept.length && ss[0] !== kept[0] && !/^[^。]{0,14}(?:\{[ab]\}|二人|ふたり|「)/.test(kept[0])) return null;
      out.push(rest);
    }
    return out.join('\n\n');
  }

  /* ---------- 部屋の受け口（C） ----------
     P.addScene(scenId, def)：その部屋でしか出ない長い場面を登録する。
       def = { id, label（8〜25 字）, when(ctx, a, b, opt) → 真なら候補, weight（数か関数。省くと 1。型の候補 1 に対する重み）,
               play: { entry, focus, prop, pos, finish }（固定したい軸。省いた軸は選び方に任せる）,
               lead: { mf: [...], ff: [...], fm: [...] }（または all・関数 (ctx, a, b, mode) → 文）… きっかけの段（入り方の段の代わりに置く）,
               steps: [ { stage: 'undress'|'fore'|'insert'|'play'|'after', mf|ff|fm|all: [...] か fn }, ... ]（段階の順。各 3 文以上）,
               tags: ['night', ...] }
       stage の置き場所：undress・fore＝前戯の段の代わり（二つ以上なら順に並べる）／insert＝繋がる段の代わり（体位は play.pos で固定する）／
       play＝繋がったあとの最中の段（型の最中の段の代わり）／after＝終わり方の文のあと。山場の喘ぎ・終わり方・事後は共通の部品のまま。
     P.addRoom(scenId, { entry: { 値: 足す重み }, prop: {…}, focus: {…}, pos: {…}, finish: {…} })：部屋の小道具として、型の値の選ばれやすさを足す */
  P.addScene = function (scenId, def) {
    if (!scenId || !def || !def.id) return;
    var l = P.SCENES[scenId] || (P.SCENES[scenId] = []);
    for (var i = 0; i < l.length; i++) if (l[i].id === def.id) { l[i] = def; return; }
    l.push(def);
  };
  /* 飽きない決まりを守る部屋（温度を読む部屋 HK.Heat.use と、P.strict(id, true) で登録した部屋。2026-11-06） */
  P.STRICT = {};
  P.strict = function (scenId, on) {
    if (on != null) { if (scenId) P.STRICT[scenId] = !!on; return !!on; }
    return !!(scenId && (P.STRICT[scenId] || (HK.Heat && HK.Heat.enabled && HK.Heat.enabled(scenId))));
  };
  /* 部屋だけの新しい値（2026-11-06。CLAUDE.md の「部屋の小道具は部屋だけの候補として足す」）：
     P.addValue(scenId, axis, { key, label, weight, text, mid, short })。その部屋の P.choose にだけ候補として入る（P.ROOM の重み）。
     文は本体の表 HK.PlayText と同じ形：entry→ENTRY[key][組]／focus→FOCUS（mid→FOCUS_MID・short→SHORT_FOCUS）／prop→PROP[key]（{ fore, mid } の形のまま text に）／
     pos→POS（mid→POS_MID・short→SHORT_POS）／finish→FIN（mid→FIN_E。男性向け）。組は mf・ff・fm で各 3 文以上（足りなければ P.VALUE_ERR に残る） */
  P.VALUES = {}; P.VALUE_ERR = [];
  var VAL_T = { entry: ['ENTRY'], focus: ['FOCUS', 'FOCUS_MID', 'SHORT_FOCUS'], prop: ['PROP'], pos: ['POS', 'POS_MID', 'SHORT_POS'], finish: ['FIN', 'FIN_E'] };
  P.addValue = function (scenId, axis, def) {
    if (!scenId || !VAL_T[axis] || !def || !def.key) return false;
    var k = def.key, T0 = HK.PlayText = HK.PlayText || {}, names = VAL_T[axis];
    if (P.AXES[axis] && P.AXES[axis][k] && !((P.VALUES[scenId] || {})[axis] || {})[k] && !Object.keys(P.VALUES).some(function (s) { return ((P.VALUES[s] || {})[axis] || {})[k]; })) { P.VALUE_ERR.push(scenId + '・' + axis + '・' + k + '：本体の値と同じ鍵'); return false; }
    var V = P.VALUES[scenId] = P.VALUES[scenId] || {};
    (V[axis] = V[axis] || {})[k] = def;
    if (P.AXES[axis]) P.AXES[axis][k] = def.label || k;
    [def.text, def.mid, def.short].forEach(function (t, i) { if (t && names[i]) { var tb = T0[names[i]] = T0[names[i]] || {}; tb[k] = t; } });
    /* 3 組 × 3 文の点検（道具は前戯の頭 fore の組ごと） */
    var chk = axis === 'prop' ? def.text && def.text.fore : def.text;
    ['mf', 'ff', 'fm'].forEach(function (md) { var l = chk && (Array.isArray(chk) ? chk : chk[md] || chk.all); if (!l || l.length < 3) P.VALUE_ERR.push(scenId + '・' + axis + '・' + k + '・' + md + '：' + (l ? l.length : 0) + ' 文'); });
    var w = {}; w[axis] = {}; w[axis][k] = def.weight != null ? def.weight : 1;
    P.addRoom(scenId, w);
    return true;
  };
  P.addRoom = function (scenId, w) {
    if (!scenId || !w) return;
    var r = P.ROOM[scenId] || (P.ROOM[scenId] = {});
    Object.keys(w).forEach(function (ax) { var o = r[ax] || (r[ax] = {}); Object.keys(w[ax] || {}).forEach(function (k) { o[k] = (o[k] || 0) + w[ax][k]; }); });
  };
  /* 部屋だけの文の差し替え（2026-11-06。部屋のオリジナルの文 8 割の決まり）：P.addText(部屋の id, 表の名前, 値, { mf, ff, fm, fsp })。
     表の名前は FIN（終わり方）・SHORT_FOCUS・SHORT_POS（短い・中くらいの場面の一文）。登録した部屋では、その値の文を部屋の文から選ぶ（型の値はそのまま。
     部屋の表に無い組は本体の文。ペニバンの回 fsp を部屋が書いていなければ本体の fsp）。各組 3 文以上 */
  P.RTEXT = {};
  P.addText = function (scenId, name, key, cells) {
    if (!scenId || !name || !key || !cells) return;
    var r = P.RTEXT[scenId] = P.RTEXT[scenId] || {}, t = r[name] = r[name] || {}, c = t[key] = t[key] || {};
    Object.keys(cells).forEach(function (m) { if (Array.isArray(cells[m]) && cells[m].length) c[m] = (c[m] || []).concat(cells[m]); });
  };
  function rtx(opt, name, key, base) {
    var R0 = P.RTEXT[scenIdOf(opt)], c = R0 && R0[name] && R0[name][key];
    if (!c) return base;
    var o = {};
    if (base && !Array.isArray(base)) Object.keys(base).forEach(function (m) { o[m] = base[m]; });
    else if (base) o.all = base;
    if (!o.fsp && o.fm) o.fsp = o.fm;
    Object.keys(c).forEach(function (m) { o[m] = c[m]; });
    return o;
  }
  P.rtx = rtx;
  function stepText(R, st, ctx, a, b, mode) {
    if (!st) return '';
    if (typeof st === 'function') return st(ctx, a, b, mode) || '';
    if (typeof st.fn === 'function') return st.fn(ctx, a, b, mode) || '';
    return pickT(R, st, mode, b);
  }
  function roomScene(x, R) {
    var sid = scenIdOf(x.opt), l = P.SCENES[sid];
    if (!l || !l.length) return null;
    var ctx = (x.opt && (x.opt.ctx || x.opt.S)) || HK._curCtx, want = x.opt && x.opt.playScene, cand = [], tot = 1;
    l.forEach(function (d) {
      if (want && d.id !== want) return;
      try { if (d.when && !d.when(ctx, x.a, x.b, x.opt || {})) return; } catch (e) { return; }
      var w = typeof d.weight === 'function' ? +d.weight(ctx, x.a, x.b, x.opt || {}) || 0 : d.weight != null ? +d.weight : 1;
      if (w > 0) { cand.push([d, w]); tot += w; }
    });
    if (!cand.length) return null;
    if (want) return cand[0][0];
    var r = R() * tot;
    for (var i = 0; i < cand.length; i++) { r -= cand[i][1]; if (r < 0) return cand[i][0]; }
    return null;
  }

  /* 入り方の台詞の表（同じ入り方の三つの組の文の、最後の攻めの台詞） */
  var EL = {};
  function entryLines(T0, v) {
    if (EL[v]) return EL[v];
    var o = (T0.ENTRY || {})[v] || {}, out = [];
    /* 風呂上がりは場面に結びついた台詞が多いので選び直さない。ほかも、その段の地の文だけにある物・動きを指す台詞は外す */
    if (v === 'bath') return (EL[v] = out);
    var SPEC = /鏡|名前だけ|隠さないで|待っててくれた|髪|ベッドで|のぼせ|匂い|背中|寝たふり|キスだけ/;
    Object.keys(o).forEach(function (m) { (o[m] || []).forEach(function (t) { var m2 = /\{a\}「＠\{a\}＠([^」]*)」$/.exec(t); if (m2 && out.indexOf(m2[1]) < 0 && !SPEC.test(m2[1])) out.push(m2[1]); }); });
    return (EL[v] = out);
  }
  /* ---------- 本文を型に沿って組み替える（sex-flow-r18.js の包みが F.fix の前に呼ぶ） ----------
     info = { a, b, mode, opt, ero, parts（差し込まれた部品）, press, lead }。戻り値：{ text, play（点検用の印つき）, keep（守る段落） } か null */
  P.apply = function (text, info) {
    MOV.on = false; MOV.used = {};
    var o0 = (info && info.opt) || {};
    COLD.on = !!(info && info.a && info.b && P.coldOf(info.a, info.b, o0, relOf(o0, info.a, info.b)));
    try { return apply0(text, info); } finally { MOV.on = false; MOV.used = {}; COLD.on = false; }
  };
  function apply0(text, info) {
    var a = info.a, b = info.b, mode = info.mode || 'mf', opt = info.opt || {};
    var why0 = function (w) { if (P.log) P.log.push({ a: a.name, b: b.name, mode: mode, none: w }); return null; };
    if (!P.ok(a, b, mode)) return why0('ok');
    var T0 = TX(), hadPh = /\{[ab]\}/.test(text), t = normNames(text, a, b);
    var L = lists();
    var fo = locate(t, L.fore), bo = locate(t, L.body), co = locate(t, L.climax);
    if (!bo && !co) return why0('nobody');
    /* 同じ役割の部品を外す：能動性の型の体位を変える段（型の体位に置き換える）。夜の性格の一文は、性格が目立つ行為の段を足すときに外す（下） */
    var cut = function (pt) {
      var k = t.indexOf(pt); if (k < 0) return false;
      t = (t.slice(0, k) + t.slice(k + pt.length)).replace(/\n{3,}/g, '\n\n').replace(/^\n+|\n+$/g, '');
      return true;
    };
    var POSCHG = HK.SexFlow && HK.SexFlow.POS ? HK.SexFlow.POS.chg : null;
    (info.parts || []).forEach(function (p) {
      if (p.role !== 'ini' || !POSCHG) return;
      var pt = normNames(p.t, a, b), pn = narrOf(pt);
      if (Object.keys(POSCHG).some(function (k) { return POSCHG[k].test(pn); }) && !/果て|達し/.test(pn)) cut(pt);
    });
    fo = locate(t, L.fore); bo = locate(t, L.body); co = locate(t, L.climax);
    if (!bo && !co) return why0('nobody');
    var leadPart = (info.parts || []).some(function (p) { return (p.role === 'lead' || p.role === 'ini-lead') && t.indexOf(normNames(p.t, a, b).split(/\n\n/)[0]) >= 0; });
    var againAfter = !!(opt.after && /もう一度|もう一回|二回戦|二度目/.test(opt.after)) || !!opt.again;
    var play = P.choose({ a: a, b: b, mode: mode, opt: opt, press: info.press, lead: info.lead, leadPart: leadPart, againAfter: againAfter });
    var R = play.R; delete play.R;
    var arcD = play._arc || null; delete play._arc;
    var rs = roomScene({ a: a, b: b, opt: opt }, R);
    if (rs && rs.play) Object.keys(rs.play).forEach(function (k) { if (rs.play[k]) play[k] = rs.play[k]; });
    if (rs) play.scene = rs.id;
    var gen = true;
    /* 体位・最中の頭・終わり方の組（女性の攻めのペニバンの回は fsp） */
    var sp = P.strapOf(info, t, mode), tm = sp ? 'fsp' : mode;
    if (sp) play.strap = true;
    var ctx = opt.ctx || opt.S || HK._curCtx, ero = !!info.ero;
    var edits = [], keep = [];
    var put = function (s, e, s2, isKeep) { edits.push({ s: s, e: e, t: s2 }); if (isKeep && s2) s2.split(/\n\n/).forEach(function (p) { if (p && p.length >= 12) keep.push(p); }); };
    /* 着衣：脱がせる文を外す（外せなければ、着衣はやめる） */
    if (play.prop === 'chakui') {
      var st0 = stripUndress(t, -1, -1);
      if (st0 == null) play.prop = 'none';
      else if (st0 !== t) {
        t = st0;
        fo = locate(t, L.fore); bo = locate(t, L.body); co = locate(t, L.climax);
        if (!bo && !co) return null;
      }
    }
    /* 本文に残る（置き換えない）ところにある動きは、型の段で二度出さない（sex-flow の (c)。play-text2-r18.js の「押さえつけ」の手首など） */
    var keepT = t;
    [co, bo, fo].filter(Boolean).sort(function (x, y) { return y.s - x.s; }).forEach(function (z) { keepT = keepT.slice(0, z.s) + keepT.slice(z.e); });
    MOV.on = true; MOV.used = {};
    motionsOf(keepT).forEach(function (k) { MOV.used[k] = 1; });
    var pr = (T0.PROP || {})[play.prop] || null;
    /* 入り方（部屋の場面ならそのきっかけ） */
    var entT = '';
    if (rs && rs.lead) entT = stepText(R, rs.lead, ctx, a, b, mode);
    else if (gen && play.entry !== 'lead') {
      entT = pickT(R, (T0.ENTRY || {})[play.entry], mode, b);
      /* 入り方の段の最後の攻めの台詞は、同じ入り方の台詞（三つの組の分。組を問わない書き方）から選び直す */
      var ELn = entryLines(T0, play.entry), lm = /\{a\}「＠\{a\}＠[^」]*」$/.exec(entT);
      if (lm && ELn.length > 1) entT = entT.slice(0, lm.index) + '{a}「＠{a}＠' + pickFresh(R, coldF(ELn)) + '」';
      /* 受けの応じ方（態度ごと）を続ける（同じ入り方でも段の文が毎回同じにならないように） */
      var eb = entT && T0.ENTRY_B ? T0.ENTRY_B[psOf(b, a)] || T0.ENTRY_B.gentle : null;
      if (eb && play.entry !== 'nekomi') entT += coldB(R, eb);
    }
    /* 主な責め：前戯の段 */
    var foreT = '';
    if (rs && rs.steps) {
      var fsx = rs.steps.filter(function (s) { return s.stage === 'undress' || s.stage === 'fore'; }).map(function (s) { return stepText(R, s, ctx, a, b, mode); }).filter(Boolean);
      if (fsx.length) foreT = fsx.join('\n\n');
    }
    if (!foreT && gen) foreT = pickT(R, (T0.FOCUS || {})[play.focus], mode, b);
    if (foreT) {
      /* 受けのこらえる声の段落は後ろへ（地の文を一つの段落にまとめ、声で終える。声が毎回違うので段の文が重なりにくい） */
      var fps = foreT.split(/\n\n/), fn = fps.filter(function (p) { return !/^\{b\}「\{mf\}」$/.test(p); }), fm0 = fps.length - fn.length;
      if (fm0 && !(rs && rs.steps)) {
        var fbl = T0.FOCUS_B ? T0.FOCUS_B[psOf(b, a)] || T0.FOCUS_B.gentle : null;
        foreT = fn.join('') + (fbl ? coldB(R, fbl) : '') + '\n\n{b}「{mf}」';
      }
      foreT = foreT.replace(/\{mf\}/g, function () { return moanPre(b, ero); });
      /* 着衣の型の前戯の頭（「服を一枚も乱さないまま」「ボタンを一つも外さず、布の上から」）は、場面がもう直に触れた・口や下着の中まで進んだあと
         （前戯の段より前の本文・入り方の段・呼ぶ側の opt.direct）には出さない（2026-11-05。通し読み T5 の申し送り） */
      var pf = gen && pr && pr.fore && !(play.prop === 'chakui' && (opt.direct || P.bareBefore(t.slice(0, fo ? fo.s : bo ? bo.s : co ? co.s : 0) + '\n\n' + entT))) ? pickT(R, pr.fore, mode, b) : '';
      if (pf) { foreT = pf + foreT; play.pfT = pf; }
    }
    /* 体位：繋がる段と最中の段 */
    var posT = '';
    if (rs && rs.steps) { var ins = rs.steps.filter(function (s) { return s.stage === 'insert'; })[0]; if (ins) posT = stepText(R, ins, ctx, a, b, mode); }
    if (!posT && gen) posT = pickT(R, (T0.POS || {})[play.pos], tm, b);
    var midT = '';
    if (rs && rs.steps) midT = rs.steps.filter(function (s) { return s.stage === 'play'; }).map(function (s) { return stepText(R, s, ctx, a, b, mode); }).filter(Boolean).join('\n\n');
    if (!midT && gen) {
      var m1 = pickT(R, (T0.POS_MID || {})[play.pos], tm, b), m2 = pickT(R, (T0.FOCUS_MID || {})[play.focus], mode, b), m3 = pr && pr.mid ? pickT(R, pr.mid, mode, b) : '';
      midT = (m1 + m2 + m3).replace(/^\s+/, '');
      if (midT) midT = 'そのまま、' + midT.replace(/^そのまま、?/, '');
    }
    /* 性格が目立つ行為の段（攻めの態度 × 夜の性格・受けの反応） */
    var actT = AC() && AC().unit ? AC().unit(R, a, b, mode, t, { press: info.press, rough: !!(opt.force || opt.hate), force: !!opt.force, ctx: ctx, ero: ero, pick: function (l) { return pickL(R, l); } }) : '';
    /* 攻めの夜の性格の一文（attr-r18.js）は、性格が目立つ行為の段と役割が重なるので外す（受けの夜の性格・相手に合わせる人の一文があるときは残す） */
    if (actT) {
      var A = HK.Attr, kdA = A && A.nightKind ? A.nightKind(a, b) : '', kdB = A && A.nightKind ? A.nightKind(b, a) : '';
      if (kdA && !kdB && !(A.nightAccom && A.nightAccom(a, b))) {
        var cutN = false;
        (info.parts || []).forEach(function (p) { if (p.role === 'night') { var pt = normNames(p.t, a, b); if (cut(pt)) cutN = true; } });
        if (cutN) { fo = locate(t, L.fore); bo = locate(t, L.body); co = locate(t, L.climax); if (!bo && !co) return why0('nobody'); }
      }
    }
    /* 夜の性格の展開の段（HK.PlayArc）：一段目は前戯の段のあと、二段目は最中の段のあと（三段目があれば性格が目立つ行為の段のあと）。部屋の場面（rs.steps）には足さない */
    var arcT = [];
    if (arcD && gen && !(rs && rs.steps)) {
      arcT = (arcD.def.st || []).map(function (st0) { return pickT(R, st0, mode, b); });
      if (!arcT[0] || !arcT[1]) arcT = [];
      else {
        /* 展開の持ち主の夜の性格の一文（attr-r18.js）は役割が重なるので外す（もう一人の夜の性格の一文が同じ段にあるときは残す） */
        var A2 = HK.Attr, kA = A2 && A2.nightKind ? A2.nightKind(a, b) : '', kB = A2 && A2.nightKind ? A2.nightKind(b, a) : '';
        if (arcD.side === 'a' ? kA && !kB && !(A2.nightAccom && A2.nightAccom(a, b)) : kB && !kA && !(A2.nightAccom && A2.nightAccom(b, a))) {
          var cutN2 = false;
          (info.parts || []).forEach(function (p) { if (p.role === 'night') { var pt = normNames(p.t, a, b); if (cut(pt)) cutN2 = true; } });
          if (cutN2) { fo = locate(t, L.fore); bo = locate(t, L.body); co = locate(t, L.climax); if (!bo && !co) return why0('nobody'); }
        }
        if (foreT) foreT += '\n\n' + arcT[0];
        midT = midT ? midT + '\n\n' + arcT[1] : arcT[1];
        if (arcT[2]) actT = actT ? actT + '\n\n' + arcT[2] : arcT[2];
      }
    }
    /* 終わり方 */
    var finT = '';
    if (co && gen) {
      var FT = ero ? (T0.FIN_E || T0.FIN) : T0.FIN;
      finT = pickT(R, ero ? (FT || {})[play.finish] : rtx(opt, 'FIN', play.finish, (FT || {})[play.finish]), tm, b);
      if (finT && ero) finT = fillE(finT, a, b);
      if (finT && pr && pr.after) finT += pickT(R, pr.after, mode, b);
      if (finT && rs && rs.steps) { var af = rs.steps.filter(function (s) { return s.stage === 'after'; }).map(function (s) { return stepText(R, s, ctx, a, b, mode); }).filter(Boolean).join(''); if (af) finT += '\n\n' + af; }
    }
    /* 本体の「感じていく」段の地の文の後ろに、受けの態度の崩れ方の一文（同じ文が毎回同じ段にならないように） */
    var fl = locate(t, L.feel || []);
    if (fl && T0.MID_B && !(co && fl.s >= co.s) && !(bo && fl.s >= bo.s && fl.s < bo.e) && !(fo && fl.s >= fo.s && fl.s < fo.e)) {
      var mb = T0.MID_B[psOf(b, a)] || T0.MID_B.gentle;
      put(fl.e, fl.e, coldB(R, mb), false);
    }
    /* 置き換え（後ろから） */
    if (co && finT) put(co.s, co.e, finT, true);
    if (bo && posT) {
      var tailP = (midT ? '\n\n' + midT : '') + (actT ? '\n\n' + actT : '');
      put(bo.s, bo.e, posT + tailP, true);
      if (actT) keep = keep.filter(function (k) { return actT.indexOf(k) < 0; });
    } else if (!bo && posT && co) {
      /* 繋がる段が見つからない（ほかの部品が組み替えた）：山場の段の前に、体位を変えて繋がり直す段を置く */
      var cs = t.lastIndexOf('\n\n', co.s); cs = cs < 0 ? 0 : cs + 2;
      put(cs, cs, posT + (midT ? '\n\n' + midT : '') + (actT ? '\n\n' + actT : '') + '\n\n', true);
    }
    if (fo && foreT) {
      /* 前戯の文のすぐあとに付いた「指を抜く」一文は外す（流れの管理が、要るときに付け直す） */
      var fe = fo.e, fx = locate(t.slice(fe, fe + 200), L.fout);
      if (fx && fx.s === 0) fe += fx.e;
      /* 攻めの一言などを挟んで同じ段落に残った「指を抜く」一文も外す（型の前戯は指を入れない文もあるので、入れていない指を抜く文にしない。2026-11-05） */
      else if (fx) { var pb = t.indexOf('\n\n', fe); if (pb < 0 || fe + fx.s < pb) put(fe + fx.s, fe + fx.e, '', false); }
      put(fo.s, fe, foreT, true);
    } else if (foreT && (bo || co)) {
      var at0 = bo ? bo.s : co.s, ps0 = t.lastIndexOf('\n\n', at0); ps0 = ps0 < 0 ? 0 : ps0 + 2;
      put(ps0, ps0, foreT + '\n\n', true);
      fo = { s: ps0, e: ps0 };
    }
    if (entT) {
      var es = fo ? fo.s : bo ? bo.s : -1;
      if (es >= 0) { var p0 = t.lastIndexOf('\n\n', es); p0 = p0 < 0 ? es : p0 + 2; if (p0 === 0) p0 = es; put(p0, p0, entT + '\n\n', true); }
    }
    edits.sort(function (x, y) { return y.s - x.s || y.e - x.e; });
    var out = t;
    edits.forEach(function (ed) { out = out.slice(0, ed.s) + ed.t + out.slice(ed.e); });
    out = out.replace(/\n{3,}/g, '\n\n');
    /* 着衣のときは、組み替えたあとにも脱がせる文が残っていないか（差し込んだ文の外）をもう一度 */
    if (play.prop === 'chakui') { var s2 = stripUndress(out, -1, -1); if (s2 != null) out = s2; }
    if (!hadPh) out = out.replace(/\{a\}/g, a.name).replace(/\{b\}/g, b.name);
    play.posT = posT ? posT.split(/\n\n/)[0] : '';
    play.lock = P.POSTURE[play.pos] || null;
    if (actT) play.act = actT.split(/\n\n/)[0];
    if (!arcT.length) play.arc = '';
    if (P.log) P.log.push({ a: a.name, b: b.name, mode: mode, play: { entry: play.entry, focus: play.focus, prop: play.prop, pos: play.pos, finish: play.finish, scene: play.scene || '', strap: !!play.strap, arc: play.arc || '' }, ero: ero, arcT: arcT });
    return { text: out, play: play, keep: keep, act: actT };
  }

  /* 直に触れた・脱がせた・口や指で中まで進んだ言い回しがあるか（着衣の型の前戯の頭を出すかどうか。台詞の中は見ない） */
  var BARE_BEFORE = /素肌|直に|直接(?:触|撫|肌)|服の(?:下|中|内側)(?:へ|に|で)|(?:下着|ショーツ)の(?:中|下)|(?:下着|ショーツ|ボタン)を(?:ずら|外)|脱が|はだけ|裸|口に含|咥え|舌を這わせ|舐め(?:上げ|回|た|る|て)|吸い上げ|指を[^。]{0,10}(?:沈め|差し入れ|埋め)|\{ナカ\}|\{後孔\}/;
  P.bareBefore = function (s) { return BARE_BEFORE.test(String(s || '').replace(/「[^」]*」/g, '')); };
  /* ---------- 短い・中くらいの場面：主な責めと体位の一文 ---------- */
  P.shortLine = function (a, b, mode, opt) {
    if (P.off || HK.SAFE_ON || !a || !b) return '';
    mode = mode === 'ff' || mode === 'fm' ? mode : 'mf';
    if (!P.ok(a, b, mode)) return '';
    var T0 = TX(); if (!T0.SHORT_FOCUS) return '';
    /* opt.posHint：差し込む先の本文の体位（P.postureOf）。合う体位の値に固定し、合わない体位の語の文は外す（2026-11-06） */
    var o2 = opt || {}, hint = o2.posHint || '';
    if (hint) { var okp = (P.MODE.pos[mode] || []).filter(function (k) { return HINT_POS[hint] && HINT_POS[hint].indexOf(k) >= 0; }); o2 = Object.assign({}, o2, { play: Object.assign({}, o2.play || {}, okp.length ? { pos: okp[0] } : {}) }); }
    var play = P.choose({ a: a, b: b, mode: mode, opt: o2, press: '', againAfter: true }), R = play.R; delete play.R; delete play._arc;
    var f = pickT(R, rtx(opt, 'SHORT_FOCUS', play.focus, T0.SHORT_FOCUS[play.focus]), mode, b), p = pickT(R, rtx(opt, 'SHORT_POS', play.pos, (T0.SHORT_POS || {})[play.pos]), mode, b);
    if (hint) { if (P.posConflict(f, hint)) f = ''; if (P.posConflict(p, hint)) p = ''; }
    if (P.log) P.log.push({ a: a.name, b: b.name, mode: mode, short: true, play: { focus: play.focus, pos: play.pos } });
    return f + p;
  };
  var HINT_POS = { rear: ['back', 'nebak'], aUp: ['seijo', 'osae'], bUp: ['kijo'], sit: ['zai'] };
  /* 短い場面（HK.ThickEro.short）：最初の段落（なければ最初の一文）のあとに差す */
  function insert1(text, ins) {
    if (!ins) return text;
    var i = text.indexOf('\n\n');
    if (i >= 0) return text.slice(0, i) + ins + text.slice(i);
    var d = 0;
    for (var k = 0; k < text.length; k++) { var c = text.charAt(k); if (c === '「') d++; else if (c === '」') d = Math.max(0, d - 1); else if (!d && c === '。') return text.slice(0, k + 1) + ins + text.slice(k + 1); }
    return text + ins;
  }
  P.insert1 = insert1;
  function install() {
    var X = HK.ThickEro;
    if (X && typeof X.short === 'function' && !X.short._play) {
      var s0 = X.short;
      X.short = function (o) {
        var r = s0.apply(this, arguments);
        if (!r || typeof r.text !== 'string' || !o || !o.a || !o.b || HK.SAFE_ON || P.off) return r;
        var l = P.shortLine(o.a, o.b, r.mode || o.mode, Object.assign({}, o, { posHint: P.postureOf(r.text, o.a, o.b) }));
        P._lastShort = o.a.name + '|' + o.b.name;
        if (l) r.text = insert1(r.text, l.replace(/\{a\}/g, o.a.name).replace(/\{b\}/g, o.b.name));
        return r;
      };
      Object.keys(s0).forEach(function (k) { if (k.charAt(0) === '_') X.short[k] = s0[k]; });
      X.short._play = true;
    }
    /* 長い場面の外から呼ばれる夜の性格の一文（追加パックの短い・中くらいの場面など）に、主な責めと体位の一文を足す。
       長い場面の中（HK.SexFlow.cur がある）・三人の場面（only）では足さない */
    var A = HK.Attr;
    if (A && typeof A.nightText === 'function' && !A.nightText._play) {
      var n0 = A.nightText;
      A.nightText = function (T, U, mode, pick, ero, only) {
        var r = n0.apply(this, arguments);
        if (HK.SAFE_ON || P.off || only || !T || !U || (HK.SexFlow && HK.SexFlow.cur)) return r;
        /* 足すのは、追加パックの部屋（id が set- で始まる）と、P.addRoom・P.addScene・P.SHORT で受け口を開けた箱庭だけ
           （本体の物語型・一人用の箱庭は、記録の文から二人の向きを読み直す部品があるので足さない） */
        var sid = scenIdOf(null);
        if (!(/^set-/.test(sid) || P.ROOM[sid] || P.SCENES[sid] || P.SHORT[sid])) return r;
        /* 直前に短い場面（HK.ThickEro.short）で同じ二人に一文を足していれば、二度は足さない */
        if (P._lastShort === T.name + '|' + U.name) { P._lastShort = ''; return r; }
        var l = P.shortLine(T, U, mode, { posHint: A.posHint ? A.posHint() : '' });
        return l ? (r || '') + l : r;
      };
      Object.keys(n0).forEach(function (k) { if (k.charAt(0) === '_') A.nightText[k] = n0[k]; });
      A.nightText._play = true;
    }
  }
  /* 本体の長い場面に時刻を渡す口（opt.when：'m' 朝・'d' 昼・'e' 夕方・'n' 夜、または時刻の数。2026-11-06）：組み立てのあいだ HK.SceneTime.cur に入れ、場面のあと言い換える */
  function installWhen() {
    var ST = HK.SceneTime; if (!ST) return;
    ['ThickSex', 'ThickEro'].forEach(function (n) {
      var X = HK[n]; if (!X || typeof X.scene !== 'function' || X.scene._when) return;
      var s0 = X.scene;
      X.scene = function (opt) {
        var w = opt && opt.when != null ? ST.norm(opt.when) : '';
        if (!w || HK.SAFE_ON) return s0.apply(this, arguments);
        var self = this, args = arguments;
        return ST.run(w, function () { var r = s0.apply(self, args); if (r && typeof r.text === 'string') r.text = ST.fix(r.text, w); return r; });
      };
      Object.keys(s0).forEach(function (k) { if (k.charAt(0) === '_') X.scene[k] = s0[k]; });
      X.scene._when = true;
    });
  }
  P.install = function () { install(); installWhen(); };
  /* attr-r18.js（あとで読む分）より後に包むため、シミュレーションの直前に入れる */
  if (HK.simulate && HK.wrap && !HK.simulate._play) HK.wrap(HK, 'simulate', function (sim0) {
    var g = function () { P.install(); return sim0.apply(this, arguments); };
    g._play = true;
    return g;
  }, 2);
})();
