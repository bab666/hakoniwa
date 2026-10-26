/* R18 の場面の段（前戯 → 挿入 → 山場 → 事後）が飛んだり戻ったりしていないかを数える（2026-10-26 順146）
   使い方: node stage-audit.js <ビルドのディレクトリ> [回数=50] [箱庭id,…] [--novel] [--show=8]
   一つの性的な記録（HK.lewdEvent）を段落（空行）ごとに読み、段を見分けて、次の二つを数える：
     F>I  … 指を挿れて動かしている段落の、すぐ次（台詞だけの段落は飛ばす）で、指を抜く言葉なしに挿入が始まる（「指を挿れている最中にいきなり挿入」）
     A>P  … 事後の段落（余韻・息を整える・腕の中など）のあとに、新しい挿入なしで絶頂の喘ぎ・絶頂の文が来る（「終わった直後に受けがイクと叫ぶ」）
   作風は男性向け（--novel で小説調）、描写は「直接」、恋人の二人（攻め・受けを固定）で全箱庭を回す。体の語は「直接」の列で解く */
'use strict';
const { openBuild } = require('./lib.js');
(async () => {
  const args = process.argv.slice(2).filter(a => !/^--/.test(a));
  const dir = args[0], N = +args[1] || 50, only = args[2] ? args[2].split(',') : null;
  const NOVEL = process.argv.includes('--novel'), SHOW = +((process.argv.find(a => /^--show=/.test(a)) || '--show=8').slice(7));
  const { browser, page, errors } = await openBuild(dir, 'r18', { lewdMode: 'direct' });
  const r = await page.evaluate(({ N, only, NOVEL, SHOW }) => {
    const HK = window.HK;
    /* 段の見分け（段落ごと。地の文だけで見る＝「」の中は除く。喘ぎは別に見る） */
    const FINGER = /指(?:を|が)(?:[^。]{0,12})(?:ねじ込|挿れ|挿し|差し入れ|入れ|沈め|埋め|潜り込|滑り込|突き入れ)|指で(?:[^。]{0,10})(?:掻き回|かき回|ほぐ|擦|こす|責め|突)|指(?:を|が)(?:[^。]{0,8})(?:動か|曲げ|抜き差し|出し入れ)/;
    const OUT = /指を(?:[^。]{0,8})(?:抜|引き抜|離)|指が(?:[^。]{0,6})(?:抜け|離れ)|舐め取|指を(?:[^。]{0,8})(?:見せ|突きつけ|口に)/;
    const INS = /突き入れ|挿入|貫い|貫か|繋が(?:っ|る|り)|腰を沈め|(?:先端|切っ先|熱|もの|それ)を(?:[^。]{0,10})(?:押し当て|宛てが|あてが|埋め|沈め|押し込)|奥まで(?:[^。]{0,6})(?:押し込|沈め|呑み込|突き)|ゆっくりと(?:[^。]{0,6})入って/;
    const AFTER = /息が整|息を整え|呼吸が整|腕の中で(?:[^。]{0,6})(?:眠|まどろ|微睡)|胸に頬を(?:寄せ|預け)|眠りに落ち|寝息|後始末|後片づけ|後片付け|シーツを(?:[^。]{0,6})(?:かけ|掛け|引き上げ)|汗ばんだ額を合わせ/;
    const PEAKN = /果て(?:た|る|て)|達し(?:た|て)|絶頂|イった|イかされ|中に出|注が(?:れ|れた)|びゅ|どぷ|どくどく/;
    const PEAKQ = /イ(?:ク|く|っちゃ|っく)|いっちゃ|いく(?:っ|ぅ|う)|イっ|でちゃ|出ちゃ|出る(?:っ|ぅ)/;
    const ROUND = /もう一回|もう一度|二回戦|二度目|再び|続きを|まだ(?:[^。]{0,6})足りな|一度果てても|また(?:[^。]{0,8})(?:手を伸ば|求め|抱き寄せ)/;
    const strip = s => s.replace(/「[^」]*」/g, '');
    const NAMES = ['アキラ', 'ミナト', 'ユキノ', 'カオル'];
    const out = { scen: {}, samples: { 'F>I': [], 'A>P': [] }, events: 0 };
    HK.SCEN_ORDER.filter(id => !only || only.indexOf(id) >= 0).forEach(id => {
      const sc = HK.SCENARIOS[id]; const n = Math.max(sc.minCast || 2, Math.min(sc.maxCast || 6, 2));
      const o = out.scen[id] = { runs: 0, ev: 0, FI: 0, AP: 0 };
      for (let s = 0; s < N; s++) {
        const G = [['m', 'f'], ['m', 'm'], ['f', 'f'], ['f', 'm']][s % 4];
        const chars = NAMES.slice(0, n).map((nm, i) => ({ name: nm, eg: { CP: (s * 7 + i * 5) % 21, NP: (s * 3 + i * 11) % 21, A: (s * 13 + i * 3) % 21, FC: (s * 5 + i * 7) % 21, AC: (s * 11 + i * 13) % 21 }, gender: G[i % 2] || 'f', likes: 'both', pos: i === 0 ? 'top' : i === 1 ? 'bottom' : '' }));
        const env = {}; (sc.env || []).forEach(e => { env[e.id] = e.def != null ? e.def : (e.options && e.options[0] ? e.options[0].v : ''); });
        if (env.style !== undefined) env.style = NOVEL ? 'novel' : 'ero';
        if (env.lewd !== undefined) env.lewd = 'high';
        (sc.env || []).forEach(e => { if (e.max != null && /lewd|dose|heat|night|aphro|pleasure/.test(e.id)) env[e.id] = e.max; });
        const ties = n >= 2 ? [{ a: 0, b: 1, type: 'lover' }] : [];
        let res; try { res = HK.simulate({ scenId: id, seed: 900 + s * 13, env, chars, perChar: chars.map(() => ({ action: 'auto', goal: 'auto', pick: {} })), ties }); } catch (e) { continue; }
        o.runs++;
        (res.log || []).forEach(e => {
          if (!e || typeof e.text !== 'string' || !HK.lewdEvent(e)) return;
          o.ev++; out.events++;
          const paras = e.text.split(/\n+/).map(x => x.trim()).filter(Boolean);
          /* F>I：指の段落の次の地の文の段落 */
          for (let i = 0; i < paras.length; i++) {
            const pi = strip(paras[i]);
            if (!FINGER.test(pi) || OUT.test(pi) || INS.test(pi)) continue;
            let j = i + 1; while (j < paras.length && !strip(paras[j]).replace(/[\s―…・、。]/g, '').replace(new RegExp(NAMES.join('|'), 'g'), '')) j++;
            if (j >= paras.length) continue;
            const pj = strip(paras[j]);
            if (INS.test(pj) && !OUT.test(pj) && !FINGER.test(pj)) {
              o.FI++;
              if (out.samples['F>I'].length < SHOW) out.samples['F>I'].push(id + '#' + s + '：' + paras[i].slice(0, 70) + ' ／→ ' + paras[j].slice(0, 70));
            }
          }
          /* A>P：事後の段落のあと、新しい挿入・もう一回なしに絶頂 */
          let afterAt = -1, peaked = false;
          for (let i = 0; i < paras.length; i++) {
            const pi = strip(paras[i]);
            if (afterAt >= 0 && (INS.test(pi) || ROUND.test(paras[i]))) afterAt = -1;
            if (afterAt >= 0) {
              const qs = (paras[i].match(/「[^」]*」/g) || []).join('');
              if (PEAKN.test(pi) || (PEAKQ.test(qs) && /♡|っ/.test(qs))) {
                o.AP++;
                if (out.samples['A>P'].length < SHOW) out.samples['A>P'].push(id + '#' + s + '：' + paras[afterAt].slice(0, 60) + ' ／→ ' + paras[i].slice(0, 80));
                afterAt = -1;
              }
            }
            if (peaked && AFTER.test(pi) && !INS.test(pi) && !PEAKN.test(pi)) afterAt = i;
            if (PEAKN.test(pi)) peaked = true;
          }
        });
      }
    });
    return out;
  }, { N, only, NOVEL, SHOW });
  if (errors.length) console.log('ページのエラー:', errors.slice(0, 3));
  let FI = 0, AP = 0;
  console.log('箱庭\t回\t性的な記録\tF>I\tA>P');
  Object.keys(r.scen).forEach(id => { const o = r.scen[id]; FI += o.FI; AP += o.AP; if (o.ev) console.log([id, o.runs, o.ev, o.FI, o.AP].join('\t')); });
  console.log('合計\t\t' + r.events + '\t' + FI + '\t' + AP);
  ['F>I', 'A>P'].forEach(k => { if (r.samples[k].length) { console.log('\n■ ' + k); r.samples[k].forEach(x => console.log('  ' + x)); } });
  await browser.close();
})();
