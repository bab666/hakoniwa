/* 三人の場面の形の計測（2026-11-03。設計は docs/reports/2026-11-03/trio-sex-design.md）
   使い方: node trio-shape-audit.js <ビルドのディレクトリ> [1箱庭・1配役あたりの回数=4] [箱庭id,…] [--why] [--show=2]
     追加パックの新婚生活：HK_PACK_CODES=DDDD-EEEE-FFFF HK_ONLY_SCEN=set-b-shinkon node trio-shape-audit.js <試しのフォルダ>/hakoniwa-full 4 set-b-shinkon
   三人の場面（HK.Trio3 の組み立て。出られない部屋・媚薬ロッカー・吹雪の館・新婚生活の三人婚など）を、受け攻めの設定を振った三人で回して数える：
     ・形ごとの件数：攻め×攻め×受け（twoOne）・攻め×受け・受け（oneTwo）・攻め→リバ→受け（sandwich）・見せつけ（show）・輪（ring）・触れ合いだけ（touch）、変化ごと、配役（受け攻めの設定）ごと
     ・設定に合わない形（0 件が合格）：形の組の向きが HK.Pos.orients に無い／受ける人が自分で攻めを選んでいる（HK.Pos.hardTopIn）／
       sandwich の真ん中がリバ・おまかせでない（HK.Pos.midOk）・後ろの人が跨る組（女性の攻め×男性）
     ・場面の状態（0 件が合格）：同じ動き（HK.SexFlow.MOTION）の二度出し・繋がったあとの脱がせる文・応答を求める攻めの台詞のあとに受けの台詞が無い
     ・女性の攻めと後ろの二重（2026-11-05。0 件が合格）：女性の攻め（男性器なし）× 男性の受けの組で攻めが跨る・自分の中へ受け入れる文（仕上がった記録の文）／
       受けの後ろに別の人が入る形（twoOne でもう一人の攻めも同じ受けを抱く）に、プレイの段（ero-play-r18.js の HK.EroPlay）が前立腺・結腸を差した
     ・ペニバンとフタナリ（2026-11-04。0 件が合格）：ペニバン（張り型）の文が、女性の攻め（男性器なし）× 受けの組（HK.Trio3.strapOk）でない人・組に出た／
       ペニバンを使った場面の印（info.spE）が無いのに文が出た／フタナリ（性器の欄が「両方」）の攻めの組が男性器で繋がる組（m）になっていない／
       ペニバンの出る割合（ペニバンを使える組のある場面のうち。目安 2〜3 割）が 12〜40% の外（使える場面が 60 件以上のときだけ判定）
       配役の体：m 男性・f 女性・x フタナリ（女性で性器の欄が「両方」）。環境変数 HK_TRIO_BODY=fmm,xmf のように体を絞れる
   文の数（trio-form-text-r18.js の表）も出す（分岐ごとの地の文の数の最小） */
'use strict';
const core = require('./audit/core.js');
const path = require('path');

const DEF_SCEN = ['whiteroom', 'locker', 'yakata', 'set-b-shinkon'];

/* ---------- パス trio（ページの中） ---------- */
const PASS = function* (HK, opt) {
  const N = opt.N || 4;
  let ids = (opt.only || ['whiteroom', 'locker', 'yakata', 'set-b-shinkon']).filter(id => HK.SCENARIOS[id]);
  const NAMES = ['アキラ', 'ミナト', 'ユキノ'];
  /* 受け攻めの設定（三人）× 体（性別・性器） */
  const POS = [['top', 'top', 'bottom'], ['top', 'bottom', 'bottom'], ['top', 'riba', 'bottom'], ['riba', 'riba', 'riba'], ['', '', ''], ['top', 'top', 'top'], ['top', 'riba', 'riba'], ['riba', 'bottom', 'bottom']];
  let BODY = [['m', 'm', 'f'], ['m', 'f', 'f'], ['f', 'f', 'f'], ['f', 'm', 'm'], ['m', 'm', 'm'], ['f', 'f', 'm'], ['m', 'f', 'm'], ['x', 'm', 'f'], ['x', 'f', 'm'], ['f', 'x', 'm']];
  if (opt.body) BODY = opt.body.split(',').map(b => b.split(''));
  for (const sc of ids) {
    const scen = HK.SCENARIOS[sc];
    for (let pi = 0; pi < POS.length; pi++) for (let bi = 0; bi < BODY.length; bi++) for (let s = 0; s < N; s++) {
      const k = pi * 100 + bi * 10 + s;
      const chars = [0, 1, 2].map(i => ({ name: NAMES[i], gender: BODY[bi][i] === 'x' ? 'f' : BODY[bi][i], likes: 'both', pos: POS[pi][i], posLike: '', tone: '', fp: '', memo: '', color: '', call: '', calls: {}, loveLock: '', genital: BODY[bi][i] === 'x' ? 'mf' : '',
        eg: { CP: (k * 7 + i * 5) % 21, NP: (k * 3 + i * 11) % 21, A: (k * 13 + i * 3) % 21, FC: (k * 5 + i * 7) % 21, AC: (k * 11 + i * 3) % 21 } }));
      const env = {};
      (scen.env || []).forEach(e => { env[e.id] = e.def != null ? e.def : (e.options && e.options[0] ? e.options[0].v : (e.min != null ? e.min : '')); });
      (scen.env || []).forEach(e => { if (e.max != null && /lewd|dose|heat|aphro|night|pleasure/.test(e.id)) env[e.id] = e.max; });
      env.lewd = s % 2 ? 'high' : 'mid'; env.lewdLen = s % 3 === 1 ? 'mix' : 'thick'; env.style = s % 3 === 2 ? 'ero' : 'novel';
      if (sc === 'whiteroom') env.multi = 'only';
      if (HK.Content) env.ct = HK.Content.TAGS.map(t => t.id).join(',');
      const ties = [{ a: 0, b: 1, type: 'lover' }, { a: 0, b: 2, type: 'lover' }, { a: 1, b: 2, type: 'lover' }];
      const perChar = chars.map(() => ({ action: 'auto', goal: 'auto', stats: {}, weapon: '', pick: sc === 'set-b-shinkon' ? { part: 'couple' } : {} }));
      yield { sc, s: k, input: { scenId: sc, seed: 7000 + k, env, chars, perChar, ties }, meta: { pos: POS[pi].map(x => x || '任').join('/'), body: BODY[bi].join('') } };
    }
  }
};

/* ---------- 判定 trio（ページの中） ---------- */
const JUDGE = function (HK, opt) {
  const X = HK.Trio3, P = HK.Pos, F = HK.SexFlow;
  const out = { scenes: 0, dupS: 0, byP: {}, byPV: {}, byPos: {}, bySc: {}, bad: 0, badEx: [], flow: { motion: 0, undress: 0, pending: 0, dupS: 0 }, flowEx: [], ex: {}, touch: 0, noX: !X,
    sp: { cap: 0, n: 0, byP: {}, bySc: {}, byBody: {}, bad: 0, ex: [] }, futa: { n: 0, m: 0, bad: 0, ex: [] }, strapEx: [] };
  if (!X) return { finish() { return out; } };
  let cur = null;
  const SHOW = opt.show == null ? 2 : opt.show;
  const add = (o, k) => { o[k] = (o[k] || 0) + 1; };
  const has = (list, a, b) => list.some(e => e[0] === a && e[1] === b);
  const edges = sp => ({ oneTwo: [[sp.t, sp.m], [sp.t, sp.u]], twoOne: [[sp.t, sp.u], [sp.m, sp.u]], sandwich: [[sp.t, sp.m], [sp.m, sp.u]], ring: [[sp.t, sp.m], [sp.m, sp.u], [sp.u, sp.t]], show: [[sp.t, sp.m]] })[sp.p] || [];
  const judgeShape = (sp, g) => {
    const why = [];
    edges(sp).forEach(e => { if (!has(P.orients(e[0], e[1]), e[0], e[1])) why.push(e[0].name + '→' + e[1].name + ' の向きが無い'); });
    const bots = { oneTwo: [sp.m, sp.u], twoOne: [sp.u], sandwich: [sp.m, sp.u], show: [sp.m], ring: [] }[sp.p] || [];
    bots.forEach(b => { if (P.hardTopIn(b, g.filter(c => c !== b))) why.push(b.name + 'は自分で攻めを選んでいるのに受け'); });
    if (sp.p === 'sandwich') {
      if (P.midOk && !P.midOk(sp.m, sp.t, sp.u)) why.push('真ん中の' + sp.m.name + 'がリバ・おまかせでない（' + P.of(sp.m, sp.t) + '/' + P.of(sp.m, sp.u) + '）');
      if (X.edgeKind(sp.t, sp.m) === 'fm') why.push('後ろの人が跨る組');
    }
    return why;
  };
  const NAR = t => String(t).replace(/「[^」]*」/g, '');
  const sents = t => NAR(t).split(/(?<=[。！？])/).filter(x => x.trim());
  X.onScene = function (info, all, C) {
    if (!cur) return;
    const sp = { p: info.p, t: info.who.t, m: info.who.m, u: info.who.u }, g = [sp.t, sp.m, sp.u];
    out.scenes++;
    if (cur.scs) cur.scs.push({ sp, E: (C && C.E || []).slice(), g });
    add(out.byP, sp.p); add(out.byPV, sp.p + (info.v ? '/' + info.v : '') + (info.form ? '' : '（形の段なし）'));
    const pk = cur.meta.pos + ' ' + cur.meta.body; out.byPos[pk] = out.byPos[pk] || {}; add(out.byPos[pk], sp.p);
    out.bySc[cur.sc] = out.bySc[cur.sc] || {}; add(out.bySc[cur.sc], sp.p);
    const why = judgeShape(sp, g);
    /* 体の向き（2026-11-04 利用者の報告「三人婚で受けが入れる側になる」）：
       rev＝挿入の向きが受け攻めと逆（形の組の受けの男性器を、攻めの中へ呑みこむ・迎え入れる文）／fem＝男性器の無い人の男性器（女性器だけの人が入れる側） */
    { const MW = '(?:男性器|肉棒|男根|昂り|熱いもの|ちんぽ|竿|モノ|陰茎|ペニス)', ss = sents(all);
      edges(sp).forEach(e => { const x = e[0].name, y = e[1].name;
        const r1 = new RegExp(y + 'の[^。、]{0,4}' + MW + 'を[^。]{0,12}' + x + 'の[^。]{0,10}(?:中|ナカ|奥|膣|内)'), r2 = new RegExp(x + '[はが][^。]{0,24}' + y + 'の[^。、]{0,4}' + MW + 'を[^。]{0,16}(?:呑みこ|呑み込|迎え入れ|受け入れ)');
        const hit = ss.filter(t => r1.test(t) || r2.test(t));
        if (hit.length) { out.rev = (out.rev || 0) + 1; if (out.revEx = out.revEx || [], out.revEx.length < 10) out.revEx.push(cur.sc + '#' + cur.s + ' ' + sp.p + ' ' + x + '→' + y + ' | ' + hit[0]); } });
      g.filter(c => P.hasM && !P.hasM(c)).forEach(c => { const hit = ss.filter(t => new RegExp(c.name + 'の\\{?' + MW).test(t));
        if (hit.length) { out.fem = (out.fem || 0) + 1; if (out.femEx = out.femEx || [], out.femEx.length < 10) out.femEx.push(cur.sc + '#' + cur.s + ' ' + sp.p + ' ' + c.name + ' | ' + hit[0]); } }); }
    /* ペニバン・フタナリ（2026-11-04） */
    { const SPW = /ペニバン|張り型/, ss = sents(all).filter(t => SPW.test(t)), spE = info.spE || [], scK = cur.sc;
      const bK = cur.meta.body, bb = out.sp.byBody[bK] = out.sp.byBody[bK] || { scenes: 0, cap: 0, n: 0, futaM: 0 };
      bb.scenes++;
      if (info.strapCap) { out.sp.cap++; bb.cap++; out.sp.bySc[scK] = out.sp.bySc[scK] || { cap: 0, n: 0 }; out.sp.bySc[scK].cap++; }
      if (info.strap) { out.sp.n++; bb.n++; add(out.sp.byP, sp.p); if (out.sp.bySc[scK]) out.sp.bySc[scK].n++; }
      if (g.some(c => P.genSet(c) === 'mf' && new RegExp(c.name + 'の\\{?(?:男性器|肉棒|男根|昂り|熱いもの|ちんぽ|竿|モノ|陰茎|ペニス)').test(NAR(all)))) bb.futaM++;
      const spBad = [];
      if (ss.length && !info.strap) spBad.push('ペニバンの場面の印が無いのに文が出た');
      spE.forEach(e => { if (!X.strapOk || !X.strapOk(e[0], e[1])) spBad.push(e[0].name + '→' + e[1].name + ' はペニバンを使える組でない'); if (!has(edges(sp), e[0], e[1])) spBad.push(e[0].name + '→' + e[1].name + ' は形の組でない'); });
      /* 文の上で、ペニバンを着けた・張り型の持ち主の名前（「Xは腰にペニバン」「ペニバンを着けたX」「Xの張り型」） */
      ss.forEach(t => g.forEach(c => { const n = c.name;
        if (new RegExp(n + '(?:は|が)[^。、]{0,10}腰に(?:着けた|締めた)?ペニバン|ペニバンを着けた' + n + '|' + n + 'の(?:腰の)?張り型').test(t) && !spE.some(e => e[0] === c)) spBad.push(n + 'が張り型を使う文（ペニバンの組の攻めでない）| ' + t); }));
      if (spBad.length) { out.sp.bad++; if (out.sp.ex.length < 10) out.sp.ex.push(cur.sc + '#' + cur.s + ' ' + sp.p + ' ' + spBad.join('・')); }
      if (info.strap && out.strapEx.length < 6) out.strapEx.push(cur.sc + '#' + cur.s + ' ' + sp.p + '/' + info.v + ' [' + g.map(c => c.name + ':' + (P.of(c) || '任') + (P.genSet(c) === 'mf' ? 'x' : c.gender)).join(' ') + '] ' + all.slice(0, 900));
      /* フタナリの攻め：形の組で攻めになる、性器の欄が「両方」の人の組は m（{男性器} で挿れる）で、ペニバン・指だけの組（sp・fm・ff）にならない */
      edges(sp).forEach(e => { if (P.genSet(e[0]) !== 'mf') return; out.futa.n++; const k = X.edgeKind(e[0], e[1]);
        if (k === 'm') out.futa.m++;
        if (k !== 'm' && k !== 'n' || spE.some(x => x[0] === e[0])) { out.futa.bad++; if (out.futa.ex.length < 10) out.futa.ex.push(cur.sc + '#' + cur.s + ' ' + sp.p + ' ' + e[0].name + '→' + e[1].name + ' 組の体 ' + k); } });
    }
    if (why.length) { out.bad++; if (out.badEx.length < 30) out.badEx.push(cur.sc + '#' + cur.s + ' ' + sp.p + ' [' + g.map(c => c.name + ':' + (P.of(c) || '-') + c.gender).join(' ') + '] ' + why.join('・')); }
    /* 場面の状態 */
    if (F && F.MOTION) {
      const n = NAR(all), dup = Object.keys(F.MOTION).filter(k => k !== 'flipRear' && k !== 'legsUp' && (n.match(new RegExp(F.MOTION[k].source, 'g')) || []).length >= 2);
      if (dup.length) { out.flow.motion++; if (out.flowEx.length < 20) out.flowEx.push(cur.sc + '#' + cur.s + ' 動きの二度出し ' + dup.join(',') + ' | ' + dup.map(k => (n.match(new RegExp('[^。]*' + F.MOTION[k].source + '[^。]*。', 'g')) || []).join(' ／ ')).join(' ')); }
      const ss = sents(all), fi = ss.findIndex(x => F.RE.insert.test(x) || F.RE.inside.test(x));
      if (fi >= 0 && ss.slice(fi + 1).some(x => F.RE.undress.test(x))) { out.flow.undress++; if (out.flowEx.length < 20) out.flowEx.push('繋がったあとの脱がせる | ' + ss.slice(fi).join('').slice(0, 200)); }
      /* 応答待ち：攻めの台詞（形の組の左の人）が応答を求め、次の台詞が受け（形の組の右の人）のものでない */
      /* 事後の段（呼ぶ側の事後の一言・三人の事後の一言）は見ない（HK.SexFlow の点検が呼ぶ側の事後を見ないのと同じ） */
      const o3 = C && C._out ? C._out : null, body = o3 ? o3.fore + o3.in + o3.mid + o3.peak : all;
      /* 攻めの台詞：形の組の左の人のうち、この場面で受けに回らない人（sandwich の真ん中は、挟まれて言う台詞が多いので見ない） */
      const botN = edges(sp).map(e => e[1].name), tops = edges(sp).map(e => e[0].name).filter(n => botN.indexOf(n) < 0), names = g.map(c => c.name).sort((a, b) => b.length - a.length), lines = []; const re = /([^「」。、\s]{1,24})「(?:＠[^＠]*＠)?([^」]*)」/g; let m;
      while ((m = re.exec(body))) lines.push({ who: names.filter(n => m[1].slice(-n.length) === n)[0] || '', s: m[2].split('｜')[0] });
      lines.forEach((l, i) => {
        if (tops.indexOf(l.who) < 0 || /次|また|今度|いつか|気が向/.test(l.s)) return;
        const d = (F.DEMAND || []).some(x => x[1].test(l.s));
        if (!d) return;
        const tgt = edges(sp).filter(e => e[0].name === l.who).map(e => e[1].name);
        const nx = lines[i + 1];
        if (!nx || tgt.indexOf(nx.who) < 0) {
          /* 地の文のリアクション（受けの名前のあとに首を振る・答える など）があればよい */
          const after = body.slice(body.indexOf(l.s) + l.s.length, body.indexOf(l.s) + l.s.length + 160);
          if (tgt.some(b => new RegExp(b + '(?:[はが][^。]{0,40}(?:首を|唇を噛|顔を|答え|頷|目を|声|名前を呼|呟|囁)|の(?:声|喉|唇|顔)[はがも])').test(after))) return;
          out.flow.pending++; if (out.flowEx.length < 20) out.flowEx.push(cur.sc + '#' + cur.s + ' ' + sp.p + ' 応答待ち「' + l.s + '」→ ' + (nx ? nx.who + '「' + nx.s + '」' : '（台詞なし）') + ' …' + body.slice(Math.max(0, body.indexOf(l.s) - 120), body.indexOf(l.s) + 220).replace(/\n/g, ' '));
        }
      });
    }
    /* 同じ地の文の二度出し（14 字以上） */
    { const seenS = {}; sents(all).forEach(x => { const k = x.replace(/[\s　―]/g, ''); if (k.length < 14) return; if (seenS[k]) { out.flow.dupS = (out.flow.dupS || 0) + 1; if (out.flowEx.length < 20) out.flowEx.push(cur.sc + '#' + cur.s + ' 同じ文の二度出し ' + k + ' | ' + all); } seenS[k] = 1; }); }
    const key = sp.p + '/' + (info.v || '-');
    const ex = out.ex[key] || (out.ex[key] = []);
    if (ex.length < SHOW) ex.push(cur.sc + '#' + cur.s + ' [' + g.map(c => c.name + ':' + (P.of(c) || '任') + c.gender).join(' ') + '] ' + all);
  };
  if (X.touchScene && !X.touchScene._aud) {
    const t0 = X.touchScene;
    X.touchScene = function () { const r = t0.apply(this, arguments); if (cur && r) { out.touch++; add(out.byP, 'touch'); out.bySc[cur.sc] = out.bySc[cur.sc] || {}; add(out.bySc[cur.sc], 'touch'); const ex = out.ex['touch'] || (out.ex['touch'] = []); if (ex.length < SHOW) ex.push(cur.sc + '#' + cur.s + ' ' + r); } return r; };
    X.touchScene._aud = true;
  }
  /* 女性の攻め（男性器なし）× 男性の受けの組（fm）で、攻めが跨る・受け入れる文（2026-11-05。仕上がった記録の文で見る：HK.FM.fix・ero-play の直しのあと）／
     受けの後ろに別の人が入る形（twoOne でもう一人の攻めも同じ受けに挿れる・指を入れる組）に、プレイの段（ero-play-r18.js）が前立腺・結腸を差した */
  const EPL = HK.EroPlay;
  const fmRideOf = (texts, scs) => {
    const hit = [];
    scs.forEach(sc => sc.E.forEach(e => {
      const T = e[0], U = e[1];
      if (X.edgeKind(T, U) !== 'fm') return;
      texts.forEach(t => sents(t).forEach(x => { const b = NAR(x);
        if (b.indexOf(T.name) < 0 || b.indexOf(U.name) < 0 || /指|舌|張り型|ペニバン|ディルド|バイブ|玩具/.test(b) || new RegExp(U.name + '(?:は|が|も)[^。]{0,30}跨').test(b)) return;
        if ((new RegExp(T.name + '(?:は|が|も)[^。]{0,30}跨').test(b) && /呑み込|呑みこ|飲み込|咥え込|迎え入れ|腰を落と|腰を沈め|自分の(?:中|奥|ナカ)|の(?:ナカ|中)へ導|受け入れ/.test(b)) ||
          new RegExp(T.name + 'の(?:ナカ|\\{ナカ\\}|膣内|膣|中|奥|内側)(?:に包まれ|で脈打|に咥え|で締め)').test(b)) hit.push(T.name + '→' + U.name + ' | ' + x); }));
    }));
    return hit;
  };
  return {
    begin(run) { cur = run; cur.scs = []; if (EPL) EPL.log = []; },
    end(run, res) {
      if (cur && res) {
        const texts = (res.log || []).map(e => e && typeof e.text === 'string' ? e.text : '').filter(Boolean);
        const fr = fmRideOf(texts, cur.scs);
        if (fr.length) { out.fmRide = (out.fmRide || 0) + 1; (out.fmRideEx = out.fmRideEx || []).length < 10 && out.fmRideEx.push(cur.sc + '#' + cur.s + ' ' + fr[0]); }
        ((EPL && EPL.log) || []).forEach(l => {
          if (l.src !== 'trio' || !l.keys || !l.keys.some(k => k === 'pros' || k === 'colon')) return;
          const sc = cur.scs.filter(x => x.E[0] && x.E[0][0].name === l.t && x.E[0][1].name === l.u)[0];
          if (!sc) return;
          const T = sc.E[0][0], U = sc.E[0][1];
          if (sc.E.some(e => e[1] === U && e[0] !== T && /^(?:m|fm)$/.test(X.edgeKind(e[0], U)))) { out.backDbl = (out.backDbl || 0) + 1; (out.backDblEx = out.backDblEx || []).length < 10 && out.backDblEx.push(cur.sc + '#' + cur.s + ' ' + sc.sp.p + ' ' + l.t + '→' + l.u + ' ' + l.keys.join(',')); }
        });
      }
      if (EPL) EPL.log = null;
      cur = null;
    },
    error() { cur = null; },
    finish() { return out; }
  };
};

const FORM_JA = { twoOne: '攻め×攻め×受け', oneTwo: '攻め×受け・受け', sandwich: '攻め→リバ→受け', show: '見せつけ', ring: '輪', touch: '触れ合いだけ' };
function print(r, errors, o) {
  if (!r) { console.log('結果なし'); return; }
  if (r.noX) { console.log('HK.Trio3 がありません（全年齢？）'); return; }
  console.log('三人の場面', r.scenes, '件（触れ合いだけ', r.touch, '件）');
  console.log('形ごと：' + Object.keys(r.byP).map(k => (FORM_JA[k] || k) + ' ' + r.byP[k]).join('　'));
  console.log('形／変化ごと：' + Object.keys(r.byPV).sort().map(k => k + ' ' + r.byPV[k]).join('　'));
  console.log('箱庭ごと：' + Object.keys(r.bySc).map(k => k + '｛' + Object.keys(r.bySc[k]).map(p => p + ' ' + r.bySc[k][p]).join('・') + '｝').join('　'));
  console.log('受け攻めの設定（三人）×体 ごと：');
  Object.keys(r.byPos).sort().forEach(k => console.log('  ' + k.padEnd(22) + Object.keys(r.byPos[k]).map(p => p + ' ' + r.byPos[k][p]).join('・')));
  console.log('設定に合わない形：' + r.bad + ' 件');
  console.log('挿入の向きが受け攻めと逆：' + (r.rev || 0) + ' 件／男性器の無い人の男性器（女性器だけの人が入れる側）：' + (r.fem || 0) + ' 件');
  console.log('女性の攻め（男性器なし）が男性の受けに跨る・受け入れる文：' + (r.fmRide || 0) + ' 件／受けの後ろに別の人がいるのに前立腺・結腸の段：' + (r.backDbl || 0) + ' 件');
  (r.fmRideEx || []).concat(r.backDblEx || []).forEach(x => console.log('    ' + String(x).slice(0, 300)));
  (r.revEx || []).concat(r.femEx || []).forEach(x => console.log('    ' + x));
  r.badEx.forEach(x => console.log('    ' + x));
  const sp = r.sp || { cap: 0, n: 0, byP: {}, bySc: {}, ex: [] }, fu = r.futa || { n: 0, m: 0, ex: [] };
  console.log('ペニバン：使える組のある場面 ' + sp.cap + ' 件のうち ' + sp.n + ' 件（' + (sp.cap ? Math.round(sp.n * 1000 / sp.cap) / 10 : 0) + '%。目安 2〜3 割）　形ごと：' + Object.keys(sp.byP).map(k => k + ' ' + sp.byP[k]).join('・') +
    '　箱庭ごと：' + Object.keys(sp.bySc).map(k => k + ' ' + sp.bySc[k].n + '/' + sp.bySc[k].cap).join('・'));
  console.log('ペニバンの文が合わない人・組に出た：' + (sp.bad || 0) + ' 件／フタナリの攻めの組 ' + fu.n + ' 組のうち男性器で繋がる組 ' + fu.m + '・合わない組 ' + (fu.bad || 0) + ' 件／割合が 12〜40% の外：' + strapRateBad(r) + ' 件');
  sp.ex.concat(fu.ex).forEach(x => console.log('    ' + x));
  console.log('体ごと（場面・ペニバンを使える場面・使った場面・フタナリの男性器の文がある場面）：' + Object.keys(sp.byBody || {}).sort().map(k => { const b = sp.byBody[k]; return k + ' ' + b.scenes + '/' + b.cap + '/' + b.n + '/' + b.futaM; }).join('　'));
  if (o.why) (r.strapEx || []).forEach(x => console.log('  ペニバンの例 ' + x));
  console.log('場面の状態：動きの二度出し ' + r.flow.motion + '・繋がったあとの脱がせる ' + r.flow.undress + '・応答待ちのあと受けの台詞なし ' + r.flow.pending + '・同じ地の文の二度出し ' + (r.flow.dupS || 0));
  if (o.why) r.flowEx.forEach(x => console.log('    ' + x));
  if (o.why) Object.keys(r.ex).sort().forEach(k => { console.log('■ ' + k); r.ex[k].forEach(x => console.log('  ' + x.slice(0, 1600))); });
  console.log('pageerr', JSON.stringify((errors || []).slice(0, 3)));
}
/* ペニバンの割合の判定（使える場面が 60 件以上のときだけ。12〜40% の外なら 1 件） */
function strapRateBad(r) { const sp = r && r.sp; if (!sp || sp.cap < 60) return 0; const q = sp.n / sp.cap; return q < 0.12 || q > 0.40 ? 1 : 0; }
/* 文の表の数（ページの外：trio-form-text-r18.js を読む） */
function tableStats(dir) {
  global.window = { HK: { Trio3: {} } };
  try { require(path.resolve(dir, 'js/trio-form-text-r18.js')); } catch (e) { return null; }
  const T = window.HK.Trio3.FORM; if (!T) return null;
  const nS = t => String(t).replace(/「[^」]*」/g, '').split(/(?<=[。！？])/).filter(x => x.replace(/[\s　]/g, '').length >= 2).length;
  const st = { in: 0, inMin: 99, mid: 0, peak: 0, peakMin: 99, intro: 0, aft: 0, waitr: 0, touch: 0 };
  Object.keys(T.IN).forEach(p => Object.keys(T.IN[p]).forEach(v => { const I = T.IN[p][v]; ['a', 'b'].forEach(k => I[k] && Object.keys(I[k]).forEach(b => { st.in += I[k][b].length; })); if (I.c) st.in += I.c.length; }));
  Object.keys(T.MID).forEach(p => T.MID[p].forEach(x => { st.mid++; st.inMin = Math.min(st.inMin, nS(x.t)); }));
  Object.keys(T.PEAK).forEach(p => Object.keys(T.PEAK[p]).forEach(k => T.PEAK[p][k].forEach(x => { st.peak++; st.peakMin = Math.min(st.peakMin, nS(x)); })));
  Object.keys(T.INTRO).forEach(p => { st.intro += T.INTRO[p].length; });
  Object.keys(T.AFTF).forEach(p => Object.keys(T.AFTF[p]).forEach(k => { st.aft += T.AFTF[p][k].length; }));
  Object.keys(T.WAITR).forEach(k => { st.waitr += T.WAITR[k].length; });
  st.touch = T.TOUCH3.length;
  return st;
}
/* audit-all.js の追加の配役パス（--extra=trio）用のまとめ（2026-11-04。単独で回したときの終了コードの条件と同じ 5 項目。判定は変えていない） */
const LABEL = { bad: '設定に合わない形', rev: '挿入の向きが逆', fem: '男性器の無い人の男性器', fmRide: '女性の攻めが跨って受け入れる', backDbl: '後ろの二重（前立腺・結腸の段）', strap: 'ペニバンの文が合わない人・組', futa: 'フタナリの攻めが男性器で繋がらない', strapRate: 'ペニバンの割合が目安の外', motion: '動きの二度出し', undress: '繋がったあとの脱がせる', pending: '応答待ちのあと受けの台詞なし', dupS: '同じ地の文の二度出し' };
function summarize(r) {
  const items = {}, ex = {};
  if (!r || r.noX) return { items: {}, ex: {}, info: { 三人の場面: r && r.noX ? 'HK.Trio3 なし' : 0 }, err: 0 };
  Object.keys(LABEL).forEach(k => {
    if (k === 'strap' || k === 'futa' || k === 'strapRate') { const o = k === 'strap' ? r.sp : r.futa; items[k] = k === 'strapRate' ? strapRateBad(r) : (o && o.bad) || 0; ex[k] = k === 'strapRate' ? [((r.sp && r.sp.n) || 0) + '/' + ((r.sp && r.sp.cap) || 0)] : ((o && o.ex) || []).slice(0, 3); return; }
    items[k] = k === 'bad' ? r.bad : k === 'rev' || k === 'fem' || k === 'fmRide' || k === 'backDbl' ? (r[k] || 0) : (r.flow[k] || 0); ex[k] = k === 'bad' ? r.badEx.slice(0, 3) : k === 'rev' || k === 'fem' || k === 'fmRide' || k === 'backDbl' ? (r[k + 'Ex'] || []).slice(0, 3) : r.flowEx.filter(x => x.indexOf(k === 'motion' ? '動き' : k === 'undress' ? '脱が' : k === 'pending' ? '応答待ち' : '同じ文') >= 0).slice(0, 3); });
  return { items, ex, info: { 三人の場面: r.scenes, 触れ合いだけ: r.touch, ペニバン: ((r.sp && r.sp.n) || 0) + '/' + ((r.sp && r.sp.cap) || 0) }, err: 0 };
}
module.exports = { passes: { trio: PASS }, judges: { trio: JUDGE }, print, summarize, LABEL, DEF_SCEN, tableStats };

if (require.main === module) (async () => {
  const args = process.argv.slice(2).filter(a => !/^--/.test(a));
  const dir = args[0], N = +args[1] || 4, only = args[2] ? args[2].split(',') : null, WHY = process.argv.includes('--why');
  const sh = (process.argv.find(a => a.indexOf('--show=') === 0) || '').slice(7);
  const t = await core.runTool({ dir, hash: 'r18', lewdMode: 'direct', mod: module.exports, pass: 'trio', judge: 'trio', opt: { N, only, why: WHY, show: sh ? +sh : 2, body: process.env.HK_TRIO_BODY || '' } });
  print(t.r, t.errors, { why: WHY });
  const st = tableStats(dir);
  if (st) console.log('文の表：繋がる段の文 ' + st.in + ' 本（分岐は 組A・組B・締めの 3 文）・最中の段 ' + st.mid + ' 本（地の文の最小 ' + st.inMin + ' 文）・山場 ' + st.peak + ' 本（最小 ' + st.peakMin + ' 文）・待つ受けの反応 ' + st.waitr + ' 本・導入の台詞 ' + st.intro + ' 本・事後の一言 ' + st.aft + ' 本・触れ合いだけ ' + st.touch + ' 本');
  const r = t.r; if (r && (r.bad || r.rev || r.fem || r.fmRide || r.backDbl || r.flow.motion || r.flow.undress || r.flow.pending || r.flow.dupS || (r.sp && r.sp.bad) || (r.futa && r.futa.bad) || strapRateBad(r))) process.exitCode = 1;
})();
