/* 看病の部屋（追加パック set-b の部屋。エンジン型。両方のビルド。2026-11-03。設計は docs/reports/2026-11-03/kanbyo-design.md）
   どちらかが体調を崩し、もう一人が看病する数日を、朝・日中・夜の3区切りで眺める。部屋の中心は熱の高さ（上がる→いちばん高い→下がる→治る）。
   ・関係は名簿の二人の関係のまま（関係を選ぶ欄は無い。2026-11-03 利用者の訂正）。関係（友人・幼なじみ・同僚・先輩後輩・師弟・片想い・両片想い・恋人・夫婦・家族・元恋人・不仲・知人・関係なし）で
     導入・看病の文・山場の弱音・結末の言い回しが変わる。恋愛にできない関係（家族など）は恋愛の結末が出ないだけ
   ・看病する側／される側は住人ごとの「立場」で選べる（おまかせは性格・仕事の型・体調の設定から）。三人目は見舞いに来る側
   ・環境ダイヤル：病の重さ・日数（3〜7日）・同居か通いか・うつりやすさ・登場しない住人（見舞い）
   ・性格で分かれる行動：看る側は「世話を焼きすぎる／不器用に失敗する」、看られる側は「強がって隠す／甘える」（態度9種・気質で選び、運命の揺らぎでらしくない方に）。受け止め方も態度で
   ・山場：熱がいちばん高い夜の弱音（必ず出す）
   ・結末：治って恋人に／お礼のデート／うつって看病し返す／両片想いのまま（恋人・夫婦は「いつもより甘い数日」、恋愛にならない二人は「お礼」）
   ・R18版：治った日の夜・お礼のデートの夜・うつった人が治った夜・甘い数日の夜・治ったあとの夜（kanbyo-r18.js）。病気の間は、熱が下がってきた日の夜に、恋人どうし・セフレ・両片想いの二人だけ、まれに（2026-11-04 改め）。
     うつった人が寝込んでいる間・熱が上がっていく夜・いちばん高い夜は起こさない。始まりから恋人どうしでない二人は、告白した日の夜にはせず、告白していなければ治った日のあと「近づく段」を挟んでから。
     恋愛感情の有無では止めない（本体の決まり「性的な出来事は性欲と衝動で判定し、恋愛感情が発生を防がないように」）：恋人どうしでない二人も、体の関係にしてよい組なら起こりうる（恋人どうしより起こりにくい）
   部品：文の仕上げ HK.PairKit、受け止め方 HK.PairReact、他の住人の関係 HK.PairVisit、配役 HK.PairCast（共通のかたまり kit）、暮らし HK.Life、表を引く HK.Journal（本体 pack-roomkit）。
   文は kanbyo-text-a.js・kanbyo-text-b.js（HK.KanbyoText）。登場人物はすべて成人として扱う */
/* @event scen=set-b-kanbyo id=kb_setup cat=bond tie=- label=体調を崩して看病が始まる */
/* @event scen=set-b-kanbyo id=kb_morning cat=bond tie=- label=熱の具合を確かめる朝 */
/* @event scen=set-b-kanbyo id=kb_arrive cat=bond tie=- label=通いの看病で部屋を訪ねてくる */
/* @event scen=set-b-kanbyo id=kb_leave cat=bond tie=- label=通いの看病を終えて帰っていく */
/* @event scen=set-b-kanbyo id=kb_stay cat=bond tie=- label=熱が高い夜に泊まり込む */
/* @event scen=set-b-kanbyo id=kb_rest cat=solo tie=- label=体調を崩して仕事や学校を休む */
/* @event scen=set-b-kanbyo id=kb_care cat=bond tie=- label=日替わりの看病（おかゆ・薬・氷枕など） */
/* @event scen=set-b-kanbyo id=kb_over cat=bond tie=- label=看病する側が世話を焼きすぎる */
/* @event scen=set-b-kanbyo id=kb_clumsy cat=bond tie=- label=看病する側が不器用に失敗する */
/* @event scen=set-b-kanbyo id=kb_hide cat=bond tie=- label=看病される側が強がって隠す */
/* @event scen=set-b-kanbyo id=kb_amae cat=bond tie=- label=看病される側が甘える */
/* @event scen=set-b-kanbyo id=kb_night cat=bond tie=- label=寝込んだ人のそばで過ごす夜 */
/* @event scen=set-b-kanbyo id=kb_weak cat=bond tie=- label=熱がいちばん高い夜の弱音 */
/* @event scen=set-b-kanbyo id=kb_heal cat=bond tie=- label=熱が下がって治った朝 */
/* @event scen=set-b-kanbyo id=kb_thanks cat=bond tie=- label=治った人が看病のお礼を言う */
/* @event scen=set-b-kanbyo id=kb_after cat=bond tie=- label=治ったあとの穏やかな一日 */
/* @event scen=set-b-kanbyo id=kb_sweet cat=romance tie=lover label=いつもより甘い数日を過ごす */
/* @event scen=set-b-kanbyo id=kb_date cat=romance tie=- label=看病のお礼のデートに出かける */
/* @event scen=set-b-kanbyo id=kb_rei cat=bond tie=- label=看病のお礼に一緒に出かける */
/* @event scen=set-b-kanbyo id=kb_confess cat=romance tie=- label=治ったあとに想いを告げて恋人になる */
/* @event scen=set-b-kanbyo id=kb_kaeshi cat=bond tie=- label=看病した人に風邪がうつる */
/* @event scen=set-b-kanbyo id=kb_kcare cat=bond tie=- label=うつった相手を看病し返す */
/* @event scen=set-b-kanbyo id=kb_kheal cat=bond tie=- label=うつった人もすっかり治った朝 */
/* @event scen=set-b-kanbyo id=kb_end cat=bond tie=- label=看病の日々の最後の夜 */
/* @event scen=set-b-kanbyo id=kb_visit cat=bond tie=- label=他の住人がお見舞いに来る */
/* @event scen=set-b-kanbyo id=kb_gift cat=bond tie=- label=他の住人から差し入れが届く */
/* @event scen=set-b-kanbyo id=kb_talk cat=bond tie=- label=看病の合間に二人で他愛ない話をする */
/* @event scen=set-b-kanbyo id=kb_miss cat=bond tie=- label=看病の日の小さなすれ違い */
/* @event scen=set-b-kanbyo id=kb_jiken cat=bond tie=- label=看病の日に起きる小さな出来事 */
/* @event scen=set-b-kanbyo id=kb_after_rel cat=bond tie=- label=治ったあとの日々に二人の距離が変わる */
/* @event scen=set-b-kanbyo id=kb_ktalk cat=bond tie=- label=立場が入れ替わった看病し返しのやりとり */
/* @event scen=set-b-kanbyo id=kb_morn_stay cat=bond tie=- label=泊まり込んで看病した翌朝 */
/* @event scen=set-b-kanbyo id=kb_leave_morn cat=bond tie=- label=泊まった看病の人が朝に帰っていく */
/* @event scen=set-b-kanbyo id=kb_near cat=romance tie=- label=治ったあとの夜に二人の距離が近づく */
/* @event scen=set-b-kanbyo id=kb_contact cat=bond tie=- label=他の住人からお大事にと連絡が来る */
/* @event scen=set-b-kanbyo id=kb_work cat=bond tie=- label=通いの看病の人が仕事中も看病の相手を心配する */
/* @event scen=set-b-kanbyo id=kb_alone_day cat=solo tie=- label=看病の人が仕事の日にひとりで寝込んで過ごす */
/* @event scen=set-b-kanbyo id=kb_rest_peak cat=bond tie=- label=熱がいちばん高い日に看病のため仕事を休む */
/* @event scen=set-b-kanbyo id=kb_kaeshi_nearly cat=bond tie=- label=看病した人にうつりかけて持ちこたえる */
(function () {
  'use strict';
  var HK = window.HK;
  if (!HK || !HK.Life || !HK.Journal || !HK.PairKit) return;
  var ID = 'set-b-kanbyo', J = HK.Journal, LF = HK.Life, K = HK.PairKit;
  var PART = ['朝', '日中', '夜'], WEEK = ['月', '火', '水', '木', '金', '土', '日'];
  function TX() { return HK.KanbyoText || {}; }
  function RC() { return HK.PairReact; }
  function f(ctx) { return ctx.kb; }
  function pickOf(ctx, arr) { return arr && arr.length ? arr[Math.floor(ctx.rng() * arr.length)] : ''; }
  function fill(ctx, t, a, b, ex) { var r = famWord(ctx, K.fill(ctx, t, a, b, ex)); if (ctx && ctx.kb && /合鍵を(?:預か|渡さ|受け取)/.test(r)) ctx.kb.hasKey = true; return r; }
  /* 血縁の二人（親子・きょうだい・親戚）は、文の「家族」を血縁の言い方にする（2026-11-04 利用者の指示「親子は親子のまま、血縁＋様子で表す」）。
     「AとBは（遠慮のいらない）家族だ」「家族の看病の数日」「家族として」「家族に」だけを置き換え、「家族の〇〇は」のような人を指す言い方はそのまま */
  function famWord(ctx, t) {
    var S = ctx && ctx.kb, w = S && S.famW;
    if (!w || typeof t !== 'string') return t;
    return t.replace(/(は|、)(遠慮のいらない|仲のいい|気心の知れた)?家族だ/g, function (m, p1, p2) { return p1 + (p2 || '') + w + 'だ'; })
      .replace(/家族の看病/g, w + 'の看病').replace(/家族として/g, w + 'として').replace(/家族どうし/g, w + 'どうし');
  }
  var ROM = K.ROM, WED = K.WED;
  /* 恋人どうしを前提にした語（恋愛にならない二人・恋人でない二人には出さない） */
  var COUPLE_RE = /(?<!元)恋人|付き合って(?:いる|る)|彼氏|彼女/;
  function per(c) { return RC() ? RC().per(c) : 'gentle'; }
  /* 恋愛の出来事の分類：恋愛にできない組（本体の romanceOk。恋愛相手の固定など）は bond にする（romance のままだと記録から落ちるため） */
  function rcat(ctx, a, b) { var S = f(ctx); return S && S.love && (!ctx.romanceOk || ctx.romanceOk([a, b], false)) ? 'romance' : 'bond'; }
  function holiday(d) { return d % 7 === 5 || d % 7 === 6; }

  /* ---------- 二人の関係（名簿の関係のまま。看病の部屋のまとめ） ----------
     rk：spouse 夫婦／lover 恋人／fam 家族／pfam 擬似親子／ex 元恋人／almost 両片想い／crush 片想い／bad 不仲／mentor 師弟／senpai 先輩後輩／work 同僚／childhood 幼なじみ／friend 友人／school 同級生／weak 知人／none 関係なし
     grp（出来事の文の分かれ目）：love（夫婦・恋人）／pine（両片想い・片想い）／close（友人・幼なじみ・同級生）／work（同僚・先輩後輩・師弟）／fam（家族・擬似親子）／awk（元恋人・不仲・知人・関係なし） */
  var RK_OF = { spouse: 'spouse', lover: 'lover', fiance: 'lover', mate: 'lover', fated: 'lover', honmei: 'lover',
    parent: 'fam', sibling: 'fam', sibprot: 'fam', sibclose: 'fam', sibbad: 'fam', twin: 'fam', stepsib: 'fam', relative: 'fam', pparent: 'pfam',
    ex: 'ex', almost: 'almost', crush: 'crush', yan: 'crush', enemy: 'bad', bad: 'bad', rival: 'rival', lovehate: 'lovehate', abuse: 'bad',
    teacher: 'mentor', mentor: 'mentor', master: 'mentor', worship: 'mentor', senpai: 'senpai', colleague: 'work', boss: 'work', childhood: 'childhood',
    friend: 'friend', best: 'friend', buddy: 'friend', benefactor: 'friend', fwb: 'fwb', comrade: 'friend', classmate: 'school', acq: 'weak' };
  var RK_ORD = ['spouse', 'lover', 'fwb', 'fam', 'pfam', 'ex', 'almost', 'crush', 'lovehate', 'bad', 'rival', 'mentor', 'senpai', 'work', 'childhood', 'friend', 'school', 'weak'];
  var RK_GRP = { spouse: 'love', lover: 'love', almost: 'pine', crush: 'pine', friend: 'close', childhood: 'close', school: 'close', work: 'work', senpai: 'work', mentor: 'work', fam: 'fam', pfam: 'fam', ex: 'awk', fwb: 'fwb', bad: 'awk', rival: 'awk', lovehate: 'awk', weak: 'awk', none: 'awk' };
  /* 仲の悪い関係（不仲・ライバル・愛憎・元恋人）：素直になれない看病の文（feud の表） */
  /* 元恋人は「いがみ合う」文にしない（2026-11-04 報告：元恋人の回にライバル・不仲の文が出た）。元恋人の文は関係の鍵 ex と awk のまとめから */
  var FEUD_RK = /^(bad|rival|lovehate)$/;
  var RK_NAME = { spouse: '夫婦', lover: '恋人', fwb: '体の関係（セフレ）', fam: '家族', pfam: '家族同然', ex: '元恋人', almost: '両片想い', crush: '片想い', bad: '不仲', rival: 'ライバル', lovehate: '愛憎', mentor: '師弟', senpai: '先輩と後輩', work: '同僚', childhood: '幼なじみ', friend: '友人', school: '同級生', weak: '知り合い', none: '特に関係なし' };
  function relKind(ctx, A, B) {
    var tl = HK.Ties && HK.Ties.all ? HK.Ties.all(ctx, A, B) || [] : [], best = 'none';
    tl.forEach(function (t) {
      if (!t || t.type === 'noobs') return;
      var k = RK_OF[t.type] || 'friend';
      if (k === 'lover' && t.spouse) k = 'spouse';
      if (t.type === 'spouse' || t.spouse) k = 'spouse';
      if (k === 'spouse' && t.married === 'divorced') k = 'ex';
      if (best === 'none' || RK_ORD.indexOf(k) < RK_ORD.indexOf(best)) best = k;
    });
    return best;
  }
  /* 向きのある関係（片想い：想う側、先輩後輩：先輩、師弟：師の側）が看病する側（A）なら 'A'、される側なら 'B' を付けた鍵（文の表 T.crushA など） */
  function relDir(ctx, A, B, rk) {
    var tl = HK.Ties && HK.Ties.all ? HK.Ties.all(ctx, A, B) || [] : [], ty = { crush: /^(crush|yan)$/, senpai: /^senpai$/, mentor: /^(teacher|mentor)$/ }[rk];
    if (!ty) return '';
    var t = tl.filter(function (x) { return x && ty.test(x.type); })[0];
    if (!t || t.a == null) return '';
    return rk + (t.a === A.i ? 'A' : t.a === B.i ? 'B' : '');
  }
  /* 関係の欄の「体の関係：あり」（どの関係でも t.body が 'ok'、本体の恐怖の関係は HK.tieBodyOK） */
  function bodyTie(ctx, A, B) {
    var tl = HK.Ties && HK.Ties.all ? HK.Ties.all(ctx, A, B) || [] : [];
    if (tl.some(function (t) { return t && (t.body === 'ok' || (HK.tieBodyOK && HK.tieBodyOK(t))); })) return true;
    /* 本体の関係の読み込みは恐怖の関係にだけ body を残すので、入力の関係の欄（ctx.input.ties）もそのまま見る */
    var raw = ctx.input && ctx.input.ties || [];
    return raw.some(function (t) { return t && t.body === 'ok' && ((t.a === A.i && t.b === B.i) || (t.a === B.i && t.b === A.i)); });
  }
  /* 恋愛にしてよい二人か（恋愛対象・恋愛相手の固定・関係の「恋愛：なし」（家族・無関心・恐怖など）を両方向で） */
  function canLove2(ctx, a, b) {
    if (HK.canLove && !(HK.canLove(a, b, ctx) && HK.canLove(b, a, ctx))) return false;
    if (HK.tieLoveNoPair && (HK.tieLoveNoPair(ctx, a, b) || HK.tieLoveNoPair(ctx, b, a))) return false;
    if (HK.Ties && HK.Ties.apathy && (HK.Ties.apathy(ctx, a, b) || HK.Ties.apathy(ctx, b, a))) return false;
    if (ctx.pair && ctx.pair(a, b).kin) return false;
    return true;
  }
  /* 文の候補を二人に合うものに絞る（恋愛・恋人・結婚・家事の担い手・関係） */
  function okText(ctx, x, a, b) {
    var S = f(ctx);
    if (typeof x !== 'string') return false;
    if (S && !S.love && ROM.test(x)) return false;
    if (S && !S.couple && COUPLE_RE.test(x.replace(/「[^」]*」/g, ''))) return false;
    if (S && S.rk !== 'spouse' && WED.test(x)) return false;
    if (S && S.sev === 'light' && LIGHT_NG.test(x)) return false;
    if (!K.choreOk(x, a, b)) return false;
    if (S && !partOk(S, x)) return false;
    /* 通い・同居していない二人（2026-11-05 遊んで確かめた報告 3 回目）：合鍵を預かっていないのに「合鍵で入った」、一緒に住んでいないのに「夕食のあと並んでテレビ」を出さない */
    if (S && S.live !== 'together' && !S.hasKey && !S.couple0 && /合鍵(?!を(?:預か|渡さ|受け取))/.test(x)) return false;
    if (S && S.live !== 'together' && /並んでテレビ|夕食のあと、二人/.test(x)) return false;
    if (S && !roleWordOk(S, x, a, b)) return false;
    if (S && !illWordOk(S, x)) return false;
    return true;
  }
  /* 熱の状態の言い回し（2026-11-05 通し読み：二人とも治った 7 日目の夜に「熱の残る体に負担をかけないよう」、まだ熱のある夜に「熱の引いた胸」「今夜はその必要がない」、
     うつって看病し返したあとに「もしうつったら、今度は私が看病する番」）：その日の状態に合う文だけ */
  function illOn(S, d) { return d < S.heal || !!(S.kaeshi && d >= S.kaeshi.from && d < S.kaeshi.heal); }
  function illWordOk(S, x) {
    var d = S.day && S.day.d; if (d == null || S.heal == null) return true;
    var n = String(x).replace(/「[^」]*」/g, ''), now = illOn(S, d), justWell = d === S.heal || !!(S.kaeshi && d === S.kaeshi.heal);
    if (/熱の残る|熱を持った|熱のある|微熱の残る/.test(n) && !now && !justWell) return false;
    if (/熱の引いた|今夜はその必要がない|声を潜めて過ごしてきた/.test(n) && now) return false;
    if (/もしうつったら|今度は[^。」]{0,8}看病する番/.test(x) && S.kaeshi && d >= S.kaeshi.from) return false;
    return true;
  }
  /* 時間帯の札（2026-11-05 報告：朝の区切りに「夕方、隣の家から工事の音」）：区切りに合わない時間の語で始まる文を外す */
  var PART_NG = { m: /^(?:夕方|夜|夕食|晩|昼過ぎ)|。(?:夕方|夜更け|夕食のあと|夜になる)/, d: /^(?:夜|朝|夜中)[、に]|^夜更け/, n: /^(?:朝|昼)[、に]|^昼過ぎ/ };
  function partOk(S, x) { var ng = S.part && PART_NG[S.part]; return !ng || !ng.test(String(x).replace(/「[^」]*」/g, '')); }
  /* 役の言い回し（2026-11-05 報告：看病された側に「看病の癖が、まだ抜けていなかった」）：{a} の看病の癖・看病の手つきは、{a} が看病した人のとき。
     「ぶり返していない？」と聞かれる・「もう治ってる」と笑う {b} は、最後に寝込んでいた人のとき */
  function roleWordOk(S, x, a, b) {
    if (!a || !b || a === b) return true;
    var kd = S.kaeshi && S.day && S.day.d >= S.kaeshi.from, carerOk = kd ? (a === S.A || a === S.B) : a === S.A, sick = kd ? S.A : S.B;
    if (/\{a\}[^。]*看病の(?:癖|手つき|夜と同じ手つき)|看病の(?:癖|手つき)(?:が、?まだ抜け|のまま)|看病の夜と同じ手つき/.test(x) && !carerOk) return false;
    if (/ぶり返して(?:ない|いない|いません)|もう治って(?:る|いる|います)/.test(x) && b !== sick) return false;
    /* 夜の場面の文は {a}＝攻め・{b}＝受けで書いてあり、多くは「受けが看病された人・攻めが看病した人」の書き方（病み上がりの{b}・看病のあいだ{a}が拭いた…）。
       受けが看病した人（攻めが看病された人）の夜には、その向きの文を使わない（2026-11-05 kanbyo-role：看病した人が「元気になった」）。うつって看病し返したあとは、どちらも看病した人なので見ない */
    if (!kd && (b === S.A || a === S.B) && (B_PAT.test(x) || A_CARE.test(x))) return false;
    /* 看病の礼を言うのは看病された人だけ（うつった人が寝込んでいる日は、うつった人。治ったあとは、はじめに看病された人） */
    var thx = kd && S.day.d < S.kaeshi.heal ? S.A : S.B;
    if (/\{a\}は「[^」]*(?:看病の(?:お)?礼|看病のお返し|看病してくれ)/.test(x) && a !== thx) return false;
    if (/\{b\}は「[^」]*(?:看病の(?:お)?礼|看病のお返し|看病してくれ)/.test(x) && b !== thx) return false;
    return true;
  }
  var B_PAT = /(?:病み上がり|治ったばかり|元気になった|熱の残る|熱っぽい|微熱の残る|血色の戻った|寝込んでいた|寝てばかりいた|熱で(?:上気|潤|うる))[^。]{0,4}\{b\}|\{b\}(?:の|は)[^。]{0,16}(?:熱の名残|熱が少し|熱が残|病み上がり|寝込んで|治った|元気になった|平熱|熱を測|体温計|微熱|うわごと|寝汗|看病のあいだ寝)|\{b\}の額の冷却シート|熱のある\{b\}/;
  var A_CARE = /看病のあいだ[^。]{0,20}\{a\}が|\{a\}は[^。]{0,30}看病の(?:あいだ|夜|とき)[^。]{0,24}(?:拭|さす|直し|留め|数え|洗|替え|支え|飲ませ|敷い|見下ろし|手つき)|\{a\}が貼った|\{a\}の看病/;
  /* 候補から一つ（一回の遊びで同じ文を二度出さない。使っていない文が無ければ ''。rep＝使い切ったら使った文から選んでよい） */
  function cands(ctx, arr, a, b) {
    var p = (arr || []).filter(function (x) { return okText(ctx, x, a, b); });
    if (HK.relFilter && a && b && p.length) { var r = HK.relFilter(ctx, p, a, b); if (r && r.length) p = r; }
    return p;
  }
  function pickT(ctx, arr, a, b, rep) {
    var p = cands(ctx, arr, a, b);
    if (!p.length) return '';
    var U = f(ctx).used, q = p.filter(function (x) { return !U[x]; });
    if (!q.length && !rep) return '';
    var t = pickOf(ctx, q.length ? q : p);
    U[t] = 1;
    return t;
  }
  /* 関係ごとの文の表 T（{ 向きのある鍵, 関係, まとめ, all }）から：その関係の文を先に、使い切ったら共通（all）の文から */
  function relList(T, S) { if (!T) return []; return (S.rkKey && T[S.rkKey] || []).concat(T[S.rk] || [], S.feud && T.feud || [], T[S.grp] || [], T.all || []); }
  function relPick(ctx, T, a, b, rep) {
    var S = f(ctx), own = T ? (S.rkKey && T[S.rkKey] ? T[S.rkKey] : []).concat(T[S.rk] || [], S.feud && T.feud || [], T[S.grp] || []) : [];
    return pickT(ctx, own, a, b) || pickT(ctx, T && T.all, a, b) || (rep ? pickT(ctx, own.concat(T && T.all || []), a, b, true) : '');
  }
  /* 表 T に、まだ使っていない合う文があるか */
  function hasFresh(ctx, T, a, b) { var S = f(ctx); return cands(ctx, relList(T, S), a, b).some(function (y) { return !S.used[y]; }); }

  /* ---------- 熱の高さ（日ごとの段：rise 上がる／peak いちばん高い／fall 下がる／heal 治った日／after 治ったあと） ---------- */
  /* 熱の数字（2026-11-04 遊んで確かめた報告：「昨日より上がっていた」が前の日と同じ数字だった）：日ごとに決める。上がる日は前の日より高く、下がる日は前の日より低く。
     重さ × [上がり始め, いちばん高い, 下がりきる手前] */
  var TEMP_N = { light: [37.5, 38.0, 37.2], mid: [37.8, 38.7, 37.4], heavy: [38.3, 39.5, 37.8] };
  var DIG = ['', '一', '二', '三', '四', '五', '六', '七', '八', '九'];
  function tempW(v) { var t = Math.round(v * 10), i = Math.floor(t / 10), f0 = t % 10; return '三十' + DIG[i - 30] + '度' + (f0 ? DIG[f0] + '分' : 'ちょうど'); }
  function tempN(S, d) {
    S.tN = S.tN || {};
    if (S.tN[d] != null) return S.tN[d];
    var T0 = TEMP_N[S.sev] || TEMP_N.mid, st = stageOf(S, d), v;
    if (st === 'rise') v = T0[0] + (S.peak > 1 ? (T0[1] - 0.3 - T0[0]) * d / (S.peak - 1) : 0);
    else if (st === 'peak') v = T0[1];
    else if (st === 'fall') { var n = Math.max(1, S.heal - S.peak - 1), i = d - S.peak; v = T0[1] - (T0[1] - T0[2]) * i / n; }
    else v = 36.5;
    v = Math.round(v * 10) / 10;
    var pv = d > 0 && S.tN[d - 1] != null ? S.tN[d - 1] : null;
    if (pv != null && st === 'rise' && v <= pv) v = Math.round((pv + 0.2) * 10) / 10;
    if (pv != null && st === 'fall' && v >= pv) v = Math.round((pv - 0.2) * 10) / 10;
    return (S.tN[d] = v);
  }
  /* その日の熱の言い方（{temp}）と、前の日からの変化（上がった 1・同じ 0・下がった -1） */
  function tempOf(S, d) { return tempW(tempN(S, d)); }
  function tempD(S, d) { if (d <= 0) return 0; var a = tempN(S, d - 1), b = tempN(S, d); return b > a ? 1 : b < a ? -1 : 0; }
  /* 数字の変化と合わない言い回しを外す（上がった日にだけ「上がって」、下がった日にだけ「下がって」） */
  var T_UP = /昨日より[^。]*上が|また上がって|上がり続けて/, T_DOWN = /まで下がって|下がってる|下がっている|下がっていますね|下がってきた/;
  function tempOk(S, d, t) { var k = tempD(S, d); if (T_UP.test(t) && k <= 0) return false; if (T_DOWN.test(t) && k >= 0 && d > 0) return false; return true; }
  /* 軽い風邪には重い言い回し（ほとんど目を開けない・病院・脈を数える・座り込む）を使わない */
  var LIGHT_NG = /ほとんど目を開け|病院の連絡先|脈を数え|その場に座り込/;
  function plan(ctx, S) {
    var D = S.days, sev = S.sev, r = ctx.rng();
    var p = sev === 'light' ? (r < 0.5 ? 0 : 1) : sev === 'heavy' ? (D >= 5 ? (r < 0.5 ? 1 : 2) : 1) : (D >= 6 && r < 0.3 ? 2 : 1);
    p = Math.max(0, Math.min(p, D - 2));
    var fl = sev === 'light' ? 0 : sev === 'heavy' ? 1 + (ctx.rng() < 0.5 ? 1 : 0) : (ctx.rng() < 0.75 ? 1 : 0);
    var h = p + 1 + fl, cap = D >= 4 ? D - 2 : D - 1;
    /* 日数が短い（3・4 日）ときも、熱が出るなら「熱が下がってきた日」を一日置けるように、いちばん高い日を初日にする（2026-11-04 熱のある夜の割合） */
    if (fl > 0 && p + 2 > cap && cap >= 2) { p = cap - 2; h = cap; }
    if (h > cap) h = Math.max(p + 1, cap);
    S.peak = p; S.heal = h;
  }
  function stageOf(S, d) { return d < S.peak ? 'rise' : d === S.peak ? 'peak' : d < S.heal ? 'fall' : d === S.heal ? 'heal' : 'after'; }
  /* うつった人（看病した人）の段：ksick（寝込む日）／kheal（治った日）。無ければ null */
  function kStage(S, d) { var k = S.kaeshi; if (!k) return null; return d >= k.from && d < k.heal ? 'ksick' : d === k.heal ? 'kheal' : d > k.heal ? 'kafter' : null; }
  /* その夜、誰かが病気か（性的な場面を起こさない夜） */
  function sickNight(S, d) { var st = stageOf(S, d); return st === 'rise' || st === 'peak' || st === 'fall' || kStage(S, d) === 'ksick'; }
  /* うつる日程：治った日の翌日から 1〜2 日寝込み、必ず遊びの中で治る日を残す（2026-11-05 報告：看病し返しに流れて夜の機会が無くなった） */
  function mkKaeshi(ctx, S, by) {
    var from = S.heal + 1, len = ctx.rng() < 0.5 ? 1 : 2;
    len = Math.max(1, Math.min(len, S.days - 1 - from));
    S.kaeshi = { from: from, heal: from + len };
    if (by) { S.kaeshiBy = by; S.endK = null; }
  }

  /* ---------- 立場・おまかせ ---------- */
  function partOf(input, i) { var p = input && input.perChar && input.perChar[i], v = p && p.pick ? p.pick.part : null; return /^(carer|patient|guest)$/.test(v) ? v : null; }
  /* 目標の欄を選んでいる人（看病する側・される側の二人に先に入れる） */
  function goalSet(input, i) { var p = input && input.perChar && input.perChar[i], k = p && p.pick; return !!(k && ((k.sgoal && k.sgoal !== 'auto') || (k.lgoal && k.lgoal !== 'auto'))); }
  /* 二人（看病する側・される側）：立場で選んだ人を先に、ほかは上から（三人目は見舞いに来る側） */
  function couple(C, input) {
    var ok = C.filter(function (c) { var p = partOf(input, c.i); return p === 'carer' || p === 'patient'; }).slice(0, 2);
    C.forEach(function (c) { if (ok.length < 2 && ok.indexOf(c) < 0 && partOf(input, c.i) !== 'guest' && goalSet(input, c.i)) ok.push(c); });
    C.forEach(function (c) { if (ok.length < 2 && ok.indexOf(c) < 0 && partOf(input, c.i) !== 'guest') ok.push(c); });
    C.forEach(function (c) { if (ok.length < 2 && ok.indexOf(c) < 0) ok.push(c); });
    return ok.slice(0, 2);
  }
  function pickOfChar(ctx, c, k) { var p = ctx.input && ctx.input.perChar && ctx.input.perChar[c.i]; return p && p.pick ? p.pick[k] : null; }
  /* 体調を崩しやすさ（おまかせのとき）：無理をしがちな仕事の型・自分のことに無頓着（A 低め）・頑張りすぎ（CP 高め） */
  var WORK_SICK = { overtime: 0.45, out: 0.3, shift: 0.35, trip: 0.3, self: 0.25, regular: 0.15, remote: 0.12, home: 0.1 };
  function sickScore(c) { var t = c.tr || {}; return 0.2 + (WORK_SICK[c.life && c.life.work] || 0.2) + (1 - (t.a != null ? t.a : 0.5)) * 0.3 + (t.cp || 0.5) * 0.2; }
  function careScore(c) { var t = c.tr || {}; return 0.2 + (t.np || 0.5) * 0.5 + (t.warmth || 0.5) * 0.3 + (c.life && /home|remote/.test(c.life.work) ? 0.15 : 0); }

  /* ---------- 目標（短期＝この看病の間に何をしたいか／長期＝看病を通して二人の先に何を望むか。立場 × 態度9種 × 関係。kanbyo-text-e.js） ----------
     GS[短期の種]：b＝後押しする行動、ok(S)＝叶ったか（日々の出来事の数 S.cnt から）。GL[長期の種]：b＝後押し、e＝結末の点、judge(S, 基本)＝近づいた／変わらない／遠のいた */
  function cn(S, k) { return (S.cnt && S.cnt[k]) || 0; }
  var GS = {
    yowane: { b: 'over', ok: function (S) { return !!S.weakIn; } },
    noshippai: { b: '', ok: function (S) { return !cn(S, 'clumsy') && !cn(S, 'fail'); } },
    sobani: { b: 'over', ok: function (S) { return S.live !== 'apart' || cn(S, 'stay') > 0; } },
    amayakasu: { b: 'over', ok: function (S) { return cn(S, 'over') + cn(S, 'amae') > 0; } },
    tekipaki: { b: '', ok: function (S) { return !S.relapse; } },
    kakusu: { b: '', ok: function (S) { return !cn(S, 'over'); } },
    mamoru: { b: 'over', ok: function (S) { return !cn(S, 'choreTry') && !S.illSex && !S.relapse; } },
    misenai: { b: 'hide', ok: function (S) { return !S.weakIn; } },
    meiwaku: { b: 'hide', ok: function (S) { return !S.relapse && !cn(S, 'choreTry') && !S.kaeshi; } },
    hayaku: { b: 'hide', ok: function (S) { return !S.relapse && S.heal - S.peak <= 1; } },
    amaetai: { b: 'amae', ok: function (S) { return cn(S, 'amae') > 0 || !!S.illSex; } },
    sobanite: { b: 'amae', ok: function (S) { return S.live !== 'apart' || cn(S, 'stay') > 0; } },
    orei: { b: '', ok: function (S) { return !!S.thanked; } },
    karinashi: { b: 'hide', ok: function (S) { return cn(S, 'hide') > 0 && !cn(S, 'amae') && !S.weakIn; } }
  };
  var GL = {
    ongaeshi: { b: 'over', e: 2 }, tayorare: { b: 'over', e: 3 }, mamoru_l: { b: 'over', e: 4 }, taitou: { b: 'hide', e: -3 }, kashi: { b: '', e: -4 },
    konomama: { b: '', e: -8 }, chikaku: { b: 'amae', e: 10 }, tsutaetai: { b: '', e: 12 }, orei_l: { b: '', e: 3 }, kawaritai: { b: 'amae', e: 4 }
  };
  /* ---------- 利用者が選ぶ目標（住人ごとの欄「短期目標」「長期目標」。2026-11-04 不具合リスト 1104 の 4）----------
     選べるのは種（GS・GL）ごと。文は、その人の態度の目標の文に同じ種があればそれ、なければ関係のまとめ・ほかの態度の文から。
     立場の決まった種（看る側だけ・看られる側だけ）を選び、立場が「おまかせ」なら、その立場にする。立場をはっきり選んでいて合わないときは、近い種に置き換える（MAP） */
  var GOAL_OPT = {
    s: [
      ['c', 'noshippai', '一度も失敗せずに看病しきる'], ['c', 'tekipaki', '段取りどおりに治させる'], ['c', 'mamoru', '無理だけはさせない'], ['c', 'sobani', 'そばを離れずに看る'],
      ['c', 'amayakasu', 'とことん甘やかす'], ['c', 'yowane', '弱音や本当の具合を聞き出す'], ['c', 'kakusu', '心配していると顔に出さない'],
      ['p', 'misenai', '弱っているところを見せない'], ['p', 'karinashi', '借りを作らずに治る'], ['p', 'hayaku', '一日でも早く治す'], ['p', 'meiwaku', '心配や迷惑をかけない'],
      ['p', 'orei', 'ちゃんとお礼を言う'], ['p', 'sobanite', 'そばにいてもらう'], ['p', 'amaetai', 'ここぞとばかりに甘える']
    ],
    l: [
      ['b', 'chikaku', 'もっと近くにいたい'], ['b', 'tsutaetai', '治ったら気持ちを伝える'], ['b', 'taitou', '借りを返して対等になる'], ['b', 'konomama', 'この距離のままでいる'],
      ['c', 'ongaeshi', 'いつもの恩を返す'], ['c', 'tayorare', 'もっと頼られる人になる'], ['c', 'mamoru_l', 'これからもそばで支える'], ['c', 'kashi', '貸しを一つ作っておく'],
      ['p', 'orei_l', '世話になった分を返していく'], ['p', 'kawaritai', 'もっと素直に頼れるようになる']
    ]
  };
  var GOAL_GRP = { c: '看病する側の目標', p: '看病される側の目標', b: 'どちらの立場でも' };
  /* 立場に合わない種を選んでいたときの置き換え（看る側⇔看られる側） */
  var GOAL_MAP = {
    noshippai: 'meiwaku', tekipaki: 'hayaku', mamoru: 'meiwaku', sobani: 'sobanite', amayakasu: 'amaetai', yowane: 'sobanite', kakusu: 'misenai',
    misenai: 'kakusu', karinashi: 'noshippai', hayaku: 'tekipaki', meiwaku: 'mamoru', orei: 'amayakasu', sobanite: 'sobani', amaetai: 'amayakasu',
    ongaeshi: 'orei_l', tayorare: 'kawaritai', mamoru_l: 'orei_l', kashi: 'taitou', orei_l: 'ongaeshi', kawaritai: 'tayorare'
  };
  function goalOpts(kind) { return GOAL_OPT[kind].map(function (o) { return { id: o[1], label: o[2], group: GOAL_GRP[o[0]] }; }); }
  function goalSideOf(kind, k) { var o = GOAL_OPT[kind].filter(function (x) { return x[1] === k; })[0]; return o ? o[0] : ''; }
  /* その人が欄で選んだ目標の種（知らない値・古い記録の値はおまかせ扱い） */
  function goalPick(ctx, c, kind) { var v = pickOfChar(ctx, c, kind === 's' ? 'sgoal' : 'lgoal'); return v && goalSideOf(kind, v) ? v : ''; }
  /* 選んだ目標から決まる立場（看る側 'carer'／看られる側 'patient'。短期を先に見る） */
  function goalPart(ctx, c) {
    var s = goalPick(ctx, c, 's'), l = goalPick(ctx, c, 'l'), x = (s && goalSideOf('s', s)) || (l && goalSideOf('l', l)) || '';
    return x === 'c' ? 'carer' : x === 'p' ? 'patient' : null;
  }
  function goalOf(ctx, c, side, kind) {
    var S = f(ctx), T0 = TX(), G = kind === 's' ? T0.GOAL_S || {} : T0.GOAL_L || {}, GR = kind === 's' ? T0.GOAL_SR || {} : T0.GOAL_LR || {}, p = per(c);
    var base = ((G[side] || {})[p] || (G[side] || {}).gentle || []), rel = ((GR[side] || {})[S.feud ? 'feud' : S.grp] || []).filter(function (g) { return (S.love || !ROM.test(g.t)) && !(S.rk === 'spouse' && /恋人/.test(g.t)); });
    /* 利用者が選んだ目標：必ずその種にする（立場に合わない種は近い種に置き換える） */
    var want = goalPick(ctx, c, kind);
    if (want) {
      var ws = goalSideOf(kind, want), sd = side === 'carer' ? 'c' : 'p';
      if (ws !== 'b' && ws !== sd && GOAL_MAP[want]) want = GOAL_MAP[want];
      var of = function (list) { return (list || []).filter(function (g) { return g.k === want; }); };
      /* その人の態度に同じ種が無ければ、同じ立場のほかの態度の文から（関係のまとめは、その二人の関係のものだけ） */
      var all = [];
      Object.keys(G[side] || {}).forEach(function (k) { all = all.concat(of(G[side][k])); });
      var own = of(base).concat(of(rel));
      /* 恋愛にならない二人には、恋愛の語の入った文を避ける（種はそのまま） */
      var pool = own.length ? own : all, nr = pool.filter(function (g) { return S.love || !ROM.test(g.t); });
      if (nr.length) pool = nr;
      var lab = (GOAL_OPT[kind].filter(function (x) { return x[1] === want; })[0] || [])[2];
      var g0 = pool.length ? pool[Math.floor(ctx.rng() * pool.length)] : { t: lab || '', k: want };
      return { t: g0.t, k: want, user: true };
    }
    /* 恋愛にならない二人には、気持ちを伝える・近づく類いの長期の目標を出さない */
    if (kind === 'l' && !S.love) { base = base.filter(function (g) { return !/^(chikaku|tsutaetai)$/.test(g.k); }); rel = rel.filter(function (g) { return !/^(chikaku|tsutaetai)$/.test(g.k); }); }
    var list = rel.length && ctx.rng() < 0.45 ? rel : base;
    if (!list.length) list = base;
    return list.length ? list[Math.floor(ctx.rng() * list.length)] : null;
  }
  /* 結果の「目標」の欄に、この部屋の短期・長期の目標を出す（本体の最初の行動・目標の欄は使わない。初動の行は出さない） */
  function goalLabel(c, gs, gl) { c.goal = { id: 'kb', label: '短期「' + (gs ? gs.t : '') + '」' + (gs && gs.user ? '（選んだ目標）' : '') + '／長期「' + (gl ? gl.t : '') + '」' + (gl && gl.user ? '（選んだ目標）' : '') }; }
  /* 長期の目標の判定：二人の好意・惹かれの動き（始まりから）を基本に、結末と出来事で決める */
  function longJudge(ctx, who, g) {
    var S = f(ctx), o = who === S.A ? S.B : S.A, r = ctx.rel[who.i][o.i], r0 = S.rel0 && S.rel0[who.i] || 0;
    var d = (r.aff || 0) + (r.att || 0) - r0, base = d >= 40 ? 'near' : d < 8 || (r.ten || 0) > 40 ? 'far' : 'same', ek = S.endK;
    if (!g) return base;
    switch (g.k) {
      case 'chikaku': case 'tsutaetai': return /koi|amai/.test(ek) || S.kaeshiBy ? 'near' : ek === 'mama' ? (base === 'far' ? 'far' : 'same') : base;
      case 'konomama': return /koi|amai/.test(ek) ? 'far' : /mama|rei|date/.test(ek) ? 'near' : base;
      case 'taitou': case 'kashi': case 'orei_l': return ek === 'kaeshi' ? 'near' : base;
      case 'ongaeshi': case 'tayorare': case 'mamoru_l': return S.cares + cn(S, 'over') >= 8 ? 'near' : cn(S, 'clumsy') + cn(S, 'fail') >= 2 ? 'far' : base;
      case 'kawaritai': return cn(S, 'amae') > 0 || S.weakIn ? 'near' : base;
    }
    return base;
  }

  /* ---------- 性格で分かれる行動 ----------
     看る側：over（世話を焼きすぎる）／clumsy（不器用に失敗する）。看られる側：hide（強がって隠す）／amae（甘える）。
     態度9種と気質で選び、運命の揺らぎ（HK.PairReact.pOdd）でらしくない方に入れ替わる（記録の「らしくない」の印） */
  var CB_FIT = { devoted: 'over', gentle: 'over', polite: 'over', stern: 'over', proud: 'clumsy', tsun: 'clumsy', free: 'clumsy', shy: 'clumsy', cool: 'over' };
  var PB_FIT = { proud: 'hide', tsun: 'hide', stern: 'hide', cool: 'hide', polite: 'hide', devoted: 'amae', gentle: 'amae', free: 'amae', shy: 'amae' };
  function behOf(ctx, c, side) {
    var t = c.tr || {}, p = per(c), base = side === 'carer' ? CB_FIT[p] : PB_FIT[p];
    if (side === 'carer') { var cl = (LF.clumsy(c) ? 0.6 : 0) + (1 - (t.a != null ? t.a : 0.5)) * 0.3 + (t.impulse || 0.4) * 0.3, ov = (t.np || 0.5) * 0.6 + (t.warmth || 0.5) * 0.3; base = cl > ov + 0.15 ? 'clumsy' : ov > cl + 0.15 ? 'over' : base; }
    else { var hd = (t.cp || 0.5) * 0.5 + (1 - (t.honesty || 0.5)) * 0.4, am = (t.ac || 0.5) * 0.5 + (t.np || 0.5) * 0.3; base = hd > am + 0.15 ? 'hide' : am > hd + 0.15 ? 'amae' : base; }
    /* 目標が行動を後押しする（恩返し・甘やかしたい→世話を焼きすぎる、見せたくない→強がる、甘えたい→甘える） */
    var gs = side === 'carer' ? f(ctx).gsA : f(ctx).gsB, gl = side === 'carer' ? f(ctx).glA : f(ctx).glB, gb = (gs && GS[gs.k] && GS[gs.k].b) || (gl && GL[gl.k] && GL[gl.k].b);
    var gu = (gs && gs.user && GS[gs.k] && GS[gs.k].b) || (gl && gl.user && GL[gl.k] && GL[gl.k].b);
    if (gu) gb = gu;
    /* 立場に合わない後押し（看る側に「甘える」など）は使わない（2026-11-05 報告：表示名「〇〇が甘える」で甘えるのは相手） */
    if (gb && !(side === 'carer' ? /^(over|clumsy)$/ : /^(hide|amae)$/).test(gb)) gb = '';
    if (gb && (gu || ctx.rng() < 0.55)) base = gb;
    /* 利用者が選んだ目標の後押しは、らしくない揺らぎで入れ替えない（選んだ目標どおりに動く） */
    var odd = !gu && RC() && ctx.rng() < RC().pOdd(ctx);
    var opp = { over: 'clumsy', clumsy: 'over', hide: 'amae', amae: 'hide' };
    return { k: odd ? opp[base] : base, odd: !!odd };
  }
  /* 看病の種（日替わり。表の名前は画面に出さない）：st＝出てよい段、cook＝料理（料理をしない人は buy の種に）、chore＝家事、wk＝平日の仕事の連絡、part＝区切り */
  var CARE = [
    { k: 'okayu', st: 'rise peak fall', cook: 1, part: 'd n', alt: 'okayu_buy' },
    { k: 'okayu_buy', st: 'rise peak fall', part: 'd n', only: 'nocook' },
    { k: 'kusuri', st: 'rise peak fall', part: 'm d n' },
    { k: 'koori', st: 'rise peak', part: 'd n' },
    { k: 'kigae', st: 'peak fall', part: 'm d' },
    { k: 'ase', st: 'peak fall', part: 'd n' },
    { k: 'kaidashi', st: 'rise peak fall', part: 'd' },
    { k: 'taion', st: 'rise peak fall', part: 'm n' },
    { k: 'ringo', st: 'peak fall', cook: 1, part: 'd' },
    { k: 'kanki', st: 'fall', part: 'm d' },
    { k: 'byoin', st: 'rise peak', part: 'd', sev: 'mid heavy' },
    { k: 'sentaku', st: 'fall', chore: 1, part: 'd' },
    { k: 'mizu', st: 'rise peak fall', part: 'm d n' }
  ];

  /* ---------- 箱庭 ---------- */
  var scen = {
    id: ID, name: '看病の部屋', kicker: 'ふたり・看病',
    desc: 'どちらかが体調を崩し、もう一人が看病する数日を、朝・日中・夜ごとに眺める。熱がいちばん高い夜を越えて治ったあと、二人の関係が少し動く。',
    note: '※参加は3人まで（三人目は見舞いに来る側）。登場人物はすべて成人として扱います。くわしくは「この箱庭のTIPS」に。',
    unit: '日', perUnit: 3, preRel: 0, lethal: false, minCast: 2, maxCast: 3,
    catBias: { romance: 1, bond: 1.2, help: 1.2, conflict: 0.2, combat: 0, betray: 0, kill: 0 },
    decay: 0.998, actRate: 0.15,
    derived: ['warmth', 'honesty', 'jealous', 'impulse'],
    env: [
      { id: 'days', label: '日数', min: 3, max: 7, def: 5, lo: '3日', hi: '7日', unit: '日', desc: '見守る日数。1日は朝・日中・夜の3区切り。熱は上がって、いちばん高い夜を越え、治ったあとの日も少し残る' },
      { id: 'sev', label: '病の重さ', type: 'select', def: 'mid', options: [{ v: 'light', label: '軽い風邪（微熱とだるさ）' }, { v: 'mid', label: '熱が出る（ふつう）' }, { v: 'heavy', label: '寝込む（高い熱が続く）' }], desc: '重いほど熱が高く、治るまでの日数が長い' },
      { id: 'live', label: '同居か通いか', type: 'select', def: 'auto', options: [{ v: 'auto', label: 'おまかせ（二人の関係から）' }, { v: 'together', label: '同居（同じ家で看病する）' }, { v: 'visit', label: '通い（同居していないが、毎日看に来る）' }, { v: 'apart', label: '同居していない（来られる日だけ。連絡と差し入れが中心）' }],
        desc: '通いなら、看病する人が朝に来て夜に帰る（熱がいちばん高い夜は泊まり込む）。同居していないなら、来られる日だけ顔を出し、ほかの日は電話やメッセージで様子を聞く（泊まる日は特別）。おまかせは、夫婦・家族は同居、恋人は同居か通い、友人・同僚・片想いなどは同居していない寄り' },
      { id: 'cont', label: 'うつりやすさ', type: 'select', def: 'mid', options: [{ v: 'low', label: 'うつりにくい' }, { v: 'mid', label: 'ふつう' }, { v: 'high', label: 'うつりやすい' }], desc: '高いほど、治ったあとに看病した人へうつり、今度は看病し返す結末になりやすい（日数が足りないときは起きない）' },
      { id: 'outsideNames', label: '登場しない住人を出す', type: 'select', def: 'yes', options: [{ v: 'yes', label: '出す（名簿の住人のうち、二人と関係のある人が見舞いに来る・差し入れ・連絡をくれる）' }, { v: 'no', label: '出さない（二人と、参加者だけ）' }],
        desc: '名簿にいて今回は参加していない住人のうち、二人のどちらかと関係（家族・擬似親子・友人・同僚・先輩後輩・同級生・元恋人・知人）がある人（三人まで）が、名簿の性格・口調・関係のまま、見舞いに来たり、差し入れを届けたり、連絡をくれたりします。見舞いに来る住人は関係図に出ず、その人との恋愛も始まりません。参加者の三人目（住人ごとの「立場」で「見舞いに来る側」にした人）は、この設定にかかわらず同じように出ます' }
    ],
    stats: [],
    perFields: [
      { id: 'part', label: '立場', auto: 'おまかせ（性格・仕事の型から。上の二人が看病する側とされる側）', options: [{ id: 'carer', label: '看病する側' }, { id: 'patient', label: '看病される側（体調を崩す）' }, { id: 'guest', label: '見舞いに来る側' }] },
      { id: 'work', label: '仕事の型', auto: 'おまかせ（気質から）', options: LF.WORK.map(function (w) { return { id: w.v, label: w.label }; }) },
      { id: 'job', label: '職業', type: 'text', placeholder: function () { return '例：営業、看護師（空欄でもよい）'; } },
      { id: 'role', label: '家事の得意さ', auto: 'おまかせ（気質から）', options: LF.ROLE.map(function (r) { return { id: r.v, label: r.label }; }) },
      { id: 'sgoal', label: '短期目標', auto: 'おまかせ（立場と性格から）', groups: true, options: goalOpts('s') },
      { id: 'lgoal', label: '長期目標', auto: 'おまかせ（立場と性格から）', groups: true, options: goalOpts('l') }
    ],
    /* 最初の行動・本体の目標の欄は使わない（選べるものが一つしかなく意味がないため、欄ごと出さない。2026-11-04 不具合リスト 1104 の 4）。
       目標は住人ごとの欄「短期目標」「長期目標」（perFields の sgoal・lgoal）で選ぶ。結果の目標の行は goalLabel が書く */
    actions: [],
    goals: [],
    stepGroup: function (label) { var m = /^(DAY\d+（.）)(.+)$/.exec(label); return m ? { group: m[1], sub: m[2] } : null; },
    steps: function (env) {
      var n = Math.max(3, Math.min(7, +env.days || 5)), s = [];
      for (var d = 0; d < n; d++) for (var t = 0; t < 3; t++) s.push('DAY' + (d + 1) + '（' + WEEK[d % 7] + '）' + PART[t]);
      return s;
    },
    othersFor: function (ctx, a) { var S = ctx.kb; return ctx.present().filter(function (c) { return c !== a && (!S || ((a === S.A || a === S.B) && (c === S.A || c === S.B))); }); },
    setup: function (ctx) { setup(ctx); },
    phase: function (ctx, s, n) { phase(ctx, s, n); },
    finish: function (ctx) { finish(ctx); },
    events: []
  };
  if (!HK.SAFE_BUILD) scen.env.push({ id: 'lewdN', label: 'エッチの回数（R18）', type: 'select', def: 'mid', options: [{ v: 'none', label: 'なし' }, { v: 'low', label: '少なめ（1回まで）' }, { v: 'mid', label: 'ふつう（2回まで）' }, { v: 'high', label: '多め（3回まで・一度は長い場面）' }], desc: 'エッチの場面の回数の上限（体の関係にしてよい二人だけ）。多くは治ったあとに起きるが、恋人どうし・体の関係・両片想いの二人は、熱が下がってきた夜（看る人が来ている夜）にも起こりうる（一回の遊びで起きるのは、少なめで 1 割ほど・ふつうで 3 割ほど・多めで半分ほど。熱が上がっていく日・いちばん高い日には無し。翌日は熱がぶり返したり、看る人にうつりやすくなったりする）。多めなら、最後のエッチは段落を分けた長い場面になる（描写の長さが「数行で短く」のときを除く）' });
  /* 本体の共通の出来事から外すもの：体の関係の出来事（夜は kanbyo-r18.js がきっかけの段を付けて出す）・合意のない展開・三人以上の恋愛・告白（この部屋の結末で扱う）など */
  var EX_ID = /^(?:confess|take_charge|brood|lighten|mob_after|tie_spouse|grp_|poly_|ct_|cf_)/;
  function exList() { return (HK.COMMON || []).filter(function (e) { return e.sex || e.force || EX_ID.test(e.id); }).map(function (e) { return e.id; }); }
  Object.defineProperty(scen, 'exclude', { get: exList, enumerable: true, configurable: true });

  /* ---------- 始まり ---------- */
  function setup(ctx) {
    var C = ctx.chars, cp = couple(C, ctx.input), X = cp[0], Y = cp[1] || cp[0], env = ctx.env;
    var days = Math.max(3, Math.min(7, +env.days || 5));
    [X, Y].forEach(function (c) {
      var job = pickOfChar(ctx, c, 'job');
      c.life = { job: job ? String(job).slice(0, 20) : '' };
      var pw = pickOfChar(ctx, c, 'work');
      if (pw && pw !== 'auto') LF.work(ctx, c, pw);
      LF.role(ctx, c, pickOfChar(ctx, c, 'role'));
      LF.work(ctx, c, pw);
    });
    /* 看病する側（A）・される側（B） */
    var px = partOf(ctx.input, X.i), py = partOf(ctx.input, Y.i), A, B;
    /* 立場が「おまかせ」で、立場の決まった目標を選んでいれば、その立場にする（二人とも同じ側を選んでいたら、上の人を先に） */
    var fixed = function (v) { return v === 'carer' || v === 'patient'; };
    if (!fixed(px) && !fixed(py)) { px = goalPart(ctx, X); if (!px) { var gy = goalPart(ctx, Y); if (gy) px = gy === 'carer' ? 'patient' : 'carer'; } }
    if (px === 'patient' || py === 'carer') { A = Y; B = X; }
    else if (px === 'carer' || py === 'patient') { A = X; B = Y; }
    else { var sx = sickScore(X) + careScore(Y), sy = sickScore(Y) + careScore(X); if (ctx.rng() < sx / (sx + sy)) { B = X; A = Y; } else { B = Y; A = X; } }
    var rk = relKind(ctx, A, B);
    /* 血縁の言い方（親子・きょうだい・親戚）：名簿の関係から（家族の文の置き換えに使う） */
    var famW = '';
    if (rk === 'fam') (HK.Ties && HK.Ties.all ? HK.Ties.all(ctx, A, B) || [] : []).forEach(function (t) { if (!t || famW) return; famW = t.type === 'parent' ? '親子' : /^(sibling|sibprot|sibclose|sibbad|twin|stepsib)$/.test(t.type) ? 'きょうだい' : t.type === 'relative' ? '親戚' : ''; });
    var S = ctx.kb = { famW: famW, days: days, A: A, B: B, G: C.filter(function (c) { return c !== A && c !== B; }), rk: rk, grp: RK_GRP[rk], used: {},
      sev: /^(light|mid|heavy)$/.test(env.sev) ? env.sev : 'mid', cont: /^(low|mid|high)$/.test(env.cont) ? env.cont : 'mid',
      love: canLove2(ctx, A, B) && !/^(fam|pfam)$/.test(rk), couple: /^(spouse|lover)$/.test(rk), sex: 0, lewdMax: 0, visits: 0, cares: 0, behs: 0, odd: 0, endK: null, confessed: false, dated: false };
    /* 本体の恋愛の可否（恋愛相手の固定など）も見る */
    if (S.love && ctx.romanceOk && !ctx.romanceOk([A, B], false)) S.love = false;
    S.pine = S.love && /^(almost|crush)$/.test(rk);
    /* 始まりのときから恋人どうし（夫婦・恋人）か（告白で恋人になった二人と分ける。初めての夜の日数の下限に使う） */
    S.couple0 = S.couple; S.fwb = rk === 'fwb';
    /* 関係が進まない二人の「体だけ」の夜（2026-11-05 利用者の回答）：関係の欄の体の関係が「あり」（t.body＝'ok'・HK.tieBodyOK）なら、
       夜の起こりやすさ（本体の共通の値 night。0〜100）の割合で、関係はそのまま体だけの夜を起こす（100 なら必ず一度）。恋人・夫婦・セフレは今までどおり */
    S.bodyOnly = !S.couple0 && !S.fwb && bodyTie(ctx, A, B);
    S.bodyGo = S.bodyOnly && !HK.SAFE_ON && ctx.rng() * 100 < (env.night != null && env.night !== '' ? +env.night : 50);
    S.rkKey = relDir(ctx, A, B, rk);
    /* 同居か通いか（おまかせ：夫婦・家族はいつも同居、恋人は半々、ほかは通い） */
    S.feud = FEUD_RK.test(rk);
    S.live = /^(together|visit|apart)$/.test(env.live) ? env.live : rk === 'spouse' || rk === 'fam' || rk === 'pfam' ? 'together' : rk === 'lover' ? (ctx.rng() < 0.5 ? 'together' : 'visit') : (ctx.rng() < 0.6 ? 'apart' : 'visit');
    S.G.forEach(function (g) { g.gone = true; g.life = g.life || { job: '' }; if (pickOfChar(ctx, g, 'outside')) g.outside = true; });
    plan(ctx, S);
    S.cnt = {};
    S.gsA = goalOf(ctx, A, 'carer', 's'); S.glA = goalOf(ctx, A, 'carer', 'l'); S.gsB = goalOf(ctx, B, 'patient', 's'); S.glB = goalOf(ctx, B, 'patient', 'l');
    goalLabel(A, S.gsA, S.glA); goalLabel(B, S.gsB, S.glB);
    /* 本体の最初の行動・目標の欄（この部屋は空）：結果に初動の行を出さず、見舞いに来る側の目標の行も出さない。おまかせの一文（初動は…）も出さない */
    C.forEach(function (c) { if (!c.action) c.action = { id: 'live', label: '' }; if (!c.goal) c.goal = { id: 'kb', label: '' }; c.autoAction = false; c.autoGoal = false; });
    S.cb = behOf(ctx, A, 'carer'); S.pb = behOf(ctx, B, 'patient');
    /* 同居していない：看る人が来られる日（熱がいちばん高い日は 75%、治った日はいつも来る。来られない山場は電話越しの弱音） */
    S.come = {};
    for (var cd = 0; cd < days; cd++) S.come[cd] = S.live !== 'apart' || cd >= S.heal || (cd === S.peak ? ctx.rng() < 0.75 : ctx.rng() < 0.5);
    /* 病気の間に一度も来られない配置にはしない（来られる日が無ければ、熱が下がり始めた日か、いちばん高い日に来る） */
    if (S.live === 'apart' && !Object.keys(S.come).some(function (k) { return +k < S.heal && S.come[k]; })) S.come[S.heal - 1 > S.peak ? S.heal - 1 : S.peak] = true;
    /* うつる：治った日の翌日から看病した人が寝込む（日数が足りるときだけ）。うつりやすさ・同居・近くで世話をする行動で起こりやすく */
    /* うつりやすさ「うつりやすい」は 8 割以上（2026-11-05 報告：高いのにうつらない回）。日数が足りるときだけ */
    var pc = { low: 0.08, mid: 0.25, high: 0.85 }[S.cont] * (S.live === 'together' ? 1.1 : 1) + (S.pb.k === 'amae' ? 0.06 : 0) + (S.cb.k === 'over' ? 0.05 : 0);
    /* うつりやすい設定は、治った日の翌日が最後の日でもうつる（最後の日は看病し返す一日。2026-11-05） */
    if ((S.heal <= days - 3 || (S.cont === 'high' && S.heal <= days - 2)) && ctx.rng() < pc) mkKaeshi(ctx, S, '');
    if (!HK.SAFE_ON && HK.KanbyoR18 && HK.KanbyoR18.quota) S.lewdMax = HK.KanbyoR18.quota(ctx, env.lewdN);
    ctx.place = S.live === 'together' ? '二人の家' : B.name + 'の部屋';
    /* 導入：なぜ看病することになったか（関係ごとの段）と、体調を崩したわけ（仕事の型・重さ） */
    var Tx = TX(), intro = relPick(ctx, Tx.INTRO, A, B) || '{b}が体調を崩した。{a}は、その看病をすることになった。';
    var cause = pickT(ctx, ((Tx.CAUSE || {})[B.life.work] || []).concat((Tx.CAUSE || {}).all || []), A, B);
    var liv = pickT(ctx, (Tx.LIVE || {})[S.live], A, B);
    var fw = S.feud ? pickT(ctx, (Tx.FEUD_WHY || {})[per(A)] || (Tx.FEUD_WHY || {}).gentle, A, B) : '';
    var tx = fill(ctx, cause, A, B) + fill(ctx, intro, A, B, { rel: RK_NAME[rk] }) + (fw ? fill(ctx, fw, A, B) : '') + (liv ? fill(ctx, liv, A, B) : '');
    /* 始まりで「駆けつけた」なら、同居していなくても初日は来ている（2026-11-05 報告：駆けつけたのに 1 日目はひとりで寝込む） */
    if (S.live === 'apart' && /駆けつけ|飛んでき|看病に来|訪ねて|やってきた/.test(tx)) S.come[0] = true;
    ctx.act2({ actors: [A, B], cat: 'bond', text: tx, why: '看病の部屋：始まり（' + RK_NAME[rk] + '・' + B.name + 'が体調を崩した）' });
  }

  /* ---------- 一日 ---------- */
  var REST_RATE = 1e-9, PART_K = ['m', 'd', 'n'];
  function workOut(c) { return !!(c && c.life && c.life.work && !/^(home|remote)$/.test(c.life.work)); }
  /* 区切りに何も出なかった（見出しだけの区切り）ときは、治ったあと・うつった人が治った日なら関係ごとの段で埋める（2026-11-04 報告） */
  /* 一回の遊びで同じ文（18 字以上）を二度出さない：前の区切りまでに増えた記録（本体の出来事・キスの段を含む）から、もう出た文を外す。
     文が全部外れた記録は消す（2026-11-04 報告：同じ文が回をまたいで・一回の中で何度も出る） */
  function dedupeLog(ctx, S) {
    var L = ctx.log || [], U = S.sentU = S.sentU || {};
    for (var i = S.dedupAt || 0; i < L.length; i++) {
      var e = L[i]; if (!e || e.kind !== 'event' || typeof e.text !== 'string') continue;
      /* 同じ出来事の文を名前の向きだけ替えて二度出さない（本体の共通の出来事の短い文。2026-11-05） */
      var fk = '#' + (ctx.chars || []).reduce(function (t, c) { return c && c.name ? t.split(c.name).join('＊') : t; }, e.text).replace(/\s/g, '');
      if (fk.length >= 20 && !e.lewd && e.tag !== '山場' && e.tag !== 'きっかけ') { if (U[fk]) { L.splice(i, 1); i--; continue; } U[fk] = 1; }
      var out = [], cut = false, cur = '', d = 0, tx = e.text;
      for (var k = 0; k < tx.length; k++) {
        var c = tx.charAt(k); cur += c;
        if (c === '「') d++; else if (c === '」') d = Math.max(0, d - 1);
        if ((!d && /[。！？]/.test(c)) || k === tx.length - 1 || (c === '\n' && !d)) {
          var key = cur.replace(/「[^」]*」/g, '「」').replace(/\s/g, '');
          if (key.length >= 18 && U[key] && e.tag !== '山場' && e.tag !== 'きっかけ') cut = true; else { if (key.length >= 18) U[key] = 1; out.push(cur); }
          cur = '';
        }
      }
      if (cut) { var nt = out.join('').replace(/^\n+|\n+$/g, '').replace(/\n{3,}/g, '\n\n'); if (nt.replace(/\s/g, '').length < 8 && !e.lewd) { L.splice(i, 1); i--; continue; } e.text = nt; }
    }
    S.dedupAt = L.length;
  }
  function phase(ctx, s, n) {
    var S = f(ctx);
    if (S && S.A !== S.B) dedupeLog(ctx, S);
    var n0 = (ctx.log || []).length;
    phase0(ctx, s, n);
    if (!S || S.A === S.B || S.ended || (ctx.log || []).length > n0) return;
    var d = Math.floor(s / 3), t = s % 3, st = stageOf(S, d), ks = kStage(S, d);
    if (ks === 'ksick') { ktalk(ctx); return; }
    if (st === 'heal' || st === 'after') afterRel(ctx, ['m', 'd', 'n'][t], TX()[['AFTER_M', 'AFTER_D', 'AFTER_N'][t]]);
  }
  function phase0(ctx, s, n) {
    var S = f(ctx), A = S.A, B = S.B, d = Math.floor(s / 3), t = s % 3;
    if (A === B) return;
    /* 関係の値の始まり（関係の設定の値に、看病の距離の近さを少し足す） */
    if (s === 0) { ctx.mod2(A, B, { aff: 8, trust: 6 }, { aff: 8, trust: 6 }); S.rel0 = {}; S.rel0[A.i] = ctx.rel[A.i][B.i].aff + ctx.rel[A.i][B.i].att; S.rel0[B.i] = ctx.rel[B.i][A.i].aff + ctx.rel[B.i][A.i].att; }
    var st = stageOf(S, d), ks = kStage(S, d), sick = st === 'rise' || st === 'peak' || st === 'fall' || ks === 'ksick';
    /* 本体の共通の出来事は、治ったあとに一回の遊びで 2 件まで（同じ出来事・同じ文が何度も出ないように。2026-11-04 報告） */
    var L0 = ctx.log || []; S.genN = S.genN || 0;
    for (var gi = S.genSeen || 0; gi < L0.length; gi++) { var ge = L0[gi]; if (ge && ge.kind === 'event' && ge.why && !/^看病の部屋|^きっかけ|話題/.test(ge.why)) S.genN++; }
    S.genSeen = L0.length;
    scen.actRate = sick || S.genN >= 2 ? REST_RATE : 0.15;
    /* 最後の夜は結末の段で終える（結末のあとに本体の出来事を出さない。2026-11-04 報告） */
    if (d === S.days - 1 && t === 2) scen.actRate = REST_RATE;
    /* 本体の気分の一句は付けない（病気の間だけでなく治ったあとも。同じ一句が一回の遊びで何度も出たため。2026-11-04） */
    if (ctx.stepIndex != null) ctx._emoWS = ctx.stepIndex;
    if (t === 0) S.day = { d: d, st: st, ks: ks, hol: holiday(d), visited: false, care: 0 };
    S.part = PART_K[t];
    var day = S.day, last = d === S.days - 1;
    /* 通い・同居していない看る人の仕事（2026-11-05 報告：同僚が毎日朝から晩まで看病して仕事に触れない）：外で働く人は、平日の病気の間（初日・いちばん高い日は休みを取る）、日中は仕事に出る */
    if (t === 0) day.work = S.live !== 'together' && workOut(A) && !day.hol && d > 0 && st !== 'peak' && (st === 'rise' || st === 'fall') && S.come[d] && ctx.rng() < 0.7;
    if (ks === 'ksick' || ks === 'kheal') { kaeshiStep(ctx, day, t, last); return; }
    if (st === 'heal' || st === 'after') { healStep(ctx, day, t, last); return; }
    /* 病気の間（rise・peak・fall）。同居していない日で看る人が来ない日は、ひとりで寝込む段と連絡の段（alone） */
    var here = S.come[d];
    if (!here) { aloneStep(ctx, day, t, last); return; }
    if (t === 0) {
      arrive(ctx, day);
      if (S.sickSexDay === d - 1) afterIll(ctx, day);
      morning(ctx, day);
      care(ctx, day, 'm');
      talk(ctx, day, 'm');
      return;
    }
    if (t === 1) {
      if (d === 0 && !day.hol) rest(ctx, day);
      /* いちばん高い日は、外で働く通いの看る人も休みを取る */
      else if (day.st === 'peak' && !day.hol && S.live !== 'together' && workOut(A) && !S.peakRest) { S.peakRest = true; var pr = pickT(ctx, (TX().REST || {}).carer_peak, A, B); if (pr) ctx.act2({ actors: [A, B], cat: 'bond', text: fill(ctx, pr, A, B), why: '看病の部屋：熱がいちばん高い日に仕事を休んだ（' + A.name + '）' }); }
      if (day.work) { workGap(ctx, day); visit(ctx, day, 'd'); return; }
      care(ctx, day, 'd');
      if (!chores(ctx, day)) { if (S.feud && ctx.rng() < 0.55) feud(ctx, day); else behave(ctx, day); }
      visit(ctx, day, 'd');
      talk(ctx, day, 'd');
      if (ctx.rng() < 0.3) care(ctx, day, 'd');
      return;
    }
    /* 夜 */
    if (st === 'peak') { weakNight(ctx, day); }
    else {
      care(ctx, day, 'n');
      /* 通い・同居していない夜は帰るので、「自分も横になった」の文は使わない */
      var nt = pickT(ctx, (((TX().NIGHT || {})[st]) || []).filter(function (x) { return S.live === 'together' || !/自分も横になった|隣で眠|朝まで/.test(x); }), A, B);
      if (nt) ctx.act2({ actors: [A, B], cat: 'bond', text: fill(ctx, nt, A, B, { temp: tempOf(S, day.d) }) + careReact(ctx, A, B, 0.35), why: '看病の部屋：看病の夜（' + (st === 'rise' ? '熱が上がっていく' : '熱が下がり始めた') + '）', fx: function () { ctx.mod2(A, B, { aff: 1, trust: 1 }, { aff: 2, trust: 2 }); } });
      visit(ctx, day, 'n');
      talk(ctx, day, 'n');
    }
    if (day.scold) scoldLater(ctx, day);
    /* 病気の道中の夜（R18。看る人が来ている夜だけ。寝込むほどの熱のいちばん高い夜は無し） */
    var ill = illNight(ctx, day, last);
    if ((ill || st === 'peak') && S.live !== 'together') S.stayN = d;
    /* 帰る段：翌日に来るか（同居していない日）で、「また明日」と「次はまた今度」を分ける（2026-11-05 報告：「また今度」の翌朝に来る） */
    if (!ill && st !== 'peak' && S.live !== 'together') { var nx = S.come[d + 1] !== false && d + 1 < S.days, LT = S.live === 'apart' ? TX().LEAVE_APART || TX().LEAVE || {} : TX().LEAVE || {};
      say1(ctx, filtT(LT, function (x) { return nx ? !/また今度|しばらく来られ|明日は来られ/.test(x) : !/また明日|明日も来|明日の朝/.test(x); }), A, B, 'kb_leave', '看病の部屋：' + A.name + 'が帰った', 'bond'); }
    if (last) ending(ctx);
  }
  /* 通い・同居していない日の朝：前の晩に泊まったなら「泊まった朝」、前の日にも来ていたなら「久しぶり」の文を使わない（2026-11-04 報告） */
  function arrive(ctx, day) {
    var S = f(ctx), A = S.A, B = S.B, Tx = TX(), d = day.d;
    if (S.live === 'together') return;
    if (S.stayN === d - 1) { say1(ctx, Tx.MORN_STAY || {}, A, B, 'kb_arrive', '看病の部屋：泊まり込んだ朝（' + A.name + '）', 'bond'); return; }
    if (S.live === 'apart') {
      var T0 = Tx.ARRIVE_APART || {}, came = d === 0 || S.come[d - 1];
      var T1 = {}; Object.keys(T0).forEach(function (k) { T1[k] = (T0[k] || []).filter(function (x) { return !came || !/久しぶり/.test(x); }); });
      say1(ctx, day.work && Tx.ARRIVE_WORK ? Tx.ARRIVE_WORK : T1, A, B, 'kb_arrive', '看病の部屋：看病に来られた日（' + A.name + 'が来た' + (day.work ? '・出勤の前' : '') + '）', 'bond');
    } else if (d > 0) say1(ctx, day.work && Tx.ARRIVE_WORK ? Tx.ARRIVE_WORK : Tx.ARRIVE || {}, A, B, 'kb_arrive', '看病の部屋：通いの看病（' + A.name + 'が来た' + (day.work ? '・出勤の前' : '') + '）', 'bond');
  }
  /* ---------- 同居していない日（看る人が来ない日）：ひとりで寝込む人（{b}）の段と、連絡（電話・メッセージ）の段 ---------- */
  function aloneStep(ctx, day, t, last) {
    var S = f(ctx), A = S.A, B = S.B, Tx = TX();
    if (t === 0) {
      /* 前の晩に泊まった看る人は、朝のうちに帰っていく */
      if (S.stayN === day.d - 1) say1(ctx, Tx.LEAVE_MORN || {}, A, B, 'kb_leave', '看病の部屋：' + A.name + 'が朝のうちに帰った', 'bond');
      var AL = Tx.ALONE || {}, at = pickT(ctx, AL[per(B)] || AL.gentle, A, B) || pickT(ctx, [].concat.apply([], Object.keys(AL).map(function (k) { return AL[k]; })), A, B);
      if (at) ctx.act2({ actors: [B], cat: 'solo', text: fill(ctx, at, A, B, { temp: tempOf(S, day.d) }), why: '看病の部屋：ひとりで寝込む朝（' + B.name + '・' + tempOf(S, day.d) + '）' });
      return;
    }
    if (t === 1) {
      if (day.d === 0 && !day.hol) rest(ctx, day);
      say1(ctx, Tx.TEL || {}, A, B, 'kb_tel', '看病の部屋：電話・メッセージで様子を聞いた（' + A.name + 'から）', 'bond');
      visit(ctx, day, 'd');
      return;
    }
    if (day.st === 'peak') { weakTel(ctx, day); }
    else { var nt = pickT(ctx, Tx.ALONE_N, A, B); if (nt) ctx.act2({ actors: [B, A], cat: 'bond', text: fill(ctx, nt, A, B), why: '看病の部屋：ひとりで寝込む夜（' + B.name + '）' }); }
    if (last) ending(ctx);
  }
  /* 来られなかった山場：電話越しの弱音（必ず出す） */
  function weakTel(ctx, day) {
    var S = f(ctx), A = S.A, B = S.B, Tx = TX();
    var w = pickT(ctx, (Tx.WEAK_TEL || {})[per(B)] || (Tx.WEAK_TEL || {}).gentle, A, B, true) || '夜中、{b}は{a}に電話をかけた。「……声が、聞きたくて｜……声が聞きたかった｜……声が、聞きたかったんです」';
    var ans = pickT(ctx, (Tx.WEAK_TEL_ANS || {}).all, A, B, true);
    var e = ctx.act2({ actors: [B, A], cat: S.love && (S.couple || S.pine) ? rcat(ctx, A, B) : 'bond', text: fill(ctx, w, A, B, { temp: tempOf(S, S.peak) }) + (ans ? fill(ctx, ans, A, B) : ''), why: '看病の部屋：熱がいちばん高い夜の弱音（' + B.name + '・' + tempOf(S, S.peak) + '・電話越し）', fx: function () { ctx.mod2(A, B, { aff: 3, trust: 3 }, { aff: 4, trust: 4 }); } });
    if (e) { e.tag = '山場'; S.weak = true; }
  }
  /* ---------- 家事の設定で変わる出来事（HK.Life の役割で。担い手の決まりは HK.PairKit.choreOk が文ごとに見る） ----------
     ・普段家事をしている人（役割の家事の度合い 0.5 以上）が倒れた：看る人（家事をする設定の人だけ）がたどたどしい家事を頑張る（失敗・意外とできる・指示される）
     ・倒れた人が寝ていられずに家事をやろうとして悪化させる（看る人が止める／気づかず、あとで叱る）。一回の遊びで一度
     ・普段家事をしない人（家事をしない設定）が倒れた：世話されるのに慣れている・申し訳なさ（態度9種）。一回の遊びで一度 */
  function choreLv(c) { var r = LF.roleInfo(c.life && c.life.role); return r ? r.chores : 0.5; }
  function chores(ctx, day) {
    var S = f(ctx), A = S.A, B = S.B, Tx = TX(), keeper = LF.canChore(B) && choreLv(B) >= 0.5;
    if (keeper && !S.choreTry && day.st !== 'peak' && ctx.rng() < 0.4) {
      S.choreTry = true;
      var t = pickT(ctx, Tx.CHORE_TRY, A, B);
      if (!t) return false;
      var stop = ctx.rng() < 0.55, R = stop ? Tx.CHORE_STOP || {} : {}, rt = stop ? pickT(ctx, R[per(A)] || R.gentle, A, B) : pickT(ctx, Tx.CHORE_MISS, A, B);
      if (!stop) day.scold = true;
      S.cnt.choreTry = (S.cnt.choreTry || 0) + 1;
      ctx.act2({ actors: [B, A], cat: 'bond', text: fill(ctx, t, A, B) + (rt ? fill(ctx, rt, A, B) : ''), why: '看病の部屋：寝ていられずに家事をしようとした（' + B.name + (stop ? '・' + A.name + 'が止めた' : '・' + A.name + 'は気づかなかった') + '）', fx: function () { ctx.mod2(A, B, { aff: 1, ten: 2 }, { aff: 1 }); } });
      relapse(ctx, day, stop ? 0.3 : 0.7);
      return true;
    }
    if (keeper && LF.canChore(A) && !day.choreA && ctx.rng() < 0.45) {
      day.choreA = true;
      var ta = A.tr || {}, oc = LF.clumsy(A) || (ctx.rng() < 0.35 + (1 - (ta.a != null ? ta.a : 0.5)) * 0.3) ? 'fail' : /stern|polite|devoted/.test(per(B)) && ctx.rng() < 0.6 ? 'told' : 'ok';
      if (oc === 'fail') S.cnt.fail = (S.cnt.fail || 0) + 1;
      var ct = pickT(ctx, (Tx.CHORE_A || {})[oc], A, B);
      if (!ct) return false;
      var RE = Tx.CHORE_A_RE || {}, cr = pickT(ctx, RE[per(B)] || RE.gentle, A, B);
      ctx.act2({ actors: [A, B], cat: 'bond', text: fill(ctx, ct, A, B) + (cr ? fill(ctx, cr, A, B) : ''), why: '看病の部屋：慣れない家事を頑張った（' + A.name + '・' + { fail: '失敗した', ok: '意外とできた', told: B.name + 'に教わった' }[oc] + '）', fx: function () { ctx.mod2(A, B, { aff: 1 }, { aff: 2, trust: 1 }); } });
      return true;
    }
    if (!LF.canChore(B) && !S.noChore && ctx.rng() < 0.35) {
      S.noChore = true;
      var NC = Tx.NOCHORE || {}, nt = pickT(ctx, NC[per(B)] || NC.gentle, A, B);
      if (!nt) return false;
      ctx.act2({ actors: [B, A], cat: 'bond', text: fill(ctx, nt, A, B), why: '看病の部屋：世話をされる側の顔（' + B.name + '・普段は家事をしない）' });
      return true;
    }
    return false;
  }
  function scoldLater(ctx, day) {
    var S = f(ctx), A = S.A, B = S.B, R = TX().CHORE_SCOLD || {}, t = pickT(ctx, R[per(A)] || R.gentle, A, B);
    if (t) ctx.act2({ actors: [A, B], cat: 'bond', text: fill(ctx, t, A, B), why: '看病の部屋：家事をしようとしたのをあとで叱った（' + A.name + 'から）' });
  }
  /* 熱のぶり返し：治る日を一日のばす（うつる予定・日数が足りないときは、のばさずに文だけ） */
  function relapse(ctx, day, p) {
    var S = f(ctx);
    if (ctx.rng() > p) return false;
    S.relapse = (S.relapse || 0) + 1;
    var cap = S.days >= 4 ? S.days - 2 : S.days - 1;
    if (!S.kaeshi && S.heal + 1 <= cap && day.d < S.heal) { S.heal++; S.healMoved = (S.healMoved || 0) + 1; }
    return true;
  }
  /* ---------- 仲の悪い二人の、素直になれない看病（不仲・ライバル・愛憎・元恋人） ---------- */
  function feud(ctx, day) {
    var S = f(ctx), A = S.A, B = S.B, Tx = TX();
    var t = relPick(ctx, Tx.FEUD_CARE || {}, A, B);
    if (!t) return behave(ctx, day);
    var BK = Tx.FEUD_BACK || {}, bk = ctx.rng() < 0.6 ? pickT(ctx, BK[per(B)] || BK.gentle, A, B) : '';
    ctx.act2({ actors: [A, B], cat: 'bond', text: fill(ctx, t, A, B, { temp: tempOf(S, day.d) }) + (bk ? fill(ctx, bk, A, B) : ''), why: '看病の部屋：素直になれない看病（' + RK_NAME[S.rk] + '）', fx: function () { ctx.mod2(A, B, { aff: 2, ten: -2 }, { aff: 2, ten: -2 }); } });
  }
  /* ---------- 病気の道中の夜（R18。kanbyo-r18.js の HK.KanbyoR18.ill） ---------- */
  function illNight(ctx, day, last) {
    var S = f(ctx);
    if (HK.SAFE_ON || !HK.KanbyoR18 || !HK.KanbyoR18.ill) return false;
    /* 別室でひとりでしていた翌晩：「今日もするのか……？」（そこから始まる夜か、大人しく寝る） */
    if (S.jiiDay != null && S.jiiDay === day.d - 1 && HK.KanbyoR18.jiiNext) {
      var jn = HK.KanbyoR18.jiiNext(ctx, day, S.sex < S.lewdMax && !(S.sev === 'heavy' && day.st === 'peak'));
      if (jn) { S.sex++; S.sickSexDay = day.d; }
      return jn;
    }
    if (S.sex >= S.lewdMax || S.illSex) return false;
    /* 寝込むほど重いときのいちばん高い夜は無し。重いときは熱が下がってきた日だけ、ふつうは上がる日・下がる日、軽い風邪はいつでも */
    /* 熱が下がってきた日だけ（きっかけの文「熱は少し下がっていたが」と合う日。熱が上がっていく日・いちばん高い日は無し）。
       恋人どうし（夫婦・恋人）・体の関係（セフレ）・両片想いの二人だけ（恋愛の流れの無い二人に、熱のある夜の場面を先に出さない）。2026-11-04 報告 */
    if (day.st !== 'fall') return false;
    if (!(S.couple0 || S.fwb || S.rk === 'almost')) return false;
    /* 起こりやすさ（2026-11-04 利用者「2% は少なすぎる。30% かな」）：一回の遊びで起きる割合を回数の設定ごとに決め、
       その遊びの「看る人が来ている熱の下がってきた夜」の数で割り振る（日数が短くても長くても、条件を満たす夜があれば同じくらい起きる）。
       少なめ 21%・ふつう 42%・多め 88%（恋人どうし。ほかの二人は 0.8 倍。性欲で上下）。熱の下がる日の無い遊び（軽い風邪など）があるので、遊び全体ではおよそ 12%・30%・50% */
    if (S.illN == null) { S.illN = 0; for (var fd = 0; fd < S.days; fd++) if (stageOf(S, fd) === 'fall' && S.come[fd]) S.illN++; }
    var P = HK.Pos, pg = ({ low: 0.21, mid: 0.42, high: 0.88 }[ctx.env.lewdN] || 0) * (S.couple0 ? 1 : 0.8) * (P && P.libMul ? Math.min(1.3, P.libMul([S.A, S.B])) : 1);
    var pn = 1 - Math.pow(1 - Math.min(0.95, pg), 1 / Math.max(1, S.illN - (S.illTry || 0)));
    S.illTry = (S.illTry || 0) + 1;
    if (ctx.rng() > pn) return false;
    var r = HK.KanbyoR18.ill(ctx, day, last);
    if (r) { S.sex++; S.illSex = true; if (S.illEntry !== 'jii') S.sickSexDay = day.d; }
    return r;
  }
  /* 病気の道中のエッチの翌朝：反省・甘やかし。熱がぶり返す・看る人にうつりやすくなる */
  function afterIll(ctx, day) {
    var S = f(ctx), A = S.A, B = S.B, Tx = TX();
    /* 治った日の朝はぶり返さない（「ぶり返した」の直後に「すっかり下がっていた」にならないように） */
    /* 次の日が治る日のまま動かせないとき（日数の上限・うつる日が決まっている）もぶり返さない（「ぶり返した」の翌朝に「すっかり下がった」にならないように） */
    var capR = S.days >= 4 ? S.days - 2 : S.days - 1, canR = day.d + 1 < S.heal || (!S.kaeshi && S.heal + 1 <= capR);
    var rel = day.d < S.heal && day.st !== 'heal' && canR ? relapse(ctx, day, 0.5) : false;
    if (!S.kaeshi && S.heal <= S.days - 3 && ctx.rng() < { low: 0.2, mid: 0.35, high: 0.55 }[S.cont]) mkKaeshi(ctx, S, 'near');
    var t = pickT(ctx, rel ? Tx.ILL_AFTER_RE : Tx.ILL_AFTER, A, B);
    if (t) ctx.act2({ actors: [A, B], cat: 'bond', text: fill(ctx, t, A, B), why: '看病の部屋：夜のあとの朝' + (rel ? '（熱がぶり返した）' : '') });
  }
  /* 表 T の各列を fn で絞った写し */
  function filtT(T, fn) { var o = {}; Object.keys(T || {}).forEach(function (k) { o[k] = (T[k] || []).filter(fn); }); return o; }
  /* 仕事に出る日の日中（通い・同居していない看る人。{a}＝看る人、{b}＝寝込んでいる人） */
  /* 仕事に出る日の日中（2026-11-05 利用者の回答）：その代わりに「仕事中の心配」（{a}＝看る人）と「一人で過ごす看られる側」（{b}）の段を必ず出す。
     両方か片方かは関係と性格で（恋人・両片想い・家族ほど両方。温かい看る人は心配の段、寂しがりの看られる人は一人の段）。受け止め方は看られる人の態度 9 種 */
  var BOTH_P = { love: 0.75, pine: 0.65, fam: 0.6, close: 0.5, fwb: 0.4, work: 0.35, awk: 0.3 };
  function workGap(ctx, day) {
    var S = f(ctx), A = S.A, B = S.B, Tx = TX(), pa = per(A), pb = per(B);
    var both = ctx.rng() < (BOTH_P[S.feud ? 'awk' : S.grp] || 0.4);
    var worryFirst = /devoted|gentle|stern|polite/.test(pa) ? 0.65 : 0.4, lonely = /devoted|shy|gentle|free/.test(pb);
    var which = both ? ['worry', 'alone'] : [ctx.rng() < (lonely ? worryFirst - 0.2 : worryFirst) ? 'worry' : 'alone'];
    var done = 0;
    which.forEach(function (k) {
      var W = k === 'worry' ? Tx.WORK_WORRY || {} : Tx.ALONE_DAY || {}, R = k === 'worry' ? Tx.WORK_WORRY_RE || {} : Tx.ALONE_DAY_RE || {};
      var t = relPick(ctx, W, A, B, true);
      if (!t) return;
      var re = pickT(ctx, R[pb] || R.gentle, A, B, true);
      done++;
      S.cnt.work = (S.cnt.work || 0) + 1;
      ctx.act2({ actors: k === 'worry' ? [A, B] : [B, A], cat: 'bond', text: fill(ctx, t, A, B, { temp: tempOf(S, day.d) }) + (re ? fill(ctx, re, A, B) : ''),
        why: '看病の部屋：' + (k === 'worry' ? '仕事中も気が気でない（' + A.name + '）' : 'ひとりで過ごす日中（' + B.name + '・' + A.name + 'は仕事）'), fx: function () { ctx.mod2(A, B, { aff: 1 }, { aff: 1, trust: 1 }); } });
    });
    if (!done) care(ctx, day, 'd');
  }
  /* 関係ごとの表から一つ言う（{ rk/grp/all }） */
  function say1(ctx, T, a, b, id, why, cat, ex) {
    var t = relPick(ctx, T, a, b); if (!t) return null;
    return ctx.act2({ actors: [a, b], cat: cat || 'bond', text: fill(ctx, t, a, b, ex), why: why });
  }
  function careReact(ctx, a, b, p) {
    if (ctx.rng() > p) return '';
    var R = TX().REACT || {}, t = pickT(ctx, R[per(b)] || R.gentle, a, b);
    return t ? fill(ctx, t, a, b) : '';
  }
  var ST_NAME = { rise: '熱が上がっていく', peak: '熱がいちばん高い', fall: '熱が下がり始めた' };
  function morning(ctx, day) {
    var S = f(ctx), A = S.A, B = S.B, M = TX().MORN || {};
    var ok0 = function (x) { return tempOk(S, day.d, x); };
    var t = pickT(ctx, (M[day.st] || []).concat(day.d === 0 ? M.first || [] : []).filter(ok0), A, B);
    if (day.d === 0) t = pickT(ctx, M.first, A, B) || t;
    if (!t) return;
    ctx.act2({ actors: [A, B], cat: 'bond', text: fill(ctx, t, A, B, { temp: tempOf(S, day.d) }) + careReact(ctx, A, B, 0.4), why: '看病の部屋：朝（' + ST_NAME[day.st] + '・' + tempOf(S, day.d) + '）', fx: function () { ctx.mod2(A, B, { aff: 1 }, { aff: 1, trust: 1 }); } });
  }
  function rest(ctx, day) {
    var S = f(ctx), A = S.A, B = S.B, W = TX().REST || {};
    if (B.life.work !== 'home') { var rt = pickT(ctx, W.patient, A, B); if (rt) ctx.act2({ actors: [B], cat: 'solo', text: fill(ctx, rt, A, B), why: '看病の部屋：体調を崩して休んだ（' + B.name + '）' }); }
    if (workOut(A) && (S.live === 'together' || S.come[day.d])) { var wt = pickT(ctx, S.live === 'together' ? W.carer : (W.carer_v || W.carer), A, B); if (wt) ctx.act2({ actors: [A, B], cat: 'bond', text: fill(ctx, wt, A, B), why: '看病の部屋：看病のために仕事を休んだ（' + A.name + '）' }); }
  }
  /* 看病の種（その段・その区切りに合うもの。一回の遊びで同じ種は続けない＝HK.Journal.pick） */
  function care(ctx, day, part) {
    var S = f(ctx), A = S.A, B = S.B, C0 = TX().CARE || {};
    var cook = LF.canCook(A), chore = LF.canChore(A);
    var row = J.pick(ctx, 'care', CARE, function (x) {
      if (x.st.indexOf(day.st) < 0 || x.part.indexOf(part) < 0) return 0;
      if (x.sev && x.sev.indexOf(S.sev) < 0) return 0;
      if (x.cook && !cook) return 0;
      if (x.only === 'nocook' && cook) return 0.3;
      if (x.chore && !chore) return 0;
      if (x.k === 'byoin' && day.hol) return 0;
      return C0[x.k] && hasFresh(ctx, C0[x.k], A, B) ? 1 : 0;
    });
    if (!row) return;
    var t = relPick(ctx, C0[row.k], A, B);
    if (!t) return;
    S.cares++; day.care++;
    var e = ctx.act2({ actors: [A, B], cat: 'bond', text: fill(ctx, t, A, B, { temp: tempOf(S, day.d) }) + careReact(ctx, A, B, 0.45), why: '看病の部屋：看病（' + (CARE_NAME[row.k] || row.k) + '）', fx: function () { ctx.mod2(A, B, { aff: 1, trust: 1 }, { aff: 2 + warmK(B), trust: 2, att: S.love ? 1 : 0 }); } });
    return e;
  }
  var CARE_NAME = { okayu: 'おかゆを作った', okayu_buy: 'おかゆを買ってきた', kusuri: '薬を飲ませた', koori: '氷枕を替えた', kigae: '着替えを手伝った', ase: '汗を拭いた', kaidashi: '買い出しに行った', taion: '熱を測った', ringo: 'りんごをすりおろした', kanki: '部屋の空気を入れ替えた', byoin: '病院に付き添った', sentaku: '汗で濡れた寝間着を洗った', mizu: '水分をとらせた' };
  var PK_WARM = { devoted: 2, gentle: 1.5, shy: 1.5, free: 1, tsun: 1, polite: 1, proud: 0.5, stern: 0.5, cool: 0.5 };
  function warmK(c) { return PK_WARM[per(c)] || 1; }
  /* 性格で分かれる行動（一日に一つまで。看る側と看られる側を交互に） */
  var BEH_NAME = { over: '世話を焼きすぎる', clumsy: '不器用に失敗する', hide: '強がって隠す', amae: '甘える' };
  function behave(ctx, day) {
    var S = f(ctx), A = S.A, B = S.B, B0 = TX().BEH || {}, Rx = TX().BEH_REACT || {};
    if (ctx.rng() > 0.75) return;
    var side = (day.d % 2 === 0) === (ctx.rng() < 0.7) ? 'p' : 'c', bh = side === 'p' ? S.pb : S.cb;
    /* 「らしくない」行動は一回の遊びで一度まで（二度目からは、その人らしい行動に戻す） */
    if (bh.odd && S.oddDone) { var OPP = { over: 'clumsy', clumsy: 'over', hide: 'amae', amae: 'hide' }; bh = { k: OPP[bh.k], odd: false }; }
    /* 熱がいちばん高い日は強がれない（甘える・世話を焼きすぎる・失敗だけ） */
    if (day.st === 'peak' && bh.k === 'hide') { side = 'c'; bh = S.cb; }
    var who = side === 'p' ? B : A, other = side === 'p' ? A : B;
    var t = relPick(ctx, B0[bh.k] || {}, A, B);
    if (!t) return;
    /* 受け止め方：相手の態度9種（失敗は共通の受け止め方 oops） */
    var rt = '', odd2 = false;
    /* 失敗の受け止め方（共通の oops）：寝込んでいる人が「駆け寄る・隣へ来る」文、らしくない受け止め方（何への言葉か書かれない）は使わない（2026-11-04 報告） */
    if (bh.k === 'clumsy' && RC()) { var r = RC().say(ctx, 'oops', other, who); if (r.text && !r.odd && okText(ctx, r.text, other, who) && !(other === B && /来た|駆け寄|飛んで|立ち上が|台所/.test(r.text))) rt = fill(ctx, r.text, other, who); }
    if (bh.k === 'clumsy' && !rt) { var RR0 = Rx.clumsy || {}, r0 = pickT(ctx, RR0[per(other)] || RR0.gentle, A, B); if (r0) rt = fill(ctx, r0, A, B); }
    else { var RR = Rx[bh.k] || {}, rr = pickT(ctx, RR[per(other)] || RR.gentle, A, B); if (rr) rt = fill(ctx, rr, A, B); }
    var e = ctx.act2({ actors: [A, B], cat: 'bond', text: fill(ctx, t, A, B, { temp: tempOf(S, day.d) }) + rt, odd: bh.odd || odd2, why: '看病の部屋：' + who.name + 'が' + BEH_NAME[bh.k] + (bh.odd ? '（らしくない）' : ''),
      fx: function () { if (bh.k === 'hide') ctx.mod2(A, B, { trust: -1, aff: 1 }, { aff: 1 }); else if (bh.k === 'amae') ctx.mod2(A, B, { aff: 2, att: S.love ? 2 : 0 }, { aff: 2, trust: 2 }); else ctx.mod2(A, B, { aff: 1 }, { aff: 2, trust: 1 }); } });
    if (e) { S.behs++; if (e.odd) { S.odd++; S.oddDone = true; } S.cnt[bh.k] = (S.cnt[bh.k] || 0) + 1; }
  }
  /* ---------- 区切りごとの二人のやりとり（会話・すれ違い・小さな出来事。2026-11-04 報告「看病の作業の表から 1 件引くだけ」）----------
     病気の間の朝・日中・夜に一つずつ（その区切りにほかのやりとりが無ければ）。会話・すれ違いは関係のまとめごと、小さな出来事は共通。一回の遊びで同じ文は出さない */
  function talk(ctx, day, part) {
    var S = f(ctx), A = S.A, B = S.B, TK = TX().TALK || {};
    if (ctx.rng() > 0.8) return;
    var kinds = part === 'd' ? ['jiken', 'chat', 'miss'] : part === 'm' ? ['chat', 'jiken'] : ['chat', 'miss'];
    var k = kinds[Math.floor(ctx.rng() * kinds.length)], T0 = TK[k] || {}, grp = S.fwb ? 'fwb' : S.rk === 'ex' ? 'ex' : S.feud ? 'feud' : S.grp;
    var own = (T0[grp] || []).concat(S.rk === 'ex' ? T0.awk || [] : []), t = pickT(ctx, own, A, B) || pickT(ctx, T0.all, A, B);
    if (!t) { var k2 = k === 'jiken' ? 'chat' : 'jiken'; t = pickT(ctx, (TK[k2] || {})[grp], A, B) || pickT(ctx, (TK[k2] || {}).all, A, B); k = k2; }
    if (!t) return;
    ctx.act2({ actors: [A, B], cat: 'bond', text: fill(ctx, t, A, B, { temp: tempOf(S, day.d) }), why: '看病の部屋：' + { chat: '二人の会話', miss: '小さなすれ違い', jiken: '看病の日の小さな出来事' }[k], fx: function () { ctx.mod2(A, B, { aff: 1, trust: 1 }, { aff: 1, trust: 1 }); } });
  }
  /* 山場：熱がいちばん高い夜の弱音（必ず出す）。通いなら泊まり込む段から。弱音は看られる側の態度・関係で、受け答えは看る側の態度で */
  function weakNight(ctx, day) {
    var S = f(ctx), A = S.A, B = S.B, Tx = TX();
    if (S.live === 'apart') say1(ctx, Tx.STAY_APART || Tx.STAY || {}, A, B, 'kb_stay', '看病の部屋：特別に泊まっていった（' + A.name + '）', 'bond');
    else if (S.live === 'visit') say1(ctx, Tx.STAY || {}, A, B, 'kb_stay', '看病の部屋：熱が高いので泊まり込んだ（' + A.name + '）', 'bond');
    var W = Tx.WEAK || {}, Wa = Tx.WEAK_ANS || {}, Wt = Tx.WEAK_REL || {};
    var w = pickT(ctx, W[per(B)] || W.gentle, A, B, true) || '夜中、{b}は熱にうかされて、{a}の名前を呼んだ。「……そばにいて｜……そばにいてくれ｜……そばにいてください」';
    var Wf = Tx.WEAK_ANS_FEUD || {}, ans = S.feud ? pickT(ctx, Wf[per(A)] || Wf.gentle, A, B) || pickT(ctx, Wa[per(A)] || Wa.gentle, A, B) : pickT(ctx, Wa[per(A)] || Wa.gentle, A, B);
    var tail = relPick(ctx, Wt, A, B);
    var lv = S.love && (S.couple || S.pine) ? pickT(ctx, Tx.WEAK_LOVE, A, B) : '';
    var tx = fill(ctx, w, A, B, { temp: tempOf(S, S.peak) }) + (ans ? fill(ctx, ans, A, B) : '') + (tail ? fill(ctx, tail, A, B) : '') + (lv ? fill(ctx, lv, A, B) : '');
    var e = ctx.act2({ actors: [B, A], cat: S.love && (S.couple || S.pine) ? rcat(ctx, A, B) : 'bond', text: tx, why: '看病の部屋：熱がいちばん高い夜の弱音（' + B.name + '・' + tempOf(S, S.peak) + '）', fx: function () { ctx.mod2(A, B, { aff: 4, trust: 3, att: S.love ? 4 : 0 }, { aff: 5, trust: 5, att: S.love ? 4 : 0 }); } });
    if (e) { e.tag = '山場'; S.weak = true; S.weakIn = true; if (lv) S.weakLove = true; }
    if (S.live !== 'together') S.cnt.stay = (S.cnt.stay || 0) + 1;
    /* 看病の最中に近づきすぎた（恋人・両片想いの夜の一文）：うつりやすさで、看る人にうつることがある */
    if (lv && !S.kaeshi && S.heal <= S.days - 3 && ctx.rng() < { low: 0.08, mid: 0.15, high: 0.28 }[S.cont]) mkKaeshi(ctx, S, 'near');
  }
  /* ---------- 治った日・治ったあと ---------- */
  function decideEnd(ctx) {
    var S = f(ctx), A = S.A, B = S.B;
    if (S.endK) return S.endK;
    if (S.kaeshi) return (S.endK = 'kaeshi');
    if (!S.love) return (S.endK = 'rei');
    if (S.couple) return (S.endK = 'amai');
    var r = ctx.rel[A.i][B.i], q = ctx.rel[B.i][A.i];
    var sc = ((r.att || 0) + (q.att || 0)) / 2 + ((r.aff || 0) + (q.aff || 0)) / 6 + (S.pine ? 18 : 0) + ((A.tr.honesty || 0.5) + (B.tr.honesty || 0.5)) * 8 + (S.rk === 'bad' ? -12 : 0) + (ctx.rng() - 0.5) * 20;
    /* 関係ごとの線（恋人に／お礼のデート）。両片想い・片想いはもともと高いので線も高く、半分ほどが恋人に、残りはデートか両片想いのまま */
    sc += ((S.glA && GL[S.glA.k]) ? GL[S.glA.k].e : 0) + ((S.glB && GL[S.glB.k]) ? GL[S.glB.k].e : 0);
    S.endScore = Math.round(sc);
    var th = END_TH[S.rk] || END_TH.def;
    return (S.endK = sc >= th[0] ? 'koi' : sc >= th[1] ? 'date' : 'mama');
  }
  var END_TH = { almost: [118, 102], crush: [104, 92], ex: [82, 70], bad: [22, 10], rival: [30, 16], lovehate: [40, 22], def: [64, 49] };
  function healStep(ctx, day, t, last) {
    var S = f(ctx), A = S.A, B = S.B, Tx = TX(), ek = decideEnd(ctx);
    if (day.st === 'heal') {
      if (t === 0) {
        arrive(ctx, day);
        if (S.sickSexDay === day.d - 1) afterIll(ctx, day);
        var ht = relPick(ctx, Tx.HEAL || {}, A, B);
        if (ht) ctx.act2({ actors: [A, B], cat: 'bond', text: fill(ctx, ht, A, B), why: '看病の部屋：熱が下がった朝（' + B.name + '）', fx: function () { ctx.mod2(A, B, { aff: 2, trust: 2 }, { aff: 2, trust: 2 }); } });
        return;
      }
      if (t === 1) {
        var TH = Tx.THANKS || {}, th = pickT(ctx, TH[per(B)] || TH.gentle, A, B), tr = relPick(ctx, Tx.THANKS_REL || {}, A, B);
        if (th) S.thanked = true;
        if (th) ctx.act2({ actors: [B, A], cat: 'bond', text: fill(ctx, th, A, B) + (tr ? fill(ctx, tr, A, B) : ''), why: '看病の部屋：看病のお礼（' + B.name + 'から）', fx: function () { ctx.mod2(B, A, { aff: 4, trust: 3, att: S.love ? 3 : 0 }, { aff: 3, att: S.love ? 2 : 0 }); } });
        if (S.kaeshi) say1(ctx, Tx.KAESHI_SIGN || {}, A, B, 'kb_kaeshi', '看病の部屋：' + A.name + 'に風邪がうつりかけている', 'bond');
        /* うつりやすい設定でも日数が足りずにうつらなかったときは、うつりかけて持ちこたえた段（2026-11-05 報告：うつりやすさ「高い」でうつらない回） */
        else if (S.cont === 'high') say1(ctx, Tx.KAESHI_NEARLY || {}, A, B, 'kb_kaeshi', '看病の部屋：' + A.name + 'にうつりかけたが持ちこたえた', 'bond');
        return;
      }
      /* 治った日の夜：最後の日なら結末、そうでなければ穏やかな夜（恋人どうしなら R18 の夜も） */
      if (last) { lastDay(ctx, day); return; }
      if (ek === 'koi' && S.heal >= S.days - 2 && !S.confessed) confess(ctx);
      night(ctx, day, 'heal');
      if (S.live !== 'together' && nightTogether(S)) S.stayN = day.d;
      if (S.live === 'visit' && !nightTogether(S)) say1(ctx, Tx.LEAVE_WELL || Tx.LEAVE || {}, A, B, 'kb_leave', '看病の部屋：' + A.name + 'が帰った', 'bond');
      return;
    }
    /* 治ったあと（after）：関係ごとに変わる段（AFTER_REL）を先に、無ければ共通の段。見出しだけの区切りを作らない（2026-11-04 報告） */
    if (t === 0) { afterRel(ctx, 'm', Tx.AFTER_M); return; }
    if (t === 1) {
      if (last && (ek === 'date' || ek === 'koi' || ek === 'amai') && S.love) { date(ctx); return; }
      if (last && ek === 'rei') { say1(ctx, Tx.REI || {}, B, A, 'kb_rei', '看病の部屋：看病のお礼に出かけた（' + B.name + 'から）', 'bond'); S.dated = true; return; }
      if (ek === 'amai' && ctx.rng() < 0.8) { say1(ctx, Tx.SWEET || {}, A, B, 'kb_sweet', '看病の部屋：いつもより甘い一日', rcat(ctx, A, B)); return; }
      afterRel(ctx, 'd', Tx.AFTER_D);
      return;
    }
    if (last) { lastDay(ctx, day); return; }
    var nb = S.nearDay;
    if (!night(ctx, day, S.couple ? 'amai' : 'after') && S.nearDay === nb) afterRel(ctx, 'n', Tx.AFTER_N);
  }
  function afterRel(ctx, part, T1) {
    var S = f(ctx), A = S.A, B = S.B, R0 = (TX().AFTER_REL || {})[part] || {}, grp = S.fwb ? 'fwb' : S.rk === 'ex' ? 'ex' : S.feud ? 'feud' : S.grp;
    var t = pickT(ctx, R0[grp], A, B) || relPick(ctx, T1 || {}, A, B) || pickT(ctx, R0.all, A, B) || relPick(ctx, T1 || {}, A, B, true);
    if (!t) return;
    ctx.act2({ actors: [A, B], cat: 'bond', text: fill(ctx, t, A, B), why: '看病の部屋：治ったあとの' + { m: '朝', d: '一日', n: '夜' }[part] + '（' + RK_NAME[S.rk] + '）', fx: function () { ctx.mod2(A, B, { aff: 1, trust: 1 }, { aff: 1, trust: 1 }); } });
  }
  /* 最後の夜：告白（恋人に）→ R18 の夜 → 結末の段 */
  function lastDay(ctx, day) {
    var S = f(ctx), ek = S.endK;
    if (ek === 'koi' && !S.confessed) confess(ctx);
    if (S.dated && S.love) night(ctx, day, 'date');
    else night(ctx, day, day.ks === 'kheal' ? 'back' : day.st === 'heal' ? 'heal' : S.couple ? 'amai' : 'after');
    ending(ctx);
  }
  function nightTogether(S) { return S.live === 'together' || S.couple || S.confessed; }
  function date(ctx) {
    var S = f(ctx), A = S.A, B = S.B;
    var t = relPick(ctx, TX().DATE || {}, B, A);
    if (!t) return;
    S.dated = true;
    ctx.act2({ actors: [B, A], cat: rcat(ctx, A, B), text: fill(ctx, t, B, A), why: '看病の部屋：看病のお礼のデート（' + B.name + 'から誘った）', fx: function () { ctx.mod2(A, B, { aff: 3, att: 4 }, { aff: 3, att: 4 }); } });
  }
  /* 告白：言い出すのは、看病された側か、山場で弱音を聞いた側（気質で） */
  function confess(ctx) {
    var S = f(ctx), A = S.A, B = S.B, Tx = TX();
    var by = (B.tr.honesty || 0.5) + (B.tr.fc || 0.5) * 0.5 >= (A.tr.honesty || 0.5) + (A.tr.fc || 0.5) * 0.5 ? B : A, to = by === A ? B : A;
    /* 告げたら恋人になる（文の絞り込みで「恋人」の語を使えるよう、先に印を付ける） */
    S.confessed = true; S.couple = true; S.confessDay = S.day ? S.day.d : null;
    var CF = Tx.CONFESS || {}, t = pickT(ctx, CF[per(by)] || CF.gentle, by, to), an = pickT(ctx, (Tx.CONFESS_ANS || {})[per(to)] || (Tx.CONFESS_ANS || {}).gentle, by, to);
    if (!t) { S.confessed = false; S.couple = false; return; }
    var p = ctx.pair(A, B);
    p.confessed[by.i] = true; p.couple = true;
    ctx.act2({ actors: [by, to], cat: rcat(ctx, by, to), text: fill(ctx, t, by, to) + (an ? fill(ctx, an, by, to) : ''), why: '看病の部屋：治って想いを告げた（' + by.name + 'から）', fx: function () { ctx.mod2(by, to, { aff: 10, att: 10, trust: 8, ten: -6 }, { aff: 10, att: 10, trust: 8, ten: -6 }); } });
  }
  /* ---------- うつって看病し返す（A が寝込み、B が看る） ---------- */
  function kaeshiStep(ctx, day, t, last) {
    var S = f(ctx), A = S.A, B = S.B, Tx = TX(), k = S.kaeshi, first = day.d === k.from;
    if (day.ks === 'kheal') {
      if (t === 0) { say1(ctx, Tx.KHEAL || {}, B, A, 'kb_kheal', '看病の部屋：うつった人も治った朝（' + A.name + '）', 'bond'); return; }
      if (t === 1) { afterRel(ctx, 'd', Tx.AFTER_D); return; }
      if (last) { lastDay(ctx, day); return; }
      if (!night(ctx, day, 'back')) afterRel(ctx, 'n', Tx.AFTER_N);
      return;
    }
    /* B（治った人）が A を看る。{a}＝看る人（B）、{b}＝寝込んだ人（A） */
    if (t === 0) { say1(ctx, first ? (S.kaeshiBy && Tx.KAESHI_NEAR ? Tx.KAESHI_NEAR : Tx.KAESHI || {}) : Tx.KMORN || {}, B, A, first ? 'kb_kaeshi' : 'kb_kcare', '看病の部屋：' + (first ? A.name + 'に風邪がうつった' : '看病し返す朝'), 'bond'); ktalk(ctx); return; }
    if (t === 1) {
      if (first && !day.hol && A.life.work !== 'home') { var rt = pickT(ctx, (Tx.REST || {}).patient, B, A); if (rt) ctx.act2({ actors: [A], cat: 'solo', text: fill(ctx, rt, B, A), why: '看病の部屋：体調を崩して休んだ（' + A.name + '）' }); }
      say1(ctx, Tx.KCARE || {}, B, A, 'kb_kcare', '看病の部屋：看病し返す（' + B.name + 'が' + A.name + 'を）', 'bond');
      ktalk(ctx);
      return;
    }
    if (last) { ending(ctx); return; }
    say1(ctx, Tx.KNIGHT || {}, B, A, 'kb_kcare', '看病の部屋：看病し返す夜', 'bond');
    ktalk(ctx);
  }
  /* うつって看病し返す日のやりとり（{a}＝看病し返す B、{b}＝寝込んだ A） */
  function ktalk(ctx) {
    var S = f(ctx), A = S.A, B = S.B;
    if (ctx.rng() > 0.75) return;
    var t = pickT(ctx, (TX().KTALK || {}).all, B, A);
    if (t) ctx.act2({ actors: [B, A], cat: 'bond', text: fill(ctx, t, B, A), why: '看病の部屋：看病し返す日のやりとり', fx: function () { ctx.mod2(A, B, { aff: 1, trust: 1 }, { aff: 1, trust: 1 }); } });
  }
  /* R18 の夜（kanbyo-r18.js。病気の夜は呼ばない） */
  function night(ctx, day, entry) {
    var S = f(ctx);
    if (HK.SAFE_ON || !HK.KanbyoR18 || S.sex >= S.lewdMax || sickNight(S, day.d)) return false;
    /* うつった人が寝込んでいる夜は無し（治った日の夜＝うつりかけの夜は残す。2026-11-05） */
    if (S.kaeshi && day.d >= S.kaeshi.from && day.d < S.kaeshi.heal) return false;
    /* 恋愛の進みの日数の下限（2026-11-04 報告：関係の薄い二人が一気に体の関係まで行く）：始まりから恋人どうし・セフレでない二人は、
       告白した日の夜にはしない／告白していなければ、治った日の夜は無し・先に「近づく段」を出して、その次の日以降 */
    /* 体だけの夜を起こす二人（S.bodyGo）は、関係の進みの下限（告白・近づく段）を見ない。治った日の夜から */
    if (S.bodyGo && day.d < S.heal) return false;
    if (!S.couple0 && !S.fwb && !S.bodyGo) {
      if (S.confessDay === day.d) return false;
      if (!S.confessed) {
        /* 恋愛にしない二人（お礼のデートの夜が無い）は、治った日の夜に近づく段を出してよい（その夜はしない。日数 5 日では治ったあとの夜が最後の夜だけになり、近づく段のあとの夜が無かったため。2026-11-04） */
        if (day.d === S.heal && !S.love && S.nearDay == null) nearBeat(ctx, day);
        if (day.d <= S.heal) return false;
        if (S.nearDay == null) { nearBeat(ctx, day); return false; }
        if (S.nearDay >= day.d) return false;
      }
    }
    /* 片想いの二人は、告白の前に体の関係にしない（2026-11-05 報告） */
    if (S.rk === 'crush' && !S.confessed && !S.bodyGo) return false;
    /* 回数の設定を守る（2026-11-05 報告：「多め」で長い場面が一度も無い・0 回）：残りの夜の数が、まだ要る回数以下なら必ず起こし、
       多めで長い場面がまだ無ければ、最後の機会の夜は長い場面にする（描写の長さ「数行で短く」・ほのめかすのときを除く） */
    var noLong = ctx.env.lewdN === 'high' && !S.longN && ctx.env.lewdLen !== 'short' && !(HK.Lewd && HK.Lewd.lv(ctx.env) === 'low') && S.sex < S.lewdMax;
    var need = Math.max(nightNeed(S), noLong ? 1 : 0), left = nightsLeft(S, day.d);
    S.forceN = need > 0 && left <= need;
    S.wantLong = noLong && (left <= 1 || S.sex + 1 >= S.lewdMax || S.forceN && need <= 1);
    var ok = HK.KanbyoR18.night(ctx, entry, day, day.d === S.days - 1);
    S.forceN = false; S.wantLong = false;
    if (ok) S.sex++;
    return ok;
  }
  /* まだ要るエッチの回数（多め＝2 回・一度は長い場面、ふつう＝恋人どうし・セフレは 1 回） */
  function nightNeed(S) { var n = S.lewdMax >= 3 ? 2 : S.lewdMax >= 2 && (S.couple0 || S.fwb) ? 1 : 0; if (S.bodyGo) n = Math.max(n, 1); return Math.max(0, Math.min(n, S.lewdMax) - S.sex); }
  /* その日から最後の夜までの、エッチの場面を出せる夜の数（病気の夜・うつった人が寝込む夜を除く） */
  function nightsLeft(S, d) {
    /* 最後の夜に告白する二人（結末が「治って恋人に」でまだ告げていない）は、告白した夜にはしないので、最後の夜を数えない */
    var lastCf = !S.couple0 && !S.fwb && S.endK === 'koi' && !S.confessed;
    var n = 0; for (var x = d; x < S.days; x++) if (!sickNight(S, x) && S.confessDay !== x && !(lastCf && x === S.days - 1)) n++; return n;
  }
  /* 近づく段（体の関係に進む前に一度。恋愛の語は使わない書き方。R18版で、体の関係にしてよい組だけ） */
  function nearBeat(ctx, day) {
    var S = f(ctx), A = S.A, B = S.B, KR = HK.KanbyoR18, PR = HK.PairR18, P = HK.Pos;
    if (!PR || !PR.sexOk(ctx, A, B) || (P && P.okSex && !P.okSex(A, B))) return;
    /* 恋愛にしない二人（恋愛：なし など）はお礼のデートの夜が無いので、近づく段を出やすく（性的な出来事の門：恋愛の有無で起きにくくしすぎない。2026-11-04） */
    if (ctx.rng() > (S.love ? (ctx.env.lewdN === 'high' ? 0.8 : 0.6) : 0.9)) return;
    var t = relPick(ctx, TX().NEAR || {}, A, B);
    if (!t) return;
    var e = ctx.act2({ actors: [A, B], cat: rcat(ctx, A, B), text: fill(ctx, t, A, B), why: '看病の部屋：治ったあとの夜、二人の距離が近づいた', fx: function () { ctx.mod2(A, B, { aff: 2, att: 4 }, { aff: 2, att: 4 }); } });
    if (e) S.nearDay = day.d;
  }
  /* ---------- 他の住人の見舞い（病気の間の日中・夜。関係図に出さない・恋愛を始めない） ---------- */
  function visit(ctx, day, part) {
    var S = f(ctx), PV = HK.PairVisit, VT = TX().VISIT || {};
    if (!PV || !S.G.length) return;
    /* 参加者の三人目（見舞いに来る側）は、病気の間に必ず一度は見舞いに来る（2026-11-04 報告：一度も出ないのに結果欄に関係が出た）。
       まだ来ていなければ、病気の最後の日（同居していない日なら来られない日でも）の日中に来る。二人と関係の無い人・見舞いの相手にしない関係の人は「見舞いに来た人」の文で */
    var must = part === 'd' && day.d >= S.heal - 1 ? S.G.filter(function (g) { return !g.outside && PV.here(g) && !(S.gUsed && S.gUsed[g.i]); }) : [];
    if (!must.length && day.visited) return;
    if (!must.length && ctx.rng() > (part === 'd' ? (day.st === 'peak' ? 0.18 : 0.35) : 0.25)) return;
    var cands = [];
    (must.length ? must : S.G).forEach(function (g) {
      if (!PV.here(g)) return;
      var got = false;
      [S.B, S.A].forEach(function (h) {
        var c = PV.cls(ctx, h, g); if (!c) return;
        got = true;
        var n = (S.gUsed && S.gUsed[g.i]) || 0, dw = 1 / (1 + n);
        if (part === 'd') { cands.push({ kind: 'visit', host: h, g: g, cls: c, w: (h === S.B ? 1.2 : 0.7) * dw * (c === 'ex' ? 0.5 : 1) }); cands.push({ kind: 'gift', host: h, g: g, cls: c, w: 0.8 * dw }); }
        else cands.push({ kind: 'contact', host: h, g: g, cls: c, w: (h === S.B ? 1 : 0.6) * dw });
      });
      if (!got && must.length) cands.push({ kind: 'visit', host: S.B, g: g, cls: 'guest', w: 1 });
    });
    if (!cands.length) return;
    var v = HK.weighted(ctx.rng, cands, function (x) { return x.w; });
    S.gUsed = S.gUsed || {}; S.gUsed[v.g.i] = (S.gUsed[v.g.i] || 0) + 1;
    day.visited = true;
    var g = v.g, A = S.A, B = S.B, other = v.host === A ? B : A;
    var arr = (VT[v.kind] || {})[v.cls === 'pfam' ? 'fam' : v.cls] || (VT[v.kind] || {}).known || [];
    if (!arr.filter(function (x) { return !S.used[x]; }).length && must.length) arr = (VT.visit || {}).guest || arr;
    if (HK.relFilter) { var fl = HK.relFilter(ctx, arr, v.host, g); if (fl && fl.length) arr = fl; }
    var U = S.used, q = arr.filter(function (x) { return !U[x]; }), t = pickOf(ctx, q);
    if (!t) { day.visited = false; return; }
    U[t] = 1;
    g.gone = false;
    try {
      /* {a}＝看る人、{b}＝寝込んでいる人、{g}＝来た人、{gl}＝{h}（関係のある人）から見た呼び名、{h}＝関係のある人 */
      var ex = { g: g.name, gl: v.cls === 'guest' ? '' : PV.word(ctx, v.host, g), h: v.host.name };
      var e = ctx.act2({ actors: v.kind === 'contact' ? [v.host, g] : [A, B, g], cat: 'bond', text: fill(ctx, t, A, B, ex), why: '看病の部屋：' + { visit: '他の住人がお見舞いに来た', gift: '他の住人から差し入れが届いた', contact: '他の住人から連絡が来た' }[v.kind] + '（' + g.name + (ex.gl ? '・' + ex.gl : '') + '）',
        fx: function () { if (!g.outside) ctx.mod2(v.host, g, { aff: 2, trust: 2 }, { aff: 2, trust: 1 }); } });
      if (e) S.visits++;
    } finally { g.gone = true; }
  }
  /* ---------- 結末 ---------- */
  var END_NAME = { koi: '治って恋人に', date: 'お礼のデート', kaeshi: 'うつって看病し返す', mama: '', amai: 'いつもより甘い数日', rei: '看病のお礼' };
  function endName(S) { return S.endK === 'mama' ? (S.rk === 'almost' ? '両片想いのまま' : S.rk === 'crush' ? '片想いのまま' : '今の関係のまま') : END_NAME[S.endK]; }
  function ending(ctx) {
    var S = f(ctx), A = S.A, B = S.B, ek = decideEnd(ctx);
    if (S.ended) return;
    S.ended = true;
    /* お礼のデート・お礼に出かける前に終わった（日数が足りない）ときは「約束」の文 */
    var key = (ek === 'date' || ek === 'rei') && !S.dated ? ek + '_promise' : ek === 'kaeshi' && S.kaeshiBy ? 'kaeshi_near' : ek;
    var E = (TX().END || {})[key] || (TX().END || {})[ek] || {}, t = relPick(ctx, E, A, B, true);
    if (!t) t = '{a}と{b}の看病の日々は、こうして終わった。';
    /* 二人の目標の判定の一文（短期：叶った／叶わなかった＝態度9種、長期：近づいた／変わらない／遠のいた） */
    /* 目標は、かぎかっこで並べて読み上げず、物語の文で 1〜2 文（2026-11-04 報告）：看病された人の短期の目標を一つと、長期の目標が動いた（近づいた・遠のいた）人の一つだけ。
       熱の夜に気持ちがこぼれた二人は、その回収の一文を先に */
    /* 目標は結末の文で読み上げない（2026-11-05 報告：「〜と願っていた○○は…少しだけ手が届いた」が同じ型で並ぶ）。叶ったかは結果欄の目標の行に出す */
    goalJudge(ctx);
    var tail = '';
    /* エッチの回数の設定があるのに一度も無かったときは、理由の文を一つ（R18版。kanbyo-r18.js の noneWhy） */
    if (!HK.SAFE_ON && HK.KanbyoR18 && HK.KanbyoR18.noneWhy && S.lewdMax > 0 && S.sex === 0) HK.KanbyoR18.noneWhy(ctx);
    var RC0 = S.weakLove ? (TX().RECALL || {})[ek] : null, rc = RC0 ? pickT(ctx, RC0, A, B, true) : '';
    if (rc) tail = fill(ctx, rc, A, B) + tail;
    ctx.act2({ actors: [A, B], cat: /koi|date|amai/.test(ek) ? rcat(ctx, A, B) : 'bond', text: fill(ctx, t, A, B) + tail, why: '看病の部屋：結末（' + endName(S) + '）', fx: function () { ctx.mod2(A, B, { aff: 4, trust: 3 }, { aff: 4, trust: 3 }); } });
  }
  var RES_NAME = { ok: '叶った', ng: '叶わなかった', near: '近づいた', same: '変わらない', far: '遠のいた' };
  function goalJudge(ctx) {
    var S = f(ctx);
    if (S.judged) return;
    S.judged = true;
    S.resA = { s: S.gsA && GS[S.gsA.k] && GS[S.gsA.k].ok(S) ? 'ok' : 'ng', l: longJudge(ctx, S.A, S.glA) };
    S.resB = { s: S.gsB && GS[S.gsB.k] && GS[S.gsB.k].ok(S) ? 'ok' : 'ng', l: longJudge(ctx, S.B, S.glB) };
  }
  function goalStory(ctx) {
    var S = f(ctx); goalJudge(ctx);
    var GS0 = TX().GOAL_STORY || {}, out = '', A = S.A, B = S.B;
    var sh = S.gsB && S.resB ? [B, A, S.gsB, S.resB.s] : S.gsA && S.resA ? [A, B, S.gsA, S.resA.s] : null;
    if (sh) { var t = pickT(ctx, GS0[sh[3]], sh[0], sh[1], true); if (t) out += fill(ctx, t, sh[0], sh[1], { goal: sh[2].t }); }
    var lg = S.glA && S.resA && S.resA.l !== 'same' ? [A, B, S.glA, S.resA.l] : S.glB && S.resB && S.resB.l !== 'same' ? [B, A, S.glB, S.resB.l] : null;
    if (lg) { var t2 = pickT(ctx, GS0[lg[3]], lg[0], lg[1], true); if (t2) out += fill(ctx, t2, lg[0], lg[1], { goal: lg[2].t }); }
    return out;
  }
  function goalLines(ctx, who, other, gs, gl, side) {
    var S = f(ctx); goalJudge(ctx);
    var res = side === 'A' ? S.resA : S.resB, out = '', T0 = TX();
    if (gs) { var R = (T0.GOAL_RES || {})[res.s] || {}, t = pickT(ctx, R[per(who)] || R.gentle, who, other, true); if (t) out += fill(ctx, t, who, other, { goal: gs.t }); }
    if (gl) { var t2 = pickT(ctx, (T0.GOAL_LRES || {})[res.l], who, other, true); if (t2) out += fill(ctx, t2, who, other, { goal: gl.t }); }
    return out;
  }
  function finish(ctx) {
    var S = f(ctx), A = S.A, B = S.B;
    if (A !== B) dedupeLog(ctx, S);
    if (A === B) return;
    decideEnd(ctx); goalJudge(ctx);
    S.G.forEach(function (g) { g.gone = false; g.fate = g.outside ? '見舞いに来た住人（名簿から）' : '見舞いに来る住人'; g.fateNote = (S.gUsed && S.gUsed[g.i]) ? B.name + 'の具合を気にかけていた' : ''; });
    ctx.flags.kanbyo = { days: S.days, a: A.i, b: B.i, rel: RK_NAME[S.rk], rk: S.rk, sev: S.sev, live: S.live, peak: S.peak + 1, heal: S.heal + 1, kaeshi: S.kaeshi ? { from: S.kaeshi.from + 1, heal: S.kaeshi.heal + 1 } : null,
      cb: BEH_NAME[S.cb.k], pb: BEH_NAME[S.pb.k], gsA: S.gsA ? S.gsA.t : '', glA: S.glA ? S.glA.t : '', gsB: S.gsB ? S.gsB.t : '', glB: S.glB ? S.glB.t : '', resA: S.resA ? [RES_NAME[S.resA.s], RES_NAME[S.resA.l]] : null, resB: S.resB ? [RES_NAME[S.resB.s], RES_NAME[S.resB.l]] : null, illSex: !!S.illSex, relapse: S.relapse || 0, cbOdd: S.cb.odd, pbOdd: S.pb.odd, endK: S.endK, end: endName(S), score: S.endScore, cares: S.cares, visits: S.visits, sex: S.sex, love: S.love, confessed: S.confessed, weak: !!S.weak };
    A.fate = '看病した人'; A.fateNote = B.name + 'を看病した';
    B.fate = S.kaeshi ? '看病された人（そして看病し返した人）' : '看病された人'; B.fateNote = A.name + 'に看病された';
    if (S.kaeshi) A.fateNote += '。最後は風邪がうつって、看病し返してもらった';
    ctx.flags.outcome = B.name + 'の看病の' + S.days + '日――' + endName(S);
    /* 想いが返ってこなかった人（片想いのまま終わった想う側）：結果欄の「想いは向こうからも返ってきていた」を本編に合わせて直す（下の HK.simulate の包み） */
    if (S.rk === 'crush' && !S.confessed && S.rkKey) ctx.flags.kanbyo.oneSide = (S.rkKey === 'crushA' ? A : B).i;
  }
  if (HK.PairCast) HK.PairCast.install(ID, couple, 'kanbyo');
  var SEV_NAME = { light: '軽い風邪', mid: '熱が出る', heavy: '寝込む' };
  if (HK.Endings) HK.Endings[ID] = function (res, X) {
    var R = res.end && res.end.kanbyo, lines = [];
    if (!R) return { headline: res.outcome || '', stats: [], lines: [] };
    var a = X.nm(R.a), b = X.nm(R.b);
    lines.push('看病の' + R.days + '日（' + a + 'が' + b + 'を看病した・' + R.rel + '）');
    lines.push('病の重さ：' + SEV_NAME[R.sev] + '／' + ({ together: '同居で看病', visit: '通いで看病', apart: '同居していない（来られる日に看病）' }[R.live] || '')  + '／熱がいちばん高かったのは DAY' + R.peak + '、治ったのは DAY' + R.heal + (R.kaeshi ? '／DAY' + R.kaeshi.from + 'に' + a + 'へうつった' : ''));
    lines.push(a + '：' + R.cb + (R.cbOdd ? '（らしくない）' : '') + '／' + b + '：' + R.pb + (R.pbOdd ? '（らしくない）' : ''));
    if (R.gsA || R.glA) lines.push(a + 'の目標：短期「' + R.gsA + '」' + (R.resA ? '（' + R.resA[0] + '）' : '') + '／長期「' + R.glA + '」' + (R.resA ? '（' + R.resA[1] + '）' : ''));
    if (R.gsB || R.glB) lines.push(b + 'の目標：短期「' + R.gsB + '」' + (R.resB ? '（' + R.resB[0] + '）' : '') + '／長期「' + R.glB + '」' + (R.resB ? '（' + R.resB[1] + '）' : ''));
    if (R.resA && R.resB) lines.push(a + '：短期：' + R.resA[0] + '／長期：' + R.resA[1] + '　' + b + '：短期：' + R.resB[0] + '／長期：' + R.resB[1]);
    lines.push('看病 ' + R.cares + '回' + (R.visits ? '／見舞い・差し入れ・連絡 ' + R.visits + '回' : '') + (HK.SAFE_ON ? '' : '／エッチ ' + R.sex + '回'));
    lines.push('結末：' + R.end);
    X.C.forEach(function (c) { c.afterDone = true; });
    return { headline: (res.outcome || '') + '。', stats: [['日数', R.days + '日'], ['看病', R.cares + '回'], ['結末', R.end]].concat(HK.SAFE_ON ? [] : [['エッチ', R.sex + '回']]), lines: lines };
  };
  /* ---------- 結果欄の二人の関係（2026-11-04 報告：友人・同僚・元恋人がどれも「両片想い」、夫婦が「恋人として落ち着いた」、師弟が「片想い」、不仲が弱音のあとも「宿敵」）----------
     看病する人・される人の二人は、始まりの関係と本編の出来事（告白・夜・デート・弱音）から決める（本体の値からの分け方は使わない）。名前は本体の結末の表 HK.LABELS に kbk_ の札として足す */
  var KBC = {
    wed: ['支え合う夫婦', 'love', 2, '夫婦として、看病の数日でいっそう支え合うようになった。'],
    lover: ['恋人', 'love', 2, '恋人どうし、看病の数日で前より頼り合うようになった。'],
    koi: ['恋人になった', 'love', 2, '看病をきっかけに想いを告げ、恋人になった。'],
    kin: ['仲の良い{k}', 'partner', 2, '{k}として、看病の数日を支え合って過ごした。'],
    fwb: ['体の関係', 'night', 0, 'これまでどおりの体の関係のまま、看病の数日で少しだけ素顔を見せ合った。'],
    body: ['名前のつかない関係', 'night', 0, '看病の数日のあと、体の距離が先に縮んだ。気持ちの名前は、まだつけられない。'],
    date: ['友達以上恋人未満', 'love', 2, 'お礼のデートまで出かけたが、決定的な言葉はまだ口にしていない。'],
    pine: ['両片想い', 'love', 2, '互いに惹かれているのに、看病のあとも決定的な言葉を口にしなかった。'],
    crush: ['片想い', 'pine', 0, '{x}から{y}への想いは、看病のあとも胸の中にしまわれたままだった。'],
    soft: ['少し角が取れた仲', 'friend', 0, 'まだ素直にはなれないが、看病の数日で少しだけ角が取れた。'],
    rival: ['ライバル', 'enemy', -1, '張り合う相手のまま、看病で貸し借りが一つできた。'],
    lovehate: ['憎みながら惹かれ合う', 'obsess', 0, '苛立ちと惹かれる気持ちが、看病の数日で少しだけ近づいた。'],
    bad: ['ぎこちない仲', 'enemy', -1, '看病のあいだも、二人は最後まで素直になれなかった。'],
    ex: ['元恋人', 'friend', 1, '元恋人のまま、看病の数日で少しだけ昔の距離を思い出した。'],
    tie: ['頼り合える{k}', 'friend', 1, '{k}として、看病の数日で前より頼り合える仲になった。']
  };
  var TIE_WORD = { mentor: '師弟', senpai: '先輩と後輩', work: '同僚', childhood: '幼なじみ', friend: '友人', school: '同級生', weak: '知り合い', none: '知り合い' };
  function kbClass(ctx) {
    var S = f(ctx); decideEnd(ctx);
    /* 恋愛にしてよくない二人（恋愛：なし・恐怖・恋愛相手の固定など。S.love が偽、か今の時点で本体の恋愛の可否が通らない）には、恋愛の関係名を付けない */
    var lv = S.love && (!ctx.romanceOk || ctx.romanceOk([S.A, S.B], false)) && !(HK.fearHeld && (HK.fearHeld(S.A, S.B)));
    if (!lv) {
      if (S.rk === 'fam' || S.rk === 'pfam') return { k: 'kin', w: S.famW || RK_NAME[S.rk] };
      if (S.sex > 0) return { k: S.fwb ? 'fwb' : 'body' };
      return { k: 'tie', w: TIE_WORD[S.rk] || RK_NAME[S.rk] || '知り合い' };
    }
    if (S.rk === 'spouse') return { k: 'wed' };
    if (S.couple0) return { k: 'lover' };
    if (S.confessed) return { k: 'koi' };
    if (S.rk === 'fam' || S.rk === 'pfam') return { k: 'kin', w: S.famW || RK_NAME[S.rk] };
    if (S.fwb) return { k: 'fwb' };
    if (S.sex > 0) return { k: 'body' };
    if (S.dated && S.love) return { k: 'date' };
    if (S.rk === 'almost') return { k: 'pine' };
    if (S.rk === 'crush') { var cA = S.rkKey === 'crushA'; return { k: 'crush', dir: (cA ? S.A : S.B).i, x: (cA ? S.A : S.B).name, y: (cA ? S.B : S.A).name }; }
    if (S.rk === 'ex') return { k: 'ex' };
    if (S.rk === 'rival') return { k: 'rival' };
    if (S.rk === 'lovehate') return { k: 'lovehate' };
    if (S.rk === 'bad') return { k: S.weakIn || S.thanked ? 'soft' : 'bad' };
    return { k: 'tie', w: TIE_WORD[S.rk] || '知り合い' };
  }
  scen.classify = function (ctx, X, Y, pf) {
    var S = f(ctx); if (!S || S.A === S.B || !((X === S.A && Y === S.B) || (X === S.B && Y === S.A))) return null;
    var c = kbClass(ctx), M0 = KBC[c.k], id = 'kbk_' + c.k + (c.w ? '_' + c.w : '');
    if (!HK.LABELS[id]) HK.LABELS[id] = { name: M0[0].split('{k}').join(c.w || ''), cls: M0[1], pol: M0[2] };
    return { id: id, dir: c.dir, kbc: c };
  };
  scen.pairText = function (ctx, X, Y, cl) {
    var c = cl && cl.kbc; if (!c) return null;
    return KBC[c.k][3].split('{k}').join(c.w || '').split('{x}').join(c.x || '').split('{y}').join(c.y || '');
  };
  /* 結果欄の住人ごとの所見（本体の charSummary）の「想いは向こうからも返ってきていた」は、二人きりだと数値だけで必ず付くので、
     片想いのまま終わった想う側では「想いが同じ形で返ってきたかは分からない」に直す（2026-11-05 報告。保存前の、作ったばかりの結果だけを直す） */
  if (HK.wrap && HK.simulate) HK.wrap(HK, 'simulate', function (sim0) {
    return function (input) {
      var r = sim0.apply(this, arguments);
      try {
        var R = r && r.end && r.end.kanbyo;
        if (input && input.scenId === ID && R && R.oneSide != null) (r.chars || []).forEach(function (c) {
          if (c.i !== R.oneSide || !Array.isArray(c.notes)) return;
          c.notes = c.notes.map(function (n) { return String(n).replace('。想いは向こうからも返ってきていた。', '。けれど、その想いが同じ形で返ってきたかどうかは、まだ分からない。'); });
        });
      } catch (e) { /* 所見の直しに失敗しても結果は返す */ }
      return r;
    };
  });
  HK.Kanbyo = { okText: okText, stageOf: stageOf, kStage: kStage, sickNight: sickNight, relKind: relKind, RK_NAME: RK_NAME, pickT: pickT, per: per };
  HK.SCENARIOS[ID] = scen;
  if (HK.Lewd && HK.Lewd.install) HK.Lewd.install(ID, { lenDef: 'mix', desc: HK.SAFE_BUILD ? '' : '夜の場面の描き方。ほのめかす＝ぼかした一文と翌朝だけ／ほどほど＝描写する／濃い＝果てたあと、もう一度求め合うところまで' });
})();
