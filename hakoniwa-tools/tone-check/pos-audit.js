/* 受け攻め・女性どうしの描写の点検
   使い方: node pos-audit.js <ビルドのディレクトリ> [1シナリオあたりの回数=24] [シナリオid,…] [--samples]
   V1: 女性の住人だけが出てくる性的な場面に、男性の体を前提にした言葉（ちんぽ・射精など）が出た
   V2: 自分で「攻め」を選んだ住人が、受ける側の文（貫かれる・中に出される・押し倒される・縛られる など）になった
   V3: 向きの決まらない組（攻め×攻め・恋愛対象の合わない組）の二人だけの性的な場面が起きた */
const { openBuild } = require('./lib.js');
(async () => {
  const dir = process.argv[2], N = +process.argv[3] || 24, only = process.argv[4] && !/^--/.test(process.argv[4]) ? process.argv[4].split(',') : null;
  const SAMPLES = process.argv.includes('--samples');
  const { browser, page, errors } = await openBuild(dir, '');
  const r = await page.evaluate(({ N, only }) => {
    const P = HK.Pos, MALE = P.MALE_RE;
    const SEX = /抱い|抱かれ|エッチ|繋がっ|イカせ|イかせ|イった|イっ|果て|喘|挿れ|貫|舐め|愛撫|達し|体を重ね|奥まで|突き上げ|腰を(振|沈|打ち|揺)|跨[っが]|中に|犯/;
    const NPC_M = /男|客|触手|ゾンビ|魔物|オーク|ゴブリン|スライム|神|村人|教師|先生|店長|上司|略奪者|おじさん|兵|盗賊|医者|マッサージ師|施術師|整体師|司会|AD|カメラマン|監督|悪魔|インキュバス|獣|狼|蛇|蔦|植物|機械|ロボット|看守|看護|患者|社長|部長|課長|主人|旦那|夫|彼氏|王|騎士|勇者|魔王|山賊|漁師|船長/;
    const out = { V1: [], V2: [], V3: [], n: { V1: 0, V2: 0, V3: 0 }, err: [], runs: 0, bySc: {} };
    const NAMES = ['アキラ', 'ミナト', 'ユキノ', 'カオル', 'ハルカ', 'レンジ'];
    /* 配役の型：女性だけ（指定いろいろ）／攻めの指定が多い／攻めどうしを恋人に結ぶ／受け攻めそろい */
    const CASTS = [
      { g: ['f', 'f', 'f', 'f', 'f', 'f'], p: ['', '', '', '', '', ''], l: [] },
      { g: ['f', 'f', 'f', 'f', 'f', 'f'], p: ['top', 'bottom', 'top', 'riba', '', 'bottom'], l: [] },
      { g: ['m', 'm', 'f', 'm', 'f', 'm'], p: ['top', 'top', 'top', 'bottom', '', ''], l: [] },
      { g: ['m', 'f', 'm', 'f', 'm', 'm'], p: ['top', 'top', 'bottom', 'bottom', 'riba', 'top'], l: ['', 'tb', 'br', '', 'any', ''] },
      { g: ['m', 'm', 'm', 'm', 'm', 'm'], p: ['top', 'top', 'bottom', 'bottom', '', 'riba'], l: [], ties: [{ a: 0, b: 1, type: 'lover' }, { a: 2, b: 3, type: 'lover' }] },
      { g: ['f', 'f', 'm', 'f', 'm', 'f'], p: ['top', 'top', 'top', 'bottom', 'bottom', ''], l: [], ties: [{ a: 0, b: 1, type: 'lover' }, { a: 0, b: 3, type: 'fwb' }] }
    ];
    const ids = (only || Object.keys(HK.SCENARIOS));
    for (const sc of ids) {
      const scen = HK.SCENARIOS[sc]; if (!scen) continue;
      out.bySc[sc] = { V1: 0, V2: 0, V3: 0, runs: 0 };
      for (let s = 0; s < N; s++) {
        const cast = CASTS[s % CASTS.length];
        const n = Math.max(scen.minCast || 2, Math.min(scen.maxCast || 6, sc === 'jinro' ? 6 : 2 + (s % 5)));
        const chars = [], perChar = [];
        for (let i = 0; i < n; i++) {
          chars.push({ name: NAMES[i], eg: { CP: (s * 7 + i * 5) % 21, NP: (s * 3 + i * 11) % 21, A: (s * 13 + i * 3) % 21, FC: (s * 5 + i * 7) % 21, AC: (s * 11 + i * 3) % 21 }, memo: '', gender: cast.g[i], likes: '', tone: '', fp: '', pos: cast.p[i], posLike: cast.l[i] || '', color: '', call: '', calls: {}, loveLock: '' });
          perChar.push({ action: 'auto', goal: 'auto', stats: {}, weapon: '', pick: {}, role: '' });
        }
        const env = {}; (scen.env || []).forEach(e => { env[e.id] = e.def != null ? e.def : (e.options && e.options[0] ? e.options[0].v : (e.min != null ? e.min : '')); });
        /* 選択肢のある設定は回ごとにずらして、いろいろな条件を通す */
        (scen.env || []).forEach((e, k) => { if (e.options && e.options.length > 1 && (s + k) % 3 === 0) env[e.id] = e.options[(s + k) % e.options.length].v; });
        const ties = (cast.ties || []).filter(t => t.a < n && t.b < n);
        let res;
        try { res = HK.simulate({ scenId: sc, seed: 2000 + s, env, chars, perChar, ties }); } catch (e) { out.err.push(sc + ': ' + String(e && e.stack || e).slice(0, 300)); continue; }
        out.runs++; out.bySc[sc].runs++;
        const tops = chars.filter(c => P.hardTop(c));
        const texts = [];
        (res.log || []).forEach(e => { if (e && typeof e.text === 'string') texts.push({ t: e.text, ac: (e.actors || []).map(x => typeof x === 'number' ? x : x && x.i) }); });
        if (res.ending && Array.isArray(res.ending.lines)) res.ending.lines.forEach(l => typeof l === 'string' && texts.push({ t: l, ac: [] }));
        (res.chars || []).forEach(c => { if (typeof c.fateNote === 'string') texts.push({ t: c.fateNote, ac: [c.i] }); });
        for (const { t, ac } of texts) {
          const named = chars.filter(c => t.indexOf(c.name) >= 0);
          /* V1：女性どうし */
          /* 指・舌・道具を伴わない挿入の動詞も、女性どうしでは男性の体を前提にした描写として数える */
          const PEN = /奥まで沈め|深く沈め|腰を沈め|腰を落と|繋がっ|繋がり|貫|突い|突き上げ|突かれ|一突き|中に入っ|中へ入っ|入ってき|熱を吐き出|腰を打ちつけ|中で果て|奥で果て|最奥で|自分の中に導|迎え入れ|受け入れ|挿れ|挿入|抜き差し|根元まで|ピストン|穿/;
          const TOOLW = /指|舌|玩具|張り型|ローター|双頭|ディルド|バイブ|器具|道具|触手/;
          const penFF = t.split(/[。！？]/).some(x => PEN.test(x) && !TOOLW.test(x));
          if ((MALE.test(t) || penFF) && named.length >= 2 && named.every(c => c.gender === 'f') && !NPC_M.test(t)) {
            out.n.V1++; out.bySc[sc].V1++; if (out.V1.length < 400) out.V1.push(sc + ' | ' + t.slice(0, 400));
          }
          /* V2：攻めが受ける側 */
          for (const T of tops) {
            const n0 = T.name;
            const RX = [
              new RegExp(n0 + '(?:は|が|も|を)?[^。「」]{0,30}?(?:貫かれ|突かれ|突き上げられ|挿れられ|挿入され|犯され|中に出され|注がれ|イかされ|イカされ|責められ|組み敷かれ|押し倒され|縛られ|拘束され|跨がられ|跨られ|抱かれ|穿たれ|嬲られ|弄ばれ|鳴かされ|啼かされ|孕まされ|種付けされ|開発され|ほぐされ|慣らされ|受け入れ)'),
              new RegExp(n0 + 'の(?:中|奥|最奥|中に|奥に|後ろ|後孔|秘部|蕾|入り口|ナカ)(?:へ|に|を|で|まで)'),
              new RegExp('(?:を|に)?' + n0 + '(?:を|の中を|の奥を)(?:貫|犯|突き上げ|押し倒|組み敷|縛|責め|抱いた|抱き潰|穿|嬲|弄|跨|鳴か|啼か|イカせ|イかせ|ほぐ|慣ら|開発)')
            ];
            for (const re of RX) {
              const m = t.match(re);
              if (m) {
                /* 「攻めの名前」の前後に、ほかの人が主語として受けている書き方（例：「アキラはミナトを押し倒した」）は除く */
                const i0 = m.index, seg = t.slice(Math.max(0, i0 - 18), i0 + m[0].length + 10);
                out.n.V2++; out.bySc[sc].V2++; if (out.V2.length < 400) out.V2.push(sc + ' | 攻め=' + n0 + ' | …' + seg + '… || ' + t.slice(0, 260));
                break;
              }
            }
          }
          /* V3：向きの決まらない二人だけの性的な場面 */
          const ids2 = [...new Set(ac.filter(x => x != null))];
          if (ids2.length === 2 && SEX.test(t) && /(抱|エッチ|繋が|イ[かっカ]|果て|喘|挿|貫|舐|愛撫|達し|体を重ね)/.test(t)) {
            const a = chars[ids2[0]], b = chars[ids2[1]];
            if (a && b && !P.okSex(a, b) && t.indexOf(a.name) >= 0 && t.indexOf(b.name) >= 0) { out.n.V3++; out.bySc[sc].V3++; if (out.V3.length < 200) out.V3.push(sc + ' | ' + a.name + '(' + (a.pos || '-') + a.gender + ')×' + b.name + '(' + (b.pos || '-') + b.gender + ') | ' + t.slice(0, 300)); }
          }
        }
      }
    }
    return out;
  }, { N, only });
  console.log('runs', r.runs, 'counts', JSON.stringify(r.n));
  console.log('by scenario', JSON.stringify(Object.fromEntries(Object.entries(r.bySc).filter(([k, v]) => v.V1 || v.V2 || v.V3))));
  if (r.err.length) console.log('ERRORS', r.err.slice(0, 8));
  if (SAMPLES) for (const k of ['V1', 'V2', 'V3']) { console.log('##### ' + k); r[k].forEach(x => console.log(x)); }
  console.log('pageerr', errors.slice(0, 5));
  await browser.close();
})();
