/* 横断の点検：文の崩れ・同じシードで同じ結果・全年齢への漏れ・重さ・結末の組み立て
   使い方: node text-audit.js <ビルドのディレクトリ> [1箱庭あたりの回数=12] [r18|safe|''] [箱庭id,…] [--why] [--env=heavy:mild,lewd:high]（設定を固定して回す）
   T1 置き換え漏れ（{a} {b} {x} {sensei} {place} など。住人の属性の文の {note} {bw} {L} {S}、食べ物の好みの文の {like} {hate} {taste} {dish} も）・undefined・NaN・null・[object
   T2 空の記録（本文が空・空白だけ）
   T3 句読点の重なり（。。 、、 」」の誤り など）・名前の直後の「はは」「がが」
   T4 同じ入力を続けて二回回して、記録が一致しない
   T5 全年齢（全年齢版・全年齢モード）で性的な語が出た
   T6 一回が 3 秒を超えた（固まりの目安）
   T7 結末の組み立て（HK.Endings.build）で例外（T1・T5 は結末の行・見出し・最期の言葉 E.last も見る）
   人数は箱庭の最少〜最多を回ごとにずらし、役割（role_*）は「おまかせ」と「住人から」を交互に、内容のスイッチは回ごとに切／全部入 */
'use strict';
const { openBuild } = require('./lib.js');
(async () => {
  const args = process.argv.slice(2).filter(a => !/^--/.test(a));
  const dir = args[0], N = +args[1] || 12, mode = args[2] || '', only = args[3] ? args[3].split(',') : null, WHY = process.argv.includes('--why');
  const { browser, page, errors } = await openBuild(dir, mode);
  const ENVSET = ((process.argv.find(a => /^--env=/.test(a)) || '').slice(6)).split(',').filter(Boolean).map(x => x.split(':'));
  const r = await page.evaluate(({ N, only, WHY, ENVSET }) => {
    const KEYS = ['T1', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'T8', 'T9'];
    /* T9：その箱庭にしかないはずの語が、ほかの箱庭の文に出た（出られない部屋の前提の文の混入など）。語の右は、出てもよい箱庭 */
    const FOREIGN = [
      [/脱出の条件|部屋の条件|出られない部屋|木箱の道具/, ['whiteroom']],
      [/白い部屋/, ['whiteroom', 'hole']],
      [/冒険者|宝箱|ダンジョン|迷宮|魔物/, ['dungeon', 'rpg', 'hole']],
      [/宇宙船|コールドスリープ/, ['ship']],
      [/無人島に漂着|筏/, ['island']],
      [/ゾンビ|避難キャンプ/, ['zombie']],
      [/邪神|御神酒/, ['jashin']],
      [/吹雪の館/, ['yakata']],
      [/媚薬ガス|媚薬ロッカー/, ['locker', 'variety']],
      [/施術台|施術/, ['massage', 'kaihen']],
      [/遮断穴/, ['hole']],
      [/発情期|抑制剤/, ['omega']],
      [/合コン/, ['goukon']],
      [/常識改変/, ['kaihen']],
      [/サキュバス/, ['succubus']],
      [/人狼ゲーム|処刑の投票/, ['jinro']],
      [/被告人|裁判長/, ['trial']],
      [/支給品/, ['br']],
      [/担任|学年/, ['classroom']],
      [/催眠術|暗示を/, ['saimin']]
    ];
    const DUNGEON_RE = /迷宮|魔物|冒険者|次の部屋|罠の部屋/;
    const PH = /\{(?:a|b|c|d|x|y|t|m|n|p|v|w|sensei|name|o|h|s|sa|sb|T|U|place|kind|ue|shita|yobi|oya|ko|oyayobi|shin|note|bw|L|S|race|like|hate|taste|dish)\}|undefined|NaN|\bnull\b|\[object /;
    const PUNCT = /。。|、、|」」(?!」)|「「|！！！！|？？？/;
    const SEX = /挿入|挿れ|射精|精液|愛液|ちんぽ|喘ぎ|腰を振|フェラ|絶頂|イっ|イく|中に出|(?<!殺人を|罪を|過ちを|ミスを|法を|規則を|禁を)犯[さし]|セックス|性交|乳首|秘部|膣|陰茎|肉棒|勃起|♡|淫ら|快楽堕ち|種付け|孕ま/;
    const SAFE = !!HK.SAFE_ON;
    const NAMES = ['アキラ', 'ミナト', 'ユキノ', 'カオル', 'ハルカ', 'レンジ', 'ソウタ', 'カエデ'];
    const out = { n: {}, ex: {}, runs: 0, slow: [], perSc: {} };
    KEYS.forEach(k => { out.n[k] = 0; out.ex[k] = []; });
    function hit(k, sc, s, t) { out.n[k]++; out.perSc[sc] = out.perSc[sc] || {}; out.perSc[sc][k] = (out.perSc[sc][k] || 0) + 1; if (out.ex[k].length < (k === 'T9' ? 600 : WHY ? 20 : 4)) out.ex[k].push(sc + '#' + s + ' | ' + String(t).slice(0, 220)); }
    const ids = Object.keys(HK.SCENARIOS).filter(id => !only || only.indexOf(id) >= 0);
    ids.forEach(sc => {
      const scen = HK.SCENARIOS[sc], lo = scen.minCast || 1, hi = Math.min(scen.maxCast || 6, 8);
      for (let s = 0; s < N; s++) {
        const n = Math.max(lo, Math.min(hi, lo + (s % (hi - lo + 1))));
        const chars = []; for (let i = 0; i < n; i++) chars.push({ name: NAMES[i], eg: { CP: (s * 7 + i * 5) % 21, NP: (s * 3 + i * 11) % 21, A: (s * 13 + i * 3) % 21, FC: (s * 5 + i * 7) % 21, AC: (s * 11 + i * 3) % 21 }, gender: ['m', 'f', 'f', 'm', 'f', 'm', 'm', 'f'][(i + s) % 8], pos: ['top', 'bottom', '', 'riba', 'bottom', 'top', '', ''][(i + s) % 8], calls: {}, loveNG: [], alcohol: (s + i) % 6 ? String((s + i) % 6) : '' });
        /* 住人の属性（attr.js）：奇数回は体格・種族・心の強さ・夜の性格・胸を付け、2番と3番を同一人物にする */
        if (s % 2) chars.forEach((c, i) => { c.build = ['small', 'large', '', 'avg'][(i + s) % 4]; c.race = ['vampire', 'beast', 'demon', 'angel', 'ghost', 'other', '', 'human'][(i + s) % 8]; if (c.race === 'other') c.raceNote = '人魚'; c.will = ['strong', 'weak', ''][(i + s) % 3]; c.night = ['sadist', 'maso', 'mean', 'sweet', 'shy', 'none', ''][(i + s) % 7]; c.bust = ['l', 's', 'm'][i % 3]; if (n >= 4 && (i === 2 || i === 3)) c.same = 5 - i; c.foodLike = ['唐揚げ、プリン', '', 'カレー', 'ラーメン、寿司'][(i + s) % 4]; c.foodHate = ['', 'ピーマン', '納豆', ''][(i + s) % 4]; c.taste = ['甘い', '辛い、こってり', '', 'あっさり'][(i + s) % 4]; });
        const env = {}; (scen.env || []).forEach(e => { env[e.id] = e.def != null ? e.def : (e.options && e.options[0] ? e.options[0].v : (e.min != null ? e.min : '')); });
        (scen.env || []).forEach((e, k) => { if (e.options && e.options.length > 1 && (s + k) % 3 === 0) env[e.id] = e.options[(s + k) % e.options.length].v; if (/^role_/.test(e.id)) env[e.id] = s % 2 ? 'res' : 'auto'; });
        if (HK.Content) env.ct = s % 2 ? HK.Content.TAGS.map(t => t.id).join(',') : '';
        ENVSET.forEach(kv => { env[kv[0]] = isNaN(+kv[1]) ? kv[1] : +kv[1]; });
        const ties = n >= 2 ? [{ a: 0, b: 1, type: ['lover', 'spouse', 'honmei', 'abuse', 'friend', 'crush'][s % 6] }] : [];
        const mkIn = () => ({ scenId: sc, seed: 4100 + s, env: JSON.parse(JSON.stringify(env)), chars: JSON.parse(JSON.stringify(chars)), perChar: chars.map(() => ({ pick: {} })), ties: JSON.parse(JSON.stringify(ties)) });
        let res, res2, t0 = Date.now();
        try { res = HK.simulate(mkIn()); } catch (e) { hit('T7', sc, s, 'simulate: ' + e.message); continue; }
        const dt = Date.now() - t0; if (dt > 3000) hit('T6', sc, s, dt + 'ms n=' + n);
        out.runs++;
        try { res2 = HK.simulate(mkIn()); } catch (e) { res2 = null; }
        const L = res.log || [];
        L.forEach((e, k) => {
          const t = e && e.text;
          if (t == null || (typeof t === 'string' && !t.trim())) { if (!(e && /phase|step/.test(e.kind || '') && !t)) hit('T2', sc, s, JSON.stringify(e).slice(0, 160)); return; }
          if (typeof t !== 'string') return;
          if (PH.test(t)) hit('T1', sc, s, t.match(PH)[0] + ' ← ' + t);
          if (PH.test(e.why || '')) hit('T1', sc, s, 'why: ' + e.why);
          const tp = t.replace(/「「[^「」]*」」/g, '「』');
          if (PUNCT.test(tp)) hit('T3', sc, s, tp.match(PUNCT)[0] + ' ← ' + t);
          if (SAFE && SEX.test(t)) hit('T5', sc, s, t.match(SEX)[0] + ' ← ' + t);
          /* 感覚遮断穴の「場所：ダンジョンの罠部屋」は迷宮の中なので除く */
          FOREIGN.forEach(([re, ok]) => { if (ok.indexOf(sc) < 0 && re.test(t)) hit('T9', sc, s, t.match(re)[0] + ' ← ' + t); });
          if (sc !== 'dungeon' && sc !== 'rpg' && !(sc === 'hole' && env.place === 'dungeon') && DUNGEON_RE.test(t + ' ' + (e.why || ''))) hit('T8', sc, s, (t + ' ' + (e.why || '')).match(DUNGEON_RE)[0] + ' ← ' + t);
          if (res2 && res2.log && res2.log[k] && res2.log[k].text !== t && out.ex.T4.length < 99) { hit('T4', sc, s, t + ' ### ' + res2.log[k].text); }
        });
        if (res2 && res2.log && res2.log.length !== L.length) hit('T4', sc, s, 'length ' + L.length + ' vs ' + res2.log.length);
        try { if (HK.Endings && HK.Endings.build && !scen.solo && res.pairs) { const E = HK.Endings.build(res); (E.lines || []).concat([E.headline || ''], (E.last || []).map(x => x && x.text)).forEach(l => { if (typeof l === 'string' && PH.test(l)) hit('T1', sc, s, 'ending: ' + l); if (SAFE && typeof l === 'string' && SEX.test(l)) hit('T5', sc, s, 'ending: ' + l); }); } } catch (e) { hit('T7', sc, s, 'Endings.build: ' + e.message); }
        const end = res.ending || res.end; if (end && Array.isArray(end.lines)) end.lines.forEach(l => { if (typeof l === 'string' && PH.test(l)) hit('T1', sc, s, 'ending: ' + l); if (SAFE && typeof l === 'string' && SEX.test(l)) hit('T5', sc, s, 'ending: ' + l); });
      }
    });
    return out;
  }, { N, only, WHY, ENVSET });
  Object.keys(r.perSc).forEach(sc => console.log(sc.padEnd(10), JSON.stringify(r.perSc[sc])));
  console.log('runs', r.runs, '合計', JSON.stringify(r.n));
  Object.keys(r.ex).forEach(k => { if (r.ex[k].length) { console.log('--- ' + k); r.ex[k].forEach(x => console.log('  ' + x.replace(/\n/g, ' '))); } });
  console.log('pageerr', JSON.stringify(errors.slice(0, 5)));
  await browser.close();
})();
