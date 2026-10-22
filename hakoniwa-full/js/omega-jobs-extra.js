/* 箱庭シミュレーター: オメガバース ― 追加の職業（店主・ホテルオーナー・従業員）と、その職業だけの出来事
   {shop}=店主の店（例：喫茶店）　{hotel}=ホテルの名前　{work}=従業員の勤め先　{boss}=雇い主の名前
   店主・ホテルオーナーが住人にいれば、従業員はその人に雇われている（上司と部下の出来事が起きる） */
(function () {
  'use strict';
  var HK = window.HK, OM = HK.OMEGA, ST = OM.STATUS;
  function J(sc, cat, sx, texts, fx, why) { return { sc: sc, cat: cat, sx: sx || '', texts: texts.split('|'), fx: fx || {}, why: why || '' }; }
  function L(s) { return s.split('|'); }

  /* ---------- 職業の登録（同じ職種のいちばん後ろに差し込む） ---------- */
  [['shopowner', '店主', 'serv'], ['hotelier', 'ホテルオーナー', 'biz'], ['staff', '従業員', 'serv']].forEach(function (j) {
    var at = -1;
    OM.JOBS.forEach(function (x, i) { if (x[2] === j[2]) at = i; });
    OM.JOBS.splice(at + 1, 0, j);
    OM.JOB[j[0]] = { id: j[0], name: j[1], cat: j[2], a: false, o: false };
  });
  ST.HIGH.hotelier = 1;
  ST.LOW.staff = 1;

  /* 店の種類（店主の気質から） */
  var SHOPS = [
    ['喫茶店', function (t) { return t.np * 0.5 + t.a * 0.3; }], ['古書店', function (t) { return t.a * 0.6 + (1 - t.fc) * 0.4; }],
    ['花屋', function (t) { return t.np * 0.6 + t.fc * 0.3; }], ['雑貨屋', function (t) { return t.fc * 0.6 + t.warmth * 0.3; }],
    ['定食屋', function (t) { return t.np * 0.5 + t.cp * 0.3; }], ['バー', function (t) { return t.cold * 0.5 + t.fc * 0.3; }],
    ['パン屋', function (t) { return t.np * 0.4 + t.ac * 0.4; }], ['古着屋', function (t) { return t.fc * 0.5 + (1 - t.ac) * 0.4; }],
    ['骨董屋', function (t) { return t.a * 0.5 + t.cp * 0.3; }], ['煙草屋', function (t) { return t.cold * 0.6 + (1 - t.np) * 0.3; }]
  ];
  var HOTELS = L('ホテル・ルミエール|ホテル白鷺|ホテル・グランアズール|ホテル・ノクターン|ホテル月影|ホテル・エトワール|ホテル海猫|ホテル・ミラージュ');

  /* 住人ごとの職場を決める（scenario-omega.js の準備の最後に呼ばれる） */
  OM.jobSetup = function (ctx) {
    var om = ctx.om, rng = ctx.rng, P = ctx.chars;
    om.boss = {};
    P.forEach(function (c) {
      if (c.om.job === 'shopowner') c.om.shop = HK.weighted(rng, SHOPS, function (s) { return Math.pow(Math.max(0.05, s[1](c.tr)), 2) + 0.05; })[0];
      if (c.om.job === 'hotelier') c.om.hotel = rng.pick(HOTELS);
    });
    var owners = P.filter(function (c) { return (c.om.job === 'shopowner' || c.om.job === 'hotelier') && !c.om.former; });
    P.forEach(function (c) {
      if (c.om.job !== 'staff') return;
      var b = owners.length && !c.om.former ? rng.pick(owners) : null;
      if (b) { om.boss[c.i] = b.i; c.om.work = b.om.hotel || b.name + 'の' + b.om.shop; c.om.workKind = b.om.hotel ? 'hotel' : 'shop'; }
      else { var h = rng() < 0.5; c.om.workKind = h ? 'hotel' : 'shop'; c.om.work = h ? rng.pick(HOTELS) : '駅前の' + rng.pick(SHOPS)[0]; }
    });
  };
  /* 見守りの最初に、職場を一言ずつ */
  OM.jobIntro = function (ctx) {
    var om = ctx.om;
    ctx.chars.forEach(function (c) {
      if (c.om.former) return;
      var t = c.om.job === 'shopowner' ? c.name + 'は小さな' + c.om.shop + 'を一人で切り盛りしている。'
        : c.om.job === 'hotelier' ? c.name + 'は「' + c.om.hotel + '」のオーナーだ。'
        : c.om.job === 'staff' ? (om.boss[c.i] != null ? c.name + 'は' + ctx.chars[om.boss[c.i]].name + 'に雇われて、' + (c.om.workKind === 'hotel' ? '「' + c.om.work + '」' : c.om.work) + 'で働いている。' : c.name + 'は' + (c.om.workKind === 'hotel' ? '「' + c.om.work + '」' : c.om.work) + 'の従業員だ。') : '';
      if (t) ctx.say({ kind: 'event', cat: 'solo', actors: om.boss[c.i] != null ? [c, ctx.chars[om.boss[c.i]]] : [c], text: t, why: '職業：' + OM.jobName(c) });
    });
  };
  function wfill(ctx, t, a, b) {
    var boss = a.om.job === 'staff' && ctx.om.boss[a.i] != null ? ctx.chars[ctx.om.boss[a.i]] : null;
    return OM.fill(ctx, t.replace(/\{shop\}/g, a.om.shop || '店').replace(/\{hotel\}/g, a.om.hotel ? '「' + a.om.hotel + '」' : 'ホテル')
      .replace(/\{work\}/g, a.om.workKind === 'hotel' ? '「' + (a.om.work || 'ホテル') + '」' : (a.om.work || '店')).replace(/\{boss\}/g, boss ? boss.name : '店長')
      .replace(/\{seat\}/g, a.om.workKind === 'hotel' ? '部屋' : '席').replace(/\{title\}/g, a.om.job === 'hotelier' ? 'オーナー' : '店長'), a, b);
  }
  OM.wfill = wfill;

  /* ---------- 職業ごとの出来事 ---------- */
  OM.JOB_EVENTS_ID = {
    shopowner: [
      J('s', 'solo', '', '{a}は朝いちばんに{shop}のシャッターを上げ、店先を掃いた。通りの向かいのパン屋と、今日も同じ時刻に目が合った。|{a}は閉店後の{shop}で、合わない帳簿を前に電卓を叩き続けた。|{a}は{shop}の常連だった老人が、今月一度も来ていないことに気づいて、近所に様子を聞いて回った。', { s: 5 }, '{shop}の店主'),
      J('s', 'solo', '', '{a}の{shop}が、地元の情報誌に小さく載った。{a}は切り抜きをレジの横に貼った。|{a}は{shop}の看板を、自分の手で塗り直した。少しはみ出した。', { s: -6 }, '{shop}の店主'),
      J('s', 'solo', 'o', '客に「旦那さんのお店？」と訊かれ、{a}は「私の店です」と答えた。今月三回目だった。|{a}は発情期の間、{shop}に「臨時休業」の貼り紙を出した。そのたびに、常連が一人ずつ減っていく。|{a}の{shop}に「Ωの店主じゃ不安だ」と取引先が言ってきた。{a}は値段を下げずに、品物で黙らせた。', { s: 9 }, 'Ωの店主（α優位の社会）'),
      J('s', 'solo', 'a', '{a}の{shop}には、αの店主目当ての客が増えた。{a}は売上帳を見て、喜んでいいのか分からなかった。|{a}は商店街の会合で「αなんだから会長を」と推され、断る理由を三つ用意して行った。', { s: 4 }, 'αの店主'),
      J('p', 'bond', '', '{b}は{a}の{shop}の常連になった。{a}は{b}の好みを、何も言われなくても出せるようになった。|{a}は{b}に、{shop}の奥の在庫部屋を見せた。売り物にしていない、{a}の宝物の棚があった。', { ab: { aff: 5 }, ba: { aff: 6, trust: 4 } }, '{shop}の常連'),
      J('p', 'romance', '', '閉店後の{shop}で、{a}は{b}のためだけに明かりを一つ残した。|{a}は{b}が来る曜日だけ、店先の飾りを替えていた。本人はそれに気づいていない。|{a}は{b}の分だけ、会計を少しまけた。{b}が気づいて笑うと、{a}は「端数だよ」と目を逸らした。', { ab: { att: 5 }, ba: { att: 6, aff: 4 } }, '{shop}の店主の特別扱い'),
      J('p', 'help', '', '{a}は雨に降られた{b}を{shop}に入れ、タオルと温かい飲み物を出した。「お代はいいよ。雨宿り代も」|{a}は{b}の探していたものを、問屋に電話をかけまくって取り寄せた。', { ba: { aff: 7, trust: 6 } }, '{shop}の店主の面倒見'),
      J('p', 'help', 'a', '{a}は{shop}で{b}に絡んでいた客の前に立ち、αの声で「出ていけ」と言った。客は代金も払わずに逃げた。{a}は「いいよ、厄払い代だ」と笑った。', { ba: { trust: 8, att: 4 } }, 'αの店主の威圧（守るために使う）'),
      J('p', 'conflict', '', '{a}は{b}に「ツケはもうきかない」と言った。{b}は財布の中を見て黙った。|{a}は{b}が{shop}の品物をぞんざいに扱うのを見て、営業用ではない声で注意した。', { ba: { ten: 7 }, ab: { ten: 3 } }, '{shop}の店主のこだわり'),
      J('p', 'romance', 'o', '{a}が発情期で{shop}を閉めていた間、店の前に{b}の置いた差し入れの紙袋が三つ並んでいた。|{a}は{b}に、{shop}の合鍵を渡した。「店番、頼んでもいい？」それが告白みたいなものだった。', { ab: { aff: 6, att: 4 }, ba: { aff: 5, att: 6 } }, 'Ωの店主')
    ],
    hotelier: [
      J('s', 'solo', '', '{a}は{hotel}の最上階から夜の街を見下ろし、今日の稼働率の数字を確かめた。|{a}はスイートの清掃が甘いことに気づき、上着を脱いで自分でシーツを張り直した。|{a}の{hotel}で、宿泊客同士の痴話喧嘩が起きた。{a}は深夜三時にパジャマの上からスーツを着て、仲裁に下りた。', { s: 6 }, '{hotel}のオーナー'),
      J('s', 'solo', '', '{a}は{hotel}の客室で発情期を迎えた客のために、抑制剤とβのスタッフを手配した。「当ホテルでは、珍しいことではありません」|{a}は{hotel}に「Ω専用フロア」を作るかどうか、会議で一時間議論した。結論は出なかった。', { s: 4 }, '第二性のある世界のホテル経営'),
      J('s', 'solo', 'o', '{a}は投資家との会食で「Ωのオーナーではブランドが」と言われた。{a}は笑顔のまま、その投資家との取引を打ち切った。|{a}が{hotel}のオーナーだと名乗ると、相手は必ず{a}の後ろにいるはずのαを探した。', { s: 10 }, 'Ωのオーナー（α優位の社会）'),
      J('s', 'solo', 'a', '{a}は「αのオーナーなら安心」という口コミで、{hotel}の予約が埋まっていくのを複雑な気持ちで眺めた。|{a}は{hotel}の従業員たちが、自分の前でだけ声を潜めることに気づいていた。', { s: 4 }, 'αのオーナー'),
      J('s', 'solo', '', '{a}の{hotel}が、旅行雑誌の「泊まりたいホテル」に選ばれた。{a}はスタッフ全員に寿司を取った。|{a}は改装中のロビーに立ち、新しいシャンデリアの光り方を十分間眺めていた。', { s: -7 }, '{hotel}のオーナー'),
      J('p', 'romance', '', '{a}は{b}に、{hotel}の空いているスイートの鍵を渡した。「今夜だけ。宿泊料はいらない」|{a}は{hotel}のバーラウンジで、{b}のグラスが空になる前に次の一杯を頼んだ。|{a}は{b}を{hotel}の屋上庭園に案内した。客は入れない場所だった。「ここ、私しか来ないんだ」', { ab: { att: 6 }, ba: { att: 7, aff: 4 } }, '{hotel}のオーナーの特権'),
      J('p', 'help', '', '{a}は終電を逃した{b}に、{hotel}の一室を用意した。「部屋は別。鍵は内側から」|{a}は{b}の家族の祝いの席を、{hotel}の宴会場で格安で引き受けた。', { ba: { trust: 7, aff: 5 } }, '{hotel}のオーナーの気前'),
      J('p', 'help', '', '{a}は{hotel}で{b}に絡んだ客を、その日のうちに出入り禁止にした。「当ホテルのお客様ではありません」|{a}は{b}の匂いに過敏なαの客がいると聞き、{b}の泊まる階ごと貸し切りにした。', { ba: { trust: 9, att: 4 } }, '{hotel}のオーナー'),
      J('p', 'conflict', '', '{a}は{b}を{hotel}のロビーで見かけ、誰と一緒に来たのかをフロントにそれとなく確かめた。|{a}は{b}に「ホテルの人間に、私生活を詮索されたくない」と言われた。{a}は何も言い返せなかった。', { ab: { ten: 6, att: 3 }, ba: { ten: 5 } }, 'オーナーの目は館内のすべてに届く'),
      J('p', 'bond', '', '{a}は{b}に、開業前の{hotel}の写真を見せた。何もない更地の写真だった。「ここまで来るのに、十年かかった」|{a}は{b}をスタッフ用の厨房に連れていき、料理長の試作品を二人でつまんだ。', { ab: { aff: 5, trust: 4 }, ba: { aff: 5, trust: 5 } }, '{hotel}のオーナー')
    ],
    staff: [
      J('s', 'solo', '', '{a}は{work}で十時間立ちっぱなしで働き、帰りの電車で吊り革を握ったまま眠った。|{a}は{work}の客に理不尽なクレームを言われ、裏口で深呼吸を三回してから戻った。|{a}は給料日に、少しだけいいお菓子を買って帰った。', { s: 5 }, '{work}の従業員'),
      J('s', 'solo', 'o', '{a}は{work}の制服の襟を、うなじが隠れる高さまで上げて留めた。|{a}は発情期の休みを申請した翌週、シフト表から名前が消えているのを見つけた。|{a}は「Ωの子がいると、αのお客さんが喜ぶ」と言われ、それが褒め言葉ではないことを知っていた。', { s: 9 }, 'Ωの従業員（α優位の社会）'),
      J('s', 'solo', 'a', '{a}はαだからという理由で、{work}の新人の教育係と、酔った客の対応を全部押しつけられた。|{a}は「αなのに、雇われなんだ」と客に言われ、愛想笑いで流した。', { s: 5 }, 'αの従業員'),
      J('s', 'solo', 'b', '{a}は{work}で、αとΩの客の間に入るのはいつもβの自分だと気づいていた。匂いが効かないから、と。|{a}は{work}の同僚のΩの発情期に、黙ってシフトを代わった。', { s: 3 }, 'βの従業員'),
      J('p', 'bond', '', '{a}は{b}に、{work}のまかないの余りをこっそり持たせた。|{a}は{b}に、{work}の裏話を声をひそめて話した。{b}は笑いをこらえるのに必死だった。', { ab: { aff: 5 }, ba: { aff: 5, trust: 3 } }, '{work}の従業員'),
      J('p', 'romance', '', '{a}は{work}に客として来た{b}の注文を、聞く前から覚えていた。|{a}は{b}が{work}に来た日だけ、制服の名札をまっすぐに直した。', { ab: { att: 5 }, ba: { att: 5, aff: 3 } }, '{work}で働く姿'),
      J('p', 'help', '', '{a}は{b}が{work}に来たとき、混んでいるのに、いちばんいい{seat}を空けておいた。|{a}は{b}の忘れ物を、仕事上がりに家まで届けに行った。', { ba: { trust: 6, aff: 5 } }, '{work}の従業員の気配り'),
      J('p', 'conflict', '', '{a}は{b}の前で、{work}の愚痴を一時間言い続けた。{b}は途中で相槌をやめた。|{a}は{b}に「雇われは気楽でいいね」と言われ、その夜は返事をしなかった。', { ab: { ten: 4 }, ba: { ten: 6 } }, '雇われの苦労')
    ]
  };

  /* 職業だけの出来事を選ぶ（scenario-omega.js の職業イベントから呼ばれる） */
  OM.jobSpecific = function (ctx, a, b, sc) {
    var list = (OM.JOB_EVENTS_ID[a.om.job] || []).filter(function (e) { return (!e.sx || e.sx === a.om.sex) && e.sc === sc && !(e.cat === 'romance' && !ctx.romanceOk(sc === 'p' ? [a, b] : [a])); });
    if (!list.length) return null;
    var e = ctx.pick(list), bb = sc === 'p' ? b : null;
    if (e.fx.ab && bb) ctx.mod(a, bb, e.fx.ab);
    if (e.fx.ba && bb) ctx.mod(bb, a, e.fx.ba);
    if (e.fx.s) ctx.stress(a, e.fx.s);
    if (/社会/.test(e.why)) ctx.stress(a, ctx.env.society / 20);
    return { cat: e.cat, text: wfill(ctx, OM.btext ? OM.btext(ctx, e.texts, bb) : ctx.pick(e.texts), a, bb), why: wfill(ctx, e.why, a, bb) };
  };

  /* ---------- 雇い主と従業員（どちらも住人のとき） ---------- */
  var BOSS = {
    kind: L('閉店後、{a}は{b}に「今日もありがとう」と缶コーヒーを渡した。{b}は両手で受け取った。|{a}は{b}の誕生日を覚えていて、シフト表の端に小さく花丸をつけた。|{a}は{b}のミスを、客の前ではかばい、裏で一緒に頭を下げに行った。'),
    harsh: L('{a}は{b}のミスを、客の前で叱りつけた。{b}は唇を噛んで頭を下げた。|{a}は{b}の出したシフト希望を、理由も聞かずに全部消した。|{a}は「代わりはいくらでもいる」と{b}に言った。言った本人が、一番後悔した顔をしていた。'),
    heatA: L('{b}の発情期の匂いに気づいた{a}は、何も言わずに{b}を裏口から帰らせた。「有給にしておく。来るな」|{a}は{b}の匂いに眉をひそめ、窓を全部開けてから、自分が外に出た。「……抑制剤、経費で落としていいから」'),
    heatB: L('{a}は{b}の発情期のあいだ、自分がシフトに入って穴を埋めた。「βの私が出れば済む話」|{a}は{b}に、休憩室の鍵と抑制剤を黙って渡した。'),
    shop: L('閉店後の{shop}で、{a}と{b}は二人きりになった。{a}がシャッターを下ろす音が、やけに大きく響いた。|{a}は{b}に{shop}の鍵を預けて、「今日は先に上がっていいよ」と言った。{b}は帰らずに、{a}の仕事が終わるまで待っていた。'),
    hotel: L('深夜のフロントで、{a}は{b}に「少し休め」と言って、空いているスイートの鍵を渡した。{b}が部屋に入ると、{a}も後から来た。|{a}は{b}を、誰も使っていない最上階の客室に呼んだ。「ここなら誰にも聞かれない」――仕事の話のはずだった。'),
    up: L('{b}は{a}の机に、こっそり胃薬を置いておいた。|{b}は{a}がいない間に、{a}の散らかった事務室を片づけた。戻った{a}は、何がどこにあるか分からなくなって困っていた。|{b}は「{title}こそ、ちゃんと寝てください」と{a}に言った。{a}は笑ってごまかした。'),
    rumor: L('従業員の間で、{a}と{b}の仲が噂になった。{a}は聞こえないふりをし、{b}は耳まで赤くなった。|常連客に「二人、付き合ってるの？」と訊かれ、{a}と{b}は同時に「違います」と答えた。'),
    secret: L('{a}と{b}は、職場では他人のふりをしている。業務連絡の最後にだけ、{b}は小さく「今夜」と付け足した。|閉店後、{a}は{b}の制服のボタンを一つずつ外しながら、「明日も遅刻するなよ」と言った。'),
    quit: L('「辞めさせてください」――{b}の差し出した退職願を、{a}は受け取らずに机の引き出しにしまった。「話は、明日聞く」|{b}は{a}と口論になり、エプロンを外して出ていった。翌朝、{b}はいつもの時間に出勤してきた。')
  };
  OM.EXTRA_EV = OM.EXTRA_EV || [];
  OM.EXTRA_EV.push({
    id: 'om_workplace', cat: 'bond', scope: 'pair',
    when: function (ctx, a, b) { var bs = ctx.om.boss || {}; return bs[b.i] === a.i || bs[a.i] === b.i; },
    w: function (ctx, a) { return 0.8 + (a.action.id === 'work' ? 0.4 : 0); },
    run: function (ctx, a, b) {
      var bs = ctx.om.boss, B = bs[b.i] === a.i ? a : b, S = B === a ? b : a, rBS = ctx.R(B, S), rSB = ctx.R(S, B), rng = ctx.rng;
      var pf = ctx.pair(B, S), k, cat = 'bond', why = '雇い主（' + B.name + '）と従業員（' + S.name + '）';
      if (S.om.sex === 'o' && S.om.heat > 0) {
        k = B.om.sex === 'a' ? 'heatA' : 'heatB'; cat = 'help';
        ctx.mod2(B, S, { trust: 4 }, { trust: 10, aff: 6 });
        why += '：発情期への対応';
      } else if (pf.couple && rng() < 0.6) {
        k = 'secret'; cat = 'romance'; ctx.mod2(B, S, { att: 5, aff: 3 }, { att: 5, aff: 3 }); why += '：職場では秘密の恋人';
      } else if (rSB.ten > 45 && rng() < 0.5) {
        k = 'quit'; cat = 'conflict'; ctx.mod2(B, S, { ten: 5 }, { ten: 3, trust: 3 }); why += '：積もった不満（緊張 ' + Math.round(rSB.ten) + '）';
      } else if (rBS.att > 38 && rSB.att > 30 && rng() < 0.5) {
        k = B.om.job === 'hotelier' ? 'hotel' : 'shop'; cat = 'romance'; ctx.mod2(B, S, { att: 7 }, { att: 7 }); why += '：仕事終わりの二人きり';
      } else if ((rBS.att > 30 || rSB.att > 30) && rng() < 0.35) {
        k = 'rumor'; cat = 'romance'; ctx.mod2(B, S, { att: 3, ten: 2 }, { att: 3, ten: 2 }); why += 'の噂';
      } else if (B.tr.cp > 0.62 && B.tr.np < 0.5 && rng() < 0.55) {
        k = 'harsh'; cat = 'conflict'; ctx.mod2(B, S, { ten: 2 }, { ten: 9, aff: -4 }); ctx.stress(S, 8); why += '：' + B.name + 'の厳しさ（CP高・NP低）';
      } else if (rng() < 0.5) {
        k = 'kind'; cat = 'help'; ctx.mod2(B, S, { aff: 3 }, { aff: 6, trust: 6 }); why += '：' + B.name + 'の面倒見';
      } else {
        k = 'up'; cat = 'help'; ctx.mod2(S, B, { aff: 3 }, { aff: 5, trust: 4 }); why += '：' + S.name + 'の気遣い';
      }
      return { cat: cat, text: wfill(ctx, ctx.pick(BOSS[k]).replace(/\{shop\}/g, B.om.shop || '店'), B, S), why: why, mag: k === 'hotel' || k === 'shop' || k === 'quit' ? 15 : 6 };
    }
  });
})();
