/* デートの日々：追加の出来事（関係性ごと・性格・エゴグラム・アクシデント・季節）。両方のビルド。2026-11-04（不具合リスト 1104 の 3 の追加の指示）
   ■ HK.DateMore.run(ctx, day, 区切り, X)：date.js が 午前（行き先のあと）・午後（出来事の順番の中）・夜（夕食の前）・終わりぎわ（帰りの道中の前）に呼ぶ。
     X は date.js の部品（f・setO・lead2・pickT・relPick・attPick・fill・per・rcat・cands）。1 回のデートで 2 件まで。
   ・関係性ごと（MORE_REL。片想いは想う側が {a}。家族は血縁の種類＋様子）／性格（MORE_PER＝{a} の態度9種）／エゴグラム（MORE_EGO＝因子が 0.7 以上の人）
   ・アクシデント（MORE.acc_*）：ナンパ（恋人どうし・両片想い。守る人の態度9種 NANPA_RE）・にわか雨・相合傘・雪の結晶・強い風・急な晴れ間（屋外）・
     靴が壊れる（その日の終わりぎわだけ）・財布を忘れる・はぐれて再会・写真を撮ってもらう・人混みで手をつなぐ・意外な特技・飲み物をこぼす
   ・季節（MORE.sea_*。その日の月から）：春 桜・花粉・陽気／夏 遠くの花火（夜）・かき氷・夕立／秋 色づいた葉・金木犀・夕暮れ／冬 街の灯り（夜）・手袋を貸す・白い息
   ・出る舞台は HK.DateSet の KIND['MORE.鍵'] と文の語の決まり。段を持つ行き先の中にいるあいだ（その日の段を出る前）は、アクシデントと季節は出さない。
   ・受け止め方は {b} の態度9種（MORE_RE の soft・doki・warm・tease・help）。一回の遊びで同じ文を二度出さない */
/* @event scen=set-b-date id=dt_more_rel cat=bond tie=- label=関係ならではのデートの一場面 */
/* @event scen=set-b-date id=dt_more_per cat=bond tie=- label=性格が出るデートの一場面 */
/* @event scen=set-b-date id=dt_more_ego cat=bond tie=- label=気質の強さが出るデートの一場面 */
/* @event scen=set-b-date id=dt_acc_nanpa cat=romance tie=- label=恋人がナンパにあって守る */
/* @event scen=set-b-date id=dt_acc_ame cat=romance tie=- label=にわか雨で濡れて雨宿りする */
/* @event scen=set-b-date id=dt_acc_aiai cat=romance tie=- label=一本の傘に入って歩く */
/* @event scen=set-b-date id=dt_acc_yuki cat=romance tie=- label=相手の服の上に雪の結晶を見つける */
/* @event scen=set-b-date id=dt_acc_kaze cat=bond tie=- label=強い風に髪や帽子をさらわれる */
/* @event scen=set-b-date id=dt_acc_harema cat=bond tie=- label=急な晴れ間を二人で見上げる */
/* @event scen=set-b-date id=dt_acc_kutsu cat=romance tie=- label=帰り際に靴が壊れて運んでもらう */
/* @event scen=set-b-date id=dt_acc_saifu cat=bond tie=- label=財布を忘れて相手が払ってくれる */
/* @event scen=set-b-date id=dt_acc_maigo cat=romance tie=- label=はぐれてしまい探して再会する */
/* @event scen=set-b-date id=dt_acc_photo cat=bond tie=- label=通りがかりの人に写真を撮ってもらう */
/* @event scen=set-b-date id=dt_acc_hitogomi cat=romance tie=- label=人混みではぐれないよう手をつなぐ */
/* @event scen=set-b-date id=dt_acc_tokugi cat=bond tie=- label=相手の意外な特技を目にする */
/* @event scen=set-b-date id=dt_acc_kobosu cat=bond tie=- label=飲み物をこぼして世話を焼く */
/* @event scen=set-b-date id=dt_sea_hanami cat=romance tie=- label=春のデートで桜の花びらが舞う */
/* @event scen=set-b-date id=dt_sea_kafun cat=bond tie=- label=春の花粉でくしゃみが止まらない */
/* @event scen=set-b-date id=dt_sea_haru cat=bond tie=- label=春の陽気の中をのんびり歩く */
/* @event scen=set-b-date id=dt_sea_hanabi cat=romance tie=- label=夏の夜に遠くの花火を見上げる */
/* @event scen=set-b-date id=dt_sea_kakigori cat=bond tie=- label=夏の暑さにかき氷を分け合う */
/* @event scen=set-b-date id=dt_sea_yudachi cat=romance tie=- label=夏の夕立と雨上がりの虹 */
/* @event scen=set-b-date id=dt_sea_momiji cat=bond tie=- label=秋の色づいた葉を拾って見せる */
/* @event scen=set-b-date id=dt_sea_kinmokusei cat=bond tie=- label=秋の金木犀の香りに足を止める */
/* @event scen=set-b-date id=dt_sea_aki cat=bond tie=- label=秋の夕暮れを並んで歩く */
/* @event scen=set-b-date id=dt_sea_illumi cat=romance tie=- label=冬の夜の街の灯りの下を歩く */
/* @event scen=set-b-date id=dt_sea_tebukuro cat=romance tie=- label=冬の寒さに手袋を貸す */
/* @event scen=set-b-date id=dt_sea_iki cat=bond tie=- label=冬の白い息を吐いて笑い合う */
(function () {
  'use strict';
  var HK = window.HK;
  if (!HK) return;
  var M = HK.DateMore = HK.DateMore || {};
  function TX() { return HK.DateText || {}; }
  /* アクシデントの出る区切り（am 午前・pm 午後・ev 夜・end 終わりぎわ）と、恋愛にしてよい二人だけのもの・恋人どうし（両片想いも）だけのもの */
  M.ACC = {
    acc_nanpa: { at: 'pm ev', couple: true, w: 0.6 }, acc_ame: { at: 'am pm', w: 0.5 }, acc_aiai: { at: 'am pm', love: true, w: 0.5 }, acc_yuki: { at: 'am pm ev', w: 0.8 },
    acc_kaze: { at: 'am pm', w: 0.4 }, acc_harema: { at: 'am pm', w: 0.4 }, acc_kutsu: { at: 'end', w: 1 }, acc_saifu: { at: 'pm ev', w: 0.4 }, acc_maigo: { at: 'am pm', w: 0.5 },
    acc_photo: { at: 'am pm', w: 0.5 }, acc_hitogomi: { at: 'am pm ev', love: true, w: 0.5 }, acc_tokugi: { at: 'am pm', w: 0.5 }, acc_kobosu: { at: 'pm ev', w: 0.4 }
  };
  M.SEA = {
    spring: { sea_hanami: 'am pm', sea_kafun: 'am pm', sea_haru: 'am pm' }, summer: { sea_hanabi: 'ev', sea_kakigori: 'am pm', sea_yudachi: 'pm' },
    autumn: { sea_momiji: 'am pm', sea_kinmokusei: 'am pm', sea_aki: 'pm ev' }, winter: { sea_illumi: 'ev', sea_tebukuro: 'pm ev', sea_iki: 'am pm ev' }
  };
  function seasonOf(m) { return m >= 3 && m <= 5 ? 'spring' : m >= 6 && m <= 8 ? 'summer' : m >= 9 && m <= 11 ? 'autumn' : 'winter'; }
  M.seasonOf = seasonOf;
  var EGO_K = { cp: 'cp', np: 'np', a: 'a', fc: 'fc', ac: 'ac' };
  var EGO_NAME = { cp: 'きっちりした気質', np: '世話焼きの気質', a: '冷静な気質', fc: '天真爛漫な気質', ac: '遠慮がちな気質' };
  M.run = function (ctx, day, part, X) {
    var S = X.f(ctx), Tx = TX();
    if (!S || !S.A || S.A === S.B || !day || day.over) return;
    day.more = day.more || 0;
    if (day.more >= 2) return;
    var p = { am: 0.3, pm: 0.5, ev: 0.35, end: 0.12 }[part] || 0;
    if (ctx.rng() > p) return;
    var D = day.cur || day.P.main;
    /* 段を持つ行き先の中にいるあいだ（その日の段を出る前）は、アクシデントと季節を出さない */
    var inside = D && D.ph && !(day.phOut || {})[D.id] && part !== 'end';
    var x = X.lead2(ctx, day), a = x[0], b = x[1], C = [];
    var so = function (k, pt) { return X.setO(day, 'MORE.' + k, pt || (part === 'end' ? 'ev' : part)); };
    var avail = function (arr, k, aa, bb) { return X.cands(ctx, arr, aa || a, bb || b, so(k)).some(function (t) { return !S.used[t]; }); };
    if (part !== 'end') {
      /* 関係性ごと（片想いは想う側が {a}） */
      var ra = S.rkKey === 'crushA' ? S.A : S.rkKey === 'crushB' ? S.B : a, rb = ra === S.A ? S.B : S.A;
      C.push({ k: 'rel', w: 1, a: ra, b: rb });
      C.push({ k: 'per', w: 1, a: a, b: b });
      var eg = null, ev = 0.7;
      [S.A, S.B].forEach(function (c) { var t = c.tr || {}; Object.keys(EGO_K).forEach(function (f) { var v = t[f] != null ? t[f] : 0.5; if (v >= ev) { ev = v; eg = { c: c, f: f }; } }); });
      if (eg) C.push({ k: 'ego', w: 0.8, a: eg.c, b: eg.c === S.A ? S.B : S.A, f: eg.f });
    }
    if (!inside) {
      Object.keys(M.ACC).forEach(function (k) {
        var o = M.ACC[k];
        if (o.at.split(' ').indexOf(part) < 0) return;
        if (o.love && !S.love) return;
        if (o.couple && !(S.couple || S.rk === 'almost')) return;
        if (k === 'acc_kutsu' && !day.last && ctx.rng() < 0.5) return;
        C.push({ k: k, w: o.w });
      });
      var sea = M.SEA[seasonOf(day.P.month || 1)] || {};
      Object.keys(sea).forEach(function (k) { if (sea[k].split(' ').indexOf(part === 'end' ? 'ev' : part) >= 0) C.push({ k: k, w: 0.7 }); });
    }
    /* 文の残っている種だけ */
    C = C.filter(function (c) {
      var aa = c.a || a, bb = c.b || b;
      if (c.k === 'rel') return avail(X.relList(Tx.MORE_REL, S), 'rel', aa, bb);
      if (c.k === 'per') return avail((Tx.MORE_PER || {})[X.per(aa)], 'per', aa, bb);
      if (c.k === 'ego') return avail((Tx.MORE_EGO || {})[c.f], 'ego', aa, bb);
      var R = (Tx.MORE || {})[c.k]; return R && avail(R.L, c.k);
    });
    if (!C.length) return;
    var c = HK.weighted(ctx.rng, C, function (q) { return q.w; }), aa = c.a || a, bb = c.b || b, t = '', name = '', re = '', cat = 'bond';
    var ex = { fw: S.famW || '家族', yosu: ((ctx.rel[S.A.i][S.B.i].aff || 0) + (ctx.rel[S.B.i][S.A.i].aff || 0)) / 2 >= 40 ? '仲の良い' : '少しぎこちない' };
    if (c.k === 'rel') { t = X.relPick(ctx, Tx.MORE_REL, aa, bb, false, so('rel')); name = '関係ならではの一場面'; re = 'soft'; }
    else if (c.k === 'per') { t = X.pickT(ctx, (Tx.MORE_PER || {})[X.per(aa)], aa, bb, false, so('per')); name = '性格が出る一場面（' + aa.name + '）'; re = 'soft'; }
    else if (c.k === 'ego') { t = X.pickT(ctx, (Tx.MORE_EGO || {})[c.f], aa, bb, false, so('ego')); name = EGO_NAME[c.f] + '（' + aa.name + '）'; re = c.f === 'fc' ? 'tease' : c.f === 'ac' ? 'soft' : 'help'; }
    else { var R = Tx.MORE[c.k]; t = X.pickT(ctx, R.L, aa, bb, false, so(c.k)); name = R.name; re = R.re; }
    if (!t) return;
    /* 受け止め方：ナンパは守る人（{a}）の態度9種、ほかは {b} の態度9種 */
    var tail = '';
    if (c.k === 'acc_nanpa') { var nr = X.attPick(ctx, Tx.NANPA_RE, aa, aa, bb, true); if (nr) tail = X.fill(ctx, nr, aa, bb, ex); }
    else if (re) { var rr = X.attPick(ctx, (Tx.MORE_RE || {})[re], bb, aa, bb, true); if (rr) tail = X.fill(ctx, rr, aa, bb, ex); }
    var rom = /^(?:acc_(?:nanpa|ame|aiai|yuki|kutsu|maigo|hitogomi)|sea_(?:hanami|hanabi|yudachi|illumi|tebukuro))$/.test(c.k) && S.love;
    cat = rom ? X.rcat(ctx, aa, bb) : 'bond';
    var e = ctx.act2({ actors: [aa, bb], cat: cat, text: X.fill(ctx, t, aa, bb, ex) + tail, why: 'デートの日々：' + name,
      fx: function () { ctx.mod2(aa, bb, { aff: 2, att: rom ? 2 : 0 }, { aff: 2, att: rom ? 3 : 0, trust: re === 'help' ? 2 : 0 }); } });
    if (!e) return;
    day.more++;
    S.cnt['more_' + c.k] = (S.cnt['more_' + c.k] || 0) + 1;
    if (/hitogomi|maigo|aiai|tebukuro/.test(c.k)) day.k.te = 1;
    if (c.k === 'acc_photo') day.k.photo = 1;
    if (c.k === 'acc_saifu') day.k.kaikei = 1;
  };
})();
