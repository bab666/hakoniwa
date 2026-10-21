/* 箱庭シミュレーター: 邪神村RTA ― 宇宙エンドと、時を戻すアーティファクト
   ・宇宙エンド（おまかせで約5％）：祀られていたのは神ではなく、宇宙から来た何かだった。最後に一人が連れ去られる
   ・時を戻すアーティファクト：誰かの家宝か、村で拾ったもの。神が顕現したとき、持ち主がいれば時間が巻き戻り、
     一行は到着の時点からやり直す（一度だけ）。顕現した神の正体を見ているので、二周目は手がかりがそろった状態から始まる */
(function () {
  'use strict';
  var HK = window.HK, ST = HK.Story, JS = HK.JASHIN, clamp = HK.clamp;
  if (!ST || !JS) return;
  var scen = HK.SCENARIOS.jashin;
  if (!scen) return;
  function L(s) { return s.split('|'); }
  function alive(p) { return p.alive && !p.out && !p.taken; }
  function names(l) { return l.map(function (p) { return p.name; }).join('・'); }

  scen.env = scen.env.concat([
    { id: 'alien', label: '宇宙エンド', type: 'select', def: 'random', options: [{ v: 'random', label: 'おまかせ（約5％）' }, { v: 'yes', label: '必ず（祀られているのは宇宙人）' }, { v: 'no', label: 'なし' }], desc: '祀られているのが神ではなく宇宙人で、最後に一人が連れ去られる' },
    { id: 'relic', label: '時を戻すアーティファクト', type: 'select', def: 'random', options: [{ v: 'random', label: 'おまかせ（家宝・村で拾うことがある）' }, { v: 'heir', label: '誰かが家宝として持っている' }, { v: 'none', label: 'なし' }], desc: '神が顕現したとき、持ち主がいれば時間が巻き戻って、到着からやり直せる（一度だけ）' }
  ]);

  /* ---------- アーティファクト ---------- */
  var HEIR = [
    { n: '祖母の形見の懐中時計', t: '{a}の胸ポケットには、祖母の形見の懐中時計が入っていた。もう何年も、針は動いていない。' },
    { n: '家に伝わる砂時計', t: '{a}の鞄の底には、実家の蔵から持ち出した古い砂時計があった。「お守りだから」と、母に持たされたものだ。' },
    { n: '曾祖父の銀の鈴', t: '{a}は、曾祖父の代から伝わる小さな銀の鈴を、鍵束につけていた。鳴らすと、音が少し遅れて聞こえる。' },
    { n: '家紋入りの古い手鏡', t: '{a}は、家紋の入った古い手鏡を持っていた。覗き込むと、映る自分がほんの一瞬だけ遅れて動く。' }
  ];
  var FOUND = [
    { n: '針が逆に回る懐中時計', t: '{a}は、空き家の仏壇の引き出しで、錆びた懐中時計を見つけた。ねじを巻くと、針が逆向きに回り始めた。' },
    { n: '「戻」と彫られた石の勾玉', t: '{a}は、祠の裏の土の中から、石の勾玉を掘り出した。裏には一文字だけ「戻」と彫られていた。' },
    { n: '割れた日時計の欠片', t: '{a}は、苔むした石碑の根元で、日時計の欠片を拾った。影が、太陽とは逆の方向に伸びていた。' },
    { n: '祭りで使われなかった古いお面', t: '{a}は、蔵の奥で埃をかぶったお面を見つけた。裏には、知らない年号と、自分の名前が書かれていた。' }
  ];
  var REWIND = L('{a}の{r}が、ひとりでに熱を帯びた。――世界が、逆さまに巻き取られていく。悲鳴も、炎も、{g}の姿も、すべてが後ろ向きに遠ざかっていった。|{g}の影が一行を覆った瞬間、{a}の{r}が砕けるような音を立てた。気がつくと、村へ続く山道の入り口に立っていた。|音が消えた。{a}の{r}の中で、何かが逆向きに回り始めた。次の瞬間、一行は見覚えのある山道で、マイクロバスを降りたところだった。');
  var AGAIN = L('「……今の、夢じゃないよね」誰かが言った。全員が、同じものを見ていた。|山道の先に、またあの村が見えた。今度は、誰も「素敵な村だね」とは言わなかった。|{a}は手の中の{r}を見つめた。ひびが一本、増えていた。もう、次はない。');

  JS.LOOP = {
    /* 到着：宇宙エンドかどうかと、家宝の持ち主 */
    arrive: function (S) {
      var rng = S.rng, env = S.env;
      if (S.loopN) return;
      S.loopN = 1;
      S.alien = env.alien === 'yes' || (env.alien !== 'no' && rng() < 0.05);
      if (env.relic === 'none') return;
      var cand = S.P.filter(function (p) { return !p.villager; });
      var heir = env.relic === 'heir' ? rng.pick(cand) : cand.filter(function (p) { return rng() < (/^(folk|priest|psychic|occult)$/.test(p.job) ? 0.08 : 0.03); })[0];
      if (!heir) return;
      var it = rng.pick(HEIR);
      S.relic = { by: heir.i, n: it.n, heir: true };
      ST.say(S, { actors: [heir], tag: '家宝', text: ST.fmt(it.t, { a: heir.name }), why: heir.name + 'の家に伝わるもの。本人は、ただのお守りだと思っている' });
    },
    /* 二時間ごと：村でアーティファクトを拾う／宇宙の気配 */
    tick: function (S, live, h) {
      var rng = S.rng;
      if (!S.relic && S.env.relic !== 'none' && !S.rewound) {
        live.forEach(function (p) {
          if (S.relic || p.bound) return;
          var t = p.action && p.action.type;
          if (rng() < (t === 'explore' || t === 'lore' ? 0.009 : 0.003) + (p.stats.luck - 3) * 0.001) {
            var it = rng.pick(FOUND);
            S.relic = { by: p.i, n: it.n };
            ST.say(S, { actors: [p], tag: '拾いもの', text: ST.fmt(it.t, { a: p.name }), why: p.name + 'が村で妙なものを拾った（' + (t === 'explore' ? '探索' : t === 'lore' ? '調べもの' : '運') + '）', mag: 10 });
          }
        });
      }
      if (S.alien && (S.alienHint || 0) < 3 && rng() < 0.12) {
        var p = rng.pick(live);
        S.alienHint = (S.alienHint || 0) + 1;
        ST.say(S, { actors: p ? [p] : [], tag: '違和感', text: ST.fmt(ST.pick(S, ALIEN_HINT), { a: p ? p.name : '誰か', g: S.G.call }), why: 'この村の「神」には、どこか神らしくないところがある', mag: 8 });
      }
    },
    /* 顕現の瞬間：持ち主がいれば時間が巻き戻る（呼んだ側は manifest をそこで打ち切る） */
    tryRewind: function (S, h) {
      if (!S.relic || S.rewound) return false;
      var p = S.P[S.relic.by];
      if (!p || !p.alive) return false;
      if (S.rng() > 0.75) {
        ST.say(S, { actors: [p], tag: '沈黙', text: p.name + 'の' + S.relic.n + 'は、' + S.G.call + 'を前にして、ただ冷たいままだった。', why: 'アーティファクトは応えなかった（25％）', mag: 10 });
        return false;
      }
      S.rewind = { h: h, by: p.i };
      var o = ST.say(S, { actors: [p], tag: '巻き戻り', kind: 'climax', text: ST.fmt(ST.pick(S, REWIND), { a: p.name, r: S.relic.n, g: S.G.call }), why: p.name + 'の' + S.relic.n + 'が、' + S.G.name + 'の顕現に応えた', mag: 56 });
      ST.key(S, o, '時間が巻き戻った');
      return true;
    },
    /* 二周目の準備。やり直すなら true */
    restart: function (S) {
      if (!S.rewind || S.rewound) return false;
      var rw = S.rewind, by = S.P[rw.by];
      S.rewound = { h: rw.h, by: rw.by, n: S.relic.n, dead: S.P.filter(function (p) { return !p.alive; }).map(function (p) { return p.i; }) };
      S.rewind = null; S.loopN = 2;
      S.P.forEach(function (p) {
        p.alive = true; p.out = false; p.taken = false; p.esc = null; p.fate = '';
        p.bound = false; p.boundUntil = null; p.curse = null; p.possessed = false; p.goBackDie = false;
        p.m.hp = 55 + p.stats.stamina * 9; p.m.fear = clamp(18 + p.tr.ac * 12 + (S.rewound.dead.indexOf(p.i) >= 0 ? 20 : 0), 0, 100);
      });
      /* 神の正体はもう分かっている。偽情報にも騙されない */
      S.found = S.G.clues.map(function (c, i) { return i; });
      S.solved = false; S.partial = false; S.fake = 0; S.hold = 0; S.shrine = 0; S.shrineRage = false;
      S.inCave = false; S.engulf = false; S.manifested = false; S.result = null; S.forceEnd = false; S.counter = false;
      S.sealBonus = (S.sealBonus || 0) + 0.12;
      ST.step(S, '二周目　到着');
      var dead = S.rewound.dead.map(function (i) { return S.P[i]; });
      ST.say(S, { kind: 'phase', tag: 'やり直し', text: ST.fmt(ST.pick(S, AGAIN), { a: by.name, r: S.relic.n }) + (dead.length ? names(dead) + 'も、そこにいた。自分が一度死んだことを、' + (dead.length > 1 ? '全員' : dead[0].name) + 'はぼんやりと覚えていた。' : ''), why: '時間が巻き戻り、到着の時点からやり直す（神の正体は分かっている）', mag: 30 });
      return true;
    },
    /* 宇宙エンド：洞窟でも刻限でも、最後に正体が明かされる */
    alienEnd: function (S, h) {
      var rng = S.rng, live = S.P.filter(alive), taken = S.P.filter(function (p) { return p.alive && p.taken; });
      ST.step(S, '正体　' + JS.core.label(h + 1));
      ST.say(S, { kind: 'climax', tag: '正体', text: ST.fmt(ST.pick(S, ALIEN_REVEAL), { g: S.G.call, v: S.V }), why: '祀られていたのは、神ではなかった', mag: 50 });
      var pool = taken.concat(live);
      if (!pool.length) { S.alienEnd = { none: true }; return; }
      var vic = HK.weighted(rng, pool, function (p) { return 1 + (p.taken ? 2 : 0) + (/^(meet|truth|content)$/.test(p.goal.id) ? 1.5 : 0) + (/^(occult|streamer|psychic)$/.test(p.job) ? 1 : 0) + (5 - p.stats.luck) * 0.15; });
      var rel = live.filter(function (q) { return q !== vic && JS.REL && JS.REL.bond && JS.REL.bond(S, q, vic) >= 0.7; })[0];
      vic.alive = true; vic.out = false; vic.taken = false; vic.gone = true; vic.esc = h + 1; vic.fate = '宇宙人に連れ去られた（' + JS.hm(h + 1) + '）';
      var o = ST.say(S, { actors: rel ? [vic, rel] : [vic], tag: '連れ去り', kind: 'climax', text: ST.fmt(ST.pick(S, ALIEN_TAKE), { a: vic.name }) + (rel ? ST.fmt(ST.pick(S, ALIEN_REACH), { a: vic.name, b: rel.name }) : ''), why: vic.name + 'が選ばれた（目標・職業・運）', mag: 56 });
      ST.key(S, o, vic.name + 'が宇宙へ連れ去られた');
      var rest = S.P.filter(function (p) { return p !== vic && p.alive; });
      rest.forEach(function (p) { p.taken = false; p.out = true; p.bound = false; p.esc = h + 2 + rng(); p.fate = '生還・記憶の一部が欠けている（' + JS.hm(p.esc) + '）'; });
      if (rest.length) ST.say(S, { actors: rest, tag: '朝', kind: 'climax', text: ST.fmt(ST.pick(S, ALIEN_WAKE), { n: names(rest), a: vic.name }), why: '残された一行は、村の外で目を覚ました', mag: 30 });
      S.alienEnd = { by: vic.i };
      S.titleOverride = vic.name + 'は光の中へ連れていかれた。' + S.V + 'に祀られていたのは、神ではなかった――宇宙エンド';
    },
    lines: function (S) {
      var out = [];
      if (S.rewound) out.push('時間の巻き戻し：' + S.P[S.rewound.by].name + 'の' + S.rewound.n + 'で、' + JS.hm(S.rewound.h) + '時点から到着まで（記録は二周目のもの）');
      else if (S.relic) out.push('時を戻すもの：' + S.P[S.relic.by].name + 'の' + S.relic.n + '（使われなかった）');
      if (S.alienEnd) out.push('祀られていたもの：神ではなく、宇宙から来た何か（村での呼び名「' + S.G.call + '」）');
      return out;
    }
  };

  var ALIEN_HINT = L('夜空を、音もなく光が横切った。流れ星にしては、遅すぎた。|{a}は、村人の耳の後ろに、小さな金属片が埋め込まれているのを見た。|神社の御神体の鏡には、どの時代のものとも違う、細かな幾何学模様が刻まれていた。|{a}の腕時計が、村に入ってから一秒も進んでいなかった。|{a}は祠の石の表面が、触るとほんのり温かく、規則正しく脈打っていることに気づいた。|古文書の挿絵の「{g}」は、どう見ても、円盤の形をしていた。');
  var ALIEN_REVEAL = L('地鳴りとともに、{v}の裏山が割れた。中から現れたのは、山ほどもある銀色の円盤だった。村人たちは一斉にひれ伏した。――「{g}」は、神ではなかった。|祠の奥の岩が、音もなく横に滑った。その先には、青白く光る通路と、見たこともない計器が並んでいた。村が何百年も祀ってきた「{g}」の正体は、宇宙から来た何かだった。|祭りの太鼓が止んだ瞬間、夜空が真昼のように明るくなった。頭上に浮かぶ巨大な光の輪――{v}の人々が「{g}」と呼んできたものは、空の向こうから来ていた。');
  var ALIEN_TAKE = L('光の柱が、{a}の真上に降りてきた。{a}の足が、ゆっくりと地面を離れた。「待って、なんで――」その声ごと、{a}は空へ吸い上げられていった。|細長い指の、背の高い影が三つ、{a}の両腕をそっと取った。{a}は抵抗しなかった。いや、できなかった。光の中へ歩いていく{a}は、なぜか少しだけ笑っていた。|{a}の体が青白い光に包まれ、次の瞬間には消えていた。残ったのは、地面に落ちた{a}の片方の靴だけだった。');
  var ALIEN_REACH = L('{b}は{a}の手を掴もうとして、指先が光に触れた。熱くも冷たくもなかった。ただ、届かなかった。|{b}は{a}の名前を叫び続けた。円盤は、一度だけ瞬くように光って、空の向こうへ消えた。');
  var ALIEN_WAKE = L('朝、{n}は国道沿いのバス停で目を覚ました。村への道は、どこにもなかった。誰も、{a}がいつからいないのか、うまく思い出せなかった。|{n}は、山のふもとの田んぼの真ん中で目を覚ました。稲が、円を描くように倒れていた。|一行が気づいたとき、手元のスマートフォンの日付は、村に入った日から三日進んでいた。{a}の連絡先だけが、どの端末からも消えていた。');
  /* 宇宙エンドの後日談（結果の一行） */
  JS.LOOP.epilogue = function (S) {
    if (!S.alienEnd || S.alienEnd.none) return null;
    var a = S.P[S.alienEnd.by].name;
    return ST.fmt(ST.pick(S, L('一年後、{a}の名前で、消印のない絵葉書が届いた。写っていたのは、輪のある青い星だった。|それから毎年、{a}がいなくなった夜になると、決まって同じ流れ星が見える。|{a}のSNSが一度だけ更新された。「元気。こっちはごはんがおいしい」位置情報は、オリオン座の方角を指していた。')), { a: a });
  };
})();
