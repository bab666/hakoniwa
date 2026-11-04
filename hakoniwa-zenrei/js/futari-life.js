/* 箱庭シミュレーター: 今日から同居生活の「暮らしの一幕」（両ビルド。かたまり scen-futari。scenario-futari.js・futari-house.js より後に読む。2026-11-04 担当FT）
   利用者の指示（不具合リスト 1104 の NO 6 の追記）：話題の出来事が一日の大半を占めることがあった。疑似親子・敬愛・愛憎・同じグループの二人など、
   関係の制限がある二人でも、同じ家に暮らしていれば出せる生活の出来事を足す（恋愛にも友情にも寄らない書き方。家族の二人にも出してよい）。
   食卓・休日の朝・仕事帰り・買い物・洗面所の朝・夜食・宅配便・看病・テレビ・雨の洗濯物・ゴミ出し・帰りが遅い連絡 の 12 種。各 4 文、一回の遊びで同じ文は一度だけ。
   料理・家事を受け持つ文は、家事をしない人（futari-house.js の canChore・cookGood）を主語にしない。
   台詞は3本「くだけた常体｜硬い常体｜敬語」（一人称は「私」、二人称は「あなた」）。性的な文は書かない。登場人物はすべて成人として扱う */
/* @event scen=futari id=ft_l_table cat=bond tie=- label=同じ食卓で夕飯を食べる二人 */
/* @event scen=futari id=ft_l_holiday cat=bond tie=- label=休日の朝の同居人どうし */
/* @event scen=futari id=ft_l_home cat=help tie=- label=仕事帰りの同居人を迎える */
/* @event scen=futari id=ft_l_shop cat=bond tie=- label=二人で日用品の買い出しに行く */
/* @event scen=futari id=ft_l_sink cat=bond tie=- label=朝の洗面所の順番を譲り合う */
/* @event scen=futari id=ft_l_snack cat=bond tie=- label=夜更けの台所で夜食を分け合う */
/* @event scen=futari id=ft_l_parcel cat=help tie=- label=同居人あての宅配便を受け取る */
/* @event scen=futari id=ft_l_sick cat=help tie=- label=熱を出した同居人の世話をする */
/* @event scen=futari id=ft_l_tv cat=bond tie=- label=居間のテレビを一緒に眺める */
/* @event scen=futari id=ft_l_rain cat=help tie=- label=急な雨で洗濯物を取り込む */
/* @event scen=futari id=ft_l_trash cat=help tie=- label=ゴミ出しの日の朝のひとこと */
/* @event scen=futari id=ft_l_late cat=bond tie=- label=帰りが遅くなる連絡を入れる */
(function () {
  'use strict';
  var HK = window.HK, FC = HK && HK.FutariCore;
  if (!FC || !FC.ev) return;
  var L = FC.L;
  function home(ctx, a, b) { return !!b && FC.sameHome(ctx, a, b) && !FC.onTrip(ctx, a) && !FC.onTrip(ctx, b); }
  function cook(ctx, c) { return !HK.FutariHouse || HK.FutariHouse.cookGood(ctx, c); }
  function chore(ctx, c) { return !HK.FutariHouse || HK.FutariHouse.canChore(ctx, c); }
  /* 一日に一つの種類は一度まで */
  function once(id) { return function (ctx) { var f = ctx.ft, k = 'life_' + id; if (f[k] === f.day) return false; return true; }; }
  function mark(id) { return function (ctx) { ctx.ft['life_' + id] = ctx.ft.day; }; }
  function add(o) {
    var n0 = o.need, f0 = o.fx, id = o.id.replace(/^ft_l_/, '');
    o.need = function (ctx, a, b) { return home(ctx, a, b) && once(id)(ctx) && (!n0 || n0(ctx, a, b)); };
    o.fx = function (ctx, a, b, c) { mark(id)(ctx); if (f0) f0(ctx, a, b, c); };
    var arr = o.lines; o.pool = function () { return arr; };
    /* 三人以上の家は、ほかの住人どうしの出来事が多いので控えめに（二人だけの家の穴埋めが主な役目） */
    var w0 = o.w; o.w = function (ctx) { return w0 * (ctx.chars.length <= 2 ? 1 : 0.35); };
    FC.ev(o);
  }
  add({ id: 'ft_l_table', label: '同じ食卓で夕飯を食べる二人', cat: 'bond', tm: 'e', w: 1.0, spot: function () { return '自宅の食卓'; },
    need: function (ctx, a) { return cook(ctx, a); },
    lines: L('{a}の作った肉じゃがを、{b}は黙って二杯おかわりした。{a}は何も言わなかったが、鍋が空になったのを見て、少しだけ口元をゆるめた。|夕飯の食卓で、{a}と{b}はその日あったことを一つずつ話した。大した話ではなかったが、箸はいつもよりゆっくり進んだ。|{a}が味噌汁の味見を頼むと、{b}は「もう少し濃くてもいい｜もう少し濃くていい｜もう少し濃くてもいいと思います」と言った。次の日から、味噌汁の味が少しだけ変わった。|{a}と{b}は、向かい合って焼き魚をつついた。骨の取り方がそれぞれ違うのが、なんだか可笑しかった。'),
    fx: function (ctx, a, b) { ctx.mod2(a, b, { aff: 1, trust: 2 }, { aff: 1, trust: 2 }); }, why: '同じ食卓で夕飯' });
  add({ id: 'ft_l_holiday', label: '休日の朝の同居人どうし', cat: 'bond', tm: 'm', w: 1.0, spot: function () { return '自宅の居間'; },
    need: function (ctx) { return ctx.ft.hol; },
    lines: L('休日の朝、{a}が起きてくると、{b}はもう居間で新聞を広げていた。{b}「コーヒー、まだ温かいよ｜コーヒーは、まだ温かい｜コーヒー、まだ温かいですよ」|休みの日の朝は、家じゅうがのんびりしていた。{a}と{b}は、どちらも寝間着のまま、昼近くまで居間でごろごろしていた。|{a}は休日の朝に掃除機をかける派で、{b}は昼まで寝ていたい派だった。二人は、掃除機は十時から、という決まりをその場で作った。|休日の朝、{a}と{b}は同じ時間に台所に立って、なんとなく二人分のトーストを焼いた。'),
    fx: function (ctx, a, b) { ctx.mod2(a, b, { aff: 1 }, { aff: 1 }); ctx.stress(a, -3); ctx.stress(b, -3); }, why: '休日の朝' });
  add({ id: 'ft_l_home', label: '仕事帰りの同居人を迎える', cat: 'help', tm: 'e', w: 0.9, spot: function () { return '自宅の玄関'; },
    need: function (ctx) { return !ctx.ft.hol; },
    lines: L('{b}が仕事から帰ると、玄関の明かりがついていた。{a}「おかえり。風呂、沸いてるよ｜おかえり。風呂は沸いている｜おかえりなさい。お風呂、沸いてますよ」|疲れた顔で帰ってきた{b}に、{a}は何も訊かずに温かいお茶を出した。{b}は湯呑みを両手で包んで、長い息を吐いた。|{a}は、{b}の帰りが遅い日は、居間の明かりを一つ残しておくようになっていた。{b}は、それに気づいていた。|{b}は玄関で靴を脱ぎながら、「ただいま｜ただいま｜ただいま帰りました」と言った。返ってくる声があるのに、まだ少し慣れなかった。'),
    fx: function (ctx, a, b) { ctx.mod(b, a, { aff: 1, trust: 3 }); ctx.stress(b, -5); }, why: function (ctx, a, b) { return b.name + 'の仕事帰りを、' + a.name + 'が迎えた'; } });
  add({ id: 'ft_l_shop', label: '二人で日用品の買い出しに行く', cat: 'bond', tm: 'd', w: 0.9, spot: function () { return '近所のスーパー'; },
    need: function (ctx) { return ctx.ft.hol; },
    lines: L('{a}と{b}は、近所のスーパーで日用品をまとめ買いした。洗剤の銘柄で少しもめて、結局二種類買った。|買い出しのメモを持ってきたのは{a}だったが、メモにない菓子をかごに入れたのも{a}だった。{b}は、黙って同じ菓子をもう一つ入れた。|{a}と{b}は、重い米の袋を交代で持って帰った。家に着くころには、どちらも腕が棒のようになっていた。|スーパーのレジで、{a}と{b}は割り勘の計算をした。端数の十円は、じゃんけんで{b}が払った。'),
    fx: function (ctx, a, b) { ctx.mod2(a, b, { aff: 1 }, { aff: 1 }); }, why: '休日の買い出し' });
  add({ id: 'ft_l_sink', label: '朝の洗面所の順番を譲り合う', cat: 'bond', tm: 'm', w: 0.8, spot: function () { return '自宅の洗面所'; },
    lines: L('朝の洗面所で、{a}と{b}は鉢合わせた。どちらも一歩下がって譲り合い、結局並んで歯を磨いた。|{a}が洗面所を使っているあいだ、{b}は廊下で待っていた。{a}「あと一分｜あと一分だ｜あと一分です」――一分は、三分になった。|洗面台の棚に、{a}と{b}の歯ブラシと整髪料が、いつの間にか半分ずつ並んでいた。|{b}は、{a}が朝の洗面所を使う時間を覚えて、その前に顔を洗うようになった。'),
    fx: function (ctx, a, b) { ctx.mod2(a, b, { aff: 1, trust: 1 }, { aff: 1, trust: 1 }); }, why: '朝の洗面所' });
  add({ id: 'ft_l_snack', label: '夜更けの台所で夜食を分け合う', cat: 'bond', tm: 'n', w: 0.8, spot: function () { return '自宅の台所'; },
    lines: L('夜更けに台所へ行くと、{b}が先にカップ麺の湯を沸かしていた。{a}が黙って自分のカップを差し出すと、{b}も黙ってお湯を注いだ。|{a}と{b}は、夜中の台所で一つのおにぎりを半分に分けた。どちらも、夜食を食べるところを見られたくなかったらしい。|{b}「眠れない？｜眠れないのか？｜眠れませんか？」――夜中の台所で、{b}は{a}に温めた牛乳を出した。|冷蔵庫の明かりの前で、{a}と{b}は残り物の煮物をつまんだ。翌朝の分は、ちゃんと残しておいた。'),
    fx: function (ctx, a, b) { ctx.mod2(a, b, { aff: 1 }, { aff: 1 }); }, why: '夜更けの台所' });
  add({ id: 'ft_l_parcel', label: '同居人あての宅配便を受け取る', cat: 'help', tm: 'de', w: 0.6, spot: function () { return '自宅の玄関'; },
    lines: L('{b}が留守のあいだに、{b}あての宅配便が届いた。{a}は代わりに受け取って、{b}の部屋の前にそっと置いておいた。|大きな段ボールが二つ、玄関に届いた。中身は{b}の通販の買い物だった。運び込むのを手伝った{a}は、何を買ったのかは訊かなかった。|{a}は再配達の不在票を、{b}の目につくように冷蔵庫に貼っておいた。|{b}が受け取った荷物は、実家から届いた野菜の箱だった。{b}は半分を{a}に分けた。'),
    fx: function (ctx, a, b) { ctx.mod(b, a, { trust: 3 }); }, why: function (ctx, a, b) { return b.name + 'あての荷物を、' + a.name + 'が受け取った'; } });
  add({ id: 'ft_l_sick', label: '熱を出した同居人の世話をする', cat: 'help', tm: 'me', w: 0.5, spot: function () { return '自宅の寝室'; },
    need: function (ctx, a) { return ctx.ft.day >= 2 && chore(ctx, a); },
    lines: L('{b}が熱を出して寝込んだ。{a}は枕元に水とゼリーを置いて、「何かあったら呼んで｜何かあったら呼べ｜何かあったら呼んでください」とだけ言った。|{a}は、寝込んだ{b}の部屋の前を、一時間おきに通った。扉は開けなかったが、足音だけで{b}には分かった。|{b}の風邪が治った朝、{a}の机の上に、{b}の字で「ありがとう」と書いた付箋が貼ってあった。|{a}は、熱でぼんやりしている{b}のために、薬局で薬と冷却シートを買ってきた。'),
    fx: function (ctx, a, b) { ctx.mod(b, a, { aff: 1, trust: 5 }); ctx.stress(b, -4); }, why: function (ctx, a, b) { return b.name + 'の看病（' + a.name + 'の世話焼き）'; } });
  add({ id: 'ft_l_tv', label: '居間のテレビを一緒に眺める', cat: 'bond', tm: 'en', w: 0.8, spot: function () { return '自宅の居間'; },
    lines: L('{a}が見ていた料理番組を、{b}もいつの間にか隣で見ていた。番組が終わると、二人とも無性にお腹がすいていた。|居間のテレビのチャンネルは、いつの間にか曜日ごとに{a}と{b}で交代することになっていた。|{a}と{b}は、クイズ番組の答えを先に言い合った。勝ったのは{b}だったが、{a}は最後まで認めなかった。|夜のニュースを、{a}と{b}は黙って眺めていた。天気予報だけ、二人とも少し身を乗り出した。'),
    fx: function (ctx, a, b) { ctx.mod2(a, b, { aff: 1 }, { aff: 1 }); }, why: '居間のテレビ' });
  add({ id: 'ft_l_rain', label: '急な雨で洗濯物を取り込む', cat: 'help', tm: 'de', w: 0.6, spot: function () { return '自宅のベランダ'; },
    need: function (ctx, a) { return chore(ctx, a); },
    lines: L('急に雨が降り出した。{a}は自分の洗濯物と一緒に、{b}の洗濯物も取り込んでおいた。帰ってきた{b}は、たたまれたシャツを見て少し驚いた。|ベランダに干したままの洗濯物に、夕立が降りかかった。{a}と{b}は、二人がかりで大慌てで取り込んだ。|{a}は、天気予報を見て「今日は部屋干し｜今日は部屋干しだ｜今日は部屋干しにしましょう」と{b}に知らせた。居間に、二人分の洗濯物がぶら下がった。|{b}の干した布団が、雨で湿ってしまった。{a}は、自分の毛布を一枚{b}に貸した。'),
    fx: function (ctx, a, b) { ctx.mod(b, a, { aff: 1, trust: 2 }); }, why: function (ctx, a) { return '急な雨（' + a.name + 'が取り込んだ）'; } });
  add({ id: 'ft_l_trash', label: 'ゴミ出しの日の朝のひとこと', cat: 'help', tm: 'm', w: 0.6, spot: function () { return '自宅の玄関'; },
    need: function (ctx, a) { return !ctx.ft.hol && chore(ctx, a); },
    lines: L('{a}はゴミ袋を両手に持って玄関を出ながら、「今日、燃えるゴミの日だよ｜今日は燃えるゴミの日だ｜今日、燃えるゴミの日ですよ」と{b}に声をかけた。|{b}が出し忘れたゴミ袋を、{a}が出勤のついでに持って出た。{b}は、あとでそれに気づいた。|分別の決まりを覚えられない{b}のために、{a}はゴミ箱に色の違うシールを貼った。|ゴミ出しの朝、{a}と{b}は玄関でゴミ袋を一つずつ持って、並んで集積所まで歩いた。'),
    fx: function (ctx, a, b) { ctx.mod(b, a, { trust: 2 }); }, why: 'ゴミ出しの朝' });
  add({ id: 'ft_l_late', label: '帰りが遅くなる連絡を入れる', cat: 'bond', tm: 'de', w: 0.6, spot: function () { return '職場'; },
    need: function (ctx) { return !ctx.ft.hol; },
    lines: L('{a}は、帰りが遅くなることを{b}にメッセージで知らせた。すぐに「了解｜了解｜了解です」と返ってきた。夕飯は、取っておいてくれるらしかった。|残業が決まった{a}は、{b}に「先に寝てて｜先に寝ていてくれ｜先に寝ていてください」と送った。{b}からは、寝ないで待っている猫の絵が返ってきた。|{a}は、駅を出たところで{b}に電話をかけた。{a}「何か買って帰るものある？｜何か買って帰るものはあるか？｜何か買って帰るものはありますか？」|{b}から「帰りに牛乳」とだけ届いた。{a}はそれを、ちゃんと覚えていた。'),
    fx: function (ctx, a, b) { ctx.mod2(a, b, { trust: 2 }, { trust: 2 }); }, why: '帰りが遅くなる連絡' });
})();
