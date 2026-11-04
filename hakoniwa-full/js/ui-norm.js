/* 箱庭診断 ui の部品：住人・保存データの整え（2026-11-04 に ui.js から分けた。中核 core。ui.js より前に読む）
   古い JSON・保存の足りない項目を既定値で補い、壊れた値を捨てる（normChar・normState など）。住人の id（uid）・登録順（newReg）・新しい住人（mk）もここ。
   ui.js・ui-json.js（late）・ui-cast-ops.js は HK.UINorm から引く。中身は ui.js にあったときと同じ */
(function () {
  'use strict';
  var HK = window.HK;
  /* 登録できる住人の上限（ui.js の MAX もここから引く。2026-10-27 に 200 → 1000） */
  var MAX = 1000;
  function uid() { return 'c' + Math.random().toString(36).slice(2, 9); }
  /* 登録順（reg）：住人を足した時刻（同じミリ秒に続けて足しても順が崩れないよう、前の値より必ず大きくする）。並び替えたあとも「登録順に戻す」で戻せる */
  var lastReg = 0;
  function newReg() { var t = Date.now(); if (t <= lastReg) t = lastReg + 1; lastReg = t; return t; }
  function mk(c) { var o = { id: uid(), reg: newReg(), name: c.name, eg: { CP: c.eg.CP, NP: c.eg.NP, A: c.eg.A, FC: c.eg.FC, AC: c.eg.AC }, memo: c.memo || '', group: c.group || '', tags: c.tags ? str(c.tags, 80).trim() : '', gender: c.gender || '', likes: c.likes || '', tone: c.tone || '', fp: c.fp || '', pos: c.pos || '', color: c.color || '', loveLock: idList(c.loveLock), sexLock: c.sexLock || '', sexLocks: idList(c.sexLocks), loveNG: (c.loveNG || []).slice(), call: c.call || '', calls: c.calls ? JSON.parse(JSON.stringify(c.calls)) : {}, keigo: c.keigo ? JSON.parse(JSON.stringify(c.keigo)) : {}, bmonth: c.bmonth || '', age: c.age || '', keigoOlder: !!c.keigoOlder, futa: !!c.futa, daku: !!c.daku, heart: c.heart !== false, faithful: !!c.faithful, noR18: !!c.noR18, posNpc: HK.Pos ? HK.Pos.npcValid(c.posNpc) : '', alcohol: HK.ALC_OK(c.alcohol) ? String(c.alcohol) : '', ab: c.ab && typeof c.ab === 'object' ? JSON.parse(JSON.stringify(c.ab)) : {}, abM: !!c.abM, partWords: c.partWords || '', partM: c.partM || '', partF: c.partF || '', you: c.you || '', callG: c.callG ? JSON.parse(JSON.stringify(c.callG)) : null }; return HK.Attr ? HK.Attr.mk(o, c) : o; }

  /* ---------- 保存データ・古いJSONの整え（足りない項目は既定値で補い、壊れた値は捨てる） ---------- */
  function obj(v) { return v && typeof v === 'object' && !Array.isArray(v) ? v : {}; }
  function str(v, n) { return v == null ? '' : String(v).slice(0, n || 80); }
  function okTone(v) { return !v || (HK.toneValid ? HK.toneValid(v) : !!HK.PERSONA[v]); }
  function okCall(v) { return !v || (HK.CALL_STYLES || []).some(function (o) { return o.v === v; }); }
  function fixEg(eg) {
    var o = {}; eg = obj(eg);
    HK.FACTORS.forEach(function (k) { var v = parseFloat(eg[k]); o[k] = isNaN(v) ? 10 : HK.clamp(v, 0, 20); });
    return o;
  }
  /* 住人の id の並び（文字列一つ・配列のどちらでも）。重複は除く */
  function idList(v) {
    var l = Array.isArray(v) ? v : typeof v === 'string' && v ? [v] : [];
    return l.filter(function (x, i) { return typeof x === 'string' && x && l.indexOf(x) === i; });
  }
  /* 性行為の相手の固定の古い値の読み替え（2026-10-26。「恋人だけ」「恋人とモブだけ」をなくし、固定に一本化）。
     保存・控え（normChar）と JSON の読み込みで、ここだけを通す：'loverOnly'（恋人だけ）→ 'pick'（固定した相手だけ）、'lover'（恋人とモブだけ）→ 'pickMob'（固定した相手＋モブ）。
     相手（sexLocks）が空なら恋愛相手の固定（loveLock）を写し、それも空なら ''（恋愛相手の固定に合わせる） */
  function migSexLock(c) {
    var v = c.sexLock;
    if (v !== 'lover' && v !== 'loverOnly') return c;
    var L = idList(c.sexLocks);
    if (!L.length) L = idList(c.loveLock);
    c.sexLocks = L.slice();
    c.sexLock = L.length ? (v === 'lover' ? 'pickMob' : 'pick') : '';
    return c;
  }
  HK.sexLockMig = migSexLock;
  /* 箱庭全体の口調の辞書（高度設定の adv.tone。tone-engine.js が読み込みのときに T.setUser で当てる）は 2026-10-26 にやめた。
     住人ごとの「語尾の設定」「辞書を直接書く」（tone-ending.js）だけが効く。ここで当たっていた分を外す（保存の値は消さず、画面にも出さない。ui-adv.js の RETIRED）。
     その辞書で作った口調（u:…）を選んでいた住人は、その口調の [口調] の節を住人の「辞書を直接書く」（c.toneDict。空のときだけ）に写し、口調はおまかせに戻す */
  var oldTone = (function () {
    var T = HK.Tone, m = {}, blocks = [], cur = null;
    if (!T || !T.setUser || !T.userText) return m;
    try {
      T.userText.split(/\r?\n/).forEach(function (l) { if (/^\s*[\[［]\s*口調(?:[\s　][^\]］]*)?[\]］]\s*$/.test(l)) { cur = [l]; blocks.push(cur); } else if (cur) cur.push(l); });
      blocks.forEach(function (b) { var tx = b.join('\n').replace(/\s+$/, ''), p = T.parse(tx, true); Object.keys(p.dicts).forEach(function (k) { if (/^u:/.test(k) && !m[k]) m[k] = tx; }); });
    } catch (e) { /* 読めなければ写さない */ }
    T.setUser('');
    return m;
  })();
  function migUserTone(c) {
    if (typeof c.tone !== 'string' || !/^u:/.test(c.tone)) return;
    var tx = oldTone[c.tone];
    if (tx && tx.length <= 4000 && !(typeof c.toneDict === 'string' && c.toneDict.trim())) c.toneDict = tx;
    c.tone = '';
  }
  function normChar(c) {
    c = obj(c);
    c.id = typeof c.id === 'string' && c.id ? c.id : uid();
    /* 登録順（足した時刻）。古い保存には無い → normState で今の並びの順に振る */
    c.reg = +c.reg > 0 && isFinite(+c.reg) ? Math.floor(+c.reg) : 0;
    c.name = str(c.name, 24).trim() || '名無し';
    c.eg = fixEg(c.eg);
    c.memo = str(c.memo, 80);
    c.group = str(c.group, 40).trim();
    /* タグ（グループとは別。読点・カンマで複数。住人の一覧で探す・絞り込むだけに使い、結果には影響しない） */
    c.tags = str(c.tags, 80).trim();
    if (['', 'm', 'f', 'x'].indexOf(c.gender || '') < 0) c.gender = '';
    if (['', 'm', 'f', 'both', 'none'].indexOf(c.likes || '') < 0) c.likes = '';
    if (['', 'top', 'bottom', 'riba'].indexOf(c.pos || '') < 0) c.pos = '';
    migUserTone(c);
    c.tone = okTone(c.tone) ? c.tone || '' : '';
    /* 喘ぎの口調（R18版。moan-engine.js）：決めたときだけ持つ。空ならいつもの口調 */
    if (c.moanTone && typeof c.moanTone === 'string' && okTone(c.moanTone)) c.moanTone = String(c.moanTone); else delete c.moanTone;
    /* 住人の喘ぎの辞書（受け・攻め）・声の区分・言葉責めと言い返しの多さ（R18版の ui-gear-moan.js。全年齢版では持たない） */
    ['moanDict', 'moanDictT'].forEach(function (k) { if (typeof c[k] === 'string' && c[k].trim() && !HK.SAFE_BUILD) c[k] = c[k].slice(0, 4000); else delete c[k]; }); (function (f, o) { var g = {}, p = {}; if (f && typeof f === 'object' && !HK.SAFE_BUILD) { if (['firm', 'soft', 'grand', 'none', 'off'].indexOf(f.kind) >= 0) g.kind = f.kind; if (typeof f.masc === 'boolean') g.masc = f.masc; } if (o && typeof o === 'object' && !HK.SAFE_BUILD) { ['tease', 'retort'].forEach(function (k) { if (['off', 'less', 'more'].indexOf(o[k]) >= 0) p[k] = o[k]; }); if (o.night === 'off' || (typeof o.night === 'string' && HK.PERSONA && HK.PERSONA[o.night])) p.night = o.night; } if (Object.keys(g).length) c.moanFit = g; else delete c.moanFit; if (Object.keys(p).length) c.moanOpt = p; else delete c.moanOpt; })(c.moanFit, c.moanOpt);
    c.fp = str(c.fp, 8).trim();
    c.color = typeof c.color === 'string' && /^#[0-9a-fA-F]{6}$/.test(c.color) ? c.color : '';
    c.call = okCall(c.call) ? c.call || '' : '';
    c.calls = obj(c.calls);
    /* 相手の性別で分けた敬称 { m, f, x } */
    if (c.callG && typeof c.callG === 'object') { var cg = {}; ['m', 'f', 'x'].forEach(function (k) { if (okCall(c.callG[k]) && c.callG[k] && c.callG[k] !== 'gender') cg[k] = c.callG[k]; }); c.callG = cg; } else c.callG = null;
    c.keigo = obj(c.keigo);
    /* 誕生月（1〜12）と年齢（1〜150）。分からなければ空 */
    c.bmonth = +c.bmonth >= 1 && +c.bmonth <= 12 ? String(Math.floor(+c.bmonth)) : '';
    c.age = +c.age >= 1 && +c.age <= 150 ? String(Math.floor(+c.age)) : '';
    c.keigoOlder = !!c.keigoOlder;
    c.futa = !!c.futa;
    c.daku = !!c.daku;
    /* ♡喘ぎ（既定はオン。外したときだけ false） */
    c.heart = c.heart !== false;
    if (HK.Attr) HK.Attr.norm(c);
    /* 箱庭をまたいで共通の能力値・欄（shared-stats.js） */
    if (HK.Shared) HK.Shared.norm(c);
    c.faithful = !!c.faithful;
    c.noR18 = !!c.noR18;
    /* 三人の場面（3P）は attr.js の c.trio（する／しない）。古い保存の「固定した相手が中心なら参加する」（trioHub）は読まずに捨てる（2026-10-27 担当HN） */
    delete c.trioHub;
    c.posNpc = HK.Pos ? HK.Pos.npcValid(c.posNpc) : '';
    /* お酒の強さ（1 弱い〜5 ザル。空ならおまかせ） */
    c.alcohol = HK.ALC_OK(c.alcohol) ? String(c.alcohol) : '';
    /* 性器の呼び方（R18版。作風と自由記入） */
    c.partWords = ['soft', 'direct', 'medical'].indexOf(c.partWords) >= 0 ? c.partWords : '';
    c.partM = str(c.partM, 10).replace(/[「」『』{}]/g, '').trim();
    c.partF = str(c.partF, 10).replace(/[「」『』{}]/g, '').trim();
    c.you = str(c.you, 8).trim();
    c.marks = str(c.marks, 30).trim();
    /* 語尾の付け替え（「です→っす、だ→だぜ」を5つまで。tone-new2.js） */
    c.toneCustom = (HK.normToneCustom ? HK.normToneCustom(str(c.toneCustom, 120)) : '');
    /* 恋愛相手の固定：相手の id の並び（複数可。以前の保存は一人の id の文字列） */
    c.loveLock = idList(c.loveLock);
    /* 性行為の相手の固定（R18）：''（恋愛相手の固定に合わせる）／any（誰とでも可）／pick（固定した相手だけ：sexLocks の人とだけ、モブとも関係を持たない）／
       pickMob（固定した相手＋モブ：住人では sexLocks の人とだけ、モブとは可）。古い lover・loverOnly は migSexLock で読み替える。以前の保存は一人の id の文字列 */
    migSexLock(c);
    if (c.sexLock === 'any') c.sexLocks = [];
    else if (c.sexLock === 'pick' || c.sexLock === 'pickMob' || Array.isArray(c.sexLock) || (typeof c.sexLock === 'string' && c.sexLock)) { var slMob = c.sexLock === 'pickMob'; c.sexLocks = idList(c.sexLock === 'pick' || slMob ? c.sexLocks : c.sexLock); c.sexLock = c.sexLocks.length ? (slMob ? 'pickMob' : 'pick') : ''; }
    else { c.sexLock = ''; c.sexLocks = []; }
    c.loveNG = Array.isArray(c.loveNG) ? c.loveNG.filter(function (x) { return typeof x === 'string'; }) : [];
    if (c.icon && !(typeof c.icon === 'string' && /^data:image\//.test(c.icon))) delete c.icon;
    return c;
  }
  /* 住人どうしの参照（恋愛相手・呼び方）と関係を、今いる住人だけに絞る */
  function normRefs(S0) {
    var ids = {};
    S0.chars.forEach(function (c) { ids[c.id] = 1; });
    S0.chars.forEach(function (c) {
      c.loveLock = idList(c.loveLock).filter(function (k) { return ids[k] && k !== c.id; });
      c.sexLocks = idList(c.sexLocks).filter(function (k) { return ids[k] && k !== c.id; });
      if ((c.sexLock === 'pick' || c.sexLock === 'pickMob') && !c.sexLocks.length) c.sexLock = '';
      /* 恋愛・R18にしない相手：今いる住人だけ。片方に書かれていれば、もう片方にも書く */
      c.loveNG = (c.loveNG || []).filter(function (k, i, l) { return ids[k] && k !== c.id && l.indexOf(k) === i; });
      Object.keys(c.calls).forEach(function (k) { if (!ids[k] || k === c.id || typeof c.calls[k] !== 'string' || !c.calls[k].trim()) delete c.calls[k]; else c.calls[k] = c.calls[k].slice(0, 16); });
      Object.keys(c.keigo).forEach(function (k) { if (!ids[k] || k === c.id || !c.keigo[k]) delete c.keigo[k]; else c.keigo[k] = 1; });
      if (HK.Attr) HK.Attr.normRefs(c, ids, S0.chars);
    });
    var byId = {};
    S0.chars.forEach(function (c) { byId[c.id] = c; });
    S0.chars.forEach(function (c) { (c.loveNG || []).forEach(function (k) { var o = byId[k]; if (o) { o.loveNG = o.loveNG || []; if (o.loveNG.indexOf(c.id) < 0) o.loveNG.push(c.id); } }); });
    /* 古い保存の形（敵対・不仲の欄 lh）は、気持ちの関係「愛憎」に写してから読む（ties.js の HK.tieLhMigrate。2026-10-29） */
    S0.ties = (Array.isArray(S0.ties) ? (HK.tieLhMigrate ? HK.tieLhMigrate(S0.ties) : S0.ties) : []).filter(function (t) {
      /* 関係の種類は自分の持つ鍵だけ（壊れた保存の type が「constructor」などでも読み込みが止まらないように） */
      if (!t || typeof t.type !== 'string' || !Object.prototype.hasOwnProperty.call(HK.TIES, t.type) || !ids[t.a] || !ids[t.b] || t.a === t.b) return false;
      /* 仲間（comrade）はグループの「仲間」から自動で付けるので、関係としては持たない */
      if (HK.tieHidden && HK.tieHidden(t.type)) return false;
      var CO = HK.coldOpts ? HK.coldOpts(t.type) : null;
      if (t.cold && !(CO && CO.map[t.cold])) delete t.cold;
      /* 恋愛の欄（どの関係にもある）：'ok'＝あり・'no'＝なし。ほかの値は自動（欄なし）として読む */
      if ('love' in t && t.love !== 'ok' && t.love !== 'no') delete t.love;
      if (HK.tieExtraNorm) HK.tieExtraNorm(t);
      return true;
    });
  }
  function normState(S0) {
    S0 = obj(S0);
    S0.chars = (Array.isArray(S0.chars) ? S0.chars : []).filter(function (c) { return c && typeof c === 'object'; }).slice(0, MAX).map(normChar);
    var seen = {};
    S0.chars.forEach(function (c) { if (seen[c.id]) c.id = uid(); seen[c.id] = 1; });
    /* 登録順の無い住人（古い保存）：今の並びの順に、時刻より小さい番号を振る（登録順に戻すと、古い住人が先・今の並びのまま） */
    S0.chars.forEach(function (c, i) { if (!c.reg) c.reg = i + 1; if (c.reg > lastReg && c.reg < 1e14) lastReg = c.reg; });
    /* 住人の一覧で隠しているグループ（表示だけ。グループ名 → 1）と、グループのない住人を隠すか */
    S0.grpHide = obj(S0.grpHide);
    Object.keys(S0.grpHide).forEach(function (g) { if (!S0.grpHide[g] || !String(g).trim()) delete S0.grpHide[g]; else S0.grpHide[g] = 1; });
    S0.grpHideNone = !!S0.grpHideNone;
    S0.env = obj(S0.env); S0.glob = obj(S0.glob); S0.per = obj(S0.per); S0.join = obj(S0.join);
    S0.seed = str(S0.seed, 12).replace(/[^\d]/g, '');
    if (typeof S0.teacher !== 'string') S0.teacher = '';
    if (typeof S0.randFrom !== 'string') S0.randFrom = '';
    S0.randN = Math.max(0, Math.min(100, parseInt(S0.randN, 10) || 0)) || '';
    /* 版の印と保存日時（控えとの照らし合わせに使う。下の bkHold） */
    S0.v = +S0.v || 0; S0.savedAt = +S0.savedAt || 0;
    /* グループごとの「このグループを仲間とみなす」（グループ名 → 1） */
    S0.grpComrade = obj(S0.grpComrade);
    Object.keys(S0.grpComrade).forEach(function (g) { if (!S0.grpComrade[g] || !String(g).trim()) delete S0.grpComrade[g]; else S0.grpComrade[g] = 1; });
    S0.chars.forEach(function (c) { migVamp(c, S0.per[c.id]); });
    /* 箱庭ごとに入っていた共通の能力値・欄を住人へ移す（shared-stats.js） */
    if (HK.Shared) S0.chars.forEach(function (c) { HK.Shared.migrate(c, S0.per[c.id]); });
    normRefs(S0);
    /* 話題（住人タブ「話題」の節。topics.js の HK.Topics.norm で 1 件ずつ整え、壊れたものは捨てる。上限まで・同じ id は先勝ち。消えた住人の話題は外す） */
    S0.topics = (function () {
      var out = [], seen = {}, ids = {};
      S0.chars.forEach(function (c) { ids[c.id] = 1; });
      (Array.isArray(S0.topics) ? S0.topics : []).forEach(function (t) {
        if (out.length >= (HK.Topics ? HK.Topics.MAX : 0)) return;
        var o = HK.Topics.norm(t);
        if (!o || seen[o.id] || (o.scope === 'char' && !ids[o.a]) || (o.scope === 'pair' && !(ids[o.a] && ids[o.b]))) return;
        seen[o.id] = 1; out.push(o);
      });
      return out;
    })();
    return S0;
  }
  /* 旧データの特殊役職「吸血鬼」を種族の吸血鬼に移す（special.js。箱庭ごとの欄からは外した） */
  function migVamp(c, per) {
    if (!c || !per || typeof per !== 'object') return;
    /* サキュバスの一夜：旧データの「標的」の欄（pick.target）を、役割の「標的（人間）になる」に移す */
    var sb = per.succubus && per.succubus.pick;
    if (sb && sb.target) { if (sb.target === 'yes') sb.role = 'target'; else if (sb.target === 'no' && !sb.role) sb.role = 'hunt'; delete sb.target; }
    Object.keys(per).forEach(function (sid) {
      var p = per[sid]; if (!p || !p.pick || p.pick.special !== 'vampire') return;
      /* 種族がほかに決まっている人（獣人の吸血鬼 など）は、旧データの値を残して吸血鬼のまま動かす（special.js が読む） */
      if (!c.race || c.race === 'human') { c.race = 'vampire'; delete p.pick.special; }
    });
  }

  HK.UINorm = { MAX: MAX, uid: uid, newReg: newReg, mk: mk, obj: obj, str: str, okTone: okTone, okCall: okCall, fixEg: fixEg, idList: idList,
    migSexLock: migSexLock, migUserTone: migUserTone, normChar: normChar, normRefs: normRefs, normState: normState, migVamp: migVamp };
})();
