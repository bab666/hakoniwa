/* 箱庭シミュレーター: 宇宙船漂流記（2〜8人）
   故障して漂流する宇宙船。閉ざされた船の中で、船員たちは役割を分け合い、新しい星を探して一年を過ごす。
   ・一か月ずつ進む。星に辿り着けるかは毎月の運（星の見つかりやすさ・航海士の腕）。辿り着けない月は、船での暮らし・故障・宇宙での未知との遭遇
   ・辿り着ける星は一つだけ。星は「資源」「生命体（0〜3種）」「文明」の組み合わせ（それぞれ約30種・ship-res.js / ship-life.js / ship-civ.js）。
     辿り着いたあとは、着陸して探索する。成功するたびに、その項目が段階的に明らかになる（手がかり → 詳細 → 最深部）。
     詳細まで分かると珍しい物品を持ち帰り、最深部まで分かるとレポートを書く。失敗すると怪我をし、死ぬこともある
   ・船の状態（船体・動力・生命維持・食料・士気）。故障で削れ、尽きると船員が弱って死ぬ。資源の物品は船を直すのにも使える
   ・役割：船長・エンジニア・航海士・船医・科学者・生物学者・通信士・保安員・料理人
   ・R18版では、船員どうしの夜、星の花粉、異星の生き物、文明の儀式の場面がある（ship-r18.js）。
     受け攻めは HK.Pos で決め、自分で「攻め」を選んだ人を受ける側にしない。女性どうしは女性どうしの描写にする */
(function () {
  'use strict';
  var HK = window.HK, ST = HK.Story, SH = HK.SHIP = HK.SHIP || {};
  /* 文の表（ship-res / ship-life / ship-civ / ship-text）がそろっていなければ、箱庭を出さない */
  if (!ST || !SH.RES || !SH.LIFE || !SH.CIV || !SH.T) return;
  function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }
  function L(s) { return s.split('|'); }

  /* ---------- 役割 ---------- */
  var ROLES = [
    { id: 'captain', label: '船長', sk: { talk: 0.2, survive: 0.2, lead: 0.4 }, fit: function (t) { return t.lead * 0.6 + t.cp * 0.4; }, desc: '船の舵取りと、皆のまとめ役' },
    { id: 'engineer', label: 'エンジニア', sk: { repair: 0.5 }, fit: function (t) { return t.a * 0.6 + t.caution * 0.4; }, desc: '故障を直す。船の命綱' },
    { id: 'pilot', label: '航海士', sk: { nav: 0.5, survive: 0.1 }, fit: function (t) { return t.a * 0.4 + t.impulse * 0.3 + t.fc * 0.2; }, desc: '星図を読み、新しい星を探す' },
    { id: 'doctor', label: '船医', sk: { med: 0.55 }, fit: function (t) { return t.np * 0.5 + t.a * 0.4; }, desc: '怪我や病気を治す' },
    { id: 'scientist', label: '科学者', sk: { sci: 0.5, repair: 0.1 }, fit: function (t) { return t.a * 0.7 + t.cold * 0.2; }, desc: '星の資源を調べ、レポートを書く' },
    { id: 'biologist', label: '生物学者', sk: { bio: 0.55, sci: 0.15 }, fit: function (t) { return t.a * 0.4 + t.fc * 0.3 + t.np * 0.2; }, desc: '異星の生命体を調べる' },
    { id: 'comms', label: '通信士', sk: { talk: 0.45, nav: 0.2 }, fit: function (t) { return t.warmth * 0.5 + t.a * 0.3; }, desc: '信号を拾い、異星の文明と言葉を交わす' },
    { id: 'security', label: '保安員', sk: { fight: 0.5, survive: 0.3 }, fit: function (t) { return t.aggr * 0.5 + t.cp * 0.3 + t.caution * 0.2; }, desc: '危険から皆を守る' },
    { id: 'cook', label: '料理人', sk: { cook: 0.6, survive: 0.1 }, fit: function (t) { return t.np * 0.5 + t.fc * 0.4; }, desc: '乏しい食料で皆を支える' }
  ];
  var ROLE = {}; ROLES.forEach(function (r) { ROLE[r.id] = r; });
  SH.ROLES = ROLES;

  var R18ON = !!SH.R18;
  var scen = {
    id: 'ship', name: '宇宙船漂流記', kicker: 'SF・サバイバル（2〜8人）', solo: true, minCast: 2, maxCast: 8,
    desc: '故障した宇宙船で漂流する一年。閉ざされた船の中で役割を分け合い、新しい星を探す。星には資源・生命体・文明があり、探検するほど正体が明らかになる。辿り着けるのは、ただ一つの星だけ。',
    note: '※死の描写を含みます。',
    unit: '月', simulate: function (input) { return run(input); },
    castHint: '2〜8人。「役割」で船長・エンジニア・航海士・船医・科学者・生物学者・通信士・保安員・料理人を決められます（決めなければ気質から）。',
    env: [
      { id: 'find', label: '星の見つかりやすさ', min: 0, max: 100, def: 40, lo: 'ほとんど見つからない', hi: 'すぐ見つかる', desc: '毎月、星に辿り着けるかどうかの運。航海士と通信士の腕でも上がる' },
      { id: 'danger', label: '宇宙の過酷さ', min: 0, max: 100, def: 45, lo: '穏やか', hi: '過酷', desc: '故障や事故、探索の危険の起きやすさ' },
      { id: 'supply', label: '積んでいる物資', min: 0, max: 100, def: 50, lo: 'ぎりぎり', hi: '潤沢', desc: '食料と修理部品の量' },
      { id: 'contact', label: '未知との遭遇', min: 0, max: 100, def: 50, lo: 'めったにない', hi: 'たびたび', desc: '漂流中に、不思議なものに出会う頻度' }
    ].concat(R18ON ? [{ id: 'slewd', label: '夜の出来事の起こりやすさ', min: 0, max: 100, def: 40, lo: '起きない', hi: 'たびたび', desc: '船員どうしの夜、星の花粉、異星の生き物、文明の儀式の起きやすさ' }] : []),
    stats: [{ id: 'hp', label: '体力', desc: '怪我や飢え、探索の危険への強さ' }, { id: 'tech', label: '技術', desc: '修理・航法・調査の腕' }],
    perFields: [{ id: 'role', label: '役割', auto: 'おまかせ（気質から）', options: ROLES.map(function (r) { return { id: r.id, label: r.label }; }) }],
    actions: [], goals: [], events: []
  };
  HK.SCENARIOS.ship = scen;
  var at = HK.SCEN_ORDER.indexOf('island');
  HK.SCEN_ORDER.splice(at >= 0 ? at + 1 : HK.SCEN_ORDER.length, 0, 'ship');

  /* ---------- 関係 ---------- */
  var W = { lover: 1, mate: 1, fated: 1, almost: 0.8, fwb: 0.45, sibling: 0.8, sibprot: 0.95, sibclose: 0.9, parent: 0.95, pparent: 0.9, best: 0.75, buddy: 0.8, childhood: 0.7, friend: 0.5, mentor: 0.6, master: 0.6, teacher: 0.5, senpai: 0.4, colleague: 0.3, acq: 0.1, ex: 0.3, rival: -0.3, enemy: -0.7, sibbad: -0.15, bad: -0.4 };
  var LOVE = /^(lover|mate|fated|almost|fwb|crush)$/, FAMILY = /^(sibling|sibprot|sibclose|sibbad|parent|pparent)$/;
  function rk(a, b) { return a.i < b.i ? a.i + '-' + b.i : b.i + '-' + a.i; }
  function ties(S, a, b) { return S.ties.filter(function (t) { return (t.a === a.i && t.b === b.i) || (t.a === b.i && t.b === a.i); }); }
  function bond(S, a, b) {
    var best = 0, neg = 0;
    ties(S, a, b).forEach(function (t) { var w = t.type === 'crush' ? (t.a === a.i ? 0.85 : 0.15) : W[t.type] != null ? W[t.type] : 0.1; if (w > best) best = w; if (w < neg) neg = w; });
    return clamp((best > 0 ? best + neg * 0.3 : neg) + (S.relD[rk(a, b)] || 0), -1, 1.2);
  }
  function lover(S, a, b) { return ties(S, a, b).some(function (t) { return LOVE.test(t.type); }) || !!S.rom[rk(a, b)]; }
  function family(S, a, b) { return ties(S, a, b).some(function (t) { return HK.tieNoLove ? HK.tieNoLove(t) : FAMILY.test(t.type); }); }
  function setRel(S, a, b, d) { var k = rk(a, b); S.relD[k] = clamp((S.relD[k] || 0) + d, -1, 1); }
  /* 出来事の記録（関係図のラベルに使う） */
  /* 気質：船長は使命感でストレスを抱えにくく、揉めごとを収める側に回る。機嫌取りは人の気持ちを優先して、自分の疲れを溜め込む */
  function capt(p) { return p.role === 'captain'; }
  function pleaser(p) { return p.tr.ac > 0.55 && (p.tr.np > 0.45 || p.tr.warmth > 0.5); }
  function stress(p, d) { p.m.st = clamp((p.m.st || 0) + (d > 0 ? d * (capt(p) ? 0.6 : 1) * (pleaser(p) ? 1.2 : 1) : d), 0, 100); }
  function mark(S, a, b, kind) { var k = rk(a, b), e = S.relEv[k] = S.relEv[k] || {}; e[kind] = (e[kind] || 0) + 1; }

  /* ---------- 能力 ---------- */
  function role(p) { return ROLE[p.role] || ROLE.captain; }
  function skill(p, type) {
    var t = p.tr, tech = (p.stats.tech || 3), base = {
      repair: t.a * 0.35 + t.caution * 0.2 + tech * 0.05, nav: t.a * 0.35 + t.fc * 0.1 + tech * 0.04, med: t.np * 0.25 + t.a * 0.2,
      sci: t.a * 0.45 + tech * 0.04, bio: t.a * 0.25 + t.fc * 0.2 + t.np * 0.1, talk: t.warmth * 0.4 + t.np * 0.2, fight: t.aggr * 0.3 + t.cp * 0.2 + (p.stats.hp || 3) * 0.04,
      survive: t.caution * 0.3 + t.cp * 0.15 + (p.stats.hp || 3) * 0.04, cook: t.np * 0.3 + t.fc * 0.2, lead: t.lead * 0.5
    }[type] || 0.2;
    return clamp(base + ((role(p).sk || {})[type] || 0) - (p.m.hp < 40 ? 0.1 : 0), 0, 1.3);
  }
  /* 置き去り・誘拐・遭難で船を離れている人は、船の暮らしには加わらない */
  function alive(p) { return p.alive && !p.away; }
  function live(S) { return S.P.filter(alive); }
  function best(S, type, ex) { return live(S).filter(function (p) { return !ex || ex.indexOf(p) < 0; }).sort(function (a, b) { return skill(b, type) - skill(a, type); })[0]; }
  function names(l) { return l.map(function (p) { return p.name; }).join(l.length > 2 ? '・' : 'と'); }
  function pk(S, a) { return ST.pick(S, a); }
  function F(t, m) { return ST.fmt(t, m || {}); }

  /* ---------- 星を作る ---------- */
  var GREEK = ['α', 'β', 'γ', 'δ', 'ε', 'ζ', 'η', 'θ'];
  /* 星の名前：SF映画の惑星のような響きで、書き方を何通りかに散らす */
  var PN_CAT = ['ケプラー', 'グリーゼ', 'ウルフ', 'ロス', 'ラカイユ', 'ティーガーデン', 'ラランド', 'ルイテン', 'カプタイン', 'ヴァン・マーネン'];
  var PN_CODE = ['LV-', 'PX-', 'KX-', 'RX-', 'XT-', 'NV-', 'ZR-', 'HX-', 'TQ-', 'SR-'];
  var PN_MYTH = ['タルタロス', 'ヘリオス', 'ニュクス', 'セレス', 'オルフェウス', 'ヴァルハラ', 'イシュタル', 'アルカディア', 'ネメシス', 'ハイペリオン', 'エレボス', 'ティアマト', 'アスフォデル', 'ミネルヴァ', 'ヨトゥン', 'ニブルヘイム', 'エリュシオン', 'アヴァロン', 'ケツァル', 'ベレニケ', 'セドナ', 'カリスト', 'オベロン', 'ラグナ', 'ゼフィロス', 'アトラス'];
  var PN_ROMAN = ['Ⅱ', 'Ⅲ', 'Ⅳ', 'Ⅴ', 'Ⅵ', 'Ⅶ', 'Ⅸ', 'Ⅻ'];
  var PN_LETTER = ['b', 'c', 'd', 'e', 'f', 'g', 'h'];
  var PN_SUR = ['新', '第二の', ''];
  var PN_WORD = ['ガイア', 'エデン', 'テラ', 'ホープ', 'ヘイヴン', 'ソラリス', 'オアシス'];
  /* 不思議な響きの名前（「ボボボボタ星」など）と、「赤の荒野」のような色の名前 */
  var PN_KANA = ['ボ', 'バ', 'ポ', 'プ', 'ペ', 'ゾ', 'ズ', 'ギ', 'ガ', 'モ', 'ム', 'ヌ', 'ニ', 'ル', 'ラ', 'リ', 'タ', 'ト', 'ピ', 'ヨ', 'ケ', 'キ', 'ド', 'ダ', 'パ', 'ミ', 'メ', 'ノ', 'ヒ', 'フ'];
  var PN_COLOR = ['赤', '青', '白', '黒', '金', '銀', '翠', '紫', '灰', '琥珀', '瑠璃', '薄紅'];
  var PN_NOUN = ['荒野', '沈黙', '揺りかご', '涙', '庭', '果て', '眠り', '砂時計', '祈り', '迷宮', '微笑', '傷跡', '鏡', '花冠', '残響', '海'];
  function oddName(rng) {
    var k = function () { return PN_KANA[rng.int(PN_KANA.length)]; }, a = k(), b = k(), c = k();
    var pat = rng.int(8);
    var n = pat === 0 ? a + a + a + a + b : pat === 1 ? a + a + b : pat === 2 ? a + b + a + b : pat === 3 ? a + a + b + b : pat === 4 ? a + b + b + a : pat === 5 ? a + 'ン' + b + 'ン' : pat === 6 ? a + 'ー' + b + c : a + b + '・' + c + c;
    return n + '星';
  }
  /* 船員が自分の名前をつける：飾りの言葉はいちばん強い気質（エゴグラム）で変わる */
  var PN_SELF = {
    CP: ['グレート', 'キング', 'インペリアル', '鉄の', '偉大なる'],
    NP: ['スウィート', 'マザー', 'やさしい', 'ハッピー', 'ぬくもりの'],
    A: ['ドクター', 'ロジカル', 'プロフェッサー', '観測者', '第一'],
    FC: ['プリティ', 'スーパー', 'ミラクル', 'キラキラ', 'ファンキー'],
    AC: ['リトル', 'ちいさな', 'ひっそり', 'おずおず', 'ささやかな']
  };
  function selfName(rng, p) {
    var top = p.eg && HK.egoType ? HK.egoType(p.eg).top : 'FC', L0 = PN_SELF[top] || PN_SELF.FC, w = L0[rng.int(L0.length)];
    return { name: (/^[ァ-ヶー]+$/.test(w) ? w + '・' : w) + p.name + '星', top: top, deco: w };
  }
  /* 名前をつけるのは見つけた船員。どんな名前にするかで、名づけの一言も変わる */
  function planetName(rng, namer) {
    var r = rng();
    if (namer && r < 0.12) { var sn = selfName(rng, namer); return { name: sn.name, how: 'self', deco: sn.deco, top: sn.top }; }
    if (r < 0.28) return { name: PN_CAT[rng.int(PN_CAT.length)] + (rng() < 0.5 ? '-' : '') + (10 + rng.int(990)) + PN_LETTER[rng.int(PN_LETTER.length)], how: 'cat' };
    if (r < 0.42) return { name: PN_CODE[rng.int(PN_CODE.length)] + (100 + rng.int(900)), how: 'cat' };
    if (r < 0.58) return { name: PN_MYTH[rng.int(PN_MYTH.length)] + (rng() < 0.7 ? PN_ROMAN[rng.int(PN_ROMAN.length)] : ''), how: 'myth' };
    if (r < 0.65) return { name: PN_SUR[rng.int(PN_SUR.length)] + PN_WORD[rng.int(PN_WORD.length)] + (rng() < 0.5 ? '-' + (2 + rng.int(8)) : ''), how: 'hope' };
    if (r < 0.82) return { name: oddName(rng), how: 'odd' };
    if (r < 0.95) return { name: PN_COLOR[rng.int(PN_COLOR.length)] + 'の' + PN_NOUN[rng.int(PN_NOUN.length)], how: 'color' };
    return { name: PN_MYTH[rng.int(PN_MYTH.length)] + '・' + GREEK[rng.int(GREEK.length)], how: 'myth' };
  }
  var NAMING = {
    cat: L('{a}は、星図の決まりどおりに「{x}」と登録した。|{a}は、航法記録の番号をそのまま使って「{x}」と名づけた。{a}「覚えやすさより、正確さが大事だから」'),
    myth: L('{a}は、古い神話から名を借りて「{x}」と名づけた。|{a}は、子どもの頃に読んだ星の物語を思い出し、その星を「{x}」と呼ぶことにした。'),
    hope: L('{a}は、願いを込めて「{x}」と名づけた。ここが、新しい故郷になるようにと。|{a}は少し照れながら「{x}」と書き込んだ。誰も笑わなかった。'),
    odd: L('{a}は、星を見た瞬間に浮かんだ響きのまま「{x}」と名づけた。{a}「そういう顔をしてたから」――意味を訊かれても、それしか答えなかった。|{a}が命名欄に「{x}」と書き込んだ。{b}は二度見したが、{a}はもう次の観測に移っていた。|{a}の口から、なぜか「{x}」という名前がこぼれ落ちた。言ってみると、もうそれ以外の名前は考えられなかった。'),
    color: L('{a}は、窓いっぱいに広がる星の色を見つめて、「{x}」と名づけた。|{a}は星の第一印象をそのまま名前にした。「{x}」。誰も異を唱えなかった。')
  };
  var NAMING_SELF = {
    CP: L('{a}は胸を張って「{x}」と命名した。{a}「見つけた者が名をつける。当然の権利だ」{b}は呆れたが、反対はしなかった。|{a}は堂々と「{x}」と書き込んだ。{b}の抗議は、{a}のひと睨みで静かになった。'),
    NP: L('{a}は少し照れながら「{x}」と名づけた。{a}「みんなが帰ってこられる場所になってほしいから」{b}は笑って、そのまま採用した。|{a}は命名欄に「{x}」と書いて、すぐに消そうとした。{a}「やっぱり変かな」{b}がその手を止めた。'),
    A: L('{a}は「{x}」と登録した。{a}「発見者の名を冠するのは、天文学の慣例だから」{b}は、{a}の耳が少し赤いのに気づいていた。|{a}は事務的な口調で「{x}」と命名した。ただ、記録を保存したあと、こっそり三回読み返していた。'),
    FC: L('{a}「決めた！　この星は今日から{x}！」{b}が「自分の名前をつけるのはずるい」と言ったが、{a}はもう星に向かって手を振っていた。|{a}はうきうきと命名欄に「{x}」と打ち込み、勝手に記念写真まで撮った。{b}は頭を抱えたが、結局その名前で呼ぶことになった。'),
    AC: L('{a}「だ、だめならいいんだけど……{x}って、どうかな」{b}が「いいじゃん」と言うと、{a}は真っ赤になってうつむいた。|{a}は誰にも言わずに、命名欄にそっと「{x}」と書き込んだ。{b}が気づいたのは、星に着いてからだった。')
  };
  function makePlanet(S, namer) {
    var rng = S.rng, T = SH.RES || [], LF = SH.LIFE || [], CV = SH.CIV || [];
    var res = rng.pick(T), civ = rng.pick(CV), n = rng() < 0.22 ? 0 : rng() < 0.55 ? 1 : rng() < 0.75 ? 2 : 3;
    var life = [], pool = LF.slice();
    for (var k = 0; k < n && pool.length; k++) { var x = pool.splice(rng.int(pool.length), 1)[0]; life.push({ d: x, st: 0 }); }
    var pn = planetName(rng, namer), name = pn.name;
    var rare = clamp(Math.round((res.rare + civ.rare + (life.length ? Math.max.apply(null, life.map(function (l) { return l.d.rare; })) : 1)) / 3 + (life.length >= 3 ? 0.6 : life.length === 2 ? 0.3 : 0)), 1, 5);
    return { name: name, naming: pn, res: { d: res, st: 0 }, civ: { d: civ, st: 0 }, life: life, rare: rare, at: 0 };
  }
  function stars(n) { return '★★★★★'.slice(0, n) + '☆☆☆☆☆'.slice(0, 5 - n); }
  /* 探索の対象：まだ分かっていないものほど選ばれやすい */
  function targets(S) {
    var Pn = S.planet, out = [{ kind: 'res', o: Pn.res }].concat(Pn.life.map(function (l) { return { kind: 'life', o: l }; }));
    if (Pn.civ.d.state !== 'none' || Pn.civ.st < 3) out.push({ kind: 'civ', o: Pn.civ });
    return out.filter(function (x) { return x.o.st < 3; });
  }
  var STAGE = ['', 'hint', 'detail', 'deep'], LIFE_STAGE = ['', 'look', 'habit', 'deep'];
  var KIND_JP = { res: '資源', life: '生命体', civ: '文明' };
  var USE_JP = { hull: '船体の修理', power: '動力', o2: '生命維持', food: '食料', med: '薬', none: '研究' };
  var LIFE_JP = { friendly: '人懐っこい', neutral: '無関心', hostile: '攻撃的', symbiotic: '共生する', parasite: '寄生する', plant: '植物・菌類' };
  var CIV_JP = { none: '文明なし', ruins: '遺跡', primitive: '素朴な文明', living: '現役の文明', advanced: '高度文明', transcendent: '理解を超えた存在' };

  function run(input) {
    var S = ST.state(input, 'ship'), rng = S.rng, env = S.env, P = S.P, T = SH.T;
    /* 結果に「最も心を寄せた相手」とエゴグラムとの比較を出す（solo-story-kit.js） */
    S.egoNotes = true; S.bondFn = bond;
    S.ties = (input.ties || []).filter(function (t) { return t.a !== t.b && t.a < P.length && t.b < P.length; });
    S.relD = {}; S.relEv = {}; S.rom = {}; S.jeal = []; S.left = []; S.saved = []; S.bday = {}; S.items = []; S.reports = []; S.planet = null; S.deaths = [];
    var sup = env.supply / 100;
    S.ship = { hull: 85, power: 75 + sup * 15, o2: 85, food: 45 + sup * 45, morale: 60 };
    /* ---------- 役割 ---------- */
    var taken = {};
    P.forEach(function (p) {
      var want = (((input.perChar && input.perChar[p.i]) || {}).pick || {}).role;
      p.alive = true; p.m = { hp: 70 + (p.stats.hp || 3) * 6, fear: 15 + p.tr.ac * 10, find: 0, st: 10 + p.tr.ac * 10 }; p.cnt = { find: 0, item: 0, report: 0, fix: 0 }; p.notes = p.notes || [];
      if (ROLE[want]) { p.role = want; p.picked = true; taken[want] = (taken[want] || 0) + 1; }
    });
    /* おまかせは、まだ誰もいない大事な役割から気質で埋める */
    var order = ['captain', 'engineer', 'pilot', 'doctor', 'scientist', 'biologist', 'comms', 'security', 'cook'];
    P.filter(function (p) { return !p.role; }).forEach(function (p) {
      var open = order.filter(function (r) { return !taken[r]; });
      var list = open.length ? open : order;
      var r = list.slice().sort(function (x, y) { return ROLE[y].fit(p.tr) - ROLE[x].fit(p.tr) + (open.length ? (list.indexOf(x) - list.indexOf(y)) * 0.04 : 0); })[0];
      p.role = r; taken[r] = (taken[r] || 0) + 1;
    });
    P.forEach(function (p) { p.roleLabel = ROLE[p.role].label; });
    var keys = ['hp', 'fear', 'find', 'st'];

    ST.step(S, '漂流のはじまり');
    ST.say(S, { kind: 'phase', text: pk(S, L('警報が鳴り止んだとき、船はもう航路を外れていた。主機関は沈黙し、救難信号に応える声はない。|小惑星帯をかすめた衝撃で、船は航路を失った。窓の外には、見知らぬ星座だけが広がっていた。|ワープの失敗で、船は星図にない宙域に投げ出された。帰り道は、もう分からなかった。')) + names(P) + 'は、新しい星を探して漂い続けることに決めた。' });
    P.forEach(function (p) { ST.sayB(S, { actors: [p], tag: p.roleLabel, text: p.name + '（' + p.roleLabel + '）――' + ROLE[p.role].desc + '。', why: '役割：' + p.roleLabel + (p.picked ? '（指定）' : '（気質から）') }, p.name + 'は' + p.roleLabel); });
    ST.snap(S, keys);

    for (var m = 1; m <= 12; m++) {
      S.m = m;
      if (!live(S).length) break;
      ST.step(S, m + 'か月目');
      ST.budget(S, 4 + Math.ceil(live(S).length / 2));
      if (rng() < 0.35) ST.say(S, { kind: 'phase', text: pk(S, T.MONTH) });
      if (!S.planet) {
        searchPlanet(S, m);
        if (!S.planet && rng() < env.contact / 100 * 0.45) space(S);
      } else if (S.planet.at < m) explore(S, m);
      if (rng() < 0.22 + env.danger / 100 * 0.35) trouble(S);
      doom(S, m);
      crisis(S);
      shipLife(S);
      /* 執着（ヤンデレ。obsess-story.js） */
      if (HK.Obsess && HK.Obsess.storyTick) { var ob = HK.Obsess.storyTick(S, live(S), { rate: 0.3 }); if (ob) { ST.say(S, { actors: ob.actors, tag: ob.tag, kind: ob.kind, text: ob.text, why: ob.why, mag: ob.mag }); setRel(S, ob.actors[0], ob.actors[1], 0.04); mark(S, ob.actors[0], ob.actors[1], 'jealous'); } }
      if (R18ON && r18on(S)) nightR18(S);
      upkeep(S, m);
      ST.flushShort(S, 'ほかに：');
      ST.snap(S, keys);
    }
    return finish(S, input);
  }

  /* ---------- 星を探す ---------- */
  function searchPlanet(S, m) {
    var rng = S.rng, nav = best(S, 'nav'), com = best(S, 'talk', nav ? [nav] : []);
    var ch = 0.01 + S.env.find / 100 * 0.14 + (nav ? skill(nav, 'nav') * 0.05 : 0) + (com ? skill(com, 'talk') * 0.02 : 0) + (S.ship.power > 40 ? 0.02 : -0.02);
    if (rng() >= ch) {
      if (rng() < 0.5) ST.sayB(S, { kind: 'phase', text: pk(S, SH.T.DRIFT), why: 'この月は、星に辿り着けなかった（運 ' + Math.round(ch * 100) + '%）' }, '星は見つからない');
      return;
    }
    var a = nav || live(S)[0];
    var Pn = S.planet = makePlanet(S, a); Pn.at = m;
    /* 名づけ：見つけた船員が名前をつける（ときどき自分の名前をつける） */
    var nb = live(S).filter(function (q) { return q !== a; })[0], nv = { a: a.name, b: nb ? nb.name : '仲間', x: Pn.name };
    var nmT = Pn.naming.how === 'self' ? F(pk(S, NAMING_SELF[Pn.naming.top] || NAMING_SELF.FC), nv) : F(pk(S, NAMING[Pn.naming.how]), nv);
    var o = ST.say(S, { actors: [a], tag: '星を発見', kind: 'climax', text: F(pk(S, SH.T.FOUND), { a: a.name, x: Pn.name }).split('惑星' + Pn.name).join(/星$/.test(Pn.name) ? Pn.name : '惑星' + Pn.name).split('星' + Pn.name).join(/星$/.test(Pn.name) ? Pn.name : '星' + Pn.name) + nmT + F(pk(S, SH.T.ARRIVE), { x: Pn.name }) + ' ' + Pn.res.d.sky + ' ' + (Pn.civ.d.sky || ''), why: m + 'か月目に、星に辿り着いた（運 ' + Math.round(ch * 100) + '%・' + a.name + 'の航法）。名づけたのは' + a.name + (Pn.naming.how === 'self' ? '（自分の名前に、' + Pn.naming.top + '優位らしい飾り「' + Pn.naming.deco + '」をつけた）' : '') + '。珍しさ ' + stars(Pn.rare) + '（まだ探索していないので、中身は分からない）', mag: 40 });
    ST.key(S, o, Pn.name + 'を発見した');
    a.cnt.find++;
  }

  /* ---------- 星を探索する ---------- */
  function team(S, kind) {
    var lead = kind === 'res' ? best(S, 'sci') : kind === 'life' ? best(S, 'bio') : best(S, 'talk');
    var esc = best(S, 'fight', [lead]), out = [lead];
    if (esc && live(S).length > 2 && S.rng() < 0.75) out.push(esc);
    if (live(S).length > 4 && S.rng() < 0.4) { var x = live(S).filter(function (p) { return out.indexOf(p) < 0; }); if (x.length) out.push(S.rng.pick(x)); }
    return out.filter(Boolean);
  }
  function explore(S, m) {
    var rng = S.rng, Pn = S.planet, nEx = live(S).length >= 4 && rng() < 0.5 ? 2 : 1;
    for (var e = 0; e < nEx; e++) {
      var tg = targets(S);
      if (!tg.length) { if (e === 0) ST.sayB(S, { kind: 'phase', text: Pn.name + 'の調査は、もう終わっていた。一行は物資を補給し、船を整えて過ごした。', why: '' }, '補給の月'); S.ship.food = clamp(S.ship.food + 8, 0, 100); return; }
      var x = HK.weighted(rng, tg, function (q) { return 1.3 - q.o.st * 0.35; });
      var tm = team(S, x.kind);
      if (!tm.length) return;
      var a = tm[0], d = x.o.d, stg = x.o.st + 1;
      var sk = skill(a, x.kind === 'res' ? 'sci' : x.kind === 'life' ? 'bio' : 'talk') + tm.slice(1).reduce(function (s0, q) { return s0 + skill(q, 'survive') * 0.3; }, 0);
      var diff = 0.35 + d.rare * 0.07 + stg * 0.08 + (x.kind === 'life' && d.kind === 'hostile' ? 0.12 : 0) + (x.kind === 'civ' && d.state === 'advanced' ? 0.08 : 0) + S.env.danger / 100 * 0.12;
      var ok = sk + rng() * 0.55 >= diff;
      var t = F(pk(S, SH.T.LAND), { a: a.name, x: Pn.name }) + (tm.length > 1 ? names(tm.slice(1)) + 'も同行した。' : '');
      /* 見つけにくい生命体（電磁波・気体・位相など。ship-life2.js の stealth）：まだ見つけていないうちは、腕がよくても気づけないことがある */
      if (x.kind === 'life' && !x.o.st && d.stealth && d.miss && rng() < d.stealth * (1.15 - sk * 0.35)) {
        x.o.missed = (x.o.missed || 0) + 1;
        a.m.fear = clamp(a.m.fear + 4, 0, 100);
        ST.say(S, { actors: tm, tag: '探索：何も見つからない', text: t + F(pk(S, d.miss), { a: a.name, x: Pn.name }), why: '何かがいる気配はあったが、正体に気づけなかった（見つけにくさ ' + Math.round(d.stealth * 100) + '・空振り ' + x.o.missed + '回目）', mag: 14 });
        if (R18ON && r18on(S) && rng() < S.env.slewd / 100 * 0.3) xeno(S, a, d, 'invade', true);
        continue;
      }
      var lab = KIND_JP[x.kind] + (x.kind === 'life' ? '「' + (x.o.st ? d.name : '未知の生命体') + '」' : '');
      if (ok) {
        x.o.st = stg;
        var key = x.kind === 'life' ? LIFE_STAGE[stg] : STAGE[stg];
        t += F(d[key], { a: a.name, x: Pn.name });
        a.cnt.find++; a.m.find++;
        if (stg === 2) {
          if (x.kind !== 'res' && d.good) t += F(d.good, { a: a.name, x: Pn.name });
          if (d.item) { S.items.push({ name: d.item, desc: d.itemDesc || '', by: a.name, kind: x.kind }); a.cnt.item++; t += '――' + a.name + 'は『' + d.item + '』を船に持ち帰った。'; useItem(S, d, x.kind); }
        }
        var o = ST.say(S, { actors: tm, tag: '探索：' + lab, text: t, why: KIND_JP[x.kind] + 'の調査に成功（' + ['', '手がかり', '詳細', '最深部'][stg] + 'まで判明）／' + a.name + 'の' + (x.kind === 'res' ? '科学' : x.kind === 'life' ? '生物学' : '交渉') + 'の腕 ' + Math.round(sk * 100) + '・難しさ ' + Math.round(diff * 100), mag: stg === 3 ? 34 : 22 });
        if (stg === 3) {
          var wr = best(S, x.kind === 'life' ? 'bio' : 'sci') || a;
          S.reports.push({ title: d.report, by: wr.name }); wr.cnt.report++;
          ST.say(S, { actors: [wr], tag: 'レポート', text: wr.name + 'は、船に戻るとすぐに端末へ向かった。何日もかけて、レポート『' + d.report + '』を書き上げた。', why: KIND_JP[x.kind] + 'の最深部まで明らかになった' });
          ST.key(S, o, d.name + 'の正体が明らかになった');
        } else if (stg === 1 && x.kind === 'life') ST.key(S, o, '生命体「' + d.name + '」を見つけた');
        if (R18ON && r18on(S) && x.kind === 'life' && rng() < S.env.slewd / 100 * 0.35) alienR18(S, a, d);
        if (x.kind === 'life' && /parasite|symbiotic/.test(d.kind) && rng() < 0.2) infect(S, a, d.name);
      } else {
        var hurt = 12 + rng.int(18) + (x.kind === 'life' && d.kind === 'hostile' ? 8 : 0);
        var dead = rng() < 0.03 + S.env.danger / 100 * 0.2 + d.rare * 0.02 + (x.kind === 'life' && d.kind === 'hostile' ? 0.08 : 0);
        var v = tm.length > 1 && rng() < 0.4 ? tm[1] : a;
        if (dead) { die(S, v, Pn.name + 'の' + KIND_JP[x.kind] + 'の調査中に', t + F(d.death, { v: v.name, w: (tm.filter(function (q) { return q !== v; })[0] || { name: '仲間' }).name, x: Pn.name })); continue; }
        a.m.hp = clamp(a.m.hp - hurt, 1, 100); a.m.fear = clamp(a.m.fear + 10, 0, 100);
        t += F(x.kind === 'res' ? d.trouble : d.bad, { a: a.name, x: Pn.name });
        ST.say(S, { actors: tm, tag: '探索失敗', text: t, why: lab + 'の調査に失敗（' + a.name + 'の体力 -' + hurt + '）', mag: 20 });
        heal(S, a);
        if (x.kind === 'life' && rng() < 0.35) infect(S, a, d.name);
        else if (rng() < 0.12 + S.env.danger / 100 * 0.1) { lose(S, a); continue; }
      }
      if (rng() < 0.4) ST.sayB(S, { actors: tm, text: F(pk(S, SH.T.BACK), { a: a.name, x: Pn.name }), why: '' }, names(tm) + 'が帰船');
    }
  }
  /* 持ち帰った資源で、船を直す */
  function useItem(S, d, kind) {
    if (kind !== 'res' || !d.use || d.use === 'none') return;
    var sp = S.ship, k = { hull: 'hull', power: 'power', o2: 'o2', food: 'food' }[d.use];
    if (k) sp[k] = clamp(sp[k] + 25, 0, 100);
    if (d.use === 'med') live(S).forEach(function (p) { p.m.hp = clamp(p.m.hp + 15, 0, 100); });
  }

  /* ---------- 船の故障 ---------- */
  function trouble(S) {
    var rng = S.rng, tr = rng.pick(SH.T.TROUBLE), fx = best(S, 'repair');
    if (!fx) return;
    var ok = skill(fx, 'repair') + rng() * 0.5 >= 0.45 + S.env.danger / 100 * 0.25;
    var t = tr.intro;
    if (ok) {
      fx.cnt.fix++;
      t += F(tr.ok, { a: fx.name });
      ST.say(S, { actors: [fx], tag: '故障：' + tr.name, trouble: true, text: t, why: fx.name + 'が直した（修理の腕 ' + Math.round(skill(fx, 'repair') * 100) + '）', mag: 18 });
      return;
    }
    var sp = S.ship, dmg = 15 + rng.int(15);
    if (tr.stat === 'crew') live(S).forEach(function (p) { p.m.hp = clamp(p.m.hp - 8, 1, 100); });
    else if (sp[tr.stat] != null) sp[tr.stat] = clamp(sp[tr.stat] - dmg, 0, 100);
    S.ship.morale = clamp(S.ship.morale - 6, 0, 100);
    /* 残りが二人以下なら、死に至るほどの事故は起きにくい（全滅は大きなトラブルの doom で） */
    if (rng() < (0.06 + S.env.danger / 100 * 0.32) * (live(S).length <= 2 ? 0.35 : live(S).length === 3 ? 0.7 : 1)) {
      var v = rng.pick(live(S)), w = live(S).filter(function (q) { return q !== v; })[0];
      return die(S, v, tr.name + 'で', t + F(tr.ng, { a: fx.name }) + F(tr.death, { v: v.name, w: w ? w.name : '仲間' }));
    }
    ST.say(S, { actors: [fx], tag: '故障：' + tr.name, trouble: true, text: t + F(tr.ng, { a: fx.name }), why: '修理に失敗（' + ({ hull: '船体', power: '動力', o2: '生命維持', food: '食料', crew: '全員の体力' }[tr.stat] || '') + 'が減った）', mag: 22 });
  }

  /* ---------- 船を滅ぼしかねない大きなトラブル（全滅もありうる。一回の漂流で一度まで） ----------
     兆しの翌月から立ち向かい、二度続けて失敗すると全滅する。人数が少ないと、もともと全滅しやすいので起きにくくする */
  function doom(S, m) {
    var rng = S.rng, D = S.doom, L0 = live(S), DM = SH.DOOM;
    if (!DM || !L0.length) return;
    var x = S.planet ? S.planet.name : '';
    if (!D) {
      if (m < 2 || S.doomDone) return;
      var n = S.P.length, k = n >= 5 ? 1.5 : n === 4 ? 0.8 : n === 3 ? 0.3 : 0;
      if (rng() >= (0.012 + S.env.danger / 100 * 0.02) * k) return;
      var d = rng.pick(DM.filter(function (y) { return !y.planet || S.planet; }));
      S.doom = { d: d, tries: 0, at: m };
      S.ship.morale = clamp(S.ship.morale - 10, 0, 100);
      L0.forEach(function (q) { stress(q, 12); q.m.fear = clamp(q.m.fear + 12, 0, 100); });
      var o0 = ST.say(S, { actors: [], tag: '危機：' + d.name, kind: 'climax', trouble: true, doom: d.id, text: F(pk(S, d.start), { x: x }), why: '船そのものを滅ぼしかねないトラブル（宇宙の過酷さ ' + S.env.danger + '）。食い止められなければ、全員の命はない', mag: 40 });
      ST.key(S, o0, d.name + 'の兆し');
      return;
    }
    if (D.at === m) return;
    var a = best(S, D.d.skill) || L0[0], help = L0.filter(function (q) { return q !== a && skill(q, D.d.skill) >= 0.45; }).length;
    var ch = 0.38 + skill(a, D.d.skill) * 0.3 + Math.min(help, 2) * 0.05 - S.env.danger / 100 * 0.1 - D.tries * 0.05;
    D.tries++;
    var SKJ = { repair: '修理', med: '医療', sci: '科学', fight: '戦い' }[D.d.skill] || '';
    if (rng() < ch) {
      S.doom = null; S.doomDone = true; a.cnt.fix++;
      S.ship.morale = clamp(S.ship.morale + 12, 0, 100);
      L0.forEach(function (q) { if (q !== a) setRel(S, q, a, 0.1); stress(q, -8); });
      var o1 = ST.say(S, { actors: [a], tag: '危機を回避：' + D.d.name, kind: 'climax', trouble: true, text: F(pk(S, D.d.ok), { a: a.name, x: x }), why: a.name + 'の' + SKJ + 'の腕（' + Math.round(skill(a, D.d.skill) * 100) + '）' + (help ? '・手伝える仲間 ' + help + '人' : '') + '（成功の見込み ' + Math.round(ch * 100) + '%）', mag: 40 });
      ST.key(S, o1, a.name + 'が' + D.d.name + 'を食い止めた');
      return;
    }
    if (D.tries < 2) {
      S.ship.morale = clamp(S.ship.morale - 8, 0, 100);
      L0.forEach(function (q) { stress(q, 10); });
      ST.say(S, { actors: [a], tag: '危機：' + D.d.name, kind: 'climax', trouble: true, text: F(pk(S, D.d.ng), { a: a.name, x: x }), why: a.name + 'が立ち向かったが、食い止められなかった（成功の見込み ' + Math.round(ch * 100) + '%）。次で止められなければ終わりだ', mag: 35 });
      return;
    }
    var all = L0.slice();
    var o2 = ST.say(S, { actors: all.map(function (q) { return q; }), tag: '全滅：' + D.d.name, kind: 'climax', trouble: true, doom: D.d.id, text: F(pk(S, D.d.ng), { a: a.name, x: x }) + F(pk(S, D.d.end), { n: names(all), x: x }), why: '二度目も食い止められなかった（成功の見込み ' + Math.round(ch * 100) + '%）', mag: 70 });
    ST.key(S, o2, D.d.name + 'で全滅');
    all.forEach(function (q) { q.alive = false; q.fate = '死亡（' + m + 'か月目・' + D.d.name + '）'; S.deaths.push(q); });
    S.doom = null; S.doomDone = true; S.wipeBy = D.d;
  }

  /* ---------- 宇宙での遭遇 ---------- */
  function space(S) {
    var rng = S.rng, en = rng.pick(SH.T.SPACE), a = best(S, rng() < 0.5 ? 'sci' : 'nav') || live(S)[0];
    var ok = skill(a, 'sci') * 0.5 + skill(a, 'nav') * 0.5 + rng() * 0.6 >= 0.5;
    var t = en.intro;
    if (ok) {
      t += F(en.ok, { a: a.name });
      if (en.item) { S.items.push({ name: en.item, desc: en.itemDesc || '', by: a.name, kind: 'space' }); a.cnt.item++; t += '――『' + en.item + '』を手に入れた。'; }
      var o = ST.say(S, { actors: [a], tag: '未知との遭遇：' + en.name, text: t, why: a.name + 'の判断（科学・航法）', mag: 26 });
      return ST.key(S, o, en.name + 'に出会った');
    }
    if (en.death && rng() < 0.15 + S.env.danger / 100 * 0.15) { var v = rng.pick(live(S)); return die(S, v, en.name + 'に遭遇して', t + F(en.ng, { a: a.name }) + F(en.death, { v: v.name, w: a === v ? '仲間' : a.name })); }
    S.ship.hull = clamp(S.ship.hull - 10, 0, 100); a.m.hp = clamp(a.m.hp - 10, 1, 100);
    ST.say(S, { actors: [a], tag: '未知との遭遇：' + en.name, text: t + F(en.ng, { a: a.name }), why: '対応を誤った（船体 -10）', mag: 22 });
  }

  /* ---------- 船での暮らし ---------- */
  function shipLife(S) {
    var rng = S.rng, L0 = live(S), sp = S.ship, T = SH.T;
    if (!L0.length) return;
    /* 役割の日常 */
    var r = rng.pick(L0);
    if (T.ROLE[r.role]) ST.sayB(S, { actors: [r], tag: r.roleLabel, text: F(pk(S, T.ROLE[r.role]), { a: r.name }), why: r.roleLabel + 'の仕事' }, r.name + 'は' + r.roleLabel + 'の仕事');
    /* 料理人の食事 */
    var ck = L0.filter(function (p) { return p.role === 'cook'; })[0];
    if (ck && rng() < 0.5) { sp.morale = clamp(sp.morale + 6 + skill(ck, 'cook') * 6, 0, 100); ST.sayB(S, { actors: [ck], tag: '食事', text: F(pk(S, T.MEAL), { a: ck.name }), why: '料理人の腕で士気が上がった' }, ck.name + 'の料理'); }
    /* 船員どうしの絆が動く出来事（晩酌・ケンカ・共同作業など） */
    bonds(S);
    /* 孤独・病気 */
    var lo = L0.filter(function (p) { return p.m.fear > 55 || p.tr.ac > 0.6; })[0];
    if (lo && rng() < 0.3) { lo.m.fear = clamp(lo.m.fear + 4, 0, 100); ST.sayB(S, { actors: [lo], tag: '孤独', text: F(pk(S, T.LONELY), { a: lo.name }), why: '' }, lo.name + 'は宇宙の静けさに沈んだ'); }
    if (rng() < 0.12 + S.env.danger / 100 * 0.08) {
      var sk = rng.pick(L0); sk.m.hp = clamp(sk.m.hp - 12, 1, 100); stress(sk, 5);
      ST.sayB(S, { actors: [sk], tag: '病気', text: F(pk(S, T.SICK), { a: sk.name }), why: '体力 -12' }, sk.name + 'が体調を崩した');
      heal(S, sk);
      if (rng() < 0.45) nurse(S, sk);
    }
  }
  /* ---------- 星での危機：感染症・研究のための誘拐・遭難 ---------- */
  function infect(S, a, src) {
    if (!SH.C || !a || a.inf || !alive(a)) return;
    a.inf = 1; a.infSrc = src; stress(a, 10); a.cnt.inf = (a.cnt.inf || 0) + 1;
    ST.say(S, { actors: [a], tag: '感染症', text: F(pk(S, SH.C.INF_START), { a: a.name, x: src }), why: src + 'の調査で、未知の病原体に感染した', mag: 26 });
  }
  function lose(S, a) {
    if (!SH.C || !alive(a) || live(S).length < 2) return;
    a.away = 'lost'; a.awayM = 0; stress(a, 15);
    var o = ST.say(S, { actors: [a], tag: '遭難', text: F(pk(S, SH.C.LOST), { a: a.name }), why: '探索の失敗で、仲間とはぐれた', mag: 30 });
    ST.key(S, o, a.name + 'の遭難');
  }
  function closest(S, a, ex) { return live(S).filter(function (q) { return q !== a && (!ex || ex.indexOf(q) < 0); }).sort(function (x, y) { return bond(S, y, a) - bond(S, x, a); })[0]; }
  /* 星の生命体との夜（ship-r18-xeno2.js）：生命体ごと・型（誘い／強引／攫われる／実験）ごとの文。攻めを選んだ人は主導権を握る */
  function xeno(S, a, d, onlyMode, hidden) {
    var X2 = SH.X2, rng = S.rng;
    if (!X2 || !a || !d) return false;
    var ms = X2.modes(d).filter(function (m) { return !onlyMode || m[0] === onlyMode; });
    if (!ms.length) return false;
    var m = HK.weighted(rng, ms, function (x) { return x[1]; })[0];
    /* hidden：まだ正体に気づいていない生命体（名前の代わりに「正体の分からない何か」） */
    var top = HK.Pos && HK.Pos.hardTop(a), b = closest(S, a) || { name: '仲間' }, v = { a: a.name, b: b.name, x: hidden ? '正体の分からない何か' : d.name };
    var pick = function (arr) { return pk(S, arr); };
    var body = top ? pick(X2.TOP[m]) : X2.text(S, d, m, pick);
    if (!body) return false;
    /* その後の反応は、受けた人のいちばん強い気質（エゴグラム）で変わる */
    var ft = a.eg && HK.egoType ? HK.egoType(a.eg).top : 'NP';
    var t = F(body, v) + (top ? '' : F(pick(X2.AFTER[m]), v) + (X2.REACT && X2.REACT[ft] && rng() < 0.7 ? F(pick(X2.REACT[ft]), v) : ''));
    /* 段落に分けた濃い版（ship-xeno-thick.js。R18版のみ）：描写の長さが厚くならいつも、混ぜるなら三回に一回ほど、短くなら使わない */
    var lw0 = lewdOf(S), xl = HK.Lewd && HK.Lewd.conf('ship') ? S.env.lewdLen : 'mix';
    var tk = xl !== 'short' && lw0.lv !== 'low' && X2.thick && X2.thick(S, d, m, a, top, body, ft, xl === 'thick');
    if (tk) t = F(tk, v);
    t = xLewd(S, a, top, t, v);
    a.cnt.r18 = (a.cnt.r18 || 0) + 1;
    if (!top) { stress(a, m === 'lure' ? 6 : m === 'probe' ? 8 : 14); a.m.fear = clamp(a.m.fear + (m === 'force' || m === 'take' ? 8 : 2), 0, 100); }
    else stress(a, -5);
    var o = ST.say(S, { actors: [a], tag: X2.TAG[m], kind: 'climax', text: t, why: (hidden ? 'まだ正体に気づいていない生命体（のちに分かる名は「' + d.name + '」）' : d.name + '（' + LIFE_JP[d.kind] + '）') + '／' + X2.MODE_NAME[m] + (top ? '／自分で攻めを選んでいるので、受けにはならず主導権を握った' : ''), mag: 30 });
    if (!S.xenoKey) { S.xenoKey = true; ST.key(S, o, a.name + 'と' + d.name); }
    return true;
  }
  function lure(S) {
    var rng = S.rng, Pn = S.planet, X = SH.X, src = [];
    /* 調べた生命体がいれば、半分以上は生命体ごとの文で */
    var seen = Pn.life.filter(function (l) { return l.st >= 1; });
    if (SH.X2 && seen.length && rng() < 0.7 && xeno(S, rng.pick(live(S)), rng.pick(seen).d)) return;
    /* 生命体は xeno に任せる（「巨体にのしかかられる」文が小さな生き物に付かないように）。ここでは文明の住人だけ */
    if (!SH.X2) Pn.life.forEach(function (l) { if (l.st >= 1 && /friendly|neutral/.test(l.d.kind)) src.push({ x: l.d.name, pool: X.lureLife }); });
    if (Pn.civ.st >= 1 && /primitive|living/.test(Pn.civ.d.state)) src.push({ x: Pn.civ.d.name, pool: X.lureCiv });
    if (!src.length) return;
    var o = rng.pick(src), a = rng.pick(live(S)), b = closest(S, a) || { name: '仲間' };
    var top = HK.Pos && HK.Pos.hardTop(a), m = { a: a.name, b: b.name, x: o.x };
    var t = F(pk(S, o.pool), m) + (top ? F(pk(S, X.lureTop), m) : F(pk(S, X.huge), m) + F(pk(S, X.hugeAct), m) + F(pk(S, X.lureAfter), m));
    t = xLewd(S, a, top, t, m);
    a.cnt.r18 = (a.cnt.r18 || 0) + 1; stress(a, top ? -5 : 8);
    var r = ST.say(S, { actors: [a], tag: '異種族の誘い', kind: 'climax', text: t, why: o.x + 'の誘い。言葉が通じず、誘われているとは分からなかった' + (top ? '／自分で攻めを選んでいるので、主導権を握った' : ''), mag: 32 });
    if (!S.lureKey) { S.lureKey = true; ST.key(S, r, a.name + 'と' + o.x); }
  }
  function crisis(S) {
    if (!SH.C) return;
    var rng = S.rng, Pn = S.planet, C = SH.C;
    /* 感染症の経過・感染拡大・置き去りの相談 */
    live(S).filter(function (p) { return p.inf; }).forEach(function (a) {
      if (!alive(a)) return;
      var dr = live(S).filter(function (q) { return q !== a && !q.inf; }).sort(function (x, y) { return skill(y, 'med') - skill(x, 'med'); })[0];
      if (dr && rng() < 0.1 + skill(dr, 'med') * 0.4) {
        a.inf = 0; setRel(S, a, dr, 0.2); mark(S, a, dr, 'nurse'); stress(a, -10);
        ST.say(S, { actors: [dr, a], tag: '感染症', text: F(pk(S, C.INF_CURE), { a: a.name, b: dr.name, x: a.infSrc || '星の生き物' }), why: dr.name + 'の医療の腕 ' + Math.round(skill(dr, 'med') * 100), mag: 22 });
        return;
      }
      if (rng() < 0.08 + a.m.hp / 100 * 0.1) { a.inf = 0; ST.sayB(S, { actors: [a], tag: '感染症', text: F(pk(S, C.INF_SELF), { a: a.name }), why: '自分の体の力で持ち直した' }, a.name + 'は病に打ち勝った'); return; }
      a.inf++; a.m.hp = clamp(a.m.hp - 8 * a.inf, 1, 100); stress(a, 8);
      live(S).forEach(function (q) { if (q !== a) stress(q, 3); });
      if (a.inf >= 3 && rng() < 0.35 + S.env.danger / 100 * 0.2) { var w = closest(S, a) || { name: '仲間' }; die(S, a, '感染症で', F(pk(S, C.INF_DEATH), { v: a.name, w: w.name })); return; }
      ST.sayB(S, { actors: [a], tag: '感染症', text: F(pk(S, C.INF_WORSE), { a: a.name }), why: '病状が悪化した（段階 ' + a.inf + '・体力 ' + Math.round(a.m.hp) + '）' }, a.name + 'の病状が悪化した');
      /* うつる：近しい人ほど、そばにいるのでうつりやすい */
      var cand = live(S).filter(function (q) { return q !== a && !q.inf; });
      var q = cand.length ? HK.weighted(rng, cand, function (z) { return 0.1 + Math.max(0, bond(S, z, a)) * 1.5 + (lover(S, z, a) ? 1 : 0); }) : null;
      if (q && rng() < 0.12 + Math.max(0, bond(S, q, a)) * 0.25 + (lover(S, q, a) ? 0.15 : 0)) {
        q.inf = 1; q.infSrc = a.infSrc; q.cnt.inf = (q.cnt.inf || 0) + 1; stress(q, 10);
        ST.say(S, { actors: [a, q], tag: '感染拡大', text: F(pk(S, lover(S, a, q) && !family(S, a, q) && C.INF_SPREAD_LOVE ? C.INF_SPREAD_LOVE : C.INF_SPREAD), { a: a.name, b: q.name }), why: q.name + 'は' + a.name + 'のそばにいた（関係 ' + Math.round(bond(S, q, a) * 100) + '）', mag: 26 });
      }
      /* 置き去りの相談：星にいて、病が重いとき */
      var oth = live(S).filter(function (z) { return z !== a; });
      if (a.inf < 2 || a.abTalk || !onPlanet(S) || oth.length < 2) return;
      var fear = oth.reduce(function (s0, z) { return s0 + z.m.fear + z.m.st; }, 0) / oth.length / 200;
      if (rng() > 0.2 + fear * 0.4) return;
      a.abTalk = true;
      var c = HK.weighted(rng, oth, function (z) { return Math.max(0.05, 0.3 + z.tr.cp * 0.6 + z.tr.caution * 0.4 + (capt(z) ? 0.5 : 0) - Math.max(0, bond(S, z, a)) * 1.2); });
      var t = F(pk(S, C.ABANDON_TALK), { a: a.name, c: c.name });
      var pr = oth.filter(function (z) { return z !== c && bond(S, z, a) >= 0.45; }).sort(function (x, y) { return bond(S, y, a) - bond(S, x, a); })[0];
      if (pr && rng() < 0.45 + bond(S, pr, a) * 0.4) {
        setRel(S, pr, a, 0.25); setRel(S, pr, c, -0.2); mark(S, pr, a, 'calm'); mark(S, pr, c, 'quarrel'); stress(pr, 6);
        var o1 = ST.say(S, { actors: [c, a, pr], tag: '置き去りの相談', text: t + F(pk(S, C.ABANDON_STOP), { a: a.name, b: pr.name }), why: c.name + 'が置き去りを提案したが、' + pr.name + 'が' + a.name + 'をかばった（関係 ' + Math.round(bond(S, pr, a) * 100) + '）', mag: 32 });
        ST.key(S, o1, pr.name + 'が' + a.name + 'をかばった');
        return;
      }
      a.away = 'left'; a.fate = '感染したまま' + Pn.name + 'に置き去りにされた（' + S.m + 'か月目）';
      oth.forEach(function (z) { setRel(S, z, a, z === c ? -0.5 : -0.25); stress(z, 8); });
      S.left.push([c.i, a.i]); S.ship.morale = clamp(S.ship.morale - 10, 0, 100);
      var o2 = ST.say(S, { actors: [c, a], tag: '置き去り', kind: 'climax', text: t + F(pk(S, C.ABANDON), { a: a.name }), why: '感染の広がりを恐れた（皆の不安とストレス ' + Math.round(fear * 100) + '）', mag: 44 });
      ST.key(S, o2, a.name + 'を星に置き去りにした');
    });
    if (!onPlanet(S)) return;
    /* 連れ去られた人の救出 */
    S.P.filter(function (p) { return p.alive && p.away === 'taken' && !p.gone; }).forEach(function (a) {
      a.awayM++;
      if (Pn.civ.d.state === 'transcendent' && rng() < 0.35) { a.away = null; stress(a, 10); ST.say(S, { actors: [a], tag: '帰還', text: F(pk(S, C.RETURN_ODD), { a: a.name }), why: '理解を超えた存在は、調べ終えた' + a.name + 'を返した', mag: 28 }); return; }
      var L0 = live(S); if (!L0.length) return;
      var b = HK.weighted(rng, L0, function (q) { return 0.2 + Math.max(0, bond(S, q, a)) * 1.5 + skill(q, 'fight') + (q.role === 'security' ? 0.6 : 0); });
      var tm = [b].concat(L0.filter(function (q) { return q !== b; }).sort(function (x, y) { return skill(y, 'fight') + skill(y, 'talk') - skill(x, 'fight') - skill(x, 'talk'); }).slice(0, L0.length > 3 ? 2 : 1));
      var sk = skill(b, 'fight') * 0.45 + Math.max.apply(null, tm.map(function (q) { return skill(q, 'talk'); })) * 0.3 + Math.max(0, bond(S, b, a)) * 0.3 + tm.length * 0.05;
      var diff = 0.45 + Pn.civ.d.rare * 0.05 + (Pn.civ.d.state === 'advanced' ? 0.12 : 0) + S.env.danger / 100 * 0.1;
      /* 研究（R18）：自分で攻めを選んだ人は、受けにならない */
      if (r18on(S) && SH.X && !(HK.Pos && HK.Pos.hardTop(a)) && rng() < 0.35 + S.env.slewd / 100 * 0.4) {
        a.labbed = true; a.cnt.r18 = (a.cnt.r18 || 0) + 1;
        ST.say(S, { actors: [a], tag: '研究', kind: 'climax', text: F(pk(S, SH.X.lab), { a: a.name, x: Pn.civ.d.name }), why: Pn.civ.d.name + 'は、' + a.name + 'を「標本」として調べた', mag: 30 });
      }
      var t = F(pk(S, C.RESCUE_GO), { n: names(tm), a: a.name });
      if (sk + rng() * 0.5 >= diff) {
        a.away = null; stress(a, 12); setRel(S, a, b, 0.3); mark(S, a, b, 'calm'); tm.forEach(function (q) { if (q !== b) setRel(S, a, q, 0.1); }); S.saved.push([b.i, a.i]);
        var o = ST.say(S, { actors: [b, a], tag: '救出', kind: 'climax', text: t + F(pk(S, C.RESCUE_OK), { a: a.name, b: b.name }) + (a.labbed && SH.X ? F(pk(S, SH.X.labAfter), { a: a.name }) : ''), why: b.name + 'の救出（腕 ' + Math.round(sk * 100) + '・難しさ ' + Math.round(diff * 100) + '）', mag: 36 });
        ST.key(S, o, b.name + 'が' + a.name + 'を救い出した');
      } else {
        b.m.hp = clamp(b.m.hp - 10, 1, 100); stress(b, 6);
        ST.say(S, { actors: tm, tag: '救出失敗', text: t + F(pk(S, C.RESCUE_NG), { a: a.name, b: b.name }), why: '救出に失敗（' + a.awayM + '回目）', mag: 22 });
        if (a.awayM >= 3) { a.gone = true; a.fate = Pn.civ.d.name + 'に連れ去られたまま（' + S.m + 'か月目）'; ST.say(S, { actors: [a], tag: '行方不明', text: F(pk(S, C.TAKEN_GONE), { a: a.name }), why: '三度の救出がすべて失敗した', mag: 30 }); }
      }
    });
    /* 遭難した人の捜索 */
    S.P.filter(function (p) { return p.alive && p.away === 'lost' && !p.gone; }).forEach(function (a) {
      a.awayM++; a.m.hp = clamp(a.m.hp - 12, 0, 100);
      var L0 = live(S); if (!L0.length) return;
      var b = HK.weighted(rng, L0, function (q) { return 0.2 + Math.max(0, bond(S, q, a)) * 1.5 + skill(q, 'survive'); });
      if (a.m.hp <= 0) { a.away = null; die(S, a, '遭難して', F(pk(S, C.LOST_DEAD), { v: a.name, w: b.name })); return; }
      if (rng() < skill(a, 'survive') * 0.3) { a.away = null; ST.say(S, { actors: [a], tag: '生還', text: F(pk(S, C.LOST_SELF), { a: a.name }), why: a.name + 'の生き抜く力', mag: 26 }); return; }
      if (rng() < 0.3 + skill(b, 'survive') * 0.3 + Math.max(0, bond(S, b, a)) * 0.2) {
        a.away = null; setRel(S, a, b, 0.3); mark(S, a, b, 'calm'); S.saved.push([b.i, a.i]); stress(a, -5);
        var o = ST.say(S, { actors: [b, a], tag: '捜索', kind: 'climax', text: F(pk(S, C.SEARCH_OK), { a: a.name, b: b.name }), why: b.name + 'が見つけ出した（関係 ' + Math.round(bond(S, b, a) * 100) + '）', mag: 32 });
        ST.key(S, o, b.name + 'が' + a.name + 'を見つけた');
        return;
      }
      ST.sayB(S, { actors: L0.slice(0, 3), tag: '捜索', text: F(pk(S, C.SEARCH_NG), { a: a.name, n: names(L0.slice(0, 3)) }), why: '見つからなかった（' + a.awayM + 'か月目）' }, a.name + 'の捜索は空振りに終わった');
      if (a.awayM >= 3) { a.gone = true; a.fate = '遭難して行方不明（' + S.m + 'か月目）'; ST.say(S, { actors: [a], tag: '行方不明', text: F(pk(S, C.LOST_GONE), { a: a.name }), why: '三か月探しても見つからなかった', mag: 30 }); }
    });
    /* 異種族の誘い（R18）：友好的だと思ってついていったら、言葉が通じず、誘われていたとは気づかなかった */
    if (r18on(S) && SH.X && live(S).length >= 2 && rng() < S.env.slewd / 100 * 0.15) lure(S);
    /* 研究のための誘拐（文明のある星） */
    if (Pn.civ.st >= 1 && /primitive|living|advanced|transcendent/.test(Pn.civ.d.state) && live(S).length >= 2 && rng() < 0.05 + S.env.danger / 100 * 0.08) {
      var v = HK.weighted(rng, live(S), function (q) { return 0.5 + q.cnt.find * 0.3; });
      v.away = 'taken'; v.awayM = 0; v.cnt.taken = (v.cnt.taken || 0) + 1; stress(v, 20);
      var o3 = ST.say(S, { actors: [v], tag: '誘拐', kind: 'climax', text: F(pk(S, C.TAKEN), { a: v.name, x: Pn.civ.d.name }), why: Pn.civ.d.name + '（' + CIV_JP[Pn.civ.d.state] + '）が、研究のために連れ去った', mag: 38 });
      ST.key(S, o3, v.name + 'が連れ去られた');
    }
    /* 星の生命体からの感染（調査とは別に） */
    if (Pn.life.length && live(S).length && rng() < 0.03 + S.env.danger / 100 * 0.04) { var lf = rng.pick(Pn.life); if (lf.st >= 1) infect(S, rng.pick(live(S)), lf.d.name); }
  }
  /* ---------- 絆が動く出来事 ---------- */
  function pairs(L0) { var o = []; L0.forEach(function (a) { L0.forEach(function (b) { if (a.i < b.i) o.push([a, b]); }); }); return o; }
  /* 星に降りてからは、半分ほどの出来事が星の上（野営地など）での話になる */
  function onPlanet(S) { return !!(S.planet && S.planet.at < S.m); }
  function BP(S, k) { var B = SH.B; return onPlanet(S) && B[k + '_P'] && S.rng() < 0.6 ? B[k + '_P'] : B[k]; }
  function bondEv(S) {
    var rng = S.rng, L0 = live(S), sp = S.ship, T = SH.T, B = SH.B;
    var PR = pairs(L0), tense = (100 - sp.morale) / 100 + (sp.food < 20 ? 0.35 : 0) + (sp.o2 < 30 ? 0.2 : 0);
    var sick = L0.filter(function (p) { return p.m.hp < 60; });
    var neg = PR.filter(function (x) { return (S.relD[rk(x[0], x[1])] || 0) < -0.15 || bond(S, x[0], x[1]) < -0.15; });
    var lv = PR.filter(function (x) { return lover(S, x[0], x[1]) || (bond(S, x[0], x[1]) > 0.55 && HK.Pos && HK.Pos.okSex(x[0], x[1]) && !family(S, x[0], x[1])); });
    var opts = [
      ['drink', 1.0], ['team', 1.0], ['confide', 0.7], ['game', 0.7], ['nurse', sick.length ? 0.9 : 0], ['birthday', 0.25], ['drink_all', L0.length >= 3 ? 0.3 : 0],
      ['fight', 0.25 + tense * 0.9], ['drink_bad', 0.2 + tense * 0.4], ['ration', sp.food < 35 ? 0.3 + tense * 0.6 : 0.05], ['duty', 0.2 + tense * 0.4], ['game_bad', 0.15 + tense * 0.2],
      ['good', 0.6], ['bad', 0.15 + tense * 0.4], ['please', L0.some(pleaser) ? 0.6 + tense * 0.5 : 0], ['jealous', L0.length >= 3 ? 0.35 : 0], ['makeup', neg.length ? 0.8 : 0], ['love', lv.length ? 0.6 : 0]
    ];
    var kind = HK.weighted(rng, opts, function (o) { return o[1]; })[0];
    /* 二人を選ぶ：揉めごとは気の荒い・相性の悪い二人、仲が深まる出来事は誰とでも */
    function pickP(list, f) { return list.length ? HK.weighted(rng, list, f) : null; }
    if (kind === 'please') {
      var pl = pickP(L0.filter(pleaser), function (q) { return 0.5 + q.tr.ac; }), down = pl && L0.filter(function (q) { return q !== pl; }).sort(function (x, y) { return (y.m.st || 0) - (x.m.st || 0); })[0];
      if (!down) return;
      var wp = bond(S, pl, down);
      setRel(S, pl, down, 0.15); mark(S, pl, down, 'team'); stress(down, -12); stress(pl, 5); sp.morale = clamp(sp.morale + 3, 0, 100);
      ST.sayB(S, { actors: [pl, down], tag: '機嫌取り', text: F(pk(S, BP(S, 'PLEASE')), { a: pl.name, b: down.name }), why: pl.name + 'は周りの機嫌をうかがう気質。' + down.name + 'のストレスを和らげた（関係 ' + Math.round(wp * 100) + '→' + Math.round(bond(S, pl, down) * 100) + '）' }, pl.name + 'が' + down.name + 'の機嫌を取った');
      if (pl.m.st > 60 && rng() < 0.4) ST.sayB(S, { actors: [pl], tag: '機嫌取りの疲れ', text: F(pk(S, BP(S, 'PLEASE_TIRED')), { a: pl.name }), why: '人の気持ちを優先して、自分のストレスを溜め込んでいる（' + Math.round(pl.m.st) + '）' }, pl.name + 'はひとり疲れていた');
      return;
    }
    var BAD = /fight|drink_bad|ration|duty|game_bad|^bad$/.test(kind);
    var pr = kind === 'makeup' ? pickP(neg, function () { return 1; }) : kind === 'love' ? pickP(lv, function (x) { return 0.5 + Math.max(0, bond(S, x[0], x[1])); })
      : BAD ? pickP(PR, function (x) { return Math.max(0.05, 0.5 + (x[0].tr.aggr + x[1].tr.aggr) * 0.6 - bond(S, x[0], x[1]) * 0.6 + ((x[0].m.st || 0) + (x[1].m.st || 0)) / 200) * (capt(x[0]) || capt(x[1]) ? 0.35 : 1); })
        : pickP(PR, function (x) { return 0.6 + Math.max(0, bond(S, x[0], x[1])) * 0.6 + (x[0].tr.warmth + x[1].tr.warmth) * 0.3; });
    if (!pr) return;
    var a = rng() < 0.5 ? pr[0] : pr[1], b = a === pr[0] ? pr[1] : pr[0], w0 = bond(S, a, b);
    var others = L0.filter(function (q) { return q !== a && q !== b; });
    /* 船長の使命感：自分が揉めかけても、その場で収めてしまうことが多い */
    if (BAD && (capt(a) || capt(b)) && rng() < 0.6) {
      var cp = capt(a) ? a : b, ot = cp === a ? b : a;
      setRel(S, cp, ot, 0.05); stress(cp, 3);
      ST.sayB(S, { actors: [cp, ot], tag: '船長', text: F(pk(S, BP(S, 'CAPTAIN')), { a: cp.name, b: ot.name }), why: '船長の使命感で、揉めごとを自分の中で収めた' }, cp.name + 'が揉めごとを収めた');
      return;
    }
    function say(pool, tag, d, why, mp) { ST.sayB(S, { actors: [a, b].concat(mp && mp.c ? [mp.c] : []), tag: tag, text: F(pk(S, pool), { a: a.name, b: b.name, c: mp && mp.c ? mp.c.name : '' }), why: why + '（関係 ' + Math.round(w0 * 100) + '→' + Math.round(bond(S, a, b) * 100) + '）' }, a.name + 'と' + b.name); }
    if (kind === 'drink') { stress(a, -8); stress(b, -8); setRel(S, a, b, 0.22); mark(S, a, b, 'drink'); sp.morale = clamp(sp.morale + 3, 0, 100); say(BP(S, 'DRINK'), '晩酌', 0, '二人きりの晩酌'); }
    else if (kind === 'drink_all') {
      var g = others.length > 2 ? rng.shuffle(others.slice()).slice(0, 1 + rng.int(others.length - 1)).concat([a, b]) : L0.slice();
      g.forEach(function (x) { stress(x, -6); g.forEach(function (y) { if (x.i < y.i) { setRel(S, x, y, 0.1); mark(S, x, y, 'drink'); } }); });
      sp.morale = clamp(sp.morale + 8, 0, 100);
      ST.sayB(S, { actors: g, tag: '酒盛り', text: F(pk(S, BP(S, 'DRINK_ALL')), { n: names(g) }), why: '皆で飲んだ（士気 +8・全員の関係 +10）' }, names(g) + 'の酒盛り');
    }
    else if (kind === 'team') { stress(a, -4); stress(b, -4); setRel(S, a, b, 0.25); mark(S, a, b, 'team'); sp.hull = clamp(sp.hull + 2, 0, 100); say(BP(S, 'TEAM'), '共同作業', 0, '力を合わせて乗り切った'); }
    else if (kind === 'confide') { stress(a, -10); stress(b, -4); setRel(S, a, b, 0.3); mark(S, a, b, 'confide'); a.m.fear = clamp(a.m.fear - 6, 0, 100); say(BP(S, 'CONFIDE'), '打ち明け話', 0, '誰にも言えなかったことを話した'); }
    else if (kind === 'game') { stress(a, -5); stress(b, -5); setRel(S, a, b, 0.15); mark(S, a, b, 'game'); sp.morale = clamp(sp.morale + 3, 0, 100); say(BP(S, 'GAME'), '娯楽', 0, '退屈しのぎの勝負'); }
    else if (kind === 'nurse') { nurse(S, sick.sort(function (x, y) { return x.m.hp - y.m.hp; })[0]); }
    else if (kind === 'birthday') {
      if (S.bday[a.i]) return; S.bday[a.i] = 1; stress(a, -10);
      setRel(S, a, b, 0.25); mark(S, a, b, 'bday'); others.forEach(function (q) { setRel(S, a, q, 0.06); }); sp.morale = clamp(sp.morale + 6, 0, 100); say(BP(S, 'BIRTHDAY'), '誕生日', 0, a.name + 'の誕生日を祝った');
    }
    else if (kind === 'good') { setRel(S, a, b, 0.15); mark(S, a, b, 'team'); say(T.PAIR_GOOD, '絆', 0, '日々の暮らしの中で'); }
    else if (kind === 'makeup') { stress(a, -6); stress(b, -6); setRel(S, a, b, 0.3); mark(S, a, b, 'makeup'); say(T.MAKEUP, '仲直り', 0, 'こじれた関係を修復した'); }
    else if (kind === 'love') {
      stress(a, -6); stress(b, -6); setRel(S, a, b, 0.18); mark(S, a, b, 'love'); if (bond(S, a, b) > 0.6) S.rom[rk(a, b)] = 1;
      say(T.PAIR_LOVE, '想い', 0, '閉ざされた船で、想いが育った');
    }
    else if (kind === 'jealous') {
      /* {c}：{a}に想いを寄せている人が、{a}と{b}の親しさを見てしまう */
      /* 関係「執着なし」の相手のことでは嫉妬しない */
      var c = pickP(others.filter(function (q) { return (lover(S, q, a) || bond(S, q, a) > 0.4) && !ties(S, q, a).some(function (t) { return t.type === 'noobs'; }); }), function (q) { return 0.3 + (q.tr.jealous || 0.4) + Math.max(0, bond(S, q, a)); });
      if (!c) return;
      stress(c, 8); setRel(S, a, b, 0.1); setRel(S, c, b, -0.25); setRel(S, c, a, -0.1); mark(S, c, b, 'jealous'); S.jeal.push([c.i, b.i]);
      ST.sayB(S, { actors: [c, a, b], tag: '嫉妬', text: F(pk(S, BP(S, 'JEALOUS')), { a: a.name, b: b.name, c: c.name }), why: c.name + 'は' + a.name + 'に想いを寄せている（嫉妬 ' + Math.round((c.tr.jealous || 0) * 100) + '）' }, c.name + 'の嫉妬');
    }
    else if (kind === 'fight') {
      var st = others.length && rng() < 0.7 ? HK.weighted(rng, others, function (q) { return 0.2 + q.tr.lead + q.tr.warmth * 0.5 + (capt(q) ? 1 : 0) + (pleaser(q) ? 0.6 : 0); }) : null;
      stress(a, 10); stress(b, 10); setRel(S, a, b, st ? -0.25 : -0.38); mark(S, a, b, 'fight');
      a.m.hp = clamp(a.m.hp - (st ? 3 : 8), 1, 100); b.m.hp = clamp(b.m.hp - (st ? 3 : 8), 1, 100); sp.morale = clamp(sp.morale - 6, 0, 100);
      var txt = F(pk(S, BP(S, 'FIGHT')), { a: a.name, b: b.name }) + (st ? F(pk(S, BP(S, 'STOP')), { c: st.name }) : '');
      if (st) { setRel(S, st, a, 0.08); setRel(S, st, b, 0.08); mark(S, st, a, 'stop'); mark(S, st, b, 'stop'); }
      ST.sayB(S, { actors: [a, b].concat(st ? [st] : []), tag: 'ケンカ', text: txt, why: '張りつめた船内（士気 ' + Math.round(sp.morale) + '）' + (st ? '。' + st.name + 'が止めに入った' : '。誰も止めなかった（体力 -8）') + '（関係 ' + Math.round(w0 * 100) + '→' + Math.round(bond(S, a, b) * 100) + '）' }, a.name + 'と' + b.name + 'のケンカ');
    }
    else {
      var D = { drink_bad: [BP(S, 'DRINK_BAD'), '酒の席', -0.25, '酒が入って本音が出た'], ration: [BP(S, 'RATION'), '食料の取り合い', -0.22, '乏しい食料（食料 ' + Math.round(sp.food) + '）'], duty: [BP(S, 'DUTY'), '当番', -0.2, '当番の押し付け'], game_bad: [BP(S, 'GAME_BAD'), '娯楽', -0.18, '勝負がこじれた'], bad: [T.PAIR_BAD, '衝突', -0.18, '閉ざされた船の息苦しさ'] }[kind];
      stress(a, 6); stress(b, 6); setRel(S, a, b, D[2]); mark(S, a, b, 'quarrel'); sp.morale = clamp(sp.morale - 3, 0, 100);
      say(D[0], D[1], 0, D[3]);
    }
  }
  /* 看病：弱った船員のそばに、いちばん近しい人がつく（R18版では、そのまま肌を重ねることもある） */
  function nurse(S, b) {
    var rng = S.rng, L0 = live(S), B = SH.B, R = SH.R18, Pz = HK.Pos;
    var a = L0.filter(function (q) { return q !== b; }).sort(function (x, y) { return (bond(S, y, b) + y.tr.warmth) - (bond(S, x, b) + x.tr.warmth); })[0];
    if (!a || !b.alive) return;
    var w0 = bond(S, a, b);
    b.m.hp = clamp(b.m.hp + 8, 0, 100); stress(b, -5); setRel(S, a, b, 0.28); mark(S, a, b, 'nurse');
    ST.sayB(S, { actors: [a, b], tag: '看病', text: F(pk(S, BP(S, 'NURSE')), { a: a.name, b: b.name }), why: '弱っているところを支えた（体力 +8）（関係 ' + Math.round(w0 * 100) + '→' + Math.round(bond(S, a, b) * 100) + '）' }, a.name + 'が' + b.name + 'を看病した');
    if (!r18on(S) || !R || !R.nurseTop || !Pz || !Pz.okSex(a, b) || family(S, a, b)) return;
    if (rng() > S.env.slewd / 100 * (lover(S, a, b) ? 1.2 : bond(S, a, b) > 0.3 ? 0.8 : 0.3)) return;
    /* 受け攻め：自分で攻めを選んだ人は、熱があっても受けにならない */
    var o = Pz.order(a, b, [a, b]), t = o[0], u = o[1];
    if (Pz.hardTop(u)) return;
    var body = bodyOf(S, t, u, 'nurse');
    setRel(S, a, b, 0.15); mark(S, a, b, 'night');
    a.cnt.r18 = (a.cnt.r18 || 0) + 1; b.cnt.r18 = (b.cnt.r18 || 0) + 1;
    var open = F(pk(S, t === a ? R.nurseTop : R.nurseSick), { t: t.name, u: u.name });
    ST.say(S, { actors: [a, b], tag: '看病の夜', kind: 'climax', text: open + body + F(pk(S, R.nurseAfter), { a: a.name, b: b.name }), why: '熱に浮かされた' + b.name + 'と、看病していた' + a.name + '／関係の近さ ' + Math.round(bond(S, a, b) * 100), mag: 30 });
  }
  /* ストレスの限界：気の荒い人は暴れ、そうでない人は深酒に逃げる。近しい人がなだめたり、面倒を見たりする */
  function outburst(S) {
    var rng = S.rng, L0 = live(S), sp = S.ship, B = SH.B, n = 0;
    L0.slice().sort(function (x, y) { return y.m.st - x.m.st; }).forEach(function (a) {
      if (n >= 2 || a.m.st < 78 || rng() > 0.65 || L0.length < 2) return;
      n++;
      var others = L0.filter(function (q) { return q !== a; });
      var c = rng() < 0.75 ? HK.weighted(rng, others, function (q) { return 0.2 + Math.max(0, bond(S, q, a)) * 1.5 + q.tr.warmth * 0.5 + (capt(q) ? 0.6 : 0) + (pleaser(q) ? 0.8 : 0); }) : null;
      var st0 = Math.round(a.m.st);
      if (rng() < 0.2 + a.tr.aggr * 0.7) {
        var b = rng.pick(others);
        sp.hull = clamp(sp.hull - 5, 0, 100); sp.morale = clamp(sp.morale - 8, 0, 100); a.m.hp = clamp(a.m.hp - 4, 1, 100);
        setRel(S, a, b, -0.15); mark(S, a, b, 'quarrel'); others.forEach(function (q) { setRel(S, a, q, -0.04); stress(q, 3); });
        a.cnt.rage = (a.cnt.rage || 0) + 1;
        var t = F(pk(S, BP(S, 'RAGE')), { a: a.name, b: b.name });
        if (c) { t += F(pk(S, BP(S, 'CALM')), { a: a.name, c: c.name }); setRel(S, a, c, 0.22); mark(S, a, c, 'calm'); a.m.st = 35; } else a.m.st = 55;
        ST.say(S, { actors: c ? [a, c] : [a], tag: '暴れる', text: t, why: 'ストレスが限界を越えた（' + st0 + '）。気の荒さ ' + Math.round(a.tr.aggr * 100) + '。船体 -5・士気 -8' + (c ? '。' + c.name + 'がなだめた' : ''), mag: 24 });
      } else {
        sp.food = clamp(sp.food - 1.5, 0, 100); sp.morale = clamp(sp.morale - 2, 0, 100); a.m.hp = clamp(a.m.hp - 8, 1, 100);
        a.cnt.deep = (a.cnt.deep || 0) + 1;
        var t2 = F(pk(S, BP(S, 'DEEP')), { a: a.name });
        if (c) { t2 += F(pk(S, BP(S, 'DEEP_CARE')), { a: a.name, c: c.name }); setRel(S, a, c, 0.15); mark(S, a, c, 'calm'); a.m.st = 40; } else a.m.st = 55;
        ST.say(S, { actors: c ? [a, c] : [a], tag: '深酒', text: t2, why: 'ストレスが限界を越えた（' + st0 + '）。酒に逃げた（体力 -8）' + (c ? '。' + c.name + 'が面倒を見た' : ''), mag: 18 });
      }
    });
  }
  function bonds(S) {
    if (!SH.B || live(S).length < 2) return;
    var n = 1 + (S.rng() < 0.6 ? 1 : 0) + (live(S).length >= 5 && S.rng() < 0.4 ? 1 : 0);
    for (var k = 0; k < n; k++) bondEv(S);
    outburst(S);
  }
  /* ---------- 関係図 ---------- */
  function relmap(S) {
    var P = S.P, edges = [], seen = {};
    function add(a, b, label, cls, dir) { var k = rk(P[a], P[b]) + label; if (seen[k]) return; seen[k] = 1; edges.push({ a: a, b: b, label: label, cls: cls, dir: dir }); }
    var CLS = { lover: 'love', sibbad: 'enemy', bad: 'enemy', mate: 'love', fated: 'love', almost: 'love', fwb: 'night', crush: 'pine', enemy: 'enemy', rival: 'enemy', ex: 'obsess', buddy: 'partner', best: 'friend', friend: 'friend', childhood: 'friend', sibling: 'guard', sibprot: 'guard', sibclose: 'guard', parent: 'guard', pparent: 'guard', master: 'partner', mentor: 'partner', teacher: 'partner', senpai: 'friend', colleague: 'friend', acq: 'none' };
    S.ties.forEach(function (t) { var lab = HK.TIES && HK.TIES[t.type] ? HK.TIES[t.type].label : t.type; add(t.a, t.b, lab, CLS[t.type] || 'friend', t.type === 'crush' || (HK.TIES && HK.TIES[t.type] && HK.TIES[t.type].dir) ? t.a : null); });
    var hasLove = {};
    S.ties.forEach(function (t) { if (LOVE.test(t.type)) hasLove[rk(P[t.a], P[t.b])] = 1; });
    var keys = Object.keys(S.relD).concat(Object.keys(S.relEv)).filter(function (k, x, arr) { return arr.indexOf(k) === x; });
    keys.forEach(function (k) {
      var ab = k.split('-'), a = +ab[0], b = +ab[1], d = S.relD[k] || 0, e = S.relEv[k] || {};
      var bad = (e.fight || 0) + (e.quarrel || 0), good = (e.drink || 0) + (e.team || 0) + (e.confide || 0) + (e.nurse || 0) + (e.calm || 0) + (e.game || 0) + (e.makeup || 0) + (e.bday || 0);
      if (S.rom[k] && !hasLove[k]) add(a, b, '★恋仲', 'love', null);
      if (e.night) add(a, b, '★夜を共にした', 'night', null);
      if (d >= 0.55) add(a, b, bad >= 2 ? '★ケンカするほど仲がいい' : e.nurse || e.calm ? '★支え合う' : e.confide ? '★深い絆' : (e.drink || 0) >= 2 ? '★飲み仲間' : '★深い絆', 'guard', null);
      else if (d >= 0.25) add(a, b, (e.drink || 0) >= 2 ? '★飲み仲間' : e.team ? '★相棒' : e.makeup ? '★和解' : '★仲間', e.team ? 'partner' : 'friend', null);
      else if (d <= -0.45) add(a, b, (e.fight || 0) >= 2 ? '★犬猿の仲' : '★険悪', 'enemy', null);
      else if (d <= -0.2) add(a, b, '★わだかまり', 'obsess', null);
      else if (bad >= 2 && good >= 2) add(a, b, '★揉めては戻る', 'friend', null);
    });
    S.left.forEach(function (j) { add(j[0], j[1], '★置き去りにした', 'enemy', j[0]); });
    S.saved.forEach(function (j) { add(j[0], j[1], '★助け出した', 'guard', j[0]); });
    S.jeal.forEach(function (j) { if ((S.relD[rk(P[j[0]], P[j[1]])] || 0) < 0) add(j[0], j[1], '★嫉妬', 'obsess', j[0]); });
    return {
      nodes: P.map(function (p) { return { i: p.i, name: p.name, sub: p.roleLabel, dead: !p.alive, fate: p.fate }; }),
      edges: edges, note: '★は漂流のあいだに生まれた・変わった関係。矢印は気持ちの向き。'
    };
  }
  function heal(S, p) {
    var dr = live(S).filter(function (q) { return q !== p && q.role === 'doctor'; })[0];
    if (!dr || S.rng() > 0.7) return;
    p.m.hp = clamp(p.m.hp + 10 + skill(dr, 'med') * 15, 0, 100);
    ST.sayB(S, { actors: [dr, p], tag: '治療', text: F(pk(S, SH.T.HEAL), { a: dr.name, b: p.name }), why: '船医の手当て' }, dr.name + 'が' + p.name + 'を手当てした');
  }

  /* ---------- 毎月の消耗 ---------- */
  function upkeep(S, m) {
    var sp = S.ship, L0 = live(S), rng = S.rng;
    sp.food = clamp(sp.food - L0.length * 0.8 - 1.5 + (S.planet && S.planet.at < m ? 3 : 0), 0, 100);
    sp.o2 = clamp(sp.o2 - 2 - (sp.power < 25 ? 6 : 0), 0, 100);
    sp.power = clamp(sp.power - 3, 0, 100);
    sp.morale = clamp(sp.morale - 2 + (S.planet ? 3 : 0), 0, 100);
    L0.forEach(function (p) {
      if (sp.food <= 0) p.m.hp -= 12;
      if (sp.o2 < 15) p.m.hp -= 10;
      if (sp.hull <= 0) p.m.hp -= 15;
      p.m.fear = clamp(p.m.fear + (sp.morale < 30 ? 4 : 1), 0, 100);
      stress(p, 3 + (sp.morale < 40 ? 4 : 0) + (sp.food < 20 ? 5 : 0) + (p.m.hp < 50 ? 3 : 0) + (sp.o2 < 30 ? 3 : 0) - (S.planet ? 2 : 0));
      p.m.hp = clamp(p.m.hp + (sp.food > 20 ? 4 : 0), 0, 100);
    });
    var cause = sp.food <= 0 ? '飢えで' : sp.o2 < 15 ? '空気が尽きかけて' : sp.hull <= 0 ? '壊れかけた船の中で' : '';
    L0.forEach(function (p) {
      if (p.m.hp > 0 || !p.alive) return;
      die(S, p, cause || '衰弱して', p.name + 'は、' + (cause || '衰弱して') + '静かに息を引き取った。');
    });
    if (sp.food < 15 && sp.food > 0 && rng() < 0.5) ST.sayB(S, { kind: 'phase', text: '食料の残りが、目に見えて少なくなっていた。配給が、また減らされた。', why: '食料 ' + Math.round(sp.food) }, '食料が乏しい');
  }

  /* ---------- 死 ---------- */
  function die(S, v, how, text) {
    if (!v || !v.alive) return;
    v.alive = false; v.fate = '死亡（' + S.m + 'か月目・' + how.replace(/で$|に$/, '') + '）';
    S.deaths.push(v);
    var o = ST.say(S, { actors: [v], tag: '死', kind: 'climax', text: text, why: how + '命を落とした', mag: 46 });
    ST.key(S, o, v.name + 'の死');
    S.ship.morale = clamp(S.ship.morale - 12, 0, 100);
    var g = live(S).filter(function (q) { return bond(S, q, v) >= 0.4; }).sort(function (a, b) { return bond(S, b, v) - bond(S, a, v); })[0];
    live(S).forEach(function (q) { q.m.fear = clamp(q.m.fear + 10 + Math.max(0, bond(S, q, v)) * 15, 0, 100); stress(q, 10 + Math.max(0, bond(S, q, v)) * 20); });
    if (g) ST.say(S, { actors: [g, v], tag: '弔い', text: F(pk(S, SH.T.GRIEF), { a: g.name, v: v.name }), why: g.name + 'と' + v.name + 'の関係' });
  }

  /* ---------- R18 ---------- */
  function r18on(S) { return R18ON && !HK.SAFE_ON && (S.env.slewd || 0) > 0; }
  /* R18の描写の設定（lewd-unify.js）：描写の有無・長さ・作風・濃さ */
  function lewdOf(S) {
    var X = HK.Lewd;
    if (!X || !X.conf('ship')) return { lv: 'mid', short: false, ero: false, high: false };
    return { lv: X.lv(S.env), short: X.short(S.env, S.rng), ero: X.ero(S.env), high: X.high(S.env) };
  }
  /* 船員どうしの夜・看病の夜の本文（kind：'night'|'nurse'） */
  function bodyOf(S, t, u, kind) {
    var R = SH.R18, Pz = HK.Pos, lw = lewdOf(S), nm = { t: t.name, u: u.name };
    if (lw.lv === 'low' && R.fade) return F(pk(S, kind === 'nurse' ? R.nurseFade : R.fade), nm);
    if (lw.ero && R.ero) { var e = R.ero(S, t, u, kind, lw.short, lw.high); if (e) return e; }
    var pool = kind === 'nurse' ? (Pz.isF(t) && Pz.isF(u) ? R.nurseFf : Pz.isF(t) ? R.nurseRide : R.nursePen) : (Pz.isF(t) && Pz.isF(u) ? R.ff : Pz.isF(t) ? R.ride : R.pen);
    /* 山場を段落に分けて厚く書く（R18版の ship-thick.js）。数行で短くなら一文の版 */
    var th = !lw.short && R.thick && R.thick(S, t, u, kind);
    var out = th || F(pk(S, pool), nm);
    if (lw.high && R.again) out += R.again(S, t, u, !th);
    return out;
  }
  function bodyFor(S, a, b) {
    var Pz = HK.Pos, o = Pz.order(a, b, [a, b]), t = o[0], u = o[1];
    if (Pz.hardTop(u)) return '';
    return bodyOf(S, t, u, 'night');
  }
  /* 異星の生き物との場面：ほのめかす＝ぼかした一文、男性向け＝段落を足す、濃い＝もう一度 */
  function xLewd(S, a, top, text, v) {
    var R = SH.R18, lw = lewdOf(S);
    if (!R || !R.xFade) return text;
    if (lw.lv === 'low') return F(pk(S, top ? R.xFadeTop : R.xFade), v);
    /* 男性向けの段落は、自分で攻めを選んで生き物を責める側のときだけ（襲われる場面は合意がないので足さない） */
    if (lw.ero && top) text += (/\n\n/.test(text) ? '\n\n' : '') + F(R.xFill(S, pk(S, R.xEroTop), a, top), v);
    if (lw.high) text += (/\n\n/.test(text) ? '\n\n' : '') + F(pk(S, R.xAgain), v);
    return text;
  }
  function nightR18(S) {
    var rng = S.rng, L0 = live(S), R = SH.R18;
    if (L0.length < 2 || rng() > S.env.slewd / 100 * 0.45) return;
    var pairs = [];
    L0.forEach(function (a) { L0.forEach(function (b) { if (a.i < b.i && HK.Pos.okSex(a, b) && !family(S, a, b) && (lover(S, a, b) || bond(S, a, b) > 0.25 || rng() < 0.15)) pairs.push([a, b]); }); });
    if (!pairs.length) return;
    var pr = HK.weighted(rng, pairs, function (x) { return 0.3 + Math.max(0, bond(S, x[0], x[1])) + (lover(S, x[0], x[1]) ? 1 : 0); }), a = pr[0], b = pr[1];
    var civ = S.planet && S.planet.civ.st >= 1 && /primitive|living|advanced|transcendent/.test(S.planet.civ.d.state) && rng() < 0.25;
    var pol = S.planet && S.planet.life.some(function (l) { return l.st >= 1 && l.d.kind === 'plant'; }) && rng() < 0.35;
    var open = F(pk(S, civ ? R.civ : pol ? R.pollen : R.open), { a: a.name, b: b.name });
    var body = bodyFor(S, a, b);
    if (!body) return;
    setRel(S, a, b, 0.2); mark(S, a, b, 'night');
    a.cnt.r18 = (a.cnt.r18 || 0) + 1; b.cnt.r18 = (b.cnt.r18 || 0) + 1;
    var o = ST.say(S, { actors: [a, b], tag: civ ? '儀式の夜' : pol ? '花粉の夜' : '夜', kind: 'climax', text: open + body + F(pk(S, R.after), { a: a.name, b: b.name }), why: (civ ? '文明の歓迎の儀式' : pol ? '星の花粉にあてられた' : '閉ざされた船の夜') + '／関係の近さ ' + Math.round(bond(S, a, b) * 100), mag: 30 });
    if (!S.r18Key) { S.r18Key = true; ST.key(S, o, a.name + 'と' + b.name + 'の夜'); }
  }
  /* 異星の生き物：自分で攻めを選んだ人は、手懐けて主導権を握る */
  function alienR18(S, a, d) {
    if (SH.X2 && S.rng() < 0.75 && xeno(S, a, d)) return;
    var R = SH.R18, top = HK.Pos && HK.Pos.hardTop(a);
    var X = SH.X, sp = !top && X && X.play[d.kind] && S.rng() < 0.6 ? X.play[d.kind] : null;
    if (!sp && !/friendly|symbiotic|parasite|plant/.test(d.kind)) return;
    ST.say(S, { actors: [a], tag: '異星の生き物', kind: 'climax', text: xLewd(S, a, top, F(pk(S, sp || (top ? R.alienTop : R.alien)), { a: a.name, x: d.name }), { a: a.name, x: d.name }), why: d.name + '（' + LIFE_JP[d.kind] + '）' + (top ? '／自分で攻めを選んでいるので、主導権を握った' : ''), mag: 28 });
  }

  /* ---------- 結果 ---------- */
  function lineOf(lab, o, key, extra) {
    var d = o.d, st = o.st;
    if (!st) return lab + '：？（未調査）';
    return lab + '：' + d.name + extra + '――' + ['', '手がかりのみ', '詳細まで判明', '最深部まで判明'][st];
  }
  function finish(S, input) {
    var P = S.P, Pn = S.planet, L0 = live(S);
    /* 記録の中のトラブル（故障・危機・感染・誘拐・遭難など）は、赤い枠で目立たせる */
    var TROUBLE = /^(故障|危機|全滅|感染症|感染拡大|誘拐|遭難|行方不明|探索失敗|救出失敗|置き去り|病気|暴れる)/;
    S.log.forEach(function (e) { if (e.tag && TROUBLE.test(e.tag)) e.trouble = true; });
    P.forEach(function (p) {
      if (!p.fate && p.alive && p.away === 'taken') p.fate = '連れ去られたまま、救出は間に合わなかった';
      if (!p.fate && p.alive && p.away === 'lost') p.fate = '遭難したまま、一年が終わった';
      if (!p.fate) p.fate = '生還';
      p.notes.push('役割：' + p.roleLabel + (p.picked ? '（指定）' : '（気質から）') + (capt(p) ? '・使命感から揉めごとを収める' : '') + (pleaser(p) ? '・周りの機嫌を取る気質' : ''));
      var bits = [];
      if (p.cnt.find) bits.push('発見・調査の成功 ' + p.cnt.find + '回');
      if (p.cnt.item) bits.push('持ち帰った物品 ' + p.cnt.item + 'つ');
      if (p.cnt.report) bits.push('レポート ' + p.cnt.report + '本');
      if (p.cnt.fix) bits.push('修理 ' + p.cnt.fix + '回');
      if (p.cnt.r18) bits.push('夜の出来事 ' + p.cnt.r18 + '回');
      if (p.cnt.rage) bits.push('ストレスで暴れた ' + p.cnt.rage + '回');
      if (p.cnt.deep) bits.push('深酒 ' + p.cnt.deep + '回');
      if (p.cnt.inf) bits.push('感染 ' + p.cnt.inf + '回');
      if (p.cnt.taken) bits.push('連れ去られた ' + p.cnt.taken + '回');
      if (bits.length) p.notes.push(bits.join('・'));
    });
    var reveal = 0, total = 0;
    if (Pn) { [Pn.res, Pn.civ].concat(Pn.life).forEach(function (o) { reveal += o.st; total += 3; }); }
    var pct = total ? Math.round(reveal / total * 100) : 0;
    var title = !L0.length ? '全滅 ― ' + (S.wipeBy ? S.wipeBy.name + 'で、' : '') + '船は誰も乗せないまま漂い続けた' : Pn ? Pn.name + 'に辿り着いた ― 珍しさ' + stars(Pn.rare) + '・判明度 ' + pct + '%' : '星は見つからなかった ― 一年の漂流';
    var lines = P.map(function (p) { return p.name + '（' + p.roleLabel + '）：' + p.fate; });
    var END = SH.T.END || {};
    lines.push(F(pk(S, !L0.length ? END.wiped : Pn ? END.found : END.none), { x: Pn ? Pn.name : '' }));
    if (Pn) {
      lines.push('星：' + Pn.name + '（珍しさ' + stars(Pn.rare) + '）');
      lines.push(lineOf('資源', Pn.res, 'res', Pn.res.st >= 2 ? '（' + USE_JP[Pn.res.d.use] + '・珍しさ' + stars(Pn.res.d.rare) + '）' : ''));
      if (Pn.life.length) Pn.life.forEach(function (l, k) { lines.push(lineOf('生命体' + (Pn.life.length > 1 ? (k + 1) : ''), l, 'life', l.st >= 2 ? '（' + LIFE_JP[l.d.kind] + '・珍しさ' + stars(l.d.rare) + '）' : '')); });
      else lines.push('生命体：いなかった');
      lines.push(lineOf('文明', Pn.civ, 'civ', Pn.civ.st >= 2 ? '（' + CIV_JP[Pn.civ.d.state] + '・珍しさ' + stars(Pn.civ.d.rare) + '）' : ''));
    }
    if (S.items.length) lines.push('持ち帰った物品：' + S.items.map(function (x) { return x.name; }).join('、'));
    if (S.reports.length) lines.push('書き上げたレポート：' + S.reports.map(function (x) { return '『' + x.title + '』（' + x.by + '）'; }).join('、'));
    var sp = S.ship;
    lines.push('船の状態：船体 ' + Math.round(sp.hull) + '・動力 ' + Math.round(sp.power) + '・生命維持 ' + Math.round(sp.o2) + '・食料 ' + Math.round(sp.food) + '・士気 ' + Math.round(sp.morale));
    var rows = P.map(function (p) { return { i: p.i, rank: '', cells: [p.roleLabel, p.cnt.find + '回', p.cnt.item + 'つ', p.cnt.report + '本', p.fate] }; });
    return ST.result(S, input, {
      ending: { title: title, kind: L0.length && Pn ? 'ok' : 'over', lines: lines },
      estats: [['星', Pn ? Pn.name : '―'], ['珍しさ', Pn ? stars(Pn.rare) : '―'], ['判明度', Pn ? pct + '%' : '―'], ['物品', S.items.length + 'つ'], ['レポート', S.reports.length + '本'], ['生還', L0.length + '/' + P.length + '人']],
      table: { title: '船員', hint: '調査：星の探索で成功した回数。', cols: ['役割', '調査', '物品', 'レポート', '結末'], rows: rows },
      meters: [{ label: '体力', color: '--accent' }, { label: '不安', color: '--enemy', dash: true }, { label: '発見', color: '--love', max: 6 }, { label: 'ストレス', color: '--warn', dash: true }],
      meta: (Pn ? Pn.name : '星なし') + '・12か月',
      relmap: relmap(S),
      summary: '宇宙船漂流記：' + title
    });
  }
  SH.skill = skill; SH.bond = bond;
})();
