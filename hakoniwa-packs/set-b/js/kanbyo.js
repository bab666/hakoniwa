/* 看病の部屋（追加パック set-b の部屋。エンジン型。両方のビルド。2026-11-03。設計は docs/reports/2026-11-03/kanbyo-design.md）
   どちらかが体調を崩し、もう一人が看病する数日を、朝・日中・夜の3区切りで眺める。部屋の中心は熱の高さ（上がる→いちばん高い→下がる→治る）。
   ・関係は名簿の二人の関係のまま（関係を選ぶ欄は無い。2026-11-03 利用者の訂正）。関係（友人・幼なじみ・同僚・先輩後輩・師弟・片想い・両片想い・恋人・夫婦・家族・元恋人・不仲・知人・関係なし）で
     導入・看病の文・山場の弱音・結末の言い回しが変わる。恋愛にできない関係（家族など）は恋愛の結末が出ないだけ
   ・看病する側／される側は住人ごとの「立場」で選べる（おまかせは性格・仕事の型・体調の設定から）。三人目は見舞いに来る側
   ・環境ダイヤル：病の重さ・日数（3〜7日）・同居か通いか・うつりやすさ・登場しない住人（見舞い）
   ・性格で分かれる行動：看る側は「世話を焼きすぎる／不器用に失敗する」、看られる側は「強がって隠す／甘える」（態度9種・気質で選び、運命の揺らぎでらしくない方に）。受け止め方も態度で
   ・山場：熱がいちばん高い夜の弱音（必ず出す）
   ・結末：治って恋人に／お礼のデート／うつって看病し返す／両片想いのまま（恋人・夫婦は「いつもより甘い数日」、恋愛にならない二人は「お礼」）
   ・R18版：病気の間（うつった人の病気の間も）は性的な場面を起こさない。治った日の夜・お礼のデートの夜・うつった人が治った夜・甘い数日の夜・治ったあとの夜だけ（kanbyo-r18.js）。
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
/* @event scen=set-b-kanbyo id=kb_contact cat=bond tie=- label=他の住人からお大事にと連絡が来る */
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
  function fill(ctx, t, a, b, ex) { return K.fill(ctx, t, a, b, ex); }
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
    ex: 'ex', almost: 'almost', crush: 'crush', yan: 'crush', enemy: 'bad', bad: 'bad', rival: 'bad', abuse: 'bad',
    teacher: 'mentor', mentor: 'mentor', master: 'mentor', worship: 'mentor', senpai: 'senpai', colleague: 'work', boss: 'work', childhood: 'childhood',
    friend: 'friend', best: 'friend', buddy: 'friend', benefactor: 'friend', fwb: 'friend', comrade: 'friend', classmate: 'school', acq: 'weak' };
  var RK_ORD = ['spouse', 'lover', 'fam', 'pfam', 'ex', 'almost', 'crush', 'bad', 'mentor', 'senpai', 'work', 'childhood', 'friend', 'school', 'weak'];
  var RK_GRP = { spouse: 'love', lover: 'love', almost: 'pine', crush: 'pine', friend: 'close', childhood: 'close', school: 'close', work: 'work', senpai: 'work', mentor: 'work', fam: 'fam', pfam: 'fam', ex: 'awk', bad: 'awk', weak: 'awk', none: 'awk' };
  var RK_NAME = { spouse: '夫婦', lover: '恋人', fam: '家族', pfam: '家族同然', ex: '元恋人', almost: '両片想い', crush: '片想い', bad: '不仲', mentor: '師弟', senpai: '先輩と後輩', work: '同僚', childhood: '幼なじみ', friend: '友人', school: '同級生', weak: '知り合い', none: '特に関係なし' };
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
    if (!K.choreOk(x, a, b)) return false;
    return true;
  }
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
  function relList(T, S) { if (!T) return []; return (S.rkKey && T[S.rkKey] || []).concat(T[S.rk] || [], T[S.grp] || [], T.all || []); }
  function relPick(ctx, T, a, b, rep) {
    var S = f(ctx), own = T ? (S.rkKey && T[S.rkKey] ? T[S.rkKey] : []).concat(T[S.rk] || [], T[S.grp] || []) : [];
    return pickT(ctx, own, a, b) || pickT(ctx, T && T.all, a, b) || (rep ? pickT(ctx, own.concat(T && T.all || []), a, b, true) : '');
  }
  /* 表 T に、まだ使っていない合う文があるか */
  function hasFresh(ctx, T, a, b) { var S = f(ctx); return cands(ctx, relList(T, S), a, b).some(function (y) { return !S.used[y]; }); }

  /* ---------- 熱の高さ（日ごとの段：rise 上がる／peak いちばん高い／fall 下がる／heal 治った日／after 治ったあと） ---------- */
  var TEMP = { light: { rise: '三十七度五分', peak: '三十八度ちょうど', fall: '三十七度二分' }, mid: { rise: '三十七度八分', peak: '三十八度七分', fall: '三十七度六分' }, heavy: { rise: '三十八度三分', peak: '三十九度五分', fall: '三十八度ちょうど' } };
  function plan(ctx, S) {
    var D = S.days, sev = S.sev, r = ctx.rng();
    var p = sev === 'light' ? (r < 0.5 ? 0 : 1) : sev === 'heavy' ? (D >= 5 ? (r < 0.5 ? 1 : 2) : 1) : (D >= 6 && r < 0.3 ? 2 : 1);
    p = Math.max(0, Math.min(p, D - 2));
    var fl = sev === 'light' ? 0 : sev === 'heavy' ? 1 + (ctx.rng() < 0.5 ? 1 : 0) : (ctx.rng() < 0.5 ? 1 : 0);
    var h = p + 1 + fl, cap = D >= 4 ? D - 2 : D - 1;
    if (h > cap) h = Math.max(p + 1, cap);
    S.peak = p; S.heal = h;
  }
  function stageOf(S, d) { return d < S.peak ? 'rise' : d === S.peak ? 'peak' : d < S.heal ? 'fall' : d === S.heal ? 'heal' : 'after'; }
  /* うつった人（看病した人）の段：ksick（寝込む日）／kheal（治った日）。無ければ null */
  function kStage(S, d) { var k = S.kaeshi; if (!k) return null; return d >= k.from && d < k.heal ? 'ksick' : d === k.heal ? 'kheal' : d > k.heal ? 'kafter' : null; }
  /* その夜、誰かが病気か（性的な場面を起こさない夜） */
  function sickNight(S, d) { var st = stageOf(S, d); return st === 'rise' || st === 'peak' || st === 'fall' || kStage(S, d) === 'ksick'; }

  /* ---------- 立場・おまかせ ---------- */
  function partOf(input, i) { var p = input && input.perChar && input.perChar[i]; return p && p.pick ? p.pick.part : null; }
  /* 二人（看病する側・される側）：立場で選んだ人を先に、ほかは上から（三人目は見舞いに来る側） */
  function couple(C, input) {
    var ok = C.filter(function (c) { var p = partOf(input, c.i); return p === 'carer' || p === 'patient'; }).slice(0, 2);
    C.forEach(function (c) { if (ok.length < 2 && ok.indexOf(c) < 0 && partOf(input, c.i) !== 'guest') ok.push(c); });
    C.forEach(function (c) { if (ok.length < 2 && ok.indexOf(c) < 0) ok.push(c); });
    return ok.slice(0, 2);
  }
  function pickOfChar(ctx, c, k) { var p = ctx.input && ctx.input.perChar && ctx.input.perChar[c.i]; return p && p.pick ? p.pick[k] : null; }
  /* 体調を崩しやすさ（おまかせのとき）：無理をしがちな仕事の型・自分のことに無頓着（A 低め）・頑張りすぎ（CP 高め） */
  var WORK_SICK = { overtime: 0.45, out: 0.3, shift: 0.35, trip: 0.3, self: 0.25, regular: 0.15, remote: 0.12, home: 0.1 };
  function sickScore(c) { var t = c.tr || {}; return 0.2 + (WORK_SICK[c.life && c.life.work] || 0.2) + (1 - (t.a != null ? t.a : 0.5)) * 0.3 + (t.cp || 0.5) * 0.2; }
  function careScore(c) { var t = c.tr || {}; return 0.2 + (t.np || 0.5) * 0.5 + (t.warmth || 0.5) * 0.3 + (c.life && /home|remote/.test(c.life.work) ? 0.15 : 0); }

  /* ---------- 性格で分かれる行動 ----------
     看る側：over（世話を焼きすぎる）／clumsy（不器用に失敗する）。看られる側：hide（強がって隠す）／amae（甘える）。
     態度9種と気質で選び、運命の揺らぎ（HK.PairReact.pOdd）でらしくない方に入れ替わる（記録の「らしくない」の印） */
  var CB_FIT = { devoted: 'over', gentle: 'over', polite: 'over', stern: 'over', proud: 'clumsy', tsun: 'clumsy', free: 'clumsy', shy: 'clumsy', cool: 'over' };
  var PB_FIT = { proud: 'hide', tsun: 'hide', stern: 'hide', cool: 'hide', polite: 'hide', devoted: 'amae', gentle: 'amae', free: 'amae', shy: 'amae' };
  function behOf(ctx, c, side) {
    var t = c.tr || {}, p = per(c), base = side === 'carer' ? CB_FIT[p] : PB_FIT[p];
    if (side === 'carer') { var cl = (LF.clumsy(c) ? 0.6 : 0) + (1 - (t.a != null ? t.a : 0.5)) * 0.3 + (t.impulse || 0.4) * 0.3, ov = (t.np || 0.5) * 0.6 + (t.warmth || 0.5) * 0.3; base = cl > ov + 0.15 ? 'clumsy' : ov > cl + 0.15 ? 'over' : base; }
    else { var hd = (t.cp || 0.5) * 0.5 + (1 - (t.honesty || 0.5)) * 0.4, am = (t.ac || 0.5) * 0.5 + (t.np || 0.5) * 0.3; base = hd > am + 0.15 ? 'hide' : am > hd + 0.15 ? 'amae' : base; }
    var odd = RC() && ctx.rng() < RC().pOdd(ctx);
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
    desc: 'どちらかが体調を崩し、もう一人が看病する数日を、朝・日中・夜ごとに眺める。熱は上がって、いちばん高い夜を越え、やがて下がる。世話を焼きすぎたり、強がったり、甘えたり――同じ看病でも、二人の関係と性格で中身が変わる。治ったあとは、恋人になったり、お礼のデートに出かけたり、今度はうつった相手を看病し返したり。',
    note: '※参加は3人まで。二人の関係は、住人の関係の設定のまま使います（家族など恋愛にならない関係でも遊べます。そのときは恋愛の結末が出ません）。看病する側・される側は住人ごとの「立場」で選べます。三人目は見舞いに来る側です。登場人物はすべて成人として扱います。',
    unit: '日', perUnit: 3, preRel: 0, lethal: false, minCast: 2, maxCast: 3,
    catBias: { romance: 1, bond: 1.2, help: 1.2, conflict: 0.2, combat: 0, betray: 0, kill: 0 },
    decay: 0.998, actRate: 0.15,
    derived: ['warmth', 'honesty', 'jealous', 'impulse'],
    env: [
      { id: 'days', label: '日数', min: 3, max: 7, def: 5, lo: '3日', hi: '7日', unit: '日', desc: '見守る日数。1日は朝・日中・夜の3区切り。熱は上がって、いちばん高い夜を越え、治ったあとの日も少し残る' },
      { id: 'sev', label: '病の重さ', type: 'select', def: 'mid', options: [{ v: 'light', label: '軽い風邪（微熱とだるさ）' }, { v: 'mid', label: '熱が出る（ふつう）' }, { v: 'heavy', label: '寝込む（高い熱が続く）' }], desc: '重いほど熱が高く、治るまでの日数が長い' },
      { id: 'live', label: '同居か通いか', type: 'select', def: 'auto', options: [{ v: 'auto', label: 'おまかせ（二人の関係から）' }, { v: 'together', label: '同居（同じ家で看病する）' }, { v: 'visit', label: '通い（看病する人が毎日訪ねてくる）' }], desc: '通いなら、看病する人が朝に来て夜に帰る（熱がいちばん高い夜は泊まり込む）' },
      { id: 'cont', label: 'うつりやすさ', type: 'select', def: 'mid', options: [{ v: 'low', label: 'うつりにくい' }, { v: 'mid', label: 'ふつう' }, { v: 'high', label: 'うつりやすい' }], desc: '高いほど、治ったあとに看病した人へうつり、今度は看病し返す結末になりやすい（日数が足りないときは起きない）' },
      { id: 'outsideNames', label: '登場しない住人を出す', type: 'select', def: 'yes', options: [{ v: 'yes', label: '出す（名簿の住人のうち、二人と関係のある人が見舞いに来る・差し入れ・連絡をくれる）' }, { v: 'no', label: '出さない（二人と、参加者だけ）' }],
        desc: '名簿にいて今回は参加していない住人のうち、二人のどちらかと関係（家族・擬似親子・友人・同僚・先輩後輩・同級生・元恋人・知人）がある人（三人まで）が、名簿の性格・口調・関係のまま、見舞いに来たり、差し入れを届けたり、連絡をくれたりします。見舞いに来る住人は関係図に出ず、その人との恋愛も始まりません。参加者の三人目（住人ごとの「立場」で「見舞いに来る側」にした人）は、この設定にかかわらず同じように出ます' }
    ],
    stats: [],
    perFields: [
      { id: 'part', label: '立場', auto: 'おまかせ（性格・仕事の型から。上の二人が看病する側とされる側）', options: [{ id: 'carer', label: '看病する側' }, { id: 'patient', label: '看病される側（体調を崩す）' }, { id: 'guest', label: '見舞いに来る側' }] },
      { id: 'work', label: '仕事の型', auto: 'おまかせ（気質から）', options: LF.WORK.map(function (w) { return { id: w.v, label: w.label }; }) },
      { id: 'job', label: '職業', type: 'text', placeholder: function () { return '例：営業、看護師（空欄でもよい）'; } },
      { id: 'role', label: '家事の得意さ', auto: 'おまかせ（気質から）', options: LF.ROLE.map(function (r) { return { id: r.v, label: r.label }; }) }
    ],
    actions: [{ id: 'live', label: 'いつもどおりに過ごす', fit: function () { return 0.5; } }],
    goals: [{ id: 'well', label: '早く元気になってほしい', fit: function () { return 0.5; } }],
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
  if (!HK.SAFE_BUILD) scen.env.push({ id: 'lewdN', label: 'エッチの回数（R18）', type: 'select', def: 'high', options: [{ v: 'none', label: 'なし' }, { v: 'low', label: '1回まで' }, { v: 'high', label: '2回まで（一度は長い場面）' }], desc: '治ったあとに起きるエッチの場面の回数の上限（恋人どうしになった二人・体の関係にしてよい二人だけ。病気の間は起きない）。2回までなら、最後のエッチは段落を分けた長い場面になる（描写の長さが「数行で短く」のときを除く）' });
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
    if (px === 'patient' || py === 'carer') { A = Y; B = X; }
    else if (px === 'carer' || py === 'patient') { A = X; B = Y; }
    else { var sx = sickScore(X) + careScore(Y), sy = sickScore(Y) + careScore(X); if (ctx.rng() < sx / (sx + sy)) { B = X; A = Y; } else { B = Y; A = X; } }
    var rk = relKind(ctx, A, B);
    var S = ctx.kb = { days: days, A: A, B: B, G: C.filter(function (c) { return c !== A && c !== B; }), rk: rk, grp: RK_GRP[rk], used: {},
      sev: /^(light|mid|heavy)$/.test(env.sev) ? env.sev : 'mid', cont: /^(low|mid|high)$/.test(env.cont) ? env.cont : 'mid',
      love: canLove2(ctx, A, B) && !/^(fam|pfam)$/.test(rk), couple: /^(spouse|lover)$/.test(rk), sex: 0, lewdMax: 0, visits: 0, cares: 0, behs: 0, odd: 0, endK: null, confessed: false, dated: false };
    /* 本体の恋愛の可否（恋愛相手の固定など）も見る */
    if (S.love && ctx.romanceOk && !ctx.romanceOk([A, B], false)) S.love = false;
    S.pine = S.love && /^(almost|crush)$/.test(rk);
    S.rkKey = relDir(ctx, A, B, rk);
    /* 同居か通いか（おまかせ：夫婦・家族はいつも同居、恋人は半々、ほかは通い） */
    S.live = env.live === 'together' || env.live === 'visit' ? env.live : rk === 'spouse' || rk === 'fam' || rk === 'pfam' ? 'together' : rk === 'lover' ? (ctx.rng() < 0.5 ? 'together' : 'visit') : 'visit';
    S.G.forEach(function (g) { g.gone = true; g.life = g.life || { job: '' }; if (pickOfChar(ctx, g, 'outside')) g.outside = true; });
    plan(ctx, S);
    S.cb = behOf(ctx, A, 'carer'); S.pb = behOf(ctx, B, 'patient');
    /* うつる：治った日の翌日から看病した人が寝込む（日数が足りるときだけ）。うつりやすさ・同居・近くで世話をする行動で起こりやすく */
    var pc = { low: 0.08, mid: 0.2, high: 0.45 }[S.cont] * (S.live === 'together' ? 1.25 : 1) + (S.pb.k === 'amae' ? 0.08 : 0) + (S.cb.k === 'over' ? 0.06 : 0);
    if (S.heal <= days - 3 && ctx.rng() < pc) { var len = ctx.rng() < 0.5 ? 1 : 2; S.kaeshi = { from: S.heal + 1, heal: S.heal + 1 + len }; }
    if (!HK.SAFE_ON && HK.KanbyoR18 && HK.KanbyoR18.quota) S.lewdMax = HK.KanbyoR18.quota(ctx, env.lewdN);
    ctx.place = S.live === 'together' ? '二人の家' : B.name + 'の部屋';
    /* 導入：なぜ看病することになったか（関係ごとの段）と、体調を崩したわけ（仕事の型・重さ） */
    var Tx = TX(), intro = relPick(ctx, Tx.INTRO, A, B) || '{b}が体調を崩した。{a}は、その看病をすることになった。';
    var cause = pickT(ctx, (Tx.CAUSE || {})[B.life.work] || [], A, B) || pickT(ctx, (Tx.CAUSE || {}).all, A, B);
    var liv = pickT(ctx, (Tx.LIVE || {})[S.live], A, B);
    var tx = fill(ctx, cause, A, B) + fill(ctx, intro, A, B, { rel: RK_NAME[rk] }) + (liv ? fill(ctx, liv, A, B) : '');
    ctx.act2({ actors: [A, B], cat: 'bond', text: tx, why: '看病の部屋：始まり（' + RK_NAME[rk] + '・' + B.name + 'が体調を崩した）' });
  }

  /* ---------- 一日 ---------- */
  var REST_RATE = 1e-9;
  function phase(ctx, s, n) {
    var S = f(ctx), A = S.A, B = S.B, d = Math.floor(s / 3), t = s % 3;
    if (A === B) return;
    /* 関係の値の始まり（関係の設定の値に、看病の距離の近さを少し足す） */
    if (s === 0) ctx.mod2(A, B, { aff: 8, trust: 6 }, { aff: 8, trust: 6 });
    var st = stageOf(S, d), ks = kStage(S, d), sick = st === 'rise' || st === 'peak' || st === 'fall' || ks === 'ksick';
    scen.actRate = sick ? REST_RATE : 0.15;
    if (sick && ctx.stepIndex != null) ctx._emoWS = ctx.stepIndex;
    if (t === 0) S.day = { d: d, st: st, ks: ks, hol: holiday(d), visited: false, care: 0 };
    var day = S.day, last = d === S.days - 1;
    if (ks === 'ksick' || ks === 'kheal') { kaeshiStep(ctx, day, t, last); return; }
    if (st === 'heal' || st === 'after') { healStep(ctx, day, t, last); return; }
    /* 病気の間（rise・peak・fall） */
    if (t === 0) {
      if (S.live === 'visit' && d > 0) say1(ctx, (TX().ARRIVE || {}), A, B, 'kb_arrive', '看病の部屋：通いの看病（' + A.name + 'が来た）', 'bond');
      morning(ctx, day);
      care(ctx, day, 'm');
      return;
    }
    if (t === 1) {
      if (d === 0 && !day.hol) rest(ctx, day);
      care(ctx, day, 'd');
      behave(ctx, day);
      visit(ctx, day, 'd');
      if (ctx.rng() < 0.45) care(ctx, day, 'd');
      return;
    }
    /* 夜 */
    if (st === 'peak') { weakNight(ctx, day); }
    else {
      care(ctx, day, 'n');
      var nt = pickT(ctx, ((TX().NIGHT || {})[st]) || [], A, B);
      if (nt) ctx.act2({ actors: [A, B], cat: 'bond', text: fill(ctx, nt, A, B, { temp: TEMP[S.sev][st] || '' }) + careReact(ctx, A, B, 0.35), why: '看病の部屋：看病の夜（' + (st === 'rise' ? '熱が上がっていく' : '熱が下がり始めた') + '）', fx: function () { ctx.mod2(A, B, { aff: 1, trust: 1 }, { aff: 2, trust: 2 }); } });
      visit(ctx, day, 'n');
      if (S.live === 'visit') say1(ctx, TX().LEAVE || {}, A, B, 'kb_leave', '看病の部屋：通いの看病（' + A.name + 'が帰った）', 'bond');
    }
    if (last) ending(ctx);
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
    var t = pickT(ctx, (M[day.st] || []).concat(day.d === 0 ? M.first || [] : []), A, B);
    if (day.d === 0) t = pickT(ctx, M.first, A, B) || t;
    if (!t) return;
    ctx.act2({ actors: [A, B], cat: 'bond', text: fill(ctx, t, A, B, { temp: TEMP[S.sev][day.st] || '' }) + careReact(ctx, A, B, 0.4), why: '看病の部屋：朝（' + ST_NAME[day.st] + '・' + TEMP[S.sev][day.st] + '）', fx: function () { ctx.mod2(A, B, { aff: 1 }, { aff: 1, trust: 1 }); } });
  }
  function rest(ctx, day) {
    var S = f(ctx), A = S.A, B = S.B, W = TX().REST || {};
    if (B.life.work !== 'home') { var rt = pickT(ctx, W.patient, A, B); if (rt) ctx.act2({ actors: [B], cat: 'solo', text: fill(ctx, rt, A, B), why: '看病の部屋：体調を崩して休んだ（' + B.name + '）' }); }
    if (!/home|remote/.test(A.life.work) && S.live === 'together') { var wt = pickT(ctx, W.carer, A, B); if (wt) ctx.act2({ actors: [A, B], cat: 'bond', text: fill(ctx, wt, A, B), why: '看病の部屋：看病のために仕事を休んだ（' + A.name + '）' }); }
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
    var e = ctx.act2({ actors: [A, B], cat: 'bond', text: fill(ctx, t, A, B, { temp: TEMP[S.sev][day.st] || '' }) + careReact(ctx, A, B, 0.45), why: '看病の部屋：看病（' + (CARE_NAME[row.k] || row.k) + '）', fx: function () { ctx.mod2(A, B, { aff: 1, trust: 1 }, { aff: 2 + warmK(B), trust: 2, att: S.love ? 1 : 0 }); } });
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
    /* 熱がいちばん高い日は強がれない（甘える・世話を焼きすぎる・失敗だけ） */
    if (day.st === 'peak' && bh.k === 'hide') { side = 'c'; bh = S.cb; }
    var who = side === 'p' ? B : A, other = side === 'p' ? A : B;
    var t = relPick(ctx, B0[bh.k] || {}, A, B);
    if (!t) return;
    /* 受け止め方：相手の態度9種（失敗は共通の受け止め方 oops） */
    var rt = '', odd2 = false;
    if (bh.k === 'clumsy' && RC()) { var r = RC().say(ctx, 'oops', other, who); if (r.text && okText(ctx, r.text, other, who)) { rt = fill(ctx, r.text, other, who); odd2 = r.odd; if (odd2) rt += fill(ctx, RC().after(ctx, S.love), other, who); } }
    else { var RR = Rx[bh.k] || {}, rr = pickT(ctx, RR[per(other)] || RR.gentle, A, B); if (rr) rt = fill(ctx, rr, A, B); }
    var e = ctx.act2({ actors: [A, B], cat: 'bond', text: fill(ctx, t, A, B, { temp: TEMP[S.sev][day.st] || '' }) + rt, odd: bh.odd || odd2, why: '看病の部屋：' + who.name + 'が' + BEH_NAME[bh.k] + (bh.odd ? '（らしくない）' : ''),
      fx: function () { if (bh.k === 'hide') ctx.mod2(A, B, { trust: -1, aff: 1 }, { aff: 1 }); else if (bh.k === 'amae') ctx.mod2(A, B, { aff: 2, att: S.love ? 2 : 0 }, { aff: 2, trust: 2 }); else ctx.mod2(A, B, { aff: 1 }, { aff: 2, trust: 1 }); } });
    if (e) { S.behs++; if (e.odd) S.odd++; }
  }
  /* 山場：熱がいちばん高い夜の弱音（必ず出す）。通いなら泊まり込む段から。弱音は看られる側の態度・関係で、受け答えは看る側の態度で */
  function weakNight(ctx, day) {
    var S = f(ctx), A = S.A, B = S.B, Tx = TX();
    if (S.live === 'visit') say1(ctx, Tx.STAY || {}, A, B, 'kb_stay', '看病の部屋：熱が高いので泊まり込んだ（' + A.name + '）', 'bond');
    var W = Tx.WEAK || {}, Wa = Tx.WEAK_ANS || {}, Wt = Tx.WEAK_REL || {};
    var w = pickT(ctx, W[per(B)] || W.gentle, A, B, true) || '夜中、{b}は熱にうかされて、{a}の名前を呼んだ。「……そばにいて｜……そばにいてくれ｜……そばにいてください」';
    var ans = pickT(ctx, Wa[per(A)] || Wa.gentle, A, B);
    var tail = relPick(ctx, Wt, A, B);
    var lv = S.love && (S.couple || S.pine) ? pickT(ctx, Tx.WEAK_LOVE, A, B) : '';
    var tx = fill(ctx, w, A, B, { temp: TEMP[S.sev].peak }) + (ans ? fill(ctx, ans, A, B) : '') + (tail ? fill(ctx, tail, A, B) : '') + (lv ? fill(ctx, lv, A, B) : '');
    var e = ctx.act2({ actors: [B, A], cat: S.love && (S.couple || S.pine) ? rcat(ctx, A, B) : 'bond', text: tx, why: '看病の部屋：熱がいちばん高い夜の弱音（' + B.name + '・' + TEMP[S.sev].peak + '）', fx: function () { ctx.mod2(A, B, { aff: 4, trust: 3, att: S.love ? 4 : 0 }, { aff: 5, trust: 5, att: S.love ? 4 : 0 }); } });
    if (e) { e.tag = '山場'; S.weak = true; }
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
    S.endScore = Math.round(sc);
    /* 関係ごとの線（恋人に／お礼のデート）。両片想い・片想いはもともと高いので線も高く、半分ほどが恋人に、残りはデートか両片想いのまま */
    var th = END_TH[S.rk] || END_TH.def;
    return (S.endK = sc >= th[0] ? 'koi' : sc >= th[1] ? 'date' : 'mama');
  }
  var END_TH = { almost: [118, 102], crush: [104, 92], ex: [82, 70], bad: [22, 10], def: [64, 49] };
  function healStep(ctx, day, t, last) {
    var S = f(ctx), A = S.A, B = S.B, Tx = TX(), ek = decideEnd(ctx);
    if (day.st === 'heal') {
      if (t === 0) {
        if (S.live === 'visit') say1(ctx, Tx.ARRIVE || {}, A, B, 'kb_arrive', '看病の部屋：通いの看病（' + A.name + 'が来た）', 'bond');
        var ht = relPick(ctx, Tx.HEAL || {}, A, B);
        if (ht) ctx.act2({ actors: [A, B], cat: 'bond', text: fill(ctx, ht, A, B), why: '看病の部屋：熱が下がった朝（' + B.name + '）', fx: function () { ctx.mod2(A, B, { aff: 2, trust: 2 }, { aff: 2, trust: 2 }); } });
        return;
      }
      if (t === 1) {
        var TH = Tx.THANKS || {}, th = pickT(ctx, TH[per(B)] || TH.gentle, A, B), tr = relPick(ctx, Tx.THANKS_REL || {}, A, B);
        if (th) ctx.act2({ actors: [B, A], cat: 'bond', text: fill(ctx, th, A, B) + (tr ? fill(ctx, tr, A, B) : ''), why: '看病の部屋：看病のお礼（' + B.name + 'から）', fx: function () { ctx.mod2(B, A, { aff: 4, trust: 3, att: S.love ? 3 : 0 }, { aff: 3, att: S.love ? 2 : 0 }); } });
        if (S.kaeshi) say1(ctx, Tx.KAESHI_SIGN || {}, A, B, 'kb_kaeshi', '看病の部屋：' + A.name + 'に風邪がうつりかけている', 'bond');
        return;
      }
      /* 治った日の夜：最後の日なら結末、そうでなければ穏やかな夜（恋人どうしなら R18 の夜も） */
      if (last) { lastDay(ctx, day); return; }
      if (ek === 'koi' && S.heal >= S.days - 2 && !S.confessed) confess(ctx);
      night(ctx, day, 'heal');
      if (S.live === 'visit' && !nightTogether(S)) say1(ctx, Tx.LEAVE_WELL || Tx.LEAVE || {}, A, B, 'kb_leave', '看病の部屋：' + A.name + 'が帰った', 'bond');
      return;
    }
    /* 治ったあと（after） */
    if (t === 0) { if (last || ctx.rng() < 0.6) say1(ctx, Tx.AFTER_M || {}, A, B, 'kb_after', '看病の部屋：治ったあとの朝', 'bond'); return; }
    if (t === 1) {
      if (last && (ek === 'date' || ek === 'koi' || ek === 'amai') && S.love) { date(ctx); return; }
      if (last && ek === 'rei') { say1(ctx, Tx.REI || {}, B, A, 'kb_rei', '看病の部屋：看病のお礼に出かけた（' + B.name + 'から）', 'bond'); S.dated = true; return; }
      if (ek === 'amai' && ctx.rng() < 0.8) { say1(ctx, Tx.SWEET || {}, A, B, 'kb_sweet', '看病の部屋：いつもより甘い一日', rcat(ctx, A, B)); return; }
      say1(ctx, Tx.AFTER_D || {}, A, B, 'kb_after', '看病の部屋：治ったあとの一日', 'bond');
      return;
    }
    if (last) { lastDay(ctx, day); return; }
    if (!night(ctx, day, S.couple ? 'amai' : 'after') && ctx.rng() < 0.7) say1(ctx, Tx.AFTER_N || {}, A, B, 'kb_after', '看病の部屋：治ったあとの夜', 'bond');
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
    S.confessed = true; S.couple = true;
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
      if (t === 1) { say1(ctx, Tx.AFTER_D || {}, A, B, 'kb_after', '看病の部屋：治ったあとの一日', 'bond'); return; }
      if (last) { lastDay(ctx, day); return; }
      night(ctx, day, 'back');
      return;
    }
    /* B（治った人）が A を看る。{a}＝看る人（B）、{b}＝寝込んだ人（A） */
    if (t === 0) { say1(ctx, first ? Tx.KAESHI || {} : Tx.KMORN || {}, B, A, first ? 'kb_kaeshi' : 'kb_kcare', '看病の部屋：' + (first ? A.name + 'に風邪がうつった' : '看病し返す朝'), 'bond'); return; }
    if (t === 1) {
      if (first && !day.hol && A.life.work !== 'home') { var rt = pickT(ctx, (Tx.REST || {}).patient, B, A); if (rt) ctx.act2({ actors: [A], cat: 'solo', text: fill(ctx, rt, B, A), why: '看病の部屋：体調を崩して休んだ（' + A.name + '）' }); }
      say1(ctx, Tx.KCARE || {}, B, A, 'kb_kcare', '看病の部屋：看病し返す（' + B.name + 'が' + A.name + 'を）', 'bond');
      return;
    }
    if (last) { ending(ctx); return; }
    say1(ctx, Tx.KNIGHT || {}, B, A, 'kb_kcare', '看病の部屋：看病し返す夜', 'bond');
  }
  /* R18 の夜（kanbyo-r18.js。病気の夜は呼ばない） */
  function night(ctx, day, entry) {
    var S = f(ctx);
    if (HK.SAFE_ON || !HK.KanbyoR18 || S.sex >= S.lewdMax || sickNight(S, day.d)) return false;
    if (S.kaeshi && day.d < S.kaeshi.heal) return false;
    var ok = HK.KanbyoR18.night(ctx, entry, day, day.d === S.days - 1);
    if (ok) S.sex++;
    return ok;
  }
  /* ---------- 他の住人の見舞い（病気の間の日中・夜。関係図に出さない・恋愛を始めない） ---------- */
  function visit(ctx, day, part) {
    var S = f(ctx), PV = HK.PairVisit, VT = TX().VISIT || {};
    if (!PV || day.visited || !S.G.length) return;
    if (ctx.rng() > (part === 'd' ? (day.st === 'peak' ? 0.18 : 0.35) : 0.25)) return;
    var cands = [];
    S.G.forEach(function (g) {
      if (!PV.here(g)) return;
      [S.B, S.A].forEach(function (h) {
        var c = PV.cls(ctx, h, g); if (!c) return;
        var n = (S.gUsed && S.gUsed[g.i]) || 0, dw = 1 / (1 + n);
        if (part === 'd') { cands.push({ kind: 'visit', host: h, g: g, cls: c, w: (h === S.B ? 1.2 : 0.7) * dw * (c === 'ex' ? 0.5 : 1) }); cands.push({ kind: 'gift', host: h, g: g, cls: c, w: 0.8 * dw }); }
        else cands.push({ kind: 'contact', host: h, g: g, cls: c, w: (h === S.B ? 1 : 0.6) * dw });
      });
    });
    if (!cands.length) return;
    var v = HK.weighted(ctx.rng, cands, function (x) { return x.w; });
    S.gUsed = S.gUsed || {}; S.gUsed[v.g.i] = (S.gUsed[v.g.i] || 0) + 1;
    day.visited = true;
    var g = v.g, A = S.A, B = S.B, other = v.host === A ? B : A;
    var arr = (VT[v.kind] || {})[v.cls === 'pfam' ? 'fam' : v.cls] || (VT[v.kind] || {}).known || [];
    if (HK.relFilter) { var fl = HK.relFilter(ctx, arr, v.host, g); if (fl && fl.length) arr = fl; }
    var U = S.used, q = arr.filter(function (x) { return !U[x]; }), t = pickOf(ctx, q);
    if (!t) { day.visited = false; return; }
    U[t] = 1;
    g.gone = false;
    try {
      /* {a}＝看る人、{b}＝寝込んでいる人、{g}＝来た人、{gl}＝{h}（関係のある人）から見た呼び名、{h}＝関係のある人 */
      var ex = { g: g.name, gl: PV.word(ctx, v.host, g), h: v.host.name };
      var e = ctx.act2({ actors: v.kind === 'contact' ? [v.host, g] : [A, B, g], cat: 'bond', text: fill(ctx, t, A, B, ex), why: '看病の部屋：' + { visit: '他の住人がお見舞いに来た', gift: '他の住人から差し入れが届いた', contact: '他の住人から連絡が来た' }[v.kind] + '（' + g.name + '・' + ex.gl + '）',
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
    var key = (ek === 'date' || ek === 'rei') && !S.dated ? ek + '_promise' : ek;
    var E = (TX().END || {})[key] || (TX().END || {})[ek] || {}, t = relPick(ctx, E, A, B, true);
    if (!t) t = '{a}と{b}の看病の日々は、こうして終わった。';
    ctx.act2({ actors: [A, B], cat: /koi|date|amai/.test(ek) ? rcat(ctx, A, B) : 'bond', text: fill(ctx, t, A, B), why: '看病の部屋：結末（' + endName(S) + '）', fx: function () { ctx.mod2(A, B, { aff: 4, trust: 3 }, { aff: 4, trust: 3 }); } });
  }
  function finish(ctx) {
    var S = f(ctx), A = S.A, B = S.B;
    if (A === B) return;
    decideEnd(ctx);
    S.G.forEach(function (g) { g.gone = false; g.fate = g.outside ? '見舞いに来た住人（名簿から）' : '見舞いに来る住人'; g.fateNote = (S.gUsed && S.gUsed[g.i]) ? B.name + 'の具合を気にかけていた' : ''; });
    ctx.flags.kanbyo = { days: S.days, a: A.i, b: B.i, rel: RK_NAME[S.rk], rk: S.rk, sev: S.sev, live: S.live, peak: S.peak + 1, heal: S.heal + 1, kaeshi: S.kaeshi ? { from: S.kaeshi.from + 1, heal: S.kaeshi.heal + 1 } : null,
      cb: BEH_NAME[S.cb.k], pb: BEH_NAME[S.pb.k], cbOdd: S.cb.odd, pbOdd: S.pb.odd, endK: S.endK, end: endName(S), score: S.endScore, cares: S.cares, visits: S.visits, sex: S.sex, love: S.love, confessed: S.confessed, weak: !!S.weak };
    A.fate = '看病した人'; A.fateNote = B.name + 'を看病した';
    B.fate = S.kaeshi ? '看病された人（そして看病し返した人）' : '看病された人'; B.fateNote = A.name + 'に看病された';
    if (S.kaeshi) A.fateNote += '。最後は風邪がうつって、看病し返してもらった';
    ctx.flags.outcome = B.name + 'の看病の' + S.days + '日――' + endName(S);
  }
  if (HK.PairCast) HK.PairCast.install(ID, couple, 'kanbyo');
  var SEV_NAME = { light: '軽い風邪', mid: '熱が出る', heavy: '寝込む' };
  if (HK.Endings) HK.Endings[ID] = function (res, X) {
    var R = res.end && res.end.kanbyo, lines = [];
    if (!R) return { headline: res.outcome || '', stats: [], lines: [] };
    var a = X.nm(R.a), b = X.nm(R.b);
    lines.push('看病の' + R.days + '日（' + a + 'が' + b + 'を看病した・' + R.rel + '）');
    lines.push('病の重さ：' + SEV_NAME[R.sev] + '／' + (R.live === 'together' ? '同居で看病' : '通いで看病') + '／熱がいちばん高かったのは DAY' + R.peak + '、治ったのは DAY' + R.heal + (R.kaeshi ? '／DAY' + R.kaeshi.from + 'に' + a + 'へうつった' : ''));
    lines.push(a + '：' + R.cb + (R.cbOdd ? '（らしくない）' : '') + '／' + b + '：' + R.pb + (R.pbOdd ? '（らしくない）' : ''));
    lines.push('看病 ' + R.cares + '回' + (R.visits ? '／見舞い・差し入れ・連絡 ' + R.visits + '回' : '') + (HK.SAFE_ON ? '' : '／エッチ ' + R.sex + '回'));
    lines.push('結末：' + R.end);
    X.C.forEach(function (c) { c.afterDone = true; });
    return { headline: (res.outcome || '') + '。', stats: [['日数', R.days + '日'], ['看病', R.cares + '回'], ['結末', R.end]].concat(HK.SAFE_ON ? [] : [['エッチ', R.sex + '回']]), lines: lines };
  };
  HK.Kanbyo = { okText: okText, stageOf: stageOf, kStage: kStage, sickNight: sickNight, relKind: relKind, RK_NAME: RK_NAME, pickT: pickT, per: per };
  HK.SCENARIOS[ID] = scen;
  if (HK.Lewd && HK.Lewd.install) HK.Lewd.install(ID, { lenDef: 'mix', desc: HK.SAFE_BUILD ? '' : '夜の場面の描き方。ほのめかす＝ぼかした一文と翌朝だけ／ほどほど＝描写する／濃い＝果てたあと、もう一度求め合うところまで' });
})();
