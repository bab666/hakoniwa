;
/* ==== js/rpg-special.js ==== */
HK.Load.def(172,'js/rpg-special.js',function(){
(function(){
'use strict';
var HK=window.HK,SP=HK.Special;
if(!SP)return;
var LOVE= /^(lover|mate|fated|almost|fwb)$/,FAM= /^(sibling|sibprot|sibclose|parent|pparent|relative)$/,CLOSE= /^(best|buddy|childhood|friend|mentor|master|teacher|senpai|colleague|classmate|boss|benefactor|worship|fond|blind)$/,BAD= /^(enemy|rival|bad|sibbad)$/;
function clamp(v,a,b){return Math.max(a,Math.min(b,v));}
function tie(S,a,b){
var t=(S.ties||[]).filter(function(x){return(x.a===a.i&&x.b===b.i)||(x.a===b.i&&x.b===a.i);})[0];
return t?t.type:'';
}
function adapter(S,floor){
var A=S.spA;
if(!A)A=S.spA={
rng:S.rng,all:S.P,r18:false,env:S.env,scenId:'rpg',
alive:function(p){return!!(p.alive||p.captive);},
here:function(p){return!p.captive;},
say:function(o){var r=HK.Story.say(S,o);if(o.key&&r)HK.Story.key(S,r,o.key);return r;},
hp:function(p){return Math.round(p.hp/p.mhp*100);},
setHp:function(p,v){p.hp=clamp(Math.round(p.mhp*v/100),0,p.mhp);if(p.hp<=0&&p.alive){p.alive=false;p.down++;}},
full:function(){return 100;},
stress:function(p){return p.rs||0;},
addStress:function(p,v){p.rs=clamp((p.rs||0)+v,0,100);},
rel:function(a,b){var t=tie(S,a,b);return{love:LOVE.test(t),w:LOVE.test(t)?1:FAM.test(t)?0.8:CLOSE.test(t)?0.55:BAD.test(t)? -0.5:0.1};},
revive:function(p){p.alive=true;p.fate='';},
kill:function(p,how,text){p.alive=false;p.hp=0;p.fate=how+'倒れ、二度と起き上がらなかった';HK.Story.say(S,{actors:[p],tag:'死',kind:'climax',text:text,why:how+'命を落とした',mag:40});},
zombie:function(){return false;}
};
A.nowH=floor*12;
return A;
}
HK.RPG_SPEC={
setup:function(S,input){
S.ties=S.ties||(HK.Story&&HK.Story.tiesOk?HK.Story.tiesOk(S.P,input.ties):input.ties||[]);
SP.setup(adapter(S,0),S.P,function(p){return input.perChar&&input.perChar[p.i];});
},
label:function(p){return p.spec?'・'+SP.LABEL[p.spec]:'';},
floor:function(S,floor){
var A=adapter(S,floor);
SP.revive(A);
S.P.forEach(function(p){
if(!p.alive)return;
A.addStress(p,3);
if(p.mad)SP.madTurn(A,p);
else if(p.spec==='vampire')SP.vampTurn(A,p);
else SP.wear(A,p,{base:55,lim:22});
});
},
revive:function(S,floor){SP.revive(adapter(S,floor));},
hurt:function(p,d){if(p.spec)p.rs=clamp((p.rs||0)+d*0.9+(p.alive?0:20),0,100);},
note:function(p){return SP.endNote(p);}
};
})();
});
;
/* ==== js/rpg-data.js ==== */
HK.Load.def(191,'js/rpg-data.js',function(){
(function(){
'use strict';
var HK=window.HK;
function L(s){return s.split('|');}
var R=HK.RPGData={};
R.BOSSES=[
{n:'ゴブリンキング',p:16,g:80,t:0,k:'summon',in:'玉座の間で、王冠をかぶったゴブリンが手下を呼び集めていた。'},
{n:'巨大スライム',p:15,g:70,t:0,k:'split',in:'部屋いっぱいに膨れ上がったスライムが、ぶるりと震えた。'},
{n:'ジャイアントラット・クイーン',p:17,g:75,t:0,k:'poison',in:'下水の奥から、無数の鼠を従えた巨大な女王鼠が現れた。'},
{n:'人食い宝箱の主',p:18,g:140,t:0,k:'greed',in:'黄金の山の真ん中で、宝箱がゆっくりと口を開けた。'},
{n:'ミノタウロスの王',p:28,g:160,t:1,k:'rage',in:'迷路の中心で、巨大な斧を引きずる牛頭の王が吠えた。'},
{n:'蜘蛛の女王アラクネ',p:26,g:150,t:1,k:'bind',in:'天井一面の巣から、上半身が女の姿をした蜘蛛が降りてきた。'},
{n:'首なし騎士',p:27,g:155,t:1,k:'terror',in:'蹄の音とともに、首のない騎士が槍を構えた。'},
{n:'メデューサ',p:26,g:170,t:1,k:'stone',in:'蛇の髪がざわめいた。「私の目を見なさい」'},
{n:'双子のオーガ',p:29,g:150,t:1,k:'twin',in:'同じ顔をした二体のオーガが、同時に棍棒を振り上げた。'},
{n:'骨の竜',p:38,g:220,t:2,k:'curse',in:'骨だけになった竜が、虚ろな眼窩に青い炎を灯した。'},
{n:'魔女の亡霊',p:34,g:200,t:2,k:'charm',in:'甘い歌声が聞こえた。振り向くと、半透明の魔女が微笑んでいた。'},
{n:'吸血鬼の伯爵',p:36,g:240,t:2,k:'drain',in:'燭台の灯る広間で、伯爵が優雅に一礼した。「ようこそ、我が城へ」'},
{n:'スフィンクス',p:35,g:230,t:2,k:'riddle',in:'巨大な獅子が、人の顔で問いかけた。「答えよ。答えられねば、喰らう」'},
{n:'炎の魔人イフリート',p:40,g:250,t:2,k:'burn',in:'床が赤く溶けた。炎そのものが、人の形をとって立ち上がった。'},
{n:'ゴーレムの番人',p:39,g:210,t:2,k:'armor',in:'石の巨人が軋む音を立てて、扉の前で目を覚ました。'},
{n:'古代竜',p:50,g:400,t:3,k:'burn',in:'黄金の山の上で、山のような竜が片目を開けた。'},
{n:'魔王の影',p:58,g:500,t:3,k:'terror',in:'闇が凝り固まって、王の形をとった。「よくぞ来た、愚かな者たちよ」'},
{n:'堕天使',p:55,g:460,t:3,k:'charm',in:'黒い翼の天使が、悲しげに剣を抜いた。'},
{n:'深淵のクラーケン',p:54,g:450,t:3,k:'bind',in:'地底湖が泡立ち、無数の触腕が水面を割った。'},
{n:'時の番人',p:60,g:520,t:3,k:'time',in:'砂時計を抱えた老人が言った。「お前たちの時間は、ここで止まる」'}
];
R.GIM={
summon:L('{x}の号令で、手下がわらわらと湧いてきた。'),
split:L('斬るたびに、{x}は小さく分裂して数を増やした。'),
poison:L('{x}の牙がかすめ、{a}の顔色が紫に変わった。'),
greed:L('{x}は金貨をまき散らした。{a}が思わず手を伸ばしかけた。'),
rage:L('傷つくほどに、{x}の攻撃は激しくなった。'),
bind:L('{a}の手足に、粘つく糸が絡みついた。動けない！'),
terror:L('{x}の気配に、{a}の膝が震えた。足がすくんで、前に出られない。'),
stone:L('{a}が{x}と目を合わせてしまった。指先から、石になっていく！'),
twin:L('二体は息の合った連携で、前衛を挟み撃ちにした。'),
curse:L('{x}の咆哮が、全員の武器を錆びつかせた。'),
charm:L('{a}の目がとろんと曇った。「……{x}様のために……」――{a}は仲間に刃を向けた！'),
drain:L('{x}は{a}の首筋に牙を立て、力を吸い取った。'),
riddle:L('「朝は四本、昼は二本、夜は三本。これは何だ」'),
burn:L('灼熱の息が、パーティを包み込んだ。'),
armor:L('どれだけ斬りつけても、石の体には傷ひとつつかない。'),
time:L('砂時計が逆さになった。さっき与えた傷が、なかったことになった。')
};
R.BREAK={
riddle:L('{a}が一歩前に出た。「答えは、人間だ｜＝｜答えは、人間です」――{x}は苦々しげに唸り、隙を見せた。|{a}は少し考えて答えた。「人間。赤ん坊は四つん這い、大人は二本足、老人は杖をつく｜＝｜人間です。赤ん坊は四つん這い、大人は二本足、老人は杖をつきます」'),
charm:L('{b}が{a}の頬を思い切り叩いた。「目を覚まして！｜目を覚ませ！｜目を覚ましてください！」――{a}の瞳に光が戻った。|{b}が{a}の名前を叫び続けた。三度目で、{a}は我に返った。'),
stone:L('{b}が鏡の盾を掲げて、{x}の視線を跳ね返した。|{b}が{a}に目隠しをさせて、手を引いて下がらせた。'),
terror:L('{b}が{a}の背中を叩いた。「大丈夫、一緒にいるよ｜大丈夫だ、一緒にいる｜大丈夫です、一緒にいます」――震えが、止まった。'),
bind:L('{b}が短剣で糸を断ち切った。'),
armor:L('{a}が石の継ぎ目を見抜いた。「関節だよ！　そこだけ柔らかい！｜関節だ！　そこだけ柔らかい！｜関節です！　そこだけ柔らかいです！」'),
greed:L('{b}が{a}の襟首を掴んで引き戻した。「罠だって！｜罠だと言っている！｜罠ですって！」')
};
R.QUARREL={
why:L('取り分をめぐって|進む道をめぐって|撤退するかどうかで|さっきの罠は誰のせいかで|見張りの順番で|最後の回復薬を誰が使うかで|戦い方の好みで|休憩の長さで'),
fight:L('{a}と{b}は{w}言い争いになった。「あなたのやり方じゃ全員死ぬ！｜あなたのやり方では全員死ぬ！｜あなたのやり方では全員死にます！」「そっちこそ！｜＝｜そちらこそ！」|{a}が{b}の胸ぐらを掴んだ。{w}の口論は、もう少しで殴り合いになるところだった。|{a}と{b}は{w}口をきかなくなった。焚き火の両端に、背中合わせで座った。|{w}、{a}は{b}に怒鳴った。{b}も一歩も引かなかった。'),
make:L('{c}が二人の間に割って入った。「仲間割れしてる場合じゃないでしょ｜仲間割れしている場合ではないだろう｜仲間割れしている場合ではありません」――二人は渋々、握手をした。|しばらくして、{a}のほうから頭を下げた。{b}も「こっちも悪かった｜こちらも悪かった｜こちらこそ、すみませんでした」と返した。|{a}は黙って、自分の干し肉を半分{b}に渡した。それが仲直りの合図だった。'),
grudge:L('{a}と{b}のあいだには、気まずい空気が残った。'),
later:L('{a}が倒れかけたとき、真っ先に駆け寄ったのは、喧嘩していた{b}だった。「……借りは返すよ｜……借りは返す｜……借りは返します」|戦いのあと、{a}と{b}はどちらからともなく拳を合わせた。喧嘩のことは、もう誰も口にしなかった。')
};
R.HOST={
take:L('突然、床に魔法陣が光った。「その者はいただいていく」――黒衣の魔術師が、{a}の腕を掴んで闇に消えた。|霧の中から現れた魔術師が、{a}に眠りの呪文をかけて連れ去った。「返してほしくば、地下{d}階まで来い」|{a}の足元の影が、ぬるりと伸びて{a}を飲み込んだ。高笑いが遠ざかっていく。'),
react:L('{b}は{a}が消えた場所の床を拳で殴った。「必ず取り返す｜＝｜必ず取り返します」|{b}は震える声で言った。「……行こう。{a}を、迎えに｜……行くぞ。{a}を、迎えに｜……行きましょう。{a}さんを、迎えに」|{b}は武器を握り直した。目が据わっていた。'),
reactTie:L('{b}は{a}の名前を叫んだ。誰よりも大事な人を、目の前で奪われた。|{b}は泣かなかった。泣くのは、{a}を取り返してからだと決めた。'),
captive:L('牢の中で、{a}は鎖を噛みちぎろうとしていた。|捕らわれの{a}は、魔術師に向かって「どうせ仲間が来るよ｜どうせ仲間が来る｜どうせ仲間が来ます」と言い放った。|{a}は牢の壁に、仲間への目印を爪で刻み続けた。|{a}は牢番のゴブリンと世間話をして、逃げ道の情報を聞き出していた。'),
rescue:L('魔術師の塔の最上階で、{a}は鎖につながれていた。{b}が叫んだ。「待たせた！｜＝｜お待たせしました！」|魔術師が杖を構えた。「よくぞここまで。だが、人質は渡さん」'),
freed:L('鎖が外れた瞬間、{a}は{b}に飛びついた。「遅い！｜＝｜遅いです！」「ごめん｜すまない｜すみません」――二人とも笑っていた。|{a}は仲間の顔を見て、ようやく張り詰めていたものが切れた。|{a}は自分で鎖を外して、背後から魔術師を殴り倒した。「……捕まってる間、暇だったから｜……捕まっている間、暇だったからな｜……捕まっている間、暇でしたから」'),
lost:L('{a}は、魔術師の塔に囚われたままになった。|パーティは、{a}を取り戻せないまま地上へ戻った。')
};
R.RIDDLE={door:L('扉に古い文字が刻まれていた。「正しき答えを唱えよ」|喋る扉が言った。「私の問いに答えられたら、開けてやろう」'),ok:L('{a}が答えを唱えると、扉の向こうに宝物庫が開けた。|{a}はしばらく考えて、正解を言い当てた。扉の奥には金貨の山があった。'),ng:L('{a}が自信満々に答えた。扉から電撃が走った。|誰も答えられず、扉は固く閉ざされたままだった。')};
R.CURSED={find:L('祭壇の上に、黒く輝く剣が突き立っていた。|骨の山の上に、禍々しい兜が転がっていた。'),take:L('{a}は止める声も聞かずに、それを手に取った。力が湧いてくる――代わりに、体が少しずつ蝕まれていく。'),leave:L('{a}は首を振った。「あれは、触っちゃいけないやつだよ｜あれは、触ってはいけないものだ｜あれは、触ってはいけないものです」――パーティは祭壇を素通りした。')};
R.GAMBLE={open:L('迷宮の角で、ゴブリンが賭場を開いていた。「一発勝負、やってくかい？」|骸骨の賭博師が、サイコロを振って誘った。'),win:L('{a}は有り金を賭けて――大勝ちした。ゴブリンが泣きながら金貨を払った。'),lose:L('{a}は熱くなって賭け続け――気づけば財布が軽くなっていた。'),pass:L('{a}は賭場をちらりと見て、通り過ぎた。')};
R.STATUE={open:L('苔むした女神像が、静かに祈りを待っていた。|古い神殿の奥に、目を閉じた石像があった。'),pray:L('{a}は膝をついて、仲間の無事を祈った。像の目が、一瞬だけ光った。'),skip:L('誰も祈ろうとはしなかった。')};
R.SECRET=L('{a}は壁のわずかな隙間に気づいた。押すと、隠し通路が開いた。|{a}は床の模様が一枚だけ違うことに気づき、隠し部屋を見つけた。');
R.COOK=L('{a}は倒した魔物の肉で、即席の鍋を作った。「意外といけるでしょ？｜意外といけるだろう｜意外といけるでしょう？」|{a}は迷宮のキノコを見分けて、スープを作った。全員の顔色がよくなった。|{a}が焚き火で焼いた肉に、全員が群がった。');
R.ENC=L('{m}が現れた！|{m}が襲いかかってきた！|曲がり角の先で、{m}が待ち構えていた。|{m}が行く手を塞いだ！|暗がりから{m}が飛び出してきた！|{m}の群れに囲まれた！|背後から{m}の気配がした。|{m}が、獲物を見つけたように目を光らせた。|天井から{m}が降ってきた！|{m}が床を突き破って現れた！');
R.FIN=L('{m}を倒した！|{m}は崩れ落ちた。|{m}は霧になって消えた。|{m}は悲鳴を上げて逃げていった。|{m}は動かなくなった。|最後の一撃で、{m}が沈んだ。|{m}を退けた。|{m}は塵になって散った。');
R.JOBACT={
warrior:L('{a}の剣が閃いた。|{a}は盾で受け止め、そのまま押し返した。|{a}は大上段から斧を振り下ろした。|{a}が雄叫びとともに突っ込んだ。'),
mage:L('{a}の杖の先から、炎の矢が放たれた。|{a}が詠唱を終えると、雷が落ちた。|{a}は氷の槍を三本、同時に放った。|{a}の魔法陣が床一面に広がった。'),
priest:L('{a}は祈りの言葉で、仲間の傷をふさいだ。|{a}の聖なる光が、闇を払った。|{a}は錫杖で魔物を打ち据えた。'),
thief:L('{a}は背後に回り込み、急所に刃を叩き込んだ。|{a}の投げナイフが、正確に眉間を捉えた。|{a}は煙玉で目をくらませた。|{a}は軽業のように宙を舞った。'),
hunter:L('{a}の矢が、寸分違わず目を射抜いた。|{a}は罠に誘い込んで、一網打尽にした。|{a}は弓を引き絞り、三連射した。'),
bard:L('{a}の勇ましい歌に、仲間の士気が上がった。|{a}は竪琴をかき鳴らし、魔物を眠らせた。|{a}の口笛が、仲間に合図を送った。')
};
R.X={
chestGold:L('宝箱には、古代の銀貨が袋いっぱいに詰まっていた。|宝箱の中で、大粒のルビーが赤く光っていた。|宝箱には、誰かの冒険日誌と、へそくりの金貨が入っていた。|宝箱の中は、金の燭台と銀の皿でいっぱいだった。|宝箱を開けると、真珠の首飾りがこぼれ落ちた。|宝箱には、魔法の指輪が一つだけ入っていた。鑑定すれば高く売れそうだ。|宝箱には、王家の紋章が入った金のメダルがあった。'),
loot:L('{a}「やった、これで当分は困らない！｜よし、これで当分は困らない！｜やった、これで当分は困りません！」|{a}は金貨を一枚かじってみた。「本物だ｜＝｜本物です」|{a}「山分けね、山分け｜山分けだ、山分け｜山分けですね、山分け」|{a}は目を輝かせた。「ねえ、これ売ったらいくらになる？｜これを売ったらいくらになる｜あの、これを売ったらいくらになりますか？」|{a}「ダンジョン、悪くないかも｜ダンジョンも、悪くないな｜ダンジョン、悪くないかもしれません」|{a}は宝を丁寧に布で包んだ。'),
fount:L('壁の割れ目から、湯気の立つ温泉が湧いていた。|岩のくぼみに、甘い香りのする水が溜まっていた。|妖精が舞う小さな泉が、ひっそりと光っていた。|聖水の満ちた古い噴水が、まだ動いていた。'),
trapOk:L('{a}は踏み出しかけた足を止めた。「待って。この床、色が違う｜待て。この床、色が違う｜待ってください。この床、色が違います」|{a}は壁の小さな穴に気づき、皆を伏せさせた。直後、矢が頭上を通り過ぎた。|{a}が糸を見つけて切った。天井の岩は、落ちてこなかった。|{a}は小石を投げて床を確かめた。小石は、床ごと奈落に消えた。'),
trapHit:L('壁から槍が突き出した。|足元の床が抜けた。|天井が少しずつ下がってきた。|宝石を拾った瞬間、部屋に水が流れ込んできた。|鎖につながれた振り子の刃が、通路を往復した。'),
greed:L('{a}は宝石を一つ、こっそりポケットに入れた。{b}はそれを見逃さなかった。|{a}は「見つけたのは私だから｜見つけたのは私だからな｜見つけたのは私ですから」と、取り分の多さを主張した。{b}は呆れた顔をした。|{a}と{b}は、魔法の指輪を誰が持つかで揉めた。|{a}は勝手に金貨を数え直して、{b}に「計算が合わない｜＝｜計算が合いません」と詰め寄った。'),
shop:L('骸骨の行商人が、カタカタと笑いながら品物を並べた。|喋る猫が、背負った箱から薬瓶を取り出した。「安くしとくニャ」|迷宮に住み着いたドワーフが、鍛冶場を兼ねた店を開いていた。|壁の向こうから、腕だけが伸びてきた。「まいど」'),
camp:L('{a}は{b}に、子どもの頃の夢を話した。|{a}と{b}は、地図を囲んで明日の道順を相談した。|{a}は{b}の傷に、薬草を貼ってやった。|{a}と{b}は、どっちが先に寝るかで押し付け合った。|{a}は{b}の寝顔を見ながら、見張りの火を絶やさなかった。|{a}と{b}は、地上に戻ったら行きたい店の話で盛り上がった。'),
lost:L('崩れた岩の下から、うめき声が聞こえた。|迷宮の奥で、道に迷った吟遊詩人が泣いていた。|罠にかかった小さなドラゴンが、もがいていた。|ゴーストの少女が、失くした人形を探していた。'),
statue:L('{a}は女神像の足元に、拾った花を一輪供えた。|{a}は手を合わせて、仲間の無事を願った。|{a}は像に向かって、小さな声で旅の報告をした。'),
cook:L('{a}は干し肉と薬草で、意外なほどうまいスープを作った。|{a}が持ってきた香辛料で、魔物の肉が絶品に変わった。|{a}は焚き火で、甘い木の実を焼いてくれた。|{a}のおにぎりに、全員が涙ぐんだ。')
};
})();
});
;
/* ==== js/scenario-rpg.js ==== */
HK.Load.def(192,'js/scenario-rpg.js',function(){
(function(){
'use strict';
var HK=window.HK;
function L(s){return s.split('|');}
function clamp(v,a,b){return Math.max(a,Math.min(b,v));}
var JOBS={
warrior:{label:'戦士',hp:34,atk:9,def:6,fit:function(t){return t.aggr*0.6+t.cp*0.3+(1-t.caution)*0.2;}},
mage:{label:'魔法使い',hp:20,atk:12,def:2,fit:function(t){return t.a*0.7+t.cold*0.2;}},
priest:{label:'僧侶',hp:24,atk:4,def:4,heal:true,fit:function(t){return t.np*0.7+t.ac*0.2;}},
thief:{label:'盗賊',hp:24,atk:7,def:3,thief:true,fit:function(t){return t.fc*0.4+t.impulse*0.4+t.caution*0.1;}},
hunter:{label:'狩人',hp:26,atk:8,def:4,fit:function(t){return t.caution*0.5+t.a*0.3;}},
bard:{label:'吟遊詩人',hp:22,atk:5,def:3,bard:true,fit:function(t){return t.fc*0.5+t.np*0.4;}}
};
var JOB_IDS=Object.keys(JOBS);
var MON=[
[['スライム',4,6],['大コウモリ',5,8],['ゴブリン',6,12],['毒キノコの群れ',5,5],['化けネズミ',4,4],['ジャイアントアント',6,9]],
[['オーク',10,20],['スケルトン',9,15],['人食い植物',10,14],['ゴブリンの群れ',11,25],['ジャイアントスパイダー',12,18],['さまよう鎧',12,22]],
[['トロル',16,40],['ミノタウロス',18,50],['レイス',15,35],['キメラ',19,55],['オーガ',17,45],['石化トカゲ',16,38]],
[['ドラゴンの幼体',25,90],['デーモン',27,100],['リッチ',26,110],['ヒュドラ',28,95],['黒騎士',25,85],['影の魔術師',24,80]]
];
var BOSS=[['ゴブリンキング',16,80],['巨大スライム',18,70],['ミノタウロスの王',30,160],['骨の竜',38,220],['魔女の亡霊',34,200],['古代竜',50,400],['魔王の影',60,500]];
var SAY={
attack:{
proud:L('「邪魔、どいて！｜邪魔だ、どけ！｜邪魔です、どいてください！」|「この程度？｜この程度か｜この程度ですか」|「次！」'),stern:L('「隙だらけだよ｜隙だらけだ｜隙だらけです」|「一撃で決めるよ｜一撃で決める｜一撃で決めます」|「下がってて｜下がっていろ｜下がっていてください」'),tsun:L('「べ、別にあんたのためじゃないから！」|「さっさと倒れなさいよ！」'),
gentle:L('「ごめんね、通してもらうよ｜悪いが、通してもらう｜すみません、通らせていただきます」|「えいっ」|「みんな、下がってて｜みんな、下がっていろ｜みんな、下がっていてください」'),devoted:L('「みんなには、触らせない……！｜＝｜みんなには、触らせません……！」|「まだ、いける……！｜＝｜まだ、いけます……！」'),cool:L('「弱点は右脚だよ｜弱点は右脚だ｜弱点は右脚です」|「計算通り｜計算通りだ｜計算通りです」|「効率よくいこう｜効率よくいく｜効率よくいきましょう」'),
free:L('「よっしゃ、いっくぞー！」|「楽しくなってきた！｜＝｜楽しくなってきました！」|「くらえっ！」'),shy:L('「ご、ごめんなさいっ……！」|「えい……っ」'),polite:L('「失礼いたします」|「お覚悟を」')
},
hurt:{
proud:L('「ちっ……かすり傷だよ｜ちっ……かすり傷だ｜ちっ……かすり傷です」'),stern:L('「……問題ないよ｜……問題ない｜……問題ありません」'),tsun:L('「い、痛くなんかないし！」'),gentle:L('「あいたた……大丈夫、大丈夫」'),devoted:L('「平気です……まだ戦えます」'),
cool:L('「想定内の損傷だよ｜想定内の損傷だ｜想定内の損傷です」'),free:L('「いったぁ！　やったね！｜いったぁ！　やったな！｜いったぁ！　やりましたね！」'),shy:L('「う、うぅ……」'),polite:L('「お見苦しいところを……」')
},
loot:{
proud:L('「当然の報酬だね｜当然の報酬だな｜当然の報酬ですね」'),stern:L('「記録しておくね｜記録しておく｜記録しておきます」'),tsun:L('「ま、まあ悪くないんじゃない？」'),gentle:L('「わあ、きれいだね｜ほう、きれいだな｜わあ、きれいですね」'),devoted:L('「みんなの分、ちゃんと分けよう｜みんなの分、ちゃんと分ける｜みんなの分、ちゃんと分けましょう」'),
cool:L('「相場の三倍はあるよ｜相場の三倍はある｜相場の三倍はあります」'),free:L('「お宝だー！」'),shy:L('「す、すごい……」'),polite:L('「ありがたく頂戴いたします」')
}
};
function say(p,kind){var T=SAY[kind]||{};var l=T[p.persona]||T.gentle;return l?p.name+l[Math.floor(p._r()*l.length)]:'';}
var CHEST={gold:L('宝箱の中には、金貨がぎっしり詰まっていた。|宝箱には、宝石のついた短剣が入っていた。売ればいい値になりそうだ。|宝箱の底から、古い王国の金貨が出てきた。'),potion:L('宝箱には、回復薬が二本入っていた。'),trap:L('宝箱を開けた瞬間、毒針が飛び出した。|宝箱から、催眠ガスが噴き出した。'),mimic:L('宝箱が口を開けた。ミミックだった！')};
var CAMP=L('{a}と{b}は焚き火を挟んで、地上に戻ったら何をするか話した。|{a}は{b}の装備のほつれを、黙って直してやった。|{a}は{b}に、子どもの頃に読んだ冒険譚の話をした。{b}は「今まさにそれだね｜今まさにそれだな｜今まさにそれですね」と笑った。|{a}と{b}は、どちらが多く倒したかで言い合いになった。結局、引き分けということにした。|{a}は眠れない{b}の隣で、見張りを代わった。');
var GREED=L('{a}は財宝の山を前に、「全部持って帰る｜＝｜全部持って帰ります」と言い張った。{b}は「重くて走れなくなるよ｜重くて走れなくなる｜重くて走れなくなります」と止めた。|{a}は分け前を多めに取ろうとして、{b}に睨まれた。');
var SHOP=L('迷宮の中に、なぜか商人がいた。「いらっしゃい、命より安いものしか置いてないよ」|フードをかぶった商人が、壁のくぼみで店を広げていた。');
var FOUNTAIN=L('澄んだ泉が湧いていた。|淡く光る泉が、部屋の真ん中にあった。');
var LOST=L('迷宮で迷っていた冒険者が、助けを求めてきた。|檻に閉じ込められた商人の娘が、助けてと叫んでいた。|傷ついた子竜が、うずくまって震えていた。');
(function(){
var X=HK.RPGData&&HK.RPGData.X;
if(!X)return;
CHEST.gold=CHEST.gold.concat(X.chestGold);FOUNTAIN.push.apply(FOUNTAIN,X.fount);SHOP.push.apply(SHOP,X.shop);
CAMP.push.apply(CAMP,X.camp);GREED.push.apply(GREED,X.greed);LOST.push.apply(LOST,X.lost);
HK.RPGData.STATUE.pray=HK.RPGData.STATUE.pray.concat(X.statue);HK.RPGData.COOK=HK.RPGData.COOK.concat(X.cook);
})();
var scen={
id:'rpg',name:'ダンジョンRPG',kicker:'パーティ・冒険',
desc:'パーティを組んでダンジョンへ。階ごとにランダムな戦闘・宝箱・罠・商人・泉が待つ。誰が前に出て、誰が宝箱に手を伸ばし、どこで引き返すのか。地下30階の主を倒せば踏破、引き返せば帰還、全員倒れれば全滅。',
solo:true,minCast:1,maxCast:6,unit:'階',
castHint:'1〜6人のパーティで潜ります。職業は「おまかせ」ならエゴグラムから決まります。前に出るか、宝箱を開けるか、引き返すかは気質の数値で決まります。踏破できるのは一割ほど。多くは途中で引き返します。',
simulate:function(input){return run(input);},
derived:['caution','aggr','impulse','lead'],
env:[
{id:'floors',label:'目標の階層',min:5,max:50,def:30,lo:'5階',hi:'50階',unit:'階',desc:'5階ごとに階層の主（ボス）が階段を守る。目標の階の主を倒せば踏破（クリア）'},
{id:'danger',label:'魔物の強さ',min:0,max:100,def:50,lo:'やさしい',hi:'鬼畜'},
{id:'loot',label:'お宝の多さ',min:0,max:100,def:50,lo:'しょっぱい',hi:'黄金郷'},
{id:'retreat',label:'撤退',type:'select',def:'auto',options:[{v:'auto',label:'気質しだいで引き返す'},{v:'never',label:'絶対に引き返さない（踏破か全滅か）'}]}
],
stats:[
{id:'str',label:'腕っぷし',desc:'戦闘での強さ'},
{id:'luck',label:'運',desc:'宝箱の中身・罠の回避・会心の一撃'},
{id:'int',label:'知能',desc:'謎かけ・階層の主の仕掛けを見抜く力（性格とは別）'}
],
perFields:[{id:'job',label:'職業',auto:'おまかせ（エゴグラムから）',options:JOB_IDS.map(function(k){return{id:k,label:JOBS[k].label};})}],
actions:[
{id:'front',label:'前に出て戦う',fit:function(t){return t.aggr*0.6+t.cp*0.3;}},
{id:'support',label:'仲間を支える',fit:function(t){return t.np*0.6+t.ac*0.2;}},
{id:'careful',label:'慎重に進む',fit:function(t){return t.caution*0.6+t.a*0.3;}}
],
goals:[
{id:'gold',label:'お金を稼ぐ',fit:function(t){return t.fc*0.4+t.impulse*0.3+t.cold*0.2;}},
{id:'deep',label:'最深部を目指す',fit:function(t){return t.cp*0.4+t.aggr*0.3+t.fc*0.2;}},
{id:'live',label:'全員で生きて帰る',fit:function(t){return t.np*0.5+t.caution*0.4;}}
],
events:[]
};
HK.SCENARIOS.rpg=scen;
if(HK.SCEN_ORDER.indexOf('rpg')<0)HK.SCEN_ORDER.push('rpg');
function resolve(S,p,list,pick){
if(pick&&pick!=='auto')for(var i=0;i<list.length;i++)if(list[i].id===pick)return list[i];
return HK.weighted(S.rng,list,function(o){return Math.pow(Math.max(0.02,o.fit(p.tr)),3);});
}
function tieOf(input,a,b){
var t=(input.ties||[]).filter(function(x){return(x.a===a.i&&x.b===b.i)||(x.a===b.i&&x.b===a.i);})[0];
return t?t.type:'';
}
function run(input){
var ST=HK.Story,S=ST.state(input,'rpg'),rng=S.rng,env=S.env,P=S.P;
S.egoNotes=true;S.bondFn=function(S0,a,b){var t=tieOf(input,a,b);return/lover|mate|fated|best|crush|almost|yan/.test(t)?0.4: /friend|buddy|childhood|sibling|sibclose|sibprot|parent|mentor/.test(t)?0.25: /enemy|bad|rival/.test(t)? -0.35:0;};
var dmul=0.7+env.danger/100*0.9,lmul=0.6+env.loot/100*1.2;
var pot=Math.max(1,Math.round(P.length*0.7)),gold=0,floor=0,banked=0,ended='',bossDown=0,retreatBy=null,retreatWhy='',retreatMad=false,eternal=null;
var BOSS_MAX=6;
P.forEach(function(p){
var pc=(input.perChar&&input.perChar[p.i])||{},pick=(pc.pick||{}).job;
p._r=rng;
p.job=JOBS[pick]?pick:HK.weighted(rng,JOB_IDS,function(k){return Math.pow(Math.max(0.02,JOBS[k].fit(p.tr)),3);});
var J=JOBS[p.job];
p.action=resolve(S,p,scen.actions,pc.action);p.goal=resolve(S,p,scen.goals,pc.goal);
p.mhp=Math.round(J.hp+p.tr.cp*6+(p.stats.str||3)*2);p.hp=p.mhp;
p.atk=J.atk+(p.stats.str||3)*1.2+p.tr.aggr*3;p.def=J.def+p.tr.caution*2;
p.intel0=clamp((p.stats.int||3)/5,0.2,1);
p.lv=1;p.kills=0;p.down=0;p.found=0;p.alive=true;p.m={hp:100,gold:0};p.cnt={kills:0,chest:0,heal:0};
p.roleLabel=J.label+'（'+(pick&&JOBS[pick]?'指定':'エゴグラムから')+'）';
});
var alive=function(){return P.filter(function(p){return p.alive;});};
var SPX=HK.RPG_SPEC;
if(SPX)SPX.setup(S,input);
var leader=P.slice().sort(function(a,b){return(b.tr.lead+b.tr.cp*0.5)-(a.tr.lead+a.tr.cp*0.5);})[0];
function snap(){P.forEach(function(p){p.m.hp=Math.round(p.hp/p.mhp*100);p.m.gold=p.found;});ST.snap(S,['hp','gold']);}
function hurt(p,d){
d=Math.max(1,Math.round((d-p.def*0.5)*HK.Dark.pick(S,0.85,1,1.15,'kill')));
p.hp-=d;
if(SPX)SPX.hurt(p,d);
if(p.hp<=0){
p.hp=0;p.alive=false;p.down++;
var pr=alive().filter(function(x){return JOBS[x.job].heal;})[0];
if(pr&&rng()<HK.Dark.live(S,0.55+pr.tr.np*0.3,'kill')){p.alive=true;p.hp=Math.round(p.mhp*0.35);pr.cnt.heal++;return p.name+'が倒れた！――'+pr.name+'の祈りで、'+p.name+'は立ち上がった。';}
if(pot>0&&rng()<HK.Dark.live(S,0.68,'kill')){pot--;p.alive=true;p.hp=Math.round(p.mhp*0.4);return p.name+'が倒れた！――仲間が回復薬を飲ませ、'+p.name+'は息を吹き返した。';}
if(HK.Dark.on(S,'kill')==='mild'&&rng()<0.8){p.alive=true;p.hp=1;return p.name+'が倒れた！――それでも'+p.name+'は、かろうじて意識をつなぎとめた。';}
return p.name+'は倒れた。';
}
return'';
}
function battle(mon,boss,hp0){
var hp=hp0!=null&&isFinite(hp0)?hp0:mon[1]*dmul*(boss?6:3)*(0.04+Math.min(5,P.length)*0.23)*(1+floor/Math.max(5,maxF)*0.4)*(boss&&floor===maxF?1.3:1),pow=mon[1]*dmul*(boss?0.9:1)*(1+floor/Math.max(5,maxF)*0.5)*(0.55+Math.min(5,P.length)*0.13),t=(boss?'階層の主《'+mon[0]+'》が立ちはだかった！':HK.RPGData.ENC[Math.floor(rng()*HK.RPGData.ENC.length)].replace(/\{m\}/g,mon[0])),rounds=0,hit=[];
var scout=alive().reduce(function(m,p){return Math.max(m,p.tr.caution+(p.job==='hunter'?0.3:0));},0);
if(!boss&&rng()<scout*0.35){t+='――先に気づいたので、奇襲をかけた。';hp*=0.7;}
var hpMax=hp;
while(hp>0&&alive().length&&rounds<8){
rounds++;
alive().forEach(function(p){
if(hp<=0||p.mad)return;
var front=p.action.id==='front'?1.2:p.action.id==='support'?0.8:1;
var crit=rng()<0.06+(p.stats.luck||3)*0.02;
var d=p.atk*front*(0.7+rng()*0.6)*(crit?1.8:1)*(1+(p.lv-1)*0.14);
if(JOBS[p.job].bard){alive().forEach(function(q){q.atk+=0.05;});}
hp-=d;
if(crit)hit.push(p.name+'の会心の一撃！');
if(hp<=0){p.kills++;p.cnt.kills++;}
});
if(hp<=0)break;
var tg=HK.weighted(rng,alive(),function(p){return 1+(p.action.id==='front'?1.2:0)+(p.job==='warrior'?0.8:0)-(p.action.id==='careful'?0.4:0);});
if(!tg)break;
var cover=alive().filter(function(q){return q!==tg&&q.hp>q.mhp*0.4&&(q.tr.np>0.6|| /lover|best|parent|sibprot|buddy|mate/.test(tieOf(input,q,tg)))&&rng()<0.18+q.tr.np*0.2;})[0];
if(cover&&tg.hp<tg.mhp*0.5){hit.push(cover.name+'が'+tg.name+'をかばった！');tg=cover;}
var msg=hurt(tg,pow*(0.6+rng()*0.8));
if(msg)hit.push(msg);else if(rng()<0.25)hit.push(say(tg,'hurt'));
if(boss&&env.retreat==='auto'&&alive().length){
var A1=alive(),rt=A1.reduce(function(s0,p){return s0+p.hp/p.mhp;},0)/A1.length,dead=P.length-A1.length-P.filter(function(p){return p.captive;}).length;
var ld=A1.indexOf(leader)>=0?leader:A1[0];
if((rt<0.3||(dead>0&&rt<0.5))&&rng()<0.15+ld.tr.caution*0.6-ld.tr.aggr*0.15){hit.push(ld.name+'が叫んだ。「下がって！　一度退くよ！｜下がれ！　一度退くぞ！｜下がってください！　一度退きます！」');break;}
}
}
if(hp>0)return{win:false,hpLeft:hp,hpMax:hpMax,text:t+hit.slice(0,4).join('')};
P.forEach(function(p){
if(p.alive||p.captive||p.spec||p.lost)return;
var pr=alive().filter(function(x){return JOBS[x.job].heal;})[0];
if(rng()<(pr?0.45+pr.tr.np*0.25:0.25)+p.tr.cp*0.1){p.alive=true;p.hp=Math.round(p.mhp*0.25);hit.push(pick2([p.name+'は戦いが終わると、仲間に揺り起こされて目を開けた。',pr?pr.name+'の長い祈りのあと、'+p.name+'の指が動いた。':'仲間が'+p.name+'の傷を縛り、水を飲ませた。やがて、かすかに息が戻った。']));}
else{p.lost=true;hit.push(p.name+'は、もう目を開けなかった。');}
});
var g=Math.round(mon[2]*lmul*(0.8+rng()*0.4));
var top=(alive().length?alive():P).slice().sort(function(a,b){return b.kills-a.kills;})[0];
gold+=g;top.found+=g;
var a0=alive()[Math.floor(rng()*alive().length)];
var RDx=HK.RPGData,fin=top&&RDx.JOBACT[top.job]?RDx.JOBACT[top.job][Math.floor(rng()*RDx.JOBACT[top.job].length)].replace(/\{a\}/g,top.name):'';
return{win:true,gold:g,text:t+(a0&&rng()<0.6?say(a0,'attack'):'')+hit.slice(0,3).join('')+fin+RDx.FIN[Math.floor(rng()*RDx.FIN.length)].replace(/\{m\}/g,mon[0])+'（'+g+'G）'};
}
var RD=HK.RPGData,usedBoss={},captive=null,grudges=[],hostUsed=false,lastSp={};
function F(t,m){return String(t).replace(/\{(\w+)\}/g,function(x,k){return m[k]!=null?m[k]:x;});}
function pick2(arr){return arr[Math.floor(rng()*arr.length)];}
function tieStrong(a,b){return/lover|mate|best|parent|sibprot|sibclose|sibling|buddy|childhood|crush|almost/.test(tieOf(input,a,b));}
function nextBoss(){
var frac=floor/Math.max(5,maxF),tierB=Math.min(3,Math.floor(frac*4-0.01));
var pool=RD.BOSSES.filter(function(x){return x.t===tierB&& !usedBoss[x.n];});
if(!pool.length)pool=RD.BOSSES.filter(function(x){return!usedBoss[x.n];});
if(!pool.length)pool=RD.BOSSES;
var B=pick2(pool);usedBoss[B.n]=1;
return B;
}
function bossFight(again){
var B=again?again.b:nextBoss();
var A=alive(),a=pick2(A),b=A.filter(function(x){return x!==a;}).sort(function(x,y){return(tieStrong(y,a)?1:0)+y.tr.np-(tieStrong(x,a)?1:0)-x.tr.np;})[0]||null;
var pow=B.p+floor*0.6,m={a:a.name,b:b?b.name:'',x:B.n},pre=B.in+F(pick2(RD.GIM[B.k]),m),note='',act=[],broke=false,k=B.k,atkSave=null;
if(again){
var nth=again.n||2;
pre=nth>=3?nth+'回目の挑戦。'+pick2([B.n+'は、まだ階段の前に立っていた。','傷だらけの'+B.n+'が、また行く手を塞いだ。','パーティは、もう一度'+B.n+'に挑んだ。'])
:pick2(['傷を負った'+B.n+'が、再び行く手を塞いだ。',B.n+'は前の戦いの傷を引きずりながら、なお階段の前に立っていた。','態勢を立て直したパーティが、'+B.n+'にもう一度挑んだ。']);
if(/summon|split|twin|rage|time|armor/.test(k))pow*=1.1;
var resA=battle([B.n,pow,B.g],true,again.hpLeft);
resA.text=resA.text.replace(/^階層の主《[^》]+》が立ちはだかった！/,'');
if(nth>=3&& !resA.win)resA.text='';
return{b:B,res:resA,pre:pre,note:'再戦（'+nth+'回目）',actors:[]};
}
if(k==='riddle'||k==='armor'){var sm=A.slice().sort(function(x,y){return(y.tr.a+y.intel0)-(x.tr.a+x.intel0);})[0];broke=sm.tr.a+sm.intel0>0.9&&rng()<0.75;if(broke){m.a=sm.name;act.push(sm.i);}}
else if(b&& /charm|stone|terror|bind|greed/.test(k))broke=rng()<0.3+b.tr.np*0.3+(tieStrong(a,b)?0.25:0)+(k==='bind'&&JOBS[b.job].thief?0.3:0)+(k==='terror'? -a.tr.ac*0.2:0);
if(broke&&RD.BREAK[k]){pre+=F(pick2(RD.BREAK[k]),m);note='仕掛けを破った';if(k==='riddle'||k==='armor')pow*=0.6;}
else{
if(/summon|split|twin|rage|time|armor/.test(k))pow*=1.25;
if(/poison|drain|burn/.test(k)){(k==='burn'?A:[a]).forEach(function(q){var d=hurt(q,q.mhp*(k==='burn'?0.18:0.3));if(d)pre+=d;});}
if(/bind|stone|terror|greed/.test(k)){var d2=hurt(a,a.mhp*0.35);if(d2)pre+=d2;}
if(k==='charm'&&b){var d3=hurt(b,b.mhp*0.3);pre+=a.name+'の一撃が、'+b.name+'を傷つけた。'+(d3||'');}
if(k==='riddle'){A.forEach(function(q){hurt(q,q.mhp*0.15);});pre+='誰も答えられなかった。'+B.n+'が怒りの爪を振り下ろした。';}
if(k==='curse'){atkSave=A.map(function(q){return q.atk;});A.forEach(function(q){q.atk*=0.8;});}
}
if(b)act.push(b.i);
var res=alive().length?battle([B.n,pow,B.g],true):{win:false,text:''};
res.text=res.text.replace(/^階層の主《[^》]+》が立ちはだかった！/,'');
if(atkSave)A.forEach(function(q,i){q.atk=atkSave[i];});
return{b:B,res:res,pre:pre,note:note,actors:act};
}
function special(A,a,b,usedK){
if(HK.Obsess&&HK.Obsess.storyTick){
if(!S.ties)S.ties=(HK.Story&&HK.Story.tiesOk?HK.Story.tiesOk(S.P,input.ties):input.ties||[]);
var ob=HK.Obsess.storyTick(S,A,{rate:0.35});
if(ob){ST.say(S,{actors:ob.actors.map(function(q){return q.i;}),tag:ob.tag,kind:ob.kind,text:ob.text,why:ob.why,mag:ob.mag});return true;}
}
var opts=[];
function can(k,gap){return!usedK['sp_'+k]&&(lastSp[k]==null||floor-lastSp[k]>=gap);}
if(b&&can('quarrel',5)&&grudges.length<2)opts.push(['quarrel',0.4+A.reduce(function(m0,x){return Math.max(m0,x.tr.aggr+x.tr.cp*0.5+x.tr.jealous*0.4);},0)*0.5]);
if(grudges.length&&can('make',2))opts.push(['make',1.4]);
if(b&& !hostUsed&&floor>=2&&floor<=maxF-2&&A.length>=3)opts.push(['host',0.7]);
if(captive&&can('captive',2))opts.push(['captive',0.8]);
if(can('riddle',4))opts.push(['riddle',0.8]);
if(can('cursed',5))opts.push(['cursed',0.6]);
if(can('gamble',4))opts.push(['gamble',0.7]);
if(can('statue',4))opts.push(['statue',0.6]);
if(can('secret',3))opts.push(['secret',0.7]);
if(can('cook',3))opts.push(['cook',0.7]);
if(!opts.length)return false;
var k=HK.weighted(rng,opts,function(o){return o[1];})[0];
usedK['sp_'+k]=1;lastSp[k]=floor;
var m={a:a.name,b:b?b.name:''};
if(k==='quarrel'){
var pr=null,best= -1;
A.forEach(function(x){A.forEach(function(y){if(x.i<y.i&& !grudges.some(function(g){return(g[0]===x&&g[1]===y)||(g[0]===y&&g[1]===x);})){var v=x.tr.aggr+y.tr.aggr+(x.tr.cp+y.tr.cp)*0.5+(x.tr.jealous+y.tr.jealous)*0.3+rng()*0.4;if(v>best){best=v;pr=[x,y];}}});});
if(!pr)return false;
var x=pr[0],y=pr[1],med=A.filter(function(q){return q!==x&&q!==y;}).sort(function(q1,q2){return q2.tr.np-q1.tr.np;})[0];
var mm={a:x.name,b:y.name,c:med?med.name:'',w:pick2(RD.QUARREL.why)};
var t=F(pick2(RD.QUARREL.fight),mm),healed=(med&&med.tr.np>0.55&&rng()<0.7)||x.tr.np+y.tr.np>1.1;
if(healed)t+=F(pick2(RD.QUARREL.make.filter(function(l){return med||l.indexOf('{c}')<0;})),mm);
else{t+=F(pick2(RD.QUARREL.grudge),mm);grudges.push([x,y]);x.atk-=1;y.atk-=1;}
ST.say(S,{actors:[x.i,y.i].concat(med&&healed?[med.i]:[]),tag:'喧嘩',text:t,why:x.name+'と'+y.name+'の衝突（攻撃性・CP・執着）'+(healed?'／仲裁で収まった（NP）':'／わだかまりが残った（二人とも攻撃力が少し下がる）')});
}else if(k==='make'){
var gpair=grudges.shift(),gx=gpair[0],gy=gpair[1];
if(!gx.alive|| !gy.alive)return true;
gx.atk+=1;gy.atk+=1;
ST.say(S,{actors:[gx.i,gy.i],tag:'仲直り',text:F(pick2(RD.QUARREL.later),{a:gx.name,b:gy.name}),why:'喧嘩していた二人が、戦いの中で仲直りした'});
}else if(k==='host'){
hostUsed=true;
var tg=A.filter(function(q){return q!==leader;})[Math.floor(rng()*Math.max(1,A.length-1))]||A[0];
var at=Math.min(maxF,floor+2+Math.floor(rng()*2));
captive={p:tg,at:at};tg.alive=false;tg.captive=true;
var lover=A.filter(function(q){return q!==tg&&tieStrong(q,tg);})[0],rest=A.filter(function(q){return q!==tg;}),resp=lover||rest.sort(function(q1,q2){return q2.tr.np-q1.tr.np;})[0];
if(resp)resp.vow=true;
ST.say(S,{actors:[tg.i].concat(resp?[resp.i]:[]),tag:'人質',kind:'climax',text:F(pick2(RD.HOST.take),{a:tg.name,d:at})+(resp?F(pick2(lover?RD.HOST.reactTie:RD.HOST.react),{a:tg.name,b:resp.name}):''),why:'黒衣の魔術師が'+tg.name+'を攫った。地下'+at+'階で取り返せる'+(lover?'（'+resp.name+'は特に強く誓った）':'')});
}else if(k==='captive'){
ST.say(S,{actors:[captive.p.i],tag:'囚われの身',text:F(pick2(RD.HOST.captive),{a:captive.p.name}),why:captive.p.name+'は魔術師の塔で、仲間を待っている'});
}else if(k==='riddle'){
var sage=A.slice().sort(function(q1,q2){return(q2.tr.a+q2.intel0)-(q1.tr.a+q1.intel0);})[0],ok=rng()<sage.tr.a*0.5+sage.intel0*0.5;
var t2=pick2(RD.RIDDLE.door)+F(pick2(ok?RD.RIDDLE.ok:RD.RIDDLE.ng),{a:sage.name});
if(ok){var g2=Math.round((40+floor*10)*lmul);gold+=g2;sage.found+=g2;t2+='（'+g2+'G）';}else{var d4=hurt(sage,6+floor);t2+=d4;}
ST.say(S,{actors:[sage.i],tag:'謎かけ',text:t2,why:sage.name+'のA（'+Math.round(sage.eg.A)+'）'});
}else if(k==='cursed'){
var grab=A.slice().sort(function(q1,q2){return(q2.tr.impulse+q2.tr.fc)-(q1.tr.impulse+q1.tr.fc);})[0],take=grab.tr.impulse+grab.tr.fc>1&&rng()<0.75;
if(take){grab.atk+=4;grab.mhp=Math.max(10,grab.mhp-6);grab.hp=Math.min(grab.hp,grab.mhp);grab.cursed=true;}
ST.say(S,{actors:[grab.i],tag:'呪いの装備',text:pick2(RD.CURSED.find)+F(pick2(take?RD.CURSED.take:RD.CURSED.leave),{a:take?grab.name:A.slice().sort(function(q1,q2){return q2.tr.caution-q1.tr.caution;})[0].name}),why:take?grab.name+'の衝動性（攻撃力＋4・最大体力−6）':'パーティの慎重さ'});
}else if(k==='gamble'){
var gb=A.slice().sort(function(q1,q2){return(q2.tr.fc+q2.tr.impulse)-(q1.tr.fc+q1.tr.impulse);})[0],play=gb.tr.fc+gb.tr.impulse>0.9&&gold>20;
var t3=pick2(RD.GAMBLE.open);
if(play){var win=rng()<0.42+(gb.stats.luck||3)*0.04,bet=Math.round(gold*0.4);if(win){gold+=bet;gb.found+=bet;}else gold-=bet;t3+=F(pick2(win?RD.GAMBLE.win:RD.GAMBLE.lose),{a:gb.name})+'（'+(win?'+':'−')+bet+'G）';}
else t3+=F(pick2(RD.GAMBLE.pass),{a:gb.name});
ST.say(S,{actors:[gb.i],tag:'賭場',text:t3,why:gb.name+'のFC・衝動性'+(play?'・運':'')});
}else if(k==='statue'){
var pz=A.slice().sort(function(q1,q2){return(q2.tr.ac+q2.tr.np)-(q1.tr.ac+q1.tr.np);})[0],pray=pz.tr.ac+pz.tr.np>0.9;
if(pray)A.forEach(function(q){q.hp=Math.min(q.mhp,q.hp+Math.round(q.mhp*0.25));q.def+=0.5;});
ST.say(S,{actors:[pz.i],tag:'女神像',text:pick2(RD.STATUE.open)+F(pick2(pray?RD.STATUE.pray:RD.STATUE.skip),{a:pz.name}),why:pray?pz.name+'のAC・NP（全員の体力回復・守り＋）':''});
}else if(k==='secret'){
var sc0=A.slice().sort(function(q1,q2){return(q2.tr.caution+(q2.job==='thief'||q2.job==='hunter'?0.4:0))-(q1.tr.caution+(q1.job==='thief'||q1.job==='hunter'?0.4:0));})[0];
var g3=Math.round((25+floor*7)*lmul);gold+=g3;sc0.found+=g3;if(rng()<0.4)pot++;
ST.say(S,{actors:[sc0.i],tag:'隠し部屋',text:F(pick2(RD.SECRET),{a:sc0.name})+'（'+g3+'G）',why:sc0.name+'の慎重さ'});
}else if(k==='cook'){
var ck=A.slice().sort(function(q1,q2){return(q2.tr.np+q2.tr.fc*0.5)-(q1.tr.np+q1.tr.fc*0.5);})[0];
A.forEach(function(q){q.hp=Math.min(q.mhp,q.hp+Math.round(q.mhp*0.2));});
ST.say(S,{actors:[ck.i],tag:'料理',text:F(pick2(RD.COOK),{a:ck.name}),why:ck.name+'のNP（全員の体力回復）'});
}
return true;
}
function rescue(){
var c=captive.p,A=alive(),hero=A.filter(function(q){return q.vow;})[0]||A[0];
var wz=['黒衣の魔術師',10+floor*1.2,60+floor*10];
if(hero)hero.atk+=2;
var res=battle(wz,true,wz[1]*dmul*4*(0.4+P.length*0.15));
res.text=res.text.replace(/^階層の主《[^》]+》が立ちはだかった！/,'');
if(hero)hero.atk-=2;
var t=F(pick2(RD.HOST.rescue),{a:c.name,b:hero?hero.name:''})+res.text;
if(res.win){c.alive=true;c.captive=false;c.hp=Math.round(c.mhp*0.5);t+=F(pick2(RD.HOST.freed),{a:c.name,b:hero?hero.name:''});captive=null;}
ST.say(S,{actors:[c.i].concat(hero?[hero.i]:[]),tag:res.win?'救出':'救出失敗',kind:'climax',text:t,why:res.win?(hero?hero.name+'の誓い（攻撃力＋2）':'')+'・'+c.name+'を取り返した':'魔術師に返り討ちにされた'});
if(!res.win)captive.at=floor+2;
}
ST.say(S,{kind:'phase',actors:P.map(function(p){return p.i;}),text:P.map(function(p){return p.name+'（'+JOBS[p.job].label+(SPX?SPX.label(p):'')+'）';}).join('・')+'のパーティが、ダンジョンの入口に立った。'+(P.length>1?'リーダーは'+leader.name+'。':''),why:'職業はエゴグラムから（戦士＝攻撃性・CP／魔法使い＝A／僧侶＝NP／盗賊＝FC・衝動性／狩人＝慎重さ／吟遊詩人＝FC・NP）'});
snap();
var maxF=env.floors,last={};
function goOn(){if(SPX)SPX.revive(S,floor);return alive().length;}
for(floor=1;floor<=maxF&&goOn();floor++){
ST.step(S,'地下'+floor+'階');
if(SPX)SPX.floor(S,floor);
if(captive&&floor>=captive.at&&alive().some(function(p){return!p.mad;}))rescue();
var tier=Math.min(3,Math.floor((floor-1)/Math.max(3,maxF/4)));
var nEv=2+(rng()<0.5?1:0),usedK={};
for(var e=0;e<nEv&&alive().length;e++){
var A=alive().filter(function(x){return!x.mad;});
if(!A.length)break;
var a=A[Math.floor(rng()*A.length)],b=A.filter(function(x){return x!==a;})[Math.floor(rng()*Math.max(1,A.length-1))]||null;
var r=rng(),loot=env.loot/100;
if(rng()<0.26&&special(A,a,b,usedK))continue;
for(var tries=0;tries<4;tries++){
var kk=r<0.42?'battle':r<0.58+loot*0.08?'chest':r<0.7?'trap':r<0.78?'shop':r<0.84?'fount':r<0.9?'camp':r<0.95?'lost':'greed';
var rare={shop:3,fount:2,greed:4,lost:2}[kk];
if(kk!=='battle'&&(usedK[kk]||(rare&&last[kk]!=null&&floor-last[kk]<rare))){r=rng();continue;}
usedK[kk]=1;last[kk]=floor;break;
}
if(r<0.42){
var mon=MON[tier][Math.floor(rng()*MON[tier].length)],res=battle(mon,false);
ST.say(S,{actors:alive().map(function(p){return p.i;}),tag:res.win?'戦闘':'敗走',text:res.text,why:'地下'+floor+'階の魔物（強さ '+Math.round(mon[1]*dmul)+'）'});
if(!res.win){break;}
}else if(r<0.42+0.16+loot*0.08){
var opener=HK.weighted(rng,A,function(x){return Math.pow(0.2+x.tr.impulse+x.tr.fc*0.6+(x.goal.id==='gold'?0.4:0),3);});
var thief=A.filter(function(x){return JOBS[x.job].thief;})[0],careful=A.reduce(function(m,x){return Math.max(m,x.tr.caution);},0);
if(careful>0.75&&opener.tr.impulse<0.5&&rng()<0.3&& !thief){ST.say(S,{actors:[opener.i],tag:'宝箱',text:'宝箱があったが、'+opener.name+'たちは怪しんで手を出さなかった。',why:'パーティの慎重さ'});continue;}
var kind=rng()<0.12?'mimic':rng()<(thief?0.06:0.22)-(opener.stats.luck||3)*0.02?'trap':rng()<0.2?'potion':'gold';
var t=(thief&&thief!==opener&&rng()<0.6?thief.name+'が罠を確かめてから、':'')+opener.name+'が宝箱を開けた。'+CHEST[kind][Math.floor(rng()*CHEST[kind].length)];
opener.cnt.chest++;
if(kind==='gold'){var g=Math.round((20+floor*8)*lmul*(0.6+rng())*(1+(opener.stats.luck||3)*0.08));gold+=g;opener.found+=g;t+='（'+g+'G）'+(rng()<0.5?say(opener,'loot'):HK.RPGData.X.loot[Math.floor(rng()*HK.RPGData.X.loot.length)].replace(/\{a\}/g,opener.name));}
else if(kind==='potion')pot+=2;
else if(kind==='trap')t+=hurt(opener,6+floor*1.2*dmul);
else{var rb=battle(['ミミック',8+floor*1.5,30+floor*6],false);t+=rb.text;if(!rb.win){ST.say(S,{actors:[opener.i],tag:'宝箱',text:t,why:opener.name+'の衝動性（'+Math.round(opener.tr.impulse*100)+'）'});break;}}
ST.say(S,{actors:[opener.i],tag:'宝箱',text:t,why:opener.name+'が開けた（衝動性・FC'+(opener.goal.id==='gold'?'・お金が目当て':'')+'）'});
}else if(r<0.7){
var vic=A[Math.floor(rng()*A.length)],av=vic.tr.caution*0.5+(vic.job==='thief'?0.3:0)+(vic.stats.luck||3)*0.04;
if(rng()<av)ST.say(S,{actors:[vic.i],tag:'罠',text:pickT(HK.RPGData.X.trapOk).replace(/\{a\}/g,vic.name),why:vic.name+'の慎重さ'});
else ST.say(S,{actors:[vic.i],tag:'罠',text:pickT(['落とし穴に足を取られた。','天井から矢が降ってきた。','毒の霧が噴き出した。','転がる大岩に追いかけられた。'].concat(HK.RPGData.X.trapHit))+vic.name+'が傷を負った。'+hurt(vic,5+floor*dmul),why:'罠'});
}else if(r<0.78){
var buyer=A.slice().sort(function(x,y){return(y.tr.fc+y.tr.impulse)-(x.tr.fc+x.tr.impulse);})[0];
var price=25+floor*4,n=gold>=price?Math.min(3,Math.floor(gold/price)):0;
if(buyer.tr.cold>0.6&&n>1)n=1;
var haggle=buyer.tr.cp+buyer.tr.fc>1.1&&rng()<0.5;
if(haggle)price=Math.round(price*0.7);
if(n){gold-=price*n;pot+=n;}
ST.say(S,{actors:[buyer.i],tag:'商人',text:pickT(SHOP)+(n?(haggle?buyer.name+'は値切りに値切った。':'')+'回復薬を'+n+'本買った。':'……金が足りなかった。'),why:buyer.name+'の財布のひも（FC・衝動性・ドライさ）'});
}else if(r<0.84){
A.forEach(function(p){p.hp=Math.min(p.mhp,p.hp+Math.round(p.mhp*0.4));});
var cursed=rng()<0.15;
if(cursed)A.forEach(function(p){p.atk-=0.5;});
ST.say(S,{actors:A.map(function(p){return p.i;}),tag:'泉',text:pickT(FOUNTAIN)+'一口飲むと、体の傷がふさがっていった。'+(cursed?'……けれど、どこか力が抜けた気がした。':''),why:'回復の泉'});
}else if(r<0.9&&b){
var tt=tieOf(input,a,b);
A.forEach(function(p){p.hp=Math.min(p.mhp,p.hp+Math.round(p.mhp*0.15));});
ST.say(S,{actors:[a.i,b.i],tag:'休憩',text:fillT(pickT(CAMP),a,b),why:'休憩'+(tt&&HK.TIES[tt]?'（'+(function(){var t0=(input.ties||[]).filter(function(x){return(x.a===a.i&&x.b===b.i)||(x.a===b.i&&x.b===a.i);})[0];return HK.Sib&&HK.Sib.isSibTie(t0)&&HK.tieLabel?HK.tieLabel(t0):HK.TIES[tt].label;})()+'）':'')});
}else if(r<0.95){
var helper=A.slice().sort(function(x,y){return y.tr.np-x.tr.np;})[0];
if(helper.tr.np>0.45||rng()<0.3){var rw=Math.round((30+floor*5)*lmul);gold+=rw;helper.found+=rw;ST.say(S,{actors:[helper.i],tag:'人助け',text:pickT(LOST)+helper.name+'は放っておけなかった。助け出すと、お礼に'+rw+'G を渡された。',why:helper.name+'のNP（'+Math.round(helper.eg.NP)+'）'});}
else ST.say(S,{actors:[helper.i],tag:'素通り',text:pickT(LOST)+'……パーティは、見なかったことにした。',why:'パーティのNPが低い'});
}else if(b&&gold>100){
var gr=A.slice().sort(function(x,y){return(y.tr.jealous+y.tr.cold+y.tr.fc)-(x.tr.jealous+x.tr.cold+x.tr.fc);})[0],other=A.filter(function(x){return x!==gr;})[0];
if(other)ST.say(S,{actors:[gr.i,other.i],tag:'分け前',text:fillT(pickT(GREED),gr,other),why:gr.name+'の執着・ドライさ'});
}
}
if(!goOn())break;
if(floor%5===0||floor===maxF){
var bo=null,tries=0;
while(goOn()){
var allMad= !alive().some(function(p){return!p.mad;});
if(allMad||tries>=BOSS_MAX){stuck(bo?bo.b:nextBoss(),allMad,tries);break;}
bo=bossFight(bo&& !bo.res.win?{b:bo.b,hpLeft:bo.res.hpLeft,n:tries+1}:null);
var br=bo.res,final=floor===maxF;
tries++;
ST.say(S,{actors:alive().map(function(p){return p.i;}).concat(bo.actors),tag:(br.win?(final?'最深部の主':'階層の主'):alive().length?'退却':'全滅の危機')+(tries>=2?'（'+tries+'回目）':''),kind:tries>=3&& !br.win?undefined:'climax',text:bo.pre+br.text+(br.win|| !alive().length?'':pick2(['――倒しきれず、パーティは一度、上の階の通路まで退いた。','――決着はつかず、パーティは息を切らして距離を取った。'])),why:'地下'+floor+'階の主《'+bo.b.n+'》'+(bo.note?'／'+bo.note:'')+(br.win?'':'／主の残り体力 '+(isFinite(br.hpLeft)&&isFinite(br.hpMax)?Math.round(br.hpLeft/Math.max(1,br.hpMax)*100):'?')+'%')});
if(br.win){bossDown++;P.forEach(function(p){if(p.alive||p.captive){p.lv++;p.mhp+=6;p.def+=0.4;p.hp=Math.min(p.mhp,p.hp+Math.round(p.mhp*0.3));}});break;}
if(!goOn())break;
if(tries<4)alive().forEach(function(p){p.hp=Math.min(p.mhp,p.hp+Math.round(p.mhp*0.3));});
if(pot>0&&rng()<0.6){pot--;var low=alive().sort(function(x,y){return x.hp/x.mhp-y.hp/y.mhp;})[0];low.hp=Math.min(low.mhp,low.hp+Math.round(low.mhp*0.4));}
if(env.retreat==='auto'&&judgeRetreat(0.1,bo.b.n))break;
}
if(ended)break;
}
snap();
if(!goOn())break;
if(env.retreat==='auto'&&floor<maxF&&judgeRetreat(0,''))break;
}
function judgeRetreat(bonus,bossName,force){
var A2=alive();if(!A2.length)return false;
var ratio=A2.reduce(function(s0,p){return s0+p.hp/p.mhp;},0)/A2.length,lost=P.filter(function(p){return!p.alive&& !p.captive;}).length,left=maxF-floor;
var L0=A2.indexOf(leader)>=0?leader:A2.slice().sort(function(a,b){return(b.tr.lead+b.tr.cp*0.5)-(a.tr.lead+a.tr.cp*0.5);})[0];
var fear=(1-ratio)*(0.85+L0.tr.caution*0.9)+lost*(0.3+L0.tr.caution*0.3)+L0.tr.caution*0.45-L0.tr.aggr*0.35-(L0.goal.id==='deep'?0.25:0)+(pot===0?0.15:0)+bonus
+Math.min(0.2,floor/maxF*0.2)-(left<=3?0.3:left<=6?0.15:0)+(A2.length<=2?0.15:0)+(P.length<=3?0.12:0);
if(fear<=1.0&& !force)return false;
var why=force?[force]:[],low=A2.slice().sort(function(a,b){return a.hp/a.mhp-b.hp/b.mhp;})[0];
if(ratio<0.5)why.push((low===L0?'自分':low.name)+'の体力は残り'+Math.round(low.hp/low.mhp*100)+'%、パーティ全体でも'+Math.round(ratio*100)+'%');
if(lost)why.push(P.filter(function(p){return!p.alive&& !p.captive;}).map(function(p){return p.name;}).join('と')+'を失っていた');
if(pot===0)why.push('回復薬も尽きていた');
if(bossName&& !force)why.push('目の前の'+bossName+'は倒しきれそうになかった');
if(L0.tr.caution>0.55)why.push('慎重な性分が「生きて帰る｜＝｜生きて帰ります」を選ばせた');
else if(L0.goal.id==='live')why.push('全員で生きて帰ることが目標だった');
else if(!why.length)why.push('リーダーとしての勘が、ここが潮時だと告げていた');
var greedy=A2.filter(function(p){return p!==L0&&(p.goal.id==='gold'||p.goal.id==='deep')&&(p.tr.impulse>0.5||p.tr.aggr>0.55);})[0];
var text=L0.name+'は「ここまでだね。引き返そう｜ここまでだ。引き返す｜ここまでです。引き返しましょう」と決めた。'+why.join('。')+'。あと'+left+'階――'+(left<=5?'目標はもう見えていたが、':left<=12?'半分は越えていたが、':'まだ先は長く、')+L0.name+'は無理をしなかった。'+(greedy?greedy.name+'は「もう少しだけ！｜＝｜もう少しだけ！」と粘ったが、最後には折れた。':'');
ST.say(S,{actors:A2.map(function(p){return p.i;}),tag:'撤退',kind:'climax',text:text,why:L0.name+'の判断（消耗 '+Math.round((1-ratio)*100)+'%・失った仲間 '+lost+'人・慎重さ '+Math.round(L0.tr.caution*100)+'・残り'+left+'階）'});
ended='retreat';retreatBy=L0;retreatWhy=why[0];
return true;
}
function stuck(B,allMad,n){
var A5=alive(),nm5=A5.map(function(p){return p.name;}).join(A5.length>2?'・':'と');
var m5={l:nm5,x:B.n,f:floor,n:n};
if(env.retreat==='never'){
ended='eternal';eternal={b:B.n,mad:allMad,n:n};
var STK=allMad?[
'{x}の前に立ったとき、{l}の目には、もう誰の姿も映っていなかった。武器を構える者は、一人もいなかった。{x}は階段の前で、動かない獲物をじっと見下ろしていた。',
'正気を失った{l}は、{x}の吐く息にも気づかず、通路の隅をさまよっていた。誰も剣を抜かず、誰も引き返そうとは言わなかった。地下{f}階の闇が、{l}をゆっくりと閉じ込めていった。',
'{l}のうわごとが、{x}の唸り声に混ざって通路に響いた。戦う者も、逃げる者もいなかった。階段はすぐそこにあるのに、誰の足もそちらへは向かなかった。'
]:[
'{n}度目の挑戦のあとも、{l}はまた{x}の前に立った。武器を振るい、倒れ、起き上がり、また武器を振るう。決着は、いつまでたってもつかなかった。',
'{x}の傷が塞がりかけるころ、{l}の傷もまた塞がっていった。どちらも倒れず、どちらも退かなかった。地下{f}階の階段の前で、同じ戦いが何度もくり返された。',
'{l}は、引き返すという言葉を最後まで口にしなかった。{x}もまた、階段の前から一歩も動かなかった。武器のぶつかる音だけが、いつまでも通路に響き続けた。'
];
ST.say(S,{actors:A5.map(function(p){return p.i;}),tag:'終わらない戦い',kind:'climax',text:F(pick2(STK),m5),why:(allMad?'生き残りが全員発狂していて、誰も戦えない':'地下'+floor+'階の主《'+B.n+'》に'+n+'回挑んでも倒しきれなかった')+'（撤退が「絶対に引き返さない」なので、引き返しもしない）'});
return;
}
if(allMad){
var L5=A5.indexOf(leader)>=0?leader:A5[0];
ST.say(S,{actors:A5.map(function(p){return p.i;}),tag:'撤退',kind:'climax',text:F(pick2([
'{l}は、誰ひとり正気ではなかった。{x}の咆哮に追い立てられるように、一行はふらふらと来た道を引き返した。どうやって上の階までたどり着いたのか、覚えている者はいなかった。',
'{x}の前で、{l}は武器を構えることさえできなかった。誰かが悲鳴を上げて走り出し、残りもつられるように逃げ出した。それが、地下{f}階での冒険の終わりだった。'
]),m5),why:'生き残りが全員発狂していて、誰も戦えなかった'});
ended='retreat';retreatBy=L5;retreatMad=true;retreatWhy='生き残りが全員正気を失い、戦える者がいなかった';
return;
}
judgeRetreat(0,B.n,B.n+'に'+n+'回挑んでも、倒しきれなかった');
}
goOn();
if(!alive().length){banked=Math.round(gold*0.1);ended='wipe';}
else{banked=ended==='eternal'?0:gold;ended=ended||'clear';}
var cleared=ended==='clear'?maxF:Math.min(floor,maxF);
var mvp=P.slice().sort(function(a,b){return(b.kills*10+b.found/10)-(a.kills*10+a.found/10);})[0];
P.forEach(function(p){
p.fate=p.captive?(ended==='clear'?'最深部の主が倒れ、塔から解放された':'魔術師に囚われたまま'): !p.alive?'力尽きた':ended==='clear'?'踏破した':ended==='eternal'?(p.mad?'正気を失ったまま、地下'+floor+'階に閉じ込められた':'地下'+floor+'階で《'+eternal.b+'》と戦い続けている'):p.mad?'正気を失ったまま帰還した':'帰還した';
if(p.captive&&ended==='clear'){p.captive=false;p.alive=true;p.hp=Math.max(p.hp,Math.round(p.mhp*0.3));}
p.notes.push(JOBS[p.job].label+'・Lv'+p.lv+'・撃破 '+p.kills+'・見つけたお金 '+p.found+'G・倒れた '+p.down+'回'+(p.cnt.heal?'・仲間を救った '+p.cnt.heal+'回':''));
p.notes.push('方針：'+p.action.label+'／目標：'+p.goal.label);
if(SPX&&SPX.note(p))p.notes.push(SPX.note(p));
});
(function(){
var A4=alive(),lostP=P.filter(function(p){return!p.alive&& !p.captive;}),capP=P.filter(function(p){return p.captive;});
var nm=function(l){return l.map(function(p){return p.name;}).join(l.length>2?'・':'と');};
var v={l:nm(A4),f:cleared,g:banked,m:mvp.name,d:nm(lostP),c:nm(capP),x:eternal?eternal.b:''};
var EP={
clear:[
'地下{f}階の主が崩れ落ちると、迷宮の奥から地鳴りのような音が響き、やがて静まり返った。{l}は長い階段を一段ずつ上り、ようやく地上の光の中へ出た。待っていた町の人々が、歓声を上げて駆け寄ってきた。',
'最深部の扉が開き、隠されていた地上への昇降路が姿を現した。{l}は傷だらけの体を寄せ合って乗り込んだ。地上に着いたとき、空は朝焼けに染まっていた。踏破の知らせは、その日のうちに町じゅうに広まった。',
'{l}が迷宮の入口に戻ると、見張りの兵士は、本当に一番下まで降りたのかと目を丸くした。{f}階を降りきった一行の名前は、ギルドの石板の一番上に刻まれた。'
],
retreat:[
'{l}は来た道を引き返し、何日もかけて地上へ戻った。入口の石段に腰を下ろしたとき、夕日が迷宮の口を赤く染めていた。地下{f}階までの冒険は、ここで一区切りがついた。',
'地上の空気を吸った瞬間、{l}は誰からともなく座り込んだ。持ち帰った{g}Gは、酒場の卓にざらりと広げられた。次は、もっと深くへ――そう言い出す者がいても、今夜だけは誰も止めなかった。',
'ギルドの受付で、{l}は到達した階を報告した。受付嬢は帳面に地下{f}階と書き込み、小さく頷いた。宿の寝台に倒れ込むと、{l}は泥のように眠った。'
],
wipe:[
'地下{f}階の闇に、落ちた松明の火が小さく揺れて、やがて消えた。迷宮は何事もなかったように静まり返り、拾い集めた宝も、冒険者たちの名前も、深い闇の底に沈んでいった。',
'最後の一人が倒れたあと、迷宮の通路には、誰の足音も響かなかった。数日後、入口の掲示板に、帰らなかったパーティの名前が一行だけ書き足された。',
'地下{f}階で、冒険は終わった。次にこの階まで降りてきた誰かが、錆びた武器と、ほとんど空になった財布を見つけることになる。持ち帰られたのは、わずか{g}Gだけだった。'
],
eternal:eternal&&eternal.mad?[
'地下{f}階の闇の中を、{l}は今もさまよっている。誰も武器を握らず、誰も地上の名前を呼ばない。{x}は階段の前に座り込み、正気を失った冒険者を、飽きもせずに見張っていた。',
'迷宮の入口の掲示板に、帰らなかったパーティの名前が書き足された。けれど、地下{f}階を通った冒険者は口をそろえて言う。闇の奥から、笑い声とうわごとが聞こえてくる、と。{l}はまだ、あの階に閉じ込められたままだった。',
'{l}は、自分がなぜ地下{f}階にいるのかも忘れてしまった。誰かの顔も、地上の光も、遠い夢のようだった。階段を守る{x}だけが、変わらずそこにいた。'
]:A4.some(function(p){return p.spec;})?[
'地下{f}階の階段の前では、今も{x}との戦いが続いている。{l}は倒れては起き上がり、起き上がってはまた武器を取った。地上の誰も、その戦いがいつ終わるのかを知らなかった。',
'何日が過ぎたのか、{l}にはもう分からなかった。{x}の爪を受けて倒れ、また立ち上がる。終わらない戦いの中で、{l}は地上の空の色を少しずつ忘れていった。',
'ギルドの石板には、地下{f}階で消息を絶ったパーティの名前が刻まれた。けれど、迷宮に潜った冒険者たちは言う。地下{f}階の奥から、今も武器のぶつかる音が聞こえてくる、と。{l}は死ぬこともできないまま、{x}と戦い続けていた。'
]:[
'地下{f}階で、{l}は{x}と睨み合ったまま、何度目かの夜を迎えた。退くことも、押し切ることもできなかった。地上へ続く階段は、主の背中の向こうで、ずっと遠いままだった。',
'{l}は武器を下ろさなかった。{x}もまた、倒れなかった。地下{f}階の戦いは、誰にも見届けられないまま、いつまでも続いた。',
'ギルドの石板には、地下{f}階で消息を絶ったパーティの名前が刻まれた。けれど、迷宮に潜った冒険者たちは言う。地下{f}階の奥から、今も武器のぶつかる音が聞こえてくる、と。{l}はまだ、{x}の前で戦い続けていた。'
]
};
var t=pickT(EP[ended]);
if(ended==='eternal'){
if(lostP.length)t+=pickT(['{d}の亡骸は、その戦いのそばで静かに眠っていた。','{d}を失ったことさえ、もう誰も口にしなかった。']);
if(capP.length)t+='{c}は魔術師の塔で、来ない迎えを待ち続けていた。';
}else if(ended!=='wipe'){
if(lostP.length)t+=pickT(['帰り道、{d}の分の席を空けて、一行は黙って杯を掲げた。','{d}の名前を口にすると、誰もが少しだけ黙り込んだ。','{d}を迷宮に残してきたことを、誰も忘れなかった。']);
if(capP.length)t+=pickT(['塔に囚われた{c}を取り戻す日を、一行は心に誓った。','{c}はまだ、魔術師の塔に囚われたままだった。']);
if(ended==='clear'&&P.some(function(p){return/解放/.test(p.fate);}))t+='囚われていた仲間も、主が倒れたことで解き放たれた。';
if(mvp.alive&& !mvp.mad)t+=pickT(['いちばんの働きは{m}だった。皆にそう言われて、{m}は照れくさそうに頭をかいた。','持ち帰った{g}Gを前に、{m}「次は、どこへ行く？｜次は、どこへ行く｜次は、どこへ行きますか？」','{m}「みんな、お疲れさま。私、この仲間で良かった｜みんな、ご苦労だった。この仲間で良かった｜みんな、お疲れさまでした。私、この仲間で良かったです」']);
}
ST.step(S,ended==='clear'?'踏破 ― 地上へ':ended==='retreat'?'帰還 ― 地上へ':ended==='eternal'?'戦いは永遠に続く':'全滅');
ST.say(S,{actors:(ended==='wipe'?P:A4).map(function(p){return p.i;}),tag:ended==='clear'?'凱旋':ended==='retreat'?'帰還':ended==='eternal'?'永遠':'全滅',kind:'climax',text:fillT(t.replace(/\{l\}/g,v.l).replace(/\{f\}/g,v.f).replace(/\{g\}/g,v.g).replace(/\{m\}/g,v.m).replace(/\{d\}/g,v.d).replace(/\{c\}/g,v.c).replace(/\{x\}/g,v.x),mvp),why:ended==='eternal'?'冒険の締めくくり（誰も地上に戻らなかった。拾ったお金 '+gold+'G は迷宮に残った）':'冒険の締めくくり（持ち帰ったお金 '+banked+'G）'});
})();
var A3=alive();
var title=ended==='clear'?'踏破（クリア） ― 地下'+maxF+'階の主を倒した':ended==='retreat'?'帰還（地下'+cleared+'階で撤退）':ended==='eternal'?'戦いは永遠に続く ― 地下'+cleared+'階の主《'+eternal.b+'》':'全滅（地下'+cleared+'階）';
var lines=[ended==='eternal'?(eternal.mad?(A3.length>1?'生き残った'+A3.map(function(p){return p.name;}).join('・')+'は全員が':A3[0].name+'は')+'正気を失い、地下'+cleared+'階の主《'+eternal.b+'》の前から動けなくなった。':'地下'+cleared+'階の主《'+eternal.b+'》に'+eternal.n+'回挑んでも倒しきれず、引き返すこともしなかった。戦いは、今も続いている。')+'誰も地上に戻らず、拾った '+gold+'G も迷宮に残された。':ended==='wipe'?'パーティは地下'+cleared+'階で全滅した。拾ったお金のほとんどは、迷宮に残された。持ち帰れたのは '+banked+'G だけだった。':ended==='retreat'?(retreatMad?'パーティは正気を失ったまま、地下'+cleared+'階から引き返した（':retreatBy.name+'の判断で、パーティは地下'+cleared+'階から引き返した（')+retreatWhy+'）。'+banked+'G を持ち帰った。':'地下'+maxF+'階の主を倒し、ダンジョンを踏破した。パーティは '+banked+'G を持ち帰った。','いちばん活躍したのは'+mvp.name+'（撃破 '+mvp.kills+'・'+mvp.found+'G）。'];
if(bossDown)lines.push('倒した階層の主：'+bossDown+'体。');
return ST.result(S,input,{
ending:{title:title,kind:ended==='wipe'||ended==='eternal'?'over':'ok',lines:lines},
estats:[['結果',ended==='clear'?'踏破':ended==='retreat'?'帰還':ended==='eternal'?'戦いは永遠に続く':'全滅'],['到達した階',cleared+'／'+maxF+'階'],['持ち帰ったお金',banked+'G'],['拾ったお金',gold+'G'],['階層の主',bossDown+'体'],['生き残り',A3.length+'／'+P.length+'人']],
table:{title:'パーティの成績',cols:['職業','Lv','撃破','見つけたお金','倒れた','結末'],rows:P.slice().sort(function(a,b){return b.kills-a.kills;}).map(function(p,k){return{i:p.i,rank:k===0?'MVP':'',cells:[JOBS[p.job].label,String(p.lv),String(p.kills),p.found+'G',p.down+'回',p.fate]};})},
meters:[{label:'体力',color:'--partner'},{label:'見つけたお金',color:'--guard',dash:true,max:Math.max(100,P.reduce(function(m,p){return Math.max(m,p.found);},0)),unit:'G'}],
meta:'目標 地下'+maxF+'階・'+P.length+'人パーティ',
summary:'ダンジョンRPG：'+title+'・'+banked+'G'
});
function pickT(arr){return arr[Math.floor(rng()*arr.length)];}
function fillT(t,a,b){return t.replace(/\{a\}/g,a.name).replace(/\{b\}/g,b?b.name:'');}
}
})();
});
;
HK.Load.def(192.5,'tone:scen-rpg',function(){
HK.Load.toneData("mixed",{"F":[
["みんなの分、ちゃんと分けよう","みんなの分、ちゃんと分けましょう",1],
["みんな、お疲れさまでした。私、この仲間で良かったです","お疲れさま、みんな。……この仲間で、良かったです",1]],
"O":{
"よっしゃ、いっくぞー！":"よし、行きますよ！　いっくぞー！",
"お前のやり方じゃ全員死ぬ！":"あなたのやり方じゃ、全員死にますよ！",
"当然の報酬だな":"当然の報酬ですね。遠慮なくもらうよ",
"やった、これで当分は困らない！":"やりました、これで当分困らない！",
"いったぁ！　やったな！":"痛っ！　やりましたね！　覚えてなよ！",
"重くて走れなくなる":"重くて走れなくなりますよ。置いてこ",
"大丈夫、一緒にいる":"大丈夫です、一緒にいるから",
"ダンジョン、悪くないかも":"ダンジョン、悪くないかもです。ちょっとハマりそう",
"関節だ！　そこだけ柔らかい！":"関節です！　そこだけ柔らかい！",
"効率よくいこう":"効率よくいきましょう。時間ないし",
"待って。この床、色が違う":"待ってください。この床、色が違うよ",
"あれは、触っちゃいけないやつだ":"あれは、触っちゃいけないやつです。絶対だよ",
"ここまでだ。引き返す":"ここまでです。引き返すよ",
"朝は四本、昼は二本、夜は三本。これは何だ":"朝は四本、昼は二本、夜は三本。これは何でしょう？　わかる？",
"どうせ仲間が来る":"どうせ仲間が来ますよ。残念だったね",
"計算が合わない":"計算が合いません。どこかおかしいよ",
"ま、まあ悪くないんじゃない？":"ま、まあ悪くないんじゃないですか？　ちょっとだけね"}});
HK.Load.toneData("noja",{"F":[
["あれは、触っちゃいけないやつだ","あれは、触れてはならぬものじゃ"],
["ま、まあ悪くないんじゃない？","ま、まあ悪くないのではないか？"],
["朝は四本、昼は二本、夜は三本。これは何だ","朝は四本、昼は二本、夜は三本。これは何じゃ"],
["みんなの分、ちゃんと分けよう","皆の分、きちんと分けようぞ",1],
["計算が合わない","計算が合わぬ",1],
["全部持って帰る","全部持って帰るぞ",1],
["効率よくいこう","効率よくいこうぞ",1],
["悪いが、通してもらう","すまぬが、通らせてもらうぞ",1],
["待て。この床、色が違う","待て。この床、色が違うておる",1],
["相場の三倍はある","相場の三倍はあるのう",1],
["あなたのやり方では全員死ぬ！","おぬしのやり方では、皆死ぬぞ！",1]],
"O":{
"よっしゃ、いっくぞー！":"よし、ゆくぞー！",
"お前のやり方じゃ全員死ぬ！":"おぬしのやり方では、皆死ぬぞ！",
"当然の報酬だな":"当然の報いじゃな",
"やった、これで当分は困らない！":"よし、これで当分は困らぬぞ！",
"いったぁ！　やったな！":"いたっ！　やってくれたな！",
"重くて走れなくなる":"重うて走れぬようになる",
"大丈夫、一緒にいる":"案ずるな、共におる",
"ダンジョン、悪くないかも":"ダンジョンも、悪うないかもしれぬ",
"関節だ！　そこだけ柔らかい！":"関節じゃ！　そこだけ柔い！"}});
HK.Load.toneData("kansai",{"F":[
["朝は四本、昼は二本、夜は三本。これは何だ","朝は四本、昼は二本、夜は三本。これ、なんや？"],
["あれは、触っちゃいけないやつだ","あれは、触ったらあかんやつや",1],
["待って。この床、色が違う","待って。この床、色がちゃうで",1],
["みんな、お疲れさま。私、この仲間で良かった","みんな、お疲れさん。私、この仲間でよかったわ",1],
["効率よくいこう","効率よういこ",1],
["ここまでだね。引き返そう","ここまでやな。引き返そか",1]],
"O":{
"よっしゃ、いっくぞー！":"よっしゃ、いっくでー！",
"お前のやり方じゃ全員死ぬ！":"あんたのやり方やったら全員死ぬで！",
"当然の報酬だな":"当然の報酬やな",
"やった、これで当分は困らない！":"やった、これで当分困らへん！",
"いったぁ！　やったな！":"いったぁ！　やったな！",
"重くて走れなくなる":"重たくて走られへんようになる",
"大丈夫、一緒にいる":"大丈夫、一緒におるで",
"ダンジョン、悪くないかも":"ダンジョン、悪ないかも",
"関節だ！　そこだけ柔らかい！":"関節や！　そこだけ柔らかい！"}});
HK.Load.toneData("mukuchi",{"F":[
["いったぁ！　やったな！","……痛い。やったな"],
["朝は四本、昼は二本、夜は三本。これは何だ","……朝は四本、昼は二本、夜は三本。何だ"],
["みんな、お疲れさま。私、この仲間で良かった","……みんな、お疲れさま。……この仲間で、良かった",1]],
"O":{
"よっしゃ、いっくぞー！":"……行く",
"お前のやり方じゃ全員死ぬ！":"……そのやり方じゃ、みんな死ぬ",
"当然の報酬だな":"……当然の報酬",
"やった、これで当分は困らない！":"……当分、困らない",
"いったぁ！　やったな！":"……痛い。やった",
"重くて走れなくなる":"……重い。走れない",
"大丈夫、一緒にいる":"……大丈夫。一緒にいる",
"ダンジョン、悪くないかも":"……ダンジョン、悪くない",
"関節だ！　そこだけ柔らかい！":"……関節。そこだけ、柔らかい"}});
HK.Load.toneData("polite",{"F":[
["あれは、触っちゃいけないやつだ","あれは、触ってはいけないものです"],
["朝は四本、昼は二本、夜は三本。これは何だ","朝は四本、昼は二本、夜は三本。これは何でしょう",1]],
"O":{
"よっしゃ、いっくぞー！":"さあ、行きますよ！",
"お前のやり方じゃ全員死ぬ！":"あなたのやり方では、全員死んでしまいます！",
"当然の報酬だな":"当然の報酬ですね",
"やった、これで当分は困らない！":"やりました、これで当分は困りません！",
"いったぁ！　やったな！":"痛っ！　やりましたね！",
"重くて走れなくなる":"重くて走れなくなります",
"大丈夫、一緒にいる":"大丈夫です、一緒にいます",
"ダンジョン、悪くないかも":"ダンジョン、悪くないかもしれません",
"関節だ！　そこだけ柔らかい！":"関節です！　そこだけ柔らかいです！"}});
HK.Load.toneData("gentleman",{"F":[
["あれは、触っちゃいけないやつだ","あれは、触れてはいけないものだね"],
["安くしとくニャ","安くしておこう"],
["人間。赤ん坊は四つん這い、大人は二本足、老人は杖をつく","人間だよ。赤ん坊は四つん這い、大人は二本足、老人は杖をつくのさ",1],
["朝は四本、昼は二本、夜は三本。これは何だ","朝は四本、昼は二本、夜は三本。さて、これは何だい？",1],
["どうせ仲間が来る","どうせ仲間が来るさ",1],
["ここまでだ。引き返す","ここまでだね。引き返そう",1],
["待て。この床、色が違う","待ちたまえ。この床、色が違うようだ",1],
["効率よくいく","効率よくいこうじゃないか",1],
["相場の三倍はある","相場の三倍はあるだろうね",1],
["計算が合わない","計算が合わないね",1],
["全部持って帰る","全部持って帰るとしよう",1],
["みんな、ご苦労だった。この仲間で良かった","皆、ご苦労だった。この仲間で良かったと、心から思うよ",1]],
"O":{
"よっしゃ、いっくぞー！":"さあ、行こうじゃないか！",
"お前のやり方じゃ全員死ぬ！":"君のやり方では、全員が死ぬ！",
"当然の報酬だな":"当然の報酬だね",
"やった、これで当分は困らない！":"よし、これで当分は困らないね！",
"いったぁ！　やったな！":"痛っ！　やってくれたね！",
"重くて走れなくなる":"重くて走れなくなってしまうよ",
"大丈夫、一緒にいる":"大丈夫だ、一緒にいるよ",
"ダンジョン、悪くないかも":"ダンジョンも、悪くないかもしれないね",
"関節だ！　そこだけ柔らかい！":"関節だ！　そこだけが柔らかい！"}});
HK.Load.toneData("ane",{"F":[
["ここまでだ。引き返す","ここまでね。引き返しましょう"],
["朝は四本、昼は二本、夜は三本。これは何だ","朝は四本、昼は二本、夜は三本。さて、これは何かしら？",1],
["関節だ！　そこだけ柔らかい！","関節よ！　そこだけ柔らかいわ！"],
["人間。赤ん坊は四つん這い、大人は二本足、老人は杖をつく","答えは人間よ。赤ちゃんは四つん這い、大人は二本足、お年寄りは杖をつくでしょ",1],
["お前のやり方じゃ全員死ぬ！","あなたのやり方じゃ、みんな死んじゃうわよ！",1],
["答えは、人間だ","答えは、人間よ",1],
["あなたのやり方じゃ全員死ぬ！","あなたのやり方じゃ、全員死ぬわよ！",1],
["効率よくいこう","効率よくいきましょう",1]]});
HK.Load.toneData("aniki",{"F":[
["お前のやり方じゃ全員死ぬ！","お前のやり方じゃ全員死んじまう！　頼むから聞いてくれ！",1],
["朝は四本、昼は二本、夜は三本。これは何だ","朝は四本、昼は二本、夜は三本。これ、なーんだ？",1],
["やった、これで当分は困らない！","よっしゃ、これで当分は困らねえな！",1],
["あれは、触っちゃいけないやつだ","あれは触っちゃいけねえやつだぞ",1]]});
HK.Load.toneData("calm",{"F":[
["安くしとくニャ","安くしておくよ"],
["想定内の損傷だ","この程度の傷は覚悟していた"],
["計算が合わない","数が合わない"],
["人間。赤ん坊は四つん這い、大人は二本足、老人は杖をつく","人間だ。赤ん坊は四つん這い、大人は二本足、老人は杖をつく",1],
["朝は四本、昼は二本、夜は三本。これは何だ","朝は四本、昼は二本、夜は三本。これは何だ",1],
["あれは、触っちゃいけないやつだ","あれは、触っちゃいけないものだよ",1],
["お前のやり方じゃ全員死ぬ！","お前のやり方じゃ、全員死ぬ",1],
["やった、これで当分は困らない！","やった、これで当分は困らないね",1]]});
HK.Load.toneData("chara",{"F":[
["お前のやり方じゃ全員死ぬ！","そっちのやり方じゃ全員死ぬって！",1],
["よっしゃ、いっくぞー！","よっしゃ、いっくよー！　ウェーイ！",1],
["ダンジョン、悪くないかも","ダンジョン、意外とアリかも",1],
["朝は四本、昼は二本、夜は三本。これは何だ","朝は四本、昼は二本、夜は三本。これなーんだ？",1],
["ここまでだ。引き返す","ここまでだわ。引き返そ"],
["大丈夫、一緒にいる","大丈夫、一緒にいるって"],
["人間。赤ん坊は四つん這い、大人は二本足、老人は杖をつく","人間っしょ！　赤ちゃんは四つん這い、大人は二本足、年寄りは杖つく"],
["どうせ仲間が来る","どうせ仲間来るって"],
["待って。この床、色が違う","待って待って。この床、色違くね？",1],
["効率よくいこう","効率よくいこ〜",1]]});
HK.Load.toneData("cool",{"F":[
["安くしとくニャ","安くしておく"],
["人間。赤ん坊は四つん這い、大人は二本足、老人は杖をつく","人間だ。乳児は四足、成人は二足、老人は杖を加えて三本だ",1],
["朝は四本、昼は二本、夜は三本。これは何だ","朝は四本、昼は二本、夜は三本。これは何だ？　論理で解ける",1],
["お前のやり方じゃ全員死ぬ！","お前のやり方では全員死ぬ！　見ればわかる",1],
["やった、これで当分は困らない！","よし、これで当分は困らない",1]]});
HK.Load.toneData("darui",{"F":[
["あれは、触っちゃいけないやつだ","……あれは……触っちゃいけないやつ……"],
["いったぁ！　やったな！","……いった。……やったな"],
["やった、これで当分は困らない！","……やった。……これで当分は困らない"],
["よっしゃ、いっくぞー！","……はあ。……行くか"],
["人間。赤ん坊は四つん這い、大人は二本足、老人は杖をつく","……人間。……四つん這い、二本足、杖。……はい",1],
["朝は四本、昼は二本、夜は三本。これは何だ","……朝は四本、昼は二本、夜は三本。……なーんだ",1],
["あなたのやり方じゃ全員死ぬ！","……あんたのやり方じゃ、全員死ぬって",1]]});
HK.Load.toneData("devoted",{"F":[
["朝は四本、昼は二本、夜は三本。これは何だ","朝は四本、昼は二本、夜は三本。これは、何でしょうか？",1],
["人間。赤ん坊は四つん這い、大人は二本足、老人は杖をつく","人間、です。赤ちゃんは四つん這い、大人は二本足、お年寄りは杖をつきますから",1],
["関節だ！　そこだけ柔らかい！","関節です！　そこだけ柔らかいです！",1],
["ここまでだ。引き返す","ここまでです。引き返しましょう",1],
["みんなの分、ちゃんと分けましょう","みんなの分、ちゃんと分けましょうね。誰も困らないように",1]]});
HK.Load.toneData("devoted_p",{"F":[
["朝は四本、昼は二本、夜は三本。これは何だ","朝は四本、昼は二本、夜は三本。これ、なーんだ？",1],
["人間。赤ん坊は四つん這い、大人は二本足、老人は杖をつく","人間だよ！　赤ちゃんは四つん這い、大人は二本足、お年寄りは杖をつくの",1]]});
HK.Load.toneData("free",{"F":[
["あれは、触っちゃいけないやつだ","あれは、触っちゃいけないやつ！",1],
["人間。赤ん坊は四つん這い、大人は二本足、老人は杖をつく","人間！　赤ちゃんは四つん這い、大人は二本足、おじいちゃんは杖！",1],
["朝は四本、昼は二本、夜は三本。これは何だ","朝は四本、昼は二本、夜は三本！　これは何でしょー？",1]]});
HK.Load.toneData("genki",{"F":[
["ありがたく頂戴いたします","ありがたく、いただいちゃいます！",1],
["朝は四本、昼は二本、夜は三本。これは何だ","朝は四本、昼は二本、夜は三本。さて、これは何でしょう？",1]]});
HK.Load.toneData("gentle",{"F":[
["お前のやり方じゃ全員死ぬ！","きみのやり方じゃ、みんな死んじゃうよ！"],
["ここまでだ。引き返す","ここまでにしよう。引き返そう"],
["朝は四本、昼は二本、夜は三本。これは何だ","朝は四本、昼は二本、夜は三本。これ、なーんだ？",1],
["人間。赤ん坊は四つん這い、大人は二本足、老人は杖をつく","答えは、人間だよ。赤ちゃんは四つん這い、大人は二本足、お年寄りは杖をつくから",1],
["答えは、人間だ","答えは、人間だよ",1],
["あなたのやり方じゃ全員死ぬ！","きみのやり方だと、みんな死んじゃうよ！",1]]});
HK.Load.toneData("gentle_n",{"F":[
["お前のやり方じゃ全員死ぬ！","きみのやり方じゃ、みんな死んじゃうよ！"],
["朝は四本、昼は二本、夜は三本。これは何だ","朝は四本、昼は二本、夜は三本。これは何だと思う？",1],
["人間。赤ん坊は四つん這い、大人は二本足、老人は杖をつく","人間。赤ん坊は四つん這い、大人は二本足、年寄りは杖をつく",1],
["答えは、人間だ","答えは、人間だよ",1]]});
HK.Load.toneData("gyaru",{"F":[
["あれは、触っちゃいけないやつだ","あれ、触っちゃダメなやつじゃん",1],
["人間。赤ん坊は四つん這い、大人は二本足、老人は杖をつく","人間！　赤ちゃんは四つん這い、大人は二本足、老人は杖ってこと",1],
["朝は四本、昼は二本、夜は三本。これは何だ","朝は四本、昼は二本、夜は三本。これ何だ〜？",1],
["お前のやり方じゃ全員死ぬ！","あんたのやり方じゃ全員死ぬって！"],
["待って。この床、色が違う","待って。この床、色違くない？"],
["ここまでだ。引き返す","ここまでだね。引き返そ"],
["大丈夫、一緒にいる","だいじょぶ、一緒にいるから"],
["どうせ仲間が来る","どうせ仲間来るし"],
["効率よくいこう","効率よくいこ〜",1],
["みんな、お疲れさま。私、この仲間で良かった","みんな、お疲れ〜。私、この仲間でマジよかった",1]]});
HK.Load.toneData("hero",{"F":[
["お前のやり方じゃ全員死ぬ！","お前のやり方じゃ全員死んじまう！　一緒に考え直そう！",1],
["よっしゃ、いっくぞー！","よっしゃあ！　いっくぞおおお！",1],
["ダンジョン、悪くないかも","ダンジョン、悪くないな！　燃えてきた！",1],
["朝は四本、昼は二本、夜は三本。これは何だ","朝は四本、昼は二本、夜は三本！　これは何だ！？",1],
["やった、これで当分は困らない！","よっしゃ、これで当分は困らねえ！",1],
["みんな、下がっていろ","みんな、下がってろ！",1],
["みんな、ご苦労だった。この仲間で良かった","みんな、お疲れだったぜ！　この仲間で本当に良かった！",1],
["山分けだ、山分け","山分けだ、山分けだぜ！",1]]});
HK.Load.toneData("kohai",{"F":[
["ありがたく頂戴いたします","ありがたくいただくっす"],
["あれは、触っちゃいけないやつだ","あれは、触っちゃいけないやつっす"],
["お前のやり方じゃ全員死ぬ！","そっちのやり方じゃ、全員死んじゃうっす！"],
["朝は四本、昼は二本、夜は三本。これは何だ","朝は四本、昼は二本、夜は三本。これ、何だと思うっすか？",1],
["あなたのやり方では全員死にます！","あなたのやり方じゃ、全員死ぬっす！",1],
["みんな、お疲れさまでした。私、この仲間で良かったです","みんな、お疲れさまっした！　私、この仲間で良かったっす",1]]});
HK.Load.toneData("mystic",{"F":[
["効率よくいこう","効率よくいこうか"],
["想定内の損傷だ","想定内の損傷なんだ"],
["人間。赤ん坊は四つん這い、大人は二本足、老人は杖をつく","人間だよ。赤ん坊は四つん這い、大人は二本足、老人は杖をつくんだよ",1],
["朝は四本、昼は二本、夜は三本。これは何だ","朝は四本、昼は二本、夜は三本。さあ、これは何だと思う？",1],
["あれは、触っちゃいけないやつだ","あれは、触っちゃいけないやつだよ",1],
["お前のやり方じゃ全員死ぬ！","君のやり方じゃ、全員死んじゃうよ",1],
["やった、これで当分は困らない！","やった、これで当分は困らないんだ！",1],
["あなたのやり方では全員死ぬ！","君のやり方では、全員死ぬよ",1],
["山分けだ、山分け","山分けさ、山分け",1],
["相場の三倍はある","相場の三倍はあるだろうね",1],
["ここまでだ。引き返す","ここまでだね。引き返そう",1]]});
HK.Load.toneData("ojou",{"F":[
["朝は四本、昼は二本、夜は三本。これは何だ","朝は四本、昼は二本、夜は三本。これは何かしら？",1],
["人間。赤ん坊は四つん這い、大人は二本足、老人は杖をつく","人間ですわ。赤ん坊は四つん這い、大人は二本足、老人は杖をつきますの",1],
["効率よくいきましょう","効率よく参りましょう",1]]});
HK.Load.toneData("proud",{"F":[
["安くしとくニャ","安くしといてやる"],
["お前のやり方じゃ全員死ぬ！","お前のやり方じゃ全員死ぬ！　私に従え！",1],
["朝は四本、昼は二本、夜は三本。これは何だ","朝は四本、昼は二本、夜は三本。これは何だ。答えてみろ",1],
["やった、これで当分は困らない！","ふん、これで当分は困らねえ",1],
["あれは、触っちゃいけないやつだ","あれは触っちゃいけねえやつだ",1]]});
HK.Load.toneData("shy",{"F":[
["お前のやり方じゃ全員死ぬ！","あ、あなたのやり方じゃ……み、みんな、死んじゃう……！"],
["ここまでだ。引き返す","こ、ここまで、かな……。引き返そう……"],
["朝は四本、昼は二本、夜は三本。これは何だ","あ、朝は四本、ひ、昼は二本、よ、夜は三本……こ、これ、何でしょう……？",1],
["人間。赤ん坊は四つん這い、大人は二本足、老人は杖をつく","に、人間、です……あ、赤ちゃんは四つん這いで、お、大人は二本足、お年寄りは、つ、杖……",1],
["答えは、人間だ","こ、答えは……に、人間、です……",1]]});
HK.Load.toneData("stern",{"F":[
["あれは、触っちゃいけないやつだ","あれは、触れてはならないものだ"],
["やった、これで当分は困らない！","よし、これで当分は困らない！"],
["ダンジョン、悪くないかも","ダンジョンも、悪くないかもしれない"],
["人間。赤ん坊は四つん這い、大人は二本足、老人は杖をつく","人間だ。赤子は四つん這い、大人は二本足、老いれば杖をつく",1],
["朝は四本、昼は二本、夜は三本。これは何だ","朝は四本、昼は二本、夜は三本。これは何だ",1],
["お前のやり方じゃ全員死ぬ！","お前のやり方では全員死ぬ！",1]]});
HK.Load.toneData("tsun",{"F":[
["あれは、触っちゃいけないやつだ","あれは、触っちゃいけないやつよ",1],
["人間。赤ん坊は四つん這い、大人は二本足、老人は杖をつく","人間よ。赤ん坊は四つん這い、大人は二本足、老人は杖をつく。……簡単すぎ",1],
["朝は四本、昼は二本、夜は三本。これは何だ","朝は四本、昼は二本、夜は三本。これ、何だと思う？　……わかるでしょ、これくらい",1],
["ま、まあ悪くないんじゃない？","ま、まあ……悪くないんじゃない？　ちょっとだけね",1]]});
HK.Load.toneData("tsun_n",{"F":[
["あれは、触っちゃいけないやつだ","あれは、触っちゃいけないやつだ",1],
["人間。赤ん坊は四つん這い、大人は二本足、老人は杖をつく","人間。赤ん坊は四つん這い、大人は二本足、老人は杖をつく",1],
["朝は四本、昼は二本、夜は三本。これは何だ","朝は四本、昼は二本、夜は三本。これは何だ？",1]]});
HK.Load.toneData("usan",{"F":[
["朝は四本、昼は二本、夜は三本。これは何だ","朝は四本、昼は二本、夜は三本。これは何だい？"],
["人間。赤ん坊は四つん這い、大人は二本足、老人は杖をつく","人間さ。赤ん坊は四つん這い、大人は二本足、年寄りは杖をつくってわけ",1],
["あれは、触っちゃいけないやつだよ","あれは、触っちゃいけないやつだねえ",1],
["効率よくいこう","効率よくいこうじゃないの",1],
["待って。この床、色が違う","ちょいと待った。この床、色が違うよ",1]]});
HK.Load.toneData("yankee",{"F":[
["よっしゃ、いっくぞー！","っしゃあ、行くぞオラァ！",1],
["お前のやり方じゃ全員死ぬ！","てめえのやり方じゃ全員死ぬっつってんだよ！",1],
["ダンジョン、悪くないかも","ダンジョン、悪くねえかもな",1],
["待って。この床、色が違う","待て。この床、色が違うぞ",1],
["あいたた……大丈夫、大丈夫","いってて……大丈夫だ、大丈夫",1],
["ここまでだ。引き返す","ここまでだ。引き返すぞ",1],
["相場の三倍はある","相場の三倍はあんぞ",1],
["あれは、触ってはいけないものだ","あれは、触っちゃいけねえもんだ",1],
["効率よくいく","効率よくいくぞ",1]]});
HK.Load.toneData("sondai",{"F":[
["人間。赤ん坊は四つん這い、大人は二本足、老人は杖をつく","人間だよ。赤ん坊は四つん這い、大人は二本足、老いれば杖をつく。簡単ではないかね",1],
["朝は四本、昼は二本、夜は三本。これは何だ","朝は四本、昼は二本、夜は三本。さて、これは何かね？",1],
["待て。この床、色が違う","待ちたまえ。この床、色が違うではないか",1],
["あれは、触ってはいけないものだ","あれは、触れてはならないものだよ",1],
["相場の三倍はある","相場の三倍はあるだろうね",1]]});
HK.Load.toneData("god",{"F":[
["ダンジョンも、悪くないな","ダンジョンも、悪くはない",1],
["待て。この床、色が違う","待て。この床、色が違うぞ",1],
["みんな、ご苦労だった。この仲間で良かった","皆、大儀であった。この仲間でよかったぞ",1],
["ここまでだ。引き返す","ここまでだ。引き返すぞ",1],
["効率よくいく","効率よくゆくぞ",1],
["相場の三倍はある","相場の三倍はあろう",1],
["これを売ったらいくらになる","これを売れば、いかほどになる？",1],
["よし、これで当分は困らない！","よし、これで当分は困らぬ！",1],
["あれは、触ってはいけないものだ","あれは、触れてはならぬものだ",1]]});
HK.Load.toneData("keigo_sarc",{"F":[
["待ってください。この床、色が違います","待ってください。……この床、色が違います。見て分かりませんか",1],
["みんな、お疲れさまでした。私、この仲間で良かったです","……お疲れさまでした。この仲間で良かったと、まあ、思っています",1]]});
HK.Load.toneData("ronkyaku",{"F":[
["悪いが、通してもらう","悪いが、通してもらうよ",1],
["みんな、下がっていろ","全員、下がっていたまえ",1],
["みんな、ご苦労だった。この仲間で良かった","皆、ご苦労だった。この仲間で良かったと、認めよう",1],
["ここまでだ。引き返す","ここまでだな。引き返すのが合理的だ",1],
["効率よくいく","効率よくいく。それだけだ",1]]});
HK.Load.toneData("chara_down",{"F":[
["あれは、触ってはいけないものです","あれは、触っちゃいけないやつですよー",1],
["ありがたく頂戴いたします","ありがたく、もらっときまーす",1],
["計算が合いません","計算、合わないんですけどー？",1]]});
});
HK.Load.done('scen-rpg', 'c7006400cd', 1);
