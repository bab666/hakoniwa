/* 箱庭診断 ui: 住人の登録・箱庭の設定・実行・状態保存 */
(function () {
  'use strict';
  var HK = window.HK, esc = HK.escape, V = HK.View;
  /* 住人が多いとき（最大1000人）の住人タブの節・ページ送り・探す、箱庭タブの参加者選び（ui-cast-pages.js。このファイルより前に読む） */
  var CP = HK.CastPages || null;
  /* 箱庭タブの描き方（ui-box-draw.js。このファイルより前に読む） */
  var BD = HK.BoxDraw || null;
  /* 死のある箱庭に「特殊役職」の欄を足す（special.js） */
  if (HK.Special) HK.Special.install();
  /* 分割読み込み：あとから読んだかたまりで登録された箱庭（ゾンビの街・館など）にも足す（install は何度呼んでも同じ） */
  if (HK.Special && HK.Load && HK.Load.onChunk) HK.Load.onChunk(function () { HK.Special.install(); });
  /* 登録できる住人の上限（箱庭に参加できるのは最大35人。2026-10-28 に 30 → 35）。2026-10-26 に 100 → 200、2026-10-27 に 200 → 1000。
     アイコン（画像）は localStorage に入りきらないので、IndexedDB に分けて置く（saves.js の HK.IconStore。使えない環境では従来どおり住人の保存に入れる）。
     住人・関係そのものも IndexedDB に置く（state-store.js の HK.StateStore。localStorage には約1MBまで写し、超えたら「IndexedDB にある」印だけ） */
  var MAX = 1000;
  var JOIN_MAX = 35;
  /* 13人目以降の色トークン（明暗それぞれ。上限 MAX 人分） */
  (function () {
    var L = [], D = [];
    for (var i = 12; i < MAX; i++) {
      var h = (i * 47 + 15) % 360;
      L.push('--p' + i + ':hsl(' + h + ' 55% 38%)');
      D.push('--p' + i + ':hsl(' + h + ' 65% 70%)');
    }
    /* 色の量が「藍のみ」のときは住人の色も藍に（index.html の :root[data-palette="mono"] は --p0〜--p11。図や札は 30 色で回すので --p29 まで） */
    var M = []; for (var j = 12; j < 30; j++) M.push('--p' + j + ':var(--ai)!important');
    var css = ':root{' + L.join(';') + '}@media (prefers-color-scheme: dark){:root:not([data-theme="light"], [data-theme="gray"]){' + D.join(';') + '}}:root[data-theme="dark"]{' + D.join(';') + '}:root[data-palette="mono"]{' + M.join(';') + '}' +
      /* 住人が多いとき（最大 MAX 人）の一覧：画面の外の行は描画を後回しにする（対応していないブラウザでは何もしない） */
      '#castlist .res{content-visibility:auto;contain-intrinsic-size:auto 132px}' +
      /* 関係の行の描画の後回し（content-visibility）は ui-ties.js の CSS */
      /* 箱庭のデータを読み込み中・失敗の印（load.js）：カードの高さを変えないように右上に重ねる。設定欄の仮表示は高さを確保して、読み終えたときのずれを小さく */
      '.scen .scload{position:absolute;top:-9px;right:8px;z-index:1;font-family:var(--f-num);font-size:10.5px;letter-spacing:.06em;line-height:1.5;padding:0 6px;border:1px solid var(--ink);border-radius:3px;background:var(--paper);color:var(--ink);pointer-events:none;white-space:nowrap}' +
      '.scen .scload.ng{background:var(--paper);color:var(--ink);border-style:dashed;pointer-events:auto}.scen .scload.ng button{font:inherit;color:inherit;background:none;border:0;padding:0 0 0 4px;text-decoration:underline;cursor:pointer}' +
      '.boxwait{min-height:420px;box-sizing:border-box;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:6px;margin:16px 0;padding:16px;border:1px dashed var(--line);border-radius:var(--r);color:var(--muted);text-align:center}' +
      '.boxwait p{margin:0}.prefrow{display:flex;flex-wrap:wrap;align-items:center;gap:4px 8px;margin:8px 0 0}.prefrow select{max-width:100%}' +
      '#loadfail{position:fixed;left:max(12px,env(safe-area-inset-left,0px));right:62px;bottom:calc(12px + env(safe-area-inset-bottom,0px));z-index:60;display:flex;gap:8px 10px;align-items:center;flex-wrap:wrap;padding:10px 12px;border:1px solid var(--ink);border-radius:var(--r-card,6px);background:var(--paper,#fff);color:var(--ink);font-size:14px}' +
      '@media (min-width:700px){#loadfail{left:50%;right:auto;transform:translateX(-50%);max-width:640px}}';
    var st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);
  })();
  /* fac：派閥の設定（factions.js）は派閥のある箱庭だけに、その箱庭の環境値のすぐあとに出す */
  /* r18：R18版だけの環境値（夜の起こりやすさ）は全年齢モードでは出さない。show：出す箱庭を絞る（events-common.js） */
  function gshow(scen) { return function (e) { return !(e.r18 && HK.SAFE_ON) && (!e.show || e.show(scen)); }; }
  function genv(scen) {
    if (scen.solo) return scen.env.concat(HK.GLOBAL_ENV.filter(function (e) { return e.all; }).filter(gshow(scen)));
    var g = HK.GLOBAL_ENV.filter(function (e) { return !e.fac || scen.factions; }).filter(gshow(scen));
    return scen.env.concat(g.filter(function (e) { return e.fac; }), g.filter(function (e) { return !e.fac; }));
  }
  /* 箱庭の情報：本体（HK.SCENARIOS）か、まだ読んでいない箱庭は目録から作った仮の箱庭（load.js の HK.Load.info。stub: true。一覧・人数・名前にだけ使う） */
  function scenOf(id) { return HK.Load && HK.Load.info ? HK.Load.info(id) : HK.SCENARIOS[id]; }
  function smin(id) { var s = scenOf(id); return (s && s.minCast) || 2; }
  function smax(id) { var s = scenOf(id); return Math.min(JOIN_MAX, (s && s.maxCast) || 12); }
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
  /* 分けた結果はグループの文字列ごとに覚えておく（住人1000人の描画で何万回も呼ぶため。返す配列は書き換えない） */
  var grpMemo = Object.create(null), grpMemoN = 0;
  function grpList(c) {
    var s = String((c && c.group) || ''), m = grpMemo[s];
    if (m) return m;
    var g = []; s.split(/[,，、]/).forEach(function (x) { x = x.trim(); if (x && g.indexOf(x) < 0) g.push(x); });
    if (++grpMemoN > 5000) { grpMemo = Object.create(null); grpMemoN = 0; }
    return (grpMemo[s] = g);
  }
  function inGrp(c, g) { return grpList(c).indexOf(g) >= 0; }
  HK.groupList = grpList;
  /* 住人の一覧で隠しているグループ（S.grpHide）。グループのある住人は、つけたグループがすべて隠れているときだけ一覧から隠す（箱庭の参加者選びには影響しない） */
  /* グループのない住人は「グループなし」の札（S.grpHideNone）で隠す。「グループで絞り込む」は、この二つをまとめて切り替える（表示だけ。保存は全員） */
  function grpHidden(c) { var h = S.grpHide || {}, g = grpList(c); return g.length ? g.every(function (x) { return h[x]; }) : !!S.grpHideNone; }
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
  /* 登録順（reg）：住人を足した時刻（同じミリ秒に続けて足しても順が崩れないよう、前の値より必ず大きくする）。並び替えたあとも「登録順に戻す」で戻せる */
  var lastReg = 0;
  function newReg() { var t = Date.now(); if (t <= lastReg) t = lastReg + 1; lastReg = t; return t; }
  function mk(c) { var o = { id: uid(), reg: newReg(), name: c.name, eg: { CP: c.eg.CP, NP: c.eg.NP, A: c.eg.A, FC: c.eg.FC, AC: c.eg.AC }, memo: c.memo || '', group: c.group || '', tags: c.tags ? str(c.tags, 80).trim() : '', gender: c.gender || '', likes: c.likes || '', tone: c.tone || '', fp: c.fp || '', pos: c.pos || '', color: c.color || '', loveLock: idList(c.loveLock), sexLock: c.sexLock || '', sexLocks: idList(c.sexLocks), loveNG: (c.loveNG || []).slice(), call: c.call || '', calls: c.calls ? JSON.parse(JSON.stringify(c.calls)) : {}, keigo: c.keigo ? JSON.parse(JSON.stringify(c.keigo)) : {}, bmonth: c.bmonth || '', age: c.age || '', keigoOlder: !!c.keigoOlder, futa: !!c.futa, daku: !!c.daku, faithful: !!c.faithful, noR18: !!c.noR18, posNpc: HK.Pos ? HK.Pos.npcValid(c.posNpc) : '', alcohol: HK.ALC_OK(c.alcohol) ? String(c.alcohol) : '', ab: c.ab && typeof c.ab === 'object' ? JSON.parse(JSON.stringify(c.ab)) : {}, abM: !!c.abM, partWords: c.partWords || '', partM: c.partM || '', partF: c.partF || '', you: c.you || '', callG: c.callG ? JSON.parse(JSON.stringify(c.callG)) : null }; return HK.Attr ? HK.Attr.mk(o, c) : o; }

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
    /* アイコンは IndexedDB に分けて置く（saves.js の HK.IconStore）ので、控えと住人の保存のどちらにあるかでは比べない */
    return (b.chars || []).some(function (c) { var o = c && sc[c.id]; return !o || Object.keys(c).some(function (k) { return k !== 'icon' && full(c[k]) && !full(o[k]); }); });
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
  /* この画面で出せる箱庭か（本体があるか、目録にあって並び SCEN_ORDER（全年齢モードで絞った後）にある） */
  function scenKnown(id) { return !!scenOf(id); }
  if (!scenKnown(S.scenId)) S.scenId = HK.SCEN_ORDER[0];
  HK.Icons.set(S.chars);
  /* アイコンの置き場（IndexedDB。saves.js の HK.IconStore）から読んで、住人の保存に無いアイコンを戻す。
     読み終わる前にこのページで変えた・外したアイコン（iconTouched）は戻さない。読み終えたら保存して、まだ住人の保存に入っているアイコンを置き場へ移す */
  var iconTouched = {};
  if (HK.IconStore) HK.IconStore.load().then(function (m) {
    var got = 0;
    S.chars.forEach(function (c) { if (!c.icon && m[c.id] && !iconTouched[c.id]) { c.icon = m[c.id]; got++; } });
    if (got) {
      HK.Icons.set(S.chars);
      var ae = document.activeElement, typing = ae && ae.closest && ae.closest('#view-cast') && /^(INPUT|TEXTAREA|SELECT)$/.test(ae.tagName);
      if (tab === 'cast' && !typing) renderCast(); else if (tab === 'result' && result) renderResult();
    }
    if (!bkHold && !rescue) save(); else HK.IconStore.sync(S.chars, null);
  });
  /* 「これまでの箱庭」（履歴）：一覧は localStorage の history（id・日時・箱庭・住人名・シード・要約・入力。r は結果を置いた印、r18 は R18モードで動かしたか、ver は版の印）。
     結果そのものは history.js（HK.History）に id で置き、開くときはそれをそのまま表示する。id や r の無い古い形の履歴・置けなかった結果は、
     回し直さずに「結果が残っていないため開けません」とする（2026-10-28。版が変わると同じシードでも結果が変わり、以前は回し直した結果で
     履歴を上書きしていたため、保存時と別の組・別の展開に書き換わって見えた）。条件とシードは「箱庭タブに写す」だけできる（自動では動かさない） */
  var HIST_MAX = 12;
  var histRaw = HK.store.get('history', []);
  if (!Array.isArray(histRaw)) histRaw = [];
  histRaw = histRaw.filter(function (h) { return h && h.input && Array.isArray(h.input.chars); });
  var hist = histRaw.filter(function (h) { return scenKnown(h.input.scenId); });
  /* この画面で出せない箱庭（全年齢モードで隠す R18 の箱庭など）の履歴は、表示しないが消さない（書き戻すときに足す） */
  var histHid = histRaw.filter(function (h) { return !scenKnown(h.input.scenId); });
  var histNote = '', histCur = null, histPend = [];   /* histPend：結果を置いている途中の履歴（一覧に「未保存」の印を出さない） */
  var opened = null, shownRes = null, histGone = [];   /* histGone：開こうとして結果が見つからなかった履歴（記録は書き換えず、印だけ）。 セーブ・履歴から開いた結果のとき { from: 'save'｜'hist', at }（開いた画面に「保存時の版」を出す。saves.js の make が版の印を付け替えない） */
  var tab = 'cast', result = null, showAll = false;

  function bkKey() { return (HK.STORE ? HK.STORE.prefix : 'hakoniwa:') + 'state:backup'; }
  function save() {
    HK.Icons.set(S.chars);
    /* 読み込めなかった保存を退避できなかったときは、住人の保存を上書きしない（下の rescueNotice で書き出してもらう） */
    if (rescueHold) return false;
    S.v = STATE_V; S.savedAt = Date.now();
    /* アイコンは IndexedDB に置き終えたものだけ外して書く（HK.IconStore.strip）。まだ置いていないものは置き、置けたらもう一度 save して外す */
    var out = HK.IconStore ? HK.IconStore.strip(S) : S;
    var ok = HK.store.set('state', out);
    /* 控えを書けなかった（保存領域がいっぱい）ときは、古い控えを残さない。残すと、次に開いたとき「旧版を開いた」の知らせが誤って出て、
       「控えから戻す」で古い住人に戻ってしまう */
    if (ok && !bkHold && !rescue && !HK.store.set('state:backup', { v: STATE_V, at: S.savedAt, state: out })) { try { window.localStorage.removeItem(bkKey()); } catch (e) { /* 使えない環境 */ } }
    if (HK.IconStore) HK.IconStore.sync(S.chars, save);
    return ok;
  }
  /* 箱庭タブの後回しの描画（ui-box-draw.js）が終わってから保存する（何度呼んでも1回。長くても約2秒で保存する） */
  var saveQ = 0;
  function saveSoon() {
    if (saveQ) return;
    saveQ = 1;
    var t0 = Date.now(), go = function () {
      if (saveQ !== 1) return;
      if (BD && BD.pending() && Date.now() - t0 < 2000) { setTimeout(go, 50); return; }
      saveQ = 0; save();
    };
    setTimeout(go, 50);
  }
  /* 読み込めなかった保存の知らせ（上の rescue）。元の保存（退避したもの）を JSON で書き出せる。閉じると、それ以降は控えも書く */
  function rescueNotice() {
    var box = document.createElement('div');
    box.id = 'rescuenote'; box.setAttribute('role', 'alert');
    box.style.cssText = 'margin:8px 0 12px;padding:10px 12px;border:1px solid #16233B;border:1px solid var(--ink);border-left-width:3px;border-radius:6px;background:#fff;background:var(--paper);color:#16233B;color:var(--ink);line-height:1.6';
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
    box.style.cssText = 'margin:8px 0 12px;padding:10px 12px;border:1px solid #16233B;border:1px solid var(--ink);border-radius:6px;background:#F6F6F7;background:var(--bg1);color:#16233B;color:var(--ink);line-height:1.6';
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
    box.style.cssText = 'margin:8px 0 12px;padding:10px 12px;border:1px solid #16233B;border:1px solid var(--ink);border-radius:6px;background:#F6F6F7;background:var(--bg1);color:#16233B;color:var(--ink);line-height:1.6';
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
  function setTab(t, quick) {
    tab = t;
    ['cast', 'box', 'result', 'saves'].forEach(function (k) {
      var tb = $('#tab-' + k), vw = $('#view-' + k);
      if (tb) tb.setAttribute('aria-selected', String(k === t));
      if (vw) vw.hidden = k !== t;
    });
    if (t === 'saves' && HK.Saves) HK.Saves.render();
    if (t === 'cast') renderCast();
    if (t === 'box') renderBox(quick ? { defer: true } : null);
    if (t === 'result') renderResult();
    if (HK.UI && HK.UI.applyColors) HK.UI.applyColors(t === 'result' && result && result.input ? result.input.chars : S.chars);
    /* タブの位置まで戻す。タブを押したとき（quick）は、描画の直前（rAF）に測る（ここで測ると、描き終える前のレイアウトを一度余計に計算する） */
    var up = function () { var top = $('.tabs').getBoundingClientRect().top + window.pageYOffset - 4; if (window.pageYOffset > top) window.scrollTo(0, top); };
    if (quick && window.requestAnimationFrame) requestAnimationFrame(up); else up();
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
      '<div class="codeline"><input type="text" class="code" id="cd-' + c.id + '" data-f="code" value="' + HK.toCode(c.eg) + '" maxlength="5" autocomplete="off" autocapitalize="characters" spellcheck="false" aria-label="5文字コード（CP NP A FC AC）"><span class="ty" title="' + esc(HK.egoType(c.eg).label) + '">' + esc(HK.egoType(c.eg).label) + '</span>' + (HK.egoTypeName ? '<span class="egatt egname" title="エゴグラムから見た性格の型。「設定」の「この住人の傾向」に説明があります">' + esc(HK.egoTypeName(c)) + '</span>' : '') + (HK.egoToneWord ? '<span class="egatt egtone" title="この住人の口調（台詞の話し方）。おまかせだとエゴグラムから決まります">' + esc(HK.egoToneWord(c)) + '</span>' : '') + '</div></div>' +
      '<div class="ego">' + HK.FACTORS.map(function (k) {
        return '<label title="' + esc(HK.FACTOR_FULL[k]) + '">' + k + '<input type="number" id="eg-' + c.id + '-' + k + '" inputmode="decimal" min="0" max="20" step="1" data-f="eg" data-k="' + k + '" value="' + c.eg[k] + '"></label>';
      }).join('') + '</div>' +
      '<div class="gwrap">' + egoGraph(c.eg, i) + '</div>' +
      '<button class="btn ghost small" data-act="del" aria-label="' + esc(c.name) + 'を削除">削除</button>' +
      '<div class="memo"><input type="text" class="grp" id="gp-' + c.id + '" data-f="group" value="' + esc(c.group || '') + '" placeholder="グループ（任意・読点やカンマで複数）" maxlength="40" list="grplist" aria-label="' + esc(c.name) + 'のグループ" title="同じグループ名をつけた住人は、箱庭でまとめて選んだり、並び替えたり、一覧で絞り込んだりできます。読点（、）かカンマで区切ると複数のグループに入れられます（例：生徒会、2年A組）">' +
        '<input type="text" class="tags" id="tg-' + c.id + '" data-f="tags" value="' + esc(c.tags || '') + '" placeholder="タグ（任意・読点やカンマで複数）" maxlength="80" list="taglist" aria-label="' + esc(c.name) + 'のタグ" title="グループとは別に付ける目印です。住人の一覧で探したり、「タグで絞り込む」で絞り込んだりできます（結果には影響しません）。読点（、）かカンマで区切ると複数付けられます"><input type="text" id="mm-' + c.id + '" data-f="memo" value="' + esc(c.memo) + '" placeholder="メモ（任意・結果には影響しません）" maxlength="80">' +
      '<span class="gearpair" style="display:inline-flex;gap:6px;align-items:center;flex:0 0 auto"><button type="button" class="btn small gearbtn" data-act="gear" aria-label="' + esc(c.name) + 'の設定（口調・呼び方・関係など）" title="口調・一人称・呼び方・性別・恋愛・イメージカラー・関係をまとめて設定"><span class="gearic" aria-hidden="true"><svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linejoin="round"><path d="M6.8 3.1L7.0 1.4L9.0 1.4L9.2 3.1L10.6 3.7L12.0 2.6L13.4 4.0L12.3 5.4L12.9 6.8L14.6 7.0L14.6 9.0L12.9 9.2L12.3 10.6L13.4 12.0L12.0 13.4L10.6 12.3L9.2 12.9L9.0 14.6L7.0 14.6L6.8 12.9L5.4 12.3L4.0 13.4L2.6 12.0L3.7 10.6L3.1 9.2L1.4 9.0L1.4 7.0L3.1 6.8L3.7 5.4L2.6 4.0L4.0 2.6L5.4 3.7Z"/><circle cx="8" cy="8" r="2.1"/></svg></span>設定</button>' +
      '<button type="button" class="btn small ghost" data-act="dup"' + (S.chars.length >= MAX ? ' disabled title="住人が上限の' + MAX + '人まで登録されているので、複製できません"' : ' title="この住人の設定をすべて写した住人を、すぐ下に足します（関係と、ほかの住人を指す設定は写しません）"') + ' aria-label="' + esc(c.name) + 'を複製">複製</button></span>' +
      '<span class="csum">' + (HK.UI && HK.UI.summary ? HK.UI.summary(c) : '') + '</span></div>' +
      '</div>';
  }

  /* ---------- 住人の一覧の上の道具：並び（登録順に戻す・グループ順）と、グループで絞り込む（表示だけ。保存・書き出し・箱庭の参加者選びは全員のまま） ---------- */
  function regSorted() { for (var i = 1; i < S.chars.length; i++) if ((S.chars[i - 1].reg || 0) > (S.chars[i].reg || 0)) return false; return true; }
  function sortByReg() { var idx = {}; S.chars.forEach(function (c, i) { idx[c.id] = i; }); S.chars.sort(function (a, b) { return ((a.reg || 0) - (b.reg || 0)) || (idx[a.id] - idx[b.id]); }); }
  /* ランダムで1人追加：名前の雰囲気（ui-rand.js の HK.RandChar）。このページを開いているあいだだけ覚える */
  var randStyle = '';
  function renderCast() {
    var CT = HK.CastTools;
    var html =
      /* 住人をまとめて登録（描画は ui-import.js。ボタンの処理はこのファイルの onClick）。書き出し・読み込み・別の端末へ・保存フォルダは「データ」ダイアログ（ui-cast-tools.js） */
      (HK.CastImport ? HK.CastImport.html({ full: S.chars.length >= MAX }) : '') +
      /* 見出し行「住人 n / 上限 ？」＋「1 人追加 ▾」「データ ▾」＋1行のヒント（ui-cast-tools.js） */
      (CT ? CT.head(S.chars.length) : '<h2 class="sec">住人　<span class="num">' + S.chars.length + '/' + MAX + '</span></h2>') +
      (S.sample ? '<p class="sample-note">いま並んでいるのはサンプルの住人です。自分のキャラクターに置き換えてください。</p>' : '') +
      '<input type="file" id="iconfile" accept="image/*" hidden>' +
      '<datalist id="grplist">' + groupsOf().map(function (g) { return '<option value="' + esc(g) + '">'; }).join('') + '</datalist>' +
      /* ツールバー・グループごとの節（見出しに「仲間とみなす」）・ページ送り（ui-cast-pages.js）。絞り込みで隠した住人・折りたたんだ節・ほかのページの住人は描かない */
      (CP ? CP.castHtml() : '<div class="cast" id="castlist">' + S.chars.map(function (c, i) { var h = resRow(c, i); return grpHidden(c) ? h.replace('<div class="res"', '<div class="res" hidden style="display:none"') : h; }).join('') + '</div>') +
      (S.chars.length >= MAX ? '<p class="hint" id="castfull" style="color:var(--warn)">住人が上限の' + MAX + '人まで登録されています。追加・複製するには、誰かを削除してください。</p>' : '') +
      (CT ? CT.bottom() : '') + (HK.VoiceSet ? HK.VoiceSet.html() : '') +   /* 口調・喘ぎの設定（全体／住人。ui-voice.js。2026-10-28 担当LA） */
      tiesSection() +
      '<div class="row" style="margin-top:20px"><span class="spacer"></span><button class="btn primary" data-act="tobox">箱庭を選ぶ</button></div>';
    $('#view-cast').innerHTML = html;
    if (CP) CP.after($('#view-cast'));
    if (CT) CT.after(); if (HK.VoiceSet) HK.VoiceSet.after();
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
    c.reg = newReg();
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
    if (CP) CP.reveal(c.id);
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
    /* 住人の id は表で引く（住人の行の要約 UI.summary が住人ごとに呼ぶので、住人1000人・関係300本で indexOf だと数秒かかった） */
    var ids = Object.create(null);
    S.chars.forEach(function (c) { ids[c.id] = 1; });
    S.ties = (S.ties || []).filter(function (t) { return ids[t.a] && ids[t.b] && t.a !== t.b && HK.TIES[t.type]; });
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
  /* 住人が多いとき（61人以上）は、関係の行の住人の欄を、選んでいる人だけの選択肢で描き（data-lazy）、触れたときに全員の選択肢を入れる。
     住人1000人・関係300本だと選択肢が数十万になり、住人タブの描画に30秒以上かかったため */
  var TIE_LAZY = 60;
  function tieCharOpts(sel, byId) {
    if (S.chars.length <= TIE_LAZY) return charOpts(sel);
    var c = byId[sel];
    return c ? '<option value="' + c.id + '" selected>' + esc(c.name) + '</option>' : '';
  }
  function tieFill(ev) {
    var t = ev.target;
    if (!t || t.tagName !== 'SELECT' || !t.hasAttribute('data-lazy')) return;
    t.removeAttribute('data-lazy');
    var v = t.value; t.innerHTML = charOpts(v); t.value = v;
  }
  ['focusin', 'mousedown', 'touchstart', 'keydown'].forEach(function (k) { document.addEventListener(k, tieFill, true); });
  /* 住人どうしの既存の関係の節（関係の行・グループの見出し・一括設定。ui-ties.js。このファイルより前に読む） */
  function tiesSection() {
    cleanTies();
    return HK.TiesUI ? HK.TiesUI.section({ opts: tieCharOpts, lazy: S.chars.length > TIE_LAZY }) : '';
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
      if (ex) { ex.eg = c.eg; if (c.memo) ex.memo = c.memo; if (c.group != null) ex.group = c.group; if (c.yomi) ex.yomi = c.yomi; updated++; }
      else if (list.length < MAX) { list.push(mk(c)); added++; }
    });
    S.chars = list; S.sample = false; save(); if (HK.CastImport) HK.CastImport.clear();
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
        if (c.tags) o.tags = c.tags;
        if (c.reg) o.reg = c.reg;
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
        if (HK.Pos && HK.Pos.npcValid(c.posNpc)) o.posNpc = c.posNpc;
        if (c.alcohol) o.alcohol = +c.alcohol;
        if (c.partWords) o.partWords = c.partWords;
        if (c.partM) o.partM = c.partM;
        if (c.partF) o.partF = c.partF;
        if (c.you) o.you = c.you;
        if (c.marks) o.marks = c.marks;
        if (HK.Attr) HK.Attr.exportTo(o, c, ref);
        if (HK.Shared) HK.Shared.exportTo(o, c);
        if (c.toneCustom) o.toneCustom = c.toneCustom;
        if (c.moanTone) o.moanTone = c.moanTone; ['moanDict', 'moanDictT', 'moanFit', 'moanOpt'].forEach(function (k) { if (c[k]) o[k] = JSON.parse(JSON.stringify(c[k])); });
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
      ties: (R.ties || []).filter(function (t) { return ref(t.a) != null && ref(t.b) != null && (idx[t.a] != null || idx[t.b] != null); }).map(function (t) { var o = { a: ref(t.a), b: ref(t.b), type: t.type }; if (t.cold) o.cold = t.cold; if (t.love === 'ok' || t.love === 'no') o.love = t.love; HK.TIE_XF.forEach(function (f) { if (t[f]) o[f] = t[f]; }); return o; }),
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
      toast(data.chars.length + '人分をJSONで書き出しました' + (only ? '（読み込む側で「JSONを足す」を使うと、同じ名前の住人だけが更新されます）' : ''));
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
      else { if (list.length >= MAX) { map[i] = null; skipped++; return; } c = mk({ name: name, eg: eg }); c._new = 1; list.push(c); added++; }
      c.memo = String(o.memo || c.memo || '').slice(0, 80);
      if (o.group != null) c.group = String(o.group).trim().slice(0, 40);
      if (o.tags != null) c.tags = String(o.tags).trim().slice(0, 80);
      if (['', 'm', 'f', 'x'].indexOf(o.gender || '') >= 0) c.gender = o.gender || '';
      if (['', 'm', 'f', 'both', 'none'].indexOf(o.likes || '') >= 0) c.likes = o.likes || '';
      if (['', 'top', 'bottom', 'riba'].indexOf(o.pos || '') >= 0) c.pos = o.pos || '';
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
      if (HK.Pos && HK.Pos.npcValid(o.posNpc)) c.posNpc = o.posNpc;
      /* 登録順（書き出したときの値。無い古い JSON は、足した順の新しい値のまま） */
      if (c._new && +o.reg > 0 && isFinite(+o.reg)) c.reg = Math.floor(+o.reg);
      delete c._new;
      if (HK.ALC_OK(o.alcohol)) c.alcohol = String(o.alcohol);
      if (o.partWords) c.partWords = o.partWords;
      if (o.partM != null) c.partM = String(o.partM);
      if (o.partF != null) c.partF = String(o.partF);
      if (o.you != null) c.you = String(o.you).trim().slice(0, 8);
      if (o.marks != null) c.marks = String(o.marks).trim().slice(0, 30);
      if (HK.Attr) HK.Attr.importFrom(c, o);
      if (HK.Shared) HK.Shared.importFrom(c, o);
      if (o.toneCustom != null) c.toneCustom = (HK.normToneCustom ? HK.normToneCustom(String(o.toneCustom).slice(0, 120)) : '');
      if (o.moanTone != null) c.moanTone = okTone(o.moanTone) ? String(o.moanTone || '') : ''; ['moanDict', 'moanDictT', 'moanFit', 'moanOpt'].forEach(function (k) { if (o[k] != null) c[k] = typeof o[k] === 'string' ? o[k].slice(0, 4000) : JSON.parse(JSON.stringify(o[k])); });
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
      if (t.love === 'ok' || t.love === 'no') nt0.love = t.love;
      /* 追加の欄（型・度合い・気持ち・様子・愛憎）。古い JSON にはないので、ないときは今までどおり */
      HK.TIE_XF.forEach(function (f) { if (typeof t[f] === 'string' && t[f]) nt0[f] = t[f]; });
      if (HK.tieLhMigrate) HK.tieLhMigrate([nt0]).slice(1).forEach(function (x) { S.ties.push(x); });
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
      '<p class="hint" style="margin:0 0 6px">書き出す住人にチェックを入れてください。受け取った人が「JSONを足す」で読み込むと、同じ名前の住人だけが更新され、ほかの住人はそのまま残ります。選ばなかった住人との関係も、名前でつながります。</p>' +
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
  /* 欄ごとに、この箱庭・この顔ぶれ・この設定で起きうるかを添える（起きないときだけ薄くする）。判定は content-events-r18.js の HK.Content.judge。参加者だけを見る */
  function ctCx() {
    var sc = HK.SCENARIOS[S.scenId], env = {}, hv = (HK.GLOBAL_ENV || []).filter(function (e) { return e.id === 'heavy'; })[0];
    try { if (sc) genv(sc).forEach(function (e) { env[e.id] = envVal(e, S.scenId); }); } catch (e) { /* 読み込み前の箱庭 */ }
    if (hv) env.heavy = envVal(hv, S.scenId);
    return { scenId: S.scenId, chars: joined(S.scenId), ties: S.ties || [], env: env, ct: (S.glob && S.glob.ct) || {}, pickOf: function (c) { var p = S.per && S.per[c.id] && S.per[c.id][S.scenId]; return p && p.pick; } };
  }
  function ctNote(id, cx) {
    var r = null; try { r = HK.Content.judge ? HK.Content.judge(id, cx) : null; } catch (e) { r = null; }
    if (!r || !r.t) return { off: !!(r && r.s === 'no'), t: '' };
    return { off: r.s === 'no', t: (r.s === 'yes' ? 'この顔ぶれで起きます：' : r.s === 'maybe' ? '条件しだいで起きます：' : /^(展開の重さ|「合意)/.test(r.t) ? 'いまの設定では起きません：' : 'この箱庭・この顔ぶれでは起きません：') + r.t };
  }
  function ctItems() {
    var m = (S.glob && S.glob.ct) || {}, cx = ctCx();
    return HK.Content.TAGS.map(function (t) {
      var n = ctNote(t.id, cx), dim = n.off ? ' style="opacity:.45"' : '';
      return '<label data-ct="' + t.id + '" title="' + esc(t.desc) + '" style="flex-basis:100%"><input type="checkbox" data-f="ct" data-k="' + t.id + '"' + (m[t.id] ? ' checked' : '') + dim + '> <span class="ctn"' + dim + '>' + esc(t.label) + '</span>' +
        '<span class="' + ctCls(n) + '" style="display:inline;margin-left:6px">' + esc(n.t) + '</span></label>';
    }).join('');
  }
  /* 「起きません」の注記は、体の関係にならない組と同じ色の小さな帯にする（ui-env.js の HK.NgBand.ctCls。文は変えない） */
  function ctCls(n) { return HK.NgBand ? HK.NgBand.ctCls(n.off, n.t) : 'desc ctw'; }
  /* 参加者・関係・設定を変えたら、注記と薄さだけをその場で書き換える（チェックの欄は作り直さない） */
  function updCtWhy() {
    var b = document.querySelector('#view-box .ctbox');
    if (!b || !HK.Content || HK.SAFE_ON) return;
    var cx = ctCx();
    Array.prototype.forEach.call(b.querySelectorAll('label[data-ct]'), function (l) {
      var n = ctNote(l.getAttribute('data-ct'), cx), op = n.off ? '.45' : '', i = l.querySelector('input'), sp = l.querySelector('.ctn'), w = l.querySelector('.ctw');
      if (i) i.style.opacity = op; if (sp) sp.style.opacity = op; if (w && w.textContent !== n.t) w.textContent = n.t; if (w && w.className !== ctCls(n)) w.className = ctCls(n);
    });
  }
  function contentBox() {
    if (!HK.Content || HK.SAFE_ON) return '';
    var h = envHelp({ id: 'ct', label: '内容のスイッチ', desc: '入れたものだけが起きます。切のときは、その場面を起こさないか、やわらかい分岐に替えます。エロトラップダンジョンなどR18が中心の箱庭では「合意のない展開」は常に入です。' + CT_MORE });
    return '<div class="envitem wide"><div class="lab"><span class="labt"><span>内容のスイッチ（全箱庭で共通・初期はすべて切）</span>' + h.q + '</span></div>' + h.d + '<div class="ctbox">' + ctItems() + '</div></div>';
  }
  /* 環境値の説明 e.desc は、ラベルの横の「？」にしまう（押すと欄の下に開く・title にも全文。ui-env.js の HK.EnvHelp。2026-10-28 利用者の指示）。
     e.desc はすべて固定の文（住人の設定では変わらない）。住人で変わる文（内容のスイッチの注記・三人の場面の事前の表示など）は別の口で、見えたまま */
  function envHelp(e) {
    var H = HK.EnvHelp, k = 'env-' + e.id;
    if (!H) return { q: '', d: e.desc ? '<div class="desc">' + esc(e.desc) + '</div>' : '' };
    return { q: H.q(k, e.label, e.desc), d: H.body(k, e.desc) };
  }
  function envItem(e, scenId) {
    var v = envVal(e, scenId), g = HK.GLOBAL_ENV.indexOf(e) >= 0 ? '1' : '0', h = envHelp(e);
    if (e.type === 'text') {
      return '<div class="envitem wide"><div class="lab"><span class="labt"><label for="env-' + e.id + '">' + esc(e.label) + '</label>' + h.q + '</span></div><input type="text" id="env-' + e.id + '" data-f="env" data-g="' + g + '" data-k="' + e.id + '" value="' + esc(v) + '" placeholder="' + esc(e.placeholder || '') + '" maxlength="60" style="width:100%;margin-top:4px">' + h.d + '</div>';
    }
    if (e.type === 'select') {
      return '<div class="envitem"><div class="lab"><span class="labt"><span>' + esc(e.label) + '</span>' + h.q + '</span></div><select id="env-' + e.id + '" data-f="env" data-g="' + g + '" data-k="' + e.id + '">' +
        e.options.map(function (o) { return '<option value="' + esc(o.v) + '"' + (o.v === v ? ' selected' : '') + '>' + esc(o.label) + '</option>'; }).join('') + '</select>' + h.d + '</div>';
    }
    return '<div class="envitem"><div class="lab"><span class="labt"><label for="env-' + e.id + '">' + esc(e.label) + '</label>' + h.q + '</span><span class="num" id="ev-' + e.id + '">' + v + (e.unit || '') + '</span></div>' +
      '<input type="range" id="env-' + e.id + '" min="' + e.min + '" max="' + e.max + '" step="1" value="' + v + '" data-f="env" data-g="' + g + '" data-k="' + e.id + '" data-unit="' + (e.unit || '') + '">' +
      '<div class="ends"><span>' + esc(e.lo || '') + '</span><span>' + esc(e.hi || '') + '</span></div>' + h.d + '</div>';
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

  /* カードの表（キャッチコピーの代わり・概要・R18 の描写の注記）は js/scen-meta.js の HK.ScenMeta（目録にも写す。2026-10-27） */
  /* 注意書きはカードでは短い札にしてタグの列に入れる（全文は札とカードの title に）。
     R18版の「※成人として扱います」はカードに付けず、一覧の見出しの横に1行だけ（2026-10-27）。未成年の職業を選べる箱庭の注記は、選んだカードの中に出す */
  var ADULT_NOTE = '※成人として扱います';
  function cardNote(n) {
    var m = n && n.match(/※([^。]*?)(?:の描写|表現)/);
    if (n && /パロディ/.test(n)) return (n.match(/『[^』]+』/) || ['パロディ'])[0] + (/『/.test(n) ? 'のパロディ' : '');
    return m ? m[1].replace(/（[^）]*）/, '') + 'の描写あり' : '';
  }
  function scenR18(s, id) {
    var env = (s.env || []).filter(function (e) { return /R-?18/.test(e.label || ''); }).map(function (e) { return '「' + e.label.replace(/（R-?18）/, '') + '」'; });
    if (env.length) return '設定' + env[0] + (env.length > 1 ? 'など' : '') + 'で描写あり';
    var rp = ((HK.ScenMeta && HK.ScenMeta.r18plot) || {})[id];
    return rp ? rp + 'に描写あり' : '';
  }
  /* 箱庭タブ：選んだ箱庭の本体がまだなら読み込み、読み終えたら描き直す（load.js）。失敗はカードに「もう一度」 */
  var boxBusy = {}, boxErr = {};
  function boxLoad(id, wasStub) {
    if (!HK.Load || !HK.Load.manifest || boxBusy[id] || boxErr[id]) return;
    boxBusy[id] = 1;
    HK.Load.ensure(id).then(function () {
      delete boxBusy[id];
      if (scenStub(id)) boxErr[id] = { reason: 'broken' };   /* 読み終えたのに本体が登録されていない */
      if (tab !== 'box' || S.scenId !== id) return;
      /* 描き直す（族のかたまりで全箱庭共通の環境値・欄が増えることがある）。文字を入力中の欄があれば、カードの印だけ外し、欄を離れてから描き直す */
      var ae = document.activeElement, typing = !wasStub && !boxErr[id] && ae && ae.closest && ae.closest('#view-box') && (ae.tagName === 'TEXTAREA' || (ae.tagName === 'INPUT' && /^(text|number|search)$/.test(ae.type)));
      if (!typing) { boxRedraw(); return; }
      Array.prototype.forEach.call(document.querySelectorAll('#view-box .scload'), function (x) { x.remove(); });
      ae.addEventListener('blur', function () { setTimeout(function () { if (tab === 'box' && S.scenId === id) boxRedraw(); }, 0); }, { once: true });
    }, function (e) {
      delete boxBusy[id]; boxErr[id] = e || { reason: 'net' };
      if (e && e.reason === 'stale' && HK.Load.staleNotice) HK.Load.staleNotice();
      if (tab === 'box' && S.scenId === id) boxRedraw();
    });
  }
  /* 描き直しても、見ている位置と選んでいた欄を保つ */
  function boxRedraw() {
    var y = window.pageYOffset, ae = document.activeElement, fid = ae && ae.id;
    renderBox();
    if (Math.abs(window.pageYOffset - y) > 1) window.scrollTo(0, y);
    var el = fid && document.getElementById(fid);
    if (el && el !== document.activeElement && el.focus) { try { el.focus({ preventScroll: true }); } catch (x) { el.focus(); } }
  }
  function scLoadBadge(id) {
    var e = boxErr[id];
    if (e) return '<span class="scload ng" role="status">読み込めませんでした<button type="button" data-act="scenretry">もう一度</button></span>';
    return '<span class="scload" role="status">読み込み中…</span>';
  }
  /* データの先読みの設定（load.js の HK.Load.pref。http(s) で配っているときだけ。file:// は手元のファイルなので先読みしない） */
  function prefRow() {
    if (!HK.Load || !HK.Load.manifest || !HK.Load.setPref || !/^https?:$/.test(location.protocol)) return '';
    var v = HK.Load.pref(), o = function (k, l) { return '<option value="' + k + '"' + (v === k ? ' selected' : '') + '>' + l + '</option>'; };
    return '<p class="hint prefrow"><label for="prefetch">データの先読み</label><select id="prefetch" data-f="prefetch">' + o('auto', '自動（おすすめ）') + o('all', 'すべて先読み') + o('pick', '選んだ箱庭だけ') + '</select>' +
      '<span>パソコンでは裏で先に読み込みます。スマホでは選んだ箱庭だけ読みます</span></p>';
  }
  function runBar() {
    return '<div class="runbar nofold"><label for="seed">シード</label><input type="text" id="seed" inputmode="numeric" data-f="seed" value="' + esc(S.seed) + '" placeholder="空欄でランダム"><span class="hint" style="margin:0">同じシードと条件なら同じ結末になります。</span><span class="spacer"></span><button class="btn primary" data-act="run">箱庭を動かす</button></div>';
  }
  /* 描き方は js/ui-box-draw.js（HK.BoxDraw）：節ごとに覚えて変わった節だけ作り直す。opt.defer（タブを押した・箱庭を選び替えた）はカードだけ先に描き、残りは次の描画のあとで */
  function renderBox(opt) {
    var scen = scenOf(S.scenId);
    var wait = !!(scen && scen.stub);
    var loadSel = !!(HK.Load && HK.Load.manifest && !HK.Load.has(S.scenId));
    if (loadSel) boxLoad(S.scenId, wait);
    /* 同じ箱庭が二重に登録されても、一覧には一度だけ出す */
    HK.SCEN_ORDER = HK.SCEN_ORDER.filter(function (x, i, arr) { return arr.indexOf(x) === i && (HK.SCENARIOS[x] || (HK.Load && HK.Load.meta && HK.Load.meta(x))); });
    /* 並び：成人向け（R18版）では、ダンジョンRPGと人狼をゾンビの街のすぐ後ろに置く */
    var order = HK.SCEN_ORDER.slice();
    if (!HK.SAFE_ON && order.indexOf('zombie') >= 0) {
      var mv = ['rpg', 'jinro'].filter(function (x) { return order.indexOf(x) >= 0; });
      order = order.filter(function (x) { return mv.indexOf(x) < 0; });
      order.splice.apply(order, [order.indexOf('zombie') + 1, 0].concat(mv));
    }
    /* カードの HTML は、選択と読み込み中の印を除いて箱庭ごとに1回だけ作る（かたまり・TIPS を読んだら作り直す） */
    var ckey = (HK.Load ? HK.Load.gen : 0) + '|' + !!HK.SAFE_ON + '|' + Object.keys(HK.TIPS_SCEN || {}).length;
    var cards = order.map(function (id) { return BD ? BD.card(id, ckey, function () { return cardOf(id, false); }) : cardOf(id, true); }).join('');
    /* カード：肩見出し＋人数・名前（R18 の札）・短い説明の3行。選んだカードだけに長い説明・タグ（PC は選んでいなくても1行）・注記・TIPS を出す（CSS の .scen.on で出し入れ。カードの HTML は選択によらず同じ） */
    function cardOf(id, mark) {
      var s = scenOf(id), SM = HK.ScenMeta || {};
      /* 成人向けの箱庭は、名前の右の R18 の札でひと目で分かるようにする */
      var adult = !HK.SAFE_ON && /R-?18/.test(s.kicker || '');
      /* キャッチコピーに手書きで混ざった人数・R18 は外し、人数は肩見出しの右にそろえて出す */
      var kt = String(s.kicker || '').replace(/（\d+(?:〜\d+)?人）/, '').replace(/^\d+(?:〜\d+)?人・/, '').replace(/・?R-?18/, '').replace(/^ソロ(?:（[^）]*）)?・?/, '').replace(/^・|・$/g, '');
      if (!kt) kt = (SM.kicker && SM.kicker[id]) || '';
      var lo = smin(id), hi = smax(id), cnt = lo === hi ? lo + '人' : lo + '〜' + hi + '人';
      var pick = function (v) { return Array.isArray(v) ? v[HK.SAFE_ON ? 0 : 1] : v; };
      var cl = pick((SM.descLong || {})[id]) || s.desc, cd = pick((SM.desc || {})[id]) || cl;
      var snote = HK.SAFE_ON ? String(s.note || '').replace(/[^。]*成人として扱[^。]*。?/g, '').replace(/^※\s*$/, '').trim() : s.note, full = cl + (snote ? '\n' + snote : '') + (HK.SAFE_ON || /成人として扱/.test(s.note || '') ? '' : '\n※登場人物はすべて成人として扱います。');
      /* タグの列の先頭に足す札：R18 の描写が入る条件（R18版の、常には R18 でない箱庭）と、注意書き（死の描写・パロディなど） */
      var pre = [], r18s = !HK.SAFE_ON && !adult ? scenR18(s, id) : '', nh = cardNote(s.note);
      if (r18s) pre.push({ html: '<span class="r18tag">R18</span>' + esc(r18s), text: r18s, extra: 34, title: 'R18：' + r18s });
      if (nh) pre.push({ html: esc(nh), text: nh, title: snote || nh, warn: true });
      var minor = !HK.SAFE_ON && /未成年/.test(s.note || '') ? '<div class="note">※未成年の職業を選んだ人以外は成人として扱います</div>' : '';
      var on = mark && id === S.scenId;
      return '<label class="scen' + (adult ? ' adult' : '') + (on ? ' on' : '') + '" title="' + esc(full) + '"><input type="radio" name="scen" id="sc-' + id + '" value="' + id + '" data-f="scen"' + (on ? ' checked' : '') + '>' + ((wait || loadSel) && on ? scLoadBadge(id) : '') +
        '<div class="k"><span class="kt">' + esc(kt) + '</span><span class="kn">' + cnt + '</span></div><div class="n">' + esc(s.name) + (adult ? '<span class="r18tag">R18</span>' : '') + '</div>' +
        '<div class="d' + (cl !== cd ? ' hasl' : '') + '">' + esc(cd) + '</div>' + (cl !== cd ? '<div class="dl">' + esc(cl) + '</div>' : '') +
        (HK.ScenTags ? HK.ScenTags.html(id, esc, pre) : '') + minor + (HK.Tips ? HK.Tips.scenBtn(id) : '') + '</label>';
    }
    /* 全年齢版：R-18版の販売ページへの欄（URLは js/share-card.js の CONF.r18Url＝BOOTH・CONF.noteUrl＝note） */
    if (HK.SAFE_ON && HK.CONF && HK.CONF.r18Url) cards += '<div class="scen r18link" title="エロトラップダンジョン・感覚遮断穴・常識改変・サキュバスの一夜・エロバラエティ番組を追加。夜の場面もぼかさずに描きます。">' +
      '<div class="k">BOOTH・noteで頒布中・18歳以上向け</div><div class="n">R-18版</div><div class="d">成人向けの箱庭を5つ追加。夜の場面もぼかさずに描きます。</div>' +
      '<div class="r18buy"><a href="' + esc(HK.CONF.r18Url) + '" target="_blank" rel="noopener">BOOTHで買う ↗</a>' + (HK.CONF.noteUrl ? '<a href="' + esc(HK.CONF.noteUrl) + '" target="_blank" rel="noopener">noteで買う ↗</a>' : '') + '</div></div>';
    /* R18版は「※成人として扱います」を見出しの横に1行だけ（文字は CSS の attr で出す：折りたたみの開閉の覚えは見出しの文字で引くので、文字を変えない） */
    var head = '<h2 class="sec">箱庭を選ぶ' + (HK.SAFE_ON ? '' : '<span class="secnote" data-note="' + ADULT_NOTE + '"></span>') + '</h2><div class="scens">' + cards + '</div>' + prefRow();
    if (wait) {
      var we = boxErr[S.scenId];
      drawBox([{ k: 'cards', html: head }, { k: 'run', html: runBar() }], opt, '<div class="boxwait"' + (we ? '' : ' aria-busy="true"') + '>' + (we ? '<p>「' + esc(scen.name) + '」のデータを読み込めませんでした' + (we.reason === 'offline' ? '（通信できないため読み込めません）' : '') + '</p><p><button type="button" class="btn small" data-act="scenretry">もう一度</button></p>' :
          '<p>「' + esc(scen.name) + '」のデータを読み込んでいます…</p><p class="hint" style="margin:0">読み込み中に「箱庭を動かす」を押すと、読み終わりしだい動かします。</p>') + '</div>', wait || loadSel);
      return;
    }
    var derived = (scen.derived || []).map(function (k) { return '<span class="chip" title="' + esc(HK.TRAIT_SRC[k]) + '">' + esc(HK.TRAIT_NAME[k]) + '<span class="nums">' + esc(HK.TRAIT_SRC[k]) + '</span></span>'; }).join('');
    var extra = (scen.stats || []).map(function (s) { return '<span class="chip" title="' + esc(s.desc) + '">' + esc(s.label) + '</span>'; }).join('') + (scen.weapons ? '<span class="chip">支給武器</span>' : '');
    var sexCols = S.scenId === 'goukon' || S.scenId === 'omega';
    var pfs = scen.perFields || [];
    /* 最初の行動・短期目標：選べるものがない箱庭（物語型の宇宙船漂流記・吹雪の館など）では、見出しと列を出さない */
    var hasAct = !!(scen.actions && scen.actions.length), hasGoal = !!(scen.goals && scen.goals.length);
    /* 箱庭をまたいで共通の能力値・欄（shared-stats.js）は、見出しに ＊ を付けて説明を添える */
    var shn = function (id, pick) { return HK.Shared ? HK.Shared.headNote(S.scenId, id, pick) : ''; };
    var statHead = (scen.stats || []).map(function (s) { var n = shn(s.id, false), sc = HK.Shared && HK.Shared.scale ? HK.Shared.scale(S.scenId, s.id) : ''; return '<th title="' + esc(s.desc + (sc ? ' ' + sc : '') + (n ? ' ' + n : '')) + '">' + esc(s.label) + (n ? '<span class="shmark" aria-label="共通の値">＊</span>' : '') + '</th>'; }).join('') + (scen.weapons ? '<th>武器</th>' : '') + pfs.map(function (f) { var n = shn(f.id, true); return '<th' + (n ? ' title="' + esc(n) + '"' : '') + '>' + esc(f.label) + (n ? '<span class="shmark" aria-label="共通の値">＊</span>' : '') + '</th>'; }).join('') + (sexCols ? '<th>性別</th><th>恋愛対象</th>' : '');
    var J = joined(S.scenId), jmax = smax(S.scenId);
    /* 住人が多いとき（41人以上）は、参加しない人の行を軽くする（設定の欄は、参加にすると出る。住人200人でも箱庭タブが重くならないように） */
    var lazyBox = S.chars.length > 40, nCols = (hasAct ? 1 : 0) + (hasGoal ? 1 : 0) + (scen.stats || []).length + (scen.weapons ? 1 : 0) + pfs.length + (sexCols ? 2 : 0);
    var rowOf = function (c, i) {
      var on = J.indexOf(c) >= 0;
      if (!on && lazyBox) return '<tr class="off lazy"><td><input type="checkbox" id="jn-' + c.id + '" data-f="join" data-id="' + c.id + '" aria-label="' + esc(c.name) + 'を参加させる"></td><td><span class="row" style="flex-wrap:nowrap"><span class="dot" style="background:var(--p' + i + ')"></span><b>' + esc(c.name) + '</b>' + (c.group ? '<span class="grptag">' + esc(grpList(c).join('・')) + '</span>' : '') + '</span></td>' + (nCols ? '<td colspan="' + nCols + '" class="hint" style="font-size:12px;margin:0;white-space:nowrap">参加にすると、ここで設定できます</td>' : '') + '</tr>';
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
    };
    /* 住人が多いときは、グループごとの折りたたみ・名前で探す・選んでいる人だけ（ui-cast-pages.js）。参加している人はいつも出す */
    var rows = lazyBox && CP ? CP.boxRows(rowOf, J, 2 + nCols).split(/(?=<tr[\s>])/) : S.chars.map(rowOf);

    var segs = [{ k: 'cards', html: head }, { k: 'env', html: '<h2 class="sec">環境値' + (HK.Tips ? HK.Tips.btn('env') : '') + ' <span class="envbtns"><button type="button" class="mini" data-act="envreset" title="この箱庭の環境値を初期値に戻す">初期値に戻す</button><button type="button" class="mini" data-act="envrand" title="環境値をランダムに決める（文字の項目はそのまま）">ランダム</button></span></h2><div class="panel">' + (S.scenId === 'whiteroom' ? '<p class="roomlabel" id="roomlabel">「' + esc(HK.roomLabel(envNow())) + '」</p>' : '') + '<div class="envgrid">' + genv(scen).map(function (e) { return envItem(e, S.scenId); }).join('') + contentBox() + '</div></div>' },
      { k: 'uses', html: '<h2 class="sec">この箱庭で効くもの' + (HK.Tips ? HK.Tips.btn('uses') : '') + '</h2>' +
      '<div class="uses">' + derived + '</div><div class="uses" style="margin-top:6px">' + extra + '</div>' },
      { k: 'per', html: '<h2 class="sec">' + (!hasAct && !hasGoal ? (scen.solo ? '挑戦者の設定' : '住人ごとの設定') : scen.solo ? '挑戦者と方針' : '住人ごとの初動と目標') + (HK.Tips ? HK.Tips.btn('perchar') : '') + '</h2>' +
      (scen.castHint || scen.solo ? '<p class="hint">' + (scen.castHint ? esc(scen.castHint) : 'この箱庭は一人用です。チェックを入れた住人が挑みます。' + (HK.SAFE_ON ? '' : '登場人物はすべて成人として扱います。')) + '</p>' : '') +
      (S.chars.length ? '<p class="hint" id="joincount">参加 <b class="num">' + J.length + '</b> / 上限 ' + jmax + '人' + (S.chars.length > jmax ? '　この箱庭は' + jmax + '人までです。チェックで参加者を選んでください。' : '') + '</p>' + loveCrowdNote(S.scenId) + '<div class="row" style="margin-bottom:8px"><button class="btn small" data-act="joinall">全員を参加</button><button class="btn small" data-act="joinnone">全員を外す</button>' + (groupsOf().length ? '<button class="btn small ghost" data-act="sortgrp">グループ順に並べる</button>' : '') + '</div>' + randRow(jmax) + (groupsOf().length ? '<div class="row grpjoin" style="margin-bottom:8px;gap:6px"><span class="hint" style="margin:0">グループで選ぶ：</span>' + groupsOf().map(function (g) { var n = S.chars.filter(function (c) { return inGrp(c, g); }).length; return '<span class="grpchip"><button class="btn small" data-act="joingrp" data-g="' + esc(g) + '" title="このグループだけを参加させる">' + esc(g) + '（' + n + '）</button><button class="btn small ghost" data-act="joingrpadd" data-g="' + esc(g) + '" title="このグループを参加に加える" aria-label="' + esc(g) + 'を参加に加える">＋</button><button class="btn small ghost" data-act="joingrpdel" data-g="' + esc(g) + '" title="このグループを参加から外す" aria-label="' + esc(g) + 'を参加から外す">−</button></span>'; }).join('') + '</div>' : '') + (lazyBox && CP ? CP.boxTools() : '') + '<div class="tblwrap"><table class="per"><thead><tr><th>参加</th><th>住人</th>' + (hasAct ? '<th>最初の行動</th>' : '') + (hasGoal ? '<th>短期目標</th>' : '') + statHead + '</tr></thead><tbody><!--rows--></tbody></table></div>' : '<p class="hint">住人がいません。「住人」タブで登録してください。</p>') +
      (S.scenId === 'omega' && S.chars.length ? '<p class="hint" style="margin-top:8px">第二性・スイッチ・職業・フェロモンの匂い・探偵バディ・運命の番のしくみは、カードの「この箱庭のTIPS」にあります。</p>' : '') +
      (sexCols && S.chars.length ? '<p class="hint" style="margin-top:8px">性別と恋愛対象は、住人タブの各住人の「設定」と同じものです。</p>' : '') +
      (S.scenId === 'classroom' && S.chars.length && HK.CastTeacher ? HK.CastTeacher.selectHtml(S) : '') },
      { k: 'run', html: runBar() }];
    /* 参加表は行ごとに分けて渡す（変わった行だけ入れ替える。住人の名前などは esc 済みなので <!-- は表の位置にしか無い） */
    var pp = segs[3].html.split('<!--rows-->');   /* 3：参加表（もとの「高度設定」の節は 2026-10-28 に住人タブの「口調・喘ぎの設定」へ移した） */
    segs[3] = pp.length === 2 ? { k: 'per', pre: pp[0], rows: rows, post: pp[1] } : { k: 'per', html: pp.join(rows.join('')) };
    drawBox(segs.filter(function (x) { return x.html || x.rows; }), opt, '', loadSel);
  }
  function drawBox(segs, opt, tail, badge) {
    var vb = $('#view-box'), after = function () { if (CP) CP.after(vb); };
    if (!BD) { vb.innerHTML = segs[0].html + tail + segs.slice(1).map(function (x) { return x.rows ? x.pre + x.rows.join('') + x.post : x.html; }).join(''); after(); return; }
    BD.draw(vb, segs, { defer: !!(opt && opt.defer), sel: S.scenId, badge: badge ? scLoadBadge(S.scenId) : '', tail: tail, after: after, live: function () { return tab === 'box'; } });
  }

  /* 人数を決めてランダムに参加者を選ぶ（対象は全員か、グループ一つ） */
  function randRow(jmax) {
    var gs = groupsOf(), from = S.randFrom && gs.indexOf(S.randFrom) >= 0 ? S.randFrom : '';
    var pool = S.chars.filter(function (c) { return !from || inGrp(c, from); }).length, mx = Math.min(jmax, pool), mn = Math.min(smin(S.scenId), mx);
    var n = HK.clamp(+S.randN || Math.min(mx, Math.max(mn, 4)), mn, mx);
    return '<div class="row randjoin" style="margin-bottom:8px;gap:6px;flex-wrap:wrap"><span class="hint" style="margin:0">ランダムに選ぶ：</span>' +
      (gs.length ? '<select id="randfrom" data-f="randfrom" aria-label="ランダムに選ぶ対象" style="max-width:100%"><option value="">住人全員から</option>' + gs.map(function (g) { return '<option value="' + esc(g) + '"' + (g === from ? ' selected' : '') + '>【' + esc(g) + '】から</option>'; }).join('') + '</select>' : '') +
      '<input type="number" id="randn" data-f="randn" min="' + mn + '" max="' + mx + '" value="' + n + '" inputmode="numeric" style="width:4.5em" aria-label="ランダムに選ぶ人数"><span class="hint" style="margin:0">人</span>' +
      '<button class="btn small" data-act="joinrand" style="flex:none;white-space:nowrap"' + (mx < 1 ? ' disabled' : '') + '>ランダムに選ぶ</button></div>';
  }
  function envNow() {
    var env = {};
    HK.SCENARIOS[S.scenId].env.forEach(function (e) { env[e.id] = envVal(e, S.scenId); });
    return env;
  }

  /* ---------- 実行 ---------- */
  /* クラスメイトの先生（「担任の先生」と参加表の「先生（受け持ち）」。名簿の後ろに回す）は ui-cast-teacher.js */
  function isTeacher(c, id) { return !!HK.CastTeacher && HK.CastTeacher.isTeacher(S, c, id, per); }
  function castFor(id) { return HK.CastTeacher ? HK.CastTeacher.order(S, joined(id), id, per) : joined(id); }
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
          var o = { name: c.name, eg: c.eg, memo: c.memo, gender: c.gender || '', likes: c.likes || '', tone: c.tone || '', fp: c.fp || '', toneCustom: c.toneCustom || '', pos: c.pos || '', futa: !!c.futa, daku: !!c.daku, faithful: !!c.faithful, noR18: !!c.noR18, posNpc: HK.Pos ? HK.Pos.npcValid(c.posNpc) : '', alcohol: HK.ALC_OK(c.alcohol) ? +c.alcohol : '', partWords: c.partWords || '', partM: c.partM || '', partF: c.partF || '', color: c.color || '', call: c.call || '', callG: c.callG || null, bmonth: c.bmonth || '', age: c.age || '', keigoOlder: !!c.keigoOlder, you: c.you || '', marks: c.marks || '', calls: calls, keigo: keigo, loveLock: lockIdx(c.loveLock), sexLock: c.sexLock === 'any' ? c.sexLock : c.sexLock === 'pick' || c.sexLock === 'pickMob' ? lockIdx(c.sexLocks) : '', sexLockMob: c.sexLock === 'pickMob' && idList(c.sexLocks).length > 0, loveNG: (c.loveNG || []).map(function (k) { return ids.indexOf(k); }).filter(function (x) { return x >= 0; }) };
          /* 喘ぎの口調（R18版。全年齢モードでは渡さない） */
          if (!HK.SAFE_ON) ['moanTone', 'moanDict', 'moanDictT', 'moanFit'].forEach(function (k) { if (c[k]) o[k] = c[k]; });
          return HK.Attr ? HK.Attr.toInput(o, c, ids) : o;
        });
      })(),
      perChar: castFor(S.scenId).map(function (c) {
        var p = per(c, S.scenId);
        return { action: p.action, goal: p.goal, stats: JSON.parse(JSON.stringify(p.stats || {})), weapon: p.weapon, pick: JSON.parse(JSON.stringify(p.pick || {})), role: isTeacher(c, S.scenId) ? 'teacher' : '' };
      }),
      ties: (function () {
        cleanTies();
        var J = castFor(S.scenId).map(function (c) { return c.id; });
        var out = S.ties.filter(function (t) { return J.indexOf(t.a) >= 0 && J.indexOf(t.b) >= 0; }).map(function (t) {
          var o = { a: J.indexOf(t.a), b: J.indexOf(t.b), type: t.type, cold: HK.coldOpts && HK.coldOpts(t.type) ? t.cold || '' : '', love: t.love === 'ok' || t.love === 'no' ? t.love : '' };
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
        return HK.tiePastCompact ? HK.tiePastCompact(out) : out;   /* 組の過去は一組に一か所（ties.js） */
      })()
    };
  }

  function summarize(res) {
    if (res.solo) return res.summary;
    var top = res.pairs.filter(function (p) { return p.label !== 'strangers'; }).slice(0, 2);
    return top.map(function (p) { return (HK.pairName ? HK.pairName(res, p) : res.chars[p.a].name + '×' + res.chars[p.b].name) + '＝' + p.name; }).join('、');
  }

  /* あとで読む分（js/bundle-late.js）がまだのうちに動かそうとしたら、読み終わるのを待ってから動かす */
  /* 分割読み込み（js/load.js の HK.Load）：箱庭の本体のかたまりも、読み終えてから使う。
     動かす・回し直すは「箱庭のかたまり＋あとで読む分（late・tone-base）＋配役の口調のかたまり（tones：住人の配列か動かす入力。HK.Load.ensureTones）」、
     残した結果を開くは「箱庭のかたまり」だけを待つ（結果は記録済みなので口調は要らない）。
     待つのは最後に頼んだ1つだけ（前の待ちは捨てる）。目録の無い古い形（HK.Load.manifest が無い）では、いつもすぐ続ける */
  function scenStub(id) { return !HK.SCENARIOS[id] && !!(HK.Load && HK.Load.meta && HK.Load.meta(id)); }
  function ready(id, scenOnly, tones) {
    return (scenOnly || HK.LATE_READY !== false) && (!HK.Load || HK.Load.has(id)) && (scenOnly || !tones || !HK.Load || !HK.Load.tonesReady || HK.Load.tonesReady(tones));
  }
  var pending = null;
  function whenReady(id, fn, msg, scenOnly, tones) {
    if (ready(id, scenOnly, tones)) { pending = null; goReady(fn, id); return; }
    var p = pending = { id: id, fn: fn, scenOnly: !!scenOnly, tones: scenOnly ? null : tones || null };
    toast(msg || 'データを読み込んでいます。終わりしだい動かします…');
    if (HK.Load && HK.Load.manifest) Promise.all([HK.Load.ensure(id), p.tones && HK.Load.ensureTones ? HK.Load.ensureTones(p.tones) : null]).then(function () { flushPending(p); }, function (e) {
      if (pending !== p) return;
      pending = null;
      loadFail(e, function () { whenReady(id, fn, msg, scenOnly, tones); });
    });
  }
  function goReady(fn, id) {
    /* 読み終えたのに仮の箱庭のまま（本体が登録されなかった）なら、落ちないように止めて知らせる */
    if (scenStub(id)) { loadFail({ reason: 'broken' }, null); return; }
    fn();
  }
  function flushPending(p) {
    if (!p || pending !== p || !ready(p.id, p.scenOnly, p.tones)) return;
    pending = null;
    goReady(p.fn, p.id);
  }
  /* 読み込めなかったときの知らせ（画面の下に残す。「もう一度」で読み直す）。新しい版が出ていたときは load.js の知らせ（画面の上）を出す */
  function loadFail(e, retry) {
    if (e && e.reason === 'stale') { if (HK.Load && HK.Load.staleNotice) HK.Load.staleNotice(); return; }
    var old = document.getElementById('loadfail'); if (old) old.remove();
    var why = e && e.reason === 'offline' ? '（通信できないため読み込めません）' : e && e.reason === 'broken' ? '（ページを読み込み直してください）' : '';
    var d = document.createElement('div');
    d.id = 'loadfail'; d.setAttribute('role', 'alert');
    d.innerHTML = '<span>' + (e && /^tone-/.test(e.chunk || '') ? '口調のデータ' : 'この箱庭のデータ') + 'を読み込めませんでした' + why + '</span>' + (retry ? '<button type="button" class="btn small primary" data-lf="retry">もう一度</button>' : '') +
      '<button type="button" class="btn small ghost" data-lf="close" aria-label="閉じる">×</button>';
    d.addEventListener('click', function (ev) {
      var b = ev.target.closest('[data-lf]');
      if (!b) return;
      d.remove();
      if (b.dataset.lf === 'retry' && retry) retry();
    });
    document.body.appendChild(d);
  }
  HK.onLate = function () {
    if (HK.LATE_FAILED) toast('データの一部を読み込めませんでした。ページを読み込み直してください');
    if (tab === 'cast') renderCast(); else if (tab === 'box') boxRedraw();
    flushPending(pending);
  };
  /* onRes：描画の前に結果を渡す（履歴に結果を置く写しは、描画より前に取る。結末の組み立て HK.Endings.build は結果を書き換えないが、念のため） */
  function simulate(input, record, onRes) {
    if (!ready(input && input.scenId, false, input)) { whenReady(input && input.scenId, function () { simulate(input, record, onRes); }, null, false, input); return null; }
    var res;
    try { res = HK.simulate(input); }
    catch (err) { toast('シミュレーション中にエラーが起きました：' + err.message); if (window.console) console.error(err); return null; }
    res.input = input;
    /* 版の印（saves.js の HK.VerMark）：セーブ・履歴に残し、開いたときに「保存時の版」として出す */
    if (HK.VerMark && !res.ver) res.ver = HK.VerMark.now(); if (HK.Adv && HK.Adv.pin) HK.Adv.pin(res);   /* 動かしたときの高度設定（セーブ・履歴の adv。ui-adv.js） */
    result = res; showAll = false; opened = null;
    V.resetFilter();
    if (record) {
      histNote = ''; histCur = null;
      var h = { id: histId(), t: Date.now(), scenName: HK.SCENARIOS[input.scenId].name, names: input.chars.map(function (c) { return c.name; }).join('・'), seed: input.seed, summary: summarize(res), input: input, ver: res.ver || null };
      hist.unshift(h);
      histSave();
      histKeep(h, res);
    }
    if (onRes) onRes(res);
    setTab('result');
    /* 箱庭を動かしたら、結果の頭（画面のいちばん上）から読めるように。スマホ・Safari ではシード欄のキーボードの収納や
       描き終わる前のずれで途中に飛ぶので、フォーカスを外し、すぐ・次のフレーム・少し後にも念を押して上へ戻す */
    if (record) {
      try { var ae = document.activeElement; if (ae && ae !== document.body && ae.blur) ae.blur(); } catch (e) { /* 外せなくてもよい */ }
      var toTop = function () { window.scrollTo(0, 0); if (document.documentElement) document.documentElement.scrollTop = 0; if (document.body) document.body.scrollTop = 0; };
      toTop();
      if (window.requestAnimationFrame) window.requestAnimationFrame(toTop);
      setTimeout(toTop, 150); setTimeout(toTop, 500);
    }
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
      if (ok) { h.r = 1; h.r18 = rec.r18; if (rec.adv) h.ad = 1; histSave(); return; }   /* ad：結果に高度設定（adv）も残した印（一覧の「高度設定あり」） */
      delete h.r; delete h.r18; histSave();
      toast('ブラウザの保存領域が足りないため、この結果を「これまでの箱庭」に残せませんでした（一覧からは開けません）。残したいときは「この結果をセーブ」か「JSONで書き出す」を使ってください');
    });
  }
  var HIST_MSG = { kept: '「これまでの箱庭」に残した結果を、動かしたときの内容のまま表示しています。', none: 'この履歴は結果が残っていないため開けません（保存時の版でのみ再現できます。以前の形式の履歴と、保存しきれなかった結果は開けません）。',
    r18: 'この履歴はR18モードで動かした結果なので、全年齢モードでは開けません（R18モードにすると開けます）。', z18: 'この履歴はR18版で動かした結果なので、全年齢版では開けません。' };
  /* 開けない履歴：知らせて、条件とシードを箱庭タブに写すかだけ聞く（写しても自動では動かさない） */
  function histNo(it, why) {
    if (!(it && it.input && Array.isArray(it.input.chars) && scenOf(it.input.scenId) && why === 'none')) toast(HIST_MSG[why]);
    else if (window.confirm(HIST_MSG[why] + '\n\n条件とシードを箱庭タブに写しますか？（写しても自動では動かしません。今の版で動かすと、保存時と結果が変わることがあります）')) copyCond(it.input);
  }
  function histOpen(it) {
    if (!it) return;
    /* R18モードで動かした結果は、全年齢モードでは出さない（開けない） */
    var lock = HK.SAFE_ON && it.r18;
    if (lock) { histNo(it, HK.SAFE_BUILD ? 'z18' : 'r18'); return; }
    /* 結果を置いていない履歴（以前の形式・置けなかったもの）は開けない。回し直さない */
    if (!(it.id && it.r && HK.History)) { histNo(it, 'none'); return; }
    /* 表示（結末の組み立て・一人用の表示）に箱庭のかたまりが要るので、読んでから開く */
    var hsid = it.input && it.input.scenId;
    if (!ready(hsid, true)) { whenReady(hsid, function () { histOpen(it); }, 'この箱庭のデータを読み込んでいます…', true); return; }
    HK.History.get(it.id).then(function (rec) {
      if (rec && rec.result && HK.SAFE_ON && rec.r18) { histNo(it, HK.SAFE_BUILD ? 'z18' : 'r18'); return; }
      if (!(rec && rec.result)) {
        /* 結果が見つからない（ブラウザが整理した・入りきらず落ちたなど）：一覧の記録は書き換えず、この画面でだけ「結果なし」の印を出す */
        if (histGone.indexOf(it) < 0) histGone.push(it); if (tab === 'result') renderResult();
        histNo(it, 'none');
        return;
      }
      result = rec.result;
      if (!result.input) result.input = it.input;
      if (!result.ver && (rec.ver || it.ver)) result.ver = rec.ver || it.ver;
      showAll = false; V.resetFilter();
      histNote = HIST_MSG.kept; histCur = it; opened = { from: 'hist', at: it.t, adv: rec.adv || null };   /* adv：記録の高度設定（開いた画面の要約と「高度設定を写す」。saves.js の HK.SavesAdv） */
      setTab('result');
    });
  }
  /* 結果の画面：履歴から開いたときの知らせ・保存時の版と、履歴の一覧の説明・印（結果なし・版。view.js の historyBlock に足す） */
  function histDeco(host) {
    if (result && histNote && !host.querySelector('#histnote')) {
      var html = '<p class="hint" id="histnote" role="status">' + esc(histNote) + '</p>';
      var hd = host.querySelector('.resulthead');
      if (hd) hd.insertAdjacentHTML('afterend', html); else host.insertAdjacentHTML('afterbegin', html);
    }
    /* セーブ・履歴から開いた結果：保存時の版を小さく出す（今の版と違えば、今の版で動かすと変わることがある旨も） */
    if (result && opened && HK.VerMark && !host.querySelector('#vernote')) {
      var vh = '<p class="hint small" id="vernote" style="margin:4px 0 0">保存時の版：' + esc(HK.VerMark.label(result.ver, opened.at)) + (HK.VerMark.same(result.ver) ? '' : '。保存した内容のまま表示しています（今の版で同じ条件を動かすと、結果が変わることがあります）') + '</p>', anchor = host.querySelector('#histnote') || host.querySelector('.resulthead');
      if (anchor) anchor.insertAdjacentHTML('afterend', vh); else host.insertAdjacentHTML('afterbegin', vh);
    }
    var box = host.querySelector('.hist');
    if (!box) return;
    var p = box.previousElementSibling;
    if (p && p.classList.contains('hint')) p.textContent = '開くと、動かしたときの結果をそのまま表示します（回し直しはしません）。結果が残っていない履歴（以前の形式・保存しきれなかったもの）は開けません。名簿は書き換えません。';
    Array.prototype.forEach.call(box.querySelectorAll('[data-act="hist"]'), function (b) {
      var it = hist[+b.dataset.k];
      if (!it) return;
      if ((!(it.id && it.r) || histGone.indexOf(it) >= 0) && histPend.indexOf(it) < 0) b.insertAdjacentHTML('beforeend', '<span class="nums">結果なし（開けません）</span>');
      else if (HK.VerMark && histPend.indexOf(it) < 0) b.insertAdjacentHTML('beforeend', '<span class="nums">' + esc(HK.VerMark.label(it.ver, it.t)) + '</span>');
    });
  }

  function run(newSeed) {
    var J = joined(S.scenId);
    var mn = smin(S.scenId);
    if (J.length < mn) { toast(mn === 1 ? '挑戦する住人を1人選んでください' : '参加する住人を' + mn + '人以上選んでください'); return; }
    if (J.length > smax(S.scenId)) { toast(scenOf(S.scenId).name + 'は' + smax(S.scenId) + '人までです。参加者を減らしてください'); return; }
    /* 箱庭のデータを読み込み中なら、読み終えてから動かす（そのあいだに別の箱庭を選んだら動かさない） */
    var rsid = S.scenId;
    var rtn = castFor(rsid);
    if (!ready(rsid, false, rtn)) { whenReady(rsid, function () { if (S.scenId === rsid) run(newSeed); }, null, false, rtn); return; }
    var seed = !newSeed && /^\d+$/.test(String(S.seed).trim()) ? parseInt(S.seed, 10) : HK.newSeed();
    var input = buildInput(seed), sc = HK.SCENARIOS[S.scenId];
    /* 箱庭ごとの始める前の検査（scen.check が止める理由の文を返したら始めない。無い箱庭は今までどおり） */
    var why = sc && typeof sc.check === 'function' ? sc.check(input) : '';
    if (why) { toast(why); return; }
    simulate(input, true);
  }

  function renderResult() {
    var host = $('#view-result');
    V.render(host, result, { history: hist, showAll: showAll }); shownRes = result;   /* 描けた結果（「この結果をセーブ」はこれを残す。HK.UIres.shown） */
    if (result && HK.Share) { var hd = host.querySelector('.resulthead'); if (hd && !host.querySelector('#sharebar')) hd.insertAdjacentHTML('afterend', HK.Share.bar()); }
    /* 結果のセーブ（saves.js） */
    if (result && HK.Saves && !host.querySelector('#savebtn')) { var sb = host.querySelector('#sharebar') || host.querySelector('.resulthead'); if (sb) sb.insertAdjacentHTML('afterend', HK.Saves.button()); }
    /* 履歴から開いたときの知らせと、履歴の一覧の説明 */
    histDeco(host); if (HK.SavesAdv) HK.SavesAdv.deco(host, result, opened, hist);   /* 保存時の高度設定の要約・「条件を箱庭タブに写す」「高度設定を写す」 */
  }
  /* セーブデータから結果を開く・同じ条件で回し直す */
  /* 条件（住人・環境・シード）を箱庭タブに写す。自動では動かさない。住人は名前で探し、見つからない人がいれば参加者は変えない */
  function copyCond(input, adv) {   /* adv：開いた記録の高度設定（写さない。今と違えば知らせに1行添える） */
    if (!input || !scenOf(input.scenId)) { toast('この箱庭は今の版にありません'); return; }
    var sid = input.scenId, ids = [], miss = [], gIds = {};
    (input.chars || []).forEach(function (c) { var m = S.chars.filter(function (x) { return x.name === c.name; })[0]; if (m) ids.push(m.id); else miss.push(c.name); });
    (HK.GLOBAL_ENV || []).forEach(function (e) { gIds[e.id] = 1; });
    S.scenId = sid; S.seed = input.seed != null ? String(input.seed) : ''; S.env[sid] = S.env[sid] || {}; S.glob = S.glob || {};
    Object.keys(input.env || {}).forEach(function (k) { if (k !== 'ct') (gIds[k] ? S.glob : S.env[sid])[k] = input.env[k]; });
    if (!miss.length && ids.length) { S.join = S.join || {}; S.join[sid] = ids; }
    save(); setTab('box');
    toast('条件とシードを箱庭タブに写しました（自動では動かしません）。' + (miss.length ? '住人「' + miss.slice(0, 3).join('・') + '」が見つからないので、参加者はそのままです。' : '') + '住人の設定や版が保存時と違うと、同じ結果にはなりません' + (adv && HK.SavesAdv && HK.SavesAdv.differs(adv) ? '。保存時の' + HK.Adv.LABEL + 'は「' + HK.Adv.LABEL + 'を写す」で戻せます' : ''));
  }
  /* セーブから結果を開く（保存した結果だけを表示する。回し直しはしない）・条件を写す */
  HK.UIres = {
    get: function () { return result; },
    opened: function () { return opened; }, shown: function () { return shownRes; },
    show: function (res, meta) {
      /* セーブから開くときも、箱庭のかたまりを読んでから表示する（saves.js の「開く」） */
      var sid = res && (res.scenId || (res.input && res.input.scenId));
      whenReady(sid, function () { result = res; showAll = false; histNote = ''; histCur = null; opened = meta || { from: 'save' }; V.resetFilter(); setTab('result'); }, 'この箱庭のデータを読み込んでいます…', true);
    },
    copyCond: copyCond
  };
  /* 25問のエゴグラム診断から住人を追加・書き換え */
  if (HK.EgoQuiz) {
    HK.EgoQuiz.chars = function () { return S.chars; };
    HK.EgoQuiz.onSave = function (r) {
      var c = r.target ? S.chars.filter(function (x) { return x.id === r.target; })[0] : null;
      if (c) { c.eg = r.eg; if (r.name) c.name = r.name; }
      else { if (S.chars.length >= MAX) { toast('住人は' + MAX + '人までです'); return; } var qc = mk({ name: r.name, eg: r.eg }); S.chars.push(qc); }
      if (CP) CP.reveal((c || qc).id);
      S.sample = false; save(); renderCast();
      toast(r.name + '（' + HK.toCode(r.eg) + '）を' + (c ? '書き換えました' : '住人に追加しました'));
    };
  }
  HK.toast = toast;

  /* ---------- イベント ---------- */
  document.addEventListener('click', function (ev) {
    var t = ev.target.closest('[data-act],[data-tab]');
    if (!t) return;
    if (t.dataset.tab) { setTab(t.dataset.tab, true); return; }
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
        var nc = mk({ name: '住人' + (S.chars.length + 1), eg: { CP: 10, NP: 10, A: 10, FC: 10, AC: 10 } });
        S.chars.push(nc); if (CP) CP.reveal(nc.id);
        save(); renderCast();
        var last = document.getElementById('nm-' + nc.id);
        if (last) { last.focus(); last.select(); }
        break;
      /* 10人まとめて足す（上限まで）。最初に足した人が見えるページに移り、その人の名前の欄へ */
      case 'add10':
        var n10 = Math.min(10, MAX - S.chars.length), first10 = null;
        if (n10 <= 0) return;
        if (S.sample) S.sample = false;
        for (var a10 = 0; a10 < n10; a10++) { var c10 = mk({ name: '住人' + (S.chars.length + 1), eg: { CP: 10, NP: 10, A: 10, FC: 10, AC: 10 } }); S.chars.push(c10); if (!first10) first10 = c10; }
        if (CP) CP.reveal(first10.id);
        save(); renderCast();
        toast(n10 + '人を足しました' + (n10 < 10 ? '（上限の' + MAX + '人までです）' : ''));
        var f10 = document.getElementById('nm-' + first10.id);
        if (f10) { f10.focus(); f10.select(); }
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
        S.ties.push(nt1); if (CP) CP.revealTie(S.ties.length - 1);
        save(); renderCast(); break;
      case 'tiedel':
        if (HK.tiePastMoveOut) HK.tiePastMoveOut(S.ties, S.ties[+t.dataset.k]); /* 組の過去は残る関係へ（ties.js） */
        S.ties.splice(+t.dataset.k, 1); save(); renderCast(); break;
      case 'tieimport':
        var pr = HK.parseTies($('#tiebulk').value, S.chars);
        S.ties = S.ties || [];
        pr.ties.forEach(function (nt) {
          var ex = S.ties.filter(function (x) { return x.type === nt.type && ((x.a === nt.a && x.b === nt.b) || (x.a === nt.b && x.b === nt.a)); })[0];
          /* 過去は組に一か所（ties.js の HK.tiePastSet）：書いた向きだけを組の家に入れ、書いていない過去は消さない。向きが逆になる関係は、持っている過去も入れ替える */
          if (ex) { if (ex.a !== nt.a) { var p0 = ex.past; if (ex.pastB) ex.past = ex.pastB; else delete ex.past; if (p0) ex.pastB = p0; else delete ex.pastB; } ex.a = nt.a; ex.b = nt.b; ex.type = nt.type; if (nt.cold) ex.cold = nt.cold; else delete ex.cold; HK.TIE_XF.forEach(function (f) { if (f === 'past' || f === 'pastB') return; if (nt[f]) ex[f] = nt[f]; else delete ex[f]; }); } else S.ties.push(nt);
          var pv = { past: nt.past, pastB: nt.pastB }; if (!ex) { delete nt.past; delete nt.pastB; }
          ['past', 'pastB'].forEach(function (f) { if (pv[f]) HK.tiePastSet(S.ties, ex || nt, f, pv[f]); });
        });
        /* 「グループ名 仲間」の行：そのグループを仲間とみなす */
        (pr.groups || []).forEach(function (g) { S.grpComrade = S.grpComrade || {}; S.grpComrade[g] = 1; });
        save(); renderCast();
        if (pr.warnings.length) { var tw = $('#tiewarns'); tw.hidden = false; tw.innerHTML = pr.warnings.map(function (x) { return '<li>' + esc(x) + '</li>'; }).join(''); }
        toast(pr.ties.length + '件の関係を読み込みました' + ((pr.groups || []).length ? '（' + pr.groups.join('・') + 'を仲間とみなします）' : ''));
        break;
      case 'tobox': setTab('box', true); break;
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
        if (CP) CP.top();
        save(); renderCast(); break;
      case 'sortreg':
        sortByReg(); if (CP) CP.top(); save(); renderCast(); toast('登録順（住人を足した順）に戻しました'); break;
      case 'grphidenone':
        S.grpHideNone = !S.grpHideNone; if (CP) CP.top(); save(); renderCast(); break;
      case 'grpshowall':
        S.grpHide = {}; S.grpHideNone = false; if (CP) CP.top(); save(); renderCast(); break;
      case 'randadd':
        if (S.chars.length >= MAX || !HK.RandChar) return;
        if (S.sample) S.sample = false;
        var rc = HK.RandChar.make({ style: randStyle, names: S.chars.map(function (x) { return x.name; }) });
        var rcc = mk(rc); S.chars.push(rcc); if (CP) CP.reveal(rcc.id);
        save(); renderCast();
        toast('「' + rc.name + '」（' + HK.toCode(rc.eg) + (rc.memo ? '・' + rc.memo : '') + '）をランダムで足しました');
        var rl = document.getElementById('nm-' + rcc.id);
        if (rl) rl.focus();
        break;
      case 'sortgrp':
        sortByGroup(); if (CP) CP.top(); save();
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
      case 'gobox': setTab('box', true); break;
      case 'run': run(false); break;
      case 'scenretry': delete boxErr[S.scenId]; renderBox(); break;
      case 'reroll': run(true); break;
      case 'iconpick': iconTarget = row && row.dataset.id; var fi = $('#iconfile'); if (fi) { fi.value = ''; fi.click(); } break;
      case 'icondel':
        var cd = S.chars.filter(function (x) { return row && x.id === row.dataset.id; })[0];
        if (cd) { delete cd.icon; iconTouched[cd.id] = 1; save(); renderCast(); }
        break;
      case 'jsonout': exportJSON(); break;
      case 'jpick': jpOpen = !jpOpen; if (!(HK.CastTools && HK.CastTools.refresh())) renderCast(); break;
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
    var ty = row.querySelector('.ty'); ty.textContent = ty.title = HK.egoType(c.eg).label;
    var ea = row.querySelector('.egname'); if (ea && HK.egoTypeName) ea.textContent = HK.egoTypeName(c);
    var et = row.querySelector('.egtone'); if (et && HK.egoToneWord) et.textContent = HK.egoToneWord(c);
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
    else if (f === 'tags' && c) { c.tags = t.value.trim().slice(0, 80); }
    else if (f === 'tone' && c) {
      c.tone = (HK.toneValid ? HK.toneValid(t.value) : HK.PERSONA[t.value]) ? t.value : '';
      var etw = row.querySelector('.egtone'); if (etw && HK.egoToneWord) etw.textContent = HK.egoToneWord(c);
      /* 口調の書き下ろしのかたまりを裏で読んでおく（動かすときに待たないように。失敗は動かすときに知らせる） */
      if (HK.Load && HK.Load.ensureTones) HK.Load.ensureTones([c]).then(null, function () { /* 同上 */ });
    }
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
    /* 箱庭の選び替え：カードの印を先に描き、保存（住人が多いと重い）は次の描画のあとで */
    else if (f === 'scen') { S.scenId = t.value; delete boxErr[t.value]; renderBox({ defer: true }); saveSoon(); return; }
    else if (f === 'prefetch') {
      if (ev.type === 'change' && HK.Load && HK.Load.setPref) { HK.Load.setPref(t.value); toast('データの先読みを「' + t.options[t.selectedIndex].text + '」にしました'); }
      return;
    }
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
      /* 軽くした行（住人が多いとき）を参加にしたら、設定の欄を出すために描き直す */
      if (t.checked && tr && tr.classList.contains('lazy')) { var y0 = window.pageYOffset; save(); renderBox(); window.scrollTo(0, y0); var nb = document.getElementById('jn-' + t.dataset.id); if (nb) nb.focus(); return; }
      var jc = document.getElementById('joincount');
      if (jc) { var mx = smax(S.scenId); jc.innerHTML = '参加 <b class="num">' + cur.length + '</b> / 上限 ' + mx + '人' + (cur.length > mx ? '　<span style="color:var(--warn)">上限を超えています</span>' : ''); }
      updLoveWarn();
    }
    else if (f === 'tie') {
      var tt = S.ties[+t.dataset.k];
      /* 変更の結果、同じ二人に同じ関係が二つになるなら戻す */
      if (tt && /^(?:a|b|type)$/.test(t.dataset.p)) { var na = t.dataset.p === 'a' ? t.value : tt.a, nb = t.dataset.p === 'b' ? t.value : tt.b, nty = t.dataset.p === 'type' ? t.value : tt.type; if (hasTie(na, nb, nty, +t.dataset.k)) { toast('その二人には「' + (HK.TIES[nty] ? HK.TIES[nty].label : nty) + '」がすでにあります'); t.value = tt[t.dataset.p]; return; } }
      /* 過去は組に一か所（ties.js）：欄の編集は組の家へ。人を変える・過去の欄の無い種類にするときは、組の過去を残る関係へ移す */
      if (tt && (t.dataset.p === 'past' || t.dataset.p === 'pastB')) { HK.tiePastSet(S.ties, tt, t.dataset.p, t.value); save(); renderCast(); return; }
      if (tt && (/^[ab]$/.test(t.dataset.p) || (t.dataset.p === 'type' && !HK.tiePastOK({ type: t.value }))) && (tt.past || tt.pastB)) { HK.tiePastMoveOut(S.ties, tt); if (t.dataset.p !== 'type') { tt[t.dataset.p] = t.value; save(); renderCast(); return; } }
      if (tt && HK.TIE_XF.indexOf(t.dataset.p) >= 0) { if (t.value && !(tt.type === 'fiance' && t.value === 'eager')) tt[t.dataset.p] = t.value; else delete tt[t.dataset.p]; save(); renderCast(); return; }
      if (tt) { tt[t.dataset.p] = t.value; if (t.dataset.p === 'love' && !t.value) delete tt.love; if (t.dataset.p === 'type' && HK.tieExtraNorm) HK.tieExtraNorm(tt); if (t.dataset.p === 'type' && HK.tieFeelFix) { var ffm = HK.tieFeelFix(S.ties, tt); if (ffm) toast(ffm); } if (t.dataset.p === 'type' || t.dataset.p === 'cold' || t.dataset.p === 'love') { save(); renderCast(); return; } }
    }
    else if (f === 'seed') S.seed = t.value.replace(/[^\d]/g, '');
    else if (f === 'teacher') { S.teacher = t.value; save(); renderBox(); return; }
    else if (f === 'randfrom') { S.randFrom = t.value; save(); renderBox(); return; }
    else if (f === 'randstyle') { randStyle = t.value; Array.prototype.forEach.call(document.querySelectorAll('select[data-f="randstyle"]'), function (x) { if (x !== t) x.value = t.value; }); return; }
    else if (f === 'randn') S.randN = parseInt(t.value, 10) || '';
    /* 内容のスイッチの注記（参加者・設定・第二性・性別・恋愛対象・入れたスイッチで変わる。関係は住人タブから戻ったときに描き直す） */
    if (f === 'join' || f === 'pf' || f === 'gender' || f === 'likes' || f === 'ct' || f === 'env') updCtWhy();
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
    if (CP) CP.reveal(id);
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
    /* グループごとの節に分けているときは、同じ節で一つ上（下）に見えている人と入れ替える（ui-cast-pages.js） */
    var to = CP ? CP.step(id, ev.key === 'ArrowUp' ? -1 : 1) : i + (ev.key === 'ArrowUp' ? -1 : 1);
    if (to >= 0) moveChar(id, to);
  });

  var iconTarget = null;
  document.addEventListener('change', function (ev) {
    if (ev.target.id !== 'iconfile') return;
    var f = ev.target.files && ev.target.files[0], c = S.chars.filter(function (x) { return x.id === iconTarget; })[0];
    if (!f || !c) return;
    HK.Icons.fromFile(f).then(function (url) {
      c.icon = url; iconTouched[c.id] = 1;
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
  HK.UI.state = function () { return S; }; HK.UI.parseRoster = parseGrouped;   /* 「n 行を検出」（ui-import.js）も同じ読み取りで数える */
  /* 画面の上へ／下へ移動するボタン（右下に固定） */
  (function () {
    if (document.getElementById('pagejump')) return;
    var st = document.createElement('style');
    st.textContent = '#pagejump{position:fixed;right:max(10px,env(safe-area-inset-right,0px));bottom:calc(12px + env(safe-area-inset-bottom,0px));display:flex;flex-direction:column;gap:6px;z-index:50}' +
      '#pagejump button{width:40px;height:40px;border-radius:50%;border:1px solid var(--line2,var(--line));background:var(--paper,var(--surface));color:var(--ink);font-size:18px;line-height:1;cursor:pointer;opacity:.92}' +
      '#pagejump button:hover{opacity:1;border-color:var(--ink)}@media print{#pagejump{display:none}}';
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
  if (CP) CP.bind({ S: function () { return S; }, grpList: grpList, grpHidden: grpHidden, groupsOf: groupsOf, resRow: resRow, renderCast: renderCast, boxRedraw: boxRedraw });
  if (HK.CastTools) HK.CastTools.bind({ S: function () { return S; }, max: MAX, io: function () { return { jp: jpOpen, pick: pickPanel() }; } });
  HK.UI.refresh = function () { setTab(tab); };
  HK.UI.autoTone = autoTone;
  /* 書き出し・読み込み・入力の組み立て（点検・往復の試験から呼ぶ。画面の操作と同じ関数） */
  HK.UI.rosterJSON = rosterJSON; HK.UI.importJSON = importJSON; HK.UI.buildInput = buildInput; HK.UI.normState = normState;
  setTab('cast');
  bkNotice();
})();
