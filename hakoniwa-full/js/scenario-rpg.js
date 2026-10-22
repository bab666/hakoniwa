/* 箱庭シミュレーター: ダンジョンRPG（ローグライク）
   パーティでダンジョンに潜り、階ごとにランダムな出来事（戦闘・宝箱・罠・商人・泉・休憩…）を乗り越える。
   ・職業はエゴグラムから（選んでもよい）。戦い方・宝箱を開けるか・撤退するかは、気質の数値で決まる
   ・何階まで踏破し、いくら稼いだか（持ち帰れたか）が結果になる
   ・階層の主は20体（仕掛けつき）。喧嘩・魔術師の人質・謎かけ・呪いの装備・賭場・女神像・隠し部屋・料理も起きる（rpg-data.js）
   全年齢・R18版の両方で使う */
(function () {
  'use strict';
  var HK = window.HK;
  function L(s) { return s.split('|'); }
  function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }

  var JOBS = {
    warrior: { label: '戦士', hp: 34, atk: 9, def: 6, fit: function (t) { return t.aggr * 0.6 + t.cp * 0.3 + (1 - t.caution) * 0.2; } },
    mage: { label: '魔法使い', hp: 20, atk: 12, def: 2, fit: function (t) { return t.a * 0.7 + t.cold * 0.2; } },
    priest: { label: '僧侶', hp: 24, atk: 4, def: 4, heal: true, fit: function (t) { return t.np * 0.7 + t.ac * 0.2; } },
    thief: { label: '盗賊', hp: 24, atk: 7, def: 3, thief: true, fit: function (t) { return t.fc * 0.4 + t.impulse * 0.4 + t.caution * 0.1; } },
    hunter: { label: '狩人', hp: 26, atk: 8, def: 4, fit: function (t) { return t.caution * 0.5 + t.a * 0.3; } },
    bard: { label: '吟遊詩人', hp: 22, atk: 5, def: 3, bard: true, fit: function (t) { return t.fc * 0.5 + t.np * 0.4; } }
  };
  var JOB_IDS = Object.keys(JOBS);
  /* 敵：[名前, 強さ, 金] を階層帯ごとに */
  var MON = [
    [['スライム', 4, 6], ['大コウモリ', 5, 8], ['ゴブリン', 6, 12], ['毒キノコの群れ', 5, 5], ['化けネズミ', 4, 4], ['ジャイアントアント', 6, 9]],
    [['オーク', 10, 20], ['スケルトン', 9, 15], ['人食い植物', 10, 14], ['ゴブリンの群れ', 11, 25], ['ジャイアントスパイダー', 12, 18], ['さまよう鎧', 12, 22]],
    [['トロル', 16, 40], ['ミノタウロス', 18, 50], ['レイス', 15, 35], ['キメラ', 19, 55], ['オーガ', 17, 45], ['石化トカゲ', 16, 38]],
    [['ドラゴンの幼体', 25, 90], ['デーモン', 27, 100], ['リッチ', 26, 110], ['ヒュドラ', 28, 95], ['黒騎士', 25, 85], ['影の魔術師', 24, 80]]
  ];
  var BOSS = [['ゴブリンキング', 16, 80], ['巨大スライム', 18, 70], ['ミノタウロスの王', 30, 160], ['骨の竜', 38, 220], ['魔女の亡霊', 34, 200], ['古代竜', 50, 400], ['魔王の影', 60, 500]];
  var SAY = {
    attack: {
      proud: L('「邪魔だ、どけ！」|「この程度か」|「次！」'), stern: L('「隙だらけだ」|「一撃で決める」|「下がっていろ」'), tsun: L('「べ、別にあんたのためじゃないから！」|「さっさと倒れなさいよ！」'),
      gentle: L('「ごめんね、通してもらうよ」|「えいっ」|「みんな、下がってて」'), devoted: L('「みんなには、触らせない……！」|「まだ、いける……！」'), cool: L('「弱点は右脚だ」|「計算通り」|「効率よくいこう」'),
      free: L('「よっしゃ、いっくぞー！」|「楽しくなってきた！」|「くらえっ！」'), shy: L('「ご、ごめんなさいっ……！」|「えい……っ」'), polite: L('「失礼いたします」|「お覚悟を」')
    },
    hurt: {
      proud: L('「ちっ……かすり傷だ」'), stern: L('「……問題ない」'), tsun: L('「い、痛くなんかないし！」'), gentle: L('「あいたた……大丈夫、大丈夫」'), devoted: L('「平気です……まだ戦えます」'),
      cool: L('「想定内の損傷だ」'), free: L('「いったぁ！　やったな！」'), shy: L('「う、うぅ……」'), polite: L('「お見苦しいところを……」')
    },
    loot: {
      proud: L('「当然の報酬だな」'), stern: L('「記録しておく」'), tsun: L('「ま、まあ悪くないんじゃない？」'), gentle: L('「わあ、きれいだね」'), devoted: L('「みんなの分、ちゃんと分けよう」'),
      cool: L('「相場の三倍はある」'), free: L('「お宝だー！」'), shy: L('「す、すごい……」'), polite: L('「ありがたく頂戴いたします」')
    }
  };
  function say(p, kind) { var T = SAY[kind] || {}; var l = T[p.persona] || T.gentle; return l ? p.name + l[Math.floor(p._r() * l.length)] : ''; }
  var CHEST = { gold: L('宝箱の中には、金貨がぎっしり詰まっていた。|宝箱には、宝石のついた短剣が入っていた。売ればいい値になりそうだ。|宝箱の底から、古い王国の金貨が出てきた。'), potion: L('宝箱には、回復薬が二本入っていた。'), trap: L('宝箱を開けた瞬間、毒針が飛び出した。|宝箱から、催眠ガスが噴き出した。'), mimic: L('宝箱が口を開けた。ミミックだった！') };
  var CAMP = L('{a}と{b}は焚き火を挟んで、地上に戻ったら何をするか話した。|{a}は{b}の装備のほつれを、黙って直してやった。|{a}は{b}に、子どもの頃に読んだ冒険譚の話をした。{b}は「今まさにそれだね」と笑った。|{a}と{b}は、どちらが多く倒したかで言い合いになった。結局、引き分けということにした。|{a}は眠れない{b}の隣で、見張りを代わった。');
  var GREED = L('{a}は財宝の山を前に、「全部持って帰る」と言い張った。{b}は「重くて走れなくなる」と止めた。|{a}は分け前を多めに取ろうとして、{b}に睨まれた。');
  var SHOP = L('迷宮の中に、なぜか商人がいた。「いらっしゃい、命より安いものしか置いてないよ」|フードをかぶった商人が、壁のくぼみで店を広げていた。');
  var FOUNTAIN = L('澄んだ泉が湧いていた。|淡く光る泉が、部屋の真ん中にあった。');
  var LOST = L('迷宮で迷っていた冒険者が、助けを求めてきた。|檻に閉じ込められた商人の娘が、助けてと叫んでいた。|傷ついた子竜が、うずくまって震えていた。');
  /* rpg-data.js の追加の文を足す */
  (function () {
    var X = HK.RPGData && HK.RPGData.X;
    if (!X) return;
    CHEST.gold = CHEST.gold.concat(X.chestGold); FOUNTAIN.push.apply(FOUNTAIN, X.fount); SHOP.push.apply(SHOP, X.shop);
    CAMP.push.apply(CAMP, X.camp); GREED.push.apply(GREED, X.greed); LOST.push.apply(LOST, X.lost);
    HK.RPGData.STATUE.pray = HK.RPGData.STATUE.pray.concat(X.statue); HK.RPGData.COOK = HK.RPGData.COOK.concat(X.cook);
  })();

  var scen = {
    id: 'rpg', name: 'ダンジョンRPG', kicker: 'パーティ・冒険',
    desc: 'パーティを組んでダンジョンへ。階ごとにランダムな戦闘・宝箱・罠・商人・泉が待つ。誰が前に出て、誰が宝箱に手を伸ばし、どこで引き返すのか。何階まで踏破し、いくら持ち帰れるか。',
    solo: true, minCast: 1, maxCast: 6, unit: '階',
    castHint: '1〜6人のパーティで潜ります。職業は「おまかせ」ならエゴグラムから決まります。前に出るか、宝箱を開けるか、引き返すかは気質の数値で決まります。',
    simulate: function (input) { return run(input); },
    derived: ['caution', 'aggr', 'impulse', 'lead'],
    env: [
      { id: 'floors', label: '目標の階層', min: 5, max: 50, def: 15, lo: '5階', hi: '50階', unit: '階', desc: '5階ごとに階層の主（ボス）が出る' },
      { id: 'danger', label: '魔物の強さ', min: 0, max: 100, def: 50, lo: 'やさしい', hi: '鬼畜' },
      { id: 'loot', label: 'お宝の多さ', min: 0, max: 100, def: 50, lo: 'しょっぱい', hi: '黄金郷' },
      { id: 'retreat', label: '撤退', type: 'select', def: 'auto', options: [{ v: 'auto', label: '気質しだいで引き返す' }, { v: 'never', label: '行けるところまで' }] }
    ],
    stats: [
      { id: 'str', label: '腕っぷし', desc: '戦闘での強さ' },
      { id: 'luck', label: '運', desc: '宝箱の中身・罠の回避・会心の一撃' },
      { id: 'int', label: '知能', desc: '謎かけ・階層の主の仕掛けを見抜く力（性格とは別）' }
    ],
    perFields: [{ id: 'job', label: '職業', auto: 'おまかせ（エゴグラムから）', options: JOB_IDS.map(function (k) { return { id: k, label: JOBS[k].label }; }) }],
    actions: [
      { id: 'front', label: '前に出て戦う', fit: function (t) { return t.aggr * 0.6 + t.cp * 0.3; } },
      { id: 'support', label: '仲間を支える', fit: function (t) { return t.np * 0.6 + t.ac * 0.2; } },
      { id: 'careful', label: '慎重に進む', fit: function (t) { return t.caution * 0.6 + t.a * 0.3; } }
    ],
    goals: [
      { id: 'gold', label: 'お金を稼ぐ', fit: function (t) { return t.fc * 0.4 + t.impulse * 0.3 + t.cold * 0.2; } },
      { id: 'deep', label: '最深部を目指す', fit: function (t) { return t.cp * 0.4 + t.aggr * 0.3 + t.fc * 0.2; } },
      { id: 'live', label: '全員で生きて帰る', fit: function (t) { return t.np * 0.5 + t.caution * 0.4; } }
    ],
    events: []
  };
  HK.SCENARIOS.rpg = scen;
  HK.SCEN_ORDER.push('rpg');

  function resolve(S, p, list, pick) {
    if (pick && pick !== 'auto') for (var i = 0; i < list.length; i++) if (list[i].id === pick) return list[i];
    return HK.weighted(S.rng, list, function (o) { return Math.pow(Math.max(0.02, o.fit(p.tr)), 3); });
  }
  function tieOf(input, a, b) {
    var t = (input.ties || []).filter(function (x) { return (x.a === a.i && x.b === b.i) || (x.a === b.i && x.b === a.i); })[0];
    return t ? t.type : '';
  }

  function run(input) {
    var ST = HK.Story, S = ST.state(input, 'rpg'), rng = S.rng, env = S.env, P = S.P;
    var dmul = 0.7 + env.danger / 100 * 0.9, lmul = 0.6 + env.loot / 100 * 1.2;
    var pot = Math.max(1, Math.round(P.length * 0.7)), gold = 0, floor = 0, banked = 0, ended = '', bossDown = 0;
    P.forEach(function (p) {
      var pc = (input.perChar && input.perChar[p.i]) || {}, pick = (pc.pick || {}).job;
      p._r = rng;
      p.job = JOBS[pick] ? pick : HK.weighted(rng, JOB_IDS, function (k) { return Math.pow(Math.max(0.02, JOBS[k].fit(p.tr)), 3); });
      var J = JOBS[p.job];
      p.action = resolve(S, p, scen.actions, pc.action); p.goal = resolve(S, p, scen.goals, pc.goal);
      p.mhp = Math.round(J.hp + p.tr.cp * 6 + (p.stats.str || 3) * 2); p.hp = p.mhp;
      p.atk = J.atk + (p.stats.str || 3) * 1.2 + p.tr.aggr * 3; p.def = J.def + p.tr.caution * 2;
      p.intel0 = clamp((p.stats.int || 3) / 5, 0.2, 1);
      p.lv = 1; p.kills = 0; p.down = 0; p.found = 0; p.alive = true; p.m = { hp: 100, gold: 0 }; p.cnt = { kills: 0, chest: 0, heal: 0 };
      p.roleLabel = J.label + '（' + (pick && JOBS[pick] ? '指定' : 'エゴグラムから') + '）';
    });
    var alive = function () { return P.filter(function (p) { return p.alive; }); };
    /* 特殊役職（不死・吸血鬼）（rpg-special.js） */
    var SPX = HK.RPG_SPEC;
    if (SPX) SPX.setup(S, input);
    var leader = P.slice().sort(function (a, b) { return (b.tr.lead + b.tr.cp * 0.5) - (a.tr.lead + a.tr.cp * 0.5); })[0];
    function snap() { P.forEach(function (p) { p.m.hp = Math.round(p.hp / p.mhp * 100); p.m.gold = p.found; }); ST.snap(S, ['hp', 'gold']); }
    function hurt(p, d) {
      d = Math.max(1, Math.round(d - p.def * 0.5));
      p.hp -= d;
      if (SPX) SPX.hurt(p, d);
      if (p.hp <= 0) {
        p.hp = 0; p.alive = false; p.down++;
        var pr = alive().filter(function (x) { return JOBS[x.job].heal; })[0];
        if (pr && rng() < 0.55 + pr.tr.np * 0.3) { p.alive = true; p.hp = Math.round(p.mhp * 0.35); pr.cnt.heal++; return p.name + 'が倒れた！――' + pr.name + 'の祈りで、' + p.name + 'は立ち上がった。'; }
        if (pot > 0 && rng() < 0.7) { pot--; p.alive = true; p.hp = Math.round(p.mhp * 0.4); return p.name + 'が倒れた！――仲間が回復薬を飲ませ、' + p.name + 'は息を吹き返した。'; }
        return p.name + 'は倒れた。';
      }
      return '';
    }
    /* 戦闘：パーティの攻撃と敵の反撃を数回くり返す */
    function battle(mon, boss) {
      var hp = mon[1] * dmul * (boss ? 6 : 3), pow = mon[1] * dmul, t = (boss ? '階層の主《' + mon[0] + '》が立ちはだかった！' : HK.RPGData.ENC[Math.floor(rng() * HK.RPGData.ENC.length)].replace(/\{m\}/g, mon[0])), rounds = 0, hit = [];
      /* 先に気づくか（慎重さ・狩人） */
      var scout = alive().reduce(function (m, p) { return Math.max(m, p.tr.caution + (p.job === 'hunter' ? 0.3 : 0)); }, 0);
      if (!boss && rng() < scout * 0.35) { t += '――先に気づいたので、奇襲をかけた。'; hp *= 0.7; }
      while (hp > 0 && alive().length && rounds < 8) {
        rounds++;
        alive().forEach(function (p) {
          if (hp <= 0 || p.mad) return;
          var front = p.action.id === 'front' ? 1.2 : p.action.id === 'support' ? 0.8 : 1;
          var crit = rng() < 0.06 + (p.stats.luck || 3) * 0.02;
          var d = p.atk * front * (0.7 + rng() * 0.6) * (crit ? 1.8 : 1) * (1 + p.lv * 0.08);
          if (JOBS[p.job].bard) { alive().forEach(function (q) { q.atk += 0.05; }); }
          hp -= d;
          if (crit) hit.push(p.name + 'の会心の一撃！');
          if (hp <= 0) { p.kills++; p.cnt.kills++; }
        });
        if (hp <= 0) break;
        /* 敵の反撃：前に出る人が狙われやすい */
        var tg = HK.weighted(rng, alive(), function (p) { return 1 + (p.action.id === 'front' ? 1.2 : 0) + (p.job === 'warrior' ? 0.8 : 0) - (p.action.id === 'careful' ? 0.4 : 0); });
        if (!tg) break;
        /* かばう（仲間の関係と NP） */
        var cover = alive().filter(function (q) { return q !== tg && q.hp > q.mhp * 0.4 && (q.tr.np > 0.6 || /lover|best|parent|sibprot|buddy|mate/.test(tieOf(input, q, tg))) && rng() < 0.18 + q.tr.np * 0.2; })[0];
        if (cover && tg.hp < tg.mhp * 0.5) { hit.push(cover.name + 'が' + tg.name + 'をかばった！'); tg = cover; }
        var msg = hurt(tg, pow * (0.6 + rng() * 0.8));
        if (msg) hit.push(msg); else if (rng() < 0.25) hit.push(say(tg, 'hurt'));
      }
      if (hp > 0) return { win: false, text: t + hit.slice(0, 4).join('') };
      var g = Math.round(mon[2] * lmul * (0.8 + rng() * 0.4));
      var top = P.slice().sort(function (a, b) { return b.kills - a.kills; })[0];
      gold += g; top.found += g;
      var a0 = alive()[Math.floor(rng() * alive().length)];
      var RDx = HK.RPGData, fin = top && RDx.JOBACT[top.job] ? RDx.JOBACT[top.job][Math.floor(rng() * RDx.JOBACT[top.job].length)].replace(/\{a\}/g, top.name) : '';
      return { win: true, gold: g, text: t + (a0 && rng() < 0.6 ? say(a0, 'attack') : '') + hit.slice(0, 3).join('') + fin + RDx.FIN[Math.floor(rng() * RDx.FIN.length)].replace(/\{m\}/g, mon[0]) + '（' + g + 'G）' };
    }

    /* ======== 追加の展開：階層の主20体・喧嘩・人質・謎かけ・呪いの装備・賭場・女神像・隠し部屋・料理 ======== */
    var RD = HK.RPGData, usedBoss = {}, captive = null, grudges = [], hostUsed = false, lastSp = {};
    function F(t, m) { return String(t).replace(/\{(\w+)\}/g, function (x, k) { return m[k] != null ? m[k] : x; }); }
    function pick2(arr) { return arr[Math.floor(rng() * arr.length)]; }
    function tieStrong(a, b) { return /lover|mate|best|parent|sibprot|sibclose|sibling|buddy|childhood|crush|almost/.test(tieOf(input, a, b)); }
    function bossFight() {
      var frac = floor / Math.max(5, maxF), tierB = Math.min(3, Math.floor(frac * 4 - 0.01));
      var pool = RD.BOSSES.filter(function (x) { return x.t === tierB && !usedBoss[x.n]; });
      if (!pool.length) pool = RD.BOSSES.filter(function (x) { return !usedBoss[x.n]; });
      if (!pool.length) pool = RD.BOSSES;
      var B = pick2(pool); usedBoss[B.n] = 1;
      var A = alive(), a = pick2(A), b = A.filter(function (x) { return x !== a; }).sort(function (x, y) { return (tieStrong(y, a) ? 1 : 0) + y.tr.np - (tieStrong(x, a) ? 1 : 0) - x.tr.np; })[0] || null;
      var pow = B.p + floor * 0.6, m = { a: a.name, b: b ? b.name : '', x: B.n }, pre = B.in + F(pick2(RD.GIM[B.k]), m), note = '', act = [], broke = false, k = B.k, atkSave = null;
      /* 仕掛けを破れるか：謎かけ・見抜く＝A、正気に戻す・庇う＝NPや関係、糸を切る＝盗賊 */
      if (k === 'riddle' || k === 'armor') { var sm = A.slice().sort(function (x, y) { return (y.tr.a + y.intel0) - (x.tr.a + x.intel0); })[0]; broke = sm.tr.a + sm.intel0 > 0.9 && rng() < 0.75; if (broke) { m.a = sm.name; act.push(sm.i); } }
      else if (b && /charm|stone|terror|bind|greed/.test(k)) broke = rng() < 0.3 + b.tr.np * 0.3 + (tieStrong(a, b) ? 0.25 : 0) + (k === 'bind' && JOBS[b.job].thief ? 0.3 : 0) + (k === 'terror' ? -a.tr.ac * 0.2 : 0);
      if (broke && RD.BREAK[k]) { pre += F(pick2(RD.BREAK[k]), m); note = '仕掛けを破った'; if (k === 'riddle' || k === 'armor') pow *= 0.6; }
      else {
        if (/summon|split|twin|rage|time|armor/.test(k)) pow *= 1.25;
        if (/poison|drain|burn/.test(k)) { (k === 'burn' ? A : [a]).forEach(function (q) { var d = hurt(q, q.mhp * (k === 'burn' ? 0.18 : 0.3)); if (d) pre += d; }); }
        if (/bind|stone|terror|greed/.test(k)) { var d2 = hurt(a, a.mhp * 0.35); if (d2) pre += d2; }
        if (k === 'charm' && b) { var d3 = hurt(b, b.mhp * 0.3); pre += a.name + 'の一撃が、' + b.name + 'を傷つけた。' + (d3 || ''); }
        if (k === 'riddle') { A.forEach(function (q) { hurt(q, q.mhp * 0.15); }); pre += '誰も答えられなかった。' + B.n + 'が怒りの爪を振り下ろした。'; }
        if (k === 'curse') { atkSave = A.map(function (q) { return q.atk; }); A.forEach(function (q) { q.atk *= 0.8; }); }
      }
      if (b) act.push(b.i);
      var res = alive().length ? battle([B.n, pow, B.g], true) : { win: false, text: '' };
      res.text = res.text.replace(/^階層の主《[^》]+》が立ちはだかった！/, '');
      if (atkSave) A.forEach(function (q, i) { q.atk = atkSave[i]; });
      return { b: B, res: res, pre: pre, note: note, actors: act };
    }
    function special(A, a, b, usedK) {
      var opts = [];
      function can(k, gap) { return !usedK['sp_' + k] && (lastSp[k] == null || floor - lastSp[k] >= gap); }
      if (b && can('quarrel', 5) && grudges.length < 2) opts.push(['quarrel', 0.4 + A.reduce(function (m0, x) { return Math.max(m0, x.tr.aggr + x.tr.cp * 0.5 + x.tr.jealous * 0.4); }, 0) * 0.5]);
      if (grudges.length && can('make', 2)) opts.push(['make', 1.4]);
      if (b && !hostUsed && floor >= 2 && floor <= maxF - 2 && A.length >= 2) opts.push(['host', 0.7]);
      if (captive && can('captive', 2)) opts.push(['captive', 0.8]);
      if (can('riddle', 4)) opts.push(['riddle', 0.8]);
      if (can('cursed', 5)) opts.push(['cursed', 0.6]);
      if (can('gamble', 4)) opts.push(['gamble', 0.7]);
      if (can('statue', 4)) opts.push(['statue', 0.6]);
      if (can('secret', 3)) opts.push(['secret', 0.7]);
      if (can('cook', 3)) opts.push(['cook', 0.7]);
      if (!opts.length) return false;
      var k = HK.weighted(rng, opts, function (o) { return o[1]; })[0];
      usedK['sp_' + k] = 1; lastSp[k] = floor;
      var m = { a: a.name, b: b ? b.name : '' };
      if (k === 'quarrel') {
        /* いちばん角の立つ組み合わせ（攻撃性・CP・執着）が衝突する */
        var pr = null, best = -1;
        A.forEach(function (x) { A.forEach(function (y) { if (x.i < y.i && !grudges.some(function (g) { return (g[0] === x && g[1] === y) || (g[0] === y && g[1] === x); })) { var v = x.tr.aggr + y.tr.aggr + (x.tr.cp + y.tr.cp) * 0.5 + (x.tr.jealous + y.tr.jealous) * 0.3 + rng() * 0.4; if (v > best) { best = v; pr = [x, y]; } } }); });
        if (!pr) return false;
        var x = pr[0], y = pr[1], med = A.filter(function (q) { return q !== x && q !== y; }).sort(function (q1, q2) { return q2.tr.np - q1.tr.np; })[0];
        var mm = { a: x.name, b: y.name, c: med ? med.name : '', w: pick2(RD.QUARREL.why) };
        var t = F(pick2(RD.QUARREL.fight), mm), healed = (med && med.tr.np > 0.55 && rng() < 0.7) || x.tr.np + y.tr.np > 1.1;
        if (healed) t += F(pick2(RD.QUARREL.make.filter(function (l) { return med || l.indexOf('{c}') < 0; })), mm);
        else { t += F(pick2(RD.QUARREL.grudge), mm); grudges.push([x, y]); x.atk -= 1; y.atk -= 1; }
        ST.say(S, { actors: [x.i, y.i].concat(med && healed ? [med.i] : []), tag: '喧嘩', text: t, why: x.name + 'と' + y.name + 'の衝突（攻撃性・CP・執着）' + (healed ? '／仲裁で収まった（NP）' : '／わだかまりが残った（二人とも攻撃力が少し下がる）') });
      } else if (k === 'make') {
        var gpair = grudges.shift(), gx = gpair[0], gy = gpair[1];
        if (!gx.alive || !gy.alive) return true;
        gx.atk += 1; gy.atk += 1;
        ST.say(S, { actors: [gx.i, gy.i], tag: '仲直り', text: F(pick2(RD.QUARREL.later), { a: gx.name, b: gy.name }), why: '喧嘩していた二人が、戦いの中で仲直りした' });
      } else if (k === 'host') {
        /* 魔術師に攫われる：リーダー以外から。数階先で取り返す */
        hostUsed = true;
        var tg = A.filter(function (q) { return q !== leader; })[Math.floor(rng() * Math.max(1, A.length - 1))] || A[0];
        var at = Math.min(maxF, floor + 2 + Math.floor(rng() * 2));
        captive = { p: tg, at: at }; tg.alive = false; tg.captive = true;
        var lover = A.filter(function (q) { return q !== tg && tieStrong(q, tg); })[0], rest = A.filter(function (q) { return q !== tg; }), resp = lover || rest.sort(function (q1, q2) { return q2.tr.np - q1.tr.np; })[0];
        if (resp) resp.vow = true;
        ST.say(S, { actors: [tg.i].concat(resp ? [resp.i] : []), tag: '人質', kind: 'climax', text: F(pick2(RD.HOST.take), { a: tg.name, d: at }) + (resp ? F(pick2(lover ? RD.HOST.reactTie : RD.HOST.react), { a: tg.name, b: resp.name }) : ''), why: '黒衣の魔術師が' + tg.name + 'を攫った。地下' + at + '階で取り返せる' + (lover ? '（' + resp.name + 'は特に強く誓った）' : '') });
      } else if (k === 'captive') {
        ST.say(S, { actors: [captive.p.i], tag: '囚われの身', text: F(pick2(RD.HOST.captive), { a: captive.p.name }), why: captive.p.name + 'は魔術師の塔で、仲間を待っている' });
      } else if (k === 'riddle') {
        var sage = A.slice().sort(function (q1, q2) { return (q2.tr.a + q2.intel0) - (q1.tr.a + q1.intel0); })[0], ok = rng() < sage.tr.a * 0.5 + sage.intel0 * 0.5;
        var t2 = pick2(RD.RIDDLE.door) + F(pick2(ok ? RD.RIDDLE.ok : RD.RIDDLE.ng), { a: sage.name });
        if (ok) { var g2 = Math.round((40 + floor * 10) * lmul); gold += g2; sage.found += g2; t2 += '（' + g2 + 'G）'; } else { var d4 = hurt(sage, 6 + floor); t2 += d4; }
        ST.say(S, { actors: [sage.i], tag: '謎かけ', text: t2, why: sage.name + 'のA（' + Math.round(sage.eg.A) + '）' });
      } else if (k === 'cursed') {
        var grab = A.slice().sort(function (q1, q2) { return (q2.tr.impulse + q2.tr.fc) - (q1.tr.impulse + q1.tr.fc); })[0], take = grab.tr.impulse + grab.tr.fc > 1 && rng() < 0.75;
        if (take) { grab.atk += 4; grab.mhp = Math.max(10, grab.mhp - 6); grab.hp = Math.min(grab.hp, grab.mhp); grab.cursed = true; }
        ST.say(S, { actors: [grab.i], tag: '呪いの装備', text: pick2(RD.CURSED.find) + F(pick2(take ? RD.CURSED.take : RD.CURSED.leave), { a: take ? grab.name : A.slice().sort(function (q1, q2) { return q2.tr.caution - q1.tr.caution; })[0].name }), why: take ? grab.name + 'の衝動性（攻撃力＋4・最大体力−6）' : 'パーティの慎重さ' });
      } else if (k === 'gamble') {
        var gb = A.slice().sort(function (q1, q2) { return (q2.tr.fc + q2.tr.impulse) - (q1.tr.fc + q1.tr.impulse); })[0], play = gb.tr.fc + gb.tr.impulse > 0.9 && gold > 20;
        var t3 = pick2(RD.GAMBLE.open);
        if (play) { var win = rng() < 0.42 + (gb.stats.luck || 3) * 0.04, bet = Math.round(gold * 0.4); if (win) { gold += bet; gb.found += bet; } else gold -= bet; t3 += F(pick2(win ? RD.GAMBLE.win : RD.GAMBLE.lose), { a: gb.name }) + '（' + (win ? '+' : '−') + bet + 'G）'; }
        else t3 += F(pick2(RD.GAMBLE.pass), { a: gb.name });
        ST.say(S, { actors: [gb.i], tag: '賭場', text: t3, why: gb.name + 'のFC・衝動性' + (play ? '・運' : '') });
      } else if (k === 'statue') {
        var pz = A.slice().sort(function (q1, q2) { return (q2.tr.ac + q2.tr.np) - (q1.tr.ac + q1.tr.np); })[0], pray = pz.tr.ac + pz.tr.np > 0.9;
        if (pray) A.forEach(function (q) { q.hp = Math.min(q.mhp, q.hp + Math.round(q.mhp * 0.25)); q.def += 0.5; });
        ST.say(S, { actors: [pz.i], tag: '女神像', text: pick2(RD.STATUE.open) + F(pick2(pray ? RD.STATUE.pray : RD.STATUE.skip), { a: pz.name }), why: pray ? pz.name + 'のAC・NP（全員の体力回復・守り＋）' : '' });
      } else if (k === 'secret') {
        var sc0 = A.slice().sort(function (q1, q2) { return (q2.tr.caution + (q2.job === 'thief' || q2.job === 'hunter' ? 0.4 : 0)) - (q1.tr.caution + (q1.job === 'thief' || q1.job === 'hunter' ? 0.4 : 0)); })[0];
        var g3 = Math.round((25 + floor * 7) * lmul); gold += g3; sc0.found += g3; if (rng() < 0.4) pot++;
        ST.say(S, { actors: [sc0.i], tag: '隠し部屋', text: F(pick2(RD.SECRET), { a: sc0.name }) + '（' + g3 + 'G）', why: sc0.name + 'の慎重さ' });
      } else if (k === 'cook') {
        var ck = A.slice().sort(function (q1, q2) { return (q2.tr.np + q2.tr.fc * 0.5) - (q1.tr.np + q1.tr.fc * 0.5); })[0];
        A.forEach(function (q) { q.hp = Math.min(q.mhp, q.hp + Math.round(q.mhp * 0.2)); });
        ST.say(S, { actors: [ck.i], tag: '料理', text: F(pick2(RD.COOK), { a: ck.name }), why: ck.name + 'のNP（全員の体力回復）' });
      }
      return true;
    }
    function rescue() {
      var c = captive.p, A = alive(), hero = A.filter(function (q) { return q.vow; })[0] || A[0];
      var wz = ['黒衣の魔術師', 14 + floor * 1.6, 60 + floor * 10];
      if (hero) hero.atk += 2;
      var res = battle(wz, true);
      res.text = res.text.replace(/^階層の主《[^》]+》が立ちはだかった！/, '');
      if (hero) hero.atk -= 2;
      var t = F(pick2(RD.HOST.rescue), { a: c.name, b: hero ? hero.name : '' }) + res.text;
      if (res.win) { c.alive = true; c.captive = false; c.hp = Math.round(c.mhp * 0.5); t += F(pick2(RD.HOST.freed), { a: c.name, b: hero ? hero.name : '' }); captive = null; }
      ST.say(S, { actors: [c.i].concat(hero ? [hero.i] : []), tag: res.win ? '救出' : '救出失敗', kind: 'climax', text: t, why: res.win ? (hero ? hero.name + 'の誓い（攻撃力＋2）' : '') + '・' + c.name + 'を取り返した' : '魔術師に返り討ちにされた' });
      if (!res.win) captive.at = floor + 2;
    }
    ST.say(S, { kind: 'phase', actors: P.map(function (p) { return p.i; }), text: P.map(function (p) { return p.name + '（' + JOBS[p.job].label + (SPX ? SPX.label(p) : '') + '）'; }).join('・') + 'のパーティが、ダンジョンの入口に立った。' + (P.length > 1 ? 'リーダーは' + leader.name + '。' : ''), why: '職業はエゴグラムから（戦士＝攻撃性・CP／魔法使い＝A／僧侶＝NP／盗賊＝FC・衝動性／狩人＝慎重さ／吟遊詩人＝FC・NP）' });
    snap();
    var maxF = env.floors, last = {};
    /* 階を下りる前に、倒れた不死・吸血鬼が起き上がる */
    function goOn() { if (SPX) SPX.revive(S, floor); return alive().length; }
    for (floor = 1; floor <= maxF && goOn(); floor++) {
      ST.step(S, '地下' + floor + '階');
      if (SPX) SPX.floor(S, floor);
      if (captive && floor >= captive.at && alive().length) rescue();
      var tier = Math.min(3, Math.floor((floor - 1) / Math.max(3, maxF / 4)));
      var nEv = 2 + (rng() < 0.5 ? 1 : 0), usedK = {};
      for (var e = 0; e < nEv && alive().length; e++) {
        var A = alive().filter(function (x) { return !x.mad; });
        if (!A.length) break;
        var a = A[Math.floor(rng() * A.length)], b = A.filter(function (x) { return x !== a; })[Math.floor(rng() * Math.max(1, A.length - 1))] || null;
        var r = rng(), loot = env.loot / 100;
        if (rng() < 0.26 && special(A, a, b, usedK)) continue;
        /* 同じ階で同じ種類の出来事を重ねない（戦闘は除く）。商人・分け前・泉は数階に一度 */
        for (var tries = 0; tries < 4; tries++) {
          var kk = r < 0.42 ? 'battle' : r < 0.58 + loot * 0.08 ? 'chest' : r < 0.7 ? 'trap' : r < 0.78 ? 'shop' : r < 0.84 ? 'fount' : r < 0.9 ? 'camp' : r < 0.95 ? 'lost' : 'greed';
          var rare = { shop: 3, fount: 2, greed: 4, lost: 2 }[kk];
          if (kk !== 'battle' && (usedK[kk] || (rare && last[kk] != null && floor - last[kk] < rare))) { r = rng(); continue; }
          usedK[kk] = 1; last[kk] = floor; break;
        }
        if (r < 0.42) {
          var mon = MON[tier][Math.floor(rng() * MON[tier].length)], res = battle(mon, false);
          ST.say(S, { actors: alive().map(function (p) { return p.i; }), tag: res.win ? '戦闘' : '敗走', text: res.text, why: '地下' + floor + '階の魔物（強さ ' + Math.round(mon[1] * dmul) + '）' });
          if (!res.win) { break; }
        } else if (r < 0.42 + 0.16 + loot * 0.08) {
          /* 宝箱：開けるかは衝動性・FC、罠は慎重さと盗賊 */
          var opener = HK.weighted(rng, A, function (x) { return Math.pow(0.2 + x.tr.impulse + x.tr.fc * 0.6 + (x.goal.id === 'gold' ? 0.4 : 0), 3); });
          var thief = A.filter(function (x) { return JOBS[x.job].thief; })[0], careful = A.reduce(function (m, x) { return Math.max(m, x.tr.caution); }, 0);
          if (careful > 0.75 && opener.tr.impulse < 0.5 && rng() < 0.3 && !thief) { ST.say(S, { actors: [opener.i], tag: '宝箱', text: '宝箱があったが、' + opener.name + 'たちは怪しんで手を出さなかった。', why: 'パーティの慎重さ' }); continue; }
          var kind = rng() < 0.12 ? 'mimic' : rng() < (thief ? 0.06 : 0.22) - (opener.stats.luck || 3) * 0.02 ? 'trap' : rng() < 0.2 ? 'potion' : 'gold';
          var t = (thief && thief !== opener && rng() < 0.6 ? thief.name + 'が罠を確かめてから、' : '') + opener.name + 'が宝箱を開けた。' + CHEST[kind][Math.floor(rng() * CHEST[kind].length)];
          opener.cnt.chest++;
          if (kind === 'gold') { var g = Math.round((20 + floor * 8) * lmul * (0.6 + rng()) * (1 + (opener.stats.luck || 3) * 0.08)); gold += g; opener.found += g; t += '（' + g + 'G）' + (rng() < 0.5 ? say(opener, 'loot') : HK.RPGData.X.loot[Math.floor(rng() * HK.RPGData.X.loot.length)].replace(/\{a\}/g, opener.name)); }
          else if (kind === 'potion') pot += 2;
          else if (kind === 'trap') t += hurt(opener, 6 + floor * 1.2 * dmul);
          else { var rb = battle(['ミミック', 8 + floor * 1.5, 30 + floor * 6], false); t += rb.text; if (!rb.win) { ST.say(S, { actors: [opener.i], tag: '宝箱', text: t, why: opener.name + 'の衝動性（' + Math.round(opener.tr.impulse * 100) + '）' }); break; } }
          ST.say(S, { actors: [opener.i], tag: '宝箱', text: t, why: opener.name + 'が開けた（衝動性・FC' + (opener.goal.id === 'gold' ? '・お金が目当て' : '') + '）' });
        } else if (r < 0.7) {
          /* 罠 */
          var vic = A[Math.floor(rng() * A.length)], av = vic.tr.caution * 0.5 + (vic.job === 'thief' ? 0.3 : 0) + (vic.stats.luck || 3) * 0.04;
          if (rng() < av) ST.say(S, { actors: [vic.i], tag: '罠', text: pickT(HK.RPGData.X.trapOk).replace(/\{a\}/g, vic.name), why: vic.name + 'の慎重さ' });
          else ST.say(S, { actors: [vic.i], tag: '罠', text: pickT(['落とし穴に足を取られた。', '天井から矢が降ってきた。', '毒の霧が噴き出した。', '転がる大岩に追いかけられた。'].concat(HK.RPGData.X.trapHit)) + vic.name + 'が傷を負った。' + hurt(vic, 5 + floor * dmul), why: '罠' });
        } else if (r < 0.78) {
          /* 商人：倹約か浪費か */
          var buyer = A.slice().sort(function (x, y) { return (y.tr.fc + y.tr.impulse) - (x.tr.fc + x.tr.impulse); })[0];
          var price = 25 + floor * 4, n = gold >= price ? Math.min(3, Math.floor(gold / price)) : 0;
          if (buyer.tr.cold > 0.6 && n > 1) n = 1;
          var haggle = buyer.tr.cp + buyer.tr.fc > 1.1 && rng() < 0.5;
          if (haggle) price = Math.round(price * 0.7);
          if (n) { gold -= price * n; pot += n; }
          ST.say(S, { actors: [buyer.i], tag: '商人', text: pickT(SHOP) + (n ? (haggle ? buyer.name + 'は値切りに値切った。' : '') + '回復薬を' + n + '本買った。' : '……金が足りなかった。'), why: buyer.name + 'の財布のひも（FC・衝動性・ドライさ）' });
        } else if (r < 0.84) {
          A.forEach(function (p) { p.hp = Math.min(p.mhp, p.hp + Math.round(p.mhp * 0.4)); });
          var cursed = rng() < 0.15;
          if (cursed) A.forEach(function (p) { p.atk -= 0.5; });
          ST.say(S, { actors: A.map(function (p) { return p.i; }), tag: '泉', text: pickT(FOUNTAIN) + '一口飲むと、体の傷がふさがっていった。' + (cursed ? '……けれど、どこか力が抜けた気がした。' : ''), why: '回復の泉' });
        } else if (r < 0.9 && b) {
          /* 休憩：関係が出る */
          var tt = tieOf(input, a, b);
          A.forEach(function (p) { p.hp = Math.min(p.mhp, p.hp + Math.round(p.mhp * 0.15)); });
          ST.say(S, { actors: [a.i, b.i], tag: '休憩', text: fillT(pickT(CAMP), a, b), why: '休憩' + (tt && HK.TIES[tt] ? '（' + HK.TIES[tt].label + '）' : '') });
        } else if (r < 0.95) {
          /* 迷子を助けるか（NP） */
          var helper = A.slice().sort(function (x, y) { return y.tr.np - x.tr.np; })[0];
          if (helper.tr.np > 0.45 || rng() < 0.3) { var rw = Math.round((30 + floor * 5) * lmul); gold += rw; helper.found += rw; ST.say(S, { actors: [helper.i], tag: '人助け', text: pickT(LOST) + helper.name + 'は放っておけなかった。助け出すと、お礼に' + rw + 'G を渡された。', why: helper.name + 'のNP（' + Math.round(helper.eg.NP) + '）' }); }
          else ST.say(S, { actors: [helper.i], tag: '素通り', text: pickT(LOST) + '……パーティは、見なかったことにした。', why: 'パーティのNPが低い' });
        } else if (b && gold > 100) {
          var gr = A.slice().sort(function (x, y) { return (y.tr.jealous + y.tr.cold + y.tr.fc) - (x.tr.jealous + x.tr.cold + x.tr.fc); })[0], other = A.filter(function (x) { return x !== gr; })[0];
          if (other) ST.say(S, { actors: [gr.i, other.i], tag: '分け前', text: fillT(pickT(GREED), gr, other), why: gr.name + 'の執着・ドライさ' });
        }
      }
      if (!goOn()) break;
      /* 階層の主 */
      if (floor % 5 === 0) {
        var bo = bossFight();
        var br = bo.res;
        ST.say(S, { actors: alive().map(function (p) { return p.i; }).concat(bo.actors), tag: br.win ? '階層の主' : '全滅の危機', kind: 'climax', text: bo.pre + br.text, why: '地下' + floor + '階の主《' + bo.b.n + '》' + (bo.note ? '／' + bo.note : '') });
        if (br.win) { bossDown++; P.forEach(function (p) { if (p.alive) { p.lv++; p.mhp += 4; p.hp = Math.min(p.mhp, p.hp + 6); } }); }
      }
      snap();
      if (!goOn()) break;
      /* 引き返すか：リーダーの慎重さと、パーティの消耗・お金の目標 */
      if (env.retreat === 'auto' && floor < maxF) {
        var A2 = alive(), ratio = A2.reduce(function (s0, p) { return s0 + p.hp / p.mhp; }, 0) / A2.length, lost = P.length - A2.length;
        var L0 = A2.indexOf(leader) >= 0 ? leader : A2[0];
        var fear = (1 - ratio) * 1.2 + lost * 0.3 + L0.tr.caution * 0.4 - L0.tr.aggr * 0.3 - (L0.goal.id === 'deep' ? 0.25 : 0) + (pot === 0 ? 0.2 : 0);
        if (fear > 0.85) {
          var greedy = A2.filter(function (p) { return p !== L0 && (p.goal.id === 'gold' || p.goal.id === 'deep') && p.tr.impulse > 0.5; })[0];
          ST.say(S, { actors: A2.map(function (p) { return p.i; }), tag: '撤退', text: L0.name + 'は「ここまでだ。引き返す」と決めた。' + (greedy ? greedy.name + 'は「もう少しだけ！」と粘ったが、最後には折れた。' : ''), why: L0.name + 'の判断（消耗 ' + Math.round((1 - ratio) * 100) + '%・慎重さ）' });
          ended = 'retreat'; break;
        }
      }
    }
    goOn();
    var A3 = alive(), reached = Math.min(floor, maxF) - (ended === 'retreat' || A3.length ? 0 : 1);
    if (!A3.length) { banked = Math.round(gold * 0.1); ended = 'wipe'; }
    else { banked = gold; ended = ended || 'clear'; }
    var cleared = ended === 'clear' ? maxF : ended === 'retreat' ? floor : Math.max(0, floor - 1);
    var mvp = P.slice().sort(function (a, b) { return (b.kills * 10 + b.found / 10) - (a.kills * 10 + a.found / 10); })[0];
    P.forEach(function (p) {
      p.fate = p.captive ? '魔術師に囚われたまま' : !p.alive ? '力尽きた' : ended === 'clear' ? '踏破した' : '生還した';
      p.notes.push(JOBS[p.job].label + '・Lv' + p.lv + '・撃破 ' + p.kills + '・見つけたお金 ' + p.found + 'G・倒れた ' + p.down + '回' + (p.cnt.heal ? '・仲間を救った ' + p.cnt.heal + '回' : ''));
      p.notes.push('方針：' + p.action.label + '／目標：' + p.goal.label);
      if (SPX && SPX.note(p)) p.notes.push(SPX.note(p));
    });
    var title = ended === 'clear' ? '踏破！ ― 地下' + maxF + '階の最深部まで' : ended === 'retreat' ? '生還 ― 地下' + cleared + '階で引き返した' : '全滅 ― 地下' + floor + '階で力尽きた';
    var lines = [ended === 'wipe' ? 'パーティは全滅した。拾ったお金のほとんどは、迷宮に残された。持ち帰れたのは ' + banked + 'G だけだった。' : 'パーティは ' + banked + 'G を持ち帰った。', 'いちばん活躍したのは' + mvp.name + '（撃破 ' + mvp.kills + '・' + mvp.found + 'G）。'];
    if (bossDown) lines.push('倒した階層の主：' + bossDown + '体。');
    return ST.result(S, input, {
      ending: { title: title, kind: ended === 'wipe' ? 'over' : 'ok', lines: lines },
      estats: [['踏破した階', cleared + '／' + maxF + '階'], ['持ち帰ったお金', banked + 'G'], ['拾ったお金', gold + 'G'], ['階層の主', bossDown + '体'], ['生き残り', A3.length + '／' + P.length + '人']],
      table: { title: 'パーティの成績', cols: ['職業', 'Lv', '撃破', '見つけたお金', '倒れた', '結末'], rows: P.slice().sort(function (a, b) { return b.kills - a.kills; }).map(function (p, k) { return { i: p.i, rank: k === 0 ? 'MVP' : '', cells: [JOBS[p.job].label, String(p.lv), String(p.kills), p.found + 'G', p.down + '回', p.fate] }; }) },
      meters: [{ label: '体力', color: '--partner' }, { label: '見つけたお金', color: '--guard', dash: true, max: Math.max(100, P.reduce(function (m, p) { return Math.max(m, p.found); }, 0)), unit: 'G' }],
      meta: '地下' + maxF + '階・' + P.length + '人パーティ',
      summary: 'ダンジョンRPG：' + title + '・' + banked + 'G'
    });
    function pickT(arr) { return arr[Math.floor(rng() * arr.length)]; }
    function fillT(t, a, b) { return t.replace(/\{a\}/g, a.name).replace(/\{b\}/g, b ? b.name : ''); }
  }
})();
