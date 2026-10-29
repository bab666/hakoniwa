/* 受け攻め・女性どうしの描写の点検
   使い方: node pos-audit.js <ビルドのディレクトリ> [1シナリオあたりの回数=24] [シナリオid,…] [--samples] [--env=lewd:high,style:ero]（設定を固定して回す）
   V1: 女性の住人だけが出てくる性的な場面に、男性の体を前提にした言葉（ちんぽ・射精など）が出た
   V2: 自分で「攻め」を選んだ住人が、受ける側の文（貫かれる・中に出される・押し倒される・縛られる など）になった
   V3: 向きの決まらない組（攻め×攻め・恋愛対象の合わない組）の二人だけの性的な場面が起きた
   V4: 女性の住人が、男性の体で描かれた（「自分のもの」で突く・射精する・相手の中に入る など）
   V1・V4 の例外：オメガバースで、第二性を優先して女性のαの攻めを挿れる側の体で書いた組（HK.Pos.maleTop）の二人が出る文
   V5: 夜の性格（attr.js）が受け攻めを変えた：マゾの人が攻め（{a}）の夜の性格の文を受け持った、自分で攻めを選んだ人が受け（{b}）の夜の性格の文を受け持った。
       奇数回は住人に夜の性格（マゾ・サド・意地悪・甘々・恥じらい、攻め指定の人にもマゾ）を付けて回す（攻め指定のマゾが受ける文は V2 でも数える）
   V6: 女性の住人（ふたなりでない）が、受ける側の体を男性の体で描かれた（相手が男性・モブの場面も含む）：
       「〇〇の亀頭／竿／根元／裏筋／先走り…」「〇〇の硬くなったもの」「〇〇は扱かれ／しごかれ」「〇〇は…射精した／精を吐き出した」など
   V7: 性器なし（genital none）の住人の場面に、挿入・射精・性器の語が出た（none の人が受けなら口まで、攻めなら指と玩具だけ）：
       本文の住人が none の人と相手一人まで（モブ・魔物が相手を含む）なら本文の全部の文、三人以上なら none の人の名前が出る文で、
       男性の体の語（ちんぽ・射精・竿・射精や打ちつける音の擬音 など）・女性器の語（膣・秘所・花芯 など）・挿入の語（挿れ・貫・奥まで・繋がっ・ノット など。
       none の人が攻めで指・玩具・舌の文、none の人が受けで口・喉の文は除く）
   V8: 選んだ性器と食い違う体の語：性器を決めた住人（m・f・mf・none）のうち、男性器のない人に「〇〇の竿／亀頭…」「〇〇は射精した」、
       女性器のない人に「〇〇の膣／秘所／花芯…」「〇〇の濡れた奥」「〇〇は愛液を」が出た（V6 は性器を決めていない女性の住人）
   V10: 体の語の印（lewd-words.js）で、{男性器}・{亀頭} の印なのにその場の住人の誰にも男性器がない／{女性器}・{陰核} なのに誰にも女性器がない
       （印を語にするときに数える。「その場」は出来事の登場人物と本文に名前が出る住人。箱庭が用意した男性のモブ・星の生命体などが相手の文（V1 と同じ除外）、
       住人でない相手（客・魔物・モブなど NPC の語）が出る文は数えない。点検のあいだは印をいつも「直接」の列で語にする（lib.js の lewdMode））
   V11: 自分で「受け」を選んだ住人（相手ごとの指定で見る）が、受けでない住人に挿れる・貫く・中に出す・組み敷く文（受け×受けの組・跨って迎える文は数えない。2026-10-26 追加）
   配役には性器の指定（なし・男性器・女性器・両方）を混ぜる（V1・V4・V6 の「女性」は男性器のない人として見る）
   POSFOR=1：相手ごとの受け攻め（posFor）を、全体の指定と食い違うように付けて回す（攻めの人は次の人に受け、受けの人は次の人に攻め、
     リバの人は二つ先の人に攻め、おまかせの人は回ごとに攻め／受け）。「自分で選んだ指定」は場面の二人について HK.Pos.of(a, b) で見る：
     V2 は、文に出るほかの住人の全員に対して攻め（P.hardTop(T, 相手)。ほかの住人が出なければ全体の指定）の人を数え、V5・V3 も相手ごとの指定で見る
   RANDPOS=1（2026-10-26 担当AW）：回ごとに乱数で、相手ごとの受け攻め（お互いに食い違う指定も）・攻め度・モブ相手の受け攻め・夜の主導・夜の性格（相手に合わせるも）を振る。
     V12: モブ相手の受け攻めを「攻め」にした住人（住人どうしでは攻めでない人）が、住人の名前がほかに出ない文（モブ・魔物・罠が相手）で受ける側の文になった
     V13: 夜の主導の文（pos-lead-r18.js の HK.PosLead.log）の受け持ちが向きと食い違う（主導の文の「受け」が、二人の向き HK.Pos.order で攻めになる・自分で攻めを選んでいる）
     V14: 相手ごとの受け・攻め度で向きが決まる組（HK.Pos.prefer。リバどうしは除く）で、決まった攻めが受ける側の文になった（二人だけが出る文）
   クラスメイトの奇数回（2026-10-28 担当KC）：住人0を担任の先生にして、環境値「先生との恋愛」をあり（隠れて付き合う／公にすることもある）にし、
     住人0と1を関係の設定で恋人にして回す（R18版の先生と生徒の夜 classroom-teacher-love.js の受け攻め・体の語を V1〜V14 で見る）
   --why：数えずに除いた候補とその理由も出す（性的でない文・女性の攻めが男性に跨って迎える文・「攻めに〜された」の書き方 など）
   誤判定を減らすための除外：性的でない言い回し（NONSEX：「上達」「一貫」「旅路の果て」「注がれたお茶」など）は判定の前に消す。
   V2 は文に性的な語（SEXCORE）があるときだけ数え、女性の攻めが男性の相手に跨って自分の中に迎える文（女攻め×男）は数えない。
   V1 は箱庭が用意した男性のモブ（サキュバスの獲物・常識改変の客・マッサージのスタッフ）や星の生命体・壁の向こうの誰かが相手の文を数えない
   （2026-10-29 担当MQ）配役（パス pos。--hot・--ff は opt）と判定（judge pos）を分けて module.exports で出す。audit-all.js が同じ関数を使い、
     ほかのパスの回（R18版）にも V1〜V14 を当てる。使い方・出力は今までどおり */
'use strict';
const core = require('./audit/core.js');

/* ---------- パス pos（ページの中）：opt = { N, only, ff, hot, env, npcbot, posfor, randpos } ---------- */
const PASS = function* (HK, opt) {
  const N = opt.N || 24, only = opt.only || null, FF = !!opt.ff, HOT = !!opt.hot, ENVSET = opt.env || [], NPCBOT = !!opt.npcbot, POSFOR = !!opt.posfor, RANDPOS = !!opt.randpos;
    /* RANDPOS の乱数（箱庭と回ごとに決まる） */
    const rngOf = (str) => { let h = 2166136261; for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); } return () => { h += 0x6D2B79F5; let t = h; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; };
    const NAMES = ['アキラ', 'ミナト', 'ユキノ', 'カオル', 'ハルカ', 'レンジ'];
    /* 配役の型：女性だけ（指定いろいろ）／攻めの指定が多い／攻めどうしを恋人に結ぶ／受け攻めそろい */
    const CASTS = [
      { g: ['f', 'f', 'f', 'f', 'f', 'f'], p: ['', '', '', '', '', ''], l: [], gn: ['', 'none', '', 'm', '', ''] },
      { g: ['f', 'f', 'f', 'f', 'f', 'f'], p: ['top', 'bottom', 'top', 'riba', '', 'bottom'], l: [], gn: ['none', 'none', 'm', '', 'mf', ''] },
      { g: ['m', 'm', 'f', 'm', 'f', 'm'], p: ['top', 'top', 'top', 'bottom', '', ''], l: [], gn: ['none', '', 'm', 'f', '', 'none'] },
      { g: ['m', 'f', 'm', 'f', 'm', 'm'], p: ['top', 'top', 'bottom', 'bottom', 'riba', 'top'], l: ['', 'tb', 'br', '', 'any', ''], gn: ['', 'none', 'none', 'mf', '', 'f'] },
      { g: ['m', 'm', 'm', 'm', 'm', 'm'], p: ['top', 'top', 'bottom', 'bottom', '', 'riba'], l: [], ties: [{ a: 0, b: 1, type: 'lover' }, { a: 2, b: 3, type: 'lover' }], gn: ['', '', 'none', 'f', '', ''] },
      { g: ['f', 'f', 'm', 'f', 'm', 'f'], p: ['top', 'top', 'top', 'bottom', 'bottom', ''], l: [], ties: [{ a: 0, b: 1, type: 'lover' }, { a: 0, b: 3, type: 'fwb' }], gn: ['m', '', '', 'none', 'none', ''] },
      /* 女性が攻め・男性が受けの組 */
      { g: ['f', 'm', 'f', 'm', 'f', 'm'], p: ['top', 'bottom', 'top', '', 'top', 'bottom'], l: [], ties: [{ a: 0, b: 1, type: 'lover' }, { a: 2, b: 3, type: 'fwb' }], gn: ['none', '', 'm', 'none', '', 'f'] },
      { g: ['m', 'f', 'm', 'f', 'm', 'f'], p: ['bottom', 'top', '', 'top', 'bottom', 'top'], l: [], ties: [{ a: 0, b: 1, type: 'lover' }, { a: 4, b: 5, type: 'lover' }], gn: ['none', 'none', '', 'm', 'f', ''] },
      /* 性器なしどうし・性器なしと男性器のみの女性 */
      { g: ['m', 'f', 'f', 'm', 'f', 'm'], p: ['top', 'bottom', 'top', 'bottom', 'riba', ''], l: [], ties: [{ a: 0, b: 1, type: 'lover' }, { a: 2, b: 3, type: 'lover' }], gn: ['none', 'none', 'm', 'none', 'none', 'f'] }
    ];
    /* --ff：女性だけの配役（受け攻めの指定いろいろ・恋人や片想いで結ぶ） */
    const FFC = [
      { g: ['f', 'f', 'f', 'f', 'f', 'f'], p: ['', '', '', '', '', ''], l: [], ties: [{ a: 0, b: 1, type: 'lover' }], gn: ['', 'none', '', '', 'm', ''] },
      { g: ['f', 'f', 'f', 'f', 'f', 'f'], p: ['top', 'bottom', 'top', 'riba', '', 'bottom'], l: [], ties: [{ a: 0, b: 1, type: 'lover' }, { a: 2, b: 3, type: 'fwb' }], gn: ['none', '', 'm', 'none', '', ''] },
      { g: ['f', 'f', 'f', 'f', 'f', 'f'], p: ['riba', 'riba', '', 'top', 'bottom', ''], l: [], ties: [{ a: 0, b: 1, type: 'lover' }, { a: 3, b: 4, type: 'lover' }], gn: ['', '', '', 'mf', 'none', ''] },
      { g: ['f', 'f', 'f', 'f', 'f', 'f'], p: ['bottom', '', 'bottom', '', 'top', 'riba'], l: [], ties: [{ a: 1, b: 0, type: 'crush' }, { a: 4, b: 2, type: 'lover' }], gn: ['', '', '', '', '', ''] },
      { g: ['f', 'f', 'f', 'f', 'f', 'f'], p: ['', 'top', 'riba', 'bottom', '', ''], l: [], ties: [{ a: 0, b: 2, type: 'enemy' }, { a: 1, b: 3, type: 'lover' }], gn: ['none', 'm', '', 'none', '', ''] }
    ];
    if (FF) CASTS.splice(0, CASTS.length, ...FFC);
    const ids = (only || Object.keys(HK.SCENARIOS));
    for (const sc of ids) {
      const scen = HK.SCENARIOS[sc]; if (!scen) continue;
      for (let s = 0; s < N; s++) {
        const cast = CASTS[s % CASTS.length];
        const n = Math.max(scen.minCast || 2, Math.min(scen.maxCast || 6, sc === 'jinro' ? 6 : 2 + (s % 5)));
        const chars0 = [], perChar = [];
        const chars = chars0;
        for (let i = 0; i < n; i++) {
          chars.push({ name: NAMES[i], eg: { CP: (s * 7 + i * 5) % 21, NP: (s * 3 + i * 11) % 21, A: (s * 13 + i * 3) % 21, FC: (s * 5 + i * 7) % 21, AC: (s * 11 + i * 3) % 21 }, memo: '', gender: cast.g[i], likes: '', tone: '', fp: '', pos: cast.p[i], posLike: cast.l[i] || '', color: '', call: '', calls: {}, loveLock: '', posNpc: NPCBOT && (cast.p[i] === 'top' || cast.p[i] === 'riba') ? 'bottom' : '', genital: (cast.gn || [])[i] || '' });
          perChar.push({ action: 'auto', goal: 'auto', stats: {}, weapon: '', pick: {}, role: sc === 'classroom' && s % 2 === 1 && i === 0 ? 'teacher' : '' });
        }
        /* V5：奇数回は夜の性格を付ける（0 番はたいてい攻め指定。攻め指定のマゾも混ぜる）。1 番から 0 番へは相手ごとの指定でサド */
        if (s % 2 && HK.Attr) { const NIGHT = ['maso', 'sadist', 'maso', 'mean', 'sweet', 'shy']; chars.forEach((c, i) => { c.night = NIGHT[(i + (s >> 1)) % NIGHT.length]; }); if (n >= 2) chars[1].nightFor = { 0: 'sadist' }; }
        /* POSFOR：全体の指定と食い違う相手ごとの受け攻め */
        if (POSFOR && n >= 2) chars.forEach((c, i) => {
          const p = c.pos, j = p === 'riba' ? (i + 2) % n : (i + 1) % n;
          if (j === i) return;
          c.posFor = {}; c.posFor[j] = p === 'top' ? 'bottom' : p === 'bottom' ? 'top' : p === 'riba' ? 'top' : ((s + i) % 2 ? 'top' : 'bottom');
        });
        /* RANDPOS：相手ごとの受け攻め・攻め度・モブ相手の受け攻め・夜の主導・夜の性格を乱数で */
        if (RANDPOS) {
          const R = rngOf(sc + '#' + s), pk = a => a[Math.floor(R() * a.length)];
          chars.forEach((c, i) => {
            if (n >= 2 && R() < 0.6) { c.posFor = {}; for (let j = 0; j < n; j++) if (j !== i && R() < 0.35) c.posFor[j] = pk(['top', 'bottom', 'riba']); }
            if (R() < 0.6) c.topLv = pk(['1', '2', '3', '4', '5']);
            c.posNpc = pk(['', 'top', 'bottom', 'riba']);
            c.lead = pk(['', 'top', 'sasoi', 'osoi', 'sasoi', 'osoi']);
            if (R() < 0.5) c.night = pk(['', 'sadist', 'maso', 'mean', 'sweet', 'shy', 'none', 'match', 'match']);
            if (n >= 2 && R() < 0.3) { c.nightFor = {}; c.nightFor[(i + 1) % n] = pk(['sadist', 'maso', 'match', 'sweet']); }
          });
          /* お互いに食い違う相手ごとの指定（攻め×攻め・受け×受け）も混ぜる */
          if (n >= 2 && R() < 0.5) { const v = pk(['top', 'bottom']); chars[0].posFor = Object.assign(chars[0].posFor || {}, { 1: v }); chars[1].posFor = Object.assign(chars[1].posFor || {}, { 0: v }); }
        }
        /* 4回に1回（2026-10-27 担当HG）：恋愛対象「なし」の人（体の関係の相手：おまかせ／男性／女性／男女両方）と、全員の性欲の強さ（ふつう／なし／弱い／強い）を混ぜる。
           恋愛対象「なし」の人も体だけの関係（セフレ・一夜など）にはなるので、その場面でも攻めを選んだ人が受けにならないかを見る */
        if (s % 4 === 3) chars.forEach((c, i) => {
          if ((i + (s >> 2)) % 3 === 0) { c.likes = 'none'; c.sexLikes = ['', 'm', 'f', 'both'][(i + (s >> 2)) % 4]; }
          c.libido = ['', 'none', 'low', 'high'][(i * 3 + (s >> 2)) % 4];
        });
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
        let ties = (cast.ties || []).filter(t => t.a < n && t.b < n);
        /* クラスメイトの奇数回：先生（住人0）との恋愛をありにして、住人0と1を恋人にする */
        if (sc === 'classroom' && s % 2 === 1 && n >= 2) {
          env.tlove = s % 4 === 1 ? 'secret' : 'open';
          ties = ties.filter(t => !((t.a === 0 && t.b === 1) || (t.a === 1 && t.b === 0))).concat([{ a: 0, b: 1, type: 'lover' }]);
        }
        let res;
        /* 内容のスイッチ（content.js）：指定がなければすべて入にして、いちばん広く回す */
        if (HK.Content && env.ct == null) env.ct = HK.Content.TAGS.map(t => t.id).join(',');
        yield { sc, s, input: { scenId: sc, seed: 2000 + s, env, chars: chars0, perChar, ties }, meta: {} };
      }
    }
};

/* ---------- 判定 pos（ページの中）：opt = { why, dump } ---------- */
const JUDGE = function (HK, opt) {
  const WHY = !!opt.why, DUMP = opt.dump || '';
    const P = HK.Pos, MALE = P.MALE_RE;
    const SEX = /抱い|抱かれ|エッチ|繋がっ|イカせ|イかせ|イった|イっ|果て|喘|挿れ|貫|舐め|愛撫|達し|体を重ね|奥まで|突き上げ|腰を(振|沈|打ち|揺)|跨[っが]|中に|犯/;
    const NPC_M = /男|客|獲物|審査員|触手|ゾンビ|魔物|オーク|ゴブリン|スライム|神|村人|教師|先生|店長|上司|略奪者|おじさん|兵|盗賊|医者|マッサージ師|施術師|整体師|司会|AD|カメラマン|監督|悪魔|インキュバス|獣|狼|蛇|蔦|植物|機械|ロボット|看守|看護|患者|社長|部長|課長|主人|旦那|夫|彼氏|王|騎士|勇者|魔王|山賊|漁師|船長/;
    /* 性的でない言い回し（「上達した」「一貫性」「舐めんな」「結果を受け入れた」など）は、性的な語の判定の前に消しておく */
    const NONSEX = /（イった）|（イかなかった）|犯人|犯行|犯罪|防犯|共犯|主犯|(?:拳|腕|手|杖|旗|剣|槍)を(?:突き上げ|天に突き上げ)|(?:匂い|香り)が[^。]{0,10}(?:入ってき|奥まで)|(?:洞窟|森|遺跡|施設|地下|迷宮|神殿)の最奥|(?:ポケット|鞄|カバン|袋|懐|隙間|財布)に(?:ねじ込|突っ込)|(?:ひとかけら|かけら|傷|塩|飴|アイス|スプーン|皿|唇|封)を舐め|杯に[^。]{0,16}注がれ|(?:炎|火)が[^。]{0,12}を舐め|成れの果て|の果て(?=[にのへでまを、。])|果てしな|注がれた(?:お茶|茶|酒|水|コーヒー|紅茶|スープ|グラス|杯)|(?:お茶|茶|酒|水|コーヒー|紅茶|スープ)を注|上達|到達|配達|伝達|達成|発達|通達|熟達|調達|速達|先達|一貫|貫徹|貫通|貫禄|突き止め|突き当た|突き放|突き返|突き出|突き抜け|舐めん[なじ]|舐めた(?:真似|口)|舐めてんの|舐めてる(?:の|だろ)|残っているのは、エッチ[^。]*。?|受け入れ(?:られな|がた|る覚悟|てもらえ)|結果を受け入れ|運命を受け入れ|事実を受け入れ|提案を受け入れ|申し出を受け入れ|(?:記憶|情報|知識|声|映像|光|風|水|空気|お茶|茶|酒|視線|注目|愛情|力|魔力)(?:が|を)?[^。]{0,4}(?:注がれ|流れ込|注ぎ)/g;
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
    const out = { skip, V1: [], V2: [], V3: [], V4: [], V5: [], V6: [], V7: [], V8: [], V10: [], V11: [], V12: [], V13: [], V14: [], n: { V1: 0, V2: 0, V3: 0, V4: 0, V5: 0, V6: 0, V7: 0, V8: 0, V10: 0, V11: 0, V12: 0, V13: 0, V14: 0 }, err: [], runs: 0, bySc: {}, v5n: 0, lead: 0, npcTop: 0, pref: 0 };
    return {
      /* R18版だけ（全年齢モード・全年齢版では回さない） */
      accept() { return !HK.SAFE_ON; },
      begin(run) {
        if (!out.bySc[run.sc]) out.bySc[run.sc] = { V1: 0, V2: 0, V3: 0, V4: 0, V5: 0, V6: 0, V7: 0, V8: 0, V10: 0, V11: 0, V12: 0, V13: 0, V14: 0, runs: 0 };
        if (HK.Attr) HK.Attr.log = [];
        if (HK.PosLead) HK.PosLead.log = [];
        if (HK.LewdWords) HK.LewdWords.V10.length = 0;
      },
      error(run, e) { out.err.push(run.sc + ': ' + String(e && e.stack || e).slice(0, 300)); },
      end(run, res) {
        const sc = run.sc, s = run.s, chars0 = run.input.chars;
        out.runs++; out.bySc[sc].runs++;
        /* V10：体の語の印の持ち主がその場にいない（住人でない相手が出る文は除く） */
        if (HK.LewdWords) HK.LewdWords.V10.forEach(v => {
          const t = clean(v.text);
          if (hasMobM(t) || NPC_M.test(t.replace(new RegExp(v.names.join('|') || '^$', 'g'), ''))) { sk('V10:住人でない相手', sc, t, 0); return; }
          out.n.V10++; out.bySc[sc].V10++; if (out.V10.length < 400) out.V10.push(sc + '#' + s + ' | {' + v.mk + '} その場=' + v.names.join('・') + '(' + v.names.map(nm => { const c = chars0.filter(x => x.name === nm)[0]; return c ? c.gender + (P.genSet(c) ? ':' + P.genSet(c) : '') : '?'; }).join(',') + ') | ' + v.text.slice(0, 300));
        });
        /* 判定用の住人（相手ごとの指定を番号で引けるように。posFor が無ければ chars0 のまま） */
        const PC = P.withIdx ? P.withIdx(chars0) : chars0;
        if (DUMP && DUMP === sc + '#' + s) out.dump = { chars: chars0, texts: (res.log || []).map(e => e && typeof e.text === 'string' ? e.text : '').filter(Boolean) };
        /* V5：夜の性格の文の受け持ち（attr-r18.js の HK.Attr.log） */
        ((HK.Attr && HK.Attr.log) || []).forEach(g => {
          out.v5n++;
          const who = PC.filter(c => c.name === g.who)[0], oth = PC.filter(c => c.name === (g.who === g.a ? g.b : g.a))[0];
          const bad = (g.role === 'a' && g.night === 'maso') || (g.role === 'b' && who && P.hardTop(who, oth)) || g.a === g.b;
          if (bad) { out.n.V5++; out.bySc[sc].V5++; if (out.V5.length < 200) out.V5.push(sc + '#' + s + ' | ' + JSON.stringify(g)); }
        });
        if (HK.Attr) HK.Attr.log = null;
        /* V13：夜の主導の文の受け持ち（{b}＝受けが主導した人。二人の向きで受けであること・自分で攻めを選んでいないこと） */
        ((HK.PosLead && HK.PosLead.log) || []).forEach(g => {
          out.lead++;
          const T = PC.filter(c => c.name === g.a)[0], U = PC.filter(c => c.name === g.b)[0];
          if (!T || !U) return;
          const bad = P.hardTop(U, T) || (P.fixed(T, U) && P.order(T, U, [T, U])[0] !== T) || (g.lead === 'osoi' && !g.hard && P.hardTop(T, U));
          if (bad) { out.n.V13++; out.bySc[sc].V13++; if (out.V13.length < 200) out.V13.push(sc + '#' + s + ' | ' + JSON.stringify(g) + ' | ' + [T, U].map(c => c.name + ':' + P.of(c, c === T ? U : T) + (P.explicit(c, c === T ? U : T) ? '!' : '')).join(' ')); }
        });
        if (HK.PosLead) HK.PosLead.log = null;
        /* V14 の組：相手ごとの受け・攻め度で向きが決まる組（リバどうしは除く） */
        const PREF = [];
        if (P.prefer) for (let i = 0; i < PC.length; i++) for (let j = i + 1; j < PC.length; j++) { const pr = P.prefer(PC[i], PC[j]); if (pr && !P.bothRiba(PC[i], PC[j])) PREF.push(pr); }
        out.pref += PREF.length;
        /* V12 の人：モブ相手を攻めにした住人（住人どうしでは攻めでない） */
        const NTOP = PC.filter(c => P.npc && P.npc(c) === 'top' && !P.hardTop(c));
        out.npcTop += NTOP.length;
        /* 攻めの候補：全体で攻め、または相手ごとに攻めを決めた人（文ごとに、出てくる相手で確かめる） */
        const tops = PC.filter(c => P.hardTop(c) || (P.hasFor && P.hasFor(c) && PC.some(o => o !== c && P.hardTop(c, o))));
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
          const named = PC.filter(c => t.indexOf(c.name) >= 0);
          /* V1：女性どうし */
          /* 指・舌・道具を伴わない挿入の動詞も、女性どうしでは男性の体を前提にした描写として数える */
          const PEN = /奥まで沈め|深く沈め|腰を沈め|腰を落と|繋がっ|繋がり|貫|突い|突き上げ|突かれ|一突き|中に入っ|中へ入っ|入ってき|熱を吐き出|腰を打ちつけ|中で果て|奥で果て|最奥で|自分の中に導|迎え入れ|受け入れ|挿れ|挿入|抜き差し|根元まで|ピストン|穿/;
          const TOOLW = /指|舌|玩具|張り型|張形|ローター|双頭|ディルド|バイブ|器具|道具|触手/;
          const penFF = t.split(/[。！？]/).some(x => PEN.test(x) && !TOOLW.test(x) && SEXCORE.test(x));
          /* 女性の体：男性器のない人（性器を決めていない女性・女性器だけ・なし） */
          const allF = PC.every(c => !P.hasM(c));
          if ((MALE.test(t) || /(?:の|な)モノ(?:が|を|で|に|は|の先)/.test(t) || penFF) && (named.length >= 2 || (allF && named.length >= 1 && SEX.test(t))) && named.every(c => !P.hasM(c)) && !NPC_M.test(t0) && !hasMobM(t0) && !mtIn(t0)) {
            out.n.V1++; out.bySc[sc].V1++;
            const mm = t.match(MALE), ps = t.split(/[。！？]/).filter(x => PEN.test(x) && !TOOLW.test(x) && SEXCORE.test(x))[0];
            if (out.V1.length < 400) out.V1.push(sc + '#' + s + ' | 〔' + (mm ? mm[0] : '') + (ps ? '／' + ps.slice(0, 60) : '') + '〕 ' + t.slice(0, 400));
          }
          /* V2：攻めが受ける側 */
          for (const T of tops) {
            const n0 = T.name;
            /* 文に出るほかの住人の全員に対して攻めか（出なければ全体の指定）。相手ごとに受け・リバを決めた相手がいる文は数えない */
            const oth = PC.filter(c => c !== T && t.indexOf(c.name) >= 0 && c.name.indexOf(n0) < 0);
            if (oth.length ? !oth.every(o => P.hardTop(T, o)) : !P.hardTop(T)) continue;
            /* 「攻めだが、モブには受け」の人が、住人の名前の出ない文（モブ・魔物が相手）で受けるのは正しい */
            /* モブ相手の受け攻めを「受け」「リバ」にした人も同じ（2026-10-26） */
            const npc0 = P.npc ? P.npc(T) : T.posNpc;
            if ((npc0 === 'bottom' || npc0 === 'riba') && (named.length <= 1 || hasMobM(t0) || NPC_M.test(t0))) continue;
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
              /* 「アキラも、レンジに貫かれていたミナトも」：受け身の動詞が、あとに続くほかの住人を修飾している（三人の場面） */
              if (m && k === 0 && PC.some(c => c !== T && c.name.indexOf(n0) < 0 && new RegExp('^(?:て(?:い)?(?:た|る))?' + c.name + '(?:も|は|が)').test(t.slice(m.index + m[0].length)))) { sk('V2:ほかの住人の連体修飾', sc, t, m.index); continue; }
              /* 「アキラの熱がミナトの奥に注がれ」：注がれたのは相手（アキラは注ぐ側。三人の場面の二回目など） */
              if (m && k === 0 && /^の(?:熱|精|もの|モノ|白濁|欲)(?:が|は)[^。「」]{0,16}の(?:奥|中|ナカ|最奥)(?:に|へ)/.test(t.slice(m.index + n0.length))) { sk('V2:攻めの熱が相手の中に', sc, t, m.index); continue; }
              /* 「（相手が）アキラのものを受け入れた」：受け入れたのは相手（アキラは挿れる側） */
              if (m && k === 0 && /受け入れ$/.test(m[0]) && /^の(?:もの|モノ|熱|昂り|屹立|竿|先端|すべて|全部)/.test(t.slice(m.index + n0.length))) { sk('V2:攻めのものを相手が受け入れ', sc, t, m.index); continue; }
              /* 性的な語のない文（「縛られたまま連れ出された」「アキラの中で、点と点が」など）は数えない */
              if (m && (!SEXCORE.test(sentOf(t, m.index) + sentOf(t, Math.min(t.length - 1, m.index + m[0].length))) || /取り残された[^。]{0,12}縛られたまま|祭り囃子が近づ/.test(t))) { sk('V2:非性的', sc, t, m.index); continue; }
              /* 女性の攻めが男性の相手に跨って自分の中に迎える（女攻め×男）のは、攻めのまま。指・舌・道具で中を責められるときだけ数える */
              if (m && k === 1 && P.hasF(T) && !/指|舌|玩具|張り型|ディルド|バイブ|双頭|器具|道具/.test(sentOf(t, m.index))) { sk('V2:女攻めが迎える(' + named.map(c => c.name + c.gender).join(',') + ')', sc, t, m.index); continue; }
              if (m && k === 0 && P.hasF(T) && /受け入れ|跨がられ|跨られ/.test(m[0]) && !/指|舌|玩具|張り型|ディルド|バイブ|双頭/.test(sentOf(t, m.index))) continue;
              if (m) {
                /* 「攻めの名前」の前後に、ほかの人が主語として受けている書き方（例：「アキラはミナトを押し倒した」）は除く */
                const i0 = m.index, seg = t.slice(Math.max(0, i0 - 18), i0 + m[0].length + 10);
                out.n.V2++; out.bySc[sc].V2++; if (out.V2.length < 400) out.V2.push(sc + '#' + s + ' | 攻め=' + n0 + '(' + T.gender + ') | …' + seg + '… || ' + t.slice(0, 260));
                break;
              }
            }
          }
          /* V12（モブ相手を攻めにした人が、住人の名前のほかに出ない文で受けた）・V14（相手ごとの受け・攻め度で決まった攻めが、二人だけの文で受けた） */
          const recvHit = (T) => {
            const n0 = T.name;
            const RX = [
              new RegExp(n0 + '(?:は|が|も|を)?[^。「」]{0,30}?(?:貫かれ|突かれ|突き上げられ|挿れられ|挿入され|犯され|中に出され|注がれ|イかされ|イカされ|責められ|組み敷かれ|押し倒され|縛られ|拘束され|跨がられ|跨られ|抱かれ|穿たれ|嬲られ|弄ばれ|鳴かされ|啼かされ|孕まされ|種付けされ|開発され|ほぐされ|慣らされ|受け入れ)'),
              new RegExp(n0 + 'の(?:中|奥|最奥|中に|奥に|後ろ|後孔|秘部|蕾|入り口|ナカ)(?:へ|に|を|で|まで)'),
              new RegExp('(?:を|に)?' + n0 + '(?:を|の中を|の奥を)(?:貫|犯|突き上げ|押し倒|組み敷|縛|責め|抱いた|抱き潰|穿|嬲|弄|跨|鳴か|啼か|イカせ|イかせ|ほぐ|慣ら|開発)')
            ];
            for (let k = 0; k < RX.length; k++) {
              const m = t.match(RX[k]);
              if (!m) continue;
              if (/隠れ|半分/.test(t.slice(m.index, m.index + m[0].length + 12))) continue;
              if (k === 0 && /^(?:に|から|によ|の手で|を[^。]{0,20}受け入れ)/.test(t.slice(m.index + n0.length))) continue;
              if (k === 0 && /受け入れ$/.test(m[0]) && /^の(?:もの|モノ|熱|昂り|屹立|竿|先端|すべて|全部)/.test(t.slice(m.index + n0.length))) continue;
              if (k === 0 && PC.some(c => c !== T && c.name.indexOf(n0) < 0 && new RegExp('^(?:て(?:い)?(?:た|る))?' + c.name + '(?:も|は|が)').test(t.slice(m.index + m[0].length)))) continue;
              if (!SEXCORE.test(sentOf(t, m.index) + sentOf(t, Math.min(t.length - 1, m.index + m[0].length)))) continue;
              if (k === 1 && P.hasF(T) && !/指|舌|玩具|張り型|ディルド|バイブ|双頭|器具|道具/.test(sentOf(t, m.index))) continue;
              if (k === 0 && P.hasF(T) && /受け入れ|跨がられ|跨られ/.test(m[0]) && !/指|舌|玩具|張り型|ディルド|バイブ|双頭/.test(sentOf(t, m.index))) continue;
              return m;
            }
            return null;
          };
          for (const T of NTOP) {
            if (named.length !== 1 || named[0] !== T) continue;
            const m = recvHit(T);
            if (m) { out.n.V12++; out.bySc[sc].V12++; if (out.V12.length < 200) out.V12.push(sc + '#' + s + ' | モブには攻め=' + T.name + '(' + (T.pos || '-') + T.gender + ') | …' + t.slice(Math.max(0, m.index - 20), m.index + m[0].length + 20).replace(/\n/g, ' ') + '…'); }
          }
          for (const pr of PREF) {
            if (named.length !== 2 || named.indexOf(pr[0]) < 0 || named.indexOf(pr[1]) < 0 || pr[0].name.indexOf(pr[1].name) >= 0 || pr[1].name.indexOf(pr[0].name) >= 0) continue;
            const m = recvHit(pr[0]);
            if (m && !new RegExp('、' + pr[1].name + '(?:は|が)').test(m[0])) { out.n.V14++; out.bySc[sc].V14++; if (out.V14.length < 200) out.V14.push(sc + '#' + s + ' | 決まった攻め=' + pr[0].name + '(' + (pr[0].pos || '-') + pr[0].gender + ' 攻め度' + P.lv(pr[0]) + ') 受け=' + pr[1].name + '(' + (pr[1].pos || '-') + ' 攻め度' + P.lv(pr[1]) + ') | …' + t.slice(Math.max(0, m.index - 20), m.index + m[0].length + 20).replace(/\n/g, ' ') + '…'); }
          }
          /* V4：女性の攻めが、男性の体で描かれた */
          for (const T of PC.filter(c => !P.hasM(c))) {
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
              /* 名前のあとに、ほかの住人が主語で出てくる（「ユキノが逃げようとするたびに、カオルは腰を掴んで…穿った」） */
              if (m && PC.some(c => c !== T && c.name.indexOf(n0) < 0 && new RegExp('、' + c.name + '(?:は|が|も)').test(m[0].slice(n0.length)))) continue;
              /* 名前の直前（同じ文の中）に、ほかの住人が主語で立っている（「カオルはミナトが達しても止まらず…突き上げた」：突くのはカオル） */
              if (m && PC.some(c => c !== T && c.name.indexOf(n0) < 0 && new RegExp(c.name + '(?:は|が|も)[^。「」、]{0,12}$').test(t.slice(Math.max(0, m.index - 30), m.index)))) continue;
              if (m) { const i0 = m.index; out.n.V4++; out.bySc[sc].V4++; if (out.V4.length < 400) out.V4.push(sc + '#' + s + ' | 攻め(女)=' + n0 + ' | …' + t.slice(Math.max(0, i0 - 10), i0 + m[0].length + 10) + '…'); break; }
            }
          }
          /* V11（2026-10-26）：自分で「受け」を選んだ住人が、受けでない住人に挿れる・貫く・中に出す・組み敷く文（相手ごとの指定で見る。受け×受けの組は数えない）。
             跨って自分から迎える文・押し倒して跨る文は受けのまま（女性上位）なので数えない */
          for (const Bt of named) {
            const oth11 = named.filter(c => c !== Bt && c.name.indexOf(Bt.name) < 0 && Bt.name.indexOf(c.name) < 0);
            if (oth11.length !== 1) continue;
            const O11 = oth11[0];
            if (!(P.explicit(Bt, O11) && P.of(Bt, O11) === 'bottom') || (P.explicit(O11, Bt) && P.of(O11, Bt) === 'bottom')) continue;
            const m11 = t.match(new RegExp(Bt.name + '(?:は|が)[^。「」]{0,30}?(?:貫い|挿れ(?!られ)|突き入れ(?!られ)|中に出し|押し倒し(?![^。]{0,12}跨)|組み敷い)'));
            if (!m11 || /^(?:に|から)/.test(t.slice(m11.index + Bt.name.length)) || new RegExp('、' + O11.name + '(?:は|が)').test(m11[0]) || NPC_M.test(m11[0]) || hasMobM(m11[0])) continue;
            out.n.V11 = (out.n.V11 || 0) + 1; out.bySc[sc].V11 = (out.bySc[sc].V11 || 0) + 1;
            if ((out.V11 = out.V11 || []).length < 200) out.V11.push(sc + '#' + s + ' | 受け=' + Bt.name + '(' + Bt.gender + ') 相手=' + O11.name + '(' + (O11.pos || '-') + O11.gender + ') | …' + t.slice(Math.max(0, m11.index - 20), m11.index + m11[0].length + 20).replace(/\n/g, ' ') + '…');
          }
          /* V6：女性の住人（ふたなりでない）の体が、男性の体で描かれた（受ける側の文も、相手が男性の場面も含む） */
          for (const T of PC.filter(c => !P.genSet(c) && !P.hasM(c))) {
            const n0 = T.name;
            if (t.indexOf(n0) < 0 || mtIn(t0, n0)) continue;
            const others = PC.filter(c => c !== T && c.name.indexOf(n0) < 0).map(c => c.name);
            const RX6 = [
              new RegExp(n0 + 'の(?:ちんぽ|ちんこ|おちんちん|ペニス|陰茎|肉棒|男根|亀頭|竿|裏筋|鈴口|カリ|睾丸|玉袋|先走り|勃起|屹立|怒張|剛直|根元(?!まで))'),
              new RegExp(n0 + '(?:の|自身の)[^。、「」]{0,10}?(?:硬く|固く|張りつめ|張り詰め|反り返|勃ち上が|そそり立|脈打)[^。、「」]{0,6}?(?:もの|モノ|竿|熱|昂り)(?:が|を|は|に|の)'),
              new RegExp(n0 + '(?:は|が|も)[^。「」]{0,30}?(?:扱かれ|しごかれ|咥えられ|しゃぶられ|根元を(?:締め|握)られ)'),
              new RegExp(n0 + '(?:は|が|も)[^。「」]{0,30}?(?:射精し|射精する|精を(?:吐き出|放)|精液を(?:吐き出|放|噴き|撒き)|白濁を(?:吐き出|放|噴き|撒き)|吐精|勃起し|勃起さ)')
            ];
            for (const re of RX6) {
              const m = t.match(re);
              if (!m) continue;
              /* 名前のあとで別の人が主語になっている（「アキラは、レンジが射精するまで」）・相手の射精を止める文は除く */
              const seg = m[0].slice(n0.length);
              if (others.some(o => seg.indexOf(o) >= 0) || NPC_M.test(seg) || hasMobM(seg)) { sk('V6:主語が別の人', sc, t, m.index); continue; }
              if (/[、][^、。]{1,20}(?:は|が|も)[^、。]*$/.test(m[0])) { sk('V6:主語が変わる', sc, t, m.index); continue; }
              if (/射精の(?:直前|手前|寸前|間際)|射精を(?:止|管理|許|禁|促|我慢|こらえ)|射精させ/.test(t.slice(m.index, m.index + m[0].length + 8))) continue;
              const i0 = m.index; out.n.V6++; out.bySc[sc].V6++; if (out.V6.length < 400) out.V6.push(sc + '#' + s + ' | 女性=' + n0 + ' | …' + t.slice(Math.max(0, i0 - 30), i0 + m[0].length + 30).replace(/\n/g, ' ') + '…');
              break;
            }
          }
          /* V7：性器なしの住人の場面に、挿入・射精・性器の語 */
          /* 本文が性的な場面か：はっきりした語で見る（「島の奥まで」「釣り竿」のような、ふだんの文は数えない） */
          const PLACE7 = /迎え入れるように[^。]{0,4}(?:両腕|腕)|(?:巣|群れ|社会|輪)で(?:ひとつ|一つ)にな|(?:手|掌|両手|腕|指|毛布|布団|胸)の(?:中|奥)(?:で|に|へ|から)?|腰を振(?:って|りながら)踊|の(?:一つ|ひとつ)に(?:な|数え)|(?:島|森|山|洞窟|洞穴|谷|村|路地|廊下|建物|屋敷|館|店|倉庫|船|艦|基地|通路|坑道|神殿|祠|社|遺跡|迷宮|林|藪|茂み|浜|岩場|棚|引き出し|押し入れ|クローゼット|鞄|カバン|袋|胸|心|記憶|目|瞳|頭)の(?:奥|中)|奥(?:の部屋|の間|の院|座敷|歯|義|様|さん|手|地)|釣り竿|物干し竿|竿竹|ヤドカリ|影が(?:一つ|ひとつ)に|腹に一物|白濁した(?:湯|水|液|霧|空)/g;
          const t7 = t.replace(PLACE7, '＿');
          const SEX7 = /エッチ|イカせ|イかせ|イった|イっちゃ|イっ(?:て|た)|イく|イき|果て(?:た|て|る(?!し)|ない)(?!し)|喘|挿れ|挿入|舐め(?:回|上げ|取|られ|させ)|愛撫|達し(?:た|て|そう)|体を重ね|♡|濡れ(?:た|て)(?:ところ|奥|そこ|中|秘)|とろとろ|蜜が|蜜を|搾り|脈打|ノット|種付け|孕ま|白濁|中に出|咥え|しゃぶ|射精|精液|絶頂|快感|快楽|抱き潰|抱いた|抱かれ|犯され|犯し(?:た|て)|貫かれ|貫い|突き上げられ|跨[っがりる]|腰を(?:振|打ちつけ|打ち付け|沈め|落と|揺ら)|乳首|胸の先|脚のあいだ|脚の間|秘所|膣|ちんぽ|おまんこ|嬌声|甘い声|根元まで|媚薬|扱かれ|扱い(?:た|て)|しごか|勃|硬くなった|熱く張りつめ|昂り|一つにな|ひとつにな|繋がっ|最奥|奥まで(?:突|沈|貫|届|入|埋)|奥を(?:突|抉|擦)|締めつけ|締め付け/;
          if (SEX7.test(t7)) for (const N of PC.filter(c => P.noGen(c))) {
            const n0 = N.name;
            if (t.indexOf(n0) < 0) continue;
            const others = named.filter(c => c !== N && c.name.indexOf(n0) < 0 && n0.indexOf(c.name) < 0), whole = others.length <= 1;
            const V7M = /どぷ|びゅる|びゅく|びゅー|ぱんっ|ばちゅ|どちゅ|ぱちゅ|ずちゅ|竿|裏筋|カリ首|玉袋|おちんちん|吐精|精を(?:吐|放|注)|熱を(?:吐き出|放|注ぎ)|注ぎ込|注がれ|注いだ/;
            const V7F = /膣|まんこ|蜜壺|蜜壷|秘裂|秘所|秘部|陰部|割れ目|子宮|愛液|陰核|クリトリス|花芯|蜜口|秘花|陰唇|潮を(?:噴|吹)|潮が(?:噴|吹)|潮吹/;
            const V7I = /挿れ|挿入|貫|突き入|突き上げ|突き込|腰を(?:打ちつけ|打ち付け|沈め|落と|振|叩きつけ)|繋が[っりる]|抜き差し|ピストン|ノット|結腸|中に出|中出し|奥に(?:出|注|放|吐)|一つにな|ひとつにな|迎え入れ|咥え込|根元まで|最奥|奥まで|奥を(?:突|抉|叩|打|穿)|中を(?:突|抉|穿)|ナカ|穿|(?:奥|中)(?:に|まで|へ)[^。、]{0,6}入っ|全部、?入|打ちつけ|打ち付け|突かれ|一突き|腰を(?:前後|上下)(?:に|させ)|(?:奥|中|ナカ)で(?:果て|弾け|脈打)|(?:中|奥)に[^。、]{0,8}(?:吐き出|放っ|放た|出し|出され)|中が[^。]{0,10}(?:締|搾|痙攣|うね|吸い|絡)|搾り取|形に馴染/;
            /* 台詞行のあとに句点なしで別の人の台詞行が続く（「…」名前「…」）ところも文の切れ目にする（三人の場面の台詞の応酬） */
            const sents = t7.split(/(?<=[。！？\n])|(?<=」)(?=[^「」。、\s]{1,12}「)/);
            /* 名前が出てくるだけの人（性的な文に名前の出ない人）の場面にはしない */
            /* 一人ずつの場面が中心の箱庭（感覚遮断穴・常識改変・催眠・マッサージ・サキュバス・バラエティ）は、名前が出れば本人の場面として見る */
            const SOLO7 = { hole: 1, kaihen: 1, saimin: 1, massage: 1, succubus: 1, variety: 1 };
            if (others.length && !SOLO7[sc] && !sents.some(x => x.indexOf(n0) >= 0 && (SEX7.test(x) || MALE.test(x) || V7F.test(x)))) continue;
            for (const x of sents) {
              if (!whole && x.indexOf(n0) < 0) continue;
              /* 名前がなく、ほかの性器なしの住人の名前が出る文は、その人の場面として数える */
              if (x.indexOf(n0) < 0 && others.some(c => P.noGen(c) && x.indexOf(c.name) >= 0)) continue;
              const inS = others.filter(c => x.indexOf(c.name) >= 0), Q = inS.length === 1 ? inS[0] : whole && others.length === 1 ? others[0] : null;
              const top = Q ? P.order(N, Q, [N, Q])[0] === N : P.hardTopNpc(N);
              let bad = MALE.test(x) || V7M.test(x) || V7F.test(x) || new RegExp(n0 + '(?:の|自身の)(?:もの|モノ)(?:が|を|は(?!な)|で(?!は|す|あ)|に(?!な|し|す))').test(x);
              if (!bad && V7I.test(x)) {
                if (top && /指|玩具|張り型|張形|ディルド|バイブ|ローター|器具|舌/.test(x)) bad = false;
                else if (!top && /口の中|口内|口に|口を|喉|咥え(?!込)|しゃぶ|唇/.test(x) && !/奥まで|最奥|奥を|奥に|根元まで|中に出|繋が|貫/.test(x.replace(/喉の奥|口の奥/g, '＿'))) bad = false;
                else bad = true;
              }
              if (bad) { out.n.V7++; out.bySc[sc].V7++; if (out.V7.length < 400) out.V7.push(sc + '#' + s + ' | なし=' + n0 + (top ? '(攻め)' : '(受け)') + ' | …' + x.slice(0, 160).replace(/\n/g, ' ') + '…'); break; }
            }
          }
          /* V8：選んだ性器と食い違う体の語（性器を決めた住人） */
          for (const T of PC.filter(c => P.genSet(c))) {
            const n0 = T.name;
            if (t.indexOf(n0) < 0) continue;
            const others = PC.filter(c => c !== T && c.name.indexOf(n0) < 0).map(c => c.name);
            const RX = [];
            if (!P.hasM(T)) RX.push(
              new RegExp(n0 + 'の(?:ちんぽ|ちんこ|おちんちん|ペニス|陰茎|肉棒|男根|亀頭|竿|裏筋|鈴口|カリ|睾丸|玉袋|先走り|勃起|屹立|怒張|剛直)'),
              new RegExp(n0 + 'の(?:もの|モノ)(?:が|を|は|で|に)(?!な[っりる]|して|する|では)'),
              new RegExp(n0 + '(?:の|自身の)[^。、「」]{0,10}?(?:硬く|固く|張りつめ|張り詰め|反り返|勃ち上が|そそり立|脈打)[^。、「」]{0,6}?(?:もの|モノ|竿|熱|昂り)(?:が|を|は|に|の)'),
              new RegExp(n0 + '(?:は|が|も)[^。「」]{0,30}?(?:扱かれ|しごかれ|根元を(?:締め|握)られ)'),
              new RegExp(n0 + '(?:は|が|も)[^。「」]{0,30}?(?:射精し|射精する|精を(?:吐き出|放)|精液を(?:吐き出|放|噴き|撒き)|白濁を(?:吐き出|放|噴き|撒き)|吐精|勃起し|勃起さ)'));
            if (!P.hasF(T)) RX.push(
              new RegExp(n0 + 'の(?:膣|まんこ|おまんこ|蜜壺|秘裂|秘所|秘部|割れ目|花芯|陰核|クリ|子宮|陰唇|蜜口)'),
              new RegExp(n0 + '(?:の|自身の)[^。、「」]{0,8}?(?:濡れた奥|濡れそぼ|愛液)'),
              new RegExp(n0 + '(?:は|が|も)[^。「」]{0,16}?(?:愛液を|潮を吹|蜜を溢れ|蜜を垂ら)'));
            for (const re of RX) {
              const m = t.match(re);
              if (!m) continue;
              const seg = m[0].slice(n0.length);
              if (others.some(o => seg.indexOf(o) >= 0) || NPC_M.test(seg) || hasMobM(seg)) continue;
              if (/[、][^、。]{1,20}(?:は|が|も)[^、。]*$/.test(m[0])) continue;
              if (/射精の(?:直前|手前|寸前|間際)|射精を(?:止|管理|許|禁|促|我慢|こらえ)|射精させ/.test(t.slice(m.index, m.index + m[0].length + 8))) continue;
              /* 「アキラのものではない」「アキラのものになった」のような持ち主の言い方 */
              if (/のもの|のモノ/.test(m[0]) && /^(?:では|だ|に(?:な|し|す))/.test(t.slice(m.index + m[0].length - 1))) continue;
              const i0 = m.index; out.n.V8++; out.bySc[sc].V8++; if (out.V8.length < 400) out.V8.push(sc + '#' + s + ' | ' + n0 + '(' + T.gender + '・性器' + P.genSet(T) + ') | …' + t.slice(Math.max(0, i0 - 30), i0 + m[0].length + 30).replace(/\n/g, ' ') + '…');
              break;
            }
          }
          /* V3：向きの決まらない二人だけの性的な場面 */
          const ids2 = [...new Set(ac.filter(x => x != null))];
          if (ids2.length === 2 && SEX.test(t) && SEXCORE.test(t) && /(抱|エッチ|繋が|イ[かっカ]|果て|喘|挿|貫|舐|愛撫|達し|体を重ね)/.test(t)) {
            const a = PC[ids2[0]], b = PC[ids2[1]];
            /* モブ（略奪者・男たち・村人など）が相手の場面に、もう一人の住人が居合わせただけの文は数えない */
            if (a && b && /男たち|略奪者|目出し帽|村人たち|村の男|若い衆/.test(t0)) continue;
            /* 性的な文が「相手」（サキュバスの獲物など、名前のないモブ）とのものだけで、二人が同じ性的な文に出ないときは数えない */
            if (a && b) { const ss = t.split(/(?<=[。！？\n])/).filter(x => SEXCORE.test(x) && (x.indexOf(a.name) >= 0 || x.indexOf(b.name) >= 0)); if (ss.length && !ss.some(x => x.indexOf(a.name) >= 0 && x.indexOf(b.name) >= 0) && ss.every(x => /相手/.test(x))) continue; }
            /* R18が中心の箱庭（HK.State.R18_CORE：常識改変・ダンジョンなど）では「R18に参加しない」は効かない仕様（engine.js の HK.charFlags）。その設定を外した写しで見る（2026-10-29 利用者の判断） */
            const core = HK.State && HK.State.R18_CORE && HK.State.R18_CORE[sc], v3c = c => core && c.noR18 ? Object.assign({}, c, { noR18: false }) : c;
            if (a && b && !P.okSex(v3c(a), v3c(b)) && t.indexOf(a.name) >= 0 && t.indexOf(b.name) >= 0) { out.n.V3++; out.bySc[sc].V3++; if (out.V3.length < 200) out.V3.push(sc + '#' + s + ' | ' + a.name + '(' + (a.pos || '-') + a.gender + ')×' + b.name + '(' + (b.pos || '-') + b.gender + ') | ' + t.slice(0, 300)); }
          }
        }
      },
      finish() { return out; }
    };
};

/* ---------- 出力（今までの形） ---------- */
function print(r, errors, o) {
  const SAMPLES = !!o.samples, WHY = !!o.why;
  if (r.dump) console.log('##### DUMP\n' + JSON.stringify(r.dump.chars.map(c => ({ name: c.name, g: c.gender, pos: c.pos, posFor: c.posFor, posLike: c.posLike, genital: c.genital }))) + '\n' + r.dump.texts.join('\n----\n'));
  console.log('runs', r.runs, 'counts', JSON.stringify(r.n), 'V5で見た夜の性格の文', r.v5n, 'V13で見た主導の文', r.lead, 'V12の人', r.npcTop, 'V14の組', r.pref);
  console.log('by scenario', JSON.stringify(Object.fromEntries(Object.entries(r.bySc).filter(([k, v]) => v.V1 || v.V2 || v.V3 || v.V4 || v.V5 || v.V6 || v.V7 || v.V8 || v.V10 || v.V11 || v.V12 || v.V13 || v.V14))));
  if (r.err.length) console.log('ERRORS', r.err.slice(0, 8));
  if (SAMPLES) for (const k of ['V1', 'V2', 'V3', 'V4', 'V5', 'V6', 'V7', 'V8', 'V10', 'V11', 'V12', 'V13', 'V14']) { console.log('##### ' + k); (r[k] || []).forEach(x => console.log(x)); }
  if (WHY) { console.log('##### 除外したもの'); r.skip.forEach(x => console.log(x.replace(/\n/g, ' '))); }
  console.log('pageerr', errors.slice(0, 5));
}
const KEYS = ['V1', 'V2', 'V3', 'V4', 'V5', 'V6', 'V7', 'V8', 'V10', 'V11', 'V12', 'V13', 'V14'];
function summarize(r) {
  const items = {}, ex = {};
  KEYS.forEach(k => { items[k] = (r.n && r.n[k]) || 0; ex[k] = (r[k] || []).slice(0, 3); });
  return { items, ex, info: { 回: r.runs, 夜の性格の文: r.v5n, 主導の文: r.lead }, err: r.err.length, errEx: r.err.slice(0, 3) };
}
const LABEL = { V1: '女性どうしに男性の体の語', V2: '攻めを選んだ人が受ける文', V3: '向きの決まらない二人の性的な場面', V4: '女性の攻めが男性の体', V5: '夜の性格の文の受け持ちが逆', V6: '女性の体が男性の体で描かれた', V7: '性器なしの人に挿入・性器の語', V8: '選んだ性器と食い違う体の語', V10: '体の語の印の持ち主がその場にいない', V11: '受けを選んだ人が挿れる文', V12: 'モブには攻めの人が受ける文', V13: '夜の主導の文の受け持ちが逆', V14: '相手ごとの受け攻めで決まった攻めが受ける文' };
module.exports = { passes: { pos: PASS }, judges: { pos: JUDGE }, print, summarize, LABEL, KEYS };

if (require.main === module) (async () => {

  const dir = process.argv[2], N = +process.argv[3] || 24, only = process.argv[4] && !/^--/.test(process.argv[4]) ? process.argv[4].split(',') : null;
  const ENVSET = ((process.argv.find(a => /^--env=/.test(a)) || '').slice(6)).split(',').filter(Boolean).map(x => x.split(':'));
  const RANDPOS = !!process.env.RANDPOS;
  const NPCBOT = !!process.env.NPCBOT, POSFOR = !!process.env.POSFOR, DUMP = process.env.DUMP || '', SAMPLES = process.argv.includes('--samples'), WHY = process.argv.includes('--why'), FF = process.argv.includes('--ff'), HOT = process.argv.includes('--hot');
  const t = await core.runTool({ dir, hash: '', lewdMode: 'direct', mod: module.exports, pass: 'pos', judge: 'pos', opt: { N, only, ff: FF, hot: HOT, env: ENVSET, npcbot: NPCBOT, posfor: POSFOR, randpos: RANDPOS, why: WHY, dump: DUMP } });
  print(t.r, t.errors, { samples: SAMPLES, why: WHY });
})();
