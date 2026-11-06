/* デートの日々（追加パック set-b の 3 部屋目。日常型。両方のビルド。2026-11-03。設計は docs/reports/2026-11-03/date-design.md）
   二人が 1〜10 回のデートを重ねる日々を、デートごとに 午前・午後・夜 の3区切りで眺める。部屋の中心は「行き先」（約 50 か所。HK.DatePlaces）。
   ・行き先ごとに、めぐるスポット・出来事・トラブル・食事の文を持ち（date-places-*.js）、汎用の出来事（date-text-*.js の GEN）と混ぜる
   ・大きさ：大型 L（遊園地・おうちデート・宇宙旅行など。一日一か所だけ）／中 M（午前はここ、午後はここ と組める）／人や予算で変わる V（ショッピングなど）。
     旅行（trip）は泊まりで、夜は旅先の宿。夜の行き先（night：花火・夜景・イルミネーション・ディナー・縁日）は夜の区切りに回す
   ・デートの長さ（半日・一日・朝から夜まで）でめぐるスポットの数が変わる。移動（電車・車。遠出は飛行機・新幹線、宇宙はロケット）と道中の出来事
   ・予算（一回あたり）：行き先ごとの最低金額。予算を超えるプランは組まない。行き先を決めていないときは予算と傾向から自動（バカ高いと海外旅行や宇宙）
   ・性格で分かれる行動（計画する人）：完璧に計画する／行き当たりばったり／相手に合わせる／張り切って空回りする（態度9種・気質で選び、運命の揺らぎでらしくない方に）
   ・関係は名簿の二人の関係のまま（初対面・友人・恋人・夫婦・片想い・両片想い・元恋人・不仲・家族…）。関係ごとに導入・山場・結末が分かれる
   ・性欲が高まるとデート中にやらしい雰囲気（人目を盗んだキス＝HK.Kiss）。喧嘩（場合によってはその日のデートが途中で終わる）
   ・他の住人（登場を許可していれば、デートごとに 1 割ほど）：ばったり出くわす（恋人が嫉妬）／後日「〇〇で見たよ」。三人目の参加者は「ばったり会う側」か「ダブルデートの側」
   ・不具合リスト 1104 の直し（設計の 10 章）：回数 1 回から（帰り道の分かれ道 oneDrama）・段取りのある行き先の段（date-phase.js）・舞台に合わない汎用の出来事を出さない（date-setting.js）・家族の結末は血縁＋様子
   ・2 回目の直し（2026-11-04。設計の 9 章）：参加は 4 人まで（4 人＝二組のダブルデート、3 人＝三人デート）・行き先ごとの山場・ときめき・お金をかけたデート・目標（短期・中期）
   ・山場：最後のデートの行き先の山場か、帰り道（観覧車・駅の改札・車の中・宿・家の前）。結末：付き合い始める／初めてのお泊まり／友人に戻る／プロポーズ／今の関係のまま
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
/* @event scen=set-b-date id=dt_climax_dest cat=romance tie=- label=最後のデートの行き先で本音を話す */
/* @event scen=set-b-date id=dt_toki cat=romance tie=- label=ふとした瞬間に胸が高鳴るときめき */
/* @event scen=set-b-date id=dt_budget cat=bond tie=- label=予算に合わせたデートの一幕 */
/* @event scen=set-b-date id=dt_beh_ok cat=bond tie=- label=空回りや行き当たりばったりが成功に転ぶ */
/* @event scen=set-b-date id=dt_fight_carry cat=conflict tie=- label=仲直りを次のデートに持ち越す */
/* @event scen=set-b-date id=dt_rich cat=bond tie=- label=予算をかけたありえない豪華なデート */
/* @event scen=set-b-date id=dt_rich_pro cat=romance tie=lover label=お金をかけた演出でプロポーズする */
/* @event scen=set-b-date id=dt_goal cat=bond tie=- label=デートの日々に向けたそれぞれの目標 */
/* @event scen=set-b-date id=dt_dbl_meet cat=bond tie=- label=二組でダブルデートに出かける */
/* @event scen=set-b-date id=dt_dbl_warm cat=bond tie=- label=ダブルデートで二組が仲良く過ごす */
/* @event scen=set-b-date id=dt_dbl_rub cat=bond tie=- label=ダブルデートで二組が張り合う */
/* @event scen=set-b-date id=dt_dbl_nadame cat=bond tie=- label=もう一組の喧嘩をなだめる */
/* @event scen=set-b-date id=dt_dbl_betsu cat=bond tie=- label=夜は二組に分かれて別行動にする */
/* @event scen=set-b-date id=dt_trio_meet cat=bond tie=- label=三人そろってデートに出かける */
/* @event scen=set-b-date id=dt_trio_tri cat=bond tie=- label=三人のデートで想いがすれ違う */
/* @event scen=set-b-date id=dt_trio_friend cat=bond tie=- label=友人も混ざった三人のお出かけ */
/* @event scen=set-b-date id=dt_trio_poly cat=bond tie=- label=三人の恋人たちのデート */
/* @event scen=set-b-date id=dt_trio_part cat=bond tie=- label=三人目が先に帰って二人になる */
/* @event scen=set-b-date id=dt_trio_end cat=bond tie=- label=三人のデートの日々の締めくくり */
/* @event scen=set-b-date id=dt_one cat=romance tie=- label=一回だけのデートの帰り道の分かれ道 */
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
    /* 住人の設定で恋愛相手を互いに固定し合った輪（二人のどちらかが、互いに固定し合った相手を二人以上持つ。三人・四人のとき）は、恋人として扱う
       （2026-11-05 同居生活と同じ決まり。通し読み：四人の夜のあとの最後の日に告白していた） */
    if (best !== 'spouse' && best !== 'lover' && ringLock(ctx, A, B)) best = 'lover';
    return best;
  }
  function ringLock(ctx, A, B) {
    var mu = function (x, y) { return !!(HK.lockTo && HK.lockTo(x, y) && HK.lockTo(y, x)); };
    if (!A || !B || !mu(A, B)) return false;
    var hub = function (h) { return ctx.chars.filter(function (o) { return o !== h && mu(h, o); }).length >= 2; };
    return hub(A) || hub(B);
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
    { re: /冬の|冬らし|マフラー|手袋|息が白|吐く息が白|こたつ|イルミネーション|クリスマス|かじかん/, m: [11, 12, 1, 2, 3] },
    /* 雪は真冬だけ（11 月の金木犀と同じ午後に雪の結晶、を出さない。雪国の行き先は 11・3 月も）。2026-11-05 */
    { re: /雪(?!見|だるま祭)/, m: [12, 1, 2], snowy: [11, 12, 1, 2, 3] },
    /* 緑の景色は春から秋（12 月に「緑の景色」を出さない） */
    { re: /緑の景色|青々|緑がまぶし|若葉|緑の芝|緑の木陰/, m: [4, 5, 6, 7, 8, 9, 10] }
  ];
  /* 雪の降らない行き先（沖縄・海外のリゾート・宇宙・船の上）と、雪国の行き先 */
  var NO_SNOW = /^(okinawa|uchu|cruise|umi|pool)$/, SNOWY = /^(hokkaido|ski|aurora)$/;
  /* 時間帯の語（その区切りに合わない文は使わない。2026-11-05 報告「クルーズで夜の劇場が午前・朝のビュッフェが昼」「花火大会の午前に線香花火」「謎解きの午前に最後の扉」） */
  var TIME_RE = [
    { re: /(?<!明日の|翌|今|毎|次の|昨日の)朝(?!から|まで|晩|方まで)|朝食|朝ご飯|朝ごはん|モーニング|朝日|朝もや|朝の光|早朝/, at: /am|mv/ },
    { re: /夜は|夜の(?!予定)|夜空|星空|夜風|線香花火|ライトアップ|月明かり|ナイター|ディナー|夕食|晩ご飯|晩ごはん|最初の一発|打ち上げ花火|夜店|夜市|夜の部/, at: /ev/ },
    { re: /夕日|夕焼け|夕暮れ|日が沈|日暮れ|西日/, at: /pm|ev/ },
    { re: /最後の(?:扉|部屋|謎|一発|一枚|乗り物|アトラクション|演目|曲)|帰り道の|帰りぎわ|締めくくり/, at: /pm|ev/ },
    /* 2026-11-05 通し読み：午前に「夜景を見ながらグラスを傾けた」「帰還の準備」「帰り際、次の約束」、夜に「昼は…ソーキそば」「昼ご飯は出前のピザ」、午後に「おはよう」 */
    { re: /夜景|グラスを傾け/, at: /ev/, night: true },
    { re: /帰り際|帰還の準備|別れ際|地上に戻る前の夜/, at: /pm|ev/ },
    { re: /^昼は|昼ご飯|昼ごはん|お昼ご飯|ランチ|昼下がり/, at: /am|pm|mv/ }
  ];
  var MORN_Q = /「おはよう/;
  function timeOk(S, t) {
    var d = S && S.day; if (!d || !d.part) return true;
    var n = String(t).replace(/「[^」]*」/g, '');
    var Dn = d.cur || (d.P && d.P.main), nightD = !!(Dn && (Dn.set || []).indexOf('night') >= 0);
    for (var i = 0; i < TIME_RE.length; i++) if (TIME_RE[i].re.test(n) && !TIME_RE[i].at.test(d.part) && !(TIME_RE[i].night && nightD && d.part === 'pm')) return false;
    if (MORN_Q.test(t) && !/am|mv/.test(d.part)) return false;
    /* 最初の部屋・最初の謎は、その日の同じ行き先で「最後の」が出たあとには出さない */
    if (/最初の(?:部屋|謎|扉|一発)/.test(n) && d.lastSeen && d.lastSeen[(d.cur || d.P.main || {}).id]) return false;
    return true;
  }
  var ONE_NG = /この何回か|何回かで|重ね|日々|毎回|回ずつ|休みのたびに|出かけるたび|会うたび|何度か一緒|最初の日|前の\{date\}|前のデート/;
  function seaOk0(S, t) { var m = S && S.day ? S.day.P.month : S && S.m0 || 0, D = S && S.day && (S.day.cur || S.day.P.main); if (!m) return true; for (var i = 0; i < SEA_RE.length; i++) { var ms = SEA_RE[i].snowy && D && SNOWY.test(D.id) ? SEA_RE[i].snowy : SEA_RE[i].m; if (SEA_RE[i].re.test(t) && ms.indexOf(m) < 0) return false; } return true; }
  function seaOk(S, t) {
    if (!seaOk0(S, t)) return false;
    var dd = S && S.day, D = dd && (dd.cur || dd.P.main), m = dd ? dd.P.month : S && S.m0 || 0;
    if (D && /雪(?!見)/.test(t) && NO_SNOW.test(D.id)) return false;
    return true;
  }
  function okText(ctx, x, a, b, o) {
    var S = f(ctx);
    if (typeof x !== 'string') return false;
    if (S && !S.love && DROM.test(x)) return false;
    if (S && !S.couple && COUPLE_RE.test(x.replace(/「[^」]*」/g, '').replace(/\{c\}の恋人/g, ''))) return false;
    if (S && S.rk !== 'spouse' && !(o && o.wed) && WED.test(x)) return false;
    if (S && S.fwb && /友人|友達|親友|友情/.test(x.replace(/「[^」]*」/g, ''))) return false;
    if (S && !seaOk(S, x)) return false;
    if (S && !timeOk(S, x)) return false;
    /* 一緒に暮らしている二人に、別々の家に帰る前提の文を出さない（暮らしていない二人に、同じ家に帰る文を出さない） */
    if (S && S.cohab && /家まで送|それぞれの家|別々の家|上がっていく|家の前で別れ|自分の部屋へ帰|駅で別れ|\{[ab]\}の(?:家|部屋)|住む町/.test(x)) return false;
    if (S && !S.cohab && /二人の家|同じ家に帰|一緒に暮らす|うちに帰ろう/.test(x)) return false;
    /* 一緒に暮らす二人に、待ち合わせの前提の地の文を出さない（同じ家から出かける二人の「待ち合わせの一時間前から」。2026-11-05。待ち合わせをわざとする文は「」の中で言う） */
    if (S && S.cohab && /待ち合わせ/.test(x.replace(/「[^」]*」/g, '')) && !/待ち合わせしよう|待ち合わせを/.test(x)) return false;
    if (!K.choreOk(x, a, b)) return false;
    /* 一回だけのデートに、回を重ねる前提の文を出さない */
    if (S && S.n === 1 && ONE_NG.test(x)) return false;
    /* 家族・血縁の二人に、友人向けの文を出さない */
    if (S && /^(fam|pfam)$/.test(S.rk) && /友人|友達|友だち|親友/.test(x.replace(/「[^」]*」/g, ''))) return false;
    /* 一緒に暮らす二人の汎用の出来事に「待ち合わせ」を出さない */
    if (S && S.cohab && o && /^GEN\./.test(o.key || '') && /待ち合わせ/.test(x)) return false;
    /* 舞台に合わない汎用の出来事を出さない（date-setting.js。宇宙で交番・海で傘 など） */
    if (o && o.D && HK.DateSet && !HK.DateSet.ok(o.D, x, o.key, o.part)) return false;
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
  function relList(T, S) { if (!T) return []; if (S.fwb && T.fwb) return T.fwb.concat(T.all || []); return (S.rkKey && T[S.rkKey] || []).concat(T[S.rk] || [], S.feud && T.feud || [], T[S.grp] || [], T.all || []); }
  function relPick(ctx, T, a, b, rep, o) {
    var S = f(ctx), own = T ? (S.fwb && T.fwb ? T.fwb : (S.rkKey && T[S.rkKey] ? T[S.rkKey] : []).concat(T[S.rk] || [], S.feud && T.feud || [], T[S.grp] || [])) : [];
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
    /* プロポーズ・見返す目標のある二人は、予算を一段上げることがある */
    if ((hasGoal(S, 'propose') || hasGoal(S, 'mikaesu')) && ctx.rng() < 0.45) return HK.weighted(ctx.rng, [[100000, 0.6], [1000000, 0.3], [100000000, 0.1]], function (x) { return x[1]; })[0];
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
    /* 目標：知りたい・本音を聞きたい人は話せる場所・本音の出る場所、楽しませたい・好きになってもらいたい人は遊ぶ場所、
       プロポーズしたい人は景色・夜の場所と高い行き先、思い出を作りたい人は遠出、距離を縮めすぎたくない人は泊まりとおうちを避ける */
    goalKinds(S).forEach(function (g) {
      if (/^(shiru|honne)$/.test(g)) w *= TALK_D.test(d.id) ? 2.4 : LOUD_D.test(d.id) ? 0.5 : 1;
      else if (/^(tanoshi|suki)$/.test(g)) w *= d.kind === 'fun' ? 1.9 : 1;
      else if (g === 'propose') w *= (has(d, 'view') || has(d, 'night') ? 2.4 : 1) * (d.cost >= 30000 ? 1.8 : 1);
      else if (g === 'omoide') w *= d.trip || has(d, 'view') ? 1.8 : 1;
      else if (/^(kyori|tomodachi)$/.test(g)) w *= d.trip || d.id === 'ouchi' ? 0.3 : 1;
      else if (g === 'mikaesu') w *= d.cost >= 15000 ? 1.5 : 1;
    });
    return w;
  }
  var TALK_D = /^(cafe|picnic|boat|honya|jinja|onsen|tenbo|bijutsukan|planetarium|kamakura|kyoto|hiking|momiji|hotel|camp|glamping|dinner|suizokukan|tsuri)$/;
  var LOUD_D = /^(karaoke|live|yakyu|yuenchi|themepark|bowling|pool|nazotoki|boulder)$/;
  /* 一組目の二人（と、二組目の二人）の中期の目標の種 */
  function goalKinds(S) {
    var out = [], add = function (T) { if (!T || !T.goal) return; [T.A, T.B].forEach(function (c) { var g = T.goal[c.i]; if (g && g.m) out.push(g.m.k); }); };
    add(S); if (S && S.p2) add(S.p2);
    return out;
  }
  function gkOf(S, c) { var g = S && S.goal && c && S.goal[c.i]; return g && g.m ? g.m.k : ''; }
  function hasGoal(S, k) { return goalKinds(S).indexOf(k) >= 0; }
  /* 一回のデートのプラン：slots＝[{ p: 'am'|'pm'|'ev', d: 行き先, n: スポットの数 }] */
  function planDate(ctx, S, k, used) {
    var env = ctx.env, P = PL(), list = P.list, bud = budgetOf(ctx, S, k), len = lenOf(ctx, k), mon = monthOf(S, k);
    /* 必ず行く行き先の回：予算・長さが「おまかせ」なら、その回は行き先に合わせる（貯めておいた予算・一日がかり。2026-11-05 報告「宇宙旅行が取っておくのまま 3 回とも行かない」） */
    if (k === S.forcedAt && S.forced) {
      if ((!env.budget || env.budget === 'auto') && S.forced.cost > bud) bud = S.forced.cost;
      if ((!env.len || env.len === 'auto') && len === 'half' && (S.forced.trip || S.forced.size === 'L')) len = S.forced.trip || S.forced.size === 'L' ? 'long' : 'day';
    }
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
  function behOf(ctx, c, S) {
    var fix = pickOfChar(ctx, c, 'style');
    if (fix && BEH_NAME[fix]) return { k: fix, odd: false };
    var t = c.tr || {}, base = BEH_FIT[per(c)] || 'awase';
    var kp = (t.cp || 0.5) * 0.6 + (t.a != null ? t.a : 0.5) * 0.4, bt = (t.impulse || 0.4) * 0.7 + (1 - (t.cp || 0.5)) * 0.3, aw = (t.ac || 0.5) * 0.6 + (t.np || 0.5) * 0.3, km = (LF.clumsy(c) ? 0.5 : 0) + (t.fc || 0.5) * 0.4 + (1 - (t.a != null ? t.a : 0.5)) * 0.3;
    /* 目標：好きになってもらいたい・見返したい・プロポーズしたい人は張り切る（完璧な計画か空回り）、楽しませたい人は行き当たりばったりも */
    var gk = S && S.goal && S.goal[c.i] && S.goal[c.i].m ? S.goal[c.i].m.k : '';
    if (/^(suki|mikaesu|propose)$/.test(gk)) { kp += 0.22; km += 0.3; aw -= 0.15; }
    if (gk === 'tanoshi') bt += 0.15;
    if (gk === 'kyori') aw += 0.15;
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
    C.forEach(function (c) { if (ok.length < 2 && ok.indexOf(c) < 0 && !/^(guest|double|pair2|trio)$/.test(partOf(input, c.i) || '')) ok.push(c); });
    C.forEach(function (c) { if (ok.length < 2 && ok.indexOf(c) < 0 && !/^(guest|double)$/.test(partOf(input, c.i) || '')) ok.push(c); });
    C.forEach(function (c) { if (ok.length < 2 && ok.indexOf(c) < 0) ok.push(c); });
    return ok.slice(0, 2);
  }
  /* 恋愛にしてよい二人（家族・恋愛対象が合わない・「恋愛：なし」の関係などは外す） */
  function loveOk(ctx, x, y) {
    if (!canLove2(ctx, x, y)) return false;
    if (/^(fam|pfam)$/.test(relKind(ctx, x, y))) return false;
    if (ctx.romanceOk && !ctx.romanceOk([x, y], false)) return false;
    return true;
  }
  var TIE_W = { spouse: 10, lover: 10, almost: 7, crush: 6, ex: 3, lovehate: 2 };
  function tieW(ctx, x, y) { var k = relKind(ctx, x, y); return (TIE_W[k] || 0) + (loveOk(ctx, x, y) ? 1 : 0); }
  /* 四人：二組のダブルデート。組み分けは立場（一組目＝デートする二人／二組目）の設定、おまかせは関係と恋愛対象から。二組とも恋愛にしてよい組だけ */
  function pairs4(ctx, P, input) {
    var pr = P.map(function (c) { return partOf(input, c.i) || ''; });
    var W = [[[0, 1], [2, 3]], [[0, 2], [1, 3]], [[0, 3], [1, 2]]], best = null, bv = -1e9;
    /* 二組とも関係のある組み分けがあれば、その組み分けだけを見る（関係のある二人を、知らない人と組ませて引き離さない） */
    var tied = function (w) { return w.every(function (p) { return (HK.Ties && HK.Ties.all ? HK.Ties.all(ctx, P[p[0]], P[p[1]]) || [] : []).some(function (t) { return t && t.type !== 'noobs'; }); }); };
    if (W.some(tied)) W = W.filter(tied);
    W.forEach(function (w) {
      var g = w.map(function (p) { return [P[p[0]], P[p[1]]]; });
      /* 立場で決めた組は崩さない */
      var fixed = ['pair', 'pair2'].every(function (k) { var m = P.filter(function (c, i) { return pr[i] === k; }); if (m.length < 2) return true; return g.some(function (q) { return q.indexOf(m[0]) >= 0 && q.indexOf(m[1]) >= 0; }); });
      if (!fixed || !g.every(function (q) { return loveOk(ctx, q[0], q[1]); })) return;
      var v = tieW(ctx, g[0][0], g[0][1]) + tieW(ctx, g[1][0], g[1][1]);
      /* 恋人どうしを別の組に分けない */
      [[g[0][0], g[1][0]], [g[0][0], g[1][1]], [g[0][1], g[1][0]], [g[0][1], g[1][1]]].forEach(function (q) { if (/^(spouse|lover)$/.test(relKind(ctx, q[0], q[1]))) v -= 9; });
      if (v > bv) { bv = v; best = g; }
    });
    if (!best) return null;
    /* 一組目：立場で「二組目」を選んだ人のいない組（おまかせは並びの先の人の組） */
    var p2 = best.filter(function (q) { return q.some(function (c) { return partOf(input, c.i) === 'pair2'; }); })[0];
    if (p2 && best[0] === p2) best = [best[1], best[0]];
    else if (!p2 && P.indexOf(best[1][0]) < P.indexOf(best[0][0])) best = [best[1], best[0]];
    return best.map(function (q) { return P.indexOf(q[0]) <= P.indexOf(q[1]) ? q : [q[1], q[0]]; });
  }
  /* 配役：二人／三人デート／ダブルデート。合わないときは、二人＋ばったり会う側に落とし、理由を残す */
  function castOf(ctx, C) {
    var inp = ctx.input, P = C.filter(function (c) { return !pickOfChar(ctx, c, 'outside'); });
    var guestish = function (c) { return /^(guest|double)$/.test(partOf(inp, c.i) || ''); };
    var cp = couple(C, inp), res = { A: cp[0], B: cp[1] || cp[0], mode: 'pair', ng: '' };
    if (P.length >= 4) {
      var four = P.slice(0, 4);
      if (four.some(guestish)) { res.ng = '立場で「ばったり会う側」を選んだ人がいるので、ダブルデートにしなかった'; return res; }
      var g = pairs4(ctx, four, inp);
      if (!g) { res.ng = '四人を、二組とも恋愛にしてよい組に分けられなかった（家族どうし・恋愛対象が合わない組など）'; return res; }
      res.mode = 'double'; res.A = g[0][0]; res.B = g[0][1]; res.C = g[1][0]; res.D = g[1][1];
      return res;
    }
    if (P.length === 3) {
      var rest = P.filter(function (c) { return c !== res.A && c !== res.B; })[0];
      if (!rest || guestish(rest)) return res;
      if (HK.Ties && HK.Ties.apathy && [res.A, res.B].some(function (x) { return HK.Ties.apathy(ctx, rest, x) || HK.Ties.apathy(ctx, x, rest); })) { res.ng = '三人目が二人のどちらかに無関心なので、三人デートにしなかった'; return res; }
      /* 立場で二人を決めていなければ、三人のうち関係のいちばん強い二人をデートの中心に */
      if (P.filter(function (c) { return partOf(inp, c.i) === 'pair'; }).length < 2) {
        var bestP = [res.A, res.B], bw = tieW(ctx, res.A, res.B);
        [[P[0], P[2]], [P[1], P[2]], [P[0], P[1]]].forEach(function (q) { var w = tieW(ctx, q[0], q[1]); if (w > bw) { bw = w; bestP = q; } });
        res.A = bestP[0]; res.B = bestP[1]; rest = P.filter(function (c) { return c !== res.A && c !== res.B; })[0];
      }
      res.mode = 'trio'; res.C = rest;
    }
    return res;
  }

  /* ---------- 箱庭 ---------- */
  var scen = {
    id: ID, name: 'デートの日々', kicker: 'ふたり・デート',
    desc: '二人が何度かのデートを重ねる日々を、デートごとに午前・午後・夜で眺める。遊園地・水族館・おうちデート・京都・北海道・宇宙旅行まで、行き先は五十か所ほど。行き先ごとにめぐる場所も、起きることも、食べるものも変わる。完璧な計画、行き当たりばったり、張り切りすぎの空回り――二人の性格と関係と目標で、同じ遊園地でも毎回違う一日になる。三人ならにぎやかな三人デート、四人なら二組のダブルデート。最後のデートの行き先や帰り道で、二人の関係が少し動く。',
    note: '※参加は4人まで。二人の関係は、住人の関係の設定のまま使います（初対面・友人・恋人・夫婦・片想い・家族なども遊べます。恋愛にならない関係では「お出かけ」になり、恋愛の結末は出ません）。3人なら三人デート（三角関係・友人が混ざる・三人の恋人）、4人なら二組のダブルデートになります（二組とも恋愛にしてよい組に分けられないときは、二人のデートと「ばったり会う側」になります）。登場人物はすべて成人として扱います。',
    unit: '回', perUnit: 3, preRel: 0, lethal: false, minCast: 2, maxCast: 4,
    catBias: { romance: 1.2, bond: 1.2, help: 1, conflict: 0.3, combat: 0, betray: 0, kill: 0 },
    decay: 0.998, actRate: 0.06,
    derived: ['warmth', 'honesty', 'jealous', 'impulse'],
    env: [
      { id: 'count', label: 'デートの回数', min: 1, max: 10, def: 5, lo: '1回', hi: '10回', unit: '回', desc: 'デートを重ねる回数。1回は午前・午後・夜の3区切り。最後のデートの帰り道か行き先が山場になる。1回だけなら、その一日の帰り道に手をつなぐ・キス・次の約束・告白などの分かれ道がある' },
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
      { id: 'part', label: '立場', auto: 'おまかせ（3人なら三人デート、4人なら関係と恋愛対象から二組に分ける）', options: [{ id: 'pair', label: 'デートする二人（一組目）' }, { id: 'pair2', label: 'ダブルデートのもう一組（4人のとき）' }, { id: 'trio', label: '三人デートの三人目（3人のとき）' }, { id: 'guest', label: 'ばったり会う側' }, { id: 'double', label: 'ダブルデートの側（三人目と、名前の出ない恋人）' }] },
      { id: 'goalM', label: '目標（デートの日々を通して）', auto: 'おまかせ（関係・態度・好意から）', options: [{ id: 'propose', label: 'プロポーズする（恋人・夫婦）' }, { id: 'tsukiau', label: '付き合う' }, { id: 'kokuhaku', label: '想いを伝える' }, { id: 'suki', label: '好きになってもらう' }, { id: 'nakayoku', label: 'もっと仲良くなる' }, { id: 'shiru', label: '相手のことを知る' }, { id: 'honne', label: '本音を聞き出す' }, { id: 'tanoshi', label: '相手を楽しませる' }, { id: 'omoide', label: '思い出を作る' }, { id: 'kyori', label: '距離を縮めすぎない' }, { id: 'tomodachi', label: '友人のままでいる' }, { id: 'mikaesu', label: '見返す（元恋人・不仲・ライバル）' }, { id: 'yarinaoshi', label: 'やり直す（元恋人）' }] },
      { id: 'style', label: '計画の仕方', auto: 'おまかせ（性格から）', options: [{ id: 'kanpeki', label: '完璧に計画する' }, { id: 'batari', label: '行き当たりばったり' }, { id: 'awase', label: '相手に合わせる' }, { id: 'karamawari', label: '張り切って空回りする' }] },
      { id: 'drive', label: '運転', auto: 'おまかせ', options: [{ id: 'yes', label: '運転する（車のときはこの人が運転）' }, { id: 'no', label: '運転しない' }] },
      { id: 'role', label: '家事の得意さ', auto: 'おまかせ（気質から）', options: LF.ROLE.map(function (r) { return { id: r.v, label: r.label }; }) }
    ],
    actions: [{ id: 'live', label: 'いつもどおりに過ごす', fit: function () { return 0.5; } }],
    goals: [{ id: 'dt', label: '性格から決める', fit: function () { return 0.5; } }],
    stepGroup: function (label) { var m = /^(DAY\d+（.）)(.+)$/.exec(label); return m ? { group: m[1], sub: m[2] } : null; },
    steps: function (env) {
      var n = Math.max(1, Math.min(10, +env.count || 5)), s = [];
      for (var d = 0; d < n; d++) for (var t = 0; t < 3; t++) s.push('DAY' + (d + 1) + '（' + (d % 2 ? '日' : '土') + '）' + PART[t]);
      return s;
    },
    /* 本体の共通の出来事の相手：同じ組の相手だけ（三人の恋人どうしの三人デートは三人のあいだ） */
    othersFor: function (ctx, a) {
      var S = ctx.dt && (ctx.dt.root || ctx.dt); if (!S) return ctx.present().filter(function (c) { return c !== a; });
      var grp = [[S.A, S.B]].concat(S.p2 ? [[S.p2.A, S.p2.B]] : [], S.trio && S.trio.k === 'poly' ? [[S.A, S.B, S.trio.C]] : []);
      var mine = grp.filter(function (g) { return g.indexOf(a) >= 0; }).pop() || [];
      return ctx.present().filter(function (c) { return c !== a && mine.indexOf(c) >= 0; });
    },
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
  /* 本体の共通の出来事から外すもの：体の関係の出来事・合意のない展開・三人以上の恋愛・告白（結末で扱う）など。
     関係を条件にした出来事（tie_*・rt_*・同一人物・恐怖の和らぎ・関係ごとのキス kiss_*）と、関係の段階に寄りかかった小さな出来事（目で追う glance・指先が触れる touch・
     らしくない一面に近づく unl_spark・嫉妬 jealous）も外し、関係性ごとの出来事はこの部屋の文（date-rel.js の HK.DateRel）で出す（2026-11-06 利用者の指示「関係性ごとのイベントをその箱庭オリジナルイベントに差し替えて」）。
     残す小さな共通の出来事（関係を問わない）は設計の 14 章の一覧 */
  var EX_ID = /^(?:confess|take_charge|brood|lighten|mob_after|tie_|rt_|om_tie|attr_mirror_|fs_soften|kiss_|glance$|touch$|unl_spark$|jealous$|grp_|poly_|ct_|cf_)/;
  function exList() { return (HK.COMMON || []).filter(function (e) { return e.sex || e.force || EX_ID.test(e.id); }).map(function (e) { return e.id; }); }
  Object.defineProperty(scen, 'exclude', { get: exList, enumerable: true, configurable: true });

  /* ---------- 始まり ---------- */
  /* 一組ぶんの状態（ダブルデートの二組目も同じ形。行き先・使った文は一組目と分け合う） */
  function mkPair(ctx, A, B) {
    var rk = relKind(ctx, A, B);
    var S = { A: A, B: B, rk: rk, grp: RK_GRP[rk], sex: 0, lewdMax: 0, longN: 0,
      love: canLove2(ctx, A, B) && !/^(fam|pfam)$/.test(rk), couple: /^(spouse|lover)$/.test(rk), fights: 0, kaeru: 0, good: 0, kissN: 0, heatN: 0, visits: 0, odd: 0, tokiN: 0, richN: 0,
      behs: {}, branches: {}, entries: {}, forms: {}, cnt: {}, goal: {}, toki: {} };
    if (S.love && ctx.romanceOk && !ctx.romanceOk([A, B], false)) S.love = false;
    S.pine = S.love && /^(almost|crush)$/.test(rk);
    S.rkKey = relDir(ctx, A, B, rk);
    S.feud = FEUD_RK.test(rk);
    if (/^(fam|pfam)$/.test(rk)) S.famW = famWord(ctx, A, B);
    S.dword = S.love ? 'デート' : 'お出かけ';
    /* セフレ（体だけの関係の友人。2026-11-05 報告「セフレが気の合う友人どうしで始まり、目標が友人の一線を越える」）：関係ごとの文は fwb の文だけ、友人の語の文は出さない */
    S.fwb = rk === 'friend' && (HK.Ties && HK.Ties.all ? HK.Ties.all(ctx, A, B) || [] : []).some(function (t) { return t && t.type === 'fwb'; }) && !/^(lover|spouse)$/.test(rk);
    /* 性行為の相手に互いを指定し合っただけの二人（恋人・夫婦・家族でなく、恋愛相手の固定も無い。本体の HK.Quad.bodyOnly。R18版）：セフレと同じ扱いの「体だけ」の二人。
       夜は恋人どうしと同じ重みで起きる。恋愛は住人の設定どおりで、結末で恋人になれば END.koi.fwb（体から始まった二人が恋人に）（2026-11-06 利用者の指示「二人だとしても起きて欲しい」） */
    S.body = !HK.SAFE_ON && !/^(lover|spouse|fam|pfam)$/.test(rk) && !!(HK.Quad && HK.Quad.bodyOnly && HK.Quad.bodyOnly(ctx, A, B) && HK.bodyOK(A, B));
    if (S.body) S.fwb = true;
    /* 一緒に暮らしているか：夫婦はいつも、家族は半々、恋人はときどき（同棲） */
    S.cohab = rk === 'spouse' || (/^(fam|pfam)$/.test(rk) && ctx.rng() < 0.5) || (rk === 'lover' && ctx.rng() < 0.25);
    /* 誘った人（最初のデートを言い出した人）：片想いは想う側、ほかは気質（行動力・外向き）から */
    var tl = HK.Ties && HK.Ties.all ? HK.Ties.all(ctx, A, B) || [] : [], cr = tl.filter(function (t) { return /^(crush|yan)$/.test(t.type); })[0];
    S.inviter = cr && cr.a === B.i ? B : cr && cr.a === A.i ? A : ((A.tr.fc || 0.5) + (A.tr.np || 0.5) * 0.3 >= (B.tr.fc || 0.5) + (B.tr.np || 0.5) * 0.3 ? A : B);
    return S;
  }
  /* 三人デートの三人目と二人の関係：poly 三人とも恋人どうし／tri 三人目が二人のどちらかに想いを寄せる（三角）／friend 友人・家族などが混ざる */
  function trioKind(ctx, A, B, C) {
    /* 恋人（関係）か、互いに恋愛相手を固定し合った二人（住人の設定。2026-11-05 同居・新婚部屋と同じ輪の判定） */
    /* 性行為の相手に互いを指定し合っただけの組（HK.Quad.bodyOnly。R18版）も輪をつなぐ組に数え、体だけの三人の夜にする（body。2026-11-06 利用者の指示） */
    var bo = function (x, y) { return !HK.SAFE_ON && !!(HK.Quad && HK.Quad.bodyOnly && HK.Quad.bodyOnly(ctx, x, y) && HK.bodyOK(x, y)); };
    var lc = function (x, y) { return ((/^(spouse|lover)$/.test(relKind(ctx, x, y)) || !!(HK.lockTo && HK.lockTo(x, y) && HK.lockTo(y, x))) && loveOk(ctx, x, y)) || bo(x, y); };
    var bdy = !HK.SAFE_ON && !!(HK.Quad && HK.Quad.bodyRing && HK.Quad.bodyRing(ctx, [A, B, C]));
    if (lc(A, B) && lc(C, A) && lc(C, B)) return { k: 'poly', C: C, t: ctx.rng() < 0.5 ? A : B, body: bdy };
    /* 受けを中心にした輪（2026-11-05 利用者の報告「デートでも 3P を」）：恋人の組が二つ以上あり、残りの組が性的に対象にならない（攻めどうし・受けどうしなど）か
       輪の外側の組なら、三人の恋人として扱う。判定は本体の HK.Quad.ringOk（同居・新婚部屋と同じ。R18版）。全年齢では、残りの組が恋愛にならない組のとき */
    var L3 = [[A, B], [C, A], [C, B]], nL = L3.filter(function (q) { return lc(q[0], q[1]); }).length;
    if (nL >= 2 && (HK.Quad && HK.Quad.ringOk && !HK.SAFE_ON ? HK.Quad.ringOk(ctx, [A, B, C]) : L3.every(function (q) { return lc(q[0], q[1]) || !loveOk(ctx, q[0], q[1]); }))) {
      var hub = [A, B, C].filter(function (x) { return [A, B, C].every(function (y) { return y === x || lc(x, y); }); })[0];
      return { k: 'poly', C: C, t: lc(C, A) && lc(C, B) ? (ctx.rng() < 0.5 ? A : B) : lc(C, A) ? A : B, hub: hub || null, body: bdy };
    }
    var lt = function (x, y) { return /^(spouse|lover|almost|crush|ex|lovehate)$/.test(relKind(ctx, x, y)) && loveOk(ctx, x, y); };
    var tA = lt(C, A), tB = lt(C, B);
    if (tA || tB) return { k: 'tri', C: C, t: tA && tB ? (ctx.rng() < 0.5 ? A : B) : tA ? A : B };
    return { k: 'friend', C: C, t: (A.tr.np || 0.5) >= (B.tr.np || 0.5) ? A : B };
  }
  /* 二組目のプラン：行き先・長さ・移動は一組目と同じ（四人で出かける）。計画した人・運び方・運転・誕生日は二組目の二人から */
  function plans2(ctx, S2, plans) {
    return plans.map(function (P, k) {
      var Q = Object.create(P);
      Q.planner = plannerOf(ctx, S2, k); Q.beh = behOf(ctx, Q.planner, S2); Q.driver = null; Q.bday = null; Q.miss = null; Q.rich = null;
      return Q;
    });
  }
  function bdays(S) {
    [S.A, S.B].forEach(function (c) {
      var bm = +c.bmonth; if (!bm) return;
      for (var i = 0; i < S.n; i++) if (S.plans[i].month === bm && !S.plans[i].bday) { S.plans[i].bday = c; break; }
    });
  }
  /* 別の組の状態で動かす（ダブルデートの二組目。f(ctx) が返す状態を一時的に入れ替える） */
  function withPair(ctx, S2, fn) { var s0 = ctx.dt; ctx.dt = S2; try { return fn(); } finally { ctx.dt = s0; } }

  /* ---------- 始まり ---------- */
  function setup(ctx) {
    var C = ctx.chars, env = ctx.env, cast = castOf(ctx, C), A = cast.A, B = cast.B;
    var n = Math.max(1, Math.min(10, +env.count || 5));
    var mem = [A, B].concat(cast.C ? [cast.C] : [], cast.D ? [cast.D] : []);
    mem.forEach(function (c) {
      c.life = { job: '' };
      LF.role(ctx, c, pickOfChar(ctx, c, 'role'));
      LF.work(ctx, c, null);
    });
    var S = ctx.dt = mkPair(ctx, A, B);
    S.n = n; S.used = {}; S.mode = cast.mode; S.castNG = cast.ng; S.mem = mem;
    S.G = C.filter(function (c) { return mem.indexOf(c) < 0; });
    var S2 = null;
    if (cast.mode === 'double') { S2 = S.p2 = mkPair(ctx, cast.C, cast.D); S2.n = n; S2.used = S.used; S2.main = S; S2.root = S; S2.mode = 'double'; S2.G = []; }
    if (cast.mode === 'trio') { S.trio = trioKind(ctx, A, B, cast.C); S.trio.S = mkPair(ctx, cast.C, S.trio.t); S.trio.S.used = S.used; S.trio.S.n = n; S.trio.S.root = S; S.trio.cnt = {}; }
    /* 三人目：参加者（立場で選べる。おまかせは、二人のどちらかと恋愛の関係があればばったり会う側、なければダブルデートの側）と、名簿から来た住人（outside） */
    S.G.forEach(function (g) { g.gone = true; g.life = g.life || { job: '' }; if (pickOfChar(ctx, g, 'outside')) g.outside = true; });
    var gs = S.G.filter(function (g) { return !g.outside; }), c3 = gs[0] || null;
    if (c3) {
      var pr = partOf(ctx.input, c3.i), loveTie = (HK.Ties && HK.Ties.all ? (HK.Ties.all(ctx, c3, A) || []).concat(HK.Ties.all(ctx, c3, B) || []) : []).some(function (t) { return /^(lover|spouse|crush|yan|almost|ex|fiance|mate|honmei)$/.test(t.type); });
      /* ダブルデートは、恋愛にしてよい二人のときだけ（家族などの二人では、ばったり会う側になる）。四人がダブルデートにならなかったときは、ばったり会う側 */
      S.c3 = c3; S.c3role = !S.love || gs.length > 1 ? 'guest' : pr === 'double' && !loveTie ? 'double' : pr === 'guest' || loveTie ? 'guest' : 'double';
      S.c3crush = crushOn(ctx, c3, A, B);
      S.c3date = n <= 2 ? n - 1 : 1 + Math.floor(ctx.rng() * (n - 2));
      S.dbl = {}; if (S.c3role === 'double') { S.dbl[S.c3date] = 1; if (n >= 6) S.dbl[Math.min(n - 2, S.c3date + 2)] = 1; }
      if (gs[1]) { S.c4 = gs[1]; S.c4crush = crushOn(ctx, gs[1], A, B); S.c4date = S.c3date + 1 < n - 1 ? S.c3date + 1 : Math.max(0, S.c3date - 1); }
    }
    /* 季節：最初のデートの月と、デートの間隔（一〜二週間） */
    S.m0 = /^\d+$/.test(env.month) ? +env.month : 1 + Math.floor(ctx.rng() * 12);
    S.sday = Math.floor(ctx.rng() * 20); S.gap = n >= 7 ? 7 : ctx.rng() < 0.5 ? 7 : 14;
    S.forced = env.dest && env.dest !== 'auto' ? PL().by[env.dest] || null : null;
    S.forcedAt = S.forced ? Math.floor(ctx.rng() * n) : -1;
    /* 季節のある行き先は、季節の合う回に（合う回が無ければ乱数のまま、行けなかった段になる） */
    if (S.forced && S.forced.sea) { var okK = []; for (var q = 0; q < n; q++) if (seasonOk(S.forced, monthOf(S, q))) okK.push(q); if (okK.length) S.forcedAt = okK[Math.floor(ctx.rng() * okK.length)]; }
    /* 目標（短期・中期）：プランより先に決める（行き先・計画の仕方に効く） */
    goalsInit(ctx, S);
    if (S2) withPair(ctx, S2, function () { goalsInit(ctx, S2); });
    if (S.trio) withPair(ctx, S.trio.S, function () { goalsInit(ctx, S.trio.S, [S.trio.C]); });
    /* プラン（デートごと） */
    var used = {};
    S.plans = [];
    for (var k = 0; k < n; k++) {
      var P = planDate(ctx, S, k, used);
      P.planner = plannerOf(ctx, S, k);
      P.beh = behOf(ctx, P.planner, S);
      P.mode = moveOf(ctx, S, P);
      if (P.mode === 'car') P.driver = driverOf(ctx, S, P);
      S.plans.push(P);
    }
    /* 誕生日：住人の誕生月に当たる最初のデート（一人一回） */
    bdays(S);
    if (S.trio) S.trio.S.plans = S.plans;
    if (!HK.SAFE_ON && HK.DateR18 && HK.DateR18.quota) S.lewdMax = HK.DateR18.quota(ctx, env.lewdN);
    S.heat = HK.Pos && HK.Pos.libMul ? Math.min(2, HK.Pos.libMul([A, B])) : 1;
    if (S2) {
      ['m0', 'sday', 'gap'].forEach(function (k) { S2[k] = S[k]; });
      S2.plans = plans2(ctx, S2, S.plans); bdays(S2);
      /* エッチの回数の上限は一回の遊びで二組の合計（一組目に多めに分ける） */
      var q0 = S.lewdMax; S.lewdMax = Math.ceil(q0 / 2); S2.lewdMax = q0 - S.lewdMax; S2.heat = HK.Pos && HK.Pos.libMul ? Math.min(2, HK.Pos.libMul([S2.A, S2.B])) : 1;
    }
    ctx.place = 'デートの行き先';
    /* 導入：関係ごとの、デートを重ねることになったわけ */
    var Tx = TX(), inv = S.inviter, oth = inv === A ? B : A;
    /* 一回だけのデートは、その一日のための始まり（ONE_INTRO） */
    var it = (S.n === 1 && relPick(ctx, Tx.ONE_INTRO, inv, oth)) || relPick(ctx, Tx.INTRO, inv, oth, true) || '{a}は{b}を{date}に誘った。二人のお出かけが始まった。';
    var tx = fill(ctx, it, inv, oth, { n: S.n + '回' });
    var modeW = S.mode === 'double' ? '・二組のダブルデート' : S.mode === 'trio' ? '・三人デート（' + TRIO_NAME[S.trio.k] + '）' : '';
    ctx.act2({ actors: [inv, oth], cat: 'bond', text: tx, why: 'デートの日々：始まり（' + RK_NAME[S.rk] + '・' + inv.name + 'から誘った・' + S.n + '回' + modeW + '）' + (S.castNG ? '（' + S.castNG + '）' : '') });
    if (S2) dblIntro(ctx);
    if (S.trio) trioIntro(ctx);
    goalIntro(ctx, S);
    if (S2) withPair(ctx, S2, function () { goalIntro(ctx, S2); });
    if (S.trio) withPair(ctx, S.trio.S, function () { goalIntro(ctx, S.trio.S, [S.trio.C]); });
    S.cnt = {}; if (S2) S2.cnt = {};
  }
  function crushOn(ctx, c, A, B) { return (HK.Ties && HK.Ties.all ? (HK.Ties.all(ctx, c, A) || []).concat(HK.Ties.all(ctx, c, B) || []) : []).some(function (t) { return /^(crush|yan|almost)$/.test(t.type) && t.a === c.i; }); }

  /* ---------- 区切り ---------- */
  var REST_RATE = 1e-9;
  function newDay(S, d) { return { d: d, P: S.plans[d], over: false, spots: {}, ev: 0, gen: 0, trouble: 0, kiss: 0, fight: false, fightP: 0, visited: false, beh: false, last: d === S.n - 1, cur: null, toki: 0, k: {} }; }
  function phase(ctx, s) {
    var S = f(ctx), A = S.A, B = S.B, d = Math.floor(s / 3), t = s % 3;
    if (A === B) return;
    if (s === 0) {
      [S, S.p2, S.trio && S.trio.S].forEach(function (T) {
        if (!T) return;
        ctx.mod2(T.A, T.B, { aff: 4, trust: 2 }, { aff: 4, trust: 2 });
        T.rel0 = {}; T.rel0[T.A.i] = ctx.rel[T.A.i][T.B.i].aff + ctx.rel[T.A.i][T.B.i].att; T.rel0[T.B.i] = ctx.rel[T.B.i][T.A.i].aff + ctx.rel[T.B.i][T.A.i].att;
      });
    }
    scen.actRate = S.day && S.day.d === d && S.day.over ? REST_RATE : 0.06;
    if (t === 0) {
      S.day = newDay(S, d);
      if (S.p2) S.p2.day = newDay(S.p2, d);
      if (S.trio) S.trio.S.day = newDay(S.trio.S, d);
    }
    var day = S.day;
    day.part = ['am', 'pm', 'ev'][t];
    if (S.p2 && S.p2.day) S.p2.day.part = day.part;
    if (S.trio && S.trio.S.day) S.trio.S.day.part = day.part;
    if (day.over) return;
    if (t === 0) { goalDayStart(ctx, S, day); if (S.p2) withPair(ctx, S.p2, function () { goalDayStart(ctx, S.p2, S.p2.day); }); morning(ctx, day); }
    else if (t === 1) afternoon(ctx, day);
    else evening(ctx, day);
  }
  /* 追加の出来事（関係性ごと・性格・アクシデント・季節。date-more.js の HK.DateMore）に渡す部品 */
  function more(ctx, day, part) { if (HK.DateMore && HK.DateMore.run && day && !day.over) HK.DateMore.run(ctx, day, part, { f: f, setO: setO, lead2: lead2, pickT: pickT, relPick: relPick, attPick: attPick, fill: fill, per: per, rcat: rcat, cands: cands, relList: relList }); }
  /* 関係性ごとのデートの出来事（date-rel.js の HK.DateRel。dest＝行き先の段のあと／back＝帰り道／next＝次のデートの前） */
  function relEv(ctx, day, part) { if (HK.DateRel && HK.DateRel.run && day) HK.DateRel.run(ctx, day, part, { f: f, setO: setO, lead2: lead2, pickT: pickT, fill: fill, rcat: rcat, placeName: placeName }); }
  /* 文の中の行き先の名前（「高級ホテルで過ごす」のような動詞で終わる名前は、文に埋めるときの名詞 D.noun を使う。2026-11-05 通し読み「高級ホテルで過ごすの地図」） */
  function placeName(D) { return D ? D.noun || D.name : 'デートの行き先'; }
  /* その日の最初・最後の行き先（待ち合わせ・計画・行きの道中は最初、帰りは最後） */
  function firstD(P) { return P.slots.length ? P.slots[0].d : P.main; }
  function lastD(P) { return P.slots.length ? P.slots[P.slots.length - 1].d : P.main; }
  function slotOf(P, p) { return P.slots.filter(function (x) { return x.p === p; })[0] || null; }
  /* 文の {a}（その場面を引っ張る人）：計画した人か、相手 */
  function lead2(ctx, day) { var S = f(ctx), pl = day.P.planner || S.A; return ctx.rng() < 0.55 ? [pl, pl === S.A ? S.B : S.A] : [pl === S.A ? S.B : S.A, pl]; }

  function morning(ctx, day) {
    var S = f(ctx), A = S.A, B = S.B, P = day.P, Tx = TX();
    /* 前のデートを喧嘩で切り上げた：謝って仲直り（謝るのは、帰った人か、言い過ぎた人） */
    relEv(ctx, day, 'next');
    if (S.sorry) sorry(ctx, day);
    if (S.mita) mitaLater(ctx, day);
    if (S.c3 && S.c3role === 'guest' && S.c3mita && S.c3mita === day.d) c3Mita(ctx, day);
    if (S.c3 && day.d === Math.max(0, (S.c3role === 'double' ? S.c3date : S.c3date) - 1) && !S.c3ouen && ctx.rng() < 0.6) c3Ouen(ctx, day);
    if (P.miss) missLine(ctx, day);
    if (P.len === 'half') { prep(ctx, day); return; }
    startLines(ctx, day);
    toki(ctx, day, 'mv', 0.16);
    if (S.dbl && S.dbl[day.d]) doubleDate(ctx, day, 'start');
    visit(ctx, day, 'am');
    if (ctx.rng() < 0.3) gen(ctx, day);
    more(ctx, day, 'am');
    relEv(ctx, day, 'dest');
    toki(ctx, day, 'am', 0.2);
    if (S.p2) dblRun(ctx, day, 'am');
    if (S.trio) trioRun(ctx, day, 'am');
  }
  function afternoon(ctx, day) {
    var S = f(ctx), P = day.P;
    if (P.len === 'half') { startLines(ctx, day); if (S.dbl && S.dbl[day.d]) doubleDate(ctx, day, 'start'); }
    else lunch(ctx, day);
    var am = slotOf(P, 'am'), pm = slotOf(P, 'pm');
    if (am && pm && am.d !== pm.d) switchLine(ctx, day, am.d, pm.d);
    visit(ctx, day, 'pm');
    if (day.over) return;
    /* 計画した人の性格で分かれる行動・汎用の出来事・やらしい雰囲気・他の住人（順は乱数で） */
    var acts = [behave, gen, heat, others, budgetLine, function (c, d) { toki(c, d, 'pm', 0.3); }, function (c, d) { more(c, d, 'pm'); }, function (c, d) { relEv(c, d, 'dest'); }];
    for (var i = acts.length - 1; i > 0; i--) { var j = Math.floor(ctx.rng() * (i + 1)), x = acts[i]; acts[i] = acts[j]; acts[j] = x; }
    acts.forEach(function (fn) { if (!day.over) fn(ctx, day); });
    if (S.dbl && S.dbl[day.d] && !day.over) doubleDate(ctx, day, 'mid');
    if (S.p2 && !day.over) dblRun(ctx, day, 'pm');
    if (S.trio && !day.over) trioRun(ctx, day, 'pm');
    if (!day.over) fightCheck(ctx, day);
    if (S.p2 && !day.over) withPair(ctx, S.p2, function () { fightCheck(ctx, S.p2.day); });
  }
  /* 予算の一幕（その回の予算の段ごと。2026-11-05 報告「予算 10 万・3 千円が中身に出ない」）：一回のデートで一度、6 割ほど */
  var BUD_K = [[3000, 'b3k'], [10000, 'b1m'], [30000, 'b3m'], [100000, 'b10m'], [1000000, 'b100m'], [Infinity, 'b1oku']];
  function budgetLine(ctx, day) {
    var S = f(ctx), P = day.P, Tx = TX();
    if (day.budL || !P.bud || ctx.rng() > 0.6) return;
    var k = BUD_K.filter(function (x) { return P.bud <= x[0]; })[0][1], x = lead2(ctx, day), a = x[0], b = x[1];
    var t = relPick(ctx, (Tx.BUDGET_SCENE || {})[k] || {}, a, b);
    if (!t) return;
    day.budL = 1;
    ctx.act2({ actors: [a, b], cat: 'bond', text: fill(ctx, t, a, b, { dest: placeName(day.cur || P.main), yen: yen(P.bud) }), why: 'デートの日々：予算' + yen(P.bud) + 'の一日', fx: function () { ctx.mod2(a, b, { aff: 1 }, { aff: 1 }); } });
    S.cnt.budget = (S.cnt.budget || 0) + 1;
  }
  function evening(ctx, day) {
    var S = f(ctx), P = day.P;
    if (slotOf(P, 'ev')) { var ev0 = slotOf(P, 'ev'); if (slotOf(P, 'pm') && slotOf(P, 'pm').d !== ev0.d) switchLine(ctx, day, slotOf(P, 'pm').d, ev0.d); visit(ctx, day, 'ev'); }
    if (day.over) return;
    if (!day.beh && ctx.rng() < 0.5) behave(ctx, day);
    if (S.dbl && S.dbl[day.d]) doubleDate(ctx, day, 'end');
    more(ctx, day, 'ev');
    rich(ctx, day);
    if (P.bday) bday(ctx, day);
    else if (P.len === 'long' || P.trip || slotOf(P, 'ev') || ctx.rng() < 0.45) dinner(ctx, day);
    if (!day.kiss && !day.last && ctx.rng() < 0.4) heat(ctx, day);
    toki(ctx, day, 'ev', 0.22);
    if (S.p2) dblRun(ctx, day, 'ev');
    if (S.trio) trioRun(ctx, day, 'ev');
    /* 山場：最後のデートの行き先の山場（大型の遠出ほど選ばれやすい）か、帰り道の山場 */
    /* 一回・二回だけのデート：最後の日の帰り道の分かれ道（手をつなぐ・キス・次の約束・言いそびれる） */
    if (day.last && S.n <= 2 && !S.p2) oneDrama(ctx, day);
    /* ダブルデートの四人の夜にする日は、夜の別行動の段を出さない（四人で帰り道へ。R18版。date-r18.js の HK.DateR18.quadRoll） */
    var quadGo = !!(S.p2 && !HK.SAFE_ON && HK.DateR18 && HK.DateR18.quadRoll && HK.DateR18.quadRoll(ctx, day));
    if (S.p2 && !quadGo) dblSplit(ctx, day);
    var cp = day.last ? climaxPick(ctx, day) : null;
    if (cp && cp.at === 'dest') climax(ctx, day, cp);
    /* その日の終わりぎわ（帰り際の靴の故障など） */
    more(ctx, day, 'end');
    relEv(ctx, day, 'back');
    if (!P.trip && !P.home) move(ctx, day, 'back');
    if (cp && cp.at !== 'dest') climax(ctx, day, cp);
    /* ダブルデートの四人の夜（R18版。四人の輪がそろっていれば、夜の分かれ道の代わりに。date-r18.js の HK.DateR18.quad） */
    var quad = !!(quadGo && HK.DateR18.quad && HK.DateR18.quad(ctx, day));
    if (quad) { day.br = 'quad'; S.branches.quad = (S.branches.quad || 0) + 1; }
    var skip = quad || (S.trio ? trioPart(ctx, day) : false);
    if (!skip) nightBranch(ctx, day);
    if (day.last && !S.p2 && HK.DateR18 && HK.DateR18.noneWhy) HK.DateR18.noneWhy(ctx, day);
    if (day.last) ending(ctx);
    goalDayEnd(ctx, S, day);
    /* ダブルデートの二組目：別行動のあとの夜（最後のデートは二組目の山場と結末も） */
    if (S.p2) withPair(ctx, S.p2, function () {
      var S2 = S.p2, d2 = S2.day;
      if (d2.last) climax(ctx, d2, cp);
      if (!quad) nightBranch(ctx, d2);
      if (d2.last) ending(ctx);
      goalDayEnd(ctx, S2, d2);
    });
  }

  /* ---------- 朝の段 ---------- */
  function prep(ctx, day) {
    var S = f(ctx), P = day.P, c = ctx.rng() < 0.5 ? S.A : S.B, o = c === S.A ? S.B : S.A;
    var t = attPick(ctx, TX().PREP, c, c, o);
    if (t) ctx.act2({ actors: [c], cat: 'solo', text: fill(ctx, t, c, o, { dest: placeName(firstD(P)) }), why: 'デートの日々：午後からの' + S.dword + 'の前（' + c.name + '）' });
  }
  /* その日の始まり：待ち合わせ → 計画 → 行きの道中。相手の家へ行くおうちデートは、計画 → 相手の家への道 → 部屋に上がる、の順（2026-11-05 通し読み：部屋に上がってから行き先を決め、そのあとで部屋への道を歩いていた）。
     家の主（day.host）をここで決めて、上がる段・道中・夜の分かれ道（泊まっていって、と言うのは家の主）で使う */
  function startLines(ctx, day) {
    var S = f(ctx), P = day.P;
    if (P.home && !S.cohab && P.mode === 'visit' && !S.p2 && !S.trio) {
      var pl = P.planner || S.A; day.host = ctx.rng() < 0.5 ? pl : (pl === S.A ? S.B : S.A);
      planLine(ctx, day); move(ctx, day, 'go'); meet(ctx, day);
      return;
    }
    if (S.p2) dblMeet(ctx, day); else if (S.trio) trioMeet(ctx, day); else meet(ctx, day);
    planLine(ctx, day);
    move(ctx, day, 'go');
  }
  function meet(ctx, day) {
    var S = f(ctx), A = S.A, B = S.B, P = day.P, Tx = TX();
    var first = ctx.rng() < 0.5 ? A : B, other = first === A ? B : A;
    /* おうちデート：{a}＝訪ねる人、{b}＝家の主 */
    if (day.host) { other = day.host; first = other === A ? B : A; }
    var T0 = S.cohab ? Tx.MEET_COHAB : P.home ? Tx.MEET_HOME : Tx.MEET;
    var t = relPick(ctx, T0, first, other);
    if (!t) return;
    var ex = { dest: placeName(firstD(P)), n: (day.d + 1) + '回目' };
    ctx.act2({ actors: [first, other], cat: 'bond', text: fill(ctx, t, first, other, ex) + goalToday(ctx, S, day), why: 'デートの日々：' + (day.d + 1) + '回目の' + S.dword + '（' + P.slots.map(function (x) { return x.d.name; }).filter(function (x, i, a) { return a.indexOf(x) === i; }).join('→') + '・予算' + yen(P.bud) + '）', fx: function () { ctx.mod2(A, B, { aff: 1 }, { aff: 1 }); } });
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
    /* らしくない計画を見た相手の一言：{a}＝らしくない人（計画した人）、{b}＝見た人（2026-11-05 報告「らしくないの段の主語の入れ違い」） */
    if (P.beh.odd && RC()) rr = fill(ctx, RC().after(ctx, S.love), pl, o);
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
    else if (P.mode === 'visit' && day.host) { b = day.host; a = b === A ? B : A; }
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
    if (t) ctx.act2({ actors: [x[0], x[1]], cat: 'bond', text: fill(ctx, t, x[0], x[1], { dest: placeName(d1), dest2: placeName(d2) }), why: 'デートの日々：' + d1.name + 'から' + d2.name + 'へ' });
  }

  /* ---------- 行き先でめぐる・出来事・トラブル（段を持つ行き先は段の順に。段は date-phase.js、舞台は date-setting.js） ---------- */
  /* 汎用の文の舞台の絞り込み（o.D＝いる行き先、o.key＝表の鍵、o.part＝区切り） */
  function setO(day, key, part, D) { return { D: D || (day && (day.cur || day.P.main)), key: key, part: part || (day && day.part) }; }
  function visit(ctx, day, part) {
    var sl = slotOf(day.P, part);
    if (!sl) return;
    var D = sl.d;
    day.cur = D; ctx.place = D.name;
    if (D.ph && HK.DatePhase) { visitPh(ctx, day, part, sl, D); return; }
    for (var i = 0; i < sl.n && !day.over; i++) spot(ctx, day, D);
    if (day.over) return;
    if (ctx.rng() < 0.6) destEv(ctx, day, D);
    if (!day.trouble && ctx.rng() < 0.28) trouble(ctx, day, D);
  }
  /* 行の文の候補 [{ r: 行, L: [{ t, k: 段の鍵, p: 段の番号 }] }]。段を持つ行き先は、段 lo〜hi の文（'*' はいつでも、'$' は終わりぎわ end のときだけ）。only(x)＝さらに絞る */
  function rowsOf(ctx, D, kind, a, b, lo, hi, end, only) {
    var S = f(ctx), PH = HK.DatePhase, ph = D.ph && PH, out = [];
    (D[kind] || []).forEach(function (r) {
      if (!timeOk(S, r[0])) return;
      var L0 = cands(ctx, r[1], a, b).filter(function (t) { return !S.used[t]; }).map(function (t) { var k = ph ? PH.of(D, kind, r[0], t) : '*'; return { t: t, k: k, p: ph ? PH.idx(D, k) : -1 }; });
      if (ph) L0 = L0.filter(function (x) { return (!only || only(x)) && (x.p === -1 || (x.p === -2 ? !!end : x.p >= lo && x.p <= hi)); });
      if (L0.length) out.push({ r: r, L: L0 });
    });
    return out;
  }
  function phName(D, k) { return D.ph && D.ph.name[String(k).split('@')[0]] || ''; }
  function spot(ctx, day, D) {
    var S = f(ctx), x = lead2(ctx, day), a = x[0], b = x[1], sp = (D.spot || []).filter(function (s0) { return !day.spots[D.id + ':' + s0[0]] && timeOk(S, s0[0]); });
    /* まだ使っていない文があるスポットから */
    var ok = sp.filter(function (s0) { return cands(ctx, s0[1], a, b).some(function (t) { return !S.used[t]; }); });
    var s1 = pickOf(ctx, ok.length ? ok : sp);
    if (!s1) return;
    day.spots[D.id + ':' + s1[0]] = 1;
    var t = pickT(ctx, s1[1], a, b);
    if (t) emitSpot(ctx, day, D, s1, t, a, b, '');
  }
  function emitSpot(ctx, day, D, s1, t, a, b, pk) {
    var S = f(ctx), A = S.A, B = S.B;
    S.used[t] = 1; day.spots[D.id + ':' + s1[0]] = 1;
    if (/最後の/.test(s1[0] + t)) (day.lastSeen = day.lastSeen || {})[D.id] = 1;
    var e = ctx.act2({ actors: [a, b], cat: 'bond', text: fill(ctx, t, a, b, { dest: placeName(D), spot: s1[0] }), why: 'デートの日々：' + D.name + '（' + (D.exp ? '体験：' : '') + (phName(D, pk) ? phName(D, pk) + '・' : '') + s1[0] + '）', fx: function () { ctx.mod2(A, B, { aff: 1, att: S.love ? 1 : 0 }, { aff: 1, att: S.love ? 1 : 0 }); } });
    if (e) { S.good++; S.cnt.spot = (S.cnt.spot || 0) + 1; S.seenDest = S.seenDest || {}; S.seenDest[D.id] = 1; if (D.ph) e.ph = pk; }
    /* 三人デート：三人目も場面に出す（2026-11-05 報告「三人目が挟みこまれた段にしか出ない」）。めぐる場所の 4 割で三人目の一言 */
    if (e && S.trio && S.trio.C && ctx.rng() < 0.4) {
      var tt = pickT(ctx, (TX().TRIO_TAIL || {})[S.trio.k], a, b);
      if (tt) { e.text += fill(ctx, tt, a, b, { c: S.trio.C.name }); if (e.actors && e.actors.indexOf(S.trio.C.i) < 0) e.actors.push(S.trio.C.i); S.trio.cnt.tail = (S.trio.cnt.tail || 0) + 1; }
    }
  }
  function destEv(ctx, day, D) {
    var S = f(ctx), x = lead2(ctx, day), a = x[0], b = x[1];
    var evs = (D.ev || []).filter(function (e0) { return timeOk(S, e0[0]) && cands(ctx, e0[1], a, b).some(function (t) { return !S.used[t]; }); });
    var e1 = pickOf(ctx, evs);
    if (!e1) return;
    var t = pickT(ctx, e1[1], a, b);
    if (t) emitEv(ctx, day, D, e1, t, a, b, '');
  }
  function emitEv(ctx, day, D, e1, t, a, b, pk) {
    var S = f(ctx), A = S.A, B = S.B, rom = S.love && DROM.test(t);
    S.used[t] = 1;
    if (/最後の/.test(e1[0] + t)) (day.lastSeen = day.lastSeen || {})[D.id] = 1;
    var e = ctx.act2({ actors: [a, b], cat: rom ? rcat(ctx, a, b) : 'bond', text: fill(ctx, t, a, b, { dest: placeName(D) }), why: 'デートの日々：' + D.name + 'で（' + (phName(D, pk) ? phName(D, pk) + '・' : '') + e1[0] + '）', fx: function () { ctx.mod2(A, B, { aff: 2, att: rom ? 2 : 0 }, { aff: 2, att: rom ? 2 : 0 }); } });
    if (e && D.ph) e.ph = pk;
    day.ev++; S.good++;
  }
  /* トラブル：受け止め方（相手の態度9種）と決着（笑い話／一緒に何とかする／小さな言い合い＝喧嘩になりうる） */
  function trouble(ctx, day, D) {
    var S = f(ctx), x = lead2(ctx, day), a = x[0], b = x[1];
    var trs = (D.tr || []).filter(function (e0) { return timeOk(S, e0[0]) && cands(ctx, e0[1], a, b).some(function (t) { return !S.used[t]; }); });
    var t1 = pickOf(ctx, trs);
    if (!t1) return;
    var t = pickT(ctx, t1[1], a, b);
    if (t) emitTr(ctx, day, D, t1, t, a, b, '');
  }
  /* トラブルの種類：luck 運・自然・待つしかないもの／fix 手を打てば直るもの／feel 気持ちの行き違い */
  function trKind(t) { return /忘れ|なくし|失くし|落とし|壊れ|故障|パンク|予約|遅れ|乗り遅|間違|迷っ|迷子|はぐれ|鍵|財布|充電|切符|チケット|渋滞|運休|欠航|止ま/.test(t) ? 'fix' : /すれ違|機嫌|黙りこ|言い過ぎ|拗ね|すね/.test(t) ? 'feel' : 'luck'; }
  function emitTr(ctx, day, D, t1, t, a, b, pk) {
    var S = f(ctx), A = S.A, B = S.B;
    S.used[t] = 1;
    day.trouble++;
    if (/最後の/.test(t1[0] + t)) (day.lastSeen = day.lastSeen || {})[D.id] = 1;
    var rt = '', odd = false, oc = 'help';
    if (RC()) {
      var r = RC().say(ctx, 'oops', b, a);
      if (r.text && okText(ctx, r.text, b, a)) { rt = fill(ctx, r.text, b, a); odd = r.odd; if (odd) rt += fill(ctx, RC().after(ctx, S.love), b, a); }
      oc = RC().outcome(ctx, b, a, odd);
      /* 決着の文はトラブルの種類で（運・自然のもの＝釣れない魚・凶のおみくじ・雨は笑い話か気持ちの立て直し、直せるもの＝忘れ物・予約・故障は手分け。2026-11-05 報告「釣れない魚にも電話をかけて元どおり」） */
      var TO = (TX().TR_OUT || {})[oc], tk = trKind(t1[0] + t), ot = TO && TO[tk] ? pickT(ctx, TO[tk], a, b) : '';
      if (!ot) ot = RC().outText(ctx, oc);
      if (ot && okText(ctx, ot, a, b)) rt += fill(ctx, ot, a, b);
    }
    if (oc === 'spat') day.fightP += 0.3;
    var e = ctx.act2({ actors: [a, b], cat: 'bond', odd: odd, text: fill(ctx, t, a, b, { dest: placeName(D) }) + rt, why: 'デートの日々：' + D.name + 'でトラブル（' + (phName(D, pk) ? phName(D, pk) + '・' : '') + t1[0] + '・' + { laugh: '笑い話に', help: '一緒に何とかした', spat: '小さな言い合いに' }[oc] + '）',
      fx: function () { if (oc === 'spat') ctx.mod2(A, B, { ten: 3 }, { ten: 3 }); else ctx.mod2(A, B, { aff: 2, trust: 2 }, { aff: 2, trust: 2 }); } });
    if (e && e.odd) S.odd++;
    if (e && D.ph) e.ph = pk;
    S.cnt.trouble = (S.cnt.trouble || 0) + 1;
  }
  /* 段を持つ行き先をめぐる：スポット・出来事・トラブルを選んでから、段の順に並べて出す（段を戻らない）。
     day.phAt[id]＝今いる段の番号、day.phLim[id]＝この区切りで進んでよい段の終わり、day.phOut[id]＝その日のこの行き先を出た */
  function shuf(ctx, arr) { for (var i = arr.length - 1; i > 0; i--) { var j = Math.floor(ctx.rng() * (i + 1)), x = arr[i]; arr[i] = arr[j]; arr[j] = x; } return arr; }
  function visitPh(ctx, day, part, sl, D) {
    var S = f(ctx), ph = D.ph, PH = HK.DatePhase, at = day.phAt = day.phAt || {}, lim = day.phLim = day.phLim || {};
    var mine = day.P.slots.filter(function (x) { return x.d === D; }), end = mine.indexOf(sl) === mine.length - 1;
    var cur = at[D.id] || 0, stay = ph.stay ? ph.k.indexOf(ph.stay) : ph.k.length - 1, mid = ph.mid ? ph.k.indexOf(ph.mid) : stay;
    var hi = end ? stay : Math.max(cur, Math.min(stay, mid));
    lim[D.id] = hi;
    var beats = [], usedRow = {};
    var take = function (kind, lo, hi2, only, e2) {
      var x = lead2(ctx, day), rs = rowsOf(ctx, D, kind, x[0], x[1], lo, hi2, e2, only).filter(function (q) { return !usedRow[kind + ':' + q.r[0]] && !(kind === 'spot' && day.spots[D.id + ':' + q.r[0]]); });
      var q = pickOf(ctx, rs); if (!q) return null;
      var l = pickOf(ctx, q.L); usedRow[kind + ':' + q.r[0]] = 1;
      return { kind: kind, r: q.r, t: l.t, k: l.k, p: l.p, a: x[0], b: x[1] };
    };
    var nEv = (ctx.rng() < 0.6 ? 1 : 0) + (ctx.rng() < 0.25 ? 1 : 0), nTr = !day.trouble && ctx.rng() < 0.28 ? 1 : 0;
    if (ph.cyc) {
      /* 乗り物ごとに 並ぶ→乗る→降りる（段はスポットごとに戻る）。'*' の出来事は乗り物のあいだ、'$' はその日の終わりぎわ */
      var sps = []; for (var i = 0; i < sl.n; i++) { var s = take('spot', 0, 2, function (x) { return x.p !== -2 || end; }, end); if (s) sps.push(s); }
      sps.sort(function (x, y) { return (x.p === -2 ? 1 : 0) - (y.p === -2 ? 1 : 0); });
      sps.forEach(function (s0) {
        var ride = s0.p === 1;
        if (ride && nTr && ctx.rng() < 0.5) { var tq = take('tr', 0, 0, function (x) { return x.p === 0; }); if (tq) { beats.push(tq); nTr = 0; } }
        if (ride && nEv && ctx.rng() < 0.3) { var eq = take('ev', 0, 0, function (x) { return x.p === 0; }); if (eq) { beats.push(eq); nEv--; } }
        beats.push(s0);
        if (ride && nEv && ctx.rng() < 0.4) { var er = take('ev', 1, 1, function (x) { return x.p === 1 && (!PH.spotOf(x.k) || PH.spotOf(x.k) === s0.r[0]); }); if (er) { beats.push(er); nEv--; } }
        if (ride && nTr && ctx.rng() < 0.4) { var ta = take('tr', 2, 2, function (x) { return x.p === 2; }); if (ta) { beats.push(ta); nTr = 0; } }
        if (ride && nEv && ctx.rng() < 0.3) { var ea = take('ev', 2, 2, function (x) { return x.p === 2; }); if (ea) { beats.push(ea); nEv--; } }
      });
      while (nEv-- > 0) { var ew = take('ev', 9, 9, function (x) { return x.p === -1 || x.p === -2; }, end); if (ew) beats.push(ew); }
      if (nTr) { var tw = take('tr', 9, 9, function (x) { return x.p === -1; }); if (tw) beats.push(tw); }
      beats.sort(function (x, y) { return (x.p === -2 ? 1 : 0) - (y.p === -2 ? 1 : 0); });
    } else {
      for (var j = 0; j < sl.n; j++) { var s2 = take('spot', cur, hi, null, end); if (s2) beats.push(s2); }
      for (var m = 0; m < nEv; m++) { var e3 = take('ev', cur, hi, null, end); if (e3) beats.push(e3); }
      if (nTr) { var t3 = take('tr', cur, hi, null, end); if (t3) beats.push(t3); }
      /* 段の順に（'*' はその区切りの段のどこか、'$' は最後）。同じ段の中は選んだ順 */
      beats.forEach(function (x, i) { x.o = (x.p === -1 ? cur + ctx.rng() * (hi - cur + 1) - 0.5 : x.p === -2 ? 99 : x.p) * 100 + i; });
      beats.sort(function (x, y) { return x.o - y.o; });
    }
    var mealI = ph.meal ? ph.k.indexOf(ph.meal) : -9, darkI = ph.dark ? ph.k.indexOf(ph.dark) : -9, darkDone = false;
    var doMeal = function () { if (mealI < 0 || day.ateIn || part !== 'ev' && part !== 'pm') return; at[D.id] = Math.max(at[D.id] || 0, mealI); day.ateIn = 1; if (meal(ctx, day, part === 'ev' ? 'dinner' : 'lunch', D)) day.ateDin = part === 'ev'; };
    beats.forEach(function (x) {
      if (day.over) return;
      if (!ph.cyc && x.p >= 0) { if (x.p > mealI && (at[D.id] || 0) <= mealI) doMeal(); at[D.id] = Math.max(at[D.id] || 0, x.p); }
      if (x.kind === 'spot') emitSpot(ctx, day, D, x.r, x.t, x.a, x.b, x.k);
      else if (x.kind === 'ev') emitEv(ctx, day, D, x.r, x.t, x.a, x.b, x.k);
      else emitTr(ctx, day, D, x.r, x.t, x.a, x.b, x.k);
      /* 暗がりの段（上映中・館内など）・暗がりのスポットにいるあいだだけ、人目を盗んだキスの「暗がり」 */
      var dk = ph.cyc ? x.kind === 'spot' && x.r[0] === ph.darkSpot : x.p === darkI || (x.p === -1 && (at[D.id] || 0) === darkI);
      if (dk && !darkDone && !day.kiss) { darkDone = true; day.darkNow = D; try { heat(ctx, day); } finally { day.darkNow = null; } }
    });
    if (!day.over && end) doMeal();
    if (end) (day.phOut = day.phOut || {})[D.id] = 1;
  }
  /* 段を持つ行き先の、今の段より前に戻らない文だけ（お昼・夕食・山場）。進めてよい段の終わりは day.phLim（無ければその行き先の終わりまで） */
  function phOk(day, D, kind, name) {
    if (!D || !D.ph || D.ph.cyc || !HK.DatePhase) return null;
    var PH = HK.DatePhase, cur = (day.phAt || {})[D.id] || 0, hi = (day.phLim || {})[D.id], out = (day.phOut || {})[D.id];
    if (hi == null) hi = D.ph.k.length - 1;
    if (kind === 'cl') hi = D.ph.k.length - 1;
    return function (t) { var p = PH.idx(D, PH.of(D, kind, name, t)); return p === -1 || (p === -2 ? !!out : p >= cur && p <= hi); };
  }
  /* 食事：行き先の食べ物（無ければ予備）＋食べ物の好み（HK.Food）の一言。D を渡すと、その行き先の料理（段を持つ行き先の食事の段） */
  function meal(ctx, day, kind, D0) {
    var S = f(ctx), A = S.A, B = S.B, P = day.P, D = D0 || (kind === 'lunch' ? (slotOf(P, 'am') || slotOf(P, 'pm') || {}).d : (slotOf(P, 'ev') || slotOf(P, 'pm') || slotOf(P, 'am') || {}).d);
    /* 夕食は、食べ物の行き先・夜の行き先・旅先のときだけ行き先の料理（ほかは夕食の予備：街の店） */
    if (!D0 && kind === 'dinner' && D && !(D.kind === 'food' || has(D, 'night') || D.trip || D.id === 'ouchi')) D = null;
    var x = lead2(ctx, day), a = x[0], b = x[1], Tx = TX(), t, dish, f1 = null;
    var fd = D ? (D.food || []).map(function (e0) { var ok = phOk(day, D, 'food', e0[0]); return [e0[0], cands(ctx, e0[1], a, b).filter(function (y) { return !S.used[y] && (!ok || ok(y)) && timeOk(S, e0[0] + '。' + y); })]; }).filter(function (e0) { return e0[1].length; }) : [];
    f1 = pickOf(ctx, fd);
    if (f1) { t = pickOT(ctx, f1[1]); dish = f1[0]; }
    /* 行き先の料理を使い切ったら街の店の予備（宇宙・海外・船の上・おうちでは出さない） */
    if (!t) { var FB = kind === 'lunch' ? Tx.LUNCH : Tx.DINNER, so = D ? setO(day, kind === 'lunch' ? 'LUNCH' : 'DINNER', null, D) : null, r = pickOf(ctx, (FB || []).filter(function (e0) { return cands(ctx, e0[1], a, b, so).some(function (y) { return !S.used[y]; }); })); if (!r) return false; t = pickT(ctx, r[1], a, b, false, so); dish = r[0]; }
    if (!t) return false;
    if (D && D.ph && !D.ph.cyc && f1) { var PH = HK.DatePhase, p = PH.idx(D, PH.of(D, 'food', f1[0], t)); if (p >= 0) (day.phAt = day.phAt || {})[D.id] = Math.max(day.phAt[D.id] || 0, p); }
    var tail = '';
    if (HK.Food && HK.Food.any && HK.Food.any([A, B]) && ctx.rng() < 0.55) {
      var tk = HK.Food.talk(ctx, a, b, S.grp === 'first' && day.d === 0 ? ['share', 'hate'] : ['remember', 'share', 'hate']);
      if (tk && tk.text && okText(ctx, tk.text, a, b)) tail = K.soft(tk.text);
    }
    ctx.act2({ actors: [a, b], cat: 'bond', text: fill(ctx, t, a, b, { dest: D ? placeName(D) : '', dish: dish }) + tail, why: 'デートの日々：' + (kind === 'lunch' ? 'お昼' : '夕食') + '（' + dish + '）', fx: function () { ctx.mod2(A, B, { aff: 2 }, { aff: 2 }); } });
    S.cnt[kind] = (S.cnt[kind] || 0) + 1;
    return true;
  }
  /* 候補の文から一つ（使った印を付ける） */
  function pickOT(ctx, arr) { var t = pickOf(ctx, arr); if (t) f(ctx).used[t] = 1; return t; }
  function lunch(ctx, day) { meal(ctx, day, 'lunch'); }
  function dinner(ctx, day) { if (day.ateDin) return; meal(ctx, day, 'dinner'); }

  /* ---------- 性格で分かれる行動（計画した人。その日の途中の一場面と、相手の受け止め方＝態度9種） ---------- */
  function behave(ctx, day) {
    var S = f(ctx), P = day.P, pl = P.planner, o = pl === S.A ? S.B : S.A, Tx = TX();
    if (day.beh) return;
    day.beh = true;
    var bk = P.beh.k, okK = (bk === 'karamawari' || bk === 'batari') && ctx.rng() < 0.3 && (Tx.BEHX_OK || {})[bk];
    /* 空回り・行き当たりばったりが、思いがけず成功に転ぶ回（毎回同じ型にならないように） */
    var t = okK ? pickT(ctx, Tx.BEHX_OK[bk], pl, o, false, setO(day, 'BEHX')) : '';
    if (t) { var eo = ctx.act2({ actors: [pl, o], cat: 'bond', odd: P.beh.odd, text: fill(ctx, t, pl, o, { dest: placeName(day.cur || P.main) }), why: 'デートの日々：' + pl.name + 'の' + BEH_NAME[bk] + 'が、うまくいった' + (P.beh.odd ? '（らしくない）' : ''), fx: function () { ctx.mod2(pl, o, { aff: 2 }, { aff: 3, trust: 2 }); } }); if (eo && eo.odd) S.odd++; S.cnt.behOk = (S.cnt.behOk || 0) + 1; return; }
    t = pickT(ctx, (Tx.BEHX || {})[bk], pl, o, false, setO(day, 'BEHX'));
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
      /* 待ち合わせに遅れるのは、その日の最初の行き先に着く前だけ（2026-11-05 通し読み：沖縄で泳いだあとに「待ち合わせに十分遅れてきた」） */
      if (r.k === 'chikoku' && (day.P.home || day.part !== 'am' || Object.keys(day.spots || {}).length)) return 0;
      return cands(ctx, relList(T0, S), a, b, setO(day, 'GEN.' + r.k)).some(function (t) { return !S.used[t]; }) ? (GEN_SG[r.k] && GEN_SG[r.k].some(function (g) { return sg(S, day, g); }) ? 4 : 1) : 0;
    });
    if (!row) return;
    var t = relPick(ctx, G0[row.k], a, b, false, setO(day, 'GEN.' + row.k));
    if (!t) return;
    day.gen++;
    var rom = S.love && DROM.test(t);
    var e = ctx.act2({ actors: [a, b], cat: rom ? rcat(ctx, a, b) : 'bond', text: fill(ctx, t, a, b, { dest: placeName(day.cur || day.P.main) }), why: 'デートの日々：' + (GEN_NAME[row.k] || row.k),
      fx: function () { ctx.mod2(A, B, { aff: 2, att: rom ? 2 : 0 }, { aff: 2, att: rom ? 2 : 0 }); } });
    if (e) S.good++;
    if (row.k === 'chikoku') day.fightP += 0.05;
    if (row.k === 'nanpa') day.fightP += 0.05;
    S.cnt['gen_' + row.k] = (S.cnt['gen_' + row.k] || 0) + 1;
    day.k[row.k] = 1;
  }
  /* ---------- やらしい雰囲気（性欲が高まると、デートの途中で。恋人どうしは人目を盗んだキス、そうでない二人は意識してしまう一場面） ---------- */
  function heatPlace(ctx, day) {
    var D = day.cur || day.P.main;
    /* 暗がりは、段を持つ行き先では暗がりの段のあいだだけ（visitPh が day.darkNow を立てて呼ぶ） */
    if (day.darkNow) return 'dark';
    if (has(D, 'dark') && !D.ph) return 'dark';
    if (has(D, 'kanran')) return ctx.rng() < 0.6 ? 'kanran' : 'quiet';
    if (has(D, 'view') && day.part === 'ev') return 'view';
    if (day.P.mode === 'car') return ctx.rng() < 0.4 ? 'car' : 'quiet';
    return ctx.rng() < 0.4 ? 'crowd' : 'quiet';
  }
  var HEAT_NAME = { dark: '暗がりで', kanran: '観覧車のゴンドラで', view: '景色を見ながら', car: '車の中で', crowd: '人混みにまぎれて', quiet: '物陰で' };
  function heat(ctx, day) {
    var S = f(ctx), A = S.A, B = S.B, Tx = TX();
    if (!S.love || day.kiss || day.over) return;
    /* 起こりやすさ：性欲（HK.Pos.libMul）と、デートを重ねて高まった気持ち（惹かれ） */
    var att = ((ctx.rel[A.i][B.i].att || 0) + (ctx.rel[B.i][A.i].att || 0)) / 2;
    var p = ((S.couple ? 0.16 : 0.07) * Math.max(0.35, Math.min(1.8, S.heat)) + Math.max(0, att - 30) / 400) * goalMul(S, { kyori: 0.3, tomodachi: 0.3, propose: 1.2, suki: 1.2, tsukiau: 1.2, kokuhaku: 1.2 });
    if (ctx.rng() > p) return;
    day.kiss = 1;
    var pl = heatPlace(ctx, day), o = HK.Pos && HK.Pos.order ? HK.Pos.order(A, B) : [A, B];
    if (!S.couple) {
      var t0 = pickT(ctx, (Tx.HEAT_NC || {})[pl] || [], o[0], o[1], false, setO(day, 'HEAT_NC.' + pl)) || pickT(ctx, (Tx.HEAT_NC || {}).all, o[0], o[1], false, setO(day, 'HEAT_NC.all'));
      if (!t0) return;
      ctx.act2({ actors: [o[0], o[1]], cat: rcat(ctx, A, B), text: fill(ctx, t0, o[0], o[1]), why: 'デートの日々：距離が近くて意識してしまう（' + HEAT_NAME[pl] + '）', fx: function () { ctx.mod2(A, B, { att: 4 }, { att: 4 }); } });
      S.heatN++;
      return;
    }
    if (!HK.Kiss || !HK.Kiss.scene) return;
    var ld = pickT(ctx, (Tx.HEAT || {})[pl] || [], o[0], o[1], false, setO(day, 'HEAT.' + pl)) || pickT(ctx, (Tx.HEAT || {}).quiet || [], o[0], o[1], false, setO(day, 'HEAT.quiet'));
    if (!ld) return;
    var tail = '';
    if (!HK.SAFE_ON && HK.DateR18 && HK.DateR18.heatTail) tail = HK.DateR18.heatTail(ctx, o[0], o[1], pl, setO(day, 'HEAT.' + pl)) || '';
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
    /* 前のデートで喧嘩した二人は、次のデートでは喧嘩しにくい（毎回同じ型にならないように。2026-11-05 報告「ときめき→空回り→喧嘩→すぐ仲直りが毎回同じ」） */
    if (S.lastFight != null && S.lastFight === day.d - 1) p *= 0.3;
    if (ctx.rng() > p) return;
    var cause = S.feud && ctx.rng() < 0.5 ? 'feud' : day.jeal ? 'jeal' : P.beh.k === 'karamawari' || P.beh.k === 'batari' ? P.beh.k : S.cnt.gen_chikoku ? 'chikoku' : P.cost >= 30000 && ctx.rng() < 0.4 ? 'money' : 'tired';
    fight(ctx, day, cause);
  }
  function fight(ctx, day, cause) {
    var S = f(ctx), A = S.A, B = S.B, P = day.P, Tx = TX();
    day.fight = true; S.fights++; S.lastFight = day.d;
    /* 怒る人：空回り・ばったりは計画した人の相手、ヤキモチは妬いた人、ほかは気の強い方 */
    var pl = P.planner, ang = cause === 'karamawari' || cause === 'batari' ? (pl === A ? B : A) : cause === 'jeal' && day.jealBy ? day.jealBy : ((A.tr.fc || 0.5) - (A.tr.ac || 0.5) >= (B.tr.fc || 0.5) - (B.tr.ac || 0.5) ? A : B), oth = ang === A ? B : A;
    var c0 = pickT(ctx, (Tx.FIGHT_CAUSE || {})[cause], ang, oth) || pickT(ctx, (Tx.FIGHT_CAUSE || {}).tired, ang, oth) || pickT(ctx, Tx.FIGHT_FB.cause, ang, oth, true), sy = attPick(ctx, Tx.FIGHT_SAY, ang, ang, oth);
    ctx.act2({ actors: [ang, oth], cat: 'conflict', text: fill(ctx, c0 + sy, ang, oth, { dest: placeName(day.cur || P.main) }), why: 'デートの日々：喧嘩（' + FIGHT_NAME[cause] + '・' + ang.name + 'が怒った）', fx: function () { ctx.mod2(ang, oth, { ten: 8, aff: -3 }, { ten: 6, aff: -2 }); } });
    /* 帰ってしまうか：意地っ張り・強気・きっちりした人は帰りやすく、尽くす・穏やかな人は仲直りしやすい。最後のデートでは帰らない */
    var pa = per(ang), pg = 0.22 + (/proud|tsun|stern/.test(pa) ? 0.16 : 0) - (/devoted|gentle|shy/.test(pa) ? 0.14 : 0) - (S.couple ? 0.08 : 0) + (S.feud ? 0.04 : 0);
    /* ダブルデート：もう一組がなだめて、その場で収まる（帰ってしまわない） */
    if (S.p2 || S.main) { dblNadame(ctx, day, ang, oth, cause); return; }
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
    /* 仲直りを次のデートに持ち越す（気まずいまま一日を終え、次のデートの朝に謝る） */
    if (!day.last && ctx.rng() < 0.3) {
      var ct = attPick(ctx, Tx.FIGHT_CARRY, oth, ang, oth) || pickT(ctx, (Tx.FIGHT_CARRY || {}).gentle, ang, oth, true);
      if (ct) {
        ctx.act2({ actors: [ang, oth], cat: 'conflict', text: fill(ctx, ct, ang, oth), why: 'デートの日々：仲直りできないまま一日を終えた（次の' + S.dword + 'に持ち越し）', fx: function () { ctx.mod2(ang, oth, { ten: 2 }, { ten: 2 }); } });
        day.cold = true;
        S.sorry = { by: ((oth.tr.ac || 0.5) + (oth.tr.honesty || 0.5) > (ang.tr.ac || 0.5) + (ang.tr.honesty || 0.5)) ? oth : ang, d: day.d };
        return;
      }
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
    /* 海外・宇宙・船の上・おうちでは、名簿の住人とばったり会わない（三人目は次のデートに回す） */
    var here = !HK.DateSet || HK.DateSet.ok(day.cur || day.P.main, '', 'BATTARI', day.part);
    if (S.c3 && S.c3role === 'guest' && day.d === S.c3date) { if (here) c3Battari(ctx, day, S.c3, S.c3crush); else if (day.d + 1 < S.n) S.c3date++; return; }
    if (S.c4 && day.d === S.c4date) { if (here) c3Battari(ctx, day, S.c4, S.c4crush); else if (day.d + 1 < S.n) S.c4date++; return; }
    if (!PV || !here) return;
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
    var t = pickT(ctx, arr, h, o, false, setO(day, 'BATTARI'));
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
  function c3Battari(ctx, day, c, crush) {
    var S = f(ctx), A = S.A, B = S.B, Tx = TX();
    day.visited = true;
    var t = pickT(ctx, Tx.C_BATTARI, A, B, true, setO(day, 'C_BATTARI'));
    if (!t) return;
    c.gone = false;
    try {
      var text = fill(ctx, t, A, B, { c: c.name, dest: placeName(day.cur || day.P.main) }), jeal = false;
      if (crush) { var ct = pickT(ctx, Tx.C_CRUSH, A, B, true); if (ct) text += fill(ctx, ct, A, B, { c: c.name }); }
      else if (S.love && ctx.rng() < 0.5) { var o = ctx.rng() < 0.5 ? A : B, h = o === A ? B : A, jt = attPick(ctx, Tx.JEAL, o, o, h, true); if (jt) { text += fill(ctx, jt, o, h, { g: c.name }); jeal = true; day.jeal = true; day.jealBy = o; } }
      var e = ctx.act2({ actors: [A, B, c], cat: S.love ? rcat(ctx, A, B) : 'bond', text: text, why: 'デートの日々：' + c.name + 'とデート先で鉢合わせた' + (crush ? '（' + c.name + 'は胸が痛んだ）' : jeal ? '（嫉妬）' : '') });
      if (e) { S.visits++; S.cnt.c3 = (S.cnt.c3 || 0) + 1; }
    } finally { c.gone = true; }
    /* 次のデートの朝に、三人目から冷やかし・応援（仲良し） */
    if (c === S.c3 && day.d + 1 < S.n) S.c3mita = day.d + 1;
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
    if (P.mode === 'car' && !(S.p2 || S.main)) return 'car';
    if (P.mode === 'train' && !S.cohab) return 'kaisatsu';
    return 'michi';
  }
  /* 山場の場所：最後のデートの夜にいる行き先の山場（行き先ごとの表 cl。大型・遠出・泊まりなら 8 割、ほかは 5 割）か、帰り道の山場 */
  function climaxPick(ctx, day) {
    /* その日の最後にいる行き先（夜の行き先があればそこ） */
    var S = f(ctx), P = day.P, D = (slotOf(P, 'ev') || {}).d || lastD(P);
    /* 段を持つ行き先は、今の段より前に戻る山場の文を使わない */
    var cl = (D.cl || []).map(function (x) { var ok = phOk(day, D, 'cl', x[0]); return ok ? [x[0], x[1].filter(ok)] : x; }).filter(function (x) { return x[1].length && cands(ctx, x[1], S.A, S.B).length; });
    var big = D.size === 'L' || D.trip || P.vLong;
    var pd = !cl.length ? 0 : big ? 0.8 : 0.5;
    if (cl.length && hasGoal(S, 'propose') && (has(D, 'view') || has(D, 'night'))) pd += 0.1;
    if (ctx.rng() < pd) { var c = pickOf(ctx, cl); return { at: 'dest', k: 'dest', name: c[0], lines: c[1], D: D }; }
    var k = climaxPlace(ctx, day);
    return { at: 'back', k: k, name: CL_NAME[k] };
  }
  function climax(ctx, day, cp) {
    var S = f(ctx), A = S.A, B = S.B, Tx = TX();
    cp = cp || { at: 'back', k: climaxPlace(ctx, day) };
    var pl = cp.k;
    /* 二組目：同じ行き先の山場の文が残っていなければ、帰り道の山場 */
    if (cp.at === 'dest' && !cands(ctx, cp.lines, A, B).some(function (t) { return !S.used[t]; })) { pl = climaxPlace(ctx, day); cp = { at: 'back', k: pl }; }
    if (pl === 'kaisatsu' && S.cohab) { pl = 'michi'; cp = { at: 'back', k: pl }; }
    S.climax = pl; S.climaxName = cp.at === 'dest' ? cp.D.name + '（' + cp.name + '）' : CL_NAME[pl];
    /* 本音を言うのは、素直さ・行動力の高い方（片想いは想う側が多い） */
    var sa = (A.tr.honesty || 0.5) + (A.tr.fc || 0.5) * 0.5, sb = (B.tr.honesty || 0.5) + (B.tr.fc || 0.5) * 0.5;
    var sp = S.rkKey === 'crushA' && ctx.rng() < 0.7 ? A : S.rkKey === 'crushB' && ctx.rng() < 0.7 ? B : sa >= sb ? A : B, o = sp === A ? B : A;
    S.speaker = sp;
    var ld = cp.at === 'dest' ? pickT(ctx, cp.lines, sp, o) : relPick(ctx, (Tx.CLIMAX || {})[pl] || {}, sp, o, true);
    if (cp.at === 'dest' && ld && cp.D && cp.D.ph && HK.DatePhase) { var pp = HK.DatePhase.idx(cp.D, HK.DatePhase.of(cp.D, 'cl', cp.name, ld)); if (pp >= 0) (day.phAt = day.phAt || {})[cp.D.id] = Math.max(day.phAt[cp.D.id] || 0, pp); }
    var inn = innOf(day);
    /* 本音の中身：本音を言う人の中期の目標の本音（6 割）か、態度9種の本音。付き合う・想いを伝える・やり直す目標の本音は告白そのものなので、まだ恋人でない二人には使わない
       （すぐあとに告白の段が続いて、告白が二度になる。2026-11-05 通し読み） */
    var H = S.love ? Tx.HONNE : Tx.HONNE_P, gk = gkOf(S, sp), ht = gk && !(!S.couple && /^(tsukiau|kokuhaku|yarinaoshi)$/.test(gk)) && ctx.rng() < 0.6 ? pickT(ctx, (Tx.HONNE_G || {})[gk], sp, o) : '';
    if (ht) S.cnt.honneG = (S.cnt.honneG || 0) + 1;
    if (!ht) ht = attPick(ctx, H, sp, sp, o, true);
    var AN = S.love ? Tx.HONNE_ANS : Tx.HONNE_ANS_P, an = attPick(ctx, AN, o, sp, o, true);
    var rl = relPick(ctx, Tx.HONNE_REL || {}, sp, o);
    var e = ctx.act2({ actors: [sp, o], cat: S.love ? rcat(ctx, A, B) : 'bond', text: fill(ctx, (ld || '') + (ht || '') + (an || '') + (rl || ''), sp, o, { n: S.n + '回', inn: inn }), why: 'デートの日々：最後の' + S.dword + (cp.at === 'dest' ? 'の' + S.climaxName : 'の帰り道（' + CL_NAME[pl] + '）') + '・' + sp.name + 'の本音',
      
      fx: function () { ctx.mod2(sp, o, { aff: 4, trust: 3, att: S.love ? 4 : 0 }, { aff: 4, trust: 3, att: S.love ? 4 : 0 }); } });
    if (e) { e.tag = '山場'; day.k.honne = 1; S.climaxDone = true; }
    var ek = decideEnd(ctx);
    if (ek === 'koi') { confess(ctx); if (S.koiTomari && S.couple && S.endK === 'koi') { S.endK = 'tomari'; tomariAsk(ctx); } }
    else if (ek === 'propose' || ek === 'repro') propose(ctx);
    else if (ek === 'yujin') yujin(ctx);
    else if (ek === 'tomari') tomariAsk(ctx);
  }
  /* ---------- 一回・二回だけのデートの帰り道の分かれ道（告白・初めてのお泊まり・プロポーズは、このあとの山場と結末で） ---------- */
  var ONE_NAME = { te: '帰り道に手をつなぐ', kiss: '別れ際に初めてのキス', yakusoku: '次の約束をする', iisobi: '言いたいことを言いそびれる', orei: '今日のお礼を言い合う' };
  /* 回数が少ない（1・2 回）恋人どうしでない二人の結末の線の足し分（一日でも告白などのドラマが起きるように） */
  var ONE_BONUS = 10;
  function oneDrama(ctx, day) {
    var S = f(ctx), A = S.A, B = S.B, Tx = TX(), O = Tx.ONE || {};
    if (day.over || S.oneDone) return;
    S.oneDone = true;
    var att = ((ctx.rel[A.i][B.i].att || 0) + (ctx.rel[B.i][A.i].att || 0)) / 2, W = [];
    if (S.love) {
      W.push(['te', (S.couple ? 0.8 : 1) + Math.max(0, att - 20) / 50]);
      if (S.couple && HK.Kiss && HK.Kiss.scene && !day.kiss) W.push(['kiss', 1.3]);
      W.push(['yakusoku', 0.8]);
      if (!S.couple) W.push(['iisobi', S.pine ? 0.9 : 0.4]);
    } else W.push(['yakusoku', 1], ['orei', 1]);
    W = W.map(function (x) { return [x[0], x[1] * (/^(te|kiss)$/.test(x[0]) ? goalMul(S, { kyori: 0.3, tomodachi: 0.3, tsukiau: 1.4, kokuhaku: 1.4, suki: 1.3 }) : 1) * (sg(S, day, x[0] === 'yakusoku' ? 'tsugi' : x[0]) ? 2 : 1)]; });
    var k = HK.weighted(ctx.rng, W, function (x) { return x[1]; })[0];
    /* 言い出す人：行動力の高い方（片想いは想う側） */
    var sa = (A.tr.fc || 0.5) + (A.tr.honesty || 0.5) * 0.4, sb = (B.tr.fc || 0.5) + (B.tr.honesty || 0.5) * 0.4;
    var a = S.rkKey === 'crushA' ? A : S.rkKey === 'crushB' ? B : sa >= sb ? A : B, b = a === A ? B : A;
    var t = relPick(ctx, O[k] || {}, a, b, true);
    if (!t) return;
    if (k === 'kiss') {
      var o = HK.Pos && HK.Pos.order ? HK.Pos.order(A, B) : [A, B];
      var r = HK.Kiss.scene(ctx, o[0], o[1], { trig: 'fui', len: ctx.rng() < 0.5 ? 's' : 'm', place: 'soto', lead: K.mark(fill(ctx, t, a, b)), end: 'nagori', whyPre: 'デートの日々：' + ONE_NAME.kiss, cat: rcat(ctx, A, B), fx: function () { ctx.mod2(A, B, { aff: 3, att: 4 }, { aff: 3, att: 4 }); } });
      if (r) { day.kiss = 1; S.kissN++; day.k.kiss = 1; S.cnt.one_kiss = 1; }
      return;
    }
    var re = attPick(ctx, (Tx.ONE_RE || {})[k], b, a, b, true);
    var e = ctx.act2({ actors: [a, b], cat: k === 'te' || k === 'iisobi' ? rcat(ctx, a, b) : 'bond', text: fill(ctx, t + (re || ''), a, b), why: 'デートの日々：' + (S.n === 1 ? '一回だけの' : '二回目の') + S.dword + 'の帰り道（' + ONE_NAME[k] + '・' + a.name + 'から）',
      fx: function () { if (k === 'te') ctx.mod2(a, b, { att: 4, aff: 2 }, { att: 4, aff: 2 }); else if (k === 'iisobi') ctx.mod2(a, b, { att: 3 }, { aff: 1 }); else ctx.mod2(a, b, { aff: 3, trust: 2 }, { aff: 3, trust: 2 }); } });
    if (e) { S.cnt['one_' + k] = 1; if (k === 'te') day.k.te = 1; if (k === 'yakusoku') day.k.yakusoku = 1; }
  }
  /* 結末の判定：二人の惹かれ・好意（デートを重ねた分）・良い出来事・喧嘩・関係ごとの線 */
  var END_TH = { almost: [158, 135], crush: [145, 115], ex: [125, 100], bad: [125, 80], rival: [125, 80], lovehate: [120, 80], none: [128, 85], weak: [128, 85], def: [125, 0] };
  function decideEnd(ctx) {
    var S = f(ctx), A = S.A, B = S.B;
    if (S.endK) return S.endK;
    var r = ctx.rel[A.i][B.i], q = ctx.rel[B.i][A.i];
    var sc = ((r.att || 0) + (q.att || 0)) / 2 + ((r.aff || 0) + (q.aff || 0)) / 5 + ((A.tr.honesty || 0.5) + (B.tr.honesty || 0.5)) * 6 + Math.min(14, S.good * 0.5) + S.kissN * 3 - S.fights * 5 - S.kaeru * 6 + (ctx.rng() - 0.5) * 20 + (S.pine ? 12 : 0) + (S.couple ? 0 : Math.max(0, 3 - S.n) * ONE_BONUS);
    S.endScore = Math.round(sc);
    S.attAvg = ((r.att || 0) + (q.att || 0)) / 2;
    S.affAvg = ((r.aff || 0) + (q.aff || 0)) / 2;
    if (!S.love) return (S.endK = S.grp === 'first' && sc >= 85 ? 'yujin_new' : 'mama');
    /* 目標：プロポーズしたい人がいれば線を下げ、付き合いたい・想いを伝えたい人がいれば告白の線を下げ、距離を縮めすぎたくない人がいれば上げる */
    var gp = hasPG(S, 'propose'), gl = hasPG(S, 'tsukiau') || hasPG(S, 'kokuhaku') || hasPG(S, 'yarinaoshi'), gky = hasPG(S, 'kyori') || hasPG(S, 'tomodachi');
    /* 目標の無い二人のプロポーズの線：好意（sc）に、デートの回数が多いほど下がる分（3 回で 0・10 回で −14）。距離を縮めすぎたくない人がいれば出さない（2026-11-04 に頻度を上げた） */
    var nB = Math.min(14, Math.max(0, S.n - 3) * 2), pth = gp ? 146 : 150 - nB, pp = gp ? 0.9 : 0.8;
    /* プロポーズの目標がある二人は、最後のデートで必ずプロポーズする（2026-11-05 報告「夫婦のプロポーズの目標が、特別なことは起きなかった」） */
    if (S.rk === 'spouse') return (S.endK = !gky && (gp || (sc >= 146 - nB && ctx.rng() < 0.7)) ? 'repro' : 'mama');
    if (S.couple) {
      /* 初めてのお泊まり：一緒に暮らしておらず、まだ泊まっていない、体の関係にしてよい二人（全年齢版は泊まるまで）。目標の無い二人は 7 割ほどプロポーズより先に */
      var tOk = !S.cohab && !S.stayed && bodyOk(ctx, A, B) && sc >= (gky ? 128 : 108);
      if (tOk && !gp && !gky && ctx.rng() < 0.7) return (S.endK = 'tomari');
      if (!gky && (gp || (sc >= pth && ctx.rng() < pp))) return (S.endK = 'propose');
      if (tOk && ctx.rng() < (gky ? 0.5 : 0.85)) return (S.endK = 'tomari');
      return (S.endK = 'mama');
    }
    var th = END_TH[S.rk] || END_TH.def, t0 = th[0] + (gl ? -12 : 0) + (gky ? 15 : 0);
    /* 両片想いの二人が想いを告げた夜に、そのまま初めてのお泊まりになることがある（付き合いたい・想いを伝えたい・距離を保ちたい人がいる二人は告白で止める） */
    if (sc >= t0 && S.rk === 'almost' && !gl && !gky && !S.cohab && !S.slept && bodyOk(ctx, A, B) && ctx.rng() < 0.6) { S.koiTomari = true; return (S.endK = 'koi'); }
    if (sc >= t0) return (S.endK = 'koi');
    if (S.grp === 'first') return (S.endK = sc >= th[1] ? 'yujin_new' : 'mama');
    if (sc < th[1] && /^(pine|awk)$/.test(S.grp)) return (S.endK = 'yujin');
    return (S.endK = 'mama');
  }
  /* 体の関係にしてよい二人か（R18版は HK.PairR18.sexOk。全年齢版は部品が無く、全年齢モードは場面を出さないので、どちらも泊まるまで） */
  function bodyOk(ctx, A, B) { return !!HK.SAFE_ON || !(HK.PairR18 && HK.PairR18.sexOk) || !!HK.PairR18.sexOk(ctx, A, B); }
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
    richPropose(ctx, by, to);
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
  var BR_NAME = { trio: '三人の夜', wakare: 'そのまま別れた', okuru: '家まで送った', ouchi: 'お家に寄った', tomari: '泊まった', kaeru: '一緒に帰った', yado: '旅先の宿', hotel: 'ラブホへ', car: '車を停めて' };
  function r18can(ctx) { return !HK.SAFE_ON && HK.DateR18 && HK.DateR18.can && HK.DateR18.can(ctx); }
  function nightBranch(ctx, day) {
    var S = f(ctx), A = S.A, B = S.B, P = day.P, Tx = TX(), ek = day.last ? S.endK : null;
    var r18 = r18can(ctx), heatK = Math.max(0.3, Math.min(1.8, S.heat)), att = ((ctx.rel[A.i][B.i].att || 0) + (ctx.rel[B.i][A.i].att || 0)) / 2;
    /* エッチ多め（5 回まで・一度は長い場面）：夜を一緒に過ごす分かれ道を増やす（2026-11-05 報告「多めで平均 2.2 回」）。セフレは恋人どうしと同じ重み */
    var hi = r18 && ctx.env.lewdN === 'high', HM = hi ? 3 : 1, cp = S.couple || S.fwb;
    var br;
    if (P.trip) br = 'yado';
    else if (S.cohab) br = r18 && S.couple && ctx.rng() < (hi ? 0.25 : 0.12) * heatK ? 'hotel' : 'kaeru';
    else if (ek === 'tomari') br = r18 && ctx.rng() < 0.3 ? 'hotel' : 'tomari';
    else if (ek === 'propose' || ek === 'koi') br = HK.weighted(ctx.rng, [['okuru', hi ? 0.4 : 1], ['ouchi', 1.2 * HM], ['tomari', (S.couple ? 0.6 : 0.2) * HM], ['hotel', r18 ? 0.5 * heatK * HM : 0]], function (x) { return x[1]; })[0];
    else if (ek === 'yujin' || ek === 'yujin_new') br = ctx.rng() < 0.7 ? 'wakare' : 'okuru';
    else {
      /* お家・泊まり・ラブホは、恋人どうしかどうかと性欲（熱）で決める（恋愛感情の有無では止めない。本体の決まり） */
      var W = [['wakare', (S.love ? 1 : 1.6) / HM], ['okuru', (S.love ? 1.2 : 0.6) / HM]];
      /* 恋愛にならない二人は、惹かれの代わりに好意の高まりで（恋愛感情の有無で止めない。本体の決まり） */
      var aff = ((ctx.rel[A.i][B.i].aff || 0) + (ctx.rel[B.i][A.i].aff || 0)) / 2;
      W.push(['ouchi', (cp ? 0.6 : 0.12 * heatK + (S.love ? Math.max(0, att - 40) / 200 : Math.max(0, aff - 40) / 200)) * HM]);
      /* まだ泊まったことのない恋人どうしは、初めてのお泊まりを最後のデートの結末に取っておきやすい（途中の日の泊まりを 0.35 倍。多めのときは取っておかない） */
      W.push(['tomari', (cp ? 0.25 * heatK * (!S.stayed && !day.last && !hi ? 0.35 : 1) : 0.04 * heatK + (S.grp === 'fam' || S.grp === 'close' ? 0.05 : 0)) * HM]);
      if (r18) W.push(['hotel', (cp ? 0.3 : 0.07) * heatK * HM]);
      /* 目標：距離を縮めすぎたくない人がいれば別れやすく、お家・泊まりを避ける。本音を聞きたい・好きになってもらいたい人は送っていく。付き合いたい人はお家に寄りやすい */
      var gm = { wakare: goalMul(S, { kyori: 2, tomodachi: 2 }), okuru: goalMul(S, { propose: 1.5, suki: 1.5, honne: 1.3, shiru: 1.3 }), ouchi: goalMul(S, { kyori: 0.4, tomodachi: 0.4, tsukiau: 1.3, kokuhaku: 1.3 }), tomari: goalMul(S, { kyori: 0.4, tomodachi: 0.4 }), hotel: goalMul(S, { kyori: 0.4, tomodachi: 0.4 }) };
      W = W.map(function (x) { return [x[0], x[1] * (gm[x[0]] || 1)]; });
      br = HK.weighted(ctx.rng, W, function (x) { return x[1]; })[0];
    }
    /* おうちデートの日は、二人とももう家にいる（お家に寄る＝そのまま夜まで、別れる・送る＝相手が帰っていく。2026-11-05 報告「家にいたのに別れ道で別れて」） */
    if (P.home && !S.cohab && br === 'hotel') br = 'ouchi';
    /* エッチ多めで、まだ長い場面が無いまま最後のデートの夜になったら、夜を一緒に過ごす（友人に戻る結末を除く） */
    var need = hi && day.last && !S.longN && !/^yujin/.test(ek || '') && HK.DateR18 && HK.DateR18.can && HK.DateR18.can(ctx);
    if (need && /^(wakare|okuru)$/.test(br)) br = P.home ? 'tomari' : r18 && ctx.rng() < 0.4 ? 'hotel' : 'ouchi';
    var force = !!(need || (hi && HK.DateR18 && HK.DateR18.wantLong && HK.DateR18.wantLong(ctx, day, br) && /^(yado|hotel|tomari|kaeru)$/.test(br)));
    /* ラブホは、R18 で体の関係にしてよい二人で、回数が残っているときだけ */
    if (br === 'hotel' && !r18) br = S.couple ? 'ouchi' : 'okuru';
    S.branches[br] = (S.branches[br] || 0) + 1;
    day.br = br;
    if (br === 'tomari' || br === 'yado') { S.stayed = S.stayed || (S.couple && day.d < S.n - 1); S.slept = S.slept || day.d < S.n - 1; }
    /* ラブホ：文は R18 版だけ（場面の前のきっかけの段が行き先を含む） */
    if (br === 'hotel') { if (!HK.DateR18.night(ctx, 'hotel', day, day.last, { force: force })) { S.branches.hotel--; S.branches.okuru = (S.branches.okuru || 0) + 1; day.br = 'okuru'; brText(ctx, day, 'okuru'); } return; }
    /* 帰り道の車の中（R18）：車で来た日に、別れる前に車を停めて（性欲が強いほど起こりやすい） */
    if ((br === 'wakare' || br === 'okuru') && P.mode === 'car' && !P.home && !(S.p2 || S.main) && r18 && S.love && !day.fight && ctx.rng() < (cp ? (hi ? 0.45 : 0.16) : 0.06) * heatK) { if (HK.DateR18.night(ctx, 'car', day, day.last)) { S.branches.car = (S.branches.car || 0) + 1; day.kiss = 1; } }
    brText(ctx, day, br);
    if (br === 'wakare' || br === 'okuru') partKiss(ctx, day);
    var did = /^(ouchi|tomari|yado|kaeru)$/.test(br) && r18 && HK.DateR18.night(ctx, br, day, day.last, { force: force });
    if (!did && T0end(br)) nightEnd(ctx, day, br);
  }
  /* おうちデートの日の分かれ道の文（家にいる二人） */
  function brKey(day, br) { return day.P.home ? ({ ouchi: 'uchi', tomari: 'uchitomari', wakare: 'uchiwakare', okuru: 'uchiwakare' }[br] || br) : br; }
  function brText(ctx, day, br) {
    var S = f(ctx), A = S.A, B = S.B, P = day.P, Tx = TX();
    /* 送る人・お家の主：送る人は計画した人か気の利く方、お家は相手の家（おうちデートの日は、その家の主の側） */
    var x = lead2(ctx, day), a = x[0], b = x[1];
    /* 車の日に家まで送るのは、運転している人（2026-11-05 報告「運転していない人が家まで送った」） */
    if (br === 'okuru' && P.mode === 'car' && P.driver && (P.driver === A || P.driver === B)) { a = P.driver; b = a === A ? B : A; }
    /* おうちデートの夜：{a}＝家の主（泊まっていって、と言う・見送る側）、{b}＝訪ねてきた人 */
    if (day.host && P.home) { a = day.host; b = a === A ? B : A; }
    day.brAB = [a, b];
    var bk = !S.cohab ? brKey(day, br) : br, NT = (br === 'yado' && (Tx.NIGHT_INN || {})[innKind(day)]) || (Tx.NIGHT || {})[bk] || (Tx.NIGHT || {})[br] || {}, t = relPick(ctx, NT, a, b);
    if (!t) return;
    var dest = placeName(P.main);
    var e = ctx.act2({ actors: [a, b], cat: /ouchi|tomari|yado/.test(br) && S.love ? rcat(ctx, A, B) : 'bond', text: fill(ctx, t, a, b, { dest: dest, inn: innOf(day) }), why: 'デートの日々：' + (day.d + 1) + '回目の夜（' + BR_NAME[br] + '）', fx: function () { ctx.mod2(A, B, { aff: 2, att: S.love && /ouchi|tomari|yado/.test(br) ? 3 : 0 }, { aff: 2, att: S.love && /ouchi|tomari|yado/.test(br) ? 3 : 0 }); } });
    if (e) e.tag = e.tag || '';
  }
  /* 泊まる所の呼び名（段を持つ行き先で、宿の変わる段まで進んだ夜＝宇宙旅行の帰還の夜は地上のホテル） */
  /* 宿の種類（行き先から。宇宙旅行の帰還の夜は地上のホテル）：旅先の宿の分かれ道・締めくくりの文を分ける（2026-11-05 報告「海外のホテル・船室・リゾートでも障子・浴衣」） */
  var INN_K = { onsen: 'ryokan', kyoto: 'ryokan', hokkaido: 'hotel', hotel: 'hotel', kaigai: 'abroad', okinawa: 'resort', cruise: 'ship', uchu: 'space', aurora: 'cottage', glamping: 'tent' };
  function innKind(day) { var D = day.P.main || {}, k = INN_K[D.id] || 'hotel'; if (k === 'space' && innOf(day) !== D.inn) k = 'hotel'; return k; }
  function innOf(day) { var D = day.P.main, ph = D.ph, at = (day.phAt || {})[D.id]; if (ph && ph.inn && at != null && ph.inn[ph.k[at]]) return ph.inn[ph.k[at]]; return D.inn || '宿'; }
  function T0end(br) { return /^(ouchi|tomari|yado|kaeru)$/.test(br); }
  /* 夜の締めくくり（R18 の場面が無かったとき）：泊まって眠る・帰っていく */
  function nightEnd(ctx, day, br) {
    var S = f(ctx), ab = day.brAB || [S.A, S.B], bk = !S.cohab ? brKey(day, br) : br, E = (br === 'yado' && (TX().NIGHT_END_INN || {})[innKind(day)]) || (TX().NIGHT_END || {})[bk] || (TX().NIGHT_END || {})[br] || {}, t = relPick(ctx, E, ab[0], ab[1]);
    if (t) ctx.act2({ actors: [ab[0], ab[1]], cat: S.love ? rcat(ctx, S.A, S.B) : 'bond', text: fill(ctx, t, ab[0], ab[1], { inn: innOf(day) }), why: 'デートの日々：' + (day.d + 1) + '回目の夜の終わり（' + BR_NAME[br] + '）' });
  }
  /* 別れ際のキス（恋人どうし。名残惜しい） */
  function partKiss(ctx, day) {
    var S = f(ctx), A = S.A, B = S.B, Tx = TX();
    if (!S.couple || day.kiss || !HK.Kiss || !HK.Kiss.scene) return;
    if (ctx.rng() > 0.45) return;
    var o = HK.Pos && HK.Pos.order ? HK.Pos.order(A, B) : [A, B];
    var ld = pickT(ctx, Tx.PART_KISS, o[0], o[1]);
    if (!ld) return;
    var r = HK.Kiss.scene(ctx, o[0], o[1], { trig: 'fui', len: ctx.rng() < 0.5 ? 's' : 'm', place: 'soto', lead: ld ? K.mark(ld) : null, end: ctx.rng() < 0.5 ? 'nagori' : null, whyPre: 'デートの日々：別れ際のキス：', cat: rcat(ctx, A, B), fx: function () { ctx.mod2(A, B, { aff: 2, att: 3 }, { aff: 2, att: 3 }); } });
    if (r) { day.kiss = 1; S.kissN++; S.cnt.partKiss = (S.cnt.partKiss || 0) + 1; }
  }

  /* ---------- 目標（短期＝今回のデートで何をしたいか／中期＝デートの日々を通して何を望むか。文は date-text-d.js） ---------- */
  var GM_NAME = { propose: 'プロポーズする', tsukiau: '付き合う', kokuhaku: '想いを伝える', suki: '好きになってもらう', nakayoku: 'もっと仲良くなる', shiru: '相手のことを知る', honne: '本音を聞き出す', tanoshi: '相手を楽しませる', omoide: '思い出を作る', kyori: '距離を縮めすぎない', tomodachi: '友人のままでいる', mikaesu: '見返す', yarinaoshi: 'やり直す' };
  var GM_OK = {
    propose: function (S) { return S.couple; }, tsukiau: function (S) { return S.love && !S.couple; }, kokuhaku: function (S) { return S.love && !S.couple; }, suki: function (S) { return S.love; },
    yarinaoshi: function (S) { return S.rk === 'ex' && S.love; }, mikaesu: function (S) { return /^(ex|bad|rival|lovehate)$/.test(S.rk); }, kyori: function (S) { return !S.couple; }, tomodachi: function (S) { return !S.couple && S.grp !== 'fam'; }
  };
  var GS_OK = { te: function (S) { return S.love; }, kiss: function (S) { return S.couple; }, toki: function (S) { return S.love; } };
  /* 短期の目標の判定（その日の出来事の印 day.k から） */
  var GS_JUDGE = {
    te: function (d) { return !!(d.k.te || d.k.t_yubi || d.k.t_tesashi || d.k.t_hagure || d.kiss); }, shashin: function (d) { return !!d.k.photo; }, homeru: function (d) { return !!(d.k.fuku || d.k.t_homeru); },
    warawasu: function (d) { return d.ev + d.gen >= 2 && !d.fight; }, shippai: function (d) { return !d.trouble && !d.fight; }, kiku: function (d) { return !!(d.k.ichimen || d.k.oboete || d.k.t_igai || d.k.honne) || d.ev + d.gen >= 2; },
    tsugi: function (d, S) { return !!(d.k.yakusoku || d.k.kaeritakunai || (d.br && d.br !== 'wakare' && !d.fight) || (d.last && S.endK && !/yujin/.test(S.endK))); }, kiss: function (d) { return !!d.kiss; }, kenka: function (d) { return !d.fight; },
    ogoru: function (d) { return !!(d.k.kaikei || d.rich); }, honne1: function (d) { return !!(d.k.honne || d.k.chinmoku || d.k.ichimen); }, tanoshi: function (d) { return !d.fight && d.ev >= 1; }, toki: function (d) { return d.toki >= 1; }
  };
  /* 短期の目標が汎用の出来事の種を呼ぶ */
  var GEN_SG = { yakusoku: ['tsugi'], photo: ['shashin'], oboete: ['kiku'], ichimen: ['kiku', 'honne1'], kaikei: ['ogoru'], fuku: ['homeru'], te: ['te'], chinmoku: ['honne1'] };
  function pairGoals(S) { var o = []; if (S && S.goal) [S.A, S.B].forEach(function (c) { var g = S.goal[c.i]; if (g && g.m) o.push(g.m.k); }); return o; }
  function hasPG(S, k) { return pairGoals(S).indexOf(k) >= 0; }
  function goalMul(S, map) { var m = 1; pairGoals(S).forEach(function (k) { if (map[k]) m *= map[k]; }); return m; }
  function sg(S, day, k) { return !!(S && S.goal && day && [S.A, S.B].some(function (c) { var g = S.goal[c.i]; return g && g.s[day.d] && g.s[day.d].k === k; })); }
  function goalPick(ctx, S, c, kind, avoid) {
    var T0 = TX(), G = (kind === 's' ? T0.GOAL_S : T0.GOAL_M) || {}, GR = (kind === 's' ? T0.GOAL_SR : T0.GOAL_MR) || {}, OK = kind === 's' ? GS_OK : GM_OK;
    var o = c === S.A ? S.B : S.A, side = c === S.inviter ? 'inv' : 'oth', p = per(c);
    var ok = function (g) { return g && (!OK[g.k] || OK[g.k](S)) && (S.love || !DROM.test(g.t)) && (S.couple || !COUPLE_RE.test(g.t)) && (S.rk === 'spouse' || !WED.test(g.t)) && !(S.fwb && /友人|友達/.test(g.t)) && !(avoid && avoid[g.k]); };
    var base = ((G[side] || {})[p] || []).filter(ok), rel = ((GR[side] || {})[S.fwb && GR[side] && GR[side].fwb ? 'fwb' : S.feud ? 'feud' : S.grp] || []).filter(ok);
    var list = rel.length && ctx.rng() < 0.45 ? rel : base.length ? base : rel;
    /* 好意：惹かれている相手には、好きになってもらう・付き合う・想いを伝える目標に寄る */
    if (kind === 'm' && S.love && !S.couple && ctx.rel[c.i] && (ctx.rel[c.i][o.i].att || 0) >= 30 && ctx.rng() < 0.5) {
      var l2 = base.concat(rel).filter(function (g) { return /^(suki|tsukiau|kokuhaku)$/.test(g.k); });
      if (l2.length) list = l2;
    }
    if (!list.length) list = (G.all || []).filter(ok);
    return list.length ? list[Math.floor(ctx.rng() * list.length)] : null;
  }
  /* 設定で選んだ中期の目標（合わない関係なら、おまかせ） */
  function goalFixed(ctx, S, c) {
    var k = pickOfChar(ctx, c, 'goalM'), T0 = TX();
    if (!k || !GM_NAME[k] || (GM_OK[k] && !GM_OK[k](S))) return null;
    var all = [];
    [T0.GOAL_M, T0.GOAL_MR].forEach(function (G) { Object.keys(G || {}).forEach(function (sd) { var X = G[sd]; (Array.isArray(X) ? [X] : Object.keys(X || {}).map(function (q) { return X[q]; })).forEach(function (arr) { (arr || []).forEach(function (g) { if (g.k === k && (S.love || !DROM.test(g.t)) && (S.couple || !COUPLE_RE.test(g.t))) all.push(g); }); }); }); });
    return all.length ? all[Math.floor(ctx.rng() * all.length)] : { t: GM_NAME[k], k: k };
  }
  function goalsInit(ctx, S, only) {
    (only || [S.A, S.B]).forEach(function (c) {
      var m = goalFixed(ctx, S, c) || goalPick(ctx, S, c, 'm');
      S.goal[c.i] = { m: m, s: [], r: [] };
      if (m && (!c.goal || c.goal.id === 'dt')) c.goal = { id: 'dt', label: '中期「' + m.t + '」' };
    });
  }
  function goalIntro(ctx, S, only) {
    var Tx = TX(), out = '', who = only || [S.A, S.B], nm = [];
    who.forEach(function (c) {
      var g = S.goal[c.i] && S.goal[c.i].m, o = c === S.A ? S.B : S.A;
      if (!g) return;
      var t = attPick(ctx, S.n === 1 && Tx.GOAL_SAY1 ? Tx.GOAL_SAY1 : Tx.GOAL_SAY, c, c, o, true);
      if (t) { out += fill(ctx, t, c, o, { goal: g.t }); nm.push(c.name + '：「' + g.t + '」'); }
    });
    if (out) ctx.act2({ actors: who.length > 1 ? who : [who[0], who[0] === S.A ? S.B : S.A], cat: 'bond', text: out, why: 'デートの日々：' + (S.n === 1 ? 'この一回の目標' : '中期の目標') + '（' + nm.join('・') + '）' });
  }
  /* その日の短期の目標（朝に決める。前のデートと同じ種は避ける） */
  function goalDayStart(ctx, S, day) {
    [S.A, S.B].forEach(function (c) {
      var G = S.goal[c.i]; if (!G) return;
      var av = {}; if (day.d > 0 && G.s[day.d - 1]) av[G.s[day.d - 1].k] = 1;
      G.s[day.d] = goalPick(ctx, S, c, 's', av) || goalPick(ctx, S, c, 's');
    });
  }
  /* 待ち合わせの文に足す、その日の目標の一文（4 割） */
  function goalToday(ctx, S, day) {
    if (ctx.rng() > 0.4) return '';
    var c = ctx.rng() < 0.5 ? S.A : S.B, o = c === S.A ? S.B : S.A, g = S.goal[c.i] && S.goal[c.i].s[day.d];
    if (!g) return '';
    var t = pickT(ctx, TX().GOAL_TODAY, c, o, true);
    return t ? fill(ctx, t, c, o, { goal: g.t }) : '';
  }
  function goalDayEnd(ctx, S, day) {
    [S.A, S.B].forEach(function (c) {
      var G = S.goal[c.i], g = G && G.s[day.d]; if (!g) return;
      var J0 = GS_JUDGE[g.k], ok = J0 ? J0(day, S) : !day.fight;
      if (day.over && g.k !== 'kenka') ok = false;
      G.r[day.d] = ok ? 'ok' : 'ng';
    });
  }
  /* 中期の目標の判定：二人の好意＋惹かれの動き（始まりから）と、結末・出来事 */
  function goalMid(ctx, S, c) {
    var G = S.goal[c.i], g = G && G.m; if (!g) return 'same';
    var o = c === S.A ? S.B : S.A, r = ctx.rel[c.i][o.i], r0 = S.rel0 && S.rel0[c.i] || 0, d = (r.aff || 0) + (r.att || 0) - r0;
    /* 回数が少ないほど、動きの線を下げる（1 回で半分） */
    var kf = Math.min(1, (S.n + 1) / 4), base = d >= 85 * kf ? 'near' : d < 35 * kf || (r.ten || 0) > 40 ? 'far' : 'same', ek = S.endK || '';
    switch (g.k) {
      /* 叶った目標は「叶った」（2026-11-05 通し読み：プロポーズが成功した回・恋人になった回でも「近づいた」と出ていた） */
      case 'propose': return S.proposed ? (/^(propose|repro)$/.test(ek) ? 'done' : 'near') : base === 'near' ? 'same' : base;
      case 'tsukiau': case 'yarinaoshi': return ek === 'koi' || ek === 'propose' ? 'done' : S.confessed || S.proposed ? 'near' : ek === 'yujin' ? 'far' : base === 'near' && !S.couple ? 'same' : base;
      case 'kokuhaku': return S.confessed || ek === 'koi' || ek === 'propose' ? 'done' : ek === 'yujin' ? 'far' : base === 'near' && !S.couple ? 'same' : base;
      case 'suki': return ek === 'koi' || S.confessed || S.proposed ? 'near' : ek === 'yujin' ? 'far' : base === 'near' && !S.couple ? 'same' : base;
      case 'kyori': case 'tomodachi': return /^(koi|tomari)$/.test(ek) ? 'far' : /yujin|mama/.test(ek) ? (base === 'far' ? 'same' : 'near') : 'same';
      case 'mikaesu': return S.good - S.fights * 3 >= 12 ? 'near' : S.fights >= 3 ? 'far' : 'same';
      case 'honne': case 'shiru': return S.climaxDone && base !== 'far' ? 'near' : base;
      default: return base;
    }
  }
  var GRES_NAME = { ok: '叶った', ng: '叶わなかった', done: '叶った', near: '近づいた', same: '変わらない', far: '遠のいた' };
  /* 結末の段に足す、目標の判定の一文（最後のデートの短期＝叶った／叶わなかった、中期＝近づいた／変わらない／遠のいた。目標を持つ人の態度9種） */
  function goalLines(ctx, S, c) {
    var G = S.goal[c.i], Tx = TX(), o = c === S.A ? S.B : S.A, out = '';
    if (!G) return '';
    G.mres = goalMid(ctx, S, c);
    var gs = G.s[S.n - 1], rs = G.r[S.n - 1];
    if (gs && rs) { var R = (Tx.GOAL_RES || {})[rs] || {}, t = attPick(ctx, R, c, c, o, true); if (t) out += fill(ctx, t, c, o, { goal: gs.t }); }
    if (G.m) { var R2 = (Tx.GOAL_LRES || {})[G.mres] || {}, t2 = attPick(ctx, R2, c, c, o, true); if (t2) out += fill(ctx, t2, c, o, { goal: G.m.t }); }
    return out;
  }
  function goalSum(S, c) {
    var G = S.goal[c.i]; if (!G) return null;
    var ok = G.r.filter(function (x) { return x === 'ok'; }).length;
    return { m: G.m ? G.m.t : '', mk: G.m ? G.m.k : '', mres: GRES_NAME[G.mres || 'same'], s: G.s.map(function (g) { return g ? g.t : ''; }), sk: G.s.map(function (g) { return g ? g.k : ''; }), r: G.r.slice(), ok: ok, n: G.r.filter(Boolean).length };
  }

  /* ---------- ときめき（ふとした仕草・目が合う・手が触れる・寝顔・意外な一面…。どの区切りでも起こる小さな種。恋愛にしてよい二人だけ） ---------- */
  var TOKI_KIND = ['shigusa', 'meawase', 'yubi', 'negao', 'igai', 'namae', 'homeru', 'aiai', 'hagure', 'kami', 'egao', 'kabau', 'uwagi', 'sasayaki', 'nomimono', 'tesashi'];
  var TOKI_NAME = { shigusa: 'ふとした仕草', meawase: '目が合う', yubi: '指先が触れる', negao: '寝顔', igai: '意外な一面', namae: '名前を呼ばれる', homeru: '服を褒められる', aiai: '雨の日の相合傘', hagure: 'はぐれて見つけてもらう', kami: '髪に触れられる', egao: '笑った顔', kabau: '人混みでかばわれる', uwagi: '上着をかけてもらう', sasayaki: '耳元でささやかれる', nomimono: '飲みかけを分ける', tesashi: '手を差し出される' };
  /* 区切りごとに起こりうる種（mv＝移動中、am・pm＝行き先、ev＝夜） */
  var TOKI_AT = { negao: /mv|ev/, aiai: /am|pm|mv/, hagure: /am|pm/, uwagi: /pm|ev|mv/, kabau: /am|pm|mv/, nomimono: /am|pm/, tesashi: /am|pm|mv/ };
  function tokiStage(S) { return /^(spouse|lover)$/.test(S.rk) ? 'koi' : S.pine ? 'kata' : S.grp === 'first' ? 'hajime' : 'tomo'; }
  function toki(ctx, day, where, p0) {
    var S = f(ctx), A = S.A, B = S.B, T = TX().TOKI || {};
    if (!S.love || !day || day.over || day.toki >= 2) return;
    var p = p0 * goalMul(S, { suki: 1.5, tsukiau: 1.5, kokuhaku: 1.4, shiru: 1.3, kyori: 0.5, tomodachi: 0.5 }) * (sg(S, day, 'toki') || sg(S, day, 'te') ? 1.4 : 1);
    if (ctx.rng() > p) return;
    var x = ctx.rng() < 0.5 ? [A, B] : [B, A], a = x[0], b = x[1], st = tokiStage(S);
    var pool = function (k) { return (T[k] && T[k][st] || []).concat(T[k] && T[k].all || []); };
    var ks = TOKI_KIND.filter(function (k) { return T[k] && !S.toki[k] && (!TOKI_AT[k] || TOKI_AT[k].test(where)) && cands(ctx, pool(k), a, b, setO(day, 'TOKI.' + k, where)).some(function (t) { return !S.used[t]; }); });
    if (!ks.length) return;
    var gb = gkOf(S, a) + ' ' + gkOf(S, b);
    var k = HK.weighted(ctx.rng, ks, function (q) { return (/shiru|honne/.test(gb) && q === 'igai' ? 4 : 1) * (/suki/.test(gb) && /homeru|egao|namae/.test(q) ? 2.5 : 1) * ((sg(S, day, 'te') && /yubi|tesashi|hagure/.test(q)) ? 3 : 1); });
    var t = pickT(ctx, pool(k), a, b, false, setO(day, 'TOKI.' + k, where));
    if (!t) return;
    var rt = attPick(ctx, TX().TOKI_RE, b, b, a);
    S.toki[k] = 1; day.toki++; day.k['t_' + k] = 1; S.tokiN++;
    S.cnt['toki_' + k] = (S.cnt['toki_' + k] || 0) + 1;
    ctx.act2({ actors: [a, b], cat: rcat(ctx, a, b), text: fill(ctx, t, a, b, { dest: placeName(day.cur || day.P.main) }) + (rt ? fill(ctx, rt, b, a) : ''), why: 'デートの日々：ときめき（' + TOKI_NAME[k] + '・' + b.name + 'の胸が高鳴った）',
      fx: function () { ctx.mod2(b, a, { att: 5, aff: 2 }, { att: 1, aff: 1 }); } });
  }

  /* ---------- お金をかけたデート（予算が行き先の最低金額の 4 倍以上・10 万円以上のとき。行き先ごとの表 rich と汎用の表 RICH。予算の残りで払える分だけ） ---------- */
  function richOk(P) { return !!P.main && P.bud >= Math.max(P.main.cost * 4, 100000) && P.bud - P.cost - (P.richCost || 0) >= 50000; }
  function rich(ctx, day) {
    var S = f(ctx), P = day.P, Tx = TX();
    if (day.rich || !richOk(P)) return;
    var p = 0.5 * goalMul(S, { propose: 1.5, mikaesu: 1.5, suki: 1.3, tanoshi: 1.2 }) * (sg(S, day, 'ogoru') ? 1.4 : 1);
    if (ctx.rng() > Math.min(0.9, p)) return;
    var left = P.bud - P.cost - (P.richCost || 0), D = day.cur || P.main, a = P.planner, b = a === S.A ? S.B : S.A;
    var rows = (D.rich || []).map(function (r) { return { n: r[0], c: r[1], L: r[2], own: true }; }).concat((Tx.RICH || []).map(function (r) { return { n: r[0], c: r[1], L: r[2], own: false }; }));
    rows.forEach(function (r) { r.o = r.own ? null : setO(day, 'RICH.' + r.n, null, D); });
    rows = rows.filter(function (r) { return r.c <= left && cands(ctx, r.L, a, b, r.o).some(function (t) { return !S.used[t]; }); });
    if (!rows.length) return;
    var r = HK.weighted(ctx.rng, rows, function (x) { return x.own ? 2 : 1; }), t = pickT(ctx, r.L, a, b, false, r.o);
    if (!t) return;
    var re = attPick(ctx, Tx.RICH_RE, b, b, a);
    day.rich = 1; P.richCost = (P.richCost || 0) + r.c; S.richN++; P.richName = r.n;
    S.cnt['rich_' + (r.own ? 'own' : 'gen')] = (S.cnt['rich_' + (r.own ? 'own' : 'gen')] || 0) + 1;
    var rom = S.love && DROM.test(t);
    ctx.act2({ actors: [a, b], cat: rom ? rcat(ctx, a, b) : 'bond', text: fill(ctx, t, a, b, { dest: placeName(D) }) + (re ? fill(ctx, re, b, a) : ''), why: 'デートの日々：お金をかけた' + S.dword + '（' + r.n + '・' + yen(r.c) + '）',
      fx: function () { ctx.mod2(a, b, { aff: 1 }, { aff: 2, att: S.love ? 2 : 0 }); } });
  }
  /* プロポーズの演出：最後のデートの予算の残りに応じて（貸し切りの観覧車・花火・飛行機雲の文字…）。受け止め方は態度9種 */
  function richPropose(ctx, by, to) {
    var S = f(ctx), P = S.plans[S.n - 1], Tx = TX();
    var left = P.bud - P.cost - (P.richCost || 0);
    var rows = (Tx.PRO_RICH || []).filter(function (r) { return r[1] <= left && cands(ctx, r[2], by, to).length; });
    if (!rows.length) return;
    var r = HK.weighted(ctx.rng, rows, function (x) { return Math.pow(x[1], 0.35); }), t = pickT(ctx, r[2], by, to, true);
    if (!t) return;
    var re = attPick(ctx, Tx.RICH_RE, to, to, by, true);
    P.richCost = (P.richCost || 0) + r[1]; S.richPro = r[0]; S.richN++;
    ctx.act2({ actors: [by, to], cat: rcat(ctx, by, to), text: fill(ctx, t, by, to) + (re ? fill(ctx, re, to, by) : ''), why: 'デートの日々：お金をかけたプロポーズの演出（' + r[0] + '・' + yen(r[1]) + '）', fx: function () { ctx.mod2(by, to, { aff: 2 }, { aff: 3, att: 3 }); } });
  }

  /* ---------- ダブルデート（四人・二組。行き先は一組目のプラン。二組目は同じ場所で、自分たちの出来事を持つ） ---------- */
  var DBL_WARM = { soudan: '相談する', photo: '四人で写真', kyoryoku: '協力して遊ぶ', share: '料理を分け合う', ouen: '背中を押す' };
  var DBL_RUB = { hariau: '張り合う', kurabe: 'つい比べてしまう', yakimochi: '相手の組と話が弾んでやきもち', kimazui: '話がかみ合わない' };
  function dblAct(ctx, day, T, warm, name, x, y, z, w, fx, plain) {
    var S = f(ctx), R = S.root || S;
    var t = pickT(ctx, T, x, y);
    if (!t) return null;
    var both = R.couple && R.p2 && R.p2.couple;
    var e = ctx.act2({ actors: [x, y, z, w], cat: 'bond', text: fill(ctx, t, x, y, { c: z.name, d: w.name, dest: placeName(day.cur || day.P.main) }), why: plain ? 'デートの日々：四人のデート（' + name + '）' : 'デートの日々：ダブルデート' + (both ? 'の恋人たち' : '') + '（' + name + '）', fx: fx });
    if (e) { R.cnt['dbl_' + (warm ? 'warm' : 'rub')] = (R.cnt['dbl_' + (warm ? 'warm' : 'rub')] || 0) + 1; R.cnt['dbl_k_' + name] = 1; }
    return e;
  }
  function dblIntro(ctx) {
    var S = f(ctx), S2 = S.p2, x = ctx.rng() < 0.5 ? [S, S2] : [S2, S];
    dblAct(ctx, S.day || { P: S.plans[0], k: {} }, TX().DBL_INTRO, true, '二組で出かけることに', x[0].A, x[0].B, x[1].A, x[1].B, null, true);
  }
  function dblMeet(ctx, day) {
    var S = f(ctx), S2 = S.p2, x = ctx.rng() < 0.5 ? [S, S2] : [S2, S];
    var e = dblAct(ctx, day, TX().DBL_MEET, true, '待ち合わせ', x[0].A, x[0].B, x[1].A, x[1].B, function () { ctx.mod2(S.A, S.B, { aff: 1 }, { aff: 1 }); ctx.mod2(S2.A, S2.B, { aff: 1 }, { aff: 1 }); }, true);
    if (e) { var gt = goalToday(ctx, S, day); if (gt) e.text += gt; }
    if (!e) meet(ctx, day);
  }
  function dblRun(ctx, day, part) {
    var S = f(ctx), S2 = S.p2, d2 = S2.day, Tx = TX();
    d2.cur = day.cur;
    /* 二組目の出来事（同じ行き先で） */
    withPair(ctx, S2, function () {
      if (part === 'am' && day.cur && ctx.rng() < 0.6) spot(ctx, d2, day.cur);
      if (part === 'pm') { var r = ctx.rng(); if (r < 0.45) gen(ctx, d2); else if (r < 0.7) heat(ctx, d2); }
      toki(ctx, d2, part, part === 'ev' ? 0.22 : 0.28);
    });
    if (part === 'ev') return;
    if (ctx.rng() > (part === 'am' ? 0.55 : 0.75)) return;
    var warm = ctx.rng() < 0.45, D0 = warm ? DBL_WARM : DBL_RUB, T0 = Tx.DBL || {};
    var ks = Object.keys(D0).filter(function (k) { return !S.cnt['dbl_k_' + D0[k]] && (T0[k] || []).some(function (t) { return !S.used[t]; }); });
    if (!ks.length) return;
    var k = pickOf(ctx, ks), x = ctx.rng() < 0.5 ? [S, S2] : [S2, S];
    var e = dblAct(ctx, day, T0[k], warm, D0[k], x[0].A, x[0].B, x[1].A, x[1].B, function () {
      if (warm) { ctx.mod2(S.A, S.B, { aff: 2 }, { aff: 2 }); ctx.mod2(S2.A, S2.B, { aff: 2 }, { aff: 2 }); }
      else { ctx.mod2(x[0].A, x[0].B, { att: 2, ten: 1 }, { att: 2, ten: 1 }); }
    });
    if (e && k === 'photo') { day.k.photo = 1; d2.k.photo = 1; }
    if (e && !warm) day.fightP += 0.05;
  }
  /* 喧嘩した組を、もう一組がなだめる（ダブルデートでは帰ってしまわない） */
  function dblNadame(ctx, day, ang, oth, cause) {
    var S = f(ctx), R = S.root || S, O = S === R ? R.p2 : R;
    var e = dblAct(ctx, day, TX().DBL_NADAME, true, 'もう一組の喧嘩をなだめる', ang, oth, O.A, O.B, function () { ctx.mod2(ang, oth, { ten: -6, aff: 2 }, { ten: -6, aff: 2 }); });
    if (!e) { var mt = attPick(ctx, TX().FIGHT_MEND, ang, ang, oth) || pickT(ctx, TX().FIGHT_FB.mend, ang, oth, true); if (mt) ctx.act2({ actors: [ang, oth], cat: 'bond', text: fill(ctx, mt, ang, oth), why: 'デートの日々：その場で仲直り（' + ang.name + 'から）', fx: function () { ctx.mod2(ang, oth, { ten: -6, aff: 2 }, { ten: -6, aff: 2 }); } }); }
    R.cnt.nadame = (R.cnt.nadame || 0) + 1;
  }
  /* 夜は二組に分かれる（別行動） */
  function dblSplit(ctx, day) {
    var S = f(ctx), S2 = S.p2, x = ctx.rng() < 0.5 ? [S, S2] : [S2, S];
    dblAct(ctx, day, TX().DBL_SPLIT, true, '夜は別行動', x[0].A, x[0].B, x[1].A, x[1].B, null, true);
  }

  /* ---------- 三人デート（三人目 C。poly 三人の恋人／tri 三角関係（C は {t} に想いを寄せる）／friend 友人・家族などが混ざる） ---------- */
  var TRIO_NAME = { poly: '三人の恋人', tri: '三角関係', friend: '友人や家族が混ざる' };
  /* 文の {a}{b}{c}：poly・friend は二人と三人目、tri は {a}＝三人目の想う人・{b}＝その相手・{c}＝三人目 */
  function trioAB(S) { var T = S.trio; if (T.k === 'tri') return [T.t, T.t === S.A ? S.B : S.A]; return ctxRng(S) ? [S.A, S.B] : [S.B, S.A]; }
  function ctxRng(S) { return (S._flip = !S._flip); }
  function trioAct(ctx, day, T, jeal, name, fx, plain) {
    var S = f(ctx), C = S.trio.C, ab = trioAB(S), t = pickT(ctx, T, ab[0], ab[1]);
    if (!t) return null;
    var rt = '';
    if (jeal && S.trio.k === 'tri') { var r0 = attPick(ctx, TX().TRIO_RE, C, C, ab[0]); if (r0) rt = fill(ctx, r0, C, ab[0]); }
    var e = ctx.act2({ actors: [ab[0], ab[1], C], cat: 'bond', text: fill(ctx, t, ab[0], ab[1], { c: C.name, dest: placeName(day && (day.cur || day.P.main)) }) + rt, why: plain && !jeal ? 'デートの日々：三人のデート（' + name + '）' : 'デートの日々：三人で（' + (jeal ? (S.trio.k === 'tri' ? '三角関係・' : 'すれ違い・') : '') + name + (jeal ? '' : '・仲良し') + '）', fx: fx });
    if (e) { S.trio.cnt[jeal ? 'jeal' : 'warm'] = (S.trio.cnt[jeal ? 'jeal' : 'warm'] || 0) + 1; S.trio.cnt['k_' + name] = 1; }
    return e;
  }
  function trioIntro(ctx) { var S = f(ctx); trioAct(ctx, null, (TX().TRIO_INTRO || {})[S.trio.k], false, '三人の日々の始まり', null, true); }
  function trioMeet(ctx, day) {
    var S = f(ctx), e = trioAct(ctx, day, (TX().TRIO_MEET || {})[S.trio.k], false, '待ち合わせ', function () { ctx.mod2(S.A, S.B, { aff: 1 }, { aff: 1 }); }, true);
    if (e) { var gt = goalToday(ctx, S, day); if (gt) e.text += gt; }
    if (!e) meet(ctx, day);
  }
  function trioRun(ctx, day, part) {
    var S = f(ctx), Tr = S.trio, T0 = (TX().TRIO || {})[Tr.k] || {};
    if (day.over || ctx.rng() > ({ am: 0.5, pm: 0.8, ev: 0.35 }[part] || 0.4)) return;
    /* 三角関係は、すれ違い（嫉妬・見てしまう・取り合う）と仲良し（応援・三人で笑う・助け舟）を半々に */
    var jeal = ctx.rng() < (Tr.k === 'tri' ? 0.6 : 0.3);
    var ks = Object.keys(T0).filter(function (k) { return TRIO_JEAL.test(k) === jeal && !(k === 'kiwo' && !S.love) && !Tr.cnt['k_' + TRIO_KN[k]] && T0[k].some(function (t) { return !S.used[t]; }); });
    if (!ks.length) return;
    var k = pickOf(ctx, ks);
    var e = trioAct(ctx, day, T0[k], jeal, Tr.k !== 'tri' && jeal ? 'ちょっとしたやきもち' : TRIO_KN[k] || k, function () {
      if (jeal && Tr.k === 'tri') { ctx.mod2(Tr.C, Tr.t, { att: 2 }, { aff: 0 }); ctx.mod2(Tr.C, Tr.t === S.A ? S.B : S.A, { ten: 2 }, { ten: 1 }); }
      else { ctx.mod2(S.A, S.B, { aff: 2 }, { aff: 2 }); ctx.mod2(Tr.C, S.A, { aff: 1 }, { aff: 1 }); ctx.mod2(Tr.C, S.B, { aff: 1 }, { aff: 1 }); }
    });
    if (e && /photo/.test(k)) day.k.photo = 1;
  }
  var TRIO_JEAL = /^(seat|mitsume|kizuku|oiteke)$/;
  var TRIO_KN = { seat: '隣の席を取り合う', mitsume: '見つめてしまう', kizuku: '気持ちに気づく', oiteke: '置いてけぼり', ouen: '背中を押す', warai: '三人で笑う', tasuke: '助け舟を出す',
    kiwo: '気を利かせる', photo: '三人で写真', hiyakasi: '冷やかす', annai: '案内役', ojama: 'お邪魔虫を名乗る', mannaka: '真ん中を歩く', te3: '三人で手をつなぐ', kinto: '順番に隣を譲る', share: '三人で分け合う', futari: '二人の時間を作る' };
  /* 夜：三人目が先に帰る（三人の恋人は、R18版で三人の夜になることがある） */
  function trioPart(ctx, day) {
    var S = f(ctx), Tr = S.trio;
    if (Tr.k === 'poly' && !day.over && r18can3(ctx) && HK.DateR18.trio(ctx, day, day.last)) { S.branches.trio = (S.branches.trio || 0) + 1; day.br = 'trio'; return true; }
    var T0 = (TX().TRIO_PART || {})[Tr.k];
    trioAct(ctx, day, T0, Tr.k === 'tri' && ctx.rng() < 0.6, '三人目が先に帰る', null, true);
    return false;
  }
  function r18can3(ctx) { return !HK.SAFE_ON && HK.DateR18 && HK.DateR18.trio && HK.DateR18.trioCan && HK.DateR18.trioCan(ctx); }
  /* 締めくくり：三人目の一文（三角関係は、二人が結ばれたら身を引く・祝う、そうでなければ三人のまま） */
  function trioEnd(ctx) {
    var S = f(ctx), Tr = S.trio, E = (TX().TRIO_END || {})[Tr.k] || {}, res;
    if (Tr.k === 'tri') res = /^(koi|propose|repro|tomari)$/.test(S.endK) || S.couple ? (/gentle|devoted|free|polite/.test(per(Tr.C)) && ctx.rng() < 0.6 ? 'iwau' : 'itami') : 'mada';
    else res = Tr.k === 'poly' ? 'sannin' : 'ouen';
    Tr.res = res;
    var jeal = res === 'itami';
    var e = trioAct(ctx, null, E[res] || E.all, jeal, '締めくくり', null, true);
    var gl = withPair(ctx, Tr.S, function () { return goalLines(ctx, Tr.S, Tr.C); });
    if (e && gl) e.text += gl;
  }

  /* ---------- 結末 ---------- */
  var END_NAME = { koi: '付き合い始める', propose: 'プロポーズ', repro: '改めてのプロポーズ', tomari: '初めてのお泊まり', yujin: '友人に戻る', yujin_new: '友人になる', mama: '' };
  /* 家族・血縁の二人は「友人」「今の関係」にせず、血縁の種類＋様子で（仲の良い親子のまま など。2026-11-04） */
  var FAM_W = { parent: '親子', pparent: '親子のような二人', twin: '双子', sibling: 'きょうだい', sibprot: 'きょうだい', sibclose: 'きょうだい', sibbad: 'きょうだい', stepsib: 'きょうだい', relative: '親戚' };
  function famWord(ctx, A, B) { var tl = HK.Ties && HK.Ties.all ? HK.Ties.all(ctx, A, B) || [] : [], w = ''; tl.forEach(function (t) { if (t && FAM_W[t.type] && !w) w = FAM_W[t.type]; }); return w || '家族'; }
  function endName(S) { if (S.endK === 'mama' && /^(fam|pfam)$/.test(S.rk) && S.famW) return (S.affAvg >= 60 ? '仲の良い' : S.affAvg < 20 ? 'ぎくしゃくした' : '') + S.famW + 'のまま'; return S.endK === 'mama' ? (S.rk === 'almost' ? '両片想いのまま' : S.rk === 'crush' ? '片想いのまま' : S.grp === 'love' ? 'これからも二人で' : S.love && S.attAvg >= 55 ? '惹かれ合ったまま' : '今の関係のまま') : S.endK === 'yujin_new' && S.love && S.attAvg >= 55 ? '惹かれ合ったまま、まずは友人に' : END_NAME[S.endK]; }
  function ending(ctx) {
    var S = f(ctx), A = S.A, B = S.B, ek = decideEnd(ctx);
    if (S.ended) return;
    S.ended = true;
    var E = (TX().END || {})[ek] || {}, t = relPick(ctx, E, A, B, true, { wed: ek === 'propose' || ek === 'repro' });
    if (!t) t = '{a}と{b}の{date}の日々は、こうして一区切りがついた。';
    /* 二人の目標の判定の一文（短期：叶った／叶わなかった、中期：近づいた／変わらない／遠のいた。目標を持つ人の態度9種） */
    var tail = goalLines(ctx, S, A) + goalLines(ctx, S, B);
    var e = ctx.act2({ actors: [A, B], cat: /koi|propose|repro|tomari/.test(ek) ? rcat(ctx, A, B) : 'bond', text: fill(ctx, t, A, B, { n: S.n + '回' }) + tail, why: 'デートの日々：結末（' + endName(S) + '）', fx: function () { ctx.mod2(A, B, { aff: 3, trust: 3 }, { aff: 3, trust: 3 }); } });
    if (e && !e.tag) e.tag = '結末';
    if (S.trio) trioEnd(ctx);
  }
  function pairSum(ctx, S) {
    return { a: S.A.i, b: S.B.i, rel: S.fwb ? '体の関係（セフレ）' : RK_NAME[S.rk], rk: S.rk, love: S.love, couple0: /^(spouse|lover)$/.test(S.rk), cohab: S.cohab, fights: S.fights, kaeru: S.kaeru, kiss: S.kissN, heat: S.heatN, toki: S.tokiN, rich: S.richN, richPro: S.richPro || '',
      branches: S.branches, climax: S.climax, climaxName: S.climaxName || CL_NAME[S.climax] || '', endK: S.endK, end: endName(S), score: S.endScore, sex: S.sex, entries: S.entries, forms: S.forms, cnt: S.cnt, goals: [goalSum(S, S.A), goalSum(S, S.B)] };
  }
  function finish(ctx) {
    var S = f(ctx), A = S.A, B = S.B;
    if (A === B) return;
    decideEnd(ctx);
    if (S.p2) withPair(ctx, S.p2, function () { decideEnd(ctx); });
    S.G.forEach(function (g) { g.gone = false; g.fate = g.outside ? 'デート先で出くわした住人（名簿から）' : S.c3role === 'double' ? 'ダブルデートの相手' : 'デート先で出くわした人'; g.fateNote = ''; });
    var plans = S.plans.map(function (P) {
      var ds = [], seen = {}; P.slots.forEach(function (sl) { if (!seen[sl.d.id]) { seen[sl.d.id] = 1; ds.push(sl.d.name); } });
      var gl = [S, S.p2].filter(Boolean).map(function (T) { return [T.A, T.B].map(function (c) { var G = T.goal[c.i]; return G && G.s[P.k] ? { c: c.i, t: G.s[P.k].t, k: G.s[P.k].k, r: G.r[P.k] || '' } : null; }).filter(Boolean); });
      return { k: P.k + 1, dests: ds, ids: P.slots.map(function (sl) { return sl.p + ':' + sl.d.id + ':' + sl.n; }), cost: P.cost, bud: P.bud, rich: P.richCost || 0, richName: P.richName || '', len: P.len, mode: P.mode, planner: P.planner.i, beh: P.beh.k, odd: P.beh.odd, month: P.month, miss: P.miss ? P.miss.d.id : '', bday: P.bday ? P.bday.i : null, trip: P.trip, goals: [].concat.apply([], gl) };
    });
    var D = pairSum(ctx, S);
    ctx.flags.date = Object.assign(D, { n: S.n, grp: S.grp, plans: plans, gone: S.goneDays || [], visits: S.visits, outN: S.outN || 0, odd: S.odd, behs: S.behs, c3role: S.c3role || '', mode: S.mode, castNG: S.castNG || '',
      p2: S.p2 ? pairSum(ctx, S.p2) : null, trio: S.trio ? { c: S.trio.C.i, k: S.trio.k, t: S.trio.t ? S.trio.t.i : null, res: S.trio.res || '', cnt: S.trio.cnt, goal: goalSum(S.trio.S, S.trio.C) } : null });
    var mates = function (c, o) { return o.name + 'と' + S.n + '回の' + S.dword; };
    A.fate = 'デートした人'; A.fateNote = mates(A, B);
    B.fate = 'デートした人'; B.fateNote = mates(B, A);
    if (S.p2) { S.p2.A.fate = S.p2.B.fate = 'ダブルデートのもう一組'; S.p2.A.fateNote = S.p2.B.name + 'と二組で' + S.n + '回の' + S.p2.dword; S.p2.B.fateNote = S.p2.A.name + 'と二組で' + S.n + '回の' + S.p2.dword; }
    if (S.trio) { S.trio.C.fate = '三人デートの三人目'; S.trio.C.fateNote = A.name + 'と' + B.name + 'と三人で' + S.n + '回のお出かけ（' + TRIO_NAME[S.trio.k] + '）'; }
    ctx.flags.outcome = A.name + 'と' + B.name + 'の' + S.n + '回の' + S.dword + '――' + endName(S) + (S.p2 ? '／' + S.p2.A.name + 'と' + S.p2.B.name + '――' + endName(S.p2) : '') + (S.trio ? '（' + S.trio.C.name + 'と三人で）' : '');
  }
  if (HK.PairCast) HK.PairCast.install(ID, couple, 'date');
  function goalLine(X, g, nm) {
    if (!g || !g.m) return '';
    return nm + 'の目標：中期「' + g.m + '」（' + g.mres + '）' + (g.n ? '／短期 ' + g.n + '回のうち ' + g.ok + '回叶った' : '');
  }
  if (HK.Endings) HK.Endings[ID] = function (res, X) {
    var R = res.end && res.end.date, lines = [];
    if (!R) return { headline: res.outcome || '', stats: [], lines: [] };
    var a = X.nm(R.a), b = X.nm(R.b), P2 = R.p2, Tr = R.trio;
    lines.push(R.n + '回の' + (R.love ? 'デート' : 'お出かけ') + '（' + a + 'と' + b + '・' + R.rel + (R.cohab ? '・一緒に暮らしている' : '') + '）' + (P2 ? '／ダブルデートのもう一組：' + X.nm(P2.a) + 'と' + X.nm(P2.b) + '・' + P2.rel : '') + (Tr ? '／三人デート：' + X.nm(Tr.c) + '（' + TRIO_NAME[Tr.k] + '）' : ''));
    if (R.castNG) lines.push('※' + R.castNG);
    R.plans.forEach(function (p) {
      var gone = R.gone.indexOf(p.k - 1) >= 0;
      var gt = (p.goals || []).map(function (g) { return X.nm(g.c) + '「' + g.t + '」' + (g.r === 'ok' ? '○' : g.r === 'ng' ? '×' : ''); }).join('・');
      lines.push('DAY' + p.k + '（' + p.month + '月）：' + p.dests.join('→') + '（' + LEN_NAME[p.len] + '・' + MOVE_NAME[p.mode] + '・予算' + yen(p.bud) + '／最低' + yen(p.cost) + (p.rich ? '＋' + p.richName + ' ' + yen(p.rich) : '') + '・計画：' + X.nm(p.planner) + '＝' + BEH_NAME[p.beh] + (p.odd ? '（らしくない）' : '') + '）' + (gone ? '　※喧嘩で途中で帰った' : '') + (p.bday != null ? '　※' + X.nm(p.bday) + 'の誕生日' : '') + (gt ? '　目標：' + gt : ''));
    });
    var pl = function (Q, nm) {
      var br = Object.keys(Q.branches || {}).filter(function (k) { return Q.branches[k] > 0; }).map(function (k) { return (BR_NAME[k] || k) + ' ' + Q.branches[k] + '回'; });
      if (br.length) lines.push(nm + '夜：' + br.join('／'));
      lines.push(nm + '喧嘩 ' + Q.fights + '回' + (Q.kaeru ? '（途中で帰った ' + Q.kaeru + '回）' : '') + (Q.kiss ? '／キス ' + Q.kiss + '回' : '') + (Q.toki ? '／ときめき ' + Q.toki + '回' : '') + (Q.rich ? '／お金をかけた演出 ' + Q.rich + '回' : '') + (HK.SAFE_ON ? '' : '／エッチ ' + Q.sex + '回'));
      lines.push(nm + '山場：' + (Q.climaxName || ''));
      lines.push(nm + '結末：' + Q.end + (Q.richPro ? '（演出：' + Q.richPro + '）' : ''));
    };
    pl(R, P2 ? a + 'と' + b + '　' : '');
    if (R.visits) lines.push('ほかの人との出来事 ' + R.visits + '回');
    (R.goals || []).forEach(function (g, i) { var l = goalLine(X, g, X.nm(i ? R.b : R.a)); if (l) lines.push(l); });
    if (P2) { pl(P2, X.nm(P2.a) + 'と' + X.nm(P2.b) + '　'); (P2.goals || []).forEach(function (g, i) { var l = goalLine(X, g, X.nm(i ? P2.b : P2.a)); if (l) lines.push(l); }); }
    if (Tr) { lines.push(X.nm(Tr.c) + '：' + ({ itami: '二人を見送って、身を引いた', iwau: '二人を祝った', mada: '三人のまま', sannin: '三人の恋人のまま', ouen: '二人を応援した' }[Tr.res] || '')); var l3 = goalLine(X, Tr.goal, X.nm(Tr.c)); if (l3) lines.push(l3); }
    X.C.forEach(function (c) { c.afterDone = true; });
    return { headline: (res.outcome || '') + '。', stats: [['回数', R.n + '回'], ['喧嘩', R.fights + '回'], ['結末', R.end]].concat(HK.SAFE_ON ? [] : [['エッチ', R.sex + '回']]), lines: lines };
  };
  HK.Date = { okText: okText, pickT: pickT, relPick: relPick, attPick: attPick, per: per, fill: fill, RK_NAME: RK_NAME, BR_NAME: BR_NAME, has: has, yen: yen, rcat: rcat, withPair: withPair, loveOk: loveOk };
  HK.SCENARIOS[ID] = scen;
  /* 開始前の注意：三人・四人の夜が起きない配役（本体の HK.Quad.groupWarn。同居生活・新婚部屋・デートの日々で同じ文言。R18版だけ。2026-11-05 利用者の報告「同居で 3P・4P をしない」） */
  if (HK.SoloWarn && HK.SoloWarn.add) HK.SoloWarn.add(ID, function (input) { return HK.Quad && HK.Quad.groupWarn ? HK.Quad.groupWarn(input, {}) : []; });
  if (HK.Lewd && HK.Lewd.install) HK.Lewd.install(ID, { lenDef: 'mix', desc: HK.SAFE_BUILD ? '' : '夜の場面の描き方。ほのめかす＝ぼかした一文と翌朝だけ／ほどほど＝描写する／濃い＝果てたあと、もう一度求め合うところまで' });
})();
