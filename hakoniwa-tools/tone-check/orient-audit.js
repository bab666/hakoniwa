/* 恋愛対象の点検：キャラの「恋愛対象」（男性／女性／なし）に合わない相手と、恋人・両想い・夜・体の関係になっていないかを全箱庭で確かめる
   使い方: node orient-audit.js <ビルドのフォルダ> [回数=40] [r18|safe] [--why]
   ・配役：異性だけが対象の人ばかり／同性だけが対象の人ばかり／男女混合で対象がばらばら（なし を含む）。受け攻めの指定もばらばらにする
   ・関係の設定は付けない回と、恋愛でない関係（友人・敵対など）だけ付ける回（恋人などの関係を明示した組は、ユーザーの指定なので点検しない）
   ・見るもの：
     O1 結末の関係（エンジン型の pairs、物語型の relmap）が恋人・夜・片想い系なのに、恋愛対象が合わない
     O2 二人だけの出来事で、性的な文（行為の言葉）なのに、恋愛対象が合わない
     O3 二人だけの出来事で、告白・恋人になる文なのに、告白した側（最初の人）の恋愛対象が合わない
   ・O2・O3 は文から拾うので誤判定がありうる。--why で例を出すので目で確かめる */
const { openBuild } = require('./lib');
(async () => {
  const dir = process.argv[2], N = +process.argv[3] || 40, mode = process.argv[4] || 'r18', WHY = process.argv.includes('--why');
  if (!dir) { console.log('使い方: node orient-audit.js <ビルドのフォルダ> [回数] [r18|safe] [--why]'); process.exit(1); }
  const { browser, page, errors } = await openBuild(dir, mode === 'safe' ? 'safe' : mode === 'r18' ? 'r18' : '');
  const ENVSET = ((process.argv.find(a => /^--env=/.test(a)) || '').slice(6)).split(',').filter(Boolean).map(x => x.split(':'));
  const r = await page.evaluate(({ N, WHY, ENVSET }) => {
    const SEX = /挿入|挿れ|射精|精液|愛液|ちんぽ|喘ぎ|喘い|腰を振|腰を打ち|奥まで(?:突|沈|貫)|(?<!牙が)深く沈|フェラ|咥え込|秘所|貫か|貫い|絶頂|イっ|イく|中に出|舐め上げ|乳首|性器|ひだ|襞|潮を|搾り取|犯し|犯さ|セックス|抱き潰|跨って腰|騎乗|ノット|夜を共に|体を重ね|肌を重ね|一夜を共に|抱かれ|抱いた|求め合/;
    const CONF = /(?:付き合って|恋人になって)(?:ください|ほしい|くれ(?!た))|付き合おう|恋人になった|両想いに|告白した|想いを告げ|好きだ。|好きです。/;
    const NOTSEX = /(?:殺人|罪|過ち|犯罪)を犯[しさすせ]?|精液検査|ほかの結果：[^\n]*|ほかに：[^\n]*|アシスタントに[^。]*|抱いた(?:まま|肩|膝)|肩を抱|膝を抱|頭を抱|抱いた(?:子|赤)|日照りに喘|息を喘|旅路の果て|(?:胸|腹|喉|背中|心臓)を貫か/;
    const LOVE_T = /^(lover|fwb|mate|fated|crush|almost|ex|yan|worship)$/;
    function one(a, b) { if (!a.likes || a.likes === 'both') return true; if (a.likes === 'none') return false; if (!b.gender || b.gender === 'x') return true; return a.likes === b.gender; }
    function ok(a, b) { return one(a, b) && one(b, a); }
    const NAMES = ['アキラ', 'ユキノ', 'ミナト', 'ソラ', 'カエデ', 'ヒカル', 'レンジ', 'カオル'];
    /* 配役の型：het＝異性だけ、homo＝同性だけ、mix＝ばらばら */
    function cast(type, n, s) {
      const out = [];
      for (let i = 0; i < n; i++) {
        const g = (i + s) % 2 ? 'f' : 'm';
        let likes = type === 'het' ? (g === 'm' ? 'f' : 'm') : type === 'homo' ? g : ['m', 'f', 'both', 'none', '', g === 'm' ? 'f' : 'm'][(i * 3 + s) % 6];
        out.push({ name: NAMES[i], eg: { CP: (s * 7 + i * 5) % 21, NP: (s * 3 + i * 11) % 21, A: (s * 13 + i * 3) % 21, FC: (s * 5 + i * 7) % 21, AC: (s * 11 + i * 3) % 21 }, gender: g, likes: likes, pos: ['', 'top', 'bottom', 'riba'][(i + s) % 4], tone: '', fp: '', calls: {}, memo: '' });
      }
      return out;
    }
    const res0 = {};
    const ids = HK.SCEN_ORDER.filter(id => HK.SCENARIOS[id]);
    ids.forEach(id => {
      const sc = HK.SCENARIOS[id], o = res0[id] = { runs: 0, err: 0, O1: 0, O2: 0, O3: 0, ex: [] };
      for (let s = 0; s < N; s++) {
        const type = ['het', 'homo', 'mix'][s % 3];
        const n = Math.max(sc.minCast || 2, Math.min(sc.maxCast || 6, 2 + (s % 5)));
        const chars = cast(type, n, s);
        const env = {}; (sc.env || []).forEach(e => { env[e.id] = e.def != null ? e.def : (e.options && e.options[0] ? e.options[0].v : (e.min != null ? e.min : '')); });
        (sc.env || []).forEach((e, k) => {
          if (e.options && e.options.length > 1 && (s + k) % 3 === 0) env[e.id] = e.options[(s + k) % e.options.length].v;
          if (e.max != null && s % 2 === 0 && /lewd|night|romance|heat|ev|dose|aphro|love|shady|prey|pleasure/.test(e.id)) env[e.id] = e.max;
          if (/^role_/.test(e.id)) env[e.id] = s % 2 ? 'res' : 'auto';
        });
        ENVSET.forEach(kv => { env[kv[0]] = isNaN(+kv[1]) ? kv[1] : +kv[1]; });
        const ties = s % 4 === 3 && n >= 2 ? [{ a: 0, b: 1, type: ['friend', 'enemy', 'best', 'colleague'][s % 4] }] : [];
        let res;
        /* 内容のスイッチ（content.js）：指定がなければすべて入にして、いちばん広く回す */
        if (HK.Content && env.ct == null) env.ct = HK.Content.TAGS.map(t => t.id).join(',');
        try { res = HK.simulate({ scenId: id, seed: 4000 + s * 17, env, chars, perChar: chars.map(() => ({ action: 'auto', goal: 'auto', stats: {}, pick: {}, role: '' })), ties }); }
        catch (e) { o.err++; continue; }
        o.runs++;
        const C = (res.chars && res.chars.length ? res.chars : chars).map((c, i) => ({ name: c.name, gender: chars[i] ? chars[i].gender : c.gender, likes: chars[i] ? chars[i].likes : c.likes }));
        const tieLove = (a, b) => ties.some(t => LOVE_T.test(t.type) && ((t.a === a && t.b === b) || (t.a === b && t.b === a)));
        const note = (k, msg) => { o[k]++; if (WHY && o.ex.length < 6) o.ex.push(k + ' [' + type + '] ' + msg); };
        const who = i => C[i] ? C[i].name + '(' + C[i].gender + '→' + (C[i].likes || '任') + ')' : '?';
        /* O1：結末の関係 */
        const edges = (res.pairs || []).map(p => ({ a: p.a, b: p.b, cls: p.cls, dir: p.dir, name: p.name || p.label })).concat(res.relmap && res.relmap.edges ? res.relmap.edges.map(e => ({ a: e.a, b: e.b, cls: e.cls, dir: e.dir, name: e.label })) : []);
        edges.forEach(e => {
          if (!C[e.a] || !C[e.b] || tieLove(e.a, e.b)) return;
          if (e.cls === 'love' || e.cls === 'night') { if (!ok(C[e.a], C[e.b])) note('O1', who(e.a) + '×' + who(e.b) + '＝' + e.name); }
          else if (e.cls === 'pine') { const d = e.dir != null ? e.dir : e.a, x = d === e.a ? e.b : e.a; if (!one(C[d], C[x])) note('O1', who(d) + '→' + who(x) + '＝' + e.name); }
        });
        /* O2・O3：二人だけの出来事 */
        (res.log || []).forEach(e => {
          if (!e || typeof e.text !== 'string' || !Array.isArray(e.actors) || e.actors.length !== 2) return;
          const a = e.actors[0], b = e.actors[1];
          if (!C[a] || !C[b] || a === b || tieLove(a, b)) return;
          const t = e.text.replace(NOTSEX, '');
          var mm = t.match(SEX);
          if (mm && !ok(C[a], C[b])) note('O2', who(a) + '×' + who(b) + ' ｜ ' + (e.tag || e.label || '') + ' ｜「' + mm[0] + '」 ' + t.slice(Math.max(0, mm.index - 50), mm.index + 40));
          else if (!mm && CONF.test(t) && !one(C[a], C[b]) && !ok(C[a], C[b])) note('O3', who(a) + '→' + who(b) + ' ｜ ' + (e.tag || e.label || '') + ' ｜ ' + e.text.slice(0, 120));
        });
      }
    });
    return res0;
  }, { N, WHY, ENVSET });
  const tot = { O1: 0, O2: 0, O3: 0 };
  for (const id in r) { const o = r[id]; tot.O1 += o.O1; tot.O2 += o.O2; tot.O3 += o.O3; console.log(id.padEnd(10), 'runs', o.runs, 'err', o.err, 'O1', o.O1, 'O2', o.O2, 'O3', o.O3); o.ex.forEach(x => console.log('    ' + x.replace(/\n/g, ' '))); }
  console.log('合計', JSON.stringify(tot));
  console.log('pageerr', errors.slice(0, 3));
  await browser.close();
})();
