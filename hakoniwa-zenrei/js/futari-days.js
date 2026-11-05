/* 箱庭シミュレーター: 今日から同居生活の「毎日の種」（両ビルド。かたまり scen-futari。scenario-futari.js・futari-house.js・futari-life.js より後に読む。2026-11-04 担当FT）
   利用者の遊んで確かめた報告（2026-11-04 深夜。docs/reports/2026-11-04/train-futari-playtest-1104.md の同居生活）の B・C への対応：
   設定させる項目（同居の理由・暮らし方・家事の分担・住人ごとの家事／生活時間／片づけ・始まりの季節・関係）が初日の説明文で終わっていたので、毎日の出来事の種にする。
   ・同居の理由の種（ft_y_reason）：理由 6 種 × 序盤・中盤・終盤 各 2 文。水漏れは修理の進み、親どうしが決めたは親の目、留守番の家は持ち主からの連絡、家賃は割り勘。結末に「同居の理由のその後」
   ・暮らし方の種（ft_y_liv）：二人だけの家／シェアハウス（共用の居間・ほかの住人の気配）／古い家の留守番 各 5 文
   ・住人の設定の種（ft_y_prof）：家事（よくする・料理が得意・苦手・しない）・生活時間（朝型・夜型）・片づけ（きれい好き・散らかしがち）各 5 文。毎日 1 件は出す
   ・季節の暮らし（ft_y_season）：春・夏・秋・冬 各 6 文（衣替え・扇風機・梅雨の名残の洗濯物・台風・こたつ・結露・雪かき）
   ・関係の種（ft_y_rel）：元恋人・同僚（上司・先輩）・師弟・ライバル・幼馴染・義理のきょうだい・セフレ（R18）の中盤・終盤 各 3 文
   ・恋人どうしの暮らし（ft_y_lovers）・昼の三人（ft_y_tri3：取り合い・やきもち・応援）・近所へのお出かけ（ft_y_out）
   ・空の区切りの暮らしの一幕（HK.FutariDays.after）：その区切りに出来事が一つも無ければ、時間帯の一文を一つ
   ・毎日の種の当番（HK.FutariDays.after）：夕方の区切りの終わりに、その日まだ設定から出た出来事が無ければ、日ごとに順番に一つ
   ・日常の部品（daily-kit）の外出は一回の遊びで同じ出来事を一度まで、初日は街に出ない、夜の繁華街・ファミレスはなじんでから。気分の一句（emotion.js）は一回の遊びで同じ文を一度まで
   ・共通の出来事の見張り（HK.buildPool の包み）：ケンカの無い仲直り・両片想いのあとの「元恋人から友人へ」を出さない。区切り・曜日に合わない文を出さない（FutariCore.textOk）
   台詞は3本「くだけた常体｜硬い常体｜敬語」（一人称は「私」、二人称は「あなた」）。家事・料理の主語は家事をする人だけ。性的な文は r18 の印の中。登場人物はすべて成人として扱う */
/* @event scen=futari id=ft_y_fill cat=bond tie=- label=出来事の無い時間の暮らしの一幕 */
/* @event scen=futari id=ft_y_end cat=bond tie=- label=同居の理由のその後を振り返る最後の日 */
(function () {
  'use strict';
  var HK = window.HK, FC = HK && HK.FutariCore;
  if (!FC || !FC.ev) return;
  var L = FC.L;
  function H() { return HK.FutariHouse || null; }
  function hs(ctx) { return ctx.ft && ctx.ft.house; }
  function prof(ctx, c) { return H() && H().prof ? H().prof(ctx, c) : { chore: 'norm', clock: 'norm', tidy: 'norm' }; }
  function canChore(ctx, c) { return !H() || H().canChore(ctx, c); }
  function inHouse(ctx, a, b) { return !!b && FC.sameHome(ctx, a, b) && FC.together(ctx, a, b) && !FC.onTrip(ctx, a) && !FC.onTrip(ctx, b) && !a.gone && !b.gone; }
  function phaseOf(ctx) { var f = ctx.ft, r = f.day / Math.max(1, f.days - 1); return r < 0.34 ? 'e' : r < 0.67 ? 'm' : 'l'; }
  /* 一日の種の記録（その日に設定から出た出来事の種類） */
  function seedMark(ctx, k) { var f = ctx.ft, S = f.seedDay = f.seedDay || {}; S[k] = f.day; (f.seedN = f.seedN || {})[k] = ((f.seedN || {})[k] || 0) + 1; }
  function seedToday(ctx, k) { var S = ctx.ft.seedDay || {}; return S[k] === ctx.ft.day; }
  function seedAny(ctx) { var S = ctx.ft.seedDay || {}; for (var k in S) if (S[k] === ctx.ft.day) return true; return false; }

  /* ======================= 文 ======================= */
  /* 同居の理由（e＝序盤・m＝中盤・l＝終盤） */
  var REASON = {
    rent: {
      e: L('{a}と{b}は、最初の家賃の振り込みを済ませた。割り勘の計算は、{a}がスマホの電卓で三回確かめた。|[en]郵便受けに、電気代の請求書が届いた。{a}と{b}は、居間のテーブルでそれをきっちり半分に割った。'),
      m: L('光熱費の割り勘のことで、{a}と{b}は小さく揉めた。長風呂のぶんは{b}持ち、ということで決着した。|{a}は、家賃を折半して浮いたお金で、居間に小さなラグを買ってきた。{b}は、その上でさっそく寝転んだ。'),
      l: L('{a}と{b}のもとに、部屋の更新の案内が届いた。{a}「更新する？｜更新するか？｜更新しますか？」――{b}は、案内の紙から顔を上げずに頷いた。|家賃を半分ずつ出す、というだけの約束で始まった暮らしだった。{a}は、今ではそれ以外の理由のほうが多い気がしていた。')
    },
    fire: {
      e: L('管理会社から{a}に連絡が来た。水漏れの修理には、思ったより時間がかかるらしい。{b}は、それを聞いて少しだけほっとした顔をした。|{a}は、水浸しになった前の部屋から運び出した荷物を、まだ段ボールのまま積んでいた。{b}は、その段ボールに「＠＠仮」と書いた付箋を貼った。'),
      m: L('前の部屋の工事が始まった、と{a}のもとに写真が届いた。床板は全部はがされていた。{a}は写真を{b}に見せて、苦笑いした。|{a}の段ボールは、いつの間にか一つずつ減っていた。中身は、この家の棚に少しずつ収まっていた。'),
      l: L('前の部屋の修理が終わった、と管理会社から連絡が来た。{a}はしばらく黙っていたが、{b}は何も訊かなかった。|{a}は、修理が終わった前の部屋の鍵を、引き出しの奥にしまった。{b}は、それを見ないふりをした。')
    },
    parents: {
      e: L('[en]{a}の親から、ちゃんと仲良くやっているかと電話が来た。{a}は、横で聞き耳を立てている{b}を手で追い払った。|{b}の親から、段ボールいっぱいの野菜が届いた。添えられた手紙には、{a}の名前も書いてあった。'),
      m: L('親どうしが、二人の暮らしぶりを見に来ることになった。{a}と{b}は、前の晩に家じゅうを片づけて回った。|{a}の親から、二人の写真を送ってほしいと連絡が来た。{a}と{b}は、居間で並んでぎこちなく一枚撮った。'),
      l: L('親どうしの電話で、二人の様子がすっかり筒抜けになっていた。{a}は、{b}が親に何を話したのか、少しだけ気になった。|親に言われて始めた同居だった。今では、{a}も{b}も、誰に言われたからでもなくこの家に帰ってきていた。')
    },
    recruit: {
      e: L('{a}は、ルームシェアの募集のときに書いた自己紹介を読み返した。「＠＠きれい好き」と書いた自分を、少し恨んだ。|{b}のもとに、募集を見た人から、まだ部屋は空いているかと問い合わせが来た。{b}は短く返事を打った。もう決まりました、と。'),
      m: L('{a}と{b}は、募集のときに決めた「＠＠共用の場所の使い方」の紙を、冷蔵庫から外して書き直した。|{a}は、面談の日の{b}の印象と、今の{b}がずいぶん違うことに気づいた。思っていたより、ずっとよく笑う人だった。'),
      l: L('{b}は、ルームシェアの募集の掲示を、掲示板からそっと外した。もう、新しい相手を探すつもりはなかった。|{a}は、あの募集に応募したのが自分でよかったと思った。口には出さなかった。')
    },
    work: {
      e: L('[m]{a}と{b}は、同じ時間の電車に乗って出勤した。車内では、なんとなく離れて立った。|{a}は職場で、上司から同居の様子を訊かれた。{a}「なんとか、やってる｜なんとか、やっている｜なんとか、やっています」――それ以上は、うまく言えなかった。'),
      m: L('会社の借り上げの部屋の点検の日が来た。{a}と{b}は、前の晩に慌てて廊下を片づけた。|{a}の帰りが遅い雨の日は、{b}が駅まで傘を持って迎えに出るようになった。'),
      l: L('{a}に、次の異動の内示が出た。行き先は、まだ決まっていない。{b}は、その話を聞いて、しばらく黙っていた。|同じ会社の、同じ借り上げの部屋。{a}と{b}は、仕事の話を家に持ち込まないという決まりを、いつの間にか破るようになっていた。')
    },
    house: {
      e: L('古い家の床は、歩くたびにきしんだ。{a}と{b}は、どこを踏めば音がしないかを、一日がかりで覚えた。|家の持ち主から、庭の木に水をやってほしいと連絡が来た。{a}と{b}は、ホースを取り合って水をまいた。'),
      m: L('[e]古い家の雨どいが詰まって、雨水が縁側にあふれた。{a}と{b}は、ずぶ濡れになりながらバケツで水をかき出した。|{a}は、押し入れの奥から古いアルバムを見つけた。家の持ち主の若い頃の写真に、{b}と二人で見入った。'),
      l: L('家の持ち主から、来月には戻るという手紙が届いた。{a}と{b}は、縁側に並んでそれを読んだ。|留守を預かるだけのはずの古い家に、{a}と{b}の暮らしの跡が増えていた。柱の傷が、一本だけ新しかった。')
    }
  };
  var REASON_N = { rent: '家賃の割り勘', fire: '前の部屋の修理', parents: '親の目', recruit: 'ルームシェアの募集', work: '仕事の都合', house: '留守番の家' };
  /* 結末：同居の理由のその後（打ち解けた家／ぎこちない家） */
  var REASON_END = {
    rent: { warm: '家賃を折半するための同居は、更新の時期が来ても続くことになった。', stiff: '次の更新の時期には、それぞれ別の部屋を探すことになりそうだった。' },
    fire: { warm: '前の部屋の修理は終わったが、{a}はこの家に残ることにした。', stiff: '前の部屋の修理が終わると、{a}は荷物をまとめて戻っていった。' },
    parents: { warm: '親どうしが決めた同居は、親に報告するたびに、少しずつ二人のものになった。', stiff: '親どうしが決めた同居のことを、二人は親に「なんとかやっている」としか言わなかった。' },
    recruit: { warm: 'ルームシェアの募集の掲示は、二度と出されなかった。', stiff: '同じ募集の掲示が、また掲示板に出されることになった。' },
    work: { warm: '仕事の都合で始まった同居は、異動の話が来ても、二人で続けることにした。', stiff: '仕事の都合で始まった同居は、次の異動とともに終わることになった。' },
    house: { warm: '留守を預かった古い家を出たあとも、二人は持ち主に手紙を書き続けた。', stiff: '留守番の期間が終わると、二人は古い家の鍵を持ち主に返して、それぞれの家へ帰った。' }
  };
  var REASON_ENDT = {
    rent: L('{n}日目の夕方、{a}と{b}は、来月の家賃の振り込みの話をした。誰も「最後の」とは言わなかった。'),
    fire: L('{n}日目の夕方、{a}は修理の終わった前の部屋の鍵を手に取った。{b}は、何も言わずにお茶を淹れた。'),
    parents: L('{n}日目の夕方、{a}は親に電話をかけた。{b}は隣で、聞こえないふりをした。'),
    recruit: L('{n}日目の夕方、{a}と{b}は、募集の掲示に書いた自己紹介を見せ合って笑った。'),
    work: L('{n}日目の夕方、{a}と{b}は、同じ駅で降りて、同じ道を帰った。'),
    house: L('{n}日目の夕方、{a}と{b}は、古い家の縁側で、持ち主への手紙の文面を考えた。')
  };
  /* 暮らし方 */
  var LIV = {
    cohab: L('[en]この家には、{a}と{b}のほかに誰もいない。どちらかが黙ると、家じゅうが静かになった。|{a}と{b}の家の冷蔵庫は、二人分の物でちょうどいっぱいだった。|[n]二人だけの家は、夜になると冷蔵庫の音までよく聞こえた。{a}は、{b}の部屋の明かりが消えるのを、なんとなく待ってから眠った。|[m]玄関の鍵を最後に閉めるのは、いつの間にか{b}の役目になっていた。二人だけの家の、小さな決まりだった。|{a}が出かけているあいだ、家には{b}一人だった。二人で住む前は平気だった静けさが、少しだけ長く感じた。'),
    share: L('[en]共用の居間には、ほかの住人の笑い声が響いていた。{a}と{b}は、その輪の端で並んでテレビを見た。|[m]シェアハウスの共用の洗面所は、朝はいつも順番待ちだった。{a}と{b}は、列の後ろで目が合って苦笑いした。|共用の冷蔵庫に、ほかの住人の名前を書いた付箋がずらりと並んでいた。{a}は、{b}の付箋の字がいちばん小さいことに気づいた。|[e]共用の台所では、ほかの住人が鍋をしていた。誘われて、{a}と{b}も一緒に箸をつついた。|[n]シェアハウスの廊下で、{a}と{b}は夜遅くに帰ってきたほかの住人とすれ違った。小声でおやすみを言い合う声が、三人分重なった。'),
    house: L('古い家の縁側は、昼すぎになると日がよく当たった。{a}と{b}は、そこで並んでお茶を飲むのが習慣になった。|[n]古い家は、夜になると柱がみしりと鳴った。{a}は、{b}がまだ起きている気配に、少しだけほっとした。|[m]古い家の台所は、足元がしんと冷えた。{a}と{b}は、そろってスリッパを二重に履いた。|古い家の押し入れには、使い道の分からない道具がたくさん眠っていた。{a}と{b}は、それが何に使うものかを当て合った。|[en]古い家の風呂は、湯が沸くまでに時間がかかった。{a}と{b}は、どちらが先に入るかを、湯が沸くまでのあいだに決めた。')
  };
  var LIV_N = { cohab: '二人だけの家', share: 'シェアハウス', house: '古い家の留守番' };
  /* 住人の設定（{a}＝その設定の人、{b}＝同居人） */
  var PROF = {
    much: L('[m]{a}は朝のうちに、洗濯と掃除機かけを済ませていた。{b}が起きてきたときには、家じゅうが少しだけ明るくなっていた。|{a}は、{b}が出しっぱなしにしたコップを、何も言わずに洗って棚に戻した。|[en]{a}が帰ってきて最初にするのは、台所の布巾を取り替えることだった。{b}は、それを見るたびに少し背筋が伸びた。|{a}は、手が空くと何かしら家のことをしていた。{b}「少し座ったら？｜少しは座ったらどうだ｜少し座ったらどうですか」――{a}は、座っても三分で立ち上がった。|[d]{a}は休日の昼、網戸の汚れに気づいてしまい、結局ベランダじゅうを洗った。{b}は、それを居間から感心して眺めていた。'),
    cook: L('[e]{a}が台所に立つと、家じゅうにいい匂いが広がった。{b}は、匂いにつられて部屋から出てきた。|[m]{a}は、二人分の弁当を手早く詰めた。{b}の分には、卵焼きが一切れ多く入っていた。|{a}は、{b}の好みを聞いて、次の献立のメモに書き足した。|[e]{a}が作った煮物を、{b}は鍋ごと抱えそうな勢いで食べた。|[de]{a}は、スーパーのチラシを見ながら、今週の献立を立てていた。{b}は、横から好物の名前を言った。'),
    clumsy: L('[m]{a}が焼いたトーストは、片面だけ真っ黒だった。{b}は笑いをこらえながら、それでも一口かじった。|{a}が洗濯機を回すと、白いシャツが薄い桃色になって出てきた。{a}と{b}は、しばらく無言でそれを見つめた。|[e]{a}は、張り切って作ったカレーの鍋を焦がした。換気扇を回しながら、{b}は窓を全部開けた。|{a}は掃除機のコードに足を引っかけて、派手に転んだ。{b}が駆けつけると、{a}は床に寝たまま言った。{a}「大丈夫｜大丈夫だ｜大丈夫です」|{a}がたたんだ洗濯物は、たたむ前より大きくなっていた。{b}は、それを見なかったことにした。'),
    none: L('{a}の部屋の前に、読みかけの雑誌と空のペットボトルが並んでいた。{b}は、それを見てため息をついた。|[en]夕飯のあと、{a}はさっさと居間のソファに寝転んだ。{b}は、その足元を跨いで台所へ向かった。|{a}は家事をしないかわりに、重いものを運ぶときだけは真っ先に手を出した。|{a}は、ゴミの日を一度も覚えたことがなかった。{b}は、カレンダーのゴミの日に、{a}にも見えるように大きな丸をつけた。|{a}は、家のことを何も頼まれないのをいいことに、居間でのんびり本を読んでいた。{b}の視線に気づいて、ようやく顔を上げた。'),
    morning: L('[m]{a}は六時には起きて、ベランダで体操をしていた。{b}は、その音で目を覚ました。|[m]{a}が淹れたコーヒーの匂いで、{b}は目を覚ました。{a}は、もう新聞を半分読み終えていた。|[n]{a}は十時を過ぎると、もう目が半分閉じていた。{b}が話しかけても、返事は寝言のようだった。|[m]{a}は、朝いちばんに家じゅうの窓を開けて回った。冷たい空気に、{b}は布団を頭までかぶった。|[n]{a}は、まだ早い時間に「おやすみ｜おやすみ｜おやすみなさい」と言って、部屋の明かりを消した。居間には{b}だけが残った。'),
    night: L('[n]夜中の一時、{a}の部屋からはまだ小さな明かりが漏れていた。{b}は、廊下でその明かりを見て、そっと通り過ぎた。|[m]{a}が起きてきたのは、{b}が出かける直前だった。寝癖のついた頭で、{a}は言った。{a}「おはよ｜おはよう｜おはようございます」|[n]{a}は夜更けの台所で、一人分のラーメンを作っていた。においにつられて、{b}が起きてきた。|[m]{a}の朝は遅い。{b}は、{a}の部屋の扉に「＠＠先に出ます」と書いた付箋を貼っていった。|[e]夕方になって、ようやく{a}の目が覚めてきた。一日の疲れでぐったりしている{b}の横で、{a}だけが元気だった。'),
    neat: L('{a}は、{b}が置いたリモコンの向きを、黙ってテーブルの端とそろえた。|[m]{a}は朝いちばんに、洗面台の水滴を拭き取った。{b}は、自分が使ったあとにも拭くようになった。|{a}の部屋は、いつ見ても物が少なかった。{b}は、自分の部屋の扉をそっと閉めた。|[en]{a}は帰ってくるなり、玄関の靴を全部そろえ直した。そろえられた靴の中に、{b}の靴も入っていた。|{a}は、冷蔵庫の中の調味料を、背の高い順に並べ替えた。{b}が使うたびに、順番は少しずつ崩れた。'),
    messy: L('{a}の上着が、今日も居間の椅子の背に掛かったままだった。{b}は、それをハンガーに掛けて{a}の部屋の前に吊るした。|[en]居間のテーブルの上は、{a}の書類と郵便物でいっぱいだった。{b}は、自分の湯呑みを置く場所を探した。|{a}は、探していた鍵を三十分かけて見つけた。ソファのクッションの下だった。{b}は、それを見て笑った。|[m]{a}の靴下が、片方だけ廊下に落ちていた。もう片方は、なぜか台所にあった。|{a}の部屋の扉が開くたびに、中から何かが崩れる音がした。{b}は、もう驚かなくなっていた。')
  };
  var PROF_N = { much: '家事をよくする', cook: '料理が得意', clumsy: '家事が苦手', none: '家事をしない', morning: '朝型', night: '夜型', neat: 'きれい好き', messy: '散らかしがち' };
  /* {b} が家事をする文（家事をしない同居人には出さない） */
  var B_CHORE = /\{b\}は、それをハンガーに掛け|\{b\}は、自分が使ったあとにも拭く/;
  /* 季節の暮らし */
  var SEASON = {
    spring: L('[m]春の朝、{a}は家じゅうの窓を開けた。花粉に弱い{b}が、くしゃみをしながら窓を閉めて回った。|{a}と{b}は、冬物の服を押し入れにしまって、春物を出した。衣替えの途中で{b}の昔の服が出てきて、二人で笑った。|[d]ベランダの鉢植えに、小さなつぼみがついた。{a}は、{b}を呼んでそれを見せた。|[e]春の雨が三日続いた。部屋干しの洗濯物が、居間にカーテンのように並んだ。{a}と{b}は、その隙間をくぐって歩いた。|[en]日が長くなって、夕飯の時間になっても外はまだ明るかった。{a}と{b}は、窓を開けたまま食卓を囲んだ。|{a}は、春になって薄手の布団に替えた。{b}「まだ寒くない？｜まだ寒くないか？｜まだ寒くないですか？」――{a}は、平気な顔をしていた。'),
    summer: L('[den]居間の扇風機は一台しかなかった。{a}と{b}は、首振りの風が自分のほうに来るたびに、少しだけ黙った。|[en]冷房の温度で、{a}と{b}の意見が分かれた。リモコンは、いつの間にか冷蔵庫の上に置かれるようになった。|[m]冷蔵庫の麦茶は、作ってもすぐに空になった。{a}は、空のポットを見つけるたびに{b}の顔を思い浮かべた。|[n]寝苦しい夜、{a}と{b}は窓を開けて、網戸越しの夜風を待った。どこかで蚊の羽音がして、二人とも起き上がった。|[de]夕立が来て、ベランダの洗濯物が一瞬でずぶ濡れになった。{a}と{b}は、取り込んだ服を抱えて、顔を見合わせた。|[e]梅雨の名残の湿気で、洗濯物がなかなか乾かなかった。{a}は、それを扇風機の前に並べた。{b}は、扇風機の前に座れなくなった。'),
    autumn: L('{a}と{b}は、夏の服をしまって、押し入れから毛布を出した。毛布からは、少しだけ防虫剤の匂いがした。|[e]{a}が、商店街でさつまいもを一袋もらってきた。その夜は、芋づくしの食卓になった。|[n]秋の夜は長かった。{a}と{b}は、居間でそれぞれ本を読みながら、ときどき同じところで顔を上げた。|[d]台風が近づいていた。{a}と{b}は、ベランダの鉢植えを家の中に取り込んで、雨戸を閉めた。|[m]朝の空気が、急に冷たくなった。{a}は、{b}が半袖のまま震えているのを見て、黙って上着を差し出した。|[en]日が暮れるのが早くなった。{a}が帰ると、家の中はもう暗かった。先に帰っていた{b}が、明かりをつけるのも忘れて居眠りしていた。'),
    winter: L('[en]居間のこたつは、一度入ると出られなかった。{a}と{b}は、どちらがお茶を淹れに立つかで、長いことにらみ合った。|[m]窓ガラスが結露で真っ白になっていた。{a}は指で小さな絵を描いた。あとから起きてきた{b}が、その横に絵を描き足した。|[m]夜のうちに雪が積もっていた。{a}と{b}は、玄関の前の雪かきを、じゃんけんで負けたほうがやることにした。|[e]暖房をつけると、部屋の空気がすぐに乾いた。{b}は加湿器を買ってきて、居間の真ん中に置いた。|[n]寒い夜、{a}は湯たんぽを二つ用意した。一つを、黙って{b}に手渡した。|[e]鍋の季節になった。{a}と{b}は、具材を入れる順番で、毎回同じ議論をした。')
  };
  var SEASON_N = { spring: '春', summer: '夏', autumn: '秋', winter: '冬' };
  /* 関係（m＝中盤、l＝終盤）。師弟・先輩後輩・上司と部下は {a}＝上の人。家族の文の {rel} は血縁の名前 */
  var REL = {
    ex: { n: '元恋人',
      m: L('{a}は、{b}が今でも同じ銘柄のコーヒーを買っていることに気づいた。付き合っていた頃、{a}が勧めたものだった。|同じ家で暮らすうちに、{a}と{b}は、付き合っていた頃の呼び方をうっかり口にしそうになることがあった。|{a}と{b}は、別れた理由の話にだけは、どちらも触れなかった。触れないまま、食卓に皿を並べた。'),
      l: L('{a}は、{b}と付き合っていた頃より、今のほうが{b}のことをよく知っている気がした。|{a}と{b}は、昔の写真の話になって、初めて笑って思い出せた。|別れた二人が同じ家で暮らすなんて、最初は無理だと思っていた。今の{a}には、それが少しだけ不思議だった。') },
    colleague: { n: '同僚',
      m: L('{a}と{b}は、職場では仕事の話しかしなかった。家に帰ると、上司の口癖の真似で笑い合った。|[m]{a}と{b}は、同じ会議の資料を、朝の食卓で読み合わせた。|{a}の仕事の失敗を、{b}は職場では知らないふりをした。家に帰ってから、黙って温かいお茶を出した。'),
      l: L('職場の人に、二人の同居が知られてしまった。{a}と{b}は、翌朝わざと時間をずらして家を出た。|[en]{a}と{b}は、同じ仕事を抱えて、居間のテーブルで夜遅くまで並んで作業した。|{a}は、職場で{b}の評判を聞くたびに、少しだけ誇らしい気持ちになった。') },
    mentor: { n: '師弟',
      m: L('{a}は、家でも{b}の手つきを見ずにはいられなかった。{b}は、包丁の持ち方まで直された。|{b}は、{a}が台所で鼻歌を歌っているのを聞いて、師匠にも休みの日があるのだと知った。|[n]{b}は夜遅くまで練習を続けた。{a}は何も言わずに、{b}の部屋の前に温かい飲み物を置いていった。'),
      l: L('{a}は、{b}が自分の知らないやり方を試しているのを見て、口を出すのをやめた。|{b}は、{a}の背中を見て学んできたことを、一つずつ確かめるように話した。{a}は黙って聞いていた。|同じ家で暮らすうちに、{a}と{b}は、教える側と教わる側の線を、ときどき忘れるようになった。') },
    rival: { n: 'ライバル',
      m: L('{a}と{b}は、どちらが先に風呂を洗うかまで競い合った。結局、二人とも洗った。|{a}が新しい資格の本を買ってくると、翌日には{b}も同じ本を読んでいた。|[e]{a}と{b}は、夕飯のおかずの最後の一つを、じゃんけんで三回勝負した。'),
      l: L('{a}は、{b}が負けず嫌いなのは、相手が自分だからだと気づいた。|{a}と{b}は、張り合うのをやめなかった。ただ、相手が勝った日は、{a}のほうから言った。{a}「おめでとう｜おめでとう｜おめでとうございます」|{a}と{b}の勝負の記録は、居間のカレンダーの裏にびっしり書かれていた。') },
    childhood: { n: '幼馴染',
      m: L('{a}と{b}は、子どもの頃の話になると止まらなかった。同じ家で暮らすと、思い出す話が毎日一つずつ増えた。|{b}は、{a}が子どもの頃から苦手な食べ物を、今でもよけて食べているのを見つけた。|{a}の親から、{b}あての荷物が届いた。幼馴染の家への差し入れは、昔から変わらなかった。'),
      l: L('{a}と{b}は、子どもの頃に住んでいた町の話をした。あの頃の自分たちが、同じ家で暮らすなんて想像もしなかった。|{a}は、{b}の知らなかった癖を一つ見つけた。長い付き合いでも、まだ知らないことがあった。|幼馴染の{a}と{b}は、同じ家で暮らすうちに、昔より少しだけ大人の話をするようになった。') },
    step: { n: '義理のきょうだい',
      m: L('{a}と{b}は、親の再婚の前の話を、初めてゆっくりした。血のつながらない{rel}の、知らなかった子ども時代だった。|{a}の親から電話が来ると、{b}は少しだけ居住まいを正した。同じ家族になって何年たっても、その癖は抜けなかった。|{a}と{b}は、どちらの家の味の味噌汁にするかで揉めた。家族になってから何年もたって、ようやくできた小さなケンカだった。'),
      l: L('{a}は、{b}を人に紹介するとき、少しだけ迷ってから『{rel}』と言った。|{a}と{b}は、家族の集まりで、並んで座るようになった。親たちは、それを見て顔を見合わせた。|血はつながっていない。それでも、{a}と{b}は、同じ家で暮らすうちに家族らしくなっていった。') }
    /* r18:begin */
    , fwb: { n: 'セフレ',
      m: L('昼間の{a}と{b}は、ただの同居人だった。夜のことは、食卓では一度も話題にならなかった。|{a}は、{b}の部屋の扉を見るたびに、夜のことを思い出した。昼間は、何もないふりをした。|{a}と{b}は、体の関係はあっても、互いの予定は訊かないという決まりを守っていた。'),
      l: L('{a}は、{b}がほかの誰かと出かけると聞いて、思っていたより胸がざわついた。|体だけの関係のはずだった。それでも{a}は、{b}の好きな朝食を覚えてしまっていた。|{a}と{b}は、この関係に名前をつけないまま、同じ家で暮らし続けた。') }
    /* r18:end */
  };
  var REL_OF = { ex: 'ex', colleague: 'colleague', boss: 'colleague', senpai: 'colleague', mentor: 'mentor', teacher: 'mentor', master: 'mentor', rival: 'rival', childhood: 'childhood', classmate: 'childhood', fwb: 'fwb' };
  var REL_DIR = { mentor: 1, boss: 1, senpai: 1, teacher: 1, master: 1 };
  /* 恋人どうしの暮らし */
  var LOVERS = L('[m]{a}と{b}の歯ブラシは、同じ形の色違いになっていた。どちらが買ってきたのかは、もう覚えていなかった。|[e]{a}と{b}は、取り込んだ洗濯物の前に並んで座った。{b}のシャツの袖が、{a}のシャツの袖と絡まっていた。|[n]寝る前、{a}と{b}は明日の予定を言い合った。帰りが遅いほうが、買い物を頼まれることになった。|[de]{a}と{b}は、スーパーで同じ牛乳に同時に手を伸ばした。恋人になってからも、こういうところは変わらなかった。|{a}は、{b}の好きなお菓子を、何も言わずに戸棚の手前に置いておいた。|[e]{a}が帰ると、{b}が玄関まで出てきた。{b}「おかえり｜おかえり｜おかえりなさい」――その声を聞くと、一日が終わった気がした。|{a}と{b}は、居間のカレンダーに、二人の休みが重なる日を赤い丸で囲んだ。|[n]{a}は、先に寝てしまった{b}の顔を見て、テレビの音を小さくした。|[m]{a}が寝坊した朝、{b}は玄関で{a}の靴をそろえて待っていた。|[en]{a}と{b}は、同じ毛布にくるまって、居間で古い映画を観た。途中で、どちらも眠ってしまった。');
  /* 昼の三人：取り合い（{a}{c} が {b} を想う）・やきもち（{a} が {b}{c} の仲に妬く）・応援（{c} が {a} の想いを応援する） */
  var TRI = {
    rival: L('[de]{a}と{c}は、{b}の買い物に付き合う役を取り合った。結局、三人で出かけることになった。|[e]台所から{b}が呼んだ。{b}「誰か、手伝って｜誰か、手伝ってくれ｜誰か、手伝ってください」――{a}と{c}が、同時に立ち上がった。|[d]休日の昼、{a}は{b}を散歩に誘おうとして、先に{c}が誘っているのを見てしまった。|{a}は、{b}の好きな店のケーキを買って帰った。冷蔵庫を開けると、同じ店の箱がもう一つ入っていた。{c}も、同じことを考えていたらしい。'),
    jeal: L('[de]居間で{b}と{c}が笑い合っていた。{a}は、二人の間に入るきっかけを探して、何度も台所と居間を行き来した。|[e]{b}が{c}の作った料理をほめた。{a}は、自分の箸が止まっていることに気づいた。|{a}は、{b}と{c}が同じ話題で盛り上がっているのを、少し離れたソファから眺めていた。|[d]{b}と{c}が二人で出かけていった休日の昼、{a}は掃除機を三回かけた。'),
    cheer: L('{c}は、{a}が{b}を見る目に気づいていた。食卓では、{c}がさりげなく{a}と{b}の席を隣にした。|[de]{c}は、用事を思い出したふりをして出かけていった。居間には、{a}と{b}だけが残った。|{c}は、{a}の相談に乗りながら背中を押した。{c}「大丈夫。きっと伝わる｜大丈夫だ。きっと伝わる｜大丈夫です。きっと伝わります」|[e]{c}は、{b}の好きな映画のチケットを二枚、{a}の手に押しつけた。自分は行けなくなった、ということにした。')
  };
  /* 近所へのお出かけ（休日。一回の遊びで同じ文は一度だけ） */
  var OUT = L('[d]休日の昼、{a}と{b}は近所のホームセンターに出かけた。棚を一つ買うつもりが、気づけば鉢植えまで抱えていた。|[de]{a}と{b}は、商店街の古本屋に入った。{a}が料理の本を、{b}が旅の本を買って、帰り道に見せ合った。|[e]{a}と{b}は、近所の銭湯に行ってみた。帰り道、湯上がりの夜風に当たりながら、牛乳を一本ずつ飲んだ。|[d]{a}と{b}は、駅の反対側にできたパン屋の列に並んだ。並んでいるあいだに、家の話をいくつもした。|[d]{a}と{b}は、家具屋で食卓の椅子を選んだ。座り心地を確かめるたびに、二人とも同じ椅子に戻ってきた。|[de]{a}と{b}は、川沿いの道を遠回りして帰った。家までの道を、もう地図を見ずに歩けるようになっていた。|[d]{a}と{b}は、近所の公園の蚤の市をのぞいた。{b}が、使い道の分からない置物を一つ買った。|[e]{a}と{b}は、駅前の定食屋で夕飯を済ませた。家の外で向かい合って食べるのは、少しだけ新鮮だった。');
  /* 空の区切りの暮らしの一幕（p＝二人、s＝一人） */
  var FILL = {
    m: L('朝の台所で、{a}と{b}は短く挨拶を交わした。トースターの音だけが、しばらく続いた。|{a}は玄関で靴を履きながら、{b}の声を背中で聞いた。{b}「いってらっしゃい｜気をつけて行ってこい｜気をつけて行ってきてください」|朝の天気予報を見ながら、{a}と{b}は傘を持っていくかどうかで少しだけ迷った。|{a}が洗面所から出てくると、{b}が歯ブラシをくわえたまま待っていた。|{a}と{b}は、それぞれの朝の支度を黙々と済ませた。同じ家の朝の音に、二人とも少しずつ慣れていった。|朝の光の差し込む居間で、{a}はカーテンを開けた。{b}は、まぶしそうに目を細めた。|{a}が冷蔵庫を開けると、牛乳が残りわずかだった。{b}は、買い物メモに「牛乳」と書き足した。|{a}と{b}の目覚ましが、ほとんど同じ時刻に鳴った。止めたのも、ほとんど同時だった。|朝、{b}の淹れたお茶の湯気が、台所の窓を少し曇らせた。{a}は、その窓を指でなぞってから出かけた。|{a}は朝の玄関で、{b}の靴をそろえてから自分の靴を履いた。|朝の洗面所の鏡には、歯ブラシが二本並んでいた。{a}は、その並びをまだ少し不思議に思った。|{b}が出かけたあと、{a}は台所に残った二人分のマグカップを洗った。'),
    dh: L('休日の昼、{a}と{b}は居間でそれぞれ好きなことをしていた。会話はなかったが、気まずくはなかった。|{a}と{b}は、昼ごはんを何にするかで十分ほど話し合った。結局、二人とも同じものにした。|昼下がりの居間で、{a}がうたた寝を始めた。{b}は、テレビの音を少し小さくした。|{a}と{b}は、昼すぎにそろって近所のコンビニへ行った。帰りに、アイスを一つずつ買った。|{a}がベランダに出ると、{b}が日向ぼっこをしていた。二人は並んで、しばらく空を眺めた。|休みの日の家の中は、時計の音がやけに大きく聞こえた。{a}と{b}は、同じ時刻に同じ時計を見上げた。|休日の昼、{a}は居間の床に寝転んで、{b}が掃除機をかける音を聞いていた。|{a}と{b}は、昼ごはんの焼きそばを、フライパンから直接取り分けて食べた。|{a}が古い雑誌を束ねていると、{b}が途中のページで手を止めて読みふけった。片づけは、少しも進まなかった。|昼すぎ、{a}と{b}は、それぞれの部屋の窓を開けて、家じゅうに風を通した。|{a}と{b}は、休日の昼に、録りためていた番組を一本だけ観た。感想は、半分ずつ違った。|{a}が昼寝から目を覚ますと、肩に薄い毛布が掛けてあった。{b}は、知らん顔で本を読んでいた。'),
    e: L('夕方、{a}と{b}は、駅からの帰り道でばったり会った。家までの残りの道を、並んで歩いた。|夕暮れの居間で、{a}と{b}は今日あったことを一つずつ話した。|{a}は、夕方のニュースを見ながら、{b}が帰ってくる足音を聞いていた。|夕方、郵便受けに{a}と{b}あての郵便が一通ずつ届いていた。{a}は、二通まとめて居間のテーブルに置いた。|{a}と{b}は、夕飯までのあいだ、居間で同じ番組を眺めた。|夕方の雨が上がった。{a}と{b}は、ベランダに出て、雨上がりの街の匂いをかいだ。|夕方、{a}は帰り道で、{b}の好きなパン屋の前を通った。少し迷ってから、二人分を買った。|夕方の台所で、{a}と{b}は冷蔵庫の中身を見比べて、今夜の献立を決めた。|{a}が帰ると、玄関の明かりがもう点いていた。{b}が先に帰っていた。|夕方、{a}と{b}は、取り込んだ洗濯物を居間で一緒にたたんだ。靴下の片方が、どうしても見つからなかった。|夕暮れの窓辺で、{a}は{b}の育てている鉢植えに水をやった。|{a}と{b}は、夕方のスーパーの値引きの時間に合わせて、少し早足で出かけた。'),
    n: L('夜更け、{a}が居間の明かりを消すと、廊下の先から{b}の小さな咳払いが聞こえた。|寝る前、{a}は戸締まりを確かめて回った。{b}は、もう布団に入っていた。|夜、{a}と{b}は、明日の天気の話を少しだけしてから、おやすみを言い合った。|湯上がりの{b}が、居間の{a}に声をかけた。{b}「お湯、まだ温かいよ｜湯はまだ温かい｜お湯、まだ温かいですよ」|{a}と{b}は、夜のうちに明日のゴミをまとめて玄関に置いた。|夜の家は静かだった。{a}は、{b}が使う湯沸かしの音を聞きながら、本を閉じた。|夜、{a}が居間に戻ると、{b}が二人分の麦茶を用意していた。|寝る前、{a}と{b}は、明日の朝どちらが先に洗面所を使うかを決めた。|夜更け、{a}の部屋の明かりが消えたのを見て、{b}も読みかけの本を閉じた。|夜の台所で、{a}は明日の弁当の下ごしらえをした。{b}は、横から卵焼きの端を一つつまんだ。|{a}と{b}は、夜のうちに洗濯機を回した。終わりを知らせる音に、二人とも同時に顔を上げた。|夜、{a}は廊下の電球が切れかけているのに気づいた。{b}が、替えの電球の場所を覚えていた。'),
    s: L('{a}は昼休みに、家の冷蔵庫に何が残っていたかを思い出そうとした。|{a}は職場の窓から外を眺めて、家のベランダの洗濯物のことを少しだけ心配した。|{a}は昼休み、同居のことを人に話して、驚かれた。|{a}は仕事の電話を切ってから、家の鍵がちゃんと鞄にあるかを確かめた。|{a}は職場の売店で、家にあるのと同じお茶を手に取って、棚に戻した。|{a}は午後の打ち合わせのあいだ、帰りに買って帰るものを考えていた。|{a}は一人の部屋で、いつもより早く明かりを消した。|{a}は、静かな家の中で、湯沸かしの音だけを聞いていた。|{a}は昼休み、家の近所の店の新しいメニューの話を同僚から聞いて、帰りに寄ってみようと思った。|{a}は職場で、家の合い鍵の話になって、少しだけ照れくさくなった。|{a}は仕事の合間に、今夜の夕飯の当てを頭の中で並べた。|{a}は昼休み、家の近くのスーパーの特売の日を思い出した。|{a}は職場のカレンダーを見て、同居を始めてからの日数を数えた。|{a}は、仕事の帰りに買う物のメモを、スマホに打ち込んだ。|{a}は昼休みに外へ出て、家と同じ方角の空を見上げた。|{a}は仕事中、家の窓を閉めてきたかどうかを、ふと思い出せなくなった。')
  };

  /* ======================= 出来事 ======================= */
  function W0(ctx, spot) { return FC.W(ctx, spot); }
  function homeN(ctx) { return H() && H().homeName ? H().homeName(ctx) : '自宅'; }
  function pool1(ctx, arr) { return (arr || []); }
  /* 同居の理由の種 */
  FC.ev({ id: 'ft_y_reason', label: '同居の理由が毎日の暮らしに顔を出す', cat: 'bond', tm: 'mden', w: function (ctx) { return seedToday(ctx, 'reason') ? 0 : 1.1; },
    need: function (ctx, a, b) { var h = hs(ctx); return !!h && h.on && ctx.ft.day >= 1 && inHouse(ctx, a, b) && !!REASON[h.reason] && ctx.ft.day - (ctx.ft.reasonDay == null ? -9 : ctx.ft.reasonDay) >= 2; },
    pool: function (ctx) { var h = hs(ctx), R = REASON[h.reason], p = phaseOf(ctx); return R[p].concat(p === 'l' ? R.m : p === 'm' ? R.e : []); },
    spot: function (ctx) { return homeN(ctx); },
    fx: function (ctx, a, b) { ctx.ft.reasonDay = ctx.ft.day; seedMark(ctx, 'reason'); ctx.mod2(a, b, { aff: 1, trust: 1 }, { aff: 1, trust: 1 }); },
    why: function (ctx) { return '同居の理由の種（' + REASON_N[hs(ctx).reason] + '）'; } });
  /* 暮らし方の種 */
  function livKey(ctx) { var h = hs(ctx); return h && h.reason === 'house' ? 'house' : ctx.ft.liv === 'share' ? 'share' : 'cohab'; }
  FC.ev({ id: 'ft_y_liv', label: '二人だけの家・シェアハウスの暮らしの一幕', cat: 'bond', tm: 'mden', w: function (ctx) { return seedToday(ctx, 'liv') ? 0 : 0.9; },
    need: function (ctx, a, b) { return ctx.ft.day >= 1 && inHouse(ctx, a, b) && FC.st(ctx, a, b) < 4 && ctx.ft.day - (ctx.ft.livDay == null ? -9 : ctx.ft.livDay) >= 2 && !(livKey(ctx) === 'cohab' && ctx.chars.length >= 3); },
    pool: function (ctx) { return LIV[livKey(ctx)]; },
    spot: function (ctx) { return homeN(ctx); },
    fx: function (ctx, a, b) { ctx.ft.livDay = ctx.ft.day; seedMark(ctx, 'liv'); ctx.mod2(a, b, { aff: 1 }, { aff: 1 }); },
    why: function (ctx) { return '暮らし方の種（' + LIV_N[livKey(ctx)] + '）'; } });
  /* 住人の設定の種：{a} の設定（家事・生活時間・片づけ）のうち、ふつうでないもの */
  function traits(ctx, a) { var p = prof(ctx, a), o = []; if (PROF[p.chore]) o.push(p.chore); if (PROF[p.clock]) o.push(p.clock); if (PROF[p.tidy]) o.push(p.tidy); return o; }
  function profPool(ctx, a, b) {
    var out = [];
    traits(ctx, a).forEach(function (k) { (PROF[k] || []).forEach(function (t) { if (!canChore(ctx, b) && B_CHORE.test(t)) return; if (FC.st(ctx, a, b) >= 4 && /\{[ab]\}の部屋/.test(t)) return; out.push(t); }); });
    return out;
  }
  function profWhy(ctx, a, t) { var p = prof(ctx, a), k = ['chore', 'clock', 'tidy'].map(function (x) { return p[x]; }).filter(function (v) { return PROF[v] && PROF[v].indexOf(t) >= 0; })[0]; return k; }
  FC.ev({ id: 'ft_y_prof', label: '住人の家事や生活時間のくせが出る一幕', cat: 'bond', tm: 'mden', w: function (ctx) { return seedToday(ctx, 'prof') ? 0.15 : 1.2; },
    need: function (ctx, a, b) { return inHouse(ctx, a, b) && traits(ctx, a).length > 0; },
    pool: function (ctx, a, b) { return profPool(ctx, a, b); },
    spot: function (ctx) { return homeN(ctx); },
    fx: function (ctx, a, b) { seedMark(ctx, 'prof'); },
    why: function (ctx, a) { return a.name + 'の暮らしのくせ（' + traits(ctx, a).map(function (k) { return PROF_N[k]; }).join('・') + '）'; } });
  /* 季節の暮らし */
  FC.ev({ id: 'ft_y_season', label: '季節の暑さ寒さと同居の暮らし', cat: 'bond', tm: 'mden', w: function (ctx) { return seedToday(ctx, 'season') ? 0 : 0.9; },
    need: function (ctx, a, b) { return ctx.ft.day >= 1 && inHouse(ctx, a, b) && ctx.ft.day - (ctx.ft.seasonDay == null ? -9 : ctx.ft.seasonDay) >= 2; },
    pool: function (ctx) { return SEASON[FC.seasonNow(ctx)]; },
    spot: function (ctx) { return homeN(ctx); },
    fx: function (ctx, a, b) { ctx.ft.seasonDay = ctx.ft.day; seedMark(ctx, 'season'); ctx.mod2(a, b, { aff: 1 }, { aff: 1 }); H() && H().awk && FC.stOf(ctx, a, b).awk != null && (FC.stOf(ctx, a, b).awk = Math.max(0, FC.stOf(ctx, a, b).awk - 1)); },
    why: function (ctx) { return '季節の暮らし（' + SEASON_N[FC.seasonNow(ctx)] + '・' + FC.dayLabel(ctx.env, ctx.ft.day) + '）'; } });
  /* 関係の種（中盤・終盤） */
  function relOf(ctx, a, b) {
    var x = FC.stOf(ctx, a, b), kn = FC.kinOf(ctx, a, b);
    if (kn && kn.step) return { k: 'step', A: a, B: b, rel: kn.label };
    if (kn) return null;
    var ts = HK.Ties ? HK.Ties.all(ctx, a, b) || [] : [];
    for (var i = 0; i < ts.length; i++) {
      var k = REL_OF[ts[i].type]; if (!k || !REL[k]) continue;
      var A = a, B = b;
      if (REL_DIR[ts[i].type] && ts[i].b === a.i) { A = b; B = a; }
      return { k: k, A: A, B: B, rel: x.tieLab || REL[k].n };
    }
    return null;
  }
  FC.ev({ id: 'ft_y_rel', label: '設定した関係が同居の中盤と終盤に出る', cat: 'bond', tm: 'mden', w: function (ctx) { return seedToday(ctx, 'rel') ? 0 : 1.2; },
    need: function (ctx, a, b) {
      var f = ctx.ft, r = relOf(ctx, a, b), x = FC.stOf(ctx, a, b);
      if (!r || !inHouse(ctx, a, b) || phaseOf(ctx) === 'e' || f.day - (x.relDay == null ? -9 : x.relDay) < 2) return false;
      /* 義理のきょうだいの「家族らしく」は、恋人に進んだ二人には出さない */
      if (r.k === 'step' && x.s >= 2) return false;
      return true;
    },
    pool: function (ctx, a, b) { var r = relOf(ctx, a, b), p = phaseOf(ctx); return p === 'l' ? REL[r.k].l.concat(REL[r.k].m) : REL[r.k].m; },
    run2: true,
    spot: function (ctx) { return homeN(ctx); },
    ex: function (ctx, a, b) { var r = relOf(ctx, a, b); return { rel: r ? r.rel : '' }; },
    fx: function (ctx, a, b) { FC.stOf(ctx, a, b).relDay = ctx.ft.day; seedMark(ctx, 'rel'); ctx.mod2(a, b, { trust: 1 }, { trust: 1 }); },
    why: function (ctx, a, b) { var r = relOf(ctx, a, b); return '関係の種（' + (r ? r.rel : '') + '・' + (phaseOf(ctx) === 'l' ? '終盤' : '中盤') + '）'; } });
  /* 恋人どうしの暮らし（恋人になったあとの日々を厚く） */
  FC.ev({ id: 'ft_y_lovers', label: '恋人どうしの同じ家での何気ない毎日', tie: 'lover', cat: 'romance', tm: 'mden', w: 1.3,
    need: function (ctx, a, b) { var x = FC.stOf(ctx, a, b); return FC.couple(ctx, a, b) && FC.loveOk(ctx, a, b) && inHouse(ctx, a, b) && x.s >= 3 && ctx.ft.day - (x.lvDay == null ? -9 : x.lvDay) >= 1; },
    pool: function () { return LOVERS; },
    spot: function (ctx) { return homeN(ctx); },
    fx: function (ctx, a, b) { FC.stOf(ctx, a, b).lvDay = ctx.ft.day; ctx.mod2(a, b, { aff: 2, trust: 1 }, { aff: 2, trust: 1 }); },
    why: '恋人どうしの暮らし' });
  /* 昼の三人（取り合い・やきもち・応援）。{a}{b}＝エンジンの二人、{c}＝三人目 */
  function triKind(ctx, a, b, c) {
    /* 惹かれの目安は両片想いの手前（20）から。昼の三人の関係が夜の場面より先に育つように（2026-11-04・遊んで確かめた報告 1104 の C22） */
    if (!c || FC.couple(ctx, a, b) || !FC.loveOk(ctx, a, b) || ctx.R(a, b).att < 20) return '';
    if (FC.couple(ctx, b, c) || FC.couple(ctx, a, c)) return '';
    if (FC.loveOk(ctx, c, b) && ctx.R(c, b).att >= 20) return 'rival';
    if (ctx.R(b, c).aff > 10 && ctx.R(c, b).aff > 10 && ctx.R(a, b).att >= 24) return 'jeal';
    if (ctx.R(c, a).aff > 8 && ctx.R(c, b).att < 20) return 'cheer';
    return '';
  }
  function triThird(ctx, a, b) { var O = FC.threeAll(ctx, a, b); for (var i = 0; i < O.length; i++) if (triKind(ctx, a, b, O[i])) return O[i]; return null; }
  var TRI_W = { rival: 0.8, jeal: 0.8, cheer: 1.6 };
  var TRI_N = { rival: '取り合い（恋敵）', jeal: 'やきもち', cheer: '応援（仲良し）' };
  FC.ev({ id: 'ft_y_tri3', label: '昼の三人の取り合いとやきもちと応援', cat: 'romance', tm: 'de', w: function (ctx, a, b) { var c = triThird(ctx, a, b); return c ? TRI_W[triKind(ctx, a, b, c)] * 2.2 : 0; },
    need: function (ctx, a, b) { var f = ctx.ft; return ctx.present().length >= 3 && inHouse(ctx, a, b) && f.day - (f.triDay == null ? -9 : f.triDay) >= 1 && !!triThird(ctx, a, b); },
    third: function (ctx, a, b) { return triThird(ctx, a, b); },
    pool: function (ctx, a, b) { var c = triThird(ctx, a, b); return c ? TRI[triKind(ctx, a, b, c)] : []; },
    spot: function (ctx) { return homeN(ctx) + 'の居間'; },
    fx: function (ctx, a, b, c) { var k = triKind(ctx, a, b, c); ctx.ft.triDay = ctx.ft.day; if (k === 'rival') { ctx.mod2(a, c, { ten: 4 }, { ten: 4 }); ctx.mod(a, b, { att: 2 }); } else if (k === 'jeal') { ctx.mod(a, c, { ten: 3 }); ctx.mod(a, b, { att: 1, ten: 2 }); } else { ctx.mod(a, c, { aff: 3, trust: 2 }); ctx.mod2(a, b, { aff: 2, att: 1 }, { aff: 2, att: 1 }); } },
    cat2: function () { return 'romance'; },
    why: function (ctx, a, b, c) { var k = triKind(ctx, a, b, c); return '三人の場面・' + TRI_N[k] + '：' + (k === 'cheer' ? c.name + 'が、' + a.name + 'の' + b.name + 'への想いを応援した' : k === 'rival' ? a.name + 'と' + c.name + 'が、同じ' + b.name + 'に惹かれている' : a.name + 'は、' + b.name + 'と' + c.name + 'の仲のよさが気になった'); } });
  /* 近所へのお出かけ（休日。初日は出ない） */
  FC.ev({ id: 'ft_y_out', label: '休日に近所へ二人で出かける', cat: 'bond', tm: 'de', w: 0.9,
    need: function (ctx, a, b) { var f = ctx.ft; return f.hol && f.day >= 1 && inHouse(ctx, a, b) && (!H() || H().awk(ctx, a, b) < 60) && f.day - (f.outDay == null ? -9 : f.outDay) >= 2; },
    pool: function () { return OUT; },
    spot: function () { return '近所'; },
    fx: function (ctx, a, b) { ctx.ft.outDay = ctx.ft.day; ctx.mod2(a, b, { aff: 2 }, { aff: 2 }); if (FC.stOf(ctx, a, b).awk != null) FC.stOf(ctx, a, b).awk = Math.max(0, FC.stOf(ctx, a, b).awk - 2); },
    why: '休日の近所へのお出かけ' });

  /* ======================= 区切りの終わり：毎日の種の当番・空の区切りの一幕 ======================= */
  function emitPool(ctx, a, b, pool, why, o) {
    var t = FC.fresh(ctx, pool); if (!t) return null;
    return FC.emit(ctx, { actors: b ? [a, b] : [a], cat: (o && o.cat) || 'bond', text: FC.fill(ctx, t, a, b, null, o && o.ex), why: why, tag: o && o.tag, fx: o && o.fx });
  }
  function housePairs(ctx) { return FC.pairs(ctx).filter(function (p) { return inHouse(ctx, p[0], p[1]); }); }
  var ORDER = ['reason', 'prof', 'liv', 'season', 'rel'];
  function forceSeed(ctx) {
    var f = ctx.ft, h = hs(ctx), PS = housePairs(ctx); if (!PS.length || !h || !h.on) return;
    var p = PS[Math.floor(ctx.rng() * PS.length)], a = p[0], b = p[1];
    if (ctx.rng() < 0.5) { a = p[1]; b = p[0]; }
    var ph = phaseOf(ctx);
    for (var i = 0; i < ORDER.length; i++) {
      var k = ORDER[(f.day + i) % ORDER.length], e = null, sp = FC.W(ctx, homeN(ctx));
      if (k === 'reason' && REASON[h.reason]) e = emitPool(ctx, a, b, REASON[h.reason][ph], sp + '同居の理由の種（' + REASON_N[h.reason] + '）');
      else if (k === 'liv' && FC.st(ctx, a, b) < 4 && !(livKey(ctx) === 'cohab' && ctx.chars.length >= 3)) e = emitPool(ctx, a, b, LIV[livKey(ctx)], sp + '暮らし方の種（' + LIV_N[livKey(ctx)] + '）');
      else if (k === 'season') e = emitPool(ctx, a, b, SEASON[FC.seasonNow(ctx)], sp + '季節の暮らし（' + SEASON_N[FC.seasonNow(ctx)] + '・' + FC.dayLabel(ctx.env, f.day) + '）');
      else if (k === 'rel' && ph !== 'e') { var r = relOf(ctx, a, b); if (r && !(r.k === 'step' && FC.st(ctx, a, b) >= 2)) e = emitPool(ctx, r.A, r.B, ph === 'l' ? REL[r.k].l : REL[r.k].m, sp + '関係の種（' + r.rel + '・' + (ph === 'l' ? '終盤' : '中盤') + '）', { ex: { rel: r.rel } }); }
      else if (k === 'prof') { var who = traits(ctx, a).length ? [a, b] : traits(ctx, b).length ? [b, a] : null; if (who) e = emitPool(ctx, who[0], who[1], profPool(ctx, who[0], who[1]), sp + who[0].name + 'の暮らしのくせ（' + traits(ctx, who[0]).map(function (x) { return PROF_N[x]; }).join('・') + '）'); }
      if (e) { seedMark(ctx, k); return; }
    }
  }
  function forceProf(ctx) {
    var PS = housePairs(ctx); if (!PS.length) return;
    var C = [];
    PS.forEach(function (p) { if (traits(ctx, p[0]).length) C.push([p[0], p[1]]); if (traits(ctx, p[1]).length) C.push([p[1], p[0]]); });
    if (!C.length) return;
    var q = C[Math.floor(ctx.rng() * C.length)];
    if (emitPool(ctx, q[0], q[1], profPool(ctx, q[0], q[1]), FC.W(ctx, homeN(ctx)) + q[0].name + 'の暮らしのくせ（' + traits(ctx, q[0]).map(function (x) { return PROF_N[x]; }).join('・') + '）')) seedMark(ctx, 'prof');
  }
  /* 暮らしの一幕の文を使い切ったら（30 日の回）、その表だけ使った印を外して一巡させる（空の区切りを残さない。2026-11-04・遊んで確かめた報告 1104 の C18） */
  function refill(ctx, arr) { var U = ctx.ft.used; if (arr && arr.length && !FC.has(ctx, arr)) arr.forEach(function (t) { delete U[t]; }); return arr; }
  function fill(ctx) {
    var f = ctx.ft, P = ctx.present(); if (!P.length) return;
    var PS = FC.pairs(ctx).filter(function (p) { return FC.together(ctx, p[0], p[1]) && !p[0].gone && !p[1].gone; });
    var key = f.t === 0 ? 'm' : f.t === 1 ? (f.hol ? 'dh' : '') : f.t === 2 ? 'e' : 'n';
    if (key && PS.length) {
      var p = PS[Math.floor(ctx.rng() * PS.length)], o = ctx.rng() < 0.5 ? [p[0], p[1]] : [p[1], p[0]];
      var pool = refill(ctx, FILL[key].filter(function (t) { return !(FC.st(ctx, o[0], o[1]) >= 4 && /\{[ab]\}の部屋/.test(t)); }));
      if (emitPool(ctx, o[0], o[1], pool, FC.W(ctx, f.t === 1 ? homeN(ctx) : homeN(ctx)) + '暮らしの一幕')) return;
    }
    var c = P.filter(function (x) { return !x.gone; })[Math.floor(ctx.rng() * P.length)] || P[0];
    if (c && !c.gone) emitPool(ctx, c, null, refill(ctx, FILL.s.filter(function (t) { return f.t === 1 && !f.hol ? /昼休み|職場|仕事|打ち合わせ/.test(t) : !/昼休み|職場|仕事|打ち合わせ/.test(t); })), FC.W(ctx, f.t === 1 && !f.hol ? '職場' : homeN(ctx)) + '暮らしの一幕（' + c.name + '）', { cat: 'solo' });
  }
  HK.FutariDays = {
    phase: function (ctx) { },
    after: function (ctx) {
      var f = ctx.ft; if (!f) return;
      /* 毎日の種の当番：夕方の区切りの終わりに、今日まだ設定から出た出来事が無ければ一つ（日ごとに順番） */
      if (f.t === 2 && f.day >= 1 && !(seedToday(ctx, 'reason') || seedToday(ctx, 'liv') || seedToday(ctx, 'season') || seedToday(ctx, 'rel'))) forceSeed(ctx);
      /* 住人の設定から、毎日一件（夜の区切りの終わりまでに出ていなければ） */
      if (f.t === 3 && !seedToday(ctx, 'prof')) forceProf(ctx);
      /* 空の区切り：出来事が一つも無ければ、暮らしの一幕 */
      var any = false;
      for (var n = f.l0; n < ctx.log.length; n++) { var e = ctx.log[n]; if (e && e.kind === 'event' && e.text) { any = true; break; } }
      if (!any) fill(ctx);
    },
    /* 最後の日：同居の理由のその後（結末の記録に一行、最後の夕方に一文） */
    finish: function (ctx) {
      var f = ctx.ft, h = hs(ctx); if (!f || !h || !h.on || !REASON_END[h.reason]) return;
      var sum = 0, n = 0; FC.pairs(ctx).forEach(function (p) { if (H() && H().on(ctx, p[0], p[1])) { sum += H().awk(ctx, p[0], p[1]); n++; } });
      var warm = (n ? sum / n : 50) < 45, PS = FC.pairs(ctx), p = PS[0];
      if (!p) return;
      var a = p[0], b = p[1], lv0 = H() && H().leaver ? null : null;
      f.reasonEnd = REASON_END[h.reason][warm ? 'warm' : 'stiff'].replace(/\{a\}/g, a.name).replace(/\{b\}/g, b.name);
      var t = FC.fresh(ctx, REASON_ENDT[h.reason]);
      if (t && !a.gone && !b.gone) FC.emit(ctx, { actors: [a, b], cat: 'bond', text: FC.fill(ctx, t, a, b, null, { n: String(f.days) }), why: FC.W(ctx, homeN(ctx)) + '同居の理由のその後（' + REASON_N[h.reason] + '）' });
    },
    POOLS: { REASON: REASON, LIV: LIV, PROF: PROF, SEASON: SEASON, REL: REL, LOVERS: LOVERS, TRI: TRI, OUT: OUT, FILL: FILL }
  };

  /* ======================= 日常の部品（daily-kit）の外出・気分の一句・共通の出来事の見張り ======================= */
  var DC = HK.Daily && HK.Daily.CONF && HK.Daily.CONF.futari;
  if (DC) {
    /* 日常の部品は、この箱庭の毎日の種を足したぶん少し控えめに */
    DC.weight = 0.7;
    var al0 = DC.allow;
    DC.allow = function (ctx, id, ev, a, b) {
      if (al0 && !al0.apply(this, arguments)) return false;
      var f = ctx.ft; if (!f) return true;
      var U = ctx._dailyUsed || {};
      /* 一回の遊びで、同じ日常の出来事は一度まで（犬・猫・ファミレスの始発待ちが何度も出た。2026-11-04・遊んで確かめた報告 1104 の C19） */
      if (ev && ev.dm && ev.dm.texts && ev.dm.texts.some(function (t) { return U[t]; })) return false;
      var g = String(id).split('.')[0];
      /* 初日は街に出ない。夜の繁華街・ファミレスは、なじんでから（ぎこちなさ 40 未満か恋人） */
      if (g === 'town' && f.day === 0) return false;
      if (b && /^town\.(night|famires)$/.test(id) && !FC.couple(ctx, a, b) && H() && H().awk(ctx, a, b) >= 40) return false;
      /* 仲直りの部品は、直前にケンカした二人だけ */
      if (b && ev && /makeup/.test(ev.id || '')) { var x = FC.stOf(ctx, a, b); if (!x.spat || f.day - (x.spatDay == null ? -9 : x.spatDay) > 2) return false; }
      return true;
    };
  }
  /* 気分の一句（emotion.js の HK.Emo.word）：この箱庭では、一回の遊びで同じ一句を一度まで（2026-11-04・遊んで確かめた報告 1104 の C20） */
  if (HK.Emo && HK.wrap) HK.wrap(HK.Emo, 'word', function (w0) {
    return function (c) {
      var r = w0.apply(this, arguments), ctx = HK._curCtx;
      if (!r || !c || !ctx || !ctx.ft || !ctx.scen || ctx.scen.id !== 'futari') return r;
      var U = ctx.ft.emoW = ctx.ft.emoW || {}, k = String(r).split(c.name).join('〇');
      if (U[k]) return '';
      U[k] = 1;
      return r;
    };
  });
  /* 共通の出来事の見張り：この箱庭の出来事の山（HK.buildPool）を包む。
     ・仲直り・謝る出来事は、直前（二日以内）にケンカした二人だけ（ケンカの無い仲直り。A6）
     ・「元恋人から友人へ」は、両片想い・恋人に進んだ元恋人には出さない（A5）
     ・出来事の文が、区切り・曜日・暮らしの前提に合わなければ出さない（FutariCore.textOk。A3・A4・A7） */
  function spatOk(ctx, a, b) { var x = FC.stOf(ctx, a, b); return !!x.spat && ctx.ft.day - (x.spatDay == null ? -9 : x.spatDay) <= 2; }
  var GUARD = [
    [/^(?:apologize|d_makeup)$|_makeup$|_naka$/, function (ctx, a, b) { return !!b && spatOk(ctx, a, b); }],
    [/_ex_friend$/, function (ctx, a, b) { return !!b && FC.st(ctx, a, b) <= 1 && !FC.couple(ctx, a, b); }]
  ];
  function guard(e) {
    if (!e || !e.id || /^ft_/.test(e.id)) return e;
    var g = GUARD.filter(function (q) { return q[0].test(e.id); }), w = Object.create(e), w0 = e.when, r0 = e.run;
    w.when = function (ctx, a, b) {
      if (ctx.ft && g.length && !g.every(function (q) { return q[1](ctx, a, b); })) return false;
      return w0 ? w0.apply(this, arguments) : true;
    };
    w.run = function (ctx) {
      var r = r0.apply(this, arguments);
      if (r && ctx.ft && typeof r.text === 'string' && FC.textOk && !FC.textOk(ctx, r.text)) return null;
      return r;
    };
    return w;
  }
  if (HK.wrap && HK.buildPool) HK.wrap(HK, 'buildPool', function (bp0) { return function (sc) {
    var pool = bp0.apply(this, arguments);
    if (!sc || sc.id !== 'futari') return pool;
    return pool.map(guard);
  }; });
})();
