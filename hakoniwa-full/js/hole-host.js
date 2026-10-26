/* 箱庭シミュレーター（R18版のみ）: 感覚遮断穴 ― 主催者の役（遮断穴を営んでいる人）
   環境値「主催者」（HK.Roles：おまかせ＝なし／住人から／モブ／なし）と、住人ごとの欄「主催者になる／ならない」。
   ・おまかせ・なしは今までどおり（主催者は出てこない。物語の乱数にも触れない）
   ・住人の主催者は、穴にはまる人にも、壁の向こうの人にもならない。壁の裏の帳場から覗き窓で眺めて、態度に合わせて品評し、
     ときどき手を出す（客を呼び込む・遮断を深める／お気に入りを早めに出す／伝声管でからかう）。
     はまっている人は、途中か帰り際に「主催者が知り合いだった」と気づくことがある
   ・主催者は体には触れない（性的な場面にはしない）。呼び込みで溜まる感覚は「壁の向こうの誰か」のもの。
     恋愛・R18にしない相手（HK.ngPair）の組では、呼び込み・遮断の調整もしない
   ・役割「穴にはまる」「壁の向こう」を選んだ人は、「主催者になる」を選んでいない限り主催者にしない
   ・最低人数：住人が一人だけなら、その人がはまる（主催者はなし）。主催者も4人の枠に数える
   {h}＝主催者 {a}＝はまっている人。文は物語とは別の乱数で選ぶ。登場人物はすべて成人として扱う */
(function () {
  'use strict';
  var HK = window.HK, K = HK && HK.SoloKit;
  if (!K || !HK.SCENARIOS || !HK.SCENARIOS.hole || !HK.Roles) return;
  function L(s) { return s.split('|'); }
  var ROLE = { allowMob: true, allowNone: true, auto: 'none', yes: '主催者になる', mob: { given: true },
    desc: '遮断穴を営む主催者を、住人がやるか・モブがやるか・なしにするかを選びます。住人の主催者は穴にも壁の向こうにも入らず、帳場の覗き窓から眺めて品評し、ときどき客を呼び込んだり、お気に入りを早めに出したりします。住人が一人だけのときは主催者を置きません',
    fit: function (c) { var t = c.tr || HK.traits(c.eg); return 0.3 + t.fc * 0.4 + t.a * 0.3 + (t.lead || 0) * 0.3; } };
  HK.Roles.install(HK.SCENARIOS.hole, 'host', '主催者', ROLE);

  var T = {
    intro: {
      res: L('この「遮断穴」を仕切っているのは、{h}だった。{h}は壁の裏の小部屋で帳簿を広げ、覗き窓から{a}の上半身を眺めた。{a}はまだ、この場の主催者が誰なのかを知らない。|{a}がはまった壁の裏には、細い通路と小さな帳場があった。そこに座っているのは、この遮断穴の主催者――{h}だ。{h}は穴の札を「使用中」に掛け替えて、静かに息をついた。|{h}は、遮断の具合を確かめる計器の針を指先でなぞった。今日の「お客」は{a}だった。主催者が知り合いだとは、{a}は夢にも思っていないだろう。'),
      mob: L('壁の上には、小さな真鍮の札が打ちつけてあった。「当遮断穴の主催　{h}」――その下に、細い伝声管の口が開いている。「ようこそ。お時間まで、ごゆっくり」と、落ち着いた声が流れてきた。|{a}の目の前の壁に、覗き窓がひとつ開いた。「私は{h}。この穴を営んでいる者です」窓の向こうの目は、品定めするように{a}を見つめてから、ぱたりと閉じた。|伝声管から、咳払いがひとつ聞こえた。「主催の{h}です。遮断は完璧ですので、ご安心を」{a}は何を安心すればいいのか分からないまま、壁を睨みつけた。')
    },
    /* 品評：主催者の態度9種（性的な語を使わない） */
    comment: {
      proud: L('{h}は覗き窓から{a}を見下ろして、鼻を鳴らした。{h}「いいざまだな。しばらくそこで反省してろ」{h}は帳簿に大きく「延長」と書きかけて、やめた。|{h}「穴にはまったくらいで騒ぐな」{h}は伝声管の蓋を閉めたまま、ひとりごちた。それでも{h}の目は、何度も覗き窓のほうへ戻っていった。|{h}は腕を組んで、壁の向こうの人の出入りを数えていた。{h}「{a}の奴、まだ平気な顔をしてやがる」{h}は面白くなさそうに、計器の針を指で弾いた。'),
      stern: L('{h}は計器の針を確かめ、帳簿に時刻を書き入れた。{h}「規定の時間までは、出すわけにいかない」覗き窓の向こうの{a}を一度だけ見て、{h}はまた帳簿に目を落とした。|{h}「{a}、姿勢を崩すな。遮断の具合が乱れる」{h}は伝声管越しに、事務的に告げた。返事の代わりに、壁のこちら側で{a}が何か言い返す声がした。|{h}は規則正しく、一時間ごとに覗き窓を開けた。{a}の顔色を確かめ、計器の数字を読み、窓を閉める。その手順を、{h}は一度も省かなかった。'),
      tsun: L('{h}は覗き窓の前で、そわそわと行ったり来たりしていた。{h}「べ、別に{a}の様子が気になるわけじゃないし。仕事だし」そう言いながら、{h}は五分おきに窓を開けていた。|{h}「なんで{a}がはまってるのよ……」{h}は帳簿を握りしめて、頭を抱えた。それでも受付の札を「休止中」に変える勇気は、出なかった。|{h}は伝声管に口を近づけて、すぐに離した。{h}「……声かけたら、ばれるじゃない」{h}はむくれた顔で、計器の針をにらみつけた。'),
      gentle: L('{h}は覗き窓から{a}の顔をのぞいて、困ったように微笑んだ。{h}「あらあら、退屈そうね」{h}は小さな水差しを用意して、窓の縁にそっと置いた。|{h}は帳場で編み物をしながら、ときどき{a}のほうへ目をやった。{h}「もう少しの辛抱よ、{a}」その声は、伝声管には乗らないくらい小さかった。|{h}「お腹すいてないかしら」{h}は{a}の頭の上の棚に、焼き菓子をひとつ置いた。{a}が首を伸ばしても届かない位置だったことに、{h}は気づいていなかった。'),
      devoted: L('{h}は覗き窓に額をつけるようにして、{a}を見守っていた。{h}「何かあったら、すぐ止めるから」{h}は計器の非常の札に、ずっと手を添えていた。|{h}は{a}のために、壁の縁に柔らかい布を詰め直した。{h}「少しでも、楽になるといいんだけど」{a}は、急に腰回りが楽になった理由を知らなかった。|{h}「{a}、がんばって……」{h}は帳場の椅子にも座らず、立ったまま時間を数えていた。自分で始めた商売なのに、{h}はひどく落ち着かなかった。'),
      cool: L('{h}は計器の数字を、淡々と記録帳に写していた。{h}「遮断率、九割九分。{a}の反応は想定どおり」{h}の筆は、一度も止まらなかった。|{h}は覗き窓から{a}の表情を観察し、余白に小さく書きつけた。{h}「待つ時間が長いほど、想像で消耗する。興味深い」{h}は次の頁をめくった。|{h}「{a}は時間を数えるほうか、数えないほうか」{h}は顎に手を当てて、覗き窓の向こうを眺めた。答えが出るまで、{h}は帳場を離れなかった。'),
      free: L('{h}は覗き窓にかじりついて、{a}の顔を眺めていた。{h}「わ、今の顔いい！記念に描いとこ」{h}は帳簿の裏に、さらさらと似顔絵を描き始めた。|{h}「ねえねえ、{a}って意外と暇つぶし下手だよね」{h}は誰もいない帳場で、ひとりで笑い転げた。それから伝声管の蓋に手をかけて、話しかけようか迷った。|{h}は計器の針を眺めながら、足をぶらぶらさせていた。{h}「次はどんなお客が来るかなー」{h}にとっては、{a}の困り顔も、この商売の楽しみのひとつだった。'),
      shy: L('{h}は覗き窓を指一本ぶんだけ開けて、こっそり{a}をのぞいた。{h}「み、見てない、見てないから……」目が合いそうになって、{h}は慌てて窓を閉めた。|{h}は帳場の隅で、膝を抱えて小さくなっていた。{h}「{a}に、こんなお店やってるって知られたら……」{h}は顔を真っ赤にして、帳簿で顔を隠した。|{h}「ご、ごめんね、{a}……」{h}は伝声管に聞こえないように、小さく謝った。それでも札を「休止中」に変えることは、{h}にはできなかった。'),
      polite: L('{h}は覗き窓を開け、{a}に丁寧に一礼した。{h}「ご不便をおかけしております。お時間まで、もうしばらくお待ちくださいませ」窓は、音もなく閉じられた。|{h}は帳簿に{a}の名を書き入れ、几帳面に時刻を添えた。{h}「本日のお客様は、お一人様ですね」その声は、老舗の宿の主人のように穏やかだった。|{h}「お加減はいかがでしょう、{a}様」{h}は伝声管越しに、そっと尋ねた。返事を待つあいだ、{h}は背筋を伸ばしたまま微動だにしなかった。')
    },
    /* 客を呼び込む・遮断を深める：まだ感覚が戻っていない（pre）／戻っている（live）／攻めを選んだ人（top） */
    boost: {
      pre: L('{h}は表の札を「空きあり」に掛け替えて、通りに向かって手招きした。ほどなく、壁の向こうに新しい足音が増えていった。{a}は何も感じないまま、伝声管から漏れる客の笑い声を聞いていた。|{h}は計器のつまみを、遮断がいちばん深くなるところまで回した。壁の向こうで何が起きても、{a}には何も届かない――その分だけ、溜まっていく。{h}は帳簿に、小さく丸をつけた。|{h}「せっかくだし、もう少し賑やかにしようか」{h}は呼び込みの鈴を三度鳴らした。壁の向こうの人の出入りが、目に見えて増えた。'),
      live: L('{h}は表の札を「空きあり」に掛け替えて、通りに向かって手招きした。壁の向こうの足音が増えるたびに、戻ってきた感覚が{a}の腰を震わせた。{a}は唇を噛んで、覗き窓のほうを睨んだ。|{h}は呼び込みの鈴を鳴らした。すぐに壁の向こうに誰かが立つ気配がして、{a}の体がびくりと跳ねた。{h}「休んでいる暇はないよ」|{h}は計器のつまみを、ほんの少しだけ戻した。遮断の薄くなった壁越しに、向こう側の手つきがそのまま{a}に伝わってきた。{a}は額を壁に押しつけて、声をこらえた。'),
      top: L('{h}は呼び込みの鈴を鳴らしたが、壁の向こうから聞こえてきたのは客の悲鳴だった。{a}の脚が、近づく者を片っ端から蹴り返していた。{h}は帳簿を閉じて、深いため息をついた。|{h}が表の札を掛け替えると、{a}は伝声管に向かって低く言った。{a}「今、客を入れたな。出たら覚えておけ」{h}は黙って、札を「休止中」に戻した。|{h}は遮断のつまみを回したが、{a}は気にも留めなかった。壁の向こうに立った誰かは、すぐに{a}の脚に追い払われた。{h}「……この人は、商売にならないな」')
    },
    /* お気に入りを早めに出す */
    save: L('{h}は計器の非常の札を引き、遮断の術をその場で解いた。{h}「今日はここまで。……{a}には、これ以上は無理だ」壁の留め具が外れ、{a}の腰がゆっくりと穴から抜けた。|{h}は覗き窓を閉めると、迷わず壁の裏の留め具に手をかけた。{h}「予定より早いけど、もうおしまい」{a}は急に軽くなった腰に戸惑いながら、壁から転がり出た。|{h}「{a}、出すよ」{h}は伝声管にそう告げてから、穴の縁の金具をひとつずつ外していった。最後の金具が外れたとき、{a}の体はふわりとこちら側へ戻ってきた。'),
    /* 伝声管・覗き窓でからかう */
    tease: L('伝声管から、くすくすと笑う声が漏れてきた。「いい顔してるね。壁の向こうの様子、教えてあげようか？」{a}は返事をせず、真っ赤になって伝声管の口を手で塞いだ。|覗き窓がすっと開いて、細い指が一枚の紙を差し入れた。紙には、ここまでに壁の向こうへ来た人の数が、正の字で書かれていた。{a}はその数を数えかけて、途中でやめた。|「あと何時間か、数えてる？」伝声管の声は、楽しそうに続けた。「教えてあげない」――{a}が言い返す前に、伝声管の蓋はぱたんと閉じられた。'),
    /* 主催者が知り合いだと気づく */
    discover: L('伝声管から聞こえた声に、{a}ははっと顔を上げた。聞き違えるはずがなかった。――この穴の主催者は、{h}だ。|覗き窓の向こうの目と、{a}の目が合った。見慣れた目元に、{a}は息を呑んだ。この穴を営んでいるのは、{h}だったのだ。|覗き窓の隙間から、帳場の机が少しだけ見えた。そこに置かれた湯呑みにも、走り書きの字にも、見覚えがあった。{a}「……{h}？　ここ、{h}のお店なの？」'),
    react: {
      proud: L('{a}「{h}、てめえか。ここから出たら、真っ先に殴る」|{a}は壁を拳で叩いた。「{h}！聞こえてるんだろう！」|{a}「道理で、ずいぶん底意地の悪い穴だと思った」'),
      stern: L('{a}「{h}。……出たら、きちんと説明してもらう」|{a}は目を閉じて、深く息を吐いた。「{h}、商売は選べ」|{a}「仲間をこんな目に遭わせるとは、感心しないぞ、{h}」'),
      tsun: L('{a}「はあ！？{h}のお店だったの！？最っ低！」|{a}は耳まで赤くなった。「{h}、ずっと見てたってこと！？」|{a}「べ、別に驚いてないし。{h}ならやりそうだし」'),
      gentle: L('{a}は目を丸くしてから、困ったように笑った。「まあ、{h}のお店だったのね」|{a}「{h}ったら、こんな商売をしていたの」|{a}「{h}なら、ひどいことはしないわよね？」'),
      devoted: L('{a}「{h}が……？じゃあ、{h}が見ててくれたんだ」|{a}はほっとしたように、肩の力を抜いた。「{h}がいるなら、大丈夫」|{a}「{h}のお店なら、最後までちゃんと待つから」'),
      cool: L('{a}「なるほど。この遮断の精度は、{h}の仕事か」|{a}は小さく頷いた。「{h}なら、時間はきっちり守るはずだ」|{a}「{h}。あとで、この術式の仕組みを聞かせてもらう」'),
      free: L('{a}「えっ、{h}なの！？すごい、これ{h}のお店！？」|{a}は思わず笑い出した。「{h}、ちょっと、出してよー！」|{a}「なあんだ、{h}かあ。ねえ、ついでに何か飲み物ちょうだい」'),
      shy: L('{a}は両手で顔を覆った。「{h}に、こんな格好を見られてたなんて……」|{a}「う、うそ……{h}……？」|{a}は消え入りそうな声で呟いた。「も、もう、{h}の顔、見られない……」'),
      polite: L('{a}は目を見開いてから、静かに息を整えた。「{h}さんでしたか。……あとで、お話を伺っても？」|{a}「{h}さんのお店だったのですね。存じませんでした」|{a}「なるほど、{h}さんが。……少々、驚きました」')
    },
    reactLove: L('{h}だと分かった途端、{a}の顔から強張りがすっと抜けた。|{a}は一瞬むっとしてから、{h}らしいと小さく笑った。|{a}は、{h}にずっと見られていたのだと思うと、急に顔が熱くなった。'),
    reactBad: L('{a}の目つきが険しくなった。{h}にだけは、こんな姿を見られたくなかった。|{a}「よりによって{h}か」――声には、隠しきれない棘があった。|{a}は覗き窓を睨みつけ、二度と弱音を吐かないと決めた。'),
    end: {
      known: L('{a}が帳場に顔を出すと、{h}は気まずそうに帳簿を閉じた。{h}「……お代は、いらないから」{a}は何か言いかけて、結局ため息だけをついた。|{h}は、穴から出た{a}に温かい手ぬぐいを差し出した。{h}「おつかれさま。……怒ってる？」{a}の返事は、しばらく返ってこなかった。|{a}が身支度を整えるあいだ、{h}は帳場で黙って待っていた。主催者と客として向き合うのは、二人とも初めてだった。{a}が先に口を開くまで、{h}は顔を上げなかった。'),
      hidden: L('最後まで、{a}はこの穴の主催者が{h}だとは気づかなかった。{h}は何食わぬ顔で、空いた穴の札を「準備中」に掛け替えた。帳簿の{a}の欄には、小さな印がひとつだけ付けられていた。|{a}が去ったあと、{h}はひとりで帳簿を閉じた。主催者の正体は、{h}だけの秘密になった。次に会ったとき、どんな顔をすればいいのかは分からなかった。|{h}は覗き窓の掛け金を下ろして、深く息をついた。{a}は、主催者が知り合いだとは最後まで知らないままだった。{h}はそれを、少しだけ寂しく思った。'),
      mob: L('帰り際、受付には主催者の{h}が座っていた。{h}「またのお越しを」{a}は振り返らずに、まっすぐ出口へ向かった。|主催者の{h}は、帳簿の{a}の欄に「上客」と書き込んだ。それが褒め言葉なのかどうか、{a}には分からなかった。{a}は、二度とこの道を通らないと決めた。|{h}は空いた穴を丁寧に拭き清め、札を「空きあり」に戻した。主催者にとって、{a}は今日の大勢の客のひとりにすぎなかった。表の通りには、もう次の客が立っていた。'),
      knownFall: L('主催者の{h}は、穴に戻っていく{a}の背中を、覗き窓から黙って見送った。止めるべきか迷ううちに、札は「使用中」に掛け替わっていた。{h}は帳簿の{a}の欄に、そっと「常連」と書き足した。|{h}は帳場を出て、壁の前に立つ{a}の肩に手を置きかけた。けれど{a}の蕩けた横顔を見て、{h}はその手を引っ込めた。主催者として、知り合いとして、何を言えばいいのか分からなかった。|{a}「{h}のお店、また来てもいい？」――そう尋ねられて、{h}はしばらく答えられなかった。やがて{h}は黙って頷き、帳簿の新しい頁を開いた。主催者の指は、ほんの少しだけ震えていた。'),
      hiddenFall: L('{a}は最後まで、この穴の主催者が{h}だとは知らなかった。{h}は覗き窓の向こうで、穴へ戻っていく{a}を見届けた。帳簿の{a}の欄には、もう印を付ける余白がなかった。|主催者の{h}は、自分から戻ってきた{a}の札を、黙って「使用中」に掛け替えた。{a}は、帳場にいるのが誰なのかを知らないままだった。{h}は、それでいいと思うことにした。|{h}は計器の針を見つめたまま、長いあいだ動かなかった。壁にはまっているのが{a}だということを、{h}だけが知っていた。主催者の秘密は、日を追うごとに重くなっていった。'),
      mobFall: L('主催者の{h}は、戻ってきた{a}に「おかえりなさい」と微笑んだ。帳簿の{a}の欄には、「常連」の印が増えていった。{a}は、それを誇らしく思うようになっていた。|{h}は{a}のために、いちばん端の穴を空けておくようになった。主催者にとって、{a}はもう上客のひとりだった。{a}が通りに姿を見せると、札は黙って「空きあり」に変わった。|主催者の{h}は、帳簿を閉じて満足げに息をついた。{a}のような客がいる限り、この穴が空になることはない。表の札は、今日も「使用中」のままだった。'),
      freed: L('予定の時間より早く遮断を解いたのは、主催者の{h}だった。|{a}を途中で穴から出したのは、主催者の{h}の判断だった。|時間を待たずに{a}を出すと決めたのは、主催者の{h}だった。')
    }
  };

  /* ---------- 小道具 ---------- */
  function pk(S, arr) {
    var U = S.hostUse = S.hostUse || {}, free = [], i, t, r = S.hostR;
    for (i = 0; i < arr.length; i++) if (!U[arr[i]]) free.push(arr[i]);
    if (free.length) t = free[r.int(free.length)];
    else { t = arr[0]; for (i = 1; i < arr.length; i++) if (U[arr[i]] < U[t]) t = arr[i]; }
    S.hostUseN = (S.hostUseN || 0) + 1; U[t] = S.hostUseN;
    return t;
  }
  function nm(s, m) { return s.replace(/\{(a|h)\}/g, function (x, k) { return m[k] != null ? m[k] : x; }); }
  function sidePick(input, i) { return ((input.perChar && input.perChar[i] && input.perChar[i].pick) || {}).side; }
  function hostYes(input, i) { return ((input.perChar && input.perChar[i] && input.perChar[i].pick) || {}).host === 'yes'; }
  var NEAR = /^(lover|mate|fated|spouse|almost|crush|fwb|best|childhood|buddy|sibclose|sibprot|parent|worship)$/, BAD = /^(rival|enemy|bad|sibbad|ex)$/;
  function tieOf(input, a, b) {
    var o = { near: false, bad: false };
    (input.ties || []).forEach(function (t) {
      if (!((t.a === a && t.b === b) || (t.a === b && t.b === a))) return;
      if (NEAR.test(t.type) && (t.type !== 'crush' || t.a === a)) o.near = true;
      if (BAD.test(t.type)) o.bad = true;
    });
    return o;
  }

  var HH = HK.HoleHost = { text: T };
  /* 主催者を決める（入力だけで決まる。物語の乱数に触れない）：{ kind: 'none'|'res'|'mob', i, mob } */
  HH.resolve = function (input) {
    var chars = (input && input.chars) || [], env = (input && input.env) || {};
    var src = env[HK.Roles.envId('host')] || 'auto';
    var anyYes = chars.some(function (c, i) { return hostYes(input, i); });
    if (src === 'none' || (src === 'auto' && !anyYes)) return { kind: 'none', i: -1 };
    /* 役割「穴にはまる」「壁の向こう」を選んだ人は、「主催者になる」を選んでいない限り外す */
    var list = [];
    chars.forEach(function (c, i) {
      if (sidePick(input, i) && !hostYes(input, i)) return;
      var x = {}; for (var k in c) x[k] = c[k]; x.i = i; x.tr = HK.traits(c.eg); list.push(x);
    });
    var rng = HK.rng(((+input.seed || 0) * 131 + 7919) >>> 0);
    var r = HK.Roles.resolve({ rng: rng, env: env, chars: list }, 'host', input, ROLE);
    /* 住人が一人だけなら、その人がはまる（主催者はなし） */
    if (r.kind === 'res' && chars.length < 2) return { kind: 'none', i: -1 };
    if (r.kind === 'res') return { kind: 'res', i: r.who[0].i };
    if (r.kind === 'mob') return { kind: 'mob', i: -1, mob: r.mob };
    return { kind: 'none', i: -1 };
  };
  HH.idx = function (input) { return HH.resolve(input).i; };

  HH.setup = function (S, input) {
    S.host = null;
    var r = HH.resolve(input);
    if (r.kind === 'none') return null;
    var h;
    if (r.kind === 'res') {
      var c = input.chars[r.i];
      h = { i: r.i, name: c.name, eg: c.eg, tr: HK.traits(c.eg), gender: c.gender || '', likes: c.likes || '', tone: c.tone || '', pos: c.pos || '', futa: !!c.futa,
        ng: Array.isArray(c.loveNG) ? c.loveNG.filter(function (x) { return x >= 0; }) : [], lock: HK.lockFirst(c.loveLock), locks: HK.parseLocks(c.loveLock), kind: 'res' };
      if (HK.charFlags) HK.charFlags(c, h, 'hole');
      var tt = tieOf(input, r.i, S.h.i);
      h.near = tt.near; h.bad = tt.bad;
    } else { h = r.mob; h.i = -1; h.kind = 'mob'; h.tr = h.tr || HK.traits(h.eg); }
    h.persona = HK.personaOf(h);
    S.host = h; S.hostR = HK.rng(((+input.seed || 0) * 37 + 104729) >>> 0);
    S.hostN = 0; S.hostKnown = h.kind === 'mob'; S.hostFreed = false;
    return h;
  };

  HH.start = function (S) {
    var h = S.host; if (!h) return;
    var o = K.say(S, { kind: 'sys', tag: '主催者', text: nm(pk(S, T.intro[h.kind]), { h: h.name, a: S.h.name }), why: h.kind === 'res' ? '主催者：' + h.name + '（住人。穴にも壁の向こうにも入らない）' : '主催者：' + h.name + '（モブ）' });
    K.key(S, o, '主催者' + h.name + 'の遮断穴');
  };

  function discover(S, how) {
    var h = S.host, a = S.h;
    if (S.hostKnown || h.kind !== 'res') return null;
    S.hostKnown = true;
    var t = nm(pk(S, T.discover), { h: h.name, a: a.name }) + ' ' + nm(pk(S, T.react[a.persona] || T.react.gentle), { h: h.name, a: a.name });
    var love = HK.canLove && HK.canLove(a, h) && HK.canLove(h, a);
    if (h.near && love) t += nm(pk(S, T.reactLove), { h: h.name, a: a.name });
    else if (h.bad) t += nm(pk(S, T.reactBad), { h: h.name, a: a.name });
    var o = K.say(S, { kind: 'ev', tag: '主催者の正体', text: t, why: how || '主催者が知り合いだと気づいた' });
    K.key(S, o, '主催者が' + h.name + 'だと気づいた');
    return o;
  }

  /* 一時間ごと：品評、ときどき手を出す。st = { stored, live, hardTop }。戻り値 { stored, release } */
  HH.tick = function (S, st) {
    var h = S.host, a = S.h, r = S.hostR, out = { stored: st.stored, release: false };
    if (!h) return out;
    if ((S.hostN || 0) >= 3 || r() > 0.28) {
      if (r() < 0.3) K.say(S, { kind: 'ev', tag: '主催者', text: nm(pk(S, T.comment[h.persona] || T.comment.gentle), { h: h.name, a: a.name }), why: h.name + 'の品評（態度「' + (HK.PERSONA[h.persona] ? HK.PERSONA[h.persona].label : h.persona) + '」）' });
      return out;
    }
    var t = h.tr, opts = [], ng = !!(HK.ngPair && HK.ngPair(h, a));
    /* お気に入り（関係が近い・面倒見がいい）を、溜まりすぎる前に出す */
    var worry = st.stored > 160 || a.corrupt > 60 || (st.live && a.pleasure > 70);
    if (worry && h.kind === 'res' && (h.near || t.np > 0.6)) opts.push(['save', 0.5 + t.np * 0.8 + (h.near ? 0.6 : 0)]);
    if (worry && h.kind === 'mob' && a.corrupt > 85) opts.push(['save', 0.15]);
    if (!ng) opts.push(['boost', 0.4 + t.fc * 0.5 + t.cp * 0.3 + (h.kind === 'mob' ? 0.4 : 0) - (h.near ? 0.3 : 0)]);
    opts.push(['tease', 0.3 + t.fc * 0.4 + t.ac * 0.2]);
    var p = HK.weighted(r, opts, function (o) { return o[1]; });
    if (!p) return out;
    S.hostN++;
    if (h.kind === 'res' && !S.hostKnown && r() < (p[0] === 'boost' ? 0.2 : 0.45)) discover(S, '伝声管の声・覗き窓の目で気づいた');
    if (p[0] === 'save') {
      S.hostFreed = true; out.release = true;
      var o = K.say(S, { kind: 'sys', tag: '主催者の助け舟', text: nm(pk(S, T.save), { h: h.name, a: a.name }), why: h.name + 'が、予定より早く遮断を解いた（溜まった感覚 ' + Math.round(st.stored) + '・堕ち度 ' + Math.round(a.corrupt) + '）' });
      K.key(S, o, h.name + 'が早めに出した');
    } else if (p[0] === 'boost') {
      if (st.hardTop) K.say(S, { kind: 'ev', tag: '主催者の呼び込み', text: nm(pk(S, T.boost.top), { h: h.name, a: a.name }), why: st.guard ? '性行為の相手を固定した相手だけにしているので、呼び込んだ客は追い払われた' : '自分で攻めを選んでいるので、呼び込んだ客は追い払われた' });
      else if (st.live) {
        var rs = K.stim(S, 12 + S.env.wild / 10, { part: 'belly', defer: true });
        K.say(S, { kind: 'ev', tag: '主催者の呼び込み', text: nm(pk(S, T.boost.live), { h: h.name, a: a.name }), why: h.name + 'が客を呼び込んだ（感覚は戻っている）' });
        K.logClimax(S, rs.climaxes);
      } else {
        out.stored += (30 + S.env.wild * 0.4) * (a.sens || 1);
        K.say(S, { kind: 'ev', tag: '主催者の呼び込み', text: nm(pk(S, T.boost.pre), { h: h.name, a: a.name }), why: h.name + 'が客を呼び込み、遮断を深めた（溜まった感覚 ' + Math.round(out.stored) + '）' });
        a.corrupt += 1.5 * (S.k || 1);
      }
    } else {
      a.reason -= 3 + a.tr.ac * 4;
      K.say(S, { kind: 'ev', tag: '主催者の声', text: nm(pk(S, T.tease), { h: h.name, a: a.name }), why: h.name + 'がからかった（AC ' + Math.round(a.eg.AC) + '）' });
    }
    K.settle(S);
    return out;
  };

  /* 結末：主催者の一行（住人なら、帰り際に気づくこともある）。早めに出したときは題を直す */
  HH.end = function (S, E) {
    var h = S.host, a = S.h;
    if (!h || !E || !Array.isArray(E.lines)) return E;
    if (h.kind === 'res' && !S.hostKnown && (S.hostFreed || S.hostR() < 0.5)) discover(S, S.hostFreed ? '穴から出してくれた人の顔を見た' : '帰り際、帳場で顔を合わせた');
    if (S.hostFreed) {
      E.lines.push(nm(pk(S, T.end.freed), { h: h.name, a: a.name }));
      if (/^自力脱出/.test(E.title || '')) E.title = E.title.replace(/^自力脱出/, '途中で解放');
    }
    var k0 = h.kind === 'mob' ? 'mob' : S.hostKnown ? 'known' : 'hidden';
    E.lines.push(nm(pk(S, T.end[k0 + (E.kind === 'over' ? 'Fall' : '')] || T.end[k0]), { h: h.name, a: a.name }));
    return E;
  };
  HH.finish = function (S, res) {
    var h = S.host; if (!h || !res) return res;
    res.host = { name: h.name, kind: h.kind, i: h.i, known: !!S.hostKnown, freed: !!S.hostFreed };
    res.summary += '／主催者：' + h.name + (h.kind === 'mob' ? '（モブ）' : '');
    return res;
  };
})();
