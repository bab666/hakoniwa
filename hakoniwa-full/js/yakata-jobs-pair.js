/* 箱庭シミュレーター: 吹雪の館の殺人 ― 職業×職業の出来事（yakata-jobs.js の J.PAIR）
   弁護士×記者・医師×看護師・警察官×弁護士・教授×学生・経理×館の人・経理×マネージャー・神職×オカルト研究家・
   整備士×配信者・整備士×建築家・料理人×医師（看護師）・営業×芸能人（館の主）・俳優×作家・美容師×警察官・建築家×執事（館の主）
   二人の関係で、文と結果が変わる：
     恋人・許嫁（守る側が先に危ない所へ）／家族（親や兄姉が止める・きょうだいは言い合いながら）／親友・同僚（息が合う）／
     上司と部下・師弟・主従（命じる・教える）／敵対・不仲・ライバル（手柄を取り合う・情報を隠す・わざと間違った話を流す）／
     盲信・信仰・執着（相手の読みを鵜呑みにする）／恐怖（怖くて協力できない）／無関心（相手を相手にしない）／初対面（名刺交換から）
   二人のどちらかが犯人（共犯）なら、犯人は捜査をそらす。恋人・家族・盲信の相手は、気づいても証拠を隠してかばうことがある。
   守る側・命じる側は、関係の向きと気質で決める（性別・受け攻めでは決めない）
   台詞は「くだけた常体｜硬い常体｜敬語」の3本。{x}{y}=二人（職業の順） {u}{d}=関係の上と下（守る側と守られる側・崇める側と崇められる側…）
   {c}=犯人 {o}=犯人と組んだ人 {thing}=二人で調べるもの {place}=調べる場所 {p}=いちばん新しい現場 */
(function () {
  'use strict';
  var HK = window.HK, Y = HK && HK.YAKATA, J = Y && Y.JOBS;
  if (!J) return;
  function L(s) { return s.split('|'); }
  var ST = function () { return HK.Story; };
  function F(t, m) { return ST().fmt(t, m); }
  function pk(S, a) { return ST().pick(S, a); }
  function clamp(x, a, b) { return x < a ? a : x > b ? b : x; }
  function sk(p, k) { return Y.skill ? Y.skill(p, k) : 0.4; }
  function pct(x) { return Math.round(x * 100); }
  function sus(p, d) { if (p && p.m) p.m.sus = clamp(p.m.sus + d, 0, 100); }
  function fear(p, d) { if (p && p.m) p.m.fear = clamp(p.m.fear + d, 0, 100); }
  function rel(S, a, b, d, lab, dir) { if (Y.setRel) Y.setRel(S, a, b, d, lab, dir); }

  /* ---------- 組み合わせ ---------- */
  function P(o) { o.A = o.A.split(','); o.B = o.B.split(','); J.PAIR.push(o); }
  P({ id: 'jp_lawrep', A: 'lawyer', B: 'reporter', thing: '遺言状の写しと取材メモ', place: '書斎', type: 'talk', name: '弁護士×記者',
    open: L('{y}が手帳を開くと、{x}は黙って遺言状の写しを机に置いた。弁護士の知る遺言の中身と、記者の集めた噂とが、同じ机に並んだ。|{x}と{y}は、食堂の隅で、互いの持っている情報を値踏みし合った。'),
    close: L('{y}が身を乗り出した。「取引しよう。あなたの知ってる遺言の中身と、私のメモを交換する｜取引をしよう。あなたの知っている遺言の中身と、私のメモを交換する｜取引をしましょう。あなたの知っている遺言の中身と、私のメモを交換します」{x}は苦笑して、写しの一頁目をめくった。'),
    rival: L('{y}が書類をのぞき込もうとすると、{x}はその手を払いのけた。「守秘義務がある。あなたに話すことは何もない｜＝｜守秘義務があります。あなたに話すことは、何もありません」'),
    lead: L('{u}は、{d}に、遺言状と取材メモを突き合わせるよう言いつけた。「日付の合わないところだけ、拾って｜日付の合わないところだけ拾え｜日付の合わないところだけ、拾ってください」'),
    cul: L('{c}は、二人で並べた書類の中の、ある一行を指でなぞった。「これは、ただの噂だよ。気にしなくていい｜これはただの噂だ。気にしなくていい｜これは、ただの噂です。気にしなくて構いません」') });
  P({ id: 'jp_hospital', A: 'doctor', B: 'nurse', thing: '遺体', place: '現場', type: 'med', name: '医師×看護師',
    open: L('{x}が遺体の前に膝をつくと、{y}は何も言われないうちに、手袋と懐中電灯を差し出した。|{x}と{y}は、{p}で、遺体を挟んで向かい合った。'),
    close: L('{x}が言いかけた言葉を、{y}が先に続けた。「瞳孔、それから爪の色｜瞳孔、それから爪の色だ｜瞳孔、それから爪の色ですね」二人は、目を合わせて頷いた。阿吽の呼吸だった。'),
    rival: L('{x}の所見に、{y}が横から口を挟んだ。「その見立ては、違うと思う｜その見立ては違う｜その見立ては、違うと思います」'),
    lead: L('{u}は、{d}に短く指示を出した。「体温を測って。それから、死斑の位置を記録して｜体温を測れ。それから、死斑の位置を記録しろ｜体温を測ってください。それから、死斑の位置を記録してください」'),
    cul: L('{o}が遺体に手を伸ばす前に、{c}がその手首を押さえた。「そこは、もう私が診た。死因は見たとおりだよ｜そこはもう私が診た。死因は見たとおりだ｜そこは、もう私が診ました。死因は、見たとおりです」') });
  P({ id: 'jp_court', A: 'police', B: 'lawyer', thing: '昨夜の証言', place: '広間', type: 'talk', name: '警察官×弁護士',
    open: L('{x}が一人ずつ話を聞き始めると、{y}が当然のような顔で、その隣の椅子に座った。|{x}の取り調べに、{y}は弁護人のように同席した。'),
    close: L('{x}が問い、{y}が言葉の端を拾う。二人の取り調べは、打ち合わせ済みの芝居のようだった。{y}が言った。「今の答え、さっきと一語だけ違う｜今の答えは、さっきと一語だけ違う｜今の答え、さっきと一語だけ違います」'),
    rival: L('{x}が声を荒げるたびに、{y}が割って入った。「今の質問は誘導だ。答えなくていい｜＝｜今の質問は誘導です。答えなくて結構です」取り調べは、攻防のまま長引いた。'),
    lead: L('{u}は、{d}に取り調べの順番を言いつけた。「まず、いちばん落ち着いている人から｜まず、いちばん落ち着いている人間からだ｜まず、いちばん落ち着いている方からお願いします」'),
    cul: L('{c}は、取り調べの途中で、何度も「それは、さっきも聞いた」と話を切り上げさせた。') });
  P({ id: 'jp_school', A: 'prof', B: 'student', thing: '昨夜の仕掛け', place: '現場', type: 'lore', name: '教授×学生',
    open: L('{x}は、{y}に糸と重りを持ってこさせ、{p}で、昨夜の仕掛けを再現し始めた。|{x}と{y}は、ゼミの実験のように、仮説と検証を曇った窓ガラスに書き並べた。'),
    close: L('{y}が手を挙げた。「さっきの式、温度を入れ忘れてる｜さっきの式は、温度を入れ忘れている｜さっきの式、温度を入れ忘れています」{x}は、嬉しそうに眼鏡を押し上げた。'),
    rival: L('{y}が先に答えを口にすると、{x}は露骨に顔をしかめた。「結論を急ぐのは、素人のやることだ｜＝｜結論を急ぐのは、素人のやることです」'),
    lead: L('{u}は、{d}に、実験の手順を一つずつ確かめさせた。「仮説は一つずつ潰す。それが、いちばん早い道だよ｜仮説は一つずつ潰す。それが、いちばん早い道だ｜仮説は一つずつ潰します。それが、いちばん早い道です」'),
    cul: L('{c}は、再現の途中で、わざと重りを一つ取り違えた。「やっぱり、この仕掛けは無理だね｜やはり、この仕掛けは無理だ｜やっぱり、この仕掛けは無理ですね」') });
  P({ id: 'jp_ledger', A: 'accountant', B: 'host,heir,butler', thing: '館の古い帳簿', place: '書斎', type: 'lore', name: '経理×館の人',
    open: L('{x}は、{y}に頼んで、館の古い帳簿を書斎の机に積ませた。|{y}が金庫の鍵を開けると、{x}は、中の帳簿を一冊ずつ机に並べた。'),
    close: L('{y}が、帳簿の数字の一つを指さした。「この年に、館で何かあったはずだ｜＝｜この年に、館で何かあったはずです」{x}は頷き、その年の頁だけを抜き出した。'),
    rival: L('{y}は、帳簿を{x}の手から引ったくった。「館の金のことに、口を出さないで｜館の金のことに口を出すな｜館のお金のことに、口を出さないでください」'),
    lead: L('{u}は、{d}に、帳簿の数字を読み上げさせた。しばらくして、{u}が言った。「止めて。今の数字、もう一度｜止めろ。今の数字をもう一度だ｜止めてください。今の数字を、もう一度お願いします」'),
    cul: L('{c}は、帳簿の一冊を「関係のない年のものだ」と言って、棚に戻した。') });
  P({ id: 'jp_pay', A: 'accountant', B: 'manager', thing: '経費の明細', place: '食堂', type: 'lore', name: '経理×マネージャー',
    open: L('{y}が鞄から経費の明細の束を取り出すと、{x}の目の色が変わった。|{x}と{y}は、領収書の日付と、移動の記録とを突き合わせ始めた。'),
    close: L('{x}が言った。「この領収書、日付が一日ずれてる｜この領収書は、日付が一日ずれている｜この領収書、日付が一日ずれています」{y}は、手帳の予定表を広げて、すぐに裏を取った。'),
    rival: L('{y}は、明細を半分だけ渡して、残りを鞄にしまった。「担当の秘密まで、見せるつもりはない｜担当の秘密まで見せるつもりはない｜担当の秘密まで、お見せするつもりはありません」'),
    lead: L('{u}は、{d}に、領収書を日付順に並べるよう言いつけた。「金の流れを見れば、人の動きが分かる｜＝｜お金の流れを見れば、人の動きが分かります」'),
    cul: L('{c}は、明細の束から一枚だけ抜き取って、何食わぬ顔で残りを差し出した。') });
  P({ id: 'jp_rite', A: 'priest', B: 'occult', thing: '見立て', place: '現場', type: 'lore', name: '神職×オカルト研究家',
    open: L('{x}は、{p}に残された見立ての前で手を合わせた。{y}は、その横で古い伝承の本を開いた。|{x}と{y}は、館の礼拝室で、弔いの作法と、この土地の伝承とを照らし合わせた。'),
    close: L('{y}が本の一頁を指さした。「この並べ方、弔いの作法を逆さにしてる｜この並べ方は、弔いの作法を逆さにしている｜この並べ方、弔いの作法を逆さにしています」{x}は、静かに頷いた。'),
    rival: L('{x}は、{y}の説を、作法を知らない者の当て推量だと切り捨てた。「死者を、面白半分に語らないで｜死者を面白半分に語るな｜死者を、面白半分に語らないでください」'),
    lead: L('{u}は、{d}に、見立ての一つひとつを書き写させた。「ひとつも飛ばさないで。意味のないものは、ひとつもないから｜ひとつも飛ばすな。意味のないものは、ひとつもない｜ひとつも飛ばさないでください。意味のないものは、ひとつもありません」'),
    cul: L('{c}は、見立ての意味を、もっともらしく、少しだけ違う方へ解いてみせた。') });
  P({ id: 'jp_video', A: 'mechanic', B: 'streamer', thing: '配信の映像', place: '広間', type: 'search', name: '整備士×配信者',
    open: L('{y}のカメラは、昨夜の停電で記録が途切れていた。{x}は、工具を広げて、壊れかけたメモリーカードを取り出した。|{x}は、{y}のノートパソコンにケーブルをつなぎ、消えた映像の断片を拾い始めた。'),
    close: L('{y}が画面を指さした。「止めて。今の、廊下の端｜止めろ。今の、廊下の端だ｜止めてください。今の、廊下の端です」{x}は、一コマずつ映像を戻した。'),
    rival: L('{y}は、{x}の手からカメラを取り返した。「私の映像だ。勝手に触らないで｜私の映像だ。勝手に触るな｜私の映像です。勝手に触らないでください」'),
    lead: L('{u}は、{d}に、復元した映像を一秒ずつ見張らせた。「瞬きしないで。映るのは一瞬だから｜瞬きするな。映るのは一瞬だ｜瞬きしないでください。映るのは一瞬です」'),
    cul: L('{c}は、復元を手伝うふりをして、肝心の数秒を上書きした。') });
  P({ id: 'jp_machine', A: 'mechanic', B: 'architect', thing: '館の古い仕掛け', place: '館の奥の廊下', type: 'search', name: '整備士×建築家',
    open: L('{y}が図面の上で壁の厚さを測り、{x}が、その壁の中の歯車の音に耳を澄ませた。|{x}と{y}は、館の古い仕掛け扉の前で、図面と機械の両方から頭をひねった。'),
    close: L('{x}が言った。「この壁の中、ゼンマイが巻いてある｜この壁の中に、ゼンマイが巻いてある｜この壁の中、ゼンマイが巻いてあります」{y}はすぐに、図面の該当する線を指でたどった。'),
    rival: L('{x}と{y}は、仕掛けの止め方をめぐって言い争い、扉の前から一歩も動かなかった。'),
    lead: L('{u}は、{d}に、仕掛けの歯車を一つずつ外させた。「外した順に並べて。戻すときに要るから｜外した順に並べろ。戻すときに要る｜外した順に並べてください。戻すときに要ります」'),
    cul: L('{c}は、仕掛けの扉を開けたとたん、「何もない」と言って、すぐに閉めた。') });
  P({ id: 'jp_poison', A: 'chef', B: 'doctor,nurse', thing: '毒の正体', place: '厨房', type: 'med', name: '料理人×医師（看護師）',
    open: L('{x}は、昨夜の料理の味と匂いを一つずつ思い出し、{y}に伝えた。|{y}が遺体の所見を書き出すと、{x}は、その横に昨夜の献立を書き並べた。'),
    close: L('{x}が言った。「あのスープ、苦みが一つ多かった｜あのスープは、苦みが一つ多かった｜あのスープ、苦みが一つ多かったです」{y}は、すぐに手元の所見を見直した。'),
    rival: L('{y}は、{x}の話を最後まで聞かなかった。「料理の話は、あとにして｜料理の話はあとにしろ｜料理のお話は、あとにしてください」'),
    lead: L('{u}は、{d}に、昨夜の献立を時間順に書き出させた。「何を、いつ、誰が口にしたか。それが全部だよ｜何を、いつ、誰が口にしたか。それがすべてだ｜何を、いつ、誰が口にしたか。それがすべてです」'),
    cul: L('{c}は、毒の話になると、「あの皿は、誰でも触れた」とだけ言った。') });
  P({ id: 'jp_show', A: 'sales', B: 'celeb,host', thing: '一行の証言', place: '食堂', type: 'talk', name: '営業×大物',
    open: L('{x}は、{y}に名刺を差し出した。「お噂は、かねがね伺っています｜噂は、かねがね聞いている｜お噂は、かねがね伺っています」|{y}のまわりには、いつの間にか人が集まっていた。{x}は、その輪の真ん中に、さりげなく入っていった。'),
    close: L('{y}が人を集め、{x}が話を回した。食堂は、いつの間にか、昨夜の証言を聞き取る場になっていた。'),
    rival: L('{y}は、{x}の名刺を受け取りもせずに、背を向けた。'),
    lead: L('{u}は、{d}に、誰に何を聞くかを一人ずつ割り振った。「口の重い人は、私が引き受ける｜口の重い者は、私が引き受ける｜口の重い方は、私が引き受けます」'),
    cul: L('{c}は、皆の話を、笑い話へと上手にすり替えていった。') });
  P({ id: 'jp_play', A: 'actor', B: 'writer', thing: '再現劇の筋書き', place: '食堂', type: 'talk', name: '俳優×作家',
    open: L('{y}が、昨夜の出来事を一本の筋書きに書き起こし、{x}が、それを犯人の目線で演じてみせた。|{x}と{y}は、食堂で、即席の再現劇の稽古を始めた。'),
    close: L('{y}が筋書きの一行を書き直した。「ここで、犯人は振り返る。……演じてみて｜ここで、犯人は振り返る。……演じてみろ｜ここで、犯人は振り返ります。……演じてみてください」{x}が振り返った瞬間、一同の中の誰かが、息をのんだ。'),
    rival: L('{x}は、{y}の筋書きを読むなり突き返した。「こんな台詞、誰も言わない｜こんな台詞は誰も言わない｜こんな台詞、誰も言いません」'),
    lead: L('{u}は、{d}に、犯人の役を任せた。「台詞は要らない。歩き方だけでいい｜＝｜台詞は要りません。歩き方だけで結構です」'),
    cul: L('{c}は、再現劇の筋書きに、自分のいない場面を一つ紛れ込ませた。') });
  P({ id: 'jp_hair', A: 'stylist', B: 'police', thing: '現場の髪の毛', place: '現場', type: 'obs', name: '美容師×警察官',
    open: L('{x}は、{p}の絨毯から拾った髪を、白い紙の上に一本ずつ並べた。{y}が、その横で警察手帳を開いた。|{y}が現場の遺留品を集めると、{x}が、その中の髪の毛だけを選り分けた。'),
    close: L('{x}が言った。「この髪、染めてから三週間くらい経ってる｜この髪は、染めてから三週間ほど経っている｜この髪、染めてから三週間くらい経っています」{y}は、一行の顔を順に思い浮かべた。'),
    rival: L('{y}は、{x}の見立てを鼻で笑った。「髪の毛一本で犯人が分かるなら、苦労はしない｜＝｜髪の毛一本で犯人が分かるなら、苦労はしません」'),
    lead: L('{u}は、{d}に、一人ずつ髪を見せてもらうよう頼ませた。「嫌がる人がいたら、その人が怪しい｜嫌がる者がいたら、その人間が怪しい｜嫌がる方がいたら、その方が怪しいです」'),
    cul: L('{c}は、並べられた髪の中から一本を、袖でそっと払い落とした。') });
  P({ id: 'jp_plan', A: 'architect', B: 'butler,host', thing: '館の古い図面', place: '書庫', type: 'search', name: '建築家×館の人',
    open: L('{y}が書庫の奥から館の古い図面を出してくると、{x}は、それを廊下の床に広げた。|{x}は、{y}の案内で、館の端から端までを歩いた。'),
    close: L('{x}が図面の一点を叩いた。「ここに、図面にない階段がある｜＝｜ここに、図面にない階段があります」{y}は、驚いた顔で頷いた。'),
    rival: L('{y}は、{x}を書庫に入れようとしなかった。「館のことは、館の者がいちばん知っている｜＝｜館のことは、館の者がいちばん存じております」'),
    lead: L('{u}は、{d}に、図面と実際の部屋の数を数えさせた。「一つでも合わなかったら、そこが入口だ｜＝｜一つでも合わなかったら、そこが入口です」'),
    cul: L('{c}は、図面のある一角を、「そこは昔、物置だった」とだけ言って通り過ぎた。') });

  /* ---------- 関係ごとの文（どの組でも使う。{thing}{place} に組ごとの物が入る） ---------- */
  var R = {
    first: L('{x}と{y}は、この館で初めてまともに言葉を交わした。{y}が名刺を差し出した。「こういう者だ。あなたの仕事も、役に立つかもしれない｜こういう者だ。あなたの仕事も役に立つかもしれない｜こういう者です。あなたのお仕事も、役に立つかもしれません」|{x}と{y}は、ぎこちなく名刺を交換した。互いの肩書きを見て、二人は同時に{thing}のことを思いついた。'),
    love: L('{x}と{y}は、二人で{place}へ向かった。暗がりへ先に踏み込もうとした{d}の前に、{u}が黙って出た。「危ないところは、私が先に行く｜危ない所には、私が先に行く｜危ないところは、私が先に行きます」|{u}は、{d}の隣から離れないまま、片手で手帳をめくった。「離れないで。……二人でやれば早いから｜離れるな。……二人でやれば早い｜離れないでください。……二人でやれば早いです」'),
    parent: L('{u}は、一人で{place}へ行こうとする{d}の肩を掴んだ。「一人で行かせるわけにはいかない｜＝｜一人で行かせるわけにはいきません」{d}は振り払おうとして、結局、{u}と並んで歩き出した。|{d}が「自分でやれる」と言い張るのを、{u}は聞き流した。「いいから、隣にいて｜いいから、隣にいろ｜いいから、隣にいてください」二人は、黙って{thing}を調べ始めた。'),
    sib: L('{x}と{y}は、子どもの頃と同じように、言い合いながら、{thing}を手分けして調べた。{y}が言った。「そっちは任せた｜＝｜そちらはお任せします」'),
    blind: L('{u}は、{d}の読み解きを、ひとことも疑わずに書き留めた。「あなたがそう言うなら、そうなんだ｜あなたがそう言うなら、そうなのだろう｜あなたがそうおっしゃるなら、そうなのでしょう」'),
    fear: L('{u}は、{d}と二人きりになった途端、口がきけなくなった。書きつけを差し出す手が、小さく震えていた。|{u}は、{d}の顔を見ないようにして、調べかけの書きつけを机の端に置いた。それ以上、近づこうとはしなかった。'),
    cold: L('{d}が話しかけても、{u}は顔を上げなかった。調べかけの書きつけは、{u}の手元に置かれたままだった。{d}は、仕方なく一人で調べ始めた。')
  };
  var FAIL = L('だが、二人がかりでも、決め手になるものは見つからなかった。|日が傾くまで粘ったが、新しいことは何も出てこなかった。');
  var COVER = {
    love: L('――{o}は、調べるうちに、{c}を指すものが一つ混じっているのに気づいた。{o}は、{c}の横顔を見た。それから黙ってそれを抜き取り、暖炉の火にくべた。'),
    family: L('――{o}は、調べるうちに、{c}の筆跡の走り書きを見つけた。子どもの頃から見てきた字だった。{o}は、それを黙って懐にしまった。'),
    blind: L('――{o}は、{c}を指す一行を見つけて、すぐに目を逸らした。{c}が、そんなことをするはずがない。{o}は、その紙を裏返して、束の底に戻した。')
  };
  var EXPOSE = L('――{o}は、{c}が一度だけ話を逸らしたのを、聞き逃さなかった。|――{o}は、{c}の指先が、ほんのわずかに震えたのを見ていた。');
  var STEER = L('{o}は、その言葉を疑わなかった。|{o}は頷き、調べる手を止めた。');

  /* ---------- 二人の関係を読む ---------- */
  var LOVE = /^(lover|mate|fated|spouse|fiance|almost)$/, FAM = /^(sibling|sibprot|sibclose|twin|parent|pparent|stepsib|relative)$/, ELDER = /^(parent|pparent|sibprot)$/,
    LEAD = /^(boss|master|mentor|teacher|senpai)$/, BAD = /^(enemy|bad|rival|ex|sibbad)$/, BLIND = /^(blind|worship|yan|fond)$/, CLOSE = /^(best|buddy|childhood|friend|classmate|colleague|comrade|benefactor)$/;
  var KN = { first: '初対面', close: '親しい', love: '恋人・許嫁', family: '家族', lead: '上下の関係', rival: '敵対・張り合う', blind: '盲信・執着', fear: '恐怖', cold: '無関心' };
  function relOf(S, x, y) {
    var ts = J.ties(S, x, y), PP = S.P;
    function find(re) { return ts.filter(function (t) { return re.test(t.type); })[0]; }
    function dir(t) { var u = PP[t.a] === x ? x : y; return { u: u, d: u === x ? y : x }; }
    var t;
    if ((t = find(/^fear$/))) return mk('fear', dir(t));
    if ((t = find(/^apathy$/))) return mk('cold', dir(t));
    if ((t = find(BLIND))) return mk('blind', dir(t));
    if ((t = find(LOVE))) return mk('love', guard(x, y));
    if ((t = find(FAM))) return ELDER.test(t.type) ? mk('family', dir(t), 'parent') : mk('family', guard(x, y), 'sib');
    if ((t = find(LEAD))) return mk('lead', dir(t));
    if ((t = find(BAD))) return mk('rival', { u: x, d: y });
    if (find(CLOSE)) return mk('close', { u: x, d: y });
    var w = Y.bond ? Y.bond(S, x, y) : 0;
    if (w <= -0.2) return mk('rival', { u: x, d: y });
    if (w >= 0.3) return mk('close', { u: x, d: y });
    return mk('first', { u: x, d: y });
    function mk(k, ud, sub) { return { k: k, u: ud.u, d: ud.d, sub: sub || '' }; }
  }
  /* 守る側：腕っぷしと面倒見（NP）の強い方（性別・受け攻めでは決めない） */
  function guard(x, y) { var g = function (p) { return sk(p, 'fight') + p.tr.np * 0.3 + ((p.stats && p.stats.nerve) || 3) * 0.03; }; return g(x) >= g(y) ? { u: x, d: y } : { u: y, d: x }; }
  J.relOf = relOf;

  /* ---------- 出来事 ---------- */
  function run(S, pr, x, y) {
    var rng = S.rng, r = relOf(S, x, y), k = S.kills[S.kills.length - 1];
    var m = { x: x.name, y: y.name, u: r.u.name, d: r.d.name, thing: pr.thing, place: pr.place, p: k ? k.trick.place : '広間' };
    var lab = (Y.relLabel && Y.relLabel(S, x, y)) || KN[r.k];
    var head = (r.k === 'first' ? F(pk(S, R.first), m) : '') + F(pk(S, pr.open), m);
    var why0 = pr.name + '（' + x.name + '×' + y.name + '）・関係：' + lab + '（' + KN[r.k] + '）';
    var c = J.guilty(S, x) ? x : J.guilty(S, y) ? y : null;
    /* 犯人（共犯）と組んだとき */
    if (c) {
      var o = c === x ? y : x, ro = relOf(S, o, c), mc = { c: c.name, o: o.name, thing: pr.thing, place: pr.place, p: m.p };
      var t0 = head + F(pk(S, pr.cul), mc), who = c === S.cul ? c.name + 'が犯人' : c.name + 'は共犯';
      var cov = ro.k === 'love' ? 'love' : ro.k === 'family' ? 'family' : ro.k === 'blind' && ro.u === o ? 'blind' : '';
      if (cov && rng() < 0.45 && J.loseOne(S, pr.type)) {
        o.knew = true;
        return J.say(S, pr.id, { actors: [o, c], tag: pr.name, kind: 'climax', text: t0 + F(pk(S, COVER[cov]), mc), why: why0 + '。' + o.name + 'は、' + c.name + 'が犯人側だと気づいて、かばった（手がかりが一つ失われた。' + who + '）', mag: 30 });
      }
      var see = 0.2 + sk(o, 'obs') * 0.4 - J.lie(S, c) + (ro.k === 'rival' ? 0.15 : ro.k === 'blind' && ro.u === o ? -0.2 : ro.k === 'love' || ro.k === 'family' ? -0.1 : 0);
      if (rng() < see) {
        sus(c, 12);
        return J.say(S, pr.id, { actors: [o, c], tag: pr.name, text: t0 + F(pk(S, EXPOSE), mc), why: why0 + '。' + c.name + 'は捜査をそらそうとしたが、' + o.name + 'が見抜いた（観察 ' + pct(sk(o, 'obs')) + ' 対 ' + J.lieWhy(S, c) + '。' + who + '・疑い +12）' });
      }
      var inn = J.innocent(S, c, function (q) { return q !== o; }), mis = inn.length && rng() < 0.5 ? rng.pick(inn) : null;
      if (mis) J.misread(S, mis);
      return J.say(S, pr.id, { actors: mis ? [o, c, mis] : [o, c], tag: pr.name, text: t0 + F(pk(S, STEER), mc), why: why0 + '。' + c.name + 'が、二人の捜査をそらした（' + J.lieWhy(S, c) + '。' + who + '）' + (mis ? '。推理が' + mis.name + 'の方へずれていく（偽の手がかり）' : '') });
    }
    /* 二人とも無実 */
    var base = 0.25 + (sk(x, pr.type) + sk(y, pr.type)) * 0.3, t = head, why = why0, finder = x, g = '';
    if (r.k === 'fear') {
      fear(r.u, 6);
      return J.say(S, pr.id, { actors: [r.u, r.d], tag: pr.name, text: t + F(pk(S, R.fear), m), why: why + '。' + r.u.name + 'は' + r.d.name + 'が怖くて、二人で調べることができなかった（' + r.u.name + 'の恐怖 +6）' });
    }
    if (r.k === 'cold') { t += F(pk(S, R.cold), m); base *= 0.7; finder = r.d; why += '。' + r.u.name + 'は' + r.d.name + 'を相手にしなかった。' + r.d.name + 'は一人で調べた'; }
    else if (r.k === 'rival') {
      var w = sk(x, pr.type) >= sk(y, pr.type) ? x : y, l = w === x ? y : x, mr = { w: w.name, l: l.name, place: pr.place, thing: pr.thing }, q = rng();
      t += F(pk(S, pr.rival), m);
      if (q < 0.4) {
        g = J.clue(S, w, pr.type); rel(S, w, l, -0.1, '張り合う');
        return J.say(S, pr.id, { actors: [w, l], tag: pr.name, text: t + F('――手がかりに先にたどり着いたのは、{w}だった。', mr) + (g ? '――' + g + '。' : ''), why: why + '。二人は手柄を取り合った（' + w.name + 'が先んじた）' });
      }
      if (q < 0.7) {
        rel(S, w, l, -0.1, '張り合う');
        return J.say(S, pr.id, { actors: [w, l], tag: pr.name, text: t + F('{w}は、見つけたものを{l}には見せず、黙ってポケットにしまった。', mr), why: why + '。' + w.name + 'は、つかんだ情報を' + l.name + 'に隠した（手がかりは皆に伝わらなかった）' });
      }
      rel(S, w, l, -0.15, '険悪', w); J.misread(S, l);
      return J.say(S, pr.id, { actors: [w, l], tag: pr.name, text: t + F('その夜、{w}は皆の前で、{l}が昨夜{place}の近くにいたと、それとなく口にした。', mr), why: why + '。' + w.name + 'は、張り合う' + l.name + 'について、わざと間違った話を流した（偽の手がかり：' + l.name + 'への疑い +10）' });
    }
    else if (r.k === 'blind') {
      t += F(pk(S, R.blind), m); finder = r.d;
      if (rng() > base + 0.05) {
        var inn2 = J.innocent(S, r.u, function (q) { return q !== r.d; }), mb = inn2.length ? rng.pick(inn2) : null;
        if (mb) { J.misread(S, mb); m.b = mb.name; }
        return J.say(S, pr.id, { actors: mb ? [r.u, r.d, mb] : [r.u, r.d], tag: pr.name, text: t + (mb ? F('{d}の読みは、{b}の方を指していた。{u}は、それを鵜呑みにした。', m) : F(pk(S, FAIL), m)), why: why + '。' + r.u.name + 'は、' + r.d.name + 'の言うことを確かめずに信じた' + (mb ? '（偽の手がかり：' + mb.name + 'への疑い +10）' : '') });
      }
      why += '。' + r.u.name + 'は' + r.d.name + 'の読みを信じた（今回は当たっていた）';
    }
    else if (r.k === 'love') { t += F(pk(S, R.love), m); base += 0.1; fear(x, -6); fear(y, -6); finder = r.u; why += '。' + r.u.name + 'は' + r.d.name + 'を守るように寄り添って調べた（二人の恐怖 -6）'; }
    else if (r.k === 'family') { t += F(pk(S, r.sub === 'parent' ? R.parent : R.sib), m); base += 0.1; finder = r.d; why += r.sub === 'parent' ? '。' + r.u.name + 'は、' + r.d.name + 'を一人で危ない所へ行かせなかった' : '。' + (HK.Sib ? HK.Sib.pairWord(r.u, r.d, S) : 'きょうだい') + 'で、言い合いながら手分けした'; }
    else if (r.k === 'lead') { t += F(pk(S, pr.lead), m); base += 0.1; finder = r.d; why += '。' + r.u.name + 'が指示を出し、' + r.d.name + 'が動いた'; }
    else if (r.k === 'close') { t += F(pk(S, pr.close), m); base += 0.15; why += '。息が合った'; }
    else { base += 0.05; why += '。名刺交換から始まった'; }
    if (rng() < base) g = J.clue(S, finder, pr.type);
    if (g) {
      if (r.k === 'first' || r.k === 'close') rel(S, x, y, 0.1, '協力');
      return J.say(S, pr.id, { actors: [x, y], tag: pr.name, text: t + '――' + g + '。', why: why + '（二人の技能 ' + pct(sk(x, pr.type)) + '・' + pct(sk(y, pr.type)) + '）' });
    }
    return J.say(S, pr.id, { actors: [x, y], tag: pr.name, text: t + pk(S, FAIL), why: why + '。手がかりは見つからなかった' });
  }

  /* yakata-jobs.js の J.tick から：今いる二人で出せる組の一覧 */
  J.pairOpts = function (S, j) {
    var out = [], live = S.P.filter(J.free);
    J.PAIR.forEach(function (pr) {
      if (j.used[pr.id]) return;
      var cand = [];
      live.forEach(function (x) {
        if (pr.A.indexOf(x.role) < 0) return;
        live.forEach(function (y) {
          if (y === x || pr.B.indexOf(y.role) < 0) return;
          if (J.guilty(S, x) && J.guilty(S, y)) return;
          cand.push([x, y]);
        });
      });
      if (!cand.length) return;
      out.push({ w: 1.3, id: pr.id, go: function () { var c = S.rng.pick(cand); return !!run(S, pr, c[0], c[1]); } });
    });
    return out;
  };
})();
