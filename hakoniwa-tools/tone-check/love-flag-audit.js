/* 関係の「恋愛：自動／あり／なし」（t.love。ties.js の HK.tiesLove・engine.js の HK.canLove。2026-10-28 担当MB）の点検
   使い方: node love-flag-audit.js <ビルドのフォルダ> [回数=24] [r18|safe] [--why]
   ・配役：住人4〜6人（箱庭の人数の範囲で）、恋愛対象はみな「男女両方」、受け攻めはおまかせ（恋愛対象・受け攻めで恋愛が止まらないように）。
     環境値のうち恋愛・夜の起こりやすさは最大にする
   ・なしの回（4回に3回）：0-1 と 2-3 に、友人／敵対／不仲／執着（ヤンデレ）／主従／擬似親子（家族で、自動なら恋愛あり）／恋人 のどれかを「恋愛：なし」で付ける
     見るもの（その二人について。どれも0件であること）
       N1 二人だけの恋愛の出来事（cat が romance の出来事で、登場人物がその二人だけ）。
          性的な場面の記録（e.lewd）と、体だけの関係の理由（free-sex.js の HK.FreeSex.why「体だけの関係」）の記録は数えない
          （2026-10-28 担当MC：「恋愛：なし」は恋愛だけを止め、性的な出来事は性欲・衝動性・理性で起きる。性的な出来事は恋愛ではない）
       N2 二人の名前だけが出る文で、告白・恋人になる・両想いになる
       N3 結末の関係（エンジン型の pairs、物語型の relmap）が恋人・両想い・片想い（cls が love・pine）
       N4 惹かれの上昇（エンジン型の history：どちらかの向きの惹かれが、最初の記録より上がった）
   ・ありの回（4回に1回）：0-1 に、家族（兄弟姉妹）か執着（信仰）を「恋愛：あり」で付ける。同じ配役で「自動」にした回も回し、
       Y＝ありの回の恋愛のしるし（N1〜N3 に当たるもの）の数、Z＝自動の回の告白・結末の恋（N2・N3。家族・信仰の自動は恋愛なしなので 0 のはず）を出す。
       自動の回の N1（恋愛の出来事）は Z1 に参考として出す（出られない部屋のように恋愛が中心の箱庭では、信仰の自動でも、手が触れて身を引く・指さしのような
       恋愛の分類の出来事が今までどおり起きる。恋愛を止めるのは「恋愛：なし」をはっきり選んだときと、家族）。
       全箱庭の Y の合計が 0 なら、恋愛：ありが効いていないのでエラー
   ・結末の関係のうち、入力の関係そのものを表示した線（物語型の関係図で、★の付かない、関係の名前の線）は数えない（設定の表示で、出来事の結果ではないため）
   ・N2 は文から拾うので誤判定がありうる。--why で例を出すので目で確かめる */
const { openBuild } = require('./lib');
(async () => {
  const dir = process.argv[2], N = +process.argv[3] || 24, mode = process.argv[4] || 'r18', WHY = process.argv.includes('--why');
  if (!dir) { console.log('使い方: node love-flag-audit.js <ビルドのフォルダ> [回数] [r18|safe] [--why]'); process.exit(1); }
  const { browser, page, errors } = await openBuild(dir, mode === 'safe' ? 'safe' : mode === 'r18' ? 'r18' : '', { lewdMode: 'direct' });
  const r = await page.evaluate(({ N, WHY }) => {
    const NAMES = ['アキラ', 'ユキノ', 'ミナト', 'ソラ', 'カエデ', 'ヒカル'];
    const NO_T = ['friend', 'enemy', 'bad', 'yan', 'master', 'pparent', 'lover'];
    const CONF = /告白し|想いを告げ|付き合(?:って(?:ください|ほしい|くれ(?!た))|おう|い始)|恋人(?:に|どうし|同士)にな|両想いにな|好きだ。|好きです。/;
    /* 告白でない言い回し（練習・冗談・ゲームのお題・噂・回想・ほかの人の話など） */
    const NOTC = /練習|冗談|ふり|フリ|王様ゲーム|お題|罰ゲーム|命令|噂|もし|夢|思い出|想像|応援|祝福|からかわ|冷やかし|これでいい(?:か|ですか)?？|棒読み|扉を見たまま|ほかに：|ほかの結果：/;
    const ids = HK.SCEN_ORDER.filter(id => HK.SCENARIOS[id]);
    const out = {};
    const run = (id, sc, s, ties, n) => {
      const chars = [];
      for (let i = 0; i < n; i++) chars.push({ name: NAMES[i], eg: { CP: (s * 7 + i * 5) % 21, NP: (s * 3 + i * 11) % 21, A: (s * 13 + i * 3) % 21, FC: (s * 5 + i * 7) % 21, AC: (s * 11 + i * 3) % 21 }, gender: (i + s) % 2 ? 'f' : 'm', likes: 'both', pos: '', tone: '', fp: '', calls: {}, memo: '' });
      const env = {}; (sc.env || []).forEach(e => { env[e.id] = e.def != null ? e.def : (e.options && e.options[0] ? e.options[0].v : (e.min != null ? e.min : '')); });
      (sc.env || []).forEach(e => { if (e.max != null && /romance|love|night|lewd/.test(e.id)) env[e.id] = e.max; });
      if (HK.Content && env.ct == null) env.ct = HK.Content.TAGS.map(t => t.id).join(',');
      return HK.simulate({ scenId: id, seed: 9100 + s * 37, env, chars, perChar: chars.map(() => ({ action: 'auto', goal: 'auto', stats: {}, pick: {}, role: '' })), ties });
    };
    /* 結果から、組 pr（[i, j]）の恋愛のしるしを数える */
    const signs = (res, pr, ex, tag, ties) => {
      const setLab = {}; (ties || []).forEach(t => { if ((t.a === pr[0] && t.b === pr[1]) || (t.a === pr[1] && t.b === pr[0])) setLab[HK.tieLabel ? HK.tieLabel(t) : t.type] = 1; });
      const C = (res.chars || []).map(c => c.name);
      const inP = x => x === pr[0] || x === pr[1];
      const o = { N1: 0, N2: 0, N3: 0, N4: 0 };
      const note = (k, msg) => { o[k]++; if (WHY && ex && ex.length < 8) ex.push(tag + ' ' + k + ' ' + msg); };
      (res.log || []).forEach(e => {
        if (!e || typeof e.text !== 'string' || e.skipped) return;
        if (e.cat === 'romance' && !e.lewd && !/体だけの関係/.test(e.why || '') && Array.isArray(e.actors) && e.actors.length === 2 && inP(e.actors[0]) && inP(e.actors[1]) && e.actors[0] !== e.actors[1]) note('N1', (e.label || e.tag || '') + ' ｜ ' + e.text.slice(0, 100));
        e.text.split(/(?<=[。！？\n])/).forEach(sn => {
          const ns = []; C.forEach((nm, i) => { if (nm && sn.indexOf(nm) >= 0) ns.push(i); });
          if (ns.length !== 2 || !inP(ns[0]) || !inP(ns[1])) return;
          if (CONF.test(sn) && !NOTC.test(sn)) note('N2', (e.label || e.tag || '') + ' ｜ ' + sn.slice(0, 120));
        });
      });
      const edges = (res.pairs || []).map(p => ({ a: p.a, b: p.b, cls: p.cls, name: p.name })).concat(res.relmap && res.relmap.edges ? res.relmap.edges.map(e => ({ a: e.a, b: e.b, cls: e.cls, name: e.label })) : []);
      edges.forEach(e => { if (inP(e.a) && inP(e.b) && e.a !== e.b && (e.cls === 'love' || e.cls === 'pine') && !(res.relmap && setLab[e.name])) note('N3', '結末 ' + e.name); });
      const H = res.history || [], k = Math.min(pr[0], pr[1]) + '-' + Math.max(pr[0], pr[1]);
      if (H.length && H[0].rel && H[0].rel[k]) {
        const f = H[0].rel[k];
        let up = false, mx = 0;
        H.forEach(h => { const v = h.rel && h.rel[k]; if (!v) return; mx = Math.max(mx, v[3], v[4]); if (v[3] > f[3] + 0.01 || v[4] > f[4] + 0.01) up = true; });
        if (up) note('N4', '惹かれ ' + f[3].toFixed(1) + '/' + f[4].toFixed(1) + ' → 最大 ' + mx.toFixed(1));
      }
      return o;
    };
    ids.forEach(id => {
      const sc = HK.SCENARIOS[id], o = out[id] = { runs: 0, err: 0, N1: 0, N2: 0, N3: 0, N4: 0, Y: 0, Z: 0, Z1: 0, ex: [] };
      const lo = Math.max(sc.minCast || 2, 4), hi = Math.min(sc.maxCast || 6, 6);
      for (let s = 0; s < N; s++) {
        const n = Math.min(hi, lo + (s % 3)) >= (sc.minCast || 2) ? Math.min(hi, lo + (s % 3)) : (sc.minCast || 2);
        if (n < 2) continue;
        if (s % 4 === 3) {
          /* ありの回：家族（兄弟姉妹）・執着（信仰）を「恋愛：あり」と「自動」で */
          const ty = (s >> 2) % 2 ? 'worship' : 'sibling';
          ['ok', ''].forEach(lv => {
            const tl = [{ a: 0, b: 1, type: ty, love: lv }];
            let res; try { res = run(id, sc, s, tl, n); } catch (e) { o.err++; if (o.ex.length < 8) o.ex.push('ERR ' + e.message); return; }
            o.runs++;
            const g = signs(res, [0, 1], lv === 'ok' ? null : o.ex, '[自動 ' + ty + ']', tl);
            if (lv === 'ok') o.Y += g.N1 + g.N2 + g.N3; else { o.Z += g.N2 + g.N3; o.Z1 += g.N1; }
          });
          continue;
        }
        const t1 = NO_T[s % NO_T.length], t2 = NO_T[(s + 3) % NO_T.length];
        const ties = [{ a: 0, b: 1, type: t1, love: 'no' }];
        if (n >= 4) ties.push({ a: 2, b: 3, type: t2, love: 'no' });
        let res; try { res = run(id, sc, s, ties, n); } catch (e) { o.err++; if (o.ex.length < 8) o.ex.push('ERR ' + e.message); continue; }
        o.runs++;
        ties.forEach(t => { const g = signs(res, [t.a, t.b], o.ex, '[なし ' + t.type + ']', ties); ['N1', 'N2', 'N3', 'N4'].forEach(k => { o[k] += g[k]; }); });
      }
    });
    return out;
  }, { N, WHY });
  const tot = { N1: 0, N2: 0, N3: 0, N4: 0, Y: 0, Z: 0, Z1: 0, err: 0 };
  for (const id in r) {
    const o = r[id]; Object.keys(tot).forEach(k => { tot[k] += o[k]; });
    console.log(id.padEnd(10), 'runs', o.runs, 'err', o.err, 'N1', o.N1, 'N2', o.N2, 'N3', o.N3, 'N4', o.N4, '｜あり Y', o.Y, '自動 Z', o.Z, '（参考 Z1', o.Z1 + '）');
    o.ex.forEach(x => console.log('    ' + String(x).replace(/\n/g, ' ')));
  }
  console.log('合計', JSON.stringify(tot), '（N1〜N4・Z・err は 0 であること。Y は 0 より大きいこと。Z1 は参考）');
  console.log('pageerr', errors.slice(0, 3));
  await browser.close();
  if (tot.N1 + tot.N2 + tot.N3 + tot.N4 + tot.Z + tot.err > 0 || tot.Y === 0 || errors.length) process.exitCode = 1;
})();
