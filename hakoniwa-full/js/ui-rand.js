/* 箱庭シミュレーター: 住人のランダム生成（住人タブの「ランダムで1人追加」。全年齢版・R18版共通。ui.js の前に読む）
   HK.RandChar.make({ style, names }) → ui.js の mk に渡す住人の素（name・eg・gender・likes・pos・tone・age・memo・build・height・race・R18版は night）。
   ・style：''（おまかせ＝和風7・洋風3）／'ja' 和風／'en' 洋風／'mob' モブ風の住人（合コンなどのモブの名前の表 HK.Mob を流用。メモに「モブ風」）
   ・名前は今いる住人（names）と重ならないものにする（重なるときは「２」などを付ける）
   ・エゴグラムは5文字コード（A〜D）を乱数で決めて HK.fromCode で値にする（コードと値がそろう）
   ・口調は登録済みの口調（HK.TONE_KEYS）から。性別に合わない口調（お嬢様・紳士 など）は選ばない。3割強はおまかせ（エゴグラムから）
   ・年齢は 20〜59（登場人物はすべて成人）。職業はメモに書く（結果には影響しない）。種族は人間が多め
   ・夜の性格（attr.js の A.NIGHT）は R18版のときだけ。全年齢では決めない
   画面の乱数（Math.random）を使う。箱庭の実行の乱数（シード）には関わらない */
(function () {
  'use strict';
  var HK = window.HK;
  if (!HK) return;
  function L(s) { return s.split('|'); }
  var R = function (n) { return Math.floor(Math.random() * n); };
  var pick = function (a) { return a[R(a.length)]; };
  var NAMES = {
    jaSur: L('朝倉|篠宮|葛城|結城|藤堂|水無瀬|一ノ瀬|鳴海|霧島|久遠|天野|真田|桐谷|日向|千早|不破|椎名|宗像|来栖|槙村|冬木|高遠|春日|秋月|夏目|宇佐美|吾妻|伊吹|皆川|白峰|神崎|芹沢|三条|風間|若林|榊|瀬尾|小田切|御堂|月島'),
    jaM: L('蒼|悠真|颯太|恭介|誠司|慎也|拓海|隼人|一真|透|遼|創|樹|陽太|奏太|大和|蓮司|尚人|昴|圭吾|直哉|将臣|航|朔也|啓'),
    jaF: L('美咲|結衣|千夏|紗英|小春|菫|柚葉|真白|杏|詩織|七海|唯|彩花|環|花音|沙耶|桜子|佳乃|美鈴|香澄|夏帆|梓|朱里|瑞希|楓花'),
    jaX: L('真澄|千尋|渚|薫|司|晶|伊織|和泉|翼|光|瑞穂|悠|歩|忍|周'),
    enM: L('アレン|ルーク|ノア|エリオット|ジュリアン|セオドア|レオン|オスカー|ヴィクター|フェリクス|アーサー|ギルバート|ルイス|エドガー|シリル|ダミアン|ローガン|イーサン|ミハイル|ラファエル'),
    enF: L('アリス|クレア|エマ|ソフィア|ルーシー|イザベル|オリヴィア|セシリア|ヴィオラ|リリィ|エレナ|マリア|ローザ|アメリア|フィオナ|ジゼル|ミレーユ|カミラ|ヘレナ|シャーロット'),
    enX: L('ノエル|アシュリー|ジェイミー|ロビン|ケイ|リヴ|シエル|ユーリ|サシャ|アリエル')
  };
  var JOBS = L('会社員|看護師|大学院生|料理人|刑事|医師|高校教師|小説家|喫茶店の店主|バーテンダー|研究員|漫画家|消防士|弁護士|美容師|花屋|司書|探偵|舞台俳優|大工|獣医|新聞記者|警備員|パティシエ|庭師|薬剤師|写真家|執事|整備士|銀行員|配達員|ピアニスト|古書店の店主|ホテルマン|パイロット|プログラマー|書道家|ジムのトレーナー|陶芸家|保育士');
  var MOB_JOBS = L('通りすがりの会社員|常連客|店員|近所の住人|同じ店の客|駅員|受付係|配達員|隣の席の人|警備員');
  /* 性別に合わない口調（女性に選ばない／男性に選ばない）。ランダムでは選ばない口調も */
  var NG_F = { gentleman: 1, sondai: 1, otaku: 1, chara_down: 1 }, NG_M = { ojou: 1, ane: 1, gyaru: 1 }, NG_ALL = { god: 1 };
  var NIGHT_R = ['sadist', 'maso', 'mean', 'sweet', 'shy'];
  var RC = HK.RandChar = {
    STYLES: [['', '名前：おまかせ'], ['ja', '名前：和風'], ['en', '名前：洋風'], ['mob', 'モブ風の住人']]
  };
  function zen(n) { return String(n).replace(/\d/g, function (d) { return String.fromCharCode(d.charCodeAt(0) + 0xFEE0); }); }
  function uniq(make, used) {
    for (var i = 0; i < 40; i++) { var n = make(); if (!used[n]) return n; }
    var b = make();
    for (var k = 2; k < 1000; k++) if (!used[b + zen(k)]) return b + zen(k);
    return b + Date.now().toString(36).slice(-4);
  }
  function nameOf(style, g, used) {
    var gk = g === 'm' ? 'M' : g === 'f' ? 'F' : 'X';
    if (style === 'mob') {
      var pool = [];
      ['sur', 'zombie.jp'].forEach(function (k) { (HK.Mob ? HK.Mob.list(k) : []).forEach(function (n) { if (pool.indexOf(n) < 0) pool.push(n); }); });
      if (!pool.length) pool = NAMES.jaSur;
      return uniq(function () { return pick(pool); }, used);
    }
    if (style === 'en') return uniq(function () { return pick(NAMES['en' + gk]); }, used);
    /* 和風：苗字だけか、下の名前だけ（結果の文では一語の名前が読みやすい） */
    return uniq(function () { return Math.random() < 0.5 ? pick(NAMES.jaSur) : pick(NAMES['ja' + gk]); }, used);
  }
  /* 資格や経験の要る職業は 25 歳から */
  var PRO = { 医師: 1, 弁護士: 1, 獣医: 1, 薬剤師: 1, 刑事: 1, パイロット: 1, 高校教師: 1, 研究員: 1, 執事: 1, 書道家: 1 };
  function ageOf(job) {
    if (job === '大学院生') return 22 + R(6);
    var b = pick([20, 20, 20, 30, 30, 40, 50]);
    return Math.max(PRO[job] ? 25 : 20, b + R(10));
  }
  /* 身長（cm）：性別と体格からの目安に、ばらつきを足す */
  function heightOf(g, build) {
    var base = g === 'm' ? 172 : g === 'f' ? 159 : 165, sd = g === 'x' ? 8 : 6;
    base += build === 'small' ? -8 : build === 'large' ? 9 : 0;
    var v = base + Math.round((Math.random() + Math.random() + Math.random() - 1.5) * sd * 1.4);
    return String(Math.max(140, Math.min(200, v)));
  }
  RC.make = function (o) {
    o = o || {};
    var used = {}; (o.names || []).forEach(function (n) { used[n] = 1; });
    var style = o.style === 'ja' || o.style === 'en' || o.style === 'mob' ? o.style : Math.random() < 0.7 ? 'ja' : 'en';
    var r = Math.random(), g = r < 0.47 ? 'm' : r < 0.94 ? 'f' : 'x';
    var code = ''; for (var i = 0; i < 5; i++) code += 'ABCD'.charAt(R(4));
    var opp = g === 'm' ? 'f' : g === 'f' ? 'm' : 'both', r2 = Math.random();
    var likes = r2 < 0.55 ? opp : r2 < 0.8 ? 'both' : r2 < 0.95 ? (g === 'x' ? 'both' : g) : '';
    var r3 = Math.random(), pos = r3 < 0.4 ? '' : r3 < 0.6 ? 'top' : r3 < 0.85 ? 'bottom' : 'riba';
    var keys = (HK.TONE_KEYS || HK.PERSONA_KEYS || []).filter(function (k) { return !NG_ALL[k] && !(g === 'f' && NG_F[k]) && !(g === 'm' && NG_M[k]); });
    var tone = keys.length && Math.random() >= 0.35 ? pick(keys) : '';
    var job = style === 'mob' ? pick(MOB_JOBS) : pick(JOBS);
    var r4 = Math.random(), build = r4 < 0.3 ? '' : r4 < 0.5 ? 'small' : r4 < 0.8 ? 'avg' : 'large';
    var A = HK.Attr, races = A ? A.RACE.map(function (x) { return x[0]; }).filter(function (k) { return k && k !== 'human' && k !== 'other'; }) : [];
    var c = {
      name: nameOf(style, g, used), eg: HK.fromCode(code), gender: g, likes: likes, pos: pos, tone: tone,
      age: String(ageOf(job)), memo: style === 'mob' ? 'モブ風（' + job + '）' : job, build: build,
      height: Math.random() < 0.85 ? heightOf(g, build) : '',
      race: style !== 'mob' && races.length && Math.random() < 0.18 ? pick(races) : ''
    };
    /* 夜の性格（R18版だけ） */
    if (!HK.SAFE_ON && Math.random() < 0.6) c.night = pick(NIGHT_R);
    return c;
  };
})();
