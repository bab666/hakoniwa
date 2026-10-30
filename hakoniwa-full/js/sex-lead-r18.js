/* 箱庭シミュレーター（R18版のみ）: エッチの前振り（HK.SexLead）。2026-10-28 担当LN
   利用者の要望（2026-10-28）：「『三人っていうのは……』など、エッチ前の前振りがちょっと弱い。3P 含め、えっちを開始する前には必ず前振りとして、
     どうしてエッチすることになったのかを説明してください。その後エッチに突入」「エッチシーンの前に行を表示する感じだね」
   ■ していること
     ・エッチの場面の記録のすぐ前に、「なぜその場でエッチすることになったのか」を説明する段（記録の一件。理由の欄は「きっかけ：…」、e.tag＝'きっかけ'、重要度 3）を出す。
       前振りは「状況と理由」、場面の頭にある既存の短い導入（「三人って、本当にするの」「誰からにする？」・命令の台詞 など）は「場に入る仕草」として、そのまま残す。
     ・材料（文脈から拾って、主因 1〜2 つ＋補足）：部屋の条件（エッチ○回・媚薬○本・三人で・但し書き・一人しか出られない・全員で出られる）と残り時間・部屋の圧／
       媚薬・酒の熱／二人（三人）の関係（恋人・片想い・不仲・主従・家族・初対面・セフレ・元恋人・友人・執着）と惹かれ／誰が言い出したか（言い出した人の態度9種の台詞。3本）・
       相手がどう応じたか（受けの開放度）／夜の色（HK.EroFlavor：甘め＝気持ち・ドライ＝割り切り・駆け引き＝条件・荒め＝押し切り）／
       合意のない場面は「なぜ抵抗が通らなかったか」（力・条件・媚薬・嫌悪と欲・時間・縛られて）
     ・同じ組（三人）の二度目からは「二度目の理由」（条件の回数が残る・条件はもう満たした・熱が引かない・さっきの続き・さっきとは別の相手）。同じ文は一回の中で繰り返さない（HK.Ero.fresh）
     ・前振りが既にある入口（こじれた三人の導入 A1〜A5・主従の命令・関係ごとの夜・家族の立場・「一人だけ」を取り戻す・最後の三人）は、短い前振り（状況・関係・時間の 3 文）
   ■ 入口の見つけ方（出られない部屋。読み込み順に左右されないよう HK.wrap で包む）
     ・場面の文を作る部品が呼ばれたら、その文の切れ端を覚えておき（ctx._slQ）、その文を含む記録が言われる直前に前振りを差し込む（箱庭の setup で ctx.say を包む）：
       HK.RoomLewd.scene（二人の夜・スピード型・媚薬・罰ゲーム・「一人だけ」）／HK.Trio3.begin の組み立て（三人の場面・条件「三人で」・みんなで（三人・4 人）・最後の三人）／
       HK.TrioRival.apply（こじれた三人）／HK.HateSex.scene（敵対の強引なエッチ）／HK.RoomTieSex.scene（関係のある二人）／HK.TieOrder.body・sexBody（命令・家族の立場・関係ごとの夜）／
       HK.TieMasterR18.scene（従が主に力ずくで）／HK.TieWarmR18.scene（関係ならではの円満な夜）
     ・部品を通らない場面は出来事の id で拾う（EVR）：スピード型（縛って済ませる）・媚薬で押し倒す・みんなで（照明を落とす一文）・闇に堕ちた自分（力ずく・寝取り）
     ・記録は ctx.log に直接足す（ほかの say の包み（妊娠・夜の色・夜の性格・見た目の一文など）を前振りに当てない）。場面が言われなかったら前振りも取り除く
   ■ 他の箱庭で使う：HK.SexLead.text(ctx, { who: [言い出した人, 相手(, 三人目, 四人目)], kind: 'pair'|'trio'|'group'|'hate'|…, mode, ev }) → { text, why }。
     箱庭の setup で HK.SexLead.attach(ctx) を呼ぶと、上の部品を通った場面に自動で前振りが付く（出来事の id の決まりは EVR に足す）
   ■ 書式：地の文は 3 文以上（足りなければ時間・部屋の一文で補う）。性別の語・体の語は使わない（男×女・女×女・女攻め×男のどれでも読める書き方）。
     台詞は3本「くだけた常体｜硬い常体｜敬語」（一人称は「私」、二人称は「あなた」）、話し手は {a}（言い出した人）。名詞の引用は「＠＠…」。
     部屋の数え上げ（scenario-room.js の countFlavor）に拾われないよう、手を繋ぐ・抱きしめる・キス・膝枕・「…好き…」の言い回しは書かない（BAN で確かめる）。
     攻めを選んだ人を受けにする言い回し（委ねる・組み敷かれる など）は書かない（誰が攻めかは場面の側が決める）。全年齢版・全年齢モードでは何もしない。登場人物はすべて成人として扱う */
/* @event-ok エッチの前振り（既にある場面の直前に「きっかけ」の段を足すだけ。新しい出来事ではない） */
(function () {
  'use strict';
  var HK = window.HK;
  if (!HK || HK.SexLead) return;
  var SL = HK.SexLead = { log: null };
  function L(s) { return s.split('|'); }
  var PS = ['proud', 'stern', 'tsun', 'gentle', 'devoted', 'cool', 'free', 'shy', 'polite'];
  function ps(c) { var p = c && (HK.personaOf ? HK.personaOf(c) : c.persona); return PS.indexOf(p) >= 0 ? p : 'gentle'; }
  var PS_JA = { proud: '強気', stern: '厳格', tsun: '意地っ張り', gentle: '穏やか', devoted: '健気', cool: '冷静', free: '奔放', shy: '内気', polite: '丁寧' };
  /* 部屋の数え上げ（手を繋ぐ・ハグ・膝枕・キス・「好き」）に拾われる言い回し：前振りには書かない */
  var BAN = /手を(繋|つな|握)|手を探り当て|指を絡|抱きしめ|抱き合|ハグ|膝枕|キスを?し|唇を重ね|口づけ|「[^」]*好き/;
  SL.BAN = BAN;

  /* ======================= 文の表 ======================= */
  /* {a}＝言い出した人 {b}＝相手 {c}{d}＝三人目・四人目 {gn}＝全員の名前（・つなぎ） {n}＝条件の回数 {left}＝残りの回数 {el}＝経った時間 {hl}＝残り時間
     {k}{c}{u}＝こじれた三人（不仲の攻め・片想いの攻め・受け） {h}＝真ん中の人 */
  var T = SL.T = {};
  /* ---------- 状況（部屋の条件）：一度目 ---------- */
  T.SIT = {
    h1: L('扉の紙に書かれた条件は、何度読み返しても変わらなかった。|壁も床も調べ尽くして、出口の手がかりは扉の紙のほかに見つからなかった。|扉は押しても叩いてもびくともせず、紙の一行だけが、出る方法を告げていた。|この部屋を出る方法が一つしかないことは、もう全員が分かっていた。'),
    hn: L('扉の紙が求める回数は、{n}回だった。一度目を済ませないことには、何も始まらない。|{n}回、と扉の紙ははっきり書いていた。数えるだけで気が遠くなる回数だった。|条件の回数は{n}回。のんびり構えていられる数ではなかった。'),
    aphro: L('テーブルの上の媚薬の瓶は、もう何本も空になっていた。|飲み切らなければ出られない媚薬が、少しずつ体の中に溜まっていた。|空いた媚薬の瓶が、床に転がっていた。飲んだ分だけ、部屋の空気が甘く重くなっていた。'),
    one: L('条件を満たしても、扉をくぐれるのは一人だけだった。それでも、満たさなければ誰も出られない。|出られるのは一人だけ、という但し書きが、部屋の空気を重くしていた。'),
    allout: L('誰か一組でも条件を満たせば、全員で外へ出られる。そう分かってから、部屋の空気が変わった。|一組が済ませれば、全員が出られる。その一行が、背中を押していた。'),
    /* 三人の場面でだけ数える部屋（環境値 multi 'only'。旧・条件「三人で」） */
    trio3: L('扉の紙の条件は、三人でのエッチだった。|扉の紙は、三人でなければ数えないと告げていた。'),
    night: L('照明が落ちて、白い部屋は夜の色に沈んでいた。|扉が開かないまま、また夜が来た。|出口の見えない夜が、白い部屋の隅々にまで影を落としていた。')
  };
  /* ---------- 時間 ---------- */
  T.TIME = {
    early: L('閉じ込められてから、まだそれほど時間は経っていなかった。急ぐ理由は、時計のほかにあった。|時間にはまだ余裕があった。それでも、待つ理由も見当たらなかった。|目覚めてから、まだ{el}しか経っていなかった。先延ばしにしても、何も変わらないことだけは分かっていた。|時計の針は、まだほとんど進んでいなかった。進んでいたのは、覚悟の方だった。'),
    mid: L('閉じ込められてから、もう{el}が過ぎていた。|気づけば、目覚めてから{el}が経っていた。|{el}も同じ白い壁を見ていれば、考えることも尽きてくる。'),
    late: L('残された時間は、もう{hl}ほどしかなかった。|照明が少しずつ暗くなり、残り時間が減っていくのが目に見えた。|あと{hl}。迷っていられる時間は、とうに過ぎていた。'),
    last: L('照明はもう一段落ちて、限界の時刻が目の前に迫っていた。|時間切れは、すぐそこまで来ていた。|残り時間は、ほとんどなかった。')
  };
  T.PRESS = L('部屋の空気は重く、じっとしているだけで息が詰まりそうだった。|白い壁の圧迫感が、少しずつ冷静さを削っていた。|息苦しい部屋の中で、まともに考える余裕はとうになかった。');
  /* ---------- 主因（関係と気持ち） ---------- */
  T.CAUSE = {
    love: L('{a}と{b}は、この部屋に来る前から想い合っていた。部屋に背中を押されただけだと、二人とも分かっていた。|二人にとって、相手に触れること自体は、ためらう理由にならなかった。ためらっていたのは、場所の方だった。|恋人どうしの二人には、条件はきっかけでしかなかった。'),
    warm: L('この部屋で過ごすうちに、{a}と{b}の距離はいつの間にか縮まっていた。|話し込むうちに、{a}は{b}を条件の相手としてではなく見るようになっていた。|閉じ込められてから、二人は何度も互いに助けられていた。そのたびに、少しずつ心がほどけていった。'),
    crushA: L('{a}は、ずっと{b}を目で追っていた。条件は、言い出せずにいた気持ちのちょうどいい言い訳だった。|{a}にとって、相手が{b}なのは願ってもないことだった。{b}がそれに気づいているかは、分からなかった。'),
    crushB: L('{b}が{a}に向ける視線には、条件だけでは説明できない熱があった。|{b}は前から{a}を想っていた。{a}だけが、そのことを知らなかった。'),
    stranger: L('{a}と{b}は、この部屋で初めて顔を合わせた間柄だった。気持ちより先に、出たいという一点で二人は一致していた。|互いのことは、ほとんど知らなかった。だからこそ、割り切るのは難しくなかった。|名前を知ってから、まだ何時間も経っていなかった。それでも、扉の紙は相手を選ばせてはくれなかった。'),
    friend: L('{a}と{b}は、気の置けない仲だった。その気安さが、かえって一線を重くしていた。|友達のままでいたい、と二人とも思っていた。けれど、扉はそれを許してくれなかった。|長い付き合いの二人だった。今さら、という気恥ずかしさが、何度も話を止めた。'),
    fwb: L('{a}と{b}にとって、肌を重ねるのは初めてではなかった。場所が変わっただけだ、と{a}は自分に言い聞かせた。|いつもの相手、いつもの手順だった。違うのは、扉が開かないことだけだった。'),
    ex: L('別れた相手と、こんな形でまた向き合うことになるとは、どちらも思っていなかった。|終わらせたはずの気持ちが、狭い部屋の中で少しずつ戻ってきていた。|一度は終わった二人だった。終わり方が、まだ二人の間に引っかかっていた。'),
    hate: L('{a}と{b}は、顔を合わせれば言い合いになる仲だった。それでも、扉は二人の事情を聞いてはくれなかった。|よりによって、いちばん反りの合わない相手と二人きりだった。|互いへの苛立ちは、閉じ込められてからも少しも薄れていなかった。'),
    family: L('{a}と{b}は家族だった。越えてはいけない線だと、二人とも知っていた。|家族という間柄が、何度も二人の足を止めた。'),
    rank: L('{a}と{b}のあいだには、部屋の外での立場があった。この部屋の中では、その線が少しずつ曖昧になっていった。|外では、上と下がはっきりしている二人だった。白い部屋は、そんな肩書きを気にしてはくれなかった。'),
    obsess: L('{a}は、この部屋に閉じ込められたことを、どこかで喜んでいた。{b}を誰にも渡さずに済むからだ。|{a}の{b}への想いは、もう想いと呼べる重さを超えていた。'),
    heat: L('媚薬の熱は、もう我慢でどうにかなる量を超えていた。|飲んだ媚薬が回りきって、{a}の指先まで熱を帯びていた。|{a}も{b}も、媚薬のせいで呼吸が浅くなっていた。|媚薬が回るにつれて、考えることが一つずつ減っていった。'),
    drunk: L('酒のせいで、{a}の口は普段より軽くなっていた。|酔いが回って、ためらう気持ちの方が先に眠ってしまったようだった。'),
    despair: L('ほかの方法は、もう試し尽くしていた。|扉を叩く手も、話し合う声も、とうに疲れ切っていた。|待っていれば誰かが助けに来る、という望みは、とっくに消えていた。')
  };
  /* ---------- 決め手（合意の夜。夜の色ごと）：誰が言い出し、相手がどう応じたか ---------- */
  T.DECIDE = {
    sweet: L('先に手を伸ばしたのは{a}だった。{b}は、その手を拒まなかった。|{a}が名前を呼ぶと、{b}は少し間を置いてから、小さく頷いた。|{a}が隣に座り直すと、{b}は黙って肩を寄せた。|{a}の声は少し震えていた。それを聞いて、{b}の方が先に覚悟を決めた。'),
    dry: L('{a}が淡々と段取りを口にすると、{b}も同じ温度で頷いた。|気持ちの話は、どちらもしなかった。{a}が言い出し、{b}が受けた。それだけだった。|{a}は時計を一度見てから、{b}に短く声をかけた。{b}は返事の代わりに、上着を脱いだ。'),
    deal: L('{a}は条件を口実に、{b}の出方をうかがった。{b}もまた、どこまで許すかを値踏みするように目を細めた。|先に折れた方が負け、という顔で、二人はしばらく見つめ合っていた。根負けしたのは{b}の方だった。|{a}は、{b}が断れないのを分かっていて誘った。{b}も、それを分かっていて乗った。'),
    rough: L('{a}は返事を待たなかった。{b}も、待たれることを望んではいなかった。|{a}の目つきが変わったのを、{b}は見逃さなかった。逃げる気は、最初からなかった。|話し合うより早く、{a}は{b}の腕を引いていた。')
  };
  T.RESIGN = L('先に覚悟を決めたのは{a}で、{b}はしばらくしてから、ようやく頷いた。|{b}はしばらく黙っていたが、やがて小さく息を吐いて、{a}の方へ向き直った。|出るため、と{a}は短く言った。{b}は何も言い返さなかった。|二人とも、相手の顔をまともに見られなかった。それでも、どちらも背を向けなかった。');
  /* 受けの開放度（open／mid／shy）で、応じ方を一文足す */
  T.OPENR = {
    open: L('{b}の方は、思っていたよりずっとあっさりしていた。|{b}は、むしろ待っていたような顔をした。'),
    mid: L('{b}は少し考えてから、うん、と一度だけ頷いた。|{b}の返事は短かったが、迷いはなかった。'),
    shy: L('{b}は耳まで赤くなって、しばらく顔を上げられなかった。|{b}は消え入りそうな声で、ようやく返事をした。')
  };
  /* ---------- 合意のない場面：なぜ抵抗が通らなかったか ---------- */
  T.PUSH = {
    power: L('{b}は押し返そうとしたが、{a}の力の方が強かった。|{b}が身をよじっても、{a}の腕はびくともしなかった。'),
    cond: L('{b}にも、条件を満たさなければ出られないことは分かっていた。その分かってしまう頭が、拒む手を鈍らせた。|拒み続ければ、二人とも出られない。{b}の抵抗が弱まったのは、そのせいだった。'),
    heat: L('{b}の体にも媚薬が回っていて、突き放そうとする腕に力が入らなかった。|媚薬の熱が、{b}の拒む声を内側から溶かしていた。'),
    hate: L('{b}は{a}を嫌っていた。それなのに、触れられた場所から熱が広がるのを止められなかった。|嫌いな相手のはずだった。嫌いだからこそ、負けたくなくて、{b}は目を逸らせなかった。'),
    time: L('時間切れが迫るなか、{b}の抵抗は少しずつ言葉だけになっていった。|{b}にも、もう時間がないことは分かっていた。'),
    bound: L('縛られた手首では、{b}にはもう押し返すこともできなかった。|手首の自由を奪われて、{b}にできるのは睨むことだけだった。'),
    rank: L('{a}の命令に逆らうことは、{b}の体に染みついた習いが許さなかった。|主の言葉は、この部屋でも重かった。')
  };
  /* ---------- 二度目からの理由 ---------- */
  T.AGAIN = {
    left: L('扉の紙の数字は、まだ{left}回分残っていた。|一度では、扉は開かなかった。数字はまだ{left}回分残っている。|条件の回数は、まだ足りていなかった。あと{left}回。'),
    done: L('条件は、もう満たしていた。|扉はとうに条件を数え終えていた。それでも、離れようとする者はいなかった。|もう数える必要はなかった。数えていたのは、本人たちの方だった。'),
    heat: L('一度果てても、媚薬の熱は引いていなかった。|熱は引くどころか、さっきより強くなっていた。'),
    cont: L('さっきの余韻が、まだ二人の間に残っていた。|一度越えた線は、もう線に見えなかった。|一度目のぎこちなさは、もうどこにもなかった。'),
    other: L('{a}にとって、この部屋でさっきとは別の相手だった。|{a}は、ついさっきまで別の相手といた。それを{b}も知っていた。')
  };
  /* ---------- 三人 ---------- */
  T.TRIO = {
    rule: L('扉の紙が求めているのは、三人でのエッチだった。誰か一人を外すという選び方は、最初から許されていなかった。|「＠＠三人で」の条件は、{gn}の三人に重くのしかかっていた。二人ずつでは、扉は数えてくれない。'),
    clause: L('扉の紙の但し書きによれば、三人で同時に済ませれば、全員の分に数えられる。|二人ずつ順番に済ませるより、三人一度の方が早い。そう計算したのは一人ではなかった。|但し書きの一行が、三人の選択肢を一つに絞っていた。'),
    jeal: L('{h}を誰か一人に任せることを、残りの二人がどちらも譲らなかった。|取り合いに決着はつかなかった。だったら三人で、という話になるまで、そう時間はかからなかった。|どちらか一人を選べば、もう一人が残される。それが分かっていて、{h}には選べなかった。'),
    lovers: L('恋人どうしの二人は、取り残されそうな{c}を放っておけなかった。|二人だけで出ていくことは、恋人どうしの二人にはできなかった。残る{c}の顔を、見てしまったからだ。'),
    hub: L('{h}だけが、残りの二人のどちらとも向き合える。三人になるなら、真ん中は{h}しかいなかった。|残りの二人は、互いに触れ合う間柄ではなかった。二人をつなげるのは、{h}だけだった。'),
    heat: L('媚薬は三人全員に回っていて、誰か一人だけを選ぶ余裕は、もう誰にも残っていなかった。|三人とも、媚薬の熱を持て余していた。'),
    time: L('残り時間を考えれば、二人ずつ順番を待つ余裕はなかった。|時間切れが迫るなか、三人で済ませる以外の道は、もう残っていなかった。'),
    eager: L('{gn}の三人は、もともとこういうことに物怖じしない性分だった。|三人とも、条件そのものにはさほど抵抗がなかった。ためらう理由は、むしろ順番の方にあった。'),
    grudge: L('三人の中には、互いに反りの合わない者どうしもいた。それでも、条件の前では誰も外れられなかった。|張りつめた空気は消えないまま、三人は条件の前に並んでいた。'),
    again: L('一度目で、三人のぎこちなさはだいぶほどけていた。|三人とも、一度目の熱がまだ引いていなかった。|もう一度、と誰かが言い出すのを、三人ともどこかで待っていた。')
  };
  /* 三人の前振りの締め（言い出すのは場面の側の導入なので、その手前で止める） */
  T.TRIO_END = L('あとは、誰が最初に口に出すかだけだった。|三人とも、同じことを考えているのは分かっていた。|誰がそれを言い出すのか、三人とも互いの顔をうかがっていた。');
  /* こじれた三人（不仲の攻め{k}・片想いの攻め{c}・受け{u}）：導入の型 A1〜A5 が詳しいので、短く */
  T.RIVAL = L('{u}をめぐって、{k}と{c}の間の空気は、閉じ込められてからずっと張りつめていた。|{k}は{u}と反りが合わず、{c}は{u}を想っていた。その三人が、同じ条件の前に並んでいた。|{u}を想う{c}と、{u}を疎む{k}。噛み合わない三人の誰も、条件からは逃げられなかった。');
  T.RIVAL2 = L('残り時間が、三人から選ぶ余地を奪っていた。|誰がどう動くかで、この先が決まりそうだった。|先に口を開いたのが誰だったかで、この夜の形が決まった。');
  /* ---------- みんなで ---------- */
  T.GROUP = L('部屋の空気は、もう誰か一人を選ぶような段階を通り過ぎていた。|{gn}は、この部屋の中でも特に、条件に抵抗のない顔ぶれだった。|全員がいずれ条件を満たさなければならないなら、順番を待つ理由はない。そう考えたのは一人ではなかった。|二人ずつ組を決めようとするたびに、誰かがあぶれた。それなら、いっそ全員で、という空気になった。');
  T.GROUP2 = L('あとは、誰が最初に口に出すかだけだった。|全員が、誰かが言い出すのを待っているような空気だった。|誰が言い出しても、反対する者はいなさそうだった。');
  /* ---------- 合意のない場面ごとの主因 ---------- */
  T.FORCE = {
    hate: L('{a}と{b}は、この部屋に来る前から互いを嫌っていた。けれど、扉の紙は二人の事情など聞いてくれなかった。|顔を見るのも嫌な相手と、扉の紙は二人を組ませた。|嫌悪と、閉じ込められた苛立ちと、出たいという焦りが、{a}の中で一つになっていた。'),
    hateAgain: L('条件はもう満たしていた。それでも、嫌悪と欲がもつれたまま、二人はまた向き合っていた。|一度で終わるはずの関係だった。終わらせられなかったのは、どちらの方だったのか。'),
    hateLove: L('{a}は{b}を嫌っていた。同じくらい、誰にも渡したくなかった。|憎いのか欲しいのか、{a}自身にももう分からなかった。'),
    mr: L('主従という線の内側で、{a}の中に積もったものは、もう抑えきれなくなっていた。|命じられることに慣れた{a}の中で、何かが静かに切れていた。'),
    mr2: L('閉じた部屋は、それを外へ逃がす最後の理由を奪っていた。|主である{b}が、この部屋ではただの一人だった。'),
    aforce: L('{a}の体を焼く媚薬は、理性で抑えられる量をとうに超えていた。|媚薬が回りきった{a}の目には、もう{b}しか映っていなかった。'),
    aforce2: L('飲んだ本数を数えるのは、とうにやめていた。|理性で踏みとどまれる時間は、もうとっくに過ぎていた。'),
    aforce3: L('周りの誰も、{a}の目つきが変わったことに気づいていなかった。|{b}がそばにいたのは、ただの偶然だった。'),
    speed: L('{a}にとって、条件は早く片付けるべき作業でしかなかった。|{a}は、話し合いに時間を使うつもりが最初からなかった。|{a}の頭の中では、出るまでの段取りがとっくに組み上がっていた。'),
    speed2: L('{b}は、{a}がそこまで思い切るとは考えていなかった。|{a}が何を考えているのか、{b}はまだ気づいていなかった。|相手の気持ちを確かめる手間を、{a}は最初から省くつもりだった。'),
    dark: L('{a}は、自分と同じ顔をした{b}が追い詰められていくのを、ずっと待っていた。|闇に堕ちた{a}にとって、同じ顔の{b}は、壊してみたいもう一人の自分だった。'),
    ntr: L('{a}にとって、{c}を奪うことは、同じ顔の{b}を傷つけるいちばんの方法だった。|{c}が{b}を想っていることを、{a}は知っていた。だから、{b}と同じ顔で近づいた。'),
    oforce: L('主従の二人を、部屋は容赦なく閉じ込めていた。|この部屋で、{a}の言葉は命令の重さを持っていた。|主である{a}が一度決めたことを、覆せた例しはなかった。')
  };
  /* ---------- 愛憎の二人のふつうの夜（表の顔ごと。{a}＝愛憎を持つ側。2026-10-29） ---------- */
  T.LHF = {
    hate: L('{a}は{b}を嫌っていた。同じくらい、誰にも渡したくなかった。|憎いのか欲しいのか、{a}自身にももう分からなかった。'),
    love: L('{a}と{b}は、顔を合わせれば喧嘩ばかりしていた。喧嘩の数だけ、{a}は{b}から目を離せなくなっていた。|{a}は、{b}の前でだけはどうしても素直になれなかった。言えなかった言葉の分だけ、熱だけが溜まっていた。'),
    peer: L('{a}は、{b}と張り合うことでしか、{b}のそばにいる理由を作れずにいた。その理由が、もう足りなくなっていた。|負けたくないのか、離れたくないのか、{a}にももう分からなかった。')
  };
  /* ---------- 関係ごとの夜・命令の夜（場面に詳しい導入があるので短く） ---------- */
  T.TIE = {
    order: L('{a}と{b}は主従だった。この部屋でも、その形は崩れなかった。|命じる側と従う側。白い部屋の中でも、二人の立ち位置は変わらなかった。'),
    family: L('{a}と{b}は家族だった。越えてはいけない線だと、二人とも知っていた。それでも、閉じた部屋の中で、その線は少しずつ細くなっていた。|家族という間柄が、何度も二人の足を止めた。その足が止まらなくなったのは、いつからだったか。'),
    shy: L('想い合う二人にとって、困るのは相手ではなく場所の方だった。|恋人どうしでも、見知らぬ白い部屋で、というのは別の話だった。')
  };
  /* 気持ちの一文（関係ごとの夜・命令の夜） */
  T.FEEL = {
    mutual: L('互いに意識していることは、もう隠しようがなかった。|二人とも、相手の視線に気づかないふりをするのに疲れていた。'),
    one: L('{a}の視線は、さっきから{b}から離れなかった。|{a}の方は、とうに気持ちが決まっていた。'),
    none: L('気持ちの整理は、まだついていなかった。|これが正しいのかどうか、二人ともまだ分からずにいた。')
  };
  /* ---------- 「一人だけ」を取り戻す（solo-room-jealous.js） ---------- */
  T.JEAL = L('{a}は、この部屋で{b}を「＠＠一人だけ」の相手と決めていた。|{a}にとって、{b}はこの部屋でただ一人の相手のはずだった。');
  T.JEAL2 = L('取られたくない、という気持ちが、条件よりも先に立っていた。|嫉妬は、閉じた部屋の中では逃げ場がなかった。|{a}は、自分で思っていたよりずっと、{b}に執着していた。');
  /* ---------- 罰ゲーム（room-games.js） ---------- */
  T.GAME = L('罰ゲームの決まりは、扉の条件をもう一回、だった。|ゲームの負けは負けだった。決まりを言い出した手前、誰も文句は言えなかった。');
  /* ---------- 最後の三人（扉が開いた直後。room-last3-r18.js）：場面の導入が扉と気持ちを書くので、前振りは「三人がどう一緒に出ることになったか」と三人の間柄と時間 ---------- */
  T.LAST1 = L('条件を満たしたとき、扉の前にいたのは{gn}の三人だった。|{gn}の三人は、同じ扉から一緒に外へ出ることになった。|最後に条件がそろって、{gn}の三人が同じ扉をくぐれることになった。');
  T.LASTREL = {
    love: L('{x}と{y}は、この部屋に来る前からの恋人どうしだった。|三人の中には、恋人どうしの二人がいた。'),
    body: L('{x}と{y}は、この部屋でもう肌を重ねた仲だった。|この部屋で過ごした夜を、三人のうち二人はもう知っていた。'),
    hate: L('{x}と{y}の間には、最後まで張りつめたものが残っていた。|三人の中には、とうとう最後まで打ち解けなかった二人がいた。'),
    warm: L('この部屋で過ごすうちに、三人はすっかり打ち解けていた。|閉じ込められているあいだ、三人は何度も互いに助けられていた。'),
    none: L('三人とも、互いのことはほとんど何も知らなかった。|この部屋に来るまで、三人は名前も知らない間柄だった。')
  };
  T.LASTT = L('閉じ込められてから、{el}が経っていた。長かったのか短かったのか、誰にも分からなかった。|あと少し遅ければ、時間切れになるところだった。|この部屋で過ごした{el}が、三人の間に何かを残していた。');

  /* ---------- 言い出した人の一言（態度9種。3本「くだけた常体｜硬い常体｜敬語」。話し手は {a}） ---------- */
  var Q = T.Q = {};
  /* go：気持ちから・言い出す */
  Q.go = {
    proud: L('「ぐずぐずしてても出られないでしょ。……私が相手なら、文句はないよね｜ぐずぐずしていても出られない。……私が相手なら、文句はないだろう｜ぐずぐずしていても出られませんよ。……私が相手なら、文句はありませんね」'),
    stern: L('「覚悟は決めた。あなたも、決めて｜覚悟は決めた。あなたも決めろ｜覚悟は決めました。あなたも、決めてください」'),
    tsun: L('「べ、別にあなたとしたいわけじゃないから。出るためだからね｜べ、別にあなたとしたいわけではない。出るためだ｜べ、別にあなたとしたいわけじゃありません。出るためですからね」'),
    gentle: L('「無理はしなくていいからね。……でも、私はあなたがいい｜無理はしなくていい。……だが、私はあなたがいい｜無理はなさらなくていいですからね。……でも、私はあなたがいいです」'),
    devoted: L('「あなたが嫌じゃなければ……私、あなたとなら平気だよ｜あなたが嫌でなければ……私は、あなたとなら平気だ｜あなたが嫌じゃなければ……私、あなたとなら平気です」'),
    cool: L('「条件は一つ。相手があなたなら、悪くない選択だと思う｜条件は一つだ。相手があなたなら、悪くない選択だと思う｜条件は一つです。相手があなたなら、悪くない選択だと思います」'),
    free: L('「ねえ、どうせなら楽しんじゃおうよ｜どうせなら、楽しんでしまおう｜どうせなら、楽しんでしまいましょうよ」'),
    shy: L('「あ、あの……私で、いいなら……｜あ、あの……私で、いいなら……｜あ、あの……私で、よければ……」'),
    polite: L('「こういう形になっちゃったけど……あなたとなら、構わないよ｜こういう形になってしまったが……あなたとなら、構わない｜こういう形になってしまいましたけど……あなたとなら、構いません」')
  };
  /* dry：割り切り・諦め */
  Q.dry = {
    proud: L('「さっさと済ませよう。長引かせる気はないから｜さっさと済ませるぞ。長引かせる気はない｜さっさと済ませましょう。長引かせる気はありませんから」'),
    stern: L('「必要なことをするだけ。それ以上でも以下でもない｜必要なことをするだけだ。それ以上でも以下でもない｜必要なことをするだけです。それ以上でも以下でもありません」'),
    tsun: L('「勘違いしないでよ。これは条件のためなんだから｜勘違いするな。これは条件のためだ｜勘違いしないでくださいね。これは条件のためですから」'),
    gentle: L('「ごめんね、こんな形で。……すぐ終わらせるから｜すまない、こんな形で。……すぐ終わらせる｜ごめんなさい、こんな形で。……すぐ終わらせますから」'),
    devoted: L('「私のことは気にしないで。あなたが出られれば、それでいいから｜私のことは気にするな。あなたが出られれば、それでいい｜私のことは気にしないでください。あなたが出られれば、それでいいんです」'),
    cool: L('「感情は抜きにしよう。お互い、出るための手段だと思えばいい｜感情は抜きにしよう。互いに、出るための手段だと思えばいい｜感情は抜きにしましょう。お互い、出るための手段だと思えばいいんです」'),
    free: L('「まあ、減るもんじゃないし。さくっと終わらせよ｜まあ、減るものでもない。さっと終わらせよう｜まあ、減るものでもありませんし。さっと終わらせましょう」'),
    shy: L('「み、見ないで……電気、消してもいい……？｜み、見ないでくれ……灯りを消してもいいか……？｜み、見ないでください……電気、消してもいいですか……？」'),
    polite: L('「お互い、割り切ろう。それがいちばんだと思う｜互いに割り切ろう。それがいちばんだと思う｜お互い、割り切りましょう。それがいちばんだと思いますので」')
  };
  /* push：押し切る（合意のない場面・スピード型） */
  Q.push = {
    proud: L('「嫌がっても無駄だよ。この部屋じゃ、私の方が強いんだから｜嫌がっても無駄だ。この部屋では、私の方が強い｜嫌がっても無駄ですよ。この部屋では、私の方が強いんですから」'),
    stern: L('「抵抗するな、とは言わない。ただ、結果は変わらない｜抵抗するな、とは言わない。だが、結果は変わらない｜抵抗するな、とは言いません。ただ、結果は変わりません」'),
    tsun: L('「あ、あなたが素直に頷かないのが悪いんだからね｜あ、あなたが素直に頷かないのが悪いんだ｜あ、あなたが素直に頷かないのが悪いんですからね」'),
    gentle: L('「ごめんね。でも、もう待ってあげられない｜すまない。だが、もう待ってやれない｜ごめんなさい。でも、もう待ってあげられません」'),
    devoted: L('「恨んでいいよ。それでも、あなたをここから出したいの｜恨んでいい。それでも、あなたをここから出したい｜恨んでくださって構いません。それでも、あなたをここから出したいんです」'),
    cool: L('「話し合いの段階は終わった。あとは条件を満たすだけ｜話し合いの段階は終わった。あとは条件を満たすだけだ｜話し合いの段階は終わりました。あとは条件を満たすだけです」'),
    free: L('「逃げたって、この部屋のどこにも行けないよ？｜逃げても、この部屋のどこにも行けないぞ？｜逃げても、この部屋のどこにも行けませんよ？」'),
    shy: L('「ご、ごめん……でも、もう、止まれない……｜す、すまない……だが、もう止まれない……｜ご、ごめんなさい……でも、もう、止まれないんです……」'),
    polite: L('「悪いけど、今回は聞いてあげられないんだ｜すまないが、今回は聞いてやれない｜申し訳ありませんが、今回は聞いて差し上げられません」')
  };
  /* heat：媚薬の熱 */
  Q.heat = {
    proud: L('「……熱い。あなたのせいだからね、責任取ってよ｜……熱い。あなたのせいだ、責任を取れ｜……熱いです。あなたのせいですからね、責任を取ってください」'),
    stern: L('「……ごめん、もう抑えが利かない｜……すまない、もう抑えが利かない｜……すみません、もう抑えが利きません」'),
    tsun: L('「み、見ないでよ……こんなの、薬のせいなんだから｜み、見るな……こんなもの、薬のせいだ｜み、見ないでください……こんなの、薬のせいなんですから」'),
    gentle: L('「ねえ……少しだけ、そばに来てくれる？｜……少しだけ、そばに来てくれるか？｜あの……少しだけ、そばに来てくれますか？」'),
    devoted: L('「ごめんね、私……あなたのことしか考えられない｜すまない、私は……あなたのことしか考えられない｜ごめんなさい、私……あなたのことしか考えられないんです」'),
    cool: L('「薬のせいだって分かってる。分かってても、止められそうにない｜薬の作用だと分かっている。分かっていても、止められそうにない｜薬の作用だと分かっています。分かっていても、止められそうにありません」'),
    free: L('「もう我慢とか、無理。ね、いいでしょ？｜もう我慢は無理だ。……いいだろう？｜もう我慢なんて無理です。……いいですよね？」'),
    shy: L('「からだ、変……たすけて……｜体が、おかしい……助けてくれ……｜体が、変なんです……助けてください……」'),
    polite: L('「みっともないところを見せて……でも、もう限界みたい｜見苦しいところを見せて……だが、もう限界らしい｜お見苦しいところを……でも、もう限界みたいです」')
  };
  /* again：二度目 */
  Q.again = {
    proud: L('「まだ足りないんでしょ。顔に書いてあるよ｜まだ足りないのだろう。顔に書いてある｜まだ足りないのでしょう。顔に書いてありますよ」'),
    stern: L('「まだ終わりじゃない。もう一度｜まだ終わりではない。もう一度だ｜まだ終わりではありません。もう一度です」'),
    tsun: L('「も、もう一回だけだからね。……ほんとに、一回だけ｜も、もう一回だけだ。……本当に、一回だけだぞ｜も、もう一回だけですからね。……本当に、一回だけです」'),
    gentle: L('「疲れてない？　……もう少しだけ、いい？｜疲れていないか？　……もう少しだけ、いいか？｜疲れていませんか？　……もう少しだけ、いいですか？」'),
    devoted: L('「あなたがまだ欲しいなら、私はいくらでも｜あなたがまだ求めるなら、私はいくらでも応える｜あなたがまだ欲しいなら、私はいくらでも構いません」'),
    cool: L('「さっきので要領は分かった。次は、もっとうまくやれる｜＝｜さっきので要領は分かりました。次は、もっとうまくやれます」'),
    free: L('「もう一回しよ？　さっきの、すっごくよかったし｜もう一回しよう。さっきのは、すごくよかった｜もう一回しませんか？　さっきの、すごくよかったので」'),
    shy: L('「ま、また……するの……？　……うん、いいよ｜ま、また……するのか……？　……ああ、いい｜ま、また……するんですか……？　……はい、いいです」'),
    polite: L('「差し支えなければ、もう一度……お願いできるかな｜差し支えなければ、もう一度……頼めるか｜差し支えなければ、もう一度……お願いできますか」')
  };
  /* ======================= 部品 ======================= */
  function fresh(ctx, arr) {
    if (!arr || !arr.length) return '';
    var base = function (l) { return ctx.pick ? ctx.pick(l) : l[Math.floor(ctx.rng() * l.length)]; };
    return HK.Ero && HK.Ero.fresh ? HK.Ero.fresh(ctx, arr, base) : base(arr);
  }
  function hfmt(h) { h = Math.max(1, Math.round(h)); return h >= 24 ? Math.floor(h / 24) + '日' + (h % 24 ? 'と' + (h % 24) + '時間' : '') : h + '時間'; }
  function fill(s, m) {
    return String(s).replace(/\{(a|b|c|d|h|k|u|x|y|gn|n|left|el|hl)\}/g, function (z, k) {
      var v = m[k];
      if (v == null) return z;
      return typeof v === 'object' ? v.name : String(v);
    });
  }
  /* 文の数（「」の中は数えない） */
  function nSent(s) { return (String(s).replace(/「[^」]*」/g, '').match(/[。！？]/g) || []).length; }
  function rulesOf(ctx) { return Array.isArray(ctx.rules) ? ctx.rules : []; }
  function ruleOf(ctx, k) { return rulesOf(ctx).filter(function (r) { return r.k === k; })[0] || null; }
  /* 三人の場面でだけ数えるエッチの部屋（環境値 multi 'only'。scenario-room.js の HK.roomTrioOnly） */
  function onlyH(ctx) { return !!(HK.roomTrioOnly && HK.roomTrioOnly(ctx)) && !!ruleOf(ctx, 'h'); }
  function API() { return HK.RoomAPI; }
  /* 組の条件のエッチの数（三人以上は組ごとの最小） */
  function hCount(ctx, who) {
    var A = API(); if (!A || !A.prog || !ctx.flags || !ctx.flags.prog) return 0;
    var m = Infinity;
    for (var i = 0; i < who.length; i++) for (var j = i + 1; j < who.length; j++) m = Math.min(m, (A.prog(ctx, who[i], who[j]).act || {}).h || 0);
    return m === Infinity ? 0 : m;
  }
  function tie(ctx, a, b) { return HK.Ties && HK.Ties.get ? HK.Ties.get(ctx, a, b) : null; }
  function tieTy(ctx, a, b) { var t = tie(ctx, a, b); return t ? t.type : ''; }
  var LOVE_T = { lover: 1, spouse: 1, mate: 1, fated: 1 }, FAM_T = { sibling: 1, parent: 1, pparent: 1, sibprot: 1, sibclose: 1, sibbad: 1, stepsib: 1, relative: 1 };
  var HATE_T = { enemy: 1, rival: 1, bad: 1 }, RANK_T = { master: 1, boss: 1, teacher: 1, mentor: 1, senpai: 1 }, FRIEND_T = { friend: 1, best: 1, childhood: 1, classmate: 1, colleague: 1, buddy: 1, acq: 1, almost: 1 };
  function R(ctx, a, b) { return ctx.R ? ctx.R(a, b) : { att: 0, aff: 0, ten: 0 }; }
  function hateLv(ctx, a, b) { var H = HK.HateKit; return H && H.level ? Math.max(H.level(ctx, a, b), H.level(ctx, b, a)) : 0; }
  /* 二人の間柄：love／crushA（a→b）／crushB（b→a）／hate／family／rank／fwb／ex／obsess／friend／warm／stranger */
  /* 愛憎（HK.LoveHate）：持つ側を {a} にして表の顔の一文を出す（持たない組は何もしない）。kind：hate は強引な場面の文 T.FORCE.hateLove */
  function lhLine(ctx, a, b, P, m, mat, hateKind) {
    var LH = HK.LoveHate;
    if (!LH || !LH.any || !b || !LH.any(ctx, a, b)) return false;
    var x = LH.has(ctx, a, b) ? a : b, y = x === a ? b : a, fc = LH.face ? LH.face(ctx, x, y) : 'hate';
    var tab = hateKind ? T.FORCE.hateLove : (T.LHF[fc] || (fc === 'kin' ? null : T.LHF.hate));
    if (!tab) return false;
    var ma = m.a, mb = m.b;
    m.a = x; m.b = y; P(tab); m.a = ma; m.b = mb;
    mat.push('愛憎（' + x.name + '→' + y.name + (LH.has(ctx, y, x) ? '・双方' : '') + '、表の顔：' + ((LH.FACE_JA && LH.FACE_JA[fc]) || fc) + '）');
    return true;
  }
  function relKey(ctx, a, b) {
    var ty = tieTy(ctx, a, b), ab = R(ctx, a, b), ba = R(ctx, b, a);
    if (FAM_T[ty]) return 'family';
    if (LOVE_T[ty] || (ctx.pair && ctx.pair(a, b).couple)) return 'love';
    if (ty === 'yan' || ty === 'worship') return 'obsess';
    if (HATE_T[ty] || hateLv(ctx, a, b) >= 35) return 'hate';
    if (ty === 'fwb') return 'fwb';
    if (ty === 'ex') return 'ex';
    if (ty === 'crush' || ty === 'honmei') { var t = tie(ctx, a, b); return t && ctx.chars && ctx.chars[t.a] === b ? 'crushB' : 'crushA'; }
    if (ab.att >= 45 && ba.att < 25) return 'crushA';
    if (ba.att >= 45 && ab.att < 25) return 'crushB';
    if (ab.att >= 40 && ba.att >= 40) return 'warm';
    if (RANK_T[ty]) return 'rank';
    if (FRIEND_T[ty]) return 'friend';
    if (!ty && Math.abs(ab.aff) < 20 && ab.att < 25 && ba.att < 25) return 'stranger';
    return ab.aff + ba.aff >= 40 ? 'warm' : 'stranger';
  }
  var REL_JA = { love: '恋人', warm: '惹かれ合う', crushA: '片想い', crushB: '片想い（相手から）', stranger: '初対面', friend: '友人', fwb: 'セフレ', ex: '元恋人', hate: '不仲', family: '家族', rank: '立場の上下', obsess: '執着' };
  function relJa(k) { return REL_JA[k] || k; }
  function heatOf(c) { return (c && c.flags && (c.flags.aphro || 0)) + (c && c.flags && c.flags.pillfx === 'heat' ? 1.5 : 0); }
  function timeKey(ctx) {
    var si = ctx.stepIndex || 0, n = Math.max(2, ctx.stepsTotal || 2), H = +(ctx.env && ctx.env.hours) || 0, sh = ctx.stepH || 1;
    var el = si * sh, left = H ? Math.max(0, H - el) : 0, fr = si / (n - 1);
    var k = si >= n - 1 ? 'last' : fr >= 0.67 || (H && left <= 3) ? 'late' : fr < 0.34 ? 'early' : 'mid';
    return { k: k, el: hfmt(Math.max(1, el)), hl: hfmt(Math.max(1, left)) };
  }
  function flavorOf(ctx, top, bot) {
    var F = HK.EroFlavor;
    if (!F || !F.of || !top || !bot) return 'sweet';
    try { return F.of(ctx, top, bot) || 'sweet'; } catch (e) { return 'sweet'; }
  }
  function openOf(ctx, c) { var T3 = HK.RoomTrio; return T3 && T3.openOf && ctx.stat ? T3.openOf(ctx, c) : 'mid'; }

  /* 場面の頭（既存の導入）にもう出ている言い回しの鍵：前振りの候補から、同じ鍵の文を外す（残らなければ元の候補から） */
  var KW = ['早い', '早く', '但し書き', 'もう一回', 'もう一度', '二回目', '二度目', '出るため', '条件だから', '照明', '電気', '一人きり', 'みんなで', '全員', '時間がない', '時間切れ', '残り時間',
    '何も言わずに', '覚悟', '順番', '見ないで', '背中合わせ', '黙って', '扉の紙', '夜の色', 'びくともし', '名前しか知らない', '外の空気', '抑えが利かない', '我慢', '一人だけ', '置いていく', '選べ', '開かな'];
  function keysOf(t) { return KW.filter(function (k) { return t.indexOf(k) >= 0; }); }
  /* 出られない部屋の「はじめてのエッチの前置き」（scenario-room.js の ACT_TEXT.h：仕方なくなら必ず、望んでなら半分）が場面の頭にあるか */
  function actIntro(head) {
    var A = API(), T0 = A && A.ACT_TEXT && A.ACT_TEXT.h;
    if (!T0 || !head) return false;
    return ['will', 'des'].some(function (k) {
      return (T0[k] || []).some(function (l) {
        var f = String(l).replace(/――.*$/, '').split(/\{[a-z]+\}/).sort(function (x, y) { return y.length - x.length; })[0] || '';
        return f.length >= 6 && head.indexOf(f) >= 0;
      });
    });
  }
  SL.actIntro = actIntro;

  /* ======================= 前振りを組み立てる =======================
     o = { who: [言い出した人, 相手, …], kind, mode, ev, fl, rv, hub, trio, lastRel, shy, actIntro, head（場面の頭の文。重ならないように見る）, again: { n, other } }
     kind：lhurge（愛憎の衝動で手を出す）／pair（二人の夜）／trio／rival（こじれた三人）／group（みんなで）／last（最後の三人）／hate／mr（従が主に）／aforce（媚薬で押し倒す）／speed／dark／ntr／oforce（命令でねじ伏せる）／
           order（命令の夜）／family（家族の立場）／tie（関係ごとの夜）／jealous（「一人だけ」を取り戻す）／game（罰ゲーム）
     返す：{ text, why } */
  SL.text = function (ctx, o) {
    if (HK.SAFE_ON || !ctx || !o || !o.who || o.who.length < 1) return null;
    var who = o.who, a = who[0], b = who[1] || null, c = who[2] || null, d = who[3] || null;
    var m = { a: a, b: b, c: c, d: d, gn: who.map(function (x) { return x.name; }).join('・') };
    var tk = timeKey(ctx); m.el = tk.el; m.hl = tk.hl;
    var hR = ruleOf(ctx, 'h'), aR = ruleOf(ctx, 'aphro'), cnt = hCount(ctx, who), ag = o.again || { n: 0 };
    /* この顔ぶれに、条件のエッチがまだ残っているか（場面の前に数えた分は戻して見る） */
    var hLeft = !!hR && cnt <= hR.n && !(o.mode === 'done');
    /* 数えない場面（命令でねじ伏せる・従が主に・闇に堕ちた自分）は、いまの組の条件が済んでいるかで見る */
    if (hR && b && /^(oforce|mr|dark)$/.test(o.kind || '') && API() && API().ruleDone) hLeft = !API().ruleDone(ctx, hR, a, b);
    m.n = hR ? hR.n : 1;
    var leftN = hR ? Math.max(1, hR.n - cnt + 1) : 0;
    m.left = leftN;
    var head = String(o.head || ''), hk = keysOf(head), out = [], mat = [];
    var noDup = function (arr) { var f = hk.length ? arr.filter(function (l) { return !hk.some(function (k) { return l.indexOf(k) >= 0; }); }) : arr; return f.length ? f : arr; };
    var P = function (arr) {
      if (!arr || !arr.length) return '';
      var s = fresh(ctx, noDup(arr));
      if (s) out.push(fill(s, m));
      return s;
    };
    var kind = o.kind || 'pair', qk = '';
    var heat = Math.max.apply(null, who.map(heatOf)), drunk = Math.max.apply(null, who.map(function (x) { return (x.flags && x.flags.drunk) || 0; }));
    var press = +(ctx.env && ctx.env.pressure) || 0;
    function sitFirst() {
      if (ctx.flags && ctx.flags.oneCond && ctx.rng() < 0.6) { P(T.SIT.one); mat.push('一人しか出られない'); return; }
      if (ctx.env && ctx.env.allout === 'on' && who.length === 2 && ctx.rng() < 0.4) { P(T.SIT.allout); mat.push('全員で出られる'); return; }
      if (hR) { P(hR.n > 1 ? T.SIT.hn : T.SIT.h1); mat.push('条件のエッチ' + (hR.n > 1 ? hR.n + '回' : '')); return; }
      if (aR) { P(T.SIT.aphro); mat.push('条件の媚薬' + aR.n + '本'); return; }
      P(T.SIT.night); mat.push('条件のためではない夜');
    }
    function timeS() { P(T.TIME[tk.k]); mat.push('時間：' + { early: 'まだ序盤', mid: tk.el + '経過', late: '残り' + tk.hl, last: '限界の直前' }[tk.k]); }
    /* 二度目：条件の回数が残る／もう満たした ＋（二人なら）熱・続き・別の相手 */
    function againS(trio) {
      if (hR && leftN >= 1 && o.mode !== 'done' && cnt <= hR.n) { P(T.AGAIN.left); mat.push('二度目：条件の回数が残る（あと' + leftN + '回）'); }
      else { P(T.AGAIN.done); mat.push('二度目：条件はもう満たした'); }
      if (trio) { P(T.TRIO.again); mat.push('三人の二度目'); return; }
      if (ag.other) { P(T.AGAIN.other); mat.push('さっきとは別の相手'); }
      else if (heat >= 2) { P(T.AGAIN.heat); mat.push('熱が引かない'); }
      else { P(T.AGAIN.cont); mat.push('さっきの続き'); }
    }
    function quote(k, p) {
      var tab = Q[k]; if (!tab || !a) return;
      if (p != null && ctx.rng() >= p) return;
      var l = fresh(ctx, noDup(tab[ps(a)] || tab.gentle));
      if (l) { out.push(a.name + fill(l, m)); mat.push(a.name + 'の一言（' + PS_JA[ps(a)] + '）'); }
    }
    function feelS(x, y) {
      if (heat >= 2) { P(T.CAUSE.heat); mat.push('媚薬の熱'); return; }
      var ab = R(ctx, x, y).att, ba = R(ctx, y, x).att;
      if (ab >= 40 && ba >= 40) { P(T.FEEL.mutual); mat.push('惹かれ合う'); }
      else if (ab >= 40) { P(T.FEEL.one); mat.push(x.name + 'の惹かれ'); }
      else { P(T.FEEL.none); mat.push('気持ちは未整理'); }
    }
    var first = !(ag.n > 0);
    if (kind === 'trio' || kind === 'rival') {
      /* ---------- 三人（言い出す一言は場面の側の導入なので、前振りは理由まで） ---------- */
      if (kind === 'rival' && o.rv) {
        m.k = o.rv.k; m.c = o.rv.c; m.u = o.rv.u;
        if (!first) againS(true); else if (onlyH(ctx)) { P(T.SIT.trio3); mat.push('三人の場面でだけ数える部屋'); } else sitFirst();
        P(T.RIVAL); P(T.RIVAL2); mat.push('こじれた三人（' + o.rv.k.name + 'と' + o.rv.u.name + 'は不仲・' + o.rv.c.name + 'は' + o.rv.u.name + 'を想う）');
      } else if (!first) againS(true);
      else {
        var tr = o.trio || {};
        if (onlyH(ctx)) { P(T.TRIO.rule); mat.push('三人の場面でだけ数える部屋'); }
        else { sitFirst(); if (ctx.env && (ctx.env.multi || 'open') !== 'no') { P(T.TRIO.clause); mat.push('但し書き：三人以上で同時なら全員分'); } }
        if (tr.lovers) { m.c = tr.lovers; P(T.TRIO.lovers); mat.push('恋人どうしが一人を迎える'); }
        else if (tr.jeal) { m.h = tr.jeal; P(T.TRIO.jeal); mat.push('取り合いの決着'); }
        else if (o.hub) { m.h = o.hub; P(T.TRIO.hub); mat.push(o.hub.name + 'が真ん中'); }
        else if (heat >= 2 || o.ev === 'trio_heat') { P(T.TRIO.heat); mat.push('媚薬の熱'); }
        else if (tr.grudge) { P(T.TRIO.grudge); mat.push('不仲の割り切り'); }
        else if (tk.k === 'late' || tk.k === 'last') { P(T.TRIO.time); mat.push('時間切れが近い'); }
        else { P(T.TRIO.eager); mat.push('三人とも物怖じしない'); }
        if (nSent(out.join('')) < 4) P(T.TRIO_END);
      }
    } else if (kind === 'group') {
      /* ---------- みんなで（言い出す一言は場面の側） ---------- */
      sitFirst(); P(T.GROUP); mat.push('みんなで（' + who.length + '人）');
      if (heat >= 2) { P(T.CAUSE.heat); mat.push('媚薬の熱'); } else if (press >= 70) { P(T.PRESS); mat.push('部屋の圧'); } else timeS();
      P(T.GROUP2);
    } else if (kind === 'last') {
      /* ---------- 最後の三人（扉が開いた直後）：場面の導入が扉と気持ちを書くので、三人がどう一緒に出ることになったか・間柄・時間 ---------- */
      var lr = o.lastRel || { k: 'none' };
      m.x = lr.x || b; m.y = lr.y || c;
      P(T.LAST1); P(T.LASTREL[lr.k] || T.LASTREL.none); P(T.LASTT);
      mat.push('最後の三人（' + ({ love: '恋人どうしがいる', warm: '仲のよい三人', body: '夜を過ごした二人がいる', hate: '張りつめた二人がいる', none: 'ほとんど知らない三人' }[lr.k] || '') + '）');
    } else if (kind === 'hate' || kind === 'mr' || kind === 'aforce' || kind === 'speed' || kind === 'dark' || kind === 'ntr' || kind === 'oforce') {
      /* ---------- 合意のない場面・押し切る場面：なぜ抵抗が通らなかったか ---------- */
      if (kind === 'ntr') { m.c = who[2] || null; m.b = who[1]; }
      var tgt = kind === 'ntr' ? (who[2] || b) : b, again2 = !first || o.mode === 'done', pr = '';
      if (kind === 'hate') {
        if (again2) { P(T.FORCE.hateAgain); mat.push('腐れ縁の二度目'); }
        else { sitFirst(); if (!lhLine(ctx, a, b, P, m, mat, true)) P(T.FORCE.hate); mat.push('敵対（嫌悪 ' + Math.round(hateLv(ctx, a, b)) + '）'); }
        quote('push', 0.55);
        pr = heatOf(tgt) >= 2 ? 'heat' : ctx.rng() < 0.55 ? 'hate' : !again2 && hLeft && (tk.k === 'late' || tk.k === 'last') ? 'time' : !again2 && hLeft && ctx.rng() < 0.5 ? 'cond' : 'power';
      } else if (kind === 'oforce') {
        P(T.FORCE.oforce); mat.push('主従の命令'); timeS();
        pr = heatOf(tgt) >= 2 ? 'heat' : hLeft && (tk.k === 'late' || tk.k === 'last') ? 'time' : hLeft && ctx.rng() < 0.5 ? 'cond' : 'power';
      } else if (kind === 'mr') {
        P(T.FORCE.mr); P(T.FORCE.mr2); mat.push('従が主に');
        pr = heatOf(tgt) >= 2 ? 'heat' : 'power';
      } else if (kind === 'aforce') { P(T.FORCE.aforce); P(T.FORCE.aforce2); P(T.FORCE.aforce3); mat.push('媚薬（' + Math.round(heat) + '）'); }
      else if (kind === 'speed') { sitFirst(); P(T.FORCE.speed); P(T.FORCE.speed2); mat.push(a.name + 'のスピード型'); }
      else if (kind === 'dark') {
        P(T.FORCE.dark); mat.push('闇に堕ちた自分'); timeS(); quote('push', 0.5);
        pr = heatOf(tgt) >= 2 ? 'heat' : 'power';
      } else { P(T.FORCE.ntr); mat.push('闇に堕ちた自分の寝取り'); timeS(); }
      if (pr) { m.b = tgt; P(T.PUSH[pr]); mat.push('抵抗が通らなかった：' + { power: '力の差', cond: '条件', heat: '媚薬', hate: '嫌悪と欲', time: '時間' }[pr]); }
    } else if (kind === 'lhurge') {
      /* ---------- 愛憎の「衝動で手を出す」（hate-love-more-r18.js の tie_lh_urge。きっかけの文はそちらの R.urgeLead） ---------- */
      var LR = HK.LoveHate && HK.LoveHate.R18, ul = LR && LR.urgeLead && b ? LR.urgeLead(ctx, a, b) : null;
      if (ul) { out.push(ul.text); mat.push(ul.why.replace(/^きっかけ：/, '')); } else { lhLine(ctx, a, b, P, m, mat, false); feelS(a, b); }
    } else if (kind === 'tie' || kind === 'order' || kind === 'family') {
      /* ---------- 関係ごとの夜・命令の夜・家族の立場：場面の頭に部屋の一文（条件の紙・夜・扉）と関係の導入があるので、関係・気持ち・時間だけ ---------- */
      if (!first) againS(false);
      else {
        if (kind === 'order') { P(T.TIE.order); mat.push('主従'); }
        else if (kind === 'family') { P(T.TIE.family); mat.push('家族（恋愛：あり）'); }
        else {
          var rk0 = relKey(ctx, a, b);
          if (rk0 === 'love' && o.shy) { P(T.TIE.shy); mat.push('恋人・場所に照れる'); }
          else { P(T.CAUSE[rk0] || T.CAUSE.warm); mat.push('間柄：' + relJa(rk0)); }
          lhLine(ctx, a, b, P, m, mat, false);
        }
        if (nSent(out.join('')) < 2) feelS(a, b);
        timeS();
      }
    } else if (kind === 'jealous' || kind === 'game') {
      if (!first) againS(false); else if (kind === 'game') { P(T.GAME); mat.push('罰ゲーム'); } else sitFirst();
      if (kind === 'jealous') { P(T.JEAL); P(T.JEAL2); mat.push('「一人だけ」の相手を取り戻す'); }
      else feelS(a, b);
    } else {
      /* ---------- 二人の夜（合意） ---------- */
      var od = HK.Pos && HK.Pos.order && b ? HK.Pos.order(a, b, [a, b]) : [a, b];
      var fl = o.fl || flavorOf(ctx, od[0], od[1]), intro = !!o.actIntro;
      if (!first) againS(false); else sitFirst();
      var rk = relKey(ctx, a, b), cause = o.mode === 'aphro' || heat >= 3 ? 'heat' : drunk >= 40 ? 'drunk' : o.mode === 'des' && rk !== 'love' ? 'despair' : rk;
      if (first || cause === 'heat') { P(T.CAUSE[cause] || T.CAUSE.warm); mat.push(cause === 'heat' ? '媚薬の熱（' + heat.toFixed(1) + '）' : cause === 'drunk' ? '酒の勢い' : cause === 'despair' ? '焦りと諦め' : '間柄：' + relJa(rk)); }
      /* 愛憎の二人は、恋愛系・対等系のふつうの夜にも愛憎の一文（2026-10-29） */
      if (first) lhLine(ctx, a, b, P, m, mat, false);
      if (o.mode === 'aphro') {
        /* 媚薬が回りきった二人（aphro_heat）：場面の頭に、手を伸ばす一文と台詞があるので、熱の様子だけ */
        P(T.FORCE.aforce2); mat.push('媚薬が回りきった');
      } else {
        if (first && cause !== rk && (rk === 'love' || rk === 'crushA' || rk === 'crushB' || rk === 'hate') && ctx.rng() < 0.5) { P(T.CAUSE[rk]); mat.push('間柄：' + relJa(rk)); }
        else if (first && (tk.k === 'late' || tk.k === 'last')) timeS();
        else if (first && press >= 70 && ctx.rng() < 0.5) { P(T.PRESS); mat.push('部屋の圧'); }
        if (intro) mat.push('はじめての前置きは場面の側');
        else {
          /* 言い出した一言（夜の色・合意の形で型を選ぶ）→ 決め手 */
          qk = !first ? 'again' : cause === 'heat' ? 'heat' : o.mode === 'des' || fl === 'dry' ? 'dry' : 'go';
          if (!(qk === 'again' && /もう一回|もう一度|二回目|二度目/.test(head))) quote(qk, first ? 0.6 : 0.45);
          if (o.mode === 'des' && fl === 'sweet') P(T.RESIGN); else P(T.DECIDE[fl] || T.DECIDE.sweet);
          mat.push('夜の色：' + ({ sweet: '甘め', dry: 'ドライ', deal: '駆け引き', rough: '荒め' }[fl] || fl));
          if (first && b && fl === 'sweet' && ctx.rng() < 0.4) { var op = openOf(ctx, b); P(T.OPENR[op]); mat.push(b.name + 'の開放度：' + { open: '開放的', mid: 'ふつう', shy: '照れ屋' }[op]); }
        }
      }
    }
    /* 地の文は 3 文以上（足りなければ時間・部屋の一文で補う） */
    var guard = 0;
    while (nSent(out.join('')) < 3 && guard++ < 3) { if (guard === 1 && !o.after) P(T.TIME[tk.k]); else P(T.PRESS); }
    var text = out.join('');
    if (BAN.test(text)) text = text.replace(BAN, '');   /* 念のため（表には書いていない） */
    return { text: text, why: 'きっかけ：' + mat.join('・'), mat: mat };
  };

  /* ======================= 出られない部屋への取り付け ======================= */
  function on(S) { return !!(S && S._slOn) && !HK.SAFE_ON; }
  /* 場面の文の切れ端（その文を含む記録を見つけるため。後から一部の文を差し替える入口があるので、何か所かから取る） */
  function probesOf(t) {
    t = String(t || '');
    var parts = t.split(/\n+/).filter(function (x) { return x.length >= 6; }), out = [];
    parts.forEach(function (p) {
      var n = p.length, w = Math.min(16, n);
      [0, Math.floor((n - w) / 2), n - w].forEach(function (i) { var s = p.substr(Math.max(0, i), w); if (s.length >= 6 && out.indexOf(s) < 0) out.push(s); });
    });
    return out.slice(0, 12);
  }
  function note(S, info) {
    if (!on(S)) return info;
    info.tok = S._ev || null;
    (S._slQ = S._slQ || []).push(info);
    return info;
  }
  SL.note = note;
  /* 場面の文の部品を包む（呼ばれた文を覚えておく。乱数は使わない） */
  function hookText(obj, key, mk) {
    if (!obj || typeof obj[key] !== 'function') return;
    HK.wrap(obj, key, function (f0) {
      var f = function () {
        var S = arguments[0], pre = on(S) ? mk.apply(null, arguments) : null;
        var r = f0.apply(this, arguments);
        if (pre) {
          var t = typeof r === 'string' ? r : r && typeof r.text === 'string' ? r.text : '';
          if (t) { pre.probes = probesOf(t); note(S, pre); }
        }
        return r;
      };
      f._sexLead = true;
      return f;
    });
  }
  function install() {
    /* 二人の夜（出られない部屋の行為・スピード型・媚薬・罰ゲーム・「一人だけ」） */
    hookText(HK.RoomLewd, 'scene', function (ctx, a, b, mode, opt) {
      var od = HK.Pos && HK.Pos.order ? HK.Pos.order(a, b, [a, b]) : [a, b];
      return { gen: 'pair', who: [a, b], mode: mode || '', tool: !!(opt && opt.toolText), fl: flavorOf(ctx, od[0], od[1]) };
    });
    /* 敵対の強引なエッチ */
    hookText(HK.HateSex, 'scene', function (ctx, a, b, opt) { return { gen: 'hate', who: [a, b], room: !!(opt && opt.room) }; });
    /* 関係のある二人（room-tie-r18.js） */
    hookText(HK.RoomTieSex, 'scene', function (ctx, a, b, t) { return { gen: 'tie', who: [a, b], t: t }; });
    /* 命令・家族の立場（HK.TieOrder の一場面）と、関係ごとの夜（sexBody を直接） */
    hookText(HK.TieOrder, 'body', function (ctx, p) { return p ? { gen: 'order', who: [p.up || p.top, p.down || p.bot], p: p } : null; });
    hookText(HK.TieOrder, 'sexBody', function (ctx, A, B) { return { gen: 'tiesex', who: [A, B] }; });
    /* 関係ならではの円満な夜（tie-warm-r18.js の tie_warm_r18：主従・師弟・幼馴染・家族（恋愛：あり）など） */
    hookText(HK.TieWarmR18, 'scene', function (ctx, a, b) { return { gen: 'warm', who: [a, b] }; });
    /* 従が主に力ずくで（tie-master-r18.js） */
    hookText(HK.TieMasterR18, 'scene', function (ctx, S, M, kind) { return { gen: 'mr', who: [S, M], kind: kind }; });
    /* 三人以上の場面の組み立て（HK.Trio3.begin の返す組み立ての text を包む） */
    if (HK.Trio3 && typeof HK.Trio3.begin === 'function') HK.wrap(HK.Trio3, 'begin', function (b0) {
      var f = function (S, sp, o) {
        var C = b0.apply(this, arguments);
        if (C && on(S) && sp && typeof C.text === 'function') {
          var info = { gen: 'trio', who: [sp.t, sp.m, sp.u].concat((o && o.more) || []).filter(Boolean), sp: sp, rel: (o && o.rel) || '' }, t0 = C.text;
          S._slTrio = info;
          C.text = function () { var t = t0.apply(this, arguments); if (typeof t === 'string' && t) { info.probes = probesOf(t); note(S, info); } if (S._slTrio === info) S._slTrio = null; return t; };
        }
        return C;
      };
      f._sexLead = true;
      return f;
    });
    /* こじれた三人（room-trio-rival-r18.js の RV.apply：三人の組み立ての途中で呼ばれる） */
    if (HK.TrioRival && typeof HK.TrioRival.apply === 'function') HK.wrap(HK.TrioRival, 'apply', function (a0) {
      var f = function (ctx, m) { if (on(ctx) && ctx._slTrio && m && m.k) ctx._slTrio.rv = { k: m.k, c: m.c, u: m.u }; return a0.apply(this, arguments); };
      f._sexLead = true;
      return f;
    });
  }
  install();

  /* ---------- 部品を通らない場面（出来事の id ごと）：この記録が場面なら { gen, who } ---------- */
  function hasH(ctx) { return rulesOf(ctx).some(function (r) { return r.k === 'h'; }); }
  /* みんなでの輪の顔ぶれ（記録の主役は言い出した一人だけなので、本文の「○○・○○・○○は顔を見合わせ」から拾う） */
  function groupOf(ctx, o) {
    var acts = (o.actors || []).slice(), mt = String(o.text).match(/([^。」]+?)は顔を見合わせ/), g = [];
    if (mt) mt[1].split('・').forEach(function (nm) { var c = (ctx.chars || []).filter(function (x) { return x.name === nm.trim(); })[0]; if (c && g.indexOf(c) < 0) g.push(c); });
    if (acts[0] && g.indexOf(acts[0]) > 0) { g.splice(g.indexOf(acts[0]), 1); g.unshift(acts[0]); }
    return g.length >= 3 ? g : [];
  }
  var EVR = SL.EVR = {
    /* スピード型：縛って済ませる（好意がなければ場面の文はなく、縛って済ませた一文だけ） */
    speedrun: function (ctx, o) { return hasH(ctx) && o.cat !== 'conflict' && (o.actors || []).length >= 2 && /縛|手錠|ロープ|ベルト|紐/.test(o.text) ? { gen: 'speed', who: o.actors.slice(0, 2) } : null; },
    /* 媚薬に呑まれて押し倒す（止められなかった方） */
    aphro_heat: function (ctx, o) { return o.cat === 'conflict' && /抵抗は、途中で弱く|言葉を聞いていなかった|止める者は誰もいなかった/.test(o.text) ? { gen: 'aforce', who: o.actors.slice(0, 2) } : null; },
    /* みんなで（組み立てで書けなかったときの、照明を落とす一文も） */
    group_h: function (ctx, o) { var g = groupOf(ctx, o); return g.length >= 3 ? { gen: 'group', who: g } : null; },
    /* 闇に堕ちた自分 */
    rs_dk_force: function (ctx, o) { return (o.actors || []).length >= 2 && o.text.length >= 80 ? { gen: 'dark', who: o.actors.slice(0, 2) } : null; },
    rs_dk_ntr: function (ctx, o) { return o.sex === true && (o.actors || []).length >= 3 ? { gen: 'ntr', who: o.actors.slice(0, 3) } : null; },
    /* 運命の揺らぎ：らしくない一面にそそられた側から誘う夜（unlike-r18.js。二人の夜と同じ前振り） */
    unl_heat: function (ctx, o) { return o.sex === true && (o.actors || []).length >= 2 ? { gen: 'pair', who: o.actors.slice(0, 2) } : null; },
    /* 愛憎：突き放したあと・複雑のあとの衝動で手を出す（hate-love-more-r18.js。2026-10-29） */
    tie_lh_urge: function (ctx, o) { return o.sex === true && (o.actors || []).length >= 2 ? { gen: 'lhurge', who: o.actors.slice(0, 2) } : null; }
  };

  /* ---------- 見つけた場面から、前振りの材料をまとめる ---------- */
  function same(x, y) { return x && y && x.length === y.length && x.every(function (c) { return y.indexOf(c) >= 0; }); }
  function keyOf(who) { return who.map(function (c) { return c.i; }).sort(function (x, y) { return x - y; }).join('-'); }
  function infoOf(ctx, o, hit, rule, ev) {
    var G = {}, who = null;
    hit.forEach(function (h) { G[h.gen] = G[h.gen] || h; if (!who || h.who.length > who.length) who = h.who; });
    if (rule) { G[rule.gen] = rule; if (!who || rule.who.length >= who.length) who = rule.who; }
    who = (who || o.actors || []).filter(Boolean);
    if (!who.length) return null;
    var I = { ev: ev, who: who.slice(), why: o.why || '' }, acts = o.actors || [];
    var tr = G.trio, ord = G.order;
    if (ord && ord.p && ord.p.force) I.kind = 'oforce';
    else if (ord && ord.p && ord.p.type === 'stand') I.kind = 'family';
    else if (ord) I.kind = 'order';
    else if (G.mr) I.kind = 'mr';
    else if (/^tie_rn_/.test(ev) || G.tie || G.tiesex || G.warm) {
      I.kind = 'tie';
      var x = who[0], y = who[1], ty = x && y ? tieTy(ctx, x, y) : '';
      if (FAM_T[ty]) I.kind = 'family';
      I.shy = /^tie_rn_(couple|spouse|lover|mate|fated|fiance|honmei)/.test(ev);
    }
    else if (ev === 'tie_lh_urge' || G.lhurge) I.kind = 'lhurge';
    else if (ev === 'hate_sex' || G.hate) I.kind = 'hate';
    else if (G.dark) I.kind = 'dark';
    else if (G.ntr) I.kind = 'ntr';
    else if (ev === 'jealous_claim') I.kind = 'jealous';
    else if (tr && tr.rv) { I.kind = 'rival'; I.rv = tr.rv; }
    else if (/^最後の三人/.test(o.why || '')) { I.kind = 'last'; I.after = true; }
    else if (ev === 'group_h' || G.group) I.kind = 'group';
    else if (tr || who.length >= 3) I.kind = 'trio';
    else if (ev === 'speedrun' || G.speed) I.kind = 'speed';
    else if (G.aforce) I.kind = 'aforce';
    else if (/罰ゲーム/.test(o.why || '')) I.kind = 'game';
    else { I.kind = 'pair'; I.mode = G.pair ? G.pair.mode : ''; I.fl = G.pair ? G.pair.fl : ''; }
    if (I.kind === 'pair' && I.mode === 'aphro') I.kind = 'pair';
    /* 言い出した人：二人の場面は部品に渡された最初の人（出来事の主役）。三人以上は記録の主役を先頭に */
    if (who.length >= 3 && acts.length && who.indexOf(acts[0]) > 0) { var w2 = who.filter(function (c) { return c !== acts[0]; }); w2.unshift(acts[0]); I.who = w2; }
    if (I.kind === 'group') { var gg = groupOf(ctx, o); if (gg.length >= 3) I.who = gg; }
    /* 三人の材料（恋人どうし・取り合い・真ん中・不仲） */
    if (I.kind === 'trio') {
      var g = I.who, T3 = HK.RoomTrio, info = ctx.flags && ctx.flags.lastTrioInfo || {}, t = {};
      for (var i = 0; i < g.length && !t.lovers; i++) for (var j = i + 1; j < g.length; j++) {
        if (LOVE_T[tieTy(ctx, g[i], g[j])] || (ctx.pair && ctx.pair(g[i], g[j]).couple)) { var rest = g.filter(function (z) { return z !== g[i] && z !== g[j]; }); if (rest.length === 1) { t.lovers = rest[0]; I.who = [g[i], g[j], rest[0]]; } break; }
      }
      if (!t.lovers && info.jeal && info.jeal !== 'none' && tr && tr.sp) t.jeal = info.p === 'oneTwo' ? tr.sp.t : info.p === 'twoOne' ? tr.sp.u : tr.sp.m;
      for (i = 0; i < g.length; i++) for (j = i + 1; j < g.length; j++) if (HATE_T[tieTy(ctx, g[i], g[j])] || hateLv(ctx, g[i], g[j]) >= 40) t.grudge = true;
      if (T3 && T3.okSex && g.length === 3) {
        var ap = [[0, 1], [0, 2], [1, 2]].filter(function (q) { return !T3.okSex(g[q[0]], g[q[1]]); });
        if (ap.length === 1) I.hub = g[3 - ap[0][0] - ap[0][1]];
      }
      I.trio = t;
    }
    if (I.kind === 'last') {
      /* room-last3-r18.js の MOOD_WHY（理由の欄）から三人の層を読み、その層に当たる二人を探す（恋人どうし・夜を過ごした・張りつめた） */
      var md = /恋人どうし/.test(o.why) ? 'love' : /仲のよい三人/.test(o.why) ? 'warm' : /体の関係がある/.test(o.why) ? 'body' : /愛憎のある/.test(o.why) ? 'hate' : 'none', g3 = I.who, lp = null;
      var fit = { love: function (x, y) { return !!(LOVE_T[tieTy(ctx, x, y)] || (ctx.pair && ctx.pair(x, y).couple)); }, body: function (x, y) { return !!(ctx.pair && ctx.pair(x, y).night); }, hate: function (x, y) { return !!HATE_T[tieTy(ctx, x, y)] || hateLv(ctx, x, y) >= 35; } }[md];
      for (var p1 = 0; fit && !lp && p1 < g3.length; p1++) for (var p2 = p1 + 1; p2 < g3.length; p2++) if (fit(g3[p1], g3[p2])) { lp = [g3[p1], g3[p2]]; break; }
      I.lastRel = { k: fit && !lp ? (md === 'love' ? 'warm' : 'none') : md, x: lp ? lp[0] : null, y: lp ? lp[1] : null };
    }
    /* 場面の頭（既存の導入と重ならないように）・出られない部屋の「はじめての前置き」があるか */
    I.head = String(o.text).slice(0, 300);
    I.actIntro = (I.kind === 'pair') && actIntro(I.head);
    /* 二度目：同じ顔ぶれでの前振りの数・言い出した人がさっき別の相手といたか */
    var H = ctx._slHist || (ctx._slHist = { g: {}, p: {} }), key = keyOf(I.who), a0 = I.who[0];
    var prev = H.p[a0.i] || [];
    I.again = { n: H.g[key] || 0, other: !H.g[key] && prev.length > 0 && prev.indexOf(key) < 0 && I.who.length === 2 };
    if (I.kind === 'hate' && G.hate && !G.hate.room) I.mode = 'done';
    if (I.kind === 'pair' && I.mode === 'repeat' && !I.again.n) I.again.n = 1;
    I.key = key;
    return I;
  }
  function remember(ctx, I) {
    var H = ctx._slHist; H.g[I.key] = (H.g[I.key] || 0) + 1;
    I.who.forEach(function (c) { var l = H.p[c.i] || (H.p[c.i] = []); if (l.indexOf(I.key) < 0) l.push(I.key); });
  }

  /* ---------- ctx.say を包む：場面の記録の直前に、前振りの記録を足す ---------- */
  function sayLead(ctx, inner, o) {
    if (!o || HK.SAFE_ON || !ctx._slOn) return inner.call(ctx, o);
    if (o.kind === 'step') { ctx._slQ = []; return inner.call(ctx, o); }
    if (o.kind !== 'event' || typeof o.text !== 'string' || !o.text) return inner.call(ctx, o);
    var tok = ctx._ev || null, Q = ctx._slQ || (ctx._slQ = []), i;
    for (i = Q.length - 1; i >= 0; i--) if (Q[i].tok !== tok) Q.splice(i, 1);
    var hit = Q.filter(function (q) { return (q.probes || []).some(function (p) { return o.text.indexOf(p) >= 0; }); });
    /* 切れ端が後から差し替えられて見つからないとき：同じ出来事の中で、場面の顔ぶれを含む長い記録なら、その場面とみなす */
    if (!hit.length && Q.length) hit = Q.filter(function (q) { return o.text.length >= 160 && q.who && q.who.every(function (c) { return (o.actors || []).indexOf(c) >= 0; }); }).slice(0, 1);
    var ev = tok && tok.id || '', rule = !hit.length && EVR[ev] ? EVR[ev](ctx, o) : null;
    var dk = tok ? ctx.stepIndex + ':' + (o.actors || []).map(function (c) { return c.i; }).join('-') : '';
    if (rule && ctx._slDone && ctx._slDone.tok === tok && ctx._slDone.k === dk) rule = null;   /* 部品を通らない場面は、一つの出来事につき一度 */
    if (!hit.length && !rule) return inner.call(ctx, o);
    hit.forEach(function (q) { Q.splice(Q.indexOf(q), 1); });
    var I = infoOf(ctx, o, hit, rule, ev), lead = I ? SL.text(ctx, I) : null;
    if (!lead || !lead.text) return inner.call(ctx, o);
    var log = ctx.log, at = log.length;
    var e0 = { n: at, step: ctx.stepIndex, label: ctx.label, cat: o.cat || 'romance', actors: (o.actors || []).map(function (c) { return c.i; }), text: lead.text, why: lead.why, odd: false, mag: 3, kind: 'event', tag: 'きっかけ', lewd: false };
    log.push(e0);
    /* 「次の記録は性的な場面」の印（ero-scene.js の touch）は、前振りの次の記録（場面）に送る */
    var eroN = ctx._eroN === at;
    if (eroN) ctx._eroN = at + 1;
    var e = inner.call(ctx, o);
    if (!e || e.skipped) {
      var k = log.indexOf(e0);
      if (k >= 0) { log.splice(k, 1); for (var j = k; j < log.length; j++) if (log[j]) log[j].n = j; }
      if (eroN && ctx._eroN === at + 1) ctx._eroN = at;
      return e;
    }
    remember(ctx, I);
    if (rule) ctx._slDone = { tok: tok, k: dk };
    if (SL.log) SL.log.push({ kind: I.kind, ev: ev, n: e0.n, scene: e.n, gens: hit.map(function (q) { return q.gen; }).concat(rule ? [rule.gen] : []) });
    return e;
  }
  /* 箱庭の ctx に取り付ける（setup のあとで呼ぶ。ほかの箱庭でも使える） */
  SL.attach = function (ctx) {
    if (HK.SAFE_ON || !ctx || ctx._slOn) return;
    var inner = ctx.say;
    ctx._slOn = true; ctx._slQ = []; ctx._slHist = { g: {}, p: {} };
    ctx.say = function (o) { return sayLead(this, inner, o); };
  };
  /* 出られない部屋：setup のあとに取り付ける */
  var scen = HK.SCENARIOS && HK.SCENARIOS.whiteroom;
  if (scen && typeof scen.setup === 'function') HK.wrap(scen, 'setup', function (s0) {
    return function (ctx) { var r = s0.apply(this, arguments); SL.attach(ctx); return r; };
  });
})();
