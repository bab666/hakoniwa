/* 新婚部屋：新婚さんならではの出来事（両方のビルド。2026-11-03 利用者のメモ「新婚さんならではの出来事の追加（裸エプロン姿で待つ、イエスノー枕）」）
   ■ HK.ShinkonWed（W）
     ・W.roll(ctx, S, day)：その日の新婚らしい出来事を一つ選ぶ（一回の遊びで同じ出来事は一度だけ。季節の行事・誕生日・元の関係の出来事のある日は控えめ）
     ・W.run(ctx, S, day, part)：出す（part：d 日中／n 夜／bed 寝る前＝願望の行動のあと、夜の場面の直前）。受け止め方は相手の態度 9 種（HK.PairReact）
     出来事：合鍵・表札・来客用の食器・写真立て・寝る位置の取り合い・名字の呼ばれ方の照れ・家計の相談・ご近所への挨拶・ペアのマグカップ・指輪・洗面所の二人分・初めての大きな買い物・
       エプロン姿の出迎え（R18版は裸エプロン：shinkon-r18-special.js の HK.ShinkonR18X.apron。全年齢版・全年齢モード・体の関係にならない二人は服を着た版）・
       イエスノー枕（R18版だけ。HK.ShinkonR18X.pillow）
     結婚している二人だけの出来事（wed）・恋愛にしてよい二人だけの出来事（love）は、そうでない二人には出さない
   ■ 文：{a}＝言い出す人、{b}＝相手。台詞は3本（一人称「私」、二人称「あなた」）。性別を決めつける語は使わない。登場人物はすべて成人として扱う */
/* @event scen=set-b-shinkon id=sk_wed_aikagi cat=romance tie=- label=おそろいの合鍵 */
/* @event scen=set-b-shinkon id=sk_wed_hyosatsu cat=romance tie=- label=玄関に二人の表札をかける */
/* @event scen=set-b-shinkon id=sk_wed_shokki cat=bond tie=- label=初めての来客用の食器をそろえる */
/* @event scen=set-b-shinkon id=sk_wed_photo cat=romance tie=- label=写真立てに入れる一枚を選ぶ */
/* @event scen=set-b-shinkon id=sk_wed_ichi cat=romance tie=- cond=恋愛にしてよい二人 label=寝る位置の取り合い */
/* @event scen=set-b-shinkon id=sk_wed_myoji cat=romance tie=- cond=結婚している二人 label=変わった名字で呼ばれて照れる */
/* @event scen=set-b-shinkon id=sk_wed_kakei cat=bond tie=- label=初めての家計の相談 */
/* @event scen=set-b-shinkon id=sk_wed_aisatsu cat=bond tie=- label=ご近所への挨拶回り */
/* @event scen=set-b-shinkon id=sk_wed_mug cat=romance tie=- label=おそろいのマグカップ */
/* @event scen=set-b-shinkon id=sk_wed_ring cat=romance tie=- cond=結婚している二人 label=まだなじまない結婚指輪 */
/* @event scen=set-b-shinkon id=sk_wed_senmen cat=romance tie=- label=洗面所に並ぶ二人分 */
/* @event scen=set-b-shinkon id=sk_wed_kaimono cat=bond tie=- label=二人で初めての大きな買い物 */
/* @event scen=set-b-shinkon id=sk_wed_apron cat=romance tie=- cond=恋愛にしてよい二人 label=エプロン姿で帰りを出迎える */
(function () {
  'use strict';
  var HK = window.HK;
  if (!HK) return;
  var W = HK.ShinkonWed = {};
  function L(s) { return s.split('|'); }
  function SK() { return HK.Shinkon; }
  /* part：d 日中／n 夜。wed：結婚している二人だけ。love：恋愛にしてよい二人だけ */
  W.EV = [
    { id: 'aikagi', nm: '合鍵', part: 'n' }, { id: 'hyosatsu', nm: '表札', part: 'd' }, { id: 'shokki', nm: '来客用の食器', part: 'd' }, { id: 'photo', nm: '写真立て', part: 'n' },
    { id: 'ichi', nm: '寝る位置の取り合い', part: 'n', love: 1 }, { id: 'myoji', nm: '名字の呼ばれ方', part: 'd', wed: 1 }, { id: 'kakei', nm: '家計の相談', part: 'n' },
    { id: 'aisatsu', nm: 'ご近所への挨拶', part: 'd' }, { id: 'mug', nm: 'おそろいのマグカップ', part: 'd' }, { id: 'ring', nm: '結婚指輪', part: 'n', wed: 1 },
    { id: 'senmen', nm: '洗面所の二人分', part: 'd' }, { id: 'kaimono', nm: '初めての大きな買い物', part: 'd', out: 1 }, { id: 'apron', nm: 'エプロン姿の出迎え', part: 'n', love: 1 },
    { id: 'pillow', nm: 'イエスノー枕', part: 'bed', wed: 1, r18: 1 }
  ];
  W.T = {
    aikagi: L('{a}は、合鍵に小さなキーホルダーをつけて、{b}に渡した。同じ家に住んでいるのだから、とっくに鍵は持っている。それでも{a}は「おそろいにしたかった｜おそろいにしたかった｜おそろいにしたかったんです」と、自分の鍵についた同じキーホルダーを見せた。|{b}が鍵が見つからないと大騒ぎした夜、{a}は黙って引き出しから合鍵を出した。「こういうときのために、作っておいた｜こういうときのために、作っておいた｜こういうときのために、作っておきました」――{b}は合鍵を握りしめて、ほっと息をついた。'),
    hyosatsu: L('{a}と{b}は、玄関の表札に二人の名前を書いた。どちらの名前を上にするかで少し揉めて、結局、横に並べることにした。できあがった表札を見上げて、{b}は「本当に、結婚したんだ｜本当に、結婚したんだな｜本当に、結婚したんですね」としみじみ言った。|新しい表札が届いた。{a}が玄関に取りつけるあいだ、{b}は脚立を押さえながら、何度も表札の文字を読み返していた。「なんだか、くすぐったい｜なんだか、くすぐったいな｜なんだか、くすぐったいです」――{b}は笑った。'),
    shokki: L('{a}と{b}は、来客用の食器をそろえに出かけた。四人分にするか、六人分にするかで、店の中で真剣に相談する。家に帰って棚に並べてみると、{b}は「誰を一番に呼ぼう｜誰を一番に呼ぼうか｜誰を一番に呼びましょう」と楽しそうに言った。|初めてのお客を迎える前の晩、{a}は来客用の湯のみを一つずつ箱から出して、布で拭いた。{b}が横から手を出して手伝う。まだ誰も使っていない湯のみが、テーブルにずらりと並んだ。'),
    photo: L('{a}は、二人で撮った写真の中から一枚を選んで、写真立てに入れた。どれにするかで一時間も迷ったのに、選んだのはピントの少しずれた一枚だった。{b}が理由を聞くと、{a}は「この顔が一番好き｜この顔が一番好きだ｜この顔が一番好きです」と言った。|{a}と{b}は、居間の棚に写真立てを三つ並べた。旅行の写真、引っ越しの日の写真、それからもう一つは、まだ空のまま。{b}が「ここには、これから撮る一枚を入れよう｜ここには、これから撮る一枚を入れよう｜ここには、これから撮る一枚を入れましょう」と言った。'),
    ichi: L('寝る前、{a}と{b}はベッドのどちら側で寝るかで揉めていた。どちらも窓側がいいと言って譲らない。じゃんけんで三回勝負をして、負けた{b}は、それでも夜中に{a}のほうへ寄ってきた。|新しい布団を敷いた夜、{a}は迷わず右側にもぐりこんだ。{b}が「そっちがよかった｜そっちがよかった｜そっちがよかったです」と言うと、{a}は少し考えてから、真ん中に寄って{b}の分の場所を空けた。'),
    myoji: L('銀行の窓口で、結婚して変わった名字を呼ばれたのに、{a}は自分のことだと気づかなかった。三回目に呼ばれてようやく立ち上がった{a}を、付き添いの{b}は笑いをこらえて見送った。帰り道、{b}はわざと何度もその名字で{a}を呼んだ。|{a}は役所の書類に、結婚して変わったばかりの名字を書いた。書き慣れない字面に、ペンを持つ手が少し止まる。横からのぞいた{b}が「なんだか照れる｜なんだか照れるな｜なんだか照れますね」と言うので、{a}まで顔が熱くなった。'),
    kakei: L('{a}と{b}は、食卓に通帳と電卓を並べて、初めての家計の相談をした。食費、光熱費、二人の小遣い。{b}が「趣味の分は削れない｜趣味の分は削れない｜趣味の分は削れません」と真剣な顔で言うので、{a}は笑ってしまった。|月末、{a}は家計簿をつけながらうなっていた。{b}がのぞきこむと、外食の欄がずいぶん多い。二人は「来月は、少し家で食べよう｜来月は、少し家で食べよう｜来月は、少し家で食べましょう」と言い合って、顔を見合わせた。'),
    aisatsu: L('{a}と{b}は、菓子折りを持って、両隣と上の階に挨拶に回った。並んで頭を下げる二人を、隣の住人は、新婚さんかと聞いてにこにこ眺めていた。帰り道、{b}は「いい人そうでよかった｜いい人そうでよかった｜いい人そうでよかったです」と、ほっとしたように笑った。|{a}は朝、隣の家の人に呼び止められて、しばらく立ち話をした。家に戻ると、{b}が「何を話してたの？｜何を話していた？｜何を話していたんですか」と聞く。{a}が「この辺の、おいしいパン屋の話｜この辺りの、うまいパン屋の話だ｜この辺りの、おいしいパン屋の話です」と答えて、二人は週末にその店へ行くことにした。'),
    mug: L('{a}が雑貨屋で、色違いのマグカップを二つ買ってきた。{b}の分は青、{a}の分は黄色。翌朝から、二人のコーヒーはそのマグで飲むことになった。|{b}がうっかり{a}のマグカップを使っていた。{a}が「それ、私の｜それは私のだ｜それ、私のです」と言うと、{b}は飲みかけのマグを見下ろして、「中身は同じ｜中身は同じだ｜中身は同じです」と笑った。結局その朝は、マグを取り替えずに飲み干した。'),
    ring: L('{a}は、ふとした拍子に自分の左手を眺めていた。結婚指輪が、まだ少しだけ指になじんでいない。気づいた{b}が自分の手を並べると、二つの指輪が並んで光った。|{b}が結婚指輪を外し忘れたまま、洗面所で手を洗っていた。{a}は慌てて排水口に手をかざした。「落としたら大変｜落としたら大変だ｜落としたら大変です」――{b}は笑いながら、それでも指輪をしっかり指に押し戻した。'),
    senmen: L('洗面所のコップに、歯ブラシが二本並んでいる。{a}はそれを見るたびに、少し口元がゆるんだ。ある朝、{b}が自分のと間違えて{a}の歯ブラシを手に取りかけ、二人で大笑いした。|{a}は、洗面台の棚に二人分のタオルが並んでいるのを見て、しみじみとした。少し前まで、ここには一人分しかなかった。{b}が「何をにやにやしてるの？｜何をにやにやしている？｜何をにやにやしているんですか」と聞いても、{a}は首を振るだけだった。'),
    kaimono: L('{a}と{b}は、二人で初めて大きな買い物をした。家具屋で何台ものソファに座り比べ、最後は二人とも同じ一台を指さした。届いたソファに並んで座ると、{b}は「ちょうど二人分｜ちょうど二人分だ｜ちょうど二人分です」と満足そうに言った。|冷蔵庫が届いた日、{a}と{b}は扉の内側のポケットに何を入れるかで真剣に話し合った。結局、{b}の好きな飲み物と、{a}の好きな調味料が仲よく並んだ。'),
    /* エプロン姿の出迎え（服を着た版。{a}＝待っていた人、{b}＝帰ってきた人） */
    apron: L('{b}が帰ると、真新しいエプロンをつけた{a}が玄関で出迎えた。「おかえり。ご飯にする？　お風呂にする？｜おかえり。飯にするか、風呂にするか｜おかえりなさい。ご飯にしますか、お風呂にしますか」――{b}は思わず吹き出して、「それ、一度言ってみたかったやつでしょ｜それは、一度言ってみたかったやつだろう｜それ、一度言ってみたかったやつでしょう」と言った。|エプロンをつけた{a}が、玄関で{b}を待ち構えていた。{a}は胸を張って、「新婚らしく、出迎えてみた｜新婚らしく、出迎えてみた｜新婚らしく、出迎えてみました」と言った。{b}は照れくさそうに笑いながら、「ただいま｜ただいま｜ただいま帰りました」と返した。')
  };
  function canR18(ctx, S, a, b) { return !HK.SAFE_ON && HK.ShinkonR18X && HK.PairR18 && HK.PairR18.sexOk(ctx, a, b) && S.sex < S.lewdMax; }
  W.roll = function (ctx, S, day) {
    if (day.sick || day.apart) return;
    var U = S.wedUsed = S.wedUsed || {}, busy = day.sea || day.bday || day.vday || day.wday || day.pastEv;
    if (ctx.rng() > (busy ? 0.12 : 0.38)) return;
    var L0 = W.EV.filter(function (e) {
      if (U[e.id] || (e.wed && !S.wed) || (e.love && !S.love)) return false;
      if (e.r18 && !canR18(ctx, S, S.A, S.B)) return false;
      if (e.out && day.dull) return false;
      return !!(W.T[e.id] || e.r18);
    });
    if (!L0.length) return;
    var e = L0[Math.floor(ctx.rng() * L0.length)];
    U[e.id] = 1; day.wedEv = { e: e, part: e.part };
  };
  W.run = function (ctx, S, day, part) {
    var E = day.wedEv;
    if (!E || E.part !== part || E.done || day.sick || day.apart) return;
    E.done = true;
    var e = E.e, A = S.A, B = S.B, a = ctx.rng() < 0.5 ? A : B, b = a === A ? B : A, X = HK.ShinkonR18X;
    if (e.id === 'apron') {
      /* 待っていた人：帰りが遅い人の相手（どちらも遅くなければどちらか） */
      var la = (day.pa || {}).late, lb = (day.pb || {}).late;
      if (la && !lb) { a = B; b = A; } else if (lb && !la) { a = A; b = B; }
      if (canR18(ctx, S, a, b) && ctx.rng() < 0.7) { if (X.apron(ctx, S, day, a, b)) S.wedN = (S.wedN || 0) + 1; return; }
    }
    if (e.id === 'pillow') { if (X && X.pillow && X.pillow(ctx, S, day, a, b)) S.wedN = (S.wedN || 0) + 1; return; }
    var t = SK().pickT(ctx, W.T[e.id], a, b);
    if (!t) return;
    var re = SK().withReact(ctx, 'warm', b, a, 0.35), rom = SK().ROM.test(t);
    var ev = ctx.act2({ actors: [a, b], cat: S.love && (rom || e.love || e.wed) ? 'romance' : 'bond', text: SK().fill(ctx, t, a, b) + re.text, odd: re.odd, why: '新婚部屋：新婚らしい出来事（' + e.nm + '）',
      fx: function () { ctx.mod2(a, b, { aff: 2, att: S.love ? 2 : 0 }, { aff: 2, att: S.love ? 2 : 0 }); } });
    if (ev) { S.wedN = (S.wedN || 0) + 1; if (re.odd) S.odd++; }
  };
})();
