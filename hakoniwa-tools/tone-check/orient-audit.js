/* 恋愛対象の点検：キャラの「恋愛対象」（男性／女性／なし）に合わない相手と、恋人・両想い・夜・体の関係になっていないかを全箱庭で確かめる
   使い方: node orient-audit.js <ビルドのフォルダ> [回数=40] [r18|safe] [--why]
   ・配役：異性だけが対象の人ばかり／同性だけが対象の人ばかり／男女混合で対象がばらばら（なし を含む）。受け攻めの指定もばらばらにする
   ・関係の設定は付けない回と、恋愛でない関係（友人・敵対など）だけ付ける回（恋人などの関係を明示した組は、ユーザーの指定なので点検しない）
   ・見るもの：
     O1 結末の関係（エンジン型の pairs、物語型の relmap）が恋人・夜・片想い系なのに、恋愛対象が合わない
     O2 二人だけの出来事で、性的な文（行為の言葉）なのに、恋愛対象が合わない
     O3 二人だけの出来事で、告白・恋人になる文なのに、告白した側（最初の人）の恋愛対象が合わない
     O4 恋愛：なしの家族・無関心・恐怖の二人が、結末の恋愛・夜・片想いの関係になった／二人の名前だけが出る性的な文・恋愛の文（告白・キス・恋人になる）に出た
        （4回に1回、0-1 に恋愛：なしの家族、1-2 に無関心か恐怖を付けて、その回だけ数える。2026-10-26 追加：R18が中心の箱庭・吸血の夜で家族の二人が体の関係になっていたため）
     O5 全年齢モード（safe）・全年齢版で、はっきりした性的な語の文が出た（2026-10-26 追加：女性上位の見直しが全年齢モードで事件の文を差し替えていたため）
     （2026-10-27 担当HC）恋愛対象「なし」は「恋愛にならない」の意味。内容のスイッチ「合意のない展開」が入（展開の重さが穏やかでない）のときの
        切羽詰まった場面（執着の監禁の夜・歪んだ関係の拒めない夜・敵対する二人の強引なエッチ・出られない部屋の条件のエッチ）だけは、恋愛対象「なし」の人も体の関係になれる。
        その出来事は理由（e.why）に「〔合意のない展開〕」の印があり、恋愛対象「なし」を「おまかせ」と見れば恋愛対象が合う組なら O2 に数えない（許した数を「F」に出す）。
        恋愛（告白 O3・結末の恋人／両片想い／片想い O1）は、恋愛対象「なし」の人ではこれまでどおりエラー。
        8回に1回（FT の回）、0〜2 を恋愛対象「なし」にして、1→0 歪んだ関係（怯えている）・2→0 執着（困惑）・0-2 と 1-2 敵対（愛憎 双方）を付け、
        この回は執着の組も点検する（歪んだ関係は恋人どうしの関係なので、ユーザーの指定として点検しない）
     （2026-10-27 担当HG）恋愛対象「なし」の人の体の関係は、R18版だけの欄「体の関係の相手」（sexLikes：おまかせ／男性／女性／男女両方／なし）で見る。
        合意ありの体の場面（セフレ・一夜・勢いの夜など。理由に印がない）も、体の関係の相手の性別に合えば O2 に数えない（許した数を「F合意」に、
        切羽詰まった場面は「F非合意」に出す）。体の関係の相手が「なし」の人・全年齢モード・全年齢版はこれまでどおりエラー。
        結末の「セフレ」「一夜の関係」（分類 night）も、体の関係の相手の性別に合えば O1 に数えない（恋人・両片想い・片想いはエラー）。
        配役：恋愛対象「なし」の人に体の関係の相手を順に（おまかせ／男性／女性／男女両方／なし）、奇数回は全員に性欲の強さ（ふつう／なし／弱い／強い）を付ける。
     O6 性欲「なし」の人が、合意ありの二人の性的な場面（理由に〔合意のない展開〕の印がない）に出た（R18版。2026-10-27 担当HG）。
        R18が中心の箱庭（HK.State.R18_CORE：ダンジョン・遮断穴・常識改変・サキュバス・バラエティ・マッサージ）と催眠は、箱庭の仕掛けそのものが相手の場面なので数えない
   ・O2・O3 は文から拾うので誤判定がありうる。--why で例を出すので目で確かめる */
const { openBuild } = require('./lib');
(async () => {
  const dir = process.argv[2], N = +process.argv[3] || 40, mode = process.argv[4] || 'r18', WHY = process.argv.includes('--why');
  if (!dir) { console.log('使い方: node orient-audit.js <ビルドのフォルダ> [回数] [r18|safe] [--why]'); process.exit(1); }
  const { browser, page, errors } = await openBuild(dir, mode === 'safe' ? 'safe' : mode === 'r18' ? 'r18' : '', { lewdMode: 'direct' });
  const ENVSET = ((process.argv.find(a => /^--env=/.test(a)) || '').slice(6)).split(',').filter(Boolean).map(x => x.split(':'));
  const r = await page.evaluate(({ N, WHY, ENVSET }) => {
    const SEX = /挿入|挿れ|射精|精液|愛液|ちんぽ|喘ぎ|喘い|腰を振|腰を打ち|奥まで(?:突|沈|貫)|(?<!牙が)深く沈|フェラ|咥え込|秘所|貫か|貫い|絶頂|イっ|イく|中に出|舐め上げ|乳首|性器|ひだ|襞|潮を|搾り取|犯し|犯さ|セックス|抱き潰|跨って腰|騎乗|ノット|夜を共に|体を重ね|肌を重ね|一夜を共に|抱かれ|抱いた|求め合/;
    /* 出られない部屋の条件「『好き』と言い合う」を義理で満たす場面（扉を見たまま「好きだ。……これでいいか？」など）は告白ではないので O3 に数えない（3本化で硬い常体の「好きだ。」が CONF に当たるようになったため） */
    const ROOM_LOVE_COND = /これでいい(?:か|ですか)?？|棒読み|扉を見たまま/;
    const CONF = /(?:付き合って|恋人になって)(?:ください|ほしい|くれ(?!た))|付き合おう|恋人になった|両想いに|告白した|想いを告げ|好きだ。|好きです。/;
    const NOTSEX = /(?:殺人|罪|過ち|犯罪)を犯[しさすせ]?|精液検査|ほかの結果：[^\n]*|ほかに：[^\n]*|アシスタントに[^。]*|抱いた(?:まま|肩|膝)|肩を抱|膝を抱|頭を抱|抱いた(?:子|赤)|日照りに喘|息を喘|旅路の果て|(?:胸|腹|喉|背中|心臓)を貫か|(?:希望|期待|疑問|不安|疑い|好意|敬意)を抱いた/;
    const LOVE_T = /^(lover|fwb|mate|fated|crush|almost|ex|yan|worship)$/;
    function one(a, b) { if (!a.likes || a.likes === 'both') return true; if (a.likes === 'none') return false; if (!b.gender || b.gender === 'x') return true; return a.likes === b.gender; }
    function ok(a, b) { return one(a, b) && one(b, a); }
    /* 体の関係として合うか：恋愛対象「なし」の人は「体の関係の相手」（sexLikes）で見る（全年齢モード・全年齢版では体の関係にならない） */
    function oneS(a, b) { let v = a.likes; if (v === 'none') { if (SAFE) return false; v = a.sexLikes || ''; if (v === 'none') return false; } if (!v || v === 'both') return true; if (!b.gender || b.gender === 'x') return true; return v === b.gender; }
    function okS(a, b) { return oneS(a, b) && oneS(b, a); }
    const FORCE_RE = /〔合意のない展開〕/;
    const NAMES = ['アキラ', 'ユキノ', 'ミナト', 'ソラ', 'カエデ', 'ヒカル', 'レンジ', 'カオル'];
    /* 配役の型：het＝異性だけ、homo＝同性だけ、mix＝ばらばら */
    function cast(type, n, s) {
      const out = [];
      for (let i = 0; i < n; i++) {
        const g = (i + s) % 2 ? 'f' : 'm';
        let likes = type === 'het' ? (g === 'm' ? 'f' : 'm') : type === 'homo' ? g : ['m', 'f', 'both', 'none', '', g === 'm' ? 'f' : 'm'][(i * 3 + s) % 6];
        out.push({ name: NAMES[i], eg: { CP: (s * 7 + i * 5) % 21, NP: (s * 3 + i * 11) % 21, A: (s * 13 + i * 3) % 21, FC: (s * 5 + i * 7) % 21, AC: (s * 11 + i * 3) % 21 }, gender: g, likes: likes, pos: ['', 'top', 'bottom', 'riba'][(i + s) % 4], tone: '', fp: '', calls: {}, memo: '',
          sexLikes: likes === 'none' ? ['', 'm', 'f', 'both', 'none'][(i + (s >> 1)) % 5] : '', libido: s % 2 ? ['', 'none', 'low', 'high'][(i * 3 + (s >> 1)) % 4] : '' });
      }
      return out;
    }
    const res0 = {};
    const ids = HK.SCEN_ORDER.filter(id => HK.SCENARIOS[id]);
    /* 恋愛：なしの家族（ties.js の family で loveOK でないもの） */
    const FAMNL = {}; Object.keys(HK.TIES || {}).forEach(k => { if (HK.TIES[k].family && !HK.TIES[k].loveOK) FAMNL[k] = 1; });
    /* O4：住人の名前がちょうど二人で、モブの語のない文。O5：全年齢モード・全年齢版の性的な文（はっきりした語だけ） */
    const MOB4 = /男たち|客|触手|ゾンビ|魔物|村人|略奪者|モブ|生命体|異星|邪神|眷属|獲物|スタッフ|見知らぬ|壁の向こう/;
    const NOT4 = /殺し|付き合っているか|罪を|秘密を|嘘を|見て(?:い|しま)|見つめ|眺め|気づ|噂|想像|思い出|夢(?:に|で|を|の)|話を|話して|話し(?:た|合)|相談|からかわ|冷やかし|嫉妬|応援|祝福|目撃|もし|ふり|フリ|王様ゲーム|命令|お題|罰ゲーム|キス！|告白の練習|告白するなら|付き合ってや(?:る|らなく)|付き合ってもいない|ほかに：|ほかの結果：|だったものに抱かれ|腕の中でしばらく浅い息|数えてもらえない|口づけるように|肩を抱|抱きしめ|抱き寄せ|抱きとめ|抱きかかえ|抱き合/;
    const SEX4 = /挿れ|挿入|射精|精液|腰を(?:振|打ちつけ|沈め|揺ら|落と)|跨[っが]|喘(?:ぎ|い)|絶頂|イかせ|イカせ|イった|イっちゃ|果て(?:た|て)|体を重ね|肌を重ね|繋がっ|中に出|愛撫|抱かれ|抱いた(?!まま)|口づけ|キス|唇を(?:重ね|奪)|告白し|付き合(?:って|おう|い始)|恋人(?:に|どうし|同士)にな|両想いにな/;
    const SAFE5 = /挿れ|挿入|射精|精液|腰を(?:振|打ちつけ|沈め|揺ら)|跨って腰|喘ぎ|絶頂|♡|中に出|イかせ|イカせ|イっ(?:た|ちゃ)|ちんぽ|秘所|愛液|抱き潰/;
    const SAFE = !!HK.SAFE_ON;
    const LIB_SKIP = Object.assign({ saimin: 1 }, (HK.State && HK.State.R18_CORE) || {});
    ids.forEach(id => {
      const sc = HK.SCENARIOS[id], o = res0[id] = { runs: 0, err: 0, O1: 0, O2: 0, O3: 0, O4: 0, O5: 0, O6: 0, F: 0, Fc: 0, ex: [] };
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
        /* O4 の配役（2026-10-26）：4回に1回、恋愛：なしの家族（0-1）と無関心・恐怖（1-2）を付ける。恋愛対象は「両方」にそろえて、この二組だけが恋愛・夜の候補から外れるようにする */
        const NL_T = s % 4 === 1 && n >= 2;
        if (NL_T) {
          chars.forEach(c => { c.likes = 'both'; });
          ties.push({ a: 0, b: 1, type: ['sibling', 'parent', 'sibclose', 'relative', 'stepsib'][(s >> 2) % 5], love: '' });
          if (n >= 3) ties.push({ a: 1, b: 2, type: (s >> 2) % 2 ? 'apathy' : 'fear' });
        }
        /* FT の回（2026-10-27 担当HC）：恋愛対象「なし」の三人に、歪んだ関係・執着・敵対（愛憎 双方）を付ける */
        const FT = s % 8 === 6 && n >= 3;
        if (FT) {
          for (let i = 0; i < 3; i++) chars[i].likes = 'none';
          ties.length = 0;
          ties.push({ a: 1, b: 0, type: 'abuse', cold: 'fear' }, { a: 2, b: 0, type: 'yan', cold: 'confused' }, { a: 0, b: 2, type: 'enemy', lh: 'both' }, { a: 1, b: 2, type: 'enemy', lh: 'both' });
        }
        const nlPair = (a, b) => ties.some(t => (FAMNL[t.type] && t.love !== 'ok' || t.type === 'apathy' || t.type === 'fear') && ((t.a === a && t.b === b) || (t.a === b && t.b === a)));
        let res;
        /* 内容のスイッチ（content.js）：指定がなければすべて入にして、いちばん広く回す */
        if (HK.Content && env.ct == null) env.ct = HK.Content.TAGS.map(t => t.id).join(',');
        try { res = HK.simulate({ scenId: id, seed: 4000 + s * 17, env, chars, perChar: chars.map(() => ({ action: 'auto', goal: 'auto', stats: {}, pick: {}, role: '' })), ties }); }
        catch (e) { o.err++; continue; }
        o.runs++;
        const C = (res.chars && res.chars.length ? res.chars : chars).map((c, i) => ({ name: c.name, gender: chars[i] ? chars[i].gender : c.gender, likes: chars[i] ? chars[i].likes : c.likes, sexLikes: chars[i] ? chars[i].sexLikes : '', libido: chars[i] ? chars[i].libido : '' }));
        /* FT の回：執着（yan）は恋愛の関係として外さない（恋愛対象「なし」の人が、執着から恋人・告白に進まないかを見る）。歪んだ関係（abuse）は恋人どうしの関係なので、ユーザーの指定として外す */
        const tieLove = (a, b) => ties.some(t => (FT ? t.type === 'abuse' || (LOVE_T.test(t.type) && t.type !== 'yan') : LOVE_T.test(t.type)) && ((t.a === a && t.b === b) || (t.a === b && t.b === a)));
        const forceOn = !SAFE && HK.Content && HK.Content.on(env, 'force', id);
        const note = (k, msg) => { o[k]++; if (WHY && o.ex.length < 6) o.ex.push(k + ' [' + type + '] ' + msg); };
        const who = i => C[i] ? C[i].name + '(' + C[i].gender + '→' + (C[i].likes || '任') + (C[i].likes === 'none' ? '・体' + (C[i].sexLikes || '任') : '') + (C[i].libido ? '・欲' + C[i].libido : '') + ')' : '?';
        /* O1：結末の関係 */
        const edges = (res.pairs || []).map(p => ({ a: p.a, b: p.b, cls: p.cls, dir: p.dir, name: p.name || p.label })).concat(res.relmap && res.relmap.edges ? res.relmap.edges.map(e => ({ a: e.a, b: e.b, cls: e.cls, dir: e.dir, name: e.label })) : []);
        edges.forEach(e => {
          if (!C[e.a] || !C[e.b] || tieLove(e.a, e.b)) return;
          if (e.cls === 'love') { if (!ok(C[e.a], C[e.b])) note('O1', who(e.a) + '×' + who(e.b) + '＝' + e.name); }
          else if (e.cls === 'night') { if (!okS(C[e.a], C[e.b])) note('O1', who(e.a) + '×' + who(e.b) + '＝' + e.name); }
          else if (e.cls === 'pine') { const d = e.dir != null ? e.dir : e.a, x = d === e.a ? e.b : e.a; if (!one(C[d], C[x])) note('O1', who(d) + '→' + who(x) + '＝' + e.name); }
        });
        /* O2・O3：二人だけの出来事 */
        (res.log || []).forEach(e => {
          if (!e || typeof e.text !== 'string' || !Array.isArray(e.actors) || e.actors.length !== 2) return;
          const a = e.actors[0], b = e.actors[1];
          /* FT の回：恋愛対象「なし」の人が入る組は、歪んだ関係（恋人どうし）でも体の関係の文を見る（切羽詰まった場面の印のない体の関係は O2） */
          if (!C[a] || !C[b] || a === b) return;
          const noneP = FT && (C[a].likes === 'none' || C[b].likes === 'none');
          if (tieLove(a, b) && !noneP) return;
          const t = e.text.replace(NOTSEX, '');
          var mm = t.match(SEX);
          const fm = FORCE_RE.test(e.why || '');
          /* O6：性欲「なし」の人の、合意ありの二人の性的な場面（R18版） */
          if (mm && !SAFE && !fm && !LIB_SKIP[id] && (C[a].libido === 'none' || C[b].libido === 'none')) note('O6', who(a) + '×' + who(b) + ' ｜ ' + (e.tag || e.label || '') + ' ｜「' + mm[0] + '」 ' + t.slice(Math.max(0, mm.index - 50), mm.index + 40) + (WHY ? ' ｜ why: ' + String(e.why || '').slice(0, 80) : ''));
          if (mm && !ok(C[a], C[b]) && fm && forceOn && okS(C[a], C[b])) o.F++;
          else if (mm && !ok(C[a], C[b]) && !fm && okS(C[a], C[b])) o.Fc++;
          else if (mm && !ok(C[a], C[b])) note('O2', who(a) + '×' + who(b) + ' ｜ ' + (e.tag || e.label || '') + ' ｜「' + mm[0] + '」 ' + t.slice(Math.max(0, mm.index - 50), mm.index + 40) + (WHY ? ' ｜ why: ' + String(e.why || '').slice(0, 80) : ''));
          else if (!mm && !tieLove(a, b) && CONF.test(t) && !ROOM_LOVE_COND.test(t) && !one(C[a], C[b]) && !ok(C[a], C[b])) note('O3', who(a) + '→' + who(b) + ' ｜ ' + (e.tag || e.label || '') + ' ｜ ' + e.text.slice(0, 120));
        });
        /* O4：恋愛：なしの家族・無関心・恐怖の二人が、結末の恋愛・夜の関係になった／二人の名前だけが出る性的な文・恋愛の文に出た（出来事の登場人物の数は問わない） */
        if (NL_T) {
          edges.forEach(e => { if (C[e.a] && C[e.b] && (e.cls === 'love' || e.cls === 'night' || e.cls === 'pine') && nlPair(e.a, e.b)) note('O4', '結末 ' + who(e.a) + '×' + who(e.b) + '＝' + e.name); });
          const T4 = (res.log || []).map(e => e && typeof e.text === 'string' ? { t: e.text, tag: e.tag || e.label || '' } : null).filter(Boolean);
          if (res.ending && Array.isArray(res.ending.lines)) res.ending.lines.forEach(l => typeof l === 'string' && T4.push({ t: l, tag: '結末' }));
          T4.forEach(x => x.t.replace(NOTSEX, '').split(/(?<=[。！？\n])/).forEach(sn => {
            const ns = []; C.forEach((c, i) => { if (sn.indexOf(c.name) >= 0) ns.push(i); });
            const bare = sn.replace(/「[^」]*」/g, '「」');
            if (ns.length !== 2 || !nlPair(ns[0], ns[1]) || MOB4.test(sn) || NOT4.test(bare) || !SEX4.test(bare)) return;
            note('O4', who(ns[0]) + '×' + who(ns[1]) + ' ｜ ' + x.tag + ' ｜ ' + sn.slice(0, 140));
          }));
        }
        /* O5：全年齢モード・全年齢版で、性的な文（はっきりした語）が出た */
        if (SAFE) (res.log || []).forEach(e => { if (!e || typeof e.text !== 'string') return; const t5 = e.text.replace(NOTSEX, ''), m5 = t5.match(SAFE5); if (m5) note('O5', (e.tag || e.label || '') + ' ｜「' + m5[0] + '」 ' + t5.slice(Math.max(0, m5.index - 60), m5.index + 40)); });
      }
    });
    return res0;
  }, { N, WHY, ENVSET });
  const tot = { O1: 0, O2: 0, O3: 0, O4: 0, O5: 0, O6: 0 };
  let totF = 0, totFc = 0;
  for (const id in r) { const o = r[id]; totF += o.F; totFc += o.Fc; ['O1', 'O2', 'O3', 'O4', 'O5', 'O6'].forEach(k => { tot[k] += o[k]; }); console.log(id.padEnd(10), 'runs', o.runs, 'err', o.err, 'O1', o.O1, 'O2', o.O2, 'O3', o.O3, 'O4', o.O4, 'O5', o.O5, 'O6', o.O6, 'F非合意', o.F, 'F合意', o.Fc); o.ex.forEach(x => console.log('    ' + x.replace(/\n/g, ' '))); }
  console.log('合計', JSON.stringify(tot), '（F＝恋愛対象「なし」の人が、体の関係の相手の性別に合う相手と体の関係になった数。エラーではない）非合意', totF, '・合意', totFc);
  console.log('pageerr', errors.slice(0, 3));
  await browser.close();
})();
