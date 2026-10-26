/* 箱庭シミュレーター: 邪神村RTA ― 職業の追加と、職業ごとの捜査の出来事（全年齢版・R18版共通）
   ・職業を6つ足す：弁護士・経理・営業・看護師・整備士・農家（jashin.js の設定欄が JS.JOBS を読む前に足すので、jashin-data.js の直後に読む）
   ・職業ごとの捜査の出来事（クトゥルフ神話TRPG の技能のように、職業の腕をひねって使う）：
     弁護士＝交渉で聞き出す・古い証文を読み解く・村人の詮索を言いくるめる／経理＝寄進帳の金の流れ・資料館の書類整理・宿帳の数字
     営業＝名刺一枚で有力者に会う・断られても粘る・身分を偽る／看護師＝手当てで信頼を得る・食事の眠り薬を見抜く・仲間の介抱
     整備士＝ガソリンを抜かれた車・発電機の配線・壊れた映像の復元／農家＝育たない畑の一区画・空と井戸の水の読み
     既存の職業にも一つずつ：記者＝古い新聞の綴り・警察官＝職務質問の要領・作家＝縁起の継ぎ目・ミュージシャン＝囃子の拍子
   ・成否は「職業の技能 × 気質」。嘘は正直さ（本音の出やすさ）が高いほど下手で、冷たさ・慎重さが高いほどうまい
   ・成功すると手がかり（S.found）や村人の敵意の低下・逃げ道（S.fleeBonus・S.fog）・襲撃をかわす予感（foresee）、
     失敗すると村人の敵意の上昇（S.hostile）・偽の手がかり（S.fake）・怪我・恐怖・時間の空費
   ・その一時間の行動の代わりに起きる（時間を使う）。一回の遊びで職業の出来事は多くて5件（職業×職業の出来事 jashin-jobs-pair.js と合わせて）。同じ出来事は二度出さない
   台詞は3本（「くだけた常体｜硬い常体｜敬語」）。村人の台詞は「＠」で始める（口調を変えない）
   {a}=その人 {b}=介抱する相手・ほかの仲間 */
(function () {
  'use strict';
  var HK = window.HK, JS = HK && HK.JASHIN;
  if (!JS || !JS.JOBS) return;
  function L(s) { return s.split('|'); }
  function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }

  /* ---------- 職業の追加（神職の後ろ。全年齢版の未成年の職業より前） ---------- */
  var NEW = [
    { id: 'lawyer', label: '弁護士', sk: { talk: 0.3, lore: 0.15 }, lie: 0.3, desc: '交渉と古い証文の読み解きが得意。村人を言いくるめるのもうまい（正直な人ほど嘘は下手）' },
    { id: 'accountant', label: '経理', sk: { lore: 0.25, obs: 0.2 }, desc: '帳簿と数字の違和感に強い。寄進帳や資料館の古い記録から、隠れた金の流れを見つける' },
    { id: 'sales', label: '営業', sk: { talk: 0.35, explore: 0.05 }, lie: 0.25, desc: '人の懐に入るのがうまい。断られても粘り、名刺一枚で村の有力者に会う' },
    { id: 'nurse', label: '看護師', sk: { obs: 0.15, talk: 0.15 }, desc: '手当てで村人や仲間の信頼を得る。薬の種類や量にも詳しい' },
    { id: 'mechanic', label: '整備士', sk: { explore: 0.15, obs: 0.15, fight: 0.1 }, desc: '車・発電機・壊れた機械を直せる。村の仕掛けの不自然さにも気づく' },
    { id: 'farmer', label: '農家', sk: { explore: 0.2, obs: 0.1, fight: 0.05 }, desc: '畑・土・空模様の異変に敏い。村の年寄りとも話が合う' }
  ];
  if (!JS.JOB.lawyer) {
    var at = -1;
    JS.JOBS.forEach(function (j, i) { if (j.id === 'priest') at = i; });
    if (at < 0) at = JS.JOBS.length - 1;
    Array.prototype.splice.apply(JS.JOBS, [at + 1, 0].concat(NEW));
    NEW.forEach(function (j) { JS.JOB[j.id] = j; });
  }
  /* 嘘のうまさ（言いくるめる職業）：記者・大物も少しうまい */
  var LIE = { lawyer: 0.3, sales: 0.25, celeb: 0.15, journalist: 0.1 };
  /* おまかせのときの職業（気質から） */
  var FIT = {
    lawyer: function (t) { return t.a * 0.35 + t.cp * 0.25 + t.cold * 0.15; },
    accountant: function (t) { return t.a * 0.35 + t.caution * 0.3 + t.ac * 0.1; },
    sales: function (t) { return t.warmth * 0.35 + t.fc * 0.25 + t.np * 0.1; },
    nurse: function (t) { return t.np * 0.45 + t.caution * 0.15; },
    mechanic: function (t) { return t.a * 0.2 + t.impulse * 0.15 + t.cp * 0.15 + 0.05; },
    farmer: function (t) { return t.ac * 0.25 + t.np * 0.2 + t.caution * 0.15; }
  };
  if (JS.JOB_FIT) Object.keys(FIT).forEach(function (k) { if (!JS.JOB_FIT[k]) JS.JOB_FIT[k] = FIT[k]; });

  /* ---------- 来た理由・初動・目標に新しい職業を足す ---------- */
  function R(t, jobs, fit) { return { t: t, jobs: jobs.split(','), fit: fit }; }
  if (JS.REASONS && !JS.REASONS.some(function (r) { return r.jobs.indexOf('lawyer') >= 0; })) {
    JS.REASONS.push(
      R('依頼人に代わって、相続した山林の境界の立ち会いを頼まれた', 'lawyer', function (t) { return t.cp * 0.4 + t.a * 0.2; }),
      R('亡くなった依頼人の遺言書に、この村の名前が書かれていた', 'lawyer,civ', function (t) { return t.a * 0.4 + t.np * 0.2; }),
      R('村の農協から、古い帳簿を見てほしいと頼まれた', 'accountant', function (t) { return t.a * 0.4 + t.ac * 0.2; }),
      R('取引先の古い請求書の宛先を辿ってきた', 'accountant,sales', function (t) { return t.caution * 0.3 + t.a * 0.3; }),
      R('山奥の温泉の湯の花を売り込む、飛び込み営業の途中で', 'sales', function (t) { return t.fc * 0.4 + t.warmth * 0.3; }),
      R('村の診療所の応援に呼ばれた', 'nurse,doctor', function (t) { return t.np * 0.5; }),
      R('故障した村の巡回バスの修理を頼まれて', 'mechanic', function (t) { return t.cp * 0.3 + t.a * 0.2; }),
      R('峠道でエンストした車を直しているうちに日が暮れた', 'mechanic,civ', function (t) { return t.impulse * 0.3 + t.a * 0.2; }),
      R('珍しい在来種の種籾を分けてもらいに', 'farmer', function (t) { return t.ac * 0.3 + t.np * 0.2; }),
      R('農業体験の受け入れ先として、この村を紹介された', 'farmer,student', function (t) { return t.fc * 0.3 + t.np * 0.2; })
    );
    var ADD = { '相続した古い家の片づけ': 'lawyer', '亡くなった祖母の生まれ故郷を訪ねて': 'nurse', 'バスが途中で止まり、運転手が消えた': 'mechanic', '骨董の買い付け': 'sales', '村おこしのイベントにゲストとして呼ばれた': 'sales', 'ダム建設の事前調査': 'accountant,lawyer', '山奥の神社の修復の見積もりに': 'accountant', '先祖の墓参りに初めて来た': 'farmer' };
    JS.REASONS.forEach(function (r) { if (ADD[r.t]) ADD[r.t].split(',').forEach(function (j) { if (r.jobs.indexOf(j) < 0) r.jobs.push(j); }); });
  }
  function addJobs(list, map) { (list || []).forEach(function (o) { if (map[o.id] && o.jobs != null && !/lawyer|accountant|sales|nurse|mechanic|farmer/.test(o.jobs)) o.jobs += ',' + map[o.id]; }); }
  addJobs(JS.ACTIONS, { ask: 'lawyer,sales,nurse', explore: 'mechanic,farmer', record: 'accountant', polite: 'nurse,farmer', read: 'accountant,lawyer' });
  addJobs(JS.GOALS, { escape: 'mechanic', truth: 'lawyer,accountant', protect: 'nurse', deny: 'mechanic,accountant', find: 'lawyer', steal: 'sales' });

  /* ---------- 文 ---------- */
  var TYPE_JP = { obs: '観察', lore: '知識', talk: '聞き込み', spirit: '霊感', explore: '探索', fight: '腕っぷし', rite: '作法', lie: '嘘のうまさ', heal: '手当て' };
  /* 出来事：id, job, sk（使う力）, prefer（手がかりの種類）, intro, ok=[[文, 効果]], ng=[[文, 効果]], cond, bonus
     効果：clue=手がかり（無ければ敵意を下げる） calm=村人の敵意を下げる flee=逃げ道 fog=霧の読み save=襲撃をかわす予感 heal=介抱
           hostile=敵意が上がる fake=偽の手がかり hurt=怪我 fear=恐怖 sleep=一行が眠り込む（次の時間を失う） none=時間を使っただけ */
  function E(id, job, sk, prefer, intro, ok, ng, opt) { var o = { id: id, job: job, sk: sk, prefer: prefer ? prefer.split(',') : [], intro: L(intro), ok: ok, ng: ng }; for (var k in opt || {}) o[k] = opt[k]; return o; }
  var EV = [
    /* ---- 弁護士 ---- */
    E('law_talk', 'lawyer', 'talk', 'talk',
      '{a}は村長の家を訪ね、縁側で茶をすすりながら、相手の話をひとつも遮らずに聞いた。|{a}は民宿の女将に、宿の土地の権利で困っていないかと、さりげなく切り出した。|{a}は寄り合い帰りの年寄りを呼び止め、「少し話を聞かせてほしい｜少し話を聞かせてくれ｜少しお話を聞かせていただけますか」と頭を下げた。',
      [['{a}は相手の言葉尻を拾い、言い逃れの道を一つずつ塞いでいった。気づけば相手は、言うつもりのなかったことまで口にしていた。――', 'clue,calm'],
        ['{a}は「あなたに不利なことにはならない｜あなたに不利なことにはならない｜あなたに不利なことにはなりません」と穏やかに請け合った。相手は長いため息をつき、ぽつりと漏らした。――', 'clue,calm']],
      [['{a}の話しぶりは、村の人間には理詰めすぎた。相手は笑ってみせたが、目は笑っていなかった。「＠先生は、口がうまいねえ」', 'hostile'],
        ['{a}が土地の権利の話を持ち出した途端、相手の顔がこわばった。「＠……今日のところは、お引き取りください」', 'hostile']]),
    E('law_deed', 'lawyer', 'lore', 'lore,obs',
      '{a}は役場の書庫で、村の土地の権利書と古い養子縁組の届けを一枚ずつ繰った。|{a}は名主の家の蔵に残る証文の束を借り出し、法律家の目で読み比べた。',
      [['どの代にも、決まった家から一人ずつ養子が出され、その養子は決まって祭りの年に転出していた。生贄の家系が、書類の上に浮かび上がった。――', 'clue'],
        ['土地の売買の証文に、立会人として同じ名前が百年分並んでいた。人の寿命では、ありえない長さだった。――', 'clue']],
      [['崩し字の多い古い証文は、さすがの{a}にも手に余った。読み解けたのは、どうでもいい境界争いの記録だけだった。', 'none'],
        ['{a}は証文の一節を読み違え、祭りの日取りは代替わりで変わったのだと思い込んだ。一行は、ありもしない猶予を信じた。', 'fake']]),
    E('law_lie', 'lawyer', 'lie', '',
      '村の若い衆が{a}を取り囲んだ。「＠あんた、本当は何しに来た。役所の回し者か」|駐在所の前で、村長が{a}を呼び止めた。「＠お客さん、ずいぶん熱心に村のことを調べていなさるね」',
      [['{a}は眉ひとつ動かさず、「ただの観光だよ。仕事の疲れを取りに来ただけ｜ただの観光だ。仕事の疲れを取りに来ただけだ｜ただの観光です。仕事の疲れを取りに来ただけですよ」と答えた。法廷で鍛えた顔には、嘘の継ぎ目がひとつもなかった。村人たちは毒気を抜かれ、黙って散っていった。', 'calm']],
      [['{a}は言いくるめようとしたが、声がわずかに上ずった。根が正直なぶん、嘘はどうにも下手だった。その夜から、民宿の前に見張りが立つようになった。', 'hostile2'],
        ['{a}の答えは筋が通りすぎていた。「＠よう考えた言い訳だ」――村人たちは顔を見合わせ、{a}の顔をじっと覚えるように見た。', 'hostile2']],
      { cond: function (S) { return S.hostile >= 25; } }),
    /* ---- 経理 ---- */
    E('acc_ledger', 'accountant', 'lore', 'lore,obs',
      '{a}は社務所の棚から、埃をかぶった寄進帳を抜き出した。|{a}は神社の賽銭と寄進の出納帳を、指で一行ずつなぞった。',
      [['金額は毎年ほぼ同じだった。ただ、祭りの年だけ、決まった家からの寄進が十倍に跳ねていた。口止め料か、それとも何かの代金か。――', 'clue'],
        ['帳尻は合っていた。合いすぎていた。誰かが、ある年の支出をまるごと別の名目に書き換えていた。――', 'clue']],
      [['{a}が帳面をめくっていると、背後で襖が開いた。「＠勝手に何を見とる」――宮司の目が、冷たく光った。', 'hostile'],
        ['数字は几帳面に並んでいるのに、何の違和感も拾えなかった。{a}は首をかしげたまま、帳面を棚に戻した。', 'none']]),
    E('acc_archive', 'accountant', 'lore', 'lore',
      '村の郷土資料館は、資料が年代も種類もばらばらに箱へ詰め込まれていた。{a}は袖をまくり、「まず分類しよう｜まず分類する｜まず分類しましょう」と呟いた。|{a}は資料館の受付簿と収蔵品の目録を照らし合わせ、欠けている番号を書き出していった。',
      [['書類の整理は、{a}の本業だった。二時間後、目録から抜け落ちていた一冊の綴りが、箱の底から出てきた。――', 'clue'],
        ['欠番は三つ。どれも同じ年の祭りの記録だった。{a}は、ほかの箱に紛れ込ませてあった一枚を見つけ出した。――', 'clue']],
      [['整理は半分も終わらないうちに日が傾いた。分かったのは、誰かが先に資料を荒らしていったことだけだった。', 'fear'],
        ['{a}が見つけた綴りは、隣の村の記録だった。それに気づいたのは、一行に話して聞かせたあとだった。', 'fake']],
      { cond: function (S, p, h) { return !JS.night(h); } }),
    E('acc_inn', 'accountant', 'obs', 'obs,talk',
      '{a}は民宿の帳場に置かれた宿帳を、女将が席を外した隙にめくった。|{a}は民宿の帳場の古い宿帳と、台所の仕入れの伝票を並べてみた。',
      [['宿泊者の欄は、祭りのたびに埋まっていた。だが会計の欄には、どの客にも精算の印がなかった。誰一人、宿代を払って帰っていない。――', 'clue'],
        ['泊まった客の数と、翌朝の朝食の仕入れの数が、祭りの年だけ一人ぶん合わなかった。――', 'clue']],
      [['{a}が宿帳を閉じたとき、女将が戸口に立っていた。「＠何か、お探しかい」――女将はそれ以上何も言わず、宿帳を奥へしまい込んだ。', 'hostile']]),
    /* ---- 営業 ---- */
    E('sal_card', 'sales', 'talk', 'talk',
      '{a}は村でいちばん大きな屋敷の門を叩き、名刺を差し出した。|{a}は網元だという屋敷の主に、名刺一枚で面会を取りつけた。',
      [['{a}の人懐こい笑顔に、屋敷の主はつい座敷へ通してしまった。世間話から三十分、話は村の祭りに及んだ。――', 'clue,calm'],
        ['{a}は相手の自慢話に感心してみせ、ここぞというところで一つだけ質問を挟んだ。主は得意げに答えた。――', 'clue']],
      [['「＠うちは、よそ者には会わん」――門は、名刺ごと閉ざされた。', 'hostile'],
        ['{a}が渡した名刺を、相手は見もせずに囲炉裏へくべた。', 'hostile']]),
    E('sal_stick', 'sales', 'talk', 'talk',
      '一度は追い返された長老の老婆の家に、{a}はまた顔を出した。手土産の菓子折りは、三つ目だった。|{a}は、口を開かない村の男の畑仕事を黙って手伝った。昨日も、その前の日もそうした。',
      [['とうとう相手のほうが根負けした。「＠……あんた、しつこいねえ。上がりな」――', 'clue'],
        ['夕方、男は鍬を置いて、ぼそりと言った。「＠……一度しか言わんぞ」――', 'clue']],
      [['次の日、家の前には塩が撒かれていた。{a}はそれ以上、近づけなかった。', 'hostile,fear']],
      { bonus: 0.1 }),
    E('sal_lie', 'sales', 'lie', 'talk',
      '「＠あんた、何の用でこの村に来た」――村の男に問われ、{a}は鞄から名刺入れを出した。|祭りの支度をする女たちが、{a}を遠巻きに見ていた。{a}は自分から近づいていった。',
      [['{a}は「村おこしの仕事で来たんだよ。この村の特産品を探してて｜村おこしの仕事で来た。この村の特産品を探している｜村おこしの仕事で参りました。この村の特産品を探しているんです」と、すらすらと名乗った。口から出まかせだったが、相手はすっかり信じ込み、祭りの支度の手伝いにまで誘ってくれた。', 'calm,clue?']],
      [['{a}の作り話は、細部まで出来すぎていた。「＠村おこしなら、役場を通すはずだがね」――相手の目に、疑いの色が浮かんだ。', 'hostile2']]),
    /* ---- 看護師 ---- */
    E('nur_care', 'nurse', 'talk', 'talk',
      '{a}は、畑仕事で腰を痛めたという老人に、手持ちの湿布を貼ってやった。|{a}は、転んで膝をすりむいた村の子どもを抱き起こし、傷口を水で洗って絆創膏を貼った。',
      [['老人は何度も頭を下げ、帰りがけに声をひそめた。「＠親切なあんたにだけ言うがな」――', 'clue,calm'],
        ['子どもの母親が礼を言いに来た。母親は人目を気にしながら、早口で耳打ちした。――', 'clue']],
      [['「＠よそ者の薬なんぞいらん」――相手は手を払いのけ、足早に帰っていった。', 'none'],
        ['すぐに村の女が駆けつけ、相手を{a}から引き離した。振り返る者は、誰もいなかった。', 'hostile']]),
    E('nur_drug', 'nurse', 'obs', '',
      '夕食の膳の吸い物から、かすかに苦い匂いがした。{a}は箸を止めた。|民宿の女将が勧めてくる「＠よく眠れるお茶」の色に、{a}は見覚えがあった。',
      [['{a}は「飲まないで。眠り薬が入ってる。量が多い｜飲むな。眠り薬が入っている。量が多い｜飲まないでください。眠り薬が入っています。量が多いです」と一行を止めた。その夜、民宿の廊下を誰かが何度も行き来したが、誰も眠り込んではいなかった。', 'save']],
      [['{a}が気づいたのは、皆が飲み干したあとだった。一行は泥のように眠り込み、目を覚ましたのは何時間も経ってからだった。', 'sleep']],
      { cond: function (S, p, h) { return JS.night(h) && S.P.filter(JS.alive).length >= 2; } }),
    E('nur_heal', 'nurse', 'heal', '',
      '{a}は、青い顔で黙り込んでいる{b}の脈を取った。|{a}は{b}の傷を見るなり、鞄から包帯と消毒液を取り出した。',
      [['手際のいい処置だった。{a}は「大丈夫。ゆっくり息をして｜大丈夫だ。ゆっくり息をしろ｜大丈夫です。ゆっくり息をしてください」と、病棟の夜勤のときと同じ静かな声で言った。{b}の呼吸が、少しずつ落ち着いていった。', 'heal']],
      [['手持ちの道具では、できることが限られていた。{a}は唇を噛み、{b}の手を握っていることしかできなかった。', 'heal1']],
      { cond: function (S, p) { return !!hurtMate(S, p); }, bonus: 0.15 }),
    /* ---- 整備士 ---- */
    E('mec_fuel', 'mechanic', 'obs', '',
      '{a}は村の車庫に並ぶ軽トラックを、一台ずつ覗いて回った。|{a}は一行の乗ってきた車のボンネットを開け、首をひねった。',
      [['どの車も、燃料タンクが空にされていた。抜き方が丁寧すぎる。村人は最初から、よそ者を帰さないつもりだ。{a}は農機小屋の奥に隠された缶を見つけ、一缶だけこっそり持ち出した。', 'flee'],
        ['配線が一本だけ、きれいに切られていた。{a}は工具を置いて言った。「これで一台は動く。いざとなったら、これで逃げよう｜これで一台は動く。いざとなったら、これで逃げるぞ｜これで一台は動きます。いざとなったら、これで逃げましょう」', 'flee']],
      [['{a}が車の下に潜り込んでいると、懐中電灯の光が車庫の入口を照らした。{a}は工具を置いたまま、裏口から逃げ出すしかなかった。', 'hostile']]),
    E('mec_gen', 'mechanic', 'explore', 'explore,obs',
      '神社の裏手で、古いディーゼル発電機が低く唸っていた。{a}は太い配線を目で辿った。|村の電柱の配線が、一本だけ山の方へ延びていた。{a}はそれを辿って、藪の中へ入っていった。',
      [['電線は社の床下へ引き込まれ、地下で何かを動かしていた。祭りの夜にだけ回る、大きな仕掛けがある。――', 'clue'],
        ['配電盤の内側に、手書きの点検表が貼られていた。日付は、どれも祭りの前日だった。――', 'clue']],
      [['{a}が配電盤の蓋を開けた瞬間、腐った端子から火花が散った。{a}は指先を焼かれ、しばらく工具を握れなかった。', 'hurt']]),
    E('mec_video', 'mechanic', 'obs', 'obs,spirit',
      '{a}は民宿の押し入れの奥で、泥だらけのスマートフォンを見つけた。前に来た誰かのものらしい。|{a}は村はずれの崖下に落ちていた車から、ドライブレコーダーを外した。',
      [['{a}は基板の水気を拭い、手持ちの部品で電源をつないだ。画面に、最後の映像が映った。――', 'clue'],
        ['割れた記録媒体を、{a}は半日かけて読み出した。ノイズの奥に、祭りの夜の様子が残っていた。――', 'clue']],
      [['{a}がどれだけ手を尽くしても、画面は黒いままだった。最後に一度だけ、ノイズ混じりの声が漏れた。「＠にげて」', 'fear']]),
    /* ---- 農家 ---- */
    E('far_field', 'farmer', 'explore', 'explore,obs',
      '{a}は村の畑を見て回り、一か所で足を止めた。|{a}は棚田のあぜ道にしゃがみ込み、土を指でつまんで匂いを嗅いだ。',
      [['一区画だけ、作物が育っていなかった。土が、ほかより新しい。掘り返して、また埋めた土だ。――', 'clue'],
        ['畑の土に、白い骨のかけらが混じっていた。肥料の骨粉ではなかった。――', 'clue']],
      [['「＠うちの畑で何しとる」――鍬を担いだ村の男が、{a}の背後に立っていた。', 'hostile'],
        ['{a}は土の色の違いに気づいたが、深く掘る前に日が暮れた。', 'none']],
      { cond: function (S, p, h) { return !JS.night(h); } }),
    E('far_weather', 'farmer', 'lore', 'lore,explore',
      '{a}は夕焼けの色と、山から下りてくる風の湿り気を確かめた。|{a}は村の井戸を覗き込み、石組みに残る水位の跡を数えた。',
      [['{a}は空を見上げて言った。「明け方、谷に霧が出る。霧が出れば、村人の目も届かない｜明け方、谷に霧が出る。霧が出れば、村人の目も届かない｜明け方、谷に霧が出ます。霧が出れば、村人の目も届きません」長年空を見てきた者の読みだった。', 'fog'],
        ['井戸の水位は、祭りの日に向けて少しずつ下がるよう、誰かが堰で調節していた。水が引いた井戸の底に、何かがある。――', 'clue']],
      [['空模様は、{a}の知っているどの山とも違った。風は山から吹き下ろすのではなく、山へ吸い込まれていた。', 'fear']]),
    /* ---- 既存の職業（記者・警察官・作家・ミュージシャン） ---- */
    E('jou_paper', 'journalist', 'lore', 'lore,talk',
      '{a}は公民館の書棚で、村の広報誌の古い綴りを見つけた。|{a}は駐在所の掲示板に貼られたまま黄ばんだ、昔の新聞の切り抜きを一枚ずつ剥がした。',
      [['祭りの翌月の号には、決まって「村を出て都会へ働きに行った若者」の小さな記事が載っていた。名前は、毎回違った。――', 'clue'],
        ['切り抜きの裏に、鉛筆で走り書きがあった。前にこの村を取材した記者の字だった。――', 'clue']],
      [['{a}が記者だと、すぐに知れ渡った。「＠書かれて困ることなんて、この村には何もないよ」――村人たちは、口を揃えてそう言った。', 'hostile']]),
    E('pol_ask', 'police', 'talk', 'talk,obs',
      '{a}は、夜道でうろつく村の若者を呼び止め、職務質問の要領で名前と行き先を尋ねた。|{a}は、祭りの支度をする若い衆の一人を、さりげなく人の輪から引き離した。',
      [['若者の目が、問いのたびに神社の方へ泳いだ。{a}は嘘の継ぎ目を一つずつ突き、とうとう本当のことを吐かせた。――', 'clue']],
      [['{a}の口調には、取り調べの癖が出すぎていた。若者は黙り込み、翌朝には村中に「よそ者の刑事」の噂が広まっていた。', 'hostile']]),
    E('wri_engi', 'writer', 'obs', 'lore,obs',
      '{a}は神社に掲げられた村の縁起を、声に出さずに読んだ。|{a}は民宿の床の間に飾られた、村の由来を記した巻物を広げた。',
      [['文章の調子が、途中で一度だけ変わっていた。書き手が違う。誰かが、都合の悪い一段を書き換えたのだ。――', 'clue']],
      [['美しい文章だった。{a}は読み終えてから、何ひとつ違和感を拾えなかったことに気づいた。', 'none']]),
    E('mus_beat', 'musician', 'obs', 'obs,rite',
      '祭り囃子の稽古の音が、風に乗って聞こえてきた。{a}は指で拍子を取った。|{a}は太鼓の練習をする村の子どもの横に座り、同じ節を口ずさんだ。',
      [['拍子は、ただの囃子ではなかった。何かを数えている。数えているのは、日にちだ。――', 'clue']],
      [['{a}が節の続きを口ずさんだ瞬間、太鼓がぴたりと止んだ。「＠……その先を、どこで覚えた」', 'hostile']])
  ];
  var BY = {}; EV.forEach(function (e) { (BY[e.job] = BY[e.job] || []).push(e); });

  /* ---------- 仕組み ---------- */
  var CAP = 5, PER = 2;
  function free(p) { return JS.alive(p) && !p.bound && !p.mad; }
  function jobL(p) { var j = JS.JOB[p.job]; return j ? j.label : ''; }
  /* 嘘のうまさ：職業＋（1−本音の出やすさ）＋冷たさ・慎重さ。怖いほど下手 */
  function lieSkill(p) {
    var t = p.tr || {}, hon = t.honesty != null ? t.honesty : 0.5;
    return clamp(0.15 + (LIE[p.job] || 0) + (1 - hon) * 0.4 + (t.cold || 0) * 0.12 + (t.caution || 0) * 0.08 - p.m.fear / 300, 0, 1.2);
  }
  function skillOf(p, sk) { return sk === 'lie' ? lieSkill(p) : sk === 'heal' ? clamp(0.45 + JS.skill(p, 'obs') * 0.5, 0, 1.2) : JS.skill(p, sk); }
  function hurtMate(S, p) {
    return S.P.filter(function (q) { return q !== p && free(q) && (q.m.hp < 60 || q.m.fear > 70); }).sort(function (x, y) { return x.m.hp - y.m.hp; })[0] || null;
  }
  /* 手がかりを一つ（得意な種類を優先）。残っていなければ '' */
  function gain(S, p, prefer) {
    var left = S.G.clues.map(function (c, k) { return k; }).filter(function (k) { return S.found.indexOf(k) < 0; });
    if (!left.length) return '';
    var pref = left.filter(function (k) { return (prefer || []).indexOf(S.G.clues[k].type) >= 0; }), k = (pref.length ? pref : left)[0];
    S.found.push(k); if (p && p.cnt) p.cnt.clue++;
    return S.G.clues[k].t + '。';
  }
  /* 効果をかける。文の続きと、理由の一言を返す */
  function apply(S, p, fx, e, b) {
    var add = '', why = [];
    fx.split(',').forEach(function (f) {
      switch (f) {
        case 'clue': case 'clue?':
          if (f === 'clue?' && S.rng() > 0.45) break;
          var c = gain(S, p, e.prefer);
          if (c) { add += c; why.push('手がかり ' + S.found.length + '/' + S.G.clues.length); }
          else if (f === 'clue') { add += 'だが、それはもう一行が掴んでいる事実だった。'; S.hostile = clamp(S.hostile - 3, 0, 100); why.push('手がかりは出そろっていた（村人の敵意 −3）'); }
          break;
        case 'calm': S.hostile = clamp(S.hostile - 5, 0, 100); why.push('村人の敵意 −5'); break;
        case 'hostile': S.hostile = clamp(S.hostile + 5, 0, 100); why.push('村人の敵意 +5'); break;
        case 'hostile2': S.hostile = clamp(S.hostile + 9, 0, 100); p.m.fear = clamp(p.m.fear + 4, 0, 100); why.push('嘘が見破られた（村人の敵意 +9）'); break;
        case 'fake': S.fake = (S.fake || 0) + 1; why.push('偽の手がかりをつかんだ（対抗策を実行するときに不利）'); break;
        case 'hurt': p.m.hp = clamp(p.m.hp - 12, 0, 100); p.m.fear = clamp(p.m.fear + 5, 0, 100); why.push('怪我（体力 −12）'); break;
        case 'fear': p.m.fear = clamp(p.m.fear + 8, 0, 100); why.push('恐怖 +8'); break;
        case 'flee': S.fleeBonus = (S.fleeBonus || 0) + 0.06; why.push('逃げるときの足を確保した（儀式の夜に逃げ延びやすくなる）'); break;
        case 'fog': S.fog = (S.fog || 0) + 1; why.push('霧の出る時刻を読んだ（逃げ道が見つかりやすくなる）'); break;
        case 'save':
          p.foresee = true;
          var o = S.P.filter(function (q) { return q !== p && free(q) && !q.foresee; })[0];
          if (o) o.foresee = true;
          why.push(p.name + (o ? 'と' + o.name : '') + 'は、次の村人の襲撃を一度だけかわせる');
          break;
        case 'sleep':
          S.P.filter(free).forEach(function (q) { q.jobBusy = S.h + 2; q.m.fear = clamp(q.m.fear + 4, 0, 100); });
          why.push('一行が眠り込んだ（次の時間は動けない）');
          break;
        case 'heal': if (b) { b.m.hp = clamp(b.m.hp + 18, 0, 100); b.m.fear = clamp(b.m.fear - 12, 0, 100); why.push(b.name + 'の体力 +18・恐怖 −12'); } break;
        case 'heal1': if (b) { b.m.fear = clamp(b.m.fear - 5, 0, 100); why.push(b.name + 'の恐怖 −5'); } break;
      }
    });
    return { add: add, why: why.join('・') };
  }
  function fire(S, p, e, h) {
    var rng = S.rng, b = e.id === 'nur_heal' ? hurtMate(S, p) : null;
    var sk = skillOf(p, e.sk), ch = clamp(0.25 + sk * 0.6 + (e.bonus || 0) - (night0(h) && e.sk === 'talk' ? 0.05 : 0), 0.1, 0.9);
    var ok = rng() < ch, pool = ok ? e.ok : e.ng, pk = pool[Math.floor(rng() * pool.length)];
    var m = { a: p.name, b: b ? b.name : '' };
    var r = apply(S, p, pk[1], e, b);
    var text = ST.fmt(ST.pick(S, e.intro), m) + ST.fmt(pk[0], m) + r.add;
    S.jobN = (S.jobN || 0) + 1; p.jobN = (p.jobN || 0) + 1; S.jobUsed[e.id] = 1;
    if (JS.DRAMA && JS.DRAMA.setRel && b && ok) JS.DRAMA.setRel(S, p, b, 0.12, '手当て', p);
    var o = ST.say(S, { actors: b ? [p, b] : [p], tag: '職業・' + jobL(p), text: text,
      why: jobL(p) + 'の腕（' + TYPE_JP[e.sk] + 'の力 ' + Math.round(sk * 100) + (e.sk === 'lie' ? '。正直な人ほど嘘は下手' : '') + '）→ ' + (ok ? '成功' : '失敗') + (r.why ? '：' + r.why : ''), mag: ok ? 20 : 16, jev: e.id, jok: ok });
    return o;
  }
  var ST = HK.Story;
  function night0(h) { return JS.night ? JS.night(h) : false; }

  JS.JOBEV = {
    EV: EV, gain: gain, lieSkill: lieSkill, free: free, CAP: CAP,
    setup: function (S) {
      S.jobN = 0; S.jobUsed = {}; S.P.forEach(function (p) { p.jobN = 0; p.jobBusy = null; });
      /* 殺人・盗みの目標の文に、新しい職業の凶器・手口を足す（jashin-goals-text.js） */
      var G = JS.GT;
      if (G && G.WEAPON && !G.WEAPON.mechanic) { G.WEAPON.lawyer = '万年筆'; G.WEAPON.accountant = '金属の定規'; G.WEAPON.sales = 'ネクタイ'; G.WEAPON.nurse = '薬の注射器'; G.WEAPON.mechanic = 'スパナ'; G.WEAPON.farmer = '草刈り鎌'; }
      if (G && G.STEAL_JOB && !G.STEAL_JOB.mechanic) {
        G.STEAL_JOB.lawyer = '{a}は「相続の書類を確かめに来たよ｜相続の書類を確かめに来た｜相続の書類を確かめに参りました」と言って、名主の家の蔵に上がり込んだ。';
        G.STEAL_JOB.accountant = '{a}は寄進の帳簿付けを手伝うと言って、社務所の金庫の前に座った。';
        G.STEAL_JOB.sales = '{a}は「ちょっと点検に来たよ｜点検に来た｜点検に参りました」と言って、村の家々を回った。';
        G.STEAL_JOB.nurse = '{a}は寝たきりの老人の見舞いを口実に、奥の部屋へ入った。';
        G.STEAL_JOB.mechanic = '{a}は農機の修理を引き受けるふりをして、納屋に入り込んだ。';
        G.STEAL_JOB.farmer = '{a}は畑の手伝いを申し出て、村の倉に出入りした。';
      }
      if (JS.JOBPAIR) JS.JOBPAIR.setup(S);
    },
    /* 二時間ごと（住人の一時間より前）：職業×職業の出来事 */
    tick: function (S, live, h) { if (JS.JOBPAIR && !S.solved) JS.JOBPAIR.tick(S, live, h); },
    /* 住人の一時間：調べる代わりに、職業の出来事を起こす。起こしたら（または眠り込んで動けなければ）true */
    act: function (S, p, h, live) {
      if (p.jobBusy != null && h <= p.jobBusy) { if (h === p.jobBusy) p.jobBusy = null; return true; }
      if (S.solved || !S.jobUsed || (S.jobN || 0) >= CAP - (S.jobPairN || 0) || (p.jobN || 0) >= PER || h < 2) return false;
      var list = (BY[p.job] || []).filter(function (e) { return !S.jobUsed[e.id] && (!e.cond || e.cond(S, p, h)); });
      if (!list.length) return false;
      if (S.rng() > ((p.jobN || 0) ? 0.1 : 0.18)) return false;
      fire(S, p, list[Math.floor(S.rng() * list.length)], h);
      return true;
    }
  };
})();
