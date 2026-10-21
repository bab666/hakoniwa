/* 箱庭シミュレーター: 邪神村RTA ― 術者の魔術と、目標ごとの動き（魔術師という職業はなくなり、目標で術者になる）
   ・術者は、ふだんから魔術を使う（星読み・結界・使い魔・呪詛・霧払い・退魔）。使うたびに体と心が削れる
   ・目標で動きが変わる：「神をこの目で見る」なら神に呼びかけて刻限を早め、洞窟では封印の儀をすり替えようとする
     「村の秘密を暴く」なら星読み、「仲間を守る」なら結界と退魔、「生きて村を出る」なら霧払い
   ・「儀式で別の神を呼ぶ」術者は、夜ごとに支度をして仲間を殺し、別の神を呼ぶ（jashin.js / jashin-cave.js）。刻限を過ぎても、その場で別の神を呼ぶ */
(function () {
  'use strict';
  var HK = window.HK, ST = HK.Story, JS = HK.JASHIN, clamp = HK.clamp, M = JS && JS.MORE;
  if (!ST || !JS || !M) return;
  function L(s) { return s.split('|'); }
  var X = {
    SCRY: L('{a}は蝋燭を灯し、水を張った鉢の上で古い言葉を唱えた。水面に、知らない景色が映った。|{a}は夜空を見上げ、星の配置を手帳に書き写した。星は、この村の上でだけ、わずかに歪んでいた。|{a}は自分の指先を切り、血を一滴、古い札に垂らした。札の文字が、ひとりでに並び替わった。'),
    SCRY_OK: L('――そこに、答えの一端があった。|――{a}は、震える手でそれを書き留めた。'),
    SCRY_NG: L('――鉢の水が、黒く濁った。水底から、何かがこちらを覗き返した。{a}は鉢をひっくり返し、しばらく荒い息をついていた。|――見えたのは、見てはならないものだった。{a}の鼻から、血が一筋流れた。'),
    WARD: L('{a}は民宿のまわりに塩と灰で線を引き、四隅に奇妙な印を刻んだ。「今夜は、ここから出るな」|{a}は窓という窓に、血で書いた護符を貼った。「気休めじゃない。本物の結界だ」'),
    WARD_HOLD: L('夜半、村人たちが民宿を取り囲んだ。けれど、{a}の引いた線の手前で、誰ひとり足を踏み出せなかった。|{b}の部屋の障子に、村人の影が映った。影は護符の前で立ち止まり、悔しげに引き返していった。'),
    FAMILIAR: L('{a}は口の中で短く唱え、影から黒い鳥を一羽呼び出した。鳥は音もなく、村の奥へ飛んでいった。|{a}の足元の影が、猫の形をとって這い出した。「見てこい」――影の猫は、闇に溶けた。'),
    FAMILIAR_OK: L('――戻ってきた使い魔が、{a}の耳元で囁いた。|――使い魔の目を通して、{a}は見た。'),
    FAMILIAR_NG: L('――使い魔は戻らなかった。夜明け前、民宿の前に、黒い羽根だけが散らばっていた。'),
    HEX: L('{a}は村人の家の戸口に、髪と釘で作った呪具を埋めた。その夜、村のあちこちで、誰かが血を吐いて倒れた。|{a}は村長の名を紙に書き、それを囲炉裏で焼いた。翌朝、村長は床から起き上がれなかった。'),
    HEX_BACK: L('――呪いは、{a}自身にも返ってきた。{a}は激しく咳き込み、掌に血を吐いた。'),
    FOG: L('{a}は山道に向かって両手を広げ、風を呼ぶ言葉を唱えた。村を閉ざしていた霧が、わずかに薄れた。|{a}は村境の道祖神に、自分の血で印を描いた。霧の向こうに、一瞬だけ国道の明かりが見えた。'),
    FOG_SOLO: L('――霧が晴れたのは、ほんの数分だった。{a}は振り返らなかった。「悪いな。私は、生き残る方を選ぶ」{a}は一人で、山道を駆け下りていった。'),
    CALL: L('{a}は夜の神社に忍び込み、本殿に向かって呼びかけの言葉を唱えた。「どうか、御姿を」――地の底で、何かが寝返りを打った。|{a}は村人たちに混じって祭りの稽古を手伝い、祝詞を一言一句書き写した。そして夜、それを一人で、逆から唱えた。|{a}は祠の前に座り込み、夜明けまで動かなかった。「もう少しで、会える」――その目は、恋をしている人のようだった。'),
    CALL_VISION: L('――{a}の閉じた瞼の裏に、{g}の輪郭が浮かんだ。'),
    CALL_STOP: L('{b}が{a}の腕を掴んだ。「何やってるんだ！　それ、呼び出す方の言葉だろ！」|{b}は{a}の手帳を取り上げた。「封じるんじゃなかったのか。……呼ぶ気なのか」'),
    PREP: L('{a}は皆が寝静まったあと、仲間の枕元から髪の毛を一本ずつ集めていた。|{a}は民宿の裏で、生贄を捧げるための円を、土の上に何度も描き直していた。「あと、{n}人」|{a}は、食事のあいだ、仲間の一人ひとりを品定めするように眺めていた。|{a}は誰にも見られないように小刀を研いだ。刃に、星の光が映った。'),
    BANISH: L('――「下がれ」{a}が鋭く言い放ち、何かを宙に描いた。村人たちは見えない壁に弾かれたように後ずさり、闇の中へ逃げていった。|――{a}が投げた灰が、村人たちの目を焼いた。村人たちは悲鳴を上げて散っていった。'),
    WITNESS: L('{a}は、顕現した神を恍惚とした顔で見上げた。「ああ……これが……」{a}はふらふらと歩み出し、両腕を広げたまま、神の中へ呑まれていった。|{a}だけが、逃げなかった。「見えた。やっと、見えた」――{a}は涙を流しながら笑い、神の足元にひれ伏した。それきり、{a}の姿は見えなくなった。'),
    SABOTAGE: L('――そのとき、{a}が封印の祝詞に、別の言葉を重ねた。それは封じる言葉ではなく、呼び覚ます言葉だった。|――{a}は祭壇の印を、こっそり一本だけ書き換えていた。'),
    SABOTAGE_STOP: L('――「やめろ！」{b}が{a}を突き飛ばした。{a}が書き換えた印に気づいたのは、{b}だけだった。'),
    CLASH: L('二柱の神の争いで、洞窟の天井が崩れ、岩盤が軋んだ。人の耳には聞こえない咆哮が、一行の頭の内側で響き続けた。|神と神がもつれ合うたびに、洞窟の闇が裂け、見たこともない星空が覗いた。一行は耳を塞ぎ、ただ地に伏していた。'),
    RITUAL_SUMMON: L('生贄の儀の祭壇の前で、{a}が村人たちの前に進み出た。「お前たちの神には、もう一柱、客がいる」――{a}が叩きつけた血の石から、もう一柱の神が這い出した。|祭り囃子が最高潮に達したとき、{a}が祭壇に生贄の血を撒いた。村人たちの祝詞が、悲鳴に変わった。')
  };

  /* 術を使える人（職業ではなく目標で決まる：儀式で別の神を呼ぶ／儀式を乗っ取る／神を見たい霊能者・神職・オカルト研究家） */
  function mage(p) { return !!p.magic; }
  function gainClue(S, p, type) {
    var left = S.G.clues.map(function (c, i) { return i; }).filter(function (i) { return S.found.indexOf(i) < 0; });
    if (!left.length) return '';
    var pref = left.filter(function (i) { return !type || S.G.clues[i].type === type; });
    var k = (pref.length ? pref : left)[0];
    S.found.push(k); p.cnt.clue++;
    return S.G.clues[k].t;
  }
  function cost(p, n) { p.m.hp = clamp(p.m.hp - n, 0, 100); p.m.fear = clamp(p.m.fear + n, 0, 100); p.cnt.magic = (p.cnt.magic || 0) + 1; }
  function say(S, p, tag, text, why, mag, others) { return ST.say(S, { actors: [p].concat(others || []), tag: tag, text: text, why: why, mag: mag || 18 }); }

  /* ---------- 術者の一時間（使ったら true） ---------- */
  function act(S, p, h, live) {
    if (!mage(p) || p.bound) return false;
    var rng = S.rng, g = p.goal.id, night = JS.night(h), left = S.G.clues.length - S.found.length;
    if (rng() > (g === 'meet' ? 0.62 : 0.45)) return false;
    var plotPrep = p.plot && p.plot.kills < p.plot.need && !p.plot.ready;
    var opts = [
      ['scry', left ? 1 + (g === 'truth' ? 1.8 : 0) + (g === 'meet' ? 0.5 : 0) + p.tr.a : 0],
      ['ward', night && !(S.ward > h) && live.length > 1 ? 0.5 + (g === 'protect' ? 2.2 : 0) + p.tr.warmth : 0],
      ['familiar', left ? 0.7 + (g === 'content' ? 1.2 : 0) + p.tr.cold * 0.5 : 0],
      ['hex', S.hostile > 30 ? 0.3 + p.tr.aggr * 1.4 + p.tr.cold * 0.6 : 0],
      ['fog', 0.2 + (g === 'escape' ? 2.4 : 0) + (p.m.fear > 60 ? 0.8 : 0)],
      ['call', g === 'meet' ? 2.6 : 0],
      ['prep', plotPrep && night ? 2 : 0]
    ];
    var sp = HK.weighted(rng, opts, function (o) { return o[1]; })[0], t, o;
    var gs = { meet: '神をこの目で見たい', truth: '村の秘密を暴きたい', protect: '仲間を守りたい', escape: '生きて村を出たい', content: '撮れ高がほしい' }[g];
    var whyG = gs ? '（目標「' + p.goal.label + '」）' : '';
    if (sp === 'scry') {
      cost(p, 4); t = ST.fmt(ST.pick(S, X.SCRY), { a: p.name });
      if (rng() < 0.3 + JS.skill(p, 'lore') * 0.3 + JS.skill(p, 'rite') * 0.25) { var c1 = gainClue(S, p, 'lore'); o = say(S, p, '魔術', t + ST.fmt(ST.pick(S, X.SCRY_OK), { a: p.name }) + c1 + '。', '星読み。手がかり ' + S.found.length + '/' + S.G.clues.length + whyG, 22); return true; }
      p.m.fear = clamp(p.m.fear + 8, 0, 100); ST.sayB(S, { actors: [p], tag: '魔術', text: t + ST.fmt(ST.pick(S, X.SCRY_NG), { a: p.name }), why: '星読みに失敗した（恐怖 +8）' }, p.name + 'の星読みは失敗'); return true;
    }
    if (sp === 'ward') { cost(p, 3); S.ward = h + 8; S.wardBy = p; say(S, p, '魔術', ST.fmt(ST.pick(S, X.WARD), { a: p.name }), p.name + 'が結界を張った（8時間、夜の襲撃をはね返しやすい）' + whyG, 18); return true; }
    if (sp === 'familiar') {
      cost(p, 3); t = ST.fmt(ST.pick(S, X.FAMILIAR), { a: p.name });
      if (rng() < 0.35 + JS.skill(p, 'rite') * 0.3) { var c2 = gainClue(S, p, 'explore'); say(S, p, '魔術', t + ST.fmt(ST.pick(S, X.FAMILIAR_OK), { a: p.name }) + c2 + '。', '使い魔に村を探らせた' + whyG, 20); return true; }
      ST.sayB(S, { actors: [p], tag: '魔術', text: t + ST.pick(S, X.FAMILIAR_NG), why: '使い魔が戻らなかった' }, p.name + 'の使い魔は戻らなかった'); return true;
    }
    if (sp === 'hex') {
      cost(p, 5); S.hostile = clamp(S.hostile - 12, 0, 100); t = ST.fmt(ST.pick(S, X.HEX), { a: p.name });
      if (rng() < 0.3) { p.m.hp = clamp(p.m.hp - 15, 0, 100); t += ST.fmt(ST.pick(S, X.HEX_BACK), { a: p.name }); }
      say(S, p, '魔術', t, p.name + 'が村人を呪った（村人の敵意 -12。攻撃性・冷たさが高い術者ほど使う）', 22); return true;
    }
    if (sp === 'fog') {
      cost(p, 6); t = ST.fmt(ST.pick(S, X.FOG), { a: p.name });
      if (g === 'escape' && p.tr.cold + p.tr.aggr * 0.5 > 0.6 && rng() < 0.35) {
        p.out = true; p.esc = h - 1 + rng() * 2; p.fate = '魔術で霧を払い、一人で脱出（' + JS.hm(p.esc) + '）';
        o = say(S, p, '魔術', t + ST.fmt(ST.pick(S, X.FOG_SOLO), { a: p.name }), '霧を払い、仲間を置いて一人で逃げた（冷たい・目標「生きて村を出る」）', 40);
        ST.key(S, o, p.name + 'が魔術で単独脱出'); return true;
      }
      S.fog = (S.fog || 0) + 1; say(S, p, '魔術', t, p.name + 'が霧を払った（逃げ道が見つかりやすくなる）' + whyG, 18); return true;
    }
    if (sp === 'call') {
      cost(p, 4); S.called = (S.called || 0) + 1; S.deadline = Math.max(h + 4, S.deadline - 3); p.m.fear = clamp(p.m.fear - 12, 0, 100);
      t = ST.fmt(ST.pick(S, X.CALL), { a: p.name });
      var vis = rng() < 0.45 ? gainClue(S, p, 'spirit') : '';
      if (vis) t += ST.fmt(ST.pick(S, X.CALL_VISION), { a: p.name, g: S.G.call }) + vis + '。';
      var others = live.filter(function (q) { return q !== p && JS.alive(q) && !q.bound; });
      var b = others.slice().sort(function (x, y) { return JS.skill(y, 'obs') - JS.skill(x, 'obs'); })[0];
      if (b && rng() < JS.skill(b, 'obs') * 0.4 + (b.job === 'sleuth' || b.job === 'occult' || b.job === 'priest' || b.job === 'folk' ? 0.25 : 0)) {
        t += ST.fmt(ST.pick(S, X.CALL_STOP), { a: p.name, b: b.name });
        var angry = b.tr.aggr + b.tr.cold * 0.5 - JS.REL.bond(S, b, p);
        if (angry > 0.5 && others.length >= 1) { p.bound = true; p.boundUntil = h + 6; p.boundAt = '土蔵'; t += '一行は' + p.name + 'を土蔵に閉じ込めた。'; }
      }
      o = say(S, p, '神を求めて', t, p.name + 'は神をこの目で見るために、神に呼びかけている（刻限が3時間早まった' + (vis ? '・手がかり +1' : '') + (p.bound ? '・見咎められて閉じ込められた' : '') + '）', 26, b && p.bound ? [b] : []);
      if (S.called === 1) ST.key(S, o, p.name + 'が神を呼び始めた');
      return true;
    }
    if (sp === 'prep') {
      p.plot.ready = 1; p.m.fear = clamp(p.m.fear - 4, 0, 100);
      ST.sayB(S, { actors: [p], tag: '支度', text: ST.fmt(ST.pick(S, X.PREP), { a: p.name, n: p.plot.need - p.plot.kills }), why: p.name + 'は別の神を呼ぶ支度をしている（次の夜、仲間を狙いやすい）' }, p.name + 'は何かの支度をしていた');
      return true;
    }
    return false;
  }

  /* ---------- 襲撃を魔術ではね返す（はね返したら true） ---------- */
  function defend(S, p, live, t) {
    var rng = S.rng, h = S.h;
    if (S.ward > h && JS.night(h) && S.wardBy && JS.alive(S.wardBy) && rng() < 0.65) {
      ST.say(S, { actors: [S.wardBy, p], tag: '結界', text: t + '――' + ST.fmt(ST.pick(S, X.WARD_HOLD), { a: S.wardBy.name, b: p.name }), why: S.wardBy.name + '（術者）の結界が、村人をはね返した', mag: 22 });
      return true;
    }
    var mg = mage(p) && !p.bound ? p : live.filter(function (q) { return q !== p && mage(q) && JS.alive(q) && !q.bound && (p.action.id !== 'alone' || JS.REL.bond(S, q, p) >= 0.6) && rng() < 0.4 + Math.max(0, JS.REL.bond(S, q, p)) * 0.4; })[0];
    if (!mg || (mg.plot && mg !== p && rng() < 0.6)) return false;
    if (rng() > 0.35 + JS.skill(mg, 'rite') * 0.35) return false;
    cost(mg, 4);
    ST.say(S, { actors: mg === p ? [p] : [mg, p], tag: '退魔', text: t + ST.fmt(ST.pick(S, X.BANISH), { a: mg.name }), why: mg.name + '（術者）が魔術で村人を退けた（儀式の力）', mag: 24 });
    return true;
  }

  /* ---------- 洞窟で封印の儀をすり替える（神を見たい魔術師）：成功率の増減を返す ---------- */
  function sabotage(S, live, rite) {
    var rng = S.rng;
    var m = live.filter(function (p) { return mage(p) && !p.bound && p.goal.id === 'meet'; })[0];
    if (!m || rng() > 0.35 + m.tr.cold * 0.3 + (m.plot ? 0.2 : 0) - m.tr.warmth * 0.2) return 0;
    var t = ST.fmt(ST.pick(S, X.SABOTAGE), { a: m.name });
    var others = live.filter(function (q) { return q !== m; });
    var b = others.slice().sort(function (x, y) { return JS.skill(y, 'obs') - JS.skill(x, 'obs'); })[0];
    if (b && rng() < JS.skill(b, 'obs') * 0.5 + (b.job === 'sleuth' ? 0.3 : 0) + (b.job === 'occult' || b.job === 'priest' || b.job === 'folk' || b.job === 'mage' ? 0.2 : 0)) {
      m.bound = true; m.boundAt = '洞窟の奥';
      ST.say(S, { actors: [m, b], tag: 'すり替え', kind: 'climax', text: '封印の儀の最中だった。' + t.replace(/^――/, '') + ST.fmt(ST.pick(S, X.SABOTAGE_STOP), { a: m.name, b: b.name }) + '一行は' + m.name + 'を岩に縛りつけた。', why: m.name + 'は神を見るために封印の儀をすり替えようとしたが、' + b.name + 'に見抜かれた', mag: 40 });
      return 0;
    }
    S.mageCalled = m;
    ST.say(S, { actors: [m], tag: 'すり替え', kind: 'climax', text: '封印の儀の最中だった。' + t.replace(/^――/, ''), why: m.name + 'は神をこの目で見るために、封印の儀をすり替えた（成功率 -30％）', mag: 40 });
    return -0.3;
  }
  /* 顕現した神を見る（神を見たい魔術師） */
  function witness(S, h) {
    var rng = S.rng;
    var m = S.mageCalled && S.mageCalled.alive && !S.mageCalled.out ? S.mageCalled : S.P.filter(function (p) { return mage(p) && p.alive && !p.out && p.goal.id === 'meet' && rng() < 0.5; })[0];
    if (!m) return;
    m.alive = false; m.bound = false; m.taken = false; m.fate = '神をその目で見た（' + JS.hm(h) + '）';
    var o = ST.say(S, { actors: [m], tag: '神を見た', kind: 'climax', text: ST.fmt(ST.pick(S, X.WITNESS), { a: m.name }), why: m.name + 'の目標「' + m.goal.label + '」は、叶った', mag: 46 });
    ST.key(S, o, m.name + 'が神を見た');
  }

  /* ---------- 刻限の生贄の儀で、別の神を呼ぶ（呼んだら true） ---------- */
  function ritualSummon(S, h) {
    var rng = S.rng, C = JS.core;
    var m = S.P.filter(function (p) { return p.plot && p.alive && !p.out && !p.bound; })[0];
    if (!m) return false;
    if (m.plot.kills < m.plot.need) {
      var vs = S.P.filter(function (q) { return q !== m && JS.alive(q) && !q.bound; }).sort(function (a, b) { return JS.REL.bond(S, m, a) - JS.REL.bond(S, m, b) || a.stats.luck - b.stats.luck; });
      if (!vs.length) return false;
      C.die(S, vs[0], '儀式を企む' + m.name + 'に生贄にされて', [ST.fmt(ST.pick(S, M.MAGE_PUSH), { a: m.name, v: '{a}' })]);
      m.plot.kills++;
      if (JS.detectMage(S, m, true)) return false;
    }
    var cg = m.plot.god, wasTaken = m.taken; m.taken = false;
    var o = ST.say(S, { actors: [m], tag: '召喚', kind: 'climax', text: (wasTaken ? '生贄として祭壇に引き出された' + m.name + 'が、縄をほどいて笑った。' : '') + ST.fmt(ST.pick(S, X.RITUAL_SUMMON), { a: m.name }) + '――' + ST.fmt(cg.t, { g: S.G.call }) + ST.pick(S, X.CLASH), why: '刻限を過ぎても、' + m.name + 'は生贄 ' + m.plot.kills + '人で条件を整え、' + cg.n + 'を呼んだ（神が村を呑み込みにくくなり、逃げやすくなる）', mag: 48 });
    ST.key(S, o, m.name + 'が' + cg.n + 'を召喚');
    S.counter = true; S.fleeBonus = (S.fleeBonus || 0) + 0.15;
    if (rng() < 0.35) { m.alive = false; m.fate = '呼び出した神に連れ去られた（' + JS.hm(h) + '）'; ST.say(S, { actors: [m], tag: '代償', text: ST.fmt(ST.pick(S, M.MAGE_PRICE), { a: m.name }), why: '別の神を呼んだ代償（35％）', mag: 30 }); }
    return true;
  }

  JS.MAGE = { act: act, defend: defend, sabotage: sabotage, witness: witness, ritualSummon: ritualSummon, X: X };
})();
