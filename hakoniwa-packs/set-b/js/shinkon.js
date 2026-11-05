/* 新婚部屋（追加パック set-b の部屋。エンジン型。両方のビルド）
   結婚したばかりの二人（か、元の関係のまま一緒に暮らし始めた二人）の毎日を、朝・日中・夜の3区切りで眺める。最後の夜は幸せなキスで一区切り。
   2026-11-03 利用者のフィードバックで作り直し（docs/reports/2026-11-03/shinkon-feedback.md・shinkon-design.md）：
   ・利用者のソロジャーナルの表は「何が起きたか」の種として内部で引くだけ（記録の行・表の名前は画面に出さない）。願望は場面の文で表す
   ・受け止め方・決着は、性格（態度9種）・関係・らしくない行動（運命の揺らぎ）で変わる（shinkon-react.js）。本体の共通の出来事（関係ごとの出来事・らしくない行動など）も混ぜる
   ・暮らしの困りごと 17 種（shinkon-trouble.js）、他の住人（参加者の三人目・名簿の登場しない住人＝設定 outsideNames）の訪れ（shinkon-visit.js）
   ・参加は 4 人まで（2026-11-04 利用者の指示。以前は 3 人）。新婚の二人＋同居人・訪ねてくる住人、三人婚（＋同居人一人）、四人婚。三人・四人で暮らす場面は shinkon-four.js。
     名簿から訪れる住人は、関係図・二人ずつ・住人ごとの結果に出さず、関係の値も動かさない（strip。訪れから恋愛は始まらない）
   ・離れていた日数・忙しい日の続きを前提にする文は、実際の日数で絞る（awayOk）
   ・家事をしない設定の人は料理・家事をしない（HK.Life.canCook／canChore）。ポンコツの出来事は「家事が苦手（ポンコツ）」の役割の人がいるときだけ
   ・なれそめ「元の関係のまま」（既定）：住人の関係の設定をそのまま使う。ほかを選ぶと二人の関係を新婚の夫婦に上書きする（家族などで「恋愛：なし」の関係は上書きしない）
   ・R18版の夜は shinkon-r18.js（描写の有無・長さ・作風は本体の共通の設定 HK.Lewd。エッチ多めなら一度は長い場面）
   ・2026-11-03 追加（shinkon-design.md の 6）：新婚らしい出来事（shinkon-wed.js）・三人婚（全員の立場が「新婚の夫婦」。shinkon-trio.js）・どの関係を夫婦に直したかの表示（relFromAll）・
     元の関係が分かる出来事と「元○○」（shinkon-past.js）・始まりの月と日付・月の行事・バレンタイン／ホワイトデー・誕生日（shinkon-cal.js）
   部品：暮らしの状態は HK.Life、願望の高まり・表を引くのは HK.Journal（本体のかたまり pack-roomkit）、文の仕上げは HK.ShinkonKit（話し手の目印）。登場人物はすべて成人として扱う */
/* @event scen=set-b-shinkon id=sk_setup cat=romance tie=- label=新婚の二人の暮らしが始まる */
/* @event scen=set-b-shinkon id=sk_morning cat=romance tie=- label=二人の朝の様子（10種） */
/* @event scen=set-b-shinkon id=sk_work cat=solo tie=- label=仕事の型ごとの日中の様子 */
/* @event scen=set-b-shinkon id=sk_daily cat=romance tie=- label=日替わりの出来事（52種） */
/* @event scen=set-b-shinkon id=sk_date cat=romance tie=- label=休日のデート（52種） */
/* @event scen=set-b-shinkon id=sk_ponkotsu cat=romance tie=- cond=家事が苦手（ポンコツ）の人がいる label=家事が苦手な人のやらかし（52種） */
/* @event scen=set-b-shinkon id=sk_fight cat=conflict tie=- label=新婚の小さな喧嘩 */
/* @event scen=set-b-shinkon id=sk_makeup cat=bond tie=- label=喧嘩した日の寝る前の仲直り */
/* @event scen=set-b-shinkon id=sk_wish cat=romance tie=- label=願望が高まったときの行動（100種） */
/* @event scen=set-b-shinkon id=sk_meal cat=romance tie=- label=朝昼晩のご飯の時間（156種） */
/* @event scen=set-b-shinkon id=sk_end cat=romance tie=- label=一日の終わりに思うこと（52種） */
/* @event scen=set-b-shinkon id=sk_kiss cat=romance tie=- label=最後の夜の幸せなキス */
/* @event scen=set-b-shinkon id=sk_hug cat=bond tie=- label=最後の夜に明日の話をする */
/* @event scen=set-b-shinkon id=sk_love_step cat=romance tie=- cond=元の関係のまま・恋人でも夫婦でもない二人 label=元の関係から恋愛へ進む（気持ちの変化・告白） */
/* @event scen=set-b-shinkon id=sk_himo cat=solo tie=- cond=ヒモタイプの人 label=ヒモタイプの人ののんびりした昼 */
(function () {
  'use strict';
  var HK = window.HK;
  var D = HK.ShinkonData;
  if (!D || !HK.Life || !HK.Journal || !HK.ShinkonKit) return;
  var ID = 'set-b-shinkon', J = HK.Journal, LF = HK.Life, K = HK.ShinkonKit;
  var PART = ['朝', '日中', '夜'], WEEK = ['月', '火', '水', '木', '金', '土', '日'];
  function TX() { return HK.ShinkonText || {}; }
  function RC() { return HK.ShinkonReact; }
  function pickOf(ctx, arr) { return arr && arr.length ? arr[Math.floor(ctx.rng() * arr.length)] : ''; }
  var soft = K.soft;
  function fill(ctx, t, a, b, ex) { return K.fill(ctx, t, a, b, ex); }
  /* 恋愛にならない二人・結婚していない二人に出さない文、家事・料理の語は共通の部品（kit-text.js の HK.PairKit） */
  var ROM = K.ROM, WED = K.WED, COOK = K.COOK, CHORE = K.CHORE;
  /* 三人婚・四人婚で、その日の二人が恋の相手どうしでない（攻めどうし・受けどうしなど）日に出さない文（2026-11-05 不具合リスト NO 22「攻め同士・受け同士の交流に恋愛の匂い」）。
     ROM（恋愛の語）より広く、触れ合い・見つめ合い・照れ・ときめき・二人だけの時間・お揃い・思い出の品など、恋の相手どうしの空気の言い回しを外す */
  var NL_ROM = /好き|恋|ときめ|どきどき|ドキドキ|胸が(?:高鳴|跳|鳴|いっぱい|苦し|騒|熱|温|あたた)|胸を(?:温|押さえ)|鼓動|心臓|頬が|頬を|頬に|撫で|赤くな|赤らめ|赤い顔|耳まで|顔が熱|照れ|見つめ|見とれ|見惚れ|横顔|目が合|目を合わせ|視線|目で追|目が離せ|手を(?:握|つな|取|包|重ね)|手に触れ|手が触れ|指先|指を絡|触れ|寄り添|寄りかか|もたれ|肩を寄せ|肩が触れ|身を寄せ|身を預け|体を寄せ|腕を回|腕に|抱き|抱擁|キス|口づけ|唇|額を|おでこ|甘え|甘い|甘く|独り占め|二人だけで|二人きりで|二人だけの|離れがた|ささや|囁|お揃い|おそろい|揃いの|ペアの|夫婦|新婚|結婚|デート|記念日|思い出|初めて(?:一緒に|出かけ|会っ)|ずっとこうして|一緒にいられ|そばにいて|隣にいること|愛|ハート|似合っ|似合う|いい匂い|の暮らしに|この人と|ムラムラ|欲し|体温|くっつ|温かさに|ぬくもり|添い寝|一緒に眠|間取り|二人の将来|二人で小さな|会いたかった|やさしく笑|微笑|食べさせ|口に運|あーん|二人でかぶ|毛布を一枚|一枚の毛布|こうしていられ|ずっと続けば|知られたら|キュン|きゅん|気になって|気にしていた|妻に|旦那|嫁|プロポーズ|膝を枕|膝枕|近くに見え|口元がゆる|頬がゆる|一口もらい|一口あげ|笑顔を見ただけで|その笑顔|寄りかか|添い/;
  /* 恋の相手どうしでない日に使わない表の行の種類（行の見出し。恋人・夫婦の二人のための行） */
  var NL_ROW = /パートナー|記念|マンネリ|甘え|デート|連絡がうまく|夢に相手|体温|ムラムラ|離れがた|キュン|ドキドキ|どきどき|おしゃれ|過去を振り返|マッサージ|スキンシップ|やけに優しい|素っ気|ポンコツ夫|ポンコツ妻|夫編|妻編|二人の時間|ふたりの時間|声のトーン|いつもと違う姿|お鍋や鉄板|映画や動画|夜景|思い出|想い|恋|疲れて眠ってしまい|停電で距離|寄り添|膝枕|抱き|触れ合い|嫉妬|初デート|好きなところ|窓際|二人分|初めての大きな|居酒屋|コンビニ飯|プロポーズ/;
  function romRow(x, S) {
    var t = typeof x === 'string' ? x : ((x && x.k) || '') + ((x && x.t) || '');
    return ROM.test(t) || !!(S && (S.trio || S.quad) && S.nl && !S.love && (NL_ROM.test(t) || (x && typeof x === 'object' && NL_ROW.test(t))));
  }
  function nlKey(a, b) { return a.i < b.i ? a.i + '-' + b.i : b.i + '-' + a.i; }
  /* その二人が三人婚・四人婚の恋の相手どうしでない組か（a・b を渡さなければ、その日の二人） */
  function nlPair(ctx, a, b) {
    var S = f(ctx);
    if (!S || !(S.trio || S.quad) || !S.nl) return false;
    if (a && b && a !== b && a.i != null && b.i != null) return !!S.nl[nlKey(a, b)];
    return !S.love;
  }
  function f(ctx) { return ctx.sk; }
  var SAD_RE = /不安|すれ違|気まず|もどかし|拗ね|寂し|さびし|胸がざわ|ざわつ|眉を寄せ|ため息|遠く感じ|戸惑|反省|つらい|震えて|弱音|素っ気|涙|申し訳な|負担|迷い|迷っ|考えごと|黙り込|黙って|呼べなかった|遠慮/;
  var HOUSE_NG = /上の階|下の階|階下の|階上の|隣の部屋|両隣と上|隣室|エレベーター|オートロック|管理人室/, FLAT_NG = /縁側|庭の草|庭に出|庭先|二階の|一階の/;
  var DAY_NG = /白み始め|寝息を立て|夜更け|真夜中|深夜|眠りにつ|布団に入っ|風呂から上がると|月明かり|夜空|前の晩|夜遅く|出張先の夕飯|^夜、|。夜、/, NIGHT_NG = /昼下がり|朝起きると|朝の光|午前中|昼過ぎ|日差しの中|ピクニック|休みの朝|出かける前に|今朝は早く|朝から鏡|昼休み|昼寝を|一緒に昼寝|休みの午後|鍵を忘れて出かけ|昼ご飯は食べたか/;
  /* 休みの日だけの文（平日の木曜に「休日にも仕事の資料」「休みの午後」を出さない）・二人とも家にいる日に「一人の食卓」を出さない（2026-11-05 通し読み） */
  var HOL_ONLY = /休日|休みの日|休みの午後|休みの朝|休みの昼/, ALONE_MEAL = /一人の食卓|一人で食べる|湯気の立つ定食の写真/;
  /* 平屋（一階だけの家）：階段・二階の文を出さない（2026-11-05 報告「平屋で階段を下りて」）。一軒家・古民家は二階があってよい */
  var FLAT1_NG = /階段|二階|上の階|下の階|階下|階上|二階建て/;
  function houseKind(h) { return /平屋|一軒家|古民家|隠れ家/.test(h) ? 'house' : /アパート|マンション|タワマン|ロフト/.test(h) ? 'flat' : ''; }
  /* 文の候補を、二人に合うものに絞る（恋愛・結婚・家事の担い手・関係） */
  function okText(ctx, x, a, b) {
    var S = f(ctx);
    if (typeof x !== 'string') return true;
    if (S && !S.love && ROM.test(x)) return false;
    /* 恋の相手どうしでない伴侶の日（NO 22）：恋の相手どうしの空気の文を外す（三人以上の文で、渡された二人が恋の相手どうしなら外さない） */
    if (S && !S.love && nlPair(ctx, a, b) && NL_ROM.test(x)) return false;
    if (S && !S.wed && WED.test(x)) return false;
    if (!choreOk(x, a, b)) return false;
    if (!awayOk(ctx, x, a, b)) return false;
    /* 住まいに合わない文（平屋・一軒家なのに上の階・隣の部屋・エレベーター。2026-11-04 報告） */
    if (S && S.homeK === 'house' && HOUSE_NG.test(x)) return false;
    if (S && S.homeK === 'flat' && FLAT_NG.test(x)) return false;
    if (S && S.hira && FLAT1_NG.test(x)) return false;
    /* 同居人・三人目がいる家：「誰もいない家」「二人きりの家」を出さない */
    if (S && S.H && S.H.length >= 3 && /誰もいない家|二人きりの家|家には二人きり|二人だけの家/.test(x)) return false;
    /* 区切りに合わない時間帯の文（日中に夜明け・寝息、夜に昼下がり・朝の光。2026-11-04 報告） */
    if (S && S.part === 1 && DAY_NG.test(x)) return false;
    if (S && S.part === 2 && NIGHT_NG.test(x)) return false;
    if (S && S.day && HOL_ONLY.test(x) && !S.day.hol) return false;
    if (S && S.day && ALONE_MEAL.test(x) && !(S.day.apart || (S.day.pa && S.day.pa.late) || (S.day.pb && S.day.pb.late))) return false;
    /* 季節に合わない文（夏に雪など）・誕生日でない日の誕生日の文（shinkon-cal.js の HK.ShinkonCal.ok） */
    if (HK.ShinkonCal && !HK.ShinkonCal.ok(ctx, x)) return false;
    return true;
  }
  /* ---------- 離れていた日数・忙しい日の続き（2026-11-03 利用者の指摘「2 日目なのに『数日ぶりに帰ってきた』という文が出る」）----------
     away(ctx)：その日の前日までに、二人のどちらかが出張で家を空けていた日が何日続いたか（{ n, who: [出張していた人] }。今日も出張なら n は 0）
     busy(ctx)：その日の前日までに、どちらかの帰りが遅い・出張の日が何日続いたか
     文の候補は、離れていたことを前提にする語（数日ぶり・久しぶりに帰ってきた・ずっと会えなかった・出張から帰った など）があれば、実際の日数と出張していた人で絞る */
  function lifeDay(c, d) { return c && c.life && c.life.days ? c.life.days[d] : null; }
  function away(ctx) {
    var S = f(ctx), day = S && S.day; if (!day) return { n: 0, who: [] };
    var d = day.d, n = 0, who = [];
    if (day.apart) return { n: 0, who: [] };
    for (var k = d - 1; k >= 0; k--) {
      var t = [S.A, S.B].filter(function (c) { var x = lifeDay(c, k); return x && x.trip; });
      if (!t.length) break;
      n++; t.forEach(function (c) { if (who.indexOf(c) < 0) who.push(c); });
    }
    return { n: n, who: who };
  }
  function busy(ctx) {
    var S = f(ctx), day = S && S.day; if (!day) return 0;
    var n = 0;
    for (var k = day.d - 1; k >= 0; k--) { if (![S.A, S.B].some(function (c) { var x = lifeDay(c, k); return x && (x.trip || x.late); })) break; n++; }
    return n;
  }
  var AW_MANY = /数日ぶり|何日ぶり|久しぶりに帰っ|会えなかった日数|ずっと会えな|久しぶりの(?:体温|熱)/, AW_ONE = /一晩、家を空けた/;
  var AW_WHO = /(?:出張から(?:帰|戻)った|出張帰りの|ぶりに帰ってきた)\{([ab])\}|\{([ab])\}は出張から(?:帰|戻)/;
  var EVE_RE = /夕方|夕暮れ|夕焼け|日が暮れる前/, EVE_OK = /連絡|遅く|帰っ|帰り|帰宅|残業|電車/;
  var BUSY_RE = /(?:遅い夜|忙しい日|すれ違い)(?:が|の)続いて|残業続き|久しぶりに早く帰/, KYUKA = /久しぶりの(?:お)?休み/;
  function awayOk(ctx, t, a, b) {
    if (typeof t !== 'string' || !f(ctx) || !f(ctx).day) return true;
    var S = f(ctx), day = S.day, aw = null;
    if (AW_MANY.test(t) || AW_ONE.test(t) || AW_WHO.test(t)) {
      aw = away(ctx);
      if (AW_MANY.test(t) && aw.n < 2) return false;
      if (AW_ONE.test(t) && aw.n !== 1) return false;
      var m = AW_WHO.exec(t);
      if (m) { var c = (m[1] || m[2]) === 'a' ? a : b; if (!aw.n || aw.who.indexOf(c) < 0) return false; }
    }
    if (BUSY_RE.test(t) && busy(ctx) < 2) return false;
    /* 帰りが遅い日：その人が夕方に家にいる文（夕方に連絡・帰る文は除く）は使わない */
    if (EVE_RE.test(t) && !EVE_OK.test(t) && [S.A, S.B].some(function (c) { var p = c === S.A ? day.pa : day.pb; return p && p.late && (c === a || c === b); })) return false;
    if (KYUKA.test(t) && !(day.hol && day.d > 0 && !holiday(day.d - 1))) return false;
    return true;
  }
  /* 家事・料理の文の担い手（共通の部品 HK.PairKit.choreOk） */
  function choreOk(t, a, b) { return K.choreOk(t, a, b); }
  /* 地の文：表の名前・行の番号で shinkon-text*.js を引く。無ければ fb */
  function prose(ctx, key, i, fb, a, b) {
    var T = TX()[key], p = T && T[i];
    if (Array.isArray(p)) {
      p = p.filter(function (x) { return okText(ctx, x, a, b); });
      if (HK.relFilter && a && b) { var r = HK.relFilter(ctx, p, a, b); if (r) p = r; }
      if (p.length) return pickOf(ctx, p);
      return fb && okText(ctx, fb, a, b) ? fb : '';
    }
    if (typeof p === 'string' && p && okText(ctx, p, a, b)) return p;
    return fb && okText(ctx, fb, a, b) ? fb : '';
  }
  SKX();
  function SKX() { HK.Shinkon = { restNight: restNight, restAhead: restAhead, okText: okText, choreOk: choreOk, awayOk: awayOk, away: away, busy: busy, ROM: ROM, WED: WED, COOK: COOK, CHORE: CHORE, AW_MANY: AW_MANY, AW_ONE: AW_ONE, AW_WHO: AW_WHO, BUSY_RE: BUSY_RE, KYUKA: KYUKA,
    /* 追加の部品（shinkon-cal.js・shinkon-past.js・shinkon-wed.js・shinkon-trio.js が使う。2026-11-03） */
    pickT: function (ctx, arr, a, b) { return pickT(ctx, arr, a, b); }, fill: fill, per: function (c) { return RC() ? RC().per(c) : 'gentle'; },
    withReact: function (ctx, kind, who, other, p) { return withReact(ctx, kind, who, other, p); }, persK: function (c, k) { return persK(c, k); }, pickOfChar: function (ctx, c, k) { return pickOfChar(ctx, c, k); }, canLove2: function (ctx, a, b) { return canLove2(ctx, a, b); } }; }
  /* 恋愛にしてよい二人か（恋愛対象・恋愛相手の固定・関係の「恋愛：なし」（家族・無関心・恐怖など）を両方向で） */
  function canLove2(ctx, a, b) {
    if (HK.canLove && !(HK.canLove(a, b, ctx) && HK.canLove(b, a, ctx))) return false;
    if (HK.tieLoveNoPair && (HK.tieLoveNoPair(ctx, a, b) || HK.tieLoveNoPair(ctx, b, a))) return false;
    if (HK.Ties && HK.Ties.apathy && (HK.Ties.apathy(ctx, a, b) || HK.Ties.apathy(ctx, b, a))) return false;
    if (ctx.pair && ctx.pair(a, b).kin) return false;
    return true;
  }

  /* ---------- 願望（おまかせは気質から。全年齢では「もっとエッチなこと」を選ばない） ---------- */
  var WISH_FIT = [
    function (t) { return (t.np || 0) * 0.4 + (t.ac || 0) * 0.3; },
    function (t) { return (t.ac || 0) * 0.5 + (t.fc || 0) * 0.3; },
    function (t) { return (t.np || 0) * 0.5 + 0.1; },
    function (t) { return (t.honesty || 0) * 0.5 + (t.np || 0) * 0.2; },
    function (t) { return (t.fc || 0) * 0.5 + (t.warmth || 0) * 0.3; },
    function (t) { return (t.np || 0) * 0.6 + (t.cp || 0) * 0.2; },
    function (t) { return (t.a || 0) * 0.4 + (t.fc || 0) * 0.3; },
    function (t) { return (t.ac || 0) * 0.4 + (t.warmth || 0) * 0.3; },
    function (t) { return (t.jealous || 0) * 0.7 + (t.cp || 0) * 0.2; },
    function (t) { return (t.impulse || 0) * 0.5 + (t.fc || 0) * 0.3; }
  ];
  function wishOf(ctx, c, pick) {
    var n = D.WISH.length;
    if (pick != null && pick !== 'auto' && pick !== '') { var k = +String(pick).replace(/^w/, ''); if (k >= 0 && k < n && !(k === 9 && HK.SAFE_ON)) return k; }
    var love = ctx.sk ? ctx.sk.love : true, idx = [];
    for (var i = 0; i < n; i++) if (!(i === 9 && HK.SAFE_ON) && (love || [0, 2, 5, 6].indexOf(i) >= 0)) idx.push(i);
    return HK.weighted(ctx.rng, idx, function (i) { return Math.pow(Math.max(0.05, WISH_FIT[i](c.tr || {})), 2); });
  }
  function wishName(i) { return String(D.WISH[i].t).split(/\s/)[0]; }

  /* ---------- 箱庭 ---------- */
  function opts(list, auto) { return [{ v: 'auto', label: auto || 'おまかせ' }].concat(list.map(function (t, i) { return { v: 'x' + i, label: t }; })); }
  var REL_SHORT = ['幼なじみ', '元ライバル', '長い片想いの相手', '元同僚', '文通やネットで知り合った仲', '家族ぐるみの付き合い', '復縁した元恋人', '運命的な衝動婚', '行き場のない相手を家に迎えた縁', '初めて付き合った相手どうし'];
  function relShort(i) { return REL_SHORT[i] || String(D.REL[i] || '').split(/\s/)[0]; }
  var scen = {
    id: ID, name: '新婚部屋', kicker: 'ふたり・日常',
    desc: '結婚したばかりの二人の毎日を、朝・日中・夜ごとに眺める。暮らしの中で住人ごとの目標への気持ちが高まると出来事が起き、困りごとや来客もある。同じ出来事でも、性格や関係で受け止め方が変わる。最後の夜は幸せなキスで一区切り。',
    note: '※参加は4人まで。参加者の最初の二人（住人ごとの「立場」で選べます）が新婚の二人です。三人目・四人目は、立場がおまかせなら同じ家で暮らす住人（同居人。家事の分担・大掃除・みんなの食卓・順番待ちの風呂など、三人・四人で暮らす場面に出ます。恋愛・夜の相手にはなりません）、「他の住人（訪ねてくる側）」にすると、遊びに来たり連絡をくれたりします。三人とも立場を「新婚の夫婦（配偶者）」にすると三人婚、四人とも選ぶと四人婚になります（全員が夫婦。攻めどうし・受けどうしなど恋の相手にならない組は、夫婦でも恋愛・夜の相手にならず、友人のような仲・張り合う仲などになります）。住人ごとの「目標」は、その人が新婚の暮らしで叶えたいこと（おまかせなら気質から）で、高まると目標に向けた行動が起きます。誕生日は、住人の設定の「誕生月」が日数の中に入れば、その月の行事（バレンタインなど）とは別の日に祝います。「登場しない住人を出す」なら、名簿にいて参加していない、二人と関係のある住人も訪ねてきます（関係図には出ず、恋愛も始まりません）。登場人物はすべて成人として扱います。',
    unit: '日', perUnit: 3, preRel: 0, lethal: false, minCast: 2, maxCast: 4,
    catBias: { romance: 1, bond: 1, help: 1, conflict: 0.3, combat: 0, betray: 0, kill: 0 },
    decay: 0.998, actRate: 0.2,
    derived: ['warmth', 'honesty', 'jealous', 'impulse'],
    env: [
      { id: 'days', label: '日数', min: 5, max: 14, def: 7, lo: '5日', hi: '14日', unit: '日', desc: '見守る日数。1日は朝・日中・夜の3区切り。最後の夜は幸せなキスで一区切り' },
      { id: 'home', label: '二人の住まい', type: 'select', def: 'auto', options: opts(D.HOME), desc: '二人が暮らす家' },
      { id: 'rel', label: '二人のなれそめ', type: 'select', def: 'keep', options: [{ v: 'keep', label: '元の関係のまま（住人の関係の設定どおり）' }].concat(opts(D.REL.map(function (t, i) { return relShort(i); }), 'おまかせ（新しく決める）')),
        desc: '「元の関係のまま」なら、住人の関係の設定（友人・擬似親子・同僚など）をそのまま使って暮らします（関係が無ければ新婚の夫婦）。【注意】ほかを選ぶと、二人のあいだに設定した関係を「新婚の夫婦」に上書きします（家族などで恋愛が「なし」の関係は上書きしません）' },
      { id: 'meet', label: '出会いの場所', type: 'select', def: 'auto', options: opts(D.MEET.map(function (t, i) { return meetName(i); })), desc: '二人が出会った場所' },
      { id: 'month', label: '始まりの月', type: 'select', def: 'auto', options: [{ v: 'auto', label: 'おまかせ' }].concat([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(function (m) { return { v: 'm' + m, label: m + '月' }; })),
        desc: '一日目の月。月ごとの行事（初詣・バレンタイン・ホワイトデー・花見・七夕・花火・月見・ハロウィン・クリスマス など）が、その月の日付に合わせて起きる。季節に合わない出来事（夏に雪など）は出ない' },
      { id: 'sday', label: '始まりの日', type: 'select', def: 'auto', options: [{ v: 'auto', label: 'おまかせ（その月の大きな行事の日が入るように）' }, { v: 'rand', label: 'ランダム' }, { v: 'e', label: '上旬（1日から）' }, { v: 'm', label: '中旬（11日から）' }, { v: 'l', label: '下旬（21日から）' }],
        desc: '一日目が何日か。おまかせなら、2月はバレンタイン、3月はホワイトデー、12月はクリスマス・イブの日などが日数の中に入るように始める。住人の誕生月（住人の設定）が日数の中に入れば、誕生日のお祝いも' },
      { id: 'speed', label: '目標への気持ちの高まりやすさ', type: 'select', def: 'normal', options: [{ v: 'slow', label: 'ゆっくり' }, { v: 'normal', label: 'ふつう' }, { v: 'fast', label: '早い' }], desc: '早いほど、住人ごとの目標（住人の欄）から来る行動が多く起きる' },
      { id: 'outsideNames', label: '登場しない住人を出す', type: 'select', def: 'yes', options: [{ v: 'yes', label: '出す（名簿の住人のうち、二人と関係のある人が訪ねてくる・連絡をくれる）' }, { v: 'no', label: '出さない（二人と、参加者だけ）' }],
        desc: '出られない部屋の「登場しない住人の名前を出す」と同じ読み方で、名簿にいて今回は参加していない住人のうち、新婚の二人のどちらかと関係（家族・擬似親子・友人・同僚・先輩後輩・同級生・元恋人・知人）がある人（三人まで）が、名簿の性格・口調・関係のまま、遊びに来たり、一緒に出かけたり、連絡をくれたりします。元恋人が来た日は、ヤキモチから始まる夜も。訪ねてくる住人は関係図に出ず、その人との恋愛も始まりません。参加者の三人目（住人ごとの「立場」で「他の住人」にした人）は、この設定にかかわらず同じように出ます（参加した住人なので関係図に出ます）' }
    ],
    stats: [],
    perFields: [
      /* 目標（2026-11-04 不具合リスト NO 5：以前の「最初の行動」「短期目標」の欄は意味をなしていなかったので外し、末尾にあった「願望」を先頭に移して「目標」にした。
         保存されている値の id は wish のまま。誕生日の「日」の欄（NO 5b）は外した：住人の設定の誕生月が日数の中に入れば、その月の行事と別の日に祝う） */
      { id: 'wish', label: '目標', auto: 'おまかせ（気質から）', options: D.WISH.map(function (w, i) { return { id: 'w' + i, label: wishName(i) }; }) },
      { id: 'part', label: '立場', auto: 'おまかせ（上から二人が新婚の二人、ほかは同居人）', options: [{ id: 'couple', label: '新婚の夫婦（配偶者。三人とも選ぶと三人婚、四人とも選ぶと四人婚）' }, { id: 'mate', label: '同じ家で暮らす住人（同居人。恋愛はしない）' }, { id: 'guest', label: '他の住人（訪ねてくる側）' }] },
      { id: 'work', label: '仕事の型', auto: 'おまかせ（気質から）', options: LF.WORK.map(function (w) { return { id: w.v, label: w.label }; }) },
      { id: 'job', label: '職業', type: 'text', placeholder: function () { return '例：営業、看護師（空欄でもよい）'; } },
      { id: 'role', label: '家庭での役割', auto: 'おまかせ（気質から）', options: LF.ROLE.map(function (r) { return { id: r.v, label: r.label }; }) }
    ],
    /* 最初の行動・短期目標（engine.js が住人ごとに一つ選ぶ）：画面に欄を出さないよう、遊んでいる間だけ一つずつ返す（下の HK.simulate の包み。2026-11-04 NO 5） */
    /* 経過の目次を日ごとにまとめる（本体の目次の仕組み。無い版では使われないだけ） */
    stepGroup: function (label) { var m = /^(DAY\d+（.）)(.+)$/.exec(label); return m ? { group: m[1], sub: m[2] } : null; },
    steps: function (env) {
      var n = Math.max(5, Math.min(14, +env.days || 7)), s = [];
      for (var d = 0; d < n; d++) for (var t = 0; t < 3; t++) s.push('DAY' + (d + 1) + '（' + WEEK[d % 7] + '）' + PART[t]);
      return s;
    },
    /* 新婚の二人の関係：元の関係のまま（既定）で二人のあいだに関係が無いか、なれそめを選んだ（上書き）ときは、夫婦の関係を足す（恋愛にしてよい二人だけ） */
    extraTies: function (ctx, input) { return extraTies(ctx, input); },
    othersFor: function (ctx, a) {
      var S = ctx.sk, M = S ? (S.trio || S.quad ? S.spouses : [S.A, S.B]) : null;
      return ctx.present().filter(function (c) { return c !== a && (!M || (M.indexOf(a) >= 0 && M.indexOf(c) >= 0)); });
    },
    setup: function (ctx) { setup(ctx); },
    phase: function (ctx, s, n) { phase(ctx, s, n); },
    finish: function (ctx) { finish(ctx); },
    events: []
  };
  /* ---------- 血縁・家族の関係の二人の結末（2026-11-04 利用者の追加の指示「親子・血縁が進行で友人になる」）----------
     親子・きょうだい・親族・擬似親子など家族の関係（HK.TIES の family）の二人は、結末の関係名を「血縁の種類＋様子」にする（「仲の良い擬似親子」「ぎくしゃくした親子」「夫婦になった擬似親子」）。
     友人・相棒・他人のまま などの名前にはしない。恋人・夫婦になった二人（家族の関係でも恋愛：ありの擬似親子など）は「恋人になった〜」「夫婦になった〜」。
     名前は本体の結末の表 HK.LABELS に、この部屋の札（skk_種類_様子）として足す（関係図・二人ずつの欄・その後がこの名前を読む） */
  var KIN_MOOD = { wed: ['夫婦になった', 'love', 2], love: ['恋人になった', 'love', 2], pine: ['想い合う', 'love', 2], good: ['仲の良い', 'partner', 2], guard: ['寄りかかり寄りかかられる', 'guard', 1], rough: ['ぎくしゃくした', 'enemy', -1], far: ['どこか遠慮のある', 'none', 0] };
  var KIN_TEXT = { wed: '{k}のまま、夫婦として同じ家に落ち着いた。', love: '{k}だった二人は、恋人として寄り添うようになった。', pine: '{k}のまま、互いへの想いを胸に抱えていた。', good: '{k}として、互いを支え合う形に落ち着いた。', guard: '{k}として、片方が寄りかかり、片方がそれを受け止める形に収まった。', rough: '{k}だからこそ、こじれた溝が埋まらなかった。', far: '{k}のまま、まだ少し遠慮のある距離で暮らしている。' };
  function kinTie(ctx, A, B) { var tl = HK.Ties && HK.Ties.all ? HK.Ties.all(ctx, A, B) || [] : []; return tl.filter(function (t) { var D0 = HK.TIES[t.type]; return D0 && D0.family; })[0] || null; }
  function kinLab(t) { return (HK.Sib && HK.Sib.isSibTie && HK.Sib.isSibTie(t) && t.sibLab) || (HK.TIES[t.type] || {}).label || '家族'; }
  /* 結婚している二人の結末（2026-11-04 報告：結果欄が「恋人」「両片想い」で夫婦と合わない）：仲睦まじい夫婦／穏やかな夫婦／すれ違う夫婦 */
  var WED_MOOD = { good: ['仲睦まじい夫婦', 'love', 2, '夫婦として、寄り添って暮らしている。'], calm: ['穏やかな夫婦', 'partner', 1, '夫婦として、穏やかに日々を重ねている。'], rough: ['すれ違う夫婦', 'enemy', -1, '夫婦でありながら、気持ちのすれ違いが残った。'] };
  function wedPair(ctx, A, B) {
    var S = ctx.sk; if (!S) return false;
    if (S.trio || S.quad) return S.spouses.indexOf(A) >= 0 && S.spouses.indexOf(B) >= 0 && !(S.nl && S.nl[A.i < B.i ? A.i + '-' + B.i : B.i + '-' + A.i]);
    return !!S.wedAll && ((A === S.A0 && B === S.B0) || (A === S.B0 && B === S.A0));
  }
  function wedClassify(ctx, A, B, pf) {
    if (!wedPair(ctx, A, B)) return null;
    var ab = ctx.R(A, B), ba = ctx.R(B, A), k;
    if (ab.aff < 0 || ba.aff < 0 || ab.ten > 70 || ba.ten > 70) k = 'rough';
    else if (pf.couple || pf.night || (ab.aff > 38 && ab.att > 42 && ba.aff > 38 && ba.att > 42)) k = 'good';
    else k = 'calm';
    var id = 'skw_' + k, M0 = WED_MOOD[k];
    if (!HK.LABELS[id]) HK.LABELS[id] = { name: M0[0], cls: M0[1], pol: M0[2] };
    return { id: id };
  }
  scen.classify = function (ctx, A, B, pf) {
    var t = kinTie(ctx, A, B); if (!t) return wedClassify(ctx, A, B, pf);
    var ab = ctx.R(A, B), ba = ctx.R(B, A), noL = HK.tieLoveNoPair && HK.tieLoveNoPair(ctx, A, B), k;
    var wed = HK.Ties && HK.Ties.all && (HK.Ties.all(ctx, A, B) || []).some(function (x) { return x.spouse && x.love !== 'no'; });
    var lv = function (r) { return !noL && r.aff > 38 && r.att > 42; };
    if (pf.couple || (pf.night && lv(ab) && lv(ba))) k = wed ? 'wed' : 'love';
    else if (pf.night) return null;
    else if (lv(ab) && lv(ba)) k = 'pine';
    else {
      var tenF = (ab.ten + ba.ten) / 2;
      if ((tenF > 55 && (ab.aff + ba.aff) / 2 < 30) || ab.aff < -10 || ba.aff < -10) k = 'rough';
      else if (ab.aff > 22 && ba.aff > 22) k = Math.abs(ab.trust - ba.trust) > 28 && Math.max(ab.trust, ba.trust) > 45 ? 'guard' : 'good';
      else k = tenF > 30 ? 'rough' : 'far';
    }
    var id = 'skk_' + t.type + '_' + k, M0 = KIN_MOOD[k], kn = kinLab(t);
    if (!HK.LABELS[id]) HK.LABELS[id] = { name: M0[0] + kn, cls: M0[1], pol: M0[2] };
    return { id: id, kinK: k, kin: kn };
  };
  scen.pairText = function (ctx, A, B, cl) {
    var w = /^skw_([a-z]+)$/.exec(cl && cl.id || ''); if (w) return WED_MOOD[w[1]][3];
    var m = /^skk_[a-z]+_([a-z]+)$/.exec(cl && cl.id || ''); if (!m) return null;
    var t = kinTie(ctx, A, B); return t ? KIN_TEXT[m[1]].split('{k}').join(kinLab(t)) : null;
  };
  /* ---------- 話題（住人に設定した話題の出来事。本体の topics.js）の出すぎを抑える（2026-11-04 利用者の追加の指示）----------
     本体の話題の出来事の重み（HK.Topics.SCEN_K の箱庭ごとの倍率）を、遊んでいる回の記録から決める：一日に一件まで・全体の 15% 以下・前の日に出ていれば出さない（同じ話題が二日続かない） */
  var TP_RE = /の話題（/;
  function tpRate() {
    var ctx = HK._curCtx; if (!ctx || !ctx.scen || ctx.scen.id !== ID || !ctx.log) return 1;
    var day = Math.floor((ctx.stepIndex || 0) / 3), n = 0, all = 0, today = 0, yday = 0;
    ctx.log.forEach(function (e) {
      if (!e || e.kind === 'step' || e.kind === 'phase' || !e.actors || !e.actors.length) return;
      all++;
      if (!TP_RE.test(e.why || '')) return;
      n++; var d = Math.floor((e.step || 0) / 3); if (d === day) today++; else if (d === day - 1) yday++;
    });
    if (today >= 1 || (all >= 6 && (n + 1) / (all + 1) > 0.15)) return 0;
    return yday ? 0 : 1;
  }
  function tpInstall() {
    var T = HK.Topics; if (!T || !T.SCEN_K || Object.getOwnPropertyDescriptor(T.SCEN_K, ID)) return;
    Object.defineProperty(T.SCEN_K, ID, { get: tpRate, enumerable: true, configurable: true });
  }
  tpInstall();
  if (HK.Load && HK.Load.onChunk) HK.Load.onChunk(tpInstall);
  /* 最初の行動・短期目標：遊んでいる間（RUN）だけ一つずつ（engine.js が住人ごとに選ぶため）。画面（ui.js は配列が空なら欄を出さない）には出さない */
  var RUN = 0, ACT0 = [{ id: 'live', label: 'いつもどおりに暮らす', fit: function () { return 0.5; } }], GOAL0 = [{ id: 'happy', label: '幸せに暮らしたい', fit: function () { return 0.5; } }];
  Object.defineProperty(scen, 'actions', { get: function () { return RUN ? ACT0 : []; }, enumerable: true, configurable: true });
  Object.defineProperty(scen, 'goals', { get: function () { return RUN ? GOAL0 : []; }, enumerable: true, configurable: true });
  /* R18版：エッチの回数 */
  if (!HK.SAFE_BUILD) scen.env.push({ id: 'lewdN', label: 'エッチの回数（R18）', type: 'select', def: 'mid', options: [{ v: 'low', label: '少なめ（1回）' }, { v: 'mid', label: 'ふつう（1〜2回。14日なら2〜3回）' }, { v: 'high', label: '多め（2〜3回。14日なら4〜5回。一度は長い場面）' }], desc: '一回の遊びの中で起きるエッチの場面の回数の目安（体の関係にしてよい二人だけ）。日数が長いほど増え、前半だけに偏らないように日数に配る。多めなら一度は段落を分けた長い場面になる（描写の長さが「数行で短く」のときを除く）' });

  /* 新婚の二人（住人ごとの「立場」。おまかせは上から） */
  function partOf(input, i) { var p = input && input.perChar && input.perChar[i]; return p && p.pick ? p.pick.part : null; }
  /* ---------- 夫婦の関係を足す（extraTies）。2026-11-03：三人婚・元○○ ----------
     ・元○○（元の関係のまま遊ぶ二人に、結婚しないはずの関係（shinkon-past.js の PS.exOf）がある）：恋愛にしてよい二人なら、その組の関係を外して夫婦にする（ctx._skEx に元の関係を覚える）
     ・三人婚（三人とも立場「新婚の夫婦」）：三組とも恋愛にしてよいなら、恋人・夫婦などの関係の無い組に夫婦の関係を足す。なれそめを選んだときは三組とも元の関係を外す（恋愛「なし」の関係は外さない＝三人婚にならない）
       合わなければ今までどおり上の二人だけ（ctx._skTrioNG に理由）
     関係を外すのは、包み（HK.simulate の内側）が写した入力の関係の配列（記録の入力は書き換えない） */
  function loveBoth(ctx, a, b) { return !HK.canLove || (HK.canLove(a, b, ctx) && HK.canLove(b, a, ctx)); }
  function extraTies(ctx, input) {
    var ts = input.ties || [], keep = !ctx.env.rel || ctx.env.rel === 'keep', PSx = HK.ShinkonPast;
    var T3 = trioOf(ctx.chars, input), cp = couple(ctx.chars, input), A = cp[0], B = cp[1];
    var P3 = T3 ? pairsAll(T3) : [], PA = A && B && A !== B ? [[A, B]] : [];
    var kk = function (a, b) { return a.i < b.i ? a.i + '-' + b.i : b.i + '-' + a.i; };
    var exC = {};
    if (keep && PSx && ts.length) (T3 ? P3 : PA).forEach(function (p) { var X = PSx.exOf(ts, p[0].i, p[1].i, !!T3); if (X && loveBoth(ctx, p[0], p[1])) exC[kk(p[0], p[1])] = X; });
    var drop = function (a, b, keepFam) { for (var i = ts.length - 1; i >= 0; i--) { var t = ts[i]; if (t && ((t.a === a.i && t.b === b.i) || (t.a === b.i && t.b === a.i)) && !(keepFam && HK.TIES[t.type] && HK.TIES[t.type].family)) ts.splice(i, 1); } };
    /* 元○○で外すのは結婚しないはずの関係だけ。擬似親子などの家族の関係は残す（親子は親子のまま。2026-11-04 利用者の追加の指示） */
    ctx._skEx = {}; ctx._skTrio = null; ctx._skNL = null;
    nwoSetup(ctx, input); ctx._skTrioNG = ''; ctx._skTrioNG4 = false;
    if (T3) {
      /* 2026-11-04 不具合リスト NO 1・2：三人とも・四人とも配偶者なら、全員が夫婦（性的に対象になる組がすべて夫婦なら成立）。
         恋愛にしてよい組（両方向の HK.canLove・恋愛「なし」の関係が無い・元○○）は今までどおり夫婦（恋愛あり）。
         攻めどうし・受けどうし・恋愛対象の合わない組・恋愛「なし」の関係の組は、夫婦の関係（恋愛：なし）を足す＝関係図は「夫婦」、生まれる気持ちは恋愛より下（友情・ライバル・邪魔者。shinkon-multi.js）。
         血のつながった家族（恋愛「なし」の家族）の組は夫婦にしない（家族の関係のまま）。恋愛にしてよい組が一組も無いときだけ、今までどおり上の二人 */
      var LP = [], NL = [];
      P3.forEach(function (p) {
        var a = p[0], b = p[1], tl = tiesOf(input, a, b), k = kk(a, b);
        if (exC[k]) { LP.push(p); return; }
        var kin = tl.some(function (t) { return HK.tieNoLove && HK.tieNoLove(t); });
        var nl = kin || !loveBoth(ctx, a, b) || tl.some(function (t) { return t.love === 'no'; }) || !!(HK.tiesLove && tl.length && !HK.tiesLove(tl));
        if (nl) NL.push({ p: p, kin: kin }); else LP.push(p);
      });
      if (LP.length) {
        ctx._skTrio = T3; ctx._skNL = {};
        LP.forEach(function (p) { var k = kk(p[0], p[1]); if (exC[k]) { drop(p[0], p[1], true); ctx._skEx[k] = exC[k]; } else if (!keep) drop(p[0], p[1]); });
        NL.forEach(function (x) { ctx._skNL[kk(x.p[0], x.p[1])] = x.kin ? 'kin' : 'nl'; });
        return LP.filter(function (p) { return !tiesOf(input, p[0], p[1]).some(function (t) { return /^(spouse|lover|fiance|mate)$/.test(t.type); }); })
          .map(function (p) { return { a: p[0].i, b: p[1].i, type: 'spouse', spouse: true }; })
          .concat(NL.filter(function (x) { return !x.kin; }).map(function (x) { return { a: x.p[0].i, b: x.p[1].i, type: 'spouse', spouse: true, love: 'no' }; }));
      }
      ctx._skTrioNG = '恋愛にしてよい組が一組も無い'; ctx._skTrioNG4 = T3.length === 4;
    }
    if (!PA.length) return [];
    var k0 = kk(A, B);
    if (exC[k0]) { drop(A, B, true); ctx._skEx[k0] = exC[k0]; }
    if (tiesOf(input, A, B).some(function (t) { return !(exC[k0] && HK.TIES[t.type] && HK.TIES[t.type].family); })) return [];
    if (!loveBoth(ctx, A, B)) return [];
    return [{ a: A.i, b: B.i, type: 'spouse', spouse: true }];
  }
  /* ---------- 恋愛対象（性別）だけが合わない、恋人・夫婦の設定の二人（2026-11-04 利用者の回答）----------
     新婚部屋では新婚の二人を恋人として扱う。住人の関係で恋人・夫婦・婚約者・番などを設定した二人が、性別の恋愛対象だけで恋愛・夜にならない組なら、
     この部屋の中だけ、恋愛対象を「両方」として見る（HK.canLove・HK.Pos.orients を包む。受け攻めは今までどおり見る）。
     ただし相手を固定している人（恋愛 NG・恋愛相手の固定（恋人だけ・本命・特定の相手）・恋愛しない関係＝HK.ngPairHard、性行為の相手の固定・R18 に参加しない＝HK.sexBlocked）は今までどおり */
  var LOVE_SET = /^(lover|spouse|fiance|mate|fated)$/;
  function nwoKey(a, b) { return a.i < b.i ? a.i + '-' + b.i : b.i + '-' + a.i; }
  function nwoN(c) { var x = Object.create(c); x.likes = 'both'; x.sexLikes = ''; return x; }
  function nwoSetup(ctx, input) {
    ctx._skNwo = null;
    var orig = (input && (input._skOrig || input.ties)) || [], C = ctx.chars, out = {}, n = 0;
    orig.forEach(function (t) {
      if (!t || !LOVE_SET.test(t.type) || t.love === 'no' || t.cold === 'divorced') return;
      var a = C[t.a], b = C[t.b]; if (!a || !b || a === b) return;
      if (HK.canLove && HK.canLove(a, b, ctx) && HK.canLove(b, a, ctx)) return;
      if (HK.ngPairHard && HK.ngPairHard(a, b)) return;
      if (HK.sexBlocked && HK.sexBlocked(a, b)) return;
      if (HK.canLove && !(HK.canLove(nwoN(a), nwoN(b), ctx) && HK.canLove(nwoN(b), nwoN(a), ctx))) return;
      if (HK.Pos && HK.Pos.orients && !HK.Pos.orients(nwoN(a), nwoN(b), true).length) return;
      out[nwoKey(a, b)] = 1; n++;
    });
    if (n) ctx._skNwo = out;
  }
  function nwoOn(a, b) { var c = HK._curCtx; return !!(c && c._skNwo && c.scen && c.scen.id === ID && a && b && a.i != null && b.i != null && c._skNwo[nwoKey(a, b)]); }
  if (HK.wrap && HK.canLove) HK.wrap(HK, 'canLove', function (f0) { return function (a, b, ctx) { var r = f0.apply(this, arguments); if (r || !nwoOn(a, b)) return r; return f0.call(this, nwoN(a), nwoN(b), ctx); }; });
  if (HK.wrap && HK.Pos && HK.Pos.orients) HK.wrap(HK.Pos, 'orients', function (f0) { return function (a, b, love) {
    var r = f0.apply(this, arguments); if ((r && r.length) || !nwoOn(a, b)) return r;
    var x = nwoN(a), y = nwoN(b);
    return (f0.call(this, x, y, love) || []).map(function (e) { return e.map(function (c) { return c === x ? a : c === y ? b : c; }); });
  }; });
  /* 三人婚・四人婚の顔ぶれ：参加者（名簿から訪れる住人を除く）のうち、立場を「新婚の夫婦」に選んだ人がちょうど三人か四人（2026-11-04 四人婚） */
  function trioOf(C, input) {
    var n = input && input._outN != null ? input._outN : input && input.chars ? input.chars.length : C.length;
    var t = C.filter(function (c) { return c.i < n && partOf(input, c.i) === 'couple'; });
    return t.length === 3 || t.length === 4 ? t : null;
  }
  function pairsAll(T) { var P = []; for (var i = 0; i < T.length; i++) for (var j = i + 1; j < T.length; j++) P.push([T[i], T[j]]); return P; }
  function tiesOf(input, a, b) { return ((input && input.ties) || []).filter(function (t) { return t && ((t.a === a.i && t.b === b.i) || (t.a === b.i && t.b === a.i)); }); }
  function couple(C, input) {
    var ok = C.filter(function (c) { return partOf(input, c.i) === 'couple'; });
    C.forEach(function (c) { if (ok.length < 2 && ok.indexOf(c) < 0 && partOf(input, c.i) !== 'guest' && partOf(input, c.i) !== 'mate') ok.push(c); });
    C.forEach(function (c) { if (ok.length < 2 && ok.indexOf(c) < 0) ok.push(c); });
    return ok.slice(0, 2);
  }
  function sel(ctx, id, list) {
    var v = ctx.env[id];
    if (typeof v === 'string' && /^x\d+$/.test(v)) { var k = +v.slice(1); if (k < list.length) return k; }
    return Math.floor(ctx.rng() * list.length);
  }
  function pickOfChar(ctx, c, k) { var p = ctx.input && ctx.input.perChar && ctx.input.perChar[c.i]; return p && p.pick ? p.pick[k] : null; }
  /* 共通の出来事から外すもの：体の関係の出来事（この部屋の夜は shinkon-r18.js が、きっかけの段を付けて出す）・合意のない展開・三人以上の恋愛・告白（もう夫婦）など */
  var EX_ID = /^(?:confess|take_charge|brood|lighten|mob_after|tie_spouse|grp_|poly_|ct_|cf_)/;
  /* 外す出来事は、その時点の共通の出来事の山から引く（読み取り専用の値。出来事の一覧（event-catalog.js の HK.buildPool）も、遊ぶときと同じものを外して数える。
     2026-11-03 利用者の確かめごと：一覧に「セフレといつもの部屋で落ち合う」などが並んでいた＝以前は setup で書き込んでいたので、一覧を作るときは空だった） */
  function exList() {
    /* 誕生日の出来事（双子の誕生日の話など）は、この部屋の誕生日の祝い（shinkon-cal.js。誕生日の日に出す）と重なるので出さない */
    var L0 = (HK.COMMON || []).filter(function (e) { return e.sex || e.force || EX_ID.test(e.id) || /誕生日/.test(evStr(e)); }).map(function (e) { return e.id; });
    /* 遊んでいる回（エンジンが setup のあとで出来事の山を組む）：季節に合わない共通の出来事・誕生日の出来事（日数に誕生日が無い回）も外す（2026-11-03） */
    var c = HK._curCtx;
    if (c && c.scen && c.scen.id === ID && c.sk && c.sk.cal && HK.ShinkonCal) L0 = L0.concat(seasonEx(c, L0));
    /* 結婚している二人に「気づけば目で追っていた。相手は気づいていない」（片想いの出来事）を出さない（2026-11-04 報告） */
    if (c && c.scen && c.scen.id === ID && c.sk && (c.sk.wed || c.sk.trio || c.sk.quad)) L0 = L0.concat(['glance']);
    /* 三人婚・四人婚で恋の相手どうしでない組がある家：本体の「らしくない」行動（unl_flip。強引な人の照れ・手が触れて身を引く・相手の心臓が跳ねる）は、
       その組には出さない（2026-11-05 不具合リスト NO 22）。共通の山からは外し、恋の相手の組だけで起きる同じ出来事を部屋の山に入れる（evList） */
    if (nlHome(c)) L0 = L0.concat(['unl_flip']);
    return L0;
  }
  function nlHome(c) { return !!(c && c.scen && c.scen.id === ID && c.sk && (c.sk.trio || c.sk.quad) && c.sk.nl && Object.keys(c.sk.nl).length); }
  function evList() {
    var c = HK._curCtx;
    if (!nlHome(c)) return [];
    var o = (HK.COMMON || []).filter(function (e) { return e && e.id === 'unl_flip'; })[0];
    if (!o || typeof o.when !== 'function') return [];
    return [Object.assign({}, o, { when: function (ctx, a, b) { return !nlPair(ctx, a, b) && o.when.apply(this, arguments); } })];
  }
  var EV_STR = {};
  function evStr(e) {
    if (EV_STR[e.id] != null) return EV_STR[e.id];
    var t = '';
    try { t = JSON.stringify(e, function (k, v) { return typeof v === 'function' ? String(v) : v; }); } catch (x) { t = ''; }
    return (EV_STR[e.id] = t);
  }
  function seasonEx(ctx, L0) {
    var S = ctx.sk, CL = HK.ShinkonCal, ms = {};
    for (var d = 0; d < S.days; d++) ms[CL.date(S, d).m] = 1;
    var M = Object.keys(ms).map(Number);
    return (HK.COMMON || []).filter(function (e) {
      if (!e || !e.id || L0.indexOf(e.id) >= 0) return false;
      var t = evStr(e);
      return !M.some(function (m) { return CL.okMonth(t, m); });
    }).map(function (e) { return e.id; });
  }
  Object.defineProperty(scen, 'exclude', { get: exList, enumerable: true, configurable: true });
  Object.defineProperty(scen, 'events', { get: evList, enumerable: true, configurable: true });
  /* 元の関係のまま遊ぶときの、関係の種類と名前 */
  var LOVE_T = /^(lover|spouse|fiance|mate|fated|ex|crush|almost|fwb|honmei)$/;
  function relInfo(ctx, A, B) {
    var tl = HK.Ties && HK.Ties.all ? HK.Ties.all(ctx, A, B) || [] : [];
    var t = tl.filter(function (x) { return x && x.type !== 'noobs'; })[0];
    var cls = HK.relClass ? HK.relClass(ctx, A, B) : 'none';
    var lab = t && HK.TIES[t.type] ? HK.TIES[t.type].label : '';
    return { t: t, cls: cls, label: lab, say: t && HK.Kin && HK.Kin.rel ? HK.Kin.rel(ctx, t, ctx.chars[t.a] || A, ctx.chars[t.b] || B) || lab : lab, says: t && HK.Kin && HK.Kin.rel ? HK.Kin.rel(ctx, t, ctx.chars[t.a] || A, ctx.chars[t.b] || B, 'say') || lab : lab, loveTie: !t || tl.some(function (x) { return LOVE_T.test(x.type); }) };
  }

  function setup(ctx) {
    tpInstall();
    var C = ctx.chars, cp = couple(C, ctx.input), A = cp[0], B = cp[1] || cp[0], env = ctx.env;
    var days = Math.max(5, Math.min(14, +env.days || 7));
    ctx.place = '二人の新居';
    var keep = !env.rel || env.rel === 'keep';
    /* 三人婚（extraTies で決めた三人。三組とも恋愛にしてよいときだけ） */
    var T3 = ctx._skTrio || null;
    /* 三人婚・四人婚：上の二人は恋の相手の組から（攻めどうしなど恋の相手でない組を「新婚の二人」の起点にしない。2026-11-04 NO 1） */
    if (T3) {
      var lp0 = null;
      for (var i0 = 0; i0 < T3.length && !lp0; i0++) for (var j0 = i0 + 1; j0 < T3.length && !lp0; j0++) if (canLove2(ctx, T3[i0], T3[j0]) && !(ctx._skNL && ctx._skNL[(T3[i0].i < T3[j0].i ? T3[i0].i + '-' + T3[j0].i : T3[j0].i + '-' + T3[i0].i)])) lp0 = [T3[i0], T3[j0]];
      if (lp0) T3 = lp0.concat(T3.filter(function (c) { return lp0.indexOf(c) < 0; }));
      A = T3[0]; B = T3[1];
    }
    var ri = relInfo(ctx, A, B);
    var exAB = PSX() ? PSX().info : null;
    var Q4 = !!(T3 && T3.length === 4);
    var S = ctx.sk = { days: days, A: A, B: B, A0: A, B0: B, C0: T3 ? T3[2] : null, C: T3 ? T3[2] : null, D0: Q4 ? T3[3] : null, D: Q4 ? T3[3] : null, trio: !!T3 && !Q4, quad: Q4, spouses: T3 ? T3.slice() : [A, B],
      home: sel(ctx, 'home', D.HOME), homeK: '', rel: keep && ri.t && !/^(spouse|lover|fiance|mate)$/.test(ri.t.type) ? -1 : sel(ctx, 'rel', D.REL), keep: keep, ri: ri, meet: sel(ctx, 'meet', D.MEET), meet2: 0,
      speed: env.speed === 'slow' ? 0.7 : env.speed === 'fast' ? 1.45 : 1, love: canLove2(ctx, A, B), day: null, fights: 0, makeups: 0, acts: 0, sex: 0, kissed: false, best: null, lewdMax: 0,
      troubles: 0, visits: 0, odd: 0 };
    /* 同居人（立場「同じ家で暮らす住人」か、おまかせの三人目・四人目。参加者だけ）と、訪ねてくる住人（立場「他の住人」・名簿から訪れる住人・三人婚／四人婚にならなかった配偶者） */
    var nIn = ctx.input && ctx.input._outN != null ? ctx.input._outN : (ctx.input && ctx.input.chars ? ctx.input.chars.length : C.length);
    S.M = C.filter(function (c) { var pt = partOf(ctx.input, c.i); return S.spouses.indexOf(c) < 0 && c.i < nIn && !pickOfChar(ctx, c, 'outside') && (pt === 'mate' || !pt || pt === 'auto' || (pt === 'couple' && !T3 && ctx._skTrioNG)); });
    /* 三人婚・四人婚にならなかったとき、配偶者を選んだ残りの人は同じ家で暮らす住人に（訪ねる側にして本文から消さない。2026-11-04 報告） */
    S.G = C.filter(function (c) { return S.spouses.indexOf(c) < 0 && S.M.indexOf(c) < 0; });
    S.H = S.spouses.concat(S.M);
    S.trioNG = !T3 && ctx._skTrioNG ? ctx._skTrioNG : ''; S.trioNG4 = !T3 && !!ctx._skTrioNG4;
    /* 結婚している二人か：元の関係のままで、二人の関係が恋人・夫婦などの関係（か、関係なし）。なれそめを選んだら、恋愛にしてよい二人は夫婦。三人婚は三人とも夫婦 */
    S.wed = S.love && (keep ? ri.loveTie : true);
    if (T3) { S.love = true; S.wed = true; if (HK.ShinkonMulti) HK.ShinkonMulti.setup(ctx, S); }
    /* 元○○（ライバル・不仲などで結婚した二人。shinkon-past.js）：元の関係のままでも、結婚した夫婦として始める（なれそめの言葉は使わない） */
    var X0 = exAB ? exAB(ctx, S, A, B).exr : null;
    if (X0 && keep && S.love) { S.rel = -1; S.wed = true; S.exLabel = EX_PAST[X0.k] || ''; }
    S.wedAll = !!S.wed; S.homeK = houseKind(D.HOME[S.home] || ''); S.hira = /平屋/.test(D.HOME[S.home] || '');
    /* 元の関係のまま、恋人でも夫婦でもない二人（擬似親子・友人・先輩後輩など）で恋愛にしてよい二人は、恋愛へ進む段（気持ちの変化・告白・暗黙の了解）が出るまで、
       恋愛・キス・夜の出来事を出さない（2026-11-04 報告「親代わりで、恋愛になる段がないまま 5 日目にキスと長いエッチ」） */
    if (!T3 && S.love && !S.wed && S.keep && !ri.loveTie && !(ri.t && ri.t.type === 'fear')) { S.love = false; S.loveLater = true; }
    /* 三人婚：恋人が複数いる人の恋人どうしを恋愛にしない印（engine.js の coNG）を、三人のあいだでは外す（三人とも結婚した） */
    if (T3) T3.forEach(function (c) { if (Array.isArray(c.coNG)) c.coNG = c.coNG.filter(function (i) { return !T3.some(function (o) { return o.i === i; }); }); });
    /* 季節・日付・誕生日（shinkon-cal.js） */
    if (HK.ShinkonCal) HK.ShinkonCal.setup(ctx, S);
    /* 他の住人：出番のときだけ場に出す（ほかの区切りは留守。共通の出来事に混ざらないように） */
    S.G.forEach(function (g) { g.gone = true; g.life = g.life || { job: '' }; if (pickOfChar(ctx, g, 'outside')) g.outside = true; });
    /* 同居人：仕事の型・家庭での役割を決める（家にいる日・家事をする人の判定に使う）。出番の場面のあいだだけ場に出す（shinkon-four.js） */
    S.M.forEach(function (c) {
      c.gone = true; c.mateOf = true;
      var job = pickOfChar(ctx, c, 'job'), pw = pickOfChar(ctx, c, 'work');
      c.life = { job: job ? String(job).slice(0, 20) : '' };
      if (pw && pw !== 'auto') LF.work(ctx, c, pw);
      LF.role(ctx, c, pickOfChar(ctx, c, 'role'));
      LF.work(ctx, c, pw);
    });
    var night1 = !HK.SAFE_ON && S.love && !(HK.Pos && HK.Pos.libNone && HK.Pos.libNone([A, B]));
    S.meet2 = HK.weighted(ctx.rng, D.MEET2.map(function (x, i) { return i; }), function (i) { return i === 9 && !night1 ? 0 : 1; });
    S.spouses.forEach(function (c) {
      var job = pickOfChar(ctx, c, 'job');
      c.life = { job: job ? String(job).slice(0, 20) : '' };
      /* 仕事の型を選んでいれば先に決める（在宅ワークの人のおまかせの役割は、家事を分け合う役割になりやすい。roomkit-life.js） */
      var pw = pickOfChar(ctx, c, 'work');
      if (pw && pw !== 'auto') LF.work(ctx, c, pw);
      LF.role(ctx, c, pickOfChar(ctx, c, 'role'));
      LF.work(ctx, c, pw);
      var w = wishOf(ctx, c, pickOfChar(ctx, c, 'wish'));
      J.wish(ctx, c, w, D.WISH[w].init);
    });
    if (!HK.SAFE_ON && HK.ShinkonR18 && HK.ShinkonR18.quota) S.lewdMax = HK.ShinkonR18.quota(ctx, env.lewdN, S.days) + (T3 ? 1 : 0) + (S.H.length >= 3 && !T3 ? 1 : 0);
    /* どの関係を夫婦に直したか（2026-11-03 利用者のメモ「元の関係 → 夫婦を細かく表示する」）：結末・結果の画面に出す */
    S.relFrom = relFromAll(ctx, S);
    /* 二人の紹介 */
    var home = D.HOME[S.home], meet = meetName(S.meet), intro, tx, rl;
    if (Q4) {
      tx = HK.ShinkonMulti ? HK.ShinkonMulti.intro(ctx, S, home) : HK.ShinkonFour ? HK.ShinkonFour.qSetup(ctx, S, home) : '';
      ctx.act2({ actors: T3.slice(), cat: 'romance', text: tx, why: '新婚部屋：四人の暮らしの始まり（四人婚・' + relLine(S) + '）' });
    } else if (T3) {
      tx = HK.ShinkonMulti ? HK.ShinkonMulti.intro(ctx, S, home) : HK.ShinkonTrio ? HK.ShinkonTrio.say(ctx, HK.ShinkonTrio.T.SETUP, A, B, T3[2], { home: home }) : '';
      ctx.act2({ actors: T3.slice(), cat: 'romance', text: tx, why: '新婚部屋：三人の暮らしの始まり（三人婚・' + relLine(S) + '）' });
    } else {
      if (S.rel >= 0) {
        intro = prose(ctx, 'SETUP', 0, '{a}と{b}は、結婚したばかりの二人だ。住まいは{home}。{rel}――出会いは{meet}だった。', A, B);
        if (!S.wed) intro = pickOf(ctx, NW_SETUP);
      } else if (S.wed) intro = pickOf(ctx, KEEP_WED);
      else intro = pickOf(ctx, NW_SETUP);
      rl = S.exLabel || (S.rel >= 0 && S.wed ? relShort(S.rel) : ri.say || ri.label || '同居人');
      /* 恐怖の関係のままの二人（恋愛の設定が自動など。shinkon-past.js の PS.nfSetup）：「恐怖のまま暮らし始めた」とは書かず、怖がっていた人から見た始まりの段にする */
      var nfs = !S.wed && PSX() ? PSX().nfSetup(ctx, S) : '';
      tx = nfs ? fill(ctx, nfs.t, nfs.a, nfs.b, { home: home }) : fill(ctx, intro, A, B, { home: home, rel: rl, meet: meet });
      /* 元の関係のまま：関係の色の一文 */
      if (S.rel < 0 && RC() && !S.exLabel && !nfs) { var rc = RC().rel(ctx, ri.cls); if (rc) tx += fill(ctx, rc, A, B, { rel: rl }); }
      ctx.act2({ actors: [A, B], cat: S.love ? 'romance' : 'bond', text: tx, why: '新婚部屋：二人の始まり（' + relLine(S) + '）' + (S.trioNG ? '（' + (S.trioNG4 ? '四人婚' : '三人婚') + 'にならなかった：' + S.trioNG + '）' : '') });
    }
    /* もとは恐怖の関係だった二人（2026-11-03 利用者の指示で見直し）：元恐怖（三人婚で夫婦にした「恋愛：あり」の恐怖・なれそめで上書きした二人）は恐怖の決まりを当てず、普通の二人と同じ。
       恐怖の関係のままの二人は本体の決まり（ties.js の HK.Ties.after：体の関係の欄が「あり」なら夜を止めない、「恋愛：あり」は和らぐまで恋愛しない）のまま。ここでは何も足さない */
    /* 元○○の二人の導入（「まさか私たちが結婚するなんて……」）。三人婚は組ごとに */
    if (PSX()) pairsOf(S).forEach(function (p) { PSX().intro(ctx, S, p[0], p[1]); });
    /* 恐怖の関係のままの二人の導入（「今は少し慣れてきた……多分」。shinkon-past.js の PS.nfIntro） */
    if (PSX() && PSX().nfIntro) PSX().nfIntro(ctx, S);
  }
  function PSX() { return HK.ShinkonPast; }
  /* 出会いの場所の名前：表の候補の列挙（「(読書会、オフ会、フェス)」「もしくは図書館」）を外す（2026-11-04 報告：作り手のメモが本文に出た） */
  function meetName(i) { return String(D.MEET[i] || '').replace(/\s*[(（][^)）]*[)）]/g, '').split(/\s/)[0]; }
  function pairsOf(S) { return S.trio || S.quad ? pairsAll(S.spouses) : [[S.A0, S.B0]]; }
  /* 元○○の二人の紹介に入れる、元の関係の言い方（「{rel}から夫婦になった」「{rel}だった二人」） */
  var EX_PAST = { rival: 'ライバル', bad: '犬猿の仲', enemy: '敵どうし', fear: '近寄りがたい仲', lovehate: '憎まれ口の仲', master: '主従' };
  /* ---------- どの関係を夫婦に直したか ---------- */
  function tieLab(ctx, t) {
    var D0 = HK.TIES[t.type]; if (!D0) return '';
    if (t.type === 'crush' && t.cold === 'mutual') return '両片想い';
    return D0.dir && ctx.chars[t.a] ? ctx.chars[t.a].name + 'が' + D0.roleA + 'の' + D0.label : D0.label;
  }
  var WEDT = /^(spouse)$/;
  function relFromAll(ctx, S) {
    var inp = ctx.input || {}, orig = inp._skOrig || inp.ties || [];
    return pairsOf(S).map(function (p) {
      var a = p[0], b = p[1], k = a.i < b.i ? a.i + '-' + b.i : b.i + '-' + a.i;
      var o = orig.filter(function (t) { return t && HK.TIES[t.type] && t.type !== 'noobs' && ((t.a === a.i && t.b === b.i) || (t.a === b.i && t.b === a.i)); });
      var now = HK.Ties && HK.Ties.all ? (HK.Ties.all(ctx, a, b) || []) : [];
      var nowSp = S.trio || S.quad || S.wed;
      var from = o.map(function (t) { return tieLab(ctx, t); }).filter(Boolean), how;
      var exr = PSX() ? PSX().info(ctx, S, a, b).exr : null;
      var gone = o.every(function (t) { return !now.some(function (u) { return u.type === t.type || (t.type === 'spouse' && u.spouse); }); });
      if (exr) how = 'ex';
      else if (!o.length) how = nowSp ? 'new' : 'none';
      else if (o.some(function (t) { return WEDT.test(t.type); })) how = 'same';
      else if (!S.keep && gone) how = 'override';
      else if (!S.keep) how = 'kept';
      else how = nowSp ? 'keep' : 'keepNW';
      return { a: a.i, b: b.i, from: from, how: how, ex: exr ? exr.k : '', fm: exr && exr.fm ? exr.fm : '', main: o[0] ? { type: o[0].type, a: o[0].a, b: o[0].b, cold: o[0].cold } : null };
    });
  }
  /* 関係の行（記録の理由・結末に出す）：「友人 → 夫婦（なれそめ『幼なじみ』で上書き）」など */
  function relLine(S, rf) {
    var L0 = (rf || S.relFrom || []).map(function (r) {
      var nm = function (i) { return (S.spouses.filter(function (c) { return c.i === i; })[0] || {}).name || ''; };
      var who = S.trio || S.quad ? nm(r.a) + 'と' + nm(r.b) + '：' : '', f = r.from.length ? r.from.join('・') : '関係なし';
      var PN = PSX() ? PSX().EXNAME : {};
      /* 三人婚・四人婚の恋の相手どうしでない組（攻めどうし・受けどうしなど）：夫婦ではあるが恋の相手ではない（2026-11-04 NO 1） */
      var nlx = S.nl && S.nl[r.a < r.b ? r.a + '-' + r.b : r.b + '-' + r.a], MD = HK.ShinkonMulti ? HK.ShinkonMulti.MOOD() : {};
      if (nlx) return who + (nlx.kind === 'kin' ? f + '（家族のまま。同じ家の伴侶どうし）' : (r.from.length ? f + ' → ' : '') + '夫婦（恋の相手どうしではない。' + (MD[nlx.mood] || '') + '）');
      if (r.how === 'ex') return who + f + ' → 夫婦（' + (PN[r.ex] || '元の関係') + (r.fm ? '・' + (r.fm === 'calm' ? 'もう怖くない' : 'まだ少し怖い') : '') + '。結婚して関係が変わった）';
      if (r.how === 'override') return who + f + ' → 夫婦（なれそめ「' + relShort(S.rel) + '」で上書き）';
      if (r.how === 'same') return who + 'もともと夫婦';
      if (r.how === 'new') return who + '関係なし → 新婚の夫婦';
      if (r.how === 'keep') return who + f + ' → 夫婦';
      if (r.how === 'none') return who + '関係なし（同居）';
      if (r.how === 'kept') return who + f + '（恋愛「なし」の関係なので上書きしない）';
      return who + f + '（元の関係のまま。結婚はしていない）';
    });
    return L0.join('／');
  }
  /* 元の関係のまま、恋人どうしの関係（か夫婦）の二人の紹介。{rel}＝関係の名前 */
  var KEEP_WED = [
    '{a}と{b}は、{rel}から夫婦になったばかりだ。新しい暮らしの舞台は、{home}。玄関には、二人分の靴が並んでいる。',
    '{home}で、{a}と{b}の新婚の暮らしが始まった。{rel}だった二人が、今日からは同じ家に帰ってくる。段ボールはまだいくつか残っていた。',
    '{a}は、隣で荷ほどきをする{b}を見て、まだ少し信じられない気持ちでいた。{rel}だった二人が、結婚して、同じ家で暮らしている。今日から二人の家は、{home}だ。'
  ];
  /* 結婚していない二人（元の関係のまま・恋愛にならない二人）の紹介 */
  /* ---------- 恋愛へ進む段（loveLater の二人）。日を追うごとに起こりやすく、日数の半分までには必ず ---------- */
  var STEP = {
    kawari: ['{a}は、{b}を見る自分の目が変わっていることに気づいた。{rel}として過ごしてきた年月が、いつの間にか別の気持ちに育っていた。その夜、{a}は初めて、{b}の手を自分から握った。', '{b}の何気ない笑顔に、{a}の胸が大きく跳ねた。{rel}のはずだった相手に、こんな気持ちを抱くなんて――{a}は戸惑いながらも、その気持ちから目を逸らさないことに決めた。'],
    kokuhaku: ['寝る前の居間で、{a}は意を決して{b}に向き直った。「＠{a}＠{rels}としてじゃなくて、一人の相手として、あなたが好き｜{rels}としてではなく、一人の相手として、あなたが好きだ｜{rels}としてではなく、一人の相手として、あなたが好きです」――{b}は驚いた顔をして、それから小さくうなずいた。', '{a}は、ずっと言えずにいたことを、ようやく口にした。{rel}のままでは、もういられない――。{b}はしばらく黙っていたが、やがて{a}の袖をそっとつかんで、同じ気持ちだと答えた。'],
    ryokai: ['言葉にしたわけではなかった。それでも、並んで座った{a}と{b}の肩が触れ合ったまま離れなかったとき、二人とも、もう{rel}だけの間柄ではないと分かっていた。', '目が合ったまま、{a}も{b}も視線を逸らさなかった。{rel}として何度も見てきた顔なのに、今夜は少し違って見える。どちらからともなく、二人は小さく笑い合った。']
  };
  var STEP_NAME = { kawari: '気持ちの変化', kokuhaku: '告白', ryokai: '暗黙の了解' };
  function loveStep(ctx, S, day, d) {
    if (day.sick || day.apart) return;
    var p = 0.15 + 0.15 * d, must = d >= Math.max(1, Math.floor(S.days / 2) - 1);
    if (!must && ctx.rng() > p) return;
    var A = S.A, B = S.B, hi = J.of(ctx, A).pt >= J.of(ctx, B).pt ? A : B, lo = hi === A ? B : A;
    var tA = hi.tr || {}, k = (tA.np || 0.5) + (tA.fc || 0.5) > 1.1 ? 'kokuhaku' : (tA.ac || 0.5) > 0.6 ? 'ryokai' : 'kawari';
    var rl = (S.ri && (S.ri.say || S.ri.label)) || '家族同然', rs = (S.ri && (S.ri.says || S.ri.label)) || '家族';
    S.love = true; S.stepDone = true;
    ctx.act2({ actors: [hi, lo], cat: 'romance', text: fill(ctx, pickT(ctx, STEP[k], hi, lo) || STEP[k][0], hi, lo, { rel: rl, rels: rs }), why: '新婚部屋：恋愛へ進む（' + STEP_NAME[k] + '・' + rl + 'から）',
      fx: function () { ctx.mod2(hi, lo, { aff: 6, att: 20, trust: 3 }, { aff: 6, att: 20, trust: 3 }); } });
  }
  var HIMO = ['{a}は昼近くまで寝て、起きてからはソファでゲームをしていた。相手が帰ってくる時間が近づくと、慌てて部屋を少しだけ片づけた。', '{a}は日当たりのいい窓辺でうたた寝をして、一日の大半を過ごした。冷蔵庫をのぞいて、今夜は何を作ってもらおうかと考えた。', '{a}はふらりと散歩に出て、商店街で買い食いをして帰ってきた。財布の中身が心もとないことに気づいたのは、帰り道のことだった。',
    '{a}は動画を見ながら昼までごろごろしていた。気づけばお菓子の袋が三つ空になっていて、{a}は証拠を隠すように袋をたたんだ。', '{a}は近所の公園のベンチで、知らない犬と半日遊んでいた。飼い主のおばあさんに、お茶まで分けてもらった。',
    '{a}は珍しく洗い物に手をつけたが、皿を二枚洗ったところで満足して、残りは水につけたままにした。', '{a}は通販の画面を眺めて、買うつもりのない家具を何時間も見比べていた。', '{a}は昼過ぎに起きて、相手が作り置きしてくれていたおかずを温めた。一口食べて、ありがたさがしみた。'];
  var NW_SETUP = [
    '{a}と{b}は、{rel}のまま、{home}で一緒に暮らし始めた。段ボールはまだいくつか残っているけれど、玄関には二人分の靴が並んでいる。',
    '{home}の窓から、朝の光が差し込んでいる。{a}と{b}が{rel}のまま同じ家で暮らし始めて、まだ数日しかたっていない。',
    '{a}と{b}の新しい暮らしの舞台は、{home}。{rel}として過ごしてきた二人の、少し照れくさい同居の日々が始まった。'
  ];

  /* ---------- 一日の種を引く（朝に、その日の分をまとめて） ---------- */
  function holiday(d) { return d % 7 === 5 || d % 7 === 6; }
  /* 日替わりの種の選ばれやすさ（性格で）：{a}＝主役（願望の高い人）の気質 */
  var DAILY_FIT = {
    '記念日が近い': function (t) { return 0.6 + (t.np || 0) * 0.8; }, '甘えたい／甘えられたい': function (t) { return 0.5 + (t.ac || 0) * 1.2; },
    /* 夜更かしの種は日中の区切りの文に合わないので引かない（2026-11-04 報告） */ '夜更かしして語り合う': function () { return 0; }, '家でのんびり過ごす': function (t) { return 0.6 + (1 - (t.fc || 0.5)) * 0.8; },
    '外出の予定': function (t) { return 0.5 + (t.fc || 0) * 1; }, 'いつもと違う日常': function (t) { return 0.5 + (t.impulse || 0) * 1; },
    'マンネリ解消': function (t) { return 0.4 + (t.fc || 0) * 0.6 + (t.impulse || 0) * 0.5; }, '過去を振り返る': function (t) { return 0.5 + (t.np || 0) * 0.5 + (t.ac || 0) * 0.4; }
  };
  /* ---------- 体調を崩した人の状態（2026-11-03 利用者の報告「体調が悪い人がすぐに次の行動を通ったりするのはやめてほしい」）----------
     日替わりの種「どちらかの体調が悪い」（朝の「相手のちょっとした体調不良に気がついた」と組で出す）が出た日から、その人の状態 S.sick（続く日数 1〜2 日）にする。
     状態の間（day.sick）：体調の悪い人は寝ている・休む・看病される側の文だけ。日替わりは体調の種だけ、相手は仕事を休む・早く帰る（出張・残業は取りやめ）。
       ご飯・困りごと・来客・喧嘩・願望の行動・本体の共通の出来事・夜の R18（ほのめかすも）は出さず、朝は看る文・夜はそばで過ごす文（shinkon-sick.js）。
     翌朝（day.recover）に「よくなった／まだ少しだるい」の段で状態を終える。まだ少しだるい日（day.dull）は、デート・外出・ポンコツ・一緒に出かける来客・夜の R18 を出さない。
     同じ人には一回の遊びで一度だけ。状態の間はほかの人も崩さない。最後の朝までに治るように、最後の前日までに始まるものだけ */
  /* 本体の共通の出来事を混ぜない区切りの actRate（engine.js は 0 を既定値の 1 と読むので、0 にはしない） */
  var REST_RATE = 1e-9;
  function sickOn(S, d) { var k = S.sick; return k && d >= k.from && d <= k.last ? k.c : null; }
  /* その夜は体の関係の場面を出さない（体調の悪い人がいる・まだだるい日・離れている）か */
  function restNight(ctx, day) { return !!(day && (day.sick || day.dull || day.apart)); }
  /* d の夜から最後の夜までのうち、R18 の場面を出さない（体調で休む）と決まっている夜の数 */
  function restAhead(ctx, d) {
    var S = f(ctx), k = S && S.sick, n = 0;
    if (!k) return 0;
    for (var x = d; x < S.days; x++) if ((x >= k.from && x <= k.last) || (k.dull && x === k.last + 1)) n++;
    return n;
  }
  function rollDay(ctx, d) {
    var S = f(ctx), A = S.A, B = S.B, hol = holiday(d);
    var pa = LF.day(ctx, A, d, hol), pb = LF.day(ctx, B, d, hol);
    var hi = J.of(ctx, A).pt >= J.of(ctx, B).pt ? A : B;
    var day = { d: d, hol: hol, pa: pa, pb: pb, hi: hi, lo: hi === A ? B : A }, CL = HK.ShinkonCal;
    S.curD = d;
    if (CL && S.cal) day.date = CL.date(S, d);
    if (S.trio && S.C) day.pc = LF.day(ctx, S.C, d, hol);
    /* 体調を崩している人：その日は家で休む（出張・残業は取りやめ）。看る人も出張・残業を取りやめる */
    var sc = sickOn(S, d);
    if (sc) {
      day.sick = sc; day.carer = sc === A ? B : A; day.sickDay = d - S.sick.from;
      [pa, pb].forEach(function (p, k) {
        if (p.trip) { p.trip = false; p.tripEnd = true; }
        p.late = false;
        p.home = { m: true, d: [A, B][k] === sc || p.hol || p.home.d, n: true };
      });
    } else if (S.sick && d === S.sick.last + 1 && !S.sick.done) {
      S.sick.done = true; day.recover = S.sick.c; day.carer = S.sick.c === A ? B : A; day.recoverK = S.sick.dull ? 'dull' : 'well';
      if (S.sick.dull) day.dull = S.sick.c;
      /* 治った朝は二人とも家で迎える（出張は取りやめ）。まだだるい人は残業もしない */
      [pa, pb].forEach(function (p, k) {
        if (p.trip) { p.trip = false; p.tripEnd = true; p.home = { m: true, d: p.hol, n: true }; }
        if ([A, B][k] === day.dull) p.late = false;
      });
    }
    /* 最後の日は二人とも家にいる（最後の夜の幸せなキスがあるので、出張はその日までに切り上げる）。誕生日・バレンタイン・ホワイトデー・クリスマス・イブも出張を入れない（shinkon-cal.js） */
    if (d === S.days - 1 || (CL && S.cal && CL.keyDay(S, d))) [pa, pb, day.pc].forEach(function (p) { if (p && p.trip) { p.trip = false; p.tripEnd = true; p.home = { m: true, d: p.hol, n: true }; } });
    var apart = day.apart = pa.trip || pb.trip;
    /* 出張から帰ってくる日（前の日まで出張で、今日は取りやめでなく帰ってくる一人）：朝と日中はまだ家にいない。再会は夜（2026-11-05 通し読み） */
    if (!apart && !sc && !day.recover && d > 0 && d !== S.days - 1 && !S.trio && !S.quad) {
      var bk = [[A, pa], [B, pb]].filter(function (x) { var y = lifeDay(x[0], d - 1); return y && y.trip && !x[1].tripEnd; });
      if (bk.length === 1) { day.back = bk[0][0]; bk[0][1].home = { m: false, d: false, n: true }; }
    }
    var lv = S.love, nr = function (x) { return lv || !romRow(x, S) ? 1 : 0; }, nw = function (x) { return (S.wed || !WED.test((x.k || '') + (x.t || '')) ? 1 : 0) * seaRow(ctx, x); };
    /* 新しく体調を崩してよい日か：状態の外・治った朝でない・二人とも家にいる・最後の朝までに治る・まだ崩していない人がいる */
    var canSick = !sc && !day.recover && !apart && !day.back && !(S.sick && !S.sick.done) && d <= S.days - 2 && [A, B].some(function (c) { return !(S.sickWho && S.sickWho[c.i]); }) && !keyAhead(S, d);
    /* 日替わり：離れている日は連絡、休日はデートも、家事が苦手（ポンコツ）の人がいるときだけポンコツの出来事も */
    var clumsy = [A, B].some(function (c) { return LF.clumsy(c); });
    var noChore = !LF.canChore(A) || !LF.canChore(B);
    var src = 'DAILY';
    if (!sc && !day.dull && !apart && hol && D.DATE && lv && ctx.rng() < 0.45) src = 'DATE';
    else if (!sc && !day.dull && !apart && clumsy && D.PONKOTSU && ctx.rng() < 0.26) src = 'PONKOTSU';
    day.src = src;
    var ht = hi.tr || {};
    var SICK_K = /^どちらかの体調が悪い$/;
    day.daily = J.pick(ctx, src, D[src], function (x) {
      if (!nr(x) || !nw(x)) return 0;
      if (src !== 'DAILY') return 1;
      /* 体調を崩している日は体調の種だけ。ほかの日は、崩してよい日だけ体調の種を引く */
      if (sc) return SICK_K.test(x.k) ? 1 : 0;
      if (SICK_K.test(x.k) && !canSick) return 0;
      /* まだだるい日は、外出・買い物の種を出さない */
      if (day.dull && /外出|買い物/.test(x.k)) return 0;
      /* 「普段家事をしない人も、分け合って手伝う」は、家事をしない設定の人がいる二人には出さない */
      if (noChore && /家事/.test(x.t)) return 0;
      if ((!LF.canCook(A) || !LF.canCook(B)) && /料理|作る|作って/.test(x.t)) return 0;
      /* 離れている日は連絡の種だけ（「忙しい」の種は、忙しい人が家にいる文なので出さない） */
      if (apart) return /連絡/.test(x.k) ? 3 : 0;
      var w = DAILY_FIT[x.k] ? DAILY_FIT[x.k](ht) : 1;
      return (/連絡/.test(x.k) ? 0.3 : 1) * w;
    });
    day.dailyI = D[src].indexOf(day.daily);
    /* 体調の種が出た日：その日から状態にする（体調の悪い人は、まだ崩していない人から） */
    if (!sc && day.daily && src === 'DAILY' && SICK_K.test(day.daily.k)) {
      var cands = [day.lo, day.hi].filter(function (c) { return !(S.sickWho && S.sickWho[c.i]); });
      sc = cands.length > 1 && ctx.rng() < 0.5 ? cands[1] : cands[0];
      var len = ctx.rng() < 0.45 ? 2 : 1;
      S.sick = { c: sc, from: d, last: Math.min(d + len - 1, S.days - 2), dull: ctx.rng() < 0.5, done: false };
      S.sickWho = S.sickWho || {}; S.sickWho[sc.i] = 1; S.sickN = (S.sickN || 0) + 1;
      day.sick = sc; day.carer = sc === A ? B : A; day.sickDay = 0; S.sick.carer = day.carer;
      [pa, pb].forEach(function (p, k) { p.late = false; if ([A, B][k] === sc) p.home = { m: true, d: true, n: true }; });
    }
    /* 朝：体調を崩した日は「相手のちょっとした体調不良に気がついた」（看る人の朝）。二日目は看る朝・治った朝・離れている朝は shinkon-sick.js の文 */
    if (day.sick && day.sickDay === 0) { day.intro = D.INTRO[5]; day.introWho = day.carer; }
    else if (day.sick || day.recover || apart) day.intro = null;
    /* 「昨夜の言い合いで気まずい」朝は、前の日に本当に言い合いがあったときだけ（2026-11-04 報告：喧嘩していないのに昨夜の言い合いの朝） */
    else day.intro = J.pick(ctx, 'intro', D.INTRO, function (x, i) { return (i === 5 ? 0 : 1) * (i === 0 && (src === 'DATE' || S.foughtDay !== d - 1) ? 0 : 1) * nr(x) * seaRow(ctx, x); });
    day.introI = day.intro ? D.INTRO.indexOf(day.intro) : -1;
    if (ctx.rng() < 0.35) { day.item = J.pick(ctx, 'item', D.ITEM); day.itemI = D.ITEM.indexOf(day.item); }
    /* 特別な日の種：暦の行事（バレンタイン・誕生日・クリスマスなど）は shinkon-cal.js が日付で出すので、ここでは記念日の種だけ */
    if (!day.sick && (ctx.rng() < 0.12 || (day.daily && /記念日/.test(day.daily.k)))) day.special = J.pick(ctx, 'special', D.SPECIAL, function (x) { return /記念日|出会った日/.test(x) ? 1 : 0; });
    if (!day.sick && day.daily && /喧嘩/.test(day.daily.t + (day.intro && day.intro.t))) day.fight = J.pick(ctx, 'fight', D.FIGHT, function (x) { return fightOk(x, S) ? 1 : 0; });
    day.fightInDaily = !!(day.daily && /喧嘩/.test(day.daily.t));
    /* 昨夜の言い合いの朝：喧嘩っ早い二人ほど、昼にもう一度ぶつかる */
    var cpk = ((A.tr && A.tr.cp) || 0.5) + ((B.tr && B.tr.cp) || 0.5);
    if (day.introI === 0 && ctx.rng() < 0.3 + cpk * 0.25) day.fight = day.fight || J.pick(ctx, 'fight', D.FIGHT, function (x) { return fightOk(x, S) ? 1 : 0; });
    /* ご飯（喧嘩のあとの種は喧嘩した日だけ、デート帰りの種はデートの日だけ。喧嘩が決まってから引く） */
    if (!apart && !day.sick && ctx.rng() < 0.4) { var mr = ctx.rng(); day.mealK = mr < 0.3 ? 'BREAKFAST' : hol && mr < 0.6 ? 'LUNCH' : 'DINNER'; day.meal = pickMeal(ctx, day); }
    /* 暮らしの困りごと（体調を崩している日は出さない） */
    if (HK.ShinkonTrouble && !day.sick) day.trouble = HK.ShinkonTrouble.roll(ctx, S, day);
    /* 暦の行事・誕生日（shinkon-cal.js）、元の関係・元○○の出来事（shinkon-past.js）、新婚らしい出来事（shinkon-wed.js） */
    if (CL && S.cal) CL.roll(ctx, S, day);
    if (HK.ShinkonPast) HK.ShinkonPast.roll(ctx, S, day);
    if (HK.ShinkonWed) HK.ShinkonWed.roll(ctx, S, day);
    /* 家の全員のその日の予定（三人・四人で暮らす家。shinkon-four.js） */
    var FR = HK.ShinkonFour;
    if (FR && S.H && S.H.length >= 3) FR.dayAll(ctx, S, day);
    if (S.trio) trioRoll(ctx, S, day);
    if (S.quad && FR) FR.qRoll(ctx, S, day);
    if (FR) FR.roll(ctx, S, day);
    return day;
  }
  /* 表の行の季節（デートの海・お祭り、季節の語）。暦の無い遊び（古い記録など）では絞らない */
  function seaRow(ctx, x) { return !HK.ShinkonCal || HK.ShinkonCal.rowOk(ctx, x) ? 1 : 0; }
  /* d から 3 日のうちに大事な日（誕生日・バレンタインなど）があれば、体調を崩す日を始めない */
  function keyAhead(S, d) { var CL = HK.ShinkonCal; if (!CL || !S.cal) return false; for (var k = d; k <= d + 2 && k < S.days; k++) if (CL.keyDay(S, k)) return true; return false; }
  /* ---------- 追加の出来事（暦の行事・誕生日・元の関係・新婚らしい出来事・三人婚。2026-11-03）---------- */
  function extras(ctx, day, part) {
    var S = f(ctx);
    if (HK.ShinkonCal) HK.ShinkonCal.run(ctx, S, day, part);
    if (HK.ShinkonPast) HK.ShinkonPast.run(ctx, S, day, part);
    if (HK.ShinkonWed) HK.ShinkonWed.run(ctx, S, day, part);
    if (S.trio) trioRun(ctx, S, day, part);
    if (S.quad && HK.ShinkonFour) HK.ShinkonFour.qRun(ctx, S, day, part);
    /* 三人・四人で暮らす家の場面（家事の分担・大掃除・買い出し・みんなの食卓・帰りの遅い夜・風呂の順番） */
    if (HK.ShinkonFour && part !== 'bed') HK.ShinkonFour.run(ctx, S, day, part);
  }
  /* その日、その人が家にいるか（出張でない） */
  function cHome(S, day, c) {
    if (!day || !c) return false;
    var p = c === S.A ? day.pa : c === S.B ? day.pb : day.ph && day.ph[c.i] ? day.ph[c.i] : c === S.C ? day.pc : c === S.D ? day.pd : null;
    return !(p && p.trip);
  }
  /* 三人婚：その日の「二人」（体調を崩した人と看る人の日はその二人、一人が出張なら残る二人、ほかは日ごとに回す） */
  function trioFocus(ctx, S, d) {
    var T = [S.A0, S.B0, S.C0], hol = holiday(d), k = S.sick, pair;
    if (S.trioOff == null) S.trioOff = Math.floor(ctx.rng() * 3);
    if (k && !k.done && d <= k.last + 1 && k.carer) pair = [k.c, k.carer];
    else {
      var home = d === S.days - 1 ? T : T.filter(function (c) { return !LF.day(ctx, c, d, hol).trip; });
      var P = [[T[0], T[1]], [T[0], T[2]], [T[1], T[2]]];
      pair = home.length === 2 ? home : P[(d + S.trioOff) % 3];
    }
    S.A = pair[0]; S.B = pair[1]; S.C = T.filter(function (c) { return c !== S.A && c !== S.B; })[0];
  }
  function trioRoll(ctx, S, day) {
    if (day.sick || day.apart || !cHome(S, day, S.C)) return;
    day.trioM = !day.sick && ctx.rng() < 0.45;
    var TR = HK.ShinkonTrio; if (!TR) return;
    var U = S.trioUsed = S.trioUsed || {};
    if (day.hol && !day.dull && ctx.rng() < 0.55) { var dk = TR.dateKinds().filter(function (k) { return !U[k]; }); if (dk.length) { day.trioD = { k: dk[Math.floor(ctx.rng() * dk.length)], date: true }; U[day.trioD.k] = 1; } }
    else if (ctx.rng() < 0.38) { var yk = TR.dayKinds().filter(function (k) { return !U[k]; }); if (yk.length) { day.trioD = { k: yk[Math.floor(ctx.rng() * yk.length)] }; U[day.trioD.k] = 1; } }
  }
  function trioRun(ctx, S, day, part) {
    var TR = HK.ShinkonTrio, A = S.A, B = S.B, C3 = S.C;
    if (!TR || day.sick || day.apart || !cHome(S, day, C3)) return;
    /* 名前を当てる順：一人を二人が想う三人（v）は真ん中の人を {a} に（{b}{c} が触れ合う文にならないように。shinkon-multi.js） */
    var ord = HK.ShinkonMulti && S.lp ? HK.ShinkonMulti.order(ctx, S, [A, B, C3]) : [A, B, C3].sort(function () { return ctx.rng() - 0.5; });
    if (part === 'm' && day.trioM) {
      day.trioM = false;
      var mt = TR.say(ctx, TR.T.MORN, ord[0], ord[1], ord[2]);
      if (mt) ctx.act2({ actors: ord, cat: 'romance', text: mt, why: '新婚部屋：三人の朝', fx: function () { ctx.mod2(ord[0], ord[2], { aff: 1 }, { aff: 1 }); } });
    }
    if (part === 'd' && day.trioD && !day.trioD.done) {
      day.trioD.done = true;
      var X = day.trioD, tt = TR.say(ctx, (X.date ? TR.T.DATE : TR.T.DAY)[X.k], ord[0], ord[1], ord[2]);
      if (tt) ctx.act2({ actors: ord, cat: 'romance', text: tt, why: '新婚部屋：三人の' + (X.date ? '休日（' : '日中（') + TR.KN[X.k] + '）',
        fx: function () { ctx.mod2(ord[0], ord[1], { aff: 2, att: 1 }, { aff: 2, att: 1 }); ctx.mod2(ord[0], ord[2], { aff: 2, att: 1 }, { aff: 2, att: 1 }); ctx.mod2(ord[1], ord[2], { aff: 2, att: 1 }, { aff: 2, att: 1 }); } });
    }
  }
  /* 喧嘩の種：家事のやり方の喧嘩は、家事をしない設定の人がいる二人でも（文は shinkon-text の側で担い手を見る） */
  function fightOk(x, S) { return S.love || !ROM.test(x); }
  /* ご飯の種：作る人（料理をする人）がいるか。外食・出来合い・別々の行は作る人がいなくてもよい */
  var MEAL_NONE = /喫茶店|テイクアウト|旅先の朝|カフェで|外食|別々|バラバラ|コンビニ|夜景|レストラン|デート帰り|別行動/;
  function mealNeed(row) { if (MEAL_NONE.test(row.k)) return 'none'; if (/ふたりで料理/.test(row.k)) return 'both'; if (/不慣れ/.test(row.k)) return 'clumsy'; return 'cook'; }
  function pickMeal(ctx, day) {
    var S = f(ctx), A = S.A, B = S.B, K0 = day.mealK, lv = S.love;
    var ca = LF.canCook(A), cb = LF.canCook(B);
    /* 帰りが遅い人は夕飯を作らない */
    if (K0 === 'DINNER') { if (day.pa.late) ca = false; if (day.pb.late) cb = false; }
    var unskilled = [A, B].filter(function (c) { return LF.canCook(c) && (LF.clumsy(c) || (LF.roleInfo(c.life.role) || {}).cook <= 0.5); });
    var row = J.pick(ctx, K0, D[K0], function (x) {
      if (!(lv || !romRow(x, S))) return 0;
      if (!seaRow(ctx, x)) return 0;
      if (/喧嘩/.test(x.k) && !day.fight) return 0;
      if (/デート/.test(x.k + x.t) && day.src !== 'DATE') return 0;
      /* まだだるい日は、外に食べに出かける種を出さない */
      if (day.dull && /喫茶店|旅先|カフェで|外食|夜景|レストラン|デート帰り/.test(x.k + x.t)) return 0;
      var n = mealNeed(x);
      if (n === 'both') return ca && cb ? 1 : 0;
      if (n === 'cook') return ca || cb ? 1 : 0;
      if (n === 'clumsy') return unskilled.length ? 1 : 0;
      return ca || cb ? 0.8 : 3;
    });
    if (!row) return null;
    var n = mealNeed(row), cook = null;
    if (n === 'clumsy') cook = unskilled.length > 1 ? (ctx.rng() < 0.5 ? unskilled[0] : unskilled[1]) : unskilled[0];
    else if (n === 'cook' || n === 'both') cook = LF.cookOf(ctx, [ca ? A : null, cb ? B : null].filter(Boolean));
    day.mealI = D[K0].indexOf(row); day.mealNeed = n; day.cook = cook;
    return row;
  }
  /* 理由の欄に出す種の言葉：遊び方の言葉（表・願望pt）を外す */
  function clean(t) { return String(t || '').replace(/\s*[（(]?食材表[^）)]*[）)]?/g, '').replace(/願望ptが(?:多い|高い)(?:ほう|方)が/g, '').replace(/\s+/g, ' ').trim(); }
  function dailyText(day) { return day.daily ? clean((day.daily.k ? day.daily.k + '／' : '') + day.daily.t) : ''; }
  var SRC_NAME = { DAILY: '日中の出来事', DATE: '休日のデート', PONKOTSU: '家事が苦手な人のやらかし' };

  /* 願望を高め、越えた分の願望の行動を出す */
  function gain(ctx, c, n) { var S = f(ctx); return J.add(ctx, c, Math.max(0, Math.round(n * S.speed))); }
  function wishActs(ctx, c, k, o0) {
    var S = f(ctx), w = J.of(ctx, c), o = o0 || (c === S.A ? S.B : S.A);
    for (var i = 0; i < k; i++) {
      var list = (TX().WISH4 && w.d === 3) ? TX().WISH4 : D.WISH[w.d].acts;
      var act = J.pick(ctx, 'act' + w.d + '_' + c.i, list, function (x) { return (S.love || !romRow(x, S)) && (S.wed || !WED.test(x.t)) ? seaRow(ctx, x) : 0; });
      if (!act) continue;
      var ai = list.indexOf(act), wn = wishName(w.d);
      var T = TX().ACT && TX().ACT[w.d] && TX().ACT[w.d][ai];
      if (w.d === 9 && ai === 9 && HK.Pos && HK.Pos.order && HK.Pos.order(c, o)[0] !== c) T = ['{a}は布団の上で{b}に体を預け、腕を引いて自分のほうへ倒れ込ませた。間近で見下ろしてくる{b}の目を、{a}はじっと見上げた。「……どうする？｜……どうする｜……どうしますか」', '{a}は{b}のシャツの裾を握って、ベッドの端まで引っぱった。{a}が先に仰向けになると、{b}は息を呑んで、その上に覆いかぶさった。'];
      if (Array.isArray(T)) T = T.filter(function (x) { return okText(ctx, x, c, o); });
      var t = Array.isArray(T) && T.length ? pickOf(ctx, T) : '{a}の気持ちが、また少し高まった。{a}は、' + act.t.replace(/。$/, '') + '。';
      /* 受け止め方：相手（o）の態度で（らしくない反応もある） */
      var tx = fill(ctx, t, c, o), odd = false;
      if (RC() && ctx.rng() < 0.5) { var r = RC().say(ctx, 'warm', o, c); if (r.text && okText(ctx, r.text, o, c)) { tx += fill(ctx, r.text, o, c); odd = r.odd; if (odd) tx += fill(ctx, RC().after(ctx, S.love), o, c); } }
      /* 三人婚：二人の様子を見た三人目の反応（態度 9 種） */
      var C3s = S.trio || S.quad ? S.spouses.filter(function (x) { return x !== c && x !== o && cHome(S, S.day, x); }) : [], C3 = C3s.length ? C3s[Math.floor(ctx.rng() * C3s.length)] : null, see = '';
      if (C3 && HK.ShinkonTrio && S.love && ctx.rng() < 0.35) {
        var SE = HK.ShinkonTrio.T.SEE, se = SE[RC() ? RC().per(C3) : 'gentle'] || SE.gentle;
        /* 四人婚では「三人で」の文を使わない */
        if (S.quad) se = se.filter(function (x) { return !/三人/.test(x); });
        if (se.length) see = HK.ShinkonTrio.say(ctx, se, c, o, C3);
      }
      tx += see;
      var e = ctx.act2({ actors: see ? [c, o, C3] : [c, o], cat: S.love ? 'romance' : 'bond', text: tx, odd: odd, why: '新婚部屋：目標への気持ちが高まった（' + c.name + '：' + wn + (see ? '・' + C3.name + 'も見ていた' : '') + '）', fx: function () { ctx.mod2(c, o, { aff: 3, att: S.love ? 2 : 0 }, { aff: 2 + persK(o, 'warm'), att: S.love ? 2 : 0 }); } });
      if (e) { S.acts++; J.count(ctx, 'acts'); if (odd) S.odd++; }
      S.day.urge = Math.max(S.day.urge || 0, w.d === 9 ? 1 : /^(4|7|8)$/.test(String(w.d)) ? 0.55 : 0.3);
      S.day.urgeBy = S.day.urgeBy || c;
    }
  }
  /* ---------- 受け止め方の書き足し（2026-11-05 報告「ふんと鼻を鳴らして…拳を握っていた」「とそっけなく言った」が 10 本で 12 回）----------
     新婚部屋の遊びだけ、共通の受け止め方（kit-react.js の HK.PairReact）に態度 9 種 × 3 種 × 2 本を足して 4 本ずつにし、一回の遊びで同じ文は 2 回まで、
     同じ型の付け足し（鼻を鳴らす・そっけなく・拳を握る・口の端…）も 2 回までにする。相手が出張・日中で家にいないときは「おかえり」「迎えた」「玄関」の文を使わない。
     {a}＝受け止める人、{b}＝相手。家事・料理の言い回しは書かない */
  var RX = {
    warm: {
      proud: L('{a}は腕を組んだまま、{b}のしたことを横目で確かめた。文句をつけるところが一つも見つからなくて、{a}は小さく咳払いをした。|{a}は「……まあ、合格｜……まあ、合格だ｜……まあ、合格です」と言って、{b}の頭に手を置いた。照れ隠しの手つきは、思ったより優しかった。'),
      stern: L('{a}は少し考えてから、{b}の目を見て「ありがとう｜感謝する｜ありがとうございます」と言い直した。一度で済ませないところが、{a}らしかった。|{a}は黙ってうなずき、{b}の肩を一度だけ軽く叩いた。それが{a}なりの、いちばんのお礼だった。'),
      tsun: L('{a}は「こ、こんなの、別に普通だし｜こ、こんなもの、別に普通だ｜こ、こんなの、別に普通ですし」と言いながら、何度も{b}のほうを盗み見た。|{a}は返事をする代わりに、{b}の袖の端をつまんだ。顔はそっぽを向いたままだった。'),
      gentle: L('{a}は「助かった。……あなたがいてくれてよかった｜助かった。……あなたがいてよかった｜助かりました。……あなたがいてくれてよかったです」と、目を細めた。|{a}は{b}の背中にそっと手を当てた。言葉より先に、その手のぬくもりが伝わった。'),
      devoted: L('{a}は「ありがとう、ありがとう｜ありがとう。本当に、ありがとう｜ありがとうございます、本当に」と何度も繰り返した。{b}が笑い出すまで、やめなかった。|{a}は{b}の手を両手で包んで、しばらく離さなかった。こんな人と暮らしているのだと、何度でも確かめたかった。'),
      cool: L('{a}は「……効率がいい｜……効率がいいな｜……効率がいいですね」とだけ言った。けれど、その日の{a}は、いつもより少しだけ{b}の近くに座っていた。|{a}は表情を変えずに、{b}の湯のみにお茶を注ぎ足した。{a}なりの、ありがとうの代わりだった。'),
      free: L('{a}は「天才じゃん！｜天才だな！｜天才じゃないですか！」と{b}の背中をばしばし叩いた。{b}がむせても、{a}は笑うのをやめなかった。|{a}はその場でくるりと回って、{b}の両手を取った。うれしいことがあると、{a}はいつも体ごと喜んだ。'),
      shy: L('{a}は「あ、あの……うれしい……｜あ、あの……うれしい｜あ、あの……うれしいです」と、消え入りそうな声で言った。耳まで真っ赤だった。|{a}はお礼を言おうとして、言葉が見つからずに、ぺこりと頭を下げた。顔を上げると、{b}がやさしく笑っていた。'),
      polite: L('{a}は「お手数をおかけしました。……ありがとう｜手間をかけた。……ありがとう｜お手数をおかけしました。……ありがとうございます」と、丁寧に頭を下げた。|{a}は{b}に向き直り、きちんと礼を言った。他人行儀だと笑われても、{a}はこの言い方を変える気はなかった。')
    },
    oops: {
      proud: L('{a}は大きなため息をついてから、「仕方ないな｜仕方がないな｜仕方ありませんね」と袖をまくった。ため息のわりに、手を貸す動きは早かった。|{a}は{b}の失敗を見て、一瞬だけ笑いをこらえた。それから何事もなかった顔で、{b}の隣に並んだ。'),
      stern: L('{a}はまず{b}にけががないかを確かめた。それから落ち着いた声で、何から片づけるかを一つずつ決めていった。|{a}は「次からは、こうしよう｜次からは、こうしよう｜次からは、こうしましょう」と、責めずに段取りだけを伝えた。{b}は少しだけ肩の力を抜いた。'),
      tsun: L('{a}は「ほんと、目が離せないんだから｜まったく、目が離せない｜本当に、目が離せないんですから」とぼやきながら、真っ先に駆け寄った。|{a}は呆れた顔を作ったが、{b}がしょんぼりすると、すぐに「……別に、怒ってないし｜……別に、怒っていない｜……別に、怒ってませんけど」と付け足した。'),
      gentle: L('{a}は「大丈夫、大丈夫｜大丈夫だ｜大丈夫ですよ」と笑って、{b}の背中をさすった。失敗のことより、{b}がしょげていることのほうが気になった。|{a}は散らかったものを一緒に拾いながら、「こういう日もあるよね｜こういう日もある｜こういう日もありますよね」と言った。'),
      devoted: L('{a}は自分のことのように慌てて、{b}のそばに飛んでいった。{b}が笑ってみせるまで、{a}はそばを離れなかった。|{a}は{b}の手を取って、どこも痛くないかを何度も確かめた。大げさだと言われても、{a}は気にしなかった。'),
      cool: L('{a}は一歩引いたところから状況を眺め、必要なものだけを黙って{b}に手渡した。それで、だいたいのことは片づいた。|{a}は「……想定の範囲内｜……想定の範囲内だ｜……想定の範囲内です」と言った。本当は少し驚いていたことは、{b}には言わなかった。'),
      free: L('{a}は「それ、絶対あとで笑い話になるやつ｜それは、絶対にあとで笑い話になる｜それ、絶対あとで笑い話になりますよ」と言って、{b}の肩に腕を回した。|{a}は{b}の失敗を見るなり吹き出したが、すぐに腕まくりをして手伝いに回った。笑いながらでも、手は止まらなかった。'),
      shy: L('{a}はおろおろしながらも、{b}の隣にしゃがみこんだ。何を言えばいいか分からなくて、ただ黙って手を動かした。|{a}は「わ、私も、よくやる、から｜わ、私も、よくやる……から｜わ、私も、よくやりますから」と、小さな声で{b}を励ました。'),
      polite: L('{a}は「慌てなくて大丈夫ですよ｜慌てなくていい｜慌てなくて大丈夫ですよ」と静かに言い、{b}が落ち着くのを見てから片づけにかかった。|{a}は{b}が落ち着くのを待ってから、「では、一緒に直しましょう｜では、一緒に直そう｜では、一緒に直しましょう」と申し出た。')
    },
    wait: {
      proud: L('{a}は時計を見て、それから見ていないふりをした。待っているなんて、{b}に知られたら負けだと思っていた。|{a}は「別に、待ってたわけじゃない｜別に、待っていたわけではない｜別に、待っていたわけじゃありません」と独り言を言って、またスマートフォンを手に取った。'),
      stern: L('{a}は{b}の分の予定を手帳に書き足しながら、何度も時計に目をやった。几帳面な字が、少しだけ乱れていた。|{a}は待つあいだに、明日の段取りをひととおり確かめた。それでも、時間はなかなか進まなかった。'),
      tsun: L('{a}は「遅いんだから｜遅い｜遅いんですから」と、届かないメッセージを打っては消した。三回目には、ただのスタンプだけを送った。|{a}はクッションを抱えて、{b}の座る場所をじっと見ていた。空いたままの場所が、妙に広く見えた。'),
      gentle: L('{a}は{b}の好きな飲み物を冷蔵庫に冷やしておいた。帰ってきたときに、すぐ渡せるように。|{a}は{b}から届いた短いメッセージを、何度も読み返した。それだけで、待つ時間が少しやわらかくなった。'),
      devoted: L('{a}は{b}が疲れて帰ってくるのを想像して、部屋の灯りをやわらかい色に変えた。何度もそわそわと立ち上がっては、また座った。|{a}は眠気をこらえて、{b}の連絡を待った。先に寝ていて、と言われても、そうする気にはなれなかった。'),
      cool: L('{a}は本を開いたが、同じページを三回読んでいた。気づいたところで、{a}は静かに本を閉じた。|{a}は待つあいだ、黙って部屋を片づけていた。{b}がいないと、家の中の音がやけに大きく聞こえた。'),
      free: L('{a}は{b}に、どうでもいい写真を立て続けに送った。返事がなくても、送るのが楽しかった。|{a}は{b}の枕を勝手に抱きしめて、ソファで足をばたつかせた。待つのは、{a}がいちばん苦手なことだった。'),
      shy: L('{a}は「早く会いたい」と打ちかけて、恥ずかしくなって「気をつけてね」に書き直した。送ってから、少しだけ後悔した。|{a}は{b}の上着をそっと羽織ってみた。袖が余るのを見て、一人で顔を赤くした。'),
      polite: L('{a}は{b}に「無理はなさらないでください｜無理はしないでくれ｜無理はなさらないでください」とだけ送った。それ以上を書くのは、{b}の邪魔になる気がした。|{a}は{b}の分の座布団を整えて、背筋を伸ばして待っていた。待つ姿まで、どこか礼儀正しかった。')
    }
  };
  var RX_KIND = [/鼻を鳴らし/, /そっけなく/, /拳を握/, /口の端/, /機嫌がよ/, /そっぽを向/, /真っ赤/, /耳まで/];
  function L(t) { return t.split('|'); }
  if (HK.PairReact && HK.wrap && !HK.PairReact.say._sk) HK.wrap(HK.PairReact, 'say', function (say0) {
    var g = function (ctx, kind, who, other) {
      var R0 = HK.PairReact;
      if (!ctx || !ctx.input || ctx.input.scenId !== ID || !R0.T || !R0.T[kind]) return say0.apply(this, arguments);
      var p = R0.per(who), odd = ctx.rng() < R0.pOdd(ctx), S = f(ctx), day = S && S.day;
      var arr = ((odd ? R0.ODD[kind] : R0.T[kind]) || {})[p] || [];
      if (!odd) arr = arr.concat((RX[kind] || {})[p] || []);
      /* 相手が出張・日中で家にいないとき（待つ・離れている）：帰ってきた場面の文は使わない */
      if (day && (day.apart || S.part !== 2 || kind === 'wait')) { var a2 = arr.filter(function (x) { return !/おかえり|迎えた|迎えに|玄関|帰ってきた/.test(x); }); if (a2.length) arr = a2; else if (odd) { odd = false; arr = (R0.T[kind][p] || []).concat((RX[kind] || {})[p] || []).filter(function (x) { return !/おかえり|迎えた|玄関/.test(x); }); } }
      var U = ctx._rcUsed = ctx._rcUsed || {}, KC = ctx._rcKind = ctx._rcKind || {};
      var kindOf = function (x) { for (var i = 0; i < RX_KIND.length; i++) if (RX_KIND[i].test(x)) return i; return -1; };
      var okK = function (x) { var k = kindOf(x); return k < 0 || (KC[k] || 0) < 2; };
      var a0 = arr.filter(function (x) { return !U[x] && okK(x); }), a1 = arr.filter(function (x) { return (U[x] || 0) < 2 && okK(x); });
      var l = a0.length ? a0 : a1, t = l.length ? l[Math.floor(ctx.rng() * l.length)] : '';
      if (!t) return { text: '', odd: false, per: p };
      U[t] = (U[t] || 0) + 1;
      var kk = kindOf(t); if (kk >= 0) KC[kk] = (KC[kk] || 0) + 1;
      return { text: t, odd: odd, per: p };
    };
    g._sk = true;
    return g;
  });
  /* 性格による関係の動きの大きさ（受け止める人の態度で。健気・穏やか・内気はうれしいことに大きく動き、冷静・厳格は小さい） */
  var PK_WARM = { devoted: 3, gentle: 2.5, shy: 2.5, free: 2, tsun: 2, polite: 1.5, proud: 1.5, stern: 1, cool: 1 };
  function persK(c, kind) { var p = RC() ? RC().per(c) : 'gentle'; return kind === 'warm' ? PK_WARM[p] || 1.5 : 1; }
  /* 出来事の文に受け止め方を足す：who＝受け止める人、other＝相手。{ text, odd } */
  function withReact(ctx, kind, who, other, p) {
    if (!RC() || ctx.rng() > (p == null ? 0.6 : p)) return { text: '', odd: false };
    var r = RC().say(ctx, kind, who, other);
    if (!r.text || !okText(ctx, r.text, who, other)) return { text: '', odd: false };
    var t = fill(ctx, r.text, who, other);
    if (r.odd) t += fill(ctx, RC().after(ctx, f(ctx).love), who, other);
    return { text: t, odd: r.odd };
  }

  function phase(ctx, s, n) {
    var S = f(ctx), A = S.A, B = S.B, d = Math.floor(s / 3), t = s % 3;
    if (A === B) return;
    S.part = t;
    if (s === 0) {
      ctx._touched = ctx._touched || {}; ctx._mag = ctx._mag || 0;
      if ((S.trio || S.quad) && HK.ShinkonMulti && S.lp) HK.ShinkonMulti.start(ctx, S);
      else if (S.love) ctx.mod2(A, B, { aff: 45, trust: 35, att: 45 }, { aff: 45, trust: 35, att: 45 });
      else ctx.mod2(A, B, { aff: 30, trust: 30 }, { aff: 30, trust: 30 });
    }
    /* 平日の日中は、それぞれの仕事：共通の出来事を少なく */
    scen.actRate = t === 1 && !holiday(d) ? 0.08 : 0.2;
    if (t === 0) {
      /* 三人婚・四人婚：その日の二人（出番の少ない人の組から。恋の相手どうしでない組の日は恋愛・結婚の文を外す。shinkon-multi.js） */
      if ((S.trio || S.quad) && HK.ShinkonMulti && S.lp) HK.ShinkonMulti.focus(ctx, S, d);
      else if (S.trio) trioFocus(ctx, S, d);
      else if (S.quad && HK.ShinkonFour) HK.ShinkonFour.focus(ctx, S, d);
      A = S.A; B = S.B;
      var day = S.day = rollDay(ctx, d);
      /* 体調を崩している日・出張で離れている日は、本体の共通の出来事を混ぜない（寝ている人・家にいない人が出ないように） */
      if (day.sick || day.apart) scen.actRate = REST_RATE;
      /* 看病の区切り・治った朝には、気分の一句（emotion.js。「上機嫌を隠そうともしなかった」など）を付けない（roomkit-journal.js と同じ止め方） */
      if ((day.sick || day.recover) && ctx.stepIndex != null) ctx._emoWS = ctx.stepIndex;
      if (day.recover) { sickMorning(ctx, day, day.recoverK); day.pend = []; }
      else if (day.sick && day.sickDay > 0) { sickMorning(ctx, day, 'morn'); day.pend = []; return; }
      else if (day.apart) { apartMorning(ctx, day); day.pend = []; return; }
      else if (day.back) { scen.actRate = REST_RATE; backPart(ctx, day, 'BACK_M'); day.pend = []; return; }
      if (!day.recover) {
        var it = day.introI, who = day.introWho || (it === 9 || it === 2 || it === 3 ? (ctx.rng() < 0.5 ? A : B) : day.hi);
        var other = who === A ? B : A;
        var tx = prose(ctx, 'INTRO', it, '{a}の朝――' + (day.intro ? day.intro.t : '') + '。', who, other);
        ctx.act2({ actors: [who, other], cat: S.love && it !== 7 ? 'romance' : 'bond', text: fill(ctx, tx, who, other, { special: day.special || '' }), why: '新婚部屋：朝（' + (day.intro ? day.intro.t : '') + '）' });
        if (day.sick) { day.pend = []; return; }
        var k1 = gain(ctx, who, it === 9 ? 1 + Math.floor(ctx.rng() * 10) : 1 + Math.floor(ctx.rng() * 3)), k2 = gain(ctx, other, 1 + Math.floor(ctx.rng() * 2));
        day.pend = [[who, k1], [other, k2]];
      }
      if (day.meal && day.mealK === 'BREAKFAST') meal(ctx, day);
      trouble(ctx, day, 'm');
      extras(ctx, day, 'm');
      return;
    }
    var day2 = S.day;
    if (day2.sick || day2.apart) scen.actRate = REST_RATE;
    if (day2.sick && ctx.stepIndex != null) ctx._emoWS = ctx.stepIndex;
    if (t === 1 && day2.sick) { sickDay(ctx, day2); return; }
    if (t === 1 && day2.back) { scen.actRate = REST_RATE; backPart(ctx, day2, 'BACK_D'); return; }
    if (t === 2 && day2.sick) { sickNight(ctx, day2, d); return; }
    if (t === 1) {
      [A, B].forEach(function (c) {
        var pl = c === A ? day2.pa : day2.pb;
        /* 一人の昼の一文は、一回の遊びで同じものを二度出さない（使い切ったら出さない。2026-11-05 通し読み：14 日で「〜の一日は、いつもどおりの段取りで進んだ」が 5 回） */
        if (day2.hol && !pl.trip) { if (ctx.rng() < 0.45) { var hl = c.life && c.life.role === 'r10' ? freshT(ctx, HIMO, c) : lifeLine(ctx, c, function () { return LF.roleLine(ctx, c); }); if (hl) ctx.act2({ actors: [c], cat: 'solo', text: fill(ctx, hl, c), why: '新婚部屋：休日の家のこと' }); } return; }
        /* ヒモタイプ（家事も仕事も相手に任せきり）は仕事の文を出さない（2026-11-04 報告：ヒモが仕事の資料に向かう） */
        if (c.life && c.life.role === 'r10' && !pl.trip) { var hm = ctx.rng() < 0.6 ? freshT(ctx, HIMO, c) : ''; if (hm) ctx.act2({ actors: [c], cat: 'solo', text: fill(ctx, hm, c), why: '新婚部屋：ヒモの昼' }); return; }
        var wl = ctx.rng() < (pl.trip ? 1 : 0.6) ? lifeLine(ctx, c, function () { return LF.line(ctx, c, pl); }, pl) : '';
        if (wl) ctx.act2({ actors: [c], cat: 'solo', text: fill(ctx, wl, c), why: '新婚部屋：' + (pl.trip ? '出張' : '仕事') + '（' + LF.workInfo(c.life.work).label + '）' });
      });
      trouble(ctx, day2, 'd');
      /* 休日の昼ご飯は日中の区切りに（以前は夜の区切りに「休日の昼下がり」の昼ご飯が出ていた。2026-11-04 報告） */
      if (day2.meal && day2.mealK === 'LUNCH') meal(ctx, day2);
      var dl = day2.daily, a = day2.hi, b = day2.lo;
      if (dl && /^(どちらかが忙しい|連絡がうまく取れない)$/.test(dl.k)) { var busy = day2.pa.late || day2.pa.trip ? A : day2.pb.late || day2.pb.trip ? B : null; if (busy) { a = busy === A ? B : A; b = busy; } }
      /* ポンコツ：{b} が家事が苦手（ポンコツ）な人、{a} は見守る側 */
      if (day2.src === 'PONKOTSU') { var cA = LF.clumsy(A), cB = LF.clumsy(B); b = cA && cB ? (ctx.rng() < 0.5 ? A : B) : cA ? A : B; a = b === A ? B : A; }
      var fb = '{a}と{b}の一日――' + dailyText(day2) + '。' + (day2.item ? '鍵になったのは、' + day2.item.t + '。' : '');
      var dt = prose(ctx, day2.src, day2.dailyI, fb, a, b);
      var body = fill(ctx, dt, a, b, { item: day2.item ? day2.item.t : '', special: day2.special || '', fight: day2.fight || '' });
      /* 受け止め方：ポンコツは見守る側（a）が、忙しい・連絡は待つ側（a）が、ほかは相手（b）が */
      var neg = dl && /すれ違|喧嘩|踏み込|気まず|不安|失敗|忘れ|怒|拗ね|困|はぐれ|迷子|嫉妬|視線が気|落ち着かな/.test(dl.t);
      var rk = day2.src === 'PONKOTSU' ? ['oops', a, b] : dl && /忙しい|連絡/.test(dl.k) ? ['wait', a, b] : (dl && /体調/.test(dl.k)) || neg ? null : ['warm', b, a];
      var re = rk ? withReact(ctx, rk[0], rk[1], rk[2], 0.55) : { text: '', odd: false };
      /* 恋の相手どうしでない伴侶の日（NO 22）に、その行の文がすべて外れて見出しだけの文（「AとBの一日――…」）になるときは出さない（二人の一幕は nlDay が出す） */
      var nlSkip = dt === fb && nlPair(ctx, a, b);
      var e = nlSkip ? null : ctx.act2({ actors: [a, b], cat: S.love ? 'romance' : 'bond', text: body + re.text, odd: re.odd, why: '新婚部屋：' + SRC_NAME[day2.src] + '（' + soft(dailyText(day2)) + '）', fx: function () { var kw = rk && rk[0] === 'warm' ? persK(rk[1], 'warm') : 1; ctx.mod2(a, b, { aff: 2, att: S.love ? 2 : 0 }, { aff: 1 + kw, att: S.love ? 1 + kw * 0.5 : 0 }); } });
      if (re.odd && e) S.odd++;
      if (day2.fight) {
        S.fights++;
        var ft = prose(ctx, 'FIGHT', D.FIGHT.indexOf(day2.fight), '{a}と{b}は、' + day2.fight.replace(/。$/, '') + 'ことで、少し言い合いになった。', a, b);
        if (!day2.fightInDaily) {
          /* 喧嘩の受け止め方：言われた側（b）の態度。意地を張るか、すぐ折れるか */
          var fr = withReact(ctx, 'oops', b, a, 0.35);
          ctx.act2({ actors: [a, b], cat: 'conflict', text: fill(ctx, ft, a, b) + (fr.odd ? fr.text : ''), odd: fr.odd, why: '新婚部屋：小さな喧嘩（' + day2.fight + '）', fx: function () { ctx.mod2(a, b, { aff: -3, ten: 6 }, { aff: -3, ten: 6 }); } });
        }
        day2.fought = true; S.foughtDay = day2.d;
      }
      extras(ctx, day2, 'd');
      /* 三人婚・四人婚で、その日の二人が恋の相手どうしでない日：二人の一幕（友人のよう・張り合う・互いを邪魔に思う。shinkon-multi.js） */
      if (!S.love && (S.trio || S.quad) && HK.ShinkonMulti && S.nl) HK.ShinkonMulti.nlDay(ctx, S, day2);
      visit(ctx, day2, 'd');
      /* R18版：家に三人以上で暮らしていて、ほかの人が仕事・外出で留守の日中に、夫婦の二人の場面（shinkon-r18-four.js。体の関係にしてよい組だけ＝攻めどうしは出ない） */
      if (!HK.SAFE_ON && HK.ShinkonR18Four && !day2.visited && !day2.trioD && !day2.quadD && HK.ShinkonR18Four.futari(ctx, S, day2)) S.sex++;
      var g1 = gain(ctx, a, 2 + Math.floor(ctx.rng() * 4)), g2 = gain(ctx, b, 1 + Math.floor(ctx.rng() * 4));
      day2.pend.push([a, g1], [b, g2]);
      if (e && !S.best && !neg && !(dl && /忙しい|連絡|体調/.test(dl.k))) S.best = { d: day2.d, label: 'DAY' + (day2.d + 1), why: soft(dailyText(day2)) };
      return;
    }
    /* 夜 */
    if (day2.back) backPart(ctx, day2, 'BACK_N');
    trouble(ctx, day2, 'n');
    if (day2.meal && day2.mealK === 'DINNER') meal(ctx, day2);
    visit(ctx, day2, 'n');
    if (day2.fought) {
      /* 仲直り：謝る側は、喧嘩を言い出した側より NP の高いほう（意地っ張り・強気は自分からは謝りにくい） */
      var lo = day2.lo, hi = day2.hi, pl = RC() ? RC().per(lo) : '';
      if ((pl === 'proud' || pl === 'tsun') && ctx.rng() < 0.6) { var sw = lo; lo = hi; hi = sw; }
      /* 仲直りの文は一回の遊びで同じものを二度使わない（pickT。2026-11-04 報告：一字一句同じ仲直りが 2 日） */
      var MK0 = TX().MAKEUP && TX().MAKEUP[0], mk = '';
      /* 恋の相手どうしでない伴侶の仲直り（NO 22）：気持ち（友人のよう・張り合う・邪魔に思う・家族）ごとの、相棒・好敵手・同居人の仲直り（shinkon-multi-text.js の NL[気持ち].makeup） */
      var nlMood = nlPair(ctx, lo, hi) && HK.ShinkonMulti ? HK.ShinkonMulti.mood(S, lo, hi) : '', NLT = nlMood && HK.ShinkonMultiText && HK.ShinkonMultiText.NL ? HK.ShinkonMultiText.NL[nlMood] || HK.ShinkonMultiText.NL.tomo : null;
      if (NLT && NLT.makeup) mk = pickT(ctx, NLT.makeup, lo, hi);
      else if (Array.isArray(MK0)) mk = pickT(ctx, MK0, lo, hi);
      if (!mk) mk = prose(ctx, 'MAKEUP', 0, '寝る前に、{a}のほうから「さっきはごめん｜さっきは悪かった｜先ほどはすみませんでした」と切り出した。{b}は小さくうなずいた。', lo, hi);
      if (ctx.act2({ actors: [lo, hi], cat: 'bond', text: fill(ctx, mk, lo, hi), why: '新婚部屋：仲直り（' + lo.name + 'から）', fx: function () { ctx.mod2(lo, hi, { aff: 4, ten: -6 }, { aff: 4, ten: -6 }); } })) S.makeups++;
    }
    extras(ctx, day2, 'n');
    var gn1 = gain(ctx, A, Math.floor(ctx.rng() * 3)), gn2 = gain(ctx, B, Math.floor(ctx.rng() * 3));
    day2.pend.push([A, gn1], [B, gn2]);
    var OTH = S.trio ? [S.C] : S.quad ? [S.C, S.D] : [];
    OTH.forEach(function (x) { if (x && cHome(S, day2, x)) day2.pend.push([x, gain(ctx, x, 1 + Math.floor(ctx.rng() * 4))]); });
    var crossed = {}; day2.pend.forEach(function (p) { crossed[p[0].i] = (crossed[p[0].i] || 0) + p[1]; });
    /* 願望の行動は相手と一緒の場面なので、どちらかが出張で家にいない日は出さない。三人婚の三人目は、二人のどちらかと */
    /* その日の二人が恋の相手どうしでない日（三人婚・四人婚）は、二人それぞれの願望の行動の相手を、家にいる恋の相手にする（2026-11-05 NO 22：攻めどうしに「独り占め」「言葉で聞きたい」が出ていた） */
    var nlDay0 = nlPair(ctx, A, B);
    if (!day2.apart) [A, B].forEach(function (c) {
      if (!crossed[c.i]) return;
      if (!nlDay0) { wishActs(ctx, c, Math.min(2, crossed[c.i])); return; }
      var MU = HK.ShinkonMulti, o3 = MU && S.lp ? MU.partner(ctx, S, c, S.spouses.filter(function (x) { return cHome(S, day2, x); })) : null;
      if (!o3) return;
      var lv3 = S.love, wd3 = S.wed;
      S.love = true; S.wed = true;
      try { wishActs(ctx, c, Math.min(2, crossed[c.i]), o3); } finally { S.love = lv3; S.wed = wd3; }
    });
    /* 三人目・四人目の願望の行動の相手は、その日の二人のうちの恋の相手（いなければ出さない。恋の相手どうしでない組に恋愛の文を出さない。2026-11-04 NO 1） */
    if (!day2.apart) OTH.forEach(function (x) {
      if (!x || !cHome(S, day2, x) || !crossed[x.i]) return;
      var MU = HK.ShinkonMulti, o2 = MU && S.lp ? MU.partner(ctx, S, x, [A, B]) : (ctx.rng() < 0.5 ? A : B);
      if (!o2) return;
      var lv0 = S.love, wd0 = S.wed;
      if (MU && S.lp) { S.love = true; S.wed = true; }
      try { wishActs(ctx, x, Math.min(2, crossed[x.i]), o2); } finally { S.love = lv0; S.wed = wd0; }
    });
    /* 寝る前の新婚らしい出来事（イエスノー枕。夜の場面の直前） */
    if (S.loveLater && !S.stepDone) loveStep(ctx, S, day2, d);
    if (HK.ShinkonWed) HK.ShinkonWed.run(ctx, S, day2, 'bed');
    /* 回数を日数に配る（その日までに出してよい回数を超えていれば、この夜は場面を出さない。HK.ShinkonR18.paceOk） */
    var held = !HK.SAFE_ON && !!HK.ShinkonR18 && !!HK.ShinkonR18.paceOk && !HK.ShinkonR18.paceOk(ctx, S, d), sexed = false, lastN = d === S.days - 1;
    /* 三人婚・四人婚の夜（2026-11-05 不具合リスト NO 20「3P・4P が発生しない。基本はその人数でのエッチがメイン。たまに留守の人がいると 2P」）：
       全員が家にいる夜は、夜の起こりやすさ（HK.ShinkonR18.multiRoll）を振って、当たれば三人の夜（shinkon-r18-trio.js）・四人の夜（shinkon-r18-four.js）。
       外れた夜は二人の夜も出さない。新婚らしい入口（裸エプロン・イエスの枕など二人の出来事）のある夜は半々で二人の夜に譲る。
       三人・四人の夜の条件が合わない夜（受け攻めの組が作れない・ほのめかすで形が無いなど）だけ、家にいる恋の相手の二人の夜に落ちる。
       一人が留守の四人婚は、残る三人の形が作れれば 6 割で三人の夜、ほか（二人以上が留守・三人婚で一人が留守）は二人の夜 */
    var MS = (S.trio || S.quad) && !HK.SAFE_ON && !!HK.ShinkonR18Trio && !!HK.ShinkonR18 && !!HK.ShinkonR18.multiRoll;
    var homeAll = MS && !day2.apart && S.spouses.every(function (c) { return cHome(S, day2, c); }), multiGo = null;
    var multiOk = function () { return !held && S.sex < S.lewdMax && !restNight(ctx, day2) && !day2.noSex && !day2.futari; };
    var asLove = function (fn) { var lv2 = S.love, wd2 = S.wed; S.love = true; S.wed = true; try { return fn(); } finally { S.love = lv2; S.wed = wd2; } };
    if (MS && homeAll && multiOk() && !(day2.r18x && ctx.rng() < 0.5)) {
      multiGo = HK.ShinkonR18.multiRoll(ctx, S, day2, lastN);
      if (multiGo) sexed = asLove(function () {
        if (S.quad) return !!HK.ShinkonR18Four && HK.ShinkonR18Four.quad(ctx, S, day2, lastN, { sure: true });
        return HK.ShinkonR18Trio.night(ctx, S, day2, lastN);
      });
      S.multiN = S.multiN || { roll: 0, hit: 0, fail: 0 }; S.multiN.roll++; if (multiGo) { if (sexed) S.multiN.hit++; else S.multiN.fail++; }
    }
    /* 四人婚で一人が留守の夜（2026-11-04 利用者の回答「三人の夜があってもよい」）：残る三人が三人婚と同じ条件（HK.Pos.trioPlan で組が二つ以上・形が作れる）なら 6 割で三人の夜 */
    if (!sexed && MS && S.quad && !homeAll && multiOk() && !day2.r18x) {
      var away4 = S.spouses.filter(function (c) { return !cHome(S, day2, c); });
      if (away4.length === 1 && ctx.rng() < 0.6) sexed = asLove(function () { return HK.ShinkonR18Trio.night(ctx, S, day2, lastN, { g: S.spouses.filter(function (c) { return c !== away4[0]; }), away: away4[0] }); });
    }
    if (multiGo === false) held = true;
    if (!sexed && !held && !HK.SAFE_ON && HK.ShinkonR18 && S.sex < S.lewdMax && !restNight(ctx, day2) && !day2.futari) {
      /* 三人婚・四人婚でその日の二人が恋の相手どうしでない夜は、家にいる恋の相手の組の夜（攻めどうし・受けどうしの夜は出さない） */
      var NP = [A, B], MU2 = HK.ShinkonMulti;
      if ((S.trio || S.quad) && MU2 && S.lp && !S.love) NP = MU2.lovePair(ctx, S, day2, function (c) { return cHome(S, day2, c); });
      if (NP) {
        var lv1 = S.love, wd1 = S.wed;
        if ((S.trio || S.quad) && MU2 && S.lp) { S.love = true; S.wed = true; }
        try { sexed = HK.ShinkonR18.night(ctx, NP[0], NP[1], day2, lastN); } finally { S.love = lv1; S.wed = wd1; }
        if (sexed && MU2 && MU2.sexed) MU2.sexed(S, NP[0], NP[1]);
      }
    }
    if (sexed) S.sex++;
    /* 三人婚：夜の場面の無い夜は、ときどき三人並んで眠る段 */
    if (S.trio && !sexed && !day2.apart && !day2.sick && cHome(S, day2, S.C) && !lastN && HK.ShinkonTrio && ctx.rng() < 0.3) {
      var no3 = HK.ShinkonMulti && S.lp ? HK.ShinkonMulti.order(ctx, S, [A, B, S.C]) : [A, B, S.C];
      var nt = HK.ShinkonTrio.say(ctx, HK.ShinkonTrio.T.NIGHT, no3[0], no3[1], no3[2]);
      if (nt) ctx.act2({ actors: no3, cat: 'romance', text: nt, why: '新婚部屋：三人並んで眠る夜', fx: function () { ctx.mod2(no3[0], no3[1], { aff: 1 }, { aff: 1 }); ctx.mod2(no3[0], no3[2], { aff: 1 }, { aff: 1 }); } });
    }
    /* 四人婚：夜の場面の無い夜は、ときどき四人で布団を並べて眠る段 */
    if (S.quad && !sexed && !day2.sick && !lastN && HK.ShinkonFour && ctx.rng() < 0.3) HK.ShinkonFour.qNight(ctx, S, day2);
    /* 恋の相手どうしでない伴侶の日の一日の終わり（NO 22）：その二人の気持ちごとの一文（相棒・好敵手・同居人）。恋の相手どうしの「一日の終わり」の表は使わない */
    var nlM = !day2.apart && nlPair(ctx, A, B) && HK.ShinkonMulti ? HK.ShinkonMulti.mood(S, A, B) : '';
    if (nlM) {
      var NLE = HK.ShinkonMultiText && HK.ShinkonMultiText.NL ? (HK.ShinkonMultiText.NL[nlM] || HK.ShinkonMultiText.NL.tomo).end : null, ne = NLE ? pickT(ctx, NLE, A, B) : '';
      if (ne && ctx.rng() < 0.6) ctx.act2({ actors: [A, B], cat: 'bond', text: fill(ctx, ne, A, B), why: '新婚部屋：一日の終わり（恋の相手でない伴侶どうし・' + ((HK.ShinkonMultiText.MOOD || {})[nlM] || '') + '）' });
      if (d === S.days - 1) { ending(ctx); return; }
      return;
    }
    var en = day2.apart ? null : J.pick(ctx, 'end', D.END, function (x) { return (S.love || !romRow(x, S) ? 1 : 0) * (S.wed || !WED.test(x.t) ? 1 : 0) * seaRow(ctx, x) * (day2.fought && /不安|動揺|戸惑/.test(x.t) ? 1.5 : 1); });
    var dist = distance(ctx, day2);
    if (en) {
      var et = prose(ctx, 'END', D.END.indexOf(en), '一日の終わりに、{a}は思った――' + en.t.replace(/。$/, '') + '。', day2.hi, day2.lo);
      /* 心の距離の一文は、一日の終わりの文の向き（不安・すれ違い）に合うときだけ（2026-11-04 報告「心の距離が縮まった」が不安の文のあとに付いた） */
      if (dist && SAD_RE.test(et) && !SAD_RE.test(dist)) dist = '';
      ctx.act2({ actors: [day2.hi, day2.lo], cat: S.love ? 'romance' : 'bond', text: fill(ctx, et, day2.hi, day2.lo) + (dist && d !== S.days - 1 ? dist : ''), why: '新婚部屋：一日の終わり（' + en.k + '）' });
    } else if (dist && d !== S.days - 1) ctx.act2({ actors: [A, B], cat: 'bond', text: dist, why: '新婚部屋：離れて過ごした一日' });
    if (d === S.days - 1) { ending(ctx); return; }
  }
  /* ---------- 体調を崩した人を看る段・出張で離れて迎える朝（文は shinkon-sick.js。{a}＝看る人、{b}＝体調の悪い人） ---------- */
  function SK() { return HK.ShinkonSick || {}; }
  function pickT(ctx, arr, a, b) {
    var p = (arr || []).filter(function (x) { return okText(ctx, x, a, b); });
    if (HK.relFilter && a && b && p.length) { var r = HK.relFilter(ctx, p, a, b); if (r && r.length) p = r; }
    /* 一回の遊びで同じ文を続けて使わない（使っていない文から） */
    var U = f(ctx).skUsed = f(ctx).skUsed || {}, q = p.filter(function (x) { return !U[x]; });
    var t = pickOf(ctx, q.length ? q : p);
    if (t) U[t] = 1;
    return t;
  }
  /* 使っていない文だけから（使い切ったら ''） */
  function freshT(ctx, arr, c) {
    var U = f(ctx).skUsed = f(ctx).skUsed || {}, q = (arr || []).filter(function (x) { return !U[x] && okText(ctx, x, c, c); });
    var t = pickOf(ctx, q); if (t) U[t] = 1; return t || '';
  }
  /* 本体の暮らしの一文（roomkit-life.js）を、使っていない・区切りに合う文が出るまで引き直す（6 回まで。出なければ ''） */
  function lifeLine(ctx, c, gen, pl) {
    var U = f(ctx).skUsed = f(ctx).skUsed || {};
    /* 仕事の型「出張が多い」の人の、出張でない日に出張先の一文を出さない（本体の暮らしの一文は、仕事の型 trip の文と出張の日の文が同じ表。2026-11-05 通し読み） */
    var noTrip = !(pl && pl.trip);
    for (var i = 0; i < 6; i++) { var t = gen(); if (t && !U[t] && okText(ctx, t, c, c) && !/夕飯|夕食|晩ご飯/.test(t) && !(noTrip && /出張/.test(t))) { U[t] = 1; return t; } }
    return '';
  }
  /* 看病を受ける人（b）の受け止め方（態度9種） */
  function careReact(ctx, a, b, p) {
    if (ctx.rng() > p) return '';
    var R = SK().REACT || {}, k = RC() ? RC().per(b) : 'gentle';
    var t = pickT(ctx, R[k] || R.gentle, a, b);
    return t ? fill(ctx, t, a, b) : '';
  }
  var SICK_WHY = { morn: '看病の朝', well: '体調がよくなった朝', dull: '熱は下がったがまだだるい朝' };
  function sickMorning(ctx, day, kind) {
    var S = f(ctx), b = kind === 'morn' ? day.sick : day.recover, a = day.carer;
    var t = pickT(ctx, SK()[kind === 'morn' ? 'MORN' : kind === 'well' ? 'WELL' : 'DULL'], a, b);
    if (!t) return;
    var tx = fill(ctx, t, a, b) + (kind === 'morn' ? careReact(ctx, a, b, 0.5) : '');
    ctx.act2({ actors: [a, b], cat: 'bond', text: tx, why: '新婚部屋：' + SICK_WHY[kind] + '（' + b.name + '）', fx: function () { ctx.mod2(a, b, { aff: 1, trust: 1 }, { aff: 2, trust: 2 }); } });
  }
  function sickDay(ctx, day) {
    var S = f(ctx), a = day.carer, b = day.sick, W = SK().WORK || {};
    if (!day.hol) {
      var wb = (b.life && b.life.work) || 'regular', wa = (a.life && a.life.work) || 'regular';
      if (wb !== 'home') { var rt = pickT(ctx, SK().REST, a, b); if (rt) ctx.act2({ actors: [b], cat: 'solo', text: fill(ctx, rt, a, b), why: '新婚部屋：体調を崩して休んだ（' + b.name + '）' }); }
      if (wa !== 'home') {
        var wt = pickT(ctx, wa === 'remote' ? W.remote : W.out, a, b);
        if (wt) ctx.act2({ actors: [a, b], cat: 'bond', text: fill(ctx, wt, a, b), why: '新婚部屋：看病のために仕事を休んだ（' + a.name + '）' });
      }
    }
    var fb = '{a}は、体調を崩した{b}のそばについていた。';
    var dt = prose(ctx, 'DAILY', day.dailyI, fb, a, b);
    var body = fill(ctx, dt, a, b, { item: day.item ? day.item.t : '', special: '', fight: '' }) + careReact(ctx, a, b, 0.6);
    ctx.act2({ actors: [a, b], cat: S.love ? 'romance' : 'bond', text: body, why: '新婚部屋：日中の出来事（' + soft(dailyText(day)) + '・' + b.name + 'が体調を崩した）', fx: function () { ctx.mod2(a, b, { aff: 1, trust: 1 }, { aff: 2 + persK(b, 'warm') * 0.5, trust: 2 }); } });
  }
  function sickNight(ctx, day, d) {
    var S = f(ctx), a = day.carer, b = day.sick;
    var t = pickT(ctx, SK().NIGHT, a, b);
    if (t) ctx.act2({ actors: [a, b], cat: 'bond', text: fill(ctx, t, a, b), why: '新婚部屋：看病の夜（' + b.name + '）', fx: function () { ctx.mod2(a, b, { aff: 1, trust: 1 }, { aff: 2, trust: 2 }); } });
    /* 三人・四人で暮らす家：残りの皆で看る（shinkon-four.js） */
    if (HK.ShinkonFour) HK.ShinkonFour.run(ctx, S, day, 'n');
    if (d === S.days - 1) ending(ctx);
  }
  /* 出張から帰ってくる日の朝・日中の一段（{a}＝家で待つ人、{b}＝帰ってくる人） */
  function backPart(ctx, day, key) {
    var S = f(ctx), b = day.back, a = b === S.A ? S.B : S.A;
    var t = pickT(ctx, SK()[key], a, b);
    if (!t) return;
    ctx.act2({ actors: [a, b], cat: key === 'BACK_N' ? (S.love ? 'romance' : 'bond') : 'solo', text: fill(ctx, t, a, b), why: '新婚部屋：' + (key === 'BACK_M' ? '朝' : key === 'BACK_D' ? '日中' : '夜') + '（' + b.name + (key === 'BACK_N' ? 'が出張から帰ってきた）' : 'が出張から帰ってくる日）') });
  }
  function apartMorning(ctx, day) {
    var S = f(ctx), A = S.A, B = S.B, both = day.pa.trip && day.pb.trip;
    var b = both ? B : day.pa.trip ? A : B, a = b === A ? B : A;
    var t = pickT(ctx, both ? SK().APART2 : SK().APART, a, b);
    if (!t) return;
    ctx.act2({ actors: [a, b], cat: 'solo', text: fill(ctx, t, a, b), why: '新婚部屋：朝（' + (both ? '二人とも出張' : b.name + 'が出張') + '）' });
  }
  /* 困りごと（その区切りのもの）：当人の文＋受け止める人の反応（態度・らしくない）＋決着（気質で：笑い話・一緒に何とかする・小さな言い合い） */
  function trouble(ctx, day, part) {
    var S = f(ctx), c = day.trouble, TR = HK.ShinkonTrouble;
    if (!c || c.tr.part !== part || c.done) return;
    c.done = true;
    var a = c.who, b = c.other, pb = b === S.A ? day.pa : day.pb, pa = a === S.A ? day.pa : day.pb;
    var t = TR.text(ctx, S, day, c);
    if (!t) return;
    var together = !pa.trip && !pb.trip;
    var tx = fill(ctx, t, a, b), odd = false, oc = null;
    if (together && RC()) {
      var r = RC().say(ctx, c.tr.kind, b, a);
      if (r.text && okText(ctx, r.text, b, a)) { tx += fill(ctx, r.text, b, a); odd = r.odd; if (odd) tx += fill(ctx, RC().after(ctx, S.love), b, a); }
      if (c.tr.kind === 'oops') {
        oc = RC().outcome(ctx, b, a, odd);
        /* デートの日の朝・日中の困りごとは、言い合いにしない（言い合いのすぐあとに仲良くデートに出かけないように） */
        if (oc === 'spat' && day.src === 'DATE' && part !== 'n') oc = 'laugh';
        tx += fill(ctx, RC().outText(ctx, oc), b, a);
      }
    }
    /* 三人婚：困りごとに三人目が駆けつける */
    var helper = null;
    if (S.trio && together && cHome(S, day, S.C) && HK.ShinkonTrio && ctx.rng() < 0.5) { var hl = HK.ShinkonTrio.say(ctx, HK.ShinkonTrio.T.HELP, a, b, S.C); if (hl) { tx += hl; helper = S.C; } }
    /* 四人婚：ほかの二人が駆けつける */
    var helper2 = null;
    if (S.quad && together && HK.ShinkonFour && ctx.rng() < 0.45) { var qh = HK.ShinkonFour.qHelp(ctx, S, day, a, b); if (qh) { tx += qh.t; helper = qh.who[0]; helper2 = qh.who[1]; } }
    if (c.tr.id === 'rain') day.rain = a;
    if (c.tr.id === 'dark') day.dark = true;
    if (c.tr.id === 'forgot') day.forgot = a;
    if (c.tr.id === 'overtime' || c.tr.id === 'train') day.lateHome = a;
    var e = ctx.act2({ actors: together ? (helper ? [a, b, helper].concat(helper2 ? [helper2] : []) : [a, b]) : [a], cat: oc === 'spat' ? 'conflict' : together ? 'bond' : 'solo', text: tx, odd: odd, why: '新婚部屋：困りごと（' + TROUBLE_NAME[c.tr.id] + '）' + (oc ? '・' + OUT_NAME[oc] : '') + (helper ? '・' + helper.name + (helper2 ? 'と' + helper2.name : '') + 'も手伝った' : ''),
      fx: function () { if (!together) return; if (oc === 'spat') ctx.mod2(a, b, { aff: -2, ten: 5 }, { aff: -2, ten: 5 }); else ctx.mod2(a, b, { aff: 2, trust: 2 }, { aff: 2, trust: oc === 'help' ? 3 : 1 }); } });
    if (e) { S.troubles++; if (odd) S.odd++; }
    if (oc === 'spat' && e) { day.fought = true; S.fights++; day.lo = a; day.hi = b; }
  }
  var TROUBLE_NAME = { burnt: 'ご飯を焦がした', overtime: '残業で遅くなった', train: '電車が止まった', rain: '急な雨', appliance: '家電の故障', oversleep: '寝坊', lockout: '鍵を忘れた', dark: '停電', trip: '出張先で', remote: '在宅の仕事中に', deadline: '締め切り', shift: '勤務のすれ違い', parcel: '宅配の受け取り損ね', bug: '虫が出た', forgot: '買い忘れ', spill: 'コーヒーをこぼした', noise: '工事の音' };
  var OUT_NAME = { laugh: '笑い話に', help: '一緒に何とかした', spat: '小さな言い合いに' };
  /* 他の住人の訪れ（shinkon-visit.js） */
  function visit(ctx, day, part) {
    var S = f(ctx), VI = HK.ShinkonVisit;
    if (!VI || day.visited || day.sick) return;
    var v = VI.roll(ctx, S, day, part);
    if (!v) return;
    /* まだだるい日は、一緒に出かける来客を出さない */
    if (day.dull && v.kind === 'out') return;
    day.visited = true;
    var g = v.g, ex = { g: g.name, gl: VI.word(ctx, v.host, g) };
    g.gone = false;
    try {
      var t = VI.text(ctx, v);
      var e = ctx.act2({ actors: v.kind === 'contact' ? [v.host, g] : [v.host, g, v.other], cat: 'bond', text: fill(ctx, t, v.host, v.other, ex), why: '新婚部屋：' + { visit: '他の住人が遊びに来た', out: '他の住人と出かけた', contact: '他の住人から連絡が来た' }[v.kind] + '（' + g.name + '・' + ex.gl + '）',
        fx: function () { if (!g.outside) ctx.mod2(v.host, g, { aff: 3, trust: 2 }, { aff: 3, trust: 2 }); } });
      if (e) S.visits++;
      /* 離れている日（出張）は、そばで妬く場面を出さない */
      var fk = e && !day.apart ? VI.follow(ctx, S, v) : null;
      if (fk) {
        var arr = VI.T[fk], jl = fk !== 'bless';
        var ft = fill(ctx, pickOf(ctx, arr), v.host, v.other, ex);
        /* 恋愛の出来事は参加した二人のあいだだけ（ヤキモチは二人の出来事。祝福は他の住人が加わるので仲良しの出来事 bond） */
        var e2 = ctx.act2({ actors: jl ? [v.other, v.host] : [g, v.host, v.other], cat: jl ? 'romance' : 'bond', text: ft, why: '新婚部屋：' + (jl ? v.other.name + 'のヤキモチ（' + g.name + 'が' + (v.cls === 'ex' ? '元恋人' : ex.gl) + '）' : g.name + 'が二人を祝福した'),
          fx: function () { if (jl) ctx.mod2(v.other, v.host, { att: 4, ten: 3 }, { att: 3 }); else ctx.mod2(v.host, v.other, { aff: 2, att: 2 }, { aff: 2, att: 2 }); } });
        if (e2 && jl) { day.jealBy = v.other; day.jealOf = v.host; day.jealG = g; day.jealEx = v.cls === 'ex'; }
      }
    } finally { g.gone = true; }
  }
  /* ご飯：作る人は料理をする人だけ（作る人がいないときは外食・出来合いの種だけ） */
  var MEAL_NAME = { BREAKFAST: '朝', LUNCH: '昼', DINNER: '夜' };
  function meal(ctx, day) {
    var S = f(ctx), A = S.A, B = S.B;
    if (!day.meal) return;
    var cook = day.cook || (ctx.rng() < 0.5 ? A : B), other = cook === A ? B : A;
    var food = pickOf(ctx, D.FOOD);
    var mt = prose(ctx, day.mealK, day.mealI, '', cook, other);
    if (!mt) {
      /* 作る人のいない二人の文（作る人の文が合わなかったとき） */
      mt = day.mealNeed === 'none' ? '{a}と{b}の' + MEAL_NAME[day.mealK] + 'ご飯は、' + day.meal.k + '。' + day.meal.t + '。' : '';
      if (!mt) return;
    }
    var re = withReact(ctx, 'warm', other, cook, day.cook ? 0.4 : 0.2);
    ctx.act2({ actors: [cook, other], cat: S.love ? 'romance' : 'bond', text: fill(ctx, mt, cook, other, { food: food }) + re.text, odd: re.odd, why: '新婚部屋：' + MEAL_NAME[day.mealK] + 'ご飯（' + clean(day.meal.k).replace(/（.*$|\s.*$/, '') + (day.cook ? '・' + day.cook.name + 'が作った' : '') + '）' });
  }
  /* ふたりの距離（その日の終わりの一文） */
  function distance(ctx, day) {
    var S = f(ctx), A = S.A, B = S.B, r = ctx.rel[A.i][B.i], q = ctx.rel[B.i][A.i];
    var key = day.fought ? (S.makeups ? 'mend' : 'rough') : day.apart ? 'apart' : (r && q && r.att + q.att > 120) ? 'close' : 'calm';
    var DIST = TX().DIST || {};
    /* 一回の遊びで同じ一文を二度使わない（使い切ったら付けない。2026-11-05 通し読み：14 日で「心の距離が、また少し縮まった」が 5 回） */
    var U = S.distUsed = S.distUsed || {};
    /* 毎日は付けない（6 割。回をまたいで同じ一文が目立たないように） */
    if (ctx.rng() > 0.6) return '';
    var arr = (DIST[key] || []).filter(function (x) { return !U[x] && okText(ctx, x, A, B); });
    var t = pickOf(ctx, arr);
    if (t) U[t] = 1;
    return t ? fill(ctx, t, A, B) : '';
  }
  /* 最後の夜の〆（2026-11-05 不具合リスト NO 21「2 人でないときに、幸せのキスの〆が発生しない。全員が登場する終わりの文章を必ず」）：
     キスの段（二人・三人・四人）のあとに、同居人・訪ねてくる住人（参加者）も含めた家の全員が出る一段を必ず足す。三人婚・四人婚でキスの段が出せなかったとき（組の文が作れない）は、
     全員がそろう〆の段だけでも必ず出す。文は shinkon-multi-text.js の HK.ShinkonMultiText.END（{p}＝夫婦の名前、{m}＝同居人、{g}＝訪ねてくる住人） */
  function ending(ctx) {
    endingKiss(ctx);
    var S = f(ctx), MX = HK.ShinkonMultiText || {}, E = MX.END || {}, P = S.trio || S.quad ? S.spouses.slice() : [S.A0, S.B0];
    var M = (S.M || []).filter(function (c) { return c.alive !== false; }), G = (S.G || []).filter(function (c) { return c.alive !== false && !c.outside; });
    var all = S.quad ? '四人' : S.trio ? '三人' : '二人', nm = function (L0) { return L0.map(function (c) { return c.name; }).join('と'); };
    var parts = [];
    if (!S.kissed && P.length >= 3) { var fb = pickOf(ctx, E.fall || []); if (fb) parts.push(fb.split('{all}').join(all).split('{p}').join(nm(P))); }
    if (M.length) { var mt = pickOf(ctx, E.mate || []); if (mt) parts.push(mt.split('{m1}').join(M[0].name).split('{m}').join(nm(M)).split('{p}').join(nm(P)).split('{all}').join(all)); }
    if (G.length) { var gt = pickOf(ctx, E.guest || []); if (gt) parts.push(gt.split('{g1}').join(G[0].name).split('{g}').join(nm(G)).split('{p}').join(nm(P)).split('{all}').join(all)); }
    if (!parts.length) return;
    var act = P.concat(M, G), off = act.filter(function (c) { return c.gone; });
    off.forEach(function (c) { c.gone = false; });
    try {
      var e = ctx.act2({ actors: act, cat: 'bond', text: fill(ctx, parts.join('').replace(/^\n+/, ''), P[0], P[1]), why: '新婚部屋：最後の夜（家の全員で）', mag: 0 });
      if (e && !S.kissed && P.length >= 3) S.kissed = true;
      S.endAll = !!e;
    } finally { off.forEach(function (c) { if (G.indexOf(c) >= 0) c.gone = true; }); }
  }
  function endingKiss(ctx) {
    var S = f(ctx), A = S.A, B = S.B, k = Math.floor(ctx.rng() * D.KISS.length);
    /* 最後のキスのあとに本体の共通の出来事を続けない（2026-11-04 報告） */
    scen.actRate = REST_RATE;
    /* もとが恐怖の二人：恐怖のゆくえ（怖くなくなった／少し慣れた／まだ怖い日もある。shinkon-past.js の PS.fearEnd） */
    if (!S.trio && !S.quad && PSX() && PSX().fearEnd) PSX().fearEnd(ctx, S);
    if (S.quad && HK.ShinkonFour) { if (HK.ShinkonFour.qKiss(ctx, S) || (HK.ShinkonMulti && S.lp && HK.ShinkonMulti.kiss(ctx, S))) S.kissed = true; return; }
    /* 恋の相手どうしでない組が混ざる三人は、恋の相手の組だけが口づける最後の夜（shinkon-multi.js。2026-11-04 NO 2） */
    if (S.trio && S.full === false && HK.ShinkonMulti) { if (HK.ShinkonMulti.kiss(ctx, S)) S.kissed = true; return; }
    if (S.trio && HK.ShinkonTrio) {
      var T3 = [S.A0, S.B0, S.C0], kt = HK.ShinkonTrio.say(ctx, HK.ShinkonTrio.T.KISS, T3[0], T3[1], T3[2]);
      if (ctx.act2({ actors: T3, cat: 'romance', text: kt, why: '新婚部屋：最後の夜（三人の幸せなキス）', fx: function () { ctx.mod2(T3[0], T3[1], { aff: 5, att: 5 }, { aff: 5, att: 5 }); ctx.mod2(T3[0], T3[2], { aff: 5, att: 5 }, { aff: 5, att: 5 }); ctx.mod2(T3[1], T3[2], { aff: 5, att: 5 }, { aff: 5, att: 5 }); } })) S.kissed = true;
      return;
    }
    if (S.love) {
      var t = prose(ctx, 'KISS', k, D.KISS[k], A, B);
      if (ctx.act2({ actors: [A, B], cat: 'romance', text: fill(ctx, t, A, B), why: '新婚部屋：最後の夜（幸せなキス）', fx: function () { ctx.mod2(A, B, { aff: 6, att: 6, trust: 4 }, { aff: 6, att: 6, trust: 4 }); } })) S.kissed = true;
    } else {
      ctx.act2({ actors: [A, B], cat: 'bond', text: fill(ctx, prose(ctx, 'HUG', 0, '最後の夜、{a}と{b}は並んで座り、明日の話をした。穏やかな、いい暮らしだった。', A, B), A, B), why: '新婚部屋：最後の夜' });
    }
  }
  function finish(ctx) {
    var S = f(ctx), A = S.A0, B = S.B0, P = S.spouses;
    if (A === B) return;
    (S.M || []).forEach(function (c) { c.gone = false; c.fate = '同じ家で暮らす住人'; c.fateNote = P.map(function (o) { return o.name; }).join('と') + 'の家で、' + S.days + '日を一緒に暮らした'; });
    S.G.forEach(function (g) { g.gone = false; g.fate = g.outside ? '訪ねてきた住人（名簿から）' : '二人を訪ねる住人'; g.fateNote = P.map(function (c) { return c.name; }).join('と') + ((S.gUsed && S.gUsed[g.i]) || S.visits ? 'の暮らしを見守った' : 'の暮らしを、離れた場所から見守った'); });
    var CL = HK.ShinkonCal;
    ctx.flags.shinkon = { days: S.days, home: D.HOME[S.home], rel: S.exLabel ? (HK.ShinkonPast ? HK.ShinkonPast.EXNAME[(S.relFrom[0] || {}).ex] || S.exLabel : S.exLabel) : S.rel >= 0 ? relShort(S.rel) : (S.ri.label || ''), keep: S.rel < 0, meet: meetName(S.meet), a: A.i, b: B.i,
      c: S.trio || S.quad ? S.C0.i : null, d: S.quad ? S.D0.i : null, trio: S.trio, quad: !!S.quad, mates: (S.M || []).map(function (c) { return c.i; }), mateLife: (S.M || []).map(function (c) { return LF.label(c); }),
      house: S.houseN || 0, houseK: S.houseK || {}, futari: S.futariN || 0, quadSex: S.quadSex || 0, trio4: !!S.trioNG4, trioNG: S.trioNG || '', who: P.map(function (c) { return c.i; }),
      life: P.map(function (c) { return LF.label(c); }), wish: P.map(function (c) { return wishName(J.of(ctx, c).d); }), wed: S.wed,
      relFrom: S.relFrom, relLine: relLine(S), start: S.cal && CL ? CL.label(S, 0) : '', end: S.cal && CL ? CL.label(S, S.days - 1) : '',
      bdays: (S.bdays || []).map(function (b) { return { i: b.c.i, label: b.label }; }), sea: S.calN || 0, past: S.pastN || 0, wedN: S.wedN || 0,
      fear: S.fearP ? { x: S.fearP.x.i, y: S.fearP.y.i, ex: S.fearP.ex, lv: S.fearP.lv, n: S.fearN || 0, end: S.fearEnd || '', freed: !!S.fearP.freed, love: !!S.fearLove, body: !!S.fearP.body } : null,
      nl: S.nl ? Object.keys(S.nl).map(function (k) { var x = S.nl[k]; return { a: x.x.i, b: x.y.i, kind: x.kind, mood: x.mood }; }) : [], shape: S.shape ? S.shape.k : '', kissPairs: S.kissPairs || (S.trio && S.full !== false && S.kissed ? 'all' : null), focus: S.fcnt || null, nlDays: S.nlDayN || 0,
      acts: S.acts, fights: S.fights, makeups: S.makeups, sex: S.sex, long: S.longN || 0, trioSex: S.trioSex || 0, kissed: S.kissed, endAll: !!S.endAll, multiN: S.multiN || null, love: S.love, best: S.best, troubles: S.troubles, visits: S.visits, odd: S.odd };
    P.forEach(function (c) { c.fate = S.quad ? '四人婚の新婚' : S.trio ? '三人婚の新婚' : S.wed ? '新婚の夫婦' : S.love ? '一緒に暮らす恋人' : '同じ家で暮らす二人'; c.fateNote = P.filter(function (o) { return o !== c; }).map(function (o) { return o.name; }).join('と') + 'と、' + S.days + '日を過ごした'; });
    ctx.flags.outcome = S.quad ? P.map(function (c) { return c.name; }).join('と') + 'の四人の新婚の' + S.days + '日' + (S.kissed ? '――最後の夜、四人は幸せなキスを交わした' : '')
      : S.trio ? P.map(function (c) { return c.name; }).join('と') + 'の三人の新婚の' + S.days + '日' + (S.kissed ? '――最後の夜、三人は幸せなキスを交わした' : '')
      : A.name + 'と' + B.name + 'の' + (S.wed ? '新婚の' : '同居の') + S.days + '日' + (S.kissed ? '――最後の夜、二人は幸せなキスをした' : '');
  }
  /* 関係の上書き・登場しない住人・結果から訪れた住人を外す：共通の部品（kit-cast.js の HK.PairCast） */
  /* 入力の包み（内側。PairCast の上書き・訪れる住人の追加のあとの入力）：関係の配列を写す（extraTies が元○○・三人婚の組の関係を外すため。記録の入力は書き換えない）。
     上書きの前の関係は _skOrig（外側の包みが覚えた、渡されたままの入力の関係） */
  var ORIG = null;
  if (HK.wrap && HK.simulate) HK.wrap(HK, 'simulate', function (sim0) {
    return function (input) {
      if (!input || input.scenId !== ID || !Array.isArray(input.chars)) return sim0.apply(this, arguments);
      var cp = {}; Object.keys(input).forEach(function (k) { cp[k] = input[k]; });
      cp.ties = Array.isArray(input.ties) ? input.ties.slice() : [];
      cp._skOrig = ORIG || input.ties || [];
      return sim0.apply(this, [cp].concat([].slice.call(arguments, 1)));
    };
  });
  if (HK.PairCast) HK.PairCast.install(ID, couple, 'shinkon');
  /* 入力の包み（外側）：渡されたままの関係を覚え、結果の二人ずつ（pairs）の「もともと」の関係を、上書き・元○○の前の関係に直す
     （2026-11-03 利用者のメモ：なれそめで上書きした二人が「もともと『夫婦』」と出ていた。関係の無かった二人は「もともと」を出さない） */
  if (HK.wrap && HK.simulate) HK.wrap(HK, 'simulate', function (sim0) {
    return function (input) {
      if (!input || input.scenId !== ID) return sim0.apply(this, arguments);
      var o0 = ORIG; ORIG = Array.isArray(input.ties) ? input.ties : [];
      var r;
      RUN++;
      try { r = sim0.apply(this, arguments); } finally { ORIG = o0; RUN--; }
      var R = r && r.end && r.end.shinkon;
      /* 住人ごとの結果：初動・短期目標は出さず、目標（願望）を出す（2026-11-04 NO 5） */
      if (r && Array.isArray(r.chars)) r.chars.forEach(function (c) {
        if (!c) return;
        c.action = null;
        var k = R && R.who ? R.who.indexOf(c.i) : -1;
        c.goal = k >= 0 && R.wish && R.wish[k] ? R.wish[k] : null;
        if (Array.isArray(c.notes)) c.notes = c.notes.filter(function (t) { return !/^おまかせで選ばれた初動は/.test(t); });
      });
      /* 三人婚・四人婚（2026-11-04 NO 1）：関係図の開始時は、恋の相手の組はどれも「夫婦」から。恋の相手どうしでない組（攻めどうし・受けどうしなど）は、夫婦の線を引かず、
         最初の区切りの値（友人のよう・張り合う・互いを邪魔に思う）から */
      if (R && (R.trio || R.quad) && Array.isArray(r.pairs)) {
        var W = (R.who || []).slice(), nlk = {};
        (R.nl || []).forEach(function (x) { nlk[x.a < x.b ? x.a + '-' + x.b : x.b + '-' + x.a] = x; });
        r.pairs.forEach(function (p) {
          if (W.indexOf(p.a) < 0 || W.indexOf(p.b) < 0) return;
          var k = p.a < p.b ? p.a + '-' + p.b : p.b + '-' + p.a, nx = nlk[k];
          if (nx) { if (nx.kind !== 'kin' || (p.tie && p.tie.type === 'spouse')) p.tie = null; return; }
          var rf = (R.relFrom || []).filter(function (x) { return (x.a === p.a && x.b === p.b) || (x.a === p.b && x.b === p.a); })[0];
          if (rf && rf.how === 'same') return;
          p.tie = { type: 'spouse', label: '夫婦', a: p.a, b: p.b, pol: 2, was: rf && rf.main ? (HK.tieLabel ? HK.tieLabel(rf.main) : '') : '' };
        });
      }
      if (R && !R.trio && !R.quad && Array.isArray(R.relFrom) && Array.isArray(r.pairs)) R.relFrom.forEach(function (x) {
        if (x.how !== 'override' && x.how !== 'ex' && x.how !== 'new') return;
        r.pairs.forEach(function (p) {
          if (!((p.a === x.a && p.b === x.b) || (p.a === x.b && p.b === x.a))) return;
          var m = x.main, D0 = m && HK.TIES[m.type];
          p.tie = m && D0 ? { type: m.type, label: HK.tieLabel ? HK.tieLabel(m) : D0.label, a: m.a, b: m.b, pol: D0.pol, was: true } : null;
        });
      });
      return r;
    };
  });
  /* 結末の要約（endings.js の E.build から） */
  if (HK.Endings) HK.Endings[ID] = function (res, X) {
    var R = res.end && res.end.shinkon, lines = [];
    if (!R) return { headline: res.outcome || '', stats: [], lines: [] };
    var who = (R.who || [R.a, R.b]).map(function (i) { return X.nm(i); });
    lines.push((R.quad ? '四人の' : R.trio ? '三人の' : '二人の') + R.days + '日（' + who.join('と') + '）' + (R.start ? '：' + R.start + '〜' + R.end : ''));
    lines.push('住まい：' + R.home + '／' + (R.keep ? '関係：' : 'なれそめ：') + R.rel + '／出会い：' + R.meet);
    /* どの関係を夫婦に直したか（元の関係 → 夫婦） */
    if (R.relLine) lines.push('関係の移り変わり：' + R.relLine);
    /* 三人婚・四人婚の、恋の相手どうしでない伴侶（2026-11-04 NO 1） */
    var MD = HK.ShinkonMulti ? HK.ShinkonMulti.MOOD() : {};
    (R.nl || []).forEach(function (x) { lines.push(X.nm(x.a) + 'と' + X.nm(x.b) + '：' + (x.kind === 'kin' ? '家族のまま同じ家で暮らす伴侶どうし' : '夫婦だが恋の相手どうしではない――' + (MD[x.mood] || '')) ); });
    if (R.trioNG) lines.push((R.trio4 ? '四人婚' : '三人婚') + 'にはならなかった（' + R.trioNG + '）');
    who.forEach(function (nm, k) { lines.push(nm + '：' + (R.life[k] || '') + '／目標「' + (R.wish[k] || '') + '」'); });
    (R.mates || []).forEach(function (i, k) { lines.push('同居人 ' + X.nm(i) + '：' + ((R.mateLife || [])[k] || '')); });
    (R.bdays || []).forEach(function (b) { lines.push(X.nm(b.i) + 'の誕生日：' + b.label + '（日数の中で祝った）'); });
    lines.push('目標から来た行動 ' + R.acts + '回／困りごと ' + R.troubles + '回／喧嘩 ' + R.fights + '回' + (R.fights ? '（仲直り ' + R.makeups + '回）' : '') + (R.visits ? '／来客・連絡 ' + R.visits + '回' : '') + (R.sea ? '／季節の行事 ' + R.sea + '回' : '') + (R.wedN ? '／新婚らしい出来事 ' + R.wedN + '回' : '') + (R.house ? '／家の皆で過ごした場面 ' + R.house + '回' : '') + (HK.SAFE_ON ? '' : '／エッチ ' + R.sex + '回' + (R.trioSex ? '（三人で ' + R.trioSex + '回）' : '') + (R.quadSex ? '（四人で ' + R.quadSex + '回）' : '') + (R.futari ? '（留守の昼に ' + R.futari + '回）' : '')));
    /* もとが恐怖の二人：ぶり返しの回数と恐怖のゆくえ */
    if (R.fear) lines.push('恐怖のゆくえ：' + X.nm(R.fear.x) + 'は' + X.nm(R.fear.y) + 'に' + (R.fear.lv === 'nf' ? '（恐怖の関係のまま）' : '（元恐怖）') + '――' + ((HK.ShinkonPast && HK.ShinkonPast.FEAR_END[R.fear.end]) || '少し慣れた') + '（恐怖がぶり返した日 ' + R.fear.n + '回' + (R.fear.freed ? '・恐怖が和らいだ' : '') + '）' + (R.fear.love ? '→ 恋人に' : ''));
    if (R.best) lines.push('いちばん心に残った日：' + R.best.label + '――' + R.best.why);
    X.C.forEach(function (c) { c.afterDone = true; });
    return { headline: (res.outcome || '') + '。', stats: [['日数', R.days + '日'], ['目標の行動', R.acts + '回'], ['困りごと', R.troubles + '回'], ['喧嘩', R.fights + '回']].concat(HK.SAFE_ON ? [] : [['エッチ', R.sex + '回']]), lines: lines };
  };

  HK.SCENARIOS[ID] = scen;
  /* R18 の描写の設定（描写の有無・長さ・作風）をほかの R18 の箱庭と同じ共通の設定にする（lewd-unify.js。全年齢では「ほのめかす」だけ） */
  if (HK.Lewd && HK.Lewd.install) HK.Lewd.install(ID, { lenDef: 'mix', desc: HK.SAFE_BUILD ? '' : '夜の場面の描き方。ほのめかす＝ぼかした一文と翌朝だけ／ほどほど＝描写する／濃い＝果てたあと、もう一度求め合うところまで' });
})();
