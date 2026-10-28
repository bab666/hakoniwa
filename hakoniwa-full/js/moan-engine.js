/* 箱庭シミュレーター（R18版のみ）: 喘ぎの辞書のエンジン（HK.Moan）
   ■ 考え方
     ・言葉のない喘ぎ（短い声・吐息・鼻声・リズム）は口調に依らず全員で使い回す（moan-dict.js の HK.MOAN_SHARED。利用者が書き換えられる）
     ・言葉のある喘ぎは態度9種で書いた基盤（moan-said.js）を、口調の色を薄めて出す（咄嗟の声は素に戻る）：
       台詞の口調の変換（voice.js）は通さず（「」の頭に \u2060 の印）、一人称・二人称の置き換えだけ通す。敬語の基盤はくだけた形（K）に崩す（「やめて、ください」→「やめて」）。
       口調の辞書は、まれ（ctx.toneRate、既定 M.TONE_RATE＝0.25）に文末の語尾だけ当てる（語彙・前置き・笑い・効果は当てない）。
       口調ごとに書いた喘ぎ（ero-moan-tone.js）は基盤の後ろに下げ、ときどき（ctx.toneMoanRate、既定 M.TONE_MOAN_RATE＝0.25）だけ使う
     ・場面（乗り気・嫌がる・声を抑える・激しく突かれる・懇願・キス・口でしている・口でされる・攻め）× 段階の鍵で引く。鍵の一覧は moan-dict.js の先頭
   ■ 引き方
     HK.Moan.pick(S, who, 鍵, ctx)   … 鍵（'w1' など）で一つ選ぶ。ctx: { force 嫌がっている, deep 奥, late 後半, oral 口でされている, top 相手, p 部位の呼び方, talk 言葉の割合(0-1) }
     HK.Ero.moan(S, who, 段階0-2, ctx)（従来の呼び方）… 段階と ctx・主導権（who.eroDom）から鍵に読み替える
     HK.Moan.say(S, who, 場面, o, 元の表)（箱庭ごとの喘ぎ・小説調の場面から）… 場面（始まり・最中・果てる・攻め・キス・口）と o（嫌がる・声を殺す・小説調）から鍵を選ぶ
     本文の {m0}〜{m2} はこれまでどおり。{m:w1} {m:p} {m:k} のように鍵でも差し込める（HK.Ero.fill）
   ■ 優先順位
     住人ごとの上書き ＞ 利用者の口調の喘ぎ ＞ 利用者の態度の上書き ＞ 態度の基盤（moan-said.js。ときどき口調ごとの喘ぎ ero-moan-tone.js） ＞ 口調ごとの喘ぎ（ときどき）・ero-kit.js の表 ＞ 共通（利用者の上書き ＞ moan-dict.js）
     利用者の辞書の行は、書いたとおり（これまでどおり台詞の口調の変換を通す）
   ■ 利用者の辞書（高度設定「喘ぎの辞書」。HK.Moan.setUser(文字列)）
     [喘ぎ 共通 乗り気 1]            ← 共通の、乗り気の1段階目（短い喘ぎ）を置き換える。1行に1つ（「|」で区切って複数も可）
     [喘ぎ 共通 乗り気 1 追加]       ← 置き換えずに足す
     [喘ぎ 口調=ギャル 嫌がる 1]     ← その口調の人だけ（口調名か鍵。口調の喘ぎより優先）
     [喘ぎ 態度=強気 乗り気 2]       ← その態度の人の言葉の基盤を置き換える
     [喘ぎ 住人=アキラ 乗り気 3]     ← その住人だけ（いちばん優先）
     場面の名前：乗り気／嫌がる／声を抑える／激しく／懇願／キス／口でしている／口でされる／攻め（鍵 w r h p b k o l t でもよい）
   登場人物はすべて成人として扱う。全年齢版にはこのファイルを置かない */
(function () {
  'use strict';
  var HK = window.HK, E = HK && HK.Ero;
  if (!HK || !E) return;
  var MODES = {
    w: { label: '乗り気', stages: ['短い喘ぎ', '感じ始め', '理性崩壊', '限界の拒絶'] },
    r: { label: '嫌がる', stages: ['拒絶', '控えめな感じ始め', '甘くなり始め', '理性崩壊', '大きい喘ぎ（甘くない）'] },
    h: { label: '声を抑える', stages: ['ほぼ吐息', '漏れつつある', '漏れ喘ぎまくる'] },
    p: { label: '激しく', stages: ['素直', '拒絶が混ざる'] },
    b: { label: '懇願', stages: ['もっと', '部位を欲しがる', '焦らすな'] },
    k: { label: 'キス', stages: ['キス中'] },
    o: { label: '口でしている', stages: ['鼻声'] },
    l: { label: '口でされる', stages: ['乗り気', '嫌がる'] },
    t: { label: '攻め', stages: ['吐息', '声を我慢', '口でされて漏れる', 'かわいいと言う', 'もう限界', '謝りながら'] }
  };
  var MODE_BY_NAME = { '乗り気': 'w', '嫌がる': 'r', '声を抑える': 'h', '激しく': 'p', '激しく突かれる': 'p', '懇願': 'b', 'キス': 'k', 'キス中': 'k', '口でしている': 'o', '口でされる': 'l', '攻め': 't' };
  /* 言葉だけの鍵・言葉のない鍵・両方を混ぜる鍵 */
  var WORDS_ONLY = { w3: 1, r0: 1, b0: 1, b1: 1, b2: 1, t3: 1, t4: 1, t5: 1 };
  var MIX = { w1: 1, w2: 1, r2: 1, r3: 1, h1: 0.25 };
  /* 態度ごとの、言葉のある喘ぎを使う割合（感じ始めなどで「そこ気持ちいい」と言うかどうか） */
  var TALK = { proud: 0.5, stern: 0.35, tsun: 0.6, gentle: 0.6, devoted: 0.6, cool: 0.35, free: 0.75, shy: 0.3, polite: 0.45 };
  var ROUGH = { proud: 1, stern: 1, cool: 1, tsun: 1 }, SOFT = { gentle: 1, devoted: 1, shy: 1, polite: 1 };
  /* 従来の表（ero-kit.js の M、ero-moan-tone.js の s0/s1/s2）を鍵に読み替える */
  var LEGACY = { r0: 's0', h1: 's0', w1: 's1', r2: 's1', w2: 's2', r3: 's2' };
  var PART_DEF = { proud: 'ちんぽ', tsun: 'ちんぽ', free: 'ちんぽ', cool: 'ちんぽ' };
  /* 受け身の言葉（喘ぎの口調を決めた、攻めを選んだ人には使わない） */
  var TOP_NG = /奥|中に|なかに|ナカ|入って|入れて|挿れ|いれて|ちょうだい|ください|くださいまし|満たし|突いて|突かれ|壊れちゃ|孕|注いで|中で出|ほしい|欲しい/;

  /* SET_RATE：喘ぎの口調を決めた人は、口調の語尾・口調ごとの喘ぎを使う割合をこちらに上げる（決めた口調が聞こえるように） */
  var M = HK.Moan = { MODES: MODES, user: null, TONE_RATE: 0.25, TONE_MOAN_RATE: 0.25, SET_RATE: 0.5, map: null };
  M.keys = function () { var out = []; Object.keys(MODES).forEach(function (m) { MODES[m].stages.forEach(function (s, i) { out.push({ key: m + i, mode: m, stage: i, label: MODES[m].label + '・' + s }); }); }); return out; };
  M.label = function (key) { var m = MODES[key.charAt(0)], i = +key.slice(1); return m && m.stages[i] ? m.label + '・' + m.stages[i] : key; };

  /* ---------- 選び方 ---------- */
  function rng(S) { return (S && S.rng) || (S && S.int ? S : null); }
  function rand(S) { var r = rng(S); return r ? (typeof r === 'function' ? r() : r.float ? r.float() : Math.random()) : Math.random(); }
  function rint(S, n) { var r = rng(S); return r && r.int ? r.int(n) : Math.floor(rand(S) * n); }
  /* 一回の結果の中では同じ喘ぎをなるべく繰り返さない（ero-kit.js の pickFresh と同じ） */
  function fresh(S, list, tag) {
    if (!list || !list.length) return '';
    /* 一つの場面（記録）の中で使った喘ぎは、表をまたいで避ける（ero-kit.js の E.sceneAvoid） */
    if (E.sceneAvoid) list = E.sceneAvoid(S, list);
    /* 乱数そのもの（rng.int のある関数）を渡されたときは、その乱数に覚えておく */
    var st = S && S.rng ? S : S && S.int ? S : { rng: rng(S) };
    var seen = st._eroSeen = st._eroSeen || {}, used = seen[tag] = seen[tag] || [];
    var free = list.filter(function (x) { return used.indexOf(x) < 0; });
    if (!free.length) { var old = list.slice().sort(function (a, b) { return used.indexOf(a) - used.indexOf(b); }); free = old.slice(0, Math.max(1, Math.ceil(old.length / 2))); }
    var x = free[rint(S, free.length)], i = used.indexOf(x); if (i >= 0) used.splice(i, 1); used.push(x);
    return E.sceneMark ? E.sceneMark(S, x) : x;
  }
  /* 喘ぎの口調（住人の設定「喘ぎの口調」c.moanTone。空ならいつもの口調）：喘ぎの声だけ、この口調とその態度で作る（普段は作った口調で話す人の、素の声）。
     住人の写しに moanTone を持たない箱庭もあるので、HK.simulate の入口で名前→口調の対応表（M.map）を作り、who.moanTone → 対応表 の順に見る。全年齢モードでは何もしない */
  function moanToneOf(who) {
    if (!who || HK.SAFE_ON) return '';
    /* 名前の伏せ字（voice.js の HK.NameGuard）の中では、元の名前で表を引く */
    var nm = who.name && HK.NameGuard && HK.NameGuard.stack.length ? HK.NameGuard.decAll(who.name) : who.name;
    var t = who.moanTone || (M.map && nm && M.map[nm]) || '';
    return t && (!HK.toneValid || HK.toneValid(t)) ? t : '';
  }
  /* ---------- 夜の性格（attr.js の HK.Attr.nightOf。2026-10-27） ----------
     夜の性格を、喘ぎの言葉の基盤にする態度（moan-said.js・ero-kit.js の M の態度9種）と鍵の選び方に効かせる。口調（語尾）は口調のまま（喘ぎの口調があればそちら）。
       サド sadist   → 強気 proud の基盤（受けでも挑む声・荒い主導）。攻めのときは「かわいいと言う」（t3）が増える
       マゾ maso     → 健気 devoted の基盤。懇願（b0・b1）と、限界を過ぎた声（w3）が増える
       意地悪 mean   → 奔放 free の基盤（余裕のある、からかう声）。攻めのときは t3 が増える
       甘々 sweet    → 穏やか gentle の基盤。言葉のある喘ぎが増える
       恥じらい shy  → 恥じらい shy の基盤。声を抑える（h）が増え、言葉が減る
       相手に合わせる match → 相手の夜の性格から（サド↔マゾ・意地悪↔恥じらい・甘々↔甘々。attr.js の A.MATCH）
     受け口（呼ぶ側が渡せるもの）：ctx.night（'sadist'・'maso'・'mean'・'sweet'・'shy'・'match'・'none'。呼ぶ側が決めた夜の性格。いちばん優先）、
       ctx.partner または ctx.top（相手の住人。相手ごとの夜の性格 nightFor と「相手に合わせる」を引く）。
       HK.Moan.pick(S, who, 鍵, ctx)・HK.Ero.moan(S, who, 段階, ctx)・HK.Moan.say(S, who, 場面, o) の ctx／o に入れる。
       渡されなければ、住人の夜の性格（全体の設定）と、いまの場面の攻め（HK.NovelMoan.top）を相手として引く。全年齢モードでは何もしない */
  var NIGHT_PS = { sadist: 'proud', maso: 'devoted', mean: 'free', sweet: 'gentle', shy: 'shy' };
  M.NIGHT_PS = NIGHT_PS;
  M.nightOf = function (who, ctx) {
    if (!who || HK.SAFE_ON) return '';
    var A = HK.Attr, NM = HK.NovelMoan, v = ctx && typeof ctx === 'object' && ctx.night ? String(ctx.night) : '';
    var p = (ctx && typeof ctx === 'object' && (ctx.partner || ctx.top)) || (NM && NM.top && NM.top !== who ? NM.top : null);
    var NG = HK.NameGuard, pl = function (n) { return n && NG && NG.stack.length ? NG.decAll(n) : n; };
    var C = M.nmap, cw = C && who.name ? C[pl(who.name)] : null, cp = C && p && p.name ? C[pl(p.name)] : null;
    /* 住人の写しに夜の性格を持たない箱庭もあるので、入力の住人（M.nmap）からも引く */
    function raw(c, o) { return c ? ((o && c.nightFor && c.nightFor[o.i]) || c.night || '') : ''; }
    if (!v) { v = A && A.nightOf ? A.nightOf(who, p) : ''; if (!v && cw) v = raw(cw, cp); }
    if (v === 'match') { var pv = (p && ((p.nightFor && who.i != null && p.nightFor[who.i]) || p.night)) || raw(cp, cw); v = (A && A.MATCH && A.MATCH[pv]) || ''; }
    return NIGHT_PS[v] ? v : '';
  };
  function psOf(who, ctx) {
    var nt = M.nightOf(who, ctx);
    if (nt) return NIGHT_PS[nt];
    return psBase(who);
  }
  function psBase(who) {
    var mt = moanToneOf(who);
    if (mt && HK.personaOf) return HK.personaOf(Object.assign({}, who, { tone: mt })) || 'gentle';
    return (who && (HK.personaOf ? HK.personaOf(who) : who.persona)) || 'gentle';
  }
  /* 喘ぎには住人の語尾の設定・住人の辞書（tone-ending.js の e:… の口調）を当てない：e:… ならベースの口調で引く */
  function toneOf(who) {
    var t = moanToneOf(who) || (who && HK.toneOf ? HK.toneOf(who) : null) || psBase(who), eb = t && HK.toneOpt ? HK.toneOpt(t, 'endingOf') : null;
    return eb || t;
  }
  /* 男性の喘ぎから、態度の表・口調の表の女性的な語尾（「いいわ」「じょうず、ね」「だめよ」「あら」）を外す（voice.js の V.unfem。先頭の印 \u2060 は残す） */
  function unfem(s, who) {
    var V = HK.Voice;
    if (!s || !who || who.gender !== 'm' || !V || !V.unfem) return s;
    var w = { tone: toneOf(who) };
    return s.charAt(0) === NOTONE ? NOTONE + V.unfem(s.slice(1), w) : V.unfem(s, w);
  }
  M.unfem = unfem;
  /* ---------- 口調・性別に合わない語尾を直す（2026-10-27。喘ぎ・山場の声だけ。点検は hakoniwa-tools/tone-check/moan-audit.js） ----------
     基盤（態度の表）・共通の表・口調の表のどこから来た声でも、話し手の口調と性別に合わせて最後に整える。
     ・はっきりした口調（強気・兄貴分・厳格・冷静・紳士・のじゃ など）：お願いの形の拒み（やめて・待って・離して・見ないで・お願い）を言い切りに（やめろ・待て・離せ・見るな・頼む）、
       泣き声の拒み（いや・やだ）を「むり」に、女性的な語尾（〜のよ・〜かしら）を外す
     ・やわらかい口調（穏やか・健気・内気 など）と敬語の口調：荒い命令・語尾（しろ・来い・やめろ・くそ・〜ねえ・〜ぞ・〜よな・「お前」）をやわらかく（して・来て・やめて・〜ない・〜よ・〜よね・二人称）
     ・のじゃ：標準語の語尾（〜だね・〜だよ・〜でしょ・〜ない）を（〜じゃな・〜じゃ・〜じゃろ・〜ぬ）に。関西弁：（〜ない・〜じゃん・〜だね・〜だよ）を（〜へん・〜やん・〜やね・〜やで）に
     ・古風・尊大な口調（紳士・尊大・神）：〜ちゃう を 〜てしまう に
     ・女性（男性的な語尾が個性の口調を除く）：〜ぜ・〜ぞ・断定の〜だろ・〜ねえ を外す。男性：女性的な語尾を外す（unfem）
     咄嗟の声（言葉のない声・「だめ」「むり」）はそのまま。利用者の辞書の行は直さない。全年齢モードでは何もしない */
  function grp(s) { var o = {}; s.split(' ').forEach(function (k) { o[k] = 1; }); return o; }
  var FIT_FIRM = grp('proud aniki stern cool calm gentleman noja sondai god ronkyaku flat_plain yankee');
  var FIT_SOFT = grp('gentle gentle_n gentle_m devoted devoted_p shy honwaka boku_n tsun_soft mukuchi_ne polite ojou kohai genki keigo_sarc keigo_bossy keigo_flat otaku keigo_twist chara_down');
  var FIT_GRAND = grp('gentleman sondai god'), FIT_MASC = grp('yankee aniki hero chara noja gentleman sondai god otaku ronkyaku flat_plain proud');
  var FE = '(?=[…‥。！？!?、」♡〜ー　\\sっッ]|$)', FL = '(^|[、。…‥「\\s　♡！!？?っ゛])';
  function fw(a, b) { return [new RegExp(FL + '(?:' + a + ')' + FE, 'g'), '$1' + b]; }
  /* 拒みの後ろが「くれ」「くんねえ」「ほしい」なら、お願いの形でも言い切りの頼み（はっきりした口調でも使う） */
  /* 泣き声の拒み（「いや、」の言い直しは拒みではないので数えない） */
  function fn(a, b) { return [new RegExp(FL + '(?:' + a + ')(?=[っッぁあー！!♡]|[…‥]+(?:[っッ♡！!」]|$)|$)', 'g'), '$1' + b]; }
  function fq(a, b) { return [new RegExp(FL + '(?:' + a + ')(?![、…‥っ]*(?:くれ|くん|ほし|欲し|もら|おくれ|たも|おらぬ|やる))' + FE, 'g'), '$1' + b]; }
  var FIT_FIRM_R = [
    fq('やめて', 'やめろ'), fq('止めて', '止めろ'), fq('とめて', 'とめろ'), fq('待って', '待て'), fq('止まって', '止まれ'), fq('とまって', 'とまれ'), fq('まって', 'まて'), fq('離して', '離せ'), fq('はなして', 'はなせ'),
    fq('見ないで', '見るな'), fq('触らないで', '触るな'), fq('さわらないで', 'さわるな'), fq('抜いて', '抜け'), fq('来ないで', '来るな'), fq('動かないで', '動くな'), fq('入れないで', '入れるな'),
    fq('許して', '許せ'), [new RegExp(FL + '(?:お願い|おねがい)(?!、?だ(?!め))' + FE, 'g'), '$1頼む']
  ];
  /* 泣き声の拒み（喘ぎの声だけ。台詞の「いや……」はためらいのことがあるので、light では直さない） */
  var FIT_CRY_R = [fn('いや[ぁあ]+|やだ[ぁあ]+', 'むりぃ'), fn('いや|やだ', 'むり'), fn('やぁ+', 'くぅ'), fn('やっ', 'くっ')];
  var FIT_SOFT_R = [
    [new RegExp('(^|[、…‥「\\s　♡！!くにと])しろ(?:よ)?' + FE, 'g'), '$1して'], fw('来い', '来て'), fw('こい', 'きて'), fw('鳴け', '鳴いて'), fw('寄越せ', 'ちょうだい'), fw('入れろ', '入れて'), fw('いれろ', 'いれて'),
    fw('締めろ', '締めて'), fw('やめろ', 'やめて'), fw('止めろ', '止めて'), fw('止まれ', '止まって'), fw('とまれ', 'とまって'), fw('離せ', '離して'), fw('離れろ', '離れて'), fw('触るな|触んな', '触らないで'),
    fw('見るな', '見ないで'), fw('動くな', '動かないで'), fw('来るな', '来ないで'), fw('抜け', '抜いて'), fw('ふざけんな|ざけんな', 'ふざけないで'), [/(^|[、…‥「\s　♡！!っ])(?:くそ|クソ)(っ?)/g, '$1もう$2'],
    [new RegExp('([めけせてねれべげえ])ろ' + FE, 'g'), '$1て'], [new RegExp('([すくつぬむぶるう])かよ' + FE, 'g'), '$1もんか'], [new RegExp('かよ' + FE, 'g'), 'なの'],
    [new RegExp('だめだ(?!って)' + FE, 'g'), 'だめ'], [new RegExp('むりだ(?!って)' + FE, 'g'), 'むり'], [new RegExp('無理だ(?!って)' + FE, 'g'), '無理'], [new RegExp('よな' + FE, 'g'), 'よね']
  ];
  /* 男性的な語尾（女性と、やわらかい・敬語の口調） */
  var FIT_MASC_R = [
    [new RegExp('じゃねえ(?:か)?' + FE, 'g'), 'じゃない'], [new RegExp('くんねえ' + FE, 'g'), 'くれない'], [new RegExp('(?<=[らまわがばきみりえけせてめれげべ])(?<![だん]が)ねえ' + FE, 'g'), 'ない'], [new RegExp('([もが持勝立]た)ねえ' + FE, 'g'), '$1ない'],
    [new RegExp('(?<=[ぁ-ゖ一-鿿])(?<![なせ])ぜ' + FE, 'g'), 'よ']
  ];
  /* 断定の「だろ」→「でしょ」（問いの「何・どう・なぜ … だろ」は女性でも使うので外さない） */
  var FIT_DARO = new RegExp('だろ(?:う)?(?:が)?(?=[…‥。！!、」♡〜ー　\\sっッ]|$)', 'g');
  function daro(q) { return Q_DARO.test(q) ? q : q.replace(FIT_DARO, 'でしょ'); }
  var FIT_ZO = [new RegExp('(?<=[ぁ-ゖ一-鿿])(?<![どなうーそ])ぞ' + FE, 'g'), 'よ'];
  var Q_DARO = /(?:何|なに|なん|どう|なぜ|どこ|いつ|誰(?!か)|どれ|どんな)[^。！？!?]*だろ/;
  var FIT_NOJA_R = [
    [new RegExp('(?:だよね|だね)' + FE, 'g'), 'じゃな'], [new RegExp('だよ' + FE, 'g'), 'じゃ'], [new RegExp('でしょう?' + FE, 'g'), 'じゃろう'], [new RegExp('じゃん' + FE, 'g'), 'じゃろう'],
    [new RegExp('かしら' + FE, 'g'), 'かのう'], [new RegExp('のよ' + FE, 'g'), 'のじゃ'], [new RegExp('わね' + FE, 'g'), 'のう'], [new RegExp('わよ' + FE, 'g'), 'ぞ'], [new RegExp('だもん' + FE, 'g'), 'じゃもん'],
    [/あらあら/g, 'おやおや'], [new RegExp('([らまわがばかたなやれけせてねめえげべりき])ない' + FE, 'g'), '$1ぬ']
  ];
  var FIT_KANSAI_R = [
    [new RegExp('いけない' + FE, 'g'), 'あかん'], [new RegExp('([らまわがばかさたなやれけせてねめえげべ])ない' + FE, 'g'), '$1へん'], [new RegExp('([りきみびちにぎ])ない' + FE, 'g'), '$1ひん'],
    [new RegExp('じゃん' + FE, 'g'), 'やん'], [new RegExp('だよね' + FE, 'g'), 'やんな'], [new RegExp('だね' + FE, 'g'), 'やね'], [new RegExp('だよ' + FE, 'g'), 'やで'], [new RegExp('でしょう?' + FE, 'g'), 'やろ'],
    [new RegExp('じゃない(か)?' + FE, 'g'), 'やない$1']
  ];
  var FIT_GRAND_R = [[new RegExp('ちゃう' + FE, 'g'), 'てしまう'], [new RegExp('ちゃった' + FE, 'g'), 'てしまった'], [new RegExp('じゃう' + FE, 'g'), 'でしまう'], [new RegExp('じゃん' + FE, 'g'), 'ではないか'], [new RegExp('でしょ' + FE, 'g'), 'だろう']];
  function runR(s, R) { R.forEach(function (r) { s = s.replace(r[0], r[1]); }); return s; }
  /* 利用者の辞書の行（書いたまま出すので直さない） */
  var USER_SET = null, USER_OF = null;
  M.isUser = function (s) {
    var U = M.user; if (!U || !s) return false;
    if (USER_OF !== U) {
      USER_OF = U; USER_SET = {};
      var add = function (o) { if (!o) return; Object.keys(o).forEach(function (k) { var v = o[k]; if (Array.isArray(v)) v.forEach(function (x) { USER_SET[String(x).replace(/[\u2060♡\s　]/g, '')] = 1; }); else add(v); }); };
      add(U.shared); add(U.tone); add(U.persona); add(U.who);
    }
    return !!USER_SET[String(s).replace(/[\u2060♡\s　]/g, '')];
  };
  /* light：喘ぎの表にない、言い換えを通る山場の台詞（voice.js から。泣き声の拒みは直さない） */
  function fit(s, who, light) {
    if (!s || typeof s !== 'string' || !who || HK.SAFE_ON) return s;
    var mk = s.charAt(0) === NOTONE ? NOTONE : '', q = mk ? s.slice(1) : s, q0 = q, t = toneOf(who), g = who.gender, V = HK.Voice;
    /* 男性の女性的な語尾を先に外す（外したあとの「じょうず、だね」も、のじゃ・関西弁の語尾に直るように） */
    /* 男性的な語尾が個性の口調（チャラい・ヤンキー・熱血 など）の男性の「〜わ」（来るわ・頼むわ）は男性の言い方なので残す（関西弁の扱いで「〜わ」を外さない） */
    if (g === 'm' && V && V.unfem) q = V.unfem(q, { tone: FIT_MASC[t] && t !== 'noja' ? 'kansai' : t });
    if (t === 'noja' || t === 'kansai') { q = kForm(q); q = runR(q, t === 'noja' ? FIT_NOJA_R : FIT_KANSAI_R); }
    if (FIT_FIRM[t]) {
      q = runR(q, FIT_FIRM_R);
      if (!light) q = runR(q, FIT_CRY_R);
      /* 女性的な語尾（〜のよ・〜かしら）。のじゃ・古風な口調の「〜わ」（笑わせるわ）は残す（関西弁の扱いで「〜わ」を外さない） */
      if (V && V.unfem && t !== 'noja') q = V.unfem(q, { tone: FIT_GRAND[t] ? 'kansai' : t });
    }
    if (FIT_SOFT[t]) {
      q = daro(runR(q, FIT_SOFT_R.concat(FIT_MASC_R)));
      if (t !== 'otaku') q = q.replace(FIT_ZO[0], FIT_ZO[1]);
      if (V && V.applyYou && /(?:お前|おまえ|てめえ|てめぇ|貴様)/.test(q)) q = V.applyYou(q, who.you || (HK.toneYou ? HK.toneYou(t, g) : '') || 'あなた');
    }
    if (FIT_GRAND[t]) { q = runR(q, FIT_GRAND_R); if (V && V.applyYou && /(?:あんた|てめえ)/.test(q)) q = V.applyYou(q, who.you || (HK.toneYou ? HK.toneYou(t, g) : '') || '君'); }
    /* 女性の男性的な語尾（男性的な語尾が個性の口調・関西弁を除く） */
    if (g === 'f' && !FIT_MASC[t] && t !== 'kansai' && !FIT_SOFT[t]) {
      q = daro(runR(q, FIT_MASC_R)).replace(FIT_ZO[0], FIT_ZO[1]);
    }
    return q === q0 ? s : mk + q;
  }
  M.fit = function (s, who, light) { return M.isUser(s) ? s : fit(s, who, light); };
  function hasM(c) { var P = HK.Pos; if (!c) return false; if (P && P.genSet && P.genSet(c)) return P.hasM(c); return c.gender === 'm' || !!(P && P.futa && P.futa(c)); }
  function fallenOf(who) { return !!(who && (who.fallen || who.fell || (who.corrupt || 0) >= 75)); }
  function count(S, who) { var st = S && S.rng ? S : {}; var m = st._eroCnt = st._eroCnt || {}, k = (who && who.name) || '?'; return (m[k] = (m[k] || 0) + 1); }

  /* 言葉のある候補（優先順：住人（pick で先に見る） ＞ 利用者の口調 ＞ 利用者の態度 ＞ 態度の基盤（ときどき口調の喘ぎ） ＞ 口調の喘ぎ（ときどき）・従来の態度の表）。
     { list, src } を返す。src … 'user' 利用者の行（書いたまま） ／ 'tone' 口調ごとの喘ぎ（書き下ろし。口調の味つき） ／ 'base' 素の言葉（口調の色を薄めて出す） */
  function wordPool(S, who, key, ctx) {
    var U = M.user, ps = psOf(who, ctx), tone = toneOf(who), lg = LEGACY[key];
    if (U && U.tone[tone] && U.tone[tone][key]) return { list: U.tone[tone][key], src: 'user' };
    if (U && U.persona[ps] && U.persona[ps][key]) return { list: U.persona[ps][key], src: 'user' };
    var TM = E.TONE_MOAN && E.TONE_MOAN[tone], tl = TM && lg && TM[lg] && TM[lg].length ? TM[lg] : null;
    var tr = ctx && ctx.toneMoanRate != null ? ctx.toneMoanRate : moanToneOf(who) ? M.SET_RATE : M.TONE_MOAN_RATE;
    if (tl && rand(S) < tr) return { list: tl, src: 'tone' };
    var SD = HK.MOAN_SAID && HK.MOAN_SAID[ps];
    if (SD && SD[key] && SD[key].length) return { list: SD[key], src: 'base' };
    var LM = E.MOAN && E.MOAN[ps];
    if (LM && lg && LM[{ s0: 0, s1: 1, s2: 2 }[lg]]) return { list: LM[{ s0: 0, s1: 1, s2: 2 }[lg]], src: 'base' };
    return tl ? { list: tl, src: 'tone' } : null;
  }
  /* ---------- 口調の色を薄める（咄嗟の声は素に戻る） ---------- */
  var NOTONE = '\u2060';   /* 「」の頭のこの印で、voice.js の台詞の言い換えを通さない */
  var TL = '(?=[…‥っッ♡！？!?。、　\\s〜ー]|$)';
  function kr(src, to) { return [new RegExp(src + TL, 'g'), to]; }
  /* 敬語の基盤をくだけた形（K）に。長いもの・特別なものから */
  var KFORM = [
    kr('そのようなお顔を、?なさらないで(?:ください)?', 'そんな顔、しないで'), kr('(?:お願い|おねがい)、?(?:いたします|します|です)', 'おねがい'),
    kr('お、おやめ、?(?:ください|くださ)', 'や、やめて'), kr('おやめ、?(?:ください|くださ)', 'やめて'), kr('もっと、?ください', 'もっと、して'), kr('お([一-鿿々]{1,2})し、?ください', '$1して'), kr('([てで])、?ください(?:まし)?', '$1'),
    kr('く、ください', 'ちょ、ちょうだい'), kr('ください', 'ちょうだい'), kr('申し訳、?ありません', 'ごめん'), kr('す、すみません', 'ご、ごめん'), kr('すみません', 'ごめん'),
    kr('失礼、?いたしました', 'ごめん'), kr('いけません', 'だめ'), kr('ちが、?います', 'ちが、う'), kr('当たって、?い?ます', '当たって、る'), kr('もちません', 'もたない'),
    kr('止まれません', '止まれない'), kr('とまりません', 'とまらない'), kr('足りません', '足りない'), kr('出ます', '出る'), kr('いき、?ます', 'いく'), kr('イきます', 'イく'),
    kr('イっちゃいます', 'イっちゃう'), kr('イってしまいます', 'イっちゃう'), kr('達して、?しまいます', 'イっちゃう'), kr('失礼、?いたします', 'ごめん'), kr('いたします', 'します'), kr('します', 'する'), kr('お上手、?です', 'じょうず'),
    kr('よい、?です', 'いい'), kr('かわいらしい、?ですね', 'かわいい、ね'), kr('(、?)ですね', '$1だね'), kr('、?です', '')
  ];
  var KEIGO = /(?:ですね|です|ます|ません|ませ|ください|くださ|ござ|いたし|いただ|(?:^|[^ん])なさい)(?=[…‥っッ♡！？!?。、　\s〜ー]|$)|なさらな|申し訳|お控え/;
  function kForm(s) {
    if (!KEIGO.test(s)) return s;
    var s0 = s;
    KFORM.forEach(function (r) { s = s.replace(r[0], r[1]); });
    /* 語尾を外して「……」が重なったら一つに（元からの重なりは残す） */
    return /[…‥]{3,}/.test(s0) ? s : s.replace(/[…‥]{3,}/g, '……');
  }
  /* 文末の語尾だけ口調の辞書を当てる（tone-engine.js の辞書の [文末] だけを使う。語彙・規則・前置き・笑い・効果は当てない）。最後の区切り（全角空白）の後ろだけ */
  var END_DICT = {};
  function endsOnly(s, who) {
    var T = HK.Tone, tone = toneOf(who), d = T && T.dictOf ? T.dictOf(tone) : null;
    if (!d || !d.ends || !d.ends.length || !T.apply) return s;
    var md = END_DICT[tone];
    /* 1文字の項目（よ=で・な=のう・だ=じゃ など）は、喘ぎの切れ端（「こんな」「やだ」）にも当たって崩れるので使わない */
    if (!md || md.src !== d) md = END_DICT[tone] = { src: d, base: d.base, ends: d.ends.filter(function (e) { return e[0].replace(/[？?]$/, '').length >= 2; }), words: [], rules: {}, effects: {} };
    if (!md.ends.length) return s;
    var cut = s.lastIndexOf('　'), head = cut >= 0 ? s.slice(0, cut + 1) : '', tail = s.slice(cut + 1);
    try { return head + T.apply(tail, md, who); } catch (e) { return s; }
  }
  /* 一人称・二人称だけそろえる（基盤には書いていないが、書いたときのため。「私」「あなた」） */
  function persons(s, who) {
    var V = HK.Voice;
    if (!V || !who) return s;
    if (/私/.test(s) && V.replaceFP) s = V.replaceFP(s, who);
    if (/あなた/.test(s) && V.applyYou) { var yw = who.you || (HK.toneYou ? HK.toneYou(toneOf(who), who.gender) : ''); if (yw) s = V.applyYou(s, yw); }
    return s;
  }
  /* 素の言葉の喘ぎを仕上げる：（まれに）文末の語尾だけ口調 → 一人称・二人称 → 台詞の言い換えを通さない印 */
  function plainOut(S, who, s, ctx) {
    if (!s || s.charAt(0) === NOTONE) return s;
    var r = ctx && ctx.toneRate != null ? ctx.toneRate : moanToneOf(who) ? M.SET_RATE : M.TONE_RATE;
    if (r > 0 && rand(S) < r) s = endsOnly(s, who);
    return NOTONE + persons(s, who);
  }
  M.kForm = kForm;
  /* ほかの喘ぎの表（ero-kit.js の E.moan など）も、喘ぎの口調で引けるように */
  M.toneOf = toneOf;
  M.psOf = psOf;
  M.moanToneOf = moanToneOf;
  /* 箱庭の本文へ出す喘ぎ（E.moan・{m:鍵}・HK.Moan.say）は、言葉のない声も台詞の言い換えを通さない（無口の「短くする」などで崩れないように）。
     利用者の辞書の行（M.lastSrc＝'user'）だけは、これまでどおり言い換えを通す。HK.Moan.pick を直に呼ぶ所（キスの声 k0 など）は、作風（♡を残すか）が分からないので印を付けない */
  function bare(s) { return s && s.charAt(0) !== NOTONE && M.lastSrc !== 'user' ? NOTONE + s : s; }
  function sharedPool(key) { var U = M.user, SH = HK.MOAN_SHARED || {}; if (U && U.shared[key]) return U.shared[key]; return SH[key] || null; }
  /* 部位の呼び方（{p}）を埋める。相手に男性器がなければ、その行は使わない */
  function fillPart(list, who, ctx) {
    var p = ctx && ctx.p ? ctx.p : ctx && ctx.top && hasM(ctx.top) ? (PART_DEF[psOf(who, ctx)] || 'おちんちん') : null;
    var out = list.filter(function (x) { return p || x.indexOf('{p}') < 0; });
    return p ? out.map(function (x) { return x.replace(/\{p\}/g, p); }) : out;
  }
  /* 濁点喘ぎ：設定がオンの人だけ。口調の濁点の表があればそれ、なければ文字を濁らせる */
  function dakuize(S, s) {
    var n = 0;
    return s.replace(/([あおん])(?=[、…っ♡！ぁ]|$)/g, function (m, ch) { if (n >= 2 || rand(S) < 0.4) return m; n++; return ch + '゛'; });
  }
  function dakuOk(S, who, key, ctx) {
    if (!E.dakuOf || !E.dakuOf(who)) return false;
    var m = key.charAt(0), st = +key.slice(1), fal = fallenOf(who), late = !!(ctx && ctx.late);
    var p = (key === 'w2' || key === 'r3' || key === 'r4') ? 0.8 : (key === 'w3' || key === 'p0' || key === 'p1') ? 0.5 : (key === 'w1' || key === 'r2') ? ((ctx && (ctx.deep || ctx.force)) || late || fal ? 0.6 : 0) : (m === 'h' && st > 0 && (fal || (ctx && ctx.force))) ? 0.35 : 0;
    return p > 0 && rand(S) < p;
  }
  /* 激しく突かれているときのリズムの喘ぎ（部品からその場で組む） */
  M.pound = function (S, who, refuse, sweet) {
    var P = HK.MOAN_POUND; if (!P) return '';
    var n = 3 + rint(S, 6), out = [], noAt = refuse ? 1 + rint(S, Math.max(1, n - 1)) : -1, no2 = refuse && n > 5 && rand(S) < 0.5 ? n - 1 : -1;
    for (var i = 0; i < n; i++) {
      var list = (i === noAt || i === no2) ? (sweet && rand(S) < 0.5 ? P.noSweet : P.no) : (sweet && rand(S) < 0.3 ? P.unitSweet : P.unit);
      var u = list[rint(S, list.length)];
      /* 声が詰まる「っ」をときどき足す（もう付いているもの・言葉には足さない） */
      if (list === P.unit && !/っ$/.test(u) && rand(S) < 0.35) u += 'っ';
      out.push(u);
      if (i < n - 1) out.push(P.sep[rint(S, P.sep.length)]);
    }
    var tails = sweet ? P.tailSweet : P.tail;
    return out.join('') + tails[rint(S, tails.length)];
  };

  /* 鍵で一つ選ぶ */
  M.pick = function (S, who, key, ctx) {
    ctx = ctx || {};
    if (!MODES[key.charAt(0)] || !MODES[key.charAt(0)].stages[+key.slice(1)]) key = 'w0';
    var U = M.user, ps = psOf(who, ctx), out = null, tag = (who && who.name) + '.' + key;
    /* 住人ごとの上書き */
    M.lastSrc = 'user';
    if (U && who && who.name && U.who[who.name] && U.who[who.name][key]) out = fresh(S, fillPart(U.who[who.name][key], who, ctx), tag);
    if (out == null || out === '') {
      M.lastSrc = 'shared';
      var wantWords = WORDS_ONLY[key] ? true : MIX[key] ? rand(S) < (ctx.talk != null ? ctx.talk : (MIX[key] < 1 ? MIX[key] : (TALK[ps] || 0.5))) : false;
      var wp0 = wantWords ? wordPool(S, who, key, ctx) : null, wp = wp0 ? fillPart(wp0.list, who, ctx) : null;
      /* 喘ぎの口調を決めた人が自分で攻めを選んでいれば、別の口調の喘ぎから受け身の言葉（奥・中に・ちょうだい など）を外す（残らなければ言葉のない声） */
      if (wp && moanToneOf(who) && HK.Pos && HK.Pos.hardTop && HK.Pos.hardTop(who)) { wp = wp.filter(function (x) { return !TOP_NG.test(x); }); if (!wp.length) wp = null; }
      /* 素の言葉は敬語を崩す（崩しきれない行は、崩せる行があれば使わない） */
      if (wp && wp0.src === 'base') { wp = wp.map(kForm); var wk = wp.filter(function (x) { return !KEIGO.test(x); }); if (wk.length) wp = wk; }
      /* 候補がこの場面ですべて使用済み（候補が1つの表など）なら、言葉のない声・近い鍵に回す（同じ場面で同じ喘ぎを2回出さない） */
      if (wp && wp.length && E.sceneUsed && wp.every(function (x) { return E.sceneUsed(S, x); })) wp = null;
      if (wp && wp.length) { M.lastSrc = wp0.src; out = fresh(S, wp, tag + '.' + wp0.src); if (wp0.src === 'base') out = plainOut(S, who, out, ctx); }
      else if (key === 'p0' || key === 'p1') { var pp = sharedPool(key); if (pp && U && U.shared[key]) M.lastSrc = 'user'; out = pp && rand(S) < 0.5 ? fresh(S, pp, tag) : (M.lastSrc = 'shared', M.pound(S, who, key === 'p1', !ROUGH[ps] || fallenOf(who))); }
      else {
        var sp = sharedPool(key);
        if (sp && U && U.shared[key]) M.lastSrc = 'user';
        if (!sp || !sp.length) {
          /* 言葉だけの鍵で候補がないとき（部位の行が使えない など）は近い鍵に */
          var alt = { b1: 'b0', b0: 'w1', b2: 'w1', w3: 'w2', r0: 'r1', t3: 't1', t4: 't1', t5: 't1' }[key];
          return alt ? M.pick(S, who, alt, ctx) : '……っ';
        }
        out = fresh(S, sp, tag);
      }
    }
    if (!out) return '……っ';
    if (dakuOk(S, who, key, ctx)) {
      var TM = E.TONE_MOAN && E.TONE_MOAN[toneOf(who)];
      if (TM && TM.daku && TM.daku.length && (key === 'w2' || key === 'r3') && rand(S) < 0.6) { M.lastSrc = 'tone'; return fit(fresh(S, TM.daku, tag + '.daku'), who); }
      out = dakuize(S, out);
    }
    /* 利用者の辞書の行（書いたまま）は直さない。それ以外は口調・性別に合わない語尾を整える（男性の女性的な語尾も） */
    return M.lastSrc === 'user' ? out : fit(out, who);
  };

  /* ---------- 従来の呼び方（段階 0〜2）を鍵に読み替える ---------- */
  var moan0 = E.moan;
  E.moan = function (S, who, stage, ctx) {
    var cx = ctx && typeof ctx === 'object' ? ctx : { deep: !!ctx };
    var st = Math.max(0, Math.min(2, stage | 0)), ps = psOf(who, cx), nt = M.nightOf(who, cx), fal = fallenOf(who), n = count(S, who), late = cx.late || n > 6, key;
    if (who && who.eroDom) {
      if (st === 0) key = cx.oral ? 't2' : rand(S) < 0.5 ? 't0' : 't1';
      else if (st === 1) key = cx.force && SOFT[ps] && rand(S) < 0.35 ? 't5' : rand(S) < (nt === 'sadist' || nt === 'mean' ? 0.8 : 0.55) ? 't3' : 't1';
      else key = cx.force && SOFT[ps] && rand(S) < 0.25 ? 't5' : 't4';
      /* 従来の主導権の喘ぎ（ero-kit.js の DOM）も候補に残す：荒い／やわらかい */
      if (st < 2 && rand(S) < 0.35 && moan0) return fit(plainOut(S, who, kForm(moan0.call(this, S, who, st, ctx)), cx), who);
      return bare(M.pick(S, who, key, cx));
    }
    if (cx.oral) key = cx.force ? 'l1' : 'l0';
    else if (cx.force) {
      if (st === 0) key = n <= 2 ? 'r0' : 'r1';
      else if (st === 1) key = late || fal ? 'r3' : 'r2';
      else key = fal ? 'r3' : ROUGH[ps] && rand(S) < 0.4 ? 'r4' : 'r3';
      if (cx.deep && st > 0 && rand(S) < 0.3) key = 'p1';
    } else {
      if (st === 0) key = late ? 'h2' : n <= 2 ? 'h0' : 'h1';
      /* 夜の性格：マゾは懇願・限界の声が増え、恥じらいは声を抑える（乱数の引き方は、夜の性格がなければ今までどおり） */
      else if (st === 1) { var r1 = rand(S); key = r1 < (nt === 'maso' ? 0.45 : 0.15) ? (nt === 'maso' && r1 < 0.15 ? 'b1' : 'b0') : nt === 'shy' && r1 > 0.6 ? 'h1' : 'w1'; }
      else if (nt === 'shy' && rand(S) < 0.4) key = 'h2';
      else key = (late || nt === 'maso') && rand(S) < (nt === 'maso' ? 0.45 : 0.3) ? 'w3' : 'w2';
      if (cx.deep && st > 0 && rand(S) < 0.3) key = fal || late ? 'p1' : 'p0';
    }
    return bare(M.pick(S, who, key, cx));
  };
  /* 本文の {m:鍵} を埋める（{m0}〜{m2}・{s:…} は ero-kit.js の E.fill がそのまま） */
  var fill0 = E.fill;
  E.fill = function (S, text, who) {
    var t = String(text).replace(/\{m:([a-z]\d?)\}/g, function (m, k, at, all) {
      if (k.length === 1) k += '0';
      var cx = E.ctxOf(all, at);
      if (k === 'p') k = cx.force || fallenOf(who) ? 'p1' : 'p0';
      return bare(M.pick(S, who, k, cx));
    });
    return fill0.call(this, S, t, who);
  };

  /* ---------- 箱庭ごとの場面から引く（小説調・態度別の古い表の代わり） ----------
     HK.Moan.say(S, who, kind, o, old)
       kind … 'start' 始まり ／ 'mid' 最中 ／ 'climax' 受けが果てる ／ 'top' 攻めが果てる ／ 'topmid' 攻めの最中の声 ／ 'kiss' キス中 ／ 'suck' 口でしている ／ 'lick' 口でされる
       o    … { force 嫌がっている（合意のない・敵対の場面）, hush 声を殺す場面（狭い所・隣に人がいる）, deep 奥, late 後半, top 相手,
                novel 小説調（♡を落とし、言葉のある喘ぎを多めに。元の表も4割ほど残す）, talk 言葉の割合, fall 堕ちている（省けば住人の状態から） }
       old  … 元の表（配列）か、元の選び方（関数）。全年齢モード・攻めを選んだ人の受け身の声・小説調の残す分に使う
     利用者の辞書（高度設定の喘ぎの辞書）にその鍵の行があれば、元の表より必ずそちらを使う。
     呼ぶ側は、HK.Moan が無い（全年齢版）・ぼかし（low）のときは自分の元の表を使う */
  M.keyFor = function (S, who, kind, o) {
    o = o || {};
    var r = rand(S), ps = psOf(who, o), nt = M.nightOf(who, o), fal = o.fall != null ? !!o.fall : fallenOf(who), frc = !!o.force && !fal, hard = !!o.force && fal;
    switch (kind) {
      case 'kiss': return 'k0';
      case 'suck': return 'o0';
      case 'lick': return frc ? 'l1' : 'l0';
      case 'top': return o.hush ? (r < 0.6 ? 't1' : 't4') : o.force && SOFT[ps] && r < 0.25 ? 't5' : r < 0.6 ? 't4' : 't1';
      case 'topmid': return o.hush ? 't1' : r < (nt === 'sadist' || nt === 'mean' ? 0.6 : 0.35) ? 't3' : r < 0.7 ? 't0' : 't1';
      case 'start': return o.hush || (nt === 'shy' && r < 0.6) ? 'h0' : frc ? (r < 0.5 ? 'r0' : 'r1') : hard ? 'r2' : 'w0';
      case 'mid':
        if (o.hush) return o.force ? 'h1' : r < 0.7 ? 'h1' : 'h2';
        if (frc) return o.deep && r < 0.3 ? 'p1' : o.late ? 'r2' : r < 0.5 ? 'r1' : 'r2';
        if (hard) return o.deep && r < 0.3 ? 'p1' : 'r3';
        return o.deep && r < 0.3 ? 'p0' : r < (nt === 'maso' ? 0.45 : 0.15) ? 'b0' : nt === 'shy' && r > 0.55 ? 'h1' : 'w1';
      default:
        if (o.hush) return r < 0.7 ? 'h2' : frc ? 'r3' : 'w2';
        if (frc) return ROUGH[ps] && r < 0.4 ? 'r4' : 'r3';
        if (hard) return 'r3';
        return (o.late && r < 0.3) || r < (nt === 'maso' ? 0.35 : 0.12) ? 'w3' : nt === 'shy' && r > 0.6 ? 'h2' : o.deep && r < 0.25 ? 'p0' : 'w2';
    }
  };
  /* 利用者の辞書に、この人のこの鍵の行があるか */
  M.userHas = function (who, key, ctx) {
    var U = M.user; if (!U) return false;
    var nm = who && who.name, tone = toneOf(who), ps = psOf(who, ctx);
    return !!((nm && U.who[nm] && U.who[nm][key]) || (U.tone[tone] && U.tone[tone][key]) || (U.persona[ps] && U.persona[ps][key]) || U.shared[key]);
  };
  /* 小説調：♡を落とす（空白の重なりも詰める） */
  M.plain = function (s) { var t = String(s || ''), mk = t.charAt(0) === NOTONE ? NOTONE : ''; t = t.replace(/\u2060/g, '').replace(/♡+/g, '').replace(/[ 　]{2,}/g, '　').replace(/^[ 　]+|[ 　]+$/g, ''); return mk + (t || '……っ'); };
  var RECV_KIND = { start: 1, mid: 1, climax: 1, lick: 1 };
  M.say = function (S, who, kind, o, old) {
    o = o || {};
    var useOld = function () { if (typeof old === 'function') return old(); if (old && old.length) return fresh(S, old, (who && who.name) + '.old.' + kind); return null; };
    /* 元の表の声も、口調・性別に合わない語尾を整える（全年齢モードでは fit は何もしない） */
    var useOld0 = useOld; useOld = function () { var v = useOld0(); return typeof v === 'string' ? fit(v, who) : v; };
    /* 全年齢モードでは喘ぎを出さない（元の表があればそれ。R18の表は全年齢モードで空になる） */
    if (HK.SAFE_ON) { var so = useOld(); return so == null ? '' : so; }
    /* 自分で攻めを選んだ人の受け身の声は、元の表（攻め向けに絞ったもの）のまま */
    if (RECV_KIND[kind] && HK.Pos && HK.Pos.hardTop && HK.Pos.hardTop(who) && old) { var ho = useOld(); if (ho != null) return ho; }
    var key = M.keyFor(S, who, kind, o);
    /* 元の表はいつもの口調の言い換えを通るので、喘ぎの口調を決めた人には使わない（乱数の引き方は変えない） */
    if (o.novel && old && !M.userHas(who, key, o) && rand(S) < 0.4 && !moanToneOf(who)) { var no = useOld(); if (no) return no; }
    var cx = { force: !!o.force, deep: !!o.deep, late: !!o.late, top: o.top || null, oral: kind === 'lick' };
    if (o.talk != null) cx.talk = o.talk; else if (o.novel) cx.talk = 0.6;
    var out = bare(M.pick(S, who, key, cx));
    return o.novel ? M.plain(out) : out;
  };

  /* 箱庭を回しているあいだだけ、住人の名前 → 喘ぎの口調 の対応表を置く（設定した人がいなければ空のまま） */
  if (HK.simulate && !HK.simulate._moanTone) {
    var simM = HK.simulate;
    HK.simulate = function (input) {
      var prev = M.map, mp = null;
      var nmp = null;
      ((input && input.chars) || []).forEach(function (c, i) {
        if (c && c.name && c.moanTone) (mp = mp || {})[c.name] = c.moanTone;
        /* 夜の性格（全体・相手ごと）も名前で引けるように（M.nightOf） */
        if (c && c.name && (c.night || c.nightFor)) (nmp = nmp || {})[c.name] = { i: i, night: c.night || '', nightFor: c.nightFor || null };
      });
      M.map = mp; var prevN = M.nmap; M.nmap = nmp;
      ((input && input.chars) || []).forEach(function (c, i) { if (nmp && c && c.name && !nmp[c.name]) nmp[c.name] = { i: i, night: '', nightFor: null }; });
      try { return simM.apply(this, arguments); } finally { M.map = prev; M.nmap = prevN; }
    };
    for (var km in simM) if (Object.prototype.hasOwnProperty.call(simM, km)) HK.simulate[km] = simM[km];
    HK.simulate._moanTone = true;
  }

  /* ---------- 利用者の辞書 ---------- */
  function toneKeyOf(name) {
    if (!name) return null;
    if (HK.TONES && HK.TONES[name] || HK.PERSONA && HK.PERSONA[name]) return name;
    var keys = HK.TONE_KEYS || [];
    for (var i = 0; i < keys.length; i++) { var info = HK.toneInfo ? HK.toneInfo(keys[i]) : null; if (info && info.label && (info.label === name || info.label.indexOf(name) === 0)) return keys[i]; }
    return null;
  }
  function personaKeyOf(name) {
    if (!name) return null;
    if (HK.PERSONA && HK.PERSONA[name]) return name;
    var ks = HK.PERSONA_KEYS || [];
    for (var i = 0; i < ks.length; i++) if (HK.PERSONA[ks[i]].label === name) return ks[i];
    return null;
  }
  function keyOf(mode, stage) {
    var m = MODE_BY_NAME[mode] || (/^[wrhpbkolt]$/.test(mode) ? mode : null);
    if (!m) return null;
    var st = stage == null || stage === '' ? 0 : (+String(stage).replace(/[０-９]/g, function (d) { return String.fromCharCode(d.charCodeAt(0) - 0xFEE0); }) - 1);
    if (!(st >= 0 && st < MODES[m].stages.length)) return null;
    return m + st;
  }
  /* 文字列 → { shared, tone, persona, who, errors } */
  M.parse = function (text) {
    var out = { shared: {}, tone: {}, persona: {}, who: {}, errors: [] }, cur = null, lines = String(text || '').split(/\r?\n/);
    lines.forEach(function (raw, i) {
      var line = raw.replace(/^\s+|\s+$/g, '');
      if (!line || /^[#＃]/.test(line)) return;
      var h = line.match(/^[\[［]\s*喘ぎ\s+(.+?)\s*[\]］]$/);
      if (h) {
        var parts = h[1].split(/[\s　]+/), scope = parts[0], add = parts[parts.length - 1] === '追加';
        if (add) parts.pop();
        var mode = parts[1], stage = parts[2];
        /* 鍵そのもの（w1）で書いたとき */
        if (parts.length === 2 && /^[wrhpbkolt]\d$/.test(parts[1])) { mode = parts[1].charAt(0); stage = String(+parts[1].slice(1) + 1); }
        var key = keyOf(mode, stage);
        if (!key) { out.errors.push((i + 1) + '行目：場面か段階が読めません（' + h[1] + '）'); cur = null; return; }
        var box = null;
        if (scope === '共通') box = out.shared;
        else if (/^口調[=＝]/.test(scope)) { var tk = toneKeyOf(scope.slice(3)); if (!tk) { out.errors.push((i + 1) + '行目：口調「' + scope.slice(3) + '」が見つかりません'); cur = null; return; } box = out.tone[tk] = out.tone[tk] || {}; }
        else if (/^態度[=＝]/.test(scope)) { var pk = personaKeyOf(scope.slice(3)); if (!pk) { out.errors.push((i + 1) + '行目：態度「' + scope.slice(3) + '」が見つかりません'); cur = null; return; } box = out.persona[pk] = out.persona[pk] || {}; }
        else if (/^住人[=＝]/.test(scope)) { var nm = scope.slice(3); box = out.who[nm] = out.who[nm] || {}; }
        else { out.errors.push((i + 1) + '行目：範囲が読めません（共通／口調=／態度=／住人=）'); cur = null; return; }
        cur = { box: box, key: key, add: add, started: false };
        return;
      }
      if (!cur) { out.errors.push((i + 1) + '行目：先に [喘ぎ …] の見出しが要ります'); return; }
      var items = line.split(/[|｜]/).map(function (x) { return x.replace(/^\s+|\s+$/g, ''); }).filter(Boolean).map(function (x) { return x.slice(0, 80); });
      if (!cur.started) {
        cur.started = true;
        if (cur.add) { var base = cur.box === out.shared ? (HK.MOAN_SHARED || {})[cur.key] : null; cur.box[cur.key] = (base || []).slice(); }
        else cur.box[cur.key] = [];
      }
      cur.box[cur.key] = cur.box[cur.key].concat(items);
    });
    return out;
  };
  M.setUser = function (text) {
    var p = M.parse(text);
    var any = Object.keys(p.shared).length || Object.keys(p.tone).length || Object.keys(p.persona).length || Object.keys(p.who).length;
    M.user = any ? p : null;
    M.userText = String(text || '');
    return p;
  };
  /* 設定画面の見本（鍵ごとに数個出す。rng は固定の種） */
  M.demo = function (key, persona, tone, n) {
    var x = 12345, R = function () { x = (x * 1103515245 + 12345) % 2147483648; return x / 2147483648; };
    R.int = function (m) { return Math.floor(R() * m); };
    var S = { rng: R }, who = { name: '見本', persona: persona || 'gentle', tone: tone || persona || 'gentle', eg: null };
    var out = [];
    for (var i = 0; i < (n || 4); i++) out.push(M.pick(S, who, key, { top: { gender: 'm' }, talk: WORDS_ONLY[key] ? 1 : MIX[key] ? 0.5 : 0 }).replace(/\u2060/g, ''));
    return out;
  };
  /* 保存してある辞書を読む（ui-adv.js が HK.store の adv.moan に入れる） */
  try { var adv = HK.store && HK.store.get('adv', null); if (adv && adv.moan) M.setUser(adv.moan); } catch (e) { /* 読めなければ組み込みだけ */ }
})();
