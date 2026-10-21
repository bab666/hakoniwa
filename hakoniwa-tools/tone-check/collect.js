/* 全箱庭をシミュレーションして、住人の台詞（元の文・変換後・口調・文脈）を集める
   node collect.js <ビルドのフォルダ> <出力.json> [seeds=12] [r18]
   例：node collect.js ../../hakoniwa-full out-full.json 40 r18
   環境変数 TONE=gentleman で全員の口調を固定、FPS=俺,あたし で一人称を順に設定、SCEN=variety,saimin で箱庭を絞る */
'use strict';
const fs = require('fs');
const { openBuild } = require('./lib');
(async () => {
  const [dir, out, seeds, r18] = process.argv.slice(2);
  if (!dir || !out) { console.error('使い方: node collect.js <ビルド> <出力.json> [seeds] [r18]'); process.exit(1); }
  const { browser, page, errors } = await openBuild(dir, r18 ? 'r18' : '');
  const OPT = { n: +(seeds || 12), tone: process.env.TONE || '', fps: (process.env.FPS || '').split(',').filter(Boolean), only: (process.env.SCEN || '').split(',').filter(Boolean) };
  const data = await page.evaluate((OPT) => {
    const HK = window.HK, V = HK.Voice;
    let cur = null, curText = '', ovs = null; const rec = [];
    const pt = V.processText; V.processText = function (t) { curText = t; return pt.apply(this, arguments); };
    const of0 = V.overrideFor; if (of0) V.overrideFor = function (q) { const r = of0.apply(this, arguments); ovs = { q, r }; return r; };
    const rf = V.replaceFP; V.replaceFP = function (q, who) { const ov = !!(ovs && ovs.r != null && ovs.r === q); cur = { who, raw: ov ? ovs.q : q, ov }; ovs = null; return rf.apply(this, arguments); };
    const ac = V.applyCalls; V.applyCalls = function (q, who) {
      const o = ac.apply(this, arguments);
      const i = cur && cur.raw ? curText.indexOf(cur.raw) : -1;
      const after = i < 0 ? '' : curText.slice(i + cur.raw.length + 1, i + cur.raw.length + 5);
      const before = i < 0 ? '' : curText.slice(Math.max(0, i - 7), i - 1);
      rec.push({ nq: /^(?:を|の|に|が|へ|や|という|って書|と書)/.test(after) || (/^だ/.test(after) && /(?:のは|お題は|テーマは|題名は|企画は)$/.test(before)), ov: cur && cur.ov, fp: V.fpFor(who), ctx: i < 0 ? '' : curText.slice(Math.max(0, i - 60), i + cur.raw.length + 20), tone: who.tone, persona: who.persona, g: who.gender, name: who.name, raw: cur && cur.who === who ? cur.raw : null, out: o });
      return o;
    };
    const tones = HK.TONE_KEYS.slice(), NAMES = ['アキラ', 'ミナト', 'ユキノ', 'カオル', 'ハルカ', 'レンジ'];
    const results = [], fails = []; let ti = 0;
    function rnd(s) { let x = s; return () => (x = (x * 1103515245 + 12345) % 2147483648) / 2147483648; }
    HK.SCEN_ORDER.slice().forEach(id => {
      const sc = HK.SCENARIOS[id]; if (!sc || (OPT.only.length && OPT.only.indexOf(id) < 0)) return;
      const n = Math.max(sc.minCast || 2, Math.min(sc.maxCast || 6, 6));
      for (let s = 0; s < OPT.n; s++) {
        const r = rnd(1000 + s * 77 + id.length), chars = [], perChar = [];
        for (let i = 0; i < n; i++) {
          const tone = OPT.tone || tones[(ti++) % tones.length];
          chars.push({ name: NAMES[i], eg: { CP: Math.round(r() * 20), NP: Math.round(r() * 20), A: Math.round(r() * 20), FC: Math.round(r() * 20), AC: Math.round(r() * 20) }, memo: '', gender: i % 3 === 0 ? 'm' : i % 3 === 1 ? 'f' : '', likes: '', tone, fp: OPT.fps.length ? OPT.fps[(i + s) % OPT.fps.length] : '', pos: '', color: '', call: '', calls: {}, loveLock: '' });
          perChar.push({ action: 'auto', goal: 'auto', stats: {}, weapon: '', pick: {}, role: '' });
        }
        const env = {}; (sc.env || []).forEach(e => { env[e.id] = e.def != null ? e.def : (e.options && e.options[0] ? e.options[0].v : ''); });
        const start = rec.length;
        try { HK.simulate({ scenId: id, seed: 12345 + s * 101, env, chars, perChar, ties: [] }); }
        catch (e) { fails.push({ id, s, err: String(e && e.stack || e) }); continue; }
        results.push({ id, s, chars: chars.map(c => ({ name: c.name, tone: c.tone, g: c.gender })), recs: rec.slice(start) });
      }
    });
    return { tones, scens: HK.SCEN_ORDER.slice(), results, fails };
  }, OPT);
  data.errs = errors;
  fs.writeFileSync(out, JSON.stringify(data));
  console.log('箱庭', data.scens.length, '回数', data.results.length, '失敗', data.fails.length, 'ページのエラー', errors.length);
  if (data.fails.length) console.log(data.fails.slice(0, 3));
  await browser.close();
})();
