/* 箱庭シミュレーター: ゾンビの街 ― はぐれた大切な人を探す（目標「〇〇を探す」）
   ・別のエリアにいる（まだ会えていない・はぐれた）相手との関係が深いほど、目標が「〇〇を探す」に変わりやすい。
     深さは grief-kit.js の HK.Grief.depth（関係の種類＋好意・信頼・惹かれ）。執着（ヤンデレ）・執着（信仰）の側は特に強く、危険を顧みない
   ・噂を聞き回って居場所の見当をつけ（情報の錯綜が高いほど外れやすい）、群れを離れても、夜でもそこへ向かう（zombie-core.js の destOf・moveAll）
   ・見つからないあいだは焦りが募る。見つけたら「大切な人を守る」に変わる（初めての合流なら zombie-reunion.js の再会の場面に重ねる）
   ・相手が死ぬか街を出たら、元の目標に戻る
   ・執着の目標「〇〇と会う」（obsess-install.js）が付いている人は、そちらに任せる */
(function () {
  'use strict';
  var HK = window.HK, Z = HK.ZB;
  if (!Z || !Z.scen) return;
  var scen = Z.scen, EV = scen.events;
  function L(s) { return s.split('|'); }
  function fill(t, m) { return String(t).replace(/\{(\w+)\}/g, function (x, k) { return m[k] != null ? m[k] : x; }); }
  function free(a) { return a && a.alive && !a.out && a.z && !a.z.alone && !a.z.vanished && a.z.cult == null && !a.z.bitten && !(a.flags && a.flags.caged != null); }
  function present(o) { return o && o.alive && !o.out && o.z; }

  /* ---------- a から見た o との関係（探し方・文の分け方） ---------- */
  function kind(ctx, a, o) {
    var T = HK.Ties;
    if (!T) return 'care';
    if (T.from(ctx, a, o, 'worship')) return 'worship';
    if (T.from(ctx, a, o, 'yan')) return 'yan';
    var all = T.all(ctx, a, o);
    function has(t) { return all.some(function (x) { return x.type === t; }); }
    if (has('lover') || has('mate') || has('fated') || ctx.pair(a, o).couple) return 'lover';
    /* きょうだい（庇護）は親子に似た関係（like: parent）だが、文は「親」「我が子」でなく、きょうだいのもの（呼び名は姉・弟など。kn） */
    if (has('sibprot')) return 'sib';
    if (T.from(ctx, a, o, 'parent') || T.from(ctx, a, o, 'pparent')) return 'parent';
    if (T.from(ctx, o, a, 'parent') || T.from(ctx, o, a, 'pparent')) return 'child';
    if (has('sibling') || has('sibprot') || has('sibclose') || has('sibbad')) return 'sib';
    if (has('relative')) return 'relative';
    if (T.from(ctx, a, o, 'benefactor')) return 'beneA';
    if (T.from(ctx, o, a, 'benefactor')) return 'beneB';
    if (T.from(ctx, a, o, 'boss')) return 'bossA';
    if (T.from(ctx, o, a, 'boss')) return 'bossB';
    if (T.from(ctx, o, a, 'worship')) return 'worshipped';
    if (T.from(ctx, a, o, 'crush') || has('almost')) return 'crush';
    if (has('best') || has('childhood') || has('buddy')) return 'best';
    if (has('classmate')) return 'classmate';
    if (has('colleague') || has('senpai')) return 'colleague';
    return 'care';
  }
  var GROUP = { lover: 'love', crush: 'love', parent: 'fam', child: 'fam', sib: 'fam', relative: 'fam', beneA: 'bene', beneB: 'bene', bossA: 'boss', bossB: 'boss', worship: 'worship', yan: 'yan', worshipped: 'friend', best: 'friend', classmate: 'friend', colleague: 'friend', care: 'friend' };
  var KNAME = { lover: '恋人', crush: '想いを寄せる相手', parent: '我が子', child: '親', sib: 'きょうだい', relative: '親族', beneA: 'かつて助けた相手', beneB: '恩人', bossA: '部下', bossB: '上司', worship: '信仰する相手', yan: '執着する相手', worshipped: '自分を慕う相手', best: '親友', classmate: '同級生', colleague: '同僚', care: '大切な相手' };
  /* 関係の呼び名。きょうだいは二人の性別・年齢で「姉」「弟」など（sib-word.js）。a から見た T */
  function kn(ctx, k, a, T) { return k === 'sib' && HK.Sib ? HK.Sib.word(a, T, 'plain', ctx) : KNAME[k]; }
  /* 執着・信仰する側：危険を顧みず探しに行く */
  function bold(k) { return k === 'worship' || k === 'yan'; }
  /* 関係の深さ（grief-kit の深さ。読み込まれていなければ好意から） */
  function depth(ctx, a, o) {
    if (HK.Grief && HK.Grief.depth) return HK.Grief.depth(ctx, a, o).d;
    var r = ctx.R(a, o);
    return Math.max(0, r.aff) * 0.8 + Math.max(0, r.trust) * 0.3;
  }
  Z.seekKind = kind;
  Z.seekDepth = depth;

  /* ---------- 文 ---------- */
  var GO = {
    lover: L('{a}は、{b}がいないまま夜を越すことに耐えられなかった。{a}「{b}を探しに行く。止めても無駄だ｜＝｜{b}を探しに行きます。止めても無駄です」|{a}は{b}と最後に交わした言葉を思い出していた。あれが最後になるなんて、認めない。{a}は黙って荷物をまとめた。|{a}は、{b}の笑った顔ばかり思い出していた。{a}「{b}は生きてる。迎えに行く｜{b}は生きている。迎えに行く｜{b}は生きています。迎えに行きます」'),
    parent: L('{a}は{b}の名前を何度もつぶやいた。我が子がこの街のどこかにいる。それだけで、じっとしてはいられなかった。|{a}「{b}を探す。親が探さないで、誰が探すんだ｜{b}を探す。親が探さずに、誰が探すというのだ｜{b}を探します。親が探さないで、誰が探すんですか」――{a}の声は、少しも震えていなかった。'),
    child: L('{a}は、{b}がまだどこかで自分を待っている気がしてならなかった。{a}「親を探しに行く。……一人でも｜＝｜……一人でも、親を探しに行きます」|{a}は{b}の顔を思い浮かべて、唇を噛んだ。今度は、自分が迎えに行く番だった。'),
    sib: L('{a}は{b}のことを考えていた。{sib:a→b}なら、きっとどこかで踏ん張っている。{a}「{b}を探しに行く｜＝｜{b}を探しに行きます」|{a}「{b}のことだ、どうせ無茶をしてる。迎えに行ってやらないと｜{b}のことだ、どうせ無茶をしている。迎えに行ってやらねばならない｜{b}のことですから、どうせ無茶をしています。迎えに行かないといけません」――{a}は笑ってみせたが、目は笑っていなかった。'),
    relative: L('{a}は、{b}のことが頭から離れなかった。同じ家に住んでいなくても、親族は親族だ。{a}「{b}を探す。放ってはおけない｜＝｜{b}を探します。放ってはおけません」|{a}は、親戚の集まりで{b}と並んで座った日のことを思い出した。あの顔を、もう一度見たかった。'),
    beneA: L('{a}は、かつて手を差し伸べた{b}のことを思った。あのとき助けた命を、こんなところで終わらせたくない。{a}「{b}を探しに行く｜＝｜{b}を探しに行きます」|{a}「{b}は一人で抱え込む性分だ。誰かが行ってやらないと｜{b}は一人で抱え込む性分だ。誰かが行ってやらねばならない｜{b}は一人で抱え込む性分です。誰かが行ってあげないといけません」――{a}は立ち上がった。'),
    beneB: L('{a}は、{b}に救われた日のことを思い出していた。今度は自分が恩を返す番だ。{a}「{b}を探す。この命は、{b}にもらったものだから｜{b}を探す。この命は、{b}にもらったものだ｜{b}を探します。この命は、{b}にもらったものですから」|{a}「{b}がいなければ、私はとっくにいなかった｜＝｜{b}がいなければ、私はとっくにいませんでした」――{a}は迷わず、外へ出る支度を始めた。'),
    bossA: L('{a}は、散り散りになった部下のことを考えていた。{a}「{b}を探す。部下を置いて、上の人間だけ逃げるわけにはいかない｜＝｜{b}を探します。部下を置いて、上の人間だけ逃げるわけにはいきません」|{a}は{b}の仕事ぶりを思い出した。几帳面で、無理をする部下だった。{a}は黙って装備を確かめた。'),
    bossB: L('{a}は、{b}の指示がない心細さに気づいた。いつも先頭にいた背中が、今はどこにもない。{a}「{b}を探しに行く｜＝｜{b}を探しに行きます」|{a}「{b}は、きっと誰かをかばって無茶をしてる｜{b}は、きっと誰かをかばって無茶をしている｜{b}は、きっと誰かをかばって無茶をしています」――{a}は、上司の性分をよく知っていた。'),
    worship: L('{a}にとって、{b}のいない世界には何の意味もなかった。{a}「{b}を探す。{b}のためなら、この身がどうなってもいい｜＝｜{b}を探します。{b}のためなら、この身がどうなっても構いません」|{a}は祈るように手を組み、{b}の名前を唱えた。それから、群れのうろつく通りへ迷わず踏み出した。|{a}「{b}が生きている限り、私も生きる。だから、探す｜＝｜{b}が生きている限り、私も生きます。だから、探します」――{a}の目には、もう{b}しか映っていなかった。'),
    worshipped: L('{a}は、いつもそばにいた{b}の姿がないことに、思いのほか動揺していた。{a}「……{b}を探しに行く｜＝｜……{b}を探しに行きます」|{a}は、{b}がいつも自分の後ろを歩いていたことを思い出した。振り返っても、そこには誰もいなかった。'),
    yan: L('{a}は、{b}が自分の目の届かないところにいることが、何より耐えられなかった。{a}「{b}を見つける。誰より先に｜＝｜誰より先に、{b}を見つけます」|{a}は爪を噛みながら、地図の上の{b}がいそうな場所に印をつけた。印は、街じゅうに増えていった。'),
    crush: L('{a}は、{b}に想いを伝えないまま離ればなれになったことを悔やんでいた。{a}「{b}を探す。言いたいことが、まだ残ってる｜{b}を探す。言いたいことが、まだ残っている｜{b}を探します。言いたいことが、まだ残っています」|{a}は{b}の声を思い出して、胸を押さえた。会えないまま終わるのは、嫌だった。'),
    best: L('{a}には、{b}がどこで踏ん張っているか、手に取るように分かる気がした。{a}「{b}を迎えに行く。一人にはさせない｜＝｜{b}を迎えに行きます。一人にはさせません」|{a}「{b}が死ぬわけがない。……だから、探しに行く｜＝｜{b}が死ぬわけがありません。……だから、探しに行きます」'),
    classmate: L('{a}は、学生のころ同じクラスだった{b}の顔を思い出した。あの頃の仲間で、生きていると信じられるのは{b}だけだった。{a}「{b}を探す｜＝｜{b}を探します」|{a}は、教室の窓際で{b}と話した放課後を思い出していた。{a}「{b}を見つけて、あの頃の話をしたい｜＝｜{b}を見つけて、あの頃の話をしたいです」'),
    colleague: L('{a}は、同じ職場の{b}のことを考えていた。{a}「{b}を探す。仕事仲間を見捨てるのは、性に合わない｜＝｜{b}を探します。仕事仲間を見捨てるのは、性に合いません」|{a}は、職場で毎朝顔を合わせていた{b}を思い出した。あの挨拶が、急に恋しくなった。'),
    care: L('{a}は、{b}のことが気がかりでならなかった。{a}「{b}を探しに行く｜＝｜{b}を探しに行きます」|{a}は、別れ際の{b}の顔を思い出していた。あのまま、終わりにしたくなかった。')
  };
  var ASK = {
    base: L('{a}は出会う生存者ごとに、{b}の背格好を伝えて回った。|{a}は避難所の掲示板に貼られた尋ね人の紙を、端から一枚ずつ確かめた。|{a}は壁に「{b}へ。{area}にいる｜＝｜{b}へ。{area}にいます」と書き残し、自分の名前を添えた。|{a}は崩れた交番の無線機で、{b}の名前を何度も呼びかけた。'),
    worship: L('{a}はゾンビのうろつく大通りの真ん中で、{b}の名前を叫んだ。呻き声が近づいてきても、{a}は呼ぶのをやめなかった。|{a}は群れの切れ目を突っ切って、向こう側にいた生存者に{b}のことを訊きに行った。|{a}は崩れかけた建物に一人で入り、部屋という部屋をのぞいて回った。{b}がそこにいるかもしれない、それだけの理由だった。'),
    yan: L('{a}は{b}の足跡らしきものを、地面に這いつくばって追った。|{a}は{b}を見かけたという生存者の肩を掴み、何度も同じことを訊き直した。|{a}は{b}が通りそうな道に、一人で夜通し立っていた。')
  };
  var HEARD = L('{p}で{b}を見た、という話が聞けた。{a}の顔に、ようやく血の気が戻った。|{p}の方で、{b}によく似た人を見たという噂が耳に入った。{a}はすぐに地図を広げた。');
  var NOHEAR = L('{b}を見た人はいなかった。{a}は「生きてる｜生きている｜生きています」と、自分に言い聞かせた。|手がかりは何もなかった。{a}は人のいない通りを、長いあいだ見つめていた。');
  var RISK = L('――叫び声に引き寄せられたゾンビが、{a}に掴みかかった。振りほどいたとき、腕にはっきりと歯形が残っていた。|――物陰から伸びてきた手が、{a}の足首を掴んだ。{a}が気づいたときには、ふくらはぎを咬まれていた。');
  var HURT = L('――飛び出してきたゾンビを振り払うとき、{a}は腕を深く切った。それでも、{a}は止まらなかった。|――{a}は群れに追われて転び、膝をひどく擦りむいた。痛みより、{b}の手がかりのほうが大事だった。');
  var FRET = {
    love: L('{a}は眠れなかった。{b}が今どこで、どんな目に遭っているのか。考えるたびに胸が潰れそうだった。|{a}は{b}の写真を何度も見返した。画面が暗くなるたび、また明かりをつけた。電池が減っていくのも構わなかった。|{a}「{b}、どこにいるの｜{b}、どこにいる｜{b}、どこにいるんですか」――つぶやいた声は、夜の呻き声にかき消された。'),
    fam: L('{a}は{b}の好物の缶詰を見つけて、鞄にしまった。会えたら渡す。そう決めておかないと、立っていられなかった。|{a}「どこにいるんだ、{b}｜＝｜{b}、どこにいるんですか」――つぶやいた声は、夜の呻き声にかき消された。|{a}は、{b}がまだ小さかったころの顔ばかり思い出していた。いまの{b}がどこにいるのか、誰も知らなかった。'),
    bene: L('{a}は、{b}に何ひとつ返せていないことばかり考えていた。このまま会えなかったら――その先は、考えたくなかった。|{a}は{b}にもらった言葉を、口の中で何度も繰り返した。そうしていないと、焦りで叫び出しそうだった。'),
    boss: L('{a}は時計を見た。{b}と最後に言葉を交わしてから、もうずいぶん経つ。{a}「……遅い｜＝｜……遅いです」|{a}は{b}ならどう動くかを考えた。考えるほど、{b}が危ない場所にいる気がしてならなかった。'),
    worship: L('{a}は{b}の名前を唱え続けていた。食べることも眠ることも、もうどうでもよかった。{a}「{b}のいない朝なんて、来なくていい｜{b}のいない朝など、来なくていい｜{b}のいない朝なんて、来なくていいです」|{a}は自分の腕に爪を立てて、痛みで焦りをごまかした。{b}が見つかるまで、休むことは許されない気がした。|{a}は夜の街へ出ようとして、扉の前で止められた。{a}「{b}が待ってる。行かせて｜{b}が待っている。行かせろ｜{b}が待っています。行かせてください」――{a}は本気で、止めた手を振りほどこうとした。'),
    yan: L('{a}は、{b}が自分以外の誰かと一緒にいるかもしれないと考えて、壁を殴った。拳から血がにじんでも、{a}は気づかなかった。|{a}は{b}の名前を、手帳の端から端まで書き連ねていた。|{a}「{b}は私のことを待ってる。待ってるに決まってる｜{b}は私のことを待っている。待っているに決まっている｜{b}は私のことを待っています。待っているに決まっています」――{a}は誰に言うでもなく、同じ言葉を繰り返した。'),
    friend: L('{a}は{b}のことを考えて、何度も通りの向こうに目をやった。|{a}「{b}なら、きっと大丈夫だ｜＝｜{b}なら、きっと大丈夫です」――そう言いながら、{a}の足はそわそわと落ち着かなかった。')
  };
  var FOUND = {
    love: L('{a}はついに{b}を見つけた。走り寄って抱きしめると、{b}の体温が確かにそこにあった。{a}「探した。……もう離れない｜＝｜探しました。……もう離れません」|{a}は{area}で{b}の背中を見つけて、名前を叫んだ。振り向いた{b}の顔を見た瞬間、{a}の膝から力が抜けた。'),
    fam: L('{a}は{area}で{b}の姿を見つけて、その場に崩れ落ちそうになった。{a}「よかった……本当に、よかった｜＝｜よかった……本当に、よかったです」――{a}は{b}の手を握って離さなかった。|{a}は{area}で{b}を見つけるなり、全身に傷がないか確かめた。{a}「探したんだよ。……無事でよかった｜探したんだぞ。……無事でよかった｜探したんですよ。……無事でよかったです」'),
    bene: L('{a}は{area}で{b}を見つけた。{a}「やっと会えた。今度は、私が力になる番だ｜＝｜やっと会えました。今度は、私が力になる番です」|{a}は{area}で{b}の無事な姿を見て、深く頭を下げた。顔を上げたとき、{a}の目は赤くなっていた。'),
    boss: L('{a}は{area}で{b}と合流した。{a}「無事？｜無事か｜ご無事ですか」――短い言葉に、探し回った時間の重さがこもっていた。|{a}は{area}で{b}を見つけて、大きく息を吐いた。{a}「よかった。……本当に、よかった｜＝｜よかった。……本当に、よかったです」'),
    worship: L('{a}は{area}で{b}を見つけた瞬間、膝をついた。{a}「{b}……生きていてくれた｜＝｜{b}……生きていてくれたんですね」――{a}は{b}の足元で、子どものように泣いた。|{a}は{b}の姿を見つけて、震える手を伸ばした。触れていいのか分からず、指先は{b}の袖の手前で止まった。{a}「探したよ。ずっと｜探した。ずっと｜ずっと、探していました」'),
    yan: L('{a}は{area}で{b}を見つけると、腕を掴んで引き寄せた。{a}「どこに行ってたの。……もう、目を離さない｜どこに行っていた。……もう、目を離さない｜どこに行っていたんですか。……もう、目を離しません」|{a}は{b}の顔を両手で挟んで、何度も確かめた。{a}「本物だ。{b}だ。……もう、どこにも行かせない｜＝｜本物です。{b}です。……もう、どこにも行かせません」'),
    friend: L('{a}は{area}で{b}を見つけて、大きく手を振った。{a}「やっと見つけた！｜＝｜やっと見つけました！」|{a}は{area}で{b}の肩を叩いた。{a}「探したよ。生きててよかった｜探したぞ。生きていてよかった｜探しましたよ。生きていてよかったです」')
  };
  /* 信仰される側の返し（相手の気持ちで変わる） */
  var WB_RE = {
    '': L('{b}は、自分を探し回っていたという{a}の話に、目を丸くした。'),
    accept: L('{b}は{a}の頭にそっと手を置いた。{b}「よく来た。……ありがとう｜よく来た。……礼を言う｜よく来てくれました。……ありがとうございます」'),
    confused: L('{b}は困ったように目をそらした。{b}「そこまでしなくても……｜＝｜そこまでしなくても、いいんですよ」――それでも{a}は、{b}の無事を喜び続けていた。'),
    dominate: L('{b}は足元の{a}を見下ろした。{b}「遅い。……まあいいや、ついてきて｜遅い。……まあいい、ついてこい｜遅いです。……まあいいでしょう、ついてきてください」――{a}は、それだけで救われたような顔をした。'),
    cherish: L('{b}は{a}を立たせて、まっすぐ目を見た。{b}「探してくれてありがとう。{a}も、無事でよかった｜探してくれて感謝する。{a}も、無事でよかった｜探してくれてありがとうございます。{a}も、無事でよかったです」')
  };
  /* 再会の場面に重ねる一言（初めての合流のとき） */
  var SOUGHT = {
    base: L('{a}は、ずっと{b}を探して街を歩き回っていた。|{a}は、{b}を探して、いくつものエリアを越えてきたのだった。'),
    worship: L('{a}は群れのいる通りを何度も越えて、{b}を探し続けてきたのだった。服は破れ、腕には擦り傷がいくつもあった。|{a}は、{b}を探すために、危険と言われる場所ばかりを選んで歩いてきた。'),
    yan: L('{a}は、{b}のいそうな場所を一つ残らず回ってきたのだった。その目は、少し血走っていた。')
  };
  var LOST = {
    dead: L('{a}は、探していた{b}がもういないと知った。足元が崩れていくようだった。|{a}は、{b}がもうこの世にいないと聞いた。握りしめていた地図が、手から落ちた。'),
    deadW: L('{a}は、{b}がもうこの世にいないと知った。{a}は何も言わなかった。祈る言葉も、もう出てこなかった。'),
    deadY: L('{a}は、{b}がもうこの世にいないと知った。{a}「嘘。{b}は私を置いていかない｜嘘だ。{b}は私を置いていかない｜嘘です。{b}は私を置いていきません」――{a}は笑おうとして、うまく笑えなかった。'),
    out: L('{a}は、{b}がすでに街を出たと知った。安堵と寂しさが、同時に押し寄せた。|{a}は、{b}が救助されて街を離れたと聞いた。{a}「……そっか。よかった｜……そうか。よかった｜……そうですか。よかったです」')
  };

  /* ---------- 目標 ---------- */
  function goalObj(T) { return { id: 'seek', label: T.name + 'を探す', bias: { help: 1.15, bond: 1.2, solo: 1.1 } }; }
  function goalText(a, from) { return a.name + 'の目標が変わった：「' + from + '」→「' + a.goal.label + '」'; }
  function protectGoal() { return scen.goals.filter(function (g) { return g.id === 'protect'; })[0]; }
  function target(ctx, a) { return a.goal && a.goal.id === 'seek' && a.z.skT != null ? ctx.chars[a.z.skT] : null; }
  Z.seekTarget = target;
  Z.seekBold = function (ctx, a) { var T = target(ctx, a); return !!(T && bold(kind(ctx, a, T))); };
  /* 探しに行く気持ちの強さ（区切りごとの確率）。深さが 52 を超えたぶんだけ上がる */
  function urge(ctx, a, o) {
    var d = depth(ctx, a, o), k = kind(ctx, a, o);
    var p = HK.clamp((d - 52) / 220, 0, 0.35);
    if (!p) return { p: 0, d: d, k: k };
    p *= 0.7 + (a.tr.warmth || 0.5) * 0.6;
    p *= 1 - (a.tr.cold || 0) * 0.4;
    if (bold(k)) p *= 2.2;
    else if (k === 'lover' || k === 'parent' || k === 'child') p *= 1.25;
    else if (k === 'beneB') p *= 1.2;
    if (a.action && a.action.id === 'seek') p *= 1.4;
    if (a.goal.id === 'chaos') p *= 0.4;
    if ((a.z.skQuit || {})[o.i] != null && ctx.stepIndex - a.z.skQuit[o.i] < 8) p *= 0.2;
    return { p: Math.min(0.9, p), d: d, k: k };
  }
  function eligible(ctx, a) {
    if (!free(a) || !a.goal) return false;
    var g = a.goal.id;
    if (g === 'seek' || g === 'obsess') return false;
    return true;
  }
  /* 探したい相手（別のエリアにいて、いちばん深い人） */
  function pickT(ctx, a) {
    var best = null;
    ctx.chars.forEach(function (o) {
      if (o === a || !present(o) || o.z.area === a.z.area) return;
      if (a.goal.id === 'protect' && a.focus === o) return;
      if (a.goal.id === 'family' && a.z.family && a.z.family.pc === o.i) return;
      var u = urge(ctx, a, o);
      if (u.p > 0 && (!best || u.d > best.d)) { best = u; best.o = o; }
    });
    return best;
  }
  function start(ctx, a, u) {
    var T = u.o, from = a.goal.label;
    a.z.skPrev = a.goal; a.z.skT = T.i; a.z.skKnow = null; a.z.skAt = ctx.stepIndex; a.z.skFret = ctx.stepIndex; a.z.skFrets = 0; a.z.skK = u.k;
    a.goal = goalObj(T); a.goalHist = (a.goalHist || []).concat([a.goal]);
    a.z.skCount = (a.z.skCount || 0) + 1;
    ctx.stress(a, bold(u.k) ? 10 : 5);
    var m = { a: a.name, b: T.name, area: Z.an(ctx, a.z.area) };
    ctx.act2({ actors: [a, T], cat: 'solo', text: ctx.t(fill(ctx.pick(GO[u.k] || GO.care), m), a, T) + goalText(a, from),
      why: a.name + 'にとって' + T.name + 'は' + kn(ctx, u.k, a, T) + '（関係の深さ ' + Math.round(u.d) + '）。別の場所にいて、まだ会えていない' + (bold(u.k) ? '／' + (u.k === 'worship' ? '信仰' : '執着') + 'する側は、危険を顧みずに探しに行く' : ''), mag: 14 + (bold(u.k) ? 6 : 0) });
  }
  function done(ctx, a, T, how) {
    var from = a.goal.label, k = a.z.skK || kind(ctx, a, T);
    if (how === 'found') { var P = protectGoal(); a.goal = P || a.z.skPrev; a.focus = T; }
    else { a.goal = a.z.skPrev || scen.goals[0]; if (how === 'quit') (a.z.skQuit = a.z.skQuit || {})[T.i] = ctx.stepIndex; }
    a.goalHist = (a.goalHist || []).concat([a.goal.id || a.goal]);
    a.z.skT = null; a.z.skKnow = null;
    return goalText(a, from);
  }
  /* 見つけたときの文（再会の場面でないとき） */
  function foundText(ctx, a, T) {
    var k = a.z.skK || kind(ctx, a, T), g = GROUP[k] || 'friend', m = { a: a.name, b: T.name, area: Z.an(ctx, a.z.area) };
    var t = ctx.t(fill(ctx.pick(FOUND[g]), m), a, T);
    if (k === 'worship') { var wt = HK.Ties.from(ctx, a, T, 'worship'), re = WB_RE[(wt && wt.cold) || ''] || WB_RE['']; t += ctx.t(fill(ctx.pick(re), m), a, T); }
    return t;
  }
  function foundFx(ctx, a, T, k) {
    ctx.mod2(a, T, { aff: 6, trust: 5 }, { aff: bold(k) ? 3 : 6, trust: 5 });
    if (k === 'yan') ctx.mod(a, T, { att: 4 });
    a.stress = Math.max(0, a.stress - (bold(k) ? 30 : 20));
  }
  /* zombie-reunion.js から：初めての合流で、どちらかがもう一方を探していたとき。再会の場面に重ねる文を返す */
  Z.seekMet = function (ctx, a, b) {
    var out = { pre: '', post: '', who: [] };
    [[a, b], [b, a]].forEach(function (p) {
      var s = p[0], T = p[1];
      if (target(ctx, s) !== T) return;
      var k = s.z.skK || kind(ctx, s, T), m = { a: s.name, b: T.name };
      out.pre += fill(ctx.pick(SOUGHT[k] || SOUGHT.base), m);
      foundFx(ctx, s, T, k);
      out.post += done(ctx, s, T, 'found');
      out.who.push(s.name + 'は' + T.name + '（' + kn(ctx, k, s, T) + '）を探していた');
    });
    return out.who.length ? out : null;
  };

  /* ---------- 探す行動（噂を聞き回る） ---------- */
  EV.push({
    id: 'zs_ask', cat: 'solo', scope: 'solo', noOdd: true, pri: true,
    when: function (ctx, a) { var T = target(ctx, a); return !!(T && present(T) && free(a) && T.z.area !== a.z.area && (a.z.skKnow == null || a.z.skKnow === a.z.area)); },
    w: function (ctx, a) { return 3 + (Z.seekBold(ctx, a) ? 2 : 0); },
    run: function (ctx, a) {
      var T = target(ctx, a), rng = ctx.rng, k = a.z.skK, A = ctx.zb.A[a.z.area];
      var hit = rng() < (bold(k) ? 0.8 : 0.7), wrong = hit && rng() < ctx.env.rumor / 100 * 0.5;
      var m = { a: a.name, b: T.name, area: A.name };
      var t = ctx.t(fill(ctx.pick(ASK[k] || ASK.base), m), a, T), why = a.name + 'の目標「' + a.goal.label + '」。';
      /* 危険を顧みない探し方：声や物音で群れを呼び、咬まれることもある */
      var risky = bold(k) && A.z > 25;
      if (risky) {
        A.z = Math.min(100, A.z + 3);
        var rb = rng();
        if (rb < A.z / 100 * 0.12) { t += fill(ctx.pick(RISK), m); Z.infect(ctx, a, 'horde', true); why += '危険を顧みずに探し回り、咬まれた（' + A.name + 'のゾンビの多さ ' + Math.round(A.z) + '）'; ctx.stress(a, 6); return { text: t, why: why, mag: 30 }; }
        if (rb < A.z / 100 * 0.45) { a.hp -= 6 + rng.int(8); if (a.z.wound < 0) a.z.wound = ctx.stepIndex; t += fill(ctx.pick(HURT), m); why += '危険を顧みずに探し回って、けがをした／'; }
      }
      if (hit) {
        var cand = Z.adj(T.z.area).filter(function (x) { return x !== a.z.area; });
        var p = wrong && cand.length ? rng.pick(cand) : T.z.area;
        a.z.skKnow = p;
        t += ctx.t(fill(ctx.pick(HEARD), m).replace(/\{p\}/g, ctx.zb.A[p].name), a, T);
      } else t += ctx.t(fill(ctx.pick(NOHEAR), m), a, T);
      ctx.stress(a, 3);
      return { text: t, why: why + '噂を聞き回った' + (hit ? (wrong ? '（デマ：情報の錯綜 ' + ctx.env.rumor + '）' : '（本当の情報）') : '（手がかりなし）'), mag: 10 };
    }
  });

  /* 行き先（zombie-core.js の destOf から）：噂で聞いた場所へ。手がかりがなければ、まだ足を運んでいない方へ */
  Z.seekDest = function (ctx, c) {
    var T = target(ctx, c);
    if (!T || !present(T)) return null;
    if (c.z.skKnow != null && c.z.skKnow !== c.z.area) return c.z.skKnow;
    var adj = Z.adj(c.z.area), seen = function (x) { return c.z.path.filter(function (p) { return p === x; }).length; };
    return adj.slice().sort(function (x, y) { return seen(x) - seen(y) || ((x + ctx.stepIndex + c.i) % 3) - ((y + ctx.stepIndex + c.i) % 3); })[0];
  };

  /* ---------- 区切りの終わり：目標が変わる・見つける・焦る・あきらめる ---------- */
  function tick(ctx, s, n) {
    if (s >= n - 1) return;
    var shown = 0;
    ctx.chars.forEach(function (a) {
      if (!a.alive || a.out || !a.z) return;
      var T = target(ctx, a);
      if (T) {
        var k = a.z.skK || kind(ctx, a, T), m = { a: a.name, b: T.name };
        /* 相手がいなくなった */
        if (!T.alive || T.out) {
          var lt = !T.alive ? (k === 'worship' ? LOST.deadW : k === 'yan' ? LOST.deadY : LOST.dead) : LOST.out;
          if (!T.alive) ctx.stress(a, bold(k) ? 30 : 20);
          var tx = ctx.t(fill(ctx.pick(lt), m), a, T);
          ctx.act2({ actors: [a], cat: 'solo', text: tx + done(ctx, a, T, 'lost'), why: '探していた' + T.name + 'に、もう会えない', mag: 20 });
          return;
        }
        if (!free(a)) return;
        /* 同じエリアに来た */
        if (T.z.area === a.z.area && !T.z.alone) {
          foundFx(ctx, a, T, k);
          var ft = foundText(ctx, a, T);
          ctx.act2({ actors: [a, T], cat: 'bond', text: ft + done(ctx, a, T, 'found'), why: a.name + 'は' + kn(ctx, k, a, T) + 'の' + T.name + 'を探し続けていた（探し始めてから ' + (ctx.stepIndex - a.z.skAt) + ' 区切り）。ようやく会えた', mag: 22 });
          return;
        }
        /* 噂の場所に着いたのに、相手は動いていた：噂を追い直す */
        if (a.z.skKnow != null && a.z.skKnow !== T.z.area && ctx.rng() < 0.35) a.z.skKnow = T.z.area;
        /* 見つからない焦り */
        var gap = bold(k) ? 2 : 3;
        if (ctx.stepIndex - a.z.skFret >= gap && shown < 3 && ctx.rng() < 0.7) {
          shown++;
          a.z.skFret = ctx.stepIndex; a.z.skFrets++;
          ctx.stress(a, bold(k) ? 9 : 5);
          var g = GROUP[k] || 'friend';
          ctx.act2({ actors: [a], cat: 'solo', text: ctx.t(fill(ctx.pick(FRET[g]), m), a, T), why: a.name + 'は' + T.name + 'を探しているが、まだ見つからない（' + (ctx.stepIndex - a.z.skAt) + ' 区切り）' + (bold(k) ? '。焦りは日ごとに深くなる' : ''), mag: 10 + (bold(k) ? 4 : 0) });
          /* 浅い関係なら、そのうち区切りをつける（執着・信仰する側はあきらめない） */
          if (!bold(k) && a.z.skFrets >= 3 && depth(ctx, a, T) < 80 && ctx.rng() < 0.4) {
            ctx.act2({ actors: [a], cat: 'solo', text: ctx.t(fill('{a}は、{b}を探すのをいったんやめることにした。{a}「生きていれば、きっとどこかで会える｜＝｜生きていれば、きっとどこかで会えます」', m), a, T) + done(ctx, a, T, 'quit'), why: '探しても見つからず、区切りをつけた（関係の深さ ' + Math.round(depth(ctx, a, T)) + '）', mag: 10 });
          }
        }
        return;
      }
      /* 目標が「〇〇を探す」に変わる */
      if (s < 0 || !eligible(ctx, a)) return;
      var u = pickT(ctx, a);
      if (u && ctx.rng() < u.p) start(ctx, a, u);
    });
  }
  var af0 = scen.after;
  scen.after = function (ctx, s, n) { var r = af0 ? af0.apply(this, arguments) : undefined; tick(ctx, s, n); ctx.flush(); return r; };
})();
