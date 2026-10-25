/* 箱庭シミュレーター（R18版のみ）: 喘ぎの辞書のエンジン（HK.Moan）
   ■ 考え方
     ・言葉のない喘ぎ（短い声・吐息・鼻声・リズム）は口調に依らず全員で使い回す（moan-dict.js の HK.MOAN_SHARED。利用者が書き換えられる）
     ・言葉のある喘ぎは「態度9種で書いた基盤（moan-said.js）→ 台詞と同じ口調の変換」で作る。口調ごとに書いてある喘ぎ（ero-moan-tone.js）があれば優先する
     ・場面（乗り気・嫌がる・声を抑える・激しく突かれる・懇願・キス・口でしている・口でされる・攻め）× 段階の鍵で引く。鍵の一覧は moan-dict.js の先頭
   ■ 引き方
     HK.Moan.pick(S, who, 鍵, ctx)   … 鍵（'w1' など）で一つ選ぶ。ctx: { force 嫌がっている, deep 奥, late 後半, oral 口でされている, top 相手, p 部位の呼び方, talk 言葉の割合(0-1) }
     HK.Ero.moan(S, who, 段階0-2, ctx)（従来の呼び方）… 段階と ctx・主導権（who.eroDom）から鍵に読み替える
     本文の {m0}〜{m2} はこれまでどおり。{m:w1} {m:p} {m:k} のように鍵でも差し込める（HK.Ero.fill）
   ■ 優先順位
     住人ごとの上書き ＞ 利用者の口調の喘ぎ ＞ 口調ごとの喘ぎ（ero-moan-tone.js） ＞ 利用者の態度の上書き ＞ 態度の基盤（moan-said.js・ero-kit.js の表） ＞ 共通（利用者の上書き ＞ moan-dict.js）
   ■ 利用者の辞書（高度設定「喘ぎの辞書」。HK.Moan.setUser(文字列)）
     [喘ぎ 共通 乗り気 1]            ← 共通の、乗り気の1段階目（短い喘ぎ）を置き換える。1行に1つ（「|」で区切って複数も可）
     [喘ぎ 共通 乗り気 1 追加]       ← 置き換えずに足す
     [喘ぎ 口調=ギャル 嫌がる 1]     ← その口調の人だけ（口調名か鍵。口調の喘ぎより優先）
     [喘ぎ 態度=強気 乗り気 2]       ← その態度の人の言葉の基盤を置き換える
     [喘ぎ 住人=アキラ 乗り気 3]     ← その住人だけ（いちばん優先）
     場面の名前：乗り気／嫌がる／声を抑える／激しく／懇願／キス／口でしている／口でされる／攻め（鍵 w r h p b k o l t でもよい）
   登場人物はすべて成人として扱う。全年齢版にはこのファイルを置かない */
(function () {
  'use strict';
  var HK = window.HK, E = HK && HK.Ero;
  if (!HK || !E) return;
  var MODES = {
    w: { label: '乗り気', stages: ['短い喘ぎ', '感じ始め', '理性崩壊', '限界の拒絶'] },
    r: { label: '嫌がる', stages: ['拒絶', '控えめな感じ始め', '甘くなり始め', '理性崩壊', '大きい喘ぎ（甘くない）'] },
    h: { label: '声を抑える', stages: ['ほぼ吐息', '漏れつつある', '漏れ喘ぎまくる'] },
    p: { label: '激しく', stages: ['素直', '拒絶が混ざる'] },
    b: { label: '懇願', stages: ['もっと', '部位を欲しがる', '焦らすな'] },
    k: { label: 'キス', stages: ['キス中'] },
    o: { label: '口でしている', stages: ['鼻声'] },
    l: { label: '口でされる', stages: ['乗り気', '嫌がる'] },
    t: { label: '攻め', stages: ['吐息', '声を我慢', '口でされて漏れる', 'かわいいと言う', 'もう限界', '謝りながら'] }
  };
  var MODE_BY_NAME = { '乗り気': 'w', '嫌がる': 'r', '声を抑える': 'h', '激しく': 'p', '激しく突かれる': 'p', '懇願': 'b', 'キス': 'k', 'キス中': 'k', '口でしている': 'o', '口でされる': 'l', '攻め': 't' };
  /* 言葉だけの鍵・言葉のない鍵・両方を混ぜる鍵 */
  var WORDS_ONLY = { w3: 1, r0: 1, b0: 1, b1: 1, b2: 1, t3: 1, t4: 1, t5: 1 };
  var MIX = { w1: 1, w2: 1, r2: 1, r3: 1, h1: 0.25 };
  /* 態度ごとの、言葉のある喘ぎを使う割合（感じ始めなどで「そこ気持ちいい」と言うかどうか） */
  var TALK = { proud: 0.5, stern: 0.35, tsun: 0.6, gentle: 0.6, devoted: 0.6, cool: 0.35, free: 0.75, shy: 0.3, polite: 0.45 };
  var ROUGH = { proud: 1, stern: 1, cool: 1, tsun: 1 }, SOFT = { gentle: 1, devoted: 1, shy: 1, polite: 1 };
  /* 従来の表（ero-kit.js の M、ero-moan-tone.js の s0/s1/s2）を鍵に読み替える */
  var LEGACY = { r0: 's0', h1: 's0', w1: 's1', r2: 's1', w2: 's2', r3: 's2' };
  var PART_DEF = { proud: 'ちんぽ', tsun: 'ちんぽ', free: 'ちんぽ', cool: 'ちんぽ' };

  var M = HK.Moan = { MODES: MODES, user: null };
  M.keys = function () { var out = []; Object.keys(MODES).forEach(function (m) { MODES[m].stages.forEach(function (s, i) { out.push({ key: m + i, mode: m, stage: i, label: MODES[m].label + '・' + s }); }); }); return out; };
  M.label = function (key) { var m = MODES[key.charAt(0)], i = +key.slice(1); return m && m.stages[i] ? m.label + '・' + m.stages[i] : key; };

  /* ---------- 選び方 ---------- */
  function rng(S) { return (S && S.rng) || (S && S.int ? S : null); }
  function rand(S) { var r = rng(S); return r ? (typeof r === 'function' ? r() : r.float ? r.float() : Math.random()) : Math.random(); }
  function rint(S, n) { var r = rng(S); return r && r.int ? r.int(n) : Math.floor(rand(S) * n); }
  /* 一回の結果の中では同じ喘ぎをなるべく繰り返さない（ero-kit.js の pickFresh と同じ） */
  function fresh(S, list, tag) {
    if (!list || !list.length) return '';
    var st = S && S.rng ? S : { rng: rng(S) };
    var seen = st._eroSeen = st._eroSeen || {}, used = seen[tag] = seen[tag] || [];
    var free = list.filter(function (x) { return used.indexOf(x) < 0; });
    if (!free.length) { var old = list.slice().sort(function (a, b) { return used.indexOf(a) - used.indexOf(b); }); free = old.slice(0, Math.max(1, Math.ceil(old.length / 2))); }
    var x = free[rint(S, free.length)], i = used.indexOf(x); if (i >= 0) used.splice(i, 1); used.push(x);
    return x;
  }
  function psOf(who) { return (who && (HK.personaOf ? HK.personaOf(who) : who.persona)) || 'gentle'; }
  function toneOf(who) { return (who && HK.toneOf ? HK.toneOf(who) : null) || psOf(who); }
  function hasM(c) { var P = HK.Pos; if (!c) return false; if (P && P.genSet && P.genSet(c)) return P.hasM(c); return c.gender === 'm' || !!(P && P.futa && P.futa(c)); }
  function fallenOf(who) { return !!(who && (who.fallen || who.fell || (who.corrupt || 0) >= 75)); }
  function count(S, who) { var st = S && S.rng ? S : {}; var m = st._eroCnt = st._eroCnt || {}, k = (who && who.name) || '?'; return (m[k] = (m[k] || 0) + 1); }

  /* 言葉のある候補（優先順：住人 ＞ 利用者の口調 ＞ 口調の喘ぎ ＞ 利用者の態度 ＞ 態度の基盤 ＞ 従来の態度の表） */
  function wordPool(who, key) {
    var U = M.user, ps = psOf(who), tone = toneOf(who), lg = LEGACY[key];
    if (U && U.tone[tone] && U.tone[tone][key]) return U.tone[tone][key];
    var TM = E.TONE_MOAN && E.TONE_MOAN[tone];
    if (TM && lg && TM[lg] && TM[lg].length) return TM[lg];
    if (U && U.persona[ps] && U.persona[ps][key]) return U.persona[ps][key];
    var SD = HK.MOAN_SAID && HK.MOAN_SAID[ps];
    if (SD && SD[key] && SD[key].length) return SD[key];
    var LM = E.MOAN && E.MOAN[ps];
    if (LM && lg) return LM[{ s0: 0, s1: 1, s2: 2 }[lg]] || null;
    return null;
  }
  function sharedPool(key) { var U = M.user, SH = HK.MOAN_SHARED || {}; if (U && U.shared[key]) return U.shared[key]; return SH[key] || null; }
  /* 部位の呼び方（{p}）を埋める。相手に男性器がなければ、その行は使わない */
  function fillPart(list, who, ctx) {
    var p = ctx && ctx.p ? ctx.p : ctx && ctx.top && hasM(ctx.top) ? (PART_DEF[psOf(who)] || 'おちんちん') : null;
    var out = list.filter(function (x) { return p || x.indexOf('{p}') < 0; });
    return p ? out.map(function (x) { return x.replace(/\{p\}/g, p); }) : out;
  }
  /* 濁点喘ぎ：設定がオンの人だけ。口調の濁点の表があればそれ、なければ文字を濁らせる */
  function dakuize(S, s) {
    var n = 0;
    return s.replace(/([あおん])(?=[、…っ♡！ぁ]|$)/g, function (m, ch) { if (n >= 2 || rand(S) < 0.4) return m; n++; return ch + '゛'; });
  }
  function dakuOk(S, who, key, ctx) {
    if (!E.dakuOf || !E.dakuOf(who)) return false;
    var m = key.charAt(0), st = +key.slice(1), fal = fallenOf(who), late = !!(ctx && ctx.late);
    var p = (key === 'w2' || key === 'r3' || key === 'r4') ? 0.8 : (key === 'w3' || key === 'p0' || key === 'p1') ? 0.5 : (key === 'w1' || key === 'r2') ? ((ctx && (ctx.deep || ctx.force)) || late || fal ? 0.6 : 0) : (m === 'h' && st > 0 && (fal || (ctx && ctx.force))) ? 0.35 : 0;
    return p > 0 && rand(S) < p;
  }
  /* 激しく突かれているときのリズムの喘ぎ（部品からその場で組む） */
  M.pound = function (S, who, refuse, sweet) {
    var P = HK.MOAN_POUND; if (!P) return '';
    var n = 3 + rint(S, 6), out = [], noAt = refuse ? 1 + rint(S, Math.max(1, n - 1)) : -1, no2 = refuse && n > 5 && rand(S) < 0.5 ? n - 1 : -1;
    for (var i = 0; i < n; i++) {
      var list = (i === noAt || i === no2) ? (sweet && rand(S) < 0.5 ? P.noSweet : P.no) : (sweet && rand(S) < 0.3 ? P.unitSweet : P.unit);
      var u = list[rint(S, list.length)];
      /* 声が詰まる「っ」をときどき足す（もう付いているもの・言葉には足さない） */
      if (list === P.unit && !/っ$/.test(u) && rand(S) < 0.35) u += 'っ';
      out.push(u);
      if (i < n - 1) out.push(P.sep[rint(S, P.sep.length)]);
    }
    var tails = sweet ? P.tailSweet : P.tail;
    return out.join('') + tails[rint(S, tails.length)];
  };

  /* 鍵で一つ選ぶ */
  M.pick = function (S, who, key, ctx) {
    ctx = ctx || {};
    if (!MODES[key.charAt(0)] || !MODES[key.charAt(0)].stages[+key.slice(1)]) key = 'w0';
    var U = M.user, ps = psOf(who), out = null, tag = (who && who.name) + '.' + key;
    /* 住人ごとの上書き */
    if (U && who && who.name && U.who[who.name] && U.who[who.name][key]) out = fresh(S, fillPart(U.who[who.name][key], who, ctx), tag);
    if (out == null || out === '') {
      var wantWords = WORDS_ONLY[key] ? true : MIX[key] ? rand(S) < (ctx.talk != null ? ctx.talk : (MIX[key] < 1 ? MIX[key] : (TALK[ps] || 0.5))) : false;
      var wp = wantWords ? wordPool(who, key) : null;
      if (wp) wp = fillPart(wp, who, ctx);
      if (wp && wp.length) out = fresh(S, wp, tag);
      else if (key === 'p0' || key === 'p1') out = sharedPool(key) && rand(S) < 0.5 ? fresh(S, sharedPool(key), tag) : M.pound(S, who, key === 'p1', !ROUGH[ps] || fallenOf(who));
      else {
        var sp = sharedPool(key);
        if (!sp || !sp.length) {
          /* 言葉だけの鍵で候補がないとき（部位の行が使えない など）は近い鍵に */
          var alt = { b1: 'b0', b0: 'w1', b2: 'w1', w3: 'w2', r0: 'r1', t3: 't1', t4: 't1', t5: 't1' }[key];
          return alt ? M.pick(S, who, alt, ctx) : '……っ';
        }
        out = fresh(S, sp, tag);
      }
    }
    if (!out) return '……っ';
    if (dakuOk(S, who, key, ctx)) {
      var TM = E.TONE_MOAN && E.TONE_MOAN[toneOf(who)];
      if (TM && TM.daku && TM.daku.length && (key === 'w2' || key === 'r3') && rand(S) < 0.6) return fresh(S, TM.daku, tag + '.daku');
      out = dakuize(S, out);
    }
    return out;
  };

  /* ---------- 従来の呼び方（段階 0〜2）を鍵に読み替える ---------- */
  var moan0 = E.moan;
  E.moan = function (S, who, stage, ctx) {
    var cx = ctx && typeof ctx === 'object' ? ctx : { deep: !!ctx };
    var st = Math.max(0, Math.min(2, stage | 0)), ps = psOf(who), fal = fallenOf(who), n = count(S, who), late = cx.late || n > 6, key;
    if (who && who.eroDom) {
      if (st === 0) key = cx.oral ? 't2' : rand(S) < 0.5 ? 't0' : 't1';
      else if (st === 1) key = cx.force && SOFT[ps] && rand(S) < 0.35 ? 't5' : rand(S) < 0.55 ? 't3' : 't1';
      else key = cx.force && SOFT[ps] && rand(S) < 0.25 ? 't5' : 't4';
      /* 従来の主導権の喘ぎ（ero-kit.js の DOM）も候補に残す：荒い／やわらかい */
      if (st < 2 && rand(S) < 0.35 && moan0) return moan0.call(this, S, who, st, ctx);
      return M.pick(S, who, key, cx);
    }
    if (cx.oral) key = cx.force ? 'l1' : 'l0';
    else if (cx.force) {
      if (st === 0) key = n <= 2 ? 'r0' : 'r1';
      else if (st === 1) key = late || fal ? 'r3' : 'r2';
      else key = fal ? 'r3' : ROUGH[ps] && rand(S) < 0.4 ? 'r4' : 'r3';
      if (cx.deep && st > 0 && rand(S) < 0.3) key = 'p1';
    } else {
      if (st === 0) key = late ? 'h2' : n <= 2 ? 'h0' : 'h1';
      else if (st === 1) key = rand(S) < 0.15 ? 'b0' : 'w1';
      else key = late && rand(S) < 0.3 ? 'w3' : 'w2';
      if (cx.deep && st > 0 && rand(S) < 0.3) key = fal || late ? 'p1' : 'p0';
    }
    return M.pick(S, who, key, cx);
  };
  /* 本文の {m:鍵} を埋める（{m0}〜{m2}・{s:…} は ero-kit.js の E.fill がそのまま） */
  var fill0 = E.fill;
  E.fill = function (S, text, who) {
    var t = String(text).replace(/\{m:([a-z]\d?)\}/g, function (m, k, at, all) {
      if (k.length === 1) k += '0';
      var cx = E.ctxOf(all, at);
      if (k === 'p') k = cx.force || fallenOf(who) ? 'p1' : 'p0';
      return M.pick(S, who, k, cx);
    });
    return fill0.call(this, S, t, who);
  };

  /* ---------- 利用者の辞書 ---------- */
  function toneKeyOf(name) {
    if (!name) return null;
    if (HK.TONES && HK.TONES[name] || HK.PERSONA && HK.PERSONA[name]) return name;
    var keys = HK.TONE_KEYS || [];
    for (var i = 0; i < keys.length; i++) { var info = HK.toneInfo ? HK.toneInfo(keys[i]) : null; if (info && info.label && (info.label === name || info.label.indexOf(name) === 0)) return keys[i]; }
    return null;
  }
  function personaKeyOf(name) {
    if (!name) return null;
    if (HK.PERSONA && HK.PERSONA[name]) return name;
    var ks = HK.PERSONA_KEYS || [];
    for (var i = 0; i < ks.length; i++) if (HK.PERSONA[ks[i]].label === name) return ks[i];
    return null;
  }
  function keyOf(mode, stage) {
    var m = MODE_BY_NAME[mode] || (/^[wrhpbkolt]$/.test(mode) ? mode : null);
    if (!m) return null;
    var st = stage == null || stage === '' ? 0 : (+String(stage).replace(/[０-９]/g, function (d) { return String.fromCharCode(d.charCodeAt(0) - 0xFEE0); }) - 1);
    if (!(st >= 0 && st < MODES[m].stages.length)) return null;
    return m + st;
  }
  /* 文字列 → { shared, tone, persona, who, errors } */
  M.parse = function (text) {
    var out = { shared: {}, tone: {}, persona: {}, who: {}, errors: [] }, cur = null, lines = String(text || '').split(/\r?\n/);
    lines.forEach(function (raw, i) {
      var line = raw.replace(/^\s+|\s+$/g, '');
      if (!line || /^[#＃]/.test(line)) return;
      var h = line.match(/^[\[［]\s*喘ぎ\s+(.+?)\s*[\]］]$/);
      if (h) {
        var parts = h[1].split(/[\s　]+/), scope = parts[0], add = parts[parts.length - 1] === '追加';
        if (add) parts.pop();
        var mode = parts[1], stage = parts[2];
        /* 鍵そのもの（w1）で書いたとき */
        if (parts.length === 2 && /^[wrhpbkolt]\d$/.test(parts[1])) { mode = parts[1].charAt(0); stage = String(+parts[1].slice(1) + 1); }
        var key = keyOf(mode, stage);
        if (!key) { out.errors.push((i + 1) + '行目：場面か段階が読めません（' + h[1] + '）'); cur = null; return; }
        var box = null;
        if (scope === '共通') box = out.shared;
        else if (/^口調[=＝]/.test(scope)) { var tk = toneKeyOf(scope.slice(3)); if (!tk) { out.errors.push((i + 1) + '行目：口調「' + scope.slice(3) + '」が見つかりません'); cur = null; return; } box = out.tone[tk] = out.tone[tk] || {}; }
        else if (/^態度[=＝]/.test(scope)) { var pk = personaKeyOf(scope.slice(3)); if (!pk) { out.errors.push((i + 1) + '行目：態度「' + scope.slice(3) + '」が見つかりません'); cur = null; return; } box = out.persona[pk] = out.persona[pk] || {}; }
        else if (/^住人[=＝]/.test(scope)) { var nm = scope.slice(3); box = out.who[nm] = out.who[nm] || {}; }
        else { out.errors.push((i + 1) + '行目：範囲が読めません（共通／口調=／態度=／住人=）'); cur = null; return; }
        cur = { box: box, key: key, add: add, started: false };
        return;
      }
      if (!cur) { out.errors.push((i + 1) + '行目：先に [喘ぎ …] の見出しが要ります'); return; }
      var items = line.split(/[|｜]/).map(function (x) { return x.replace(/^\s+|\s+$/g, ''); }).filter(Boolean).map(function (x) { return x.slice(0, 80); });
      if (!cur.started) {
        cur.started = true;
        if (cur.add) { var base = cur.box === out.shared ? (HK.MOAN_SHARED || {})[cur.key] : null; cur.box[cur.key] = (base || []).slice(); }
        else cur.box[cur.key] = [];
      }
      cur.box[cur.key] = cur.box[cur.key].concat(items);
    });
    return out;
  };
  M.setUser = function (text) {
    var p = M.parse(text);
    var any = Object.keys(p.shared).length || Object.keys(p.tone).length || Object.keys(p.persona).length || Object.keys(p.who).length;
    M.user = any ? p : null;
    M.userText = String(text || '');
    return p;
  };
  /* 設定画面の見本（鍵ごとに数個出す。rng は固定の種） */
  M.demo = function (key, persona, tone, n) {
    var x = 12345, R = function () { x = (x * 1103515245 + 12345) % 2147483648; return x / 2147483648; };
    R.int = function (m) { return Math.floor(R() * m); };
    var S = { rng: R }, who = { name: '見本', persona: persona || 'gentle', tone: tone || persona || 'gentle', eg: null };
    var out = [];
    for (var i = 0; i < (n || 4); i++) out.push(M.pick(S, who, key, { top: { gender: 'm' }, talk: WORDS_ONLY[key] ? 1 : MIX[key] ? 0.5 : 0 }));
    return out;
  };
  /* 保存してある辞書を読む（ui-adv.js が HK.store の adv.moan に入れる） */
  try { var adv = HK.store && HK.store.get('adv', null); if (adv && adv.moan) M.setUser(adv.moan); } catch (e) { /* 読めなければ組み込みだけ */ }
})();
