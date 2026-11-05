/* @event-ok 長い場面に「場所」を渡す口（候補の絞り込みと残った言い回しの直し。新しい出来事ではない。2026-11-05） */
/* 箱庭シミュレーター（R18版のみ）: 長いエッチの場面の場所（HK.SexSpot）
   ■ 呼ぶ側が HK.ThickSex.scene／HK.ThickEro.scene の opt.spot に場所を渡すと、場所に合わない部品（寝床・シーツ・膝の上・うつ伏せ など）を
     最初から候補に入れない（2026-11-05。電車・同居生活の遊んで確かめた報告の申し送り。設計は docs/reports/2026-11-03/sex-flow-design.md の 9 章）
       bed 寝室・寝床／sofa ソファ／floor 床／wall 壁際（立ったまま）／door 玄関／kitchen 台所／bath 風呂・脱衣所／stand 立ったまま（場所の語なし）／car 車内（満員の車両・立ったまま）
     ※ opt.place（'goukon'・'room'・'locker' など。その場所ならではの一文を足す箱庭の名前）とは別の欄
   ■ 効くところ（sex-flow-r18.js のいちばん外側の包みが場面のあいだだけ SP.cur に置く）：
       (1) 本体の組み立ての候補（opt.pick を SP.pick で包む）・型（HK.Play）の文の候補（P.pickT）・流れの管理が足す段（pickFrom・fitCand）から、合わない文を外す（残りが無ければ元の表のまま）
       (2) 型の選び方（P.choose）：その場所で使わない体位・入り方・道具の重みを 0 に（KIND の pos・entryNG・propNG と、文の候補が一つも残らない値）
       (3) 組み立てたあと（流れの管理の前と後）：残った言い回しを置き換え（KIND の sub）、置き換えられない文は落とす（SP.fix）
   ■ 判定は sex-flow の (l) と同じ場所の語（HK.SexFlow.PLACE）：場所の語は KIND の allow に入っているものだけを通す
   全年齢版にはこのファイルはない。登場人物はすべて成人として扱う */
(function () {
  'use strict';
  var HK = window.HK;
  if (!HK || HK.SexSpot) return;
  var SP = HK.SexSpot = { cur: null };

  /* 場所の語（sex-flow-r18.js の F.PLACE と同じ。読み込み順に依らないように、ここにも持つ） */
  var PLACE = [
    ['bed', /ベッド|寝床|布団|寝台|シーツ|敷布|寝室/],
    ['sofa', /ソファ|長椅子/],
    ['kitchen', /台所|キッチン|調理台|シンク|流し台/],
    ['bath', /浴室|風呂(?!上が)|湯船|浴槽|シャワー|脱衣所|洗面台/],
    ['desk', /机|デスク|テーブル/],
    ['wall', /壁(?:際|に(?:手|背|押し|もた|預け|つ|両手|額|胸|頬)|へ(?:押し|追い)|を背|に向か)/],
    ['door', /玄関|ドアに|扉に/],
    ['floor', /(?:^|[^寝敷])床(?:に|へ|の上)(?![^。]{0,6}(?:落ち|散ら|脱ぎ|放|投げ|置))|ラグの上|畳の上|絨毯/]
  ];
  /* 寝具の語（台詞の中も見る）・寝て・跨る体勢・膝の上 */
  var BEDW = /寝床|ベッド|シーツ|布団|毛布|枕|寝台|敷布/, BEDQ = /寝床|ベッド|シーツ|布団|枕|寝台|敷布/;
  var LIE = /うつ伏せ|仰向け|横たえ|押し倒|寝かせ|組み敷|四つん這い|腰の上|跨が|跨っ|跨り|跨い|馬乗り|寝バック|覆いかぶさ/;
  var LAP = /膝の上|膝に跨|膝へ跨|膝をまたが|向かい合わせに膝/;
  var STAND_SUB = [
    [/毛布を引き寄せて顔を隠した/g, '相手の胸に顔を埋めて隠した'], [/シーツを握りしめ/g, '服の裾を握りしめ'], [/シーツを掴/g, '服の裾を掴'], [/指がシーツを/g, '指が服の裾を'],
    [/爪先がシーツを掻き/g, '爪先が床を掻き'], [/シーツの擦れる音/g, '服の擦れる音'], [/握っていたシーツ/g, '握っていた服の裾'],
    [/をうつ伏せに返し、/g, 'を後ろへ向かせ、'], [/をうつ伏せにさせ、/g, 'を後ろへ向かせ、'], [/をうつ伏せにして、/g, 'を後ろへ向かせて、'],
    [/腰だけを引き上げさせた/g, '腰を突き出させた'], [/腰だけを引き上げて/g, '腰を突き出させて'],
    [/を抱き起こして膝の上に座らせ、/g, 'を抱え上げ、'], [/を膝の上に抱き上げ、/g, 'を抱え上げ、'], [/膝の上の/g, '抱え上げた'], [/の上から降りた/g, 'から体を離した']
  ];
  /* 車内：手すり・扉（電車の報告 1・8。solo-train.js の置き換えを本体へ） */
  var CAR_SUB = [
    [/毛布を引き寄せて顔を隠した/g, '相手の胸に顔を埋めて隠した'], [/シーツを握りしめ/g, '手すりを握りしめ'], [/シーツを掴/g, '手すりを掴'], [/指がシーツを/g, '指が手すりを'],
    [/爪先がシーツを掻き/g, '爪先が床を掻き'], [/シーツの擦れる音/g, '服の擦れる音'], [/握っていたシーツ/g, '握っていた手すり'], [/寝床の端を掴/g, '扉の手すりを掴'],
    [/寝床から浮/g, '扉から浮'], [/背中がシーツから浮/g, '背中が扉から浮'], [/シーツに顔を埋めて/g, '扉に額を押し当てて'],
    [/をうつ伏せに返し、/g, 'を扉のほうへ向かせ、'], [/をうつ伏せにさせ、/g, 'に扉へ手をつかせ、'], [/をうつ伏せにして、/g, 'を扉のほうへ向かせて、'],
    [/腰だけを引き上げさせた/g, '腰を突き出させた'], [/腰だけを引き上げて/g, '腰を突き出させて'],
    [/を抱き起こして膝の上に座らせ、/g, 'を抱え上げ、'], [/を膝の上に抱き上げ、/g, 'を抱え上げ、'], [/膝の上の/g, '抱え上げた'], [/の上から降りた/g, 'から体を離した']
  ];
  var BED_SUB = [];
  /* allow：通す場所の語／ng：ほかに外す言い回し（地の文）／ngQ：台詞の中も外す語／pos：使う体位（HK.Play）／entryNG・propNG：使わない入り方・道具 */
  var KIND = SP.KIND = {
    bed: { ja: '寝室', allow: ['bed'], pos: ['seijo', 'back', 'kijo', 'zai', 'osae', 'nebak'], entryNG: [], propNG: [], sub: BED_SUB },
    sofa: { ja: 'ソファ', allow: ['sofa'], ng: /寝室|寝台/, ngQ: BEDQ, pos: ['zai', 'kijo'], entryNG: ['nekomi'], propNG: ['kagami'], sub: STAND_SUB },
    floor: { ja: '床', allow: ['floor'], ngQ: BEDQ, pos: ['seijo', 'back', 'kijo', 'osae'], entryNG: ['nekomi', 'bath'], propNG: [], sub: STAND_SUB },
    wall: { ja: '壁際', allow: ['wall'], ng: new RegExp(LIE.source + '|' + LAP.source), ngQ: BEDW, pos: ['tachi'], entryNG: ['nekomi', 'push'], propNG: [], sub: STAND_SUB },
    door: { ja: '玄関', allow: ['door', 'wall'], ng: new RegExp(LIE.source + '|' + LAP.source), ngQ: BEDW, pos: ['tachi'], entryNG: ['nekomi', 'push', 'bath'], propNG: ['kagami'], sub: STAND_SUB },
    kitchen: { ja: '台所', allow: ['kitchen', 'wall'], ng: new RegExp(LIE.source + '|' + LAP.source), ngQ: BEDW, pos: ['tachi'], entryNG: ['nekomi', 'push'], propNG: ['kagami'], sub: STAND_SUB },
    bath: { ja: '風呂', allow: ['bath', 'wall'], ng: new RegExp(LIE.source + '|' + LAP.source), ngQ: BEDW, pos: ['tachi'], entryNG: ['nekomi', 'push'], propNG: ['chakui'], sub: STAND_SUB },
    stand: { ja: '立ったまま', allow: ['wall', 'door'], ng: new RegExp(LIE.source + '|' + LAP.source), ngQ: BEDW, pos: ['tachi', 'back', 'kakae'], entryNG: ['nekomi', 'push'], propNG: [], sub: STAND_SUB },
    car: { ja: '車内', allow: [], ng: new RegExp(LIE.source + '|' + LAP.source + '|ソファ|目隠し'), ngQ: BEDW, pos: ['tachi', 'back'], entryNG: ['nekomi', 'push', 'bath'], propNG: ['mekakushi', 'kagami', 'lotion'], sub: CAR_SUB }
  };
  /* 呼ぶ側の書き方の揺れ（'standing'・'train' など）をそろえる */
  var ALIAS = { bedroom: 'bed', standing: 'stand', train: 'car', genkan: 'door', entrance: 'door', shower: 'bath', datsui: 'bath' };
  SP.norm = function (s) { s = String(s || ''); s = ALIAS[s] || s; return KIND[s] ? s : ''; };
  SP.of = function (opt) { return opt ? SP.norm(opt.spot) : ''; };

  function narr(s) { return String(s).replace(/[^]*/g, '').replace(/「[^」]*」/g, '').replace(/『[^』]*』/g, ''); }
  function placesOf(n) {
    var out = [];
    PLACE.forEach(function (p) { var m = p[1].exec(n); if (m && n.substr(m.index + m[0].length, 2) !== 'より') out.push(p[0]); });
    return out;
  }
  SP.placesOf = placesOf;
  /* この場所に合う文か（地の文の場所の語・言い回しと、台詞の中の寝具の語） */
  SP.fits = function (t, spot) {
    var K = KIND[SP.norm(spot)];
    if (!K || typeof t !== 'string') return true;
    var n = narr(t);
    if (K.ng && K.ng.test(n)) return false;
    if (K.ngQ && K.ngQ.test(t)) return false;
    return placesOf(n).every(function (k) { return K.allow.indexOf(k) >= 0; });
  };
  /* 置き換え（KIND の sub）で直せる文は、直したあとで見る（候補を減らしすぎて同じ文が重ならないように） */
  function subbed(t, K) { (K.sub || []).forEach(function (x) { t = t.replace(x[0], x[1]); }); return t; }
  SP.fitsSub = function (t, spot) { var K = KIND[SP.norm(spot)]; return !K || typeof t !== 'string' || SP.fits(subbed(t, K), spot); };
  /* 候補の表を絞る（残りが無ければ元の表のまま） */
  SP.filter = function (list, spot) {
    if (!spot || !Array.isArray(list) || list.length < 2) return list;
    var f = list.filter(function (x) { return typeof x !== 'string' || SP.fitsSub(x, spot); });
    return f.length ? f : list;
  };
  /* 候補を選ぶ関数を包む（本体の組み立ての opt.pick） */
  SP.pick = function (pick, spot) {
    if (!spot || typeof pick !== 'function') return pick;
    var f = function (l) { return pick.call(this, SP.filter(l, spot)); };
    Object.keys(pick).forEach(function (k) { f[k] = pick[k]; });
    return f;
  };
  /* 型の値：この場所で使う体位か・使う入り方・道具か */
  SP.okPos = function (spot, v) { var K = KIND[SP.norm(spot)]; return !K || K.pos.indexOf(v) >= 0; };
  SP.okEntry = function (spot, v) { var K = KIND[SP.norm(spot)]; return !K || K.entryNG.indexOf(v) < 0; };
  SP.okProp = function (spot, v) { var K = KIND[SP.norm(spot)]; return !K || K.propNG.indexOf(v) < 0; };

  /* 文に分ける（「」の中の。！？では切らない） */
  function sents(p) {
    var out = [], d = 0, st = 0;
    for (var i = 0; i < p.length; i++) {
      var c = p.charAt(i);
      if (c === '「') d++;
      else if (c === '」') d = Math.max(0, d - 1);
      else if (!d && (c === '。' || c === '！' || c === '？')) { var e = i + 1; while (p.charAt(e) === '」') e++; out.push(p.slice(st, e)); st = e; i = e - 1; }
    }
    if (st < p.length) out.push(p.slice(st));
    return out;
  }
  /* 組み立てたあとの直し：言い回しを置き換え、置き換えられない文は落とす（文を落として空になった段落は段落ごと落とす） */
  SP.fix = function (t, spot) {
    var K = KIND[SP.norm(spot)];
    if (!K || typeof t !== 'string' || !t) return t;
    (K.sub || []).forEach(function (x) { t = t.replace(x[0], x[1]); });
    return t.split('\n\n').map(function (p) {
      var ss = sents(p), keep = ss.filter(function (x) { return SP.fits(x, spot); });
      if (keep.length === ss.length) return p;
      var rest = keep.join('');
      return narr(rest).replace(/\{[ab]\}|[\s　―…]/g, '').length >= 6 || /「/.test(rest) ? rest : '';
    }).filter(function (p) { return /\S/.test(p); }).join('\n\n');
  };
})();
