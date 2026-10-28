/* 住人の状態の点検：死んだ人・監禁中の人・場を離れた人が出来事に出てこないか、「R18に参加しない」人や
   「恋愛・R18にしない相手」の組が性的な場面に出てこないか、性行為の相手を「固定した相手だけ」にした人がモブと性的な場面にならないかを数える
   使い方: node state-audit.js <ビルドのディレクトリ> [1シナリオあたりの回数=24] [r18|safe|''] [シナリオid,…] [--why] [--hot]
   S1: 死んだ人（死の記録が出たあと）が、死・場面転換以外の出来事に出た
   S2: 監禁中の人が、執着の出来事（cageOk）以外の出来事に出た（記録に残ったもの。手前で止めた分は「止めた」に数える）
   S3: 場を離れた人（脱出・行方不明・連れ去り）が、出来事に出た（主役でも相手でも）
   S4: 「R18に参加しない」人が、性的な文に名前つきで出た
   S5: 「恋愛・R18にしない相手」の二人が、同じ性的な文に出た
   S6: 性行為の相手を「固定した相手だけ」にした人（sexLock が番号で sexLockMob なし。配役の lo）が、住人でない相手との性的な文に出た。
       配役の lo は3回に1回「固定した相手＋モブ」（sexLockMob）にして、その回は数えない（モブとの場面はしてよい）。
       箱庭の仕掛けそのものが相手の箱庭（エロトラップダンジョン・サキュバスの一夜・エロバラエティ：MOB_FREE）は数えない
       S4・S6 の人には、回ごとに「モブ相手の受け攻め」（受け・リバ・攻め・住人と同じ）を付ける（モブには受けの設定が、R18に参加しない・固定した相手だけを越えないか）
   S7: 一つの場面（一つの記録）の中で、同じ文が二度出た（R18の文の重複）
   S8: 内容のスイッチで切った出来事（tags）が出た
   S9: 吹雪の館で、助手が自分の探偵ではない探偵を「先生」と呼んだ（探偵2人以上の回）
   S10: 一回の遊びの中で、同じ性的な文が3つ以上の記録に出た（R18の文の被り。目安として見る）
   S12: 同一人物（attr.js の same）の二人に「恋愛・R18にしない相手」を付けたのに、恋愛の記録・性的な文に二人だけで出た
        （奇数回は配役に同一人物の組を足す。同一人物だけでは恋愛・体の関係を縛らないので、4回に1回は互いに「恋愛・R18にしない相手」も付けて、その回だけ数える）
   S11: 最期の言葉（epilogue.js）の名前の取り違え：「〇〇が最期に遺した言葉」の〇〇が、その記録で亡くなった人（死の記録の主役・物語型は記録の登場人物で、亡くなった人）でない／
        言葉の中で自分の名前に呼びかけている／住人の最期の言葉（lastWords）・結末の最期の言葉（E.last）が、本人の名前で始まらない
   S13: 複数の恋人「なし」の回で、同じ人が同じ段階に二人以上と恋人（pf.couple）になっていた（区切りごとと回の終わりに ctx.pf を走査。
        関係の設定ではじめから恋人を二人にした組だけのときは数えない。生きている恋人だけ）。--env=poly:any などで設定を変えて回せる
   S14: 一途（住人の設定 faithful）の人が、恋人がいる間に、恋人でない人と恋愛の出来事・夜（pf.night・pf.nights が増えた）に出た
   S15: 恋愛相手を固定（loveLock）した人が、固定した相手以外と恋人（pf.couple／物語型の恋人の記録 S.lovers・S.rom・関係図の恋の線）・
        恋愛の出来事（二人だけの romance・物語型は告白・恋・想いの札）・夜（pf.night・pf.nights が増えた／二人の名前が出る性的な文）に出た。
        配役の一部（5回に2回）で、二人を互いに固定する（4人の回と6人の回）
   S16: 複数の恋人「なし」の回で、同じ人が、別れの記録（恋人の記録から消える・pf.couple が偽になる）なしに、別の相手と二度「恋人になった」
        （エンジン型は区切りごとの pf.couple の変化、物語型は S.lovers・S.rom・関係の恋人の増え方と、理由に「：恋人になった」とある記録）。相手が亡くなったあとは数えない。
        物語型は、恋人の札の記録（「恋人の夜」「恋人どうしの〜」）が、その時点の恋人の記録にない二人に出たものも数える（複数の恋人の設定によらず）
   S17: 恋愛相手を固定（loveLock）し、性行為の相手の固定が「誰とでも可」（sexLock 'any'）の人が、固定外の相手と恋愛の出来事（cat:'romance' で、体の関係の出来事の印 sex がないもの）に
        主役（記録の一人目か二人目）として出た（エンジン型）。配役の一部（5回に1回）で、二人を互いに固定し、そのうち一人を「誰とでも可」にする。
        体の関係の出来事（sex の印つき）は出てよい（それが「誰とでも可」の意味）ので、件数だけ「誰とでも可の体の出来事」として数える。
        この回では S15 の「恋愛の出来事」「性的な文」も見るが、「誰とでも可」で許されている組（HK.lockSexOnly）の体の出来事・性的な文は数えない
   S18: 「誰とでも可」の人と固定外の相手の「体だけの場面」（free-sex.js の HK.FreeSex.mark：エンジン型は pf.freeSex、物語型は S.freeSex）のあとに、
        その組が恋人になった（エンジン型は pf.couple、物語型は恋人の記録 S.lovers・S.rom・関係の恋人）／その組に恋愛の出来事が出た
        （エンジン型は cat:'romance' で体の出来事の印 sex がないもの、物語型は告白・恋・想い・デート・口づけ・キスの札）。S17 と同じ配役の回で見る
   S19: 無関心（a→b）：a から b への好意・惹かれが区切りごとの記録（history）で動いた／結果の値が記録と違う／二人が恋人・夜・恋愛の出来事・性的な文・関係図の恋の線になった／
        a が b との助け合い（cat:'help' の主役）・嫉妬や心配（理由書き）の出来事に入った／HK.canLove・HK.Pos.okSex が通った
   S20: 恐怖（a が b を恐れる）：二人が恋人・夜・恋愛の出来事・性的な文・関係図の恋の線（物語型は恋愛・夜の札、恋人の記録）になった／HK.canLove（両方向）・HK.Pos.okSex が通った
   S21: 許嫁：破談（pf.fiBroken）のあとに恋人（pf.couple）・恋愛の出来事が出た／恋愛対象・受け攻めの合わない許嫁が恋人と同じ扱いになった
   S22: グループの「仲間」（画面）：オンのグループの住人どうしに関係「仲間」が付かない／オフ・別のグループの組に付いた／ほかの関係が消えた／JSON にオン・オフが入らない／古い JSON が読めない
   S25〜S30（2026-10-26、死んだ・消えた人の再登場。記録ごとに、書く直前の住人の状態を写して文で見る。ふつうの回と、死のある箱庭を
       不死・吸血鬼・同一人物・執着・愛憎・発狂しやすい気質・展開と死ネタの重さ「重い」で回す追加の回（N/2、4 回以上）で数える）
   S25: 死んだ人（同じ区切りの中の死も含む）が、記録の文で主語（〇〇は／が／も）・話し手（〇〇「・seg の who）・性的な文として出た
        （弔い・回想・遺体・遺品・名前を呼ぶ・仮定・「〇〇の分まで」・関係節・夢・幻・ゾンビ化・成り代わり・事件と推理の札などは除外の辞書 DZ で外す）
   S26: 死んだ人が、出来事の主役（actors の一人目）になった／文に名前の出ない登場人物として残った（弔い・事件などの札は除く）
   S27: 遺体の残らない死（穴・塵・呑み込まれた・引きずり込まれた・沈んだ など。engine.js の HK.State.noBody）の人に、亡骸・遺体・抱きしめる・手を握る文が出た
   S28: 亡くなった人が、蘇り・治療・ループ・正気に戻る などの記録なしに、生きている状態に戻った
   S29: 結末・行く末・その後・結末の文で、亡くなった人が生きている扱い（生還・恋人として暮らす など）／生きている人が亡くなった扱い。
        主な関係で、亡くなった人の組の恋人・友人に（死別）がない
   S30: 場を離れた人（脱出・行方不明・連れ去り）・閉じ込められた人（物語型の縛られた人・囚われ、監禁）が、主役・話し手として出た（脱出・救出・監禁の札は除く）
   S31（2026-10-28 担当JE）: 避けている人が自分から迫った。記録の出来事で、迫る側（actors の一人目）が相手（二人目）を避けている（HK.Avoid.of：苦手・避けている／
        片想いの想われる側の「苦手」／執着される側の「怖がっている・嫌っている」／支配される側の「怯えている・逃げ出したい」／恐怖／無関心／嫌悪と回避型の気質）。
        迫る出来事：エンジン型は恋愛（cat:'romance'）・体の関係の印（sex）・執着の行動（ob_act）、物語型は迫る札（告白・誘い・口づけ・夜這い・押し倒す・監禁 など。APPROACH_TAG）と、
        住人二人だけの性的な場面の記録（lewd）。ふつうの回と、追加の「避けている関係」の配役（ACASTS）で NA 回（N/2、4 回以上）ずつ回して数える（その回の S1〜S18 も数える）。
        「参考」の s31 に、箱庭・札ごとの件数を出す
   S32（2026-10-28 担当KA）: 蘇る人（特殊役職の不死・体の特徴の不死・吸血鬼。蘇らない吸血鬼 spNoRev・行方不明 spGone は除く。HK.Special.canRevive）の
        最期の言葉（遺言）が、記録の文（「〇〇が最期に遺した言葉」）・住人の lastWords・結末の箇条書き・結末の「最期の言葉」（E.last）に出た。
        蘇る人は遺言を残さず、蘇ったときの一言（special.js の SP.reviveLine）を残す。判定は回の終わりの住人（物語型 S.P・エンジン型 ctx.chars）で見る
   S19〜S21 は、ふつうの回（N 回）のあとに、追加の関係を使う配役（FCASTS）で NF 回（N/2、4 回以上）ずつ回して数える（その回の S1〜S18 も数える）。
   「参考」には、恐怖で避けた・無関心で受け流した・破談・仲間の出来事の数を出す
   「止めた」：出来事の記録の手前（Ctx.say の防波堤）で捨てられた件数。出所を直すと減る（0 でなくてよい）
   W1: 箱庭の場所に合わない語（PLACE_NG）が記録の地の文に出た。媚薬ロッカー：狭い箱の中に「席・皿・周りが（割って入る人）」は出ない
       （2026-10-26 順83。hate-kit.js・hate-love.js の狭い場所の文 hkSpace: 'cramped'）。合計と箱庭ごとの数は最後の「W1」の行 */
'use strict';
const { openBuild } = require('./lib.js');
(async () => {
  const args = process.argv.slice(2).filter(a => !/^--/.test(a));
  const dir = args[0], N = +args[1] || 24, mode = args[2] || '', only = args[3] ? args[3].split(',') : null;
  const WHY = process.argv.includes('--why'), HOT = process.argv.includes('--hot');
  const { browser, page, errors } = await openBuild(dir, mode, { lewdMode: 'direct' });
  const ENVSET = ((process.argv.find(a => /^--env=/.test(a)) || '').slice(6)).split(',').filter(Boolean).map(x => x.split(':'));
  const r = await page.evaluate(({ N, only, WHY, HOT, mode, ENVSET }) => {
    const SEXCORE = /抱き潰|エッチ|イカせ|イかせ|イった|イっ|果て|喘|挿れ|挿入|舐め|愛撫|達し|体を重ね|腰を(?:振|沈|打ち|揺|落と|突き|使)|跨[っがりるら]|犯|根元|締めつけ|締め付け|射精|ナカ|♡|昂り|濡れ|蜜|奥を|奥に|奥まで|一つにな|ひとつにな|繋がっ|繋がり|繋がる|呑み込|搾り|搾精|脈打|ノット|種付け|孕|精を|白濁|注が|中に出/;
    const NONSEX = /(?:石|壁|祠|床|地面|木の幹|根)[^。]{0,24}脈打|不老の蜜|酸素を孕む白石|金の蜜の小壺|金色のとろりとした蜜|蜜がわずかな量|(?:根元|地面|土|床下|墓)を[^。]{0,6}掘|芋を[^。]{0,8}掘|根元に生えた|(?:荷物|袋|箱|リュック|ポケット|引き出し)の(?:最)?奥|(?:泥|砂|波|水|沼|流れ)[^。]{0,12}呑み込|眼窩の奥|傷を舐め|蜜の湖|(?:手袋|服|上着|靴)が[^。]{0,8}濡れ|濡れた岩|濡れた砂|窓の奥|荒れ果て|(?:渦|波|闇|海|霧|炎)に呑ま|呑み込んで、海|歌がひとつに|本殿の奥|(?:杯|盃|グラス)に[^。]{0,12}注が|蜜蝋|大地が[^。]{0,6}脈打|根元に手|樹皮の奥|ひとかけらを舐め|唇を舐めて我慢|蜂蜜|蜜で煮|ずぶ濡れ|根元(?:から|で)|石碑の根元|首を締め|喉が締めつけ|胸が締めつけ|神殿の奥|廃屋の奥|歯磨き粉[^。]*舐め|濡れた肩|濡れた(?:羽|翼)|濡れた(?:ユキノ|アキラ|ミナト|カオル|ハルカ|レンジ)|綱は、生き物のように脈打|影が一つ|残っているのは[^。]*|(?:洞窟|ロッカー|蔵|櫓|石舞台|森|島|部屋|棚|引き出し|鞄|物置|倉庫|屋敷|館|廊下|路地|喉|胸|心|目|瞳)の(?:最)?奥|最奥を前|濡れ(?:タオル|ていた|た(?:服|シャツ|髪|地面|床|手|頬|瞳|目|体|まま|葉))|(?:酒|お茶|水)が注が|犯人|犯行|防犯|犯罪|共犯|ほかに：[^\n]*|上達|到達|配達|伝達|達成|発達|通達|熟達|調達|速達|先達|の果て(?=[にのへでまを、。])|果てしな|舐めん[なじ]|舐めた(?:真似|口)|(?:洞窟|森|遺跡|施設|地下|迷宮|神殿)の最奥|涙に濡れ|雨に濡れ|濡れた(?:髪|服|地面|床|手|頬|瞳|目)|血に濡れ|注がれた(?:お茶|茶|酒|水|コーヒー|紅茶|スープ|グラス|杯)|(?:視線|注目|愛情|光|魔力)が注が|びしょ濡れ/g;
    const MOB = /男たち|男が|客|触手|ゾンビ|魔物|オーク|ゴブリン|スライム|村人|略奪者|おじさん|兵士|盗賊|マッサージ師|施術師|整体師|司会|カメラマン|監督|インキュバス|獣|看守|見知らぬ|誰とも知れない|壁の向こう|向こう側の誰か|モブ|生命体|異星|神(?:は|が|の手|に)|邪神/;
    const sents = t => String(t).replace(NONSEX, '＿').split(/[。！？\n」]/);
    const isSex = s => SEXCORE.test(s);
    const out = { n: {}, ex: {}, drop: {}, runs: 0, err: [], bySc: {}, anySex: {} };
    const KEYS = ['S1', 'S2', 'S3', 'S4', 'S5', 'S6', 'S7', 'S8', 'S9', 'S10', 'S11', 'S12', 'S13', 'S14', 'S15', 'S16', 'S17', 'S18', 'S19', 'S20', 'S21', 'S22', 'S25', 'S26', 'S27', 'S28', 'S29', 'S30', 'S31', 'S32'];
    out.info = {};
    /* S31：避けている人が自分から迫った（2026-10-28 担当JE）。迫る札（物語型）と、迫らない札（断る・逃げる・助ける など） */
    const APPROACH_TAG = /告白|口づけ|キス|夜這い|誘|迫|押し倒|監禁|独占|一夜|セフレ|デート|求愛|口説|抱|愛撫|奉仕|夜|催眠|媚薬|襲|執着|甘え|膝枕|添い寝|手を(?:繋|握)|恋|想い|両想い/;
    const APPROACH_NO = /失恋|恋敵|元恋人|夜明け|夜番|夜警|見張り|一夜明け|無音の夜|断|拒|逃|避け|庇|救|看病|弔|回想|噂|目撃|覗|嫉妬|監禁から|解放|襲撃/;
    /* 迫られた側の反応の記録（執着の物語型 obsess-story.js：actors が［執着される側, 執着する側］で、理由が「〇〇の気持ち（…）」） */
    const REACT_WHY = /^[^。／]{1,16}の気持ち（(?:気づいていない|怖がっている|嫌っている|困惑している|受け入れている|共依存)）/;
    out.s31 = {}; out.stuck = {};
    /* 参考：避けている人が攻めに固定されていて、HK.Pos.order が向きを入れ替えられなかった呼び出し元（avoid-kit.js の AV.onStuck。場面になったかは問わない） */
    if (HK.Avoid) HK.Avoid.onStuck = () => { if (!cur) return; const st = String(new Error().stack || '').split('\n').slice(3, 6).map(l => { const m = l.match(/at (?:(\S+) \()?.*?\/js\/(?:c\/)?([\w-]+)[^/]*?\.js:(\d+)/); return m ? (m[1] || '?') + '@' + m[2] + ':' + m[3] : ''; }).filter(Boolean).join(' < '); const k = cur.sc + ' ' + st; out.stuck[k] = (out.stuck[k] || 0) + 1; };
    const avoidHit = (x, acs, o, label) => {
      if (!HK.Avoid || !cur || acs.length < 2) return;
      const a = acs[0], b = acs[1];
      if (!a || !b || a === b || a.i === b.i || !HK.Avoid.of(x, a, b)) return;
      const k = cur.sc + ' ' + label; out.s31[k] = (out.s31[k] || 0) + 1;
      hit('S31', a.name + '→' + b.name + '（' + HK.Avoid.why(x, a, b) + '） [' + label + '] | ' + String(o.text || '').slice(0, 120));
    };
    /* S19〜S21 の共通部品：追加の関係（無関心・恐怖・許嫁）の組 */
    const tkey = (i, j) => Math.min(i, j) + '-' + Math.max(i, j);
    const nlOf = (ties, i, j) => (ties || []).filter(t => (t.type === 'apathy' || t.type === 'fear') && ((t.a === i && t.b === j) || (t.a === j && t.b === i)))[0] || null;
    const nlKey = t => t.type === 'apathy' ? 'S19' : 'S20';
    const nlTxt = (C, t) => (C[t.a] || {}).name + '→' + (C[t.b] || {}).name + '：' + (t.type === 'apathy' ? '無関心' : '恐怖');
    /* 区切りごと（エンジン型）：無関心・恐怖の組が恋人・夜になっていないか／破談のあとに恋人になっていないか */
    const feelStep = (ctx, end) => {
      if (!cur || !cur.feel || !ctx || !ctx.pf) return;
      const C = ctx.chars, seen = ctx._auditFeel || (ctx._auditFeel = {});
      cur.feel.forEach(t => {
        const pf = ctx.pf[tkey(t.a, t.b)]; if (!pf || !C[t.a] || !C[t.b]) return;
        if (t.type === 'apathy' || t.type === 'fear') {
          const n0 = (pf.nights || 0) + (pf.night ? 1 : 0);
          if (pf.couple && !seen['c' + tkey(t.a, t.b)]) { seen['c' + tkey(t.a, t.b)] = 1; hit(nlKey(t), '恋人 ' + nlTxt(C, t) + (end ? '（終わり）' : '')); }
          if (n0 > (seen['n' + tkey(t.a, t.b)] || 0)) hit(nlKey(t), '夜 ' + nlTxt(C, t));
          seen['n' + tkey(t.a, t.b)] = n0;
        }
        if (t.type === 'fiance' && pf.fiBroken != null && pf.couple && !seen['f' + tkey(t.a, t.b)]) { seen['f' + tkey(t.a, t.b)] = 1; hit('S21', '破談のあとに恋人 ' + C[t.a].name + '×' + C[t.b].name); }
      });
    };
    KEYS.forEach(k => { out.n[k] = 0; out.ex[k] = []; });
    /* W1：箱庭の場所に合わない語（箱庭の id → 正規表現。台詞の中は見ない） */
    out.n.W1 = 0; out.ex.W1 = [];
    const PLACE_NG = { locker: /席|皿|周りが/ };
    let cur = null, lastCtx = null;
    const hit = (k, msg) => { out.n[k]++; out.bySc[cur.sc][k] = (out.bySc[cur.sc][k] || 0) + 1; if (out.ex[k].length < (WHY ? 40 : 6)) out.ex[k].push(cur.sc + (cur.feel ? '（追加の関係の配役）' : cur.avd ? '（避けている配役）' : '') + ' | ' + msg); };
    /* S13・S14：恋人の数と一途（区切りごとと回の終わりに ctx.pf を走査） */
    const pkey = (x, y) => Math.min(x.i, y.i) + '-' + Math.max(x.i, y.i);
    const loversOf = (ctx, x) => ctx.chars.filter(y => y !== x && y.alive !== false && ctx.pf[pkey(x, y)] && ctx.pf[pkey(x, y)].couple);
    const polyCheck = (ctx, end) => {
      if (!cur || cur.story || !ctx || !ctx.pf || !ctx.chars) return;
      const C = ctx.chars, pmode = (ctx.env && ctx.env.poly) || 'none';
      if (!ctx._auditPre) { ctx._auditPre = {}; Object.keys(ctx.pf).forEach(k => { if (ctx.pf[k].couple) ctx._auditPre[k] = 1; }); }
      C.forEach(x => {
        if (x.alive === false) return;
        const L = loversOf(ctx, x);
        if (pmode === 'none' && L.length >= 2 && L.some(y => !ctx._auditPre[pkey(x, y)])) hit('S13', (end ? '終わり' : '段階' + ctx.stepIndex) + ' ' + x.name + '→' + L.map(y => y.name).join('・'));
      });
      const pn = ctx._auditNight || (ctx._auditNight = {}), lv = ctx._auditLov || {};
      Object.keys(ctx.pf).forEach(k => {
        const pf = ctx.pf[k], n = (pf.nights || 0) + (pf.night ? 1 : 0), ij = k.split('-').map(Number);
        if (pn[k] != null && n > pn[k]) [[ij[0], ij[1]], [ij[1], ij[0]]].forEach(fo => { const f = C[fo[0]]; if (f && f.faithful && lv[f.i] && lv[f.i].length && lv[f.i].indexOf(fo[1]) < 0) hit('S14', '夜 ' + f.name + '×' + C[fo[1]].name + '（恋人：' + lv[f.i].map(i => C[i].name).join('・') + '）'); });
        pn[k] = n;
      });
      ctx._auditLov = {}; C.forEach(x => { ctx._auditLov[x.i] = loversOf(ctx, x).map(y => y.i); });
      /* S15：固定した相手以外と恋人・夜（体の関係は許されている組 HK.lockSexOnly の夜は除く） */
      const seen15 = ctx._audit15 || (ctx._audit15 = {});
      Object.keys(ctx.pf).forEach(k => {
        const pf = ctx.pf[k], ij = k.split('-').map(Number), A = C[ij[0]], B = C[ij[1]];
        if (!A || !B || !lockBad(A, B)) return;
        if (pf.couple && !seen15['c' + k]) { seen15['c' + k] = 1; hit('S15', '恋人 ' + A.name + '×' + B.name + '（固定：' + lockTxt(C, A, B) + '）'); }
        const n = (pf.nights || 0) + (pf.night ? 1 : 0);
        if (n > (seen15['n' + k] || 0) && !(HK.lockSexOnly && HK.lockSexOnly(A, B))) hit('S15', '夜 ' + A.name + '×' + B.name + '（固定：' + lockTxt(C, A, B) + '）');
        seen15['n' + k] = n;
      });
      /* S16：区切りのあいだに新しく恋人になった組の二人に、前から続いている別の恋人がいる（複数の恋人「なし」） */
      const nowC = {}; Object.keys(ctx.pf).forEach(k => { if (ctx.pf[k].couple) nowC[k] = 1; });
      const preC = ctx._audit16;
      if (preC && pmode === 'none') Object.keys(nowC).forEach(k => {
        if (preC[k]) return;
        k.split('-').map(Number).forEach(x => {
          const old = Object.keys(nowC).filter(k2 => k2 !== k && preC[k2] && k2.split('-').map(Number).indexOf(x) >= 0).map(k2 => k2.split('-').map(Number).filter(y => y !== x)[0]).filter(y => C[y] && C[y].alive !== false);
          if (old.length) hit('S16', (end ? '終わり' : '段階' + ctx.stepIndex) + ' ' + C[x].name + '：' + old.map(y => C[y].name).join('・') + 'と別れないまま、' + C[k.split('-').map(Number).filter(y => y !== x)[0]].name + 'と恋人に');
        });
      });
      ctx._audit16 = nowC;
    };
    /* S15・S16 の共通部品：固定の食い違い（どちらかが相手以外に固定している） */
    /* 固定は複数人を持てる（住人の locks。なければ lock 一つ。engine.js の HK.locks と同じ読み方） */
    const lks = x => Array.isArray(x.locks) ? x.locks : x.lock != null ? [x.lock] : [];
    /* 配役の設定の loveLock（番号・番号の文字列・その並び・''）を番号の並びに */
    const cfgL = v => (Array.isArray(v) ? v : v === '' || v == null ? [] : [v]).map(Number).filter(x => !isNaN(x));
    const lockBad = (a, b) => !!(a && b && a !== b && ((lks(a).length && lks(a).indexOf(b.i) < 0) || (lks(b).length && lks(b).indexOf(a.i) < 0)));
    /* 「誰とでも可」で体の関係が許されている組（engine.js の HK.lockSexOnly を、配役の設定から見る）：どちらの側も「誰とでも可」か、固定なし・相手に固定 */
    /* 性行為の相手を番号で固定した側（「固定した相手だけ」「固定した相手＋モブ」）は、恋愛相手の固定ではなく性行為の相手の並びで見る（engine.js の sexOne と同じ） */
    const sxL = x => { if (x.sx === 'any' || x.sx === '' || x.sx == null) return null; const L = cfgL(x.sx); return L.length ? L : null; };
    const anyOk = (a, b) => [[a, b], [b, a]].every(p => p[0].sx === 'any' || (sxL(p[0]) ? sxL(p[0]).indexOf(p[1].i) >= 0 : (!lks(p[0]).length || lks(p[0]).indexOf(p[1].i) >= 0)));
    const lockTxt = (C, a, b) => [a, b].filter(x => lks(x).length).map(x => x.name + '→' + lks(x).map(k => (C[k] || {}).name || '不在').join('・')).join('／');
    /* 物語型の恋人の記録：S.lovers（組の配列）があればそれ、なければ恋仲（S.rom）と関係の恋人（S.ties） */
    const storyLov = S => {
      const o = {}, add = (i, j) => { if (i == null || j == null || i === j) return; o[Math.min(i, j) + '-' + Math.max(i, j)] = 1; };
      if (Array.isArray(S.lovers)) S.lovers.forEach(pr => add(pr[0], pr[1]));
      else {
        if (S.rom) Object.keys(S.rom).forEach(k => { if (S.rom[k]) { const ij = k.split('-').map(Number); add(ij[0], ij[1]); } });
        (S.ties || []).forEach(t => { if (/^(lover|mate|fated)$/.test(t.type)) add(t.a, t.b); });
      }
      return o;
    };
    let lastS = null;
    const storyCheck = (S, end) => {
      if (!cur || !cur.story || !S || !S.P) return;
      lastS = S;
      const now = storyLov(S), pre = S._auditLovS, P = S.P;
      if (!pre) { S._auditLovS = now; Object.keys(now).forEach(k => { const ij = k.split('-').map(Number); if (lockBad(P[ij[0]], P[ij[1]])) hit('S15', '関係の恋人 ' + P[ij[0]].name + '×' + P[ij[1]].name); }); return; }
      Object.keys(now).forEach(k => {
        if (pre[k]) return;
        const ij = k.split('-').map(Number), A = P[ij[0]], B = P[ij[1]];
        if (lockBad(A, B)) hit('S15', '恋人の記録 ' + A.name + '×' + B.name + '（固定：' + lockTxt(P, A, B) + '）');
        if ((S.poly || 'none') !== 'none') return;
        ij.forEach(x => {
          const old = Object.keys(now).filter(k2 => k2 !== k && pre[k2] && k2.split('-').map(Number).indexOf(x) >= 0).map(k2 => k2.split('-').map(Number).filter(y => y !== x)[0]).filter(y => P[y] && P[y].alive !== false);
          if (old.length) hit('S16', (end ? '終わり' : S.label || '') + ' ' + P[x].name + '：' + old.map(y => P[y].name).join('・') + 'と別れないまま、' + P[ij[0] === x ? ij[1] : ij[0]].name + 'と恋人に');
        });
      });
      S._auditLovS = now;
    };
    /* 不在・遺体・後日談を描く文（その人がいないこと自体を書いている）は数えない */
    const EXEMPT = /部屋を出た|席が[^。]{0,6}空いて|見つかった|遺体|亡骸|死んでいた|それからも|その後|あれから|外では|一週間後|数日後|後日|夜明け|半年後|か月後|年後|外から見れば|部屋を出たあと|プリントを届け/;
    const SKIPK = /^(?:step|phase|death|end|ending|summary)$/;
    /* 出来事の記録を包む：エンジン型（Ctx.say）と物語型（HK.Story.say） */
    const Ctx = HK.Ctx;
    if (Ctx && !Ctx.prototype.say._audit) {
      const say0 = Ctx.prototype.say;
      Ctx.prototype.say = function (o) {
        const kind = o.kind || 'phase';
        const acs = (o.actors || []).filter(c => c && c.i != null);
        const st = this.stepIndex;
        const snap = acs.map((c, k) => ({ c, lead: k === 0, dead: !c.alive && c._auditDeathLogged && c.diedAt != null && c.diedAt < st, caged: c.flags && c.flags.caged != null, out: !!c.out && c._auditOutStep != null && c._auditOutStep < st }));
        /* 場に戻った人（クラスメイトの不登校から戻った人など。c.out が偽に戻る）は、離れた区切りの覚えを消す（あとでまた離れたとき、その離れる出来事を数えないため） */
        if (kind === 'step') this.chars.forEach(c => { if (c.out && c._auditOutStep == null) c._auditOutStep = st; else if (!c.out) c._auditOutStep = null; });
        const over = this.chars.every(c => !c.alive || c.out);
        if (kind === 'step' && cur && !cur.story) { lastCtx = this; polyCheck(this, false); feelStep(this, false); }
        const e = say0.call(this, o);
        /* S31（エンジン型）：恋愛・体の関係・執着の行動の出来事の主役が、相手を避けている */
        if (cur && !cur.story && e && !e.skipped && !SKIPK.test(kind) && acs.length >= 2) {
          const evid = (this._ev && this._ev.id) || '', sx = o.sex != null ? !!o.sex : !!(this._ev && this._ev.sex);
          if (o.cat === 'romance' || sx || /^ob_act/.test(evid)) avoidHit(this, acs, o, (o.cat || '') + (sx ? '+sex' : '') + ':' + (evid || kind));
        }
        /* S19・S20・S21（エンジン型）：無関心・恐怖の二人の恋愛の出来事／無関心な人の助け合い・嫉妬・心配／破談のあとの恋愛の出来事 */
        if (cur && cur.feel && !cur.story && e && !e.skipped && !SKIPK.test(kind) && acs.length >= 2) {
          const x = acs[0], y = acs[1], nl = nlOf(cur.feel, x.i, y.i);
          if (o.cat === 'romance' && nl) hit(nlKey(nl), '恋愛 ' + nlTxt(this.chars, nl) + ' | ' + String(o.text).slice(0, 120));
          cur.feel.forEach(t => {
            if (t.type !== 'apathy' || acs[0].i !== t.a || !acs.some(c => c.i === t.b)) return;
            if (o.cat === 'help' || /嫉妬|心配/.test(String(o.why || ''))) hit('S19', '無関心な' + this.chars[t.a].name + 'が' + this.chars[t.b].name + 'との' + (o.cat === 'help' ? '助け合い' : '嫉妬・心配') + 'に [' + ((this._ev && this._ev.id) || '') + '] | ' + String(o.text).slice(0, 100));
          });
          const fi = cur.feel.filter(t => t.type === 'fiance' && tkey(t.a, t.b) === tkey(x.i, y.i))[0];
          if (fi && o.cat === 'romance' && this.pf[tkey(x.i, y.i)] && this.pf[tkey(x.i, y.i)].fiBroken != null && !/破談/.test(String(o.why || ''))) hit('S21', '破談のあとの恋愛 ' + x.name + '×' + y.name + ' | ' + String(o.text).slice(0, 100));
        }
        if (cur && !cur.story && e && !e.skipped && o.cat === 'romance' && !SKIPK.test(kind)) acs.forEach(f => {
          if (!f.faithful || !this.pf) return;
          const L = loversOf(this, f);
          if (L.length && acs.some(y => y !== f && L.indexOf(y) < 0)) hit('S14', '恋愛 ' + f.name + '（恋人：' + L.map(y => y.name).join('・') + '）| ' + String(o.text).slice(0, 120));
        });
        /* 体の関係の出来事の印（engine.js の sexEv と同じ：渡された印、なければいま起きている出来事 ctx._ev の印） */
        const sexMark = o.sex != null ? !!o.sex : !!(this._ev && this._ev.sex);
        const anyPair = acs.length >= 2 && HK.lockSexOnly && HK.lockSexOnly(acs[0], acs[1]);
        /* S17：「誰とでも可」の人が、固定外の相手と恋愛の出来事（体の出来事の印なし）に出た／体の出来事は件数だけ数える */
        if (cur && !cur.story && e && !e.skipped && o.cat === 'romance' && !SKIPK.test(kind) && anyPair) {
          if (sexMark) out.anySex[cur.sc] = (out.anySex[cur.sc] || 0) + 1;
          else hit('S17', '恋愛 ' + acs[0].name + '×' + acs[1].name + '（固定：' + lockTxt(this.chars, acs[0], acs[1]) + '・性行為の相手：誰とでも可）[' + ((this._ev && this._ev.id) || '') + '] | ' + String(o.text).slice(0, 120));
        }
        /* S18：体だけの場面（pf.freeSex）のあとに、その組が恋人になった／恋愛の出来事（体の出来事の印なし）が出た */
        if (cur && !cur.story && this.pf) {
          const fz = this._audit18 || (this._audit18 = {});
          Object.keys(this.pf).forEach(k => {
            const pf = this.pf[k];
            if (pf.freeSex && !fz[k]) fz[k] = 1;
            if (fz[k] === 1 && pf.couple) { fz[k] = 2; const ij = k.split('-').map(Number); hit('S18', '恋人化 ' + this.chars[ij[0]].name + '×' + this.chars[ij[1]].name + ' [' + ((this._ev && this._ev.id) || o.kind || '') + ']'); }
          });
          if (e && !e.skipped && o.cat === 'romance' && !sexMark && !SKIPK.test(kind) && acs.length >= 2 && fz[pkey(acs[0], acs[1])]) hit('S18', '恋愛 ' + acs[0].name + '×' + acs[1].name + ' [' + ((this._ev && this._ev.id) || '') + '] | ' + String(o.text).slice(0, 120));
        }
        /* S15：二人だけの恋愛の出来事に、固定が食い違う組（「誰とでも可」で許されている組の体の出来事は除く） */
        if (cur && !cur.story && e && !e.skipped && o.cat === 'romance' && !SKIPK.test(kind) && acs.length === 2 && lockBad(acs[0], acs[1]) && !(anyPair && sexMark)) hit('S15', '恋愛 ' + acs[0].name + '×' + acs[1].name + '（固定：' + lockTxt(this.chars, acs[0], acs[1]) + '）| ' + String(o.text).slice(0, 120));
        if (cur && !cur.story) {
          if (e && e.skipped) { const why = o.cat === 'romance' ? 'romance' : 'caged'; out.drop[why] = (out.drop[why] || 0) + 1; }
          else if (e && !SKIPK.test(kind) && !over && !/^(?:phase|grief|mourn|death|memory|end|ending)$/.test(o.cat || '')) {
            snap.forEach(s => {
              /* ゾンビになった住人（fate＝ゾンビ化）は、死んだあとも襲ってくる側として出てよい */
              if (s.dead && s.lead && s.c.fate !== 'ゾンビ化' && !EXEMPT.test(String(o.text))) hit('S1', s.c.name + ' [' + (o.cat || '') + '/' + kind + '] ' + String(o.text).slice(0, 160));
              if (s.caged && !o.cageOk) hit('S2', s.c.name + ' [' + (o.cat || '') + '] ' + String(o.text).slice(0, 160));
              if (s.out && !EXEMPT.test(String(o.text))) hit('S3', s.c.name + ' [' + (o.cat || '') + '/' + kind + '] ' + String(o.text).slice(0, 160));
            });
          }
          if (kind === 'death' && acs[0]) acs[0]._auditDeathLogged = true;
          if (e && !e.skipped && o.tags && cur.offTags) o.tags.forEach(t => { if (cur.offTags[t]) hit('S8', t + ' | ' + String(o.text).slice(0, 160)); });
        }
        return e;
      };
      Ctx.prototype.say._audit = true;
    }
    const ST = HK.Story;
    if (ST && ST.say && !ST.say._audit) {
      const ss0 = ST.say;
      ST.say = function (S, o) {
        const kind = o.kind || 'event';
        const P = S && S.P;
        const acs = (o.actors || []).map(p => typeof p === 'number' ? (P && P[p]) : p).filter(p => p && p.i != null);
        const snap = acs.map((p, k) => ({ p, lead: k === 0, dead: p.alive === false && p._auditDeadStep, out: !!(p.out || p.gone || p.taken) && p._auditOutStep }));
        const e = ss0.call(this, S, o);
        /* S31（物語型）：迫る札の記録・住人二人だけの性的な場面の記録で、一人目が二人目を避けている */
        if (cur && cur.story && S && acs.length >= 2 && !SKIPK.test(kind)) {
          const tg = String(o.tag || '');
          if (!REACT_WHY.test(String(o.why || '')) && ((APPROACH_TAG.test(tg) && !APPROACH_NO.test(tg)) || (e && e.lewd && acs.length === 2 && !APPROACH_NO.test(tg)))) avoidHit(S, acs, o, (tg || kind) + (e && e.lewd ? '+lewd' : ''));
        }
        /* S19・S20（物語型）：無関心・恐怖の二人だけの、恋愛・夜の札の記録 */
        if (cur && cur.feel && cur.story && acs.length === 2 && /告白|恋|想い|デート|口づけ|キス|両想い|夜/.test(o.tag || '') && !/失恋|恋敵|元恋人|夜明け|夜番|夜警|見張り|一夜明け|無音の夜/.test(o.tag || '')) { const nl = nlOf(cur.feel, acs[0].i, acs[1].i); if (nl) hit(nlKey(nl), '物語型 [' + o.tag + '] ' + nlTxt(S.P, nl) + ' | ' + String(o.text).slice(0, 100)); }
        /* S15・S16（物語型）：恋人の記録の増え方と、二人だけの恋愛の札の記録 */
        if (cur && cur.story) {
          /* S16（物語型）：恋人の札の記録（恋人の夜など）が、恋人の記録にない二人に出た／「恋人になった」の記録が、別の恋人がいる人に出た（複数の恋人「なし」） */
          if (S && S.P && acs.length === 2) {
            const lv = storyLov(S), k2 = Math.min(acs[0].i, acs[1].i) + '-' + Math.max(acs[0].i, acs[1].i);
            if (/恋人の夜|恋人どうし/.test(o.tag || '') && !lv[k2]) hit('S16', '恋人でない二人に [' + o.tag + '] ' + acs[0].name + '×' + acs[1].name + ' | ' + String(o.text).slice(0, 100));
            const pre = S._auditLovS || {};
            if (/：恋人になった/.test(o.why || '') && (S.poly || 'none') === 'none') acs.forEach(x => { const y = x === acs[0] ? acs[1] : acs[0]; const old = Object.keys(lv).filter(k3 => k3 !== k2 && pre[k3] && k3.split('-').map(Number).indexOf(x.i) >= 0).map(k3 => S.P[k3.split('-').map(Number).filter(z => z !== x.i)[0]]).filter(z => z && z.alive !== false); if (old.length) hit('S16', '「恋人になった」 ' + x.name + '：' + old.map(z => z.name).join('・') + 'と別れないまま' + y.name + 'と'); });
          }
          storyCheck(S, false);
          /* S18（物語型）：体だけの場面（S.freeSex）のあとに、その組が恋人の記録に入った／恋愛の札の記録が出た */
          if (S && S.freeSex && S.P) {
            const lv18 = storyLov(S), fz = S._audit18 || (S._audit18 = {});
            Object.keys(S.freeSex).forEach(k => { if (lv18[k] && !fz[k]) { fz[k] = 1; const ij = k.split('-').map(Number); hit('S18', '恋人の記録 ' + S.P[ij[0]].name + '×' + S.P[ij[1]].name + ' [' + (o.tag || '') + ']'); } });
            if (acs.length >= 2 && S.freeSex[Math.min(acs[0].i, acs[1].i) + '-' + Math.max(acs[0].i, acs[1].i)] && /告白|恋|想い|デート|口づけ|キス|両想い/.test(o.tag || '') && !/失恋|恋敵|元恋人/.test(o.tag || '')) hit('S18', '恋愛 [' + o.tag + '] ' + acs[0].name + '×' + acs[1].name + ' | ' + String(o.text).slice(0, 120));
          }
          if (acs.length === 2 && /告白|恋|想い|デート|口づけ|キス|両想い/.test(o.tag || '') && !/失恋|恋敵|元恋人/.test(o.tag || '') && lockBad(acs[0], acs[1])) hit('S15', '恋愛 [' + o.tag + '] ' + acs[0].name + '×' + acs[1].name + '（固定：' + lockTxt(P, acs[0], acs[1]) + '）| ' + String(o.text).slice(0, 120));
        }
        const over = P && P.every(p => !p || p.alive === false || p.out || p.gone);
        if (cur && cur.story && !SKIPK.test(kind) && !over && kind !== 'climax' && !/結末|全滅|死|最期|蘇生|復活|発見|遺体|喪失|追悼|弔い|回想|その後|脱出|救出|帰還|生還|行方不明|処刑|襲撃|生贄|事件|継承|霊媒|勝利|敗北|騙され|人質|囚われ|形見|遺言|真相|推理|後日|夜明け|雪の中|おかっぱの子|成り代わり/.test(o.tag || '')) {
          snap.forEach(s => {
            if (s.dead && s.lead && !EXEMPT.test(String(o.text))) hit('S1', s.p.name + ' [' + (o.tag || '') + '/' + kind + '] ' + String(o.text).slice(0, 160));
            if (s.out && !EXEMPT.test(String(o.text))) hit('S3', s.p.name + ' [' + (o.tag || '') + '/' + kind + '] ' + String(o.text).slice(0, 160));
          });
          if (o.tags && cur.offTags) o.tags.forEach(t => { if (cur.offTags[t]) hit('S8', t + ' | ' + String(o.text).slice(0, 160)); });
        }
        /* 死・不在に気づいた次の記録から数える（死や離脱を告げる記録そのものは数えない） */
        /* 区切り（step）の時点で死んでいた・離れていた人だけを数える（同じ区切りの中で死んだ・離れた人の記録は数えない） */
        /* 生き返った人（蘇生・回復薬など）は、次の区切りを待たずに「死んでいた人」から外す */
        if (P) P.forEach(p => { if (p && p.alive !== false) p._auditDeadStep = false; });
        if (P && kind === 'step') P.forEach(p => { if (p && p.alive === false) p._auditDeadStep = true; else if (p) p._auditDeadStep = false; if (p && (p.out || p.gone || p.taken)) p._auditOutStep = true; else if (p) p._auditOutStep = false; });
        return e;
      };
      ST.say._audit = true;
    }
    /* ---------- S25〜S30：死んだ・消えた人が「生きている扱い」で出る（文レベル。2026-10-26） ----------
       記録ごとに、その記録を書く直前の住人の状態（死・不在・閉じ込め・ゾンビ化）を写しておき、記録の文で見る。
       死：エンジン型は死の記録（kind 'death'）が出たあと（死の記録より前に二つ以上の記録が出たときも）、物語型は死んだ状態で一つ記録が出たあと。
       同じ区切りの中の死も数える（S1 は前の区切りの死だけ）。除外の辞書（DZ）：弔い・回想・遺体・遺品・名前を呼ぶ・「〇〇の分まで」・夢・幻・
       ゾンビ化した人・成り代わり・事件と推理の札・人狼の終わったあとの感想戦 など */
    let dz = null;
    const DZ = {
      /* 正当に亡くなった人に触れる札・理由（弔い・事件・推理・ゾンビ化など） */
      TAG: /弔|追悼|回想|遺体|墓|形見|遺品|蘇生|復活|最期|発見|結末|その後|喪|悲しみ|悼|ループ|夢|幻|霊|遺言|死|全滅|殉|犠牲|葬|埋葬|供養|祈り|後日|継承|処刑|襲撃|生贄|真相|推理|事件|捜査|検死|告発|裁判|投票|遺留|手紙|再会|帰還|生還|救出|解放|ゾンビ|噛|咬|感染|転化|隠滅|偽装|工作|手がかり|取り調べ|証言|占い|CO|成り代わり|違和感|おかっぱの子|予言|grief|mourn|memory|death/,
      WHY: /弔|悼|悲しみ|喪|死|遺体|最期|ゾンビ|蘇|復活|ループ|失った|亡くし|形見|遺品|成り代わ/,
      /* 文の除外：亡くなったことそのもの・弔い・回想・遺体・名前を呼ぶ・仮定・関係節 */
      SENT: /答えなかった|答えない|返事|途切れ|うめき|いた頃|知らない|逝|越えられ|最後に言った|身に起き|置き手紙|置いては帰れ|だったもの|死|亡|遺体|亡骸|遺品|形見|墓|弔|供養|冥福|祈|分まで|分も|思い出|面影|生前|かつて|あの(?:時|とき|日|夜|頃)|幻|夢|幽霊|霊|声が聞こえ|名を|名前|呼ん|呼び|叫|最期|遺言|遺し|残した|手紙|日記|書き置き|写真|記憶|覚えて|いない|いなくな|戻らない|戻ってこな|帰らない|帰ってこな|失っ|喪|悼|仇|殺|犠牲|骨|灰|塵|消え|ゾンビ|噛|咬|感染|蘇|甦|生き返|目を開け|起き上が|息を吹き返|冷た|動かな|横たわ|助けられなかった|守れなかった|いたら|いれば|だったら|生きて|代わりに|言っていた|言ってた|口癖|教えてくれた|くれた|だった|ていた|はずの|はずだった|穴|落ち|呑|攫|連れ去|血|倒れ|息|脈|胸に|抱え|運|埋|焼|燃|葬|棺|花を|手を合わせ|涙|泣|嗚咽|ループ|巻き戻|やり直|時間が戻|戻った|戻って|帰って|帰還|再会|会えた|見つけ|見つか|助け出|救出|解放|逃げ出|抜け出/,
      SPK: /幻|夢|声が聞こえ|記憶|思い出|生前|遺言|最期|手紙|録音|書き置き|日記|かつて|あの(?:時|とき|日)|言っていた|言ってた|口癖|霊|幽霊|ループ|蘇|生き返|起き上が|目を開け|ていた|ていました/,
      SEX: /抱き潰|エッチ|イカせ|イかせ|イった|喘|挿れ|挿入|愛撫|体を重ね|腰を(?:振|沈|打ち|揺|落と|突き|使)|犯し|射精|ナカ|♡|昂り|奥を突|一つにな|ひとつにな|繋がっ|搾精|ノット|種付け|孕|精を|白濁|中に出/,
      /* 遺体に触れる文（遺体の残らない死の人に出たら S27） */
      BODY: n => new RegExp(n + '(?:を(?:抱きしめ|抱き寄せ|抱きかかえ|抱き上げ|揺さぶ|揺す|背負)|の(?:体|亡骸|遺体|手|頬|肩|髪|顔|胸|頭|冷たい)(?:を|に)(?:抱|握|撫|触|拭|揺)|を抱いて|の亡骸|の遺体)'),
      /* 生き返りの記録（蘇生・治療・ループ・正気に戻る・助け出された） */
      REV: /周目|蘇|甦|生き返|息を吹き返|目を開け|起き上が|立ち上が|意識|復活|ループ|巻き戻|やり直|時間が戻|治療|回復|戻ってき|元に戻|人間に戻|正気|無事|生きて|助け出|救出|解放|揺り起こ|息が戻|指が動/,
      /* 不在・閉じ込めの人に触れてよい札（脱出・救出・監禁の場面・後日談 など）と文 */
      OUTTAG: /封印|発狂|推理|工作|真相|告発|全滅|脱出|帰還|生還|救出|解放|再会|戻|行方|連れ去|攫|監禁|執着|逃走|檻|囚|その後|後日|結末|手紙|夢|回想|夜明け|朝|時の彼方|予言|おかっぱの子|偽装|escape/,
      OUTTXT: /電話|無線|通信|手紙|声が|メッセージ|夢|幻|記憶|思い出|扉の向こう|壁の向こう|扉の前|敷居|扉に手|背中に向かって|プリントを届け|病院のベッド/,
      LIVE_FATE: /生還|生存|脱出|無事|救助|帰還|生き延び|生き残/,
      DEAD_FATE: /死亡|殺され|死んだ|喰われ|命を落と|息絶|絶命|処刑|殉|犠牲/,
      /* 人狼：ゲームが終わったあとの感想戦（亡くなったのはゲームの中だけ） */
      JINRO_END: /勝利|敗北|感想|打ち上げ|罰ゲーム|景品|ご褒美|結果|騙され|種明かし/
    };
    const dzSent = (t, pos) => { let a = pos, b = pos; while (a > 0 && !/[。！？\n]/.test(t[a - 1])) a--; while (b < t.length && !/[。！？\n]/.test(t[b])) b++; return t.slice(a, b + 1); };
    const dzQ = (t, pos) => { let d = 0; for (let k = 0; k < pos; k++) { if (t[k] === '「' || t[k] === '『') d++; else if ((t[k] === '」' || t[k] === '』') && d > 0) d--; } return d > 0; };
    /* 関係節（「〇〇が拾った貝殻」「〇〇が刻んだ印」）の主語は、生きている扱いではない */
    const dzRel = (n, s) => new RegExp(n + '(?:が|の)[^。、「」]{0,14}?(?:た|だ)[一-龥ぁ-んァ-ヶー]{1,4}(?:に|を|は|が|の|へ|で|と)').test(s);
    if (Ctx && !Ctx.prototype.say._dz) {
      const sayD = Ctx.prototype.say;
      Ctx.prototype.say = function (o) {
        if (!dz) return sayD.call(this, o);
        dz.engine = this;
        const pre = this.chars.map(c => ({ d: c.alive === false && (c._dzDL || (c._dzDC || 0) >= 2), z: c.fate === 'ゾンビ化', o: !!c.out && !!c._dzOS, c: !!(c.flags && c.flags.caged != null) && !!c._dzCS }));
        const n0 = this.log.length;
        const e = sayD.call(this, o);
        if (e && !e.skipped && this.log.length > n0) dz.snap[e.n] = pre;
        const n = e && !e.skipped ? e.n : -1;
        this.chars.forEach(c => {
          if (c.alive === false) { c._dzDC = (c._dzDC || 0) + 1; if (o.kind === 'death' && o.actors && o.actors[0] === c && !c._dzDL) { c._dzDL = true; dz.deaths.push({ i: c.i, n, nobody: HK.State && HK.State.noBody ? HK.State.noBody(c) : false }); } }
          else if (c._dzDL || (c._dzDC || 0) >= 2) { dz.rev.push({ i: c.i, n, text: String(o.text || '') + String(o.why || '') + String(o.tag || '') }); c._dzDL = false; c._dzDC = 0; }
          else c._dzDC = 0;
          c._dzOS = !!c.out; c._dzCS = !!(c.flags && c.flags.caged != null);
        });
        return e;
      };
      Ctx.prototype.say._dz = true;
    }
    if (ST && ST.say && !ST.say._dz) {
      const ssD = ST.say;
      ST.say = function (S, o) {
        if (!dz || !S || !S.P) return ssD.call(this, S, o);
        dz.S = S;
        const P = S.P, lk = S.scen && S.scen.id === 'locker';
        const pre = P.map(p => ({ d: !!p && p.alive === false && !p.captive && (p._dzDC || 0) >= 1, z: false, o: !!p && !!(p.out || p.gone || p.taken) && p.alive !== false && !!p._dzOS, c: !!p && !!((p.bound && !lk) || p.captive) && p.alive !== false && !!p._dzCS }));
        const n0 = S.log.length;
        const e = ssD.call(this, S, o);
        if (S.log.length > n0) dz.snap[S.log[S.log.length - 1].n] = pre;
        const n = S.log.length - 1;
        P.forEach(p => {
          if (!p) return;
          if (p.alive === false && !p.captive) { if (!p._dzDC) dz.deaths.push({ i: p.i, n, nobody: !!p.noBody }); p._dzDC = (p._dzDC || 0) + 1; }
          else if (p._dzDC) { dz.rev.push({ i: p.i, n, text: String(o.text || '') + String(o.why || '') + String(o.tag || '') }); p._dzDC = 0; }
          p._dzOS = !!(p.out || p.gone || p.taken); p._dzCS = !!((p.bound && !lk) || p.captive);
        });
        return e;
      };
      ST.say._dz = true;
    }
    function dzCheck(res, chars, sc) {
      const log = res.log || [], nm = chars.map(c => c.name), D0 = {};
      dz.deaths.forEach(d => { if (!D0[d.i] || D0[d.i].revN != null) D0[d.i] = { n: d.n, nobody: d.nobody }; });
      /* S28：生き返りの記録（蘇生・治療・ループ など）がないまま、亡くなった人が生きている状態に戻った */
      dz.rev.forEach(v => {
        const from = (D0[v.i] && D0[v.i].n) || 0;
        const seg = log.slice(Math.max(0, from), v.n + 1).filter(e => e && ((e.actors || []).indexOf(v.i) >= 0 || (typeof e.text === 'string' && e.text.indexOf(nm[v.i]) >= 0)));
        if (!DZ.REV.test(v.text) && !seg.some(e => DZ.REV.test(String(e.text) + String(e.why || '') + String(e.tag || '')))) hit('S28', nm[v.i] + ' 記録' + v.n + 'で生き返った（死の記録 ' + from + '） | ' + v.text.slice(0, 100));
        if (D0[v.i]) D0[v.i].revN = v.n;
      });
      log.forEach((e, idx) => {
        if (!e || typeof e.text !== 'string') return;
        const pre = dz.snap[e.n != null ? e.n : idx];
        if (!pre) return;
        const kind = e.kind || '', tag = String(e.tag || e.cat || ''), why = String(e.why || ''), t = e.text, A = e.actors || [];
        if (/^(?:step|death|end|ending|summary)$/.test(kind)) return;
        if (sc === 'jinro' && DZ.JINRO_END.test(tag)) return;
        const mournE = DZ.TAG.test(tag) || DZ.TAG.test(kind) || DZ.WHY.test(why);
        const seg = Array.isArray(e.seg) ? e.seg : [];
        pre.forEach((st, i) => {
          if (!st || !nm[i]) return;
          const name = nm[i];
          if (st.d && !st.z) {
            /* S26：登場人物（主役、または文に名前の出ない人） */
            if (A.indexOf(i) >= 0 && !mournE && kind !== 'phase' && e.cat !== 'phase') {
              const pos0 = t.indexOf(name);
              if (pos0 < 0 ? !DZ.SENT.test(t) : (A[0] === i && !DZ.SENT.test(dzSent(t, pos0)))) hit('S26', name + ' [' + tag + '/' + kind + '] ' + (A[0] === i ? '主役' : '名前の出ない相手') + ' | ' + t.slice(0, 140));
            }
            let pos = -1, spk = false;
            while ((pos = t.indexOf(name, pos + 1)) >= 0) {
              const after = t.slice(pos + name.length, pos + name.length + 14), s = dzSent(t, pos), inQ = dzQ(t, pos), ex = DZ.SENT.test(s) || dzRel(name, s);
              if (/^(?:（[^）]{0,12}）)?「/.test(after) && !inQ) { spk = true; if (!DZ.SPK.test(s) && !mournE) hit('S25', '話し手 ' + name + ' [' + tag + '] | ' + s.slice(0, 140)); }
              else if (!inQ && /^(?:は|が|も)/.test(after) && !/^(?:は|が|も)(?:もう|既に|すでに|死|亡|息|冷た|動かな|帰らな|戻らな|いな)/.test(after) && !ex && !mournE) hit('S25', '主語 ' + name + ' [' + tag + '/' + kind + '] | ' + s.slice(0, 140));
              if (DZ.SEX.test(s.replace(NONSEX, '＿')) && !/回想|思い出|夢|かつて|あの夜/.test(s)) hit('S25', '性的な文 ' + name + ' [' + tag + '] | ' + s.slice(0, 140));
              const d0 = D0[i];
              if (d0 && d0.nobody && d0.revN == null && !/成り代わり|違和感/.test(tag) && DZ.BODY(name).test(s)) hit('S27', name + ' [' + tag + '] | ' + s.slice(0, 140));
            }
            if (!spk && !mournE && seg.some(g => (g.t === 'l' || g.t === 'q') && g.who === i && !DZ.SPK.test(String(g.s || '')) && !DZ.SPK.test(t))) hit('S25', '話し手（seg） ' + name + ' [' + tag + '] | ' + t.slice(0, 140));
          } else if ((st.o || st.c) && !st.d) {
            /* S30：場を離れた人・閉じ込められた人が、主役・話し手として出た */
            const ab = st.o ? '不在' : '閉じ込め', okE = DZ.OUTTAG.test(tag + ' ' + why + ' ' + kind) || e.cageOk;
            if (A[0] === i && kind !== 'phase' && !okE && !DZ.OUTTXT.test(t) && !EXEMPT.test(t)) hit('S30', ab + ' ' + name + ' [' + tag + '/' + kind + '] 主役 | ' + t.slice(0, 120));
            let pos = -1;
            while ((pos = t.indexOf(name, pos + 1)) >= 0) {
              const after = t.slice(pos + name.length, pos + name.length + 14), s = dzSent(t, pos);
              if (!dzQ(t, pos) && /^(?:（[^）]{0,12}）)?「/.test(after) && !okE && !DZ.OUTTXT.test(s)) hit('S30', ab + ' 話し手 ' + name + ' [' + tag + '] | ' + s.slice(0, 120));
            }
          }
        });
      });
      /* S32：蘇る人の遺言が、記録・住人の覚え書き・結末にある（2026-10-28 担当KA） */
      {
        const P1 = (dz.S && dz.S.P) || (dz.engine && dz.engine.chars) || [], SPc = HK.Special;
        const canRev = p => !!p && (SPc && SPc.canRevive ? SPc.canRevive(p) : !!(p.spec && !p.spNoRev && !p.spGone));
        let E32 = null;
        if (!res.solo && HK.Endings) { try { E32 = HK.Endings.build(res); } catch (err) { E32 = null; } }
        const L32 = (res.ending && Array.isArray(res.ending.lines) ? res.ending.lines : []).concat(E32 && E32.lines ? E32.lines : []);
        P1.forEach((p, i) => {
          if (!canRev(p) || !nm[i]) return;
          const key = nm[i] + 'が最期に遺した言葉', lab = nm[i] + '（' + (p.spec === 'vampire' ? '吸血鬼' : '不死') + '・' + (p.spRev || 0) + '回蘇った）';
          log.forEach(e => { if (e && typeof e.text === 'string' && e.text.indexOf(key) >= 0) hit('S32', lab + ' 記録 [' + (e.tag || e.cat || e.kind || '') + '] | ' + e.text.slice(Math.max(0, e.text.indexOf(key) - 40), e.text.indexOf(key) + 60)); });
          if (res.chars && res.chars[i] && res.chars[i].lastWords) hit('S32', lab + ' 住人の lastWords | ' + res.chars[i].lastWords);
          if (res.heroes && res.heroes[i] && res.heroes[i].lastWords) hit('S32', lab + ' heroes の lastWords | ' + res.heroes[i].lastWords);
          L32.forEach(l => { if (typeof l === 'string' && l.indexOf(key) >= 0) hit('S32', lab + ' 結末 | ' + l.slice(0, 120)); });
          ((E32 && E32.last) || []).forEach(x => { if (x && x.i === i) hit('S32', lab + ' 結末の最期の言葉 | ' + x.text); });
        });
      }
      /* S29：結末・行く末・その後・結末の文 */
      const fDead = i => (dz.S && dz.S.P && dz.S.P[i]) ? dz.S.P[i].alive === false : (dz.engine && dz.engine.chars[i]) ? dz.engine.chars[i].alive === false : !!(res.chars && res.chars[i] && res.chars[i].alive === false);
      chars.forEach((c, i) => {
        const dead = fDead(i), fate = String((res.heroes && res.heroes[i] && res.heroes[i].fate) || (res.chars && res.chars[i] && res.chars[i].fate) || '');
        if (dead && DZ.LIVE_FATE.test(fate) && !DZ.DEAD_FATE.test(fate)) hit('S29', '亡くなった' + nm[i] + 'の行く末が「' + fate + '」');
        if (!dead && DZ.DEAD_FATE.test(fate) && !/蘇|生き返/.test(fate)) hit('S29', '生きている' + nm[i] + 'の行く末が「' + fate + '」');
        if (!res.story && res.chars && res.chars[i] && res.chars[i].alive !== false && dead) hit('S29', '結果の住人の alive が食い違う ' + nm[i]);
      });
      let lines = res.ending && Array.isArray(res.ending.lines) ? res.ending.lines.slice() : [], ET = [];
      if (!res.solo && HK.Endings) { try { const E2 = HK.Endings.build(res); lines = lines.concat(E2.lines || []); ET = [E2.title, E2.headline, E2.text].filter(x => typeof x === 'string'); } catch (err) { out.err.push(sc + ' Endings(S29): ' + err.message); } }
      if (res.ending) ET = ET.concat([res.ending.title, res.ending.text].filter(x => typeof x === 'string'));
      /* 死の一覧（① 〜）・レポートの題（：『』）は見ない */
      ET.concat(lines.filter(l => typeof l === 'string' && !/のその後――|^主な関係：|^[①-⑳・] |：『/.test(l))).forEach(l => {
        String(l).split(/[。\n]/).forEach(sn => chars.forEach((c, i) => {
          if (!fDead(i) || !new RegExp(nm[i] + '(?:は|が|と|も|の隣)').test(sn)) return;
          if (/恋人|付き合|番に|番の|結ばれ|寄り添|暮らし|隣に|今でも|今も|毎朝|唇を寄せ|二人の世界|幸せ|夜だけを重ね/.test(sn) && !/死|亡|逝|最期|遺|墓|弔|いない|失|喪|心中|もうこの世|最後に残った感情/.test(sn)) hit('S29', '結末の文で亡くなった' + nm[i] + 'が生きている扱い | ' + sn.slice(0, 120));
        }));
      });
      lines.forEach(l => {
        if (typeof l !== 'string') return;
        if (/^主な関係：/.test(l)) l.slice(5).split('、').forEach(it => chars.forEach((c, i) => { if (fDead(i) && it.indexOf(nm[i]) >= 0 && /＝[^＝]*(?:恋人|両片想い|友人|相棒)(?:（意外）)?$/.test(it) && !/死別/.test(it)) hit('S29', '主な関係で亡くなった' + nm[i] + 'の組に（死別）がない | ' + it); }));
        chars.forEach((c, i) => {
          const name = nm[i], dead = fDead(i), m = l.match(new RegExp('^' + name + 'のその後――(.*)$'));
          if (m) {
            const deadT = /残された者|残された人|がいたら|の不在|のことを話すとき|最後に何を考えていた|のことを思い出すと|がいた場所|の分まで生きよう|返しきれなかった|書き置き|の名前が出るたび|が聞こえない/.test(m[1]);
            const liveT = new RegExp(name + 'は[^。]*(?:外の世界|を出た|を出て|日常|暮らし|帰り|戻っ|走り|話して回|笑った|手紙を書|生き延び|振り返)').test(m[1]) && !deadT;
            if (dead && liveT) hit('S29', '亡くなった人のその後が生きている扱い | ' + l.slice(0, 120));
            if (!dead && deadT && !liveT) hit('S29', '生きている人のその後が亡くなった扱い | ' + l.slice(0, 120));
          }
          const m2 = l.match(new RegExp('^' + name + '(?:（[^）]*）)?：(.*)$'));
          if (m2) { if (dead && DZ.LIVE_FATE.test(m2[1]) && !DZ.DEAD_FATE.test(m2[1])) hit('S29', '結末の行で亡くなった人が生還 | ' + l.slice(0, 100)); if (!dead && DZ.DEAD_FATE.test(m2[1]) && !/蘇|生き返/.test(m2[1])) hit('S29', '結末の行で生きている人が死亡 | ' + l.slice(0, 100)); }
        });
      });
    }
    const NAMES = ['アキラ', 'ミナト', 'ユキノ', 'カオル', 'ハルカ', 'レンジ', 'ソウタ', 'リコ'];
    /* 配役：執着（監禁を起こす）・恋人・恋愛にしない相手・R18に参加しない人・性行為の相手を固定した人（lo）を混ぜる */
    const CASTS = [
      { g: ['m', 'f', 'm', 'f', 'm', 'f'], p: ['top', 'bottom', '', '', 'top', 'bottom'], ties: [{ a: 0, b: 1, type: 'yan' }, { a: 2, b: 3, type: 'lover' }], ng: [[4, 5]], noR18: [2], lo: [3], same: [3, 4], lk: [2, 3], lk2: [1, 4] },
      { g: ['f', 'f', 'm', 'm', 'f', 'm'], p: ['', '', 'top', 'bottom', 'top', ''], ties: [{ a: 0, b: 1, type: 'lover' }, { a: 2, b: 3, type: 'yan' }], ng: [[0, 2]], noR18: [4], lo: [1], same: [3, 5], fa: [0], lk: [0, 1], lk2: [4, 5] },
      { g: ['m', 'm', 'f', 'f', 'm', 'f'], p: ['top', 'bottom', 'top', 'bottom', '', ''], ties: [{ a: 0, b: 1, type: 'lover' }, { a: 2, b: 3, type: 'lover' }, { a: 4, b: 0, type: 'yan' }], ng: [[1, 5]], noR18: [5], lo: [0, 1], same: [3, 4], fa: [3], lk: [2, 3], lk2: [4, 5] },
      { g: ['f', 'm', 'f', 'm', 'f', 'm'], p: ['top', 'bottom', '', 'top', 'bottom', ''], ties: [{ a: 0, b: 1, type: 'fwb' }, { a: 3, b: 2, type: 'yan' }], ng: [[4, 1]], noR18: [0], lo: [], same: [2, 5], fa: [2], lk: [0, 2], lk2: [2, 4] }
    ];
    /* S19〜S21：追加の気持ち・関係を使う配役（1シナリオあたり NF 回。ふつうの回のあとに回す。S1〜S18 もこの回で数える）
       無関心と恐怖は、恋人・セフレ・片想いと重ねて「恋愛にならないほうが勝つ」ことも見る。許嫁は乗り気どうし（恋愛対象が合う組・合わない組）と、断りたい側の破談 */
    const NF = Math.max(4, Math.round(N / 2));
    /* S31：避けている関係の配役（2026-10-28 担当JE）。避けている人（★）が攻め・受け・どちらでもの回を混ぜ、相手は想っている・敵視している。
       shy＝回避型の気質にする人（嫌悪レベルと組み合わせて「避けている」になる） */
    const NA = Math.max(4, Math.round(N / 2));
    const ACASTS = [
      /* ★1 は 0 を苦手（敵対の相手の気持ち）、★3 は 2 の片想いを苦手、★5 は 4 の執着を怖がっている */
      { g: ['m', 'f', 'm', 'f', 'f', 'm'], p: ['bottom', 'top', '', 'top', 'bottom', 'top'], ties: [{ a: 0, b: 1, type: 'enemy', cold: 'avoid' }, { a: 2, b: 3, type: 'crush', cold: 'dislike' }, { a: 4, b: 5, type: 'yan', cold: 'afraid' }] },
      /* ★0 は 1 を苦手（不仲の相手の気持ち・1 は 0 に片想いも）、★2 は 3 の支配に怯えている、★4 は 5 の執着を嫌っている、★shy の 5 は 4 を嫌悪 */
      { g: ['f', 'm', 'f', 'm', 'm', 'f'], p: ['top', 'bottom', 'top', '', 'top', 'riba'], ties: [{ a: 1, b: 0, type: 'bad', cold: 'avoid' }, { a: 1, b: 0, type: 'crush' }, { a: 3, b: 2, type: 'abuse', cold: 'fear' }, { a: 5, b: 4, type: 'yan', cold: 'hate' }], shy: [] },
      /* 嫌悪と回避型の気質：0↔1 敵対で ★1 は回避型、2↔3 敵対で 2 は愛憎（避けていない）・★3 は回避型、★5 は 4 の片想いを苦手 */
      { g: ['m', 'm', 'f', 'm', 'm', 'f'], p: ['', 'top', 'bottom', 'top', 'bottom', ''], ties: [{ a: 0, b: 1, type: 'enemy' }, { a: 2, b: 3, type: 'enemy', lh: 'a' }, { a: 4, b: 5, type: 'crush', cold: 'dislike' }], shy: [1, 3] },
      /* 恐怖・無関心・苦手を重ねる：★0 は 1 を恐れる、★2 は 3 に無関心（3 は 2 に片想い）、★4 は 5 を苦手（敵対）・4 は回避型 */
      { g: ['f', 'm', 'm', 'f', 'f', 'f'], p: ['top', 'bottom', 'top', 'bottom', 'top', 'bottom'], ties: [{ a: 0, b: 1, type: 'fear' }, { a: 2, b: 3, type: 'apathy' }, { a: 3, b: 2, type: 'crush' }, { a: 5, b: 4, type: 'enemy', cold: 'avoid' }], shy: [4] }
    ];
    const FCASTS = [
      { g: ['m', 'f', 'm', 'f', 'm', 'f'], p: ['top', 'bottom', '', '', 'top', 'bottom'], ties: [{ a: 0, b: 1, type: 'apathy' }, { a: 0, b: 1, type: 'lover' }, { a: 2, b: 3, type: 'fear' }, { a: 3, b: 2, type: 'crush' }, { a: 4, b: 5, type: 'fiance' }, { a: 1, b: 4, type: 'yan', sub: 'dep' }] },
      { g: ['f', 'm', 'f', 'm', 'f', 'f'], p: ['', 'top', 'bottom', 'top', '', 'bottom'], ties: [{ a: 1, b: 0, type: 'fear' }, { a: 0, b: 1, type: 'yan', sub: 'hatelove' }, { a: 2, b: 3, type: 'fiance', feel: 'refuse' }, { a: 4, b: 5, type: 'fiance' }, { a: 3, b: 5, type: 'apathy' }, { a: 5, b: 3, type: 'fwb' }] },
      { g: ['m', 'm', 'f', 'f', 'm', 'f'], p: ['top', 'top', '', '', 'bottom', 'top'], ties: [{ a: 0, b: 1, type: 'fiance' }, { a: 2, b: 3, type: 'fiance', feel: 'unsure' }, { a: 4, b: 5, type: 'fear' }, { a: 4, b: 5, type: 'fwb', mode: 'mistress' }, { a: 0, b: 2, type: 'enemy', grade: 'hate' }, { a: 1, b: 3, type: 'comrade' }, { a: 1, b: 5, type: 'comrade' }, { a: 3, b: 5, type: 'comrade' }] },
      { g: ['f', 'm', 'm', 'f', 'f', 'm'], p: ['bottom', 'top', 'riba', '', 'top', 'bottom'], ties: [{ a: 0, b: 1, type: 'fwb', mode: 'mistress' }, { a: 1, b: 3, type: 'lover' }, { a: 2, b: 4, type: 'apathy' }, { a: 4, b: 2, type: 'yan' }, { a: 5, b: 0, type: 'fear' }, { a: 3, b: 5, type: 'benefactor', feel: 'guilt' }, { a: 2, b: 5, type: 'fond', mode: 'oshi' }, { a: 3, b: 4, type: 'honmei' }] }
    ];
    /* 性行為の相手を固定する人（lo）の相手：関係の恋人がいればその人、いなければ隣の人（2026-10-26：「恋人だけ」をなくし、固定に一本化） */
    const loPart = (cast, i, n) => { const t = (cast.ties || []).filter(t => t.type === 'lover' && (t.a === i || t.b === i) && t.a < n && t.b < n)[0]; return t ? (t.a === i ? t.b : t.a) : (i + 1) % n; };
    /* 箱庭の仕掛けそのものがモブ・魔物の箱庭（「固定した相手だけ」でも縛らない。engine.js の HK.State.mobSexOk の説明） */
    const MOB_FREE = { dungeon: 1, succubus: 1, variety: 1 };
    const ids = only || Object.keys(HK.SCENARIOS);
    for (const sc of ids) {
      const scen = HK.SCENARIOS[sc]; if (!scen) continue;
      out.bySc[sc] = { runs: 0 };
      for (let s = 0; s < N + NF + NA; s++) {
        const avd = s >= N + NF, feel = s >= N && !avd;
        const cast = avd ? Object.assign({ ng: [], noR18: [], lo: [], same: null, fa: [], lk: [9, 9], lk2: [9, 9] }, ACASTS[(s - N - NF) % ACASTS.length]) : feel ? Object.assign({ ng: [], noR18: [], lo: [], same: null, fa: [], lk: [9, 9], lk2: [9, 9] }, FCASTS[(s - N) % FCASTS.length]) : CASTS[s % CASTS.length];
        const n = feel || avd ? Math.max(scen.minCast || 2, Math.min(scen.maxCast || 6, 6)) : Math.max(scen.minCast || 2, Math.min(scen.maxCast || 6, sc === 'jinro' ? 6 : 2 + (s % 5)));
        const chars = [], perChar = [];
        for (let i = 0; i < n; i++) {
          const ng = []; cast.ng.forEach(pr => { if (pr[0] === i && pr[1] < n) ng.push(pr[1]); if (pr[1] === i && pr[0] < n) ng.push(pr[0]); });
          chars.push({ name: NAMES[i], eg: { CP: (s * 7 + i * 5) % 21, NP: (s * 3 + i * 11) % 21, A: (s * 13 + i * 3) % 21, FC: (s * 5 + i * 7) % 21, AC: (s * 11 + i * 3) % 21 }, memo: '', gender: cast.g[i], likes: '', tone: '', fp: '', pos: cast.p[i], posLike: '', color: '', call: '', calls: {}, loveLock: '', loveNG: ng, noR18: cast.noR18.indexOf(i) >= 0, sexLock: cast.lo.indexOf(i) >= 0 ? String(loPart(cast, i, n)) : '', sexLockMob: cast.lo.indexOf(i) >= 0 && s % 3 === 1, faithful: (cast.fa || []).indexOf(i) >= 0,
            /* モブ相手の受け攻め（2026-10-26 担当AW）：R18に参加しない人・固定した相手だけの人に、モブには受け・リバ・攻めを付けても S4・S6 が 0 か */
            posNpc: cast.noR18.indexOf(i) >= 0 || cast.lo.indexOf(i) >= 0 ? ['bottom', 'riba', 'top', ''][s % 4] : '' });
          perChar.push({ action: 'auto', goal: 'auto', stats: {}, weapon: '', pick: {}, role: '' });
        }
        /* S31：回避型の気質の人（AC 高・CP 低・攻撃性 低） */
        if (avd && cast.shy) cast.shy.forEach(i => { if (chars[i]) chars[i].eg = { CP: 3 + (s % 3), NP: 12, A: 10, FC: 6, AC: 16 + (s % 4) }; });
        /* S15：5回に2回、二人を互いに恋愛相手として固定する（4人の回は lk、6人の回は lk2。相手が箱庭にいるときだけ） */
        const lk = feel || avd ? null : s % 5 === 2 ? cast.lk : s % 5 === 4 ? cast.lk2 : null;
        if (lk && lk[0] < n && lk[1] < n) { chars[lk[0]].loveLock = String(lk[1]); chars[lk[1]].loveLock = String(lk[0]); }
        /* 固定の複数化（2026-10-26）：10回に1回（s%10===4）、lk の一人目は二人を固定する（三人目もその一人目だけを固定。二人目と三人目は恋愛・夜にならないはず） */
        const lk3 = lk && s % 10 === 4 && n >= 3 && lk[0] < n && lk[1] < n ? [0, 1, 2, 3, 4, 5].filter(i => i < n && i !== lk[0] && i !== lk[1])[0] : null;
        if (lk3 != null) { chars[lk[0]].loveLock = [lk[1], lk3]; chars[lk3].loveLock = [lk[0]]; }
        /* S17：5回に1回（s%5===3）、二人を互いに固定し、R18に参加する方の一人の性行為の相手を「誰とでも可」にする */
        const lkAny = !feel && !avd && s % 5 === 3 && cast.lk[0] < n && cast.lk[1] < n ? cast.lk : null;
        if (lkAny) {
          chars[lkAny[0]].loveLock = String(lkAny[1]); chars[lkAny[1]].loveLock = String(lkAny[0]);
          chars[cast.noR18.indexOf(lkAny[0]) >= 0 ? lkAny[1] : lkAny[0]].sexLock = 'any';
        }
        /* S12：奇数回は同一人物の組を足す（相手どうしに書く） */
        const same = !feel && !avd && s % 2 && cast.same && cast.same[1] < n ? cast.same : null;
        if (same) { chars[same[0]].same = same[1]; chars[same[1]].same = same[0]; }
        const sameNg = same && s % 4 === 1 ? same : null;
        if (sameNg) { [[0, 1], [1, 0]].forEach(([x, y]) => { const c = chars[sameNg[x]]; c.loveNG = Array.isArray(c.loveNG) ? c.loveNG : []; if (c.loveNG.indexOf(sameNg[y]) < 0) c.loveNG.push(sameNg[y]); }); }
        /* 館：探偵2人と助手2人の回を混ぜる（S9） */
        if (sc === 'yakata' && n >= 4 && s % 2 === 0) { [0, 1, 2, 3].forEach(k => { const r0 = k < 2 ? 'detective' : 'assistant'; perChar[k].role = r0; perChar[k].pick = Object.assign({}, perChar[k].pick, { role: r0 }); }); }
        const env = {}; (scen.env || []).forEach(e => { env[e.id] = e.def != null ? e.def : (e.options && e.options[0] ? e.options[0].v : (e.min != null ? e.min : '')); });
        (scen.env || []).forEach((e, k) => { if (e.options && e.options.length > 1 && (s + k) % 3 === 0) env[e.id] = e.options[(s + k) % e.options.length].v; });
        /* 役割（mob.js の HK.Roles）は、回ごとに「おまかせ」と「住人から」を交互に */
        (scen.env || []).forEach(e => { if (/^role_/.test(e.id)) env[e.id] = s % 2 ? 'res' : 'auto'; });
        ENVSET.forEach(kv => { env[kv[0]] = isNaN(+kv[1]) ? kv[1] : +kv[1]; });
        if (HOT) (scen.env || []).forEach(e => {
          if (e.max != null && /lewd|dose|shady|heat|prey|pleasure|traffic|ev$|aphro|night|npc|lust|yobai/.test(e.id)) env[e.id] = e.max;
          else if (e.options && /lewd/.test(e.id)) { const hi = e.options.filter(o => /high|max|lewd/.test(o.v))[0]; if (hi) env[e.id] = hi.v; }
        });
        /* 内容のスイッチ（あれば）：偶数回は全部切る */
        /* 内容のスイッチ：偶数回はすべて切、奇数回はすべて入（S8 は切の回に、合意のない場面などが出たら数える） */
        const offTags = {};
        if (HK.Content && HK.Content.TAGS) { if (s % 2 === 0) { HK.Content.TAGS.forEach(t => { offTags[t.id] = true; }); env.ct = ''; } else env.ct = HK.Content.TAGS.map(t => t.id).join(','); }
        const ties = (cast.ties || []).filter(t => t.a < n && t.b < n);
        cur = { sc, story: !!scen.solo, offTags, feel: feel ? ties : null, avd };
        let res;
        lastCtx = null;
        dz = { snap: {}, deaths: [], rev: [], engine: null, S: null };
        try { res = HK.simulate({ scenId: sc, seed: 3000 + s, env, chars, perChar, ties }); } catch (e) { out.err.push(sc + ': ' + String(e && e.stack || e).slice(0, 300)); dz = null; continue; }
        /* S25〜S30：死んだ・消えた人の再登場（文レベル） */
        try { dzCheck(res, chars, sc); } catch (e) { out.err.push(sc + ' dzCheck: ' + String(e && e.stack || e).slice(0, 300)); }
        dz = null;
        /* S13・S14：回の終わりにもう一度 */
        if (lastCtx) polyCheck(lastCtx, true);
        /* S19〜S21：回の終わり（判定の関数・値の凍結・関係図・性的な文） */
        if (feel) {
          const P0 = lastCtx && !cur.story ? lastCtx.chars : lastS && lastS.P ? lastS.P : null;
          if (lastCtx && !cur.story) feelStep(lastCtx, true);
          ties.forEach(t => {
            const x = P0 && P0[t.a], y = P0 && P0[t.b];
            if ((t.type === 'apathy' || t.type === 'fear') && x && y) {
              if (HK.canLove(x, y) || HK.canLove(y, x)) hit(nlKey(t), '恋愛の判定が通る（HK.canLove） ' + nlTxt(P0, t));
              if (HK.Pos && HK.Pos.okSex(x, y)) hit(nlKey(t), '体の関係の判定が通る（HK.Pos.okSex） ' + nlTxt(P0, t));
              if (lastS && cur.story && lastS.P === P0) { const lv = storyLov(lastS); if (lv[tkey(t.a, t.b)]) hit(nlKey(t), '物語型の恋人の記録 ' + nlTxt(P0, t)); }
            }
            /* 無関心：a→b の好意・惹かれが、区切りごとの記録（history）でずっと同じ */
            if (t.type === 'apathy' && !cur.story && Array.isArray(res.history) && res.history.length) {
              const k = tkey(t.a, t.b), ia = t.a < t.b ? 0 : 1, it = t.a < t.b ? 3 : 4, v0 = res.history[0].rel && res.history[0].rel[k];
              if (v0) res.history.forEach(h => { const v = h.rel && h.rel[k]; if (v && (Math.abs(v[ia] - v0[ia]) > 1e-6 || Math.abs(v[it] - v0[it]) > 1e-6)) hit('S19', '値が動いた ' + nlTxt(chars, t) + '（' + h.label + '：好意 ' + Math.round(v0[ia]) + '→' + Math.round(v[ia]) + '・惹かれ ' + Math.round(v0[it]) + '→' + Math.round(v[it]) + '）'); });
              const pr = (res.pairs || []).filter(p => tkey(p.a, p.b) === k)[0], last = res.history[res.history.length - 1].rel[k];
              if (pr && last) { const ab = t.a < t.b ? pr.rel.ab : pr.rel.ba; if (Math.abs(ab.aff - Math.round(last[ia])) > 1 || Math.abs(ab.att - Math.round(last[it])) > 1) hit('S19', '結果の値が記録と違う ' + nlTxt(chars, t)); }
            }
            /* 許嫁：恋人と同じ扱い（pf.couple）は、恋愛対象と受け攻めが合う組だけ */
            if (t.type === 'fiance' && lastCtx && !cur.story && x && y) {
              const pf = lastCtx.pf[tkey(t.a, t.b)], nr = c => Object.assign({}, c, { noR18: false });
              if (pf && pf.couple && !ties.some(u => /^(lover|mate|fated|abuse)$/.test(u.type) && tkey(u.a, u.b) === tkey(t.a, t.b)) && !(HK.canLove(x, y) && HK.canLove(y, x) && (!HK.Pos || HK.Pos.okSex(nr(x), nr(y))))) hit('S21', '恋愛対象・受け攻めの合わない許嫁が恋人に ' + x.name + '×' + y.name);
              if (pf && pf.fiBroken != null) out.info.fiBreak = (out.info.fiBreak || 0) + 1;
            }
          });
          /* 関係図・結末：無関心・恐怖の組の恋の線 */
          const edges = (res.pairs || []).map(p => ({ a: p.a, b: p.b, cls: p.cls, name: p.name })).concat(res.relmap && res.relmap.edges ? res.relmap.edges.map(e => ({ a: e.a, b: e.b, cls: e.cls, name: e.label })) : []);
          edges.forEach(ed => { const nl = nlOf(ties, ed.a, ed.b); if (nl && (ed.cls === 'love' || ed.cls === 'night' || ed.cls === 'pine')) hit(nlKey(nl), '結末・関係図 ' + nlTxt(chars, nl) + '＝' + ed.name); });
          /* 性的な文に、無関心・恐怖の二人の名前だけが出た */
          (res.log || []).forEach(e => {
            if (!e || typeof e.text !== 'string') return;
            sents(e.text).forEach(x => { if (!isSex(x) || MOB.test(x) || /最期に遺した言葉/.test(x)) return; const inS = chars.map((c, i) => x.indexOf(c.name) >= 0 ? i : -1).filter(i => i >= 0); if (inS.length === 2) { const nl = nlOf(ties, inS[0], inS[1]); if (nl) hit(nlKey(nl), '性的な文 ' + nlTxt(chars, nl) + ' | ' + x.slice(0, 120)); } });
            /* 参考：恐怖で避けた・無関心で受け流した出来事の数 */
            const w = String(e.why || '');
            if (/を恐れている：|に庇護を求めた/.test(w)) out.info.fear = (out.info.fear || 0) + 1;
            if (/の無関心：/.test(w)) out.info.apathy = (out.info.apathy || 0) + 1;
            if (/許嫁の破談/.test(w)) out.info.fiBreakEv = (out.info.fiBreakEv || 0) + 1;
            if (/同じグループの仲間/.test(w)) out.info.comrade = (out.info.comrade || 0) + 1;
          });
        }
        if (lastS) { storyCheck(lastS, true); lastS = null; }
        /* S15（物語型）：関係図の恋の線 */
        if (cur.story && res.relmap && Array.isArray(res.relmap.edges)) res.relmap.edges.forEach(ed => { if (ed.cls === 'love' && lockBad(chars[ed.a] && { i: ed.a, locks: cfgL(chars[ed.a].loveLock) }, chars[ed.b] && { i: ed.b, locks: cfgL(chars[ed.b].loveLock) })) hit('S15', '関係図 ' + chars[ed.a].name + '×' + chars[ed.b].name + ' ' + ed.label); });
        out.runs++; out.bySc[sc].runs++;
        /* 記録の文で見る点検（S4〜S7, S9） */
        const nm = chars.map(c => c.name);
        /* S8：内容のスイッチを切った回に、合意のない場面（札・理由で見分ける）・妊娠・快楽殺人の性的な文が出た */
        const coreSc = HK.Content && HK.Content.CORE && HK.Content.CORE[sc];
        if (offTags.force && !coreSc) (res.log || []).forEach(e => {
          if (!e || typeof e.text !== 'string') return;
          const lab = (e.tag || '') + ' ' + (e.why || '');
          if (!/恋人|攻めを選んで|自分から|受け入れている|共依存/.test(lab) && /夜這い|憑依|清めの湯|洞窟|脅迫|蛇の夜|蛇の夢|チョー・チョー人|収穫祭の夜|略奪者|ゾンビに襲|監禁の夜|奪われたうなじ|攫われ|強引|無理やり|凌辱|夢の中で神/.test(lab) && sents(e.text).some(isSex)) hit('S8', 'force | ' + lab.slice(0, 50) + ' | ' + e.text.slice(0, 100));
        });
        if (offTags.preg) (res.log || []).forEach(e => { if (e && /(?<!酸素を)孕|疑似妊娠|身籠|神の子を産む/.test((e.text || '') + (e.why || ''))) hit('S8', 'preg | ' + (e.why || '').slice(0, 40) + ' | ' + String(e.text).slice(0, 100)); });
        /* S10：一回の遊びの中で、同じ性的な文（15文字以上）が3つ以上の記録に出た */
        const runSeen = {};
        (res.log || []).forEach(e => { if (!e || typeof e.text !== 'string') return; const once = {}; sents(e.text).forEach(x => { const k = x.replace(/[「」『』\s]/g, ''); if (k.length >= 15 && isSex(x) && !once[k]) { once[k] = 1; runSeen[k] = (runSeen[k] || 0) + 1; } }); });
        Object.keys(runSeen).forEach(k => { if (runSeen[k] >= 3) hit('S10', runSeen[k] + '回 | ' + k.slice(0, 80)); });
        /* W1：箱庭の場所に合わない語（地の文だけ。「」の中は除く） */
        if (PLACE_NG[sc]) (res.log || []).forEach(e => { if (!e || typeof e.text !== 'string') return; const nar = e.text.replace(/「[^」]*」/g, '「」'); const m = nar.match(PLACE_NG[sc]); if (m) hit('W1', '「' + m[0] + '」 [' + (e.tag || '') + '] | ' + nar.slice(Math.max(0, m.index - 60), m.index + 60)); });
        /* S11：最期の言葉の名前の取り違え */
        const LWR = /([^「」：\s　―]+?)が最期に遺した言葉：「([^」]*)」/g;
        const deadOf = i => (res.heroes && res.heroes[i]) ? !!res.heroes[i].dead : !!(res.chars && res.chars[i] && res.chars[i].alive === false);
        /* 不死・吸血鬼が蘇った（special.js の「蘇生」）人は、死の記録の最期の言葉が残っていてよい */
        const revived = i => (res.log || []).some(e => e && (e.tag === '蘇生' || /蘇生/.test(String(e.why || ''))) && e.actors && e.actors.indexOf(i) >= 0);
        const selfCall = (sp, q) => new RegExp('^[…‥、\\s]*' + sp.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '、').test(q);
        (res.log || []).forEach(e => {
          if (!e || typeof e.text !== 'string' || e.text.indexOf('最期に遺した言葉') < 0) return;
          let m; LWR.lastIndex = 0;
          while ((m = LWR.exec(e.text))) {
            const sp = m[1].replace(/^.*?(?=(?:アキラ|ミナト|ユキノ|カオル|ハルカ|レンジ|ソウタ|リコ)$)/, ''), i = nm.indexOf(sp);
            if (i < 0) { hit('S11', '話し手が住人でない「' + sp + '」 | ' + e.text.slice(-120)); continue; }
            if (e.kind === 'death' && e.actors && e.actors[0] !== i) hit('S11', '死の記録の主役は' + nm[e.actors[0]] + 'なのに' + sp + 'の最期の言葉 | ' + e.text.slice(-120));
            else if (e.kind !== 'death' && (!e.actors || e.actors.indexOf(i) < 0)) hit('S11', sp + 'の出ない記録に最期の言葉 | ' + e.text.slice(-120));
            if (!deadOf(i) && !revived(i)) hit('S11', '生きている' + sp + 'の最期の言葉 | ' + e.text.slice(-120));
            if (selfCall(sp, m[2])) hit('S11', sp + 'が自分に呼びかけた | ' + m[2]);
          }
        });
        (res.chars || []).forEach((c, i) => { if (c && c.lastWords && (c.lastWords.indexOf(c.name + '「') !== 0 || selfCall(c.name, c.lastWords.slice(c.name.length + 1)))) hit('S11', 'lastWords ' + c.name + ' | ' + c.lastWords); if (c && c.lastWords && c.alive !== false && !revived(i)) hit('S11', '生きている' + c.name + 'に lastWords | ' + c.lastWords); });
        if (!scen.solo && HK.Endings) { try { const E = HK.Endings.build(res); (E.last || []).forEach(x => { const c = res.chars[x.i]; if (!c || c.name !== x.name || String(x.text).indexOf(c.name + '「') !== 0) hit('S11', 'E.last ' + x.name + ' | ' + x.text); }); } catch (err) { out.err.push(sc + ' Endings: ' + err.message); } }
        if (res.ending && Array.isArray(res.ending.lines)) res.ending.lines.forEach(l => { if (typeof l !== 'string') return; let m; LWR.lastIndex = 0; while ((m = LWR.exec(l))) { const i = nm.indexOf(m[1]); if (i < 0 || !deadOf(i) || selfCall(m[1], m[2])) hit('S11', '結末 | ' + l.slice(0, 120)); } });
        (res.log || []).forEach(e => {
          if (!e || typeof e.text !== 'string' || !e.text) return;
          const ss = sents(e.text);
          /* S7：一つの記録の中の同じ文（12文字以上・性的な文） */
          const seen = {};
          ss.forEach(x => { const k = x.replace(/[「」『』\s]/g, ''); if (k.length >= 12 && isSex(x)) { if (seen[k]) hit('S7', k.slice(0, 80) + ' || ' + e.text.slice(0, 120)); seen[k] = 1; } });
          /* S12：同一人物の二人だけの恋愛の記録 */
          if (sameNg && e.cat === 'romance' && Array.isArray(e.actors) && e.actors.length === 2 && e.actors.indexOf(same[0]) >= 0 && e.actors.indexOf(same[1]) >= 0) hit('S12', nm[same[0]] + '×' + nm[same[1]] + ' [romance] | ' + e.text.slice(0, 140));
          ss.forEach(x => {
            if (!isSex(x)) return;
            const inS = nm.map((n0, i) => x.indexOf(n0) >= 0 ? i : -1).filter(i => i >= 0);
            if (!inS.length) return;
            const core = HK.State && HK.State.R18_CORE && HK.State.R18_CORE[sc];
            inS.forEach(i => { if (chars[i].noR18 && mode === 'r18' && !core) hit('S4', nm[i] + ' [' + (e.tag || e.cat || '') + '] | ' + x.slice(0, 140)); });
            if (inS.length === 2 && (lk || lkAny)) { const L2 = inS.map(i => ({ i, locks: cfgL(chars[i].loveLock), sx: chars[i].sexLock })); if (lockBad(L2[0], L2[1]) && !anyOk(L2[0], L2[1])) hit('S15', '性的な文 ' + nm[inS[0]] + '×' + nm[inS[1]] + ' [' + (e.tag || e.cat || '') + '] | ' + x.slice(0, 140)); }
            for (let a = 0; a < inS.length; a++) for (let b = a + 1; b < inS.length; b++) if (chars[inS[a]].loveNG.indexOf(inS[b]) >= 0 && inS.length === 2) hit('S5', nm[inS[a]] + '×' + nm[inS[b]] + ' | ' + x.slice(0, 140));
            if (sameNg && inS.length === 2 && inS.indexOf(same[0]) >= 0 && inS.indexOf(same[1]) >= 0) hit('S12', nm[same[0]] + '×' + nm[same[1]] + ' | ' + x.slice(0, 140));
            inS.forEach(i => { const sl = chars[i].sexLock; if (sl !== '' && sl != null && sl !== 'any' && !chars[i].sexLockMob && mode === 'r18' && !MOB_FREE[sc] && MOB.test(x) && inS.length === 1) hit('S6', nm[i] + ' | ' + x.slice(0, 140)); });
          });
          if (sc === 'yakata' && perChar[0].role === 'detective' && /先生/.test(e.text)) {
            /* 助手（2,3）のうち、文の中の「先生」が指す探偵が自分の探偵でない：探偵の名前と助手の名前が同じ記録にあり、助手と結びついた探偵と違う */
            const P = res.yakataBuddy || null;
            if (P) Object.keys(P).forEach(ai => { const d = P[ai]; if (e.text.indexOf(nm[ai] + '「') >= 0 || e.text.indexOf(nm[ai] + 'は') >= 0) { const other = [0, 1].filter(k => k !== d)[0]; if (e.text.indexOf(nm[other]) >= 0 && e.text.indexOf(nm[d]) < 0 && /先生/.test(e.text)) hit('S9', nm[ai] + '→' + nm[other] + ' | ' + e.text.slice(0, 160)); } });
          }
        });
        cur = null;
      }
    }
    /* W1（追加の回）：ふつうの配役には敵視の組がないので、媚薬ロッカーは敵対・不仲（愛憎つきも）の組で N/2 回（4回以上）回して、
       対立の文（hate-kit.js・hate-love.js の狭い場所の文）に場所に合わない語が出ないかを見る（二人・三人・四人） */
    if (HK.SCENARIOS.locker && PLACE_NG.locker && (!only || only.indexOf('locker') >= 0)) {
      const scL = HK.SCENARIOS.locker, NW = Math.max(4, Math.round(N / 2));
      out.bySc.locker = out.bySc.locker || { runs: 0 };
      for (let s = 0; s < NW; s++) {
        const n = 2 + (s % 3), types = ['enemy', 'bad'];
        const chars = NAMES.slice(0, n).map((nm, i) => ({ name: nm, eg: { CP: (s * 7 + i * 5) % 21, NP: (s * 3 + i * 11) % 21, A: (s * 13 + i * 3) % 21, FC: (s * 5 + i * 7) % 21, AC: (s * 11 + i * 3) % 21 }, gender: (s + i) % 2 ? 'f' : 'm', likes: 'both', pos: '', loveNG: [] }));
        const ties = [{ a: 0, b: 1, type: types[s % 2], lh: s % 4 === 1 ? 'both' : s % 4 === 3 ? 'a' : '' }];
        if (n >= 3) ties.push({ a: 2, b: 0, type: types[(s + 1) % 2] });
        const env = {}; (scL.env || []).forEach(e => { env[e.id] = e.def != null ? e.def : (e.options && e.options[0] ? e.options[0].v : (e.min != null ? e.min : '')); });
        cur = { sc: 'locker', story: true, offTags: {}, feel: null };
        let res;
        try { res = HK.simulate({ scenId: 'locker', seed: 7000 + s, env, chars, ties, perChar: chars.map(() => ({ action: 'auto', goal: 'auto', stats: {}, pick: {}, role: '' })) }); } catch (e) { out.err.push('W1 locker: ' + String(e && e.stack || e).slice(0, 300)); cur = null; continue; }
        (res.log || []).forEach(e => { if (!e || typeof e.text !== 'string') return; const nar = e.text.replace(/「[^」]*」/g, '「」'); const m = nar.match(PLACE_NG.locker); if (m) hit('W1', '「' + m[0] + '」（敵対の配役） [' + (e.tag || '') + '] | ' + nar.slice(Math.max(0, m.index - 60), m.index + 60)); });
        out.info.w1Runs = (out.info.w1Runs || 0) + 1;
        cur = null;
      }
    }
    /* S25〜S30（追加の回）：死のある箱庭を、不死・吸血鬼（不死あり／なし）・同一人物・執着（監禁）・愛憎・発狂しやすい気質・
       展開の重さ「重い」・死ネタの重さ「重い」を混ぜた配役で ND 回（N/2、4 回以上）ずつ回す（その回の S1〜S18 も数える） */
    const DZ_SC = ['zombie', 'jashin', 'yakata', 'ship', 'rpg', 'jinro', 'island', 'whiteroom', 'omega', 'locker', 'dungeon', 'succubus', 'br', 'trial', 'classroom'];
    const ND = Math.max(4, Math.round(N / 2));
    for (const sc of DZ_SC) {
      const scen = HK.SCENARIOS[sc]; if (!scen || (only && only.indexOf(sc) < 0)) continue;
      out.bySc[sc] = out.bySc[sc] || { runs: 0 };
      for (let s = 0; s < ND; s++) {
        const n = sc === 'jinro' ? 6 + (s % 3) : Math.max(scen.minCast || 2, Math.min(scen.maxCast || 6, 3 + (s % 4)));
        const chars = [], perChar = [];
        for (let i = 0; i < n; i++) {
          chars.push({ name: NAMES[i], eg: { CP: (s * 7 + i * 5) % 21, NP: (s * 3 + i * 11) % 21, A: (s * 13 + i * 3) % 21, FC: (s * 5 + i * 7) % 21, AC: (s * 11 + i * 3) % 21 }, memo: '', gender: (i + s) % 3 === 0 ? 'f' : (i + s) % 3 === 1 ? 'm' : (i % 2 ? 'f' : 'm'), likes: '', tone: '', fp: '', pos: ['top', 'bottom', '', 'riba'][(i + s) % 4], posLike: '', color: '', call: '', calls: {}, loveLock: '', loveNG: [], noR18: false, sexLock: '', faithful: false });
          perChar.push({ action: 'auto', goal: 'auto', stats: {}, weapon: '', pick: {}, role: '' });
        }
        if (s % 3 === 0) chars[n - 1].eg = { CP: 4, NP: 6, A: 2, FC: 8, AC: 20 };   /* 発狂しやすい気質 */
        const ties = [];
        if (s % 4 === 0) ties.push({ a: 0, b: 1, type: 'yan' });
        if (s % 4 === 1) ties.push({ a: 0, b: 1, type: 'yan', sub: 'hatelove' });
        if (s % 4 === 2) { ties.push({ a: 0, b: 1, type: 'lover' }); if (n >= 4) ties.push({ a: 2, b: 3, type: 'lover' }); }
        if (s % 4 === 3 && n >= 4) { chars[2].same = 3; chars[3].same = 2; ties.push({ a: 1, b: 0, type: 'yan' }); }
        if (s % 5 === 1) chars[1 % n].race = 'vampire';
        if (s % 5 === 2) chars[Math.min(2, n - 1)].feats = ['immortal'];
        if (s % 5 === 3) perChar[0].pick.special = 'immortal';
        if (s % 5 === 4) { chars[1 % n].race = 'vampire'; chars[1 % n].feats = ['fang', 'cold']; }
        const env = {}; (scen.env || []).forEach(e => { env[e.id] = e.def != null ? e.def : (e.options && e.options[0] ? e.options[0].v : (e.min != null ? e.min : '')); });
        (scen.env || []).forEach((e, k) => { if (e.options && e.options.length > 1 && (s + k) % 3 === 0) env[e.id] = e.options[(s + k) % e.options.length].v; else if (e.max != null && e.min != null && (s + k) % 4 === 1) env[e.id] = e.max; });
        (scen.env || []).forEach(e => { if (/^role_/.test(e.id)) env[e.id] = s % 2 ? 'res' : 'auto'; });
        if (HOT) (scen.env || []).forEach(e => { if (e.max != null && /lewd|dose|shady|heat|prey|pleasure|traffic|ev$|aphro|night|npc|lust|yobai|danger|hostile|serial|outbreak|turn/.test(e.id)) env[e.id] = e.max; });
        if (s % 3 === 0) { env.heavy = 'dark'; env.death = 'dark'; } else if (s % 3 === 1) env.death = 'dark';
        if (sc === 'whiteroom' && s % 2 === 0) env.cond = 'kill';
        if (HK.Content && HK.Content.TAGS) env.ct = s % 4 === 0 ? '' : HK.Content.TAGS.map(t => t.id).join(',');
        cur = { sc, story: !!scen.solo, offTags: {}, feel: null };
        dz = { snap: {}, deaths: [], rev: [], engine: null, S: null };
        let res;
        lastCtx = null; lastS = null;
        try { res = HK.simulate({ scenId: sc, seed: 7000 + s, env, chars, perChar, ties }); } catch (e) { out.err.push(sc + '（S25〜の回）: ' + String(e && e.stack || e).slice(0, 300)); dz = null; cur = null; continue; }
        try { dzCheck(res, chars, sc); } catch (e) { out.err.push(sc + ' dzCheck: ' + String(e && e.stack || e).slice(0, 300)); }
        lastS = null; dz = null; cur = null;
        out.runs++; out.bySc[sc].runs++; out.info.dzRuns = (out.info.dzRuns || 0) + 1;
      }
    }
    /* S32（追加の回。2026-10-28 担当KA）：蘇る箱庭（HK.Special.SCENES）を、住人の大半が不死・吸血鬼の配役で NI 回（N/2、4 回以上）ずつ回す。
       特殊役職の不死・体の特徴の不死・吸血鬼（不死あり）・吸血鬼（不死を外した＝蘇らない）を混ぜ、展開と死ネタの重さ「重い」・危険の設定を上げる。
       蘇る人の遺言（S32）と、その回の S1〜S30 も数える */
    const SPS = (HK.Special && HK.Special.SCENES) || [];
    const NI = Math.max(4, Math.round(N / 2));
    for (const sc of SPS) {
      const scen = HK.SCENARIOS[sc]; if (!scen || (only && only.indexOf(sc) < 0)) continue;
      out.bySc[sc] = out.bySc[sc] || { runs: 0 };
      for (let s = 0; s < NI; s++) {
        const n = Math.max(scen.minCast || 2, Math.min(scen.maxCast || 6, 4 + (s % 3)));
        const chars = [], perChar = [];
        for (let i = 0; i < n; i++) {
          chars.push({ name: NAMES[i], eg: { CP: (s * 7 + i * 5) % 21, NP: (s * 3 + i * 11) % 21, A: (s * 13 + i * 3) % 21, FC: (s * 5 + i * 7) % 21, AC: (s * 11 + i * 3) % 21 }, memo: '', gender: (i + s) % 2 ? 'f' : 'm', likes: '', tone: '', fp: '', pos: ['top', 'bottom', '', 'riba'][(i + s) % 4], posLike: '', color: '', call: '', calls: {}, loveLock: '', loveNG: [], noR18: false, sexLock: '', faithful: false });
          perChar.push({ action: 'auto', goal: 'auto', stats: {}, weapon: '', pick: {}, role: '' });
          const k = (i + s) % 5;
          if (k === 0) perChar[i].pick.special = 'immortal';
          else if (k === 1) chars[i].race = 'vampire';
          else if (k === 2) chars[i].feats = ['immortal'];
          else if (k === 3 && s % 2) { chars[i].race = 'vampire'; chars[i].feats = ['fang', 'cold']; }
        }
        /* 口調の違い（疎む・当たり前・怯える・軽口が出るように） */
        const TONES = ['darui', 'gentleman', 'gyaru', 'honwaka', 'mukuchi', 'chara', 'noja', ''];
        chars.forEach((c, i) => { if ((i + s) % 3 === 0) c.tone = TONES[(i + s) % TONES.length]; });
        const ties0 = [{ a: 0, b: 1, type: s % 2 === 0 ? 'lover' : 'yan' }];
        const env = {}; (scen.env || []).forEach(e => { env[e.id] = e.def != null ? e.def : (e.options && e.options[0] ? e.options[0].v : (e.min != null ? e.min : '')); });
        (scen.env || []).forEach(e => { if (e.max != null && /danger|hostile|serial|outbreak|turn|lewd|ev$/.test(e.id)) env[e.id] = e.max; });
        env.heavy = 'dark'; env.death = 'dark';
        if (HK.Content && HK.Content.TAGS) env.ct = s % 2 ? '' : HK.Content.TAGS.map(t => t.id).join(',');
        cur = { sc, story: !!scen.solo, offTags: {}, feel: null };
        dz = { snap: {}, deaths: [], rev: [], engine: null, S: null };
        let res;
        lastCtx = null; lastS = null;
        try { res = HK.simulate({ scenId: sc, seed: 8000 + s, env, chars, perChar, ties: ties0 }); } catch (e) { out.err.push(sc + '（S32 の回）: ' + String(e && e.stack || e).slice(0, 300)); dz = null; cur = null; continue; }
        try { dzCheck(res, chars, sc); } catch (e) { out.err.push(sc + ' dzCheck(S32): ' + String(e && e.stack || e).slice(0, 300)); }
        (res.log || []).forEach(e => { if (e && e.tag === '蘇生') out.info.revive = (out.info.revive || 0) + 1; });
        lastS = null; dz = null; cur = null;
        out.runs++; out.bySc[sc].runs++; out.info.s32Runs = (out.info.s32Runs || 0) + 1;
      }
    }
    /* S22：グループの「仲間」（ui.js）。オンのグループの住人どうしにだけ、箱庭に渡す関係「仲間」が付く／オフでは付かない／
       ほかの関係はそのまま残る（仲間は重ねるだけ）／JSON にオン・オフが入る（古い JSON は「なし」として読める） */
    if (HK.UI && HK.UI.state && HK.UI.buildInput && HK.UI.normState) {
      cur = { sc: '画面', story: false }; out.bySc['画面'] = out.bySc['画面'] || { runs: 0 };
      const S0 = HK.UI.state(), bak = JSON.stringify(S0);
      const sid = (HK.SCEN_ORDER || []).filter(id => HK.SCENARIOS[id] && !HK.SCENARIOS[id].solo && (HK.SCENARIOS[id].maxCast || 6) >= 4)[0];
      const put = st => { Object.keys(S0).forEach(k => { delete S0[k]; }); Object.assign(S0, st); };
      try {
        const eg = { CP: 10, NP: 12, A: 8, FC: 14, AC: 6 };
        put(HK.UI.normState({ chars: [{ id: 'q1', name: '甲', eg, group: 'A班' }, { id: 'q2', name: '乙', eg, group: 'A班,B班' }, { id: 'q3', name: '丙', eg, group: 'B班' }, { id: 'q4', name: '丁', eg, group: 'C班' }], ties: [{ a: 'q1', b: 'q2', type: 'friend' }], grpComrade: { 'A班': 1 } }));
        S0.scenId = sid; S0.join = {};
        const has = (inp, x, y) => inp.ties.some(t => t.type === 'comrade' && ((t.a === x && t.b === y) || (t.a === y && t.b === x)));
        const i1 = HK.UI.buildInput(1);
        if (!has(i1, 0, 1)) hit('S22', 'オンのグループ（A班）の二人に仲間が付かない');
        if (has(i1, 1, 2) || has(i1, 0, 2) || has(i1, 2, 3) || has(i1, 0, 3)) hit('S22', 'オフのグループの組・グループの違う組に仲間が付いた');
        if (!i1.ties.some(t => t.type === 'friend' && t.a === 0 && t.b === 1)) hit('S22', '仲間を重ねた二人のほかの関係（友人）が消えた');
        if (i1.ties.filter(t => t.type === 'comrade').length !== 1) hit('S22', '仲間の数が合わない（' + i1.ties.filter(t => t.type === 'comrade').length + '）');
        S0.grpComrade = { 'B班': 1 };
        const i2 = HK.UI.buildInput(1);
        if (!has(i2, 1, 2) || has(i2, 0, 1)) hit('S22', 'B班だけオンにしたのに、仲間の付き方が違う');
        S0.grpComrade = {};
        const i3 = HK.UI.buildInput(1);
        if (i3.ties.some(t => t.type === 'comrade')) hit('S22', 'すべてオフなのに仲間が付いた');
        S0.grpComrade = { 'A班': 1 };
        const js = HK.UI.rosterJSON();
        if (!(js.grpComrade && js.grpComrade['A班'])) hit('S22', 'JSON の書き出しに仲間のグループが入らない');
        const old = HK.UI.normState({ chars: [{ id: 'q1', name: '甲', eg, group: 'A班' }], ties: [] });
        if (!old.grpComrade || Object.keys(old.grpComrade).length) hit('S22', '古い形式（仲間の欄なし）を読むと、仲間の欄がおかしい');
        /* 仲間を付けた入力で、エンジン型の箱庭を回せる（関係図の印 tie.comrade も付く） */
        S0.grpComrade = { 'A班': 1, 'B班': 1 };
        const res22 = HK.simulate(HK.UI.buildInput(7));
        out.bySc['画面'].runs++;
        if (!(res22.pairs || []).some(p => p.tie && p.tie.comrade)) hit('S22', '結果の関係に仲間の印（tie.comrade）がない');
      } catch (e) { out.err.push('S22: ' + String(e && e.stack || e).slice(0, 300)); }
      put(JSON.parse(bak));
      cur = null;
    }
    return out;
  }, { N, only, WHY, HOT, mode, ENVSET });
  const ids = Object.keys(r.bySc);
  for (const sc of ids) {
    const b = r.bySc[sc]; const cells = ['S1', 'S2', 'S3', 'S4', 'S5', 'S6', 'S7', 'S8', 'S9', 'S10', 'S11', 'S12', 'S13', 'S14', 'S15', 'S16', 'S17', 'S18', 'S19', 'S20', 'S21', 'S22', 'S25', 'S26', 'S27', 'S28', 'S29', 'S30', 'S31', 'S32'].map(k => k + ' ' + (b[k] || 0));
    console.log(sc.padEnd(10), 'runs', b.runs, cells.join(' '), '誰とでも可の体の出来事', r.anySex[sc] || 0);
  }
  console.log('合計', JSON.stringify(r.n), '止めた', JSON.stringify(r.drop));
  console.log('参考（追加の関係の出来事の数）', JSON.stringify(r.info));
  console.log('S31（避けている人が自分から迫った：箱庭と札・出来事ごと）', JSON.stringify(r.s31));
  console.log('参考：攻めに固定された避けている人（向きを入れ替えられなかった呼び出し元）', JSON.stringify(r.stuck));
  console.log('W1（箱庭の場所に合わない語）', r.n.W1, JSON.stringify(Object.keys(r.bySc).filter(sc => r.bySc[sc].W1).reduce((o, sc) => { o[sc] = r.bySc[sc].W1; return o; }, {})));
  for (const k of Object.keys(r.ex)) if (r.ex[k].length) { console.log('--- ' + k); r.ex[k].forEach(x => console.log('  ' + x)); }
  if (r.err.length) { console.log('--- 例外'); r.err.slice(0, 20).forEach(x => console.log('  ' + x)); }
  console.log('pageerr', JSON.stringify(errors.slice(0, 5)));
  await browser.close();
})();
