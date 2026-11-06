#!/usr/bin/env node
/* 温度の矛盾の点検（2026-11-06。仕組みは hakoniwa-full/js/heat.js の HK.Heat、設計は docs/reports/2026-11-06/heat-design.md）
   使い方：HK_PACK_CODES=<コード> node hakoniwa-tools/tone-check/heat-audit.js <試しのフォルダ>/hakoniwa-full [--scen=futari,train,set-b-shinkon,set-b-kanbyo,set-b-date] [--N=6] [--seeds=1,2] [--why] [--measure] [--ties=lover,fwb,…]
   温度を読む部屋（HK.Heat.use で登録した部屋。追加パックの部屋は HK_PACK_CODES で開く）を、関係（恋人・セフレ・幼馴染・夫婦・敵対・執着）× 組（男×女・女×女・女攻め×男）×
   N 回 × 種 で回し、温度の場面の記録（HK.Heat.log）を照らして数える（合格は 0 件）：
   (a) 甘い・初々しいに荒い入り方（型の入り方 押し倒す・嫉妬／責め 言葉責め／体位 押さえつけ／道具 目隠し、本文の始まりの 2 段・変化の一文・事後の型の一文に「押し倒・組み敷・縛・拘束…」）
   (b) 荒い・歪んだ・ドライに甘い事後（事後の型の一文・本文の最後の 2 段に「腕枕・額にキス・髪を撫で」）
   (c) 怒りが高い（記録の気分 50 以上）のに甘い・初々しい、または甘い事後
   (d) 合意のない場面を内容のスイッチが許していない（force なのに forceOk が偽）
   (e) 前回と同じ温度（か前回が無い）のに変化の一文が出た
   (f) 同じ二人で同じ変化の一文が 2 回以上
   (g) 同じ組で前の夜と同じ入り方・主な責めが続いた（受けからの夜の主導 lead は数えない）
   (h) 道具（無し以外）が一回の遊びに同じもの 3 回以上
   (i) 体格差・体の特徴の文が一回のエッチに 3 文以上・溶かした文の表にない体の感触／抱き方の文（主語の文）
   (j) 部屋だけの新しい値（HK.Play.addValue）の文が 3 組 × 3 文に足りない
   --measure：恋人どうし・エッチ多め × 2 組（男×女・女×女）× N（既定 20）回で、温度ごとの出現数・入り方の分布・事後の型の分布・変化の一文の数を表にする（heat-design.md の 7） */
'use strict';
const { openBuild } = require('./lib.js');
const args = process.argv.slice(2), flags = args.filter(a => /^--/.test(a)), pos = args.filter(a => !/^--/.test(a));
const opt = (k, d) => { const f = flags.find(x => x.indexOf('--' + k + '=') === 0); return f ? f.slice(k.length + 3) : d; };
const dir = pos[0] || 'hakoniwa-full', WHY = flags.includes('--why'), MEASURE = flags.includes('--measure');
const SCEN = opt('scen', 'futari,train,set-b-shinkon,set-b-kanbyo,set-b-date').split(',').filter(Boolean);
const TIES_ARG = opt('ties', '').split(',').filter(Boolean);
const N = +opt('N', MEASURE ? 20 : 4), SEEDS = opt('seeds', MEASURE ? '1' : '1,2').split(',').map(Number);
(async () => {
  const { browser, page, errors } = await openBuild(dir, 'r18', { lewdMode: 'direct' });
  const out = await page.evaluate(([SCEN, N, SEEDS, MEASURE, TIES0]) => {
    const HK = window.HK, H = HK.Heat, P = HK.Play;
    if (!H) return { fatal: 'HK.Heat がない' };
    const NAMES = ['アキラ', 'ミナト', 'ユキノ'];
    const G = MEASURE ? [['m', 'f'], ['f', 'f']] : [['m', 'f'], ['f', 'f'], ['f', 'm']];
    const TIES = TIES0.length ? TIES0 : MEASURE ? ['lover'] : ['lover', 'fwb', 'childhood', 'spouse', 'enemy', 'yan'];
    const ROUGH_RE = H.ROUGH_RE, SWEET_RE = H.SWEET_AFTER_RE;
    const bad = { a: [], b: [], c: [], d: [], e: [], f: [], g: [], h: [], i: [], j: [] }, M = { scen: {} }, skip = [];
    const ROUGH_PLAY = H.ROUGH_PLAY;
    (P && P.VALUE_ERR || []).forEach(x => bad.j.push(x));
    let runs = 0, scenes = 0;
    for (const sc of SCEN) {
      const scen = HK.SCENARIOS[sc];
      if (!scen) { skip.push(sc + '（読めない）'); continue; }
      if (!H.enabled(sc)) { skip.push(sc + '（温度を読む部屋ではない）'); continue; }
      const ms = M.scen[sc] = { runs: 0, scenes: 0, key: {}, entry: {}, after: {}, change: 0, base: {} };
      TIES.forEach((ty, ti) => G.forEach((g, gi) => SEEDS.forEach(sd => { for (let s = 0; s < N; s++) {
        const chars = [0, 1].map(i => ({ id: 'c' + i, name: NAMES[i], eg: { CP: (s * 7 + i * 5 + ti) % 21, NP: (s * 3 + i * 11 + gi) % 21, A: (s * 13 + i * 3) % 21, FC: (s * 5 + i * 7 + ti) % 21, AC: (s * 11 + i * 3) % 21 }, gender: g[i], pos: i === 0 ? 'top' : 'bottom', memo: '', likes: '', tone: '', fp: '' }));
        /* 体格差・体の特徴（段 2.5 の (c) を見るため、3 回に 1 回） */
        if (s % 3 === 1) { chars[0].build = 'large'; chars[1].build = 'small'; chars[1].feats = ['ear', 'tail']; chars[0].feats = ['cold']; }
        const env = {}; (scen.env || []).forEach(e => { env[e.id] = e.def != null ? e.def : (e.options && e.options[0] ? e.options[0].v : ''); });
        env.night = 100;
        if ('lewdN' in env) env.lewdN = 'high';
        env.lewd = s % 3 === 2 ? 'high' : 'mid';
        if (s % 4 === 3) env.style = 'ero';
        if (sc === 'train') { env.partner = s % 2 ? 'pair' : 'random'; env.days = 5; }
        if (sc === 'futari') env.days = 14;
        if (HK.Content && HK.Content.TAGS) env.ct = (ty === 'enemy' || ty === 'yan') && s % 2 ? HK.Content.TAGS.map(t => t.id).join(',') : '';
        const ties = [ty === 'yan' ? { a: 0, b: 1, type: 'yan', cold: 'mutual' } : { a: 0, b: 1, type: ty }];
        H.log = []; H.playLog = [];
        let res;
        try { res = HK.simulate({ scenId: sc, seed: 31000 + sd * 7919 + ti * 997 + gi * 131 + s * 17, env, chars, perChar: chars.map(() => ({ action: 'auto', goal: 'auto', stats: {}, weapon: '', pick: {} })), ties }); }
        catch (e) { bad.d.push(sc + '：例外 ' + String(e && e.stack || e).slice(0, 300)); H.log = null; continue; }
        const L = H.log, PL = H.playLog; H.log = null; H.playLog = null;
        runs++; ms.runs++;
        const tag = sc + '・' + ty + '・' + g.join('') + ' #' + sd + '-' + s + '：';
        const lastPlay = {}, propN = {}, chgSeen = {};
        L.forEach(x => {
          scenes++; ms.scenes++;
          ms.key[x.key] = (ms.key[x.key] || 0) + 1; ms.base[x.base] = (ms.base[x.base] || 0) + 1;
          const ps = String(x.text || '').split(/\n\n/), head = ps.slice(0, 2).join('\n'), tail = ps.slice(-2).join('\n');
          const soft = x.key === 'sweet' || x.key === 'fresh', hard = /^(?:rough|warped|dry)$/.test(x.key);
          (x.plays || []).forEach(p => { ms.entry[p.entry] = (ms.entry[p.entry] || 0) + 1; });
          const aw = (x.after || '').replace(/[{}ab]/g, '').slice(0, 14);
          if (x.after) ms.after[x.key + '：' + aw] = (ms.after[x.key + '：' + aw] || 0) + 1;
          if (x.change) ms.change++;
          /* (a) */
          if (soft) {
            const hit = (x.plays || []).find(p => Object.keys(ROUGH_PLAY).some(ax => ROUGH_PLAY[ax][p[ax]]));
            if (hit) bad.a.push(tag + H.LABEL[x.key] + 'なのに型 ' + ['entry', 'focus', 'pos', 'prop'].map(k => P.AXES[k][hit[k]]).join('・'));
            const m = ROUGH_RE.exec(head + '\n' + (x.change || '') + '\n' + (x.after || ''));
            if (m) bad.a.push(tag + H.LABEL[x.key] + 'なのに本文に「' + m[0] + '」：' + (head + x.change + x.after).slice(Math.max(0, (head + x.change + x.after).indexOf(m[0]) - 30), (head + x.change + x.after).indexOf(m[0]) + 20).replace(/\n/g, ' '));
          }
          /* (b) */
          if (hard) { const m = SWEET_RE.exec((x.after || '') + '\n' + tail); if (m) bad.b.push(tag + H.LABEL[x.key] + 'なのに事後に「' + m[0] + '」：' + ((x.after || '') + tail).slice(Math.max(0, ((x.after || '') + tail).indexOf(m[0]) - 30), ((x.after || '') + tail).indexOf(m[0]) + 15).replace(/\n/g, ' ')); }
          /* (c) */
          if ((x.anger || 0) >= 50 && (soft || SWEET_RE.test(x.after || ''))) bad.c.push(tag + '怒り ' + Math.round(x.anger) + ' なのに ' + H.LABEL[x.key] + '（' + x.why + '）');
          /* (d) */
          if (x.force && !x.forceOk) bad.d.push(tag + '合意のない場面を内容のスイッチが許していない（' + x.why + '）');
          /* (e)(f) */
          if (x.change && (!x.prev || x.prev === x.key)) bad.e.push(tag + '前回 ' + (H.LABEL[x.prev] || 'なし') + '・今回 ' + H.LABEL[x.key] + ' なのに変化の一文：' + x.change);
          if (x.change) { const k = x.a + '|' + x.b + '|' + x.change; chgSeen[k] = (chgSeen[k] || 0) + 1; if (chgSeen[k] === 2) bad.f.push(tag + x.change); }
          /* (i) */
          const fe = x.feat || [];
          ms.feat = (ms.feat || 0) + fe.length; if (fe.length) ms.featScenes = (ms.featScenes || 0) + 1;
          if (fe.length > 2) bad.i.push(tag + '体の特徴の文が ' + fe.length + ' 文：' + fe.map(f => f.k).join(','));
          fe.forEach(f => { if ((f.kind === 'touch' || f.kind === 'hold' || f.kind === '') && !f.melt) bad.i.push(tag + '溶かした文の表にない特徴の文（' + f.k + '・' + f.kind + '）'); });
        });
        /* (g)(h)：温度を読む部屋の型の選び方の全部（温度の場面の外の夜も。HK.Heat.playLog） */
        (PL || []).forEach(p => {
          const k = p.a + '|' + p.b, lp = lastPlay[k];
          if (lp) ['entry', 'focus'].forEach(ax => { if (p[ax] && p[ax] === lp[ax] && p[ax] !== 'lead') bad.g.push(tag + p.a + '→' + p.b + 'の' + (ax === 'entry' ? '入り方' : '主な責め') + '「' + P.AXES[ax][p[ax]] + '」が続いた'); });
          lastPlay[k] = p;
          if (p.prop && p.prop !== 'none') { propN[p.prop] = (propN[p.prop] || 0) + 1; if (propN[p.prop] === 3) bad.h.push(tag + '道具「' + P.AXES.prop[p.prop] + '」が 3 回目'); }
        });
      } })));
    }
    return { runs, scenes, bad, M, skip, labels: H.LABEL, axes: P ? P.AXES : {} };
  }, [SCEN, N, SEEDS, MEASURE, TIES_ARG]);
  if (out.fatal) { console.log(out.fatal); await browser.close(); process.exit(2); }
  if (out.skip.length) console.log('回していない部屋：' + out.skip.join('・'));
  const unread = out.skip.filter(x => /読めない/.test(x)).length;
  if (MEASURE) {
    const LB = out.labels, AX = out.axes;
    console.log('| 部屋 | 回 | 温度の場面 | ' + Object.keys(LB).map(k => LB[k]).join(' | ') + ' | 変化の一文 |');
    console.log('|---|---|---|' + Object.keys(LB).map(() => '---').join('|') + '|---|');
    Object.keys(out.M.scen).forEach(sc => { const m = out.M.scen[sc]; console.log('| ' + sc + ' | ' + m.runs + ' | ' + m.scenes + ' | ' + Object.keys(LB).map(k => m.key[k] || 0).join(' | ') + ' | ' + m.change + ' |'); });
    console.log('\n| 部屋 | 入り方の分布（型） |\n|---|---|');
    Object.keys(out.M.scen).forEach(sc => { const m = out.M.scen[sc]; console.log('| ' + sc + ' | ' + Object.keys(m.entry).sort((p, q) => m.entry[q] - m.entry[p]).map(k => ((AX.entry || {})[k] || k) + ' ' + m.entry[k]).join('・') + ' |'); });
    console.log('\n| 部屋 | 事後の型（温度：文の頭 回数。上位 6） |\n|---|---|');
    Object.keys(out.M.scen).forEach(sc => { const m = out.M.scen[sc]; console.log('| ' + sc + ' | ' + Object.keys(m.after).sort((p, q) => m.after[q] - m.after[p]).slice(0, 6).map(k => k + ' ' + m.after[k]).join('・') + ' |'); });
    console.log('\n| 部屋 | 体格差・体の特徴の溶かした文（文・場面） |\n|---|---|');
    Object.keys(out.M.scen).forEach(sc => { const m = out.M.scen[sc]; console.log('| ' + sc + ' | ' + (m.feat || 0) + ' 文・' + (m.featScenes || 0) + ' 場面 |'); });
    console.log('');
  }
  const NAME = { a: '(a) 甘い・初々しいに荒い入り方', b: '(b) 荒い・歪んだ・ドライに甘い事後', c: '(c) 怒りが高いのに甘い', d: '(d) 合意のない場面と内容のスイッチ・例外', e: '(e) 変化の一文の誤り', f: '(f) 同じ二人で同じ変化の一文', g: '(g) 同じ組で同じ入り方・主な責めが続いた', h: '(h) 道具が一回の遊びに 3 回以上', i: '(i) 体格差・体の特徴の文', j: '(j) 部屋だけの新しい値の文が足りない' };
  let tot = unread;   /* 回すはずの部屋が読めない（パックのコードが違う・試しのフォルダが壊れている）は不合格 */
  Object.keys(NAME).forEach(k => { const L = out.bad[k]; tot += L.length; console.log(NAME[k] + '：' + L.length + ' 件'); if (WHY || L.length) L.slice(0, WHY ? 30 : 4).forEach(x => console.log('   ' + x)); });
  if (errors.length) { console.log('ページのエラー：' + errors.length + '　' + errors.slice(0, 2).join(' / ')); tot += errors.length; }
  if (!out.scenes) { console.log('温度の場面が 0 件（部屋が読めていない・温度を読んでいない）'); tot++; }
  console.log('heat-audit：' + tot + ' 件（' + out.runs + ' 回・温度の場面 ' + out.scenes + '）');
  await browser.close();
  process.exit(tot ? 1 : 0);
})().catch(e => { console.error(e); process.exit(2); });
