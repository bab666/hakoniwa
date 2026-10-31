;
/* ==== js/jashin-data.js ==== */
HK.Load.def(325,'js/jashin-data.js',function(){
(function(){
'use strict';
var HK=window.HK;
function L(s){return s.split('|');}
var JS=HK.JASHIN={};
JS.VILLAGES=L('鳴神村|比良坂村|御影村|久遠村|霧咲村|黒沼村|忌部村|千代見村|夜刀村|白鷺村|宵宮村|蛭川村|朽木村|常闇村|水底村|鬼灯村|宮守村|音無村|瀬織村|狐塚村');
JS.JOBS=[
{id:'civ',label:'一般人',sk:{talk:0.1,explore:0.05},luck:1,desc:'巻き込まれただけ。運だけは強い'},
{id:'journalist',label:'記者',sk:{talk:0.3,obs:0.15,explore:0.05},desc:'取材慣れしていて、聞き込みと裏取りが得意。記事のために深入りしがち'},
{id:'muno',label:'無能',sk:{},desc:'推理も調査もほぼできない。自分の目標ばかり追って空回りし、場をかき乱す。敵対している相手の足を強烈に引っ張り、巻き添えにして死ぬ'},
{id:'celeb',label:'大物',sk:{talk:0.3},desc:'その界隈では知らない人がいない有名人。村人にも顔を知られていて、話を聞きやすい（目立つ）'},
{id:'writer',label:'作家',sk:{obs:0.25,lore:0.15},desc:'小さな違和感を見逃さない'},
{id:'manager',label:'マネージャー',sk:{talk:0.15,fight:0.1},protect:1,desc:'仲間を守るために動く'},
{id:'occult',label:'オカルト研究家',sk:{lore:0.35,explore:0.1},desc:'伝承と邪神の知識がある'},
{id:'psychic',label:'霊能力者',sk:{spirit:0.55},desc:'見えないものが見える。そのぶん怖い'},
{id:'seer',label:'占い師',sk:{spirit:0.35},foresee:1,desc:'危険を一度だけ予見できる'},
{id:'prof',label:'教授',sk:{lore:0.35,obs:0.1},desc:'民俗と古文書に詳しい'},
{id:'student',label:'生徒',sk:{explore:0.25,talk:0.1},desc:'身軽で、子どもや若い村人と話せる'},
{id:'ghost',label:'心霊研究家',sk:{spirit:0.3,obs:0.15},desc:'機材で異変を記録できる'},
{id:'musician',label:'ミュージシャン',sk:{talk:0.1,rite:0.15,obs:0.1},desc:'祭りの音の違和感に気づく'},
{id:'police',label:'警察官',sk:{fight:0.4,explore:0.1},desc:'村人に襲われても抵抗できる'},
{id:'folk',label:'民俗学者',sk:{lore:0.4,talk:0.1},desc:'祭祀と禁忌の専門家'},
{id:'streamer',label:'配信者',sk:{explore:0.2,talk:0.1},desc:'撮れ高を求めて危ない場所へ行く'},
{id:'doctor',label:'医師',sk:{obs:0.15},heal:1,desc:'怪我人を手当てできる'},
{id:'detective',label:'探偵',sk:{obs:0.3,talk:0.1},desc:'嘘と矛盾を見抜く'},
{id:'sleuth',label:'名探偵',sk:{obs:0.45,lore:0.2,talk:0.15},desc:'頭脳明晰。仲間の死や村の殺人事件の真相を推理で暴く'},
{id:'ponkotsu',label:'ポンコツ探偵',sk:{explore:0.15,talk:0.05},luck:1,desc:'自称名探偵。的外れな推理で邪魔ばかりするが、たまに当たる'},
{id:'priest',label:'神職',sk:{lore:0.2,rite:0.3,spirit:0.15},desc:'祀りの作法を知っている'}
];
JS.JOB={};JS.JOBS.forEach(function(j){JS.JOB[j.id]=j;});
JS.JOB_FIT={
civ:function(t){return 0.4+t.ac*0.2;},journalist:function(t){return t.warmth*0.3+t.fc*0.2+t.a*0.2;},muno:function(t){return 0.12+t.impulse*0.25+(1-t.a)*0.15;},celeb:function(t){return t.fc*0.5+t.warmth*0.3;},writer:function(t){return t.a*0.4+(1-t.fc)*0.2+t.cold*0.2;},
manager:function(t){return t.np*0.4+t.ac*0.3;},occult:function(t){return t.fc*0.3+t.a*0.3+t.impulse*0.2;},psychic:function(t){return t.ac*0.4+t.np*0.2;},
seer:function(t){return t.np*0.3+t.fc*0.3;},prof:function(t){return t.a*0.5+t.cp*0.3;},
student:function(t){return t.fc*0.4+t.impulse*0.3;},ghost:function(t){return t.a*0.3+t.fc*0.3;},musician:function(t){return t.fc*0.5+(1-t.cp)*0.2;},
police:function(t){return t.cp*0.5+t.lead*0.3;},folk:function(t){return t.a*0.5+t.caution*0.2;},streamer:function(t){return t.fc*0.4+t.impulse*0.4;},
doctor:function(t){return t.np*0.4+t.a*0.3;},detective:function(t){return t.a*0.5+t.cold*0.2;},sleuth:function(t){return t.a*0.6+t.caution*0.15+t.cold*0.15-0.1;},ponkotsu:function(t){return t.fc*0.35+t.impulse*0.35+(1-t.a)*0.25-0.1;},priest:function(t){return t.cp*0.3+t.caution*0.3;}
};
function R(t,jobs,fit){return{t:t,jobs:jobs?jobs.split(','):[],fit:fit};}
JS.REASONS=[
R('「この村で起きた連続失踪事件を解いてほしい」という匿名の依頼状が届いた','sleuth,ponkotsu',function(t){return t.a*0.4+t.fc*0.2;}),
R('助手に「たまには休んでください」と温泉旅行に送り出されたが、着いたのがここだった','sleuth',function(t){return t.a*0.3+t.cold*0.2;}),
R('「名探偵の自分の出番だ」と、新聞の小さな記事を勝手に事件だと決めつけて','ponkotsu',function(t){return t.fc*0.4+t.impulse*0.4;}),
R('迷い猫探しの依頼で、猫の足跡を追っていたら','ponkotsu,civ',function(t){return t.fc*0.4+t.np*0.2;}),
R('ネットで見た「地図から消えた村」の噂に惹かれた','occult,streamer,ghost',function(t){return t.fc*0.4+t.impulse*0.3;}),
R('廃村探索の動画を撮るため','streamer,celeb',function(t){return t.fc*0.5+t.impulse*0.3;}),
R('古文書に記された祭祀の実地調査','prof,folk',function(t){return t.a*0.6;}),
R('新作のネタ探しの取材旅行','writer',function(t){return t.a*0.3+t.fc*0.2;}),
R('講演会の前乗りで、近くに泊まっていた','celeb,manager,musician',function(t){return t.cp*0.3+t.ac*0.2;}),
R('担当タレントの付き添い','manager',function(t){return t.np*0.4+t.ac*0.3;}),
R('ゼミの合宿のはずだった','student,prof',function(t){return t.ac*0.3+t.fc*0.2;}),
R('行方不明になった兄を捜して','civ,police,detective,sleuth,ponkotsu',function(t){return t.np*0.4+t.cp*0.3;}),
R('行方不明の友人から届いた最後のメッセージを頼りに','civ,student',function(t){return t.np*0.5;}),
R('亡くなった祖母の生まれ故郷を訪ねて','civ,doctor',function(t){return t.np*0.4+t.ac*0.2;}),
R('相続した古い家の片づけ','civ',function(t){return t.ac*0.3+t.caution*0.2;}),
R('霊視の依頼を受けて','psychic,seer,priest',function(t){return t.np*0.3+t.ac*0.2;}),
R('除霊の依頼が来た','psychic,priest,mage',function(t){return t.cp*0.3+t.np*0.2;}),
R('「本物の神がいる村」と聞いて、確かめたくなった','occult,psychic',function(t){return t.impulse*0.4+t.cold*0.3;}),
R('禁書の写本がこの村にあると聞いた','prof,occult,folk',function(t){return t.a*0.4+t.cold*0.3;}),
R('占いで「北の山に行け」と出た','seer',function(t){return t.fc*0.3+t.ac*0.3;}),
R('夢の中で何度も同じ村を見たから','psychic,seer,writer',function(t){return t.ac*0.4;}),
R('心霊スポット巡りの最終目的地','ghost,streamer,student',function(t){return t.fc*0.5;}),
R('電磁波の異常値を観測した地点を確かめに','ghost,prof',function(t){return t.a*0.5;}),
R('音楽祭の帰りに道を間違えた','musician,civ',function(t){return t.fc*0.3+(1-t.caution)*0.3;}),
R('ツーリング中にカーナビが勝手にこの道を示した','civ,musician',function(t){return t.impulse*0.4;}),
R('バスが途中で止まり、運転手が消えた','civ,student',function(t){return 0.3;}),
R('山で遭難しかけて、明かりを頼りに辿り着いた','civ,police',function(t){return 0.3+t.impulse*0.2;}),
R('失踪事件の捜査で','police,detective,sleuth,ponkotsu',function(t){return t.cp*0.5+t.lead*0.2;}),
R('村から届いた差出人不明の招待状','civ,writer,celeb',function(t){return t.fc*0.3+t.ac*0.2;}),
R('秘湯の宿の宿泊券が当たった','civ,manager',function(t){return t.fc*0.3+t.warmth*0.2;}),
R('古民家カフェ特集の取材','writer,celeb,journalist',function(t){return t.warmth*0.4;}),
R('村おこしのイベントにゲストとして呼ばれた','celeb,musician',function(t){return t.fc*0.4+t.warmth*0.3;}),
R('祭りの奉納演奏を頼まれた','musician,priest',function(t){return t.fc*0.3+t.np*0.2;}),
R('卒業論文のフィールドワーク','student,folk',function(t){return t.a*0.4+t.ac*0.2;}),
R('昔の恋人がこの村の出身だと聞いて','civ,writer',function(t){return t.np*0.3+t.impulse*0.3;}),
R('借金取りから逃げてきた','civ',function(t){return t.impulse*0.4+(1-t.cp)*0.2;}),
R('ネットの懸賞金つき「未確認生物」情報を追って','streamer,occult',function(t){return t.impulse*0.5;}),
R('廃神社の御朱印集めの途中','civ,student',function(t){return t.fc*0.3+t.caution*0.2;}),
R('先祖の墓参りに初めて来た','civ,doctor',function(t){return t.np*0.3+t.cp*0.2;}),
R('村の診療所に赴任することになった','doctor',function(t){return t.np*0.5;}),
R('村の分校に教えに来た','prof',function(t){return t.np*0.4+t.cp*0.2;}),
R('民宿の住み込みバイトの募集を見て','student,civ',function(t){return t.ac*0.4;}),
R('雑誌の「日本のミステリースポット」企画の取材','writer,ghost,celeb,journalist',function(t){return t.fc*0.4;}),
R('依頼人に「娘を連れ戻してほしい」と頼まれて','detective,sleuth,ponkotsu,police',function(t){return t.np*0.3+t.cp*0.3;}),
R('師匠が最後に向かった場所を追って','occult,psychic,priest',function(t){return t.np*0.3+t.cp*0.3;}),
R('流星の落ちた場所を探しに','prof,student',function(t){return t.fc*0.4+t.a*0.2;}),
R('山奥の神社の修復の見積もりに','priest,civ',function(t){return t.cp*0.3+t.a*0.2;}),
R('自分探しの一人旅','civ,writer,musician',function(t){return t.ac*0.3+t.fc*0.2;}),
R('誰かに呼ばれた気がして','psychic,seer',function(t){return t.ac*0.5;}),
R('配信の視聴者から「ここに来て」と座標が送られてきた','streamer',function(t){return t.fc*0.4+t.impulse*0.3;}),
R('都市伝説「見た者は帰れない祭り」の真偽を確かめに','occult,ghost,streamer',function(t){return t.impulse*0.3+t.a*0.3;}),
R('ダム建設の事前調査','prof,civ',function(t){return t.cp*0.3+t.a*0.3;}),
R('展示に使う「古い祭具」を借りに来た','celeb,manager',function(t){return t.cp*0.3;}),
R('昔、この村で神隠しにあったことを思い出して','civ,writer,psychic',function(t){return t.ac*0.4+t.np*0.2;}),
R('骨董の買い付け','civ,writer',function(t){return t.cold*0.3+t.a*0.2;}),
R('ネットで知り合った人のオフ会','civ,student,streamer',function(t){return t.fc*0.4+t.warmth*0.2;}),
R('死んだはずの人をこの村で見たという話を聞いて','detective,sleuth,ponkotsu,psychic,ghost',function(t){return t.a*0.3+t.np*0.3;}),
R('なんとなく、気がついたらここにいた','civ',function(t){return 0.15;})
];
JS.TOURS=L('行き先が当日まで明かされない「シークレット・ミステリーツアー」|抽選で当たった「秘境の祭り体験ツアー」|応募した覚えのない「招待制・限定ツアー」|「参加者同士は初対面」が条件の、謎の体験ツアー|格安すぎる「山奥の湯治場と伝統行事ツアー」');
JS.ACTIONS=[
{id:'ask',label:'村人に話を聞く',fit:function(t){return t.warmth*0.6+t.np*0.2;},jobs:'celeb,journalist,manager,detective,sleuth,ponkotsu,folk,student',type:'talk'},
{id:'explore',label:'村を歩き回る',fit:function(t){return t.fc*0.4+t.impulse*0.4;},jobs:'streamer,student,police,muno',type:'explore'},
{id:'watch',label:'宿で様子を見る',fit:function(t){return t.caution*0.7+t.ac*0.2;},jobs:'civ,writer',type:'obs'},
{id:'record',label:'記録を取る',fit:function(t){return t.a*0.6+t.cold*0.2;},jobs:'ghost,prof,writer,detective,sleuth,ponkotsu',type:'obs'},
{id:'polite',label:'村の作法に従う',fit:function(t){return t.ac*0.5+t.cp*0.3;},jobs:'priest,manager,doctor',type:'talk'},
{id:'read',label:'古い記録や碑を調べる',fit:function(t){return t.a*0.5+t.caution*0.2;},jobs:'prof,folk,occult',type:'lore'},
{id:'sense',label:'気配を探る',fit:function(t){return t.ac*0.3+t.np*0.2;},jobs:'psychic,seer,ghost',type:'spirit'},
{id:'alone',label:'一人で動く',fit:function(t){return t.cold*0.5+t.impulse*0.3;},jobs:'streamer,detective,sleuth,ponkotsu',type:'explore'}
];
JS.GOALS=[
{id:'escape',label:'一刻も早く帰る',fit:function(t){return t.caution*0.6+t.ac*0.3;},jobs:'civ,manager'},
{id:'truth',label:'村の秘密を暴く',fit:function(t){return t.a*0.5+t.fc*0.2;},jobs:'occult,prof,folk,detective,sleuth,ponkotsu,writer'},
{id:'protect',label:'皆を守る',fit:function(t){return t.np*0.5+t.cp*0.3;},jobs:'police,manager,doctor,priest'},
{id:'content',label:'撮れ高を持ち帰る',fit:function(t){return t.fc*0.5+t.impulse*0.3;},jobs:'streamer,celeb,ghost'},
{id:'meet',label:'神をこの目で見る',fit:function(t){return t.impulse*0.4+t.cold*0.3;},jobs:'occult,psychic',surv:0.2},
{id:'deny',label:'迷信だと証明する',fit:function(t){return t.cp*0.4+t.a*0.3+(1-t.ac)*0.2;},jobs:'prof,police,detective,sleuth,ponkotsu'},
{id:'find',label:'捜している人を見つける',fit:function(t){return t.np*0.6;},jobs:'police,detective,sleuth,ponkotsu,civ'},
{id:'solve',label:'事件を解決する',fit:function(t){return t.a*0.5+t.cp*0.2+t.caution*0.1;},jobs:'detective,sleuth,ponkotsu,police'},
{id:'ritual',label:'儀式で別の神を呼ぶ',fit:function(t){return t.cold*0.45+t.a*0.25+t.impulse*0.15-t.warmth*0.3;},jobs:'occult,psychic,priest',rare:0.32,secret:1,surv:0.35},
{id:'hijack',label:'村の儀式を乗っ取る',fit:function(t){return t.cp*0.35+t.cold*0.3+t.a*0.25-t.warmth*0.15;},jobs:'priest,folk,occult,prof',rare:0.45,secret:1,surv:0.7},
{id:'murder',label:'誰かを殺す',fit:function(t){return t.cold*0.45+t.aggr*0.45-t.warmth*0.45-t.ac*0.1+0.1;},rare:0.55,secret:1,surv:0.8},
{id:'love',label:'恋人を作る',fit:function(t){return t.fc*0.35+t.np*0.3+t.impulse*0.25;},jobs:'celeb,streamer,musician,student',rare:0.75},
{id:'steal',label:'借金返済のために盗む',fit:function(t){return t.impulse*0.4+(1-t.cp)*0.3+t.cold*0.2-t.caution*0.2;},jobs:'civ,musician,streamer,writer',rare:0.45,secret:1}
];
JS.GOAL={};JS.GOALS.forEach(function(g){JS.GOAL[g.id]=g;});
JS.NPC={elder:'村長',baba:'長老の老婆',okami:'民宿の女将',kid:'村の子ども',kannushi:'宮司',youth:'村の若い衆',lost:'先に来ていた行方不明者'};
JS.WELCOME=L('{v}の入口で、腰の曲がった村長が待っていた。「よう来なすった。ちょうど祭りの支度中でしてな」|{v}に入ると、畑仕事の手を止めた村人たちが、一斉にこちらを見た。誰も、何も言わなかった。|民宿の女将は満面の笑みで一行を迎えた。「お客さんなんて何年ぶりかねえ。どうぞ、ゆっくりしていって」――ゆっくり、を妙に強調した。|{v}は地図のどこにも載っていなかった。携帯の電波は、村に入った瞬間に途切れた。|村の子どもが一行の人数を数えていた。「……ちょうど、いい」');
JS.ATMOS={
day:L('昼の{v}は、拍子抜けするほど長閑だった。ただ、どの家の軒先にも同じ形の御札が貼られていた。|畑の案山子が、全部こちらを向いていた。|村のどこにいても、神社の太鼓の音がかすかに聞こえた。|村人たちは、一行の名前をなぜか全員知っていた。|昼食に出された料理は豪勢だった。誰も、自分の分には手をつけていなかった。|村の掲示板に、祭りの日程と「お客様をおもてなしする係」の名簿が貼られていた。'),
night:L('夜の{v}は真っ暗だった。街灯の代わりに、軒先の提灯がゆらゆらと揺れていた。|障子の向こうを、誰かが何度も行き来した。足音は一つも聞こえなかった。|夜中、村中の犬が一斉に吠え、そしてぴたりと止んだ。|窓の外から、低い歌声が聞こえた。歌詞は、どこの言葉でもなかった。|民宿の廊下の突き当たりの扉に、外から鍵がかけられていた。|夜明け前、誰かが部屋の前に立っていた。朝になると、足元に濡れた足跡だけが残っていた。')
};
JS.SCARE=L('{a}は鏡に映った自分の背後に、誰かが立っているのを見た。振り返っても、誰もいなかった。|{a}は民宿の押し入れの奥から、自分の名前が書かれた古い名札を見つけた。|{a}の携帯に、圏外のはずなのに一通だけメッセージが届いた。「にげて」|{a}は村の子どもに手を引かれて歩いていた。気づくと、子どもの手は冷たい木の枝に変わっていた。|{a}は夜中に目を覚ました。枕元に、村人が正座してこちらを見下ろしていた。|{a}が撮った写真の全部に、同じ着物の女が写り込んでいた。|{a}は井戸の底から、自分を呼ぶ声を聞いた。母親の声だった。|{a}の部屋の障子に、無数の小さな手形がついていた。内側からだった。|{a}は村の墓地で、今日の日付が刻まれた真新しい墓石を見つけた。名前は、まだ彫られていなかった。|{a}が民宿に戻ると、自分の荷物が「祭り用」と書かれた箱に詰め替えられていた。|{a}は村人に「あんた、前にも来たね」と言われた。初めて来たはずだった。|{a}は夜道で、同じ角を三回曲がった。三回とも、同じ村人が同じ笑顔で立っていた。');
JS.SCARE_REACT={
CP:L('{a}は唇を引き結び、「くだらない」と吐き捨てた。手は震えていた。|{a}は無理やり平静を装った。'),
NP:L('{a}は青ざめながら、真っ先に仲間の無事を確かめに走った。|{a}は「大丈夫、大丈夫」と自分に言い聞かせた。'),
A:L('{a}は震える手でメモを取った。「……記録しておく。あとで説明がつくかもしれない」|{a}は息を整え、何が起きたのかを冷静に整理しようとした。'),
FC:L('{a}は悲鳴を上げて逃げ出した。それから、少しだけ笑った。「やばい、本物だ」|{a}は「撮れてる？　今の撮れてる！？」と叫んだ。'),
AC:L('{a}はその場にしゃがみ込み、しばらく動けなかった。|{a}は泣きそうな顔で、誰かの袖を掴んだ。')
};
JS.SHRINE_BREAK=L('{a}は「こんなのただの石だろ｜こんなものはただの石だろう｜こんなの、ただの石でしょう」と言って、道端の小さな祠を蹴飛ばした。石の扉が、ごとりと落ちた。|{a}は写真を撮ろうと祠に近づき、足を滑らせて祠ごと倒れ込んだ。中の御神体が、地面に転がった。|{a}は祠の中を確かめようと扉をこじ開けた。古い封の紙が、音もなく裂けた。|酔った{a}が、帰り道で祠に寄りかかった。祠は、あっけなく崩れた。|{a}は「迷信だって証明してやる｜迷信だと証明してやる｜迷信だって証明してみせます」と、祠の注連縄を引きちぎった。');
JS.SHRINE_SCOLD=L('「お前……あの祠、壊したんか！？」――村の老人の顔から、血の気が引いていった。|「お前あの祠壊したんか！　なんちゅうことを……もう、だめじゃ……」老婆はその場に座り込み、念仏を唱え始めた。|村の若い衆が駆けつけ、崩れた祠を見て言葉を失った。「……神さんが、起きなさる」|宮司が祠の前で膝をついた。「あれは、封じておったんです。あれを、封じておったんです……」');
JS.SHRINE_FX=[
{id:'curse',w:3,t:L('その夜から、{a}の首筋に黒い痣が浮かび始めた。痣は、日ごとに手の形になっていった。|{a}は眠るたびに、祠の前に立っている夢を見るようになった。'),why:'呪われた（時間が経つと命に関わる）'},
{id:'rage',w:3,t:L('村人たちの目つきが変わった。一行は、もう「お客様」ではなかった。|その日から、村人は誰も一行に口をきかなくなった。代わりに、鎌を研ぐ音があちこちから聞こえ始めた。'),why:'村人の敵意が一気に上がった'},
{id:'wake',w:2,t:L('地の底から、低い唸り声が響いた。神は、予定より早く目覚めようとしていた。|山の向こうの空が、一瞬だけ赤く光った。祭りの刻限が、早まった。'),why:'神の目覚めが早まった（儀式までの時間が短くなった）'},
{id:'clue',w:2,t:L('崩れた祠の中から、油紙に包まれた古い帳面が出てきた。祀りの作法が、細かく書かれていた。|祠の床下から、先に来た誰かの手帳が見つかった。最後のページに、走り書きがあった。'),why:'祠の中から手がかりが出てきた'},
{id:'nothing',w:2,t:L('……何も起きなかった。少なくとも、その時は。|風が一度だけ吹いて、止んだ。それだけだった。'),why:'何も起きなかった（ように見えた）'},
{id:'possess',w:1,t:L('{a}の目の焦点が、すっと合わなくなった。それから{a}は、知らないはずの祭りの歌を口ずさみ始めた。|{a}は急に黙り込み、村の方言で「腹が減った」と呟いた。'),why:'何かに取り憑かれた'},
{id:'seal',w:1,t:L('祠が崩れた瞬間、村中の御札が一斉に剥がれ落ちた。村人たちの顔に、初めて焦りが浮かんだ。|祠の下から、神を縛っていた楔が抜け落ちた。――それは、神を弱らせるための楔でもあった。'),why:'祠は神を封じると同時に、村人の力の源でもあった（神への対抗が少しやりやすくなった）'}
];
JS.ATTACK=L('夜道を一人で歩いていた{a}の背後から、鍬を持った村人が三人、無言でついてきていた。|{a}が民宿の風呂に入っていると、脱衣所の戸がゆっくりと開いた。|{a}は畑の中の一本道で、前後を村人に挟まれた。全員が、祭りの面をつけていた。|{a}の部屋の襖が、音もなく開いた。月明かりに、鉈の刃が光った。|井戸の水を汲んでいた{a}の首に、背後から縄がかけられた。');
JS.ATTACK_OK=L('{a}は手近な棒切れを振り回し、村人たちを追い払った。|{a}は全力で走り、どうにか民宿まで逃げ帰った。|{b}が駆けつけ、{a}の腕を引いて逃げ出した。|{a}は大声で叫んだ。村人たちは顔を見合わせ、闇に溶けるように去っていった。');
JS.ATTACK_DIE=L('翌朝、{a}の姿はどこにもなかった。村人たちは「お客さんなら、先に帰りなさった」と口を揃えた。|{a}の悲鳴は、祭り囃子にかき消された。|{a}は抵抗したが、相手は多すぎた。引きずられていく{a}の靴が、片方だけ道に残った。|それきり、{a}は戻らなかった。井戸の縁に、{a}の携帯だけが置かれていた。');
JS.ATTACK_TAKEN=L('{a}は気を失い、気がつくと神社の奥の座敷牢にいた。白い着物を着せられていた。|{a}は村人たちに担がれ、神社の方へ運ばれていった。「この人が、今年の――」|{a}は袋をかぶせられ、どこかへ連れ去られた。仲間たちが気づいたのは、一時間後だった。');
JS.REPORTER={name:'自称・オカルト雑誌の記者',lines:L('「この村の神はね、塩に弱いんですよ。盛り塩をしておけば大丈夫」|「祭りの間は、絶対に目を閉じていればいいんです。見なければ、見られない」|「御神体は、火で焼けば消える。昔の記録にそうありました」|「生贄は村人の中から選ばれるんです。我々よそ者は関係ない」|「神社の鈴を三回鳴らせば、神は眠りに戻る。これは確かな情報です」|「村から出るには、来た道を後ろ向きに歩けばいいんですよ」')};
JS.POLICE={name:'駐在の警察官',lines:L('「全員、勝手な行動は慎むように。ここは私が仕切ります」|「生贄だの神だの、馬鹿馬鹿しい。全員、公民館で朝まで待機！」|「二手に分かれましょう。私が村長に話をつけてくる」|「民間人は下がっていてください。これは警察の仕事です」|「村の皆さんは善良な方々ですよ。疑うのは失礼でしょう」')};
JS.ESCAPE_TRY=L('{a}は夜明け前に車へ走った。エンジンは何度回しても、かからなかった。|{a}は来た道を戻ろうとした。一時間歩いて、村の入口に戻ってきた。|{a}は山道に出たが、濃い霧に包まれ、気づくと神社の鳥居の前に立っていた。|{a}は唯一の吊り橋に辿り着いた。橋は、昨夜のうちに落とされていた。|{a}はバス停で待ち続けた。時刻表には、次のバスは「祭りのあと」とだけ書かれていた。');
JS.ESCAPE_OK=L('{a}は霧の切れ間を見つけ、そのまま山道を駆け下りた。振り返ると、村はもう見えなかった。|{a}は村の子どもに教わった獣道を抜け、国道に出た。通りかかったトラックが、{a}を拾ってくれた。|{a}は誰にも告げずに、夜明けの一番の光が差した方向へ走った。気づくと、知らない町の駅前にいた。');
})();
});
;
/* ==== js/jashin-jobs.js ==== */
HK.Load.def(326,'js/jashin-jobs.js',function(){
(function(){
'use strict';
var HK=window.HK,JS=HK&&HK.JASHIN;
if(!JS|| !JS.JOBS)return;
function L(s){return s.split('|');}
function clamp(v,a,b){return Math.max(a,Math.min(b,v));}
var NEW=[
{id:'lawyer',label:'弁護士',sk:{talk:0.3,lore:0.15},lie:0.3,desc:'交渉と古い証文の読み解きが得意。村人を言いくるめるのもうまい（正直な人ほど嘘は下手）'},
{id:'accountant',label:'経理',sk:{lore:0.25,obs:0.2},desc:'帳簿と数字の違和感に強い。寄進帳や資料館の古い記録から、隠れた金の流れを見つける'},
{id:'sales',label:'営業',sk:{talk:0.35,explore:0.05},lie:0.25,desc:'人の懐に入るのがうまい。断られても粘り、名刺一枚で村の有力者に会う'},
{id:'nurse',label:'看護師',sk:{obs:0.15,talk:0.15},desc:'手当てで村人や仲間の信頼を得る。薬の種類や量にも詳しい'},
{id:'mechanic',label:'整備士',sk:{explore:0.15,obs:0.15,fight:0.1},desc:'車・発電機・壊れた機械を直せる。村の仕掛けの不自然さにも気づく'},
{id:'farmer',label:'農家',sk:{explore:0.2,obs:0.1,fight:0.05},desc:'畑・土・空模様の異変に敏い。村の年寄りとも話が合う'}
];
if(!JS.JOB.lawyer){
var at= -1;
JS.JOBS.forEach(function(j,i){if(j.id==='priest')at=i;});
if(at<0)at=JS.JOBS.length-1;
Array.prototype.splice.apply(JS.JOBS,[at+1,0].concat(NEW));
NEW.forEach(function(j){JS.JOB[j.id]=j;});
}
var LIE={lawyer:0.3,sales:0.25,celeb:0.15,journalist:0.1};
var FIT={
lawyer:function(t){return t.a*0.35+t.cp*0.25+t.cold*0.15;},
accountant:function(t){return t.a*0.35+t.caution*0.3+t.ac*0.1;},
sales:function(t){return t.warmth*0.35+t.fc*0.25+t.np*0.1;},
nurse:function(t){return t.np*0.45+t.caution*0.15;},
mechanic:function(t){return t.a*0.2+t.impulse*0.15+t.cp*0.15+0.05;},
farmer:function(t){return t.ac*0.25+t.np*0.2+t.caution*0.15;}
};
if(JS.JOB_FIT)Object.keys(FIT).forEach(function(k){if(!JS.JOB_FIT[k])JS.JOB_FIT[k]=FIT[k];});
function R(t,jobs,fit){return{t:t,jobs:jobs.split(','),fit:fit};}
if(JS.REASONS&& !JS.REASONS.some(function(r){return r.jobs.indexOf('lawyer')>=0;})){
JS.REASONS.push(
R('依頼人に代わって、相続した山林の境界の立ち会いを頼まれた','lawyer',function(t){return t.cp*0.4+t.a*0.2;}),
R('亡くなった依頼人の遺言書に、この村の名前が書かれていた','lawyer,civ',function(t){return t.a*0.4+t.np*0.2;}),
R('村の農協から、古い帳簿を見てほしいと頼まれた','accountant',function(t){return t.a*0.4+t.ac*0.2;}),
R('取引先の古い請求書の宛先を辿ってきた','accountant,sales',function(t){return t.caution*0.3+t.a*0.3;}),
R('山奥の温泉の湯の花を売り込む、飛び込み営業の途中で','sales',function(t){return t.fc*0.4+t.warmth*0.3;}),
R('村の診療所の応援に呼ばれた','nurse,doctor',function(t){return t.np*0.5;}),
R('故障した村の巡回バスの修理を頼まれて','mechanic',function(t){return t.cp*0.3+t.a*0.2;}),
R('峠道でエンストした車を直しているうちに日が暮れた','mechanic,civ',function(t){return t.impulse*0.3+t.a*0.2;}),
R('珍しい在来種の種籾を分けてもらいに','farmer',function(t){return t.ac*0.3+t.np*0.2;}),
R('農業体験の受け入れ先として、この村を紹介された','farmer,student',function(t){return t.fc*0.3+t.np*0.2;})
);
var ADD={'相続した古い家の片づけ':'lawyer','亡くなった祖母の生まれ故郷を訪ねて':'nurse','バスが途中で止まり、運転手が消えた':'mechanic','骨董の買い付け':'sales','村おこしのイベントにゲストとして呼ばれた':'sales','ダム建設の事前調査':'accountant,lawyer','山奥の神社の修復の見積もりに':'accountant','先祖の墓参りに初めて来た':'farmer'};
JS.REASONS.forEach(function(r){if(ADD[r.t])ADD[r.t].split(',').forEach(function(j){if(r.jobs.indexOf(j)<0)r.jobs.push(j);});});
}
function addJobs(list,map){(list||[]).forEach(function(o){if(map[o.id]&&o.jobs!=null&& !/lawyer|accountant|sales|nurse|mechanic|farmer/.test(o.jobs))o.jobs+=','+map[o.id];});}
addJobs(JS.ACTIONS,{ask:'lawyer,sales,nurse',explore:'mechanic,farmer',record:'accountant',polite:'nurse,farmer',read:'accountant,lawyer'});
addJobs(JS.GOALS,{escape:'mechanic',truth:'lawyer,accountant',protect:'nurse',deny:'mechanic,accountant',find:'lawyer',steal:'sales'});
var TYPE_JP={obs:'観察',lore:'知識',talk:'聞き込み',spirit:'霊感',explore:'探索',fight:'腕っぷし',rite:'作法',lie:'嘘のうまさ',heal:'手当て'};
function E(id,job,sk,prefer,intro,ok,ng,opt){var o={id:id,job:job,sk:sk,prefer:prefer?prefer.split(','):[],intro:L(intro),ok:ok,ng:ng};for(var k in opt||{})o[k]=opt[k];return o;}
var EV=[
E('law_talk','lawyer','talk','talk',
'{a}は村長の家を訪ね、縁側で茶をすすりながら、相手の話をひとつも遮らずに聞いた。|{a}は民宿の女将に、宿の土地の権利で困っていないかと、さりげなく切り出した。|{a}は寄り合い帰りの年寄りを呼び止め、「少し話を聞かせてほしい｜少し話を聞かせてくれ｜少しお話を聞かせていただけますか」と頭を下げた。',
[['{a}は相手の言葉尻を拾い、言い逃れの道を一つずつ塞いでいった。気づけば相手は、言うつもりのなかったことまで口にしていた。――','clue,calm'],
['{a}は「あなたに不利なことにはならない｜あなたに不利なことにはならない｜あなたに不利なことにはなりません」と穏やかに請け合った。相手は長いため息をつき、ぽつりと漏らした。――','clue,calm']],
[['{a}の話しぶりは、村の人間には理詰めすぎた。相手は笑ってみせたが、目は笑っていなかった。「＠先生は、口がうまいねえ」','hostile'],
['{a}が土地の権利の話を持ち出した途端、相手の顔がこわばった。「＠……今日のところは、お引き取りください」','hostile']]),
E('law_deed','lawyer','lore','lore,obs',
'{a}は役場の書庫で、村の土地の権利書と古い養子縁組の届けを一枚ずつ繰った。|{a}は名主の家の蔵に残る証文の束を借り出し、法律家の目で読み比べた。',
[['どの代にも、決まった家から一人ずつ養子が出され、その養子は決まって祭りの年に転出していた。生贄の家系が、書類の上に浮かび上がった。――','clue'],
['土地の売買の証文に、立会人として同じ名前が百年分並んでいた。人の寿命では、ありえない長さだった。――','clue']],
[['崩し字の多い古い証文は、さすがの{a}にも手に余った。読み解けたのは、どうでもいい境界争いの記録だけだった。','none'],
['{a}は証文の一節を読み違え、祭りの日取りは代替わりで変わったのだと思い込んだ。一行は、ありもしない猶予を信じた。','fake']]),
E('law_lie','lawyer','lie','',
'村の若い衆が{a}を取り囲んだ。「＠あんた、本当は何しに来た。役所の回し者か」|駐在所の前で、村長が{a}を呼び止めた。「＠お客さん、ずいぶん熱心に村のことを調べていなさるね」',
[['{a}は眉ひとつ動かさず、「ただの観光だよ。仕事の疲れを取りに来ただけ｜ただの観光だ。仕事の疲れを取りに来ただけだ｜ただの観光です。仕事の疲れを取りに来ただけですよ」と答えた。法廷で鍛えた顔には、嘘の継ぎ目がひとつもなかった。村人たちは毒気を抜かれ、黙って散っていった。','calm']],
[['{a}は言いくるめようとしたが、声がわずかに上ずった。根が正直なぶん、嘘はどうにも下手だった。その夜から、民宿の前に見張りが立つようになった。','hostile2'],
['{a}の答えは筋が通りすぎていた。「＠よう考えた言い訳だ」――村人たちは顔を見合わせ、{a}の顔をじっと覚えるように見た。','hostile2']],
{cond:function(S){return S.hostile>=25;}}),
E('acc_ledger','accountant','lore','lore,obs',
'{a}は社務所の棚から、埃をかぶった寄進帳を抜き出した。|{a}は神社の賽銭と寄進の出納帳を、指で一行ずつなぞった。',
[['金額は毎年ほぼ同じだった。ただ、祭りの年だけ、決まった家からの寄進が十倍に跳ねていた。口止め料か、それとも何かの代金か。――','clue'],
['帳尻は合っていた。合いすぎていた。誰かが、ある年の支出をまるごと別の名目に書き換えていた。――','clue']],
[['{a}が帳面をめくっていると、背後で襖が開いた。「＠勝手に何を見とる」――宮司の目が、冷たく光った。','hostile'],
['数字は几帳面に並んでいるのに、何の違和感も拾えなかった。{a}は首をかしげたまま、帳面を棚に戻した。','none']]),
E('acc_archive','accountant','lore','lore',
'村の郷土資料館は、資料が年代も種類もばらばらに箱へ詰め込まれていた。{a}は袖をまくり、「まず分類しよう｜まず分類する｜まず分類しましょう」と呟いた。|{a}は資料館の受付簿と収蔵品の目録を照らし合わせ、欠けている番号を書き出していった。',
[['書類の整理は、{a}の本業だった。二時間後、目録から抜け落ちていた一冊の綴りが、箱の底から出てきた。――','clue'],
['欠番は三つ。どれも同じ年の祭りの記録だった。{a}は、ほかの箱に紛れ込ませてあった一枚を見つけ出した。――','clue']],
[['整理は半分も終わらないうちに日が傾いた。分かったのは、誰かが先に資料を荒らしていったことだけだった。','fear'],
['{a}が見つけた綴りは、隣の村の記録だった。それに気づいたのは、一行に話して聞かせたあとだった。','fake']],
{cond:function(S,p,h){return!JS.night(h);}}),
E('acc_inn','accountant','obs','obs,talk',
'{a}は民宿の帳場に置かれた宿帳を、女将が席を外した隙にめくった。|{a}は民宿の帳場の古い宿帳と、台所の仕入れの伝票を並べてみた。',
[['宿泊者の欄は、祭りのたびに埋まっていた。だが会計の欄には、どの客にも精算の印がなかった。誰一人、宿代を払って帰っていない。――','clue'],
['泊まった客の数と、翌朝の朝食の仕入れの数が、祭りの年だけ一人ぶん合わなかった。――','clue']],
[['{a}が宿帳を閉じたとき、女将が戸口に立っていた。「＠何か、お探しかい」――女将はそれ以上何も言わず、宿帳を奥へしまい込んだ。','hostile']]),
E('sal_card','sales','talk','talk',
'{a}は村でいちばん大きな屋敷の門を叩き、名刺を差し出した。|{a}は網元だという屋敷の主に、名刺一枚で面会を取りつけた。',
[['{a}の人懐こい笑顔に、屋敷の主はつい座敷へ通してしまった。世間話から三十分、話は村の祭りに及んだ。――','clue,calm'],
['{a}は相手の自慢話に感心してみせ、ここぞというところで一つだけ質問を挟んだ。主は得意げに答えた。――','clue']],
[['「＠うちは、よそ者には会わん」――門は、名刺ごと閉ざされた。','hostile'],
['{a}が渡した名刺を、相手は見もせずに囲炉裏へくべた。','hostile']]),
E('sal_stick','sales','talk','talk',
'一度は追い返された長老の老婆の家に、{a}はまた顔を出した。手土産の菓子折りは、三つ目だった。|{a}は、口を開かない村の男の畑仕事を黙って手伝った。昨日も、その前の日もそうした。',
[['とうとう相手のほうが根負けした。「＠……あんた、しつこいねえ。上がりな」――','clue'],
['夕方、男は鍬を置いて、ぼそりと言った。「＠……一度しか言わんぞ」――','clue']],
[['次の日、家の前には塩が撒かれていた。{a}はそれ以上、近づけなかった。','hostile,fear']],
{bonus:0.1}),
E('sal_lie','sales','lie','talk',
'「＠あんた、何の用でこの村に来た」――村の男に問われ、{a}は鞄から名刺入れを出した。|祭りの支度をする女たちが、{a}を遠巻きに見ていた。{a}は自分から近づいていった。',
[['{a}は「村おこしの仕事で来たんだよ。この村の特産品を探してて｜村おこしの仕事で来た。この村の特産品を探している｜村おこしの仕事で参りました。この村の特産品を探しているんです」と、すらすらと名乗った。口から出まかせだったが、相手はすっかり信じ込み、祭りの支度の手伝いにまで誘ってくれた。','calm,clue?']],
[['{a}の作り話は、細部まで出来すぎていた。「＠村おこしなら、役場を通すはずだがね」――相手の目に、疑いの色が浮かんだ。','hostile2']]),
E('nur_care','nurse','talk','talk',
'{a}は、畑仕事で腰を痛めたという老人に、手持ちの湿布を貼ってやった。|{a}は、転んで膝をすりむいた村の子どもを抱き起こし、傷口を水で洗って絆創膏を貼った。',
[['老人は何度も頭を下げ、帰りがけに声をひそめた。「＠親切なあんたにだけ言うがな」――','clue,calm'],
['子どもの母親が礼を言いに来た。母親は人目を気にしながら、早口で耳打ちした。――','clue']],
[['「＠よそ者の薬なんぞいらん」――相手は手を払いのけ、足早に帰っていった。','none'],
['すぐに村の女が駆けつけ、相手を{a}から引き離した。振り返る者は、誰もいなかった。','hostile']]),
E('nur_drug','nurse','obs','',
'夕食の膳の吸い物から、かすかに苦い匂いがした。{a}は箸を止めた。|民宿の女将が勧めてくる「＠よく眠れるお茶」の色に、{a}は見覚えがあった。',
[['{a}は「飲まないで。眠り薬が入ってる。量が多い｜飲むな。眠り薬が入っている。量が多い｜飲まないでください。眠り薬が入っています。量が多いです」と一行を止めた。その夜、民宿の廊下を誰かが何度も行き来したが、誰も眠り込んではいなかった。','save']],
[['{a}が気づいたのは、皆が飲み干したあとだった。一行は泥のように眠り込み、目を覚ましたのは何時間も経ってからだった。','sleep']],
{cond:function(S,p,h){return JS.night(h)&&S.P.filter(JS.alive).length>=2;}}),
E('nur_heal','nurse','heal','',
'{a}は、青い顔で黙り込んでいる{b}の脈を取った。|{a}は{b}の傷を見るなり、鞄から包帯と消毒液を取り出した。',
[['手際のいい処置だった。{a}は「大丈夫。ゆっくり息をして｜大丈夫だ。ゆっくり息をしろ｜大丈夫です。ゆっくり息をしてください」と、病棟の夜勤のときと同じ静かな声で言った。{b}の呼吸が、少しずつ落ち着いていった。','heal']],
[['手持ちの道具では、できることが限られていた。{a}は唇を噛み、{b}の手を握っていることしかできなかった。','heal1']],
{cond:function(S,p){return!!hurtMate(S,p);},bonus:0.15}),
E('mec_fuel','mechanic','obs','',
'{a}は村の車庫に並ぶ軽トラックを、一台ずつ覗いて回った。|{a}は一行の乗ってきた車のボンネットを開け、首をひねった。',
[['どの車も、燃料タンクが空にされていた。抜き方が丁寧すぎる。村人は最初から、よそ者を帰さないつもりだ。{a}は農機小屋の奥に隠された缶を見つけ、一缶だけこっそり持ち出した。','flee'],
['配線が一本だけ、きれいに切られていた。{a}は工具を置いて言った。「これで一台は動く。いざとなったら、これで逃げよう｜これで一台は動く。いざとなったら、これで逃げるぞ｜これで一台は動きます。いざとなったら、これで逃げましょう」','flee']],
[['{a}が車の下に潜り込んでいると、懐中電灯の光が車庫の入口を照らした。{a}は工具を置いたまま、裏口から逃げ出すしかなかった。','hostile']]),
E('mec_gen','mechanic','explore','explore,obs',
'神社の裏手で、古いディーゼル発電機が低く唸っていた。{a}は太い配線を目で辿った。|村の電柱の配線が、一本だけ山の方へ延びていた。{a}はそれを辿って、藪の中へ入っていった。',
[['電線は社の床下へ引き込まれ、地下で何かを動かしていた。祭りの夜にだけ回る、大きな仕掛けがある。――','clue'],
['配電盤の内側に、手書きの点検表が貼られていた。日付は、どれも祭りの前日だった。――','clue']],
[['{a}が配電盤の蓋を開けた瞬間、腐った端子から火花が散った。{a}は指先を焼かれ、しばらく工具を握れなかった。','hurt']]),
E('mec_video','mechanic','obs','obs,spirit',
'{a}は民宿の押し入れの奥で、泥だらけのスマートフォンを見つけた。前に来た誰かのものらしい。|{a}は村はずれの崖下に落ちていた車から、ドライブレコーダーを外した。',
[['{a}は基板の水気を拭い、手持ちの部品で電源をつないだ。画面に、最後の映像が映った。――','clue'],
['割れた記録媒体を、{a}は半日かけて読み出した。ノイズの奥に、祭りの夜の様子が残っていた。――','clue']],
[['{a}がどれだけ手を尽くしても、画面は黒いままだった。最後に一度だけ、ノイズ混じりの声が漏れた。「＠にげて」','fear']]),
E('far_field','farmer','explore','explore,obs',
'{a}は村の畑を見て回り、一か所で足を止めた。|{a}は棚田のあぜ道にしゃがみ込み、土を指でつまんで匂いを嗅いだ。',
[['一区画だけ、作物が育っていなかった。土が、ほかより新しい。掘り返して、また埋めた土だ。――','clue'],
['畑の土に、白い骨のかけらが混じっていた。肥料の骨粉ではなかった。――','clue']],
[['「＠うちの畑で何しとる」――鍬を担いだ村の男が、{a}の背後に立っていた。','hostile'],
['{a}は土の色の違いに気づいたが、深く掘る前に日が暮れた。','none']],
{cond:function(S,p,h){return!JS.night(h);}}),
E('far_weather','farmer','lore','lore,explore',
'{a}は夕焼けの色と、山から下りてくる風の湿り気を確かめた。|{a}は村の井戸を覗き込み、石組みに残る水位の跡を数えた。',
[['{a}は空を見上げて言った。「明け方、谷に霧が出る。霧が出れば、村人の目も届かない｜明け方、谷に霧が出る。霧が出れば、村人の目も届かない｜明け方、谷に霧が出ます。霧が出れば、村人の目も届きません」長年空を見てきた者の読みだった。','fog'],
['井戸の水位は、祭りの日に向けて少しずつ下がるよう、誰かが堰で調節していた。水が引いた井戸の底に、何かがある。――','clue']],
[['空模様は、{a}の知っているどの山とも違った。風は山から吹き下ろすのではなく、山へ吸い込まれていた。','fear']]),
E('jou_paper','journalist','lore','lore,talk',
'{a}は公民館の書棚で、村の広報誌の古い綴りを見つけた。|{a}は駐在所の掲示板に貼られたまま黄ばんだ、昔の新聞の切り抜きを一枚ずつ剥がした。',
[['祭りの翌月の号には、決まって「村を出て都会へ働きに行った若者」の小さな記事が載っていた。名前は、毎回違った。――','clue'],
['切り抜きの裏に、鉛筆で走り書きがあった。前にこの村を取材した記者の字だった。――','clue']],
[['{a}が記者だと、すぐに知れ渡った。「＠書かれて困ることなんて、この村には何もないよ」――村人たちは、口を揃えてそう言った。','hostile']]),
E('pol_ask','police','talk','talk,obs',
'{a}は、夜道でうろつく村の若者を呼び止め、職務質問の要領で名前と行き先を尋ねた。|{a}は、祭りの支度をする若い衆の一人を、さりげなく人の輪から引き離した。',
[['若者の目が、問いのたびに神社の方へ泳いだ。{a}は嘘の継ぎ目を一つずつ突き、とうとう本当のことを吐かせた。――','clue']],
[['{a}の口調には、取り調べの癖が出すぎていた。若者は黙り込み、翌朝には村中に「よそ者の刑事」の噂が広まっていた。','hostile']]),
E('wri_engi','writer','obs','lore,obs',
'{a}は神社に掲げられた村の縁起を、声に出さずに読んだ。|{a}は民宿の床の間に飾られた、村の由来を記した巻物を広げた。',
[['文章の調子が、途中で一度だけ変わっていた。書き手が違う。誰かが、都合の悪い一段を書き換えたのだ。――','clue']],
[['美しい文章だった。{a}は読み終えてから、何ひとつ違和感を拾えなかったことに気づいた。','none']]),
E('mus_beat','musician','obs','obs,rite',
'祭り囃子の稽古の音が、風に乗って聞こえてきた。{a}は指で拍子を取った。|{a}は太鼓の練習をする村の子どもの横に座り、同じ節を口ずさんだ。',
[['拍子は、ただの囃子ではなかった。何かを数えている。数えているのは、日にちだ。――','clue']],
[['{a}が節の続きを口ずさんだ瞬間、太鼓がぴたりと止んだ。「＠……その先を、どこで覚えた」','hostile']])
];
var BY={};EV.forEach(function(e){(BY[e.job]=BY[e.job]||[]).push(e);});
var CAP=5,PER=2;
function free(p){return JS.alive(p)&& !p.bound&& !p.mad;}
function jobL(p){var j=JS.JOB[p.job];return j?j.label:'';}
function lieSkill(p){
var t=p.tr||{},hon=t.honesty!=null?t.honesty:0.5;
return clamp(0.15+(LIE[p.job]||0)+(1-hon)*0.4+(t.cold||0)*0.12+(t.caution||0)*0.08-p.m.fear/300,0,1.2);
}
function skillOf(p,sk){return sk==='lie'?lieSkill(p):sk==='heal'?clamp(0.45+JS.skill(p,'obs')*0.5,0,1.2):JS.skill(p,sk);}
function hurtMate(S,p){
return S.P.filter(function(q){return q!==p&&free(q)&&(q.m.hp<60||q.m.fear>70);}).sort(function(x,y){return x.m.hp-y.m.hp;})[0]||null;
}
function gain(S,p,prefer){
var left=S.G.clues.map(function(c,k){return k;}).filter(function(k){return S.found.indexOf(k)<0;});
if(!left.length)return'';
var pref=left.filter(function(k){return(prefer||[]).indexOf(S.G.clues[k].type)>=0;}),k=(pref.length?pref:left)[0];
S.found.push(k);if(p&&p.cnt)p.cnt.clue++;
return S.G.clues[k].t+'。';
}
function apply(S,p,fx,e,b){
var add='',why=[];
fx.split(',').forEach(function(f){
switch(f){
case'clue':case'clue?':
if(f==='clue?'&&S.rng()>0.45)break;
var c=gain(S,p,e.prefer);
if(c){add+=c;why.push('手がかり '+S.found.length+'/'+S.G.clues.length);}
else if(f==='clue'){add+='だが、それはもう一行が掴んでいる事実だった。';S.hostile=clamp(S.hostile-3,0,100);why.push('手がかりは出そろっていた（村人の敵意 −3）');}
break;
case'calm':S.hostile=clamp(S.hostile-5,0,100);why.push('村人の敵意 −5');break;
case'hostile':S.hostile=clamp(S.hostile+5,0,100);why.push('村人の敵意 +5');break;
case'hostile2':S.hostile=clamp(S.hostile+9,0,100);p.m.fear=clamp(p.m.fear+4,0,100);why.push('嘘が見破られた（村人の敵意 +9）');break;
case'fake':S.fake=(S.fake||0)+1;why.push('偽の手がかりをつかんだ（対抗策を実行するときに不利）');break;
case'hurt':p.m.hp=clamp(p.m.hp-12,0,100);p.m.fear=clamp(p.m.fear+5,0,100);why.push('怪我（体力 −12）');break;
case'fear':p.m.fear=clamp(p.m.fear+8,0,100);why.push('恐怖 +8');break;
case'flee':S.fleeBonus=(S.fleeBonus||0)+0.06;why.push('逃げるときの足を確保した（儀式の夜に逃げ延びやすくなる）');break;
case'fog':S.fog=(S.fog||0)+1;why.push('霧の出る時刻を読んだ（逃げ道が見つかりやすくなる）');break;
case'save':
p.foresee=true;
var o=S.P.filter(function(q){return q!==p&&free(q)&& !q.foresee;})[0];
if(o)o.foresee=true;
why.push(p.name+(o?'と'+o.name:'')+'は、次の村人の襲撃を一度だけかわせる');
break;
case'sleep':
S.P.filter(free).forEach(function(q){q.jobBusy=S.h+2;q.m.fear=clamp(q.m.fear+4,0,100);});
why.push('一行が眠り込んだ（次の時間は動けない）');
break;
case'heal':if(b){b.m.hp=clamp(b.m.hp+18,0,100);b.m.fear=clamp(b.m.fear-12,0,100);why.push(b.name+'の体力 +18・恐怖 −12');}break;
case'heal1':if(b){b.m.fear=clamp(b.m.fear-5,0,100);why.push(b.name+'の恐怖 −5');}break;
}
});
return{add:add,why:why.join('・')};
}
function fire(S,p,e,h){
var rng=S.rng,b=e.id==='nur_heal'?hurtMate(S,p):null;
var sk=skillOf(p,e.sk),ch=clamp(0.25+sk*0.6+(e.bonus||0)-(night0(h)&&e.sk==='talk'?0.05:0),0.1,0.9);
var ok=rng()<ch,pool=ok?e.ok:e.ng,pk=pool[Math.floor(rng()*pool.length)];
var m={a:p.name,b:b?b.name:''};
var r=apply(S,p,pk[1],e,b);
var text=ST.fmt(ST.pick(S,e.intro),m)+ST.fmt(pk[0],m)+r.add;
S.jobN=(S.jobN||0)+1;p.jobN=(p.jobN||0)+1;S.jobUsed[e.id]=1;
if(JS.DRAMA&&JS.DRAMA.setRel&&b&&ok)JS.DRAMA.setRel(S,p,b,0.12,'手当て',p);
var o=ST.say(S,{actors:b?[p,b]:[p],tag:'職業・'+jobL(p),text:text,
why:jobL(p)+'の腕（'+TYPE_JP[e.sk]+'の力 '+Math.round(sk*100)+(e.sk==='lie'?'。正直な人ほど嘘は下手':'')+'）→ '+(ok?'成功':'失敗')+(r.why?'：'+r.why:''),mag:ok?20:16,jev:e.id,jok:ok});
return o;
}
var ST=HK.Story;
function night0(h){return JS.night?JS.night(h):false;}
JS.JOBEV={
EV:EV,gain:gain,lieSkill:lieSkill,free:free,CAP:CAP,
setup:function(S){
S.jobN=0;S.jobUsed={};S.P.forEach(function(p){p.jobN=0;p.jobBusy=null;});
var G=JS.GT;
if(G&&G.WEAPON&& !G.WEAPON.mechanic){G.WEAPON.lawyer='万年筆';G.WEAPON.accountant='金属の定規';G.WEAPON.sales='ネクタイ';G.WEAPON.nurse='薬の注射器';G.WEAPON.mechanic='スパナ';G.WEAPON.farmer='草刈り鎌';}
if(G&&G.STEAL_JOB&& !G.STEAL_JOB.mechanic){
G.STEAL_JOB.lawyer='{a}は「相続の書類を確かめに来たよ｜相続の書類を確かめに来た｜相続の書類を確かめに参りました」と言って、名主の家の蔵に上がり込んだ。';
G.STEAL_JOB.accountant='{a}は寄進の帳簿付けを手伝うと言って、社務所の金庫の前に座った。';
G.STEAL_JOB.sales='{a}は「ちょっと点検に来たよ｜点検に来た｜点検に参りました」と言って、村の家々を回った。';
G.STEAL_JOB.nurse='{a}は寝たきりの老人の見舞いを口実に、奥の部屋へ入った。';
G.STEAL_JOB.mechanic='{a}は農機の修理を引き受けるふりをして、納屋に入り込んだ。';
G.STEAL_JOB.farmer='{a}は畑の手伝いを申し出て、村の倉に出入りした。';
}
if(JS.JOBPAIR)JS.JOBPAIR.setup(S);
},
tick:function(S,live,h){if(JS.JOBPAIR&& !S.solved)JS.JOBPAIR.tick(S,live,h);},
act:function(S,p,h,live){
if(p.jobBusy!=null&&h<=p.jobBusy){if(h===p.jobBusy)p.jobBusy=null;return true;}
if(S.solved|| !S.jobUsed||(S.jobN||0)>=CAP-(S.jobPairN||0)||(p.jobN||0)>=PER||h<2)return false;
var list=(BY[p.job]||[]).filter(function(e){return!S.jobUsed[e.id]&&(!e.cond||e.cond(S,p,h));});
if(!list.length)return false;
if(S.rng()>((p.jobN||0)?0.1:0.18))return false;
fire(S,p,list[Math.floor(S.rng()*list.length)],h);
return true;
}
};
})();
});
;
/* ==== js/jashin-jobs-pair.js ==== */
HK.Load.def(327,'js/jashin-jobs-pair.js',function(){
(function(){
'use strict';
var HK=window.HK,JS=HK&&HK.JASHIN;
if(!JS)return;
function L(s){return s.split('|');}
function clamp(v,a,b){return Math.max(a,Math.min(b,v));}
function J(id,a,b,s1,s2,tag,prefer,win,lose,t){return{id:id,a:a,b:b,s1:s1,s2:s2,tag:tag,prefer:prefer?prefer.split(','):[],win:win,lose:lose,intro:L(t.intro),ok:L(t.ok),ng:L(t.ng),love:t.love,bad:t.bad};}
var PAIRS=[
J('law_jou','lawyer','journalist','lore','talk','情報の取引','talk,lore','clue','hostile',{
intro:'{b}は取材メモを、{a}は役場で写してきた登記簿の控えを、民宿の座卓に並べた。「情報を交換しよう｜情報を交換しよう｜情報を交換しましょう」と{a}が言った。',
ok:'{b}の聞き込みと{a}の書類が、一点で重なった。村の土地は、ここ百年で少しずつ、すべて同じ名義へ移されていた。名義人の生年は、二百年前だった。――|{b}が村人から聞いた「昔の大火事」の年に、{a}の写した登記簿では、村の半分の家の持ち主が一斉に書き換わっていた。――',
ng:'二人が集めた話は、どこまでも噛み合わなかった。そのうえ、{b}が役場で写しを頼んだことが、もう村中に知れ渡っていた。',
love:'{a}と{b}は、仕事の話を家に持ち帰っても喧嘩にならない二人だった。今夜も、座卓の上で互いのメモを自然に取り替えた。',
bad:'{a}は{b}に、肝心の一枚だけは見せなかった。{b}も、取材メモの最後のページを手のひらで隠していた。'}),
J('law_pol','lawyer','police','talk','fight','取り調べの攻防','talk','clue','hostile',{
intro:'{b}が駐在所の机を借り、事情を聞くだけだと言って村長を呼び出した。隣には{a}が、手帳を開いて座った。',
ok:'{b}が問い詰め、{a}が逃げ道を塞いだ。追及と弁護の両方を知る二人の前で、村長の答えはしだいに辻褄を失い、最後にひとつの事実をこぼした。――',
ng:'{b}が詰め寄るたび、{a}が「それは誘導だよ｜それは誘導だ｜それは誘導です」と口を挟んだ。取り調べの癖と弁護の癖がぶつかり合い、村長はその隙に、涼しい顔で帰っていった。',
love:'{a}と{b}は、法廷でなら向かい合う側の仕事だった。それでも今夜は、同じ側の椅子に並んで座った。',
bad:'{b}は{a}を犯罪者の味方だと思っていた。{a}は{b}を、冤罪を作る側の人間だと思っていた。二人の睨み合いに、村長のほうが面食らっていた。'}),
J('law_acc','lawyer','accountant','lore','lore','証文と帳簿','lore,obs','clue','fake',{
intro:'{a}は蔵から借り出した古い証文を、{b}は社務所で写した寄進帳の数字を、同じ年ごとに並べ直した。',
ok:'寄進が跳ねた年と、養子縁組の証文が交わされた年が、ぴたりと重なっていた。生贄に選ばれる家は、そのたびに金で黙らされていた。――|証文の立会人の家だけが、どの年も寄進を免除されていた。村の誰が祭りを仕切っているのか、数字が白状していた。――',
ng:'二人は年号の数え方を取り違えた。元号の切り替わりを一年ずらしたまま、存在しない生贄の年を一つ作り上げてしまった。',
love:'{a}と{b}は、書類に向かうときの沈黙が苦にならない二人だった。互いの手元を見なくても、次に渡すべき紙が分かった。',
bad:'{b}は{a}の読みには数字の裏付けがないと切り捨て、{a}は{b}の表など法的には何の意味もないと突き返した。'}),
J('law_pri','lawyer','priest','lore','rite','祭りの取り決め','rite,lore','clue','hostile',{
intro:'{b}は社務所の奥の文箱を開け、{a}に古い契約書を見せた。神社と氏子のあいだで交わされた、祭りの取り決めだった。',
ok:'{b}が祝詞の言い回しを読み解き、{a}が条文の抜け道を見つけた。氏子でない者を祭りに差し出せば、村の誰も罪に問われない。そういう取り決めだった。――',
ng:'文箱を開けたことが、すぐに宮司に知れた。「＠神域の文書に、よそ者が触れるとは」――{b}が同じ神職であることが、かえって怒りを買った。',
love:'{b}は{a}にだけ、神職として決して外に出してはならない文箱を開けて見せた。',
bad:'{b}は神域の文書を俗世の契約書のように扱う{a}が気に入らず、{a}は{b}の勿体ぶった前置きに苛立っていた。'}),
J('acc_cel','accountant','celeb','obs','talk','寄付金の行方','obs,lore','clue','hostile',{
intro:'{b}は数年前、この村の村おこしの番組に出たことを思い出した。{a}は、そのときの寄付金の流れを、公民館に貼られた村の決算書と突き合わせた。',
ok:'番組の寄付金は、決算書のどこにも載っていなかった。代わりに祭具修繕費の欄が、その年だけ膨らんでいた。――',
ng:'{b}が決算書の控えを見せてほしいと役場に頼んだせいで、話が一気に広まった。「＠あの有名人が、村の金を調べとるらしい」',
love:'{a}は{b}の仕事の契約書を、いつも代わりに読んでやっていた。今度もそうするだけだと、{a}は言った。',
bad:'{b}は{a}に頼み事をするのが癪でたまらず、{a}は{b}の金遣いの荒さを内心で軽蔑していた。'}),
J('acc_man','accountant','manager','obs','obs','請求書の束','obs','clue','time',{
intro:'{b}が民宿から受け取った請求書の束を、{a}が一枚ずつ電卓で検めた。',
ok:'請求書の品目に、一行だけ見慣れないものが混じっていた。白装束、人数ぶん一式。すでに用意されていた。――|宿代の請求は、一行が着いた日の前の日付で切られていた。泊まる人数まで、最初から決まっていた。――',
ng:'二人は請求書の数字を三度合わせ直したが、どこにも違和感はなかった。気づけば、夜が更けていた。',
love:'{b}は、電卓を叩く{a}の横顔を、少し誇らしげに見ていた。',
bad:'{a}は{b}の雑な経費の付け方に呆れ、{b}は{a}の細かさにうんざりしていた。'}),
J('sal_cel','sales','celeb','talk','talk','顔つなぎ','talk','calm','hostile',{
intro:'{a}は{b}を連れて、村長の屋敷を訪ねた。{a}は「有名な人を連れてきたよ｜有名な人を連れてきた｜有名な方をお連れしました」と、いつもの営業の調子で口上を述べた。',
ok:'村長は{b}の顔を見るなり相好を崩し、色紙を三枚も持ってきた。{a}は機嫌のいいうちにと、祭りの話をさりげなく振った。――',
ng:'村長は{b}の顔を知らなかった。{a}の口上だけが座敷に空回りし、二人は茶も出されずに追い返された。',
love:'{a}は{b}の隣に立つと、いつもより声に張りが出た。{b}も、{a}の前ではよく笑った。',
bad:'{b}は{a}の客寄せに使われるのが気に食わず、{a}は{b}の気まぐれに何度も段取りを崩された。'}),
J('sal_str','sales','streamer','talk','explore','撮影の交渉','explore,obs','clue','hostile',{
intro:'{b}が祭りの撮影をしたいと言い出し、{a}が交渉役を買って出た。相手は、社の鍵を預かる老人だった。',
ok:'{a}の粘りに根負けした老人は、昼のあいだだけという約束で、社の裏の禁域に二人を通した。{b}のカメラが、苔むした石の扉を捉えた。――',
ng:'{a}の交渉の最中に、{b}が勝手にカメラを回し始めた。老人の顔色が変わった。「＠撮るなと言うたろうが」',
love:'{a}は{b}の配信のためなら、どんな相手にも頭を下げるつもりだった。',
bad:'{a}は{b}の再生数稼ぎに付き合わされるのが不満で、{b}は{a}の交渉の遅さに苛立っていた。'}),
J('nur_doc','nurse','doctor','obs','obs','阿吽の呼吸','talk,spirit,obs','clue','hostile',{
intro:'村の外れの家で、寝たきりの老人が高い熱を出していた。{b}が診察を始めると、{a}は言われる前に湯を沸かし、器具を並べた。',
ok:'{b}の指示と{a}の手が、ひとつの生き物のように動いた。熱が下がり始めたころ、老人がうわ言のように繰り返した。――',
ng:'処置の途中で、村の女たちが家に押しかけてきた。「＠余計なことをせんでください。この人は、祭りまでこのままでええんです」――二人は家から追い出された。',
love:'{a}と{b}は、病院の夜勤で何度も同じ修羅場をくぐってきた。いまは、それ以上の間柄だった。',
bad:'{b}は{a}の手際に口を出し、{a}は{b}の指示の遅さに内心で舌打ちした。病院でも、二人はずっとこうだった。'}),
J('nur_psy','nurse','psychic','obs','spirit','看取り','spirit,talk','clue','fear',{
intro:'民宿の離れで、女将の母だという老婆が、静かに息を引き取ろうとしていた。{a}が枕元で脈を取り、{b}はその背後に立つ何かを見ていた。',
ok:'{a}が老婆の手を握って落ち着かせ、{b}がその背後の気配に語りかけた。老婆は最期に、はっきりした声で一言だけ残した。――',
ng:'{b}が「後ろにいる｜後ろにいる｜後ろにいます」と呟いた瞬間、老婆が目を見開いて叫んだ。二人は逃げるように離れを出た。',
love:'{a}は、{b}が怖いものを見るたびに震える手を、いつも黙って握ってきた。今夜も、そうした。',
bad:'{a}は霊だの何だのを信じておらず、{b}はその鈍さを軽蔑していた。それでも、老婆の枕元では二人とも黙った。'}),
J('mec_str','mechanic','streamer','obs','explore','映像の復元','obs,spirit','clue','fake',{
intro:'{b}のカメラが、夜中に勝手に録画を止めていた。{a}はカメラを分解し、記録媒体を取り出した。',
ok:'{a}が壊れた記録を読み出すと、{b}の知らない映像が残っていた。録画が止まる直前、カメラの前を横切った影があった。――',
ng:'復元できたのは、途切れ途切れの数秒だけだった。{b}はそれを決定的な証拠だと言い張り、一行は間違った方向に希望を抱いた。',
love:'{a}は{b}の機材を、いつも誰より丁寧に扱った。それが{a}なりの、大事にしているという伝え方だった。',
bad:'{a}は{b}の機材の扱いの雑さに呆れ、{b}は{a}に借りを作るのが嫌でたまらなかった。'}),
J('mec_pol','mechanic','police','explore','fight','駐在所の車','','flee','hurt',{
intro:'無人の駐在所の裏に、タイヤを外されたパトカーが停められていた。{b}が見張りに立ち、{a}が車の下に潜り込んだ。',
ok:'{a}は物置の奥からタイヤを見つけ出し、{b}の手を借りてはめ直した。無線は壊されていたが、車は動く。いざというときの足が手に入った。',
ng:'ジャッキが外れ、車体が傾いた。{b}がとっさに{a}を引きずり出したが、二人とも腕を擦りむき、工具は車の下に残ったままになった。',
love:'{b}は見張りに立ちながら、何度も車の下の{a}の足元を振り返った。',
bad:'{b}は{a}に命令口調で指図し、{a}はわざと返事をしなかった。'}),
J('far_fol','farmer','folk','explore','lore','田の暦と祭りの暦','lore,rite','clue','fake',{
intro:'{a}は村の苗代の様子を、{b}は祭りの由来書を、それぞれ持ち寄った。種まきと刈り入れの時期を、祭りの暦に重ねてみた。',
ok:'祭りは、本来なら刈り入れのあとにあるはずだった。この村だけ、田植えの前に行われている。豊作を祈る祭りではない。何かを鎮める祭りだ。――',
ng:'{b}の読んだ暦と、{a}の知る土地の暦は、ひと月ずれていた。二人はそのずれに気づかないまま、もっともらしい答えを作ってしまった。',
love:'{a}と{b}は、畑と書物という違う場所から、同じものを見ようとしていた。それが二人の、いつもの過ごし方だった。',
bad:'{a}は{b}の机上の空論が気に入らず、{b}は{a}の勘頼みを学問ではないと見下していた。'}),
J('far_doc','farmer','doctor','obs','obs','毒草','','save','hurt',{
intro:'夕食に出された山菜のおひたしを見て、{a}が箸を止めた。{b}も、皿の端の葉の形に眉をひそめた。',
ok:'{a}が葉の形を、{b}が症状を言い当てた。山菜に混ぜられていたのは、少量なら眠気を、量によっては心臓を止める毒草だった。二人は一行の膳から、こっそりそれを取り除いた。',
ng:'二人が気づいたのは、何口か食べてしまったあとだった。{b}がすぐに吐かせたが、二人ともその夜は熱にうなされた。',
love:'{a}は{b}の皿にだけは、いつも自分で選んだ野菜をよそっていた。',
bad:'{a}は医者の知ったかぶりが嫌いで、{b}は{a}の言い伝え頼みを鼻で笑っていた。それでも、皿の上の葉には二人とも見覚えがあった。'})
];
function tiesOf(S,a,b){return(S.ties||[]).filter(function(t){return(t.a===a.i&&t.b===b.i)||(t.a===b.i&&t.b===a.i);});}
var CAT={
fear:'fear,abuse',apathy:'apathy',love:'lover,mate,fated,spouse,almost',fiance:'fiance',
family:'parent,pparent,sibprot,sibling,sibclose,sibbad,relative,stepsib',bad:'enemy,rival,bad',
blind:'blind,worship,yan,fond',lead:'boss,mentor,teacher,senpai,master',crush:'crush,honmei',ex:'ex',
close:'best,buddy,childhood,friend,comrade,colleague,classmate,benefactor'
};
var ORDER=['fear','apathy','love','fiance','family','bad','blind','lead','crush','ex','close'];
function relOf(S,a,b){
var ts=tiesOf(S,a,b);
for(var i=0;i<ORDER.length;i++){
var k=ORDER[i],hit=ts.filter(function(t){return CAT[k].split(',').indexOf(t.type)>=0;})[0];
if(!hit)continue;
var A=hit.a===a.i?a:b,B=A===a?b:a,p=a,q=b;
var lab=HK.Sib&&HK.Sib.isSibTie(hit)&&HK.tieLabel?HK.tieLabel(hit):HK.TIES&&HK.TIES[hit.type]?HK.TIES[hit.type].label:hit.type;
if(k==='fear'){p=hit.type==='abuse'?B:A;q=p===a?b:a;}
else if(k==='apathy'||k==='blind'||k==='crush'||k==='lead'){p=A;q=B;}
else if(k==='family'){if(/^(parent|pparent|sibprot)$/.test(hit.type)){p=A;q=B;}else k='sib';}
else if(k==='love'||k==='fiance'){p=guard(a)>=guard(b)?a:b;q=p===a?b:a;}
return{k:k,p:p,q:q,lab:lab};
}
return{k:'none',p:a,q:b,lab:ts.length?(HK.TIES&&HK.TIES[ts[0].type]?HK.TIES[ts[0].type].label:'知人'):'初対面'};
}
function guard(p){return p.tr.np*0.5+p.tr.cp*0.3+p.tr.lead*0.2+(p.stats.stamina||3)*0.04;}
var RT={
love:{L:L('{p}は{q}の半歩前に立った。何かあれば、先に自分が引き受けるつもりだった。|二人は目だけで頷き合った。長い付き合いの二人に、段取りの相談はいらなかった。'),
ok:L('作業を終えると、{q}は小さく息をつき、{p}の袖をそっとつかんだ。二人の顔から、少しだけ怖さが抜けた。|{p}は{q}の肩に手を置き、「一緒でよかった｜一緒でよかった｜一緒でよかったです」と囁いた。'),
ng:L('物音がした瞬間、{p}はとっさに{q}を背中にかばった。崩れてきた棚の角が、{p}の肩を打った。|{p}は{q}の手を引いてその場を離れ、自分の腕の擦り傷には構わなかった。{p}は「あなたが無事なら、それでいい｜あなたが無事なら、それでいい｜あなたが無事なら、それでいいんです」と言った。')},
fiance:{L:L('{a}と{b}は、家どうしが決めた許嫁だった。並んで歩く距離を、二人ともまだ測りかねていた。|許嫁の{a}と{b}は、こういうときにどう振る舞えばいいのか分からず、妙に丁寧に互いを気遣った。'),
ok:L('答えが出ると、二人は初めて自然に顔を見合わせて笑った。|{q}は、思っていたより頼りになる許嫁の横顔を、こっそり見直した。'),
ng:L('{p}は{q}をかばうように前へ出た。許嫁として、それくらいはしなければと思った。')},
family:{L:L('{p}は{q}に「危ないところは私がやる｜危ないところは私がやる｜危ないところは私がやります」と言い、前に出ようとする{q}を手で制した。|{q}が先に立とうとすると、{p}が黙ってその腕をつかんだ。家族のあいだでは、それだけで話は通じた。'),
ok:L('{q}は少し得意げに{p}を見た。{p}は苦笑して、{q}の肩を軽く叩いた。|{p}は何も言わなかったが、帰り道、{q}の荷物を黙って持ってやった。'),
ng:L('{p}が早めに引き上げさせたおかげで、{q}は危ない目に遭わずに済んだ。{q}は不満そうだったが、何も言わなかった。|{p}は「今日はここまで｜今日はここまでだ｜今日はここまでにしましょう」と{q}を連れて引き返した。{q}は振り返り、悔しそうに唇を噛んだ。')},
sib:{L:L('{a}と{b}は、子どものころと同じように軽口を叩き合いながら、作業を分けた。|血のつながった二人は、相談しなくても互いの癖を知っていた。'),
ok:L('{p}は「やっぱり、あなたと組むと早い｜やはり、あなたと組むと早い｜やはり、あなたと組むと早いですね」と言い、{q}は照れくさそうに鼻を鳴らした。'),
ng:L('{p}と{q}は、失敗の責任をなすりつけ合った。それでも帰り道は、並んで歩いた。')},
close:{L:L('{a}と{b}は、気心の知れた仲だった。どちらかが言いかけたことを、もう片方が引き取って続けた。|{a}と{b}は息を合わせて作業を分けた。互いの得意なことは、言わなくても分かっていた。'),
ok:L('{a}と{b}は顔を見合わせ、小さく拳を合わせた。'),
ng:L('肩を落とした{a}に、{b}は「次があるよ｜次がある｜次がありますよ」と笑ってみせた。')},
lead:{L:L('{p}は{q}に手早く指示を出した。{q}は言われたとおりに動き、{p}は全体を見渡した。|{p}は{q}に「あなたはそっちを見て。私はこっちを見る｜あなたはそっちを見てくれ。私はこっちを見る｜あなたはそちらを見てください。私はこちらを見ます」と、慣れた口ぶりで仕事を割り振った。'),
ok:L('{p}は{q}に「よくやった｜よくやった｜よくやりましたね」と声をかけた。{q}は少しだけ胸を張った。|{q}は{p}に教わったとおりの手順で、最後の確認をした。{p}は黙って頷いた。'),
ngWarm:L('{p}は失敗を{q}のせいにはせず、「指示を誤ったのは私だ｜指示を誤ったのは私だ｜指示を誤ったのは私です」と言った。'),
ngCold:L('{p}は{q}の手際の悪さを叱りつけた。{q}はうつむき、それきり口をきかなかった。')},
blind:{L:L('{p}は{q}の言うことなら、何でも正しいと思っていた。{q}が指さした場所を、{p}は疑いもせずに調べた。|{p}は{q}の判断を一度も疑わなかった。{q}が「ここだ｜ここだ｜ここです」と言えば、そこが答えだった。'),
ok:L('{q}の読みは当たっていた。{p}は、やはりこの人は正しいと、胸の中で繰り返した。'),
ng:L('{q}の読みは外れていた。だが{p}は、それを最後まで信じて疑わなかった。外れた答えが、そのまま一行の手がかりの中に紛れ込んだ。')},
fear:{L:L('{p}は{q}と同じ場所にいるだけで、体がこわばった。何を頼まれても、{p}は小さく頷くことしかできなかった。|{p}は{q}の顔をまともに見られなかった。結局、作業のほとんどを{q}が一人でこなした。'),
ok:L('{q}が一人で答えにたどり着くあいだ、{p}は部屋の隅で息を殺していた。'),
ng:L('{q}が舌打ちをした。{p}はびくりと肩を震わせ、手にしていたものを取り落とした。')},
bad:{L:L('{a}と{b}は、互いに手柄を譲る気がなかった。作業は、ほとんど競争になった。|{a}は{b}の手元を盗み見ながら、自分の見つけたことは何ひとつ口にしなかった。'),
ok:L('{a}は見つけたものを先に懐へ入れようとしたが、{b}がそれを見逃さなかった。結局、二人とも同じ答えにたどり着いていた。|{b}は「あなたのおかげじゃない｜あなたのおかげではない｜あなたのおかげではありません」と言い捨てたが、その答えは{a}の読みと同じだった。'),
ng:L('{a}はわざと見当違いのことを口にし、{b}はそれを鵜呑みにしかけた。どちらが騙したのか、もう分からなかった。'),
ng2:L('二人は互いの読みを否定し合い、そのあいだに時間ばかりが過ぎた。遠くから、村人の誰かがそれを見て笑っていた。')},
apathy:{L:L('{p}は{q}に何の関心も示さなかった。二人は並んで作業をしながら、ひと言も言葉を交わさなかった。|{p}は{q}の言うことに相づちも打たず、自分の手元だけを見ていた。'),
ok:L('答えが出ても、{p}は{q}の方を見もしなかった。{q}だけが、それを手帳に書き留めた。'),
ng:L('失敗しても、{p}は表情ひとつ変えなかった。{q}は、ため息をついた。')},
ex:{L:L('{a}と{b}は、かつて恋人どうしだった。気まずい沈黙のまま、それでも昔と同じ段取りで手が動いた。|{a}と{b}は、別れてから初めて二人きりになった。互いに目を合わせないまま、作業を分け合った。'),
ok:L('答えが出た瞬間、二人は思わず昔のように顔を見合わせ、すぐに目をそらした。'),
ng:L('{a}は「昔からそうだった｜昔からそうだった｜昔からそうでしたね」とこぼし、{b}は聞こえないふりをした。')},
crush:{L:L('{p}は{q}の隣で作業できるのが嬉しくて、いつもより張り切った。|{p}は{q}にいいところを見せようと、自分から一番面倒な役を引き受けた。'),
ok:L('{q}に礼を言われ、{p}は照れ隠しに手帳ばかりめくった。'),
ng:L('{p}は{q}の前で失敗したことが悔しくて、しばらく顔を上げられなかった。')},
none:{L:L('{a}と{b}は、この村で初めて言葉を交わした仲だった。まずは名刺代わりに、互いの仕事の話から始めた。|{a}は{b}に「改めて、よろしく｜改めて、よろしく頼む｜改めて、よろしくお願いします」と頭を下げた。互いの得意なことを確かめ合うところからだった。'),
ok:L('作業を終えるころには、二人は昔からの仕事仲間のように息が合っていた。'),
ng:L('まだ互いの癖が分からず、二人の段取りは何度も噛み合わなかった。')}
};
var BONUS={close:0.15,love:0.1,sib:0.1,lead:0.08,fiance:0.03,family: -0.05,crush:0.05,blind:0,ex: -0.05,none: -0.05,apathy: -0.12,bad: -0.1,fear: -0.22};
var RELD={close:[0.1,-0.03],love:[0.12,0.08],sib:[0.1,-0.05],lead:[0.15,0],fiance:[0.15,0.05],family:[0.1,0.03],crush:[0.1,-0.05],blind:[0.1,0],ex:[0.05,-0.05],none:[0.15,0.02],apathy:[0,0],bad:[-0.05,-0.15],fear:[0,-0.05]};
var LAB={close:'息の合う二人',love:'かばい合う二人',sib:'軽口',lead:'指示と信頼',fiance:'許嫁の歩み寄り',family:'止める家族',crush:'張り切り',blind:'盲信',ex:'昔の段取り',none:'名刺代わり',apathy:'',bad:'手柄の取り合い',fear:''};
var KJP={close:'親しい仲',love:'恋人',sib:'きょうだい・親族',lead:'上下の関係',fiance:'許嫁',family:'家族（守る側がいる）',crush:'片想い',blind:'盲信・信仰・執着',ex:'元恋人',none:'初対面',apathy:'無関心',bad:'敵対・不仲',fear:'恐怖'};
var SK={obs:'観察',lore:'知識',talk:'聞き込み',spirit:'霊感',explore:'探索',fight:'腕っぷし',rite:'作法'};
var RATE=0.75,MAXP=2;
function jobL(id){var j=JS.JOB[id];return j?j.label:id;}
function clamp100(v){return clamp(v,0,100);}
function setRel(S,a,b,d,lab,from){if(d&&JS.DRAMA&&JS.DRAMA.setRel)JS.DRAMA.setRel(S,a,b,d,lab,from);}
JS.JOBPAIR={
PAIRS:PAIRS,RT:RT,relOf:relOf,
setup:function(S){
var rng=S.rng,P=S.P,cand=[];
S.jobQ=[];S.jobPairN=0;
PAIRS.forEach(function(e){
var prs=[];
P.forEach(function(a){if(a.job!==e.a)return;P.forEach(function(b){if(b!==a&&b.job===e.b)prs.push([a,b]);});});
if(prs.length)cand.push({e:e,pr:prs[Math.floor(rng()*prs.length)]});
});
for(var i=cand.length-1;i>0;i--){var j=Math.floor(rng()*(i+1)),t=cand[i];cand[i]=cand[j];cand[j]=t;}
var used={};
cand.forEach(function(c){
if(S.jobQ.length>=MAXP||used[c.pr[0].i]||used[c.pr[1].i]||rng()>RATE)return;
used[c.pr[0].i]=used[c.pr[1].i]=1;
var at=Math.min(Math.max(2,S.deadline-4),2+2*Math.floor(rng()*6)+S.jobQ.length*2);
S.jobQ.push({e:c.e,a:c.pr[0],b:c.pr[1],at:at,done:false});
});
S.jobPairN=S.jobQ.length;
},
tick:function(S,live,h){
var F=JS.JOBEV.free,fired=0;
(S.jobQ||[]).forEach(function(q){
if(q.done||h<q.at||fired)return;
if(!JS.alive(q.a)|| !JS.alive(q.b)){if(!q.a.alive|| !q.b.alive||h>q.at+12)q.done=true;return;}
if(!F(q.a)|| !F(q.b)){if(h>q.at+8)q.done=true;return;}
q.done=true;fired++;
fire(S,q,h);
});
}
};
function fire(S,q,h){
var rng=S.rng,e=q.e,a=q.a,b=q.b,R=relOf(S,a,b),T=RT[R.k]||RT.none;
var sa=JS.skill(a,e.s1),sb=JS.skill(b,e.s2);
if(R.k==='lead'){if(R.p===a)sa*=1.15;else sb*=1.15;}
if(R.k==='fear'){if(R.p===a)sa*=0.4;else sb*=0.4;}
var bonus=BONUS[R.k]||0,sum=sa+sb,ok=sum+bonus+(rng()-0.5)*0.5>=1.0;
var m={a:a.name,b:b.name,p:R.p.name,q:R.q.name};
function F(t){return ST.fmt(t,m);}
function pk(l){return l&&l.length?l[Math.floor(rng()*l.length)]:'';}
var own=rng()<0.7,lead=own&&R.k==='love'&&e.love?e.love:own&&R.k==='bad'&&e.bad?e.bad:pk(T.L);
var t=F(pk(e.intro))+F(lead),why=[],parent=R.k==='family';
if(ok){
t+=F(pk(e.ok));
if(e.win==='clue'){var c=JS.JOBEV.gain(S,a,e.prefer);if(c){t+=c;why.push('手がかり '+S.found.length+'/'+S.G.clues.length);}else{t=t.replace(/――$/,'')+'だが、それはもう一行が掴んでいる事実だった。';S.hostile=clamp100(S.hostile-3);why.push('手がかりは出そろっていた（村人の敵意 −3）');}}
else if(e.win==='calm'){S.hostile=clamp100(S.hostile-8);why.push('村人の敵意 −8');var c2=JS.JOBEV.gain(S,a,['talk']);if(c2){t+=c2;why.push('手がかり '+S.found.length+'/'+S.G.clues.length);}else t=t.replace(/――$/,'');}
else if(e.win==='flee'){S.fleeBonus=(S.fleeBonus||0)+0.1;why.push('逃げるときの足を確保した（儀式の夜に逃げ延びやすくなる）');}
else if(e.win==='save'){a.foresee=true;b.foresee=true;why.push('二人とも、次の村人の襲撃を一度だけかわせる');}
t+=F(pk(T.ok));
[a,b].forEach(function(p){p.m.fear=clamp100(p.m.fear-(R.k==='love'||R.k==='close'?6:3));});
if(R.k==='fear')R.p.m.fear=clamp100(R.p.m.fear+8);
}else{
t+=F(pk(e.ng));
var lose=parent&& /^(hurt|hostile)$/.test(e.lose)?'fear':e.lose;
if(lose==='hostile'){S.hostile=clamp100(S.hostile+6);why.push('村人の敵意 +6');}
else if(lose==='fake'){S.fake=(S.fake||0)+1;why.push('偽の手がかりをつかんだ');}
else if(lose==='hurt'){[a,b].forEach(function(p){p.m.hp=clamp100(p.m.hp-10);p.m.fear=clamp100(p.m.fear+5);});why.push('二人とも怪我（体力 −10）');}
else if(lose==='fear'){[a,b].forEach(function(p){p.m.fear=clamp100(p.m.fear+8);});why.push('恐怖 +8'+(parent&&e.lose!=='fear'?'（'+R.p.name+'が早めに引き上げさせ、痛手は小さかった）':''));}
else if(lose==='time'){a.jobBusy=b.jobBusy=h+2;why.push('時間を使い果たした（次の時間も動けない）');}
if(R.k==='lead')t+=F(pk(R.p.tr.warmth>=0.5?T.ngWarm:T.ngCold));
else if(R.k==='bad'){var two=rng()<0.5;t+=F(pk(two?T.ng:T.ng2));if(two){S.fake=(S.fake||0)+1;why.push('わざと見当違いのことを言った（偽の手がかり）');}else{S.hostile=clamp100(S.hostile+3);why.push('言い争いを村人に見られた（村人の敵意 +3）');}}
else t+=F(pk(T.ng));
if(R.k==='blind'){S.fake=(S.fake||0)+1;why.push(R.p.name+'が外れた読みを信じ込んだ（偽の手がかり）');}
if(R.k==='love'){R.p.m.hp=clamp100(R.p.m.hp-8);R.q.m.fear=clamp100(R.q.m.fear-6);why.push(R.p.name+'が'+R.q.name+'をかばった');}
if(R.k==='fear')R.p.m.fear=clamp100(R.p.m.fear+8);
}
var rd=(RELD[R.k]||[0,0])[ok?0:1];
if(R.k==='lead'&& !ok)rd=R.p.tr.warmth>=0.5?0.05: -0.15;
setRel(S,a,b,rd,LAB[R.k]||'',R.k==='blind'||R.k==='crush'||R.k==='fear'?R.p:null);
a.jobBusy=Math.max(a.jobBusy||0,h);b.jobBusy=Math.max(b.jobBusy||0,h);
S.jobN=(S.jobN||0)+1;
ST.say(S,{actors:[a,b],tag:'職業の組・'+e.tag,text:t,
why:jobL(a.job)+'×'+jobL(b.job)+'（関係：'+R.lab+'＝'+(KJP[R.k]||'')+'）／'+(ok?'成功':'失敗')+'：'+SK[e.s1]+'＋'+SK[e.s2]+'の合計 '+Math.round(sum*100)+(bonus?'、関係の補正 '+(bonus>0?'+':'')+Math.round(bonus*100):'')+(why.length?'→ '+why.join('・'):''),mag:ok?24:20,jev:e.id,jrel:R.k,jok:ok});
}
var ST=HK.Story;
})();
});
;
/* ==== js/jashin-gods.js ==== */
HK.Load.def(328,'js/jashin-gods.js',function(){
(function(){
'use strict';
var HK=window.HK,JS=HK.JASHIN;
if(!JS)return;
function G(id,name,call,look,clues,sol,rite,myth){
return{id:id,name:name,call:call,look:look,clues:clues.split('|').filter(function(c){return c.indexOf(':')>0;}).map(function(c){var k=c.indexOf(':');return{type:c.slice(0,k),t:c.slice(k+1)};}),sol:sol,rite:rite,myth: !!myth};
}
JS.GODS=[
G('dagon','ダゴン','海の父さま','海沿いの村で、村人の多くが魚のように離れた目と、ぬめった肌をしていた。',
'obs:村人の多くが、まばたきをしない。目が、魚のように左右に離れている|explore:井戸の水が塩辛い。この村の井戸は、海とつながっている|talk:子どもが「大きくなったら海に帰るんだ」と嬉しそうに言った|lore:神社の石像は、魚と人の混ざった姿。台座に「深きもの」と刻まれている|spirit:夜の浜から、無数の何かが這い上がってくる気配がする',
'海に面した祭壇の石像を砕き、五芒の「旧き印」を刻んだ石を祭壇に据える','満潮の夜、生贄を岩場に縛り、海から来るものに差し出す',1),
G('cthulhu','クトゥルフ','眠りの大神','村人は皆、ひどく眠そうで、口々に同じ夢の話をしていた。',
'obs:村人の家々の壁に、同じタコのような頭の絵が描かれている|talk:村人は「あの方は夢の中で話しかけてくださる」と言う|lore:古文書に「ふんぐるい むぐるうなふ」で始まる祈りの文句がある|spirit:眠ると、海の底の都市の夢を見る。誰かが呼んでいる|explore:神社の奥に、海へ続く地下の水路がある',
'夢の中で呼びかけに応えないよう、夜通し誰も眠らずに過ごし、明け方に水路の入口を崩して塞ぐ','星辰の揃う夜、生贄を水路の奥へ沈め、目覚めを促す',1),
G('hastur','ハスター','名を呼んではならぬ方','村の家々の窓という窓に、黄色い布が掛けられていた。',
'obs:村のあちこちに、ねじれた三本線の黄色い印がある|talk:村人は決して神の名を口にしない。「三度呼べば、来なさる」|lore:土蔵に『黄衣の王』という戯曲の写本がある。読むと、頭が痛む|spirit:風の中から、誰かが名前を囁く声がする|explore:村はずれの湖の水面に、存在しないはずの二つの太陽が映る',
'黄色い印を全て焼き捨て、誰も神の名を三度口にしないまま、湖のほとりの戯曲の写本を燃やす','生贄に黄衣を着せ、湖のほとりで神の名を三度呼ばせる',1),
G('nyarla','ニャルラトホテプ','黒い男','村には、やけに親切な黒い肌の男が住んでいた。どの村人も、彼を「先生」と呼んで敬っていた。',
'obs:「先生」の顔は、見るたびに少しずつ違う|talk:村人によって、「先生」が村に来た年がばらばらだ|lore:「先生」が配った光る多面体の石は、古文書に記された「輝くトラペゾヘドロン」に似ている|spirit:「先生」の影だけが、人の形をしていない|explore:「先生」の家の地下に、無数の顔の面が並んでいる',
'輝く多面体の石を、光の一切差さない箱に閉じ込め、「先生」の前で決して取引に応じない','「先生」が選んだ者を、多面体の石の前に立たせ、その魂を差し出させる',1),
G('shub','シュブ＝ニグラス','千の仔を孕む森の母','村は深い森に囲まれ、どの家にも子どもがやけに多かった。',
'obs:家畜の山羊の目が、どれも人間の目のようだ|talk:村の女たちは「森の母さまが、子を授けてくださる」と口を揃える|lore:祭りの文句「イア！　シュブ＝ニグラス！　千の仔を孕みし森の黒山羊よ！」|explore:森の奥の広場に、蹄の跡と、黒い粘液の溜まりがある|spirit:森の木々が、夜になると呼吸している',
'森の奥の広場の石舞台を崩し、祭りの文句を逆さに唱えて母の呼びかけを断つ','月のない夜、生贄を森の広場に置き、森の母に捧げる',1),
G('yog','ヨグ＝ソトース','門にして鍵','村の神社の鳥居は、くぐるたびに少しずつ数が増えていた。',
'obs:村の時計は、全部違う時刻を指している|lore:神社の扁額に「一にして全、全にして一」とある|talk:老婆は「門が開けば、村は永遠になる」と言った|spirit:鳥居の向こうに、虹色の泡の集まりのようなものが見える|explore:山頂の環状列石の中心に、新しい祭壇が組まれている',
'環状列石の石を一つ抜き取り、門の形を崩した上で、古文書の「閉じの呪文」を唱える','環状列石の中心で、生贄を門の向こうへ送り出す',1),
G('ithaqua','イタクァ','風に乗りて歩むもの','真夏なのに、村には雪が降っていた。村人たちは、それを当然のことのように話していた。',
'obs:雪の上に、人の何倍もある大きな足跡が続いている|talk:村人は「風の強い夜には、決して外に出るな」と言う|lore:伝承に「風に連れ去られた者は、空から凍って降ってくる」とある|explore:山の上に、凍りついた人の亡骸がいくつも並んでいる|spirit:吹雪の音の中に、獣の遠吠えが混ざる',
'風の通り道の峠に篝火を焚き続け、夜明けまで火を絶やさない','吹雪の夜、生贄を峠の上に置き去りにする',1),
G('cthugha','クトゥグア','炎の御方','村のどの家の囲炉裏も、決して火が消えることがなかった。',
'obs:村人の手に、古い火傷の痕がある|talk:「＠火の神さまは、呼べば来てくださる。ただ、全部焼いてしまう」|lore:古文書に「フォーマルハウトの昇る夜に、炎は降る」|explore:村はずれに、焼け焦げた森の跡が広がっている|spirit:囲炉裏の火の中に、何かがうごめいている',
'囲炉裏の火を全て消し、神を招く「フォーマルハウトの夜」に火を一切使わない','星の昇る夜、生贄を炎の中に立たせる',1),
G('tsathoggua','ツァトゥグァ','眠れるヒキガエルさま','村の神社の奥の洞窟から、生ぬるい風が吹き出していた。',
'obs:村人がやけに眠たげで、昼間でも欠伸を繰り返している|talk:「神さまは怠け者でな。供物が足りんと、起きて自分で探しに来なさる」|lore:洞窟の壁画に、毛むくじゃらのヒキガエルのような神|explore:洞窟の奥に、黒い不定形の何かが這った跡がある|spirit:洞窟の奥から、満腹そうな寝息が聞こえる',
'洞窟の前に大量の供物を積んで神を眠らせたまま、洞窟の入口を岩で塞ぐ','空腹の神の前に、生贄を供物として置く',1),
G('yig','イグ','蛇の父','村には蛇があふれていた。村人は誰ひとり、蛇を追い払おうとしなかった。',
'obs:村人の何人かの肌に、うろこのような模様がある|talk:「蛇を殺した者は、蛇の父さまに呪われる」|lore:秋の祭りで、蛇の父をなだめるために太鼓を打ち続けるという記録|explore:村はずれの塚の中に、巨大な蛇の抜け殻|spirit:地面の下を、何か巨大なものがゆっくりと這っている',
'一匹の蛇も傷つけずに、祭りの太鼓を夜通し打ち続けて蛇の父をなだめる','蛇を殺した者を、塚の穴へ突き落とす',1),
G('gatano','ガタノトーア','見てはならぬ山の神','村人は誰も、山の方角を見ようとしなかった。',
'obs:村の家の窓は、どれも山の方角だけ板で塞がれている|talk:「山の神さまのお姿を見た者は、石になる」|lore:神殿の石像は、生きたまま石になった人々で作られている|explore:山へ続く道に、驚愕の表情のまま石になった人の像が並ぶ|spirit:石像の中から、かすかな心臓の音がする',
'神の姿を決して直視せず、鏡で姿を映しながら、神殿の巻物「封じの文」を読み上げる','生贄の目隠しを外し、山の神の姿を見せる',1),
G('nyogtha','ニョグタ','穴の底に棲むもの','村の真ん中に、底の見えない大きな穴があった。',
'obs:穴の縁の土が、毎晩少しずつ崩れて広がっている|talk:「穴に落とした物は、二度と戻らん。人もな」|lore:古文書に「ヴァク＝ヴィラジの呪文と、生命の十字にて、穴へ還すべし」|explore:穴の周りに、黒い粘液の跡が這い出している|spirit:穴の底から、何かがこちらを見上げている',
'生命の十字を掲げ、古文書の呪文を唱えて、這い出したものを穴の底へ押し戻す','生贄を穴の底へ下ろす',1),
G('glaaki','グラーキ','湖の底の主','村の湖は鏡のように静かで、底に建物が沈んでいるのが見えた。',
'obs:村人の何人かの体に、針で刺したような小さな穴がある|talk:「湖の主さまに選ばれた者は、永遠に生きられる」|lore:土蔵に『グラーキの黙示録』という全十一巻の書物がある|explore:湖の底の家に、青白い顔の人々が住んでいる|spirit:湖の底から、針の生えた巨大な何かが浮かび上がってくる',
'黙示録の写本を全て湖に沈めず焼き捨て、湖の周りに塩と灰で結界を描く','満月の夜、生贄を湖へ沈め、主の針で貫かせる',1),
G('atlach','アトラク＝ナクア','橋を編む蜘蛛','村の空き家という空き家に、巨大な蜘蛛の巣が張られていた。',
'obs:村人たちは、決して蜘蛛を払わない|talk:「蜘蛛の神さまが橋を編み終えたら、この世は終わる」|lore:谷の底に、神が永遠に橋を編み続けているという伝承|explore:谷底に、銀色の糸でできた巨大な橋が架かりかけている|spirit:糸が震えるたびに、遠くで誰かが悲鳴を上げる',
'神の邪魔をせず、谷に架かりかけた橋の一本の糸だけを断ち、神を橋の修繕に専念させる','生贄を糸で巻き、谷の橋の礎にする',1),
G('byatis','バイアティス','蛇髭の神','村の森の中に、古い石の砦の跡があった。',
'obs:村人の顔に、ほとんど表情がない|talk:「神さまの目を見たら、神さまのところへ歩いて行きたくなる」|lore:伝承の神は、一つ目で、蛇のような髭を持つ|explore:砦の地下牢に、神を封じた石の扉がある|spirit:地下牢の奥から、催眠をかけるような光が漏れている',
'神の目を見ないよう目隠しをして地下牢へ入り、石の扉の封印の紋を描き直す','生贄を地下牢へ歩かせ、神の目を見せる',1),
G('rlyeh_child','ゾス＝オムモグ','海底の黒い仔','村の浜辺に、黒い円錐形の岩が突き出していた。',
'obs:浜の岩に、星のような形のヒトデが無数に張りついている|talk:「黒い岩さまは、海の底の兄弟と話していなさる」|lore:古文書に「四本の触手と円錐の体を持つ神」|explore:岩の根元に、海底へ続く洞窟がある|spirit:岩に触れると、海の底の声が頭に流れ込む',
'旧き印を刻んだ石を、岩の根元の洞窟に投げ込み、洞窟の口を崩す','生贄を黒い岩に縛り、満ち潮に沈める',1),
G('rhan','ラーン＝テゴス','氷の中の神','村の氷室に、何かが大切に保管されていた。',
'obs:村人は毎日、氷室に新鮮な血を運んでいる|talk:「神さまは眠っておられる。血を絶やせば、死んでしまわれる」|lore:伝承の神は、無数の目と、蟹のような鋏を持つ|explore:氷室の奥に、球体の体に目がびっしりと並んだ像がある|spirit:氷の中で、それは確かに生きている',
'氷室への血の供物を一日でも絶やし、氷室の扉を開け放って神を衰弱させる','生贄の血を、氷室の神に捧げる',1),
G('chaugnar','チャウグナー・フォーン','象の神','村の寺に、象のような鼻を持つ不気味な仏像が祀られていた。',
'obs:村人の首筋に、二つの小さな傷がある|talk:「仏さまは、夜になると歩きなさる」|lore:古文書に「血を啜る象の神」と記されている|explore:寺の床下に、血の抜けた家畜の骸がある|spirit:夜中、仏像の鼻がゆっくりと持ち上がる',
'昼の間に仏像を寺から運び出し、日の光にさらしたまま、台座の封じの文字を彫り直す','真夜中、生贄を仏像の前に座らせる',1),
G('ghatanothoa2','イホウンデー','大鹿の女神','村人は皆、鹿の角を飾った帽子をかぶっていた。',
'obs:村の神社の狛犬が、狛犬ではなく大鹿の像だ|talk:「女神さまは、嘘をつく者がお嫌いでな」|lore:古文書に、女神の神官たちが別の神の信徒と争った記録|explore:森の奥に、巨大な鹿の骨で組まれた祭壇|spirit:森を歩くと、誰かに見られている気配がする。蹄の音|',
'祭壇の大鹿の骨を一本抜き、女神に嘘偽りのない言葉で立ち去りを願う','生贄に角の冠をかぶせ、女神の祭壇に横たえる',1),
G('mordiggian','モルディギアン','屍を喰らう神','村の墓地には、墓石だけが並び、骨は一つもなかった。',
'obs:村の葬式は、いつも棺を開けたまま神社へ運ばれる|talk:「死んだ者はみな、神さまのものじゃ」|lore:伝承に「屍を喰らう神は、生きた者には手を出さぬ」|explore:神社の奥に、骨の山がある|spirit:墓地の地下を、巨大な何かが這っている',
'誰も死なせないまま夜明けを迎え、神に捧げる屍を一つも作らない','生贄を「死んだもの」として扱い、神社の奥へ運ぶ',1),
G('ygolonac','イゴーロナク','掌の口さま','村では喧嘩が絶えなかった。村人の多くが、夏だというのに両手に手袋をはめていた。',
'obs:村人の手のひらに、包帯が巻かれている。包帯の下で、何かが濡れた音を立てて動いた|talk:村人は口々に言う。「あの方は、隠しごとを嫌いなさる。腹の底をさらけ出せば、楽になる」|lore:土蔵に『グラーキの黙示録』第十二巻とされる写本がある。読んだ者のもとへ「あの方」が訪れる、と書かれている|spirit:耳元で、自分の一番醜い欲望を囁く声がする。それは、自分の声だった|explore:村はずれの廃屋の地下に、首のない肥え太った石像があった。両の掌に、濡れた口が彫られている',
'写本の第十二巻を焼き捨て、石像の両掌の口を漆喰で塗り潰し、誰も心の底の欲望に身を任せないまま夜明けを迎える','生贄に写本を読ませ、掌の口の御方をその身に降ろさせる',1),
G('hakuja','巳さん','みいさん','村の至るところに白い蛇の置物があり、本物の白蛇が道を横切った。',
'obs:村の女性たちの瞳孔が、縦に細い|talk:「みいさんは、嫁を一人ずつ娶りなさる」|lore:村の記録に、毎年「みいさんの嫁」が選ばれた名前が並ぶ|explore:神社の奥の池に、白い大蛇が棲んでいる|spirit:池のほとりで、女のすすり泣きが聞こえる',
'池に酒を注いでみいさんを酔わせ、その間に嫁の名簿を焼く','生贄に白無垢を着せ、池へ嫁がせる'),
G('kubinashi','欠け地蔵','かけさま','村の地蔵という地蔵に、首がなかった。',
'obs:村人の誰も、首にマフラーや布を巻いている|talk:「かけさまは、自分の首を探しておられる」|lore:落ち武者の首を埋めた塚の伝承がある|explore:塚の土が、最近掘り返されている|spirit:夜道で、首のない影が何かを探して歩いている',
'塚に埋まった首を掘り出して胴の祠に返し、詫びの経を上げる','生贄の首を、かけさまに差し出す'),
G('kakashi','久延彦','そほどさま','村の田んぼの案山子は、どれも人の服を着ていた。',
'obs:案山子の服の中に、行方不明者の身分証がある|talk:「そほどさまは、田を守ってくださる。よそ者から」|lore:古い帳面に、「よそ者を案山子にする」という文言|explore:田んぼの案山子の中から、人の骨が出てくる|spirit:夜、案山子が一斉にこちらへ首を向ける',
'一番古い案山子の藁を燃やし、田の神の宿り木を断つ','生贄を田の真ん中に立たせ、案山子にする'),
G('ryujin','八大竜王','はちだいさま','何か月も雨が降らず、村の田畑は干からびていた。',
'obs:村人たちは空ばかり見上げている|talk:「はちだいさまは、若い命と引き換えに雨をくださる」|lore:記録に、生贄を捧げた年には必ず大雨が降ったとある|explore:滝壺の奥に、竜の鱗のような石|spirit:滝の音の中に、喉の渇いた竜の唸り|',
'滝壺の竜鱗の石を清水で清め、村人の前で本当の水脈（枯れた堰）を開いてみせる','生贄を滝壺へ沈め、竜神に捧げる'),
G('mekakushi','目隠し様','目隠し様','村人は全員、片目に眼帯をしていた。',
'obs:眼帯の下の目が、どれも同じ方向を見ている|talk:「目隠し様に見られたら、目を差し出さにゃならん」|lore:古文書に「両の目を閉じて祭りを過ごせば、見られぬ」|explore:神社の奥に、無数の義眼が詰まった箱|spirit:どこにいても、誰かに見られている',
'祭りの間、全員が目を閉じて互いの手を取り合い、神社の鈴を逆に鳴らす','生贄の両目を、目隠し様に捧げる'),
G('mayu','蚕影様','こかげさま','村は昔、養蚕で栄えたらしい。今も、どの家にも巨大な繭が吊るされていた。',
'obs:繭の中から、人の形をした影が透けて見える|talk:「こかげさまに包まれた者は、美しく生まれ変わる」|lore:養蚕の神を祀る古い祝詞が、途中から別の神の名に書き換えられている|explore:蚕小屋の奥に、人ほどの大きさの繭がいくつもある|spirit:繭の中で、誰かが助けを求めている',
'一番大きな繭を、桑の枝の火で炙って糸を断ち、中の人を助け出す','生贄を糸で包み、新しい繭にする'),
G('futago','双子神','双子さま','村には、なぜか双子しかいなかった。',
'obs:村人の双子は、片方だけ影がない|talk:「よそ者も、片割れが見つかる」|lore:記録に、「片割れのいない者は、双子神の片割れにされる」|explore:神社の鏡の間に、もう一人の自分が映る|spirit:鏡の中の自分が、少し遅れて笑う',
'鏡の間の大鏡を割り、映った「もう一人の自分」の名を呼んで退ける','生贄を鏡の間に閉じ込め、片割れと入れ替える'),
G('kagami','鏡様','鏡様','村の家の玄関には、必ず外向きの鏡が置かれていた。',
'obs:鏡に映る村人と、本物の村人の動きが少しずれる|talk:「鏡様は、写した者の魂を少しずついただく」|lore:神社の御神体は、魂を吸う古い銅鏡|explore:神社の奥の鏡に、行方不明者の顔が映っている|spirit:鏡の向こうから、たくさんの手が伸びてくる',
'御神体の銅鏡を布で包んで写させないまま、清めた水に沈める','生贄を銅鏡の前に座らせ、魂を写し取らせる'),
G('ningyo','人形様','人形様','村の家々の縁側に、着物を着た人形が並んで座っていた。',
'obs:人形の顔が、村を訪れた人によく似ている|talk:「人形様は、新しいお友達が欲しいのよ」|lore:人形供養の寺の記録が、ある年から途絶えている|explore:蔵の中に、名札のついた人形が百体以上ある。一行の名前の札もある|spirit:人形の目が、こちらを追ってくる',
'一行の名札のついた人形を見つけ出し、寺の供養の火で焼いて縁を切る','生贄を人形の中に閉じ込める'),
G('kitsune','狐の嫁入り様','お稲荷さま','晴れているのに、村には細い雨が降り続いていた。',
'obs:村人の何人かに、着物の裾から尻尾のような影が見える|talk:「晴れた日の雨の夜には、狐の嫁入りがある」|lore:狐の嫁に選ばれた者は、二度と人には戻れないという伝承|explore:山の稲荷の祠の前に、油揚げと、人の髪が供えられている|spirit:提灯の行列が、山の上を音もなく進んでいく',
'嫁入りの行列に油揚げを差し出して道を譲り、行列が過ぎるまで決して声を出さない','生贄を花嫁として、狐の行列に加える'),
G('yamanokami','山の女神','山の神さん','村の男たちは、山に入る前に必ず醜い魚の干物を懐に入れていた。',
'obs:山道の祠に、刃物が奉納されている|talk:「山の神さんは嫉妬深い女神でな。自分より美しいものを妬む」|lore:記録に、オコゼの干物を見せれば女神は笑って許すとある|explore:山奥に、美しい人ばかりを模した石像の列がある|spirit:山の上から、女の笑い声が近づいてくる',
'醜いオコゼの干物を女神の祠に供え、一行の中で一番の美男美女を祠から遠ざける','一番美しい者を、女神の嫉妬に差し出す'),
G('oni','鬼神様','鬼神様','村の家々の屋根に、角のある瓦が載っていた。',
'obs:村人の額に、角を削ったような痕がある|talk:「鬼神様に人の肉を供えれば、村は百年安泰」|lore:鬼退治の伝承が、なぜか鬼の側から書かれている|explore:山の洞窟に、巨大な金棒と人骨|spirit:洞窟の奥で、何かが腹を空かせている',
'炒った豆を撒いて鬼神を洞窟へ追い込み、柊と鰯の頭で入口を封じる','生贄を洞窟の鬼神に供える'),
G('hiruko','寄り恵比寿','よりえびすさま','村の浜には、毎朝なにかが流れ着いていた。',
'obs:流れ着く物は、どれも手足のない人形だ|talk:「よりえびすさまは、自分を流した者を恨んでおられる」|lore:記録に、生まれて間もなく葦の舟で流された神の伝承|explore:浜の洞窟に、葦の舟の残骸と、小さな社|spirit:波の音に、赤子の泣き声が混ざる',
'よりえびすさまの社に、名前と産着を供えて「家族として」迎え入れる祝詞を上げる','生贄を葦の舟に乗せ、海へ流す'),
G('uba','姥神様','姥神様','村には老人しかいなかった。若い者は、一人も見当たらなかった。',
'obs:村の老人たちの若い頃の写真が、どれも一行と同じ年頃だ|talk:「姥神様は、若さを分けてくださる」|lore:記録に、「若き者を山へ送れば、村の者は若返る」|explore:山の中腹に、若者の衣服ばかりが積まれた岩屋|spirit:岩屋の奥で、ひどく年老いた女がこちらを手招きしている',
'岩屋の姥神の鏡に、村の老人たちの本当の顔を映し返す','生贄を山の岩屋へ送る'),
G('kuchisake','歯黒様','おはぐろさま','村人は皆、口元を布で覆っていた。',
'obs:布の端から、耳まで裂けた口の縫い痕がのぞく|talk:「おはぐろさまに『綺麗』と答えちゃいかん」|lore:記録に、おはぐろさまの問いには「普通です」と答えよとある|explore:神社の奥の座敷に、大きな裁ちばさみ|spirit:背後から、「わたし、綺麗？」と囁く声',
'おはぐろさまの問いに「普通」と答え続け、その隙に座敷の裁ちばさみを井戸へ沈める','生贄に問いかけ、答えさせる'),
G('dorogami','沼田御前','ぬたさま','村の田は黒く濁った泥田ばかりだった。',
'obs:泥田から突き出た手のようなものが、風もないのに揺れている|talk:「田を返せ、とぬたさまは言いなさる」|lore:記録に、田を奪われ死んだ百姓の祟りの話|explore:泥田の底に、古い証文の入った壺|spirit:泥の中から、無数の目がのぞく',
'泥田の底の証文を掘り出し、正しい持ち主の名を記して神社に奉納する','生贄を泥田の中へ沈める'),
G('shinigami','迎え様','迎え様','村の入口の門に、大きな数字が書かれていた。毎朝、数字が一つずつ減っていた。',
'obs:門の数字は、祭りの日に「0」になる|talk:「迎え様は、数えた人数だけ連れていく」|lore:記録に、迎え様は名を知られると数を間違えるとある|explore:神社の奥の帳面に、一行の名前が書き足されている|spirit:誰かが枕元で、指を折って数を数えている',
'帳面から一行の名を消し、迎え様の本当の名を門に書きつけて数を狂わせる','生贄の名を帳面に書き、迎え様に引き渡す'),
G('hanayome','白人様','しろうどさま','村の神社には、花嫁衣装を着た像が祀られていた。',
'obs:像の花嫁衣装は、毎年新しいものに替えられている|talk:「しろうどさまは、ずっと花婿を待っておられる」|lore:記録に、婚礼の途中で殺された花嫁の伝承|explore:神社の奥に、古い婚礼の三三九度の盃|spirit:神社の中で、誰かが婚礼の歌を歌っている',
'盃を割り、白人様に「花婿は来ない」と真実を告げて弔う','生贄を花婿として、しろうどさまと娶せる'),
G('tsuchigumo','八束脛様','やつかさま','村の家々は、地下でつながっているらしかった。',
'obs:家の床下から、糸を引くような音がする|talk:「やつかさまは、まつろわぬ者の神」|lore:朝廷に滅ぼされた土着の民の伝承|explore:地下の通路に、巨大な蜘蛛の脚の跡|spirit:地の底で、たくさんの何かがうごめく',
'地下の通路の要の柱を倒して通路を塞ぎ、古い民への慰霊の祝詞を上げる','生贄を地下の巣へ下ろす'),
G('ama','磯御前','いそごぜさま','村の女たちは、皆、海女だった。男は一人もいなかった。',
'obs:海女たちは、何分も息継ぎをせずに潜っていられる|talk:「いそごぜさまは、男を海へ連れていきなさる」|lore:記録に、毎年一人ずつ男を海に送ったとある|explore:海の底の洞窟に、男たちの衣服|spirit:潮の香りの中に、甘い歌声',
'磯御前の祠の注連縄を新しいものに張り替え、海の底の衣服を全て浜に引き上げて弔う','生贄を海女たちの手で海の底へ連れていく'),
G('yatsume','八つ目様','八つ目様','村の家の戸板には、八つの目が描かれていた。',
'obs:村人の額に、八つの小さな点の痣がある|talk:「八つ目様は、全部を見ておられる」|lore:記録に、八つの目のうち一つは盲いているとある|explore:神社の奥の天井に、八つ目の大きな絵。一つだけ目が描かれていない|spirit:八つの視線のうち、一つだけが届かない場所がある',
'盲いた一つ目の死角を通って本殿へ入り、八つ目の絵の残りの目を塗りつぶす','生贄を本殿の真ん中に立たせ、八つの目で見させる'),
G('shiroi','物見様','ものみさま','村はずれの林に、白い服の背の高い人影が立っていた。',
'obs:白い人影は、毎日少しずつ村に近づいている|talk:「ものみさまに話しかけられたら、返事をしちゃいかん」|lore:記録に、ものみさまは「名を呼ばれぬ者」を連れていくとある|explore:林の中に、ものみさまの背丈ほどの杭が何本も立っている|spirit:ものみさまの声が、仲間の声色を真似る',
'ものみさまに話しかけられても決して返事をせず、林の杭を一本残らず抜いて燃やす','ものみさまに返事をした者を、生贄として連れていかせる'),
G('tatari','御霊大明神','ごりょうさま','村の神社は、荒れ果てた祠がいくつも寄り集まってできていた。',
'obs:祠の一つ一つに、無念の死を遂げた者の名が刻まれている|talk:「ごりょうさまは、祀りを怠ると祟りなさる」|lore:記録に、祀りを怠った年に村が半分死んだとある|explore:一番奥の祠だけ、誰も手入れをしていない|spirit:一番奥の祠から、強い怒りが噴き出している',
'一番奥の祠を清めて新しい供物を捧げ、御霊に正しい祀りを約束する','生贄の命で、御霊の怒りを鎮める'),
G('oshira','おしら様','おしら様','村の家々の神棚に、布を何重にも着せた桑の木の人形が二体ずつ祀られていた。',
'obs:人形の片方は馬の頭、片方は娘の頭をしている|talk:「おしら様は、遊ばせてやらにゃ怒りなさる」|lore:馬と娘の悲恋の伝承|explore:蔵の奥に、布を剥がされたおしら様がある|spirit:剥がされたおしら様から、泣き声が聞こえる',
'布を剥がされたおしら様に新しい布を着せ、子どもたちと一緒に「遊ばせ」の唄を歌う','生贄を馬と娘の悲恋になぞらえ、桑の木に吊るす'),
G('kamikakushi','隠し神','隠し神さま','村の掲示板には、行方不明者の貼り紙がびっしりと並んでいた。',
'obs:貼り紙の行方不明者の年齢が、どれも同じだ|talk:「夕暮れに遊んでいる子は、隠し神さまに連れていかれる」|lore:記録に、隠された者は「隠れ里」で今も暮らしているとある|explore:村はずれの竹林の奥に、時間の止まった集落|spirit:竹林の中から、子どもたちの笑い声',
'夕暮れまでに隠れ里の子どもたちの名を一人ずつ呼び、里の入口の竹を切り倒す','生贄を竹林の奥の隠れ里へ送る'),
G('kodama','木霊様','御神木さま','村の真ん中に、天を突くような大きな御神木が立っていた。',
'obs:御神木の根元に、人の形をした瘤がいくつもある|talk:「御神木さまは、村の者を養分にして育つ」|lore:記録に、御神木を伐ろうとした者が皆死んだとある|explore:御神木の洞の中に、まだ温かい何か|spirit:御神木が、ゆっくりと呼吸している',
'御神木の根に塩を埋め、洞の中の「心臓」を清めた刃で断つ','生贄を御神木の洞に閉じ込める'),
G('suiko','兵主部様','ひょうすべさま','村の川には、きゅうりが山のように流れていた。',
'obs:村人の何人かは、頭のてっぺんが皿のように禿げている|talk:「ひょうすべさまに尻子玉を抜かれると、腑抜けになる」|lore:記録に、河童は約束を必ず守るとある|explore:川の淵に、河童の詫び証文|spirit:淵の底から、こちらを引きずり込もうとする手',
'淵の詫び証文をひょうすべさまに見せ、昔の約束を思い出させて村から手を引かせる','生贄を淵へ沈め、尻子玉を抜かせる'),
G('kurai','空宮様','からみやさま','村の神社には、何も祀られていない空の本殿があった。',
'obs:村人は誰も、神の名前を知らない|talk:「名前をつけたら、来てしまう」|lore:記録に、名を与えられた神は形を得るとある|explore:本殿の床下に、名前の候補が書かれた無数の紙|spirit:空の本殿の中に、何かが「形」を待っている',
'名前の候補の紙を全て焼き、本殿に「名を与えぬ」誓いの言葉を刻む','生贄に神の名を呼ばせ、形を与える'),
G('tsuki','二十三夜様','さんやさま','村の夜は、満月でもないのに異様に明るかった。',
'obs:月の光を浴びた村人の影が、獣の形になる|talk:「さんやさまの光を浴びすぎると、人でなくなる」|lore:記録に、月を映した水鏡を割ればさんやさまは去るとある|explore:神社の奥の池に、いつも満月が映っている|spirit:月から、誰かがこちらを見下ろしている',
'池に映る満月の水鏡を、新月の夜の闇の中で石を投げて割る','生贄を月光の下に一晩さらす'),
G('sekai','雛形様','ひながたさま','村の神社の奥に、この村そっくりの小さな箱庭が置かれていた。',
'obs:箱庭の中に、一行そっくりの小さな人形が置かれている|talk:「ひながたさまは、村を作って、遊んでおられる」|lore:記録に、箱庭の人形を動かせば、本物も動くとある|explore:箱庭の村の外側に、一本だけ道が描かれている|spirit:空のずっと上から、巨大な目がこちらを覗いている',
'箱庭の人形を、箱庭に描かれた一本道の先へ移し、箱庭の蓋を閉じる','生贄の人形を、箱庭の祭壇に置く')
];
JS.GOD={};JS.GODS.forEach(function(g){JS.GOD[g.id]=g;});
})();
});
;
/* ==== js/jashin-fx-a.js ==== */
HK.Load.def(329,'js/jashin-fx-a.js',function(){
(function(){
'use strict';
var HK=window.HK,JS=HK.JASHIN;
if(!JS)return;
JS.FX=JS.FX||{};
function F(id,traps,horror,form){
JS.FX[id]={
traps:traps.split('|').map(function(t){var k=t.split('／');return{set:k[0],die:k[1]};}),
horror:horror.split('|'),form:form
};
}
F('dagon',
'{a}が岩場の祠を覗き込んだ瞬間、足元の海藻が生き物のように足首に絡みついた／{a}は悲鳴を上げる間もなく、黒い海へ引きずり込まれた。浮かんできたのは、片方の靴だけだった|民宿の風呂の湯が、いつの間にか生臭い海水に変わっていた。湯船の底から、ぬめった手が{a}の足を掴んだ／{a}は膝ほどの深さの湯船の中で、溺れて死んだ|{a}が踏んだ浜の砂が崩れ、その下に、鋭い貝殻を敷き詰めた穴が口を開けた／{a}は貝殻の穴の底で、満ちてくる潮に呑まれていった',
'{a}が夜の浜を見ると、波打ち際に何十もの人影が並んで、じっとこちらを見ていた。朝になると、浜には水かきのある足跡だけが残っていた。|民宿の女将が{a}の手を取って言った。「あんたも、いい目をしとる。きっと、すぐに海に帰れるよ」――女将の首筋には、鰓のような切れ目がひくひくと動いていた。|{a}は洗面所の鏡に映った自分の目が、昨日より少しだけ左右に離れている気がした。',
'海が、盛り上がった。黒い水の壁を割って現れたのは、灯台ほどもある鱗に覆われた巨体だった。魚とも人ともつかぬ顔に、濁った巨大な目がふたつ。水かきのある腕が岩場を掴むと、岩が粘土のように潰れた。全身から何百年分もの海の腐臭が吹きつけ、その足元では、無数の深きものどもが歓喜の声を上げてひれ伏していた。');
F('cthulhu',
'{a}は地下の水路で、壁一面に刻まれた文字を読もうと顔を近づけた。その瞬間、文字がいっせいに{a}の目へ流れ込んできた／{a}は水路にうずくまり、意味をなさない言葉を叫び続けた。夜明け前、その声はぷつりと途切れた|眠気に負けた{a}は、夢の中で海の底の都市を歩いていた。目の前の巨大な扉が、ゆっくりと開いた／翌朝、{a}は布団の中で、両目を見開いたまま冷たくなっていた。口元は、笑っていた|{a}が神社の床板を踏み抜いた。その下は、海水で満たされた深い竪穴だった／{a}の体は、何かに下から引かれるように、竪穴の底へ沈んでいった',
'{a}がうとうとした一瞬、緑色の石でできた、角度のおかしい都市が見えた。目を開けると、手の中に濡れた海藻が握られていた。|村人たちが、真夜中に一斉に寝言を言い始めた。どの家からも、同じ言葉が聞こえた。「ふんぐるい、むぐるうなふ……」|{a}の手帳に、知らない筆跡で、びっしりとタコのような頭の絵が描かれていた。描いたのは、{a}自身の手だった。',
'大地が裂け、海水と共に、それは這い出してきた。山ひとつほどもある、ぬらぬらと緑に光る肉の塊。頭部からは無数の触腕が垂れ下がり、蛸とも竜ともつかぬ顔の奥で、燐光を放つ眼がこちらを見下ろした。背には蝙蝠のような巨大な翼が畳まれ、ひと羽ばたきごとに、村の家々が紙のように吹き飛んだ。その姿は、見る角度によって形が変わり、人の目では正しく捉えることすらできなかった。');
F('hastur',
'{a}は土蔵で見つけた戯曲の写本を、つい声に出して読んでしまった。三行目に、あの名前が書かれていた／風が止み、土蔵の戸が外から閉ざされた。中から聞こえていた{a}の声は、やがて別の誰かの声に変わり、それも消えた|{a}の部屋の窓の黄色い布が、風もないのにはためいた。布の向こうに、黄色い衣を着た誰かが立っていた／翌朝、{a}の部屋には、黄色い布にくるまれた何かが横たわっていた|{a}が祭りの舞台の幕をめくった。その裏には、ねじれた三本線の印が描かれた床があった／印を踏んだ{a}の体は、内側から崩れるように、黄色い塵になって散った',
'{a}は、湖の向こうに、二つの太陽と黒い星々の空を見た。瞬きすると、ただの夕焼けに戻っていた。|村の子どもたちが、知らない劇の台詞を練習していた。「仮面を、お取りください」「仮面など、ありませぬ」――{a}の背筋が凍った。|{a}の荷物の中に、黄色い印の描かれた紙片が紛れ込んでいた。捨てても、捨てても、翌朝には戻っていた。',
'空が、黄色く濁った。風に乗って、それは舞い降りてきた。ぼろぼろの黄色い衣をまとった、背の高い何か。仮面のような青白い顔――いや、それは仮面ではなかった。衣の裾からは、骨のない触手が何本も覗き、地面に触れるたびに草が枯れ落ちた。その周りでは、空気そのものが腐った蜜のような匂いを放ち、遠くの湖面に、ありえない星々が映っていた。');
F('nyarla',
'「先生」が、{a}に親切そうに抜け道を教えてくれた。「この道なら、村を出られますよ」／抜け道の先は、断崖だった。「先生」は崖の上から、落ちていく{a}を、拍手しながら見送った|{a}が「先生」の家の箱を開けると、中には、光る多面体の石が収められていた。石の中で、何かが瞬いた／{a}の目の前に、翼を持つ黒い影が現れ、{a}を掴んで闇の中へ消えた|{a}は「先生」に勧められた茶を飲んだ。とても甘く、どこか懐かしい味がした／{a}は茶碗を落とし、喉を掻きむしった。「先生」は眉ひとつ動かさずに言った。「おや、お口に合いませんでしたか」',
'民宿に、{a}そっくりの人物が泊まっていた。宿帳には{a}の名前が、{a}の字で書かれていた。|「先生」は、{a}がまだ誰にも話していないはずの過去の話を、懐かしそうに語った。|夜、{a}は窓の外で、顔のない黒い男が、こちらに向かって丁寧にお辞儀をするのを見た。',
'「先生」が、笑った。その顔の皮膚が、ぺりぺりと剥がれ落ちていった。下から現れたのは、顔ではなかった。燃える三つの眼を持つ、のっぺりとした黒い円錐。その体から、何本もの触手と翼と、人の手と獣の脚が、次々と生えては溶けていった。それは千の姿を持ち、そのどれもが嘲笑していた。「ずいぶん、楽しませていただきました」――声だけは、最後まで「先生」の、穏やかな声のままだった。');
F('shub',
'{a}が森の中で、一本だけ黒い木を見つけた。近づくと、その木の枝が、ゆっくりとこちらに曲がった／黒い枝は{a}の体に巻きつき、幹の裂け目の中へ、{a}を呑み込んでいった|{a}が森の奥の泉の水を飲むと、ひどく甘かった／その夜、{a}の腹は内側から膨らみ続け、明け方に、何かが中から這い出した|{a}は村の子どもたちに、森での「かくれんぼ」に誘われた。子どもたちは、くすくす笑いながら散っていった／{a}が「もういいかい」と叫ぶと、四方の木々が一斉に「もういいよ」と答えた。{a}は戻ってこなかった',
'森の奥から、山羊の鳴き声のようなものが、昼も夜も聞こえ続けた。それは、ときどき赤ん坊の泣き声にも聞こえた。|村の子どもたちは、皆、同じ顔をしていた。母親が誰なのか尋ねると、子どもたちは揃って森を指さした。|{a}が森を歩いていると、地面が呼吸をするように、ゆっくりと上下していた。',
'森が、立ち上がった。黒い木々だと思っていたものは、それの脚だった。巨大な、黒い雲のような肉の塊。表面には無数の口が開き、緑色の涎を垂らしていた。蹄のある短い脚が何本も伸び、地面を踏みしめるたびに、肉の一部がちぎれて落ち、それがまた小さな仔となって這い回った。森のあちこちから、山羊の鳴き声が、祝福の歌のように響いた。「イア！　シュブ＝ニグラス！　千の仔を孕みし森の黒山羊よ！」');
F('yog',
'{a}は鳥居をくぐった。振り返ると、くぐったはずの鳥居が、もう一本増えていた／{a}は鳥居をくぐり続けた。何本くぐっても、民宿には戻れなかった。二度と|{a}が古い石の祭壇に手を触れると、空中に虹色の泡が、ひとつ浮かんだ／泡は弾け、{a}のいた場所には、何もなくなった。人の形の、空白だけが残った|{a}は土蔵で、角度の合わない部屋に迷い込んだ。壁と壁の角から、青い煙が漏れていた／角から伸びてきた何かが、{a}の体を、時間ごと削り取っていった',
'{a}が時計を見ると、針が逆回りしていた。村の外の時刻と、三時間ずれていた。|{a}は、まだ起きていない出来事の記憶を、はっきりと思い出した。仲間の誰かが、洞窟で叫んでいる記憶を。|空の一角に、虹色に光る泡の群れが浮かんでいた。それはゆっくりと増え、こちらを観察しているようだった。',
'世界が、裏返った。空に、虹色に輝く無数の球体が現れた。それらは互いに重なり、離れ、膨らみ、果てしなく増殖していった。球体の一つひとつが、別の時間、別の場所を映していた。生まれる前の村、滅びた後の村、そこにいない一行の姿。その中心で、門が開いた。過去と未来とすべての空間が、ひとつの点に流れ込んでいった。それは門であり、鍵であり、門を守るものだった。');
F('ithaqua',
'吹雪の中で、{a}は誰かに名前を呼ばれた気がして、外に出た／翌朝、{a}は村はずれの雪原で見つかった。ありえないほど高い空から落ちてきたように、雪に深くめり込んで|{a}は凍った池の上を近道しようとした。氷が、足元で笑うように軋んだ／氷が割れ、{a}は凍てつく水の中へ消えた。氷はすぐに、何事もなかったように張り直した|{a}が氷室の扉を開けると、中から、凍えるほど冷たい風が吹き出した／{a}の体は、その場で真っ白に凍りついた。表情だけが、恐怖のまま残っていた',
'雪の上に、巨大な足跡が並んでいた。一歩ごとに、何十メートルも離れていた。足跡は、途中でぷつりと途切れていた――まるで、空へ飛び去ったように。|{a}の吐く息が、室内なのに白く凍った。窓ガラスの霜に、人の顔のような模様が浮かび上がった。|夜空を、星を隠しながら、何か巨大な人影がゆっくりと横切っていった。',
'気温が、一瞬で下がった。吹雪の中から、それは姿を現した。森の木々より高い、痩せこけた人のような影。風の中を、足を地につけずに歩いてくる。その顔には、赤く燃える二つの眼だけがあった。足は、水かきのついた巨大な鉤爪だった。それが息を吐くと、村の家々が一瞬で白く凍りつき、その中にいた村人たちも、祈りの姿のまま凍りついた。');
F('cthugha',
'{a}が囲炉裏の火をのぞき込むと、炎が、生き物のように身をよじった／火の粉が{a}の服に飛び移り、{a}は一瞬で炎に包まれた。水をかけても、火は消えなかった|{a}は神社の床下で、焦げた石が円く並んでいるのを見つけた。その中に一歩踏み込んだ／石の円の中から火柱が噴き上がり、{a}の姿は、白い灰になって崩れた|{a}が寝ている部屋の行灯の火が、夜中に、すっと大きくなった／民宿の一室だけが、跡形もなく燃え落ちていた。中にいた{a}ごと',
'夜、村の上空に、小さな火の玉がいくつも浮かんでいた。それはゆっくりと、民宿の周りを回っていた。|{a}が触れた村の石垣が、火傷しそうなほど熱かった。地面の下で、何かが燃えている。|囲炉裏の炎の中に、{a}は、こちらを見つめる目のような光を見た。',
'夜空の一点が、白く輝いた。それは星ではなかった。燃え盛る炎の塊が、ゆっくりと降りてきた。形はなく、ただ、うごめく炎そのもの。その周りを、無数の小さな火の精が飛び交っていた。それが近づくだけで、森の木々が次々と燃え上がり、村の家々の瓦が溶け落ちた。炎の中心は、見つめることすらできないほど明るく、その光の中で、何かが笑っているように見えた。');
F('tsathoggua',
'{a}が洞窟から吹き出す生ぬるい風に誘われて、奥へ一歩踏み込んだ／足元の岩が、柔らかく沈んだ。それは岩ではなかった。{a}の悲鳴は、何かが咀嚼する音にかき消された|{a}は洞窟の奥で、黒い粘液の溜まった窪みに足を取られた／粘液は意思を持つように{a}の体を這い上がり、{a}を窪みの底へと引きずり込んだ|{a}は神社に供えられた、蛙の形の黒い菓子を口にした／{a}の体は、その夜のうちに、ゆっくりと膨らみ、動かなくなった',
'洞窟の奥から、巨大な何かが寝返りを打つような、地響きが聞こえた。|{a}の部屋の隅に、黒いぶよぶよした塊が落ちていた。触ろうとすると、ずるりと床を這って逃げていった。|村人たちが、夜中に洞窟の前で、何かを「お食事」として差し出していた。それは、生きた家畜だった。',
'洞窟の奥で、巨大な目が、眠たげに開いた。それは、蛙とも蝙蝠ともつかない、ずんぐりとした毛深い黒い体だった。大きな腹がゆっくりと上下し、半ば閉じた目は眠たげなのに、その口からは長い舌が伸び、村人たちの差し出した生贄を、ひと舐めで呑み込んだ。周りの暗がりからは、黒い不定形のものたちがあふれ出し、這いずり回った。');
F('yig',
'{a}は布団に入った。足元に、ひんやりとした何かが触れた／布団の中は、蛇で満ちていた。{a}の悲鳴は、すぐに途切れた|{a}は藪の中で、白い蛇を踏んでしまった。蛇は逃げず、ただ、じっと{a}を見上げた／その夜、{a}の体は青く腫れ上がり、皮膚が、鱗のように剥がれ落ちていった|{a}が井戸の蓋を開けると、中で何百匹もの蛇が、絡み合って蠢いていた／蛇の群れは、井戸からあふれ出し、{a}を呑み込むように包み込んだ',
'民宿の天井から、ぽとり、と蛇が落ちてきた。見上げると、梁という梁に、蛇が巻きついていた。|村の老婆が言った。「蛇の子を傷つけたらいけん。あの方は、子どもをいじめたものを、決して許さん」|{a}は夢の中で、半人半蛇の何かに、じっと見つめられていた。',
'地面が、うねった。蛇の群れが一斉に道を開け、その奥から、それは現れた。人の背丈の倍ほどもある、半ば人、半ば蛇の姿。鱗に覆われた体は、ゆっくりと、とぐろを巻いた。その頭部は、人の顔のようにも、蛇の顔のようにも見えた。それがシューッと息を吐くと、村中の蛇が一斉に鎌首をもたげ、こちらを向いた。');
F('gatano',
'{a}は、つい、山の方を見てしまった。山の頂に、何かが立っていた／{a}の体は、見た姿勢のまま、灰色の石に変わっていった。最後まで動いていたのは、恐怖に揺れる瞳だった|{a}が神社の奥の布をめくると、山の神を描いた絵があった／絵を見た瞬間、{a}の指先から、皮膚が乾いた石のように硬くなっていった。それは心臓まで届いた|{a}は霧の晴れた朝、山の方角の窓の雨戸を開けてしまった／村人たちが駆けつけたとき、{a}は窓辺で、石像になっていた',
'村のあちこちに、人の形をした石像が立っていた。どれも、山の方を見上げ、恐怖の表情を浮かべていた。|{a}の指先が、少しだけ硬くなっていた。触ると、石のように冷たかった。|山の方角から、何かが歩き回るような、重い足音が聞こえた。誰も、そちらを見ようとしなかった。',
'山が、動いた。その頂から、それは降りてきた。人の目には、正しく捉えることができなかった。触手があったのか、鱗があったのか、無数の目があったのか――見た者の記憶は、すべてそこで途切れた。ただ、見てしまった村人たちが、悲鳴の形のまま石に変わっていく音だけが、静かに響いた。ぴし、ぴし、ぴし、と。');
F('nyogtha',
'{a}は穴の縁から、底を覗き込んだ。その瞬間、穴の中から、黒い何かが噴き上がった／黒い触腕は{a}を絡め取り、底の見えない闇の中へ引きずり込んだ。悲鳴は、いつまでも落ちていった|{a}が地下室の床を踏むと、床板の隙間から、粘りけのある黒い液体がにじみ出してきた／液体は{a}の足を這い上がり、{a}を床の隙間へと引き込んでいった|{a}が夜中に目を覚ますと、部屋の床に、黒い穴が空いていた／{a}が眠っていた布団ごと、部屋の真ん中に、底のない穴が空いていた',
'穴の底から、何かが「上がってくる」音が聞こえた。それは日に日に、近づいているようだった。|{a}の部屋の床が、夜中にほんの少し沈んだ。翌朝、床板を剥がすと、その下は空洞だった。|村人たちは、穴に向かって祈るとき、必ず後ろ向きで近づいた。',
'穴から、闇があふれ出した。それは液体でも気体でもなく、意思を持った闇だった。黒い不定形の塊が、地面を這い、ねじれ、伸び縮みしながら、何本もの触腕を伸ばした。光は、それに触れると吸い込まれた。村人たちの松明が、ひとつ、またひとつと消えていき、最後には、闇そのものが村を覆い尽くした。');
F('glaaki',
'{a}が湖の浅瀬を歩いていると、水の中から、細い棘のようなものが突き出してきた／棘は{a}の胸を貫いた。{a}は湖に倒れ込み、そして――しばらくして、ゆっくりと起き上がった。もう、{a}ではなかった|{a}は湖畔の空き家で、緑色の背表紙の本を見つけた。読み始めると、止まらなかった／{a}は朝まで本を読み続け、そのまま、湖へ歩いていった。湖面が、静かに閉じた|{a}は湖の底の建物を、もっとよく見ようと、桟橋の先へ出た／桟橋が崩れ、{a}は湖に落ちた。浮かんでこなかった',
'湖畔に、腐りかけた肌の村人たちが、ぼんやりと立っていた。日の光を浴びると、彼らの肌はさらに崩れていった。|{a}が湖を覗き込むと、水底の建物の窓から、誰かが手を振っていた。|夜の湖に、何か巨大なものが浮かび上がり、すぐに沈んでいった。',
'湖面が、盛り上がった。水の中から、それは姿を現した。巨大な、ナメクジのような楕円形の体。表面には無数の金属質の棘が生え、三本の眼柄の先で、黄色い眼がぎょろりと動いた。棘の一本一本が、獲物を探して、意思を持つようにうごめいていた。湖畔に立つ村人たち――いや、かつて村人だったものたちが、主の帰還を迎えて、ゆっくりと膝をついた。');
F('atlach',
'{a}は空き家に入ろうとして、入口の蜘蛛の糸に顔から突っ込んだ／糸は鋼のように強く、{a}は身動きが取れなくなった。闇の奥から、八本の脚が近づいてくる音がした|{a}は谷に架かる古い吊り橋を渡った。橋の縄は、よく見ると、すべて蜘蛛の糸だった／橋の真ん中で、糸がぷつりと切れた。{a}の体は、谷底の巨大な巣に絡め取られた|{a}は眠っている間に、体中を細い糸で縫いとめられていた／朝、{a}の部屋には、人の形をした白い繭が、天井から吊るされていた',
'{a}の髪に、細い糸が絡みついていた。取っても取っても、どこからか伸びてきた。|空き家の巣の中には、人ほどの大きさの繭が、いくつも吊るされていた。そのひとつが、かすかに動いた。|夜、天井の上を、何か大きなものが、かさかさと歩き回る音がした。',
'谷の底から、それが這い上がってきた。人の頭ほどもある巨大な蜘蛛。黒い毛に覆われた体は、牛ほどもあった。顔にあたる場所には、人のような目がいくつも並び、ひとつひとつが、別々にこちらを見ていた。それは、谷と谷のあいだに、終わりのない橋を編み続けていた。その橋が完成したとき、世界が終わるのだという。');
F('byatis',
'{a}が砦の跡の石を動かすと、その下に、地下へ続く階段があった／階段の奥から、何かが{a}を見た。{a}は、自分の意思とは関係なく、ふらふらと階段を降りていった|{a}は森の中で、蛇の髭のようなものがぶら下がった木の下を通った／髭のようなものは{a}の首に巻きつき、{a}の体を、木の上へと持ち上げていった|{a}が砦の壁に刻まれた目の紋様を、じっと見つめた／{a}の体は、操り人形のように、砦の奥の暗闇へ歩いていき、それきり戻らなかった',
'{a}は森の中で、何者かに見られている感覚から逃れられなかった。振り返ると、木々のあいだに、巨大な目がひとつ浮かんでいた。|砦の跡のまわりの地面に、何かが引きずられた跡が残っていた。|夜、森の奥から、ぶつぶつと何かが唸るような音がした。',
'砦の地下から、それが姿を現した。巨大な、蛙と象と蛇が混ざったような体。顔の真ん中には、ひとつだけの巨大な眼があり、その下からは、蛇のような髭が何本も垂れ下がって、うねっていた。体から生えた鉤爪のある手が、地面を掴むと、岩が砕けた。その眼に見つめられた村人は、自ら進んで、その口へと歩いていった。');
F('rlyeh_child',
'{a}は浜の黒い円錐形の岩に、手で触れた。岩は、生き物のように温かかった／岩の表面に開いた穴から、黒い触手が伸びて{a}の腕に絡みつき、{a}を岩の中へ引き込んでいった|{a}が浜で拾った黒い貝殻を、耳に当てた。波の音とは違う何かが聞こえた／{a}は貝殻を耳に当てたまま、ふらふらと海の中へ歩いていった|{a}が浜辺の岩陰で、黒い粘液に濡れた石を踏んだ／石が割れ、中から噴き出した黒い霧を吸い込んだ{a}は、その場に崩れ落ちた',
'浜の黒い岩が、昨日より少し大きくなっている気がした。|{a}は夜の海の中に、黒い円錐が並んで沈んでいるのを見た。|村の漁師たちは、浜の岩の前を通るたびに、頭を下げていた。',
'海の底から、それが昇ってきた。黒い円錐形の巨体。底の部分から、無数の触手が蛇のように蠢いていた。その表面には、爬虫類のような目と、口のような裂け目がいくつも開いていた。それが浜に乗り上げると、砂浜が黒く染まり、波打ち際の魚が、一斉に腹を見せて浮かび上がった。');
F('rhan',
'{a}は氷室の奥で、氷漬けにされた何かを見つけた。それの、閉じていた目が、開いた／氷が割れ、伸びてきた吸盤のある脚が、{a}の体から血を吸い尽くした。{a}は干からびた皮だけになった|{a}が氷室の扉を閉め忘れて、中に閉じ込められた／氷室の扉が開けられたとき、{a}は、氷の中の神に向かってひざまずいたまま凍りついていた|{a}は氷室の床に描かれた円を踏んだ。氷の中から、何かが手を伸ばした／{a}の体は、氷の中に引き込まれ、神の隣で、永遠に凍りついた',
'氷室から、何かがかすかに鼓動する音が聞こえた。|{a}の触れた氷が、内側から叩かれた。|村人たちは、氷室の前に、毎晩、獣の血を供えていた。',
'氷が、砕けた。中から、それは現れた。丸い胴体に、三つの眼。そこから、吸盤のある長い脚が六本伸びていた。体表は、ぶよぶよとした灰色で、ところどころに、口のような穴が開いていた。それが脚を一振りすると、近くの村人が絡め取られ、一瞬で干からびた。');
F('chaugnar',
'{a}が寺の仏像に近づくと、仏像の象の鼻が、わずかに動いた／鼻は{a}の首に巻きつき、そこから、{a}の血を啜り始めた。{a}は青白くなり、やがて、崩れ落ちた|{a}は寺の床下で、何か小さな像を見つけた。それは、仏像と同じ顔をしていた／その夜、{a}の部屋に、何かが入り込み、{a}の血を残らず吸っていった|{a}は寺の本堂で、うたた寝をしてしまった／目覚めた時、仏像が、{a}の目の前にいた。{a}は動けないまま、象の鼻に血を啜られていった',
'寺の仏像の位置が、昨日と少しずれていた。|村人の首筋に、小さな丸い吸い痕があった。|夜、寺から、何かを啜るような湿った音が聞こえた。',
'寺の仏像が、動き出した。それは仏像ではなかった。象のような鼻、平たい大きな耳、牙。人のような体は、緑がかった黒い石のような肌に覆われていた。それが鼻を持ち上げると、その先端には、血を啜るための吸盤が開いていた。まわりの村人たちが、喜んで自分の首を差し出した。');
F('ghatanothoa2',
'{a}は森の中で、角の生えた白い鹿を見つけ、追いかけた／鹿は森の奥で振り返り、人の顔で笑った。{a}は鹿の角に貫かれた|{a}は鹿の角の帽子を、何気なくかぶってみた／帽子は、{a}の頭に根を張り、{a}の額から、本物の角が生え始めた。{a}は痛みで気を失い、二度と目覚めなかった|{a}が獣道を歩いていると、罠に掛かった鹿が、助けを求めるように鳴いていた／{a}が罠を外そうと屈んだ瞬間、鹿の角が{a}の喉を突き破った',
'夜の森で、鹿の群れが、人の言葉で何かを囁き合っていた。|村の女たちが、森で鹿のように四つ足で駆け回っていた。|{a}の額が、むずむずとかゆかった。鏡で見ると、小さなこぶが二つできていた。',
'森の奥から、それは現れた。巨大な白い鹿。いや、鹿の体に、人の女の上半身が生えていた。頭からは、何十本にも枝分かれした巨大な角が伸び、その枝の先には、小さな人の顔が鈴なりに実っていた。顔たちは、一斉に歌い始めた。');
F('mordiggian',
'{a}は墓地で、空の墓穴を覗き込んだ。その穴が、{a}の真下にもあった／{a}は墓穴に落ちた。土が、上から勝手にかぶさっていった|{a}が棺の中を覗くと、そこには、{a}自身の名前の書かれた札が入っていた／{a}は棺の中に引きずり込まれ、蓋が閉まった。中から叩く音は、すぐに止んだ|{a}は夜の墓地で、骨をしゃぶる音を聞いて、近づいてしまった／翌朝、墓地には、新しい骨がひとそろい、きれいに並べられていた',
'墓地の土が、夜ごとに掘り返されていた。|村人たちは、死者の出た家の前に、肉を供えていた。|{a}は夜の墓地で、四つ足で這い回る黒い影を見た。',
'墓地の地面が割れ、それは現れた。巨大な、黒い霧のような体。その中に、無数の口が開いたり閉じたりしていた。歯と歯が触れ合う音が、墓地に響いた。それは死者の骨を、ひとつずつ口に運び、ゆっくりと噛み砕いた。死者を喰らう神。それが、まだ生きている者に向かって、ゆっくりと霧の手を伸ばした。');
F('ygolonac',
'{a}は土蔵で、写本の第十二巻を見つけ、つい読み進めてしまった。読み終えたとき、背後に、誰かが立っていた／振り返った{a}の顔を、濡れた掌が覆った。掌の口が、{a}の顔を、ゆっくりと咀嚼していった|{a}は廃屋の地下の石像の前で、掌の口に、そっと指を差し入れてしまった／石の口が閉じた。{a}の腕は、肘まで食いちぎられ、{a}は失血のまま、暗い地下で息絶えた|{a}の前に、手袋をはめた村人が立ちはだかった。「あんた、腹の中に、何を隠しとる？」村人は、手袋を外した／掌の口が、{a}の喉笛に食らいついた。{a}の最後の叫びは、村人の掌の中に呑み込まれた',
'{a}は、仲間の何気ない一言に、殴りかかりたくなるほどの怒りを覚えた。理由は、分からなかった。|村人どうしが、道の真ん中で殴り合っていた。誰も止めなかった。殴られている方も、笑っていた。|{a}の掌が、むずむずとかゆかった。見ると、皮膚の下で、何かが小さく口を開け閉めしていた。',
'廃屋の地下から、それは這い出してきた。首のない、肥え太った裸の巨体。皮膚は、ぶよぶよと白く、汗と腐臭にまみれていた。首があるはずの場所には、何もなかった。かわりに、両の掌に、濡れた唇と鋭い歯のある口が開いていた。その口が、舌なめずりをした。「我を呼んだのは、誰だ」――それは、掌の口で、そう言った。');
})();
});
;
/* ==== js/jashin-gods-rev.js ==== */
HK.Load.def(330,'js/jashin-gods-rev.js',function(){
(function(){
'use strict';
var HK=window.HK,JS=HK.JASHIN;
if(!JS|| !JS.GODS)return;
function G(id,name,call,look,clues,sol,rite,myth){
return{id:id,name:name,call:call,look:look,clues:clues.split('|').filter(function(c){return c.indexOf(':')>0;}).map(function(c){var k=c.indexOf(':');return{type:c.slice(0,k),t:c.slice(k+1)};}),sol:sol,rite:rite,myth: !!myth};
}
function F(id,traps,horror,form){
JS.FX[id]={traps:traps.split('|').map(function(t){var k=t.split('／');return{set:k[0],die:k[1]};}),horror:horror.split('|'),form:form};
}
function put(oldId,g){
for(var i=0;i<JS.GODS.length;i++)if(JS.GODS[i].id===oldId){JS.GODS[i]=g;if(oldId!==g.id)delete JS.FX[oldId];return;}
JS.GODS.push(g);
}
put('nyarla',G('nyarla','ニャルラトホテプ','伝道師様','村には、やけに親切な黒い肌の男が住んでいた。村人は皆、彼を「伝道師様」と呼んで敬っていた。村はずれに、一軒だけ荒れ果てた旧家があった。',
'obs:「伝道師様」の顔は、見るたびに少しずつ違う|talk:村はずれの旧家は、昔は村一番の名家だった。「＠伝道師様に逆らってから、あの家は落ちぶれた」|lore:落ちぶれた旧家の蔵に、伝道師を追い払った先祖の日記がある。「＠炎の神を呼び、黒き男を焼き払うべし」|spirit:「伝道師様」の影だけが、人の形をしていない|explore:旧家の仏間の床下に、炎の紋を刻んだ古い香炉が隠されている',
'落ちぶれた旧家の香炉に火を入れ、先祖の日記にある祝詞で炎の神を呼び、その炎で「伝道師様」を村から追い出す','「伝道師様」が選んだ者を、光る多面体の石の前に立たせ、その魂を差し出させる',1));
F('nyarla',
'「伝道師様」が、{a}に親切そうに抜け道を教えてくれた。「＠この道なら、村を出られますよ」／抜け道の先は、断崖だった。「伝道師様」は崖の上から、落ちていく{a}を、拍手しながら見送った|{a}が「伝道師様」の家の箱を開けると、中には、光る多面体の石が収められていた。石の中で、何かが瞬いた／{a}の目の前に、翼を持つ黒い影が現れ、{a}を掴んで闇の中へ消えた|{a}は「伝道師様」に勧められた茶を飲んだ。とても甘く、どこか懐かしい味がした／{a}は穏やかに微笑んだまま、二度と目を覚まさなかった',
'民宿に、{a}そっくりの人物が泊まっていた。宿帳には{a}の名前が、{a}の字で書かれていた。|「伝道師様」は、{a}がまだ誰にも話していないはずの過去の話を、懐かしそうに語った。|夜、{a}は窓の外で、顔のない黒い男が、こちらに向かって丁寧にお辞儀をするのを見た。|落ちぶれた旧家の老婆が、{a}の袖を掴んだ。「＠あれは人じゃない。あれのせいで、うちは何もかも失った」',
'「伝道師様」が、笑った。その顔の皮膚が、ぺりぺりと剥がれ落ちていった。下から現れたのは、顔ではなかった。うねる闇の中に、無数の目と口が、星のように瞬いていた。「伝道師様」の体は膨れ上がり、黒い翼と、燃える三つの目を持つ、名状しがたいものへと変わっていった。「＠楽しかったですよ」――声だけが、最後まで穏やかだった。');
put('shub',G('shub','シュブ＝ニグラス','豊穣の黒山羊さま','村は実りの秋の只中にあった。黄金色の田と、たわわに実った葡萄棚。どの家も、収穫祭の支度で浮き立っていた。',
'obs:どの家の食卓にも、取れたての葡萄と、黒い山羊の肉が並んでいる|talk:村の女たちは「＠豊穣の母さまが、子と実りを授けてくださる」と口を揃える|lore:収穫祭の祝詞「＠イア！　シュブ＝ニグラス！　千の仔を孕みし森の黒山羊よ！」|explore:森の奥の葡萄畑の真ん中に、黒い石舞台がある|spirit:葡萄酒を口にすると、体の奥で何かが芽吹く気配がする',
'収穫祭の夜、石舞台に供えられた初物の葡萄酒を地に捨て、祝詞を逆さに唱えて母の呼びかけを断つ','収穫祭の夜、葡萄酒で酔わせた生贄を石舞台に横たえ、森の母に捧げる',1));
F('shub',
'{a}は収穫祭の宴で、勧められるままに新酒の葡萄酒を飲み干した／{a}の腹が、内側から波打った。何かが、外へ出ようとしていた|{a}は葡萄畑の奥へ、甘い香りに誘われて踏み込んだ。葡萄の蔓が、足首に絡みついた／蔓は{a}の体を締め上げ、葡萄棚の上へと吊り上げた。熟れた実が、ひとつ、ふたつと、血の色に染まっていった|{a}は山羊小屋を覗いた。山羊たちが、一斉にこちらを向いた／山羊たちの人間の目に囲まれて、{a}は踏み潰された',
'{a}の皿の山羊肉が、まだ温かく、脈打っていた。|宴の席で、隣に座った村の娘が{a}の手を取り、自分の膨らんだ腹に当てた。腹の中で、何かが{a}の手を蹴り返した。|{a}が見上げた夜空を、蹄の音が駆けていった。',
'葡萄畑の地面が、大きく盛り上がった。土の下から現れたのは、山ほどもある黒い雲のような肉の塊だった。表面にはびっしりと山羊の蹄の脚と、よだれを垂らす無数の口が生え、その口々が、収穫祭の歌を、ひどく調子外れに歌っていた。豊穣の母は、千の仔を引き連れて、実りの森ごと、ゆっくりと立ち上がった。');
put('gatano',G('gatano','ガタノトーア','鏡の向こうの山神さま','村人は誰も、山の方角を見ようとしなかった。山の中腹の社には、山に向けて大きな銅鏡が祀られていた。',
'obs:村の家の窓は、どれも山の方角だけ板で塞がれている|talk:「＠山神さまとお話しできるのは、社の鏡越しだけじゃ。お姿を直に見たら、石になる」|lore:古文書に「＠鏡の向こうの神は、イソグサを奉ずる者どもと永く争えり」|explore:社の鏡の裏に、石になった人々の手形が無数に残っている|spirit:鏡を覗くと、自分の背後に、山のように巨大な影が映る',
'神の姿を決して直視せず、社の鏡を裏返して伏せ、鏡越しの通い路を断ってから「封じの文」を読み上げる','生贄に社の鏡を覗かせ、鏡の向こうの神と目を合わせさせる',1));
put('byatis',G('byatis','バイアティス','蛇髭の神','村の森の中に、古い石の砦の跡があった。村人たちは交代で、砦の地下へ続く扉を見張っていた。',
'obs:村人の顔に、ほとんど表情がない。見張りの番の者だけが、ひどく怯えている|talk:「＠封印の扉だけは、何があっても開けちゃならん。夢で呼ばれても、だ」|lore:伝承の神は、一つ目で、蛇のような髭を持つ。封を解いた者を石に変え、その者の姿ではなく、別の人間の姿を借りて人の世に紛れる|explore:砦の地下牢に、神を封じた石の扉がある。扉の前に、石になった見張りの像が並ぶ|spirit:眠ると、一つ目の何かが夢の中で囁く。「＠扉を開けておくれ」',
'夢の囁きに耳を貸さず、目隠しをして地下牢へ入り、村人と一緒に石の扉の封印の紋を描き直す','生贄を地下牢へ歩かせ、封印の扉を開けさせる',1));
put('chaugnar',G('chaugnar','チャウグナー・フォーン','象の神','村の寺に、象のような鼻を持つ不気味な仏像が祀られていた。村人は皆、ずんぐりと背が低く、目が細く、聞き慣れない言葉で話していた。',
'obs:村人は皆、異様に背が低く、子どものような体つきなのに、顔だけが老人のようだ|talk:村人どうしの言葉は日本語ではない。古文書の言葉と照らすと、チョー・チョー人と呼ばれる種族の言葉だ|lore:古文書に「＠血を啜る象の神、チョー・チョーの民これを奉ず」と記されている|explore:寺の床下に、血の抜けた家畜の骸と、人の骨|spirit:夜中、仏像の鼻がゆっくりと持ち上がる',
'昼の間に仏像を寺から運び出し、日の光にさらしたまま、台座の封じの文字を彫り直す','真夜中、生贄を仏像の前に座らせる',1));
put('atlach',G('quachil','クアチル・ウタウス','塵を踏むもの','村の家々は、どれも百年経ったように古びていた。村人は皆、ひどく年老いていた。子どもの姿は、一人もなかった。',
'obs:村の柱時計は、どれも針が異様な速さで回っている|talk:「＠天から下りてくる御方に触れられた者は、塵になる」|lore:古文書に「＠骸骨のごとき姿、天より光の柱に乗りて下る。触るるもの、たちまち老い朽つ」|explore:村はずれの円い空き地だけ、草が一本も生えず、灰色の塵が積もっている|spirit:空き地の上の空に、ときどき光の柱が立つ',
'古文書の「時を留める呪文」を唱えながら、空き地の塵を一粒残らず集めて壺に封じ、天への道を閉ざす','生贄を空き地の真ん中に立たせ、光の柱の下に差し出す',1));
F('quachil',
'{a}は空き地の灰色の塵を、靴で踏んでしまった／{a}の足首から上へ、皺と白髪が這い上がった。叫ぼうとした口から、歯がぱらぱらとこぼれ落ちた|{a}は古い柱時計の振り子に触れた。振り子は、{a}の指を掴んで離さなかった／{a}の手が見る間に骨と皮になり、{a}はそのまま、時計の前で塵になって崩れた|{a}の頭上に、光の柱が下りてきた／光の中から伸びた枯れ枝のような指が、{a}の額に触れた。{a}は、一瞬で百年分老いて、倒れた',
'{a}が鏡を見ると、目尻に、昨日まではなかった深い皺があった。|{a}の腕時計が、狂ったように逆回転を始めた。|{a}の髪に、一筋、白いものが混じった。触れると、さらさらと塵になって落ちた。',
'光の柱が、空き地に突き刺さった。その中を、ゆっくりと下りてくるものがあった。干からびた骸骨のような、小さな、ひどく小さな姿。だがそれが地に足を着けた瞬間、村じゅうの家が音もなく崩れ、木々は枯れ、石は砂になった。それの歩いた跡には、時の流れそのものが、灰色の塵となって積もっていった。');
put('mekakushi',G('imigui','喰様','いみぐいさま','村の家々の軒先に、人の形に切った紙の形代が吊るされていた。社の前には、形代を投げ入れる大きな穴が口を開けていた。',
'obs:どの家の形代にも、墨で何かの罪が書き込まれている。「兄と通じた」「父を殺した」|talk:「＠罪も穢れも、いみぐいさまが食うてくださる。だから村には、罪人がおらん」|lore:古文書に「＠喰様、罪を喰らいて飢えを満たす。罪の尽きたる年は、旅人を喰らう」|explore:社の穴の底に、紙の形代と、人の骨が混じり合って積もっている|spirit:穴の底から、何かが咀嚼する音が、絶え間なく聞こえる',
'村じゅうの罪の形代を一枚残らず集めて穴に投げ入れ、喰様の腹を満たしてから、穴に蓋をして注連縄を張る','旅人を「神隠し」と称して社の穴の前に立たせ、喰様に丸呑みにさせる'));
F('imigui',
'{a}は形代の一枚を手に取った。そこには、{a}の名前と、{a}しか知らないはずの罪が書かれていた／形代が{a}の手に貼りついた。社の穴から、巨大な舌が伸びてきた|{a}は社の穴を覗き込んだ。底から、生暖かい息が吹き上がってきた／穴の縁が、口のように閉じた。{a}の上半身は、もうどこにもなかった|夜道で、{a}は村人に「＠神隠しの番だよ」と囁かれた／振り返ると、そこにはぬめった闇が大きく口を開けていた。{a}は、丸ごと呑み込まれた',
'{a}の部屋の障子に、{a}の形の影が貼りついていた。影には、墨で何か書かれていた。|村人が、{a}の背中を形代で撫でた。「＠あんたの穢れも、食うてもらえばええ」|夜中、社の方角から、げっぷのような低い音が響いた。',
'社の穴から、それは這い出した。巨大な口だけの何か――唇は村の家々ほどもあり、その内側には、これまで呑み込んだ形代と人の顔が、歯の代わりにびっしりと並んでいた。「＠ハラガ、ヘッタ」――無数の顔が、同じ言葉を呟いた。');
put('kagami',G('chibiki','千曳牛','千曳さま','村の道は、どれも異様に幅が広く、深い轍が刻まれていた。家々の窓には、どの家も厚い板が打ちつけられていた。',
'obs:轍の幅は、どんな荷車よりも広い。轍の底に、腐った肉片がこびりついている|talk:「＠新月の夜は、決して窓の外を見るな。千曳さまがお通りになる」|lore:古事記の注釈に「千引の石」。千人がかりでなければ動かせぬもの。村の古文書では、それは石ではなく「肉」と記されている|explore:村の裏山に、巨大な荷車の残骸と、千本の切れた引き綱が散らばっている|spirit:新月が近づくと、地の底から、重い荷を引きずる轟音が響く',
'新月の夜、全員で窓を閉ざして目を伏せたまま、裏山の千本の引き綱を一本残らず断ち切り、千曳さまを荷から解き放つ','生贄に新月の夜、窓の板を外させ、通りを行く千曳さまを見せる'));
F('chibiki',
'新月の夜、{a}は轟音に耐えきれず、窓の板の隙間から外を覗いてしまった／{a}は悲鳴を上げなかった。ただ笑い始めた。朝になっても、笑い続けていた。そして、笑いながら息を止めた|{a}は道の真ん中の轍に足を取られた／轟音が近づいてきた。{a}が最後に見たのは、腐り落ちた毛皮の壁だった|{a}は裏山の引き綱を手に取った。綱は、生き物のように脈打っていた／綱が{a}の体に巻きつき、{a}を闇の向こうの重い何かへ繋いだ。{a}は千曳さまと共に、地の底へ引きずられていった',
'{a}の耳に、どこからか、牛ではない何かの鳴き声が届いた。|新月でもないのに、遠くで荷を引く轟音がした。床が、小刻みに震えた。|{a}が窓の板に耳を当てると、向こう側から、腐臭のする息が吹きかけられた。',
'轟音と共に、それは村の大通りに姿を現した。牛ではなかった。毛皮と肉が腐り落ち、骨と臓物が剥き出しになった、山ほどもある肉塊。それが、千本の引き綱で、何か見えない巨大な荷を引いていた。見てはならないと知りながら、一行の目は、それから離れなかった。');
put('futago',G('fuchi','淵の大君','淵の大君さま','村は長い日照りに苦しんでいた。田はひび割れ、川は干上がっていた。それでも村の奥の淵だけは、黒い水を満々と湛えていた。',
'obs:淵の水は、どれだけ日照りが続いても、少しも減っていない|talk:「＠日照りが続いたら、娘を大君さまの花嫁にお送りする。そうすりゃ、雨が降る」|lore:村の記録に、花嫁に送られた娘の名が並ぶ。数日後に「白髪の老婆の姿にて浮かぶ」とある|explore:淵のほとりに、重りの石と、切れた白無垢の帯が落ちている|spirit:淵を覗くと、底のない闇の中から、誰かがこちらを見上げている',
'淵に沈められた花嫁たちの名を一人ずつ呼び、白無垢の帯を淵に返して、大君と花嫁たちの縁を切る','生贄に白無垢を着せ、重りをつけて生きたまま淵に沈める'));
F('fuchi',
'{a}は淵の水で顔を洗おうとした。水面に、白髪の娘の顔が映っていた／水の中から伸びた白い腕が、{a}を淵へ引きずり込んだ。{a}が浮かんできたのは、三日後だった。白髪の、老婆の姿で|{a}は淵のほとりの重り石に腰かけた／石に結ばれていた帯が、ひとりでに{a}の足首に巻きついた。石ごと、{a}は淵の底へ沈んでいった|夜、{a}は淵から聞こえる花嫁唄に誘われ、ふらふらと水際へ歩いた／{a}の足は止まらなかった。黒い水が、{a}の頭の上で静かに閉じた',
'{a}の濡れた髪が、乾くと一房だけ白くなっていた。|日照りの空に、ほんの一瞬、雨雲が湧いた。淵の方を見て、村人たちが手を合わせた。|{a}の枕元に、濡れた白無垢の帯が置かれていた。',
'淵の水が、天に向かって盛り上がった。黒い水の柱の中に、それはいた。巨大な、白い鯰とも竜ともつかぬもの。その長い髭の一本一本に、これまで沈められた花嫁たちが、白髪をなびかせて絡みついていた。大君が身をよじるたびに、空が割れ、豪雨が叩きつけた。');
put('ningyo',G('shijima','無音様','しじまさま','村は、異様なほど静かだった。村人は誰も声を出さず、身振りと筆談だけで話していた。',
'obs:どの家の柱にも、耳を塞ぐ猿の木彫りが打ちつけられている|talk:（筆談で）「＠祭りの三晩は、音を立ててはならぬ。赤子の泣き声、咳、足音ひとつでも」|lore:記録に「＠音立てし家は不浄なり。しじまさま、一族もろとも連れ去り給う」|explore:村はずれに、戸口が板で打ちつけられた空き家が並ぶ。中には、口を縫われた人形が座っている|spirit:無音の夜、自分の心臓の音さえ、誰かに聞かれている気がする',
'祭りの三晩、一行全員が一切の音を立てずに過ごし、三晩目の明け方に、社の大鈴をただ一度だけ鳴らして無音の結界を破る','音を立てた者を、口を縫って社に座らせ、しじまさまに差し出す'));
F('shijima',
'無音の夜、{a}は堪えきれずに咳き込んでしまった／家じゅうの灯りが消えた。闇の中で、{a}の口を、冷たい何かが塞いだ。朝、{a}の姿はなく、口を縫われた人形だけが座っていた|{a}の足が、廊下の床板を軋ませた／その一音で、闇が{a}を見つけた。{a}は、悲鳴ひとつ上げられないまま、闇に連れ去られた|{a}の携帯の着信音が、静まり返った村に鳴り響いた／{a}は、音の消えた世界に立っていた。叫んでも、自分の声さえ聞こえなかった。{a}はそのまま、どこにもいなくなった',
'{a}が口を開くと、声が出なかった。しばらくして、ようやく、かすれた声が戻った。|夜、隣の家から赤子の泣き声がした。次の瞬間、その家の灯りが消え、二度と点かなかった。|{a}の背後で、誰かが「しーっ」と囁いた。振り返っても、誰もいなかった。',
'音が、消えた。風の音も、虫の声も、自分の鼓動さえも。その完全な無音の中に、それは立っていた。口を縫い合わされた、細長い、白い人影。その全身に、無数の耳が花のように咲いていた。しじまさまは、一行の誰かが息を吸う音さえ、聞き漏らすまいとしていた。');
put('kitsune',G('mekura','目洗い薬師','めあらいさま','村の寺に、両目のない木彫りの薬師如来が祀られていた。村には病人がひとりもいなかった。その代わり、手や足や目を失った者が、やけに多かった。',
'obs:村人の多くが、体のどこかを布で覆っている。布の下の肉が、黒く腐っている|talk:「＠薬師さまは、どんな病も治してくださる。ただ、厄介払いをせにゃならん」|lore:寺の縁起に「＠病を癒やせし所の代わりに、祈りし家の者の同じ所、腐り落つ」|explore:寺の裏の小屋に、目を潰された白無垢の女たちが暮らしている。「薬師さまの嫁」と呼ばれている|spirit:薬師像の空っぽの眼窩から、こちらを見られている気配がする',
'薬師像の眼窩に、村人から腐り落ちた「厄」をすべて返し納め、像の両目を墨で描き入れて、厄介払いの理を断つ','生贄の両目を潰し、白無垢を着せて、目洗い薬師の嫁として寺に入れる'));
F('mekura',
'{a}は擦りむいた膝に、寺の薬湯を塗ってもらった。傷はたちまち消えた／その夜、{a}の大切な誰かの膝が、黒く腐り始めた。――そして{a}自身の目からも、光が抜け落ちていった|{a}は薬師像の空の眼窩を覗き込んだ／眼窩の奥から伸びた指が、{a}の両目に触れた。{a}の世界から、光が消えた。{a}は手探りのまま、崖から足を踏み外した|{a}は寺の裏の小屋で、白無垢の女たちに囲まれた。「＠あなたも、薬師さまのお嫁になるのね」／女たちの冷たい指が、{a}の瞼を押し開いた',
'{a}の古傷が、いつの間にか跡形もなく消えていた。代わりに、同じ場所が、ひどく冷たかった。|寺の裏から、目隠しをした白無垢の女が、{a}の名を呼んだ。|{a}の左手の小指の先が、黒ずんでいた。',
'寺の天井を突き破って、それは立ち上がった。両目のない、巨大な木彫りの薬師。だがその全身には、村人たちから腐り落ちた手や足や目が、苔のようにびっしりと貼りついて、ぐずぐずと蠢いていた。薬師は慈悲深く掌を差し出した。その掌の上で、無数の目が、一斉にこちらを向いた。');
put('uba',G('akatsuchi','赫土ノ命','あかつちさま','村の山肌は、血のように赤かった。村人の手も爪も、赤い土で染まっていた。',
'obs:村の土も、井戸水も、どこか鉄錆の匂いがする|talk:「＠落盤は、あかつちさまのお召し上げじゃ。埋まった者は、決して掘り起こしちゃならん」|lore:鉱山の記録に「＠赤き土は神の血。神の肉を掘る者は、神に掘られる」|explore:廃坑の奥に、掘り起こされかけた遺体が、赤い土に半ば溶けて埋まっている|spirit:坑道の壁に耳を当てると、巨大な心臓の鼓動が聞こえる',
'廃坑で掘り起こされかけた遺体を、掟どおり赤土で埋め戻し、坑道の入口を崩して、神の体を掘る道を閉ざす','生贄を坑道の奥へ送り、落盤で「お召し上げ」にする'));
F('akatsuchi',
'{a}は坑道の壁の赤い土を、指で削り取った。土の下から、生温かい血が噴き出した／坑道の天井が、溜息のように崩れ落ちた。{a}の上に、赤い土が降り積もった|{a}は落盤の跡から突き出た手を見つけ、思わず掘り起こそうとした／掘り起こした手が、{a}の手首を掴んだ。赤い土の中へ、{a}は引きずり込まれた|{a}は赤い井戸水を飲んだ／{a}の血管が、赤い土で詰まっていった。{a}の体は、ゆっくりと、山肌と同じ色の土くれになった',
'{a}の爪の間に、いつの間にか赤い土が入り込んでいた。洗っても、落ちなかった。|夜、山全体が、ひとつ脈打った。|{a}の足元の赤土が、小さく盛り上がり、また沈んだ。呼吸をしているようだった。',
'山が、裂けた。赤い山肌の下から現れたのは、山そのものほどもある、皮を剥がれた巨人の体だった。剥き出しの赤い筋肉の上を、鉱石の血管が走り、その傷口という傷口から、村人たちが掘り続けた坑道が覗いていた。赫土ノ命は、自分の肉を掘られ続けた痛みに、ゆっくりと身を起こした。');
JS.GODS.forEach(function(g){if(g.id!=='shinigami')return;g.name='黄泉迎ノ大神';g.call='むかえさま';function fx(t){return t.replace(/迎え様/g,'むかえさま');}g.look=fx(g.look);g.sol=fx(g.sol);g.rite=fx(g.rite);g.clues.forEach(function(c){c.t=fx(c.t);});});
put('oni',G('ajiro','網代観音','あじろかんのんさま','湖畔の小さな漁村だった。村の社には、観音像ではなく、白い布をかけた戸板が祀られていた。湖の風に、ひどい腐臭が混じっていた。',
'obs:社の戸板の白布に、人の形の染みが、何重にも重なっている|talk:「＠嵐の翌日、網にかかったお方は観音さまの化身じゃ。数日お祀りして、湖にお返しする。そうすりゃ大漁よ」|lore:村の記録に「＠身元知れぬ水死人を観音として安置し、溶けたる肉を湖に撒きて魚を寄す」|explore:社の裏の桶に、どろどろに溶けた何かが溜められている。湖の魚が、それに群がっている|spirit:嵐の夜、湖の底から、網にかかった者たちが観音経を唱える声がする',
'社に安置された「観音さま」の身元を突き止めて名を呼び、湖に撒かずに正しく弔って、網代の理を断つ','生贄を嵐の夜に湖へ沈め、翌朝の網で「観音さま」として引き揚げる'));
F('ajiro',
'{a}は嵐の翌朝、網にかかったものの白布をめくってしまった。それは、{a}と同じ顔をしていた／その日の夕方、{a}自身が湖に浮かんでいた。|{a}は社の裏の桶に足を滑らせた／桶の中の溶けた肉が、{a}の体にまとわりつき、{a}をゆっくりと溶かしていった|{a}は湖で獲れた魚を食べた。ひどく脂がのっていた／{a}の腹の中で、魚が泳ぎ始めた。{a}は湖へ向かって這っていき、自分から水に入った',
'民宿の夕食に、湖の魚が山盛りで出された。どの魚も、異様に肥え太っていた。|{a}が湖を見ていると、波間に白い布が浮かんでいた。布の下で、何かが手を振った。|社の方角から、観音経を唱える声が聞こえた。唱えているのは、水の中の誰かだった。',
'湖面が、白く泡立った。浮かび上がってきたのは、これまで網にかかった無数の水死体が溶け合って固まった、巨大な観音の姿だった。千の手は千の腕で、千の顔は千の溺れた顔だった。観音は慈悲深く微笑み、その指先から、溶けた肉が雨のように湖へ降り注いだ。魚たちが、狂ったように跳ねた。');
put('yamanokami',G('madara','斑様','まだらさま','村は機織りの音に満ちていた。どの家の娘も、黙々と機を織っていた。その顔にも腕にも、黒い斑点が浮いていた。',
'obs:機を織る女たちの肌の斑点が、絹の模様とまったく同じ形をしている|talk:「＠この村の絹は、決して千切れん。斑様のおかげじゃ。その代わり、娘は斑様に皮をお返しする」|lore:村の記録に「＠繭入りの儀。斑の満ちたる女、生きながら皮を脱ぎ、蚕に食ませる」|explore:機屋の奥の部屋に、人の形をした、空っぽの皮が何枚も吊るされている|spirit:夜、蚕棚から、無数の蚕が何かを咀嚼する音が響く',
'機屋の奥に吊るされた女たちの皮を下ろして弔い、斑様の機にかかった最後の一反を断ち切って、繭入りの儀を終わらせる','斑の満ちた者に、生きたまま皮を脱がせ、蚕に食ませる「繭入りの儀」'));
F('madara',
'{a}は村の絹の手触りに感心して、反物を肩にかけてみた／絹が{a}の肌に吸いついた。剥がそうとすると、{a}の皮膚ごと、ずるりと剥がれた|{a}は機屋の奥の部屋に迷い込んだ。吊るされた皮のひとつが、{a}を見下ろした／皮が{a}に覆いかぶさった。{a}は、他人の皮の内側で、息ができなくなった|{a}は蚕棚の前で足を止めた。蚕たちが、一斉に頭をもたげた／蚕の群れが、{a}の足から這い上がってきた。{a}の肌を食む音が、蚕棚に響いた',
'{a}の手の甲に、黒い斑点がひとつ浮かんでいた。昨日まではなかった。|夜、{a}の部屋の外から、機を織る音が聞こえた。|村の娘が、{a}の腕の斑点を見て、嬉しそうに微笑んだ。「＠お仲間ね」',
'機屋の屋根を突き破り、それは立ち上がった。顔も手足も、無数の黒い斑点に覆われた、巨大な女。その体は絹糸で縫い合わされた、何百枚もの女たちの皮でできていた。斑様は、ゆっくりと手を伸ばした。その指先から、決して千切れない絹糸が、一行の方へと、するすると伸びてきた。');
JS.GOD={};JS.GODS.forEach(function(g){JS.GOD[g.id]=g;});
})();
});
;
/* ==== js/jashin-more.js ==== */
HK.Load.def(331,'js/jashin-more.js',function(){
(function(){
'use strict';
var HK=window.HK,JS=HK.JASHIN;
if(!JS)return;
function L(s){return s.split('|');}
JS.MORE={
TRAP_AVOID:L('――だが{a}は、間一髪でそれを振りほどき、転がるように逃げ延びた。心臓が、いつまでも早鐘を打っていた。|――{a}は死に物狂いでもがき、紙一重で難を逃れた。指先が、まだ震えていた。|――{a}は悲鳴を上げて身をよじった。我に返ると、それは跡形もなく消えていた。'),
CAVE_TRAP:L('洞窟の天井から、ぱらぱらと小石が落ちてきた。{a}が見上げた瞬間、岩盤が崩れた／{a}の体は、落ちてきた岩の下に消えた|{a}の踏んだ岩が、ぐらりと傾いた。その下は、底の見えない縦穴だった／{a}の悲鳴は、いつまでも闇の底へ落ちていった|洞窟の窪みに、甘い匂いの霧が溜まっていた。{a}はそれを、深く吸い込んでしまった／{a}は膝をつき、笑いながら、喉を掻きむしって倒れた|暗がりから、{g}の眷属が這い出してきた。それは真っ直ぐに{a}へ向かってきた／眷属は{a}を闇の奥へ引きずっていった。骨の砕ける音が、長く響いた|地下水脈の音が急に大きくなった。足元の亀裂から、黒い水が噴き出した／{a}は濁流に呑まれ、岩の隙間へと吸い込まれていった|{a}が壁に手をつくと、壁に刻まれた{g}の紋様が、ぬるりと動いた／紋様は{a}の腕を這い上がり、{a}の体を壁の中へ塗り込めていった').map(function(t){var k=t.split('／');return{set:k[0],die:k[1]};}),
TRAP_HELP:L('――「危ない！｜＝｜危ないです！」{b}が{a}の腕を引いた。{a}は、間一髪で助かった。|――{b}が{a}の襟首を掴んで引き戻した。二人とも、しばらく口がきけなかった。'),
TRAP_HURT:L('――{a}はなんとか逃れたが、ひどい傷を負った。|――{a}は這うようにして逃げ出した。血が、点々と道に残った。|――{a}は命だけは拾ったが、片足を引きずるようになった。'),
PRANK_START:L('{a}は辺りを見回して、にやりと笑った。「これ、ドッキリでしょ？　誰の仕込み？｜これはドッキリだろう？　誰の仕込みだ？｜これ、ドッキリですよね？　誰の仕込みですか？」|{a}は村人の挨拶を聞いて、吹き出しそうになった。「仕掛け人さん、演技うまいなあ｜仕掛け人も、演技がうまいものだ｜仕掛け人さん、演技がお上手ですね」|{a}は圏外の表示を見て、頷いた。「はいはい、そういう仕込みね。乗ってあげるよ｜なるほど、そういう仕込みか。乗ってやろう｜はいはい、そういう仕込みですね。乗ってあげますよ」'),
PRANK_ACT:L('{a}は怪異を見て拍手した。「すごい、特殊メイク？　手が込んでるなあ｜見事だ、特殊メイクか？　手が込んでいるな｜すごい、特殊メイクですか？　手が込んでいますね」|{a}は村人の後をつけて、仕掛けの種を探し回った。|{a}は祠の前で腕を組んだ。「この演出、誰が考えたんだろう｜この演出は、誰が考えたのだろう｜この演出、誰が考えたんでしょう」|{a}は暗がりに向かって「仕掛け人さーん？」と呼びかけた。返事はなかった。|{a}は村人の手を握って言った。「種明かしのとき、またよろしくね｜種明かしのときは、またよろしく頼む｜種明かしのとき、またよろしくお願いしますね」村人は、黙って{a}を見つめ返した。'),
PRANK_REAL:L('{a}の笑顔が凍りついた。「……ドッキリ、じゃ、ないの？｜……ドッキリ、では、ないのか？｜……ドッキリ、じゃ、ないんですか？」|{a}は亡骸を前に、震える声で言った。「ねえ、ここで種明かしでしょ？　誰か出てくるんでしょ？｜おい、ここで種明かしだろう？　誰か出てくるんだろう？｜あの、ここで種明かしですよね？　誰か出てくるんですよね？」――誰も、答えなかった。|{a}はしばらく、ありもしない種明かしを待つように立ち尽くしていた。やがて、膝から崩れ落ちた。'),
MAGE_HINT:L('{a}は夜中にひとり、村の地図に星の位置を書き込み、生きている仲間の数を指で数えていた。|{a}は誰にも見られないように、古い羊皮紙を広げ、何かの条件を確かめていた。「……足りないな｜……足りない｜……足りませんね」'),
MAGE_KILL:L('朝、{v}は神社の石段の下で見つかった。胸には、誰も見たことのない印が、刃物で刻まれていた。|{v}の姿が、夜のうちに消えた。民宿の裏の土の上に、血で描かれた円だけが残っていた。|{v}は井戸の中で見つかった。その手には、見知らぬ文字の書かれた紙片が握らされていた。|{v}は布団の中で冷たくなっていた。枕元には、蝋燭が星の形に並べて立てられていた。'),
MAGE_DETECT:L('{b}は、{a}の袖口に乾いた血がこびりついているのに気づいた。「……あの印を刻んだのは、あなただな｜＝｜……あの印を刻んだのは、あなたですね」|{b}は、{a}の荷物の中から、血で描かれた円と同じ図の書かれた手帳を見つけた。|{b}は夜中、{a}が亡骸の胸に何かを書き込んでいるところを見てしまった。'),
MAGE_DETECT_OPEN:L('{b}は、{a}が刃を引くのを、その目で見ていた。「何したの！｜何をした！｜何をしたんですか！」|{b}の懐中電灯が、血に濡れた{a}の手を照らし出した。「……あなただったのか。最初から｜＝｜……最初から、あなただったんですか」'),
MAGE_BOUND:L('一行は{a}を取り押さえ、縄で縛り上げた。{a}は笑っていた。「愚かだな。私なら、全員を助けられたかもしれないのに｜愚かだな。私なら、全員を助けられたかもしれないものを｜愚かですね。私なら、全員を助けられたかもしれませんのに」|{a}は抵抗したが、多勢に無勢だった。一行は{a}を柱に縛りつけ、口を布で塞いだ。|一行は{a}を土蔵に押し込め、外から閂をかけた。中から、呪文のような呟きがいつまでも聞こえた。'),
MAGE_KILLED:L('取り押さえようとした拍子に、誰かの振り下ろした薪が{a}の頭を打った。{a}は動かなくなった。|一行の怒りは止まらなかった。{a}は、仲間だった者たちの手で殺された。|{a}は逃げようとして、{b}に組み伏せられた。{b}の手は、{a}の喉から離れなかった。'),
MAGE_PUSH:L('{a}は洞窟の縁で、{v}の背中を押した。{v}は悲鳴と共に、闇の底へ落ちていった。「これで、数が揃った｜＝｜これで、数が揃いました」|{a}は{v}の喉に、儀式用の小刀を当てた。「ごめん。でも、これで皆が助かる｜すまない。だが、これで皆が助かる｜すみません。でも、これで皆が助かります」――刃が引かれた。'),
MAGE_SUMMON:L('{a}は洞窟の床に、生贄の血で描いた円を広げた。「下がってて｜下がっていろ｜下がっていてください」――{a}が唱えたのは、{g}を祓う呪文ではなかった。別の神を呼ぶ呪文だった。|{a}は懐から、生贄の血を吸わせた石を取り出し、祭壇に叩きつけた。「目には目を。神には、神を」'),
MAGE_PRICE:L('神々の争いが終わったとき、{a}の姿はなかった。呼び出された神が、代償を持ち去っていったのだ。|{a}は、呼び出した神に連れ去られながら、満足げに笑っていた。「これで、いい｜＝｜これで、いいんです」'),
COUNTER:[
{n:'旧神ノーデンス',t:'洞窟の天井が割れ、銀色の光と共に、白髪の老人が貝殻の戦車に乗って現れた。夜鬼の群れがそれを守るように舞い、{g}に襲いかかった。'},
{n:'クトゥグア',t:'洞窟の中に、白く燃える炎の塊が降りてきた。炎は{g}に絡みつき、その肉を焼き焦がした。'},
{n:'ハスター',t:'洞窟に、黄色い風が吹き込んだ。ぼろぼろの黄色い衣が{g}にまとわりつき、締め上げた。'},
{n:'ヨグ＝ソトース',t:'虹色の泡が、洞窟いっぱいに湧き出した。泡は{g}を包み、別の時空へと押し流していった。'},
{n:'イタクァ',t:'洞窟の中に、吹雪が吹き荒れた。赤い目の巨人が{g}を掴み、凍てつく空の彼方へ引きずっていった。'},
{n:'名もなき外なる神',t:'洞窟の奥の空間が裂け、名状しがたい触腕の群れがあふれ出した。それは{g}を、端から喰らい始めた。'}
],
YGO_START:L('村のあちこちで、怒鳴り声と、何かを殴る鈍い音がしていた。村人は誰も、それを気にしていなかった。'),
YGO_IRRITATE:L('{a}は、仲間の咀嚼の音にさえ、苛立ちを抑えられなくなっていた。|{a}は壁を拳で殴りつけた。拳から血が流れても、痛みを感じなかった。|{a}は、ふと、隣の仲間の喉笛を見つめている自分に気づいた。|{a}の掌が、じくじくと熱を持っていた。'),
YGO_ASSAULT:L('{a}は突然、{b}に殴りかかった。止めに入った手を振り払い、何度も、何度も。「……あれ、私、何を｜……私は、何を｜……あれ、私、何をしたんでしょう」{a}は血まみれの拳を見下ろした。|{a}は{b}を壁に叩きつけ、首を絞め上げた。我に返ったのは、{b}が気を失ってからだった。|{a}は薪割りの斧を手に、{b}を追い回した。誰かが後ろから{a}を羽交い締めにした。'),
YGO_KILL:L('{a}の拳は止まらなかった。{b}が動かなくなっても、{a}は殴り続けた。その掌が、ぱくりと口を開けて笑った。|{a}は{b}の喉に食らいついた。{a}の掌から生えた口が、{b}の血を啜った。'),
YGO_CALM:L('{b}が{a}の肩を抱き、祝詞を唱えた。{a}の掌のうずきが、少しだけ収まった。'),
CAVE_IN:L('{g}の祀られた洞窟は、神社の裏手の岩壁に口を開けていた。一行は、懐中電灯ひとつを頼りに、闇の中へ踏み込んだ。|洞窟の入口には、注連縄が幾重にも張られていた。それを切って中に入ると、空気が急に冷たく、重くなった。|洞窟は、思っていたよりずっと深かった。足元の岩は濡れて滑り、どこか遠くで、水の滴る音と、何かの息遣いがした。'),
CAVE_MID:L('壁一面に、{g}を讃える絵が刻まれていた。その絵の中には、生贄にされる人々の姿もあった。――一行と同じ服を着た人々が。|洞窟の途中に、古い骨が山のように積まれていた。その上に、まだ新しい靴が片方だけ載っていた。|奥へ進むにつれて、壁が、生き物の内臓のようにぬめりを帯びて脈打ち始めた。|分かれ道で、懐中電灯が明滅した。闇の中から、名前を呼ぶ声がした。仲間の声だった。仲間は、全員ここにいるのに。'),
CAVE_CHASE:L('背後から、村人たちの松明が迫ってきた。祭り囃子が、洞窟の中にまで反響していた。|入口の方で、村人たちが岩で洞窟を塞ぐ音がした。もう、戻る道はない。'),
CAVE_END:L('洞窟の最深部に、それはあった。苔むした石の祠。扉の隙間から、生ぬるい風が呼吸のように出入りしていた。|最深部の空洞には黒い水を湛えた池があり、その中央の岩の上に、古い祠が建っていた。|最深部には、天井の見えない大空洞が広がっていた。その中央に、祠がひとつ。祠の奥から、地鳴りのような唸り声が響いていた。'),
COLLAPSE:L('祠が崩れると同時に、洞窟全体が揺れ始めた。一行は、崩れ落ちる岩の雨の中を、出口へと走った。'),
COLLAPSE_DIE:L('{a}の頭上に、天井の岩が崩れ落ちた。伸ばした手は、誰にも届かなかった。|{a}は出口まであと数歩のところで、足元の裂け目に呑まれた。'),
MANIFEST:L('祠の扉が、内側から弾け飛んだ。|地の底から、何かが目を覚ます音がした。|村中の提灯が、一斉に消えた。闇の中で、それが身を起こした。'),
ENGULF:L('{g}は、村ごと、すべてを呑み尽くした。逃げ惑う者の悲鳴も、祭り囃子も、やがて聞こえなくなった。翌朝、山道の先には、ただの深い森だけが広がっていた。|夜が明けることはなかった。{n}は{g}と共に、地図からも、人の記憶からも消えた。|山が鳴った。{n}のあった谷は、ひと晩のうちに、底の見えない淵に変わった。'),
NO_ENGULF:L('{g}は、まだ完全には目覚めていなかった。その一瞬の隙に、一行は走り出した。|{g}の注意が、生贄に向いた。その隙に、一行は背を向けて走った。')
};
})();
});
;
/* ==== js/jashin-rel-text.js ==== */
HK.Load.def(332,'js/jashin-rel-text.js',function(){
(function(){
'use strict';
var HK=window.HK,JS=HK.JASHIN;
if(!JS)return;
function L(s){return s.split('|');}
JS.RELT={
INTRO:{
love:L('{a}と{b}は、村の不穏な空気の中でも、そっと手を繋いでいた。|{a}は{b}の肩に上着をかけた。「冷えるな、ここ｜ここは冷える｜ここは冷えますね」――村人たちの視線が、二人の繋いだ手に集まった。|{b}が不安そうに見上げると、{a}は小さく頷いた。「大丈夫。何があっても、一緒に帰ろう｜大丈夫だ。何があっても、一緒に帰るぞ｜大丈夫です。何があっても、一緒に帰りましょう」'),
family:L('{a}は{b}の袖を掴んで離さなかった。「勝手にどこか行くなよ。……家族なんだから｜勝手にどこかへ行くな。……家族なのだから｜勝手にどこかへ行かないでください。……家族なんですから」|{a}と{b}は、似た仕草で同時に溜息をついた。血は争えない、と誰かが笑った。'),
close:L('{a}と{b}は、着くなり軽口を叩き合っていた。その声だけが、静まり返った村に場違いに響いた。|{a}は{b}に目配せした。長い付き合いの二人には、それだけで十分だった。'),
bad:L('{a}と{b}は、目も合わせなかった。どうして同じ車に乗る羽目になったのか、二人とも同じことを考えていた。|{a}が何か言うたびに、{b}は鼻で笑った。村人たちは、その様子を面白そうに眺めていた。'),
ex:L('{a}と{b}は、互いに気づかないふりをしていた。別れてから、まだそれほど経っていなかった。'),
crush:L('{a}の目は、村の景色よりも、{b}の横顔ばかり追っていた。|{a}は、{b}の隣の席を取るために、誰よりも早くバスに乗り込んでいた。'),
mutual:L('{a}の目は、村の景色よりも、{b}の横顔ばかり追っていた。{b}もまた、{a}が窓の外を見ている隙にだけ、{a}を見ていた。二人の目は、一度も合わなかった。|{a}と{b}は、どちらも相手の隣の席を取るために誰よりも早くバスに乗り込み、鉢合わせして、同時に「たまたまだよ｜たまたまだ｜たまたまです」と言った。どちらも、相手は本当にたまたまなのだと思っていた。|{a}は、{b}に気づかれないように小さく溜息をついた。どうせ、自分の片想いだ。少し離れた席で、{b}もまったく同じことを考えていた。')
},
COMFORT:{
love:L('夜、{a}は震える{b}を抱き寄せた。外の祭り囃子が遠くなるまで、二人はそうしていた。|{b}が眠れずにいると、{a}が布団の中で手を握ってくれた。それだけで、少しだけ怖さが和らいだ。|「もし、どっちかが……」言いかけた{b}の唇を、{a}が塞いだ。「言うな｜＝｜言わないでください」'),
family:L('{a}は{b}の背中をさすりながら、子どもの頃の話をした。{b}は、いつの間にか眠っていた。|「昔もこうやって、怖い夢を見たら布団に潜り込んできたよな｜昔もこうして、怖い夢を見ると布団に潜り込んできたものだ｜昔もこうやって、怖い夢を見たら布団に潜り込んできましたよね」――{a}の言葉に、{b}は少し笑った。'),
close:L('{a}と{b}は、窓の外を見張りながら、くだらない話をして夜を明かした。|{a}は{b}に、とっておきの飴を半分割って渡した。「生きて帰ったら、もっといいもの奢れよ｜生きて帰ったら、もっといいものを奢れ｜生きて帰ったら、もっといいものを奢ってくださいね」'),
mutual:L('夜、{a}は眠れずに縁側へ出た。そこには先に{b}が座っていた。「……眠れなくて｜……眠れなくてな｜……眠れないんです」二人は同時に言い、同時に黙った。肩が触れそうな距離のまま、どちらも朝まで動けなかった。|{b}が震えているのに気づいて、{a}は手を伸ばしかけ、やめた。好きでもない相手に触れられても困るだろう、と思った。{b}は引っ込められた手を見て、やっぱり嫌われている、と思った。それでも二人は、朝まで隣にいた。|「{b}って、好きな人とかいるの｜{b}には、好きな人がいるのか｜{b}には、好きな人とかいるんですか」――{a}は、怖さを紛らわすふりをして聞いた。「……いるよ。向こうは、私のことなんて何とも思ってないけど｜……いる。向こうは、私のことなど何とも思っていないが｜……いますよ。向こうは、私のことなんて何とも思っていませんけど」{a}は黙って膝を抱えた。それが自分のことだとは、少しも思わなかった。')
},
SHIELD:L('{b}が{a}の前に飛び出した。「こいつに触るな！｜＝｜この人に触らないでください！」|{b}は{a}を突き飛ばし、代わりに村人たちの前に立ちはだかった。|{b}は咄嗟に{a}を抱え込み、その背中で振り下ろされたものを受け止めた。'),
SHIELD_OK:L('――{b}は傷だらけになりながらも、村人たちを追い払った。|――{b}の剣幕に、村人たちは後ずさり、闇の中へ退いた。'),
SHIELD_DIE:L('――{b}は、{a}の名前を呼びながら崩れ落ちた。最期まで、{a}の方を見ていた。|――村人たちは{b}を引きずっていった。{b}は最後に、「逃げろ｜＝｜逃げてください」とだけ言った。'),
ABANDON:L('{b}は、襲われる{a}を見て、一瞬だけ足を止めた。そして、背を向けた。|「自業自得だろ｜自業自得だ｜自業自得でしょう」――{b}は{a}の悲鳴に耳を塞いで、民宿の戸を閉めた。'),
GRIEF:{
love:L('{b}は{a}の亡骸を抱きしめ、声を上げて泣いた。誰も、{b}を引き離すことができなかった。|{b}は{a}の名前を、何度も何度も呼んだ。返事がないことが、どうしても信じられなかった。|{b}は泣かなかった。ただ、{a}の冷たい手を握ったまま、朝まで動かなかった。'),
family:L('{b}は{a}の名前を叫び続けた。「嘘だ、嘘だろ……一緒に帰るって、言ったじゃないか｜嘘だ、嘘だろう……一緒に帰ると、言ったではないか｜嘘です、嘘でしょう……一緒に帰るって、言ったじゃないですか」|{b}は{a}の遺品の小さなお守りを握りしめた。昔、自分があげたものだった。'),
close:L('{b}は壁を殴りつけた。「なんであなたなんだよ……！｜なぜあなたなのだ……！｜どうしてあなたなんですか……！」|{b}は{a}のいた場所を見つめたまま、しばらく何も言えなかった。'),
bad:L('{b}は、{a}の亡骸から目を逸らした。憎み合っていたはずなのに、胸の奥が妙に痛んだ。|「……勝ち逃げかよ｜……勝ち逃げか｜……勝ち逃げですか」{b}は小さく呟いた。'),
ex:L('{b}は、{a}の亡骸の前で立ち尽くした。言いたかったことが、まだたくさんあった。'),
crush:L('{b}は、とうとう{a}に想いを伝えられなかった。{b}は、{a}の手を握って、ようやく小さな声で言った。「……好きだったんだ｜……好きだった｜……好きだったんです」'),
mutual:L('{b}は、{a}の亡骸の前で膝をついた。言えなかった。どうせ届かないと思っていた。――{a}の手帳から、{b}の名前を何度も書いては消した跡が出てきたのは、そのあとだった。|{b}は、{a}の冷たい手を握った。「……好きだったんだ。迷惑だと思って、言えなかった｜……好きだった。迷惑だと思って、言えなかった｜……好きだったんです。迷惑だと思って、言えませんでした」――{a}が最期に呼んだのが自分の名前だったと、{b}はあとになって聞いた。|{b}は泣かなかった。片想いの相手が死んだだけだ、と自分に言い聞かせた。{a}のポケットから、{b}を写した一枚きりの写真が出てくるまでは。')
},
GRIEF_NB:{
love:L('{b}は、{a}が消えた闇に向かって、何度も何度も{a}の名前を呼んだ。返事は、どこからも返ってこなかった。|{b}は{a}の上着を胸に抱いて、声を上げて泣いた。誰も、{b}を引き離すことができなかった。|{b}は泣かなかった。ただ、{a}が最後に立っていた場所から、朝まで動かなかった。'),
family:L('{b}は{a}の名前を叫び続けた。「嘘だ、嘘だろ……一緒に帰るって、言ったじゃないか｜嘘だ、嘘だろう……一緒に帰ると、言ったではないか｜嘘です、嘘でしょう……一緒に帰るって、言ったじゃないですか」|{b}は{a}の遺品の小さなお守りを握りしめた。昔、自分があげたものだった。'),
close:L('{b}は壁を殴りつけた。「なんであなたなんだよ……！｜なぜあなたなのだ……！｜どうしてあなたなんですか……！」|{b}は{a}のいた場所を見つめたまま、しばらく何も言えなかった。'),
bad:L('{b}は、{a}が消えた方を見ようとしなかった。憎み合っていたはずなのに、胸の奥が妙に痛んだ。|「……勝ち逃げかよ｜……勝ち逃げか｜……勝ち逃げですか」{b}は小さく呟いた。'),
ex:L('{b}は、{a}が消えた場所の前で立ち尽くした。言いたかったことが、まだたくさんあった。|{b}は、{a}が残していった鞄を、長いあいだ開けられずにいた。言いたかったことが、まだたくさんあった。'),
crush:L('{b}は、とうとう{a}に想いを伝えられなかった。{a}の残した荷物を胸に抱えて、{b}はようやく小さな声で言った。「……好きだったんだ｜……好きだった｜……好きだったんです」'),
mutual:L('{b}は、{a}が消えた場所に膝をついた。言えなかった。どうせ届かないと思っていた。――{a}の荷物の手帳から、{b}の名前を何度も書いては消した跡が出てきたのは、そのあとだった。|{b}は、{a}の名前を一度だけ呼んだ。「……好きだったんだ。迷惑だと思って、言えなかった｜……好きだった。迷惑だと思って、言えなかった｜……好きだったんです。迷惑だと思って、言えませんでした」――{a}が最期に呼んだのが自分の名前だったと、{b}はあとになって聞いた。')
},
REVENGE:L('{b}は鉈を掴んで、民宿を飛び出した。「あいつらを、許さない｜＝｜あの人たちを、許しません」|{b}は誰の制止も聞かず、村長の家へ向かって走っていった。'),
REVENGE_OK:L('――{b}は村の男を二人叩き伏せ、血まみれで戻ってきた。村人たちは、それ以来、{b}を遠巻きにした。'),
REVENGE_DIE:L('――{b}は、それきり戻らなかった。翌朝、神社の鳥居に、{b}の上着が掛けられていた。'),
DESPAIR:L('{b}は、もう何もかもどうでもいいような顔で、ふらふらと夜の村へ出ていった。'),
RESCUE:L('{b}は夜陰に紛れて、座敷牢のある屋敷に忍び込んだ。|{b}は「待ってろ｜待っていろ｜待っていてください」とだけ言い残し、村人たちが{a}を連れていった方へ走った。'),
RESCUE_OK:L('――格子を壊し、{b}は{a}を連れ出した。二人は泥だらけになって民宿に転がり込んだ。|――{b}は見張りの隙をつき、{a}の縄を切った。「帰るぞ。一緒に｜＝｜帰りましょう。一緒に」'),
RESCUE_FAIL:L('――しかし、屋敷の中で待ち構えていた村人たちに、{b}も捕らえられた。|――{b}は見張りに見つかり、命からがら逃げ帰った。{a}を助けることはできなかった。'),
STAY:L('{a}は抜け道を見つけた。けれど、振り返った先に{b}がいた。「……一人じゃ帰れないよ｜……一人では帰れない｜……一人じゃ帰れませんよ」{a}は、来た道を戻った。|{a}は霧の切れ間を前に立ち止まった。{b}を置いていくことは、どうしてもできなかった。'),
STAY_TAKEN:L('{a}は抜け道を見つけた。けれど、{b}はまだ連れ去られたままだった。{a}は抜け道に背を向け、霧の奥へ引き返した。|{a}は霧の切れ間を前に立ち止まった。{b}を置いていくことは、どうしてもできなかった。{a}は来た道を戻り、{b}が連れていかれた方角を探しはじめた。'),
SUBST:L('「待ってくれ！｜待て！｜待ってください！」{b}が祭壇の前に飛び出した。「そいつの代わりに、私を連れていけ｜＝｜その人の代わりに、私を連れていってください」|{b}は{a}の白い着物を剥ぎ取り、自分が羽織った。「行って。早く｜行け。早く｜早く、行ってください」|村人たちが{a}を引き立てようとしたとき、{b}が静かに前に出た。「選ぶなら、こっちにして｜選ぶなら、こちらにしろ｜選ぶなら、こちらにしてください」'),
GOBACK:L('山道の途中で、{b}は{a}がついてきていないことに気づいた。{b}は迷わず引き返した。|{b}は、霧の向こうで{a}の悲鳴を聞いた。足は、自然と来た道を戻っていた。'),
GOBACK_OK:L('――{b}は{a}の手を掴み、二人で斜面を転がり落ちた。気づくと、国道の脇の草むらに倒れていた。'),
GOBACK_DIE:L('――二人の姿は、それきり霧の中に消えた。'),
RIVAL:L('{a}は、{b}が先に手がかりを見つけたと聞いて、意地になって村中を嗅ぎ回った。|「あなたにだけは負けない｜＝｜あなたにだけは負けません」――{a}と{b}は、競うように古文書を漁った。'),
QUARREL:L('{a}と{b}が、民宿の廊下で怒鳴り合っていた。「あなたのせいで！｜あなたのせいだ！｜あなたのせいです！」村人たちが、障子の隙間からそれを見ていた。|{a}は{b}の調べた結果を、わざと無視した。二人の間の空気は、最悪だった。'),
MAKEUP:L('{a}と{b}は、殴り合い寸前の口論のあと、黙って並んで座った。「……生きて帰ったら、続きをやろう｜……生きて帰ったら、続きをやるぞ｜……生きて帰ったら、続きをやりましょう」|{a}が差し出した手を、{b}は少し迷ってから握った。今だけは、休戦だった。'),
CONFESS:L('洞窟の入口で、{a}は{b}の手を取った。「……戻ったら、ちゃんと言うつもりだった。でも、今言う。好きだ｜……戻ったら、きちんと言うつもりだった。だが、今言う。好きだ｜……戻ったら、ちゃんと言うつもりでした。でも、今言います。好きです」|{a}は{b}の背中に向かって言った。「死ぬかもしれないから言っとく。ずっと、好きだった｜死ぬかもしれないから言っておく。ずっと、好きだった｜死ぬかもしれないから言っておきます。ずっと、好きでした」――{b}は振り返らずに、「……知ってた｜……知っていた｜……知っていました」と答えた。'),
CONFESS_EX:L('「もう一回、やり直せないかな｜もう一度、やり直せないか｜もう一度、やり直せませんか」――洞窟の暗闇の前で、{a}は{b}にそう言った。|洞窟の暗い口を前にして、{a}は{b}の袖を掴んだ。「別れたこと、ずっと後悔してた。……生きて帰れたら、もう一度だけ、隣にいさせて｜別れたことを、ずっと後悔していた。……生きて帰れたら、もう一度だけ、隣にいさせてくれ｜別れたこと、ずっと後悔していました。……生きて帰れたら、もう一度だけ、隣にいさせてください」|{b}が洞窟へ踏み出す前に、{a}は呼び止めた。「あのとき、ちゃんと引き止めればよかった。今度は離さないから｜あのとき、きちんと引き止めればよかった。今度は離さない｜あのとき、ちゃんと引き止めればよかったです。今度は離しませんから」'),
CONFESS_MUTUAL:L('洞窟の入口で、{a}は{b}の手を取った。「死ぬかもしれないから言っとく。ずっと、好きだった｜死ぬかもしれないから言っておく。ずっと、好きだった｜死ぬかもしれないから言っておきます。ずっと、好きでした」――{b}は目を見開いて、それから泣き笑いの顔になった。「……それ、こっちの台詞｜……それは、こちらの台詞だ｜……それ、こちらの台詞です」|「{b}、あのさ｜{b}、少しいいか｜{b}、少しいいですか」「{a}、あの」――洞窟の前で、二人の声が重なった。譲り合って、また重なった。最後に{b}が笑った。「……たぶん、同じこと言おうとしてる｜……たぶん、同じことを言おうとしている｜……たぶん、同じことを言おうとしてますね」|{a}は{b}に背を向けたまま言った。「どうせ迷惑だろうけど、好きだった｜どうせ迷惑だろうが、好きだった｜どうせ迷惑でしょうけど、好きでした」――返事の代わりに、背中に{b}の額が押し当てられた。「迷惑なわけない。……ずっと、私の片想いだと思ってた｜迷惑なわけがない。……ずっと、私の片想いだと思っていた｜迷惑なわけありません。……ずっと、私の片想いだと思っていました」'),
COVER:L('{b}は、{a}の袖の血に気づいた。そして、何も言わずに、自分の上着で隠した。|{b}は{a}の荷物の中の手帳を見つけた。少し迷ってから、それを囲炉裏の火にくべた。'),
AMN_START:L('{a}は、気づくと村の入口の地蔵の前に倒れていた。自分の名前以外、何も思い出せなかった。|{a}は一行の中にいた。なのに、どうしてここにいるのか、誰と来たのか、何ひとつ覚えていなかった。|{a}の鞄には、知らない筆跡の手帳と、この村への片道切符が入っていた。{a}には、それに覚えがなかった。'),
AMN_ASK:L('{b}は{a}の肩を揺さぶった。「本当に覚えてないの？　私のこと｜私のことを、本当に覚えていないのか？｜私のこと、本当に覚えていないんですか？」{a}は、申し訳なさそうに首を振った。|{b}は、{a}と二人で撮った写真を見せた。{a}は写真を長いあいだ見つめ、「……知らない人みたいだ｜……知らない人のようだ｜……知らない人みたいです」と言った。{b}は唇を噛んだ。|{b}は、{a}がいつも口ずさんでいた歌を、そっと歌ってみせた。{a}の目が、一瞬だけ揺れた。'),
AMN_CALL:L('村の老婆が{a}を見て、目を見開いた。「……おかえり」|村の子どもが、{a}の手を引いた。「ずっと待ってたんだよ」{a}には、その子に見覚えがなかった。'),
AMN_BACK:L('{a}の頭の中で、何かが弾けた。――思い出した。|その瞬間、{a}の中に、堰を切ったように記憶が流れ込んできた。|{a}は頭を抱えてうずくまった。忘れていたものが、全部戻ってきた。'),
AMN_TRUTH:{
normal:L('{a}がこの村に来たのは――{r}。'),
villager:L('{a}は、この村で生まれたのだ。幼い頃、母に手を引かれて、夜の山道を逃げた。あの夜が、前の祭りの夜だった。――村人たちが「おかえり」と言った理由が、ようやく分かった。'),
survivor:L('{a}は、前の祭りの生き残りだった。仲間を置いて、たった一人で逃げた。その記憶ごと、全部忘れていたのだ。――{a}は、あのとき見た{g}の弱点を覚えていた。'),
lure:L('{a}は、仲間をこの村に誘い込むよう、村人に頼まれていたのだ。報酬と引き換えに。――思い出した瞬間、{a}は膝から崩れ落ちた。'),
ghost:L('{a}は、もう死んでいた。前の祭りの夜に、生贄として。――{a}は自分の手を見た。指先が、少しずつ透けていった。'),
tie:L('{a}は、{b}のことを思い出した。{b}と過ごした日々を、{b}が自分にとってどれほど大切な人だったかを。')
},
AMN_ATONE:L('{a}は皆の前で頭を下げた。「私が、ここに連れてきたんだ。……償わせてくれ｜私が、ここに連れてきたのだ。……償わせてくれ｜私が、ここに連れてきたんです。……償わせてください」{a}は、村人から聞いていた秘密を全部話した。|{a}は泣きながら全てを打ち明けた。そして、誰よりも前に立って、仲間を守ると誓った。'),
AMN_BETRAY:L('{a}は、何も言わなかった。その夜、{a}は{b}を「いいものを見つけた｜＝｜いいものを見つけました」と誘い出し、村人たちの待つ社へ連れていった。|{a}は記憶が戻ったことを隠した。そして、村人たちと目配せを交わした。'),
AMN_GHOST_END:L('{a}は、仲間たちに微笑んだ。「最後に、役に立てたかな｜最後に、役に立てただろうか｜最後に、役に立てたでしょうか」――次の瞬間、{a}の姿は、霧の中に溶けて消えた。'),
AMN_NEVER:'記憶は戻らないままだった',
SLEUTH_START:L('{a}は村に入るなり、足元の土を指でつまみ、匂いを嗅いだ。「なるほど。この村では最近、人が死んでるね｜なるほど。この村では最近、人が死んでいるな｜なるほど。この村では最近、人が死んでいますね」|{a}は村長の挨拶を聞き終えると、静かに言った。「三つ、嘘があったね｜三つ、嘘があったな｜三つ、嘘がありましたね」|{a}は誰にともなく呟いた。「事件の匂いがする｜＝｜事件の匂いがします」'),
SLEUTH_CASE:L('{a}は亡骸の傍らに膝をつき、傷口と、爪の間の泥と、周りの足跡を、黙って調べ続けた。|{a}は現場の写真を何枚も撮り、手帳に細かい図を描いた。「犯人は、ひとつだけミスをしてる｜犯人は、ひとつだけミスをしている｜犯人は、ひとつだけミスをしています」'),
SLEUTH_SOLVE:L('{a}は一同を囲炉裏の前に集めた。「さて――みんな。{vs}を殺した犯人が分かった｜さて――諸君。{vs}を殺した犯人が分かった｜さて――皆さん。{vs}を殺した犯人が分かりました」|{a}は静かに眼鏡を押し上げた。「この事件の謎は、全部解けた｜この事件の謎は、すべて解けた｜この事件の謎は、すべて解けました」|{a}は推理を語り始めた。足跡、泥、時刻、そしてたったひとつの矛盾。一同は、息を呑んで聞いていた。'),
SLEUTH_MAGE:L('「犯人は――{c}さん、あなただよ｜犯人は――{c}さん、あなただ｜犯人は――{c}さん、あなたです」{a}の指が、まっすぐに{c}を指した。「傷口に残った蝋の跡。あれは、儀式用の蝋燭だよ。この中で、そんなものを持ち歩いてるのは、あなただけだ｜傷口に残った蝋の跡。あれは、儀式用の蝋燭だ。この中で、そんなものを持ち歩いているのは、あなただけだ｜傷口に残った蝋の跡。あれは、儀式用の蝋燭です。この中で、そんなものを持ち歩いているのは、あなただけです」|「血で描かれた円は、星の配置を写したものだよ。そして、星の位置を手帳に書き留めてたのは――{c}さん、あなただね｜血で描かれた円は、星の配置を写したものだ。そして、星の位置を手帳に書き留めていたのは――{c}さん、あなただな｜血で描かれた円は、星の配置を写したものです。そして、星の位置を手帳に書き留めていたのは――{c}さん、あなたですね」'),
SLEUTH_VILLAGE:L('「犯人は、民宿の女将さんだよ｜犯人は、民宿の女将さんだ｜犯人は、民宿の女将さんです」――{a}の言葉に、女将の顔色が変わった。「あなたは、{vs}が「見てはいけないもの」を見たことに気づいた。だから口を封じた。……そうですね？」|「犯人は村の誰か一人じゃない。村ぐるみだ｜犯人は村の誰か一人ではない。村ぐるみだ｜犯人は村の誰か一人ではありません。村ぐるみです」{a}は言った。「そして、{vs}は殺される直前、これを見つけていた｜＝｜そして、{vs}は殺される直前、これを見つけていました」――{a}が差し出したのは、{v}が握りしめていた紙片だった。'),
SLEUTH_GAIN:L('――追い詰められた村人は、ついに口を割った。|――{a}の推理が暴いた真相の中に、神の正体を示すものがあった。'),
SLEUTH_TIDY:L('「待って｜待て｜待ってください」{a}が、{b}の推理を遮った。「その説には三つ穴がある。――{c}さんは犯人じゃない｜その説には三つ穴がある。――{c}さんは犯人ではない｜その説には三つ穴があります。――{c}さんは犯人ではありません」|{a}は{b}が荒らした現場を見て、深い溜息をついた。それから、踏み荒らされた足跡の中から、本物の足跡を一つずつ拾い上げていった。'),
SLEUTH_INFER:L('{a}は手帳を閉じた。「手がかりはまだ足りない。けど、足りない部分は、推理で埋められる｜手がかりはまだ足りない。だが、足りない部分は、推理で埋められる｜手がかりはまだ足りません。けれど、足りない部分は、推理で埋められます」'),
PONK_START:L('{a}はパイプ（中身はチョコ）をくわえて、村を見回した。「ふむ。この名探偵の目は誤魔化せないよ｜ふむ。この名探偵の目は誤魔化せないぞ｜ふむ。この名探偵の目は誤魔化せませんよ」|{a}は到着するなり、虫眼鏡で村長の顔を覗き込み、思いきり怒鳴られた。|{a}は自信満々に宣言した。「犯人はこの中にいる！｜＝｜犯人はこの中にいます！」――まだ、何の事件も起きていなかった。'),
PONK_WRONG:L('{a}は{c}をびしっと指さした。「犯人は、あなただね！　さっき、靴紐を結び直してた。証拠隠滅だ！｜犯人は、あなただな！　さっき、靴紐を結び直していた。証拠隠滅だ！｜犯人は、あなたですね！　さっき、靴紐を結び直していました。証拠隠滅です！」|「分かった！｜＝｜分かりました！」{a}は叫んだ。「{c}さんは、実は村人の変装なんだ！｜{c}さんは、実は村人の変装だ！｜{c}さんは、実は村人の変装なんです！」――{c}は、ぽかんとしていた。|{a}は{c}の荷物を勝手にひっくり返した。「この飴の包み紙……間違いない、あなたが犯人だ！｜＝｜この飴の包み紙……間違いありません、あなたが犯人です！」'),
PONK_WRONG_BELIEVE:L('――一同の視線が、{c}に集まった。疑心暗鬼に陥っていた一行は、{c}を縛り上げて、土蔵に閉じ込めてしまった。|――恐怖でまともな判断ができなくなっていた一行は、{a}の推理を信じてしまった。{c}は柱に縛りつけられた。'),
PONK_WRONG_LAUGH:L('――誰も信じなかった。{c}は、深い溜息をついた。|――一同は、もう{a}の話を聞いていなかった。'),
PONK_RUIN:L('{a}は「証拠を確保する！｜＝｜証拠を確保します！」と叫んで現場に飛び込み、見事にすべての足跡を踏み荒らした。|{a}は大切な古文書を「指紋を取る｜＝｜指紋を取ります」と言って、囲炉裏の煤まみれにしてしまった。読めるところは、もう残っていなかった。|{a}は手がかりの紙片を、大事そうに胸ポケットにしまい、そのまま洗濯に出した。'),
PONK_LOUD:L('{a}は村の広場の真ん中で、大声で推理を披露し始めた。「この村の神様の正体は――」村人たちの目つきが、一斉に変わった。|{a}は村長の家の戸を叩いて叫んだ。「全部分かってるんだよ！　観念しろ！｜全部分かっているのだ！　観念しろ！｜全部分かってるんですよ！　観念しなさい！」何も、分かっていなかった。'),
PONK_TRAP:L('{a}は「怪しい！｜＝｜怪しいです！」と叫びながら、立ち入り禁止の札を蹴飛ばして奥へ進んだ。{b}が慌てて追いかけた。'),
PONK_LUCKY:L('{a}は転んだ拍子に、床下の隠し戸を見つけた。「ふっ……計算通りだよ｜ふっ……計算通りだ｜ふっ……計算通りです」誰も信じなかったが、そこには確かに手がかりがあった。|{a}の的外れな推理を聞いていた{b}が、はっとした。「待って。今の、半分だけ合ってる｜待て。今のは、半分だけ合っている｜待ってください。今の、半分だけ合ってます」|{a}は適当に指さした方向を掘らせた。何かが出てきた。{a}が一番驚いていた。'),
PONK_BELIEVE:L('――{a}は、記者の話に目を輝かせた。「やっぱり！　私の推理と同じだ！｜やはり！　私の推理と同じだ！｜やはり！　私の推理と同じです！」'),
PONK_BANTER:L('{b}は{a}を見て、眉間を押さえた。「……先輩、頼むから何もしないで｜……先輩、頼むから何もしないでくれ｜……先輩、頼むから何もしないでください」|{a}が胸を張った。「名探偵が二人もいれば、解決は時間の問題だね！｜名探偵が二人もいれば、解決は時間の問題だな！｜名探偵が二人もいれば、解決は時間の問題ですね！」{b}は返事をしなかった。'),
MURDER:L('朝、祭りの世話役の老人が、土蔵の中で死んでいた。首には、縄の跡があった。村人たちは、一斉に一行を睨んだ。「よそ者が来てから、これだ」|神社の石段の下で、村の若者が死んでいた。後頭部が割れていた。村人たちは、口々に「よそ者の仕業だ」と囁いた。|民宿の井戸から、村長の弟が引き上げられた。村人たちの目が、冷たく一行に注がれた。'),
MURDER_UNSOLVED:'事件は、誰にも解かれないまま、村の空気だけが悪くなっていった。'
};
})();
});
;
/* ==== js/jashin-rel.js ==== */
HK.Load.def(333,'js/jashin-rel.js',function(){
(function(){
'use strict';
var HK=window.HK,ST=HK.Story,JS=HK.JASHIN,clamp=HK.clamp,T=JS&&JS.RELT;
if(!ST|| !JS|| !T)return;
var LOVE='lover,mate,fated,almost,fwb',FAMILY='sibling,sibprot,sibclose,sibbad,parent,pparent,relative',CLOSE='best,buddy,childhood,friend,mentor,master,teacher,senpai,colleague,classmate,boss,benefactor,worship,fond,blind',BAD='enemy,rival,bad';
var W={lover:1,mate:1,fated:1,almost:0.8,fwb:0.45,sibling:0.8,sibprot:0.95,sibclose:0.9,parent:0.95,pparent:0.9,best:0.75,buddy:0.8,childhood:0.7,friend:0.5,mentor:0.6,master:0.6,teacher:0.5,senpai:0.4,colleague:0.3,classmate:0.4,boss:0.45,benefactor:0.6,relative:0.6,worship:0.85,fond:0.55,blind:0.75,acq:0.1,ex:0.3,rival: -0.3,enemy: -0.7,sibbad: -0.15,bad: -0.4};
function inList(t,l){return l.split(',').indexOf(t)>=0;}
function tiesOf(S,a,b){return(S.ties||[]).filter(function(t){return(t.a===a.i&&t.b===b.i)||(t.a===b.i&&t.b===a.i);});}
function bond(S,a,b){
var best=0,neg=0;
tiesOf(S,a,b).forEach(function(t){
var w=t.type==='crush'?(t.a===a.i?0.85:0.15):W[t.type]!=null?W[t.type]:0.1;
if((t.type==='enemy'||t.type==='bad')&&t.cold&&t.a!==a.i)w={none:0,normal:0.1,friend:0.5,love:0.9}[t.cold]||0;
if(t.type==='master'&&t.b===a.i)w=0.85;
if(t.type==='parent'||t.type==='pparent'||t.type==='sibprot')w=t.a===a.i?w:w-0.15;
if(w>best)best=w;if(w<neg)neg=w;
});
var base=best>0?best+neg*0.3:neg;
var k=a.i<b.i?a.i+'-'+b.i:b.i+'-'+a.i;
return Math.max(-1,Math.min(1.2,base+((S.relD&&S.relD[k])||0)));
}
function cat(S,a,b){
var l=tiesOf(S,a,b).map(function(t){return t;}),c='';
l.forEach(function(t){
if((t.type==='enemy'||t.type==='bad')&&t.cold&&t.a!==a.i){var bk={love:'love',friend:'close'}[t.cold]||'';if(['love','family','crush','close','ex','bad',''].indexOf(bk)<['love','family','crush','close','ex','bad',''].indexOf(c||''))c=bk;return;}
var k=inList(t.type,LOVE)?'love':inList(t.type,FAMILY)?'family':t.type==='crush'?(t.a===a.i?'crush':''):t.type==='ex'?'ex':inList(t.type,BAD)?'bad':inList(t.type,CLOSE)?'close':'';
var order=['love','family','crush','close','ex','bad',''];
if(order.indexOf(k)<order.indexOf(c||''))c=k;
});
return c;
}
function both(S,a,b){var ts=tiesOf(S,a,b);return ts.some(function(t){return t.type==='crush'&&t.a===a.i;})&&ts.some(function(t){return t.type==='crush'&&t.a===b.i;});}
function mutual(S,a,b){return both(S,a,b)&& !tiesOf(S,a,b).some(function(t){return inList(t.type,'lover,mate,fated');});}
function ED(S,a,b,lab,cls,from){if(JS.DRAMA)JS.DRAMA.edge(S,a,b,lab,cls,from);}
function A(S){return S.P.filter(function(p){return JS.alive(p)&& !p.bound;});}
function pickT(S,pool,v){return ST.fmt(ST.pick(S,pool),v);}
function setup(S,input){
var rng=S.rng,n=S.P.length;
S.ties=(input.ties||[]).filter(function(t){return t.a!==t.b&&t.a<n&&t.b<n&&t.a>=0&&t.b>=0&& !(HK.ngPair(S.P[t.a],S.P[t.b])&& /^(lover|fwb|mate|fated|crush|almost|ex|yan)$/.test(t.type));});
S.cases=[];S.relCnt=0;
var rate=(S.env.amnesia==null?8:S.env.amnesia)/100;
S.P.forEach(function(p){
if(rng()>=rate)return;
var partner=S.P.filter(function(q){return q!==p&&bond(S,q,p)>=0.5;})[0];
var ws=[['normal',0.4],['villager',0.18],['survivor',0.15],['lure',n>=2?0.12:0],['ghost',0.07],['tie',partner?0.3:0]];
var truth=HK.weighted(rng,ws,function(w){return w[1];})[0];
p.amn={truth:truth,real:p.reason,asked:0,back:false,partner:partner};
});
}
function arrive(S){
var rng=S.rng,done={},k=0;
S.P.forEach(function(p){
if(p.job==='sleuth')ST.say(S,{actors:[p],tag:'名探偵',text:pickT(S,T.SLEUTH_START,{a:p.name}),why:p.name+'は名探偵。仲間の死や村の殺人事件を推理で解き、儀式のたくらみも見抜きやすい',mag:12});
if(p.job==='ponkotsu'){
var sl=S.P.filter(function(q){return q.job==='sleuth'||q.job==='detective';})[0];
ST.say(S,{actors:sl?[p,sl]:[p],tag:'ポンコツ探偵',text:pickT(S,T.PONK_START,{a:p.name})+(sl?pickT(S,T.PONK_BANTER,{a:p.name,b:sl.name}):''),why:p.name+'はポンコツ探偵。的外れな推理で仲間を疑ったり、証拠を台無しにしたりする（たまに当たる）',mag:12});
}
});
S.P.forEach(function(a){
S.P.forEach(function(b){
if(a.i>=b.i||k>=3)return;
var c=cat(S,a,b);if(!c||done[a.i+'-'+b.i])return;
var x=a,y=b;
if(c==='crush'){var t=tiesOf(S,a,b).filter(function(q){return q.type==='crush';})[0];if(t&&t.a===b.i){x=b;y=a;}}
if(a.amn||b.amn)return;
done[a.i+'-'+b.i]=1;k++;
if(c==='crush'&&mutual(S,a,b))return ST.sayB(S,{actors:[x,y],tag:'関係',text:pickT(S,T.INTRO.mutual,{a:x.name,b:y.name}),why:'関係：'+relLabel(S,a,b)+'（お互いに想っているのに、どちらも自分の片想いだと思っている）'},x.name+'と'+y.name);
ST.sayB(S,{actors:[x,y],tag:'関係',text:pickT(S,T.INTRO[c],{a:x.name,b:y.name}),why:'関係：'+tiesOf(S,a,b).map(function(t){return HK.Sib&&HK.Sib.isSibTie(t)&&HK.tieLabel?HK.tieLabel(t):HK.TIES[t.type]?HK.TIES[t.type].label:t.type;}).join('・')},x.name+'と'+y.name);
});
});
}
function amnArrive(S,p){
ST.say(S,{actors:[p],tag:'記憶喪失',text:pickT(S,T.AMN_START,{a:p.name})+'最初は「'+p.action.label+'」、目標は「'+p.goal.label+'」。',why:p.name+'（'+JS.core.jobOf(p).label+'）は記憶を失っている。本当の理由は、記憶が戻ったときに分かる（知識の手がかりに弱く、霊感は鋭い）',mag:16});
}
function tick(S,live,h){
var rng=S.rng,night=JS.night(h);
S.P.forEach(function(p){
if(p.bound&&p.boundUntil!=null&&h>=p.boundUntil&&JS.alive(p)){
p.bound=false;p.boundUntil=null;
ST.sayB(S,{actors:[p],tag:'誤解',text:p.name+'の縄が解かれた。疑いは、結局ただの思い込みだった。'+p.name+'は、しばらく誰とも口をきかなかった。',why:'誤解が解けた'},p.name+'が解放された');
}
});
live=A(S);
amnTick(S,live,h);
live=A(S);
if(night&&rng()<0.18){
var pairs=[];
live.forEach(function(a){live.forEach(function(b){if(a.i<b.i){var c=cat(S,a,b);if(c==='love'||c==='family'||c==='close')pairs.push([a,b,c]);else if(c==='crush'&&mutual(S,a,b))pairs.push([a,b,'mutual']);}});});
if(pairs.length){
var pr=rng.pick(pairs),x=rng()<0.5?pr[0]:pr[1],y=x===pr[0]?pr[1]:pr[0];
x.m.fear=clamp(x.m.fear-6,0,100);y.m.fear=clamp(y.m.fear-10,0,100);
ST.sayB(S,{actors:[x,y],tag:'寄り添う',text:pickT(S,T.COMFORT[pr[2]],{a:x.name,b:y.name}),why:pr[2]==='mutual'?'両片想いの二人は、寄り添うと恐怖が和らぐ（どちらも、相手は自分を何とも思っていないと思い込んでいる）':'関係のある二人は、寄り添うと恐怖が和らぐ'},x.name+'と'+y.name+'が寄り添った');
}
}
if(rng()<0.1){
var bads=[];
live.forEach(function(a){live.forEach(function(b){if(a.i<b.i&&cat(S,a,b)==='bad')bads.push([a,b]);});});
if(bads.length){
var bp=rng.pick(bads),rival=tiesOf(S,bp[0],bp[1]).some(function(t){return t.type==='rival';});
if(rival&&rng()<0.5){bp[0].rivalBoost=bp[1].rivalBoost=2;ST.sayB(S,{actors:bp,tag:'張り合い',text:pickT(S,T.RIVAL,{a:bp[0].name,b:bp[1].name}),why:'ライバルどうしは張り合って、手がかりを見つけやすくなる'},bp[0].name+'と'+bp[1].name+'が張り合った');}
else if(S.relMade!==bp[0].i+'-'+bp[1].i&&(S.found.length>=3||rng()<0.25)){S.relMade=bp[0].i+'-'+bp[1].i;ST.sayB(S,{actors:bp,tag:'休戦',text:pickT(S,T.MAKEUP,{a:bp[0].name,b:bp[1].name}),why:'命がかかって、一時休戦した'},bp[0].name+'と'+bp[1].name+'が休戦');}
else{bp.forEach(function(p){p.m.fear=clamp(p.m.fear+4,0,100);});S.hostile=clamp(S.hostile+3,0,100);ST.sayB(S,{actors:bp,tag:'口論',text:pickT(S,T.QUARREL,{a:bp[0].name,b:bp[1].name}),why:'仲の悪い二人がぶつかった（村人に隙を見せる）'},bp[0].name+'と'+bp[1].name+'が口論');}
}
}
S.P.forEach(function(v){
if(!v.alive|| !v.taken)return;
var rs=live.filter(function(q){return q!==v&&bond(S,q,v)>=0.7;}).sort(function(a,b){return bond(S,b,v)-bond(S,a,v);});
var r=rs[0];
if(!r||rng()>(night?0.3:0.12))return;
var sk=JS.skill(r,'fight')*0.5+JS.skill(r,'explore')*0.4+r.stats.luck*0.03;
var t=pickT(S,T.RESCUE,{a:v.name,b:r.name}),roll=rng();
if(roll<sk){ED(S,r,v,'救出','guard',r);v.taken=false;v.takenAt=null;r.m.hp=clamp(r.m.hp-10,0,100);var o=ST.say(S,{actors:[r,v],tag:'救出',kind:'climax',text:t+pickT(S,T.RESCUE_OK,{a:v.name,b:r.name}),why:r.name+'は'+v.name+'を助けに行った（関係：'+relLabel(S,r,v)+'／腕っぷし・探索・運）',mag:34});ST.key(S,o,r.name+'が'+v.name+'を救出');return;}
if(roll>0.85){r.taken=true;r.takenAt=h;ST.say(S,{actors:[r,v],tag:'救出',kind:'climax',text:t+ST.fmt(T.RESCUE_FAIL[0],{a:v.name,b:r.name}),why:r.name+'も捕まった',mag:32});return;}
r.m.fear=clamp(r.m.fear+10,0,100);
ST.sayB(S,{actors:[r,v],tag:'救出',text:t+'――'+r.name+'は見張りに見つかり、命からがら逃げ帰った。'+v.name+'を助けることはできなかった。',why:'救出に失敗'},r.name+'の救出は失敗');
});
caseTick(S,A(S),h);
villageMurder(S,A(S),h);
ponkTick(S,A(S),h);
live.forEach(function(p){if(p.rivalBoost)p.rivalBoost--;});
if(JS.DRAMA)JS.DRAMA.tick(S,A(S),h);
}
function relLabel(S,a,b){
var bo=both(S,a,b),l=tiesOf(S,a,b).filter(function(t){return!(bo&&t.type==='crush');}).map(function(t){return HK.Sib&&HK.Sib.isSibTie(t)&&HK.tieLabel?HK.tieLabel(t):HK.TIES[t.type]?HK.TIES[t.type].label:t.type;});
if(bo)l.unshift('両片想い');
l=l.filter(function(x,i){return l.indexOf(x)===i;});
return l.join('・')||'なし';
}
function amnTick(S,live,h){
var rng=S.rng;
live.forEach(function(p){
var a=p.amn;if(!a||a.back)return;
var pt=a.partner&&JS.alive(a.partner)&& !a.partner.bound?a.partner:null;
if(pt&&rng()<0.12){a.asked++;ST.sayB(S,{actors:[pt,p],tag:'記憶',text:pickT(S,T.AMN_ASK,{a:p.name,b:pt.name}),why:pt.name+'（'+relLabel(S,pt,p)+'）が記憶を呼び戻そうとした'},pt.name+'が'+p.name+'に話しかけた');}
if((a.truth==='villager'||a.truth==='ghost')&& !a.called&&rng()<0.1){a.called=true;ST.sayB(S,{actors:[p],tag:'記憶',text:pickT(S,T.AMN_CALL,{a:p.name}),why:'村人は、'+p.name+'を知っているらしい'},'村人が'+p.name+'に声をかけた');}
if(rng()<0.035+S.found.length*0.015+a.asked*0.04+p.m.fear/1500)recover(S,p,h);
});
}
function recover(S,p,h){
var rng=S.rng,a=p.amn;a.back=true;a.at=h;
var b=a.partner||rng.pick(S.P.filter(function(q){return q!==p;}).concat([p]));
var t=pickT(S,T.AMN_BACK,{a:p.name})+pickT(S,T.AMN_TRUTH[a.truth],{a:p.name,b:b.name,r:a.real,g:S.G.call});
var why=p.name+'の記憶が戻った。',clue=0;
if(a.truth==='villager'){p.villager=true;why+='この村の出身だった（村人と話しやすいが、生贄に選ばれやすい）';if(rng()<0.5)clue=1;}
if(a.truth==='survivor'){p.m.fear=clamp(p.m.fear+15,0,100);clue=1;why+='前の祭りの生き残りだった（神の弱点を覚えていた）';}
if(a.truth==='tie'){p.m.fear=clamp(p.m.fear-10,0,100);if(JS.alive(b))b.m.fear=clamp(b.m.fear-10,0,100);why+=b.name+'との関係（'+relLabel(S,p,b)+'）を思い出した';}
if(a.truth==='normal')why+='来た理由を思い出しただけだった';
if(a.truth==='lure'){
var atone=p.tr.warmth*0.5+p.tr.cp*0.3+(a.partner?0.2:0)>0.4+rng()*0.3;
if(atone){t+=pickT(S,T.AMN_ATONE,{a:p.name});clue=1;p.goal=JS.GOALS.filter(function(g){return g.id==='protect';})[0]||p.goal;why+='仲間を誘い込んだ手先だった。温かさ・CPが高く、償うことを選んだ';}
else{
var vs=A(S).filter(function(q){return q!==p&&bond(S,p,q)<0.5;});
var v=vs.length?rng.pick(vs):null;
p.traitor=true;
t+=pickT(S,T.AMN_BETRAY,{a:p.name,b:v?v.name:'仲間の一人'});
if(v){v.taken=true;v.takenAt=h;ED(S,p,v,'裏切り','enemy',p);}
why+='仲間を誘い込んだ手先だった。記憶が戻ると、村の側についた'+(v?'（'+v.name+'が連れ去られた）':'');
}
}
if(a.truth==='ghost')clue=2;
var added=[];
for(var i=0;i<clue;i++){var k=S.G.clues.map(function(c,j){return j;}).filter(function(j){return S.found.indexOf(j)<0;})[0];if(k!=null){S.found.push(k);p.cnt.clue++;added.push(S.G.clues[k].t);}}
if(added.length)t+='――'+added.join('。')+'。';
p.reason=a.real;
var o=ST.say(S,{actors:JS.alive(b)&&b!==p?[p,b]:[p],tag:'記憶',kind:'climax',text:t,why:why+(added.length?'（手がかり +'+added.length+'）':''),mag:38});
ST.key(S,o,p.name+'の記憶が戻った');
if(a.truth==='ghost'){
p.alive=false;p.fate='霧の中に消えた（もとから死んでいた・'+JS.hm(h)+'）';
ST.say(S,{actors:[p],tag:'記憶',kind:'climax',text:pickT(S,T.AMN_GHOST_END,{a:p.name}),why:p.name+'は、前の祭りの生贄だった',mag:40});
}
}
function onDeath(S,p){
var rng=S.rng,live=A(S);
var killer=S.killer;S.killer=null;
if(killer)S.cases.push({v:p,type:'mage',killer:killer,h:S.h});
else if(/村人に襲われて/.test(p.how||''))S.cases.push({v:p,type:'village',h:S.h});
var rel=live.filter(function(q){return q!==p&&cat(S,q,p);}).sort(function(a,b){return Math.abs(bond(S,b,p))-Math.abs(bond(S,a,p));}).slice(0,2);
rel.forEach(function(q){
var c=cat(S,q,p),bd=bond(S,q,p);
q.m.fear=clamp(q.m.fear+(c==='love'?25:c==='family'?20:c==='bad'?4:12),0,100);
var G0=HK.State&&HK.State.noBody(p)&&T.GRIEF_NB?T.GRIEF_NB:T.GRIEF;
var t=pickT(S,(c==='crush'&&mutual(S,q,p)?G0.mutual:G0[c])||G0.close,{a:p.name,b:q.name}),why=q.name+'と'+p.name+'の関係：'+relLabel(S,q,p);
if(bd>=0.75&& !S.inCave&& /村人|何者か/.test(p.how||'')&&rng()<q.tr.aggr*0.5+q.tr.impulse*0.3){
t+=pickT(S,T.REVENGE,{b:q.name});
if(rng()<JS.skill(q,'fight')+0.15){t+=pickT(S,T.REVENGE_OK,{b:q.name});S.hostile=clamp(S.hostile-8,0,100);q.m.hp=clamp(q.m.hp-20,0,100);ST.say(S,{actors:[q,p],tag:'仇討ち',kind:'climax',text:t,why:why+'。攻撃性・衝動性が高く、仇を討ちに行った（腕っぷしで生還）',mag:36});}
else{ST.say(S,{actors:[q,p],tag:'仇討ち',kind:'climax',text:t,why:why+'。仇を討ちに行ったが、帰らなかった',mag:36});JS.core.die(S,q,p.name+'の仇を討ちに行って',[pickT(S,T.REVENGE_DIE,{b:'{a}'})]);}
return;
}
if(bd>=0.75&&rng()<q.tr.ac*0.3+(1-q.tr.cp)*0.15){
q.despair=true;q.action=JS.ACTIONS.filter(function(x){return x.id==='alone';})[0]||q.action;
t+=pickT(S,T.DESPAIR,{b:q.name});why+='。絶望して、一人で動くようになった';
}
ST.say(S,{actors:[q,p],tag:'喪失',text:t,why:why,mag:c==='love'||c==='family'?30:16});
});
}
function caseTick(S,live,h){
var rng=S.rng;
S.cases=S.cases.filter(function(c){
if(c.done)return false;
if(c.type==='mage'&&(!c.killer.alive||c.killer.bound))return false;
var sl=live.filter(function(q){return q.job==='sleuth';})[0]||live.filter(function(q){return q.job==='detective';})[0]||live.filter(function(q){return q.goal&&q.goal.id==='solve'&& !q.bound;})[0];
if(!sl||h-c.h<2)return true;
var ch=(sl.job==='sleuth'?0.4:0.15)+JS.skill(sl,'obs')*0.3+(sl.goal&&sl.goal.id==='solve'?0.15:0)+(c.prog||0)*0.08;
if(rng()>ch){if(!c.looked){c.looked=1;ST.sayB(S,{actors:[sl],tag:'捜査',text:pickT(S,(HK.State&&HK.State.bodyless(T.SLEUTH_CASE,c.v))||T.SLEUTH_CASE,{a:sl.name}),why:sl.name+'が'+c.v.name+'の死を調べている'},sl.name+'が現場を調べた');}return true;}
c.done=true;
var vs=c.v.i!=null?c.v.name+'さん':c.v.name,t=pickT(S,T.SLEUTH_SOLVE,{a:sl.name,v:c.v.name,vs:vs});
if(c.type==='mage'){
if(c.killer===sl)return false;
if(c.kind==='murder'&&JS.GOALX){
ST.say(S,{actors:[sl,c.killer],tag:'推理',kind:'climax',text:t+pickT(S,JS.GT.SLEUTH_MURDER,{a:sl.name,c:c.killer.name}),why:sl.name+'が、'+c.v.name+'殺しの犯人（'+c.killer.name+'）を推理で突き止めた',mag:42});
JS.GOALX.detect(S,c.killer,true,sl);
return false;
}
ST.say(S,{actors:[sl,c.killer],tag:'推理',kind:'climax',text:t+pickT(S,T.SLEUTH_MAGE,{a:sl.name,c:c.killer.name}),why:sl.name+'（'+JS.core.jobOf(sl).label+'）が、'+c.v.name+'殺しの犯人を推理で突き止めた',mag:42});
JS.detectMage(S,c.killer,true,sl);
return false;
}
var added=gainClue(S,sl);
S.hostile=clamp(S.hostile-10,0,100);
var o=ST.say(S,{actors:[sl],tag:'推理',kind:'climax',text:t+pickT(S,T.SLEUTH_VILLAGE,{a:sl.name,v:c.v.name,vs:vs})+(added?pickT(S,T.SLEUTH_GAIN,{a:sl.name})+added+'。':''),why:sl.name+'が'+c.v.name+'の死の真相を暴いた（村人の敵意 -10'+(added?'・手がかり +1':'')+'）',mag:40});
ST.key(S,o,sl.name+'が事件を解決');
return false;
});
}
function gainClue(S,p){
var k=S.G.clues.map(function(c,j){return j;}).filter(function(j){return S.found.indexOf(j)<0;})[0];
if(k==null)return'';
S.found.push(k);p.cnt.clue++;
return S.G.clues[k].t;
}
function villageMurder(S,live,h){
var rng=S.rng;
if(S.vmurder||h<6||rng()>0.05+S.hostile/2000)return;
S.vmurder=true;
S.hostile=clamp(S.hostile+15,0,100);
var c={v:{name:'殺された村人'},type:'village',h:h};
var o=ST.say(S,{kind:'phase',tag:'殺人事件',text:ST.pick(S,T.MURDER),why:'村で殺人事件が起きた。よそ者が疑われ、村人の敵意が上がる（+15）。名探偵なら真相を暴ける',mag:30});
ST.key(S,o,'村で殺人事件');
S.cases.push(c);S.vcase=c;
}
function ponkTick(S,live,h){
var rng=S.rng;
live.forEach(function(p){
if(p.job!=='ponkotsu'||rng()>(S.cases.length?0.22:0.12))return;
var sl=live.filter(function(q){return q!==p&&(q.job==='sleuth'||q.job==='detective');})[0];
var others=live.filter(function(q){return q!==p;});
var r=rng(),o;
if(r<0.3&&others.length){
var c=HK.weighted(rng,others,function(q){return 1+(bond(S,p,q)<0?3:0)-(bond(S,p,q)>0.6?0.8:0);});
var mage=S.cases.filter(function(x){return x.type==='mage';})[0],hit=mage&&mage.killer===c;
var t=pickT(S,T.PONK_WRONG,{a:p.name,c:c.name});
if(hit){ST.say(S,{actors:[p,c],tag:'迷推理',kind:'climax',text:t+'――理由はめちゃくちゃだった。けれど、犯人は本当に'+c.name+'だった。',why:'ポンコツ探偵の推理が、たまたま当たった',mag:36});JS.detectMage(S,c,true,p);return;}
if(sl&&rng()<0.7)return ST.sayB(S,{actors:[sl,p,c],tag:'迷推理',text:t+pickT(S,T.SLEUTH_TIDY,{a:sl.name,b:p.name,c:c.name}),why:sl.name+'が迷推理を即座に否定した'},sl.name+'が'+p.name+'の推理を否定');
var avgA=others.reduce(function(s0,q){return s0+q.tr.a;},0)/others.length,fear=others.reduce(function(s0,q){return s0+q.m.fear;},0)/others.length;
if(rng()<0.15+fear/250-avgA*0.3+(S.cases.length?0.15:0)){
c.bound=true;c.boundUntil=h+6;c.boundAt='土蔵';
o=ST.say(S,{actors:[p,c],tag:'迷推理',kind:'climax',text:t+pickT(S,T.PONK_WRONG_BELIEVE,{a:p.name,c:c.name}),why:'恐怖で判断が鈍っていた一行は、ポンコツ探偵を信じた（'+c.name+'は6時間縛られる）',mag:30});
return ST.key(S,o,c.name+'が誤って縛られた');
}
return ST.sayB(S,{actors:[p,c],tag:'迷推理',text:t+pickT(S,T.PONK_WRONG_LAUGH,{a:p.name,c:c.name}),why:'誰も信じなかった'},p.name+'が'+c.name+'を疑った');
}
if(r<0.48&&S.found.length){
if(sl&&rng()<0.4)return ST.sayB(S,{actors:[sl,p],tag:'迷推理',text:pickT(S,T.PONK_RUIN,{a:p.name})+pickT(S,T.SLEUTH_TIDY,{a:sl.name,b:p.name,c:p.name}).split('。').slice(-3).join('。'),why:sl.name+'が荒らされた現場を立て直した'},sl.name+'が現場を立て直した');
S.found.pop();
return ST.say(S,{actors:[p],tag:'迷推理',text:pickT(S,T.PONK_RUIN,{a:p.name}),why:'ポンコツ探偵が手がかりを台無しにした（手がかり -1）',mag:18});
}
if(r<0.65){S.hostile=clamp(S.hostile+10,0,100);return ST.sayB(S,{actors:[p],tag:'迷推理',text:pickT(S,T.PONK_LOUD,{a:p.name}),why:'村人の前で騒いだ（村人の敵意 +10）'},p.name+'が騒いだ');}
if(r<0.82){
var b=others.length?rng.pick(others):p;
ST.sayB(S,{actors:[p,b],tag:'迷推理',text:pickT(S,T.PONK_TRAP,{a:p.name,b:b.name}),why:'ポンコツ探偵が危ない場所に踏み込んだ'},p.name+'が暴走');
return JS.core.trap(S,rng()<0.6?p:b,live,false);
}
var g=gainClue(S,p);
if(g){var o2=ST.say(S,{actors:[p],tag:'迷推理',text:pickT(S,T.PONK_LUCKY,{a:p.name,b:(others[0]||p).name})+'――'+g+'。',why:'ポンコツ探偵の迷推理が、たまたま当たった（手がかり +1）',mag:22});ST.key(S,o2,p.name+'の迷推理が当たった');}
});
}
function near(S,p,q){var b=bond(S,q,p);return S.rng()<(b<0?0.25:0.45+b*0.45);}
function shield(S,p,live,t0){
var rng=S.rng;
var gs=live.filter(function(q){return q!==p&&JS.alive(q)&& !q.bound&&bond(S,q,p)>=0.6;}).sort(function(a,b){return bond(S,b,p)-bond(S,a,p);});
var g=gs[0];
if(!g||rng()>bond(S,g,p)*0.55+g.tr.warmth*0.15+(g.job==='manager'?0.15:0)){
var ab=live.filter(function(q){return q!==p&&JS.alive(q)&& !q.bound&&bond(S,q,p)<0;})[0];
if(ab&&rng()<0.3)ST.sayB(S,{actors:[ab,p],tag:'見捨てる',text:pickT(S,T.ABANDON,{a:p.name,b:ab.name}),why:ab.name+'と'+p.name+'の関係：'+relLabel(S,ab,p)+'（助けなかった）'},ab.name+'は'+p.name+'を見捨てた');
return false;
}
var t=t0+pickT(S,T.SHIELD,{a:p.name,b:g.name}),why=g.name+'が'+p.name+'をかばった（関係：'+relLabel(S,g,p)+'）';
if(rng()<JS.skill(g,'fight')+g.stats.stamina*0.06){
g.m.hp=clamp(g.m.hp-20,0,100);p.m.fear=clamp(p.m.fear+8,0,100);
ED(S,g,p,'かばった','guard',g);
var o=ST.say(S,{actors:[g,p],tag:'かばう',kind:'climax',text:t+pickT(S,T.SHIELD_OK,{a:p.name,b:g.name}),why:why+'――撃退した',mag:34});ST.key(S,o,g.name+'が'+p.name+'をかばった');
return true;
}
ST.say(S,{actors:[g,p],tag:'かばう',kind:'climax',text:t,why:why,mag:34});
ED(S,g,p,'かばって死んだ','guard',g);
JS.core.die(S,g,p.name+'をかばって',[pickT(S,T.SHIELD_DIE,{a:p.name,b:'{a}'})]);
return true;
}
function stay(S,p){
var b=A(S).filter(function(q){return q!==p&&bond(S,p,q)>=0.7;})[0]||S.P.filter(function(q){return q!==p&&q.alive&&q.taken&&bond(S,p,q)>=0.7;})[0];
if(!b||S.rng()>0.55+p.tr.warmth*0.3)return false;
var tk= !!b.taken&&T.STAY_TAKEN;
ST.sayB(S,{actors:tk?[p]:[p,b],tag:'残る',text:pickT(S,tk?T.STAY_TAKEN:T.STAY,{a:p.name,b:b.name}),why:p.name+'は'+b.name+'（'+relLabel(S,p,b)+'）を置いて逃げられなかった'},p.name+'は残った');
return true;
}
function substitute(S,vic){
if(!vic)return vic;
var rng=S.rng,cs=A(S).filter(function(q){return q!==vic&&bond(S,q,vic)>=0.8;}).sort(function(a,b){return bond(S,b,vic)-bond(S,a,vic);});
var q=cs[0];
if(!q||rng()>0.2+q.tr.warmth*0.35+(q.goal.id==='protect'?0.15:0))return vic;
var o=ST.say(S,{actors:[q,vic],tag:'身代わり',kind:'climax',text:pickT(S,T.SUBST,{a:vic.name,b:q.name}),why:q.name+'が'+vic.name+'（'+relLabel(S,q,vic)+'）の身代わりになった（温かさ）',mag:44});
ST.key(S,o,q.name+'が身代わりに');ED(S,q,vic,'身代わり','guard',q);
if(vic.taken){vic.out=true;vic.esc=S.h;vic.fate='身代わりのおかげで逃げ延びた（'+JS.hm(S.h)+'）';}
vic.taken=false;
return q;
}
function goBack(S,failed,ok){
var rng=S.rng,saved=[];
failed.forEach(function(p){
var b=ok.filter(function(q){return bond(S,q,p)>=0.75&&saved.indexOf(q)<0;})[0];
if(!b||rng()>0.35+b.tr.warmth*0.3)return;
var t=pickT(S,T.GOBACK,{a:p.name,b:b.name});
if(rng()<0.45+b.stats.stamina*0.04){saved.push(p);ED(S,b,p,'引き返して救った','guard',b);ST.say(S,{actors:[b,p],tag:'引き返す',kind:'climax',text:t+pickT(S,T.GOBACK_OK,{a:p.name,b:b.name}),why:b.name+'が'+p.name+'（'+relLabel(S,b,p)+'）を助けに戻った――二人とも逃げ延びた',mag:38});}
else{b.goBackDie=true;ST.say(S,{actors:[b,p],tag:'引き返す',kind:'climax',text:t+pickT(S,T.GOBACK_DIE,{a:p.name,b:b.name}),why:b.name+'は'+p.name+'を助けに戻り、帰らなかった',mag:38});}
});
return saved;
}
function confess(S,live){
var rng=S.rng,done=0;
live.forEach(function(a){
live.forEach(function(b){
if(done||a===b)return;
var ts=tiesOf(S,a,b);
if(ts.some(function(t){return t.type==='lover'||t.type==='mate'||t.type==='fated';}))return;
var AV=HK.Avoid,ab= !!(AV&&AV.of(S,a,b)),ba= !!(AV&&AV.of(S,b,a));
var ok= !ab&&ts.some(function(t){return(t.type==='crush'&&t.a===a.i)||((t.type==='almost'||t.type==='ex')&&(ba||a.i<b.i));});
if(!ok||rng()>0.55)return;
done=1;a.m.fear=clamp(a.m.fear-10,0,100);b.m.fear=clamp(b.m.fear-6,0,100);
if(mutual(S,a,b)&&(!HK.Poly||HK.Poly.storyCan(S,a,b))){
b.m.fear=clamp(b.m.fear-6,0,100);
S.ties.push({a:a.i,b:b.i,type:'lover',born:true});if(JS.DRAMA)JS.DRAMA.setRel(S,a,b,0.2,'恋人');
return ST.say(S,{actors:[a,b],tag:'告白',text:pickT(S,T.CONFESS_MUTUAL,{a:a.name,b:b.name}),why:'関係：両片想い。死を前にして想いを口にし、ようやく通じた（どちらも、自分の片想いだと思っていた）',mag:32});
}
ST.say(S,{actors:[a,b],tag:'告白',text:pickT(S,ts.some(function(t){return t.type==='ex';})&&T.CONFESS_EX?T.CONFESS_EX:T.CONFESS,{a:a.name,b:b.name}),why:'関係：'+relLabel(S,a,b)+'。死を前にして、想いを口にした',mag:30});
});
});
}
function cover(S,m,b){
if(bond(S,b,m)<0.75||S.rng()>0.6)return false;
ST.say(S,{actors:[b,m],tag:'隠蔽',text:pickT(S,T.COVER,{a:m.name,b:b.name}),why:b.name+'は'+m.name+'（'+relLabel(S,b,m)+'）のたくらみに気づいたが、黙っていた',mag:26});
return true;
}
function spare(S,m,v){return bond(S,m,v)>=0.6;}
JS.REL={setup:setup,arrive:arrive,amnArrive:amnArrive,tick:tick,onDeath:onDeath,near:near,shield:shield,stay:stay,substitute:substitute,goBack:goBack,confess:confess,cover:cover,spare:spare,bond:bond,cat:cat,mutual:mutual};
})();
});
;
/* ==== js/jashin-drama.js ==== */
HK.Load.def(334,'js/jashin-drama.js',function(){
(function(){
'use strict';
var HK=window.HK,ST=HK.Story,JS=HK.JASHIN,clamp=HK.clamp;
if(!ST|| !JS)return;
function L(s){return s.split('|');}
function F(t,m){return ST.fmt(t,m);}
var T={
talk:L('{a}と{b}は、眠れない夜を囲炉裏の前で語り明かした。村の外の話をしているあいだだけ、怖さを忘れられた。|{a}は、{b}に自分の昔の話をした。こんな場所でなければ、話さなかったはずの話だった。|{a}と{b}は、民宿の縁側で星を見上げた。この村の星は、どこか数が多すぎた。'),
protect:L('{b}が震えていると、{a}が黙って隣に座った。「大丈夫。朝まで起きてるから｜大丈夫だ。朝まで起きている｜大丈夫です。朝まで起きていますから」|{a}は怯える{b}の部屋の前で、一晩中見張りに立った。外の足音が近づくたび、{a}は扉を背中で押さえた。'),
team:L('{a}と{b}は、二人で村の地図を描き直した。いつの間にか、息の合った相棒のようになっていた。|{a}と{b}は、背中合わせで神社の裏を調べた。互いの足音だけが、頼りだった。'),
shared:L('{a}と{b}は、{v}のいた場所の前で、肩を寄せ合って泣いた。|{a}は、{v}を失った{b}の背中を、ずっとさすっていた。'),
quarrel:L('{a}と{b}は、民宿の廊下で怒鳴り合った。「あなたのせいで、こんな村に来たんだ！｜あなたのせいで、こんな村に来たんだぞ！｜あなたのせいで、こんな村に来たんです！」|{a}は{b}の言葉に我慢できず、膳をひっくり返して席を立った。村人たちが、障子の隙間からそれを見て笑っていた。'),
distrust:L('{a}は、{b}が夜中に村人と話しているのを見てしまった。それ以来、{b}の顔をまともに見られなかった。|{a}は、{b}の言葉に一つだけ嘘が混じっていることに気づいた。'),
makeup:L('{a}と{b}は、口論のあと、黙って並んで座った。「……疑って、悪かった｜＝｜……疑って、すみませんでした」|{a}は{b}に頭を下げた。「あのときは、怖かったんだ｜あのときは、怖かった｜あのときは、怖かったんです」――{b}は、少し笑って頷いた。'),
confess:L('{a}は、{b}の手を取った。「こんなときに言うことじゃないけど……ずっと、好きだった｜こんなときに言うことではないが……ずっと、好きだった｜こんなときに言うことじゃないですけど……ずっと、好きでした」|祭り囃子にかき消されそうな声で、{a}は{b}に想いを告げた。「生きて帰れたら、一緒にいてほしい｜＝｜生きて帰れたら、一緒にいてください」'),
yes:L('{b}は少し驚いて、それから{a}の手を握り返した。|{b}は泣きそうな顔で笑った。「……生きて帰ったら、ちゃんと聞かせて｜……生きて帰ったら、ちゃんと聞かせてくれ｜……生きて帰ったら、ちゃんと聞かせてください」'),
no:L('{b}は、困ったように目を伏せた。「……ごめん｜……すまない｜……ごめんなさい」|{b}は、何も答えなかった。その沈黙が、答えだった。'),
jealous:L('{a}は、{b}と{c}が親しげに話しているのを見て、胸の奥がざらついた。|{a}は、{c}をかばう{b}の背中を見つめていた。どうして、自分じゃないのか。'),
mutual:L('{a}と{b}の目が合った。二人は同時にそらした。{a}は「見ていたのがばれた」と思い、{b}は「睨まれた」と思った。|{a}は、{b}に何か言いかけて、やめた。少しして、{b}も{a}に何か言いかけて、やめた。二人とも、言わなくてよかったのだ、と自分に言い聞かせた。|{a}と{b}は、同時に相手の湯呑みにお茶を注ごうとして、急須を取り合う形になった。「……どうぞ」「……いや、そっちが｜……いや、そちらが｜……いえ、そちらがどうぞ」――周りの誰もが気づいていることに、二人だけが気づいていなかった。|{a}は、思い切って{b}を見張りの当番に誘った。「一人だと怖いから。……誰でもいいんだけど｜一人だと怖いからだ。……誰でもいいのだが｜一人だと怖いので。……誰でもいいんですけど」{b}は「誰でもいいなら、私でいいよ｜誰でもいいなら、私でいいだろう｜誰でもいいなら、私でいいですよ」と笑った。{a}は、その「誰でも」をひどく後悔した。'),
mjealous:L('{a}は、{b}と{c}が親しげに話しているのを見て、胸の奥がざらついた。やっぱり、{b}が好きなのは{c}なんだ。――{b}はその間ずっと、{a}がこっちを見ていないかばかり気にしていた。|{a}は、{c}をかばう{b}の背中を見つめていた。どうして、自分じゃないのか。――その夜、{b}は{c}に小声で相談していた。「{a}って、私のことどう思ってるのかな｜{a}は、私のことをどう思っているのだろう｜{a}って、私のことをどう思っているんでしょうか」|「{b}って、{c}と仲いいよね｜{b}は、{c}と仲がいいな｜{b}って、{c}と仲がいいですよね」――{a}は笑って言ったつもりだった。{b}は、{a}がそれを平気な顔で言えることの方に傷ついた。どうでもいいから、そんなふうに言えるんだ、と。'),
myes:L('{b}は目を丸くして、それから泣き笑いの顔になった。「……それ、こっちの台詞｜……それは、こちらの台詞だ｜……それ、こちらの台詞です」|{b}はしばらく黙っていた。「……私、ずっと片想いだと思ってた｜……私は、ずっと片想いだと思っていた｜……私、ずっと片想いだと思っていました」――二人は顔を見合わせて、同時に吹き出した。|{b}は{a}の手を握り返した。「先に言われた。……ずっと言おうとして、言えなかったのに｜先に言われたか。……ずっと言おうとして、言えなかったというのに｜先に言われました。……ずっと言おうとして、言えなかったんですけど」')
};
var PP={
child:L('村の老婆が、{b}の顔を見て息を呑んだ。「その子は……二十年前の祭りの晩に消えた、巫女の子じゃ」――{a}は、震える手で{b}の肩を抱いた。{b}を拾ったのは、この山のふもとだった。|{a}は、ずっと隠していたことを打ち明けた。「あなたを見つけたのは、この村の外れの祠の前だった。……あなたは、ここで生まれたんだ｜あなたを見つけたのは、この村の外れの祠の前だった。……あなたは、ここで生まれた｜あなたを見つけたのは、この村の外れの祠の前でした。……あなたは、ここで生まれたんです」'),
child_end:L('――村人たちの目の色が変わった。「御子さまが、お戻りになった」{b}は、今年の祭りの「器」に選ばれた。{a}は、{b}の前に立ちはだかった。「この子は渡さない｜＝｜この子は渡しません」|――{b}は呆然と{a}を見た。「……どうして、今まで黙ってたの｜……どうして、今まで黙っていた｜……どうして、今まで黙っていたんですか」{a}は答えられなかった。'),
parent:L('村人の一人が、{a}を指さして叫んだ。「お前……戻ってきたのか。祭りから逃げた、あの晩の娘っ子じゃろう」――{a}は、この村の出身だった。|{a}は観念したように言った。「……私は、この村で生まれた。祭りの夜に、一人で逃げたんだ。{b}を、ここにだけは連れてきたくなかった｜……私は、この村で生まれた。祭りの夜に、一人で逃げた。{b}を、ここにだけは連れてきたくなかった｜……私は、この村で生まれました。祭りの夜に、一人で逃げたんです。{b}を、ここにだけは連れてきたくなかったんです」'),
parent_end:L('――{a}は、村の禁忌を一つずつ{b}に話した。それは、何よりの手がかりだった。村人たちは、裏切り者を見る目で{a}を睨んだ。|――{b}は黙って{a}の手を握った。「……生まれた場所なんて、関係ない｜……生まれた場所など、関係ない｜……生まれた場所なんて、関係ありません」'),
betray:L('夜半、{a}は眠る{b}の枕元に座っていた。「ごめんね。……あなたは、最初から、この村に返すために育てたの｜すまない。……あなたは、最初から、この村に返すために育てたのだ｜ごめんなさい。……あなたは、最初から、この村に返すために育てたんです」――{a}が戸を開けると、村人たちが待っていた。|{a}は、{b}を「見せたいものがある｜＝｜見せたいものがあります」と神社の奥へ連れ出した。そこには、白い着物が用意されていた。「あなたは、この村の子なんだ。……返さなきゃいけない｜あなたは、この村の子なのだ。……返さなければならない｜あなたは、この村の子なんです。……返さなければいけません」'),
regret:L('{a}は、{b}が連れていかれた座敷牢の前で、膝をついた。「……やっぱり、できない｜……やはり、できない｜……やっぱり、できません」{a}は鍵を壊し、{b}の手を引いて走り出した。|{a}は自分のしたことに耐えられず、夜の村へ飛び出した。「返して！　あの子を返して！｜返してくれ！　あの子を返してくれ！｜返してください！　あの子を返してください！」')
};
var BT={
sell:L('{a}は、村の長老の家を一人で訪ねた。「{b}の居場所を教える。だから、私だけは見逃して｜{b}の居場所を教える。だから、私だけは見逃してくれ｜{b}の居場所を教えます。だから、私だけは見逃してください」――長老は、満足げに頷いた。|{a}は震える声で村人に告げた。「生贄なら、{b}がいい。あいつは、村の秘密を嗅ぎ回ってる｜生贄なら、{b}がいい。あいつは、村の秘密を嗅ぎ回っている｜生贄なら、{b}がいいです。あの人は、村の秘密を嗅ぎ回っています」'),
sold:L('その夜、{b}の部屋に村人たちが押し入った。{b}は、なぜ居場所が知られていたのか分からないまま、連れ去られた。'),
run:L('{a}は、皆が眠っている隙に、一つしかない懐中電灯と地図を持ち出した。そして、一人で村を出た。|{a}は、{b}と二人で見つけた抜け道を、誰にも言わずに一人で使った。'),
found:L('{c}は、{a}が村の長老の家から出てくるのを見てしまった。「……あなたが、売ったの？｜……あなたが、売ったのか｜……あなたが、売ったんですか」|{c}は、{a}の荷物から村人の渡したお守りを見つけた。「これ、何。……村と取引したの？｜これは何だ。……村と取引したのか？｜これ、何ですか。……村と取引したんですか？」'),
cast:L('一行は、{a}を民宿から締め出した。「二度と戻ってこないで｜二度と戻ってくるな｜二度と戻ってこないでください」――{a}は、一人で夜の村に立ち尽くした。|一行は、{a}を土蔵に閉じ込めた。{a}は扉を叩き続けたが、誰も開けなかった。')
};
function rk(a,b){return a.i<b.i?a.i+'-'+b.i:b.i+'-'+a.i;}
function bond(S,a,b){return JS.REL?JS.REL.bond(S,a,b):0;}
function ties(S,a,b){return(S.ties||[]).filter(function(t){return(t.a===a.i&&t.b===b.i)||(t.a===b.i&&t.b===a.i);});}
function has(S,a,b,list){return ties(S,a,b).some(function(t){return list.split(',').indexOf(t.type)>=0;});}
function mutual(S,a,b){return!!(JS.REL&&JS.REL.mutual&&JS.REL.mutual(S,a,b));}
function live(S){return S.P.filter(function(p){return JS.alive(p)&& !p.bound;});}
function setRel(S,a,b,d,lab,from){
S.relD=S.relD||{};S.relLab=S.relLab||{};S.relDir=S.relDir||{};
var k=rk(a,b);
S.relD[k]=clamp((S.relD[k]||0)+d,-1,1);if(lab)S.relLab[k]=lab;
if(from)S.relDir[k]=from.i;else delete S.relDir[k];
}
function edge(S,a,b,lab,cls,from){
if(!a|| !b||a.i==null||b.i==null||a===b)return;
S.evEdges=S.evEdges||[];
S.evEdges.push({a:a.i,b:b.i,label:lab,cls:cls,dir:from?from.i:null});
}
function tick(S,L0,h){
var rng=S.rng,P=live(S);
if(P.length<2)return;
pparent(S,P,h);
betrayal(S,P,h);
P=live(S);
if(P.length<2||rng()>0.4)return;
var opts=[],lastDead=S.P.filter(function(p){return!p.alive&&p.i!=null;}).pop();
P.forEach(function(a){
P.forEach(function(b){
if(a===b)return;
var w=bond(S,a,b);
if(a.i<b.i){
if(w< -0.1){opts.push([a,b,'quarrel',0.5]);opts.push([a,b,'makeup',0.2+a.tr.np*0.3+(S.found.length>=3?0.3:0)]);}
else{opts.push([a,b,'talk',0.4+a.tr.np*0.3+b.tr.np*0.3]);opts.push([a,b,'team',0.35]);}
if(lastDead&&bond(S,a,lastDead)>=0.3&&bond(S,b,lastDead)>=0.3)opts.push([a,b,'shared',1]);
if(mutual(S,a,b))opts.push([a,b,'mutual',0.6]);
}
if(w>= -0.1&&b.m.fear>55)opts.push([a,b,'protect',0.3+a.tr.np*0.5]);
if(w>=0.3&& !has(S,a,b,'lover,mate,fated')&& !(HK.Avoid&&HK.Avoid.of(S,a,b))&& !S.ties.some(function(t){return((t.a===a.i&&t.b===b.i)||(t.a===b.i&&t.b===a.i))&&HK.tieNoLove(t);})&&(!HK.canLove||HK.canLove(a,b))&&(!HK.Poly||HK.Poly.storyCan(S,a,b))&& !S.dConfess)opts.push([a,b,'confess',0.25+a.tr.fc*0.4+w*0.4+(mutual(S,a,b)?0.2:0)]);
if(a.tr.a>0.5&&(b.traitor||b.plot||b.sold))opts.push([a,b,'distrust',0.6]);
if(S.ties.some(function(t){return t.type==='crush'&&t.a===a.i&&t.b===b.i;})&& !(has(S,a,b,'lover,mate,fated')&&S.ties.some(function(t){return t.type==='crush'&&t.a===b.i&&t.b===a.i;}))){var c=P.filter(function(q){return q!==a&&q!==b&&bond(S,b,q)>0.4;})[0];if(c)opts.push([a,b,mutual(S,a,b)?'mjealous':'jealous',0.5,c]);}
});
});
if(!opts.length)return;
var o=HK.weighted(rng,opts,function(x){return x[3];}),a=o[0],b=o[1],k=o[2];
var m={a:a.name,b:b.name,c:o[4]?o[4].name:'',v:lastDead?lastDead.name:''},t=F(ST.pick(S,T[k]),m),why='';
if(k==='talk'){setRel(S,a,b,0.15,'打ち解けた');why='眠れない夜に、距離が縮まった';}
if(k==='protect'){setRel(S,a,b,0.2,'信頼',a);b.m.fear=clamp(b.m.fear-12,0,100);why=a.name+'は怯える'+b.name+'を放っておけなかった（NP）';}
if(k==='team'){setRel(S,a,b,0.15,'相棒');why='二人で調べるうちに、息が合ってきた';}
if(k==='shared'){setRel(S,a,b,0.2,'支え合う');why='同じ人を失った者どうし';}
if(k==='quarrel'){setRel(S,a,b,-0.15,'険悪');S.hostile=clamp(S.hostile+3,0,100);why='恐怖が、二人の仲をこじらせた（村人に隙を見せた）';}
if(k==='makeup'){setRel(S,a,b,0.3,'和解');why='命がかかって、意地を張るのをやめた';}
if(k==='distrust'){setRel(S,a,b,-0.2,'不信',a);why=a.name+'の観察眼が、'+b.name+'の綻びを捉えた';}
if(k==='mutual')why='両片想い：お互いに想っているのに、どちらも相手は自分を何とも思っていないと思い込んでいる';
if(k==='mjealous'){setRel(S,a,o[4],-0.1,'嫉妬',a);why='両片想い：'+a.name+'は、'+b.name+'が'+o[4].name+'を好きなのだと勘違いした（本当は'+b.name+'も'+a.name+'を想っている）';}
if(k==='jealous'){setRel(S,a,o[4],-0.15,'嫉妬',a);why=a.name+'は'+b.name+'に片想いしている';}
if(k==='confess'){
S.dConfess=true;
var mu=mutual(S,a,b),yes=mu||rng()<0.25+bond(S,b,a)*0.5+b.tr.warmth*0.2;
t+=F(ST.pick(S,mu?T.myes:yes?T.yes:T.no),m);
if(mu){S.ties.push({a:a.i,b:b.i,type:'lover',born:true});setRel(S,a,b,0.2,'恋人');a.m.fear=clamp(a.m.fear-15,0,100);b.m.fear=clamp(b.m.fear-15,0,100);why='この村で、両片想いがようやく通じた（どちらも、自分の片想いだと思っていた。恐怖がやわらぐ）';}
else if(yes){S.ties.push({a:a.i,b:b.i,type:'lover',born:true});setRel(S,a,b,0.2,'恋人');a.m.fear=clamp(a.m.fear-15,0,100);b.m.fear=clamp(b.m.fear-15,0,100);why='この村で、恋が実った（恐怖がやわらぐ）';}
else{S.ties.push({a:a.i,b:b.i,type:'crush',born:true});setRel(S,a,b,-0.05,'片想い',a);why='想いは届かなかった';}
var o2=ST.say(S,{actors:[a,b],tag:'想いを告げる',kind:'climax',text:t,why:why,mag:32});ST.key(S,o2,a.name+'が'+b.name+'に告白');
return;
}
ST.sayB(S,{actors:o[4]?[a,b,o[4]]:[a,b],tag:'関係',text:t,why:why+'（'+a.name+'×'+b.name+'）'},a.name+'と'+b.name);
}
function pparent(S,P,h){
var rng=S.rng;
if(S.ppDone||h<6||rng()>0.14)return;
var t=S.ties.filter(function(x){return x.type==='pparent';}).filter(function(x){var a=S.P[x.a],b=S.P[x.b];return a&&b&&JS.alive(a)&&JS.alive(b)&& !a.bound&& !b.bound;})[0];
if(!t)return;
S.ppDone=true;
var a=S.P[t.a],b=S.P[t.b],m={a:a.name,b:b.name};
var w={child:1,parent:0.8,betray:a.tr.cold*1.2+(1-a.tr.warmth)*0.4-0.3};
var k=HK.weighted(rng,Object.keys(w),function(x){return Math.max(0.05,w[x]);}),o;
if(k==='child'){
b.villager=true;setRel(S,a,b,0.25,'守る',a);edge(S,a,b,'村から守る','guard',a);
o=ST.say(S,{actors:[a,b],tag:'出自',kind:'climax',text:F(ST.pick(S,PP.child),m)+F(ST.pick(S,PP.child_end),m),why:'疑似親子の秘密：'+b.name+'は、実はこの村で生まれた子だった（生贄に選ばれやすくなる。'+a.name+'はかばいやすくなる）',mag:46});
}else if(k==='parent'){
a.villager=true;S.hostile=clamp(S.hostile+10,0,100);
var gi=S.G.clues.map(function(c,i){return i;}).filter(function(i){return S.found.indexOf(i)<0;})[0],ex='';
if(gi!=null){S.found.push(gi);a.cnt.clue++;ex='――'+S.G.clues[gi].t+'。';}
setRel(S,a,b,0.2,'秘密を明かした',a);
o=ST.say(S,{actors:[a,b],tag:'出自',kind:'climax',text:F(ST.pick(S,PP.parent),m)+F(ST.pick(S,PP.parent_end),m)+ex,why:'疑似親子の秘密：親代わりの'+a.name+'は、この村から逃げた人だった（手がかり +1・村人の敵意 +10）',mag:46});
}else{
b.taken=true;b.takenAt=h;setRel(S,a,b,-0.6,'裏切り',a);edge(S,a,b,'村に返した','enemy',a);a.traitor=true;
o=ST.say(S,{actors:[a,b],tag:'裏切り',kind:'climax',text:F(ST.pick(S,PP.betray),m),why:'疑似親子の秘密：'+a.name+'は、'+b.name+'を村に返すために育てていた（ドライさ・温かさの低さ）。'+b.name+'は連れ去られた',mag:50});
S.ppRegret={a:a,b:b,h:h};
}
ST.key(S,o,'疑似親子の秘密');
}
function betrayal(S,P,h){
var rng=S.rng;
if(S.ppRegret&&h-S.ppRegret.h>=4&&rng()<0.3){
var R=S.ppRegret;S.ppRegret=null;
if(JS.alive(R.a)&&R.b.alive&&R.b.taken&&R.a.tr.np+R.a.tr.warmth>0.6){
R.b.taken=false;setRel(S,R.a,R.b,0.5,'後悔と和解',R.a);edge(S,R.a,R.b,'取り返した','guard',R.a);
ST.say(S,{actors:[R.a,R.b],tag:'後悔',kind:'climax',text:F(ST.pick(S,PP.regret),{a:R.a.name,b:R.b.name}),why:R.a.name+'は、育てた情に勝てなかった（NP・温かさ）',mag:44});
}
}
S.P.forEach(function(a){
if(!a.sold||a.castOut|| !JS.alive(a))return;
var seer=P.filter(function(c){return c!==a&&JS.skill(c,'obs')>0.45;})[0];
if(!seer||rng()>0.25)return;
a.castOut=true;a.action=JS.ACTIONS.filter(function(x){return x.id==='alone';})[0]||a.action;
P.forEach(function(c){if(c!==a)setRel(S,c,a,-0.4,'裏切り者',c);});
edge(S,seer,a,'告発','enemy',seer);
var o=ST.say(S,{actors:[seer,a],tag:'発覚',kind:'climax',text:F(ST.pick(S,BT.found),{a:a.name,c:seer.name})+F(ST.pick(S,BT.cast),{a:a.name}),why:a.name+'の裏切りが、'+seer.name+'にばれた（観察）。'+a.name+'は一行から締め出され、一人で動くしかなくなった',mag:42});
ST.key(S,o,a.name+'の裏切りが露見');
});
if(S.betrays>=2||h<8||rng()>0.06)return;
var cand=P.filter(function(a){return!a.sold&&a.tr.cold*0.6+(1-a.tr.warmth)*0.4+a.m.fear/200+(a.goal.id==='escape'?0.2:0)>0.85;});
if(!cand.length)return;
var a=HK.weighted(rng,cand,function(x){return x.tr.cold+x.m.fear/100;});
var vs=P.filter(function(b){return b!==a&&bond(S,a,b)<0.5;});
if(!vs.length)return;
var b=HK.weighted(rng,vs,function(x){return 1+Math.max(0,-bond(S,a,x))*2+x.cnt.clue*0.5;});
S.betrays=(S.betrays||0)+1;
if(rng()<0.6){
a.sold=true;b.taken=true;b.takenAt=h;S.hostile=clamp(S.hostile-5,0,100);
setRel(S,a,b,-0.5,'裏切り',a);edge(S,a,b,'村に売った','enemy',a);
var o=ST.say(S,{actors:[a,b],tag:'裏切り',kind:'climax',text:F(ST.pick(S,BT.sell),{a:a.name,b:b.name})+F(ST.pick(S,BT.sold),{a:a.name,b:b.name}),why:a.name+'は自分だけ助かるために、'+b.name+'を村に売った（ドライさ・温かさの低さ・恐怖 '+Math.round(a.m.fear)+'）',mag:46});
ST.key(S,o,a.name+'が'+b.name+'を売った');
}else{
a.out=true;a.esc=h-1+rng()*2;a.fate='仲間を見捨てて一人で脱出（'+JS.hm(a.esc)+'）';
P.forEach(function(c){if(c!==a)setRel(S,c,a,-0.3,'見捨てられた',c);});
edge(S,a,b,'見捨てた','enemy',a);
var o2=ST.say(S,{actors:[a,b],tag:'裏切り',kind:'climax',text:F(ST.pick(S,BT.run),{a:a.name,b:b.name})+'――翌朝、'+a.name+'の布団は空っぽだった。',why:a.name+'は、仲間を見捨てて一人で逃げた（ドライさ・恐怖）',mag:44});
ST.key(S,o2,a.name+'が一人で逃げた');
}
}
function relmap(S){
var P=S.P,edges=[];
var CLS={lover:'love',sibbad:'enemy',bad:'enemy',mate:'love',fated:'love',almost:'love',fwb:'night',crush:'pine',enemy:'enemy',rival:'enemy',ex:'obsess',buddy:'partner',best:'friend',friend:'friend',childhood:'friend',sibling:'guard',sibprot:'guard',sibclose:'guard',parent:'guard',pparent:'guard',master:'partner',mentor:'partner',teacher:'partner',senpai:'friend',colleague:'friend',classmate:'friend',boss:'partner',benefactor:'guard',relative:'guard',worship:'guard',fond:'friend',blind:'guard',acq:'none'};
(S.ties||[]).forEach(function(t){
if(t.type==='crush'&&(S.ties||[]).some(function(u){return u.type==='crush'&&u.a===t.b&&u.b===t.a;})){if(t.a<t.b)edges.push({a:t.a,b:t.b,label:(t.born?'★':'')+'両片想い',cls:'pine',dir:null});return;}
var lab=HK.tieLabel?HK.tieLabel(t):HK.TIES&&HK.TIES[t.type]?HK.TIES[t.type].label:t.type;edges.push({a:t.a,b:t.b,label:(t.born?'★':'')+lab,cls:CLS[t.type]||'friend',dir:t.type==='crush'||(HK.TIES&&HK.TIES[t.type]&&HK.TIES[t.type].dir)?t.a:null});});
Object.keys(S.relLab||{}).forEach(function(k){
var ab=k.split('-'),lab=S.relLab[k];
if(lab==='恋人'||lab==='片想い')return;
var cls= /険悪|裏切|見捨て/.test(lab)?'enemy': /不信|嫉妬/.test(lab)?'obsess': /信頼|支え合う|和解|守る|秘密/.test(lab)?'guard': /相棒/.test(lab)?'partner':'friend';
edges.push({a: +ab[0],b: +ab[1],label:'★'+lab,cls:cls,dir:S.relDir&&S.relDir[k]!=null?S.relDir[k]:null});
});
(S.evEdges||[]).forEach(function(e){edges.push({a:e.a,b:e.b,label:'★'+e.label,cls:e.cls,dir:e.dir});});
return{
nodes:P.map(function(p){return{i:p.i,name:p.name,sub:(JS.JOB[p.job]||{}).label+(p.plot?'・企み':'')+(p.villager?'・村の出':''),dead: !p.alive,fate:p.fate};}),
edges:edges,note:'★は村で生まれた・変わった関係と出来事。矢印は気持ちや行為の向き。'
};
}
JS.DRAMA={tick:tick,edge:edge,relmap:relmap,setRel:setRel};
})();
});
;
/* ==== js/jashin.js ==== */
HK.Load.def(335,'js/jashin.js',function(){
(function(){
'use strict';
var HK=window.HK,ST=HK.Story,JS=HK.JASHIN,clamp=HK.clamp,M=JS&&JS.MORE;
if(!ST|| !JS|| !JS.GODS|| !M)return;
function L(s){return s.split('|');}
var scen={
id:'jashin',name:'邪神村RTA',kicker:'ホラー・脱出（1〜6人）',solo:true,maxCast:6,minCast:1,
desc:'地図にない山奥の村に迷い込んだ住人たち。村には得体の知れない神が祀られ、祭りの夜が近づいている。神の正体を示す手がかりを集め、対抗策を突き止めて、生きて村を出られるか。何時間で脱出できたかを記録する。',
note:'※ホラー表現（死・失踪）を含みます。登場人物はすべて成人として扱います。',
unit:'時間',simulate:function(input){return run(input);},
castHint:'1〜6人で挑みます（多すぎると雰囲気が出ないため6人まで）。「職業」で、手がかりの見つけやすさや、できることが変わります。「目標」（恋人を作る・借金返済のために盗む・誰かを殺す・村の儀式を乗っ取る・儀式で別の神を呼ぶ・事件を解決する など）と職業の組み合わせで、振る舞いや手口が変わります。おまかせなら気質と職業から抽選し、探偵はほとんど「事件を解決する」になります。仲間の失踪や死で緊迫感が高まると、生きて帰りたい人は自分の目標より脱出や村の秘密を優先します。',
env:[
{id:'god',label:'祀られている神',type:'select',def:'random',options:[{v:'random',label:'おまかせ'},{v:'myth',label:'おまかせ（神話の神から）'},{v:'local',label:'おまかせ（村だけの神から）'}].concat(JS.GODS.map(function(g){return{v:g.id,label:g.name};}))},
{id:'hours',label:'儀式までの時間',min:12,max:72,def:36,lo:'半日',hi:'三日',unit:'時間'},
{id:'hostile',label:'村人の敵意',min:0,max:100,def:50,lo:'表向きは親切',hi:'隠す気がない'},
{id:'ev',label:'怪異の頻度',min:0,max:100,def:55,lo:'じわじわ',hi:'次から次へ'},
{id:'romance',label:'恋愛の起こりやすさ',min:0,max:100,def:50,lo:'起きない',hi:'起きやすい',desc:'一行どうしの恋の気配・告白・恋人の場面の起こりやすさ。0にすると恋愛の交流を出しません'},
{id:'npc',label:'記者と警察官',type:'select',def:'random',options:[{v:'random',label:'おまかせ'},{v:'both',label:'両方いる'},{v:'reporter',label:'記者だけ'},{v:'police',label:'警察官だけ'},{v:'none',label:'どちらもいない'}]},
{id:'amnesia',label:'記憶を失っている人',min:0,max:50,def:8,lo:'いない',hi:'二人に一人',unit:'％',desc:'一人ずつ、この確率で記憶を失ったまま参加する'},
{id:'tour',label:'シークレットツアー',type:'select',def:'random',options:[{v:'random',label:'おまかせ（約10％）'},{v:'yes',label:'ツアーにする'},{v:'no',label:'ツアーにしない'}]}
].concat(HK.Unlike&&HK.Unlike.ENV?[Object.assign({},HK.Unlike.ENV)]:[]),
stats:[
{id:'luck',label:'運',desc:'襲われたときに助かる確率、霧の中で道を見つける確率に効く'},
{id:'stamina',label:'体力',desc:'襲われたときの抵抗、走って逃げる力、怪我への強さに効く'}
],
perFields:[{id:'job',label:'職業',auto:'おまかせ（気質から）',options:JS.JOBS.map(function(j){return{id:j.id,label:j.label};})}],
actions:JS.ACTIONS,goals:JS.GOALS,events:[]
};
HK.SCENARIOS.jashin=scen;
var at=HK.SCEN_ORDER.indexOf('zombie');
if(HK.SCEN_ORDER.indexOf('jashin')<0)HK.SCEN_ORDER.splice(at>=0?at+1:HK.SCEN_ORDER.length,0,'jashin');
function names(l){return l.map(function(p){return p.name;}).join('・');}
function jobOf(p){return JS.JOB[p.job]||JS.JOB.civ;}
function has(p,list){return list.split(',').indexOf(p.job)>=0;}
function skill(p,type){
var t=p.tr,j=jobOf(p).sk||{},base={
obs:t.a*0.45+t.caution*0.35,lore:t.a*0.5+t.cold*0.1,talk:t.warmth*0.45+t.np*0.2+t.fc*0.15,
spirit:t.ac*0.15+t.np*0.1,explore:t.impulse*0.3+t.fc*0.25+p.stats.stamina*0.04,fight:t.cp*0.2+t.aggr*0.2+p.stats.stamina*0.06,rite:t.a*0.15+t.cp*0.1
}[type]||0;
var adj=0;
if(p.amn&& !p.amn.back)adj+=type==='lore'? -0.15:type==='spirit'?0.15:0;
if(p.villager&&type==='talk')adj+=0.3;
if(p.rivalBoost&&(type==='obs'||type==='lore'||type==='explore'))adj+=0.08;
if(p.magic)adj+=type==='rite'?0.35:type==='lore'?0.15:0;
if(p.hj&&type==='rite')adj+=p.hj.pow;
if(p.job==='muno'&&type!=='fight')return clamp((base+adj)*0.08,0,0.1);
return clamp(base+(j[type]||0)+adj-p.m.fear/400,0,1.2);
}
function resolve(S,p,list,pick,bias){
if(pick&&pick!=='auto')for(var i=0;i<list.length;i++)if(list[i].id===pick)return list[i];
return HK.weighted(S.rng,list,function(o){return Math.pow(Math.max(0.03,o.fit(p.tr)),3)*(o.jobs&&has(p,o.jobs)?bias:1)*(o.rare||1);});
}
var loopTag='';
function label(h){var t=16+h,d=Math.floor(t/24)+1,hh=t%24;return loopTag+d+'日目 '+hh+':00（'+h+'時間経過）';}
function night(h){var hh=(16+h)%24;return hh>=19||hh<5;}
function hm(h){return Math.floor(h)+'時間'+(Math.round((h%1)*60)?Math.round((h%1)*60)+'分':'');}
function alive(p){return p.alive&& !p.out&& !p.taken;}
function run(input){
var S=ST.state(input,'jashin'),rng=S.rng,env=S.env,P=S.P;
S.egoNotes=true;S.bondFn=function(S0,a,b){return JS.REL?JS.REL.bond(S0,a,b):0;};
loopTag='';
var pool=env.god==='myth'?JS.GODS.filter(function(g){return g.myth;}):env.god==='local'?JS.GODS.filter(function(g){return!g.myth;}):JS.GODS;
var G=JS.GOD[env.god]||rng.pick(pool),V=rng.pick(JS.VILLAGES);
S.G=G;S.V=V;S.found=[];S.fake=0;S.deadline=env.hours;S.hostile=env.hostile;S.solved=false;S.partial=false;S.hold=0;S.shrine=0;
var tour=env.tour==='yes'||(env.tour==='random'&&rng()<0.1),tourT=rng.pick(JS.TOURS);
var npcs=env.npc==='random'?rng.pick(['both','reporter','police','none','both','reporter']):env.npc;
S.reporter=npcs==='both'||npcs==='reporter'?{alive:true,met:0}:null;
S.police=npcs==='both'||npcs==='police'?{alive:true,n:0}:null;
P.forEach(function(p){
var pc=(input.perChar&&input.perChar[p.i])||{};
var jp=(pc.pick||{}).job;
var legacyMage=jp==='mage';if(legacyMage)jp='occult';
p.job=JS.JOB[jp]?jp:HK.weighted(rng,JS.JOBS.filter(function(j){return!j.minor&&JS.JOB_FIT[j.id];}),function(j){return Math.pow(Math.max(0.05,JS.JOB_FIT[j.id](p.tr)),2.5);}).id;
p.minor=(JS.JOB[p.job]&&JS.JOB[p.job].minor)||'';
p.jobAuto= !JS.JOB[jp];
p.action=resolve(S,p,JS.ACTIONS,pc.action,2.2);p.goal=resolve(S,p,JS.GOALS,pc.goal,2.2);
var gAuto= !pc.goal||pc.goal==='auto';
if(gAuto&&legacyMage)p.goal=JS.GOAL[rng()<0.6?'ritual':'meet'];
if(p.minor==='child'&&p.goal&&p.goal.id==='love')p.goal=JS.GOAL.escape||p.goal;
else if(gAuto&& /^(detective|sleuth|ponkotsu)$/.test(p.job)&&rng()<0.85)p.goal=JS.GOAL.solve;
p.goal0=p.goal;p.surv=p.goal.surv!=null?p.goal.surv:1;
p.magic=p.goal.id==='ritual'||p.goal.id==='hijack'||(p.goal.id==='meet'&& /^(occult|psychic|priest)$/.test(p.job));
p.reason=tour?tourT:HK.weighted(rng,JS.REASONS,function(r){return Math.pow(Math.max(0.05,r.fit(p.tr)),2)*(r.jobs.indexOf(p.job)>=0?4:1);}).t;
p.alive=true;p.out=false;p.taken=false;p.esc=null;p.foresee= !!jobOf(p).foresee;
p.m={fear:8+p.tr.ac*12,hp:55+p.stats.stamina*9,clue:0};
p.cnt={clue:0,scare:0,attack:0,trap:0};
p.roleLabel=jobOf(p).label;
p.viol=0;p.bound=false;p.prank=false;
});
setupPlus(S);
JS.REL.setup(S,input);
if(JS.SPEC)JS.SPEC.setup(S,input);
if(JS.DUO)JS.DUO.setup(S);
if(JS.JOBEV)JS.JOBEV.setup(S);
var keys=['fear','hp','clue'];
ST.step(S,'到着　'+label(0));
ST.say(S,{kind:'phase',text:(tour?'一行は、'+tourT+'の参加者だった。マイクロバスが止まった先は――':'')+'山道の先に、地図にない村があった。'+V+'。'+ST.fmt(ST.pick(S,JS.WELCOME),{v:V})+(HK.Attr&&HK.Attr.raceIntro?HK.Attr.raceIntro(P,'alert',S):'')});
P.forEach(function(p){
if(p.amn)return JS.REL.amnArrive(S,p);
ST.say(S,{actors:[p],tag:'来た理由',text:p.name+'（'+jobOf(p).label+(p.spec?'・'+HK.Special.LABEL[p.spec]:'')+'）がこの村に来たのは――'+p.reason+'。最初は「'+p.action.label+'」'+(p.goal.secret?'。目標は、誰にも話さなかった。':'、目標は「'+p.goal.label+'」。'),why:(p.goal.secret?'本当の目標「'+p.goal.label+'」（周りには隠している）。':'')+(tour?'シークレットツアー（全員が同じ理由）':'理由は気質と職業から抽選')+'／職業：'+jobOf(p).label+(p.jobAuto?'（気質から）':'')+'・'+jobOf(p).desc});
});
ST.say(S,{kind:'phase',tag:'村の様子',text:G.look+'村人たちは、祀っている神を「'+G.call+'」と呼んでいた。'+(S.ygo?ST.pick(S,M.YGO_START):'')});
arrivePlus(S);
if(JS.LOOP)JS.LOOP.arrive(S);
if(JS.GOALX)JS.GOALX.arrive(S);
if(JS.UNPC)JS.UNPC.arrive(S);
JS.REL.arrive(S);
if(S.reporter)ST.say(S,{tag:'記者',text:'民宿には先客がいた。'+JS.REPORTER.name+'だと名乗る男は、一行を見るなり嬉しそうに手帳を開いた。「いやあ、仲間がいて心強い。この村のことなら、何でも聞いてください」',why:'混乱要素：この記者は偽の情報を持ち込む'});
if(S.police)ST.say(S,{tag:'警察官',text:'村の駐在所から、制服の警察官が出てきた。「よそ者の方ですね。祭りの間は、私の指示に従ってもらいます」',why:'混乱要素：場を仕切りたがる警察官'});
if(JS.R18&&JS.R18.on(S))JS.R18.arrive(S);
ST.snap(S,keys);
var h=0,end=null;
for(;;){
while(!end){
h+=2;
S.h=h;
if(JS.SPEC)JS.SPEC.revive(S);
var live=P.filter(alive);
if(!live.length){end='none';break;}
if(h>=S.deadline){end='ritual';break;}
ST.step(S,label(h));
ST.budget(S,3+Math.ceil(live.length/2));
if(rng()<0.4)ST.say(S,{kind:'phase',text:ST.fmt(ST.pick(S,night(h)?JS.ATMOS.night:JS.ATMOS.day),{v:V})});
live.forEach(function(p){tickCurse(S,p,h);});
var free0=live.filter(function(q){return alive(q)&& !q.bound;});
if(free0.length)npcTurn(S,free0,h);
tickPlus(S,P.filter(alive),h);
JS.REL.tick(S,P.filter(alive),h);
if(JS.DUO)JS.DUO.tick(S,P.filter(alive),h);
if(JS.GOALX)JS.GOALX.tick(S,P.filter(alive),h);
if(JS.GODEV)JS.GODEV.tick(S,P.filter(alive),h);
if(JS.LOOP)JS.LOOP.tick(S,P.filter(alive),h);
if(JS.FEAST)JS.FEAST.tick(S,P.filter(function(q){return alive(q)&& !q.bound;}),h);
if(JS.JOBEV)JS.JOBEV.tick(S,P.filter(alive),h);
live=P.filter(alive);
live.forEach(function(p){
if(!alive(p)||p.bound)return;
if(JS.SPEC&&JS.SPEC.mad(p)){
var dg=JS.SPEC.danger(p);
if(rng()<trapRate(S,p,h)*dg*HK.Dark.f(S,'kill'))return trap(S,p,P.filter(alive),false);
if(rng()<(S.hostile/100)*(night(h)?0.16:0.05)*dg*(S.shrineRage?1.8:1)*HK.Dark.f(S,'raid'))return attack(S,p,live);
return JS.SPEC.act(S,p);
}
if(JS.SPEC&&JS.SPEC.act(S,p))return;
if(JS.R18&&JS.R18.on(S)&&night(h)&&JS.R18.night(S,p,P.filter(alive),h))return;
if(JS.MUNO&&JS.MUNO.act(S,p,h,P.filter(alive)))return;
var evp=env.ev/100;
var r=rng();
if(rng()<trapRate(S,p,h)*HK.Dark.f(S,'kill'))return trap(S,p,P.filter(alive),false);
if(r<evp*0.25)return S.FX&&rng()<0.5?godHorror(S,p):scare(S,p);
if(r<evp*0.25+0.05&& !S.shrine&&(p.goal.id==='deny'||p.prank||p.tr.impulse>0.6||p.goal.id==='content'||rng()<0.15))return shrine(S,p);
if(night(h)&&rng()<(S.hostile/100)*0.16*(p.action.id==='alone'||p.goal.id==='content'?1.8:1)*(S.shrineRage?1.8:1)*HK.Dark.f(S,'raid'))return attack(S,p,live);
if((p.goal.id==='escape'||p.m.fear>80)&&rng()<0.12)return escape(S,p,h);
if(JS.GOALX&&JS.GOALX.act(S,p,h,P.filter(alive)))return;
if(JS.MAGE&&JS.MAGE.act(S,p,h,P.filter(alive)))return;
if(S.hold>0&&rng()<0.7)return ST.sayB(S,{actors:[p],text:p.name+'は公民館で待機させられていた。窓の外を、村人が何度も通り過ぎた。',why:'警察官の指示で待機'},p.name+'は待機');
if(JS.JOBEV&&JS.JOBEV.act(S,p,h,P.filter(alive)))return;
investigate(S,p,h);
});
if(S.hold>0)S.hold--;
if(S.forceEnd){end='forced';break;}
ST.flushShort(S,'ほかに：');
if(!S.solved&&S.found.length>=G.clues.length)solve(S,false);
else if(!S.solved&&S.found.length>=G.clues.length-1&&S.deadline-h<=8){
var wise=P.filter(function(q){return alive(q)&& !q.bound;}).sort(function(a,b){return skill(b,'lore')-skill(a,'lore');})[0];
if(wise&&rng()<skill(wise,'lore')*0.9)solve(S,true,wise);
}
if(!S.solved&&S.found.length>=G.clues.length-2&&S.deadline-h<=16){
var sl=P.filter(function(q){return alive(q)&& !q.bound&&q.job==='sleuth';})[0];
if(sl&&rng()<0.22+skill(sl,'obs')*0.15){ST.say(S,{actors:[sl],tag:'推理',text:ST.fmt(ST.pick(S,JS.RELT.SLEUTH_INFER),{a:sl.name}),why:'名探偵は、手がかりが二つ足りなくても推理で埋められる',mag:20});solve(S,true,sl);}
}
P.forEach(function(p){if(alive(p)){p.m.fear=clamp(p.m.fear+(night(h)?3:1),0,100);p.m.clue=p.cnt.clue;}});
if(JS.SPEC)JS.SPEC.wear(S,P.filter(alive));
ST.snap(S,keys);
if(S.solved){end='climax';break;}
}
if(S.alien&&(end==='climax'||end==='ritual'))JS.LOOP.alienEnd(S,end==='ritual'?S.deadline:h);
else if(end==='climax')climax(S,h);
else if(end==='ritual')ritual(S,S.deadline);
if(S.rewind&&JS.LOOP&&JS.LOOP.restart(S)){h=0;end=null;loopTag='二周目 ';continue;}
break;
}
if(JS.SPEC)JS.SPEC.revive(S);
if(JS.GODEV)JS.GODEV.end(S,end);
if(JS.UNPC)JS.UNPC.end(S,end);
P.forEach(function(p){if(p.goal0)p.goal=p.goal0;});
return finish(S,input);
}
var TYPE_JP={obs:'観察',lore:'知識',talk:'聞き込み',spirit:'霊感',explore:'探索'};
var FIND_LEAD={
obs:L('{a}は、ふと気づいた。|{a}の目が、ある一点で止まった。|{a}は手帳をめくりながら、違和感の正体に気づいた。'),
lore:L('{a}は古い記録を読み解いた。|{a}は碑文の崩れた文字を、指でなぞりながら読んだ。|{a}は記憶の中の文献と、目の前のものを照らし合わせた。'),
talk:L('{a}が話しかけると、村の子どもがこっそり教えてくれた。|{a}は民宿の女将と世間話をするうちに、聞き出した。|{a}に心を許した村の若者が、声をひそめて言った。'),
spirit:L('{a}の背筋に冷たいものが走った。|{a}は目を閉じ、気配を探った。|{a}にだけ、それが見えた。'),
explore:L('{a}は立ち入りを禁じられた道に、こっそり踏み込んだ。|{a}は夜明け前の村を、一人で歩き回った。|{a}は神社の裏手の藪をかき分けた。')
};
function investigate(S,p,h){
var rng=S.rng,G=S.G;
var left=G.clues.filter(function(c,k){return S.found.indexOf(k)<0;});
if(!left.length)return;
var c=HK.weighted(rng,left,function(x){return 0.3+skill(p,x.type)+(x.type===p.action.type?0.5:0);});
var nAll=S.P.length,sk=skill(p,c.type),ch=(0.07+sk*0.42)*(1.5-nAll*0.13)+(p.goal.id==='truth'?0.08:0)+(night(h)&&c.type==='spirit'?0.08:0);
if(rng()<ch){
var k=G.clues.indexOf(c);
S.found.push(k);p.cnt.clue++;
if(c.type==='spirit')p.m.fear=clamp(p.m.fear+8,0,100);
var o=ST.say(S,{actors:[p],tag:'手がかり '+S.found.length+'/'+G.clues.length,text:ST.fmt(ST.pick(S,FIND_LEAD[c.type]),{a:p.name})+c.t+'。',why:TYPE_JP[c.type]+'の手がかり（'+p.name+'の'+TYPE_JP[c.type]+'の力 '+Math.round(sk*100)+(jobOf(p).sk&&jobOf(p).sk[c.type]?'・職業の補正あり':'')+'）',mag:18});
if(S.found.length===1)ST.key(S,o,'最初の手がかり');
return;
}
p.m.fear=clamp(p.m.fear+(c.type==='explore'?4:2),0,100);
ST.sayB(S,{actors:[p],text:p.name+'は'+{obs:'村の様子をうかがった',lore:'古い記録を探した',talk:'村人に話を聞こうとした',spirit:'気配を探った',explore:'村を歩き回った'}[p.action.type]+ST.pick(S,L('が、何も分からなかった。|が、村人にはぐらかされた。|が、肝心なところで誰かの視線に気づいて引き返した。|。何かがおかしい気はするのに、言葉にできなかった。')),why:''},p.name+'は空振り');
}
function scare(S,p){
p.cnt.scare++;
p.m.fear=clamp(p.m.fear+(p.prank?4:10)+(p.job==='psychic'?6:0)-p.tr.cp*4,0,100);
var t=ST.fmt(ST.pick(S,JS.SCARE),{a:p.name})+(p.prank?ST.fmt(ST.pick(S,M.PRANK_ACT),{a:p.name}):ST.fmt(ST.pick(S,JS.SCARE_REACT[p.top]||JS.SCARE_REACT.NP),{a:p.name}));
ST.sayB(S,{actors:[p],tag:'怪異',text:t,why:'恐怖 '+Math.round(p.m.fear),mag:10},p.name+'は怪異に遭った');
if(p.m.fear>=90&&S.rng()<0.4*HK.Dark.f(S,'madness')){
p.panic=true;
ST.say(S,{actors:[p],tag:'錯乱',text:p.name+'は悲鳴を上げて民宿を飛び出し、闇の中へ走っていった。',why:'恐怖が限界を超えた（'+Math.round(p.m.fear)+'）',mag:24});
p.action=JS.ACTIONS.filter(function(a){return a.id==='alone';})[0];
}
}
function shrine(S,p){
var rng=S.rng;S.shrine=1;
var fx=HK.weighted(rng,JS.SHRINE_FX,function(f){return f.w;});
var t=ST.fmt(ST.pick(S,JS.SHRINE_BREAK),{a:p.name})+ST.pick(S,JS.SHRINE_SCOLD)+ST.fmt(ST.pick(S,fx.t),{a:p.name});
if(fx.id==='curse')p.curse=S.h;
if(fx.id==='rage'){S.hostile=clamp(S.hostile+35,0,100);S.shrineRage=true;}
if(fx.id==='wake')S.deadline=Math.max(S.h+4,S.deadline-8);
if(fx.id==='clue'){var k=S.G.clues.map(function(c,i){return i;}).filter(function(i){return S.found.indexOf(i)<0;})[0];if(k!=null){S.found.push(k);p.cnt.clue++;t+='――'+S.G.clues[k].t+'。';}}
if(fx.id==='possess')p.possessed=true;
if(fx.id==='seal')S.sealBonus=0.12;
p.m.fear=clamp(p.m.fear+12,0,100);
var o=ST.say(S,{actors:[p],tag:'祠',text:t,why:'祠を壊した（'+(p.goal.id==='deny'?'迷信だと証明したかった':p.tr.impulse>0.6?'衝動性が高い':'不運')+'）→ '+fx.why,mag:32});
ST.key(S,o,p.name+'が祠を壊した');
}
function tickCurse(S,p,h){
if(p.curse!=null&&h-p.curse>=8&&S.rng()<0.18*HK.Dark.f(S,'kill')){
var save=P0(S).filter(function(q){return alive(q)&&q!==p&&(q.job==='priest'||q.job==='psychic'||q.magic);})[0];
if(save&&S.rng()<0.6){p.curse=null;ST.say(S,{actors:[save,p],tag:'お祓い',text:save.name+'は'+p.name+'の首の痣に手を当て、長い祝詞を唱えた。痣は、少しずつ薄れていった。',why:save.name+'（'+jobOf(save).label+'）が呪いを祓った',mag:18});return;}
die(S,p,'祠の呪いで',L('{a}の首の痣が、ついに喉元まで這い上がった。{a}は声も出せずに崩れ落ちた。|朝、{a}は布団の中で冷たくなっていた。首には、くっきりと手の形の痣が残っていた。'));
}
if(p.possessed&&S.rng()<0.12){
p.m.fear=clamp(p.m.fear+5,0,100);
ST.sayB(S,{actors:[p],tag:'憑依',text:p.name+'は夜中にふらりと起き上がり、神社の方へ歩いていこうとした。仲間が慌てて引き止めた。',why:'取り憑かれている'},p.name+'がうろついた');
}
}
function P0(S){return S.P;}
function attack(S,p,live){
var rng=S.rng;p.cnt.attack++;
var near=live.filter(function(q){return q!==p&&alive(q)&& !q.bound&&(p.action.id!=='alone'||JS.REL.bond(S,q,p)>=0.7)&&JS.REL.near(S,p,q);});
var helper=near.sort(function(a,b){return skill(b,'fight')-skill(a,'fight');})[0];
var def=skill(p,'fight')+p.stats.luck*0.05+(helper?skill(helper,'fight')*0.6+0.15:0)+(p.goal.id==='protect'?0.05:0);
var t=ST.fmt(ST.pick(S,JS.ATTACK),{a:p.name});
def=HK.Dark.live(S,def,'raid');
if(JS.MAGE&&JS.MAGE.defend(S,p,live,t))return;
var roll=rng()*1.1;
if(p.foresee&&roll>def){p.foresee=false;return ST.say(S,{actors:[p],tag:'予見',text:t+'――しかし{a}は、昼間の占いで見た光景を思い出していた。{a}は一歩早く身をかわし、闇に紛れて逃げ延びた。'.replace(/\{a\}/g,p.name),why:'占い師の予見が、一度だけ危険を避けさせた',mag:24});}
if(roll<def){
p.m.hp=clamp(p.m.hp-10,0,100);p.m.fear=clamp(p.m.fear+12,0,100);
return ST.say(S,{actors:helper?[p,helper]:[p],tag:'襲撃',text:t+ST.fmt(ST.pick(S,JS.ATTACK_OK),{a:p.name,b:helper?helper.name:'仲間'}),why:'抵抗できた（腕っぷし・運'+(helper?'・'+helper.name+'の助け':'')+'）',mag:22});
}
if(JS.REL.shield(S,p,live,t))return;
if(rng()<0.55){
p.taken=true;p.takenAt=S.h;
var o=ST.say(S,{actors:[p],tag:'連れ去り',text:t+ST.fmt(ST.pick(S,JS.ATTACK_TAKEN),{a:p.name}),why:'村人に連れ去られた（生贄の候補にされた）。儀式の前に対抗策を実行できれば、助け出せる',mag:34});
return ST.key(S,o,p.name+'が連れ去られた');
}
die(S,p,'村人に襲われて',JS.ATTACK_DIE,t);
}
function die(S,p,how,pool,pre){
p.alive=false;p.fate='死亡（'+hm(S.h)+'）';p.how=how;
var o=ST.say(S,{actors:[p],tag:'死',kind:'climax',text:(pre||'')+ST.fmt(ST.pick(S,pool),{a:p.name}),why:how+'命を落とした',mag:46});
ST.key(S,o,p.name+'の死');
prankReal(S,p);
JS.REL.onDeath(S,p);
if(JS.MUNO)JS.MUNO.onDeath(S,p);
}
function escape(S,p,h){
var ok=S.rng()<0.04+Math.min(0.1,(S.fog||0)*0.04)+p.stats.luck*0.025+(night(h)? -0.02:0.03)+(p.job==='student'?0.02:0);
if(ok&&JS.REL.stay(S,p))return;
if(ok){
p.out=true;p.esc=h-1+S.rng()*2;p.fate='単独で脱出（'+hm(p.esc)+'）';
var o=ST.say(S,{actors:[p],tag:'脱出',kind:'climax',text:ST.fmt(ST.pick(S,JS.ESCAPE_OK),{a:p.name})+'――'+p.name+'は仲間を残して村を出た。',why:'運（'+p.stats.luck+'）で抜け道を見つけた。目標「'+p.goal.label+'」',mag:40});
return ST.key(S,o,p.name+'が単独で脱出（'+hm(p.esc)+'）');
}
p.m.fear=clamp(p.m.fear+8,0,100);p.m.hp=clamp(p.m.hp-4,0,100);
ST.sayB(S,{actors:[p],tag:'脱出失敗',text:ST.fmt(ST.pick(S,JS.ESCAPE_TRY),{a:p.name}),why:'村からは、まだ出られない'},p.name+'の脱出は失敗');
}
function npcTurn(S,live,h){
var rng=S.rng;
if(S.reporter&&S.reporter.alive&&rng()<0.16&&S.reporter.met<2){
S.reporter.met++;
var tgt=rng.pick(live),line=ST.pick(S,JS.REPORTER.lines);
var sharp=live.slice().sort(function(a,b){return skill(b,'obs')+skill(b,'lore')-skill(a,'obs')-skill(a,'lore');})[0];
var debunk=sharp&&rng()<(skill(sharp,'obs')+skill(sharp,'lore'))*0.45+(sharp.job==='detective'?0.25:sharp.job==='sleuth'?0.4:sharp.job==='ponkotsu'? -0.3:0);
if(tgt.job==='ponkotsu')debunk=false;
if(debunk)ST.say(S,{actors:[tgt,sharp],tag:'偽情報',text:'記者が'+tgt.name+'に耳打ちした。'+line+'――'+sharp.name+'は首を振った。「その話、どこで聞いたの？　出典がない。信じない方がいい｜その話、どこで聞いた。出典がない。信じない方がいい｜その話、どこで聞いたんです？　出典がありません。信じない方がいいですよ」',why:sharp.name+'が偽の情報を見抜いた（観察・知識'+(sharp.job==='detective'?'・探偵':'')+'）',mag:14});
else{S.fake++;ST.say(S,{actors:[tgt],tag:'偽情報',text:'記者が'+tgt.name+'に耳打ちした。'+line+(tgt.job==='ponkotsu'?ST.fmt(ST.pick(S,JS.RELT.PONK_BELIEVE),{a:tgt.name}):'')+'――一行は、その話を半ば信じてしまった。',why:'偽の情報を信じた（対抗策を実行するときに不利になる）',mag:14});}
}
if(S.police&&S.police.alive&&rng()<0.2){
S.police.n++;
var line2=ST.pick(S,JS.POLICE.lines),cop=live.filter(function(q){return q.job==='police';})[0];
if(/待機/.test(line2))S.hold=1;
if(cop&&rng()<0.6)ST.say(S,{actors:[cop],tag:'警察官',text:'駐在の警察官が言った。'+line2+'――'+cop.name+'が警察手帳を見せた。「同業者として言わせてもらうけど、それは悪手だよ｜同業者として言わせてもらうが、それは悪手だ｜同業者として言わせてもらいますが、それは悪手です」二人の警察官は、しばらく睨み合った。',why:'仕切りたがる警察官と、住人の警察官の衝突',mag:12});
else ST.say(S,{tag:'警察官',text:'駐在の警察官が言った。'+line2+(S.hold?'――一行は、しぶしぶ公民館に集められた。':''),why:'場を仕切りたがる警察官'+(S.hold?'（次の時間は調べにくくなる）':''),mag:10});
if(S.police.n>=3&&night(h)&&rng()<0.4){S.police.alive=false;ST.say(S,{tag:'警察官',text:'「村長に話をつけてくる」と出ていった駐在の警察官は、それきり戻らなかった。翌朝、駐在所には制帽だけが残されていた。',why:'仕切りたがる警察官の末路',mag:20});}
}
if(JS.UNPC)JS.UNPC.tick(S,live,h);
}
function solve(S,partial,who){
S.solved=true;S.partial=partial;
var lead=who||S.P.filter(function(q){return alive(q)&& !q.bound&& !q.taken;}).concat(S.P.filter(alive)).sort(function(a,b){return(a.bound||a.taken?1:0)-(b.bound||b.taken?1:0)||skill(b,'lore')-skill(a,'lore');})[0];
var o=ST.say(S,{actors:lead?[lead]:[],tag:'対抗策',text:(lead?lead.name+'は集めた手がかりを並べ、顔を上げた。「分かった。この村の神は――'+S.G.name+'だ｜＝｜分かりました。この村の神は――'+S.G.name+'です」':'手がかりがそろった。この村の神は、'+S.G.name+'だ。')+'対抗策は、'+S.G.sol+'。'+(partial?'（手がかりは一つ足りない。推測で補った）':''),why:partial?'手がかり '+S.found.length+'/'+S.G.clues.length+'。'+(lead?lead.name+'の知識で残りを推し量った':''):'手がかりが全部そろった',mag:36});
ST.key(S,o,'対抗策が判明');
}
function climax(S,h){JS.CAVE.climax(S,h);}
function ritual(S,h){
ST.step(S,'生贄の儀　'+label(h));
var rng=S.rng,cand=S.P.filter(function(p){return p.alive&&p.taken;});
var live=S.P.filter(alive);
var vic=cand[0]||live.filter(function(p){return p.villager&&rng()<0.6;})[0]||live.filter(function(p){return p.goal.id==='meet'&&rng()<0.5;})[0]||(live.length?live.slice().sort(function(a,b){return a.stats.luck+a.stats.stamina-b.stats.luck-b.stats.stamina;})[0]:null);
ST.say(S,{kind:'phase',text:'儀式の刻限が来た。村中の提灯に、一斉に火が入った。手がかりは'+S.found.length+'/'+S.G.clues.length+'。対抗策は、分からないままだった。'});
if(JS.MAGE&&JS.MAGE.ritualSummon(S,h)&&vic&&(!vic.alive||vic.plot)){
live=S.P.filter(alive);
vic=S.P.filter(function(p){return p.alive&&p.taken;})[0]||live.filter(function(p){return!p.plot;}).sort(function(a,b){return a.stats.luck-b.stats.luck;})[0]||null;
}
if(vic&& !vic.alive)vic=null;
if(vic&& !vic.taken&&rng()<HK.Dark.live(S,vic.stats.luck*0.07+vic.tr.caution*0.25,'kill')){
ST.say(S,{actors:[vic],tag:'隠れる',text:vic.name+'は床下に潜り込み、息を殺した。松明の明かりが、すぐそばを何度も通り過ぎていった。――生贄の座は、空いたままになった。',why:'運と慎重さで、生贄に選ばれるのを逃れた',mag:30});
vic=null;
}
if(JS.GOALX){var hj=JS.GOALX.hijackRitual(S,h,vic);if(hj){if(hj.skip){S.fleeBonus=(S.fleeBonus||0)+(hj.bonus||0);flee(S,h+1);return;}if(hj.vic!==undefined)vic=hj.vic;}}
if(vic&&vic.taken&&HK.Dark.skip(S,'kill')){vic.taken=false;vic.out=true;vic.esc=h;vic.fate='逃げ延びた（'+hm(h)+'）';ST.say(S,{actors:[vic],tag:'救出',text:'祭壇へ引き出される直前、'+vic.name+'の縄がゆるんだ。'+vic.name+'は松明の列の隙間をすり抜け、闇の中へ転がり出た。そのまま、山道を駆け下りた。',why:'見張りの隙を突いて逃れた（展開の重さ：穏やか）',mag:30});vic=null;}
if(vic)sacrifice(S,vic,h);
if(JS.CAVE.manifest(S,h,(vic?0.32:0.15)+S.P.length*0.03))return;
flee(S,h+1);
}
function sacrifice(S,vic,h){
if(!vic)return;
var orig=vic;vic=JS.REL.substitute(S,vic);
vic.alive=false;vic.taken=false;vic.fate='生贄（'+hm(h)+'）'+(vic!==orig?'・'+orig.name+'の身代わり':'');
var r18=JS.R18&&JS.R18.on(S)?JS.R18.ritual(S,vic):null;
if(r18&&r18.miko)vic.fate='神の子を産む巫女になった（'+hm(h)+'）';
var o=ST.say(S,{actors:[vic],tag:'生贄',kind:'climax',lewd:r18?true:undefined,text:(r18?r18.text:vic.name+'は白い着物を着せられ、祭壇の前に引き出された。'+S.G.rite+'。――'+vic.name+'の姿は、それきり誰の目にも映らなかった。'),why:vic.name+'が生贄に選ばれた'+(vic!==orig?'（'+orig.name+'の身代わりになった）':vic.villager?'（村の出身だった）':vic.takenAt!=null?'（連れ去られていた）':'（運と体力が最も低かった）'),mag:52});
ST.key(S,o,vic.name+'が生贄になった');
}
function flee(S,h){
var rng=S.rng,ok=[],ng=[];
S.P.filter(alive).forEach(function(p){
if(p.bound)return die(S,p,'縛られたまま',[(p.boundAt||'民宿')+'に取り残された{a}は、縛られたまま身をよじった。祭り囃子が近づいてきても、もう、どうすることもできなかった。']);
(rng()<HK.Dark.pick(S,0.6,0,-0.2,'kill')+HK.Dark.live(S,(S.inCave?0.24:0.33)+(S.fleeBonus||0)+(S.fog?0.06:0)+p.stats.luck*0.07+p.stats.stamina*0.04-p.m.fear/400,'kill')?ok:ng).push(p);
});
var saved=JS.REL.goBack(S,ng,ok);
ok.concat(saved).forEach(function(p){
if(p.goBackDie)return die(S,p,'引き返して',L('{a}は、二度と霧の中から出てこなかった。'));
p.out=true;p.esc=h+rng()*3;p.fate='逃げ延びた（'+hm(p.esc)+'）';
if(saved.indexOf(p)<0)ST.say(S,{actors:[p],tag:'逃走',text:p.name+'は儀式の混乱に紛れて、山道を転がるように駆け下りた。背後で、村の歌声がいつまでも続いていた。',why:'運と体力で逃げ切った',mag:30});
});
ng.filter(function(p){return saved.indexOf(p)<0;}).forEach(function(p){
die(S,p,'儀式の夜に',L('{a}は山道の途中で、村人たちの松明に囲まれた。|{a}は霧の中で道を見失い、気づくと祭壇の前に戻っていた。|{a}の足を、地面から伸びた何かが掴んだ。'));
});
}
function setupPlus(S){
var rng=S.rng,P=S.P;
S.FX=JS.FX&&JS.FX[S.G.id];S.trapUsed=[];S.horUsed=[];
S.ygo=S.G.id==='ygolonac';
if(S.ygo)S.hostile=clamp(S.hostile+20,0,100);
P.forEach(function(p){
var t=p.tr;
if(p.job==='celeb'&&rng()<clamp(0.35+t.np*0.3+t.fc*0.2-t.caution*0.3-t.a*0.2,0.1,0.9)){p.prank=true;p.prankOnce=true;}
if(p.goal.id==='ritual'&&P.length>=2){
var cs=M.COUNTER.filter(function(c){return c.n!==S.G.name;});
p.plot={kills:0,need:P.length>=4&&rng()<0.5?2:1,god:rng.pick(cs)};
}
});
}
function arrivePlus(S){
S.P.forEach(function(p){
if(p.prank)ST.say(S,{actors:[p],tag:'ドッキリ？',text:ST.fmt(ST.pick(S,M.PRANK_START),{a:p.name}),why:p.name+'（大物）は、これを誰かが仕込んだドッキリだと思い込んだ（怖がりにくいが、無茶をする）',mag:14});
if(p.plot)ST.say(S,{actors:[p],tag:'企み',text:ST.fmt(ST.pick(S,M.MAGE_HINT),{a:p.name}),why:'儀式を企む'+p.name+'は、仲間を生贄にして別の神（'+p.plot.god.n+'）を呼ぶつもりでいる（必要な生贄 '+p.plot.need+'人）。冷たさ・攻撃性が高いほど企む',mag:12});
});
}
function prankReal(S,dead){
S.P.forEach(function(q){
if(!q.prank|| !alive(q)||q===dead)return;
q.prank=false;q.m.fear=clamp(q.m.fear+30,0,100);
ST.say(S,{actors:[q],tag:'ドッキリ？',text:ST.fmt(ST.pick(S,(HK.State&&HK.State.bodyless(M.PRANK_REAL,dead))||M.PRANK_REAL),{a:q.name}),why:dead.name+'の死で、'+q.name+'はようやくこれが本物だと悟った（恐怖 +30）',mag:20});
});
}
function tickPlus(S,live,h){
var rng=S.rng;
live.forEach(function(m){
if(!m.plot|| !alive(m)||m.bound||m.plot.kills>=m.plot.need)return;
if(rng()>(night(h)?0.16+(m.plot.ready?0.16:0):0.04+(m.plot.ready?0.04:0)))return;
m.plot.ready=0;
var vs=live.filter(function(q){return q!==m&&alive(q)&& !q.bound&& !JS.REL.spare(S,m,q);});
if(!vs.length)return;
var v=HK.weighted(rng,vs,function(q){return 1+(q.action.id==='alone'?1.5:0)+(5-q.stats.luck)*0.2;});
m.plot.kills++;
S.killer=m;if(JS.DRAMA)JS.DRAMA.edge(S,m,v,'殺害','kill',m);
die(S,v,'何者かに殺されて',[ST.fmt(ST.pick(S,M.MAGE_KILL),{v:'{a}'})]);
S.killer=null;
v.how='儀式を企む'+m.name+'に殺されて';
detectMage(S,m,false);
});
if(S.ygo)live.forEach(function(p){
if(!alive(p)||p.bound)return;
p.viol+=2+p.tr.aggr*5+(night(h)?2:0)-p.tr.cp*2+(p.cnt.clue?1:0);
var th=28+p.tr.cp*35;
if(p.viol<th)return;
var calm=live.filter(function(q){return q!==p&&alive(q)&&(q.job==='priest'||q.job==='psychic');})[0];
if(calm&&rng()<0.12){p.viol-=20;return ST.sayB(S,{actors:[calm,p],text:ST.fmt(ST.pick(S,M.YGO_CALM),{a:p.name,b:calm.name}),why:calm.name+'が暴力の衝動を鎮めた'},calm.name+'が'+p.name+'を鎮めた');}
if(rng()<0.15)return ST.sayB(S,{actors:[p],tag:'衝動',text:ST.fmt(ST.pick(S,M.YGO_IRRITATE),{a:p.name}),why:'掌の口さまの影響で、暴力性が増している（'+Math.round(p.viol)+'）'},p.name+'が苛立っていた');
var tg=live.filter(function(q){return q!==p&&alive(q);});
if(!tg.length||rng()>0.13)return;
var b=rng.pick(HK.SameStory&&HK.SameStory.spare?HK.SameStory.spare(S,p,tg):tg);
if(p.viol>th+25&&rng()<0.35*HK.Dark.f(S,'kill')){
p.viol=th;
if(JS.DRAMA)JS.DRAMA.edge(S,p,b,'殺害','kill',p);
var ygN=S.log.length;
die(S,b,p.name+'に襲われて',[ST.fmt(ST.pick(S,M.YGO_KILL),{a:p.name,b:'{a}'})]);
if(HK.SameStory&&HK.SameStory.mark)HK.SameStory.mark(S,ygN,HK.SameStory.note(S,p,b));
return;
}
b.m.hp=clamp(b.m.hp-22,0,100);b.m.fear=clamp(b.m.fear+15,0,100);p.viol-=10;
ST.say(S,{actors:[p,b],tag:'暴力',text:ST.fmt(ST.pick(S,M.YGO_ASSAULT),{a:p.name,b:b.name}),why:'掌の口さま（イゴーロナク）は、心の底の暴力を引き出す。'+p.name+'の暴力性 '+Math.round(p.viol+10)+'（攻撃性が高く、CPが低いほど増えやすい）',mag:28});
});
}
function detectMage(S,m,openly,by){
var rng=S.rng,others=S.P.filter(function(q){return q!==m&&alive(q)&& !q.bound;});
if(!others.length|| !m.plot)return false;
var b=by||others.slice().sort(function(x,y){return skill(y,'obs')+(y.job==='sleuth'?0.4:0)-skill(x,'obs')-(x.job==='sleuth'?0.4:0);})[0];
var ch=by?1:openly?0.55+skill(b,'obs')*0.3:skill(b,'obs')*0.4+(b.job==='detective'?0.25:b.job==='sleuth'?0.4:0)+(b.job==='police'?0.1:0)+m.plot.kills*0.08;
if(rng()>ch)return false;
if(!by&&JS.REL.cover(S,m,b))return false;
var angry=others.reduce(function(s0,q){return s0+q.tr.aggr+q.tr.cold*0.5;},0)/others.length;
var t=by?'':ST.fmt(ST.pick(S,openly?M.MAGE_DETECT_OPEN:M.MAGE_DETECT),{a:m.name,b:b.name});
if((rng()<(0.2+angry*0.5)*HK.Dark.f(S,'grudge')||S.ygo)&& !(HK.SameStory&&HK.SameStory.nk&&HK.SameStory.nk(S,b,m))){
var o=ST.say(S,{actors:[b,m],tag:'露見',kind:'climax',text:t+ST.fmt(ST.pick(S,M.MAGE_KILLED),{a:m.name,b:b.name}),why:m.name+'のたくらみが'+b.name+'にばれた（観察'+(b.job==='detective'?'・探偵':'')+'）。一行の怒り（攻撃性・冷たさ）で、殺されてしまった',mag:44});
m.alive=false;m.fate='仲間に殺された（'+hm(S.h)+'）';if(JS.DRAMA)JS.DRAMA.edge(S,b,m,'制裁','kill',b);ST.key(S,o,m.name+'の正体が露見');
}else{
m.bound=true;m.boundAt=S.inCave?'洞窟の奥':'民宿';if(JS.DRAMA)JS.DRAMA.edge(S,b,m,'縛り上げた','enemy',b);
var o2=ST.say(S,{actors:[b,m],tag:'露見',kind:'climax',text:t+ST.fmt(ST.pick(S,M.MAGE_BOUND),{a:m.name}),why:m.name+'のたくらみが'+b.name+'にばれ、縛り上げられた（もう動けない）',mag:40});
ST.key(S,o2,m.name+'が縛り上げられた');
}
return true;
}
function trapRate(S,p,h){
if(!S.FX)return 0;
return(0.022+(p.action.id==='alone'?0.025:0)+(p.prank?0.03:0)+(p.goal.id==='content'?0.015:0)+(night(h)?0.01:0)+(p.panic?0.02:0)+(p.job==='ponkotsu'?0.02:0))*(0.6+S.env.ev/125)*(0.6+S.P.length*0.08);
}
function trap(S,p,live,cave){
var rng=S.rng,fx=S.FX;if(!fx)return false;
var ks=[0,1,2].filter(function(k){return S.trapUsed.indexOf(k)<0;});
if(!ks.length){S.trapUsed=[];ks=[0,1,2];}
var k=rng.pick(ks),tr=cave?rng.pick(M.CAVE_TRAP):fx.traps[k];if(!cave)S.trapUsed.push(k);p.cnt.trap++;
var set=ST.fmt(tr.set,{a:p.name,g:S.G.call});tr={die:ST.fmt(tr.die,{g:S.G.call})};
var helper=live.filter(function(q){return q!==p&&alive(q)&& !q.bound&&(cave||p.action.id!=='alone')&&JS.REL.near(S,p,q)&&rng()<0.85;}).sort(function(x,y){return skill(y,'obs')-skill(x,'obs');})[0];
var av=(skill(p,'obs')*0.4+p.tr.caution*(p.prank?0:0.25)+p.stats.luck*0.03+(helper?skill(helper,'obs')*0.25:0))*(cave?0.85:1);
if(p.foresee&&rng()>av){p.foresee=false;p.m.fear=clamp(p.m.fear+8,0,100);ST.say(S,{actors:[p],tag:'予見',text:set+'――しかし'+p.name+'は、占いで見た光景を思い出し、踏みとどまった。',why:'占い師の予見が、死の罠を一度だけ避けさせた',mag:22});return true;}
var roll=rng();
if(roll<av){
p.m.fear=clamp(p.m.fear+10,0,100);
ST.say(S,{actors:helper&&roll>av-(helper?skill(helper,'obs')*0.25:0)?[p,helper]:[p],tag:'死の罠',text:set+(helper&&roll>av-skill(helper,'obs')*0.25?ST.fmt(ST.pick(S,M.TRAP_HELP),{a:p.name,b:helper.name}):ST.fmt(ST.pick(S,M.TRAP_AVOID),{a:p.name})),why:(cave?'洞窟':S.G.name)+'の死の罠を避けた（観察・慎重さ・運'+(helper?'・'+helper.name+'の助け':'')+'）',mag:24});
return true;
}
if(rng()<HK.Dark.live(S,0.4,'kill')&&p.m.hp>35){
p.m.hp=clamp(p.m.hp-30,0,100);p.m.fear=clamp(p.m.fear+15,0,100);
ST.say(S,{actors:[p],tag:'死の罠',text:set+ST.fmt(ST.pick(S,M.TRAP_HURT),{a:p.name}),why:(cave?'洞窟':S.G.name)+'の死の罠。体力があったので命は拾った',mag:28});
return true;
}
die(S,p,(cave?'洞窟':S.G.name)+'の死の罠で',[tr.die.replace(/\{a\}/g,'{a}')+'。'],set+'――');
return true;
}
function godHorror(S,p){
var rng=S.rng,H=S.FX.horror;
var ks=H.map(function(x,i){return i;}).filter(function(i){return S.horUsed.indexOf(i)<0;});
if(!ks.length)return scare(S,p);
var k=rng.pick(ks);S.horUsed.push(k);p.cnt.scare++;
p.m.fear=clamp(p.m.fear+(p.prank?5:13)+(p.job==='psychic'?5:0)-p.tr.cp*4,0,100);
var t=ST.fmt(H[k],{a:p.name})+(p.prank?ST.fmt(ST.pick(S,M.PRANK_ACT),{a:p.name}):'');
ST.say(S,{actors:[p],tag:'怪異',text:t,why:S.G.call+'の気配（恐怖 '+Math.round(p.m.fear)+(p.prank?'・ドッキリだと思っているので怖がらない':'')+'）',mag:16});
}
JS.detectMage=detectMage;
function finish(S,input){
var P=S.P,G=S.G;
P.forEach(function(p){
if(!p.fate)p.fate=p.taken?'行方不明':p.alive?'村に残った':'死亡';
p.notes.push('職業：'+jobOf(p).label+'・来た理由：'+(p.amn&& !p.amn.back?'（記憶がない）':p.reason)+(p.amn?'・記憶喪失'+(p.amn.back?'（'+JS.hm(p.amn.at)+'に記憶が戻った）':'（'+JS.RELT.AMN_NEVER+'）'):''));
p.notes.push('初動「'+p.action.label+'」・目標「'+p.goal.label+'」・見つけた手がかり '+p.cnt.clue+'つ');
var bits=[];
if(p.cnt.scare)bits.push('怪異 '+p.cnt.scare+'回');
if(p.cnt.attack)bits.push('襲われた '+p.cnt.attack+'回');
if(p.curse!=null)bits.push('祠の呪い');
if(p.possessed)bits.push('取り憑かれた');
if(p.cnt.r18)bits.push('夜の出来事 '+p.cnt.r18+'回');
if(p.preg)bits.push('疑似妊娠');
if(p.prankOnce)bits.push('ドッキリだと思い込んでいた');
if(p.plot)bits.push('儀式のたくらみ（殺した人数 '+p.plot.kills+'）'+(p.bound?'・縛り上げられた':''));
if(S.ygo&&p.viol>40)bits.push('暴力性 '+Math.round(p.viol));
if(p.cnt.trap)bits.push('死の罠 '+p.cnt.trap+'回');
if(p.cnt.magic)bits.push('魔術 '+p.cnt.magic+'回');
if(JS.SPEC&&JS.SPEC.note(p))bits.push(JS.SPEC.note(p));
if(bits.length)p.notes.push(bits.join('・'));
});
var out=P.filter(function(p){return p.out;}),dead=P.filter(function(p){return!p.alive;});
var first=out.slice().sort(function(a,b){return a.esc-b.esc;})[0],last=out.slice().sort(function(a,b){return b.esc-a.esc;})[0];
var miko=P.filter(function(p){return/巫女/.test(p.fate);});
if(!out.length&& !S.engulf&& !S.titleOverride){
var gone=P.filter(function(p){return p.taken;}),v0={v:S.V,g:G.call,n:P.length,l:names(P),t:names(gone),m:names(miko),k:Math.max(1,P.filter(function(p){return!p.alive;}).length)};
var EP=miko.length?[
'祭りの太鼓が鳴り止むと、村はいつもの静けさを取り戻した。社の奥では、{m}が{g}の巫女として迎えられていた。もう、村の外へ出たいと口にする者はいなかった。',
'{v}の新しい巫女は、{m}だった。村人たちは何事もなかったように田畑へ戻り、山道の入口には、新しいしめ縄が張られた。',
'数か月後、{v}を訪ねた行商人は、社の前で静かに微笑む{m}の姿を見かけた。声をかけても、{m}は外の世界のことを何ひとつ覚えていなかった。'
]:[
'夜が明けると、村は何事もなかったように静まり返っていた。{v}の外れの墓地に、名前のない新しい塚が{k}つ増えていた。',
'一行が戻らないまま、刻限は過ぎた。麓の駐在所に届いた捜索願いは、数日後、「山で道に迷ったもの」として片づけられた。{v}の祭りは、今年も滞りなく終わった。',
'{v}の村人たちは、翌朝もいつも通り畑に出た。村の外から来た{n}人のことを、誰も口にしなかった。{g}は、また深い眠りについた。'
];
var tx=ST.fmt(ST.pick(S,EP),v0)+(gone.length?ST.fmt(ST.pick(S,['{t}の行方は、今も分かっていない。','{t}を最後に見た者は、誰もいなかった。','山の奥から、ときどき{t}の名を呼ぶような声が聞こえるという。']),v0):'');
ST.step(S,'村の朝');
ST.say(S,{actors:P,tag:'結末',kind:'climax',text:tx,why:'誰も'+S.V+'から出られなかった',mag:40});
}
var title;
if(!out.length&&S.engulf)title=S.G.call+'が顕現し、'+S.V+'は消えた。誰も戻らなかった。――全滅';
else if(!out.length)title=miko.length?names(miko)+'は神の子を産む巫女となった。誰も、'+S.V+'から出られなかった。――GAME OVER':'誰も'+S.V+'から出られなかった。――全滅';
else if(S.result==='sealed')title=S.G.name+'を封じ、'+out.length+'人が'+S.V+'を脱出（'+hm(last.esc)+'）';
else title=out.length+'人が'+S.V+'から逃げ延びた（'+hm(last.esc)+'）。'+S.G.call+'は、今も村で眠っている';
if(S.titleOverride)title=S.titleOverride;
var lines=P.map(function(p){return p.name+'（'+jobOf(p).label+'）：'+p.fate;});
lines.push('祀られていた神：'+G.name+'（村での呼び名「'+G.call+'」）');
lines.push('対抗策：'+G.sol+(S.solved?'':'（判明しなかった）'));
if(first&&out.length>1&&first.esc<last.esc-2)lines.push('最速の脱出：'+first.name+'（'+hm(first.esc)+'）');
if(JS.LOOP){
if(S.alienEnd)lines=lines.map(function(l){return l.replace(/^祀られていた神：/,'村人が神だと信じていたもの：');});
lines=lines.concat(JS.LOOP.lines(S));var epi=JS.LOOP.epilogue(S);if(epi)lines.push(epi);
}
var rows=P.map(function(p){return{i:p.i,rank:'',cells:[jobOf(p).label,p.amn&& !p.amn.back?'（記憶がない）':p.reason.length>18?p.reason.slice(0,17)+'…':p.reason,p.cnt.clue+'つ',Math.round(p.m.fear)+'',p.fate]};});
return ST.result(S,input,{
ending:{title:title,kind:out.length&& !miko.length&& !S.alienEnd?'ok':'over',lines:lines},
estats:[['脱出までの時間',out.length?hm(last.esc):'―'],['生還',out.length+'/'+P.length+'人'],['死亡・生贄',dead.length+'人'],['手がかり',S.found.length+'/'+G.clues.length],['神',G.name]],
table:{title:'一行の記録',hint:'手がかりの種類：観察・知識・聞き込み・霊感・探索。職業と気質で見つけやすさが変わる。',cols:['職業','来た理由','手がかり','恐怖','結末'],rows:rows},
meters:[{label:'恐怖',color:'--love'},{label:'体力',color:'--pine',dash:true},{label:'手がかり',color:'--accent',max:5}],
relmap:JS.DRAMA?JS.DRAMA.relmap(S):null,
meta:S.V+'・'+G.name+'・刻限'+S.env.hours+'時間',
summary:'邪神村RTA：'+title
});
}
JS.skill=skill;JS.alive=alive;JS.night=night;JS.hm=hm;
JS.core={die:die,sacrifice:sacrifice,flee:flee,names:names,jobOf:jobOf,label:label,trap:trap,L:L};
})();
});
;
/* ==== js/jashin-muno.js ==== */
HK.Load.def(336,'js/jashin-muno.js',function(){
(function(){
'use strict';
var HK=window.HK,JS=HK.JASHIN;
if(!JS|| !JS.core)return;
var ST=HK.Story,L=function(s){return s.split('|');};
function clamp(v,a,b){return Math.max(a,Math.min(b,v));}
var FLUB=L('{a}は「犯人が分かった！｜＝｜犯人が分かりました！」と叫んで村の祠に駆け込み、供え物をひっくり返した。村人たちの目つきが変わった。|{a}は手がかりを探すと言って、皆がまとめておいた地図に水筒の茶をこぼした。|{a}は「近道を見つけた｜＝｜近道を見つけました」と言い張り、一行を三十分も同じ場所でぐるぐる歩かせた。|{a}は村人に「この村、絶対なんかあるよね！｜この村には、絶対に何かある！｜この村、絶対なんかありますよね！」と大声で話しかけた。村人は笑顔のまま、二度と口をきいてくれなかった。|{a}は勝手に神社の鈴を鳴らし続けた。夜中まで、どこからか同じ音が返ってきた。|{a}は見つけた古文書を「読めない｜＝｜読めません」と言って、焚き付けに使ってしまった。|{a}は「みんなのために｜皆のためだ｜皆さんのためです」と夕食を作ろうとして、民宿の台所を小火にした。');
var GOAL=L('{a}は「\u2060{g}」のことしか頭になかった。皆の制止を振り切って、一人で村の奥へ向かった。|{a}は「\u2060{g}」のためだと言い張って、話し合いの途中で席を立った。|{a}は「\u2060{g}」に夢中で、皆が集めた手がかりの話を一つも聞いていなかった。|{a}は「\u2060{g}」のためにと勝手に村人と約束を取りつけ、一行の予定をめちゃくちゃにした。');
var SABO=L('{a}は{b}が調べていた蔵の扉を、外から閂で閉めてしまった。「わざとじゃない｜わざとではない｜わざとではありません」と{a}は言ったが、{b}が出られたのは二時間後だった。|{a}は{b}の懐中電灯の電池を「\u2060借りた」まま返さなかった。{b}は夜道で足を踏み外し、膝を強く打った。|{a}は村人に「{b}が祠を荒らした｜＝｜{b}が祠を荒らしました」と吹き込んだ。村人たちは、{b}を冷たい目で見るようになった。|{a}は{b}の手帳を「\u2060間違えて」持ち出し、谷川に落とした。{b}が書き留めていたことは、すべて流れていった。|{a}は{b}が隠れていた納屋の前で大声を上げた。駆けつけた村人たちに、{b}は追い回された。');
var SABO_WHY='敵対している相手の足を引っ張った（無能）';
var STUCK=L('{a}は、{b}のせいで足止めを食らっていた。|{a}は、{b}が引き起こした騒ぎの後始末に追われていた。');
var DRAG=L('――倒れる間際、{a}は{b}の足首を掴んで離さなかった。二人はもつれ合ったまま、闇の中へ落ちていった。|――{a}の悲鳴に気を取られて振り返った{b}も、同じものに捕まった。|――{a}は最後に、{b}の名前を叫んだ。振り返った{b}の背後に、それはもう立っていた。|――{a}が引きずり込まれた先には、{b}が隠れていた。');
var DRAG_DIE=L('{a}は、そのまま戻らなかった。|{a}も、二度と戻らなかった。');
function alive(p){return JS.alive?JS.alive(p):p.alive!==false;}
function foes(S,p,live){
return live.filter(function(q){return q!==p&&alive(q)&& !q.out&& !q.bound&&(JS.REL.cat(S,p,q)==='bad'||JS.REL.bond(S,p,q)< -0.15);});
}
JS.MUNO={
act:function(S,p,h,live){
var rng=S.rng;
if(p.munoStun&&p.munoStun>h){
ST.sayB(S,{actors:[p],tag:'足止め',text:ST.fmt(ST.pick(S,STUCK),{a:p.name,b:p.munoBy||''}),why:'無能に足を引っ張られた'},p.name+'は足止め');
return true;
}
if(p.job!=='muno'||rng()>0.7)return false;
var fs=foes(S,p,live),r=rng();
if(fs.length&&r<0.35){
var q=fs[Math.floor(rng()*fs.length)];
q.m.hp=clamp(q.m.hp-(10+rng()*14),0,100);q.m.fear=clamp(q.m.fear+14,0,100);
q.munoStun=h+2;q.munoBy=p.name;
S.hostile=clamp((S.hostile||0)+4,0,100);
var o=ST.say(S,{actors:[p,q],tag:'足を引っ張る',text:ST.fmt(ST.pick(S,SABO),{a:p.name,b:q.name}),why:SABO_WHY+'：'+q.name+'は怪我をして、しばらく動けない',mag:24});
if(!p.munoKey){p.munoKey=true;ST.key(S,o,p.name+'が'+q.name+'の足を引っ張った');}
return true;
}
if(r<0.65&&p.goal){
p.m.fear=clamp(p.m.fear-3,0,100);
ST.sayB(S,{actors:[p],tag:'空回り',text:ST.fmt(ST.pick(S,GOAL),{a:p.name,g:p.goal.label}),why:'無能：手がかりより自分の目標「'+p.goal.label+'」を追いかけた'},p.name+'は目標に夢中');
return true;
}
S.hostile=clamp((S.hostile||0)+5,0,100);
live.forEach(function(q){if(q!==p&&alive(q))q.m.fear=clamp(q.m.fear+3,0,100);});
ST.sayB(S,{actors:[p],tag:'空回り',text:ST.fmt(ST.pick(S,FLUB),{a:p.name}),why:'無能：行動が空回りして、場をかき乱した（村人の敵意 +5・皆の恐怖 +3）'},p.name+'が空回り');
return true;
},
onDeath:function(S,p){
if(p.job!=='muno'||S.munoDrag)return;
var fs=foes(S,p,S.P||[]);
if(!fs.length||S.rng()>0.55)return;
var q=fs[Math.floor(S.rng()*fs.length)];
S.munoDrag=true;
JS.core.die(S,q,p.name+'の巻き添えで',DRAG_DIE,ST.fmt(ST.pick(S,DRAG),{a:p.name,b:q.name}));
}
};
})();
});
;
/* ==== js/jashin-special.js ==== */
HK.Load.def(337,'js/jashin-special.js',function(){
(function(){
'use strict';
var HK=window.HK,JS=HK.JASHIN,SP=HK.Special;
if(!JS|| !SP)return;
function clamp(v,a,b){return Math.max(a,Math.min(b,v));}
function adapter(S){
var A=S.spA;
if(A){A.nowH=S.h||0;return A;}
A=S.spA={
rng:S.rng,all:S.P,nowH:S.h||0,env:S.env,scenId:'jashin',
r18: !!(JS.R18&&JS.R18.on(S)),lewd:clamp((S.env.jlewd||0)/100,0.15,0.85),
alive:function(p){return!!p.alive;},
here:function(p){return!p.out&& !p.taken&& !p.bound;},
say:function(o){
var r=o.short&&S.room!=null?HK.Story.sayB(S,o,o.short):HK.Story.say(S,o);
if(o.key&&r)HK.Story.key(S,r,o.key);
return r;
},
hp:function(p){return p.m.hp;},
setHp:function(p,v){p.m.hp=clamp(v,0,100);},
full:function(){return 100;},
stress:function(p){return p.m.fear;},
addStress:function(p,v){p.m.fear=clamp(p.m.fear+v,0,100);},
rel:function(a,b){return{love:JS.REL.cat(S,a,b)==='love',w:JS.REL.bond(S,a,b)};},
revive:function(p){p.alive=true;p.fate='';p.how='';p.taken=false;},
kill:function(p,how,text){JS.core.die(S,p,how,[text]);},
zombie:function(){return false;}
};
return A;
}
JS.SPEC={
setup:function(S,input){
SP.setup(adapter(S),S.P,function(p){return input.perChar&&input.perChar[p.i];});
S.P.forEach(function(p){if(p.spec)p.roleLabel=(p.roleLabel||'')+'・'+SP.LABEL[p.spec];});
},
revive:function(S){SP.revive(adapter(S));},
wear:function(S,live){
var A=adapter(S);
live.forEach(function(p){SP.wear(A,p,{all:true,zealot:true,base:55,lim:20});});
},
danger:function(p){return SP.danger(p);},
mad:function(p){return SP.isMad(p);},
act:function(S,p){
var A=adapter(S);
if(p.mad)return SP.madTurn(A,p);
return SP.vampTurn(A,p);
},
note:function(p){var n=SP.endNote(p);if(p.mad&& !p.spec)n='発狂（'+p.mad.label+'）したまま';return n;}
};
})();
});
;
/* ==== js/jashin-duo-data.js ==== */
HK.Load.def(338,'js/jashin-duo-data.js',function(){
(function(){
'use strict';
var JS=window.HK&&window.HK.JASHIN;
if(!JS)return;
JS.DUO_EV=JS.DUO_EV||[];
[
['ally001','ally','occult','student','clue','lore','explore','昼下がり、{b}は村の子どもたちから、裏山の古井戸には近づくなと言われたと{a}に伝えた。二人は人目を避けて、竹藪の奥へ向かった。','井戸の縁石には、見覚えのある渦巻きの紋が刻まれていた。{b}が振り返ると、{a}は青ざめていた。{a}「これ、海の神の印だ｜これは、海の神の印だ｜これ、海の神の印です」――','{b}が身軽に井戸へ身を乗り出したところを、{a}は危ないと強く叱りつけた。{b}はむくれて先に帰り、二人の間には気まずい沈黙が残った。'],
['ally002','ally','sleuth','sleuth','rescue','obs','obs','民宿の帳場から{x}の姿が消えていた。二人の名探偵は、畳に残った泥の足跡と半開きの勝手口を、ほんの数秒見比べただけで同時に頷いた。','足跡の歩幅と泥の色から、{a}は沼のほとりの水車小屋を言い当て、{b}は見張りの交代時刻まで割り出した。二人は推理どおりの隙を突き、縛られた{x}を連れ出した。','{a}は沼へ、{b}は山の上へと、二人の推理は真っ二つに割れた。互いの論理の穴を突き合ううちに時間だけが過ぎ、{x}の行方を見失った二人は相手の読みの甘さを責めた。'],
['ally003','ally','seer','ghost','bond','spirit','spirit','深夜の公民館で、{b}は赤外線カメラの映像を確かめ、{a}はその横でカードを一枚ずつ並べていた。二人は互いの道具を、興味深そうに覗き込んだ。','映像に映った白い靄と、{a}が引いた札の絵柄がぴたりと重なった。{b}は「同じものを見てる｜同じものを見ている｜同じものを見ていますね」と笑い、二人は夜明けまで見えない世界の話を語り合った。','{b}が占いは統計的に無意味だと口を滑らせると、{a}は黙ってカードを片付けた。それきり、二人は一度も目を合わせなかった。'],
['ally004','ally','doctor','ponkotsu','save','obs','explore','夕暮れの棚田のあぜ道で、{b}が決定的な証拠だと胸を張って拾い上げた野花を、{a}は鋭く見とがめた。茎から、甘い匂いの白い汁がにじんでいた。','{a}はそれが村で眠り薬に使われる毒草だと見抜き、{b}の指をすぐに沢で洗わせた。夕餉の汁物から同じ匂いがしたら、もう口にはしない。二人はそう決めて頷き合った。','{b}が的外れな推理を続けるうちに毒が回り、畦から転げ落ちた。支えようとした{a}も足を挫き、二人は泥まみれのまま、互いに目も合わせず宿へ戻った。'],
['ally005','ally','police','sleuth','clue','fight','obs','村の駐在所はもぬけの殻だった。{a}は錆びた机の引き出しをこじ開け、{b}は壁に貼られた古い尋ね人の張り紙を一枚ずつ見ていった。','張り紙の日付は、どれも祭りの前夜で揃っていた。{b}は「毎年、同じ日だ｜＝｜毎年、同じ日です」と呟き、{a}は引き出しの奥から黄ばんだ日誌を差し出した。――','力任せに引き出しを壊した{a}を、{b}は証拠が台無しだと咎めた。{a}も現場を知らない人間の理屈だと言い返し、二人は別々に駐在所を出た。'],
['ally006','ally','occult','folk','bond','lore','lore','雨で足止めされた社務所の軒下で、{a}と{b}は互いのノートを交換した。片方は邪神の系譜、もう片方は祭祀の記録で埋まっていた。','読み進めるうちに、二人の知識は一枚の地図のように繋がっていった。雨が上がる頃には、二人は長年の研究仲間のように笑い合っていた。','{b}は{a}のノートを根拠のない空想だと評し、{a}は{b}の記録を臆病な学問だと切り捨てた。雨音だけが、気まずい沈黙を埋めていた。'],
['ally007','ally','priest','priest','rescue','rite','rite','{x}が連れ込まれたのは、村の奥にある古い本殿だった。二人の神職は装束の襟を正し、他所の神域に踏み入る作法を小声で確かめ合った。','二人は揃って二礼二拍手し、祝詞を重ねて結界を和らげた。{a}は「今のうちに｜今のうちだ｜今のうちです」と囁き、{b}が奥の柱に縛られた{x}の縄を解いた。','どちらの流儀で拝礼するかで手順が食い違い、本殿の鈴が激しく鳴った。駆けつけた村人に追い返された二人は、相手の作法の誤りを責め合った。{x}はまだ奥に囚われていた。'],
['ally008','ally','psychic','ghost','lose','spirit','spirit','夜更け、{b}の録音機が勝手に再生を始めた。録りためた村人の証言の上に知らない声が重なっていくのを、{a}は青ざめた顔で聞いていた。','{a}が部屋の隅に声の主の気配を見つけて睨みつけ、{b}は急いで録音を予備のメモリへ移した。ノイズが止んだ後、二人は肩を並べて小さく笑った。','録音はすべて、湿った囁き声に塗りつぶされて消えた。{b}はなぜもっと早く言わなかったのかと詰め寄り、{a}は機材を持ち込んだせいだと言い返した。'],
['ally009','ally','doctor','sleuth','lose','obs','obs','診療所の跡で見つけたカルテの束を、二人は民宿の部屋に広げていた。そのとき、障子の向こうで誰かが息を潜める気配がした。','{b}は障子に映る影から相手の背丈と利き手を読み、{a}はとっさにカルテを往診鞄の底へ隠した。{b}は「いい判断だった｜＝｜いい判断でした」と笑い、二人は夜通しカルテを読み込んだ。','振り返った隙に、カルテの束は窓の外へ引きずり出されていた。なぜ鞄を開けたままにしたのかと{b}が責め、{a}は推理に夢中だったのはそっちだと言い返した。'],
['ally010','ally','seer','sleuth','lose','spirit','obs','神社の石段で、{a}は急に足を止め、嫌な札が出たと告げた。古文書の写しを懐に入れた{b}は、石段の上で掃除をする村人の箒が止まっていることに目を留めた。','{b}は札の予感と止まった箒を結びつけ、待ち伏せだと即座に読み解いた。二人は写しを分けて互いの懐に収め、何食わぬ顔で村人の脇を抜けた。追いすがる手は空を切った。','{b}が占いより推理が確かだと笑った瞬間、村人が石段を駆け下りてきた。写しは懐からひったくられ、谷の方へ消えた。{a}はだから言ったのにとなじり、{b}は黙って背を向けた。'],
['ally011','ally','muno','prof','lose','explore','lore','{b}が苦心して書き写した祭文の写しを、{a}は手伝うと言って抱えて歩いていた。足元には、昼間の雨でぬかるんだ田の畦が続いていた。','案の定足を滑らせた{a}は、写しだけを頭上に掲げたまま泥に沈んだ。{b}は「よく守った｜＝｜よく守りましたね」と吹き出し、泥だらけの{a}を引き上げた。','{a}は派手に転び、写しは田の泥水に吸い込まれていった。{b}は二度と触るなと怒鳴り、{a}は、そもそも持たせたのはそっちだとふてくされた。'],
['ally012','ally','muno','seer','save','explore','spirit','夜明け前、{b}は眠れずに札をめくり、炎の札を三度続けて引いた。隣で寝ていた{a}が、寝ぼけ眼で何事かと身を起こした。','{a}が寝ぼけて行灯を蹴倒した騒ぎで、二人は床下に撒かれた油の匂いに気づいた。窓から抜け出した直後、離れが燃え上がった。あの焦げ臭さを、二人はもう忘れない。','{a}が慌てて逃げ道を間違え、二人は燃える廊下を突っ切る羽目になった。腕に火傷を負った{b}は、煤けた顔の{a}から黙って目を逸らした。'],
['ally013','ally','folk','doctor','death','lore','obs','祭りの晩、注連縄の張られた洞窟に迷い込んだ二人の背後で、岩戸が重い音を立てて閉ざされた。奥から、水の滴る音と這い寄る気配が近づいてきた。','言い伝えを思い出した{a}は「灯りを消して｜灯りを消せ｜灯りを消してください」と囁いた。闇の中、{b}は浅い息を繰り返す{a}の脈を取り、背をさすって呼吸を整えさせた。気配が通り過ぎた隙に、二人は細い風穴から這い出した。','這い寄るものの冷たい腕が、{v}の足首を掴んで闇の奥へ引きずり込んだ。{w}は風穴から外へ逃れたが、背後の悲鳴はすぐに水音に呑まれて消えた。'],
['ally014','ally','psychic','musician','save','spirit','obs','宵祭りの囃子の中に、{b}は一拍だけずれた太鼓の音を聞き取った。同じとき、{a}には櫓の陰に立つ影が一つ多く見えていた。','ずれた拍が合図だと見抜いた{b}が{a}の腕を引き、二人は人波から外れた。直後、櫓の陰から村人たちが飛び出したが、そこにはもう誰もいなかった。あの拍は、次もすぐに聞き分けられる。','合図に気づいたときには遅く、二人は人波に揉まれて石垣に叩きつけられた。額を切った{b}は、なぜもっと早く言わなかったのかと{a}に詰め寄った。'],
['ally015','ally','occult','doctor','save','lore','obs','村人に勧められた甘酒を前に、{a}は碗の縁の紋に眉をひそめた。それは生贄に供える器の印だと、古い文献で読んだ覚えがあった。','{b}が匂いを嗅いで薬草の混ぜ物を確かめ、二人は飲んだふりをして碗の中身を床下に流した。{b}は「次も同じ手で来る｜＝｜次も同じ手で来ます」と小声で言い、二人はその紋を目に焼きつけた。','断りきれずに一口含んだ二人は、ひどい眩暈に襲われた。夜半に吐き戻して事なきを得たが、{b}はなぜはっきり止めなかったのかと{a}を責めた。'],
['ally016','ally','prof','sleuth','bond','lore','obs','村長の屋敷で借りた古地図を前に、{a}は筆跡の年代を、{b}は書き込みの不自然さを、それぞれ夜更けまで検めていた。','年代と矛盾が一つの結論に重なったとき、二人は思わず手を打ち合わせた。{a}は若い頃の調査の失敗を打ち明け、{b}は黙って最後まで耳を傾けた。','{b}が{a}の年代鑑定を机上の空論だと切り捨てると、{a}は探偵ごっこには付き合えないと地図を巻き上げた。二人は別々の部屋で朝を迎えた。'],
['ally017','ally','prof','police','save','lore','fight','峠へ続く吊り橋の手前で、{a}は欄干に結ばれた白い紙垂に目を留めた。この村では、生贄を送る道にだけそれを下げると記録にあった。','{a}の制止で足を止めた{b}が橋板を一枚剥がすと、裏には深い切り込みが入っていた。{b}は「紙垂は罠の印か｜＝｜紙垂は罠の印でしたか」と呟き、二人は沢沿いの古道へ回った。','引き返す前に橋板が割れ、{b}はとっさに{a}を抱えて綱にしがみついた。二人とも擦り傷だらけで這い上がったが、{b}は、なぜもっと早く止めなかったのかと苛立っていた。'],
['ally018','ally','folk','folk','death','lore','lore','夜の沼のほとりで、二人の民俗学者は水面に浮かぶ灯籠の配置を記録していた。ふと、灯籠の灯りが一つずつこちらへ寄ってきた。','灯籠流しは霊を沼の向こうへ送る儀式だと気づいた二人は、灯籠をすべて沖へ押し返した。灯りが遠のくと足首に絡む水草がほどけ、二人は岸へ駆け上がった。','灯りの一つが{v}の足元で止まり、泥の中から無数の手が伸びた。{w}が伸ばした手は届かず、{v}は灯籠と共に黒い水の底へ沈んでいった。'],
['ally019','ally','sleuth','priest','lose','obs','rite','社務所で借りた古い祝詞の写しを、{b}は大切に風呂敷に包んでいた。帰り道、二人は背後から同じ歩幅でついてくる足音に気づいた。','{a}は足音の癖から、追手が村の者だと見抜いた。{a}「境内へ｜境内へ入れ｜境内へ入りましょう」{b}が作法どおり一礼して鳥居をくぐると、追手は禁を恐れるように鳥居の手前で足を止めた。','{a}が近道だと選んだ路地で、二人は突き飛ばされ、風呂敷は奪われていた。{b}は推理を過信した{a}を責め、{a}は鳥居ごとに立ち止まって拝礼する{b}の律儀さが仇だと返した。'],
['ally021','ally','occult','prof','bond','lore','lore','蔵から運び出した古文書の山を前に、{a}と{b}は手分けして頁をめくっていた。夜も更け、行灯の油が尽きかけていた。','{b}が崩し字を読み下し、{a}がそこに隠れた邪神の異名を言い当てた。{b}は「いい相棒になれそう｜いい相棒になれそうだ｜いい相棒になれそうです」と言い、{a}はその言葉を照れくさそうに受け取った。','{b}が邪神の異名など後世のこじつけにすぎないと言い捨てると、{a}は古文書を乱暴に閉じた。それきり、二人は別々の部屋で一冊ずつ読むようになった。'],
['ally023','ally','journalist','doctor','rescue','talk','obs','公民館の裏の土蔵に、{x}が運び込まれるのを{a}は見ていた。{b}は往診鞄を抱え、怪我人の手当てを口実に村人へ掛け合う段取りをつけた。','{b}が見張りの腰痛を診ている隙に、{a}は世間話で鍵の在り処を聞き出した。土蔵で{x}を見つけた{b}は「歩ける？｜歩けるか？｜歩けますか？」と囁き、肩を貸して連れ出した。','見張りは{b}の診察を怪しみ、{a}の質問をはぐらかした。土蔵に近づくこともできず、二人は聞き込みが下手だ、芝居が下手だと互いをなじった。{x}はまだ土蔵の中だった。'],
['ally024','ally','journalist','celeb','bond','talk','talk','村の茶屋で、{a}は手帳を閉じ、取材抜きで話がしたいと{b}に切り出した。{b}は少し驚いた顔で、冷めた茶を一口すすった。','顔を知られて生きる孤独を、{b}は初めて誰かに打ち明けた。{a}は一行も書き留めず、ただ最後まで聞いた。二人の間に、記事にはならない信頼が生まれた。','話の途中で、{b}は{a}の上着のポケットで回り続ける録音機に気づいた。{b}は黙って席を立ち、{a}の弁解には一言も答えなかった。'],
['ally025','ally','psychic','sleuth','rescue','spirit','obs','{x}が消えたのは、鳥居をくぐった直後だった。{a}には鳥居の向こうに別の参道が見え、{b}は石畳に残った不自然な引きずり跡を見つけた。','{b}が跡の向きから入口を割り出し、{a}が見えない参道へ{b}の手を引いた。霧の奥でうずくまる{x}に、{a}は「もう大丈夫｜もう大丈夫だ｜もう大丈夫です」と声をかけた。','{a}の見る道と{b}の読む跡は、最後まで食い違った。霧の中を堂々巡りした二人は互いの見立てを責め合い、{x}を見つけられないまま引き返した。'],
['ally026','ally','ghost','musician','bond','spirit','obs','夜明け前の神楽殿で、{a}は集音マイクを据え、{b}は古い笛をそっと吹いてみた。二人で、この村の音を記録しておこうと決めたのだった。','再生した録音には、笛に寄り添うような、誰のものでもない声が重なっていた。二人は怖がるより先に聞き惚れ、朝日が差すまで並んで耳を傾けた。','{a}は笛の音をノイズ扱いして何度も録り直させ、{b}は機材しか見ていないと苛立った。笛は途中で投げ出され、録音は無音のまま終わった。'],
['ally027','ally','prof','sleuth','clue','lore','obs','古い社務所の床下から、{b}は湿った木箱を引きずり出した。中の書付けを、{a}はルーペ越しに一枚ずつ読み解き始めた。','{a}が年号を読み解き、{b}が筆跡の違いを指摘した。後から書き足された一行に、二人の目が同時に止まった。{b}「ここだけ墨が新しい｜＝｜ここだけ墨が新しいです」――','{b}の推理を{a}は史料の読み方を知らないと退け、{b}はその解釈は古すぎると言い返した。箱の蓋は閉じられ、二人は口をきかなくなった。'],
['ally028','ally','civ','student','rescue','talk','explore','祭りの準備で賑わう広場で、{x}が神輿の中に押し込まれていくのを{a}は偶然目にした。{b}は顔見知りの村の若者たちの輪に、何食わぬ顔で紛れ込んだ。','{b}が若者たちから担ぎ手の交代時刻を聞き出し、{a}は運良く空いた担ぎ棒に肩を入れた。人目のない坂の途中で、二人は{x}を神輿から引っぱり出した。','{b}の嘘はすぐに見抜かれ、{a}も担ぎ手に突き飛ばされた。{x}を乗せた神輿は太鼓の音と共に山の上へ消え、二人は互いの段取りの悪さを責め合った。'],
['ally029','ally','seer','priest','rescue','spirit','rite','{x}は社の奥の禁足地へ連れて行かれた。{a}は札を繰って踏み込む刻を占い、{b}は禁足地に入るための古い禊の作法を思い出そうとしていた。','{b}が沢の水で二人を清め、{a}が占った月の傾く刻に踏み込んだ。苔むした磐座の前に倒れていた{x}を抱き起こし、{b}は「間に合った｜＝｜間に合いました」と息を吐いた。','占いの刻と禊の段取りが噛み合わず、二人は禁足地の入口で激しい耳鳴りに打ち倒された。{b}は札を信じすぎたと言い、{a}は作法が古すぎると返した。{x}は戻らなかった。'],
['ally030','ally','manager','ghost','bond','fight','spirit','機材の電池を数える{b}の隣で、{a}は全員分の非常食と水を黙々と仕分けていた。夜の見張りの交代まで、まだ少し時間があった。','{b}は、怪異を記録するのは仲間を守るためだと打ち明けた。{a}は少し黙ってから、重い三脚を自分の荷に移した。二人は初めて、互いを頼れる相手だと思えた。','{a}が機材より命を優先してほしいと言うと、{b}は記録こそが命綱だと譲らなかった。荷の山は二つに分かれ、見張りの交代も無言で済まされた。'],
['ally031','ally','sleuth','priest','save','obs','rite','宿の主人が差し出した御守りを、{b}は指先でつまんで眉をひそめた。紐の結び目が、死者に持たせる逆さ結びになっていた。','{a}は主人の話の矛盾から、今夜の寝床が狙われていると読んだ。{a}は「布団は空にしておく｜＝｜布団は空にしておきます」と言い、二人は押し入れで夜を明かした。逆さ結びを見たら、次も同じように逃げればいい。','寝床を移す前に、夜半の襖が開いた。二人は暗がりで鎌の柄に打たれ、痣だらけで窓から逃げた。忠告を軽く見た{a}と、強く言わなかった{b}の間に、気まずさが残った。'],
['ally032','ally','student','musician','save','explore','obs','夕方の分校跡で、{a}は村の子どもが口ずさむ数え歌を耳にした。{b}は、その旋律が途中で一音だけ半音下がることに気づいた。','半音下がる箇所の歌詞は、裏山の滝を指していた。二人は今夜そこへ近づかないと決め、遠くで同じ旋律が鳴れば、すぐに聞き分けられるようになった。','意味を確かめようと滝へ向かった二人は、濡れた岩で足を滑らせて沢へ落ちた。擦り傷だらけで這い上がりながら、言い出したのはどっちだと押し付け合った。'],
['ally033','ally','musician','streamer','death','obs','explore','撮れ高を求める{b}に付き合い、二人は夜の囃子の稽古場に忍び込んだ。カメラを回した瞬間、誰もいない太鼓が独りでに鳴り始めた。','{a}はその拍が村人を呼び寄せる合図だと気づき、鉦を叩いてわざと拍を乱した。{b}は「走って｜走れ｜走ってください」と叫び、二人は混乱する村人の間を駆け抜けた。','太鼓の音に合わせて現れた面の村人が、{v}の頭に撥を振り下ろした。{w}は倒れて動かない{v}を残し、回り続けるカメラだけを抱えて夜道を逃げた。'],
['ally034','ally','streamer','ponkotsu','death','explore','explore','生配信の同接を稼ごうと、{a}は{b}を連れて立入禁止の吊り橋へ向かった。{b}は、犯人はこの橋の向こうにいると根拠もなく言い張っていた。','渡りきる寸前に綱が切れたが、{b}が見当違いの方向へ飛び退いたおかげで、二人は偶然にも崖の木の根にしがみついた。コメント欄は、かつてないほど沸き立った。','橋の真ん中で綱が弾け、{v}は谷底へ落ちていった。手を伸ばした{w}のスマートフォンには、落ちていく瞬間の映像だけが残った。'],
['ally035','ally','student','ghost','clue','explore','spirit','{a}が若い村人から聞いた噂を頼りに、二人は分校跡の放送室に入った。{b}は電磁波計の針が勝手に振れるのを見つめていた。','針が最も振れたのは、壊れた放送機器の裏だった。{a}が身軽に棚へよじ登り、埃をかぶったテープの箱を取り出した。{a}「何か書いてある｜＝｜何か書いてあります」――','{a}は数値ばかり見ている{b}にしびれを切らし、{b}は勝手に動き回る{a}を咎めた。二人は口もきかず、別々に分校を出た。'],
['ally036','ally','journalist','priest','bond','talk','rite','早朝の参道を掃き清める{b}の手伝いを、{a}は自分から申し出た。竹箒の音だけが、霧の中に響いていた。','{a}は記事にしないと約束して、{b}が神職を継いだ理由を尋ねた。{b}は少し迷ってから、誰にも話したことのない家の話をした。掃き終える頃、二人は並んで朝日を見ていた。','{a}が神社の古い不祥事について口を滑らせると、{b}は箒の手を止めた。{b}は穢れを持ち込む人とは話したくないと告げ、背を向けた。'],
['ally038','ally','civ','celeb','bond','talk','talk','村人に囲まれてサインを求められていた{b}を、{a}は迷子の振りをして連れ出した。人のいない棚田の畦で、二人はようやく息をついた。','{b}は、有名になってから素顔のまま礼を言われたことがないと笑った。{a}がただの一人として話すうちに、{b}の表情は少しずつほどけていった。','{a}が思わず一緒に写真をと頼むと、{b}の顔から笑みが消えた。結局同じかと言わんばかりに、{b}は一人で村へ戻っていった。'],
['ally039','ally','psychic','doctor','clue','spirit','obs','廃診療所の病室で、{a}は寝台の上に誰かが横たわっていると言った。{b}は何もない寝台のシーツに、古い血の染みを見つけた。','{b}は染みの位置から、患者が手首を縛られていたと推し量った。{a}が気配のする枕の下を探ると、色褪せた紙片が出てきた。{a}「これを見せたかったんだ｜これを見せたかったのだ｜これを見せたかったんですね」――','{b}が幻覚の可能性を口にすると、{a}は見えないものを否定するなと声を荒らげた。病室の空気は冷えきり、二人は無言で外に出た。'],
['ally040','ally','civ','doctor','clue','talk','obs','村の薬屋で、{a}は持ち前の人の好さで店番の老人と世間話を始めた。その間に、{b}は棚に並ぶ薬瓶のラベルを一つずつ確かめていった。','老人がうっかり漏らした祭りの前に配る薬の話と、{b}が棚の奥で見つけた古い処方箋が噛み合った。二人は店を出るなり、物陰でその処方箋を広げた。――','世間話が長引くうちに、棚を探る{b}が老人に見とがめられた。追い出された二人は、話が下手だ、手際が悪いと言い合いになった。'],
['ally041','ally','civ','streamer','clue','talk','explore','{b}は配信のために、立入禁止の札がかかった廃屋の蔵へ踏み込んだ。止める間もなく、{a}も懐中電灯を手について行った。','{a}がつまずいて倒した長持の底板が外れ、中から古い写真の束がこぼれ出た。{b}はカメラを向けながら「撮れ高すぎる｜＝｜撮れ高すぎます」と呟いた。――','配信に夢中の{b}が物音を立て、蔵の外に提灯の明かりが集まった。二人は何も持ち出せずに逃げ帰り、{a}は二度と付き合わないと吐き捨てた。'],
['ally042','ally','civ','prof','rescue','talk','lore','{x}が連れ去られた先は、村外れの古寺の地下らしかった。{b}は寺の縁起から隠し通路の位置を推し量り、{a}はただの観光客を装って寺に入り込んだ。','{a}が住職を世間話で引き止め、{b}は須弥壇の裏の羽目板を外した。湿った階段の下で膝を抱えていた{x}を、二人は両脇から支えて外へ連れ出した。','{b}の推した羽目板はびくともせず、{a}の世間話も住職の不審を招いただけだった。追い出された二人は門前で口論になり、{x}を残した寺の鐘だけが鳴っていた。'],
['ally043','ally','doctor','priest','save','obs','rite','夜更け、{b}は宿の床の間に生けられた榊が、根元から黒く腐っているのに気づいた。同じ頃、{a}は自分の脈が少しずつ乱れているのを感じていた。','{b}は榊を外して塩で清め、{a}は自分の脈と呼吸から毒気の濃さを測った。{a}は「この匂いを覚えておく｜＝｜この匂いを覚えておきます」と言った。次に同じ匂いがしたら、二人はもうその部屋に入らない。','清めが終わる前に、二人とも喉を押さえて畳に崩れた。明け方まで吐き気に苦しんだ後、{a}は榊を見落とした{b}を、{b}は早く言わなかった{a}を、黙って恨んだ。'],
['ally044','ally','celeb','writer','death','talk','obs','公民館での歓迎会の最中、{b}は酒を注ぐ村人の手が震えていることに気づいた。上座に据えられた{a}の盃にだけ、別の徳利から酒が注がれていた。','{b}が目で合図すると、{a}は持ち前の話術で場を沸かせ、乾杯の盃をわざと取り落とした。どよめく村人の間を縫い、二人は裏口から夜の闇へ飛び出した。','合図が届く前に、{v}は盃を干していた。ほどなく{v}は喉を押さえて崩れ落ち、{w}は笑顔のまま凍りついた村人たちに背を向けて逃げ出した。'],
['ally045','ally','prof','prof','lose','lore','lore','二人の教授は、祠から持ち帰った木簡の拓本を囲炉裏端で見比べていた。そのとき、囲炉裏の火が不自然に高く燃え上がった。','{a}がとっさに拓本を懐に抱え込み、{b}が鉄瓶の湯を火に浴びせた。{b}は「若い頃の発掘を思い出す｜＝｜若い頃の発掘を思い出します」と笑い、二人は煤けた顔で拓本を広げ直した。','炎は拓本の端を舐め、瞬く間に灰へ変えた。{a}はなぜ火のそばに置いたのかと言い、{b}は先に広げたのはそちらだと返した。'],
['ally046','ally','civ','psychic','save','talk','spirit','夜の参道で、{b}は石灯籠の陰からこちらを覗く何かを見た。{a}には何も見えなかったが、なぜか石段が一段多い気がしてならなかった。','{b}は{a}の妙な勘を信じ、二人は段を数えながら降りた。一段多い段を飛び越えた瞬間、背後でそれが崩れて暗い穴が口を開けた。次からは、段を数えればいい。','二人は一段多い石段を踏み抜き、斜面を転げ落ちた。手首を挫いた{a}と額を切った{b}は、互いの曖昧な警告をなじり合い、ぎこちなく黙り込んだ。'],
['ally047','ally','occult','police','clue','lore','fight','村外れの崩れかけた祠の扉を、{b}は肩で押し開けた。{a}は懐中電灯を手に、奥の石壁に刻まれた模様を照らした。','{a}は模様が星辰の巡りを示す邪神の暦だと読み解き、{b}は石壁の一枚だけが動くことに気づいた。押し込むと、奥から油紙の包みが落ちてきた。{a}「これは……」――','{b}が力任せに押した石壁が崩れ、刻まれた暦の半分が砕けた。{a}は取り返しがつかないと嘆き、{b}は灯りを任せたのが間違いだったと言い返した。'],
['ally048','ally','writer','prof','lose','obs','lore','民宿の文机に、{a}が書き留めた村人の証言と、{b}の古文書の訳を挟んだ手帳が置いてあった。風もないのに、その頁がぱらぱらとめくれ始めた。','{a}は頁のめくれる順番の違和感に気づき、{b}は訳文の一節を唱えて手帳を押さえた。頁は静かに止まり、二人は今の出来事も一行ずつ書き足していった。','手帳は一瞬で真っ白になり、書いたはずの文字はどこにも残っていなかった。{b}はなぜ写しを取らなかったのかと責め、{a}は訳を挟んだのはそちらだと吐き捨てた。'],
['ally049','ally','occult','psychic','death','lore','spirit','夜の大鳥居をくぐった瞬間、空気が水のように重くなった。{b}には、参道の両脇に無数の何かが並び、こちらを見ているのが見えた。','{a}は、振り返らずに後ろ向きで鳥居を戻れば異界は閉じるという伝承を思い出した。{b}は「前だけ見て｜前だけ見ろ｜前だけ見てください」と言い、二人は手を繋いで鳥居を抜け出した。','参道に並ぶ何かが、一斉に{v}の方へ首を向けた。{v}の体は音もなく宙へ引き上げられ、{w}の目の前で闇に溶けて消えた。'],
['ally051','ally','muno','ghost','bond','explore','spirit','民宿の縁側で、{b}は壊れかけた温度計の配線を直していた。{a}は手伝うと言って工具箱をひっくり返し、ねじを床下に落とした。','床下に潜った{a}は、ねじと一緒に古い録音テープを見つけてきた。{b}「助かった、ありがとう｜助かった、礼を言う｜助かりました、ありがとうございます」二人は笑い、夜更けまで機材を並べて語り合った。','{a}が余計に触った計器は火花を散らし、{b}の録画データは丸ごと消えた。{b}は黙って機材を片づけ、それきり{a}と目を合わせなかった。'],
['ally052','ally','psychic','police','bond','spirit','fight','夜明け前の駐在所跡で、{b}は錆びた警棒を握って見張りに立っていた。{a}はその背後に、ずっと何かが立っているのを見ていた。','{a}が見えているものを打ち明けると、{b}は笑わずに頷き、背中を預けると言った。二人は互いの死角を補う約束をし、夜が明けるまで並んで座った。','{b}は職業柄の癖で{a}の話を疑い、根拠を問いただした。答えに詰まる{a}を見て、{b}は肩をすくめた。二人の間に冷たい溝ができた。'],
['ally053','ally','muno','priest','bond','explore','rite','村外れの小さな社で、{b}は清めの塩を撒き、手早く結界を張っていた。{a}は手伝おうとして、榊の枝を逆さに供えてしまった。','{b}は怒らずに枝を直し、作法を一つずつ教えた。{a}「次はちゃんとやる｜＝｜次はちゃんとやります」不器用な手つきで玉串を捧げる{a}を、{b}は目を細めて見守った。','慌てた{a}が御神酒の瓶を倒し、張ったばかりの結界は濡れて崩れた。{b}は深いため息をつき、もう社に近づかないでほしいと告げた。'],
['ally054','ally','prof','ponkotsu','clue','lore','explore','公民館の書庫で、{a}は虫食いだらけの村史を広げた。{b}は隣で、犯人はこの村史の著者だと根拠もなく断言していた。','{b}が的外れに指さした奥付の印影を、{a}は念のため拡大鏡で覗いた。それは村の祠に刻まれた紋と同じ形をしていた。――','{b}の推理にいちいち口を挟まれ、{a}はとうとう本を閉じた。{b}は学者には想像力が足りないとこぼし、二人は別々に書庫を出た。'],
['ally055','ally','celeb','sleuth','death','talk','obs','祭りの宴席で、{a}の顔を知る村人たちが次々と酒を注ぎに来た。{b}は盃の縁に残る白い粉に気づき、眉をひそめた。','{b}「飲まないで｜飲むな｜飲まないでください」{a}は咄嗟に盃を取り落とし、愛想笑いで席を立った。二人は手洗いを装って裏口から抜け出し、夜の田んぼを駆けた。','{w}が止める間もなく、{v}は勧められるまま盃を干していた。{v}は笑顔のまま膳に突っ伏し、二度と起き上がらなかった。{w}は宴の喧騒にまぎれて逃げた。'],
['ally056','ally','psychic','seer','death','spirit','spirit','深夜の沼のほとりで、{a}は水面に無数の手が浮かぶのを見た。同じ頃、{b}の札は三度続けて水の象徴を示していた。','{b}が示した方角へ、{a}は霊の気配の薄い道を選んで走った。伸びてくる手を振り切り、二人は泥まみれで沼の外の石垣にたどり着いた。','逃げ道を迷ううちに、足元の泥が崩れた。{v}は水中から伸びた手に足首をつかまれ、声もなく沈んでいった。{w}は岸に這い上がり、震えながら水面を見つめた。'],
['ally057','ally','civ','journalist','clue','talk','talk','朝の雑貨屋で、{a}は店番の老人と天気の話をしていた。{b}はその横で手帳を開き、老人の言葉を一つも聞き漏らすまいとしていた。','老人がふと口を滑らせた昔の祭りの話を、{b}はすかさず掘り下げた。{a}の人懐っこさに気を許した老人は、店の奥から古い写真を出してきた。――','{b}の質問が鋭すぎて、老人は急に口を閉ざし店を閉めた。{a}「聞き方がきつすぎる｜＝｜聞き方がきつすぎます」{b}は言い返し、二人は気まずく店先で別れた。'],
['ally058','ally','student','folk','bond','explore','lore','昼下がりの棚田のあぜ道で、{a}は村の子どもたちに教わった数え歌を{b}に歌って聞かせた。{b}は歌詞を書き取りながら、何度も聞き返した。','歌に隠された意味を{b}が丁寧に解き明かすと、{a}の目が輝いた。{b}もまた、若い感性の鋭さに舌を巻いた。二人は師と教え子のような絆で結ばれた。','{b}は解釈に夢中になり、{a}の話を途中で遮ってばかりいた。子ども扱いされたと感じた{a}は、黙ってあぜ道を引き返していった。'],
['ally060','ally','occult','musician','clue','lore','obs','夕暮れの神社で祭囃子の稽古が始まった。{b}は笛の旋律に一音だけ外れた音が混じるのに気づき、{a}を呼び寄せた。','{a}はその外れた音が、古い邪神の召喚譚に記された音階と一致することに気づいた。二人は稽古場の裏で、囃子の譜面を書き写した。――','{a}が伝承の講釈を始めて止まらず、{b}は肝心の音を聞き逃した。お互いに相手のせいだと責め、二人は口をきかなくなった。'],
['ally062','ally','celeb','folk','bond','talk','lore','村長の屋敷に招かれた{a}は、{b}を付き人として同席させた。床の間の掛け軸を前に、{b}は村長の説明の嘘を小声で{a}に伝えた。','{a}は顔色ひとつ変えず、{b}の指摘を世間話に混ぜて村長に返した。屋敷を出たあと、二人は互いの機転を讃え合い、深く頷き合った。','{a}が{b}の話を大げさに持ち上げたせいで、村長の機嫌を損ねた。{b}は名声のために利用されたと感じ、{a}への信頼を失った。'],
['ally063','ally','manager','folk','bond','fight','lore','古い社務所の囲炉裏端で、{b}は調べた禁忌を夜通し書き出していた。{a}は黙って湯を沸かし、冷えた{b}の肩に上着をかけた。','{b}は筆を止め、自分の研究のせいで皆を危険に巻き込んだと打ち明けた。{a}「最後まで守る｜＝｜最後まで守ります」その一言に、{b}は初めて肩の力を抜いた。','{a}が休むよう何度も言うと、{b}は邪魔をしないでほしいと突っぱねた。{a}は上着を拾い上げ、静かに囲炉裏端を離れた。'],
['ally064','ally','seer','prof','death','spirit','lore','山中の洞窟で、{b}は壁に刻まれた古文字を夢中で写していた。{a}の水晶玉には、崩れ落ちる天井の影がはっきりと映った。','{a}が{b}の袖を引いて走り出した直後、天井が轟音とともに崩れた。土煙の中から転がり出た二人は、写しの紙を握りしめたまま息を整えた。','{w}が叫んだときには遅かった。崩れた岩が洞窟の奥をふさぎ、{v}は写しかけの古文字とともに埋もれた。{w}は土煙の中、ひとりで出口へ這い出した。'],
['ally066','ally','celeb','seer','death','talk','spirit','夜の参道で、{a}に気づいた村人たちが歓声を上げて集まってきた。{b}は札を一枚めくり、顔色を変えた。','{a}はサインを書くふりをして人垣を引きつけ、{b}の示した脇道へ目配せした。二人は灯籠を倒して道をふさぎ、杉林の闇へ逃げ込んだ。','人垣は笑顔のまま輪を狭め、気づけば鎌が光っていた。{v}は群衆に呑まれて引きずり倒され、そのまま動かなくなった。{w}は灯籠の陰を這って逃げた。'],
['ally067','ally','writer','occult','save','obs','lore','民宿の部屋で、{a}は床の間の掛け軸が昨日と違う絵に変わっていることに気づいた。描かれた人影は、ちょうど二人分だった。','{b}は絵が生贄の目印を描く呪いだと見抜いた。{a}「なら、書き換えればいい｜＝｜なら、書き換えればいいんです」{a}が墨で人影を塗りつぶすと、廊下の足音は遠ざかった。次は分かる。','掛け軸を外すのに手間取るうちに、夜半の襖が音もなく開いた。二人は鎌の刃を腕で受けて窓から転がり出たが、互いの判断の遅さを責め合った。'],
['ally068','ally','muno','ponkotsu','bond','explore','explore','昼の公民館で、{b}は村長が犯人だという推理を{a}に熱弁した。{a}は感心して頷き、勝手に証拠探しを買って出て、湯呑みを三つ割った。','割れた湯呑みの底には、偶然にも同じ印が刻まれていた。二人は大はしゃぎで互いを最高の相棒だと褒めちぎった。根拠は相変わらず何もなかった。','弁償を迫られた二人は、どちらが悪いかで延々と言い争った。{b}は{a}を助手失格と言い放ち、{a}はふくれて部屋を出ていった。'],
['ally069','ally','doctor','sleuth','clue','obs','obs','診療所跡の薄暗い診察室で、{a}は古いカルテの束をめくっていた。{b}は、同じ日付の死亡記録が毎年ひとつずつあることに目を留めた。','{a}は死因の欄がすべて同じ筆跡で書き換えられていることに気づいた。{b}「医者の字じゃない｜医者の字ではない｜医者の字ではありません」二人はカルテの余白の走り書きを読んだ。――','{b}が記録の矛盾を指摘するたび、{a}は医学的にあり得ると反論した。どちらも譲らず、二人は苛立ったままカルテを棚に戻した。'],
['ally070','ally','celeb','doctor','clue','talk','obs','村の寄合所で、{a}の顔を見た老人が急に青ざめて倒れた。{b}が脈を取るあいだ、{a}は集まった村人たちを落ち着かせた。','意識を取り戻した老人は、手当ての礼にと、二人にだけ聞こえる声で秘密を囁いた。{b}は脈を診る手を止め、{a}と目を見交わした。――','処置の最中、{a}が村人に愛想を振りまくせいで人垣が崩れなかった。{b}は治療の邪魔だと怒鳴り、{a}は面目をつぶされたと腹を立てた。'],
['ally072','ally','civ','sleuth','bond','talk','obs','朝霧の残る川べりで、{a}は{b}に、なぜこの村に来たのかと訊かれた。{a}は道に迷っただけだと答え、{b}はその目をじっと見た。','嘘のない目だと{b}は笑い、自分は昔の依頼人を探しに来たのだと打ち明けた。{a}は黙って聞き、二人は霧が晴れるまで並んで川に石を投げた。','{b}は職業柄、{a}の答えの細かな矛盾を問い詰め続けた。疑われていると知った{a}は傷つき、もう話すことはないと背を向けた。'],
['ally073','ally','seer','musician','lose','spirit','obs','雨の夕方、民宿に置いた録音機が勝手に再生を始めた。{b}が録った祭囃子に、聞いたことのない声が混じっていた。{a}の札が逆さに落ちた。','{a}の札が示すまま、{b}は録音機をギターケースに収めて蓋を閉じた。声は静まり、テープは無事だった。{b}「助けられた｜＝｜助けられました」二人は肩を寄せて夜を越した。','声が高まるにつれ、テープは煙を上げて溶けていった。{b}は{a}がもっと早く言えば守れたと責め、{a}は録るべきではなかったと言い返した。'],
['ally074','ally','journalist','psychic','lose','talk','spirit','夜更けの囲炉裏端で{a}が撮りためた写真を整理していると、{b}が手を止めさせた。写真の村人の顔が、一枚ずつ黒く塗りつぶされていた。','{b}が写真に宿ったものを言い当て、{a}はそれを一枚ずつ塩で包んで封をした。黒い染みは止まり、二人は互いの手の冷たさを笑い合った。','手をこまねくうちに、写真の束は青い炎を上げて燃え尽きた。{a}は見えるなら止めてくれと詰め寄り、{b}は欲張って撮るからだと吐き捨てた。'],
['ally075','ally','manager','musician','clue','fight','obs','宵宮の太鼓が響く広場で、{b}はある拍だけ太鼓が叩かれていないことに気づいた。{a}は人混みから{b}をかばいつつ、櫓のそばまで連れて行った。','{a}が村人の肩を押し分けて道を作り、{b}は櫓の下に耳を寄せた。{b}「ここで数を数えてる｜ここで数を数えている｜ここで数を数えています」叩かれない拍の数が、ある言葉を示していた。――','人波に押され、{a}は{b}の手を離してしまった。音を聞き逃した{b}は守り方が下手だと苛立ち、{a}は勝手に動くからだと言い返した。'],
['ally076','ally','police','streamer','death','fight','explore','深夜、{b}は撮れ高を求めて立入禁止の吊り橋を渡り始めた。止めに追ってきた{a}の背後で、斧を持った村人が綱に刃を当てた。','{a}は振り向きざまに村人の腕をねじり上げ、{b}を対岸へ押しやった。切れた綱が谷に垂れるのと同時に、二人は向こう岸の土に転がり込んだ。','綱が弾ける音がして、吊り橋は大きく傾いた。{v}は板ごと谷底へ投げ出され、闇に吸い込まれていった。{w}は残った綱にしがみつき、落ちていく灯りを見ていた。'],
['ally077','ally','celeb','sleuth','bond','talk','obs','夕暮れの鳥居の下で、{a}は自分の名声がこの村では呪いのように働いていると漏らした。{b}は煙草をもみ消し、黙って続きを待った。','{b}は{a}の言葉の端々から、本当は誰より怯えていることを見抜いた。{b}「ここでは、ただの人でいい｜＝｜ここでは、ただの人でいいんです」{a}は肩書きを脱いだ顔で笑った。','{b}は{a}の話を有名人の自己憐憫だと切り捨てた。{a}は顔をこわばらせ、探偵に何が分かると言い捨てて鳥居をくぐっていった。'],
['ally078','ally','manager','seer','death','fight','spirit','午前二時、{b}は悲鳴とともに目を覚まし、炎の幻を見たと告げた。その直後、民宿の廊下の向こうから焦げた匂いが流れてきた。','{a}は濡らした布団を{b}の頭からかぶせ、煙の中を先に立って進んだ。二人は雨戸を割って裏庭へ転がり出て、燃え落ちる民宿を振り返った。','煙の中で二人ははぐれた。{w}が裏庭へ這い出したとき、{v}はまだ炎の向こうにいて、梁の崩れ落ちる音がした。それきり{v}の声は聞こえなかった。'],
['ally079','ally','musician','priest','clue','obs','rite','早朝の神楽殿で、{b}は奉納用の古い神楽鈴を手入れしていた。{a}は鈴の一つだけが、ほかと違う高さで鳴ることに気づいた。','{b}が作法どおりに鈴を外して中を改めると、小さく畳んだ紙が詰められていた。{a}「音が変だったのは、これか｜＝｜音が変だったのは、これでしたか」二人は紙を慎重に広げた。――','{a}が鈴を鳴らして確かめようとすると、{b}は神具を軽々しく扱うなと止めた。言い合いの末、二人は鈴を戻して別々に神楽殿を去った。'],
['ally080','ally','civ','writer','lose','talk','obs','夜の渡し舟で沼を渡る途中、{b}は水面に映る舟の影に、乗っていないはずの三人目の頭があることに気づいた。取材ノートを抱えた{a}も、なぜか嫌な予感に身を縮めた。','{b}の囁きで{a}がノートを懐へ押し込んだ直後、水面から伸びた手が舟べりを探った。{a}の強運か、手は空をつかんで沈んだ。二人は対岸で震えながら笑い合った。','{b}が影のことを告げる前に、舟が大きく揺れた。ノートは{a}の腕から滑り落ちて沼に沈んだ。{b}はなぜしっかり持っていなかったと責め、{a}は気づいたなら早く言えと言い返した。'],
['ally081','ally','civ','civ','bond','talk','talk','昼間の無人駅のベンチで、{a}と{b}は来るはずのない列車を待っていた。どちらも、巻き込まれただけのただの旅行者だった。','二人は好きな食べ物や帰ったらしたいことを語り合い、少しだけ笑った。{a}「帰ったら一緒に何か食べよう｜＝｜帰ったら一緒に何か食べましょう」{b}は小指を差し出し、約束を交わした。','不安が募るにつれ、二人の会話はとげとげしくなった。どちらがこの村に誘ったのかで言い争いになり、{b}はベンチを立って線路沿いを歩き去った。'],
['ally082','ally','muno','streamer','save','explore','explore','夕暮れの廃神社で、{b}は配信を回しながら奥の本殿へ向かった。後ろをついてきた{a}は石段の苔で滑り、足元に張られた細い糸に気づいた。','{a}が転んだはずみで糸を切ると、頭上から丸太が空振りに落ちた。罠の仕掛けをカメラに収めた{b}は、次は分かると不敵に笑った。','糸を指さす{a}の説明は要領を得ず、{b}は配信に夢中で聞き流した。落ちてきた丸太がかすめて二人とも腕を傷め、互いに相手のせいだと黙り込んだ。'],
['ally083','ally','muno','folk','clue','explore','lore','午後の郷土資料館で、{b}は展示ケースの古い面を調べていた。{a}は退屈そうに館内をうろつき、隅の掃除用具入れを勝手に開けた。','用具入れの奥には、展示から外された面がもう一つ隠されていた。{b}「これは、見せてはいけない面だ｜＝｜これは、見せてはいけない面です」面の裏には墨で文字が書かれていた。――','{a}が倒したモップが展示ケースにぶつかり、警報が鳴り響いた。管理人に追い出された{b}は、{a}を連れてきたことを本気で後悔した。'],
['ally084','ally','civ','police','save','talk','fight','夜の農道で、{a}は理由もなく足を止めた。前方の田んぼの稲が、風もないのに一列だけ揺れていた。{b}は警棒に手をかけた。','{a}の勘を信じた{b}は道を外れ、二人は用水路沿いに迂回した。稲の陰から鎌を持った村人が現れ、空の道を見回した。待ち伏せの手口は覚えた。','{b}は確かめに行こうとし、{a}は止めきれなかった。飛び出した村人の鎌に二人とも浅く切られ、{b}は{a}の弱気を、{a}は{b}の無鉄砲を恨んだ。'],
['ally085','ally','occult','streamer','bond','lore','explore','深夜の鳥居の前で、{b}は配信を切り、カメラを膝に置いた。{a}は持参した魔除けの護符を一枚、{b}の手に握らせた。','{b}は、本当は怖くて撮り続けているのだと打ち明けた。{a}「怖いと分かるのは才能だ｜＝｜怖いと分かるのは才能です」{b}は護符を内ポケットにしまい、二人は並んで夜明けを待った。','{b}は護符を眺め、こんなものは撮れ高にもならないと笑い飛ばした。{a}は黙って護符を取り返し、何も言わずに鳥居をくぐった。'],
['ally086','ally','manager','occult','save','fight','lore','昼過ぎの裏山で、{b}は道沿いの地蔵がすべてこちらに背を向けていることに気づいた。伝承では、それは生贄を招く道しるべだった。','{b}の言葉に{a}は即座に引き返しを決め、{b}の荷まで担いで別の尾根道を選んだ。背後の谷で村人たちの網が空を切った。次は地蔵の向きで分かる。','迷ううちに、藪から村人たちの網が投げかけられた。{a}は{b}をかばって網を切り裂いたが、二人とも擦り傷だらけになり、決断の遅れを責め合った。'],
['ally087','ally','police','ponkotsu','clue','fight','explore','雨上がりの駐在所跡で、{b}は床の足跡を見て、犯人は片足で跳ねる何かだと断言した。{a}は呆れつつも、念のため戸棚をこじ開けた。','戸棚には先代の駐在が残した業務日誌があった。{b}「ほら、推理どおり｜ほら、推理どおりだ｜ほら、推理どおりです」何一つ当たっていなかったが、{a}は黙って日誌の最後の頁を開いた。――','{b}の推理を真に受けた{a}は、足跡を追って村中を走り回らされた。何も見つからず、{a}は二度と付き合わないと言い捨てた。'],
['ally089','ally','civ','sleuth','rescue','talk','obs','夜祭りの最中、{x}の姿が消えた。{b}は残された下駄の向きから行き先を推理し、{a}は屋台の老婆に愛想よく話しかけて抜け道を聞き出した。','二人は抜け道の先の蔵に忍び込み、縄で縛られた{x}を見つけた。{b}「急いで｜急げ｜急いでください」{a}が縄をほどき、三人は祭囃子にまぎれて蔵を抜け出した。','聞き出した抜け道は村人の嘘で、二人は行き止まりの崖に出た。{b}は{a}が騙されやすいからだと責め、{a}は推理が外れたせいだと言い返した。'],
['ally090','ally','ghost','streamer','save','spirit','explore','夜の洞窟の入口で、{a}の電磁波計が一斉に振り切れた。{b}は同接の伸びに気をよくして、カメラのライトを点けたまま奥へ進もうとしていた。','{a}は{b}の襟首をつかんでライトを消させ、計器の反応が薄い岩陰に二人で身を伏せた。直後、奥から無数の松明が通り過ぎた。この数値の意味は、もう忘れない。','引き戻すのが一瞬遅れ、ライトに気づいた村人たちに二人は石を投げつけられた。血を流して逃げ延びたが、配信を優先した{b}と、それを責める{a}は口もきかなかった。'],
['ally091','ally','celeb','musician','lose','talk','obs','昼の公民館で、{a}は村人の取り巻きに囲まれていた。その隙に、{b}が録音した祭囃子のテープを、村の子どもが持ち去ろうとしていた。','{a}はにこやかに子どもを呼び止め、サインと引き換えにテープを取り戻した。{b}「助かった、借りができた｜＝｜助かりました、借りができましたね」二人は廊下の陰で小さく拳を合わせた。','{a}は取り巻きに捕まって動けず、{b}が追ったときには子どもは田んぼの向こうに消えていた。{b}は役立たずと詰り、{a}は見張りを怠った{b}を責めた。'],
['ally092','ally','writer','musician','bond','obs','obs','夜更けの縁側で、{b}はギターの弦をつま弾き、{a}はその旋律に合わせて手帳に詩のような言葉を書きつけていた。','書き上がった言葉に{b}が曲をつけると、二人の歌がひとつになった。不穏な村の夜のなかで、その歌だけが確かなものに思え、二人は微笑み合った。','{b}が旋律を合わせようとすると、{a}は詩が安っぽくなると言った。{b}は弦を弾く手を止め、それきりギターをケースにしまった。'],
['ally093','ally','journalist','muno','bond','talk','explore','昼下がりの茶店で、{a}は聞き込みのこつを{b}に教えていた。{b}は熱心に頷き、さっそく店主に、邪神の信者なのかと真正面から尋ねた。','店主は大笑いし、{b}の正直さを気に入って団子をおまけした。{a}「あれも才能だ｜＝｜あれも才能です」{a}は手帳を閉じ、二人は団子を分け合いながら村道を歩いた。','店主は顔色を変え、二人は茶店を追い出された。{a}は取材先を潰されたと怒り、{b}は教え方が悪いとすねて、互いに目を合わせなかった。'],
['ally094','ally','writer','manager','lose','obs','fight','夕暮れの山道で、{a}は手がかりを書き留めた原稿の束を抱えていた。ふと、背後の子どもの笑い声が、寸分違わぬ節回しで繰り返されていることに{a}は気づいた。','{a}がそれを告げるより早く、{b}は{a}を背にかばい、杉林から飛び出した小さな影を払いのけた。原稿は一枚も欠けず、{a}は守られた背中の温かさを忘れまいと思った。','違和感を言葉にできずにいるうちに、小さな影が原稿の束をひったくり杉林へ消えた。{a}はなぜ守ってくれなかったと嘆き、{b}は気づいていたなら言えと返した。'],
['ally095','ally','writer','ghost','rescue','obs','spirit','明け方、{x}が布団ごと消えていた。{a}は畳に残った奇妙な擦れ跡に、{b}は記録カメラに映った白い影に、それぞれ行き先の手がかりを見た。','擦れ跡と影は同じ古井戸へ向かっていた。{b}が赤外線で井戸の底を照らすと、{a}「いた｜＝｜いました」縄梯子を下ろした二人は、ぐったりした{x}を引き上げた。','二人の読みは食い違い、{a}は井戸へ、{b}は裏山へ行くべきだと譲らなかった。言い争ううちに夜が明け、{x}の痕跡は消えていた。'],
['ally096','ally','musician','ponkotsu','rescue','obs','explore','夜、遠くの山から鈴の音が聞こえ、{x}が姿を消していた。{a}は音の方角を聞き分け、{b}は勝手に犯人は狸だと決めつけた。','狸の巣を探す{b}が偶然見つけた獣道は、{a}が聞き分けた方角と重なっていた。二人は祠の裏で縛られた{x}を見つけ、縄を解いて連れ帰った。','{b}は狸の足跡を追って逆の方向へ突き進み、{a}もそれに引きずられた。鈴の音が消えた頃、二人は互いの判断を罵り合っていた。'],
['ally097','ally','student','police','clue','explore','fight','夕方の河原で、{a}は村の若者たちと石切りをしていた。{b}は少し離れた土手から、若者たちが何かを隠すように視線を交わすのを見ていた。','{b}は人目のない橋の下で、{a}と打ち解けた若者を守ると約束した。{b}「誰にも言わない｜＝｜誰にも言いません」若者は震える手で、川底から拾ったものを差し出した。――','{b}が近づいた途端、若者たちは駐在の顔を見て散り散りに逃げた。{a}は台無しにされたと怒り、{b}は危ない連中と遊ぶなと叱った。'],
['ally098','ally','journalist','student','clue','talk','explore','夜の公民館で青年団の集まりが開かれていた。{b}は若い村人に混じって座布団を並べ、{a}は外の窓の下で手帳を構えていた。','{b}がさりげなく話を祭りの段取りへ向けると、青年団長がうっかり今年の日取りを漏らした。窓の下で{a}はその言葉を一字残らず書き留めた。――','{a}の手帳がガラスに当たって音を立て、{b}は盗み聞きの片棒を担いだと疑われた。外へ逃げ出した{b}は、{a}の不注意を激しく責めた。'],
['ally099','ally','journalist','folk','clue','talk','lore','雨の午後、二人は村の寺で過去帳を見せてもらった。{a}が住職の相手をするあいだ、{b}は戒名の並びに目を走らせた。','{b}は、ある年だけ戒名に同じ一文字が使われていることに気づき、{a}は住職を言いくるめて写しの許可を得た。{b}「この字は神の名だ｜＝｜この字は神の名です」――','{a}の質問が踏み込みすぎて住職が機嫌を損ね、過去帳はすぐに閉じられた。{b}は機会を潰されたと嘆き、{a}は文句ばかりだと突き放した。'],
['foe002','foe','celeb','sleuth','bond','talk','obs','公民館の縁側で、{b}は{a}の袖口の染みや指輪の跡から、過去の不祥事を一つずつ言い当てた。{a}は扇子を閉じ、黙って聞いていた。','数え終えた{b}に、{a}は村人から聞き出した噂を三つ教えた。どれも{b}の推理の穴を埋めるものだった。二人は初めて同じ方向を見た。','{a}は扇子で{b}の手帳を払い落とし、この村で顔が利くのは誰か思い知らせると言い捨てた。翌朝から、村人は{b}にだけ口を閉ざした。'],
['foe003','foe','ponkotsu','ponkotsu','save','explore','explore','夕暮れの棚田で、二人のポンコツ探偵はどちらが先に犯人を当てるかで張り合っていた。足元の畦道に、真新しい縄の輪が隠れていた。','{a}が的外れな推理を叫んで飛び退いた拍子に、{b}も釣られて跳ね、罠は空を切った。{b}は「計算どおり｜計算どおりだ｜計算どおりです」と言い張った。次の罠の場所も、なぜか二人には見当がついていた。','二人は同時に罠を指さし、同時に踏み込んだ。縄に足を取られて泥田に転がり、擦り傷だらけのまま互いの推理を罵り合った。'],
['foe005','foe','journalist','journalist','death','talk','talk','同じ特ダネを追う二人の記者は、夜の沼のほとりで鉢合わせた。背後の葦原から、提灯を持たない村人たちが音もなく現れた。','{a}は「右の桟橋｜右の桟橋だ｜右の桟橋です」と囁いた。二人は同時に駆け出し、朽ちた小舟で沼を渡り切った。岸に上がっても、互いのメモ帳だけは離さなかった。','桟橋が軋んで割れ、{v}は泥の底へ引きずり込まれたまま浮かんでこなかった。伸ばした{w}の手には、{v}の取材手帳だけが残った。'],
['foe007','foe','seer','ponkotsu','lose','spirit','explore','犯人は用水路に証拠を捨てたはずだと言い張り、{b}が手がかりの写しの封筒を勝手に持ち出した。{a}がめくったタロットには、水の札が逆さまに出ていた。','用水路へ駆けた{a}は、封筒を落としかけた{b}の襟首を掴んだ。{b}は「囮のつもりだった｜＝｜囮のつもりでした」と言い張り、{a}は呆れながらも少し笑った。','{a}の警告より先に、{b}は用水路で足を滑らせた。封筒は流れに呑まれ、二人は占いのせいだ、推理のせいだと責め合った。'],
['foe008','foe','writer','writer','bond','obs','obs','古民家の囲炉裏端で、二人の作家は互いの代表作をこき下ろし合っていた。夜更けの座敷に、薪のはぜる音だけが響いた。','やがて{a}は、この村の違和感を書き留めた手帳を差し出した。{b}も黙って自分の手帳を重ねた。二人の書いた一行は、同じ場面を描いていた。','{b}は{a}の手帳を盗み見て、陳腐な比喩だと鼻で笑った。{a}は手帳を囲炉裏にくべ、二度と口をきかないと決めた。'],
['foe009','foe','manager','sleuth','bond','fight','obs','蔵の前で見張りを交代するとき、{a}は{b}が仲間を駒のように扱うことを責めた。{b}は眉ひとつ動かさなかった。','{b}は「守る役が要る｜＝｜守る役が要ります」と短く言った。推理の陰で{a}の働きをずっと勘定に入れていたのだと分かり、{a}は握った拳をほどいた。','{b}は仲間の名を並べ、誰が先に消えれば効率がいいかを淡々と語った。{a}はその頬を張り、見張りを放り出して去った。'],
['foe010','foe','manager','psychic','bond','fight','spirit','霊が見えると言っては仲間を怯えさせる{b}を、{a}は鳥居の下に呼び出した。夜風に、千切れた紙垂が揺れていた。','{b}は、見えたものを黙っていたら誰かが死んでいたと打ち明けた。{a}は長く考え、これからは先に自分に伝えてほしいと頼んだ。二人は初めて同じ側に立った。','怯えさせるなと詰め寄る{a}の背後を見つめ、{b}はそこにいるものの名を告げた。{a}は青ざめ、二度と{b}に近づかなかった。'],
['foe011','foe','psychic','doctor','death','spirit','obs','診療所跡の地下で、{a}は{b}に引き返せと迫った。{b}が非科学的だと言い返したそのとき、闇の奥から濡れた足音が近づいてきた。','{a}は「左は駄目｜左は駄目だ｜左は駄目です」と叫んだ。{b}は迷わず右の通路へ走り、地上で転んで脚を裂いた{a}を手早く止血した。二人は息を切らしたまま互いを見た。','足音の主は、{v}の喉に白い指をかけた。{w}が脈を探ったときには、{v}はもう冷たくなっていた。'],
['foe012','foe','writer','sleuth','lose','obs','obs','夜半、二人で書き写した古文書の写しが、民宿の部屋から消えていた。{a}は{b}を疑い、{b}は{a}を疑った。','{a}は畳に残る煤の匂いに違和感を覚え、{b}は縁側の小さな泥の足跡から犯人の背丈を割り出した。裏庭で写しを抱えた村の子を見つけ、二人は気まずく礼を言い合った。','疑い合って時間を潰すうちに、裏庭から煙が上がった。写しは焚き火の中で灰になり、二人は相手が見張っていればとなじり合った。'],
['foe013','foe','journalist','police','rescue','talk','fight','{x}が神輿蔵に連れ込まれたと聞き、{a}と{b}は渋々同じ路地を走った。{b}は取材など邪魔だと吐き捨てた。','{a}が記者を名乗って蔵番の気を引く間に、{b}が裏戸を蹴破った。{b}は「助かった｜＝｜助かりました」とだけ言い、{x}を背負って走った。','{a}がシャッターを切った音で、蔵番が振り向いた。{x}は奥へ運び去られ、二人は互いの軽率さをなじり合った。'],
['foe014','foe','ghost','priest','clue','spirit','rite','本殿の裏で、{a}は電磁波計を振りかざした。{b}は神域を機械で汚すなと袖を払ったが、針は大きく振れていた。','{b}が作法どおりに柏手を打つと、計器の針がぴたりと一点を指した。床板の下から、油紙に包まれた帳面が出てきた。――','針の示す床板を剥がそうとする{a}を、{b}が力ずくで止めた。揉み合ううちに計器は壊れ、二人は境内の端と端で夜を明かした。'],
['foe015','foe','muno','student','death','explore','explore','洞窟の奥で、{b}は足手まといの{a}を置いて先へ進もうとした。追いすがった{a}が踏んだ石が崩れ、二人の下で闇がぱっくりと口を開けた。','{b}は身軽に岩棚へ跳び、{a}の手首を掴んで引き上げた。{a}は「重くてごめん｜重くてすまない｜重くてすみません」と情けなく呟き、{b}は思わず吹き出した。','{w}が岩棚にしがみついたとき、{v}の姿はもう闇の底に消えていた。遠くで何かが落ちる鈍い音が一度だけして、それきりだった。'],
['foe016','foe','celeb','ghost','bond','talk','spirit','録音機材を広げる{b}に、{a}は撮影の許可を取れと高圧的に言った。廃校の教室で、二人は互いの肩書きを鼻で笑い合っていた。','再生した録音に、{a}の名を呼ぶ子どもの声が入っていた。震える{a}の肩に、{b}は黙って上着を掛けた。その夜、二人は初めて背中を預け合った。','{a}は機材を顎で示し、こんな玩具で何が分かると笑った。{b}は録れていた{a}の陰口を村中に流し、二人の溝は決定的になった。'],
['foe017','foe','occult','seer','clue','lore','spirit','古井戸の縁で、{a}は伝承の書を開き、{b}は水晶玉を覗いた。どちらの読みが正しいか、二人は一歩も譲らなかった。','書の挿絵と水晶に映った影が、同じ形をしていた。{b}は「認めたくないけど｜認めたくはないが｜認めたくないですけど」と言い、井戸の石組みの一つを指さした。――','互いの読みを嘲り合ううちに、水晶玉が縁から転げ落ちた。井戸の底で割れる音がして、二人は口もきかずに別れた。'],
['foe018','foe','civ','celeb','bond','talk','talk','村の駄菓子屋の軒先で、{b}は{a}を付き人のように扱い、荷物を押しつけた。{a}は黙ってラムネの瓶を握りしめていた。','{a}が村人の前で{b}をかばって嘘をついたと知り、{b}は荷物を自分で持った。帰り道、二人の歩幅は少しだけ揃っていた。','{a}は荷物を道に投げ出し、有名人ごっこはもう沢山だと言い放った。{b}はそれきり、{a}の存在をないものとして扱った。'],
['foe019','foe','muno','sleuth','clue','explore','obs','村長宅の書斎に忍び込んだ{b}の後ろを、{a}が勝手についてきた。{b}は帰れと目で示したが、{a}はもう本棚を漁っていた。','{a}が本棚ごと倒しかけた拍子に、壁の隠し戸棚が開いた。{b}は「偶然にしては上出来｜偶然にしては上出来だ｜偶然にしては上出来です」と呟いた。――','{a}が花瓶を割った音で、家人が駆けつけた。{b}は{a}を置いて窓から逃げ、二人の溝はさらに深まった。'],
['foe020','foe','prof','folk','save','lore','lore','夜の参道で、{a}と{b}は鳥居の数え方をめぐって学説をぶつけ合っていた。ふと、石灯籠の火がすべて逆向きに揺れていることに気づいた。','二人は別々の知識から、同じ結論にたどり着いた。逆さの火は生贄を迎える合図だった。脇道へ抜けた二人は、次にこの火を見ればすぐ分かると確かめ合った。','どちらの説が正しいかで足を止めた隙に、灯籠の陰から鎌が振り下ろされた。二人とも腕を裂かれて逃げ延び、手当ての間も目を合わせなかった。'],
['foe021','foe','occult','ghost','lose','lore','spirit','祠で録った怪音のテープと伝承の書き付けが、同じ鞄に入っていた。夜の渡り廊下で、その鞄がひとりでに重くなった。','{a}が護符を貼り、{b}が録音を逆回しにかけると、重さは嘘のように消えた。{b}は「今のは貸し｜今のは貸しだ｜今のは貸しです」と言い、{a}は苦笑して鞄の片側を持った。','鞄の口から黒い水が溢れ、書き付けもテープも溶けるように消えた。二人は相手の迷信と機械のせいだと責め合った。'],
['foe022','foe','civ','occult','bond','talk','lore','蔵の二階で、{b}は邪神の系譜を得意げに語り、素人は黙っていろとばかりに{a}を見下した。{a}は黙って干し柿をかじっていた。','{a}がふと口にした素朴な疑問が、{b}の理論の穴を突いた。{b}は長い沈黙のあと礼を言い、二人は夜明けまで蔵の資料を読み合った。','{a}が欠伸をしたのを見て、{b}は資料を乱暴に閉じた。凡人に話したのが間違いだったと言い残し、{b}は梯子を下りていった。'],
['foe023','foe','journalist','psychic','bond','talk','spirit','土砂降りのバス停で、{a}は{b}の霊視をいかさまだと記事に書くつもりだと告げた。{b}は濡れた時刻表を見つめていた。','{b}は、{a}が亡くした誰かの癖を一つだけ言い当てた。{a}は手帳を閉じ、「書くのはやめる｜＝｜書くのはやめます」と言った。雨が上がるまで、二人は黙って並んでいた。','{b}は{a}の過去を次々に暴き立て、取材相手を傷つけてきた報いだと笑った。{a}は傘を置き去りにして雨の中へ出ていった。'],
['foe024','foe','sleuth','ponkotsu','bond','obs','explore','公民館の黒板に、{b}は自信満々の推理図を描いていた。{a}はそれを横目に、一本ずつ線を消していった。','最後に残った一本を見て、{a}は手を止めた。的外れな推理の中に、ひとつだけ本物の筋が通っていた。{a}は初めて{b}を同業者として見た。','{a}は黒板をすべて消し、{b}に探偵を名乗る資格はないと言った。{b}はチョークを床に叩きつけ、二人は別々に村を調べ始めた。'],
['foe025','foe','ghost','doctor','lose','spirit','obs','診療所の古い暗室で、{a}の撮った心霊写真を{b}が鼻で笑った。そのとき、現像皿の中の写真が勝手に黒ずみ始めた。','{b}は医師の手つきで薬品を正確に量り分け、{a}の言う手順どおりに皿へ注いだ。写真は辛うじて像を留めた。{a}は「助かった｜＝｜助かりました」と小さく言った。','黒ずみは止まらず、写真は真っ黒な紙切れになった。{b}はそもそも信じていないと吐き捨て、{a}は医者の手際の悪さをなじった。'],
['foe026','foe','psychic','seer','clue','spirit','spirit','山中の石仏群の前で、{a}は見えると言い、{b}は札に出ていると言った。互いの力を偽物と罵りながら、二人は同じ一体の前で足を止めた。','{a}の見た影と、{b}の引いた札の絵が重なった。苔をこそげ落とすと、台座に刻まれた文字が現れた。――','どちらが先に気づいたかで言い争ううち、日が落ちた。石仏の目が一斉にこちらを向いた気がして、二人は別々の道を駆け下りた。'],
['foe027','foe','manager','sleuth','save','fight','obs','民宿の廊下で、{b}は夕食の汁物の匂いがおかしいと言った。仲間に配り終えたばかりの{a}は、余計な口出しだと睨み返した。','{b}が匙を嗅ぎ、{a}が仲間の椀を素早く回収した。{a}は「次は先に言って｜次は先に言え｜次は先に言ってください」と言った。眠り薬の匂いを、二人とももう忘れない。','言い争ううちに、二人とも一口すすっていた。痺れる体で逃げる途中、階段を転げ落ちてひどく打ち身を負い、互いに口をきかなくなった。'],
['foe028','foe','civ','manager','bond','talk','fight','炊き出しの鍋をかき回しながら、{b}は{a}がいつも足手まといだと言った。{a}は焦げた鍋底を黙ってこそげていた。','{a}は、皆を守ろうと無理を重ねる{b}の手の震えに気づいていた。代わりに見張りを引き受けると言うと、{b}はしばらく黙り、初めて素直に頷いた。','{a}は鍋を置き、守ってくれと頼んだ覚えはないと言い返した。{b}はそれ以来、{a}の分だけ握り飯を作らなかった。'],
['foe029','foe','psychic','musician','bond','spirit','obs','神楽殿の裏で、{b}は祭囃子の調子が狂っていると言い張った。{a}は音など関係ない、見えているものが全てだと取り合わなかった。','{b}が狂った拍を指で刻むと、{a}の目に映る影が同じ拍で揺れた。{a}は「同じものを聞いていた｜＝｜同じものを聞いていたんですね」と呟き、二人は互いの耳と目を初めて信じた。','{a}は{b}の笛を取り上げ、雑音で霊が乱れると言った。{b}は笛を奪い返し、二度と{a}の前で吹かなかった。'],
['foe030','foe','prof','doctor','clue','lore','obs','山寺の過去帳を前に、{a}は記録の古さを語り、{b}は死因の欄ばかりを見ていた。二人とも、相手の見方を浅いと思っていた。','{b}が指した死因の偏りと、{a}が読み解いた祭りの年が、ぴたりと重なった。二人は黙って同じ頁を見つめた。――','{a}は過去帳を独り占めにし、{b}の指摘を素人考えと一蹴した。{b}は寺を出ていき、頁は半分も読まれないまま閉じられた。'],
['foe032','foe','manager','priest','death','fight','rite','御神木の下で、{b}は禁足地に仲間を連れ込んだ{a}を責めた。言い争う二人を、注連縄の向こうから無数の白い顔が見下ろしていた。','{b}が祝詞を唱えながら張り直すべき注連縄を示し、{a}は白い腕から身を挺して{b}をかばい続けた。白い顔は一つずつ消え、二人は背中合わせのまま夜明けを迎えた。','白い腕が{v}を注連縄の向こうへ引き込んだ。翌朝、御神木の根元で冷たくなった{v}を、{w}はただ見下ろすことしかできなかった。'],
['foe033','foe','doctor','ponkotsu','rescue','obs','explore','{x}が祭りの前夜に連れ去られた。{b}は犯人は郵便配達だと言い張り、{a}は頭痛をこらえながらその後を追った。','{b}の的外れな推理で辿り着いた郵便局の裏に、本当に{x}が縛られていた。{a}が縄を解いて脈を確かめる横で、{b}は「やっぱり｜やはりそうか｜やはり、そうでしたね」と得意げに言った。','郵便局は空振りだった。引き返したときには、{x}の気配は山の方へ消えていた。{a}は{b}の推理を、{b}は{a}の遅さを責めた。'],
['foe034','foe','police','streamer','clue','fight','explore','立入禁止の旧坑道へ、{b}がカメラを回しながら入っていった。連れ戻そうと追った{a}の懐中電灯の先に、奇妙な祭壇が浮かんだ。','{b}が暗視モードで捉えた影を頼りに、{a}が崩れた坑木をどけた。祭壇の裏に、錆びた鉄箱が埋まっていた。――','{a}が{b}のカメラを取り上げようとして揉み合い、照明が落ちた。暗闇で罵り合いながら這い出したとき、二人は何も持っていなかった。'],
['foe035','foe','civ','folk','rescue','talk','lore','連れ去られた{x}を追って、二人は鎮守の森へ入った。{b}は素人は足を引っ張るなと言い、{a}は聞こえないふりをした。','{b}が禁忌の道筋を読み、{a}が偶然拾った鈴で村人を惑わせた。茂みの奥で{x}を見つけると、{b}は「運も実力のうち｜運も実力のうちだ｜運も実力のうちです」と言った。','{b}が祭祀の順序を論じている間に、{a}が枯れ枝を踏み折った。{x}を囲む村人に気づかれ、二人は互いのせいだと言い合いながら逃げた。'],
['foe036','foe','muno','police','clue','explore','fight','公民館の倉庫で、{b}は{a}に何も触るなと命じた。{a}は頷いたそばから、古い長持の蓋に手をかけていた。','{a}が蓋を取り落とした衝撃で底板が外れ、{b}が中から包みを引きずり出した。{b}は頭を抱えたが、包みの中身からは目を離さなかった。――','{a}が積まれた木箱を崩し、{b}がその下敷きになった。怒鳴る{b}から{a}は逃げ出し、二人はその日、別々に行動した。'],
['foe037','foe','civ','prof','save','talk','lore','古い社務所で、{b}は{a}に古文書の読み方を説教していた。{a}が退屈そうに見上げた天井の梁から、細い糸が垂れていた。','{a}が{b}の袖を引き、{b}は古文書の記述から仕掛けを読み取った。落ちてきた鉈は畳に刺さった。{b}は「よく見ていた｜＝｜よく見ていましたね」と認め、二人は同じ糸をもう見落とさないと思った。','{b}は{a}の指さす先を無視して語り続けた。落ちてきた鉈が二人の肩をかすめ、血を流して逃げる間も、二人は互いを責めていた。'],
['foe038','foe','seer','sleuth','clue','spirit','obs','庄屋の屋敷跡で、{b}は占いなど論外だと言い、{a}は札を広げた。荒れた庭の真ん中に、干上がった池がひとつあった。','{a}の札が示した方角と、{b}が足跡から割り出した方角が同じだった。二人は渋々並んで池の底を掘り、黒い漆塗りの箱を見つけた。――','{b}は札の意味を一枚ずつ論破し、{a}は札を投げつけた。散らばった札を拾う{a}を残して、{b}は一人で屋敷を出た。'],
['foe039','foe','writer','priest','rescue','obs','rite','{x}が奥の院に連れ込まれたと、{a}が知らせた。{b}は余所者に神域を荒らされたくないと渋ったが、灯りを手に先に立った。','{a}が村人の言葉の矛盾から隠し通路を見抜き、{b}が作法どおりに頭を下げて門番をやり過ごした。{x}を連れ出したあと、{b}は「見直した｜＝｜見直しました」と言った。','{b}が作法に拘って足を止めるたび、{a}は苛立って先を急いだ。物音を立てた二人は追い払われ、{x}は奥の院の闇に残された。'],
['foe040','foe','student','police','save','explore','fight','放課後の分校で、{a}は若い村人から聞いた噂を伝えたが、{b}は子どもの戯言だと一蹴した。窓の外の夕焼けの中で、案山子が一体増えていた。','{a}の覚えていた案山子の数と、{b}の見回りの記録が合わなかった。二人が裏口から抜けた直後、案山子だったものが窓を破った。次に増えたら、すぐ分かる。','言い争う二人の背後で窓が割れた。{b}は腕を、{a}は額を破片で裂かれ、礼も謝罪もないまま分校を後にした。'],
['foe041','foe','muno','manager','death','explore','fight','吊り橋の真ん中で、{a}が落とした懐中電灯を拾おうとしゃがみ込んだ。苛立った{b}が振り向いたとき、両岸の村人が縄に鉈を当てていた。','{b}は{a}の襟首を掴んで走り、{a}は転びながらも後に続いた。渡り切った瞬間に橋は落ちた。{a}が「懐中電灯は無事｜懐中電灯は無事だ｜懐中電灯は無事です」と言うと、{b}は脱力して笑った。','縄が切れ、橋が大きく傾いた。{w}は岸の蔓にしがみついたが、{v}は谷底へ落ち、岩の上で二度と動かなかった。点いたままの懐中電灯だけが川を流れていった。'],
['foe042','foe','streamer','doctor','clue','explore','obs','療養所跡の病室で、{a}は配信の画角ばかり気にしていた。{b}は不謹慎だと言いながらも、床に散らばったカルテから目を離せなかった。','{a}のカメラが拡大した日付と、{b}が読み取った処方の異常が繋がった。二人は無言で、一枚のカルテを照明の下に置いた。――','{a}がコメント欄を読み上げるたびに{b}の苛立ちは募り、カルテを奪い合ううちに一枚が裂けた。{b}は療養所を出ていった。'],
['foe043','foe','muno','doctor','bond','explore','obs','民宿の土間で、{b}は{a}の擦り傷を消毒しながら、余計なことばかりするから怪我をするのだと叱った。{a}はしゅんとして俯いていた。','{a}は、皆の役に立ちたくて空回りしてしまうのだと打ち明けた。{b}は包帯を巻き終え、「それは知ってる｜それは知っている｜それは知っています」と言った。二人の間の棘が一本抜けた。','{a}は手当ての礼にと、薬箱の片付けを買って出た。薬瓶は残らず土間で割れ、{b}は二度と{a}の手当てはしないと冷たく告げた。'],
['foe044','foe','writer','sleuth','bond','obs','obs','月明かりの縁側で、{b}は{a}の推理小説の矛盾を一つ残らず指摘した。{a}は煙草の火を見つめ、反論の言葉を探していた。','{a}は、小説の矛盾は読者のための嘘だと静かに言った。{b}はしばし考え、この村の嘘も同じ形をしていると気づいた。二人は夜通し村の筋書きを語り合った。','{b}は最後に、もう二度と{a}の本は読まないと告げた。{a}は煙草を揉み消し、{b}を登場人物にして殺す筋を考え始めた。'],
['foe045','foe','seer','musician','clue','spirit','obs','祭囃子の練習を盗み聞きしようと、{b}は社の床下に潜り込んだ。札に床下と出たという{a}が先にいて、二人は狭い暗がりで睨み合った。','太鼓の拍が一か所だけ欠けていると{b}が囁き、{a}の札がその拍の数を示した。{a}は「数が合う｜＝｜数が合います」と呟いた。――','狭さに苛立った二人が肘で押し合ううちに、床板が鳴った。練習はぴたりと止み、二人は床下から這い出して別々に逃げた。'],
['foe046','foe','musician','sleuth','death','obs','obs','夜祭の人混みの中で、{a}と{b}はどちらの調べが先かで言い争っていた。不意に囃子が止み、面をつけた村人たちが二人を取り囲んだ。','{a}が耳で覚えた拍子で篠笛を吹くと、村人たちの足が揃って止まった。{b}はその一瞬で抜け道を見抜き、二人は屋台の裏を駆け抜けた。','面の列が割れ、{v}だけが輪の中に残された。{w}が振り返ったとき、{v}は祭壇の前に倒れ、もう息をしていなかった。'],
['foe047','foe','seer','folk','clue','spirit','lore','村外れの道祖神の前で、{b}は祀り方の由来を語り、{a}はそれを占いで裏づけようとした。互いに相手の方法を邪道だと思っていた。','{b}の語る禁忌と{a}の引いた札が、同じ一語を指していた。{b}は「認めるしかない｜＝｜認めるしかありません」と言い、道祖神の裏を探った。――','{b}が占いは民俗への冒涜だと言うと、{a}は道祖神の前で{b}の不運を予言した。二人は顔も見ずに別々の道へ去った。'],
['foe048','foe','celeb','streamer','save','talk','explore','村の集会所で、{b}は{a}を勝手に配信に映し、{a}は肖像権を盾に詰め寄った。その画面の隅に、障子へ忍び寄る影が映り込んでいた。','影に気づいた{b}が目配せし、{a}は村人に顔の利く声色で外へ呼びかけた。影が気を取られた隙に、二人は裏口から抜けた。障子越しの影は、もう見逃さない。','口論に夢中の二人の背後で、障子が破れた。棒で打たれた二人は這うように逃げ出し、互いの顔の痣を見ても何も言わなかった。'],
['foe049','foe','student','folk','death','explore','lore','雪解けの沢沿いで、{b}は{a}に、子どもに禁忌の何が分かると言い放った。そのとき、上流で鈍い地鳴りがした。','{b}が沢を禁じる古い言い伝えを思い出して高台を指し、{a}は身軽に崖をよじ登って手を伸ばした。{b}はためらってからその手を掴んだ。{b}は「助かった｜＝｜助かりました」と言った。','土石流が沢を埋め尽くした。高みに逃れた{w}が見下ろす先で、泥に呑まれた{v}は二度と浮かび上がらなかった。'],
['foe050','foe','writer','occult','rescue','obs','lore','{x}が沼の小島の祠へ連れていかれた。{b}は伝承を知らない者は足手まといだと言い、{a}は村人の目配せの意味を黙って読んでいた。','{a}が見抜いた見張りの交代の隙に、{b}が古い呪言で灯りを消した。闇の中で小舟を漕ぎ、二人は{x}を連れ戻した。岸に着くと、{b}は渋々礼を述べた。','{b}が呪言の正しい読みに拘り、{a}がその遅さを詰った。言い争う声に見張りが気づき、{x}を乗せた舟は霧の奥へ消えた。'],
['foe051','foe','ghost','ponkotsu','bond','spirit','explore','民宿の縁側で、{a}は録音機の雑音を聞き返していた。隣に座り込んだ{b}が、頼みもしない推理を延々と並べはじめた。','的外れな推理の一つが、雑音の周期と妙に噛み合った。{a}「……それ、もう一回言って｜……それを、もう一度言え｜……それ、もう一回言ってください」。二人は夜更けまで、録音と推理を突き合わせた。','{a}が機材の仕組みを説明しても、{b}は鼻で笑うばかりだった。録音機の電源を勝手に切られ、{a}は無言で縁側を立ち去った。'],
['foe052','foe','folk','sleuth','bond','lore','obs','雨で足止めされた公民館の片隅で、{a}と{b}は同じ祭礼の記録を広げていた。互いに相手の読みを認める気はなかった。','{b}の論理が{a}の知る禁忌の由来にぴたりと重なったとき、二人は思わず黙り込んだ。やがてどちらからともなく、相手の説に印をつけ合った。','{b}は禁忌を迷信と切り捨て、{a}は理屈で神は測れないと言い返した。記録は二つに裂かれ、二人は別々の部屋で夜を明かした。'],
['foe053','foe','occult','doctor','save','lore','obs','夕暮れの診療所跡で、{a}は戸口に吊るされた藁人形に気づいた。{b}は迷信だと鼻で笑い、薬棚を漁り続けていた。','{a}「それは印。今夜ここが狙われる｜それは印だ。今夜ここが狙われる｜それは印です。今夜ここが狙われます」。{b}は渋々手を止め、二人は裏口から抜け出した。藁の結び方は、{b}の目にも焼きついていた。','言い争ううちに床板が抜け、二人は割れた薬瓶の上に落ちた。{b}は自分の傷を手早く縫いながら、{a}の手当てを最後まで後回しにした。'],
['foe054','foe','muno','occult','bond','explore','lore','土蔵の整理を押しつけられた{a}と{b}は、埃の中で背中合わせに作業していた。{a}が動くたびに、{b}の並べた古文書が崩れた。','{a}が蹴飛ばした木箱から、{b}が探していた護符の束がこぼれ出た。{b}は呆れながらも礼を言い、{a}は照れくさそうに埃を払った。','{a}は手伝うつもりで古文書を日付順に並べ替え、{b}の三時間分の分類を台無しにした。{b}は二度と土蔵に近づくなと冷たく告げた。'],
['foe055','foe','occult','sleuth','death','lore','obs','夜の洞窟で、松明の火が一斉に消えた。奥から湿った足音が近づき、{a}と{b}は互いを盾にするように身を寄せた。','{a}が唱えた古い祓詞に、足音が一瞬たじろいだ。{b}「風上が出口。左へ｜風上が出口だ。左へ行け｜風上が出口です。左へ行きましょう」。二人は肩をぶつけ合いながら、岩の裂け目から外へ転がり出た。','{w}が振り返ったとき、{v}は暗闇から伸びた無数の手に足をつかまれていた。{v}の体は音もなく奥へ引きずり込まれ、二度と戻らなかった。'],
['foe056','foe','sleuth','priest','clue','obs','rite','朝霧の残る神社の拝殿で、{a}は神主の帳面を盗み見ようとしていた。{b}は作法を盾に、それを頑なに拒んだ。','{b}が正しい手順で御簾を上げると、{a}は奉納品の数が帳面と合わないことに気づいた。二人は不承不承、同じ行を指でなぞった。――','{a}が土足で拝殿に上がった瞬間、{b}は帳面を閉じて懐にしまった。二人の間には、もう交わす言葉が残っていなかった。'],
['foe057','foe','occult','prof','save','lore','lore','深夜の社務所で古地図を写していた二人は、床下からかすかな詠唱を聞いた。{a}と{b}は、どちらの説が正しいかで揉めたばかりだった。','{b}「その節回し、前夜祭の祝詞｜その節回しは、前夜祭の祝詞だ｜その節回し、前夜祭の祝詞です」。{a}も、それが邪神を呼ぶ伝承の節だと気づいていた。二人は灯りを消して村人の列をやり過ごした。次の夜の手順も、もう読めていた。','どちらが先に気づいたかで口論になり、逃げ遅れた二人は鎌で腕を裂かれた。互いの包帯を巻きながら、二人は一度も目を合わせなかった。'],
['foe058','foe','student','sleuth','lose','explore','obs','棚田のあぜ道を走る途中で、{a}の鞄から証拠写真の束が泥水へこぼれかけた。{b}はそれを見て舌打ちした。','{b}は水の流れから写真が溜まる淀みを即座に割り出し、{a}は身軽に田へ飛び込んで一枚残らず拾い上げた。泥まみれの{a}に、{b}は無言で上着を差し出した。','拾うかどうかで言い争う間に、写真は水路へ吸い込まれていった。{b}は{a}の不注意を責め、{a}は{b}の指図の多さを責めた。'],
['foe059','foe','prof','priest','save','lore','rite','昼下がりの古い鳥居の前で、{b}はくぐる前に足を止めた。{a}は学者らしく、鳥居の朱が新しすぎることを不審がっていた。','{b}「くぐらないで。脇から｜くぐるな。脇から行け｜くぐらないでください。脇から行きましょう」。{a}も文献の記述を思い出し、二人は鳥居を避けて参道に入った。罠の仕組みは、もう二人とも覚えていた。','{a}は迷信だと言ってくぐり、{b}は引き戻そうと後を追った。鳥居の上から落ちてきた石が、二人の肩をしたたかに打った。'],
['foe060','foe','muno','muno','death','explore','explore','夜の沼のほとりで、{a}と{b}はどちらが先に逃げ道を見つけたかで張り合っていた。背後の葦が、ざわりと揺れた。','二人が同時に別方向へ走り出したせいで、追ってきた村人たちは混乱して立ち止まった。偶然にも、二人は沼の向こう岸で鉢合わせた。','{v}は自分の見つけた近道を証明しようと、沼の浅瀬へ踏み込んだ。足をとられた{v}は黒い水に沈み、{w}は岸で立ち尽くすしかなかった。'],
['foe061','foe','muno','psychic','rescue','explore','spirit','{x}が祭りの山車に乗せられて連れ去られた。{a}は勝手に先頭を切って走り、{b}は霊の気配を頼りにその後を追った。','{a}がつまずいた拍子に山車の綱が外れ、{b}は見えない番人の位置を言い当てた。{b}「今、右の隙間｜今だ。右の隙間だ｜今です。右の隙間です」。二人は{x}を担いで夜道を駆け戻った。','{a}が大声で{x}の名を呼んだせいで、山車の周りの村人が一斉に振り向いた。退くしかなかった二人は、互いの判断を罵り続けた。'],
['foe062','foe','ghost','musician','bond','spirit','obs','祭囃子の練習が聞こえる夕暮れ、{a}は録音機を構え、{b}は耳を澄ませていた。同じ音を追いながら、二人は互いを邪魔者扱いしていた。','{b}が笛の一音だけ半音ずれていると指摘すると、{a}の波形にも同じ歪みが残っていた。二人は初めて、相手の耳と機材を信用する気になった。','{a}の機材が出すノイズに{b}は苛立ち、{b}の鼻歌で{a}の録音は台無しになった。二人は別々の方角へ歩き去った。'],
['foe065','foe','psychic','folk','bond','spirit','lore','夜の祠の前で、{a}は霊がいると言い、{b}は祀られているのは別の神だと言い張った。二人は線香の煙を挟んで座った。','{a}が見た姿は、{b}の知る古い祭神の像とぴたりと一致した。{b}「……その目、本物かも｜……その目は、本物かもしれない｜……その目、本物かもしれません」。二人は朝まで並んで、祠の由来を語り合った。','{b}は霊視を作り話だと切り捨て、{a}は学問に死者の声は聞こえないと返した。二人は背を向け合ったまま、祠を後にした。'],
['foe067','foe','seer','sleuth','clue','spirit','obs','雨の降る午後、村の雑貨屋で{a}は札を並べ、{b}は店主の嘘を探っていた。互いのやり方を、二人とも信じていなかった。','{a}の札が示した棚の裏に、{b}が目をつけた帳簿の空白と同じ日付の伝票が挟まっていた。{b}「……その札、今だけは信じる｜＝｜……その札、今だけは信じます」――','{a}の占いを{b}がいちいち論破するうちに、店主は奥へ引っ込んでしまった。二人は濡れた軒先で、互いの無能さを罵り合った。'],
['foe068','foe','journalist','prof','death','talk','lore','吊り橋の真ん中で、両岸から村人が現れた。{a}と{b}には、どちらの道案内が悪かったかで言い争う暇もなかった。','{b}が古文書にあった渡し場を思い出し、{a}は口八丁で村人を足止めした。二人は崖の小道を駆け下り、谷底の舟に飛び乗った。','綱が切られ、橋が大きく傾いた。{w}は板にしがみついたが、{v}は手を伸ばしたまま谷底の霧へ消えていった。'],
['foe069','foe','ghost','folk','lose','spirit','lore','夜更けの民宿で、{a}と{b}は互いの資料を屑扱いしながら、同じ机で記録映像と古文書の写しを整理していた。廊下の向こうから、濡れた足音が近づいてきた。','{b}が古文書にある水神除けの作法で机の周りに塩を引き、{a}はカメラのフラッシュで影を退けた。{a}「次はあなたの番｜次はあなたの番だ｜次はあなたの番です」。二人は背中合わせのまま朝を待った。','足音が去ったあと、机の上の写しだけが水浸しになり、文字が溶けて消えていた。二人は互いの不用心を責め合い、口を利かなくなった。'],
['foe070','foe','journalist','manager','lose','talk','fight','村の公民館で、{a}の取材メモを{b}が取り上げた。仲間を危険に巻き込む記事は書かせないと、{b}は譲らなかった。','奪い合いのさなか、村人が戸を開けた。{b}がその前に立ちふさがり、{a}はメモを靴の中に隠した。去り際、二人は小さく頷き合った。','もみ合ううちにメモは囲炉裏の火に落ち、一瞬で燃え上がった。{a}は{b}の過保護を、{b}は{a}の無謀を責め続けた。'],
['foe071','foe','manager','ponkotsu','rescue','fight','explore','{x}が裏山の炭焼き小屋に連れ込まれたと聞き、{a}は駆け出した。勝手についてきた{b}は、犯人は村長だと根拠もなく断言していた。','{b}の的外れな大声が見張りの注意を引き、その隙に{a}は戸を蹴破った。{a}「今だけは感謝する｜＝｜今だけは感謝します」。二人は{x}を支えて山道を下った。','{b}が小屋を取り違え、二人は空っぽの物置に飛び込んでいた。{x}の姿はどこにもなく、{a}は{b}の襟首をつかんで怒鳴りつけた。'],
['foe072','foe','musician','priest','clue','obs','rite','夕方の神楽殿で、{a}は笛の調べに耳を澄ませ、{b}は奉納の手順を見守っていた。二人とも、相手の口出しを嫌っていた。','{a}が拍子の欠けた箇所を指摘し、{b}がその間に本来入るはずの祝詞を思い出した。欠けた一節を、二人は渋々一緒に書き起こした。――','{a}が神楽の調子外れを笑い、{b}は神前で無礼だと咎めた。口論は、二人が神楽殿を追い出されるまで続いた。'],
['foe074','foe','celeb','police','lose','talk','fight','村の駐在所で、{b}は{a}の荷物を検めると言い出した。中には、二人で集めた儀式の写真が入っていた。','駐在の村人が近づくと、{a}は顔の広さで世間話を始め、{b}は写真を上着の内ポケットに隠した。息の合った芝居に、二人自身が驚いていた。','押し問答の末、写真の束は駐在に没収された。{a}は{b}の融通の利かなさを、{b}は{a}の傲慢さをなじった。'],
['foe075','foe','ghost','streamer','death','spirit','explore','夜の廃校の体育館で、{b}は生配信を始め、{a}は電磁波計の針の振れに青ざめていた。舞台の暗がりから、何かが這い出してきた。','{a}「ライトを消して｜ライトを消せ｜ライトを消してください」。{b}が渋々従うと、這うものは光を見失った。二人は機材を抱え、非常口から雪崩れ出た。','{v}はカメラを構えたまま暗がりに近づきすぎた。悲鳴が途切れ、画面には{v}の動かない手だけが映っていた。{w}は機材を捨てて逃げた。'],
['foe076','foe','celeb','folk','rescue','talk','lore','{x}が神社の奥宮へ連れ去られた。{a}は自分の名声で村人を説得できると言い、{b}は祭祀の禁忌を逆手に取るべきだと主張した。','{a}が宮司を世間話で引き留める間に、{b}は禁足の作法どおりに奥宮へ入った。縄を解かれた{x}を連れ、二人は夜明け前の参道を下った。','二人が作戦を譲らず言い争ううちに、奥宮の扉は固く閉ざされた。{x}を取り戻せないまま、{a}と{b}は互いに責任をなすりつけ合った。'],
['foe077','foe','student','priest','lose','explore','rite','夜の境内で、{a}が若い村人から聞き出した証言のノートを、{b}が取り上げた。その瞬間、一陣の風が灯籠の火を揺らした。','燃え移りかけたノートに、{a}が身軽に飛びついて火を叩き消した。{b}「……返す。よく守った｜＝｜……返します。よく守りましたね」。二人は焦げた頁を並べて腰を下ろした。','風に煽られたノートは灯籠の中へ吸い込まれ、灰になった。{a}は{b}が取り上げたせいだと叫び、{b}は境内で騒ぐなと冷たく返した。'],
['foe078','foe','writer','student','bond','obs','explore','昼下がりの駄菓子屋の縁台で、{a}と{b}は並んでラムネを飲んでいた。{a}は{b}の軽率さを、{b}は{a}の理屈っぽさを嫌っていた。','{b}が村の子どもから教わった童歌を口ずさむと、{a}はその歌詞の違和感に気づいた。二人は顔を見合わせ、初めて互いを頼もしいと思った。','{a}は{b}の話を作り話扱いし、手帳に書き留めもしなかった。{b}は空き瓶を置いて立ち去り、二人の溝は深まるばかりだった。'],
['foe079','foe','folk','ponkotsu','rescue','lore','explore','{x}が生贄として岩屋に閉じ込められた。{a}は封じの作法を知っていたが、{b}は真犯人を暴けば解決すると息巻いていた。','{b}の的外れな推理が、偶然にも岩屋の抜け穴を言い当てた。{a}は封じを破らぬ作法でそこへ潜り、{x}を引きずり出した。{a}「……今回だけは褒める｜＝｜……今回だけは褒めます」','{b}が封じの縄を勝手に切ったせいで、岩屋の奥で何かが目を覚ました。{x}を置いたまま退いた二人は、責め合う声を止められなかった。'],
['foe080','foe','doctor','sleuth','death','obs','obs','深夜の診療所跡に閉じ込められた{a}と{b}の前で、薬品棚が倒れた。戸の隙間から、白い煙が流れ込んできた。','{a}が煙の正体を見抜いて濡れた布を口に当てさせ、{b}は床板の継ぎ目から隠し通路を見つけた。二人は咳き込みながら外の冷気を吸い込んだ。','煙を吸った{v}は膝から崩れ落ち、{w}が引きずろうとしたときにはもう息がなかった。{w}は{v}を残し、窓を割って逃げ出した。'],
['foe081','foe','celeb','doctor','clue','talk','obs','村の旧家で、{a}はなじみの顔として座敷に通された。ついてきた{b}は、寝たきりの老人の手首に残る妙な痣を見つめていた。','{a}が家人を話で引きつける間に、{b}は痣が何年も前の儀式の縄跡だと見抜いた。{b}「この跡、家の全員にある｜この跡は、家の全員にある｜この跡、家の全員にあります」――','{a}が家人の前で{b}を付き人扱いしたため、{b}は診察を投げ出した。旧家を出た二人は、一言も交わさずに別々の道を帰った。'],
['foe082','foe','psychic','ponkotsu','clue','spirit','explore','霧の濃い朝の墓地で、{a}は死者の気配を探り、{b}は墓石の並びに暗号があると言い張っていた。','{b}の暗号説は外れていたが、指差した墓石の前で{a}は強い気配を感じた。苔を剥がすと、古い名前の上に新しい印が彫られていた。――','{b}が墓石を勝手に動かしたせいで、{a}の感じていた気配は霧の中へ散っていった。{a}は{b}を愚か者と呼び、墓地を後にした。'],
['foe083','foe','sleuth','ponkotsu','lose','obs','explore','村はずれの水車小屋で、{a}は推理の決め手となる録音テープを取り出した。{b}は自分のほうが先に真相に迫ったと言い張り、テープに手を伸ばした。','水車が急に回りだし、テープが水路へ落ちかけた。{a}は流れから落ちる先を読んで叫び、{b}は訳も分からず身を投げ出して受け止めた。{a}「……助かった｜＝｜……助かりました」','引っ張り合ったテープは千切れ、半分が水車に巻き込まれた。{a}は{b}を無能と呼び、{b}は真の名探偵は自分だと叫び返した。'],
['foe084','foe','streamer','streamer','rescue','explore','explore','{x}が祭りの夜に連れ去られた。{a}と{b}はそれぞれカメラを回しながら、どちらが先に救出劇を撮るかで張り合っていた。','{a}が派手に照明を焚いて村人を引きつけ、{b}は暗がりから回り込んだ。救い出した{x}を挟んで、二人は互いの映像の腕を認め合った。','二人のライトが交差し、潜んでいた場所が村人に丸見えになった。{x}を取り戻せないまま、二人は相手の配信を潰してやると罵り合った。'],
['foe085','foe','seer','seer','save','spirit','spirit','夕暮れの峠道で、{a}と{b}は同時に足を止めた。二人の占いは同じ凶兆を示していたが、どちらも相手の読みを認めなかった。','{a}「右の崖。落石が来る｜右の崖だ。落石が来る｜右の崖です。落石が来ます」。{b}も同じ札を引いていた。二人が岩陰へ飛び込んだ直後、斜面が崩れ落ちた。次の凶兆の形も、もう見えていた。','右か左かで言い争ううちに、落石が二人をかすめた。血のにじむ額を押さえ、二人は互いの占いを当てにならないと吐き捨てた。'],
['foe087','foe','celeb','prof','save','talk','lore','歓迎の宴の席で、{a}は村人たちから次々に酒を勧められていた。隣の{b}は、杯に描かれた紋様を険しい顔で見ていた。','{b}「その紋、眠り酒の印｜その紋は、眠り酒の印だ｜その紋、眠り酒の印です」。{a}は笑顔のまま杯を伏せ、顔の広さで場をはぐらかした。二人は早めに席を立った。次の宴の罠も、もう見抜ける。','{a}は{b}の忠告を無視して杯を干し、止めに入った{b}も飲まされた。翌朝、二人は手首に縄の擦り傷を負って目覚め、口も利かなかった。'],
['foe088','foe','journalist','sleuth','clue','talk','obs','雨上がりの郵便局で、{a}は局員から噂を聞き出し、{b}は届いた手紙の消印を眺めていた。二人とも、相手を出し抜くつもりだった。','{a}が聞き出した日付と、{b}が見つけた消印のずれが、ぴたりと噛み合った。二人は渋々、同じ封筒を一緒に光にかざした。――','{a}が局員に{b}の推理を漏らしたせいで、局員は口を閉ざしてしまった。{b}は{a}を軽蔑の目で一瞥し、郵便局を出ていった。'],
['foe089','foe','seer','priest','save','spirit','rite','夜明け前の禊場で、{a}は水面に不吉な影を見た。{b}は占いなど神事を汚すものだと、{a}を追い払おうとしていた。','{a}の指差した先で、水底の注連縄が不自然に張られていた。{b}「……引き込む罠｜……引き込む罠だ｜……引き込む罠です」。二人は水に入らず禊を済ませた。仕掛けの形は、二人とも覚えていた。','{b}が作法どおりに水へ入り、{a}は止めようとして足を滑らせた。二人とも水底の縄に足を裂かれ、互いの頑固さを恨んだ。'],
['foe090','foe','journalist','student','bond','talk','explore','放課後の分校で、{a}は{b}から村の子どもたちの噂話を聞き出そうとしていた。{b}は大人の取材がずっと気に食わなかった。','{a}は記事にしないと約束し、自分の取材手帳を{b}に見せた。{b}はしばらく黙ってから、手帳の余白に知っている噂を書き足した。','{a}が話を勝手に録音していたことが、{b}にばれた。{b}はレコーダーを床に叩きつけ、二度と口を利かないと背を向けた。'],
['foe091','foe','psychic','psychic','clue','spirit','spirit','真夜中の井戸端で、{a}と{b}は同じ霊の声を聞いた。だが、その声が何を訴えているかで、二人の見立ては真っ向から食い違った。','二人が見た幻を重ね合わせると、一つの場面が浮かび上がった。{a}「同じ景色を見てる｜同じ景色を見ている｜同じ景色を見ていますね」。{b}は黙って頷いた。――','互いの霊視を否定し合ううちに、霊の声はふっと途切れた。井戸の底の闇を前に、二人は相手の力を偽物だと罵った。'],
['foe093','foe','prof','prof','clue','lore','lore','村の郷土資料館で、{a}と{b}は同じ古文書の前に陣取った。長年論争を続けてきた二人は、互いの解釈を鼻で笑っていた。','{a}の読んだ前半と{b}の読んだ後半が、一つの祭文としてつながった。{b}「その読みで合ってた｜その読みで合っていた｜その読みで合っていました」――','一文字の読み方をめぐる論争は止まらず、閉館を告げる村人に二人とも追い出された。古文書は再び鍵のかかった棚へ戻された。'],
['foe094','foe','journalist','doctor','bond','talk','obs','夜更けの民宿の台所で、{b}は{a}の擦り傷を消毒していた。{a}は{b}が村人の死因を隠していると疑い、{b}は{a}の記事を憎んでいた。','手当てを終えると、{b}は検死のメモを{a}に差し出した。{a}はそれを記事にしないと誓い、二人は初めて同じ側に立った。','{a}が手当て中にも質問を浴びせ続けたので、{b}は包帯を投げ出した。{a}は{b}を隠蔽の共犯と呼び、二人は完全に決裂した。'],
['foe095','foe','prof','sleuth','lose','lore','obs','夕暮れの渡し舟の上で、{a}は古文書の写しを膝に広げた。{b}はその解釈に穴があると言い、紙をひったくろうとした。','舟が大きく揺れ、写しが川面へ舞った。{b}が身を乗り出してつかみ、{a}がその背をつかんで支えた。{b}「穴はなかった｜＝｜穴はありませんでした」。','写しは川面に落ち、墨をにじませながら流されていった。{a}は{b}の乱暴さを、{b}は{a}の頑固さを責め続けた。'],
['foe096','foe','manager','seer','lose','fight','spirit','深夜の山小屋で、{b}の占いが仲間の誰かが裏切ると告げた。{a}は仲間を疑わせる占いを許さず、札と一緒に手がかりのメモを取り上げた。','小屋の外に村人の影が見えると、{a}はメモを{b}に返して戸口を固めた。{b}はメモを札の間に隠した。二人の間に、短い休戦が結ばれた。','取り合いになったメモは、窓の隙間から吹き込んだ風に攫われて闇に消えた。{a}は{b}の占いを、{b}は{a}の頑なさを責めた。'],
['foe097','foe','muno','celeb','clue','explore','talk','村の公民館で、{b}は顔なじみの村長と談笑していた。その横で{a}は、張り合うように勝手に戸棚を開けて回っていた。','{a}が倒した戸棚の裏から、古い寄り合いの写真が出てきた。{b}は村長の顔色が変わったのを見逃さなかった。{b}「それ、こっちに｜それを、こっちへ寄こせ｜それ、こちらにください」――','{a}が村長の湯呑みをひっくり返し、{b}の築いた和やかな空気は台無しになった。{b}は{a}を二度と連れ歩かないと決めた。'],
['foe098','foe','occult','student','save','lore','explore','昼過ぎの竹林で、{b}が近道を見つけたと先へ走った。{a}は足元の竹に刻まれた古い呪印に気づき、{b}を呼び止めた。','{a}が呪印の意味を説き、{b}は身軽に斜面を登って罠の仕掛けを見つけた。二人は罠を避けて竹林を抜けた。同じ印なら、次はすぐ見分けられる。','{b}は呼び止める声を無視し、{a}が追いかけたところで張られた縄が跳ね上がった。二人とも竹の切っ先で脚を切り、黙って傷を押さえた。'],
['foe099','foe','civ','seer','save','talk','spirit','夜の民宿で、{b}が今夜は眠るなと告げた。巻き込まれただけの{a}は、怪しげな占いに付き合う気はなかった。','{a}がしぶしぶ起きていると、廊下を忍び足が近づいてきた。{a}「……当たってる｜……当たっている｜……当たっていますね」。二人は押し入れでやり過ごした。足音の癖は、もう耳が覚えていた。','{a}が布団に入った直後、障子が破られた。逃げる途中で二人とも刃物にかすられ、{a}は{b}を、{b}は{a}を恨めしげに睨んだ。'],
['foe100','foe','police','folk','bond','fight','lore','夜明けの火の見櫓で、{a}と{b}は見張りを押しつけられていた。力で押し通す{a}を、{b}は作法知らずと軽蔑していた。','{b}が村の禁忌を一つずつ語ると、{a}は黙って聞き入った。代わりに{a}が護身の構えを教え、二人は朝日の中で初めて笑い合った。','{a}は村人を力で締め上げようと言い出し、{b}は祟りを招くと猛反対した。櫓を降りた二人は、互いを無視して別々の道へ散った。']
].forEach(function(r){JS.DUO_EV.push({id:r[0],mode:r[1],a:r[2],b:r[3],type:r[4],s1:r[5],s2:r[6],intro:r[7],ok:r[8],ng:r[9]});});
})();
});
;
/* ==== js/jashin-duo.js ==== */
HK.Load.def(339,'js/jashin-duo.js',function(){
(function(){
'use strict';
var HK=window.HK,JS=HK.JASHIN,ST=HK.Story;
if(!JS|| !ST)return;
function clamp(v,a,b){return Math.max(a,Math.min(b,v));}
var RATE=0.42;
var TAG={clue:'手がかり',lose:'手がかりの危機',death:'死線',save:'予感',rescue:'救出',bond:'二人',r18:'夜'};
var SK={obs:'観察',lore:'知識',talk:'聞き込み',spirit:'霊感',explore:'探索',fight:'腕っぷし',rite:'作法'};
function jobL(id){var j=JS.JOB&&JS.JOB[id];return j?j.label:id;}
function hostile(S,a,b){return JS.REL.cat(S,a,b)==='bad'||JS.REL.cat(S,b,a)==='bad'||JS.REL.bond(S,a,b)< -0.15||JS.REL.bond(S,b,a)< -0.15;}
function free(p){return JS.alive(p)&& !p.bound&& !p.mad;}
function r18on(S){return!!(JS.R18&&(JS.R18.onPC?JS.R18.onPC(S):JS.R18.on(S)));}
function rel(S,a,b,d,lab){if(JS.DRAMA&&JS.DRAMA.setRel)JS.DRAMA.setRel(S,a,b,d,lab);}
function edge(S,a,b,lab,cls){if(JS.DRAMA)JS.DRAMA.edge(S,a,b,lab,cls,a);}
JS.DUO={
setup:function(S){
var rng=S.rng,P=S.P,EV=JS.DUO_EV||[];
S.duoQ=[];
EV.forEach(function(e){
if(e.type==='r18'&& !r18on(S))return;
var cands=[];
P.forEach(function(a){
if(a.job!==e.a)return;
P.forEach(function(b){
if(b===a||b.job!==e.b)return;
if((e.mode==='foe')!==hostile(S,a,b))return;
if(e.type==='r18'&& !(HK.Pos&&HK.Pos.okSex(a,b)))return;
cands.push([a,b]);
});
});
if(!cands.length||rng()>RATE)return;
var pr=cands[Math.floor(rng()*cands.length)];
var at=Math.min(S.deadline-2,2+2*Math.floor(rng()*5));
S.duoQ.push({e:e,a:pr[0],b:pr[1],at:at,done:false});
});
S.duoQ.sort(function(x,y){return x.at-y.at;});
},
tick:function(S,live,h){
var fired=0;
(S.duoQ||[]).forEach(function(q){
if(q.done||h<q.at||fired>=2)return;
var e=q.e,a=q.a,b=q.b;
if(!JS.alive(a)|| !JS.alive(b)){if(!a.alive|| !b.alive||h>q.at+12)q.done=true;return;}
if(!free(a)|| !free(b)||(e.mode==='foe')!==hostile(S,a,b)){if(h>q.at+8)q.done=true;return;}
var x=null;
if(e.type==='rescue'){
x=S.P.filter(function(p){return p!==a&&p!==b&&p.alive&&p.taken;})[0]||S.P.filter(function(p){return p!==a&&p!==b&&JS.alive(p);})[0];
if(!x){if(h>q.at+8)q.done=true;return;}
}
if(e.type==='lose'&& !S.found.length){if(h>q.at+16)q.done=true;return;}
q.done=true;fired++;
fire(S,q,x,h);
});
}
};
function fire(S,q,x,h){
var rng=S.rng,e=q.e,a=q.a,b=q.b,foe=e.mode==='foe';
var sa=JS.skill(a,e.s1),sb=JS.skill(b,e.s2),sum=sa+sb,roll=sum+(rng()-0.5)*0.5;
var ok=roll>=(foe?1.1:1.0);
if(JS.DUO.onFire)JS.DUO.onFire(e,ok);
var m={a:a.name,b:b.name,x:x?x.name:''};
var t=ST.fmt(e.intro,m),why=jobL(a.job)+'×'+jobL(b.job)+(foe?'（敵対している二人）':'（協力できる二人）')+'／'+(ok?'成功':'失敗')+'：'+SK[e.s1]+'＋'+SK[e.s2]+'の合計 '+Math.round(sum*100);
var actors=x?[a,b,x]:[a,b],mag=22,key='';
var lab=foe?(ok?'好敵手':'決裂'):(ok?'信頼':'決裂');
switch(e.type){
case'clue':
if(ok){
var k=S.G.clues.map(function(c,i){return i;}).filter(function(i){return S.found.indexOf(i)<0;})[0];
var body=ST.fmt(e.ok,m);
if(k!=null){S.found.push(k);a.cnt.clue++;t+=body+S.G.clues[k].t+'。';why+='／手がかり '+S.found.length+'/'+S.G.clues.length;}
else t+=body.replace(/――$/,'');
rel(S,a,b,foe?0.3:0.2,lab);
}else{t+=ST.fmt(e.ng,m);rel(S,a,b,-0.3,lab);}
break;
case'lose':
if(ok){t+=ST.fmt(e.ok,m);[a,b].forEach(function(p){p.m.fear=clamp(p.m.fear-8,0,100);});rel(S,a,b,foe?0.35:0.25,lab);}
else{
t+=ST.fmt(e.ng,m);
if(!S.solved&&S.found.length){S.found.pop();why+='／手がかりを一つ失った（'+S.found.length+'/'+S.G.clues.length+'）';}
rel(S,a,b,-0.35,lab);
}
break;
case'death':
if(ok){t+=ST.fmt(e.ok,m);rel(S,a,b,foe?0.45:0.35,foe?'死線を越えた':'戦友');mag=30;[a,b].forEach(function(p){p.m.fear=clamp(p.m.fear+6,0,100);});}
else{
var luck=function(p){return JS.skill(p,'fight')+p.stats.luck*0.05+rng()*0.3;};
var v=luck(a)<luck(b)?a:b,w=v===a?b:a;
var txt=ST.fmt(e.ng,{a:a.name,b:b.name,v:v.name,w:w.name});
w.m.fear=clamp(w.m.fear+20,0,100);
JS.core.die(S,v,jobL(a.job)+'×'+jobL(b.job)+'の出来事（'+(foe?'因縁':'協力')+'・失敗）で',[txt],t);
return;
}
break;
case'save':
if(ok){t+=ST.fmt(e.ok,m);a.foresee=true;b.foresee=true;rel(S,a,b,foe?0.35:0.3,lab);why+='／二人とも、次の村人の襲撃を一度だけかわせる';}
else{t+=ST.fmt(e.ng,m);[a,b].forEach(function(p){p.m.hp=clamp(p.m.hp-12,0,100);p.m.fear=clamp(p.m.fear+12,0,100);});rel(S,a,b,-0.25,lab);}
break;
case'rescue':
if(ok){
t+=ST.fmt(e.ok,m);x.taken=false;x.m.fear=clamp(x.m.fear-10,0,100);
rel(S,a,b,foe?0.45:0.35,lab);rel(S,x,a,0.25);rel(S,x,b,0.25);
edge(S,a,x,'救った','guard');mag=32;key=a.name+'と'+b.name+'が'+x.name+'を救い出した';
}else{
t+=ST.fmt(e.ng,m);[a,b].forEach(function(p){p.m.fear=clamp(p.m.fear+10,0,100);});rel(S,a,b,-0.35,lab);
if(!x.taken){x.taken=true;x.takenAt=h;why+='／'+x.name+'は村人に連れ去られた';}
key=x.name+'が連れ去られた';
}
break;
case'bond':
t+=ST.fmt(ok?e.ok:e.ng,m);
rel(S,a,b,ok?(foe?0.6:0.5): -0.5,ok?(foe?'好敵手':'固い絆'):'決裂');
mag=24;
break;
case'r18':
var Pz=HK.Pos,o=Pz.order(a,b,[a,b]);
if(!Pz.okSex(a,b)||Pz.hardTop(o[1],o[0]))return;
if(JS.R18&&JS.R18.room&& !JS.R18.room(S,[a,b])){q.done=true;return;}
var mm={a:a.name,b:b.name,t:o[0].name,u:o[1].name};
var free= !!(HK.State&&HK.State.freeSex&&HK.State.freeSex(S,a,b));
var X=JS.DUO_R18X&&JS.DUO_R18X[foe?'foe':'ally'];
var k=e.introL?Math.floor(S.rng()*e.introL.length):0,at=function(l,d){return l&&l.length?l[Math.min(k,l.length-1)]:d;};
var ck=Pz.ff(o[0],o[1])?'ff':Pz.isF(o[0])&& !Pz.isF(o[1])?'fm':'m',R=HK.R18M;
var body=ok&&X&&X.body?ST.fmt(ST.pick(S,X.body[ck]),mm)+(R?R.say(S,o[1],'mid')+R.say(S,o[1],'climax'):''):'';
var main=ST.fmt(ok?at(e.okL,e.ok):at(e.ngL,e.ng),mm),cut=main.slice(0,-1).lastIndexOf('。');
if(body&&cut>=0&& /果て/.test(main.slice(cut+1)))main=main.slice(0,cut+1)+body+main.slice(cut+1);
else main+=body;
t=(free&&ok?HK.FreeSex.lead(S,a,b):'')+ST.fmt(at(e.introL,e.intro),mm)+(X&&S.rng()<0.5?ST.fmt(ST.pick(S,X.intro),mm):'')+main+(X?ST.fmt(ST.pick(S,ok?X.after:X.ng),mm):'');
if(ok&&JS.R18&&JS.R18.spend)JS.R18.spend(S,[a,b]);
if(ok&&free){a.cnt.r18=(a.cnt.r18||0)+1;b.cnt.r18=(b.cnt.r18||0)+1;rel(S,a,b,0.2,'体だけの関係');edge(S,a,b,'体だけの関係','night');HK.FreeSex.mark(S,a,b);HK.FreeSex.jealous(S,a,b);why=HK.FreeSex.why(a,b)+'／'+why;}
else if(ok){a.cnt.r18=(a.cnt.r18||0)+1;b.cnt.r18=(b.cnt.r18||0)+1;rel(S,a,b,foe?0.35:0.6,foe?'歪んだ関係':'一夜');if(!foe)edge(S,a,b,'一夜','love');}
else rel(S,a,b,-0.5,'決裂');
mag=30;key=ok?a.name+'と'+b.name+'の夜':'';
break;
}
var out=ST.say(S,{actors:actors,tag:(foe?'因縁・':'協力・')+TAG[e.type],text:t,why:why,mag:mag+(ok?6:0)});
if(key&&out)ST.key(S,out,key);
}
})();
});
;
/* ==== js/jashin-cave.js ==== */
HK.Load.def(340,'js/jashin-cave.js',function(){
(function(){
'use strict';
var HK=window.HK,ST=HK.Story,JS=HK.JASHIN,clamp=HK.clamp,M=JS&&JS.MORE;
if(!ST|| !JS|| !M)return;
function fmtG(S,t){return ST.fmt(t,{g:S.G.call,n:S.V});}
function climax(S,h){
var PL=JS.PLACE?JS.PLACE.begin(S):null;
try{run(S,h,PL);}finally{if(JS.PLACE)JS.PLACE.end(S);}
}
function pl(S,PL,k,def){return fmtG(S,ST.pick(S,PL&&PL[k]?PL[k]:def));}
function run(S,h,PL){
var C=JS.core,rng=S.rng,alive=JS.alive,skill=JS.skill;
S.inCave=true;
function inCave(){return S.P.filter(function(p){return alive(p)&& !p.bound;});}
var live=inCave(),taken=S.P.filter(function(p){return p.alive&&p.taken;}),bound=S.P.filter(function(p){return alive(p)&&p.bound;});
ST.step(S,'クライマックス　'+(PL?PL.name:'洞窟')+'へ　'+C.label(h+1));
S.P.forEach(function(p){if(p.bound&&p.boundUntil!=null&&alive(p)){p.bound=false;p.boundUntil=null;}});
live=inCave();bound=S.P.filter(function(p){return alive(p)&&p.bound;});
if(JS.REL)JS.REL.confess(S,live);
ST.say(S,{kind:'phase',text:'祭りの太鼓が鳴り始めた。'+C.names(live)+'は、'+S.G.call+'を封じるため、'+(PL?PL.to:'祠のある洞窟')+'へ向かった。'+pl(S,PL,'in',M.CAVE_IN)+(bound.length?C.names(bound)+'は、縛られたまま民宿に残された。':'')});
if(JS.PLACE){JS.PLACE.travel(S,inCave());live=inCave();if(!live.length){if(!manifest(S,h+1,0.85))C.flee(S,h+2);return;}}
var mid=pl(S,PL,'mid',M.CAVE_MID);
if(!(PL&&PL.noChase)&&S.hostile>40&&rng()<0.4+S.hostile/250){mid+=ST.pick(S,M.CAVE_CHASE);live.forEach(function(p){p.m.fear=clamp(p.m.fear+10,0,100);});}
ST.say(S,{kind:'phase',text:mid});
if(JS.R18&&JS.R18.on(S)&&JS.R18.cave)JS.R18.cave(S,live);
live.forEach(function(p){if(alive(p)&& !p.out&&rng()<(PL?0.2:0.3))C.trap(S,p,inCave(),!PL||PL.id==='cave');});
if(PL)JS.PLACE.hazard(S,inCave());
live=inCave();
if(!live.length){if(!manifest(S,h+1,0.85))C.flee(S,h+2);return;}
ST.say(S,{kind:'phase',text:pl(S,PL,'end',M.CAVE_END)});
var bonus=0;
if(JS.PLACE){
bonus+=JS.PLACE.rel(S,inCave());
var ix=JS.PLACE.intrude(S,inCave(),h);
if(ix&&ix.done)return;
if(ix)bonus+=ix.bonus||0;
live=inCave();
if(!live.length){if(!manifest(S,h+1,0.85))C.flee(S,h+2);return;}
}
var mage=live.filter(function(p){return p.plot;})[0];
if(mage){
var ok=mage.plot.kills>=mage.plot.need;
if(!ok){
var vs=live.filter(function(q){return q!==mage;}).sort(function(a,b){return a.stats.luck-b.stats.luck;});
if(vs.length){
var v=vs[0];
C.die(S,v,'儀式を企む'+mage.name+'に生贄にされて',[ST.fmt(ST.pick(S,M.MAGE_PUSH),{a:mage.name,v:'{a}'})]);
mage.plot.kills++;
ok= !JS.detectMage(S,mage,true);
}
}
if(ok&&alive(mage)&& !mage.bound){
var cg=mage.plot.god;
bonus=0.32;
var o=ST.say(S,{actors:[mage],tag:'召喚',kind:'climax',text:ST.fmt(ST.pick(S,M.MAGE_SUMMON),{a:mage.name,g:S.G.call})+'――'+ST.fmt(cg.t,{g:S.G.call})+ST.pick(S,JS.MAGE.X.CLASH),why:mage.name+'は生贄 '+mage.plot.kills+'人で条件を整え、'+cg.n+'を呼んで'+S.G.call+'に対抗させた（成功率 +32％）',mag:48});
ST.key(S,o,mage.name+'が'+cg.n+'を召喚');
if(rng()<0.35){mage.alive=false;mage.fate='呼び出した神に連れ去られた（'+JS.hm(h+1)+'）';ST.say(S,{actors:[mage],tag:'代償',text:ST.fmt(ST.pick(S,M.MAGE_PRICE),{a:mage.name}),why:'別の神を呼んだ代償',mag:30});}
}
live=inCave();
if(!live.length){if(!manifest(S,h+1,0.85))C.flee(S,h+2);return;}
}
var rite=live.filter(function(p){return!p.plot;}).sort(function(a,b){return skill(b,'rite')+skill(b,'lore')-skill(a,'rite')-skill(a,'lore');})[0]||live[0];
if(JS.GOALX)bonus+=JS.GOALX.hijackCave(S,live);
if(JS.MAGE){bonus+=JS.MAGE.sabotage(S,live,rite);live=inCave();if(!live.length){if(!manifest(S,h+1,0.85))C.flee(S,h+2);return;}}
var gx=JS.GODEV?JS.GODEV.cave(S,live,rite)||{}:{};
bonus+=gx.bonus||0;if(gx.rite&&alive(gx.rite))rite=gx.rite;
live=inCave();if(!live.length){if(!manifest(S,h+1,0.85))C.flee(S,h+2);return;}
if(!alive(rite)||rite.bound)rite=live[0];
var avgA=live.reduce(function(s0,p){return s0+p.tr.a;},0)/live.length;
var poss=live.filter(function(p){return p.possessed;}).length;
var chance=clamp(0.3+skill(rite,'rite')*0.33+live.length*0.02+avgA*0.1-S.fake*0.14-(S.partial?0.15:0)-poss*0.1+(S.sealBonus||0)+bonus,0.05,0.92);
chance=clamp(chance*HK.Dark.pick(S,1,1,0.8,'kill'),0.05,0.92);
var t=gx.t?ST.fmt(gx.t,{a:rite.name}):rite.name+'が祠の前に進み出た。'+S.G.sol+'――';
if(S.fake&&rng()<0.5)t+='途中で、誰かが記者の言葉を思い出して手を止めかけた。';
var why='成功率 '+Math.round(chance*100)+'％（'+rite.name+'の儀式の力・人数'+live.length+(bonus-(gx.bonus||0)>0?'・呼び出した神の助け':bonus-(gx.bonus||0)<0?'・術者のすり替え':'')+(S.fake?'・信じた偽情報 '+S.fake:'')+(S.partial?'・手がかり不足':'')+(poss?'・取り憑かれた仲間':'')+(gx.why?'・'+gx.why:'')+'）';
if(rng()<chance){
S.result='sealed';
var o2=ST.say(S,{actors:live.concat(taken),tag:'封印',kind:'climax',text:t+(gx.okT||'地の底から響いていた唸り声が、ふっと途絶えた。')+pl(S,PL,'out',M.COLLAPSE),why:why+'――成功',mag:50});
ST.key(S,o2,'封印に成功');
live.forEach(function(p){if(alive(p)&&rng()<(0.06-p.stats.luck*0.005)*HK.Dark.f(S,'kill'))C.die(S,p,'崩れる'+(PL?PL.noun:'洞窟')+'で',PL&&PL.id!=='cave'?PL.die:M.COLLAPSE_DIE);});
var minute=h+1+rng()*1.5,outs=S.P.filter(function(p){return p.alive&& !p.out;});
outs.forEach(function(p){p.taken=false;p.out=true;p.esc=minute;p.fate=p.bound?'縛られたまま連れ出された（'+JS.hm(minute)+'）':'生還（'+JS.hm(minute)+'）';});
ST.say(S,{actors:outs,tag:'脱出',kind:'climax',text:(taken.length?'座敷牢から、'+C.names(taken)+'が助け出された。':'')+(bound.length?'縛られた'+C.names(bound)+'も、引きずるようにして連れ出した。':'')+'霧が晴れ、山道の先に国道の明かりが見えた。一行は振り返らずに走った。',why:'生還 '+outs.length+'人',mag:40});
return;
}
ST.say(S,{actors:live,tag:'失敗',text:t+(gx.ngT||'しかし、何かが足りなかった。'),why:why+'――失敗',mag:40});
if(manifest(S,h+1,0.42+S.P.length*0.04))return;
var vic=taken[0]||live.slice().sort(function(a,b){return a.stats.luck-b.stats.luck;})[0];
if(vic&& !HK.Dark.skip(S,'kill'))C.sacrifice(S,vic,h+1);else if(vic&&vic.taken){vic.taken=false;vic.out=true;vic.esc=h+1;vic.fate='逃げ延びた（'+JS.hm(h+1)+'）';ST.say(S,{actors:[vic],tag:'救出',text:'祭壇へ引き出される直前、'+vic.name+'の縄がゆるんだ。'+vic.name+'は松明の列の隙間をすり抜け、闇の中へ転がり出た。そのまま、山道を駆け下りた。',why:'見張りの隙を突いて逃れた（展開の重さ：穏やか）',mag:30});}
C.flee(S,h+2);
}
function manifest(S,h,pm){
var rng=S.rng,alive=JS.alive;
S.manifested=true;
var form=S.FX?S.FX.form:'闇の奥から、名状しがたい何かが姿を現した。';
var o=ST.say(S,{tag:'顕現',kind:'climax',text:ST.pick(S,M.MANIFEST)+form,why:S.G.name+'が顕現した',mag:54});
ST.key(S,o,S.G.name+'の顕現');
if(JS.LOOP&&JS.LOOP.tryRewind(S,h))return true;
if(JS.MAGE)JS.MAGE.witness(S,h);
if(JS.GODEV){var mr=JS.GODEV.manifest(S,h,pm);if(mr!=null)return mr;}
if(S.counter)pm*=0.35;
var left=S.P.filter(function(p){return p.alive&& !p.out;});
if(!left.length)return true;
if(rng()<pm*HK.Dark.pick(S,0.05,1,2,'kill')){
S.engulf=true;
left.forEach(function(p){p.alive=false;p.taken=false;p.fate=S.G.call+'に呑み込まれた（'+JS.hm(h)+'）';});
var o2=ST.say(S,{actors:left,tag:'全滅',kind:'climax',text:fmtG(S,ST.pick(S,M.ENGULF)),why:'顕現した神が、村ごと呑み込んだ（'+Math.round(pm*100)+'％）',mag:56});
ST.key(S,o2,'村ごと呑み込まれた');
return true;
}
ST.say(S,{kind:'phase',text:fmtG(S,ST.pick(S,M.NO_ENGULF))});
return false;
}
JS.CAVE={climax:climax,manifest:manifest};
})();
});
;
/* ==== js/jashin-loop.js ==== */
HK.Load.def(341,'js/jashin-loop.js',function(){
(function(){
'use strict';
var HK=window.HK,ST=HK.Story,JS=HK.JASHIN,clamp=HK.clamp;
if(!ST|| !JS)return;
var scen=HK.SCENARIOS.jashin;
if(!scen)return;
function L(s){return s.split('|');}
function alive(p){return p.alive&& !p.out&& !p.taken;}
function names(l){return l.map(function(p){return p.name;}).join('・');}
scen.env=scen.env.concat([
{id:'alien',label:'宇宙エンド',type:'select',def:'random',options:[{v:'random',label:'おまかせ（約5％）'},{v:'yes',label:'必ず（祀られているのは宇宙人）'},{v:'no',label:'なし'}],desc:'祀られているのが神ではなく宇宙人で、最後に一人が連れ去られる'},
{id:'relic',label:'時を戻すアーティファクト',type:'select',def:'random',options:[{v:'random',label:'おまかせ（家宝・村で拾うことがある）'},{v:'heir',label:'誰かが家宝として持っている'},{v:'none',label:'なし'}],desc:'神が顕現したとき、持ち主がいれば時間が巻き戻って、到着からやり直せる（一度だけ）'}
]);
var HEIR=[
{n:'祖母の形見の懐中時計',t:'{a}の胸ポケットには、祖母の形見の懐中時計が入っていた。もう何年も、針は動いていない。'},
{n:'家に伝わる砂時計',t:'{a}の鞄の底には、実家の蔵から持ち出した古い砂時計があった。「お守りだから」と、母に持たされたものだ。'},
{n:'曾祖父の銀の鈴',t:'{a}は、曾祖父の代から伝わる小さな銀の鈴を、鍵束につけていた。鳴らすと、音が少し遅れて聞こえる。'},
{n:'家紋入りの古い手鏡',t:'{a}は、家紋の入った古い手鏡を持っていた。覗き込むと、映る自分がほんの一瞬だけ遅れて動く。'}
];
var FOUND=[
{n:'針が逆に回る懐中時計',t:'{a}は、空き家の仏壇の引き出しで、錆びた懐中時計を見つけた。ねじを巻くと、針が逆向きに回り始めた。'},
{n:'「戻」と彫られた石の勾玉',t:'{a}は、祠の裏の土の中から、石の勾玉を掘り出した。裏には一文字だけ「戻」と彫られていた。'},
{n:'割れた日時計の欠片',t:'{a}は、苔むした石碑の根元で、日時計の欠片を拾った。影が、太陽とは逆の方向に伸びていた。'},
{n:'祭りで使われなかった古いお面',t:'{a}は、蔵の奥で埃をかぶったお面を見つけた。裏には、知らない年号と、自分の名前が書かれていた。'}
];
var REWIND=L('{a}の{r}が、ひとりでに熱を帯びた。――世界が、逆さまに巻き取られていく。悲鳴も、炎も、{g}の姿も、すべてが後ろ向きに遠ざかっていった。|{g}の影が一行を覆った瞬間、{a}の{r}が砕けるような音を立てた。気がつくと、村へ続く山道の入り口に立っていた。|音が消えた。{a}の{r}の中で、何かが逆向きに回り始めた。次の瞬間、一行は見覚えのある山道で、マイクロバスを降りたところだった。');
var AGAIN=L('「……今の、夢じゃないよね｜……今のは、夢ではないな｜……今の、夢じゃないですよね」誰かが言った。全員が、同じものを見ていた。|山道の先に、またあの村が見えた。今度は、誰も「素敵な村だね」とは言わなかった。|{a}は手の中の{r}を見つめた。ひびが一本、増えていた。もう、次はない。');
JS.LOOP={
arrive:function(S){
var rng=S.rng,env=S.env;
if(S.loopN)return;
S.loopN=1;
S.alien=env.alien==='yes'||(env.alien!=='no'&&rng()<0.05);
if(env.relic==='none')return;
var cand=S.P.filter(function(p){return!p.villager;});
var heir=env.relic==='heir'?rng.pick(cand):cand.filter(function(p){return rng()<(/^(folk|priest|psychic|occult)$/.test(p.job)?0.08:0.03);})[0];
if(!heir)return;
var it=rng.pick(HEIR);
S.relic={by:heir.i,n:it.n,heir:true};
ST.say(S,{actors:[heir],tag:'家宝',text:ST.fmt(it.t,{a:heir.name}),why:heir.name+'の家に伝わるもの。本人は、ただのお守りだと思っている'});
},
tick:function(S,live,h){
var rng=S.rng;
if(!S.relic&&S.env.relic!=='none'&& !S.rewound){
live.forEach(function(p){
if(S.relic||p.bound)return;
var t=p.action&&p.action.type;
if(rng()<(t==='explore'||t==='lore'?0.009:0.003)+(p.stats.luck-3)*0.001){
var it=rng.pick(FOUND);
S.relic={by:p.i,n:it.n};
ST.say(S,{actors:[p],tag:'拾いもの',text:ST.fmt(it.t,{a:p.name}),why:p.name+'が村で妙なものを拾った（'+(t==='explore'?'探索':t==='lore'?'調べもの':'運')+'）',mag:10});
}
});
}
if(S.alien&&(S.alienHint||0)<3&&rng()<0.12){
var p=rng.pick(live);
S.alienHint=(S.alienHint||0)+1;
ST.say(S,{actors:p?[p]:[],tag:'違和感',text:ST.fmt(ST.pick(S,ALIEN_HINT),{a:p?p.name:'誰か',g:S.G.call}),why:'この村の「神」には、どこか神らしくないところがある',mag:8});
}
},
tryRewind:function(S,h){
if(!S.relic||S.rewound)return false;
var p=S.P[S.relic.by];
if(!p|| !p.alive||p.bound||p.captive||(HK.State&& !HK.State.here(p)))return false;
if(S.rng()>0.75){
ST.say(S,{actors:[p],tag:'沈黙',text:p.name+'の'+S.relic.n+'は、'+S.G.call+'を前にして、ただ冷たいままだった。',why:'アーティファクトは応えなかった（25％）',mag:10});
return false;
}
S.rewind={h:h,by:p.i};
var o=ST.say(S,{actors:[p],tag:'巻き戻り',kind:'climax',text:ST.fmt(ST.pick(S,REWIND),{a:p.name,r:S.relic.n,g:S.G.call}),why:p.name+'の'+S.relic.n+'が、'+S.G.name+'の顕現に応えた',mag:56});
ST.key(S,o,'時間が巻き戻った');
return true;
},
restart:function(S){
if(!S.rewind||S.rewound)return false;
var rw=S.rewind,by=S.P[rw.by];
S.rewound={h:rw.h,by:rw.by,n:S.relic.n,dead:S.P.filter(function(p){return!p.alive;}).map(function(p){return p.i;})};
S.rewind=null;S.loopN=2;
S.P.forEach(function(p){
p.alive=true;p.out=false;p.taken=false;p.esc=null;p.fate='';
p.bound=false;p.boundUntil=null;p.curse=null;p.possessed=false;p.goBackDie=false;
p.m.hp=55+p.stats.stamina*9;p.m.fear=clamp(18+p.tr.ac*12+(S.rewound.dead.indexOf(p.i)>=0?20:0),0,100);
});
S.found=S.G.clues.map(function(c,i){return i;});
S.solved=false;S.partial=false;S.fake=0;S.hold=0;S.shrine=0;S.shrineRage=false;
S.inCave=false;S.engulf=false;S.manifested=false;S.result=null;S.forceEnd=false;S.counter=false;
S.sealBonus=(S.sealBonus||0)+0.12;
ST.step(S,'二周目　到着');
var dead=S.rewound.dead.map(function(i){return S.P[i];});
ST.say(S,{kind:'phase',tag:'やり直し',text:ST.fmt(ST.pick(S,AGAIN),{a:by.name,r:S.relic.n})+(dead.length?names(dead)+'も、そこにいた。自分が一度死んだことを、'+(dead.length>1?'全員':dead[0].name)+'はぼんやりと覚えていた。':''),why:'時間が巻き戻り、到着の時点からやり直す（神の正体は分かっている）',mag:30});
return true;
},
alienEnd:function(S,h){
var rng=S.rng,live=S.P.filter(alive),taken=S.P.filter(function(p){return p.alive&&p.taken;});
ST.step(S,'正体　'+JS.core.label(h+1));
ST.say(S,{kind:'climax',tag:'正体',text:ST.fmt(ST.pick(S,ALIEN_REVEAL),{g:S.G.call,v:S.V}),why:'祀られていたのは、神ではなかった',mag:50});
var pool=taken.concat(live);
if(!pool.length){S.alienEnd={none:true};return;}
var vic=HK.weighted(rng,pool,function(p){return 1+(p.taken?2:0)+(/^(meet|truth|content)$/.test(p.goal.id)?1.5:0)+(/^(occult|streamer|psychic)$/.test(p.job)?1:0)+(5-p.stats.luck)*0.15;});
var rel=live.filter(function(q){return q!==vic&&JS.REL&&JS.REL.bond&&JS.REL.bond(S,q,vic)>=0.7;})[0];
vic.alive=true;vic.out=false;vic.taken=false;vic.gone=true;vic.esc=h+1;vic.fate='宇宙人に連れ去られた（'+JS.hm(h+1)+'）';
var o=ST.say(S,{actors:rel?[vic,rel]:[vic],tag:'連れ去り',kind:'climax',text:ST.fmt(ST.pick(S,ALIEN_TAKE),{a:vic.name})+(rel?ST.fmt(ST.pick(S,ALIEN_REACH),{a:vic.name,b:rel.name}):''),why:vic.name+'が選ばれた（目標・職業・運）',mag:56});
ST.key(S,o,vic.name+'が宇宙へ連れ去られた');
var rest=S.P.filter(function(p){return p!==vic&&p.alive;});
rest.forEach(function(p){p.taken=false;p.out=true;p.bound=false;p.esc=h+2+rng();p.fate='生還・記憶の一部が欠けている（'+JS.hm(p.esc)+'）';});
if(rest.length)ST.say(S,{actors:rest,tag:'朝',kind:'climax',text:ST.fmt(ST.pick(S,ALIEN_WAKE),{n:names(rest),a:vic.name}),why:'残された一行は、村の外で目を覚ました',mag:30});
S.alienEnd={by:vic.i};
S.titleOverride=vic.name+'は光の中へ連れていかれた。'+S.V+'に祀られていたのは、神ではなかった――宇宙エンド';
},
lines:function(S){
var out=[];
if(S.rewound)out.push('時間の巻き戻し：'+S.P[S.rewound.by].name+'の'+S.rewound.n+'で、'+JS.hm(S.rewound.h)+'時点から到着まで（記録は二周目のもの）');
else if(S.relic)out.push('時を戻すもの：'+S.P[S.relic.by].name+'の'+S.relic.n+'（使われなかった）');
if(S.alienEnd)out.push('祀られていたもの：神ではなく、宇宙から来た何か（村での呼び名「'+S.G.call+'」）');
return out;
}
};
var ALIEN_HINT=L('夜空を、音もなく光が横切った。流れ星にしては、遅すぎた。|{a}は、村人の耳の後ろに、小さな金属片が埋め込まれているのを見た。|神社の御神体の鏡には、どの時代のものとも違う、細かな幾何学模様が刻まれていた。|{a}の腕時計が、村に入ってから一秒も進んでいなかった。|{a}は祠の石の表面が、触るとほんのり温かく、規則正しく脈打っていることに気づいた。|古文書の挿絵の「{g}」は、どう見ても、円盤の形をしていた。');
var ALIEN_REVEAL=L('地鳴りとともに、{v}の裏山が割れた。中から現れたのは、山ほどもある銀色の円盤だった。村人たちは一斉にひれ伏した。――「{g}」は、神ではなかった。|祠の奥の岩が、音もなく横に滑った。その先には、青白く光る通路と、見たこともない計器が並んでいた。村が何百年も祀ってきた「{g}」の正体は、宇宙から来た何かだった。|祭りの太鼓が止んだ瞬間、夜空が真昼のように明るくなった。頭上に浮かぶ巨大な光の輪――{v}の人々が「{g}」と呼んできたものは、空の向こうから来ていた。');
var ALIEN_TAKE=L('光の柱が、{a}の真上に降りてきた。{a}の足が、ゆっくりと地面を離れた。「待って、なんで――｜待て、なぜ――｜待ってください、なぜ――」その声ごと、{a}は空へ吸い上げられていった。|細長い指の、背の高い影が三つ、{a}の両腕をそっと取った。{a}は抵抗しなかった。いや、できなかった。光の中へ歩いていく{a}は、なぜか少しだけ笑っていた。|{a}の体が青白い光に包まれ、次の瞬間には消えていた。残ったのは、地面に落ちた{a}の片方の靴だけだった。');
var ALIEN_REACH=L('{b}は{a}の手を掴もうとして、指先が光に触れた。熱くも冷たくもなかった。ただ、届かなかった。|{b}は{a}の名前を叫び続けた。円盤は、一度だけ瞬くように光って、空の向こうへ消えた。');
var ALIEN_WAKE=L('朝、{n}は国道沿いのバス停で目を覚ました。村への道は、どこにもなかった。誰も、{a}がいつからいないのか、うまく思い出せなかった。|{n}は、山のふもとの田んぼの真ん中で目を覚ました。稲が、円を描くように倒れていた。|一行が気づいたとき、手元のスマートフォンの日付は、村に入った日から三日進んでいた。{a}の連絡先だけが、どの端末からも消えていた。');
JS.LOOP.epilogue=function(S){
if(!S.alienEnd||S.alienEnd.none)return null;
var a=S.P[S.alienEnd.by].name;
return ST.fmt(ST.pick(S,L('一年後、{a}の名前で、消印のない絵葉書が届いた。写っていたのは、輪のある青い星だった。|それから毎年、{a}がいなくなった夜になると、決まって同じ流れ星が見える。|{a}のSNSが一度だけ更新された。「元気。こっちはごはんがおいしい｜元気だ。こちらは食事がうまい｜元気です。こちらはごはんがおいしいです」位置情報は、オリオン座の方角を指していた。')),{a:a});
};
})();
});
;
/* ==== js/jashin-feast.js ==== */
HK.Load.def(342,'js/jashin-feast.js',function(){
(function(){
'use strict';
var HK=window.HK,ST=HK.Story,JS=HK.JASHIN,clamp=HK.clamp;
if(!ST|| !JS)return;
function L(s){return s.split('|');}
function alc(p){return HK.alcLevel?HK.alcLevel(p):3;}
function F(S,pool,v){return ST.fmt(ST.pick(S,pool),v);}
var T={
intro:L('日が傾くころ、村長が民宿に顔を出した。「遠いところをようこそ。ささやかですが、集会所に席を用意しました」――断れる雰囲気ではなかった。|夕方、集会所に提灯が灯り、一行は「よそ者を歓迎する宴」に招かれた。膳には山菜と川魚、そして大きな酒樽が並んでいた。|村の年寄りたちが、一行を集会所へ手招きした。「祭りの前の、顔合わせの宴です。今夜は飲んでいってください」'),
minor:L('{a}の前には、甘酒の湯呑みが置かれた。「若い人には、こっちね」――村の女たちは、やけに優しく笑った。|{a}はジュースの瓶を渡され、子どもたちの座る端の席に案内された。'),
dodge:L('{a}は盃に口をつけるふりをして、こっそり膳の下の小鉢に酒を捨てた。|{a}は「明日も早いから｜明日も早いからな｜明日も早いですので」と一杯だけ受け、あとは手のひらで盃を覆い続けた。|{a}は盃を受けるたびに唇を湿らせるだけにして、村人たちの顔を一人ずつ見ていた。'),
weak:L('{a}は一杯目で耳まで真っ赤になった。「ごめん、お酒、弱くて……｜すまない、酒は弱くて……｜すみません、お酒、弱くて……」|{a}は二口で目が据わり、隣の村人の肩に寄りかかって笑い始めた。|{a}は湯呑み半分の酒で、もう呂律が怪しくなっていた。'),
weakSlip:L('酔った{a}は、うっかり「この村、なんか変だよね｜この村は、どこか変だ｜この村、なんか変ですよね」と口にした。座が一瞬、しんと静まった。|{a}は上機嫌で、昼間見た祠の話を村人に聞かせてしまった。村長の目が、すっと細くなった。'),
weakDown:L('{a}はそのまま座布団に突っ伏して、寝息を立て始めた。{b}が肩を貸して、民宿まで連れて帰った。|{a}は宴の途中で青い顔になり、{b}に背中をさすられながら外の空気を吸いに出た。'),
mid:L('{a}は勧められた分だけほどほどに付き合い、愛想よく相槌を打った。|{a}は二、三杯で切り上げ、あとは料理に箸を伸ばした。|{a}はほろ酔いのまま、村人たちの世間話に耳を傾けた。'),
midNote:L('{a}は、酒を注いで回る村人たちの手首に、そろって同じ形の痣があることに気づいた。|{a}は、村長だけが一滴も飲まず、一行の盃の減り方を数えるように見ているのに気づいた。|{a}は、上座の空いた席の前にだけ、手つかずの膳が供えられているのに気づいた。'),
strong:L('{a}は、勧められるそばから盃を空けた。顔色ひとつ変わらない{a}に、村の男たちが面白がって次々と酒を注いだ。|{a}は「いい酒だね｜いい酒だ｜いい酒ですね」と言いながら、村の酒豪と差しで飲み比べを始めた。|{a}は涼しい顔で何杯も盃を重ね、先に酔いの回った村人の隣へ、そっと席を移した。'),
strongLeak:L('すっかり酔った村の男が、{a}に肩を組んで声をひそめた。「よそ者のくせに飲めるな。……気に入ったから教えてやる」――|酔いつぶれかけた老人が、{a}の盃に酒を注ぎながら、ぽつりとこぼした。「昔はな、もっと大勢で祀ったもんだ」――|飲み比べに負けた村の若者が、赤い顔で{a}に打ち明けた。「本当は、祭りなんかやめたいんだ」――'),
strongNone:L('{a}が何杯付き合っても、村人たちは肝心な話になると口をつぐんだ。|{a}は最後まで素面のまま、酔ったふりをする村人たちの目が笑っていないのを見ていた。')
};
var MINOR_SUB=[[/新酒の葡萄酒/g,'搾りたての葡萄のジュース'],[/葡萄酒/g,'葡萄のジュース'],[/御神酒/g,'甘酒'],[/杯を重ねた/g,'杯を何度もおかわりした'],[/酔わせた/g,'眠らせた'],[/酔わされ/g,'眠らされ'],[/酔った/g,'ぼんやりした'],[/酔いが回/g,'眠気が回']];
HK.wrap(ST,'say',function(say0){return function(S,o){
if(S&&S.scen&&S.scen.id==='jashin'&&o&&typeof o.text==='string'&& /酒|酔/.test(o.text)){
var minor=(o.actors||[]).some(function(a){var p=typeof a==='number'?S.P[a]:a;return p&&p.minor;});
if(minor)MINOR_SUB.forEach(function(w){o.text=o.text.replace(w[0],w[1]);});
}
return say0.apply(this,arguments);
};});
var F_=JS.FEAST={
tick:function(S,live,h){
if(S.feastDone|| !live.length||h>=S.deadline-4)return;
var hh=(16+h)%24;
if(hh<18||hh>22)return;
if(h>30){S.feastDone=true;return;}
if(S.rng()>=0.4)return;
S.feastDone=true;
var rng=S.rng,parts=[],whys=[],actors=live.slice();
var strongest=live.filter(function(p){return!p.minor;}).sort(function(x,y){return alc(y)-alc(x);})[0];
live.forEach(function(p){
var a=alc(p),v={a:p.name};
if(p.minor){parts.push(F(S,T.minor,v));return;}
if(p.tr.caution>0.7&&rng()<0.6){parts.push(F(S,T.dodge,v));whys.push(p.name+'：飲むふり（慎重さ）');return;}
if(a<=2){
parts.push(F(S,T.weak,v));
p.m.fear=clamp((p.m.fear||0)-8,0,100);
var r=rng();
if(r<0.35){parts.push(F(S,T.weakSlip,v));S.hostile=clamp((S.hostile||0)+6,0,100);whys.push(p.name+'：酒に弱く、口を滑らせた（村人の敵意 +）');}
else if(r<0.75&&strongest&&strongest!==p&&alc(strongest)>=3){
parts.push(F(S,T.weakDown,{a:p.name,b:strongest.name}));
if(JS.DRAMA&&JS.DRAMA.setRel)JS.DRAMA.setRel(S,p,strongest,0.06);
whys.push(p.name+'：酔いつぶれ、'+strongest.name+'に介抱された');
}else whys.push(p.name+'：酒に弱い（怖さが少し和らいだ）');
return;
}
if(a===3){
parts.push(F(S,T.mid,v));
p.m.fear=clamp((p.m.fear||0)-4,0,100);
if(rng()<0.25+p.tr.caution*0.2){parts.push(F(S,T.midNote,v));p.wary=true;whys.push(p.name+'：ほどほどに付き合い、違和感に気づいた');}
return;
}
parts.push(F(S,T.strong,v));
var left=S.G.clues.map(function(c,k){return k;}).filter(function(k){return S.found.indexOf(k)<0;});
if(left.length&&rng()<(a>=5?0.6:0.45)){
var talk=left.filter(function(k){return S.G.clues[k].type==='talk';}),k=(talk.length?talk:left)[0];
S.found.push(k);p.cnt.clue++;
parts.push(F(S,T.strongLeak,v)+S.G.clues[k].t+'。');
whys.push(p.name+'：酒に強く、酔った村人から聞き出した（手がかり '+S.found.length+'/'+S.G.clues.length+'）');
}else{parts.push(F(S,T.strongNone,v));whys.push(p.name+'：酒に強いが、村人は口を割らなかった');}
});
var fz=HK.Food&&HK.Food.feast(S,live,'feast');
if(fz){parts.push(fz.text);whys.push(fz.why);}
ST.say(S,{actors:actors,tag:'歓迎の宴',text:ST.pick(S,T.intro)+parts.join(''),why:'村の歓迎の宴。酒の強さ（キャラの設定「お酒」、なければ気質から）で過ごし方が変わる。'+(whys.join('／')||''),mag:16});
}
};
})();
});
;
/* ==== js/jashin-mage.js ==== */
HK.Load.def(343,'js/jashin-mage.js',function(){
(function(){
'use strict';
var HK=window.HK,ST=HK.Story,JS=HK.JASHIN,clamp=HK.clamp,M=JS&&JS.MORE;
if(!ST|| !JS|| !M)return;
function L(s){return s.split('|');}
var X={
SCRY:L('{a}は蝋燭を灯し、水を張った鉢の上で古い言葉を唱えた。水面に、知らない景色が映った。|{a}は夜空を見上げ、星の配置を手帳に書き写した。星は、この村の上でだけ、わずかに歪んでいた。|{a}は自分の指先を切り、血を一滴、古い札に垂らした。札の文字が、ひとりでに並び替わった。'),
SCRY_OK:L('――そこに、答えの一端があった。|――{a}は、震える手でそれを書き留めた。'),
SCRY_NG:L('――鉢の水が、黒く濁った。水底から、何かがこちらを覗き返した。{a}は鉢をひっくり返し、しばらく荒い息をついていた。|――見えたのは、見てはならないものだった。{a}の鼻から、血が一筋流れた。'),
WARD:L('{a}は民宿のまわりに塩と灰で線を引き、四隅に奇妙な印を刻んだ。「今夜は、ここから出ないで｜今夜は、ここから出るな｜今夜は、ここから出ないでください」|{a}は窓という窓に、血で書いた護符を貼った。「気休めじゃない。本物の結界だ｜気休めではない。本物の結界だ｜気休めではありません。本物の結界です」'),
WARD_HOLD:L('夜半、村人たちが民宿を取り囲んだ。けれど、{a}の引いた線の手前で、誰ひとり足を踏み出せなかった。|{b}の部屋の障子に、村人の影が映った。影は護符の前で立ち止まり、悔しげに引き返していった。'),
FAMILIAR:L('{a}は口の中で短く唱え、影から黒い鳥を一羽呼び出した。鳥は音もなく、村の奥へ飛んでいった。|{a}の足元の影が、猫の形をとって這い出した。「見てこい｜＝｜見てきてください」――影の猫は、闇に溶けた。'),
FAMILIAR_OK:L('――戻ってきた使い魔が、{a}の耳元で囁いた。|――使い魔の目を通して、{a}は見た。'),
FAMILIAR_NG:L('――使い魔は戻らなかった。夜明け前、民宿の前に、黒い羽根だけが散らばっていた。'),
HEX:L('{a}は村人の家の戸口に、髪と釘で作った呪具を埋めた。その夜、村のあちこちで、誰かが血を吐いて倒れた。|{a}は村長の名を紙に書き、それを囲炉裏で焼いた。翌朝、村長は床から起き上がれなかった。'),
HEX_BACK:L('――呪いは、{a}自身にも返ってきた。{a}は激しく咳き込み、掌に血を吐いた。'),
FOG:L('{a}は山道に向かって両手を広げ、風を呼ぶ言葉を唱えた。村を閉ざしていた霧が、わずかに薄れた。|{a}は村境の道祖神に、自分の血で印を描いた。霧の向こうに、一瞬だけ国道の明かりが見えた。'),
FOG_SOLO:L('――霧が晴れたのは、ほんの数分だった。{a}は振り返らなかった。「悪いな。私は、生き残る方を選ぶ｜すまない。私は、生き残る方を選ぶ｜すみません。私は、生き残る方を選びます」{a}は一人で、山道を駆け下りていった。'),
CALL:L('{a}は夜の神社に忍び込み、本殿に向かって呼びかけの言葉を唱えた。「どうか、御姿を」――地の底で、何かが寝返りを打った。|{a}は村人たちに混じって祭りの稽古を手伝い、祝詞を一言一句書き写した。そして夜、それを一人で、逆から唱えた。|{a}は祠の前に座り込み、夜明けまで動かなかった。「もう少しで、会える｜＝｜もう少しで、会えます」――その目は、恋をしている人のようだった。'),
CALL_VISION:L('――{a}の閉じた瞼の裏に、{g}の輪郭が浮かんだ。'),
CALL_STOP:L('{b}が{a}の腕を掴んだ。「何やってるんだ！　それ、呼び出す方の言葉だろ！｜何をしている！　それは、呼び出す方の言葉だろう！｜何をしているんですか！　それは、呼び出す方の言葉でしょう！」|{b}は{a}の手帳を取り上げた。「封じるんじゃなかったのか。……呼ぶ気なのか｜封じるのではなかったのか。……呼ぶ気なのか｜封じるのではなかったんですか。……呼ぶ気なんですか」'),
PREP:L('{a}は皆が寝静まったあと、仲間の枕元から髪の毛を一本ずつ集めていた。|{a}は民宿の裏で、生贄を捧げるための円を、土の上に何度も描き直していた。「あと、{n}人」|{a}は、食事のあいだ、仲間の一人ひとりを品定めするように眺めていた。|{a}は誰にも見られないように小刀を研いだ。刃に、星の光が映った。'),
BANISH:L('――「下がって｜下がれ｜下がってください」{a}が鋭く言い放ち、何かを宙に描いた。村人たちは見えない壁に弾かれたように後ずさり、闇の中へ逃げていった。|――{a}が投げた灰が、村人たちの目を焼いた。村人たちは悲鳴を上げて散っていった。'),
WITNESS:L('{a}は、顕現した神を恍惚とした顔で見上げた。「ああ……これが……」{a}はふらふらと歩み出し、両腕を広げたまま、神の中へ呑まれていった。|{a}だけが、逃げなかった。「見えた。やっと、見えた｜＝｜見えました。やっと、見えました」――{a}は涙を流しながら笑い、神の足元にひれ伏した。それきり、{a}の姿は見えなくなった。'),
SABOTAGE:L('――そのとき、{a}が封印の祝詞に、別の言葉を重ねた。それは封じる言葉ではなく、呼び覚ます言葉だった。|――{a}は祭壇の印を、こっそり一本だけ書き換えていた。'),
SABOTAGE_STOP:L('――「やめろ！｜＝｜やめてください！」{b}が{a}を突き飛ばした。{a}が書き換えた印に気づいたのは、{b}だけだった。'),
CLASH:L('二柱の神の争いで、洞窟の天井が崩れ、岩盤が軋んだ。人の耳には聞こえない咆哮が、一行の頭の内側で響き続けた。|神と神がもつれ合うたびに、洞窟の闇が裂け、見たこともない星空が覗いた。一行は耳を塞ぎ、ただ地に伏していた。'),
RITUAL_SUMMON:L('生贄の儀の祭壇の前で、{a}が村人たちの前に進み出た。「あなたたちの神には、もう一柱、客がいる｜＝｜あなたたちの神には、もう一柱、客がいます」――{a}が叩きつけた血の石から、もう一柱の神が這い出した。|祭り囃子が最高潮に高まったとき、{a}が祭壇に生贄の血を撒いた。村人たちの祝詞が、悲鳴に変わった。')
};
function mage(p){return!!p.magic;}
function gainClue(S,p,type){
var left=S.G.clues.map(function(c,i){return i;}).filter(function(i){return S.found.indexOf(i)<0;});
if(!left.length)return'';
var pref=left.filter(function(i){return!type||S.G.clues[i].type===type;});
var k=(pref.length?pref:left)[0];
S.found.push(k);p.cnt.clue++;
return S.G.clues[k].t;
}
function cost(p,n){p.m.hp=clamp(p.m.hp-n,0,100);p.m.fear=clamp(p.m.fear+n,0,100);p.cnt.magic=(p.cnt.magic||0)+1;}
function say(S,p,tag,text,why,mag,others){return ST.say(S,{actors:[p].concat(others||[]),tag:tag,text:text,why:why,mag:mag||18});}
function act(S,p,h,live){
if(!mage(p)||p.bound)return false;
var rng=S.rng,g=p.goal.id,night=JS.night(h),left=S.G.clues.length-S.found.length;
if(rng()>(g==='meet'?0.62:0.45))return false;
var plotPrep=p.plot&&p.plot.kills<p.plot.need&& !p.plot.ready;
var opts=[
['scry',left?1+(g==='truth'?1.8:0)+(g==='meet'?0.5:0)+p.tr.a:0],
['ward',night&& !(S.ward>h)&&live.length>1?0.5+(g==='protect'?2.2:0)+p.tr.warmth:0],
['familiar',left?0.7+(g==='content'?1.2:0)+p.tr.cold*0.5:0],
['hex',S.hostile>30?0.3+p.tr.aggr*1.4+p.tr.cold*0.6:0],
['fog',0.2+(g==='escape'?2.4:0)+(p.m.fear>60?0.8:0)],
['call',g==='meet'?2.6:0],
['prep',plotPrep&&night?2:0]
];
var sp=HK.weighted(rng,opts,function(o){return o[1];})[0],t,o;
var gs={meet:'神をこの目で見たい',truth:'村の秘密を暴きたい',protect:'仲間を守りたい',escape:'生きて村を出たい',content:'撮れ高がほしい'}[g];
var whyG=gs?'（目標「'+p.goal.label+'」）':'';
if(sp==='scry'){
cost(p,4);t=ST.fmt(ST.pick(S,X.SCRY),{a:p.name});
if(rng()<0.3+JS.skill(p,'lore')*0.3+JS.skill(p,'rite')*0.25){var c1=gainClue(S,p,'lore');o=say(S,p,'魔術',t+ST.fmt(ST.pick(S,X.SCRY_OK),{a:p.name})+c1+'。','星読み。手がかり '+S.found.length+'/'+S.G.clues.length+whyG,22);return true;}
p.m.fear=clamp(p.m.fear+8,0,100);ST.sayB(S,{actors:[p],tag:'魔術',text:t+ST.fmt(ST.pick(S,X.SCRY_NG),{a:p.name}),why:'星読みに失敗した（恐怖 +8）'},p.name+'の星読みは失敗');return true;
}
if(sp==='ward'){cost(p,3);S.ward=h+8;S.wardBy=p;say(S,p,'魔術',ST.fmt(ST.pick(S,X.WARD),{a:p.name}),p.name+'が結界を張った（8時間、夜の襲撃をはね返しやすい）'+whyG,18);return true;}
if(sp==='familiar'){
cost(p,3);t=ST.fmt(ST.pick(S,X.FAMILIAR),{a:p.name});
if(rng()<0.35+JS.skill(p,'rite')*0.3){var c2=gainClue(S,p,'explore');say(S,p,'魔術',t+ST.fmt(ST.pick(S,X.FAMILIAR_OK),{a:p.name})+c2+'。','使い魔に村を探らせた'+whyG,20);return true;}
ST.sayB(S,{actors:[p],tag:'魔術',text:t+ST.pick(S,X.FAMILIAR_NG),why:'使い魔が戻らなかった'},p.name+'の使い魔は戻らなかった');return true;
}
if(sp==='hex'){
cost(p,5);S.hostile=clamp(S.hostile-12,0,100);t=ST.fmt(ST.pick(S,X.HEX),{a:p.name});
if(rng()<0.3){p.m.hp=clamp(p.m.hp-15,0,100);t+=ST.fmt(ST.pick(S,X.HEX_BACK),{a:p.name});}
say(S,p,'魔術',t,p.name+'が村人を呪った（村人の敵意 -12。攻撃性・冷たさが高い術者ほど使う）',22);return true;
}
if(sp==='fog'){
cost(p,6);t=ST.fmt(ST.pick(S,X.FOG),{a:p.name});
if(g==='escape'&&p.tr.cold+p.tr.aggr*0.5>0.6&&rng()<0.35){
p.out=true;p.esc=h-1+rng()*2;p.fate='魔術で霧を払い、一人で脱出（'+JS.hm(p.esc)+'）';
o=say(S,p,'魔術',t+ST.fmt(ST.pick(S,X.FOG_SOLO),{a:p.name}),'霧を払い、仲間を置いて一人で逃げた（冷たい・目標「生きて村を出る」）',40);
ST.key(S,o,p.name+'が魔術で単独脱出');return true;
}
S.fog=(S.fog||0)+1;say(S,p,'魔術',t,p.name+'が霧を払った（逃げ道が見つかりやすくなる）'+whyG,18);return true;
}
if(sp==='call'){
cost(p,4);S.called=(S.called||0)+1;S.deadline=Math.max(h+4,S.deadline-3);p.m.fear=clamp(p.m.fear-12,0,100);
t=ST.fmt(ST.pick(S,X.CALL),{a:p.name});
var vis=rng()<0.45?gainClue(S,p,'spirit'):'';
if(vis)t+=ST.fmt(ST.pick(S,X.CALL_VISION),{a:p.name,g:S.G.call})+vis+'。';
var others=live.filter(function(q){return q!==p&&JS.alive(q)&& !q.bound;});
var b=others.slice().sort(function(x,y){return JS.skill(y,'obs')-JS.skill(x,'obs');})[0];
if(b&&rng()<JS.skill(b,'obs')*0.4+(b.job==='sleuth'||b.job==='occult'||b.job==='priest'||b.job==='folk'?0.25:0)){
t+=ST.fmt(ST.pick(S,X.CALL_STOP),{a:p.name,b:b.name});
var angry=b.tr.aggr+b.tr.cold*0.5-JS.REL.bond(S,b,p);
if(angry>0.5&&others.length>=1){p.bound=true;p.boundUntil=h+6;p.boundAt='土蔵';t+='一行は'+p.name+'を土蔵に閉じ込めた。';}
}
o=say(S,p,'神を求めて',t,p.name+'は神をこの目で見るために、神に呼びかけている（刻限が3時間早まった'+(vis?'・手がかり +1':'')+(p.bound?'・見咎められて閉じ込められた':'')+'）',26,b&&p.bound?[b]:[]);
if(S.called===1)ST.key(S,o,p.name+'が神を呼び始めた');
return true;
}
if(sp==='prep'){
p.plot.ready=1;p.m.fear=clamp(p.m.fear-4,0,100);
ST.sayB(S,{actors:[p],tag:'支度',text:ST.fmt(ST.pick(S,X.PREP),{a:p.name,n:p.plot.need-p.plot.kills}),why:p.name+'は別の神を呼ぶ支度をしている（次の夜、仲間を狙いやすい）'},p.name+'は何かの支度をしていた');
return true;
}
return false;
}
function defend(S,p,live,t){
var rng=S.rng,h=S.h;
if(S.ward>h&&JS.night(h)&&S.wardBy&&JS.alive(S.wardBy)&&rng()<0.65){
ST.say(S,{actors:[S.wardBy,p],tag:'結界',text:t+'――'+ST.fmt(ST.pick(S,X.WARD_HOLD),{a:S.wardBy.name,b:p.name}),why:S.wardBy.name+'（術者）の結界が、村人をはね返した',mag:22});
return true;
}
var mg=mage(p)&& !p.bound?p:live.filter(function(q){return q!==p&&mage(q)&&JS.alive(q)&& !q.bound&&(p.action.id!=='alone'||JS.REL.bond(S,q,p)>=0.6)&&rng()<0.4+Math.max(0,JS.REL.bond(S,q,p))*0.4;})[0];
if(!mg||(mg.plot&&mg!==p&&rng()<0.6))return false;
if(rng()>0.35+JS.skill(mg,'rite')*0.35)return false;
cost(mg,4);
ST.say(S,{actors:mg===p?[p]:[mg,p],tag:'退魔',text:t+ST.fmt(ST.pick(S,X.BANISH),{a:mg.name}),why:mg.name+'（術者）が魔術で村人を退けた（儀式の力）',mag:24});
return true;
}
function sabotage(S,live,rite){
var rng=S.rng;
var m=live.filter(function(p){return mage(p)&& !p.bound&&p.goal.id==='meet';})[0];
if(!m||rng()>0.35+m.tr.cold*0.3+(m.plot?0.2:0)-m.tr.warmth*0.2)return 0;
var t=ST.fmt(ST.pick(S,X.SABOTAGE),{a:m.name});
var others=live.filter(function(q){return q!==m;});
var b=others.slice().sort(function(x,y){return JS.skill(y,'obs')-JS.skill(x,'obs');})[0];
if(b&&rng()<JS.skill(b,'obs')*0.5+(b.job==='sleuth'?0.3:0)+(b.job==='occult'||b.job==='priest'||b.job==='folk'||b.job==='mage'?0.2:0)){
m.bound=true;m.boundAt='洞窟の奥';
ST.say(S,{actors:[m,b],tag:'すり替え',kind:'climax',text:'封印の儀の最中だった。'+t.replace(/^――/,'')+ST.fmt(ST.pick(S,X.SABOTAGE_STOP),{a:m.name,b:b.name})+'一行は'+m.name+'を岩に縛りつけた。',why:m.name+'は神を見るために封印の儀をすり替えようとしたが、'+b.name+'に見抜かれた',mag:40});
return 0;
}
S.mageCalled=m;
ST.say(S,{actors:[m],tag:'すり替え',kind:'climax',text:'封印の儀の最中だった。'+t.replace(/^――/,''),why:m.name+'は神をこの目で見るために、封印の儀をすり替えた（成功率 -30％）',mag:40});
return-0.3;
}
function witness(S,h){
var rng=S.rng;
var m=S.mageCalled&&S.mageCalled.alive&& !S.mageCalled.out?S.mageCalled:S.P.filter(function(p){return mage(p)&&p.alive&& !p.out&&p.goal.id==='meet'&&rng()<0.5;})[0];
if(!m)return;
m.alive=false;m.bound=false;m.taken=false;m.fate='神をその目で見た（'+JS.hm(h)+'）';
var o=ST.say(S,{actors:[m],tag:'神を見た',kind:'climax',text:ST.fmt(ST.pick(S,X.WITNESS),{a:m.name}),why:m.name+'の目標「'+m.goal.label+'」は、叶った',mag:46});
ST.key(S,o,m.name+'が神を見た');
}
function ritualSummon(S,h){
var rng=S.rng,C=JS.core;
var m=S.P.filter(function(p){return p.plot&&p.alive&& !p.out&& !p.bound;})[0];
if(!m)return false;
if(m.plot.kills<m.plot.need){
var vs=S.P.filter(function(q){return q!==m&&JS.alive(q)&& !q.bound;}).sort(function(a,b){return JS.REL.bond(S,m,a)-JS.REL.bond(S,m,b)||a.stats.luck-b.stats.luck;});
if(!vs.length)return false;
C.die(S,vs[0],'儀式を企む'+m.name+'に生贄にされて',[ST.fmt(ST.pick(S,M.MAGE_PUSH),{a:m.name,v:'{a}'})]);
m.plot.kills++;
if(JS.detectMage(S,m,true))return false;
}
var cg=m.plot.god,wasTaken=m.taken;m.taken=false;
var o=ST.say(S,{actors:[m],tag:'召喚',kind:'climax',text:(wasTaken?'生贄として祭壇に引き出された'+m.name+'が、縄をほどいて笑った。':'')+ST.fmt(ST.pick(S,X.RITUAL_SUMMON),{a:m.name})+'――'+ST.fmt(cg.t,{g:S.G.call})+ST.pick(S,X.CLASH),why:'刻限を過ぎても、'+m.name+'は生贄 '+m.plot.kills+'人で条件を整え、'+cg.n+'を呼んだ（神が村を呑み込みにくくなり、逃げやすくなる）',mag:48});
ST.key(S,o,m.name+'が'+cg.n+'を召喚');
S.counter=true;S.fleeBonus=(S.fleeBonus||0)+0.15;
if(rng()<0.35){m.alive=false;m.fate='呼び出した神に連れ去られた（'+JS.hm(h)+'）';ST.say(S,{actors:[m],tag:'代償',text:ST.fmt(ST.pick(S,M.MAGE_PRICE),{a:m.name}),why:'別の神を呼んだ代償（35％）',mag:30});}
return true;
}
JS.MAGE={act:act,defend:defend,sabotage:sabotage,witness:witness,ritualSummon:ritualSummon,X:X};
})();
});
;
/* ==== js/jashin-goals-text.js ==== */
HK.Load.def(344,'js/jashin-goals-text.js',function(){
(function(){
'use strict';
var JS=window.HK.JASHIN;
if(!JS)return;
function L(s){return s.split('|');}
JS.GT={
TENSE:{
uneasy:L('誰も口には出さなかったが、一行のあいだに、薄い膜のような不安が張っていた。|笑い声が減った。誰かが廊下を歩くたびに、全員が振り向くようになった。'),
lost:L('消えた仲間の荷物は、部屋に置かれたままだった。誰も、それに触れようとしなかった。|「どこかで迷ってるだけだよ｜どこかで迷っているだけだ｜どこかで迷っているだけです」――そう言った本人の声が、一番震えていた。'),
dead:L('仲間の死体を見てから、一行は二人以上でしか動かなくなった。|誰もが、互いの顔色を窺うようになった。村人だけでなく、仲間の中にも――。'),
murder:L('仲間の誰かが、仲間を殺したのかもしれない。その考えが、一行の空気を変えた。|夕食の席で、誰も箸をつけなかった。皿に何か入っていても、おかしくなかった。'),
edge:L('もう、目標がどうこうと言っている場合ではなかった。生きて、ここを出る。それだけだった。|夜が来るのが、これほど怖いと思ったことはなかった。')
},
DROP:{
love:L('{a}は、恋どころではなくなっていた。|{a}は{b}の横顔を見て、首を振った。「……今は、生き延びるのが先だ｜＝｜……今は、生き延びるのが先です」'),
steal:L('{a}は、盗んだ品の入った鞄を見下ろした。借金より、命の方が大事だった。|{a}の頭から、借金のことが消えた。今はただ、生きて帰りたかった。'),
murder:L('{a}は、隠していた凶器から手を離した。――殺すより先に、殺されるかもしれない。|{a}は{b}を見た。殺意は消えていなかった。けれど、今はそれどころではなかった。'),
hijack:L('{a}は、儀式の手順を書きつけた紙を握りつぶした。乗っ取る前に、自分が喰われては意味がない。|{a}は小さく舌打ちした。「……計画は、後回し｜……計画は、後回しだ｜……計画は、後回しです」'),
content:L('{a}はカメラを下ろした。「……撮ってる場合じゃない｜……撮っている場合ではない｜……撮っている場合ではありません」|{a}の配信画面には、もう誰も笑っていないコメントが流れていた。'),
solve:L('{a}は手帳を閉じた。「推理は、生きて帰ってからだ｜＝｜推理は、生きて帰ってからです」|{a}は、事件より先に、この村から逃げる道を探し始めた。'),
deny:L('{a}は、迷信だと笑うのをやめた。|{a}「……迷信なら、よかったのに｜……迷信なら、よかったのだがな｜……迷信であってほしかったです」'),
find:L('{a}は、捜していた人の写真を胸ポケットにしまった。「……ごめん。今は、自分が生き残らないと｜……すまない。今は、自分が生き残るのが先だ｜……ごめんなさい。今は、自分が生き残らないといけません」|{a}は、捜し人のことを一度だけ思い、それから前を向いた。'),
meet:L('{a}の目から、熱が引いた。神を見る前に、死んでは元も子もない。'),
def:L('{a}は、自分の目的をいったん脇に置いた。')
},
BACK:L('少し落ち着きを取り戻した{a}は、また自分の目的のことを考え始めた。|騒ぎが一段落すると、{a}の目に、もとの光が戻ってきた。'),
LOVE_PICK:L('{a}は、{b}のことが、少し気になっていた。|{a}は、この旅の間に{b}と距離を縮めようと決めていた。'),
LOVE_JOB:{
celeb:L('{a}は{b}に「特別ね｜特別だ｜特別ですよ」と言って、手帳にサインを書いてあげた。名前の横に、小さなハートが添えてあった。|{a}は、人前で見せる余裕の笑顔を、{b}だけに向けた。'),
musician:L('{a}は囲炉裏端でギターを取り出し、{b}のために一曲弾き語った。|{a}は{b}の名前を歌詞に入れて、即興で歌ってみせた。'),
streamer:L('{a}は{b}に「一緒に配信出ない？　絶対映えるって｜一緒に配信に出ないか？　絶対に映える｜一緒に配信に出ませんか？　絶対映えますよ」と誘った。|{a}は配信を切って、{b}にだけ「今のはオフレコね｜今のはオフレコだ｜今のはオフレコですよ」と笑った。'),
doctor:L('{a}は、{b}の手の擦り傷を、丁寧に手当てした。必要以上に、長く。|{a}は{b}の脈を取るふりをして、手を握った。'),
police:L('{a}は「夜道は危ないから｜夜道は危ない｜夜道は危ないですから」と、{b}を民宿まで送った。帰り道、少しだけ遠回りをした。|{a}は{b}に、警棒の構え方を手取り足取り教えた。'),
student:L('{a}は{b}を誘って、村の駄菓子屋でラムネを二本買った。|{a}は{b}に、こっそり自分のお菓子を分けた。'),
priest:L('{a}は{b}に、手作りのお守りを渡した。「あなたのことは、私が祈っておくね｜あなたのことは、私が祈っておく｜あなたのことは、私が祈っておきます」'),
detective:L('{a}は{b}の何気ない一言を褒めた。「あなたの観察眼、なかなかのものだね｜あなたの観察眼は、なかなかのものだ｜あなたの観察眼は、なかなかのものですね」'),
sleuth:L('{a}は{b}に、推理の助手を頼んだ。半分は口実だった。'),
writer:L('{a}は{b}に「次の作品の主人公のモデルになってくれない？｜次の作品の主人公のモデルになってくれないか｜次の作品の主人公のモデルになっていただけませんか」と言った。'),
def:L('{a}は{b}の隣に座って、他愛のない話をした。|{a}は{b}に温かいお茶を淹れて持っていった。|{a}は、怖がる{b}の手を、そっと握った。')
},
LOVE_YES:L('{b}は、少し照れたように笑った。|{b}の頬が、ほんのり赤くなった。|{b}は{a}の肩に、こつんと頭を預けた。'),
LOVE_NO:L('{b}は「そういうの、今はいい｜そういうことは、今はいい｜そういうのは、今はいいです」と、そっけなく席を立った。|{b}は困ったように笑って、話を逸らした。|{b}は、{a}の手をやんわりと外した。'),
LOVE_RIVAL:L('{c}は、{a}が{b}に近づくのを、面白くなさそうに見ていた。|{c}は{a}を呼び止めた。「……{b}に、あんまり馴れ馴れしくするなよ｜……{b}に、あまり馴れ馴れしくするな｜……{b}に、あまり馴れ馴れしくしないでください」'),
LOVE_CONFESS:L('夜、{a}は{b}を民宿の縁側に呼び出した。{a}「……こんなときに言うことじゃないって、分かってる。でも、好きだ｜……こんなときに言うことではないと、分かっている。だが、好きだ｜……こんなときに言うことではないと、分かっています。でも、好きです」|{a}は、吊り橋の上で足を止めた。{a}「生きて帰れたら……いや、今言う。付き合ってほしい｜生きて帰れたら……いや、今言う。付き合ってくれ｜生きて帰れたら……いえ、今言います。付き合ってください」|{a}は、震える{b}を抱き寄せて囁いた。{a}「明日死ぬかもしれないなら、今言わせて。好きなんだ｜明日死ぬかもしれないなら、今言わせてくれ。好きだ｜明日死ぬかもしれないなら、今言わせてください。好きなんです」'),
LOVE_OK:L('{b}は、しばらく黙っていた。それから、{a}の手を握り返した。{b}「……生きて帰ろう。二人で｜＝｜……二人で、生きて帰りましょう」|{b}は小さく頷いた。{b}「……私も。ずっと、そう思ってた｜……私もだ。ずっと、そう思っていた｜……私もです。ずっと、そう思っていました」'),
LOVE_FAIL:L('{b}は目を伏せた。{b}「……ごめん｜……すまない｜……ごめんなさい」――{a}は「そっか｜そうか｜そうですか」とだけ言って、笑ってみせた。|{b}「気持ちは嬉しい。でも、今は考えられない｜気持ちは嬉しい。だが、今は考えられない｜お気持ちは嬉しいです。でも、今は考えられません」'),
DEBT:L('{a}には、{x}の借金があった。返済の期日は、来週だった。|{a}の携帯には、取り立ての留守電が十件以上残っていた。残りは{x}。'),
STEAL:{
offer:{n:'神社の賽銭と供物',v:5,risk:0.25,t:L('{a}は人目を盗んで、神社の賽銭箱の底をこじ開けた。|{a}は祭壇に供えられた古い銀細工を、そっと袖に落とした。')},
kura:{n:'蔵の骨董',v:25,risk:0.4,clue:0.3,t:L('{a}は夜中に村の蔵の錠前を外し、桐箱に入った古い茶碗を抱えて出てきた。|{a}は蔵の奥で、古い小判の詰まった壺を見つけた。')},
elder:{n:'村長の家の金庫',v:45,risk:0.55,clue:0.55,t:L('{a}は村長の留守を狙って、仏間の奥の金庫を開けた。|{a}は村長の家の床下に、油紙に包まれた札束を見つけた。')},
party:{n:'仲間の財布',v:3,risk:0.3,party:1,t:L('{a}は、眠っている仲間の鞄から、財布を抜き取った。|{a}は、{b}の上着のポケットに手を滑り込ませた。')},
shintai:{n:'御神体',v:100,risk:0.5,sacred:1,t:L('{a}は本殿の奥に忍び込み、錦の布に包まれた御神体を抱えて出てきた。「これ一つで、全部返せる｜＝｜これ一つで、全部返せます」|{a}は御神体の鏡を祭壇から外し、リュックに押し込んだ。')}
},
STEAL_JOB:{
police:'{a}は「見回りだよ｜見回りだ｜見回りです」と言って、村の家々に上がり込んだ。',
doctor:'{a}は往診のふりをして、村の家に入った。',
writer:'{a}は「取材だよ｜取材だ｜取材です」と言って、蔵の中を見せてもらった。',
celeb:'{a}はサインを配りながら、村人の家の中を物色した。',
streamer:'{a}は配信を切り忘れたまま、盗みに入った。',
musician:'{a}は祭りの手伝いのふりをして、神社に入り込んだ。',
priest:'{a}は神職の装束のまま本殿に上がった。誰も、止めなかった。',
civ:'{a}は、震える手で自分に言い聞かせた。「……一回だけ｜……一回だけだ｜……一回だけです」'
},
STEAL_OK:L('――誰にも、見られなかった。|――{a}は品物を鞄の底に押し込み、何食わぬ顔で戻った。'),
STEAL_CLUE:L('品物の下から、古い帳面が出てきた。歴代の生贄の名前が、びっしりと書き連ねてあった。――|金庫の奥に、祭りの手順を記した巻物が入っていた。――'),
STEAL_VILLAGE:L('――「泥棒！」村人の叫び声が響いた。{a}は袋叩きにされ、命からがら民宿へ逃げ帰った。|――戸口に、鍬を持った村人が立っていた。村人は何も言わずに、{a}を見つめていた。'),
STEAL_PARTY:L('――{b}が、その手を掴んだ。{b}「……何してる｜……何をしている｜……何をしているんですか」|――顔を上げると、{b}がこちらを見ていた。{b}「……嘘でしょ｜……嘘だろう｜……嘘でしょう」'),
STEAL_COP:L('{b}は無言で、{a}の手首に手錠をかけた。「事情は、あとで聞く｜＝｜事情は、あとで聞きます」'),
STEAL_RAGE:L('その夜、村じゅうの犬が一斉に吠え始めた。地の底から、{g}の怒りが響いてきた。|祭り囃子の音が、急に早くなった。村人たちは、御神体がないことに気づいたのだ。'),
STEAL_DONE:L('{a}は鞄の重みを確かめた。{a}「……これで、返せる｜＝｜……これで、返せます」――あとは、生きて帰るだけだった。'),
MURDER_WHY:{
grudge:'{b}への恨み（{r}）',
past:'{b}との昔の因縁（誰にも話していない）',
money:'{b}にかけた保険金',
despair:'自暴自棄。誰でもよかった（狙いは{b}）',
thrill:'ただ、人を殺してみたかった（狙いは{b}）'
},
MURDER_HINT:L('{a}は、{b}の背中を、じっと見ていた。|{a}は、{b}が笑うたびに、目を逸らした。|{a}は、誰にも見られないように、荷物の底の何かを確かめた。'),
WEAPON:{doctor:'劇薬の小瓶',police:'拳銃',priest:'御神刀',musician:'ギターの弦',writer:'ペーパーナイフ',streamer:'自撮り棒',prof:'古い短刀',student:'カッター',celeb:'睡眠薬',folk:'鉈',def:'登山用のナイフ'},
MURDER_PREP:L('{a}は、{x}を手ぬぐいに包んで、懐にしまった。|{a}は、{b}の寝床の位置を、さりげなく確かめた。|{a}は、{x}を握ったまま、長いこと動かなかった。'),
MURDER_DO:{
doctor:L('{a}は「眠れないなら」と、{b}に湯呑みを差し出した。中身は、{x}を溶かした白湯だった。'),
police:L('{a}は{b}を見回りに誘い出し、村はずれの林で、{x}を抜いた。'),
musician:L('{a}は、背後から{b}の首に{x}を回した。'),
def:L('{a}は、一人になった{b}の背後に忍び寄り、{x}を振り下ろした。|{a}は{b}を「見せたいものがある｜＝｜見せたいものがあります」と崖の上へ誘い、背中を押した。|{a}は、眠っている{b}の顔に、枕を押し当てた。')
},
MURDER_DEATH:L('翌朝、{a}は村はずれの用水路に浮かんでいた。村人の仕業に見えた。|{a}は、崖の下で冷たくなっていた。足を滑らせたように見えた。|{a}は、布団の中で息をしていなかった。外から入った形跡は、なかった。'),
MURDER_FAIL:L('――{b}が振り向いた。{b}「……何してる！｜……何をしている！｜……何をしているんですか！」{b}は{a}を突き飛ばし、民宿へ逃げ帰った。|――{b}はとっさに身をかわした。腕に深い傷を負いながら、{b}は闇の中へ逃げた。'),
MURDER_AFTER:{
despair:L('{a}は、血のついた手を見下ろしたまま、笑い出した。もう、どうでもよかった。'),
def:L('{a}は手を洗い、何事もなかったように民宿へ戻った。|{a}は{b}の遺体に背を向けた。「……村の連中のせいにすればいい｜＝｜……村の連中のせいにすればいいでしょう」')
},
MURDER_SURRENDER:L('{a}は皆の前に進み出た。{a}「――私がやった。{b}を殺したのは、私だ｜＝｜――私がやりました。{b}を殺したのは、私です」――{a}は抵抗もせず、両手を差し出した。'),
MURDER_DETECT:L('{b}は、{a}の袖口の染みに気づいた。{b}「……その染み、何？｜……その染みは何だ｜……その染みは何ですか」|{b}は、{a}の荷物から、{x}を見つけた。拭き取ったはずの跡が、まだ残っていた。|{b}「{v}さんが死んだ時間、部屋にいなかったよね。……どこにいたの？｜{v}さんが死んだ時間、部屋にいなかったな。……どこにいたんだ｜{v}さんが亡くなった時間、部屋にいませんでしたよね。……どこにいたんですか」'),
MURDER_BOUND:L('一行は{a}を取り押さえ、土蔵の柱に縛りつけた。{a}は、最後まで何も言わなかった。|{a}は暴れたが、すぐに押さえ込まれた。縄が、手首に食い込んだ。'),
MURDER_KILLED:L('揉み合ううちに、{a}は石段から転げ落ちた。起き上がることは、なかった。|一行の怒りは止まらなかった。{a}は、仲間だった者たちの手で裁かれた。'),
SLEUTH_MURDER:L('「犯人は――{c}さん、あなただよ｜犯人は――{c}さん、あなただ｜犯人は――{c}さん、あなたです」{a}は静かに言った。「村人の仕業に見せかけてた。でも、村人なら、遺体をあんなふうに整えたりはしない｜村人の仕業に見せかけていた。だが、村人なら、遺体をあんなふうに整えたりはしない｜村人の仕業に見せかけていました。けれど、村人なら、遺体をあんなふうに整えたりはしません」|{a}は手帳を閉じた。「{c}さん。あなたには、動機があった。そして、あの時間、あなただけが一人だった｜＝｜{c}さん。あなたには、動機がありました。そして、あの時間、あなただけが一人でした」'),
HJ_HINT:L('{a}は、祭りの段取りを、誰よりも熱心に聞いていた。|{a}は、神社の方を見て、小さく呟いた。{a}「……あの祭り、私なら、もっと上手くやれる｜……あの祭りは、私なら、もっと上手くやれる｜……あの祭り、私なら、もっと上手くやれます」'),
HJ_PREP:{
priest:L('{a}は宮司に頭を下げ、祝詞の節回しを一節ずつ教わった。宮司は、同業者の熱心さを喜んだ。'),
folk:L('{a}は村の古文書を借り受け、祭文の欠けた一節を書き写した。'),
prof:L('{a}は蔵の古文書から、儀式の手順の「本来の形」を読み解いた。'),
occult:L('{a}は神社の石碑の文字を拓本に取り、夜通し読み解いた。'),
def:L('{a}は祭りの手伝いを買って出て、祭壇の配置を目に焼きつけた。|{a}は村の長老に取り入り、祭りの「裏の作法」を聞き出した。')
},
HJ_TOOL:L('{a}は夜中に本殿へ忍び込み、祭具の鈴を一つ持ち出した。|{a}は、祭壇に敷く白布の端に、自分の血で印を描いた。'),
HJ_VILLAGE:L('{a}が祭りの支度を手伝うと、村人たちの目つきが、少しだけ和らいだ。|村の老婆が、{a}にだけ、そっと耳打ちした。「あんた、筋がええ」'),
HJ_TRY:L('祝詞が最高潮に高まったとき、{a}が祭壇の前に進み出た。宮司の声に、{a}の声が重なり――そして、上書きした。|{a}は宮司の手から鈴を奪い、知らない節回しで振り鳴らした。祭り囃子が、ぴたりと止んだ。'),
HJ_SAVE:L('{g}の気配が、{a}の声に従って、ゆっくりと地の底へ引いていった。{a}「――帰って。今日の生贄は、ない｜――帰れ。今日の生贄は、ない｜――お帰りください。今日の生贄は、ありません」村人たちは、呆然と立ち尽くした。|{a}は、祭壇に向かって静かに言った。{a}「あなたを呼んだのは、私だ。だから、私が帰す｜＝｜あなたを呼んだのは、私です。だから、私が帰します」――唸り声が遠ざかり、提灯の火が一つずつ消えた。'),
HJ_RULE:L('{g}の気配が、{a}の足元にひれ伏した。{a}は振り返り、笑った。{a}「今日からは、私が祭主だ。――生贄は、私が選ぶ｜＝｜今日からは、私が祭主です。――生贄は、私が選びます」|村人たちが、一斉に{a}の前に膝をついた。{a}の目は、もう仲間を見ていなかった。'),
HJ_PICK:L('{a}の指が、{b}を指した。{b}「……嘘でしょ｜……嘘だろう｜……嘘でしょう」――村人たちが、{b}の腕を掴んだ。'),
HJ_FAIL:L('――しかし、{g}は{a}の声に応えなかった。宮司が叫んだ。「その者を捕らえよ！　祭りを穢した！」|――祭壇の炎が、{a}の方へ噴き上がった。{g}は、偽の祭主を許さなかった。'),
HJ_STAY:L('一行が村を逃げ出すとき、{a}は神社の石段の上から、それを見下ろしていた。追ってくる者は、いなかった。'),
HJ_CAVE_SAVE:L('封印の儀の最中、{a}が祝詞の最後の一節を書き換えた。{g}の力が、祠ではなく、{a}の掌に吸い込まれていった。{a}「……封じるより、従わせる方が確実だ｜＝｜……封じるより、従わせる方が確実です」'),
HJ_CAVE_RULE:L('封印の儀の最中、{a}が祝詞を途中で止めた。{a}「封じる？　もったいない｜封じるだと？　もったいない｜封じるのですか？　もったいないです」――{a}は、祠に眠るものを、自分の名で呼び覚まそうとした。'),
HJ_CAVE_STOP:L('――{b}が{a}の口を塞いだ。{b}「何を言ってる！　それは、封じる言葉じゃない！｜何を言っている！　それは、封じる言葉ではない！｜何を言っているんですか！　それは、封じる言葉ではありません！」'),
SOLVE_LOOK:L('{a}は現場に屈み込み、地面の跡を一つずつ手帳に書き写した。|{a}は、仲間一人ひとりに、昨夜どこにいたかを尋ねて回った。|{a}は、遺体が見つかった場所を、何度も歩いて往復した。'),
SOLVE_IDLE:L('{a}は、失踪事件の資料を広げ、村の地図と見比べた。|{a}は、村人の言葉の矛盾を、一つずつ書き出していった。')
};
})();
});
;
/* ==== js/jashin-goals.js ==== */
HK.Load.def(345,'js/jashin-goals.js',function(){
(function(){
'use strict';
var HK=window.HK,ST=HK.Story,JS=HK.JASHIN,clamp=HK.clamp;
if(!ST|| !JS|| !JS.GT)return;
var T=JS.GT;
function pk(S,a){return ST.pick(S,a);}
function F(t,m){return ST.fmt(t,m);}
function al(p){return JS.alive(p);}
function bond(S,a,b){return JS.REL?JS.REL.bond(S,a,b):0;}
function setRel(S,a,b,d,lab,from){if(JS.DRAMA)JS.DRAMA.setRel(S,a,b,d,lab,from);}
function edge(S,a,b,lab,cls,from){if(JS.DRAMA)JS.DRAMA.edge(S,a,b,lab,cls,from);}
function canLove(a,b){return!HK.canLove||(HK.canLove(a,b)&&HK.canLove(b,a));}
function jobT(map,p){return map[p.job]||map.def;}
function note(p,s){if(p.notes.indexOf(s)<0)p.notes.push(s);}
var PERSONAL={love:1,steal:1,murder:1,hijack:1,content:1,solve:1,deny:1,find:1,meet:1,ritual:1};
function tension(S,h){
var dead=S.P.filter(function(p){return!p.alive&& !p.out;}).length,lost=S.P.filter(function(p){return p.taken;}).length;
var mur=(S.cases||[]).filter(function(c){return c.killer;}).length+(S.murders||0);
var v=dead*18+lost*14+mur*12+(S.vmurder?8:0)+h/Math.max(8,S.deadline)*25+(S.hostile-30)/3;
S.tension=clamp(v,0,100);
S.tenseCause=mur?'murder':dead?'dead':lost?'lost':'uneasy';
return S.tension;
}
function tick(S,live,h){
var rng=S.rng,t=tension(S,h);
var lv=t>=80?3:t>=55?2:t>=30?1:0;
if(lv>(S.tenseLv||0)){
S.tenseLv=lv;
var pool=lv===3?T.TENSE.edge:T.TENSE[S.tenseCause];
ST.say(S,{kind:'phase',tag:'緊迫',text:pk(S,pool),why:'緊迫感 '+Math.round(t)+'（'+{murder:'仲間の中に殺人者がいるかもしれない',dead:'仲間が死んだ',lost:'仲間が消えた',uneasy:'刻限と村人の敵意'}[S.tenseCause]+'）。生きて帰りたい人ほど、自分の目標より脱出や村の秘密を優先する'});
}
live.forEach(function(p){
if(!al(p)||p.bound|| !p.goal0|| !PERSONAL[p.goal0.id])return;
var surv=p.surv!=null?p.surv:1;
if(p.goal===p.goal0){
var ch=Math.pow(t/100,1.6)*surv*(0.45+p.tr.caution*0.4+p.m.fear/220)*0.55;
if(rng()>ch)return;
var ng=p.m.fear>60||p.tr.caution>0.6?'escape':p.tr.a>0.55?'truth':p.tr.np>0.6?'protect':'escape';
var b=p.love&&p.love.t||p.mur&&p.mur.t||null;
p.goal=JS.GOAL[ng];
ST.sayB(S,{actors:[p],tag:'優先',text:F(pk(S,T.DROP[p.goal0.id]||T.DROP.def),{a:p.name,b:b?b.name:''}),why:'緊迫感 '+Math.round(t)+'。'+p.name+'は目標「'+p.goal0.label+'」を後回しにして、「'+p.goal.label+'」を優先した（生きて帰りたい気持ち・慎重さ・恐怖）'},p.name+'は目標を後回しにした');
}else if(rng()<0.12*(1-t/100)&&p.m.fear<55){
p.goal=p.goal0;
ST.sayB(S,{actors:[p],text:F(pk(S,T.BACK),{a:p.name}),why:p.name+'は、目標「'+p.goal0.label+'」に戻った（緊迫感が和らいだ）'},p.name+'は目標に戻った');
}
});
}
function arrive(S){
var rng=S.rng;
S.P.forEach(function(p){
var g=p.goal.id;
if(g==='steal'){p.debt=(3+Math.floor(rng()*18))*10;p.loot=0;ST.sayB(S,{actors:[p],tag:'借金',text:F(pk(S,T.DEBT),{a:p.name,x:p.debt*10+'万円'}),why:p.name+'の本当の目標は「借金返済のために盗む」（衝動・CPの低さ）'},p.name+'には借金があった');}
if(g==='murder')setupMurder(S,p);
if(g==='hijack'){p.hj={pow:0,prep:0};ST.sayB(S,{actors:[p],tag:'企み',text:F(pk(S,T.HJ_HINT),{a:p.name}),why:p.name+'の本当の目標は「村の儀式を乗っ取る」（'+JS.core.jobOf(p).label+'として近づく）'},p.name+'は祭りに興味津々だった');}
});
}
function act(S,p,h,live){
var g=p.goal.id,rng=S.rng;
if(!PERSONAL[g]||p.bound)return false;
if(p.m.fear>75&&(p.surv||1)>0.5&&rng()<0.55)return false;
if(g==='love')return love(S,p,h,live);
if(g==='steal')return steal(S,p,h,live);
if(g==='murder')return murder(S,p,h,live);
if(g==='hijack')return hijackPrep(S,p,h);
if(g==='solve')return solve(S,p,h);
return false;
}
function love(S,p,h,live){
var rng=S.rng;
if(rng()>0.5*(ST.romK?ST.romK(S):1))return false;
var L0=p.love||(p.love={t:null,pt:0,tries:0});
if(L0.done)return false;
if(!L0.t|| !al(L0.t)){
var cs=live.filter(function(q){return q!==p&& !q.bound&&canLove(p,q)&& !(HK.Avoid&&HK.Avoid.of(S,p,q))&&(!HK.Poly||HK.Poly.storyCan(S,p,q))&& !(S.ties||[]).some(function(t){return((t.a===p.i&&t.b===q.i)||(t.a===q.i&&t.b===p.i))&&HK.tieNoLove(t);})&& !(L0.no&&L0.no.indexOf(q.i)>=0);});
if(!cs.length)return false;
L0.t=HK.weighted(rng,cs,function(q){return 1+Math.max(0,bond(S,p,q))*2+q.tr.warmth;});L0.pt=0;
ST.sayB(S,{actors:[p,L0.t],tag:'恋',text:F(pk(S,T.LOVE_PICK),{a:p.name,b:L0.t.name}),why:p.name+'の目標は「恋人を作る」（FC・NP・衝動）'},p.name+'は'+L0.t.name+'が気になっていた');
return true;
}
var b=L0.t,m={a:p.name,b:b.name};
if(HK.Avoid&&HK.Avoid.of(S,p,b)){L0.t=null;L0.pt=0;return false;}
if(L0.pt>=2&&bond(S,p,b)>=0.3){
var ok=(!HK.Poly||HK.Poly.storyCan(S,p,b))&&rng()<0.25+bond(S,b,p)*0.5+b.tr.fc*0.15+b.tr.np*0.1-b.tr.cp*0.15-(hasLover(S,b)?0.35:0)+(S.tension>50?0.1:0);
var t=F(pk(S,T.LOVE_CONFESS),m)+F(pk(S,ok?T.LOVE_OK:T.LOVE_FAIL),m);
if(ok){
L0.done=true;if(!(S.ties||[]).some(function(t){return t.type==='lover'&&((t.a===p.i&&t.b===b.i)||(t.a===b.i&&t.b===p.i));}))S.ties.push({a:p.i,b:b.i,type:'lover'});setRel(S,p,b,0.4,'恋人');edge(S,p,b,'恋人になった','love');
p.m.fear=clamp(p.m.fear-15,0,100);b.m.fear=clamp(b.m.fear-12,0,100);
p.goal=p.goal0=JS.GOAL.protect;p.surv=1;
note(p,b.name+'と恋人になった');
}else{L0.pt=0;L0.tries++;(L0.no=L0.no||[]).push(b.i);L0.t=null;setRel(S,p,b,-0.05,'気まずい');p.m.fear=clamp(p.m.fear+6,0,100);}
var o=ST.say(S,{actors:[p,b],tag:'告白',kind:'climax',text:t,why:ok?p.name+'の想いが届いた（'+b.name+'の気持ち・FC）。目標が「'+JS.GOAL.protect.label+'」に変わった':b.name+'には届かなかった（'+(hasLover(S,b)?'恋人がいた':hasLover(S,p)?p.name+'には恋人がいた':'CP・気持ちが足りない')+'）',mag:34});
if(ok)ST.key(S,o,p.name+'と'+b.name+'が恋人に');
return true;
}
var yes=rng()<0.4+bond(S,b,p)*0.4+b.tr.warmth*0.2+p.tr.fc*0.1-(hasLover(S,b)?0.3:0)-b.tr.cp*0.1;
var t2=F(pk(S,jobT(T.LOVE_JOB,p)),m)+F(pk(S,yes?T.LOVE_YES:T.LOVE_NO),m);
if(yes){L0.pt++;setRel(S,p,b,0.18,'いい雰囲気',p);}else setRel(S,p,b,-0.03,null);
var riv=S.P.filter(function(c){return al(c)&&c!==p&&c!==b&&(hasTie(S,c,b,'lover,mate,fated,crush')||bond(S,c,b)>=0.8);})[0];
if(riv&&yes&&rng()<0.5){t2+=F(pk(S,T.LOVE_RIVAL),{a:p.name,b:b.name,c:riv.name});setRel(S,riv,p,-0.25,'恋敵',riv);}
ST.sayB(S,{actors:[p,b].concat(riv&&yes?[riv]:[]),tag:'恋',text:t2,why:p.name+'（'+JS.core.jobOf(p).label+'）なりの口説き方。'+(yes?b.name+'もまんざらでもない':b.name+'はつれない')},p.name+'が'+b.name+'に近づいた');
return true;
}
function ties(S,a,b){return(S.ties||[]).filter(function(t){return(t.a===a.i&&t.b===b.i)||(t.a===b.i&&t.b===a.i);});}
function hasTie(S,a,b,list){return ties(S,a,b).some(function(t){return list.split(',').indexOf(t.type)>=0;});}
function hasLover(S,b){return S.P.some(function(c){return c!==b&&al(c)&&hasTie(S,c,b,'lover,mate,fated');});}
function steal(S,p,h,live){
var rng=S.rng;
if(rng()>(JS.night(h)?0.4:0.22))return false;
var ST0=T.STEAL,keys=Object.keys(ST0);
var others=live.filter(function(q){return q!==p&& !q.bound;});
var k=HK.weighted(rng,keys,function(x){
var o=ST0[x];if(o.party&& !others.length)return 0;
return(o.v/20+0.6)*(1-o.risk*p.tr.caution)*(o.sacred?(p.tr.impulse+(1-p.tr.ac))*0.4:1)*(S.stolen&&S.stolen[x]?0.2:1);
});
var o=ST0[k],b=o.party?HK.weighted(rng,others,function(q){return 1+Math.max(0,-bond(S,p,q))*2;}):null;
var m={a:p.name,b:b?b.name:'',g:S.G.call};
var t=(T.STEAL_JOB[p.job]?F(T.STEAL_JOB[p.job],m):'')+F(pk(S,o.t),m);
var caught=rng()<o.risk-JS.skill(p,'explore')*0.3+(JS.night(h)? -0.08:0.05)+(p.job==='streamer'?0.1:0);
(S.stolen=S.stolen||{})[k]=1;
if(caught&& !o.party){
S.hostile=clamp(S.hostile+10,0,100);p.m.hp=clamp(p.m.hp-18,0,100);p.m.fear=clamp(p.m.fear+15,0,100);
t+=F(pk(S,T.STEAL_VILLAGE),m);
ST.say(S,{actors:[p],tag:'盗み',text:t,why:p.name+'は'+o.n+'を盗もうとして、村人に見つかった（村人の敵意 +10）',mag:26});
return true;
}
if(caught&&o.party){
var w=b;
t+=F(pk(S,T.STEAL_PARTY),m);
setRel(S,w,p,-0.45,'盗人',w);edge(S,w,p,'財布を盗まれた','enemy',w);
if(w.job==='police'){t+=F(pk(S,T.STEAL_COP),m);p.bound=true;p.boundUntil=h+4;p.boundAt='駐在所';}
ST.say(S,{actors:[p,w],tag:'盗み',text:t,why:p.name+'は仲間の財布に手を出し、'+w.name+'に見つかった'+(p.bound?'（警察官の'+w.name+'に手錠をかけられた）':''),mag:28});
return true;
}
p.loot=(p.loot||0)+o.v;
t+=pk(S,T.STEAL_OK).replace(/\{a\}/g,p.name);
var why=p.name+'は'+o.n+'を盗んだ（借金 '+p.debt*10+'万円のうち、返せそうなのは '+Math.min(p.loot,p.debt)*10+'万円）';
if(o.clue&&rng()<o.clue){var c=gainClue(S,p);if(c){t+=pk(S,T.STEAL_CLUE)+c+'。';why+='。盗んだ品から、村の秘密の手がかりが出てきた';}}
if(o.sacred){S.hostile=clamp(S.hostile+20,0,100);S.shrineRage=true;S.deadline=Math.max(h+4,S.deadline-4);t+=F(pk(S,T.STEAL_RAGE),m);why+='。御神体を盗んだ（村人の敵意 +20・刻限が4時間早まった）';}
if(p.loot>=p.debt){t+=F(pk(S,T.STEAL_DONE),m);p.goal=p.goal0=JS.GOAL.escape;why+='。借金を返せるだけ集まった。あとは生きて帰るだけ（目標が「'+JS.GOAL.escape.label+'」に）';note(p,'借金を返せるだけ盗んだ');}
var oo=ST.say(S,{actors:[p],tag:'盗み',text:t,why:why,mag:o.sacred?34:18});
if(o.sacred)ST.key(S,oo,p.name+'が御神体を盗んだ');
return true;
}
function gainClue(S,p){
var k=S.G.clues.map(function(c,j){return j;}).filter(function(j){return S.found.indexOf(j)<0;})[0];
if(k==null)return'';
S.found.push(k);p.cnt.clue++;
return S.G.clues[k].t;
}
function setupMurder(S,p){
var rng=S.rng,others=S.P.filter(function(q){return q!==p;});
if(HK.SameStory&&HK.SameStory.spare)others=HK.SameStory.spare(S,p,others);
if(!others.length)return;
var en=others.filter(function(q){return bond(S,p,q)< -0.15;})[0];
var fam=others.filter(function(q){return hasTie(S,p,q,'mate,parent,sibling,lover');})[0];
var why,t;
if(en){t=en;why='grudge';}
else if(p.tr.ac>0.6&&p.tr.np<0.5){t=rng.pick(others);why='despair';}
else if(fam&&p.tr.cold>0.6&&rng()<0.5){t=fam;why='money';}
else if(p.tr.cold>0.7&&rng()<0.4){t=rng.pick(others);why='thrill';}
else{t=others.slice().sort(function(a,b){return bond(S,p,a)-bond(S,p,b);})[0];why='past';}
p.mur={t:t,why:why,prep:0,tries:0};
if(why==='despair'||why==='thrill')p.surv=0.25;
var wpn=T.WEAPON[p.job]||T.WEAPON.def;
p.mur.x=wpn;
ST.sayB(S,{actors:[p],tag:'殺意',text:F(pk(S,T.MURDER_HINT),{a:p.name,b:t.name}),why:p.name+'の本当の目標は「誰かを殺す」――'+F(T.MURDER_WHY[why],{b:t.name,r:JS.REL&&JS.REL.relLabel?(JS.REL.relLabel(S,p,t)||'因縁'):'因縁'})+'（冷たさ・攻撃性）'},p.name+'は'+t.name+'を見ていた');
}
function murder(S,p,h,live){
var rng=S.rng,M0=p.mur;
if(S.battlePlan&& !S.battleDone)return false;
if(!M0||M0.done)return false;
var b=M0.t;
if(!b|| !al(b)){
if(M0.why==='despair'||M0.why==='thrill'){var nb=live.filter(function(q){return q!==p&& !q.bound;});if(!nb.length)return false;if(HK.SameStory&&HK.SameStory.spare)nb=HK.SameStory.spare(S,p,nb);M0.t=b=rng.pick(nb);}
else{M0.done=true;p.goal=p.goal0=JS.GOAL.escape;ST.sayB(S,{actors:[p],text:p.name+'は、手を下すまでもなく'+(b?b.name:'狙った相手')+'が死んだことを知った。複雑な顔をしていた。',why:'狙っていた相手が先に死んだ（目標が「'+JS.GOAL.escape.label+'」に）'},p.name+'の殺意は行き場を失った');return true;}
}
var m={a:p.name,b:b.name,x:M0.x};
if(M0.prep<1||rng()<0.35-M0.prep*0.1){
if(rng()>0.5)return false;
M0.prep++;
ST.sayB(S,{actors:[p],tag:'殺意',text:F(pk(S,T.MURDER_PREP),m),why:p.name+'は、'+b.name+'を殺す支度をしている（凶器：'+M0.x+'）'},p.name+'は何かを隠し持っていた');
return true;
}
var alone=b.action.id==='alone'||b.despair||JS.night(h);
if((!alone&&rng()>0.25)||rng()>0.55)return false;
M0.tries++;
var ok=rng()<0.4+JS.skill(p,'fight')*0.3+(JS.night(h)?0.12:0)+(p.job==='doctor'||p.job==='police'?0.12:0)-b.stats.luck*0.03-JS.skill(b,'obs')*0.15;
var t=F(pk(S,jobT(T.MURDER_DO,p)),m);
if(!ok){
b.m.hp=clamp(b.m.hp-20,0,100);b.m.fear=clamp(b.m.fear+30,0,100);
setRel(S,b,p,-0.7,'殺されかけた',b);edge(S,p,b,'殺そうとした','enemy',p);
ST.say(S,{actors:[p,b],tag:'殺人未遂',kind:'climax',text:t+F(pk(S,T.MURDER_FAIL),m),why:b.name+'は、'+p.name+'の手を逃れた（運・観察）。'+b.name+'は'+p.name+'を疑っている',mag:38});
if(rng()<0.55)detect(S,p,true,b);
return true;
}
M0.done=true;S.murders=(S.murders||0)+1;
S.killer=p;edge(S,p,b,'殺害','kill',p);
var mdN=S.log.length;
JS.core.die(S,b,'何者かに殺されて',T.MURDER_DEATH,t+'――');
if(HK.SameStory&&HK.SameStory.mark)HK.SameStory.mark(S,mdN,HK.SameStory.note(S,p,b));
S.killer=null;
b.how=p.name+'に殺されて';
(S.cases||[]).forEach(function(c){if(c.killer===p&&c.v===b)c.kind='murder';});
note(p,b.name+'を殺した（'+M0.x+'）');
var desp=M0.why==='despair';
ST.sayB(S,{actors:[p],tag:'殺人',text:F(pk(S,desp?T.MURDER_AFTER.despair:T.MURDER_AFTER.def),m),why:p.name+'は目標を果たした（'+F(T.MURDER_WHY[M0.why],{b:b.name,r:'恨み'})+'）'},p.name+'は手を洗った');
if(desp&&rng()<0.45){
p.bound=true;p.boundAt='土蔵';
ST.say(S,{actors:[p],tag:'自首',kind:'climax',text:F(pk(S,T.MURDER_SURRENDER),m),why:'自暴自棄の殺人。'+p.name+'は逃げる気もなかった',mag:36});
}else{p.goal=p.goal0=JS.GOAL.escape;p.surv=desp?0.3:1;}
return true;
}
function detect(S,m,openly,by){
var rng=S.rng,others=S.P.filter(function(q){return q!==m&&al(q)&& !q.bound;});
if(!others.length|| !m.mur||m.bound)return false;
var b=by||others.slice().sort(function(x,y){return JS.skill(y,'obs')-JS.skill(x,'obs');})[0];
var ch=by?1:JS.skill(b,'obs')*0.4+(b.goal.id==='solve'?0.2:0)+(b.job==='sleuth'?0.3:b.job==='detective'?0.2:0);
if(rng()>ch)return false;
if(!by&&JS.REL.cover&&JS.REL.cover(S,m,b))return false;
var angry=others.reduce(function(s0,q){return s0+q.tr.aggr+q.tr.cold*0.5;},0)/others.length;
var t=openly&&by?'':F(pk(S,T.MURDER_DETECT),{a:m.name,b:b.name,x:m.mur.x,v:m.mur.t?m.mur.t.name:''});
if((rng()<0.15+angry*0.4||S.ygo)&& !(HK.SameStory&&HK.SameStory.nk&&HK.SameStory.nk(S,b,m))){
m.alive=false;m.fate='仲間に裁かれた（'+JS.hm(S.h)+'）';edge(S,b,m,'制裁','kill',b);
var o=ST.say(S,{actors:[b,m],tag:'露見',kind:'climax',text:t+F(pk(S,T.MURDER_KILLED),{a:m.name,b:b.name}),why:m.name+'の殺人が'+b.name+'にばれた。一行の怒りは止まらなかった',mag:42});
ST.key(S,o,m.name+'の殺人が露見');
}else{
m.bound=true;m.boundAt='土蔵';edge(S,b,m,'縛り上げた','enemy',b);
var o2=ST.say(S,{actors:[b,m],tag:'露見',kind:'climax',text:t+F(pk(S,T.MURDER_BOUND),{a:m.name}),why:m.name+'の殺人が'+b.name+'にばれ、縛り上げられた',mag:38});
ST.key(S,o2,m.name+'が縛り上げられた');
}
return true;
}
function hijackPrep(S,p,h){
var rng=S.rng,H=p.hj||(p.hj={pow:0,prep:0});
if(rng()>0.35||H.prep>=4)return false;
H.prep++;
var r=rng(),t,why;
if(r<0.45){H.pow+=0.12;t=F(pk(S,jobT(T.HJ_PREP,p)),{a:p.name});why='儀式の手順を学んだ（儀式の力 +）';if(rng()<0.3){var c=gainClue(S,p);if(c){t+='――'+c+'。';why+='・手がかり +1';}}}
else if(r<0.7){
H.pow+=0.18;t=F(pk(S,T.HJ_TOOL),{a:p.name});why='祭具に細工をした（儀式の力 ++）';
if(rng()<0.2){S.hostile=clamp(S.hostile+8,0,100);why+='。村人に気づかれかけた（敵意 +8）';}
}else{S.hostile=clamp(S.hostile-6,0,100);t=F(pk(S,T.HJ_VILLAGE),{a:p.name});why='村人に取り入った（敵意 -6）';}
ST.sayB(S,{actors:[p],tag:'乗っ取り',text:t,why:p.name+'（'+JS.core.jobOf(p).label+'）は、村の儀式を乗っ取る支度をしている：'+why},p.name+'は祭りの支度を手伝っていた');
return true;
}
function hijacker(S){return S.P.filter(function(p){return p.goal0&&p.goal0.id==='hijack'&&al(p)&& !p.bound&& !p.taken;})[0];}
function hjPower(S,p){return 0.2+(p.hj?p.hj.pow:0)+JS.skill(p,'rite')*0.3+JS.skill(p,'lore')*0.12;}
function hjIntent(S,p){
var others=S.P.filter(function(q){return q!==p&&q.alive;});
var avg=others.length?others.reduce(function(s0,q){return s0+bond(S,p,q);},0)/others.length:0;
return p.tr.warmth*0.6+avg*0.6+p.tr.np*0.2-p.tr.cold*0.4>0.2?'save':'rule';
}
function hijackRitual(S,h,vic){
var rng=S.rng,p=hijacker(S);
if(!p)return null;
var m={a:p.name,g:S.G.call},t=F(pk(S,T.HJ_TRY),m),pw=hjPower(S,p);
if(rng()>pw){
t+=F(pk(S,T.HJ_FAIL),m);
ST.say(S,{actors:[p],tag:'乗っ取り',kind:'climax',text:t,why:p.name+'は儀式の乗っ取りに失敗した（成功の見込み '+Math.round(pw*100)+'％）。偽の祭主として、生贄にされる',mag:44});
note(p,'村の儀式を乗っ取ろうとして失敗した');
return{vic:p};
}
var it=hjIntent(S,p);
if(it==='save'){
t+=F(pk(S,T.HJ_SAVE),m);
var o=ST.say(S,{actors:[p],tag:'乗っ取り',kind:'climax',text:t,why:p.name+'は儀式を乗っ取り、神を帰した（成功の見込み '+Math.round(pw*100)+'％・仲間を思う気持ち）。生贄は出ず、逃げやすくなる',mag:50});
ST.key(S,o,p.name+'が儀式を乗っ取った');
note(p,'村の儀式を乗っ取り、神を帰した');
return{skip:true,bonus:0.3};
}
var cands=S.P.filter(function(q){return q!==p&&al(q);}).sort(function(a,b){return bond(S,p,a)-bond(S,p,b);});
var nv=cands[0]||null;
t+=F(pk(S,T.HJ_RULE),m)+(nv?F(pk(S,T.HJ_PICK),{a:p.name,b:nv.name}):'');
p.out=true;p.esc=h+1;p.fate='村に残り、新しい祭主になった';
var o2=ST.say(S,{actors:[p].concat(nv?[nv]:[]),tag:'乗っ取り',kind:'climax',text:t+F(pk(S,T.HJ_STAY),m),why:p.name+'は儀式を乗っ取り、自分が祭主になった（冷たさ）。生贄は'+p.name+'が選んだ'+(nv?'（'+nv.name+'：いちばん絆の薄い相手）':''),mag:50});
ST.key(S,o2,p.name+'が新しい祭主に');
note(p,'村の儀式を乗っ取り、祭主になった');
if(nv)edge(S,p,nv,'生贄に選んだ','kill',p);
return{vic:nv};
}
function hijackCave(S,live){
var rng=S.rng,p=live.filter(function(q){return q.goal0&&q.goal0.id==='hijack'&& !q.bound;})[0];
if(!p||rng()>0.75)return 0;
var it=hjIntent(S,p),m={a:p.name,g:S.G.call};
if(it==='save'){
ST.say(S,{actors:[p],tag:'乗っ取り',kind:'climax',text:F(pk(S,T.HJ_CAVE_SAVE),m),why:p.name+'は封印の儀を乗っ取り、神の力を自分の手に収めようとした（皆を救うため・成功率 +'+Math.round(hjPower(S,p)*40)+'％）',mag:40});
note(p,'封印の儀を乗っ取った');
return hjPower(S,p)*0.4;
}
var others=live.filter(function(q){return q!==p;});
var b=others.slice().sort(function(x,y){return JS.skill(y,'obs')-JS.skill(x,'obs');})[0];
var t=F(pk(S,T.HJ_CAVE_RULE),m);
if(b&&rng()<JS.skill(b,'obs')*0.5+(b.goal.id==='solve'?0.15:0)+(b.job==='priest'||b.job==='folk'?0.2:0)){
p.bound=true;p.boundAt='洞窟の奥';edge(S,b,p,'止めた','enemy',b);
ST.say(S,{actors:[p,b],tag:'乗っ取り',kind:'climax',text:t+F(pk(S,T.HJ_CAVE_STOP),{a:p.name,b:b.name})+'一行は'+p.name+'を岩に縛りつけた。',why:b.name+'が乗っ取りに気づいて止めた（観察）',mag:40});
return 0;
}
ST.say(S,{actors:[p],tag:'乗っ取り',kind:'climax',text:t,why:p.name+'は封印の儀を、自分が神を従える儀式にすり替えた（冷たさ・成功率 -25％）',mag:42});
note(p,'封印の儀を自分のためにすり替えた');
return-0.25;
}
function solve(S,p,h){
var rng=S.rng,open=(S.cases||[]).filter(function(c){return!c.done;});
if(rng()>(open.length?0.35:0.12))return false;
if(open.length){open[0].prog=(open[0].prog||0)+1;ST.sayB(S,{actors:[p],tag:'捜査',text:F(pk(S,T.SOLVE_LOOK),{a:p.name}),why:p.name+'の目標は「事件を解決する」（'+open[0].v.name+'の死を調べている。推理が当たりやすくなる）'},p.name+'は現場を調べた');return true;}
return false;
}
JS.GOALX={tick:tick,arrive:arrive,act:act,detect:detect,hijackRitual:hijackRitual,hijackCave:hijackCave,tension:tension};
})();
});
;
/* ==== js/jashin-love.js ==== */
HK.Load.def(346,'js/jashin-love.js',function(){
(function(){
'use strict';
var HK=window.HK,ST=HK.Story,JS=HK.JASHIN,clamp=HK.clamp;
if(!ST|| !JS|| !JS.GOALX)return;
function L(s){return s.split('|');}
function al(p){return JS.alive(p);}
function F(t,m){return ST.fmt(t,m);}
function pk(S,a){return ST.pick(S,a);}
function bond(S,a,b){return JS.REL?JS.REL.bond(S,a,b):0;}
function setRel(S,a,b,d,lab,from){if(JS.DRAMA)JS.DRAMA.setRel(S,a,b,d,lab,from);}
function edge(S,a,b,lab,cls,from){if(JS.DRAMA)JS.DRAMA.edge(S,a,b,lab,cls,from);}
function hasTie(S,a,b,list){return(S.ties||[]).some(function(t){return((t.a===a.i&&t.b===b.i)||(t.a===b.i&&t.b===a.i))&&list.split(',').indexOf(t.type)>=0;});}
function loverOf(S,b,not){return S.P.filter(function(c){return c!==b&&c!==not&&al(c)&&hasTie(S,c,b,'lover,mate,fated');})[0]||null;}
var MOMENT=[
{id:'fear',why:'吊り橋効果（怖さを分け合うと、惹かれやすい）',bonus:0.15,
when:function(S,p,b){return b.m.fear>50||(S.tension||0)>45;},
t:L('物音に跳ね上がった{b}の手を、{a}がとっさに掴んだ。{a}「大丈夫。……ここにいる｜大丈夫だ。……ここにいる｜大丈夫です。……ここにいます」|夜の山道で、{a}は{b}の前に立って懐中電灯を握り直した。{a}「後ろ、ついてきて。離れないで｜後ろからついてこい。離れるな｜後ろから、ついてきてください。離れないでください」|蔵の中で何かが軋んだ。{a}は思わず{b}を背中にかばっていた。'),
y:L('{b}は、掴まれた手を振りほどかなかった。心臓の音が、怖さのせいだけではない気がした。|{b}は{a}の服の裾を、ぎゅっと握った。{b}「……ありがと｜……ありがとう｜……ありがとうございます」|震えが止まったあとも、{b}はしばらく{a}から離れなかった。'),
n:L('{b}は「平気｜平気だ｜平気です」とだけ言って、手を引っ込めた。|{b}は{a}を押しのけて、自分で前に出た。{b}「守られるの、慣れてない｜守られるのには、慣れていない｜守られるのには、慣れていません」')},
{id:'night',why:'夜、二人きりになれる時間',bonus:0.05,
when:function(S,p,b,h){return JS.night(h);},
t:L('民宿の縁側で、{a}は{b}の隣に腰を下ろした。蚊取り線香の煙が、二人の間をゆっくり流れていった。|{a}は{b}を誘って、田んぼの畦道に出た。蛍が、足もとから一つ、また一つと浮かび上がった。|眠れずに廊下へ出た{a}は、同じように起きていた{b}と鉢合わせた。二人は台所で、温かい麦茶を分け合った。|街灯のない村の夜空は、星で埋まっていた。{a}は{b}に、知っている星座を一つずつ指さしてみせた。'),
y:L('{b}は、{a}の肩に少しだけ寄りかかった。{b}「こういう夜、嫌いじゃない｜こういう夜は、嫌いじゃない｜こういう夜は、嫌いじゃないです」|{b}は笑って、{a}の話に最後まで付き合った。いつの間にか、肩が触れていた。|{b}「……この村に来なかったら、こうして話すこともなかった｜＝｜……この村に来なかったら、こうして話すこともありませんでしたね」その声は、少しだけ嬉しそうだった。'),
n:L('{b}は欠伸をひとつして、「そろそろ寝る｜＝｜そろそろ寝ます」と立ち上がった。|{b}は話の途中で、黙って夜空から目を逸らした。')},
{id:'rain',why:'夕立で、二人きりの雨宿り',bonus:0.08,
when:function(S,p,b,h){return!JS.night(h);},
t:L('調べものの帰りに夕立が来た。{a}と{b}は、道ばたの小さな祠の軒下に駆け込んだ。肩が触れるほど狭かった。|雨に降られた{a}は、自分の上着を{b}の頭にかけた。{a}「着てて。風邪ひくから｜着ていろ。風邪をひくぞ｜着ていてください。風邪をひきますから」|蝉の声が止んで、雨が来た。神社の拝殿の軒先で、{a}は濡れた{b}の髪を、ハンカチでそっと拭いた。'),
y:L('{b}は雨音に紛れるような声で言った。{b}「……もう少し、止まなくてもいいかも｜……もう少し、止まなくてもいいかもしれない｜……もう少し、止まなくてもいいかもしれません」|{b}は{a}の上着を返さずに、そのまま羽織っていた。|雨が上がっても、{b}はすぐには歩き出さなかった。'),
n:L('{b}は小降りになった途端、「先に行くね｜先に行く｜先に行きますね」と駆け出していった。|{b}は少しだけ距離を取って、雨が止むのを黙って待っていた。')},
{id:'tease',why:'村人に「お似合い」と冷やかされた',bonus:0.1,
when:function(S){return(S.hostile||0)<60;},
t:L('並んで歩く{a}と{b}を見て、畑の老婆が目を細めた。「＠あんたら、お似合いだねえ。村で祝言でも挙げていくかい」|駄菓子屋の店主が、{a}と{b}にラムネを一本だけ差し出した。「＠二人で一本。若いもんはそれでええ」|民宿の女将が、{a}と{b}の布団を並べて敷いていた。「＠あら、違ったの？」'),
y:L('{b}は真っ赤になって否定した。けれど、{a}と目が合うと、否定の声はだんだん小さくなった。|{a}と{b}は顔を見合わせて、同時に吹き出した。そのあとの沈黙が、少しだけ甘かった。'),
n:L('{b}は「違う｜＝｜違います」ときっぱり言って、{a}から一歩離れた。|{b}は苦笑いして、話を変えた。')},
{id:'guard',why:'村人の敵意から、相手をかばった',bonus:0.12,
when:function(S){return(S.hostile||0)>=45;},
t:L('村人たちの視線が{b}に集まった。{a}は黙って{b}の前に立ち、その視線を一身に受け止めた。|鍬を持った村の男が、{b}に詰め寄った。{a}がその間に割って入った。{a}「この人に用があるなら、先にこっちが聞く｜この人に用があるなら、先にこちらが聞く｜この人に用があるなら、先にこちらが伺います」|{a}は、村人がひそひそと{b}の名前を口にしているのを聞きつけ、すぐに{b}の隣へ移った。'),
y:L('{b}は、{a}の背中を見上げたまま、しばらく何も言えなかった。|{b}「……かっこつけすぎ｜……格好をつけすぎだ｜……かっこつけすぎです」そう言いながら、{b}は{a}の袖を離さなかった。'),
n:L('{b}は「余計なことしないで｜余計なことはするな｜余計なことはしないでください」と小声で言った。{b}は、目立つのが怖かった。')},
{id:'meal',why:'食事の席で、隣どうしになった',bonus:0.05,
when:function(){return true;},
t:L('民宿の夕飯で、{a}はさりげなく{b}の隣の座布団に座った。{a}は{b}の苦手な漬物を、黙って自分の皿に移した。|{a}は、村の商店で買ったおにぎりを{b}に半分渡した。{a}「鮭のほう、あげる｜鮭のほうをやる｜鮭のほうを、差し上げます」|囲炉裏端で、{a}は{b}の湯呑みに、そっとお茶を注ぎ足した。'),
y:L('{b}「……なんで好きなほう分かったの｜……なぜ好きなほうが分かったんだ｜……どうして好きなほうが分かったんですか」{b}は、嬉しそうにおにぎりを頬張った。|{b}は、{a}の皿に自分のおかずを一品のせ返した。小さな交換だった。|{b}は、注がれたお茶を両手で包んで、{a}に小さく笑いかけた。'),
n:L('{b}は「ありがと｜ありがとう｜ありがとうございます」と言ったきり、ほかの人との話に戻っていった。|{b}は、そのお茶に口をつけなかった。')},
{id:'tend',why:'小さな怪我の手当て',bonus:0.08,
when:function(){return true;},
t:L('草むらで{b}が足を切った。{a}はしゃがみ込んで、水筒の水で傷口を洗い、ハンカチを巻いた。|山道で転んだ{b}に、{a}は迷わず背中を向けた。{a}「乗って。民宿まで、すぐだから｜乗れ。民宿まで、すぐだ｜乗ってください。民宿まで、すぐですから」|{a}は{b}の指に刺さった棘を、時間をかけて丁寧に抜いた。'),
y:L('{b}は、{a}の背中に頬を預けて、小さく「重くない？｜重くないか？｜重くないですか？」と聞いた。|{b}は巻かれたハンカチを、そのあともずっとほどかなかった。|{b}「……優しいね｜……優しいな｜……優しいんですね」その一言に、{a}のほうが照れた。'),
n:L('{b}は「自分でできるから｜自分でできる｜自分でできますから」と、{a}の手から包帯を取った。')},
{id:'shrine',why:'神社で、二人で願いをかけた',bonus:0.08,
when:function(S){return!S.shrine;},
t:L('神社の石段を上りきったところで、{a}は{b}に五円玉を一枚渡した。{a}「せっかくだし、願いごとでも｜せっかくだ、願いごとでもしよう｜せっかくですし、願いごとでもしましょう」|{a}と{b}は、拝殿の古い鈴を一緒に鳴らした。{a}は、手を合わせたまま{b}の横顔を盗み見た。|{a}は社務所で、縁結びのお守りを二つ買った。一つを、黙って{b}の手に握らせた。'),
y:L('{b}「何をお願いしたの？｜何を願ったんだ？｜何をお願いしたんですか？」{a}「……内緒｜……秘密だ｜……内緒です」――{b}も、自分の願いを言わなかった。|{b}は、もらったお守りを鞄の一番見えるところに結びつけた。'),
n:L('{b}は「こういうの、信じてないから｜こういうものは、信じていない｜こういうのは、信じていませんから」と、早々に石段を下りていった。|{b}は、お守りを受け取ったものの、困ったように笑った。')}
];
var LOVER=[
{why:'怖いときほど、手を離さない',when:function(S,p,b){return p.m.fear>45||b.m.fear>45||(S.tension||0)>50;},
t:L('{a}と{b}は、指を絡めたまま暗い道を走った。どちらの手も、汗で濡れていた。{a}「絶対、離さないから｜絶対に、離さない｜絶対に、離しませんから」|{b}が悪夢にうなされて飛び起きた。{a}は何も言わずに、{b}を胸に抱き寄せた。|{a}は、震える{b}の額に自分の額を当てた。{a}「一緒に帰る。約束したでしょ｜一緒に帰る。約束しただろう｜一緒に帰ります。約束したでしょう」')},
{why:'恋人どうしで、交代で見張り',when:function(S,p,b,h){return JS.night(h);},
t:L('見張りの番を、{a}と{b}は交代で務めることにした。結局、二人とも朝まで起きていた。|{a}は、眠る{b}の寝顔を見ながら、戸口の前に座り込んでいた。|民宿の狭い布団で、{a}と{b}は背中合わせに眠った。寝返りを打つたびに、どちらからともなく手を探した。')},
{why:'帰ったあとの約束',when:function(){return true;},
t:L('{a}は、{b}の小指に自分の小指を絡めた。{a}「帰ったら、ちゃんとしたデートしよう。海がいい｜帰ったら、ちゃんとしたデートをしよう。海がいい｜帰ったら、ちゃんとしたデートをしましょう。海がいいです」|{b}「生きて帰れたら、何したい？｜生きて帰れたら、何をしたいんだ？｜生きて帰れたら、何がしたいですか？」{a}は少し考えてから言った。{a}「……{b}と、普通の朝ごはんが食べたい｜……{b}と、普通の朝食が食べたい｜……{b}と、普通の朝ごはんが食べたいです」|{a}と{b}は、帰ったら行く店の話をした。その数は、十を超えていた。')},
{why:'人目を盗んで',when:function(){return true;},
t:L('蔵の陰で、{a}は{b}にそっと口づけた。遠くで、祭囃子の稽古の音がしていた。|皆の前では普段どおりにしていた{a}と{b}だったが、すれ違いざまに、指先だけが触れ合った。|{a}は、{b}の髪についた木の葉を取ってやった。そのまま、手が{b}の頬に残った。')},
{why:'恋人の目標を手伝う',when:function(){return true;},
t:L('{a}は、{b}の調べものに付き合って、古い帳面を一緒にめくった。肩を寄せ合って読む文字は、なぜか頭に入りやすかった。|{a}は{b}の荷物を持って、村の外れまでついて行った。{a}「一人で行かせるわけないでしょ｜一人で行かせるわけがないだろう｜一人で行かせるわけがないでしょう」')}
];
var JEALOUS=L('{a}は、{b}が{c}と寄り添っているのを見てしまった。二人のあいだに、入る隙間はなかった。|{b}と{c}が付き合い始めたと、{a}は人づてに聞いた。{a}は「そっか｜そうか｜そうですか」と笑って、一人で民宿の裏へ回った。|{a}は、{b}の手を引く{c}の背中を、遠くから見送った。');
var MOVEON=L('{a}は、川で顔を洗った。冷たい水が、少しだけ気持ちを切り替えてくれた。{a}「……次」|{a}は、空を見上げて大きく息を吐いた。失恋で落ち込んでいる暇は、この村にはなかった。');
function moment(S,p,b,h){
var rng=S.rng,L0=p.love;
var pool=MOMENT.filter(function(x){return x.when(S,p,b,h)&&(L0.seen||[]).indexOf(x.id)<0;});
if(!pool.length){L0.seen=[];pool=MOMENT.filter(function(x){return x.when(S,p,b,h);});}
if(!pool.length)return false;
var x=pool[rng.int(pool.length)];
(L0.seen=L0.seen||[]).push(x.id);
var lv=loverOf(S,b,p),m={a:p.name,b:b.name};
var yes=rng()<0.42+bond(S,b,p)*0.4+b.tr.warmth*0.2+x.bonus-(lv?0.35:0)-b.tr.cp*0.1;
if(yes){L0.pt++;setRel(S,p,b,0.14,'いい雰囲気',p);b.m.fear=clamp(b.m.fear-4,0,100);}
else setRel(S,p,b,-0.02,null);
ST.sayB(S,{actors:[p,b],tag:'恋',text:F(pk(S,x.t),m)+F(pk(S,yes?x.y:x.n),m),why:p.name+'の目標は「恋人を作る」。'+x.why+'。'+(yes?b.name+'との距離が縮まった':b.name+'には響かなかった'+(lv?'（'+lv.name+'という恋人がいる）':''))},p.name+'が'+b.name+'と過ごした');
return true;
}
function loverMoment(S,p,b,h){
var pool=LOVER.filter(function(x){return x.when(S,p,b,h);});
if(!pool.length)return false;
var x=pool[S.rng.int(pool.length)];
setRel(S,p,b,0.06,'恋人');p.m.fear=clamp(p.m.fear-5,0,100);b.m.fear=clamp(b.m.fear-5,0,100);
ST.sayB(S,{actors:[p,b],tag:'恋人',text:F(pk(S,x.t),{a:p.name,b:b.name}),why:p.name+'と'+b.name+'は恋人どうし。'+x.why+'（恐怖が少し和らぐ）'},p.name+'と'+b.name+'は寄り添っていた');
return true;
}
function pickTarget(S,p,live){
var L0=p.love,cs=live.filter(function(q){return q!==p&& !q.bound&&al(q)&& !(HK.Avoid&&HK.Avoid.of(S,p,q))&&HK.canLove(p,q)&&HK.canLove(q,p)&&(!HK.Poly||HK.Poly.storyCan(S,p,q))&& !(S.ties||[]).some(function(t){return((t.a===p.i&&t.b===q.i)||(t.a===q.i&&t.b===p.i))&&HK.tieNoLove(t);})&& !(L0.no&&L0.no.indexOf(q.i)>=0);});
if(!cs.length)return null;
var b=HK.weighted(S.rng,cs,function(q){return 1+Math.max(0,bond(S,p,q))*2+q.tr.warmth;});
L0.pt=0;
ST.sayB(S,{actors:[p,b],tag:'恋',text:F(pk(S,JS.GT.LOVE_PICK),{a:p.name,b:b.name}),why:p.name+'の目標は「恋人を作る」（FC・NP・衝動）'},p.name+'は'+b.name+'が気になっていた');
return b;
}
function loveAct(S,p,h,live,free){
var rng=S.rng,L0=p.love;
if(!L0||p.bound|| !p.goal0)return false;
if(L0.done){
var b0=L0.t;
if(!b0|| !al(b0)||b0.bound||rng()>0.4*(ST.romK?ST.romK(S):1))return false;
return loverMoment(S,p,b0,h);
}
if(p.goal!==p.goal0||p.goal.id!=='love')return false;
if(ST.romK&&ST.romK(S)<1&&rng()>ST.romK(S))return false;
var b=L0.t;
if(!b|| !al(b))b=L0.t=pickTarget(S,p,live);
if(!b||b.bound)return false;
if(HK.Avoid&&HK.Avoid.of(S,p,b)){L0.t=null;L0.pt=0;return false;}
var lv=hasTie(S,p,b,'lover,mate,fated')?null:loverOf(S,b,p);
if(lv&&lv!==p){
if(rng()>0.6)return false;
(L0.no=L0.no||[]).push(b.i);L0.t=null;L0.pt=0;
p.m.fear=clamp(p.m.fear+4,0,100);
setRel(S,p,lv,-0.1,'恋敵',p);
ST.sayB(S,{actors:[p,b,lv],tag:'片恋',text:F(pk(S,JEALOUS),{a:p.name,b:b.name,c:lv.name})+F(pk(S,MOVEON),{a:p.name}),why:p.name+'が想っていた'+b.name+'には、'+lv.name+'という恋人ができた。'+p.name+'は諦めて、別の相手を探す'},p.name+'は失恋した');
return true;
}
if(p.m.fear>80)return false;
var ready=L0.pt>=2&&bond(S,p,b)>=0.3;
if(free?ready:rng()>(ready?0.25:0.7))return false;
return moment(S,p,b,h);
}
var act0=JS.GOALX.act;
JS.GOALX.act=function(S,p,h,live){
if(loveAct(S,p,h,live))return true;
return act0(S,p,h,live);
};
var tick0=JS.GOALX.tick;
JS.GOALX.tick=function(S,live,h){
tick0(S,live,h);
live.forEach(function(p){
if(!al(p)|| !p.goal0||(!p.love&&p.goal0.id!=='love'))return;
if(S.rng()<0.35){p.love=p.love||{t:null,pt:0,tries:0};loveAct(S,p,h,live,true);}
});
flirt(S,h);
if(HK.Unlike&&HK.Unlike.story){
var un=HK.Unlike.story(S,'jashin',live.filter(function(p){return al(p)&& !p.bound&& !p.possessed&& !(JS.SPEC&&JS.SPEC.mad&&JS.SPEC.mad(p));}),{n:Math.max(4,Math.round((+S.env.hours||36)/3))});
if(un){ST.sayB(S,{actors:[un.a,un.b],tag:un.tag,text:un.text,why:un.why},un.a.name+'の、らしくない振る舞い',true);setRel(S,un.a,un.b,un.d);}
}
};
function timeOf(h){var hh=(16+h)%24;return hh>=5&&hh<10?'morning':hh<16&&hh>=10?'day':hh>=16&&hh<19?'evening':'night';}
function flirt(S,h){
var rom=S.env.romance==null?50: +S.env.romance;
if(!HK.Daily|| !HK.Daily.storyLove||rom<=0||(S.flirtN||0)>=4||(S.flirtH!=null&&h-S.flirtH<6))return;
var live=S.P.filter(function(p){return al(p)&& !p.bound&& !p.possessed&& !(JS.SPEC&&JS.SPEC.mad&&JS.SPEC.mad(p));}),ps=[];
live.forEach(function(a){
live.forEach(function(b){
if(a.i>=b.i)return;
if(!(hasTie(S,a,b,'lover,mate,fated')||(a.honmei===b.i&&b.honmei===a.i)))return;
if((HK.ngPair&&HK.ngPair(a,b))||(HK.tieNoLove&&(S.ties||[]).some(function(t){return((t.a===a.i&&t.b===b.i)||(t.a===b.i&&t.b===a.i))&&HK.tieNoLove(t);})))return;
if(HK.canLove&& !(HK.canLove(a,b)&&HK.canLove(b,a)))return;
ps.push([a,b]);
});
});
var rng=S.rng;
if(!ps.length||rng()>0.12*Math.min(2,rom/50))return;
var pr=rng.pick(ps),x=rng()<0.5?pr[0]:pr[1],y=x===pr[0]?pr[1]:pr[0];
var r=HK.Daily.storyLove(S,'jashin',x,y,timeOf(h));
if(!r)return;
S.flirtN=(S.flirtN||0)+1;S.flirtH=h;
x.m.fear=clamp(x.m.fear-6,0,100);y.m.fear=clamp(y.m.fear-6,0,100);
setRel(S,x,y,0.05);
ST.sayB(S,{actors:[x,y],tag:'恋人',text:r.text,why:'恋人どうしの、つかの間の時間（'+r.label+'）。二人の恐怖が少し和らいだ（恋愛の起こりやすさ '+rom+'）'},x.name+'と'+y.name+'が寄り添った');
}
JS.LOVEX={act:loveAct};
})();
});
;
/* ==== js/jashin-npc-text.js ==== */
HK.Load.def(347,'js/jashin-npc-text.js',function(){
(function(){
'use strict';
var JS=window.HK.JASHIN;
if(!JS)return;
function L(s){return s.split('|');}
JS.UNPC_LIST=[
{id:'gonzo',name:'権蔵じいさん',who:'村いちばんの年寄り。ぼけたふりをして、ときどき本当のことを漏らす',
greet:L('縁側で日向ぼっこをしていた老人が、一行を見て歯の抜けた口で笑った。「よう来た、よう来た。……おや、あんた、前にも来なすったな？」|腰の曲がった老人が、杖で一行を順番に指した。「ひい、ふう、みい……今年は、ようけ来たのう」'),
idle:L('権蔵じいさんは、誰もいない方に向かって話しかけていた。「わかっとる、わかっとる。もうすぐじゃ」|権蔵じいさんが、{a}の袖を引いた。「あんた、飯はちゃんと食うとるか。祭りの前は、太らんといかん」|権蔵じいさんは、{a}の顔をじっと見て言った。「……前の子に、よう似とる」'),
hint:L('権蔵じいさんが、{a}にだけ聞こえる声で言った。「わしの若い頃はのう、{g}の祭りの前の晩は、誰も外に出なんだ。……なんでか？　出たら、帰って来んからよ」|権蔵じいさんは急に真顔になり、{a}の手を握った。「ええか。神社の裏の石には、触ったらいかん。……触ったら、わかってしまうからの」'),
warn:L('権蔵じいさんが、{a}の前に杖を突き出した。「そっちの道は、やめとけ」――その先の地面が、ぽっかりと口を開けていた。'),
death:L('権蔵じいさんは、{a}の亡骸に手を合わせた。「……ほうら、言わんこっちゃない」|権蔵じいさんは、ぼんやりと空を見上げた。「また一人、{g}のところへ行きなすった」'),
ritual:L('祭壇の脇で、権蔵じいさんが手拍子を打っていた。調子外れの歌を、楽しそうに歌っていた。'),
die:L('権蔵じいさんは、刃を向けられても逃げなかった。「……やっと、終わるんか」――それが、最後の言葉だった。')},
{id:'miyo',name:'おかっぱの子',who:'名前を誰も知らない、おかっぱ頭の女の子。いつも手毬歌を歌っていて、人の死を言い当てる',
greet:L('村の入口の地蔵の陰から、おかっぱ頭の女の子がこちらを覗いていた。目が合うと、にいっと笑って走り去った。|どこからか、手毬歌が聞こえた。「ひとりめは　いどのなか　ふたりめは　やまのなか……」'),
idle:L('おかっぱの子が、民宿の窓の外に立っていた。二階の窓なのに。|おかっぱの子は、{a}の後ろをずっとついて歩いていた。振り返ると、いなかった。|おかっぱの子が、{a}の荷物に、赤い手毬を一つ入れていった。'),
hint:L('おかっぱの子が、{a}の手を引いた。「いいもの、見せてあげる」――連れて行かれた先に、それはあった。|おかっぱの子は手毬をつきながら歌った。歌詞の中に、この村の秘密が隠れていた。'),
prophecy:L('おかっぱの子が、{a}を指さして、にこにこと言った。「つぎは、{a}のばん」|おかっぱの子は、手毬歌の続きを歌った。「……さんにんめは　{a}のなか」'),
proph_hit:L('――おかっぱの子の歌ったとおりだった。どこかで、手毬をつく音がした。'),
proph_miss:L('おかっぱの子の予言は、外れた。{a}は、生きて村を出た。……帰りの車の後部座席に、赤い手毬が転がっていた。'),
lure:L('おかっぱの子が、{a}の袖を引いた。「おにいちゃん、こっち。お母さんが待ってるよ」――{a}は、なぜか、ついて行ってしまった。'),
lure_back:L('――しばらくして、{a}は一人で戻ってきた。何を見たのか、聞いても答えなかった。'),
lure_lost:L('――{a}は、戻らなかった。夕暮れの路地に、手毬歌だけが響いていた。'),
death:L('おかっぱの子が、{a}の亡骸のそばにしゃがみ込んで、手毬をついていた。「ね、言ったでしょ」'),
deathNB:L('おかっぱの子が、{a}の消えた場所にしゃがみ込んで、手毬をついていた。「ね、言ったでしょ」'),
ritual:L('祭壇の上で、おかっぱの子が手毬歌を歌っていた。最後の一節を、誰も聞いたことがなかった。'),
die:L('おかっぱの子は、刃が振り下ろされる前に、ふっと消えた。手毬だけが、ころころと転がっていった。')},
{id:'tome',name:'トメ婆',who:'盲目の老婆。目は見えないが、すべてが見えている',
greet:L('囲炉裏端に座った盲目の老婆が、一行が入ってくる前に言った。「六人……いや、もう一人おるね。ふふ」|白く濁った目の老婆が、一行の方に顔を向けた。「よそ者の匂いがする。若い、ええ匂いじゃ」'),
idle:L('トメ婆は、{a}の顔を手でなぞった。「……あんた、怖がっとるね。ええことよ。怖がらん者から、先に行く」|トメ婆が{a}の名前を呼んだ。誰も、名乗っていなかったのに。'),
hint:L('トメ婆が、ひび割れた声で囁いた。「{s}……婆がわかるのは、そこまでじゃ」|トメ婆は、{a}の掌に指で何かを書いた。それは、この村の神を封じる手順の一節だった。'),
curse:L('トメ婆は、{a}の額に指を当てた。「あんたは、余計なことを知りすぎた」――その夜から、{a}は同じ悪夢を見るようになった。'),
death:L('トメ婆は、見えない目で{a}の亡骸の方を向いた。「……かわいそうに。でも、これで{g}は、少しだけ静かになる」'),
deathNB:L('トメ婆は、見えない目で{a}の消えた方を向いた。「……かわいそうに。でも、これで{g}は、少しだけ静かになる」'),
ritual:L('トメ婆が、祭壇の前で白い目を見開いた。「来なさる……来なさるよ」'),
twin:L('トメ婆が、{a}の手を取った。「やっと気づいたかね。あんたらは、双子じゃよ。生まれたその晩、片方を{g}が隠しなすった」'),
die:L('トメ婆は、迫る足音を聞いて笑った。「見えとったよ。最初から、全部」')},
{id:'tsuzumi',name:'ツヅミとツバキ',who:'同じ顔、同じ着物の童二人。いつも同時に、同じことを言う',
greet:L('村の小道で、同じ着物を着た童が二人、手をつないで立っていた。「「いらっしゃい」」――二人の声は、ぴったり重なっていた。'),
idle:L('ツヅミとツバキが、{a}の両側に立った。「「どっちがどっちか、わかる？」」――{a}が答える前に、二人はくすくす笑って走り去った。|ツヅミとツバキが、民宿の廊下で鬼ごっこをしていた。鬼は、いつまでも見つからなかった。'),
hint:L('ツヅミとツバキが声を揃えて言った。「「ほこらのしたに、ぜんぶあるよ」」|童の一人が「言っちゃだめ」と言い、もう一人が言った。――二人の声が、初めてずれた。'),
death:L('ツヅミとツバキは、{a}の亡骸を見下ろして、同時に首を傾げた。「「つぎは、だれ？」」'),
deathNB:L('ツヅミとツバキは、{a}の消えた場所をのぞき込んで、同時に首を傾げた。「「つぎは、だれ？」」'),
ritual:L('祭壇の両脇に、ツヅミとツバキが立っていた。二人は同時に鈴を鳴らした。'),
die:L('ツヅミとツバキは、手をつないだまま倒れた。最後まで、声はぴったり揃っていた。「「やっと、いっしょにいける」」')},
{id:'shiramine',name:'宮司の白峰',who:'物腰の柔らかい宮司。祭りを取り仕切る',
greet:L('神社の石段の上で、白い装束の宮司が深々と頭を下げた。「ようこそ、{v}へ。祭りの前に、皆さまにお会いできて光栄です」'),
idle:L('宮司の白峰が、{a}に微笑みかけた。「お身体の具合はいかがですか。……祭りの日まで、どうかお元気で」|白峰は、一行の名前を、帳面に丁寧に書き写していた。'),
hint:L('白峰が、ふと口を滑らせた。「{g}は、清らかなものがお好きでしてね」――言ってから、白峰は少しだけ困った顔をした。'),
threat:L('白峰が、穏やかな声のまま言った。「お帰りになるのは、祭りが済んでからにしていただけますか。……どうしても、ね」'),
death:L('白峰は、{a}の亡骸に祝詞を上げた。「祭りの前に……惜しいことです。本当に、惜しい」'),
deathNB:L('白峰は、{a}の消えた方角に向かって祝詞を上げた。「祭りの前に……惜しいことです。本当に、惜しい」'),
ritual:L('白峰が祝詞を上げ始めた。その声は、昼間の穏やかさとは別人のように、低く、太かった。'),
die:L('白峰は、血を吐きながら祝詞を唱え続けた。「{g}……どうか、この者たちを……」――祝詞は、そこで途切れた。')},
{id:'sachi',name:'女将のサチ',who:'民宿の女将。やたらと親切で、料理を勧めてくる',
greet:L('民宿の女将が、割烹着で手を拭きながら出てきた。「まあまあ、遠いところを。お腹すいたでしょう。たんと食べて、たんと太ってくださいね」'),
idle:L('女将のサチが、{a}の膳におかずを一品足した。「若い人は、もっと食べなきゃ」|サチは、一行の部屋に布団を敷きながら、枚数を数えていた。「あら、一枚、余っちゃったわね」'),
hint:L('サチが、皿を拭きながら呟いた。「去年のお客さんも、ちょうどこのくらいの人数だったわねえ……」'),
heal:L('女将のサチが、{a}の傷に薬草を貼ってくれた。「ちゃんと治してもらわないと。……祭りの日に、傷物じゃ困るもの」'),
death:L('サチは、{a}の空いた席に、それでも膳を置いた。「……もったいないわねえ」'),
ritual:L('祭壇の前に、サチが大きな鍋を運んできた。中身を、誰も聞かなかった。'),
die:L('サチは、包丁を握りしめたまま倒れた。「……お料理、まだ途中だったのに」')},
{id:'yosaku',name:'墓守の与作',who:'村はずれの墓地の墓守。無口で、いつも穴を掘っている',
greet:L('村はずれの墓地で、男が黙々と穴を掘っていた。男は一行を見ると、手を止めて、穴の数を数え直した。'),
idle:L('墓守の与作が、{a}の背丈を目で測っていた。|与作の掘った穴の横に、新しい卒塔婆が立っていた。名前は、まだ書かれていなかった。'),
count:L('墓守の与作が、ぼそりと言った。「穴は、{n}つ掘っとけと言われた」――一行は、生きている自分たちの人数を数えた。|与作は、掘り終えた穴を指さした。「あと{n}つ。祭りまでに、間に合わせにゃ」'),
hint:L('与作が、{a}に古い墓石を見せた。刻まれた名前は、どれもよそ者のものだった。'),
death:L('墓守の与作は、黙って{a}の亡骸を穴へ運んだ。穴は、ちょうどいい大きさだった。'),
deathNB:L('墓守の与作は、空の棺に{a}の荷物だけを納めて、黙って穴へ運んだ。穴は、ちょうどいい大きさだった。'),
ritual:L('与作が、祭壇の裏で、黙って穴を掘っていた。'),
die:L('与作は、自分の掘った穴の中に倒れ込んだ。「……ちょうどええ」')}
];
JS.BATTLE_T={
start:L('その夜、民宿の広間で、{x}は同時に立ち上がった。手には、それぞれの凶器が握られていた。――全員が、同じことを考えていた。|夕食の最中、{x}の箸が同時に止まった。互いの目を見て、全員が悟った。「「……お前もか」」'),
plan:L('「まずは、邪魔な村人から｜まずは、邪魔な村人からだ｜まずは、邪魔な村人からです」――誰が言い出したのか、殺人者たちは一時休戦し、夜の村へ散っていった。|「話は後。村の連中が先｜話は後だ。村の連中が先だ｜話は後です。村の連中が先です」――殺意を抱えた者たちの、奇妙な共同戦線が組まれた。'),
massacre:L('その夜、{v}から、悲鳴が途絶えることはなかった。|鍬を持って駆けつけた若い衆は、一人も戻らなかった。|民宿の女将の包丁も、殺人者たちの前では役に立たなかった。|夜明け前、村の家々の灯りは、一つ残らず消えていた。'),
noVillage:L('朝が来た。{v}には、もう一人の村人も残っていなかった。祭りの太鼓を叩く者も、もういない。――{g}を祀る者は、いなくなった。'),
duel:L('{a}と{b}が、神社の境内で向かい合った。{a}の{x}と、{b}の{y}が、朝日にぎらりと光った。|{a}は{b}に飛びかかった。{x}と{y}がぶつかり合い、火花が散った。|{a}は、神社の鐘を盾にして{b}の一撃を受け止めた。ごおん、と、村じゅうに鐘の音が響いた。|{a}と{b}は、田んぼの真ん中で泥まみれになって組み合った。'),
hit:L('――{a}の一撃が、{b}を捉えた。|――{b}が、膝をついた。'),
kill:L('{b}は、{a}の足元に崩れ落ちた。「……あなたに、殺されるとはね｜……あなたに、殺されるとはな｜……あなたに、殺されるとは思いませんでした」|{a}の{x}が、{b}の息の根を止めた。{b}は、最後に小さく笑った。|{b}は、石段を転げ落ち、それきり動かなくなった。'),
caught:L('物陰に隠れていた{b}が、流れ弾のように巻き込まれた。|逃げ遅れた{b}が、殺人者たちの間に挟まれた。'),
caught_die:L('{b}は、誰に殺されたのかも分からないまま、倒れた。'),
hide:L('{a}は、床下に潜り込んで、息を殺していた。頭の上で、殺し合いの音がずっと続いていた。|{a}は、空っぽになった村の蔵に閉じこもった。'),
stream:L('{a}は、震える手でカメラを回し続けていた。「……同接、見たことない数字になってる｜……同接が、見たことのない数字になっている｜……同接、見たことのない数字になっています」|{a}は、物陰から実況していた。「今、神社の境内で――あ、鐘が！　鐘で防いだ！｜＝｜今、神社の境内で――あ、鐘が！　鐘で防ぎました！」'),
cheer:L('{a}は、なぜか拳を握りしめて叫んでいた。「行けえ！　そこだ！｜＝｜行ってください！　そこです！」'),
double:L('{a}と{b}は、互いの胸に刃を突き立てたまま、同時に倒れた。境内には、誰も立っていなかった。'),
winner:L('境内に、{a}だけが立っていた。返り血を浴びた{a}は、空を見上げて、長く息を吐いた。|最後に立っていたのは、{a}だった。{a}は凶器を投げ捨て、誰もいない村を見渡した。'),
god:L('地の底で、{g}が身じろぎした。けれど、祭る者のいない神は、もう誰も呼べなかった。祠の気配は、ゆっくりと薄れていった。|鐘の音に誘われるように、{g}の気配が境内に満ちた。――そして、満足したように、引いていった。生贄なら、もう十分だった。'),
out:L('霧が晴れた。生き残った者たちは、村人のいない{v}をあとにした。')
};
JS.TWIN_T={
seen:L('{b}は、村の路地で{a}とすれ違った。――{a}は民宿にいるはずだった。振り返ると、もう誰もいなかった。|{b}は、田んぼの向こうで村人に混じって働く{a}を見た。{a}は、ずっと隣にいたのに。|村人たちの中に、{a}と同じ顔の者がいた。その者は、{a}を見て、悲しそうに微笑んだ。'),
cell:L('{a}は神社の裏の座敷牢の前で、足を止めた。格子の奥に、膝を抱えた人影があった。顔を上げたそれは、{a}と同じ顔をしていた。|{a}が蔵の奥の扉を開けると、そこには、{a}とそっくりの誰かが鎖につながれていた。'),
voice:L('「……やっと、来てくれた」――{a}と同じ声が言った。|「ずっと、待ってたんだよ。{a}」――もう一人の{a}が、格子越しに手を伸ばした。'),
remember:L('{a}は、母がときどき、誰もいない子ども部屋に『おやすみ』と言っていたのを思い出した。|{a}の脳裏に、見たことのないはずの、二つ並んだ揺りかごが浮かんだ。'),
choose:{
rescue:L('{a}は、もう一人の自分の手を握った。{a}「一緒に帰ろう。……今度は、置いていかない｜＝｜一緒に帰りましょう。……今度は、置いていきません」|{a}は格子を叩き壊した。{a}「待たせて、ごめん｜待たせて、すまない｜待たせて、ごめんなさい」'),
leave:L('{a}は、もう一人の自分から目を逸らした。{a}「……悪い。連れて行けない｜……すまない。連れて行けない｜……すみません。連れて行けません」――背中に、「また、置いていくの？」という声が刺さった。|{a}は黙って扉を閉めた。格子の奥から、すすり泣きが聞こえた。'),
sacrifice:L('{c}が、低い声で言った。「……生贄は、あいつにしてもらえばいい。同じ顔なんだ、神さまも気づかない｜……生贄は、あいつにしてもらえばいい。同じ顔だ、神さまも気づかない｜……生贄は、あの人にしてもらえばいいんです。同じ顔ですから、神さまも気づきません」――{a}は、何も言い返せなかった。|{a}は、自分と同じ顔を見つめて言った。{a}「……許して。身代わりになって｜……許してくれ。身代わりになってくれ｜……許してください。身代わりになってください」'),
kill:L('{a}は、もう一人の自分の喉に手をかけた。{a}「同じ顔は、二つもいらない｜＝｜同じ顔は、二つもいりません」|{a}は、震える手で、もう一人の自分に刃を向けた。「あなたがいたら……私は、私じゃなくなる｜あなたがいたら……私は、私ではなくなる｜あなたがいたら……私は、私ではなくなってしまいます」'),
swapped:L('その夜、{a}が民宿に戻ってきた。いつもより、少しだけ笑顔が多かった。')
},
swap_notice:L('{b}は、戻ってきた{a}に違和感を覚えた。{b}「……あなた、利き手、そっちだったっけ？｜……あなた、利き手はそっちだったか？｜……あなた、利き手はそちらでしたか？」――{a}の顔から、表情が消えた。もう一人の{a}は、霧の中へ逃げていった。座敷牢から、本物の{a}が助け出された。'),
swap_miss:L('誰も、気づかなかった。座敷牢の中では、本物の{a}が、声を枯らして叫び続けていた。'),
kill_rage:L('その瞬間、村じゅうの犬が吠えた。{g}は、隠した子を奪われて怒っていた。'),
sac_do:L('祭壇の前に引き出されたのは、もう一人の{a}だった。それは抵抗せず、{a}の方を振り返って言った。「……いいよ。ずっと、こうなるって分かってた」|白い着物を着せられたもう一人の{a}を、村人たちは疑いもせず祭壇へ運んだ。{a}は、目を閉じていた。'),
end_both:L('村境の道祖神を越えたとき、{a}は振り返った。もう一人の{a}も、ちゃんとそこにいた。二人は、初めて同じ空の下で笑った。'),
end_vanish:L('村境の道祖神を越えた瞬間、つないでいた手が、ふっと軽くなった。振り返ると、誰もいなかった。隠された子は、村から出られなかった。'),
end_leave:L('帰りの車の窓から、{a}は村を振り返った。神社の石段の上に、自分と同じ顔が立って、手を振っていた。'),
end_swap:L('――村を出たのは、{a}の顔をした誰かだった。本物の{a}は、今も座敷牢の中にいる。'),
end_guilt:L('{a}は、村を出てからも、鏡を見るたびに目を逸らすようになった。')
};
})();
});
;
/* ==== js/jashin-npc.js ==== */
HK.Load.def(348,'js/jashin-npc.js',function(){
(function(){
'use strict';
var HK=window.HK,ST=HK.Story,JS=HK.JASHIN,clamp=HK.clamp;
if(!ST|| !JS|| !JS.UNPC_LIST)return;
var B=JS.BATTLE_T,TW=JS.TWIN_T;
function pk(S,a){return ST.pick(S,a);}
function F(t,m){return ST.fmt(t,m);}
function al(p){return JS.alive(p);}
function bond(S,a,b){return JS.REL?JS.REL.bond(S,a,b):0;}
function edge(S,a,b,lab,cls,from){if(JS.DRAMA)JS.DRAMA.edge(S,a,b,lab,cls,from);}
function live(S){return S.P.filter(function(p){return al(p)&& !p.bound;});}
function gainClue(S,p){
var k=S.G.clues.map(function(c,j){return j;}).filter(function(j){return S.found.indexOf(j)<0;})[0];
if(k==null)return'';
S.found.push(k);p.cnt.clue++;
return S.G.clues[k].t;
}
function M(S,p,extra){var m={a:p?p.name:'',g:S.G.call,v:S.V,s:(S.G.sol||'').split('、')[0]};for(var k in extra||{})m[k]=extra[k];return m;}
function npc(S,id){return(S.npcs||[]).filter(function(n){return n.id===id&&n.alive;})[0];}
function arrive(S){
var rng=S.rng,pool=JS.UNPC_LIST.slice();
var pick=[],n=3+(rng()<0.4?1:0);
if(S.G.id==='kamikakushi')pick.push(pool.filter(function(x){return x.id==='tome';})[0]);
while(pick.length<n){
var c=HK.weighted(rng,pool.filter(function(x){return pick.indexOf(x)<0;}),function(x){return x.id==='miyo'||x.id==='tome'?1.6:1;});
if(!c)break;pick.push(c);
}
S.npcs=pick.map(function(d){return{id:d.id,d:d,alive:true,n:0};});
S.npcs.forEach(function(x){ST.say(S,{tag:x.d.name,text:F(pk(S,x.d.greet),M(S,null,{a:''})),why:x.d.name+'：'+x.d.who});});
var mur=S.P.filter(function(p){return p.goal0&&p.goal0.id==='murder';});
S.battlePlan=mur.length>=3&&rng()<0.8;
}
function tick(S,L0,h){
var rng=S.rng;
if(S.forceEnd)return;
if(S.battlePlan&& !S.battleDone&&(h>=4||S.murders)&&rng()<0.6)return battle(S,h);
if(S.G.id==='kamikakushi'&& !S.twin&&h>=6&&rng()<0.16)twinFind(S,h);
if(S.twin&&S.twin.state==='swap'&& !S.twin.checked)twinSwapCheck(S,h);
var xs=(S.npcs||[]).filter(function(x){return x.alive;});
if(!xs.length||rng()>0.42)return;
var L1=live(S);if(!L1.length)return;
var x=rng.pick(xs),d=x.d,p=HK.weighted(rng,L1,function(q){return 1+JS.skill(q,'talk')+(q.action.id==='alone'?0.8:0);});
x.n++;
var r=rng(),m=M(S,p);
if(d.prophecy&& !S.proph&&r<0.35){
S.proph=p;
ST.say(S,{actors:[p],tag:d.name,text:F(pk(S,d.prophecy),m),why:d.name+'が、'+p.name+'の死を予言した',mag:22});
return;
}
if(d.lure&&JS.night(h)&&r<0.5&&p.tr.np+p.tr.ac>0.9){
var lost=rng()<0.4;
if(lost){p.taken=true;p.fate='おかっぱの子に連れて行かれた（'+JS.hm(h)+'）';}
var c0= !lost&&rng()<0.6?gainClue(S,p):'';
ST.say(S,{actors:[p],tag:d.name,kind:lost?'climax':undefined,text:F(pk(S,d.lure),m)+F(pk(S,lost?d.lure_lost:d.lure_back),m)+(c0?'――'+c0+'。':''),why:p.name+'はおかっぱの子について行った（NP・AC）'+(lost?'。行方不明になった（失踪）':c0?'。手がかり +1':''),mag:lost?34:16});
return;
}
if(d.count&&r<0.5){
var cnt=Math.max(1,L1.length-(rng()<0.5?1:0));
L1.forEach(function(q){q.m.fear=clamp(q.m.fear+6,0,100);});
ST.say(S,{actors:[p],tag:d.name,text:F(pk(S,d.count),M(S,p,{n:cnt})),why:'墓守は、生きている一行の人数ぶん穴を掘っている（恐怖 +6）',mag:18});
return;
}
if(d.heal&&p.m.hp<70&&r<0.6){
p.m.hp=clamp(p.m.hp+20,0,100);
ST.sayB(S,{actors:[p],tag:d.name,text:F(pk(S,d.heal),m),why:'体力 +20（生贄には、無傷でいてほしいらしい）'},d.name+'が'+p.name+'を手当てした');
return;
}
if(d.curse&&r<0.2&&p.cnt.clue>=2){
p.m.fear=clamp(p.m.fear+18,0,100);
ST.say(S,{actors:[p],tag:d.name,text:F(pk(S,d.curse),m),why:p.name+'は手がかりを集めすぎた（恐怖 +18）',mag:18});
return;
}
if(d.threat&&r<0.25){
S.hostile=clamp(S.hostile+6,0,100);
ST.say(S,{actors:[p],tag:d.name,text:F(pk(S,d.threat),m),why:'村人の敵意 +6',mag:16});
return;
}
if(d.warn&&r<0.3){
p.stats.luck=Math.min(6,(p.stats.luck||3)+1);p.m.fear=clamp(p.m.fear-4,0,100);
ST.say(S,{actors:[p],tag:d.name,text:F(pk(S,d.warn),m),why:d.name+'が、'+p.name+'を危ないところから引き戻した（運 +1）',mag:16});
return;
}
if(r<0.62){
var ok=rng()<0.3+JS.skill(p,'talk')*0.4+(p.villager?0.2:0);
var c=ok?gainClue(S,p):'';
if(d.id==='tome'&&ok)S.sealBonus=(S.sealBonus||0)+0.06;
ST.say(S,{actors:[p],tag:d.name,text:F(pk(S,d.hint),m)+(c?'――'+c+'。':''),why:d.name+'が'+p.name+'に話した'+(c?'（聞き込みの力。手がかり '+S.found.length+'/'+S.G.clues.length+'）':'（意味は、まだ分からない）')+(d.id==='tome'&&ok?'・対抗策の一節（封じやすくなる）':''),mag:c?20:12});
return;
}
ST.sayB(S,{actors:[p],tag:d.name,text:F(pk(S,d.idle),m),why:d.who},d.name+'が'+p.name+'に話しかけた');
}
function onDeath(S,p){
var rng=S.rng,xs=(S.npcs||[]).filter(function(x){return x.alive;});
if(S.proph===p){
var miyo=npc(S,'miyo');
S.proph='hit';
if(miyo)ST.say(S,{actors:[p],tag:miyo.d.name,text:F(pk(S,miyo.d.proph_hit),M(S,p)),why:'おかっぱの子の予言が当たった',mag:24});
return;
}
if(!xs.length||rng()>0.4||S.battleOn)return;
var x=rng.pick(xs);
var dl=HK.State&&HK.State.noBody(p)?(HK.State.bodyless(x.d.death,p)||x.d.deathNB||x.d.death):x.d.death;
ST.sayB(S,{actors:[],tag:x.d.name,text:F(pk(S,dl),M(S,p)),why:x.d.name+'：'+x.d.who},x.d.name+'が'+p.name+'の死を見ていた');
}
function ritualCameo(S){
var xs=(S.npcs||[]).filter(function(x){return x.alive;});
if(!xs.length)return;
var x=S.rng.pick(xs);
ST.say(S,{tag:x.d.name,text:F(pk(S,x.d.ritual),M(S,null)),why:x.d.name+'：'+x.d.who});
}
function weaponOf(p){var W=JS.GT&&JS.GT.WEAPON;return(p.mur&&p.mur.x)||(W&&(W[p.job]||W.def))||'刃物';}
function battle(S,h){
var rng=S.rng,C=JS.core;
S.battleDone=true;S.battleOn=true;
var mur=S.P.filter(function(p){return p.alive&& !p.out&&p.goal0&&p.goal0.id==='murder';});
mur.forEach(function(p){p.taken=false;});
if(mur.length<2){S.battleOn=false;return;}
ST.step(S,'殺人バトル　'+C.label(h));
mur.forEach(function(p){p.bound=false;p.goal=p.goal0;});
var o=ST.say(S,{actors:mur,tag:'殺人バトル',kind:'climax',text:F(pk(S,B.start),{x:C.names(mur)})+pk(S,B.plan),why:'殺人を目標にする者が'+mur.length+'人いた。――トンチキルート（80％）',mag:50});
ST.key(S,o,'殺人バトル開幕');
var t=F(pk(S,B.massacre),{v:S.V});
(S.npcs||[]).forEach(function(x){if(x.alive){x.alive=false;t+=F(pk(S,x.d.die),{g:S.G.call});}});
t+=F(pk(S,B.noVillage),{v:S.V,g:S.G.call});
S.hostile=0;S.reporter&&(S.reporter.alive=false);S.police&&(S.police.alive=false);
ST.say(S,{actors:mur,tag:'殺人バトル',kind:'climax',text:t,why:'殺人者たちが手を組み、村人を一人残らず殺した（村人の敵意 0・祭りは開かれない）',mag:50});
var others=S.P.filter(function(p){return al(p)&&mur.indexOf(p)<0;});
others.forEach(function(q){
var r=rng();
if(q.job==='streamer')ST.sayB(S,{actors:[q],tag:'殺人バトル',text:F(pk(S,B.stream),{a:q.name}),why:q.name+'は配信していた'},q.name+'は実況していた');
else if(q.tr.fc>0.7&&r<0.3)ST.sayB(S,{actors:[q],tag:'殺人バトル',text:F(pk(S,B.cheer),{a:q.name}),why:'FCが高すぎた'},q.name+'は観戦していた');
else ST.sayB(S,{actors:[q],tag:'殺人バトル',text:F(pk(S,B.hide),{a:q.name}),why:q.name+'は隠れた（慎重さ）'},q.name+'は隠れた');
});
var hp={};mur.forEach(function(p){hp[p.i]=2+Math.round(JS.skill(p,'fight')*3+(p.stats.stamina||3)*0.3);});
var guard=0;
while(mur.filter(al).length>1&&guard++ <40){
var ms=mur.filter(al);
var a=HK.weighted(rng,ms,function(p){return 1+JS.skill(p,'fight')*2+p.tr.aggr;});
var bs=ms.filter(function(q){return q!==a;});
if(HK.SameStory&&HK.SameStory.spare)bs=HK.SameStory.spare(S,a,bs);
var b=HK.weighted(rng,bs,function(q){return 1+(a.mur&&a.mur.t===q?3:0)+Math.max(0,-bond(S,a,q))*2;});
if(ms.length===2&&rng()<0.12){
ms.forEach(function(p){p.alive=false;p.fate='殺人バトルで相討ち（'+JS.hm(h+1)+'）';});
edge(S,ms[0],ms[1],'相討ち','kill');
ST.say(S,{actors:ms,tag:'殺人バトル',kind:'climax',text:F(pk(S,B.double),{a:ms[0].name,b:ms[1].name}),why:'相討ち'+(HK.SameStory&&HK.SameStory.note?HK.SameStory.note(S,ms[0],ms[1]):''),mag:50});
break;
}
var dm={a:a.name,b:b.name,x:weaponOf(a),y:weaponOf(b)};if(dm.x===dm.y)dm.y='もう一本の'+dm.y;
var hitP=0.5+(JS.skill(a,'fight')-JS.skill(b,'fight'))*0.4+(a.stats.luck-b.stats.luck)*0.03;
var win=rng()<hitP?a:b,lose=win===a?b:a,wm={a:win.name,b:lose.name,x:weaponOf(win),y:weaponOf(lose)};
hp[lose.i]-=1+(rng()<0.3?1:0);
var tt=F(pk(S,B.duel),dm)+F(pk(S,B.hit),wm);
if(hp[lose.i]<=0){
lose.alive=false;lose.fate='殺人バトルで'+win.name+'に敗れた（'+JS.hm(h+1)+'）';lose.how=win.name+'に殺されて';
edge(S,win,lose,'殺害','kill',win);
tt+=F(pk(S,B.kill),wm);
ST.say(S,{actors:[win,lose],tag:'殺人バトル',kind:'climax',text:tt,why:win.name+'が'+lose.name+'を倒した（腕っぷし・運）'+(HK.SameStory&&HK.SameStory.note?HK.SameStory.note(S,win,lose):''),mag:46});
}else ST.sayB(S,{actors:[a,b],tag:'殺人バトル',text:tt,why:'殺し合いは続いた'},a.name+'と'+b.name+'がぶつかった');
var hid=others.filter(al);
if(hid.length&&rng()<0.12){
var v=HK.weighted(rng,hid,function(q){return 1+(1-q.tr.caution)+(q.job==='streamer'?1:0);});
v.alive=false;v.fate='殺人バトルに巻き込まれた（'+JS.hm(h+1)+'）';
ST.say(S,{actors:[v],tag:'殺人バトル',kind:'climax',text:F(pk(S,B.caught),{b:v.name})+F(pk(S,B.caught_die),{b:v.name}),why:'巻き込まれた',mag:36});
}
}
var win0=mur.filter(al)[0];
var tend='';
if(win0){win0.fate='殺人バトルの勝者';tend=F(pk(S,B.winner),{a:win0.name});}
tend+=F(pk(S,B.god),{g:S.G.call})+F(pk(S,B.out),{v:S.V});
var outs=S.P.filter(function(p){return al(p)||(p.alive&&p.bound);});
outs.forEach(function(p){p.bound=false;p.taken=false;p.out=true;p.esc=h+2;if(!/勝者/.test(p.fate))p.fate='生き延びた（'+JS.hm(h+2)+'）';});
var o2=ST.say(S,{actors:outs,tag:'決着',kind:'climax',text:tend,why:win0?win0.name+'が最後まで立っていた':'殺人者は全員倒れた',mag:52});
ST.key(S,o2,win0?win0.name+'が殺人バトルに勝利':'殺人バトルは相討ち');
S.titleOverride='殺人バトル決着――'+(win0?'勝者は'+win0.name+'。':'殺人者は全員倒れた。')+S.V+'の村人は、一人も残らなかった（生き延びた人 '+outs.length+'人）';
S.battleOn=false;S.forceEnd=true;
}
function twinFind(S,h){
var rng=S.rng,L1=live(S).filter(function(p){return!p.amn||p.amn.back;});
if(!L1.length)return;
var x=rng.pick(L1),others=L1.filter(function(q){return q!==x;});
var tw=S.twin={x:x,state:'found',name:'もう一人の'+x.name};
var t='';
if(others.length&&rng()<0.5){
var b=rng.pick(others);
t=F(pk(S,TW.seen),{a:x.name,b:b.name})+'――その夜、'+x.name+'は神社の裏で、それを見つけた。';
}
t+=F(pk(S,TW.cell),{a:x.name})+F(pk(S,TW.voice),{a:x.name})+F(pk(S,TW.remember),{a:x.name});
var tome=npc(S,'tome');
if(tome)t+=F(pk(S,tome.d.twin),{a:x.name,g:S.G.call});
else t+='村の掲示板の貼り紙の一枚に、'+x.name+'の生まれた年と、同じ誕生日が書かれていた。――双子だった。';
var o=ST.say(S,{actors:[x],tag:'双子',kind:'climax',text:t,why:'隠し神の村：'+x.name+'には、生まれた晩に隠された双子がいた',mag:44});
ST.key(S,o,x.name+'の双子が見つかった');
var tr=x.tr,cold=others.filter(function(q){return q.tr.cold>0.65&&q.tr.warmth<0.4;})[0];
var w={rescue:0.4+tr.np*1.2+tr.warmth*0.6,leave:0.2+tr.caution*0.8+tr.cold*0.5,sacrifice:(cold?0.4+cold.tr.cold*0.6:0)+tr.cold*0.4-tr.np*0.3,kill:tr.aggr*0.7+tr.cold*0.3-tr.warmth*0.5-0.1,swap:0.25+(x.m.fear/200)};
var ch=HK.weighted(rng,Object.keys(w),function(k){return Math.pow(Math.max(0.02,w[k]),2);});
var m={a:x.name,c:cold?cold.name:'',g:S.G.call};
if(ch==='sacrifice'&& !cold)m.c=x.name;
if(ch==='swap'){
tw.state='swap';tw.at=h;
ST.say(S,{actors:[x],tag:'双子',text:x.name+'は、もう一人の自分に「必ず迎えに来る」と約束して、座敷牢を離れた。'+F(pk(S,TW.choose.swapped),m),why:'――その夜、入れ替わりが起きた（'+x.name+'の恐怖・隠し神の力）',mag:30});
return;
}
tw.state=ch;
var t2=F(pk(S,TW.choose[ch]),m),why={rescue:x.name+'は双子を連れて逃げることにした（NP・温かさ）',leave:x.name+'は双子を置いていくことにした（慎重さ・冷たさ）',sacrifice:(cold&&cold!==x?cold.name+'の提案で、':'')+'双子を生贄の身代わりにすることになった（冷たさ）',kill:x.name+'は双子を殺した（攻撃性）'}[ch];
if(ch==='kill'){S.deadline=Math.max(h+4,S.deadline-4);x.m.fear=clamp(x.m.fear+20,0,100);t2+=F(pk(S,TW.kill_rage),m);why+='。隠し神が怒り、刻限が4時間早まった';tw.dead=true;}
if(ch==='rescue'){x.m.fear=clamp(x.m.fear-15,0,100);}
if(ch==='sacrifice'){S.twinSub=true;}
ST.say(S,{actors:[x].concat(cold&&ch==='sacrifice'?[cold]:[]),tag:'双子',kind:'climax',text:t2,why:why,mag:40});
}
function twinSwapCheck(S,h){
var tw=S.twin,x=tw.x,rng=S.rng;
if(h<tw.at+2)return;
tw.checked=true;
var obs=live(S).filter(function(q){return q!==x;}).sort(function(a,b){return JS.skill(b,'obs')+bond(S,b,x)*0.5-JS.skill(a,'obs')-bond(S,a,x)*0.5;})[0];
if(obs&&rng()<JS.skill(obs,'obs')*0.6+Math.max(0,bond(S,obs,x))*0.35){
tw.state='noticed';
ST.say(S,{actors:[obs,x],tag:'双子',kind:'climax',text:F(pk(S,TW.swap_notice),{a:x.name,b:obs.name}),why:obs.name+'が入れ替わりに気づいた（観察・'+x.name+'との絆）',mag:40});
return;
}
tw.state='swapped';
x.taken=true;x.fate='もう一人の自分と入れ替わられ、座敷牢に残された';
ST.say(S,{actors:[x],tag:'双子',kind:'climax',text:F(pk(S,TW.swap_miss),{a:x.name}),why:'入れ替わりに、誰も気づかなかった',mag:40});
}
function twinRitual(S){
var tw=S.twin;
if(!S.twinSub|| !tw||tw.dead)return null;
tw.dead=true;
ST.say(S,{actors:[tw.x],tag:'双子',kind:'climax',text:F(pk(S,TW.sac_do),{a:tw.x.name}),why:'双子が生贄の身代わりになった（仲間は誰も生贄にならない）',mag:46});
tw.x.notes.push('双子を生贄の身代わりにした');
return{vic:null};
}
function end(S){
var tw=S.twin;
prophEnd(S);
if(!tw)return;
var x=tw.x,m={a:x.name},t=null;
if(tw.state==='rescue'){
if(x.out&&x.alive){var both=S.rng()<0.5;t=pk(S,both?TW.end_both:TW.end_vanish);x.notes.push(both?'双子と一緒に村を出た':'双子は村から出られなかった');}
else x.notes.push('双子を連れて逃げようとした');
}else if(tw.state==='leave'){if(x.out)t=pk(S,TW.end_leave);x.notes.push('双子を置いていった');}
else if(tw.state==='swapped'){
if(S.P.some(function(p){return p.out;}))t=pk(S,TW.end_swap);
x.notes.push('双子と入れ替わられた');
}else if(tw.state==='kill'||tw.state==='sacrifice'){if(x.out)t=pk(S,TW.end_guilt);if(tw.state==='kill')x.notes.push('双子を殺した');}
else if(tw.state==='noticed')x.notes.push('入れ替わりを見抜いてもらった');
if(t)ST.say(S,{actors:[x],tag:'双子',kind:'climax',text:F(t,m),why:'双子の結末',mag:36});
}
function prophEnd(S){
var miyo=(S.npcs||[]).filter(function(n){return n.id==='miyo';})[0];
if(miyo&&S.proph&&S.proph!=='hit'&&S.proph.out)ST.say(S,{actors:[S.proph],tag:miyo.d.name,text:F(pk(S,miyo.d.proph_miss),{a:S.proph.name}),why:'おかっぱの子の予言は、外れた――のだろうか'});
}
if(JS.REL&&JS.REL.onDeath){var od=JS.REL.onDeath;JS.REL.onDeath=function(S,p){od(S,p);onDeath(S,p);};}
if(JS.GOALX&&JS.GOALX.hijackRitual){
var hr=JS.GOALX.hijackRitual;
JS.GOALX.hijackRitual=function(S,h,vic){ritualCameo(S);var tw=twinRitual(S);return tw||hr(S,h,vic);};
}
JS.UNPC={arrive:arrive,tick:tick,end:end};
})();
});
;
/* ==== js/jashin-godev.js ==== */
HK.Load.def(349,'js/jashin-godev.js',function(){
(function(){
'use strict';
var HK=window.HK,ST=HK.Story,JS=HK.JASHIN,clamp=HK.clamp;
if(!ST|| !JS)return;
var EV={},SP={};
function L(s){return s?s.split('|'):[];}
function E(id,d){
d.pre=L(d.pre);d.ok=L(d.ok);d.ng=L(d.ng);if(d.dt)d.dt=L(d.dt);
['okE','ngE','e'].forEach(function(k){if(d[k]&&d[k].dt)d[k].dt=L(d[k].dt);});
(EV[id]=EV[id]||[]).push(d);d.k=id+':'+EV[id].length;
}
var TYPE_JP={obs:'観察',lore:'知識',talk:'聞き込み',spirit:'霊感',explore:'探索',fight:'腕っぷし',rite:'儀式'};
var WHO={
any:function(){return 1;},
alone:function(p){return p.action.id==='alone'?3.5:1;},
imp:function(p){return 0.3+p.tr.impulse*2+p.tr.fc;},
brave:function(p){return 0.3+p.tr.cp+p.tr.aggr+p.stats.stamina*0.15;},
warm:function(p){return 0.3+p.tr.warmth*2+p.tr.np;},
scared:function(p){return 0.3+p.m.fear/30;},
wise:function(p){return 0.3+p.tr.a*2;},
spirit:function(p){return 0.3+JS.skill(p,'spirit')*3;},
f:function(p){return p.gender==='f'?4:p.gender==='m'?0.25:1;},
m:function(p){return p.gender==='m'?4:p.gender==='f'?0.25:1;},
cold:function(p){return 0.3+p.tr.cold*2+p.tr.impulse;},
loud:function(p){return 0.3+p.tr.fc*1.5+p.tr.impulse*1.5-p.tr.caution;},
weak:function(p){return 0.3+(6-p.stats.stamina)*0.3+(6-p.stats.luck)*0.2;}
};
function pickWho(S,who,live){
var f=typeof who==='function'?who:WHO[who||'any']||WHO.any;
var c=live.filter(function(p){return JS.alive(p)&& !p.bound;});
if(!c.length)return null;
return HK.weighted(S.rng,c,function(p){return Math.max(0.02,f(p,S));});
}
function other(S,a,live){
var c=live.filter(function(q){return q!==a&&JS.alive(q)&& !q.bound;});
if(!c.length)return null;
return HK.weighted(S.rng,c,function(q){return 0.4+Math.max(0,JS.REL.bond(S,q,a));});
}
function fmt(S,t,a,b){return ST.fmt(t,{a:a?a.name:'',b:b?b.name:'仲間',d:S.gdDead||'見知らぬ誰か',g:S.G.call,v:S.V,n:S.G.name});}
function pk(S,arr,a,b){return arr&&arr.length?end(fmt(S,ST.pick(S,arr),a,b)):'';}
function end(t){return!t|| /[。」』）！？…―]$/.test(t)?t:t+'。';}
function giveClue(S,p){
var k=S.G.clues.map(function(c,i){return i;}).filter(function(i){return S.found.indexOf(i)<0;})[0];
if(k==null)return'';
S.found.push(k);if(p){p.cnt.clue++;}
return'――'+S.G.clues[k].t+'。';
}
function apply(S,E0,a,b,live,text,tag,why,mag){
var rng=S.rng,C=JS.core;
E0=E0||{};
if(E0.fear)a.m.fear=clamp(a.m.fear+E0.fear,0,100);
if(E0.hp)a.m.hp=clamp(a.m.hp+E0.hp,0,100);
if(E0.fearAll)live.forEach(function(q){if(JS.alive(q))q.m.fear=clamp(q.m.fear+E0.fearAll,0,100);});
if(E0.hostile)S.hostile=clamp(S.hostile+E0.hostile,0,100);
if(E0.deadline)S.deadline=Math.max(S.h+4,S.deadline+E0.deadline);
if(E0.bonus)S.gBonus=(S.gBonus||0)+E0.bonus;
if(E0.flag)S.gf[E0.flag]=(S.gf[E0.flag]||0)+1;
if(E0.clue){var ct=giveClue(S,a);if(ct){text+=ct;why+='（手がかり '+S.found.length+'/'+S.G.clues.length+'）';}}
if(E0.die&&rng()<E0.die*HK.Dark.f(S,'kill')){
C.die(S,a,S.G.call+'の'+tag+'で',E0.dt||['{a}は、それきり動かなくなった。'],text);
return true;
}
if(E0.taken&&rng()<E0.taken){
a.taken=true;a.takenAt=S.h;
var o=ST.say(S,{actors:[a],tag:tag,kind:'climax',text:text+(E0.tt?pk(S,L(E0.tt),a,b):''),why:why+'（連れ去られた。対抗策を実行できれば助け出せる）',mag:mag+8});
ST.key(S,o,a.name+'が連れ去られた');
return true;
}
ST.say(S,{actors:b&&E0.both!==false&&text.indexOf(b.name)>=0?[a,b]:[a],tag:tag,text:text,why:why,mag:mag});
return false;
}
function run(S,d,live,h){
var rng=S.rng,a=pickWho(S,d.who,live);
if(!a)return false;
var b=other(S,a,live);
if(d.needB&& !b)return false;
var dead=S.P.filter(function(p){return!p.alive&& !p.ithFake&& !p.yogFlung;});
S.gdDead=dead.length?dead[dead.length-1].name:null;
var pre=pk(S,d.pre,a,b),why=d.why||S.G.call+'の固有の出来事';
if(!d.sk){apply(S,d.e,a,b,live,pre+pk(S,d.ok,a,b),d.tag,why,d.mag||24);if(d.after)d.after(S,a,true,b);return true;}
var hp=d.help&&b&&JS.REL.near(S,a,b)?b:null;
var ch=d.chance?clamp(d.chance(S,a,hp),0.08,0.92):clamp(JS.skill(a,d.sk)+0.35-(d.d==null?0.4:d.d)+(hp?JS.skill(hp,d.sk)*0.3:0)+a.stats.luck*0.02,0.08,0.92);
var ok=rng()<ch;
var w2=why+'（'+a.name+'の'+(d.skLabel||TYPE_JP[d.sk]+'の力')+(hp?'・'+hp.name+'の助け':'')+'：'+Math.round(ch*100)+'％→'+(ok?'成功':'失敗')+'）';
var t=pre+pk(S,ok?d.ok:d.ng,a,hp||b);
apply(S,ok?d.okE:d.ngE,a,hp||b,live,t,d.tag,w2,(d.mag||24)+(ok?0:6));
if(d.after)d.after(S,a,ok,hp||b);
return true;
}
function tick(S,live,h){
if(!live.length|| !S.G)return;
S.gev=S.gev||{};S.gf=S.gf||{};
var rng=S.rng,sp=SP[S.G.id];
if(sp&&sp.tick&&sp.tick(S,live,h))return;
var defs=EV[S.G.id]||[],mul=0.7+S.env.ev/150,night=JS.night(h);
for(var i=0;i<defs.length;i++){
var d=defs[i],n=S.gev[d.k]||0;
if(n>=(d.max||1)||h<(d.from||0))continue;
if(d.t==='night'&& !night)continue;
if(d.t==='day'&&night)continue;
if(d.need&& !d.need(S,live,h))continue;
if(rng()>d.p*mul)continue;
if(run(S,d,live.filter(JS.alive),h)){S.gev[d.k]=n+1;return;}
}
}
function cave(S,live,rite){
S.gf=S.gf||{};
var sp=SP[S.G.id],r=(sp&&sp.cave&&sp.cave(S,live,rite))||{};
var b=S.gBonus||0;
if(b){r.bonus=(r.bonus||0)+b;r.why=(r.why?r.why+'・':'')+'村で起きた出来事'+(b>0?'（有利）':'（不利）');}
return r;
}
function manifest(S,h,pm){var sp=SP[S.G.id];return sp&&sp.manifest?sp.manifest(S,h,pm):null;}
function endHook(S,how){var sp=SP[S.G.id];if(sp&&sp.end)sp.end(S,how);}
JS.GODEV={E:E,EV:EV,SP:SP,L:L,WHO:WHO,pickWho:pickWho,other:other,fmt:fmt,pk:pk,giveClue:giveClue,apply:apply,run:run,tick:tick,cave:cave,manifest:manifest,end:endHook};
})();
});
;
/* ==== js/jashin-godev-data-a.js ==== */
HK.Load.def(350,'js/jashin-godev-data-a.js',function(){
(function(){
'use strict';
var JS=window.HK&&window.HK.JASHIN,GD=JS&&JS.GODEV;
if(!GD)return;
var E=GD.E;
E('dagon',{tag:'浜の婚礼',t:'night',from:4,p:0.24,who:'alone',sk:'obs',d:0.45,
pre:'夜の浜辺で、{a}は松明の列を見つけた。村人たちが、海に向かって膝をついていた。波間から、ぬめった鱗の人影が、次々と浜へ上がってきた。',
ok:'{a}は岩陰に身を伏せ、最後まで見届けた。村の娘たちが、海から来たものたちの手を取って、波の中へ歩いていった。――村人の離れた目と、ぬめった肌の理由が、ようやく分かった|{a}は息を殺して、海から来たものたちの首筋を見た。そこには、魚の鰓が、ひくひくと動いていた',
ng:'{a}の足元で、貝殻が割れた。何十もの、まばたきをしない目が、一斉に{a}を見た。{a}は砂浜を転がるように逃げ出した。背後から、濡れた足音が、どこまでも追ってきた',
okE:{clue:1,fear:14},ngE:{fear:24,hp: -15,die:0.25,dt:'濡れた手が{a}の足首を掴んだ。{a}は、波の中へ引きずり込まれていった。'},why:'海の父さまの村は、海から来るものと血を交えている'});
E('dagon',{tag:'血筋',t:'day',from:6,p:0.18,who:function(p){return p.villager?6:0.5;},sk:'talk',d:0.35,
pre:'村の老婆が、{a}の顔をしげしげと眺めた。「＠おや……あんた、目が離れてきたね。海の父さまの血が、目を覚ましかけとる」',
ok:'{a}は、震える声で老婆に問いただした。老婆は嬉しそうに、海辺の祭壇の石像のことを話してくれた',
ng:'{a}は、民宿の鏡を見た。自分の目が、昨日より少しだけ、左右に離れている気がした。首筋が、ひどく痒かった',
okE:{clue:1,fear:10},ngE:{fear:22},why:'村の血を引く者には、海の父さまの呼び声が届く'});
E('cthulhu',{tag:'同じ夢',t:'night',from:2,p:0.28,who:'spirit',sk:'spirit',d:0.4,
pre:'{a}は夢を見た。緑色の巨石が、ありえない角度で積み重なった海底の都市。その中心の扉の奥で、何かが、眠りながらこちらを呼んでいた。',
ok:'{a}は、夢の中で目を凝らした。都市の門には、星の形の印が刻まれていた。――目覚めると、{a}は夢で見た印を、手帳に描き写していた|{a}は夢の呼び声に、答えなかった。目覚めたとき、窓の外の村人たちは皆、同じ方角――海を向いて立ち尽くしていた',
ng:'{a}は、夢の中で呼び声に答えてしまった。「＠ふんぐるい むぐるうなふ……」――目覚めた{a}の口は、まだその言葉を呟いていた。{b}が肩を揺さぶるまで、{a}は自分が何を言っているのか分からなかった',
okE:{clue:1,fear:12},ngE:{fear:30,hp: -6},why:'眠りの大神は、夢を通じて人の心を呼ぶ'});
E('cthulhu',{tag:'眠りの番',t:'night',from:8,p:0.2,who:'weak',sk:'fight',d:0.4,
pre:'一行は、眠らないように交代で見張りを立てた。真夜中、{a}の番が回ってきた。瞼が、鉛のように重かった。',
ok:'{a}は冷たい井戸水を頭からかぶり、朝まで目を開けていた。窓の外で、眠ったまま歩く村人たちの行列が、海の方へ消えていった',
ng:'{a}は、うとうとと舟を漕いだ。気づいたとき、{a}は膝まで海に浸かって立っていた。{b}が叫びながら、浜を駆けてきた',
okE:{fear:8,bonus:0.04},ngE:{fear:20,hp: -10,die:0.15,dt:'波が{a}の胸まで来ても、{a}は目を覚まさなかった。{a}は、夢の都市へ向かって、まっすぐ沖へ歩いていった。'},why:'眠ると、海底の都市に呼ばれる'});
E('hastur',{tag:'黄衣の王',t:'any',from:4,p:0.22,who:'wise',sk:'lore',d:0.5,
pre:'公民館で、村の若者たちが芝居の稽古をしていた。台本の表紙には『黄衣の王』とあった。{a}は、手渡された台本の第二幕を開いた。',
ok:'{a}は、第二幕の最初の一行を読んだところで、台本を閉じた。この先を読んではいけないと、学んだ知識が叫んでいた。――表紙の裏の黄色い印だけは、しっかりと目に焼きつけた|{a}は台本を読むふりをして、余白に書き込まれた村人たちのメモを読んだ。そこに、湖のほとりの写本のことが書かれていた',
ng:'{a}は、第二幕を読んでしまった。読み終えた{a}は、穏やかに微笑んで、窓の外の黒い星を見上げた。「――カルコサだ。湖の向こうに、カルコサが見える」|{a}は、台本の言葉が頭から離れなくなった。誰も呼んでいないのに、名を呼んではならぬ方の名が、喉元までせり上がってきた',
okE:{clue:1,fear:10},ngE:{fear:32,hp: -8},why:'戯曲『黄衣の王』の第二幕を読んだ者は、正気を失う'});
E('hastur',{tag:'ビヤーキー',t:'night',from:6,p:0.22,who:'alone',sk:'fight',d:0.45,help:true,
pre:'夜空から、羽ばたきの音が降ってきた。蝙蝠とも鳥ともつかない、腐った翼の獣が、{a}めがけて急降下してきた。',
ok:'{a}は、手近な棒切れで獣の鼻面を打ち据えた。獣は甲高い声で鳴き、黄色い星の方角へ飛び去った|{b}が投げた石が獣の翼に当たった。獣は{a}を取り落とし、{a}は藁屋根の上を転がり落ちた',
ng:'獣は{a}の肩を鉤爪で掴み、夜空へ舞い上がった。{a}の悲鳴は、見る間に遠ざかっていった',
okE:{fear:14,hp: -10},ngE:{fear:20,die:0.5,dt:'翌朝、村の湖のほとりに、{a}が落ちていた。高い、高いところから。',taken:0.6,tt:'――{a}は、湖の向こうの塔へ運ばれていった。'},why:'名を呼んではならぬ方の眷属、星間を飛ぶビヤーキー'});
E('shub',{tag:'収穫祭の宴',t:'night',from:2,p:0.3,who:'imp',sk:'lore',d:0.45,
pre:'村の広場に、長い食卓が並べられた。炙った黒山羊の肉、栗ご飯、茸の土瓶蒸し、それに樽から注がれる山葡萄の新酒。「＠よそのお客人も、どうぞ。今年の実りは格別でしてな」{a}の杯に、紫色の葡萄酒がなみなみと注がれた。',
ok:'{a}は杯を口元まで運んで、手を止めた。葡萄酒の底に、黒い澱が渦を巻いていた。――古文書で読んだ、森の黒山羊に捧げる酒の作り方と、同じだった。{a}は笑って杯を置き、山羊肉にも手をつけなかった|{a}は葡萄酒をひと口だけ含み、そっと手巾に吐き出した。舌に残ったのは、葡萄ではなく、湿った森の土の味だった',
ng:'{a}は、勧められるまま杯を重ねた。甘くて、重くて、体の奥が熱くなった。気がつくと、{a}は宴の輪を離れ、甘い香りのする葡萄畑の奥へ、ふらふらと歩いていた',
okE:{clue:1,fear:6},ngE:{fear:16,hp: -10,die:0.12,dt:'葡萄畑の暗がりで、蹄のある無数の脚が{a}を取り囲んだ。黒い仔山羊たちは、甘えるように{a}にすり寄り、そして、食べた。'},why:'収穫祭の葡萄酒は、森の母に捧げるもの'});
E('shub',{tag:'葡萄踏み',t:'day',from:4,p:0.24,who:'warm',sk:'explore',d:0.4,
pre:'酒蔵の前で、村の娘たちが大桶に入って葡萄を踏んでいた。白い脛が、真っ赤な果汁に染まっていく。「＠お客人も、どうぞ」{a}は手を引かれ、桶の中に足を入れた。',
ok:'果汁は、ぬるかった。足の裏に、ぐにゃりと葡萄ではないものが触れた。{a}が手を突っ込んで引き上げると、それは小さな黒い蹄だった。――桶の底には、生まれる前の仔山羊が、葡萄と一緒に沈められていた|{a}は踏みながら、娘たちの腹がそろって膨らんでいることに気づいた。娘たちは嬉しそうに、腹に手を当てて囁き合っていた。「＠母さまの仔よ」',
ng:'果汁の中から、細い蔓が{a}の足首に絡みついた。娘たちは笑いながら、{a}を桶の底へ押し込もうとした',
okE:{clue:1,fear:14},ngE:{fear:18,hp: -15},why:'豊穣の母の実りは、人の血と仔で育つ'});
E('shub',{tag:'黒い仔山羊',t:'night',from:10,p:0.22,who:'alone',sk:'explore',d:0.45,help:true,
pre:'月のない夜、葡萄棚の奥の木々が、ゆっくりと立ち上がった。木ではなかった。ねじれた蹄の脚、縄のような触手、幹のあちこちに開いたよだれを垂らす口。森の母の仔――黒い仔山羊が、{a}の方へ歩き出した。',
ok:'{a}は葡萄棚を倒しながら走った。仔山羊は熟れた葡萄の匂いに気を取られ、しばらく房を貪っていた。{a}は、その隙に民宿へ転がり込んだ',
ng:'仔山羊の触手が{a}の胴に巻きつき、宙に持ち上げた。{b}が鍬で触手を打ち、{a}は地面に落ちた',
okE:{fear:16},ngE:{fear:24,hp: -25,die:0.2,dt:'仔山羊の口のひとつが、{a}をそっと咥えた。収穫祭の夜の、最初の供物だった。'},why:'豊穣の母は、千の仔を孕む'});
E('cthugha',{tag:'火の精',t:'night',from:4,p:0.24,who:'imp',sk:'spirit',d:0.4,
pre:'{a}が民宿の囲炉裏の火を落とそうとすると、炎が、ひとりでに人の形に伸び上がった。火の粉の目が、{a}を見下ろした。',
ok:'{a}は動じなかった。灰をかけるのではなく、そっと手を合わせ、炎がおさまるのを待った。炎は不満げに揺れ、やがて元の大きさに戻った。――囲炉裏の灰の中に、星の配置を描いた焼き印が残っていた',
ng:'{a}が火箸を突き立てた瞬間、炎が{a}の腕を舐めた。{a}の袖が一瞬で燃え上がった。{b}が水をかぶせ、どうにか火は消えた',
okE:{clue:1,fear:10},ngE:{fear:18,hp: -22,die:0.15,dt:'炎は{a}を包み込み、白い光になって天井へ抜けていった。あとには、人の形に焦げた畳だけが残った。'},why:'炎の御方の火は、消されることを嫌う'});
E('nyogtha',{tag:'穴の呼び声',t:'night',from:4,p:0.24,who:'scared',sk:'fight',d:0.45,help:true,
pre:'村の真ん中の大穴の縁で、{a}は、底から自分の名前を呼ぶ声を聞いた。懐かしい、聞き覚えのある声だった。{a}が覗き込んだ瞬間、穴の底から、黒い粘液の触手が噴き上がった。',
ok:'{a}は縁の杭にしがみつき、触手を蹴りつけた。{b}が{a}の腕を掴んで引き上げた。触手は、獲物を逃したことを惜しむように、ゆっくりと穴の底へ引っ込んでいった|{a}は転がるように穴から離れた。振り返ると、縁の土の上に、生命の十字に似た古い刻印が見えた',
ng:'触手は{a}の腰に巻きつき、穴の縁まで引きずった。{a}の爪が、土に深い筋を残した',
okE:{fear:14,clue:1},ngE:{fear:24,hp: -20,die:0.3,dt:'{a}は、穴の底へ消えた。しばらくして、穴の底から、{a}の声で、次の誰かの名前を呼ぶ声が聞こえ始めた。'},why:'穴の底に棲むものは、懐かしい声で人を呼ぶ'});
E('glaaki',{tag:'緑の崩壊',t:'day',from:4,p:0.22,who:'any',sk:'obs',d:0.35,
pre:'昼下がり、{a}は湖の畔で、日向に座り込んでいる老人を見つけた。老人の頬が、苔のような緑色に変わっていた。',
ok:'{a}が声をかけると、老人の顎が、ぼろりと崩れ落ちた。老人はそれでも穏やかに微笑み、湖の方を指さした。「＠わしは、湖の主さまの従者での。日に当たりすぎた」――老人の胸には、棘の刺さった古い傷跡があった。老人は、陽だまりの中で、緑の粉の山になった|{a}は老人の崩れかけた手から、ぼろぼろの写本の切れ端を受け取った。『グラーキの黙示録』とあった',
ng:'老人の体が、{a}の目の前で崩れた。舞い上がった緑の粉を、{a}は思い切り吸い込んでしまった。{a}はひどく咳き込み、しばらく息ができなかった',
okE:{clue:1,fear:16},ngE:{fear:20,hp: -12},why:'湖の主の従者は、陽の光を浴び続けると「緑の崩壊」を起こす'});
E('quachil',{tag:'止まった時計',t:'any',from:2,p:0.22,who:'wise',sk:'lore',d:0.4,
pre:'村の古い寺で、{a}は、どの柱時計も止まっている一室を見つけた。部屋の真ん中に、少年のような姿の村人が座っていた。「＠ここだけは、時間が進まないんだ。だから、ぼくは年を取らない」',
ok:'少年の膝の上の古文書には、時を留める呪文が書かれていた。{a}は、それを一字一句書き写した。少年は寂しそうに笑った。「＠ぼく、本当はもう百歳なんだよ」',
ng:'{a}が部屋に一歩踏み込んだ瞬間、止まっていた時計が、一斉に動き出した。少年の顔が、見る間に皺だらけになり――{a}の目の前で、塵になって崩れた',
okE:{clue:1,fear:10},ngE:{fear:26},why:'塵を踏むものの村では、時の流れが歪んでいる'});
E('byatis',{tag:'封印の番',t:'night',from:2,p:0.22,who:'brave',sk:'talk',d:0.35,
pre:'見張りの村人が、{a}に頭を下げた。「＠今夜、番が一人足りん。手伝ってはもらえんか。扉を開けようとする者が来たら、止めてくれればええ」{a}は、砦の地下牢の前で、夜明けまで扉を見張った。',
ok:'番のあいだ、村人はぽつりぽつりと話した。封印の紋の描き方、扉の向こうの神が石に変えた人々のこと、そして、神は封を解いた者とは別の人間の姿を借りるということ',
ng:'番の途中、扉の向こうから、{a}の名前を呼ぶ優しい声がした。{a}は、扉の封印の紋に、いつの間にか手を伸ばしていた。村人が慌てて{a}の手を叩き落とした',
okE:{clue:1,fear:8,bonus:0.03},ngE:{fear:20},why:'村人たちは、交代で封印を守っている'});
E('rlyeh_child',{tag:'円錐の岩',t:'any',from:4,p:0.22,who:'imp',sk:'obs',d:0.45,
pre:'干潮の浜で、{a}は円錐形の黒い岩に近づいた。岩の表面には、髪の毛のような細い触手が、びっしりと生えていた。触手は潮風もないのに、そよいでいた。',
ok:'{a}は、触手に触れないように岩の裾を回り込んだ。岩の裾には、海へ続く洞窟の口が開いていた。中から、何かが呼吸する音がした',
ng:'{a}の指先が、触手の一本に触れた。触手が、{a}の手首に巻きついた。{a}の頭の中に、海の底の都市の光景が、溺れるように流れ込んできた',
okE:{clue:1,fear:12},ngE:{fear:26,hp: -12,die:0.15,dt:'満ち潮が戻ってきたとき、岩の裾には、もう{a}の姿はなかった。岩の触手が、一本だけ増えていた。'},why:'海底の黒い仔の像は、生きている'});
E('rhan',{tag:'血の供物',t:'day',from:4,p:0.26,who:'warm',sk:'talk',d:0.4,
pre:'村長が、{a}の前に小さな椀を差し出した。「＠村の決まりでしてな。氷室の神さまに、よそのお客人にも、ほんの少しだけ血を分けていただく」',
ok:'{a}は、うまく話をはぐらかし、代わりに村長から氷室の話を聞き出した。毎日の血の供物が一日でも絶えれば、氷の中の神は弱る――村長は、言ってから口を押さえた',
ng:'{a}が断りきれずに差し出した腕に、刃が当てられた。椀に溜まった{a}の血は、氷室へ運ばれていった。その夜、氷室の方角から、何かが満足げに身じろぎする音が聞こえた',
okE:{clue:1,fear:6},ngE:{hp: -18,fear:14,deadline: -2},why:'氷の中の神は、血の供物で目覚めを待っている'});
E('chaugnar',{tag:'チョー・チョー人',t:'any',from:2,p:0.26,who:'wise',sk:'obs',d:0.4,
pre:'{a}は、村人たちが寺の裏で輪になって話しているのを、物陰から見ていた。誰もが子どものように小柄で、毛のない頭をしていた。その言葉は、どこの国の言葉にも聞こえなかった。',
ok:'{a}は、古文書に記されていた異国の民の特徴を、ひとつずつ思い出した。小柄な体、尖らせた歯、象の神への崇拝、人の肉を喰らう祭り。――この村の人々は、チョー・チョー人だ|{a}は村人の一人が笑ったとき、その歯がすべて、鋭く尖らせてあるのを見た',
ng:'小柄な村人の一人が、ふいに振り返った。物陰の{a}と、目が合った。村人は、尖った歯を見せて笑い、仲間たちに何か囁いた。その夜から、{a}は誰かに見られている気がしてならなかった',
okE:{clue:1,fear:12},ngE:{fear:18,hostile:10},why:'象の神を奉じる村人は、チョー・チョー人の血を引いている'});
E('chaugnar',{tag:'ご馳走',t:'night',from:6,p:0.22,who:'imp',sk:'obs',d:0.45,
pre:'村の寄り合い所で、一行のために宴が開かれた。小柄な村人たちが、大鍋から湯気の立つ肉を、次々と椀によそった。「＠ご馳走です。めったに手に入らない肉です」',
ok:'{a}は、椀の中の肉に、小さな爪の付いた指の骨が混じっているのを見つけた。{a}は椀をそっと置き、仲間にも目で合図した。村人たちは、残念そうに顔を見合わせた',
ng:'{a}は、それをひと口食べてしまった。柔らかくて、ひどく甘かった。――宴のあと、鍋の底に沈んでいたものを見て、{a}は朝まで吐き続けた',
okE:{fear:14,clue:1},ngE:{fear:32,hp: -10},why:'チョー・チョー人は、祭りの夜に人の肉を喰らう'});
E('ghatanothoa2',{tag:'大鹿の問い',t:'any',from:4,p:0.22,who:'any',sk:'talk',d:0.4,
pre:'森の中で、{a}の前に、大鹿の角を持つ女が立っていた。女は、{a}の目をまっすぐ見て問うた。「＠お前は、なぜここへ来た。偽りなく答えよ」',
ok:'{a}は、自分の本当の気持ちを、飾らずに答えた。女はしばらく{a}を見つめ、それから、ほんのわずかに頷いた。「＠偽りのない者は、嫌いではない。祭壇の骨のことを、覚えておけ」',
ng:'{a}は、とっさに取り繕った答えを口にした。女の瞳が冷たく光った。大鹿の角が、{a}の脇腹をかすめた',
okE:{clue:1,fear:8},ngE:{fear:20,hp: -22,die:0.15,dt:'大鹿の角が、{a}の体を、木の幹に縫いとめた。女は、もう{a}を見てもいなかった。'},why:'大鹿の女神は、嘘を嫌う'});
E('mordiggian',{tag:'屍喰い',t:'night',from:6,p:0.3,who:'brave',sk:'explore',d:0.45,
need:function(S){return S.P.some(function(p){return!p.alive;});},
pre:'夜中、安置されていた仲間の遺体のそばで、{a}は湿った音を聞いた。床板を剥がして這い出してきた、犬のような顔の、前かがみの人影が、遺体の足を掴んで引きずろうとしていた。',
ok:'{a}は灯りを掲げて叫んだ。人影たちは光を嫌って床下へ逃げ込んだ。遺体は、どうにか守られた。――床下には、墓地へ続く古い穴が掘られていた|{a}が追い払った人影の一体が、逃げ際に、紫の光を放つ神殿の絵の描かれた札を落としていった',
ng:'{a}が止める間もなく、遺体は床下へ引きずり込まれた。闇の奥から、骨を噛み砕く音だけが、いつまでも聞こえていた',
okE:{clue:1,fear:14},ngE:{fear:26,deadline: -2},why:'屍を喰らう神の眷属が、死者を求めている'});
E('mordiggian',{tag:'空の墓',t:'day',from:2,p:0.2,who:'wise',sk:'lore',d:0.4,
need:function(S){return!S.P.some(function(p){return!p.alive;});},
pre:'{a}は村の墓地を歩いた。どの墓も、土が新しく掘り返されていた。棺の蓋は、内側からではなく、外側からこじ開けられていた。',
ok:'{a}は墓石の裏に刻まれた古い祈りの言葉を読み解いた。「＠誰も死なせぬ夜には、屍の神は飢えて去る」|墓守の老人が、{a}に囁いた。「＠この村では、死人は一晩ともたん。あの方が、みんな召し上がる」',
ng:'{a}が覗き込んだ空の墓穴の底で、何かが、こちらを見上げてにやりと笑った',
okE:{clue:1,fear:8},ngE:{fear:18},why:'屍を喰らう神の村の墓には、骨が残らない'});
E('ygolonac',{tag:'第十二巻',t:'any',from:4,p:0.22,who:'wise',sk:'lore',d:0.5,
pre:'村の古本屋の棚に、背表紙のない分厚い本が一冊だけ差してあった。『グラーキの黙示録　第十二巻』。{a}は、何かに導かれるように、その本を手に取った。',
ok:'{a}は、最初の頁の数行で本を閉じた。それは、読んだ者のもとへ「掌の口」の神を呼び寄せる本だった。{a}は本を布で包み、写本を焼くべき場所を、ようやく理解した',
ng:'{a}は、夢中で頁をめくった。読み進めるほどに、心の底に押し込めていた欲望が、喉元までせり上がってきた。――{a}の掌が、むず痒かった',
okE:{clue:1,fear:10},ngE:{fear:18},after:function(S,a,ok){if(!ok)a.viol=(a.viol||0)+25;},why:'第十二巻を読んだ者のもとに、掌の口さまが訪れる（読みふけると暴力性が増す）'});
})();
});
;
/* ==== js/jashin-godev-data-b.js ==== */
HK.Load.def(351,'js/jashin-godev-data-b.js',function(){
(function(){
'use strict';
var HK=window.HK,JS=HK&&HK.JASHIN,GD=JS&&JS.GODEV,clamp=HK&&HK.clamp;
if(!GD)return;
var E=GD.E,ST=HK.Story;
function selfCtl(S,a,hp){return 0.35+a.tr.caution*0.3+a.tr.cp*0.15-a.tr.impulse*0.25-a.m.fear/400+(hp?0.1:0);}
E('imigui',{tag:'形代',t:'day',from:2,p:0.26,who:'cold',sk:'spirit',d:0.4,
pre:'村の女が、人の形に切った白い紙を手に、{a}に近づいてきた。「＠お客人も、罪のひとつやふたつ、おありでしょう。これで撫でて、いみぐいさまに食うてもらいなされ。楽になりますよ」',
ok:'{a}は、紙の形代を受け取らなかった。女の差し出した形代の裏に、薄く、別の誰かの名前が透けていた。――この村では、罪を食わせた分だけ、神の腹が肥えていく|{a}は形代を受け取るふりをして、女から、社の穴に投げ入れる作法を聞き出した',
ng:'{a}は、半ば冗談のつもりで、形代で胸を撫でた。紙に、墨も使っていないのに、{a}の誰にも話していない罪が、黒々と浮かび上がった。女は満足そうにそれを受け取り、社の穴へ投げ入れた。穴の底で、何かが咀嚼した。――{a}は、自分の中の何かが、ごっそり抜け落ちたような気がした',
okE:{clue:1,fear:8},ngE:{fear:20,hp: -10},why:'喰様は、形代に撫で移された罪や穢れを食う'});
E('imigui',{tag:'神隠し',t:'night',from:10,p:0.26,who:'weak',sk:'fight',d:0.45,help:true,
pre:'夜道で、提灯を持った村人たちが{a}を取り囲んだ。「＠今年は、罪が足りんでな。いみぐいさまの腹が減っとる」「＠旅のお人は、神隠しの番じゃ」背後の闇で、生暖かい、巨大な口が開く気配がした。',
ok:'{a}は提灯を叩き落とし、村人たちのあいだを突っ切って走った。{b}が民宿の戸を開けて待っていた。背後で、空振りした顎が閉じる、ばくん、という音がした',
ng:'{a}の足がもつれた。闇の中の口が、ゆっくりと{a}の上に覆いかぶさってきた',
okE:{fear:18,hp: -8},ngE:{fear:24,die:0.45,dt:'翌朝、村の掲示板に、新しい貼り紙が一枚増えていた。「神隠し　{a}」――村人たちは、それを見ても、誰も驚かなかった。',taken:0.5,tt:'――{a}は、社の穴の奥へ引きずり込まれた。'},why:'喰様は、腹が減ると、外から来た旅人を「神隠し」と称して丸呑みにする'});
E('chibiki',{tag:'新月の夜',t:'night',from:4,p:0.3,who:'imp',chance:function(S,a,hp){return selfCtl(S,a,hp);},skLabel:'自制（慎重さ・CP）',sk:'obs',
pre:'新月の夜だった。地の底から、重い荷車を引きずるような轟音が近づいてきた。家が揺れ、窓に打ちつけた板が軋んだ。板の隙間から、生臭い風が吹き込んできた。{a}の目の前に、指一本ぶんの隙間があった。',
ok:'{a}は、両手で目を覆い、布団の中で歯を食いしばった。轟音が家の前を通り過ぎるまで、半刻もかかった。――翌朝、道の轍は、昨日より深くなっていた。轍の底に、腐った毛皮の切れ端が落ちていた',
ng:'{a}は、隙間から外を覗いてしまった。――{a}は悲鳴を上げなかった。ただ、低い声で笑い始めた。{b}が肩を揺さぶっても、{a}は笑うのをやめなかった',
okE:{clue:1,fear:14},ngE:{fear:60,hp: -10,die:0.25,dt:'{a}は朝になっても笑い続け、笑いながら、ふっと息を止めた。その目は、まだ窓の隙間の向こうを見ていた。'},why:'千曳さまの姿を窓の隙間から見た者は、精神を壊す'});
E('chibiki',{tag:'引き綱',t:'day',from:6,p:0.22,who:'brave',sk:'explore',d:0.45,
pre:'{a}は、轍をたどって裏山へ登った。木々の間に、大人の腕ほどもある引き綱が、何本も張り渡されていた。綱の先は、どれも地面の下へ潜っていた。',
ok:'{a}は、綱を数えた。九百九十九本。そのどれもが、ゆっくりと脈打っていた。綱の根元には、村の家の名を記した木札が括りつけられていた。――村じゅうの家が、千曳さまを荷に繋ぎとめている',
ng:'{a}が綱をまたいだ瞬間、綱がぴんと張り、{a}の足をすくった。地の底から、何かが綱を引いた。{a}は斜面を引きずられ、木の根にしがみついた',
okE:{clue:1,fear:10},ngE:{fear:20,hp: -22},why:'千曳さまは、千本の引き綱で見えない荷を引かされている'});
E('fuchi',{tag:'大君の花嫁',t:'night',from:6,p:0.28,who:'f',sk:'fight',d:0.45,help:true,
pre:'日照りの夜、村の女たちが白無垢を手に民宿へ来た。「＠今年のしろうどさまは、お客人に決まりました」女たちは、{a}の腕を両側から取った。淵のほとりには、重りの石が用意されていた。',
ok:'{a}は女たちの手を振りほどいた。{b}が、提灯を叩き落として女たちの目をくらませた。二人は、淵とは反対の山道へ逃げ込んだ。背後で、女たちの花嫁唄だけが、いつまでも続いていた',
ng:'{a}の手首に、重りの石の縄が結ばれた。白無垢を着せられた{a}の体が、黒い淵の水面に、静かに沈んでいった',
okE:{fear:20,hp: -6},ngE:{die:0.45,dt:'三日後、淵に、白髪の老婆のような溺死体が浮かんだ。白無垢を着ていた。――それは{a}だった。その日の昼、乾いた村に、叩きつけるような豪雨が降った。',taken:0.6,tt:'――村人たちは、{a}を淵の底の大君さまのもとへ送ったと言った。まだ、間に合うかもしれない。'},why:'日照りが続くと、村の娘を「花嫁」として生きたまま淵に沈める'});
E('fuchi',{tag:'浮かんだ花嫁',t:'day',from:2,p:0.22,who:'any',sk:'obs',d:0.35,
pre:'朝、淵のほとりに人だかりができていた。水面に、白髪の老婆の溺死体が浮かんでいた。村人たちは、空を見上げて手を合わせていた。',
ok:'{a}は、老婆の着ている白無垢の衿元に、まだ真新しい刺繍の名を見つけた。二十歳の娘の名だった。――沈められた娘は、数日で老婆の姿になって浮かぶ。淵の底で、何十年分もの時を吸われるのだ',
ng:'{a}が溺死体を覗き込むと、白く濁った目が、ぎょろりと{a}を見た。死体の唇が動いた。「＠つぎは、あなた」',
okE:{clue:1,fear:14},ngE:{fear:26},why:'花嫁は、白髪の老婆の溺死体となって浮かび、同時に雨が降る'});
E('shijima',{tag:'無音の夜',t:'night',from:2,p:0.34,max:2,who:'loud',chance:function(S,a,hp){return selfCtl(S,a,hp);},skLabel:'自制（慎重さ・CP）',sk:'obs',help:true,
pre:'祭りの夜だった。村から、すべての音が消えていた。村人たちは、昼のうちに何度も念を押していた。（筆談で）『咳ひとつ、足音ひとつ、立ててはならぬ』――真夜中、{a}の喉が、ひどくむず痒くなった。|祭りの夜。民宿の廊下を、{a}は息を殺して歩いていた。足元の床板が、軋みそうに撓んだ。',
ok:'{a}は、自分の口を両手で塞ぎ、涙を流しながら咳を飲み込んだ。{b}が、そっと{a}の背中をさすった。窓の外を、細長い白い影が、ゆっくりと通り過ぎていった|{a}は、足を宙に浮かせたまま、何分も動かなかった。やがて、床板の撓みが戻った。外の闇の中で、何かが耳を澄ませるのをやめた気配がした',
ng:'{a}は、こらえきれずに咳き込んだ。――家じゅうの灯りが、一斉に消えた。闇の中で、口を縫い合わされた白い人影が、{a}の枕元に立っていた|床板が、ぎい、と鳴った。その一音で、村中の闇が、一斉に{a}の方を向いた',
okE:{fear:14,bonus:0.03},ngE:{fear:30,die:0.35,dt:'朝、{a}の布団には、口を縫われた人形だけが座っていた。',taken:0.55,tt:'――{a}は、音のない闇に連れ去られた。'},why:'祭りの三晩は音を立ててはならない。音を立てた者は連れ去られる'});
E('shijima',{tag:'不浄の家',t:'day',from:6,p:0.22,who:'wise',sk:'talk',d:0.4,
pre:'{a}は、村はずれの、戸口を板で打ちつけられた空き家の前に立っていた。隣の家の老人が、震える手で、{a}の手帳に字を書いた。',
ok:'『あの家は、去年の祭りの夜、赤子が泣いた。一族みな、しじまさまに連れていかれた』老人は、さらに書き足した。『三晩目の明け方に、大鈴をただ一度だけ鳴らせば、しじまさまはお帰りになる。それまでに一度でも鳴らせば、村ごと消える』',
ng:'老人の筆が止まった。老人は顔を引きつらせ、{a}の背後を指さした。{a}が振り返ると、空き家の打ちつけられた窓の隙間から、口を縫われた人形が、こちらを覗いていた',
okE:{clue:1,fear:8},ngE:{fear:22},why:'音を立てた家は、「不浄」として一族もろとも神隠しに遭う'});
E('mekura',{tag:'薬師像',t:'any',from:2,p:0.2,who:'spirit',sk:'spirit',d:0.4,
pre:'{a}は、寺の本堂で、両目のない木彫りの薬師如来と向き合った。空っぽの眼窩の奥は、どこまでも暗かった。',
ok:'{a}は、眼窩の奥に、ぎっしりと詰め込まれた小さな布包みを見つけた。包みのひとつひとつに、村人の名と、「左腕」「右目」といった部位が書かれていた。――村人から腐り落ちた「厄」が、ここに集められている',
ng:'眼窩の奥から、無数の指が{a}に向かって伸びてきた。{a}は後ずさり、本堂の柱に頭を打ちつけた',
okE:{clue:1,fear:12},ngE:{fear:20,hp: -10},why:'目洗い薬師は、治した部位の代わりに、家族の同じ部位を腐らせる'});
E('akatsuchi',{tag:'お召し上げ',t:'day',from:4,p:0.26,who:'alone',sk:'explore',d:0.45,needB:true,
pre:'{a}は、立ち入りを禁じられた廃坑の奥へ踏み込んだ。赤い土壁が、心臓の鼓動のように、どくん、と脈打った。',
ok:'{a}は、天井から赤い土がぱらぱらと落ちてくるのに気づき、身を翻した。直後、{a}のいた場所に、坑道の天井が崩れ落ちた。――崩れた土の中から、何十年も前の鉱夫の手が、何本も突き出していた',
ng:'天井が、溜息のように崩れ落ちた。{a}の体は、腰まで赤い土に埋まった。駆けつけた{b}の前に、村の老人が立ちはだかった。「＠掘ってはならん。あれは、あかつちさまのお召し上げじゃ」',
okE:{clue:1,fear:14},ngE:{fear:30,hp: -20},
after:function(S,a,ok,b){
if(ok|| !JS.alive(a))return;
if(!b|| !JS.alive(b))return JS.core.die(S,a,'落盤で',['{a}の上に、赤い土が降り積もっていった。土は、温かかった。']);
var dig=b.tr.warmth+b.tr.np*0.5+JS.REL.bond(S,b,a)*0.6>b.tr.caution+b.tr.ac*0.5+0.3;
if(dig){
S.hostile=clamp(S.hostile+20,0,100);S.deadline=Math.max(S.h+4,S.deadline-4);
a.m.hp=clamp(a.m.hp-10,0,100);
ST.say(S,{actors:[b,a],tag:'お召し上げ',kind:'climax',text:b.name+'は老人を突き飛ばし、素手で赤い土を掘り始めた。爪が割れ、指が血に染まった。――'+a.name+'は、引きずり出された。その瞬間、山全体が、怒ったように大きく脈打った。村人たちは、真っ青な顔で二人を見ていた。「＠掟を、破りおった」',why:b.name+'は掟より'+a.name+'を選んだ（人あたり・情の深さ）。村人の敵意が増し、刻限が早まった',mag:40});
}else{
JS.core.die(S,a,'あかつちさまのお召し上げで',[b.name+'は、老人の言葉に、伸ばした手を止めてしまった。{a}の上に、赤い土が静かに降り積もっていった。土は、温かかった。']);
b.m.fear=clamp(b.m.fear+20,0,100);
}
},why:'落盤は「神のお召し上げ」。遺体を掘り起こしてはならない掟がある'});
E('akatsuchi',{tag:'赤い井戸',t:'any',from:2,p:0.18,who:'any',sk:'obs',d:0.35,
pre:'民宿の井戸から汲んだ水は、うっすらと赤かった。女将は平然と言った。「＠あかつちさまの血が混じっとるだけです。体にええですよ」',
ok:'{a}は、水を飲まずに、桶の底に溜まった赤い沈殿を指ですくった。それは土ではなかった。乾いた血の粉だった|{a}は、女将の手の爪の間が赤い土で染まっているのを見た。女将の手の甲の血管も、ほんのりと赤い土色をしていた',
ng:'{a}は、喉の渇きに耐えきれず、その水を飲んでしまった。鉄の味がした。その夜、{a}の指先の血管が、赤い土色に浮き上がっていた',
okE:{clue:1,fear:8},ngE:{fear:16,hp: -12},why:'赤い土は、神の血'});
E('shinigami',{tag:'迎えの帳面',t:'any',from:4,p:0.24,who:'scared',sk:'lore',d:0.45,help:true,
pre:'神社の帳面を盗み見た{a}は、息を呑んだ。そこには一行全員の名前が並び、一番上の{a}の名前の横に、今日の日付が書かれていた。',
ok:'{a}は筆を取り、自分の名前の横の日付を、墨で塗りつぶした。{b}が、帳面の奥付に書かれた、むかえさまの本当の名前の一部を読み上げた。――「黄泉迎ノ大神」|{a}は、帳面の名前の順番が、村の門の数字と対応していることに気づいた',
ng:'{a}が帳面を閉じようとすると、帳面の紙が、{a}の指に貼りついて離れなかった。廊下の向こうから、提灯の明かりが、音もなく近づいてきた',
okE:{clue:1,fear:12},ngE:{fear:28,die:0.25,dt:'提灯を持った黒い着物の影が、{a}の前で深々と頭を下げた。「＠お迎えに、参りました」――{a}は、それについていった。'},why:'むかえさまの帳面に名がある者は、その日に迎えられる'});
E('ajiro',{tag:'網にかかったお方',t:'day',from:4,p:0.3,who:'wise',sk:'obs',d:0.4,
need:function(S){return S.P.some(function(p){return!p.alive&& !p.ithFake&& !p.yogFlung;});},
pre:'嵐の翌朝、漁師たちが浜で騒いでいた。網に、何かがかかっていた。社の戸板に安置されたその白布の下から、見覚えのある靴が覗いていた。――{d}だった。漁師たちは、それを観音さまの化身として拝んでいた。',
ok:'{a}は、漁師たちの前で{d}の名前を、はっきりと呼んだ。漁師たちが、一瞬だけ、ばつの悪そうな顔をした。「＠……観音さまに、名前なんぞ、ない」――名を持つ者を観音にしてはいけない。それが、この村の理の綻びだった|{a}は戸板のそばで、これまでに安置された「観音さま」たちの遺品の山を見つけた。財布、指輪、免許証。どれも、身元がわかる物だった',
ng:'{a}が止める間もなく、漁師たちは{d}の体に白布をかけ直し、社の奥へ運んでいった。数日後、溶けた肉が、湖に撒かれる――{a}は、その場に崩れ落ちた',
okE:{clue:1,fear:16},ngE:{fear:30},why:'網代観音の村では、嵐の翌日に網にかかった水死体を観音の化身として祀る'});
E('ajiro',{tag:'網にかかったお方',t:'day',from:4,p:0.26,who:'wise',sk:'obs',d:0.4,
need:function(S){return!S.P.some(function(p){return!p.alive&& !p.ithFake&& !p.yogFlung;});},
pre:'嵐の翌朝、網に身元不明の水死体がかかった。漁師たちは、それを社の戸板に恭しく安置した。白布の下の顔を見た{a}は、凍りついた。――それは、{a}自身の顔をしていた。',
ok:'{a}は震える手で、遺体の上着を探った。ポケットに、濡れた身分証が入っていた。{a}とよく似た、まったくの別人だった。――この「観音さま」にも、名前がある',
ng:'{a}が見ている前で、遺体の唇が動いた。「＠あなたも、すぐに、こちらへ」――漁師たちは、満足そうに頷き合った。「＠次の観音さまも、決まったようじゃな」',
okE:{clue:1,fear:18},ngE:{fear:30,hostile:10},why:'網代観音の村では、身元不明の水死体を観音の化身として祀る'});
E('madara',{tag:'斑',t:'any',from:4,p:0.26,who:'f',sk:'spirit',d:0.45,
pre:'朝、{a}は自分の手の甲に、黒い斑点が浮いているのに気づいた。斑点は、村で織られている絹の模様と、まったく同じ形をしていた。',
ok:'{a}は、斑点を塩で揉み、神社の御神酒で清めた。斑点は、少しだけ薄くなった。村の娘が、それを見て、ひどく悲しそうな顔をした。「＠消せるのね。……わたしたちは、もう消せない」娘は、機屋の奥の部屋のことを、小声で話してくれた',
ng:'斑点は、昼過ぎには腕まで広がっていた。村の女たちが、嬉しそうに{a}を取り囲んだ。「＠お仲間ね。もうすぐ、繭入りよ」',
okE:{clue:1,fear:14},ngE:{fear:26,hp: -8,flag:'spot'},why:'斑様の絹を紡ぐ女たちの肌には、絹と同じ斑模様が浮かぶ'});
E('madara',{tag:'繭入りの儀',t:'night',from:10,p:0.3,who:function(p,S){return(p.gender==='f'?2:1)*(S.gf.spot?2:1);},sk:'fight',d:0.45,help:true,
pre:'夜の機屋で、斑の満ちた女が、白い襦袢姿で蚕棚の前に立っていた。女は、穏やかに微笑みながら、自分の首筋の皮膚に爪を立て、ゆっくりと引き下ろした。皮膚は、着物を脱ぐように、するすると剥がれていった。村の女たちが、{a}の腕を取った。「＠次は、あなたの番」',
ok:'{a}は、女たちを振り払い、機屋を飛び出した。{b}が、機屋の戸に閂をかけた。中から、蚕たちが何かを食む音が、雨音のように響いてきた',
ng:'女たちの手が、{a}の襟元を開いた。{a}の首筋の斑点に、冷たい爪が当てられた',
okE:{fear:26,clue:1},ngE:{fear:30,die:0.4,dt:'翌朝、機屋の奥の部屋に、新しい皮が一枚、吊るされていた。斑模様の、{a}の形をした皮だった。',taken:0.6,tt:'――{a}は、機屋の奥の部屋へ連れていかれた。'},why:'斑の満ちた女は、生きたまま皮膚を脱ぎ落とし、蚕に食わせる「繭入りの儀」'});
E('hakuja',{tag:'白蛇の嫁',t:'night',from:6,p:0.24,who:'warm',sk:'talk',d:0.45,help:true,
pre:'村の長老が、{a}の前に三つ指をついた。「＠みいさんが、お客人を嫁に、とお望みです」床の間の白い蛇の置物が、ちろりと舌を出した。',
ok:'{a}は、丁寧に頭を下げ、遠回しに断った。長老は、残念そうに嫁の名簿を閉じた。――その名簿には、この百年で嫁に出された娘たちの名が並んでいた|{a}がのらりくらりと話を逸らすうちに、長老は酒に酔い、池に酒を注ぐとみいさんが酔い潰れる、と口を滑らせた',
ng:'{a}が言葉に詰まった隙に、長老はにっこり笑った。「＠では、決まりですな」その夜、{a}の布団の中に、冷たく、重い何かが滑り込んできた',
okE:{clue:1,fear:8},ngE:{fear:24,taken:0.5,tt:'――翌朝、{a}の布団は空だった。池のほとりに、白い鱗が一枚落ちていた。'},why:'みいさんは、毎年、村の外から嫁を迎える'});
E('kubinashi',{tag:'首無しの行列',t:'night',from:4,p:0.24,who:'imp',sk:'obs',d:0.45,
pre:'真夜中、村の通りを、首のない行列が歩いていた。先頭の者の両手には、首の代わりに、白い布で包んだ何かが抱えられていた。行列が、{a}の前で止まった。',
ok:'{a}は、地蔵の陰に身を伏せ、行列が通り過ぎるのを待った。行列は、村はずれの塚の前で、布包みを一つずつ土に埋めていった。――首は、胴とは別の場所に埋められている',
ng:'行列の先頭の者が、首のない肩を、ゆっくりと{a}の方に向けた。抱えた布包みが、もぞりと動いた。布の隙間から、{a}自身の顔が、こちらを見上げていた',
okE:{clue:1,fear:14},ngE:{fear:26,die:0.2,dt:'翌朝、村はずれの地蔵がひとつ増えていた。首のない、{a}と同じ背丈の地蔵だった。'},why:'かけさまの行列'});
E('kakashi',{tag:'着替えた案山子',t:'day',from:4,p:0.24,who:'any',sk:'explore',d:0.4,
pre:'{a}は、田んぼの真ん中の案山子が、自分の上着を着ているのに気づいた。民宿の部屋に干しておいたはずの上着だった。案山子の顔の布には、下手な字で{a}の名前が書かれていた。',
ok:'{a}は、日が暮れる前に案山子から上着を剥ぎ取り、藁の顔を引き裂いた。藁の中から、古い人の髪の毛の束が出てきた。――一番古い案山子の藁が、田の神の宿り木になっている',
ng:'{a}が案山子に近づいたとき、夕陽が沈んだ。案山子の藁の手が、ゆっくりと{a}の手首を掴んだ',
okE:{clue:1,fear:10},ngE:{fear:22,die:0.25,dt:'翌朝、田んぼの案山子が一体増えていた。{a}の服を着て、{a}と同じ背丈の。顔の布の下は、藁ではなかった。'},why:'そほどさまは、服を着せた者と入れ替わる'});
E('ryujin',{tag:'雨乞い',t:'day',from:4,p:0.22,who:'wise',sk:'lore',d:0.4,
pre:'村の広場で、雨乞いの相談が開かれていた。「＠はちだいさまに、今年も人身御供を」村人たちの目が、一斉に一行に向いた。{a}は、その場で、村の古い水利図を見せてほしいと頼んだ。',
ok:'{a}は水利図を指でなぞり、ある一点で止めた。「ここの堰が、何十年も前に埋められてる。雨が降らないんじゃない。水が来なくなっただけだ」村人たちは、顔を見合わせた',
ng:'{a}の話を、村人たちは誰も聞こうとしなかった。「＠よそ者が、はちだいさまを愚弄するか」',
okE:{clue:1,fear:4,hostile: -10},ngE:{hostile:15,fear:12},why:'八大竜王の村は、干ばつに苦しんでいる'});
E('mayu',{tag:'繭',t:'night',from:4,p:0.26,who:'weak',sk:'fight',d:0.4,help:true,
pre:'夜中、{a}は息苦しさで目を覚ました。体じゅうに、白く細い絹糸が、何重にも巻きついていた。糸は、天井の暗がりから降りてきていた。',
ok:'{a}は、もがいて糸を引きちぎった。{b}が、囲炉裏の火箸で糸を焼き切った。天井の暗がりで、巨大な何かが、ゆっくりと身じろぎした',
ng:'糸は、{a}がもがくほど固く締まった。{a}の体は、見る間に白い繭に包まれ、天井へと吊り上げられていった',
okE:{fear:16,hp: -8},ngE:{fear:24,taken:0.7,tt:'――村で一番大きな繭が、また少し、大きくなった。中から、かすかに{a}の声がした。',die:0.2,dt:'朝、天井から吊るされた繭は、もう動かなかった。'},why:'こかげさまは、人を繭に包んで育てる'});
E('hiruko',{tag:'流れ着いたもの',t:'day',from:2,p:0.24,who:'warm',sk:'talk',d:0.4,
pre:'朝の浜に、葦の舟が流れ着いていた。中には、手足の萎えた、骨のない赤子のようなものが寝かされていた。それは、{a}を見上げて、か細い声で言った。「＠おかあさん」',
ok:'{a}は、ためらいながらも、それを抱き上げ、名前を呼んでやった。それは、嬉しそうに目を細め、浜の社の方を指さした。――名前と産着を、ずっと待っていたのだ',
ng:'{a}が後ずさると、それは葦の舟から這い出して、{a}の足にしがみついた。「＠おいていかないで」骨のない腕が、波打ち際へ{a}を引きずった',
okE:{clue:1,fear:10},ngE:{fear:24,hp: -14,die:0.15,dt:'{a}は、それを抱いたまま、波の中へ消えた。葦の舟だけが、沖へ流されていった。'},why:'よりえびすさまは、家族として迎えられるのを待っている'});
E('kuchisake',{tag:'おはぐろさまの問い',t:'night',from:4,p:0.26,who:'any',chance:function(S,a){return 0.3+a.tr.a*0.3+a.tr.caution*0.2-a.tr.impulse*0.15-a.m.fear/400;},skLabel:'機転（論理・慎重さ）',sk:'obs',
pre:'夜道で、口元を布で覆った背の高い女が、{a}の前に立ちふさがった。「＠わたし、きれい？」',
ok:'{a}は、震える声で答えた。「……普通、だと思う」女は、しばらく黙りこみ、首をかしげた。それから布を少しだけずらして、口の端を見せた。耳まで裂けていた。女は、なぜか寂しそうに、闇の中へ帰っていった|{a}は答えずに、ポケットの飴玉を差し出した。女は飴玉を受け取り、布越しにくすりと笑った',
ng:'{a}は、思わず「きれいです」と答えてしまった。女は布を外した。耳まで裂けた口が、にいっと笑った。「＠これでも？」女の手には、大きな裁ちばさみが光っていた',
okE:{clue:1,fear:16},ngE:{fear:30,hp: -25,die:0.3,dt:'裁ちばさみの音が、夜道に一度だけ響いた。'},why:'おはぐろさまの問いには「普通」と答えるのがよい'});
E('dorogami',{tag:'田を返せ',t:'night',from:4,p:0.24,who:'alone',sk:'explore',d:0.45,
pre:'泥田の畦道を歩いていた{a}の足元で、泥がぼこりと盛り上がった。泥の中から、一つ目の黒い頭が現れ、泥まみれの手を伸ばした。「＠田を返せ……田を、返せ……」',
ok:'{a}は畦道を飛び越えて逃げた。泥の手が掴み損ねたあとに、腐った紙の切れ端が残っていた。古い証文の一部だった',
ng:'泥の手が、{a}の足首を掴んだ。{a}は、泥田の中に引きずり込まれた',
okE:{clue:1,fear:14},ngE:{fear:24,hp: -20,die:0.25,dt:'泥田の水面には、泡がいくつか浮かんで、消えた。'},why:'ぬたさまは、田を奪われた恨みを抱いている'});
E('hanayome',{tag:'花婿',t:'night',from:6,p:0.24,who:'m',sk:'talk',d:0.45,help:true,
pre:'神社の拝殿に、花嫁衣装の女が座っていた。綿帽子の奥から、{a}を見上げた。「＠ずっと、お待ちしておりました。旦那さま」三三九度の盃が、{a}の前に差し出された。',
ok:'{a}は、盃を受け取らずに、静かに言った。「あなたの待っている人は、もう来ない」綿帽子が、かすかに震えた。拝殿の奥の古い文箱に、花婿が来なかった日のことが、細々と書かれていた',
ng:'{a}は、断りきれずに盃を口にしてしまった。花嫁は、綿帽子の奥で嬉しそうに笑った。その顔には、目も鼻もなかった',
okE:{clue:1,fear:12},ngE:{fear:24,taken:0.6,tt:'――{a}は、白人様の花婿として、拝殿の奥へ連れていかれた。'},why:'白人様は、来なかった花婿を待ち続けている'});
E('tsuchigumo',{tag:'床下',t:'night',from:4,p:0.24,who:'weak',sk:'obs',d:0.45,help:true,
pre:'夜中、{a}の布団の下の畳が、かすかに持ち上がった。畳の隙間から、節くれだった長い指が、何本も這い出してきた。',
ok:'{a}は飛び起き、畳を踏みつけた。指は引っ込んだ。畳をめくると、床下に、人がやっと通れるほどの穴が、村の地下へと続いていた',
ng:'指が{a}の足首を掴み、畳の下の暗がりへ引きずり込んだ',
okE:{clue:1,fear:14},ngE:{fear:24,taken:0.6,tt:'――{a}の悲鳴は、地下の通路の奥へ遠ざかっていった。',die:0.2,dt:'朝、畳の隙間から、{a}の手がのぞいていた。'},why:'やつかさまの一族は、村の地下に棲んでいる'});
E('ama',{tag:'潜り',t:'day',from:4,p:0.24,who:'brave',sk:'explore',d:0.45,
pre:'海女たちが、{a}を舟に誘った。「＠お客人も、潜ってみなさいな。海の底は、きれいよ」{a}は、海女たちに混じって、透き通った海に飛び込んだ。',
ok:'海の底には、男物の着物や背広が、何十着も、海藻のように揺れていた。{a}は息の続くかぎり潜り、それを一枚、浜まで引き上げた。――この村から男がいない理由が、そこにあった',
ng:'海の底で、海藻のような何かが{a}の足に絡みついた。見上げると、海女たちが水面から、笑いながら{a}を見下ろしていた',
okE:{clue:1,fear:14},ngE:{fear:24,hp: -20,die:0.3,dt:'{a}の着ていた服だけが、翌朝、海の底で揺れていた。'},why:'磯御前の村の男たちは、海の底へ連れていかれた'});
E('yatsume',{tag:'八つの目',t:'any',from:4,p:0.24,who:'imp',sk:'obs',d:0.45,
pre:'{a}は、村の戸板に描かれた八つの目が、自分の動きに合わせて、ぎょろりと動くのに気づいた。どこへ行っても、八つの目のどれかが、{a}を見ていた。',
ok:'{a}は、八つの目の向きを一つずつ確かめた。一つだけ、白く濁って、何も見ていない目があった。――その目の死角を通れば、見られずに本殿へ近づける',
ng:'八つの目が、一斉に{a}を見た。{a}の目から、血の涙が流れた',
okE:{clue:1,fear:12},ngE:{fear:24,hp: -15},why:'八つ目様は、村のすべてを見ている'});
E('shiroi',{tag:'返事',t:'any',from:2,p:0.26,who:'warm',chance:function(S,a,hp){return 0.4+a.tr.caution*0.25+a.tr.cold*0.15-a.tr.warmth*0.2-a.tr.np*0.1+(hp?0.1:0);},skLabel:'無視する力（慎重さ・冷たさ）',sk:'obs',help:true,
pre:'林のそばを通りかかった{a}に、白い服の背の高い人影が、優しい声で話しかけてきた。「＠道に、迷ったのですか」――その声は、{a}の大切な人の声に、そっくりだった。',
ok:'{a}は、唇を噛んで、何も答えなかった。{b}が、黙って{a}の腕を引いた。背後で、ものみさまが、ぽつりと言った。「＠……つまらないの」林の杭に、白い布の切れ端が、何本も結ばれていた',
ng:'{a}は、思わず「はい」と答えてしまった。ものみさまが、嬉しそうに微笑んだ。その首が、ありえない角度に、ゆっくりと傾いた',
okE:{clue:1,fear:12},ngE:{fear:28,die:0.3,dt:'{a}は、ものみさまに手を引かれて、林の奥へ歩いていった。二度と、振り返らなかった。'},why:'ものみさまに返事をしてはならない'});
E('tatari',{tag:'御霊の声',t:'night',from:4,p:0.24,who:'spirit',sk:'spirit',d:0.45,
pre:'夜中、{a}が、低い声で何かを語り始めた。{a}の声ではなかった。何百年も前の言葉づかいで、裏切られ、殺され、捨てられた者たちの恨みを、延々と。',
ok:'{a}の口を借りた御霊は、最後に、一番奥の祠の場所を告げた。「＠我らを、正しく祀れ」――{a}は、はっと我に返った',
ng:'御霊の声は、朝まで止まらなかった。{a}の顔は、見知らぬ誰かの、恨みに歪んだ顔になっていた',
okE:{clue:1,fear:16},ngE:{fear:26,hp: -10},why:'御霊大明神は、正しく祀られなかった御霊の集まり'});
E('oshira',{tag:'遊ばせ',t:'day',from:2,p:0.24,who:'warm',sk:'talk',d:0.4,
pre:'村の子どもたちが、桑の木の人形を抱えて、{a}のところへやってきた。「＠おしら様が、お客人と遊びたいって」人形の布が、一枚、剥がれかけていた。',
ok:'{a}は、子どもたちと一緒に、教わった唄を歌いながら、人形を揺らしてやった。人形の布の下に、古い字で、昔この人形を遊ばせなくなった家の名が書かれていた',
ng:'{a}が人形を受け取るのをためらうと、子どもたちの顔から、すっと表情が消えた。「＠遊んでくれないの」その夜、{a}は高い熱を出した',
okE:{clue:1,fear:8},ngE:{fear:20,hp: -18},why:'おしら様は、遊ばせてもらえないと祟る'});
E('kamikakushi',{tag:'かごめかごめ',t:'day',from:4,p:0.22,who:'imp',sk:'spirit',d:0.45,
pre:'夕暮れの境内で、村の子どもたちが、かごめかごめをしていた。「＠お客人も、入って」{a}は、輪の真ん中にしゃがまされた。「＠うしろの正面、だあれ」',
ok:'{a}は、目を開けずに、子どもたちの名前を一人ずつ呼んだ。呼ばれた子は、一人、また一人と、夕闇に溶けるように消えていった。最後に残った子が、竹林の奥を指さした',
ng:'{a}は、うしろの正面の子の名前を、答えられなかった。子どもたちの手が、輪を、きゅっと狭めた',
okE:{clue:1,fear:14},ngE:{fear:24,taken:0.5,tt:'――目を開けると、境内には誰もいなかった。{a}の姿も。'},why:'隠し神の隠れ里の子どもたち'});
E('kodama',{tag:'木霊',t:'any',from:2,p:0.22,who:'imp',chance:function(S,a,hp){return selfCtl(S,a,hp)+0.05;},skLabel:'自制（慎重さ・CP）',sk:'obs',
pre:'森の中で、{a}の名前を呼ぶ声がした。仲間の声だった。「＠――おーい、{a}、こっちだ」',
ok:'{a}は返事をしかけて、口を押さえた。仲間は皆、民宿にいるはずだった。声のした方の御神木の幹に、人の顔のような木目が、いくつも浮かんでいた',
ng:'{a}は「今行く」と返事をしてしまった。森じゅうの木が、一斉に、{a}の声で「今行く」と答えた',
okE:{clue:1,fear:12},ngE:{fear:24,die:0.25,dt:'{a}は、声のする方へ歩いていった。御神木の幹に、新しい顔の木目が一つ増えた。'},why:'木霊に返事をすると、森に取り込まれる'});
E('suiko',{tag:'河童の相撲',t:'day',from:2,p:0.26,who:'brave',sk:'fight',d:0.4,
pre:'川べりで、甲羅を背負った子どもほどの影が、{a}に向かって四股を踏んだ。「＠相撲を取れ。負けたら、尻子玉をもらうぞ」',
ok:'{a}は、河童に深々とお辞儀をした。河童もつられてお辞儀をした。頭の皿の水が、ざばりとこぼれた。力の抜けた河童を、{a}はあっさりと投げ飛ばした。河童は悔しそうに、淵の詫び証文のありかを白状した',
ng:'河童の力は、見た目からは想像もつかなかった。{a}は川の中へ、頭から投げ込まれた',
okE:{clue:1,fear:4},ngE:{fear:18,hp: -22,die:0.15,dt:'水面に浮かんできた{a}は、ひどく安らかな顔をしていた。'},why:'ひょうすべさまは相撲が好き。お辞儀をすると頭の皿の水がこぼれる'});
E('kurai',{tag:'名付け',t:'night',from:6,p:0.24,who:'imp',chance:function(S,a,hp){return 0.35+a.tr.caution*0.3+a.tr.a*0.2-a.tr.impulse*0.25;},skLabel:'自制（慎重さ・論理）',sk:'obs',
pre:'空の本殿の暗がりから、子どものような声がした。「＠ねえ、ぼくに、なまえをつけて」本殿の床には、村人たちが書いた名前の候補の紙が、何百枚も散らばっていた。',
ok:'{a}は、何も答えずに本殿を出た。背後で、声が泣きじゃくった。――名を与えられた瞬間、あれは「神」になる。この村は、それを止めるために、ずっと名を与えずにきたのだ',
ng:'{a}は、思わず、ひとつの名前を口にしてしまった。本殿の暗がりが、ぐん、と濃くなった。「＠ありがとう」――声は、もう子どもの声ではなかった',
okE:{clue:1,fear:12},ngE:{fear:26,deadline: -6},why:'からみやさまに名を与えると、神として完成してしまう'});
E('tsuki',{tag:'月の光',t:'night',from:4,p:0.24,who:'imp',sk:'spirit',d:0.45,
pre:'満月でもないのに、村は真昼のように明るかった。{a}は、月の光の中で、自分の影が勝手に踊りだしたのを見た。',
ok:'{a}は、影から目を逸らし、建物の陰に入った。影は、ようやく{a}の足元に戻ってきた。池の水面に、空にはない、もう一つの満月が映っていた',
ng:'{a}の体が、影に引っ張られるように踊り始めた。止まれなかった。夜明けまで、{a}は月の下で踊り続けた',
okE:{clue:1,fear:12},ngE:{fear:22,hp: -22,die:0.15,dt:'夜明け、池のほとりで、踊り疲れた{a}が倒れていた。もう、息はなかった。'},why:'さんやさまの光は、人を狂わせる'});
E('sekai',{tag:'箱庭の人形',t:'any',from:4,p:0.24,who:'wise',sk:'obs',d:0.45,
pre:'{a}は、神社の奥の箱庭を覗き込んだ。小さな村の模型の中に、一行と同じ数の人形が置かれていた。一体は、{a}と同じ服を着ていた。',
ok:'{a}は、人形には触れずに、箱庭の地形を隅々まで眺めた。箱庭の端に、本物の村にはない、細い一本道が描かれていた|{a}は、箱庭の人形の位置が、一行の今いる場所と、ぴたりと一致していることに気づいた',
ng:'{a}は、自分の人形を、そっと持ち上げてしまった。――{a}の体が、ふわりと浮き上がった。{b}が叫ぶ声が、ひどく遠くに聞こえた',
okE:{clue:1,fear:12},ngE:{fear:28,hp: -18},why:'ひながたさまの箱庭は、この村そのもの'});
})();
});
;
/* ==== js/jashin-godev-sp-a.js ==== */
HK.Load.def(352,'js/jashin-godev-sp-a.js',function(){
(function(){
'use strict';
var HK=window.HK,ST=HK.Story,JS=HK.JASHIN,clamp=HK.clamp,GD=JS&&JS.GODEV;
if(!ST|| !JS|| !GD)return;
var SP=GD.SP,E=GD.E,L=GD.L;
function alive(p){return JS.alive(p);}
function names(l){return l.map(function(p){return p.name;}).join('・');}
function best(live,type,f){return live.filter(function(p){return alive(p)&& !p.bound&&(!f||f(p));}).sort(function(a,b){return JS.skill(b,type)-JS.skill(a,type);})[0];}
E('yog',{tag:'時のずれ',t:'any',from:6,p:0.22,who:'spirit',sk:'spirit',d:0.4,
pre:'民宿の柱時計が、一斉に逆向きに回り始めた。窓の外の空が、朝と夜を何度も行き来した。|{a}が鳥居をくぐると、向こう側の景色だけ、季節が違っていた。',
ok:'{a}の前に、ひどく年老いた{a}自身が立っていた。老いた{a}は、震える指で環状列石の方角を指し、黙って首を振ると、陽炎のように消えた|{a}の手帳に、いつの間にか、{a}の字で、まだ書いた覚えのない文章が増えていた',
ng:'{a}は自分の腕時計を見た。日付が、三日先になっていた。――祭りの刻限が、近づいていた|{a}が瞬きをするあいだに、何時間かが、どこかへ消えていた',
okE:{clue:1,fear:12},ngE:{fear:20,deadline: -4},why:'門にして鍵の気配で、時間が歪んでいる'});
E('yog',{tag:'増える鳥居',t:'day',from:2,p:0.18,who:'imp',sk:'obs',d:0.45,
pre:'{a}は神社の鳥居を数えながらくぐった。行きは九本だった。',
ok:'帰りは、十本あった。{a}は、増えた一本の柱にだけ、異国の文字が刻まれていることに気づいた',
ng:'帰りは、十三本あった。最後の鳥居をくぐったとき、{a}の影だけが、向こう側に置き去りにされていた',
okE:{clue:1,fear:8},ngE:{fear:18,hp: -10},why:'鳥居は「門」の数を数えている'});
var YOG_FATE=[
{w:3,out:false,f:'別の次元へ飛ばされた',t:'{a}の体が、ほどけるように虹色の泡に変わった。泡の一つ一つに、別の人生を生きる{a}が映っていた。――{a}は、この世界のどこにもいなくなった。'},
{w:2,out:false,f:'四百年前の村へ飛ばされた',t:'{a}は気がつくと、茅葺き屋根の村の真ん中に立っていた。腰に刀を差した男たちが、{a}を指さして叫んでいる。――四百年前の、この村だった。村の古文書にあった「異装の客人」の記録を、{a}はいま、自分の身で書いていた。'},
{w:2,out:true,f:'三十年後の世界に放り出された',t:'{a}が目を開けると、村は跡形もなく、ダム湖の底に沈んでいた。国道へ這い上がると、道行く人の端末に映る日付は、三十年後だった。誰も、{a}のことを覚えていなかった。'},
{w:2,out:false,f:'村に着く前の時間に戻された',t:'{a}は、山道の入口に立っていた。向こうから、見覚えのあるマイクロバスが登ってくる。窓の中で、まだ何も知らない仲間たちと、まだ何も知らない{a}が笑っていた。――一行が村に着く、二時間前だった。{a}は、バスに向かって両手を振りながら走り出した。'},
{w:2,out:true,f:'旅に出る前日の自宅で目覚めた',t:'{a}は、自宅の布団の中で目を覚ました。カレンダーは、旅に出る前の日だった。枕元には、見覚えのない手紙が置かれていた。『あの村には行くな』――{a}自身の字だった。'},
{w:1,out:false,f:'二つの時間に引き裂かれた',dead:true,t:'{a}は、昨日の{a}と、明日の{a}に、同時に手を掴まれた。二人の{a}は、それぞれの時間へ{a}を引っぱった。――ぷつり、と何かが切れる音がした。'},
{w:1,out:false,f:'星々の彼方の門の向こうへ消えた',t:'{a}の前に、虹色に輝く球体の群れが現れた。球体はやさしく{a}を包み、時間も空間もない場所へ連れていった。{a}はそこで、宇宙のすべてを一度に見た。――戻ってくるための言葉は、もう、覚えていなかった。'}
];
SP.yog={
manifest:function(S,h){
var rng=S.rng,left=S.P.filter(function(p){return p.alive&& !p.out;});
ST.say(S,{kind:'phase',tag:'時の崩壊',text:'門が、開いた。空にひびが入り、その割れ目の向こうに、無数の時代が重なって見えた。燃える村、雪の村、まだ誰も住んでいない原生林、湖の底に沈んだ村――。時計の針がばらばらに飛び散り、昨日と明日が、同じ場所に流れ込んできた。'});
if(!left.length)return true;
var used=[];
left.forEach(function(p){
var pool=YOG_FATE.filter(function(f){return used.indexOf(f)<0||used.length>=YOG_FATE.length;});
var f=HK.weighted(rng,pool,function(x){return x.w;});used.push(f);
p.taken=false;
if(f.dead){p.alive=false;p.fate=f.f+'（'+JS.hm(h)+'）';}
else if(f.out){p.out=true;p.esc=h+rng()*2;p.fate=f.f+'（'+JS.hm(p.esc)+'）';}
else p.fate=f.f+'（'+JS.hm(h)+'）';
p.yogFlung=true;
ST.say(S,{actors:[p],tag:'時の彼方',kind:'climax',text:ST.fmt(f.t,{a:p.name}),why:'ヨグ＝ソトースの門が開き、時間と空間がほどけた（'+f.f+'）',mag:46});
});
var o=ST.say(S,{kind:'phase',tag:'時の崩壊',text:'気がつくと、'+S.V+'は、最初からそこになかったかのように消えていた。地図の上でも、誰の記憶の中でも。'});
ST.key(S,o,'門が開き、一行は時の彼方へ散った');
S.titleOverride='門にして鍵が開き、時がほどけた。一行は、'+(S.P.some(function(p){return p.out;})?'ばらばらの時代へ':'時の彼方へ')+'散っていった';
return true;
}
};
var HEIR='御影家のトキ婆さま';
E('nyarla',{tag:'落ちぶれた旧家',t:'day',from:2,p:0.3,who:'warm',sk:'talk',d:0.35,
pre:'{a}は、村はずれの荒れ果てた旧家の門をくぐった。表札には「御影」とあった。縁側に、背の曲がった老婆がひとり座っていた。',
ok:'老婆――トキは、{a}の顔をしばらく見つめてから、ぽつりぽつりと話し始めた。「＠うちは、昔は村一番の家だった。あの伝道師様が来て、村の者がみんなあれを拝むようになって……逆らったうちだけが、何もかも失った」トキは仏間の奥を指さした。「＠ご先祖さまは、一度あれを追い払ったことがある。炎の神さまの力を借りてな」|トキは{a}にお茶を出し、黄ばんだ日記の一冊を差し出した。「＠これを読める人が来るのを、ずっと待っとった。伝道師様は、炎の神さまだけは、心底嫌うとる」',
ng:'老婆は{a}を見ると、怯えたように雨戸を閉めてしまった。雨戸の向こうから、かすれた声だけが聞こえた。「＠伝道師様の回し者じゃろう。帰っとくれ」',
okE:{clue:1,flag:'house',fear:4},ngE:{fear:6},why:'伝道師のせいで落ちぶれた旧家が、追い出す手立てを知っている'});
E('nyarla',{tag:'伝道師様の取引',t:'any',from:4,p:0.24,who:'cold',sk:'lore',d:0.5,
pre:'「伝道師様」が、{a}の隣に腰を下ろした。「＠あなたの望みを、私は知っていますよ」その声は、心の一番柔らかいところを、正確に撫でてくる。「伝道師様」は、穏やかに続けた。「＠ほんの小さな代償で、叶えて差し上げましょう」',
ok:'{a}は、差し出された黒い手を握らなかった。古文書の一節が、頭の中で警鐘を鳴らしていた。――黒き男と取引する者、その魂を賭すべし。「伝道師様」は、少しだけ残念そうに笑った。「＠賢い方は、嫌いではありませんよ」',
ng:'{a}は、気づいたときには、その手を握っていた。手のひらに、焼けるような黒い紋が浮かんだ。「契約成立です」――その夜から、{a}は、誰かに見張られる夢を見るようになった',
okE:{fear:6,bonus:0.03},ngE:{fear:22,hp: -8,bonus: -0.06,flag:'deal'},why:'這い寄る混沌は、人の望みにつけこむ'});
E('nyarla',{tag:'旧家の火事',t:'night',from:10,p:0.3,who:'brave',sk:'explore',d:0.45,
need:function(S){return S.gf.house&& !S.gf.fire&& !S.gf.fireLost;},
pre:'夜半、村はずれの空が赤く染まった。御影家が、燃えていた。燃え盛る門の前で、「伝道師様」が、穏やかに手を振っていた。{a}は、炎の中へ飛び込んだ。',
ok:'{a}は煙にむせながら仏間に転がり込み、床下から炎の紋の香炉を抱えて飛び出した。トキ婆さまも、{b}が背負って連れ出していた。「伝道師様」の笑みが、ほんの一瞬だけ、消えた',
ng:'{a}が仏間にたどり着く前に、天井が崩れ落ちた。{a}は火傷を負いながら、どうにか這い出した。――香炉は、炎の中に消えた',
okE:{flag:'fire',bonus:0.08,hp: -10,fear:10},ngE:{flag:'fireLost',hp: -25,fear:16,bonus: -0.12,die:0.15,dt:'{a}は、炎の中から戻らなかった。焼け跡からは、香炉を抱いたままの{a}が見つかった。'},why:'伝道師様は、旧家の香炉に気づいている'});
SP.nyarla={
cave:function(S,live,rite){
var house=S.gf.house,lost=S.gf.fireLost;
var lead=best(live,'rite')||rite;
if(!house)return{bonus: -0.1,why:'旧家の言い伝えを知らないまま',t:lead.name+'が、手がかりから組み立てた祝詞を唱えた。炎の神を呼ぶための香炉は、手元になかった。代わりに松明を掲げた――',ngT:'松明の火は、「伝道師様」が指を鳴らすと、あっけなく消えた。「＠火遊びは、危ないですよ」',okT:'松明の火が、ひとりでに青白く燃え上がった。どこか遠い星から、何かが、その火を見つけたのだ。「伝道師様」は眉をひそめ、一歩、後ずさった。'};
ST.say(S,{actors:[lead],tag:'炎の神',kind:'climax',text:'洞窟の入口で、一行を待っていたのは'+(S.gf.fire||lost?'、焼け出されたトキ婆さまだった':'トキ婆さまだった')+'。「＠ご先祖さまの日記どおりにやりなされ。あれは、炎の神さまの火だけは、どうにもできん」'+(lost?'トキ婆さまの手には、焼け跡から掘り出した、ひびだらけの香炉があった。'+lead.name+'は、それを祠の前に据えた。':lead.name+'は、炎の紋の香炉を祠の前に据えた。'),why:'旧家（'+HEIR+'）の協力',mag:30});
return{bonus:lost? -0.05:0.15,rite:lead,why:'落ちぶれた旧家の香炉'+(lost?'（火事で失いかけた）':''),
t:lead.name+'が香炉に火を入れ、日記にある祝詞を唱えた。「＠イア、クトゥグア――フォマルハウトの炎よ、黒き男を焼き払え」香炉から噴き上がった炎が、見る間に人の背丈を超え、生き物のようにうねりながら「伝道師様」へ向かっていった――',
okT:'炎に巻かれた「伝道師様」は、燃えながら、それでも丁寧に一礼した。「＠今回は、私の負けにしておきましょう。――また、どこかでお会いしましょう」黒い男の姿は、炎とともに、村から跡形もなく消えた。トキ婆さまは、焼け跡のような顔で、静かに泣いていた。',
ngT:'炎は「伝道師様」の鼻先で、ふっと掻き消えた。「＠惜しかった。本当に、惜しかった」伝道師様は、心から楽しそうに手を叩いた。'};
}
};
E('tsathoggua',{tag:'工事現場',t:'day',from:2,p:0.28,who:'imp',sk:'explore',d:0.4,
pre:'{a}は、村はずれの林道の奥まで足を延ばした。',
ok:'藪の向こうに、途中で放り出された工事現場があった。錆びた看板、積まれた鉄骨。そして、黄色いショベルカーが一台。{a}が運転席を覗くと、鍵が差しっぱなしになっていた。――洞窟の入口を塞ぐほどの岩でも、これなら運べる',
ng:'林道は途中で崖崩れに埋まっていた。{a}は、崩れた土砂の向こうに、何か黄色い機械の腕のようなものが見えた気がしたが、たどり着けなかった',
okE:{flag:'digger',fear:2},ngE:{fear:4},why:'洞窟を岩で塞ぐには、人の手では足りない'});
E('tsathoggua',{tag:'間違った対策',t:'any',from:6,p:0.24,who:function(p){return 0.2+p.tr.impulse*1.5+p.tr.aggr*1.5-p.tr.caution;},sk:'lore',d:0.5,
pre:'{a}が言い出した。「ヒキガエルの神なら、火を嫌うはずだ。この村ごと――せめて神社の脇の家を焼けば、出てこられなくなる｜＝｜ヒキガエルの神なら、火を嫌うはずです。この村ごと――せめて神社の脇の家を焼けば、出てこられなくなります」',
ok:'{b}が、{a}の手から油の缶を取り上げた。「待って。古文書にそんな記述はない。燃やしたって、あれは眠ったままどこへでも滲み出てくる｜待て。古文書にそんな記述はない。燃やしたところで、あれは眠ったままどこへでも滲み出てくる｜待ってください。古文書にそんな記述はありません。燃やしたって、あれは眠ったままどこへでも滲み出てきます」{a}は唇を噛んだが、マッチを捨てた',
ng:'{a}は、空き家に火を放った。炎は夜空を焦がした。――焼け跡の床下から、黒い、形の定まらない泥のようなものが、ぼこぼこと湧き出してきた。ヒキガエルの神の「落とし子」たちだった。家を焼いても、何ひとつ解決しなかった。村人たちの目つきが変わった',
okE:{fear:4},ngE:{hostile:25,deadline: -4,fearAll:12,die:0.2,dt:'黒い泥が{a}の足首に絡みつき、そのまま焼け跡の床下へ、ずるずると引きずり込んだ。'},needB:true,why:'家を焼くのは、間違った対策（落とし子が湧き、村人の敵意が増す）'});
E('tsathoggua',{tag:'眠りの息',t:'night',from:4,p:0.2,who:'weak',sk:'spirit',d:0.35,
pre:'洞窟から吹き出す生ぬるい風が、民宿の中まで流れ込んできた。{a}の瞼が、ひどく重くなった。',
ok:'{a}は頬を叩いて目を覚ました。眠ってしまえば、夢の中で、あの洞窟の底へ呼ばれる気がした',
ng:'{a}は眠りに落ちた。夢の中で、{a}は洞窟の底の、毛むくじゃらの巨大なヒキガエルの前に立っていた。それは片目だけを開け、{a}を見た。――目覚めたとき、{a}の足の裏は、洞窟の泥で汚れていた',
okE:{fear:6},ngE:{fear:18,hp: -8},why:'眠れるヒキガエルさまは、眠りを通じて人を呼ぶ'});
function operator(live){
return live.filter(function(p){return alive(p)&& !p.bound;}).sort(function(a,b){
function sc(p){return p.tr.impulse*0.4+p.tr.fc*0.3+p.stats.stamina*0.06+(/^(police|civ|streamer|student|manager)$/.test(p.job)?0.15:0)-p.m.fear/300;}
return sc(b)-sc(a);
})[0];
}
SP.tsathoggua={
cave:function(S,live,rite){
var rng=S.rng,have=S.gf.digger||rng()<0.45;
if(!have){
ST.say(S,{actors:live,tag:'岩',text:'一行は洞窟の入口を塞ぐ岩を探した。手頃な岩はどれも、大人が何人がかりでも、びくともしなかった。',why:'重機を見つけられなかった（人の手だけでは岩が運べない）',mag:24});
return{bonus: -0.12,why:'岩を運ぶ重機がない'};
}
var op=operator(live);
var t=(S.gf.digger?'':'洞窟へ向かう途中、林道の奥に放り出された工事現場が見つかった。黄色いショベルカーに、鍵が差しっぱなしだった。')+op.name+'が、ショベルカーの運転席に飛び乗った。「動かし方なんて知らない。でも、やるしかない｜動かし方など知らない。だが、やるしかない｜動かし方なんて知りません。でも、やるしかありません」';
ST.say(S,{actors:[op],tag:'重機',kind:'climax',text:t,why:op.name+'がショベルカーを動かす（衝動性・行動力・体力）',mag:34});
var skillOp=clamp(0.35+op.tr.impulse*0.2+op.tr.fc*0.15+op.stats.stamina*0.04+op.stats.luck*0.03-op.m.fear/250,0.15,0.9);
var good=rng()<skillOp;
var mid=good
?'エンジンが唸りを上げた。'+op.name+'はレバーを手当たり次第に引き、何度か空振りしたあと、アームが大岩をがっちりと抱え込んだ。キャタピラが泥を跳ね上げ、ショベルカーは洞窟の入口へ這い寄っていく。洞窟の奥から、長い、ぬめった舌が伸びてきて、運転席の窓を叩いた。'+op.name+'は歯を食いしばったまま、アームを振り下ろした――'
:'エンジンは何度か咳き込み、ようやくかかった。'+op.name+'の操作で、アームはあらぬ方向に振り回され、大岩は二度、三度と転げ落ちた。洞窟の奥から伸びてきた舌が、キャタピラに絡みつく。それでも'+op.name+'は、岩を押すようにして、ショベルカーごと洞窟の入口へ突っ込んでいった――';
ST.say(S,{actors:[op],tag:'重機',kind:'climax',text:mid,why:'操作の成否 '+Math.round(skillOp*100)+'％→'+(good?'うまくいった':'もたついた'),mag:40});
if(!good&&rng()<0.18)JS.core.die(S,op,'ショベルカーごと洞窟に呑まれて',['舌が運転席の窓を突き破り、{a}を、ショベルカーごと洞窟の闇へ引きずり込んだ。']);
return{bonus:good?0.28:0.1,rite:rite===op?(live.filter(function(q){return q!==op&&alive(q);})[0]||op):rite,why:'ショベルカーで岩を運んだ'+(good?'':'（もたついた）'),
t:'{a}が洞窟の前に供物を積み上げ、ヒキガエルの神を眠らせる祝詞を唱えた。――',okT:'大岩が、洞窟の入口に、ずしんと落ちた。隙間を土砂で埋めると、洞窟の奥のいびきが、地鳴りのように遠ざかっていった。運転席から降りた'+op.name+'の膝は、まだ笑っていた。'};
}
};
var TAL={
civ:'手拍子に合わせて、故郷の民謡を歌った|声が裏返り、手拍子もずれた',
celeb:'場数を踏んだ度胸で、作法を堂々とやり切った。村人たちから、思わずため息が漏れた|いつもの余裕の笑みが、緊張で固まったまま動かなかった',
writer:'即興で、蛇の父をたたえる物語を朗々と語った|物語の途中で、言葉が詰まってしまった',
manager:'宴会で磨いた手品を披露した。袖から次々と花が出てきた|仕込んだはずの花が、袖から一度に全部こぼれ落ちた',
occult:'古い祭文を、正しい節回しで朗誦した|祭文の一節を、うっかり読み違えた',
psychic:'神おろしの舞を、目を閉じたまま舞った。舞の途中、蛇たちが一斉に頭を垂れた|舞の途中で、何かと目が合ってしまい、足がもつれた',
seer:'筮竹を鳴らし、蛇の父の行く末を、うやうやしく占ってみせた|占いの結果に、自分で顔を青くしてしまった',
prof:'腹の底から、漢詩を詩吟で吟じた|吟じるうちに、学会発表の癖が出て、解説を始めてしまった',
student:'流行りのダンスを、太鼓の拍子に乗せて踊ってみせた。村の子どもたちが、真似をして跳ねた|ステップを踏み外して、派手に尻もちをついた',
ghost:'持ってきた機材で、太鼓に合わせて光と音の演出をしてみせた|機材の電池が、肝心なところで切れた',
musician:'借りた三味線を構えるなり、一行の誰も聴いたことのない、熱のある演奏を始めた。蛇たちが、音に合わせてゆらゆらと揺れた|弦が一本、ぷつんと切れた',
police:'剣道の型を、気合とともに演じてみせた。その声は、祭りの夜に澄んで響いた|気合が強すぎて、蛇たちがびくりと身を縮めた',
folk:'この村の古式の田楽を、記録どおりに再現してみせた。村の年寄りが、目を潤ませた|記録の写し間違いで、所作が一つ足りなかった',
streamer:'配信で鍛えた軽妙なトークで、村人たちを笑わせた|渾身のギャグが、静まり返った境内に虚しく響いた',
doctor:'学生時代に合唱部で歌っていたという賛美歌を、静かに歌った|緊張で、喉がからからに渇いてしまった',
detective:'村の昔話を、推理劇に仕立てて演じてみせた|推理劇の犯人を、うっかり村長にしてしまった',
sleuth:'観客の持ち物を言い当てる、推理の妙技を披露した。拍手が起こった|言い当てた秘密が、よりによって村長の隠し事だった',
ponkotsu:'渾身の一発芸を披露した。なぜか、蛇の父の像の前だけが大受けだった|一発芸の途中で、自分の推理を語り始めてしまった',
priest:'神楽鈴を手に、厳かに神楽を舞った。鈴の音が鳴るたびに、蛇たちが静まっていった|鈴の紐がほどけ、鈴が転がっていった'
};
function perform(S,p,scene){
var rng=S.rng,tl=(TAL[p.job]||TAL.civ).split('|');
var ch=clamp(0.35+p.tr.fc*0.2+p.tr.np*0.15+(JS.skill(p,'rite')+JS.skill(p,'talk'))*0.2-p.m.fear/300+(p.job==='musician'||p.job==='celeb'||p.job==='priest'?0.15:0),0.12,0.9);
var ok=rng()<ch;
var t=p.name+'は'+(ok?tl[0]:tl[1]+'。それでも'+p.name+'は、最後までやり遂げた');
ST.say(S,{actors:[p],tag:scene,text:t+'。',why:'特技の披露（'+JS.core.jobOf(p).label+'・自由奔放さ・人あたり）：'+Math.round(ch*100)+'％→'+(ok?'蛇の父が喜んだ':'いまひとつ'),mag:ok?20:14});
return ok?1:0.3;
}
SP.yig={
tick:function(S,live,h){
if(S.gf.yigShow|| !JS.night(h)||h<6||S.rng()>0.3)return false;
S.gf.yigShow=1;
var who=live.filter(function(p){return alive(p)&& !p.bound;});
if(!who.length)return false;
ST.say(S,{kind:'phase',tag:'奉納芸',text:'宵宮の夜、村の年寄りが一行を境内に呼んだ。「＠蛇の父さまは、にぎやかなのがお好きじゃ。よそのお客人の芸を、ひとつ奉納してくれんか」境内には、無数の蛇がとぐろを巻いて、一行を見上げていた。'});
var sum=0;who.forEach(function(p){sum+=perform(S,p,'奉納芸');});
var calm=sum/who.length;S.yigCalm=calm;
if(calm>=0.6){S.deadline+=4;S.hostile=clamp(S.hostile-15,0,100);ST.say(S,{kind:'phase',tag:'奉納芸',text:'芸が終わると、境内の蛇たちは満足したように、するすると藪へ帰っていった。年寄りが目を細めた。「＠こりゃあ、蛇の父さまも、しばらくはご機嫌じゃ」',why:'芸事で蛇の父がなだめられた（刻限が延び、村人の敵意が下がった）'});}
else ST.say(S,{kind:'phase',tag:'奉納芸',text:'芸が終わっても、蛇たちは一行を見上げたまま、動かなかった。年寄りは、気まずそうに咳払いをした。',why:'芸事では、なだめきれなかった'});
return true;
},
cave:function(S,live,rite){
ST.say(S,{kind:'phase',tag:'奉納芸',text:'洞窟の奥の蛇の祠の前で、太鼓が打ち鳴らされた。蛇の父をなだめるには、一匹の蛇も傷つけず、夜通しにぎやかに祀ること。一行は太鼓の拍子に合わせて、一人ずつ、自分の特技を奉納していった。'});
var who=live.filter(function(p){return alive(p)&& !p.bound;}),sum=0;
who.forEach(function(p){sum+=perform(S,p,'奉納芸');});
var calm=(sum/Math.max(1,who.length))*0.7+(S.yigCalm||0)*0.3;
return{bonus:Math.round((calm-0.45)*40)/100,why:'特技の奉納（'+Math.round(calm*100)+'点）',t:'{a}は、最後の太鼓を夜明けまで打ち続けた――',okT:'夜明けの光が洞窟に差し込むと、祠の奥の巨大な影は、満足したように、とぐろを解いて眠りについた。'};
}
};
E('gatano',{tag:'鏡の向こう',t:'any',from:4,p:0.24,who:'spirit',sk:'spirit',d:0.4,
pre:'{a}は、山の社に祀られた銅鏡の前に立った。鏡には、{a}の背後に、山そのもののように巨大な影が映っていた。鏡の奥から、声とも地響きともつかないものが、{a}の頭の中に直接流れ込んできた。',
ok:'{a}は、決して振り返らなかった。鏡越しに、その声に耳を澄ませた。――声は、太古に自分と争った「海の底の神の末子」を、ひどく憎んでいた|{a}は鏡から目を逸らさず、呼びかけに答えた。鏡の中の影が、ほんのわずかに頷いた気がした',
ng:'{a}は、背後の気配に耐えきれず、肩越しに振り返ろうとした。首筋から、皮膚が灰色に固まり始めた。{b}が、慌てて{a}の目を手で覆った|{a}は鏡の奥の影と、目が合ってしまった。{a}の指先が、石のように冷たく、硬くなった',
okE:{clue:1,fear:12},ngE:{fear:22,hp: -18,die:0.15,dt:'{a}の体は、振り返りかけた姿勢のまま、灰色の石に変わっていった。'},why:'山神さまとは、社の鏡越しにしか話せない（直に見ると石になる）'});
var CULT='黒い法衣の一団';
SP.gatano={
tick:function(S,live,h){
var rng=S.rng,w=S.gw=S.gw||{st:0};
if(w.st===0){
if(h<8||rng()>0.22)return false;
w.st=1;w.h=h;
live.forEach(function(p){p.m.fear=clamp(p.m.fear+8,0,100);});
var o=ST.say(S,{kind:'climax',tag:'闖入者',text:'昼下がり、村の入口に、'+CULT+'が現れた。先頭の男が、海の匂いのする杖を掲げて叫んだ。「＠海の底に眠るイソグサの名において！　山の偽りの神を、我らが打ち倒す！」村人たちは、鍬や鎌を手に、山の社へ続く石段の前に集まった。睨み合う二つの群れのあいだに、一行は立ちすくんでいた。',why:'ガタノトーアを崇める村と、イソグサを奉じる教団は、太古から対立している',mag:36});
ST.key(S,o,'イソグサの教団が村に踏み込んだ');
return true;
}
if(w.st===1&&h-w.h>=2){
w.st=2;w.h=h;
ST.say(S,{kind:'phase',tag:'宗教戦争',text:'夜明け前、戦いが始まった。教団の祈祷の声と、村の祭り囃子が、山にこだました。松明が投げ込まれ、民家が燃え、教団の信徒が石段から転げ落ち、村人が杖で殴り倒された。どちらの側にも、人の目をした者は、もう一人もいなかった。'});
var vs=live.filter(function(p){return alive(p)&& !p.bound;});
var a=GD.pickWho(S,'alone',vs);
if(a){
var esc=rng()<clamp(0.3+JS.skill(a,'explore')*0.4+a.stats.luck*0.04,0.15,0.85);
if(esc)ST.say(S,{actors:[a],tag:'宗教戦争',text:a.name+'は、両陣営の投石と松明のあいだを、頭を抱えて駆け抜けた。どうにか民宿の床下に転がり込み、息を殺した。',why:'戦いに巻き込まれたが、探索の力と運で逃れた',mag:22});
else if(rng()<0.35)JS.core.die(S,a,'宗教戦争に巻き込まれて',['教団の信徒と村人の振り回す得物が、{a}の上で交差した。{a}は、どちらの神の名も知らないまま、石段に倒れた。']);
else{a.m.hp=clamp(a.m.hp-25,0,100);a.m.fear=clamp(a.m.fear+15,0,100);ST.say(S,{actors:[a],tag:'宗教戦争',text:a.name+'は流れ弾の投石を頭に受け、血を流しながら物陰に倒れ込んだ。',why:'戦いに巻き込まれて負傷',mag:26});}
}
var sn=best(vs,'lore',function(q){return q!==a;});
if(sn&&rng()<0.55){var ct=GD.giveClue(S,sn);if(ct)ST.say(S,{actors:[sn],tag:'宗教戦争',text:sn.name+'は、戦いで空になった村長の屋敷に忍び込み、古文書の蔵をあさった'+ct,why:'戦いの混乱に乗じて調べた',mag:20});}
return true;
}
if(w.st===2&&h-w.h>=2){
w.st=3;
var r=rng();
if(r<0.4){S.hostile=clamp(S.hostile+15,0,100);ST.say(S,{kind:'phase',tag:'宗教戦争',text:'戦いは、村の勝ちに終わった。教団の信徒たちは縛り上げられ、山の社の鏡の前に並べられた。翌朝、そこには、恐怖の表情を浮かべた石像が並んでいた。勝ち誇った村人たちは、その目を、そのまま一行へ向けた。',why:'村が勝った（村人の敵意が増した）'});}
else if(r<0.75){S.deadline=Math.max(S.h+4,S.deadline-6);S.hostile=clamp(S.hostile-25,0,100);ST.say(S,{kind:'phase',tag:'宗教戦争',text:'戦いは、教団の勝ちに終わった。教団の祭司は山の社に駆け上がり、銅鏡に向かって、海の底の神を讃える呪文を叫び続けた。鏡に、蜘蛛の巣のようなひびが走った。――山が、低く唸った。鏡の向こうの神は、怒っていた。',why:'教団が勝った（村人は減ったが、神の目覚めが早まった）'});}
else{S.hostile=clamp(S.hostile-35,0,100);S.deadline=Math.max(S.h+4,S.deadline-2);ST.say(S,{kind:'phase',tag:'宗教戦争',text:'夜が明けると、村も教団も、ほとんど誰も立っていなかった。石段には、どちらの神の名も呼べなくなった者たちが、折り重なっていた。生き残った村人は、もう一行に構う余裕もなかった。',why:'共倒れ（村人の敵意が大きく下がった）'});}
return true;
}
return false;
}
};
var BY_NAMES=['久我 透','真壁 慎一','雨宮 澄','御子柴 恒','桐生 遥','佐伯 湊'];
var JW={
civ:'民宿の帳場に、見慣れない男が立っていた。「＠今日から手伝いに来ました、{n}です」その男の笑い方は、なぜか{x}にそっくりだった',
celeb:'村の公民館に、{x}そっくりの身なりの人が来ていた。「\u2060{n}です」と名乗るその人は、{x}の口癖まで真似て、村人たちに囲まれていた',
writer:'民宿の一室で、見知らぬ作家が原稿を書いていた。「{n}と申します」――原稿の文体は、{x}のものと見分けがつかなかった',
manager:'一行の荷物を、見知らぬ男がてきぱきと整理していた。「＠マネージャーの{n}です。皆さんのことは、よく存じています」',
occult:'村の図書室に、見知らぬオカルト研究家がいた。「{n}といいます」彼が読んでいるのは、{x}がこの村で書き溜めていた覚え書きだった',
psychic:'村の辻に、見知らぬ霊能者が座り、村人の悩みを聞いていた。「{n}と申します」その目は、{x}と同じように、何もない宙を見ていた',
seer:'民宿の軒先で、見知らぬ占い師が店を広げていた。「＠{n}です。あなたの行く末、占いましょうか」並べられたカードは、{x}のものだった',
prof:'公民館で、見知らぬ教授が村人相手に講義をしていた。「{n}です」――講義の内容は、{x}が昨日話していたことと、一言一句同じだった',
student:'村の分校に、見知らぬ転校生が来ていた。「{n}です」――その鞄には、{x}のキーホルダーがぶら下がっていた',
ghost:'砦の跡で、見知らぬ心霊研究家が機材を据えていた。「{n}です」機材のテープには、{x}の字で名前が書かれていた',
musician:'村の神社で、見知らぬ楽士が祭り囃子の稽古をつけていた。「{n}です」その演奏の癖は、{x}そのものだった',
police:'駐在所に、見慣れない警察官が座っていた。「本日付で着任した{n}です」――その制服の胸には、{x}の警察手帳が差さっていた',
folk:'村の資料館に、見知らぬ民俗学者がいた。「＠{n}といいます。この村の調査を、引き継ぎまして」',
streamer:'村の広場で、見知らぬ若者がスマートフォンに向かって喋っていた。「＠どうも、{n}です！　今日は、ある村から生配信！」――配信画面のチャンネル名は、{x}のものだった',
doctor:'村の診療所に、見慣れない医師が座っていた。白衣の名札には「{n}」とあった。患者を診るその手つきは、{x}そっくりだった',
detective:'民宿の一室に、見知らぬ探偵が陣取っていた。「＠{n}です。この村の失踪事件を調べています」――その手帳には、{x}の字で、一行の名前が並んでいた',
sleuth:'民宿の食堂で、見知らぬ名探偵が村人たちを前に推理を披露していた。「{n}と申します」――その推理の組み立て方は、{x}と寸分違わなかった',
ponkotsu:'村の広場で、見知らぬ自称名探偵が、的外れな推理をまくしたてていた。「＠名探偵の{n}だ！」――その口癖は、{x}のものだった',
priest:'村の神社に、見知らぬ神職が来ていた。「＠新しく奉職いたしました、{n}です」――祝詞の節回しは、{x}と同じだった'
};
SP.byatis={
tick:function(S,live,h){
var rng=S.rng,I=S.byImp,vs=live.filter(function(p){return alive(p)&& !p.bound;});
if(!vs.length)return false;
if(I&& !I.rev&&rng()<0.35){
I.seen++;
var sh=best(vs,'obs'),ch=clamp(0.1+JS.skill(sh,'obs')*0.35+I.seen*0.12,0.05,0.8);
var t=ST.fmt(JW[I.job]||JW.civ,{n:I.nm,x:I.vic.name});
if(rng()<ch){
I.rev=true;
var ct=GD.giveClue(S,sh);
var o=ST.say(S,{actors:[sh],tag:'成り代わり',kind:'climax',text:t+'。――'+sh.name+'は、その人物の口元から、蛇のような細い髭が一本、ちろりと覗いたのを見逃さなかった。「あなた、人間じゃない｜あなたは、人間ではない｜あなた、人間じゃありませんね」{n}は、顔の真ん中にひとつだけの目を開いて笑い、砦の方角へ、人とは思えない速さで去っていった。'.replace('{n}',I.nm)+ct,why:sh.name+'が、'+I.vic.name+'の仕事を始めた見知らぬ人物の正体を見抜いた（観察）',mag:40});
ST.key(S,o,'成り代わった神の正体が露見');
S.gBonus=(S.gBonus||0)+0.08;
}else ST.say(S,{actors:[],tag:'成り代わり',text:t+'。一行の誰も、それを不思議だとは思わなかった。',why:'封印を解いた'+I.vic.name+'を石に変えたあと、神は別人の姿に化け、'+I.vic.name+'の仕事（'+JS.core.jobOf(I.vic).label+'）を始めた',mag:24});
return true;
}
if(I|| !JS.night(h)||rng()>0.4)return false;
var p=HK.weighted(rng,vs,function(q){return 0.3+q.tr.impulse+(1-q.tr.cp)+q.m.fear/60+(q.byT||0);});
var res=clamp(0.4+p.tr.cp*0.3+p.tr.caution*0.2-p.tr.impulse*0.2-p.m.fear/300-(p.byT||0)*0.1,0.1,0.85);
if(rng()<res){ST.sayB(S,{actors:[p],tag:'夢の誘惑',text:p.name+'は夢の中で、一つ目の何かに囁かれた。「＠扉を開けておくれ。お前の望みを、すべて叶えてやろう」――'+p.name+'は、夢の中で耳を塞ぎ、朝まで目を開けていた。',why:'夢の誘惑に耐えた（CP・慎重さ）'},p.name+'は夢の誘惑に耐えた');return true;}
p.byT=(p.byT||0)+1;
if(p.byT<2){p.m.fear=clamp(p.m.fear+10,0,100);ST.say(S,{actors:[p],tag:'夢の誘惑',text:p.name+'は夢の中で、砦の地下の石の扉の前に立っていた。扉の向こうから、ひどく優しい声がした。「＠開けておくれ。お前だけが、わたしを分かってくれる」――目覚めたとき、'+p.name+'は、なぜか泣いていた。封印の扉を開けたくて、たまらなかった。',why:'バイアティスの夢の誘惑に負けかけている（もう一度負けると、夢遊のまま封印を解きに行く）',mag:22});return true;}
var guard=vs.filter(function(q){return q!==p&&JS.REL.near(S,p,q);}).sort(function(a,b){return JS.skill(b,'obs')-JS.skill(a,'obs');})[0];
var stop=(guard?0.35+JS.skill(guard,'obs')*0.3:0)+(S.hostile>30?0.2:0.1);
var go=p.name+'は真夜中、裸足のまま民宿を抜け出し、森の砦へ向かった。目は開いているのに、何も見ていなかった。';
if(rng()<stop){
p.byT=1;
ST.say(S,{actors:guard?[p,guard]:[p],tag:'封印',text:go+(guard?guard.name+'が後を追い、地下牢の階段の手前で'+p.name+'を羽交い締めにした。':'地下牢の前では、見張りの村人たちが'+p.name+'を取り押さえた。「＠夢で呼ばれたんじゃな。よそ者は、すぐこれじゃ」')+'――'+p.name+'は、はっと我に返った。',why:'封印を解きに行くのを止められた',mag:30});
return true;
}
S.byImp={job:p.job,vic:p,nm:rng.pick(BY_NAMES),seen:0,rev:false};
S.deadline=Math.max(S.h+4,S.deadline-6);S.hostile=clamp(S.hostile+15,0,100);
JS.core.die(S,p,'封印を解いて',['見張りの村人がうたた寝をしていた隙に、{a}は石の扉の封印の紋を、自分の指で擦り消した。扉が、内側から開いた。闇の中から、ひとつだけの巨大な目が、{a}を見下ろした。「＠ありがとう」――{a}の足先から、灰色の石が這い上がっていった。{a}は、扉を開けた姿勢のまま、石像になった。'],go);
p.fate='封印を解き、石にされた（'+JS.hm(h)+'）';
ST.say(S,{kind:'phase',tag:'封印',text:'翌朝、砦の地下牢で、石になった'+p.name+'が見つかった。見張りの村人たちは、真っ青な顔で口々に言った。「＠封が解けた。あの方は、もう人の姿で、村のどこかにおる」',why:'封印が解かれた（刻限が早まり、村人の敵意が増した）'});
return true;
},
cave:function(S,live){
var I=S.byImp;
if(!I)return{};
if(I.rev)return{bonus:0.05,why:'成り代わった神の正体を知っていた'};
var vs=live.filter(function(p){return alive(p);}),a=vs[S.rng()*vs.length|0];
ST.say(S,{actors:a?[a]:[],tag:'成り代わり',kind:'climax',text:'地下牢へ降りる一行の後ろに、いつの間にか'+I.nm+'がついてきていた。'+I.vic.name+'の仕事を引き継いだはずの、あの人物だった。'+I.nm+'の顔が、ゆっくりと裂け、ひとつだけの巨大な目が開いた。',why:'成り代わった神の正体に、最後まで気づけなかった（不利）',mag:40});
return{bonus: -0.12,why:'成り代わった神が紛れていた'};
}
};
})();
});
;
/* ==== js/jashin-godev-sp-b.js ==== */
HK.Load.def(353,'js/jashin-godev-sp-b.js',function(){
(function(){
'use strict';
var HK=window.HK,ST=HK.Story,JS=HK.JASHIN,clamp=HK.clamp,GD=JS&&JS.GODEV;
if(!ST|| !JS|| !GD)return;
var SP=GD.SP;
function alive(p){return JS.alive(p);}
function free(live){return live.filter(function(p){return alive(p)&& !p.bound;});}
function best(live,type,f){return free(live).filter(function(p){return!f||f(p);}).sort(function(a,b){return JS.skill(b,type)-JS.skill(a,type);})[0];}
function L(s){return s.split('|');}
var ITH_SIGN=L('雪の上を歩いて戻ってきた{a}の後ろには、足跡がひとつも残っていなかった。|{b}が{a}の手に触れて、思わず手を引っ込めた。{a}の手は、氷のように冷たかった。|{a}は、出された温かい汁物に手をつけず、窓の外の吹雪を、じっと見つめていた。|夜中、{a}の布団は空だった。外の雪の上に、人のものとは思えない大きな足跡が、峠へ向かって続いていた。朝、{a}は何食わぬ顔で、囲炉裏の前に座っていた。|{a}の吐く息だけが、部屋の中でも白かった。');
SP.ithaqua={
tick:function(S,live,h){
var rng=S.rng,I=S.ith,vs=free(live);
if(!I){
if(!JS.night(h)||h<6||vs.length<2||rng()>0.26)return false;
var v=HK.weighted(rng,vs,function(p){return 0.4+(p.action.id==='alone'?2:0)+(6-p.stats.stamina)*0.15;});
v.alive=false;v.ithFake=true;v.fate='風の眷属に殺され、成り代わられた（'+JS.hm(h)+'）';v.how='風の眷属に殺されて';
S.ith={v:v,h:h,seen:0,rev:false};
ST.say(S,{actors:[v],tag:'吹雪の夜',text:'吹雪の夜、'+v.name+'は外の様子を見に出たきり、なかなか戻らなかった。明け方、'+v.name+'は雪まみれで戻ってきた。「平気だよ。少し道に迷っただけだよ｜平気だ。少し道に迷っただけだ｜平気です。少し道に迷っただけですよ」――'+v.name+'は、そう言って笑った。',why:'吹雪の中で、何かがあったらしい',mag:18});
return true;
}
if(I.rev||rng()>0.4)return false;
I.seen++;
var b=vs[rng()*vs.length|0];
var sh=best(vs,'obs'),ch=sh?clamp(0.08+JS.skill(sh,'obs')*0.3+I.seen*0.12+(sh.job==='psychic'?0.15:0),0.05,0.85):0;
var t=ST.fmt(ST.pick(S,ITH_SIGN),{a:I.v.name,b:b?b.name:'仲間'});
if(!sh||rng()>ch){ST.say(S,{actors:b?[b]:[],tag:'違和感',text:t,why:'……'+I.v.name+'の様子がおかしい',mag:18});return true;}
reveal(S,sh,vs,t);
return true;
},
cave:function(S,live){
var I=S.ith;
if(!I||I.rev)return I?{bonus:0.04,why:'風の眷属を見破っていた'}:{};
I.rev=true;
var vs=free(live),a=vs[S.rng()*vs.length|0];
ST.say(S,{kind:'climax',tag:'成り代わり',text:'峠の祠へ向かう途中、'+I.v.name+'が、ふいに足を止めた。振り向いたその顔は、霜に覆われ、目だけが青白く燃えていた。「＠――寒いだろう。お前たちも、風になれ」'+I.v.name+'の姿をしていたものは、吹雪の中へ跳び上がり、一行の頭上を旋回し始めた。',why:I.v.name+'は、とうに風の眷属に殺され、成り代わられていた（最後まで気づけなかった）',mag:46});
if(a&&S.rng()<0.4)JS.core.die(S,a,'風の眷属に襲われて',['吹雪の中から伸びた爪が{a}を掴み上げ、空の高みへ連れ去った。しばらくして、遠くの雪原に、何かが落ちる音がした。']);
JS.REL.onDeath(S,I.v);
return{bonus: -0.12,why:'風の眷属が紛れていた'};
},
end:function(S){
var I=S.ith;
if(I&& !I.rev)ST.say(S,{kind:'phase',tag:'雪解け',text:'春になって、峠の雪の中から、ひとりの遺体が見つかった。'+I.v.name+'だった。死んでから、ずいぶん日が経っていた。――では、あの村で一行と一緒にいた'+I.v.name+'は、誰だったのか。',why:I.v.name+'は、吹雪の夜に風の眷属に殺され、成り代わられていた'});
}
};
function reveal(S,sh,vs,sign){
var I=S.ith;I.rev=true;
var ct=GD.giveClue(S,sh);
var o=ST.say(S,{actors:[sh],tag:'成り代わり',kind:'climax',text:sign+'――'+sh.name+'は、気づいてしまった。「あなた……'+I.v.name+'じゃない｜あなた……'+I.v.name+'ではない｜あなた……'+I.v.name+'ではありませんね」'+I.v.name+'の姿をしたものの顔に、霜の亀裂が走った。それは人の声ではない声で笑い、窓を突き破って、吹雪の中へ消えた。'+ct,why:sh.name+'が、成り代わりを見抜いた（観察'+(sh.job==='psychic'?'・霊感':'')+'）',mag:44});
ST.key(S,o,I.v.name+'は成り代わられていた');
ST.say(S,{actors:[I.v],tag:'雪の中',text:'峠の雪の中から、本物の'+I.v.name+'が見つかった。凍りついたその顔は、最後まで誰かを呼んでいるようだった。',why:I.v.name+'は、吹雪の夜にすでに殺されていた',mag:36});
S.gBonus=(S.gBonus||0)+0.06;
JS.REL.onDeath(S,I.v);
}
SP.glaaki={
tick:function(S,live,h){
var rng=S.rng,vs=free(live),night=JS.night(h);
var sp=vs.filter(function(p){return p.spine!=null;});
for(var i=0;i<sp.length;i++){
var p=sp[i],cur=vs.filter(function(q){return q!==p&&q.spine==null&&(q.job==='doctor'||q.job==='priest'||q.job==='occult'||q.magic);})[0];
if(cur&&h-p.spine<=4&&rng()<0.45){
var ok=rng()<0.4+JS.skill(cur,'rite')*0.3+(cur.job==='doctor'?0.15:0);
p.spine=ok?null:p.spine;
p.m.hp=clamp(p.m.hp-25,0,100);
ST.say(S,{actors:[cur,p],tag:'棘',text:cur.name+'は、'+p.name+'の胸の傷口に指を差し入れ、中に残った棘の欠片を探った。'+(ok?'細く黒い棘が、ずるりと抜けた。棘は床の上で、しばらく虫のように蠢いていた。'+p.name+'の胸から、ようやく赤い血が流れ出した。――'+p.name+'は、生きている人間に戻った。':'棘は、もう'+p.name+'の心臓に根を張っていた。'+cur.name+'の指先に、冷たい脈が触れた。それは、'+p.name+'の脈ではなかった。'),why:ok?cur.name+'が、刺さった棘を抜いた（従者にならずに済んだ）':'棘を抜けなかった',mag:34});
return true;
}
if(!night&&h-p.spine>=4&&rng()<0.35+(h-p.spine)*0.03){
JS.core.die(S,p,'緑の崩壊で',['朝日が、{a}の頬に差した。{a}の肌が、見る間に緑色に変わり始めた。指先が、苔むした石のように崩れ、髪が緑の粉になって舞い落ちた。{a}は何か言おうとして口を開いた。その口も、崩れた。――陽の当たる縁側に、緑色の粉の山だけが残った。']);
p.fate='湖の主の従者となり、緑の崩壊で崩れ落ちた（'+JS.hm(h)+'）';
return true;
}
if(night&&rng()<0.3){
p.m.fear=clamp(p.m.fear+6,0,100);
ST.sayB(S,{actors:[p],tag:'従者',text:p.name+'は夜中にふらりと起き上がり、湖の方へ歩いていこうとした。その胸の傷からは、一滴の血も流れていなかった。仲間が引き止めると、'+p.name+'は、ひどく穏やかな声で言った。「呼ばれてるんだ。行かなきゃ｜呼ばれているんだ。行かなければ｜呼ばれているんです。行かなければなりません」',why:'棘に刺された者は、湖の主の従者になる'},p.name+'が湖へ向かおうとした');
return true;
}
}
if(night&&h>=4&&(S.gf.spine||0)<(S.P.length>=5?2:1)&&rng()<0.22){
var a=GD.pickWho(S,'alone',vs);if(!a||a.spine!=null)return false;
S.gf.spine=(S.gf.spine||0)+1;
var helper=vs.filter(function(q){return q!==a&&JS.REL.near(S,a,q);})[0];
var res=clamp(0.2+a.stats.stamina*0.04+a.stats.luck*0.03+a.tr.caution*0.15+(helper?0.2:0),0.1,0.8);
var pre='夜の湖のほとりで、'+a.name+'の背後の水面が、音もなく盛り上がった。月明かりの中に、巨大な楕円の体と、全身に生えた無数の金属の棘が浮かび上がった。一本の棘が、ひゅっと伸びた――';
if(S.rng()<res){a.m.fear=clamp(a.m.fear+18,0,100);ST.say(S,{actors:helper?[a,helper]:[a],tag:'棘',text:pre+(helper?helper.name+'が'+a.name+'を突き飛ばした。棘は、'+a.name+'のいた場所の砂を深々と抉った。':a.name+'は、とっさに砂浜に身を投げた。棘は頬をかすめ、背後の木の幹を貫いた。'),why:'湖の主の棘をかわした（体力・運・慎重さ'+(helper?'・'+helper.name+'の助け':'')+'）',mag:30});return true;}
a.spine=h;a.m.fear=clamp(a.m.fear+25,0,100);
var o=ST.say(S,{actors:[a],tag:'棘',kind:'climax',text:pre+'棘は、'+a.name+'の胸を貫いた。'+a.name+'は砂浜に倒れた。――そして、起き上がった。胸に開いた穴からは、一滴の血も流れていなかった。棘はするりと抜け、湖の底へ戻っていった。'+a.name+'の胸の中に、細い枝のようなものを残して。',why:'湖の主の棘に刺された者は、死んだまま動く従者になる。早く棘を抜かないと、陽の光で「緑の崩壊」が始まる',mag:42});
ST.key(S,o,a.name+'が湖の主の棘に刺された');
return true;
}
return false;
}
};
var PART=['左腕','右足','脇腹','右手の指','左の耳','膝'];
SP.mekura={
tick:function(S,live,h){
var rng=S.rng,vs=free(live);
if(!S.gf.heal&&h>=4&&rng()<0.3){
var a=vs.filter(function(p){return p.m.hp<70;}).sort(function(x,y){return x.m.hp-y.m.hp;})[0]||(rng()<0.4?vs[rng()*vs.length|0]:null);
if(!a)return false;
var b=vs.filter(function(q){return q!==a;}).sort(function(x,y){return JS.REL.bond(S,y,a)-JS.REL.bond(S,x,a);})[0];
if(!b)return false;
S.gf.heal=1;
var part=rng.pick(PART);
a.m.hp=clamp(a.m.hp+30,0,100);b.m.hp=clamp(b.m.hp-20,0,100);b.m.fear=clamp(b.m.fear+20,0,100);b.rot=part;
var ct=GD.giveClue(S,b);
var o=ST.say(S,{actors:[a,b],tag:'厄介払い',kind:'climax',text:'寺の住職が、'+a.name+'の'+part+'の傷に、黒い薬湯を塗ってくれた。「薬師さまのご利益です」傷は、見る間に跡形もなく消えた。――その夜、'+b.name+'が悲鳴を上げた。'+b.name+'の'+part+'が、黒く変色し、甘い腐臭を放っていた。住職は、穏やかに手を合わせた。「＠厄介払いでございます。いちばん縁の深いお方が、代わりに厄を引き受けてくださる」'+ct,why:'目洗い薬師は、治した部位の代わりに、祈った者に縁の深い誰かの同じ部位を腐らせる（'+a.name+'といちばん縁が深いのは'+b.name+'）',mag:40});
ST.key(S,o,b.name+'の'+part+'が腐り始めた');
return true;
}
if(S.gf.heal&& !S.gf.rot2){
var r=vs.filter(function(p){return p.rot;})[0];
if(r&&rng()<0.3){S.gf.rot2=1;r.m.hp=clamp(r.m.hp-15,0,100);ST.say(S,{actors:[r],tag:'厄介払い',text:r.name+'の'+r.rot+'の黒ずみは、少しずつ広がっていた。包帯を替えるたびに、何かが、ぽろりと落ちた。',why:'厄は、少しずつ腐り落ちていく（封じれば止まる）',mag:24});return true;}
}
if(!S.gf.bride&&JS.night(h)&&h>=8&&rng()<0.24){
S.gf.bride=1;
var v=GD.pickWho(S,function(p){return(p.gender==='f'?2:1)*(p.action.id==='alone'?2:1);},vs);if(!v)return false;
var hp=vs.filter(function(q){return q!==v&&JS.REL.near(S,v,q);}).sort(function(x,y){return JS.skill(y,'fight')-JS.skill(x,'fight');})[0];
var pre='夜更け、寺の鐘が鳴った。白無垢の女たちが、目隠しをしたまま、すり足で民宿に入ってきた。女たちは迷わず'+v.name+'の布団を囲んだ。「＠お迎えにあがりました。薬師さまの、お嫁さま」';
if(hp&&rng()<0.35+JS.skill(hp,'fight')*0.4){v.m.fear=clamp(v.m.fear+20,0,100);ST.say(S,{actors:[v,hp],tag:'薬師さまの嫁',text:pre+hp.name+'が跳ね起き、女たちを振り払って、'+v.name+'を部屋の外へ引きずり出した。女たちは、見えないはずの目で、じっと二人の背中を見送った。「＠また、お迎えにあがります」',why:hp.name+'が、'+v.name+'が連れ去られるのを防いだ',mag:34});return true;}
v.taken=true;v.takenAt=h;v.blind=true;
var o2=ST.say(S,{actors:[v],tag:'薬師さまの嫁',kind:'climax',text:pre+'冷たい手が、'+v.name+'の口と手足を押さえた。'+v.name+'は、寺の裏の小屋へ連れていかれた。明け方、小屋から、婚礼の唄が聞こえてきた。――唄の合間に、一度だけ、'+v.name+'の悲鳴が混じった。',why:'両目を潰された者が「薬師さまの嫁」にされる（連れ去られた。対抗策を実行できれば助け出せるが、目は戻らない）',mag:44});
ST.key(S,o2,v.name+'が薬師さまの嫁にされた');
return true;
}
return false;
},
end:function(S){
S.P.forEach(function(p){
if(p.blind&&p.fate&& !/両目/.test(p.fate))p.fate+='・両目を失った';
if(p.rot&&p.alive&&S.result==='sealed')p.notes.push(p.rot+'の腐れは、封印とともに止まった');
});
}
};
var AGE=[
'{a}の髪に、白いものが一気に混じった。目尻と口元に、深い皺が刻まれた。鏡を見た{a}は、しばらく声が出なかった。',
'{a}の背中が、目に見えて曲がった。指の関節が節くれ立ち、歯が一本、ぽろりと抜け落ちた。{a}の手を握った仲間は、その軽さに息を呑んだ。'
];
SP.quachil={
tick:function(S,live,h){
var rng=S.rng,vs=free(live);
if(rng()>(JS.night(h)?0.3:0.16)||h<4)return false;
var a=GD.pickWho(S,function(p){return(p.action.id==='alone'?2:1)*(1+(p.age||0)*0.8);},vs);if(!a)return false;
var pre=ST.pick(S,L('空き地の上に、光の柱が下りてきた。その中から、枯れ枝のような指が伸び、{a}の肩に触れた。|夜道で、{a}は小さな骸骨のような影とすれ違った。影の指先が、{a}の手の甲を、そっとなでていった。|{a}の部屋の柱時計の針が、狂ったように回り始めた。誰かが、{a}の背中に触れた。'));
pre=ST.fmt(pre,{a:a.name});
var dodge=clamp(0.25+JS.skill(a,'obs')*0.3+a.stats.luck*0.03,0.1,0.7);
if(rng()<dodge){a.m.fear=clamp(a.m.fear+10,0,100);ST.say(S,{actors:[a],tag:'老い',text:pre.replace(/触れた。|なでていった。|触れた。$/,'触れかけた――')+a.name+'は、とっさに身を引いた。触れられかけた袖口だけが、百年経った布のように、ぼろぼろに崩れた。',why:'塵を踏むものに触れられる寸前で逃れた（観察・運）',mag:26});return true;}
a.age=(a.age||0)+1;
if(a.age>=3){JS.core.die(S,a,'塵を踏むものに触れられて',['{a}の体は、もう、それ以上老いることができなかった。{a}は、仲間の腕の中で、乾いた音を立てて塵になった。風が吹くと、{a}だった塵は、空き地の灰色の塵に混じって、見分けがつかなくなった。'],pre);a.fate='老い果てて塵になった（'+JS.hm(h)+'）';return true;}
a.m.hp=clamp(a.m.hp-18,0,100);a.m.fear=clamp(a.m.fear+18,0,100);a.stats.stamina=Math.max(1,a.stats.stamina-1);
var o=ST.say(S,{actors:[a],tag:'老い',kind:'climax',text:pre+ST.fmt(AGE[a.age-1],{a:a.name}),why:'塵を踏むものに触れられた者は、一瞬で何十年も老いる（'+a.age+'度目。三度目には塵になる）',mag:36});
if(a.age===1)ST.key(S,o,a.name+'が一瞬で老いた');
return true;
},
end:function(S){S.P.forEach(function(p){if(p.age)p.notes.push('塵を踏むものに触れられ、'+(p.age*30)+'年ほど老いた');});}
};
function F(id,traps,horror){
var fx=JS.FX[id];if(!fx)return;
if(traps)fx.traps=traps.split('|').map(function(t){var k=t.split('／');return{set:k[0],die:k[1]};});
if(horror)fx.horror=fx.horror.concat(horror.split('|'));
}
F('gatano',
'{a}は、山の社の銅鏡を磨いていた村人に「＠よそ者は鏡を見るでない」と止められたが、つい覗き込んでしまった。鏡の中の山が、動いた／{a}の体は、鏡を覗いた姿勢のまま、灰色の石に変わっていった。最後まで動いていたのは、恐怖に揺れる瞳だった|{a}が神社の奥の布をめくると、山の神を描いた絵があった。絵の中の山は、鏡に映した姿で描かれていた／絵を見た瞬間、{a}の指先から、皮膚が乾いた石のように硬くなっていった。それは心臓まで届いた|{a}は霧の晴れた朝、民宿の板戸の節穴から、山の社の方を覗いてしまった。社の鏡が、朝日を跳ね返して{a}の目を射た／村人たちが駆けつけたとき、{a}は板戸の前で、石像になっていた',
'村人の一人が、山の社の鏡に向かって、ひれ伏したまま何時間も話し込んでいた。返事は、鏡の向こうからしか来ないらしかった。');
F('chaugnar',null,
'村人たちが、寺の裏で輪になって、聞いたことのない言葉の歌を歌っていた。その輪の中心の鍋から、甘い肉の匂いがした。――一行の誰も、その鍋の中身を確かめる勇気はなかった。|小柄な村人が、{a}の手首を、値踏みするように指でつまんだ。そして、仲間の村人に向かって、聞き慣れない言葉で何か言い、くすくすと笑った。|村の子どもだと思っていた小さな人影が振り向くと、皺だらけの老人の顔をしていた。その歯は、すべて鋭く尖らせてあった。');
})();
});
;
/* ==== js/jashin-place-lines.js ==== */
HK.Load.def(354,'js/jashin-place-lines.js',function(){
(function(){
'use strict';
var HK=window.HK,JS=HK&&HK.JASHIN,V=HK&&HK.Voice;
if(!JS)return;
var T=JS.PLACE_LINES={
LOVE_VOW:{
base:'{b}。終わったら、一緒に帰ろう。約束する',
proud:'{b}、私から離れるな。……帰ったら、続きだ。約束だぞ',
stern:'{b}。必ず二人で帰る。それ以外の結末は認めない',
tsun:'べ、別に心配なんかしてない。……でも、勝手に死んだら許さないから',
gentle:'{b}、大丈夫。終わったら、一緒にあったかいものを食べに行こうね',
devoted:'{b}さんは、私が守ります。……だから、最後まで隣にいさせてください',
cool:'{b}。生きて帰る確率を上げるなら、離れないことだ。……それと、好きだ',
free:'{b}、終わったらさ、海行こ。こんな暗い村じゃなくて、明るいとこ',
shy:'{b}……手、握ってていい？　こ、怖いんじゃなくて……離れたくないから',
polite:'{b}さん。すべて終わったら、一緒に帰りましょう。約束ですよ'
},
BOND_VOW:{
base:'{b}、絶対に一緒に帰る。置いていかない',
proud:'{b}、ぼさっとすんな。お前を置いて帰る気はねえからな',
stern:'{b}。最後まで私の後ろを離れるな。必ず連れて帰る',
tsun:'{b}、足引っ張らないでよね。……置いてくつもりなんて、ないけど',
gentle:'{b}、手、貸して。一緒に帰ろう。ここまで来たんだから',
devoted:'{b}さんだけは、必ず帰します。私がどうなっても',
cool:'{b}、私の三歩後ろを歩け。そこがいちばん安全だ',
free:'{b}、帰ったら打ち上げね。私のおごりで。だから死なないで',
shy:'{b}……い、一緒に帰ろうね。ひとりは、やだから',
polite:'{b}さん、必ず一緒に帰りましょう。置いてはいきません'
},
BAD_BLAME:{
base:'こうなったのは、{b}のせいだ',
proud:'全部お前のせいだ、{b}。お前がこの村に来ようなんて言わなきゃ……！',
stern:'{b}。君の軽率な判断が、ここまで事態を悪化させた',
tsun:'あんたのせいでしょ！　あんたがあんなこと言わなきゃ、こんなとこ来なかった！',
gentle:'……ごめん、{b}。でも、これだけは言わせて。こうなったのは、きみのせいだよ',
devoted:'{b}さん……あなたがいなければ、誰も死なずに済んだんです',
cool:'{b}。ここまでの失敗を数えると、半分以上はお前の判断だ',
free:'ねえ{b}、正直に言っていい？　全部あんたのせいだと思ってる',
shy:'{b}のせいだよ……っ、ぜんぶ、{b}の……！',
polite:'{b}さん。はっきり申し上げます。こうなったのは、あなたのせいです'
},
BAD_RETORT:{
base:'それはこっちの台詞だ',
proud:'はっ、こっちの台詞だ。お前さえいなけりゃな',
stern:'責任を押しつけるな。今は口論している場合ではない',
tsun:'はあ！？　それ、こっちの台詞なんだけど！',
gentle:'……そう思うなら、それでいいよ。でも今は、前を向こう',
devoted:'……私のせいなら、私が責任を取ります。それでいいでしょう',
cool:'感情論だな。今それを言って、生き残れる確率が上がるのか',
free:'はいはい、全部私のせい。それで気が済むなら、どうぞ',
shy:'そ、そんな……わ、私だって、怖かったのに……っ',
polite:'それは、こちらの台詞です'
},
YGO_LUST:{
base:'{b}……おかしい。触れたくて、止まらない',
proud:'{b}、こっち来い。……今すぐ、お前が欲しい',
stern:'{b}、離れろ……っ。私が、私でなくなる前に',
tsun:'ち、違うから……！　これは、手のひらのせいで……っ、でも、{b}に触りたい',
gentle:'{b}……ごめん。きみに触れたくて、どうにかなりそうなんだ',
devoted:'{b}さん……私、変です。あなたに触れていないと、息ができない',
cool:'{b}。……まずい。理性が、熱に負けていく',
free:'{b}、もういいじゃん。どうせ死ぬかもしれないんだし',
shy:'{b}……っ、こ、こんなの、だめなのに……からだが、勝手に……',
polite:'{b}さん……申し訳ありません。あなたに触れずには、いられないんです'
},
YGO_RAGE:{
base:'{b}。ずっと、こうしてやりたかった',
proud:'{b}……ずっと、ぶん殴ってやりたかったんだよ',
stern:'{b}。君には、罰が必要だ。前から、そう思っていた',
tsun:'あんたなんか、あんたなんか……っ、ずっと、大っ嫌いだった！',
gentle:'ごめんね、{b}。ずっと笑ってたけど……本当は、こうしたかった',
devoted:'{b}さん。あなたさえいなければ。……ずっと、そう思っていました',
cool:'{b}。お前を排除するのが、いちばん合理的だ',
free:'あはは、{b}。もう我慢しなくていいんだって。最高じゃん',
shy:'{b}が、{b}がいつも……っ、いつも、私を……！',
polite:'{b}さん。ずっと、こうして差し上げたかったんです'
},
HANA_REFUSE:{
base:'{b}は渡さない。花嫁になんか、させない',
proud:'ふざけるな。{b}は私のものだ。神だろうが、渡すかよ',
stern:'その縁組は認めない。{b}は、私の伴侶だ',
tsun:'だ、だめ！　{b}は……{b}は、私のなんだから！',
gentle:'ごめんなさい。{b}だけは、あげられないんだ',
devoted:'どうしても花嫁が要るなら、私を連れていってください。{b}さんの代わりに',
cool:'{b}は先約済みだ。神であろうと、横取りは認めない',
free:'やだね。{b}の花嫁姿を見ていいのは、私だけだから',
shy:'や、やだ……{b}を、連れていかないで……っ',
polite:'お断りいたします。{b}さんは、私の大切な人ですから'
},
NYA_REFUSE:{
base:'{b}を置いて助かるくらいなら、ここで死ぬ',
proud:'舐めんな。{b}を見捨てて生き延びるくらいなら、ここで死んでやる',
stern:'取引には応じない。{b}を見捨てる選択肢は、最初から存在しない',
tsun:'は？　{b}を置いてけって？　……馬鹿じゃないの。行くわけないでしょ',
gentle:'ありがとう。でも、{b}がいない明日なら、いらないんだ',
devoted:'私だけ助かっても、意味がありません。{b}さんと一緒でなければ',
cool:'その取引は割に合わない。{b}のいない人生に、価値はない',
free:'ひとりで帰ってもつまんないし。パス',
shy:'い、いやです……{b}をおいていくなんて、できない……っ',
polite:'せっかくですが、お断りします。{b}さんを置いてはいけません'
},
NYA_BETRAY:{
base:'生贄なら、{b}にしてくれ。私は関係ない',
proud:'生贄が要るんだろ。{b}をくれてやる。私は帰るぞ',
stern:'取引だ。{b}を差し出す。代わりに、私を村から出してもらう',
tsun:'{b}でいいでしょ。……別に、あんたのことなんか、どうでもいいし',
gentle:'ごめんね、{b}。……私、どうしても帰りたいんだ',
devoted:'{b}さんを、どうぞ。その代わり、ほかのみんなは見逃してください',
cool:'計算した。{b}一人で済むなら、それがいちばん損失が少ない',
free:'じゃ、{b}で。悪く思わないでね',
shy:'ご、ごめん、{b}……っ、わ、私、死にたくない……！',
polite:'生贄でしたら、{b}さんをお持ちください。私は失礼します'
},
MIRROR_TRUE:{
base:'本物の{b}は、こっちだ。……分かる。ずっと見てきたから',
proud:'こっちが本物だ。{b}が、そんなお上品に笑うかよ',
stern:'右が本物だ。{b}は、緊張すると必ず左手を握る',
tsun:'こっち！　……べ、別に、いつも見てたとかじゃないから！',
gentle:'こっちの{b}だよ。目が、ちゃんと怖がってる',
devoted:'この方が、本物の{b}さんです。間違えるはずがありません',
cool:'鏡像は左右が逆だ。ほくろの位置で分かる。本物は、こっちだ',
free:'こっち。だって、こっちの{b}のほうが、かわいい顔してるもん',
shy:'こ、こっち……だと思う。{b}の手、いつもこんなふうに、あったかいから',
polite:'こちらが本物の{b}さんです。癖が、何ひとつ違いますから'
},
KAMI_CALL:{
base:'{b}！　戻ってこい！　{b}！',
proud:'{b}！　勝手に消えんな！　戻ってこい！',
stern:'{b}、聞こえるか！　私の声のする方へ歩け！',
tsun:'{b}！　ばか、どこ行ってんの！　早く戻ってきなさいよ！',
gentle:'{b}、こっちだよ。ゆっくりでいいから、声のする方においで',
devoted:'{b}さん！　お願いです、行かないでください！　{b}さん！',
cool:'{b}。そっちは違う。私の声を数えろ。一、二、三……こっちだ',
free:'{b}ー！　置いてったら、一生恨むからね！　戻ってきて！',
shy:'{b}……っ、{b}、いかないで……っ、ひとりに、しないで……！',
polite:'{b}さん！　こちらです、戻ってきてください！'
},
CTHU_HOLD:{
base:'行くな、{b}。そっちは海だ。私を見ろ',
proud:'おい、{b}！　どこ行く気だ。こっち見ろ！',
stern:'{b}、止まれ。それは君の意志ではない。目を覚ませ',
tsun:'ちょっと、{b}！　何ぼーっとしてんの、そっち海だってば！',
gentle:'{b}、だめだよ。そっちは冷たいよ。……ほら、私の手、あったかいでしょ',
devoted:'{b}さん、行かないでください。呼んでいるのは、私です。私の声を聞いて',
cool:'{b}。それは夢の声だ。現実の声は、私のほうだ',
free:'{b}、泳ぐなら夏にしよ。今はだめ。ほら、戻って',
shy:'{b}……っ、そっち、いっちゃやだ……！　お願い、こっち見て……！',
polite:'{b}さん、そちらは海です。どうか、私の方を見てください'
},
SHI_WHISPER:{
base:'……大丈夫。私がいる',
proud:'……ビビんな。私がいる',
stern:'……落ち着け。私がついている',
tsun:'……べ、別に。そばにいてあげるだけだから',
gentle:'……大丈夫だよ。私がいるからね',
devoted:'……大丈夫です。私が、ついています',
cool:'……呼吸を整えろ。私がいる',
free:'……へーきへーき。私がいるじゃん',
shy:'……だ、だいじょうぶ。わ、私も、いるから',
polite:'……大丈夫ですよ。私がおります'
},
FLEE_NOW:{
base:'今のうちだ。逃げよう',
proud:'今だ、走れ！　化け物同士で勝手にやらせとけ！',
stern:'全員、私に続け。この混乱が収まる前に離脱する',
tsun:'なにぼさっとしてんの！　今のうちに逃げるの！',
gentle:'みんな、こっち。今なら、気づかれずに抜けられる',
devoted:'今のうちです！　私がしんがりを務めますから、早く！',
cool:'向こうの注意が逸れた。逃げるなら、今しかない',
free:'よーし、喧嘩してる隙にトンズラしよ！',
shy:'い、今のうちに……っ、はやく、はやく……！',
polite:'今のうちに参りましょう。こちらです'
}
};
var ROWS=[
'〈〉。終わったら、一緒に帰ろう。約束する\t〈〉。すべて終わったら、共に帰ろう。約束するよ\t〈〉よ。終わったら、共に帰ろうぞ。約束じゃ\t〈〉。終わったら、一緒に帰ろな。約束や\t……〈〉。一緒に、帰る。約束\t-\t〈〉さん。終わったら、一緒に帰りましょうね。約束だよ',
'〈〉、絶対に一緒に帰る。置いていかない\t〈〉、必ず共に帰ろう。君を置いてはいかないよ\t〈〉、必ず共に帰るぞ。置いてはいかぬ\t〈〉、絶対一緒に帰るで。置いてかへんからな\t……〈〉。一緒に帰る。置いてかない\t-\t〈〉さん、絶対一緒に帰りましょう。置いてかないから',
'こうなったのは、〈〉のせいだ\tこうなったのは、〈〉、君のせいだよ\tこうなったのは、〈〉、おぬしのせいじゃ\tこうなったんは、〈〉のせいやろ\t……〈〉のせい\t-\tこうなったのは、〈〉さんのせいですよ。ほんとに',
'それはこっちの台詞だ\tそれは、こちらの台詞だよ\tそれはこちらの台詞じゃ\tそれ、こっちの台詞やわ\t……こっちの台詞\t-\tそれ、こっちの台詞ですよ。何言ってんの',
'〈〉……おかしい。触れたくて、止まらない\t〈〉……妙だね。君に触れたくて、たまらないのだよ\t〈〉……妙じゃ。触れとうて、止まらぬ\t〈〉……おかしいわ。触りたくて、止まらへん\t……〈〉。触りたい。止まらない\t-\t〈〉さん……おかしいんです。触りたくて、止まんない',
'〈〉。ずっと、こうしてやりたかった\t〈〉。ずっと、こうしたいと思っていたのだよ\t〈〉。ずっと、こうしてやりたかったのじゃ\t〈〉。ずっと、こうしたりたかったんや\t……〈〉。ずっと、こうしたかった\t-\t〈〉さん。ずっと、こうしたかったんですよ。気づいてた？',
'〈〉は渡さない。花嫁になんか、させない\t〈〉は渡さないよ。花嫁になど、させるものか\t〈〉は渡さぬ。花嫁になど、させはせぬ\t〈〉は渡さへん。花嫁になんか、させへんで\t……〈〉は、渡さない\t-\t〈〉さんは渡しません。花嫁になんか、させないから',
'〈〉を置いて助かるくらいなら、ここで死ぬ\t〈〉を置いて助かるくらいなら、ここで死ぬほうがましだよ\t〈〉を置いて助かるくらいなら、ここで果てるわ\t〈〉置いて助かるくらいやったら、ここで死んだるわ\t……〈〉を置いてくなら、死ぬ\t-\t〈〉さんを置いて助かるくらいなら、ここで死にます。本気だってば',
'生贄なら、〈〉にしてくれ。私は関係ない\t生贄なら、〈〉にしてくれたまえ。私は関係ないのでね\t生贄ならば、〈〉にせい。私は関わりない\t生贄やったら、〈〉にしてや。私は関係あらへん\t……生贄なら、〈〉で\t-\t生贄なら、〈〉さんでお願いします。私、関係ないし',
'本物の〈〉は、こっちだ。……分かる。ずっと見てきたから\t本物の〈〉は、こちらだよ。……分かるとも。ずっと見てきたからね\t本物の〈〉は、こちらじゃ。……分かる。ずっと見てきたゆえ\t本物の〈〉は、こっちや。……分かるで。ずっと見てきたんやから\t……本物は、こっち。ずっと、見てたから\t-\t本物の〈〉さんは、こっちです。……分かるよ。ずっと見てたもん',
'〈〉！　戻ってこい！　〈〉！\t〈〉！　戻ってきたまえ！　〈〉！\t〈〉！　戻ってくるのじゃ！　〈〉！\t〈〉！　戻ってこいや！　〈〉！\t……〈〉。……戻って\t-\t〈〉さん！　戻ってきてください！　ねえ、聞こえてるでしょ！',
'行くな、〈〉。そっちは海だ。私を見ろ\t行ってはいけない、〈〉。そちらは海だよ。私を見たまえ\t行くでない、〈〉。そちらは海じゃ。私を見よ\t行ったらあかん、〈〉。そっち海やで。私の顔見てや\t……〈〉。そっち、海。こっち見て\t-\t行かないでください、〈〉さん。そっち海ですよ。こっち見て',
'……大丈夫。私がいる\t……大丈夫だよ。私がいる\t……案ずるな。私がおる\t……大丈夫や。私がおるで\t……いる。ここに\t-\t……大丈夫ですよ。私がいるって',
'今のうちだ。逃げよう\t今のうちだ。退こうじゃないか\t今のうちじゃ。逃げるぞ\t今のうちや。逃げるで\t……今。逃げる\t-\t今のうちです。逃げよ、早く'
];
if(V){
var OVR=V.OVR=V.OVR||{},TONES=['gentleman','noja','kansai','mukuchi','polite','mixed'];
ROWS.forEach(function(row){
var c=row.split('\t');
TONES.forEach(function(t,i){
var v=c[i+1];
if(!v||v==='-')return;
var tb=OVR[t]=OVR[t]||{};
if(tb[c[0]]==null)tb[c[0]]=v;
});
});
}
function keyOf(p){
var t=HK.toneOf?HK.toneOf(p):p.tone;
if(HK.toneOpt&&HK.toneOpt(t,'lines')==='base')return'base';
var ps=HK.personaOf?HK.personaOf(p):p.persona;
return ps&&T.LOVE_VOW[ps]?ps:'gentle';
}
JS.placeLine=function(p,id,b){
var row=T[id],t=row[keyOf(p)]||row.gentle;
return p.name+'「'+t.replace(/\{b\}/g,b?b.name:'')+'」';
};
})();
});
;
/* ==== js/jashin-feud.js ==== */
HK.Load.def(355,'js/jashin-feud.js',function(){
(function(){
'use strict';
var HK=window.HK,ST=HK.Story,JS=HK.JASHIN,FD=HK.Feud,clamp=HK.clamp;
if(!ST|| !JS|| !JS.REL|| !FD)return;
var TL=HK.TL;
if(JS.JOB&&JS.JOB.detective){
JS.JOBS=JS.JOBS.filter(function(j){return j.id!=='detective';});
JS.JOB.detective=JS.JOB.sleuth;
var sc=HK.SCENARIOS&&HK.SCENARIOS.jashin;
(sc&&sc.perFields||[]).forEach(function(f){if(f.id==='job')f.options=f.options.filter(function(o){return o.id!=='detective';});});
}
var DET={sleuth:1,ponkotsu:1};
function isDet(p){return!!DET[p.job];}
function A(S){return S.P.filter(function(p){return JS.alive(p)&& !p.bound;});}
function edge(S,a,b,lab,cls){if(JS.DRAMA)JS.DRAMA.edge(S,a,b,lab,cls,a);}
function pk(S,l){return ST.pick(S,l);}
var setup0=JS.REL.setup;
JS.REL.setup=function(S,input){
S.P.forEach(function(p){if(p.job==='detective')p.job='sleuth';});
return setup0.apply(this,arguments);
};
var arrive0=JS.REL.arrive;
JS.REL.arrive=function(S){
var RT=JS.RELT,banter=RT.PONK_BANTER;
RT.PONK_BANTER=[''];
arrive0.apply(this,arguments);
RT.PONK_BANTER=banter;
var sls=S.P.filter(function(p){return p.job==='sleuth';}),pks=S.P.filter(function(p){return p.job==='ponkotsu';}),done={};
pks.forEach(function(p){
var sl=sls.slice().sort(function(a,b){return FD.ties(S,b,p).length-FD.ties(S,a,p).length;})[0];
if(!sl)return;
done[sl.i+'-'+p.i]=1;
var d=FD.duoText(S,sl,p);
ST.say(S,{actors:[sl,p],tag:'名探偵とポンコツ探偵',text:d.text,why:sl.name+'（名探偵）と'+p.name+'（ポンコツ探偵）の関係：'+FD.label(S,sl,p),mag:12});
});
sls.forEach(function(a){
sls.forEach(function(b){
if(a.i>=b.i||done[a.i+'-'+b.i]|| !FD.ties(S,a,b).length)return;
var d=FD.duoText(S,a,b);
ST.say(S,{actors:[a,b],tag:'名探偵どうし',text:d.text,why:'名探偵が二人。関係：'+FD.label(S,a,b),mag:12});
});
});
};
var tick0=JS.REL.tick;
JS.REL.tick=function(S,live,h){
tick0.apply(this,arguments);
live=A(S);
if(live.length<2)return;
obTick(S,live)||hkTick(S,live,h)||snatch(S,live,h)||detFight(S,live,h)||lhClash(S,live,h)||hateMove(S,live,h);
};
function obTick(S,live){
var r=HK.Obsess&&HK.Obsess.storyTick?HK.Obsess.storyTick(S,live,{rate:0.12}):null;
if(!r)return false;
ST.say(S,{actors:r.actors,tag:r.tag,kind:r.kind,text:r.text,why:r.why,mag:r.mag});
edge(S,r.actors[0],r.actors[1],r.tag,'obsess');
return true;
}
function hkTick(S,live,h){
if(!HK.HateKit)return false;
var r=HK.HateKit.storyTick(S,live,{rate:0.1+(JS.night(h)?0.03:0),lhSkip:function(a,b){return lhNear(S,a,b,h);}});
if(!r)return false;
if(r.lh)FD.lhMark(S,r.actors[0],r.actors[1],h);
ST.say(S,{actors:r.actors,tag:r.cat==='romance'?'片恋と嫌悪':'敵視',text:r.text,why:r.why,mag:r.mag});
edge(S,r.actors[0],r.actors[1],'敵視','enemy');
return true;
}
function pairs(S,live,test){
var out=[];
live.forEach(function(a){live.forEach(function(b){if(a!==b&&test(a,b))out.push([a,b]);});});
return out;
}
function snatch(S,live,h){
var rng=S.rng,ps=pairs(S,live,function(a,b){return(isDet(a)||isDet(b))&&FD.rival(S,a,b);});
if(!ps.length||rng()>0.09||S.found.length>=S.G.clues.length)return false;
var pr=rng.pick(ps),a=pr[0],b=pr[1];
a.rivalBoost=b.rivalBoost=2;
var t=b.name+'が床下の古い箱に手を伸ばした瞬間、'+a.name+'が横からそれをさらった。'+TL.line(a,'CLUE_SNATCH',b);
edge(S,a,b,'出し抜いた','enemy');
if(rng()<0.3){
ST.say(S,{actors:[a,b],tag:'奪い合い',text:t+b.name+'は黙って、箱の端を掴み返した。二人が引っ張り合ううちに、中の古文書は真っ二つに裂けた。読める部分は、ほとんど残っていなかった。',why:a.name+'と'+b.name+'（'+FD.label(S,a,b)+'）の手がかりの奪い合い――台無しになった',mag:22});
return true;
}
var g=JS.GODEV?JS.GODEV.giveClue(S,a):'';
t+=TL.line(b,'CLUE_SNATCH_BACK',a);
ST.say(S,{actors:[a,b],tag:'奪い合い',text:t+(g?a.name+'は、勝ち誇ったように中身を読み上げた'+g:''),why:a.name+'と'+b.name+'（'+FD.label(S,a,b)+'）は張り合って、手がかりを奪い合う'+(g?'（手がかり +1）':''),mag:20});
return true;
}
function detFight(S,live,h){
var rng=S.rng,C=JS.core,ps=pairs(S,live,function(a,b){return a.job==='sleuth'&&b.job==='sleuth'&&a.i<b.i&&(FD.level(S,a,b)>=65||FD.level(S,b,a)>=65||(FD.level(S,a,b)>=35&&FD.level(S,b,a)>=35))&& !FD.lovehate(S,a,b);});
if(!ps.length||rng()>0.05||S.detFought)return false;
S.detFought=true;
var pr=ps[0],a=pr[0].tr.aggr>=pr[1].tr.aggr?pr[0]:pr[1],b=a===pr[0]?pr[1]:pr[0];
var t='推理の食い違いは、とうとう怒鳴り合いになった。'+TL.line(a,'DET_FIGHT',b);
edge(S,a,b,'衝突','enemy');
if(rng()<0.12+a.tr.aggr*0.15&& !(HK.SameStory&&HK.SameStory.nk&&HK.SameStory.nk(S,a,b))){
C.die(S,b,'推理の食い違いから'+a.name+'と揉み合いになって',[t+a.name+'が突き飛ばした先に、民宿の急な階段があった。{a}は、首をあり得ない方向に曲げて、階段の下に横たわっていた。']);
return true;
}
a.m.hp=clamp(a.m.hp-12,0,100);b.m.hp=clamp(b.m.hp-15,0,100);
S.hostile=clamp(S.hostile+4,0,100);
ST.say(S,{actors:[a,b],tag:'名探偵どうし',kind:'climax',text:t+'掴み合いになった二人を、仲間が必死で引き剥がした。二人とも、それから口をきかなくなった。――村人たちは、その様子をにやにやと眺めていた。',why:'敵対している名探偵どうし。推理の主導権をめぐってぶつかった（村人の敵意 +4）',mag:30});
return true;
}
function lhNear(S,a,b,h){var t=FD.lhLast(S,a,b);return t!=null&&h-t<4;}
function lhClash(S,live,h){
var rng=S.rng,ps=pairs(S,live,function(a,b){return FD.lhFrom(S,a,b)&&(a.lhAt==null||h-a.lhAt>8)&& !lhNear(S,a,b,h);});
if(!ps.length||rng()>0.06+(JS.night(h)?0.03:0))return false;
var pr=rng.pick(ps),a= !FD.lhFrom(S,pr[1],pr[0])?pr[0]:pr[0].tr.aggr+pr[0].tr.cp>=pr[1].tr.aggr+pr[1].tr.cp?pr[0]:pr[1],b=a===pr[0]?pr[1]:pr[0];
a.lhAt=b.lhAt=h;
FD.lhMark(S,a,b,h);
var r=FD.clash(S,a,b,function(l){return pk(S,l);});
a.m.fear=clamp(a.m.fear-4,0,100);b.m.fear=clamp(b.m.fear+6,0,100);
if(r.r18){a.cnt.r18=(a.cnt.r18||0)+1;b.cnt.r18=(b.cnt.r18||0)+1;}
edge(S,a,b,r.r18?'無理やり抱いた':r.touch===false?'揉み合った':'唇を奪った',r.touch===false?'enemy':'obsess');
ST.say(S,{actors:[a,b],tag:'愛憎',kind:r.r18?'climax':'event',text:r.text,why:'愛憎（'+FD.label(S,a,b)+'）。'+FD.lhWhy(S,a,b)+(r.touch===false?'（恋愛対象・受け攻めが合わないので、口論と掴み合いまで）':''),mag:r.r18?30:24});
return true;
}
function hateMove(S,live,h){
var rng=S.rng,C=JS.core,night=JS.night(h);
var ps=pairs(S,live,function(a,b){return FD.hateStrong(S,a,b)&& !b.taken&& !(HK.SameStory&&HK.SameStory.nk&&HK.SameStory.nk(S,a,b));});
if(!ps.length)return false;
var pr=rng.pick(ps),a=pr[0],b=pr[1];
var urge=0.012+a.tr.aggr*0.025+a.tr.cold*0.02+a.m.fear/2500+(night?0.01:0)+(S.ygo?(a.viol||0)/2000:0)+(h>S.deadline*0.6?0.012:0);
if(rng()>urge||a.hateDone)return false;
a.hateDone=true;
edge(S,a,b,'憎んでいる','enemy');
if(rng()<0.55){
var t='夜更け、'+a.name+'は一人で村長の家を訪ねた。'+TL.line(a,'HATE_OFFER',b)+'村長は、皺だらけの顔で、ゆっくりと笑った。「＠よう言うてくださった」';
if(rng()<0.55-b.tr.caution*0.2-b.stats.luck*0.03){
b.taken=true;b.takenAt=h;
a.notes.push(b.name+'を、生贄として村人に差し出した');
var o=ST.say(S,{actors:[a,b],tag:'差し出す',kind:'climax',text:t+'その夜、'+b.name+'の部屋に、提灯を持った村人たちがやってきた。'+b.name+'は、最後まで、誰が自分を売ったのか知らなかった。',why:a.name+'は'+b.name+'（'+FD.label(S,a,b)+'）を憎んでいる。生贄として村人に差し出した――連れ去られた（儀式の前に対抗策を実行できれば、助け出せる）',mag:40});
ST.key(S,o,a.name+'が'+b.name+'を村人に売った');
return true;
}
b.m.fear=clamp(b.m.fear+12,0,100);
ST.say(S,{actors:[a,b],tag:'差し出す',text:t+'しかし、その夜、村人たちが来たとき、'+b.name+'は部屋にいなかった。'+b.name+'は、戻ってきた'+a.name+'の顔を、黙って見つめていた。',why:a.name+'は'+b.name+'を村人に売ろうとしたが、'+b.name+'は勘づいていた（慎重さ・運）',mag:30});
return true;
}
var t2=a.name+'は、'+b.name+'を「話がある｜＝｜お話があります」と神社の裏手へ呼び出した。'+TL.line(a,'HATE_KILL',b);
var win=0.45+a.tr.aggr*0.2+JS.skill(a,'fight')*0.2-JS.skill(b,'fight')*0.2-b.stats.luck*0.02;
if(rng()<win){
a.mur={x:'石',t:b};
S.killer=a;
C.die(S,b,a.name+'に、神社の裏で殴り殺されて',[t2+a.name+'の手には、拾った石が握られていた。{a}が振り向く前に、石は振り下ろされた。――翌朝、'+a.name+'は、誰よりも早く「'+b.name+'がいない」と騒いだ。']);
var cs=S.cases[S.cases.length-1];if(cs&&cs.v===b)cs.kind='murder';
return true;
}
a.m.hp=clamp(a.m.hp-15,0,100);b.m.hp=clamp(b.m.hp-10,0,100);b.m.fear=clamp(b.m.fear+15,0,100);
if(HK.HateKit){HK.HateKit.shift(S,b,a,30);HK.HateKit.shift(S,a,b,6);}
ST.say(S,{actors:[a,b],tag:'殺意',kind:'climax',text:t2+a.name+'が振り上げた石を、'+b.name+'は寸前で受け止めた。もみ合いの末、'+a.name+'は石を取り落とした。二人は、荒い息のまま睨み合った。',why:a.name+'は'+b.name+'（'+FD.label(S,a,b)+'）を殺そうとしたが、返り討ちにされかけた',mag:34});
return true;
}
var shield0=JS.REL.shield;
JS.REL.shield=function(S,p,live,t0){
var rng=S.rng,g=live.filter(function(q){return q!==p&&JS.alive(q)&& !q.bound&&FD.lhFrom(S,q,p);})[0];
if(!g||rng()>0.75)return shield0.apply(this,arguments);
var t=t0+g.name+'が、'+p.name+'と襲ってきた者のあいだに割って入った。'+TL.line(g,'LH_GUARD',p);
edge(S,g,p,'守った','obsess');
if(rng()<0.55+JS.skill(g,'fight')*0.3+g.stats.stamina*0.04){
g.m.hp=clamp(g.m.hp-20,0,100);
ST.key(S,ST.say(S,{actors:[g,p],tag:'愛憎',kind:'climax',text:t+g.name+'は、相手が逃げ出すまで、殴る手を止めなかった。振り返った'+g.name+'は、'+p.name+'の無事を確かめると、舌打ちをしてそっぽを向いた。',why:'愛憎（'+FD.label(S,g,p)+'）。憎んでいても、誰かに奪われるのは許せない――撃退した',mag:36}),g.name+'が'+p.name+'を守った');
return true;
}
ST.say(S,{actors:[g,p],tag:'愛憎',kind:'climax',text:t,why:'愛憎（'+FD.label(S,g,p)+'）。身を挺して守った',mag:36});
JS.core.die(S,g,p.name+'を守って',['{a}は、'+p.name+'の前に立ちはだかったまま倒れた。最後に{a}が見ていたのは、'+p.name+'の顔だった。']);
return true;
};
})();
});
;
/* ==== js/solo-jashin-r18.js ==== */
HK.Load.def(388,'js/solo-jashin-r18.js',function(){
(function(){
'use strict';
var HK=window.HK,JS=HK.JASHIN,ST=HK.Story,scen=HK.SCENARIOS&&HK.SCENARIOS.jashin;
if(!JS|| !scen|| !ST)return;
function L(s){return s.split('|');}
function fp(S,a){return HK.Ero&&HK.Ero.fresh?HK.Ero.fresh(S,a,function(l){return ST.pick(S,l);}):ST.pick(S,a);}
scen.env.push({id:'jlewd',label:'住人どうしの夜の起こりやすさ',min:0,max:100,def:40,lo:'起きない',hi:'毎晩',desc:'住人どうしの夜（媚薬の熱・恐怖の夜・恋人や惹かれ合った二人・役職どうしの夜）の起きやすさ。0にすると、住人どうしの夜は起きません'});
scen.env.push({id:'jmob',label:'村人・神の夜の起こりやすさ',min:0,max:100,def:40,lo:'起きない',hi:'毎晩',desc:'村人の夜這い・清めの湯・夢に現れる神・取り憑かれた仲間・洞窟の眷属・生贄の儀・神ごとの夜の起きやすさ。夜這いが苦手なら、ここを0にしてください（住人どうしの夜はそのまま起きます）。以前の「夜の出来事の起こりやすさ」の値を引き継ぎます'});
function lvPC(S){return Math.min(1,Math.max(0,Math.min(100,+S.env.jlewd||0))/100*(HK.Pos&&HK.Pos.nightK?HK.Pos.nightK(S):1));}
function lvMob(S){var v=S.env.jmob==null?S.env.jlewd:S.env.jmob;return Math.max(0,Math.min(100,+v||0))/100;}
var MEAL=L('歓迎の膳には、山菜と川魚と、甘い香りの濁り酒が並んだ。|女将が「村の名物です」と、とろりとした汁物をよそった。|夕餉の膳に、見たことのない赤い茸が添えられていた。');
var MEAL_EAT=L('{a}は箸をつけた。しばらくすると、体の芯がじんわりと熱くなってきた。|{a}は濁り酒を一杯飲み干した。頬が火照り、肌が着物に擦れるだけで息が上がった。|{a}は勧められるままに食べた。夜が更けるほど、熱は下腹に溜まっていった。');
var MEAL_SKIP=L('{a}は膳の匂いに違和感を覚え、持参した携帯食で済ませた。|{a}は「食欲がない」と言って、膳を下げてもらった。|{a}は一口目で舌に残る妙な甘さに気づき、「少し失礼」と席を外した。');
var DOSE={
meal:{label:'夕餉の膳',intro:MEAL,take:MEAL_EAT,leave:MEAL_SKIP},
incense:{label:'囲炉裏端のお香',
intro:L('夕餉のあと、女将が囲炉裏端に香炉を置き、「村の祭りの香です」と火を入れた。甘く重たい煙が、ゆっくりと座敷に満ちていった。|座敷の四隅に、細い線香が立てられた。「虫除けですよ」と女将は笑った。煙は、花とも蜜ともつかない匂いがした。'),
take:L('{a}は煙を吸い込むたびに、頭の奥がぼんやりと痺れていくのを感じた。肌が着物に擦れるだけで、息が上がった。|{a}は「いい匂い」と目を細めた。しばらくすると、下腹の奥に、甘い熱がじわじわと溜まり始めた。|{a}は煙の中で、なぜか隣の人の体温ばかりが気になっていた。'),
leave:L('{a}は煙の匂いに眉をひそめ、「少し外の空気を吸ってきます」と席を外した。縁側の夜風が、頭をはっきりさせた。|{a}は袖で口元を覆い、「先に休みます」と言って座敷を出た。廊下に出ると、甘い匂いはふっと消えた。|{a}は香炉の灰に混じる見慣れない粉に気づき、黙って座敷を抜け出した。')},
bath:{label:'薬湯',
intro:L('女将が「旅の疲れには、村の薬湯がいちばん」と湯殿へ案内した。湯は薄桃色で、とろりとしていた。|「祭りの前には、皆さん薬湯で身を清めるんですよ」――湯殿には、甘い湯気が立ちこめていた。'),
take:L('{a}は肩まで湯に浸かった。湯から上がるころには、体の芯が火照って、浴衣の衿を合わせる指が震えていた。|{a}は湯の甘い匂いに包まれて、長湯をしてしまった。湯上がりの肌が、いつまでも熱かった。'),
leave:L('{a}は湯の色と、肌にまとわりつくぬめりに違和感を覚え、足先だけ浸けて「やっぱり部屋で休みます」と湯殿を出た。|{a}は湯船の縁に溜まった桃色の澱を見て、そっと湯殿を後にした。')},
tea:{label:'縁側のお茶と菓子',
intro:L('縁側で、村の娘が冷たいお茶と、桃色の餡の饅頭を出してくれた。「村のお祭りのお菓子です」|宿の主人が「おやつにどうぞ」と、蜜をかけた団子と濃いお茶を運んできた。'),
take:L('{a}は饅頭を二つ食べ、お茶を飲み干した。日が沈むころには、ほてった頬を何度も手であおいでいた。|{a}は「甘くておいしい」と笑った。そのうち、縁側の板に触れる太腿の感触が、妙に気になり始めた。'),
leave:L('{a}はお茶の後味に残る苦みに気づき、「ごちそうさま」と言って湯呑みを置き、部屋に戻った。|{a}は菓子を半分に割り、餡に混じる赤い粒を見て、そっと懐紙に包んで席を外した。')},
sake:{label:'御神酒の盃回し',
intro:L('村長が「祭りの前の固めの盃を」と朱塗りの盃を回し始めた。一人ずつ、御神酒を飲み干すまで盃は戻ってこなかった。|集会所で、村の年寄りたちが「よそ者にも御神酒を」と徳利を持ってきた。断れる空気ではなかった。'),
take:L('{a}は盃を飲み干した。喉を落ちていった熱は、腹の底でいつまでも燃え続けた。|{a}は御神酒を受けた。二杯目を断れないうちに、膝の上の手がじっとりと汗ばんでいた。'),
leave:L('{a}は盃に口をつけるふりをして、袖口に酒を流した。それから「少し酔いました」と頭を下げて、座を外した。|{a}は「下戸なので」と盃を返し、村長の目が笑っていないことに気づいて、早々に席を立った。')},
pillow:{label:'寝所の香炉',
intro:L('部屋に戻ると、枕元に小さな香炉が置かれ、細い煙が立ちのぼっていた。「よく眠れるように」と書いた紙が添えてあった。|布団を敷きに来た女中が、「村の安眠香です」と言って、部屋の隅に香を焚いていった。'),
take:L('{a}は香の匂いに包まれて横になった。眠気の代わりにやってきたのは、布団の中で疼き続ける熱だった。|{a}は「親切な宿だ」と呟いて布団に入った。夜半、自分の荒い息で目を覚ました。'),
leave:L('{a}は香炉の煙を見て眉をひそめ、蓋を閉めて廊下に出した。窓を開け放ってから、ようやく横になった。|{a}は香炉を手に取り、灰の匂いを確かめた。それから黙って、部屋を出ていった。')}
};
function notice(p){return 0.15+p.tr.caution*0.45+p.tr.a*0.2+(p.job==='sleuth'||p.job==='doctor'?0.2:0)+(p.wary?0.25:0);}
var ALSO=['{a}も、同じものを口にしていた。頬が、いつの間にか赤い。','{a}の息も、気づけば浅く、熱っぽくなっていた。','{a}は落ち着かなげに、何度も襟元を直した。','{a}の目も、とろりと潤み始めていた。'];
var SAKE_WEAK=['{a}は酒に弱い。一杯で首まで赤くなり、酔いと熱の区別がつかなくなった。','酒に弱い{a}には、一杯でも多すぎた。視界が揺れ、体の芯だけがはっきりと熱かった。'];
var SAKE_STRONG=['{a}は酒には強い。顔色こそ変わらなかったが、腹の底の熱だけは、酒のせいではなかった。','{a}は二杯、三杯と涼しい顔で盃を空けた。――酔わないぶん、体の疼きだけがはっきりと分かった。'];
function alcOf(p){return HK.alcLevel?HK.alcLevel(p):3;}
function dose(S,live,key){
var rng=S.rng,D=DOSE[key],take=[],left=[];
live.forEach(function(p){
var nt=notice(p)+(key==='sake'?[0,0.15,0.08,0,-0.08,-0.12][alcOf(p)]:0);
if(rng()<nt){left.push(p);p.wary=true;p.m.fear=Math.min(100,(p.m.fear||0)+4);}
else{take.push(p);p.aphro=true;p.dosed=(p.dosed||0)+1+(key==='sake'&&alcOf(p)<=1?1:0);if(p.dosed>=2)p.wary=true;}
});
var tk=rng.shuffle?rng.shuffle(D.take.slice()):D.take.slice(),lv0=rng.shuffle?rng.shuffle(D.leave.slice()):D.leave.slice();
var t=fp(S,D.intro)+take.map(function(p,i){var al=key==='sake'?alcOf(p):3;return ST.fmt(i<tk.length?tk[i]:ALSO[i%ALSO.length],{a:p.name})+(al<=2&&rng()<0.7?ST.fmt(SAKE_WEAK[i%2],{a:p.name}):al>=4&&rng()<0.6?ST.fmt(SAKE_STRONG[i%2],{a:p.name}):'')+(rng()<0.5?pz(S,p,'drug'):'');}).join('')+left.map(function(p,i){return ST.fmt(lv0[i%lv0.length],{a:p.name});}).join('');
ST.say(S,{actors:live,tag:D.label,text:t,why:'媚薬が盛られていた（'+D.label+'）。口にした：'+(take.map(function(p){return p.name;}).join('・')||'なし')+'／気づいて席を外した：'+(left.map(function(p){return p.name;}).join('・')||'なし')+'。慎重さ・A・職業で気づく',mag:16});
(S.r18Doses=S.r18Doses||[]).push(key);
}
var YOBAI=L('夜半、{a}の部屋の襖が音もなく開いた。村の若い衆が、無言で布団に滑り込んできた。媚薬の熱に浮かされた{a}は、押しのける腕に力が入らなかった。|{a}は暗闇の中で、知らない手に浴衣の帯を解かれた。「祭りの前に、清めておかにゃならん」――耳元で囁く声に、{a}の体は勝手に応えていた。|月明かりの差す座敷で、{a}は村人たちに代わる代わる抱かれた。誰かが祝詞のような歌を口ずさんでいた。|{a}は夜這いに来た村人の腰に、自分から脚を絡めていた。朝になって、自分が何をしたのか思い出し、顔を覆った。');
YOBAI=YOBAI.concat(L('{a}は、布団の両側から伸びてきた手に、口を塞がれた。祭りの前の「味見」だと、誰かが笑った。媚薬の熱で、{a}の拒む声はすぐに甘くなった。|夜明け前、{a}の部屋から出ていく村人は、三人目だった。{a}は乱れた布団の上で、焦点の合わない目で天井を見ていた。|{a}の耳元で、村の男が囁いた。「よそから来た人の体は、神さまがお喜びになる」――{a}は奥を突かれるたびに、自分の知らない声を上げていた。'));
var YOBAI_FORCE=L('夜半、{a}の部屋の襖が音もなく開いた。村の男が、無言で布団に滑り込んできた。|{a}が寝入りかけたとき、布団の両側から手が伸びてきた。祭りの前の「味見」だと、誰かが笑った。|夜更け、{a}の部屋に、酒臭い村の男が押し入ってきた。「よそから来た人の体は、神さまがお喜びになる」|{a}は厠からの帰り、暗い廊下で口を塞がれ、空き座敷に引きずり込まれた。|夜更け、{a}の部屋の行灯がふっと消えた。暗闇の中で、何人もの足音が布団を囲んだ。|{a}が湯上がりの火照りを冷ましていると、縁側の暗がりから腕が伸びてきた。そのまま、奥の納戸へ引きずり込まれた。|寝苦しさに目を覚ますと、{a}の上に、知らない男が馬乗りになっていた。「＠祭りの前じゃ。声を出しなさんな」');
var YOBAI_ACT=L('男は{a}の浴衣の裾を割り、押さえつけたまま、奥まで沈めた。|{a}は村人たちに代わる代わる組み敷かれた。誰かが祝詞のような歌を口ずさんでいた。|男は{a}の脚を抱え上げ、獣のように腰を打ちつけ続けた。夜明け前、{a}の部屋から出ていく村人は、三人目だった。|男は{a}をうつ伏せに押さえつけ、背後から何度も貫いた。畳に爪を立てる{a}の指先が、白くなっていた。|男は{a}の手首を帯で押さえ、乱暴に脚を割り開いて沈めた。障子の向こうで、別の誰かが順番を待っていた。|{a}は畳の上で何度も体を返され、そのたびに違う手に押さえつけられた。祭囃子の稽古の音が、遠くで鳴り続けていた。|男は{a}の口を塞いだまま、背後から深く貫いた。{a}の爪が、畳の目を掻きむしった。|村人は{a}の腰を抱え上げ、獣のように何度も打ちつけた。夜明けが近づくと、男は何事もなかったように帯を締め直して出ていった。');
var YOBAI_TOP=L('夜半、{a}の部屋に村の娘が忍び込んできた。媚薬に浮かされた{a}は、気づけば娘を組み敷き、奥まで沈めていた。|{a}は暗闇の中で、自分の上に跨ろうとする村人の手首を掴んだ。そのまま体を入れ替えて布団に押さえつけ、相手が音を上げるまで、熱に任せて責め立てた。|夜半、襖の隙間から、村の若い衆が這い込んできた。{a}は寝たふりのまま男の手首を掴み、布団の上へ引き倒した。媚薬の熱に任せて組み敷くと、男は抵抗をやめ、{a}の下で荒い息を吐きはじめた。|{a}は、布団に潜り込んできた村の娘の口を、掌でそっと塞いだ。「静かに」――そう囁いて娘を仰向けにさせ、{a}はゆっくりと奥まで沈めた。娘は掌の下で、くぐもった甘い声を何度も漏らした。|夜這いに来た村人を、{a}は逆に壁際へ追い詰めた。媚薬が回った体は、熱を吐き出す相手を求めていた。{a}は相手の背中を壁に押しつけ、夜が白むまで離さなかった。|{a}の部屋に忍んできた娘は、気づけば自分のほうが布団に押さえつけられていた。{a}は娘の膝を割り、奥を確かめるようにゆっくりと腰を沈めた。祭囃子の稽古の音に、娘の声が溶けていった。');
var YOBAI_TOP_F=L('夜半、{a}の部屋に村の娘が忍び込んできた。媚薬に浮かされた{a}は、気づけば娘を組み敷き、浴衣をはだけさせて、指と舌で娘が泣き出すまで責め立てていた。|夜半、{a}の部屋に村の若い男が忍び込んできた。{a}は伸びてきた手を捻り上げて布団に押さえつけ、自分から男の上に跨った。主導権は、最後まで{a}の手を離れなかった。|{a}は暗闇の中で、自分の上に跨ろうとする村人の手首を掴んだ。そのまま体を入れ替えて布団に押さえつけ、相手が音を上げるまで、熱に任せて責め立てた。|夜半、襖の隙間から、村の若い衆が這い込んできた。{a}は寝たふりのまま男の手首を掴んで布団に引き倒し、その腰に跨った。媚薬の熱が引くまで、{a}は男の上から降りなかった。|{a}は、布団に潜り込んできた村の娘の口を、掌でそっと塞いだ。「静かに」――そう囁いて娘を仰向けにさせ、{a}は浴衣の裾から指を差し入れた。娘は掌の下で、くぐもった甘い声を何度も漏らした。|夜這いに来た村の男を、{a}は逆に畳の上へ組み伏せた。{a}は男の胸に手をついて腰を落とし、自分の好きな速さで揺らした。男が音を上げても、{a}は笑って動きを緩めなかった。');
var YOBAI_TOP_NPC=L('村人は、{a}の下で荒い息を吐き、喉の奥で呻いた。|相手は、{a}の下で身をよじり、方言混じりの甘い声を上げた。|村人は、{a}に手首を押さえられたまま、何度も許しを乞うような声を上げた。|相手は、乱れた浴衣の袖を噛み、{a}の下で何度も肩を震わせた。|村人は、朝になると{a}と目を合わせようとせず、逃げるように部屋を出ていった。');
var YOBAI_NO=L('夜半、{a}の部屋の襖が少しだけ開いた。{a}が「誰だ」と声を上げると、気配は闇に消えた。|{a}は襖につっかえ棒をして眠った。朝まで、外から何度も引く音がした。|{a}は寝たふりをしながら、枕の下の懐中電灯を握りしめていた。襖が開いた瞬間に光を浴びせると、影は慌てて逃げていった。');
var MUTUAL_FF=L('媚薬の熱に耐えきれず、{x}は{y}の部屋を訪ねた。言葉は要らなかった。{x}は{y}を布団に横たえ、浴衣の合わせを開いて、火照った胸に唇を這わせた。|「おかしいの、体が……」――{y}がそう言い終わる前に、{x}が唇を塞いだ。二人は布団の上で脚を絡め、夜明けまで互いの熱を擦り合わせた。|{x}と{y}は、怖さを紛らわせるように抱き合った。触れ合ううちに熱が止まらなくなり、{x}の指は{y}の浴衣の裾の奥へ滑り込んでいった。|障子越しに村人の気配がするのも構わず、{x}は{y}を後ろから抱きすくめ、浴衣の上から胸を揉みしだいた。{y}は声を殺そうとして、殺しきれなかった。|「怖いから、一緒に寝てもいい？」――{y}の言葉に頷いた{x}は、布団の中で{y}の震える体を抱き寄せた。震えは、やがて別のものに変わった。|{x}は、{y}の浴衣の合わせから手を差し入れた。{y}は拒まなかった。「……今だけ、何も考えさせないで」|二人は民宿の暗い廊下で鉢合わせた。媚薬の熱を持て余していたのは、どちらも同じだった。{x}は{y}を壁に押しつけ、帯を解いて、濡れたところへ指を這わせた。|{x}は{y}の脚を開かせ、行灯の明かりの中で、そこへ顔を埋めた。{y}は布団の端を噛んで、甘い悲鳴を押し殺し続けた。');
var MUTUAL=L('媚薬の熱に耐えきれず、{x}は{y}の部屋を訪ねた。言葉は要らなかった。{x}は{y}を布団に押し倒し、何度も奥まで穿った。|「おかしいの、体が……」――{y}がそう言い終わる前に、{x}が唇を塞いだ。二人は夜明けまで、獣のように互いを貪った。|{x}と{y}は、怖さを紛らわせるように抱き合った。触れ合ううちに熱が止まらなくなり、{x}は{y}の中で何度も果てた。|障子越しに村人の気配がするのも構わず、{x}は{y}を後ろから抱いた。{y}は声を殺そうとして、殺しきれなかった。');
MUTUAL=MUTUAL.concat(L('「怖いから、一緒に寝てもいい？」――{y}の言葉に頷いた{x}は、布団の中で{y}の震える体を抱き寄せた。震えは、やがて別のものに変わった。|{x}は、{y}の浴衣の合わせから手を差し入れた。{y}は拒まなかった。「……今だけ、何も考えさせないで」|二人は民宿の暗い廊下で鉢合わせた。媚薬の熱を持て余していたのは、どちらも同じだった。{x}は{y}を壁に押しつけ、その場で繋がった。|{x}は{y}を何度も果てさせた。それでも{x}の熱は引かず、{y}は朝まで、{x}の下で甘い悲鳴を上げ続けた。|翌朝、{x}と{y}は気まずそうに目を逸らした。けれど次の夜も、{y}の部屋の襖は、少しだけ開いていた。'));
var MUTUAL_FM=L('媚薬の熱に耐えきれず、{x}は{y}の部屋を訪ねた。言葉は要らなかった。{x}は{y}を布団に押し倒して跨り、自分の手で導いて、何度も深く腰を沈めた。|'+
'「おかしいの、体が……」――{y}がそう言い終わる前に、{x}が唇を塞いだ。{x}は{y}を仰向けにして上に乗り、夜明けまで腰を止めなかった。{y}は{x}の下で、獣のような声を何度も噛み殺した。|'+
'{x}と{y}は、怖さを紛らわせるように抱き合った。触れ合ううちに熱が止まらなくなり、{x}は{y}に跨って、自分の中へ{y}を迎え入れた。{y}は{x}の中で、何度も果てた。|'+
'障子越しに村人の気配がするのも構わず、{x}は{y}を壁際に座らせ、その膝の上に跨った。{y}は声を殺そうとして、殺しきれなかった。{x}は{y}の口を手で塞いだまま、ゆっくりと腰を揺らし続けた。|'+
'「怖いから、一緒に寝てもいい？」――{x}の言葉に頷いた{y}は、布団の中で{x}に抱き寄せられた。震えは、やがて別のものに変わった。{x}は{y}の上に身を起こし、ためらいもなく腰を沈めた。|'+
'二人は民宿の暗い廊下で鉢合わせた。媚薬の熱を持て余していたのは、どちらも同じだった。{x}は{y}を壁に押しつけてその場に座り込ませ、膝の上に跨って繋がった。|'+
'{x}は{y}を何度も果てさせた。それでも{x}の熱は引かず、{y}は朝まで、{x}の下で甘い声を上げ続けた。{x}は{y}の胸に手をついたまま、最後の一滴まで搾り取った。');
var PREG=L('翌朝、{y}の下腹が、わずかに膨らんでいた。女将がそれを見て、嬉しそうに手を合わせた。「まあ、おめでたい。神さまの器が、できなさった」|{y}は朝から、下腹の奥で何かが動く感覚に怯えていた。村の老婆が言った。「あんたの中に、もう宿っとる」|{y}の下腹に、昨夜まではなかった紋様が浮かんでいた。村の秘術で、{y}の体は「孕んだ」ことにされていた。|{y}は朝餉の匂いに、急に胸が悪くなった。女将が意味ありげに微笑み、{y}の背中をさすった。「よかった。ちゃんと、宿りなさった」|{y}の臍の下に、薄い痣のような輪が浮かんでいた。輪は、指でなぞると、かすかに熱を帯びた。|{y}は夜中に、下腹の奥から小さく叩かれるような感覚で目を覚ました。隣で眠る相手には、言えなかった。|翌朝、村の老婆が{y}の顔を見るなり、両手を合わせて拝んだ。「＠もう、神さまの子の匂いがする」');
var RITUAL=L('{a}は白い薄衣一枚で祭壇に横たえられた。村人たちが周りを囲み、祝詞に合わせて{a}の肌に油を塗り込めていった。やがて祭壇の奥から、人ではないものの気配が這い寄り、{a}の脚を押し開いた。|{a}は祭壇の上で、村の男たちに「清め」と称して代わる代わる抱かれた。最後に{g}の御前へ差し出されたとき、{a}はもう自分の名前も思い出せなかった。|祭壇の上で、{a}の体に冷たい何かが何本も絡みついた。それは{a}の奥深くまで入り込み、何かを注ぎ込み続けた。{a}の悲鳴は、いつしか甘い声に変わっていた。');
RITUAL=RITUAL.concat(L('祭壇の{a}の周りで、村人たちが輪になって踊った。一人が踊りの輪から外れるたびに、{a}の上に覆いかぶさった。祝詞は、夜が明けるまで途切れなかった。|{a}は御神酒を口移しで飲まされた。体が溶けるように熱くなり、{a}は自分から祭壇の上で脚を開いていた。{g}の御前で、{a}は何度も、何度も清められた。'));
var BATH_NO=L('{a}は女将に「祭りの前に、清めの湯へ」と勧められた。湯殿の戸を開けると、村の若い衆が待ち構えていた。{a}は手桶を投げつけ、湯にも浸からずに引き返した。|{a}は清めの湯に誘われたが、白く濁った湯を一瞥して「いらない」と戸を閉めた。湯殿の中から、残念そうな舌打ちが聞こえた。|{a}は湯殿の前で立ち止まり、中の気配を一瞥して「結構です」とだけ言った。女将の笑顔が、一瞬だけ引きつった。');
var BATH=L('{a}は女将に「祭りの前に、清めの湯へ」と勧められた。湯殿には、村の若い衆が待っていた。何本もの手が、湯の中で{a}の体じゅうを這い回った。|{a}が湯に浸かっていると、村人たちが入ってきて、無言で{a}の体を洗い始めた。手が脚のあいだに滑り込んだとき、{a}はもう、湯の熱と媚薬の熱の区別がつかなかった。|清めの湯は、白く濁っていた。湯の中で何かが{a}の肌を撫で、敏感なところを探り当てた。{a}は湯殿の縁にしがみつき、声を殺して果てた。|清めの湯の湯気は、甘く重たかった。{a}がふらついたところを、村の女たちが両側から支え、湯の中で肌を撫ではじめた。撫でる手は、少しずつ、遠慮のない場所へ降りていった。|湯殿の灯りが消え、暗闇の中で湯だけがぬるく揺れていた。湯の底から伸びてきた何本もの手が、{a}の脚を開かせた。{a}は湯殿の縁に縋り、声を殺しきれずに何度も果てた。|「＠清めは、隅々まで」――村の男が、{a}の体を後ろから抱え込んだ。湯の中で、指が{a}の奥を何度も探った。湯から上がるころには、{a}は一人で立てなくなっていた。');
var DREAM_TOP=L('夢の中で、{g}の気配が{a}にのしかかろうとした。{a}は顔の見えない何かの喉元を掴み返し、逆に祭壇の上へねじ伏せた。夢の終わりに、先に音を上げたのは神のほうだった。目覚めると、掌にまだ熱が残っていた。|夢の中で、闇の中から伸びてきたものが{a}の脚に絡みつこうとした。{a}はそれを踏みつけ、根元から引き千切った。闇の奥で、何かが怯えたように身を引いた。|{a}は毎晩、同じ夢を見た。{g}が{a}の名を呼び、身を委ねろと囁く夢を。{a}は一度も応えなかった。夢の終わりにはいつも、{a}の足元に跪いているのは{g}のほうだった。');
var DREAM=L('{a}は夢の中で、{g}に抱かれていた。顔の見えない何かが{a}の体を開き、熱いものを奥深くに注ぎ込んだ。目覚めると、布団がぐっしょりと濡れていた。|夢の中で、{a}は祭壇に横たわっていた。闇の中から伸びてきたものが、{a}の口にも、脚のあいだにも入り込んできた。{a}は夢の中で、何度も達した。|{a}は毎晩、同じ夢を見た。{g}が{a}の名を呼び、{a}は自分から身を委ねる夢を。夢を見るたびに、目覚めたときの体の疼きは強くなっていった。|夢の中で、{a}は社の床に横たえられていた。御簾の向こうから伸びてきた冷たい手が、{a}の着物の合わせを一枚ずつ開いていった。目覚めると、肌には指の跡のような赤みが残っていた。|夢の中で、{a}は水底に沈んでいた。息は苦しくなかった。水そのものが{a}の体の隅々まで入り込み、{a}は泡を吐きながら何度も達した。|夢の中で、{g}の声が{a}の名を呼んだ。呼ばれるたびに、体の奥を撫でられるような感覚が走った。{a}は自分の喘ぎ声で目を覚まし、布団の中で膝を抱えた。|夢の中で、{a}は祭りの行列の真ん中にいた。面をつけた村人たちに担がれ、社の奥へ運ばれていく。奥で待っていたものに抱かれた瞬間、{a}は悲鳴とも嬌声ともつかない声を上げた。');
var DREAM_GOD={
dagon:'夢の中で、{a}は冷たい海の底に沈んでいた。ぬめった鱗の腕が{a}を抱きすくめ、水かきのある指が{a}の奥を探った。{a}は海の中で、魚のように口を開けて喘いだ。',
cthulhu:'夢の中で、緑の石の都市の奥から伸びてきた無数の触腕が、{a}の手足を絡め取った。一本は口に、一本は脚のあいだに。{a}は夢の中で、海の底の神に孕まされていた。',
shub:'夢の中で、{a}は黒い森の地面に横たえられていた。黒い蔓のようなものが{a}の脚を押し開き、奥へ、奥へと入り込んできた。千の仔の母の、新しい器として。',
nyarla:'夢の中で、「伝道師様」が{a}の顎に指をかけた。「ずいぶん、我慢していらっしゃる」――それから先のことを、{a}は思い出したくなかった。思い出すたびに、体が熱くなった。',
hastur:'夢の中で、黄衣の何かが{a}に覆いかぶさった。衣の下の触手が{a}の肌を這い、{a}は二つの太陽の下で、知らない言葉で喘いでいた。',
ygolonac:'夢の中で、首のない肥えた巨体が{a}を組み敷いた。掌の口が{a}の肌を舐め回し、{a}が心の底に隠していた欲望を、ひとつ残らず暴き立てた。',
hakuja:'夢の中で、白い大蛇が{a}の体に巻きついた。冷たい鱗が肌を締めつけ、二股の舌が{a}の敏感なところをちろちろと舐めた。{a}は蛇の腕の中で身をよじった。',
hanayome:'夢の中で、{a}は白無垢を着せられ、祝言の床にいた。顔のない婿が、{a}の帯を解いた。{a}は床入りの夜を、朝まで迎え続けた。',
ama:'夢の中で、海女たちが{a}を海の底へ連れていった。白くふやけた指が、何本も{a}の体を弄び、{a}は息もできないまま、快楽に溺れていった。',
mekura:'夢の中で、{a}は白無垢を着せられ、目隠しをされていた。木の香りのする手が、{a}の体の隅々を、病を探すように撫でていった。撫でられたところが、熱く疼いて、{a}は見えない誰かの腕の中で何度も身を反らせた。',
ajiro:'夢の中で、{a}は湖の底に横たえられていた。白くふやけた千の手が、観音の慈悲のように{a}の体を撫で、開き、満たしていった。',
madara:'夢の中で、{a}は機屋の奥で、絹糸に手足を縫いとめられていた。斑の女神が、{a}の肌の斑点を一つずつ舌でなぞり、{a}はそのたびに、糸を震わせて喘いだ。',
quachil:'夢の中で、{a}は止まった時の中にいた。骨のような指が{a}に触れるたびに、快楽だけが何十年分も一度に流れ込んできた。',
imigui:'夢の中で、{a}の罪を書いた形代が、ひとりでに{a}の肌を撫で始めた。撫でられたところから、恥ずかしい記憶と熱が、同時に溢れ出した。巨大な口が、{a}の全身を、ゆっくりと味わっていた。',
chibiki:'新月の夜の夢の中で、{a}は千本の引き綱に手足を縛られ、荷車の上に大の字に括りつけられていた。轟音とともに揺れる荷台の上で、腐り落ちた毛皮の何かが、{a}に覆いかぶさった。',
fuchi:'夢の中で、{a}は白無垢のまま淵の底へ沈んでいった。冷たい水の中で、長い髭が{a}の帯を解き、花嫁の体を隅々まで確かめていった。{a}は息もできないまま、水底の婚礼の床で果てた。',
shijima:'夢の中でさえ、音はなかった。口を縫われた白い影が、{a}の体を音もなく開いた。{a}は、声を上げることも許されないまま、無音の中で何度も達した。',
akatsuchi:'夢の中で、{a}は温かい赤土の中に埋められていた。脈打つ土が{a}の全身を包み、揉みしだき、奥深くまで入り込んできた。',
yig:'夢の中で、無数の蛇が{a}の体を這い上がってきた。冷たい鱗が肌を擦り、太い一匹が、{a}の脚のあいだへ、ぬるりと頭を潜り込ませた。',
byatis:'夢の中で、一つ目の何かが{a}に囁いた。「扉を開けておくれ。そうしたら、もっと、気持ちよくしてやろう」――蛇のような髭が{a}の肌を這い、{a}は夢の中で、扉の方へ手を伸ばしながら果てた。',
gatano:'夢の中で、{a}は鏡の前に立たされていた。鏡の向こうから伸びてきた灰色の手が、{a}の体を撫でるたびに、撫でられたところが石のように痺れ、そして蕩けた。',
chaugnar:'夢の中で、象の鼻を持つ仏像が、{a}の首筋に吸いついた。血を吸われるたびに、体の奥が甘く痺れ、{a}は自分から首を差し出していた。',
ithaqua:'夢の中で、{a}は吹雪の空の上にいた。凍える風の腕に抱かれ、氷のように冷たいものに貫かれて、{a}は空の高みで身を震わせた。',
glaaki:'夢の中で、{a}は湖の底の家にいた。棘だらけの何かが、一本だけ柔らかい棘で、{a}の奥を、ゆっくりと探っていた。',
tsathoggua:'夢の中で、{a}は洞窟の底の、毛むくじゃらの温かい腹の上に横たえられていた。長い舌が、眠たげに、{a}の体を隅々まで舐め上げていった。',
yog:'夢の中で、{a}は虹色の球体の群れに包まれた。過去と未来の自分が同時に抱かれ、{a}は一度の夜に、千回分の絶頂を味わった。',
tsuchigumo:'夢の中で、{a}は白い糸で手足を縛られ、地下の巣に吊るされていた。毛むくじゃらの脚が{a}の体を撫で、何かを{a}の奥に産みつけていった。'
};
var DREAM_GOD_MORE={
dagon:L('夢の中で、{a}は潮の満ちる洞窟に寝かされていた。生臭い潮の香りとともに、大きな影が覆いかぶさってきた。冷たい鱗の胸に抱かれるたび、{a}の体は波のように揺れた。|夢の中で、{a}の肌に鱗が一枚ずつ浮かび上がっていった。鱗が増えるたびに、海の父さまの指が触れる場所は、甘く痺れていった。'),
cthulhu:L('夢の中で、{a}は傾いた石の柱の間を歩いていた。柱の影から伸びた触腕が、{a}の足首に、腰に、首筋に、優しく巻きついていった。|夢の中で、眠りの大神の寝息が{a}を包んだ。息がかかるたびに、{a}の体は内側からとろけ、知らない言葉で何かを乞うていた。'),
hastur:L('夢の中で、{a}は黄色い衣の裾に包まれていた。衣の内側は生温かく、無数の柔らかなものが{a}の肌を同時に撫で回した。|夢の中で、名を呼んではならぬ方の名を、{a}は喘ぎながら何度も呼んでいた。呼ぶたびに、奥の熱が強くなった。'),
nyarla:L('夢の中で、黒い男は{a}の耳元で、{a}がいちばん聞きたかった言葉を囁いた。囁きながら、長い指が{a}の帯を解いていった。|夢の中で、{a}は千の顔を持つ相手に、千通りのやり方で抱かれた。目覚めたとき、どの顔も思い出せなかった。'),
shub:L('夢の中で、{a}は千の仔の産声に囲まれていた。森の母の柔らかな腕が{a}を抱き寄せ、{a}の体を、新しい命の宿る場所へと作り変えていった。|夢の中で、黒い山羊の群れが{a}を囲み、湿った鼻先で肌を探った。群れの奥から現れた何かに抱かれ、{a}は森の土の匂いの中で果てた。'),
yog:L('夢の中で、{a}は無数の門をくぐり続けていた。門をくぐるたびに、誰かの手が{a}の体に触れ、触れられた記憶が積み重なっていった。|夢の中で、虹色の球体が{a}の体の中に沈んでいった。体の奥で球体がはじけるたびに、{a}は時間の外側で震えた。'),
ithaqua:L('夢の中で、{a}は雪原に裸で横たえられていた。凍えるはずの体は、吹きつける風に撫でられるたびに、内側から燃えるように熱くなった。|夢の中で、巨大な足跡が{a}の周りを巡っていた。足跡の主が{a}を抱き上げたとき、{a}の吐く息は白く、甘く乱れていた。'),
cthugha:L('夢の中で、{a}は燃えさかる炎の中にいた。熱くはなかった。炎の舌が肌を舐めるたびに、焼けるような快感だけが体の奥に溜まっていった。|夢の中で、囲炉裏の火が人の形になって、{a}を抱きすくめた。火の腕に包まれた{a}は、汗に濡れながら、何度も身を震わせた。|夢の中で、{a}は炎の御方の前に跪かされていた。火の粉が肌に落ちるたび、そこから熱が広がり、{a}は声を抑えられなくなった。'),
tsathoggua:L('夢の中で、眠たげな大きな目が{a}を見下ろしていた。生ぬるい腹に抱き込まれ、{a}は洞窟の底で、いつまでもまどろむように果て続けた。|夢の中で、{a}は温かな泥の中に沈んでいった。泥の奥で、ヒキガエルさまの舌がゆっくりと{a}を絡め取った。'),
yig:L('夢の中で、蛇の父の冷たい目が{a}を見つめていた。目を逸らせないまま、{a}の体は何十匹もの蛇の鱗に撫で回されていった。|夢の中で、{a}の脚は一本の蛇の尾に変わっていた。尾を絡め取られるたびに、{a}は蛇のように身をくねらせて喘いだ。'),
gatano:L('夢の中で、{a}は山の神の姿を見てはならないと分かっていた。目を閉じたまま、見えない手に体を開かれ、{a}はただ震えていた。|夢の中で、{a}の手足は石のように動かなくなった。動けない体の奥だけが、灰色の何かに撫でられて、生々しく脈打っていた。'),
nyogtha:L('夢の中で、{a}は底の見えない穴の縁に立っていた。穴から黒い粘りが這い上がってきて、{a}の脚を、腰を、ゆっくりと包み込んでいった。|夢の中で、{a}は穴の底に落ちていった。落ちながら、黒いものに体じゅうを撫でられ、底に着く前に何度も果てた。|夢の中で、穴の底から伸びた黒い腕が、{a}を抱き寄せた。冷たいのに、触れられたところだけが熱く疼いた。'),
glaaki:L('夢の中で、湖の底の主の棘が、{a}の肌をそっとなぞった。棘が触れたところから甘い毒が染み込み、{a}は湖の水の中で身をよじった。|夢の中で、{a}は湖の底の家の寝床に横たわっていた。水の重みとともに、何かが{a}の上にのしかかってきた。'),
rlyeh_child:L('夢の中で、{a}は浜辺の黒い岩に背を預けていた。岩の表面から蛇のような髪が伸びてきて、{a}の体を幾重にも絡め取った。|夢の中で、海底の黒い仔が{a}を抱き寄せた。冷たい腕の中で、{a}は潮が満ちるように昂っていった。|夢の中で、{a}は黒い円錐の岩の上に横たえられ、満ち潮に体を洗われていた。波が引くたびに、海の底の何かが{a}の肌を舐めていった。'),
rhan:L('夢の中で、{a}は氷室の氷の中に閉じ込められていた。凍えた体を、氷の中の神の長い指が一本ずつ解かし、解かされたところから熱が溢れた。|夢の中で、{a}は氷の床に横たえられていた。冷たさに震える体を、何本もの吸い口のある腕が包み込み、肌を吸い上げた。|夢の中で、氷が溶ける音が聞こえた。溶け出した何かが{a}にのしかかり、冷たいのに熱い交わりを、夜明けまで続けた。'),
chaugnar:L('夢の中で、象の神の鼻が{a}の肌をゆっくりと這い回った。吸いつかれた場所から、血と一緒に理性まで吸い取られていくようだった。|夢の中で、{a}は寺の本堂で仏像の膝に抱かれていた。冷たい青銅の腕が、生き物のように{a}の体を撫でた。'),
ghatanothoa2:L('夢の中で、{a}は月夜の森で、大きな角を持つ女神に見下ろされていた。女神の手が{a}の頬に触れると、{a}は鹿のように震えて膝をついた。|夢の中で、{a}の頭に鹿の角が生えていった。角が伸びるたびに、大鹿の女神の唇が{a}の肌を辿り、{a}は森の奥で何度も鳴いた。|夢の中で、大鹿の女神が{a}を胸に抱いた。獣の匂いと乳の匂いが混ざり合い、{a}は女神の腕の中で甘く果てた。'),
mordiggian:L('夢の中で、{a}は墓地の土の上に横たえられていた。屍を喰らう神の影が覆いかぶさり、冷たい息が{a}の首筋を這った。|夢の中で、{a}は死者として弔われていた。棺の中で、闇色の何かが{a}の体を丁寧に撫で、生きている証を確かめるように熱を灯した。|夢の中で、{a}の体は骨の一本一本まで神に味わわれていた。痛みはなく、ただ底のない快感だけが残った。'),
ygolonac:L('夢の中で、掌の口が{a}の耳元で、{a}の隠してきた願いを一つずつ読み上げた。読み上げられた願いは、その場で叶えられていった。|夢の中で、{a}は首のない巨体の膝の上にいた。両の掌の口に左右から肌を舐められ、{a}は恥ずかしい声を止められなかった。'),
hakuja:L('夢の中で、白い蛇の化身が{a}の枕元に座り、冷たい指で{a}の唇をなぞった。指が下へ降りていくたびに、{a}の体は熱を帯びた。|夢の中で、{a}は白い鱗の褥に沈んでいた。鱗が波打つたびに全身が撫でられ、{a}は息を乱した。'),
kubinashi:L('夢の中で、首のない地蔵が、{a}の枕元に並んでいた。石の手が一斉に伸びてきて、{a}の体のあちこちを、冷たく撫で回した。|夢の中で、{a}は欠け地蔵の膝に抱かれていた。首のない石の体は、ひやりと冷たいのに、触れられたところだけが熱く疼いた。|夢の中で、{a}は地蔵の首の代わりに祀られていた。供え物のように体を開かれ、見えない手に夜通し確かめられた。'),
kakashi:L('夢の中で、{a}は田んぼの真ん中で、人の服を着た案山子に抱きすくめられていた。藁の腕が{a}の肌を擦り、くすぐったさが熱に変わっていった。|夢の中で、案山子たちが{a}を取り囲み、藁の指で{a}の着物を一枚ずつ剥いでいった。そほどさまは、何もかも知っているように笑っていた。|夢の中で、{a}は案山子の一本足に縛りつけられていた。風が吹くたびに、藁の手が{a}の体を撫でた。'),
ryujin:L('夢の中で、{a}は雨乞いの供物として、竜の腕に抱かれていた。鱗に覆われた体が絡みつき、{a}の上に、ようやく雨が降りはじめた。|夢の中で、竜神の長い髭が{a}の肌を撫でた。雷鳴が轟くたびに、{a}の体は大きく跳ねた。|夢の中で、{a}は干からびた田んぼに横たえられていた。天から降りてきた竜が{a}を抱くと、乾いた土が一気に潤い、{a}もまた濡れていった。'),
mayu:L('夢の中で、{a}は巨大な繭の中に閉じ込められていた。絹の糸が肌を這い、少しずつ{a}を包み込みながら、体の隅々まで撫でていった。|夢の中で、白い蚕の群れが{a}の体の上を這い回った。柔らかな足の感触に、{a}は身をよじって声を漏らした。|夢の中で、蚕影様の白い手が{a}の肌に糸を巻きつけていった。巻かれるたびに、{a}の体はきつく締められ、甘く疼いた。'),
hanayome:L('夢の中で、{a}は白無垢の花嫁として、三三九度の盃を交わしていた。盃が空になると、顔のない婿が{a}の手を取り、床へと導いた。|夢の中で、祝言の歌が遠くで聞こえていた。{a}は角隠しの下で頬を染め、婿の手に身を委ねた。'),
ama:L('夢の中で、{a}は磯の岩場に寝かされていた。潮が満ちるたびに、冷たい手が何本も伸びてきて、{a}の肌を撫でた。|夢の中で、海女たちの歌が{a}を海の底へ誘った。息を止めた{a}の体を、白い指がゆっくりと開いていった。'),
mekura:L('夢の中で、{a}は目を洗う水に浸されていた。水が瞼を撫でるたびに、体のほかの場所も同じように撫でられているような気がした。|夢の中で、目洗い薬師の手が{a}の目を覆った。何も見えないまま、{a}は体の奥まで診られていった。'),
madara:L('夢の中で、{a}の肌に斑の模様が一つずつ浮かんでいった。斑が増えるたびに、そこは触れられるだけで声が漏れるほど敏感になった。|夢の中で、斑様の長い指が{a}の斑点を数えていた。数え終わるまで、{a}は解放されなかった。'),
quachil:L('夢の中で、{a}は塵の積もった部屋で、骨ばった手に抱き寄せられた。塵が舞うたびに、{a}の体は老いも若さも忘れて震えた。|夢の中で、時は一瞬も進まなかった。止まった時の中で、{a}は同じ快感を何度も味わわされた。'),
byatis:L('夢の中で、蛇髭の神が{a}の首筋に髭を絡めた。髭は生き物のように動き、{a}の肌を這い降りていった。|夢の中で、{a}は石の砦の奥の扉の前に立っていた。扉の向こうから伸びた髭に体を撫でられ、{a}は扉に手をかけそうになった。'),
imigui:L('夢の中で、喰様の大きな口が{a}の前で開いた。中は温かく、柔らかく、{a}は自分から体を差し出していた。|夢の中で、{a}の罪が一つずつ読み上げられ、読み上げられるたびに体のどこかを舐められた。罪の数だけ、{a}は果てた。'),
fuchi:L('夢の中で、淵の大君が{a}を水底の御殿に迎えた。冷たい水の中で、大君の腕は温かく、{a}は花嫁として抱かれた。|夢の中で、{a}は淵の渦に巻かれていた。渦の中心で、長い髭が{a}の体を何度も撫で上げた。'),
chibiki:L('夢の中で、{a}は千本の綱に引かれていた。綱が一本引かれるたびに、体の別の場所が引き寄せられ、{a}は荷台の上で身をよじった。|夢の中で、千曳牛の熱い息が{a}の肌にかかった。牛の重みにのしかかられ、{a}は息もできないまま揺さぶられた。'),
shijima:L('夢の中で、{a}は音のない部屋にいた。自分の鼓動さえ聞こえないのに、肌を撫でる手の感触だけが、異様に鮮明だった。|夢の中で、{a}の唇に白い指が当てられた。声を出すな、と。{a}は声を殺したまま、体だけを震わせ続けた。'),
akatsuchi:L('夢の中で、赤い土が{a}の肌に塗り込められていった。土の温もりが体の奥まで染み込み、{a}は土の中で静かに果てた。|夢の中で、{a}は赫土ノ命の掌の上に寝かされていた。大きな指が{a}の体を捏ねるように撫で、形を確かめていった。'),
hiruko:L('夢の中で、{a}は波打ち際に流れ着いていた。寄り恵比寿の柔らかな手が{a}を拾い上げ、濡れた体を隅々まで確かめていった。|夢の中で、{a}は流れ着いた供物として、浜の祠に寝かされていた。潮の満ちる音に合わせて、何かが{a}の上を這い回った。|夢の中で、骨のない柔らかな腕が、波に乗って{a}を抱きに来た。ぐにゃりとした感触に包まれ、{a}は潮の匂いの中で喘いだ。'),
kuchisake:L('夢の中で、口元を布で覆った誰かが、{a}の耳に囁いた。「わたし、きれい？」――答える前に、黒い歯が{a}の首筋を甘く噛んだ。|夢の中で、おはぐろさまの黒い唇が、{a}の体の上を這っていった。唇が触れたところに、黒い痕が花のように残った。|夢の中で、{a}は鉄漿の匂いに包まれていた。暗がりで笑う口に体じゅうを吸われ、{a}は逃げ場のない快感に震えた。'),
dorogami:L('夢の中で、{a}は黒い泥田に腰まで沈んでいた。泥の中で、何本もの手が{a}の脚を這い上がってきた。|夢の中で、沼田御前の泥の腕が{a}を抱き寄せた。ぬるりとした泥が肌を覆い、{a}の体は泥の中でとろけていった。|夢の中で、{a}は泥の褥に横たえられた。泥は生き物のように蠢き、{a}の体の窪みという窪みを満たしていった。'),
shinigami:L('夢の中で、{a}の枕元に迎え様が座っていた。冷たい手が{a}の頬を撫で、「まだ連れては行かない。今夜は、ただ」と囁いた。|夢の中で、{a}は門の向こう側に立っていた。迎えの手に体を委ねるたび、{a}は生と死の境目で甘く震えた。|夢の中で、数字が一つ減るごとに、迎え様の指が{a}の体の一か所に触れた。数字が尽きる前に、{a}は果てた。'),
tsuchigumo:L('夢の中で、{a}は地下の通路を這っていた。長い脛が後ろから{a}を抱え込み、湿った土の匂いの中で{a}を離さなかった。|夢の中で、八束脛様の糸が{a}の手足を縛り、体を宙に浮かせた。揺れるたびに、糸が肌に食い込み、甘く疼いた。'),
yatsume:L('夢の中で、八つの目が{a}をじっと見つめていた。見られているだけなのに、目の一つ一つに肌を撫でられているような感触があった。|夢の中で、{a}は戸板に描かれた八つの目に見下ろされながら、見えない手に体を開かれていった。|夢の中で、八つ目様の目が一つ瞬くたびに、{a}の体のどこかが熱く疼いた。八つ目が瞬き終えたとき、{a}は果てていた。'),
shiroi:L('夢の中で、林の白い人影が{a}の前に立っていた。背の高い影は身をかがめ、{a}を抱き上げると、林の奥へと連れていった。|夢の中で、物見様の長い腕が{a}の体を包み込んだ。見下ろされながら撫でられ、{a}は息を乱した。|夢の中で、白い人影は{a}の顔をじっと覗き込んでいた。覗き込まれたまま、体の奥を探られて、{a}は目を逸らせなかった。'),
tatari:L('夢の中で、荒れた祠の中から、御霊の手が次々と伸びてきた。恨みのこもった手なのに、{a}の体を撫でる手つきは、ひどく優しかった。|夢の中で、{a}は御霊を鎮める生贄として祠に寝かされていた。夜通し祟りの熱を体に受け、{a}は何度も果てた。|夢の中で、{a}の体に御霊が次々と宿っていった。宿られるたびに、知らない誰かの熱が体の奥で弾けた。'),
oshira:L('夢の中で、桑の木の人形が二体、{a}の両脇に寄り添っていた。布を何重にも着た人形の手が、{a}の体を左右から撫でた。|夢の中で、{a}はおしら様の布を一枚ずつ着せられていった。布が重なるたびに、その下の肌が熱く疼いた。|夢の中で、馬の顔をした人形が{a}を抱き寄せた。布越しに伝わる温もりに、{a}は身を委ねた。'),
kamikakushi:L('夢の中で、{a}は誰にも見つからない場所に隠されていた。隠し神の腕の中で、{a}は呼ばれる声も届かないまま、夜通し抱かれた。|夢の中で、{a}の姿は少しずつ消えていった。消えた場所から順に、見えない手に撫でられていった。|夢の中で、隠し神さまが{a}の耳元で囁いた。「ここにいれば、誰にも見つからない」――{a}は頷いて、その腕に身を沈めた。'),
kodama:L('夢の中で、{a}は御神木の幹に抱かれていた。樹皮が柔らかく肌に沿い、根が足元から{a}の体を這い上がってきた。|夢の中で、御神木の枝葉が{a}を包み込み、葉擦れの音とともに肌を撫でた。{a}は木霊の声に合わせて喘いだ。|夢の中で、{a}は大樹の洞に眠っていた。洞の内側から伸びた根が{a}を優しく、しつこく探っていった。'),
suiko:L('夢の中で、{a}は川の中で、毛むくじゃらの手に足首を掴まれた。引き込まれた水の中で、ひょうすべさまの手が{a}の体じゅうをくすぐり撫でた。|夢の中で、{a}はきゅうりの流れる川に浸かっていた。水の中から伸びる手に肌を撫でられ、{a}はくすぐったさと熱に笑いながら喘いだ。|夢の中で、兵主部様が{a}の背に覆いかぶさった。濡れた毛が肌を撫で、{a}は川の流れの中で震えた。'),
kurai:L('夢の中で、{a}は空の本殿に一人で座っていた。何もいないはずの空間から、見えない手が{a}の体に触れはじめた。|夢の中で、{a}自身が空宮の御神体として祀られていた。見えない参拝者たちに、代わる代わる体を撫でられた。|夢の中で、空の本殿の暗がりが{a}を包み込んだ。何もない闇に抱かれて、{a}は声を上げた。'),
tsuki:L('夢の中で、二十三夜の月が{a}を照らしていた。月の光が肌に触れるたびに、そこが撫でられたように熱くなった。|夢の中で、{a}は月待ちの宴の真ん中に横たえられていた。月が昇りきるまで、{a}は光の指に体を探られた。|夢の中で、月から降りてきた白い影が{a}を抱いた。冷たい光に包まれて、{a}は夜明けまで眠れなかった。'),
sekai:L('夢の中で、{a}は箱庭の中の小さな人形になっていた。大きな指が、人形の{a}の体を、一か所ずつ確かめるように撫でていった。|夢の中で、雛形様が{a}の人形を手に取った。人形の着物がはだけられると、{a}自身の着物もはだけた。|夢の中で、箱庭の中の村で、{a}の人形が誰かの人形と重ねられていた。目覚めたとき、体にはその感触が残っていた。')
};
Object.keys(DREAM_GOD_MORE).forEach(function(k){DREAM_GOD[k]=(DREAM_GOD[k]?[DREAM_GOD[k]]:[]).concat(DREAM_GOD_MORE[k]);});
Object.keys(DREAM_GOD).forEach(function(k){if(typeof DREAM_GOD[k]==='string')DREAM_GOD[k]=[DREAM_GOD[k]];});
var POSSESS=L('夜半、{x}が{y}の部屋に入ってきた。目が、{x}のものではなかった。「神さまに、捧げなきゃ」――{x}は{y}を押さえつけ、荒々しく体を重ねた。|{x}は虚ろな目のまま、{y}の上に跨った。{y}が名前を呼んでも、{x}は答えず、ただ腰を揺らし続けた。|{x}の口から、{x}のものではない祝詞が漏れていた。{x}は{y}の手首を布団に押さえつけ、取り憑いたものの熱に任せて体を重ねた。|{x}は{y}の耳元で、{x}の声ではない声で笑った。そのまま{y}の浴衣を剥ぎ、押さえつけたまま荒々しく体を重ねた。{y}が泣いて名前を呼んでも、取り憑いたものは{x}の体を止めなかった。|{x}の瞳は、行灯の光を映さなかった。{x}は{y}を布団に押し伏せ、祝詞を唱えるように低く呟きながら、何度も体を重ねた。{y}の声は、障子の外の虫の音にかき消された。');
var POSSESS_REV=L('夜半、{y}が{x}の部屋に入ってきた。目が、{y}のものではなかった。「神さまに、捧げなきゃ」――のしかかろうとする{y}の手首を、{x}は掴んで布団に組み伏せた。正気に引き戻すように、{x}は{y}を荒々しく抱いた。|虚ろな目の{y}が、{x}の布団に這い込んできた。{x}は{y}の両手首をひとまとめに押さえつけ、名前を呼び続けながら、{y}の体に神ではなく自分を刻み込んでいった。|取り憑かれた{y}が、虚ろな笑みで{x}の首に腕を回してきた。{x}はその手首を掴んで仰向けに倒し、正気に戻すように名前を呼びながら、主導権を渡さなかった。');
var YGO_SEX=L('{x}は{y}の髪を掴み、布団に押し伏せた。抑えていたものが、掌の口さまに引きずり出されていた。{y}が泣いても、{x}は止まらなかった。そして{y}も、どこかでそれを望んでいた。|{x}の掌の口が、{y}の肌を噛んだ。痛みと快楽の区別がつかなくなるまで、{x}は{y}を責め続けた。|{x}の掌に、うっすらと口のような裂け目が浮かんでいた。その掌に肌を撫でられるたび、{y}の隠してきた欲が暴かれ、{x}の荒々しさに溶かされていった。');
var STREAM_LEAK=L('――翌朝、{s}はスマホを見て青ざめた。配信は、切れていなかった。部屋の隅に置いたままのカメラが、夜通し二人を映し続けていた。同時接続は、過去最高の数字を記録していた。|――{s}の配信は、ずっと点いたままだった。コメント欄は「\u2060え」「\u2060待って」「\u2060これ大丈夫？」で埋まり、やがて「\u2060保存した」「\u2060切り抜き班はよ」が並んだ。|――翌朝、{s}のチャンネルには見たことのない数の通知が届いていた。切り抜きが、もう出回っていた。{o}は、しばらく{s}と目を合わせようとしなかった。|――{s}の胸元のアクションカメラは、赤いランプを点けたまま、一部始終を配信し続けていた。{s}がそれに気づいたのは、すべてが終わったあとだった。');
var HAME=L('村人は、枕元に転がっていた{a}のカメラを拾い上げ、レンズを{a}に向けた。「\u2060いつもこれで撮ってるんだろ」――{a}の乱れた姿は、{a}自身の機材で、余すところなく記録された。|村人の一人が、{a}の自撮り棒にスマホを付けて、ずっと撮り続けていた。「\u2060撮れ高ってやつだ」――村人たちは笑った。|事が済むと、村人は{a}のスマホを取り上げ、撮ったばかりの動画を{a}の配信アカウントに上げようとした。{a}は泣きながら、それを止めた。|村人は{a}のカメラを三脚に据え、録画の赤いランプが点いたのを確かめてから、{a}にのしかかった。「\u2060祭りの記録だ。神さまにも見せねばならん」');
function streamAfter(S,p,o,recv){
var rng=S.rng;
if(recv&&rng()<0.5){p.m.fear=Math.min(100,p.m.fear+10);p.hame=true;ST.say(S,{actors:[p],tag:'ハメ撮り',text:ST.fmt(fp(S,HAME),{a:p.name}),why:p.name+'（配信者）は、自分の機材で村人に撮られてしまった（恐怖 +10）',mag:22});return;}
if(rng()<0.4){p.leak=true;ST.say(S,{actors:[p],tag:'配信事故',text:ST.fmt(fp(S,STREAM_LEAK),{s:p.name,o:o}),why:p.name+'（配信者）は配信を切り忘れていた',mag:22});}
}
var PRANK=L('夜這いに来た村人を、{a}は「仕掛け人さん、体張りますねえ」と笑って迎え入れた。それがドッキリでないと気づいたのは、奥まで貫かれてからだった。|{a}は「これ、誰の仕込み？」と囁きながら、村人に身を任せた。仕掛け人は、どこにもいなかった。|{a}は「カメラどこ？」と部屋を見回しながら、村人を布団に招き入れた。カメラは、どこにもなかった。|{a}は布団に入ってきた村人に「台本ある？」と小声で聞いた。返事の代わりに帯が解かれ、{a}はそのまま、台本のない夜に呑まれていった。|{a}は「リアクション、大きめでいい？」と笑って村人の首に腕を回した。大げさな声は、途中から演技ではなくなっていた。|{a}は襖の隙間に向かってピースをしてから、村人を布団に招き入れた。隙間の向こうには、誰もいなかった。');
var CAVE=L('洞窟の暗がりから、ぬめった触手が伸びてきて、{a}の脚に絡みついた。触手は衣服の下に潜り込み、{a}の奥へ入り込んだ。{a}は仲間の前で、声を抑えることもできずに達した。|洞窟の壁から、{g}の眷属が湧き出し、{a}を押し倒した。仲間が引き剥がすまでの短いあいだに、{a}の中には、何かが注ぎ込まれていた。|洞窟の水たまりに足を取られた{a}の体を、生温かい粘液が包み込んだ。粘液は{a}の肌を舐め回し、{a}は膝から崩れ落ちて、甘い声を上げた。|洞窟の天井から、黒い滴がぽたりと{a}の首筋に落ちた。滴は肌の上で形を変え、細い指のように襟の中へ潜り込んでいった。{a}は岩壁に縋りついたまま、声を殺しきれずに崩れ落ちた。|暗がりで{a}の足首を掴んだのは、冷たい鱗の手だった。{a}は岩場に引き倒され、仲間の灯りが届かない窪みへ引きずり込まれた。灯りが戻ってきたとき、{a}は濡れた岩の上で、焦点の合わない目をしていた。|洞窟の奥の苔が、{a}の体の形に沈み込んだ。苔は生き物のように脈打ち、{a}の肌を舐めるように這い上がってきた。{a}は苔の褥に縫いとめられたまま、何度も甘い声を上げさせられた。|壁に刻まれた{g}の紋が、{a}が触れた瞬間に赤く光った。体の奥に、見えない何かが入り込んでくる感覚があった。{a}は膝をつき、仲間の名前を呼ぼうとして、別の声を上げた。|湿った闇の中で、無数の細い触手が{a}の手足に絡みついた。触手は{a}の体を宙に持ち上げ、ゆっくりと開いていった。仲間が松明を振り回して追い払うまで、{a}は何度も宙で体を跳ねさせた。');
var RITUAL_TOP=L('{a}は白い薄衣を着せられ、祭壇の前に引き出された。祭壇の奥から這い寄ってきた人ではないものを、{a}は素手で掴み返し、逆に祭壇の上へ組み伏せた。村人たちの祝詞が、悲鳴に変わった。|{a}の脚に、祭壇の奥から伸びてきた冷たいものが絡みつこうとした。{a}はそれを掴んで引きずり出し、{g}の御前で、それが震えて動かなくなるまで責め立てた。|村人たちは{a}を祭壇に押さえつけようとしたが、{a}は一人を蹴り倒し、もう一人の腕を捻り上げた。{g}の御前で、{a}は最後まで、誰にも膝をつかなかった。|祭壇の上で{a}の手首を押さえようとした村人の腕を、{a}は逆に捻り上げた。祭壇の奥から伸びてきたものさえ、{a}は掴んで引き寄せ、{g}の御前で組み伏せた。祝詞は途中で途切れ、篝火だけがぱちぱちと鳴っていた。|{a}は差し出された盃を祭壇に叩きつけた。闇の奥から這い寄ってきた冷たい腕を、{a}は膝で押さえつけ、逆にそれが震えて縮こまるまで責め立てた。村人たちは、誰一人として祭壇に近づけなかった。');
var MIKO=L('――夜が明けたとき、{a}の腹は大きく膨らんでいた。村人たちはひれ伏して言った。「巫女さまが、神の御子を宿された」{a}はもう二度と、村の外へ出ることはない。|――{a}は神の子を産む巫女として、神社の奥の間に迎えられた。{a}は虚ろな目で、膨らんだ腹を愛おしげに撫でていた。|――{a}の体に注がれたものは、{a}の中で育ち始めた。村は新しい巫女を得て、歓喜の歌に包まれた。|――{a}の下腹には、昨夜までなかった紋様が、心臓のように脈打っていた。村の女たちは{a}に白い着物を着せ、二度と山道へは出さなかった。|――{a}は社の奥で目を覚ました。腹の奥で、何かがゆっくりと寝返りを打った。障子の外では、村人たちが新しい巫女を讃える歌を歌っていた。|――翌朝、{a}の瞳は{g}と同じ色に濁っていた。{a}は膨らんだ腹を抱え、村人たちに微笑みかけた。その笑みは、もう{a}のものではなかった。');
var JP={
proud:{
drug:L('{a}は熱を帯びた体を「気のせいだ」と言い張り、平然を装って膳の残りを片づけた。拳を握った指先だけが、小刻みに震えていた。|{a}は火照る頬を誰にも見せまいと、ひとり縁側に出て夜風を浴びた。疼きは、少しも引かなかった。|「たかが酒だ」――{a}はそう吐き捨てて立ち上がり、膝が笑うのを隠して部屋へ戻った。'),
react:L('{a}は相手を睨みつけ、最後まで噛みつこうとした。睨む目が潤んでいくのを、自分ではどうにもできなかった。|{a}は「覚えてろ」と低く唸った。その声さえ、次の瞬間には甘く裏返った。|{a}は屈するものかと奥歯を噛みしめた。媚薬の熱は、その意地ごと溶かしていった。'),
rite:L('祭壇の上でも、{a}は村人たちを睨み据えていた。その気丈さが崩れるのを、村人たちは祝詞を唱えながら待っていた。|{a}は縛られた手を何度も引いた。逃げられないと悟ってもなお、{a}は顔を上げ続けた。|{a}は神の気配に向かって「来るなら来い」と吐き捨てた。返ってきたのは、体の奥を満たす熱だった。'),
after:L('朝、{a}は何事もなかったように身支度を整えた。首筋の痕だけは、襟を立てて隠していた。|{a}は誰とも目を合わせず、黙々と朝餉をかき込んだ。箸を握る手に、昨夜の悔しさが残っていた。|{a}は鏡の前で自分の顔を睨み、「次は、ない」と呟いた。'),
mutual:L('翌朝、{a}は「昨夜のことは忘れろ」とそっけなく言った。言ったわりに、相手の隣から離れなかった。|{a}は相手の寝顔を見下ろし、乱れた前髪を乱暴に払ってやった。手つきは、言葉ほど乱暴ではなかった。|{a}は「薬のせいだからな」と念を押した。耳まで赤かった。')
},
stern:{
drug:L('{a}は体の異変に気づくと、正座のまま背筋を伸ばし、呼吸を数えて熱をやり過ごそうとした。|{a}は「乱れるな」と自分に言い聞かせ、冷水で何度も顔を洗った。|{a}は熱に浮かされながらも、皆に「今夜は部屋から出るな」と言い渡した。自分の声が掠れているのに、気づかないふりをした。'),
react:L('{a}は声を殺し、唇を真一文字に結んで耐えた。乱れた息だけが、規律の外へ零れていった。|{a}は「恥を知れ」と叱りつけた。叱る声の途中で、体のほうが先に屈した。|{a}は目を閉じ、自分を律する言葉を胸の中で繰り返した。繰り返すたびに、言葉は意味を失っていった。'),
rite:L('{a}は祭壇の上で、背筋だけは伸ばしたままでいようとした。村人たちの手が、その背を少しずつしならせていった。|{a}は祝詞の文句を聞き分け、儀式の段取りを冷静に見極めようとした。見極めるより先に、体が儀式に応えていた。|{a}は最後まで声を上げまいとした。堪えた声は、体の震えになって祭壇を軋ませた。'),
after:L('朝、{a}は乱れた布団をきちんと畳み直してから部屋を出た。几帳面な手つきが、かえって痛々しかった。|{a}は朝の顔合わせで、いつも通りの声で皆の名を呼んだ。一度だけ、言葉が詰まった。|{a}は昨夜のことを手帳に書きかけて、頁ごと破り捨てた。'),
mutual:L('翌朝、{a}は相手の浴衣の襟を正してやりながら、「けじめはつける」と真顔で言った。|{a}は「軽率だった」と頭を下げかけ、相手に止められて、珍しく照れたように笑った。|{a}は相手の手を取り、何も言わずに強く握った。それが{a}なりの返事だった。')
},
tsun:{
drug:L('「べ、別に熱くなんかないし」――{a}はそう言いながら、何度も浴衣の衿をぱたぱたとあおいだ。|{a}は誰かに顔を見られるたび「見ないでよ」と怒った。怒るたびに、頬はますます赤くなった。|{a}は「先に寝る」とそっぽを向いて部屋に戻り、布団の中で疼く体を抱えて丸くなった。'),
react:L('{a}は「さわんないでよ」と言い張った。言葉とは裏腹に、伸ばした手は相手の袖を掴んでいた。|{a}は顔を真っ赤にして「ばか」と繰り返した。繰り返すたびに、声は甘く崩れていった。|{a}は意地でも声を出すまいとして、枕に顔を押しつけた。くぐもった声は、隠しようもなかった。'),
rite:L('{a}は祭壇の上で「こんなの、ぜんぜん平気なんだから」と強がった。強がりは、最初の祝詞が終わる前に崩れた。|{a}は泣きそうな顔で村人たちを睨んだ。睨む目の端から、涙が一粒こぼれた。|{a}は唇を噛んで顔を背けた。背けた先にも、神の気配が満ちていた。'),
after:L('朝、{a}は「何もなかった」と言い張り、誰よりも早く朝餉の席に着いた。箸を持つ手が、少し震えていた。|{a}は鏡を見て、首の痕に悲鳴を上げた。それから黙って、絆創膏を三枚重ねて貼った。|{a}は一日じゅう、誰かに話しかけられるたびにびくりと肩を跳ねさせた。'),
mutual:L('翌朝、{a}は「勘違いしないでよね、薬のせいなんだから」と言った。言いながら、相手の小指をこっそり握っていた。|{a}は相手の顔を見るなり真っ赤になって布団をかぶり、「おはよう」だけは小さな声で返した。|{a}は「次は、薬なしで……」と言いかけて、慌てて口を塞いだ。')
},
gentle:{
drug:L('{a}は自分の火照りより先に、具合の悪そうな仲間の額に手を当てて回った。|{a}は「少し、体が熱いみたい」と困ったように笑い、窓を開けて夜風を入れた。|{a}は熱に戸惑いながらも、皆に水を配り、「今夜は早く休もうね」と声をかけた。'),
react:L('{a}は相手を押し返そうとした手を、途中で止めてしまった。拒むことに、慣れていなかった。|{a}は涙を浮かべながら、それでも「乱暴にしないで」とだけ、静かに頼んだ。|{a}は戸惑いの中で、ただ相手の肩にしがみつくことしかできなかった。'),
rite:L('{a}は祭壇の上で、怯える仲間たちのほうを見て「見なくていいよ」と囁いた。囁く声が、やがて喘ぎに変わった。|{a}は神の気配を拒みきれず、包み込まれるように身を委ねていった。|{a}は祝詞を聞きながら、静かに目を閉じた。閉じた瞼の裏で、熱がゆっくりと広がっていった。'),
after:L('朝、{a}は何も言わずに台所に立ち、皆の分の朝餉を作った。いつも通りの笑顔が、少しだけ硬かった。|{a}は「心配かけてごめんね」と皆に謝った。謝る理由など、どこにもなかった。|{a}は縁側でぼんやりと山を眺めていた。声をかけられると、ゆっくりと振り向いて微笑んだ。'),
mutual:L('翌朝、{a}は相手の寝癖を指で直しながら、「おはよう」と柔らかく笑った。|{a}は相手の分のお茶を淹れて、そっと枕元に置いた。|{a}は「怖い夜だったけど、ひとりじゃなくてよかった」と、相手の手を握った。')
},
devoted:{
drug:L('{a}は体の異変を隠して、皆の布団を敷いて回った。誰かの役に立っていれば、熱を忘れられる気がした。|{a}は「私は大丈夫です」と繰り返した。大丈夫ではないことは、潤んだ目が語っていた。|{a}は熱に耐えながら、仲間の水差しに水を足しに行った。廊下の柱にもたれて、しばらく動けなかった。'),
react:L('{a}は「私が我慢すれば、皆は無事でいられる」と自分に言い聞かせ、抵抗をやめた。|{a}は泣きながら、それでも相手の機嫌を損ねまいと、身を硬くして耐えた。|{a}は誰かの名前を呼びかけて、口をつぐんだ。助けを求めれば、その人が危ない目に遭う。'),
rite:L('{a}は祭壇の上で、「私でよければ」と目を閉じた。差し出された体は、震えていた。|{a}は仲間の身代わりになれるならと、自分から薄衣の帯を解いた。|{a}は祝詞に合わせて、祈るように指を組んだ。祈りは、途中で甘い声にかき消された。'),
after:L('朝、{a}は誰よりも早く起きて、皆の朝餉の支度をしていた。手首の痕は、袖で隠していた。|{a}は「皆さんが無事でよかったです」と微笑んだ。自分のことは、何も話さなかった。|{a}は一人で井戸端に立ち、何度も何度も手を洗っていた。'),
mutual:L('翌朝、{a}は相手の浴衣を丁寧に畳み、「ありがとうございました」と深く頭を下げた。|{a}は相手のために水を汲んできて、「無理をさせてしまって」と申し訳なさそうに笑った。|{a}は相手の背中の引っかき傷を見つけて、真っ赤になって薬を塗った。')
},
cool:{
drug:L('{a}は自分の脈を測り、「何か盛られた」と淡々と告げた。告げる声だけが、わずかに上ずっていた。|{a}は熱の原因を推理しようとしたが、思考がまとまらないことに気づいて、黙って部屋の鍵を閉めた。|{a}は膳の残りを小瓶に取り分けてから、ふらつく足で部屋へ戻った。'),
react:L('{a}は相手の手の動きを冷静に観察しようとした。観察するほど、体は正直に反応した。|{a}は「無意味だ」と短く言った。その後に続いたのは、言葉ではなかった。|{a}は表情一つ変えまいとした。紅潮した頬と乱れた息が、無表情を裏切っていた。'),
rite:L('{a}は祭壇の上で、儀式の手順と村人の数を頭の中で数えていた。数は、途中から分からなくなった。|{a}は神の気配を「ただの幻覚だ」と分析しようとした。幻覚にしては、体の奥の熱が生々しすぎた。|{a}は最後まで目を開けていた。見届けることが、{a}に残された抵抗だった。'),
after:L('朝、{a}は昨夜の出来事を手短に報告した。自分の身に起きたことは、「特記事項なし」で済ませた。|{a}は冷めた茶をすすりながら、窓の外を見ていた。湯呑みを持つ指先だけが、白くなっていた。|{a}は昨夜の村人の顔と人数を、黙って手帳に書き留めた。'),
mutual:L('翌朝、{a}は「合理的な判断だった」と言った。相手が笑うと、{a}は少しだけ目を逸らした。|{a}は相手の脈を測り、「異常なし」と頷いた。手は、しばらく離れなかった。|{a}は「次の夜も、同じ部屋のほうが安全だ」と提案した。理由は、それだけではなさそうだった。')
},
free:{
drug:L('{a}は「なんか体ぽかぽかするー」と笑い、浴衣の袖をまくり上げた。笑い声が、どこか上ずっていた。|{a}は熱に浮かされたまま、廊下を裸足で歩き回った。夜風が肌を撫でるたびに、小さく声を漏らした。|{a}は「これ、絶対なんか入ってるよね」と面白がりながら、もう一杯おかわりした。'),
react:L('{a}は最初こそ笑い飛ばそうとした。笑い声は、すぐに甘い悲鳴に変わった。|{a}は「ちょっと、強引すぎ」と軽口を叩いた。軽口の続きは、喘ぎにかき消された。|{a}は抵抗するより先に、体の熱に身を任せてしまった。後悔は、朝まで来なかった。'),
rite:L('{a}は祭壇の上で「派手なお祭りだね」と笑ってみせた。笑みは、神の気配が触れた瞬間に凍りついた。|{a}は薄衣の裾をわざとひらつかせ、村人たちを挑発した。挑発の代償は、夜明けまで続いた。|{a}は怖いのか気持ちいいのか分からないまま、声を上げ続けた。'),
after:L('朝、{a}は「すっごい夜だった」と笑い話にしようとした。誰も笑わなかったので、{a}も黙った。|{a}は寝不足の顔であくびをし、「今日は昼寝する」と宣言した。目の下の隈は、隠しきれなかった。|{a}は首の痕を指でなぞり、「消えるかな、これ」と小さく呟いた。'),
mutual:L('翌朝、{a}は相手の背中に飛びついて「おはよ！」と笑った。|{a}は「薬、まだ残ってたらどうしよっか」と悪戯っぽく笑った。|{a}は相手の浴衣を勝手に羽織って、朝餉の席に現れた。')
},
shy:{
drug:L('{a}は火照る顔を両手で覆い、誰にも気づかれないよう部屋の隅で小さくなっていた。|{a}は浴衣の擦れる感触にさえ声を漏らしそうになり、慌てて口を押さえた。|{a}は「お手洗いに」と小さく言って席を立ち、そのまま戻ってこなかった。'),
react:L('{a}は声も出せずに、ただ布団の端を握りしめていた。|{a}は見られるのが恥ずかしくて、両腕で顔を隠した。隠せたのは、顔だけだった。|{a}の拒む声は、蚊の鳴くように小さかった。誰の耳にも届かなかった。'),
rite:L('{a}は祭壇の上で、薄衣を胸元にかき寄せて震えていた。村人たちの視線が、何より怖かった。|{a}は目を固く閉じた。見なければ、何もなかったことにできる気がした。|{a}は声を出すまいと唇を噛んだ。漏れた声に、自分がいちばん驚いていた。'),
after:L('朝、{a}は布団から出てこなかった。声をかけられると、布団の中で小さく首を振った。|{a}は誰とも目を合わせられず、朝餉の箸をほとんど動かさなかった。|{a}は耳まで赤くしたまま、昨夜のことを一言も口にしなかった。'),
mutual:L('翌朝、{a}は相手と目が合った瞬間に真っ赤になって、布団に潜り込んだ。|{a}は消え入りそうな声で「……おはよう」と言った。それだけで精一杯だった。|{a}は相手の浴衣の袖を、そっとつまんで離さなかった。')
},
polite:{
drug:L('{a}は「少々、失礼いたします」と丁寧に頭を下げ、乱れかけた浴衣の衿を正して席を外した。|{a}は熱に浮かされながらも、膳を下げに来た女中に「ごちそうさまでした」と礼を言った。|{a}は「お見苦しいところを」と詫び、震える指で扇子を広げて顔をあおいだ。'),
react:L('{a}は「お、おやめください」と最後まで丁寧に頼んだ。丁寧な言葉は、途中から言葉にならなくなった。|{a}は乱れまいと居住まいを正そうとしたが、押さえつけられてそれも叶わなかった。|{a}は「どうか、お手柔らかに」と震える声で言った。相手は笑って、聞き入れなかった。'),
rite:L('{a}は祭壇の上で、村の長老に「どうか、皆さまだけは」と頭を下げた。返事は、祝詞だけだった。|{a}は神前の作法を崩すまいと、薄衣の膝をきちんと揃えていた。揃えた膝は、すぐに割り開かれた。|{a}は最後まで、神に向かって敬語で語りかけていた。'),
after:L('朝、{a}は皆に「ご心配をおかけしました」と深々と頭を下げた。顔を上げたとき、目が赤かった。|{a}は乱れた部屋を丁寧に片づけ、女将に「お世話になりました」と礼を言った。声が、かすかに震えていた。|{a}は朝餉の席で、いつもより少しだけ遠い席に座った。'),
mutual:L('翌朝、{a}は三つ指をついて「昨夜は、はしたないところを」と頭を下げた。相手は慌てて、その手を取った。|{a}は相手の帯を結び直しながら、「お慕いしております」と小さく言った。|{a}は「今後とも、どうぞよろしくお願いいたします」と微笑んだ。どこか、くすぐったそうだった。')
}
};
var LIGHT_RE= /笑い飛ば|軽口|面白が|からか|冗談/;
var FORCE_REACT=L('{a}は声を殺して、ただ終わるのを待った。|{a}は天井の木目を数えながら、心だけを遠くへ逃がした。|{a}は唇を噛み、相手の顔を見ないようにした。');
function pz(S,p,k,force){
var t=JP[(HK.personaOf?HK.personaOf(p):p.persona)||'gentle']||JP.gentle,arr=t[k];
if(force&&arr){arr=arr.filter(function(x){return!LIGHT_RE.test(x);});if(!arr.length)arr=FORCE_REACT;}
return arr?ST.fmt(fp(S,arr),{a:p.name,g:S.G?S.G.call:''}):'';
}
function lwEro(S){return!!(HK.Lewd&&HK.Lewd.storyEro&&HK.Lewd.FORCE&&HK.Lewd.forceFill&&HK.Lewd.storyEro(S));}
function lwShort(S){return!!(HK.Lewd&&HK.Lewd.storyShort&&HK.Lewd.storyShort(S));}
function lwHi(S){return!!(HK.Lewd&&HK.Lewd.high&& !HK.SAFE_ON&&HK.Lewd.high(S.env));}
function lwSep(S){return HK.R18Thick&&HK.R18Thick.on(S)?'\n\n':'';}
function jLong(S,p){return!lwEro(S)&& !!(HK.JDark&&HK.JDark.roll(S,p));}
var ERO_IN={
yobai:L('夜半、{a}の部屋の襖が音もなく開いた。酒臭い息を吐く村の男が、にやにやと笑いながら布団の脇に膝をついた。男の目は、寝間着の合わせからのぞく{a}の肌を舐めるように這っていた。「＠よそから来た人の体は、神さまがお喜びになる」|'+
'{a}が寝入りかけたとき、布団の両側から何本もの手が伸びてきた。口を塞がれ、手首と足首を一本ずつ押さえ込まれる。行灯の明かりに浮かんだのは、昼間に愛想よく挨拶してきた村の男たちの顔だった。「＠祭りの前の、味見じゃ」|'+
'寝苦しさに目を覚ますと、{a}の上に知らない男が馬乗りになっていた。男は太い指で{a}の寝間着の帯をほどき、はだけた肌に顔を寄せて匂いを嗅いだ。「＠ええ匂いじゃ。声を出しなさんな」――廊下の暗がりで、順番を待つ気配がいくつも動いていた。'),
bath:L('{a}は女将に勧められ、清めの湯の戸を開けた。湯気の向こうでは、褌一枚の村の若い衆が三人、にやにやと笑って待っていた。逃げようとした{a}の腕を掴み、男たちは湯の中へ引きずり込んだ。「＠清めは隅々まで、が村の決まりでな」|'+
'白く濁った湯は、甘ったるい匂いがした。湯に浸かった{a}の背後に、いつの間にか若い衆がぴたりと身を寄せていた。湯の中で何本もの手が、{a}の体じゅうを這い回りはじめる。|'+
'湯殿の灯りが消え、戸の外で閂の落ちる音がした。闇の中で、濡れた手が{a}の肩を掴み、湯殿の縁に押しつける。「＠暴れなさんな。清めが終わらん」――耳元の声は、一人ではなかった。'),
ritual:L('{a}は白い薄衣一枚で祭壇に横たえられた。篝火に透けた薄衣の下を、村人たちが舌なめずりしながら覗き込む。祝詞が始まると、何本もの手が一斉に{a}の手足を祭壇に押さえつけた。「＠神さまの前じゃ。たんと鳴いてもらうぞ」|'+
'祭壇の周りに、面をつけた村人たちが輪になって座っていた。{a}の薄衣は作法どおりに一枚ずつ剥がされ、篝火の前にさらされていく。油を塗り込める掌が、胸から腹へ、腹から脚のあいだへと遠慮なく降りていった。|'+
'祝詞が最高潮に高まると、村の長が{a}の脚を左右に押し開いた。「＠まずは村の者で、神さまの器を清める」――押さえつける手に力がこもり、{a}がどれだけもがいても、祭壇の上から逃れることはできなかった。'),
dream:L('眠りに落ちたはずなのに、{a}は社の床に横たわっていた。御簾の向こうから、{g}の気配がゆっくりと這い寄ってくる。逃げようとしても、夢の中の手足は鉛のように重かった。|'+
'夢の中で、{a}は祭壇の上に裸で横たえられていた。闇の奥から、{g}が{a}の名を呼んだ。呼ばれるたびに、肌の内側が勝手に熱を帯びていった。|'+
'夢の底で、冷たい水のようなものが{a}の足首を掴んだ。それは脚を這い上がり、寝間着の裾を割って潜り込んでくる。頭の中で、{g}の笑い声が響いた。'),
cave:L('松明の火がふっと揺れて消えた。闇の中で、ぬめった触手が{a}の足首に絡みつき、そのまま岩場へ引き倒す。衣の裾から潜り込んだ何本もの触手が、肌の上を這い上がってきた。|'+
'洞窟の壁から、{g}の眷属が湧き出すように這い出してきた。冷たく脈打つ触手が{a}の手首と足首を絡め取り、岩の上に大の字に縫いとめる。仲間の灯りは、もう届かなかった。|'+
'水たまりに足を取られた{a}の体を、生温かい粘液がずるりと包み込んだ。粘液の中から細い触手が無数に伸び、服の隙間という隙間に潜り込んでくる。{a}の悲鳴は、洞窟の奥へ吸い込まれていった。')
};
var ERO_BODY={
yobai:{
f:L('男は{a}の寝間着を引き裂き、こぼれ出た{胸}を鷲掴みにした。{乳首}を指で捻り上げながら、閉じようとする膝を力ずくで割り開く。{a}「{v0}」――男は濡れてもいない{女性器}に{男性器}を押し当て、体重をかけて一気にねじ込んだ。{s:hit}。奥まで貫かれて、{a}の背中が布団の上で弓なりに反った。|'+
'村の男たちは{a}を四つん這いにさせ、二人がかりで両腕を押さえつけた。後ろから{女性器}に{亀頭}をあてがった男が、ずぶずぶと根元まで沈めてくる。{s:hit}。{a}「{v1}」――打ちつけられるたびに{胸}が揺れ、前に回った別の男の手がそれを乱暴に揉みしだいた。|'+
'男は{a}の脚を肩に担ぎ上げ、真上から押し潰すように{男性器}を叩きつけた。{s:hit}。{xm}――肌を打つ音が、静まり返った民宿に響く。{a}「{v1}」――障子の向こうでは、次の男が帯を解きながら順番を待っていた。'),
m:L('男は{a}をうつ伏せに押さえつけ、寝間着の裾を腰までまくり上げた。唾で濡らした指を{後ろ}にねじ込み、乱暴に掻き回して押し広げる。{a}「{v0}」――指が抜かれた次の瞬間、熱く硬い{男性器}が一息に押し入ってきた。{s:hit}。{a}は布団に爪を立て、内側から押し広げられる圧迫に喘いだ。|'+
'村の男たちは{a}の両腕を押さえつけ、腰だけを高く引き上げた。{尻}を割り開かれ、{後ろ}にぬめった{亀頭}がぐりぐりと押しつけられる。{s:hit}。{a}「{v1}」――根元まで埋め込まれたまま揺さぶられ、{a}の膝はがくがくと笑いはじめた。|'+
'男は{a}を壁際に追い詰め、背後から腰を抱え込んだ。逃げようとする{尻}を両手で鷲掴みにし、{後ろ}へ{男性器}を一気に突き立てる。{s:hit}。{xm}――前に回った別の男の手が{a}の{男性器}を握り込み、突き上げに合わせて無理やり扱き上げた。{a}「{v1}」')
},
bath:{
f:L('湯の中で、若い衆の手が{a}の{胸}を後ろから掬い上げた。別の手が脚のあいだに潜り込み、{陰核}を指先で執拗に転がす。{a}「{v0}」――湯殿の縁に押しつけられた{a}の{女性器}に、男の{男性器}が湯ごと押し入ってきた。{s:hit}。波打つ湯が、突かれるたびに縁を越えて溢れた。|'+
'若い衆は{a}を洗い場の簀の子に横たえ、石鹸の泡を塗りたくった。ぬるついた指が{ナカ}にずぷりと沈み、泡ごと掻き回す。{s:wet}。{a}「{v1}」――指が抜かれると、今度は{男性器}が根元まで押し込まれた。泡と{愛液}の混じった音が、湯殿じゅうに響いた。|'+
'{a}は湯の中で男の膝の上に抱え上げられ、下から{男性器}を突き立てられた。{s:hit}。{xm}――男が腰を揺するたびに湯が波立ち、{a}の体は浮き沈みしながら奥を抉られる。{a}「{v1}」――湯殿の縁では、残りの若い衆がにやにやとそれを眺めていた。'),
m:L('若い衆は{a}を湯殿の縁にうつ伏せに押しつけ、{尻}を湯の上に突き出させた。泡まみれの指が{後ろ}にねじ込まれ、ぐちゅぐちゅと音を立てて掻き回す。{a}「{v0}」――指の代わりに押し当てられた{男性器}が、ずぶりと奥まで沈んだ。{s:hit}。湯殿の縁を掴む{a}の指が、白くなっていた。|'+
'{a}は湯の中で後ろから抱え込まれ、男の膝の上に座らされた。湯の浮力で腰が浮くたびに、下から{男性器}が{後ろ}へ突き上げてくる。{s:hit}。{a}「{v1}」――前に回った別の手が、湯の中で{a}の{男性器}を握って扱き上げた。|'+
'洗い場の簀の子に押さえつけられた{a}の{乳首}を、若い衆の指が泡ごと捏ね回した。{s:wet}。{xm}――脚を開かされたまま、{後ろ}を太い{男性器}で何度も抉られる。{a}「{v1}」――湯気の向こうで、次の男が桶の湯を浴びて待っていた。')
},
dream:{
f:L('夢の中で、{g}の気配が{a}の体にのしかかった。見えない手が{胸}を揉みしだき、{乳首}を摘まんでは引っ張る。{a}「{v0}」――脚のあいだに、熱く脈打つ何かが押し当てられた。神のそれは、{a}の{ナカ}を押し広げながら、ありえない深さまで沈んでいった。{s:hit}。|'+
'夢の底で、{a}は社の床に縫いとめられていた。御簾の向こうから伸びた何本もの冷たい指が、{女性器}を左右に押し開く。{s:wet}。{a}「{v1}」――指の代わりに入り込んできたのは、人のものではない太さの何かだった。神に貫かれるたびに、{a}の腰は夢の中で勝手に跳ねた。|'+
'夢の中で、水のような何かが{a}の体を包み込んだ。それは{陰核}に吸いつき、{ナカ}の奥へ奥へと流れ込んでくる。{s:wet}。{a}「{v1}」――神の声が頭の中で響くたびに、内側から掻き回される快感が強くなった。逃げようにも、夢の中の体は少しも言うことをきかなかった。'),
m:L('夢の中で、{g}の気配が{a}を床にうつ伏せに押さえつけた。見えない手が{尻}を割り開き、冷たいものが{後ろ}をなぞる。{a}「{v0}」――次の瞬間、熱く脈打つ何かが、ずぶずぶと{a}の奥へ沈み込んできた。神のそれは、人の体ではありえない深さまで届いた。{s:hit}。|'+
'夢の底で、何本もの冷たい指が{a}の手足を絡め取った。一本が{男性器}に巻きつき、根元から先までゆっくりと扱き上げる。{s:wet}。{a}「{v1}」――同時に{後ろ}をこじ開けて入り込んできたものが、内側の弱いところを容赦なく抉った。神に弄ばれる体は、夢の中で何度も跳ねた。|'+
'夢の中で、{a}は祭壇の上に仰向けにされていた。闇から伸びたものが{乳首}を吸い、{男性器}を咥え込むように包み込む。{s:suck}。{a}「{v1}」――神の囁きが耳の奥で響くたびに、{a}の奥に入り込んだものがどくんと脈打った。')
},
cave:{
f:L('触手は{a}の両脚に絡みついて大きく開かせ、{女性器}の割れ目をぬるぬるとなぞり上げた。別の一本が衣の中に潜り込み、{乳首}に吸盤のように吸いつく。{a}「{v0}」――太い触手が{ナカ}に押し入り、ずぶずぶと奥を目指して這い進んだ。{s:wet}。粘液に濡れた床の上で、{a}の体は何度も跳ねた。|'+
'何本もの触手が{a}の体を宙に吊り上げ、手足を大の字に引き伸ばした。細い触手が{陰核}に巻きついて小刻みに震え、太い触手が{ナカ}をぐちゅぐちゅと掻き回す。{s:wet}。{a}「{v1}」――口を塞ごうとした手さえ、触手に絡め取られて頭の上で縫いとめられた。|'+
'押し倒された{a}の上に、冷たい鱗に覆われた眷属がのしかかった。ぬめる触手が{胸}を締め上げ、脈打つ管が{女性器}に深々と突き立てられる。{s:hit}。{a}「{v1}」――突き上げられるたびに、下腹の奥に冷たい粘液がどぷどぷと溜まっていった。'),
m:L('触手は{a}の手足を床に縫いとめ、衣を内側から引き裂いた。細い一本が{男性器}に巻きついて扱き上げ、別の一本が{後ろ}をぬるりとこじ開ける。{a}「{v0}」――粘液にまみれた触手が奥へ奥へと這い進み、内側の弱いところを探り当てて押し上げた。{s:wet}。|'+
'何本もの触手が{a}の体を宙に吊り上げ、{尻}を突き出させるように折り曲げた。太い触手が{後ろ}にずぶりと沈み、ぐちゅぐちゅと音を立てて出入りしはじめる。{s:wet}。{a}「{v1}」――前に回った触手の先が{亀頭}に吸いつき、{a}の腰を無理やり跳ね上げさせた。|'+
'押し倒された{a}の背に、冷たい鱗の眷属がのしかかった。触手の先の脈打つ管が{後ろ}に深々と突き立てられ、容赦なく出入りを繰り返す。{s:hit}。{a}「{v1}」――{乳首}に吸いついた触手が、突き上げに合わせてきつく吸い上げた。')
},
ritual:{
f:L('村の長が、押し開かれた{a}の脚のあいだに腰を沈めた。{男性器}が{女性器}をこじ開け、祝詞の拍子に合わせて奥まで打ち込まれる。{s:hit}。{a}「{v0}」――周りを囲む村人たちの手が、{胸}を揉み、{乳首}を摘まみ、{a}の体じゅうを這い回った。|'+
'村の男たちは祭壇の上の{a}を代わる代わる組み敷いた。一人が{ナカ}に{精液}を吐き出して退くと、すぐに次の男が{男性器}を突き入れる。{s:hit}。{xm}――{a}「{v1}」――祝詞は途切れず、篝火の明かりだけが、汗と油に濡れた{a}の肌を照らしていた。|'+
'祝詞が終わると、祭壇の奥から人ではないものが這い寄ってきた。冷たく脈打つそれが、村人たちに押し開かれた{女性器}へずぶずぶと沈み込む。{s:wet}。{a}「{v1}」――神の器を清めるのだと、村人たちは手を合わせてそれを見守っていた。'),
m:L('村の長は祭壇の上の{a}を裏返し、{尻}を高く掲げさせた。油を塗った指で{後ろ}をほぐすと、祝詞の拍子に合わせて{男性器}を奥まで打ち込む。{s:hit}。{a}「{v0}」――周りを囲む村人たちの手が、{a}の{乳首}を摘まみ、{男性器}を握って扱き上げた。|'+
'村の男たちは祭壇の上の{a}を代わる代わる押さえ込んだ。{後ろ}に{精液}を吐き出した男が退くと、すぐに次の男の{男性器}がねじ込まれる。{s:hit}。{xm}――{a}「{v1}」――篝火に照らされた{a}の肌は、汗と油でぬらぬらと光っていた。|'+
'祝詞が終わると、祭壇の奥から人ではないものが這い寄ってきた。冷たく脈打つそれが{a}の{後ろ}をこじ開け、ずぶずぶと奥まで沈み込む。{s:wet}。{a}「{v1}」――同時に細いものが{男性器}に巻きつき、神の器から精を搾り取るように扱き上げた。')
},
crowd:{
f:L('{x}は{a}の着衣を剥ぎ取り、抗う手足を床に押さえつけた。冷たい指が{胸}を揉みしだき、閉じようとする膝をこじ開ける。{a}「{v0}」――脚のあいだに押し当てられた{男性器}が、そのまま{女性器}をずぶずぶと押し広げて沈んできた。{s:hit}。|'+
'{a}は四つん這いにされ、腰を高く引き上げられた。後ろから{ナカ}を突き上げられるたびに、前に回った別の手が{乳首}を摘まんで引っ張る。{s:hit}。{a}「{v1}」――周りを囲む気配は、息を詰めてそれを見守っていた。|'+
'{x}は{a}の脚を大きく開かせ、真上から{男性器}を叩きつけた。{s:hit}。{xm}――ぐちゅぐちゅと濡れた音が響くたびに、{a}の体は床の上で跳ねる。{a}「{v1}」――終わったと思うと、すぐに次の手が{a}の脚を掴んだ。'),
m:L('{x}は{a}をうつ伏せに押さえつけ、着衣を腰までまくり上げた。濡れた指が{後ろ}にねじ込まれ、乱暴に掻き回して押し広げる。{a}「{v0}」――指の代わりに押し当てられた{男性器}が、一息に奥まで押し入ってきた。{s:hit}。|'+
'{a}は膝立ちのまま後ろから抱え込まれ、{後ろ}を下から突き上げられた。{s:hit}。{a}「{v1}」――前に回った別の手が{a}の{男性器}を握り込み、突き上げに合わせて無理やり扱き上げた。|'+
'{x}は{a}の両膝を胸に押しつけるように折り曲げ、逃げ場をなくした{後ろ}に{男性器}を沈めた。{s:hit}。{xm}――打ちつけられるたびに、{a}の{乳首}を別の指がきつく摘まみ上げる。{a}「{v1}」')
}
};
var MOB_FIN={
man:L('男の腰の動きが荒く、速くなっていく。{s:hit}。{xm}――男は{a}の腰を強く引き寄せ、いちばん奥に押しつけたまま動きを止めた。{s:cum}。どくどくと{精液}を注ぎ込まれる感触に、{a}は唇を噛んで目を閉じた。|'+
'男は{a}の髪を掴んで顔を上げさせ、その表情を眺めながら最後の数回を叩きつけた。{s:cum}。{xm}――{ナカ}にたっぷりと吐き出した男が退くと、溢れた{精液}がとろりと太腿を伝った。休む間もなく、次の男が{a}の脚を掴んだ。|'+
'男は果てる寸前に引き抜き、{a}の顔から胸元にかけて{精液}をぶちまけた。{s:cum}。{xm}――汚された{a}を見下ろして、男たちは下卑た笑い声を上げた。{a}は顔を背けたまま、肩を震わせていた。'),
god:L('{a}の奥で、それが大きく脈打った。{s:cum}。冷たいものとも熱いものともつかない何かが、どぷどぷと{ナカ}に注ぎ込まれていく。{a}は下腹が内側から膨らんでいく感覚に、声にならない悲鳴を上げた。|'+
'それは{a}がどれだけ果てても、動きを止めなかった。{s:wet}。やがて奥に押しつけられたまま、粘ついたものが脈打ちながら吐き出される。溢れた粘液は、{a}の脚を伝って床に滴り落ちた。|'+
'最後に、それは{a}のいちばん奥で動きを止めた。{s:cum}。注ぎ込まれた熱は{a}の下腹にずしりと溜まり、いつまでも引いていかなかった。それが離れていったあとも、{a}の体はしばらくびくびくと震え続けた。')
};
var MOB_AGAIN=L('一度果てても、解放はされなかった。ぐったりとした{a}の体は裏返され、また最初から責め立てられる。{s:wet}。{a}「{v2}」――空が白みはじめるまで、{a}は何度も果てさせられ続けた。|'+
'息が整う間もなく、また別の手が伸びてきた。{a}にはもう、押し返す力も残っていない。{s:hit}。{a}「{v1}」――二度目は、一度目よりも長く、執拗だった。|'+
'二度、三度と責め立てられるうちに、{a}の体は抗い方を忘れかけていた。{s:wet}。{a}「{v2}」――{a}が解放されたのは、鶏が鳴くころになってからだった。');
var ERO_X={yobai:'村の男',bath:'若い衆',ritual:'村人たち',cave:'眷属',crowd:'村人たち'};
var ERO_BY={yobai:{name:'村の男'},bath:'crowd',ritual:'crowd',dream:'god',cave:'god',crowd:'crowd'};
var ERO_PZ={yobai:'react',bath:'react',ritual:'rite'};
function eroMob(S,p,kind,intro,label){
var LW=HK.Lewd,FX=LW.FORCE,M=HK.R18M,god=kind==='dream'||kind==='cave';
var b=HK.Pos&&HK.Pos.isF(p)?'f':'m',per=(HK.personaOf?HK.personaOf(p):p.persona)||'gentle',sep=lwSep(S);
var x=label||(kind==='dream'?S.G.call:ERO_X[kind]);
var mob=god?null:{mob:true,name:x,mobRole:'guest',mobTop:true,gender:'m'};
var m={a:p.name,x:x,g:S.G.call,xm:mob?function(){return'「'+HK.Ero.moan(S,mob,2)+'」';}:null};
var f=function(l,late){return LW.forceFill(S,fp(S,l),p,m,late);};
var t=(intro?LW.forceFill(S,intro,p,m):'')+(M?M.resist(S,ERO_BY[kind],p,{endure:false}):'');
t+=sep+f(ERO_BODY[kind][b]);
if(!lwShort(S))t+=(ERO_PZ[kind]?pz(S,p,ERO_PZ[kind],true):'')+f(FX.mid);
t+=sep+f(FX.peak[per]||FX.peak.gentle,true)+p.name+'「'+LW.forceMoan(S,p,'climax',true)+'」';
t+=f(MOB_FIN[god?'god':'man'],true);
if(lwHi(S))t+=sep+f(MOB_AGAIN,true);
S._r18E=S.log.length;
return t;
}
function eroBody(S,p,kind,hush){
var b=HK.Pos&&HK.Pos.isF(p)?'f':'m';
S._r18E=S.log.length;
return HK.Lewd.forceFill(S,fp(S,ERO_BODY[kind][b]),p,{a:p.name,x:ERO_X[kind],g:S.G.call,hush: !!hush});
}
var CV_REL={love:'恋人',fixed:'固定の相手',crush:'片想い',close:'仲間',bad:'敵対',none:'無関心'};
var CV_NOTICE={
yobai:L('隣の部屋で、{r}は物音に目を覚ました。押し殺した悲鳴と、畳の軋む音が、{v}の部屋から聞こえていた。{r}は襖を開け放って飛び込んだ。|'+
'厠に立った{r}は、{v}の部屋の前で足を止めた。障子に、いくつもの人影が蠢いていた。{r}は考えるより先に、障子を引き開けていた。|'+
'{r}は寝返りを打った拍子に、隣の布団が空なのに気づいた。廊下の奥の納戸から、口を塞がれたようなくぐもった声が漏れていた。'),
cave:L('{r}は明かりをかざして、暗がりに目を凝らした。暗がりの中で、{v}の体が何かに絡め取られていた。|'+
'後ろにいたはずの{v}の足音が、ふいに途切れた。振り返った{r}の視線の先で、{v}が何かに引きずり倒されていた。|'+
'{v}の悲鳴が響いた。{r}は足もとも確かめずに、声のほうへ駆け戻った。'),
ritual:L('祭壇を囲む村人の輪の外で、{r}は拳を握りしめていた。祝詞が高まり、{v}の薄衣に手がかかった瞬間、{r}は輪の中へ飛び込んだ。|'+
'松明の列の陰から、{r}は祭壇の上の{v}を見ていた。もう、黙って見ていることはできなかった。|'+
'{r}は押しとどめる村人の腕を振り払い、祭壇へ続く石段を駆け上がった。')
};
var CV_MOTIVE={
love:L('{r}は{v}の前に立ちはだかり、両腕を広げた。{r}「その人に触らないで！｜その人に触るな！｜その人に触らないでください！」――恋人を守ることのほかは、何も考えていなかった。|'+
'{r}は{v}の名前を叫びながら、{x}のあいだに体ごと割って入った。{r}「私の大事な人に、何をするの！｜私の大事な人に、何をする！｜私の大事な人に、何をなさるんですか！」|'+
'{r}は震える手で{v}の腕を掴み、自分の背中へ引き寄せた。{r}「大丈夫、私がいる｜大丈夫だ、私がいる｜大丈夫です、私がいます」――言い聞かせる声は、{r}のほうが震えていた。'),
fixed:L('{v}は、{r}がただ一人と決めた相手だった。その{v}に、知らない手が伸びている。{r}「その人は私の相手。触らないで｜その人は私の相手だ。触るな｜その方は私の相手です。触らないでください」|'+
'{r}は低く唸り、{x}を突き飛ばした。{r}「ほかの誰にも、渡すつもりはない｜＝｜ほかの誰にも、お渡しするつもりはありません」|'+
'{r}は{v}の手首を掴んで引き寄せた。決めた相手は、{v}だけだった。{r}「離れて。この人に触れていいのは、私だけ｜離れろ。この人に触れていいのは、私だけだ｜離れてください。この人に触れていいのは、私だけです」'),
crush:L('ずっと言えずにいた想いが、{r}の背中を押した。{r}は{x}の前に飛び出し、{v}を背中に庇った。{r}「この人には、指一本触れさせない｜＝｜この人には、指一本触れさせません」|'+
'{r}の足は勝手に動いていた。片想いの相手が泣いているのを、黙って見ていることはできなかった。{r}「{v}を放して！｜{v}を放せ！｜{v}を放してください！」|'+
'{r}は自分でも驚くほど大きな声を上げていた。{r}「やめて！　その人だけは、やめて！｜やめろ！　その人だけは、やめろ！｜やめてください！　その人だけは、やめてください！」――想いを伝えたこともない相手のために、{r}は{x}の前に立った。'),
close:L('{r}は迷わず{x}に掴みかかった。{r}「私の仲間に、何をしてるの！｜私の仲間に、何をしている！｜私の仲間に、何をしているんですか！」|'+
'{r}は手近なものを掴んで振りかざした。{r}「{v}から離れて！　今すぐ！｜{v}から離れろ！　今すぐだ！｜{v}から離れてください！　今すぐに！」|'+
'{r}は{v}の腕を掴み、力いっぱい引っ張った。{r}「立って、逃げよう！｜立て、逃げるぞ！｜立ってください、逃げましょう！」――長い付き合いの相手を、置いていくことなどできなかった。'),
bad:L('{r}は舌打ちをして、{x}のあいだに割り込んだ。{r}「勘違いしないで。あなたを助けたいわけじゃない｜勘違いするな。あなたを助けたいわけじゃない｜勘違いしないでください。あなたを助けたいわけではありません」――それでも、見過ごすことだけはできなかった。|'+
'日ごろ{v}といがみ合っている{r}が、真っ先に飛び込んできた。{r}「あなたを泣かせていいのは、私だけ｜あなたを泣かせていいのは、私だけだ｜あなたを泣かせていいのは、私だけです」|'+
'{r}は嫌そうに顔をしかめながら、{v}を押さえる腕を掴んで捻り上げた。{r}「文句はあとで聞く。今は下がって｜文句はあとで聞く。今は下がれ｜文句はあとで伺います。今は下がってください」'),
none:L('{r}は、{v}とはろくに口をきいたこともなかった。それでも、目の前の光景から顔を背けることはできなかった。{r}「……やめなよ。見てられない｜……やめろ。見ていられない｜……おやめなさい。見ていられません」|'+
'{r}は一瞬だけためらってから、{x}の前に出た。{r}「よく知らない相手でも、これは放っておけない｜＝｜よく知らない相手でも、これは放っておけません」|'+
'{r}は自分でも理由が分からないまま、{v}の腕を引いていた。{r}「ほら、こっち｜こっちだ｜こちらへどうぞ」')
};
var CV_HIT={
man:L('{x}の一人が、振り向きざまに{r}の頬を殴りつけた。よろめいたところを腹に膝を叩き込まれ、{r}は床に崩れ落ちた。這ってでも近づこうとした{r}の背中を、誰かが踏みつけた。|'+
'{r}の拳は、一人の顎をかすめただけだった。次の瞬間、何本もの腕が{r}を引き倒し、殴る蹴るの音が続いた。「＠よそ者が、神さまの邪魔をするでねえ」|'+
'{r}は{x}の一人に組みついたが、後ろから頭を殴られて目の前が白くなった。床に倒れた{r}の耳に、{v}の声が遠く聞こえていた。'),
kin:L('太い触手が鞭のようにしなり、{r}の体を壁に叩きつけた。息が詰まり、{r}はずるずると崩れ落ちた。|'+
'{r}が明かりを突き出すと、眷属は甲高い音を立てて身をよじった。次の瞬間、横から伸びた触手が{r}の足を払い、硬い床に頭から叩きつけた。|'+
'{r}は{v}に絡みつく触手を素手で引き剥がそうとした。ぬめった触手は手の中で暴れ、{r}を闇の奥へ弾き飛ばした。')
};
var CV_SUB=L('{r}は床に膝をつき、{x}を見上げた。{r}「その人の代わりに、私を連れていって｜その人の代わりに、私を連れていけ｜その人の代わりに、私を連れていってください」|'+
'{r}は{v}の前に立ったまま、自分の襟元に手をかけた。{r}「相手が要るなら、私にして。その人は放して｜相手が要るなら、私にしろ。その人は放せ｜お相手が要るなら、私にしてください。その方は放してください」|'+
'{r}は震える声で言った。{r}「私が代わりになる。だから、その人だけは許して｜私が代わりになる。だから、その人だけは許してくれ｜私が代わりになります。ですから、その人だけは許してください」');
var CV_SUB_OK={
man:L('男たちは顔を見合わせ、にやりと笑った。{v}を押さえていた手が離れ、代わりに何本もの腕が{r}を掴んで引き倒した。「＠ええ心がけじゃ。たっぷり可愛がってやる」|'+
'「＠そっちから来るとは、殊勝なこっちゃ」――{x}は{v}を放り出し、今度は{r}を取り囲んだ。|'+
'{x}の目が、値踏みするように{r}の体を這った。やがて{v}の手首が放され、{r}は乱暴に床へ引き倒された。'),
kin:L('触手はしばらく宙で揺れていたが、やがて{v}を放し、{r}のほうへ向きを変えた。冷たいものが、{r}の足首に絡みついた。|'+
'眷属は{v}から離れると、ぬめる体を引きずって{r}ににじり寄った。新しい獲物のほうが、気に入ったようだった。|'+
'{v}に絡んでいた触手が、一本、また一本と解けていった。解けた触手は、すべて{r}のほうへ伸びてきた。')
};
var CV_SUB_NO=L('{x}は鼻で笑った。「＠誰でもええわけでねえ。選ぶのはこっちじゃ」――{r}は突き飛ばされ、床に転がった。|'+
'申し出は、聞き入れられなかった。{r}は乱暴に押し戻され、その場に押さえつけられた。|'+
'{x}は{r}の言葉など、聞いていなかった。{r}が伸ばした手は払いのけられ、{v}はそのまま引きずられていった。');
var CV_BOTH={
man:L('「＠ちょうどええ。二人まとめて清めてやる」――{x}は{r}の腕をねじり上げ、{v}の隣に引き倒した。|'+
'{r}が掴みかかった腕は、あっさりと捻り上げられた。{x}は笑いながら、{r}を{v}の隣に並べて押さえつけた。|'+
'割って入った{r}も、すぐに何本もの手に捕まった。気づけば{r}は、{v}と並んで床に押さえ込まれていた。'),
kin:L('{r}が引き剥がそうとした触手は、逆に{r}の腕に巻きついた。二人は、絡み合った触手の中に一緒に引きずり込まれた。|'+
'裂け目から新しい触手が湧き出し、{r}の足首を絡め取った。{r}は{v}のすぐ隣に、仰向けに引き倒された。|'+
'眷属は獲物が増えたことを喜ぶように、ぶるりと身を震わせた。{r}の手足にも、ぬめった触手が次々と絡みついていった。')
};
var CV_WATCH={
man:L('{r}は二人がかりで後ろから羽交い締めにされ、柱に縄で括りつけられた。「＠よう見とれ。目を逸らしたら、もっと酷うなるぞ」|'+
'{r}は床に押さえつけられ、髪を掴まれて顔を上げさせられた。目を閉じようとすると、頬を張られた。|'+
'{r}の両腕は背中でねじり上げられ、膝立ちのまま動けなくされた。目の前の光景から、顔を背けることさえ許されなかった。'),
kin:L('触手が{r}の手足を壁に縫いとめた。身動きのとれない{r}の目の前で、眷属はゆっくりと獲物のほうへ向き直った。|'+
'{r}は細い触手に手首と足首を絡め取られ、膝をつかされた。顔を背けようとすると、触手がぐいと顎を引き戻した。|'+
'{r}は粘液の膜に体を包まれ、壁に貼りつけられた。声は出せても、指一本動かせなかった。')
};
var CV_SEE=L('見たくないのに、{r}は目を逸らせなかった。下腹に、覚えのある熱がじわじわと溜まっていく。{r}は自分の体の浅ましさに、奥歯を噛みしめた。|'+
'{r}の耳に、聞き慣れた声が甘く崩れていく音が届いていた。そのたびに、{r}の体の芯が熱く疼いた。助けに来たはずなのに――{r}は情けなさに顔を歪めた。|'+
'{r}は膝をすり合わせ、熱を持っていく体を必死に隠そうとした。隠そうとするほど、目の前の光景から目が離せなくなる。{r}は、そんな自分がいちばん許せなかった。');
var CV_SEE_ERO={
m:L('{r}の{股間}は、自分でも分かるほど硬く張りつめていた。押さえつけられたまま身じろぎするたびに、布地に擦れて腰が震える。{r}は、こんなときに昂っている自分の体を呪った。|'+
'甘く崩れていく声が耳に届くたびに、{r}の{男性器}がびくりと脈打った。触れてもいないのに、下着の中に先走りが滲んでいく。助けに来たはずなのに――{r}は情けなさに顔を歪めた。|'+
'{r}は膝立ちのまま、張りつめた前を隠すこともできなかった。目を閉じても、肌を打つ音と濡れた声が頭の中で鳴り続ける。{r}の荒い息は、もう恐怖のせいだけではなかった。'),
f:L('{r}の体の奥が、きゅうっと疼いた。見せつけられているだけなのに、下着の中がじっとりと湿っていく。{r}は太腿をきつく閉じ合わせ、その熱を必死に押し殺した。|'+
'甘く崩れていく声が耳に届くたびに、{r}の{乳首}が服の下で硬く尖っていった。助けに来たはずなのに――{r}は情けなさに唇を噛んだ。噛んだ唇から、熱い息が漏れた。|'+
'{r}は押さえつけられたまま、もぞもぞと膝をすり合わせていた。目を閉じても、肌を打つ音と濡れた声が頭の中で鳴り続ける。{r}の荒い息は、もう恐怖のせいだけではなかった。')
};
var CV_FIX=L('{r}の脳裏に、{f}の顔が浮かんだ。決めた相手がいるのに――{r}は自分の体の反応を恥じて、きつく目を閉じた。|'+
'{r}は{f}のことを思い浮かべ、唇を噛んだ。こんな姿は、決して見せられないと思った。|'+
'こんなところを{f}に知られたら――{r}はそれだけを考えて、熱を押し殺そうとした。');
var CV_FIX_SAME=L('決めた相手が目の前で汚されているのに、体は熱を持っていく。{r}はそんな自分を、心の底から恥じた。|'+
'ただ一人と決めた相手だった。その相手の乱れる姿に昂ってしまう自分が、{r}には許せなかった。|'+
'{r}は、決めた相手を守れなかった。そのうえ、こんな熱まで覚えている。{r}は拳を握りしめ、爪が掌に食い込むのも構わなかった。');
var CV_BOTH_LEAD=L('{v}のすぐ隣で、{r}もまた押さえ込まれていた。|庇いに入った{r}にも、容赦はなかった。|{r}の番が来るまで、長くはかからなかった。');
var CV_BOTH_N={
man:L('男の一人が{r}の着衣を剥ぎ取り、抗う脚を割り開いて、そのまま奥まで沈めた。{r}は歯を食いしばったが、こらえきれない声が漏れた。|'+
'代わる代わるのしかかられ、{r}は何度も体の奥を穿たれた。くぐもった声が、二人分重なって響いた。|'+
'{r}は同じように脚を開かされ、のしかかる重みに押し潰された。男の腰が打ちつけられるたびに、{r}の体は床の上で跳ねた。'),
kin:L('衣の下に潜り込んだ一本が、{r}の奥へずるりと入り込んだ。{r}は爪を立て、こみ上げる声を必死に噛み殺した。|'+
'絡み合った触手の中で、{r}もまた体を開かされていた。脈打つものが{r}の中で蠢くたびに、意思とは関係なく腰が跳ねた。|'+
'眷属は二つの獲物を、同じ律動で嬲りはじめた。{r}の体の奥にも、冷たい粘液が注ぎ込まれていった。')
};
var CV_AFTER_HEAD={
hit:L('しばらくして、{r}は腫れ上がった顔で、ようやく体を起こした。{v}は少し離れたところで膝を抱えていた。|'+
'{r}の口の端には、乾いた血がこびりついていた。{v}はその傷を、黙って見つめていた。|'+
'殴られた{r}の腕には、青黒い痣がいくつも浮かんでいた。二人はしばらく、一言も交わさなかった。'),
sub:L('{v}は、自分の代わりに連れていかれた{r}が戻ってくるまで、生きた心地がしなかった。|'+
'戻ってきた{r}は、何事もなかったように笑おうとした。その笑顔に、{v}は胸が潰れそうになった。|'+
'しばらくして、{r}はようやく{v}の前に姿を見せた。乱れた襟元を、{r}は無言でかき合わせた。'),
both:L('解放されたあと、二人はしばらく並んで横たわったまま、動けなかった。先に口を開いたのは、{r}のほうだった。|'+
'ようやく解放されたとき、{r}と{v}は互いの姿から目を逸らした。同じ目に遭ったことが、かえって言葉を奪っていた。|'+
'二人は肩を寄せ合ったまま、震えがおさまるのを待った。{r}の指先は、まだ小さく震えていた。'),
watch:L('解放されたあとも、{r}は{v}の顔をまともに見られなかった。|'+
'そのあとも、二人のあいだには重たい沈黙が横たわっていた。さっきの自分の様子を、{r}は気づかれていると思っていた。|'+
'{r}は{v}の前で、何度も口を開きかけては閉じた。言い訳の言葉は、どれも見つからなかった。')
};
var CV_AFTER={
love:L('{r}は{v}を抱き寄せ、何度も髪を撫でた。{r}「もう大丈夫。もう、離れないから｜もう大丈夫だ。もう、離れない｜もう大丈夫です。もう、離れませんから」――{v}は{r}の胸に顔を埋めて、小さく頷いた。|'+
'{v}は{r}の手を取り、そっと頬に当てた。{v}「無茶しないで。あなたまでいなくなったら、私……｜無茶をするな。あなたまでいなくなったら、私は……｜無茶をなさらないでください。あなたまでいなくなったら、私……」――{r}は答える代わりに、{v}の手を強く握り返した。|'+
'{r}は{v}の前に膝をつき、額を寄せた。{r}「何があっても、あなたを想う気持ちは変わらない｜何があっても、あなたを想う気持ちは変わらない｜何があっても、あなたをお慕いする気持ちは変わりません」――{v}の目から、こらえていた涙がぽろぽろとこぼれた。'),
fixed:L('{r}は{v}の手首に残った痕を、指でなぞった。{r}「あなたに触れていいのは、私だけなのに｜あなたに触れていいのは、私だけのはずだ｜あなたに触れていいのは、私だけのはずなのに」――{v}は{r}の肩に額を預けた。{v}「……うん。あなただけ｜……ああ。あなただけだ｜……はい。あなただけです」|'+
'{r}は黙って{v}の乱れた髪を整えた。整え終わっても、その手は{v}の頬から離れなかった。{r}「次は、絶対に渡さない｜＝｜次は、絶対にお渡ししません」|'+
'{v}は{r}の袖を掴んで離さなかった。{v}「そばにいて。今夜だけでいいから｜そばにいろ。今夜だけでいい｜そばにいてください。今夜だけでいいですから」――{r}は黙って頷き、{v}の隣に腰を下ろした。'),
crush:L('{v}は{r}を見上げた。{v}「どうして、あんな無茶をしたの｜どうして、あんな無茶をした｜どうして、あんな無茶をなさったんですか」――{r}は目を逸らし、赤くなった耳を隠すように頭を掻いた。{r}「……放っておけなかっただけ｜……放っておけなかっただけだ｜……放っておけなかっただけです」|'+
'{r}は{v}の隣に座ったものの、何を言えばいいのか分からなかった。ずっと伝えられずにいた想いが、喉の奥でつかえていた。{r}「……無事で、よかった｜＝｜……ご無事で、よかったです」|'+
'{v}は、そっと{r}の手を握った。{v}「ありがとう。あなたが来てくれて、心強かった｜＝｜ありがとうございます。あなたが来てくださって、心強かったです」――握られた手の熱に、{r}は息をするのも忘れた。'),
close:L('{r}は{v}の肩を叩いた。{r}「生きてれば、それでいい。あとのことは、あとで考えよう｜生きていれば、それでいい。あとのことは、あとで考えよう｜生きていれば、それでいいんです。あとのことは、あとで考えましょう」――{v}は鼻をすすり、小さく笑った。|'+
'{v}は{r}の隣に座り、黙って水筒を差し出した。{v}「ごめん。私のせいで、こんな目に｜すまない。私のせいで、こんな目に｜ごめんなさい。私のせいで、こんな目に」――{r}は首を振った。{r}「仲間でしょ。当たり前だよ｜仲間だろう。当たり前だ｜仲間ですから。当たり前です」|'+
'二人はしばらく、背中合わせに座っていた。{r}「誰にも言わない。約束する｜＝｜誰にも言いません。お約束します」――{v}は返事の代わりに、{r}の背中に体重を預けた。'),
bad:L('{v}は{r}を睨みつけた。{v}「……借りができた、なんて思わないから｜……借りができたとは思わない｜……借りができたとは、思いませんから」――{r}は鼻で笑った。{r}「こっちだって、貸したつもりはない｜こちらも、貸したつもりはない｜こちらも、貸したつもりはありません」|'+
'{r}はそっぽを向いたまま言った。{r}「勘違いしないで。あなたがいなくなったら、張り合う相手がいなくなるだけ｜勘違いするな。あなたがいなくなったら、張り合う相手がいなくなるだけだ｜勘違いなさらないでください。あなたがいなくなったら、張り合う相手がいなくなるだけです」――{v}は何も言い返さなかった。いつもなら、言い返していたはずだった。|'+
'{v}は不機嫌な顔のまま、{r}の傷に薬を塗った。{v}「動かないで。下手な手当てでも、ないよりまし｜動くな。下手な手当てでも、ないよりはましだ｜動かないでください。下手な手当てでも、ないよりはましです」――二人とも、目を合わせようとはしなかった。'),
none:L('{r}と{v}は、ぎこちなく目を合わせた。{v}「……どうして、私なんかを｜……なぜ、私などを｜……どうして、私などを」――{r}は少し考えてから、肩をすくめた。{r}「さあ。体が勝手に動いた｜さあな。体が勝手に動いた｜さあ。体が勝手に動きました」|'+
'気まずい沈黙が続いた。やがて{v}が、小さく頭を下げた。{v}「ありがとう。……名前、ちゃんと覚えた｜ありがとう。……名前は、ちゃんと覚えた｜ありがとうございます。……お名前、ちゃんと覚えました」|'+
'{r}は{v}に背を向けたまま言った。{r}「礼はいらない。見ていられなかっただけ｜礼はいらない。見ていられなかっただけだ｜お礼は結構です。見ていられなかっただけですから」――それきり、二人はまた他人同士の距離に戻った。')
};
var CV_AFTER_SEE={
near:L('{v}は、何も言わずに{r}の手を取った。{r}「……ごめん。私、最低だ｜……すまない。私は最低だ｜……ごめんなさい。私、最低です」――{v}は首を振り、{r}の指に自分の指を絡めた。{v}「来てくれた。それで十分｜来てくれた。それで十分だ｜来てくださいました。それで十分です」|'+
'{r}は{v}の前で項垂れた。{r}「助けるどころか、私は……｜＝｜お助けするどころか、私は……」――言いかけた言葉を、{v}がそっと指で止めた。{v}「言わなくていい。もう、終わったこと｜言わなくていい。もう、終わったことだ｜おっしゃらなくていいんです。もう、終わったことですから」|'+
'{v}は{r}の顔を覗き込み、困ったように笑った。{v}「顔、真っ赤だよ｜顔が真っ赤だぞ｜お顔が真っ赤ですよ」――{r}は耐えきれずに顔を覆った。それでも、繋いだ手だけは離さなかった。'),
far:L('二人は互いに目を逸らしたまま、黙り込んでいた。{r}「……何も見てない。そういうことにして｜……何も見ていない。そういうことにしろ｜……何も見ていません。そういうことにしてください」――{v}は小さく頷いた。|'+
'{v}は乱れた襟をかき合わせ、{r}を一瞥した。{v}「……助けに来たんじゃなかったの｜……助けに来たのではなかったのか｜……助けに来てくださったのでは、なかったんですか」――{r}は返す言葉もなく、唇を噛んだ。|'+
'{r}は{v}に向かって深々と頭を下げた。{r}「情けないところを見せた。忘れて｜情けないところを見せた。忘れてくれ｜情けないところをお見せしました。忘れてください」――{v}は答えず、ただ遠くを見ていた。')
};
var CV_RITE_AFTER={
near:L('{r}は、{v}が消えた祭壇の前から動けなかった。{r}「どうして、守れなかったんだろう｜なぜ、守れなかった｜どうして、守れなかったんでしょう」――篝火が消えたあとも、{r}はそこに座り込んでいた。|'+
'体の痛みよりも、{v}の最後の顔のほうが、{r}を痛めつけた。{r}は空の祭壇に額を押しつけ、声を殺して泣いた。|'+
'{r}は、祭壇に残された{v}の薄衣を拾い上げ、きつく握りしめた。{r}「必ず、迎えに行くから｜必ず、迎えに行く｜必ず、お迎えに参りますから」'),
far:L('儀式が終わり、村人たちは何事もなかったように帰っていった。{r}は一人、空になった祭壇を見上げていた。|'+
'{r}は、祭壇の上の出来事を誰にも話さなかった。話せば、自分がそのとき何をしていたのかも、話さなければならなかった。|'+
'{r}は唇を噛み、松明の消えた祭壇から目を逸らした。{r}「……あれで、よかったはずがない｜＝｜……あれで、よかったはずがありません」')
};
function cvRng(S){
if(!S._cvR){
var src=(S.log||[]).slice(-6).map(function(o){return(o&&o.text)||'';}).join('')+'#'+(S.log||[]).length,h=2166136261;
for(var i=0;i<src.length;i++)h=Math.imul(h^src.charCodeAt(i),16777619);
S._cvR=HK.rng(h>>>0);
}
return S._cvR;
}
function cvRel(S,r,v){
var c=JS.REL&&JS.REL.cat?JS.REL.cat(S,r,v):'';
if(c==='love')return'love';
if((r.sexLocks||[]).indexOf(v.i)>=0||(v.sexLocks||[]).indexOf(r.i)>=0)return'fixed';
return c==='crush'?'crush':c==='family'||c==='close'?'close':c==='bad'||c==='ex'?'bad':'none';
}
var CV_W={love:4,fixed:4,crush:3,close:1.6,bad:0.7,none:0.6},CV_P={yobai:0.3,cave:0.4,ritual:0.35};
function cvPick(rr,items,wf){
var ws=items.map(wf),tot=ws.reduce(function(s,w){return s+w;},0),x=rr()*tot;
for(var i=0;i<items.length;i++){x-=ws[i];if(x<0)return items[i];}
return items[items.length-1];
}
function coverTry(S,v,kind,grp,x){
if(HK.SAFE_ON|| !HK.State|| !v||(S._shieldN||0)>=2)return null;
var rr=cvRng(S);
if(rr()>CV_P[kind])return null;
var cs=S.P.filter(function(c){return c&&c!==v&&c.alive!==false&&HK.State.canAct(c)&& !c.possessed;});
if(!cs.length)return null;
var r=cvPick(rr,cs,function(c){return CV_W[cvRel(S,c,v)]||0.6;});
var inv=HK.State.mobSexOk(r)&&(!HK.Pos||HK.Pos.canReceive(r))&&JS.R18.room(S,[r]),see=HK.State.r18ok(r);
var opts=[['hit',1],['sub',0.8]];
if(inv)opts.push(['both',1.1]);
if(see)opts.push(['watch',1.3]);
var br=cvPick(rr,opts,function(o){return o[1];})[0];
var ok=br==='sub'&&inv&&kind!=='ritual'&&rr()<0.65;
S._shieldN=(S._shieldN||0)+1;
return{r:r,v:v,rel:cvRel(S,r,v),br:br,ok:ok,eff:br==='sub'?(ok?'sub':see?'watch':'hit'):br,kind:kind,grp:grp,x:x};
}
function cvF(S,l,cv,o){var m={r:cv.r.name,v:cv.v.name,x:cv.x};if(o)for(var k in o)m[k]=o[k];return ST.fmt(fp(S,l),m);}
var CV_WHY={hit:'殴り倒された',sub:'身代わりを申し出て、聞き入れられた',both:'二人とも押さえ込まれた',watch:'押さえつけられ、見せつけられた'};
function coverPre(S,cv,inline){
var g=cv.grp,e=cv.eff,t=cvF(S,CV_NOTICE[cv.kind],cv)+cvF(S,CV_MOTIVE[cv.rel],cv);
if(cv.br==='sub')t+=cvF(S,CV_SUB,cv)+(cv.ok?cvF(S,CV_SUB_OK[g],cv):cvF(S,CV_SUB_NO,cv));
if(e==='hit'){t+=cvF(S,CV_HIT[g],cv);cv.r.m.hp=Math.max(1,(cv.r.m.hp||100)-12);}
else if(e==='both')t+=cvF(S,CV_BOTH[g],cv);
else if(e==='watch')t+=cvF(S,CV_WATCH[g],cv);
cv.r.m.fear=Math.min(100,(cv.r.m.fear||0)+8);
if(inline)return t;
ST.say(S,{actors:[cv.r,cv.v],tag:'庇う',text:t,why:cv.r.name+'は'+cv.v.name+'を庇って割って入った（関係：'+CV_REL[cv.rel]+'）。'+CV_WHY[e]+(cv.br==='sub'&& !cv.ok?'（身代わりの申し出は聞き入れられなかった）':''),mag:22});
}
function coverWatch(S,cv){
if(!cv||cv.eff!=='watch')return'';
var r=cv.r,t=cvF(S,lwEro(S)?CV_SEE_ERO[HK.Pos&&HK.Pos.isF(r)?'f':'m']:CV_SEE,cv);
var L0=Array.isArray(r.sexLocks)?r.sexLocks:[],fxs=L0.map(function(i){return S.P[i];}).filter(function(x){return x&&x!==r;});
var fx=fxs.indexOf(cv.v)>=0?cv.v:fxs.length>1?fxs[Math.floor(S.rng()*fxs.length)]:fxs[0]||null;
if(fx&&fx!==r)t+=cvF(S,fx===cv.v?CV_FIX_SAME:CV_FIX,cv,{f:fx.name});
return lwSep(S)+t;
}
function coverBothText(S,cv,kind){
var r=cv.r;
r.cnt.r18=(r.cnt.r18||0)+1;r.m.fear=Math.min(100,(r.m.fear||0)+8);
var lead=cvF(S,CV_BOTH_LEAD,cv);
return lead+(lwEro(S)?eroMob(S,r,kind,'',kind==='crowd'?cv.x:null):cvF(S,CV_BOTH_N[cv.grp],cv)+(HK.R18M?HK.R18M.moans(S,r,['mid','climax']):''));
}
function coverBoth(S,cv,tag,kind){
if(!cv||cv.eff!=='both')return;
ST.say(S,{actors:[cv.r],tag:tag,kind:'climax',text:coverBothText(S,cv,kind),why:cv.r.name+'も、庇いに入って巻き込まれた',mag:24});
}
function coverAfter(S,cv){
if(!cv)return;
var near={love:1,fixed:1,crush:1}[cv.rel];
var t=cvF(S,CV_AFTER_HEAD[cv.eff],cv)+cvF(S,cv.eff==='watch'?CV_AFTER_SEE[near?'near':'far']:CV_AFTER[cv.rel],cv);
ST.say(S,{actors:[cv.r,cv.v],tag:'庇ったあと',text:t,why:cv.r.name+'と'+cv.v.name+'（'+CV_REL[cv.rel]+'）の、庇ったあと',mag:18});
}
function coverRite(S,cv){return cv?lwSep(S)+cvF(S,CV_RITE_AFTER[{love:1,fixed:1,crush:1}[cv.rel]?'near':'far'],cv):'';}
function hardTop(p){return!!(HK.Pos&&HK.Pos.hardTop(p));}
function okPair(a,b){return!HK.Pos||HK.Pos.okSex(a,b);}
function isFF(a,b){return!!(HK.Pos&&HK.Pos.ff(a,b));}
function pairSex(S,x,y,opt){
var R=HK.R18M;
opt=opt||{};
if(HK.Lewd&&HK.Lewd.storyEro&&HK.Lewd.storyEro(S))return HK.Lewd.storyEroSex(S,x,y);
if(HK.NoGen&&HK.NoGen.on(x,y))return HK.NoGen.text(S,x,y,opt);
if(isFF(x,y)&&HK.FF){
if(HK.R18Thick&&HK.R18Thick.on(S))return HK.R18Thick.ff(S,x,y,opt);
var ctx={pick:function(a){return fp(S,a);}},st=opt.mood==='rough'?'rough':opt.mood==='love'?'gentle':HK.FF.styleOf(x);
var f=function(t){return t.replace(/\{a\}/g,x.name).replace(/\{b\}/g,y.name);};
return f(HK.FF.pick(ctx,'body',st))+(R?R.say(S,y,'start')+(opt.short?'':R.say(S,x,'top')+R.say(S,y,'mid'))+R.say(S,y,'climax'):'')+f(HK.FF.pick(ctx,'climax',st));
}
return R?R.sex(S,x,y,opt):'';
}
JS.R18={
hardTop:hardTop,okPair:okPair,ff:isFF,sex:pairSex,
lwEro:lwEro,lwSep:lwSep,eroMob:eroMob,eroBody:eroBody,
cover:{tryIt:coverTry,pre:coverPre,watch:coverWatch,both:coverBoth,after:coverAfter},
cap:function(S){return 1+Math.round(Math.max(lvPC(S),lvMob(S))*3);},
lvPC:lvPC,lvMob:lvMob,
onPC:function(S){return!HK.SAFE_ON&&lvPC(S)>0;},
onMob:function(S){return!HK.SAFE_ON&&lvMob(S)>0;},
room:function(S,ps){
if((S.r18Tot||0)>=JS.R18.cap(S))return false;
var w=S.r18Who||{};
var per=HK.Pos&&HK.Pos.nightK&&HK.Pos.nightK(S)>1?3:2;
return(ps||[]).every(function(p){return p&&(w[p.i]||0)<per;});
},
spend:function(S,ps){
S.r18Tot=(S.r18Tot||0)+1;
var w=S.r18Who||(S.r18Who={});
(ps||[]).forEach(function(p){if(p)w[p.i]=(w[p.i]||0)+1;});
},
spendLog:function(S,n0){
var who={},any=false;
(S.log||[]).slice(n0).forEach(function(o){if(o&&o.kind==='climax'){any=true;(o.actors||[]).forEach(function(i){who[i]=1;});}});
if(any)JS.R18.spend(S,Object.keys(who).map(function(i){return S.P[+i];}));
return any;
},
pz:pz,
on:function(S){return!HK.SAFE_ON&&(lvPC(S)>0||lvMob(S)>0);},
arrive:function(S){
S.P.forEach(function(p){p.cnt.r18=0;});
var x=S.rng(),key=x<0.4?'meal':x<0.55?'incense':x<0.68?'tea':x<0.8?'sake':x<0.9?'bath':'pillow';
dose(S,S.P,key);
},
night:function(S,p,live,h){
var rng=S.rng,pc=lvPC(S),mob=lvMob(S),lv=Math.max(pc,mob);
if(HK.State&& !HK.State.r18ok(p))return false;
if(!JS.R18.room(S,[p]))return false;
live=live.filter(function(q){return q===p||JS.R18.room(S,[q]);});
var day=Math.floor((16+h)/24),hh=(16+h)%24;
if(day>=1&&hh===20&&S.r18DoseDay!==day){
S.r18DoseDay=day;
var rest=Object.keys(DOSE).filter(function(k){return(S.r18Doses||[]).indexOf(k)<0;});
if(rest.length&&rng()<0.35+lv*0.4)dose(S,live,rest[Math.floor(rng()*rest.length)]);
}
var gap=10/Math.max(1,HK.Pos&&HK.Pos.nightK?HK.Pos.nightK(S):1);
if(p.lastNight!=null&&h-p.lastNight<gap)return false;
if(rng()>lv*(p.aphro?0.32:0.12)*(HK.Pos&&HK.Pos.reasonK?HK.Pos.reasonK(S,p,p):1))return false;
p.lastNight=h;p.cnt.r18=(p.cnt.r18||0)+1;
var mates=pc<=0?[]:live.filter(function(q){return q!==p&&(q.lastNight==null||h-q.lastNight>=gap)&&(!HK.Avoid||HK.Avoid.topOk(S,p,q))&&((HK.canLove?HK.canLove(p,q)&&HK.canLove(q,p):true)|| !!(HK.State.freeSex&&HK.State.freeSex(S,p,q)))&&okPair(p,q)&&(!HK.Pos|| !HK.Pos.libOK||HK.Pos.libOK([p,q]));});
var top=HK.Pos&&HK.Pos.hardTopNpc?HK.Pos.hardTopNpc(p):hardTop(p);
var r0=rng();
var frc= !HK.Content||HK.Content.ok(S,'force');
var mobOk=mob>0&& !p.noMob&&frc,yob=pc>mob?mob/pc:1,pcKeep=pc>=mob?1:pc/mob;
if(!mobOk||rng()>yob){if(!mates.length)return false;r0=0.5;}
if(r0<0.16+(S.G.myth?0.06:0)){
if(top){
ST.say(S,{actors:[p],tag:'夢',text:ST.fmt(fp(S,DREAM_TOP),{a:p.name,g:S.G.call}),why:S.G.call+'が夢に現れたが、'+p.name+'は抗った（受け攻めの指定：攻め）',mag:22});
return true;
}
if((!HK.Content||HK.Content.ok(S,'preg'))&&rng()<0.2+lv*0.2)p.preg=true;
var dt=ST.fmt(DREAM_GOD[S.G.id]&&rng()<0.75?fp(S,DREAM_GOD[S.G.id]):fp(S,DREAM),{a:p.name,g:S.G.call});
var dLong=jLong(S,p)?HK.JDark.text(S,'dream',p):'';
var dEro=lwEro(S)?eroMob(S,p,'dream',/目覚め|目を覚ま/.test(dt)?fp(S,ERO_IN.dream):dt):'';
ST.say(S,{actors:[p],tag:'夢',kind:'climax',text:(dEro||dLong||dt+(HK.R18M?HK.R18M.moans(S,p,['mid','climax']):''))+(p.preg?(dLong?'\n\n':dEro?lwSep(S):'')+ST.fmt(fp(S,PREG),{y:p.name}):''),why:S.G.call+'が夢に現れた'+(p.preg?'（疑似妊娠した）':''),mag:26});
return true;
}
var poss=mates.filter(function(q){return q.possessed;})[0];
if(poss&&r0<0.3){
poss.lastNight=h;poss.cnt.r18=(poss.cnt.r18||0)+1;
var po=HK.Pos?HK.Pos.order(poss,p,[poss,p]):[poss,p];
var pt=ST.fmt(fp(S,po[0]===poss?POSSESS:POSSESS_REV),{x:po[0].name,y:po[1].name});
var px=lwEro(S)&&HK.Lewd.storyForceSex?HK.Lewd.storyForceSex(S,po[0],po[1]):null;
if(px&&po[0]===poss&&HK.R18M)px=HK.R18M.resist(S,poss,po[1],{endure:false})+px;
ST.say(S,{actors:[po[0],po[1]],tag:'憑依',kind:'climax',text:pt+(px||pairSex(S,po[0],po[1],{mood:'rough',fore:false,short:true})),why:poss.name+'は取り憑かれていた',mag:28});
return true;
}
if(r0>0.88){
if(top){ST.say(S,{actors:[p],tag:'清めの湯',text:ST.fmt(fp(S,BATH_NO),{a:p.name}),why:'祭りの前の「清め」に誘われたが、'+p.name+'は応じなかった',mag:12});return true;}
ST.say(S,{actors:[p],tag:'清めの湯',kind:'climax',text:lwEro(S)?eroMob(S,p,'bath',fp(S,ERO_IN.bath)):HK.JDark&&HK.JDark.roll(S,p)?HK.JDark.text(S,'bath',p):ST.fmt(fp(S,BATH),{a:p.name})+(HK.R18M?HK.R18M.npc(S,'villager')+pz(S,p,'react',true)+(HK.R18M.isStrong(p)?HK.R18M.resist(S,'crowd',p):HK.R18M.moans(S,p,['start','mid','climax'])):''),why:'祭りの前の「清め」と称して、村人に体を弄ばれた'+(p.aphro?'（媚薬が回っていた）':''),mag:24});
return true;
}
if(mates.length&&(r0===0.5||(rng()<0.4+(p.aphro?0.15:0)&&(pcKeep>=1||rng()<pcKeep)))){
var fm0=mates.some(function(m){return HK.State.freeSex&&HK.State.freeSex(S,p,m);});
var q=fm0?HK.weighted(rng,mates,function(m){return HK.State.freeSex(S,p,m)?HK.FreeSex.factor(S,p,m):1;}):rng.pick(mates);q.lastNight=h;q.cnt.r18=(q.cnt.r18||0)+1;
var free= !!(HK.State.freeSex&&HK.State.freeSex(S,p,q));
var o=HK.Pos?HK.Pos.order(p,q,[p,q]):[p,q],X=o[0],Y=o[1];
var rough=S.ygo&&(X.viol>30||Y.viol>30);
var fmXY= !rough&& !isFF(X,Y)&&(HK.Pos&&HK.Pos.isF&&HK.Pos.hasM?HK.Pos.isF(X)&&HK.Pos.hasM(Y):(X.gender||(X.src&&X.src.gender))==='f'&&(Y.gender||(Y.src&&Y.src.gender))==='m');
var t0=ST.fmt(fp(S,rough?YGO_SEX:isFF(X,Y)?MUTUAL_FF:fmXY?MUTUAL_FM:MUTUAL),{x:X.name,y:Y.name});
if(fmXY&&HK.FM&&HK.FM.fixWith)t0=HK.FM.fixWith({pick:function(a){return fp(S,a);}},t0,X,Y.name);
var t=(free?HK.FreeSex.lead(S,p,q):'')+t0+pairSex(S,X,Y,{mood:rough?'rough':p.aphro||q.aphro?'drug':free?'drug':'love',fore:false});
if((!HK.Content||HK.Content.ok(S,'preg'))&&rng()<0.5+lv*0.3){Y.preg=true;t+=(HK.R18Thick&&HK.R18Thick.on(S)?'\n\n':'')+ST.fmt(fp(S,PREG),{y:Y.name});}
if(rng()<0.5)t+=(HK.R18Thick&&HK.R18Thick.on(S)?'\n\n':'')+pz(S,Y,'mutual');
p.m.fear=Math.max(0,p.m.fear-8);q.m.fear=Math.max(0,q.m.fear-8);
var strm=[X,Y].filter(function(c){return c.job==='streamer';})[0];
if(free){HK.FreeSex.mark(S,X,Y);HK.FreeSex.jealous(S,X,Y);}
ST.say(S,{actors:[X,Y],tag:'夜',kind:'climax',text:t,why:(free?HK.FreeSex.why(X,Y)+'／':'')+'媚薬の熱と恐怖で、参加者どうしで交わった'+(HK.R18M&&HK.R18M.lastPos(S)?'（'+HK.R18M.lastPos(S)+'）':'')+(Y.preg?'（'+Y.name+'が疑似妊娠した：生贄にされると巫女になりやすい）':''),mag:30});
if(strm)streamAfter(S,strm,strm===X?Y.name:X.name,false);
return true;
}
var resist=p.tr.cp*0.4+p.tr.caution*0.3-(p.aphro?0.35:0);
if(rng()<resist){ST.say(S,{actors:[p],tag:'夜這い',text:ST.fmt(fp(S,YOBAI_NO),{a:p.name}),why:'夜這いをはねのけた（CP・慎重さ'+(p.aphro?'。媚薬は回っていたが':'')+'）',mag:12});return true;}
top=top||(HK.Pos&&HK.Pos.vsNpc(p,'')==='top');
p.m.fear=Math.min(100,p.m.fear+6);
if(p.prank&& !top){
ST.say(S,{actors:[p],tag:'夜這い',kind:'climax',text:lwEro(S)?eroMob(S,p,'yobai',fp(S,PRANK)):ST.fmt(fp(S,PRANK),{a:p.name})+(HK.R18M?HK.R18M.moans(S,p,['start','mid','climax']):''),why:'ドッキリだと思い込んでいたので、拒まなかった',mag:26});
return true;
}
var cv=top?null:coverTry(S,p,'yobai','man','村の男たち');
if(cv)coverPre(S,cv);
var p0=p;
if(cv&&cv.eff==='sub'){p=cv.r;p.lastNight=h;p.cnt.r18=(p.cnt.r18||0)+1;p0.cnt.r18=Math.max(0,p0.cnt.r18-1);p.m.fear=Math.min(100,p.m.fear+6);}
if(cv&&cv.eff==='both')cv.r.lastNight=h;
if((!HK.Content||HK.Content.ok(S,'preg'))&& !top&&rng()<0.3+lv*0.3)p.preg=true;
ST.say(S,{actors:[p],tag:'夜這い',kind:'climax',text:(function(){var M=HK.R18M,ma={a:p.name};if(!top&&lwEro(S))return eroMob(S,p,'yobai',fp(S,ERO_IN.yobai));if(!top&&HK.JDark&&HK.JDark.roll(S,p))return HK.JDark.text(S,'yobai',p);if(!M)return ST.fmt(fp(S,top?YOBAI_TOP:YOBAI),ma);if(top)return ST.fmt(fp(S,HK.Pos&&HK.Pos.isF(p)?YOBAI_TOP_F:YOBAI_TOP),ma)+M.say(S,p,'top')+ST.fmt(fp(S,YOBAI_TOP_NPC),ma)+(HK.Pos&&HK.Pos.isF(p)?'':M.say(S,p,'topc'));if(!p.aphro||M.isStrong(p))return ST.fmt(fp(S,YOBAI_FORCE),ma)+M.resist(S,{name:'村の男'},p,{endure:false})+ST.fmt(fp(S,YOBAI_ACT),ma)+pz(S,p,'react',true)+M.say(S,p,'endure');return ST.fmt(fp(S,YOBAI),ma)+M.npc(S,'villager')+pz(S,p,'react',true)+M.moans(S,p,['start','mid','climax']);})()+coverWatch(S,cv)+(p.preg&& !top?ST.fmt(fp(S,PREG),{y:p.name}):'')+(!top&&rng()<0.6?pz(S,p,'after'):''),why:'村人の夜這い'+(p.aphro?'（媚薬で抗えなかった）':'')+(p!==p0?'（'+p0.name+'の身代わりになった）':''),mag:26});
if(cv){coverBoth(S,cv,'夜這い','yobai');coverAfter(S,cv);}
if(p.job==='streamer')streamAfter(S,p,'村人',!top);
return true;
},
cave:function(S,live){
var rng=S.rng,lv=lvMob(S);
if(lv<=0)return;
if(HK.State)live=live.filter(HK.State.mobSexOk);
if(HK.Content&& !HK.Content.ok(S,'force'))return;
live=live.filter(function(q){return!(HK.Pos&&HK.Pos.hardTopNpc?HK.Pos.hardTopNpc(q):hardTop(q));});
if(!live.length||rng()>lv*0.6)return;
var p=rng.pick(live);p.cnt.r18=(p.cnt.r18||0)+1;
var cv=coverTry(S,p,'cave','kin','眷属'),p0=p;
if(cv)coverPre(S,cv);
if(cv&&cv.eff==='sub'){p=cv.r;p.cnt.r18=(p.cnt.r18||0)+1;p0.cnt.r18=Math.max(0,p0.cnt.r18-1);}
if((!HK.Content||HK.Content.ok(S,'preg'))&&rng()<lv*0.4)p.preg=true;
p.m.fear=Math.min(100,p.m.fear+8);
var cLong=jLong(S,p)?HK.JDark.text(S,'cave',p):'';
var cEro= !cLong&&lwEro(S)?eroMob(S,p,'cave',fp(S,ERO_IN.cave)):'';
ST.say(S,{actors:[p],tag:'洞窟',kind:'climax',text:(cLong||cEro||(HK.R18M?HK.R18M.resist(S,'god',p,{endure:false}):'')+ST.fmt(fp(S,CAVE),{a:p.name,g:S.G.call})+(HK.R18M?HK.R18M.npc(S,'god',p):''))+coverWatch(S,cv)+(p.preg?(cLong?'\n\n':cEro?lwSep(S):'')+'下腹に、熱いものが宿った感覚があった。':''),why:'洞窟の眷属に襲われた'+(p!==p0?'（'+p0.name+'の身代わりになった）':'')+(p.preg?'（疑似妊娠）':''),mag:26});
if(cv){coverBoth(S,cv,'洞窟','cave');coverAfter(S,cv);}
},
ritual:function(S,vic){
var rng=S.rng,lv=lvMob(S);
if(lv<=0)return null;
if(HK.State&& !HK.State.mobSexOk(vic))return null;
if(HK.Content&& !HK.Content.ok(S,'force'))return null;
if(rng()>0.35+lv*0.6)return null;
if(!JS.R18.room(S,[vic]))return null;
JS.R18.spend(S,[vic]);
var top=HK.Pos&&HK.Pos.vsNpc(vic,'')==='top';
if(top)return{text:ST.fmt(fp(S,RITUAL_TOP),{a:vic.name,g:S.G.call})+(HK.R18M?HK.R18M.say(S,vic,'top'):'')+vic.name+'の姿は、それきり誰の目にも映らなかった。',miko:false};
var strong=HK.R18M&&HK.R18M.isStrong(vic);
var cv=coverTry(S,vic,'ritual','man','村人たち');
var cvT=cv?coverPre(S,cv,true)+(lwSep(S)||''):'';
var rLong=jLong(S,vic);
var t=cvT+(lwEro(S)?eroMob(S,vic,'ritual',fp(S,ERO_IN.ritual))+lwSep(S):rLong?HK.JDark.text(S,'ritual',vic)+'\n\n':(strong?HK.R18M.resist(S,'crowd',vic,{endure:false}):'')+ST.fmt(fp(S,RITUAL),{a:vic.name,g:S.G.call})+pz(S,vic,'rite')+(HK.R18M?(strong?HK.R18M.say(S,vic,'endure'):HK.R18M.moans(S,vic,['start','mid','climax']))+HK.R18M.npc(S,'god',vic):''));
if(cv){
t+=coverWatch(S,cv);
if(cv.eff==='both'){var w=S.r18Who||(S.r18Who={});w[cv.r.i]=(w[cv.r.i]||0)+1;t+=lwSep(S)+coverBothText(S,cv,'ritual');}
t+=lwSep(S);
}
var miko= !top&&(!HK.Content||HK.Content.ok(S,'preg'))&&rng()<(vic.preg?0.75:0.25+lv*0.25);
if(miko)t+=ST.fmt(fp(S,MIKO),{a:vic.name,g:S.G.call});
else t+=vic.name+'の姿は、それきり誰の目にも映らなかった。';
if(cv)t+=coverRite(S,cv);
return{text:t,miko:miko};
}
};
})();
});
;
/* ==== js/jashin-duo-r18.js ==== */
HK.Load.def(389,'js/jashin-duo-r18.js',function(){
(function(){
'use strict';
var JS=window.HK&&window.HK.JASHIN;
if(!JS)return;
JS.DUO_EV=JS.DUO_EV||[];
function L(s){return s.split('|');}
JS.DUO_R18X={
ally:{
intro:L('障子の外で、虫の声が途切れた。村の夜は、二人が思っていたよりずっと静かだった。|遠くで祭り囃子の稽古の音がしていた。誰も、この部屋のことなど気にしていなかった。|明日も生きて村を出られるか分からない。その思いが、二人の口数を少なくしていた。'),
after:L('夜が明ける前に、{u}は{t}の腕の中で小さく寝息を立てていた。{t}はその寝顔を、しばらく黙って見つめていた。|翌朝、二人は何事もなかったように朝餉の席に着いた。ただ、目が合うたびに、どちらからともなく笑みがこぼれた。|{u}は{t}の胸に耳を当て、「生きて帰ろう」と囁いた。{t}は返事の代わりに、{u}の髪を撫でた。|明け方、{t}は{u}の肩に羽織をかけてやった。障子越しの朝の光が、二人の重ねた手を照らしていた。|二人は夜通し、村を出たあとのことを話した。叶うかどうか分からない約束が、一つ、二つと増えていった。'),
ng:L('気まずさを紛らわすように、{a}は明日の段取りを話しはじめた。{b}は相槌を打ちながら、ずっと膝の上の手を見ていた。|翌朝、二人はいつもより少しだけ離れて座った。|{b}は「今は、生き延びることだけ考えよう」と小さく言った。{a}は頷くしかなかった。'),
body:{
m:L('{t}は{u}の脚をそっと開かせ、確かめるようにゆっくりと腰を進めた。{u}がしがみつくたびに、{t}は動きを止めて、汗ばんだ額に口づけた。|{t}は{u}の手を握ったまま、深く、静かに体を重ねていった。互いの鼓動が、同じ速さになっていくのが分かった。|{t}は{u}の名を何度も呼びながら、少しずつ動きを速めた。{u}は{t}の背に腕を回し、その名を呼び返した。'),
ff:L('{t}は{u}の脚のあいだに指を沈め、{u}の表情を確かめながら、ゆっくりと動かした。{u}が息を詰めるたびに、{t}は耳元で大丈夫だと囁いた。|{t}は{u}の胸元に唇を落とし、舌で円を描くように辿りながら、指先で熱いところを撫で続けた。{u}の指が、{t}の髪を握りしめた。|{t}は{u}の太腿の内側に口づけ、そのまま顔を埋めた。{u}は口元を手で覆い、声を殺そうとして、殺しきれなかった。'),
fm:L('{t}は{u}を仰向けにさせて跨り、自分の中へゆっくりと導いた。見下ろす{t}の目は、驚くほど優しかった。|{t}は{u}の上で腰を揺らしながら、{u}の両手を自分の指と絡めた。主導権を握っているのは{t}なのに、{t}のほうが先に声を漏らした。|{t}は{u}の胸に手をついて跨り、{u}の顔を見つめたまま、深く腰を沈めた。{u}は{t}の腰を支え、その動きに身を任せた。')
}
},
foe:{
intro:L('互いの手の内を探り合う視線が、いつの間にか別の熱を帯びていた。|言い争う声を聞きつけて、廊下の足音が一度だけ止まり、また遠ざかっていった。|憎まれ口の応酬の合間に、妙な沈黙が落ちた。どちらも、それを破ろうとしなかった。'),
after:L('事が終わると、二人は無言で背を向け合った。それでも、どちらも部屋を出ていこうとはしなかった。|翌朝、{u}は{t}に「昨夜のことは貸しにしておく」と言った。{t}は鼻で笑ったが、否定はしなかった。|{t}は乱れた襟を直しながら、「これで分かり合えたとは思うな」と吐き捨てた。{u}の首筋には、くっきりと痕が残っていた。|明け方、{u}はまだ眠る{t}の顔をしばらく眺めていた。憎いはずの顔が、少しも憎く見えなかった。|翌日、二人の言い争いはいつもより激しかった。誰も、その理由を知らなかった。'),
ng:L('翌朝、二人の対立は前よりも根深くなっていた。|{a}は「二度とない」と吐き捨て、{b}は「こっちの台詞だ」と返した。|残された気まずさは、二人の間の溝をもう一段深くした。'),
body:{
m:L('{t}は{u}の脚を乱暴に割り、睨み合ったまま奥まで沈めた。{u}は歯を食いしばり、それでも{t}の腰に脚を絡めて離さなかった。|{t}は{u}の手首を畳に押さえつけ、言い返す隙を与えないほど深く、強く腰を打ちつけた。{u}の罵りは、途中から言葉にならなかった。|{t}は{u}の髪を掴んで顔を上げさせ、負けを認めさせるように動きを速めた。{u}は最後まで目を逸らさず、{t}を睨み返し続けた。'),
ff:L('{t}は{u}の手首を片手でまとめて押さえ、もう片方の手を容赦なく脚のあいだへ滑り込ませた。{u}は睨み返しながら、指の動きに合わせて腰を浮かせた。|{t}は{u}の首筋に歯を立て、痕を残しながら、指で{u}の弱いところばかりを執拗に責めた。{u}は悔しそうに唇を噛み、それでも声を抑えきれなかった。|{t}は{u}の脚を押し開き、顔を埋めた。{u}は{t}の髪を掴んで引き剥がそうとして、そのまま縋りつくように握りしめた。'),
fm:L('{t}は{u}の肩を畳に押さえつけて跨り、見下ろしたまま腰を沈めた。{u}が何か言いかけると、{t}は腰を揺らしてその言葉を潰した。|{t}は{u}の上で、主導権を見せつけるように、わざとゆっくり腰を動かした。{u}が焦れて手を伸ばすと、{t}はその手を払いのけた。|{t}は{u}の胸ぐらを掴んだまま跨り、搾り取るように激しく腰を揺らした。{u}は悔しそうに顔を歪め、漏れそうになる声を噛み殺した。')
}
}
};
[
['ally020','ally','journalist','writer','r18','talk','obs',
'取材ノートと原稿用紙を並べた民宿の小部屋で、{a}と{b}は夜更けまで互いの文章を直し合っていた。ふと指先が触れ、どちらも手を引かなかった。|{a}が村で聞き込んだ話を、{b}は一行ずつ原稿に書き留めていた。{b}「あなたの言葉は、そのまま使える」赤鉛筆を置いた{b}の手に、{a}の手が重なった。|締め切りもない旅先で、{a}と{b}は一冊の取材帳を挟んで向かい合っていた。{a}は、{b}の書く文章が好きだと、初めて口にした。',
'{t}は{u}の手から万年筆を取り上げ、そのまま畳の上に組み敷いた。指と舌でゆっくりとほどかれ、{u}は声を殺して何度も果てた。|{t}は原稿用紙を脇へ押しやり、{u}の襟元に指をかけた。{u}の肌に触れるたび、{t}は言葉を探すように指を止め、それから唇でなぞった。|{t}は{u}の耳元で、さっき書き上げた一節を囁いた。続きを書くように、{t}の指が{u}の背中に文字を綴り、{u}は息を乱していった。',
'{t}が肩を引き寄せると、{u}は身を固くしてその手をそっと外した。明かりをつけ直した部屋で、二人はもう目を合わせられなかった。|{u}は「これを書かれたら困る」と冗談めかして身を引いた。{t}は笑って万年筆を置いたが、その笑顔はぎこちなかった。|{t}が顔を寄せると、{u}は原稿の束で顔を隠した。「明日、読み返したら後悔しそう」――{t}は黙って、行灯の火を小さくした。'],
['ally022','ally','celeb','priest','r18','talk','rite',
'夜の社殿で、{b}は清めの作法だと言って{a}の手に冷たい水を注いだ。誰もが顔を知る{a}も、ここではただの一人の参拝客にすぎなかった。|人目を避けて社務所に逃げ込んだ{a}に、{b}は黙って温かい茶を出した。{a}「ここでは、誰も私を見ないんですね」{b}は、見ていますよ、と小さく答えた。|祭りの宴で引っ張りだこだった{a}は、夜更けにようやく{b}の待つ社殿へ戻ってきた。{b}は、{a}の頬についた紅を、懐紙でそっと拭った。',
'灯明の揺れる奥の間で、{t}は{u}の帯を静かに解いた。首筋に唇を落とし、指と舌で確かめ合ううちに、{u}は何度も果てた。|{t}は祝詞を唱えるような静かな手つきで、{u}の肌を一枚ずつ清めていった。{u}は畳に指を立て、その丁寧さに耐えきれずに声を漏らした。|{t}は{u}の髪から簪を抜き、ほどけた髪に指を通した。奥の間の御簾の陰で、二人は誰にも見られない一夜を重ねた。',
'{t}が手を伸ばしかけたとき、{u}は神域でそれはできないと身を引いた。冷えた空気だけが残り、二人は互いの顔を見ずに社殿を出た。|{b}は「あなたを、明日の噂の種にはしたくない」と{a}に首を振った。{a}は黙って頷き、灯明を一つだけ消した。|{t}が身を寄せると、{u}は袖で顔を隠した。「今夜のことは、神さまだけが知っていればいい」――それきり、二人は朝まで並んで座っていた。'],
['ally037','ally','prof','streamer','r18','lore','explore',
'停電した民宿の一室で、{b}は「今夜は配信しない」と言ってカメラを伏せた。蝋燭の火が揺れ、{a}の古文書の講義はいつのまにか途切れていた。|{b}が撮ってきた廃祠の映像を、{a}は一コマずつ止めて解説していた。{b}「先生の話、配信より面白い」画面の明かりが、二人の顔を近づけた。|{a}の古い地図を頼りに、{b}は一日じゅう村を歩き回った。夜、泥だらけの{b}の足を、{a}は黙って手拭いで拭ってやった。',
'蝋燭を吹き消すと、{t}は{u}を布団に押し倒した。首筋に歯を立て、指と舌で、{t}は{u}を何度も果てさせた。|{t}は古文書の頁を繰るような慎重さで、{u}の浴衣の合わせを一枚ずつ開いていった。指先が肌の上で止まるたびに、{u}は質問の代わりに、甘い息を漏らした。|{t}は回していないカメラの横で、{u}の浴衣の合わせを開いた。誰にも配信されない夜を、二人は指と唇で確かめ合った。',
'{t}が身を寄せると、{u}は冗談めかしてその手を押し戻した。蝋燭が燃え尽きるまで、二人は気まずく黙り込んでいた。|{u}は「先生と生徒みたいで、なんだか照れる」と笑って身を引いた。{t}は咳払いをして、古文書に目を戻した。|{t}が手を伸ばしたとき、伏せたカメラの通知音が鳴った。{u}は慌ててスマホを掴み、そのまま画面から顔を上げなかった。'],
['ally050','ally','seer','ponkotsu','r18','spirit','explore',
'土蔵の二階に身を潜めた夜、{a}は{b}の運勢を占うと言って手を取った。{b}が得意げに語る的外れな推理を、{a}は今夜だけは笑わずに聞いていた。|{b}の迷推理が一つだけ当たった夜、{a}は「札にもそう出ていた」と微笑んだ。{b}は照れて、鼻の頭を掻いた。|{a}は札を一枚めくり、そこに描かれた恋人たちの絵を{b}に見せた。{b}は推理するまでもなく、その意味を悟った。',
'{t}は{u}の手を引き寄せ、そのまま藁の上に組み敷いた。指と舌でなぞられるたび{u}は息を詰め、二人は夜が白むまで肌を重ねていた。|{t}は、手相を見る真似をして{u}の掌の線を指でなぞり、そのまま手首へ、腕へと唇を這わせていった。占いの続きは、{u}の肌の上で読み解かれた。|{t}は散らばった札を脇へ寄せ、{u}を膝の上に抱き寄せた。札の示した通りの夜が、蔵の暗がりで静かに始まった。',
'{t}が顔を寄せた瞬間、床に並べたままの札が一枚、風もないのに裏返った。{u}は青ざめて身を離し、白けた空気の中、二人は背を向けて朝まで眠ったふりをした。|{b}は「この推理だけは、外したくない」と言って手を引いた。{a}は札を集めながら、少しだけ寂しそうに笑った。|{t}が手を握ると、{u}は「占いで決められるのは嫌だ」と首を振った。札は、それきりめくられなかった。'],
['ally059','ally','journalist','journalist','r18','talk','talk',
'雨の夜、民宿の一室で{a}と{b}は互いの取材メモを突き合わせていた。{a}「同業者に見せるのは初めてだ」灯りの下で、二人の膝が触れた。|聞き込みの成果を報告し合ううち、{a}と{b}は同じ村人から同じ嘘を聞かされていたと気づいた。笑い合ったあと、ふと沈黙が落ちた。|{b}は{a}の取材手帳の最後の頁に、自分の名前が書かれているのを見つけた。{a}は手帳を取り返そうとして、{b}の手を握ってしまった。',
'書きかけのメモが畳に散った。{t}は{u}を組み敷き、首筋に唇を這わせた。二人は雨音にまぎれて肌を重ね、夜が白むまで何度も果てた。|{t}は{u}の唇を、裏を取るように何度も確かめた。{u}の答えは、言葉ではなく、肌の熱で返ってきた。|{t}は{u}の手帳を閉じ、その手首を取って布団へ導いた。特ダネよりも欲しかったものを、{t}は指先で一つずつ確かめていった。',
'{t}が{u}の肩に手をかけたとき、{u}はその手を払いのけた。特ダネを抜くための芝居だろうと言われ、{t}は言葉を失った。|{u}は「これはオフレコにできない」と苦笑して身を引いた。{t}は手帳を閉じ、雨の音だけを聞いていた。|{t}が顔を寄せると、{u}は「明日の記事が書けなくなる」と目を伏せた。二人は朝まで、黙って原稿を書き続けた。'],
['ally061','ally','sleuth','ponkotsu','r18','obs','explore',
'土蔵に閉じこめられた夜、{b}は見当違いの推理を延々と並べ立てた。{a}はその穴を三つ指摘してから、{b}の口元に指を当てた。{a}「少し黙って」|{b}が村中を走り回って集めてきた的外れな証拠の山を、{a}は一つずつ検めていた。その中に一つだけ、本物の手がかりが混じっていた。{a}「君のおかげだ」|宿の縁側で、{b}は「いつか先生みたいになりたい」と言った。{a}は推理するまでもない{b}の目の熱さに、少しだけ戸惑った。',
'懐中電灯が転がり、蔵の闇が二人を包んだ。{t}は{u}を古い長持の上に組み敷き、指と舌で丁寧に乱していった。言葉はやがて、甘い吐息に変わった。|{t}は{u}の弱いところを、推理するように一つずつ探り当てていった。言い当てられるたびに、{u}は小さく声を上げた。|{t}は{u}の帽子を脱がせ、乱れた髪に指を差し入れた。証拠を確かめるように、{t}の唇が{u}の首筋から胸元へと下りていった。',
'{t}が顔を寄せた瞬間、蔵の外で閂の外れる音がした。{u}は弾かれたように身を離し、白けた空気のまま、二人は朝まで背中合わせで座った。|{b}は「これじゃ助手失格だ」と真っ赤になって飛びのいた。{a}は苦笑して、推理の続きを話しはじめた。|{t}が手を伸ばすと、{u}は「この謎は、自分で解きたい」と言って首を振った。{t}は、その答えを待つことにした。'],
['ally065','ally','streamer','sleuth','r18','explore','obs',
'配信を終えた民宿の一室で、{a}は撮れ高を確かめようと録画を見返していた。{b}は画面の端に映る{a}の視線が、ずっと自分を追っていると指摘した。{a}「そこまで見抜くか」|{b}の推理を生配信で流したいと言う{a}に、{b}は「推理は見世物じゃない」と首を振った。{a}はカメラを止め、{b}の話を一人で聞いた。|{a}の配信のコメント欄に、{b}への質問ばかりが並んでいた。{a}は少し拗ねて、{b}の肩に頭を預けた。',
'{t}はカメラのレンズを伏せ、{u}を布団に組み敷いた。誰にも映らない暗がりで、二人は指と舌で確かめ合うように肌を重ね、何度も果てた。|{t}は二人のスマホを裏返して枕元に置き、配信の灯りの消えた部屋で、{u}の浴衣の帯を解いた。{u}は、誰にも見せたことのない顔を、{t}にだけ見せた。|{t}は{u}の視線の動きを一つずつ読み取りながら、{u}が触れてほしい場所を、言葉より先に探り当てていった。',
'{t}が{u}の頬に触れた瞬間、伏せたはずのカメラの録画ランプが赤く灯っていた。{u}は無言で身を離して部屋を出ていき、{t}を振り返らなかった。|{a}は「これ、切り抜かれたら終わりだから」と笑って身を引いた。{b}は笑い返したが、目は笑っていなかった。|{t}が手を伸ばすと、{u}はスマホを掴んで、通知を確かめるふりをした。画面の明かりが、{u}の赤い頬を照らしていた。'],
['ally071','ally','ghost','priest','r18','spirit','rite',
'深夜の拝殿で、{a}の計測器が狂ったように鳴った。{b}は祝詞を唱えて場を鎮め、汗に濡れた額を拭った。{a}「まだ、熱が残ってる」|{a}の録音機に、二人のものではない囁き声が入っていた。{b}は録音機に御幣を当て、{a}の震える肩をそっと抱いた。|{b}が結界を張った部屋で、{a}は計測器の数値がようやく落ち着くのを見届けた。{a}「この部屋だけは、静かだ」二人は、肩を並べて座った。',
'機材の赤い光だけが灯る拝殿の隅で、{t}は{u}の帯をほどいた。{t}は{u}を板の間に組み敷き、熱が引くまで何度も肌を重ねた。|{t}は{u}の脈を確かめるように手首に唇を当て、それから胸元、腹へと口づけを下ろしていった。計測器の針が、二人の鼓動に合わせて揺れていた。|{t}は{u}の浴衣の袖に手を差し入れ、冷えた肌を温めるように撫でた。結界の中で、二人は外の怪異を忘れて肌を重ねた。',
'{t}が{u}の手を取ったとき、{u}は神前でこれ以上はいけないと首を振った。二人は計測器の音だけが残る拝殿を別々に出て、翌朝まで口をきかなかった。|{u}は「霊に見られている気がする」と身をすくめた。{t}は計測器の電源を落とし、それ以上は何も言わなかった。|{t}が顔を寄せると、録音機がひとりでに再生を始めた。{u}は青ざめて身を離し、二人は朝まで灯りを点けたまま過ごした。'],
['ally088','ally','manager','sleuth','r18','fight','obs',
'夜更けの土蔵で見張りを交代するとき、{b}は{a}の手の震えを見逃さなかった。{a}がずっと無理をしていたことを、{b}はとうに見抜いていた。|皆の食事と寝床を整えて回った{a}に、{b}は「君の分の布団がない」と指摘した。{a}は笑ってごまかそうとしたが、{b}は自分の布団の端を空けた。|{a}は{b}の推理を、手帳に几帳面に書き留めていた。{b}「君がいないと、私は推理を忘れる」{a}は、手帳から顔を上げられなかった。',
'気遣いの言葉より先に、指が絡んだ。{t}は{u}を藁の上に組み敷き、強張った体を指と舌でほどいていった。二人は夜明けまで肌を寄せ合っていた。|{t}は{u}の肩を揉みほぐすように撫で、凝り固まった背中に唇を落としていった。{u}は、こうして誰かに甘えるのは久しぶりだと呟いた。|{t}は{u}の疲れの浮いた目元に口づけた。それから、ずっと張りつめていた{u}の体を、時間をかけて労わった。',
'{t}は{u}を抱き寄せたが、{u}は見張りの最中だと身を引いた。行き場を失った腕を下ろし、{t}は気まずく背を向けた。|{u}は「今は、皆を守るのが先だ」と言って立ち上がった。{t}は、その背中を見送ることしかできなかった。|{t}が手を重ねると、{u}は「明日の段取りが狂う」と困ったように笑った。{t}は手を引き、段取りの話に付き合った。'],
['ally100','ally','celeb','occult','r18','talk','lore',
'旧家の離れに泊められた夜、{a}は世間向けの顔を脱ぎ捨て、{b}の怪異譚に聞き入った。灯明が揺れるたび、二人の距離は少しずつ縮まった。|{b}の語る禁じられた伝承に、{a}は子どものように目を輝かせた。{a}「その話、誰にも言わないで。私だけのものにしたい」|{a}のファンだという村人に囲まれて疲れ果てた夜、{b}は{a}を古い書庫に匿った。埃っぽい書庫で、{a}は初めて素顔で笑った。',
'怪異譚が途切れたところで、{t}は{u}の手首をとって布団の上に組み敷いた。{t}は{u}の首筋に歯を立て、二人は灯明が燃え尽きるまで肌を重ねた。|{t}は{u}の耳元で、二人で読んだ禁じられた伝承の一節を囁きながら、{u}の着物の衿をゆっくりと開いていった。|{t}は古い書物を閉じ、{u}の顎を指で持ち上げた。怪異譚よりも妖しい夜が、書庫の暗がりで始まった。',
'事を終えたあと、{u}は、これも明日には忘れる一夜かと尋ねた。{t}は答えられず、二人は背を向けたまま夜明けを待った。|{b}は「あなたの名前に、傷をつけたくない」と言って身を引いた。{a}は、世間向けの顔に戻って微笑んだ。|{t}が身を寄せると、{u}は書物を盾のように抱えた。「この先は、まだ伝承に書かれていない」――二人は、ページをめくらずに夜を明かした。'],
['foe001','foe','police','sleuth','r18','fight','obs',
'民宿の離れで、{b}は{a}の聞き込みの穴を一つずつ論破していった。胸ぐらを掴んだ{a}の太い腕を、{b}は振り払わなかった。{b}は「どうせ殴れない」と笑った。|{a}が集めた証拠を、{b}は鼻で笑って捨てた。{a}「素人が、捜査の邪魔をするな」{b}「素人に先を越されるのが怖いのか」――二人の顔が、息の届く距離まで近づいた。|{a}は{b}を容疑者扱いし、部屋の外へ出さないと言い張った。{b}は涼しい顔で、取り調べなら一晩じゅう付き合うと答えた。',
'次の瞬間、{t}は{u}を畳に組み敷いていた。{u}が拒まず襟を引き寄せると、{t}は憎しみを噛み殺すように首筋に歯を立て、夜明け近くまで何度も果てさせた。|{t}は{u}を壁際に追い詰め、言い返す唇を塞いだ。{u}は抵抗するふりをして、{t}の背に爪を立てた。|{t}は{u}の両手首を手錠のように片手で押さえ込んだ。{u}は挑発するように笑い、自分から襟を緩めた。取り調べは、言葉ではないもので続いた。',
'唇が触れる寸前、{u}は{t}の肩を突き飛ばした。{t}は舌打ちし、二人は背を向けたまま朝まで一言も交わさなかった。|{u}は{t}の手を払いのけ、「証拠もないのに踏み込むな」と冷たく言った。{t}は拳を握りしめ、部屋を出ていった。|{t}が詰め寄ると、{u}は「それは自白か」と鼻で笑った。{t}は顔を赤くして手を離し、二人の溝はさらに深まった。'],
['foe004','foe','streamer','sleuth','r18','explore','obs',
'廃れた社務所で、{a}は{b}の推理の種明かしを撮ろうとカメラを向けた。{b}は配信の仕込みを三つ言い当て、レンズを手で覆った。薄暗い部屋の空気が変わった。|{b}は{a}の配信を「再生数稼ぎの茶番」と切り捨てた。{a}はカメラを回したまま、{b}に詰め寄った。{a}「じゃあ、本物を撮らせてよ」|{a}の配信で推理を晒された{b}は、夜更けに{a}の部屋へ乗り込んできた。{b}「削除しろ」{a}は、条件次第だと笑った。',
'{t}はカメラを床に伏せ、{u}を古い座布団の上に組み敷いた。{u}は抗わず背に爪を立て、{t}は恨み言ごと唇を塞いで、指と舌で何度も果てさせた。|{t}は{u}のスマホを取り上げて放り投げ、{u}の顎を掴んだ。{u}は睨み返しながら、自分から{t}の唇に噛みついた。|{t}は{u}の挑発を受けて立つように、{u}の浴衣を剥いだ。撮られることのない夜に、二人は互いの本性を晒し合った。',
'肌を重ねかけたところで、{t}は録画が回ったままなのに気づいた。{u}は冷たい目で服を整え、黙って社務所を出ていった。|{b}は{a}の手を払いのけ、「それも撮れ高にするつもりか」と吐き捨てた。{a}は言い返せなかった。|{a}が顔を寄せると、{b}は{a}のカメラを掴んで録画を止めた。「証拠を残さない主義でね」――{b}はそれだけ言って、背を向けた。'],
['foe006','foe','civ','writer','r18','talk','obs',
'雨で足止めされた民宿の一室で、{b}は{a}の平凡さを小説の種にすると嘲った。{a}が言い返そうと詰め寄ったとき、二人の距離は近すぎた。|{b}は{a}の何気ない仕草を、手帳に書き留めていた。{a}がそれを見咎めると、{b}は「取材だ」と悪びれずに言った。|{a}が偶然見つけた手がかりを、{b}は自分の手柄のように語った。{a}は夜更けに、{b}の部屋へ文句を言いに行った。',
'{t}は{u}の手首を掴んで布団に押し倒した。{u}は嘲りの続きを言いかけ、そのまま{t}の首に腕を回した。雨音に紛れて、二人は苛立ちをぶつけ合うように肌を重ねた。|{t}は手帳を取り上げて投げ捨て、{u}の唇を塞いだ。{u}は悔しげに何か言いかけ、そのまま{t}の背に腕を回した。|{t}は{u}の冷ややかな目を見下ろし、その目が乱れるまで、指と舌で{u}を責め続けた。',
'唇が重なった直後、{u}は顔を背けて{t}を押しのけた。翌朝、二人は目も合わせずに冷めた朝食をとった。|{b}は「平凡な展開だ」と鼻で笑い、{a}の手を払った。{a}は言い返す気力もなく、部屋を出た。|{a}が詰め寄ると、{b}は手帳を胸に抱えて、「それ以上近づいたら書く」と言った。{a}は、手を引くしかなかった。'],
['foe031','foe','musician','police','r18','obs','fight',
'祭りの宵、{b}は夜中に笛を吹く{a}を怪しいと言って腕を掴んだ。人気のない神楽殿の板の間で、二人の息が近づいた。|{a}は祭囃子の拍子の狂いに気づいたと言ったが、{b}は信じなかった。{b}「音で事件が解けるなら、警察はいらない」{a}は、{b}の耳元で笛の音を一つ鳴らした。|夜回りの{b}に見咎められた{a}は、職務質問の続きを神楽殿で受けることになった。答えるたびに、{a}は{b}の顔を挑むように覗き込んだ。',
'{t}は{u}を板の間に押し倒した。{u}は睨んだまま自ら襟を緩め、{t}は憎まれ口ごと唇を塞いだ。遠い祭囃子に合わせるように、二人は何度も果てた。|{t}は{u}の手首を掴んだまま、祭囃子の拍子に合わせて{u}を責め立てた。{u}は拍子を乱すまいとして、乱された。|{t}は{u}の襟を掴んで引き寄せ、汗ばんだ首筋に唇を這わせた。{u}は低く呻きながら、引き剥がすはずの手で{t}の髪を掴んだ。',
'首筋に触れた{t}の手を、{u}は払いのけた。{u}は「勘違いしないで」と言い、残された{t}は暗い板の間で唇を噛んだ。|{b}は笛を取り上げて、「これは預かる」と冷たく言った。{a}は、取り上げられた笛より大事なものを失った気がした。|{a}が身を寄せると、{b}は一歩下がって距離を取った。「これ以上は、職務の範囲外だ」――祭囃子だけが、虚しく鳴り続けた。'],
['foe063','foe','psychic','sleuth','r18','spirit','obs',
'停電した民宿の一室で、{a}と{b}は霊視と推理のどちらが正しいかで詰め寄り合っていた。{b}「その目で私の嘘も見える？」蝋燭の火が揺れ、二人の距離は近すぎた。|{b}は{a}の霊視を「当て推量の言い換え」と切り捨てた。{a}は{b}の背後を指差し、「そこに、あなたが一番恐れているものがいる」と言った。|{a}が見たという霊を、{b}は論理で一つずつ否定していった。最後の一つを否定しかけたとき、{b}の肩に冷たい手が触れた。',
'言い返す代わりに、{t}は{u}の手首をつかんで畳に組み敷いた。{u}は睨み返したまま拒まず、憎まれ口ごと唇を塞がれた。夜明けまで、二人は何度も肌を重ねた。|{t}は{u}の目を覗き込み、心の底まで見透かすように、{u}の弱いところを探り当てていった。{u}は、見抜かれる悔しさに唇を噛んだ。|{t}は{u}の反論をすべて封じるように、言葉を挟む隙のないほど深く口づけた。夜が白んでも、二人は離れなかった。',
'唇が触れる寸前で、{b}は{a}の肩を押し返した。心の中まで覗かれるのはごめんだと吐き捨て、{b}は部屋を出ていった。|{u}は「その先は、見なくても分かる」と冷たく言い、身を引いた。{t}は、自分の心を読まれた気がした。|{t}が手を伸ばしたとき、部屋の隅の暗がりで何かが笑った。二人は同時に身を離し、互いを責めるように睨み合った。'],
['foe064','foe','writer','seer','r18','obs','spirit',
'深夜の離れで、{a}の原稿を{b}の占いが不吉だと断じた。言い合いの声が途切れたとき、二人は互いの息遣いだけを聞いていた。|{b}は{a}の運命を札で読み、{a}は{b}の嘘を文章の癖から読んだ。どちらも、相手に読まれることだけは我慢ならなかった。|{a}が書いた結末を、{b}は「その通りにはならない」と笑った。{a}は原稿を握りしめ、{b}に詰め寄った。',
'{t}は{u}の襟元をつかんで引き寄せ、そのまま布団に押し倒した。{u}は嫌悪を浮かべたまま目を閉じて身を委ね、{t}の指と舌に夜更けまで何度も果てた。|{t}は床の札を払い散らし、その上に{u}を横たえた。{u}は不吉な札に囲まれたまま、{t}の手に乱されていった。|{t}は、原稿にも札にもなかった夜を{u}に突きつけた。{u}は読めなかった結末に戸惑いながら、{t}の背に爪を立てた。',
'肌に触れた瞬間、{b}は占いの札を握りしめて身を引いた。{a}は書きかけの場面を壊されたような顔で、黙って灯りを消した。|{b}は「札に出ていない」と言って{a}の手を払った。{a}は、筋書きを書き直す気にもなれなかった。|{a}が身を寄せると、{b}は札を一枚めくって見せた。死神の札だった。二人は黙って離れ、朝まで背を向け合った。'],
['foe066','foe','muno','ghost','r18','explore','spirit',
'機材の並ぶ物置で、{a}がまたケーブルを引っかけた。怒鳴りつけた{b}と目が合ったとき、狭い部屋の空気が妙に熱を帯びた。|{a}が勝手に動かした計測器が、一晩分の記録を消していた。{b}は{a}の胸ぐらを掴み、物置の壁に押しつけた。|{a}は{b}の機材を「ただの玩具」と笑った。{b}が無言で録音機を突きつけると、そこには{a}の名を呼ぶ知らない声が入っていた。',
'{t}は{u}の腕を壁に押さえつけ、苛立ちをぶつけるように首筋に歯を立てた。{u}は罵りながらも拒まず、二人は機材の陰で、もつれ合うように肌を重ねた。|{t}は絡まったケーブルを払いのけ、{u}を機材の箱の上に組み敷いた。計測器が鳴り続けるなか、{u}は文句を言いかけて、言葉にならない声を漏らした。|{t}は{u}を物置の床に押し倒し、言い争いの続きのように、乱暴に唇を重ねた。{u}は{t}の襟を掴み、引き寄せ返した。',
'抱き寄せられかけた{b}は、{a}を突き飛ばした。倒れた{a}の下で録音機が砕け、{b}の目には軽蔑しか残っていなかった。|{b}は「これ以上、記録を台無しにするな」と冷たく言い放った。{a}は、自分が何を台無しにしたのか分からなかった。|{a}が手を伸ばしたとき、計測器が警報を鳴らした。{b}は{a}を押しのけて機材に駆け寄り、それきり振り返らなかった。'],
['foe073','foe','seer','police','r18','spirit','fight',
'閂の掛かる古い土蔵で、{b}は怪しい占い師として{a}を見張っていた。{a}「今夜、この蔵で一線を越える」。札を示す{a}に、{b}の顔が強張った。|{b}は{a}の予言を「人心を惑わす戯言」と取り締まろうとした。{a}は、{b}が明日怪我をすると予言し、{b}の手首に自分の数珠を巻いた。|{a}の予言どおりに村人が倒れた夜、{b}は{a}を問い詰めた。{a}は札を一枚、{b}の胸ポケットに差し込んだ。',
'どちらが先に動いたのでもなく、{t}は{u}を藁の上へ組み敷いた。{u}は挑むように見上げたまま拒まず、二人は憎しみごと何度も果てた。|{t}は床に落ちた札を払いのけ、{u}の手首を藁に押さえつけた。{u}は挑むように笑い、これも予言のうちかと囁いた。|{t}は{u}の襟を掴んで引き寄せ、詰問の続きを唇で行った。{u}は抗うふりをして、{t}の背に腕を回した。',
'{b}は伸ばしかけた手を握りしめ、土蔵の扉を乱暴に閉めて出ていった。外れた予言に、{a}は唇を噛んだ。|{b}は{a}の札を払い落とし、「予言に従うつもりはない」と言った。{a}は、自分の予言が外れたことに唇を噛んだ。|{a}が顔を寄せると、{b}はその手を振り払い、土蔵の閂を外した。冷たい夜風が、二人のあいだを吹き抜けていった。'],
['foe086','foe','musician','folk','r18','obs','lore',
'祭り太鼓が遠くで鳴る夜、神楽殿の裏で{a}と{b}は囃子の解釈をめぐって睨み合っていた。拍子に合わせるように、鼓動が早まった。|{b}は古い囃子の譜を示し、{a}の演奏を「伝統への冒涜」と断じた。{a}は譜を奪い取り、{b}の目の前で破ってみせた。|{a}が即興で奏でた節を、{b}は「禁じられた拍子だ」と青ざめた。{a}は構わず、{b}の耳元でその節を口ずさんだ。',
'{t}は{u}を板壁に押しつけ、太鼓の拍に合わせて肌を重ねた。{u}は憎まれ口を叩きながらも身を委ね、二人は祭りが終わるまで肌を重ねた。|{t}は床に散った古い譜を払いのけ、{u}の手首を掴んで引き寄せた。{u}は抗議の声を上げかけ、太鼓の音にかき消された。|{t}は{u}の着物の裾を割り、禁じられた拍子で{u}を責め立てた。{u}は何か言いかけて、そのまま言葉を失った。',
'唇が近づいたとき、{b}は顔を背けて冷たく笑った。{a}は太鼓の音に紛れるように、その場を離れた。|{b}は「伝統を汚す気はない」と言い捨てて背を向けた。{a}は笛を握りしめたまま、祭りの灯を見つめていた。|{a}が手を伸ばすと、{b}は譜を盾にして一歩下がった。太鼓の音だけが、二人のあいだで空回りしていた。'],
['foe092','foe','celeb','celeb','r18','talk','talk',
'村人に担ぎ上げられた宴のあと、離れの客間に残されたのは{a}と{b}だけだった。張り合ってきた名声の重みが、酒の熱で溶けていった。|宴の上座をめぐって張り合った二人は、夜更けの廊下で鉢合わせた。{a}「さっきの挨拶、私のほうが拍手が多かった」{b}「数えてたの？」|村人のサイン攻めから逃げ出した二人は、同じ納屋に隠れていた。互いの顔を見て、どちらからともなく吹き出した。',
'{t}は{u}の帯を解き、好敵手を見下ろすように組み敷いた。{u}は屈辱に目を細めながらも身を任せ、二人は夜通し何度も果てた。|{t}は{u}の顎を指で持ち上げ、カメラの前では見せない顔を見せろと囁いた。{u}は挑むように笑い、{t}の唇に噛みついた。|{t}は{u}を納屋の藁の上に押し倒し、張り合ってきた年月の分だけ、執拗に{u}を責め立てた。',
'肩に手が置かれた瞬間、{b}はその手を払いのけた。翌朝の二人は、人前でしか笑い合わない元の好敵手に戻っていた。|{u}は「週刊誌に売るつもり？」と冷たく言い、{t}の手を払った。{t}は笑顔のまま、内心で舌打ちした。|{t}が顔を寄せると、{u}は営業用の笑顔で身をかわした。「その手には乗らない」――二人の張り合いは、夜が明けても続いた。']
].forEach(function(r){
var it=L(r[7]),ok=L(r[8]),ng=L(r[9]);
JS.DUO_EV.push({id:r[0],mode:r[1],a:r[2],b:r[3],type:r[4],s1:r[5],s2:r[6],intro:it[0],ok:ok[0],ng:ng[0],introL:it,okL:ok,ngL:ng});
});
})();
});
;
/* ==== js/solo-jashin-r18-climax.js ==== */
HK.Load.def(390,'js/solo-jashin-r18-climax.js',function(){
(function(){
'use strict';
var HK=window.HK,JS=HK.JASHIN,ST=HK.Story;
if(!JS|| !JS.R18|| !ST)return;
function L(s){return s.split('|');}
function fp(S,a){return HK.Ero&&HK.Ero.fresh?HK.Ero.fresh(S,a,function(l){return ST.pick(S,l);}):ST.pick(S,a);}
var M=function(){return HK.R18M;};
var LUST=L('{x}は{y}を書架に押しつけ、服を引き裂くように剥ぎ取った。掌の口が{y}の肌のあちこちに吸いつき、{y}は仲間の目も構わずに声を上げた。|{x}は{y}を本の山の上に押し倒した。崩れた本のページが舞う中で、二人は獣のように互いを貪った。|{x}は{y}の手首を掴んで閲覧机に押し伏せた。掌の口に耳元で何かを囁かれるたび、{x}の腰は荒々しさを増し、{y}の声は書庫じゅうに響いた。');
var FERTILE=L('宴の輪の真ん中で、{x}と{y}は、村人たちに囲まれて交わった。土が二人の下で脈打ち、甘い葡萄酒の雨が肌を濡らした。|葡萄酒を口移しで飲まされた{x}は、{y}を苔の上に押し倒した。宴の歌が、二人の腰の動きに合わせて高まっていった。|宴の焚き火の明かりの中で、{x}は{y}を抱き寄せた。村人たちの手拍子に急かされるように、二人は苔の上で何度も求め合った。');
var FERTILE_FF=L('宴の輪の真ん中で、{x}と{y}は、村人たちに囲まれて肌を重ねた。土が二人の下で脈打ち、甘い葡萄酒の雨が肌を濡らした。{x}は濡れた{y}の胸に唇を寄せ、指を脚のあいだへ滑らせた。|葡萄酒を口移しで飲まされた{x}は、{y}を苔の上に押し倒した。宴の歌が高まるにつれて、二人は脚を絡め、互いの熱いところを擦り合わせた。|宴の焚き火の明かりの中で、{x}は{y}を抱き寄せた。村人たちの手拍子に急かされるように、{x}の指と舌が{y}の体じゅうを辿っていった。');
var PREG=L('{y}の下腹に、熱いものが根を張る感覚があった。森の母が、{y}の中に仔を宿したのだった。|宴が静まったとき、{y}の下腹は、わずかに膨らんでいた。|宴のあと、{y}は下腹に手を当てて首をかしげた。そこには、自分のものではない鼓動が、かすかに響いていた。');
JS.R18.climaxRel=function(S,kind,a,b){
JS.R18.spend(S,[a,b]);
var R=M(),o=HK.Pos?HK.Pos.order(a,b,[a,b]):[a,b],X=o[0],Y=o[1],m={x:X.name,y:Y.name};
a.cnt.r18=(a.cnt.r18||0)+1;b.cnt.r18=(b.cnt.r18||0)+1;
if(kind==='fertile'){
var fpool=JS.R18.ff(X,Y)?FERTILE_FF.filter(function(x){return(HK.Pos&&HK.Pos.bothRiba&&HK.Pos.bothRiba(X,Y))|| !/擦り合わせ/.test(x);}):FERTILE;
var t=ST.fmt(fp(S,fpool),m)+JS.R18.sex(S,X,Y,{mood:'drug',fore:false});
if((!HK.Content||HK.Content.ok(S,'preg'))&&S.rng()<0.6){Y.preg=true;t+=(HK.R18Thick&&HK.R18Thick.on(S)?'\n\n':'')+ST.fmt(fp(S,PREG),m);}
return t;
}
return ST.fmt(fp(S,LUST),m)+JS.R18.sex(S,X,Y,{mood:'rough',fore:false})+(HK.R18Thick&&HK.R18Thick.on(S)?'\n\n':'')+'仲間が二人を引き剥がしたとき、'+X.name+'の掌の口は、まだ物欲しげに開いたり閉じたりしていた。';
};
var PLACE={
mirror:L('鏡の中の{a}が、鏡の外へ手を伸ばしてきた。自分と同じ顔、同じ体の何かに組み敷かれ、{a}は自分の手で、自分の知らない場所を暴かれていった。|鏡の向こうから、{a}と同じ顔が微笑んだ。次の瞬間、{a}は鏡の中に引き込まれ、自分自身の手に、自分のいちばん弱いところを探り当てられていた。|合わせ鏡の奥から、何人もの{a}が這い出してきた。同じ顔の群れに囲まれ、{a}は自分の声で喘ぐ自分たちの中で、正気を手放していった。'),
wedding:L('{a}は白無垢を着せられ、床入りの褥に横たえられた。綿帽子の下の何かが、{a}の裾を割り、冷たいものを奥まで沈めてきた。村人たちは、襖の向こうで祝いの謡を歌っていた。|祝言の盃を無理やり飲まされた{a}は、褥の上で帯を解かれた。顔の見えない婿の冷たい手が、花嫁の肌を一寸ずつ確かめていった。|三三九度の謡が終わると、襖が閉められた。暗い座敷で、{a}は婿とも神ともつかないものに、夜通し花嫁として扱われた。'),
feast:L('宴の輪の村人たちが、{a}を苔の上に押し倒した。何本もの手と、獣のような腰が、代わる代わる{a}を貫いた。|葡萄酒の雨に濡れた{a}は、宴の輪の中心に引き込まれた。苔の上で何本もの腕に抱え込まれ、{a}は歌声の中で代わる代わる求められた。|黒山羊の面をつけた村人たちが、{a}の手足を押さえて苔に縫いとめた。土の匂いと獣の匂いの中で、{a}は宴の供物になった。'),
books:L('書庫の本から這い出した掌の口が、{a}の体じゅうに吸いついた。{乳首}にも、脚のあいだにも。{a}は書架に縋りながら、何度も達した。|開いた頁から墨のような触手が伸び、{a}の手首を本棚に縛りつけた。文字が肌の上を這い、読まれるたびに{a}の体は熱く疼いた。|書架の隙間から伸びた何本もの手が、{a}の服を一枚ずつ剥いでいった。掌の口が囁く言葉に、{a}の体は勝手に応えていた。'),
theater:L('{a}は舞台の上に引き出された。黄色い襤褸の役者が、台本どおりに{a}を床に組み伏せた。客席の観客たちは、身じろぎもせずにそれを見ていた。|幕が上がると、{a}は舞台の中央に縛られていた。黄衣の役者たちが代わる代わる{a}にのしかかり、客席から、乾いた拍手が湧いた。|台本の頁がめくられるたびに、{a}の衣装が一枚ずつ剥がされていった。最後の頁で、{a}は舞台の上で声を上げて果てた。'),
reef:L('潮だまりから這い上がった深きものが、{a}を岩の上に押さえつけた。ぬめる鱗の腰が打ちつけられ、{a}の中に、冷たい卵のようなものが注ぎ込まれた。|満ち潮とともに、深きものの群れが{a}を岩場に引きずり上げた。冷たい水かきの手に体じゅうを撫で回され、{a}は波音の中で喘いだ。|岩礁の潮だまりに沈められた{a}の体に、ぬめる腕が何本も絡みついた。息継ぎのたびに、{a}の声は甘く崩れていった。'),
temple:L('神殿の壁画から抜け出した触手が、{a}の手足を絡め取った。狂った角度の石段の上で、{a}は宙吊りのまま、奥の奥まで犯された。|狂った角度の回廊を逃げるうちに、{a}は同じ場所に戻されていた。壁から伸びた触手に絡め取られ、{a}は石の祭壇の上に横たえられた。|神殿の柱に刻まれた紋様が、{a}の肌に浮かび上がった。紋様が光るたびに、{a}の体は見えない何かに奥まで暴かれた。')
};
var PLACE_MAN={wedding:['婿','婿の一族'],feast:['村人たち','村人たち'],theater:['役者たち','役者たち']};
var BAMBOO=L('竹林の闇から伸びた冷たい指が、{a}の服の下に滑り込んだ。声を出せば、消える。{a}は唇を噛み、奥まで探られるままに耐えた。|無音堂の床板が軋む音さえ、ここでは鳴らなかった。音のない闇の中で、何本もの指が{a}の体を開き、{a}は袖を噛んで息を殺した。|口を縫われた白い影が、{a}の背後から覆いかぶさってきた。耳元に吐息だけを感じながら、{a}は声を飲み込み、体の奥を探られ続けた。');
var cave0=JS.R18.cave;
JS.R18.cave=function(S,live){
var PL=S.place,rng=S.rng,lv=JS.R18.lvMob?JS.R18.lvMob(S):S.env.jlewd/100,R=M();
if(HK.State)live=live.filter(HK.State.mobSexOk);
if(HK.Content&& !HK.Content.ok(S,'force'))return;
if(!PL||PL.id==='cave'||(!PLACE[PL.id]&&PL.id!=='bamboo'))return cave0(S,live);
live=live.filter(function(q){return!(HK.Pos&&HK.Pos.hardTopNpc?HK.Pos.hardTopNpc(q):JS.R18.hardTop(q));});
if(!live.length||rng()>lv*0.6)return;
var p=rng.pick(live);p.cnt.r18=(p.cnt.r18||0)+1;
p.m.fear=Math.min(100,p.m.fear+8);
if(PL.id==='bamboo'){
var t=ST.fmt(fp(S,BAMBOO),{a:p.name});
if(JS.R18.lwEro&&JS.R18.lwEro(S))t+=JS.R18.lwSep(S)+JS.R18.eroBody(S,p,'cave',true)+JS.R18.lwSep(S);
if(rng()<0.3+(p.aphro?0.2:0)-p.tr.cp*0.2){
JS.core.die(S,p,'無音堂で、声を漏らして',[t+(R?R.say(S,p,'climax'):'')+'その声が、{a}の最後の声になった。']);
return;
}
ST.say(S,{actors:[p],tag:PL.name,kind:'climax',text:t+p.name+'は、最後まで声を漏らさなかった。指が去ったあと、'+p.name+'の唇には血が滲んでいた。',why:'無音堂の何かに弄ばれた。声を出さずに耐えた（CP）',mag:28});
return;
}
var C=JS.R18.cover,man= !!PLACE_MAN[PL.id],cv=C?C.tryIt(S,p,'cave',man?'man':'kin',man?PLACE_MAN[PL.id][1]:'眷属'):null,p0=p;
if(cv)C.pre(S,cv);
if(cv&&cv.eff==='sub'){p=cv.r;p.cnt.r18=(p.cnt.r18||0)+1;p0.cnt.r18=Math.max(0,p0.cnt.r18-1);}
if((!HK.Content||HK.Content.ok(S,'preg'))&&rng()<lv*0.4)p.preg=true;
var ero=JS.R18.lwEro&&JS.R18.lwEro(S);
var body=ero?JS.R18.eroMob(S,p,man?'crowd':'cave',ST.fmt(fp(S,PLACE[PL.id]),{a:p.name,g:S.G.call}),man?PLACE_MAN[PL.id][0]:null):(R?R.resist(S,'god',p,{endure:false}):'')+ST.fmt(fp(S,PLACE[PL.id]),{a:p.name,g:S.G.call})+(R?R.moans(S,p,['mid','climax'])+R.npc(S,'god',p):'');
ST.say(S,{actors:[p],tag:PL.name,kind:'climax',text:body+(cv?C.watch(S,cv):'')+(p.preg?(ero?JS.R18.lwSep(S):'')+'下腹に、熱いものが宿った感覚があった。':''),why:PL.name+'の眷属に襲われた'+(p!==p0?'（'+p0.name+'の身代わりになった）':'')+(p.preg?'（疑似妊娠）':''),mag:26});
if(cv){C.both(S,cv,PL.name,man?'crowd':'cave');C.after(S,cv);}
};
var cave1=JS.R18.cave;
JS.R18.cave=function(S,live){
if(!JS.R18.room(S,[]))return;
var n0=S.log.length;
cave1(S,live.filter(function(q){return JS.R18.room(S,[q]);}));
JS.R18.spendLog(S,n0);
};
})();
});
;
/* ==== js/jashin-fx-b.js ==== */
HK.Load.def(503,'js/jashin-fx-b.js',function(){
(function(){
'use strict';
var HK=window.HK,JS=HK.JASHIN;
if(!JS)return;
JS.FX=JS.FX||{};
function F(id,traps,horror,form){
JS.FX[id]={
traps:traps.split('|').map(function(t){var k=t.split('／');return{set:k[0],die:k[1]};}),
horror:horror.split('|'),form:form
};
}
F('hakuja',
'{a}は道を横切る白蛇を、うっかり踏みそうになった。避けた拍子に、道端の古井戸の縁に手をついた／井戸の縁が崩れ、{a}は井戸の底へ落ちた。底では、白い蛇が何百匹も、とぐろを巻いて待っていた|{a}の枕元に、白い蛇の置物が置かれていた。目が、赤く光った／朝、{a}の首には、白い蛇がきつく巻きついていた。{a}は、もう息をしていなかった|{a}は神社の床下に、白い抜け殻が積み重なっているのを見つけ、手を伸ばした／抜け殻の山の中から、人の背丈ほどもある白蛇が飛び出し、{a}を呑み込んだ',
'{a}が民宿の廊下を歩いていると、天井から、白い抜け殻がひらりと落ちてきた。人の形をしていた。|村の女の子が、白い蛇を首に巻いて遊んでいた。「この子、お客さんのこと好きなんだって」|夜、{a}の布団の中で、何かひんやりとしたものが、足に絡みついた。',
'神社の奥の池から、それが鎌首をもたげた。白い、巨大な蛇。胴は大木ほどもあり、鱗の一枚一枚が、真珠のように光っていた。赤い目は、人の目のように表情を持ち、こちらを見下ろした。それがとぐろを解くと、村の田畑が、その下敷きになって消えた。口を開けると、その奥に、これまで呑まれた人々の顔が見えた。');
F('kubinashi',
'{a}が地蔵の首の切り口を、何気なく指でなぞった／その夜、{a}の首に、細い赤い線が浮かんだ。朝、布団の上に、{a}の首だけがなかった|{a}は神社の裏で、首のない着物姿の誰かが立っているのを見て、声をかけてしまった／振り返ったそれが、{a}に向かって手を伸ばした。{a}の首は、ことり、と地面に落ちた|{a}は祭りの準備をしている村人たちの、首を落とす仕草を真似してふざけた／{a}の背後で、刃物が空を切る音がした。{a}は振り返ることができなかった',
'{a}は夢の中で、首のない誰かに、自分の首を探してほしいと頼まれた。|民宿の鏡に映る{a}の姿の、首から上が、ぼやけて見えなかった。|夜道で、首のない人影が、何人も並んで神社の方へ歩いていった。',
'神社の本殿の扉が開き、それが歩み出てきた。着物を着た、首のない巨大な人影。その首の切り口からは、黒い血が絶え間なく流れ落ちていた。両腕には、これまでに落とした首を、何十も抱えていた。首たちは、目を開け、口を開けて、一斉にこちらを見た。「次は、あんたの番だ」――首たちが、声を揃えて言った。');
F('kakashi',
'{a}は田んぼの案山子の着ている服に、見覚えがあった。それは、昨日いなくなった仲間の服だった。近づいた瞬間、案山子が{a}に抱きついた／案山子の腕の竹が、{a}の体を貫いた。翌日、田んぼの案山子が、ひとつ増えていた|{a}が田んぼのあぜ道を歩いていると、案山子が一斉に、首だけ{a}の方を向いた／案山子たちに囲まれた{a}の悲鳴が、田んぼに響いた。翌朝、新しい案山子が、{a}の服を着て立っていた|{a}は案山子の顔の布をめくった。その下には、人の顔があった／案山子の顔が、{a}を見て笑った。{a}は、気づくと田んぼの真ん中に、竹に縛りつけられていた',
'田んぼの案山子が、夜ごとに、少しずつ民宿に近づいてきていた。|{a}は、案山子の一体が、かすかに瞬きをしたのを見た。|村の子どもが、案山子に話しかけていた。「もうすぐ、お友だちが増えるよ」',
'田んぼのすべての案山子が、一斉に動き出した。その中心から、ひときわ巨大な案山子が歩いてきた。人の服を何十枚も重ね着し、その顔の布の下には、無数の人の顔が縫いつけられていた。顔たちは、生きていた。泣いていた。案山子が、竹の腕を広げた。「さあ、ずっとここで、田んぼを見守ろう」');
F('ryujin',
'{a}は干上がった川の底を歩いていた。突然、上流から、鉄砲水が押し寄せてきた／{a}は濁流に呑まれ、二度と姿を見せなかった。翌日、村には何か月ぶりかの雨が降った|{a}は雨乞いの祭壇で、竜の鱗を拾った／空が急に暗くなり、雷が{a}の真上に落ちた|{a}が古い溜め池の堤を歩いていると、水の中で、巨大なものが身をよじった／堤が崩れ、{a}は溜め池の中へ落ちた。水面に、巨大な影が浮かんで、すぐに消えた',
'晴れているのに、{a}の頭上にだけ、小さな雨雲が浮かんでいた。|干上がった川底に、巨大な爪痕が残っていた。|夜、雷鳴の中に、獣の咆哮のような音が混じっていた。',
'空が、黒く割れた。雷光の中から、それは降りてきた。山を幾重にも巻くほどの、長い長い竜。鱗は錆びた鉄の色で、ところどころが剥がれ、その下から腐った肉が覗いていた。角は折れ、髭は焼け焦げていた。それは、何百年も生贄を待ち続けて飢えた、哀れで恐ろしい神だった。竜が咆哮すると、村中の水が、一斉に空へ吸い上げられた。');
F('mekakushi',
'{a}は、片目の眼帯を外した村人の目を、見てしまった／{a}の両目から、血の涙が流れ始めた。{a}は手探りで歩き回り、やがて崖から落ちた|{a}は夜中に、何者かに目隠しをされた。「見てはなりませぬ」という声がした／目隠しを外したとき、{a}は神社の奥にいた。目の前に、何かがいた。{a}は見てしまった|{a}の部屋の障子に、小さな穴が開いていた。その穴から、誰かが覗いていた／{a}が穴を覗き返すと、穴の向こうの目が、{a}の目を抉り取った',
'村人たちが、眼帯の下で、何かを見ているように首を動かしていた。|{a}の片目が、急にかすんだ。鏡を見ると、黒目が、白く濁っていた。|夜、{a}の枕元に、目玉がひとつ転がっていた。',
'神社の奥の暗闇の中から、それが現れた。全身に、無数の目隠しの布を巻きつけた人影。その布の隙間から、何百もの目が覗いていた。目は、まばたきもせず、こちらを見ていた。それの顔にあたる場所には、巨大な一つの眼だけがあった。「見たな」――その声と同時に、まわりの村人たちが、自分の残った片目を抉り出した。');
F('mayu',
'{a}は、家々に吊るされた巨大な繭のひとつに、そっと触れた／繭の中から、白い糸が噴き出し、{a}の全身を包み込んだ。{a}は、新しい繭になった|{a}は桑の葉の茂る畑で、白い蚕の群れに足を取られた／蚕は、{a}の体を這い上がり、口から糸を吐いて{a}を包んだ。繭の中で、{a}は少しずつ溶けていった|{a}が蚕室の床下を覗くと、溶けかけた繭が、人の形をして並んでいた／その繭のひとつが、{a}の腕を掴んだ。{a}は床下へ引きずり込まれた',
'{a}が眠っている間に、体に細い白い糸が巻きついていた。|吊るされた繭の中から、人の声のようなものが聞こえた。|村人の肌が、どこか白く、柔らかく、蚕のようだった。',
'神社の奥の蚕室から、それが這い出てきた。人の何倍もある、白い蚕。その体は、ぶよぶよと半透明で、中に、溶けかけた人の影がいくつも透けて見えた。頭には、人の女の顔があり、優しく微笑んでいた。それが口を開けると、白い糸が吹雪のように吐き出され、村の家々が、白い繭に包まれていった。');
F('futago',
'{a}は、自分とそっくりの人物が、民宿の廊下を歩いていくのを見て、追いかけてしまった／廊下の突き当たりで、それが振り返った。それは、{a}の顔をして笑った。翌朝、民宿には{a}が一人いた。どちらの{a}なのか、誰にも分からなかった|{a}は、双子の村人に左右から手を引かれて、神社の奥へ連れていかれた／神社の奥で、{a}の体は、左右に引き裂かれた|{a}は鏡に映った自分が、自分と違う動きをしているのに気づいた／鏡の中の{a}が、手を伸ばし、{a}を鏡の中へ引き込んだ',
'{a}が振り返ると、廊下の向こうに、仲間がもう一人立っていた。仲間は、隣にいるのに。|双子の村人たちは、片方が話すと、もう片方が同じ言葉を、少し遅れて繰り返した。|{a}の荷物の中に、{a}と同じ顔の写真が入っていた。撮った覚えはなかった。',
'神社の本殿から、それは現れた。体の真ん中で、二つの人間がつながったような姿。四本の腕と、四本の脚。二つの顔は、男とも女ともつかず、一方は泣き、一方は笑っていた。二つの口が、同時に違う言葉を話した。「ひとつに、なろう」「ふたつに、なろう」――それが歩くたびに、まわりの村人たちが、互いに抱き合って溶け合っていった。');
F('kagami',
'{a}は玄関の鏡に、見知らぬ女が映っているのに気づいた。振り返っても、誰もいなかった／鏡の中の女が、鏡から手を出し、{a}の髪を掴んだ。{a}は鏡の中へ引きずり込まれた|{a}は神社の奥で、布をかけられた大きな鏡を見つけ、布を取ってしまった／鏡に映った{a}は、骸骨だった。次の瞬間、{a}自身の体も、そうなった|{a}は手鏡で、合わせ鏡をしてしまった。どこまでも続く鏡の奥から、何かが近づいてきた／鏡の奥から伸びた手が、{a}を引き込んだ。手鏡だけが、畳の上に残った',
'{a}の顔が、鏡の中で、ほんの少しだけ遅れて動いた。|村の家の外向きの鏡に、村にはいないはずの人々の姿が映っていた。|{a}が窓ガラスを見ると、そこに映る{a}の背後に、誰かが立っていた。',
'村中の鏡が、一斉に割れた。その破片の一つひとつに、同じ顔が映った。そして、破片が宙に浮かび、集まり、ひとつの姿になった。無数の鏡の破片でできた、巨大な人影。その表面には、これまで鏡に吸い込まれた人々の顔が、苦悶の表情で映っていた。それがこちらを向くと、その鏡の体に、一行の姿が映った。映った姿は、少しずつ、こちらから消えていった。');
F('ningyo',
'{a}は縁側の人形のひとつを、手に取ってしまった。人形の顔は、{a}そっくりだった／その夜、人形の首が、ことりと落ちた。同じ時、{a}も――|{a}は夜中に、人形たちが一斉にこちらを向いているのに気づいた／人形たちが、{a}の布団に這い寄ってきた。朝、{a}の布団には、等身大の人形が寝ていた|{a}は人形の着物を、何気なく直してあげた。人形が、礼を言うように、首をかしげた／その夜、{a}の体は、少しずつ硬くなり、関節が球体になり、やがて、動かなくなった',
'{a}が部屋に戻ると、さっきまで縁側にいた人形が、{a}の枕元に座っていた。|人形の髪が、昨日より少し伸びていた。|夜中、縁側の人形たちが、くすくすと笑う声がした。',
'神社の奥から、それが歩み出てきた。巨大な、着物を着た人形。白い陶器のような顔には、ひびが無数に入り、そのひびの隙間から、本物の人の目が覗いていた。腕も脚も、球体の関節でつながれていたが、その動きは、あまりにも人間らしかった。それの後ろには、縁側の人形たちが、ずらりと並んでついてきた。');
F('kitsune',
'{a}は狐の嫁入りの行列を見てしまった。行列の先頭の花嫁が、{a}を見て、にこりと笑った／{a}は行列に加わり、山の奥へと歩いていった。二度と戻らなかった|{a}は稲荷の祠の油揚げを、つまみ食いしてしまった／その夜、{a}の体は、狐の霊に取り憑かれ、四つ足で山へ駆けていった。翌朝、狐の罠に、{a}が掛かっていた|{a}は細い雨の中で、狐の面をかぶった誰かに、手招きされた／ついていった先は、底なしの沼だった',
'雨の中で、狐の鳴き声がした。それは、人の笑い声にも聞こえた。|{a}の足跡の隣に、狐の足跡が、ずっと並んでついてきていた。|夜道に、狐火が、行列のように並んで揺れていた。',
'細い雨の中から、それは現れた。九本の尾を持つ、人の何倍もある白い狐。その顔は、美しい花嫁の顔だった。白無垢を身にまとい、紅をさした口元が、耳まで裂けて笑った。尾の一本一本の先で、狐火が燃えていた。それがこちらを見て、甘い声で言った。「お迎えに、参りましたよ」');
F('yamanokami',
'{a}は山に入る前に、干物を懐に入れ忘れた／山の奥で、{a}は道に迷った。気づくと、目の前に、醜い顔の女が立っていた。女は、{a}を抱きしめて、二度と放さなかった|{a}は山の中で、美しい女に声をかけられた。「わたしと、ずっと一緒にいてくれる？」／{a}が頷くと、女の顔が醜く崩れた。{a}は、山の土の中に、抱きしめられたまま埋まっていった|{a}が山の木を、一本だけ切ってしまった／切った木の切り口から、赤い血が噴き出した。その夜、{a}は山から落ちてきた岩の下敷きになった',
'山の中から、女のすすり泣く声が聞こえた。|{a}の部屋に、山の土の匂いがした。|村の男たちが、山に向かって、何かを謝るように頭を下げていた。',
'山が、泣き出した。山肌が崩れ、そこから、それは現れた。山ほどもある、巨大な女。顔は、ひどく醜く歪み、目からは土砂のような涙が流れていた。長い髪は、山の木々そのものだった。それが手を伸ばすと、その手は、山の土でできていた。「どうして、わたしを見てくれないの」――山の神の嘆きが、地鳴りのように響いた。');
F('oni',
'{a}は角のある瓦の家に、うっかり入り込んでしまった。奥に、大きな金棒が立てかけてあった／金棒が、ひとりでに持ち上がり、{a}の頭上に振り下ろされた|{a}は鬼の面をかぶった村人に、豆をぶつけてしまった。村人が、面の下で笑った。「豆なんか、効かんよ」／面の下から現れた本物の鬼の顔が、{a}の腕を、根元から引きちぎった|{a}は神社の裏の洞窟で、人の骨が山のように積まれているのを見てしまった／洞窟の奥から、巨大な手が伸び、{a}を掴んで、骨の山に投げ入れた',
'夜、村のどこかで、何か大きなものが、骨をかじる音がした。|{a}の部屋の屋根の上を、誰かが歩く足音がした。その足音は、ひどく重かった。|村の子どもが、角の生えた絵を描いていた。「これ、村の守り神さま。人を食べるんだよ」',
'神社の本殿が、内側から砕けた。中から現れたのは、天井まで届くほどの巨大な鬼だった。赤黒い肌に、牛のような角。口からは、牙が何本もはみ出し、血の混じった涎が垂れていた。手には、人の背丈ほどもある金棒。それが咆哮すると、村中の窓ガラスが割れた。');
F('hiruko',
'{a}は浜に流れ着いた、葦の舟の中を覗き込んだ。中には、骨のない何かが横たわっていた／それが、{a}の顔に貼りついた。{a}の悲鳴は、ぬめった肉に塞がれた|{a}は浜で、流れ着いた木箱を開けてしまった／中から、ぶよぶよとした肉の塊があふれ出し、{a}を呑み込んで、海へ帰っていった|{a}は夜の浜で、赤ん坊の泣き声を聞いて、波打ち際へ近づいた／波の中から、骨のない小さな手が何十本も伸び、{a}を海へ引きずり込んだ',
'浜に流れ着いたものは、毎朝、少しずつ大きくなっていた。|夜の海から、赤ん坊の泣き声が聞こえた。|{a}が浜を歩くと、砂の中から、骨のない何かが、ずるりと這い出してきた。',
'海の向こうから、それは流れ着いた。葦の舟に乗った、巨大な肉の塊。骨がなく、形が定まらず、ぶよぶよと揺れていた。その表面には、赤ん坊の顔が、いくつも浮かび上がっては消えた。それは泣いていた。捨てられたことを、恨んでいた。それが浜に這い上がると、砂浜が、赤黒い肉色に染まっていった。');
F('uba',
'{a}は老婆に、山の奥の小屋で一晩泊まっていけと勧められた／小屋の中で、{a}が目覚めると、老婆が包丁を研いでいた。「若い肉は、久しぶりじゃ」|{a}は姥捨ての岩場で、置き去りにされた老婆の骨を見てしまった／骨が、{a}の足首を掴んだ。{a}は岩場から、谷底へと引きずり落とされた|{a}は村の老人たちに、若さを分けてくれないかと頼まれ、冗談だと思って頷いた／翌朝、{a}は、しわくちゃの老人の姿になっていた。そして、その日のうちに、老衰で死んだ',
'村の老人たちが、{a}を見て、ごくりと唾を飲んだ。|{a}が鏡を見ると、白髪が一本、増えていた。|夜、老婆たちが、何かを煮る鍋を囲んで、笑い合っていた。',
'山の奥から、それは降りてきた。山ほどもある、巨大な老婆。皺だらけの顔に、白く濁った目。口は耳まで裂け、黄色い歯が並んでいた。その背中には、これまでに捨てられた村の老人たちが、何百人も張りついていた。それが手を伸ばすと、まわりの若い草木が、一瞬で枯れ果てた。');
F('kuchisake',
'{a}は口元の布を外した村人に、「わたし、きれい？」と聞かれ、答えてしまった／村人は、鋏を取り出した。「じゃあ、あんたも、おそろいにしてあげる」|{a}は神社の奥で、裂けた口の面を見つけ、かぶってしまった／面が、{a}の顔に貼りついた。面の口が裂けるのに合わせて、{a}の口も、耳まで裂けていった|{a}は夜道で、口元を覆った女に声をかけられ、逃げ出した／女は、{a}より速かった',
'村人の口元の布に、赤い染みがにじんでいた。|{a}は夜道で、背後から鋏の音が近づいてくるのを聞いた。|民宿の女将が、口元の布を少しずらして、にいっと笑った。その口は、耳まで裂けていた。',
'神社の奥から、それは現れた。赤い着物を着た、背の高い女。長い黒髪が、顔を覆っていた。それが髪をかき上げると、口が、耳から耳まで裂けていた。裂けた口の中には、何重にも歯が並び、舌が蛇のように伸びた。手には、人の背丈ほどもある巨大な鋏。「わたし、きれい？」――答えを待たずに、鋏が開いた。');
F('dorogami',
'{a}は泥田のあぜ道で足を滑らせ、泥田に落ちた／泥は、底なしだった。{a}の手だけが、しばらく泥の上で、もがいていた|{a}は泥田の中から伸びた、泥の手に足首を掴まれた／泥の手は、{a}を泥田の底へと引きずり込んだ。「田を返せ」という声だけが残った|{a}は泥田の泥を、手にすくってみた。泥の中に、人の歯が混じっていた／泥田から、泥の塊がいくつも立ち上がり、{a}を取り囲んで、泥の中に埋めていった',
'夜、泥田の中から、「田を返せ」という声が聞こえた。|泥田の表面に、人の顔のような泡が、いくつも浮かんでは消えた。|{a}の靴に、いつの間にか、黒い泥がこびりついていた。拭っても拭っても、取れなかった。',
'村中の泥田が、一斉に盛り上がった。泥の中から、それは立ち上がった。一つ目の、泥でできた巨人。体からは、絶え間なく泥が流れ落ち、その中に、これまで呑まれた人々の手足が見えていた。それが「田を返せ」と叫ぶと、村の家々が、泥の中へ沈み始めた。');
F('shinigami',
'{a}は村の門の数字を見た。数字は、一行の人数と同じになっていた／その夜、数字が一つ減った。朝、{a}は布団の中で、冷たくなっていた|{a}は夜道で、提灯を持った黒い着物の誰かに、「お迎えに参りました」と言われた／{a}は、それについていってしまった。行き先は、誰にも分からなかった|{a}は神社の帳面に、自分の名前が書かれているのを見つけた。名前の横に、今日の日付があった／その日の夕方、{a}は理由もなく倒れ、二度と起き上がらなかった',
'村の門の数字が、また一つ減っていた。|{a}の枕元に、誰かが座っている気配がした。目を開けると、誰もいなかった。|夜、村の道を、提灯の行列が、音もなく通り過ぎていった。',
'空気が、止まった。音が消えた。村の門の向こうから、それが歩いてきた。黒い着物をまとった、背の高い影。顔は、能面のように白く、表情がなかった。手には、灯の消えた提灯。その後ろには、これまでに迎えられた人々が、虚ろな目をして、行列をなしてついてきていた。それは、静かに言った。「お迎えに、参りました」');
F('hanayome',
'{a}は花嫁衣装の像に、見とれてしまった。像の顔が、ゆっくりと{a}の方を向いた／その夜、{a}の部屋に、白無垢の花嫁が現れた。翌朝、{a}は、神社の祭壇の前で、花嫁と並んで死んでいた|{a}は神社の奥で、角隠しを見つけ、かぶってみた／角隠しが、{a}の頭から外れなくなった。{a}は、ふらふらと神社の奥の祝言の間へ歩いていき、それきり戻らなかった|{a}は花嫁行列の中に、迷い込んでしまった／行列の先には、祝言の席ではなく、深い井戸があった。花嫁と一緒に、{a}も井戸に落ちた',
'夜、神社の方から、祝言の歌が聞こえた。|{a}の荷物の中に、白い角隠しが入っていた。|村の女たちが、{a}を見て、「いいお嫁さんになるねえ」と囁き合っていた。',
'神社の祭壇の奥から、それは現れた。白無垢をまとった、巨大な花嫁。顔は、角隠しの下に隠れて見えなかった。それが顔を上げると、そこには、顔がなかった。白い布が、ぽっかりと空いた闇を覆っているだけだった。その闇の中から、何百人もの花嫁の泣き声が聞こえた。');
F('tsuchigumo',
'{a}は民宿の押し入れの奥に、地下へ続く穴を見つけ、覗き込んだ／穴の中から、毛むくじゃらの脚が伸び、{a}を引きずり込んだ|{a}は村の家の床下で、白い糸の巣を見つけ、払いのけた／糸の奥から、巨大な蜘蛛が飛び出し、{a}の首に牙を立てた|{a}は地下の通路を歩いていた。天井から、糸がゆっくりと垂れてきた／糸が{a}の体に絡みつき、{a}を天井へと引き上げていった',
'夜、民宿の床下から、何か大きなものが這い回る音がした。|{a}の足元の畳が、かすかに盛り上がった。その下で、何かが動いていた。|村人たちの指が、異様に長かった。',
'地面が割れ、それが這い出てきた。家ほどもある、巨大な蜘蛛。その顔は、虎のように獰猛で、牙からは毒液が滴っていた。背中には、人の顔のような模様が浮かび上がっていた。それは、地下でつながったすべての家から、同時に出てくるように見えた。');
F('ama',
'{a}は海女たちに、海に潜ってみないかと誘われた／海の底で、海女たちは{a}の足を掴んだ。{a}は、二度と水面に上がれなかった|{a}は浜で、海女たちの使う磯笛を吹いてしまった／海の中から、何十人もの海女が浮かび上がってきた。皆、溺死した者の顔をしていた。{a}は海に引き込まれた|{a}は海女小屋の中で、塩漬けにされた人の手を見つけた／小屋の扉が閉ざされ、外から、海女たちの笑い声が聞こえた',
'夜の海から、磯笛の音が聞こえた。|海女たちの肌は、まるで水死体のように、青白くふやけていた。|{a}が浜を歩くと、海の中から、何十本もの白い腕が、手招きしていた。',
'海の底から、それは浮かび上がった。巨大な、海女の姿をした女。長い髪は、海藻のように揺れ、体は、水死体のように青白くふやけていた。目は、魚のように白く濁っていた。それが磯笛を吹くと、海の中から、何百人もの海女が浮かび上がり、浜へと歩いてきた。');
F('yatsume',
'{a}は、戸板の八つの目のひとつと、目が合った／目が、まばたきをした。{a}の目から、血が流れた。{a}は、自分の目が八つになる夢を見ながら死んだ|{a}は夜中に、障子の向こうから、八つの目が覗いているのに気づいた／障子が破れ、八つの目を持つ何かが、{a}に覆いかぶさった|{a}は神社の奥で、八つの目の描かれた面を見つけ、かぶってみた／面の目が、{a}の顔に食い込んだ。{a}の悲鳴は、すぐに止んだ',
'戸板の目が、昨日と違う方向を見ていた。|{a}は、背後から八つの視線を感じた。振り返ると、誰もいなかった。|村人たちの額に、小さな傷が、いくつも並んでいた。',
'神社の暗闇の中で、八つの目が開いた。それは、人の形をしていたが、頭には、八つの目が不規則に並んでいた。それぞれの目が、別々の方向を見ていた。体は異様に細長く、手足は関節が多すぎた。それが一歩踏み出すたびに、八つの目が、一斉にこちらを向いた。');
F('shiroi',
'{a}は林の白い人影を、もっとよく見ようと近づいた／白い人影は、{a}の目の前に、一瞬で移動していた。{a}の体は、林の奥へと連れ去られた|{a}は夜、民宿の窓の外に、白い服の背の高い人影が立っているのを見て、窓を開けた／白い腕が窓から伸びて、{a}を外へ引きずり出した|{a}は白い人影の「ぽぽぽ」という声を真似してしまった／その夜、{a}の部屋の窓に、白い人影が貼りついていた。翌朝、{a}の部屋は空っぽだった',
'林の白い人影が、昨日より、民宿に近づいていた。|{a}の部屋の窓の外から、「ぽ、ぽ、ぽ」という声が聞こえた。|{a}が振り返ると、遠くの白い人影が、こちらに手を振っていた。',
'林の奥から、それが歩いてきた。白い服を着た、異様に背の高い女。民家の屋根より高かった。白い帽子の下の顔は、見えなかった。長い腕が、地面に届くほど垂れ下がっていた。「ぽ、ぽ、ぽ、ぽ」――低い、男のような声で、それは笑っていた。');
F('tatari',
'{a}は荒れ果てた祠のひとつに、足を引っかけて倒してしまった／倒れた祠の中から、黒い靄が噴き出し、{a}を包み込んだ。{a}の体は、黒く腐り落ちた|{a}は祠に供えられていた古い刀に、手を触れてしまった／刀が、ひとりでに鞘から抜け、{a}の胸を貫いた|{a}は祠の前で、御霊大明神の悪口を言ってしまった／その瞬間、{a}の体に、雷が落ちた',
'{a}の手のひらに、黒い痣が浮かんでいた。痣は、少しずつ広がっていった。|祠の前に供えられた花が、一瞬で枯れた。|夜、祠のまわりで、怨みの声が渦巻いていた。',
'寄り集まった祠が、一斉に崩れ落ちた。中から、黒い靄があふれ出し、それが集まって、ひとつの姿になった。無数の怨霊が絡み合った、巨大な黒い塊。その表面には、苦悶の表情を浮かべた顔が、無数に浮かんでいた。それぞれが、恨みの言葉を叫んでいた。');
F('oshira',
'{a}は神棚のおしら様を、手に取って遊ばせてしまった／おしら様の布が、{a}の手に巻きつき、腕を、そして体を締め上げた|{a}は桑の木の下で、馬の首を見つけた／馬の首が、{a}を見て、いなないた。{a}の体は、桑の木の枝に、首を吊られていた|{a}はおしら様の布を、一枚剥がしてしまった／布の下から、人の皮のようなものが現れた。その夜、{a}の皮も、剥がされていた',
'神棚のおしら様が、夜中に、こそこそと話し合っていた。|{a}の部屋の桑の木の葉が、ひとりでにさわさわと揺れた。|村の娘が、馬の首を抱いて、桑の木の下で泣いていた。',
'桑の木の根元から、それは現れた。馬の首を持つ、巨大な女。体は、何重にも布を巻きつけられ、その布の隙間から、桑の葉が生えていた。それが歩くと、蹄の音と、女の泣き声が、同時に響いた。');
F('kamikakushi',
'{a}は掲示板の行方不明者の貼り紙の中に、自分の顔写真を見つけた／その瞬間、{a}の姿が、ふっと消えた。貼り紙だけが、風に揺れていた|{a}は夕暮れの神社で、かくれんぼをしている子どもたちに、「一緒に遊ぼう」と誘われた／{a}は隠れた。誰も、{a}を見つけられなかった。永遠に|{a}は村の辻で、道を間違えた。気づくと、知らない村に立っていた／そこは、行方不明者たちが住む、隠し神の村だった',
'掲示板の貼り紙が、また一枚増えていた。|{a}の仲間の一人が、一瞬、そこにいないように見えた。|夕暮れの村から、子どもの「もういいよ」という声が聞こえた。',
'夕暮れの空が、紫色に染まった。それは、空の裂け目から現れた。巨大な、顔のない人影。体は、これまでに隠された人々の影で、できていた。それが手を伸ばすと、まわりの景色が、ゆっくりと消えていった。');
F('kodama',
'{a}は御神木の幹に、耳を当ててみた。中から、人の声が聞こえた／御神木の幹が裂け、{a}を中に呑み込んで、また閉じた|{a}は森の中で、木霊の声に応えてしまった／木霊が、{a}の声で、{a}の名前を呼んだ。{a}は、森の奥へと歩いていった|{a}は御神木の根元を、少し掘ってみた／根が、{a}の体に絡みつき、{a}を土の中へと引き込んだ',
'森の中で、{a}が呼ぶと、少し遅れて、違う声が返ってきた。|御神木の幹に、人の顔のような模様が浮かんでいた。|夜、森の木々が、ざわざわと何かを囁き合っていた。',
'御神木が、動き出した。その幹は、人の体のようにねじれ、枝は、何百本もの腕となって広がった。根は、大地を割って這い出し、村の家々を絡め取った。幹の真ん中には、巨大な人の顔が浮かび上がり、そこから、何百もの声が、木霊のように響いた。');
F('suiko',
'{a}は川岸で、きゅうりを拾おうと屈んだ／川の中から、緑色の手が伸び、{a}の足を掴んで、川の中へ引きずり込んだ|{a}は川で泳いでいる子どもを見て、助けようと飛び込んだ／子どもは、河童だった。{a}は尻子玉を抜かれ、川底に沈んだ|{a}は河童の祠に、相撲を挑まれた。断ると、無理やり川に引き込まれた／{a}の体は、川下で、空っぽになって見つかった',
'川の水面に、皿のようなものが浮かんでいた。|{a}は川岸で、緑色の水かきのある足跡を見つけた。|夜の川から、子どもの笑い声が聞こえた。',
'川が、逆流した。川の中から、それは現れた。人の何倍もある、巨大な河童。緑色の鱗に覆われ、頭の皿には、黒い水が満ちていた。嘴の奥には、無数の牙が並んでいた。それは、尻子玉を食らうために、獲物を探していた。');
F('kurai',
'{a}は空の本殿に入ってみた。中は、ただの暗闇だった／暗闇の中で、{a}は自分の名前を忘れた。顔を忘れた。体の形を忘れた。{a}は、暗闇の一部になった|{a}は空の本殿の中で、何かに名前を尋ねられ、答えてしまった／{a}の名前は、本殿の暗闇に呑まれた。そして、{a}も|{a}は暗い夜道で、懐中電灯を落としてしまった／暗闇が、{a}を包み込んだ。朝、{a}のいた場所には、懐中電灯だけが転がっていた',
'本殿の暗闇が、昨日より広がっていた。|{a}は、自分の名前を一瞬、思い出せなかった。|夜、村の明かりが、ひとつずつ消えていった。',
'空の本殿から、闇があふれ出した。それには、形がなかった。名前がなかった。ただ、すべての光と、すべての音と、すべての記憶を呑み込む、純粋な闇だった。見つめていると、自分が誰なのか、分からなくなった。');
F('tsuki',
'{a}は異様に明るい月を、ずっと見上げていた／{a}の体は、ふわりと浮き上がり、月に向かって昇っていった。二度と降りてこなかった|{a}は池に映った月を、手ですくってみた／池の月が、{a}の手を掴み、{a}を池の中へ引きずり込んだ。池の月は、少し大きくなった|{a}は月光の下で、自分の影がないことに気づいた／月光が強まり、{a}の体は、少しずつ透き通っていき、やがて消えた',
'月が、昨日より少し近づいていた。|{a}の影が、月光の下で、勝手に動いていた。|村人たちが、月に向かって、何かを差し出すように手を伸ばしていた。',
'月が、落ちてきた。いや、それは月ではなかった。巨大な、白く輝く目だった。それが村を見下ろすと、月光が、物理的な重さを持って降り注いだ。村人たちは、その光の中で、ゆっくりと溶けていった。');
F('sekai',
'{a}は箱庭の中の、自分そっくりの人形を、つい手に取ってしまった／その瞬間、{a}の体が、空中に持ち上げられた。巨大な指に、つままれるように|{a}は箱庭の村の、小さな井戸を覗き込んだ／{a}の視界が、ぐるりと回った。{a}は、箱庭の井戸の中に、人形として落ちていった|{a}は箱庭の蓋を、閉じようとした／蓋が、{a}の上に閉じた。空が、真っ暗になった',
'空のずっと上から、巨大な指が、ゆっくりと降りてきた。|{a}は、自分の動きが、誰かに操られているような気がした。|箱庭の中の人形の配置が、昨日と変わっていた。一行の今の居場所と、まったく同じに。',
'空が、蓋を開けるように、めくれた。その向こうから、巨大な顔が覗き込んでいた。それは、子どものようにも、老人のようにも見えた。巨大な目が、一行を見下ろした。巨大な指が、村をつまみ上げた。この村は、箱庭だった。そして、一行は、その中の人形だった。――いや、ひょっとしたら、それを見ているあなたも。');
})();
});
;
/* ==== js/jashin-place.js ==== */
HK.Load.def(504,'js/jashin-place.js',function(){
(function(){
'use strict';
var HK=window.HK,ST=HK.Story,JS=HK.JASHIN,clamp=HK.clamp;
if(!ST|| !JS)return;
function L(s){return s.split('|');}
function P(o){['in','mid','end','out','die'].forEach(function(k){if(typeof o[k]==='string')o[k]=L(o[k]);});return o;}
var GEN=[
P({id:'cave',name:'洞窟',noun:'洞窟',to:'祠のある洞窟',die:'{a}の足元の岩が崩れた。{a}は、地底を流れる黒い川へ落ちていった。|鍾乳石が一本、{a}の真上から、槍のように降ってきた。'}),
P({id:'altar',name:'地下祭壇',noun:'地下祭壇',to:'本殿の床下に隠された地下祭壇',
in:'本殿の床板を剥がすと、石段が闇の底へ続いていた。一行は、黴と香の匂いの中を降りていった。|地下祭壇への石段は、百段を越えても終わらなかった。壁の燭台には、誰が灯したのか、新しい蝋燭が燃えていた。',
mid:'石段の踊り場に、歴代の生贄の名を刻んだ石板が並んでいた。最後の行は、まだ空白だった。|壁の窪みに、干からびた手首がいくつも供えられていた。どれも、何かを掴もうとする形をしていた。',
end:'石段の底は、柱の林立する広間だった。その奥に、血で黒ずんだ石の祭壇が据えられていた。|地下祭壇の上に、{g}の像が鎖で縛りつけられていた。鎖は、内側から引かれているように軋んでいた。',
out:'祭壇が砕けると同時に、地下の柱が次々に折れ始めた。一行は崩れる石段を、四つん這いで駆け上がった。',
die:'{a}が踏んだ石段が、からくりのように沈んだ。左右の壁から突き出た杭が、{a}を貫いた。|{a}は祭壇の血溝に足を取られて転んだ。溝の中の黒い液体が、生き物のように{a}の口へ流れ込んだ。'}),
P({id:'chief',name:'村長の家',noun:'屋敷',to:'村長の屋敷',
in:'村長の屋敷は、祭りの夜だというのに静まり返っていた。土足で上がり込むと、奥の座敷から祝詞が聞こえた。|門をくぐると、庭の池に、村長の家族が全員、俯せに浮いていた。屋敷の中からは、まだ太鼓の音がする。',
mid:'仏間の襖を開けると、仏壇の位牌がすべて裏返されていた。表に彫られていたのは、{g}の名だった。|廊下の柱に、子どもの背丈を測った傷が刻まれていた。名前は、毎年違っていた。',
end:'屋敷のいちばん奥、開かずの座敷の床の間に、{g}を祀る祠が埋め込まれていた。|蔵座敷の奥で、村長が祠に向かってひれ伏していた。振り向いたその顔には、目がなかった。',
out:'祠が砕けると、屋敷じゅうの柱が悲鳴のように軋んだ。一行が庭へ転がり出た直後、村長の屋敷は内側へ崩れ落ちた。',
die:'{a}が開けた襖の向こうに、天井から縄が何本も垂れていた。そのうちの一本が、蛇のように{a}の首に巻きついた。|{a}の踏み抜いた床下は、深い古井戸に通じていた。'}),
P({id:'school',name:'廃校',noun:'校舎',to:'山の上の廃校',
in:'廃校の体育館には、祭りの提灯が吊るされていた。誰もいないはずの校舎から、子どもたちの合唱が聞こえる。|木造の校舎は、一歩ごとに軋んだ。黒板には、白墨で一行の名前が書かれ、その上に赤い線が引かれていた。',
mid:'理科室の標本棚に、見慣れない生き物の胎児が並んでいた。ラベルには、どれも村人の名前。|音楽室のピアノが、ひとりでに祭り囃子を弾いていた。',
end:'体育館の舞台の緞帳を引くと、そこに{g}の祠があった。|校庭の真ん中の朝礼台が、祭壇に作り替えられていた。台の上に、{g}の祠が載っていた。',
out:'祠が壊れると、校舎じゅうの窓ガラスが一斉に割れた。一行は、降り注ぐ破片の中を校門まで走った。',
die:'{a}が渡り廊下を渡りきる前に、床が抜けた。下は、底の見えない闇だった。|防火シャッターが、{a}の上に音もなく落ちてきた。'}),
P({id:'well',name:'古井戸の底',noun:'井戸の底',to:'村はずれの古井戸の底',
in:'縄梯子で古井戸を降りると、底は乾いていて、横穴が奥へ続いていた。|井戸の底は、思ったより広かった。壁一面に、爪で引っ掻いた跡がある。頭上で、井戸の蓋が閉まる音がした。',
mid:'横穴の天井から、髪の毛が束になって垂れ下がっていた。|水の涸れた井戸の底に、なぜか濡れた足跡が、奥へ向かって続いていた。',
end:'横穴の突き当たりに、水を湛えた石室があった。その中央に、{g}の祠が半ば沈んでいた。',
out:'祠が崩れると、涸れていた井戸に、轟音とともに水が噴き上がった。一行は縄梯子にしがみつき、水に押し上げられるようにして地上へ出た。',
die:'{a}のつかまった縄梯子が、上から誰かに切られた。|{a}の足首を、水底から伸びた白い手が掴んだ。{a}はそのまま、石室の水に引き込まれた。'}),
P({id:'fall',name:'御神滝の岩屋',noun:'岩屋',to:'御神滝の裏の岩屋',
in:'轟音を立てて落ちる滝の裏に、人ひとり通れるほどの岩屋が口を開けていた。|滝壺の縁の岩を伝って、一行は水の幕の向こうへ潜り込んだ。',
mid:'岩屋の壁に、滝に打たれる行者の絵が刻まれていた。絵の行者たちは、皆、溶けかけていた。|滝の音が、だんだん人の声に聞こえてきた。一行の名前を呼んでいる。',
end:'岩屋の奥、水しぶきの届かない段の上に、{g}の祠があった。',
out:'祠が崩れると、滝の水が一斉に逆流した。一行はずぶ濡れになりながら、岩を伝って岸へ逃れた。',
die:'{a}は濡れた岩で足を滑らせ、滝壺の渦に呑まれた。浮かんでくることはなかった。|滝の水の重さが急に増して、{a}を岩に叩きつけた。'}),
P({id:'grave',name:'墓地',noun:'墓地',to:'山の中腹の墓地',
in:'墓地の卒塔婆が、風もないのにかたかたと鳴っていた。|墓石の一つひとつに、提灯が下げられていた。どの墓にも、今日の日付が刻まれていた。',
mid:'掘り返されたばかりの墓穴が、ちょうど一行の人数分、並んでいた。|墓石の陰から、白い着物の村人たちが、こちらをじっと見ていた。',
end:'墓地のいちばん上、無縁仏の塚の上に、{g}の祠が建っていた。',
out:'祠が倒れると、墓地じゅうの墓石が一斉に傾いた。一行は、土の中から聞こえる爪の音を背中に聞きながら、石段を駆け下りた。',
die:'{a}は掘り返された墓穴に足を取られ、そのまま穴の底へ落ちた。上から、土が降ってきた。|墓石の下から伸びた腕が、{a}を土の中へ引きずり込んだ。'}),
P({id:'tower',name:'火の見櫓',noun:'櫓',to:'村の真ん中の火の見櫓',
in:'火の見櫓の半鐘が、ひとりでに鳴り続けていた。一行は、錆びた梯子を一段ずつ登った。|櫓の下には、村人たちが輪になって座り、一行が登るのを、ただ見上げていた。',
mid:'梯子の途中から、村の全景が見えた。家々の灯りが、{g}の印の形に並んでいた。|半鐘の音に合わせて、梯子が大きく揺れた。',
end:'櫓のてっぺんの見張り台に、半鐘の代わりに{g}の祠が吊るされていた。',
out:'祠を落とすと、櫓が大きく傾いた。一行は、倒れかかる櫓から、隣の屋根へ飛び移った。',
die:'{a}のつかんだ梯子の段が、錆びて折れた。|半鐘の音が{a}の頭の中で膨れ上がり、{a}は耳を押さえたまま、櫓から身を投げた。'}),
P({id:'kura',name:'旧家の蔵',noun:'蔵',to:'旧家の土蔵',
in:'土蔵の重い扉を開けると、中から冷たい空気と、甘い腐臭が流れ出した。|蔵の扉には、内側から何十枚もの御札が貼られていた。',
mid:'長持の中に、婚礼衣装を着た人形がぎっしりと詰め込まれていた。顔は、どれも村人に似ていた。|蔵の二階から、誰かが歩き回る音がした。',
end:'蔵の床に隠し階段があり、その先の石室に{g}の祠が祀られていた。',
out:'祠が崩れると、蔵の白壁に亀裂が走った。一行が外へ出た直後、土蔵は自分の重さに耐えきれずに潰れた。',
die:'{a}の頭上の棚から、重い長持が落ちてきた。|蔵の扉が外から閉められた。{a}が最後に見たのは、閉まる扉の隙間で笑う村人の顔だった。'}),
P({id:'mine',name:'廃坑',noun:'坑道',to:'閉山した鉱山の坑道',
in:'坑道の入口のトロッコが、誰も押していないのに、奥へ動き出した。|坑道の柱には、落盤で死んだ坑夫たちの名前が、びっしりと書かれていた。',
mid:'坑道の奥で、カンテラの灯りが揺れていた。昔の坑夫の格好をした誰かが、黙々と壁を掘り続けている。|線路の上に、ヘルメットが一つ転がっていた。中に、まだ頭が入っていた。',
end:'最深部の切羽に、掘り出された黒い岩があった。それが、{g}の御神体だった。',
out:'御神体が砕けると、坑道全体が呻いた。一行は、背後から迫る落盤の轟音から逃げて、トロッコの線路を走った。',
die:'{a}の頭上で、坑木が折れた。|有毒なガスの溜まった横穴に迷い込んだ{a}は、声もなく崩れ落ちた。'}),
P({id:'stone',name:'石舞台',noun:'石舞台',to:'村はずれの石舞台',
in:'巨石を組んだ石舞台の周りに、村人たちが松明を持って集まっていた。|石舞台の上で、篝火が焚かれていた。その火の色は、緑だった。',
mid:'石舞台を囲む小石の一つひとつに、人の顔が彫られていた。|篝火の煙が、空で大きな手の形になった。',
end:'石舞台の中央の平石の下に、{g}を封じた石棺が埋まっていた。',
out:'石棺が割れると、石舞台の巨石が一つずつ倒れていった。一行は、地響きの中を森へ逃げ込んだ。',
die:'{a}の背後で、巨石が傾いた。逃げる間もなかった。|篝火の緑の炎が、{a}の影に燃え移った。影が燃え尽きると、{a}も倒れた。'}),
P({id:'isle',name:'湖の小島',noun:'社',to:'湖に浮かぶ小島の社',
in:'一行は、岸に繋がれた小舟で、湖の小島へ漕ぎ出した。水面には、村の提灯が一つも映っていなかった。|湖の上には霧が立ちこめ、櫂を漕ぐたびに、水の中から何かが船底を撫でた。',
mid:'湖の底に、沈んだ村の屋根が見えた。屋根の上で、誰かが手を振っていた。|小舟の縁に、濡れた手形がいくつも増えていった。',
end:'小島の社の扉を開けると、中に{g}の御神体が、湖の水に浸かって祀られていた。',
out:'社が崩れると、湖が大きくうねった。一行は小舟に飛び乗り、必死に岸へ漕いだ。',
die:'{a}が小舟から身を乗り出したとき、水の中から伸びた手が、{a}を湖へ引きずり込んだ。|小舟が傾き、{a}は冷たい湖に落ちた。泳げるはずなのに、体はただ沈んでいった。'}),
P({id:'bridge',name:'吊り橋の先の祠',noun:'岩棚',to:'谷に架かる吊り橋の先の祠',
in:'谷に架かる吊り橋は、一歩ごとに大きく揺れた。谷底から、祭り囃子が聞こえてくる。|吊り橋の板は、ところどころ抜けていた。下は、雲で底が見えない。',
mid:'橋の真ん中で、向こう岸から誰かが渡ってきた。すれ違うとき、その人には顔がなかった。|吊り橋の綱に、千羽鶴のように紙垂が結ばれていた。',
end:'吊り橋を渡りきった岩棚に、{g}の祠がぽつんと建っていた。',
out:'祠が崩れると、背後の吊り橋の綱が、一本ずつ切れていった。一行は、落ちかける橋を走って渡った。',
die:'{a}の踏んだ板が割れた。{a}の悲鳴は、谷底へ吸い込まれていった。|吊り橋の綱が切れた。綱にしがみついた{a}は、岩壁に叩きつけられた。'}),
P({id:'mound',name:'田の中の首塚',noun:'塚',to:'田んぼの真ん中の首塚',
in:'刈り入れ前の田んぼの真ん中に、こんもりとした塚があった。稲穂が、一行を避けるように左右に分かれた。|畦道を歩くと、田んぼの水面に、映るはずのない人影が映った。',
mid:'案山子が、一行の進む方へ、首を回していった。|稲の中から、子どもの笑い声がした。',
end:'塚の上の古い石碑が、{g}の祠だった。石碑の下からは、生ぬるい息が漏れていた。',
out:'石碑が倒れると、田んぼの水が一斉に引いた。泥の底から、無数の骨が顔を出した。一行は、振り返らずに畦道を走った。',
die:'{a}の足が、田んぼの泥に沈んだ。泥は、もがくほどに{a}を呑み込んでいった。|稲穂が刃のように硬くなり、{a}の体を切り刻んだ。'}),
P({id:'hall',name:'公民館',noun:'公民館',to:'村の公民館',
in:'公民館の集会室には、村人全員分の座布団が並べられ、そのすべてに村人が座っていた。|公民館の掲示板に、「本日の議題　生贄の選定」と書かれた紙が貼られていた。',
mid:'舞台のスクリーンに、一行が村に着いてからの姿が、八ミリフィルムで映し出されていた。|厨房の大鍋で、何かが煮えていた。',
end:'公民館の舞台の床下に、{g}の祠が収められていた。',
out:'祠が壊れると、座っていた村人たちが一斉に崩れ落ちた。中身は、藁だった。一行は、藁の山を踏み越えて外へ出た。',
die:'{a}は村人たちに囲まれ、座布団の上に押さえつけられた。それきり、起き上がらなかった。|厨房の大鍋が、{a}の上にひっくり返った。'}),
P({id:'honden',name:'神社の本殿',noun:'本殿',to:'神社の本殿',
in:'鳥居をくぐると、参道の石灯籠に一斉に火が灯った。|本殿の前の賽銭箱から、黒い水があふれ出していた。',
mid:'拝殿の天井に、奉納された絵馬がびっしりと吊るされていた。どれにも、生贄にされた人の名前が書いてある。|狛犬の首が、一行の方を向いていた。',
end:'本殿の御扉を開けると、御神体の鏡の代わりに、{g}そのものの一部が祀られていた。',
out:'御神体が砕けると、本殿の屋根が落ちた。一行は、燃え上がる神社から、石段を駆け下りた。',
die:'{a}が触れた鈴緒が、首に巻きついた。|石灯籠が倒れてきて、{a}を下敷きにした。'}),
P({id:'forest',name:'禁足地の森',noun:'森',to:'禁足地の森の奥',
in:'禁足地の森は、一歩踏み込むと、外の音がすべて消えた。|木々の幹に、無数の釘が打ち込まれていた。藁人形は、一つもなかった。',
mid:'森の中で、同じ木の前を三度通り過ぎた。|木の枝に、一行の服とそっくりな服が掛けられていた。',
end:'森の奥の空き地に、苔むした石の祠があった。周りの木はすべて、祠に向かってお辞儀するように曲がっていた。',
out:'祠が崩れると、森じゅうの木々が一斉にざわめいた。一行は、枝に引っかかれながら森を抜けた。',
die:'{a}の足に、木の根が絡みついた。根はゆっくりと、{a}を土の中へ引き込んだ。|{a}は森の奥で、仲間とはぐれた。それきり、誰も{a}の声を聞かなかった。'}),
P({id:'yagura',name:'祭りの櫓',noun:'広場',to:'広場の祭りの櫓',
in:'広場の真ん中に組まれた祭りの櫓の周りで、村人たちが踊り狂っていた。一行は、踊りの輪をかき分けて櫓へ向かった。|祭り囃子が最高潮に高まったとき、一行は櫓の梯子に手をかけた。',
mid:'踊りの輪の村人たちは、皆、同じ顔の面をつけていた。|櫓の上の太鼓には、皮ではない何かが張られていた。',
end:'櫓の上の太鼓の奥に、{g}の祠が据えられていた。',
out:'祠を落とすと、踊っていた村人たちが一斉に動きを止め、その場に崩れ落ちた。一行は、静まり返った広場を走り抜けた。',
die:'{a}は踊りの輪に引き込まれ、二度と輪から出られなかった。|櫓の上から突き落とされた{a}は、踊る村人たちの足元に落ちた。'}),
P({id:'peak',name:'山頂の磐座',noun:'磐座',to:'山頂の磐座',
in:'山頂へ続く獣道を、一行は息を切らして登った。月が、異様に大きかった。|山頂の巨岩には注連縄が張られ、その前で火が焚かれていた。',
mid:'登るにつれて、星の並びが見知らぬものに変わっていった。|山道の脇に、登りきれなかった人たちの遺品が並んでいた。',
end:'山頂の磐座の割れ目の奥に、{g}の祠が隠されていた。',
out:'祠が崩れると、山全体が身震いした。一行は、転がり落ちる岩を避けながら、獣道を駆け下りた。',
die:'{a}は崖の縁で足を踏み外した。|山頂の強風が、{a}の体を宙に攫った。'}),
P({id:'culvert',name:'地下の暗渠',noun:'暗渠',to:'村の地下を流れる用水路の暗渠',
in:'用水路の暗渠に潜り込むと、水は膝まであった。懐中電灯の光から、何かが水中を泳いで逃げていった。|暗渠の壁には、増水の跡の線が、天井近くまで刻まれていた。',
mid:'暗渠の分かれ目ごとに、小さな地蔵が置かれていた。どの地蔵も、首がなかった。|水の流れが、だんだん逆向きになっていった。',
end:'暗渠が合流する地下の溜め池の中央に、{g}の祠が、水面から突き出ていた。',
out:'祠が崩れると、地下の水が一気にあふれ出した。一行は、水に押し流されながら、マンホールから地上へ這い出した。',
die:'{a}の足が、水底の格子に挟まった。水位は、見る間に上がっていった。|暗渠の奥から、鉄砲水が押し寄せた。{a}は流れに呑まれた。'})
];
var UNIQ={
gatano:P({id:'mirror',noChase:true,name:'鏡の先の異空間',noun:'鏡の村',to:'神社の大鏡の向こう側',
in:'社の大鏡に手を触れると、指先が水面のように沈んだ。一行は、一人ずつ鏡の中へ踏み込んだ。|鏡の向こうは、左右の反転した村だった。空には、太陽が二つあった。',
mid:'鏡の村の村人たちは、一行と同じ顔をして、同じ動きを、少し遅れて繰り返していた。|振り向くと、来た道が鏡になっていた。映った一行は、こちらを見て笑っていた。',
end:'鏡の村の真ん中に、山がひとつ、逆さに浮かんでいた。その頂に、見てはならぬ山の神の祠があった。',
out:'祠が砕けると、鏡の世界にひびが走った。一行は、割れていく空の下を、出口の鏡へ走った。',
die:'{a}は、鏡の中の自分と目が合った。次の瞬間、鏡の向こうの{a}が、ゆっくりと手を伸ばしてきた。手を握られた{a}は、鏡の中へ引き込まれ、二度と映らなくなった。|{a}が鏡の村で振り返ると、体が左右逆に裏返った。{a}は、自分の内臓を見下ろしながら倒れた。'}),
ygolonac:P({id:'books',name:'貸本屋の書庫',noun:'書庫',to:'村に一軒だけの貸本屋の書庫',
in:'村に一軒だけの貸本屋は、祭りの夜にも灯りがついていた。店の奥の書庫から、紙をめくる音がする。|貸本屋の帳場には、誰もいなかった。貸出票の最後の欄に、一行全員の名前が書かれていた。',
mid:'書庫の棚には、同じ青い背表紙の本が、何百冊も並んでいた。どの本の題も『グラーキの黙示録　第十二巻』だった。|本のページの間から、掌ほどの口が、ぱくぱくと覗いた。',
end:'書庫の最深部の読書机に、首のない肥えた男が座り、掌の口で本を読んでいた。その足元に、掌の口さまの祠があった。',
out:'祠が燃え上がると、書庫の本が一斉に燃え始めた。一行は、火の粉の舞う書庫から転がり出た。',
die:'{a}が棚から抜いた本を開くと、ページから掌の口が飛び出し、{a}の顔に食らいついた。|書架が倒れ、{a}は本の山の下敷きになった。本の中から、咀嚼する音が聞こえた。'}),
shijima:P({id:'bamboo',name:'竹林の無音堂',noun:'無音堂',to:'竹林の奥の無音堂',
in:'無音堂へ続く竹林では、風が吹いても、葉擦れの音ひとつしなかった。|竹林の入口に、村人たちが口を縫い合わせて立っていた。一行は、息を殺して、その間を抜けた。',
mid:'竹の節ごとに、耳の形をした茸が生えていた。|地面の枯れ葉は、一枚残らず湿らされていた。踏んでも、音が出ないように。',
end:'竹林の奥の無音堂には、扉も鈴もなかった。中央に、口をすぼめた無音様の像が立っていた。',
out:'像が崩れると、竹林じゅうに、溜め込まれていた音が一斉にあふれ出した。一行は、耳を塞いで竹林を走り抜けた。',
die:'{a}の喉から、小さな咳がこぼれた。次の瞬間、{a}の体は、内側へ折り畳まれるようにして消えた。|{a}は竹の切り株に足をぶつけ、思わず息を呑んだ。その小さな音で、十分だった。'}),
hastur:P({id:'theater',name:'廃劇場',noun:'劇場',to:'村はずれの廃劇場',
in:'村はずれの廃劇場の看板に、今夜の演目が書かれていた。『黄衣の王』。|劇場の客席は、黄色い布をかぶった観客で埋まっていた。誰も、息をしていなかった。',
mid:'舞台の袖に、一行の名前の書かれた台本が置かれていた。台詞は、すべて覚えのあるものだった。|天井桟敷から、黄色い襤褸がゆっくりと垂れ下がってきた。',
end:'舞台の奈落の底に、黄の印を刻んだ祠があった。',
out:'祠が崩れると、客席の黄色い布が一斉に崩れ落ちた。一行は、幕の降りる音を背に、劇場から逃げ出した。',
die:'{a}は台本の第二幕を、思わず読み上げてしまった。{a}の顔から、仮面が剥がれるように何かが落ちた。|奈落の迫りが急に下がり、{a}は闇の底へ落ちていった。'}),
dagon:P({id:'reef',name:'岬の岩礁の社',noun:'岩礁',to:'潮が引くと現れる岬の岩礁の社',
in:'岬の突端の岩礁に、潮が引くと現れる社があった。一行は、ぬめる岩を伝って沖へ向かった。|潮の引いた岩礁には、魚の頭をした人影が、何人もうずくまっていた。',
mid:'岩の窪みの潮だまりに、指輪をはめた人の手が沈んでいた。|沖の方から、低い歌声が、波に乗って近づいてきた。',
end:'岩礁の先の社に、{g}の御神体――人の背丈ほどもある鱗が一枚、祀られていた。',
out:'社が崩れると、沖の海が盛り上がった。一行は満ちてくる潮に追われながら、岩礁を駆け戻った。',
die:'満ち潮が、{a}の足元をさらった。水かきのある手が、{a}を沖へ引いていった。|{a}は岩礁の割れ目に足を挟まれた。潮は、ゆっくりと満ちていった。'}),
cthulhu:P({id:'temple',noChase:true,name:'海から浮上した神殿',noun:'神殿',to:'沖に浮かび上がった石の神殿',
in:'夜半、沖の海が割れ、巨大な石造りの神殿が浮かび上がった。一行は、浜の舟で神殿へ漕ぎ寄せた。|神殿の石段は、角度がどれも狂っていた。上っているはずなのに、下っている。',
mid:'神殿の壁画には、星から降りてくる眠りの大神の姿が刻まれていた。|神殿の扉の隙間から、夢で聞いた声が漏れていた。',
end:'神殿の最深部の巨大な扉が、内側からゆっくりと押し開かれようとしていた。その前に、封印の石の台座があった。',
out:'封印の石が嵌まると、神殿は轟音とともに海へ沈み始めた。一行は、傾く石段を転がるように駆け下り、舟に飛び乗った。',
die:'{a}は、狂った角度の石段の隙間に、吸い込まれるように落ちていった。|{a}は神殿の扉の隙間を覗いてしまった。それきり、{a}は笑うことしかできなくなり、波間へ歩いていった。'}),
yog:P({id:'circle',noChase:true,name:'山頂の環状列石',noun:'列石',to:'山頂の環状列石',
in:'山頂の草原に、巨石が輪になって立っていた。その真ん中だけ、星の並びが違っていた。|環状列石の中に入ると、腕時計の針が、ばらばらの速さで回り始めた。',
mid:'列石の向こうに、昨日の一行が歩いているのが見えた。|空に、虹色の球体がいくつも浮かんでいた。',
end:'列石の中心の祭壇石の上に、門が開きかけていた。その向こうで、すべての時間が渦を巻いていた。',
out:'門が閉じると、列石が一つずつ倒れた。一行は、時間の揺り戻しに目眩を覚えながら、山を下りた。',
die:'{a}は列石の隙間をくぐった。向こう側に出た{a}は、白髪の老人になっていた。|虹色の球体の一つが{a}に触れた。{a}の体は、いくつもの時間に引き裂かれた。'}),
cthugha:P({id:'kiln',name:'炭焼き窯',noun:'窯',to:'山の炭焼き窯',
in:'山の炭焼き窯は、祭りの夜にだけ火が入る。窯の口から、生き物のような炎が漏れていた。|窯へ続く道の木々は、すべて黒焦げだった。',
mid:'熱で、空気がゆらめいていた。炎の中に、踊る人影が見えた。|窯の周りの地面に、溶けたガラスのような人の形が、いくつも転がっていた。',
end:'炭焼き窯の奥、燃え続ける炎の芯に、炎の御方の祠があった。',
out:'祠が崩れると、窯の炎が一斉に噴き上がり、そして消えた。一行は、熱風に背中を押されて山道を走った。',
die:'窯の口から伸びた炎の舌が、{a}を絡め取った。|{a}の服に火の粉が燃え移った。払っても払っても、炎は消えなかった。'}),
hanayome:P({id:'wedding',name:'婚礼の座敷',noun:'座敷',to:'旧家の婚礼の座敷',
in:'村いちばんの旧家の大広間に、婚礼の膳が並んでいた。上座の花嫁の席だけが、空いていた。|祝言の座敷に通されると、村人たちが一斉に「＠おめでとうございます」と頭を下げた。',
mid:'金屏風の裏に、歴代の花嫁の白無垢が掛けられていた。どれにも、血の染みがあった。|三三九度の盃に、酒ではなく黒い水が注がれていた。',
end:'上座の金屏風の向こうに、しろうどさまの祠があった。綿帽子の下から、何かがこちらを見ていた。',
out:'祠が崩れると、婚礼の膳が一斉にひっくり返った。一行は、白無垢の群れに追われながら、座敷を飛び出した。',
die:'{a}の肩に、白無垢がふわりと掛けられた。脱ごうとするほど、布は肌に食い込んでいった。|三三九度の盃を、無理やり口に流し込まれた{a}は、その場で崩れ落ちた。'}),
mekura:P({id:'yakushi',name:'薬師堂',noun:'薬師堂',to:'山の中腹の薬師堂',
in:'薬師堂の軒には、奉納された義眼が、びっしりと吊るされていた。|薬師堂の石段に、両目を布で覆った村人たちが、並んで座っていた。',
mid:'格子戸の隙間から、薬草を煎じる匂いが漂ってきた。|仏具の代わりに、手術用の鉗子が並んでいた。',
end:'本尊の前に、目洗い薬師の祠があった。本尊の顔には、目がなかった。',
out:'祠が崩れると、吊るされた義眼が一斉に落ちて、床を転がった。一行は、それを踏まないように堂を飛び出した。',
die:'{a}の目に、ふいに布がかけられた。布が取れたとき、{a}の両目は、もうなかった。|煎じ薬の湯気を吸い込んだ{a}は、その場で眠るように息を引き取った。'}),
kamikakushi:P({id:'torii',name:'千本鳥居の奥',noun:'鳥居の奥',to:'裏山の千本鳥居の奥',
in:'神社の裏山に、千本鳥居が続いていた。くぐるたびに、後ろの仲間の足音が、少しずつ遠くなった。|鳥居の朱色が、奥に進むほど黒ずんでいった。',
mid:'鳥居の柱に、行方不明になった人たちの名前が刻まれていた。|鳥居の向こうから、子どもが手招きしていた。',
end:'千本目の鳥居の先に、隠し神さまの祠があった。そこには、今まで消えた人たちの持ち物が、山のように積まれていた。',
out:'祠が崩れると、鳥居が一本ずつ倒れていった。一行は、倒れる鳥居の下をくぐって、元来た道を駆け戻った。',
die:'{a}は鳥居をくぐった。次の鳥居の下には、もう{a}はいなかった。|鳥居の影から伸びた手が、{a}の手を引いた。{a}は振り返らずに、鳥居の奥へ歩いていった。'}),
glaaki:P({id:'lake',name:'湖に沈んだ集落',noun:'集落',to:'湖畔に沈んだ集落',
in:'湖に沈んだ集落の屋根が、湖面から突き出ていた。一行は、屋根から屋根へと飛び移って進んだ。|湖の水は鏡のように静かで、水底の家々の灯りまで見えた。',
mid:'水底の家の窓から、緑色の顔がいくつも、こちらを見上げていた。|湖面に、巨大な棘のある背中が、ゆっくりと浮かび上がった。',
end:'集落の真ん中、水没した寺の屋根の上に、湖の底の主の祠があった。',
out:'祠が沈むと、湖面が大きく泡立った。一行は、沈んでいく屋根を蹴って岸へ跳んだ。',
die:'{a}の足元の瓦が割れ、{a}は湖へ落ちた。水の中で、棘が{a}の胸を貫いた。|湖面から伸びた棘が、{a}の背中に突き刺さった。'}),
mordiggian:P({id:'ossuary',name:'納骨堂',noun:'納骨堂',to:'寺の裏の納骨堂',
in:'寺の裏の納骨堂の扉には、外からではなく、内側から閂がかけられていた。|納骨堂の前の地面に、何かが土を掘り返した跡が、いくつも残っていた。',
mid:'骨壺は、すべて空になっていた。|棚の奥で、何かが骨をしゃぶる音がした。',
end:'納骨堂の最深部の祭壇に、屍を喰らう神の祠があった。その周りに、しゃぶり尽くされた骨が積まれていた。',
out:'祠が崩れると、納骨堂の床が抜けた。一行は、地下から湧き上がる腐臭の中を、外へ逃れた。',
die:'{a}の背後の棚から、骨のように痩せた何かが飛びかかった。|{a}は暗がりで、骨の山に足を取られた。骨の山は、{a}を飲み込んで閉じた。'}),
shub:P({id:'feast',name:'森の宴',noun:'森',to:'森の奥の収穫祭の宴',
in:'森の奥の開けた場所で、収穫祭の宴が開かれていた。葡萄酒の甘い匂いが、一行の足を鈍らせた。|森の木々の枝に、黒い仔山羊の毛が、何房も結ばれていた。',
mid:'宴の輪の中で、村人たちが、獣のように絡み合って踊っていた。|地面がぬかるんで、生温かかった。土そのものが、脈打っていた。',
end:'宴の中心の巨木の根元に、千の仔を孕む森の母の祠があった。祠の奥から、仔山羊の鳴き声が響いていた。',
out:'祠が崩れると、宴の村人たちが一斉に倒れ、眠りに落ちた。一行は、ぬかるむ森を抜けて走った。',
die:'地面から伸びた黒い蹄の脚が、{a}を踏み潰した。|{a}は宴の輪に引き込まれた。輪が閉じたあと、{a}の姿はなかった。'}),
ithaqua:P({id:'pass',fix:true,name:'峠の祠',noun:'峠',to:'吹雪の峠の祠',
in:'吹雪の峠道を、一行は互いの体を縄で結んで登った。|峠に近づくと、風の音が、人の名前を呼ぶ声に変わった。',
mid:'雪の中に、空を見上げたまま凍りついた人が立っていた。|足跡が、途中でふっと消えていた。空へ。',
end:'峠の頂の、雪に埋もれた石の祠。その上の空で、巨大な目が二つ、赤く光っていた。',
out:'祠が崩れると、吹雪がぴたりと止んだ。一行は、静まり返った雪の峠を駆け下りた。',
die:'突風が、{a}を縄ごと攫い上げた。縄は、途中で切れていた。|{a}は吹雪の中で、足を止めてしまった。そのまま、雪像のように動かなくなった。'}),
byatis:P({id:'dungeon',fix:true,name:'旧家の地下牢',noun:'地下牢',to:'旧家の地下牢',
in:'旧家の座敷の畳の下に、地下牢への階段が隠されていた。|地下牢の格子の向こうから、湿った呼吸音が聞こえた。',
mid:'牢の壁に、正の字がびっしりと刻まれていた。|格子の一つが、内側から曲げられていた。',
end:'地下牢の最深部、いちばん太い格子の向こうに、蛇髭の神の祠があった。',
out:'祠が崩れると、地下牢の天井から土砂が降ってきた。一行は、格子の間を這って階段へ逃れた。',
die:'格子の隙間から伸びた髭が、{a}の首に巻きついた。|{a}の背後で、牢の扉が閉まった。鍵穴は、内側にはなかった。'})
};
UNIQ.rlyeh_child=UNIQ.dagon;
var CAVE_FIX={tsathoggua:1,yig:1};
function pick(S){
var rng=S.rng,id=S.G.id,u=UNIQ[id];
if(CAVE_FIX[id])return GEN[0];
if(u&&(u.fix||rng()<0.75))return u;
return GEN[rng()*GEN.length|0];
}
function hazard(S,live){
var rng=S.rng,PL=S.place,C=JS.core,n=0;
live.forEach(function(p){
if(n>=2|| !JS.alive(p)||p.out||p.bound||rng()>0.13)return;
var dodge=0.3+JS.skill(p,'obs')*0.25+p.tr.caution*0.2+p.stats.luck*0.03-p.m.fear/500;
if(rng()<HK.Dark.live(S,dodge,'kill')){
var dt=ST.fmt(ST.pick(S,PL.die),{a:p.name}).split('。');
ST.sayB(S,{actors:[p],tag:'罠',text:(dt.length>2?dt[0]+'。――だが':p.name+'の足元で、何かが動いた。――')+p.name+'は、寸前でそれに気づき、身を翻していた。',why:p.name+'は寸前で気づいた（観察・慎重さ・運）'},p.name+'が'+PL.name+'の罠を避けた');
return;
}
n++;
C.die(S,p,PL.name+'で',PL.die);
});
}
var NOISE=L('くしゃみ|腹の鳴る音|携帯電話の通知音|踏んだ枯れ枝の折れる音|噛み合わない歯の鳴る音|ポケットの鍵束の音');
var SHI_MUTUAL=L('{b}は両手で口を押さえた。耳に残った囁きは、{b}がずっと言えずにいた言葉と同じだった。{b}は声を出さずに、唇の形だけで答えた。――こっちの台詞だよ、と。|{b}は声を殺して泣いた。片想いだと思っていた。ずっと、自分だけだと思っていた。返事は、音にしてはいけなかった。{b}は竹林の闇に向かって、唇だけで「私も」と言った。|{b}は、{a}の消えた闇を見つめたまま、震える唇を噛んだ。どうして、今なのか。どうして、自分から先に言わなかったのか。{b}は涙が落ちる音さえ立てないように、ただ何度も頷いた。');
function travel(S,live){
if(S.G.id!=='shijima')return;
var rng=S.rng,C=JS.core,REL=JS.REL;
ST.say(S,{kind:'phase',text:'無音堂までは、一言も、ひと息の音も立ててはならない。一行は、手振りだけで頷き合った。'});
var pr=pairs(S,live,function(c){return c==='love'||c==='crush';})[0];
if(pr&&rng()<0.4){
var a=pr[0],b=pr[1];
var t=b.name+'の肩が、恐怖で小刻みに震えていた。'+a.name+'は、たまらず'+b.name+'の耳元に唇を寄せた。'+JS.placeLine(a,'SHI_WHISPER',b)+'吐息よりも小さな声だった。――それでも、無音様には十分だった。';
C.die(S,a,'無音堂へ向かう竹林で、囁いてしまって',[t+'{a}の体は、囁きの形に口を開けたまま、竹林の闇に吸い込まれて消えた。']);
if(JS.alive(b)){
if(rng()<0.3+b.m.fear/300-b.tr.cp*0.2)C.die(S,b,'恋人の消えた竹林で、声を上げてしまって',['{a}の喉から、悲鳴がほとばしった。それは、すぐに途切れた。']);
else if(REL&&REL.mutual&&REL.mutual(S,a,b))ST.say(S,{actors:[b,a],tag:'無音',kind:'climax',text:ST.fmt(ST.pick(S,SHI_MUTUAL),{a:a.name,b:b.name}),why:b.name+'は'+a.name+'を失っても、声を出さなかった――二人は両片想いだった（CP・恐怖）',mag:36});
else ST.say(S,{actors:[b],tag:'無音',kind:'climax',text:b.name+'は両手で自分の口を押さえ、声を殺して泣いた。涙が落ちる音さえ、立てないように。',why:b.name+'は'+a.name+'を失っても、声を出さなかった（CP・恐怖）',mag:34});
}
if(REL&&JS.DRAMA)JS.DRAMA.edge(S,a,b,'囁いた','love',a);
}
live.forEach(function(p){
if(!JS.alive(p)||p.bound)return;
var r=0.1+p.m.fear/600+p.tr.impulse*0.08-p.tr.caution*0.1-p.stats.luck*0.012;
if(rng()>r)return;
var x=ST.pick(S,NOISE);
if(rng()<0.25+p.tr.caution*0.3){
ST.say(S,{actors:[p],tag:'無音',text:p.name+'は、'+x+'を立てかけた。とっさに体ごと地面に伏せ、音を殺した。竹林は、静まり返ったままだった。',why:'慎重さで、音を押し殺した',mag:18});
return;
}
C.die(S,p,'無音堂へ向かう竹林で、音を立てて',['{a}の'+x+'が、竹林に響いた。――次の瞬間、{a}の姿は、その音ごと消えていた。足跡だけが、そこで途切れていた。']);
});
}
function pairs(S,live,test){
var out=[],REL=JS.REL;
live.forEach(function(a){
live.forEach(function(b){
if(a===b|| !JS.alive(a)|| !JS.alive(b)||a.bound||b.bound)return;
var c=REL.cat(S,a,b);
if(c&&test(c,a,b))out.push([a,b,c]);
});
});
return out.sort(function(){return S.rng()-0.5;});
}
function r18(S,x,y){return JS.R18&&(JS.R18.onPC?JS.R18.onPC(S):JS.R18.on(S))&&JS.R18.climaxRel&&(!JS.R18.room||JS.R18.room(S,[x,y]))?JS.R18.climaxRel:null;}
function edge(S,a,b,lab,cls){if(JS.DRAMA)JS.DRAMA.edge(S,a,b,lab,cls,a);}
var LOVEISH=function(c){return c==='love';},CLOSE=function(c){return c==='love'||c==='family'||c==='close';},BAD=function(c){return c==='bad'||c==='ex';};
var GREL={
ygolonac:function(S,live){
var rng=S.rng,C=JS.core,lv=pairs(S,live,LOVEISH)[0],bd=pairs(S,live,BAD)[0];
if(bd&&(!lv||rng()<0.5)){
var a=bd[0],b=bd[1];
a.viol=(a.viol||0)+25;
var t=a.name+'の掌が、じくじくと疼いた。'+a.name+'は、ゆっくりと'+b.name+'に向き直った。'+JS.placeLine(a,'YGO_RAGE',b);
edge(S,a,b,'襲いかかった','enemy');
if(rng()<0.35+a.viol/300+a.tr.aggr*0.2-b.stats.stamina*0.03){
C.die(S,b,'掌の口さまに暴力を煽られた'+a.name+'に襲われて',[t+a.name+'は'+b.name+'に馬乗りになり、何度も、何度も、拳を振り下ろした。掌の口が、そのたびに笑い声を上げた。仲間が引き剥がしたとき、'+b.name+'はもう動かなかった。']);
return{bonus: -0.05};
}
var o=ST.say(S,{actors:[a,b],tag:'暴力',kind:'climax',text:t+a.name+'は'+b.name+'の喉に掴みかかった。'+b.name+'は書架に叩きつけられながら、'+a.name+'の顔を本の角で殴り返した。仲間が二人を引き離すまで、獣のような揉み合いが続いた。',why:'不仲の二人。掌の口さまが、'+a.name+'の暴力を煽った（暴力性 '+Math.round(a.viol)+'）',mag:40});
ST.key(S,o,a.name+'が'+b.name+'に襲いかかった');
b.m.hp=clamp(b.m.hp-25,0,100);
return{bonus: -0.06};
}
if(!lv)return null;
var lo=HK.Pos?HK.Pos.order(lv[0],lv[1],[lv[0],lv[1]]):lv,x=lo[0],y=lo[1],f=HK.Pos&&(!HK.Pos.okSex(x,y)||(HK.Pos.libOK&& !HK.Pos.libOK([x,y])))?null:r18(S,x,y);
var head=x.name+'の掌が、熱く脈打った。'+x.name+'は'+y.name+'の腕を掴んで引き寄せた。'+JS.placeLine(x,'YGO_LUST',y);
var body=f?f(S,'lust',x,y):x.name+'は'+y.name+'を書架に押しつけ、貪るように唇を重ねた。'+y.name+'も、拒まなかった。掌の口さまが、二人の欲を、根こそぎ引きずり出していた。仲間に肩を揺さぶられて、二人はようやく我に返った。';
ST.key(S,ST.say(S,{actors:[x,y],tag:'欲情',kind:'climax',text:head+body,why:'恋人どうし。掌の口さまが、二人の欲を煽った――封印の儀が遅れた',mag:38}),x.name+'と'+y.name+'が欲に呑まれた');
edge(S,x,y,'欲に呑まれた','love');
return{bonus: -0.05};
},
shub:function(S,live){
var lv=pairs(S,live,LOVEISH)[0];
if(!lv)return null;
var lo=HK.Pos?HK.Pos.order(lv[0],lv[1],[lv[0],lv[1]]):lv,x=lo[0],y=lo[1],f=HK.Pos&&(!HK.Pos.okSex(x,y)||(HK.Pos.libOK&& !HK.Pos.libOK([x,y])))?null:r18(S,x,y);
var body=f?f(S,'fertile',x,y):'宴の甘い匂いに当てられて、'+x.name+'と'+y.name+'は、踊りの輪の中へ引き込まれていった。互いの顔しか見えなくなり、二人は輪の真ん中で、いつまでも抱き合っていた。仲間が二人を輪の外へ引きずり出したのは、ずいぶん経ってからだった。';
ST.say(S,{actors:[x,y],tag:'豊穣の宴',kind:'climax',text:x.name+'は、'+y.name+'の手を握ったまま、宴の方へふらりと歩き出した。'+body,why:'恋人どうし。豊穣の母の宴に呑まれた',mag:36});
return{bonus: -0.04};
},
hanayome:function(S,live){
var rng=S.rng,lv=pairs(S,live,LOVEISH)[0];
if(!lv)return null;
var a=lv[0],b=lv[1],bd=JS.REL.bond(S,a,b);
var t='綿帽子の下の何かが、ゆっくりと'+b.name+'を指さした。白無垢が、ひとりでに宙を舞い、'+b.name+'の肩へ降りてくる。'+a.name+'は、'+b.name+'の前に立ちはだかった。'+JS.placeLine(a,'HANA_REFUSE',b);
if(rng()<0.4+bd*0.3){
ST.key(S,ST.say(S,{actors:[a,b],tag:'花嫁',kind:'climax',text:t+a.name+'は白無垢を掴んで引き裂いた。座敷じゅうに、しろうどさまの金切り声が響いた。――花嫁を奪われた神は、怒りで我を忘れていた。',why:'恋人どうし。'+a.name+'が'+b.name+'を花嫁にさせなかった（絆）――神が隙を見せた',mag:42}),a.name+'が'+b.name+'を守った');
return{bonus:0.06};
}
var v=a.persona==='devoted'||rng()<0.3?a:b;
v.alive=false;v.taken=false;v.fate='しろうどさまの花嫁にされた（'+JS.hm(S.h)+'）';
var o=ST.say(S,{actors:[a,b],tag:'花嫁',kind:'climax',text:t+(v===a?'白無垢は、'+b.name+'ではなく、立ちはだかった'+a.name+'の肩に降りた。'+a.name+'は振り返って、少しだけ笑った。金屏風が閉じ、'+a.name+'の姿は、その向こうへ消えた。':a.name+'の手をすり抜けて、白無垢は'+b.name+'を包み込んだ。'+b.name+'は、'+a.name+'の名前を呼びながら、金屏風の向こうへ引き込まれていった。'),why:v.name+'が花嫁にされた――花嫁を得た神は、上機嫌で目を細めた',mag:46});
ST.key(S,o,v.name+'が花嫁にされた');
JS.REL.onDeath(S,v);
return{bonus:0.1};
},
nyarla:function(S,live){
var rng=S.rng,C=JS.core,lv=pairs(S,live,LOVEISH)[0],bd=pairs(S,live,BAD)[0];
if(bd&&(!lv||rng()<0.5)){
var a=bd[0],b=bd[1];
var t='伝道師様が、いつの間にか'+a.name+'の隣にいた。「＠あなたは賢い方だ。一人差し出せば、残りは帰れる。……誰を差し出すかは、お任せしますよ」'+a.name+'の目が、'+b.name+'の背中に止まった。'+JS.placeLine(a,'NYA_BETRAY',b);
edge(S,a,b,'売った','enemy');
if(rng()<0.4+a.tr.cold*0.3){
C.die(S,b,a.name+'に、伝道師様へ売られて',[t+'伝道師様は、恭しく一礼した。「＠承りました」――'+b.name+'の足元の影が、底なしの穴のように口を開けた。'+b.name+'は、'+a.name+'の名前を叫びながら、闇に落ちていった。']);
a.notes.push('伝道師様に、'+b.name+'を売った');
return{bonus:0.04};
}
ST.say(S,{actors:[a,b],tag:'取引',kind:'climax',text:t+'しかし、'+b.name+'は振り返って、'+a.name+'の顔をまっすぐに見た。伝道師様は、肩をすくめた。「＠おや、聞こえていましたか」――一行の中に、取り返しのつかない亀裂が走った。',why:a.name+'は'+b.name+'を売ろうとしたが、聞かれていた',mag:34});
return{bonus: -0.06};
}
if(!lv)return null;
var x=lv[0],y=lv[1];
ST.key(S,ST.say(S,{actors:[x,y],tag:'取引',kind:'climax',text:'伝道師様が、'+x.name+'の耳元で囁いた。「＠あなただけなら、無事に帰して差し上げますよ。'+y.name+'さんを置いていくなら、ね」'+JS.placeLine(x,'NYA_REFUSE',y)+'伝道師様は、心底愉快そうに拍手をした。「＠素晴らしい。実に素晴らしい。――では、お二人で、お好きなようにあがいてごらんなさい」',why:'恋人どうし。'+x.name+'は伝道師様の取引を断った',mag:36}),x.name+'が取引を断った');
return{bonus:0.04};
},
gatano:function(S,live){
var rng=S.rng,pr=pairs(S,live,CLOSE)[0];
if(!pr)return null;
var a=pr[0],b=pr[1],bd=JS.REL.bond(S,a,b);
var t='鏡の村の路地で、'+b.name+'が二人になった。どちらも同じ顔で、同じように怯え、同じように'+a.name+'に手を伸ばしていた。'+a.name+'は、二人の'+b.name+'を、長いあいだ見比べた。'+JS.placeLine(a,'MIRROR_TRUE',b);
if(rng()<0.45+bd*0.3+JS.skill(a,'obs')*0.15){
ST.key(S,ST.say(S,{actors:[a,b],tag:'鏡像',kind:'climax',text:t+a.name+'が本物の手を握った瞬間、もう一人の'+b.name+'は、ひびの入った鏡のように砕け散った。',why:a.name+'は本物の'+b.name+'を見抜いた（'+JS.REL.cat(S,a,b)+'の絆・観察）',mag:38}),a.name+'が本物の'+b.name+'を見抜いた');
return{bonus:0.04};
}
b.alive=false;b.taken=false;b.fate='鏡の中に取り残された（'+JS.hm(S.h)+'）';
var o=ST.say(S,{actors:[a,b],tag:'鏡像',kind:'climax',text:t+'けれど、'+a.name+'が握ったのは、鏡の'+b.name+'の手だった。後ろで、本物の'+b.name+'が何かを叫んでいた。その声は、ガラス越しのように、どこにも届かなかった。',why:a.name+'は鏡像を選んでしまった。本物の'+b.name+'は鏡の中に取り残された',mag:44});
ST.key(S,o,b.name+'が鏡の中に取り残された');
JS.REL.onDeath(S,b);
return{bonus:0};
},
kamikakushi:function(S,live){
var rng=S.rng,pr=pairs(S,live,CLOSE)[0];
if(!pr)return null;
var a=pr[0],b=pr[1],bd=JS.REL.bond(S,a,b);
var t='鳥居を一つくぐったとき、'+a.name+'の隣から、'+b.name+'の気配が消えた。振り返ると、'+b.name+'は鳥居の列の外側を、子どもに手を引かれて歩いていた。'+JS.placeLine(a,'KAMI_CALL',b);
if(rng()<0.35+bd*0.45){
ST.key(S,ST.say(S,{actors:[a,b],tag:'神隠し',kind:'climax',text:t+b.name+'の足が止まった。子どもの手を振りほどき、'+b.name+'は'+a.name+'の声の方へ、よろめきながら戻ってきた。',why:a.name+'の呼ぶ声が、'+b.name+'を連れ戻した（絆）',mag:38}),a.name+'が'+b.name+'を連れ戻した');
return{bonus:0.03};
}
b.alive=false;b.taken=false;b.fate='神隠しに遭った（'+JS.hm(S.h)+'）';
var o=ST.say(S,{actors:[a,b],tag:'神隠し',kind:'climax',text:t+b.name+'は、一度も振り返らなかった。鳥居の影に入ったところで、'+b.name+'の姿は、ふっと見えなくなった。',why:b.name+'は隠し神さまに連れていかれた',mag:44});
ST.key(S,o,b.name+'が神隠しに遭った');
JS.REL.onDeath(S,b);
return{bonus:0};
},
cthulhu:function(S,live){
var rng=S.rng,C=JS.core,pr=pairs(S,live,CLOSE)[0];
if(!pr)return null;
var a=pr[0],b=pr[1],bd=JS.REL.bond(S,a,b);
var t=b.name+'が、ふいに舟を降りて、海へ歩き出した。目は開いているのに、何も見ていなかった。夢で聞いたあの声が、'+b.name+'を呼んでいた。'+a.name+'は、'+b.name+'の腕を掴んだ。'+JS.placeLine(a,'CTHU_HOLD',b);
if(rng()<0.4+bd*0.4-b.m.fear/400){
ST.say(S,{actors:[a,b],tag:'呼び声',kind:'climax',text:t+b.name+'は、はっと目を見開いた。腰まで海に浸かっていた。'+b.name+'は、'+a.name+'の腕にしがみついて震えた。',why:a.name+'の声が、眠りの大神の呼び声に勝った（絆）',mag:36});
return{bonus:0.02};
}
C.die(S,b,'眠りの大神の呼び声に誘われて',[t+b.name+'は、'+a.name+'の手を、静かに外した。そして、まっすぐに沖へ歩いていった。頭まで波に沈むまで、一度も立ち止まらなかった。']);
return{bonus:0};
},
hastur:function(S,live){
var rng=S.rng,C=JS.core,pr=pairs(S,live,BAD)[0]||pairs(S,live,CLOSE)[0];
if(!pr)return null;
var a=pr[0],b=pr[1],bad=BAD(pr[2]);
var t='舞台の照明が、ひとりでに'+a.name+'と'+b.name+'を照らし出した。黄色い観客たちが、一斉にこちらを向いた。台本の第二幕――王が、裏切り者を刺す場面だった。'+a.name+'の手の中に、いつの間にか、黄色い柄の短剣が握られていた。';
if(rng()<(bad?0.45:0.15)+a.tr.aggr*0.2-a.tr.cp*0.15){
C.die(S,b,'黄衣の王の芝居の中で、'+a.name+'に刺されて',[t+'台本のとおりに、'+a.name+'は短剣を振り下ろした。客席から、乾いた拍手が湧いた。'+a.name+'は、自分が何をしたのか、幕が降りるまで分からなかった。']);
edge(S,a,b,'刺した','enemy');
return{bonus: -0.03};
}
ST.say(S,{actors:[a,b],tag:'黄衣の王',kind:'climax',text:t+a.name+'は、短剣を舞台の床に突き立てた。台本にない動きだった。客席から、不満げなざわめきが起きた。',why:a.name+'は芝居の筋書きに逆らった（CP）'+(bad?'。不仲の二人だった':''),mag:34});
return{bonus:0.03};
}
};
function relGeneric(S,live){
var rng=S.rng,C=JS.core,pr=pairs(S,live,function(c){return c==='love'||c==='family'||c==='close'||c==='bad'||c==='ex';})[0];
if(!pr)return null;
var a=pr[0],b=pr[1],c=pr[2],noun=S.place.noun;
if(c==='love'){
a.m.fear=clamp(a.m.fear-8,0,100);b.m.fear=clamp(b.m.fear-8,0,100);
ST.say(S,{actors:[a,b],tag:'誓い',text:noun+'の最深部を前にして、'+a.name+'は'+b.name+'の手を強く握った。'+JS.placeLine(a,'LOVE_VOW',b)+b.name+'は、黙って握り返した。',why:'恋人どうし。最後の場所の前で、誓いを交わした（恐怖が和らいだ）',mag:28});
return{bonus:0.03};
}
if(c==='family'||c==='close'){
a.m.fear=clamp(a.m.fear-6,0,100);
ST.say(S,{actors:[a,b],tag:'約束',text:a.name+'は、'+b.name+'の背中を軽く叩いた。'+JS.placeLine(a,'BOND_VOW',b),why:'大事な相手との約束（恐怖が和らいだ）',mag:22});
return{bonus:0.02};
}
var t=a.name+'が、ふいに足を止めて振り返った。'+JS.placeLine(a,'BAD_BLAME',b)+JS.placeLine(b,'BAD_RETORT',a);
edge(S,a,b,'責めた','enemy');
if(a.tr.aggr>0.55&&rng()<0.25){
if(rng()<0.35){
C.die(S,b,'口論の末に'+a.name+'に突き飛ばされて',[t+a.name+'は、'+b.name+'の胸を突き飛ばした。'+b.name+'はよろめき、'+noun+'の暗がりへ転げ落ちていった。誰も、手を伸ばす間がなかった。']);
return{bonus: -0.05};
}
ST.say(S,{actors:[a,b],tag:'口論',text:t+a.name+'は'+b.name+'の胸ぐらを掴んだ。仲間が割って入り、二人は、目も合わせずに歩き出した。',why:'不仲の二人。土壇場で口論になった（攻撃性）',mag:26});
return{bonus: -0.05};
}
ST.say(S,{actors:[a,b],tag:'口論',text:t+'重い沈黙が落ちた。'+noun+'の奥から、何かがそのやりとりを、楽しそうに聞いていた。',why:'不仲の二人。土壇場で口論になった',mag:22});
return{bonus: -0.03};
}
function rel(S,live){
if(live.length<2||S.rng()>0.7)return 0;
var g=GREL[S.G.id],r=g?g(S,live):null;
if(!r)r=relGeneric(S,live);
return r?r.bonus||0:0;
}
var FAC={
byakhee:{n:'ハスターの眷属',arrive:'夜空から、蝙蝠とも鳥ともつかない翼の群れが舞い降りてきた。ハスターの眷属――バイアクヘー。名を呼んではならぬ方は、海の神々と相容れない。',
clash:'バイアクヘーの群れと、海から這い上がった{g}の眷属が、一行の頭上でぶつかり合った。',
die:L('急降下してきたバイアクヘーの爪が、{a}を掴み上げた。{a}は、夜空の彼方へ消えた。|争いの余波で崩れた岩が、{a}を押し潰した。'),
win:'バイアクヘーの群れは、{g}の眷属を海の底へ追い返した。翼の主たちは、一行には目もくれず、星空へ帰っていった。',
take:'バイアクヘーの一羽が、{a}を背に乗せて飛び立った。{a}が最後に見たのは、ヒアデス星団の黄色い光だった。',tf:'バイアクヘーに乗せられ、星の彼方へ連れ去られた'},
deep:{n:'深きものども',arrive:'湖の水面が泡立ち、魚の顔をした人影が、次々と岸へ這い上がってきた。深きものども――眠りの大神に仕える者たちが、黄衣の王の祭りを潰しに来たのだ。',
clash:'深きものどもの群れが、黄色い襤褸をまとった信者たちに襲いかかった。',
die:L('深きものどもの銛が、流れ弾のように{a}を貫いた。|{a}は乱戦の中で、湿った腕に掴まれ、湖へ引きずり込まれた。'),
win:'深きものどもは、黄の印を水の底へ持ち去った。名を呼んではならぬ方の気配は、それきり、村から消えた。',
take:'深きものどもが、{a}を担ぎ上げた。「＠新しい花婿だ」――{a}は、湖の底の都へ連れていかれた。',tf:'深きものどもに水の底へ連れ去られた'},
nodens:{n:'ノーデンスと夜鬼',arrive:'雷鳴とともに、顔のない黒い翼――夜鬼の群れが舞い降りた。その後ろに、白髭の老人が、貝殻の戦車に乗って立っていた。大いなる深淵の主、ノーデンス。伝道師様の宿敵だった。',
clash:'夜鬼の群れが、伝道師様の信者たちを掴み上げ、空へ放り投げていった。伝道師様は、初めて笑顔を消した。',
die:L('夜鬼の一匹が、{a}を信者と間違えて掴み上げた。{a}は、遥かな高みから落とされた。|伝道師様が苛立ち紛れに指を鳴らした。それだけで、そばにいた{a}の首が、あり得ない方向へ曲がった。'),
win:'ノーデンスが杖を掲げると、伝道師様の姿は、黒い煙になって散った。「＠今宵はここまで」――老人はそれだけ言い残し、夜空へ去った。',
take:'夜鬼の一匹が、{a}をくすぐるように掴み上げ、夢の国の方角へ飛び去った。',tf:'夜鬼に夢の国へ連れ去られた'},
firevamp:{n:'クトゥグアの炎の精',arrive:'吹雪の空に、真っ赤な火の玉がいくつも現れた。炎の精――クトゥグアの眷属。風に乗りて歩むものの宿敵だった。',
clash:'炎の精が吹雪を焼き、雪が湯気になって立ちのぼった。空の赤い目が、怒りに燃えた。',
die:L('炎の精の一つが、{a}の体を通り抜けた。{a}は、内側から燃え上がった。|溶けた雪崩が、{a}を呑み込んだ。'),
win:'炎の精は吹雪を焼き尽くし、空の赤い目を追い払った。峠に、季節外れの春のような風が吹いた。',
take:'炎の精が{a}を包み込み、空の彼方、フォーマルハウトの方角へ消えた。',tf:'炎の精にフォーマルハウトへ連れ去られた'},
darkman:{n:'黒い男',arrive:'炎の明かりの届かない闇から、黒い肌の男が歩み出た。「＠お久しぶりですね、炎の御方」――無貌の神、ニャルラトホテプ。炎の神の宿敵だった。',
clash:'黒い男の影が、窯の炎を呑み込もうと伸び、炎はそれを焼き払おうと噴き上がった。',
die:L('影と炎がぶつかり合った余波で、{a}の体は半分だけ焼け、半分だけ影になった。|黒い男が、{a}の肩に手を置いた。「＠失礼、邪魔でしたので」――{a}は、その場に崩れ落ちた。'),
win:'炎は黒い男の影に呑まれ、窯は冷たい灰になった。黒い男は一行に優雅に一礼して、闇に消えた。「＠どういたしまして」',
take:'黒い男が、{a}の肩に手を置いた。「＠あなたは面白い。少し、お付き合いいただきましょう」{a}は、黒い男と並んで、闇へ歩いていった。',tf:'黒い男に連れていかれた'},
hounds:{n:'ティンダロスの猟犬',arrive:'列石の角という角から、青黒い煙が噴き出した。煙は、痩せた獣の形になった。ティンダロスの猟犬――曲がった時間に棲む、門の外の狩人たちだった。',
clash:'猟犬たちが、開きかけた門に食らいついた。時間が軋み、悲鳴を上げた。',
die:L('猟犬の一匹が、{a}の匂いを覚えた。列石の角から伸びた舌が、{a}を背中から貫いた。|{a}は、時間の裂け目に足を取られ、それきり見えなくなった。'),
win:'猟犬たちは門の向こうへなだれ込み、門は内側から閉じられた。列石の角から、最後の煙がすうっと消えた。',
take:'猟犬の一匹が、{a}を追い始めた。{a}は、角のない丸い部屋を探して、どこまでも逃げていった。',tf:'ティンダロスの猟犬に追われ続けている'},
serpent:{n:'蛇人間',arrive:'洞窟の横穴から、ローブをまとった蛇の頭の者たちが現れた。蛇人間――かつてこの神を崇め、そして見捨てた古い種族だった。',
clash:'蛇人間の術者たちが呪文を唱え、眠れるヒキガエルさまの眷属が、泥の中から応戦した。',
die:L('蛇人間の放った呪いの矢が、{a}に当たった。{a}の肌に、みるみる鱗が浮かび、{a}は動かなくなった。|眷属の泥が、乱戦の中で{a}を呑み込んだ。'),
win:'蛇人間の呪文で、洞窟の奥のいびきは、また深い眠りに沈んだ。蛇人間たちは、一行に一瞥もくれずに横穴へ帰っていった。',
take:'蛇人間たちが{a}を取り囲んだ。「＠よい器だ」――{a}は、地の底の都へ連れていかれた。',tf:'蛇人間に地の底へ連れ去られた'},
miskatonic:{n:'ミスカトニック大学の調査隊',arrive:'闇の向こうから、強烈なライトの光が差し込んだ。「＠ミスカトニック大学、特別調査隊だ！　民間人は伏せろ！」防護服の一団が、火炎放射器を構えていた。',
clash:'調査隊の火炎放射器が、闇を焼いた。{g}の眷属が、悲鳴とも笑い声ともつかない声を上げて応戦した。',
die:L('調査隊の流れ弾が、{a}の胸を撃ち抜いた。|炎に追われた眷属が、逃げ場を求めて{a}に覆いかぶさった。'),
win:'夜明けまでに、調査隊は{g}の眷属を焼き尽くした。隊長は一行に言った。「＠ここで見たことは忘れなさい。――それが、あなたたちのためだ」',
take:'調査隊は、{a}を「重要な証人」として保護した。{a}は、アーカムの大学病院に移送された。',tf:'ミスカトニック大学の調査隊に「保護」された'}
};
var FAC_OF={cthulhu:'byakhee',dagon:'byakhee',rlyeh_child:'byakhee',hastur:'deep',nyarla:'nodens',ithaqua:'firevamp',cthugha:'darkman',yog:'hounds',tsathoggua:'serpent',shub:'miskatonic',chaugnar:'miskatonic',glaaki:'miskatonic'};
function intrude(S,live,h){
var rng=S.rng,C=JS.core,F=FAC[FAC_OF[S.G.id]];
if(!F||rng()>0.12)return null;
function g(t){return ST.fmt(t,{g:S.G.call});}
var o=ST.say(S,{tag:'乱入',kind:'climax',text:g(F.arrive)+g(F.clash),why:F.n+'が乱入した。'+S.G.name+'の敵対勢力',mag:46});
ST.key(S,o,F.n+'の乱入');
S.intruder=F.n;
var r=rng(),lead=live.filter(function(p){return JS.alive(p)&& !p.bound;}).sort(function(a,b){return b.tr.cp+b.tr.lead-a.tr.cp-a.tr.lead;})[0];
function cross(rate,max){
var n=0;
live.forEach(function(p){if(n<max&&JS.alive(p)&& !p.out&&rng()<rate-p.stats.luck*0.015){n++;C.die(S,p,F.n+'との争いに巻き込まれて',F.die);}});
}
function leave(why,fate){
var t0=h+1+rng()*1.5,outs=S.P.filter(function(p){return p.alive&& !p.out&& !p.taken;});
outs.forEach(function(p){p.out=true;p.esc=t0;p.fate=(p.bound?'縛られたまま連れ出された':fate)+'（'+JS.hm(t0)+'）';});
return outs;
}
if(r<0.35&&lead){
ST.say(S,{actors:[lead],tag:'乱入',kind:'climax',text:lead.name+'が、仲間の腕を引いた。'+JS.placeLine(lead,'FLEE_NOW')+'一行は、神と神の争いに背を向けて走り出した。',why:'敵対勢力が'+S.G.call+'と揉めている隙に逃げる',mag:34});
cross(0.12,1);
var outs=leave('','乱入に紛れて脱出');
if(outs.length){
S.result='intrude';
S.titleOverride=F.n+'と'+S.G.call+'が争う隙に、'+outs.length+'人が'+S.V+'を脱出（'+JS.hm(outs[0].esc)+'）';
ST.say(S,{actors:outs,tag:'脱出',kind:'climax',text:'背後で、人ではないものどうしの咆哮が、いつまでも続いていた。一行は、一度も振り返らずに山道を駆け下りた。――'+S.G.call+'がその夜どうなったのか、知る者はいない。',why:'生還 '+outs.length+'人',mag:40});
}
return{done:true};
}
if(r<0.6){
cross(0.35,2);
ST.say(S,{kind:'phase',text:'争いが過ぎ去ったあと、'+S.G.call+'の気配は、目に見えて弱っていた。――今なら、封じられるかもしれない。'});
return{bonus:0.15};
}
cross(0.12,1);
ST.say(S,{tag:'乱入',kind:'climax',text:g(F.win),why:F.n+'が'+S.G.name+'を退けた',mag:44});
var free=S.P.filter(function(p){return JS.alive(p)&& !p.out&& !p.bound;});
if(free.length&&rng()<0.45){
var v=free[rng()*free.length|0];
v.alive=false;v.taken=false;v.fate=F.tf+'（'+JS.hm(h+1)+'）';
ST.key(S,ST.say(S,{actors:[v],tag:'連れ去り',kind:'climax',text:ST.fmt(F.take,{a:v.name}),why:v.name+'は'+F.n+'に連れていかれた',mag:42}),v.name+'が'+F.n+'に連れていかれた');
JS.REL.onDeath(S,v);
}
var outs2=leave('',F.n+'に救われて脱出');
if(outs2.length){
S.result='faction';
S.titleOverride=F.n+'が'+S.G.name+'を退け、'+outs2.length+'人が'+S.V+'を脱出（'+JS.hm(outs2[0].esc)+'）';
ST.say(S,{actors:outs2,tag:'脱出',kind:'climax',text:'主を失った村は、急に古ぼけて見えた。一行は、夜明けの山道を下った。誰も、口をきかなかった。',why:'生還 '+outs2.length+'人',mag:38});
}
return{done:true};
}
function begin(S){
var PL=S.place=pick(S);
if(PL.id!=='cave'){
var f0=S.textFilter,re= /洞窟/g;
S.placeFilter0=f0;S.placeWhy0=S.whyFilter;
S.textFilter=function(t){t=t.replace(re,PL.noun);return f0?f0(t):t;};
S.whyFilter=function(t){return t.replace(re,PL.noun);};
}
return PL;
}
function end(S){
if(S.place&&S.place.id!=='cave'){S.textFilter=S.placeFilter0;S.whyFilter=S.placeWhy0;}
}
JS.PLACE={GEN:GEN,UNIQ:UNIQ,FAC:FAC,FAC_OF:FAC_OF,pick:pick,begin:begin,end:end,hazard:hazard,travel:travel,rel:rel,intrude:intrude,GREL:GREL};
})();
});
;
/* ==== js/solo-jashin-r18-god.js ==== */
HK.Load.def(508,'js/solo-jashin-r18-god.js',function(){
(function(){
'use strict';
var HK=window.HK,JS=HK.JASHIN,ST=HK.Story;
if(!JS|| !JS.R18|| !ST)return;
function L(s){return s.split('|');}
function fp(S,a){return HK.Ero&&HK.Ero.fresh?HK.Ero.fresh(S,a,function(l){return ST.pick(S,l);}):ST.pick(S,a);}
function M(){return HK.R18M;}
function fmt(t,o){return ST.fmt(t,o);}
function ok(p,h,cd){return p.lastNight==null||h-p.lastNight>=cd;}
function mark(p,h){p.lastNight=h;p.cnt.r18=(p.cnt.r18||0)+1;}
function mates(S,p,live,h,cd){if(JS.R18.lvPC&&JS.R18.lvPC(S)<=0)return[];return live.filter(function(q){return q!==p&&(!HK.State||HK.State.mobSexOk(q))&&JS.alive(q)&& !q.bound&&ok(q,h,cd)&&(HK.canLove?HK.canLove(p,q)&&HK.canLove(q,p):true)&&JS.R18.okPair(p,q)&&(!HK.Avoid||HK.Avoid.topOk(S,p,q));});}
function top(p){return(HK.Pos&&HK.Pos.hardTopNpc?HK.Pos.hardTopNpc(p):JS.R18.hardTop(p));}
function eroOn(S){return!!(HK.Ero&&HK.Ero.sfx&&HK.Lewd&&HK.Lewd.storyEro&&HK.Lewd.storyEro(S));}
function shortOn(S){return!!(HK.Lewd&&HK.Lewd.storyShort&&HK.Lewd.storyShort(S));}
function hiOn(S){return!!(HK.Lewd&&HK.Lewd.high&&HK.Lewd.high(S.env));}
function sepOf(S){return HK.R18Thick&&HK.R18Thick.on(S)?'\n\n':'';}
function bodyOf(p){return HK.Pos&&HK.Pos.hasF?(HK.Pos.hasF(p)?'f':'m'):(p.gender==='f'?'f':'m');}
function eroFor(S,a,b){return eroOn(S)&& !(HK.NoGen&&HK.NoGen.on(a,b||null));}
function persona(p){return(HK.personaOf?HK.personaOf(p):p.persona)||'gentle';}
var VK=['start','mid','climax'];
function vMoan(S,p,n,late){
var st= !!(M()&&M().isStrong(p));
if(HK.Moan&&HK.Moan.say)return HK.Moan.say(S,p,VK[n],{force:true,hush:st,late: !!late});
return HK.Ero.moan(S,p,n,{force:true});
}
var MOBW={m:{mob:true,mobRole:'guest',mobTop:true,gender:'m',name:'村の男'},f:{mob:true,mobRole:'guest',mobTop:true,gender:'f',name:'村の女'}};
function topMoan(S,b){var k=HK.Pos&&HK.Pos.hasM&&HK.Pos.hasM(b)?'top':'topmid';return HK.Moan&&HK.Moan.say?HK.Moan.say(S,b,k,{}):HK.Ero.moan(S,b,1);}
function eFill(S,t,o){
var nm={a:o.a.name,v:o.v||o.a.name,w:o.w||'',g:o.g||'',k:o.k?o.k.name:'',b:o.b?o.b.name:'',l:o.l||''};
return fmt(t,nm).replace(/\{s:(\w+)\}/g,function(m,x){return HK.Ero.sfx(S,x);})
.replace(/\{v([012])\}/g,function(m,n){return vMoan(S,o.a,+n,o.late);})
.replace(/\{k([012])\}/g,function(m,n){return o.k?vMoan(S,o.k,+n,o.late):'……っ';})
.replace(/\{mb([012])\}/g,function(m,n){return HK.Ero.moan(S,MOBW[o.mob||'m'],+n);})
.replace(/\{bm\}/g,function(){return o.b?topMoan(S,o.b):'……っ';});
}
function ef(S,list,o){return eFill(S,fp(S,list),o);}
var GE_ACT={
ten:{
f:L('触手が{a}の両脚に巻きつき、左右へぐいと割り開いた。ぬめる先端が{女性器}の割れ目をなぞり、{陰核}をくりくりと捏ね回す。{a}「{v0}」――次の瞬間、太い触手が{ナカ}へずぶずぶと押し入ってきた。{s:wet}。|'+
'細い触手が{a}の{乳首}に巻きついて、きゅうっと絞り上げた。{a}「{v0}」――そのあいだに、粘液を滴らせた触手が{女性器}に先端をあてがい、捻じりながら奥まで潜り込んだ。{s:wet}。腹の内側で触手がうねるたびに、{a}の腰はがくがくと震えた。|'+
'何本もの触手が{a}の体を宙に吊り上げ、脚を大きく開かせた。一本の触手が{ナカ}を、もう一本の触手が{後ろ}を、同時にこじ開けていく。{s:wet}。{a}「{v0}」――前と後ろを交互に突き上げられ、{a}の爪先がぴんと反り返った。'),
m:L('触手が{a}の{男性器}に何重にも巻きつき、根元から先端へ、搾るように締め上げた。{a}「{v0}」――嫌悪とは裏腹に、{男性器}は触手の中でみるみる硬く張りつめていった。{s:wet}。|'+
'ぬめる触手が{a}の{尻}を割り開き、{後ろ}に先端を押しつけた。{s:wet}。{a}「{v0}」――粘液に濡れた触手は、抵抗を嘲笑うように{ナカ}の奥までずるずると入り込み、弱いところを探り当てて捏ね回した。|'+
'細い触手が{a}の{亀頭}をくすぐるように撫で回し、太い触手が{後ろ}を内側から押し広げていく。{s:wet}。{a}「{v0}」――前と後ろを同時に責められ、{a}の{男性器}の先からは、透明な雫がとろとろと溢れていた。')
},
hebi:{
f:L('蛇の胴が{a}の体をぎりぎりと締め上げ、冷たい鱗が{女性器}を何度も擦り上げた。{s:wet}。{a}「{v0}」――やがて、鎌首をもたげた蛇の頭が、濡れはじめた{ナカ}へぬるりと潜り込んだ。|'+
'二股の舌が{a}の{陰核}をちろちろと弾き、そのたびに{a}の腰がびくんと跳ねた。{a}「{v0}」――蛇の胴の付け根から、鱗に覆われた硬いものが{女性器}へ押し当てられ、ゆっくりと沈んでいった。{s:wet}。|'+
'蛇は{a}の脚を尾で大きく開かせ、尾の先を{ナカ}へ捩じ込んだ。{s:wet}。{a}「{v0}」――尾はとぐろを巻くように奥でうねり、鱗の一枚一枚が、内側の襞をざりざりと擦っていった。'),
m:L('蛇の胴が{a}の腰に巻きつき、冷たい鱗で{男性器}をぎゅうぎゅうと擦り上げた。{s:wet}。{a}「{v0}」――締めつけと鱗のざらつきに、{a}の{男性器}は嫌でも硬く反り返っていった。|'+
'二股の舌が{a}の{亀頭}をちろちろと舐め回し、そのたびに{a}の腰が跳ねた。{a}「{v0}」――そのあいだに、蛇の尾の先が{後ろ}をこじ開け、ぬるりと{ナカ}へ潜り込んできた。{s:wet}。|'+
'蛇は{a}の体を締め上げたまま、鎌首を{a}の{尻}のあいだへ潜り込ませた。{s:wet}。{a}「{v0}」――頭ごと{ナカ}を押し広げられ、腹の内側で蛇が身をくねらせるたびに、{a}の{男性器}がびくびくと震えた。')
},
hito:{
f:L('冷たい手が{a}の着物を剥ぎ取り、剥き出しになった{胸}を鷲掴みにした。{乳首}を指先でぎゅっと捻られ、{a}「{v0}」――閉じようとした膝は、人ではない力で易々と割り開かれた。{s:wet}。人の形をしたそれは、{女性器}に指を二本揃えて沈め、奥を確かめるように掻き回した。|'+
'人の形をしたそれは{a}を仰向けに押さえつけ、脚のあいだに体を割り込ませた。冷たく硬いものが{女性器}にあてがわれ、一息に奥まで押し込まれる。{s:hit}。{a}「{v0}」――体温のない腰が、規則正しく{a}を突き上げはじめた。|'+
'{g}の長い指が{a}の{陰核}を摘まみ、くにくにと転がした。{a}「{v0}」――逃げようとした腰を片手で引き戻され、{ナカ}に指が沈む。{s:wet}。指はいつのまにか三本になり、ぐちゅぐちゅと音を立てて{a}を掻き回していた。'),
m:L('冷たい手が{a}の着物の前をはだけさせ、{男性器}を握り込んだ。{a}「{v0}」――ゆっくりと上下に扱かれるたびに、意思に逆らって熱が集まっていく。{s:wet}。人の形をしたそれは、{a}の{亀頭}を親指でぐりぐりと責め立てた。|'+
'人の形をしたそれは{a}をうつ伏せに押さえつけ、{尻}を割り開いた。冷たく硬いものが{後ろ}にあてがわれ、ぎちぎちと押し入ってくる。{s:hit}。{a}「{v0}」――体温のない腰が、{a}の{ナカ}の奥を規則正しく抉りはじめた。|'+
'{g}の長い指が{a}の{後ろ}に沈み、内側のしこりを探り当ててぐっと押し上げた。{s:wet}。{a}「{v0}」――もう片方の手は{a}の{男性器}を握り、押し上げる指と同じ速さで扱いていた。')
},
kemono:{
f:L('獣じみた眷属が{a}を四つ這いに押し伏せ、背後からのしかかってきた。荒い息がうなじにかかり、獣の熱く脈打つ{男性器}が{女性器}にねじ込まれる。{s:hit}。{a}「{v0}」――獣は人の交わりを知らないように、ただ乱暴に腰を叩きつけた。|'+
'鱗とも毛ともつかない肌が{a}の体に擦りつけられ、獣のざらついた舌が{女性器}をべろりと舐め上げた。{s:suck}。{a}「{v0}」――舌はそのまま{ナカ}に捩じ込まれ、奥まで掻き回された。|'+
'獣じみた異形は{a}の脚を抱え上げ、人のものよりずっと太い{男性器}を{ナカ}へ押し込んだ。{s:hit}。{a}「{v0}」――腹の内側が押し上げられ、形が浮かぶほどだった。異形は{a}が泣いても、腰を止めなかった。'),
m:L('獣じみた眷属が{a}を四つ這いに押し伏せ、背後からのしかかってきた。獣の熱く脈打つ{男性器}が{後ろ}をこじ開け、根元まで押し込まれる。{s:hit}。{a}「{v0}」――乱暴に突かれるたびに、{a}の{男性器}は床に擦れて揺れた。|'+
'獣のざらついた舌が{a}の{男性器}を根元から舐め上げ、{亀頭}を何度も弾いた。{s:suck}。{a}「{v0}」――舌はそのまま{後ろ}へ下り、ひくつく入り口をこじ開けて{ナカ}を掻き回した。|'+
'獣じみた異形は{a}の脚を抱え上げ、人のものよりずっと太い{男性器}を{ナカ}へ押し込んだ。{s:hit}。{a}「{v0}」――奥の弱いところを容赦なく潰され、触れられてもいない{a}の{男性器}から、とろりと雫がこぼれた。')
},
shizen:{
f:L('{g}の気配は、冷たいとも熱いともつかない感触になって{a}の肌を這い回った。それは{乳首}をつまむように撫で、{陰核}を包んで小刻みに震わせた。{a}「{v0}」――閉じた脚の隙間から、それは{ナカ}へ流れ込んできた。{s:wet}。|'+
'目に見えない{g}の力が{a}の脚を大きく開かせ、{女性器}をぱっくりと押し広げた。{s:wet}。{a}「{v0}」――形のない何かが{ナカ}をみっちりと満たし、内側から脈を打ちはじめた。|'+
'{g}の気配が{a}の{女性器}に集まり、ひだの一枚一枚を確かめるように撫でていった。{s:wet}。{a}「{v0}」――撫でられるほどに{ナカ}は勝手にひくつき、{愛液}が太腿を伝い落ちた。'),
m:L('{g}の気配は、冷たいとも熱いともつかない感触になって{a}の{男性器}を包み込んだ。{a}「{v0}」――包まれたまま、根元から先端へ、何度も撫で上げられる。{s:wet}。{a}の{男性器}は、触れるもののない空気の中で硬く反り返った。|'+
'目に見えない{g}の力が{a}の脚を開かせ、{尻}を割り開いた。{s:wet}。{a}「{v0}」――形のない何かが{後ろ}から{ナカ}へ流れ込み、内側の弱いところをじわじわと押し上げはじめた。|'+
'{g}の気配が{a}の{亀頭}にまとわりつき、一番敏感な先端だけを執拗に撫で回した。{s:wet}。{a}「{v0}」――逃げ場のない快感に、{a}の腰はがくがくと浮き上がった。')
},
kei:{
f:L('見えない手が{a}の着物をひとりでにはだけさせ、{胸}を揉みしだいた。誰もいないのに、{乳首}が摘ままれて捻られる。{a}「{v0}」――見えない指が{女性器}を割り開き、{ナカ}へずぶりと沈んだ。{s:wet}。|'+
'何もない空間が{a}の脚を押し開き、見えない舌が{陰核}を舐め上げた。{s:suck}。{a}「{v0}」――目を凝らしても、そこには誰もいない。それなのに、{ナカ}を掻き回される感触だけが確かにあった。|'+
'見えない何かが{a}の上にのしかかり、{女性器}を押し広げて奥まで入り込んだ。{s:hit}。{a}「{v0}」――重みも体温もないのに、突き上げられるたびに{a}の体は布団の上で跳ねた。'),
m:L('見えない手が{a}の着物の前をはだけさせ、{男性器}を握り込んで扱きはじめた。{a}「{v0}」――誰もいない闇の中で、{a}の{男性器}だけが、見えない手の形に沿って脈打っていた。{s:wet}。|'+
'何もない空間が{a}の{尻}を割り開き、見えない指が{後ろ}へ沈んでいった。{s:wet}。{a}「{v0}」――目を凝らしても、そこには誰もいない。それなのに、{ナカ}のしこりを押し潰される感触だけが確かにあった。|'+
'見えない何かが{a}の上にのしかかり、{後ろ}を押し広げて奥まで入り込んだ。{s:hit}。{a}「{v0}」――重みも体温もないのに、突き上げられるたびに、{a}の{男性器}は布団の上で跳ねた。')
},
vm:{
f:L('村の男たちは{a}の手足を押さえつけ、寝間着を引き裂いた。剥き出しの{胸}を何本もの手が揉みしだき、{乳首}を摘まみ上げる。{a}「{v0}」――一人目の村の男が{女性器}に{男性器}をあてがい、ためらいもなく奥まで押し込んだ。{s:hit}。|'+
'村の男の一人が{a}の脚を肩に担ぎ上げ、真上から{男性器}を叩きつけた。{s:hit}。{a}「{v0}」――順番を待つ男たちは、硬くなった{男性器}を{a}の頬や{胸}に擦りつけ、にやにやと笑っていた。|'+
'村の男たちは{a}を四つ這いにさせ、前と後ろから同時に{a}を使った。{s:hit}。{a}「{v0}」――後ろの男に{女性器}を突かれるたびに、前の男の{男性器}が喉の奥まで押し込まれた。'),
m:L('村の男たちは{a}をうつ伏せに押さえつけ、{尻}を割り開いた。唾で濡らした指が{後ろ}に捩じ込まれ、乱暴に掻き回される。{a}「{v0}」――指が抜かれた次の瞬間、村の男の{男性器}が一息に押し入ってきた。{s:hit}。|'+
'村の男の一人が{a}の{男性器}を握って扱き、もう一人の男が背後から{後ろ}を突き上げた。{s:hit}。{a}「{v0}」――前と後ろを同時に責められて、{a}の{男性器}は嫌でも硬く張りつめていった。|'+
'村の男たちは{a}を四つ這いにさせ、代わる代わる{ナカ}を使った。{s:hit}。{a}「{v0}」――順番を待つ男の一人が、{a}の髪を掴んで顔を上げさせ、その乱れようを笑った。')
},
vf:{
f:L('村の女たちは{a}の手足を押さえ、くすくす笑いながら着物を剥いでいった。一人が{乳首}に吸いつき、もう一人が{女性器}を指で割り開く。{s:suck}。{a}「{v0}」――揃えた指が{ナカ}にずぶりと沈み、ぐちゅぐちゅと掻き回された。|'+
'村の娘が{a}の脚のあいだに顔を埋め、{陰核}をちゅうちゅうと吸い上げた。{s:suck}。{a}「{v0}」――ほかの娘たちは{a}の{胸}を揉みしだきながら、{a}の顔が蕩けていくのを楽しそうに覗き込んでいた。|'+
'村の女たちは代わる代わる{a}の{ナカ}に指を沈め、誰が一番{a}を鳴かせられるかを競い合った。{s:wet}。{a}「{v0}」――指が替わるたびに、責め方も、触れる場所も変わった。'),
m:L('村の女たちは{a}の手足を押さえ、くすくす笑いながら着物を剥いでいった。一人が{a}の{男性器}を握って扱き、もう一人が{乳首}に吸いつく。{s:wet}。{a}「{v0}」――嫌がる声とは裏腹に、{男性器}は女たちの手の中で硬く反り返った。|'+
'村の娘が{a}の腰に跨り、硬くさせられた{男性器}を自分の中へ呑み込んだ。{s:wet}。{a}「{v0}」――ほかの娘たちは{a}の腕を押さえつけ、交代の順番を待ちながら笑っていた。|'+
'村の女の一人が{a}の{男性器}を口に含み、じゅぷじゅぷと音を立てて吸い上げた。{s:suck}。{a}「{v0}」――もう一人の女は{a}の{後ろ}に指を沈め、内側から押し上げては、{a}が果てそうになるたびに根元をきつく握って止めた。')
},
p:{
f:L('{a}の右手が、{a}の意思を無視して{胸}を揉みしだき、{乳首}をきゅっと摘まんだ。{a}「{v0}」――左手は勝手に脚のあいだへ下りていき、{女性器}を割り開いて{ナカ}へ指を沈めた。{s:wet}。|'+
'体の内側に入り込んだ{g}は、{a}の指を使って{陰核}を小刻みに弾かせた。{s:wet}。{a}「{v0}」――止めようと力を込めるほど、指は速く、深くなっていった。|'+
'{a}は自分の手で脚を大きく開かされ、自分の指で{ナカ}を掻き回させられた。{s:wet}。{a}「{v0}」――指の動きは、{a}自身よりも、{a}の弱いところをよく知っていた。'),
m:L('{a}の右手が、{a}の意思を無視して{男性器}を握り込み、根元から扱き上げはじめた。{a}「{v0}」――左手は勝手に{乳首}を摘まみ、捻り上げた。{s:wet}。|'+
'体の内側に入り込んだ{g}は、{a}の指を{後ろ}へ導き、{ナカ}のしこりを押し上げさせた。{s:wet}。{a}「{v0}」――止めようと力を込めるほど、指は速く、深くなっていった。|'+
'{a}は自分の手で{男性器}を扱かされ、もう片方の手で{亀頭}を擦らされた。{s:wet}。{a}「{v0}」――手の動きは、{a}自身よりも、{a}の弱いところをよく知っていた。')
}
};
var GE_MID={
g:L('抗えば抗うほど、それは{a}の弱いところばかりを責め立てた。{s:wet}。{a}「{v1}」――嫌悪で強張っていたはずの体が、いつのまにか、責めに合わせて腰を揺らしていた。|'+
'人ではないものに触れられているのに、体の芯がじんと痺れていく。{s:wet}。{a}「{v1}」――{a}は自分の体の裏切りに、悔し涙を滲ませた。|'+
'{a}の{ナカ}は、拒む心とは別のもののように、入り込んでくるものをきゅうきゅうと締めつけていた。{s:wet}。{a}「{v1}」――汗に濡れた肌が、火照ったように赤く染まっていった。|'+
'奥の一番弱いところを、それは正確に探り当てた。{s:hit}。{a}「{v1}」――突かれるたびに視界が白く弾け、拒む言葉は形にならなかった。'),
v:L('「＠口では嫌がっても、体は正直じゃのう」――村人の一人が{a}の耳元で囁き、弱いところばかりを執拗に責めた。{s:wet}。{a}「{v1}」――{a}は悔しさに唇を噛んだ。噛んだ唇の隙間から、熱い息が漏れ続けた。|'+
'一人が果てても、すぐに次の手が伸びてきた。{s:hit}。{a}「{v1}」――押さえつけられた手首が擦れて赤くなっても、責めは少しも緩まなかった。|'+
'村人たちは{a}の反応を見ては笑い合い、{a}が一番嫌がるところを、わざと選んで責めた。{s:wet}。{a}「{v1}」――嫌なはずなのに、体の奥がじんと熱を帯びていった。|'+
'{a}の体が責めに慣れはじめたのを見て取ると、村人たちは手を替え、また最初から崩しにかかった。{s:wet}。{a}「{v1}」――{a}の拒む声は、もう半分も言葉になっていなかった。'),
p:L('自分の指が自分の弱いところを責めているのに、止めることができない。{s:wet}。{a}「{v1}」――{a}の体は、もう{a}の言うことを聞かなかった。|'+
'{g}は{a}の体の中から、{a}の快感を味わっていた。{s:wet}。{a}「{v1}」――体が昂るたびに、内側で誰かが満足げに笑う気配がした。|'+
'{a}は指を止めようと歯を食いしばった。その歯さえ、{g}にほどかれた。{s:wet}。{a}「{v1}」――汗に濡れた肌が、火照ったように赤く染まっていった。')
};
var GE_PEAK={
proud:L('{a}はこんなものに屈するものかと吐き捨て、{w}を睨み据えた。{s:hit}。その睨みが、奥を突かれるたびに揺らいでいく。{a}「{v1}」――最後の一突きで、{a}は屈辱に顔を歪めたまま、びくびくと腰を跳ね上げて達した。|'+
'{a}は声だけは上げまいと、自分の唇を噛み切った。血の味がしても、腰の震えは止まらない。{s:wet}。{a}「{v1}」――睨みつけた目の縁から悔し涙がこぼれた瞬間、{a}の体は大きく反り返って果てた。|'+
'{a}は罵る言葉を探し続けた。見つけた言葉は、喉の奥で甘く崩れていった。{s:wet}。{a}「{v1}」――{a}の背中が弓なりに反り、全身ががくがくと痙攣した。果てたあとも、{a}は{w}から目を逸らさなかった。'),
stern:L('{a}は息を数えて耐えようとした。{s:wet}。数は二十を越えたところで乱れ、そこから先は続かなかった。{a}「{v1}」――張りつめていた糸がぷつりと切れ、{a}は短く息を詰めてイかされた。|'+
'{a}は唇を真一文字に結び、乱れる呼吸を押し殺した。押し殺すほど、体の奥の熱ははっきりと形を持っていく。{s:wet}。{a}の下腹がびくっ、びくっと勝手に震え、喉から押し殺した声が一度だけ漏れた。|'+
'{a}はこれは現実ではないと繰り返した。{s:hit}。繰り返す声が上ずり、やがて途切れる。{a}「{v1}」――{a}の体は、言い聞かせる言葉を置き去りにして、びくびくと達した。'),
tsun:L('{a}は平気だと涙声で言い張った。{s:wet}。言い終わる前に、腰ががくんと跳ねた。{a}「{v1}」――イかされた{a}は、真っ赤な顔で{w}を睨み、しゃくり上げた。|'+
'{a}は触るなと泣きながら繰り返した。{s:wet}。繰り返すたびに、声は甘く崩れていく。{a}「{v1}」――とうとう{a}の体はびくびくと痙攣し、強がりはどこにも残らなかった。|'+
'{a}は意地でも声を出すまいと、顔を背けて歯を食いしばった。{s:wet}。くぐもった喘ぎは、もう隠しようもなかった。{a}「{v1}」――{a}の背中が大きく跳ね、それきり、くたりと力が抜けた。'),
gentle:L('{a}は涙を浮かべたまま、声を殺して耐え続けた。{s:wet}。揺さぶられるうちに、こらえきれない震えが背中を駆け上がる。{a}「{v1}」――イかされた瞬間、{a}は自分を責めるように顔を覆った。|'+
'{a}にはもう抗う力も残っておらず、ただ早く終わることだけを祈っていた。{s:wet}。祈りのあいだにも、体は何度も高みへ押し上げられる。最後の波に呑まれて、{a}の腰がびくびくと跳ねた。|'+
'{a}は誰にともなく謝り続けていた。{s:wet}。{a}「{v1}」――謝る声のまま、{a}の体はびくんと震えて果てた。'),
devoted:L('{a}は自分が耐えれば皆は無事だと、心の中で唱え続けた。{s:wet}。唱える声が遠のき、体の熱だけが近くなる。{a}「{v1}」――{a}の体は細く長く痙攣して、とうとうイった。|'+
'{a}は声を漏らすまいと、自分の手の甲を噛んだ。仲間を、この場に巻き込みたくなかった。{s:wet}。押し寄せる波にとうとう背が反り、{a}は声もなくびくびくと達した。|'+
'{a}は{w}の機嫌を損ねまいと、身を硬くして耐えていた。その従順さを、{w}はかえって深く責め立てた。{s:hit}。{a}「{v1}」――何度目かの波で、{a}はとうとう意識を手放しかけた。'),
cool:L('{a}は感覚を言葉に置き換えて、距離を取ろうとした。{s:wet}。置き換える言葉が、波が来るたびに一つずつ消えていく。{a}「{v1}」――言葉が尽きた瞬間、{a}の無表情はぐずぐずに崩れ、腰が勝手に跳ね上がった。|'+
'{a}は幻覚だと短く呟いた。幻覚にしては、奥を抉る感触が生々しすぎた。{s:hit}。{a}「{v1}」――びくん、と腰が跳ねた瞬間、{a}は短く息を詰めてイかされた。|'+
'{a}は表情一つ変えまいとしていた。紅潮した頬と乱れた息が、その平静を裏切っていた。{s:wet}。{a}「{v1}」――体が勝手にびくびくと痙攣したとき、{a}は初めて、悔しそうに目を閉じた。'),
free:L('{a}は最初こそ、冗談めかして笑ってみせた。{s:wet}。笑い声はすぐに途切れ、喉の奥で引きつった喘ぎに変わる。{a}「{v1}」――{a}は泣き笑いのような顔で、がくがくと腰を震わせてイった。|'+
'{a}は暴れ、蹴り、叫んだ。いつもの身軽さは、どこにもなかった。{s:hit}。体が勝手に達してびくびくと痙攣したとき、{a}は信じられないというように目を見開いた。|'+
'{a}は軽口で逃げ道を探そうとした。{w}は、その軽口ごと{a}を組み伏せた。{s:wet}。{a}「{v1}」――こらえていた声が溢れ、{a}の体は大きく波打って果てた。'),
shy:L('{a}は声も出せずに、ただ指先を握りしめていた。{s:wet}。揺さぶられるたびに、握る指に力がこもる。{a}「{v1}」――イかされた瞬間、{a}は小さく息を呑み、両手で顔を覆った。|'+
'{a}は目を固く閉じて、何も起きていないふりをしようとした。けれど、漏れる声だけはどうしても止められない。{s:wet}。{a}の体は小刻みに震え、やがて力なく崩れ落ちた。|'+
'{a}の拒む声は、蚊の鳴くように小さかった。{s:wet}。{a}「{v1}」――か細い声が一度だけ高く跳ね、{a}は耳まで真っ赤にして果てた。'),
polite:L('{a}は最後まで丁寧な言葉で許しを乞おうとした。{s:wet}。その言葉は途中から形を失い、ただの喘ぎになる。{a}「{v1}」――イかされた{a}は、乱れた髪を直すことも忘れて、虚ろに宙を見つめていた。|'+
'{a}は居住まいを正そうとしたが、異様な力に押さえつけられて、それも叶わなかった。慎ましく閉じていた唇が、こらえきれずにほどけていく。{s:wet}。{a}の体は、品のよさとは裏腹に、びくんびくんと大きく跳ねた。|'+
'{a}は震える声で、何度もご容赦をと繰り返した。{w}には、人の作法は通じなかった。{s:hit}。{a}「{v1}」――最後の一度で、{a}の声は細い悲鳴になって途切れた。')
};
var GE_FIN={
g:L('{w}の動きが速く、荒くなっていった。{s:hit}。最後に奥深くまで押し込まれ、神の熱いものがどくどくと注ぎ込まれる。{s:cum}。{a}は腹の内側に広がる異様な熱に、身を震わせた。|'+
'それは{a}の一番奥で動きを止め、脈打つように震えた。{s:cum}。溢れるほどの粘つくものを注ぎ込まれ、{a}の{ナカ}から、神の名残りがとろりと溢れ落ちた。|'+
'果てる寸前に、それは{a}の体から抜け出し、{a}の肌の上に粘つく熱をぶちまけた。{s:cum}。{a}の胸も腹も、人ならぬ神の名残りでべっとりと汚れた。|'+
'{a}が何度目かの絶頂に呑まれたとき、神の気配はようやく満ちたように、{a}の中から引いていった。{s:wet}。ぽっかりと開いたままの奥が、いつまでもひくひくと震えていた。'),
vm:{
f:L('村の男の腰の動きが荒く、速くなっていく。{s:hit}。村の男「{mb2}」――男は{a}の腰を引き寄せ、一番奥に{男性器}を押しつけたまま{精液}を吐き出した。{s:cum}。|'+
'村の男たちは代わる代わる{a}の{ナカ}に{精液}を注ぎ込んでいった。{s:cum}。最後の男が離れたとき、{a}の太腿は、溢れ出した白いもので濡れていた。|'+
'一人の男が{a}の顔の前で{男性器}を扱き、{a}の頬に{精液}をぶちまけた。{s:cum}。村の男「{mb2}」――それを合図のように、ほかの男たちも次々と{a}の体を汚していった。'),
m:L('村の男の突き上げが荒く、速くなっていく。{s:hit}。村の男「{mb2}」――男は{a}の{ナカ}の一番奥で動きを止め、熱い{精液}を注ぎ込んだ。{s:cum}。同時に扱かれていた{a}の{男性器}からも、白いものが無理やり搾り出された。|'+
'村の男たちは代わる代わる{a}の{ナカ}に{精液}を注ぎ込んでいった。{s:cum}。最後の男が{男性器}を引き抜くと、ひくつく{後ろ}から白いものがとろりと太腿を伝った。|'+
'一人の男が{a}の{男性器}を握り、先端を親指で責めながら、背後から突き続けた。{s:cum}。前と後ろを同時に追い詰められ、{a}は男たちの笑い声の中で果てさせられた。')
},
vf:{
f:L('村の女たちは{a}が達しかけるたびに指を止め、また動かすことを何度も繰り返した。{s:wet}。焦らされ続けた{a}の体は、最後に一斉に責め立てられて、ぷしゃりと潮を噴いた。|'+
'一人の娘が{a}の{陰核}にしゃぶりつき、別の娘が{ナカ}の奥を指で押し上げた。{s:suck}。{a}の腰が跳ね上がって痙攣しても、娘たちはしばらく手を止めなかった。|'+
'村の女たちは{愛液}でべとべとになった指を{a}の唇に押しつけ、楽しそうに笑い合った。{s:wet}。{a}は焦点の合わない目で、ぐったりと横たわっていた。'),
m:L('跨った娘は{a}の{男性器}をきつく締めつけ、腰を速めた。{s:wet}。{a}が歯を食いしばってこらえるのを、女たちは見下ろして笑う。とうとう{a}は、娘の中に{精液}を吐き出させられた。|'+
'村の女たちは{a}が果てそうになるたびに根元を握って止め、三度目にようやく手を離した。{s:cum}。堰を切ったように、{a}の{男性器}から{精液}が噴き上がった。|'+
'女の一人が{a}の{男性器}を口に含んだまま、{後ろ}に沈めた指で内側を押し上げた。{s:cum}。{a}は女の口の中で、びゅくびゅくと果てさせられた。')
},
p:L('自分の指で追い詰められた{a}は、とうとう自分の手で果てさせられた。{s:wet}。{g}は{a}の体の中で、満ち足りたように溜め息をついた。|'+
'指は{a}が達しても止まらなかった。{s:wet}。二度、三度と続けて果てさせられ、{a}の体は自分の手の下でがくがくと跳ねた。|'+
'最後の波が引いたとき、{a}の手は、ようやく{a}の意のままに動くようになった。{s:wet}。濡れた指を見つめて、{a}は声もなく震えた。')
};
var GE_AGAIN=L('一度果てても、{w}は{a}を離さなかった。ぐったりとした{a}の体を裏返し、最初から責め直す。{s:wet}。{a}「{v2}」――空が白むまで、{a}は何度もイかされ続けた。|'+
'休む間もなく、また新しい手が伸びてきた。{a}にはもう押し返す力も残っていない。{s:hit}。{a}「{v1}」――二度目は、一度目よりも長く、執拗だった。|'+
'二度、三度と責め立てられるうちに、{a}の体は抗い方を忘れかけていた。{s:wet}。{a}「{v2}」――{a}が解放されたのは、空が明るくなってからだった。|'+
'{a}が意識を手放しかけるたびに、{w}は奥を抉って引き戻した。{s:hit}。{a}「{v2}」――夜明けまで、{a}の喘ぎは途切れなかった。');
function eroRecv(S,a,o){
var m=M(),short=shortOn(S),sep=sepOf(S),body=bodyOf(a),per=persona(a),kb=o.kb,k=kb&&kb.k;
var fo={a:a,w:o.w,g:o.g,mob:o.mob,v:a.name,k:k,l:kb&&kb.l,b:o.b};
var t=o.intro+(o.fight&&m?m.resist(S,o.fight,a,{endure:false}):'');
if(!short&&o.act0)t+=o.act0;
if(kb&&kb.br==='watch')t+=eFill(S,fp(S,KB_BIND[kb.kind]||KB_BIND.v),fo);
var actT=o.actT||GE_ACT[o.form]||GE_ACT.hito;
t+=sep+ef(S,actT[body],fo);
if(kb&&kb.br==='both'){
t+=eFill(S,fp(S,KB_BOTH),fo)+ef(S,actT[bodyOf(k)],{a:k,w:o.w,g:o.g,mob:o.mob});
if(!short)t+=ef(S,KB_BOTH_E,fo);
}
if(!short){
t+=(typeof o.react==='function'?o.react():o.react||'')+ef(S,GE_MID[o.mid]||GE_MID.g,fo);
if(o.E&&o.E.length)t+=ef(S,o.E,fo);
}
if(kb&&kb.br==='watch')t+=kbWatchHeat(S,kb,fo,true);
fo.late=true;
t+=sep+ef(S,GE_PEAK[per]||GE_PEAK.gentle,fo)+a.name+'「'+vMoan(S,a,2,true)+'」';
if(kb&&kb.br==='both')t+=ef(S,KB_BOTH_FIN,fo)+k.name+'「'+vMoan(S,k,2,true)+'」';
var fin=o.fin||GE_FIN.g;
t+=ef(S,fin[body]||fin,fo);
return t;
}
function eroAgain(S,a,o){return hiOn(S)?sepOf(S)+ef(S,GE_AGAIN,{a:a,w:o.w,g:o.g,late:true}):'';}
function noAdd(S){S._r18F=(S.log||[]).length;}
function kRand(S,p,h,salt){
var lg=S.log||[],last=lg.length?String(lg[lg.length-1].text||'').length:0;
var s=(lg.length*131+(h|0)*977+(p.i|0)*7919+salt*104729+last*31+(S.P||[]).length)>>>0;
s=Math.imul(s^(s>>>16),0x45d9f3b)>>>0;s=Math.imul(s^(s>>>16),0x45d9f3b)>>>0;s=(s^(s>>>16))>>>0;
return s/4294967296;
}
function here(q){return JS.alive(q)&& !q.bound&& !q.possessed&&(!HK.State||(HK.State.canAct?HK.State.canAct(q):HK.State.here(q)));}
function bondOf(S,a,b){return JS.REL&&JS.REL.bond?JS.REL.bond(S,a,b):0;}
function fixTo(a,b){return!!(a&&b&&((Array.isArray(a.sexLocks)&&a.sexLocks.indexOf(b.i)>=0)||(HK.lockTo&&HK.lockTo(a,b))));}
function relOf(S,a,b){
if(fixTo(a,b))return'kotei';
var c=JS.REL&&JS.REL.cat?JS.REL.cat(S,a,b):'';
return{love:'koi',crush:'kata',ex:'kata',close:'tomo',family:'tomo',bad:'teki'}[c]||'mu';
}
var REL_LBL={koi:'恋人',kotei:'固定の相手',kata:'片想い',tomo:'仲間',teki:'反目',mu:'無関心'};
function loveBoth(a,b){return HK.canLove?HK.canLove(a,b)&&HK.canLove(b,a):true;}
function kbPlan(S,v,live,h,kind,cd){
if((S._shieldN||0)>=2|| !HK.State)return null;
var cs=live.filter(function(q){return q!==v&&here(q);});
if(!cs.length)return null;
cs.sort(function(x,y){return bondOf(S,y,v)-bondOf(S,x,v);});
var k=cs[0];
if(cs.length>1&&kRand(S,v,h,1)<0.25)k=cs[1];
var b=bondOf(S,k,v),ch=Math.max(0.08,Math.min(0.5,0.14+0.32*b));
if(kRand(S,v,h,2)>=ch)return null;
var room=JS.R18.room(S,[k])&&ok(k,h,cd);
var recv=room&&HK.State.mobSexOk(k)&&(!HK.Pos||HK.Pos.canReceive(k))&& !top(k);
var hardTo=function(x,y){return!!(HK.Pos&&HK.Pos.hardTop&&HK.Pos.hardTop(x,y));};
var pair=loveBoth(k,v)&& !(HK.ngExplicit&&HK.ngExplicit(k,v))&& !hardTo(v,k);
var watch=room&&HK.State.r18ok(k)&&pair;
var both=recv&&watch&& !hardTo(k,v)&& !(HK.sexBlocked&&HK.sexBlocked(k,v));
var ws=[['hit',3],['offer',2]];
if(both)ws.push(['both',3]);
if(watch)ws.push(['watch',3]);
var tot=ws.reduce(function(s,x){return s+x[1];},0),r=kRand(S,v,h,3)*tot,br='hit';
for(var i=0;i<ws.length;i++){r-=ws[i][1];if(r<0){br=ws[i][0];break;}}
var offer=false;
if(br==='offer'){offer=true;br=recv?'sub':watch&&kRand(S,v,h,4)<0.5?'watch':'no';}
var l='';
if(br==='watch'&&Array.isArray(k.sexLocks)&&k.sexLocks.length){var lps=(S.P||[]).filter(function(q){return q!==v&&q!==k&&k.sexLocks.indexOf(q.i)>=0;}),lp=lps.length>1?lps[Math.floor(kRand(S,v,h,5)*lps.length)]:lps[0];if(lp)l=lp.name;}
S._shieldN=(S._shieldN||0)+1;
return{k:k,v:v,br:br,offer:offer,kind:kind,rel:relOf(S,k,v),vrel:relOf(S,v,k),l:l};
}
function kbStart(S,kb,w){
var k=kb.k,v=kb.v,o={a:v,v:v.name,k:k,w:w},pk=function(l){return eFill(S,fp(S,l),o);};
var t=pk(KB_IN[kb.kind]||KB_IN.v)+pk(KB_WHY[kb.rel])+pk(KB_SAY[kb.rel]);
if(kb.offer)t+=pk(KB_OFFER)+pk(kb.br==='sub'?KB_SUB_YES:KB_SUB_NO);
else if(kb.br==='hit')t+=pk(KB_HIT);
if(kb.br==='hit'||kb.br==='no')t+=pk(KB_DOWN);else if(kb.br==='sub')t+=pk(KB_SUB_GO);
if(kb.br==='hit'||kb.br==='no'){k.m.hp=Math.max(0,k.m.hp-8);k.m.fear=Math.min(100,k.m.fear+6);}
var why=k.name+'が、'+v.name+'をかばって割って入った（関係：'+REL_LBL[kb.rel]+'）'+(kb.offer&&kb.br!=='sub'?'――身代わりを申し出たが、聞き入れられなかった':'')+(kb.br==='hit'||kb.br==='no'?'――殴り倒された（体力−8）':kb.br==='sub'?'――身代わりを申し出た':kb.br==='both'?'――二人とも捕まった':'――縛られて、見せつけられることになった');
ST.say(S,{actors:[k,v],tag:'割って入る',text:t,why:why,mag:30});
if(JS.DRAMA&&JS.DRAMA.edge)JS.DRAMA.edge(S,k,v,kb.br==='sub'?'身代わり':'かばった','guard',k);
}
function kbWatchHeat(S,kb,fo,ero){
var t=eFill(S,fp(S,ero?KB_HEAT_E:KB_HEAT),fo);
if(kb.l)t+=eFill(S,fp(S,KB_LOCK),fo);
else if(top(kb.k)&&kRand(S,kb.v,kb.k.i,5)<0.6)t+=eFill(S,fp(S,KB_TOPW),fo);
return t;
}
function kbNovel(S,kb,core,w){
var m=M(),fo={a:kb.v,v:kb.v.name,k:kb.k,w:w,l:kb.l};
if(kb.br==='watch')return eFill(S,fp(S,KB_BIND[kb.kind]||KB_BIND.v),fo)+core+kbWatchHeat(S,kb,fo,false);
if(kb.br==='both')return eFill(S,fp(S,KB_BOTH),fo)+core+eFill(S,fp(S,KB_BOTH_N),fo)+(m?m.moans(S,kb.k,['mid','climax']):'');
return core;
}
function kbAfter(S,kb){
var k=kb.k,v=kb.v,o={a:v,v:v.name,k:k};
var br=kb.br==='no'?'hit':kb.br;
var t=eFill(S,fp(S,KB_AFTER[br]),o)+eFill(S,fp(S,br==='watch'?KB_SHAME:KB_AFTER_K[kb.rel]),o)+eFill(S,fp(S,KB_AFTER_V[kb.vrel]),o);
var lbl={hit:'をかばって殴り倒された',sub:'の身代わりになった',both:'をかばい、一緒に捕まった',watch:'をかばおうとして、縛られて見せつけられた'}[br];
ST.say(S,{actors:[k,v],tag:'かばったあと',text:t,why:k.name+'は'+v.name+lbl+'（関係：'+REL_LBL[kb.rel]+'）。翌朝の二人',mag:22});
}
var KB_IN={
v:L('物音に気づいた{k}が、襖を蹴り開けて飛び込んできた。村人たちの手に押さえつけられた{v}を見た瞬間、{k}の顔色が変わった。{k}は迷わず、{v}と村人たちのあいだに体を割り込ませた。|'+
'廊下の騒がしさに、{k}は寝間着のまま部屋を出た。{v}の部屋の前に、提灯を提げた村人たちが群がっていた。{k}は村人たちを押しのけ、部屋の中へ踏み込んだ。|'+
'{v}の名を呼ぶ声がした。{k}だった。{k}は手にした燭台を振りかざし、{v}を取り囲む村人たちの輪に、真正面から飛び込んできた。'),
b:L('{v}の悲鳴を聞きつけて、{k}が駆けつけてきた。人ではないものが{v}を捕らえているのを見ても、{k}は足を止めなかった。{k}は、それと{v}のあいだに飛び込んだ。|'+
'{k}は闇の中で光る何かの目を見た。その下に、{v}がいた。{k}は落ちていた棒切れを拾い上げ、震える足で、それと{v}のあいだに立った。|'+
'後を追ってきた{k}が、{v}の腕を掴んで引き戻そうとした。人ではないものの気配が、ゆっくりと{k}のほうを向いた。{k}は、{v}の腕を離さなかった。'),
r:L('祝詞の声を断ち切るように、{k}の声が響いた。{k}は止めようとする村人の腕を振り払い、祭壇の上の{v}のもとへ駆け寄った。祭壇を囲む村人たちが、一斉に{k}を振り返った。|'+
'儀式の輪の外から、{k}が人垣を掻き分けて飛び込んできた。止めろと叫ぶ村人の声も聞かず、{k}は{v}を縛る縄に手をかけた。篝火の明かりが、{k}の青ざめた顔を照らしていた。|'+
'神に捧げられる{v}の姿を見て、{k}はもう黙っていられなかった。{k}は篝火の明かりの中へ進み出て、{v}の前に両腕を広げて立ちはだかった。村人たちのざわめきが、ぴたりと止んだ。')
};
var KB_WHY={
koi:L('{v}は{k}の恋人だった。恋人が神への供物にされるのを、黙って見ていられるはずがなかった。|{k}の頭にあったのは、恋人を誰にも渡さないという、それだけだった。|{v}を失うくらいなら、自分が壊れたほうがましだと、{k}は本気で思っていた。'),
kotei:L('{k}にとって、{v}は体を許すただ一人の相手だった。その{v}に、ほかの何かが手を伸ばすのが許せなかった。|{v}は、{k}が決めたただ一人の相手だった。{k}は自分でも驚くほど、強い怒りに駆られていた。|ほかの誰にも触れさせないと決めた相手だった。{k}の手は、怒りで震えていた。'),
kata:L('{k}はずっと、{v}に胸の内を明かせずにいた。明かせないまま{v}を失うのだけは、嫌だった。|胸の内を明かしたこともない相手のために、{k}は自分の身を投げ出そうとしていた。|{v}の横顔を目で追うだけの日々だった。それでも、{k}の足は真っ先に{v}のもとへ向かっていた。'),
tomo:L('{v}は{k}の大切な仲間だった。仲間を見捨てて逃げるような真似は、{k}にはできなかった。|ここまで一緒に生き延びてきた{v}を、{k}は放っておけなかった。|{k}と{v}は、この村で何度も互いの背中を預け合ってきた。今度も、それは変わらなかった。'),
teki:L('{k}と{v}は、互いに反目し合う仲だった。それでも{k}の体は、考えるより先に動いていた。|{v}のことは気に食わなかった。だが、気に食わない相手が化け物の餌になるのを眺めるほど、{k}は落ちぶれてはいなかった。|{k}は{v}を嫌っていた。嫌っている相手だからこそ、こんなところで終わらせたくなかった。'),
mu:L('{k}にとって、{v}はただの同行者にすぎなかった。それでも、目の前で起きていることを見過ごすのは寝覚めが悪かった。|{k}は{v}のことをよく知らなかった。知らない相手だからこそ、見捨てる理由もなかった。|{k}は、{v}の名前さえうろ覚えだった。それなのに、体が勝手に動いていた。')
};
var KB_SAY={
koi:L('{k}「{v}に触らないで！ 私の恋人なんだから！｜{v}に触るな！ 私の恋人だ！｜{v}に触らないでください！ 私の恋人なんです！」|'+
'{k}「{v}を連れていくなら、まず私を倒してからにして｜{v}を連れていくなら、まず私を倒してからにしろ｜{v}を連れていくのなら、まず私を倒してからにしてください」|'+
'{k}「あなたを、絶対に一人で行かせたりしない｜あなたを、絶対に一人で行かせはしない｜あなたを、絶対に一人で行かせたりしません」'),
kotei:L('{k}「あなたに触っていいのは私だけ。誰にも渡さない｜あなたに触れていいのは私だけだ。誰にも渡さない｜あなたに触れていいのは私だけです。誰にも渡しません」|'+
'{k}「{v}から離れて。この人は、私の相手なんだ｜{v}から離れろ。この人は、私の相手だ｜{v}から離れてください。この人は、私の相手なんです」|'+
'{k}「神だろうと何だろうと、あなたには指一本触れさせないから｜神だろうと何だろうと、あなたには指一本触れさせない｜神だろうと何だろうと、あなたには指一本触れさせません」'),
kata:L('{k}「あなたが傷つくのは、見ていられないんだ｜あなたが傷つくのは、見ていられない｜あなたが傷つくのは、見ていられないんです」|'+
'{k}「理由なんかどうでもいい。あなたを放っておけないだけ｜理由などどうでもいい。あなたを放っておけないだけだ｜理由なんてどうでもいいんです。あなたを放っておけないだけです」|'+
'{k}「まだ、あなたに言ってないことがあるんだ。だから、ここで終わらせない｜まだ、あなたに言っていないことがある。だから、ここで終わらせない｜まだ、あなたに言っていないことがあるんです。だから、ここで終わらせません」'),
tomo:L('{k}「仲間に手を出さないで！｜仲間に手を出すな！｜仲間に手を出さないでください！」|'+
'{k}「{v}、こっち！ 早く逃げて！｜{v}、こっちだ！ 早く逃げろ！｜{v}、こっちです！ 早く逃げてください！」|'+
'{k}「ここまで一緒に来たんだ。置いていけるわけないでしょ｜ここまで一緒に来たんだ。置いていけるわけがない｜ここまで一緒に来たんです。置いていけるわけがありません」'),
teki:L('{k}「勘違いしないで。あなたを助けたいわけじゃないから｜勘違いするな。あなたを助けたいわけではない｜勘違いしないでください。あなたを助けたいわけではありません」|'+
'{k}「あなたを泣かせていいのは、こんな化け物じゃない｜あなたを泣かせていいのは、こんな化け物ではない｜あなたを泣かせていいのは、こんな化け物ではありません」|'+
'{k}「これは貸しだから。あとで返してもらう｜これは貸しだ。あとで返してもらう｜これは貸しです。あとで返していただきます」'),
mu:L('{k}「別に、あなたのためじゃない。見ていて気分が悪いだけ｜別に、あなたのためではない。見ていて気分が悪いだけだ｜別に、あなたのためではありません。見ていて気分が悪いだけです」|'+
'{k}「……こんなの、放っておけないでしょ｜……こんなものを、放ってはおけない｜……こんなことを、放ってはおけません」|'+
'{k}「理由なんてない。体が勝手に動いただけ｜理由などない。体が勝手に動いただけだ｜理由なんてありません。体が勝手に動いただけです」')
};
var KB_HIT=L('{w}の一撃が、{k}の脇腹にめり込んだ。{k}は畳の上に転がり、それでも這って{v}のほうへ手を伸ばした。その手を、別の誰かが無造作に踏みつけた。|'+
'{k}は掴みかかったが、易々と振り払われ、柱に叩きつけられた。額から血が流れ、視界が揺れた。{k}は立ち上がろうとして、膝から崩れ落ちた。|'+
'{k}の体は、見えない力に壁際まで弾き飛ばされた。背中を打ちつけた衝撃で、息が止まった。遠のく意識の中で、{k}は{v}の名を呼び続けた。|'+
'{k}は{v}を背にかばったまま、何発もの殴打を受け止めた。口の中に血の味が広がった。最後の一撃で、{k}の膝ががくりと折れた。');
var KB_OFFER=L('{k}「待って！ 代わりに私を連れていって！｜待て！ 代わりに私を連れていけ！｜待ってください！ 代わりに私を連れていってください！」|'+
'{k}「{v}は放して。その代わり、私が行く｜{v}は放せ。その代わり、私が行く｜{v}は放してください。その代わり、私が参ります」|'+
'{k}「欲しいのは誰でもいいんでしょう。だったら、私にして｜欲しいのは誰でもいいのだろう。だったら、私にしろ｜欲しいのは誰でもいいのでしょう。でしたら、私にしてください」');
var KB_SUB_YES=L('相手は、{k}の申し出をしばらく値踏みするように眺めていた。やがて、{v}を押さえつけていた力がふっと緩んだ。代わりに、無数の手が{k}の手首を掴んだ。|'+
'{w}の気配が、ゆっくりと{k}のほうへ向きを変えた。{v}は突き飛ばされるように輪の外へ転がり出た。{k}は唇を噛み、自分から一歩前へ出た。|'+
'ほう、身代わりか――嘲るような声がした。{v}を掴んでいた手が離れ、{k}の襟首に回った。{k}は振り返らずに、{v}に逃げろとだけ言った。');
var KB_SUB_NO=L('{k}の申し出は、鼻で笑われた。欲しいのはお前ではないと言わんばかりに、{k}は乱暴に突き飛ばされた。{k}は土間に倒れ込み、起き上がることもできなかった。|'+
'{k}の申し出は、聞き入れられなかった。見えない力が{k}の体を壁際へ押しやり、そこに縫いとめた。{k}はもがいたが、指一本動かせなかった。|'+
'{k}が前に出ようとすると、誰かの手が{k}の腕をねじり上げた。お前の番ではない――そう告げるように、{k}は部屋の外へ放り出された。');
var KB_DOWN=L('床に倒れた{k}の呻き声が、遠くに聞こえていた。|{k}は柱の陰に転がされたまま、ぴくりとも動かなかった。|{k}が気を失っているあいだに、{w}の手は、また{v}へ伸びた。');
var KB_SUB_GO=L('{v}が逃げていく足音を背中で聞きながら、{k}は{w}の前に引き据えられた。|{v}の姿が見えなくなったのを確かめて、{k}は目を閉じた。|{k}は、{v}が無事に逃げられたかどうかだけを考えようとした。');
var KB_BOTH=L('{k}の抵抗も、長くは続かなかった。{k}もまた引き倒され、{v}の隣に並べて押さえつけられた。|'+
'{w}は、飛び込んできた{k}を追い払おうとはしなかった。獲物が一つ増えただけだと言わんばかりに、{k}の手首も掴まれた。|'+
'{k}は{v}をかばうように覆いかぶさった。その背中ごと、二人は{w}に捕らえられた。');
var KB_BOTH_N=L('{v}の隣で、{k}もまた着物を剥がれ、同じように体を開かれていった。二人の押し殺した声が、闇の中で重なった。|'+
'{k}は{v}の手を探り当て、強く握った。握り合った手だけを頼りに、二人は同じ夜を耐えた。|'+
'{w}は二人を代わる代わる弄んだ。{v}が責められているあいだ、{k}は{v}の名を呼び続け、{k}が責められているあいだ、{v}は{k}の名を呼び続けた。');
var KB_BOTH_E=L('{v}の隣で、{k}も同じように脚を開かされていた。{s:wet}。{k}「{k0}」――二人の喘ぎが、闇の中で淫らに重なり合った。|'+
'{k}は{v}の手を握りしめたまま、背後から責め立てられていた。{s:hit}。{k}「{k1}」――握り合った手に力がこもるたびに、二人の腰が同じように跳ねた。|'+
'{w}は二人を並べて責め比べるように、代わる代わる奥を抉った。{s:hit}。{v}「{v1}」{k}「{k1}」――どちらの声が先に崩れるかを、{w}は面白がっていた。');
var KB_BOTH_FIN=L('{v}が果てるのとほとんど同時に、{k}の体もびくびくと跳ねた。|{k}もまた、{v}の名を呼びながら、こらえきれずに達した。|二人の体は、示し合わせたように、続けて果てた。');
var KB_BIND={
v:L('{k}は荒縄で柱に縛りつけられ、顔を無理やり{v}のほうへ向けさせられた。目を閉じれば、瞼をこじ開けられた。|'+
'村人たちは{k}を羽交い締めにし、よう見ておけと耳元で囁いた。{k}は{v}から目を逸らそうとしたが、顎を掴まれて引き戻された。|'+
'{k}は両腕を背中でまとめて括られ、{v}の真正面に座らされた。村人の一人が、{k}の髪を掴んで顔を上げさせた。'),
b:L('人ではないものの腕が{k}の体に巻きつき、身動き一つ取れないようにした。{k}の目の前で、{v}への責めが始まった。|'+
'見えない力が{k}を床に縫いとめた。動かせるのは目だけだった。その目の前に、{v}がいた。|'+
'{k}の手足に、冷たく湿ったものが絡みついた。{k}は、{v}から一番よく見える場所に据えられた。'),
r:L('村人たちは{k}を祭壇の脇の柱に縛りつけた。神の前で見届けるのが、邪魔をした者への罰だった。|'+
'{k}は篝火のそばに引き据えられ、両腕を左右から押さえられた。祭壇の上の{v}から、目を逸らすことは許されなかった。|'+
'縄で括られた{k}の前で、祝詞がまた始まった。{k}の叫びは、祝詞の声にかき消された。')
};
var KB_HEAT=L('{k}は、自分の体が熱を帯びていくのに気づいて、愕然とした。助けに来たはずだった。それなのに、目が離せなかった。|'+
'{v}の上ずった声が耳に届くたびに、{k}の喉が鳴った。{k}は自分の浅ましさに、吐き気がした。|'+
'{k}の息が、いつのまにか荒くなっていた。それに気づいた誰かが、喉の奥で笑った。|'+
'縛られた手首が軋むほど、{k}は身をよじった。逃げたいのか、近づきたいのか、もう自分でも分からなかった。');
var KB_HEAT_E=L('{k}の{股間}は、痛いほど張りつめていた。助けに来たはずの自分の体が、{v}の乱れる姿に応えていた。{k}は情けなさに、奥歯を噛みしめた。|'+
'{v}の嬌声が響くたびに、{k}の下腹がずくりと疼いた。もし手が自由だったら、自分が何をしていたか分からない。{k}はその考えに、ぞっとした。|'+
'{k}は熱くなった体を隠すように、身を丸めようとした。それは許されず、{k}の顔はまた{v}のほうへ向けさせられた。{k}の荒い息を、誰かが嘲るように笑った。');
var KB_LOCK=L('{k}は{l}の顔を思い浮かべ、こんなことで体を熱くしている自分を恥じた。|{l}にだけ許したはずの熱が、こんな夜に、こんな形で疼いている。{k}は唇を噛んで、それを恥じた。|{k}は心の中で、{l}に何度も詫びた。詫びるほど、体の熱は引いていかなかった。');
var KB_TOPW=L('いつもなら奪う側にいるはずの{k}が、ただ見ていることしかできなかった。その無力さが、なぜか体の熱を煽った。|'+
'{k}は縄を引きちぎろうと、何度も腕に力を込めた。縄より先に、自分の理性のほうが軋んでいた。|'+
'自分ならもっと上手く{v}を泣かせられる――そう思ってしまった自分に、{k}は愕然とした。');
var KB_AFTER={
hit:L('夜が明けてから、{v}は{k}の傷の手当てをした。{k}の腫れ上がった顔を見て、{v}は何度も謝った。|'+
'翌朝、{k}は痣だらけの体で、{v}の部屋の前に座り込んでいた。二人とも、昨夜のことをどう口にすればいいのか分からなかった。|'+
'{k}は朝まで{v}のそばを離れなかった。守れなかった手を、{k}は何度も握りしめては開いた。'),
sub:L('明け方、{k}はふらつく足で宿に戻ってきた。待っていた{v}は、{k}の顔を見るなり泣き崩れた。|'+
'{v}は一晩じゅう、{k}の帰りを待っていた。戻ってきた{k}は、何も言わずに{v}の頭に手を置いた。|'+
'戻ってきた{k}に、{v}は掛ける言葉が見つからなかった。{k}は、無事でよかったとだけ言って笑ってみせた。'),
both:L('夜が明けても、二人はしばらく口をきけなかった。同じ夜を耐えた手だけが、まだ固く握られていた。|'+
'朝の光の中で、{k}と{v}は互いの傷を黙って確かめ合った。目が合うと、どちらからともなく視線を逸らした。|'+
'二人は井戸端で、何度も体を洗った。隣にいるのが相手でよかったのか悪かったのか、二人とも分からなかった。'),
watch:L('縄を解かれたあと、{k}は{v}の顔をまともに見られなかった。助けに入ったはずの自分があの夜どんな顔をしていたか、{v}に見られていた気がした。|'+
'翌朝、{k}は{v}に謝ろうとして、言葉に詰まった。謝りたいことが、守れなかったことだけではなかったからだ。|'+
'{v}は、{k}の手首に残った縄の痕にそっと触れた。{k}はびくりと手を引き、情けなさに顔を背けた。')
};
var KB_AFTER_K={
koi:L('{k}「ごめん。守るって言ったのに、守れなかった｜すまない。守ると言ったのに、守れなかった｜ごめんなさい。守ると言ったのに、守れませんでした」|'+
'{k}「もう二度と、あなたを一人にしない｜もう二度と、あなたを一人にはしない｜もう二度と、あなたを一人にはしません」|'+
'{k}「あなたが生きてて、よかった｜あなたが生きていて、よかった｜あなたが生きていて、よかったです」'),
kotei:L('{k}「あなたは私の相手だ。昨夜のことで、それは変わらないから｜あなたは私の相手だ。昨夜のことで、それは変わらない｜あなたは私の相手です。昨夜のことで、それは変わりません」|'+
'{k}「次は、絶対に誰にも触らせない｜次は、絶対に誰にも触れさせない｜次は、絶対に誰にも触れさせません」|'+
'{k}「……全部、忘れさせてあげる｜……全部、忘れさせてやる｜……全部、忘れさせてあげます」'),
kata:L('{k}「あなたが無事なら、それでいいんだ｜あなたが無事なら、それでいい｜あなたが無事なら、それでいいんです」|'+
'{k}「……昨夜のこと、気にしないで。私が勝手にやったことだから｜……昨夜のことは気にするな。私が勝手にやったことだ｜……昨夜のことは、気にしないでください。私が勝手にやったことですから」|'+
'{k}「今はまだ言えないけど、いつか、ちゃんと言うよ｜今はまだ言えないが、いつか、ちゃんと言う｜今はまだ言えませんが、いつか、ちゃんとお伝えします」'),
tomo:L('{k}「仲間なんだから、当たり前でしょ｜仲間なのだから、当たり前だ｜仲間なんですから、当たり前です」|'+
'{k}「一人で抱え込まないで。次は一緒に逃げよう｜一人で抱え込むな。次は一緒に逃げるぞ｜一人で抱え込まないでください。次は一緒に逃げましょう」|'+
'{k}「謝らないで。生きて帰る、それだけ考えよう｜謝るな。生きて帰る、それだけを考えろ｜謝らないでください。生きて帰る、それだけを考えましょう」'),
teki:L('{k}「礼なんか言わないで。らしくないよ｜礼など言うな。らしくない｜お礼なんて結構です。らしくありませんよ」|'+
'{k}「これで貸し一つ。忘れないでよね｜これで貸し一つだ。忘れるなよ｜これで貸し一つです。忘れないでくださいね」|'+
'{k}「勘違いしないで。あなたのためにやったんじゃないから｜勘違いするな。あなたのためにやったのではない｜勘違いしないでください。あなたのためにやったのではありません」'),
mu:L('{k}「別に。たまたま近くにいただけ｜別に。たまたま近くにいただけだ｜別に。たまたま近くにいただけです」|'+
'{k}「気にしないで。もう済んだことだし｜気にするな。もう済んだことだ｜気にしないでください。もう済んだことです」|'+
'{k}「……あなた、もっと周りに気をつけたほうがいいよ｜……あなたは、もっと周りに気をつけたほうがいい｜……あなたは、もっと周りに気をつけたほうがいいですよ」')
};
var KB_SHAME=L('{k}「……見ないで。今の私の顔、見ないで｜……見るな。今の私の顔を、見るな｜……見ないでください。今の私の顔を、見ないでください」|'+
'{k}「助けに行ったのに、私……最低だ｜助けに行ったのに、私は……最低だ｜助けに行ったのに、私は……最低です」|'+
'{k}「……あんなときに、私は何を考えてたんだろう｜……あんなときに、私は何を考えていたのか｜……あんなときに、私は何を考えていたんでしょう」');
var KB_AFTER_V={
koi:L('{v}「あなたが来てくれただけで、十分だった｜＝｜あなたが来てくださっただけで、十分でした」|'+
'{v}「あなたまで傷ついて、どうするの｜あなたまで傷ついて、どうする｜あなたまで傷ついて、どうするんですか」|'+
'{v}「そばにいて。今日だけは、離れないで｜そばにいろ。今日だけは、離れるな｜そばにいてください。今日だけは、離れないでください」'),
kotei:L('{v}「……あなたのほうこそ、平気？｜……あなたのほうこそ、平気か｜……あなたのほうこそ、大丈夫ですか」|'+
'{v}「あなたの手だけ、握ってていい？｜あなたの手だけ、握っていてもいいか｜あなたの手だけ、握っていてもいいですか」|'+
'{v}「来てくれて、ありがとう。……怖かった｜来てくれて、感謝する。……怖かった｜来てくださって、ありがとうございました。……怖かったです」'),
kata:L('{v}「どうして、私なんかのために｜なぜ、私などのために｜どうして、私なんかのためにそこまでしてくださるんですか」|'+
'{v}「あなたが来てくれて、本当は、すごく嬉しかった｜あなたが来てくれて、本当は、とても嬉しかった｜あなたが来てくださって、本当は、とても嬉しかったです」|'+
'{v}「ごめん。あなたにまで、つらい思いをさせた｜すまない。あなたにまで、つらい思いをさせた｜ごめんなさい。あなたにまで、つらい思いをさせてしまいました」'),
tomo:L('{v}「ありがとう。……でも、無茶しないで｜礼を言う。……だが、無茶をするな｜ありがとうございます。……でも、無茶はしないでください」|'+
'{v}「一人だったら、たぶん耐えられなかった｜一人だったら、おそらく耐えられなかった｜一人だったら、たぶん耐えられませんでした」|'+
'{v}「今度は、私があなたを守る番だね｜今度は、私があなたを守る番だな｜今度は、私があなたを守る番ですね」'),
teki:L('{v}「……なんで助けたの。あなたに借りなんか作りたくなかった｜……なぜ助けた。あなたに借りなど作りたくなかった｜……なぜ助けたんですか。あなたに借りなど作りたくありませんでした」|'+
'{v}「……礼は言わないから｜……礼は言わない｜……お礼は、申し上げません」|'+
'{v}「今回だけは、感謝してあげる｜今回だけは、感謝してやる｜今回だけは、感謝して差し上げます」'),
mu:L('{v}「……ありがとう。意外だった｜……礼を言う。意外だった｜……ありがとうございます。意外でした」|'+
'{v}「あなたって、そういう人だったんだ｜あなたは、そういう人間だったのか｜あなたは、そういう方だったんですね」|'+
'{v}「……巻き込んで、ごめん｜……巻き込んで、すまない｜……巻き込んでしまって、ごめんなさい」')
};
var SHUB_FEAST=L('収穫祭の夜、広場の篝火のまわりで、葡萄酒の樽が次々と空けられた。酔った村人たちは、そのまま草の上で、相手を選ばずに抱き合い始めた。「＠豊穣の母さまは、子を宿す営みを、何よりお喜びになる」――{a}の杯にも、紫の酒がなみなみと注がれ、誰かの手が{a}の帯にかかった。|葡萄棚の下に、村人たちが筵を敷き詰めていた。熟れた房の甘い匂いの中で、何組もの男女が絡み合っていた。{a}は、葡萄酒で火照った体を、何本もの手に引き寄せられた。|収穫祭の宴の締めくくりに、篝火が一斉に落とされた。闇の中で、誰が誰とも分からない手が{a}を探り当て、葡萄酒の香りのする唇が、{a}の口を塞いだ。');
var SHUB_WINE=L('酒蔵の奥で、村の{w}が{a}に、新酒を口移しで飲ませた。「＠今年の初物です。母さまの恵みは、体の奥まで染みますでしょう」――葡萄酒が喉を落ちていくたびに、{a}の体は熱くとろけていった。{w}は、{a}を樽の陰の藁の上に押し倒した。|利き酒だと誘われた蔵の二階で、{a}は村の{w}と二人きりになった。杯を重ねるうちに、{w}の指が{a}の膝を割り、甘く熟れた葡萄の粒を、{a}の肌に押しつけて潰した。滴る果汁を、{w}は舌で辿っていった。');
var SHUB_PAIR=L('葡萄酒に酔った{x}と{y}は、宴を抜け出し、葡萄畑の奥へもつれ込んだ。熟れた房が二人の上でつぶれ、果汁が肌を伝った。{x}はその甘い滴を舐め取りながら、{y}を葡萄の褥に押し倒した。|収穫祭の篝火の明かりが届かない納屋で、{x}は{y}の着物の裾を割った。藁の匂いと葡萄酒の匂いの中で、二人は豊穣の母に捧げるように、何度も繋がった。|葡萄踏みの大桶に、{x}と{y}は着物のまま転がり落ちた。真っ赤な果汁にまみれた{y}の肌に、{x}が吸いついた。二人は桶の中で、果汁を跳ね上げながら交わった。');
var SHUB_PAIR_FF=L('葡萄酒に酔った{x}と{y}は、宴を抜け出し、葡萄畑の奥へもつれ込んだ。熟れた房が二人の上でつぶれ、果汁が肌を伝った。{x}はその甘い滴を舐め取りながら、{y}の脚のあいだへ顔を埋めていった。|収穫祭の篝火の明かりが届かない納屋で、{x}は{y}の着物の裾を割った。藁の匂いと葡萄酒の匂いの中で、{x}の指は、{y}が何度震えても止まらなかった。|葡萄踏みの大桶に、{x}と{y}は着物のまま転がり落ちた。真っ赤な果汁にまみれた{y}の肌に、{x}が吸いついた。二人は桶の中で脚を絡め、果汁を跳ね上げながら肌を擦り合わせた。');
var SHUB_TOP=L('酒蔵の奥で、村の{w}が{a}に新酒を口移しで飲ませようとした。{a}は杯ごと{w}の手首を掴み、樽の陰の藁の上に押し倒した。「＠お、お客人……」――葡萄酒で濡れた{w}の肌に、{a}は夜明けまで痕を刻み続けた。|収穫祭の篝火が一斉に落とされた闇の中で、{a}の帯を探り当てた手があった。{a}はその手を捻り上げ、手の主の村の{w}を草の上に組み伏せた。豊穣の母に捧げる営みは、最後まで{a}の思うままに進んだ。|利き酒だと誘われた蔵の二階で、{a}は村の{w}と二人きりになった。膝に伸びてきた{w}の指を、{a}は掴んで止めた。「＠あ……」――{a}は熟れた葡萄の粒を{w}の肌で潰し、滴る果汁を舌で辿っていった。{w}の甘い声が、蔵の梁に響いた。');
var SHUB_TOP_NPC=L('{w}は、{a}の下で身をよじり、葡萄酒の香りのする吐息を漏らした。|{w}は、{a}の肩にしがみついたまま、何度も豊穣の母の名を呼んだ。');
var SHUB_GOAT_NO=L('葡萄畑の暗がりで、木だと思っていたものが身を起こした。黒い仔山羊の触手が{a}の手足に伸びてきたが、{a}は葡萄棚の支柱を引き抜いて叩き伏せ、蹄の音が遠ざかるまで一歩も退かなかった。|村の女たちが、{a}を森の石舞台へ連れていこうとした。「＠今年の母さまの器は、あなたよ」――{a}は女たちの手を振り払い、石舞台に描かれた紋を、葡萄酒の樽ごと蹴り崩した。');
var SHUB_GOAT=L('葡萄畑の暗がりで、木だと思っていたものが身を起こした。黒い仔山羊の、縄のような触手が{a}の手足を絡め取り、熟れた果実のような匂いのする粘液を、{a}の肌に塗りつけた。触手は着物の下に潜り込み、{a}を、母の新しい器として満たしていった。|黒い仔山羊の幹に開いた口のひとつが、{a}の首筋に吸いついた。もう一本の触手が{a}の脚を押し開き、ゆっくりと奥へ入り込んだ。蹄の音が、{a}のまわりを、祝うように踏み鳴らしていた。');
var SHUB_RITE=L('村の女たちが、{a}を森の石舞台へ連れていった。「＠今年の母さまの器は、あなたよ」石舞台の上に横たえられた{a}の下腹に、葡萄酒で紋が描かれた。森の闇の奥から、蹄の音が近づいてきた。|石舞台のまわりで、村人たちが豊穣の祝詞を唱えていた。{a}は葡萄の蔓で手足を舞台に括りつけられ、千の仔の母に捧げられた。闇の中から伸びてきたものは、温かく、湿っていて、果てしなく優しかった。');
var SHUB_PREG=L('翌朝、{a}の下腹は、実った果実のように、ふっくらと膨らんでいた。村の女たちが、それを撫でて微笑んだ。「母さまの仔が、宿りなさった」|{a}の下腹の奥で、何かが、葡萄の房が揺れるように、ことりと動いた。');
var W=['娘','若い衆','女将','杜氏'];
function shub(S,p,live,h){
var rng=S.rng,lv=JS.R18.lvMob(S),m=M();
if(!ok(p,h,6)||rng()>lv*(p.aphro?0.55:0.4))return false;
mark(p,h);
var r=rng(),t,why,mag=28,act=[p];
var ms=mates(S,p,live,h,6);
if(r<0.25&&ms.length){
var q=rng.pick(ms);mark(q,h);act=[p,q];
var o=HK.Pos?HK.Pos.order(p,q,[p,q]):[p,q],X=o[0],Y=o[1];
t=fmt(fp(S,JS.R18.ff(X,Y)?SHUB_PAIR_FF:SHUB_PAIR),{x:X.name,y:Y.name})+JS.R18.sex(S,X,Y,{mood:'drug',fore:false});
if((!HK.Content||HK.Content.ok(S,'preg'))&&rng()<0.5){Y.preg=true;t+=(HK.R18Thick&&HK.R18Thick.on(S)?'\n\n':'')+fmt(fp(S,SHUB_PREG),{a:Y.name});}
why='収穫祭の葡萄酒に酔い、参加者どうしで交わった'+(m&&m.lastPos(S)?'（'+m.lastPos(S)+'）':'')+(Y.preg?'（'+Y.name+'が疑似妊娠した）':'');
}else if(top(p)){
var w=rng.pick(HK.Pos&&HK.Pos.isF(p)?['若い衆','杜氏','娘']:W),wm={a:p.name,w:w};
if(r<0.72){t=fmt(fp(S,SHUB_TOP),wm)+(m?m.say(S,p,'top'):'')+fmt(fp(S,SHUB_TOP_NPC),{a:p.name,w:'村の'+w});why='収穫祭の夜。誘ってきた村人を、'+p.name+'のほうが組み伏せた（受け攻めの指定：攻め）';}
else{t=fmt(fp(S,SHUB_GOAT_NO),wm);why='豊穣の母の器にされかけたが、'+p.name+'ははねのけた';mag=22;}
}else if(r<0.5){
var others=ms.filter(function(q){return rng()<0.5&& !top(q);}).slice(0,2);
others.forEach(function(q){mark(q,h);});
act=[p].concat(others);
t=fmt(fp(S,SHUB_FEAST),{a:p.name})+(others.length?'篝火の向こうでは、'+others.map(function(q){return q.name;}).join('と')+'も、村人たちの輪に引き込まれていた。':'');
if(eroFor(S,p)){
var fv=bodyOf(p)==='m'&&rng()<0.5?'vf':'vm';
t=eroRecv(S,p,{form:fv,intro:t,w:fv==='vf'?'村の女たち':'村人たち',E:SHUB_FEAST_E,mid:'v',fin:GE_FIN[fv],react:function(){return JS.R18.pz?JS.R18.pz(S,p,'react'):gp(S,p);},mob:fv==='vf'?'f':'m'})+eroAgain(S,p,{w:'村人たち'});
noAdd(S);
}else t+=(m?m.npc(S,'villager')+(others.length?m.group(S,act):m.moans(S,p,['start','mid','climax'])):'');
why='収穫祭の夜の交わり（豊穣の母に捧げる営み）'+(p.aphro?'・媚薬と葡萄酒が回っていた':'');
}else if(r<0.72){
if(eroFor(S,p)){
var ww=rng.pick(W),wf=ww==='娘'||ww==='女将'?'f':'m',wo={a:p.name,w:ww};
t=eroRecv(S,p,{actT:WINE_ACT[wf],intro:fmt(fp(S,SHUB_WINE),wo),w:'村の'+ww,E:null,mid:'v',fin:WINE_FIN[wf],react:function(){return gp(S,p);},mob:wf})+eroAgain(S,p,{w:'村の'+ww});
noAdd(S);
}else t=fmt(fp(S,SHUB_WINE),{a:p.name,w:rng.pick(W)})+(m?m.moans(S,p,['start','mid','climax']):'');
why='初物の葡萄酒で酔わされ、村人に抱かれた';
}else if(r<0.88){
var kbG=kbPlan(S,p,live,h,'b',6);
if(kbG||eroFor(S,p))return shubRecv(S,p,h,'b',kbG);
var strong=m&&m.isStrong(p);
t=fmt(fp(S,SHUB_GOAT),{a:p.name})+(strong?m.resist(S,'god',p,{endure:false}):'')+(m?(strong?m.say(S,p,'endure'):m.moans(S,p,['start','mid','climax']))+m.npc(S,'god',p):'');
if((!HK.Content||HK.Content.ok(S,'preg'))&&rng()<0.5){p.preg=true;t+=fmt(fp(S,SHUB_PREG),{a:p.name});}
why='黒い仔山羊に襲われた'+(p.preg?'（疑似妊娠した）':'');mag=30;
}else{
var kbR=kbPlan(S,p,live,h,'r',6);
if(kbR||eroFor(S,p))return shubRecv(S,p,h,'r',kbR);
t=fmt(fp(S,SHUB_RITE),{a:p.name})+(m?m.moans(S,p,['start','mid','climax'])+m.npc(S,'god',p):'');
if(!HK.Content||HK.Content.ok(S,'preg')){p.preg=true;t+=fmt(fp(S,SHUB_PREG),{a:p.name});}
why='豊穣の母の器として、石舞台に捧げられた（疑似妊娠した：生贄にされると巫女になりやすい）';mag=32;
}
ST.say(S,{actors:act,tag:'収穫祭の夜',kind:'climax',text:t,why:why,mag:mag});
return true;
}
var SHUB_FEAST_E=L('葡萄酒を口移しで流し込まれながら、{a}の{ナカ}は誰とも知れない手に代わる代わる掻き回された。{s:wet}。こぼれた紫の酒が、{a}の胸を伝って滴った。|'+
'熟れた葡萄の房が{a}の{股間}に押しつけられ、果汁ごと何度も擦りつけられた。{s:wet}。滴る甘い汁を、村人の舌が音を立てて舐め取っていった。|'+
'篝火の明かりの中で、{a}は何人もの村人に抱え上げられ、豊穣の母に捧げるように奥まで突き上げられた。{s:hit}。歓声と葡萄酒の匂いが、{a}の声をかき消した。');
var SHUB_GOAT_E=L('黒い仔山羊の触手は、熟れた果実の匂いのする粘液を、{a}の{ナカ}の奥へ塗り込めていった。{s:wet}。蹄の音が祝うように鳴るたびに、触手は一段深く沈んだ。|'+
'仔山羊の幹に開いた口のいくつもが、{a}の{乳首}に、{股間}に吸いついた。{s:suck}。千の仔の母の器として、{a}の体は隅々まで味わわれた。|'+
'縄のような触手が{a}の脚を高く吊り上げ、葡萄の蔓のように絡みつきながら奥をかき混ぜた。{s:wet}。滴る粘液は、葡萄酒と同じ甘い匂いがした。');
var SHUB_RITE_E=L('闇の中から伸びてきたものは、果てしなく優しく、果てしなく太かった。{s:wet}。それは{a}の{ナカ}を少しずつ押し広げ、母の器にふさわしい形に変えていった。|'+
'石舞台に描かれた紋が熱を帯び、{a}の下腹の奥で、何かがとろりと溶けていった。{s:wet}。祝詞の声が高まるたびに、闇の中のものは{a}の奥を深く満たした。|'+
'葡萄の蔓で括られた{a}の手足が軋み、闇の中のものが、ゆっくりと、何度も、{a}の奥を突き上げた。{s:hit}。村人たちは祝詞を唱えながら、{a}が果てるたびに手を打ち鳴らした。');
var WINE_ACT={
m:{
f:L('{w}は{a}の帯を解き、葡萄酒で火照った{胸}にしゃぶりついた。{s:suck}。{a}「{v0}」――酔いで力の入らない脚を割り開かれ、村の男の{男性器}が{女性器}へずぶずぶと沈んでいった。|'+
'{w}は{a}を樽に押しつけ、背後から裾をまくり上げた。{s:hit}。{a}「{v0}」――酒蔵の暗がりに、男の腰が{a}の{尻}を打つ音が、樽の軋む音と一緒に響いた。|'+
'{w}は新酒を{a}の{女性器}に垂らし、滴る酒ごと舐め上げた。{s:suck}。{a}「{v0}」――とろけた{ナカ}に男の{男性器}が押し込まれると、{a}の喉から甘く崩れた声が漏れた。'),
m:L('{w}は{a}の帯を解き、酔いで力の入らない体をうつ伏せに転がした。{s:wet}。{a}「{v0}」――葡萄酒で濡らした指で{後ろ}をほぐされ、男の{男性器}がずぶずぶと押し入ってきた。|'+
'{w}は{a}の{男性器}を新酒で濡らし、口に含んでじゅるじゅると吸い上げた。{s:suck}。{a}「{v0}」――そのあいだにも、男の太い指が{a}の{ナカ}を掻き回していた。|'+
'{w}は{a}を樽に押しつけ、背後から{ナカ}を突き上げた。{s:hit}。{a}「{v0}」――突かれるたびに{a}の{男性器}が樽に擦れ、酒蔵の暗がりに湿った音が響いた。')
},
f:{
f:L('{w}は{a}の帯を解き、葡萄酒で火照った{胸}に吸いついた。{s:suck}。{a}「{v0}」――酔いで力の入らない脚のあいだに、女の細い指がするりと滑り込み、{ナカ}へ沈んでいった。|'+
'{w}は新酒を{a}の{女性器}に垂らし、滴る酒ごと{陰核}を舐め上げた。{s:suck}。{a}「{v0}」――女の舌は、{a}が身をよじっても、離れようとしなかった。|'+
'{w}は{a}を藁の上に押し倒して脚を絡め、自分の{女性器}を{a}の{女性器}に擦りつけた。{s:wet}。{a}「{v0}」――葡萄酒の匂いと、ぬるぬるとした水音が、蔵の二階に満ちていった。'),
m:L('{w}は{a}の帯を解き、酔いで力の入らない{男性器}を手で扱いて、無理やり硬くさせた。{s:wet}。{a}「{v0}」――女はそのまま{a}の腰に跨り、ゆっくりと自分の中へ呑み込んでいった。|'+
'{w}は{a}の{男性器}を新酒で濡らし、口に含んでじゅるじゅると吸い上げた。{s:suck}。{a}「{v0}」――女の唇は、{a}が身をよじっても、離れようとしなかった。|'+
'{w}は{a}を藁の上に押し倒して跨り、樽の陰で好きなように腰を揺らした。{s:wet}。{a}「{v0}」――葡萄酒で火照った体は、嫌でも女の動きに応えていった。')
}
};
var WINE_FIN={
m:L('{w}の腰の動きが荒く、速くなっていった。{s:hit}。{w}「{mb2}」――男は{a}の{ナカ}の一番奥で、熱い{精液}を吐き出した。{s:cum}。|'+
'{w}は最後に{a}の腰を強く引き寄せ、奥に押しつけたまま身を震わせた。{s:cum}。{a}の{ナカ}から、葡萄酒とは違う白いものがとろりと溢れた。|'+
'{w}は果てる寸前に体を離し、{a}の腹に{精液}をぶちまけた。{s:cum}。男は満足げに、零れた葡萄酒と一緒にそれを{a}の肌に塗り広げた。'),
f:L('{w}は{a}が達しかけるたびに動きを止め、また動かすことを何度も繰り返した。{s:wet}。焦らされ続けた{a}の体は、最後にびくびくと痙攣して果てた。|'+
'{w}は{a}の上で身を震わせて果て、そのまま{a}の唇に、葡萄酒の香りのする口づけを落とした。{s:wet}。{a}も、こらえきれずに達していた。|'+
'{w}は{a}を何度も果てさせ、そのたびに新しい杯を{a}の唇に押し当てた。{s:wet}。{a}はもう、自分が何度達したのかも数えられなかった。')
};
function shubRecv(S,p,h,kind,kb){
var m=M(),rng=S.rng,goat=kind==='b',w=goat?'黒い仔山羊':'千の仔の母';
if(kb)kbStart(S,kb,goat?'黒い仔山羊':'村人たち');
var a=kb&&kb.br==='sub'?kb.k:p,other=kb&&(kb.br==='both'||kb.br==='watch')?kb.k:null;
if(kb&&(a!==p||other))mark(kb.k,h);
var strong= !!(m&&m.isStrong(a)),am={a:a.name};
var ero=eroFor(S,a)&& !(other&&kb.br==='both'&&HK.NoGen&&HK.NoGen.on(other,null)),t;
var intro=fmt(fp(S,goat?SHUB_GOAT:SHUB_RITE),am);
if(ero){
t=eroRecv(S,a,{form:'ten',intro:intro,fight:strong?'god':null,w:w,g:w,E:goat?SHUB_GOAT_E:SHUB_RITE_E,mid:'g',fin:GE_FIN.g,react:function(){return gp(S,a);},kb:kb})+eroAgain(S,a,{w:w,g:w});
}else{
var core=goat?(strong?m.resist(S,'god',a,{endure:false}):'')+(m?(strong?m.say(S,a,'endure'):m.moans(S,a,['start','mid','climax']))+m.npc(S,'god',a):'')
:(m?m.moans(S,a,['start','mid','climax'])+m.npc(S,'god',a):'');
t=intro+(kb?kbNovel(S,kb,core,w):core);
}
if((!HK.Content||HK.Content.ok(S,'preg'))&&(!goat||rng()<0.5)){a.preg=true;t+=fmt(fp(S,SHUB_PREG),am);}
if(other)other.m.fear=Math.min(100,other.m.fear+12);
var add=kb?(kb.br==='sub'?'（'+p.name+'の身代わり）':kb.br==='both'?'（'+other.name+'も一緒に）':kb.br==='watch'?'（'+other.name+'は縛られて見せつけられた）':''):'';
if(ero||other)noAdd(S);
ST.say(S,{actors:other?[a,other]:[a],tag:'収穫祭の夜',kind:'climax',lewd:true,text:t,why:(goat?'黒い仔山羊に襲われた':'豊穣の母の器として、石舞台に捧げられた')+add+(a.preg?'（疑似妊娠した'+(goat?'':'：生贄にされると巫女になりやすい')+'）':''),mag:goat?30:32});
if(kb)kbAfter(S,kb);
return true;
}
var YIG_DREAM=L('夢の中で、{a}は蛇の巣穴の底に横たわっていた。何百匹もの蛇が、{a}の体の上を這い回り、手首に、足首に、首に巻きついて、{a}を地面に縫いとめた。一番太い一匹が、ゆっくりと{a}の脚のあいだへ頭を潜り込ませた。|夢の中で、{a}の布団の中に、冷たく重いものが滑り込んできた。大蛇だった。大蛇は{a}の体を締め上げ、二股の舌で{a}の肌をなぞり、ひくつく奥へ、鱗の擦れる音とともに入り込んできた。');
var YIG_WAKE=L('目覚めると、{a}の手首と足首に、鱗の跡が赤く残っていた。|目覚めると、布団の中に、脱ぎ捨てられた大きな蛇の抜け殻があった。|目覚めた{a}の太腿の内側に、小さな二つの牙の跡があった。');
var LAMIA=L('夜半、{a}の部屋の襖が開いた。入ってきたのは、{b}だった。――けれど、月明かりに浮かんだ{b}の下半身は、ぬめるような鱗に覆われた、長い大蛇の尾だった。{b}は、熱に浮かされたように囁いた。「ずっと、こうしたかった」{b}の尾が、{a}の体にゆっくりと巻きついていった。|{a}が目を覚ますと、{b}が枕元に座っていた。{b}の瞳は、蛇のように縦に裂けていた。腰から下は、畳の上をとぐろを巻く、太い大蛇の尾だった。{b}は二股に割れた舌で、{a}の唇を舐めた。「逃がさないよ」');
var LAMIA_ACT=L('鱗の尾が{a}の両脚を絡め取り、押し開いた。{b}は{a}を尾で締め上げたまま、上からのしかかった。|尾の先が{a}の手首を頭の上でひとまとめに縛り上げ、{b}は、蛇が獲物を呑むように、ゆっくりと{a}を味わっていった。');
var LAMIA_REV=L('鱗の尾が{a}の脚に絡みつこうとした。{a}はその尾を掴んで押さえつけ、逆に{b}を畳に組み伏せた。冷たい鱗の肌に指を這わせると、{b}は蛇のような細い声で鳴いた。|{a}は、唇を舐めてきた{b}の顎を掴み、深く口づけ返した。とぐろを巻く尾ごと{b}を抱きすくめ、{a}は人ではなくなった{b}の体を、隅々まで確かめていった。');
var YIG_DREAM_TOP=L('夢の中で、{a}は蛇の巣穴の底にいた。何百匹もの蛇が這い寄ってきたが、{a}は一番太い一匹の首を掴み、握り潰した。蛇たちは、恐れるように{a}から離れていった。|夢の中で、{a}の布団に冷たく重いものが滑り込んできた。大蛇だった。{a}はその頭を押さえつけ、逆に締め上げた。大蛇は身をよじり、やがて{a}の足元で、従うようにとぐろを巻いた。');
var YIG_WAKE_TOP=L('目覚めると、{a}の掌に、鱗の跡が赤く残っていた。|目覚めると、布団の脇に、脱ぎ捨てられた大きな蛇の抜け殻があった。');
var LAMIA_AFTER=L('朝、{b}は何も覚えていなかった。ただ、{a}の体じゅうに、鱗の擦れた赤い跡が残っていた。|夜明けとともに、{b}の尾は人の脚に戻っていた。{b}は自分の膝に残る鱗の欠片を見つめ、青ざめた。');
var YIG_E=L('何百匹もの蛇が{a}の肌を這い回り、一匹は{乳首}に、一匹は{股間}に、思い思いに巻きついて締めつけた。{s:wet}。鱗の擦れる音が、{a}の耳の中でざあざあと鳴り続けた。|'+
'一番太い蛇が{a}の{ナカ}でとぐろを巻き、奥で鎌首をもたげた。{s:wet}。腹の内側から突き上げられるたびに、{a}の脚は蛇の巣穴の底で跳ねた。|'+
'大蛇の二股の舌が{a}の奥をちろちろと探り、牙の先が太腿の内側を甘く掠めた。{s:suck}。冷たい鱗に締め上げられながら、{a}の体だけが燃えていた。');
var LAMIA_ERO={
mf:L('{b}は鱗の尾で{a}の脚を大きく開かせ、尾の付け根の熱く脈打つ{男性器}を{女性器}にあてがった。{b}「{bm}」――蛇が獲物を呑むように、それはゆっくりと根元まで沈んだ。{s:wet}。{a}「{v0}」|'+
'{b}は{a}を尾で締め上げたまま、上からのしかかった。{s:hit}。冷たい鱗の腰が叩きつけられるたびに、{a}の{ナカ}は{b}の{男性器}をきゅうきゅうと締めつけた。{a}「{v0}」|'+
'{b}は二股の舌で{a}の{陰核}をちろちろと舐め、ほぐれた{女性器}に{男性器}を一息に突き入れた。{s:hit}。{b}「{bm}」――縦に裂けた瞳が、{a}の乱れる顔を逃さず見下ろしていた。{a}「{v0}」'),
mm:L('{b}は鱗の尾で{a}の脚を開かせ、熱く脈打つ{男性器}を{後ろ}にあてがった。{b}「{bm}」――蛇が獲物を呑むように、それはゆっくりと{ナカ}の奥まで沈んでいった。{s:wet}。{a}「{v0}」|'+
'{b}は{a}を尾で締め上げ、尾の先で{a}の{男性器}を扱きながら、背後から{ナカ}を突き上げた。{s:hit}。{a}「{v0}」――前と後ろを同時に責められ、{a}の腰はがくがくと震えた。|'+
'{b}は二股の舌で{a}の{亀頭}をちろちろと舐め回し、ほぐれた{後ろ}に{男性器}を一息に突き入れた。{s:hit}。{b}「{bm}」――縦に裂けた瞳が、{a}の乱れる顔を逃さず見下ろしていた。{a}「{v0}」'),
ff:L('{b}は鱗の尾で{a}の脚を大きく開かせ、尾の先を{女性器}へぬるりと潜り込ませた。{s:wet}。{b}「{bm}」――尾は{ナカ}の奥でとぐろを巻くようにうねり、{a}の弱いところをざりざりと擦った。{a}「{v0}」|'+
'{b}は二股の舌で{a}の{陰核}をちろちろと弾き、細い指を{ナカ}に沈めて掻き回した。{s:wet}。{a}「{v0}」――尾は{a}の体を締め上げたまま、逃げる腰をいつまでも離さなかった。|'+
'{b}は{a}の{胸}に吸いつき、{乳首}に牙の先を甘く立てた。{s:suck}。そのあいだにも、尾の先は{a}の{女性器}を割り開いて、奥へ奥へと潜り込んでいった。{a}「{v0}」'),
fm:L('{b}は鱗の尾で{a}の体を締め上げ、硬くさせられた{男性器}の上に、ゆっくりと腰を沈めた。{s:wet}。{b}「{bm}」――冷たい鱗の肌と、熱く濡れた{ナカ}の落差に、{a}は息を詰めた。{a}「{v0}」|'+
'{b}は尾の先で{a}の{男性器}を根元から締め上げ、二股の舌で{亀頭}をちろちろと舐め回した。{s:suck}。{a}「{v0}」――尾が締まるたびに、{a}の腰は意思に逆らって跳ねた。|'+
'{b}は{a}の手首を尾の先で頭の上にまとめ、{a}の腰に跨って揺れはじめた。{s:wet}。{b}「{bm}」――蛇の腰がくねるたびに、{a}の{男性器}は{b}の中で搾り上げられた。{a}「{v0}」')
};
var LAMIA_E=L('{b}の縦に裂けた瞳が、{a}の乱れる顔を逃さず見下ろしていた。{s:wet}。人の言葉と蛇の息が混じった囁きが、{a}の耳を舐めた。|'+
'{b}の尾がとぐろを巻き、{a}の体を少しずつ締め上げた。{s:wet}。締めつけられるたびに、{a}の奥は勝手にきゅうっと縮こまった。|'+
'{b}の二股の舌が、{a}の首筋から胸へ、ゆっくりと這い下りていった。{s:suck}。冷たい鱗と熱い舌の落差に、{a}の肌が粟立った。');
var LAMIA_FIN={
m:L('{b}の腰の動きが荒く、速くなっていった。{s:hit}。{b}「{bm}」――{b}は{a}の一番奥で動きを止め、熱い{精液}をどくどくと注ぎ込んだ。{s:cum}。|'+
'{b}は{a}を尾で締め上げたまま、最後の数回を叩きつけた。{s:cum}。注ぎ込まれた{精液}は、蛇の毒のように熱かった。|'+
'{b}は果てる寸前に体を離し、{a}の腹から胸へ{精液}をぶちまけた。{s:cum}。{b}は二股の舌で、それを{a}の肌に塗り広げていった。'),
f:L('{b}は{a}が達しかけるたびに尾を緩め、また締め上げることを繰り返した。{s:wet}。{b}「{bm}」――{b}自身も身を震わせ、{a}と同時に果てた。|'+
'{b}は{a}の奥を尾の先で押し上げたまま、自分の腰を擦りつけて昂っていった。{s:wet}。{b}が鱗を逆立てて果てると、締めつけられた{a}もびくびくと痙攣した。|'+
'{b}は{a}の体を尾で締め上げ、{a}が果てるまで一度も緩めなかった。{s:wet}。{b}「{bm}」――縦に裂けた瞳が、満足げに細められた。')
};
function yig(S,p,live,h){
var rng=S.rng,lv=JS.R18.lvMob(S),m=M();
if(!ok(p,h,8)||rng()>lv*(p.aphro?0.4:0.25))return false;
var lover=live.filter(function(q){return q!==p&&JS.alive(q)&& !q.bound&&JS.REL.bond(S,p,q)>=0.35&& !(HK.Avoid&&(HK.Avoid.of(S,q,p)|| !HK.Avoid.topOk(S,p,q)))&&(HK.canLove?HK.canLove(q,p):true)&&JS.R18.okPair(p,q);}).sort(function(a,b){return JS.REL.bond(S,p,b)-JS.REL.bond(S,p,a);})[0];
mark(p,h);
var strong=m&&m.isStrong(p);
if(lover&&rng()<0.5){
var lo=HK.Pos?HK.Pos.order(lover,p,[lover,p]):[lover,p];
if(lo[0]===p){
var tr=fmt(fp(S,LAMIA),{a:p.name,b:lover.name})+fmt(fp(S,LAMIA_REV),{a:p.name,b:lover.name})+(m?m.say(S,p,'top')+m.moans(S,lover,['start','mid','climax']):'')+fmt(fp(S,LAMIA_AFTER),{a:p.name,b:lover.name});
ST.say(S,{actors:[p,lover],tag:'蛇の夜',kind:'climax',text:tr,why:'蛇の父の呪いで、'+p.name+'の想う相手（'+lover.name+'）がラミアの姿になって迫ってきた。'+p.name+'のほうが組み伏せた（受け攻めの指定）',mag:32});
return true;
}
var t;
if(eroFor(S,p,lover)){
var lk=(HK.Pos&&HK.Pos.hasM(lover)?'m':'f')+bodyOf(p),lb=lk.charAt(0);
t=eroRecv(S,p,{actT:{f:LAMIA_ERO[lb+'f'],m:LAMIA_ERO[lb+'m']},intro:fmt(fp(S,LAMIA),{a:p.name,b:lover.name}),fight:strong?{name:lover.name}:null,w:lover.name,b:lover,E:LAMIA_E,mid:'g',fin:LAMIA_FIN[lb],react:function(){return gp(S,p);}})+eroAgain(S,p,{w:lover.name})+fmt(fp(S,LAMIA_AFTER),{a:p.name,b:lover.name});
noAdd(S);
}else t=fmt(fp(S,LAMIA),{a:p.name,b:lover.name})+(strong?m.resist(S,{name:lover.name},p,{endure:false}):'')+fmt(fp(S,LAMIA_ACT),{a:p.name,b:lover.name})+(m?m.say(S,lover,'top')+(strong?m.say(S,p,'endure'):m.moans(S,p,['start','mid','climax']))+m.say(S,lover,'topc'):'')+fmt(fp(S,LAMIA_AFTER),{a:p.name,b:lover.name});
ST.say(S,{actors:[p,lover],tag:'蛇の夜',kind:'climax',text:t,why:'蛇の父の呪いで、'+p.name+'の想う相手（'+lover.name+'）がラミアの姿になって迫ってきた',mag:32});
return true;
}
if(top(p)){
ST.say(S,{actors:[p],tag:'蛇の夢',text:fmt(fp(S,YIG_DREAM_TOP),{a:p.name})+fmt(fp(S,YIG_WAKE_TOP),{a:p.name}),why:'夢の中に蛇の父の眷属が現れたが、'+p.name+'はねじ伏せた（受け攻めの指定：攻め）',mag:22});
return true;
}
var t2;
if(eroFor(S,p)){
t2=eroRecv(S,p,{form:'hebi',intro:fmt(fp(S,YIG_DREAM),{a:p.name}),fight:strong?'god':null,w:'蛇たち',g:'蛇の父',E:YIG_E,mid:'g',fin:GE_FIN.g,react:function(){return gp(S,p);}})+eroAgain(S,p,{w:'蛇たち'})+fmt(fp(S,YIG_WAKE),{a:p.name});
noAdd(S);
}else t2=fmt(fp(S,YIG_DREAM),{a:p.name})+(strong?m.resist(S,'god',p,{endure:false}):'')+(m?(strong?m.say(S,p,'endure'):m.moans(S,p,['start','mid','climax'])):'')+fmt(fp(S,YIG_WAKE),{a:p.name});
ST.say(S,{actors:[p],tag:'蛇の夢',kind:'climax',text:t2,why:'夢の中で、蛇の父の眷属に犯された',mag:28});
return true;
}
var TCHO=L('夜半、{a}の部屋に、子どものように小柄な村人たちが、音もなく入り込んできた。月明かりに、尖らせた歯が光った。|{a}は厠からの帰り、暗い廊下で、何本もの小さな手に足首を掴まれ、引き倒された。聞き慣れない言葉が、くすくすと笑い合っていた。|寺の裏に呼び出された{a}を、小柄な村人たちが取り囲んだ。誰もが老人の顔をしていて、誰もが笑っていた。');
var TCHO_ACT=L('村人たちは{a}の手足を縄で寺の柱に括りつけ、交代で{a}を犯した。順番を待つ者たちは、{a}の肩や脇腹に、尖った歯を立てて血を舐めていた。|村人の一人が{a}の髪を掴んで床に押しつけ、もう一人が背後からのしかかった。{a}が身をよじるたびに、別の誰かが、面白がって{a}の太腿に噛みついた。|村人たちは{a}を象の神の仏像の前に引きずり出し、その足元で{a}を組み敷いた。仏像の鼻がゆっくりと下りてきて、{a}の首筋から血を啜るあいだ、村人たちは代わる代わる{a}を貫き続けた。');
var TCHO_AFTER=L('夜明け前、村人たちは満足げに去っていった。{a}の体には、無数の歯形が残っていた。|朝、{a}は寺の柱に括りつけられたまま見つかった。肩には、肉を食いちぎられた跡があった。|村人たちは去り際に、{a}の頬を撫でて、聞き慣れない言葉で何か言った。それが「次は食べる」という意味だと、{a}には、なぜか分かった。');
var TCHO_TOP=L('夜半、{a}の部屋に、子どものように小柄な村人たちが、音もなく入り込んできた。{a}は掴みかかってきた一人の首根っこを掴んで畳に叩きつけ、もう一人の腕を捻り上げた。村人たちは尖った歯を剥いて唸ったが、{a}が一歩も退かないと分かると、くすくす笑いながら闇に溶けていった。|寺の裏に呼び出された{a}を、小柄な村人たちが取り囲んだ。{a}は伸びてきた手を払いのけ、先頭の一人を寺の柱に押しつけた。「次に触ったら、折る」――村人たちは顔を見合わせ、聞き慣れない言葉で何か言い交わして、引き下がった。');
function chaugnar(S,p,live,h){
var rng=S.rng,lv=JS.R18.lvMob(S),m=M();
if(!ok(p,h,10)||rng()>lv*(0.18+S.hostile/400))return false;
mark(p,h);
if(top(p)){
p.m.hp=Math.max(0,p.m.hp-6);p.m.fear=Math.min(100,p.m.fear+10);
ST.say(S,{actors:[p],tag:'チョー・チョー人の夜',text:fmt(fp(S,TCHO_TOP),{a:p.name}),why:'チョー・チョー人の村人たちが襲ってきたが、'+p.name+'は叩き伏せて追い払った（体力−6・恐怖＋10）',mag:26});
return true;
}
var kb=kbPlan(S,p,live,h,'v',10);
if(kb||eroFor(S,p))return tchoRecv(S,p,h,kb);
var t=fmt(fp(S,TCHO),{a:p.name})+(m?m.resist(S,'crowd',p,{endure:false}):'')+fmt(fp(S,TCHO_ACT),{a:p.name})+(m?m.say(S,p,'endure'):'')+fmt(fp(S,TCHO_AFTER),{a:p.name});
p.m.hp=Math.max(0,p.m.hp-18);p.m.fear=Math.min(100,p.m.fear+22);
ST.say(S,{actors:[p],tag:'チョー・チョー人の夜',kind:'climax',text:t,why:'象の神を奉じるチョー・チョー人の村人たちが、残虐性をむき出しにして襲ってきた（体力−18・恐怖＋22）',mag:34});
return true;
}
var TCHO_ERO={
f:L('小柄な村人たちは{a}の手足を寺の柱に括りつけ、一人目の村人が{a}の{女性器}に{男性器}をねじ込んだ。{s:hit}。{a}「{v0}」――子どものような背丈に似合わない太さに、{a}の背中が弓なりに反った。|'+
'村人の一人が{a}の髪を掴んで床に押しつけ、もう一人の村人が背後から{女性器}を突き上げた。{s:hit}。{a}「{v0}」――老人の顔をした男は、腰を打ちつけながら、尖った歯を剥き出しにして笑っていた。|'+
'村人たちは{a}を象の神の仏像の前に引きずり出し、その足元で脚を大きく開かせた。{s:hit}。{a}「{v0}」――代わる代わる小さな体がのしかかり、{a}の{ナカ}を乱暴に抉っていった。'),
m:L('小柄な村人たちは{a}の手足を寺の柱に括りつけ、一人目の村人が{a}の{後ろ}に{男性器}をねじ込んだ。{s:hit}。{a}「{v0}」――子どものような背丈に似合わない太さに、{a}の背中が弓なりに反った。|'+
'村人の一人が{a}の髪を掴んで床に押しつけ、もう一人の村人が背後から{ナカ}を突き上げた。{s:hit}。{a}「{v0}」――別の村人が{a}の{男性器}を握り、尖った歯を剥き出しにして、扱きながら笑っていた。|'+
'村人たちは{a}を象の神の仏像の前に引きずり出し、四つ這いにさせた。{s:hit}。{a}「{v0}」――代わる代わる小さな体がのしかかり、{a}の{ナカ}を乱暴に抉っていった。')
};
var TCHO_E=L('順番を待つ者たちは、{a}の肩や脇腹に尖った歯を立て、滲んだ血を舐めながら笑っていた。{s:suck}。痛みと突き上げが交互に来て、{a}にはもう、どちらがどちらか分からなかった。|'+
'象の神の仏像の鼻がゆっくりと下りてきて、{a}の首筋から血を啜った。{s:suck}。血を吸われるたびに、{a}の{ナカ}は、貫いている村人をきつく締めつけた。|'+
'小柄な村人たちは、{a}が喘ぐたびに聞き慣れない言葉で囃し立て、{a}の{乳首}に、{尻}に、面白がって歯形を残していった。{s:hit}。');
function tchoRecv(S,p,h,kb){
var m=M(),w='村人たち';
if(kb)kbStart(S,kb,w);
var a=kb&&kb.br==='sub'?kb.k:p,other=kb&&(kb.br==='both'||kb.br==='watch')?kb.k:null;
if(kb&&(a!==p||other))mark(kb.k,h);
var am={a:a.name};
var ero=eroFor(S,a)&& !(other&&kb.br==='both'&&HK.NoGen&&HK.NoGen.on(other,null)),t;
var intro=fmt(fp(S,TCHO),am);
if(ero){
t=eroRecv(S,a,{actT:TCHO_ERO,intro:intro,fight:'crowd',w:w,E:TCHO_E,mid:'v',fin:GE_FIN.vm,react:function(){return JS.R18.pz?JS.R18.pz(S,a,'react'):gp(S,a);},mob:'m',kb:kb})+eroAgain(S,a,{w:w});
}else{
var core=(m?m.resist(S,'crowd',a,{endure:false}):'')+fmt(fp(S,TCHO_ACT),am)+(m?m.say(S,a,'endure'):'');
t=intro+(kb?kbNovel(S,kb,core,w):core);
}
t+=fmt(fp(S,TCHO_AFTER),am);
a.m.hp=Math.max(0,a.m.hp-18);a.m.fear=Math.min(100,a.m.fear+22);
if(other){other.m.fear=Math.min(100,other.m.fear+15);if(kb.br==='both')other.m.hp=Math.max(0,other.m.hp-12);}
var add=kb?(kb.br==='sub'?'（'+p.name+'の身代わり）':kb.br==='both'?'（'+other.name+'も一緒に）':kb.br==='watch'?'（'+other.name+'は縛られて見せつけられた）':''):'';
if(ero||other)noAdd(S);
ST.say(S,{actors:other?[a,other]:[a],tag:'チョー・チョー人の夜',kind:'climax',lewd:true,text:t,why:'象の神を奉じるチョー・チョー人の村人たちが、残虐性をむき出しにして襲ってきた'+add+'（体力−18・恐怖＋22）',mag:34});
if(kb)kbAfter(S,kb);
return true;
}
var GP={
proud:L('{a}は人ではないものを睨み据え、最後まで目を逸らさなかった。逸らさなかった目の縁に、悔し涙が滲んでいた。|{a}は歯を食いしばり、こんなものに屈してたまるかと身をよじった。体のほうが先に、その意地を裏切った。|{a}は、自分の体が勝手に応えていくのを、屈辱に顔を歪めて見ていることしかできなかった。'),
stern:L('{a}は「これは現実ではない」と自分に言い聞かせ、呼吸を数えて耐えようとした。数は、途中で分からなくなった。|{a}は唇を真一文字に結び、声を漏らすまいとした。異様な感触が、規律の隙間から{a}を崩していった。|{a}は最後まで背筋を伸ばそうとした。人ではないものの手は、その背を、ゆっくりとしならせていった。'),
tsun:L('{a}は「こんなの、ぜんぜん平気」と震える声で言い張った。強がりの続きは、引きつった息に呑まれた。|{a}は涙目で相手を睨み、「触んないで」と繰り返した。繰り返すほど、声は細く崩れていった。|{a}は意地でも泣くまいとした。泣くまいとした顔が、くしゃりと歪んだ。'),
gentle:L('{a}は押し返そうとした手を、怯えて途中で止めてしまった。人ではないものの冷たさが、その手首を包んだ。|{a}は震えながら、「仲間には、手を出さないで」とだけ頼んだ。返事はなかった。|{a}は声を殺して泣いた。泣きながら、ただ早く終わることだけを祈っていた。'),
devoted:L('{a}は「私が耐えれば、皆は助かる」と自分に言い聞かせ、目を閉じた。閉じた瞼が、ずっと震えていた。|{a}は誰かの名前を呼びかけて、口をつぐんだ。助けを呼べば、その人が巻き込まれる気がした。|{a}は祈るように指を組んだ。組んだ指は、途中でほどけてしまった。'),
cool:L('{a}はそれが何なのかを観察しようとした。観察するほど、理屈の通じない感触に、思考が削られていった。|{a}は「幻覚だ」と短く呟いた。幻覚にしては、肌に残る冷たさが生々しすぎた。|{a}は表情一つ変えまいとした。乱れていく呼吸だけが、平静を裏切っていた。'),
free:L('{a}は最初、怖さを笑い飛ばそうとした。笑い声は、人ではないものの感触に、すぐ凍りついた。|{a}は軽口を叩こうとして、声が出ないことに気づいた。初めて、本当に怖いと思った。|{a}は身をよじって逃げようとした。いつもの身軽さが、まるで嘘のように体が動かなかった。'),
shy:L('{a}は声も出せずに、ただ身を縮めていた。見られることも、触れられることも、何もかもが怖かった。|{a}は両腕で顔を隠した。隠せたのは、顔だけだった。|{a}の拒む声は、蚊の鳴くように小さかった。人ではないものには、届きもしなかった。'),
polite:L('{a}は「お、おやめください」と最後まで丁寧に頼んだ。丁寧な言葉は、途中から言葉にならなくなった。|{a}は乱れまいと居住まいを正そうとしたが、異様な力に押さえつけられて、それも叶わなかった。|{a}は「どうか、ご容赦を」と震える声で繰り返した。神には、人の作法は通じなかった。')
};
function gp(S,p){var t=GP[(HK.personaOf?HK.personaOf(p):p.persona)||'gentle']||GP.gentle;return fmt(fp(S,t),{a:p.name});}
var KIND={d:'夢の中で',r:'村の儀式で',b:'眷属に襲われ',v:'村人たちに襲われ',p:'神に取り憑かれ'};
var G_DRUG=L('{a}の体には、昼間に盛られた薬の熱がまだ残っていた。|媚薬の熱が引かないまま、{a}は寝つけずにいた。|{a}は火照る体を持て余し、何度も寝返りを打っていた。');
var G_AFTER=L('翌朝、{a}は自分の体を何度も洗った。洗っても洗っても、{g}の気配が肌の下に残っている気がした。|{a}はその日、誰とも口をきかなかった。仲間が肩に触れると、びくりと身をすくませた。|朝の光の中で、{a}は昨夜のことが本当にあったのか分からなくなっていた。体の芯に残る鈍い痛みだけが、夢ではないと告げていた。');
var G_TOP=L('n:{a}は闇の中から伸びてきた{g}の気配を、真正面から睨み返した。気配はしばらく{a}のまわりを這い回っていたが、やがて諦めたように引いていった。|n:夜半、{a}の枕元に人ではないものが立った。{a}は起き上がって明かりを点け、それが消えるまで黙って見据え続けた。|x:{a}の寝所に忍び込んできたのは、{g}に心を奪われた村人だった。{a}はその腕を捻り上げて布団に押さえつけ、主導権を一度も渡さないまま、相手が神の名を呼ぶのも忘れるまで責め立てた。');
var G_TOPNPC=L('村人は、{a}の下で荒い息を吐き、神の名ではなく{a}の名を呼んだ。|相手は、{a}の腕の中で何度も身を震わせ、やがてぐったりと力を抜いた。|人の形をしたそれは、{a}の下で、聞いたことのない声で細く鳴いた。');
var G_PREG=L('翌朝、{a}の下腹が、わずかに張っていた。村の老婆が手を当てて頷いた。「＠神さまの御子が、宿りなさった」|{a}の下腹の奥で、何かがことりと動いた。{a}は、その感触を誰にも言えなかった。|{a}の下腹に、昨夜まではなかった紋様が浮かんでいた。村人たちは、それを見て目を細めた。');
var G_PAIR={
m:L('{x}は{y}を布団に横たえ、熱に浮かされたように肌を重ねていった。{g}の気配が、二人の上に重くのしかかっていた。|{x}は{y}の浴衣をはだけさせ、首筋から胸へ唇を落としていった。{y}は拒まず、{x}の背に腕を回した。|二人は言葉も交わさずに抱き合った。{x}が{y}の脚を割り、ゆっくりと腰を進めていくあいだ、障子の外で何かが息を潜めていた。'),
ff:L('{x}は{y}を布団に横たえ、浴衣の合わせから手を差し入れた。指先が胸を、腹を、ゆっくりと下っていった。|{x}は{y}の耳元に唇を寄せ、熱い息を吹きかけながら、太腿の内側を指でなぞった。{y}の膝が、震えながら開いていった。|二人は脚を絡め、互いの肌の熱を確かめ合った。{x}の舌が{y}の鎖骨をなぞるたび、{y}は小さく息を呑んだ。'),
fm:L('{x}は{y}を布団の上に仰向けにさせ、その腰の上に跨った。見下ろす{x}の目は、{g}の夜の熱に濡れていた。|{x}は{y}の両手首を枕元に押さえ、自分から腰を沈めていった。{y}は息を詰め、{x}の動きにただ翻弄された。|{x}は{y}の胸に手をついて跨り、ゆっくりと自分の中へ導いた。主導権は、最初から最後まで{x}の手の中にあった。')
};
function kindOf(s){var m= /^([a-z]):/.exec(s);return m?{k:m[1],t:s.slice(2)}:{k:'v',t:s};}
function godNight(S,p,live,h){
var GD=JS.R18GN&&JS.R18GN[S.G.id];
if(!GD)return false;
var rng=S.rng,lv=JS.R18.lvMob(S),m=M(),g=S.G.call;
if(!ok(p,h,10)||rng()>lv*(p.aphro?0.3:0.16))return false;
mark(p,h);
var r=rng(),ms=mates(S,p,live,h,10),am={a:p.name,g:g};
if(GD.P.length&&ms.length&&r<0.28){
var q=rng.pick(ms);mark(q,h);
var o=HK.Pos?HK.Pos.order(p,q,[p,q]):[p,q],X=o[0],Y=o[1],Pz=HK.Pos;
var ck=Pz&&Pz.ff(X,Y)?'ff':Pz&&Pz.isF(X)&& !Pz.isF(Y)?'fm':'m',xm={x:X.name,y:Y.name,g:g};
var t=fmt(fp(S,GD.P),xm)+fmt(fp(S,G_PAIR[ck]),xm)+JS.R18.sex(S,X,Y,{mood:'drug',fore:false});
if((!HK.Content||HK.Content.ok(S,'preg'))&&GD.preg&&rng()<GD.preg){Y.preg=true;t+=(HK.R18Thick&&HK.R18Thick.on(S)?'\n\n':'')+fmt(fp(S,G_PREG),{a:Y.name});}
if(JS.R18.pz&&rng()<0.5)t+=(HK.R18Thick&&HK.R18Thick.on(S)?'\n\n':'')+JS.R18.pz(S,Y,'mutual');
ST.say(S,{actors:[X,Y],tag:GD.tag,kind:'climax',text:t,why:GD.who+'の気配に当てられ、参加者どうしで交わった'+(m&&m.lastPos(S)?'（'+m.lastPos(S)+'）':'')+(Y.preg?'（'+Y.name+'が疑似妊娠した）':''),mag:30});
return true;
}
if(top(p)){
var tp=kindOf(fp(S,GD.T.concat(G_TOP)));
var tt=fmt(tp.t,am);
if(tp.k==='x')tt+=(m?m.say(S,p,'top'):'')+fmt(fp(S,G_TOPNPC),am);
var to={actors:[p],tag:GD.tag,text:tt,why:tp.k==='x'?GD.who+'の夜。寄ってきた相手を、'+p.name+'のほうが組み伏せた（受け攻めの指定：攻め）':GD.who+'が迫ってきたが、'+p.name+'ははねのけた（受け攻めの指定：攻め）',mag:tp.k==='x'?26:20};
if(tp.k==='x')to.kind='climax';
ST.say(S,to);
return true;
}
var pt=kindOf(fp(S,GD.N)),part=pt.t.split('／'),dream=pt.k==='d';
var strong=m&&m.isStrong(p),fight=m&& !dream&&(strong|| !p.aphro);
var act=part[1]||'',wi=Math.max(act.lastIndexOf('。目覚め'),act.lastIndexOf('。目が覚め')),wake='';
if(wi>=0){wake=act.slice(wi+1);act=act.slice(0,wi+1);}
var kb=KB_KIND[pt.k]?kbPlan(S,p,live,h,pt.k,10):null;
if(kb||eroFor(S,p))return godRecv(S,p,GD,pt,part[0],act,wake,kb,h);
var t2=(p.aphro&&rng()<0.6?fmt(fp(S,G_DRUG),am):'')+fmt(part[0],am)+(fight?m.resist(S,pt.k==='v'?'crowd':'god',p,{endure:false}):'')+fmt(act,am)+(pt.k==='v'&&JS.R18.pz?JS.R18.pz(S,p,'react'):gp(S,p));
if(m)t2+=(fight?m.say(S,p,'endure'):m.moans(S,p,dream?['mid','climax']:['start','mid','climax']))+m.npc(S,pt.k==='v'?'villager':'god',p);
t2+=fmt(wake,am);
if((!HK.Content||HK.Content.ok(S,'preg'))&&GD.preg&&rng()<GD.preg*(0.5+lv*0.5)){p.preg=true;t2+=fmt(fp(S,G_PREG),am);}
t2+=fmt(fp(S,GD.A.concat(G_AFTER)),am);
var fear=dream?8:14,hurt=dream?0:4;
p.m.fear=Math.min(100,p.m.fear+fear);p.m.hp=Math.max(0,p.m.hp-hurt);
ST.say(S,{actors:[p],tag:GD.tag,kind:'climax',text:t2,why:KIND[pt.k]+'、'+GD.who+'に体を弄ばれた'+(fight?'（抗った）':p.aphro?'（媚薬が回っていた）':'')+(p.preg?'（疑似妊娠した：生贄にされると巫女になりやすい）':'')+'（恐怖＋'+fear+(hurt?'・体力−'+hurt:'')+'）',mag:dream?26:30});
return true;
}
var KB_KIND={v:1,b:1,r:1};
function godRecv(S,p,GD,pt,part0,act,wake,kb,h){
var m=M(),rng=S.rng,g=S.G.call,lv=JS.R18.lvMob(S),dream=pt.k==='d';
var w=pt.k==='v'?'村人たち':g;
if(kb)kbStart(S,kb,w);
var a=kb&&kb.br==='sub'?kb.k:p,other=kb&&(kb.br==='both'||kb.br==='watch')?kb.k:null;
if(a!==p||other)mark(kb.k,h);
var am={a:a.name,g:g};
var strong=m&&m.isStrong(a),fight=m&& !dream&&(strong|| !a.aphro);
var intro=(a.aphro&&rng()<0.6?fmt(fp(S,G_DRUG),am):'')+(kb&&kb.br==='sub'?'':fmt(part0,am));
var ero=eroFor(S,a)&& !(other&&kb.br==='both'&&HK.NoGen&&HK.NoGen.on(other,null)),t2;
if(ero){
var form=pt.k==='v'?(GD.vf&&GE_ACT[GD.vf]?GD.vf:'vm'):pt.k==='p'?'p':(GE_ACT[GD.ty]?GD.ty:'hito');
var vil=form==='vm'||form==='vf';
if(vil)w=form==='vf'?'村の女たち':'村人たち';else if(pt.k==='v')w=g;
t2=eroRecv(S,a,{
form:form,intro:intro,act0:fmt(act,am),fight:fight?(vil?'crowd':'god'):null,w:w,g:g,
E:vil||pt.k==='p'?null:GD.E,mid:vil?'v':pt.k==='p'?'p':'g',fin:vil?GE_FIN[form]:pt.k==='p'?GE_FIN.p:GE_FIN.g,
react:function(){return pt.k==='v'&&JS.R18.pz?JS.R18.pz(S,a,'react'):gp(S,a);},mob:form==='vf'?'f':'m',kb:kb
})+eroAgain(S,a,{w:w,g:g});
}else{
var core=(fight?m.resist(S,pt.k==='v'?'crowd':'god',a,{endure:false}):'')+fmt(act,am)+(pt.k==='v'&&JS.R18.pz?JS.R18.pz(S,a,'react'):gp(S,a));
if(m)core+=(fight?m.say(S,a,'endure'):m.moans(S,a,dream?['mid','climax']:['start','mid','climax']))+m.npc(S,pt.k==='v'?'villager':'god',a);
t2=intro+(kb?kbNovel(S,kb,core,w):core);
}
t2+=fmt(wake,am);
if((!HK.Content||HK.Content.ok(S,'preg'))&&GD.preg&&rng()<GD.preg*(0.5+lv*0.5)){a.preg=true;t2+=fmt(fp(S,G_PREG),am);}
t2+=fmt(fp(S,GD.A.concat(G_AFTER)),am);
var fear=dream?8:14,hurt=dream?0:4;
a.m.fear=Math.min(100,a.m.fear+fear);a.m.hp=Math.max(0,a.m.hp-hurt);
if(other)other.m.fear=Math.min(100,other.m.fear+(kb.br==='both'?fear:10));
var add=kb?(kb.br==='sub'?'（'+p.name+'の身代わり）':kb.br==='both'?'（'+other.name+'も一緒に）':kb.br==='watch'?'（'+other.name+'は縛られて見せつけられた）':''):'';
if(ero||other)noAdd(S);
ST.say(S,{actors:other?[a,other]:[a],tag:GD.tag,kind:'climax',lewd:true,text:t2,why:KIND[pt.k]+'、'+GD.who+'に体を弄ばれた'+add+(fight?'（抗った）':a.aphro?'（媚薬が回っていた）':'')+(a.preg?'（疑似妊娠した：生贄にされると巫女になりやすい）':'')+'（恐怖＋'+fear+(hurt?'・体力−'+hurt:'')+'）',mag:dream?26:30});
if(kb)kbAfter(S,kb);
return true;
}
var GODR={shub:shub,yig:yig,chaugnar:chaugnar};
var base=JS.R18.night;
JS.R18.night=function(S,p,live,h){
if(HK.State&& !HK.State.r18ok(p))return false;
if(!JS.R18.room(S,[p]))return false;
live=live.filter(function(q){return q===p||JS.R18.room(S,[q]);});
var n0=S.log.length,r=(function(){
var pc=JS.R18.lvPC(S),mob=JS.R18.lvMob(S);
if(p.noMob||(HK.Content&& !HK.Content.ok(S,'force'))||mob<=0||S.rng()>(pc>mob?mob/pc:1))return base(S,p,live,h);
var f=GODR[S.G.id]||godNight;
if(f(S,p,live,h))return true;
return base(S,p,live,h);
})();
if(r)JS.R18.spendLog(S,n0);
return r;
};
var LC=HK.Lewd&&HK.Lewd.CONF&&HK.Lewd.CONF.jashin;
if(LC){
LC.from=LC.from||{};
LC.from.jmob=function(e){
if(e.jlewd==null&&e.jyobai==null)return null;
var v=e.jlewd==null?40: +e.jlewd,y=e.jyobai==null?100: +e.jyobai;
return Math.round(Math.max(0,Math.min(100,v))*Math.max(0,Math.min(100,y))/100);
};
}
})();
});
;
/* ==== js/solo-jashin-r18-godnight.js ==== */
HK.Load.def(509,'js/solo-jashin-r18-godnight.js',function(){
(function(){
'use strict';
var JS=window.HK&&window.HK.JASHIN;
if(!JS)return;
function L(s){return s?s.split('|'):[];}
var GN=JS.R18GN=JS.R18GN||{};
function G(id,tag,who,preg,n,a,t,p){GN[id]={tag:tag,who:who,preg:preg,N:L(n),A:L(a),T:L(t),P:L(p)};}
G('dagon','海の父の夜','海の父さまの眷属',0.45,
'v:満潮の夜、{a}の部屋の窓の外から、むせるような潮の匂いが流れ込んできた。障子を開けた先に立っていたのは、魚のように離れた目をした村の男たちだった。／ぬめった手が{a}の手足を掴み、岩場まで引きずっていった。鱗の浮いた腕に抱え込まれ、水かきのある指が{a}の体を探った。寄せる波の音が、{a}の声をかき消し続けた。|b:浜辺を歩いていた{a}の足首を、波の下から何かが掴んだ。振り返る間もなく、{a}は浅瀬に引き倒された。／海から上がってきたのは、人と魚のあいだの姿をした眷属だった。冷たい腹が{a}にのしかかり、鰓が耳元でひくひくと鳴った。{a}の体は、潮が引くまで、岩の上に縫いとめられていた。|d:夢の中で、{a}は海の底の神殿に寝かされていた。水の重さで胸が潰れそうなのに、なぜか息はできた。／海の父の眷属たちが、祝詞のような泡を吐きながら、{a}の体に鱗の指を這わせた。一匹ずつ順番に、{a}の奥を確かめていった。目覚めると、布団がじっとりと海水で湿っていた。|r:村の女たちが、{a}の体に生臭い油を塗り込めた。「＠海の父さまの花嫁は、よう滑らんとな」――{a}は満潮の岩場に縛られ、足元まで波が来ていた。／暗い海面が盛り上がり、巨大な影が身を起こした。冷たい水と一緒に押し寄せたものが、{a}の手足を岩に押さえつけ、ゆっくりと体を開いていった。岸では、村人たちが手を合わせて唱え続けていた。',
'翌朝、{a}の首筋に、鱗で擦れた赤い筋が幾本も残っていた。指で触れると、かすかに魚の匂いがした。|{a}は朝から、喉の渇きが止まらなかった。何杯水を飲んでも、塩辛さが舌から消えなかった。鏡に映る自分の目が、少し離れて見えた気がした。|翌朝、{a}の布団には、濡れた鱗が何枚も貼りついていた。女将はそれを黙って拾い集め、神棚に供えた。',
'x:満潮の夜、窓から這い込んできた魚の目の村人を、{a}は畳に引き倒した。鱗の浮いた手首をまとめて押さえつけると、村人は鰓を震わせて喘いだ。{a}は相手が海の言葉で許しを乞うまで、手を緩めなかった。|n:浜辺で足首を掴んできた眷属の腕を、{a}は流木で叩き折った。眷属は甲高い声を上げて波の下へ逃げ、{a}は濡れた足のまま、振り返らずに宿へ戻った。',
'潮の匂いが座敷に満ちた夜、{x}と{y}は、互いの肌が妙に冷たく湿っていることに気づいた。海の父の気配が、二人を引き寄せていた。|波の音が耳の奥でうねるように響き、{x}は気づけば{y}の部屋にいた。{y}もまた、眠れずに窓の外の暗い海を見ていた。');
G('cthulhu','眠りの大神の夜','眠りの大神の夢',0.45,
'd:眠りに落ちた{a}は、緑の石でできた歪んだ都の中に立っていた。角度の狂った回廊が、どこまでも奥へ続いていた。／回廊の奥から、無数の触腕がゆっくりと伸びてきた。触腕は{a}の手足を絡め取り、口を塞ぎ、体の奥まで這い込んできた。眠りの大神の夢は、{a}が目を覚まそうとするたびに、より深く{a}を引き戻した。|d:{a}の夢に、村人たちと同じ夢が流れ込んできた。何百人もの眠る村人が、同じ夢の中で{a}を見つめていた。／海の底の神殿で、{a}は祭壇に寝かされていた。眠る神の夢の触腕が、{a}の肌をなぞり、開き、満たしていった。夢の中の村人たちが、一斉に同じ祈りを呟いていた。|v:夜半、{a}の部屋に、眠ったままの村人たちが入ってきた。瞼は閉じたまま、足取りだけが確かだった。／村人たちは夢遊のまま{a}を囲み、寝間着を剥いだ。誰も目を開けず、誰も何も言わなかった。{a}が叫んでも、眠る者たちは起きなかった。|r:星辰の揃う夜、{a}は水路の奥へ連れていかれた。腰まで水に浸かった{a}のまわりで、村人たちが眠たげな声で祈りを唱えていた。／水の中から、粘つく触腕が{a}の脚に巻きついた。触腕は{a}を水底へ引き込もうとしながら、同時に{a}の体をまさぐり続けた。水面に浮かぶ{a}の顔だけを、村人たちは眠そうな目で見下ろしていた。',
'目覚めた{a}の手首には、吸盤の跡が環のように並んでいた。数えると、ちょうど七つあった。|{a}はその日一日、ひどく眠かった。目を閉じるたびに、緑の石の回廊が瞼の裏に浮かんだ。|翌朝、{a}は自分が村人と同じ夢の話をしていることに気づいて、口をつぐんだ。',
'n:夢の中で、緑の石の回廊から触腕が伸びてきた。{a}は夢の中で自分の頬を張り、無理やり目を覚ました。窓の外では、村人たちが一斉にこちらを振り向いていた。|x:夢遊のまま部屋に入ってきた村人の肩を、{a}は掴んで揺さぶり、布団に押さえつけた。目を覚ました村人は怯えたように{a}を見上げ、{a}はそのまま主導権を握って、相手が夢の続きを忘れるまで離さなかった。',
'同じ夢を見た、と{y}が言った。海の底の都で、{x}に抱かれる夢を。{x}は黙って{y}の手を取った。{x}も、同じ夢を見ていた。|眠りの大神の夢に二人で引きずり込まれる前に、{x}は{y}を揺り起こした。目を覚ました{y}は、夢の続きのように{x}にしがみついた。');
G('hastur','黄衣の夜','名を呼んではならぬ方の黄衣',0.3,
'b:{a}が窓に掛けられた黄色い布を外そうとしたとき、布の向こうに誰かが立っていた。ぼろぼろの黄衣をまとった、背の高い何かだった。／黄衣の下から、触手のようなものが溢れ出し、{a}の体を絡め取った。仮面の下には顔がなかった。{a}は二つの太陽の幻を見ながら、黄衣の中へ包み込まれていった。|v:村の芝居小屋で、村人たちが「黄衣の王」の一幕を演じていた。第二幕が始まったとき、{a}は舞台に引き上げられていた。／役者たちは、台本どおりだと言って{a}の着物を剥いだ。観客の村人たちは身じろぎもせず、黄色い仮面の下から舞台を見つめていた。{a}がどんなに叫んでも、それは芝居の台詞として扱われた。|r:{a}は黄衣を着せられ、湖のほとりに立たされた。「＠お名前を、三度」――村人たちが、{a}の背後で囁いた。／三度目を言い終えるより早く、湖の上の空気が裂けた。黄衣が{a}の肌に貼りつき、内側から何かが{a}の体をなぞり始めた。湖面に、二つの太陽が揺れていた。|d:夢の中で、{a}はカルコサの湖のほとりにいた。黒い星が空に昇っていた。／黄衣の王が、{a}の顎を指先で持ち上げた。王の衣の裾が{a}の脚に絡みつき、ほどけない結び目のように{a}を縛っていった。{a}は知らない言葉で喘ぎ、その言葉の意味だけが、目覚めたあとも頭から離れなかった。',
'翌朝、{a}の肌着が、いつのまにか黄色く染まっていた。洗っても、色は落ちなかった。|{a}は朝から、ある歌を口ずさんでいることに気づいて、ぞっとした。それは、聞いたこともない「黄衣の王」の歌だった。',
'n:{a}は窓の外に立つ黄衣の影から目を逸らし、黄色い布を引き戻して、窓を閉め切った。名を呼ばれても、一度も振り向かなかった。|x:芝居小屋の舞台に引き上げられた{a}は、台本を持つ役者の手首を掴み、逆に舞台の上へ組み伏せた。黄色い仮面がずれて、役者の怯えた顔が覗いた。幕が下りるまで、芝居は{a}の筋書きどおりに進んだ。',
'');
G('nyarla','伝道師様の夜','伝道師様',0.25,
'v:「＠お疲れでしょう」――伝道師様は、{a}の部屋に茶を運んできた。穏やかな笑顔のまま、伝道師様は{a}の隣に腰を下ろした。／湯呑みを置いた手が、{a}の膝に乗った。振り払おうとした{a}の腕は、なぜか動かなかった。伝道師様は耳元で{a}の秘密を一つずつ囁きながら、ゆっくりと{a}の帯を解いた。|b:荒れ果てた旧家の暗がりで、{a}は顔のない黒い影に出会った。影は伝道師様の声で笑った。／影は無数の手に分かれ、{a}の体の至るところを同時に撫でた。撫でられるたびに、{a}は自分が誰なのか分からなくなっていった。最後に、顔のない影が{a}の顔を真似て、笑った。|d:夢の中で、{a}は光る多面体の石を覗き込んでいた。石の奥に、無数の目があった。／石の中から伸びてきた闇が、{a}の体を包み込んだ。闇は{a}がいちばん恐れている人の顔をして、{a}に触れた。{a}はその顔に抱かれながら、声にならない悲鳴を上げ続けた。|p:夕餉のあと、{a}の影が、{a}とは違う形に伸びていた。気づいたときには、影が{a}の足首を掴んでいた。／影は{a}の足元から這い上がり、{a}の体の内側に入り込んだ。{a}は自分の手が自分の肌をまさぐるのを、止めることができなかった。座敷の隅で、伝道師様が楽しそうに見物していた。',
'翌朝、伝道師様は何事もなかったように、{a}に「おはようございます」と微笑んだ。その微笑みを見ただけで、{a}の膝は震えた。|{a}の首筋には、黒い指の形の痣が残っていた。痣は、日に日に誰かの名前のような形に変わっていった。',
'n:伝道師様が膝に伸ばしてきた手を、{a}は掴んで止めた。「＠おや」――伝道師様は面白そうに目を細め、それ以上は何もせずに、茶だけを残して出ていった。|x:{a}は耳元で秘密を囁いてくる伝道師様の襟を掴み、逆に畳へ押さえつけた。伝道師様は抵抗もせず、笑ったまま{a}を見上げていた。{a}は最後まで主導権を譲らなかったが、勝ったのかどうかは、朝になっても分からなかった。',
'伝道師様が、{x}にだけ聞こえる声で囁いた。「＠あの方も、あなたを待っていますよ」――{x}が{y}の部屋を訪ねると、{y}は眠らずに待っていた。|伝道師様の淹れた茶を飲んだ夜、{x}と{y}は、互いの体温ばかりを意識していた。座敷の隅の暗がりが、くすくすと笑った。');
G('yog','門の夜','門にして鍵',0.35,
'b:{a}が鳥居をくぐった瞬間、景色が裏返った。虹色に光る無数の球体が、{a}を取り囲んでいた。／球体は{a}の体に触れては溶け合い、触れた場所から、時間がばらばらにほどけていった。{a}は同じ一瞬を何度も繰り返し、何度も犯され、何度も達した。どれが最初で、どれが最後なのか、分からなかった。|r:環状列石の真ん中に、{a}は横たえられた。村人たちが石のまわりを回りながら、意味の取れない呪文を唱えていた。／石と石のあいだの空気が開き、門の向こうから、泡立つ光が溢れ出した。光は{a}の体の内と外を同時に満たし、{a}は自分の体がどこから始まりどこで終わるのか、見失った。|d:夢の中で、{a}は数え切れないほどの鳥居をくぐり続けていた。くぐるたびに、誰かの手が{a}の服を一枚ずつ剥いでいった。／最後の鳥居の向こうで、門そのものが{a}を待っていた。虹色の泡が{a}の肌に吸いつき、奥へ、奥へと染み込んでいった。過去と未来の{a}が、同時に喘いでいた。',
'翌朝、{a}の腕時計は、昨夜のある時刻で止まっていた。自分の体の時間も、どこかで止まっている気がした。|{a}は、昨夜のことを、まだ起きていないことのように思い出した。思い出すたびに、体の芯が疼いた。',
'n:鳥居をくぐった瞬間に景色が裏返りかけたのを、{a}は一歩下がって踏みとどまった。虹色の光が鳥居の向こうで渦を巻いていたが、{a}は二度とその鳥居をくぐらなかった。|n:環状列石の真ん中に立たされた{a}は、唱えていた村人の一人を石の輪の外へ突き飛ばした。呪文の輪が崩れ、開きかけた門は、悔しそうに閉じていった。',
'');
G('ithaqua','風の夜','風に乗りて歩むもの',0.2,
'b:吹雪の夜、{a}は宿の外で、巨大な足跡が雪の上に続いているのを見た。足跡は、{a}の背後で途切れていた。／振り返った{a}を、凍える風が抱きすくめた。目のない巨大な影が{a}を雪の上に押し倒し、凍りつく指で{a}の体を探った。{a}の肌は、冷たさのあまり痛みを感じなくなっていた。|r:{a}は峠の上に置き去りにされた。薄衣一枚の体に、雪が叩きつけられた。／風の中から、赤く光る二つの目が降りてきた。風に乗りて歩むものは、{a}を雪ごと抱え上げ、空の上で{a}の体を弄んだ。地上の灯りが、遥か下で揺れていた。|d:夢の中で、{a}は雪原に裸で横たわっていた。寒さは感じなかった。／空から降りてきた風が、{a}の肌の上を這い回った。風は{a}の体の隙間という隙間に入り込み、内側から{a}を凍らせていった。目覚めると、{a}の睫毛に霜が降りていた。',
'翌朝、{a}の足の指先は、凍傷で白く変わっていた。真夏のはずの村で、{a}は一日中震えていた。|{a}はその日から、風の音がするたびに体をすくませた。風の音の中に、自分の名を呼ぶ声が混じっていた。',
'n:吹雪の中で背後から抱きすくめようとした風を、{a}は宿の雨戸を叩きつけて締め出した。風は一晩じゅう雨戸を叩き続けたが、{a}は一度も開けなかった。|n:峠に置き去りにされた{a}は、雪の中から立ち上がり、赤い目を睨み返しながら、一歩ずつ峠を下りた。風は{a}の背中を押し続けたが、{a}は膝をつかなかった。',
'');
G('cthugha','炎の夜','炎の御方',0.25,
'r:星の昇る夜、{a}は囲炉裏端に座らされた。消えることのない火が、急に高く燃え上がった。／炎の中から、光の粒のようなものが無数に飛び出し、{a}の肌に降り注いだ。熱いのに火傷はしなかった。光の粒は{a}の着物の下に潜り込み、肌の内側を焼くように撫で回した。{a}は、熱さと快楽の区別がつかなくなった。|v:村の若い衆が、火の番を口実に{a}の部屋に上がり込んできた。全員の目が、炎のように赤く光っていた。／「＠炎の御方は、熱い体がお好きだ」――村人たちは{a}を囲炉裏のそばに押さえつけた。炎の熱が{a}の肌を炙り、汗に濡れた体を、何本もの熱い手がまさぐった。|d:夢の中で、{a}は燃え盛る星の上に立っていた。足元から、炎の舌が這い上がってきた。／炎は{a}の脚を舐め、腰を包み、胸を焦がした。{a}は燃え上がりながら、焼け落ちるような絶頂を何度も迎えた。目覚めると、{a}の寝間着の裾が、焦げていた。',
'翌朝、{a}の肌には、火の粉が散ったような赤い点が無数に残っていた。触れると、まだ熱かった。|{a}は朝から、囲炉裏の火から目が離せなかった。炎が揺れるたびに、体の奥が疼いた。',
'n:囲炉裏の炎が高く燃え上がった瞬間、{a}は水甕の水を炎にぶちまけた。灰が舞い上がり、光の粒は悲鳴のような音を立てて消えていった。|x:火の番を口実に上がり込んできた若い衆の一人を、{a}は囲炉裏の脇に押さえつけた。赤く光っていた目が、怯えて人の色に戻った。{a}は炎の照り返しの中で、相手が音を上げるまで手を緩めなかった。',
'囲炉裏の火が一晩じゅう燃え盛った夜、{x}と{y}は、汗ばむ肌を持て余していた。火の粉が弾けるたびに、二人の距離が縮まっていった。');
G('tsathoggua','眠れるヒキガエルの夜','眠れるヒキガエルさまの眷属',0.3,
'b:洞窟から吹き出す生ぬるい風に誘われるように、{a}は社の奥へ迷い込んでいた。暗がりの奥で、何か大きなものが、ゆっくりと呼吸していた。／不定形の黒い塊が、洞窟の床を這って{a}に近づいてきた。塊は{a}の脚を呑み込み、腰を呑み込み、生温かい体の中で{a}をこね回した。{a}は息もできないまま、粘つく闇の中で身をよじり続けた。|r:「＠ヒキガエルさまは、空腹でいらっしゃる」――{a}は供物の台に載せられ、洞窟の入口に置かれた。／洞窟の奥から、毛むくじゃらの巨体の気配がにじり寄ってきた。生温かい舌のようなものが、{a}の体を足の先から舐め上げた。{a}は食べられるのだと思った。それは、食べるよりもずっと長く、{a}を味わい続けた。|d:夢の中で、{a}は柔らかい泥の中に沈んでいた。泥は温かく、眠たくなるほど心地よかった。／泥の中から、無数の小さな手が{a}の肌を撫で始めた。眠ってはいけないと分かっているのに、瞼が落ちていった。眠りの中で、{a}の体は泥に開かれていった。',
'翌朝、{a}の体には、ぬめりのある黒い粘液がこびりついていた。拭っても拭っても、指のあいだに残った。|{a}は一日じゅう、ひどくだるかった。何度も、洞窟のほうへ足が向きそうになった。',
'n:洞窟の奥から這い寄ってきた黒い塊に、{a}は松明を突きつけた。塊は縮み上がって闇へ戻っていき、{a}は振り返らずに洞窟を出た。|n:供物の台に載せられた{a}は、縛めを解いて台から飛び降り、台ごと洞窟の入口に蹴り込んだ。奥から、不機嫌そうな低い唸り声が響いた。',
'');
G('gatano','鏡の夜','鏡の向こうの山神さま',0.25,
'r:{a}は社の銅鏡の前に座らされた。「＠目を、逸らしてはなりませぬ」――鏡の中で、山の向こうから何かがこちらを見返していた。／鏡の中の灰色の手が、鏡面を抜けて{a}の頬に触れた。触れられたところから、{a}の肌は石のように硬く痺れていった。動けなくなった{a}の体を、灰色の手は隅々まで撫で回した。|d:夢の中で、{a}は鏡の前に立たされていた。鏡に映る自分が、勝手に服を脱ぎ始めた。／鏡の中の{a}の後ろに、山のような影が立っていた。影の手が鏡の中の{a}を撫でるたびに、鏡の外の{a}の体にも、同じ感触が走った。{a}は自分の姿が犯されるのを、目を逸らせずに見続けた。|v:寝所の姿見に、山の方角が映っていた。{a}が布を掛けようとしたとき、背後から村人たちに腕を押さえられた。／「＠山神さまに、よう見ていただけ」――村人たちは{a}を姿見の前に押さえつけ、着物をはだけさせた。鏡の奥の暗がりから、視線が{a}の肌を舐めていった。{a}の体は、見られているだけで、少しずつ固まっていった。',
'翌朝、{a}の指先は、石のように白く硬くなっていた。昼過ぎまで、思うように曲がらなかった。|{a}はその日から、鏡を見ることができなくなった。鏡の中の自分が、まだ山の方を向いている気がした。',
'n:{a}は社の銅鏡に背を向け、鏡の前に置かれた燭台を倒した。鏡面に煤が這い上がり、向こう側の気配は、苛立つように遠のいた。|x:姿見の前に押さえつけようとしてきた村人の腕を、{a}は振りほどき、逆にその村人を鏡に押しつけた。鏡に映る自分の顔を見せつけられた村人は、悲鳴とも喘ぎともつかない声を漏らした。',
'');
G('nyogtha','穴の夜','穴の底に棲むもの',0.3,
'b:夜半、村の真ん中の穴から、黒い煙のようなものが立ちのぼった。煙は地を這い、宿の床下から{a}の部屋へ染み出してきた。／煙は形を変えて、粘つく黒い流れになり、{a}の布団に潜り込んだ。{a}の脚に、腰に、胸に、冷たく重いものが絡みついた。{a}は叫んだが、声は床下の暗がりに吸い込まれていった。|r:{a}は縄で縛られ、穴の縁から吊り下ろされた。下りるほどに、闇は濃く、温かくなっていった。／穴の底の闇が、{a}を抱きとめた。闇は粘土のように{a}の形に沿って広がり、{a}の体を内側までなぞった。上から、村人たちの祈りの声が、遠く小さく聞こえていた。|d:夢の中で、{a}は底の見えない穴を、どこまでも落ち続けていた。／落ちていく{a}の体を、闇の中から伸びた無数の黒い指が撫でた。指は{a}の衣を一枚ずつ剥ぎ、肌の上に冷たい跡を残していった。底に着く前に目が覚めたが、体の奥の冷たさだけは、夢から持ち帰ってしまった。',
'翌朝、{a}の部屋の畳に、黒く焦げたような染みが人の形に残っていた。|{a}はその日から、足元の床が抜ける気がして、何度も立ち止まった。',
'n:床下から染み出してきた黒い煙に、{a}は懐の御札を叩きつけた。煙は焼けるような音を立てて引っ込み、穴の方角から、低い唸り声が一度だけ響いた。|n:穴の縁で吊り下ろされかけた{a}は、縄を掴んで自力で這い上がり、縄を握っていた村人に縄ごと投げ返した。',
'');
G('glaaki','湖の主の夜','湖の底の主',0.3,
'b:夜の湖のほとりで、{a}は水の中から呼ぶ声を聞いた。気づけば、膝まで水に浸かっていた。／水の底から、金属のような棘が一本、するりと伸びてきた。棘は{a}の肌を傷つけずに撫で回し、そのたびに、甘い痺れが{a}の体に流れ込んだ。痺れに抗えないまま、{a}は湖の主に体を委ねさせられていった。|v:「＠主さまの僕になれば、もう苦しまんで済む」――湖の村人たちは、青白い顔で{a}を取り囲んだ。誰の胸にも、棘に貫かれた古い傷跡があった。／死人のように冷たい手が、{a}の体を浜辺に押さえつけた。村人たちは、主に捧げる前の「清め」だと言って、代わる代わる{a}の肌を撫で回した。湖の水面だけが、楽しそうにさざめいていた。|d:夢の中で、{a}は湖の底に沈んだ建物の中にいた。窓の外を、巨大な楕円の影が通り過ぎた。／影から伸びた棘が、窓を抜けて{a}の肌に触れた。触れられるたびに、{a}の頭の中に、湖の主の夢が流れ込んできた。夢の中の{a}は、自分から棘に身を寄せていた。',
'翌朝、{a}の胸元に、小さな刺し傷が一つだけ残っていた。痛みはなく、ただ脈を打つたびに、甘く疼いた。|{a}は一日じゅう、湖のほうばかり見ていた。仲間に肩を叩かれるまで、自分が湖へ歩きかけていたことに気づかなかった。',
'n:湖の中から呼ぶ声に、{a}は耳を塞いで背を向けた。膝まで濡れた足のまま宿へ戻り、夜明けまで、湖側の窓を一度も開けなかった。|x:青白い顔で取り囲んできた村人の一人を、{a}は浜辺に押さえつけた。死人のように冷たかった村人の肌が、{a}の手の下で少しずつ熱を取り戻していった。',
'');
G('quachil','塵の夜','塵を踏むもの',0.2,
'r:空き地の真ん中に立たされた{a}の上に、光の柱が降りてきた。柱の中で、時間が音を立てて流れ落ちていった。／骨のような指が、光の中から{a}の肌に触れた。触れられるたびに、何十年分の快楽が一度に流れ込み、同じだけの時間が{a}の体から抜けていった。{a}は叫びながら、何度も、何年分も達した。|v:年老いた村人たちが、夜半、{a}の部屋を囲んだ。誰の目にも、若い体への飢えがあった。／皺だらけの手が、{a}の肌の張りを確かめるように撫で回した。「＠若さを、少しだけ分けておくれ」――村人たちに触れられた場所から、{a}の体温が、少しずつ吸い取られていった。|d:夢の中で、{a}の体は塵になって崩れかけていた。崩れた塵を、骨の指が一粒ずつ拾い集めていた。／指は塵を{a}の形に戻しながら、そのたびに{a}の体を内側からなぞった。崩れては戻され、戻されては崩され、{a}はそのたびに、気が遠くなるほどの熱に呑まれた。',
'翌朝、{a}の髪に、一筋だけ白いものが混じっていた。昨夜までは、なかった。|{a}は鏡の中の自分が、少しだけ老けて見えた。手の甲に、覚えのない皺が一本走っていた。',
'n:光の柱が降りてくる直前、{a}は空き地の縁まで駆け抜けた。光は{a}の影だけをかすめ、影はその場で塵になって崩れた。|x:皺だらけの手で肌に触れてきた村人の手首を、{a}は掴み返した。{a}は相手を布団に押さえつけ、若さを吸う暇も与えないまま、相手が息を切らして許しを乞うまで責め立てた。',
'');
G('byatis','蛇髭の夜','蛇髭の神',0.3,
'd:夢の中で、地下牢の扉の向こうから、一つ目の何かが{a}に囁いた。「＠扉を開けておくれ。そうしたら、もっと気持ちよくしてやろう」／扉の隙間から、蛇のような髭が何本も這い出してきた。髭は{a}の手足に巻きつき、肌を撫で、{a}の体を扉のほうへ引き寄せた。{a}は扉の閂に手を伸ばしながら、何度も達した。|b:砦の跡を歩いていた{a}の足首に、地面の割れ目から伸びた髭が絡みついた。／髭は次々と這い出してきて、{a}の体を石畳の上に縫いとめた。一本一本が意思を持つように、{a}の着物の下を探り、敏感なところを確かめていった。地下から、満足げな唸り声が響いていた。|v:扉の見張り番の村人たちが、{a}を地下牢へ続く階段に引きずり込んだ。「＠神さまが、よそ者の匂いを欲しがっておられる」／村人たちは{a}を扉の前に押さえつけ、扉の隙間に{a}の肌を押し当てた。隙間から這い出た髭が{a}を撫で回すあいだ、村人たちは{a}の口を塞ぎ続けた。',
'翌朝、{a}の手首と足首に、細い蛇が巻きついたような跡が残っていた。|{a}は一日じゅう、地下牢の扉のことを考えていた。閂の重さが、掌に残っていた。',
'n:夢の中で、{a}は閂に伸ばしかけた自分の手を、もう一方の手で掴んで止めた。扉の向こうで、一つ目が恨めしそうに細められた。|n:足首に絡みついた髭を、{a}は石で叩き潰した。割れ目の奥から、悲鳴のような唸り声が上がり、髭は一斉に引っ込んでいった。',
'');
G('rlyeh_child','黒い仔の夜','海底の黒い仔',0.45,
'r:満ち潮の夜、{a}は浜辺の黒い円錐形の岩に縛りつけられた。波が、足首から腰へと上がってきた。／岩の表面がぬるりと動き、黒い肉の襞が{a}の体を包み込んだ。岩そのものが、黒い仔だった。冷たい襞が{a}の肌を這い、{a}を岩の内側へ取り込もうとした。|b:夜の浜で、{a}は打ち上げられた黒い塊を見つけた。近づいた瞬間、塊が口を開いた。／塊から伸びた触手が、{a}を砂の上に引き倒した。触手の先の小さな口が、{a}の肌のあちこちに吸いついた。波の音に混じって、海の底から、母を呼ぶような声がした。|d:夢の中で、{a}は海の底で黒い仔たちに囲まれていた。仔たちは、{a}を母だと思っているようだった。／仔たちは{a}の体に群がり、柔らかい触手で{a}の肌を探り、奥へ潜り込んできた。{a}は海の底で、何匹もの仔に抱かれ続けた。',
'翌朝、{a}の下腹に、黒い円錐形の痣が浮かんでいた。|{a}は朝から、海の方角が気になって仕方がなかった。海の底から、誰かが{a}を呼んでいた。',
'n:黒い岩に縛られかけた{a}は、縄を噛み切って浜を駆け上がった。背後で、岩が悔しそうに軋む音がした。|n:口を開いた黒い塊を、{a}は波打ち際まで蹴り返した。塊は海に呑まれ、二度と浜に上がってこなかった。',
'');
G('rhan','氷室の夜','氷の中の神',0.2,
'r:{a}は氷室の中へ連れていかれた。氷の壁の奥に、何かが閉じ込められていた。／「＠神さまは、血の温かさを恋しがっておられる」――村人たちは{a}を氷の台の上に横たえ、肌を剥き出しにした。氷の中の神の目が開き、冷たい触肢が氷を抜けて伸びてきた。冷たさと熱さが、{a}の肌の上でせめぎ合った。|b:夜半、宿の床が凍りつくほど冷えていた。{a}の布団の中に、氷のように冷たい何かが入り込んできた。／冷たい触肢が{a}の体に巻きつき、吸盤のような口が{a}の首筋に吸いついた。血を吸われるたびに、{a}の体は痺れるように熱くなった。|d:夢の中で、{a}は氷の中に閉じ込められていた。目の前に、神の顔があった。／氷が少しずつ溶け、神の触肢が{a}の体に絡みついてきた。凍えながら、{a}の体は内側から燃えるように熱くなっていった。',
'翌朝、{a}の首筋に、丸い吸い跡が二つ残っていた。顔色は、紙のように白かった。|{a}はその日、どれだけ火に当たっても、体の芯が冷えたままだった。',
'n:氷室の台に横たえられかけた{a}は、松明を奪って氷の壁に押し当てた。氷が溶けて神の目が露わになると、村人たちは悲鳴を上げて逃げ散った。|n:布団に入り込んできた冷たいものを、{a}は布団ごと掴んで囲炉裏に投げ込んだ。じゅっと音がして、氷の欠片だけが灰に残った。',
'');
G('ghatanothoa2','大鹿の女神の夜','大鹿の女神',0.5,
'r:角の冠をかぶせられた{a}は、女神の祭壇に横たえられた。鹿の角の帽子をかぶった村人たちが、祭壇のまわりで足を踏み鳴らした。／森の奥から、大鹿の姿をした女神が現れた。女神の吐息が{a}の肌を撫で、{a}の体は、春の獣のように熱を帯びていった。村人たちは、{a}を女神の伴侶として、代わる代わる祝福した。|v:夜半、角の帽子をかぶった村人たちが、{a}の部屋に入ってきた。「＠女神さまの季節だ」／村人たちは{a}を四つ這いにさせ、獣の交わりを真似るように、背後から{a}を押さえ込んだ。部屋の外で、鹿の鳴き声が響き続けていた。|d:夢の中で、{a}は森の中の泉のほとりにいた。泉の向こうから、大きな角を持つ影が近づいてきた。／影は{a}を苔の上に押し伏せ、獣の熱で{a}を包み込んだ。{a}は夢の中で、女神の群れの一頭になっていた。',
'翌朝、{a}の額の両脇が、角の生えかけのように疼いていた。|{a}の体からは、一日じゅう、森の獣の匂いがした。村の犬が、{a}を見て吠え立てた。',
'n:角の冠をかぶせられかけた{a}は、冠を地面に叩きつけて踏み砕いた。村人たちの踏み鳴らす足が、一斉に止まった。|x:四つ這いにさせようと伸びてきた手を払いのけ、{a}は角の帽子の村人を逆に押さえ込んだ。帽子が転がり落ち、村人は獣のような声で鳴いた。',
'森の奥で、鹿の鳴き声が一晩じゅう響いていた。その声を聞くうちに、{x}は{y}の部屋の襖を開けていた。{y}は、待っていたように顔を上げた。|女神の季節だ、と村人たちが言っていた夜、{x}と{y}は、獣の匂いの残る納屋で鉢合わせた。どちらも、帰ろうとはしなかった。');
G('mordiggian','屍の神の夜','屍を喰らう神',0.15,
'r:{a}は「死んだもの」として白い経帷子を着せられ、棺に寝かされた。蓋が閉まり、棺が神社の奥へ運ばれていった。／棺の蓋が、暗闇の中で開いた。腐臭と香の匂いの中で、冷たい手が{a}の経帷子を剥いでいった。生きている体を確かめるように、手は{a}の肌を隅々まで撫で回した。|v:墓守の村人たちが、夜半、{a}の部屋を訪ねてきた。「＠死に装束の寸法を、測らせてもらう」／村人たちは{a}の着物を剥ぎ、冷たい物差しで{a}の体を測った。測るたびに、指が肌の上で長く止まった。{a}は、自分が死体として扱われていることに気づいて、凍りついた。|d:夢の中で、{a}は墓地の土の中に横たわっていた。土の上から、何かが掘り進んでくる音がした。／土を掻き分けて現れた屍の神の手が、{a}の体を掘り起こし、冷たい腕に抱いた。{a}は自分が死んでいるのか生きているのか分からないまま、神の腕の中で震え続けた。',
'翌朝、{a}の肌から、かすかに香と土の匂いがした。湯で洗っても、消えなかった。|{a}は、自分の脈を何度も確かめた。脈は打っていた。それでも、確かめずにはいられなかった。',
'n:棺の蓋が閉まる寸前、{a}は内側から蓋を蹴り開けた。棺を担いでいた村人たちは、死人が起き上がったと叫んで逃げ散った。|n:死に装束の寸法を測りに来た村人の物差しを、{a}は取り上げて二つに折った。村人は無言で頭を下げ、二度と来なかった。',
'');
G('ygolonac','掌の口の夜','掌の口さま',0.2,
'p:夜半、{a}の部屋に、手袋をはめた村人が入ってきた。村人は、ゆっくりと手袋を外した。掌に、濡れた口があった。／掌の口が{a}の肌に吸いつき、舐め回し、噛んだ。噛まれた場所から、{a}が胸の奥に隠していた欲望が、一つずつ引きずり出されていった。{a}は自分の口から出る言葉の汚さに、泣きながら喘いだ。|r:{a}は写本を読まされた。一行読むごとに、掌がむず痒くなった。／最後の一行を読み終えたとき、首のない肥えた巨体が、{a}の前に立っていた。掌の口が{a}の全身を舐め回し、{a}の心の底を暴き立てた。暴かれた欲望の通りに、{a}の体は扱われた。|d:夢の中で、{a}は手袋をはめた手に囲まれていた。手袋が一斉に外された。／無数の掌の口が{a}の肌に吸いつき、舐め、甘噛みした。口たちは{a}の名前を呼び、{a}がいちばん言われたくない言葉を、耳元で囁き続けた。',
'翌朝、{a}の肌のあちこちに、小さな歯形が残っていた。歯形は、どれも掌くらいの大きさの、丸い形をしていた。|{a}は一日じゅう、自分の掌を見つめていた。掌が、むず痒かった。',
'n:手袋を外しかけた村人の手首を、{a}は掴んで止めた。{a}は手袋を相手の手に押し戻し、部屋の外へ突き出した。|x:{a}は掌の口を剥き出しにした村人の手首を押さえつけ、逆に畳へ組み伏せた。暴かれるはずだった欲望は、{a}のほうが相手から引きずり出した。村人は掌の口ごと、{a}の下で喘いだ。',
'掌の口さまの気配が村に満ちた夜、{x}は胸の奥に押し込めていたものを、もう抑えきれなかった。{x}が{y}の部屋を訪ねたとき、{y}も、同じ目をしていた。|両手に手袋をはめた村人たちが、廊下ですれ違いざまに{x}の耳元で囁いた。「＠我慢は、毒ですよ」――その夜、{x}は{y}の部屋の前で、長いあいだ立ち尽くしていた。');
G('hakuja','巳さんの夜','みいさん（白蛇）',0.45,
'b:夜半、{a}の布団の中に、ひやりと冷たいものが滑り込んできた。月明かりに浮かんだのは、腕ほどもある太さの白い蛇だった。／白蛇は{a}の脚に巻きつき、ゆっくりと腰へ、胸へと這い上がった。冷たい鱗が肌を締めつけ、二股の舌が{a}の敏感なところをちろちろと探った。{a}は締めつけられるたびに息を詰まらせ、蛇の重みの下で身をよじり続けた。|r:{a}は白無垢を着せられ、池のほとりに座らされた。「＠みいさんのお嫁さまじゃ」――村の女たちが、{a}の髪に白い花を挿した。／池の水面が割れ、白い大蛇が{a}の膝に頭を乗せた。大蛇は白無垢の裾から入り込み、{a}の体に幾重にも巻きついた。{a}は花嫁として、池の縁で夜明けまで締め上げられていた。|v:村の娘たちが、白い蛇の置物を抱えて{a}の部屋に来た。「＠みいさんが、あなたを気に入りなさった」／娘たちは{a}の手足を押さえ、蛇の置物を{a}の肌に這わせた。冷たい陶器の感触が、途中からぬめる鱗に変わっていた。娘たちはくすくすと笑いながら、本物の白蛇が{a}の体を這い回るのを見守っていた。',
'翌朝、{a}の肌には、鱗の形の白い跡が、帯のように幾重にも巻きついていた。|翌朝、{a}の枕元に、真っ白な蛇の抜け殻がきちんと畳んで置かれていた。女将はそれを見て、黙って手を合わせた。',
'x:布団に滑り込んできた白蛇の頭を、{a}は片手で押さえつけた。白蛇は{a}の腕に巻きついたまま、やがて従うように力を抜いた。翌朝、白蛇の化身だという村の娘が、{a}の部屋の前で頬を染めて頭を下げていた。|n:池のほとりで白無垢の裾に入り込もうとした大蛇を、{a}は裾ごと払いのけ、白無垢を脱ぎ捨てて池に投げ込んだ。水面は、しばらく怒ったように泡立っていた。',
'白い蛇が座敷の隅を横切った夜、{x}と{y}は、どちらからともなく手を取り合った。触れた指先から、ひやりとした熱が這い上がってきた。|みいさんの池に、白い花が二輪並んで浮かんでいた。それを見た夜、{x}は{y}を自分の部屋へ招いた。{y}は黙ってついてきた。');
G('kubinashi','かけさまの夜','かけさま（首のない地蔵）',0.15,
'v:夜半、{a}の部屋の前に、首のない地蔵が立っていた。その後ろに、手拭いで顔を隠した村人たちが並んでいた。／「＠首から上は、かけさまのもの。首から下は、村のもの」――村人たちは{a}の顔に布をかぶせ、顔の見えなくなった{a}の体を、代わる代わる撫で回した。{a}の声は、布の下でくぐもって、誰にも届かなかった。|b:夜道で、{a}は首のない地蔵が後ろをついてくるのに気づいた。走っても、地蔵はいつも同じ距離にいた。／地蔵の石の手が、{a}の肩を掴んだ。冷たい石の指が{a}の首筋をなぞり、首から下の体を、品定めするように撫でていった。{a}は自分の首がまだ付いているか、何度も確かめずにはいられなかった。|d:夢の中で、{a}の首は、地蔵の台座の上に置かれていた。首だけの{a}は、自分の体を見下ろしていた。／首のない{a}の体を、村人たちが運んでいき、好きなように扱った。{a}は首だけで、それを見ていることしかできなかった。体に触れられる感覚だけが、首まで届き続けていた。',
'翌朝、{a}の首にぐるりと一周、細い赤い線が浮かんでいた。|{a}は一日じゅう、首を手で押さえていた。押さえていないと、落ちてしまいそうな気がした。',
'n:顔に布をかぶせようとした村人の手を払いのけ、{a}は首のない地蔵を蹴り倒した。地蔵の後ろの村人たちは、真っ青になって散っていった。|n:肩を掴んだ地蔵の石の手を振りほどき、{a}は地蔵を睨みつけた。首のない地蔵は、しばらくその場に立ち尽くしてから、来た道をゆっくりと戻っていった。',
'');
G('kakashi','そほどさまの夜','そほどさま（案山子）',0.25,
'b:夕暮れのあぜ道で、人の服を着た案山子が、首をこちらに回した。／案山子の藁の腕が伸び、{a}の体を田の真ん中へ引きずり込んだ。藁の指が{a}の服の下に潜り込み、ちくちくと肌を刺しながら、{a}の体を探り回った。泥と藁の匂いの中で、{a}は案山子の腕から逃れられなかった。|r:{a}は田の真ん中の十字の柱に縛られた。村人たちは{a}の服を脱がせ、案山子の古い着物を着せた。／「＠そほどさまは、田の実りを知る神さま。お前の実りも、確かめなさる」――夜の田に、案山子たちが集まってきた。藁の手が、{a}の体の実り具合を確かめるように、いつまでも撫で回した。|v:田植え歌を歌いながら、村人たちが{a}を田んぼへ連れ出した。「＠豊作の祈りじゃ」／泥田の中で、村人たちは{a}を押し倒し、泥まみれの手で{a}の体を撫で回した。案山子たちが、あぜ道から黙ってそれを見ていた。田植え歌は、一晩じゅう途切れなかった。',
'翌朝、{a}の服の中から、藁くずがいくつも出てきた。肌には、藁で擦れた細かい傷が無数に残っていた。|{a}はその日から、田んぼの案山子と目が合うのを避けるようになった。案山子のほうは、いつも{a}を見ていた。',
'n:あぜ道で伸びてきた藁の腕を、{a}は掴んで引き千切った。案山子はばらばらに崩れ、着ていた人の服だけが、田に残った。|x:泥田に連れ出そうとした村人の一人を、{a}は逆に泥の中へ押さえ込んだ。泥まみれになった村人は、田植え歌の代わりに、上ずった声を上げた。',
'');
G('ryujin','はちだいさまの夜','はちだいさま（竜神）',0.4,
'r:{a}は白装束で滝壺のそばの岩に座らされた。村人たちが、雨乞いの太鼓を打ち鳴らした。／滝壺の水が渦を巻き、鱗に覆われた長い胴が、{a}の体に巻きついた。竜神の髭が{a}の肌を撫で、冷たい水と熱い鱗が、交互に{a}を責め立てた。渇いた空に、雷が鳴り続けていた。|v:「＠雨を呼ぶには、竜神さまを喜ばせにゃならん」――日照りで干からびた村の男たちが、{a}を水神の祠に連れ込んだ。／男たちは祠の床に{a}を押さえつけ、柄杓で{a}の体に水を浴びせながら、濡れた肌を撫で回した。祠の外で、乾いた風が鳴り続けていた。|d:夢の中で、{a}は雲の上にいた。八つの頭を持つ竜神が、{a}を見下ろしていた。／竜の頭の一つが{a}の脚のあいだに、もう一つが胸に、別の一つが首筋に寄せられた。{a}は八つの頭に囲まれ、雷に打たれるような熱に、何度も貫かれた。',
'翌朝、久しぶりに小雨が降った。村人たちは{a}の部屋に向かって、深々と手を合わせた。|{a}の腰に、鱗で擦れた赤い筋が、竜の胴のように巻きついていた。',
'n:滝壺から伸びてきた竜の胴を、{a}は岩を蹴って跳び越え、滝壺から遠ざかった。太鼓が止み、村人たちは途方に暮れた顔で空を見上げた。|x:祠に連れ込もうとした男の一人を、{a}は祠の床に押さえつけた。柄杓の水を頭から浴びた男は、{a}の下で、雨乞いの文句を忘れて喘いだ。',
'雷が近づく夜、{x}と{y}は縁側で、遠くの稲光を眺めていた。湿った風が吹いたとき、{x}は{y}の肩を引き寄せた。');
G('imigui','いみぐいさまの夜','いみぐいさま',0.2,
'v:{a}の部屋の軒先に、{a}の形をした紙の形代が吊るされていた。夜半、村人たちがそれを取りに来た。／「＠罪を、確かめにゃならん」――村人たちは{a}を押さえつけ、形代に書かれた{a}の罪を読み上げながら、罪のある場所だと言って{a}の体を一か所ずつ撫でていった。羞恥と熱が、同時に{a}の中から溢れ出した。|r:{a}は社の穴の前に立たされた。穴の奥から、巨大な口の気配がした。／穴から舞い上がった紙の形代が、{a}の肌に次々と貼りついた。形代はひとりでに{a}の体を撫で回し、{a}の恥ずかしい記憶を、一つずつ肌の上に書き出していった。穴の奥の神の口が、それを読みながら笑っていた。|d:夢の中で、{a}は巨大な口の中にいた。神の舌が、{a}の体を転がしていた。／口は{a}を噛まず、ただ舐め回し、味わい続けた。{a}の罪の数だけ、口は{a}を舐めた。罪は、いつまでも尽きなかった。',
'翌朝、{a}の肌に、細い墨の文字がうっすらと浮かんでいた。読もうとすると、文字は消えた。|{a}は一日じゅう、誰かに自分の秘密を知られている気がして、落ち着かなかった。',
'n:軒先の形代を、{a}は自分の手で破り捨てた。取りに来た村人たちは、破れた形代を見て、気味悪そうに引き返した。|n:社の穴から舞い上がった形代を、{a}は掴んで丸め、穴に投げ返した。奥の口は、不満げに歯を鳴らした。',
'');
G('mayu','こかげさまの夜','こかげさま（蚕）',0.35,
'b:夜半、{a}の布団の上を、白い蚕が何匹も這っていた。数えきれないほどの蚕が、{a}の体を這い上がってきた。／蚕たちは{a}の肌の上で糸を吐き、{a}の体を少しずつ包んでいった。柔らかい糸が{a}の手足を締めつけ、糸の中で、蚕たちが{a}の体を這い回り続けた。{a}は繭の中で、身動きもできずに喘いだ。|r:{a}は白い糸でぐるぐると巻かれ、蚕室の梁に吊るされた。「＠新しい繭さま」――村の女たちが、繭になった{a}を愛おしそうに撫でた。／繭の内側に、何かが入り込んできた。柔らかく、ぬるりとした神の仔が、繭の中の{a}の体をなぞった。外では、女たちが糸を紡ぐ音だけが続いていた。|v:機屋の娘たちが、{a}を蚕室へ招いた。「＠こかげさまに、ご挨拶を」／娘たちは{a}の着物を脱がせ、桑の葉で{a}の体を撫でた。葉の擦れる音に合わせて、娘たちの指が{a}の肌を這い回り、蚕が葉を食むように{a}を貪った。',
'翌朝、{a}の髪や腋に、白い絹糸が絡みついていた。ほどいてもほどいても、糸は尽きなかった。|{a}の肌は、一晩で絹のように白く、すべすべになっていた。村の女たちは、それを羨ましそうに撫でた。',
'n:布団の上を這う蚕を、{a}は布団ごと払い落とし、灯りを点けて蚕室の戸を閉めた。蚕たちは、戸の向こうで不満げにざわめいた。|x:蚕室に招いた機屋の娘の手首を、{a}は掴んで桑の葉の山に押し倒した。娘は驚いたように目を見開き、やがて{a}の下で、糸を吐くような細い声を漏らした。',
'蚕室で糸を紡ぐ音が、夜通し続いていた。その単調な音の中で、{x}と{y}は、一枚の布団に身を寄せ合っていた。');
G('fuchi','淵の大君の夜','淵の大君',0.45,
'r:{a}は白無垢を着せられ、腰に重りを括りつけられた。村人たちが、{a}を淵の縁まで連れていった。／淵の黒い水が、{a}の足首を引いた。水の中で、神の長い髭が{a}の帯を解き、花嫁の体を隅々まで確かめていった。息が続かなくなる寸前で、{a}は水面に押し上げられ、また引き込まれた。|v:夜半、村の男たちが{a}の部屋に入ってきた。「＠淵の大君さまの嫁御は、前の晩に、村で清めるしきたりだ」／男たちは{a}を淵の水で濡らした布で拭い、冷えた体を代わる代わる撫で回した。部屋の外で、日照りの風が鳴っていた。|d:夢の中で、{a}は白無垢のまま淵の底に沈んでいた。底には、苔むした御殿があった。／御殿の奥で、淵の大君が{a}を待っていた。神の冷たい腕に抱かれ、{a}は水底の婚礼の床で、息もできないまま花嫁にされた。',
'翌朝、{a}の髪から、淵の黒い水がしたたり落ちた。布団は、絞れるほど濡れていた。|{a}は一日じゅう、自分の左手の薬指を見つめていた。指に、水草が指輪のように巻きついていた。',
'n:腰に重りを括りつけられかけた{a}は、重りの縄を解き、淵の中に重りだけを放り込んだ。黒い水面が、腹を立てたように大きく波打った。|x:嫁御を清めると言って入ってきた男の一人を、{a}は濡れた布ごと押さえつけた。男は{a}の下で目を白黒させ、やがて降参したように喘いだ。',
'淵の大君の祝言の前夜だと、村人たちが噂していた。その夜、{x}は{y}を誰にも渡したくないと思った。{x}が手を伸ばすと、{y}はその手を握り返した。');
G('chibiki','千曳さまの夜','千曳さま',0.2,
'r:新月の夜、{a}は窓の板を外させられた。轟音とともに、通りを何か途方もなく大きなものが通り過ぎていった。／窓の外から、腐り落ちた毛皮の腕が伸びてきて、{a}を通りへ引きずり出した。{a}は荷車の荷台に括りつけられ、揺れる荷台の上で、千曳さまの眷属に覆いかぶさられた。轟音が、{a}の悲鳴を呑み込んだ。|v:板を打ちつけた家の中で、村人たちが{a}を囲んだ。「＠千曳さまが通る夜は、家の中で、声を出してはならん」／村人たちは{a}の口を手拭いで縛り、声を出せない{a}の体を、轟音に紛れて弄んだ。家が揺れるたびに、村人たちの手も荒くなった。|d:夢の中で、{a}は千本の引き綱に手足を縛られていた。綱の先は、闇の中へ続いていた。／綱がゆっくりと引かれ、{a}の体が開かれていった。闇の中から、獣の熱い息が近づいてきた。{a}は轟音の中で、獣の神にのしかかられた。',
'翌朝、{a}の手首と足首に、太い綱で擦れた跡が残っていた。|{a}は一日じゅう、遠くの轟音に耳を澄ませていた。音が聞こえるたびに、体がすくんだ。',
'n:窓の板を外せと言われた{a}は、逆に板をもう一枚打ちつけた。通りの轟音は、{a}の家の前で一度止まり、それから遠ざかっていった。|n:口を縛ろうとした村人の手拭いを、{a}は奪い取って床に叩きつけた。村人たちは、外の轟音よりも{a}の目を恐れて引き下がった。',
'');
G('shijima','しじまさまの夜','しじまさま',0.15,
'v:夜半、音もなく襖が開いた。白い着物の村人たちが、身振りだけで{a}を取り囲んだ。／村人たちは誰も声を出さず、{a}の口に布を詰め、手足を押さえた。{a}が身をよじる衣擦れの音さえ、村人たちは許さなかった。無音の中で、{a}の体は好きなように扱われた。|r:{a}は社に座らされた。「声を出すな」と、筆談の紙が差し出された。／社の奥から、口を縫われた白い影が這い寄ってきた。神の使いだという影は{a}の肌を音もなく撫で回し、{a}が声を漏らしそうになるたびに、冷たい指で唇を押さえた。{a}は声を殺したまま、何度も体を震わせた。|d:夢の中でさえ、音はなかった。口を縫われた白い影が、{a}の体を音もなく開いた。／{a}は声を上げようとしたが、喉から何も出てこなかった。影は{a}の沈黙を味わうように、ゆっくりと、何度も{a}を確かめた。遠くで、神社の鈴が一度だけ鳴った気がした。',
'翌朝、{a}はしばらく声が出なかった。喉に、細い糸が巻きついているような感触があった。|{a}の唇の端に、針で刺したような小さな傷が二つ、残っていた。',
'n:{a}は布を詰めようとした村人の手を払いのけ、わざと大きな声で仲間の名を呼んだ。村人たちは耳を塞ぎ、怯えたように逃げていった。|x:音もなく近づいてきた村人の一人を、{a}は布団に押さえつけた。声を出すことを許されない村人は、{a}の下で、ただ肩を震わせ続けた。',
'');
G('mekura','めあらいさまの夜','目洗い薬師',0.25,
'r:{a}は目隠しをされ、白無垢を着せられて寺に入れられた。「＠薬師さまの嫁さまは、目を使わぬもの」／暗闇の中で、木の香りのする手が{a}の体を撫で始めた。病を探すように、神の手は{a}の体の隅々を確かめ、撫でられた場所が熱く疼いた。見えないまま、{a}は何度も身を反らせた。|v:村の按摩だという男が、{a}の部屋に来た。男の両目は、潰れていた。／「＠目が見えん分、指はよう効く」――男の指は{a}の体のツボを探るように這い回り、やがて按摩とは呼べない場所に辿り着いた。{a}が逃げようとすると、別の盲いた村人が、{a}の肩を押さえていた。|d:夢の中で、{a}の両目は布で覆われていた。木彫りの薬師が、{a}の上にのしかかっていた。／薬師の手は{a}の目の上を撫で、それから体を下へと撫でていった。目が見えない分、触れられる感覚だけが、何倍にも鋭くなっていた。',
'翌朝、{a}の目は、しばらくぼやけて焦点が合わなかった。|{a}は一日じゅう、目を閉じるたびに、木の香りのする手の感触を思い出した。',
'n:目隠しをされかけた{a}は、布を引き剥がして寺の外へ出た。両目のない薬師如来が、背後で、ぎしりと首を傾げた。|x:按摩だという男の手首を、{a}は掴んで布団に押さえつけた。目の見えない男は、{a}の手の位置を探るように身をよじり、やがて大人しく喘いだ。',
'');
G('madara','まだらさまの夜','斑様',0.3,
'v:機を織る娘たちが、夜半、{a}の部屋に入ってきた。娘たちの肌には、黒い斑点が浮いていた。／「＠あなたにも、斑を分けてあげる」――娘たちは{a}の着物を脱がせ、{a}の肌に、斑点のある指を這わせた。触れられた場所に、黒い斑点が一つ、また一つと浮かんでいった。|r:{a}は機屋の奥で、絹糸で手足を機に縫いとめられた。「＠繭入りの前の、斑を数える儀」／斑の女神の気配が、{a}の肌の斑点を一つずつ舌でなぞっていった。{a}はそのたびに、機の糸を震わせて喘いだ。数え終わるまで、儀は終わらなかった。|d:夢の中で、{a}の体の斑点が、蝶のように肌の上を這い回っていた。／斑点は{a}の敏感な場所に集まり、そこで脈を打ち始めた。{a}は自分の肌に責められながら、遠くで機を織る神の音を聞いていた。',
'翌朝、{a}の内腿に、黒い斑点が三つ浮いていた。|{a}は一日じゅう、機を織る音から逃れられなかった。音は、{a}の体の中から響いているようだった。',
'n:斑点のある指を這わせようとした娘の手を、{a}は振り払った。娘たちは悲しそうに顔を見合わせ、機屋へ帰っていった。|x:斑を分けると言って迫ってきた娘を、{a}は機の前の筵に押し倒した。娘は斑点の浮いた肌を真っ赤に染め、{a}の下で、機の音より速い息をついた。',
'');
G('ajiro','網代観音の夜','網代観音',0.3,
'r:嵐の夜、{a}は小舟に乗せられ、湖の真ん中へ漕ぎ出された。腐臭が、風に乗って鼻を突いた。／湖の底から、白くふやけた千の手が伸びてきて、{a}を小舟から引きずり下ろした。手は観音の慈悲を真似るように{a}の体を撫で、開き、湖の冷たさで満たしていった。|v:漁師の村人たちが、網を持って{a}の部屋に来た。「＠観音さまは、網にかかったものを、お喜びになる」／村人たちは{a}を網で包み、網ごと床に転がした。網の目から覗く{a}の肌を、生臭い手が好きなように撫で回した。|d:夢の中で、{a}は網に絡め取られ、湖の底に引きずり込まれていた。／底には、白い布をかけた戸板が立っていた。布の下から伸びた白い手が、{a}を戸板に抱き寄せ、ふやけた指で{a}を撫で続けた。観音の顔は、溺れた村人の顔をしていた。',
'翌朝、{a}の体から、湖の腐臭がした。洗っても、一日じゅう消えなかった。|{a}の肌には、網の目の跡が、細かい格子状に残っていた。',
'n:小舟に乗せられかけた{a}は、櫂を奪って舟を岸へ戻した。湖の底から伸びてきた白い手は、空を掴んで沈んでいった。|n:網で包もうとした村人たちの網を、{a}は掴んで引き寄せ、逆に村人たちを網ごと床に転がした。',
'');
G('hiruko','よりえびすさまの夜','寄り恵比寿',0.35,
'b:夜の浜で、{a}は流れ着いた何かを見つけた。人のような、魚のような、骨のない柔らかい何かだった。／それは{a}の足首に吸いつき、ぬるりと這い上がってきた。骨のない体が{a}の体に沿って形を変え、隙間という隙間に入り込んだ。{a}は浜の上で、それを引き剥がすこともできずに震えた。|r:{a}は葦の舟に乗せられ、海へ流された。夜の波が、舟を沖へ運んでいった。／沖で、舟の下から柔らかいものが這い上がってきた。流れ着く前の寄り神たちが、{a}の体を海の底の宝のように撫で回した。舟は、朝まで波間に揺れていた。|v:浜の村人たちが、{a}を「今朝の寄りもの」と呼んで担ぎ上げた。／村人たちは{a}を浜の小屋に運び込み、流れ着いた神さまを清めるのだと言って、海水で{a}の体を洗い、撫で回した。小屋の外で、波がずっと笑うように鳴っていた。',
'翌朝、{a}の体には、ぬめりのある透明な膜が張りついていた。|{a}は一日じゅう、体の芯がぐにゃりと柔らかくなったような感覚に悩まされた。',
'n:足首に吸いついてきた柔らかい何かを、{a}は引き剥がして海へ投げ返した。それは波の中で、悲しげに形を崩した。|n:担ぎ上げようとした村人たちの手を振りほどき、{a}は浜の小屋の戸を蹴破って外へ出た。',
'');
G('akatsuchi','あかつちさまの夜','赫土ノ命',0.4,
'r:{a}は坑道の奥へ送られた。赤い土の壁が、脈を打っていた。／壁の土がゆっくりと崩れ、温かい赤土が{a}の体を包み込んだ。神の土は{a}の全身を揉みしだき、奥深くまで入り込んできた。{a}は息もできずに、赤い土の胎内で震え続けた。|v:手も爪も赤い村人たちが、{a}を坑道の入口に押さえつけた。「＠あかつちさまの印を、つけてやる」／村人たちは赤土を{a}の肌に塗り込めていった。赤く染まった手は、塗ると言いながら、{a}の体の奥まで這い回った。|d:夢の中で、{a}は温かい赤土の中に埋められていた。／脈打つ土が{a}の全身を包み、揉みしだき、奥深くまで入り込んできた。土の中で、神が{a}の名を呼んでいた。',
'翌朝、{a}の爪の間に、赤い土が入り込んでいた。いくら擦っても、落ちなかった。|{a}の下腹に、手形のような赤い痣が浮かんでいた。',
'n:坑道の奥へ送られた{a}は、崩れかけた土の壁を素手で掻き分け、坑道の外へ這い出た。後ろで、赤い土が悔しそうに崩れ落ちた。|x:赤土を塗り込めようとした村人の手首を掴み、{a}は逆にその村人を坑道の土の上に押さえつけた。赤く染まった村人は、{a}の下で、土の匂いのする息を吐いた。',
'');
G('kuchisake','おはぐろさまの夜','歯黒様',0.15,
'v:口元を布で覆った村人が、夜半、{a}の部屋に入ってきた。「＠あたし、きれい？」／答えられない{a}の顎を掴み、村人は布を外した。耳まで裂けた口が、真っ黒な歯を見せて笑った。裂けた口が{a}の首筋に吸いつき、黒い歯が{a}の肌に跡を刻んでいった。|r:「＠問いに、正しく答えよ」――{a}は社の前に座らされ、口元を隠した村人たちに囲まれた。／{a}が答えを間違えるたびに、村人たちは布を外し、裂けた口で{a}の体を一か所ずつ噛んだ。噛まれた場所は、痛みよりも先に、熱く痺れた。|d:夢の中で、{a}の口が、耳まで裂けていた。／裂けた口から、{a}自身の声とは思えない喘ぎ声が溢れ続けた。黒い歯の女神が、{a}の裂けた口に口づけた。',
'翌朝、{a}の首筋に、黒く染まった歯形が残っていた。|{a}は朝から、口元を手で隠さずにはいられなかった。',
'n:「＠あたし、きれい？」――{a}は答えずに、相手の布を自分から引き剥がした。裂けた口が、驚いたように閉じた。|n:{a}は問いに答えず、社の前から立ち上がった。村人たちは、答えのない者には手出しができないようだった。',
'');
G('dorogami','ぬたさまの夜','沼田御前',0.45,
'b:夜の泥田の縁を歩いていた{a}の足が、ずぶりと沈んだ。抜こうとすると、泥が脚を掴んだ。／泥の中から、柔らかい腕のようなものが何本も伸び、{a}の体を田の中へ引き込んだ。生温かい泥が、{a}の服の中に入り込み、肌を這い、奥まで満たしていった。|r:{a}は泥田の真ん中に立たされた。村人たちが、畦の上から祈りを唱えていた。／足元の泥が、ゆっくりと{a}を呑み込んでいった。腰まで沈んだところで、泥の中の神が{a}の体に絡みついた。{a}は泥の中で、身動きもできないまま、沼田御前に抱かれた。|v:泥まみれの村の女たちが、{a}を泥田へ連れ出した。「＠ぬたさまの田植えに、混ざってもらう」／女たちは{a}を泥の中に押し倒し、泥まみれの手で{a}の体を撫で回した。泥が肌を滑るたびに、{a}の体は、意思とは関係なく熱を帯びた。',
'翌朝、{a}の体から、どれだけ洗っても泥の匂いが取れなかった。|{a}の下腹が、泥を詰め込まれたように重く張っていた。',
'n:泥に沈みかけた{a}は、畦の杭を掴んで体を引き抜いた。泥田は、名残惜しそうに大きな泡を一つ吐いた。|x:泥の中へ押し倒そうとした女の一人を、{a}は逆に泥の中へ押さえ込んだ。泥まみれの女は、{a}の下で、田植え歌の節で喘いだ。',
'');
G('shinigami','むかえさまの夜','むかえさま',0.15,
'b:夜半、{a}の枕元に、黒い喪服の背の高い影が立っていた。手には、{a}の名が書かれた帳面があった。／影は{a}の上に覆いかぶさり、冷たい指で{a}の体を一つずつ数えるように撫でた。「＠まだ、少し、温かい」――冷たい唇が{a}の首筋に触れ、{a}の体温を少しずつ奪っていった。|r:{a}の名が帳面に書かれた。村人たちは、{a}を「迎え」の座敷に寝かせた。／座敷の闇の奥から、むかえさまの冷たい手が伸びてきた。神の手は{a}を黄泉へ連れ去る前に、生きている体の温かさを、名残惜しむように確かめ続けた。|d:夢の中で、{a}は黄泉の門の前に立っていた。門の前で、むかえさまが{a}を待っていた。／むかえさまは{a}を抱き寄せ、冷たい腕の中で{a}の体を確かめた。{a}は冷たさに震えながら、生きていることを確かめるように喘いだ。',
'翌朝、村の入口の門の数字が、一つ減っていた。|{a}の体温は、一日じゅう、少しだけ低いままだった。',
'n:枕元の影が帳面を開いた瞬間、{a}はその帳面を奪い取り、自分の名の頁を破り捨てた。影は、困ったように首を傾げて消えた。|n:{a}は「迎え」の座敷から起き上がり、座敷の襖を開け放った。朝の光が差し込み、闇の中の手は引っ込んだ。',
'');
G('hanayome','しろうどさまの夜','しろうどさま',0.4,
'r:{a}は婿の紋付きを着せられ、祝言の床に座らされた。向かいに、花嫁衣装を着た像が置かれていた。／灯明が消えたとき、像の白い手が{a}の頬に触れた。綿帽子の下には、顔がなかった。顔のない花嫁神は{a}の帯を解き、床入りの夜を、朝まで{a}に迎えさせ続けた。|v:村の女たちが、{a}に祝言の支度をさせた。「＠しろうどさまの婿殿には、床入りの作法を教えにゃ」／女たちは{a}を床に横たえ、作法を教えると言って、代わる代わる{a}の体を撫で、確かめた。障子の外で、三三九度の謡が流れ続けていた。|d:夢の中で、{a}は白無垢の花嫁と並んで、祝言の席に座っていた。／三三九度の盃を交わした瞬間、花嫁が{a}にのしかかってきた。白無垢の裾の下から、冷たい手足が{a}の体に絡みついた。花嫁の顔は、最後まで見えなかった。',
'翌朝、{a}の左手の薬指に、白い糸が結ばれていた。|{a}の布団の中から、白い綿帽子が出てきた。',
'n:灯明が消えた瞬間、{a}は祝言の床から立ち上がり、像を床の間から押し倒した。花嫁衣装の中は、からっぽだった。|x:床入りの作法を教えると言って迫ってきた村の女の一人を、{a}は祝言の床に押し倒した。女は驚いたように息を呑み、教えるはずの作法を忘れて、{a}の下で乱れた謡の節を漏らし続けた。',
'祝言の謡が、どこからともなく聞こえてきた夜、{x}は{y}の前に座り直した。二人は、誰に言われたわけでもなく、盃を交わした。|しろうどさまの婚礼の夜は、村の空気がどこか甘かった。{x}と{y}は、同じ部屋で、一組だけ敷かれた布団を見つめていた。');
G('tsuchigumo','やつかさまの夜','八束脛様',0.35,
'b:夜半、{a}の部屋の床板が、一枚ずつ外された。床下の闇から、異様に長い手足を持つものが這い出してきた。／八本の長い手足が、{a}の体を床下へ引きずり込んだ。暗い地下の巣で、糸に包まれた{a}の体を、神の長い指がゆっくりと探り回した。|r:{a}は縄で縛られ、地下の巣へ下ろされた。下りていくにつれて、糸が{a}の体に絡みついた。／巣の奥で、やつかさまが{a}を待っていた。糸で手足を広げられた{a}の体を、やつかさまは獲物を味わうように、何本もの脚で撫で回した。|d:夢の中で、{a}は蜘蛛の巣に絡め取られていた。巣の中心から、長い脚の神の影が近づいてきた。／影は{a}の体に糸を巻きつけながら、{a}の肌を何本もの脚でなぞった。{a}は身動きもできないまま、巣の振動に合わせて喘いだ。',
'翌朝、{a}の髪に、細い蜘蛛の糸が絡みついていた。|{a}の部屋の床板が、一枚だけ外れたままになっていた。',
'n:床板が外されかけた瞬間、{a}は床板を踏みつけて押さえ込んだ。床下で、何本もの脚が慌てたように引っ込んでいった。|n:地下の巣へ下ろされた{a}は、絡みつく糸を引き千切り、縄を伝って自力で這い上がった。',
'');
G('ama','いそごぜさまの夜','磯御前（海女たち）',0.35,
'v:夜の浜で、海女たちが{a}を取り囲んだ。濡れた髪の女たちが、楽しげに笑っていた。／海女たちは{a}を海へ連れ込み、白くふやけた指で{a}の体を弄んだ。海の中で、何本もの指が{a}の肌を這い、{a}は息もできないまま、もがき続けた。|r:{a}は海女たちの手で、海の底へ連れていかれた。いそごぜさまの御前だった。／海の底で、{a}は海女たちに体を開かれ、神の冷たい触手に差し出された。海女たちは、{a}が溺れないように時々息を吹き込みながら、それを見守っていた。|d:夢の中で、{a}は海女になっていた。海の底へ潜っていくと、神の白い手が{a}を待っていた。／白い手は{a}の体を撫で、開き、海の底の岩の上に横たえた。{a}は波の揺れに合わせて、何度も達した。',
'翌朝、{a}の体から、潮の匂いが消えなかった。|{a}の耳の奥に、海女たちの笑い声が、一日じゅう残っていた。',
'n:海へ連れ込もうとした海女たちの手を振りほどき、{a}は浜を駆け上がった。海女たちは、残念そうに波間へ消えていった。|x:取り囲んできた海女の一人を、{a}は砂浜に押し倒した。濡れた髪の海女は、{a}の下で、潮騒のように乱れた息をついた。',
'');
G('yatsume','八つ目様の夜','八つ目様',0.2,
'r:{a}は本殿の真ん中に立たされた。四方の壁に、八つの目が描かれていた。／描かれた神の目が、一斉に{a}を見た。見られた場所から、{a}の着物がはだけていった。八つの目は{a}の体の隅々を見つめ、見つめられた場所が、触れられたように熱く疼いた。|v:夜半、村人たちが{a}の部屋の障子に八つの穴を開けた。穴から、八つの目が覗いていた。／覗かれていることに気づいた{a}が逃げようとすると、障子が開いて村人たちが入ってきた。村人たちは{a}を押さえつけ、八つの目に見せるように、{a}の体をあらわにした。|d:夢の中で、{a}は八つの目に囲まれていた。／目の一つ一つが、{a}の体の違う場所を見つめていた。神に見られるだけで、{a}の体は熱を帯び、震え、何度も達した。',
'翌朝、{a}の肌に、目の形をした痣が八つ浮かんでいた。|{a}は一日じゅう、誰かに見られている気がして、落ち着かなかった。',
'n:八つの目が見つめてきた瞬間、{a}は壁の目を一つずつ睨み返した。目は、気まずそうに閉じていった。|n:障子に開けられた穴を、{a}は紙で塞いでいった。八つ目を塞ぎ終えたとき、外の気配は消えていた。',
'');
G('shiroi','ものみさまの夜','ものみさま',0.2,
'b:夜半、窓の外に、白い服の背の高い人影が立っていた。低い声が、{a}の名を呼んだ。／{a}が思わず返事をしてしまった瞬間、人影は窓を抜けて部屋に入ってきた。長い白い腕が{a}を抱え上げ、林の奥へ連れていった。林の暗がりで、白い神の影は{a}の体を、確かめるように撫で回した。|v:村人たちが、{a}の部屋の窓を開け放った。「＠ものみさまに、返事をしなされ」／{a}が拒むと、村人たちは{a}を押さえつけ、窓の外の白い影に見せるように{a}の着物をはだけた。窓の外から、低い声が響き続けた。|d:夢の中で、{a}は白い服の背の高い影と向かい合っていた。／影は{a}を見下ろし、長い腕で{a}を抱き寄せた。腕は{a}の体に何重にも巻きつき、{a}の体を、ゆっくりと確かめた。どこまでも高いところから、神が{a}を見下ろしていた。',
'翌朝、{a}の窓の外の地面に、異様に大きな足跡が残っていた。|{a}は一日じゅう、背後の高い場所から見下ろされている気がした。',
'n:窓の外の白い影が名を呼んでも、{a}は最後まで返事をしなかった。影は夜明けまで窓の外に立ち続け、朝になると消えていた。|n:窓を開け放とうとした村人たちの手を払いのけ、{a}は窓に雨戸を立てた。',
'');
G('tatari','ごりょうさまの夜','御霊大明神',0.2,
'p:夜半、{a}の体に、何かが入り込んできた。荒れ果てた祠に祀られた御霊の一つだった。／御霊は{a}の体を内側から動かし、{a}自身の手で{a}の体を撫でさせた。{a}は自分の体が自分のものでなくなっていくのを、恐怖の中で感じていた。神の怨みと渇きが、{a}の体を通して溢れ出した。|r:{a}は荒れ果てた祠の前に座らされた。村人たちが、怨みを鎮める祝詞を唱え始めた。／祠の中から、無数の御霊が{a}の体に群がってきた。御霊たちは{a}の体を代わる代わる使い、それぞれの怨みを晴らしていった。祝詞は、夜明けまで続いた。|d:夢の中で、{a}は無数の祠に囲まれていた。祠の一つ一つから、怨みの声が聞こえていた。／声は{a}の体に入り込み、{a}の体を内側から責め立てた。{a}は怨みの数だけ、体を震わせた。',
'翌朝、{a}は、自分のものではない記憶をいくつか覚えていた。|{a}の体には、誰かの手の形の痣が、いくつも残っていた。',
'n:体に入り込もうとした御霊を、{a}は大声で一喝して追い払った。祠の中で、怨みの声が一瞬だけ静まった。|n:祠の前に座らされた{a}は、祝詞を唱える村人を押しのけ、供えられた御神酒を祠そのものに浴びせた。',
'');
G('oshira','おしら様の夜','おしら様',0.35,
'v:夜半、村人たちが、布を何重にも着せた桑の木の人形を持って、{a}の部屋に来た。「＠おしら様あそびの夜じゃ」／村人たちは人形を{a}の肌に這わせ、馬と娘の悲恋の唄を歌いながら、{a}の体を人形で撫で回した。人形の布の下から、馬の毛のようなものがはみ出していた。|r:{a}は桑の木の下に連れていかれた。枝から、縄が下がっていた。／縄が{a}の腕に絡みつき、{a}を桑の木に吊るした。闇の中から、馬の頭をした神が現れ、吊るされた{a}の体に、鼻面を寄せた。{a}は吊るされたまま、馬の熱い息に体を撫で回された。|d:夢の中で、{a}は馬の背に乗っていた。馬は、{a}を乗せたまま空へ駆け上がった。／空の上で、馬は人の姿になり、{a}を抱き寄せた。馬と娘の悲恋をなぞるように、{a}は空の上で、馬の神に抱かれ続けた。',
'翌朝、{a}の髪に、馬の毛が何本も絡みついていた。|{a}の部屋の神棚に、桑の木の人形が一体増えていた。',
'n:{a}は肌に這わせようとした人形を取り上げ、神棚に戻して手を合わせた。村人たちは顔を見合わせ、何もせずに帰っていった。|x:おしら様あそびの夜、{a}は人形を持ってきた村人の手首を掴み、布団に押さえつけた。悲恋の唄は途切れ、村人は{a}の下で、唄とは違う声を漏らした。',
'おしら様あそびの唄が、夜通し聞こえていた。馬と娘の悲恋の唄を聞きながら、{x}は{y}の手を握った。{y}は、離されないように握り返した。');
G('kamikakushi','隠し神の夜','隠し神さま',0.25,
'b:竹林の中を歩いていた{a}は、いつのまにか、見たこともない里に迷い込んでいた。里の人々は、皆、顔がぼやけていた。／顔のない里人たちが{a}を取り囲み、隠れ里の婚礼の床へ連れていった。{a}は名前を奪われ、隠れ里の嫁として、顔のない人々に代わる代わる抱かれた。|r:{a}は竹林の奥へ送られた。竹の葉が、{a}の後ろで閉じていった。／隠れ里の奥で、隠し神さまが{a}を待っていた。神は{a}を抱き寄せ、{a}がもとの世界を忘れるまで、{a}の体を確かめ続けた。|d:夢の中で、{a}は竹林の奥の隠れ里にいた。／里の誰もが{a}を知っていて、誰もが{a}に触れたがった。{a}は一人ずつに抱かれ、そのたびに、自分の名前を一つずつ忘れていった。里の奥で、神が満足げに頷いていた。',
'翌朝、{a}は自分の名前を思い出すのに、少し時間がかかった。|{a}の靴に、竹の葉が何枚も入り込んでいた。',
'n:竹林で隠れ里に迷い込みかけた{a}は、自分の名を大声で唱えながら、来た道を引き返した。竹林は、悔しそうにざわめいた。|n:{a}は竹林の奥へ送られる前に、仲間の名を書いた紙を懐に入れていた。それを握りしめたまま、{a}は里の入口で踏みとどまった。',
'');
G('kodama','御神木の夜','御神木さま',0.35,
'r:{a}は御神木の洞に閉じ込められた。洞の中は、樹液の甘い匂いに満ちていた。／洞の内壁から、細い根が伸びてきて{a}の体に絡みついた。根は{a}の肌を這い、着物の下に潜り込み、{a}の体の奥まで探り当てた。神木の樹液が{a}の肌を濡らし、{a}は甘い匂いの中で、何度も身をよじった。|b:夜半、{a}の部屋の窓から、蔓が入り込んできた。／蔓は{a}の手足に巻きつき、{a}を窓の外へ引きずり出した。御神木の根元で、{a}は無数の蔓に包まれ、木の精たちに体を確かめられた。|d:夢の中で、{a}は御神木の枝に抱かれていた。／枝は{a}の体に絡みつき、葉が{a}の肌を撫でた。{a}は木の神の中に取り込まれながら、木の脈に合わせて達した。',
'翌朝、{a}の体から、樹液の甘い匂いがした。|{a}の手首に、細い根の跡が、腕輪のように巻きついていた。',
'n:御神木の洞に閉じ込められた{a}は、懐の小刀で根を断ち切り、洞の口をこじ開けて外へ出た。|n:窓から入り込んできた蔓を、{a}は窓ごと閉めて断ち切った。蔓の切れ端が、床の上でしばらく蠢いていた。',
'御神木の木漏れ日のような光が、夜なのに座敷に差し込んでいた。その光の中で、{x}は{y}の髪についた葉を払ってやった。指先が、そのまま{y}の頬で止まった。');
G('suiko','ひょうすべさまの夜','ひょうすべさま（河童）',0.3,
'b:夜の川辺で、{a}は水の中から伸びてきた水かきのある手に、足首を掴まれた。／毛むくじゃらの河童のような眷属が、{a}を川の中へ引きずり込んだ。冷たい水の中で、それは{a}の体を撫で回し、腰のあたりを執拗に探った。{a}は水を飲みながら、必死に川岸の石にしがみついた。|r:{a}は淵へ沈められた。「＠尻子玉を、抜いていただく」――村人たちが、淵の上から手を合わせていた。／淵の底で、ひょうすべさまが{a}を待っていた。水かきのある手が{a}の体を撫で回し、尻子玉を探るように、{a}の体を隅々まで確かめた。|v:きゅうりを抱えた村人たちが、夜半、{a}の部屋に来た。「＠ひょうすべさまへの供え物を、清めてもらう」／村人たちは{a}を押さえつけ、冷たいきゅうりで{a}の肌を撫で回した。下卑た笑い声が、部屋の外まで響いていた。',
'翌朝、{a}の体から、川の水の匂いがした。|{a}は一日じゅう、腰が抜けたように力が入らなかった。',
'n:足首を掴んだ水かきのある手を、{a}は石で叩いて振りほどいた。河童のような眷属は、甲高い声を上げて川の中へ逃げた。|n:淵に沈められかけた{a}は、自力で浮かび上がり、淵の縁にしがみついて這い上がった。',
'');
G('kurai','からみやさまの夜','空宮様',0.25,
'r:{a}は空の本殿に座らされた。「＠神さまのお名前を、呼びなされ」／{a}が呼んだ名前の形に、空の本殿の中の空気が固まっていった。形を得た神は、{a}の体に触れた。{a}が思い描いた姿のまま、神は{a}の体を確かめ続けた。|p:夜半、{a}の中に、何かが入り込んできた。形のない、空っぽの神だった。／空っぽの神は{a}の体を内側から満たし、{a}の欲望の形を探った。{a}は自分の体を自分で撫で回しながら、空っぽの神に、自分の形を教えていた。|d:夢の中で、{a}は何もない空間にいた。／何もない空間が、{a}の体を撫でた。何もないものに触れられて、{a}の体は、触れられた形に震えた。目が覚めると、空の本殿の神が、{a}の形を覚えていた。',
'翌朝、{a}は、昨夜呼んだ名前を思い出せなかった。|空の本殿に、昨夜はなかった影が一つ、座っていた。',
'n:神の名を呼べと言われた{a}は、口を閉ざしたまま、空の本殿を出た。本殿の中の空気は、形を得られずに霧散した。|n:体に入り込もうとした空っぽの何かを、{a}は自分の名を三度唱えて追い出した。',
'');
G('tsuki','さんやさまの夜','二十三夜様',0.3,
'r:{a}は月光の下に、一晩さらされた。村人たちが、月待ちの祈りを唱えていた。／月の光が、{a}の肌に降り注いだ。光は{a}の体を撫で、開き、満たしていった。{a}は月の光に体の隅々まで照らされ、月の神そのものに抱かれた。|v:二十三夜の月待ちの夜、村人たちが{a}を集会所に招いた。「＠月が昇るまで、皆で起きて待つのがしきたりだ」／月が昇るまでの長い夜、村人たちは{a}を囲み、退屈しのぎだと言って、{a}の体を撫で回した。月が昇ったとき、{a}はもう、何人目なのか数えられなかった。|d:夢の中で、{a}は月の上にいた。月は、{a}を抱くように白い光を放っていた。／月の光が{a}の体を包み、{a}は光の中で、何度も達した。光の奥で、月の神が{a}を見つめていた。',
'翌朝、{a}の肌が、月光のように白く透けていた。|{a}は一日じゅう、夜を待ちわびていた。そう気づいて、{a}はぞっとした。',
'n:月光の下にさらされた{a}は、月を見上げずに、地面を見つめ続けた。月の光は、{a}の背中を撫でるだけで、何もできなかった。|x:月待ちの夜、撫で回そうと寄ってきた村人の一人を、{a}は集会所の畳に押さえつけた。村人は、月が昇るのも忘れて、{a}の下で喘いだ。',
'満月でもないのに、月がやけに明るい夜だった。{x}と{y}は縁側で月を見上げていた。どちらからともなく、肩が触れ合った。|二十三夜の月の光が、座敷の畳を白く照らしていた。{x}は{y}の顔をその光の中で見つめ、そっと引き寄せた。');
G('sekai','ひながたさまの夜','雛形様',0.2,
'r:{a}の形をした人形が、箱庭の祭壇に置かれた。村人たちが、人形の着物を一枚ずつ脱がせていった。／人形の着物が脱がされるたびに、{a}の着物もひとりでにはだけていった。村人たちが人形を撫でると、{a}の体にも、同じ手の感触が走った。{a}は見えない手に、人形と同じように扱われた。|v:村人たちが、箱庭の中の小さな宿の屋根を外した。中に、{a}の部屋があった。／村人たちは、箱庭の中の{a}の人形を、指先で弄んだ。同じ時刻、{a}は自分の部屋で、見えない指に体を撫で回されていた。|d:夢の中で、{a}は箱庭の中の小さな人形になっていた。／巨大な神の指が、{a}の体を摘まみ、撫で、転がした。{a}は人形のまま、巨大な指に弄ばれ続けた。',
'翌朝、{a}は自分の体が、少しだけ小さくなったような気がした。|箱庭の中の{a}の人形が、昨夜とは違う姿勢で置かれていた。',
'n:箱庭の祭壇に置かれた自分の人形を、{a}は取り上げて懐にしまった。村人たちは、慌てて箱庭を覆い隠した。|n:箱庭の屋根を外そうとした村人たちの前で、{a}は箱庭の中の自分の人形を、別の場所へ移した。',
'');
function T(id,ty,vf,e){if(GN[id]){GN[id].ty=ty;GN[id].vf=vf;GN[id].E=L(e);}}
T('dagon','kemono','','鱗の浮いた腰が、寄せる波と同じ間合いで{a}に打ちつけられた。{s:hit}。ぬめる鰭が胸を擦るたびに、{a}の{乳首}は潮に洗われたように硬く尖った。|水かきのある指が{a}の{ナカ}を押し広げ、生臭い粘液を奥へ奥へと塗り込めた。{s:wet}。耳元で鰓がひくつくたびに、{a}の腰は勝手に跳ねた。');
T('cthulhu','ten','','吸盤の並んだ触腕が{a}の{乳首}に吸いつき、ちゅぽ、ちゅぽ、と音を立てて離れては吸い直した。眠る神の夢は、{a}の体のどこが弱いかを、とうに知り尽くしていた。|太い触腕が{a}の{ナカ}の奥でとぐろを巻き、脈を打つように膨らんだ。{s:wet}。夢の中なのに、腹の内側を押し上げられる感触だけが、ひどく生々しかった。');
T('hastur','ten','','黄衣の裾から伸びた触手が、{a}の{股間}に何重にも巻きつき、ほどけない結び目を作った。{s:wet}。結び目が締まるたびに、{a}の喉から引きつった声が漏れた。|黄衣の王の指が{a}の舌を摘まみ、もう片方の指が{ナカ}をゆっくりと掻き回した。{s:wet}。黒い星の光の下で、{a}の体は王の芝居の台本どおりに震えた。');
T('nyarla','hito','hito','影の手は数を増やし、{a}の{乳首}を、{尻}を、{股間}を、同時に責め立てた。{s:wet}。耳元では伝道師様の穏やかな声が、{a}の乱れようを、一つずつ丁寧に言葉にしていた。|伝道師様の顔が、一瞬ごとに別の誰かの顔に変わった。{a}がいちばん見たくない顔になったとき、{ナカ}を抉る指が、いちばん深く沈んだ。{s:wet}。');
T('yog','kei','','虹色の球体が{a}の{ナカ}に一つずつ押し込まれ、奥で溶け合って膨らんだ。{s:wet}。時間が飛ぶたびに、{a}は同じ絶頂の手前へ、何度も連れ戻された。|門の向こうから伸びた何かが、昨日の{a}と明日の{a}の体を同時に責めた。{s:hit}。二つの夜の快感が、いっぺんに{a}の腰へ流れ込んできた。');
T('ithaqua','shizen','','凍える風が{a}の{乳首}を舐め上げて硬く尖らせ、熱い吐息のように撫で下ろした。冷たさと熱さが交互に押し寄せ、{a}の{股間}はひくひくと震えた。|風は{a}の{ナカ}に吹き込み、内側から{a}を膨らませるように渦を巻いた。{s:wet}。雪の上に、{a}の吐く白い息だけが、途切れ途切れに散った。');
T('cthugha','shizen','','炎の舌が{a}の{股間}を舐め上げた。熱いのに焼けず、焼けないのに、そこだけが溶けていくように熱かった。{s:wet}。|光の粒が{a}の肌に降り注ぎ、{乳首}と{股間}にだけ群がって、ちりちりと火花を散らした。{a}の腰は、火の粉を払うように何度も跳ね上がった。');
T('tsathoggua','ten','','不定形の黒い塊が{a}の下半身をすっぽりと包み込み、ぬるい内側で、咀嚼するようにゆっくりと揉みしだいた。{s:wet}。塊の中で、{a}の脚がびくびくと痙攣した。|毛むくじゃらの巨体の重みが{a}にのしかかり、生ぬるい粘液が{ナカ}の奥まで流れ込んだ。{s:wet}。眠気と快感が混ざり合い、{a}の抵抗はとろりと溶けていった。');
T('gatano','hito','','鏡の中の灰色の手が{a}の{ナカ}を掻き回すと、鏡の外の{a}の腰が、同じ形にくねった。{s:wet}。{a}は、鏡に映る自分の蕩けた顔から、目を逸らすことを許されなかった。|鏡に映る{a}は、自分から脚を開いていた。気づけば、鏡の外の{a}も同じ格好をさせられていた。{s:wet}。灰色の指が、鏡のこちら側の{股間}を撫で上げた。');
T('nyogtha','ten','','粘つく黒い流れが{a}の{ナカ}に入り込み、奥で形を変えて膨らんだ。{s:wet}。闇は、{a}が一番感じる形を探り当てるまで、何度でも形を変え続けた。|黒い流れは{a}の肌の上で無数の舌になり、{乳首}も{股間}も同時に舐め回した。{s:suck}。穴の底の温かさが、{a}の体の芯まで染み込んでいった。');
T('glaaki','ten','','金属のような棘が{a}の肌にちくりと刺さり、そこから甘い痺れが全身へ広がった。痺れの中で{股間}だけが熱く疼き、{a}は腰を浮かせて喘いだ。|棘の先から冷たい液が流し込まれるたびに、{a}の体は湖の主の僕に近づいていった。{s:wet}。{ナカ}を擦られる感覚だけが、死人の冷たさの中で燃えていた。');
T('quachil','hito','','骨の指が{a}の{ナカ}をなぞるたびに、触れられた場所の時間が早回しになった。{s:wet}。一瞬で何度も高みへ連れていかれ、{a}は息の仕方を忘れた。|骨の指が、若い肌の張りを味わうように{a}の{尻}を揉みしだいた。{s:wet}。{a}が達するたびに、宙に舞う塵がきらきらと光った。');
T('byatis','ten','','蛇のような髭の一本一本が、{a}の{乳首}に、{股間}に、{後ろ}に吸いつき、思い思いの速さで責め立てた。{s:wet}。一つ目が、扉の隙間から{a}の顔をじっと見ていた。|太い髭が{a}の{ナカ}に潜り込み、奥でうねった。{s:wet}。扉を開ければもっとよくしてやる――その囁きに頷きかけた自分に、{a}はぞっとした。');
T('rlyeh_child','ten','','黒い肉の襞が{a}の体を包み込み、内側でいっせいに脈を打った。{s:wet}。襞の奥の小さな口が、{乳首}にも{股間}にも、ちゅうちゅうと吸いついた。|黒い仔の柔らかい触手が、母を確かめるように{a}の{ナカ}の奥を探った。{s:wet}。仔が増えるたびに、{a}の中を探る触手も増えていった。');
T('rhan','ten','','氷のように冷たい触肢が{a}の{ナカ}に滑り込み、内側から熱を吸い上げた。{s:wet}。冷たいのに、触れられた奥だけがじんじんと痺れ、{a}の腰は勝手に揺れた。|吸盤のような口が{a}の首筋から胸へ、胸から{股間}へと、血の温かさを辿って吸いついていった。{s:suck}。吸われた跡が、氷の花のように白く浮いた。');
T('ghatanothoa2','kemono','','獣の熱い息が{a}のうなじに吹きかかり、背後から獣の重みが何度も{a}を突き上げた。{s:hit}。苔の上で、{a}は四つ這いのまま、獣の交わりの形を体に刻まれた。|角の冠が{a}の頭に食い込み、森の奥から、蹄の音と熱い息が近づいてきた。{s:hit}。{a}は女神の季節の獣として、何度も何度も、奥まで満たされた。');
T('mordiggian','hito','','屍の神の冷たい指が、死体を検めるように{a}の{股間}を開き、{ナカ}の熱を確かめた。{s:wet}。生きている証のように、{a}の奥はびくびくと指を締めつけた。|腐臭と香の匂いの中で、{a}は棺に横たえられたまま、冷たい手に何度も奥を暴かれた。{s:wet}。死んだもののはずの体が、生きているもののように跳ねた。');
T('ygolonac','hito','','掌の口が{a}の{股間}にすっぽりと吸いつき、濡れた舌で舐め回した。{s:suck}。もう片方の掌の口は、{a}の{乳首}を甘噛みしては吸い上げていた。|掌の口の舌が{a}の{ナカ}に潜り込み、内側から舐め回した。{s:wet}。口は{a}の名前を呼びながら、{a}が一番恥ずかしい声を出すまで、舌を止めなかった。');
T('hakuja','hebi','vf','白蛇の冷たい鱗が{a}の{股間}を擦り上げ、二股の舌がちろちろと{乳首}をくすぐった。{s:wet}。蛇がとぐろを締めるたびに、{a}の体は甘く軋んだ。|白蛇の頭が{a}の{ナカ}に潜り込み、奥でゆっくりと身をくねらせた。{s:wet}。腹の内側で蛇が動くたびに、{a}は白い喉を反らせた。');
T('kubinashi','hito','','冷たい石の指が、首から下は村のものだと確かめるように、{a}の{股間}を撫で回した。{s:wet}。首から上だけが拒み続け、首から下は、とうに応えていた。|石の手は{a}の首を掴んだまま、{a}の{尻}を割り開いた。{s:hit}。石のように冷たく硬いものを奥まで押し込まれ、{a}の腰は勝手に突き出された。');
T('kakashi','hito','','藁の指が着物の下で{a}の{乳首}をちくちくと擦り、乾いた藁の束が{股間}を何度も撫で上げた。{s:wet}。くすぐったさは、すぐに耐えがたい疼きに変わった。|案山子の藁の腕の中で、{a}の{ナカ}に、硬く節くれたものが押し込まれた。{s:hit}。田の実りを確かめるように、それは{a}の奥を何度も突いた。');
T('ryujin','hebi','','竜の頭の一つが{a}の胸を、もう一つが{股間}を、もう一つが{後ろ}を舐め上げた。{s:suck}。八つの舌がばらばらの速さで動くので、{a}は身構えることもできなかった。|鱗に覆われた長い胴が{a}の体を締め上げ、脈打つものを{ナカ}の奥まで押し込んだ。{s:hit}。滝の音に負けないほどの声が、{a}の喉から迸った。');
T('imigui','hito','','巨大な舌が{a}の{股間}をべろりと舐め上げ、罪を数えるように何度も往復した。{s:suck}。{a}が達するたびに、口は満足げに唾液を滴らせた。|神の舌先が{a}の{ナカ}をこじ開け、内側の罪まで舐め取ろうとした。{s:wet}。罪は、いつまでも尽きなかった。快感も、尽きなかった。');
T('mayu','ten','vf','蚕の吐く糸が{a}の{乳首}と{股間}に絡みつき、細く、きつく締めつけた。{s:wet}。糸が引かれるたびに、{a}の腰は甘く跳ねた。|繭の内側で、柔らかい何かが{a}の{ナカ}に潜り込み、奥でゆっくりと糸を吐いた。{s:wet}。{a}は、蚕が桑を食む音を聞きながら達した。');
T('fuchi','hebi','','淵の大君の長い髭が{a}の手足を縛り、白無垢の裾から潜り込んで{股間}を撫で回した。{s:wet}。冷たい水の中で、そこだけが燃えるように熱かった。|水底の御殿の褥で、冷たく太いものが{a}の{ナカ}を押し広げた。{s:hit}。{a}の吐いた泡が、喘ぐたびに水面へ昇っていった。');
T('chibiki','kemono','','千本の引き綱がじりじりと引かれ、{a}の脚は限界まで開かされた。{s:hit}。闇の中から獣の熱い息が近づき、何かが{a}の奥まで押し入ってきた。|腐り落ちた毛皮の腕が{a}の腰を抱え込み、轟音とともに突き上げた。{s:hit}。声を出してはならない夜に、{a}の喉からは声が溢れて止まらなかった。');
T('shijima','kei','','白い影は音もなく{a}の{ナカ}を掻き回した。{s:wet}。水音だけが、静まり返った社の中で、いやらしく響き続けた。|影の指が{a}の{乳首}を摘まみ、{股間}を擦った。声を出せない{a}の代わりに、体だけがびくびくと跳ねて応えていた。');
T('mekura','hito','hito','目隠しの闇の中で、木の香りのする指がツボを押すたびに、{a}の{股間}がじんと痺れた。{s:wet}。どこを触られるのか分からないせいで、{a}の体はいつもの倍も敏感になっていた。|硬い指が{a}の{ナカ}の弱いところを探り当て、病を揉み出すように押し続けた。{s:wet}。{a}は目隠しの下で、涙を滲ませて喘いだ。');
T('madara','hito','vf','肌の斑点が一つずつ脈を打ち、{乳首}と{股間}のまわりに集まって疼いた。{s:wet}。女神の舌が斑を数えるたびに、{a}の腰はびくんと跳ねた。|斑の女神の指が、{a}の{ナカ}に斑を植えるように押し込まれた。{s:wet}。内側から斑が広がっていく感覚に、{a}は涙を流して身をよじった。');
T('ajiro','hito','','白くふやけた千の手が{a}の体の至るところを掴み、網の目から{股間}を、{乳首}を、{尻}を、引き出すように揉みしだいた。{s:wet}。湖の冷たさの中で、{a}の体だけが火照っていった。|戸板に抱き寄せられた{a}の{ナカ}に、ふやけた指が何本も沈んでいった。{s:wet}。腐臭と水音の中で、{a}の腰はびくびくと跳ねた。');
T('hiruko','ten','','骨のない柔らかいものが{a}の{ナカ}にぬるりと流れ込み、奥でふくらんだ。{s:wet}。それは{a}の中で形を探すように、ゆっくりとうねり続けた。|柔らかい寄り神は{a}の全身に貼りつき、{乳首}にも{股間}にも吸いついた。{s:suck}。波の音に合わせて、吸いつく強さが変わった。');
T('akatsuchi','shizen','','脈打つ赤土が{a}の{ナカ}に入り込み、奥で温かく固まっていった。{s:wet}。土の脈と{a}の脈が重なり、{a}の腰は土に合わせて揺れた。|神の土が{a}の胸を揉みしだき、{股間}を包み込んで、ゆっくりと締めつけた。{s:wet}。赤く染まった肌の下で、{a}の体は何度も熱を吐いた。');
T('kuchisake','hito','hito','耳まで裂けた口が{a}の{股間}にすっぽりと吸いつき、黒い歯が甘く食い込んだ。{s:suck}。あたし、きれい？――問いの答えの代わりに、{a}の喉から喘ぎが漏れた。|裂けた口の長い舌が{a}の{ナカ}を舐め回し、黒い歯が{乳首}を甘噛みした。{s:wet}。間違えた答えの数だけ、責めは長く続いた。');
T('dorogami','shizen','vf','泥の中から伸びた柔らかい腕が{a}の{股間}を包み込み、温かい泥ごと擦り上げた。{s:wet}。泥田に沈む体が、ずぶずぶと音を立てた。|温かい泥が{a}の{ナカ}に流れ込み、奥でずしりと重くなった。{s:wet}。泥の中の神は、{a}を田植えの苗のように、深く深く植えつけていった。');
T('shinigami','hito','','むかえさまの冷たい指が、帳面を読み上げるように{a}の体を一つずつ数え、数え終えた場所から順に{ナカ}の奥を暴いていった。{s:wet}。|冷たい腕の中で、{a}は黄泉の冷たさと、奥を突かれる熱さを同時に味わった。{s:hit}。数え終わるまで、帰してはもらえなかった。');
T('hanayome','hito','vf','花嫁の冷たい肌が{a}の{股間}にぴたりと重なり、ゆっくりと擦りつけられた。{s:wet}。綿帽子の陰で、白い唇が笑っていた。|三三九度の酒が{a}の胸に注がれ、花嫁の白い舌がそれを舐め取っていった。{s:suck}。舌は{乳首}で止まり、{a}が身をよじるまで離れなかった。');
T('tsuchigumo','kemono','','八本の長い手足が{a}の脚を大きく広げて糸で巣に留め、残りの脚で{股間}と{乳首}を同時に弄った。{s:wet}。巣が揺れるたびに、{a}の体も揺さぶられた。|糸で吊るされた{a}の{ナカ}に、長い脚の先がゆっくりと潜り込んでいった。{s:wet}。獲物の味を確かめるように、それは奥で何度も節を曲げた。');
T('ama','ten','vf','冷たい手が{a}の脚を左右から開かせ、神の触手が、その奥へずぶずぶと沈んでいった。{s:wet}。波の下で、くすくす笑う女たちの声がした。|白くふやけた指が{a}の{股間}を弄び、海の水ごと{ナカ}を掻き回した。{s:wet}。潮が引くたびに、{a}の声が浜に響いた。');
T('yatsume','kei','','八つの目が、{a}の{乳首}を、{股間}を、{尻}を、それぞれ見つめた。見られた場所が、触れられたように熱く疼いた。{s:wet}。誰にも触れられていないのに、{a}の腰はがくがくと震えた。|視線は{a}の{ナカ}の奥にまで届いた。{s:wet}。見られるだけで達してしまう体にされていくのが、{a}にははっきりと分かった。');
T('shiroi','hito','','長い腕が{a}の体に何重にも巻きつき、締めつけるたびに胸と{股間}を擦り上げた。{s:wet}。窓の外から、低い声が{a}の名を呼び続けていた。|背の高い影が{a}を抱え上げ、長い指を{a}の{ナカ}の奥まで沈めた。{s:wet}。返事をしたのはお前だ、と影は言いたげだった。');
T('tatari','kei','','御霊たちが代わる代わる{a}の体に入り込み、内側から{a}の{ナカ}を掻き回した。{s:wet}。怨みの声と{a}の喘ぎが、一つの口から交互に漏れた。|内側から責め立てる怨みの熱が、{a}の{股間}に集まって脈を打った。{s:wet}。{a}は、御霊の怨みの数だけ、達することを強いられた。');
T('oshira','hito','','布を着せた桑の人形が{a}の{股間}に押し当てられ、馬と娘の悲恋の唄に合わせて擦りつけられた。{s:wet}。唄の節が変わるたびに、{a}の腰は跳ねた。|馬の頭をした神が、吊るされた{a}の腰を抱え込み、獣の熱で奥まで突き上げた。{s:hit}。桑の枝が軋むたびに、{a}の声が闇に吸い込まれた。');
T('kamikakushi','hito','','顔のない誰かが{a}の{ナカ}を確かめるたびに、{a}は自分の名前を一つ忘れた。{s:wet}。忘れるほどに、体は素直に応えていった。|ぼやけた顔の誰かが{a}の{乳首}を吸い、別の誰かが{股間}を撫で上げた。{s:suck}。誰に何をされているのか、{a}にはもう分からなかった。');
T('kodama','ten','','細い根が{a}の{ナカ}に潜り込み、奥で枝分かれして広がった。{s:wet}。甘い樹液が溢れるたびに、{a}の腰は木の脈に合わせて震えた。|蔓が{a}の{乳首}に巻きつき、葉の縁が{股間}を擦った。{s:wet}。御神木の洞の中で、{a}の体は根ごと神に呑まれていった。');
T('suiko','kemono','','水かきのある指が{a}の{後ろ}をこじ開け、尻子玉を探るように奥まで潜り込んだ。{s:wet}。冷たい川の水の中で、{a}の腰は勝手に跳ね上がった。|毛むくじゃらの眷属は{a}を岩に押しつけ、背後から何度も腰を叩きつけた。{s:hit}。水しぶきと一緒に、{a}の声が川面に散った。');
T('kurai','kei','','形を得た神は、{a}が思い描いた姿のまま、{a}の{ナカ}を満たしていった。{s:wet}。思い描いた形が淫らであるほど、それは{a}の奥で深く脈打った。|空っぽの神は{a}の欲望の形を探り当て、その形そのものになって{a}を責めた。{s:hit}。{a}は、自分の望みそのものに組み敷かれていた。');
T('tsuki','shizen','','月の光が{a}の{乳首}を撫で、{股間}を照らし、奥まで差し込んできた。{s:wet}。光に触れられた場所が、一つ残らず甘く痺れた。|月の光が{a}の{ナカ}の奥まで差し込み、内側から{a}を白く照らした。{s:wet}。光の奥で、月の神が{a}の乱れる顔を見つめていた。');
T('sekai','kei','kei','見えない指が、人形の脚を開くように、{a}の脚をそっと割り開いた。{股間}をなぞる指先の感触は、ひどく大きかった。{s:wet}。|巨大な指が{a}の{ナカ}を、人形を弄ぶようにこりこりと弄った。{s:wet}。同じ時刻、{a}の腰は布団の上でがくがくと跳ねていた。');
})();
});
;
HK.Load.def(509.5,'tone:scen-jashin',function(){
HK.Load.toneData("mixed",{"F":[
["ここでは、ただの人でいい","ここでは、ただの人でいいんですよ"],
["なら、書き換えればいい","なら、書き換えればいいんですよ"],
["いそごぜさまは、男を海へ連れていきなさる","いそごぜさまは、男を海へ連れていくんです"],
["ヒキガエルの神なら、火を嫌うはずだ。この村ごと――せめて神社の脇の家を焼けば、出てこられなくなる","ヒキガエルの神なら、火を嫌うはずです。この村ごと――せめて神社の脇の家を焼けば、出てこられなくなる……と思う",1],
["仕掛け人さん、演技うまいなあ","仕掛け人さん、演技うまいなあ。本物かと思いましたよ",1],
["この字は神の名だ","この字は神の名前です",1],
["そういうの、今はいい","そういうの、今はいいです",1],
["お前のせいで、こんな村に来たんだ！","あなたのせいで、こんな村に来たんですよ！",1],
["毎年、同じ日だ","毎年、同じ日です",1],
["神さまは怠け者でな。供物が足りんと、起きて自分で探しに来なさる","神さまは怠け者でしてね。供物が足りないと、起きて自分で探しに来るんだって",1]],
"O":{
"こんなのただの石だろ":"こんなの、ただの石でしょう。拾ってどうすんの",
"あんた、前にも来たね":"あなた、前にも来ましたよね。覚えてるよ",
"生贄なら、〈〉がいい。あいつは、村の秘密を嗅ぎ回ってる":"生贄なら、〈〉さんがいいです。あの人、村の秘密を嗅ぎ回ってるし",
"迷信だって証明してやる":"迷信だって証明してみせます。見ててよ",
"犯人は、民宿の女将さんです":"犯人は、民宿の女将さんです。間違いないって",
"次の作品の主人公のモデルになってくれないか":"次の作品の主人公のモデル、なってくれません？",
"推理は、生きて帰ってからだ":"推理は、生きて帰ってからです。死んだら元も子もないじゃん",
"この事件の謎は、すべて解けました":"この事件の謎は、すべて解けました。聞いてくれる？",
"犯人は村の誰か一人ではありません。村ぐるみです":"犯人は村の誰か一人じゃないです。村ぐるみなんだよ",
"一緒に遊ぼう":"一緒に遊びましょうよ。退屈なんだもん",
"犯人は、ひとつだけミスをしています":"犯人は、ひとつだけミスしてるんですよ",
"三つ、嘘がありましたね":"三つ、嘘がありましたね。三つも",
"なるほど。この村では最近、人が死んでいますね":"なるほど。この村では最近、人が死んでますね",
"この人が、今年の――":"この人が、今年の――",
"同業者として言わせてもらいますが、それは悪手です":"同業者として言わせてもらいますけど、それ、悪手だよ",
"……撮ってる場合じゃない":"……撮ってる場合じゃないです。ほら、逃げるよ",
"……あの祭り、私なら、もっと上手くやれる":"……あの祭り、私なら、もっと上手くやれます。絶対だよ",
"……今は、生き延びるのが先だ":"……今は、生き延びるのが先です。話はあとでね",
"封じる？　もったいない":"封じるんですか？　もったいないじゃん",
"ふむ。この名探偵の目は誤魔化せませんよ":"ふむ。この名探偵の目は誤魔化せませんよ。甘いね",
"〈〉の居場所を教える。だから、私だけは見逃してくれ":"〈〉の居場所を教えます。だから、私だけは見逃してよ",
"一緒に配信出ない？　絶対映えるって":"一緒に配信出ませんか？　絶対映えるって",
"……ごめん。今は、自分が生き残らないと":"……ごめんなさい。今は、自分が生き残らないと",
"これ一つで、全部返せる":"これ一つで、全部返せます。すごいでしょ",
"……神さんが、起きなさる":"……神さんが、起きなさる。……来ますよ",
"〈〉さんは、実は村人の変装なんです！":"〈〉さんは、実は村人の変装なんです！　気づかなかった？",
"ひながたさまは、村を作って、遊んでおられる":"ひながたさまは、村を作って、遊んでおられます。……楽しそうだよ",
"おにいちゃん、こっち。お母さんが待ってるよ":"おにいちゃん、こっちです。お母さんが待ってるよ",
"何を言ってる！　それは、封じる言葉じゃない！":"何を言ってるんですか！　それは、封じる言葉じゃないよ！",
"全部分かってるんですよ！　観念しなさい！":"全部分かってるんですよ！　観念しなよ！",
"……これで、返せる":"……これで、返せます。やっとだよ",
"今のはオフレコね":"今のはオフレコでお願いしますね。絶対だよ",
"あなたのことは、私が祈っておきます":"あなたのことは、私が祈っておきます。だから安心してよ",
"この飴の包み紙……間違いない、あなたが犯人だ！":"この飴の包み紙……間違いありません、あなたが犯人だよ！",
"……お前が、売ったのか":"……あなたが、売ったんですか。信じてたのに",
"二度と戻ってくるな":"二度と戻ってこないでください。顔も見たくないよ",
"……封じるより、従わせる方が確実だ":"……封じるより、従わせる方が確実です。簡単だよ",
"黒い岩さまは、海の底の兄弟と話していなさる":"黒い岩さまは、海の底の兄弟と話していなさる。……聞こえますよ",
"その説には三つ穴があります。――〈〉さんは犯人ではありません":"その説には三つ穴があります。――〈〉さんは犯人じゃないよ",
"おしら様は、遊ばせてやらにゃ怒りなさる":"おしら様は、遊ばせてやらにゃ怒りなさる。……本当ですよ",
"気休めじゃない。本物の結界だ":"気休めじゃないです。本物の結界だよ",
"……計画は、後回しだ":"……計画は、後回しです。今はそれどころじゃないよ",
"これ、何。……村と取引したの？":"これ、何ですか。……村と取引したの？",
"はちだいさまは、若い命と引き換えに雨をくださる":"はちだいさまは、若い命と引き換えに雨をくださる。……昔からそうなんですよ",
"かけさまは、自分の首を探しておられる":"かけさまは、自分の首を探しておられます。……近くにいるかもね",
"動かし方なんて知らない。でも、やるしかない":"動かし方なんて知らないです。でも、やるしかないじゃん",
"いいものを見つけた":"いいものを見つけました。見てよ、これ",
"八つ目様は、全部を見ておられる":"八つ目様は、全部を見ておられます。隠れても無駄だよ",
"神さまは眠っておられる。血を絶やせば、死んでしまわれる":"神さまは眠っておられます。血を絶やせば、死んでしまわれるんだよ",
"……戻ったら、ちゃんと言うつもりだった。でも、今言う。好きだ":"……戻ったら、ちゃんと言うつもりでした。でも、今言う。好きだ",
"そほどさまは、田を守ってくださる。よそ者から":"そほどさまは、田を守ってくださるんです。よそ者からね",
"……悪い。連れて行けない":"……すみません。連れて行けないよ",
"明日死ぬかもしれないなら、今言わせて。好きなんだ":"明日死ぬかもしれないなら、今言わせてください。好きなんだ",
"愚かだな。私なら、全員を助けられたかもしれないのに":"愚かですね。私なら、全員を助けられたかもしれないのに",
"やはり！　私の推理と同じだ！":"やはり！　私の推理と同じです！　さすが私だね",
"一緒に帰ろう。……今度は、置いていかない":"一緒に帰りましょう。……今度は、置いていかないよ",
"……生贄は、あいつにしてもらえばいい。同じ顔なんだ、神さまも気づかない":"……生贄は、あいつにしてもらえばいいです。同じ顔なんだ、神さまも気づかないよ",
"怖いから、一緒に寝てもいい？":"怖いんです。一緒に寝てもいい？",
"……今だけ、何も考えさせないで":"……今だけ、何も考えさせないでください。お願いだよ",
"悪いな。私は、生き残る方を選ぶ":"すみませんね。私は、生き残る方を選ぶよ",
"もう少しで、会える":"もう少しで、会えます。……待っててね",
"すまない。だが、これで皆が助かる":"すみません。でも、これで皆が助かるんだよ",
"――カルコサだ。湖の向こうに、カルコサが見える":"――カルコサです。湖の向こうに、カルコサが見えるよ",
"平気だよ。少し道に迷っただけだよ":"平気ですよ。少し道に迷っただけだよ",
"……村の連中のせいにすればいい":"……村の連中のせいにすればいいです。簡単でしょ",
"何やってるんだ！　それ、呼び出す方の言葉だろ！":"何やってるんですか！　それ、呼び出す方の言葉じゃん！",
"生きて帰れたら……いや、今言う。付き合ってほしい":"生きて帰れたら……いや、今言います。付き合ってほしいな",
"気持ちは嬉しい。でも、今は考えられない":"気持ちは嬉しいです。でも、今は考えられないよ",
"呼ばれてるんだ。行かなきゃ":"呼ばれてるんです。行かなきゃ"}});
HK.Load.toneData("stern",{"F":[
["あんた、前にも来たね","お前、前にも来たな"],
["今のはオフレコね","今のはオフレコだ"],
["前だけ見て","前だけ見ろ"],
["その目で私の嘘も見える？","その目で私の嘘も見えるのか？"],
["ヒキガエルの神なら、火を嫌うはずだ。この村ごと――せめて神社の脇の家を焼けば、出てこられなくなる","ヒキガエルの神ならば、火を嫌うはずだ。この村ごと――せめて神社の脇の家を焼けば、出てこられなくなる",1],
["ここの堰が、何十年も前に埋められてる。雨が降らないんじゃない。水が来なくなっただけだ","ここの堰が、何十年も前に埋められている。雨が降らぬのではない。水が来なくなっただけだ",1],
["神さまは怠け者でな。供物が足りんと、起きて自分で探しに来なさる","神は怠け者でな。供物が足りんと、起きて自ら探しに来られる",1],
["〈〉の居場所を教える。だから、私だけは見逃してくれ","〈〉の居場所を教える。だから、私だけは見逃してくれ",1],
["生贄なら、〈〉がいい。あいつは、村の秘密を嗅ぎ回ってる","生贄なら、〈〉がいい。あの者は、村の秘密を嗅ぎ回っている",1],
["犯人は村の誰か一人ではありません。村ぐるみです","犯人は村の誰か一人ではない。村ぐるみだ",1],
["はちだいさまは、若い命と引き換えに雨をくださる","はちだいさまは、若い命と引き換えに雨をくださる",1],
["――カルコサだ。湖の向こうに、カルコサが見える","――カルコサだ。湖の向こうに、カルコサが見える",1],
["なるほど。この村では最近、人が死んでいますね","なるほど。この村では近頃、人が死んでいるな",1],
["湖の主さまに選ばれた者は、永遠に生きられる","湖の主さまに選ばれし者は、永遠に生きられる",1],
["怖いから、一緒に寝てもいい？","……怖い。一緒に寝てもいいか",1],
["全部分かってるんですよ！　観念しなさい！","全部分かっているんだ！　観念しろ！",1],
["おかしいの、体が……","おかしい、体が……",1]]});
HK.Load.toneData("tsun_n",{"F":[
["今のはオフレコね","今のはオフレコだから"],
["なるほど。この村では最近、人が死んでいますね","なるほど。この村じゃ最近、人が死んでるわけか",1],
["――カルコサだ。湖の向こうに、カルコサが見える","――カルコサだ。湖の向こうに、カルコサが見える",1],
["〈〉さんは、実は村人の変装なんです！","〈〉さんは、実は村人の変装だ",1],
["〈〉の居場所を教える。だから、私だけは見逃してくれ","〈〉の居場所を教える。だから、私だけは見逃してくれ",1],
["おにいちゃん、こっち。お母さんが待ってるよ","おにいちゃん、こっちだ。お母さんが待ってる",1],
["この事件の謎は、すべて解けました","この事件の謎は、すべて解けた",1],
["この村、絶対なんかありますよね！","この村、絶対なんかあるな",1],
["これ、ドッキリでしょ？　誰の仕込み？","これ、ドッキリだろ。誰の仕込みだ？",1],
["ひながたさまは、村を作って、遊んでおられる","ひながたさまは、村を作って、遊んでおられる",1],
["ふむ。この名探偵の目は誤魔化せませんよ","ふん。この名探偵の目は誤魔化せない",1],
["ヒキガエルの神なら、火を嫌うはずだ。この村ごと――せめて神社の脇の家を焼けば、出てこられなくなる","ヒキガエルの神なら、火を嫌うはずだ。この村ごと――せめて神社の脇の家を焼けば、出てこられなくなる",1],
["湖の主さまに選ばれた者は、永遠に生きられる","湖の主さまに選ばれた者は、永遠に生きられる",1],
["犯人は、ひとつだけミスをしています","犯人は、ひとつだけミスをしている",1],
["犯人は村の誰か一人ではありません。村ぐるみです","犯人は村の誰か一人じゃない。村ぐるみだ",1],
["生きて帰れたら、一緒にいてほしい","生きて帰れたら、一緒にいてほしい",1],
["生贄なら、〈〉がいい。あいつは、村の秘密を嗅ぎ回ってる","生贄なら、〈〉がいい。あいつは、村の秘密を嗅ぎ回ってる",1],
["種明かしのとき、またよろしくお願いしますね","種明かしのときも、よろしく頼む",1],
["蛇を殺した者は、蛇の父さまに呪われる","蛇を殺した者は、蛇の父さまに呪われる",1],
["すまない。だが、これで皆が助かる","すまない。……だが、これで皆が助かる",1],
["みいさんは、嫁を一人ずつ娶りなさる","みいさんは、嫁を一人ずつ娶りなさる",1],
["一緒に帰ろう。……今度は、置いていかない","一緒に帰ろう。……今度は、置いていかない",1],
["神さまは怠け者でな。供物が足りんと、起きて自分で探しに来なさる","神さまは怠け者でな。供物が足りんと、起きて自分で探しに来なさる",1],
["おかしいの、体が……","おかしいんだ、体が……",1]]});
HK.Load.toneData("gyaru",{"F":[
["――カルコサだ。湖の向こうに、カルコサが見える","――カルコサじゃん！　湖の向こうに、カルコサ見えるんだけど！",1],
["……あの印を刻んだのは、あんただな","……あの印刻んだの、あんたでしょ",1],
["〈〉さんは、実は村人の変装なんです！","〈〉さん、実は村人の変装なんだって！",1],
["〈〉の居場所を教える。だから、私だけは見逃してくれ","〈〉の居場所教えるから！　だから私だけは見逃してってば！",1],
["おにいちゃん、こっち。お母さんが待ってるよ","おにいちゃん、こっちこっち！　お母さん待ってるよ！",1],
["この事件の謎は、すべて解けました","この事件の謎、ぜーんぶ解けちゃった！",1],
["この村、絶対なんかありますよね！","この村、ぜったいなんかあるって！",1],
["ひながたさまは、村を作って、遊んでおられる","ひながたさまは村を作って遊んでる……ってマジ？",1],
["ふむ。この名探偵の目は誤魔化せませんよ","ふふん、この名探偵の目は誤魔化せないし〜！",1],
["ヒキガエルの神なら、火を嫌うはずだ。この村ごと――せめて神社の脇の家を焼けば、出てこられなくなる","ヒキガエルの神なら、火とか絶対ムリなはず！　村ごと――せめて神社の脇の家燃やせば、出てこれなくなるって！",1],
["湖の主さまに選ばれた者は、永遠に生きられる","湖の主さまに選ばれたら、永遠に生きられるんだって！　ヤバくない？",1],
["犯人は、ひとつだけミスをしています","犯人、ひとつだけミスってるんだよね〜",1],
["犯人は村の誰か一人ではありません。村ぐるみです","犯人、村の誰か一人じゃないって。村ぐるみじゃん",1],
["生きて帰れたら、一緒にいてほしい","生きて帰れたら、一緒にいてほしいな",1],
["種明かしのとき、またよろしくお願いしますね","種明かしのときも、またよろしくね〜！",1],
["蛇を殺した者は、蛇の父さまに呪われる","蛇殺したら、蛇の父さまに呪われるんだって！",1],
["なるほど。この村では最近、人が死んでいますね","なるほどね〜。この村、最近人が死んでるんだ",1],
["みいさんは、嫁を一人ずつ娶りなさる","みいさんって、嫁を一人ずつ娶るんだって！",1],
["一緒に帰ろう。……今度は、置いていかない","一緒に帰ろ。……今度は置いてかないから",1],
["神さまは怠け者でな。供物が足りんと、起きて自分で探しに来なさる","神さまって怠け者なんだって。供物足りないと、起きて自分で探しに来るらしいよ",1],
["あんた、前にも来たね","あんた、前にも来たよね"],
["同業者として言わせてもらいますが、それは悪手です","同業者として言わせてもらうけど、それマジで悪手だよ"],
["推理は、生きて帰ってからだ","推理は、生きて帰ってからね"],
["三つ、嘘がありましたね","嘘、三つあったよね"],
["明日死ぬかもしれないなら、今言わせて。好きなんだ","明日死ぬかもしれないなら、今言わせて。好きなの"],
["夕暮れに遊んでいる子は、隠し神さまに連れていかれる","夕暮れに遊んでる子は、隠し神さまに連れてかれるんだって"],
["……今は、生き延びるのが先だ","……今は、生き延びるのが先だし"],
["この人に用があるなら、先にこっちが聞く","この人に用があるなら、先にこっちが聞くし"],
["……こんなときに言うことじゃないって、分かってる。でも、好きだ","……こんなときに言うことじゃないって、分かってる。でも、好きなんだよね"],
["……戻ったら、ちゃんと言うつもりだった。でも、今言う。好きだ","……戻ったら、ちゃんと言うつもりだった。でも、今言う。好きなの"],
["神さまは眠っておられる。血を絶やせば、死んでしまわれる","神さまは眠ってるんだって。血を絶やしたら、死んじゃうんだよ"],
["こんなのただの石だろ","こんなのただの石じゃん"],
["これを見せたかったんだ","これ見せたかったんだよね"],
["ものみさまに話しかけられたら、返事をしちゃいかん","ものみさまに話しかけられたら、返事しちゃダメだよ"],
["仕掛け人さん、演技うまいなあ","仕掛け人さん、演技マジうまいじゃん"],
["はちだいさまは、若い命と引き換えに雨をくださる","はちだいさまって、若い命と引き換えに雨くれるんだって"],
["迷信だって証明してやる","迷信だって証明してやるし"],
["穴に落とした物は、二度と戻らん。人もな","穴に落とした物は、二度と戻んないよ。人もね"],
["……この村に来なかったら、こうして話すこともなかった","……この村に来なかったら、こうして話すこともなかったよね"],
["……封じるより、従わせる方が確実だ","……封じるより、従わせる方が確実じゃん"],
["この飴の包み紙……間違いない、あなたが犯人だ！","この飴の包み紙……間違いない、あんたが犯人じゃん！"],
["待って。古文書にそんな記述はない。燃やしたって、あれは眠ったままどこへでも滲み出てくる","待って。古文書にそんなこと書いてないし。燃やしたって、あれは眠ったままどこにでも滲み出てくるんだって"],
["……あの祭り、私なら、もっと上手くやれる","……あの祭り、私なら、もっと上手くやれるし"],
["全部分かってるんですよ！　観念しなさい！","全部分かってんだよ！　観念しなって！"],
["気持ちは嬉しい。でも、今は考えられない","気持ちは嬉しいよ。でも、今は考えらんない"],
["おしら様は、遊ばせてやらにゃ怒りなさる","おしら様は、遊ばせてあげないと怒っちゃうんだって"],
["ここだけ墨が新しい","ここだけ墨が新しいじゃん"],
["……神さんが、起きなさる","……神様、起きちゃうって"],
["お前のせいで、こんな村に来たんだ！","あんたのせいで、こんな村に来たんだし！"],
["封じる？　もったいない","封じる？　もったいなくない？"],
["これ一つで、全部返せる","これ一つで、全部返せるじゃん"],
["いい相棒になれそうだ","いい相棒になれそうじゃん"],
["紙垂は罠の印か","紙垂って罠の印ってこと？"],
["やはり！　私の推理と同じだ！","やっぱり！　私の推理と同じじゃん！"],
["気休めじゃない。本物の結界だ","気休めじゃないし。ガチの結界だよ"],
["布団は空にしておく","布団は空にしとく"],
["聞き方がきつすぎる","聞き方がきつすぎるって"],
["ねえ、ここで種明かしでしょ？　誰か出てくるんでしょ？","ねえ、ここで種明かしじゃん？　誰か出てくるんでしょ？"],
["こういうの、信じてないから","こういうの、信じてないし"],
["音が変だったのは、これか","音が変だったのって、これじゃん"],
["怖いと分かるのは才能だ","怖いって分かるの、才能だよ"],
["こかげさまに包まれた者は、美しく生まれ変わる","こかげさまに包まれた人は、キレイに生まれ変わるんだって"],
["俺が、ここに連れてきたんだ。……償わせてくれ","私が、ここに連れてきたんだ。……償わせてよ"],
["封じるんじゃなかったのか。……呼ぶ気なのか","封じるんじゃなかったの？　……呼ぶ気なの？"],
["すごい、特殊メイク？　手が込んでるなあ","すご、特殊メイク？　マジ手込んでるじゃん"],
["これ、海の神の印だ","これ、海の神の印じゃん"],
["かけさまは、自分の首を探しておられる","かけさまは、自分の首を探してるんだって"],
["一緒に遊ぼう","一緒に遊ぼ！"],
["いいものを見つけた","いいもの見つけちゃった"],
["御神木さまは、村の者を養分にして育つ","御神木さまって、村の人を養分にして育つんだって"],
["女神さまは、嘘をつく者がお嫌いでな","女神さまって、嘘つくやつがマジ嫌いなんだよね"],
["すまない。だが、これで皆が助かる","ゴメン。でも、これでみんな助かるから"],
["この字は神の名だ","この字、神の名前なんだって"],
["八つ目様は、全部を見ておられる","八つ目様って、全部見てるんだって"],
["一緒に帰る。約束したでしょ","一緒に帰るの。約束したじゃん"],
["……お前が、売ったのか","……あんたが、売ったの？"],
["……計画は、後回しだ","……計画は、後回しでいいや"],
["仮面など、ありませぬ","仮面とか、ないし"],
["これで、数が揃った","これで、数そろったじゃん"],
["二度と戻ってくるな","二度と戻ってこないで"],
["どうか、御姿を","お願い、姿見せて"],
["そろそろ寝る","そろそろ寝るね"],
["指紋を取る","指紋取るね"],
["まあ、おめでたい。神さまの器が、できなさった","えー、おめでたいじゃん。神さまの器、できたんだって"],
["下戸なので","下戸だから"],
["村のお祭りのお菓子です","村のお祭りのお菓子だよ〜"],
["その話、誰にも言わないで。私だけのものにしたい","その話、誰にも言わないで。私だけのものにしたいの"],
["やっぱり部屋で休みます","やっぱ部屋で休むね"],
["あなたの言葉は、そのまま使える","あんたの言葉、そのまま使えるじゃん"],
["君がいないと、私は推理を忘れる","あんたいないと、私、推理忘れちゃうんだよね"],
["いつか先生みたいになりたい","いつか先生みたいになりたいんだよね"],
["占いで決められるのは嫌だ","占いで決められんのはヤだ"],
["推理は見世物じゃない","推理は見世物じゃないし"],
["派手なお祭りだね","派手なお祭りじゃん"],
["改めて、よろしく","改めて、よろしく〜",1],
["祭りの前の、顔合わせの宴です。今夜は飲んでいってください","祭りの前の、顔合わせの宴だよ〜。今夜は飲んでってね！",1]]});
HK.Load.toneData("chara",{"F":[
["三つ、嘘がありましたね","三つ、嘘あったじゃん"],
["この飴の包み紙……間違いない、あなたが犯人だ！","この飴の包み紙……間違いねー、きみが犯人っしょ！",1],
["何を言ってる！　それは、封じる言葉じゃない！","何言ってんの！　それ、封じる言葉じゃねーって！",1],
["下戸なので","下戸なんだよね",1],
["あんた、前にも来たね","あんた、前にも来たっしょ"],
["犯人は村の誰か一人ではありません。村ぐるみです","犯人は村の誰か一人じゃねーよ。村ぐるみだって"],
["同業者として言わせてもらいますが、それは悪手です","同業者として言わせてもらうけど、それ悪手っすよ"],
["推理は、生きて帰ってからだ","推理は、生きて帰ってからっしょ"],
["〈〉の居場所を教える。だから、私だけは見逃してくれ","〈〉の居場所、教えるよ！　だから私だけは見逃して！"],
["犯人は、民宿の女将さんです","犯人は、民宿の女将さんっす！"],
["明日死ぬかもしれないなら、今言わせて。好きなんだ","明日死ぬかもしんないなら、今言わせて。好きなんだ"],
["夕暮れに遊んでいる子は、隠し神さまに連れていかれる","夕暮れに遊んでる子は、隠し神さまに連れてかれるんだって"],
["……今は、生き延びるのが先だ","……今は、生き延びるのが先っしょ"],
["神さまは眠っておられる。血を絶やせば、死んでしまわれる","神さまは眠ってるんだって。血を絶やしたら、死んじゃうって"],
["ものみさまに話しかけられたら、返事をしちゃいかん","ものみさまに話しかけられたら、返事しちゃダメだって"],
["仕掛け人さん、演技うまいなあ","仕掛け人さん、演技マジうまくね？"],
["はちだいさまは、若い命と引き換えに雨をくださる","はちだいさまって、若い命と引き換えに雨くれるんだって"],
["犯人は、ひとつだけミスをしています","犯人は、ひとつだけミスしてるんだわ"],
["穴に落とした物は、二度と戻らん。人もな","穴に落としたもんは、二度と戻ってこねーって。人もな"],
["……この村に来なかったら、こうして話すこともなかった","……この村に来なかったら、こうして話すこともなかったんだよな"],
["……封じるより、従わせる方が確実だ","……封じるより、従わせる方が確実っしょ"],
["ここでは、ただの人でいい","ここでは、ただの人でいいんだって"],
["この村、絶対なんかありますよね！","この村、絶対なんかあるっしょ！"],
["待って。古文書にそんな記述はない。燃やしたって、あれは眠ったままどこへでも滲み出てくる","待って。古文書にそんなこと書いてねーって。燃やしたって、あれは眠ったままどこにでも滲み出てくるんだって"],
["……あの祭り、私なら、もっと上手くやれる","……あの祭り、私ならもっと上手くやれるって"],
["全部分かってるんですよ！　観念しなさい！","全部分かってんだって！　観念しなよ！"],
["おしら様は、遊ばせてやらにゃ怒りなさる","おしら様は、遊ばせてやんないと怒るんだって"],
["……神さんが、起きなさる","……神さま、起きちゃうって"],
["みいさんは、嫁を一人ずつ娶りなさる","みいさんって、嫁を一人ずつもらうんだって"],
["お前のせいで、こんな村に来たんだ！","あんたのせいで、こんな村に来たんだって！"],
["〈〉さんは、実は村人の変装なんです！","〈〉って、実は村人の変装なんだって！"],
["封じる？　もったいない","封じる？　もったいなくね？"],
["これ一つで、全部返せる","これ一つで、全部返せるって"],
["いい相棒になれそうだ","いい相棒になれそうじゃね？"],
["紙垂は罠の印か","紙垂って、罠の印じゃね？"],
["やはり！　私の推理と同じだ！","やっぱ！　私の推理と同じじゃん！"],
["気休めじゃない。本物の結界だ","気休めじゃねーって。ガチの結界だから"],
["布団は空にしておく","布団は空にしとく"],
["音が変だったのは、これか","音が変だったの、これかよ"],
["怖いと分かるのは才能だ","怖いって分かるのは才能だって"],
["こかげさまに包まれた者は、美しく生まれ変わる","こかげさまに包まれたら、キレイに生まれ変われるんだって"],
["俺が、ここに連れてきたんだ。……償わせてくれ","私が、ここに連れてきたんだわ。……償わせて"],
["封じるんじゃなかったのか。……呼ぶ気なのか","封じるんじゃなかったのかよ。……呼ぶ気？"],
["すごい、特殊メイク？　手が込んでるなあ","ヤバ、特殊メイク？　めっちゃ手込んでるじゃん"],
["これ、海の神の印だ","これ、海の神の印だわ"],
["かけさまは、自分の首を探しておられる","かけさま、自分の首探してるんだって"],
["いいものを見つけた","いいもん見っけた"],
["御神木さまは、村の者を養分にして育つ","御神木さまって、村のやつらを養分にして育つんだって"],
["女神さまは、嘘をつく者がお嫌いでな","女神さまって、嘘つくやつがマジ嫌いなんだって"],
["……あの印を刻んだのは、あんただな","……あの印刻んだの、あんたっしょ"],
["すまない。だが、これで皆が助かる","ゴメン。でも、これでみんな助かるから"],
["八つ目様は、全部を見ておられる","八つ目様って、全部見てるんだって"],
["生きて帰ろう","生きて帰ろ！"],
["……お前が、売ったのか","……あんたが、売ったのか"],
["……計画は、後回しだ","……計画は、後回しっしょ"],
["仮面など、ありませぬ","仮面とか、ないっすよ"],
["これで、数が揃った","これで、数揃ったわ"],
["二度と戻ってくるな","二度と戻ってくんなよ"],
["どうか、御姿を","お願い、姿見せて"],
["そろそろ寝る","そろそろ寝るわ"],
["指紋を取る","指紋取るわ"],
["親切な宿だ","親切な宿じゃん！"],
["まあ、おめでたい。神さまの器が、できなさった","マジ、めでたいじゃん。神さまの器、できたんだって"],
["村のお祭りのお菓子です","村のお祭りのお菓子っす"],
["その話、誰にも言わないで。私だけのものにしたい","その話、誰にも言わないで。私だけのものにしたいんだよね"],
["やっぱり部屋で休みます","やっぱ部屋で休むわ"],
["今は、生き延びることだけ考えよう","今は、生き延びることだけ考えよ"],
["あなたの言葉は、そのまま使える","あんたの言葉、そのまま使えるわ"],
["君がいないと、私は推理を忘れる","あんたがいないと、私は推理を忘れる"],
["占いで決められるのは嫌だ","占いで決められんのは嫌だわ"]]});
HK.Load.toneData("noja",{"F":[
["くぐらないで。脇から","くぐるでないぞ。脇からじゃ"],
["この村、絶対なんかありますよね！","この村、絶対なにかあるぞ！"],
["なら、書き換えればいい","なら、書き換えればよいのじゃ"],
["一緒に配信出ない？　絶対映えるって","共に配信に出ぬか？　必ず映えるぞ"],
["前だけ見て","前だけ見ておればよい"],
["囮のつもりだった","囮のつもりじゃった"],
["帰ったら一緒に何か食べよう","帰ったら一緒に何か食べようかの"],
["音が変だったのは、これか","音が変じゃったのは、これか"],
["その目で私の嘘も見える？","その目で私の嘘も見えるかの？"],
["ヒキガエルの神なら、火を嫌うはずだ。この村ごと――せめて神社の脇の家を焼けば、出てこられなくなる","ヒキガエルの神ならば、火を嫌うはずじゃ。この村ごと――せめて社の脇の家を焼けば、もう出てはこられまい",1],
["〈〉の居場所を教える。だから、私だけは見逃してくれ","〈〉の居所を教えてやろう。ゆえに、私だけは見逃してたもれ",1],
["最後に、役に立てたかな","最後に、役に立てたかのう",1],
["……撮ってる場合じゃない","……撮っておる場合ではない",1],
["下戸なので","下戸ゆえ",1],
["今夜は配信しない","今宵は配信せぬ",1],
["改めて、よろしく頼む","改めて、よろしく頼むぞ",1],
["……この村に来なかったら、こうして話すこともなかった","……この村に来なんだら、こうして話すこともなかったのう",1]],
"O":{
"こんなのただの石だろ":"このようなもの、ただの石じゃろう",
"あんた、前にも来たね":"おぬし、前にも来たな",
"生贄なら、〈〉がいい。あいつは、村の秘密を嗅ぎ回ってる":"生贄ならば、〈〉がよい。あやつは村の秘密を嗅ぎ回っておる",
"迷信だって証明してやる":"迷信と証してやろう",
"犯人は、民宿の女将さんです":"下手人は、民宿の女将じゃ",
"次の作品の主人公のモデルになってくれないか":"次の作の主役の手本になってくれぬか",
"推理は、生きて帰ってからだ":"推理は、生きて帰ってからじゃ",
"この事件の謎は、すべて解けました":"この事件の謎は、すべて解けたぞ",
"犯人は村の誰か一人ではありません。村ぐるみです":"下手人は村の誰か一人ではない。村ぐるみじゃ",
"一緒に遊ぼう":"共に遊ぼうぞ",
"犯人は、ひとつだけミスをしています":"下手人は、ひとつだけしくじっておる",
"三つ、嘘がありましたね":"三つ、偽りがあったのう",
"なるほど。この村では最近、人が死んでいますね":"なるほどのう。この村では近頃、人が死んでおる",
"この人が、今年の――":"この者が、今年の――"}});
HK.Load.toneData("kansai",{"F":[
["この匂いを覚えておく","この匂い、覚えとくな"],
["この村、絶対なんかありますよね！","この村、絶対なんかあるやんな！"],
["これは、見せてはいけない面だ","これは、見せたらあかん面やで"],
["なら、書き換えればいい","なら、書き換えたらええよ"],
["ふむ。この名探偵の目は誤魔化せませんよ","ふむ。この名探偵の目は誤魔化されへんで"],
["よく見ていた","よう見とったなあ"],
["同じものを聞いていた","同じもんを聞いとったんや"],
["封じるんじゃなかったのか。……呼ぶ気なのか","封じるんちゃうかったんか。……呼ぶ気なんか"],
["布団は空にしておく","布団は空にしとくわ"],
["その目で私の嘘も見える？","その目で私の嘘も見えるん？"],
["どうせ殴れない","どうせ殴れへんよ"],
["ヒキガエルの神なら、火を嫌うはずだ。この村ごと――せめて神社の脇の家を焼けば、出てこられなくなる","ヒキガエルの神やったら、火は嫌いなはずや。村ごと――せめて神社の脇の家焼いたら、出てこられへんようになる",1],
["〈〉の居場所を教える。だから、私だけは見逃してくれ","〈〉の居場所、教えたる。せやから、私だけは見逃して",1],
["改めて、よろしく","改めて、よろしゅう",1],
["……この村に来なかったら、こうして話すこともなかった","……この村に来てへんかったら、こうして話すこともなかったんやな",1],
["その話、どこで聞いたの？　出典がない。信じない方がいい","その話、どこで聞いたん？　出典あらへんやん。信じんほうがええで",1],
["生きて帰れたら……いや、今言う。付き合ってほしい","生きて帰れたら……いや、今言うわ。付き合うてほしい",1]],
"O":{
"こんなのただの石だろ":"こんなん、ただの石やろ",
"あんた、前にも来たね":"あんた、前にも来たやろ",
"生贄なら、〈〉がいい。あいつは、村の秘密を嗅ぎ回ってる":"生贄やったら、〈〉がええ。あいつ、村の秘密嗅ぎ回っとるで",
"迷信だって証明してやる":"迷信やって証明したるわ",
"犯人は、民宿の女将さんです":"犯人は、民宿の女将さんや",
"次の作品の主人公のモデルになってくれないか":"次の作品の主人公のモデル、なってくれへん？",
"推理は、生きて帰ってからだ":"推理は、生きて帰ってからや",
"この事件の謎は、すべて解けました":"この事件の謎、全部解けたで",
"犯人は村の誰か一人ではありません。村ぐるみです":"犯人は村の誰か一人ちゃう。村ぐるみや",
"一緒に遊ぼう":"一緒に遊ぼ",
"犯人は、ひとつだけミスをしています":"犯人は、ひとつだけミスしてんねん",
"三つ、嘘がありましたね":"三つ、嘘あったなあ",
"なるほど。この村では最近、人が死んでいますね":"なるほどな。この村、最近人が死んどるんや",
"この人が、今年の――":"この人が、今年の――"}});
HK.Load.toneData("mukuchi",{"F":[
["〈〉の居場所を教える。だから、私だけは見逃してくれ","……〈〉の居場所、教える。だから、見逃して"],
["「どっちがどっちか、わかる？」","「……どっちがどっちか、わかる？」"],
["帰ったら一緒に何か食べよう","……帰ったら、一緒に何か食べよう"],
["毎年、同じ日だ","……毎年、同じ日"],
["……こんなときに言うことじゃないって、分かってる。でも、好きだ","……今言うことじゃない。でも、好き"],
["その目で私の嘘も見える？","……私の嘘も、見える？"],
["ふむ。この名探偵の目は誤魔化せませんよ","……ごまかせない",1],
["みいさんは、嫁を一人ずつ娶りなさる","……みいさんは、嫁をひとりずつ取る",1],
["……あの印を刻んだのは、あんただな","……あの印、刻んだのは、きみ",1],
["……今だけ、何も考えさせないで","……今だけ、何も考えさせないで",1],
["祭りの前の、顔合わせの宴です。今夜は飲んでいってください","……祭りの前の、顔合わせ。……今夜は、飲んでいって",1]],
"O":{
"こんなのただの石だろ":"……ただの石",
"あんた、前にも来たね":"……前にも、来た",
"生贄なら、〈〉がいい。あいつは、村の秘密を嗅ぎ回ってる":"……生贄なら、〈〉。秘密、嗅ぎ回ってる",
"迷信だって証明してやる":"……迷信。証明する",
"犯人は、民宿の女将さんです":"……犯人は、女将さん",
"次の作品の主人公のモデルになってくれないか":"……次の作品の、モデルに",
"推理は、生きて帰ってからだ":"……推理は、帰ってから",
"この事件の謎は、すべて解けました":"……謎、全部解けた",
"犯人は村の誰か一人ではありません。村ぐるみです":"……犯人は、村ぐるみ",
"一緒に遊ぼう":"……遊ぼう",
"犯人は、ひとつだけミスをしています":"……犯人、ひとつ、ミスしてる",
"三つ、嘘がありましたね":"……嘘が、三つ",
"なるほど。この村では最近、人が死んでいますね":"……この村、最近、人が死んでる",
"この人が、今年の――":"……この人が、今年の"}});
HK.Load.toneData("polite",{"F":[
["……返す。よく守った","……お返しします。よく守ってくれましたね"],
["ここでは、ただの人でいい","ここでは、ただの人でいいんですよ"],
["なら、書き換えればいい","なら、書き換えればいいんです"],
["ほら、推理どおり","ほら、推理どおりです"],
["よく見ていた","よく見ていましたね"],
["今のは貸し","今のは貸しです"],
["仮面など、ありませぬ","仮面など、ありません"],
["偶然にしては上出来","偶然にしては上出来です"],
["前だけ見て","前だけ見ていてください"],
["助かった、借りができた","助かりました、借りができましたね"],
["懐中電灯は無事","懐中電灯は無事です"],
["運も実力のうち","運も実力のうちです"],
["音が変だったのは、これか","音が変だったのは、これでしたか"],
["ヒキガエルの神なら、火を嫌うはずだ。この村ごと――せめて神社の脇の家を焼けば、出てこられなくなる","ヒキガエルの神でしたら、火を嫌うはずです。この村ごと――せめて神社の脇のお宅を焼けば、出てこられなくなるかと",1],
["呼ばれてるんだ。行かなきゃ","呼ばれているんです。行かなければ",1],
["仕掛け人さん、演技うまいなあ","仕掛け人さん、演技がお上手ですね",1],
["……撮ってる場合じゃない","……撮っている場合ではありません",1],
["これ、ドッキリでしょ？　誰の仕込み？","これ、ドッキリですよね？　どなたの仕込みですか？",1],
["……ごめん。今は、自分が生き残らないと","……すみません。今は、自分が生き残らないといけないんです",1],
["はちだいさまは、若い命と引き換えに雨をくださる","はちだいさまは、若い命と引き換えに雨をくださいます",1],
["そほどさまは、田を守ってくださる。よそ者から","そほどさまは、田を守ってくださいます。よそ者から",1],
["〈〉の居場所を教える。だから、私だけは見逃してくれ","〈〉さんの居場所をお教えします。ですから、私だけは見逃してください",1],
["これ、誰の仕込み？","これ、どなたの仕込みですか？",1],
["ものみさまに話しかけられたら、返事をしちゃいかん","ものみさまに話しかけられても、返事をしてはいけません",1]],
"O":{
"こんなのただの石だろ":"こんなもの、ただの石でしょう",
"あんた、前にも来たね":"あなた、前にもいらっしゃいましたね",
"生贄なら、〈〉がいい。あいつは、村の秘密を嗅ぎ回ってる":"生贄なら、〈〉さんがいいと思います。村の秘密を嗅ぎ回っていますから",
"迷信だって証明してやる":"迷信だと証明してみせます",
"次の作品の主人公のモデルになってくれないか":"次の作品の主人公のモデルに、なっていただけませんか",
"推理は、生きて帰ってからだ":"推理は、生きて帰ってからにしましょう",
"一緒に遊ぼう":"一緒に遊びましょう",
"この人が、今年の――":"この方が、今年の――"}});
HK.Load.toneData("gentleman",{"F":[
["……その目、本物かも","……その目、本物かもしれないね"],
["……それ、もう一回言って","……それを、もう一度言ってくれないか"],
["〈〉の居場所を教える。だから、私だけは見逃してくれ","〈〉の居場所を教えよう。だから、私だけは見逃してくれないかね"],
["この村、絶対なんかありますよね！","この村には、何かあるに違いないね！"],
["これを見せたかったんだ","これを見せたかったのだよ"],
["その読みで合ってた","その読みで合っていたね"],
["同業者に見せるのは初めてだ","同業者に見せるのは初めてだよ"],
["ヒキガエルの神なら、火を嫌うはずだ。この村ごと――せめて神社の脇の家を焼けば、出てこられなくなる","ヒキガエルの神なら、火を嫌うはずだね。この村ごと――せめて神社の脇の家を焼けば、出てこられなくなるだろう",1],
["ここの堰が、何十年も前に埋められてる。雨が降らないんじゃない。水が来なくなっただけだ","ここの堰が、何十年も前に埋められているね。雨が降らないのではない。水が来なくなっただけなのさ",1],
["神さまは怠け者でな。供物が足りんと、起きて自分で探しに来なさる","神さまは怠け者でね。供物が足りないと、起きて自分で探しに来なさるのさ",1],
["はちだいさまは、若い命と引き換えに雨をくださる","はちだいさまは、若い命と引き換えに雨をくださるのさ",1],
["――カルコサだ。湖の向こうに、カルコサが見える","――カルコサだよ。湖の向こうに、カルコサが見えるのさ",1],
["湖の主さまに選ばれた者は、永遠に生きられる","湖の主さまに選ばれた者は、永遠に生きられるのさ",1],
["怖いから、一緒に寝てもいい？","怖いから、一緒に寝てもいいかい？",1],
["仕掛け人さん、演技うまいなあ","仕掛け人君、演技が上手いね",1],
["ねえ、ここで種明かしでしょ？　誰か出てくるんでしょ？","ここで種明かしだろう？　誰か出てくるのではないかね？",1],
["……撮ってる場合じゃない","……撮っている場合ではないよ",1],
["お前のせいで、こんな村に来たんだ！","君のせいで、こんな村に来る羽目になったのだよ！",1],
["〈〉さんは、実は村人の変装なんです！","〈〉さんは、実は村人の変装なのだよ！",1],
["この飴の包み紙……間違いない、あなたが犯人だ！","この飴の包み紙……間違いない、君が犯人だね！",1],
["ここでは、ただの人でいい","ここでは、ただの人でいいのだよ",1],
["……悪い。連れて行けない","……すまない。連れて行けないよ",1],
["下戸なので","下戸なものでね",1],
["村おこしの仕事で来た。この村の特産品を探している","村おこしの仕事で来たのだよ。この村の特産品を探していてね",1],
["改めて、よろしく頼む","改めて、よろしく頼むよ",1],
["……この村に来なかったら、こうして話すこともなかった","……この村に来なければ、こうして話すこともなかっただろうね",1]],
"O":{
"こんなのただの石だろ":"こんなものは、ただの石だろう",
"あんた、前にも来たね":"君は、前にも来たことがあるね",
"生贄なら、〈〉がいい。あいつは、村の秘密を嗅ぎ回ってる":"生贄なら、〈〉がいいだろう。あの人は、村の秘密を嗅ぎ回っているからね",
"迷信だって証明してやる":"迷信だと証明してみせよう",
"犯人は、民宿の女将さんです":"犯人は、民宿の女将さんだよ",
"次の作品の主人公のモデルになってくれないか":"次の作品の主人公の、モデルになってくれないかね",
"推理は、生きて帰ってからだ":"推理は、生きて帰ってからにしよう",
"この事件の謎は、すべて解けました":"この事件の謎は、すべて解けたよ",
"犯人は村の誰か一人ではありません。村ぐるみです":"犯人は、村の誰か一人ではないよ。村ぐるみだ",
"一緒に遊ぼう":"一緒に遊ぼうじゃないか",
"犯人は、ひとつだけミスをしています":"犯人は、ひとつだけ過ちを犯しているよ",
"三つ、嘘がありましたね":"三つ、嘘があったね",
"なるほど。この村では最近、人が死んでいますね":"なるほど。この村では近頃、人が死んでいるようだね",
"この人が、今年の――":"この人が、今年の――"}});
HK.Load.toneData("proud",{"F":[
["なるほど。この村では最近、人が死んでいますね","なるほど。この村じゃ最近、人が死んでるってわけか"],
["今のはオフレコね","今のはオフレコだ。いいな"],
["前だけ見て","前だけ見ろ"],
["その目で私の嘘も見える？","その目で私の嘘も見えるか？"],
["犯人は村の誰か一人ではありません。村ぐるみです","犯人は村の誰か一人じゃねえ。村ぐるみだ",1],
["ねえ、ここで種明かしでしょ？　誰か出てくるんでしょ？","おい、ここで種明かしだろ？　誰か出てくるんだろ？",1],
["これ、ドッキリでしょ？　誰の仕込み？","これ、ドッキリだろ？　誰の仕込みだ？",1],
["「どっちがどっちか、わかる？」","どっちがどっちか、わかるか？",1],
["怖いから、一緒に寝てもいい？","……怖いわけじゃねえ。一緒に寝てやるだけだ",1],
["おかしいの、体が……","おかしいんだ、体が……",1],
["一緒に配信出ない？　絶対映えるって","一緒に配信出ろよ。絶対映えるって",1]]});
HK.Load.toneData("aniki",{"F":[
["犯人は村の誰か一人ではありません。村ぐるみです","犯人は村の誰か一人じゃねえ。村ぐるみだよ",1],
["〈〉の居場所を教える。だから、私だけは見逃してくれ","〈〉の居場所を教える。だから、私だけは見逃してくれ",1],
["これ、ドッキリでしょ？　誰の仕込み？","これ、ドッキリだろ？　誰の仕込みだ？",1],
["ねえ、ここで種明かしでしょ？　誰か出てくるんでしょ？","なあ、ここで種明かしだろ？　誰か出てくるんだろ？",1],
["怖いから、一緒に寝てもいい？","怖えから、一緒に寝てもいいか？　……笑うなよ",1],
["下戸なので","下戸なんだ",1],
["〈〉、私から離れるな。……帰ったら、続きだ。約束だぞ","〈〉、私から離れんなよ。……帰ったら、続きだ。約束だぞ",1],
["……今だけ、何も考えさせないで","……今だけ、何も考えさせないでくれ",1],
["その話、どこで聞いた。出典がない。信じない方がいい","その話、どこで聞いた？　出どころも分かんねえ話は、信じねえ方がいいぞ",1]]});
HK.Load.toneData("yankee",{"F":[
["……今回だけは褒める","……今回だけは褒めとく"],
["……神さんが、起きなさる","……神さんが、起きちまうぞ"],
["これは、見せてはいけない面だ","これは、見せちゃいけねえ面なんだよ"],
["なるほど。この村では最近、人が死んでいますね","なるほど。この村じゃ最近、人が死んでるな"],
["やはり！　私の推理と同じだ！","やっぱりな！　私の推理と同じだ！"],
["今だけは感謝する","今だけは感謝しとく"],
["仕掛け人さーん？","おーい、仕掛け人さんよー？"],
["何を言ってる！　それは、封じる言葉じゃない！","何言ってんだ！　それは、封じる言葉じゃねえ！"],
["全部分かってるんですよ！　観念しなさい！","全部分かってんだよ！　観念しろ！"],
["怖いと分かるのは才能だ","怖えって分かるのは才能だよ"],
["愚かだな。私なら、全員を助けられたかもしれないのに","バカだな。私なら、全員助けられたかもしれねえのに"],
["おかしいの、体が……","おかしいんだ、体が……"],
["その目で私の嘘も見える？","その目で私の嘘も見えんの？"],
["あんた、前にも来たね","お前、前にも来たよな",1],
["前だけ見て","……前だけ見てろ",1],
["〈〉。生きて帰る確率を上げるなら、離れないことだ。……それと、好きだ","〈〉。生きて帰りてえなら、私から離れんな。……あと、好きだ",1],
["怖いから、一緒に寝てもいい？","こええから、一緒に寝てもいいか？",1],
["改めて、よろしく頼む","改めて、よろしく頼むわ",1]]});
HK.Load.toneData("tsun",{"F":[
["なるほど。この村では最近、人が死んでいますね","なるほどね。この村、最近人が死んでるわけ",1],
["――カルコサだ。湖の向こうに、カルコサが見える","――カルコサよ。湖の向こうに、カルコサが見える……",1],
["……あの印を刻んだのは、あんただな","……あの印を刻んだのは、あんたでしょ",1],
["〈〉さんは、実は村人の変装なんです！","〈〉さんは、実は村人の変装なのよ！",1],
["〈〉の居場所を教える。だから、私だけは見逃してくれ","〈〉の居場所、教えてあげる。だから……私だけは見逃しなさいよ",1],
["おにいちゃん、こっち。お母さんが待ってるよ","おにいちゃん、こっち。……お母さんが待ってるわよ",1],
["この事件の謎は、すべて解けました","この事件の謎は、すべて解けたわ。……当然でしょ",1],
["この村、絶対なんかありますよね！","この村、絶対なんかあるわよね！",1],
["これ、ドッキリでしょ？　誰の仕込み？","これ、ドッキリでしょ？　誰の仕込みよ",1],
["ひながたさまは、村を作って、遊んでおられる","ひながたさまは、村を作って、遊んでおられる……って、何よそれ",1],
["ふむ。この名探偵の目は誤魔化せませんよ","ふん。この名探偵の目は誤魔化せないわよ",1],
["ヒキガエルの神なら、火を嫌うはずだ。この村ごと――せめて神社の脇の家を焼けば、出てこられなくなる","ヒキガエルの神なら、火を嫌うはずよ。この村ごと――せめて神社の脇の家を焼けば、出てこられなくなるわ",1],
["湖の主さまに選ばれた者は、永遠に生きられる","湖の主さまに選ばれた者は、永遠に生きられる……なんて、本気で信じてるわけ？",1],
["犯人は、ひとつだけミスをしています","犯人は、ひとつだけミスをしてるのよ",1],
["犯人は村の誰か一人ではありません。村ぐるみです","犯人は村の誰か一人じゃないわ。……村ぐるみよ",1],
["生きて帰れたら、一緒にいてほしい","生きて帰れたら……い、一緒にいてあげてもいいけど",1],
["生贄なら、〈〉がいい。あいつは、村の秘密を嗅ぎ回ってる","生贄なら、〈〉がいいわ。あいつ、村の秘密を嗅ぎ回ってるもの",1],
["種明かしのとき、またよろしくお願いしますね","種明かしのときも、またよろしく。……べ、別に楽しみにしてないから",1],
["蛇を殺した者は、蛇の父さまに呪われる","蛇を殺した者は、蛇の父さまに呪われるのよ。……知らないわよ、どうなっても",1],
["……ごめん。今は、自分が生き残らないと","……悪かったわね。でも今は、自分が生き残らないと",1],
["犯人は、民宿の女将さんです","犯人は、民宿の女将さんよ",1],
["みいさんは、嫁を一人ずつ娶りなさる","みいさんは、嫁を一人ずつ娶りなさる……んですって",1],
["一緒に帰ろう。……今度は、置いていかない","一緒に帰るわよ。……今度は、置いていかないから",1],
["神さまは怠け者でな。供物が足りんと、起きて自分で探しに来なさる","神さまは怠け者でね。供物が足りないと、起きて自分で探しに来るのよ",1]]});
HK.Load.toneData("gentle",{"F":[
["迷信だって証明してやる","迷信だって、証明してみせるね"],
["ものみさまに話しかけられたら、返事をしちゃいかん","ものみさまに話しかけられたら、返事をしちゃだめだよ"],
["ヒキガエルの神なら、火を嫌うはずだ。この村ごと――せめて神社の脇の家を焼けば、出てこられなくなる","ヒキガエルの神なら、火を嫌うはず。村ごと……ううん、せめて神社の脇の家を焼けば、出てこられなくなるかも",1],
["何を言ってる！　それは、封じる言葉じゃない！","何を言ってるの！　それは、封じる言葉じゃないよ！",1],
["この村、絶対なんかありますよね！","この村、絶対なにかあるよね！",1]]});
HK.Load.toneData("gentle_n",{"F":[
["この村、絶対なんかありますよね！","この村、絶対なにかあるよね"],
["全部分かってるんですよ！　観念しなさい！","全部分かってるんですよ！　観念してください！"],
["迷信だって証明してやる","迷信だって証明してみせるよ"],
["ヒキガエルの神なら、火を嫌うはずだ。この村ごと――せめて神社の脇の家を焼けば、出てこられなくなる","ヒキガエルの神なら、火を嫌うはず。村ごと――せめて神社の脇の家を焼けば、出てこられなくなる",1],
["何を言ってる！　それは、封じる言葉じゃない！","何を言ってるの！　それは、封じる言葉じゃない！",1]]});
HK.Load.toneData("ane",{"F":[
["この村、絶対なんかありますよね！","この村、絶対なんかあるわよね！"],
["この飴の包み紙……間違いない、あなたが犯人だ！","この飴の包み紙……間違いないわ、あなたが犯人よ！"],
["すまない。だが、これで皆が助かる","ごめんなさい。でも、これで皆が助かるわ"],
["なるほど。この村では最近、人が死んでいますね","なるほど。この村では最近、人が死んでいるのね"],
["やはり！　私の推理と同じだ！","やっぱり！　私の推理と同じだわ！"],
["仮面など、ありませぬ","仮面なんて、ないわ"],
["次の作品の主人公のモデルになってくれないか","次の作品の主人公のモデルになってくれないかしら"],
["神さまは怠け者でな。供物が足りんと、起きて自分で探しに来なさる","神さまは怠け者なのよ。供物が足りないと、起きて自分で探しにいらっしゃるわ"],
["紙垂は罠の印か","紙垂は罠の印なのね"],
["迷信だって証明してやる","迷信だって、証明してみせるわ"],
["音が変だったのは、これか","音が変だったのは、これだったのね"],
["祭りの前に、清めておかにゃならん","祭りの前に、清めておかなきゃならないわ"],
["ヒキガエルの神なら、火を嫌うはずだ。この村ごと――せめて神社の脇の家を焼けば、出てこられなくなる","ヒキガエルの神なら、火を嫌うはずよ。村ごと――いえ、せめて神社の脇の家を焼けば、出てこられなくなるわ",1],
["お前のせいで、こんな村に来たんだ！","あなたのせいで、こんな村に来たのよ！",1],
["何を言ってる！　それは、封じる言葉じゃない！","何を言ってるの！　それは、封じる言葉じゃないわ！",1]]});
HK.Load.toneData("devoted",{"F":[
["……返す。よく守った","……返します。よく守ってくれましたね"],
["ここでは、ただの人でいい","ここでは、ただの人でいいんですよ"],
["なら、書き換えればいい","なら、書き換えればいいんです"],
["よく見ていた","よく見ていましたね"],
["今のは貸し","今のは貸しです"],
["偶然にしては上出来","偶然にしては上出来です"],
["前だけ見て","前だけ見てください"],
["助かった、借りができた","助かりました。借りができましたね"],
["懐中電灯は無事","懐中電灯は無事です"],
["音が変だったのは、これか","音が変だったのは、これだったんですね"],
["その目で私の嘘も見える？","その目で私の嘘も見えますか？"],
["ヒキガエルの神なら、火を嫌うはずだ。この村ごと――せめて神社の脇の家を焼けば、出てこられなくなる","ヒキガエルの神なら、火を嫌うはずです。村ごと――いえ、せめて神社の脇の家を焼けば、出てこられなくなります",1],
["迷信だって証明してやる","迷信だって、証明してみせます",1],
["おしら様は、遊ばせてやらにゃ怒りなさる","おしら様は、遊ばせてあげないとお怒りになる……そう言われているんです",1],
["……神さんが、起きなさる","……神さんが、お目覚めになります",1]]});
HK.Load.toneData("devoted_p",{"F":[
["同業者として言わせてもらいますが、それは悪手です","同業者として言わせてもらうけど、それは悪手だよ"],
["犯人は村の誰か一人ではありません。村ぐるみです","犯人は村の誰か一人じゃない。村ぐるみだよ"],
["ものみさまに話しかけられたら、返事をしちゃいかん","ものみさまに話しかけられたら、返事しちゃだめ"],
["ヒキガエルの神なら、火を嫌うはずだ。この村ごと――せめて神社の脇の家を焼けば、出てこられなくなる","ヒキガエルの神なら、火が嫌いなはず。村ごと――ううん、せめて神社の脇の家を焼けば、出てこられなくなるよ",1],
["この事件の謎は、すべて解けました","この事件の謎、ぜんぶ解けたよ",1],
["犯人は、民宿の女将さんです","犯人は、民宿の女将さんだよ",1],
["やはり！　私の推理と同じだ！","やっぱり！　私の推理と同じ！",1],
["すまない。だが、これで皆が助かる","ごめん。でも、これでみんなが助かるから",1]]});
HK.Load.toneData("kohai",{"F":[
["……返す。よく守った","……返すっす。よく守ってくれたっすね"],
["あんた、前にも来たね","前にも来てたっすよね"],
["ほら、推理どおり","ほら、推理どおりっす"],
["よく見ていた","よく見てたっすね"],
["今のは貸し","今のは貸しっす"],
["偶然にしては上出来","偶然にしては上出来っす"],
["前だけ見て","前だけ見てくださいっす"],
["同業者として言わせてもらいますが、それは悪手です","同業者として言わせてもらうっすけど、それは悪手っす"],
["封じる？　もったいない","封じるんすか？　もったいないっす"],
["懐中電灯は無事","懐中電灯は無事っす"],
["撮れ高すぎる","撮れ高すごすぎっす"],
["犯人は、民宿の女将さんです","犯人は、民宿の女将さんっす"],
["聞き方がきつすぎる","聞き方がきつすぎっす"],
["運も実力のうち","運も実力のうちっす"],
["音が変だったのは、これか","音が変だったのは、これだったんすね"],
["そこまで見抜くか","そこまで見抜くんすか"],
["ヒキガエルの神なら、火を嫌うはずだ。この村ごと――せめて神社の脇の家を焼けば、出てこられなくなる","ヒキガエルの神なら、火が苦手なはずっす。この村ごと――せめて神社の脇の家を焼いちゃえば、出てこられなくなるっすよ",1],
["犯人は村の誰か一人ではありません。村ぐるみです","犯人は村の誰か一人じゃないっす。村ぐるみっすよ",1],
["ふむ。この名探偵の目は誤魔化せませんよ","ふふん。この名探偵の目は誤魔化せないっすよ",1],
["おはぐろさまに『綺麗』と答えちゃいかん","おはぐろさまに『綺麗』って答えちゃダメっす",1],
["はちだいさまは、若い命と引き換えに雨をくださる","はちだいさまは、若い命と引き換えに雨をくれるんす",1],
["そほどさまは、田を守ってくださる。よそ者から","そほどさまは、田を守ってくれるんす。よそ者から",1],
["……撮ってる場合じゃない","……撮ってる場合じゃないっす",1],
["これ、ドッキリでしょ？　誰の仕込み？","これ、ドッキリっすよね？　誰の仕込みっすか？",1],
["なるほど。この村では最近、人が死んでいますね","なるほど。この村、最近人が死んでるっすね",1],
["〈〉の居場所を教える。だから、私だけは見逃してくれ","〈〉さんの居場所、教えるっす。だから、私だけは見逃してほしいっす",1],
["呼ばれてるんだ。行かなきゃ","呼ばれてるんす。行かなきゃ",1],
["今のうちに参りましょう。こちらです","今のうちに行くっす。こっちっす",1],
["これ、誰の仕込み？","これ、誰の仕込みっすか？",1]]});
HK.Load.toneData("cool",{"F":[
["死んだ者はみな、神さまのものじゃ","死んだ者はみな、神のものだ"],
["ヒキガエルの神なら、火を嫌うはずだ。この村ごと――せめて神社の脇の家を焼けば、出てこられなくなる","ヒキガエルの神なら、火を嫌う可能性が高い。この村ごと――最低でも神社の脇の家を焼けば、出てこられなくなる",1],
["ここの堰が、何十年も前に埋められてる。雨が降らないんじゃない。水が来なくなっただけだ","ここの堰が、数十年前に埋められている。降水量の問題ではない。水路が断たれただけだ",1],
["神さまは怠け者でな。供物が足りんと、起きて自分で探しに来なさる","神は怠け者だ。供物が不足すると、起きて自分で探しに来る",1],
["〈〉の居場所を教える。だから、私だけは見逃してくれ","〈〉の居場所を教える。その代わり、私だけは見逃してくれ",1],
["生贄なら、〈〉がいい。あいつは、村の秘密を嗅ぎ回ってる","生贄なら、〈〉が最適だ。あいつは、村の秘密を嗅ぎ回っている",1],
["犯人は村の誰か一人ではありません。村ぐるみです","犯人は村の誰か一人ではない。村全体の組織的な犯行だ",1],
["はちだいさまは、若い命と引き換えに雨をくださる","はちだいさまは、若い命と引き換えに雨を降らせる。そういう取引だ",1],
["――カルコサだ。湖の向こうに、カルコサが見える","――カルコサだ。湖の向こうに、カルコサが見える。観測上、ありえないはずだが",1],
["なるほど。この村では最近、人が死んでいますね","なるほど。この村では最近、死者が出ている。偶然とは考えにくい",1],
["湖の主さまに選ばれた者は、永遠に生きられる","湖の主さまに選ばれた者は、永遠に生きられる。……そういう言い伝えだ",1],
["怖いから、一緒に寝てもいい？","怖い。……一緒に寝てもいいか",1],
["仕掛け人さん、演技うまいなあ","仕掛け人、演技が上手いな",1],
["ねえ、ここで種明かしでしょ？　誰か出てくるんでしょ？","ここで種明かしだろう？　誰か出てくるんだろう？",1],
["三つ、嘘がありましたね","三つ、嘘があったな",1],
["迷信だって証明してやる","迷信だと証明してやる",1],
["ふむ。この名探偵の目は誤魔化せませんよ","ふむ。この名探偵の目は誤魔化せない",1],
["……撮ってる場合じゃない","……撮っている場合じゃない",1]]});
HK.Load.toneData("calm",{"F":[
["ほら、推理どおり","ほら、思ったとおり"],
["ヒキガエルの神なら、火を嫌うはずだ。この村ごと――せめて神社の脇の家を焼けば、出てこられなくなる","ヒキガエルの神なら、火を嫌うはずだ。この村ごと――せめて神社の脇の家を焼けば、もう出てこられない",1],
["ここの堰が、何十年も前に埋められてる。雨が降らないんじゃない。水が来なくなっただけだ","ここの堰が、何十年も前に埋められている。雨が降らないんじゃない。水が来なくなっただけだ",1],
["神さまは怠け者でな。供物が足りんと、起きて自分で探しに来なさる","神さまは怠け者でな。供物が足りないと、起きて自分で探しに来なさる",1],
["〈〉の居場所を教える。だから、私だけは見逃してくれ","〈〉の居場所を教える。だから、私だけは見逃してくれ",1],
["生贄なら、〈〉がいい。あいつは、村の秘密を嗅ぎ回ってる","生贄なら、〈〉がいい。あの人は、村の秘密を嗅ぎ回っている",1],
["犯人は村の誰か一人ではありません。村ぐるみです","犯人は村の誰か一人じゃない。村ぐるみだ",1],
["はちだいさまは、若い命と引き換えに雨をくださる","はちだいさまは、若い命と引き換えに雨をくださる",1],
["――カルコサだ。湖の向こうに、カルコサが見える","――カルコサだ。湖の向こうに、カルコサが見える",1],
["なるほど。この村では最近、人が死んでいますね","なるほど。この村では最近、人が死んでいるな",1],
["湖の主さまに選ばれた者は、永遠に生きられる","湖の主さまに選ばれた者は、永遠に生きられる",1],
["怖いから、一緒に寝てもいい？","怖いから、一緒に寝てもいい？",1],
["おかしいの、体が……","おかしい、体が……",1]]});
HK.Load.toneData("free",{"F":[
["よく見ていた","よく見てたね！"],
["同業者として言わせてもらいますが、それは悪手です","同業者として言わせてもらうけど、それは悪手だよ"],
["なるほど。この村では最近、人が死んでいますね","なるほど！　この村、最近人が死んでるんだ",1],
["――カルコサだ。湖の向こうに、カルコサが見える","――カルコサだ！　湖の向こうに、カルコサが見えるよ！",1],
["……あの印を刻んだのは、あんただな","……あの印を刻んだのは、きみだね",1],
["〈〉さんは、実は村人の変装なんです！","〈〉さんは、実は村人の変装なんだよ！",1],
["〈〉の居場所を教える。だから、私だけは見逃してくれ","〈〉の居場所、教えるよ！　だから私だけは見逃して！",1],
["おにいちゃん、こっち。お母さんが待ってるよ","おにいちゃん、こっち！　お母さんが待ってるよ！",1],
["この事件の謎は、すべて解けました","この事件の謎、ぜんぶ解けたよ！",1],
["この村、絶対なんかありますよね！","この村、絶対なんかあるよね！",1],
["これ、ドッキリでしょ？　誰の仕込み？","これ、ドッキリでしょ！？　誰の仕込み！？",1],
["ひながたさまは、村を作って、遊んでおられる","ひながたさまは、村を作って遊んでるんだって！",1],
["ふむ。この名探偵の目は誤魔化せませんよ","ふふーん、この名探偵の目は誤魔化せないよ！",1],
["ヒキガエルの神なら、火を嫌うはずだ。この村ごと――せめて神社の脇の家を焼けば、出てこられなくなる","ヒキガエルの神なら火が苦手なはず！　この村ごと――せめて神社の脇の家を焼けば、もう出てこられないよ！",1],
["湖の主さまに選ばれた者は、永遠に生きられる","湖の主さまに選ばれた人は、永遠に生きられるんだって！",1],
["犯人は、ひとつだけミスをしています","犯人は、ひとつだけミスをしてるよ！",1],
["犯人は村の誰か一人ではありません。村ぐるみです","犯人は村の誰か一人じゃないよ！　村ぐるみなんだ！",1],
["生きて帰れたら、一緒にいてほしい","生きて帰れたら、一緒にいてほしい！",1],
["生贄なら、〈〉がいい。あいつは、村の秘密を嗅ぎ回ってる","生贄なら、〈〉がいいよ。あいつ、村の秘密を嗅ぎ回ってるもん",1],
["種明かしのとき、またよろしくお願いしますね","種明かしのときも、またよろしくね！",1],
["蛇を殺した者は、蛇の父さまに呪われる","蛇を殺した人は、蛇の父さまに呪われるんだって！",1],
["犯人は、民宿の女将さんです","犯人は、民宿の女将さんだよ！",1],
["みいさんは、嫁を一人ずつ娶りなさる","みいさんは、嫁を一人ずつ娶るんだって！",1],
["一緒に帰ろう。……今度は、置いていかない","一緒に帰ろう！　……今度は、置いていかないよ",1],
["神さまは怠け者でな。供物が足りんと、起きて自分で探しに来なさる","神さまは怠け者なんだって！　供物が足りないと、起きて自分で探しに来ちゃうの",1]]});
HK.Load.toneData("usan",{"F":[
["「どっちがどっちか、わかる？」","「どっちがどっちか、わかるかい？」"],
["この村、絶対なんかありますよね！","この村、絶対なんかあるねえ",1],
["そういうの、今はいい","そういうの、今はいいからさ"],
["今のはオフレコね","今のはオフレコで頼むよ"],
["仕掛け人さーん？","仕掛け人さーん？　いるんだろう？"],
["穴に落とした物は、二度と戻らん。人もな","穴に落とした物は、二度と戻らないよ。人もねえ"],
["迷信だって証明してやる","迷信だって、証明してみせるさ"],
["その目で私の嘘も見える？","その目で私の嘘も見えるかい？"],
["なるほど。この村では最近、人が死んでいますね","なるほどねえ。この村じゃ最近、人が死んでるわけだ",1],
["――カルコサだ。湖の向こうに、カルコサが見える","――カルコサだねえ。湖の向こうに、カルコサが見えるよ",1],
["〈〉さんは、実は村人の変装なんです！","〈〉さんはねえ、実は村人の変装さ",1],
["〈〉の居場所を教える。だから、私だけは見逃してくれ","〈〉の居場所を教えてあげるよ。だからさ、私だけは見逃しておくれ",1],
["おにいちゃん、こっち。お母さんが待ってるよ","おにいちゃん、こっちだよ。お母さんが待ってるからさ",1],
["この事件の謎は、すべて解けました","この事件の謎はねえ、すべて解けちゃったのさ",1],
["これ、ドッキリでしょ？　誰の仕込み？","これ、ドッキリだろう？　誰の仕込みだい？",1],
["ひながたさまは、村を作って、遊んでおられる","ひながたさまはねえ、村を作って、遊んでおられるのさ",1],
["ふむ。この名探偵の目は誤魔化せませんよ","ふむ。この名探偵の目は、誤魔化せないよお",1],
["ヒキガエルの神なら、火を嫌うはずだ。この村ごと――せめて神社の脇の家を焼けば、出てこられなくなる","ヒキガエルの神なら、火は嫌いだろうねえ。この村ごと――せめて神社の脇の家を焼けば、出てこられなくなるさ",1],
["湖の主さまに選ばれた者は、永遠に生きられる","湖の主さまに選ばれた者は、永遠に生きられるそうだよ。……さて、どうだかねえ",1],
["犯人は、ひとつだけミスをしています","犯人はねえ、ひとつだけミスをしてるのさ",1],
["犯人は村の誰か一人ではありません。村ぐるみです","犯人は村の誰か一人じゃないのさ。村ぐるみだよ",1],
["生きて帰れたら、一緒にいてほしい","生きて帰れたら、一緒にいてほしいんだよねえ",1],
["生贄なら、〈〉がいい。あいつは、村の秘密を嗅ぎ回ってる","生贄なら、〈〉がいいねえ。あいつは、村の秘密を嗅ぎ回ってるのさ",1],
["種明かしのとき、またよろしくお願いしますね","種明かしのときも、またよろしく頼むよ",1],
["蛇を殺した者は、蛇の父さまに呪われる","蛇を殺した者は、蛇の父さまに呪われるそうだよ",1],
["同業者として言わせてもらいますが、それは悪手です","同業者として言わせてもらうけどねえ、それは悪手だよ",1],
["三つ、嘘がありましたね","三つ、嘘があったねえ",1],
["何を言ってる！　それは、封じる言葉じゃない！","何を言ってるんだい！　それは、封じる言葉じゃないよ！",1],
["みいさんは、嫁を一人ずつ娶りなさる","みいさんはねえ、嫁を一人ずつ娶りなさるのさ",1],
["一緒に帰ろう。……今度は、置いていかない","一緒に帰ろうか。……今度は、置いていかないよ",1],
["神さまは怠け者でな。供物が足りんと、起きて自分で探しに来なさる","神さまは怠け者でねえ。供物が足りないと、起きて自分で探しに来なさるのさ",1]]});
HK.Load.toneData("shy",{"F":[
["……あの祭り、私なら、もっと上手くやれる","……あ、あの祭り、私なら……もっと上手く、やれる、かも……"],
["同業者として言わせてもらいますが、それは悪手です","あ、あの……同業者として、その……それは、悪手だと思います……"],
["迷信だって証明してやる","め、迷信だって……証明、してみせるから……"],
["ヒキガエルの神なら、火を嫌うはずだ。この村ごと――せめて神社の脇の家を焼けば、出てこられなくなる","ひ、ヒキガエルの神なら……ひ、火が苦手な、はず……じ、神社の脇の家を、焼けば……で、出てこられない、かも……",1],
["何やってるんだ！　それ、呼び出す方の言葉だろ！","な、何やってるの……！　そ、それ、呼び出す方の言葉だよ……！",1],
["何を言ってる！　それは、封じる言葉じゃない！","な、何言ってるの……！　そ、それ、封じる言葉じゃない……！",1]]});
HK.Load.toneData("ojou",{"F":[
["……返す。よく守った","……お返ししますわ。よく守ってくださいましたわね"],
["ここでは、ただの人でいい","ここでは、ただの人でいてよろしいのですわ"],
["ここで数を数えてる","ここで数を数えていますわ"],
["その読みで合ってた","その読みで合っていましたわ"],
["それは知ってる","それは存じていますわ"],
["なら、書き換えればいい","なら、書き換えればよろしいのですわ"],
["よく見ていた","よく見ていらっしゃいましたわね"],
["今のは貸し","今のは貸しですわ"],
["偶然にしては上出来","偶然にしては上出来ですわ"],
["前だけ見て","前だけ見てくださいまし"],
["助かった、借りができた","助かりましたわ。借りができてしまいましたわね"],
["医者の字じゃない","医者の字ではありませんわ"],
["同じものを見てる","同じものを見ていますわ"],
["同じ景色を見てる","同じ景色を見ていますわ"],
["懐中電灯は無事","懐中電灯は無事ですわ"],
["穴はなかった","穴はありませんでしたわ"],
["紙垂は罠の印か","紙垂は罠の印ですのね"],
["音が変だったのは、これか","音が変だったのは、これでしたのね"],
["その目で私の嘘も見える？","その目で私の嘘も見えますの？"],
["まだ、熱が残ってる","まだ、熱が残っていますわ"],
["ヒキガエルの神なら、火を嫌うはずだ。この村ごと――せめて神社の脇の家を焼けば、出てこられなくなる","ヒキガエルの神でしたら、火を嫌うはずですわ。この村ごと――せめて神社の脇のお屋敷を焼けば、出てこられなくなりましてよ",1],
["死ぬかもしれないから言っとく。ずっと、好きだった","死ぬかもしれませんから、申し上げておきますわ。ずっと、お慕いしておりました",1],
["この飴の包み紙……間違いない、あなたが犯人だ！","この飴の包み紙……間違いありませんわ、あなたが犯人ですのね！",1],
["犯人は、民宿の女将さんです","犯人は、民宿の女将さんですわ",1],
["そほどさまは、田を守ってくださる。よそ者から","そほどさまは、田を守ってくださいますの。よそ者から",1],
["全部分かってるんですよ！　観念しなさい！","全部分かっていますのよ！　観念なさいまし！",1],
["……ごめん。今は、自分が生き残らないと","……ごめんなさい。今は、自分が生き残らなければいけませんの",1],
["〈〉の居場所を教える。だから、私だけは見逃してくれ","〈〉さんの居場所をお教えしますわ。ですから、私だけは見逃してくださいまし",1],
["怖いから、一緒に寝てもいい？","怖いので、一緒に寝てもよろしくて？",1]]});
HK.Load.toneData("hero",{"F":[
["お前のせいで、こんな村に来たんだ！","お前のせいで、こんな村に来たんだぞ！",1],
["聞き方がきつすぎる","聞き方がきつすぎるだろ！",1]]});
HK.Load.toneData("mystic",{"F":[
["ヒキガエルの神なら、火を嫌うはずだ。この村ごと――せめて神社の脇の家を焼けば、出てこられなくなる","ヒキガエルの神なら、火は嫌いなはずだよ。この村ごと――せめて神社の脇の家を焼いてしまえば、もう出てこられないよ",1],
["ここの堰が、何十年も前に埋められてる。雨が降らないんじゃない。水が来なくなっただけだ","ここの堰、何十年も前に埋められているんだ。雨が降らないんじゃない。水が来なくなっただけなんだよ",1],
["神さまは怠け者でな。供物が足りんと、起きて自分で探しに来なさる","神さまは怠け者なんだ。供物が足りないと、起きて自分で探しに来なさるんだよ",1],
["〈〉の居場所を教える。だから、私だけは見逃してくれ","〈〉の居場所を教えるよ。だから、私だけは見逃してくれないかい",1],
["生贄なら、〈〉がいい。あいつは、村の秘密を嗅ぎ回ってる","生贄なら、〈〉がいいんだ。あの人、村の秘密を嗅ぎ回っているからね",1],
["犯人は村の誰か一人ではありません。村ぐるみです","犯人は村の誰か一人じゃないんだ。村ぐるみだよ",1],
["はちだいさまは、若い命と引き換えに雨をくださる","はちだいさまは、若い命と引き換えに雨をくださるんだよ",1],
["――カルコサだ。湖の向こうに、カルコサが見える","――カルコサなんだ。湖の向こうに、カルコサが見えるよ",1],
["なるほど。この村では最近、人が死んでいますね","なるほどね。この村では最近、人が死んでいるんだ",1],
["湖の主さまに選ばれた者は、永遠に生きられる","湖の主さまに選ばれた者はね、永遠に生きられるんだ",1],
["怖いから、一緒に寝てもいい？","怖いんだ。一緒に寝てもいいかい？",1],
["〈〉さんは、実は村人の変装なんです！","〈〉はね、実は村人の変装だ",1],
["生きて帰れたら、一緒にいてほしい","生きて帰れたら……一緒にいてほしいんだ",1]]});
HK.Load.toneData("genki",{"F":[
["どうか、御姿を","どうか、姿を見せてください……！"],
["神さまは怠け者でな。供物が足りんと、起きて自分で探しに来なさる","神さまって、怠け者なんですよ。供物が足りないと、起きて自分で探しに来ちゃうんです"],
["おはぐろさまに『綺麗』と答えちゃいかん","おはぐろさまに『綺麗』って答えちゃダメですよ"],
["ヒキガエルの神なら、火を嫌うはずだ。この村ごと――せめて神社の脇の家を焼けば、出てこられなくなる","ヒキガエルの神なら、火が苦手なはずです！　この村ごと――せめて神社の脇の家を焼いちゃえば、出てこられなくなりますよ",1],
["犯人は村の誰か一人ではありません。村ぐるみです","犯人は、村の誰か一人じゃないです。村ぐるみなんです！",1],
["封じる？　もったいない","封じちゃうんですか？　もったいないです！",1],
["この飴の包み紙……間違いない、あなたが犯人だ！","この飴の包み紙……間違いありません、あなたが犯人です！",1],
["こんなのただの石だろ","こんなの、ただの石ですよ！",1],
["〈〉の居場所を教える。だから、私だけは見逃してくれ","〈〉さんの居場所、教えます！　だから、私だけは見逃してください……！",1],
["呼ばれてるんだ。行かなきゃ","呼ばれてるんです。行かなきゃ！",1],
["今のはオフレコね","今のはオフレコでお願いしますね！",1],
["一緒に配信出ない？　絶対映えるって","一緒に配信出ません？　絶対映えますって！",1],
["悪いな。私は、生き残る方を選ぶ","ごめんなさい。私は、生き残るほうを選びます",1],
["これ、何。……村と取引したの？","これ、何ですか。……村と取引したんですか？",1]]});
HK.Load.toneData("darui",{"F":[
["あんた、前にも来たね","……あんた……前にも来たよね"],
["封じる？　もったいない","……封じる？……もったいない"],
["その目で私の嘘も見える？","……その目で私の嘘も見える？"],
["なるほど。この村では最近、人が死んでいますね","……なるほど。……この村、最近、人が死んでる",1],
["――カルコサだ。湖の向こうに、カルコサが見える","……カルコサ。……湖の向こうに、見える",1],
["……あの印を刻んだのは、あんただな","……あの印、刻んだのあんた",1],
["〈〉さんは、実は村人の変装なんです！","……〈〉さん、実は村人の変装",1],
["〈〉の居場所を教える。だから、私だけは見逃してくれ","……〈〉の居場所、教える。……だから、私だけ見逃して",1],
["おにいちゃん、こっち。お母さんが待ってるよ","……おにいちゃん、こっち。……お母さん、待ってる",1],
["この事件の謎は、すべて解けました","……この事件の謎、ぜんぶ解けた",1],
["この村、絶対なんかありますよね！","……この村、ぜったいなんかある",1],
["これ、ドッキリでしょ？　誰の仕込み？","……これ、ドッキリでしょ。……誰の仕込み",1],
["ひながたさまは、村を作って、遊んでおられる","……ひながたさまは、村を作って、遊んでる。……らしい",1],
["ふむ。この名探偵の目は誤魔化せませんよ","……この名探偵の目は、誤魔化せない。……たぶん",1],
["ヒキガエルの神なら、火を嫌うはずだ。この村ごと――せめて神社の脇の家を焼けば、出てこられなくなる","……ヒキガエルの神なら、火が嫌いなはず。……せめて神社の脇の家、焼けば……出てこられない",1],
["湖の主さまに選ばれた者は、永遠に生きられる","……湖の主さまに選ばれたら、永遠に生きられる。……らしい",1],
["犯人は、ひとつだけミスをしています","……犯人、ひとつだけミスしてる",1],
["犯人は村の誰か一人ではありません。村ぐるみです","……犯人、一人じゃない。……村ぐるみ",1],
["生贄なら、〈〉がいい。あいつは、村の秘密を嗅ぎ回ってる","……生贄なら、〈〉。……村の秘密、嗅ぎ回ってるし",1],
["種明かしのとき、またよろしくお願いしますね","……種明かしのときも。……よろしく",1],
["蛇を殺した者は、蛇の父さまに呪われる","……蛇殺したら、蛇の父さまに呪われる。……らしい",1],
["みいさんは、嫁を一人ずつ娶りなさる","……みいさんは、嫁を一人ずつ娶る。……らしい",1],
["一緒に帰ろう。……今度は、置いていかない","……いっしょに帰ろ。……今度は、置いてかない",1],
["神さまは怠け者でな。供物が足りんと、起きて自分で探しに来なさる","……神さま、怠け者。……供物が足りないと、自分で探しに来る",1]]});
HK.Load.toneData("sondai",{"F":[
["ヒキガエルの神なら、火を嫌うはずだ。この村ごと――せめて神社の脇の家を焼けば、出てこられなくなる","ヒキガエルの神ならば、火を嫌うはずだ。この村ごと――せめて神社の脇の家を焼けば、もう出てはこられまい",1],
["ここの堰が、何十年も前に埋められてる。雨が降らないんじゃない。水が来なくなっただけだ","ほう、ここの堰が何十年も前に埋められている。雨が降らないのではない。水が来なくなっただけだよ",1],
["神さまは怠け者でな。供物が足りんと、起きて自分で探しに来なさる","神さまというのは怠け者でね。供物が足りんと、起きて自ら探しに来なさるのだよ",1],
["はちだいさまは、若い命と引き換えに雨をくださる","はちだいさまは、若い命と引き換えに雨をくださるのだよ",1],
["――カルコサだ。湖の向こうに、カルコサが見える","――カルコサだ。湖の向こうに、カルコサが見えるではないか",1],
["湖の主さまに選ばれた者は、永遠に生きられる","湖の主さまに選ばれた者は、永遠に生きられるのだよ",1],
["怖いから、一緒に寝てもいい？","……怖いのでね。一緒に寝てやってもいいが、どうかね",1],
["お前のせいで、こんな村に来たんだ！","君のせいで、こんな村に来る羽目になったのだぞ！",1],
["ふむ。この名探偵の目は誤魔化せませんよ","ふむ。この名探偵の目は誤魔化せんよ",1],
["……撮ってる場合じゃない","……撮っている場合ではないぞ",1],
["……村の連中のせいにすればいい","……村の連中のせいにすればよかろう",1],
["改めて、よろしく頼む","改めて、よろしく頼むよ",1],
["祭りの前の、顔合わせの宴です。今夜は飲んでいってください","祭りの前の、顔合わせの宴だ。今夜は存分に飲んでいきたまえ",1],
["犯人は、あなただな！　さっき、靴紐を結び直していた。証拠隠滅だ！","犯人は君だな！　さっき、靴紐を結び直していただろう。証拠隠滅だ！",1],
["その話、どこで聞いた。出典がない。信じない方がいい","その話、どこで聞いたのかね。出典がない。信じない方が身のためだ",1]]});
HK.Load.toneData("keigo_sarc",{"F":[
["待ってください。古文書にそんな記述はありません。燃やしたって、あれは眠ったままどこへでも滲み出てきます","待ってください。古文書のどこに、そんな記述が？　燃やしたところで無駄です。あれは眠ったまま、どこへでも滲み出てきます",1]]});
});
HK.Load.done('scen-jashin', '706b8fe741', 1);
