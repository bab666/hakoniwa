/* 受け攻め・女性どうしの描写の点検
   使い方: node pos-audit.js <ビルドのディレクトリ> [1シナリオあたりの回数=24] [シナリオid,…] [--samples] [--env=lewd:high,style:ero]（設定を固定して回す）
   V1: 女性の住人だけが出てくる性的な場面に、男性の体を前提にした言葉（ちんぽ・射精など）が出た
   V2: 自分で「攻め」を選んだ住人が、受ける側の文（貫かれる・中に出される・押し倒される・縛られる など）になった
   V3: 向きの決まらない組（攻め×攻め・恋愛対象の合わない組）の二人だけの性的な場面が起きた
   V4: 女性の住人が、男性の体で描かれた（「自分のもの」で突く・射精する・相手の中に入る など）
   V1・V4 の例外：オメガバースで、第二性を優先して女性のαの攻めを挿れる側の体で書いた組（HK.Pos.maleTop）の二人が出る文
   V5: 夜の性格（attr.js）が受け攻めを変えた：マゾの人が攻め（{a}）の夜の性格の文を受け持った、自分で攻めを選んだ人が受け（{b}）の夜の性格の文を受け持った。
       奇数回は住人に夜の性格（マゾ・サド・意地悪・甘々・恥じらい、攻め指定の人にもマゾ）を付けて回す（攻め指定のマゾが受ける文は V2 でも数える）
   --why：数えずに除いた候補とその理由も出す（性的でない文・女性の攻めが男性に跨って迎える文・「攻めに〜された」の書き方 など）
   誤判定を減らすための除外：性的でない言い回し（NONSEX：「上達」「一貫」「旅路の果て」「注がれたお茶」など）は判定の前に消す。
   V2 は文に性的な語（SEXCORE）があるときだけ数え、女性の攻めが男性の相手に跨って自分の中に迎える文（女攻め×男）は数えない。
   V1 は箱庭が用意した男性のモブ（サキュバスの獲物・常識改変の客・マッサージのスタッフ）や星の生命体・壁の向こうの誰かが相手の文を数えない */
const { openBuild } = require('./lib.js');
(async () => {
  const dir = process.argv[2], N = +process.argv[3] || 24, only = process.argv[4] && !/^--/.test(process.argv[4]) ? process.argv[4].split(',') : null;
  const ENVSET = ((process.argv.find(a => /^--env=/.test(a)) || '').slice(6)).split(',').filter(Boolean).map(x => x.split(':'));
  const NPCBOT = !!process.env.NPCBOT, SAMPLES = process.argv.includes('--samples'), WHY = process.argv.includes('--why'), FF = process.argv.includes('--ff'), HOT = process.argv.includes('--hot');
  const { browser, page, errors } = await openBuild(dir, '');
  const r = await page.evaluate(({ N, only, FF, HOT, ENVSET, WHY, NPCBOT }) => {
    const P = HK.Pos, MALE = P.MALE_RE;
    const SEX = /抱い|抱かれ|エッチ|繋がっ|イカせ|イかせ|イった|イっ|果て|喘|挿れ|貫|舐め|愛撫|達し|体を重ね|奥まで|突き上げ|腰を(振|沈|打ち|揺)|跨[っが]|中に|犯/;
    const NPC_M = /男|客|獲物|審査員|触手|ゾンビ|魔物|オーク|ゴブリン|スライム|神|村人|教師|先生|店長|上司|略奪者|おじさん|兵|盗賊|医者|マッサージ師|施術師|整体師|司会|AD|カメラマン|監督|悪魔|インキュバス|獣|狼|蛇|蔦|植物|機械|ロボット|看守|看護|患者|社長|部長|課長|主人|旦那|夫|彼氏|王|騎士|勇者|魔王|山賊|漁師|船長/;
    /* 性的でない言い回し（「上達した」「一貫性」「舐めんな」「結果を受け入れた」など）は、性的な語の判定の前に消しておく */
    const NONSEX = /（イった）|（イかなかった）|(?:匂い|香り)が[^。]{0,10}(?:入ってき|奥まで)|(?:洞窟|森|遺跡|施設|地下|迷宮|神殿)の最奥|(?:ポケット|鞄|カバン|袋|懐|隙間|財布)に(?:ねじ込|突っ込)|(?:ひとかけら|かけら|傷|塩|飴|アイス|スプーン|皿|唇)を舐め|の果て(?=[にのへでまを、。])|果てしな|注がれた(?:お茶|茶|酒|水|コーヒー|紅茶|スープ|グラス|杯)|(?:お茶|茶|酒|水|コーヒー|紅茶|スープ)を注|上達|到達|配達|伝達|達成|発達|通達|熟達|調達|速達|先達|一貫|貫徹|貫通|貫禄|突き止め|突き当た|突き放|突き返|突き出|突き抜け|舐めん[なじ]|舐めた(?:真似|口)|舐めてんの|舐めてる(?:の|だろ)|残っているのは、エッチ[^。]*。?|受け入れ(?:られな|がた|る覚悟|てもらえ)|結果を受け入れ|運命を受け入れ|事実を受け入れ|提案を受け入れ|申し出を受け入れ|(?:記憶|情報|知識|声|映像|光|風|水|空気|お茶|茶|酒|視線|注目|愛情|力|魔力)(?:が|を)?[^。]{0,4}(?:注がれ|流れ込|注ぎ)/g;
    const clean = t => t.replace(NONSEX, '＿');
    /* 文単位で性的かどうか（「中に」「貫」など、性的でない文にも出る語は入れない） */
    const SEXCORE = /抱き潰|エッチ|イカせ|イかせ|イった|イっ|果て|喘|挿れ|挿入|舐め|愛撫|達し|体を重ね|腰を(?:振|沈|打ち|揺|落と|突き|使)|跨[っがりるら]|犯|根元|締めつけ|締め付け|締め上げ|吐き出|射精|ナカ|♡|昂り|濡れ|蜜|奥を|奥に|奥まで|一つにな|ひとつにな|繋がっ|繋がり|繋がる|呑み込|搾り|搾精|脈打|熱を増|ノット|種付け|孕|精を|白濁|注が|中に出/;
    const sentOf = (t, i) => { let a = i; while (a > 0 && !/[。！？\n]/.test(t[a - 1])) a--; let b = i; while (b < t.length && !/[。！？\n]/.test(t[b])) b++; return t.slice(a, b); };
    /* 箱庭が用意している男性のモブ（サキュバスの獲物・常識改変の客）は、女性の住人の相手でも男性の体で書いてよい */
    const MOBM = [];
    try { const SB = HK.SUCCUBUS; if (SB && SB.PREY) Object.keys(SB.PREY).forEach(k => SB.PREY[k] && SB.PREY[k].name && MOBM.push(SB.PREY[k].name)); } catch (e) { }
    try { const KH = HK.KAIHEN; if (KH && KH.SIT) Object.keys(KH.SIT).forEach(k => (KH.SIT[k].npc || []).forEach(nm => nm && MOBM.push(nm))); } catch (e) { }
    /* 宇宙船漂流記の星の生命体・異星の民、壁の向こうの誰か（壁尻）も、住人ではない相手として扱う */
    try { const SH = HK.SHIP; if (SH && SH.LIFE) SH.LIFE.forEach(x => x && x.name && MOBM.push(x.name)); } catch (e) { }
    const hasMobM = t => MOBM.some(nm => t.indexOf(nm) >= 0) || /夢の中|(?:風|氷|闇|影|水|炎|光|霧)の(?:腕|手|指|舌)|の民の住人|の若者たち|民(?=[をはがのに])|巨体|異星の|壁の向こう|向こう側の誰か|向こうの誰か|正体の分からない何か|若いスタッフ|二人のスタッフ|無口な職人|精液検査センター/.test(t);
    const skip = []; const sk = (why, sc, t, i) => { if (WHY && skip.length < 300) skip.push(why + ' | ' + sc + ' | …' + t.slice(Math.max(0, i - 30), i + 60) + '…'); };
    const out = { skip, V1: [], V2: [], V3: [], V4: [], V5: [], n: { V1: 0, V2: 0, V3: 0, V4: 0, V5: 0 }, err: [], runs: 0, bySc: {}, v5n: 0 };
    const NAMES = ['アキラ', 'ミナト', 'ユキノ', 'カオル', 'ハルカ', 'レンジ'];
    /* 配役の型：女性だけ（指定いろいろ）／攻めの指定が多い／攻めどうしを恋人に結ぶ／受け攻めそろい */
    const CASTS = [
      { g: ['f', 'f', 'f', 'f', 'f', 'f'], p: ['', '', '', '', '', ''], l: [] },
      { g: ['f', 'f', 'f', 'f', 'f', 'f'], p: ['top', 'bottom', 'top', 'riba', '', 'bottom'], l: [] },
      { g: ['m', 'm', 'f', 'm', 'f', 'm'], p: ['top', 'top', 'top', 'bottom', '', ''], l: [] },
      { g: ['m', 'f', 'm', 'f', 'm', 'm'], p: ['top', 'top', 'bottom', 'bottom', 'riba', 'top'], l: ['', 'tb', 'br', '', 'any', ''] },
      { g: ['m', 'm', 'm', 'm', 'm', 'm'], p: ['top', 'top', 'bottom', 'bottom', '', 'riba'], l: [], ties: [{ a: 0, b: 1, type: 'lover' }, { a: 2, b: 3, type: 'lover' }] },
      { g: ['f', 'f', 'm', 'f', 'm', 'f'], p: ['top', 'top', 'top', 'bottom', 'bottom', ''], l: [], ties: [{ a: 0, b: 1, type: 'lover' }, { a: 0, b: 3, type: 'fwb' }] },
      /* 女性が攻め・男性が受けの組 */
      { g: ['f', 'm', 'f', 'm', 'f', 'm'], p: ['top', 'bottom', 'top', '', 'top', 'bottom'], l: [], ties: [{ a: 0, b: 1, type: 'lover' }, { a: 2, b: 3, type: 'fwb' }] },
      { g: ['m', 'f', 'm', 'f', 'm', 'f'], p: ['bottom', 'top', '', 'top', 'bottom', 'top'], l: [], ties: [{ a: 0, b: 1, type: 'lover' }, { a: 4, b: 5, type: 'lover' }] }
    ];
    /* --ff：女性だけの配役（受け攻めの指定いろいろ・恋人や片想いで結ぶ） */
    const FFC = [
      { g: ['f', 'f', 'f', 'f', 'f', 'f'], p: ['', '', '', '', '', ''], l: [], ties: [{ a: 0, b: 1, type: 'lover' }] },
      { g: ['f', 'f', 'f', 'f', 'f', 'f'], p: ['top', 'bottom', 'top', 'riba', '', 'bottom'], l: [], ties: [{ a: 0, b: 1, type: 'lover' }, { a: 2, b: 3, type: 'fwb' }] },
      { g: ['f', 'f', 'f', 'f', 'f', 'f'], p: ['riba', 'riba', '', 'top', 'bottom', ''], l: [], ties: [{ a: 0, b: 1, type: 'lover' }, { a: 3, b: 4, type: 'lover' }] },
      { g: ['f', 'f', 'f', 'f', 'f', 'f'], p: ['bottom', '', 'bottom', '', 'top', 'riba'], l: [], ties: [{ a: 1, b: 0, type: 'crush' }, { a: 4, b: 2, type: 'lover' }] },
      { g: ['f', 'f', 'f', 'f', 'f', 'f'], p: ['', 'top', 'riba', 'bottom', '', ''], l: [], ties: [{ a: 0, b: 2, type: 'enemy' }, { a: 1, b: 3, type: 'lover' }] }
    ];
    if (FF) CASTS.splice(0, CASTS.length, ...FFC);
    const ids = (only || Object.keys(HK.SCENARIOS));
    for (const sc of ids) {
      const scen = HK.SCENARIOS[sc]; if (!scen) continue;
      out.bySc[sc] = { V1: 0, V2: 0, V3: 0, V4: 0, V5: 0, runs: 0 };
      for (let s = 0; s < N; s++) {
        const cast = CASTS[s % CASTS.length];
        const n = Math.max(scen.minCast || 2, Math.min(scen.maxCast || 6, sc === 'jinro' ? 6 : 2 + (s % 5)));
        const chars = [], perChar = [];
        for (let i = 0; i < n; i++) {
          chars.push({ name: NAMES[i], eg: { CP: (s * 7 + i * 5) % 21, NP: (s * 3 + i * 11) % 21, A: (s * 13 + i * 3) % 21, FC: (s * 5 + i * 7) % 21, AC: (s * 11 + i * 3) % 21 }, memo: '', gender: cast.g[i], likes: '', tone: '', fp: '', pos: cast.p[i], posLike: cast.l[i] || '', color: '', call: '', calls: {}, loveLock: '', posNpc: NPCBOT && (cast.p[i] === 'top' || cast.p[i] === 'riba') ? 'bottom' : '' });
          perChar.push({ action: 'auto', goal: 'auto', stats: {}, weapon: '', pick: {}, role: '' });
        }
        /* V5：奇数回は夜の性格を付ける（0 番はたいてい攻め指定。攻め指定のマゾも混ぜる）。1 番から 0 番へは相手ごとの指定でサド */
        if (s % 2 && HK.Attr) { const NIGHT = ['maso', 'sadist', 'maso', 'mean', 'sweet', 'shy']; chars.forEach((c, i) => { c.night = NIGHT[(i + (s >> 1)) % NIGHT.length]; }); if (n >= 2) chars[1].nightFor = { 0: 'sadist' }; }
        const env = {}; (scen.env || []).forEach(e => { env[e.id] = e.def != null ? e.def : (e.options && e.options[0] ? e.options[0].v : (e.min != null ? e.min : '')); });
        /* 選択肢のある設定は回ごとにずらして、いろいろな条件を通す */
        (scen.env || []).forEach((e, k) => { if (e.options && e.options.length > 1 && (s + k) % 3 === 0) env[e.id] = e.options[(s + k) % e.options.length].v; });
        /* --hot：性的な場面が起きやすい設定に */
        if (HOT) (scen.env || []).forEach(e => {
          if (e.max != null && /lewd|dose|shady|heat|prey|pleasure|traffic|ev$|aphro|night/.test(e.id)) env[e.id] = e.max;
          else if (e.options && /lewd/.test(e.id)) { const hi = e.options.filter(o => /high|max|lewd/.test(o.v))[0]; if (hi) env[e.id] = hi.v; }
          if (e.id === 'mode' && e.options && e.options.some(o => o.v === 'lewd')) env[e.id] = 'lewd';
        });
        Object.keys(env).forEach(k => { if (/^role_/.test(k)) env[k] = s % 2 ? 'res' : 'auto'; });
        ENVSET.forEach(kv => { env[kv[0]] = isNaN(+kv[1]) ? kv[1] : +kv[1]; });
        const ties = (cast.ties || []).filter(t => t.a < n && t.b < n);
        let res;
        /* 内容のスイッチ（content.js）：指定がなければすべて入にして、いちばん広く回す */
        if (HK.Content && env.ct == null) env.ct = HK.Content.TAGS.map(t => t.id).join(',');
        if (HK.Attr) HK.Attr.log = [];
        try { res = HK.simulate({ scenId: sc, seed: 2000 + s, env, chars, perChar, ties }); } catch (e) { out.err.push(sc + ': ' + String(e && e.stack || e).slice(0, 300)); continue; }
        out.runs++; out.bySc[sc].runs++;
        /* V5：夜の性格の文の受け持ち（attr-r18.js の HK.Attr.log） */
        ((HK.Attr && HK.Attr.log) || []).forEach(g => {
          out.v5n++;
          const who = chars.filter(c => c.name === g.who)[0];
          const bad = (g.role === 'a' && g.night === 'maso') || (g.role === 'b' && who && P.hardTop(who)) || g.a === g.b;
          if (bad) { out.n.V5++; out.bySc[sc].V5++; if (out.V5.length < 200) out.V5.push(sc + ' | ' + JSON.stringify(g)); }
        });
        if (HK.Attr) HK.Attr.log = null;
        const tops = chars.filter(c => P.hardTop(c));
        /* オメガバースだけ：第二性を優先して、女性のαの攻めを挿れる側の体で書いた組（omega-heat.js の OM.bodyKind が HK.Pos.maleTop に記録）。
           その二人が出る文は、V1（女性どうしに男性の体の言葉）・V4（女性の攻めが男性の体）で数えない。ほかの箱庭では空 */
        const MT = sc === 'omega' && P.maleTop ? Object.keys(P.maleTop).map(k => k.split('\u0001')) : [];
        const mtIn = (t, who) => MT.some(([x, y]) => (!who || x === who) && t.indexOf(x) >= 0 && t.indexOf(y) >= 0);
        const texts = [];
        (res.log || []).forEach(e => { if (e && typeof e.text === 'string') texts.push({ t: e.text, ac: (e.actors || []).map(x => typeof x === 'number' ? x : x && x.i) }); });
        if (res.ending && Array.isArray(res.ending.lines)) res.ending.lines.forEach(l => typeof l === 'string' && texts.push({ t: l, ac: [] }));
        (res.chars || []).forEach(c => { if (typeof c.fateNote === 'string') texts.push({ t: c.fateNote, ac: [c.i] }); });
        for (const { t: t0, ac } of texts) {
          const t = clean(t0);
          const named = chars.filter(c => t.indexOf(c.name) >= 0);
          /* V1：女性どうし */
          /* 指・舌・道具を伴わない挿入の動詞も、女性どうしでは男性の体を前提にした描写として数える */
          const PEN = /奥まで沈め|深く沈め|腰を沈め|腰を落と|繋がっ|繋がり|貫|突い|突き上げ|突かれ|一突き|中に入っ|中へ入っ|入ってき|熱を吐き出|腰を打ちつけ|中で果て|奥で果て|最奥で|自分の中に導|迎え入れ|受け入れ|挿れ|挿入|抜き差し|根元まで|ピストン|穿/;
          const TOOLW = /指|舌|玩具|張り型|張形|ローター|双頭|ディルド|バイブ|器具|道具|触手/;
          const penFF = t.split(/[。！？]/).some(x => PEN.test(x) && !TOOLW.test(x) && SEXCORE.test(x));
          const allF = chars.every(c => c.gender === 'f');
          if ((MALE.test(t) || /(?:の|な)モノ(?:が|を|で|に|は|の先)/.test(t) || penFF) && (named.length >= 2 || (allF && named.length >= 1 && SEX.test(t))) && named.every(c => c.gender === 'f') && !NPC_M.test(t0) && !hasMobM(t0) && !mtIn(t0)) {
            out.n.V1++; out.bySc[sc].V1++;
            const mm = t.match(MALE), ps = t.split(/[。！？]/).filter(x => PEN.test(x) && !TOOLW.test(x) && SEXCORE.test(x))[0];
            if (out.V1.length < 400) out.V1.push(sc + ' | 〔' + (mm ? mm[0] : '') + (ps ? '／' + ps.slice(0, 60) : '') + '〕 ' + t.slice(0, 400));
          }
          /* V2：攻めが受ける側 */
          for (const T of tops) {
            const n0 = T.name;
            /* 「攻めだが、モブには受け」の人が、住人の名前の出ない文（モブ・魔物が相手）で受けるのは正しい */
            if (T.posNpc === 'bottom' && (named.length <= 1 || hasMobM(t0) || NPC_M.test(t0))) continue;
            const RX = [
              new RegExp(n0 + '(?:は|が|も|を)?[^。「」]{0,30}?(?:貫かれ|突かれ|突き上げられ|挿れられ|挿入され|犯され|中に出され|注がれ|イかされ|イカされ|責められ|組み敷かれ|押し倒され|縛られ|拘束され|跨がられ|跨られ|抱かれ|穿たれ|嬲られ|弄ばれ|鳴かされ|啼かされ|孕まされ|種付けされ|開発され|ほぐされ|慣らされ|受け入れ)'),
              new RegExp(n0 + 'の(?:中|奥|最奥|中に|奥に|後ろ|後孔|秘部|蕾|入り口|ナカ)(?:へ|に|を|で|まで)'),
              new RegExp('(?:を|に)?' + n0 + '(?:を|の中を|の奥を)(?:貫|犯|突き上げ|押し倒|組み敷|縛|責め|抱いた|抱き潰|穿|嬲|弄|跨|鳴か|啼か|イカせ|イかせ|ほぐ|慣ら|開発)')
            ];
            for (let k = 0; k < RX.length; k++) {
              const re = RX[k];
              const m = t.match(re);
              /* 「〜の後ろに隠れる」のような性的でない文は数えない */
              if (m && /隠れ|半分/.test(t.slice(m.index, m.index + m[0].length + 12))) continue;
              /* 「アキラに貫かれた」「アキラに腰を掴まれて」の「に」は動かす側（攻め）の印。「アキラを根元まで受け入れた」は相手が受けている */
              if (m && k === 0 && /^(?:に|から|によ|の手で|を[^。]{0,20}受け入れ)/.test(t.slice(m.index + n0.length))) { sk('V2:攻めが動かす側', sc, t, m.index); continue; }
              /* 性的な語のない文（「縛られたまま連れ出された」「アキラの中で、点と点が」など）は数えない */
              if (m && (!SEXCORE.test(sentOf(t, m.index) + sentOf(t, Math.min(t.length - 1, m.index + m[0].length))) || /取り残された[^。]{0,12}縛られたまま|祭り囃子が近づ/.test(t))) { sk('V2:非性的', sc, t, m.index); continue; }
              /* 女性の攻めが男性の相手に跨って自分の中に迎える（女攻め×男）のは、攻めのまま。指・舌・道具で中を責められるときだけ数える */
              if (m && k === 1 && T.gender === 'f' && !/指|舌|玩具|張り型|ディルド|バイブ|双頭|器具|道具/.test(sentOf(t, m.index))) { sk('V2:女攻めが迎える(' + named.map(c => c.name + c.gender).join(',') + ')', sc, t, m.index); continue; }
              if (m && k === 0 && T.gender === 'f' && /受け入れ|跨がられ|跨られ/.test(m[0]) && !/指|舌|玩具|張り型|ディルド|バイブ|双頭/.test(sentOf(t, m.index))) continue;
              if (m) {
                /* 「攻めの名前」の前後に、ほかの人が主語として受けている書き方（例：「アキラはミナトを押し倒した」）は除く */
                const i0 = m.index, seg = t.slice(Math.max(0, i0 - 18), i0 + m[0].length + 10);
                out.n.V2++; out.bySc[sc].V2++; if (out.V2.length < 400) out.V2.push(sc + ' | 攻め=' + n0 + '(' + T.gender + ') | …' + seg + '… || ' + t.slice(0, 260));
                break;
              }
            }
          }
          /* V4：女性の攻めが、男性の体で描かれた */
          for (const T of chars.filter(c => c.gender === 'f')) {
            const n0 = T.name;
            if (mtIn(t0, n0)) continue;
            const RX4 = [
              new RegExp(n0 + '(?:は|が|も)[^。「」]{0,40}?(?:突き入れ(?!られ)|ねじ込ん|腰を打ちつけ(?!られ)|奥を突(?!か)|突き上げ(?!られ)|貫い|中に出し|中に吐き出|射精|精を放|種付け|自分のものを|昂りを(?:押し当|宛て|沈め|ねじ込|突き入)|熱を押し当て|穿(?!た[れせ]))'),
              new RegExp(n0 + 'の(?:もの|モノ|ちんぽ|ちんこ|肉棒|ペニス|陰茎|男根|いちもつ|一物|先端|根元|竿)(?:が|を|は|で|に)(?!な[っりる]|して|する|では)'),
              new RegExp(n0 + 'は[^。「」]{0,30}?(?:の中|の奥)(?:に|へ|で)(?:果て|放|吐き出|出し)')
            ];
            for (const re of RX4) {
              const m = t.match(re);
              if (m && /上で|跨|胸に手をつ|咥え込|呑み込|腰を(?:落と|沈め)|締めつけ/.test(m[0])) continue;
              /* 「血はアキラのものではなかった」「レンジのものになった」のような持ち主の言い方は除く */
              if (m && /のもの/.test(m[0]) && /^(?:では|だ|に(?:な|し|す))/.test(t.slice(m.index + m[0].length - 1))) continue;
              /* 相手の射精を止める・相手の昂りを扱うなど、女性の攻めが相手の体を責めている文は除く */
              if (m && /射精の(?:直前|手前|寸前|間際|兆候|気配|予兆|タイミング)|射精を(?:止|管理|許|禁|させ|促|我慢|こらえ)|射精させ|昂りを(?:持て余|抑え|鎮め|隠)/.test(t.slice(m.index, m.index + m[0].length + 8))) continue;
              /* 名前のあとで主語が別の人に変わっている（「アキラが指を緩めた瞬間、客は腰を突き上げて果てた」） */
              if (m && /[、][^、。]{1,20}(?:は|が|も)[^、。]*$/.test(m[0]) && !new RegExp('[、]' + n0).test(m[0])) continue;
              if (m) { const i0 = m.index; out.n.V4++; out.bySc[sc].V4++; if (out.V4.length < 400) out.V4.push(sc + ' | 攻め(女)=' + n0 + ' | …' + t.slice(Math.max(0, i0 - 10), i0 + m[0].length + 10) + '…'); break; }
            }
          }
          /* V3：向きの決まらない二人だけの性的な場面 */
          const ids2 = [...new Set(ac.filter(x => x != null))];
          if (ids2.length === 2 && SEX.test(t) && SEXCORE.test(t) && /(抱|エッチ|繋が|イ[かっカ]|果て|喘|挿|貫|舐|愛撫|達し|体を重ね)/.test(t)) {
            const a = chars[ids2[0]], b = chars[ids2[1]];
            /* モブ（略奪者・男たち・村人など）が相手の場面に、もう一人の住人が居合わせただけの文は数えない */
            if (a && b && /男たち|略奪者|目出し帽|村人たち|村の男|若い衆/.test(t0)) continue;
            if (a && b && !P.okSex(a, b) && t.indexOf(a.name) >= 0 && t.indexOf(b.name) >= 0) { out.n.V3++; out.bySc[sc].V3++; if (out.V3.length < 200) out.V3.push(sc + ' | ' + a.name + '(' + (a.pos || '-') + a.gender + ')×' + b.name + '(' + (b.pos || '-') + b.gender + ') | ' + t.slice(0, 300)); }
          }
        }
      }
    }
    return out;
  }, { N, only, FF, HOT, ENVSET, WHY, NPCBOT });
  console.log('runs', r.runs, 'counts', JSON.stringify(r.n), 'V5で見た夜の性格の文', r.v5n);
  console.log('by scenario', JSON.stringify(Object.fromEntries(Object.entries(r.bySc).filter(([k, v]) => v.V1 || v.V2 || v.V3 || v.V4 || v.V5))));
  if (r.err.length) console.log('ERRORS', r.err.slice(0, 8));
  if (SAMPLES) for (const k of ['V1', 'V2', 'V3', 'V4', 'V5']) { console.log('##### ' + k); r[k].forEach(x => console.log(x)); }
  if (WHY) { console.log('##### 除外したもの'); r.skip.forEach(x => console.log(x.replace(/\n/g, ' '))); }
  console.log('pageerr', errors.slice(0, 5));
  await browser.close();
})();
