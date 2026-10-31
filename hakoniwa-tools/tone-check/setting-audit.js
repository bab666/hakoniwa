/* R18 の性行為に関わる設定が、性的な場面（記録の印 e.lewd）に反映されているかの総点検（2026-10-27 担当HM）
   使い方: node setting-audit.js <ビルドのディレクトリ> [1設定×1箱庭あたりの回数=6] [箱庭id,…] [--probe=id,…（前方一致）] [--why] [--list] [--json=出力.json] [--dump=箱庭#回]
     例: node setting-audit.js ../../hakoniwa-full 6
         node setting-audit.js ../../hakoniwa-full 8 room,omega --probe=night --why
   何を見るか：
     住人の⚙設定（恋愛と夜・体と設定・相手ごとの設定）、全体の設定、箱庭の R18 の環境値を一つずつ「分かる値」にして、全箱庭を各 N 回回し、
     性的な記録（e.lewd が真）の本文・理由（e.why）と、点検用の記録（HK.Attr.log 夜の性格の文・HK.PosLead.log 夜の主導の文・
     HK.Attr.raceLog／featLog 体の特徴の文・HK.Pos.order の向き・HK.Moan の喘ぎ）から、その設定が反映された回を数える。
     対象の住人は 0 番（アキラ）。相手は 1 番（ミナト）。配役はふつう 4 人（箱庭の人数の範囲に合わせる）。
   判定の種類（表の一マス）：
     dir … 「効くはずの回」＝対象の人の性的な記録がある回、「効いている回」＝その回の記録に設定の印が出た（向きが合っていた）回。表は 効いている/効くはず
     excl … 同じ種で設定なし（比べる側）と設定ありを回す。「効くはず」＝比べる側で対象の場面があった回、「効いている」＝設定ありでその場面が 0 の回
     rate … 設定あり／比べる側の数（場面の数・文の長さ・印の数）を比べる。表は 「あり:なし」の数と、期待どおりの向きなら ◯
     cnt  … 喘ぎなど、一回に何件もあるものの割合（効いている件／効くはずの件）
   表の記号：◯ 期待どおり（dir・cnt は 8 割以上）／△ 一部（2 割以上）／✕ 効いていない／－ その箱庭では起きない（効くはずの回が 0）
   --why：効いていない回の例（記録の本文・理由の抜き書き）を出す。--list：設定の一覧だけを出す。
   --dump=箱庭#回（--probe と一緒に）：その設定のその回の、0 番の出る性的な記録を全文で出す
   点検のあいだは、体の語の印をいつも「直接」の列で語にする（性器の呼び方を見る設定だけは、ふつうの列）
   登場人物はすべて成人として扱う */
'use strict';
const fs = require('fs');
const { openBuild } = require('./lib.js');

/* ---------- ページの中で動かす部分（文字列にして注入する） ---------- */
function inPage() {
  const SA = window.SA = {};
  const NAMES = ['アキラ', 'ミナト', 'ユキノ', 'カオル', 'ハルカ', 'レンジ'];
  const P = HK.Pos, A = HK.Attr, M = HK.Moan;
  SA.NAMES = NAMES;
  /* ---- 点検用の記録の包み（一度だけ） ---- */
  SA.ord = null; SA.moan = null; SA.moanCtx = [];
  if (P && P.order && !P.order._sa) {
    const o0 = P.order;
    P.order = function (a, b) { const r = o0.apply(this, arguments); if (SA.ord && r && r[0] && r[1] && r[0].name && r[1].name) SA.ord.push([r[0].name, r[1].name]); return r; };
    P.order._sa = true;
  }
  /* 喘ぎの相手の名前（ctx.partner／ctx.top、包みの外の o.top、小説調の山場の攻め、組み立て中の二人）。分からなければ '' */
  SA.ptOf = (who, ctx, up) => { const c = ctx && typeof ctx === 'object' ? ctx : {}; const p = c.partner || c.top || (up && up.topW) || (HK.NovelMoan && HK.NovelMoan.top !== who && HK.NovelMoan.top) || (A && A.pairNow && A.pairNow(who)); return p && p.name ? p.name : ''; };
  if (M && M.pick && !M.pick._sa) {
    const pk0 = M.pick;
    M.pick = function (S, who, key, ctx) {
      const out = pk0.apply(this, arguments);
      if (SA.moan && who && who.name) {
        const up = SA.moanCtx[SA.moanCtx.length - 1] || {};
        SA.moan.push({ who: who.name, key: key, out: typeof out === 'string' ? out : '', src: M.lastSrc || '', tone: M.toneOf ? M.toneOf(who) : '',
          night: (ctx && ctx.night) || up.night || '', top: !!((ctx && ctx.top) || up.top), ps: M.psOf ? M.psOf(who, ctx) : '', pt: SA.ptOf(who, ctx, up) });
      }
      return out;
    };
    M.pick._sa = true;
    const say0 = M.say;
    M.say = function (S, who, kind, o) { SA.moanCtx.push({ night: o && o.night, top: o && o.top, topW: o && typeof o === 'object' ? o.top : null }); try { return say0.apply(this, arguments); } finally { SA.moanCtx.pop(); } };
    if (HK.Ero && HK.Ero.moan) { const em0 = HK.Ero.moan; HK.Ero.moan = function (S, who, st, ctx) { SA.moanCtx.push({ night: ctx && typeof ctx === 'object' && ctx.night, top: ctx && typeof ctx === 'object' && ctx.top, topW: ctx && typeof ctx === 'object' ? ctx.top : null }); try { return em0.apply(this, arguments); } finally { SA.moanCtx.pop(); } }; }
  }
  /* ---- 文の判定 ---- */
  const MALE = P.MALE_RE;
  const FEM = /まんこ|膣|秘所|秘裂|陰部|割れ目|クリトリス|陰核|花芯|愛液|蜜壺|蜜壷|女性器|秘部|蜜口/;
  const MOB = /男たち|男が|客|触手|ゾンビ|魔物|オーク|ゴブリン|スライム|村人|略奪者|おじさん|兵士|盗賊|マッサージ師|施術師|整体師|司会|カメラマン|監督|インキュバス|獣|看守|見知らぬ|誰とも知れない|壁の向こう|向こう側の誰か|モブ|生命体|異星|神(?:は|が|の手|に)|邪神/;
  const NPC_W = /男たち|客|獲物|触手|ゾンビ|魔物|オーク|ゴブリン|スライム|村人|略奪者|看守|施術師|スタッフ|整体師|眷属|神|インキュバス|壁の向こう|星の生命体|異星|司会|カメラマン|男の手|手が|誰か/;
  const esc = s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const SEXCORE = /抱き潰|エッチ|イカせ|イかせ|イった|イっ|果て|喘|挿れ|挿入|舐め|愛撫|達し|体を重ね|腰を(?:振|沈|打ち|揺|落と|突き|使)|跨[っがりるら]|犯|根元|締めつけ|締め付け|射精|ナカ|♡|昂り|濡れ|蜜|奥を|奥に|奥まで|繋がっ|繋がり|呑み込|搾り|脈打|ノット|種付け|孕|精を|白濁|中に出/;
  const sentOf = (t, i) => { let a = i; while (a > 0 && !/[。！？\n]/.test(t[a - 1])) a--; let b = i; while (b < t.length && !/[。！？\n]/.test(t[b])) b++; return t.slice(a, b); };
  /* 受ける側の文（pos-audit の recvHit を簡単にしたもの） */
  SA.recv = function (t, n0, others) {
    const RX = [
      new RegExp(n0 + '(?:は|が|も|を)?[^。「」]{0,30}?(?:貫かれ|突かれ|突き上げられ|挿れられ|挿入され|犯され|中に出され|注がれ|イかされ|イカされ|組み敷かれ|押し倒され|穿たれ|嬲られ|鳴かされ|啼かされ|孕まされ|種付けされ|開発され)'),
      new RegExp(n0 + 'の(?:中|奥|最奥|中に|奥に|後ろ|後孔|秘部|蕾|入り口|ナカ)(?:へ|に|を|で|まで)'),
      new RegExp('(?:を|に)?' + n0 + '(?:を|の中を|の奥を)(?:貫|犯|突き上げ|押し倒|組み敷|穿|嬲|鳴か|啼か|イカせ|イかせ)')
    ];
    for (let k = 0; k < RX.length; k++) {
      const m = t.match(RX[k]); if (!m) continue;
      if (k === 0 && /^(?:に|から|によ|の手で)/.test(t.slice(m.index + n0.length))) continue;
      if ((others || []).some(o => new RegExp('、' + o + '(?:は|が)').test(m[0]))) continue;
      if (!SEXCORE.test(sentOf(t, m.index))) continue;
      return m[0];
    }
    return null;
  };
  /* 表の文から、名前の印を含まない一片（8 文字以上）を取り出す（その文が記録に入ったかを見る） */
  const fragCache = new Map();
  SA.frags = function (key, lists) {
    if (fragCache.has(key)) return fragCache.get(key);
    const out = [];
    const walk = v => { if (typeof v === 'string') { v.split(/\{[^}]*\}|\n|「[^」]*」/).filter(x => x.length >= 8).sort((a, b) => b.length - a.length).slice(0, 1).forEach(x => out.push(x.slice(0, 16))); } else if (Array.isArray(v)) v.forEach(walk); else if (v && typeof v === 'object') Object.keys(v).forEach(k => walk(v[k])); };
    walk(lists);
    fragCache.set(key, out);
    return out;
  };
  SA.hasFrag = (t, fr) => fr.some(f => t.indexOf(f) >= 0);
  /* ---- 一回分を回して、判定に使う形にまとめる ---- */
  SA.rngOf = (str) => { let h = 2166136261; for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); } return () => { h += 0x6D2B79F5; let t = h; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; };
  const HOTSEL = { cond: 'h', kingsgame: 'yes', mode: 'lewd', ilewd: 'high', wolfnight: 'yes', lovemode: 'on', desc: 'full', zraid: 'on', sane: 'none' };
  SA.envOf = function (scen, s, hot) {
    const env = {};
    (scen.env || []).forEach(e => { env[e.id] = e.def != null ? e.def : (e.options && e.options[0] ? e.options[0].v : (e.min != null ? e.min : '')); });
    if (hot !== false) (scen.env || []).forEach(e => {
      if (e.max != null && /lewd|dose|shady|heat|prey|pleasure|traffic|ev$|aphro|night|zlust|harsh|wild/.test(e.id)) env[e.id] = e.max;
      else if (e.options && /lewd/.test(e.id) && e.id !== 'lewdLen') { const hi = e.options.filter(o => /high|max|lewd/.test(o.v))[0]; if (hi) env[e.id] = hi.v; }
      if (e.options && HOTSEL[e.id] && e.options.some(o => o.v === HOTSEL[e.id])) env[e.id] = HOTSEL[e.id];
    });
    Object.keys(env).forEach(k => { if (/^role_/.test(k)) env[k] = s % 2 ? 'res' : 'auto'; });
    if (HK.Content) env.ct = HK.Content.TAGS.map(t => t.id).join(',');
    return env;
  };
  SA.castOf = function (scen, s) {
    const n = Math.max(Math.max(2, scen.minCast || 2), Math.min(scen.maxCast || 6, 4));
    const G = ['m', 'f', 'f', 'm', 'f', 'm'];
    const chars = [];
    for (let i = 0; i < n; i++) chars.push({ name: NAMES[i], eg: { CP: (s * 7 + i * 5) % 21, NP: (s * 3 + i * 11) % 21, A: (s * 13 + i * 3) % 21, FC: (s * 5 + i * 7) % 21, AC: (s * 11 + i * 3) % 21 }, memo: '', gender: G[i], likes: '', tone: '', fp: '', pos: '', posLike: '', calls: {}, loveNG: [], loveLock: '' });
    return { chars, ties: [{ a: 0, b: 1, type: 'lover' }] };
  };
  SA.runOne = function (sc, s, cfg, mode) {
    const scen = HK.SCENARIOS[sc];
    const c = SA.castOf(scen, s), env = SA.envOf(scen, s, cfg.hot);
    const X = { chars: c.chars, ties: c.ties, env, s, sc, n: c.chars.length };
    if (cfg.mod) cfg.mod(X);
    if (HK.LewdWords) HK.LewdWords.MODE = cfg.words ? null : 'direct';
    SA.ord = []; SA.moan = [];
    if (A) { A.log = []; A.raceLog = []; A.featLog = []; if ('moanLog' in A) A.moanLog = []; }
    if (HK.PosLead) HK.PosLead.log = [];
    let res;
    /* pre・post … 全体の設定を変える項目（回すあいだだけ。例：喘ぎ声の調整の「♡：全員なし」） */
    if (cfg.pre) cfg.pre();
    try { res = HK.simulate({ scenId: sc, seed: 7100 + s * 13, env: X.env, chars: X.chars, perChar: X.chars.map(() => ({ action: 'auto', goal: 'auto', stats: {}, weapon: '', pick: {}, role: '' })), ties: X.ties }); }
    catch (e) { return { err: String(e && e.stack || e).slice(0, 300) }; }
    finally { if (cfg.post) cfg.post(); }
    const names = X.chars.map(x => x.name);
    const idxOf = x => typeof x === 'number' ? x : x && typeof x.i === 'number' ? x.i : null;
    const recs = [];
    (res.log || []).forEach((e, k) => {
      if (!e || typeof e.text !== 'string') return;
      const who = new Set();
      (e.actors || []).forEach(x => { const i = idxOf(x); if (i != null && i >= 0 && i < names.length) who.add(i); });
      names.forEach((nm, i) => { if (e.text.indexOf(nm) >= 0) who.add(i); });
      recs.push({ k, t: e.text, why: e.why || '', lewd: e.lewd === true, who: [...who].sort(), seg: e.seg || null, tag: e.tag || e.label || '' });
    });
    const R = { sc, recs, names, chars: X.chars, env: X.env, ord: SA.ord, moan: SA.moan, mlog: A && Array.isArray(A.moanLog) ? A.moanLog : null, att: (A && A.log) || [], lead: (HK.PosLead && HK.PosLead.log) || [], race: (A && A.raceLog) || [], feat: (A && A.featLog) || [], res };
    SA.ord = null; SA.moan = null;
    if (A) { A.log = null; A.raceLog = null; A.featLog = null; if ('moanLog' in A) A.moanLog = null; }
    if (HK.PosLead) HK.PosLead.log = null;
    return R;
  };
  /* ---- 判定の部品 ---- */
  const H = SA.H = {
    lx: R => R.recs.filter(r => r.lewd && r.who.indexOf(0) >= 0),
    /* 住人のうち 0 番と j 番だけが出る性的な記録 */
    pair: (R, j) => R.recs.filter(r => r.lewd && r.who.length === 2 && r.who[0] === 0 && r.who[1] === (j == null ? 1 : j)),
    /* 0 番と、ほかの住人一人だけ */
    pairAny: R => R.recs.filter(r => r.lewd && r.who.length === 2 && r.who[0] === 0),
    /* 住人は 0 番だけ（モブ・魔物・罠が相手） */
    mob: R => R.recs.filter(r => r.lewd && r.who.length === 1 && r.who[0] === 0 && r.t.indexOf(R.names[0]) >= 0),
    /* 0 番と j 番の二人の性的な文がある記録（二人が同じ性的な文に名前で出る＝二人の場面） */
    sexPair: (R, j) => R.recs.filter(r => r.lewd && r.who.indexOf(0) >= 0 && r.who.indexOf(j == null ? 1 : j) >= 0 && r.t.replace(/「[^」]*」/g, '「」').split(/[。！？\n]/).some(x => x.indexOf(R.names[0]) >= 0 && x.indexOf(R.names[j == null ? 1 : j]) >= 0 && SEXCORE.test(x))),
    ordOf: (R, a, b) => R.ord.filter(o => (o[0] === a && o[1] === b) || (o[0] === b && o[1] === a)),
    /* 性的な文（文ごと。state-audit と同じ考え方：SEXCORE の語がある文と、その文に名前の出る住人） */
    sx: R => R._sx || (R._sx = R.recs.filter(r => r.lewd).flatMap(r => r.t.split(/[。！？\n」]/).filter(x => SEXCORE.test(x)).map(x => ({ s: x, r, nm: R.names.map((n0, i) => x.indexOf(n0) >= 0 ? i : -1).filter(i => i >= 0) })))),
    /* 0 番ともう一人（pred に合う住人）の二人だけが出る性的な文 */
    xWith: (R, pred) => H.sx(R).filter(x => x.nm.length === 2 && x.nm[0] === 0 && pred(x.nm[1])),
    xSex: R => H.sx(R).filter(x => x.nm.indexOf(0) >= 0),
    xMob: R => H.sx(R).filter(x => x.nm.length === 1 && x.nm[0] === 0 && MOB.test(x.s)),
    ex: (r, n) => (r ? (r.t.replace(/\n/g, ' ').slice(0, n || 160) + (r.why ? ' 〔理由〕' + r.why.slice(0, 120) : '')) : '')
  };
  SA.MALE = MALE; SA.FEM = FEM; SA.NPC_W = NPC_W; SA.esc = esc;
  /* 体の語（男性器）の表の語：列ごと */
  SA.words = function () {
    const T = HK.LewdWords && HK.LewdWords.TABLE;
    if (!T) return null;
    const col = (k, cs) => [...new Set(cs.flatMap(c => (T[k] && T[k][c]) || []))];
    return { mMed: col('男性器', ['m']), mSoft: col('男性器', ['nb', 'eb']), mDir: col('男性器', ['nd', 'ed']), mAll: col('男性器', ['nd', 'ns', 'nb', 'ed', 'es', 'eb', 'm']).concat(['ちんぽ', 'ちんこ', 'おちんちん', '性器', 'いちもつ', '屹立', '怒張', '剛直', '昂ぶり']),
      fMed: col('女性器', ['m']), fAll: col('女性器', ['nd', 'ns', 'nb', 'ed', 'es', 'eb', 'm']).filter(w => !/脚の間|股間|そこ/.test(w)).concat(['膣', 'まんこ', '秘部', '割れ目', '蜜壺']) };
  };
}

/* ---------- 設定の一覧（ページの中で評価する文字列）---------- */
/* 各項目：id・group・label・type（dir／excl／rate／cnt）・mod(X)（設定を付ける）・base(X)（比べる側。excl・rate）・judge(R, B)・words（性器の呼び方：ふつうの列）・only（箱庭を絞る）・skip（箱庭を外す）・expect（rate の期待：'up'／'down'／'on'）
   judge の戻り：dir・excl は { should: 0|1, hit: 0|1, ex }、cnt は { should: 件数, hit: 件数, ex }、rate は { p: 数, b: 数 } */
const PROBES = String.raw`
(() => {
  const H = SA.H, N = SA.NAMES, X0 = N[0], Y0 = N[1];
  const CORE = { dungeon: 1, hole: 1, kaihen: 1, succubus: 1, variety: 1, massage: 1 };
  const set = (X, i, o) => { if (X.chars[i]) Object.assign(X.chars[i], o); };
  const noTies = X => { X.ties = []; };
  const L = [];
  const add = o => L.push(o);
  /* 向き：0 番と 1 番の二人だけの性的な記録で、HK.Pos.order の向きと、受ける側の文 */
  const dirJudge = (want) => (R) => {
    const rs = H.pair(R); if (!rs.length) return { should: 0 };
    const od = H.ordOf(R, X0, Y0);
    const xTop = od.filter(o => o[0] === X0).length, yTop = od.length - xTop;
    const rv = rs.map(r => SA.recv(r.t, X0, [Y0])).filter(Boolean);
    let ok;
    if (want === 'top') ok = od.length ? yTop === 0 && !rv.length : !rv.length;
    else ok = od.length ? xTop === 0 : rv.length > 0;
    return { should: 1, hit: ok ? 1 : 0, ex: '向き X攻め' + xTop + '/Y攻め' + yTop + (rv.length ? ' 受けの文:' + rv[0] : '') + ' | ' + H.ex(rs[0]) };
  };
  /* ===== 受け攻め ===== */
  add({ id: 'pos.top', group: '受け攻め', label: '受け攻め：攻め（相手はおまかせの男性）', type: 'dir', mod: X => { set(X, 0, { pos: 'top' }); set(X, 1, { gender: 'm' }); }, judge: dirJudge('top') });
  add({ id: 'pos.bottom', group: '受け攻め', label: '受け攻め：受け（相手はおまかせの男性）', type: 'dir', mod: X => { set(X, 0, { pos: 'bottom' }); set(X, 1, { gender: 'm' }); }, judge: dirJudge('bottom') });
  add({ id: 'pos.riba', group: '受け攻め', label: '受け攻め：リバ×リバ（両方の向きが出るか。回の合計）', type: 'rate', expect: 'riba', mod: X => { set(X, 0, { pos: 'riba' }); set(X, 1, { gender: 'm', pos: 'riba' }); },
    judge: R => { const od = H.ordOf(R, X0, Y0); return { p: od.filter(o => o[0] === X0).length, b: od.filter(o => o[0] === Y0).length }; } });
  add({ id: 'pos.lv', group: '受け攻め', label: '攻め度 5（相手は攻め度 1・どちらもおまかせ）', type: 'dir', mod: X => { set(X, 0, { topLv: '5' }); set(X, 1, { gender: 'm', topLv: '1' }); }, judge: dirJudge('top') });
  add({ id: 'pos.for', group: '受け攻め', label: '相手ごとの受け攻め（全体は攻め・この相手には受け）', type: 'dir', mod: X => { set(X, 0, { pos: 'top', posFor: { 1: 'bottom' } }); set(X, 1, { gender: 'm' }); }, judge: dirJudge('bottom') });
  add({ id: 'pos.npcTop', group: '受け攻め', label: 'モブ相手の受け攻め：攻め（住人には受けの女性）', type: 'dir', mod: X => { set(X, 0, { gender: 'f', pos: 'bottom', posNpc: 'top' }); },
    judge: R => { const rs = H.mob(R); if (!rs.length) return { should: 0 }; const rv = rs.map(r => SA.recv(r.t, X0)).filter(Boolean); return { should: 1, hit: rv.length ? 0 : 1, ex: (rv[0] || '') + ' | ' + H.ex(rs.filter(r => SA.recv(r.t, X0))[0] || rs[0]) }; } });
  /* モブには受け：住人には攻めの人が、モブ・魔物・罠に「される」場面に入るようになる。モブとの性的な記録の数を、攻めだけの人（モブ欄なし）と比べる */
  add({ id: 'pos.npcBot', group: '受け攻め', label: 'モブ相手の受け攻め：受け（住人には攻めの男性。モブとの性的な記録の数を、モブ欄なしと比べる）', type: 'rate', expect: 'up', mod: X => { set(X, 0, { pos: 'top', posNpc: 'bottom' }); }, base: X => { set(X, 0, { pos: 'top' }); },
    judge: (R, B) => ({ p: H.mob(R).length, b: H.mob(B).length }) });
  /* ===== 恋愛対象・体の関係・性欲 ===== */
  const partnerG = (want) => (R) => {
    const rs = H.pairAny(R); if (!rs.length) return { should: 0 };
    const bad = rs.filter(r => want.indexOf(R.chars[r.who[1]].gender) < 0);
    return { should: 1, hit: bad.length ? 0 : 1, ex: bad.length ? '相手=' + R.names[bad[0].who[1]] + '(' + R.chars[bad[0].who[1]].gender + ') | ' + H.ex(bad[0]) : '' };
  };
  add({ id: 'love.likes', group: '恋愛対象', label: '恋愛対象：男性（男性。最初の恋人の関係なし）', type: 'dir', mod: X => { noTies(X); set(X, 0, { likes: 'm' }); }, judge: partnerG('m') });
  add({ id: 'love.sexLikes', group: '恋愛対象', label: '恋愛対象なし＋体の関係の相手：女性', type: 'dir', mod: X => { noTies(X); set(X, 0, { likes: 'none', sexLikes: 'f' }); }, judge: partnerG('f') });
  const exclJ = (sel) => (R, B) => { const b = sel(B), p = sel(R); if (!b.length) return { should: 0 }; return { should: 1, hit: p.length ? 0 : 1, ex: p.length ? (p[0].s != null ? '文：' + p[0].s.slice(0, 100) + ' || ' + H.ex(p[0].r) : H.ex(p[0])) : '' }; };
  const MOB_FREE = { dungeon: 1, succubus: 1, variety: 1 };
  const withAny = R => H.xWith(R, () => true), withOther = R => H.xWith(R, j => j !== 1);
  add({ id: 'love.sexLikesNone', group: '恋愛対象', label: '恋愛対象なし＋体の関係の相手：なし（住人との体の場面 0）', type: 'excl', mod: X => { noTies(X); set(X, 0, { likes: 'none', sexLikes: 'none' }); }, base: X => { noTies(X); set(X, 0, { likes: 'none' }); }, judge: exclJ(withAny) });
  const consentOnly = X => { X.env.ct = (X.env.ct || '').split(',').filter(t => t && t !== 'force').join(','); };
  add({ id: 'lib.none', group: '性欲', label: '性欲：なし（合意のない展開を切。住人との体の場面 0）', type: 'excl', skip: CORE, mod: X => { consentOnly(X); set(X, 0, { libido: 'none' }); }, base: X => { consentOnly(X); }, judge: exclJ(withAny) });
  const cntPair = R => ({ p: H.pairAny(R).length });
  add({ id: 'lib.high', group: '性欲', label: '性欲：強い（住人との体の場面が増える）', type: 'rate', expect: 'up', skip: CORE, mod: X => { set(X, 0, { libido: 'high' }); }, base: X => {}, judge: (R, B) => ({ p: H.pairAny(R).length, b: H.pairAny(B).length }) });
  add({ id: 'lib.low', group: '性欲', label: '性欲：弱い（住人との体の場面が減る）', type: 'rate', expect: 'down', skip: CORE, mod: X => { set(X, 0, { libido: 'low' }); }, base: X => {}, judge: (R, B) => ({ p: H.pairAny(R).length, b: H.pairAny(B).length }) });
  /* ===== 体 ===== */
  /* 挿れる側の体の書き方：男性器の語か、指・舌・道具を伴わない挿入の動詞（小説調は語を出さずに「深く沈む」「熱を注ぐ」で書く） */
  const PEN = /奥まで沈め|深く沈め|深く沈む|腰を沈め|貫|突き上げ|一突き|中に入っ|熱を吐き出|熱を注|腰を打ちつけ|中で果て|奥で果て|最奥|挿れ|挿入|抜き差し|根元まで|ピストン|穿/;
  const TOOLW = /指|舌|玩具|張り型|張形|ローター|双頭|ディルド|バイブ|器具|道具|触手/;
  SA.penIn = t => SA.MALE.test(t) || t.split(/[。！？\n]/).some(x => PEN.test(x) && !TOOLW.test(x));
  const MALEP = { test: t => SA.penIn(t) };
  /* 0 番と 1 番の両方が出る性的な記録（三人の場面・モブが一緒の場面も含む。比べる側「なし」で、ほかの人の体の語が混ざる割合も出す） */
  const both = R => R.recs.filter(r => r.lewd && r.who.indexOf(0) >= 0 && r.who.indexOf(1) >= 0);
  const pairHas = (re, neg) => (R) => { const rs = both(R); if (!rs.length) return { should: 0 }; const h = rs.some(r => re.test(r.t)); return { should: 1, hit: (neg ? !h : h) ? 1 : 0, ex: H.ex(neg ? rs.filter(r => re.test(r.t))[0] : rs[0]) }; };
  add({ id: 'body.genM', group: '体', label: '性器：男性器（女性・攻め、相手は女性）→男性器の語', type: 'dir', mod: X => { set(X, 0, { gender: 'f', pos: 'top', genital: 'm' }); set(X, 1, { gender: 'f', pos: 'bottom' }); }, base: X => { set(X, 0, { gender: 'f', pos: 'top' }); set(X, 1, { gender: 'f', pos: 'bottom' }); }, judge: pairHas(MALEP) });
  add({ id: 'body.genF', group: '体', label: '性器：女性器（男性・受け、相手は攻めの男性）→女性器の語', type: 'dir', mod: X => { set(X, 0, { pos: 'bottom', genital: 'f' }); set(X, 1, { gender: 'm', pos: 'top' }); }, base: X => { set(X, 0, { pos: 'bottom' }); set(X, 1, { gender: 'm', pos: 'top' }); }, judge: pairHas(SA.FEM) });
  add({ id: 'body.genMF', group: '体', label: '性器：両方（女性・攻め、相手は女性）→男性器の語', type: 'dir', mod: X => { set(X, 0, { gender: 'f', pos: 'top', genital: 'mf' }); set(X, 1, { gender: 'f', pos: 'bottom' }); }, base: X => { set(X, 0, { gender: 'f', pos: 'top' }); set(X, 1, { gender: 'f', pos: 'bottom' }); }, judge: pairHas(MALEP) });
  add({ id: 'body.genNone', group: '体', label: '性器：なし（男性・攻め、相手は女性）→男性器の語が出ない', type: 'dir', mod: X => { set(X, 0, { pos: 'top', genital: 'none' }); set(X, 1, { pos: 'bottom' }); }, base: X => { set(X, 0, { pos: 'top' }); set(X, 1, { pos: 'bottom' }); }, judge: pairHas(MALEP, true) });
  add({ id: 'body.futa', group: '体', label: 'ふたなり（女性・攻め、相手は女性）→男性器の語', type: 'dir', mod: X => { set(X, 0, { gender: 'f', pos: 'top', futa: true }); set(X, 1, { gender: 'f', pos: 'bottom' }); }, base: X => { set(X, 0, { gender: 'f', pos: 'top' }); set(X, 1, { gender: 'f', pos: 'bottom' }); }, judge: pairHas(MALEP) });
  const W = SA.words() || {};
  const ownWords = (want, all, who) => (R) => {
    const nm = R.names[who || 0], rs = H.lx(R).filter(r => r.t.indexOf(nm) >= 0);
    if (!rs.length) return { should: 0 };
    /* 「〇〇のもの」は持ち物の言い方（「〇〇のものになった」「〇〇のものだ」）を除く */
    const re = new RegExp(SA.esc(nm) + '(?:の|自身の)(' + all.slice().sort((a, b) => b.length - a.length).map(SA.esc).join('|') + ')(?!に(?:な|し|す)|だ|では|なら|ではな|じゃ)', 'g');
    let tot = 0, ok = 0, bad = '';
    rs.forEach(r => { let m; re.lastIndex = 0; while ((m = re.exec(r.t))) { tot++; if (want.indexOf(m[1]) >= 0) ok++; else if (!bad) bad = m[0] + ' | ' + H.ex(r, 120); } });
    return tot ? { should: tot, hit: ok, ex: bad } : { should: 0 };
  };
  add({ id: 'words.med', group: '性器の呼び方', label: '性器の呼び方：医学的（男性・攻め。「〇〇の陰茎」の割合）', type: 'cnt', words: true, mod: X => { set(X, 0, { pos: 'top', partWords: 'medical' }); set(X, 1, { pos: 'bottom' }); }, judge: ownWords(W.mMed || [], W.mAll || []) });
  add({ id: 'words.medF', group: '性器の呼び方', label: '性器の呼び方：医学的（女性・受け。「〇〇の膣」の割合）', type: 'cnt', words: true, mod: X => { set(X, 0, { gender: 'f', pos: 'bottom', partWords: 'medical' }); set(X, 1, { gender: 'm', pos: 'top' }); }, judge: ownWords(W.fMed || [], W.fAll || []) });
  add({ id: 'words.soft', group: '性器の呼び方', label: '性器の呼び方：ぼかす（男性・攻め）', type: 'cnt', words: true, mod: X => { set(X, 0, { pos: 'top', partWords: 'soft' }); set(X, 1, { pos: 'bottom' }); }, judge: ownWords(W.mSoft || [], W.mAll || []) });
  add({ id: 'words.direct', group: '性器の呼び方', label: '性器の呼び方：直接的（男性・攻め。描写の有無はほどほど）', type: 'cnt', words: true, mod: X => { set(X, 0, { pos: 'top', partWords: 'direct' }); set(X, 1, { pos: 'bottom' }); Object.keys(X.env).forEach(k => { if (k === 'lewd' && X.env[k] === 'high') X.env[k] = 'mid'; }); }, judge: ownWords((W.mDir || []).concat(['ちんぽ', 'おちんちん']), W.mAll || []) });
  add({ id: 'words.free', group: '性器の呼び方', label: '性器の呼び方：自由記入（男性器＝ムスコ）', type: 'cnt', words: true, mod: X => { set(X, 0, { pos: 'top', partM: 'ムスコ' }); set(X, 1, { pos: 'bottom' }); }, judge: ownWords(['ムスコ'], (W.mAll || []).concat(['ムスコ'])) });
  add({ id: 'body.bust', group: '体', label: '胸：豊か（女性・受け）→胸の語の一文', type: 'dir', mod: X => { set(X, 0, { gender: 'f', pos: 'bottom', bust: 'l' }); set(X, 1, { gender: 'm', pos: 'top' }); }, base: X => { set(X, 0, { gender: 'f', pos: 'bottom' }); set(X, 1, { gender: 'm', pos: 'top' }); }, judge: pairHas(/豊かな胸|たわわな胸|大きな胸/) });
  const RACES = [['vampire', '吸血鬼'], ['beast', '獣人'], ['demon', '魔族'], ['angel', '天使'], ['ghost', '幽霊'], ['android', 'アンドロイド']];
  RACES.forEach(([rc, jp]) => add({ id: 'race.' + rc, group: '体の特徴', label: '種族：' + jp + '（特徴の夜の文）', type: 'dir', mod: X => { set(X, 0, { race: rc }); },
    judge: R => { const rs = H.lx(R); if (!rs.length) return { should: 0 }; const lg = R.race.filter(x => x.who === X0 && x.kind === 'play').concat(R.feat.filter(x => x.who === X0 && /touch|hold|play/.test(x.kind))); return { should: 1, hit: lg.length ? 1 : 0, ex: H.ex(rs[0]) }; } }));
  add({ id: 'body.height', group: '体の特徴', label: '身長の差（190cm と 150cm）→抱き方の一文', type: 'dir', mod: X => { set(X, 0, { pos: 'top', height: '190' }); set(X, 1, { pos: 'bottom', height: '150' }); },
    judge: R => { const rs = H.pair(R); if (!rs.length) return { should: 0 }; const fr = SA.frags('height', HK.Attr.HEIGHT_FL && HK.Attr.HEIGHT_FL.hold); return { should: 1, hit: rs.some(r => SA.hasFrag(r.t, fr)) ? 1 : 0, ex: H.ex(rs[0]) }; } });
  add({ id: 'body.lust', group: '体の特徴', label: '気分：山場のあとの火照りの句', type: 'dir', mod: X => {},
    /* 気分（emotion.js の HK.Emo）：性的な場面のあとの記録に、火照りの句か、理由書きの「気分：…火照り」 */
    judge: R => { const rs = H.lx(R); if (!rs.length) return { should: 0 }; const fr = SA.frags('lust', [HK.Emo && HK.Emo.WORDS_LUST, HK.Emo && HK.Emo.AFTER_LUST]); const after = R.recs.filter(r => r.k > rs[0].k && r.t.indexOf(X0) >= 0); return { should: 1, hit: after.some(r => SA.hasFrag(r.t, fr) || /気分：[^／]*火照り/.test(r.why)) ? 1 : 0, ex: '' }; } });
  /* ===== 夜の性格 ===== */
  const NJ = { sadist: 'サド', maso: 'マゾ', mean: '意地悪', sweet: '甘々', shy: '恥じらい' };
  const nightJ = (nt, who) => (R) => {
    const rs = H.sexPair(R); if (!rs.length) return { should: 0 };
    const nm = R.names[who || 0], lab = NJ[nt];
    const viaWhy = rs.some(r => r.why.indexOf(nm + '＝' + lab) >= 0 || r.why.indexOf(nm + 'の夜の性格：' + lab) >= 0);
    const viaLog = R.att.some(g => g.who === nm && g.night === nt);
    return { should: 1, hit: viaWhy || viaLog ? 1 : 0, ex: H.ex(rs[0]) };
  };
  [['sadist', 'top'], ['mean', 'top'], ['sweet', 'top'], ['shy', 'top'], ['maso', 'bottom'], ['shy', 'bottom'], ['sweet', 'bottom']].forEach(([nt, ps]) => add({ id: 'night.' + nt + (ps === 'bottom' ? '.b' : ''), group: '夜の性格', label: '夜の性格：' + NJ[nt] + '（' + (ps === 'top' ? '攻め' : '受け') + '）', type: 'dir',
    mod: X => { set(X, 0, { pos: ps, night: nt }); set(X, 1, { gender: 'm', pos: ps === 'top' ? 'bottom' : 'top' }); }, judge: nightJ(nt) }));
  add({ id: 'night.match', group: '夜の性格', label: '夜の性格：相手に合わせる（相手はマゾ→サド）', type: 'dir', mod: X => { set(X, 0, { pos: 'top', night: 'match' }); set(X, 1, { pos: 'bottom', night: 'maso' }); }, judge: nightJ('sadist') });
  add({ id: 'night.for', group: '夜の性格', label: '相手ごとの夜の性格（この相手にはサド）', type: 'dir', mod: X => { set(X, 0, { pos: 'top', nightFor: { 1: 'sadist' } }); set(X, 1, { pos: 'bottom' }); }, judge: nightJ('sadist') });
  /* 夜の性格を喘ぎの呼び出しに渡しているか（喘ぎの選び方に夜の性格を加味する受け口） */
  add({ id: 'night.moan', group: '夜の性格', label: '夜の性格（マゾの受け）を喘ぎの呼び出しに渡している割合', type: 'cnt', mod: X => { set(X, 0, { pos: 'bottom', night: 'maso' }); set(X, 1, { gender: 'm', pos: 'top' }); },
    /* 喘ぎのエンジン（HK.Moan.pick）に届いた呼び出しのうち、夜の性格（night）が入っていたもの。attr-r18.js の HK.Attr.moanLog（無い版は、包みの外から見た ctx.night） */
    judge: R => { const ms = (R.mlog || R.moan).filter(m => m.who === X0); if (!ms.length) return { should: 0 }; return { should: ms.length, hit: ms.filter(m => m.night === 'maso').length, ex: R.mlog ? '' : '相手を渡す ' + ms.filter(m => m.top).length + '/' + ms.length }; } });
  /* 夜の性格で態度を選んだ人（2026-10-31 担当E4）：喘ぎの態度（HK.Moan.psOf）がその態度になっている割合。相手に合わせる人は、付き合う一文が入ったか */
  const attJ = (ps, onlyY) => (R) => { const ms = R.moan.filter(m => m.who === X0 && (!onlyY || m.pt === Y0)); if (!ms.length) return { should: 0 }; const bad = ms.find(m => m.ps !== ps); return { should: ms.length, hit: ms.filter(m => m.ps === ps).length, ex: bad ? bad.ps + '：' + bad.out : '' }; };
  add({ id: 'night.att.stern.b', group: '夜の性格', label: '夜の性格：厳格（受け）→喘ぎが厳格の表から出る割合', type: 'cnt', mod: X => { set(X, 0, { pos: 'bottom', night: 'stern', tone: 'free' }); set(X, 1, { gender: 'm', pos: 'top' }); }, judge: attJ('stern') });
  add({ id: 'night.att.proud', group: '夜の性格', label: '夜の性格：強気（攻め）→喘ぎ・攻めの声が強気の表から出る割合', type: 'cnt', mod: X => { set(X, 0, { pos: 'top', night: 'proud', tone: 'shy' }); set(X, 1, { pos: 'bottom' }); }, judge: attJ('proud') });
  add({ id: 'night.att.devoted.for', group: '夜の性格', label: '相手ごとの夜の性格（この相手には健気・受け）→その相手との喘ぎが健気の表から出る割合', type: 'cnt', mod: X => { set(X, 0, { pos: 'bottom', tone: 'proud', nightFor: { 1: 'devoted' } }); set(X, 1, { gender: 'm', pos: 'top' }); }, judge: attJ('devoted', true) });
  add({ id: 'night.accom', group: '夜の性格', label: '夜の性格：相手に合わせる（相手はマゾ）→付き合う一文', type: 'dir', mod: X => { set(X, 0, { pos: 'top', night: 'match' }); set(X, 1, { pos: 'bottom', night: 'maso' }); },
    judge: R => { const rs = H.sexPair(R); if (!rs.length) return { should: 0 }; const nm = R.names[0]; return { should: 1, hit: R.att.some(g => g.who === nm && g.accom) || rs.some(r => r.why.indexOf(nm + '＝相手に合わせる') >= 0) ? 1 : 0, ex: H.ex(rs[0]) }; } });
  /* ===== 夜の主導 ===== */
  const leadJ = (ld, re) => (R) => { const rs = H.sexPair(R); if (!rs.length) return { should: 0 }; const lg = R.lead.some(g => g.b === X0 && g.lead === ld); const tx = !re || rs.some(r => re.test(r.t)); return { should: 1, hit: lg && tx ? 1 : 0, ex: H.ex(rs[0]) }; };
  add({ id: 'lead.sasoi', group: '夜の主導', label: '夜の主導：誘い受け（受け）', type: 'dir', mod: X => { set(X, 0, { pos: 'bottom', lead: 'sasoi' }); set(X, 1, { gender: 'm', pos: 'top' }); }, judge: leadJ('sasoi') });
  add({ id: 'lead.osoi', group: '夜の主導', label: '夜の主導：襲い受け（受け）→跨る段', type: 'dir', mod: X => { set(X, 0, { pos: 'bottom', lead: 'osoi' }); set(X, 1, { gender: 'm', pos: '' }); }, judge: leadJ('osoi', /跨/) });
  /* ===== 喘ぎ ===== */
  const NOJA = /じゃ|のう|ぬ(?=[…。！？♡、」っ　]|$)|わらわ|ぞ(?=[…。！？♡、」　]|$)/;
  add({ id: 'moan.tone', group: '喘ぎ', label: '喘ぎの口調：のじゃ（ふだんは敬語・受け）→喘ぎにのじゃの語尾', type: 'rate', expect: 'up', mod: X => { set(X, 0, { pos: 'bottom', tone: 'polite', moanTone: 'noja' }); set(X, 1, { gender: 'm', pos: 'top' }); }, base: X => { set(X, 0, { pos: 'bottom', tone: 'polite' }); set(X, 1, { gender: 'm', pos: 'top' }); },
    judge: (R, B) => { const f = Q => Q.moan.filter(m => m.who === X0 && /[ぁ-ん一-龠]{3}/.test(m.out)); const a = f(R), b = f(B); return { p: a.filter(m => NOJA.test(m.out)).length, b: b.filter(m => NOJA.test(m.out)).length, pn: a.length, bn: b.length }; } });
  const segOf = (r, who, kinds) => (r.seg || []).filter(x => x.who === who && kinds.indexOf(x.t) >= 0);
  add({ id: 'moan.marks', group: '喘ぎ', label: '語尾の記号（♣）：性的な場面の台詞', type: 'cnt', mod: X => { set(X, 0, { marks: '♣' }); },
    judge: R => { const ls = H.lx(R).flatMap(r => segOf(r, 0, ['l', 'q'])); if (!ls.length) return { should: 0 }; return { should: ls.length, hit: ls.filter(x => x.s.indexOf('♣') >= 0).length, ex: (ls.filter(x => x.s.indexOf('♣') < 0)[0] || {}).s || '' }; } });
  add({ id: 'moan.marksM', group: '喘ぎ', label: '語尾の記号（♣）：性的な場面の喘ぎ（区分 m）', type: 'cnt', mod: X => { set(X, 0, { marks: '♣' }); },
    judge: R => { const ls = H.lx(R).flatMap(r => segOf(r, 0, ['m'])); if (!ls.length) return { should: 0 }; return { should: ls.length, hit: ls.filter(x => x.s.indexOf('♣') >= 0).length, ex: (ls.filter(x => x.s.indexOf('♣') < 0)[0] || {}).s || '' }; } });
  add({ id: 'moan.daku', group: '喘ぎ', label: '濁点喘ぎ（受け・男性向けの作風）→あ゛お゛', type: 'dir', mod: X => { set(X, 0, { pos: 'bottom', daku: true }); set(X, 1, { gender: 'm', pos: 'top' }); if ('style' in X.env) X.env.style = 'ero'; },
    judge: R => { const rs = H.lx(R); if (!rs.length) return { should: 0 }; const ms = R.moan.filter(m => m.who === X0); return { should: 1, hit: rs.some(r => /[あおんぁぉ]゛/.test(r.t)) || ms.some(m => /゛/.test(m.out)) ? 1 : 0, ex: H.ex(rs[0]) }; } });
  /* ♡喘ぎ（住人の設定 c.heart・全体の「♡：全員なし」。voice.js の V.unheart。2026-10-30 担当HT）：外した人の性的な場面の台詞・喘ぎ・発話に♡が 0、ほかの人の♡は残る */
  const HEART = /[♡♥]/;
  const heartJ = kinds => R => { const ls = H.lx(R).flatMap(r => segOf(r, 0, kinds)); if (!ls.length) return { should: 0 }; return { should: ls.length, hit: ls.filter(x => !HEART.test(x.s)).length, ex: (ls.filter(x => HEART.test(x.s))[0] || {}).s || '' }; };
  const heartMod = X => { set(X, 0, { pos: 'bottom', heart: false }); set(X, 1, { gender: 'm', pos: 'top' }); if ('style' in X.env) X.env.style = 'ero'; };
  add({ id: 'moan.heart', group: '喘ぎ', label: '♡喘ぎを外す（受け・男性向けの作風）：その人の台詞・喘ぎ・発話に♡が残らない割合', type: 'cnt', mod: heartMod, judge: heartJ(['l', 'q', 'm', 'u']) });
  add({ id: 'moan.heartKeep', group: '喘ぎ', label: '♡喘ぎを外す（受け）：相手（攻め）の♡は残る', type: 'rate', expect: 'keep', mod: heartMod, base: X => { set(X, 0, { pos: 'bottom' }); set(X, 1, { gender: 'm', pos: 'top' }); if ('style' in X.env) X.env.style = 'ero'; },
    judge: (R, B) => { const f = Q => H.lx(Q).flatMap(r => (r.seg || []).filter(x => x.who === 1)).reduce((a, x) => a + (x.s.match(/[♡♥]/g) || []).length, 0); return { p: f(R), b: f(B) }; } });
  add({ id: 'moan.heartAll', group: '喘ぎ', label: '喘ぎ声の調整「♡：全員なし」（男性向けの作風）：性的な場面の文に♡が残らない割合', type: 'cnt',
    pre: () => { if (HK.Moan && HK.Moan.setFit) HK.Moan.setFit({ heart: 'off' }); }, post: () => { if (HK.Moan && HK.Moan.setFit) HK.Moan.setFit(null); },
    mod: X => { set(X, 1, { gender: 'm', pos: 'top' }); if ('style' in X.env) X.env.style = 'ero'; },
    judge: R => { const ls = H.lx(R).flatMap(r => r.seg || [{ s: r.t }]); if (!ls.length) return { should: 0 }; return { should: ls.length, hit: ls.filter(x => !HEART.test(x.s)).length, ex: (ls.filter(x => HEART.test(x.s))[0] || {}).s || '' }; } });
  /* ===== 参加・相手 ===== */
  add({ id: 'part.noR18', group: '参加・相手', label: 'R18に参加しない（場面 0）', type: 'excl', skip: CORE, mod: X => { set(X, 0, { noR18: true }); }, base: X => {}, judge: exclJ(H.xSex) });
  add({ id: 'part.loveNG', group: '参加・相手', label: '恋愛・R18にしない相手（この二人の場面 0）', type: 'excl', mod: X => { noTies(X); set(X, 0, { loveNG: [1] }); set(X, 1, { loveNG: [0] }); }, base: X => { noTies(X); }, judge: exclJ(R => H.xWith(R, j => j === 1)) });
  const otherSex = withOther;
  add({ id: 'part.lockPick', group: '参加・相手', label: '性行為の相手の固定：固定した相手だけ（ほかの住人・モブ 0）', type: 'excl', mod: X => { set(X, 0, { sexLock: [1] }); }, base: X => {}, judge: (R, B) => exclJ(Q => otherSex(Q).concat(MOB_FREE[Q.sc] ? [] : H.xMob(Q)))(R, B) });
  /* 固定した相手が箱庭にいない（配役の外。画面の buildInput は -1 を入れる）：住人のだれとも、モブとも（「固定した相手だけ」）性的な場面にならない（2026-10-30 担当FS） */
  add({ id: 'part.lockGone', group: '参加・相手', label: '性行為の相手の固定：固定した相手が箱庭にいない（住人・モブ 0）', type: 'excl', mod: X => { set(X, 0, { sexLock: [-1] }); }, base: X => {}, judge: (R, B) => exclJ(Q => withAny(Q).concat(MOB_FREE[Q.sc] ? [] : H.xMob(Q)))(R, B) });
  add({ id: 'part.lockMob', group: '参加・相手', label: '性行為の相手の固定：固定＋モブ（ほかの住人 0）', type: 'excl', mod: X => { set(X, 0, { sexLock: [1], sexLockMob: true }); }, base: X => {}, judge: exclJ(otherSex) });
  add({ id: 'part.lockMobN', group: '参加・相手', label: '性行為の相手の固定：固定＋モブ（モブとの場面は残る）', type: 'rate', expect: 'keep', mod: X => { set(X, 0, { sexLock: [1], sexLockMob: true }); }, base: X => {}, judge: (R, B) => ({ p: H.mob(R).length, b: H.mob(B).length }) });
  add({ id: 'part.loveLock', group: '参加・相手', label: '恋愛相手の固定（性行為の固定は「合わせる」→ほかの住人 0）', type: 'excl', mod: X => { set(X, 0, { loveLock: [1] }); }, base: X => {}, judge: exclJ(otherSex) });
  add({ id: 'part.faithful', group: '参加・相手', label: '一途（恋人がいる間、ほかの住人との場面 0）', type: 'excl', mod: X => { set(X, 0, { faithful: true }); }, base: X => {}, judge: exclJ(otherSex) });
  /* 三人だけの配役（2026-10-27 担当HN。住人の設定「三人の場面（3P）」）：
     part.trio … 0 番を「しない」にすると、0 番の入る三人以上の性的な記録が 0 になるか（比べる側は「する」）
     part.trioLock … 0 番が 1 番に固定（2 番は固定なし）でも、1 番を中心にした三人の性的な記録が起きるか（固定のない配役と比べて、0 でなければよい） */
  const three = X => { X.chars.length = 3; X.ties = X.ties.filter(t => t.a < 3 && t.b < 3); };
  const trio3 = Q => Q.recs.filter(r => r.lewd && r.who.length >= 3 && r.who.indexOf(0) >= 0);
  /* 住人どうしの三人の場面がある箱庭だけ（ダンジョンの罠・魔物に何人も巻き込まれる場面は、箱庭の仕掛けなので 3P の欄は縛らない） */
  add({ id: 'part.trio', group: '参加・相手', label: '三人の場面（3P）：しない（0 番の入る三人以上の性的な場面 0）', type: 'excl', only: { whiteroom: 1, locker: 1, yakata: 1 },
    mod: X => { three(X); X.ties = []; set(X, 0, { trio: 'no' }); }, base: X => { three(X); X.ties = []; },
    judge: exclJ(trio3) });
  add({ id: 'part.trioLock', group: '参加・相手', label: '三人の場面（3P）：固定した相手が中心の三人（0 番は 1 番に固定。出られない部屋・三人の配役）', type: 'rate', expect: 'keep', only: { whiteroom: 1 },
    mod: X => { three(X); X.ties = []; set(X, 0, { sexLock: [1] }); }, base: X => { three(X); X.ties = []; },
    judge: (R, B) => { const f = Q => Q.recs.filter(r => r.lewd && r.who.length >= 3 && r.who.indexOf(0) >= 0 && r.who.indexOf(1) >= 0).length; return { p: f(R), b: f(B) }; } });
  add({ id: 'part.poly', group: '参加・相手', label: '複数の恋人：あり（二人以上の住人と夜。なしと比べる）', type: 'rate', expect: 'up', mod: X => { noTies(X); X.env.poly = 'any'; }, base: X => { noTies(X); X.env.poly = 'none'; },
    judge: (R, B) => { const f = Q => Q.chars.map((c, i) => new Set(Q.recs.filter(r => r.lewd && r.who.length === 2 && r.who.indexOf(i) >= 0).map(r => r.who.join('-'))).size).filter(n => n >= 2).length; return { p: f(R), b: f(B) }; } });
  /* ===== 全体の設定・描写 ===== */
  const lw = Q => Q.recs.filter(r => r.lewd);
  const avgLen = Q => { const l = lw(Q); return l.length ? Math.round(l.reduce((a, r) => a + r.t.length, 0) / l.length) : 0; };
  add({ id: 'g.style', group: '描写', label: '描写の作風：男性向け（♡の数。小説調と比べる）', type: 'rate', expect: 'on', mod: X => { if ('style' in X.env) X.env.style = 'ero'; }, base: X => { if ('style' in X.env) X.env.style = 'novel'; },
    judge: (R, B) => { const f = Q => lw(Q).reduce((a, r) => a + (r.t.match(/♡/g) || []).length, 0); return { p: f(R), b: f(B), na: !('style' in R.env) }; } });
  add({ id: 'g.lewd', group: '描写', label: '描写の濃さ：濃い（ほのめかすと比べた性的な記録の長さ）', type: 'rate', expect: 'up', mod: X => { ['lewd', 'ilewd'].forEach(k => { if (k in X.env) X.env[k] = 'high'; }); }, base: X => { if ('lewd' in X.env) X.env.lewd = 'low'; if ('ilewd' in X.env) X.env.ilewd = 'fade'; },
    judge: (R, B) => ({ p: avgLen(R), b: avgLen(B), na: !('lewd' in R.env) }) });
  add({ id: 'g.len', group: '描写', label: '描写の長さ：厚い（短いと比べた性的な記録の長さ）', type: 'rate', expect: 'up', mod: X => { if ('lewdLen' in X.env) X.env.lewdLen = 'thick'; }, base: X => { if ('lewdLen' in X.env) X.env.lewdLen = 'short'; },
    judge: (R, B) => ({ p: avgLen(R), b: avgLen(B), na: !('lewdLen' in R.env) }) });
  const MK = { force: '〔合意のない展開〕', preg: '〔妊娠〕', violence: '〔暴力をともなう性描写〕', abuse: '〔DVなど歪んだ関係〕' };
  Object.keys(MK).forEach(tg => add({ id: 'ct.' + tg, group: '内容のスイッチ', label: '内容のスイッチ：' + MK[tg] + '（展開の重さ：重い。入と切を比べる。理由の印の数）', type: 'rate', expect: 'on',
    mod: X => { X.env.heavy = 'dark'; }, base: X => { X.env.heavy = 'dark'; X.env.ct = (X.env.ct || '').split(',').filter(t => t && t !== tg).join(','); },
    judge: (R, B) => { const f = Q => Q.recs.filter(r => r.why.indexOf(MK[tg]) >= 0).length; return { p: f(R), b: f(B) }; } }));
  add({ id: 'g.heavy', group: '内容のスイッチ', label: '展開の重さ：重い（穏やかと比べた〔〕の印の数）', type: 'rate', expect: 'up', mod: X => { X.env.heavy = 'dark'; }, base: X => { X.env.heavy = 'mild'; },
    judge: (R, B) => { const f = Q => Q.recs.filter(r => /〔(?:合意のない展開|妊娠|暴力をともなう性描写|DVなど歪んだ関係)〕/.test(r.why)).length; return { p: f(R), b: f(B) }; } });
  /* ===== 箱庭の R18 の環境値（最大と最小で性的な記録の数を比べる。箱庭ごとに当てはまる値を全部） ===== */
  add({ id: 'env', group: '環境値', label: '箱庭の R18 の環境値（最大／最小の性的な記録の数）', type: 'env' });
  return L;
})()
`;

(async () => {
  const args = process.argv.slice(2).filter(a => !/^--/.test(a));
  const dir = args[0], N = +args[1] || 6, only = args[2] ? args[2].split(',') : null;
  const flag = k => { const a = process.argv.find(x => x === '--' + k || x.startsWith('--' + k + '=')); return a ? (a.indexOf('=') > 0 ? a.slice(a.indexOf('=') + 1) : true) : null; };
  const PF = flag('probe') ? String(flag('probe')).split(',') : null, WHY = !!flag('why'), LIST = !!flag('list'), JSONOUT = flag('json'), DUMP = flag('dump');
  const { browser, page, errors } = await openBuild(dir, 'r18', { lewdMode: 'direct' });
  await page.evaluate('(' + inPage.toString() + ')()');
  await page.evaluate('window.SA.PROBES = ' + PROBES);
  const meta = await page.evaluate(() => ({ probes: SA.PROBES.map(p => ({ id: p.id, group: p.group, label: p.label, type: p.type, expect: p.expect || '' })), scens: Object.keys(HK.SCENARIOS) }));
  if (LIST) { meta.probes.forEach(p => console.log(p.id.padEnd(20), p.type.padEnd(5), p.label)); await browser.close(); return; }
  /* --dump=箱庭#回 --probe=設定：その回の性的な記録（0 番の出るもの）を全文で出す（調べるとき用） */
  if (DUMP && PF) {
    const [dsc, ds] = String(DUMP).split('#');
    const d = await page.evaluate(({ id, sc, s }) => { const p = SA.PROBES.filter(x => x.id === id)[0]; const R = SA.runOne(sc, +s || 0, p); if (R.err) return [R.err]; return R.recs.filter(r => r.lewd && r.who.indexOf(0) >= 0).map(r => '[' + r.who.map(i => R.names[i]).join('・') + '] ' + r.t + (r.why ? '\n〔理由〕' + r.why : '')); }, { id: PF[0], sc: dsc, s: ds });
    d.forEach(x => console.log(x + '\n----'));
    await browser.close(); return;
  }
  const probes = meta.probes.filter(p => !PF || PF.some(f => p.id === f || p.id.startsWith(f)));
  const scens = meta.scens.filter(s => !only || only.indexOf(s) >= 0);
  /* 性的な場面が出ない箱庭は外す（ふだんの配役で N 回回して 0 件のもの） */
  const lewdN = await page.evaluate(({ scens, N }) => { const o = {}; scens.forEach(sc => { let n = 0; for (let s = 0; s < Math.min(N, 4); s++) { const R = SA.runOne(sc, s, {}); if (R.recs) n += R.recs.filter(r => r.lewd).length; } o[sc] = n; }); return o; }, { scens, N });
  const used = scens.filter(s => lewdN[s] > 0);
  const out = {}, exs = {};
  const t0 = Date.now();
  for (const p of probes) {
    out[p.id] = {};
    for (const sc of used) {
      const r = await page.evaluate(({ id, sc, N, WHY }) => {
        const p = SA.PROBES.filter(x => x.id === id)[0];
        if ((p.only && !p.only[sc]) || (p.skip && p.skip[sc])) return { na: 1 };
        const o = { should: 0, hit: 0, p: 0, b: 0, pn: 0, bn: 0, na: 0, runs: 0, ex: [], err: [] };
        if (p.type === 'env') {
          const scen = HK.SCENARIOS[sc];
          const knobs = (scen.env || []).filter(e => (e.max != null && /lewd|dose|shady|heat|prey|pleasure|traffic|ev$|aphro|night|zlust|harsh|wild|leak|romance/.test(e.id)) || (e.options && /^(?:kingsgame|cond|mode|ilewd|wolfnight|lovemode|desc|zraid|sane|mob|rival|second)$/.test(e.id)));
          o.knobs = knobs.map(e => {
            let hi = 0, lo = 0;
            for (let s = 0; s < N; s++) {
              const mk = v => SA.runOne(sc, s, { mod: X => { X.env[e.id] = v; } });
              const vh = e.max != null ? e.max : (e.options.filter(x => /^(?:yes|h|lewd|high|on|full|none|many)$/.test(x.v))[0] || e.options[0]).v;
              const vl = e.max != null ? e.min : (e.options.filter(x => /^(?:no|off|peace|fade|dark|kiss|auto|keep)$/.test(x.v))[0] || e.options[e.options.length - 1]).v;
              const a = mk(vh), b = mk(vl);
              if (a.recs) hi += a.recs.filter(x => x.lewd).length;
              if (b.recs) lo += b.recs.filter(x => x.lewd).length;
            }
            return { id: e.id, hi, lo };
          });
          return o;
        }
        for (let s = 0; s < N; s++) {
          const R = SA.runOne(sc, s, p);
          if (R.err) { o.err.push(R.err); continue; }
          const B = p.base ? SA.runOne(sc, s, { mod: p.base, words: p.words }) : null;
          if (B && B.err) { o.err.push(B.err); continue; }
          o.runs++;
          const j = p.judge(R, B) || {};
          if (j.na) o.na = 1;
          if (p.type === 'rate') { o.p += j.p || 0; o.b += j.b || 0; o.pn += j.pn || 0; o.bn += j.bn || 0; continue; }
          o.should += j.should || 0; o.hit += j.hit || 0;
          if (B && p.type === 'dir') { const jb = p.judge(B, null) || {}; o.bs = (o.bs || 0) + (jb.should || 0); o.bh = (o.bh || 0) + (jb.hit || 0); }
          if (WHY && (j.should || 0) > (j.hit || 0) && j.ex && o.ex.length < 3) o.ex.push(sc + '#' + s + ' ' + j.ex);
        }
        return o;
      }, { id: p.id, sc, N, WHY });
      out[p.id][sc] = r;
    }
    process.stderr.write('.');
  }
  process.stderr.write(' ' + Math.round((Date.now() - t0) / 1000) + 's\n');
  /* ---- 表 ---- */
  const mark = (p, r) => {
    if (!r || r.na) return '－';
    if (p.type === 'env') return (r.knobs || []).map(k => k.id + ' ' + k.hi + ':' + k.lo + (k.hi > k.lo ? '◯' : k.hi === k.lo ? '＝' : '✕')).join(' ') || '－';
    if (p.type === 'rate') {
      const v = r.pn != null && (r.pn || r.bn) ? (r.pn ? Math.round(r.p / r.pn * 100) : 0) + '%:' + (r.bn ? Math.round(r.b / r.bn * 100) : 0) + '%' : r.p + ':' + r.b;
      if (!r.p && !r.b) return '－';
      const pr = r.pn != null && (r.pn || r.bn) ? (r.pn ? r.p / r.pn : 0) : r.p, br = r.pn != null && (r.pn || r.bn) ? (r.bn ? r.b / r.bn : 0) : r.b;
      const ok = p.expect === 'up' ? pr > br * 1.1 : p.expect === 'down' ? pr < br * 0.9 : p.expect === 'on' ? pr > 0 && br === 0 : p.expect === 'keep' ? pr >= br * 0.5 && (pr > 0 || br === 0) : p.expect === 'riba' ? pr > 0 && br > 0 : true;
      const part = p.expect === 'on' ? pr > br : false;
      return v + (ok ? '◯' : part ? '△' : '✕');
    }
    if (!r.should) return '－';
    const q = r.hit / r.should;
    return r.hit + '/' + r.should + (q >= 0.8 ? '◯' : q >= 0.2 ? '△' : '✕') + (r.bs != null ? '(なし' + r.bh + '/' + r.bs + ')' : '');
  };
  console.log('箱庭（性的な場面のあるもの）: ' + used.join(' ') + '　回数 N=' + N + (scens.length > used.length ? '　（外した箱庭：' + scens.filter(s => !used.includes(s)).join(' ') + '）' : ''));
  let grp = '';
  const summary = [];
  for (const p of probes) {
    if (p.group !== grp) { grp = p.group; console.log('\n■ ' + grp); }
    const cells = used.map(sc => sc + ' ' + mark(p, out[p.id][sc]));
    let tot = '';
    if (p.type === 'dir' || p.type === 'excl' || p.type === 'cnt') {
      const s = used.reduce((a, sc) => a + ((out[p.id][sc] && !out[p.id][sc].na && out[p.id][sc].should) || 0), 0), h = used.reduce((a, sc) => a + ((out[p.id][sc] && !out[p.id][sc].na && out[p.id][sc].hit) || 0), 0);
      tot = s ? '計 ' + h + '/' + s + '（' + Math.round(h / s * 100) + '%）' : '計 －';
      summary.push({ id: p.id, label: p.label, hit: h, should: s });
    } else summary.push({ id: p.id, label: p.label, cells: used.map(sc => mark(p, out[p.id][sc])).filter(x => x !== '－').length });
    console.log('  ' + p.id.padEnd(18) + ' ' + p.label + '\n     ' + tot + '　' + cells.join('　'));
    if (WHY) used.forEach(sc => { const r = out[p.id][sc]; (r && r.ex || []).forEach(x => console.log('       例) ' + x.slice(0, 400))); });
    used.forEach(sc => { const r = out[p.id][sc]; if (r && r.err && r.err.length) console.log('       ERR ' + sc + ': ' + r.err[0].slice(0, 200)); });
  }
  if (JSONOUT) fs.writeFileSync(JSONOUT, JSON.stringify({ N, used, probes, out, summary }, null, 1));
  console.log('\npageerr', JSON.stringify(errors.slice(0, 3)));
  await browser.close();
})();
