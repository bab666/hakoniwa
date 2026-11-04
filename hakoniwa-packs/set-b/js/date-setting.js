/* デートの日々：行き先の舞台（setting）と、汎用の出来事が出てよい舞台（needs／not）。両方のビルド。2026-11-04（不具合リスト 1104 の 3）
   利用者の指摘「宇宙デートで交番に財布を届ける」「海で傘を忘れる」のような、舞台に合わない汎用の出来事を出さないための表。
   ■ HK.DateSet（DS）
     ・NAME：舞台の印の名前（設計・結果の画面・点検の道具が使う）
       in 屋内／out 屋外／city 街（交番・信号・コンビニ・駅のある街なか）／nature 自然／water 水辺／space 空・宇宙／vehicle 乗り物（船・ロケットの中で過ごす）／home 家／
       abroad 海外／crowd 人混み／shop 店（店の人・会計）／walk 歩き回る／stall 屋台／seat 客席（スクリーン・舞台・ステージを座って見る）／exhibit 展示／sight 名所・観光地／
       night 夜の行き先／kanran 観覧車（行き先の flags から）。区切りの印：ev 夜の区切り（night を足す）／mv 行きの道中（move を足す）
     ・TAG[行き先の id]：行き先ごとの舞台の印（行き先 52 か所すべて。date-places-*.js の行き先に d.set として付ける）
     ・RULE：汎用の文の語ごとの決まり（need＝すべて要る／any＝どれか一つ要る／not＝あってはいけない）。文に語があれば当てる
     ・KIND[表の鍵]：汎用の表の種ごとの決まり（'GEN.otoshimono'・'TOKI.aiai'・'RICH.ヘリコプターで迎えに来る'・'BATTARI' など）
     ・DS.ok(D, 文, 鍵, 区切り)：その行き先・区切りで、その汎用の文を出してよいか。DS.why(…)：だめな理由（点検の道具が使う。よければ ''）
   行き先の自前の文（spot・ev・tr・food・cl・rich）はその行き先のために書いたので、この表では絞らない。点検は hakoniwa-tools/tone-check/date-setting-audit.js */
/* @event-ok 行き先の舞台の印と汎用の出来事の決まりの表（出来事は増やしていない） */
(function () {
  'use strict';
  var HK = window.HK;
  if (!HK) return;
  var P = HK.DatePlaces;
  var DS = HK.DateSet = HK.DateSet || {};
  DS.NAME = { in: '屋内', out: '屋外', city: '街', nature: '自然', water: '水辺', space: '空・宇宙', vehicle: '乗り物', home: '家', abroad: '海外', crowd: '人混み', shop: '店', walk: '歩き回る',
    stall: '屋台', seat: '客席', exhibit: '展示', sight: '名所', night: '夜', kanran: '観覧車', move: '道中' };
  DS.TAG = {
    yuenchi: 'out city crowd shop walk stall', themepark: 'out crowd shop walk stall', ouchi: 'home in', uchu: 'space vehicle in',
    kaigai: 'abroad city out walk shop crowd sight', kyoto: 'city out walk shop crowd sight', hokkaido: 'city out walk shop nature sight water',
    okinawa: 'out water nature walk shop sight city', onsen: 'out in walk shop sight city', cruise: 'vehicle water out in shop sight',
    ski: 'out nature crowd', camp: 'out nature', umi: 'out water nature crowd walk', hiking: 'out nature walk', kamakura: 'out city walk shop crowd sight water',
    hanabi: 'out crowd walk stall night city', pool: 'in water crowd', outlet: 'in out walk shop crowd', shopping: 'city out walk shop crowd',
    tabearuki: 'city out walk shop crowd stall', kagu: 'in shop walk', suizokukan: 'in water shop crowd walk exhibit', eiga: 'in shop seat crowd city',
    bijutsukan: 'in shop walk exhibit city', doubutsuen: 'out walk shop crowd exhibit', planetarium: 'in seat shop exhibit city', cafe: 'city in shop walk',
    picnic: 'out nature walk city', karaoke: 'in shop city', bowling: 'in shop crowd city', honya: 'city in shop walk', jinja: 'out walk sight city',
    tenbo: 'in out shop city night sight crowd', hanami: 'out nature walk crowd stall city', momiji: 'out nature walk sight', illumi: 'out city walk crowd night',
    gekijo: 'in seat shop crowd city', live: 'in crowd shop seat city', yakyu: 'out crowd shop seat city', tougei: 'in shop', nazotoki: 'in shop city',
    boat: 'out water nature', dinner: 'in shop city night', ennichi: 'out crowd walk stall shop night city', nekocafe: 'in shop city', boulder: 'in shop city',
    sweets: 'in shop city', ichigo: 'out nature shop', tsuri: 'out water nature shop', hotel: 'in city sight', aurora: 'abroad out nature in sight', glamping: 'out nature'
  };
  /* 語ごとの決まり（上から順にすべて当てる） */
  DS.RULE = [
    { re: /交番/, need: 'city', not: 'abroad space home vehicle' },
    { re: /コンビニ|信号|横断歩道|自転車|バス(?!ケット)|終点|路地|建物の陰|通りの喧騒|道の端/, need: 'city', not: 'space home vehicle' },
    { re: /電車|駅|改札|乗り換え/, need: 'city', not: 'space' },
    { re: /近道|来た道|反対方向|曲がる角|行き止まり|地図|道案内|道を尋ね|道で困って|寄り道|同じ場所を二回/, need: 'walk', not: 'home space vehicle' },
    { re: /人通り|人混み|人の波|人波|人の流れ|混み合|混雑|人に押され|人混みに押され|迷子の小さな子/, need: 'crowd' },
    { re: /知らない人に(?:声|話)/, need: 'crowd', not: 'home' },
    { re: /通りがかりの人|通りすがり|通りかか|通りがか|看板/, any: 'city walk crowd', not: 'home space' },
    { re: /店の人|店員|レジ|会計|伝票|割り勘|ポイントカード|おまけ|くじ引き|貸し切り|予約した店|昼の店|店を選ぶ|店をのぞ|店へ入|小さな店|好物の店|店の休み|貼り紙|雑貨屋|お土産の店/, need: 'shop', not: 'home' },
    { re: /お土産/, need: 'shop', not: 'home' },
    { re: /定食屋|ラーメン屋|洋食屋|居酒屋|イタリア料理の店|焼肉|お寿司|パン屋|公園のベンチ|鳩/, need: 'city', not: 'abroad space vehicle home' },
    { re: /雨|軒下/, need: 'out', not: 'space home' },
    { re: /傘/, need: 'out', not: 'space home water' },
    { re: /日差し|日陰|風が冷たく|冷え込|夕方の風|風で乱れ|葉っぱ/, need: 'out', not: 'space' },
    { re: /ベンチ/, any: 'out walk', not: 'home space' },
    { re: /自販機/, not: 'space home' },
    { re: /歩い|歩き|歩く|歩幅|歩調|段差|石段|靴擦れ|かかと/, need: 'walk' },
    { re: /閉館/, need: 'in', not: 'home space vehicle' },
    { re: /屋台/, need: 'stall' },
    { re: /スクリーン|上映|客席|肘掛け/, need: 'seat' },
    { re: /ゴンドラ|観覧車/, need: 'kanran' },
    { re: /夜景/, need: 'night' },
    { re: /展示/, need: 'exhibit' },
    { re: /案内図|案内板|パンフレット/, any: 'seat exhibit sight walk', not: 'home' },
    { re: /波打ち際|砂浜|浜辺/, need: 'water' },
    { re: /行きの座席|座席に深く|着くまで|着かなければ/, need: 'move' },
    { re: /眼下で小さく|空港|ジェット機|ヘリコプター/, not: 'space' },
    { re: /屋上/, need: 'city', not: 'space' },
    { re: /リムジン|白くて長い車|店の前に/, need: 'city', not: 'space' },
    { re: /水槽/, need: 'water', any: 'exhibit' }
  ];
  /* 表の種ごとの決まり */
  DS.KIND = {
    'GEN.otoshimono': { need: 'walk', not: 'home space vehicle' }, 'GEN.ame': { need: 'out', not: 'space home' }, 'GEN.hagure': { need: 'crowd' }, 'GEN.nanpa': { need: 'crowd', not: 'home' },
    'GEN.michi': { need: 'walk', not: 'home space vehicle' }, 'GEN.kutsu': { need: 'walk' }, 'GEN.pace': { need: 'walk' }, 'GEN.tsukare': { not: 'home' }, 'GEN.omiyage': { need: 'shop', not: 'home' },
    'GEN.kaikei': { need: 'shop' }, 'GEN.uwasa': { need: 'shop' }, 'GEN.machigai': { need: 'shop' }, 'GEN.osoroi': { need: 'shop', not: 'home' }, 'GEN.kion': { need: 'out' }, 'GEN.juden': { not: 'home' },
    'TOKI.aiai': { need: 'out', not: 'space home water' }, 'TOKI.hagure': { need: 'crowd' }, 'TOKI.kabau': { need: 'crowd' }, 'TOKI.tesashi': { need: 'walk' },
    'HEAT.crowd': { need: 'crowd' }, 'HEAT.quiet': { not: 'space' }, 'HEAT.view': { need: 'night' },
    'RICH.ヘリコプターで迎えに来る': { not: 'space vehicle' }, 'RICH.専属のシェフを呼ぶ': { not: 'space' }, 'RICH.店を丸ごと貸し切る': { need: 'shop city' }, 'RICH.リムジンで送り迎え': { need: 'city' },
    'RICH.百本のバラの花束': { not: 'space' }, 'RICH.二人のためだけに夜空を飾る': { need: 'out', not: 'space' }, 'RICH.プライベートジェットで飛ぶ': { not: 'space vehicle' }, 'RICH.屋上を一晩借りる': { need: 'city', not: 'space' },
    /* 追加の出来事（date-more.js。2026-11-04） */
    'MORE.acc_nanpa': { need: 'crowd', not: 'home space' }, 'MORE.acc_ame': { need: 'out', not: 'space home' }, 'MORE.acc_aiai': { need: 'out', not: 'space home water' },
    'MORE.acc_yuki': { need: 'out', not: 'space' }, 'MORE.acc_kaze': { need: 'out', not: 'space' }, 'MORE.acc_harema': { need: 'out', not: 'space' },
    'MORE.acc_kutsu': { need: 'walk', not: 'home space vehicle' }, 'MORE.acc_saifu': { need: 'shop', not: 'home' }, 'MORE.acc_maigo': { need: 'crowd', not: 'home space' },
    'MORE.acc_photo': { any: 'crowd sight', not: 'home space' }, 'MORE.acc_hitogomi': { need: 'crowd', not: 'home space' }, 'MORE.acc_tokugi': { not: 'space' }, 'MORE.acc_kobosu': { any: 'shop stall' },
    'MORE.sea_hanami': { need: 'out', not: 'space abroad' }, 'MORE.sea_kafun': { need: 'out', not: 'space' }, 'MORE.sea_haru': { need: 'out walk', not: 'space' },
    'MORE.sea_hanabi': { need: 'out night', not: 'space abroad' }, 'MORE.sea_kakigori': { any: 'shop stall', not: 'space abroad' }, 'MORE.sea_yudachi': { need: 'out', not: 'space' },
    'MORE.sea_momiji': { need: 'out', not: 'space' }, 'MORE.sea_kinmokusei': { need: 'out walk', not: 'space abroad' }, 'MORE.sea_aki': { need: 'out', not: 'space' },
    'MORE.sea_illumi': { need: 'out city night', not: 'space' }, 'MORE.sea_tebukuro': { need: 'out', not: 'space' }, 'MORE.sea_iki': { need: 'out', not: 'space' },
    /* 名簿の住人とばったり会う・後日「〇〇で見たよ」：海外・宇宙・船の上・おうちでは会わない */
    BATTARI: { not: 'abroad space vehicle home' }, MITA: { not: 'abroad space vehicle home' }, C_BATTARI: { not: 'abroad space vehicle home' },
    /* 行き先の料理を使い切ったときの街の店の予備 */
    LUNCH: { need: 'city', not: 'abroad space vehicle home' }, DINNER: { need: 'city', not: 'abroad space vehicle home' }
  };
  function tagsOf(D, part) {
    if (!D) return null;
    var t = (D.set || (DS.TAG[D.id] || '').split(' ')).slice();
    if (/(?:^| )kanran(?: |$)/.test(D.flags || '')) t.push('kanran');
    if (part === 'ev') t.push('night');
    if (part === 'mv') t.push('move');
    return t;
  }
  function chk(t, r) {
    var no = function (k) { return t.indexOf(k) < 0; };
    if (r.need && r.need.split(' ').some(no)) return 'need ' + r.need;
    if (r.any && r.any.split(' ').every(no)) return 'any ' + r.any;
    if (r.not && r.not.split(' ').some(function (k) { return t.indexOf(k) >= 0; })) return 'not ' + r.not;
    return '';
  }
  /* だめな理由（よければ ''） */
  DS.why = function (D, text, key, part) {
    var t = tagsOf(D, part);
    if (!t) return '';
    var s = String(text || '');
    if (key) { var kk = String(key).split('.'), r0 = DS.KIND[key] || DS.KIND[kk[0]]; if (r0) { var w0 = chk(t, r0); if (w0) return key + '：' + w0; } }
    for (var i = 0; i < DS.RULE.length; i++) { var r = DS.RULE[i], m = r.re.exec(s); if (m) { var w = chk(t, r); if (w) return '「' + m[0] + '」：' + w; } }
    return '';
  };
  DS.ok = function (D, text, key, part) { return !DS.why(D, text, key, part); };
  DS.tags = tagsOf;
  /* 行き先に印を付ける（このファイルは行き先の表 date-places-*.js のあとに読む） */
  if (P && P.list) P.list.forEach(function (d) { if (DS.TAG[d.id]) d.set = DS.TAG[d.id].split(' '); });
  /* テーマパークには観覧車のスポットが無い（観覧車のゴンドラのキス・観覧車の山場を出さない） */
  if (P && P.by && P.by.themepark) P.by.themepark.flags = 'dark';
})();
