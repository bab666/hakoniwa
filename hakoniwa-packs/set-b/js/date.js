/* デートの日々（追加パック set-b の 3 部屋目。日常型。両方のビルド。2026-11-03。設計は docs/reports/2026-11-03/date-design.md）
   二人が 3〜10 回のデートを重ねる日々を、デートごとに 午前・午後・夜 の3区切りで眺める。部屋の中心は「行き先」（約 50 か所。HK.DatePlaces）。
   ・行き先ごとに、めぐるスポット・出来事・トラブル・食事の文を持ち（date-places-*.js）、汎用の出来事（date-text-*.js の GEN）と混ぜる
   ・大きさ：大型 L（遊園地・おうちデート・宇宙旅行など。一日一か所だけ）／中 M（午前はここ、午後はここ と組める）／人や予算で変わる V（ショッピングなど）。
     旅行（trip）は泊まりで、夜は旅先の宿。夜の行き先（night：花火・夜景・イルミネーション・ディナー・縁日）は夜の区切りに回す
   ・デートの長さ（半日・一日・朝から夜まで）でめぐるスポットの数が変わる。移動（電車・車。遠出は飛行機・新幹線、宇宙はロケット）と道中の出来事
   ・予算（一回あたり）：行き先ごとの最低金額。予算を超えるプランは組まない。行き先を決めていないときは予算と傾向から自動（バカ高いと海外旅行や宇宙）
   ・性格で分かれる行動（計画する人）：完璧に計画する／行き当たりばったり／相手に合わせる／張り切って空回りする（態度9種・気質で選び、運命の揺らぎでらしくない方に）
   ・関係は名簿の二人の関係のまま（初対面・友人・恋人・夫婦・片想い・両片想い・元恋人・不仲・家族…）。関係ごとに導入・山場・結末が分かれる
   ・性欲が高まるとデート中にやらしい雰囲気（人目を盗んだキス＝HK.Kiss）。喧嘩（場合によってはその日のデートが途中で終わる）
   ・他の住人（登場を許可していれば、デートごとに 1 割ほど）：ばったり出くわす（恋人が嫉妬）／後日「〇〇で見たよ」。三人目の参加者は「ばったり会う側」か「ダブルデートの側」
   ・山場：最後のデートの帰り道（観覧車・駅の改札・車の中・宿・家の前）。結末：付き合い始める／初めてのお泊まり／友人に戻る／プロポーズ／今の関係のまま
   ・夜：そのまま別れる／送る／お家に寄る／泊まる／ラブホ（R18 版だけ。date-r18.js）。全年齢版は手をつなぐ・泊まって眠るまで
   部品：文の仕上げ HK.PairKit、受け止め方 HK.PairReact、他の住人 HK.PairVisit、配役 HK.PairCast（共通のかたまり kit）、暮らし HK.Life・表を引く HK.Journal（本体 pack-roomkit）、
   キス HK.Kiss、食べ物の好み HK.Food。登場人物はすべて成人として扱う */
/* @event scen=set-b-date id=dt_intro cat=bond tie=- label=二人のデートの日々が始まる */
/* @event scen=set-b-date id=dt_prep cat=solo tie=- label=半日のデートの前に身支度をする */
/* @event scen=set-b-date id=dt_meet cat=bond tie=- label=待ち合わせからデートが始まる */
/* @event scen=set-b-date id=dt_budget cat=bond tie=- label=予算や季節で行き先を変える */
/* @event scen=set-b-date id=dt_plan cat=bond tie=- label=計画した人がその日の予定を話す */
/* @event scen=set-b-date id=dt_kanpeki cat=bond tie=- label=完璧に計画したデートの一場面 */
/* @event scen=set-b-date id=dt_batari cat=bond tie=- label=行き当たりばったりのデートの一場面 */
/* @event scen=set-b-date id=dt_awase cat=bond tie=- label=相手に合わせてばかりのデートの一場面 */
/* @event scen=set-b-date id=dt_karamawari cat=bond tie=- label=張り切って空回りするデートの一場面 */
/* @event scen=set-b-date id=dt_move cat=bond tie=- label=電車や車で行き先へ向かう道中 */
/* @event scen=set-b-date id=dt_back cat=bond tie=- label=帰りの電車や車の中で過ごす */
/* @event scen=set-b-date id=dt_switch cat=bond tie=- label=午前と午後で行き先を変える */
/* @event scen=set-b-date id=dt_lunch cat=bond tie=- label=デートの途中でお昼を食べる */
/* @event scen=set-b-date id=dt_dinner cat=bond tie=- label=デートの締めくくりに夕食をとる */
/* @event scen=set-b-date id=dt_trouble cat=bond tie=- label=行き先でちょっとしたトラブルが起きる */
/* @event scen=set-b-date id=dt_heat cat=romance tie=- label=人目を盗んでこっそりキスする */
/* @event scen=set-b-date id=dt_heat_nc cat=romance tie=- label=距離が近くて相手を意識してしまう */
/* @event scen=set-b-date id=dt_fight cat=conflict tie=- label=デートの途中で喧嘩になる */
/* @event scen=set-b-date id=dt_mend cat=bond tie=- label=喧嘩してもその場で仲直りする */
/* @event scen=set-b-date id=dt_go cat=conflict tie=- label=喧嘩してその日のデートが終わる */
/* @event scen=set-b-date id=dt_sorry cat=bond tie=- label=前のデートの喧嘩を謝って仲直り */
/* @event scen=set-b-date id=dt_battari cat=bond tie=- label=他の住人とデート先で出くわす */
/* @event scen=set-b-date id=dt_jeal cat=romance tie=- label=話が盛り上がって相手が嫉妬する */
/* @event scen=set-b-date id=dt_mita cat=bond tie=- label=後日見かけたよと声をかけられる */
/* @event scen=set-b-date id=dt_c_battari cat=bond tie=- label=三人目とデート先で鉢合わせる */
/* @event scen=set-b-date id=dt_c_mita cat=romance tie=- label=三人目にデートを見られていた */
/* @event scen=set-b-date id=dt_c_ouen cat=romance tie=- label=三人目がデートを応援してくれる */
/* @event scen=set-b-date id=dt_double cat=romance tie=- label=三人目とダブルデートに出かける */
/* @event scen=set-b-date id=dt_bday cat=romance tie=- label=誕生日のデートで贈り物を渡す */
/* @event scen=set-b-date id=dt_wakare cat=bond tie=- label=デートの帰りにそのまま別れる */
/* @event scen=set-b-date id=dt_okuru cat=bond tie=- label=デートの帰りに家まで送っていく */
/* @event scen=set-b-date id=dt_ouchi cat=romance tie=- label=デートの帰りに相手の家へ寄る */
/* @event scen=set-b-date id=dt_tomari cat=romance tie=- label=デートの夜にそのまま泊まっていく */
/* @event scen=set-b-date id=dt_kaeru cat=bond tie=- label=一緒に暮らす家へ二人で帰る */
/* @event scen=set-b-date id=dt_yado cat=romance tie=- label=旅先の宿で過ごす夜 */
/* @event scen=set-b-date id=dt_kiss_part cat=romance tie=- label=別れ際に名残惜しくキスを交わす */
/* @event scen=set-b-date id=dt_climax cat=romance tie=- label=最後のデートの帰り道に本音を話す */
/* @event scen=set-b-date id=dt_koi cat=romance tie=- label=想いを告げて付き合い始める */
/* @event scen=set-b-date id=dt_propose cat=romance tie=lover label=最後のデートの帰りにプロポーズ */
/* @event scen=set-b-date id=dt_tomari_end cat=romance tie=- label=初めてのお泊まりを切り出す */
/* @event scen=set-b-date id=dt_yujin cat=bond tie=- label=友人に戻ろうと静かに話す */
/* @event scen=set-b-date id=dt_end cat=bond tie=- label=デートの日々の締めくくり */
/* @event-table scen=set-b-date path=DatePlaces.list cat=行き先 label=デートの行き先 rows=1 */
(function () {
  'use strict';
  var HK = window.HK;
  if (!HK || !HK.Life || !HK.Journal || !HK.PairKit) return;
  var ID = 'set-b-date', J = HK.Journal, LF = HK.Life, K = HK.PairKit;
  var PART = ['午前', '午後', '夜'];
  function TX() { return HK.DateText || {}; }
  function PL() { return HK.DatePlaces || { list: [], by: {} }; }
  function RC() { return HK.PairReact; }
  function f(ctx) { return ctx.dt; }
  function pickOf(ctx, arr) { return arr && arr.length ? arr[Math.floor(ctx.rng() * arr.length)] : ''; }
  function fill(ctx, t, a, b, ex) { return K.fill(ctx, t, a, b, Object.assign({ date: f(ctx) ? f(ctx).dword : 'デート' }, ex || {})); }
  function per(c) { return RC() ? RC().per(c) : 'gentle'; }
  function rcat(ctx, a, b) { var S = f(ctx); return S && S.love && (!ctx.romanceOk || ctx.romanceOk([a, b], false)) ? 'romance' : 'bond'; }

  /* ---------- 二人の関係（名簿の関係のまま） ----------
     rk：spouse 夫婦／lover 恋人／fam 家族／pfam 家族同然／ex 元恋人／almost 両片想い／crush 片想い／bad 不仲／rival ライバル／lovehate 愛憎／mentor 師弟／senpai 先輩後輩／work 同僚／
       childhood 幼なじみ／friend 友人／school 同級生／weak 知人／none 関係なし（初対面）
     grp（文の分かれ目）：love（夫婦・恋人）／pine（両片想い・片想い）／close（友人・幼なじみ・同級生）／work（同僚・先輩後輩・師弟）／fam（家族）／awk（元恋人・不仲・ライバル・愛憎）／first（初対面・知人） */
  var RK_OF = { spouse: 'spouse', lover: 'lover', fiance: 'lover', mate: 'lover', fated: 'lover', honmei: 'lover',
    parent: 'fam', sibling: 'fam', sibprot: 'fam', sibclose: 'fam', sibbad: 'fam', twin: 'fam', stepsib: 'fam', relative: 'fam', pparent: 'pfam',
    ex: 'ex', almost: 'almost', crush: 'crush', yan: 'crush', enemy: 'bad', bad: 'bad', rival: 'rival', lovehate: 'lovehate', abuse: 'bad',
    teacher: 'mentor', mentor: 'mentor', master: 'mentor', worship: 'mentor', senpai: 'senpai', colleague: 'work', boss: 'work', childhood: 'childhood',
    friend: 'friend', best: 'friend', buddy: 'friend', benefactor: 'friend', fwb: 'friend', comrade: 'friend', classmate: 'school', acq: 'weak' };
  var RK_ORD = ['spouse', 'lover', 'fam', 'pfam', 'ex', 'almost', 'crush', 'lovehate', 'bad', 'rival', 'mentor', 'senpai', 'work', 'childhood', 'friend', 'school', 'weak'];
  var RK_GRP = { spouse: 'love', lover: 'love', almost: 'pine', crush: 'pine', friend: 'close', childhood: 'close', school: 'close', work: 'work', senpai: 'work', mentor: 'work', fam: 'fam', pfam: 'fam', ex: 'awk', bad: 'awk', rival: 'awk', lovehate: 'awk', weak: 'first', none: 'first' };
  var FEUD_RK = /^(bad|rival|lovehate|ex)$/;
  var RK_NAME = { spouse: '夫婦', lover: '恋人', fam: '家族', pfam: '家族同然', ex: '元恋人', almost: '両片想い', crush: '片想い', bad: '不仲', rival: 'ライバル', lovehate: '愛憎', mentor: '師弟', senpai: '先輩と後輩', work: '同僚', childhood: '幼なじみ', friend: '友人', school: '同級生', weak: '知り合い', none: '初対面' };
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
  /* 向きのある関係（片想い：想う側、先輩後輩：先輩、師弟：師）が A なら 'A'、B なら 'B' を付けた鍵 */
  function relDir(ctx, A, B, rk) {
    var tl = HK.Ties && HK.Ties.all ? HK.Ties.all(ctx, A, B) || [] : [], ty = { crush: /^(crush|yan)$/, senpai: /^senpai$/, mentor: /^(teacher|mentor)$/ }[rk];
    if (!ty) return '';
    var t = tl.filter(function (x) { return x && ty.test(x.type); })[0];
    if (!t || t.a == null) return '';
    return rk + (t.a === A.i ? 'A' : t.a === B.i ? 'B' : '');
  }
  function canLove2(ctx, a, b) {
    if (HK.canLove && !(HK.canLove(a, b, ctx) && HK.canLove(b, a, ctx))) return false;
    if (HK.tieLoveNoPair && (HK.tieLoveNoPair(ctx, a, b) || HK.tieLoveNoPair(ctx, b, a))) return false;
    if (HK.Ties && HK.Ties.apathy && (HK.Ties.apathy(ctx, a, b) || HK.Ties.apathy(ctx, b, a))) return false;
    if (ctx.pair && ctx.pair(a, b).kin) return false;
    return true;
  }

  /* ---------- 文の絞り込み ---------- */
  /* 恋愛にならない二人に出さない文（K.ROM から「デート」「好き」を除き、デートの場面の語を足した。「デート」の語は {date} で、恋愛にならない二人には「お出かけ」になる） */
  var DROM = /キス|いちゃ|嫉妬|ヤキモチ|やきもち|甘え|抱き|膝枕|愛し|恋(?!人)|寄り添|独り占め|添い寝|一緒に寝|ぎゅっ|ムラムラ|エッチ|色っぽ|ときめ|胸が高鳴|手を繋|手をつな|指を絡|恋人つなぎ|見とれ|見惚れ|カップル|夫婦と間違/;
  var COUPLE_RE = /(?<!元)恋人|付き合って(?:いる|る)|彼氏|彼女/;
  var WED = K.WED;
  /* 季節の語（その月に合わない文は使わない） */
  var SEA_RE = [
    { re: /桜|花見|春の|春らし|新緑/, m: [3, 4, 5] },
    { re: /海水浴|花火|かき氷|蝉|セミの|夏の|夏らし|日焼け|麦わら|入道雲|夕立/, m: [6, 7, 8, 9] },
    { re: /紅葉|秋の|秋らし|焼き芋|落ち葉|銀杏|いちょう/, m: [9, 10, 11] },
    { re: /雪|冬の|冬らし|マフラー|手袋|息が白|吐く息が白|こたつ|イルミネーション|クリスマス|かじかん/, m: [11, 12, 1, 2, 3] }
  ];
  function seaOk(S, t) { var m = S && S.day ? S.day.P.month : S && S.m0 || 0; if (!m) return true; for (var i = 0; i < SEA_RE.length; i++) if (SEA_RE[i].re.test(t) && SEA_RE[i].m.indexOf(m) < 0) return false; return true; }
  function okText(ctx, x, a, b, o) {
    var S = f(ctx);
    if (typeof x !== 'string') return false;
    if (S && !S.love && DROM.test(x)) return false;
    if (S && !S.couple && COUPLE_RE.test(x.replace(/「[^」]*」/g, '').replace(/\{c\}の恋人/g, ''))) return false;
    if (S && S.rk !== 'spouse' && !(o && o.wed) && WED.test(x)) return false;
    if (S && !seaOk(S, x)) return false;
    /* 一緒に暮らしている二人に、別々の家に帰る前提の文を出さない（暮らしていない二人に、同じ家に帰る文を出さない） */
    if (S && S.cohab && /家まで送|それぞれの家|別々の家|上がっていく|家の前で別れ|自分の部屋へ帰|駅で別れ|\{[ab]\}の(?:家|部屋)|住む町/.test(x)) return false;
    if (S && !S.cohab && /二人の家|同じ家に帰|一緒に暮らす|うちに帰ろう/.test(x)) return false;
    if (!K.choreOk(x, a, b)) return false;
    return true;
  }
  function cands(ctx, arr, a, b, o) {
    var p = (arr || []).filter(function (x) { return okText(ctx, x, a, b, o); });
    if (HK.relFilter && a && b && p.length) { var r = HK.relFilter(ctx, p, a, b); if (r && r.length) p = r; else p = []; }
    return p;
  }
  /* 一回の遊びで同じ文を二度出さない（rep＝使い切ったら使った文から選んでよい） */
  function pickT(ctx, arr, a, b, rep, o) {
    var p = cands(ctx, arr, a, b, o);
    if (!p.length) return '';
    var U = f(ctx).used, q = p.filter(function (x) { return !U[x]; });
    if (!q.length && !rep) return '';
    var t = pickOf(ctx, q.length ? q : p);
    U[t] = 1;
    return t;
  }
  function relList(T, S) { if (!T) return []; return (S.rkKey && T[S.rkKey] || []).concat(T[S.rk] || [], S.feud && T.feud || [], T[S.grp] || [], T.all || []); }
  function relPick(ctx, T, a, b, rep, o) {
    var S = f(ctx), own = T ? (S.rkKey && T[S.rkKey] ? T[S.rkKey] : []).concat(T[S.rk] || [], S.feud && T.feud || [], T[S.grp] || []) : [];
    return pickT(ctx, own, a, b, false, o) || pickT(ctx, T && T.all, a, b, false, o) || (rep ? pickT(ctx, own.concat(T && T.all || []), a, b, true, o) : '');
  }
  function attPick(ctx, T, c, a, b, rep, o) { T = T || {}; return pickT(ctx, T[per(c)] || T.gentle, a, b, false, o) || (rep ? pickT(ctx, (T[per(c)] || []).concat(T.gentle || []), a, b, true, o) : ''); }

  /* ---------- 行き先 ---------- */
  var BUDGET = [3000, 10000, 30000, 100000, 1000000, 100000000];
  function yen(v) {
    if (v >= 100000000) return (v / 100000000) + '億円';
    if (v >= 10000) { var m = Math.floor(v / 10000), r = Math.round((v % 10000) / 1000); return m + '万' + (r ? r + '千' : '') + '円'; }
    return String(v).replace(/\B(?=(\d{3})+(?!\d))/g, ',') + '円';
  }
  function has(d, fl) { return (' ' + (d.flags || '') + ' ').indexOf(' ' + fl + ' ') >= 0; }
  function seasonOk(d, m) { return !d.sea || d.sea.split(',').map(Number).indexOf(m) >= 0; }
  /* 予算（一回あたり・二人で）。おまかせ：二人の関係と気質から、デートごとに少し揺れる */
  function budgetOf(ctx, S, k) {
    var v = +ctx.env.budget;
    if (v > 0) return v;
    var W = S.grp === 'love' ? [[3000, 0.12], [10000, 0.38], [30000, 0.33], [100000, 0.14], [1000000, 0.03]] : S.grp === 'first' ? [[3000, 0.25], [10000, 0.5], [30000, 0.22], [100000, 0.03]] : [[3000, 0.2], [10000, 0.45], [30000, 0.27], [100000, 0.08]];
    return HK.weighted(ctx.rng, W, function (x) { return x[1]; })[0];
  }
  var LEN_N = { half: [1, 2], day: [2, 3], long: [3, 4] };
  var LEN_NAME = { half: '半日（午後から）', day: '一日', long: '朝から夜まで' };
  function lenOf(ctx, k) { var v = ctx.env.len; if (/^(half|day|long)$/.test(v)) return v; return HK.weighted(ctx.rng, [['half', 0.22], ['day', 0.5], ['long', 0.28]], function (x) { return x[1]; })[0]; }
  /* 行き先の重み */
  function destW(ctx, S, d, bud, len, mon, used) {
    if (d.cost > bud || !seasonOk(d, mon)) return 0;
    if (len === 'half' && (d.trip || (d.size === 'L' && d.id !== 'ouchi'))) return 0;
    var w = 1, tr = ctx.env.trend;
    if (tr && tr !== 'auto') w *= d.kind === tr ? 5 : 0.6;
    if (used[d.id]) w *= 0.04;
    /* 予算に見合う行き先を（予算が大きいほど高い行き先に寄る） */
    if (bud >= 1000000) w *= d.cost >= 100000 ? 6 : d.cost >= 30000 ? 2 : 0.6;
    else if (bud >= 100000) w *= d.cost >= 30000 ? 2.2 : 1;
    if (bud >= 100000000 && !S.lux && (d.id === 'uchu' || d.id === 'kaigai')) w *= d.id === 'uchu' ? 40 : 25;
    /* 関係：初対面・気まずい二人は泊まりの旅行・おうちデートを避ける。家族はおうちデートを避ける（いつも一緒にいる） */
    if (d.trip && /^(first|awk)$/.test(S.grp)) w *= 0.12;
    if (d.trip && S.k0 != null && S.k0 === 0 && S.grp !== 'love') w *= 0.3;
    if (d.id === 'ouchi') w *= S.grp === 'first' ? 0.1 : S.grp === 'fam' ? 0.3 : S.cohab ? 1.2 : S.grp === 'love' ? 1 : 0.5;
    if (has(d, 'night') && len === 'half') w *= 0.7;
    return w;
  }
  /* 一回のデートのプラン：slots＝[{ p: 'am'|'pm'|'ev', d: 行き先, n: スポットの数 }] */
  function planDate(ctx, S, k, used) {
    var env = ctx.env, P = PL(), list = P.list, bud = budgetOf(ctx, S, k), len = lenOf(ctx, k), mon = monthOf(S, k);
    var plan = { k: k, bud: bud, len: len, month: mon, slots: [], cost: 0 };
    var nn = LEN_N[len], K0 = nn[0] + (ctx.rng() < 0.5 ? 1 : 0);
    var main = null;
    if (k === S.forcedAt && S.forced) {
      if (S.forced.cost <= bud && seasonOk(S.forced, mon) && !(len === 'half' && (S.forced.trip || (S.forced.size === 'L' && S.forced.id !== 'ouchi')))) main = S.forced;
      else plan.miss = { d: S.forced, why: S.forced.cost > bud ? 'budget' : !seasonOk(S.forced, mon) ? 'season' : 'len' };
    }
    S.k0 = k;
    if (!main) main = HK.weighted(ctx.rng, list, function (d) { return destW(ctx, S, d, bud, len, mon, used); });
    if (!main || destW(ctx, S, main, bud, len, mon, {}) <= 0 && main !== S.forced) main = P.by.jinja || list[0];
    if (main.id === 'uchu' || main.id === 'kaigai') S.lux = true;
    plan.main = main;
    var vLong = main.size === 'V' && (bud >= 30000 || shopper(S.A) || shopper(S.B));
    plan.vLong = vLong;
    var big = main.size === 'L' || vLong || main.trip;
    if (len === 'half') {
      if (has(main, 'night')) plan.slots.push({ p: 'ev', d: main, n: Math.max(1, K0) });
      else plan.slots.push({ p: 'pm', d: main, n: K0 });
    } else if (big) {
      var tot = K0 + 1, am = Math.ceil(tot / 2);
      if (has(main, 'night')) { plan.slots.push({ p: 'am', d: main, n: Math.max(1, am - 1) }, { p: 'pm', d: main, n: Math.max(1, tot - am) }, { p: 'ev', d: main, n: 1 }); }
      else plan.slots.push({ p: 'am', d: main, n: am }, { p: 'pm', d: main, n: Math.max(1, tot - am) });
    } else {
      /* 中の行き先：午前はここ、午後はここ（予算の残りで二つ目を選ぶ） */
      var rest = bud - main.cost, second = null;
      if (ctx.rng() < 0.85) second = HK.weighted(ctx.rng, list, function (d) { if (d === main || d.size === 'L' || d.trip || (d.size === 'V' && vLong)) return 0; if (has(main, 'night') && has(d, 'night')) return 0; return destW(ctx, S, d, rest, 'day', mon, used); });
      if (second && destW(ctx, S, second, rest, 'day', mon, {}) <= 0) second = null;
      var n1 = Math.ceil(K0 / 2), n2 = Math.max(1, K0 - n1);
      if (has(main, 'night')) {
        if (second) plan.slots.push({ p: 'am', d: second, n: n1 }, { p: 'pm', d: second, n: n2 }, { p: 'ev', d: main, n: 1 });
        else plan.slots.push({ p: 'pm', d: main, n: 1 }, { p: 'ev', d: main, n: 1 });
      } else if (second && has(second, 'night')) plan.slots.push({ p: 'am', d: main, n: n1 }, { p: 'pm', d: main, n: n2 }, { p: 'ev', d: second, n: 1 });
      else if (second) plan.slots.push({ p: 'am', d: main, n: n1 }, { p: 'pm', d: second, n: n2 });
      else plan.slots.push({ p: 'am', d: main, n: n1 }, { p: 'pm', d: main, n: n2 });
    }
    var seen = {};
    plan.slots.forEach(function (sl) { if (!seen[sl.d.id]) { seen[sl.d.id] = 1; plan.cost += sl.d.cost; used[sl.d.id] = 1; } });
    plan.trip = !!main.trip;
    plan.home = main.id === 'ouchi';
    return plan;
  }
  function shopper(c) { var t = c && c.tr || {}; return (t.impulse || 0.4) > 0.68; }
  function monthOf(S, k) { var dd = S.sday + k * S.gap; return ((S.m0 - 1 + Math.floor(dd / 30)) % 12) + 1; }

  /* ---------- 計画する人と、性格で分かれる行動 ---------- */
  var BEH_NAME = { kanpeki: '完璧に計画する', batari: '行き当たりばったり', awase: '相手に合わせる', karamawari: '張り切って空回りする' };
  var BEH_FIT = { stern: 'kanpeki', polite: 'kanpeki', cool: 'kanpeki', free: 'batari', devoted: 'awase', gentle: 'awase', shy: 'awase', proud: 'karamawari', tsun: 'karamawari' };
  var BEH_ODD = { kanpeki: 'batari', batari: 'kanpeki', awase: 'karamawari', karamawari: 'awase' };
  function pickOfChar(ctx, c, k) { var p = ctx.input && ctx.input.perChar && ctx.input.perChar[c.i]; return p && p.pick ? p.pick[k] : null; }
  function behOf(ctx, c) {
    var fix = pickOfChar(ctx, c, 'style');
    if (fix && BEH_NAME[fix]) return { k: fix, odd: false };
    var t = c.tr || {}, base = BEH_FIT[per(c)] || 'awase';
    var kp = (t.cp || 0.5) * 0.6 + (t.a != null ? t.a : 0.5) * 0.4, bt = (t.impulse || 0.4) * 0.7 + (1 - (t.cp || 0.5)) * 0.3, aw = (t.ac || 0.5) * 0.6 + (t.np || 0.5) * 0.3, km = (LF.clumsy(c) ? 0.5 : 0) + (t.fc || 0.5) * 0.4 + (1 - (t.a != null ? t.a : 0.5)) * 0.3;
    var sc = { kanpeki: kp, batari: bt, awase: aw, karamawari: km }, best = base, bv = sc[base] + 0.12;
    Object.keys(sc).forEach(function (k) { if (sc[k] > bv + 0.08) { best = k; bv = sc[k]; } });
    var odd = RC() && ctx.rng() < RC().pOdd(ctx);
    return { k: odd ? BEH_ODD[best] : best, odd: !!odd };
  }
  function plannerOf(ctx, S, k) {
    var v = ctx.env.planner, A = S.A, B = S.B;
    if (v === 'a') return A;
    if (v === 'b') return B;
    if (v === 'alt') return k % 2 ? B : A;
    var sa = (A.tr.cp || 0.5) + (A.tr.fc || 0.5) * 0.5, sb = (B.tr.cp || 0.5) + (B.tr.fc || 0.5) * 0.5;
    /* 片想い・誘った側が最初の計画を立てやすい */
    if (k === 0 && S.inviter) return S.inviter;
    return ctx.rng() < sa / (sa + sb) ? A : B;
  }
  /* 運転：住人ごとの設定（運転する／しない）。おまかせは、どちらでも */
  function canDrive(ctx, c) { var v = pickOfChar(ctx, c, 'drive'); return v !== 'no'; }
  function moveOf(ctx, S, plan) {
    var D = plan.main, v = ctx.env.move;
    if (D.far === 'plane' || D.far === 'shinkansen' || D.far === 'rocket') return D.far;
    if (plan.home) return S.cohab ? 'none' : 'visit';
    var dA = canDrive(ctx, S.A), dB = canDrive(ctx, S.B);
    if (v === 'car' && (dA || dB)) return 'car';
    if (v === 'train') return 'train';
    var pc = (S.cohab ? 0.45 : 0.28) + (D.kind === 'nature' ? 0.25 : 0) + (D.trip ? 0.15 : 0);
    var drv = [pickOfChar(ctx, S.A, 'drive'), pickOfChar(ctx, S.B, 'drive')];
    if (drv.indexOf('yes') >= 0) pc += 0.2;
    return (dA || dB) && ctx.rng() < pc ? 'car' : 'train';
  }
  function driverOf(ctx, S, plan) {
    var A = S.A, B = S.B, ya = pickOfChar(ctx, A, 'drive') === 'yes', yb = pickOfChar(ctx, B, 'drive') === 'yes';
    if (!canDrive(ctx, A)) return B;
    if (!canDrive(ctx, B)) return A;
    if (ya !== yb) return ya ? A : B;
    return plan.planner || A;
  }
  var MOVE_NAME = { train: '電車', car: '車', plane: '飛行機', shinkansen: '新幹線', rocket: 'ロケット', visit: '電車（相手の家へ）', none: '移動なし' };

  /* ---------- 配役 ---------- */
  function partOf(input, i) { var p = input && input.perChar && input.perChar[i]; return p && p.pick ? p.pick.part : null; }
  function couple(C, input) {
    var ok = C.filter(function (c) { return partOf(input, c.i) === 'pair'; }).slice(0, 2);
    C.forEach(function (c) { if (ok.length < 2 && ok.indexOf(c) < 0 && !/^(guest|double)$/.test(partOf(input, c.i) || '')) ok.push(c); });
    C.forEach(function (c) { if (ok.length < 2 && ok.indexOf(c) < 0) ok.push(c); });
    return ok.slice(0, 2);
  }

  /* ---------- 箱庭 ---------- */
  var scen = {
    id: ID, name: 'デートの日々', kicker: 'ふたり・デート',
    desc: '二人が何度かのデートを重ねる日々を、デートごとに午前・午後・夜で眺める。遊園地・水族館・おうちデート・京都・北海道・宇宙旅行まで、行き先は五十か所ほど。行き先ごとにめぐる場所も、起きることも、食べるものも変わる。完璧な計画、行き当たりばったり、張り切りすぎの空回り――二人の性格と関係で、同じ遊園地でも毎回違う一日になる。最後のデートの帰り道に、二人の関係が少し動く。',
    note: '※参加は3人まで。二人の関係は、住人の関係の設定のまま使います（初対面・友人・恋人・夫婦・片想い・家族なども遊べます。恋愛にならない関係では「お出かけ」になり、恋愛の結末は出ません）。三人目は「ばったり会う側」か「ダブルデートの側」です。登場人物はすべて成人として扱います。',
    unit: '回', perUnit: 3, preRel: 0, lethal: false, minCast: 2, maxCast: 3,
    catBias: { romance: 1.2, bond: 1.2, help: 1, conflict: 0.3, combat: 0, betray: 0, kill: 0 },
    decay: 0.998, actRate: 0.06,
    derived: ['warmth', 'honesty', 'jealous', 'impulse'],
    env: [
      { id: 'count', label: 'デートの回数', min: 3, max: 10, def: 5, lo: '3回', hi: '10回', unit: '回', desc: 'デートを重ねる回数。1回は午前・午後・夜の3区切り。最後のデートの帰り道が山場になる' },
      { id: 'len', label: 'デートの長さ', type: 'select', def: 'auto', options: [{ v: 'auto', label: 'おまかせ（デートごとに変わる）' }, { v: 'half', label: '半日（午後から。めぐる場所は1〜2か所）' }, { v: 'day', label: '一日（2〜3か所）' }, { v: 'long', label: '朝から夜まで（3〜4か所）' }],
        desc: '長いほど、一日にめぐるスポットの数が増える。遊園地・おうちデート・旅行のような大型の行き先は、一日一か所だけ（その中でめぐる場所が増える）。半日のデートでは、大型の行き先と旅行は選ばれない' },
      { id: 'trend', label: '行き先の傾向', type: 'select', def: 'auto', options: [{ v: 'auto', label: 'おまかせ（予算と季節から）' }, { v: 'fun', label: '遊園地・遊ぶ場所' }, { v: 'sea', label: '水族館・海' }, { v: 'movie', label: '映画・観劇・ライブ' }, { v: 'shop', label: '買い物・街歩き' }, { v: 'home', label: 'おうちデート' }, { v: 'food', label: '食べ歩き・グルメ' }, { v: 'nature', label: '自然・アウトドア' }, { v: 'culture', label: '美術館・名所めぐり' }, { v: 'trip', label: '旅行（泊まり）' }],
        desc: '選んだ傾向の行き先が出やすくなる（予算や季節に合わないときは、ほかの行き先も出る）' },
      { id: 'dest', label: '必ず行く行き先', type: 'select', def: 'auto', options: [{ v: 'auto', label: 'おまかせ（決めない）' }],
        desc: 'デートのうち一回は、ここに行く（予算・季節・長さに合わないときは、行けなかったことが文に出て、別の行き先になる）。かっこの中は、二人で行くときの最低金額' },
      { id: 'budget', label: '予算（一回・二人で）', type: 'select', def: 'auto', options: [{ v: 'auto', label: 'おまかせ（二人の関係から。デートごとに変わる）' }, { v: '3000', label: '3千円（節約）' }, { v: '10000', label: '1万円' }, { v: '30000', label: '3万円' }, { v: '100000', label: '10万円（ちょっと贅沢）' }, { v: '1000000', label: '100万円（旅行も）' }, { v: '100000000', label: '1億円（海外や宇宙も）' }],
        desc: '行き先ごとに最低金額があり、予算を超える行き先には行かない。行き先を決めていないとき、予算が大きいほど高い行き先に寄る（1億円なら海外旅行や宇宙旅行も）' },
      { id: 'move', label: '移動', type: 'select', def: 'auto', options: [{ v: 'auto', label: 'おまかせ（行き先と二人から）' }, { v: 'train', label: '電車' }, { v: 'car', label: '車' }],
        desc: '道中の出来事が変わる（電車：乗り換え・混雑・肩にもたれて眠る／車：運転と助手席・渋滞・音楽）。遠くへの旅行は飛行機か新幹線、宇宙はロケット。運転する人は住人ごとの「運転」で選べる' },
      { id: 'planner', label: 'どちらが計画するか', type: 'select', def: 'auto', options: [{ v: 'auto', label: 'おまかせ（性格から。デートごとに）' }, { v: 'a', label: '一人目' }, { v: 'b', label: '二人目' }, { v: 'alt', label: '交代で' }],
        desc: '計画する人の性格で、その日の運び方（完璧に計画する／行き当たりばったり／相手に合わせる／張り切って空回りする）が変わる。住人ごとの「計画の仕方」で決めておくこともできる' },
      { id: 'month', label: '季節（最初のデートの月）', type: 'select', def: 'auto', options: [{ v: 'auto', label: 'おまかせ' }].concat([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(function (m) { return { v: String(m), label: m + '月' }; })),
        desc: 'デートは一〜二週間おき。季節に合う行き先（花見・海水浴・花火・紅葉・スキー・イルミネーションなど）が出る。住人の誕生月に当たるデートは、誕生日のデートになる' },
      { id: 'outsideNames', label: '登場しない住人を出す', type: 'select', def: 'yes', options: [{ v: 'yes', label: '出す（名簿の住人のうち、二人と関係のある人が、デート先でばったり・後日の噂で登場する）' }, { v: 'no', label: '出さない（二人と、参加者だけ）' }],
        desc: '名簿にいて今回は参加していない住人のうち、二人のどちらかと関係（家族・友人・同僚・先輩後輩・同級生・元恋人・知人）がある人（三人まで）が、デートごとに1割ほど、行き先でばったり出くわしたり、後日「〇〇で見たよ」と声をかけてきたりします。関係図には出ず、その人との恋愛も始まりません' }
    ],
    stats: [],
    perFields: [
      { id: 'part', label: '立場', auto: 'おまかせ（上の二人がデートする二人。三人目は関係から）', options: [{ id: 'pair', label: 'デートする二人' }, { id: 'guest', label: 'ばったり会う側（三人目）' }, { id: 'double', label: 'ダブルデートの側（三人目）' }] },
      { id: 'style', label: '計画の仕方', auto: 'おまかせ（性格から）', options: [{ id: 'kanpeki', label: '完璧に計画する' }, { id: 'batari', label: '行き当たりばったり' }, { id: 'awase', label: '相手に合わせる' }, { id: 'karamawari', label: '張り切って空回りする' }] },
      { id: 'drive', label: '運転', auto: 'おまかせ', options: [{ id: 'yes', label: '運転する（車のときはこの人が運転）' }, { id: 'no', label: '運転しない' }] },
      { id: 'role', label: '家事の得意さ', auto: 'おまかせ（気質から）', options: LF.ROLE.map(function (r) { return { id: r.v, label: r.label }; }) }
    ],
    actions: [{ id: 'live', label: 'いつもどおりに過ごす', fit: function () { return 0.5; } }],
    goals: [{ id: 'dt', label: '性格から決める', fit: function () { return 0.5; } }],
    stepGroup: function (label) { var m = /^(DAY\d+（.）)(.+)$/.exec(label); return m ? { group: m[1], sub: m[2] } : null; },
    steps: function (env) {
      var n = Math.max(3, Math.min(10, +env.count || 5)), s = [];
      for (var d = 0; d < n; d++) for (var t = 0; t < 3; t++) s.push('DAY' + (d + 1) + '（' + (d % 2 ? '日' : '土') + '）' + PART[t]);
      return s;
    },
    othersFor: function (ctx, a) { var S = ctx.dt; return ctx.present().filter(function (c) { return c !== a && (!S || ((a === S.A || a === S.B) && (c === S.A || c === S.B))); }); },
    setup: function (ctx) { setup(ctx); },
    phase: function (ctx, s, n) { phase(ctx, s, n); },
    finish: function (ctx) { finish(ctx); },
    events: []
  };
  if (!HK.SAFE_BUILD) scen.env.push({ id: 'lewdN', label: 'エッチの回数（R18）', type: 'select', def: 'mid', options: [{ v: 'none', label: 'なし' }, { v: 'low', label: '1回まで' }, { v: 'mid', label: '3回まで' }, { v: 'high', label: '多め（5回まで・一度は長い場面）' }],
    desc: 'デートの夜（お家・泊まり・ラブホ・旅先の宿・車の中）のエッチの場面の回数の上限（体の関係にしてよい二人だけ）。性欲が強いほど、デートの途中でもやらしい雰囲気になりやすい。多めなら、最後のエッチは段落を分けた長い場面になる（描写の長さが「数行で短く」のときを除く）' });
  /* 行き先の選択肢（最低金額つき）は、行き先の表を読み終えてから足す（date-places-*.js は先に読まれる） */
  (function () {
    var o = scen.env.filter(function (e) { return e.id === 'dest'; })[0];
    PL().list.forEach(function (d) { o.options.push({ v: d.id, label: d.name + '（' + yen(d.cost) + '〜' + (d.size === 'L' ? '・大型' : d.size === 'V' ? '・人や予算で長さが変わる' : '') + (d.trip ? '・泊まり' : '') + '）' }); });
  })();
  /* 本体の共通の出来事から外すもの：体の関係の出来事・合意のない展開・三人以上の恋愛・告白（結末で扱う）など */
  var EX_ID = /^(?:confess|take_charge|brood|lighten|mob_after|tie_spouse|grp_|poly_|ct_|cf_)/;
  function exList() { return (HK.COMMON || []).filter(function (e) { return e.sex || e.force || EX_ID.test(e.id); }).map(function (e) { return e.id; }); }
  Object.defineProperty(scen, 'exclude', { get: exList, enumerable: true, configurable: true });

  /* ---------- 始まり ---------- */
  function setup(ctx) {
    var C = ctx.chars, cp = couple(C, ctx.input), A = cp[0], B = cp[1] || cp[0], env = ctx.env;
    var n = Math.max(3, Math.min(10, +env.count || 5));
    [A, B].forEach(function (c) {
      c.life = { job: '' };
      LF.role(ctx, c, pickOfChar(ctx, c, 'role'));
      LF.work(ctx, c, null);
    });
    var rk = relKind(ctx, A, B);
    var S = ctx.dt = { n: n, A: A, B: B, G: C.filter(function (c) { return c !== A && c !== B; }), rk: rk, grp: RK_GRP[rk], used: {}, sex: 0, lewdMax: 0, longN: 0,
      love: canLove2(ctx, A, B) && !/^(fam|pfam)$/.test(rk), couple: /^(spouse|lover)$/.test(rk), fights: 0, kaeru: 0, good: 0, kissN: 0, heatN: 0, visits: 0, odd: 0, behs: {}, branches: {}, entries: {}, forms: {}, cnt: {} };
    if (S.love && ctx.romanceOk && !ctx.romanceOk([A, B], false)) S.love = false;
    S.pine = S.love && /^(almost|crush)$/.test(rk);
    S.rkKey = relDir(ctx, A, B, rk);
    S.feud = FEUD_RK.test(rk);
    S.dword = S.love ? 'デート' : 'お出かけ';
    /* 一緒に暮らしているか：夫婦はいつも、家族は半々、恋人はときどき（同棲） */
    S.cohab = rk === 'spouse' || (/^(fam|pfam)$/.test(rk) && ctx.rng() < 0.5) || (rk === 'lover' && ctx.rng() < 0.25);
    /* 三人目：参加者（立場で選べる。おまかせは、二人のどちらかと恋愛の関係があればばったり会う側、なければダブルデートの側）と、名簿から来た住人（outside） */
    S.G.forEach(function (g) { g.gone = true; g.life = g.life || { job: '' }; if (pickOfChar(ctx, g, 'outside')) g.outside = true; });
    var c3 = S.G.filter(function (g) { return !g.outside; })[0] || null;
    if (c3) {
      var pr = partOf(ctx.input, c3.i), loveTie = (HK.Ties && HK.Ties.all ? (HK.Ties.all(ctx, c3, A) || []).concat(HK.Ties.all(ctx, c3, B) || []) : []).some(function (t) { return /^(lover|spouse|crush|yan|almost|ex|fiance|mate|honmei)$/.test(t.type); });
      /* ダブルデートは、恋愛にしてよい二人のときだけ（家族などの二人では、ばったり会う側になる） */
      S.c3 = c3; S.c3role = !S.love ? 'guest' : pr === 'double' && !loveTie ? 'double' : pr === 'guest' || loveTie ? 'guest' : 'double';
      S.c3crush = (HK.Ties && HK.Ties.all ? (HK.Ties.all(ctx, c3, A) || []).concat(HK.Ties.all(ctx, c3, B) || []) : []).some(function (t) { return /^(crush|yan|almost)$/.test(t.type) && t.a === c3.i; });
      S.c3date = 1 + Math.floor(ctx.rng() * Math.max(1, n - 2));
      S.dbl = {}; if (S.c3role === 'double') { S.dbl[S.c3date] = 1; if (n >= 6) S.dbl[Math.min(n - 2, S.c3date + 2)] = 1; }
    }
    /* 誘った人（最初のデートを言い出した人）：片想いは想う側、ほかは気質（行動力・外向き）から */
    var tl = HK.Ties && HK.Ties.all ? HK.Ties.all(ctx, A, B) || [] : [], cr = tl.filter(function (t) { return /^(crush|yan)$/.test(t.type); })[0];
    S.inviter = cr && cr.a === B.i ? B : cr && cr.a === A.i ? A : ((A.tr.fc || 0.5) + (A.tr.np || 0.5) * 0.3 >= (B.tr.fc || 0.5) + (B.tr.np || 0.5) * 0.3 ? A : B);
    /* 季節：最初のデートの月と、デートの間隔（一〜二週間） */
    S.m0 = /^\d+$/.test(env.month) ? +env.month : 1 + Math.floor(ctx.rng() * 12);
    S.sday = Math.floor(ctx.rng() * 20); S.gap = n >= 7 ? 7 : ctx.rng() < 0.5 ? 7 : 14;
    S.forced = env.dest && env.dest !== 'auto' ? PL().by[env.dest] || null : null;
    S.forcedAt = S.forced ? Math.floor(ctx.rng() * n) : -1;
    /* プラン（デートごと） */
    var used = {};
    S.plans = [];
    for (var k = 0; k < n; k++) {
      var P = planDate(ctx, S, k, used);
      P.planner = plannerOf(ctx, S, k);
      P.beh = behOf(ctx, P.planner);
      P.mode = moveOf(ctx, S, P);
      if (P.mode === 'car') P.driver = driverOf(ctx, S, P);
      S.plans.push(P);
    }
    /* 誕生日：住人の誕生月に当たる最初のデート（一人一回） */
    [A, B].forEach(function (c) {
      var bm = +c.bmonth; if (!bm) return;
      for (var i = 0; i < n; i++) if (S.plans[i].month === bm && !S.plans[i].bday) { S.plans[i].bday = c; break; }
    });
    if (!HK.SAFE_ON && HK.DateR18 && HK.DateR18.quota) S.lewdMax = HK.DateR18.quota(ctx, env.lewdN);
    S.heat = HK.Pos && HK.Pos.libMul ? Math.min(2, HK.Pos.libMul([A, B])) : 1;
    ctx.place = 'デートの行き先';
    /* 導入：関係ごとの、デートを重ねることになったわけ */
    var Tx = TX(), inv = S.inviter, oth = inv === A ? B : A;
    var it = relPick(ctx, Tx.INTRO, inv, oth, true) || '{a}は{b}を{date}に誘った。二人のお出かけの日々が始まった。';
    var tx = fill(ctx, it, inv, oth, { n: S.n + '回' });
    ctx.act2({ actors: [inv, oth], cat: 'bond', text: tx, why: 'デートの日々：始まり（' + RK_NAME[rk] + '・' + inv.name + 'から誘った・' + S.n + '回）' });
    S.cnt = {};
  }

  /* ---------- 区切り ---------- */
  var REST_RATE = 1e-9;
  function phase(ctx, s) {
    var S = f(ctx), A = S.A, B = S.B, d = Math.floor(s / 3), t = s % 3;
    if (A === B) return;
    if (s === 0) { ctx.mod2(A, B, { aff: 4, trust: 2 }, { aff: 4, trust: 2 }); S.rel0 = {}; S.rel0[A.i] = ctx.rel[A.i][B.i].aff + ctx.rel[A.i][B.i].att; S.rel0[B.i] = ctx.rel[B.i][A.i].aff + ctx.rel[B.i][A.i].att; }
    scen.actRate = S.day && S.day.d === d && S.day.over ? REST_RATE : 0.06;
    if (t === 0) S.day = { d: d, P: S.plans[d], over: false, spots: {}, ev: 0, gen: 0, trouble: 0, kiss: 0, fight: false, fightP: 0, visited: false, beh: false, last: d === S.n - 1, cur: null };
    var day = S.day;
    if (day.over) return;
    if (t === 0) morning(ctx, day);
    else if (t === 1) afternoon(ctx, day);
    else evening(ctx, day);
  }
  function placeName(D) { return D ? D.name : 'デートの行き先'; }
  /* その日の最初・最後の行き先（待ち合わせ・計画・行きの道中は最初、帰りは最後） */
  function firstD(P) { return P.slots.length ? P.slots[0].d : P.main; }
  function lastD(P) { return P.slots.length ? P.slots[P.slots.length - 1].d : P.main; }
  function slotOf(P, p) { return P.slots.filter(function (x) { return x.p === p; })[0] || null; }
  /* 文の {a}（その場面を引っ張る人）：計画した人か、相手 */
  function lead2(ctx, day) { var S = f(ctx), pl = day.P.planner || S.A; return ctx.rng() < 0.55 ? [pl, pl === S.A ? S.B : S.A] : [pl === S.A ? S.B : S.A, pl]; }

  function morning(ctx, day) {
    var S = f(ctx), A = S.A, B = S.B, P = day.P, Tx = TX();
    /* 前のデートを喧嘩で切り上げた：謝って仲直り（謝るのは、帰った人か、言い過ぎた人） */
    if (S.sorry) sorry(ctx, day);
    if (S.mita) mitaLater(ctx, day);
    if (S.c3 && S.c3role === 'guest' && S.c3mita && S.c3mita === day.d) c3Mita(ctx, day);
    if (S.c3 && day.d === Math.max(0, (S.c3role === 'double' ? S.c3date : S.c3date) - 1) && !S.c3ouen && ctx.rng() < 0.6) c3Ouen(ctx, day);
    if (P.miss) missLine(ctx, day);
    if (P.len === 'half') { prep(ctx, day); return; }
    meet(ctx, day);
    planLine(ctx, day);
    move(ctx, day, 'go');
    if (S.dbl && S.dbl[day.d]) doubleDate(ctx, day, 'start');
    visit(ctx, day, 'am');
    if (ctx.rng() < 0.3) gen(ctx, day);
  }
  function afternoon(ctx, day) {
    var S = f(ctx), P = day.P;
    if (P.len === 'half') { meet(ctx, day); planLine(ctx, day); move(ctx, day, 'go'); if (S.dbl && S.dbl[day.d]) doubleDate(ctx, day, 'start'); }
    else lunch(ctx, day);
    var am = slotOf(P, 'am'), pm = slotOf(P, 'pm');
    if (am && pm && am.d !== pm.d) switchLine(ctx, day, am.d, pm.d);
    visit(ctx, day, 'pm');
    if (day.over) return;
    /* 計画した人の性格で分かれる行動・汎用の出来事・やらしい雰囲気・他の住人（順は乱数で） */
    var acts = [behave, gen, heat, others];
    for (var i = acts.length - 1; i > 0; i--) { var j = Math.floor(ctx.rng() * (i + 1)), x = acts[i]; acts[i] = acts[j]; acts[j] = x; }
    acts.forEach(function (fn) { if (!day.over) fn(ctx, day); });
    if (S.dbl && S.dbl[day.d] && !day.over) doubleDate(ctx, day, 'mid');
    if (!day.over) fightCheck(ctx, day);
  }
  function evening(ctx, day) {
    var S = f(ctx), P = day.P;
    if (slotOf(P, 'ev')) { var ev0 = slotOf(P, 'ev'); if (slotOf(P, 'pm') && slotOf(P, 'pm').d !== ev0.d) switchLine(ctx, day, slotOf(P, 'pm').d, ev0.d); visit(ctx, day, 'ev'); }
    if (day.over) return;
    if (!day.beh && ctx.rng() < 0.5) behave(ctx, day);
    if (S.dbl && S.dbl[day.d]) doubleDate(ctx, day, 'end');
    if (P.bday) bday(ctx, day);
    else if (P.len === 'long' || P.trip || slotOf(P, 'ev') || ctx.rng() < 0.45) dinner(ctx, day);
    if (!day.kiss && !day.last && ctx.rng() < 0.4) heat(ctx, day);
    if (!P.trip && !P.home) move(ctx, day, 'back');
    if (day.last) climax(ctx, day);
    nightBranch(ctx, day);
    if (day.last) ending(ctx);
  }

  /* ---------- 朝の段 ---------- */
  function prep(ctx, day) {
    var S = f(ctx), P = day.P, c = ctx.rng() < 0.5 ? S.A : S.B, o = c === S.A ? S.B : S.A;
    var t = attPick(ctx, TX().PREP, c, c, o);
    if (t) ctx.act2({ actors: [c], cat: 'solo', text: fill(ctx, t, c, o, { dest: placeName(firstD(P)) }), why: 'デートの日々：午後からの' + S.dword + 'の前（' + c.name + '）' });
  }
  function meet(ctx, day) {
    var S = f(ctx), A = S.A, B = S.B, P = day.P, Tx = TX();
    var first = ctx.rng() < 0.5 ? A : B, other = first === A ? B : A;
    var T0 = S.cohab ? Tx.MEET_COHAB : P.home ? Tx.MEET_HOME : Tx.MEET;
    var t = relPick(ctx, T0, first, other);
    if (!t) return;
    var ex = { dest: placeName(firstD(P)), n: (day.d + 1) + '回目' };
    ctx.act2({ actors: [first, other], cat: 'bond', text: fill(ctx, t, first, other, ex), why: 'デートの日々：' + (day.d + 1) + '回目の' + S.dword + '（' + P.slots.map(function (x) { return x.d.name; }).filter(function (x, i, a) { return a.indexOf(x) === i; }).join('→') + '・予算' + yen(P.bud) + '）', fx: function () { ctx.mod2(A, B, { aff: 1 }, { aff: 1 }); } });
  }
  function missLine(ctx, day) {
    var S = f(ctx), P = day.P, M = TX().MISS || {}, pl = P.planner, o = pl === S.A ? S.B : S.A;
    var t = pickT(ctx, M[P.miss.why] || M.budget, pl, o, true);
    if (t) ctx.act2({ actors: [pl, o], cat: 'bond', text: fill(ctx, t, pl, o, { dest0: P.miss.d.name, dest: placeName(P.main) }), why: 'デートの日々：' + P.miss.d.name + 'は' + { budget: '予算が足りず', season: '季節が合わず', len: '半日では回りきれず' }[P.miss.why] + '、行き先を変えた' });
  }
  function planLine(ctx, day) {
    var S = f(ctx), P = day.P, pl = P.planner, o = pl === S.A ? S.B : S.A, Tx = TX();
    var t = pickT(ctx, (Tx.PLAN || {})[P.beh.k], pl, o);
    if (!t) return;
    var rr = '';
    if (P.beh.odd && RC()) rr = fill(ctx, RC().after(ctx, S.love), o, pl);
    var e = ctx.act2({ actors: [pl, o], cat: 'bond', odd: P.beh.odd, text: fill(ctx, t, pl, o, { dest: placeName(firstD(P)), bud: yen(P.bud) }) + rr, why: 'デートの日々：' + pl.name + 'の計画（' + BEH_NAME[P.beh.k] + (P.beh.odd ? '・らしくない' : '') + '）' });
    if (e && e.odd) S.odd++;
    S.behs[P.beh.k] = (S.behs[P.beh.k] || 0) + 1;
  }
  /* 道中：行き（go）・帰り（back）。電車・車・飛行機・新幹線・ロケット・相手の家へ */
  function move(ctx, day, dir) {
    var S = f(ctx), P = day.P, A = S.A, B = S.B, M = (TX().MOVE || {})[P.mode];
    if (!M || P.mode === 'none') return;
    var a, b;
    if (P.mode === 'car') { a = P.driver || A; b = a === A ? B : A; }
    else { var x = lead2(ctx, day); a = x[0]; b = x[1]; }
    /* 帰りの区切りは、眠ってしまう段が出やすい（車は助手席の人が） */
    var kinds = dir === 'go' ? ['go', 'go', 'trouble'] : ['back', 'sleep', 'back'];
    if (dir === 'back' && P.mode === 'visit') return;
    var k = kinds[Math.floor(ctx.rng() * kinds.length)], t = relPick(ctx, M[k] || {}, a, b) || relPick(ctx, M[dir === 'go' ? 'go' : 'back'] || {}, a, b);
    if (!t) return;
    var ex = { dest: placeName(dir === 'go' ? firstD(P) : lastD(P)), drv: a.name };
    ctx.act2({ actors: [a, b], cat: 'bond', text: fill(ctx, t, a, b, ex), why: 'デートの日々：' + (dir === 'go' ? '行きの' : '帰りの') + MOVE_NAME[P.mode] + (P.mode === 'car' ? '（運転は' + a.name + '）' : ''), fx: function () { ctx.mod2(A, B, { aff: 1 }, { aff: 1 }); } });
    S.cnt['mv_' + P.mode] = (S.cnt['mv_' + P.mode] || 0) + 1;
  }
  function switchLine(ctx, day, d1, d2) {
    var S = f(ctx), x = lead2(ctx, day), t = pickT(ctx, TX().SWITCH, x[0], x[1]);
    if (t) ctx.act2({ actors: [x[0], x[1]], cat: 'bond', text: fill(ctx, t, x[0], x[1], { dest: d1.name, dest2: d2.name }), why: 'デートの日々：' + d1.name + 'から' + d2.name + 'へ' });
  }

  /* ---------- 行き先でめぐる・出来事・トラブル ---------- */
  function visit(ctx, day, part) {
    var S = f(ctx), sl = slotOf(day.P, part);
    if (!sl) return;
    var D = sl.d;
    day.cur = D; ctx.place = D.name;
    for (var i = 0; i < sl.n && !day.over; i++) spot(ctx, day, D);
    if (day.over) return;
    if (ctx.rng() < 0.6) destEv(ctx, day, D);
    if (!day.trouble && ctx.rng() < 0.28) trouble(ctx, day, D);
  }
  function spot(ctx, day, D) {
    var S = f(ctx), A = S.A, B = S.B, sp = (D.spot || []).filter(function (x) { return !day.spots[D.id + ':' + x[0]]; });
    var x = lead2(ctx, day), a = x[0], b = x[1];
    /* まだ使っていない文があるスポットから */
    var ok = sp.filter(function (s0) { return cands(ctx, s0[1], a, b).some(function (t) { return !S.used[t]; }); });
    var s1 = pickOf(ctx, ok.length ? ok : sp);
    if (!s1) return;
    day.spots[D.id + ':' + s1[0]] = 1;
    var t = pickT(ctx, s1[1], a, b);
    if (!t) return;
    var react = '';
    var e = ctx.act2({ actors: [a, b], cat: 'bond', text: fill(ctx, t, a, b, { dest: D.name, spot: s1[0] }) + react, why: 'デートの日々：' + D.name + '（' + s1[0] + '）', fx: function () { ctx.mod2(A, B, { aff: 1, att: S.love ? 1 : 0 }, { aff: 1, att: S.love ? 1 : 0 }); } });
    if (e) { S.good++; S.cnt.spot = (S.cnt.spot || 0) + 1; S.seenDest = S.seenDest || {}; S.seenDest[D.id] = 1; }
  }
  function destEv(ctx, day, D) {
    var S = f(ctx), A = S.A, B = S.B, x = lead2(ctx, day), a = x[0], b = x[1];
    var evs = (D.ev || []).filter(function (e0) { return cands(ctx, e0[1], a, b).some(function (t) { return !S.used[t]; }); });
    var e1 = pickOf(ctx, evs);
    if (!e1) return;
    var t = pickT(ctx, e1[1], a, b);
    if (!t) return;
    var rom = S.love && DROM.test(t);
    ctx.act2({ actors: [a, b], cat: rom ? rcat(ctx, a, b) : 'bond', text: fill(ctx, t, a, b, { dest: D.name }), why: 'デートの日々：' + D.name + 'で（' + e1[0] + '）', fx: function () { ctx.mod2(A, B, { aff: 2, att: rom ? 2 : 0 }, { aff: 2, att: rom ? 2 : 0 }); } });
    day.ev++; S.good++;
  }
  /* トラブル：受け止め方（相手の態度9種）と決着（笑い話／一緒に何とかする／小さな言い合い＝喧嘩になりうる） */
  function trouble(ctx, day, D) {
    var S = f(ctx), A = S.A, B = S.B, x = lead2(ctx, day), a = x[0], b = x[1];
    var trs = (D.tr || []).filter(function (e0) { return cands(ctx, e0[1], a, b).some(function (t) { return !S.used[t]; }); });
    var t1 = pickOf(ctx, trs);
    if (!t1) return;
    var t = pickT(ctx, t1[1], a, b);
    if (!t) return;
    day.trouble++;
    var rt = '', odd = false, oc = 'help';
    if (RC()) {
      var r = RC().say(ctx, 'oops', b, a);
      if (r.text && okText(ctx, r.text, b, a)) { rt = fill(ctx, r.text, b, a); odd = r.odd; if (odd) rt += fill(ctx, RC().after(ctx, S.love), a, b); }
      oc = RC().outcome(ctx, b, a, odd);
      var ot = RC().outText(ctx, oc);
      if (ot && okText(ctx, ot, a, b)) rt += fill(ctx, ot, a, b);
    }
    if (oc === 'spat') day.fightP += 0.3;
    var e = ctx.act2({ actors: [a, b], cat: 'bond', odd: odd, text: fill(ctx, t, a, b, { dest: D.name }) + rt, why: 'デートの日々：' + D.name + 'でトラブル（' + t1[0] + '・' + { laugh: '笑い話に', help: '一緒に何とかした', spat: '小さな言い合いに' }[oc] + '）',
      fx: function () { if (oc === 'spat') ctx.mod2(A, B, { ten: 3 }, { ten: 3 }); else ctx.mod2(A, B, { aff: 2, trust: 2 }, { aff: 2, trust: 2 }); } });
    if (e && e.odd) S.odd++;
    S.cnt.trouble = (S.cnt.trouble || 0) + 1;
  }
  /* 食事：行き先の食べ物（無ければ予備）＋食べ物の好み（HK.Food）の一言 */
  function meal(ctx, day, kind) {
    var S = f(ctx), A = S.A, B = S.B, P = day.P, D = kind === 'lunch' ? (slotOf(P, 'am') || slotOf(P, 'pm') || {}).d : (slotOf(P, 'ev') || slotOf(P, 'pm') || slotOf(P, 'am') || {}).d;
    /* 夕食は、食べ物の行き先・夜の行き先・旅先のときだけ行き先の料理（ほかは夕食の予備：街の店） */
    if (kind === 'dinner' && D && !(D.kind === 'food' || has(D, 'night') || D.trip || D.id === 'ouchi')) D = null;
    var x = lead2(ctx, day), a = x[0], b = x[1], Tx = TX();
    var fd = D ? (D.food || []).filter(function (e0) { return cands(ctx, e0[1], a, b).some(function (t) { return !S.used[t]; }); }) : [];
    var f1 = pickOf(ctx, fd), t, dish;
    if (f1) { t = pickT(ctx, f1[1], a, b); dish = f1[0]; }
    if (!t) { var FB = kind === 'lunch' ? Tx.LUNCH : Tx.DINNER, r = pickOf(ctx, (FB || []).filter(function (e0) { return cands(ctx, e0[1], a, b).some(function (y) { return !S.used[y]; }); })); if (!r) return; t = pickT(ctx, r[1], a, b); dish = r[0]; }
    if (!t) return;
    var tail = '';
    if (HK.Food && HK.Food.any && HK.Food.any([A, B]) && ctx.rng() < 0.55) {
      var tk = HK.Food.talk(ctx, a, b, S.grp === 'first' && day.d === 0 ? ['share', 'hate'] : ['remember', 'share', 'hate']);
      if (tk && tk.text && okText(ctx, tk.text, a, b)) tail = K.soft(tk.text);
    }
    ctx.act2({ actors: [a, b], cat: 'bond', text: fill(ctx, t, a, b, { dest: D ? D.name : '', dish: dish }) + tail, why: 'デートの日々：' + (kind === 'lunch' ? 'お昼' : '夕食') + '（' + dish + '）', fx: function () { ctx.mod2(A, B, { aff: 2 }, { aff: 2 }); } });
    S.cnt[kind] = (S.cnt[kind] || 0) + 1;
  }
  function lunch(ctx, day) { meal(ctx, day, 'lunch'); }
  function dinner(ctx, day) { if (day.P.trip) { meal(ctx, day, 'dinner'); return; } meal(ctx, day, 'dinner'); }

  /* ---------- 性格で分かれる行動（計画した人。その日の途中の一場面と、相手の受け止め方＝態度9種） ---------- */
  function behave(ctx, day) {
    var S = f(ctx), P = day.P, pl = P.planner, o = pl === S.A ? S.B : S.A, Tx = TX();
    if (day.beh) return;
    day.beh = true;
    var bk = P.beh.k, t = pickT(ctx, (Tx.BEHX || {})[bk], pl, o);
    if (!t) return;
    var R = (Tx.BEHR || {})[bk] || {}, rt = attPick(ctx, R, o, pl, o);
    /* 態度ごとの受け止め方を使い切ったら、共通の受け止め方（HK.PairReact：してくれたこと＝warm／失敗＝oops） */
    if (!rt && RC()) { var rr0 = RC().say(ctx, bk === 'kanpeki' || bk === 'awase' ? 'warm' : 'oops', o, pl); if (rr0.text && okText(ctx, rr0.text, o, pl)) rt = fill(ctx, rr0.text, o, pl); }
    var e = ctx.act2({ actors: [pl, o], cat: 'bond', odd: P.beh.odd, text: fill(ctx, t, pl, o, { dest: placeName(day.cur || P.main) }) + (rt ? (/^[^{]*$/.test(rt) ? rt : fill(ctx, rt, pl, o)) : ''), why: 'デートの日々：' + pl.name + 'が' + BEH_NAME[bk] + (P.beh.odd ? '（らしくない）' : ''),
      fx: function () { if (bk === 'kanpeki' || bk === 'awase') ctx.mod2(pl, o, { aff: 1 }, { aff: 2, trust: 2 }); else if (bk === 'karamawari') ctx.mod2(pl, o, { aff: 1 }, { aff: 1, ten: 1 }); else ctx.mod2(pl, o, { aff: 1 }, { aff: 1 }); } });
    if (e && e.odd) S.odd++;
    /* 空回り・行き当たりばったりは、きちんとした相手（態度）だと喧嘩の種に */
    var po = per(o);
    if (bk === 'karamawari') day.fightP += /proud|stern|tsun|cool/.test(po) ? 0.12 : 0.04;
    if (bk === 'batari') day.fightP += /stern|polite|cool/.test(po) ? 0.1 : 0.02;
    if (bk === 'awase') day.fightP += /proud|free/.test(po) ? 0.06 : 0;
  }
  /* ---------- 汎用の出来事 ---------- */
  var GEN_KIND = ['te', 'photo', 'hagure', 'ame', 'kutsu', 'juden', 'michi', 'pace', 'chinmoku', 'ichimen', 'machigai', 'osoroi', 'omiyage', 'tsukare', 'kaeritakunai', 'yakusoku', 'nanpa', 'otoshimono', 'kion', 'fuku', 'kaikei', 'oboete', 'jikan', 'chikoku', 'uwasa'];
  var GEN_NAME = { te: '手が触れる', photo: '写真を撮る', hagure: '人混みではぐれかける', ame: '急な雨', kutsu: '靴擦れ', juden: 'スマホの充電が切れる', michi: '道に迷う', pace: '歩く速さを合わせる', chinmoku: 'ふとした沈黙', ichimen: '知らなかった一面', machigai: 'お店の人に間違われる', osoroi: 'お揃いの小物', omiyage: 'お土産選び', tsukare: '歩き疲れて一休み', kaeritakunai: 'まだ帰りたくない', yakusoku: '次の約束', nanpa: '声をかけられる', otoshimono: '落とし物を届ける', kion: '寒さ・暑さ', fuku: '服を褒める', kaikei: 'お会計', oboete: '好きなものを覚えていた', jikan: '時間を忘れる', chikoku: '待ち合わせに遅れる', uwasa: '店のおまけ' };
  function gen(ctx, day) {
    var S = f(ctx), A = S.A, B = S.B, G0 = TX().GEN || {};
    if (day.gen >= 2) return;
    var x = lead2(ctx, day), a = x[0], b = x[1];
    var row = J.pick(ctx, 'dtgen', GEN_KIND.map(function (k) { return { k: k }; }), function (r) {
      var T0 = G0[r.k]; if (!T0) return 0;
      if (r.k === 'yakusoku' && day.last) return 0;
      if (r.k === 'kaeritakunai' && day.last) return 0.4;
      if (r.k === 'chikoku' && day.P.home) return 0;
      return cands(ctx, relList(T0, S), a, b).some(function (t) { return !S.used[t]; }) ? 1 : 0;
    });
    if (!row) return;
    var t = relPick(ctx, G0[row.k], a, b);
    if (!t) return;
    day.gen++;
    var rom = S.love && DROM.test(t);
    var e = ctx.act2({ actors: [a, b], cat: rom ? rcat(ctx, a, b) : 'bond', text: fill(ctx, t, a, b, { dest: placeName(day.cur || day.P.main) }), why: 'デートの日々：' + (GEN_NAME[row.k] || row.k),
      fx: function () { ctx.mod2(A, B, { aff: 2, att: rom ? 2 : 0 }, { aff: 2, att: rom ? 2 : 0 }); } });
    if (e) S.good++;
    if (row.k === 'chikoku') day.fightP += 0.05;
    if (row.k === 'nanpa') day.fightP += 0.05;
    S.cnt['gen_' + row.k] = (S.cnt['gen_' + row.k] || 0) + 1;
  }
  /* ---------- やらしい雰囲気（性欲が高まると、デートの途中で。恋人どうしは人目を盗んだキス、そうでない二人は意識してしまう一場面） ---------- */
  function heatPlace(ctx, day) {
    var D = day.cur || day.P.main;
    if (has(D, 'dark')) return 'dark';
    if (has(D, 'kanran')) return ctx.rng() < 0.6 ? 'kanran' : 'quiet';
    if (has(D, 'view')) return 'view';
    if (day.P.mode === 'car') return ctx.rng() < 0.4 ? 'car' : 'quiet';
    return ctx.rng() < 0.4 ? 'crowd' : 'quiet';
  }
  var HEAT_NAME = { dark: '暗がりで', kanran: '観覧車のゴンドラで', view: '景色を見ながら', car: '車の中で', crowd: '人混みにまぎれて', quiet: '物陰で' };
  function heat(ctx, day) {
    var S = f(ctx), A = S.A, B = S.B, Tx = TX();
    if (!S.love || day.kiss || day.over) return;
    /* 起こりやすさ：性欲（HK.Pos.libMul）と、デートを重ねて高まった気持ち（惹かれ） */
    var att = ((ctx.rel[A.i][B.i].att || 0) + (ctx.rel[B.i][A.i].att || 0)) / 2;
    var p = (S.couple ? 0.16 : 0.07) * Math.max(0.35, Math.min(1.8, S.heat)) + Math.max(0, att - 30) / 400;
    if (ctx.rng() > p) return;
    day.kiss = 1;
    var pl = heatPlace(ctx, day), o = HK.Pos && HK.Pos.order ? HK.Pos.order(A, B) : [A, B];
    if (!S.couple) {
      var t0 = pickT(ctx, (Tx.HEAT_NC || {})[pl] || [], o[0], o[1]) || pickT(ctx, (Tx.HEAT_NC || {}).all, o[0], o[1]);
      if (!t0) return;
      ctx.act2({ actors: [o[0], o[1]], cat: rcat(ctx, A, B), text: fill(ctx, t0, o[0], o[1]), why: 'デートの日々：距離が近くて意識してしまう（' + HEAT_NAME[pl] + '）', fx: function () { ctx.mod2(A, B, { att: 4 }, { att: 4 }); } });
      S.heatN++;
      return;
    }
    if (!HK.Kiss || !HK.Kiss.scene) return;
    var ld = pickT(ctx, (Tx.HEAT || {})[pl] || [], o[0], o[1]) || pickT(ctx, (Tx.HEAT || {}).quiet || [], o[0], o[1]);
    var tail = '';
    if (!HK.SAFE_ON && HK.DateR18 && HK.DateR18.heatTail) tail = HK.DateR18.heatTail(ctx, o[0], o[1], pl) || '';
    var r = HK.Kiss.scene(ctx, o[0], o[1], { trig: ctx.rng() < 0.6 ? 'fui' : 'karakai', len: ctx.rng() < 0.6 ? 's' : 'm', place: 'soto', lead: ld ? K.mark(ld) : null, tail: tail || null, whyPre: 'デートの日々：人目を盗んで（' + HEAT_NAME[pl] + '）', cat: rcat(ctx, A, B), fx: function () { ctx.mod2(A, B, { aff: 2, att: 5 }, { aff: 2, att: 5 }); } });
    if (r) { S.kissN++; S.heatN++; S.cnt['heat_' + pl] = (S.cnt['heat_' + pl] || 0) + 1; }
  }
  /* ---------- 喧嘩（その日のデートが途中で終わることがある。最後のデートでは帰らない） ---------- */
  var FIGHT_NAME = { karamawari: '空回りにいらだって', batari: '段取りの悪さに', chikoku: '遅刻をきっかけに', money: 'お金の使い方で', jeal: 'ヤキモチから', feud: 'いつもの言い合いから', tired: '疲れから' };
  function fightCheck(ctx, day) {
    var S = f(ctx), A = S.A, B = S.B, P = day.P;
    if (day.fight || day.over) return;
    var ten = ((ctx.rel[A.i][B.i].ten || 0) + (ctx.rel[B.i][A.i].ten || 0)) / 2;
    var p = 0.015 + day.fightP * 0.5 + (S.feud ? 0.09 : 0) + Math.max(0, ten) / 450;
    if (ctx.rng() > p) return;
    var cause = S.feud && ctx.rng() < 0.5 ? 'feud' : day.jeal ? 'jeal' : P.beh.k === 'karamawari' || P.beh.k === 'batari' ? P.beh.k : S.cnt.gen_chikoku ? 'chikoku' : P.cost >= 30000 && ctx.rng() < 0.4 ? 'money' : 'tired';
    fight(ctx, day, cause);
  }
  function fight(ctx, day, cause) {
    var S = f(ctx), A = S.A, B = S.B, P = day.P, Tx = TX();
    day.fight = true; S.fights++;
    /* 怒る人：空回り・ばったりは計画した人の相手、ヤキモチは妬いた人、ほかは気の強い方 */
    var pl = P.planner, ang = cause === 'karamawari' || cause === 'batari' ? (pl === A ? B : A) : cause === 'jeal' && day.jealBy ? day.jealBy : ((A.tr.fc || 0.5) - (A.tr.ac || 0.5) >= (B.tr.fc || 0.5) - (B.tr.ac || 0.5) ? A : B), oth = ang === A ? B : A;
    var c0 = pickT(ctx, (Tx.FIGHT_CAUSE || {})[cause], ang, oth) || pickT(ctx, (Tx.FIGHT_CAUSE || {}).tired, ang, oth) || pickT(ctx, Tx.FIGHT_FB.cause, ang, oth, true), sy = attPick(ctx, Tx.FIGHT_SAY, ang, ang, oth);
    ctx.act2({ actors: [ang, oth], cat: 'conflict', text: fill(ctx, c0 + sy, ang, oth, { dest: placeName(day.cur || P.main) }), why: 'デートの日々：喧嘩（' + FIGHT_NAME[cause] + '・' + ang.name + 'が怒った）', fx: function () { ctx.mod2(ang, oth, { ten: 8, aff: -3 }, { ten: 6, aff: -2 }); } });
    /* 帰ってしまうか：意地っ張り・強気・きっちりした人は帰りやすく、尽くす・穏やかな人は仲直りしやすい。最後のデートでは帰らない */
    var pa = per(ang), pg = 0.22 + (/proud|tsun|stern/.test(pa) ? 0.16 : 0) - (/devoted|gentle|shy/.test(pa) ? 0.14 : 0) - (S.couple ? 0.08 : 0) + (S.feud ? 0.04 : 0);
    if (!day.last && ctx.rng() < pg) {
      var gt = attPick(ctx, Tx.FIGHT_GO, ang, ang, oth) || pickT(ctx, Tx.FIGHT_FB.go, ang, oth, true);
      scen.actRate = REST_RATE;
      var e = ctx.act2({ actors: [ang, oth], cat: 'conflict', text: fill(ctx, gt, ang, oth), why: 'デートの日々：喧嘩してその日の' + S.dword + 'が終わった（' + ang.name + 'が帰った）', fx: function () { ctx.mod2(ang, oth, { ten: 4, aff: -2 }, { ten: 4, aff: -2 }); } });
      if (e) e.tag = '途中で帰った';
      day.over = true; S.kaeru++;
      S.sorry = { by: ((oth.tr.ac || 0.5) + (oth.tr.honesty || 0.5) > (ang.tr.ac || 0.5) + (ang.tr.honesty || 0.5)) ? oth : ang, d: day.d };
      S.goneDays = S.goneDays || []; S.goneDays.push(day.d);
      return;
    }
    var md = ctx.rng() < 0.5 ? ang : oth, mo = md === A ? B : A, mt = attPick(ctx, Tx.FIGHT_MEND, md, md, mo) || attPick(ctx, Tx.FIGHT_MEND, mo, md, mo) || pickT(ctx, Tx.FIGHT_FB.mend, md, mo, true);
    ctx.act2({ actors: [md, mo], cat: 'bond', text: fill(ctx, mt, md, mo), why: 'デートの日々：その場で仲直り（' + md.name + 'から）', fx: function () { ctx.mod2(A, B, { ten: -6, aff: 2, trust: 1 }, { ten: -6, aff: 2, trust: 1 }); } });
    /* 恋人どうしは、仲直りのキス（HK.Kiss） */
    if (S.couple && HK.Kiss && HK.Kiss.scene && ctx.rng() < 0.35 && !day.kiss) { var o = HK.Pos && HK.Pos.order ? HK.Pos.order(A, B) : [A, B]; var r = HK.Kiss.scene(ctx, o[0], o[1], { trig: 'naka', len: 's', whyPre: 'デートの日々：仲直りのキス：', cat: rcat(ctx, A, B) }); if (r) { day.kiss = 1; S.kissN++; } }
  }
  function sorry(ctx, day) {
    var S = f(ctx), by = S.sorry.by, o = by === S.A ? S.B : S.A, Tx = TX();
    S.sorry = null;
    var t = attPick(ctx, Tx.SORRY, by, by, o) || pickT(ctx, Tx.FIGHT_FB.sorry, by, o, true);
    if (t) ctx.act2({ actors: [by, o], cat: 'bond', text: fill(ctx, t, by, o), why: 'デートの日々：前の' + S.dword + 'の喧嘩を謝った（' + by.name + 'から）', fx: function () { ctx.mod2(S.A, S.B, { ten: -8, aff: 3, trust: 2 }, { ten: -8, aff: 3, trust: 2 }); } });
  }

  /* ---------- 他の住人（名簿から来た住人：デートごとに 1 割ほど。三人目の参加者は決まったデートに） ---------- */
  function others(ctx, day) {
    var S = f(ctx), PV = HK.PairVisit;
    if (day.visited || day.over) return;
    if (S.c3 && S.c3role === 'guest' && day.d === S.c3date) { c3Battari(ctx, day); return; }
    if (!PV) return;
    var gs = S.G.filter(function (g) { return g.outside && PV.here(g); });
    if (!gs.length) return;
    if (ctx.rng() > 0.1) return;
    var cs = [];
    gs.forEach(function (g) { [S.A, S.B].forEach(function (h) { var c = PV.cls(ctx, h, g); if (c) cs.push({ g: g, h: h, cls: c === 'pfam' ? 'fam' : c }); }); });
    if (!cs.length) return;
    var v = pickOf(ctx, cs);
    day.visited = true;
    S.outN = (S.outN || 0) + 1;
    if (!day.last && ctx.rng() < 0.4) { S.mita = { g: v.g, h: v.h, cls: v.cls, dest: placeName(day.cur || day.P.main), d: day.d }; return; }
    battari(ctx, day, v);
  }
  function battari(ctx, day, v) {
    var S = f(ctx), A = S.A, B = S.B, PV = HK.PairVisit, Tx = TX(), g = v.g, h = v.h, o = h === A ? B : A;
    var arr = ((Tx.BATTARI || {})[v.cls] || []).concat((Tx.BATTARI || {}).all || []);
    if (HK.relFilter) { var fl = HK.relFilter(ctx, arr, h, g); if (fl) arr = fl; }
    var t = pickT(ctx, arr, h, o);
    if (!t) return;
    g.gone = false;
    try {
      var ex = { g: g.name, gl: PV.word(ctx, h, g), dest: placeName(day.cur || day.P.main) };
      var text = fill(ctx, t, h, o, ex), jeal = false;
      /* 話が盛り上がって、相手が妬く（恋愛にしてよい二人。元恋人・同僚・友人。家族には妬かない）。恋愛にならない二人は、少し置いてけぼり */
      if (S.love && v.cls !== 'fam' && ctx.rng() < (v.cls === 'ex' ? 0.85 : 0.55)) {
        var jt = attPick(ctx, Tx.JEAL, o, o, h, true);
        if (jt) { text += fill(ctx, jt, o, h, ex); jeal = true; day.jeal = true; day.jealBy = o; day.fightP += 0.12; }
      } else if (!S.love && ctx.rng() < 0.4) { var nt = pickT(ctx, Tx.JEAL_NC, o, h, true); if (nt) text += fill(ctx, nt, o, h, ex); }
      var e = ctx.act2({ actors: [h, o, g], cat: jeal ? rcat(ctx, A, B) : 'bond', text: text, why: 'デートの日々：' + ex.dest + 'で' + g.name + '（' + h.name + 'の' + ex.gl + '）とばったり' + (jeal ? '・' + o.name + 'が嫉妬した' : ''), fx: function () { if (jeal) ctx.mod2(o, h, { att: 2, ten: 2 }, { att: 1 }); } });
      if (e) { S.visits++; S.cnt.battari = (S.cnt.battari || 0) + 1; if (jeal) S.cnt.jeal = (S.cnt.jeal || 0) + 1; }
    } finally { g.gone = true; }
  }
  /* 後日「〇〇で見たよ」と声をかけられて、恥ずかしがる（次のデートの朝。声をかけられた人の態度9種） */
  function mitaLater(ctx, day) {
    var S = f(ctx), A = S.A, B = S.B, PV = HK.PairVisit, Tx = TX(), v = S.mita, g = v.g, h = v.h, o = h === A ? B : A;
    S.mita = null;
    var arr = ((Tx.MITA || {})[v.cls] || []).concat((Tx.MITA || {}).all || []);
    if (HK.relFilter) { var fl = HK.relFilter(ctx, arr, h, g); if (fl) arr = fl; }
    var t = pickT(ctx, arr, h, o);
    if (!t) return;
    g.gone = false;
    try {
      var ex = { g: g.name, gl: PV ? PV.word(ctx, h, g) : '知り合い', dest: v.dest };
      var rt = attPick(ctx, Tx.MITA_RE, h, h, o, true);
      var e = ctx.act2({ actors: [h, g], cat: 'bond', text: fill(ctx, t + (rt || ''), h, o, ex), why: 'デートの日々：後日、' + g.name + '（' + ex.gl + '）に「' + v.dest + 'で見た」と言われた（' + h.name + '）' });
      if (e) { S.visits++; S.cnt.mita = (S.cnt.mita || 0) + 1; }
    } finally { g.gone = true; }
  }
  /* 三人目（参加者）：ばったり会う側。片想いの三人目なら胸が痛む（すれ違い）、ほかは冷やかし・応援（仲良し） */
  function c3Battari(ctx, day) {
    var S = f(ctx), A = S.A, B = S.B, c = S.c3, Tx = TX();
    day.visited = true;
    var t = pickT(ctx, Tx.C_BATTARI, A, B, true);
    if (!t) return;
    c.gone = false;
    try {
      var text = fill(ctx, t, A, B, { c: c.name, dest: placeName(day.cur || day.P.main) }), jeal = false;
      if (S.c3crush) { var ct = pickT(ctx, Tx.C_CRUSH, A, B, true); if (ct) text += fill(ctx, ct, A, B, { c: c.name }); }
      else if (S.love && ctx.rng() < 0.5) { var o = ctx.rng() < 0.5 ? A : B, h = o === A ? B : A, jt = attPick(ctx, Tx.JEAL, o, o, h, true); if (jt) { text += fill(ctx, jt, o, h, { g: c.name }); jeal = true; day.jeal = true; day.jealBy = o; } }
      var e = ctx.act2({ actors: [A, B, c], cat: S.love ? rcat(ctx, A, B) : 'bond', text: text, why: 'デートの日々：' + c.name + 'とデート先で鉢合わせた' + (S.c3crush ? '（' + c.name + 'は胸が痛んだ）' : jeal ? '（嫉妬）' : '') });
      if (e) { S.visits++; S.cnt.c3 = (S.cnt.c3 || 0) + 1; }
    } finally { c.gone = true; }
    /* 次のデートの朝に、三人目から冷やかし・応援（仲良し） */
    if (day.d + 1 < S.n) S.c3mita = day.d + 1;
  }
  function c3Mita(ctx, day) {
    var S = f(ctx), A = S.A, B = S.B, c = S.c3, Tx = TX();
    S.c3mita = null;
    var t = pickT(ctx, S.c3crush ? Tx.C_MITA_CRUSH : S.love ? Tx.C_MITA : Tx.C_MITA_PLAIN, A, B, true);
    if (!t) return;
    c.gone = false;
    try {
      var e = ctx.act2({ actors: [A, B, c], cat: S.love ? rcat(ctx, A, B) : 'bond', text: fill(ctx, t, A, B, { c: c.name }), why: 'デートの日々：' + c.name + 'に' + (S.c3crush ? '前のデートのことを聞かれた' : '前のデートのことを冷やかされた・応援された') });
      if (e) S.visits++;
    } finally { c.gone = true; }
  }
  /* 三人目がデートを応援してくれる（仲良し。三人目の出番の前のデートの朝） */
  function c3Ouen(ctx, day) {
    var S = f(ctx), A = S.A, B = S.B, c = S.c3, Tx = TX();
    S.c3ouen = true;
    var x = ctx.rng() < 0.5 ? A : B, y = x === A ? B : A, t = pickT(ctx, Tx.C_OUEN, x, y, true);
    if (!t) return;
    c.gone = false;
    try { ctx.act2({ actors: [x, y, c], cat: S.love ? rcat(ctx, A, B) : 'bond', text: fill(ctx, t, x, y, { c: c.name }), why: 'デートの日々：' + c.name + 'が' + S.dword + 'を応援してくれた' }); }
    finally { c.gone = true; }
  }
  /* ダブルデート（仲良し）：三人目と、三人目の恋人（名前の出ない人）と四人で */
  function doubleDate(ctx, day, k) {
    var S = f(ctx), A = S.A, B = S.B, c = S.c3, Tx = TX(), D = (Tx.DOUBLE || {})[k];
    if (!c || !D) return;
    var t = pickT(ctx, D, A, B, true);
    if (!t) return;
    c.gone = false;
    try {
      var e = ctx.act2({ actors: [A, B, c], cat: S.love ? rcat(ctx, A, B) : 'bond', text: fill(ctx, t, A, B, { c: c.name, dest: placeName(day.cur || day.P.main) }), why: 'デートの日々：' + c.name + 'たちとダブル' + (S.love ? 'デート' : 'でお出かけ') + '（' + { start: '待ち合わせ', mid: '四人で', end: '別れ際' }[k] + '）', fx: function () { ctx.mod2(A, B, { aff: 2 }, { aff: 2 }); } });
      if (e) S.cnt.dbl = (S.cnt.dbl || 0) + 1;
    } finally { c.gone = true; }
  }
  /* 誕生日のデート：お祝いと贈り物（受け取った人の態度9種） */
  function bday(ctx, day) {
    var S = f(ctx), b = day.P.bday, a = b === S.A ? S.B : S.A, Tx = TX();
    var t = pickT(ctx, Tx.BDAY, a, b, true), r = attPick(ctx, Tx.BDAY_GIFT, b, b, a, true);
    if (!t) return;
    ctx.act2({ actors: [a, b], cat: S.love ? rcat(ctx, a, b) : 'bond', text: fill(ctx, t, a, b) + (r ? fill(ctx, r, b, a) : ''), why: 'デートの日々：' + b.name + 'の誕生日の' + S.dword, fx: function () { ctx.mod2(a, b, { aff: 3 }, { aff: 5, att: S.love ? 3 : 0, trust: 2 }); } });
    S.cnt.bday = (S.cnt.bday || 0) + 1;
  }

  /* ---------- 山場：最後のデートの帰り道（観覧車・駅の改札・車の中・宿・家の前・おうち） ---------- */
  var CL_NAME = { kanran: '観覧車', kaisatsu: '駅の改札', car: '車の中', michi: '帰り道', yado: '旅先の宿', ouchi: 'おうちの夜' };
  function climaxPlace(ctx, day) {
    var P = day.P, S = f(ctx);
    if (P.slots.some(function (s) { return has(s.d, 'kanran'); })) return 'kanran';
    if (P.trip) return 'yado';
    if (P.home) return 'ouchi';
    /* 帰りに、街の観覧車に寄り道する（最後のデートの山場の定番） */
    if (ctx.rng() < 0.3) return 'kanran';
    if (P.mode === 'car') return 'car';
    if (P.mode === 'train' && !S.cohab) return 'kaisatsu';
    return 'michi';
  }
  function climax(ctx, day) {
    var S = f(ctx), A = S.A, B = S.B, Tx = TX();
    var pl = climaxPlace(ctx, day);
    S.climax = pl;
    /* 本音を言うのは、素直さ・行動力の高い方（片想いは想う側が多い） */
    var sa = (A.tr.honesty || 0.5) + (A.tr.fc || 0.5) * 0.5, sb = (B.tr.honesty || 0.5) + (B.tr.fc || 0.5) * 0.5;
    var sp = S.rkKey === 'crushA' && ctx.rng() < 0.7 ? A : S.rkKey === 'crushB' && ctx.rng() < 0.7 ? B : sa >= sb ? A : B, o = sp === A ? B : A;
    S.speaker = sp;
    var ld = relPick(ctx, (Tx.CLIMAX || {})[pl] || {}, sp, o, true), inn = day.P.main.inn || '宿';
    var H = S.love ? Tx.HONNE : Tx.HONNE_P, ht = attPick(ctx, H, sp, sp, o, true);
    var AN = S.love ? Tx.HONNE_ANS : Tx.HONNE_ANS_P, an = attPick(ctx, AN, o, sp, o, true);
    var rl = relPick(ctx, Tx.HONNE_REL || {}, sp, o);
    var e = ctx.act2({ actors: [sp, o], cat: S.love ? rcat(ctx, A, B) : 'bond', text: fill(ctx, (ld || '') + (ht || '') + (an || '') + (rl || ''), sp, o, { n: S.n + '回', inn: inn }), why: 'デートの日々：最後の' + S.dword + 'の帰り道（' + CL_NAME[pl] + '・' + sp.name + 'の本音）',
      fx: function () { ctx.mod2(sp, o, { aff: 4, trust: 3, att: S.love ? 4 : 0 }, { aff: 4, trust: 3, att: S.love ? 4 : 0 }); } });
    if (e) e.tag = '山場';
    var ek = decideEnd(ctx);
    if (ek === 'koi') confess(ctx);
    else if (ek === 'propose' || ek === 'repro') propose(ctx);
    else if (ek === 'yujin') yujin(ctx);
    else if (ek === 'tomari') tomariAsk(ctx);
  }
  /* 結末の判定：二人の惹かれ・好意（デートを重ねた分）・良い出来事・喧嘩・関係ごとの線 */
  var END_TH = { almost: [158, 135], crush: [145, 115], ex: [125, 100], bad: [125, 80], rival: [125, 80], lovehate: [120, 80], none: [128, 85], weak: [128, 85], def: [125, 0] };
  function decideEnd(ctx) {
    var S = f(ctx), A = S.A, B = S.B;
    if (S.endK) return S.endK;
    var r = ctx.rel[A.i][B.i], q = ctx.rel[B.i][A.i];
    var sc = ((r.att || 0) + (q.att || 0)) / 2 + ((r.aff || 0) + (q.aff || 0)) / 5 + ((A.tr.honesty || 0.5) + (B.tr.honesty || 0.5)) * 6 + Math.min(14, S.good * 0.5) + S.kissN * 3 - S.fights * 5 - S.kaeru * 6 + (ctx.rng() - 0.5) * 20 + (S.pine ? 12 : 0);
    S.endScore = Math.round(sc);
    S.attAvg = ((r.att || 0) + (q.att || 0)) / 2;
    if (!S.love) return (S.endK = S.grp === 'first' && sc >= 85 ? 'yujin_new' : 'mama');
    if (S.rk === 'spouse') return (S.endK = sc >= 160 && ctx.rng() < 0.6 ? 'repro' : 'mama');
    if (S.couple) {
      if (sc >= 166 && ctx.rng() < 0.7) return (S.endK = 'propose');
      if (!S.cohab && !S.stayed && sc >= 128) return (S.endK = 'tomari');
      return (S.endK = 'mama');
    }
    var th = END_TH[S.rk] || END_TH.def;
    if (sc >= th[0]) return (S.endK = 'koi');
    if (S.grp === 'first') return (S.endK = sc >= th[1] ? 'yujin_new' : 'mama');
    if (sc < th[1] && /^(pine|awk)$/.test(S.grp)) return (S.endK = 'yujin');
    return (S.endK = 'mama');
  }
  function confess(ctx) {
    var S = f(ctx), A = S.A, B = S.B, Tx = TX(), by = S.speaker || A, to = by === A ? B : A;
    S.confessed = true; S.couple = true;
    var t = attPick(ctx, Tx.CONFESS, by, by, to, true), an = attPick(ctx, Tx.CONFESS_ANS, to, by, to, true);
    if (!t) { S.confessed = false; S.couple = false; S.endK = 'mama'; return; }
    var p = ctx.pair(A, B); p.confessed[by.i] = true; p.couple = true;
    var e = ctx.act2({ actors: [by, to], cat: rcat(ctx, by, to), text: fill(ctx, t + (an || ''), by, to), why: 'デートの日々：想いを告げて付き合い始めた（' + by.name + 'から）', fx: function () { ctx.mod2(by, to, { aff: 10, att: 10, trust: 6, ten: -6 }, { aff: 10, att: 10, trust: 6, ten: -6 }); } });
    if (e) e.tag = '結末';
  }
  function propose(ctx) {
    var S = f(ctx), A = S.A, B = S.B, Tx = TX(), by = S.speaker || A, to = by === A ? B : A;
    var W1 = { wed: true }, t = S.rk === 'spouse' ? pickT(ctx, Tx.REPRO, by, to, true, W1) : attPick(ctx, Tx.PROPOSE, by, by, to, true, W1), an = S.rk === 'spouse' ? '' : attPick(ctx, Tx.PROPOSE_ANS, to, by, to, true, W1);
    if (!t) { S.endK = 'mama'; return; }
    S.proposed = true;
    var e = ctx.act2({ actors: [by, to], cat: rcat(ctx, by, to), text: fill(ctx, t + (an || ''), by, to), why: 'デートの日々：最後の' + S.dword + 'の帰り道にプロポーズした（' + by.name + 'から）', fx: function () { ctx.mod2(by, to, { aff: 12, att: 8, trust: 8 }, { aff: 12, att: 8, trust: 8 }); } });
    if (e) e.tag = '結末';
  }
  function yujin(ctx) {
    var S = f(ctx), A = S.A, B = S.B, Tx = TX(), by = S.speaker || A, to = by === A ? B : A;
    var t = relPick(ctx, Tx.YUJIN || {}, by, to, true);
    if (!t) return;
    var e = ctx.act2({ actors: [by, to], cat: 'bond', text: fill(ctx, t, by, to), why: 'デートの日々：友人に戻ろうと話した（' + by.name + 'から）', fx: function () { ctx.mod2(by, to, { att: -6, trust: 3, ten: -4 }, { att: -6, trust: 3, ten: -4 }); } });
    if (e) e.tag = '結末';
  }
  function tomariAsk(ctx) {
    var S = f(ctx), A = S.A, B = S.B, Tx = TX(), by = S.speaker || A, to = by === A ? B : A;
    var t = attPick(ctx, Tx.TOMARI_ASK, by, by, to, true), an = pickT(ctx, Tx.TOMARI_ANS, by, to, true);
    if (!t) { S.endK = 'mama'; return; }
    var e = ctx.act2({ actors: [by, to], cat: rcat(ctx, by, to), text: fill(ctx, t + (an || ''), by, to), why: 'デートの日々：初めてのお泊まりを切り出した（' + by.name + 'から）', fx: function () { ctx.mod2(by, to, { aff: 6, att: 8 }, { aff: 6, att: 8 }); } });
    if (e) e.tag = '結末';
  }

  /* ---------- 夜：そのまま別れる／送る／お家に寄る／泊まる／一緒に帰る／旅先の宿／ラブホ（R18） ---------- */
  var BR_NAME = { wakare: 'そのまま別れた', okuru: '家まで送った', ouchi: 'お家に寄った', tomari: '泊まった', kaeru: '一緒に帰った', yado: '旅先の宿', hotel: 'ラブホへ', car: '車を停めて' };
  function r18can(ctx) { return !HK.SAFE_ON && HK.DateR18 && HK.DateR18.can && HK.DateR18.can(ctx); }
  function nightBranch(ctx, day) {
    var S = f(ctx), A = S.A, B = S.B, P = day.P, Tx = TX(), ek = day.last ? S.endK : null;
    var r18 = r18can(ctx), heatK = Math.max(0.3, Math.min(1.8, S.heat)), att = ((ctx.rel[A.i][B.i].att || 0) + (ctx.rel[B.i][A.i].att || 0)) / 2;
    var br;
    if (P.trip) br = 'yado';
    else if (S.cohab) br = r18 && S.couple && ctx.rng() < 0.12 * heatK ? 'hotel' : 'kaeru';
    else if (ek === 'tomari') br = r18 && ctx.rng() < 0.3 ? 'hotel' : 'tomari';
    else if (ek === 'propose' || ek === 'koi') br = HK.weighted(ctx.rng, [['okuru', 1], ['ouchi', 1.2], ['tomari', S.couple ? 0.6 : 0.2], ['hotel', r18 ? 0.5 * heatK : 0]], function (x) { return x[1]; })[0];
    else if (ek === 'yujin' || ek === 'yujin_new') br = ctx.rng() < 0.7 ? 'wakare' : 'okuru';
    else {
      /* お家・泊まり・ラブホは、恋人どうしかどうかと性欲（熱）で決める（恋愛感情の有無では止めない。本体の決まり） */
      var W = [['wakare', S.love ? 1 : 1.6], ['okuru', S.love ? 1.2 : 0.6]];
      W.push(['ouchi', S.couple ? 0.6 : 0.12 * heatK + (S.love ? Math.max(0, att - 40) / 200 : 0)]);
      W.push(['tomari', S.couple ? 0.25 * heatK : 0.04 * heatK + (S.grp === 'fam' || S.grp === 'close' ? 0.05 : 0)]);
      if (r18) W.push(['hotel', (S.couple ? 0.3 : 0.07) * heatK]);
      if (P.home) W = W.filter(function (x) { return x[0] !== 'ouchi'; });
      br = HK.weighted(ctx.rng, W, function (x) { return x[1]; })[0];
    }
    /* ラブホは、R18 で体の関係にしてよい二人で、回数が残っているときだけ */
    if (br === 'hotel' && !r18) br = S.couple ? 'ouchi' : 'okuru';
    S.branches[br] = (S.branches[br] || 0) + 1;
    day.br = br;
    if (br === 'tomari' || br === 'yado') S.stayed = S.stayed || (S.couple && day.d < S.n - 1);
    /* ラブホ：文は R18 版だけ（場面の前のきっかけの段が行き先を含む） */
    if (br === 'hotel') { if (!HK.DateR18.night(ctx, 'hotel', day, day.last)) { S.branches.hotel--; S.branches.okuru = (S.branches.okuru || 0) + 1; day.br = 'okuru'; brText(ctx, day, 'okuru'); } return; }
    /* 帰り道の車の中（R18）：車で来た日に、別れる前に車を停めて（性欲が強いほど起こりやすい） */
    if ((br === 'wakare' || br === 'okuru') && P.mode === 'car' && r18 && S.love && !day.fight && ctx.rng() < (S.couple ? 0.16 : 0.06) * heatK) { if (HK.DateR18.night(ctx, 'car', day, day.last)) { S.branches.car = (S.branches.car || 0) + 1; day.kiss = 1; } }
    brText(ctx, day, br);
    if (br === 'wakare' || br === 'okuru') partKiss(ctx, day);
    var did = /^(ouchi|tomari|yado|kaeru)$/.test(br) && r18 && HK.DateR18.night(ctx, br, day, day.last);
    if (!did && T0end(br)) nightEnd(ctx, day, br);
  }
  function brText(ctx, day, br) {
    var S = f(ctx), A = S.A, B = S.B, P = day.P, Tx = TX();
    /* 送る人・お家の主：送る人は計画した人か気の利く方、お家は相手の家（おうちデートの日は、その家の主の側） */
    var x = lead2(ctx, day), a = x[0], b = x[1];
    day.brAB = [a, b];
    var NT = (Tx.NIGHT || {})[br] || {}, t = relPick(ctx, NT, a, b);
    if (!t) return;
    var dest = placeName(P.main);
    var e = ctx.act2({ actors: [a, b], cat: /ouchi|tomari|yado/.test(br) && S.love ? rcat(ctx, A, B) : 'bond', text: fill(ctx, t, a, b, { dest: dest, inn: P.main.inn || '宿' }), why: 'デートの日々：' + (day.d + 1) + '回目の夜（' + BR_NAME[br] + '）', fx: function () { ctx.mod2(A, B, { aff: 2, att: S.love && /ouchi|tomari|yado/.test(br) ? 3 : 0 }, { aff: 2, att: S.love && /ouchi|tomari|yado/.test(br) ? 3 : 0 }); } });
    if (e) e.tag = e.tag || '';
  }
  function T0end(br) { return /^(ouchi|tomari|yado|kaeru)$/.test(br); }
  /* 夜の締めくくり（R18 の場面が無かったとき）：泊まって眠る・帰っていく */
  function nightEnd(ctx, day, br) {
    var S = f(ctx), ab = day.brAB || [S.A, S.B], E = (TX().NIGHT_END || {})[br] || {}, t = relPick(ctx, E, ab[0], ab[1]);
    if (t) ctx.act2({ actors: [ab[0], ab[1]], cat: S.love ? rcat(ctx, S.A, S.B) : 'bond', text: fill(ctx, t, ab[0], ab[1], { inn: day.P.main.inn || '宿' }), why: 'デートの日々：' + (day.d + 1) + '回目の夜の終わり（' + BR_NAME[br] + '）' });
  }
  /* 別れ際のキス（恋人どうし。名残惜しい） */
  function partKiss(ctx, day) {
    var S = f(ctx), A = S.A, B = S.B, Tx = TX();
    if (!S.couple || day.kiss || !HK.Kiss || !HK.Kiss.scene) return;
    if (ctx.rng() > 0.45) return;
    var o = HK.Pos && HK.Pos.order ? HK.Pos.order(A, B) : [A, B];
    var ld = pickT(ctx, Tx.PART_KISS, o[0], o[1]);
    var r = HK.Kiss.scene(ctx, o[0], o[1], { trig: 'fui', len: ctx.rng() < 0.5 ? 's' : 'm', place: 'soto', lead: ld ? K.mark(ld) : null, end: ctx.rng() < 0.5 ? 'nagori' : null, whyPre: 'デートの日々：別れ際のキス：', cat: rcat(ctx, A, B), fx: function () { ctx.mod2(A, B, { aff: 2, att: 3 }, { aff: 2, att: 3 }); } });
    if (r) { day.kiss = 1; S.kissN++; S.cnt.partKiss = (S.cnt.partKiss || 0) + 1; }
  }

  /* ---------- 結末 ---------- */
  var END_NAME = { koi: '付き合い始める', propose: 'プロポーズ', repro: '改めてのプロポーズ', tomari: '初めてのお泊まり', yujin: '友人に戻る', yujin_new: '友人になる', mama: '' };
  function endName(S) { return S.endK === 'mama' ? (S.rk === 'almost' ? '両片想いのまま' : S.rk === 'crush' ? '片想いのまま' : S.grp === 'love' ? 'これからも二人で' : S.love && S.attAvg >= 55 ? '惹かれ合ったまま' : '今の関係のまま') : S.endK === 'yujin_new' && S.love && S.attAvg >= 55 ? '惹かれ合ったまま、まずは友人に' : END_NAME[S.endK]; }
  function ending(ctx) {
    var S = f(ctx), A = S.A, B = S.B, ek = decideEnd(ctx);
    if (S.ended) return;
    S.ended = true;
    var E = (TX().END || {})[ek] || {}, t = relPick(ctx, E, A, B, true, { wed: ek === 'propose' || ek === 'repro' });
    if (!t) t = '{a}と{b}の{date}の日々は、こうして一区切りがついた。';
    var e = ctx.act2({ actors: [A, B], cat: /koi|propose|repro|tomari/.test(ek) ? rcat(ctx, A, B) : 'bond', text: fill(ctx, t, A, B, { n: S.n + '回' }), why: 'デートの日々：結末（' + endName(S) + '）', fx: function () { ctx.mod2(A, B, { aff: 3, trust: 3 }, { aff: 3, trust: 3 }); } });
    if (e && !e.tag) e.tag = '結末';
  }
  function finish(ctx) {
    var S = f(ctx), A = S.A, B = S.B;
    if (A === B) return;
    decideEnd(ctx);
    S.G.forEach(function (g) { g.gone = false; g.fate = g.outside ? 'デート先で出くわした住人（名簿から）' : S.c3role === 'double' ? 'ダブルデートの相手' : 'デート先で出くわした人'; g.fateNote = ''; });
    var plans = S.plans.map(function (P) {
      var ds = [], seen = {}; P.slots.forEach(function (sl) { if (!seen[sl.d.id]) { seen[sl.d.id] = 1; ds.push(sl.d.name); } });
      return { k: P.k + 1, dests: ds, ids: P.slots.map(function (sl) { return sl.p + ':' + sl.d.id + ':' + sl.n; }), cost: P.cost, bud: P.bud, len: P.len, mode: P.mode, planner: P.planner.i, beh: P.beh.k, odd: P.beh.odd, month: P.month, miss: P.miss ? P.miss.d.id : '', bday: P.bday ? P.bday.i : null, trip: P.trip };
    });
    ctx.flags.date = { n: S.n, a: A.i, b: B.i, rel: RK_NAME[S.rk], rk: S.rk, grp: S.grp, love: S.love, cohab: S.cohab, plans: plans, gone: S.goneDays || [], fights: S.fights, kaeru: S.kaeru, kiss: S.kissN, heat: S.heatN, visits: S.visits, outN: S.outN || 0, branches: S.branches, climax: S.climax, endK: S.endK, end: endName(S), score: S.endScore, sex: S.sex, odd: S.odd, behs: S.behs, c3role: S.c3role || '', cnt: S.cnt, entries: S.entries, forms: S.forms };
    A.fate = 'デートした人'; A.fateNote = B.name + 'と' + S.n + '回の' + S.dword;
    B.fate = 'デートした人'; B.fateNote = A.name + 'と' + S.n + '回の' + S.dword;
    ctx.flags.outcome = A.name + 'と' + B.name + 'の' + S.n + '回の' + S.dword + '――' + endName(S);
  }
  if (HK.PairCast) HK.PairCast.install(ID, couple, 'date');
  if (HK.Endings) HK.Endings[ID] = function (res, X) {
    var R = res.end && res.end.date, lines = [];
    if (!R) return { headline: res.outcome || '', stats: [], lines: [] };
    var a = X.nm(R.a), b = X.nm(R.b);
    lines.push(R.n + '回の' + (R.love ? 'デート' : 'お出かけ') + '（' + a + 'と' + b + '・' + R.rel + (R.cohab ? '・一緒に暮らしている' : '') + '）');
    R.plans.forEach(function (p) {
      var gone = R.gone.indexOf(p.k - 1) >= 0;
      lines.push('DAY' + p.k + '（' + p.month + '月）：' + p.dests.join('→') + '（' + LEN_NAME[p.len] + '・' + MOVE_NAME[p.mode] + '・予算' + yen(p.bud) + '／最低' + yen(p.cost) + '・計画：' + X.nm(p.planner) + '＝' + BEH_NAME[p.beh] + (p.odd ? '（らしくない）' : '') + '）' + (gone ? '　※喧嘩で途中で帰った' : '') + (p.bday != null ? '　※' + X.nm(p.bday) + 'の誕生日' : ''));
    });
    var br = Object.keys(R.branches || {}).filter(function (k) { return R.branches[k] > 0; }).map(function (k) { return BR_NAME[k] + ' ' + R.branches[k] + '回'; });
    if (br.length) lines.push('夜：' + br.join('／'));
    lines.push('喧嘩 ' + R.fights + '回' + (R.kaeru ? '（途中で帰った ' + R.kaeru + '回）' : '') + (R.kiss ? '／キス ' + R.kiss + '回' : '') + (R.visits ? '／ほかの人との出来事 ' + R.visits + '回' : '') + (HK.SAFE_ON ? '' : '／エッチ ' + R.sex + '回'));
    lines.push('山場：最後の帰り道（' + (CL_NAME[R.climax] || '') + '）');
    lines.push('結末：' + R.end);
    X.C.forEach(function (c) { c.afterDone = true; });
    return { headline: (res.outcome || '') + '。', stats: [['回数', R.n + '回'], ['喧嘩', R.fights + '回'], ['結末', R.end]].concat(HK.SAFE_ON ? [] : [['エッチ', R.sex + '回']]), lines: lines };
  };
  HK.Date = { okText: okText, pickT: pickT, relPick: relPick, attPick: attPick, per: per, fill: fill, RK_NAME: RK_NAME, BR_NAME: BR_NAME, has: has, yen: yen, rcat: rcat };
  HK.SCENARIOS[ID] = scen;
  if (HK.Lewd && HK.Lewd.install) HK.Lewd.install(ID, { lenDef: 'mix', desc: HK.SAFE_BUILD ? '' : '夜の場面の描き方。ほのめかす＝ぼかした一文と翌朝だけ／ほどほど＝描写する／濃い＝果てたあと、もう一度求め合うところまで' });
})();
