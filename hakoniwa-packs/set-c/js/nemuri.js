/* 眠りの部屋（追加パック set-c の部屋。日常型（エンジン型）。R18版だけ。2026-11-07。設計は docs/reports/2026-11-07/nemuri-design.md）
   同じ部屋で眠る数日。触れる側（{a}）は、眠る側（{b}）の寝顔のそばで夜ごとに一歩ずつ近づき、眠る側は昼に体の違和感・疼きを覚える。
   ・土台は合意（set-c-design.md の 0-2）：眠る側は、前もって「寝ている間なら」と許している二人（恋人・体の相手・両片想い。設定「前もっての約束」）か、
     途中で気づいて寝たふりを選ぶ人。約束の無い二人のあいだ、眠っている人に触れるのは髪・手・寝顔まで（性的な接触は書かない）。
     性的な場面は、約束のある二人（眠っている間の愛撫だけ。挿入まではしない）と、眠る側が起きていて選んだとき（寝たふり＝二人とも分かっている遊び・
     目を覚まして受け入れた夜・眠る側から誘った夜）だけで、どれも本音の計器 want が部屋の線（LINE）を越えた二人だけ
   ・計器（HK.DarkKit.gauge。巻き戻らない）：want 本音（眠る側）・reach 触れる側の踏み込み・dev 開発の段（体が反応する）・aware 気づき・uzuki 疼き
   ・触れる側の分岐 3：careful 少しずつ慎重／bold 大胆になる／guilt 罪悪感で止める（態度 9 種 → 既定、設定の大胆さ、運命の揺らぎ）
   ・眠る側の昼の分岐 4：unaware 疼きに気づかない／probe 違和感を探る／feign 寝たふり／invite 自分から誘う
   ・山場：途中で目を覚ます夜（関係で反応が変わる：想い合う二人は許して喜ぶ／片想いは揺れる／不仲は怒るが体は応える／本音が線の下なら怒って離れる）
   ・結末 5：fall 体が堕ちる／broken バレて関係が壊れる／koi バレて受け入れられ恋人に／invite 体が疼いて自分から誘う／unknown 何も知らないまま体だけが疼く（約束のある二人だけ）
   文は nemuri-text-a.js〜c.js（HK.NemuriText）、R18 の場面は nemuri-r18.js・nemuri-r18-text*.js（HK.NemuriR18）。登場人物はすべて成人として扱う */
/* @event scen=set-c-nemuri id=nm_intro cat=bond tie=- label=同じ部屋で眠る数日が始まる */
/* @event scen=set-c-nemuri id=nm_morn cat=bond tie=- label=夜が明けて二人で迎える朝 */
/* @event scen=set-c-nemuri id=nm_morn_body cat=bond tie=- label=朝の体に残る夜の名残 */
/* @event scen=set-c-nemuri id=nm_set cat=bond tie=- label=暮らし方ならではの二人の一幕 */
/* @event scen=set-c-nemuri id=nm_day_b cat=bond tie=- label=眠る側が昼に夜の違和感を探る */
/* @event scen=set-c-nemuri id=nm_day_a cat=bond tie=- label=触れる側の昼の顔 */
/* @event scen=set-c-nemuri id=nm_day_br cat=bond tie=- label=触れる側が夜の自分と向き合う昼 */
/* @event scen=set-c-nemuri id=nm_uzuki cat=bond tie=- label=昼のさなかに体が夜を思い出す */
/* @event scen=set-c-nemuri id=nm_talk cat=bond tie=- label=二人の何気ない昼のやりとり */
/* @event scen=set-c-nemuri id=nm_depth cat=bond tie=- label=眠りの深さにまつわる昼の一幕 */
/* @event scen=set-c-nemuri id=nm_pact cat=bond tie=- label=寝ている間の約束を確かめ合う */
/* @event scen=set-c-nemuri id=nm_bed cat=bond tie=- label=同じ部屋で眠りにつく支度 */
/* @event scen=set-c-nemuri id=nm_near cat=bond tie=- label=眠る相手の寝顔のそばで過ごす夜 */
/* @event scen=set-c-nemuri id=nm_guilt cat=bond tie=- label=触れかけた手を引っ込める夜 */
/* @event scen=set-c-nemuri id=nm_feign cat=bond tie=- label=寝たふりの相手と言葉のない夜 */
/* @event scen=set-c-nemuri id=nm_peak cat=bond tie=- label=触れられている途中で目を覚ます夜 */
/* @event scen=set-c-nemuri id=nm_peak_half cat=bond tie=- label=目を覚ましかけてまた眠りに落ちる夜 */
/* @event scen=set-c-nemuri id=nm_confess cat=romance tie=- label=目を覚ました夜のあとに想いを告げる */
/* @event scen=set-c-nemuri id=nm_post_ok cat=bond tie=- label=受け入れたあとの二人の昼 */
/* @event scen=set-c-nemuri id=nm_post_ng cat=bond tie=- label=知られてしまったあとの気まずい昼 */
/* @event scen=set-c-nemuri id=nm_night_ok cat=bond tie=- label=打ち明けたあとに並んで眠る夜 */
/* @event scen=set-c-nemuri id=nm_night_ng cat=bond tie=- label=別々に眠ることになった夜 */
/* @event scen=set-c-nemuri id=nm_night_un cat=bond tie=- label=何も知らない相手の隣で眠る夜 */
/* @event scen=set-c-nemuri id=nm_end cat=bond tie=- label=眠りの部屋の数日の終わり */
(function () {
  'use strict';
  var HK = window.HK;
  if (!HK || !HK.DarkKit || !HK.DarkKit.gauge || !HK.DarkKit.cast) return;
  var ID = 'set-c-nemuri', DK = HK.DarkKit;
  var PART = ['朝', '日中', '夜'], WEEK = ['月', '火', '水', '木', '金', '土', '日'];
  var LINE = 55;
  function TX() { return HK.NemuriText || {}; }
  function R18() { return !HK.SAFE_ON && HK.NemuriR18 ? HK.NemuriR18 : null; }
  function f(ctx) { return ctx.nm; }

  /* ---------- 二人の関係（名簿の関係のまま） ----------
     grp：love 恋人・夫婦／body 体の相手／pine 両片想い・片想い／close 友人・幼なじみ・家族／work 同僚・先輩後輩・師弟／awk 元恋人・不仲・関係なし */
  var RK_OF = { spouse: 'spouse', lover: 'lover', fiance: 'lover', mate: 'lover', fated: 'lover', honmei: 'lover', fwb: 'fwb',
    almost: 'almost', crush: 'crush', yan: 'crush', ex: 'ex', enemy: 'bad', bad: 'bad', rival: 'rival', lovehate: 'lovehate', abuse: 'bad',
    parent: 'fam', sibling: 'fam', sibprot: 'fam', sibclose: 'fam', sibbad: 'fam', twin: 'fam', stepsib: 'fam', relative: 'fam', pparent: 'fam',
    teacher: 'work', mentor: 'work', master: 'work', worship: 'work', senpai: 'work', colleague: 'work', boss: 'work',
    childhood: 'close', friend: 'close', best: 'close', buddy: 'close', benefactor: 'close', comrade: 'close', classmate: 'close', acq: 'weak' };
  var RK_ORD = ['spouse', 'lover', 'fwb', 'almost', 'crush', 'lovehate', 'ex', 'bad', 'rival', 'fam', 'work', 'close', 'weak'];
  var RK_GRP = { spouse: 'love', lover: 'love', fwb: 'body', almost: 'pine', crush: 'pine', lovehate: 'awk', ex: 'awk', bad: 'awk', rival: 'awk', fam: 'close', work: 'work', close: 'close', weak: 'awk', none: 'awk' };
  var RK_NAME = { spouse: '夫婦', lover: '恋人', fwb: '体の関係', almost: '両片想い', crush: '片想い', lovehate: '愛憎', ex: '昔の恋人', bad: '不仲', rival: '張り合う仲', fam: '家族', work: '仕事の仲', close: '気心の知れた仲', weak: '知り合い', none: '特に関係なし' };
  /* 本音の始まりの値（眠る側の。0-2 章：想い合う・体の相手は高く、片想い・友人・昔の恋人は中、不仲・知らない人は低いが 0 ではない） */
  var WANT0 = { spouse: 72, lover: 70, fwb: 64, almost: 58, crush: 44, lovehate: 50, ex: 44, bad: 26, rival: 30, fam: 16, work: 30, close: 36, weak: 22, none: 20 };
  function relKind(ctx, A, B) {
    var tl = HK.Ties && HK.Ties.all ? HK.Ties.all(ctx, A, B) || [] : [], best = 'none';
    tl.forEach(function (t) {
      if (!t || t.type === 'noobs') return;
      var k = RK_OF[t.type] || 'close';
      if (t.type === 'spouse' || t.spouse) k = 'spouse';
      if (k === 'spouse' && t.married === 'divorced') k = 'ex';
      if (best === 'none' || RK_ORD.indexOf(k) < RK_ORD.indexOf(best)) best = k;
    });
    return best;
  }
  /* 片想いの向き：想っているのが眠る側（B）なら 'B'、触れる側なら 'A' */
  function crushDir(ctx, A, B) {
    var tl = HK.Ties && HK.Ties.all ? HK.Ties.all(ctx, A, B) || [] : [];
    var t = tl.filter(function (x) { return x && /^(crush|yan)$/.test(x.type); })[0];
    return !t || t.a == null ? '' : t.a === B.i ? 'B' : t.a === A.i ? 'A' : '';
  }
  function canLove2(ctx, a, b) {
    if (HK.loveOK && !HK.loveOK(a, b)) return false;
    if (HK.tieLoveNoPair && (HK.tieLoveNoPair(ctx, a, b) || HK.tieLoveNoPair(ctx, b, a))) return false;
    if (HK.Ties && HK.Ties.apathy && (HK.Ties.apathy(ctx, a, b) || HK.Ties.apathy(ctx, b, a))) return false;
    if (ctx.pair && ctx.pair(a, b).kin) return false;
    return true;
  }
  function rcat(ctx, S) { return S.love && (!ctx.romanceOk || ctx.romanceOk([S.A, S.B], false)) ? 'romance' : 'bond'; }
  /* 組（体の形）：mf 攻めに男性器（フタナリも）／ff 女性どうし／fm 女性の攻め × 男性の受け */
  function shOf(a, b) {
    var P = HK.Pos; if (!P) return 'mf';
    if (P.hasM && P.hasM(a)) return 'mf';
    if (P.ff && P.ff(a, b)) return 'ff';
    if (P.isF && P.isF(a, b) && !(P.hasM && P.hasM(a))) return P.hasM && P.hasM(b) ? 'fm' : 'ff';
    return 'mf';
  }

  /* ---------- 文を引く ---------- */
  /* 二人に合わない文を外す（恋愛にならない二人に恋人の語、恋人でない二人に「恋人」、夫婦でない二人に結婚の語、暮らし方と食い違う語） */
  var ROM_RE = /恋人|好きだ|好きです|好きな人|愛して|想いを告げ|想いを打ち明/;
  var WED_RE = /夫婦|結婚|配偶/;
  function okRow(ctx, S, t) {
    if (typeof t !== 'string') return false;
    var plain = t.replace(/「[^」]*」/g, '');
    if (!S.love && ROM_RE.test(t)) return false;
    if (!S.couple && /(?<!昔の)恋人/.test(plain)) return false;
    if (S.rk !== 'spouse' && WED_RE.test(t)) return false;
    if (S.reason !== 'trip' && /旅館|宿の|仲居|大浴場|旅先|浴衣/.test(t)) return false;
    if (S.reason !== 'stay' && /泊めてもら|泊めてくれ|客用の布団|借りた(?:寝間着|服|シャツ)|家主/.test(t)) return false;
    if (S.reason !== 'together' && /一緒に暮らし|同じ家で暮ら|二人の家|ふだんの寝室/.test(t)) return false;
    if (S.depth !== 'drug' && /眠り薬|睡眠薬|薬を飲ん|錠剤/.test(t)) return false;
    return true;
  }
  /* 段の札・when・二人の可否を通して一つ引く。g は段を見る計器の名前。again で使い切ったら古い順に戻す */
  function pk(ctx, S, list, o) {
    o = o || {};
    var L = (list || []).filter(function (r) { var t = typeof r === 'string' ? r : r && r.t; return okRow(ctx, S, t); });
    return DK.pick(ctx, S, L, { g: o.g, stage: o.stage, sh: o.sh, a: S.A, b: S.B, again: o.again !== false, full: o.full });
  }
  /* 態度の表（tbl[態度] か tbl.gentle）から */
  function pkPer(ctx, S, tbl, per, o) { tbl = tbl || {}; return pk(ctx, S, (tbl[per] || []).concat(tbl._ || []), o) || pk(ctx, S, tbl.gentle || [], o); }
  function say(ctx, S, id, t, o) {
    o = o || {};
    if (!t) return null;
    var a = o.a || S.A, b = o.b || S.B;
    return DK.say(ctx, { id: id, cat: o.cat || 'bond', actors: o.actors || [a, b], t: t, a: a, b: b, S: S, ex: o.ex, face: o.face, why: '眠りの部屋：' + (o.why || ''), fx: o.fx, tag: o.tag, mag: o.mag });
  }
  /* 文を足し合わせて一件にする（空の文は飛ばす） */
  function join() { return [].slice.call(arguments).filter(function (x) { return x; }).join(''); }
  function faceB(S, k) { var o = {}; o[S.B.i] = k; return o; }

  /* ---------- 箱庭 ---------- */
  var ROLE_OPTS = [{ id: 'toucher', label: '触れる側（眠る相手のそばで夜を過ごす）' }, { id: 'sleeper', label: '眠る側（先に眠ってしまう）' }];
  var scen = {
    id: ID, name: '眠りの部屋', kicker: 'ふたり・眠り・夜',
    desc: '同じ部屋で眠る数日。先に眠ってしまう人と、その寝顔のそばで夜ごとに一歩ずつ近づく人。眠る側は、昼に覚える体の違和感の正体を探りはじめる。',
    note: '※参加は2人まで。登場人物はすべて成人として扱います。くわしくは「この箱庭のTIPS」に。',
    unit: '日', perUnit: 3, preRel: 0, lethal: false, minCast: 2, maxCast: 2,
    catBias: { romance: 1, bond: 1.2, help: 0.6, conflict: 0.3, combat: 0, betray: 0, kill: 0 },
    decay: 0.998, actRate: 1e-9,
    derived: ['warmth', 'honesty', 'impulse'],
    env: [
      { id: 'days', label: '夜の数', min: 3, max: 10, def: 6, lo: '3夜', hi: '10夜', unit: '日', desc: '同じ部屋で眠る日数。1日は朝・日中・夜の3区切り。終わりから二つ目の夜（3夜なら最後の夜）が、眠る側が途中で目を覚ます山場' },
      { id: 'reason', label: '同じ部屋で眠る理由', type: 'select', def: 'auto', options: [{ v: 'auto', label: 'おまかせ（二人の関係から）' }, { v: 'together', label: '同居（ふだんから同じ家で暮らしている）' }, { v: 'stay', label: '泊まり（どちらかの家に数日泊まる）' }, { v: 'trip', label: '旅先（同じ宿の一部屋に泊まる）' }],
        desc: '朝と昼の出来事・寝支度・山場のあとの離れ方が変わる。おまかせは、夫婦・恋人は同居が多く、ほかは泊まりか旅先' },
      { id: 'depth', label: '眠りの深さ', type: 'select', def: 'auto', options: [{ v: 'auto', label: 'おまかせ（眠る側の性格から）' }, { v: 'tired', label: '疲れ（毎晩くたくたで深く眠る）' }, { v: 'drug', label: '薬（眠る側が自分の眠り薬を飲んでいる）' }, { v: 'usual', label: 'ふだん（眠りが浅く、気づきやすい）' }],
        desc: '深いほど気づくのが遅く、浅いほど早く気づく。薬は眠る側がもともと自分で飲んでいるもの（触れる側が飲ませることはない）' },
      { id: 'bold', label: '触れる側の大胆さ', type: 'select', def: 'auto', options: [{ v: 'auto', label: 'おまかせ（触れる側の性格から）' }, { v: 'careful', label: '慎重（少しずつ）' }, { v: 'bold', label: '大胆（夜ごとに踏み込む）' }],
        desc: '大胆なほど早く踏み込み、気づかれやすい。性格によっては、どちらでも途中で罪悪感から手を止めることがある' },
      { id: 'pact', label: '前もっての約束', type: 'select', def: 'auto', options: [{ v: 'auto', label: 'おまかせ（恋人・夫婦・体の関係はあり、両片想いは半々、ほかはなし）' }, { v: 'yes', label: 'あり（眠る側が「寝ている間なら」と前もって許している。恋人・夫婦・体の関係・両片想いの二人だけ）' }, { v: 'no', label: 'なし（眠る側は何も知らない。気づいてから寝たふりを選ぶかどうか）' }],
        desc: '約束のある二人は、眠っている間の愛撫まで進む。約束の無い二人は、眠っている間は寝顔のそばにいるだけで、眠る側が気づいて寝たふりを選んだときから二人の遊びになる。「何も知らないまま体だけが疼く」結末は約束のある二人だけ' }
    ],
    stats: [],
    perFields: [
      { id: 'part', label: '立場', auto: 'おまかせ（受け攻めと性格から。攻めを選んだ人は触れる側）', options: ROLE_OPTS }
    ],
    actions: [],
    goals: [],
    stepGroup: function (label) { var m = /^(DAY\d+（.）)(.+)$/.exec(label); return m ? { group: m[1], sub: m[2] } : null; },
    steps: function (env) {
      var n = Math.max(3, Math.min(10, +env.days || 6)), s = [];
      for (var d = 0; d < n; d++) for (var t = 0; t < 3; t++) s.push('DAY' + (d + 1) + '（' + WEEK[d % 7] + '）' + PART[t]);
      return s;
    },
    othersFor: function (ctx, a) { var S = ctx.nm; return ctx.present().filter(function (c) { return c !== a && (!S || ((a === S.A || a === S.B) && (c === S.A || c === S.B))); }); },
    setup: function (ctx) { setup(ctx); },
    phase: function (ctx, s, n) { phase(ctx, s, n); },
    finish: function (ctx) { finish(ctx); },
    events: []
  };
  if (!HK.SAFE_BUILD) scen.env.push({ id: 'lewdN', label: 'エッチの回数（R18）', type: 'select', def: 'mid', options: [{ v: 'none', label: 'なし' }, { v: 'low', label: '少なめ（1回まで）' }, { v: 'mid', label: 'ふつう（2回まで）' }, { v: 'high', label: '多め（3回まで・一度は長い場面）' }],
    desc: '眠る側が起きていて選んだ夜（寝たふりの遊び・目を覚まして受け入れた夜・眠る側から誘った夜）のエッチの回数の上限。眠る側の本音が届いていない二人・体の関係にしてよくない二人には起きない。約束のある二人の「眠っている間の愛撫」は回数に数えず、「なし」のときは出ない' });
  /* 本体の共通の出来事は混ぜない（この部屋の文だけで進む） */
  function exList() { return (HK.COMMON || []).map(function (e) { return e.id; }); }
  Object.defineProperty(scen, 'exclude', { get: exList, enumerable: true, configurable: true });

  /* ---------- 役 ---------- */
  var BOLD_P = { proud: 3, free: 3, devoted: 2, stern: 2, cool: 1, tsun: 1, gentle: 0, polite: 0, shy: -1 };
  function autoCast(ctx, X, Y) {
    var P = HK.Pos;
    if (P && P.hardTop) { if (P.hardTop(X, Y)) return [X, Y]; if (P.hardTop(Y, X)) return [Y, X]; }
    if (P && P.canTop) { if (!P.canTop(X, Y) && P.canTop(Y, X)) return [Y, X]; if (!P.canTop(Y, X) && P.canTop(X, Y)) return [X, Y]; }
    var sx = (BOLD_P[DK.per(X)] || 0) + ctx.rng() * 2, sy = (BOLD_P[DK.per(Y)] || 0) + ctx.rng() * 2;
    return sx >= sy ? [X, Y] : [Y, X];
  }
  var A_BR = { proud: 'bold', free: 'bold', devoted: 'bold', stern: 'careful', cool: 'careful', tsun: 'careful', gentle: 'careful', shy: 'guilt', polite: 'guilt', _: 'careful' };
  var B_BR = { proud: 'probe', stern: 'probe', cool: 'probe', tsun: 'feign', shy: 'feign', devoted: 'feign', free: 'invite', gentle: 'unaware', polite: 'unaware', _: 'unaware' };
  var DEPTH_OF = { gentle: 'tired', devoted: 'tired', polite: 'tired', shy: 'drug', cool: 'drug', stern: 'usual', proud: 'usual', tsun: 'usual', free: 'tired' };

  /* ---------- 始まり ---------- */
  function setup(ctx) {
    var env = ctx.env;
    DK.heavyDefault(ctx);
    var C = DK.cast(ctx, { field: 'part', top: 'toucher', bottom: 'sleeper', others: [], auto: autoCast });
    if (!C) return;
    var A = C.A, B = C.B, days = Math.max(3, Math.min(10, +env.days || 6));
    var rk = relKind(ctx, A, B), grp = RK_GRP[rk] || 'awk';
    var S = ctx.nm = { A: A, B: B, days: days, rk: rk, grp: grp, noBody: !!C.noBody, why: C.why, used: {},
      love: canLove2(ctx, A, B) && rk !== 'fam', couple: /^(spouse|lover)$/.test(rk), cdir: rk === 'crush' ? crushDir(ctx, A, B) : '' };
    if (S.love && ctx.romanceOk && !ctx.romanceOk([A, B], false)) S.love = false;
    S.reason = /^(together|stay|trip)$/.test(env.reason) ? env.reason : S.couple ? (ctx.rng() < 0.7 ? 'together' : 'trip') : grp === 'fam' || rk === 'fam' ? 'together' : ctx.rng() < 0.55 ? 'stay' : 'trip';
    S.depth = /^(tired|drug|usual)$/.test(env.depth) ? env.depth : DEPTH_OF[DK.per(B)] || 'tired';
    /* 前もっての約束：恋人・夫婦・体の相手・両片想いの二人だけ（体の場面を出せない組・全年齢モードでは約束の文だけ残し、触れるのは寝顔まで） */
    var pactOk = /^(spouse|lover|fwb|almost)$/.test(rk);
    S.pact = pactOk && (env.pact === 'yes' || (env.pact !== 'no' && (rk !== 'almost' || ctx.rng() < 0.5)));
    S.lewdOn = !HK.SAFE_ON && !S.noBody && env.lewdN !== 'none' && !!R18();
    /* 計器 */
    var w0 = WANT0[rk] != null ? WANT0[rk] : 24;
    if (rk === 'crush') w0 = S.cdir === 'B' ? 60 : 40;
    if (S.pact) w0 = Math.max(w0, 62);
    w0 += Math.round((ctx.rng() - 0.5) * 8);
    DK.gauge(S, 'want', { v: w0, dir: 'up', stages: [LINE] });
    DK.gauge(S, 'reach', { v: 0, dir: 'up', stages: [18, 42, 66] });
    DK.gauge(S, 'dev', { v: 0, dir: 'up', stages: [25, 50, 75] });
    DK.gauge(S, 'aware', { v: 0, dir: 'up', stages: [28, 56, 85] });
    DK.gauge(S, 'uzuki', { v: 0, dir: 'up', stages: [25, 50, 78] });
    /* 分岐 */
    var ab = DK.branch(ctx, A, A_BR, ['careful', 'bold', 'guilt']);
    if (env.bold === 'careful' && ab.k === 'bold') ab.k = 'careful';
    if (env.bold === 'bold' && ab.k === 'careful') ab.k = 'bold';
    S.aBr = ab.k; S.aOdd = ab.odd; S.aPer = ab.per;
    var bb = DK.branch(ctx, B, B_BR, ['unaware', 'probe', 'feign', 'invite']);
    S.bBr = bb.k; S.bOdd = bb.odd; S.bPer = bb.per;
    /* 約束の無い二人の「気づかない」は、山場で必ず気づく（何も知らないまま終わるのは約束のある二人だけ） */
    S.peakN = days >= 4 ? days - 2 : days - 1;
    S.sexN = 0; S.longN = 0; S.touchN = 0; S.quota = 0; S.lastNight = 'first'; S.flags = {};
    if (R18() && R18().quota) S.quota = R18().quota(ctx, S, env);
    ctx.place = S.reason === 'trip' ? '宿の一部屋' : S.reason === 'stay' ? '泊まり先の部屋' : '二人の寝室';
    ctx.chars.forEach(function (c) { if (!c.action) c.action = { id: 'live', label: '' }; if (!c.goal) c.goal = { id: 'nm', label: '' }; c.autoAction = false; c.autoGoal = false; });
    /* 導入：関係ごと × 触れる側の態度、暮らし方、眠りの深さ、約束 */
    var T = TX();
    var t = join(pk(ctx, S, (T.INTRO || {})[grp]), pkPer(ctx, S, T.INTRO_A, S.aPer), pk(ctx, S, (T.REASON || {})[S.reason]), pk(ctx, S, (T.DEPTH || {})[S.depth]),
      S.pact ? pk(ctx, S, (T.PACT || {}).yes) : pk(ctx, S, (T.PACT || {}).no));
    say(ctx, S, 'nm_intro', t || '{a}と{b}は、しばらく同じ部屋で眠ることになった。', { cat: 'bond', why: '始まり（' + RK_NAME[rk] + '・' + ({ together: '同居', stay: '泊まり', trip: '旅先' })[S.reason] + '・' + ({ tired: '疲れ', drug: '薬', usual: 'ふだん' })[S.depth] + (S.pact ? '・前もっての約束あり' : '') + '）' });
  }

  /* ---------- 計器を動かす ---------- */
  function st(S, g) { return DK.stage(S, g); }
  function wantOk(S) { return DK.val(S, 'want') >= LINE; }
  function bumpWant(ctx, S, n) { DK.push(S, 'want', n); }
  function nightMove(ctx, S) {
    /* 触れる側の踏み込み */
    var r = S.aBr === 'bold' ? 20 + ctx.rng() * 6 : S.aBr === 'guilt' ? (st(S, 'reach') >= 1 ? 0 : 12) : 11 + ctx.rng() * 5;
    DK.push(S, 'reach', r);
    /* 気づき：眠りが浅いほど・踏み込むほど・探るほど早い */
    var ar = { drug: 6, tired: 10, usual: 17 }[S.depth] + st(S, 'reach') * 4 + (S.aBr === 'bold' ? 5 : 0) + (S.bBr === 'probe' ? 6 : 0) + (S.bBr === 'feign' ? 4 : 0);
    if (S.pact && S.bBr === 'unaware') ar = Math.round(ar * 0.45);
    DK.push(S, 'aware', ar);
  }

  /* ---------- 一日 ---------- */
  function phase(ctx, s, n) {
    var S = f(ctx);
    if (!S || S.ended) return;
    var d = Math.floor(s / 3), t = s % 3, last = d === S.days - 1;
    if (ctx.stepIndex != null) ctx._emoWS = ctx.stepIndex;
    DK.tmpReset(S);
    S.d = d;
    var n0 = (ctx.log || []).length;
    if (t === 0) morning(ctx, S, d);
    else if (t === 1) day(ctx, S, d);
    else night(ctx, S, d, last);
    /* 空の区切りを作らない */
    if ((ctx.log || []).length === n0 && !S.ended) filler(ctx, S, t);
  }
  function filler(ctx, S, t) {
    var T = TX(), L = (T.FILL || {})[['m', 'd', 'n'][t]];
    say(ctx, S, 'nm_talk', pk(ctx, S, L), { why: '二人の時間' });
  }

  /* 朝：前の夜の名残（夜の種類ごと）と、体（疼きの段）、暮らし方の朝 */
  function morning(ctx, S, d) {
    var T = TX(), M = T.MORN || {};
    if (d === 0) { say(ctx, S, 'nm_morn', pk(ctx, S, M.first), { why: '最初の朝' }); return; }
    var k = S.lastNight, t = pk(ctx, S, M[k] || M.near, { g: k === 'touch' ? 'dev' : 'reach' });
    var body = '';
    if (st(S, 'uzuki') >= 1 && !S.broken && !(k === 'scene' || k === 'wake_ok')) body = pk(ctx, S, T.MORN_BODY, { g: 'uzuki' });
    say(ctx, S, 'nm_morn', join(t, body), { why: '朝（' + ({ near: '寝顔のそばの夜のあと', touch: '眠っている間に触れた夜のあと', guilt: '手を止めた夜のあと', feign: '寝たふりの夜のあと', scene: '二人で起きていた夜のあと', half: '目を覚ましかけた夜のあと', wake_ok: '目を覚まして受け入れた夜のあと', wake_ng: '目を覚まして怒った夜のあと', apart: '別々に眠った夜のあと', tender: '並んで眠った夜のあと', un: '何も知らない夜のあと' })[k] + '）',
      face: k === 'wake_ng' || k === 'apart' ? faceB(S, 'angry') : body ? faceB(S, 'shy') : null });
    /* 暮らし方の朝（2 日目以降も毎日のどこかで暮らし方を効かせる。朝に出なかった日は昼に） */
    S.setToday = false;
    if (!S.broken && ctx.rng() < 0.5) { var ms = pk(ctx, S, (T.SET_M || {})[S.reason]); if (ms) { say(ctx, S, 'nm_set', ms, { why: '暮らし方の朝（' + ({ together: '同居', stay: '泊まり', trip: '旅先' })[S.reason] + '）' }); S.setToday = true; } }
  }

  /* 昼：眠る側の分岐・触れる側の顔・暮らし方・疼き・二人のやりとり */
  function day(ctx, S, d) {
    var T = TX();
    if (S.broken) { for (var bi = 0; bi < 2; bi++) say(ctx, S, 'nm_post_ng', pk(ctx, S, T.POST_NG_D, { again: false }), { why: '知られてしまったあとの昼（' + ({ together: '同じ家で避け合う', stay: '' + S.B.name + 'は自分の家へ', trip: '宿の別々の部屋' })[S.reason] + '）', face: faceB(S, 'angry') }); return; }
    if (S.accepted) {
      say(ctx, S, 'nm_post_ok', pk(ctx, S, T.POST_OK_D, { g: 'uzuki' }), { cat: rcat(ctx, S), why: '受け入れたあとの昼' });
      setDay(ctx, S, T);
      return;
    }
    /* 眠る側の昼（気づきの段 1 から。約束の無い二人の「気づかない」は疼きの段で） */
    var as = st(S, 'aware'), did = false;
    if (as >= 1 || S.bBr === 'unaware') {
      var bk = S.bBr;
      /* 本音が線の下なら、寝たふり・誘うは探るに */
      if ((bk === 'feign' || bk === 'invite') && !wantOk(S)) bk = 'probe';
      var bt = pk(ctx, S, (T.DAY_B || {})[bk], { g: 'aware' });
      if (bt) {
        say(ctx, S, 'nm_day_b', bt, { why: '眠る側の昼（' + ({ unaware: '疼きに気づかない', probe: '違和感を探る', feign: '寝たふりを決める', invite: '自分から誘う気配' })[bk] + (S.bOdd ? '・らしくない' : '') + '）', face: bk === 'probe' ? faceB(S, 'surprise') : bk === 'unaware' ? null : faceB(S, 'shy') });
        did = true;
        if (bk === 'feign' || bk === 'invite') { bumpWant(ctx, S, 4); S.flags.bAct = true; }
        else if (bk === 'probe') bumpWant(ctx, S, 1);
      }
    }
    /* 触れる側の昼（態度 9 種、分岐で） */
    var at = pkPer(ctx, S, T.DAY_A, S.aPer, { g: 'reach' });
    var br = st(S, 'reach') >= 1 ? pk(ctx, S, (T.DAY_ABR || {})[S.aBr], { g: 'reach' }) : '';
    if (at || br) { say(ctx, S, br ? 'nm_day_br' : 'nm_day_a', join(at, br), { why: '触れる側の昼（' + ({ careful: '慎重', bold: '大胆', guilt: '罪悪感' })[S.aBr] + (S.aOdd ? '・らしくない' : '') + '）', fx: function () { ctx.mod2(S.A, S.B, { aff: 1 }, { aff: 1, trust: 1 }); } }); bumpWant(ctx, S, 2); did = true; }
    /* 疼き（段 1 から） */
    if (st(S, 'uzuki') >= 1 && ctx.rng() < 0.75) { var ut = pk(ctx, S, T.UZUKI_D, { g: 'uzuki' }); if (ut) { say(ctx, S, 'nm_uzuki', ut, { why: '昼の疼き', face: faceB(S, 'shy') }); bumpWant(ctx, S, 3); } }
    /* 約束を確かめる（約束のある二人、ときどき） */
    if (S.pact && !S.flags.pactTalk && d >= 1 && ctx.rng() < 0.5) { S.flags.pactTalk = true; say(ctx, S, 'nm_pact', pk(ctx, S, T.PACT_D), { cat: rcat(ctx, S), why: '寝ている間の約束を確かめた' }); }
    /* 眠りの深さの昼 */
    if (ctx.rng() < 0.4) { var dt = pk(ctx, S, (T.DEPTH_D || {})[S.depth]); if (dt) say(ctx, S, 'nm_depth', dt, { why: '眠りの深さの昼（' + ({ tired: '疲れ', drug: '薬', usual: 'ふだん' })[S.depth] + '）' }); }
    setDay(ctx, S, T);
    /* 二人のやりとり（関係ごと） */
    if (!did || ctx.rng() < 0.6) say(ctx, S, 'nm_talk', pk(ctx, S, (T.TALK || {})[S.grp], { g: 'reach' }) || pk(ctx, S, (T.TALK || {})._), { why: '二人の昼のやりとり' });
  }
  /* 暮らし方の昼（朝に出なかった日は必ず） */
  function setDay(ctx, S, T) {
    if (S.setToday) return;
    var t = pk(ctx, S, (T.SET_D || {})[S.reason]);
    if (t) { say(ctx, S, 'nm_set', t, { why: '暮らし方の昼（' + ({ together: '同居', stay: '泊まり', trip: '旅先' })[S.reason] + '）' }); S.setToday = true; }
  }

  /* 夜 */
  function night(ctx, S, d, last) {
    var T = TX(), R = R18();
    /* 寝支度（暮らし方 × 眠りの深さ。山場のあと・別々の夜は別の文） */
    if (!S.broken) {
      var bt = join(pk(ctx, S, (T.BED || {})[S.reason]), S.accepted ? '' : pk(ctx, S, (T.BED_D || {})[S.depth]));
      say(ctx, S, 'nm_bed', bt, { why: '寝支度' });
    }
    if (d < S.peakN) preNight(ctx, S, d);
    else if (d === S.peakN) peak(ctx, S, d);
    else postNight(ctx, S, d, last);
    if (last) ending(ctx, S);
  }

  /* 山場の前の夜 */
  function preNight(ctx, S, d) {
    var T = TX(), R = R18();
    nightMove(ctx, S);
    var rs = st(S, 'reach');
    /* 罪悪感：踏み込みの段 1 に届いたら、そこで手を止める夜が続く */
    if (S.aBr === 'guilt' && rs >= 1 && S.flags.guiltStart != null && d > S.flags.guiltStart) {
      say(ctx, S, 'nm_guilt', pkPer(ctx, S, T.GUILT, S.aPer), { why: '触れかけて手を止めた夜（' + S.A.name + '）' });
      S.lastNight = 'guilt';
      /* 止めた手を、寝たふり・誘う側が引き寄せる（眠る側が起きていて選ぶ） */
      if ((S.bBr === 'feign' || S.bBr === 'invite') && st(S, 'aware') >= 2 && wantOk(S)) bInvite(ctx, S, d, 'pull');
      return;
    }
    if (S.aBr === 'guilt' && rs >= 1 && S.flags.guiltStart == null) S.flags.guiltStart = d;
    /* 寝たふり：気づきの段 2 から、本音が線を越えていれば、眠る側は起きていて目を閉じたまま待つ */
    if (S.bBr === 'feign' && st(S, 'aware') >= 2 && wantOk(S)) {
      if (S.lewdOn && R && S.sexN < S.quota && S.flags.feignN >= 1 && !S.flags.feignSex) { S.flags.feignSex = true; if (R.scene(ctx, S, 'feign')) { S.lastNight = 'scene'; return; } }
      S.flags.feignN = (S.flags.feignN || 0) + 1;
      if (!(S.lewdOn && R && R.touch(ctx, S, 'feign'))) say(ctx, S, 'nm_feign', pk(ctx, S, T.FEIGN, { g: 'reach' }), { why: '寝たふりの夜（' + S.B.name + 'は起きていた）', face: faceB(S, 'shy') });
      DK.push(S, 'uzuki', 12); bumpWant(ctx, S, 4);
      S.lastNight = 'feign';
      return;
    }
    /* 誘う：疼きの段 1 から、本音が線を越えていれば、眠る側から誘う（起きていて） */
    if (S.bBr === 'invite' && st(S, 'aware') >= 1 && st(S, 'uzuki') >= 1 && wantOk(S) && !S.flags.inv0) { S.flags.inv0 = true; if (bInvite(ctx, S, d, 'invite')) return; }
    /* 約束のある二人：眠っている間の愛撫（R18） */
    if (S.pact && S.lewdOn && R && rs >= 1 && wantOk(S)) {
      if (R.touch(ctx, S, 'sleep')) { S.lastNight = 'touch'; return; }
    }
    /* 寝顔のそば（踏み込みの段で：見つめる → 髪・手 → 隣で添い寝・額に唇） */
    var nt = join(pk(ctx, S, T.NEAR, { g: 'reach' }), pkPer(ctx, S, T.NEAR_A, S.aPer));
    say(ctx, S, 'nm_near', nt, { why: '寝顔のそばの夜（' + S.A.name + '）' });
    DK.push(S, 'uzuki', 3 + 3 * rs + (S.pact ? 4 : 0));
    S.lastNight = 'near';
  }
  /* 眠る側から（起きていて）：kind 'invite' 誘う／'pull' 止めた手を引き寄せる。場面を出したら真 */
  function bInvite(ctx, S, d, kind) {
    var T = TX(), R = R18();
    S.invited = true; bumpWant(ctx, S, 6);
    if (S.lewdOn && R && S.sexN < S.quota) { if (R.scene(ctx, S, kind)) { S.lastNight = 'scene'; return true; } }
    say(ctx, S, 'nm_feign', pk(ctx, S, (T.INVITE_N || {})[kind]), { cat: rcat(ctx, S), why: kind === 'pull' ? '止めた手を眠る側が引き寄せた夜' : '眠る側から誘った夜（体の場面にはならない）', face: faceB(S, 'shy') });
    S.lastNight = 'feign';
    return true;
  }

  /* 山場：途中で目を覚ます夜 */
  function peak(ctx, S, d) {
    var T = TX(), P = T.PEAK || {}, R = R18();
    nightMove(ctx, S);
    /* 約束のある二人で、眠る側が気づいていない：目を覚ましかけて、また眠りに落ちる（何も知らないまま） */
    if (S.pact && S.bBr === 'unaware' && st(S, 'aware') <= 1 && ctx.rng() < 0.75) {
      S.unknown = true;
      if (S.lewdOn && R) R.touch(ctx, S, 'half');
      say(ctx, S, 'nm_peak_half', pk(ctx, S, P.half), { why: '山場：目を覚ましかけて、また眠りに落ちた（' + S.B.name + '）', tag: '山場', mag: 20 });
      S.lastNight = 'half';
      return;
    }
    /* 目を覚ます：本音が線を越えていれば受け入れる。関係で反応が変わる */
    var ok = wantOk(S);
    var g = S.grp === 'body' ? 'love' : S.grp;
    var open = pk(ctx, S, S.bBr === 'feign' || S.flags.feignN ? P.openF : P.open, { g: 'reach' });
    var re = pk(ctx, S, ((P.react || {})[g] || {})[ok ? 'ok' : 'ng']) || pk(ctx, S, ((P.react || {}).close || {})[ok ? 'ok' : 'ng']);
    var fc = {}; fc[S.B.i] = ok ? (g === 'awk' ? 'angry' : g === 'love' ? 'joy' : 'shy') : 'angry'; fc[S.A.i] = 'surprise';
    say(ctx, S, 'nm_peak', join(open, re), { cat: ok ? rcat(ctx, S) : 'bond', why: '山場：' + S.B.name + 'が途中で目を覚ました（' + (ok ? '受け入れた' : '怒って離れた') + '）', tag: '山場', mag: 30, face: fc,
      fx: function () { if (ok) ctx.mod2(S.A, S.B, { aff: 6, trust: 4, att: S.love ? 6 : 0 }, { aff: 6, trust: 3, att: S.love ? 6 : 0 }); else ctx.mod2(S.A, S.B, { trust: -12, ten: 10 }, { trust: -16, ten: 14, aff: -6 }); } });
    if (!ok) {
      S.broken = true;
      say(ctx, S, 'nm_peak', pk(ctx, S, (P.leave || {})[S.reason]), { why: '山場：' + S.B.name + 'が離れていった', face: faceB(S, 'angry') });
      S.lastNight = 'wake_ng';
      return;
    }
    S.accepted = true;
    DK.push(S, 'aware', 100);
    if (S.lewdOn && R && S.sexN < S.quota && R.scene(ctx, S, 'wake')) { S.lastNight = 'scene'; return; }
    say(ctx, S, 'nm_night_ok', pk(ctx, S, P.calm), { cat: rcat(ctx, S), why: '山場のあと、並んで眠った' });
    S.lastNight = 'wake_ok';
  }

  /* 山場のあとの夜 */
  function postNight(ctx, S, d, last) {
    var T = TX(), R = R18();
    /* 告白（受け入れたあと、恋愛にしてよく、恋人でない二人。山場の翌日の夜） */
    if (S.accepted && S.love && !S.couple && !S.confessed) {
      S.confessed = true;
      say(ctx, S, 'nm_confess', pk(ctx, S, T.CONFESS), { cat: rcat(ctx, S), why: '想いを告げた夜', mag: 25, face: faceB(S, 'shy'), fx: function () { ctx.mod2(S.A, S.B, { aff: 8, att: 8, trust: 6 }, { aff: 8, att: 8, trust: 6 }); } });
    }
    if (S.broken) { say(ctx, S, 'nm_night_ng', pk(ctx, S, (T.NIGHT_NG || {})[S.reason]) || pk(ctx, S, (T.NIGHT_NG || {})._), { why: '別々に眠った夜' }); S.lastNight = 'apart'; return; }
    if (S.unknown) {
      nightMove(ctx, S);
      if (S.lewdOn && R && R.touch(ctx, S, 'sleep')) { S.lastNight = 'touch'; return; }
      say(ctx, S, 'nm_night_un', pk(ctx, S, T.NIGHT_UN), { why: '何も知らない相手の隣の夜' });
      S.lastNight = 'un';
      return;
    }
    /* 受け入れたあと：疼きの段 2 からは眠る側が誘う。回数が残っていれば場面 */
    var inv = st(S, 'uzuki') >= 2 || S.bBr === 'invite' || last;
    if (S.lewdOn && R && S.sexN < S.quota) {
      if (R.scene(ctx, S, inv ? 'invite' : 'again')) { if (inv) S.invited = true; S.lastNight = 'scene'; return; }
    }
    if (inv && !S.flags.invN) { S.flags.invN = true; S.invited = true; say(ctx, S, 'nm_night_ok', pk(ctx, S, (T.INVITE_N || {}).after), { cat: rcat(ctx, S), why: '眠る側から誘った夜', face: faceB(S, 'shy') }); S.lastNight = 'tender'; return; }
    say(ctx, S, 'nm_night_ok', pk(ctx, S, T.NIGHT_OK), { cat: rcat(ctx, S), why: '打ち明けたあとの夜' });
    S.lastNight = 'tender';
  }

  /* ---------- 結末 ---------- */
  var END_NAME = { fall: '体が堕ちる', broken: 'バレて関係が壊れる', koi: 'バレて受け入れられる', invite: '体が疼いて自分から誘う', unknown: '何も知らないまま体だけが疼く' };
  function endKey(S) {
    if (S.broken) return 'broken';
    if (S.unknown) return 'unknown';
    if (S.invited && (S.bBr === 'invite' || DK.stage(S, 'uzuki') >= 2) && DK.stage(S, 'dev') < 3) return 'invite';
    if (DK.stage(S, 'dev') >= 3 && S.sexN > 0) return 'fall';
    if (S.invited) return 'invite';
    return 'koi';
  }
  function ending(ctx, S) {
    var T = TX(), R = R18();
    /* 回数が出なかったわけ（設定した回数に届かなかったとき、一つだけ） */
    if (R && !HK.SAFE_ON && ctx.env.lewdN !== 'none' && S.sexN < S.quota) R.why(ctx, S, S.noBody ? 'nobody' : S.broken ? 'broken' : S.unknown ? 'unknown' : !wantOk(S) ? 'want' : 'chance');
    var k = S.endK = endKey(S);
    var E = (T.END || {})[k] || {}, sub = k === 'koi' ? (S.couple ? 'couple' : S.love ? 'love' : 'none') : k === 'broken' ? S.reason : '_';
    var t = pk(ctx, S, E[sub] || E._);
    var fc = {}; fc[S.B.i] = { fall: 'shy', broken: 'sad', koi: S.love ? 'smile_lover' : 'joy', invite: 'shy', unknown: 'normal' }[k];
    say(ctx, S, 'nm_end', t, { cat: k === 'koi' || k === 'invite' || k === 'fall' ? rcat(ctx, S) : 'bond', why: '結末（' + END_NAME[k] + '）', mag: 20, face: fc, tag: '結末' });
    S.ended = true;
  }
  function finish(ctx) {
    var S = f(ctx); if (!S) return;
    if (!S.endK) S.endK = endKey(S);
    ctx.flags.nemuri = { a: S.A.i, b: S.B.i, days: S.days, rel: RK_NAME[S.rk], reason: S.reason, depth: S.depth, pact: S.pact, aBr: S.aBr, bBr: S.bBr, aOdd: S.aOdd, bOdd: S.bOdd,
      end: END_NAME[S.endK], endK: S.endK, sex: S.sexN, touch: S.touchN, want: DK.val(S, 'want'), dev: DK.stage(S, 'dev'), aware: DK.stage(S, 'aware'), uzuki: DK.stage(S, 'uzuki'), noBody: S.noBody };
    ctx.flags.outcome = S.B.name + 'の眠りの' + S.days + '夜――' + END_NAME[S.endK];
  }
  DK.install(ID, DK.couple('part', 'toucher', 'sleeper', []), 'nemuri', { outside: false });
  var A_NAME = { careful: '少しずつ慎重に', bold: '夜ごとに大胆に', guilt: '罪悪感で手を止めた' }, B_NAME = { unaware: '疼きの正体に気づかなかった', probe: '違和感を探った', feign: '寝たふりを選んだ', invite: '自分から誘った' };
  if (HK.Endings) HK.Endings[ID] = function (res, X) {
    var R = res.end && res.end.nemuri, lines = [];
    if (!R) return { headline: res.outcome || '', stats: [], lines: [] };
    var a = X.nm(R.a), b = X.nm(R.b);
    lines.push('眠りの' + R.days + '夜（' + a + 'が触れる側・' + b + 'が眠る側・' + R.rel + '）');
    lines.push(({ together: '同居', stay: '泊まり', trip: '旅先' })[R.reason] + '／眠りの深さ：' + ({ tired: '疲れ', drug: '薬', usual: 'ふだん' })[R.depth] + '／前もっての約束：' + (R.pact ? 'あり' : 'なし'));
    lines.push(a + '：' + A_NAME[R.aBr] + (R.aOdd ? '（らしくない）' : '') + '／' + b + '：' + B_NAME[R.bBr] + (R.bOdd ? '（らしくない）' : ''));
    if (!HK.SAFE_ON) lines.push('エッチ ' + R.sex + '回' + (R.touch ? '／眠っている間の愛撫 ' + R.touch + '回' : ''));
    lines.push('結末：' + R.end);
    X.C.forEach(function (c) { c.afterDone = true; });
    return { headline: (res.outcome || '') + '。', stats: [['夜', R.days + '夜'], ['結末', R.end]].concat(HK.SAFE_ON ? [] : [['エッチ', R.sex + '回']]), lines: lines };
  };
  /* 結果欄の二人の関係（始まりの関係と結末から） */
  var CLS = {
    koi_love: ['恋人になった', 'love', 2, '眠っている間のことを知られた夜を越えて、想いを告げ合った。'],
    koi_couple: ['夜を預け合う恋人', 'love', 2, '眠っている間のことも含めて、互いを預け合う恋人どうしになった。'],
    koi_none: ['秘密を分け合う仲', 'friend', 1, '眠っている間のことを知ったうえで、それでも同じ部屋で眠ることを選んだ。'],
    fall: ['離れられない体', 'night', 0, '眠りの浅いところまで、互いの手が覚えてしまった。'],
    invite: ['夜を待つ仲', 'night', 0, '眠る側のほうから夜を待つようになった。'],
    unknown: ['名前のない夜', 'night', 0, '眠っている間のことは、まだ一人だけの秘密のままだ。'],
    broken: ['壊れた信頼', 'enemy', -1, '眠っている間のことを知られて、同じ部屋では眠らなくなった。']
  };
  scen.classify = function (ctx, X, Y) {
    var S = f(ctx); if (!S || !((X === S.A && Y === S.B) || (X === S.B && Y === S.A))) return null;
    var k = S.endK || endKey(S), ck = k === 'koi' ? 'koi_' + (S.couple ? 'couple' : S.love ? 'love' : 'none') : k;
    if ((ck === 'koi_love' || ck === 'koi_couple') && !S.love) ck = 'koi_none';
    var M0 = CLS[ck], id = 'nmk_' + ck;
    if (HK.LABELS && !HK.LABELS[id]) HK.LABELS[id] = { name: M0[0], cls: M0[1], pol: M0[2] };
    return { id: id, nmc: ck };
  };
  scen.pairText = function (ctx, X, Y, cl) { var c = cl && cl.nmc; return c && CLS[c] ? CLS[c][3] : null; };
  HK.Nemuri = { ID: ID, LINE: LINE, okRow: okRow, pk: pk, pkPer: pkPer, say: say, join: join, shOf: shOf, faceB: faceB, rcat: rcat, wantOk: wantOk, RK_NAME: RK_NAME };
  HK.SCENARIOS[ID] = scen;
  if (HK.Lewd && HK.Lewd.install) HK.Lewd.install(ID, { lenDef: 'mix', desc: '夜の場面の描き方。ほのめかす＝ぼかした一文と翌朝だけ／ほどほど＝描写する／濃い＝果てたあと、もう一度求め合うところまで' });
})();
