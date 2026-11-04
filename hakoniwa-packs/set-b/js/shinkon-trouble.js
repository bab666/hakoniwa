/* 新婚部屋：暮らしの困りごと（両方のビルド。2026-11-03 利用者のフィードバック「環境の値によって起こるトラブルをもっと増やしてほしい（ご飯が焦げちゃったり、残業で遅くなったり）」）
   ■ HK.ShinkonTrouble（TR）
     ・TR.LIST：困りごと 17 種。{ id, part（m 朝／d 日中／n 夜）, kind（受け止める人の反応の種類。shinkon-react.js）, w(ctx, S, day, X, Y)（X が当人のときの重み。0 なら起きない）, t: [文] }
       文の頭の [c] は「当人が家事をする人（HK.Life.canChore）のときだけ」、[h] は「相手が家にいるときだけ」
     ・TR.roll(ctx, S, day)：その日の困りごとを一つ決める（無ければ null）。{ tr, who, other }。起こりやすさは仕事の型・帰りの遅さ・出張・在宅・役割（料理・家事が苦手か）・休日で変わる
     ・その日の印：雨に降られた（day.rain）・停電（day.dark）・買い忘れ（day.forgot）・遅い帰り（day.lateHome）。R18 版のきっかけ（shinkon-r18-more.js）が読む
   ■ 文：{a}＝困りごとの当人、{b}＝相手（家にいないこともある書き方は [h] を付けない）。受け止め方と決着は shinkon.js が shinkon-react.js から足す。
     家事・料理をするのは当人だけ（料理の困りごとは料理をする人だけに起きる）。台詞は3本（一人称「私」・二人称「あなた」）。登場人物はすべて成人として扱う */
/* @event scen=set-b-shinkon id=sk_tr_burnt cat=bond tie=- label=夕飯を焦がしてしまう */
/* @event scen=set-b-shinkon id=sk_tr_overtime cat=bond tie=- label=残業で帰りが遅くなる */
/* @event scen=set-b-shinkon id=sk_tr_train cat=bond tie=- label=帰りの電車が止まる */
/* @event scen=set-b-shinkon id=sk_tr_rain cat=bond tie=- label=急な雨でずぶ濡れになる */
/* @event scen=set-b-shinkon id=sk_tr_appliance cat=bond tie=- label=家電が壊れて困る */
/* @event scen=set-b-shinkon id=sk_tr_oversleep cat=bond tie=- label=寝坊して慌てて出かける */
/* @event scen=set-b-shinkon id=sk_tr_lockout cat=bond tie=- label=鍵を忘れて家に入れない */
/* @event scen=set-b-shinkon id=sk_tr_dark cat=bond tie=- label=夜の停電で真っ暗になる */
/* @event scen=set-b-shinkon id=sk_tr_trip cat=bond tie=- label=出張先でのささやかな困りごと */
/* @event scen=set-b-shinkon id=sk_tr_remote cat=bond tie=- label=在宅の仕事中のハプニング */
/* @event scen=set-b-shinkon id=sk_tr_deadline cat=bond tie=- label=締め切りに追われる一日 */
/* @event scen=set-b-shinkon id=sk_tr_shift cat=bond tie=- label=勤務の時間がすれ違う */
/* @event scen=set-b-shinkon id=sk_tr_parcel cat=bond tie=- label=宅配便を受け取り損ねる */
/* @event scen=set-b-shinkon id=sk_tr_bug cat=bond tie=- label=家の中に虫が出る */
/* @event scen=set-b-shinkon id=sk_tr_forgot cat=bond tie=- label=頼まれた買い物を忘れる */
/* @event scen=set-b-shinkon id=sk_tr_spill cat=bond tie=- label=朝のコーヒーをこぼす */
/* @event scen=set-b-shinkon id=sk_tr_noise cat=bond tie=- label=隣の工事の音で落ち着かない */
(function () {
  'use strict';
  var HK = window.HK;
  if (!HK) return;
  function L(s) { return s.split('|'); }
  function wk(c) { return (c && c.life && c.life.work) || 'regular'; }
  function LF() { return HK.Life; }
  var COMMUTE = { out: 1, overtime: 1, regular: 1, trip: 1, shift: 0.6, self: 0.4 };
  function plan(day, c, S) { return c === S.A ? day.pa : day.pb; }
  var TR = HK.ShinkonTrouble = {};
  TR.LIST = [
    { id: 'burnt', part: 'n', kind: 'oops', w: function (ctx, S, day, X) { var lf = LF(); if (!lf.canCook(X) || plan(day, X, S).trip) return 0; return lf.clumsy(X) ? 3 : plan(day, X, S).late ? 1.2 : 0.5; },
      t: L('台所から焦げたにおいが漂ってきた。{a}が慌ててフライパンの蓋を開けると、夕飯のおかずは見事に真っ黒になっていた。{a}はしばらく、その黒い塊を見つめて固まった。|{a}は煮物の鍋を火にかけたまま、うっかり電話に出てしまった。気づいたときには鍋の底が焦げついて、部屋じゅうに香ばしすぎるにおいが広がっていた。|{a}はご飯を炊いたつもりが、炊飯器のスイッチを入れ忘れていた。夕飯の時間になって蓋を開けると、中には水に浸かったお米がそのまま眠っていた。') },
    { id: 'overtime', part: 'n', kind: 'wait', w: function (ctx, S, day, X) { var p = plan(day, X, S); return p.late && !p.trip ? (wk(X) === 'overtime' ? 2.4 : 1.2) : 0; },
      t: L('{a}の帰りは、今日も日付が変わる少し前だった。残業続きの体を引きずるようにして、{a}は玄関の鍵を回した。|夕方、{a}から「ごめん、残業で遅くなる｜すまない、残業で遅くなる｜ごめんなさい、残業で遅くなります」と連絡が入った。{a}が家に着いたのは、夜もだいぶ更けてからだった。|{a}は終わらない仕事を抱えたまま、最終の一本前の電車に滑り込んだ。家の明かりが見えたとき、{a}はやっと肩の力を抜いた。') },
    { id: 'train', part: 'n', kind: 'wait', w: function (ctx, S, day, X) { var p = plan(day, X, S); return !day.hol && !p.trip ? (COMMUTE[wk(X)] || 0) * 0.7 : 0; },
      t: L('帰りの電車が、事故の影響で駅と駅のあいだで止まってしまった。{a}は満員の車内で、動かない窓の外をため息まじりに眺めた。家に着いたのは、いつもより一時間以上も遅かった。|帰りの電車が信号の故障で止まった。{a}は駅のベンチで運転の再開を待ちながら、「まだ帰れない｜まだ帰れない｜まだ帰れません」と短く連絡を送った。') },
    { id: 'rain', part: 'n', kind: 'oops', w: function (ctx, S, day, X) { var p = plan(day, X, S); if (p.trip) return 0; return day.hol ? 0.4 : wk(X) === 'remote' || wk(X) === 'home' ? 0.15 : 0.9; },
      t: L('帰り道で、急に大粒の雨が降り出した。傘を持っていなかった{a}は、駅から家まで走って帰ってきた。玄関に立った{a}は、頭から足の先までずぶ濡れだった。|夕立に降られた{a}は、コンビニの軒先でしばらく雨宿りをした。やんだと思って歩き出したとたん、また降り出して、結局びしょ濡れで帰ってきた。') },
    { id: 'appliance', part: 'n', kind: 'oops', w: function (ctx, S, day, X, Y) { return !day.apart && !plan(day, X, S).trip ? 0.6 : 0; },
      t: L('{a}がエアコンのスイッチを入れると、ぶおん、と嫌な音を立てて止まってしまった。何度試しても、冷たい風も暖かい風も出てこなかった。|お風呂のお湯を出そうとした{a}は、いつまでたっても水しか出ないことに気づいた。給湯器の画面には、見慣れない番号が光っていた。|[c]{a}が洗濯機を回すと、洗濯機は途中でがたんと止まり、水を張ったまま動かなくなった。{a}は説明書を片手に、洗濯機の前でしばらく途方に暮れた。|[c]{a}が冷蔵庫を開けると、中がほんのりぬるかった。冷凍庫のアイスは、すっかり柔らかくなっていた。') },
    { id: 'oversleep', part: 'm', kind: 'oops', w: function (ctx, S, day, X) { if (day.hol || plan(day, X, S).trip || wk(X) === 'home') return 0; var t = X.tr || {}; return (wk(X) === 'shift' || wk(X) === 'overtime' ? 1 : 0.4) * (0.6 + (t.fc || 0.5)); },
      t: L('目覚ましを止めた覚えもないまま、{a}が目を開けると、家を出る時間をとっくに過ぎていた。{a}は飛び起きて、片方だけ靴下をはいたまま玄関へ走った。|{a}は二度寝のつもりで目を閉じて、そのまま寝過ごした。慌てて身支度をする{a}の髪は、後ろだけ盛大にはねていた。') },
    { id: 'lockout', part: 'n', kind: 'oops', w: function (ctx, S, day, X, Y) { var p = plan(day, X, S), q = plan(day, Y, S); return !p.trip && !p.late && (q.late || q.trip) ? 1.1 : 0; },
      t: L('{a}が家に着いて鞄を探ると、鍵がどこにもなかった。{a}は玄関の前にしゃがみこんで、{b}の帰りを待つしかなかった。|鍵を職場に忘れたことに、{a}は玄関の前で気づいた。暗い廊下で膝を抱えていると、ようやく{b}の足音が聞こえてきた。') },
    { id: 'dark', part: 'n', kind: 'oops', w: function (ctx, S, day) { return !day.apart ? 0.4 : 0; },
      t: L('夜、窓の外で雷が鳴ったかと思うと、家じゅうの明かりがふっと消えた。{a}は手探りで懐中電灯を探しながら、{b}の名前を呼んだ。|強い風の音のあと、ぷつりと電気が止まった。真っ暗な部屋で、{a}はスマホの明かりを頼りに、{b}のいるほうへ向かった。') },
    { id: 'trip', part: 'n', kind: 'wait', w: function (ctx, S, day, X) { return plan(day, X, S).trip ? 1.6 : 0; },
      t: L('出張先での打ち合わせが長引いて、{a}は夕飯を食べそびれた。ホテルに戻ってから、{a}はコンビニのおにぎりをかじりながら、{b}に短い連絡を送った。|出張先のホテルの部屋は、エアコンの効きがひどく悪かった。{a}は毛布にくるまりながら、家の布団が恋しいと{b}に連絡した。') },
    { id: 'remote', part: 'd', kind: 'oops', w: function (ctx, S, day, X) { return wk(X) === 'remote' && !day.hol && !plan(day, X, S).trip ? 1.4 : 0; },
      t: L('在宅の会議の最中に、家のネット回線が突然切れた。{a}はスマホの電波で会議に戻ろうと、部屋じゅうを歩き回った。|[h]{a}がオンラインの会議で話している最中、画面の後ろを{b}が寝癖のまま横切った。画面の向こうの同僚たちに、{a}はひきつった笑顔でごまかした。') },
    { id: 'deadline', part: 'd', kind: 'wait', w: function (ctx, S, day, X) { return wk(X) === 'self' && !plan(day, X, S).trip ? 1.5 : 0; },
      t: L('{a}は締め切り前の仕事を抱えて、朝から机にかじりついていた。昼を過ぎても、{a}の手は止まらなかった。|自分で引き受けた仕事の締め切りが、思ったより早く迫っていた。{a}は「今日は話しかけないで｜今日は話しかけないでくれ｜今日は話しかけないでください」と貼り紙をして、仕事部屋にこもった。') },
    { id: 'shift', part: 'm', kind: 'wait', w: function (ctx, S, day, X, Y) { return wk(X) === 'shift' && !day.apart ? 1.4 : 0; },
      t: L('[h]夜勤明けの{a}が帰ってきたとき、{b}はちょうど起き出してきたところだった。寝ぼけた顔で「おはよう」と言われて、{a}は「おやすみ｜おやすみ｜おやすみなさい」と返した。|{a}の勤務の時間が変わって、今週は二人の起きている時間がほとんど重ならなかった。テーブルの上のメモだけが、二人の会話になった。') },
    { id: 'parcel', part: 'd', kind: 'oops', w: function (ctx, S, day, X) { var p = plan(day, X, S); return p.home && p.home.d ? 0.7 : 0; },
      t: L('{a}が昼寝をしているうちに、宅配便の不在票が郵便受けに入っていた。楽しみにしていた荷物だっただけに、{a}はがっくりと肩を落とした。|再配達を頼んだ時間に、{a}はちょうど近所のコンビニへ出ていた。戻ると、二枚目の不在票がひらりと揺れていた。') },
    { id: 'bug', part: 'n', kind: 'oops', w: function (ctx, S, day) { return !day.apart ? 0.5 : 0; },
      t: L('居間の壁を、黒い虫がすっと横切った。{a}は悲鳴を上げて、ソファの上に飛び乗った。|洗面所の電気をつけた瞬間、{a}は固まった。足もとを、大きな虫が走り抜けていったのだ。') },
    { id: 'forgot', part: 'n', kind: 'oops', w: function (ctx, S, day, X) { return !plan(day, X, S).trip ? 0.8 : 0; },
      t: L('{a}は帰りに買い物をしてきたが、袋の中を見て青くなった。いちばん大事なものを、すっかり買い忘れていた。|{a}は「頼まれていたもの、何だっけ｜頼まれていたものは、何だったか｜頼まれていたもの、何でしたっけ」と、店の棚の前で立ち尽くした。結局、思い出したのは家に着いてからだった。') },
    { id: 'spill', part: 'm', kind: 'oops', w: function (ctx, S, day, X) { return !plan(day, X, S).trip ? 0.6 : 0; },
      t: L('{a}は寝ぼけたまま、マグカップのコーヒーをテーブルいっぱいにこぼした。出かける前のシャツの袖にまで、茶色いしみが広がった。|{a}は朝のコーヒーを片手にあくびをした拍子に、中身を床にこぼしてしまった。{a}は熱さに飛び上がって、しばらく足をばたばたさせた。') },
    { id: 'noise', part: 'd', kind: 'oops', w: function (ctx, S, day, X) { var p = plan(day, X, S); return p.home && p.home.d ? 0.5 : 0; },
      t: L('隣の家で始まった工事の音が、朝から鳴りやまなかった。{a}は耳をふさいだり窓を閉めたりしたが、どうにも落ち着かなかった。|昼過ぎ、上の階から何かを引きずるような音が続いた。{a}は天井を見上げて、ため息をついた。') }
  ];
  /* その日の困りごと（日中・夜に家にいない人には、家の中の困りごとは起きない。出張の日は出張先の困りごとだけ） */
  TR.roll = function (ctx, S, day) {
    if (ctx.rng() > 0.55) return null;
    var cands = [];
    [[S.A, S.B], [S.B, S.A]].forEach(function (p) {
      TR.LIST.forEach(function (tr) {
        var w = tr.w(ctx, S, day, p[0], p[1]);
        if (w > 0) cands.push({ tr: tr, who: p[0], other: p[1], w: w * (S.trUsed && S.trUsed[tr.id] ? 0.15 : 1) });
      });
    });
    if (!cands.length) return null;
    var c = HK.weighted(ctx.rng, cands, function (x) { return x.w; });
    S.trUsed = S.trUsed || {}; S.trUsed[c.tr.id] = (S.trUsed[c.tr.id] || 0) + 1;
    return c;
  };
  /* 文を選ぶ（[c]・[h] の条件を見る） */
  TR.text = function (ctx, S, day, c) {
    var lf = LF(), q = plan(day, c.other, S);
    var arr = c.tr.t.filter(function (t) {
      if (/^\[c\]/.test(t) && !lf.canChore(c.who)) return false;
      if (/^\[h\]/.test(t) && (q.trip || !(q.home && (c.tr.part === 'd' ? q.home.d : true)))) return false;
      /* 離れていた日数・遅い日の続きを前提にする文（「残業続き」など）は、実際の日数で絞る（shinkon.js の HK.Shinkon.awayOk） */
      if (HK.Shinkon && HK.Shinkon.awayOk && !HK.Shinkon.awayOk(ctx, t.replace(/^\[[ch]\]/, ''), c.who, c.other)) return false;
      /* 住まい・時間帯・季節に合わない文（平屋で上の階など。2026-11-04 報告）も外す */
      if (HK.Shinkon && HK.Shinkon.okText && !HK.Shinkon.okText(ctx, t.replace(/^\[[ch]\]/, ''), c.who, c.other)) return false;
      return true;
    });
    var t = arr.length ? arr[Math.floor(ctx.rng() * arr.length)] : '';
    return t.replace(/^\[[ch]\]/, '');
  };
})();
