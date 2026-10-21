/* 箱庭シミュレーター: 邪神村RTA ― 職業・来た理由・初動・目標・村人・出来事の文
   {a}=住人 {b}=別の住人 {v}=村の名前 {g}=神の名前 {n}=NPC */
(function () {
  'use strict';
  var HK = window.HK;
  function L(s) { return s.split('|'); }
  var JS = HK.JASHIN = {};

  /* ---------- 村の名前 ---------- */
  JS.VILLAGES = L('鳴神村|比良坂村|御影村|久遠村|霧咲村|黒沼村|忌部村|千代見村|夜刀村|白鷺村|宵宮村|蛭川村|朽木村|常闇村|水底村|鬼灯村|宮守村|音無村|瀬織村|狐塚村');

  /* ---------- 職業（調べる力の補正：obs 観察 lore 知識 talk 聞き込み spirit 霊感 explore 探索 fight 腕っぷし rite 儀式） ---------- */
  JS.JOBS = [
    { id: 'civ', label: '一般人', sk: { talk: 0.1, explore: 0.05 }, luck: 1, desc: '巻き込まれただけ。運だけは強い' },
    { id: 'celeb', label: '芸能人', sk: { talk: 0.3 }, desc: '村人に顔を知られていて、話を聞きやすい（目立つ）' },
    { id: 'writer', label: '作家', sk: { obs: 0.25, lore: 0.15 }, desc: '小さな違和感を見逃さない' },
    { id: 'manager', label: 'マネージャー', sk: { talk: 0.15, fight: 0.1 }, protect: 1, desc: '仲間を守るために動く' },
    { id: 'occult', label: 'オカルト研究家', sk: { lore: 0.35, explore: 0.1 }, desc: '伝承と邪神の知識がある' },
    { id: 'psychic', label: '霊能力者', sk: { spirit: 0.55 }, desc: '見えないものが見える。そのぶん怖い' },
    { id: 'seer', label: '占い師', sk: { spirit: 0.35 }, foresee: 1, desc: '危険を一度だけ予見できる' },
    { id: 'prof', label: '教授', sk: { lore: 0.35, obs: 0.1 }, desc: '民俗と古文書に詳しい' },
    { id: 'student', label: '生徒', sk: { explore: 0.25, talk: 0.1 }, desc: '身軽で、子どもや若い村人と話せる' },
    { id: 'ghost', label: '心霊研究家', sk: { spirit: 0.3, obs: 0.15 }, desc: '機材で異変を記録できる' },
    { id: 'musician', label: 'ミュージシャン', sk: { talk: 0.1, rite: 0.15, obs: 0.1 }, desc: '祭りの音の違和感に気づく' },
    { id: 'police', label: '警察官', sk: { fight: 0.4, explore: 0.1 }, desc: '村人に襲われても抵抗できる' },
    { id: 'folk', label: '民俗学者', sk: { lore: 0.4, talk: 0.1 }, desc: '祭祀と禁忌の専門家' },
    { id: 'streamer', label: '配信者', sk: { explore: 0.2, talk: 0.1 }, desc: '撮れ高を求めて危ない場所へ行く' },
    { id: 'doctor', label: '医師', sk: { obs: 0.15 }, heal: 1, desc: '怪我人を手当てできる' },
    { id: 'detective', label: '探偵', sk: { obs: 0.3, talk: 0.1 }, desc: '嘘と矛盾を見抜く' },
    { id: 'sleuth', label: '名探偵', sk: { obs: 0.45, lore: 0.2, talk: 0.15 }, desc: '頭脳明晰。仲間の死や村の殺人事件の真相を推理で暴く' },
    { id: 'ponkotsu', label: 'ポンコツ探偵', sk: { explore: 0.15, talk: 0.05 }, luck: 1, desc: '自称名探偵。的外れな推理で邪魔ばかりするが、たまに当たる' },
    { id: 'priest', label: '神職', sk: { lore: 0.2, rite: 0.3, spirit: 0.15 }, desc: '祀りの作法を知っている' }
  ];
  JS.JOB = {}; JS.JOBS.forEach(function (j) { JS.JOB[j.id] = j; });
  /* おまかせのときの職業（気質から） */
  JS.JOB_FIT = {
    civ: function (t) { return 0.4 + t.ac * 0.2; }, celeb: function (t) { return t.fc * 0.5 + t.warmth * 0.3; }, writer: function (t) { return t.a * 0.4 + (1 - t.fc) * 0.2 + t.cold * 0.2; },
    manager: function (t) { return t.np * 0.4 + t.ac * 0.3; }, occult: function (t) { return t.fc * 0.3 + t.a * 0.3 + t.impulse * 0.2; }, psychic: function (t) { return t.ac * 0.4 + t.np * 0.2; },
    seer: function (t) { return t.np * 0.3 + t.fc * 0.3; }, prof: function (t) { return t.a * 0.5 + t.cp * 0.3; },
    student: function (t) { return t.fc * 0.4 + t.impulse * 0.3; }, ghost: function (t) { return t.a * 0.3 + t.fc * 0.3; }, musician: function (t) { return t.fc * 0.5 + (1 - t.cp) * 0.2; },
    police: function (t) { return t.cp * 0.5 + t.lead * 0.3; }, folk: function (t) { return t.a * 0.5 + t.caution * 0.2; }, streamer: function (t) { return t.fc * 0.4 + t.impulse * 0.4; },
    doctor: function (t) { return t.np * 0.4 + t.a * 0.3; }, detective: function (t) { return t.a * 0.5 + t.cold * 0.2; }, sleuth: function (t) { return t.a * 0.6 + t.caution * 0.15 + t.cold * 0.15 - 0.1; }, ponkotsu: function (t) { return t.fc * 0.35 + t.impulse * 0.35 + (1 - t.a) * 0.25 - 0.1; }, priest: function (t) { return t.cp * 0.3 + t.caution * 0.3; }
  };

  /* ---------- 来た理由（54通り）：[文, 出やすい職業, 気質] ---------- */
  function R(t, jobs, fit) { return { t: t, jobs: jobs ? jobs.split(',') : [], fit: fit }; }
  JS.REASONS = [
    R('「この村で起きた連続失踪事件を解いてほしい」という匿名の依頼状が届いた', 'sleuth,ponkotsu', function (t) { return t.a * 0.4 + t.fc * 0.2; }),
    R('助手に「たまには休んでください」と温泉旅行に送り出されたが、着いたのがここだった', 'sleuth', function (t) { return t.a * 0.3 + t.cold * 0.2; }),
    R('「名探偵の自分の出番だ」と、新聞の小さな記事を勝手に事件だと決めつけて', 'ponkotsu', function (t) { return t.fc * 0.4 + t.impulse * 0.4; }),
    R('迷い猫探しの依頼で、猫の足跡を追っていたら', 'ponkotsu,civ', function (t) { return t.fc * 0.4 + t.np * 0.2; }),
    R('ネットで見た「地図から消えた村」の噂に惹かれた', 'occult,streamer,ghost', function (t) { return t.fc * 0.4 + t.impulse * 0.3; }),
    R('廃村探索の動画を撮るため', 'streamer,celeb', function (t) { return t.fc * 0.5 + t.impulse * 0.3; }),
    R('古文書に記された祭祀の実地調査', 'prof,folk', function (t) { return t.a * 0.6; }),
    R('新作のネタ探しの取材旅行', 'writer', function (t) { return t.a * 0.3 + t.fc * 0.2; }),
    R('ロケハンの下見', 'celeb,manager,musician', function (t) { return t.cp * 0.3 + t.ac * 0.2; }),
    R('担当タレントの付き添い', 'manager', function (t) { return t.np * 0.4 + t.ac * 0.3; }),
    R('ゼミの合宿のはずだった', 'student,prof', function (t) { return t.ac * 0.3 + t.fc * 0.2; }),
    R('行方不明になった兄を捜して', 'civ,police,detective,sleuth,ponkotsu', function (t) { return t.np * 0.4 + t.cp * 0.3; }),
    R('行方不明の友人から届いた最後のメッセージを頼りに', 'civ,student', function (t) { return t.np * 0.5; }),
    R('亡くなった祖母の生まれ故郷を訪ねて', 'civ,doctor', function (t) { return t.np * 0.4 + t.ac * 0.2; }),
    R('相続した古い家の片づけ', 'civ', function (t) { return t.ac * 0.3 + t.caution * 0.2; }),
    R('霊視の依頼を受けて', 'psychic,seer,priest', function (t) { return t.np * 0.3 + t.ac * 0.2; }),
    R('除霊の依頼が来た', 'psychic,priest,mage', function (t) { return t.cp * 0.3 + t.np * 0.2; }),
    R('「本物の神がいる村」と聞いて、確かめたくなった', 'occult,psychic', function (t) { return t.impulse * 0.4 + t.cold * 0.3; }),
    R('禁書の写本がこの村にあると聞いた', 'prof,occult,folk', function (t) { return t.a * 0.4 + t.cold * 0.3; }),
    R('占いで「北の山に行け」と出た', 'seer', function (t) { return t.fc * 0.3 + t.ac * 0.3; }),
    R('夢の中で何度も同じ村を見たから', 'psychic,seer,writer', function (t) { return t.ac * 0.4; }),
    R('心霊スポット巡りの最終目的地', 'ghost,streamer,student', function (t) { return t.fc * 0.5; }),
    R('電磁波の異常値を観測した地点を確かめに', 'ghost,prof', function (t) { return t.a * 0.5; }),
    R('音楽祭の帰りに道を間違えた', 'musician,civ', function (t) { return t.fc * 0.3 + (1 - t.caution) * 0.3; }),
    R('ツーリング中にカーナビが勝手にこの道を示した', 'civ,musician', function (t) { return t.impulse * 0.4; }),
    R('バスが途中で止まり、運転手が消えた', 'civ,student', function (t) { return 0.3; }),
    R('山で遭難しかけて、明かりを頼りに辿り着いた', 'civ,police', function (t) { return 0.3 + t.impulse * 0.2; }),
    R('失踪事件の捜査で', 'police,detective,sleuth,ponkotsu', function (t) { return t.cp * 0.5 + t.lead * 0.2; }),
    R('村から届いた差出人不明の招待状', 'civ,writer,celeb', function (t) { return t.fc * 0.3 + t.ac * 0.2; }),
    R('秘湯の宿の宿泊券が当たった', 'civ,manager', function (t) { return t.fc * 0.3 + t.warmth * 0.2; }),
    R('古民家カフェ特集の取材', 'writer,celeb', function (t) { return t.warmth * 0.4; }),
    R('村おこしのイベントにゲストとして呼ばれた', 'celeb,musician', function (t) { return t.fc * 0.4 + t.warmth * 0.3; }),
    R('祭りの奉納演奏を頼まれた', 'musician,priest', function (t) { return t.fc * 0.3 + t.np * 0.2; }),
    R('卒業論文のフィールドワーク', 'student,folk', function (t) { return t.a * 0.4 + t.ac * 0.2; }),
    R('昔の恋人がこの村の出身だと聞いて', 'civ,writer', function (t) { return t.np * 0.3 + t.impulse * 0.3; }),
    R('借金取りから逃げてきた', 'civ', function (t) { return t.impulse * 0.4 + (1 - t.cp) * 0.2; }),
    R('ネットの懸賞金つき「未確認生物」情報を追って', 'streamer,occult', function (t) { return t.impulse * 0.5; }),
    R('廃神社の御朱印集めの途中', 'civ,student', function (t) { return t.fc * 0.3 + t.caution * 0.2; }),
    R('先祖の墓参りに初めて来た', 'civ,doctor', function (t) { return t.np * 0.3 + t.cp * 0.2; }),
    R('村の診療所に赴任することになった', 'doctor', function (t) { return t.np * 0.5; }),
    R('村の分校に教えに来た', 'prof', function (t) { return t.np * 0.4 + t.cp * 0.2; }),
    R('民宿の住み込みバイトの募集を見て', 'student,civ', function (t) { return t.ac * 0.4; }),
    R('雑誌の「日本のミステリースポット」企画の取材', 'writer,ghost,celeb', function (t) { return t.fc * 0.4; }),
    R('依頼人に「娘を連れ戻してほしい」と頼まれて', 'detective,sleuth,ponkotsu,police', function (t) { return t.np * 0.3 + t.cp * 0.3; }),
    R('師匠が最後に向かった場所を追って', 'occult,psychic,priest', function (t) { return t.np * 0.3 + t.cp * 0.3; }),
    R('流星の落ちた場所を探しに', 'prof,student', function (t) { return t.fc * 0.4 + t.a * 0.2; }),
    R('山奥の神社の修復の見積もりに', 'priest,civ', function (t) { return t.cp * 0.3 + t.a * 0.2; }),
    R('自分探しの一人旅', 'civ,writer,musician', function (t) { return t.ac * 0.3 + t.fc * 0.2; }),
    R('誰かに呼ばれた気がして', 'psychic,seer', function (t) { return t.ac * 0.5; }),
    R('配信の視聴者から「ここに来て」と座標が送られてきた', 'streamer', function (t) { return t.fc * 0.4 + t.impulse * 0.3; }),
    R('都市伝説「見た者は帰れない祭り」の真偽を確かめに', 'occult,ghost,streamer', function (t) { return t.impulse * 0.3 + t.a * 0.3; }),
    R('ダム建設の事前調査', 'prof,civ', function (t) { return t.cp * 0.3 + t.a * 0.3; }),
    R('撮影で使う「古い祭具」を借りに来た', 'celeb,manager', function (t) { return t.cp * 0.3; }),
    R('昔、この村で神隠しにあったことを思い出して', 'civ,writer,psychic', function (t) { return t.ac * 0.4 + t.np * 0.2; }),
    R('骨董の買い付け', 'civ,writer', function (t) { return t.cold * 0.3 + t.a * 0.2; }),
    R('ネットで知り合った人のオフ会', 'civ,student,streamer', function (t) { return t.fc * 0.4 + t.warmth * 0.2; }),
    R('死んだはずの人をこの村で見たという話を聞いて', 'detective,sleuth,ponkotsu,psychic,ghost', function (t) { return t.a * 0.3 + t.np * 0.3; }),
    R('なんとなく、気がついたらここにいた', 'civ', function (t) { return 0.15; })
  ];
  /* シークレットツアー（約10％で全員の理由がこれに書き換わる） */
  JS.TOURS = L('行き先が当日まで明かされない「シークレット・ミステリーツアー」|抽選で当たった「秘境の祭り体験ツアー」|応募した覚えのない「招待制・限定ツアー」|「参加者同士は初対面」が条件の、謎の体験ツアー|格安すぎる「山奥の湯治場と伝統行事ツアー」');

  /* ---------- 初動 ---------- */
  JS.ACTIONS = [
    { id: 'ask', label: '村人に話を聞く', fit: function (t) { return t.warmth * 0.6 + t.np * 0.2; }, jobs: 'celeb,manager,detective,sleuth,ponkotsu,folk,student', type: 'talk' },
    { id: 'explore', label: '村を歩き回る', fit: function (t) { return t.fc * 0.4 + t.impulse * 0.4; }, jobs: 'streamer,student,police', type: 'explore' },
    { id: 'watch', label: '宿で様子を見る', fit: function (t) { return t.caution * 0.7 + t.ac * 0.2; }, jobs: 'civ,writer', type: 'obs' },
    { id: 'record', label: '記録を取る', fit: function (t) { return t.a * 0.6 + t.cold * 0.2; }, jobs: 'ghost,prof,writer,detective,sleuth,ponkotsu', type: 'obs' },
    { id: 'polite', label: '村の作法に従う', fit: function (t) { return t.ac * 0.5 + t.cp * 0.3; }, jobs: 'priest,manager,doctor', type: 'talk' },
    { id: 'read', label: '古い記録や碑を調べる', fit: function (t) { return t.a * 0.5 + t.caution * 0.2; }, jobs: 'prof,folk,occult', type: 'lore' },
    { id: 'sense', label: '気配を探る', fit: function (t) { return t.ac * 0.3 + t.np * 0.2; }, jobs: 'psychic,seer,ghost', type: 'spirit' },
    { id: 'alone', label: '一人で動く', fit: function (t) { return t.cold * 0.5 + t.impulse * 0.3; }, jobs: 'streamer,detective,sleuth,ponkotsu', type: 'explore' }
  ];
  /* ---------- 目標 ---------- */
  JS.GOALS = [
    { id: 'escape', label: '一刻も早く帰る', fit: function (t) { return t.caution * 0.6 + t.ac * 0.3; }, jobs: 'civ,manager' },
    { id: 'truth', label: '村の秘密を暴く', fit: function (t) { return t.a * 0.5 + t.fc * 0.2; }, jobs: 'occult,prof,folk,detective,sleuth,ponkotsu,writer' },
    { id: 'protect', label: '皆を守る', fit: function (t) { return t.np * 0.5 + t.cp * 0.3; }, jobs: 'police,manager,doctor,priest' },
    { id: 'content', label: '撮れ高を持ち帰る', fit: function (t) { return t.fc * 0.5 + t.impulse * 0.3; }, jobs: 'streamer,celeb,ghost' },
    { id: 'meet', label: '神をこの目で見る', fit: function (t) { return t.impulse * 0.4 + t.cold * 0.3; }, jobs: 'occult,psychic', surv: 0.2 },
    { id: 'deny', label: '迷信だと証明する', fit: function (t) { return t.cp * 0.4 + t.a * 0.3 + (1 - t.ac) * 0.2; }, jobs: 'prof,police,detective,sleuth,ponkotsu' },
    { id: 'find', label: '捜している人を見つける', fit: function (t) { return t.np * 0.6; }, jobs: 'police,detective,sleuth,ponkotsu,civ' },
    /* 以下は表の職業と組み合わさって振る舞いが変わる目標（jashin-goals.js）。rare=おまかせでの出にくさ、secret=周りに隠す、surv=生きて帰りたい気持ち */
    { id: 'solve', label: '事件を解決する', fit: function (t) { return t.a * 0.5 + t.cp * 0.2 + t.caution * 0.1; }, jobs: 'detective,sleuth,ponkotsu,police' },
    { id: 'ritual', label: '儀式で別の神を呼ぶ', fit: function (t) { return t.cold * 0.45 + t.a * 0.25 + t.impulse * 0.15 - t.warmth * 0.3; }, jobs: 'occult,psychic,priest', rare: 0.32, secret: 1, surv: 0.35 },
    { id: 'hijack', label: '村の儀式を乗っ取る', fit: function (t) { return t.cp * 0.35 + t.cold * 0.3 + t.a * 0.25 - t.warmth * 0.15; }, jobs: 'priest,folk,occult,prof', rare: 0.45, secret: 1, surv: 0.7 },
    { id: 'murder', label: '誰かを殺す', fit: function (t) { return t.cold * 0.45 + t.aggr * 0.45 - t.warmth * 0.45 - t.ac * 0.1 + 0.1; }, rare: 0.55, secret: 1, surv: 0.8 },
    { id: 'love', label: '恋人を作る', fit: function (t) { return t.fc * 0.35 + t.np * 0.3 + t.impulse * 0.25; }, jobs: 'celeb,streamer,musician,student', rare: 0.75 },
    { id: 'steal', label: '借金返済のために盗む', fit: function (t) { return t.impulse * 0.4 + (1 - t.cp) * 0.3 + t.cold * 0.2 - t.caution * 0.2; }, jobs: 'civ,musician,streamer,writer', rare: 0.45, secret: 1 }
  ];

  JS.GOAL = {}; JS.GOALS.forEach(function (g) { JS.GOAL[g.id] = g; });

  /* ---------- 村の人々 ---------- */
  JS.NPC = { elder: '村長', baba: '長老の老婆', okami: '民宿の女将', kid: '村の子ども', kannushi: '宮司', youth: '村の若い衆', lost: '先に来ていた行方不明者' };
  JS.WELCOME = L('{v}の入口で、腰の曲がった村長が待っていた。「よう来なすった。ちょうど祭りの支度中でしてな」|{v}に入ると、畑仕事の手を止めた村人たちが、一斉にこちらを見た。誰も、何も言わなかった。|民宿の女将は満面の笑みで一行を迎えた。「お客さんなんて何年ぶりかねえ。どうぞ、ゆっくりしていって」――ゆっくり、を妙に強調した。|{v}は地図のどこにも載っていなかった。携帯の電波は、村に入った瞬間に途切れた。|村の子どもが一行の人数を数えていた。「……ちょうど、いい」');
  JS.ATMOS = {
    day: L('昼の{v}は、拍子抜けするほど長閑だった。ただ、どの家の軒先にも同じ形の御札が貼られていた。|畑の案山子が、全部こちらを向いていた。|村のどこにいても、神社の太鼓の音がかすかに聞こえた。|村人たちは、一行の名前をなぜか全員知っていた。|昼食に出された料理は豪勢だった。誰も、自分の分には手をつけていなかった。|村の掲示板に、祭りの日程と「お客様をおもてなしする係」の名簿が貼られていた。'),
    night: L('夜の{v}は真っ暗だった。街灯の代わりに、軒先の提灯がゆらゆらと揺れていた。|障子の向こうを、誰かが何度も行き来した。足音は一つも聞こえなかった。|夜中、村中の犬が一斉に吠え、そしてぴたりと止んだ。|窓の外から、低い歌声が聞こえた。歌詞は、どこの言葉でもなかった。|民宿の廊下の突き当たりの扉に、外から鍵がかけられていた。|夜明け前、誰かが部屋の前に立っていた。朝になると、足元に濡れた足跡だけが残っていた。')
  };
  /* ---------- 定番のホラー出来事（ひとり） ---------- */
  JS.SCARE = L('{a}は鏡に映った自分の背後に、誰かが立っているのを見た。振り返っても、誰もいなかった。|{a}は民宿の押し入れの奥から、自分の名前が書かれた古い名札を見つけた。|{a}の携帯に、圏外のはずなのに一通だけメッセージが届いた。「にげて」|{a}は村の子どもに手を引かれて歩いていた。気づくと、子どもの手は冷たい木の枝に変わっていた。|{a}は夜中に目を覚ました。枕元に、村人が正座してこちらを見下ろしていた。|{a}が撮った写真の全部に、同じ着物の女が写り込んでいた。|{a}は井戸の底から、自分を呼ぶ声を聞いた。母親の声だった。|{a}の部屋の障子に、無数の小さな手形がついていた。内側からだった。|{a}は村の墓地で、今日の日付が刻まれた真新しい墓石を見つけた。名前は、まだ彫られていなかった。|{a}が民宿に戻ると、自分の荷物が「祭り用」と書かれた箱に詰め替えられていた。|{a}は村人に「あんた、前にも来たね」と言われた。初めて来たはずだった。|{a}は夜道で、同じ角を三回曲がった。三回とも、同じ村人が同じ笑顔で立っていた。');
  JS.SCARE_REACT = {
    CP: L('{a}は唇を引き結び、「くだらない」と吐き捨てた。手は震えていた。|{a}は無理やり平静を装った。'),
    NP: L('{a}は青ざめながら、真っ先に仲間の無事を確かめに走った。|{a}は「大丈夫、大丈夫」と自分に言い聞かせた。'),
    A: L('{a}は震える手でメモを取った。「……記録しておく。あとで説明がつくかもしれない」|{a}は息を整え、何が起きたのかを冷静に整理しようとした。'),
    FC: L('{a}は悲鳴を上げて逃げ出した。それから、少しだけ笑った。「やばい、本物だ」|{a}は「撮れてる？　今の撮れてる！？」と叫んだ。'),
    AC: L('{a}はその場にしゃがみ込み、しばらく動けなかった。|{a}は泣きそうな顔で、誰かの袖を掴んだ。')
  };

  /* ---------- 祠を壊す ---------- */
  JS.SHRINE_BREAK = L('{a}は「こんなのただの石だろ」と言って、道端の小さな祠を蹴飛ばした。石の扉が、ごとりと落ちた。|{a}は写真を撮ろうと祠に近づき、足を滑らせて祠ごと倒れ込んだ。中の御神体が、地面に転がった。|{a}は祠の中を確かめようと扉をこじ開けた。古い封の紙が、音もなく裂けた。|酔った{a}が、帰り道で祠に寄りかかった。祠は、あっけなく崩れた。|{a}は「迷信だって証明してやる」と、祠の注連縄を引きちぎった。');
  JS.SHRINE_SCOLD = L('「お前……あの祠、壊したんか！？」――村の老人の顔から、血の気が引いていった。|「お前あの祠壊したんか！　なんちゅうことを……もう、だめじゃ……」老婆はその場に座り込み、念仏を唱え始めた。|村の若い衆が駆けつけ、崩れた祠を見て言葉を失った。「……神さんが、起きなさる」|宮司が祠の前で膝をついた。「あれは、封じておったんです。あれを、封じておったんです……」');
  /* 壊したらどうなるか（ランダム） */
  JS.SHRINE_FX = [
    { id: 'curse', w: 3, t: L('その夜から、{a}の首筋に黒い痣が浮かび始めた。痣は、日ごとに手の形になっていった。|{a}は眠るたびに、祠の前に立っている夢を見るようになった。'), why: '呪われた（時間が経つと命に関わる）' },
    { id: 'rage', w: 3, t: L('村人たちの目つきが変わった。一行は、もう「お客様」ではなかった。|その日から、村人は誰も一行に口をきかなくなった。代わりに、鎌を研ぐ音があちこちから聞こえ始めた。'), why: '村人の敵意が一気に上がった' },
    { id: 'wake', w: 2, t: L('地の底から、低い唸り声が響いた。神は、予定より早く目覚めようとしていた。|山の向こうの空が、一瞬だけ赤く光った。祭りの刻限が、早まった。'), why: '神の目覚めが早まった（儀式までの時間が短くなった）' },
    { id: 'clue', w: 2, t: L('崩れた祠の中から、油紙に包まれた古い帳面が出てきた。祀りの作法が、細かく書かれていた。|祠の床下から、先に来た誰かの手帳が見つかった。最後のページに、走り書きがあった。'), why: '祠の中から手がかりが出てきた' },
    { id: 'nothing', w: 2, t: L('……何も起きなかった。少なくとも、その時は。|風が一度だけ吹いて、止んだ。それだけだった。'), why: '何も起きなかった（ように見えた）' },
    { id: 'possess', w: 1, t: L('{a}の目の焦点が、すっと合わなくなった。それから{a}は、知らないはずの祭りの歌を口ずさみ始めた。|{a}は急に黙り込み、村の方言で「腹が減った」と呟いた。'), why: '何かに取り憑かれた' },
    { id: 'seal', w: 1, t: L('祠が崩れた瞬間、村中の御札が一斉に剥がれ落ちた。村人たちの顔に、初めて焦りが浮かんだ。|祠の下から、神を縛っていた楔が抜け落ちた。――それは、神を弱らせるための楔でもあった。'), why: '祠は神を封じると同時に、村人の力の源でもあった（神への対抗が少しやりやすくなった）' }
  ];

  /* ---------- 村人に襲われる ---------- */
  JS.ATTACK = L('夜道を一人で歩いていた{a}の背後から、鍬を持った村人が三人、無言でついてきていた。|{a}が民宿の風呂に入っていると、脱衣所の戸がゆっくりと開いた。|{a}は畑の中の一本道で、前後を村人に挟まれた。全員が、祭りの面をつけていた。|{a}の部屋の襖が、音もなく開いた。月明かりに、鉈の刃が光った。|井戸の水を汲んでいた{a}の首に、背後から縄がかけられた。');
  JS.ATTACK_OK = L('{a}は手近な棒切れを振り回し、村人たちを追い払った。|{a}は全力で走り、どうにか民宿まで逃げ帰った。|{b}が駆けつけ、{a}の腕を引いて逃げ出した。|{a}は大声で叫んだ。村人たちは顔を見合わせ、闇に溶けるように去っていった。');
  JS.ATTACK_DIE = L('翌朝、{a}の姿はどこにもなかった。村人たちは「お客さんなら、先に帰りなさった」と口を揃えた。|{a}の悲鳴は、祭り囃子にかき消された。|{a}は抵抗したが、相手は多すぎた。引きずられていく{a}の靴が、片方だけ道に残った。|それきり、{a}は戻らなかった。井戸の縁に、{a}の携帯だけが置かれていた。');
  JS.ATTACK_TAKEN = L('{a}は気を失い、気がつくと神社の奥の座敷牢にいた。白い着物を着せられていた。|{a}は村人たちに担がれ、神社の方へ運ばれていった。「この人が、今年の――」|{a}は袋をかぶせられ、どこかへ連れ去られた。仲間たちが気づいたのは、一時間後だった。');

  /* ---------- 怪しい記者（偽情報）と、仕切りたがる警察官 ---------- */
  JS.REPORTER = { name: '自称・オカルト雑誌の記者', lines: L('「この村の神はね、塩に弱いんですよ。盛り塩をしておけば大丈夫」|「祭りの間は、絶対に目を閉じていればいいんです。見なければ、見られない」|「御神体は、火で焼けば消える。昔の記録にそうありました」|「生贄は村人の中から選ばれるんです。我々よそ者は関係ない」|「神社の鈴を三回鳴らせば、神は眠りに戻る。これは確かな情報です」|「村から出るには、来た道を後ろ向きに歩けばいいんですよ」') };
  JS.POLICE = { name: '駐在の警察官', lines: L('「全員、勝手な行動は慎むように。ここは私が仕切ります」|「生贄だの神だの、馬鹿馬鹿しい。全員、公民館で朝まで待機！」|「二手に分かれましょう。私が村長に話をつけてくる」|「民間人は下がっていてください。これは警察の仕事です」|「村の皆さんは善良な方々ですよ。疑うのは失礼でしょう」') };

  /* ---------- 脱出のための早い試み（RTA） ---------- */
  JS.ESCAPE_TRY = L('{a}は夜明け前に車へ走った。エンジンは何度回しても、かからなかった。|{a}は来た道を戻ろうとした。一時間歩いて、村の入口に戻ってきた。|{a}は山道に出たが、濃い霧に包まれ、気づくと神社の鳥居の前に立っていた。|{a}は唯一の吊り橋に辿り着いた。橋は、昨夜のうちに落とされていた。|{a}はバス停で待ち続けた。時刻表には、次のバスは「祭りのあと」とだけ書かれていた。');
  JS.ESCAPE_OK = L('{a}は霧の切れ間を見つけ、そのまま山道を駆け下りた。振り返ると、村はもう見えなかった。|{a}は村の子どもに教わった獣道を抜け、国道に出た。通りかかったトラックが、{a}を拾ってくれた。|{a}は誰にも告げずに、夜明けの一番の光が差した方向へ走った。気づくと、知らない町の駅前にいた。');
})();
