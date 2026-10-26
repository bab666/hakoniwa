/* 箱庭診断 ui: 住人の登録・箱庭の設定・実行・状態保存 */
(function () {
  'use strict';
  var HK = window.HK, esc = HK.escape, V = HK.View;
  /* 死のある箱庭に「特殊役職」の欄を足す（special.js） */
  if (HK.Special) HK.Special.install();
  var MAX = 100;   /* 登録できる住人の上限（箱庭に参加できるのは最大30人） */
  var JOIN_MAX = 30;
  /* 13人目以降の色トークン（明暗それぞれ。100人分） */
  (function () {
    var L = [], D = [];
    for (var i = 12; i < 100; i++) {
      var h = (i * 47 + 15) % 360;
      L.push('--p' + i + ':hsl(' + h + ' 55% 38%)');
      D.push('--p' + i + ':hsl(' + h + ' 65% 70%)');
    }
    var css = ':root{' + L.join(';') + '}@media (prefers-color-scheme: dark){:root:not([data-theme="light"]){' + D.join(';') + '}}:root[data-theme="dark"]{' + D.join(';') + '}';
    var st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);
  })();
  function genv(scen) { return scen.solo ? scen.env.concat(HK.GLOBAL_ENV.filter(function (e) { return e.all; })) : scen.env.concat(HK.GLOBAL_ENV); }
  function smin(id) { return (HK.SCENARIOS[id] && HK.SCENARIOS[id].minCast) || 2; }
  function smax(id) { return Math.min(JOIN_MAX, (HK.SCENARIOS[id] && HK.SCENARIOS[id].maxCast) || 12); }
  /* この箱庭に参加する住人（未設定なら先頭から上限まで） */
  function joined(id) {
    var max = smax(id), list = S.join && S.join[id];
    var ids = S.chars.map(function (c) { return c.id; });
    if (!list) return S.chars.slice(0, max);
    if (list.length > max && max === 1) list = list.slice(0, 1);
    return S.chars.filter(function (c) { return list.indexOf(c.id) >= 0; });
  }
  /* 恋人が三人以上いる人が、その恋人たちと同じ箱庭に入るときの注意書き（場面は三人まで・恋人どうしは嫉妬せず互いを相手にしない：engine.js の coNG、room-trio.js の stayFor） */
  function loveCrowdNote(id) {
    var J = joined(id), ids = J.map(function (c) { return c.id; }), nm = function (cid) { var c = S.chars.filter(function (x) { return x.id === cid; })[0]; return c ? c.name : ''; };
    var lov = {};
    (S.ties || []).forEach(function (t) {
      if (!/^(lover|mate|fated)$/.test(t.type) || ids.indexOf(t.a) < 0 || ids.indexOf(t.b) < 0 || t.a === t.b) return;
      [[t.a, t.b], [t.b, t.a]].forEach(function (p) { var l = lov[p[0]] = lov[p[0]] || []; if (l.indexOf(p[1]) < 0) l.push(p[1]); });
    });
    var who = Object.keys(lov).filter(function (k) { return lov[k].length >= 3; });
    if (!who.length) return '';
    return '<p class="hint" id="lovewarn" style="color:var(--warn)">※' + who.map(function (k) { return esc(nm(k)) + 'には、この箱庭に一緒に入る恋人が' + lov[k].length + '人（' + lov[k].map(function (x) { return esc(nm(x)); }).join('・') + '）います'; }).join('。') +
      '。恋人が三人以上そろうときは、夜や三人の場面は三人までにして、残る恋人とは順番に過ごします。同じ人を恋人にしている者どうしは、互いに嫉妬せず、互いを恋愛・R18の相手にもしません（二人のあいだに恋愛の関係を設定した場合は除く）。そろう人数が多いほど、一人ひとりの出番は少なくなります。</p>';
  }
  function updLoveWarn() {
    var el = document.getElementById('lovewarn'), html = loveCrowdNote(S.scenId), jc = document.getElementById('joincount');
    if (el) el.remove();
    if (html && jc) jc.insertAdjacentHTML('afterend', html);
  }
  var SAMPLE = [
    { name: '朝霧', code: 'BDACD', memo: '例：皮肉屋の元刑事' },
    { name: '鷹野', code: 'CABAB', memo: '例：誰にでも優しい医大生' },
    { name: 'ミナト', code: 'BBBCA', memo: '例：空気を読みすぎる後輩' },
    { name: '白石', code: 'ACDAD', memo: '例：直情的な先輩' },
    { name: '黒田', code: 'AABBD', memo: '例：面倒見のいい体育教師' },
    { name: '雪村', code: 'DCBAC', memo: '例：無邪気な天才肌の後輩' },
    { name: '鷲尾', code: 'ADADD', memo: '例：冷徹な若手社長' },
    { name: '柚木', code: 'CBCAB', memo: '例：甘え上手なムードメーカー' },
    { name: '灰谷', code: 'BCADA', memo: '例：几帳面で気弱な研究員' },
    { name: '千歳', code: 'BABCB', memo: '例：おっとりした長女気質の看護師' }
  ].map(function (c) { return { name: c.name, eg: HK.fromCode(c.code), memo: c.memo }; });

  /* ---------- グループ（住人を「〇〇組」「原作A」などでまとめる。箱庭での参加者選びと並び替えに使う） ---------- */
  /* 住人のグループはカンマ・読点で区切って複数つけられる（「原作A, 生徒会」）。絞り込みは、どれかに一致すればそのグループの一員 */
  function grpList(c) { var g = []; String((c && c.group) || '').split(/[,，、]/).forEach(function (x) { x = x.trim(); if (x && g.indexOf(x) < 0) g.push(x); }); return g; }
  function inGrp(c, g) { return grpList(c).indexOf(g) >= 0; }
  HK.groupList = grpList;
  /* 住人の一覧で隠しているグループ（S.grpHide）。グループのある住人は、つけたグループがすべて隠れているときだけ一覧から隠す（箱庭の参加者選びには影響しない） */
  function grpHidden(c) { var h = S.grpHide || {}, g = grpList(c); return g.length > 0 && g.every(function (x) { return h[x]; }); }
  function groupsOf() { var g = [], seen = {}; S.chars.forEach(function (c) { grpList(c).forEach(function (x) { if (!seen[x]) { seen[x] = 1; g.push(x); } }); }); return g; }
  /* グループ順に並べる（グループ名の順、グループなしは最後。グループ内の順は保つ） */
  function sortByGroup() {
    var idx = {}; S.chars.forEach(function (c, i) { idx[c.id] = i; });
    S.chars.sort(function (a, b) {
      var ga = grpList(a)[0] || '', gb = grpList(b)[0] || '';
      if (ga !== gb) { if (!ga) return 1; if (!gb) return -1; return ga.localeCompare(gb, 'ja'); }
      return idx[a.id] - idx[b.id];
    });
  }
  function uid() { return 'c' + Math.random().toString(36).slice(2, 9); }
  function mk(c) { var o = { id: uid(), name: c.name, eg: { CP: c.eg.CP, NP: c.eg.NP, A: c.eg.A, FC: c.eg.FC, AC: c.eg.AC }, memo: c.memo || '', group: c.group || '', gender: c.gender || '', likes: c.likes || '', tone: c.tone || '', fp: c.fp || '', pos: c.pos || '', posLike: c.posLike || '', color: c.color || '', loveLock: idList(c.loveLock), sexLock: c.sexLock || '', sexLocks: idList(c.sexLocks), loveNG: (c.loveNG || []).slice(), call: c.call || '', calls: c.calls ? JSON.parse(JSON.stringify(c.calls)) : {}, keigo: c.keigo ? JSON.parse(JSON.stringify(c.keigo)) : {}, bmonth: c.bmonth || '', age: c.age || '', keigoOlder: !!c.keigoOlder, futa: !!c.futa, daku: !!c.daku, faithful: !!c.faithful, noR18: !!c.noR18, trioHub: !!c.trioHub, posNpc: c.posNpc === 'bottom' ? 'bottom' : '', alcohol: HK.ALC_OK(c.alcohol) ? String(c.alcohol) : '', ab: c.ab && typeof c.ab === 'object' ? JSON.parse(JSON.stringify(c.ab)) : {}, abM: !!c.abM, partWords: c.partWords || '', partM: c.partM || '', partF: c.partF || '', you: c.you || '', callG: c.callG ? JSON.parse(JSON.stringify(c.callG)) : null }; return HK.Attr ? HK.Attr.mk(o, c) : o; }

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
    c.name = str(c.name, 24).trim() || '名無し';
    c.eg = fixEg(c.eg);
    c.memo = str(c.memo, 80);
    c.group = str(c.group, 40).trim();
    if (['', 'm', 'f', 'x'].indexOf(c.gender || '') < 0) c.gender = '';
    if (['', 'm', 'f', 'both', 'none'].indexOf(c.likes || '') < 0) c.likes = '';
    if (['', 'top', 'bottom', 'riba'].indexOf(c.pos || '') < 0) c.pos = '';
    if (['', 'tb', 'tr', 'br', 'any'].indexOf(c.posLike || '') < 0) c.posLike = '';
    migUserTone(c);
    c.tone = okTone(c.tone) ? c.tone || '' : '';
    /* 喘ぎの口調（R18版。moan-engine.js）：決めたときだけ持つ。空ならいつもの口調 */
    if (c.moanTone && typeof c.moanTone === 'string' && okTone(c.moanTone)) c.moanTone = String(c.moanTone); else delete c.moanTone;
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
    if (HK.Attr) HK.Attr.norm(c);
    /* 箱庭をまたいで共通の能力値・欄（shared-stats.js） */
    if (HK.Shared) HK.Shared.norm(c);
    c.faithful = !!c.faithful;
    c.noR18 = !!c.noR18;
    /* 三人の場面：固定した相手が中心なら参加する（R18版。room-trio.js） */
    c.trioHub = !!c.trioHub;
    c.posNpc = c.posNpc === 'bottom' ? 'bottom' : '';
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
    S0.ties = (Array.isArray(S0.ties) ? S0.ties : []).filter(function (t) {
      /* 関係の種類は自分の持つ鍵だけ（壊れた保存の type が「constructor」などでも読み込みが止まらないように） */
      if (!t || typeof t.type !== 'string' || !Object.prototype.hasOwnProperty.call(HK.TIES, t.type) || !ids[t.a] || !ids[t.b] || t.a === t.b) return false;
      /* 仲間（comrade）はグループの「仲間」から自動で付けるので、関係としては持たない */
      if (HK.tieHidden && HK.tieHidden(t.type)) return false;
      var CO = HK.coldOpts ? HK.coldOpts(t.type) : null;
      if (t.cold && !(CO && CO.map[t.cold])) delete t.cold;
      if (HK.tieExtraNorm) HK.tieExtraNorm(t);
      return true;
    });
  }
  function normState(S0) {
    S0 = obj(S0);
    S0.chars = (Array.isArray(S0.chars) ? S0.chars : []).filter(function (c) { return c && typeof c === 'object'; }).slice(0, MAX).map(normChar);
    var seen = {};
    S0.chars.forEach(function (c) { if (seen[c.id]) c.id = uid(); seen[c.id] = 1; });
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
  /* ---------- 住人・関係の控え（hakoniwa:state:backup） ----------
     旧版（同じドメインに置いた hako_R18_old など）は保存の場所を共有していて、開いて何か変えると、旧版の知らない関係などを落として state を書き戻す。
     今の版は保存のたびに、版の印（STATE_V）と保存日時（savedAt）を付けた控えも書く。起動時に state が控えと食い違い、控えにあるものが欠けていれば、
     画面の上に知らせを出して控えから戻せるようにする（知らせを出しているあいだは控えを書き換えない）。履歴・セーブは対象外 */
  var STATE_V = 2026102602, bkHold = null;
  function bkBody(st) { var o = {}; Object.keys(st || {}).forEach(function (k) { if (k !== 'v' && k !== 'savedAt') o[k] = st[k]; }); return JSON.stringify(o); }
  function bkLost(b, s) {
    var full = function (v) { return !(v == null || v === '' || v === false || (typeof v === 'object' && !Object.keys(v).length)); };
    var tk = function (t) { return t ? [t.a, t.b, t.type].join('|') : ''; }, have = (Array.isArray(s.ties) ? s.ties : []).map(tk), sc = {};
    (Array.isArray(s.chars) ? s.chars : []).forEach(function (c) { if (c && c.id) sc[c.id] = c; });
    if ((b.ties || []).some(function (t) { return have.indexOf(tk(t)) < 0; })) return true;
    return (b.chars || []).some(function (c) { var o = c && sc[c.id]; return !o || Object.keys(c).some(function (k) { return full(c[k]) && !full(o[k]); }); });
  }
  (function () {
    var raw = HK.store.get('state', null), bk = HK.store.get('state:backup', null);
    if (!raw || typeof raw !== 'object' || !bk || !bk.state || typeof bk.state !== 'object' || !bk.at || bk.at === HK.store.get('state:backup:skip', 0)) return;
    /* 控えの形が崩れていて照らし合わせられないときは、知らせを出さない（崩れた控えは次の保存で書き直す）。ここで止まると画面が出ない */
    try {
      if (raw.v === bk.v && raw.savedAt === bk.at && bkBody(raw) === bkBody(bk.state)) return;
      if (bkLost(bk.state, raw)) bkHold = bk;
    } catch (e) { bkHold = null; }
  })();
  /* 読み込みで例外が出たとき（壊れた値・今の版が知らない形）：以前はサンプルの住人に差し替えて、そのまま保存を上書きしていた（住人がまるごと消える）。
     今は、読めなかった保存をそのまま「state:rescue」に退避してから、住人・関係ごとに読めるものだけ拾う。退避できなかったら（保存領域がいっぱい）、
     このページでは住人の保存を上書きしない（rescueHold）。どちらも画面の上に知らせを出し、元の保存を JSON で書き出せるようにする */
  var S, rescue = null, rescueHold = false;
  function salvage(raw) {
    var src = obj(raw), chars = [], ties = [], base = {};
    Object.keys(src).forEach(function (k) { if (k !== 'chars' && k !== 'ties') base[k] = src[k]; });
    var tryN = function (o) { try { return normState(JSON.parse(JSON.stringify(o))); } catch (e) { return null; } };
    if (!tryN(base)) base = {};
    (Array.isArray(src.chars) ? src.chars : []).forEach(function (c) { if (tryN({ chars: chars.concat([c]) })) chars.push(c); });
    (Array.isArray(src.ties) ? src.ties : []).forEach(function (t) { if (tryN({ chars: chars, ties: ties.concat([t]) })) ties.push(t); });
    base.chars = chars; base.ties = ties;
    return tryN(base) || normState({});
  }
  (function () {
    var raw = HK.store.get('state', null);
    try { S = normState(raw); return; } catch (e) { rescue = { at: Date.now(), err: String(e && e.message || e).slice(0, 200), state: HK.store.get('state', null) }; }
    var had = rescue.state && typeof rescue.state === 'object' && Array.isArray(rescue.state.chars) ? rescue.state.chars.length : 0;
    rescue.chars = had;
    /* 退避（前の退避があれば、同じ中身のときは書き直さない） */
    var prev = HK.store.get('state:rescue', null);
    if (!(prev && JSON.stringify(prev.state) === JSON.stringify(rescue.state)) && !HK.store.set('state:rescue', rescue)) rescueHold = true;
    S = salvage(rescue.state);
    if (window.console) console.error('住人の保存を読み込めませんでした（退避して、読める分だけ使います）', rescue.err);
  })();
  if (!S.chars.length) { S.chars = SAMPLE.map(mk); S.sample = true; }
  /* 以前の4人サンプルのまま保存されていたら、10人のサンプルに差し替える */
  else if (S.sample && S.chars.length < SAMPLE.length && S.chars.every(function (c, i) { return SAMPLE[i] && c.name === SAMPLE[i].name; })) {
    S.chars = S.chars.concat(SAMPLE.slice(S.chars.length).map(mk));
  }
  if (!HK.SCENARIOS[S.scenId]) S.scenId = HK.SCEN_ORDER[0];
  HK.Icons.set(S.chars);
  /* 「これまでの箱庭」（履歴）：一覧は localStorage の history（id・日時・箱庭・住人名・シード・要約・入力。r は結果を置いた印、r18 は R18モードで動かしたか）。
     結果そのものは history.js（HK.History）に id で置き、開くときはそれをそのまま表示する。id や r の無い古い形の履歴・置けなかった結果は、
     開いたときに今の版で回し直して表示し、結果を置いて以後は固定にする */
  var HIST_MAX = 12;
  var histRaw = HK.store.get('history', []);
  if (!Array.isArray(histRaw)) histRaw = [];
  histRaw = histRaw.filter(function (h) { return h && h.input && Array.isArray(h.input.chars); });
  var hist = histRaw.filter(function (h) { return HK.SCENARIOS[h.input.scenId]; });
  /* この画面で出せない箱庭（全年齢モードで隠す R18 の箱庭など）の履歴は、表示しないが消さない（書き戻すときに足す） */
  var histHid = histRaw.filter(function (h) { return !HK.SCENARIOS[h.input.scenId]; });
  var histNote = '', histCur = null, histPend = [];   /* histPend：結果を置いている途中の履歴（一覧に「未保存」の印を出さない） */
  var tab = 'cast', result = null, showAll = false;

  function bkKey() { return (HK.STORE ? HK.STORE.prefix : 'hakoniwa:') + 'state:backup'; }
  function save() {
    HK.Icons.set(S.chars);
    /* 読み込めなかった保存を退避できなかったときは、住人の保存を上書きしない（下の rescueNotice で書き出してもらう） */
    if (rescueHold) return false;
    S.v = STATE_V; S.savedAt = Date.now();
    var ok = HK.store.set('state', S);
    /* 控えを書けなかった（保存領域がいっぱい）ときは、古い控えを残さない。残すと、次に開いたとき「旧版を開いた」の知らせが誤って出て、
       「控えから戻す」で古い住人に戻ってしまう */
    if (ok && !bkHold && !rescue && !HK.store.set('state:backup', { v: STATE_V, at: S.savedAt, state: S })) { try { window.localStorage.removeItem(bkKey()); } catch (e) { /* 使えない環境 */ } }
    return ok;
  }
  /* 読み込めなかった保存の知らせ（上の rescue）。元の保存（退避したもの）を JSON で書き出せる。閉じると、それ以降は控えも書く */
  function rescueNotice() {
    var box = document.createElement('div');
    box.id = 'rescuenote'; box.setAttribute('role', 'alert');
    box.style.cssText = 'margin:8px 0 12px;padding:10px 12px;border:1px solid #c0392b;border-radius:8px;background:#fde8e6;color:#3a0d08;line-height:1.6';
    box.innerHTML = '保存していた住人・関係を読み込む途中でエラーが起きました（住人' + rescue.chars + '人ぶんの保存）。読めた' + (S.sample ? '住人はいませんでした（いまはサンプルの住人です）' : '住人' + S.chars.length + '人・関係' + (S.ties || []).length + '本を表示しています') + '。' +
      (rescueHold ? '<b>ブラウザの保存領域がいっぱいで元の保存を退避できなかったため、このページでの住人の変更は保存しません。</b>先に元の保存を書き出してください。' : '元の保存はそのまま退避してあります。') +
      '<div class="row" style="margin-top:6px;flex-wrap:wrap;gap:6px;align-items:center"><button type="button" class="btn small" id="rescue-out">元の保存をJSONで書き出す</button>' +
      (rescueHold ? '' : '<button type="button" class="btn small ghost" id="rescue-ok">閉じる</button>') + '</div>';
    var host = document.querySelector('main') || document.body;
    host.insertBefore(box, host.firstChild);
    box.querySelector('#rescue-out').addEventListener('click', function () {
      var text = JSON.stringify(rescue.state || null), d = new Date(), p2 = function (n) { return ('0' + n).slice(-2); };
      var name = 'hakoniwa-state-rescue-' + d.getFullYear() + p2(d.getMonth() + 1) + p2(d.getDate()) + '.json';
      try {
        var blob = new Blob([text], { type: 'application/json' }), url = URL.createObjectURL(blob), a = document.createElement('a');
        if (!('download' in a)) throw new Error('nodl');
        a.href = url; a.download = name; document.body.appendChild(a); a.click(); a.remove();
        setTimeout(function () { URL.revokeObjectURL(url); }, 4000);
        toast('元の保存をJSONで書き出しました');
      } catch (e) { copy(text, '元の保存のJSONをクリップボードにコピーしました'); }
    });
    var okb = box.querySelector('#rescue-ok');
    if (okb) okb.addEventListener('click', function () { rescue = null; box.remove(); save(); });
  }
  /* 全年齢版の初回の移行で、保存領域が足りず住人を写せなかったとき（safe.js の印の fail）。R18版の保存はそのまま残っている */
  function migNotice() {
    var KS = HK.STORE, f = KS && KS.zenrei && KS.flag && KS.flag();
    if (!f || !Array.isArray(f.fail) || f.fail.indexOf('hakoniwa:state') < 0 || f.failSeen) return;
    var box = document.createElement('div');
    box.id = 'mignote'; box.setAttribute('role', 'alert');
    box.style.cssText = 'margin:8px 0 12px;padding:10px 12px;border:1px solid #d9a400;border-radius:8px;background:#fff4c2;color:#3a2e00;line-height:1.6';
    box.innerHTML = '保存の場所を版ごとに分けたときに、以前の住人・関係をこの全年齢版へ写しきれませんでした（ブラウザの保存領域がいっぱいでした）。以前の住人はもう一方の版にそのまま残っています。' +
      'そちらの「まるごと書き出し」と、この版の「まるごと読み込む」（住人タブの「別の端末へ移す」）で移せます。' +
      '<div class="row" style="margin-top:6px"><button type="button" class="btn small ghost" id="mig-ok">閉じる</button></div>';
    var host = document.querySelector('main') || document.body;
    host.insertBefore(box, host.firstChild);
    box.querySelector('#mig-ok').addEventListener('click', function () { KS.setFlag({ failSeen: 1 }); box.remove(); });
  }
  /* 控えの知らせ（上の bkHold）。戻す：控えを state に写して読み込み直す。このまま使う：その控えでは二度と出さず、今の内容で控えを書き直す */
  function bkNotice() {
    migNotice();
    if (rescue) { rescueNotice(); return; }
    if (!bkHold) { save(); return; }
    var b = bkHold, d = new Date(b.at), p2 = function (n) { return ('0' + n).slice(-2); };
    var box = document.createElement('div');
    box.id = 'bknote'; box.setAttribute('role', 'alert');
    box.style.cssText = 'margin:8px 0 12px;padding:10px 12px;border:1px solid #d9a400;border-radius:8px;background:#fff4c2;color:#3a2e00;line-height:1.6';
    /* 控えにあって今の住人にいない人・関係の数（旧版が読めずにサンプルの住人で上書きしたときなど、丸ごと入れ替わっていれば大きい） */
    var have = {}, tk = function (t) { return t ? [t.a, t.b, t.type].join('|') : ''; }, haveT = (S.ties || []).map(tk);
    S.chars.forEach(function (c) { have[c.id] = 1; });
    var missC = (b.state.chars || []).filter(function (c) { return c && !have[c.id]; }).length, missT = (b.state.ties || []).filter(function (t) { return haveT.indexOf(tk(t)) < 0; }).length;
    box.innerHTML = '旧版を開いたため、住人の設定や関係の一部（新しい関係など）が消えている可能性があります。' +
      (missC || missT ? '控えにある<b>' + (missC ? '住人' + missC + '人' : '') + (missC && missT ? '・' : '') + (missT ? '関係' + missT + '本' : '') + '</b>が、今の保存にありません。' : '') +
      '<div class="row" style="margin-top:6px;flex-wrap:wrap;gap:6px;align-items:center"><button type="button" class="btn small" id="bk-restore">控えから戻す</button>' +
      '<span class="hint" style="margin:0;color:inherit">（控え：' + (d.getMonth() + 1) + '/' + d.getDate() + ' ' + p2(d.getHours()) + ':' + p2(d.getMinutes()) + ' 保存、住人' + ((b.state.chars || []).length) + '人・関係' + ((b.state.ties || []).length) + '本）</span>' +
      '<button type="button" class="btn small ghost" id="bk-keep">このまま使う</button></div>';
    var host = document.querySelector('main') || document.body;
    host.insertBefore(box, host.firstChild);
    box.querySelector('#bk-restore').addEventListener('click', function () {
      if (HK.store.set('state', b.state)) location.reload(); else toast('戻せませんでした（ブラウザの保存領域がいっぱいかもしれません）');
    });
    box.querySelector('#bk-keep').addEventListener('click', function () {
      /* 控えは書き直すと戻せなくなるので、欠けがあるときは確かめる */
      if ((missC || missT) && !window.confirm('控えにある' + (missC ? '住人' + missC + '人' : '') + (missC && missT ? '・' : '') + (missT ? '関係' + missT + '本' : '') + 'は、このまま使うと戻せなくなります。よろしいですか？\n\n［OK］このまま使う\n［キャンセル］やめる（あとで「控えから戻す」を選べます）')) return;
      HK.store.set('state:backup:skip', b.at); bkHold = null; box.remove(); save();
    });
  }
  function $(sel) { return document.querySelector(sel); }

  var toastTimer = null;
  function toast(msg) {
    var t = $('#toast');
    t.textContent = msg; t.hidden = false;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { t.hidden = true; }, 2200);
  }

  function copy(text, okMsg) {
    function fallback() {
      var ta = document.createElement('textarea');
      ta.value = text; ta.setAttribute('readonly', '');
      ta.style.position = 'fixed'; ta.style.left = '-9999px';
      document.body.appendChild(ta); ta.select();
      var ok = false;
      try { ok = document.execCommand('copy'); } catch (e) { ok = false; }
      document.body.removeChild(ta);
      toast(ok ? okMsg : 'コピーできませんでした。テキストを選択して手動でコピーしてください');
    }
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(function () { toast(okMsg); }, fallback);
    } else fallback();
  }

  /* ---------- タブ ---------- */
  function setTab(t) {
    tab = t;
    ['cast', 'box', 'result', 'saves'].forEach(function (k) {
      var tb = $('#tab-' + k), vw = $('#view-' + k);
      if (tb) tb.setAttribute('aria-selected', String(k === t));
      if (vw) vw.hidden = k !== t;
    });
    if (t === 'saves' && HK.Saves) HK.Saves.render();
    if (t === 'cast') renderCast();
    if (t === 'box') renderBox();
    if (t === 'result') renderResult();
    if (HK.UI && HK.UI.applyColors) HK.UI.applyColors(t === 'result' && result && result.input ? result.input.chars : S.chars);
    var top = $('.tabs').getBoundingClientRect().top + window.pageYOffset - 4;
    if (window.pageYOffset > top) window.scrollTo(0, top);
  }

  /* ---------- 住人 ---------- */
  function egoGraph(eg, i) {
    var pts = HK.FACTORS.map(function (k, j) { return [10 + j * 24.5, 34 - (eg[k] / 20) * 28]; });
    return '<svg width="118" height="40" viewBox="0 0 118 40" aria-hidden="true">' +
      '<line x1="4" x2="114" y1="20" y2="20" style="stroke:var(--line)"/>' +
      '<polyline fill="none" points="' + pts.map(function (p) { return p[0].toFixed(1) + ',' + p[1].toFixed(1); }).join(' ') + '" style="stroke:var(--p' + i + ');stroke-width:2"/>' +
      pts.map(function (p) { return '<circle cx="' + p[0].toFixed(1) + '" cy="' + p[1].toFixed(1) + '" r="2.6" style="fill:var(--p' + i + ')"/>'; }).join('') + '</svg>';
  }

  /* 口調・態度：おまかせ（エゴグラムから）か、8種から上書き */
  function autoTone(c) { var k = HK.toneAuto ? HK.toneAuto(HK.traits(c.eg)) : HK.personaAuto(HK.traits(c.eg)); return (HK.toneInfo ? HK.toneInfo(k) : HK.PERSONA[k]).label; }
  function toneSel(c) {
    return '<select id="tn-' + c.id + '" data-f="tone" aria-label="' + esc(c.name) + 'の口調・態度" title="台詞の口調・態度。おまかせだとエゴグラムから決まります">' +
      '<option value="">口調：おまかせ（' + esc(autoTone(c)) + '）</option>' +
      HK.PERSONA_KEYS.map(function (k) { return '<option value="' + k + '"' + (c.tone === k ? ' selected' : '') + ' title="' + esc(HK.PERSONA[k].desc) + '">口調：' + esc(HK.PERSONA[k].label) + '</option>'; }).join('') + '</select>' +
      '<input type="text" class="fp" id="fp-' + c.id + '" data-f="fp" value="' + esc(c.fp || '') + '" placeholder="一人称（空なら口調から）" maxlength="8" aria-label="' + esc(c.name) + 'の一人称" title="台詞の中の一人称（俺・私・僕など）をこの言葉に置き換えます">';
  }
  var GENDERS = [['', '性別：おまかせ'], ['m', '男性'], ['f', '女性'], ['x', 'その他']];
  var POS = [['', '受け攻め：おまかせ'], ['top', '攻め'], ['bottom', '受け'], ['riba', 'リバ']];
  var LIKES = [['', '恋愛対象：おまかせ'], ['m', '対象：男性'], ['f', '対象：女性'], ['both', '対象：男女両方'], ['none', '対象：なし（興味なし）']];
  function gsel(c, f, list, pre) {
    return '<select id="' + pre + '-' + c.id + '" data-f="' + f + '" data-id="' + c.id + '" aria-label="' + esc(c.name) + (f === 'gender' ? 'の性別' : 'の恋愛対象') + '">' + list.map(function (o) { return '<option value="' + o[0] + '"' + ((c[f] || '') === o[0] ? ' selected' : '') + '>' + o[1] + '</option>'; }).join('') + '</select>';
  }
  function resRow(c, i) {
    return '<div class="res" data-id="' + c.id + '">' +
      '<button type="button" class="draghandle" aria-label="' + esc(c.name) + 'を並び替える（ドラッグ、または上下の矢印キー）" title="ドラッグで並び替え（上下キーでも動かせます）">≡</button>' +
      '<span class="avset">' + '<button type="button" class="avbtn" data-act="iconpick" aria-label="' + esc(c.name) + 'のアイコンを' + (c.icon ? '変える' : '設定する') + '" title="アイコンを' + (c.icon ? '変える' : '設定する') + '">' + HK.Icons.html(c.name, i, 44) + (c.icon ? '' : '<i class="avplus" aria-hidden="true">＋</i>') + '</button>' +
      (c.icon ? '<button type="button" class="avdel" data-act="icondel" aria-label="' + esc(c.name) + 'のアイコンを外す" title="アイコンを外す">×</button>' : '') + '</span>' +
      '<div class="who"><input type="text" id="nm-' + c.id + '" data-f="name" value="' + esc(c.name) + '" aria-label="名前" maxlength="24">' +
      '<div class="codeline"><input type="text" class="code" id="cd-' + c.id + '" data-f="code" value="' + HK.toCode(c.eg) + '" maxlength="5" autocomplete="off" autocapitalize="characters" spellcheck="false" aria-label="5文字コード（CP NP A FC AC）"><span class="ty">' + esc(HK.egoType(c.eg).label) + '</span>' + (HK.egoAttWord ? '<span class="egatt" title="態度（台詞の表の種類）。⚙️ 設定の「この住人の傾向」に説明があります">' + esc(HK.egoAttWord(c)) + '</span>' : '') + '</div></div>' +
      '<div class="ego">' + HK.FACTORS.map(function (k) {
        return '<label title="' + esc(HK.FACTOR_FULL[k]) + '">' + k + '<input type="number" id="eg-' + c.id + '-' + k + '" inputmode="decimal" min="0" max="20" step="1" data-f="eg" data-k="' + k + '" value="' + c.eg[k] + '"></label>';
      }).join('') + '</div>' +
      '<div class="gwrap">' + egoGraph(c.eg, i) + '</div>' +
      '<button class="btn ghost small" data-act="del" aria-label="' + esc(c.name) + 'を削除">削除</button>' +
      '<div class="memo"><input type="text" class="grp" id="gp-' + c.id + '" data-f="group" value="' + esc(c.group || '') + '" placeholder="グループ（任意・カンマで複数）" maxlength="40" list="grplist" aria-label="' + esc(c.name) + 'のグループ" title="同じグループ名をつけた住人は、箱庭でまとめて選んだり、並び替えたりできます。カンマで区切ると複数のグループに入れられます"><input type="text" id="mm-' + c.id + '" data-f="memo" value="' + esc(c.memo) + '" placeholder="メモ（任意・結果には影響しません）" maxlength="80">' +
      '<span class="gearpair" style="display:inline-flex;gap:6px;align-items:center;flex:0 0 auto"><button type="button" class="btn small gearbtn" data-act="gear" aria-label="' + esc(c.name) + 'の設定（口調・呼び方・関係など）" title="口調・一人称・呼び方・性別・恋愛・イメージカラー・関係をまとめて設定"><span aria-hidden="true">⚙️</span> 設定</button>' +
      '<button type="button" class="btn small ghost" data-act="dup"' + (S.chars.length >= MAX ? ' disabled title="住人が上限の' + MAX + '人まで登録されているので、複製できません"' : ' title="この住人の設定をすべて写した住人を、すぐ下に足します（関係と、ほかの住人を指す設定は写しません）"') + ' aria-label="' + esc(c.name) + 'を複製">複製</button></span>' +
      '<span class="csum">' + (HK.UI && HK.UI.summary ? HK.UI.summary(c) : '') + '</span></div>' +
      '</div>';
  }

  function renderCast() {
    var html =
      '<h2 class="sec">住人をまとめて登録' + (HK.Tips ? HK.Tips.btn('cast-import') : '') + '</h2>' +
      '<p class="hint">「<a href="https://kaimin.sakura.ne.jp/archive/tools/ego/" target="_blank" rel="noopener">ふたりのエゴグラム</a>」の5文字コード（CP→NP→A→FC→AC の順、A＝とても強い〜D＝控えめ）を名前と並べて貼ると登録できます（1行に1人）。診断結果の文をそのまま貼ってもOK。ほかの書き方は見出しの ？ にあります。</p>' +
      '<div class="import"><div>' +
      '<textarea id="bulk" rows="6" placeholder="- 朝霧 BDACD\n・鷹野：CABAB\nミナト bbbca // 後輩"></textarea>' +
      '<div class="row" style="margin-top:8px"><button class="btn" data-act="import-add">追加で読み込む</button><button class="btn" data-act="import-replace">名簿を置き換える</button><span class="spacer"></span><button class="btn ghost" data-act="export">名簿をテキストでコピー</button></div>' +
      '<div class="row" style="margin-top:6px"><button class="btn" data-act="jsonout">住人をJSONで書き出す</button><button class="btn" data-act="jpick" aria-expanded="' + (jpOpen ? 'true' : 'false') + '">選んだ住人だけ書き出す</button><button class="btn" data-act="jsonadd">JSONを読み込む（追加）</button><button class="btn" data-act="jsonrep">JSONで置き換える</button><input type="file" id="jsonfile" accept=".json,application/json" hidden></div>' +
      '<p class="hint" style="margin:4px 0 6px">念のため、キャラクター設定・セーブデータなどは定期的なバックアップをお願いいたします（「住人をJSONで書き出す」か、下の「まるごと書き出し」でファイルに残せます）。</p>' +
      pickPanel() +
      /* 別の端末へ移す：まるごと書き出し・共有・文字列（portable.js） */
      (HK.Portable ? HK.Portable.html() : '') +
      '<ul class="warn" id="warns" hidden></ul></div>' +
      '</div>' +
      '<h2 class="sec">住人　<span class="num" style="font-size:15px">' + S.chars.length + '/' + MAX + '</span>' + (HK.Tips ? HK.Tips.btn('cast') : '') + '</h2>' +
      (S.sample ? '<p class="sample-note">いま並んでいるのはサンプルの住人です。自分のキャラクターに置き換えてください。</p>' : '') +
      '<input type="file" id="iconfile" accept="image/*" hidden>' +
      '<p class="hint" style="margin-top:-4px">≡ をドラッグで並び替え、左の丸でアイコンを設定できます。グループをつけると、箱庭でまとめて選べます。</p>' +
      (groupsOf().length ? '<div class="row" style="margin:-2px 0 8px"><button class="btn small" data-act="sortgrp">グループ順に並べる</button><span class="hint" style="margin:0">グループ（押すと一覧での表示・非表示）：</span>' + groupsOf().map(function (g) { var on = !(S.grpHide && S.grpHide[g]); return '<button class="chip" data-act="grphide" data-g="' + esc(g) + '" aria-pressed="' + on + '" title="' + esc(g) + 'の住人を一覧で' + (on ? '隠す' : '表示する') + '">' + (on ? '' : '<s>') + esc(g) + '（' + S.chars.filter(function (c) { return inGrp(c, g); }).length + '）' + (on ? '' : '</s>') + '</button>'; }).join('') + (S.chars.some(grpHidden) ? '<span class="hint" style="margin:0">' + S.chars.filter(grpHidden).length + '人を隠しています</span>' : '') + '</div>' : '') +
      /* グループごとの「仲間」：オンのグループの住人どうしは、箱庭に入るときに関係「仲間」が付く（ほかの関係があれば、それに重ねる） */
      (groupsOf().length ? '<div class="row" style="margin:-2px 0 8px"><span class="hint" style="margin:0" title="オンにしたグループの住人どうしは、信頼が育ちやすく、助け合い・庇い合い・弔い・一緒に動く出来事が起きます。恋愛や嫉妬には関わりません。関係図には薄い線で出ます（線の絞り込みで「全部」のとき）">仲間とみなすグループ：</span>' + groupsOf().map(function (g) { var on = !!(S.grpComrade && S.grpComrade[g]); return '<button class="chip" data-act="grpcomrade" data-g="' + esc(g) + '" aria-pressed="' + on + '" title="' + esc(g) + 'の住人どうしを仲間と' + (on ? 'みなさない' : 'みなす') + '">' + (on ? '仲間：' : '') + esc(g) + '</button>'; }).join('') + '</div>' : '') +
      '<datalist id="grplist">' + groupsOf().map(function (g) { return '<option value="' + esc(g) + '">'; }).join('') + '</datalist>' +
      '<div class="cast" id="castlist">' + S.chars.map(function (c, i) { var h = resRow(c, i); return grpHidden(c) ? h.replace('<div class="res"', '<div class="res" hidden style="display:none"') : h; }).join('') + '</div>' +
      (S.chars.length >= MAX ? '<p class="hint" id="castfull" style="color:var(--warn)">住人が上限の' + MAX + '人まで登録されています。追加・複製するには、誰かを削除してください。</p>' : '') +
      '<div class="row" style="margin-top:12px"><button class="btn" data-act="add"' + (S.chars.length >= MAX ? ' disabled' : '') + '>1人追加</button><button class="btn" data-act="quiz"' + (S.chars.length >= MAX ? ' disabled' : '') + '>質問に答えて診断して追加</button><span class="hint" style="margin:0">「<a href="https://kaimin.sakura.ne.jp/archive/tools/ego/" target="_blank" rel="noopener">ふたりのエゴグラム</a>」と同じ25問で、エゴグラムを出して住人にできます。</span></div>' +
      tiesSection() +
      '<div class="row" style="margin-top:20px"><span class="spacer"></span><button class="btn primary" data-act="tobox">箱庭を選ぶ</button></div>';
    $('#view-cast').innerHTML = html;
  }

  /* ---------- 既存の関係 ---------- */
  /* ---------- 住人の複製（住人の行の「複製」） ----------
     その住人の設定（エゴグラム・口調・語尾の設定・辞書・一人称/二人称・性別・恋愛対象・受け攻め・体の設定・好物・箱庭の能力・アイコン・箱庭ごとの設定 など）を
     すべて写した住人を、すぐ下に足す。関係（S.ties）と、ほかの住人を指す設定（恋愛相手の固定・性行為の相手の固定・相手ごとの設定・恋愛にしない相手・
     殺さない相手・同一人物）は写さない。名前は「〇〇２」のように、今いる住人と重ならないものにする */
  var DUP_CLEAR = { loveLock: [], sexLocks: [], loveNG: [], noKillFor: [], calls: {}, keigo: {}, nightFor: {}, posFor: {}, youFor: {}, fpFor: {}, same: '', sameDark: false };
  function zen(n) { return String(n).replace(/\d/g, function (d) { return String.fromCharCode(d.charCodeAt(0) + 0xFEE0); }); }
  function dupName(name) {
    var used = {}; S.chars.forEach(function (c) { used[c.name] = 1; });
    var base = String(name || '').replace(/[０-９]+$/, '') || String(name || '名無し');
    for (var n = 2; n < 1000; n++) { var suf = zen(n), nm = base.slice(0, 24 - suf.length) + suf; if (!used[nm]) return nm; }
    return base.slice(0, 16) + Date.now().toString(36).slice(-8);
  }
  function dupChar(src) {
    var ids = {}; S.chars.forEach(function (c) { ids[c.id] = 1; });
    var c = JSON.parse(JSON.stringify(src));
    do { c.id = uid(); } while (ids[c.id]);
    c.name = dupName(src.name);
    Object.keys(DUP_CLEAR).forEach(function (k) { c[k] = JSON.parse(JSON.stringify(DUP_CLEAR[k])); });
    if (c.sexLock === 'pick' || c.sexLock === 'pickMob') c.sexLock = '';
    /* 念のため：ほかの欄に残った住人の id（あとから足した相手ごとの欄）も外す */
    Object.keys(c).forEach(function (k) {
      var v = c[k];
      if (k === 'id' || k === 'name') return;
      if (typeof v === 'string') { if (ids[v]) c[k] = ''; }
      else if (Array.isArray(v)) c[k] = v.filter(function (x) { return !(typeof x === 'string' && ids[x]); });
      else if (v && typeof v === 'object') Object.keys(v).forEach(function (kk) { if (ids[kk]) delete v[kk]; });
    });
    c = normChar(c);
    /* 箱庭ごとの設定（最初の行動・短期目標・能力値・武器・箱庭の欄）も写す。住人を指す値は外す */
    if (S.per && S.per[src.id]) {
      var pp = JSON.parse(JSON.stringify(S.per[src.id]));
      Object.keys(pp).forEach(function (sid) { var o = pp[sid]; if (o && typeof o === 'object') Object.keys(o).forEach(function (k) { if (typeof o[k] === 'string' && ids[o[k]]) delete o[k]; }); });
      S.per[c.id] = pp;
    }
    return c;
  }
  function dupRes(id) {
    var src = S.chars.filter(function (c) { return c.id === id; })[0];
    if (!src) return;
    if (S.chars.length >= MAX) { toast('住人が上限の' + MAX + '人まで登録されているので、複製できません'); return; }
    var c = dupChar(src);
    S.sample = false;
    S.chars.splice(S.chars.indexOf(src) + 1, 0, c);
    save(); renderCast();
    var q = '「' + src.name + '」を複製して「' + c.name + '」を足しました（関係と、ほかの住人を指す設定は写していません）。\n\n' +
      '「' + c.name + '」を「' + src.name + '」と同一人物にしますか？' +
      (src.same && src.same !== c.id ? '\n（' + src.name + 'はいま別の人と同一人物です。はいを選ぶと、' + c.name + 'の側だけに付けます）' : '') +
      '\n\n［OK］はい（同一人物にする）\n［キャンセル］いいえ';
    if (window.confirm(q)) {
      c.same = src.id;
      if (!src.same) src.same = c.id;
      save(); renderCast();
      toast('「' + c.name + '」を「' + src.name + '」と同一人物にしました');
    } else toast('「' + c.name + '」を足しました');
    var nm = document.getElementById('nm-' + c.id);
    if (nm) { nm.focus(); nm.select(); }
  }
  function cleanTies() {
    var ids = S.chars.map(function (c) { return c.id; });
    S.ties = (S.ties || []).filter(function (t) { return ids.indexOf(t.a) >= 0 && ids.indexOf(t.b) >= 0 && t.a !== t.b && HK.TIES[t.type]; });
  }
  /* 二人の間にその関係がすでにあるか（向きは問わない） */
  function hasTie(a, b, ty, skip) { return (S.ties || []).some(function (t, k) { return k !== skip && t.type === ty && ((t.a === a && t.b === b) || (t.a === b && t.b === a)); }); }
  /* まだ付いていない「二人×関係」を一つ返す（友人を優先し、二人の組は名簿の順）。なければ null */
  function freeTie() {
    var ids = S.chars.map(function (c) { return c.id; }), types = ['friend'].concat(HK.TIE_ORDER.filter(function (x) { return x !== 'friend'; }));
    for (var i = 0; i < ids.length; i++) for (var j = i + 1; j < ids.length; j++) for (var k = 0; k < types.length; k++) if (HK.TIES[types[k]] && !hasTie(ids[i], ids[j], types[k])) return { a: ids[i], b: ids[j], type: types[k] };
    return null;
  }
  function charOpts(sel) {
    return S.chars.map(function (c) { return '<option value="' + c.id + '"' + (c.id === sel ? ' selected' : '') + '>' + esc(c.name) + '</option>'; }).join('');
  }
  /* きょうだいの関係の行：二人の続柄（「美咲（姉）→ 健（弟）：兄弟（庇護）」）と注意（年齢が未設定・同じ年齢・庇護の向きと年齢が逆）を添える（sib-word.js） */
  function sibText(t) {
    if (!HK.Sib || !HK.Sib.ui || !HK.tieText || !(HK.Sib.isSibTie(t) || t.type === 'stepsib')) return '';
    var byId = function (id) { return S.chars.filter(function (c) { return c.id === id; })[0] || null; };
    var A = byId(t.a), B = byId(t.b);
    if (!A || !B) return '';
    var tx = HK.tieText(t, function (id) { var c = byId(id); return c ? c.name : ''; }, byId), u = HK.Sib.ui(A, B, t);
    return '<b>' + esc(tx) + '</b>。' + (u && u.notes.length ? esc(u.notes.join('。')) + '。' : '');
  }
  function tiesSection() {
    cleanTies();
    var rows = S.ties.map(function (t, k) {
      var D = HK.TIES[t.type];
      return '<div class="tierow" data-k="' + k + '">' +
        '<select id="ta-' + k + '" data-f="tie" data-k="' + k + '" data-p="a" aria-label="関係の起点">' + charOpts(t.a) + '</select>' +
        '<select id="tt-' + k + '" data-f="tie" data-k="' + k + '" data-p="type" aria-label="関係の種類">' + (HK.tieOptions ? HK.tieOptions(t.type, { dir: true }) : HK.TIE_ORDER.map(function (id) { var d = HK.TIES[id]; return '<option value="' + id + '"' + (id === t.type ? ' selected' : '') + '>' + esc(d.label) + (d.dir ? '（' + d.roleA + '→' + d.roleB + '）' : '') + '</option>'; }).join('')) + '</select>' +
        '<select id="tb-' + k + '" data-f="tie" data-k="' + k + '" data-p="b" aria-label="関係の相手">' + charOpts(t.b) + '</select>' +
        ((D.family && !D.loveOK) || D.loveOpt ? '<select id="tl-' + k + '" data-f="tie" data-k="' + k + '" data-p="love" aria-label="恋愛"><option value=""' + (t.love === 'ok' ? '' : ' selected') + '>' + (D.loveOpt ? '恋愛に発展：しない' : '恋愛：なし') + '</option><option value="ok"' + (t.love === 'ok' ? ' selected' : '') + '>' + (D.loveOpt ? '恋愛に発展：する' : '恋愛：あり') + '</option></select>' : '') +
        (function () { var CO = HK.coldOpts ? HK.coldOpts(t.type) : null; return CO ? '<select id="tc-' + k + '" data-f="tie" data-k="' + k + '" data-p="cold" aria-label="' + CO.aria + '">' + CO.order.map(function (id) { return '<option value="' + id + '"' + ((t.cold || '') === id ? ' selected' : '') + '>' + esc(CO.map[id].label) + '</option>'; }).join('') + '</select>' : ''; })() +
        /* 追加の欄（型・度合い・気持ち・様子。許嫁は二人それぞれの気持ち） */
        /* hide の欄（敵対の度合い「憎悪」）は出さない（保存済みの値は残って効く）。愛憎の欄は、一人目・二人目を名前で出す */
        (HK.tieExtra ? HK.tieExtra(t.type) : []).filter(function (x) { return !x.hide; }).map(function (x) {
          var who = x.who ? S.chars.filter(function (c) { return c.id === (x.who === 'a' ? t.a : t.b); })[0] : null, v = t[x.f] || (t.type === 'fiance' ? 'eager' : '');
          var na = (S.chars.filter(function (c) { return c.id === t.a; })[0] || {}).name, nb = (S.chars.filter(function (c) { return c.id === t.b; })[0] || {}).name;
          return '<select id="tx' + x.f + '-' + k + '" data-f="tie" data-k="' + k + '" data-p="' + x.f + '" aria-label="' + esc(who ? who.name + 'の気持ち' : x.aria) + '">' + x.order.map(function (id) { return '<option value="' + id + '"' + (v === id ? ' selected' : '') + '>' + esc((who ? who.name + 'の気持ち：' : '') + (HK.tieExtraLabel ? HK.tieExtraLabel(x, id, na, nb) : x.map[id].label)) + '</option>'; }).join('') + '</select>';
        }).join('') +
        '<button class="btn ghost small" data-act="tiedel" data-k="' + k + '">削除</button>' +
        '<span class="tiehint">' + sibText(t) + (D.dir ? esc(D.roleA) + 'は左、' + esc(D.roleB) + 'は右。' : '') + esc(D.effect || '') + (t.love === 'ok' && D.family ? '。恋愛：ありにしているので、恋愛に発展することもある（信頼が崩れにくいのは同じ）' : '') + (D.loveOpt ? (t.love === 'ok' ? '。恋愛に発展：するにしているので、想いが恋に変わることもある' : '。恋愛に発展：しないにしているので、想いは恋にならない') : '') + (t.type === 'crush' && t.cold === 'other' ? '。想われる側に恋人や片想いなどの関係を別に登録すると、その人が「好きな人」として扱われる' : '') + '</span></div>';
    }).join('');
    return '<h2 class="sec">住人どうしの既存の関係' + (HK.Tips ? HK.Tips.btn('ties') : '') + '</h2>' +
      '<p class="hint">箱庭に入る前からある関係です。初期の好意や信頼が変わり、行動の傾向にも補正がかかります。各住人の ⚙️ 設定からも編集できます。</p>' +
      '<div class="tiebox"><div class="ties">' + (rows || '<p class="hint" style="margin:0">まだ関係は登録されていません。</p>') + '</div>' +
      '<div class="row" style="margin-top:8px"><button class="btn" data-act="tieadd"' + (S.chars.length < 2 ? ' disabled' : '') + '>関係を1つ追加</button></div>' +
      '<div style="margin-top:12px"><textarea id="tiebulk" rows="3" placeholder="朝霧→鷹野 片想い（脈なし）\n鷹野-白石 親友\n白石とミナトは恋人\n朝霧 鷹野 白石 同僚\n3年A組 同級生"></textarea>' +
      '<div class="row" style="margin-top:6px"><button class="btn" data-act="tieimport">まとめて読み込む</button><span class="fmt">1行に「名前 名前 関係」。3人以上の名前（「名前 名前 名前 チーム」）や、グループ名（「3年A組 同級生」）を書くと、全員の組にまとめて付けます（上司と部下などの向きのある関係は、最初の人→残りの全員）。書き方は見出しの ？ にあります。</span></div>' +
      '<ul class="warn" id="tiewarns" hidden></ul></div></div>';
  }

  /* 「【グループ名】」「# グループ名」「グループ：〇〇」の行から下を、そのグループとして読む */
  var GRP_HEAD = /^\s*(?:【\s*(.+?)\s*】|[#＃]+\s*(.+?)|(?:グループ|group)\s*[:：]\s*(.+?))\s*$/i;
  function parseGrouped(text) {
    var segs = [{ g: '', lines: [] }];
    String(text || '').split(/\r?\n/).forEach(function (ln) {
      var m = ln.match(GRP_HEAD);
      if (m) { var g = (m[1] || m[2] || m[3] || '').trim(); segs.push({ g: g === 'グループなし' ? '' : g.slice(0, 20), lines: [], head: true }); }
      else segs[segs.length - 1].lines.push(ln);
    });
    var out = { chars: [], warnings: [] };
    segs.forEach(function (sg) {
      if (!sg.lines.join('').trim()) return;
      var r = HK.parseRoster(sg.lines.join('\n'));
      r.chars.forEach(function (c) { if (sg.head) c.group = sg.g; out.chars.push(c); });
      out.warnings = out.warnings.concat(r.warnings);
    });
    return out;
  }
  function importRoster(replace) {
    var ta = $('#bulk'), r = parseGrouped(ta.value);
    var w = $('#warns');
    if (!r.chars.length) {
      w.hidden = false;
      w.innerHTML = '<li>読み取れる行がありませんでした。右の書き方を参考にしてください。</li>' + r.warnings.map(function (x) { return '<li>' + esc(x) + '</li>'; }).join('');
      return;
    }
    var list = replace ? [] : S.chars.slice();
    if (S.sample && !replace) list = [];
    var added = 0, updated = 0;
    r.chars.forEach(function (c) {
      var ex = list.filter(function (x) { return x.name === c.name; })[0];
      if (ex) { ex.eg = c.eg; if (c.memo) ex.memo = c.memo; if (c.group != null) ex.group = c.group; updated++; }
      else if (list.length < MAX) { list.push(mk(c)); added++; }
    });
    S.chars = list; S.sample = false; save();
    renderCast();
    var msg = added + '人を追加' + (updated ? '、' + updated + '人を更新' : '') + 'しました';
    var w2 = $('#warns');
    var warns = r.warnings.slice();
    if (r.chars.length > added + updated) warns.push('上限' + MAX + '人を超えた分は読み込んでいません');
    if (warns.length) { w2.hidden = false; w2.innerHTML = warns.map(function (x) { return '<li>' + esc(x) + '</li>'; }).join(''); }
    toast(msg);
  }

  /* ---------- JSONでの書き出し・読み込み ---------- */
  /* only（住人の id の配列）を渡すと、その住人だけを書き出す。
     選ばなかった住人との関係・恋愛相手の固定・呼び方・敬語の相手は、番号ではなく名前で書く（読み込む側で同じ名前の住人につながる） */
  /* St を渡すと、今の名簿ではなくその状態から作る（まるごと読み込みの「足す」。portable.js が normState で整えて渡す）。そのときは高度設定を付けない */
  function rosterJSON(only, St) {
    var R = St || S;
    var idx = {}, name = {}, list = only ? R.chars.filter(function (c) { return only.indexOf(c.id) >= 0; }) : R.chars;
    list.forEach(function (c, i) { idx[c.id] = i; });
    R.chars.forEach(function (c) { name[c.id] = c.name; });
    var ref = function (id) { return idx[id] != null ? idx[id] : only && name[id] ? name[id] : null; };
    var out = {
      format: 'hakoniwa-residents', version: 1, exported: new Date().toISOString(),
      partial: only ? true : undefined,
      chars: list.map(function (c) {
        var o = { name: c.name, code: HK.toCode(c.eg), eg: c.eg, memo: c.memo || '', group: c.group || '', gender: c.gender || '', likes: c.likes || '', tone: c.tone || '', fp: c.fp || '', pos: c.pos || '' };
        if (c.posLike) o.posLike = c.posLike;
        if (c.icon) o.icon = c.icon;
        if (c.color) o.color = c.color;
        if (c.call) o.call = c.call;
        if (c.callG) o.callG = c.callG;
        if (c.bmonth) o.bmonth = +c.bmonth;
        if (c.age) o.age = +c.age;
        if (c.keigoOlder) o.keigoOlder = true;
        if (c.futa) o.futa = true;
        if (c.daku) o.daku = true;
        if (c.faithful) o.faithful = true;
        if (c.noR18) o.noR18 = true;
        if (c.trioHub) o.trioHub = true;
        if (c.posNpc === 'bottom') o.posNpc = 'bottom';
        if (c.alcohol) o.alcohol = +c.alcohol;
        if (c.partWords) o.partWords = c.partWords;
        if (c.partM) o.partM = c.partM;
        if (c.partF) o.partF = c.partF;
        if (c.you) o.you = c.you;
        if (c.marks) o.marks = c.marks;
        if (HK.Attr) HK.Attr.exportTo(o, c, ref);
        if (HK.Shared) HK.Shared.exportTo(o, c);
        if (c.toneCustom) o.toneCustom = c.toneCustom;
        if (c.moanTone) o.moanTone = c.moanTone;
        /* 固定した相手：一人なら番号（以前の形）、二人以上なら番号の並び */
        var lks = idList(c.loveLock).map(ref).filter(function (x) { return x != null; });
        if (lks.length) o.loveLock = lks.length === 1 ? lks[0] : lks;
        /* 性行為の相手の固定：誰とでも可は 'any'、固定した相手は番号（一人なら番号、二人以上なら並び）。「固定した相手＋モブ」は sexLockMob も付ける */
        if (c.sexLock === 'any') o.sexLock = c.sexLock;
        else if (c.sexLock === 'pick' || c.sexLock === 'pickMob') { var sls = idList(c.sexLocks).map(ref).filter(function (x) { return x != null; }); if (sls.length) { o.sexLock = sls.length === 1 ? sls[0] : sls; if (c.sexLock === 'pickMob') o.sexLockMob = true; } }
        if (c.loveNG && c.loveNG.length) { var ng = c.loveNG.map(ref).filter(function (x) { return x != null; }); if (ng.length) o.loveNG = ng; }
        if (c.calls) { var cl = {}; Object.keys(c.calls).forEach(function (id) { if (ref(id) != null && c.calls[id]) cl[ref(id)] = c.calls[id]; }); if (Object.keys(cl).length) o.calls = cl; }
        if (c.keigo) { var kg = Object.keys(c.keigo).filter(function (id) { return ref(id) != null && c.keigo[id]; }).map(ref); if (kg.length) o.keigo = kg; }
        if (R.per && R.per[c.id]) o.per = R.per[c.id];
        return o;
      }),
      ties: (R.ties || []).filter(function (t) { return ref(t.a) != null && ref(t.b) != null && (idx[t.a] != null || idx[t.b] != null); }).map(function (t) { var o = { a: ref(t.a), b: ref(t.b), type: t.type }; if (t.cold) o.cold = t.cold; if (t.love === 'ok') o.love = 'ok'; ['sub', 'grade', 'feel', 'feelB', 'mode', 'lh', 'elder'].forEach(function (f) { if (t[f]) o[f] = t[f]; }); return o; }),
      teacher: R.teacher && idx[R.teacher] != null ? idx[R.teacher] : null,
      /* グループごとの「仲間」（書き出す住人のグループだけ） */
      grpComrade: (function () { var m = {}, any = false; Object.keys(R.grpComrade || {}).forEach(function (g) { if (R.grpComrade[g] && R.chars.some(function (c) { return (only ? idx[c.id] != null : true) && inGrp(c, g); })) { m[g] = 1; any = true; } }); return any ? m : undefined; })(),
      /* 内容のスイッチ（R18版）も一緒に書き出す（全員を書き出すときだけ） */
      ct: !only && !HK.SAFE_ON && R.glob && R.glob.ct && Object.keys(R.glob.ct).length ? R.glob.ct : undefined
    };
    if (!only && !St && HK.Adv) HK.Adv.exportTo(out);
    return out;
  }
  function exportJSON(only) {
    var data = rosterJSON(only), text = JSON.stringify(data, null, 1);
    var d = new Date(), tag = only ? '-part' + data.chars.length : '';
    var name = 'hakoniwa-residents' + tag + '-' + d.getFullYear() + ('0' + (d.getMonth() + 1)).slice(-2) + ('0' + d.getDate()).slice(-2) + '.json';
    try {
      var blob = new Blob([text], { type: 'application/json' }), url = URL.createObjectURL(blob), a = document.createElement('a');
      if (!('download' in a)) throw new Error('nodl');
      a.href = url; a.download = name; document.body.appendChild(a); a.click(); a.remove();
      setTimeout(function () { URL.revokeObjectURL(url); }, 4000);
      toast(data.chars.length + '人分をJSONで書き出しました' + (only ? '（読み込む側で「JSONを読み込む（追加）」を使うと、同じ名前の住人だけが更新されます）' : ''));
    } catch (e) { copy(text, 'ファイルを保存できない環境なので、JSONをクリップボードにコピーしました'); }
  }
  function num(v) { v = parseFloat(v); return isNaN(v) ? null : HK.clamp(v, 0, 20); }
  function importJSON(text, replace) {
    var data;
    try { data = JSON.parse(text); } catch (e) { toast('JSONとして読めませんでした'); return; }
    var arr = Array.isArray(data) ? data : data && Array.isArray(data.chars) ? data.chars : null;
    if (!arr || !arr.length) { toast('住人のデータが見つかりませんでした'); return; }
    var list = replace || S.sample ? [] : S.chars.slice();
    var map = [], added = 0, updated = 0, skipped = 0, per0 = S.per;
    if (replace || S.sample) S.per = {};
    arr.forEach(function (o, i) {
      if (typeof o === 'string') { var pr = HK.parseRoster ? HK.parseRoster(o) : null; o = pr && pr.chars[0] ? { name: pr.chars[0].name, eg: pr.chars[0].eg, memo: pr.chars[0].memo } : null; }
      if (!o || typeof o !== 'object') { map[i] = null; skipped++; return; }
      try {
      var name = String(o.name || '').trim().slice(0, 24) || ('キャラ' + (i + 1));
      var eg = null;
      if (o.eg && typeof o.eg === 'object') { eg = {}; HK.FACTORS.forEach(function (k) { var v = num(o.eg[k]); eg[k] = v == null ? 10 : v; }); }
      else if (HK.isCode && HK.isCode(o.code || '')) eg = HK.fromCode(String(o.code).trim());
      if (!eg) { map[i] = null; skipped++; return; }
      var c = list.filter(function (x) { return x.name === name; })[0];
      if (c) { c.eg = eg; updated++; }
      else { if (list.length >= MAX) { map[i] = null; skipped++; return; } c = mk({ name: name, eg: eg }); list.push(c); added++; }
      c.memo = String(o.memo || c.memo || '').slice(0, 80);
      if (o.group != null) c.group = String(o.group).trim().slice(0, 40);
      if (['', 'm', 'f', 'x'].indexOf(o.gender || '') >= 0) c.gender = o.gender || '';
      if (['', 'm', 'f', 'both', 'none'].indexOf(o.likes || '') >= 0) c.likes = o.likes || '';
      if (['', 'top', 'bottom', 'riba'].indexOf(o.pos || '') >= 0) c.pos = o.pos || '';
      if (['', 'tb', 'tr', 'br', 'any'].indexOf(o.posLike || '') >= 0) c.posLike = o.posLike || '';
      if (o.tone == null || o.tone === '' || (HK.toneValid ? HK.toneValid(o.tone) : HK.PERSONA[o.tone])) c.tone = o.tone || '';
      if (typeof o.color === 'string' && /^#[0-9a-fA-F]{6}$/.test(o.color)) c.color = o.color;
      if (typeof o.call === 'string') c.call = o.call;
      if (o.callG && typeof o.callG === 'object') c.callG = o.callG;
      if (o.bmonth != null) c.bmonth = o.bmonth;
      if (o.age != null) c.age = o.age;
      if (o.keigoOlder) c.keigoOlder = true;
      if (o.futa) c.futa = true;
      if (o.daku) c.daku = true;
      if (o.faithful) c.faithful = true;
      if (o.noR18) c.noR18 = true;
      if (o.trioHub) c.trioHub = true;
      if (o.posNpc === 'bottom') c.posNpc = 'bottom';
      if (HK.ALC_OK(o.alcohol)) c.alcohol = String(o.alcohol);
      if (o.partWords) c.partWords = o.partWords;
      if (o.partM != null) c.partM = String(o.partM);
      if (o.partF != null) c.partF = String(o.partF);
      if (o.you != null) c.you = String(o.you).trim().slice(0, 8);
      if (o.marks != null) c.marks = String(o.marks).trim().slice(0, 30);
      if (HK.Attr) HK.Attr.importFrom(c, o);
      if (HK.Shared) HK.Shared.importFrom(c, o);
      if (o.toneCustom != null) c.toneCustom = (HK.normToneCustom ? HK.normToneCustom(String(o.toneCustom).slice(0, 120)) : '');
      if (o.moanTone != null) c.moanTone = okTone(o.moanTone) ? String(o.moanTone || '') : '';
      c._lk = o.loveLock; c._sl = o.sexLock; c._slm = !!o.sexLockMob; c._cl = o.calls; c._kg = o.keigo; c._ng = o.loveNG;
      if (o.fp != null) c.fp = String(o.fp).trim().slice(0, 8);
      if (typeof o.icon === 'string' && /^data:image\/(png|jpeg|webp|gif);base64,/.test(o.icon) && o.icon.length < 400000) c.icon = o.icon;
      if (o.per && typeof o.per === 'object') { S.per = S.per || {}; S.per[c.id] = JSON.parse(JSON.stringify(o.per)); migVamp(c, S.per[c.id]); }
      normChar(c);
      /* 古いJSON：箱庭ごとに入っていた共通の能力値・欄を住人へ */
      if (HK.Shared && S.per && S.per[c.id]) HK.Shared.migrate(c, S.per[c.id]);
      map[i] = c.id;
      } catch (err) { map[i] = null; skipped++; if (window.console) console.warn("JSON import skip", i, err); }
    });
    /* 一人も読めなかったら何も変えない（置き換えで、今の住人を空にして保存してしまわないように） */
    if (!added && !updated) { S.per = per0; toast('読み込める住人が見つかりませんでした（名前とエゴグラムの値かコードが必要です）。今の住人はそのままです'); return; }
    S.chars = list; S.sample = false;
    if (replace) { S.ties = []; S.join = {}; S.teacher = ''; }
    var tn = 0;
    function ref(v) {
      if (typeof v === 'number' || /^\d+$/.test(String(v))) return map[+v];
      var hit = list.filter(function (x) { return x.name === v; })[0];
      return hit ? hit.id : null;
    }
    (Array.isArray(data.ties) ? data.ties : []).forEach(function (t) {
      if (!t || typeof t !== 'object') return;
      var a = ref(t.a), b = ref(t.b);
      if (!a || !b || a === b || typeof t.type !== 'string' || !Object.prototype.hasOwnProperty.call(HK.TIES, t.type)) return;
      S.ties = (S.ties || []).filter(function (x) { return !(x.type === t.type && ((x.a === a && x.b === b) || (x.a === b && x.b === a))); });
      var CO2 = HK.coldOpts ? HK.coldOpts(t.type) : null;
      var nt0 = t.cold && CO2 && CO2.map[t.cold] ? { a: a, b: b, type: t.type, cold: t.cold } : { a: a, b: b, type: t.type };
      if (t.love === 'ok' && (HK.TIES[t.type].family || HK.TIES[t.type].loveOpt)) nt0.love = 'ok';
      /* 追加の欄（型・度合い・気持ち・様子・愛憎）。古い JSON にはないので、ないときは今までどおり */
      ['sub', 'grade', 'feel', 'feelB', 'mode', 'lh', 'elder'].forEach(function (f) { if (typeof t[f] === 'string' && t[f]) nt0[f] = t[f]; });
      if (HK.tieExtraNorm) HK.tieExtraNorm(nt0);
      if (HK.tieHidden && HK.tieHidden(nt0.type)) return;
      S.ties.push(nt0); tn++;
    });
    /* グループごとの「仲間」（古い JSON にはない） */
    if (replace) S.grpComrade = {};
    if (data.grpComrade && typeof data.grpComrade === 'object' && !Array.isArray(data.grpComrade)) { S.grpComrade = S.grpComrade || {}; Object.keys(data.grpComrade).forEach(function (g) { if (data.grpComrade[g] && String(g).trim()) S.grpComrade[String(g).trim().slice(0, 40)] = 1; }); }
    if (data.teacher != null && map[data.teacher]) S.teacher = map[data.teacher];
    if (HK.Adv) HK.Adv.importFrom(data);
    if (data.ct && typeof data.ct === 'object' && !HK.SAFE_ON && HK.Content) { S.glob = S.glob || {}; S.glob.ct = {}; HK.Content.TAGS.forEach(function (t) { if (data.ct[t.id]) S.glob.ct[t.id] = 1; }); }
    /* 恋愛相手の固定と呼び方は、全員を読み込んでから番号を住人に戻す */
    list.forEach(function (c) {
      if (Array.isArray(c._ng)) c.loveNG = c._ng.map(function (k) { return typeof k === 'number' || /^\d+$/.test(String(k)) ? map[+k] : (list.filter(function (x) { return x.name === k; })[0] || {}).id; }).filter(Boolean);
      delete c._ng;
      if (HK.Attr) HK.Attr.importRefs(c, ref);
      /* 固定した相手：番号・名前・その並び、のどれでも */
      var toIds = function (v) { return idList((Array.isArray(v) ? v : [v]).map(function (k) { return typeof k === 'number' || /^\d+$/.test(String(k)) ? map[+k] : (list.filter(function (x) { return x.name === k; })[0] || {}).id; })); };
      if (c._lk != null) { c.loveLock = toIds(c._lk); delete c._lk; }
      /* 性行為の相手の固定：古い 'lover'・'loverOnly' は、恋愛相手の固定を戻したあとで migSexLock で読み替える（保存の読み込みと同じ） */
      if (c._sl === 'any') { c.sexLock = c._sl; c.sexLocks = []; }
      else if (c._sl === 'lover' || c._sl === 'loverOnly') { c.sexLock = c._sl; c.sexLocks = []; migSexLock(c); }
      else if (c._sl != null && c._sl !== '') { c.sexLocks = toIds(c._sl); c.sexLock = c.sexLocks.length ? (c._slm ? 'pickMob' : 'pick') : ''; }
      delete c._sl; delete c._slm;
      if (c._cl && typeof c._cl === 'object') { c.calls = c.calls || {}; Object.keys(c._cl).forEach(function (k) { var id = /^\d+$/.test(k) ? map[+k] : (list.filter(function (x) { return x.name === k; })[0] || {}).id; if (id) c.calls[id] = String(c._cl[k]).slice(0, 16); }); }
      delete c._cl;
      /* 敬語で話す相手：番号（または名前）の並び */
      if (Array.isArray(c._kg)) { c.keigo = c.keigo || {}; c._kg.forEach(function (k) { var id = typeof k === 'number' || /^\d+$/.test(String(k)) ? map[+k] : (list.filter(function (x) { return x.name === k; })[0] || {}).id; if (id) c.keigo[id] = 1; }); }
      delete c._kg;
    });
    normRefs(S);
    cleanTies();
    var ok = save() !== false;
    renderCast();
    var parts = []; if (added) parts.push(added + '人を追加'); if (updated) parts.push(updated + '人を更新'); if (tn) parts.push('関係' + tn + '件を復元');
    toast('JSONから' + (parts.join('・') || '0人を読み込み') + 'しました' + (skipped ? '（' + skipped + '件は読めないか上限超えのため省略）' : '') + (ok ? '' : '。ブラウザに保存しきれませんでした'));
  }
  var jsonMode = 'add';
  /* 一部の住人だけ書き出す：チェックした住人（id → true）。画面を描き直しても選択は残す */
  var jpOpen = false, jpSel = {};
  function pickPanel() {
    if (!jpOpen) return '';
    var ids = S.chars.map(function (c) { return c.id; });
    Object.keys(jpSel).forEach(function (id) { if (ids.indexOf(id) < 0) delete jpSel[id]; });
    var n = Object.keys(jpSel).length, gs = groupsOf();
    return '<div class="jpick" id="jpick" style="margin-top:8px;padding:10px;border:1px solid var(--line);border-radius:var(--r);background:var(--surface)">' +
      '<p class="hint" style="margin:0 0 6px">書き出す住人にチェックを入れてください。受け取った人が「JSONを読み込む（追加）」で読み込むと、同じ名前の住人だけが更新され、ほかの住人はそのまま残ります。選ばなかった住人との関係も、名前でつながります。</p>' +
      '<div class="row" style="margin:0 0 6px;flex-wrap:wrap;gap:6px"><button class="btn small" data-act="jpall">全員</button><button class="btn small" data-act="jpnone">選択を外す</button>' +
      gs.map(function (g) { return '<button class="chip" data-act="jpgrp" data-g="' + esc(g) + '">【' + esc(g) + '】</button>'; }).join('') + '</div>' +
      '<div style="display:flex;flex-wrap:wrap;gap:4px 14px">' + S.chars.map(function (c) {
        return '<label style="white-space:nowrap"><input type="checkbox" data-jp="' + c.id + '"' + (jpSel[c.id] ? ' checked' : '') + '> ' + esc(c.name) + (c.group ? '<span class="hint" style="margin:0">（' + esc(grpList(c).join('・')) + '）</span>' : '') + '</label>';
      }).join('') + '</div>' +
      '<div class="row" style="margin-top:8px"><button class="btn primary" data-act="jpout" id="jpout"' + (n ? '' : ' disabled') + '>選んだ<span id="jpn">' + n + '</span>人をJSONで書き出す</button></div></div>';
  }
  function jpSync() {
    var n = Object.keys(jpSel).length, b = $('#jpout'), c = $('#jpn');
    if (c) c.textContent = n;
    if (b) b.disabled = !n;
    Array.prototype.forEach.call(document.querySelectorAll('#jpick input[data-jp]'), function (x) { x.checked = !!jpSel[x.dataset.jp]; });
  }

  /* ---------- 箱庭 ---------- */
  function envVal(e, scenId) {
    var src = HK.GLOBAL_ENV.indexOf(e) >= 0 ? S.glob : (S.env[scenId] = S.env[scenId] || {});
    /* R18の描写の設定をそろえる前に選んでいた値を、新しい設定に読み替える（lewd-unify.js） */
    if (src !== S.glob && HK.Lewd) HK.Lewd.norm(scenId, src);
    return src[e.id] == null ? e.def : src[e.id];
  }
  /* 内容のスイッチ：全箱庭で共通の入れ切り（S.glob.ct）。R18版だけ */
  var CT_MORE = '';
  /* r18:begin */
  CT_MORE = '展開の重さを「重い」にすると、妊娠・暴力・DVの場面が、合コン・出られない部屋・オメガバース・催眠などふつうの箱庭でも起きます（起きやすい関係・気質は、環境値のTIPSの「内容のスイッチ」に）。';
  /* r18:end */
  function ctOn() { var m = (S.glob && S.glob.ct) || {}; return (HK.Content ? HK.Content.TAGS : []).filter(function (t) { return m[t.id]; }).map(function (t) { return t.id; }); }
  function contentBox() {
    if (!HK.Content || HK.SAFE_ON) return '';
    var m = (S.glob && S.glob.ct) || {};
    return '<div class="envitem wide"><div class="lab"><span>内容のスイッチ（全箱庭で共通・初期はすべて切）</span></div><div class="ctbox">' +
      HK.Content.TAGS.map(function (t) { return '<label title="' + esc(t.desc) + '"><input type="checkbox" data-f="ct" data-k="' + t.id + '"' + (m[t.id] ? ' checked' : '') + '> ' + esc(t.label) + '</label>'; }).join('') +
      '</div><div class="desc">入れたものだけが起きます。切のときは、その場面を起こさないか、やわらかい分岐に替えます。エロトラップダンジョンなどR18が中心の箱庭では「合意のない展開」は常に入です。' + CT_MORE + '</div></div>';
  }
  function envItem(e, scenId) {
    var v = envVal(e, scenId), g = HK.GLOBAL_ENV.indexOf(e) >= 0 ? '1' : '0';
    if (e.type === 'text') {
      return '<div class="envitem wide"><div class="lab"><label for="env-' + e.id + '">' + esc(e.label) + '</label></div><input type="text" id="env-' + e.id + '" data-f="env" data-g="' + g + '" data-k="' + e.id + '" value="' + esc(v) + '" placeholder="' + esc(e.placeholder || '') + '" maxlength="60" style="width:100%;margin-top:4px">' +
        (e.desc ? '<div class="desc">' + esc(e.desc) + '</div>' : '') + '</div>';
    }
    if (e.type === 'select') {
      return '<div class="envitem"><div class="lab"><span>' + esc(e.label) + '</span></div><select id="env-' + e.id + '" data-f="env" data-g="' + g + '" data-k="' + e.id + '">' +
        e.options.map(function (o) { return '<option value="' + esc(o.v) + '"' + (o.v === v ? ' selected' : '') + '>' + esc(o.label) + '</option>'; }).join('') + '</select>' +
        (e.desc ? '<div class="desc">' + esc(e.desc) + '</div>' : '') + '</div>';
    }
    return '<div class="envitem"><div class="lab"><label for="env-' + e.id + '">' + esc(e.label) + '</label><span class="num" id="ev-' + e.id + '">' + v + (e.unit || '') + '</span></div>' +
      '<input type="range" id="env-' + e.id + '" min="' + e.min + '" max="' + e.max + '" step="1" value="' + v + '" data-f="env" data-g="' + g + '" data-k="' + e.id + '" data-unit="' + (e.unit || '') + '">' +
      '<div class="ends"><span>' + esc(e.lo || '') + '</span><span>' + esc(e.hi || '') + '</span></div>' +
      (e.desc ? '<div class="desc">' + esc(e.desc) + '</div>' : '') + '</div>';
  }
  function per(c, scenId) {
    S.per[c.id] = S.per[c.id] || {};
    var pp = (S.per[c.id][scenId] = S.per[c.id][scenId] || { action: 'auto', goal: 'auto', stats: {}, weapon: 'random' });
    /* 手で直したJSONなどで欠けた欄を補う */
    if (!pp.stats || typeof pp.stats !== 'object') pp.stats = {};
    if (!pp.action) pp.action = 'auto'; if (!pp.goal) pp.goal = 'auto'; if (!pp.weapon) pp.weapon = 'random';
    /* 箱庭をまたいで共通の能力値・欄は、住人の値（c.ab・お酒）をこの箱庭の保存に写す */
    if (HK.Shared) HK.Shared.apply(c, scenId, pp);
    return pp;
  }

  /* R18版で、設定や展開しだいで R18 の描写が入る箱庭の説明（常に R18 の箱庭はキャッチコピーの R18 で示す） */
  /* 人数・R18 を外すと何も残らないキャッチコピーの代わり */
  var KICK_GENRE = { dungeon: '罠・探索', massage: 'あやしい施術', hole: '壁の穴・放置', kaihen: '日常のずれ', succubus: '夜の街・比べられる', saimin: 'いたずら', variety: 'テレビ番組・対決', locker: '密室' };
  KICK_GENRE.futari = '同居・デート';
  /* 一覧カードの概要（どの箱庭も60字前後にそろえる）。元の詳しい説明はカードの title（マウスを乗せると出る）に */
  var CARD_DESC = {
    goukon: '居酒屋の個室で一晩の合コン。酒が回るほど本音と衝動があふれ出す。最後に誰と誰が一緒に帰ったかで決着がつく。',
    whiteroom: '目覚めると白い部屋。扉の紙には脱出条件。条件は自由に組み立てられる（例：媚薬を10本飲み切って、エッチしないと出られない部屋）。',
    futari: '二人（か三人）の毎日を、朝・昼・夕方・夜ごとに眺める。同居・別々に住んでデート・シェアハウス。出会いから恋人、同棲、指輪の約束まで。',
    classroom: '同じクラスで過ごす一年間。テスト、体育祭、文化祭、修学旅行。行事のたびに、恋も友情も対立も少しずつ動いていく。',
    island: '漂着した無人島で救助を待つ日々。食料が尽きれば体力が削れ、疲れと飢えで人間関係も削れていく。誰が最後まで残るか。',
    br: '首輪をつけられ、ランダムな武器を一つ渡される。最後に生き残った一人だけが帰れる。信じるか、裏切るか、隠れ続けるか。',
    trial: 'ホテルに閉じ込められ「殺せば生きて帰れる」と告げられる。殺人が起きれば裁判。犯人を当てれば処刑、外せば犯人以外が全滅。',
    zombie: 'ゾンビのはびこる街で7日間を生き延びる。9つのエリアで食料を奪い合い、噂に惑わされ、咬まれればいつかは向こう側へ。',
    jashin: '地図にない山奥の村には、得体の知れない神が祀られている。祭りの夜までに神の正体と対抗策を突き止め、村から脱出せよ。',
    yakata: '吹雪の山で辿り着いた、地図にない館。橋は落ち、最初の死体が見つかる。探偵は推理で追い、犯人は痕跡を消して逃げ切る。',
    omega: 'α・β・Ωの第二性がある世界。発情期や運命の番、職業の事情に揺れながら、関係の結末（全37通り）が決まるまで見守る。',
    /* r18:begin */
    dungeon: '一人〜四人で淫らな罠の迷宮に挑む。堕ち度が満ちた人から快楽に堕ちていき、全員が堕ちる前に最深部の主を倒せば踏破。',
    /* r18:end */
    massage: ['評判のマッサージ店。施術は少しずつあやしくなっていく。いつ気づくか、言い訳に騙されるか、そのまま流されてしまうか。', '評判のマッサージ店。施術は少しずつ際どくなっていく。いつ気づくか、言い訳に騙されるか、それとも快楽に負けるか。'],
    /* r18:begin */
    hole: '壁の穴に下半身がはまり、向こう側の感覚は遮断されている。そこで何をされても分からない――穴から解放されるまでは。',
    kaihen: 'エロいことが当たり前の仕事になった世界。クリニックやホテルで、理性的な人ほど真面目に「施す側」として働いてしまう。',
    succubus: '住人がサキュバスになって一晩、街で精を集める。誰をどう誘惑し、一晩で何ml集められるか。先輩サキュバスの助言つき。',
    /* r18:end */
    saimin: ['同僚・恋人・友人・ストーカーの誰かに催眠をかけられる。どんな暗示に弱いのか。終わったあと、怒るのか、癖になるのか。', '同僚・恋人・友人・ストーカーの誰かに催眠をかけられる。どこまでしてしまうのか。終わったあと、怒るのか、堕ちるのか。'],
    /* r18:begin */
    variety: '深夜のお色気バラエティに出演し、約60の企画からランダムに選ばれる対決で得点を競う。ハプニングに罰ゲーム、恋の芽生えも。',
    /* r18:end */
    locker: ['媚薬の充満する狭いロッカーに閉じ込められた二人。仕掛けを解いて脱出できるか。扉が開いたあと、二人の関係はどう変わる？', '媚薬の充満する狭いロッカーに閉じ込められた二人。仕掛けを解いて脱出できるか。先に手を出すのは誰か、出たあと続きをするか。'],
    rpg: 'パーティを組んでダンジョンへ。階ごとに戦闘・宝箱・罠・商人・泉が待つ。誰が前に出て、どこで引き返し、いくら持ち帰れるか。',
    jinro: '住人どうしで人狼ゲーム。人狼は性格で騙りや潜伏を選び、村は仕切り役しだいで方針が変わる。信頼と協力、そして裏切り。'
  };
  /* 注意書きはカードでは短く（全文は title に）。R18版はどの箱庭にも「※成人として扱います」を付ける（全年齢版は付けない） */
  var ADULT_NOTE = '※成人として扱います';
  function cardNote(n) {
    var m = n && n.match(/※([^。]*?)(?:の描写|表現)/), head = '';
    if (n && /パロディ/.test(n)) head = '※' + (n.match(/『[^』]+』/) || ['パロディ'])[0].replace(/^(?!『)/, '') + (/『/.test(n) ? 'のパロディ' : '');
    else if (m) head = '※' + m[1].replace(/（[^）]*）/, '') + 'の描写あり';
    if (HK.SAFE_ON) return head;
    return (head ? head + '　' : '') + (n && /未成年/.test(n) ? '※未成年の職業を選んだ人以外は成人として扱います' : ADULT_NOTE);
  }
  var R18_PLOT = { goukon: 'お持ち帰りの夜', whiteroom: '条件がエッチ・媚薬などのとき' };
  R18_PLOT.futari = '恋人どうしの夜';
  function scenR18(s, id) {
    var env = (s.env || []).filter(function (e) { return /R-?18/.test(e.label || ''); }).map(function (e) { return '「' + e.label.replace(/（R-?18）/, '') + '」'; });
    if (env.length) return '設定' + env[0] + (env.length > 1 ? 'など' : '') + 'で描写あり';
    return R18_PLOT[id] ? R18_PLOT[id] + 'に描写あり' : '';
  }
  function renderBox() {
    var scen = HK.SCENARIOS[S.scenId];
    /* 同じ箱庭が二重に登録されても、一覧には一度だけ出す */
    HK.SCEN_ORDER = HK.SCEN_ORDER.filter(function (x, i, arr) { return arr.indexOf(x) === i && HK.SCENARIOS[x]; });
    /* 並び：成人向け（R18版）では、ダンジョンRPGと人狼をゾンビの街のすぐ後ろに置く */
    var order = HK.SCEN_ORDER.slice();
    if (!HK.SAFE_ON && order.indexOf('zombie') >= 0) {
      var mv = ['rpg', 'jinro'].filter(function (x) { return order.indexOf(x) >= 0; });
      order = order.filter(function (x) { return mv.indexOf(x) < 0; });
      order.splice.apply(order, [order.indexOf('zombie') + 1, 0].concat(mv));
    }
    var cards = order.map(function (id) {
      var s = HK.SCENARIOS[id];
      /* 成人向けの箱庭は、ピンクのボックスと赤いR18タグでひと目で分かるようにする */
      var adult = !HK.SAFE_ON && /R-?18/.test(s.kicker || '');
      /* キャッチコピーに手書きで混ざった人数・R18 は外し、人数とR18の有無は下の一行にそろえて出す */
      var kt = String(s.kicker || '').replace(/（\d+(?:〜\d+)?人）/, '').replace(/^\d+(?:〜\d+)?人・/, '').replace(/・?R-?18/, '').replace(/^ソロ(?:（[^）]*）)?・?/, '').replace(/^・|・$/g, '');
      if (!kt) kt = KICK_GENRE[id] || '';
      var kick = esc(kt) + (adult ? '<span class="r18tag">R18</span>' : '');
      var lo = smin(id), hi = smax(id), meta = '参加 ' + (lo === hi ? lo + '人' : lo + '〜' + hi + '人');
      var r18s = !HK.SAFE_ON && !adult ? scenR18(s, id) : '';
      if (r18s) meta += '<span class="r18part"><span class="r18tag">R18</span>' + esc(r18s) + '</span>';
      var cd = CARD_DESC[id], snote = HK.SAFE_ON ? String(s.note || '').replace(/[^。]*成人として扱[^。]*。?/g, '').replace(/^※\s*$/, '').trim() : s.note, full = s.desc + (snote ? '\n' + snote : '') + (HK.SAFE_ON || /成人として扱/.test(s.note || '') ? '' : '\n※登場人物はすべて成人として扱います。');
      cd = Array.isArray(cd) ? cd[HK.SAFE_ON ? 0 : 1] : cd || s.desc;
      return '<label class="scen' + (adult ? ' adult' : '') + (id === S.scenId ? ' on' : '') + '" title="' + esc(full) + '"><input type="radio" name="scen" id="sc-' + id + '" value="' + id + '" data-f="scen"' + (id === S.scenId ? ' checked' : '') + '>' +
        '<div class="k">' + kick + '</div><div class="n">' + esc(s.name) + '</div><div class="m">' + meta + '</div>' + (HK.ScenTags ? HK.ScenTags.html(id, esc) : '') + '<div class="d">' + esc(cd) + '</div><div class="note">' + esc(cardNote(s.note)) + '</div>' + (HK.Tips ? HK.Tips.scenBtn(id) : '') + '</label>';
    }).join('');
    /* 全年齢版：R-18版の販売ページへの欄（URLは js/share-card.js の CONF.r18Url＝BOOTH・CONF.noteUrl＝note） */
    if (HK.SAFE_ON && HK.CONF && HK.CONF.r18Url) cards += '<div class="scen r18link">' +
      '<div class="k">BOOTH・noteで頒布中・18歳以上向け</div><div class="n">R-18版</div><div class="d">エロトラップダンジョン・感覚遮断穴・常識改変・サキュバスの一夜・エロバラエティ番組を追加。夜の場面もぼかさずに描きます。</div>' +
      '<div class="r18buy"><a href="' + esc(HK.CONF.r18Url) + '" target="_blank" rel="noopener">BOOTHで買う ↗</a>' + (HK.CONF.noteUrl ? '<a href="' + esc(HK.CONF.noteUrl) + '" target="_blank" rel="noopener">noteで買う ↗</a>' : '') + '</div></div>';
    var derived = (scen.derived || []).map(function (k) { return '<span class="chip" title="' + esc(HK.TRAIT_SRC[k]) + '">' + esc(HK.TRAIT_NAME[k]) + '<span class="nums">' + esc(HK.TRAIT_SRC[k]) + '</span></span>'; }).join('');
    var extra = (scen.stats || []).map(function (s) { return '<span class="chip" title="' + esc(s.desc) + '">' + esc(s.label) + '</span>'; }).join('') + (scen.weapons ? '<span class="chip">支給武器</span>' : '');
    var sexCols = S.scenId === 'goukon' || S.scenId === 'omega';
    var pfs = scen.perFields || [];
    /* 最初の行動・短期目標：選べるものがない箱庭（物語型の宇宙船漂流記・吹雪の館など）では、見出しと列を出さない */
    var hasAct = !!(scen.actions && scen.actions.length), hasGoal = !!(scen.goals && scen.goals.length);
    /* 箱庭をまたいで共通の能力値・欄（shared-stats.js）は、見出しに ＊ を付けて説明を添える */
    var shn = function (id, pick) { return HK.Shared ? HK.Shared.headNote(S.scenId, id, pick) : ''; };
    var statHead = (scen.stats || []).map(function (s) { var n = shn(s.id, false); return '<th title="' + esc(s.desc + (n ? ' ' + n : '')) + '">' + esc(s.label) + (n ? '<span class="shmark" aria-label="共通の値">＊</span>' : '') + '</th>'; }).join('') + (scen.weapons ? '<th>武器</th>' : '') + pfs.map(function (f) { var n = shn(f.id, true); return '<th' + (n ? ' title="' + esc(n) + '"' : '') + '>' + esc(f.label) + (n ? '<span class="shmark" aria-label="共通の値">＊</span>' : '') + '</th>'; }).join('') + (sexCols ? '<th>性別</th><th>恋愛対象</th>' : '');
    var J = joined(S.scenId), jmax = smax(S.scenId);
    var rows = S.chars.map(function (c, i) {
      var on = J.indexOf(c) >= 0;
      var p = per(c, S.scenId);
      var sel = function (f, list) {
        return '<select id="pc-' + c.id + '-' + f + '" data-f="per" data-id="' + c.id + '" data-k="' + f + '" aria-label="' + esc(c.name) + 'の' + (f === 'action' ? '最初の行動' : '短期目標') + '"><option value="auto">おまかせ（気質から）</option>' +
          list.map(function (o) { return '<option value="' + o.id + '"' + (p[f] === o.id ? ' selected' : '') + '>' + esc(o.label) + '</option>'; }).join('') + '</select>';
      };
      var st = (scen.stats || []).map(function (s) {
        var v = p.stats[s.id] == null ? 'random' : String(p.stats[s.id]);
        return '<td><select id="ps-' + c.id + '-' + s.id + '" data-f="stat" data-id="' + c.id + '" data-k="' + s.id + '" aria-label="' + esc(c.name) + 'の' + esc(s.label) + '"><option value="random"' + (v === 'random' ? ' selected' : '') + '>ランダム</option>' +
          [1, 2, 3, 4, 5].map(function (n) { return '<option value="' + n + '"' + (v === String(n) ? ' selected' : '') + '>' + n + '</option>'; }).join('') + '</select></td>';
      }).join('');
      var wp = scen.weapons ? '<td><select id="pw-' + c.id + '" data-f="weapon" data-id="' + c.id + '" aria-label="' + esc(c.name) + 'の武器"><option value="random">ランダム支給</option>' +
        HK.WEAPONS.map(function (w) { return '<option value="' + w.id + '"' + (p.weapon === w.id ? ' selected' : '') + '>' + esc(w.name) + '</option>'; }).join('') + '</select></td>' : '';
      return '<tr' + (on ? '' : ' class="off"') + '><td><input type="checkbox" id="jn-' + c.id + '" data-f="join" data-id="' + c.id + '"' + (on ? ' checked' : '') + ' aria-label="' + esc(c.name) + 'を参加させる"></td><td><span class="row" style="flex-wrap:nowrap"><span class="dot" style="background:var(--p' + i + ')"></span><b>' + esc(c.name) + '</b>' + (c.group ? '<span class="grptag">' + esc(grpList(c).join('・')) + '</span>' : '') + '</span></td>' + (hasAct ? '<td>' + sel('action', scen.actions) + '</td>' : '') + (hasGoal ? '<td>' + sel('goal', scen.goals) + '</td>' : '') + st + wp + pfs.map(function (f) {
        /* ほかの欄の選び方でこの欄が意味を持たないとき（サキュバスの標的・遮断穴の主催者など）は、理由を出して選べなくする（perField.offWhen） */
        var offTx = f.offWhen ? f.offWhen(p.pick || {}) : '';
        if (offTx) return '<td><select id="pf-' + c.id + '-' + f.id + '" disabled title="' + esc(offTx) + '" aria-label="' + esc(c.name) + 'の' + esc(f.label) + '"><option>' + esc(offTx) + '</option></select></td>';
        if (f.type === 'text') {
          var tv = (p.pick || {})[f.id] || '', ph = f.placeholder ? f.placeholder(c) : '';
          return '<td><input type="text" id="pf-' + c.id + '-' + f.id + '" data-f="pf" data-id="' + c.id + '" data-k="' + f.id + '" value="' + esc(tv) + '" placeholder="' + esc(ph) + '" maxlength="40" style="min-width:14em" aria-label="' + esc(c.name) + 'の' + esc(f.label) + '"></td>';
        }
        var v = (p.pick || {})[f.id] || 'auto', opts = '', grp = null;
        f.options.forEach(function (o) {
          if (f.groups && o.group !== grp) { opts += (grp ? '</optgroup>' : '') + '<optgroup label="' + esc(o.group) + '">'; grp = o.group; }
          opts += '<option value="' + o.id + '"' + (v === o.id ? ' selected' : '') + '>' + esc(o.label) + '</option>';
        });
        if (grp) opts += '</optgroup>';
        return '<td><select id="pf-' + c.id + '-' + f.id + '" data-f="pf" data-id="' + c.id + '" data-k="' + f.id + '" aria-label="' + esc(c.name) + 'の' + esc(f.label) + '"><option value="auto">' + esc(f.auto || 'おまかせ') + '</option>' + opts + '</select></td>';
      }).join('') + (sexCols ? '<td>' + gsel(c, 'gender', GENDERS, 'bg') + '</td><td>' + gsel(c, 'likes', LIKES, 'bl') + '</td>' : '') + '</tr>';
    }).join('');

    var html =
      '<h2 class="sec">箱庭を選ぶ</h2><div class="scens">' + cards + '</div>' +
      '<h2 class="sec">環境値' + (HK.Tips ? HK.Tips.btn('env') : '') + ' <span class="envbtns"><button type="button" class="mini" data-act="envreset" title="この箱庭の環境値を初期値に戻す">初期値に戻す</button><button type="button" class="mini" data-act="envrand" title="環境値をランダムに決める（文字の項目はそのまま）">ランダム</button></span></h2><div class="panel">' + (S.scenId === 'whiteroom' ? '<p class="roomlabel" id="roomlabel">「' + esc(HK.roomLabel(envNow())) + '」</p>' : '') + '<div class="envgrid">' + genv(scen).map(function (e) { return envItem(e, S.scenId); }).join('') + contentBox() + '</div></div>' +
      (HK.Adv ? HK.Adv.html() : '') +
      '<h2 class="sec">この箱庭で効くもの' + (HK.Tips ? HK.Tips.btn('uses') : '') + '</h2>' +
      '<div class="uses">' + derived + '</div><div class="uses" style="margin-top:6px">' + extra + '</div>' +
      '<h2 class="sec">' + (!hasAct && !hasGoal ? (scen.solo ? '挑戦者の設定' : '住人ごとの設定') : scen.solo ? '挑戦者と方針' : '住人ごとの初動と目標') + (HK.Tips ? HK.Tips.btn('perchar') : '') + '</h2>' +
      (scen.castHint || scen.solo ? '<p class="hint">' + (scen.castHint ? esc(scen.castHint) : 'この箱庭は一人用です。チェックを入れた住人が挑みます。' + (HK.SAFE_ON ? '' : '登場人物はすべて成人として扱います。')) + '</p>' : '') +
      (S.chars.length ? '<p class="hint" id="joincount">参加 <b class="num">' + J.length + '</b> / 上限 ' + jmax + '人' + (S.chars.length > jmax ? '　この箱庭は' + jmax + '人までです。チェックで参加者を選んでください。' : '') + '</p>' + loveCrowdNote(S.scenId) + '<div class="row" style="margin-bottom:8px"><button class="btn small" data-act="joinall">全員を参加</button><button class="btn small" data-act="joinnone">全員を外す</button>' + (groupsOf().length ? '<button class="btn small ghost" data-act="sortgrp">グループ順に並べる</button>' : '') + '</div>' + randRow(jmax) + (groupsOf().length ? '<div class="row grpjoin" style="margin-bottom:8px;gap:6px"><span class="hint" style="margin:0">グループで選ぶ：</span>' + groupsOf().map(function (g) { var n = S.chars.filter(function (c) { return inGrp(c, g); }).length; return '<span class="grpchip"><button class="btn small" data-act="joingrp" data-g="' + esc(g) + '" title="このグループだけを参加させる">' + esc(g) + '（' + n + '）</button><button class="btn small ghost" data-act="joingrpadd" data-g="' + esc(g) + '" title="このグループを参加に加える" aria-label="' + esc(g) + 'を参加に加える">＋</button><button class="btn small ghost" data-act="joingrpdel" data-g="' + esc(g) + '" title="このグループを参加から外す" aria-label="' + esc(g) + 'を参加から外す">−</button></span>'; }).join('') + '</div>' : '') + '<div class="tblwrap"><table class="per"><thead><tr><th>参加</th><th>住人</th>' + (hasAct ? '<th>最初の行動</th>' : '') + (hasGoal ? '<th>短期目標</th>' : '') + statHead + '</tr></thead><tbody>' + rows + '</tbody></table></div>' : '<p class="hint">住人がいません。「住人」タブで登録してください。</p>') +
      (S.scenId === 'omega' && S.chars.length ? '<p class="hint" style="margin-top:8px">第二性・スイッチ・職業・フェロモンの匂い・探偵バディ・運命の番のしくみは、カードの「この箱庭のTIPS」にあります。</p>' : '') +
      (sexCols && S.chars.length ? '<p class="hint" style="margin-top:8px">性別と恋愛対象は、住人タブの ⚙️ 設定と同じものです。</p>' : '') +
      (S.scenId === 'classroom' && S.chars.length ? '<div class="row" style="margin-top:10px"><label for="teacher"><b>担任の先生</b></label><select id="teacher" data-f="teacher"><option value="">なし（生徒だけ）</option>' + S.chars.map(function (c) { return '<option value="' + c.id + '"' + (S.teacher === c.id ? ' selected' : '') + '>' + esc(c.name) + '</option>'; }).join('') + '</select><span class="hint" style="margin:0">一人だけ先生にできます。先生は生徒の人数に数えず、生徒との恋愛は起きません。</span></div>' : '') +
      '<div class="runbar"><label for="seed">シード</label><input type="text" id="seed" inputmode="numeric" data-f="seed" value="' + esc(S.seed) + '" placeholder="空欄でランダム"><span class="hint" style="margin:0">同じシードと条件なら同じ結末になります。</span><span class="spacer"></span><button class="btn primary" data-act="run">箱庭を動かす</button></div>';
    $('#view-box').innerHTML = html;
    if (HK.Adv) HK.Adv.afterRender();
  }

  /* 人数を決めてランダムに参加者を選ぶ（対象は全員か、グループ一つ） */
  function randRow(jmax) {
    var gs = groupsOf(), from = S.randFrom && gs.indexOf(S.randFrom) >= 0 ? S.randFrom : '';
    var pool = S.chars.filter(function (c) { return !from || inGrp(c, from); }).length, mx = Math.min(jmax, pool), mn = Math.min(smin(S.scenId), mx);
    var n = HK.clamp(+S.randN || Math.min(mx, Math.max(mn, 4)), mn, mx);
    return '<div class="row randjoin" style="margin-bottom:8px;gap:6px;flex-wrap:wrap"><span class="hint" style="margin:0">ランダムに選ぶ：</span>' +
      (gs.length ? '<select id="randfrom" data-f="randfrom" aria-label="ランダムに選ぶ対象"><option value="">住人全員から</option>' + gs.map(function (g) { return '<option value="' + esc(g) + '"' + (g === from ? ' selected' : '') + '>【' + esc(g) + '】から</option>'; }).join('') + '</select>' : '') +
      '<input type="number" id="randn" data-f="randn" min="' + mn + '" max="' + mx + '" value="' + n + '" inputmode="numeric" style="width:4.5em" aria-label="ランダムに選ぶ人数"><span class="hint" style="margin:0">人</span>' +
      '<button class="btn small" data-act="joinrand"' + (mx < 1 ? ' disabled' : '') + '>ランダムに選ぶ</button></div>';
  }
  function envNow() {
    var env = {};
    HK.SCENARIOS[S.scenId].env.forEach(function (e) { env[e.id] = envVal(e, S.scenId); });
    return env;
  }

  /* ---------- 実行 ---------- */
  function castFor(id) {
    var J = joined(id), tc = id === 'classroom' && S.teacher ? S.chars.filter(function (c) { return c.id === S.teacher; })[0] : null;
    if (!tc) return J;
    return J.filter(function (c) { return c !== tc; }).concat([tc]);
  }
  function buildInput(seed) {
    var env = {};
    var scen = HK.SCENARIOS[S.scenId];
    genv(scen).forEach(function (e) { env[e.id] = envVal(e, S.scenId); });
    /* 内容のスイッチ（content.js。全箱庭で共通）：入にしたものの id をカンマでつないで渡す */
    if (HK.Content && !HK.SAFE_ON) env.ct = ctOn().join(',');
    return {
      scenId: S.scenId, seed: seed, env: env,
      chars: (function () {
        var cast = castFor(S.scenId), ids = cast.map(function (c) { return c.id; }), nm = {};
        S.chars.forEach(function (c) { nm[c.id] = c.name; });
        /* 固定した相手の番号の並び。固定しているのに誰もこの箱庭にいなければ [-1]（誰とも、の印。engine.js の HK.parseLocks） */
        var lockIdx = function (l) { l = idList(l); if (!l.length) return ''; var x = l.map(function (k) { return ids.indexOf(k); }).filter(function (i) { return i >= 0; }); return x.length ? x : [-1]; };
        return cast.map(function (c) {
          var calls = {}, keigo = {};
          if (c.calls) Object.keys(c.calls).forEach(function (id) { if (c.calls[id] && nm[id]) calls[nm[id]] = c.calls[id]; });
          if (c.keigo) Object.keys(c.keigo).forEach(function (id) { if (c.keigo[id] && nm[id]) keigo[nm[id]] = 1; });
          var o = { name: c.name, eg: c.eg, memo: c.memo, gender: c.gender || '', likes: c.likes || '', tone: c.tone || '', fp: c.fp || '', toneCustom: c.toneCustom || '', pos: c.pos || '', posLike: c.posLike || '', futa: !!c.futa, daku: !!c.daku, faithful: !!c.faithful, noR18: !!c.noR18, trioHub: !!c.trioHub, posNpc: c.posNpc === 'bottom' && (c.pos === 'top' || c.pos === 'riba') ? 'bottom' : '', alcohol: HK.ALC_OK(c.alcohol) ? +c.alcohol : '', partWords: c.partWords || '', partM: c.partM || '', partF: c.partF || '', color: c.color || '', call: c.call || '', callG: c.callG || null, bmonth: c.bmonth || '', age: c.age || '', keigoOlder: !!c.keigoOlder, you: c.you || '', marks: c.marks || '', calls: calls, keigo: keigo, loveLock: lockIdx(c.loveLock), sexLock: c.sexLock === 'any' ? c.sexLock : c.sexLock === 'pick' || c.sexLock === 'pickMob' ? lockIdx(c.sexLocks) : '', sexLockMob: c.sexLock === 'pickMob' && idList(c.sexLocks).length > 0, loveNG: (c.loveNG || []).map(function (k) { return ids.indexOf(k); }).filter(function (x) { return x >= 0; }) };
          /* 喘ぎの口調（R18版。全年齢モードでは渡さない） */
          if (c.moanTone && !HK.SAFE_ON) o.moanTone = c.moanTone;
          return HK.Attr ? HK.Attr.toInput(o, c, ids) : o;
        });
      })(),
      perChar: castFor(S.scenId).map(function (c) {
        var p = per(c, S.scenId);
        return { action: p.action, goal: p.goal, stats: JSON.parse(JSON.stringify(p.stats || {})), weapon: p.weapon, pick: JSON.parse(JSON.stringify(p.pick || {})), role: S.scenId === 'classroom' && c.id === S.teacher ? 'teacher' : '' };
      }),
      ties: (function () {
        cleanTies();
        var J = castFor(S.scenId).map(function (c) { return c.id; });
        var out = S.ties.filter(function (t) { return J.indexOf(t.a) >= 0 && J.indexOf(t.b) >= 0; }).map(function (t) {
          var o = { a: J.indexOf(t.a), b: J.indexOf(t.b), type: t.type, cold: HK.coldOpts && HK.coldOpts(t.type) ? t.cold || '' : '', love: t.love === 'ok' ? 'ok' : '' };
          /* 追加の欄（型・度合い・気持ち・様子）は、ある関係だけに付ける */
          (HK.tieExtra ? HK.tieExtra(t.type) : []).forEach(function (x) { if (t[x.f]) o[x.f] = t[x.f]; });
          return o;
        });
        /* 「仲間」を入れたグループの住人どうしに、関係「仲間」を重ねる（同じ二人のほかの関係はそのまま。仲間は補助） */
        var cg = Object.keys(S.grpComrade || {}).filter(function (g) { return S.grpComrade[g]; });
        if (cg.length && HK.TIES.comrade) {
          var cast = castFor(S.scenId), seenC = {};
          for (var i = 0; i < cast.length; i++) for (var j = i + 1; j < cast.length; j++) {
            var x = cast[i], y = cast[j];
            if (!cg.some(function (g) { return inGrp(x, g) && inGrp(y, g); }) || seenC[i + '-' + j]) continue;
            seenC[i + '-' + j] = 1;
            out.push({ a: J.indexOf(x.id), b: J.indexOf(y.id), type: 'comrade', cold: '', love: '' });
          }
        }
        return out;
      })()
    };
  }

  function summarize(res) {
    if (res.solo) return res.summary;
    var top = res.pairs.filter(function (p) { return p.label !== 'strangers'; }).slice(0, 2);
    return top.map(function (p) { return (HK.pairName ? HK.pairName(res, p) : res.chars[p.a].name + '×' + res.chars[p.b].name) + '＝' + p.name; }).join('、');
  }

  /* あとで読む分（js/bundle-late.js）がまだのうちに動かそうとしたら、読み終わるのを待ってから動かす */
  var pendingSim = null;
  HK.onLate = function () {
    if (HK.LATE_FAILED) toast('データの一部を読み込めませんでした。ページを読み込み直してください');
    if (tab === 'cast') renderCast(); else if (tab === 'box') renderBox();
    if (pendingSim) { var ps = pendingSim; pendingSim = null; simulate(ps[0], ps[1]); }
  };
  /* onRes：描画の前に結果を渡す（履歴に結果を置く写しは、描画より前に取る。結末の組み立て HK.Endings.build は結果を書き換えないが、念のため） */
  function simulate(input, record, onRes) {
    if (HK.LATE_READY === false) { pendingSim = [input, record]; toast('データを読み込んでいます。終わりしだい動かします…'); return null; }
    var res;
    try { res = HK.simulate(input); }
    catch (err) { toast('シミュレーション中にエラーが起きました：' + err.message); if (window.console) console.error(err); return null; }
    res.input = input;
    result = res; showAll = false;
    V.resetFilter();
    if (record) {
      histNote = ''; histCur = null;
      var h = { id: histId(), t: Date.now(), scenName: HK.SCENARIOS[input.scenId].name, names: input.chars.map(function (c) { return c.name; }).join('・'), seed: input.seed, summary: summarize(res), input: input };
      hist.unshift(h);
      histSave();
      histKeep(h, res);
    }
    if (onRes) onRes(res);
    setTab('result');
    /* 箱庭を動かしたら、結果の頭（画面のいちばん上）から読めるように */
    if (record) window.scrollTo(0, 0);
    return res;
  }

  /* ---------- 履歴（これまでの箱庭）：結果ごと残し、開くときはそのまま表示する ---------- */
  function histId() { return 'h' + Date.now().toString(36) + Math.random().toString(36).slice(2, 7); }
  /* 一覧を書き戻す（隠している箱庭の履歴も足して、新しい順に HIST_MAX 件）。一覧から外れた履歴の結果は消す */
  function histSave() {
    var all = hist.concat(histHid).sort(function (a, b) { return (b.t || 0) - (a.t || 0); }).slice(0, HIST_MAX);
    hist = hist.filter(function (h) { return all.indexOf(h) >= 0; });
    histHid = histHid.filter(function (h) { return all.indexOf(h) >= 0; });
    var ok = HK.store.set('history', all);
    if (ok && HK.History) HK.History.keep(all.map(function (h) { return h.id; }));
    return ok;
  }
  /* 結果を置く。置けなかった（保存領域が足りない）ときは一覧だけにして知らせる（開くと今の版で回し直す） */
  function histKeep(h, res) {
    if (!HK.History) return;
    var rec = null;
    try { rec = HK.History.make(h.id, res); } catch (e) { rec = null; }
    histPend.push(h);
    (rec ? HK.History.put(rec) : Promise.resolve(false)).then(function (ok) {
      histPend = histPend.filter(function (x) { return x !== h; });
      if (hist.indexOf(h) < 0) return;
      if (ok) { h.r = 1; h.r18 = rec.r18; histSave(); return; }
      delete h.r; delete h.r18; histSave();
      toast('ブラウザの保存領域が足りないため、この結果は「これまでの箱庭」に一覧だけ残しました（開くと、今の版で回し直して表示します）');
    });
  }
  var HIST_MSG = {
    kept: '「これまでの箱庭」に残した結果を、動かしたときの内容のまま表示しています。',
    old: 'この履歴は以前の形式（条件とシードだけ）だったので、今の版で回し直して表示しました。版が変わると内容が変わることがあります。この結果を履歴に残したので、次からはこの内容のまま開きます。',
    lost: '履歴に残した結果が見つからなかったので（保存しきれなかった・ブラウザが整理したなど）、今の版で回し直して表示しました。以前と内容が違うことがあります。この結果を履歴に残し直しました。',
    r18: 'この履歴はR18モードで動かした結果なので、全年齢モードでは今の版で回し直して表示しています（R18モードでは、残した内容のまま開きます）。',
    z18: 'この履歴はR18版で動かした結果なので、全年齢版では今の版で回し直して表示しました。この結果を履歴に残したので、次からはこの内容のまま開きます。'
  };
  function histOpen(it) {
    if (!it) return;
    /* R18モードで動かした結果は、全年齢モードでは出さない（回し直して表示し、残した結果は書き換えない） */
    var lock = HK.SAFE_ON && it.r18;
    if (it.id && it.r && !lock && HK.History) {
      HK.History.get(it.id).then(function (rec) {
        if (rec && rec.result && HK.SAFE_ON && rec.r18) { histRerun(it, HK.SAFE_BUILD ? 'z18' : 'r18'); return; }
        if (!(rec && rec.result)) { histRerun(it, 'lost'); return; }
        result = rec.result;
        if (!result.input) result.input = it.input;
        showAll = false; V.resetFilter();
        histNote = HIST_MSG.kept; histCur = it;
        setTab('result');
      });
      return;
    }
    /* 全年齢版（移行や読み込みで写った R18版の履歴）は、回し直した結果をこの版の履歴として残す */
    histRerun(it, lock ? (HK.SAFE_BUILD ? 'z18' : 'r18') : it.id ? 'lost' : 'old');
  }
  function histRerun(it, why) {
    /* 知らせは先に決めておき、simulate の中の描画（setTab）で一度だけ出す */
    var n0 = histNote, c0 = histCur;
    histNote = HIST_MSG[why]; histCur = it;
    var res = simulate(it.input, false, function (r) {
      if (why === 'r18' || hist.indexOf(it) < 0) return;
      if (!it.id) it.id = histId();
      delete it.r;
      histKeep(it, r);
    });
    if (!res) { histNote = n0; histCur = c0; }
  }
  /* 結果の画面：履歴から開いたときの知らせ（「同じ条件でもう一度」つき）と、履歴の一覧の説明・印（view.js の historyBlock に足す） */
  function histDeco(host) {
    if (result && histNote && !host.querySelector('#histnote')) {
      var html = '<p class="hint" id="histnote" role="status">' + esc(histNote) + (histCur ? ' <button type="button" class="btn small ghost" data-act="histrerun" title="同じ住人・環境・シードで、今の版でもう一度回し、新しい履歴として残す">同じ条件でもう一度</button>' : '') + '</p>';
      var hd = host.querySelector('.resulthead');
      if (hd) hd.insertAdjacentHTML('afterend', html); else host.insertAdjacentHTML('afterbegin', html);
    }
    var box = host.querySelector('.hist');
    if (!box) return;
    var p = box.previousElementSibling;
    if (p && p.classList.contains('hint')) p.textContent = '開くと、動かしたときの結果をそのまま表示します（以前の形式の履歴と、保存しきれなかった結果は、今の版で回し直して表示します）。名簿は書き換えません。';
    Array.prototype.forEach.call(box.querySelectorAll('[data-act="hist"]'), function (b) {
      var it = hist[+b.dataset.k];
      if (it && !(it.id && it.r) && histPend.indexOf(it) < 0) b.insertAdjacentHTML('beforeend', '<span class="nums">' + (it.id ? '結果は未保存' : '以前の形式') + '（開くと回し直します）</span>');
    });
  }

  function run(newSeed) {
    var J = joined(S.scenId);
    var mn = smin(S.scenId);
    if (J.length < mn) { toast(mn === 1 ? '挑戦する住人を1人選んでください' : '参加する住人を' + mn + '人以上選んでください'); return; }
    if (J.length > smax(S.scenId)) { toast(HK.SCENARIOS[S.scenId].name + 'は' + smax(S.scenId) + '人までです。参加者を減らしてください'); return; }
    var seed = !newSeed && /^\d+$/.test(String(S.seed).trim()) ? parseInt(S.seed, 10) : HK.newSeed();
    var input = buildInput(seed), sc = HK.SCENARIOS[S.scenId];
    /* 箱庭ごとの始める前の検査（scen.check が止める理由の文を返したら始めない。無い箱庭は今までどおり） */
    var why = sc && typeof sc.check === 'function' ? sc.check(input) : '';
    if (why) { toast(why); return; }
    simulate(input, true);
  }

  function renderResult() {
    var host = $('#view-result');
    V.render(host, result, { history: hist, showAll: showAll });
    if (result && HK.Share) { var hd = host.querySelector('.resulthead'); if (hd && !host.querySelector('#sharebar')) hd.insertAdjacentHTML('afterend', HK.Share.bar()); }
    /* 結果のセーブ（saves.js） */
    if (result && HK.Saves && !host.querySelector('#savebtn')) { var sb = host.querySelector('#sharebar') || host.querySelector('.resulthead'); if (sb) sb.insertAdjacentHTML('afterend', HK.Saves.button()); }
    /* 履歴から開いたときの知らせと、履歴の一覧の説明 */
    histDeco(host);
  }
  /* セーブデータから結果を開く・同じ条件で回し直す */
  HK.UIres = {
    get: function () { return result; },
    show: function (res) { result = res; showAll = false; histNote = ''; histCur = null; V.resetFilter(); setTab('result'); },
    rerun: function (input) { if (input && HK.SCENARIOS[input.scenId]) simulate(input, true); }
  };
  /* 25問のエゴグラム診断から住人を追加・書き換え */
  if (HK.EgoQuiz) {
    HK.EgoQuiz.chars = function () { return S.chars; };
    HK.EgoQuiz.onSave = function (r) {
      var c = r.target ? S.chars.filter(function (x) { return x.id === r.target; })[0] : null;
      if (c) { c.eg = r.eg; if (r.name) c.name = r.name; }
      else { if (S.chars.length >= MAX) { toast('住人は' + MAX + '人までです'); return; } S.chars.push(mk({ name: r.name, eg: r.eg })); }
      S.sample = false; save(); renderCast();
      toast(r.name + '（' + HK.toCode(r.eg) + '）を' + (c ? '書き換えました' : '住人に追加しました'));
    };
  }
  HK.toast = toast;

  /* ---------- イベント ---------- */
  document.addEventListener('click', function (ev) {
    var t = ev.target.closest('[data-act],[data-tab]');
    if (!t) return;
    if (t.dataset.tab) { setTab(t.dataset.tab); return; }
    var act = t.dataset.act, row = t.closest('.res');
    if (act && act.indexOf('adv:') === 0) { if (HK.Adv) HK.Adv.onAct(act, t); return; }
    switch (act) {
      /* 環境値：初期値に戻す／ランダムに決める（文字の項目はそのまま） */
      case 'envreset': case 'envrand': (function () {
        var scen = HK.SCENARIOS[S.scenId]; if (!scen) return;
        genv(scen).forEach(function (e) {
          var src = HK.GLOBAL_ENV.indexOf(e) >= 0 ? S.glob : (S.env[S.scenId] = S.env[S.scenId] || {});
          if (act === 'envreset') { delete src[e.id]; return; }
          if (e.type === 'text') return;
          if (e.type === 'select') { var os = (e.options || []).filter(function (o) { return !o.disabled; }); if (os.length) src[e.id] = os[Math.floor(Math.random() * os.length)].v; return; }
          var lo = +e.min, hi = +e.max; if (isNaN(lo) || isNaN(hi)) return;
          src[e.id] = lo + Math.floor(Math.random() * (hi - lo + 1));
        });
        renderBox(); toast(act === 'envreset' ? '環境値を初期値に戻しました' : '環境値をランダムに決めました');
      })(); break;
      case 'import-add': importRoster(false); break;
      case 'import-replace': importRoster(true); break;
      case 'export':
        /* グループがあれば「【グループ名】」の見出しで区切る（読み込みでもそのまま使える） */
        /* 複数のグループに入っている住人は、最初のグループの見出しの下に（全部のグループは JSON の書き出しで残る） */
        var gl = groupsOf().filter(function (g) { return S.chars.some(function (c) { return grpList(c)[0] === g; }); });
        copy(gl.length ? gl.concat(['']).map(function (g) { var mem = S.chars.filter(function (c) { return (grpList(c)[0] || '') === g; }); return mem.length ? '【' + (g || 'グループなし') + '】\n' + HK.rosterToText(mem) : ''; }).filter(Boolean).join('\n') : HK.rosterToText(S.chars), '名簿をコピーしました'); break;
      case 'add':
        if (S.chars.length >= MAX) return;
        if (S.sample) { S.sample = false; }
        S.chars.push(mk({ name: '住人' + (S.chars.length + 1), eg: { CP: 10, NP: 10, A: 10, FC: 10, AC: 10 } }));
        save(); renderCast();
        var last = document.querySelector('#castlist .res:last-child input[data-f="name"]');
        if (last) { last.focus(); last.select(); }
        break;
      case 'dup': if (row) dupRes(row.dataset.id); break;
      case 'del':
        S.chars = S.chars.filter(function (c) { return c.id !== row.dataset.id; });
        S.chars.forEach(function (x) { x.loveLock = idList(x.loveLock).filter(function (k) { return k !== row.dataset.id; }); x.sexLocks = idList(x.sexLocks).filter(function (k) { return k !== row.dataset.id; }); if ((x.sexLock === 'pick' || x.sexLock === 'pickMob') && !x.sexLocks.length) x.sexLock = ''; if (x.loveNG) x.loveNG = x.loveNG.filter(function (k) { return k !== row.dataset.id; }); if (x.calls) delete x.calls[row.dataset.id]; if (x.keigo) delete x.keigo[row.dataset.id]; });
        cleanTies(); save(); renderCast(); break;
      case 'tieadd':
        if (S.chars.length < 2) return;
        S.ties = S.ties || [];
        /* 同じ二人に同じ関係を二重に作らない：最初の二人から順に、まだ付いていない関係で足す */
        var nt1 = freeTie(); if (!nt1) { toast('追加できる関係がありません'); return; }
        S.ties.push(nt1);
        save(); renderCast(); break;
      case 'tiedel':
        S.ties.splice(+t.dataset.k, 1); save(); renderCast(); break;
      case 'tieimport':
        var pr = HK.parseTies($('#tiebulk').value, S.chars);
        S.ties = S.ties || [];
        pr.ties.forEach(function (nt) {
          var ex = S.ties.filter(function (x) { return x.type === nt.type && ((x.a === nt.a && x.b === nt.b) || (x.a === nt.b && x.b === nt.a)); })[0];
          if (ex) { ex.a = nt.a; ex.b = nt.b; ex.type = nt.type; if (nt.cold) ex.cold = nt.cold; else delete ex.cold; ['sub', 'grade', 'feel', 'feelB', 'mode', 'lh', 'elder'].forEach(function (f) { if (nt[f]) ex[f] = nt[f]; else delete ex[f]; }); } else S.ties.push(nt);
        });
        /* 「グループ名 仲間」の行：そのグループを仲間とみなす */
        (pr.groups || []).forEach(function (g) { S.grpComrade = S.grpComrade || {}; S.grpComrade[g] = 1; });
        save(); renderCast();
        if (pr.warnings.length) { var tw = $('#tiewarns'); tw.hidden = false; tw.innerHTML = pr.warnings.map(function (x) { return '<li>' + esc(x) + '</li>'; }).join(''); }
        toast(pr.ties.length + '件の関係を読み込みました' + ((pr.groups || []).length ? '（' + pr.groups.join('・') + 'を仲間とみなします）' : ''));
        break;
      case 'tobox': setTab('box'); break;
      case 'joinall':
        S.join = S.join || {}; S.join[S.scenId] = S.chars.slice(0, smax(S.scenId)).map(function (c) { return c.id; });
        if (S.chars.length > smax(S.scenId)) toast('上限の' + smax(S.scenId) + '人まで参加にしました');
        save(); renderBox(); break;
      case 'joingrp': case 'joingrpadd':
        S.join = S.join || {};
        var gmem = S.chars.filter(function (c) { return inGrp(c, t.dataset.g); }).map(function (c) { return c.id; });
        var gcur = act === 'joingrpadd' ? joined(S.scenId).map(function (x) { return x.id; }) : [];
        gmem.forEach(function (id) { if (gcur.indexOf(id) < 0) gcur.push(id); });
        var gmx = smax(S.scenId);
        if (gcur.length > gmx) { gcur = gcur.slice(0, gmx); toast('上限の' + gmx + '人まで参加にしました'); }
        else toast('「' + t.dataset.g + '」' + (act === 'joingrpadd' ? 'を参加に加えました' : 'だけを参加にしました'));
        S.join[S.scenId] = S.chars.filter(function (c) { return gcur.indexOf(c.id) >= 0; }).map(function (c) { return c.id; });
        save(); renderBox(); break;
      /* 箱庭のカードの対応機能のタグ：押すと説明（scen-tags.js） */
      case 'ftag': ev.preventDefault(); toast((HK.ScenTags && HK.ScenTags.DEF[t.dataset.k] ? HK.ScenTags.DEF[t.dataset.k].label + '：' + HK.ScenTags.DEF[t.dataset.k].desc : t.title)); break;
      case 'joingrpdel':
        S.join = S.join || {};
        var dmem = S.chars.filter(function (c) { return inGrp(c, t.dataset.g); }).map(function (c) { return c.id; });
        var dcur = joined(S.scenId).map(function (x) { return x.id; }).filter(function (id) { return dmem.indexOf(id) < 0; });
        S.join[S.scenId] = dcur;
        toast('「' + t.dataset.g + '」を参加から外しました');
        save(); renderBox(); break;
      case 'grpcomrade':
        S.grpComrade = S.grpComrade || {};
        if (S.grpComrade[t.dataset.g]) delete S.grpComrade[t.dataset.g]; else S.grpComrade[t.dataset.g] = 1;
        save(); renderCast();
        toast('「' + t.dataset.g + '」を仲間と' + (S.grpComrade[t.dataset.g] ? 'みなします' : 'みなさないようにしました'));
        break;
      case 'grphide':
        S.grpHide = S.grpHide || {};
        if (S.grpHide[t.dataset.g]) delete S.grpHide[t.dataset.g]; else S.grpHide[t.dataset.g] = 1;
        save(); renderCast(); break;
      case 'sortgrp':
        sortByGroup(); save();
        if (document.getElementById('castlist')) renderCast();
        renderBox(); toast('グループ順に並べました'); break;
      case 'joinrand':
        var rf = S.randFrom || '', rpool = S.chars.filter(function (c) { return !rf || inGrp(c, rf); });
        var rmx = Math.min(smax(S.scenId), rpool.length), rin = $('#randn'), rn = HK.clamp(parseInt(rin && rin.value, 10) || 0, Math.min(smin(S.scenId), rmx), rmx);
        S.randN = rn;
        var sh = rpool.slice();
        for (var ri = sh.length - 1; ri > 0; ri--) { var rj = Math.floor(Math.random() * (ri + 1)), rt = sh[ri]; sh[ri] = sh[rj]; sh[rj] = rt; }
        var rpick = sh.slice(0, rn).map(function (c) { return c.id; });
        S.join = S.join || {}; S.join[S.scenId] = S.chars.filter(function (c) { return rpick.indexOf(c.id) >= 0; }).map(function (c) { return c.id; });
        toast((rf ? '【' + rf + '】から' : '') + rn + '人をランダムに選びました：' + S.chars.filter(function (c) { return rpick.indexOf(c.id) >= 0; }).map(function (c) { return c.name; }).join('・'));
        save(); renderBox(); break;
      case 'joinnone':
        S.join = S.join || {}; S.join[S.scenId] = []; save(); renderBox(); break;
      case 'gobox': setTab('box'); break;
      case 'run': run(false); break;
      case 'reroll': run(true); break;
      case 'iconpick': iconTarget = row && row.dataset.id; var fi = $('#iconfile'); if (fi) { fi.value = ''; fi.click(); } break;
      case 'icondel':
        var cd = S.chars.filter(function (x) { return row && x.id === row.dataset.id; })[0];
        if (cd) { delete cd.icon; save(); renderCast(); }
        break;
      case 'jsonout': exportJSON(); break;
      case 'jpick': jpOpen = !jpOpen; renderCast(); break;
      case 'jpall': S.chars.forEach(function (c) { jpSel[c.id] = true; }); jpSync(); break;
      case 'jpnone': jpSel = {}; jpSync(); break;
      case 'jpgrp':
        var gm = S.chars.filter(function (c) { return inGrp(c, t.dataset.g); }), allOn = gm.every(function (c) { return jpSel[c.id]; });
        gm.forEach(function (c) { if (allOn) delete jpSel[c.id]; else jpSel[c.id] = true; }); jpSync(); break;
      case 'jpout':
        var pick = S.chars.filter(function (c) { return jpSel[c.id]; }).map(function (c) { return c.id; });
        if (pick.length) exportJSON(pick); break;
      case 'jsonadd': case 'jsonrep':
        jsonMode = act === 'jsonrep' ? 'rep' : 'add';
        var jf = $('#jsonfile'); if (jf) { jf.value = ''; jf.click(); }
        break;
      case 'quiz': if (HK.EgoQuiz) HK.EgoQuiz.open(); break;
      case 'sharepng': if (result && HK.Share) HK.Share.saveResult(result, $('#sharemsg')); break;
      case 'sharex': if (result && HK.Share) HK.Share.postResult(result, $('#sharemsg')); break;
      case 'copytext': if (result) copy(V.toText(result), '結果をコピーしました'); break;
      case 'showall': showAll = true; renderResult(); break;
      case 'hist': histOpen(hist[+t.dataset.k]); break;
      /* 履歴から開いた結果を、同じ条件で今の版で回し直す（新しい履歴として残す） */
      case 'histrerun': if (histCur && histCur.input && HK.SCENARIOS[histCur.input.scenId]) simulate(JSON.parse(JSON.stringify(histCur.input)), true); break;
      case 'node': V.toggleWho(+t.dataset.i); break;
      case 'who': V.toggleWho(+t.dataset.i); break;
      case 'whoclear': V.setWho([]); break;
      case 'keyonly': V.toggleKey(); break;
      case 'lewdonly': V.toggleLewd(); break;
      case 'dgkey': if (HK.DView) HK.DView.toggleKey(); break;
      case 'dglewd': if (HK.DView && HK.DView.toggleLewd) HK.DView.toggleLewd(); break;
      case 'pairfilter':
        V.setWho([+t.dataset.a, +t.dataset.b]);
        var h = document.getElementById('tlhead');
        if (h) h.scrollIntoView({ block: 'start' });
        break;
    }
  });

  document.addEventListener('keydown', function (ev) {
    if ((ev.key === 'Enter' || ev.key === ' ') && ev.target.matches && ev.target.matches('g.node')) {
      ev.preventDefault();
      V.toggleWho(+ev.target.getAttribute('data-i'));
    }
  });

  function refreshRow(row, c, fromCode) {
    var i = S.chars.indexOf(c);
    row.querySelector('.gwrap').innerHTML = egoGraph(c.eg, i);
    row.querySelector('.ty').textContent = HK.egoType(c.eg).label;
    var ea = row.querySelector('.egatt'); if (ea && HK.egoAttWord) ea.textContent = HK.egoAttWord(c);
    var tn = row.querySelector('select[data-f="tone"] option[value=""]');
    if (tn) tn.textContent = '口調：おまかせ（' + autoTone(c) + '）';
    if (fromCode) {
      HK.FACTORS.forEach(function (k) { var inp = row.querySelector('input[data-k="' + k + '"]'); if (inp) inp.value = c.eg[k]; });
    } else {
      var cd = row.querySelector('input[data-f="code"]');
      if (cd && document.activeElement !== cd) { cd.value = HK.toCode(c.eg); cd.classList.remove('bad'); }
    }
  }

  function onField(ev) {
    var t = ev.target, f = t.dataset ? t.dataset.f : null;
    if (!f) return;
    var row = t.closest('.res'), c;
    if (row) c = S.chars.filter(function (x) { return x.id === row.dataset.id; })[0];
    if (f === 'name' && c) { c.name = t.value.trim() || '名無し'; S.sample = false; }
    else if (f === 'memo' && c) c.memo = t.value;
    else if (f === 'group' && c) { c.group = t.value.trim().slice(0, 40); }
    else if (f === 'tone' && c) c.tone = (HK.toneValid ? HK.toneValid(t.value) : HK.PERSONA[t.value]) ? t.value : '';
    else if (f === 'fp' && c) c.fp = t.value.trim().slice(0, 8);
    else if (f === 'pos' && c) c.pos = ['top', 'bottom', 'riba'].indexOf(t.value) >= 0 ? t.value : '';
    else if (f === 'gender' || f === 'likes') {
      var cg = c || S.chars.filter(function (x) { return x.id === t.dataset.id; })[0]; if (cg) cg[f] = t.value;
      /* 性別を変えたら、受け攻め「おまかせ」の表示も合わせる */
      var psel = cg && f === 'gender' && document.getElementById('ps-' + cg.id);
      if (psel && psel.options[0]) psel.options[0].textContent = cg.gender === 'f' ? '受け攻め：おまかせ（女性なので受け）' : '受け攻め：おまかせ';
    }
    else if (f === 'eg' && c) {
      var v = parseFloat(t.value);
      if (isNaN(v)) return;
      c.eg[t.dataset.k] = HK.clamp(v, 0, 20);
      S.sample = false;
      refreshRow(row, c, false);
    }
    else if (f === 'code' && c) {
      var code = t.value.replace(/[^A-Da-d]/g, '').toUpperCase().slice(0, 5);
      if (t.value !== code) t.value = code;
      t.classList.toggle('bad', code.length > 0 && code.length < 5);
      if (code.length !== 5) return;
      c.eg = HK.fromCode(code);
      S.sample = false;
      refreshRow(row, c, true);
    }
    else if (f === 'scen') { S.scenId = t.value; save(); renderBox(); return; }
    else if (f === 'adv') { if (HK.Adv) HK.Adv.onInput(t); return; }
    else if (f === 'ct') {
      S.glob.ct = S.glob.ct || {};
      if (t.checked) S.glob.ct[t.dataset.k] = 1; else delete S.glob.ct[t.dataset.k];
    }
    else if (f === 'env') {
      var src = t.dataset.g === '1' ? S.glob : (S.env[S.scenId] = S.env[S.scenId] || {});
      src[t.dataset.k] = t.type === 'range' ? +t.value : t.value;
      var lab = document.getElementById('ev-' + t.dataset.k);
      if (lab) lab.textContent = t.value + (t.dataset.unit || '');
      var rl = document.getElementById('roomlabel');
      if (rl) rl.textContent = '「' + HK.roomLabel(envNow()) + '」';
    }
    else if (f === 'pf') {
      var cp = S.chars.filter(function (x) { return x.id === t.dataset.id; })[0];
      if (!cp) return;
      var pp = per(cp, S.scenId); pp.pick = pp.pick || {};
      if (t.value === 'auto' || !String(t.value).trim()) delete pp.pick[t.dataset.k]; else pp.pick[t.dataset.k] = String(t.value).trim();
      /* 共通の欄（特殊役職・生い立ち・検死の知識）は住人の値も変える（ほかの箱庭の同じ欄にも効く） */
      if (HK.Shared) HK.Shared.set(cp, S.scenId, t.dataset.k, t.value, true);
      /* ほかの欄を選べなくする欄（offWhen）がある箱庭は、行を描き直す */
      if (((HK.SCENARIOS[S.scenId] || {}).perFields || []).some(function (x) { return x.offWhen; })) { save(); renderBox(); return; }
    }
    else if (f === 'per' || f === 'stat' || f === 'weapon') {
      var cc = S.chars.filter(function (x) { return x.id === t.dataset.id; })[0];
      if (!cc) return;
      var p = per(cc, S.scenId);
      if (f === 'per') p[t.dataset.k] = t.value;
      else if (f === 'weapon') p.weapon = t.value;
      else {
        if (t.value === 'random') delete p.stats[t.dataset.k]; else p.stats[t.dataset.k] = +t.value;
        /* 共通の能力値（体力・運など）は住人の値も変える（ほかの箱庭の同じ能力値にも効く。酒の強さは「お酒」） */
        if (HK.Shared) HK.Shared.set(cc, S.scenId, t.dataset.k, t.value, false);
      }
    }
    else if (f === 'join') {
      S.join = S.join || {};
      var cur = joined(S.scenId).map(function (x) { return x.id; });
      if (t.checked && smax(S.scenId) === 1) { cur = [t.dataset.id]; S.join[S.scenId] = cur; save(); renderBox(); return; }
      if (t.checked) { if (cur.indexOf(t.dataset.id) < 0) cur.push(t.dataset.id); }
      else cur = cur.filter(function (x) { return x !== t.dataset.id; });
      S.join[S.scenId] = cur;
      var tr = t.closest('tr'); if (tr) tr.classList.toggle('off', !t.checked);
      var jc = document.getElementById('joincount');
      if (jc) { var mx = smax(S.scenId); jc.innerHTML = '参加 <b class="num">' + cur.length + '</b> / 上限 ' + mx + '人' + (cur.length > mx ? '　<span style="color:var(--warn)">上限を超えています</span>' : ''); }
      updLoveWarn();
    }
    else if (f === 'tie') {
      var tt = S.ties[+t.dataset.k];
      /* 変更の結果、同じ二人に同じ関係が二つになるなら戻す */
      if (tt && /^(?:a|b|type)$/.test(t.dataset.p)) { var na = t.dataset.p === 'a' ? t.value : tt.a, nb = t.dataset.p === 'b' ? t.value : tt.b, nty = t.dataset.p === 'type' ? t.value : tt.type; if (hasTie(na, nb, nty, +t.dataset.k)) { toast('その二人には「' + (HK.TIES[nty] ? HK.TIES[nty].label : nty) + '」がすでにあります'); t.value = tt[t.dataset.p]; return; } }
      if (tt && /^(?:sub|grade|feel|feelB|mode|lh|elder)$/.test(t.dataset.p)) { if (t.value && !(tt.type === 'fiance' && t.value === 'eager')) tt[t.dataset.p] = t.value; else delete tt[t.dataset.p]; save(); renderCast(); return; }
      if (tt) { tt[t.dataset.p] = t.value; if (t.dataset.p === 'love' && !t.value) delete tt.love; if (t.dataset.p === 'type' && HK.tieExtraNorm) HK.tieExtraNorm(tt); if (t.dataset.p === 'type' || t.dataset.p === 'cold' || t.dataset.p === 'love') { save(); renderCast(); return; } }
    }
    else if (f === 'seed') S.seed = t.value.replace(/[^\d]/g, '');
    else if (f === 'teacher') { S.teacher = t.value; save(); renderBox(); return; }
    else if (f === 'randfrom') { S.randFrom = t.value; save(); renderBox(); return; }
    else if (f === 'randn') S.randN = parseInt(t.value, 10) || '';
    save();
  }
  /* 一部の住人だけ書き出す：チェックの切り替え */
  document.addEventListener('change', function (ev) {
    var id = ev.target && ev.target.dataset && ev.target.dataset.jp;
    if (!id) return;
    if (ev.target.checked) jpSel[id] = true; else delete jpSel[id];
    jpSync();
  });
  document.addEventListener('change', function (ev) {
    if (ev.target.id !== 'jsonfile') return;
    var f = ev.target.files && ev.target.files[0];
    if (!f) return;
    if (f.size > 20 * 1024 * 1024) { toast('ファイルが大きすぎます（20MBまで）'); return; }
    var rd = new FileReader();
    rd.onload = function () { importJSON(String(rd.result || ''), jsonMode === 'rep'); };
    rd.onerror = function () { toast('ファイルを読み込めませんでした'); };
    rd.readAsText(f, 'utf-8');
  });
  /* ---------- 住人の並び替え（ドラッグ／上下キー）。Windows・Mac・タッチ共通の Pointer Events ---------- */
  function moveChar(id, to) {
    var from = -1;
    S.chars.forEach(function (c, i) { if (c.id === id) from = i; });
    if (from < 0) return;
    to = Math.max(0, Math.min(S.chars.length - 1, to));
    if (to === from) return;
    var c = S.chars.splice(from, 1)[0];
    S.chars.splice(to, 0, c);
    S.sample = false;
    save(); renderCast();
    var h = document.querySelector('.res[data-id="' + id + '"] .draghandle');
    if (h) h.focus();
  }
  var drag = null;
  function clearMarks() { Array.prototype.forEach.call(document.querySelectorAll('.drop-before,.drop-after'), function (r) { r.classList.remove('drop-before', 'drop-after'); }); }
  document.addEventListener('pointerdown', function (ev) {
    var h = ev.target.closest && ev.target.closest('.draghandle');
    if (!h || (ev.pointerType === 'mouse' && ev.button !== 0)) return;
    var row = h.closest('.res');
    if (!row) return;
    ev.preventDefault();
    drag = { row: row, id: row.dataset.id, over: null, before: true, h: h };
    row.classList.add('dragging'); document.body.classList.add('noselect');
    try { h.setPointerCapture(ev.pointerId); } catch (e) {}
  });
  document.addEventListener('pointermove', function (ev) {
    if (!drag) return;
    ev.preventDefault();
    clearMarks();
    var el = document.elementFromPoint(ev.clientX, ev.clientY), r = el && el.closest ? el.closest('#castlist .res') : null;
    if (r && r !== drag.row) {
      var b = r.getBoundingClientRect();
      drag.over = r; drag.before = ev.clientY < b.top + b.height / 2;
      r.classList.add(drag.before ? 'drop-before' : 'drop-after');
    } else drag.over = null;
    if (ev.clientY < 70) window.scrollBy(0, -14); else if (ev.clientY > window.innerHeight - 70) window.scrollBy(0, 14);
  });
  function endDrag() {
    if (!drag) return;
    var d = drag; drag = null;
    clearMarks(); d.row.classList.remove('dragging'); document.body.classList.remove('noselect');
    if (!d.over) return;
    var ids = S.chars.map(function (c) { return c.id; }), from = ids.indexOf(d.id), at = ids.indexOf(d.over.dataset.id);
    var to = at + (d.before ? 0 : 1);
    if (from < to) to--;
    moveChar(d.id, to);
    toast('並び順を変えました');
  }
  document.addEventListener('pointerup', endDrag);
  document.addEventListener('pointercancel', endDrag);
  document.addEventListener('keydown', function (ev) {
    var h = ev.target.closest && ev.target.closest('.draghandle');
    if (!h || (ev.key !== 'ArrowUp' && ev.key !== 'ArrowDown')) return;
    ev.preventDefault();
    var id = h.closest('.res').dataset.id, i = S.chars.map(function (c) { return c.id; }).indexOf(id);
    moveChar(id, i + (ev.key === 'ArrowUp' ? -1 : 1));
  });

  var iconTarget = null;
  document.addEventListener('change', function (ev) {
    if (ev.target.id !== 'iconfile') return;
    var f = ev.target.files && ev.target.files[0], c = S.chars.filter(function (x) { return x.id === iconTarget; })[0];
    if (!f || !c) return;
    HK.Icons.fromFile(f).then(function (url) {
      c.icon = url;
      var ok = save() !== false;
      renderCast();
      toast(ok ? c.name + 'のアイコンを設定しました' : 'ブラウザに保存しきれませんでした（このページを開いている間は表示されます）');
      if (result) renderResult();
    }, function (e) { toast(e && e.message === 'size' ? '画像が大きすぎます（15MBまで）' : 'この画像は読み込めませんでした'); });
  });
  document.addEventListener('input', onField);
  document.addEventListener('change', function (ev) {
    if (ev.target.id === 'tlcat') { V.setCat(ev.target.value); return; }
    onField(ev);
  });

  HK.UI = HK.UI || {};
  HK.UI.state = function () { return S; };
  /* 画面の上へ／下へ移動するボタン（右下に固定） */
  (function () {
    if (document.getElementById('pagejump')) return;
    var st = document.createElement('style');
    st.textContent = '#pagejump{position:fixed;right:max(10px,env(safe-area-inset-right,0px));bottom:calc(12px + env(safe-area-inset-bottom,0px));display:flex;flex-direction:column;gap:6px;z-index:50}' +
      '#pagejump button{width:40px;height:40px;border-radius:50%;border:1px solid var(--line);background:var(--surface);color:var(--accent);font-size:18px;line-height:1;cursor:pointer;box-shadow:0 1px 4px rgba(0,0,0,.15);opacity:.88}' +
      '#pagejump button:hover{opacity:1;border-color:var(--accent)}@media print{#pagejump{display:none}}';
    document.head.appendChild(st);
    var d = document.createElement('div');
    d.id = 'pagejump';
    d.innerHTML = '<button type="button" data-jump="top" aria-label="画面のいちばん上へ" title="いちばん上へ">↑</button><button type="button" data-jump="bottom" aria-label="画面のいちばん下へ" title="いちばん下へ">↓</button>';
    d.addEventListener('click', function (ev) {
      var b = ev.target.closest('[data-jump]');
      if (!b) return;
      var y = b.dataset.jump === 'top' ? 0 : Math.max(document.documentElement.scrollHeight, document.body.scrollHeight);
      try { window.scrollTo({ top: y, behavior: 'smooth' }); } catch (e) { window.scrollTo(0, y); }
    });
    document.body.appendChild(d);
  })();
  HK.UI.save = save; HK.UI.renderCast = renderCast; HK.UI.cleanTies = cleanTies; HK.UI.toast = toast;
  HK.UI.refresh = function () { setTab(tab); };
  HK.UI.autoTone = autoTone;
  /* 書き出し・読み込み・入力の組み立て（点検・往復の試験から呼ぶ。画面の操作と同じ関数） */
  HK.UI.rosterJSON = rosterJSON; HK.UI.importJSON = importJSON; HK.UI.buildInput = buildInput; HK.UI.normState = normState;
  setTab('cast');
  bkNotice();
})();
