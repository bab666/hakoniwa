/* 箱庭シミュレーター: 邪神村RTA ― 職業×職業の出来事（全年齢版・R18版共通。仕組みの入口は jashin-jobs.js の JS.JOBEV）
   特定の職業の二人がそろっていると、捜査の出来事が起きる（その組み合わせがいる回の、およそ四回に三回。一回の遊びで二件まで）。
   弁護士×記者（情報の取引）・弁護士×警察官（取り調べの攻防）・弁護士×経理（証文と帳簿）・弁護士×神職（祭りの取り決め）・
   経理×大物（寄付金の行方）・経理×マネージャー（請求書）・営業×大物（顔つなぎ）・営業×配信者（撮影の交渉）・
   看護師×医師（阿吽の呼吸）・看護師×霊能力者（看取り）・整備士×配信者（映像の復元）・整備士×警察官（駐在所の車）・
   農家×民俗学者（田の暦と祭りの暦）・農家×医師（毒草）
   ・二人の関係で文と結果が変わる：恋人（かばい合う）・許嫁（ぎこちなく気遣う）・家族（親や兄姉が止める／息の合う軽口）・
     親友など（息が合う）・上司と部下や師弟（命じる・教える）・盲信や信仰や執着（相手の読みを無条件に信じて誤る）・
     恐怖（怖くて手伝えない）・敵対（手柄を取り合い、わざと間違ったことを言う）・無関心（言葉を交わさない）・元恋人・片想い・初対面（名刺代わりの挨拶から）
   ・守る側・止める側は、関係の向きと気質で決める（性別や受け攻めでは決めない）
   台詞は3本（「くだけた常体｜硬い常体｜敬語」）。村人の台詞は「＠」で始める
   {a}=一人目の職業の人 {b}=二人目の職業の人 {p}{q}=関係の向きの二人（守る側と守られる側、上と下、信じる側と信じられる側…） */
(function () {
  'use strict';
  var HK = window.HK, JS = HK && HK.JASHIN;
  if (!JS) return;
  function L(s) { return s.split('|'); }
  function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }
  /* 組：id, a, b, s1, s2（それぞれの力）, tag, prefer, win, lose, intro, ok, ng, love, bad（関係ごとの導入の一文） */
  function J(id, a, b, s1, s2, tag, prefer, win, lose, t) { return { id: id, a: a, b: b, s1: s1, s2: s2, tag: tag, prefer: prefer ? prefer.split(',') : [], win: win, lose: lose, intro: L(t.intro), ok: L(t.ok), ng: L(t.ng), love: t.love, bad: t.bad }; }
  var PAIRS = [
    J('law_jou', 'lawyer', 'journalist', 'lore', 'talk', '情報の取引', 'talk,lore', 'clue', 'hostile', {
      intro: '{b}は取材メモを、{a}は役場で写してきた登記簿の控えを、民宿の座卓に並べた。「情報を交換しよう｜情報を交換しよう｜情報を交換しましょう」と{a}が言った。',
      ok: '{b}の聞き込みと{a}の書類が、一点で重なった。村の土地は、ここ百年で少しずつ、すべて同じ名義へ移されていた。名義人の生年は、二百年前だった。――|{b}が村人から聞いた「昔の大火事」の年に、{a}の写した登記簿では、村の半分の家の持ち主が一斉に書き換わっていた。――',
      ng: '二人が集めた話は、どこまでも噛み合わなかった。そのうえ、{b}が役場で写しを頼んだことが、もう村中に知れ渡っていた。',
      love: '{a}と{b}は、仕事の話を家に持ち帰っても喧嘩にならない二人だった。今夜も、座卓の上で互いのメモを自然に取り替えた。',
      bad: '{a}は{b}に、肝心の一枚だけは見せなかった。{b}も、取材メモの最後のページを手のひらで隠していた。' }),
    J('law_pol', 'lawyer', 'police', 'talk', 'fight', '取り調べの攻防', 'talk', 'clue', 'hostile', {
      intro: '{b}が駐在所の机を借り、事情を聞くだけだと言って村長を呼び出した。隣には{a}が、手帳を開いて座った。',
      ok: '{b}が問い詰め、{a}が逃げ道を塞いだ。追及と弁護の両方を知る二人の前で、村長の答えはしだいに辻褄を失い、最後にひとつの事実をこぼした。――',
      ng: '{b}が詰め寄るたび、{a}が「それは誘導だよ｜それは誘導だ｜それは誘導です」と口を挟んだ。取り調べの癖と弁護の癖がぶつかり合い、村長はその隙に、涼しい顔で帰っていった。',
      love: '{a}と{b}は、法廷でなら向かい合う側の仕事だった。それでも今夜は、同じ側の椅子に並んで座った。',
      bad: '{b}は{a}を犯罪者の味方だと思っていた。{a}は{b}を、冤罪を作る側の人間だと思っていた。二人の睨み合いに、村長のほうが面食らっていた。' }),
    J('law_acc', 'lawyer', 'accountant', 'lore', 'lore', '証文と帳簿', 'lore,obs', 'clue', 'fake', {
      intro: '{a}は蔵から借り出した古い証文を、{b}は社務所で写した寄進帳の数字を、同じ年ごとに並べ直した。',
      ok: '寄進が跳ねた年と、養子縁組の証文が交わされた年が、ぴたりと重なっていた。生贄に選ばれる家は、そのたびに金で黙らされていた。――|証文の立会人の家だけが、どの年も寄進を免除されていた。村の誰が祭りを仕切っているのか、数字が白状していた。――',
      ng: '二人は年号の数え方を取り違えた。元号の切り替わりを一年ずらしたまま、存在しない生贄の年を一つ作り上げてしまった。',
      love: '{a}と{b}は、書類に向かうときの沈黙が苦にならない二人だった。互いの手元を見なくても、次に渡すべき紙が分かった。',
      bad: '{b}は{a}の読みには数字の裏付けがないと切り捨て、{a}は{b}の表など法的には何の意味もないと突き返した。' }),
    J('law_pri', 'lawyer', 'priest', 'lore', 'rite', '祭りの取り決め', 'rite,lore', 'clue', 'hostile', {
      intro: '{b}は社務所の奥の文箱を開け、{a}に古い契約書を見せた。神社と氏子のあいだで交わされた、祭りの取り決めだった。',
      ok: '{b}が祝詞の言い回しを読み解き、{a}が条文の抜け道を見つけた。氏子でない者を祭りに差し出せば、村の誰も罪に問われない。そういう取り決めだった。――',
      ng: '文箱を開けたことが、すぐに宮司に知れた。「＠神域の文書に、よそ者が触れるとは」――{b}が同じ神職であることが、かえって怒りを買った。',
      love: '{b}は{a}にだけ、神職として決して外に出してはならない文箱を開けて見せた。',
      bad: '{b}は神域の文書を俗世の契約書のように扱う{a}が気に入らず、{a}は{b}の勿体ぶった前置きに苛立っていた。' }),
    J('acc_cel', 'accountant', 'celeb', 'obs', 'talk', '寄付金の行方', 'obs,lore', 'clue', 'hostile', {
      intro: '{b}は数年前、この村の村おこしの番組に出たことを思い出した。{a}は、そのときの寄付金の流れを、公民館に貼られた村の決算書と突き合わせた。',
      ok: '番組の寄付金は、決算書のどこにも載っていなかった。代わりに祭具修繕費の欄が、その年だけ膨らんでいた。――',
      ng: '{b}が決算書の控えを見せてほしいと役場に頼んだせいで、話が一気に広まった。「＠あの有名人が、村の金を調べとるらしい」',
      love: '{a}は{b}の仕事の契約書を、いつも代わりに読んでやっていた。今度もそうするだけだと、{a}は言った。',
      bad: '{b}は{a}に頼み事をするのが癪でたまらず、{a}は{b}の金遣いの荒さを内心で軽蔑していた。' }),
    J('acc_man', 'accountant', 'manager', 'obs', 'obs', '請求書の束', 'obs', 'clue', 'time', {
      intro: '{b}が民宿から受け取った請求書の束を、{a}が一枚ずつ電卓で検めた。',
      ok: '請求書の品目に、一行だけ見慣れないものが混じっていた。白装束、人数ぶん一式。すでに用意されていた。――|宿代の請求は、一行が着いた日の前の日付で切られていた。泊まる人数まで、最初から決まっていた。――',
      ng: '二人は請求書の数字を三度合わせ直したが、どこにも違和感はなかった。気づけば、夜が更けていた。',
      love: '{b}は、電卓を叩く{a}の横顔を、少し誇らしげに見ていた。',
      bad: '{a}は{b}の雑な経費の付け方に呆れ、{b}は{a}の細かさにうんざりしていた。' }),
    J('sal_cel', 'sales', 'celeb', 'talk', 'talk', '顔つなぎ', 'talk', 'calm', 'hostile', {
      intro: '{a}は{b}を連れて、村長の屋敷を訪ねた。{a}は「有名な人を連れてきたよ｜有名な人を連れてきた｜有名な方をお連れしました」と、いつもの営業の調子で口上を述べた。',
      ok: '村長は{b}の顔を見るなり相好を崩し、色紙を三枚も持ってきた。{a}は機嫌のいいうちにと、祭りの話をさりげなく振った。――',
      ng: '村長は{b}の顔を知らなかった。{a}の口上だけが座敷に空回りし、二人は茶も出されずに追い返された。',
      love: '{a}は{b}の隣に立つと、いつもより声に張りが出た。{b}も、{a}の前ではよく笑った。',
      bad: '{b}は{a}の客寄せに使われるのが気に食わず、{a}は{b}の気まぐれに何度も段取りを崩された。' }),
    J('sal_str', 'sales', 'streamer', 'talk', 'explore', '撮影の交渉', 'explore,obs', 'clue', 'hostile', {
      intro: '{b}が祭りの撮影をしたいと言い出し、{a}が交渉役を買って出た。相手は、社の鍵を預かる老人だった。',
      ok: '{a}の粘りに根負けした老人は、昼のあいだだけという約束で、社の裏の禁域に二人を通した。{b}のカメラが、苔むした石の扉を捉えた。――',
      ng: '{a}の交渉の最中に、{b}が勝手にカメラを回し始めた。老人の顔色が変わった。「＠撮るなと言うたろうが」',
      love: '{a}は{b}の配信のためなら、どんな相手にも頭を下げるつもりだった。',
      bad: '{a}は{b}の再生数稼ぎに付き合わされるのが不満で、{b}は{a}の交渉の遅さに苛立っていた。' }),
    J('nur_doc', 'nurse', 'doctor', 'obs', 'obs', '阿吽の呼吸', 'talk,spirit,obs', 'clue', 'hostile', {
      intro: '村の外れの家で、寝たきりの老人が高い熱を出していた。{b}が診察を始めると、{a}は言われる前に湯を沸かし、器具を並べた。',
      ok: '{b}の指示と{a}の手が、ひとつの生き物のように動いた。熱が下がり始めたころ、老人がうわ言のように繰り返した。――',
      ng: '処置の途中で、村の女たちが家に押しかけてきた。「＠余計なことをせんでください。この人は、祭りまでこのままでええんです」――二人は家から追い出された。',
      love: '{a}と{b}は、病院の夜勤で何度も同じ修羅場をくぐってきた。いまは、それ以上の間柄だった。',
      bad: '{b}は{a}の手際に口を出し、{a}は{b}の指示の遅さに内心で舌打ちした。病院でも、二人はずっとこうだった。' }),
    J('nur_psy', 'nurse', 'psychic', 'obs', 'spirit', '看取り', 'spirit,talk', 'clue', 'fear', {
      intro: '民宿の離れで、女将の母だという老婆が、静かに息を引き取ろうとしていた。{a}が枕元で脈を取り、{b}はその背後に立つ何かを見ていた。',
      ok: '{a}が老婆の手を握って落ち着かせ、{b}がその背後の気配に語りかけた。老婆は最期に、はっきりした声で一言だけ残した。――',
      ng: '{b}が「後ろにいる｜後ろにいる｜後ろにいます」と呟いた瞬間、老婆が目を見開いて叫んだ。二人は逃げるように離れを出た。',
      love: '{a}は、{b}が怖いものを見るたびに震える手を、いつも黙って握ってきた。今夜も、そうした。',
      bad: '{a}は霊だの何だのを信じておらず、{b}はその鈍さを軽蔑していた。それでも、老婆の枕元では二人とも黙った。' }),
    J('mec_str', 'mechanic', 'streamer', 'obs', 'explore', '映像の復元', 'obs,spirit', 'clue', 'fake', {
      intro: '{b}のカメラが、夜中に勝手に録画を止めていた。{a}はカメラを分解し、記録媒体を取り出した。',
      ok: '{a}が壊れた記録を読み出すと、{b}の知らない映像が残っていた。録画が止まる直前、カメラの前を横切った影があった。――',
      ng: '復元できたのは、途切れ途切れの数秒だけだった。{b}はそれを決定的な証拠だと言い張り、一行は間違った方向に希望を抱いた。',
      love: '{a}は{b}の機材を、いつも誰より丁寧に扱った。それが{a}なりの、大事にしているという伝え方だった。',
      bad: '{a}は{b}の機材の扱いの雑さに呆れ、{b}は{a}に借りを作るのが嫌でたまらなかった。' }),
    J('mec_pol', 'mechanic', 'police', 'explore', 'fight', '駐在所の車', '', 'flee', 'hurt', {
      intro: '無人の駐在所の裏に、タイヤを外されたパトカーが停められていた。{b}が見張りに立ち、{a}が車の下に潜り込んだ。',
      ok: '{a}は物置の奥からタイヤを見つけ出し、{b}の手を借りてはめ直した。無線は壊されていたが、車は動く。いざというときの足が手に入った。',
      ng: 'ジャッキが外れ、車体が傾いた。{b}がとっさに{a}を引きずり出したが、二人とも腕を擦りむき、工具は車の下に残ったままになった。',
      love: '{b}は見張りに立ちながら、何度も車の下の{a}の足元を振り返った。',
      bad: '{b}は{a}に命令口調で指図し、{a}はわざと返事をしなかった。' }),
    J('far_fol', 'farmer', 'folk', 'explore', 'lore', '田の暦と祭りの暦', 'lore,rite', 'clue', 'fake', {
      intro: '{a}は村の苗代の様子を、{b}は祭りの由来書を、それぞれ持ち寄った。種まきと刈り入れの時期を、祭りの暦に重ねてみた。',
      ok: '祭りは、本来なら刈り入れのあとにあるはずだった。この村だけ、田植えの前に行われている。豊作を祈る祭りではない。何かを鎮める祭りだ。――',
      ng: '{b}の読んだ暦と、{a}の知る土地の暦は、ひと月ずれていた。二人はそのずれに気づかないまま、もっともらしい答えを作ってしまった。',
      love: '{a}と{b}は、畑と書物という違う場所から、同じものを見ようとしていた。それが二人の、いつもの過ごし方だった。',
      bad: '{a}は{b}の机上の空論が気に入らず、{b}は{a}の勘頼みを学問ではないと見下していた。' }),
    J('far_doc', 'farmer', 'doctor', 'obs', 'obs', '毒草', '', 'save', 'hurt', {
      intro: '夕食に出された山菜のおひたしを見て、{a}が箸を止めた。{b}も、皿の端の葉の形に眉をひそめた。',
      ok: '{a}が葉の形を、{b}が症状を言い当てた。山菜に混ぜられていたのは、少量なら眠気を、量によっては心臓を止める毒草だった。二人は一行の膳から、こっそりそれを取り除いた。',
      ng: '二人が気づいたのは、何口か食べてしまったあとだった。{b}がすぐに吐かせたが、二人ともその夜は熱にうなされた。',
      love: '{a}は{b}の皿にだけは、いつも自分で選んだ野菜をよそっていた。',
      bad: '{a}は医者の知ったかぶりが嫌いで、{b}は{a}の言い伝え頼みを鼻で笑っていた。それでも、皿の上の葉には二人とも見覚えがあった。' })
  ];

  /* ---------- 関係の読み方 ---------- */
  function tiesOf(S, a, b) { return (S.ties || []).filter(function (t) { return (t.a === a.i && t.b === b.i) || (t.a === b.i && t.b === a.i); }); }
  var CAT = {
    fear: 'fear,abuse', apathy: 'apathy', love: 'lover,mate,fated,spouse,almost', fiance: 'fiance',
    family: 'parent,pparent,sibprot,sibling,sibclose,sibbad,relative,stepsib', bad: 'enemy,rival,bad',
    blind: 'blind,worship,yan,fond', lead: 'boss,mentor,teacher,senpai,master', crush: 'crush,honmei', ex: 'ex',
    close: 'best,buddy,childhood,friend,comrade,colleague,classmate,benefactor'
  };
  var ORDER = ['fear', 'apathy', 'love', 'fiance', 'family', 'bad', 'blind', 'lead', 'crush', 'ex', 'close'];
  /* 二人の関係 → { k: 分類, p, q（向きの二人）, lab: 関係の名前 } */
  function relOf(S, a, b) {
    var ts = tiesOf(S, a, b);
    for (var i = 0; i < ORDER.length; i++) {
      var k = ORDER[i], hit = ts.filter(function (t) { return CAT[k].split(',').indexOf(t.type) >= 0; })[0];
      if (!hit) continue;
      var A = hit.a === a.i ? a : b, B = A === a ? b : a, p = a, q = b;
      /* きょうだいの関係名は、二人の性別・年齢で「姉弟」など（sib-word.js） */
      var lab = HK.Sib && HK.Sib.isSibTie(hit) && HK.tieLabel ? HK.tieLabel(hit) : HK.TIES && HK.TIES[hit.type] ? HK.TIES[hit.type].label : hit.type;
      if (k === 'fear') { p = hit.type === 'abuse' ? B : A; q = p === a ? b : a; }       /* p＝怖がる側 */
      else if (k === 'apathy' || k === 'blind' || k === 'crush' || k === 'lead') { p = A; q = B; }   /* p＝無関心な側・信じる側・想う側・上の側 */
      else if (k === 'family') { if (/^(parent|pparent|sibprot)$/.test(hit.type)) { p = A; q = B; } else k = 'sib'; }
      else if (k === 'love' || k === 'fiance') { p = guard(a) >= guard(b) ? a : b; q = p === a ? b : a; }   /* p＝かばう側（気質と体力） */
      return { k: k, p: p, q: q, lab: lab };
    }
    return { k: 'none', p: a, q: b, lab: ts.length ? (HK.TIES && HK.TIES[ts[0].type] ? HK.TIES[ts[0].type].label : '知人') : '初対面' };
  }
  function guard(p) { return p.tr.np * 0.5 + p.tr.cp * 0.3 + p.tr.lead * 0.2 + (p.stats.stamina || 3) * 0.04; }

  /* 関係ごとの文：L＝導入、ok／ng＝結果のあと。{p}{q} は向きの二人 */
  var RT = {
    love: { L: L('{p}は{q}の半歩前に立った。何かあれば、先に自分が引き受けるつもりだった。|二人は目だけで頷き合った。長い付き合いの二人に、段取りの相談はいらなかった。'),
      ok: L('作業を終えると、{q}は小さく息をつき、{p}の袖をそっとつかんだ。二人の顔から、少しだけ怖さが抜けた。|{p}は{q}の肩に手を置き、「一緒でよかった｜一緒でよかった｜一緒でよかったです」と囁いた。'),
      ng: L('物音がした瞬間、{p}はとっさに{q}を背中にかばった。崩れてきた棚の角が、{p}の肩を打った。|{p}は{q}の手を引いてその場を離れ、自分の腕の擦り傷には構わなかった。{p}は「あなたが無事なら、それでいい｜あなたが無事なら、それでいい｜あなたが無事なら、それでいいんです」と言った。') },
    fiance: { L: L('{a}と{b}は、家どうしが決めた許嫁だった。並んで歩く距離を、二人ともまだ測りかねていた。|許嫁の{a}と{b}は、こういうときにどう振る舞えばいいのか分からず、妙に丁寧に互いを気遣った。'),
      ok: L('答えが出ると、二人は初めて自然に顔を見合わせて笑った。|{q}は、思っていたより頼りになる許嫁の横顔を、こっそり見直した。'),
      ng: L('{p}は{q}をかばうように前へ出た。許嫁として、それくらいはしなければと思った。') },
    family: { L: L('{p}は{q}に「危ないところは私がやる｜危ないところは私がやる｜危ないところは私がやります」と言い、前に出ようとする{q}を手で制した。|{q}が先に立とうとすると、{p}が黙ってその腕をつかんだ。家族のあいだでは、それだけで話は通じた。'),
      ok: L('{q}は少し得意げに{p}を見た。{p}は苦笑して、{q}の肩を軽く叩いた。|{p}は何も言わなかったが、帰り道、{q}の荷物を黙って持ってやった。'),
      ng: L('{p}が早めに引き上げさせたおかげで、{q}は危ない目に遭わずに済んだ。{q}は不満そうだったが、何も言わなかった。|{p}は「今日はここまで｜今日はここまでだ｜今日はここまでにしましょう」と{q}を連れて引き返した。{q}は振り返り、悔しそうに唇を噛んだ。') },
    sib: { L: L('{a}と{b}は、子どものころと同じように軽口を叩き合いながら、作業を分けた。|血のつながった二人は、相談しなくても互いの癖を知っていた。'),
      ok: L('{p}は「やっぱり、あなたと組むと早い｜やはり、あなたと組むと早い｜やはり、あなたと組むと早いですね」と言い、{q}は照れくさそうに鼻を鳴らした。'),
      ng: L('{p}と{q}は、失敗の責任をなすりつけ合った。それでも帰り道は、並んで歩いた。') },
    close: { L: L('{a}と{b}は、気心の知れた仲だった。どちらかが言いかけたことを、もう片方が引き取って続けた。|{a}と{b}は息を合わせて作業を分けた。互いの得意なことは、言わなくても分かっていた。'),
      ok: L('{a}と{b}は顔を見合わせ、小さく拳を合わせた。'),
      ng: L('肩を落とした{a}に、{b}は「次があるよ｜次がある｜次がありますよ」と笑ってみせた。') },
    lead: { L: L('{p}は{q}に手早く指示を出した。{q}は言われたとおりに動き、{p}は全体を見渡した。|{p}は{q}に「あなたはそっちを見て。私はこっちを見る｜あなたはそっちを見てくれ。私はこっちを見る｜あなたはそちらを見てください。私はこちらを見ます」と、慣れた口ぶりで仕事を割り振った。'),
      ok: L('{p}は{q}に「よくやった｜よくやった｜よくやりましたね」と声をかけた。{q}は少しだけ胸を張った。|{q}は{p}に教わったとおりの手順で、最後の確認をした。{p}は黙って頷いた。'),
      ngWarm: L('{p}は失敗を{q}のせいにはせず、「指示を誤ったのは私だ｜指示を誤ったのは私だ｜指示を誤ったのは私です」と言った。'),
      ngCold: L('{p}は{q}の手際の悪さを叱りつけた。{q}はうつむき、それきり口をきかなかった。') },
    blind: { L: L('{p}は{q}の言うことなら、何でも正しいと思っていた。{q}が指さした場所を、{p}は疑いもせずに調べた。|{p}は{q}の判断を一度も疑わなかった。{q}が「ここだ｜ここだ｜ここです」と言えば、そこが答えだった。'),
      ok: L('{q}の読みは当たっていた。{p}は、やはりこの人は正しいと、胸の中で繰り返した。'),
      ng: L('{q}の読みは外れていた。だが{p}は、それを最後まで信じて疑わなかった。外れた答えが、そのまま一行の手がかりの中に紛れ込んだ。') },
    fear: { L: L('{p}は{q}と同じ場所にいるだけで、体がこわばった。何を頼まれても、{p}は小さく頷くことしかできなかった。|{p}は{q}の顔をまともに見られなかった。結局、作業のほとんどを{q}が一人でこなした。'),
      ok: L('{q}が一人で答えにたどり着くあいだ、{p}は部屋の隅で息を殺していた。'),
      ng: L('{q}が舌打ちをした。{p}はびくりと肩を震わせ、手にしていたものを取り落とした。') },
    bad: { L: L('{a}と{b}は、互いに手柄を譲る気がなかった。作業は、ほとんど競争になった。|{a}は{b}の手元を盗み見ながら、自分の見つけたことは何ひとつ口にしなかった。'),
      ok: L('{a}は見つけたものを先に懐へ入れようとしたが、{b}がそれを見逃さなかった。結局、二人とも同じ答えにたどり着いていた。|{b}は「あなたのおかげじゃない｜あなたのおかげではない｜あなたのおかげではありません」と言い捨てたが、その答えは{a}の読みと同じだった。'),
      ng: L('{a}はわざと見当違いのことを口にし、{b}はそれを鵜呑みにしかけた。どちらが騙したのか、もう分からなかった。'),
      ng2: L('二人は互いの読みを否定し合い、そのあいだに時間ばかりが過ぎた。遠くから、村人の誰かがそれを見て笑っていた。') },
    apathy: { L: L('{p}は{q}に何の関心も示さなかった。二人は並んで作業をしながら、ひと言も言葉を交わさなかった。|{p}は{q}の言うことに相づちも打たず、自分の手元だけを見ていた。'),
      ok: L('答えが出ても、{p}は{q}の方を見もしなかった。{q}だけが、それを手帳に書き留めた。'),
      ng: L('失敗しても、{p}は表情ひとつ変えなかった。{q}は、ため息をついた。') },
    ex: { L: L('{a}と{b}は、かつて恋人どうしだった。気まずい沈黙のまま、それでも昔と同じ段取りで手が動いた。|{a}と{b}は、別れてから初めて二人きりになった。互いに目を合わせないまま、作業を分け合った。'),
      ok: L('答えが出た瞬間、二人は思わず昔のように顔を見合わせ、すぐに目をそらした。'),
      ng: L('{a}は「昔からそうだった｜昔からそうだった｜昔からそうでしたね」とこぼし、{b}は聞こえないふりをした。') },
    crush: { L: L('{p}は{q}の隣で作業できるのが嬉しくて、いつもより張り切った。|{p}は{q}にいいところを見せようと、自分から一番面倒な役を引き受けた。'),
      ok: L('{q}に礼を言われ、{p}は照れ隠しに手帳ばかりめくった。'),
      ng: L('{p}は{q}の前で失敗したことが悔しくて、しばらく顔を上げられなかった。') },
    none: { L: L('{a}と{b}は、この村で初めて言葉を交わした仲だった。まずは名刺代わりに、互いの仕事の話から始めた。|{a}は{b}に「改めて、よろしく｜改めて、よろしく頼む｜改めて、よろしくお願いします」と頭を下げた。互いの得意なことを確かめ合うところからだった。'),
      ok: L('作業を終えるころには、二人は昔からの仕事仲間のように息が合っていた。'),
      ng: L('まだ互いの癖が分からず、二人の段取りは何度も噛み合わなかった。') }
  };
  /* 関係ごとの成功の補正と、関係の変化 */
  var BONUS = { close: 0.15, love: 0.1, sib: 0.1, lead: 0.08, fiance: 0.03, family: -0.05, crush: 0.05, blind: 0, ex: -0.05, none: -0.05, apathy: -0.12, bad: -0.1, fear: -0.22 };
  var RELD = { close: [0.1, -0.03], love: [0.12, 0.08], sib: [0.1, -0.05], lead: [0.15, 0], fiance: [0.15, 0.05], family: [0.1, 0.03], crush: [0.1, -0.05], blind: [0.1, 0], ex: [0.05, -0.05], none: [0.15, 0.02], apathy: [0, 0], bad: [-0.05, -0.15], fear: [0, -0.05] };
  var LAB = { close: '息の合う二人', love: 'かばい合う二人', sib: '軽口', lead: '指示と信頼', fiance: '許嫁の歩み寄り', family: '止める家族', crush: '張り切り', blind: '盲信', ex: '昔の段取り', none: '名刺代わり', apathy: '', bad: '手柄の取り合い', fear: '' };
  var KJP = { close: '親しい仲', love: '恋人', sib: 'きょうだい・親族', lead: '上下の関係', fiance: '許嫁', family: '家族（守る側がいる）', crush: '片想い', blind: '盲信・信仰・執着', ex: '元恋人', none: '初対面', apathy: '無関心', bad: '敵対・不仲', fear: '恐怖' };

  var SK = { obs: '観察', lore: '知識', talk: '聞き込み', spirit: '霊感', explore: '探索', fight: '腕っぷし', rite: '作法' };
  var RATE = 0.75, MAXP = 2;
  function jobL(id) { var j = JS.JOB[id]; return j ? j.label : id; }
  function clamp100(v) { return clamp(v, 0, 100); }
  function setRel(S, a, b, d, lab, from) { if (d && JS.DRAMA && JS.DRAMA.setRel) JS.DRAMA.setRel(S, a, b, d, lab, from); }

  JS.JOBPAIR = {
    PAIRS: PAIRS, RT: RT, relOf: relOf,
    /* 到着のあと：そろっている組み合わせを、二件まで予定に入れる */
    setup: function (S) {
      var rng = S.rng, P = S.P, cand = [];
      S.jobQ = []; S.jobPairN = 0;
      PAIRS.forEach(function (e) {
        var prs = [];
        P.forEach(function (a) { if (a.job !== e.a) return; P.forEach(function (b) { if (b !== a && b.job === e.b) prs.push([a, b]); }); });
        if (prs.length) cand.push({ e: e, pr: prs[Math.floor(rng() * prs.length)] });
      });
      /* 並びを混ぜて、先頭から（同じ人が二件とも出ないように） */
      for (var i = cand.length - 1; i > 0; i--) { var j = Math.floor(rng() * (i + 1)), t = cand[i]; cand[i] = cand[j]; cand[j] = t; }
      var used = {};
      cand.forEach(function (c) {
        if (S.jobQ.length >= MAXP || used[c.pr[0].i] || used[c.pr[1].i] || rng() > RATE) return;
        used[c.pr[0].i] = used[c.pr[1].i] = 1;
        var at = Math.min(Math.max(2, S.deadline - 4), 2 + 2 * Math.floor(rng() * 6) + S.jobQ.length * 2);
        S.jobQ.push({ e: c.e, a: c.pr[0], b: c.pr[1], at: at, done: false });
      });
      S.jobPairN = S.jobQ.length;
    },
    /* 二時間ごと：予定の時刻を過ぎた出来事を一つ */
    tick: function (S, live, h) {
      var F = JS.JOBEV.free, fired = 0;
      (S.jobQ || []).forEach(function (q) {
        if (q.done || h < q.at || fired) return;
        if (!JS.alive(q.a) || !JS.alive(q.b)) { if (!q.a.alive || !q.b.alive || h > q.at + 12) q.done = true; return; }
        if (!F(q.a) || !F(q.b)) { if (h > q.at + 8) q.done = true; return; }
        q.done = true; fired++;
        fire(S, q, h);
      });
    }
  };

  function fire(S, q, h) {
    var rng = S.rng, e = q.e, a = q.a, b = q.b, R = relOf(S, a, b), T = RT[R.k] || RT.none;
    var sa = JS.skill(a, e.s1), sb = JS.skill(b, e.s2);
    /* 上下の関係は、上の人の腕が多めに効く。怖がる人は手伝えない */
    if (R.k === 'lead') { if (R.p === a) sa *= 1.15; else sb *= 1.15; }
    if (R.k === 'fear') { if (R.p === a) sa *= 0.4; else sb *= 0.4; }
    var bonus = BONUS[R.k] || 0, sum = sa + sb, ok = sum + bonus + (rng() - 0.5) * 0.5 >= 1.0;
    var m = { a: a.name, b: b.name, p: R.p.name, q: R.q.name };
    function F(t) { return ST.fmt(t, m); }
    function pk(l) { return l && l.length ? l[Math.floor(rng() * l.length)] : ''; }
    /* 導入：恋人・敵対は、七割がた組ごとの一文 */
    var own = rng() < 0.7, lead = own && R.k === 'love' && e.love ? e.love : own && R.k === 'bad' && e.bad ? e.bad : pk(T.L);
    var t = F(pk(e.intro)) + F(lead), why = [], parent = R.k === 'family';
    if (ok) {
      t += F(pk(e.ok));
      if (e.win === 'clue') { var c = JS.JOBEV.gain(S, a, e.prefer); if (c) { t += c; why.push('手がかり ' + S.found.length + '/' + S.G.clues.length); } else { t = t.replace(/――$/, '') + 'だが、それはもう一行が掴んでいる事実だった。'; S.hostile = clamp100(S.hostile - 3); why.push('手がかりは出そろっていた（村人の敵意 −3）'); } }
      else if (e.win === 'calm') { S.hostile = clamp100(S.hostile - 8); why.push('村人の敵意 −8'); var c2 = JS.JOBEV.gain(S, a, ['talk']); if (c2) { t += c2; why.push('手がかり ' + S.found.length + '/' + S.G.clues.length); } else t = t.replace(/――$/, ''); }
      else if (e.win === 'flee') { S.fleeBonus = (S.fleeBonus || 0) + 0.1; why.push('逃げるときの足を確保した（儀式の夜に逃げ延びやすくなる）'); }
      else if (e.win === 'save') { a.foresee = true; b.foresee = true; why.push('二人とも、次の村人の襲撃を一度だけかわせる'); }
      t += F(pk(T.ok));
      [a, b].forEach(function (p) { p.m.fear = clamp100(p.m.fear - (R.k === 'love' || R.k === 'close' ? 6 : 3)); });
      if (R.k === 'fear') R.p.m.fear = clamp100(R.p.m.fear + 8);
    } else {
      t += F(pk(e.ng));
      /* 守る側がいる家族は、早めに引き上げさせて痛手を軽くする */
      var lose = parent && /^(hurt|hostile)$/.test(e.lose) ? 'fear' : e.lose;
      if (lose === 'hostile') { S.hostile = clamp100(S.hostile + 6); why.push('村人の敵意 +6'); }
      else if (lose === 'fake') { S.fake = (S.fake || 0) + 1; why.push('偽の手がかりをつかんだ'); }
      else if (lose === 'hurt') { [a, b].forEach(function (p) { p.m.hp = clamp100(p.m.hp - 10); p.m.fear = clamp100(p.m.fear + 5); }); why.push('二人とも怪我（体力 −10）'); }
      else if (lose === 'fear') { [a, b].forEach(function (p) { p.m.fear = clamp100(p.m.fear + 8); }); why.push('恐怖 +8' + (parent && e.lose !== 'fear' ? '（' + R.p.name + 'が早めに引き上げさせ、痛手は小さかった）' : '')); }
      else if (lose === 'time') { a.jobBusy = b.jobBusy = h + 2; why.push('時間を使い果たした（次の時間も動けない）'); }
      /* 関係ごとの結果のあと */
      if (R.k === 'lead') t += F(pk(R.p.tr.warmth >= 0.5 ? T.ngWarm : T.ngCold));
      else if (R.k === 'bad') { var two = rng() < 0.5; t += F(pk(two ? T.ng : T.ng2)); if (two) { S.fake = (S.fake || 0) + 1; why.push('わざと見当違いのことを言った（偽の手がかり）'); } else { S.hostile = clamp100(S.hostile + 3); why.push('言い争いを村人に見られた（村人の敵意 +3）'); } }
      else t += F(pk(T.ng));
      if (R.k === 'blind') { S.fake = (S.fake || 0) + 1; why.push(R.p.name + 'が外れた読みを信じ込んだ（偽の手がかり）'); }
      if (R.k === 'love') { R.p.m.hp = clamp100(R.p.m.hp - 8); R.q.m.fear = clamp100(R.q.m.fear - 6); why.push(R.p.name + 'が' + R.q.name + 'をかばった'); }
      if (R.k === 'fear') R.p.m.fear = clamp100(R.p.m.fear + 8);
    }
    var rd = (RELD[R.k] || [0, 0])[ok ? 0 : 1];
    if (R.k === 'lead' && !ok) rd = R.p.tr.warmth >= 0.5 ? 0.05 : -0.15;
    setRel(S, a, b, rd, LAB[R.k] || '', R.k === 'blind' || R.k === 'crush' || R.k === 'fear' ? R.p : null);
    /* 二人はこの時間、この出来事に使った */
    a.jobBusy = Math.max(a.jobBusy || 0, h); b.jobBusy = Math.max(b.jobBusy || 0, h);
    S.jobN = (S.jobN || 0) + 1;
    ST.say(S, { actors: [a, b], tag: '職業の組・' + e.tag, text: t,
      why: jobL(a.job) + '×' + jobL(b.job) + '（関係：' + R.lab + '＝' + (KJP[R.k] || '') + '）／' + (ok ? '成功' : '失敗') + '：' + SK[e.s1] + '＋' + SK[e.s2] + 'の合計 ' + Math.round(sum * 100) + (bonus ? '、関係の補正 ' + (bonus > 0 ? '+' : '') + Math.round(bonus * 100) : '') + (why.length ? '→ ' + why.join('・') : ''), mag: ok ? 24 : 20, jev: e.id, jrel: R.k, jok: ok });
  }
  var ST = HK.Story;
})();
