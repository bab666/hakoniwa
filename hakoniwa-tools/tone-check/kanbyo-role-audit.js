#!/usr/bin/env node
/* 看病の部屋（追加パック set-b の set-b-kanbyo）の役と状態の点検（2026-11-04。遊んで確かめた報告 1104 の 3〜5）
   使い方：HK_PACK_CODES=<コード> node hakoniwa-tools/tone-check/kanbyo-role-audit.js <試しのフォルダ>/hakoniwa-full [1 通りの回数=6] [--why]
   報告の 16 通りの設定（関係 15 種 × 病の重さ・同居か通いか・うつりやすさ・日数・エッチの回数と濃さ・見舞いに来る三人目）を回し、記録の文から数える（合格は 0 件）：
   (a) 役の取り違え：看病した人が看病の礼を言う／看病された人が「何日も汗を拭き」／「元気になった（看病した人）」／寝込んでいる人が駆け寄る
       （うつって看病し返す日は、看る人と看られる人を入れ替えて見る）
   (b) 通いの行き来：泊まり込んだ翌朝の「久しぶり・合鍵」／前の日（か初日）に来たのに「久しぶりに来られた」／「自分も横になった」の直後の「帰った」
   (c) 熱の数字と言葉：「昨日より…上が」が前の日の数字より高くない／「まで下がって」が低くない／軽い風邪の重い言い回し
   (d) 関係の取り違え：セフレの「友人どうし」／元恋人の「いがみ合」／夫婦の「恋人の弱音」
   (e) 見舞いに来る三人目が一度も出ない／結末のあとに出来事が続く */
'use strict';
const lib = require('./lib.js');
const args = process.argv.slice(2), WHY = args.includes('--why');
const dir = args.find(a => !/^--/.test(a));
const N = +(args.filter(a => !/^--/.test(a))[1] || 6);
if (!dir) { console.error('使い方：HK_PACK_CODES=… node kanbyo-role-audit.js <試しのフォルダ>/hakoniwa-full [回数]'); process.exit(2); }
(async () => {
  const { browser, page, errors } = await lib.openBuild(dir, 'r18');
  const out = await page.evaluate((N) => {
    const HK = window.HK, sc = HK.SCENARIOS['set-b-kanbyo'];
    if (!sc) return { err: '看病の部屋が読めない（HK_PACK_CODES を確かめる）' };
    const CF = [
      ['恋人', 'lover', { sev: 'mid', live: 'auto', cont: 'mid', days: 5, lewdN: 'high', lewd: 'mid' }], ['夫婦', 'spouse', { sev: 'heavy', live: 'together', cont: 'low', days: 6, lewdN: 'low', lewd: 'high' }],
      ['片想い', 'crush', { sev: 'heavy', live: 'visit', cont: 'mid', days: 5, lewdN: 'high', lewd: 'mid' }], ['友達以上恋人未満', 'almost', { sev: 'light', live: 'auto', cont: 'high', days: 6, lewdN: 'high', lewd: 'mid' }],
      ['友人', 'friend', { sev: 'mid', live: 'visit', cont: 'mid', days: 5, lewdN: 'high', lewd: 'high' }], ['家族', 'sibling', { sev: 'mid', live: 'together', cont: 'mid', days: 5, lewdN: 'high', lewd: 'mid' }],
      ['親子', 'parent', { sev: 'heavy', live: 'visit', cont: 'low', days: 7, lewdN: 'high', lewd: 'mid' }], ['元恋人', 'ex', { sev: 'mid', live: 'apart', cont: 'mid', days: 6, lewdN: 'high', lewd: 'mid' }],
      ['不仲', 'bad', { sev: 'mid', live: 'visit', cont: 'mid', days: 5, lewdN: 'high', lewd: 'mid' }], ['ライバル', 'rival', { sev: 'light', live: 'auto', cont: 'mid', days: 3, lewdN: 'high', lewd: 'mid' }],
      ['同僚', 'colleague', { sev: 'mid', live: 'apart', cont: 'mid', days: 5, lewdN: 'high', lewd: 'high' }], ['師弟', 'mentor', { sev: 'mid', live: 'visit', cont: 'high', days: 5, lewdN: 'high', lewd: 'high' }],
      ['セフレ', 'fwb', { sev: 'light', live: 'visit', cont: 'mid', days: 5, lewdN: 'high', lewd: 'high' }], ['関係なし', '', { sev: 'mid', live: 'apart', cont: 'mid', days: 7, lewdN: 'high', lewd: 'mid' }],
      ['先輩後輩', 'senpai', { sev: 'mid', live: 'apart', cont: 'low', days: 6, lewdN: 'low', lewd: 'mid' }, true], ['恋人（うつる）', 'lover', { sev: 'light', live: 'together', cont: 'high', days: 7, lewdN: 'high', lewd: 'mid' }]
    ];
    const NAMES = ['ハルト', 'ミサキ', 'ジン'], bad = { a: [], b: [], c: [], d: [], e: [] };
    const D = { 一: 1, 二: 2, 三: 3, 四: 4, 五: 5, 六: 6, 七: 7, 八: 8, 九: 9 };
    const num = s => { const m = /([三四])十([一二三四五六七八九])?度(?:([一二三四五六七八九])分|ちょうど)/.exec(s); return m ? (m[1] === '三' ? 30 : 40) + (m[2] ? D[m[2]] : 0) + (m[3] ? D[m[3]] / 10 : 0) : null; };
    let runs = 0;
    CF.forEach((cf, ci) => {
      for (let s = 0; s < N; s++) {
        const g = s % 3 === 0 ? ['m', 'f'] : s % 3 === 1 ? ['f', 'f'] : ['m', 'm'];
        const chars = [0, 1, 2].slice(0, cf[3] ? 3 : 2).map(i => ({ id: 'c' + i, name: NAMES[i], eg: { CP: (s * 7 + i * 5 + ci) % 21, NP: (s * 3 + i * 11) % 21, A: (s * 13 + i * 3 + ci) % 21, FC: (s * 5 + i * 7) % 21, AC: (s * 11 + i * 3) % 21 }, gender: g[i % 2], pos: i === 0 ? 'top' : i === 1 ? 'bottom' : '' }));
        const env = {}; sc.env.forEach(e => { env[e.id] = e.def; }); Object.assign(env, cf[2]);
        const ties = cf[1] ? [{ a: 0, b: 1, type: cf[1] }] : [];
        if (cf[3]) ties.push({ a: 0, b: 2, type: 'lovehate' }, { a: 1, b: 2, type: 'friend' });
        const res = HK.simulate({ scenId: 'set-b-kanbyo', seed: 7000 + 100 * ci + s, env, chars, perChar: chars.map((c, i) => ({ action: 'auto', goal: 'auto', stats: {}, pick: i === 2 ? { part: 'guest' } : {} })), ties });
        runs++;
        const R = res.end.kanbyo; if (!R) continue;
        const A = res.chars[R.a].name, B = res.chars[R.b].name, ks = R.kaeshi ? R.kaeshi.from - 1 : 99, kh = R.kaeshi ? R.kaeshi.heal - 1 : 99, heal = R.heal - 1;
        const carer = d => d >= ks && d < kh ? B : A, pat = d => d >= ks && d < kh ? A : B;
        const ev = res.log.filter(e => e.kind === 'event'), dayOf = e => { const m = /^DAY(\d+)/.exec(e.label || ''); return m ? +m[1] - 1 : -1; };
        const tag = cf[0] + ' #' + s + '：';
        let stayD = -99, came = {}, pt = null, pd = -9, endI = -1;
        ev.forEach((e, i) => {
          const d = dayOf(e), w = e.why || '', t = String(e.text || ''), c = carer(d), p = pat(d);
          if (/看病の部屋：結末/.test(w)) endI = i;
          if (new RegExp(c + 'は[^。「]*「[^」]*(看病してくれ|看病してくださ|看病の(お)?礼|看病してもら)').test(t)) bad.a.push(tag + '看病した人が看病の礼：' + t.slice(0, 70));
          if (new RegExp(p + 'は[^。]*何日も汗を拭き').test(t)) bad.a.push(tag + '看病された人が汗を拭いた：' + t.slice(0, 70));
          if (d < ks && new RegExp('元気になった' + c).test(t)) bad.a.push(tag + '元気になったのが看病した人：' + t.slice(0, 70));
          if (d < heal && new RegExp(p + 'は[^。]*(真っ先に[^。]*隣へ来た|駆け寄)').test(t)) bad.a.push(tag + '寝込む人が駆け寄る：' + t.slice(0, 70));
          if (/泊まり込んだ（|特別に泊まって/.test(w)) stayD = d;
          if (/看病に来られた日|通いの看病（/.test(w)) { if (stayD === d - 1 && /久しぶり|合鍵/.test(t)) bad.b.push(tag + '泊まった翌朝に来た：' + t.slice(0, 60)); if ((came[d - 1] || d === 0) && /久しぶり/.test(t)) bad.b.push(tag + '前の日に来たのに久しぶり：' + t.slice(0, 60)); came[d] = 1; }
          if (/が帰った/.test(w)) { const pr = ev[i - 1]; if (pr && dayOf(pr) === d && /自分も横になった/.test(pr.text)) bad.b.push(tag + '横になったあとに帰った'); }
          if (/看病の部屋：朝（/.test(w)) { const n = num(t); if (n != null && pt != null && pd === d - 1) { if (/昨日より[^。]*上が/.test(t) && !(n > pt)) bad.c.push(tag + '上がっていない：' + t.slice(0, 50)); if (/まで下がって/.test(t) && !(n < pt)) bad.c.push(tag + '下がっていない：' + t.slice(0, 50)); } if (n != null) { pt = n; pd = d; } }
          if (R.sev === 'light' && /ほとんど目を開け|その場に座り込|病院の連絡先/.test(t)) bad.c.push(tag + '軽い風邪に重い言い回し：' + t.slice(0, 50));
          if ((cf[1] === 'fwb' && /友人どうし/.test(t)) || (cf[1] === 'ex' && /いがみ合/.test(t)) || (cf[1] === 'spouse' && /恋人の弱音/.test(t))) bad.d.push(tag + t.slice(0, 60));
        });
        if (cf[3] && !ev.some(e => String(e.text).indexOf(NAMES[2]) >= 0)) bad.e.push(tag + '見舞いに来る三人目が出ない');
        if (endI >= 0 && endI < ev.length - 1) bad.e.push(tag + '結末のあとに出来事 ' + (ev.length - 1 - endI) + ' 件');
      }
    });
    return { runs, bad };
  }, N);
  if (out.err) { console.log(out.err); await browser.close(); process.exit(2); }
  const NAME = { a: '(a) 役の取り違え', b: '(b) 通いの行き来', c: '(c) 熱の数字と言葉', d: '(d) 関係の取り違え', e: '(e) 三人目・結末のあと' };
  let tot = 0;
  Object.keys(NAME).forEach(k => { const L = out.bad[k]; tot += L.length; console.log(NAME[k] + '：' + L.length + ' 件'); if (WHY || L.length) L.slice(0, WHY ? 20 : 3).forEach(x => console.log('   ' + x)); });
  if (errors.length) { console.log('ページのエラー：' + errors.length); tot += errors.length; }
  console.log('kanbyo-role：' + tot + ' 件（' + out.runs + ' 回）');
  await browser.close();
  process.exit(tot ? 1 : 0);
})().catch(e => { console.error(e); process.exit(2); });
