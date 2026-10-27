;
/* ==== js/rpg-special.js ==== */
HK.Load.def(161,'js/rpg-special.js',function(){
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
HK.Load.def(180,'js/rpg-data.js',function(){
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
HK.Load.def(181,'js/scenario-rpg.js',function(){
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
/* ==== js/jashin-jobs.js ==== */
HK.Load.def(183,'js/jashin-jobs.js',function(){
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
HK.Load.def(184,'js/jashin-jobs-pair.js',function(){
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
/* ==== js/jashin-fx-a.js ==== */
HK.Load.def(186,'js/jashin-fx-a.js',function(){
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
HK.Load.def(187,'js/jashin-gods-rev.js',function(){
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
/* ==== js/jashin-rel-text.js ==== */
HK.Load.def(189,'js/jashin-rel-text.js',function(){
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
family:L('{b}は{a}の名前を叫び続けた。「嘘だ、嘘だろ……帰ったら、母さんに何て言えばいいんだ｜嘘だ、嘘だろう……帰ったら、母さんに何と言えばいいのだ｜嘘です、嘘でしょう……帰ったら、母さんに何て言えばいいんですか」|{b}は{a}の遺品の小さなお守りを握りしめた。昔、自分があげたものだった。'),
close:L('{b}は壁を殴りつけた。「なんであなたなんだよ……！｜なぜあなたなのだ……！｜どうしてあなたなんですか……！」|{b}は{a}のいた場所を見つめたまま、しばらく何も言えなかった。'),
bad:L('{b}は、{a}の亡骸から目を逸らした。憎み合っていたはずなのに、胸の奥が妙に痛んだ。|「……勝ち逃げかよ｜……勝ち逃げか｜……勝ち逃げですか」{b}は小さく呟いた。'),
ex:L('{b}は、{a}の亡骸の前で立ち尽くした。言いたかったことが、まだたくさんあった。'),
crush:L('{b}は、とうとう{a}に想いを伝えられなかった。{b}は、{a}の手を握って、ようやく小さな声で言った。「……好きだったんだ｜……好きだった｜……好きだったんです」'),
mutual:L('{b}は、{a}の亡骸の前で膝をついた。言えなかった。どうせ届かないと思っていた。――{a}の手帳から、{b}の名前を何度も書いては消した跡が出てきたのは、そのあとだった。|{b}は、{a}の冷たい手を握った。「……好きだったんだ。迷惑だと思って、言えなかった｜……好きだった。迷惑だと思って、言えなかった｜……好きだったんです。迷惑だと思って、言えませんでした」――{a}が最期に呼んだのが自分の名前だったと、{b}はあとになって聞いた。|{b}は泣かなかった。片想いの相手が死んだだけだ、と自分に言い聞かせた。{a}のポケットから、{b}を写した一枚きりの写真が出てくるまでは。')
},
GRIEF_NB:{
love:L('{b}は、{a}が消えた闇に向かって、何度も何度も{a}の名前を呼んだ。返事は、どこからも返ってこなかった。|{b}は{a}の上着を胸に抱いて、声を上げて泣いた。誰も、{b}を引き離すことができなかった。|{b}は泣かなかった。ただ、{a}が最後に立っていた場所から、朝まで動かなかった。'),
family:L('{b}は{a}の名前を叫び続けた。「嘘だ、嘘だろ……帰ったら、母さんに何て言えばいいんだ｜嘘だ、嘘だろう……帰ったら、母さんに何と言えばいいのだ｜嘘です、嘘でしょう……帰ったら、母さんに何て言えばいいんですか」|{b}は{a}の遺品の小さなお守りを握りしめた。昔、自分があげたものだった。'),
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
HK.Load.def(190,'js/jashin-rel.js',function(){
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
var ok=ts.some(function(t){return(t.type==='crush'&&t.a===a.i)||((t.type==='almost'||t.type==='ex')&&a.i<b.i);});
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
HK.Load.def(191,'js/jashin-drama.js',function(){
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
if(w>=0.3&& !has(S,a,b,'lover,mate,fated')&& !S.ties.some(function(t){return((t.a===a.i&&t.b===b.i)||(t.a===b.i&&t.b===a.i))&&HK.tieNoLove(t);})&&(!HK.canLove||HK.canLove(a,b))&&(!HK.Poly||HK.Poly.storyCan(S,a,b))&& !S.dConfess)opts.push([a,b,'confess',0.25+a.tr.fc*0.4+w*0.4+(mutual(S,a,b)?0.2:0)]);
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
HK.Load.def(192,'js/jashin.js',function(){
(function(){
'use strict';
var HK=window.HK,ST=HK.Story,JS=HK.JASHIN,clamp=HK.clamp,M=JS&&JS.MORE;
if(!ST|| !JS|| !JS.GODS|| !M)return;
function L(s){return s.split('|');}
var scen={
id:'jashin',name:'邪神村RTA',kicker:'ホラー・脱出（1〜6人）',solo:true,maxCast:6,minCast:1,
desc:'地図にない山奥の村に迷い込んだ住人たち。村には得体の知れない神が祀られ、祭りの夜が近づいている。神の正体を示す手がかりを集め、対抗策を突き止めて、生きて村を出られるか。何時間で脱出できたかを記録する。',
note:'※ホラー表現（死・失踪）を含みます。登場人物は、未成年の職業（高校生・令嬢・幼子）を選んだ人以外は成人として扱います。',
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
],
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
var lead=who||S.P.filter(alive).sort(function(a,b){return skill(b,'lore')-skill(a,'lore');})[0];
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
HK.Load.def(193,'js/jashin-muno.js',function(){
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
HK.Load.def(194,'js/jashin-special.js',function(){
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
HK.Load.def(195,'js/jashin-duo-data.js',function(){
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
HK.Load.def(196,'js/jashin-duo.js',function(){
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
HK.Load.def(197,'js/jashin-cave.js',function(){
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
HK.Load.def(198,'js/jashin-loop.js',function(){
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
if(!p|| !p.alive||(HK.State&& !HK.State.here(p)))return false;
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
/* ==== js/jashin-mage.js ==== */
HK.Load.def(200,'js/jashin-mage.js',function(){
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
HK.Load.def(201,'js/jashin-goals-text.js',function(){
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
HK.Load.def(202,'js/jashin-goals.js',function(){
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
var cs=live.filter(function(q){return q!==p&& !q.bound&&canLove(p,q)&&(!HK.Poly||HK.Poly.storyCan(S,p,q))&& !(S.ties||[]).some(function(t){return((t.a===p.i&&t.b===q.i)||(t.a===q.i&&t.b===p.i))&&HK.tieNoLove(t);})&& !(L0.no&&L0.no.indexOf(q.i)>=0);});
if(!cs.length)return false;
L0.t=HK.weighted(rng,cs,function(q){return 1+Math.max(0,bond(S,p,q))*2+q.tr.warmth;});L0.pt=0;
ST.sayB(S,{actors:[p,L0.t],tag:'恋',text:F(pk(S,T.LOVE_PICK),{a:p.name,b:L0.t.name}),why:p.name+'の目標は「恋人を作る」（FC・NP・衝動）'},p.name+'は'+L0.t.name+'が気になっていた');
return true;
}
var b=L0.t,m={a:p.name,b:b.name};
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
HK.Load.def(203,'js/jashin-love.js',function(){
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
function loverOf(S,b){return S.P.filter(function(c){return c!==b&&al(c)&&hasTie(S,c,b,'lover,mate,fated');})[0]||null;}
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
var lv=loverOf(S,b),m={a:p.name,b:b.name};
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
var L0=p.love,cs=live.filter(function(q){return q!==p&& !q.bound&&al(q)&&HK.canLove(p,q)&&HK.canLove(q,p)&&(!HK.Poly||HK.Poly.storyCan(S,p,q))&& !(S.ties||[]).some(function(t){return((t.a===p.i&&t.b===q.i)||(t.a===q.i&&t.b===p.i))&&HK.tieNoLove(t);})&& !(L0.no&&L0.no.indexOf(q.i)>=0);});
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
var lv=loverOf(S,b);
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
HK.Load.def(204,'js/jashin-npc-text.js',function(){
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
HK.Load.def(205,'js/jashin-npc.js',function(){
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
HK.Load.def(206,'js/jashin-godev.js',function(){
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
HK.Load.def(207,'js/jashin-godev-data-a.js',function(){
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
HK.Load.def(208,'js/jashin-godev-data-b.js',function(){
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
HK.Load.def(209,'js/jashin-godev-sp-a.js',function(){
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
HK.Load.def(210,'js/jashin-godev-sp-b.js',function(){
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
HK.Load.def(211,'js/jashin-place-lines.js',function(){
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
HK.Load.def(212,'js/jashin-feud.js',function(){
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
/* ==== js/yakata-jobs.js ==== */
HK.Load.def(214,'js/yakata-jobs.js',function(){
(function(){
'use strict';
var HK=window.HK,Y=HK&&HK.YAKATA;
if(!Y|| !Y.ROLES|| !Y.ROLE)return;
function L(s){return s.split('|');}
var ADD=[
{id:'accountant',label:'経理',group:'ゲスト',sk:{lore:0.25,obs:0.1},desc:'帳簿や書類の山から、不自然な金の流れを見つける'},
{id:'architect',label:'建築家・大工',group:'ゲスト',sk:{obs:0.2,search:0.2},desc:'間取りや床板の不自然さに気づく（隠し通路・二重壁も）'},
{id:'mechanic',label:'整備士・エンジニア',group:'ゲスト',sk:{search:0.15,lore:0.15,fight:0.1},desc:'発電機・鍵・時計の細工を見抜き、壊れた機械を直す'},
{id:'nurse',label:'看護師',group:'ゲスト',sk:{med:0.3,talk:0.15},desc:'薬の種類と量が分かる。手当てで怯えた人の心を開く'},
{id:'chef',label:'料理人・バーテンダー',group:'ゲスト',sk:{obs:0.15,talk:0.15},desc:'食事と酒の時間を覚えている。酔わせて口を軽くする'},
{id:'stylist',label:'美容師',group:'ゲスト',sk:{obs:0.3},desc:'髪・爪・体の癖から、人を見分ける'},
{id:'actor',label:'俳優',group:'ゲスト',sk:{talk:0.2,hide:0.2},desc:'芝居で相手の反応を見る。嘘がうまい'},
{id:'sales',label:'営業',group:'ゲスト',sk:{talk:0.3},desc:'場を和ませて口を軽くする。断られても粘る'}
];
ADD.forEach(function(r){if(!Y.ROLE[r.id]){Y.ROLES.push(r);Y.ROLE[r.id]=r;}});
if(Y.AUTO){
Y.AUTO.accountant=function(t){return t.a*0.4+t.caution*0.3+t.cp*0.1;};
Y.AUTO.architect=function(t){return t.a*0.4+t.fc*0.2+t.caution*0.1;};
Y.AUTO.mechanic=function(t){return t.a*0.3+t.impulse*0.2+t.cold*0.2;};
Y.AUTO.nurse=function(t){return t.np*0.5+t.warmth*0.2;};
Y.AUTO.chef=function(t){return t.np*0.3+t.fc*0.3;};
Y.AUTO.stylist=function(t){return t.fc*0.35+t.warmth*0.2+t.a*0.1;};
Y.AUTO.actor=function(t){return t.fc*0.4+(1-t.honesty)*0.2+t.impulse*0.1;};
Y.AUTO.sales=function(t){return t.warmth*0.3+t.fc*0.3+t.lead*0.1;};
}
function addJobs(id,list){
var m=Y.MOTIVE&&Y.MOTIVE[id];if(!m)return;
var l=(m.jobs||'').split(',').filter(function(x){return x;});
list.split(',').forEach(function(j){if(l.indexOf(j)<0)l.push(j);});
m.jobs=l.join(',');
}
addJobs('inherit','accountant');addJobs('insurance','accountant,sales');addJobs('blackmail','accountant');
addJobs('jealous','actor,stylist');addJobs('fame','actor');addJobs('mercy','nurse');addJobs('experiment','nurse');
addJobs('accident','mechanic,chef,architect');addJobs('silence','sales');
var J=Y.JOBS={SOLO:{},CUL:{},PAIR:[],MAX:5,RATE:0.5};
var NEWJOB={};ADD.forEach(function(r){NEWJOB[r.id]=1;});
J.isNew=function(id){return!!NEWJOB[id];};
var ST=function(){return HK.Story;};
function clamp(x,a,b){return x<a?a:x>b?b:x;}
function F(t,m){return ST().fmt(t,m);}
function pk(S,a){return ST().pick(S,a);}
function alive(p){return p&&p.alive&& !p.gone;}
function free(p){return alive(p)&& !p.bound&& !p.mad;}
function sk(p,k){return Y.skill?Y.skill(p,k):0.4;}
function pct(x){return Math.round(x*100);}
function sus(p,d){if(p&&p.m)p.m.sus=clamp(p.m.sus+d,0,100);}
function fear(p,d){if(p&&p.m)p.m.fear=clamp(p.m.fear+d,0,100);}
function lastKill(S){return Y.lastDead?Y.lastDead(S):S.kills[S.kills.length-1];}
function fmtM(S,a,b){
var k=lastKill(S);
return{a:a.name,b:b?b.name:'',c:S.cul?S.cul.name:'',v:k?k.v.name:(S.v1?S.v1.name:''),p:k?k.trick.place:'広間',h:S.host?S.host.name:''};
}
function guilty(S,p){return p===S.cul&& !S.mot.nobody||p.isAcc;}
function culOk(S){return S.cul&&free(S.cul)&& !S.mot.nobody;}
function ties(S,a,b){return(S.ties||[]).filter(function(t){return(t.a===a.i&&t.b===b.i)||(t.a===b.i&&t.b===a.i);});}
function noHelp(S,a,b){return ties(S,a,b).some(function(t){return(t.type==='apathy'&&t.a===a.i)||(t.type==='fear'&&t.a===b.i);});}
J.noHelp=noHelp;J.ties=ties;J.free=free;J.guilty=guilty;
function say(S,id,o){o.jobEv=id;if(o.mag==null)o.mag=22;return ST().say(S,o);}
J.say=say;
function clue(S,p,pref){return Y.gain?Y.gain(S,p,pref):'';}
J.clue=clue;
function motiveLeft(S){return S.pool.filter(function(c){return c.motive&& !c.found&& !c.lost&& !c.fake;})[0];}
function gainMotive(S,p){
var c=motiveLeft(S);if(!c)return'';
c.found=true;c.by=p;p.cnt.clue++;sus(S.cul,12);
return c.t;
}
var MONEY= /^(inherit|insurance|blackmail)$/;
function fakeLeft(S,test){return S.pool.filter(function(c){return c.fake&& !c.lost&&(!test||test(c));})[0];}
function expose(S,p,c){
c.found=true;c.fake=false;c.exposed=true;c.by=p;c.t=c.t+'――ただし、それは偽装だった';p.cnt.clue++;
sus(S.cul,15);if(c.b)sus(c.b,-15);
return c.t;
}
J.expose=expose;J.fakeLeft=fakeLeft;
function misread(S,b){
var c=S.pool.filter(function(x){return x.found&& !x.fake&& !x.misread&& !x.exposed;})[0];
if(c&&b){c.misread=b;}
sus(b,10);
return!!c;
}
J.misread=misread;
function loseOne(S,pref){
var left=S.pool.filter(function(x){return!x.found&& !x.lost&& !x.fake;});
if(left.length<2)return false;
var c=left.filter(function(x){return x.type===pref;})[0]||left[0];
c.lost=true;return true;
}
J.loseOne=loseOne;
function innocent(S,a,filt){return S.P.filter(function(q){return free(q)&&q!==a&& !guilty(S,q)&&(!filt||filt(q));});}
J.innocent=innocent;
var LIAR={lawyer:0.06,actor:0.08,sales:0.04,celeb:0.03,mage:0.02};
J.lie=function(S,p){
if(!p|| !p.tr)return 0;
var t=p.tr,n=(p.stats&&p.stats.nerve)||3;
return clamp((LIAR[p.role]||0)+(0.5-t.honesty)*0.1+(t.cold-0.5)*0.04+(n-3)*0.01,-0.08,0.12);
};
J.conceal=function(S,c){return c&&c.type==='talk'&&S.cul&& !S.mot.nobody?J.lie(S,S.cul):0;};
J.deduce=function(S){return S.cul&& !S.mot.nobody?J.lie(S,S.cul)*0.4:0;};
J.fake=function(S){return S.cul&& !S.mot.nobody?J.lie(S,S.cul)*0.5:0;};
function lieWhy(S,p){var l=J.lie(S,p);return'嘘のうまさ '+(l>=0?'+':'')+pct(l)+'（'+(LIAR[p.role]?(Y.ROLE[p.role]||{}).label+'・':'')+'正直さ '+pct(p.tr.honesty)+'）';}
J.lieWhy=lieWhy;
var PASS= /隠し|抜け穴|抜け道|通路|図面|床下|天井裏|壁の中|二重/,MECH= /時計|停電|電気|発電|装置|仕掛け|タイマー|合鍵|鍵|錠|糸|モーター|配線|電源|ブレーカー|機械|ゼンマイ|歯車/,POISON= /毒/;
J.kind=function(t){return{pass:PASS.test(t.truth||''),mech:MECH.test(t.truth||''),poison:POISON.test((t.method||'')+(t.truth||''))};};
J.trickW=function(S,t){
var c=S.cul;if(!c||S.mot.nobody)return 1;
var k=J.kind(t);
if((c.role==='chef'||c.role==='nurse')&&k.poison)return 2.5;
if(c.role==='architect'&&k.pass)return 3;
if(c.role==='mechanic'&&k.mech)return 2.2;
return 1;
};
function trickOf(S){var k=lastKill(S);return k?J.kind(k.trick):{};}
function E(role,id,can,run,w){(J.SOLO[role]=J.SOLO[role]||[]).push({id:id,can:can,run:run,w:w||1});}
function hasKill(S){return!!lastKill(S);}
var LAW_TALK=L('{a}は、取り調べのような口ぶりではなく、{b}の隣に静かに腰を下ろして言った。「話したくないことは、話さなくていい。昨夜のことで、覚えていることだけ聞かせて｜話したくないことは話さなくていい。昨夜のことで、覚えていることだけ聞かせてくれ｜話したくないことは、話さなくて構いません。昨夜のことで、覚えていることだけ聞かせてください」|{a}は、紅茶を二つ淹れて{b}の部屋を訪ねた。「これは尋問じゃない。私は、あなたの味方でいるつもりだよ｜これは尋問ではない。私はあなたの味方のつもりだ｜これは尋問ではありません。私は、あなたの味方でいるつもりです」');
E('lawyer','law_talk',function(S,a){return hasKill(S)&&innocent(S,a).length+(culOk(S)?1:0)>0;},function(S,a){
var rng=S.rng,list=S.P.filter(function(q){return free(q)&&q!==a&& !q.isDet&& !q.isAcc&& !noHelp(S,a,q);});
if(!list.length)return false;
var b=rng.pick(list),m=fmtM(S,a,b),t=F(pk(S,LAW_TALK),m),isC=b===S.cul&& !S.mot.nobody;
var ch=0.3+sk(a,'talk')*0.5-(isC?0.12+J.lie(S,b)*1.5:0);
if(rng()<ch){
if(isC){
sus(b,12);var g0=clue(S,a,'talk');
return say(S,'law_talk',{actors:[a,b],tag:'交渉',text:t+F('{b}は穏やかに答えていた。だが{a}が、契約書を読むときの目で一つだけ聞き返すと、{b}の話は、前に聞いたものと一か所だけ食い違った。',m)+(g0?'――'+g0+'。':''),why:'弁護士の交渉（聞き込み '+pct(sk(a,'talk'))+'）が、'+b.name+'の嘘を上回った（'+lieWhy(S,b)+'）……'+b.name+'が犯人だ（疑い +12）'});
}
var g=clue(S,a,'talk');
if(!g)return false;
if(Y.setRel)Y.setRel(S,a,b,0.1,'打ち解けた');
return say(S,'law_talk',{actors:[a,b],tag:'交渉',text:t+F('{b}は少し迷ってから、ぽつりぽつりと話し始めた。',m)+'――'+g+'。',why:'弁護士の交渉（聞き込み '+pct(sk(a,'talk'))+'）。取り調べより穏やかに聞き出したので、'+b.name+'との信頼は崩れなかった'});
}
if(isC)return say(S,'law_talk',{actors:[a,b],tag:'交渉',text:t+F('{b}は、よどみなく答えた。どこにも、引っかかるところはなかった。――少なくとも、そう見えた。',m),why:b.name+'の嘘のほうがうまかった（'+lieWhy(S,b)+'）。……'+b.name+'が犯人だ'});
return say(S,'law_talk',{actors:[a,b],tag:'交渉',text:t+F('{b}は首を振った。「何も知らない。本当に｜何も知らない。本当だ｜何も知りません。本当です」',m),why:b.name+'からは、何も聞き出せなかった（聞き込み '+pct(sk(a,'talk'))+'）'});
});
E('lawyer','law_contract',function(S,a){return!!motiveLeft(S)&&(MONEY.test(S.mot.id)||motiveLeft(S).type==='lore');},function(S,a){
var m=fmtM(S,a),t=F('{a}は、書斎の引き出しに残っていた契約書と借用書の束を、一枚ずつ机に並べた。',m);
if(S.rng()<0.3+sk(a,'lore')*0.6){
var g=gainMotive(S,a);if(!g)return false;
return say(S,'law_contract',{actors:[a],tag:'契約書',text:t+'「この借用書、日付がおかしい。署名だけ、あとから書き足してある｜この借用書は日付がおかしい。署名だけ、あとから書き足してある｜この借用書、日付がおかしいです。署名だけ、あとから書き足してあります」書類の束をたどっていくと、一つの事実に行き着いた。――'+g+'。',why:'弁護士の知識（'+pct(sk(a,'lore'))+'）。契約書と借用書から、動機の手がかりを割り出した'});
}
return say(S,'law_contract',{actors:[a],tag:'契約書',text:t+'書類はどれも、きちんと整っていた。整いすぎているほどだった。',why:'契約書からは、何も出てこなかった（知識 '+pct(sk(a,'lore'))+'）'});
});
E('lawyer','law_defend',function(S,a){return innocent(S,a,function(q){return q.m.sus>=40||S.framed===q;}).length>0;},function(S,a){
var b=innocent(S,a,function(q){return q.m.sus>=40||S.framed===q;}).sort(function(x,y){return y.m.sus-x.m.sus;})[0];
var m=fmtM(S,a,b),t=F('皆の視線が{b}に集まったとき、{a}が立ち上がった。「{b}を犯人だと決めつける証拠は、まだ一つもない。推定無罪だよ｜{b}を犯人と決めつける証拠は、まだ一つもない。推定無罪だ｜{b}を犯人と決めつける証拠は、まだ一つもありません。推定無罪です」',m);
sus(b,-15);
var fk=fakeLeft(S,function(c){return c.b===b;});
if(fk&&S.rng()<0.25+sk(a,'lore')*0.4-J.fake(S)){
var g=expose(S,a,fk);
return say(S,'law_defend',{actors:[a,b],tag:'弁護',kind:'climax',text:t+F('{a}は、{b}を指していた証拠を一つずつ検めた。「この証拠は、出来すぎている。誰かが、あとから置いたものだ｜この証拠は出来すぎている。誰かがあとから置いたものだ｜この証拠は、出来すぎています。誰かが、あとから置いたものです」',m)+'――'+g+'。',why:'弁護士が'+b.name+'を弁護し、偽の証拠を見破った（'+b.name+'への疑い -15・犯人への疑い +15）',mag:30});
}
return say(S,'law_defend',{actors:[a,b],tag:'弁護',text:t+F('{b}に向いていた疑いの目が、少しだけ和らいだ。',m),why:'弁護士が'+b.name+'を弁護した（'+b.name+'への疑い -15）'});
});
J.CUL.lawyer=function(S,c){
var sharp=S.P.filter(function(q){return free(q)&&q!==c&& !q.isAcc;}).sort(function(x,y){return sk(y,'obs')-sk(x,'obs');})[0];
var m=fmtM(S,c,sharp),t=F('{a}は、自分に向けられた疑いを、条文を読み上げるように一つずつ退けた。「昨夜の私の居場所には、証人がいる。疑うなら、証拠を出して｜昨夜の私の居場所には証人がいる。疑うなら証拠を出せ｜昨夜の私の居場所には、証人がいます。疑うなら、証拠を出してください」',m);
if(sharp&&S.rng()<sk(sharp,'obs')*0.4-J.lie(S,c)){sus(c,10);return say(S,'cx_law',{actors:[c,sharp],tag:'弁論',text:t+F('――{b}だけは気づいていた。{a}の言う「証人」は、昨夜、誰よりも早く眠っていた。',m),why:c.name+'の弁論（'+lieWhy(S,c)+'）を、'+sharp.name+'の観察（'+pct(sk(sharp,'obs'))+'）が見抜いた（'+c.name+'が犯人・疑い +10）'});}
sus(c,-12);
return say(S,'cx_law',{actors:[c],tag:'弁論',text:t+'反論できる者は、いなかった。',why:'弁護士の犯人は、嘘がうまい（'+lieWhy(S,c)+'）。'+c.name+'が犯人（疑い -12）'});
};
E('accountant','acc_ledger',function(S,a){return hasKill(S);},function(S,a){
var m=fmtM(S,a),t=F('{a}は、書斎の棚から館の出納帳を引き抜き、一晩かけて数字を追った。',m);
if(S.rng()<0.3+sk(a,'lore')*0.55){
var g=MONEY.test(S.mot.id)?gainMotive(S,a):'';
if(!g)g=clue(S,a,'lore');
if(!g)return false;
return say(S,'acc_ledger',{actors:[a],tag:'帳簿',text:t+'「三年前から、毎月同じ額が、同じ日に消えている｜三年前から、毎月同じ額が同じ日に消えている｜三年前から、毎月同じ額が、同じ日に消えています」帳簿の余白の書き込みが、思わぬところへつながっていた。――'+g+'。',why:'経理の技術（知識 '+pct(sk(a,'lore'))+'）。帳簿の数字は、嘘をつけない'+(MONEY.test(S.mot.id)?'（動機「'+S.mot.label+'」の手がかり）':'')});
}
return say(S,'acc_ledger',{actors:[a],tag:'帳簿',text:t+'数字は合っていた。ただ、ところどころ、ページの角が新しく折られていた。',why:'帳簿からは、決め手は出なかった（知識 '+pct(sk(a,'lore'))+'）'});
});
E('accountant','acc_pile',function(S,a){return hasKill(S);},function(S,a){
var m=fmtM(S,a),t=F('{a}は、書斎の机に積まれた書類の山を、日付順に仕分け始めた。「書類は、並べ直すと嘘をつけなくなるの｜書類は、並べ直せば嘘をつけなくなる｜書類は、並べ直すと嘘をつけなくなります」',m);
if(S.rng()<0.3+(sk(a,'lore')+sk(a,'obs'))*0.25){
var g=clue(S,a,'search');if(!g)return false;
return say(S,'acc_pile',{actors:[a],tag:'書類の山',text:t+'山の中ほどから、一枚だけ種類の違う紙が出てきた。――'+g+'。',why:'経理は書類の整理がうまい（知識 '+pct(sk(a,'lore'))+'・観察 '+pct(sk(a,'obs'))+'）。書斎の山から、重要な一枚を見つけた'});
}
fear(a,3);
return say(S,'acc_pile',{actors:[a],tag:'書類の山',text:t+'三百枚を仕分け終えたころには、もう日が傾いていた。目新しいものは、何もなかった。',why:'書類の山は空振りだった（時間だけが過ぎた）'});
});
E('accountant','acc_debt',function(S,a){return hasKill(S)&&(MONEY.test(S.mot.id)&& !!motiveLeft(S)||innocent(S,a).length>0);},function(S,a){
var rng=S.rng,m=fmtM(S,a),t=F('{a}は、{v}の鞄から出てきた保険証書と、借金の返済表とを見比べた。',m);
if(MONEY.test(S.mot.id)&&motiveLeft(S)&&rng()<0.35+sk(a,'lore')*0.5){
var g=gainMotive(S,a);sus(S.cul,6);
return say(S,'acc_debt',{actors:[a],tag:'保険証書',text:t+'「受取人の名前が、去年の暮れに書き換えられている｜受取人の名前が、去年の暮れに書き換えられている｜受取人のお名前が、去年の暮れに書き換えられています」――'+g+'。',why:'経理の目（知識 '+pct(sk(a,'lore'))+'）。動機「'+S.mot.label+'」の金の流れを割り出した（犯人への疑い +18）'});
}
var inn=innocent(S,a);if(!inn.length)return false;
var b=rng.pick(inn);m.b=b.name;misread(S,b);
return say(S,'acc_debt',{actors:[a,b],tag:'保険証書',text:t+F('返済表の保証人の欄には、{b}の名前があった。{a}は、その名前に赤い丸をつけた。',m),why:'偽の手がかり：'+b.name+'の借金は、事件とは関係がなかった（'+b.name+'への疑い +10。推理が'+b.name+'の方へずれる）'});
});
J.CUL.accountant=function(S,c){
var rng=S.rng,inn=innocent(S,c,function(q){return!q.isDet;}),b=inn.length?rng.pick(inn):null,m=fmtM(S,c,b);
var t=F('{a}は「整理を手伝う」と言って書斎に入り、出納帳の一頁を、そっと別の頁と差し替えた。',m);
if(motiveLeft(S)){motiveLeft(S).lost=true;return say(S,'cx_acc',{actors:[c],tag:'帳簿の差し替え',text:t+'数字の帳尻は、何事もなかったように合っていた。',why:'経理の犯人は、帳簿を書き換えられる。動機の手がかりが一つ失われた（'+c.name+'が犯人）'});}
if(!b)return false;
S.pool.push({type:'lore',t:F('出納帳に、{b}の名前で多額の借金の記録があった',m),fake:true,b:b,cun:sk(c,'hide')+0.3});
return say(S,'cx_acc',{actors:[c,b],tag:'帳簿の差し替え',text:t+F('差し替えた頁には、{b}の名前が書き込まれていた。',m),why:'経理の犯人が、'+b.name+'に罪を着せる偽の帳簿を作った（'+c.name+'が犯人）'});
};
E('architect','arc_plan',function(S,a){return hasKill(S);},function(S,a){
var m=fmtM(S,a),t=F('{a}は、館の廊下を歩幅で測りながら歩いた。「この廊下、外から見た長さより、二メートル短い｜この廊下は、外から見た長さより二メートル短い｜この廊下、外から見た長さより、二メートル短いです」',m),pass=trickOf(S).pass;
if(S.rng()<0.25+sk(a,'obs')*0.4+(pass?0.25:0)){
var g=clue(S,a,pass?'search':'lore');if(!g)return false;
return say(S,'arc_plan',{actors:[a],tag:'間取り',text:t+'図面にない空間を調べて回るうちに、見落とされていたものが目に留まった。――'+g+'。',why:'建築家の目（観察 '+pct(sk(a,'obs'))+'）。館の主や執事でなくても、間取りの狂いには気づける'+(pass?'（隠し通路を使った手口だった）':'')});
}
return say(S,'arc_plan',{actors:[a],tag:'間取り',text:t+'測り直すと、ただの煙突の分だった。',why:'間取りの狂いは、事件とは関係がなかった'});
});
E('architect','arc_nail',function(S,a){return hasKill(S);},function(S,a){
var m=fmtM(S,a),t=F('{a}は、{p}の床にしゃがみ込み、床板の釘の頭を一本ずつ指でなぞった。',m);
if(S.rng()<0.3+sk(a,'search')*0.5){
var g=clue(S,a,'search');if(!g)return false;
return say(S,'arc_nail',{actors:[a],tag:'床板',text:t+'「ここだけ、釘が新しい。最近、誰かが床板を外して戻している｜ここだけ釘が新しい。最近、誰かが床板を外して戻している｜ここだけ、釘が新しいです。最近、誰かが床板を外して戻しています」――'+g+'。',why:'大工の指先（捜索 '+pct(sk(a,'search'))+'）。釘の頭の錆び方で、いつ打たれたかが分かる'});
}
return say(S,'arc_nail',{actors:[a],tag:'床板',text:t+'釘はどれも、館と同じだけ古かった。',why:'床板に手を加えた跡はなかった'});
});
E('architect','arc_wall',function(S,a){return hasKill(S);},function(S,a){
var m=fmtM(S,a),t=F('{a}は、{p}の壁を拳で軽く叩いて回った。ある一か所で、音が変わった。{a}は、その壁に耳を当てた。',m),pass=trickOf(S).pass;
if(S.rng()<0.2+sk(a,'obs')*0.35+(pass?0.3:0)){
var g=clue(S,a,'lore');if(!g)return false;
return say(S,'arc_wall',{actors:[a],tag:'二重壁',kind:pass?'climax':'event',text:t+'「二重壁だ。間に、人が一人立てるくらいの隙間がある｜二重壁だ。間に人が一人立てるほどの隙間がある｜二重壁です。間に、人が一人立てるくらいの隙間があります」――'+g+'。',why:'建築家の知識（観察 '+pct(sk(a,'obs'))+'）'+(pass?'。隠し通路の手口を見抜いた':''),mag:pass?28:22});
}
return say(S,'arc_wall',{actors:[a],tag:'二重壁',text:t+'壁の中にあったのは、古い配管だけだった。',why:'壁の中は空振りだった'});
});
J.CUL.architect=function(S,c){
var m=fmtM(S,c),t=F('その夜、{a}は、ほかの誰も知らない壁の隙間を通って、自分の部屋へ戻った。廊下の誰の目にも、{a}の姿は映らなかった。',m);
var w=S.P.filter(function(q){return free(q)&&q!==c&& !q.isAcc&&(q.role==='architect'||q.role==='host'||q.role==='butler');})[0];
if(w&&S.rng()<0.3+sk(w,'obs')*0.3-J.lie(S,c)){sus(c,12);m.b=w.name;return say(S,'cx_arc',{actors:[c,w],tag:'隠し通路',text:t+F('――ただ、{b}は、壁の継ぎ目の埃が一筋だけ乱れているのに気づいた。',m),why:c.name+'は建築家の知識で隠し通路を使った。館を知る'+w.name+'が気づいた（'+c.name+'が犯人・疑い +12）'});}
sus(c,-10);
return say(S,'cx_arc',{actors:[c],tag:'隠し通路',text:t,why:'建築家の犯人は、隠し通路を見つけて使える。アリバイが固くなった（'+c.name+'が犯人・疑い -10）'});
};
E('mechanic','mec_power',function(S,a){return hasKill(S);},function(S,a){
var m=fmtM(S,a),t=F('{a}は、地下の発電機の前にしゃがみ込み、燃料計と配線を確かめた。',m),mech=trickOf(S).mech;
if(S.rng()<0.25+sk(a,'lore')*0.45+(mech?0.2:0)){
var g=clue(S,a,mech?'lore':'obs');if(!g)return false;
return say(S,'mec_power',{actors:[a],tag:'発電機',text:t+'「昨夜の停電は、故障じゃない。誰かがブレーカーを落としている｜昨夜の停電は故障ではない。誰かがブレーカーを落としている｜昨夜の停電は、故障ではありません。誰かがブレーカーを落としています」――'+g+'。',why:'整備士の知識（'+pct(sk(a,'lore'))+'）'+(mech?'。仕掛けを使った手口だった':'')});
}
return say(S,'mec_power',{actors:[a],tag:'発電機',text:t+'配線は、ただ古いだけだった。',why:'発電機に細工の跡はなかった'});
});
E('mechanic','mec_clock',function(S,a){return hasKill(S);},function(S,a){
var m=fmtM(S,a),t=F('{a}は、広間の柱時計の裏蓋を開け、歯車の噛み合わせを一つずつ確かめた。',m);
var fk=fakeLeft(S,function(c){return c.type==='med'|| /時刻|時ごろ|時間/.test(c.t);});
if(fk&&S.rng()<0.3+sk(a,'lore')*0.4-J.fake(S)){
var g0=expose(S,a,fk);
return say(S,'mec_clock',{actors:[a],tag:'時計の細工',kind:'climax',text:t+'「針が、外から動かされた跡がある。この時計の時刻は、当てにならない｜針が外から動かされた跡がある。この時計の時刻は当てにならない｜針が、外から動かされた跡があります。この時計の時刻は、当てになりません」――'+g0+'。',why:'整備士が時計の細工を見抜き、時刻の偽装が崩れた（犯人への疑い +15）',mag:30});
}
if(S.rng()<0.2+sk(a,'lore')*0.4){
var g=clue(S,a,'lore');if(!g)return false;
return say(S,'mec_clock',{actors:[a],tag:'時計の細工',text:t+'歯車の一つに、真新しい傷がついていた。――'+g+'。',why:'整備士の知識（'+pct(sk(a,'lore'))+'）'});
}
return say(S,'mec_clock',{actors:[a],tag:'時計の細工',text:t+'歯車は、正しく時を刻んでいた。',why:'時計に細工はなかった'});
});
E('mechanic','mec_lock',function(S,a){return hasKill(S);},function(S,a){
var m=fmtM(S,a),t=F('{a}は、{p}の鍵穴に細い針金を差し込み、中の具合を確かめた。',m);
if(S.rng()<0.25+sk(a,'search')*0.5+(trickOf(S).mech?0.15:0)){
var g=clue(S,a,'search');if(!g)return false;
return say(S,'mec_lock',{actors:[a],tag:'鍵穴',text:t+'「この鍵、最近、合鍵で開けられている。中に新しい削りくずがある｜この鍵は最近、合鍵で開けられている。中に新しい削りくずがある｜この鍵、最近、合鍵で開けられています。中に新しい削りくずがあります」――'+g+'。',why:'整備士の手（捜索 '+pct(sk(a,'search'))+'）'});
}
return say(S,'mec_lock',{actors:[a],tag:'鍵穴',text:t+'鍵は、元の鍵でしか開けられた形跡がなかった。',why:'鍵に細工はなかった'});
});
J.CUL.mechanic=function(S,c){
var m=fmtM(S,c),t=F('夕食の途中で、館じゅうの灯りが一斉に消えた。闇の中で、誰かが廊下を走る足音がした。灯りが戻ったとき、{a}は、何食わぬ顔で燭台を手にしていた。',m);
var w=S.P.filter(function(q){return free(q)&&q!==c&& !q.isAcc&&(q.role==='mechanic'||q.role==='prof'||q.role==='streamer');})[0];
var lost=loseOne(S,'search');
if(w&&S.rng()<0.25+sk(w,'lore')*0.35-J.lie(S,c)){sus(c,12);m.b=w.name;return say(S,'cx_mec',{actors:[c,w],tag:'停電',kind:'climax',text:t+F('{b}は、ブレーカーの把手に残った油の指の跡に気づいた。',m),why:'整備士の犯人が停電を仕組んだ'+(lost?'（その隙に、手がかりが一つ失われた）':'')+'。'+w.name+'が細工の跡に気づいた（'+c.name+'が犯人・疑い +12）',mag:28});}
if(!lost)return false;
return say(S,'cx_mec',{actors:[c],tag:'停電',kind:'climax',text:t+'――暗闇のあいだに、現場から何かが消えていた。',why:'整備士の犯人が停電を仕組み、その隙に手がかりを一つ始末した（'+c.name+'が犯人）',mag:26});
};
E('nurse','nur_drug',function(S,a){return hasKill(S);},function(S,a){
var m=fmtM(S,a),t=F('{a}は、館の薬箱の中身を、備えつけの記録と一つずつ照らし合わせた。',m),po=trickOf(S).poison;
if(S.rng()<0.25+sk(a,'med')*0.45+(po?0.2:0)){
var g=clue(S,a,'med');if(!g)return false;
return say(S,'nur_drug',{actors:[a],tag:'薬箱',text:t+'「この薬、記録より減っている。一晩に使う量じゃない｜この薬は記録より減っている。一晩に使う量ではない｜この薬、記録より減っています。一晩に使う量ではありません」――'+g+'。',why:'看護師は薬の種類と量が分かる（検視 '+pct(sk(a,'med'))+'）'+(po?'。毒の手口だった':'')});
}
return say(S,'nur_drug',{actors:[a],tag:'薬箱',text:t+'薬の数は、記録どおりだった。',why:'薬箱に不審な点はなかった'});
});
E('nurse','nur_care',function(S,a){return S.P.some(function(q){return free(q)&&q!==a&&q.m.fear>35&& !noHelp(S,a,q);});},function(S,a){
var rng=S.rng,b=S.P.filter(function(q){return free(q)&&q!==a&&q.m.fear>35&& !noHelp(S,a,q);}).sort(function(x,y){return y.m.fear-x.m.fear;})[0];
if(!b)return false;
var m=fmtM(S,a,b),t=F('{a}は、震えている{b}の脈をとり、温めたタオルを肩にかけた。「大丈夫。ゆっくり息をして｜大丈夫だ。ゆっくり息をしろ｜大丈夫です。ゆっくり息をしてください」',m);
fear(b,-15);if(Y.setRel)Y.setRel(S,a,b,0.15,'信頼',a);
if(b===S.cul&& !S.mot.nobody){
if(rng()<0.45+sk(a,'obs')*0.2-J.lie(S,b)){sus(b,12);return say(S,'nur_care',{actors:[a,b],tag:'手当て',text:t+F('手当てをしながら、{a}は、{b}の指先に新しい引っかき傷があるのに気づいた。{b}は、さりげなく手を引っ込めた。',m),why:'看護師の手当て。'+b.name+'の震えは、怯えではなかった（'+lieWhy(S,b)+'）……'+b.name+'が犯人だ（疑い +12）'});}
return say(S,'nur_care',{actors:[a,b],tag:'手当て',text:t+F('{b}は、弱々しく礼を言った。',m),why:'看護師の手当て（'+b.name+'の恐怖 -15）。……'+b.name+'が犯人だ。怯えた顔は、演技だった（'+lieWhy(S,b)+'）'});
}
var g=rng()<0.4+sk(a,'talk')*0.4?clue(S,a,'talk'):'';
return say(S,'nur_care',{actors:[a,b],tag:'手当て',text:t+(g?F('{b}は、少し落ち着くと、昨夜見たことを話し始めた。',m)+'――'+g+'。':F('{b}の呼吸が、少しずつ落ち着いていった。',m)),why:'看護師の手当てで、'+b.name+'が心を開いた（恐怖 -15・信頼）'+(g?'':'。話を聞くのは、まだ早かった')});
});
E('nurse','nur_round',function(S,a){return hasKill(S)&&culOk(S)&&S.cul!==a;},function(S,a){
var c=S.cul,m=fmtM(S,a,c),t=F('{a}は、皆の手当てを申し出て、一人ずつ擦り傷や痣を診て回った。',m);
if(S.rng()<0.2+sk(a,'med')*0.35-J.lie(S,c)){
var g=clue(S,a,'obs');sus(c,8);
return say(S,'nur_round',{actors:[a,c],tag:'回診',text:t+F('{c}の手の甲の痣だけは、転んでできる形ではなかった。',m)+(g?'――'+g+'。':''),why:'看護師の回診（検視 '+pct(sk(a,'med'))+'）が、'+c.name+'の傷を見つけた（'+c.name+'が犯人・疑い +8）'});
}
S.P.forEach(function(q){if(free(q))fear(q,-4);});
return say(S,'nur_round',{actors:[a],tag:'回診',text:t+'大きな怪我をしている者は、いなかった。手当てを受けた者たちの顔に、少しだけ血の気が戻った。',why:'回診で傷は見つからなかった（'+c.name+'の隠し方が上回った）。全員の恐怖 -4'});
});
J.CUL.nurse=function(S,c){
var m=fmtM(S,c),t=F('{a}は、薬箱の記録の一行を、手慣れた字で書き換えた。誰が見ても、看護師のいつもの記録にしか見えなかった。',m);
if(!loseOne(S,'med'))return false;
return say(S,'cx_nur',{actors:[c],tag:'記録の書き換え',text:t,why:'看護師の犯人は、薬の記録を書き換えられる。手がかりが一つ失われた（'+c.name+'が犯人）'});
};
E('chef','chef_time',function(S,a){return hasKill(S);},function(S,a){
var m=fmtM(S,a),t=F('{a}は、昨夜の夕食に出した皿の数と、下げた皿の数とを、指を折って数え直した。「一皿だけ、手をつけずに戻ってきた。誰が残したのかも覚えてる｜一皿だけ、手をつけずに戻ってきた。誰が残したのかも覚えている｜一皿だけ、手をつけずに戻ってきました。誰が残したのかも覚えています」',m),po=trickOf(S).poison;
if(S.rng()<0.25+sk(a,'obs')*0.4+(po?0.25:0)){
var g=clue(S,a,po?'med':'obs');if(!g)return false;
return say(S,'chef_time',{actors:[a],tag:'夕食の皿',text:t+'皿の順番をたどると、食事の時間がはっきりした。――'+g+'。',why:'料理人は、誰がいつ何を口にしたかを覚えている（観察 '+pct(sk(a,'obs'))+'）'+(po?'。毒の入った時間が絞れた':'')});
}
return say(S,'chef_time',{actors:[a],tag:'夕食の皿',text:t+'だが、残したのは、ただ食欲のなかった客だった。',why:'食事の記憶は、決め手にならなかった'});
});
E('chef','chef_drink',function(S,a){return S.P.some(function(q){return free(q)&&q!==a&& !q.isAcc&& !noHelp(S,a,q);});},function(S,a){
var rng=S.rng,list=S.P.filter(function(q){return free(q)&&q!==a&& !q.isAcc&& !noHelp(S,a,q);}),b=rng.pick(list),m=fmtM(S,a,b);
var t=F('{a}は、館の酒蔵から一本抜いてきて、{b}のグラスに注いだ。「今夜くらいは、少し飲んだほうがいいよ｜今夜くらいは少し飲んだほうがいい｜今夜くらいは、少し飲んだほうがいいです」',m);
if(b===S.cul&& !S.mot.nobody){
if(rng()<0.3+sk(a,'talk')*0.3-J.lie(S,b)-b.tr.caution*0.15){sus(b,15);var g0=clue(S,a,'talk');return say(S,'chef_drink',{actors:[a,b],tag:'酒',kind:'climax',text:t+F('酔いが回った{b}は、まだ誰にも話されていないはずの現場の様子を、ひとことだけ口にした。{a}は、グラスを拭く手を止めなかった。',m)+(g0?'――'+g0+'。':''),why:'バーテンダーの酒で、'+b.name+'の口が滑った（'+lieWhy(S,b)+'・慎重さ '+pct(b.tr.caution)+'）……'+b.name+'が犯人だ（疑い +15）',mag:28});}
return say(S,'chef_drink',{actors:[a,b],tag:'酒',text:t+F('{b}は、グラスに口をつけるふりをして、一滴も飲まなかった。',m),why:b.name+'は酔わなかった（慎重さ '+pct(b.tr.caution)+'）。……'+b.name+'が犯人だ'});
}
if(rng()<0.35+sk(a,'talk')*0.4){
var g=clue(S,a,'talk');if(!g)return false;
return say(S,'chef_drink',{actors:[a,b],tag:'酒',text:t+F('二杯目のあたりから、{b}の口は軽くなった。',m)+'――'+g+'。',why:'酔わせて聞き出した（聞き込み '+pct(sk(a,'talk'))+'）'});
}
var o=innocent(S,a,function(q){return q!==b;}),x=o.length?rng.pick(o):null;
if(x){m.x=x.name;sus(x,6);}
return say(S,'chef_drink',{actors:x?[a,b,x]:[a,b],tag:'酒',text:t+F('{b}は酔って、昨夜の話を三通りに話した。どれが本当なのか、本人にも分からないようだった。',m)+(x?F('その話の中に、なぜか{x}の名前が何度も出てきた。',m):''),why:'酔いすぎて、話があてにならなかった'+(x?'（偽の手がかり：'+x.name+'への疑い +6）':'')});
});
E('chef','chef_pantry',function(S,a){return hasKill(S);},function(S,a){
var m=fmtM(S,a),t=F('{a}は、厨房の在庫を確かめていて、手を止めた。',m);
if(S.rng()<0.3+sk(a,'obs')*0.45){
var g=clue(S,a,'search');if(!g)return false;
return say(S,'chef_pantry',{actors:[a],tag:'厨房',text:t+'「包丁が一本、足りない。それに、塩の袋が開いている｜包丁が一本足りない。それに、塩の袋が開いている｜包丁が一本、足りません。それに、塩の袋が開いています」――'+g+'。',why:'料理人は厨房のどこに何があるかを覚えている（観察 '+pct(sk(a,'obs'))+'）'});
}
return say(S,'chef_pantry',{actors:[a],tag:'厨房',text:t+'足りないのは、誰かがつまみ食いしたチーズだけだった。',why:'厨房に不審な点はなかった'});
});
J.CUL.chef=function(S,c){
var m=fmtM(S,c),t=F('{a}は、夕食の皿を下げるついでに、{p}から持ち出したものを、生ごみの桶の底に沈めた。',m);
if(!loseOne(S,'search'))return false;
return say(S,'cx_chef',{actors:[c],tag:'厨房',text:t+'翌朝、桶の中身は、雪の下の穴に捨てられた。',why:'料理人の犯人は、厨房を自由に使える。手がかりが一つ失われた（'+c.name+'が犯人）'});
};
E('stylist','sty_hair',function(S,a){var k=lastKill(S);return!!k&&k.v.i!=null;},function(S,a){
var m=fmtM(S,a),t=F('{a}は、{v}の亡骸の指先を、じっと見つめた。',m);
if(S.rng()<0.25+sk(a,'obs')*0.5){
var g=clue(S,a,'obs');if(!g)return false;sus(S.cul,6);
return say(S,'sty_hair',{actors:[a],tag:'爪の髪',text:t+'「爪の間に、別の人の髪が挟まっている。色も、癖も違う｜爪の間に、別の人間の髪が挟まっている。色も癖も違う｜爪の間に、別の方の髪が挟まっています。色も、癖も違います」――'+g+'。',why:'美容師は、髪一本で人を見分ける（観察 '+pct(sk(a,'obs'))+'・犯人への疑い +18）'});
}
return say(S,'sty_hair',{actors:[a],tag:'爪の髪',text:t+F('爪に残っていたのは、{v}自身の髪だった。',m),why:'髪は手がかりにならなかった'});
});
E('stylist','sty_habit',function(S,a){return hasKill(S)&&innocent(S,a).length>0;},function(S,a){
var rng=S.rng,m=fmtM(S,a),t=F('{a}は、皆の髪の分け目と、袖口のすり切れ方とを、さりげなく見て回った。「利き手は、髪の結び方に出るんだよ｜利き手は、髪の結び方に出る｜利き手は、髪の結び方に出ます」',m);
if(rng()<0.25+sk(a,'obs')*0.45){
var g=clue(S,a,'obs');if(!g)return false;
return say(S,'sty_habit',{actors:[a],tag:'癖',text:t+'――'+g+'。',why:'美容師の目（観察 '+pct(sk(a,'obs'))+'）。体の癖から人を絞り込んだ'});
}
var b=rng.pick(innocent(S,a));m.b=b.name;misread(S,b);
return say(S,'sty_habit',{actors:[a,b],tag:'癖',text:t+F('{a}の目は、左利きの{b}に止まった。',m),why:'偽の手がかり：'+b.name+'が左利きなのは、事件とは関係がなかった（'+b.name+'への疑い +10）'});
});
J.CUL.stylist=function(S,c){
var rng=S.rng,inn=innocent(S,c,function(q){return!q.isDet;});if(!inn.length)return false;
var b=rng.pick(inn),m=fmtM(S,c,b);
S.fakeB=S.fakeB&&alive(S.fakeB)?S.fakeB:b;
S.pool.push({type:'obs',t:F('{p}の絨毯に、{b}の髪が一本落ちていた',m),fake:true,b:b,cun:sk(c,'hide')+c.tr.a*0.3+0.2});
return say(S,'cx_sty',{actors:[c,b],tag:'偽の髪',text:F('{a}は、洗面所のブラシに残った{b}の髪を一本つまみ上げ、{p}の絨毯にそっと落とした。',m),why:'美容師の犯人は、髪で罪を着せられる。'+b.name+'を指す偽の証拠（'+c.name+'が犯人）'});
};
E('actor','act_bait',function(S,a){return hasKill(S)&&culOk(S)&&S.cul!==a;},function(S,a){
var c=S.cul,m=fmtM(S,a,c),t=F('{a}は、夕食の席で、わざと青ざめた顔をして言った。「さっき、廊下で{v}を見た。……まだ、この館のどこかにいる｜さっき廊下で{v}を見た。……まだ、この館のどこかにいる｜さっき、廊下で{v}を見ました。……まだ、この館のどこかにいます」',m);
if(S.rng()<0.3+sk(a,'talk')*0.35-J.lie(S,c)*1.5){
sus(c,15);var g=clue(S,a,'obs');
return say(S,'act_bait',{actors:[a,c],tag:'芝居',kind:'climax',text:t+F('一同がざわめく中、{c}だけが、一瞬、窓の方を振り返った。{a}は、それを見逃さなかった。',m)+(g?'――'+g+'。':''),why:'俳優の芝居（聞き込み '+pct(sk(a,'talk'))+'）に、'+c.name+'が反応した（'+lieWhy(S,c)+'）……'+c.name+'が犯人だ（疑い +15）',mag:28});
}
S.P.forEach(function(q){if(free(q))fear(q,5);});
return say(S,'act_bait',{actors:[a],tag:'芝居',text:t+'一同は、ただ怯えただけだった。顔色を変えた者は、一人もいなかった。',why:'芝居は空振りだった。犯人のほうが上手だった（'+lieWhy(S,c)+'）。全員の恐怖 +5'});
});
E('actor','act_role',function(S,a){return hasKill(S);},function(S,a){
var m=fmtM(S,a),t=F('{a}は、{p}で、昨夜の犯人の動きを一つずつ演じてみせた。扉を開け、足音を殺し、振り返る。',m);
if(S.rng()<0.25+(sk(a,'talk')+sk(a,'obs'))*0.25){
var g=clue(S,a,'obs');if(!g)return false;sus(a,6);
return say(S,'act_role',{actors:[a],tag:'再現',text:t+F('{a}は、窓の前で足を止めた。「扉から窓までは、七歩。この時間じゃ、どうしても足りない｜扉から窓までは七歩。この時間では、どうしても足りない｜扉から窓までは、七歩です。この時間では、どうしても足りません」――',m)+g+'。'+F('演技があまりに真に迫っていたので、何人かは{a}から目を逸らした。',m),why:'俳優が犯人を演じて、筋書きの矛盾を引き出した（'+a.name+'自身への疑いも +6）'});
}
return say(S,'act_role',{actors:[a],tag:'再現',text:t+F('途中で{a}は、台本の書き損じに気づいた役者のように首を振った。',m),why:'再現は、どこにも矛盾を見つけられなかった'});
});
J.CUL.actor=function(S,c){
var sharp=S.P.filter(function(q){return free(q)&&q!==c&& !q.isAcc;}).sort(function(x,y){return sk(y,'obs')-sk(x,'obs');})[0],m=fmtM(S,c,sharp);
var t=F('{a}は、{v}の名前を呼んで泣き崩れた。本物の涙だった。――少なくとも、誰の目にもそう見えた。',m);
if(sharp&&S.rng()<sk(sharp,'obs')*0.35-J.lie(S,c)){sus(c,10);return say(S,'cx_act',{actors:[c,sharp],tag:'涙',text:t+F('{b}だけは、涙が落ちる直前に、{a}が壁の時計を盗み見たのに気づいていた。',m),why:c.name+'の演技（'+lieWhy(S,c)+'）を、'+sharp.name+'の観察（'+pct(sk(sharp,'obs'))+'）が見抜いた（'+c.name+'が犯人・疑い +10）'});}
sus(c,-12);
return say(S,'cx_act',{actors:[c],tag:'涙',text:t,why:'俳優の犯人は、嘘がうまい（'+lieWhy(S,c)+'）。疑いがそれた（'+c.name+'が犯人・疑い -12）'});
};
E('sales','sal_ice',function(S,a){return hasKill(S)&&S.P.filter(free).length>=3;},function(S,a){
var m=fmtM(S,a),t=F('{a}は、重苦しい食堂で、名刺を一枚ずつ配って回った。「こういうときこそ、自己紹介からやり直そう｜＝｜こういうときこそ、自己紹介からやり直しましょう」凍りついていた空気が、少しずつほどけた。',m);
S.P.forEach(function(q){if(free(q))fear(q,-5);});
var g=S.rng()<0.25+sk(a,'talk')*0.4?clue(S,a,'talk'):'';
return say(S,'sal_ice',{actors:[a],tag:'場を和ませる',text:t+(g?'雑談の中で、誰かが、昨夜のことをぽろりとこぼした。――'+g+'。':''),why:'営業の話術で、口が軽くなった（全員の恐怖 -5'+(g?'・聞き込み '+pct(sk(a,'talk')):'')+'）'});
});
E('sales','sal_persist',function(S,a){return S.P.some(function(q){return free(q)&&q!==a&& !q.isDet&& !q.isAcc&& !noHelp(S,a,q);});},function(S,a){
var rng=S.rng,list=S.P.filter(function(q){return free(q)&&q!==a&& !q.isDet&& !q.isAcc&& !noHelp(S,a,q);}),b=rng.pick(list),m=fmtM(S,a,b),isC=b===S.cul&& !S.mot.nobody;
var t=F('{a}は、三度断られても、{b}の部屋の前から動かなかった。「五分でいい。五分だけ、話を聞かせて｜五分でいい。五分だけ話を聞かせてくれ｜五分で構いません。五分だけ、お話を聞かせてください」',m);
if(rng()<0.3+sk(a,'talk')*0.45-(isC?J.lie(S,b):0)){
if(isC){sus(b,10);return say(S,'sal_persist',{actors:[a,b],tag:'粘り',text:t+F('根負けした{b}は扉を開けた。だが、話せば話すほど、{b}の言葉は滑らかすぎた。',m),why:'営業の粘り（聞き込み '+pct(sk(a,'talk'))+'）。'+b.name+'の受け答えは、用意してきたもののようだった（'+lieWhy(S,b)+'）……'+b.name+'が犯人だ（疑い +10）'});}
var g=clue(S,a,'talk');if(!g)return false;
if(Y.setRel)Y.setRel(S,a,b,0.05,'打ち解けた');
return say(S,'sal_persist',{actors:[a,b],tag:'粘り',text:t+F('根負けした{b}が、とうとう扉を開けた。',m)+'――'+g+'。',why:'営業は、断られても粘る（聞き込み '+pct(sk(a,'talk'))+'）'});
}
if(Y.setRel)Y.setRel(S,a,b,-0.05,'険悪');
return say(S,'sal_persist',{actors:[a,b],tag:'粘り',text:t+F('{b}は、とうとう扉を開けなかった。',m),why:'粘りは通じなかった（'+b.name+'との仲が少しこじれた）'});
});
E('sales','sal_card',function(S,a){return S.P.some(function(q){return free(q)&&q!==a&&(q.role==='host'||q.role==='butler'||q.role==='heir')&& !guilty(S,q);});},function(S,a){
var b=S.P.filter(function(q){return free(q)&&q!==a&&(q.role==='host'||q.role==='butler'||q.role==='heir')&& !guilty(S,q);})[0],m=fmtM(S,a,b);
var t=F('{a}は、{b}に名刺を差し出した。「この館の昔の話、少しだけ聞かせてもらえないかな｜この館の昔の話を、少し聞かせてもらえないか｜この館の昔の話を、少しだけ伺えませんか」',m);
if(S.rng()<0.3+sk(a,'talk')*0.45){
var g=clue(S,a,'lore');if(!g)return false;
return say(S,'sal_card',{actors:[a,b],tag:'名刺',text:t+F('{b}は名刺を眺めて少し笑い、館の古い話をいくつか聞かせた。',m)+'――'+g+'。',why:'営業は、名刺一枚で館の人の懐に入る（聞き込み '+pct(sk(a,'talk'))+'）'});
}
return say(S,'sal_card',{actors:[a,b],tag:'名刺',text:t+F('{b}は名刺を受け取ったが、それきり何も話さなかった。',m),why:'館の人の口は堅かった'});
});
J.CUL.sales=function(S,c){
var rng=S.rng,inn=innocent(S,c,function(q){return!q.isDet;});if(!inn.length)return false;
var b=HK.weighted(rng,inn,function(q){return 1+q.m.sus/25;}),m=fmtM(S,c,b);
sus(b,12);S.framed=b;S.fake=(S.fake||0)+1;
return say(S,'cx_sal',{actors:[c,b],tag:'話術',text:F('{a}は、人当たりのいい笑顔で、皆の話に相づちを打って回った。いつの間にか、話題は{b}の昨夜の行動のことになっていた。',m),why:'営業の犯人は、話術で疑いを人に向けられる（'+b.name+'への疑い +12。'+c.name+'が犯人）'});
};
E('reporter','rep_dig',function(S,a){return hasKill(S)&& !a.approached;},function(S,a){
var m=fmtM(S,a),t=F('{a}は、手帳を片手に、一人ずつ「取材」して回った。「記事にはしない。今はね｜記事にはしない。今はな｜記事にはしません。今は、ですが」',m);
if(S.rng()<0.3+sk(a,'talk')*0.45){
var g=clue(S,a,'talk');if(!g)return false;a.approached=true;
return say(S,'rep_dig',{actors:[a],tag:'取材',text:t+'――'+g+'。'+F('{a}は、手帳を閉じて満足げに笑った。その姿を、誰かが廊下の陰から見ていた。',m),why:'記者は人の秘密を嗅ぎ回る（聞き込み '+pct(sk(a,'talk'))+'）。犯人に目をつけられた'});
}
return say(S,'rep_dig',{actors:[a],tag:'取材',text:t+'誰も、記者に話したがらなかった。',why:'取材は空振りだった'});
});
E('butler','but_keys',function(S,a){return hasKill(S);},function(S,a){
var m=fmtM(S,a),t=F('{a}は、鍵束の鍵を一本ずつ数えた。「一本、足りない。……昨夜まで、確かにあった｜一本足りない。……昨夜までは、確かにあった｜一本、足りません。……昨夜までは、確かにありました」',m);
if(S.rng()<0.3+sk(a,'search')*0.45){
var g=clue(S,a,'search');if(!g)return false;
return say(S,'but_keys',{actors:[a],tag:'鍵束',text:t+'――'+g+'。',why:'執事は、館の鍵を一本残らず把握している（捜索 '+pct(sk(a,'search'))+'）'});
}
return say(S,'but_keys',{actors:[a],tag:'鍵束',text:t+'足りない一本は、夕方には洗濯室の籠の中から見つかった。',why:'鍵は、ただの置き忘れだった'});
});
function jst(S){return S.jobs||(S.jobs={n:0,used:{},cul:false});}
J.tick=function(S,day,k){
var j=jst(S),rng=S.rng;
if(S.over||j.n>=J.MAX)return;
var c=S.cul;
if(!j.cul&&culOk(S)&&J.CUL[c.role]&&S.kills.length&&rng()<0.3){
j.cul=true;
if(J.CUL[c.role](S,c)){j.n++;return;}
}
if(rng()>J.RATE)return;
var opts=[];
S.P.forEach(function(p){
if(!free(p)||guilty(S,p))return;
(J.SOLO[p.role]||[]).forEach(function(e){if(!j.used[e.id]&&e.can(S,p))opts.push({w:e.w,id:e.id,go:function(){return e.run(S,p);}});});
});
if(J.pairOpts)J.pairOpts(S,j).forEach(function(o){opts.push(o);});
if(!opts.length)return;
var o=HK.weighted(rng,opts,function(x){return x.w;});
j.used[o.id]=1;
if(o.go())j.n++;
};
})();
});
;
/* ==== js/yakata-jobs-pair.js ==== */
HK.Load.def(215,'js/yakata-jobs-pair.js',function(){
(function(){
'use strict';
var HK=window.HK,Y=HK&&HK.YAKATA,J=Y&&Y.JOBS;
if(!J)return;
function L(s){return s.split('|');}
var ST=function(){return HK.Story;};
function F(t,m){return ST().fmt(t,m);}
function pk(S,a){return ST().pick(S,a);}
function clamp(x,a,b){return x<a?a:x>b?b:x;}
function sk(p,k){return Y.skill?Y.skill(p,k):0.4;}
function pct(x){return Math.round(x*100);}
function sus(p,d){if(p&&p.m)p.m.sus=clamp(p.m.sus+d,0,100);}
function fear(p,d){if(p&&p.m)p.m.fear=clamp(p.m.fear+d,0,100);}
function rel(S,a,b,d,lab,dir){if(Y.setRel)Y.setRel(S,a,b,d,lab,dir);}
function P(o){o.A=o.A.split(',');o.B=o.B.split(',');J.PAIR.push(o);}
P({id:'jp_lawrep',A:'lawyer',B:'reporter',thing:'遺言状の写しと取材メモ',place:'書斎',type:'talk',name:'弁護士×記者',
open:L('{y}が手帳を開くと、{x}は黙って遺言状の写しを机に置いた。弁護士の知る遺言の中身と、記者の集めた噂とが、同じ机に並んだ。|{x}と{y}は、食堂の隅で、互いの持っている情報を値踏みし合った。'),
close:L('{y}が身を乗り出した。「取引しよう。あなたの知ってる遺言の中身と、私のメモを交換する｜取引をしよう。あなたの知っている遺言の中身と、私のメモを交換する｜取引をしましょう。あなたの知っている遺言の中身と、私のメモを交換します」{x}は苦笑して、写しの一頁目をめくった。'),
rival:L('{y}が書類をのぞき込もうとすると、{x}はその手を払いのけた。「守秘義務がある。あなたに話すことは何もない｜＝｜守秘義務があります。あなたに話すことは、何もありません」'),
lead:L('{u}は、{d}に、遺言状と取材メモを突き合わせるよう言いつけた。「日付の合わないところだけ、拾って｜日付の合わないところだけ拾え｜日付の合わないところだけ、拾ってください」'),
cul:L('{c}は、二人で並べた書類の中の、ある一行を指でなぞった。「これは、ただの噂だよ。気にしなくていい｜これはただの噂だ。気にしなくていい｜これは、ただの噂です。気にしなくて構いません」')});
P({id:'jp_hospital',A:'doctor',B:'nurse',thing:'遺体',place:'現場',type:'med',name:'医師×看護師',
open:L('{x}が遺体の前に膝をつくと、{y}は何も言われないうちに、手袋と懐中電灯を差し出した。|{x}と{y}は、{p}で、遺体を挟んで向かい合った。'),
close:L('{x}が言いかけた言葉を、{y}が先に続けた。「瞳孔、それから爪の色｜瞳孔、それから爪の色だ｜瞳孔、それから爪の色ですね」二人は、目を合わせて頷いた。阿吽の呼吸だった。'),
rival:L('{x}の所見に、{y}が横から口を挟んだ。「その見立ては、違うと思う｜その見立ては違う｜その見立ては、違うと思います」'),
lead:L('{u}は、{d}に短く指示を出した。「体温を測って。それから、死斑の位置を記録して｜体温を測れ。それから、死斑の位置を記録しろ｜体温を測ってください。それから、死斑の位置を記録してください」'),
cul:L('{o}が遺体に手を伸ばす前に、{c}がその手首を押さえた。「そこは、もう私が診た。死因は見たとおりだよ｜そこはもう私が診た。死因は見たとおりだ｜そこは、もう私が診ました。死因は、見たとおりです」')});
P({id:'jp_court',A:'police',B:'lawyer',thing:'昨夜の証言',place:'広間',type:'talk',name:'警察官×弁護士',
open:L('{x}が一人ずつ話を聞き始めると、{y}が当然のような顔で、その隣の椅子に座った。|{x}の取り調べに、{y}は弁護人のように同席した。'),
close:L('{x}が問い、{y}が言葉の端を拾う。二人の取り調べは、打ち合わせ済みの芝居のようだった。{y}が言った。「今の答え、さっきと一語だけ違う｜今の答えは、さっきと一語だけ違う｜今の答え、さっきと一語だけ違います」'),
rival:L('{x}が声を荒げるたびに、{y}が割って入った。「今の質問は誘導だ。答えなくていい｜＝｜今の質問は誘導です。答えなくて結構です」取り調べは、攻防のまま長引いた。'),
lead:L('{u}は、{d}に取り調べの順番を言いつけた。「まず、いちばん落ち着いている人から｜まず、いちばん落ち着いている人間からだ｜まず、いちばん落ち着いている方からお願いします」'),
cul:L('{c}は、取り調べの途中で、何度も「それは、さっきも聞いた」と話を切り上げさせた。')});
P({id:'jp_school',A:'prof',B:'student',thing:'昨夜の仕掛け',place:'現場',type:'lore',name:'教授×学生',
open:L('{x}は、{y}に糸と重りを持ってこさせ、{p}で、昨夜の仕掛けを再現し始めた。|{x}と{y}は、ゼミの実験のように、仮説と検証を曇った窓ガラスに書き並べた。'),
close:L('{y}が手を挙げた。「さっきの式、温度を入れ忘れてる｜さっきの式は、温度を入れ忘れている｜さっきの式、温度を入れ忘れています」{x}は、嬉しそうに眼鏡を押し上げた。'),
rival:L('{y}が先に答えを口にすると、{x}は露骨に顔をしかめた。「結論を急ぐのは、素人のやることだ｜＝｜結論を急ぐのは、素人のやることです」'),
lead:L('{u}は、{d}に、実験の手順を一つずつ確かめさせた。「仮説は一つずつ潰す。それが、いちばん早い道だよ｜仮説は一つずつ潰す。それが、いちばん早い道だ｜仮説は一つずつ潰します。それが、いちばん早い道です」'),
cul:L('{c}は、再現の途中で、わざと重りを一つ取り違えた。「やっぱり、この仕掛けは無理だね｜やはり、この仕掛けは無理だ｜やっぱり、この仕掛けは無理ですね」')});
P({id:'jp_ledger',A:'accountant',B:'host,heir,butler',thing:'館の古い帳簿',place:'書斎',type:'lore',name:'経理×館の人',
open:L('{x}は、{y}に頼んで、館の古い帳簿を書斎の机に積ませた。|{y}が金庫の鍵を開けると、{x}は、中の帳簿を一冊ずつ机に並べた。'),
close:L('{y}が、帳簿の数字の一つを指さした。「この年に、館で何かあったはずだ｜＝｜この年に、館で何かあったはずです」{x}は頷き、その年の頁だけを抜き出した。'),
rival:L('{y}は、帳簿を{x}の手から引ったくった。「館の金のことに、口を出さないで｜館の金のことに口を出すな｜館のお金のことに、口を出さないでください」'),
lead:L('{u}は、{d}に、帳簿の数字を読み上げさせた。しばらくして、{u}が言った。「止めて。今の数字、もう一度｜止めろ。今の数字をもう一度だ｜止めてください。今の数字を、もう一度お願いします」'),
cul:L('{c}は、帳簿の一冊を「関係のない年のものだ」と言って、棚に戻した。')});
P({id:'jp_pay',A:'accountant',B:'manager',thing:'経費の明細',place:'食堂',type:'lore',name:'経理×マネージャー',
open:L('{y}が鞄から経費の明細の束を取り出すと、{x}の目の色が変わった。|{x}と{y}は、領収書の日付と、移動の記録とを突き合わせ始めた。'),
close:L('{x}が言った。「この領収書、日付が一日ずれてる｜この領収書は、日付が一日ずれている｜この領収書、日付が一日ずれています」{y}は、手帳の予定表を広げて、すぐに裏を取った。'),
rival:L('{y}は、明細を半分だけ渡して、残りを鞄にしまった。「担当の秘密まで、見せるつもりはない｜担当の秘密まで見せるつもりはない｜担当の秘密まで、お見せするつもりはありません」'),
lead:L('{u}は、{d}に、領収書を日付順に並べるよう言いつけた。「金の流れを見れば、人の動きが分かる｜＝｜お金の流れを見れば、人の動きが分かります」'),
cul:L('{c}は、明細の束から一枚だけ抜き取って、何食わぬ顔で残りを差し出した。')});
P({id:'jp_rite',A:'priest',B:'occult',thing:'見立て',place:'現場',type:'lore',name:'神職×オカルト研究家',
open:L('{x}は、{p}に残された見立ての前で手を合わせた。{y}は、その横で古い伝承の本を開いた。|{x}と{y}は、館の礼拝室で、弔いの作法と、この土地の伝承とを照らし合わせた。'),
close:L('{y}が本の一頁を指さした。「この並べ方、弔いの作法を逆さにしてる｜この並べ方は、弔いの作法を逆さにしている｜この並べ方、弔いの作法を逆さにしています」{x}は、静かに頷いた。'),
rival:L('{x}は、{y}の説を、作法を知らない者の当て推量だと切り捨てた。「死者を、面白半分に語らないで｜死者を面白半分に語るな｜死者を、面白半分に語らないでください」'),
lead:L('{u}は、{d}に、見立ての一つひとつを書き写させた。「ひとつも飛ばさないで。意味のないものは、ひとつもないから｜ひとつも飛ばすな。意味のないものは、ひとつもない｜ひとつも飛ばさないでください。意味のないものは、ひとつもありません」'),
cul:L('{c}は、見立ての意味を、もっともらしく、少しだけ違う方へ解いてみせた。')});
P({id:'jp_video',A:'mechanic',B:'streamer',thing:'配信の映像',place:'広間',type:'search',name:'整備士×配信者',
open:L('{y}のカメラは、昨夜の停電で記録が途切れていた。{x}は、工具を広げて、壊れかけたメモリーカードを取り出した。|{x}は、{y}のノートパソコンにケーブルをつなぎ、消えた映像の断片を拾い始めた。'),
close:L('{y}が画面を指さした。「止めて。今の、廊下の端｜止めろ。今の、廊下の端だ｜止めてください。今の、廊下の端です」{x}は、一コマずつ映像を戻した。'),
rival:L('{y}は、{x}の手からカメラを取り返した。「私の映像だ。勝手に触らないで｜私の映像だ。勝手に触るな｜私の映像です。勝手に触らないでください」'),
lead:L('{u}は、{d}に、復元した映像を一秒ずつ見張らせた。「瞬きしないで。映るのは一瞬だから｜瞬きするな。映るのは一瞬だ｜瞬きしないでください。映るのは一瞬です」'),
cul:L('{c}は、復元を手伝うふりをして、肝心の数秒を上書きした。')});
P({id:'jp_machine',A:'mechanic',B:'architect',thing:'館の古い仕掛け',place:'館の奥の廊下',type:'search',name:'整備士×建築家',
open:L('{y}が図面の上で壁の厚さを測り、{x}が、その壁の中の歯車の音に耳を澄ませた。|{x}と{y}は、館の古い仕掛け扉の前で、図面と機械の両方から頭をひねった。'),
close:L('{x}が言った。「この壁の中、ゼンマイが巻いてある｜この壁の中に、ゼンマイが巻いてある｜この壁の中、ゼンマイが巻いてあります」{y}はすぐに、図面の該当する線を指でたどった。'),
rival:L('{x}と{y}は、仕掛けの止め方をめぐって言い争い、扉の前から一歩も動かなかった。'),
lead:L('{u}は、{d}に、仕掛けの歯車を一つずつ外させた。「外した順に並べて。戻すときに要るから｜外した順に並べろ。戻すときに要る｜外した順に並べてください。戻すときに要ります」'),
cul:L('{c}は、仕掛けの扉を開けたとたん、「何もない」と言って、すぐに閉めた。')});
P({id:'jp_poison',A:'chef',B:'doctor,nurse',thing:'毒の正体',place:'厨房',type:'med',name:'料理人×医師（看護師）',
open:L('{x}は、昨夜の料理の味と匂いを一つずつ思い出し、{y}に伝えた。|{y}が遺体の所見を書き出すと、{x}は、その横に昨夜の献立を書き並べた。'),
close:L('{x}が言った。「あのスープ、苦みが一つ多かった｜あのスープは、苦みが一つ多かった｜あのスープ、苦みが一つ多かったです」{y}は、すぐに手元の所見を見直した。'),
rival:L('{y}は、{x}の話を最後まで聞かなかった。「料理の話は、あとにして｜料理の話はあとにしろ｜料理のお話は、あとにしてください」'),
lead:L('{u}は、{d}に、昨夜の献立を時間順に書き出させた。「何を、いつ、誰が口にしたか。それが全部だよ｜何を、いつ、誰が口にしたか。それがすべてだ｜何を、いつ、誰が口にしたか。それがすべてです」'),
cul:L('{c}は、毒の話になると、「あの皿は、誰でも触れた」とだけ言った。')});
P({id:'jp_show',A:'sales',B:'celeb,host',thing:'一行の証言',place:'食堂',type:'talk',name:'営業×大物',
open:L('{x}は、{y}に名刺を差し出した。「お噂は、かねがね伺っています｜噂は、かねがね聞いている｜お噂は、かねがね伺っています」|{y}のまわりには、いつの間にか人が集まっていた。{x}は、その輪の真ん中に、さりげなく入っていった。'),
close:L('{y}が人を集め、{x}が話を回した。食堂は、いつの間にか、昨夜の証言を聞き取る場になっていた。'),
rival:L('{y}は、{x}の名刺を受け取りもせずに、背を向けた。'),
lead:L('{u}は、{d}に、誰に何を聞くかを一人ずつ割り振った。「口の重い人は、私が引き受ける｜口の重い者は、私が引き受ける｜口の重い方は、私が引き受けます」'),
cul:L('{c}は、皆の話を、笑い話へと上手にすり替えていった。')});
P({id:'jp_play',A:'actor',B:'writer',thing:'再現劇の筋書き',place:'食堂',type:'talk',name:'俳優×作家',
open:L('{y}が、昨夜の出来事を一本の筋書きに書き起こし、{x}が、それを犯人の目線で演じてみせた。|{x}と{y}は、食堂で、即席の再現劇の稽古を始めた。'),
close:L('{y}が筋書きの一行を書き直した。「ここで、犯人は振り返る。……演じてみて｜ここで、犯人は振り返る。……演じてみろ｜ここで、犯人は振り返ります。……演じてみてください」{x}が振り返った瞬間、一同の中の誰かが、息をのんだ。'),
rival:L('{x}は、{y}の筋書きを読むなり突き返した。「こんな台詞、誰も言わない｜こんな台詞は誰も言わない｜こんな台詞、誰も言いません」'),
lead:L('{u}は、{d}に、犯人の役を任せた。「台詞は要らない。歩き方だけでいい｜＝｜台詞は要りません。歩き方だけで結構です」'),
cul:L('{c}は、再現劇の筋書きに、自分のいない場面を一つ紛れ込ませた。')});
P({id:'jp_hair',A:'stylist',B:'police',thing:'現場の髪の毛',place:'現場',type:'obs',name:'美容師×警察官',
open:L('{x}は、{p}の絨毯から拾った髪を、白い紙の上に一本ずつ並べた。{y}が、その横で警察手帳を開いた。|{y}が現場の遺留品を集めると、{x}が、その中の髪の毛だけを選り分けた。'),
close:L('{x}が言った。「この髪、染めてから三週間くらい経ってる｜この髪は、染めてから三週間ほど経っている｜この髪、染めてから三週間くらい経っています」{y}は、一行の顔を順に思い浮かべた。'),
rival:L('{y}は、{x}の見立てを鼻で笑った。「髪の毛一本で犯人が分かるなら、苦労はしない｜＝｜髪の毛一本で犯人が分かるなら、苦労はしません」'),
lead:L('{u}は、{d}に、一人ずつ髪を見せてもらうよう頼ませた。「嫌がる人がいたら、その人が怪しい｜嫌がる者がいたら、その人間が怪しい｜嫌がる方がいたら、その方が怪しいです」'),
cul:L('{c}は、並べられた髪の中から一本を、袖でそっと払い落とした。')});
P({id:'jp_plan',A:'architect',B:'butler,host',thing:'館の古い図面',place:'書庫',type:'search',name:'建築家×館の人',
open:L('{y}が書庫の奥から館の古い図面を出してくると、{x}は、それを廊下の床に広げた。|{x}は、{y}の案内で、館の端から端までを歩いた。'),
close:L('{x}が図面の一点を叩いた。「ここに、図面にない階段がある｜＝｜ここに、図面にない階段があります」{y}は、驚いた顔で頷いた。'),
rival:L('{y}は、{x}を書庫に入れようとしなかった。「館のことは、館の者がいちばん知っている｜＝｜館のことは、館の者がいちばん存じております」'),
lead:L('{u}は、{d}に、図面と実際の部屋の数を数えさせた。「一つでも合わなかったら、そこが入口だ｜＝｜一つでも合わなかったら、そこが入口です」'),
cul:L('{c}は、図面のある一角を、「そこは昔、物置だった」とだけ言って通り過ぎた。')});
var R={
first:L('{x}と{y}は、この館で初めてまともに言葉を交わした。{y}が名刺を差し出した。「こういう者だ。あなたの仕事も、役に立つかもしれない｜こういう者だ。あなたの仕事も役に立つかもしれない｜こういう者です。あなたのお仕事も、役に立つかもしれません」|{x}と{y}は、ぎこちなく名刺を交換した。互いの肩書きを見て、二人は同時に{thing}のことを思いついた。'),
love:L('{x}と{y}は、二人で{place}へ向かった。暗がりへ先に踏み込もうとした{d}の前に、{u}が黙って出た。「危ないところは、私が先に行く｜危ない所には、私が先に行く｜危ないところは、私が先に行きます」|{u}は、{d}の隣から離れないまま、片手で手帳をめくった。「離れないで。……二人でやれば早いから｜離れるな。……二人でやれば早い｜離れないでください。……二人でやれば早いです」'),
parent:L('{u}は、一人で{place}へ行こうとする{d}の肩を掴んだ。「一人で行かせるわけにはいかない｜＝｜一人で行かせるわけにはいきません」{d}は振り払おうとして、結局、{u}と並んで歩き出した。|{d}が「自分でやれる」と言い張るのを、{u}は聞き流した。「いいから、隣にいて｜いいから、隣にいろ｜いいから、隣にいてください」二人は、黙って{thing}を調べ始めた。'),
sib:L('{x}と{y}は、子どもの頃と同じように、言い合いながら、{thing}を手分けして調べた。{y}が言った。「そっちは任せた｜＝｜そちらはお任せします」'),
blind:L('{u}は、{d}の読み解きを、ひとことも疑わずに書き留めた。「あなたがそう言うなら、そうなんだ｜あなたがそう言うなら、そうなのだろう｜あなたがそうおっしゃるなら、そうなのでしょう」'),
fear:L('{u}は、{d}と二人きりになった途端、口がきけなくなった。書きつけを差し出す手が、小さく震えていた。|{u}は、{d}の顔を見ないようにして、調べかけの書きつけを机の端に置いた。それ以上、近づこうとはしなかった。'),
cold:L('{d}が話しかけても、{u}は顔を上げなかった。調べかけの書きつけは、{u}の手元に置かれたままだった。{d}は、仕方なく一人で調べ始めた。')
};
var FAIL=L('だが、二人がかりでも、決め手になるものは見つからなかった。|日が傾くまで粘ったが、新しいことは何も出てこなかった。');
var COVER={
love:L('――{o}は、調べるうちに、{c}を指すものが一つ混じっているのに気づいた。{o}は、{c}の横顔を見た。それから黙ってそれを抜き取り、暖炉の火にくべた。'),
family:L('――{o}は、調べるうちに、{c}の筆跡の走り書きを見つけた。子どもの頃から見てきた字だった。{o}は、それを黙って懐にしまった。'),
blind:L('――{o}は、{c}を指す一行を見つけて、すぐに目を逸らした。{c}が、そんなことをするはずがない。{o}は、その紙を裏返して、束の底に戻した。')
};
var EXPOSE=L('――{o}は、{c}が一度だけ話を逸らしたのを、聞き逃さなかった。|――{o}は、{c}の指先が、ほんのわずかに震えたのを見ていた。');
var STEER=L('{o}は、その言葉を疑わなかった。|{o}は頷き、調べる手を止めた。');
var LOVE= /^(lover|mate|fated|spouse|fiance|almost)$/,FAM= /^(sibling|sibprot|sibclose|parent|pparent|stepsib|relative)$/,ELDER= /^(parent|pparent|sibprot)$/,
LEAD= /^(boss|master|mentor|teacher|senpai)$/,BAD= /^(enemy|bad|rival|ex|sibbad)$/,BLIND= /^(blind|worship|yan|fond)$/,CLOSE= /^(best|buddy|childhood|friend|classmate|colleague|comrade|benefactor)$/;
var KN={first:'初対面',close:'親しい',love:'恋人・許嫁',family:'家族',lead:'上下の関係',rival:'敵対・張り合う',blind:'盲信・執着',fear:'恐怖',cold:'無関心'};
function relOf(S,x,y){
var ts=J.ties(S,x,y),PP=S.P;
function find(re){return ts.filter(function(t){return re.test(t.type);})[0];}
function dir(t){var u=PP[t.a]===x?x:y;return{u:u,d:u===x?y:x};}
var t;
if((t=find(/^fear$/)))return mk('fear',dir(t));
if((t=find(/^apathy$/)))return mk('cold',dir(t));
if((t=find(BLIND)))return mk('blind',dir(t));
if((t=find(LOVE)))return mk('love',guard(x,y));
if((t=find(FAM)))return ELDER.test(t.type)?mk('family',dir(t),'parent'):mk('family',guard(x,y),'sib');
if((t=find(LEAD)))return mk('lead',dir(t));
if((t=find(BAD)))return mk('rival',{u:x,d:y});
if(find(CLOSE))return mk('close',{u:x,d:y});
var w=Y.bond?Y.bond(S,x,y):0;
if(w<= -0.2)return mk('rival',{u:x,d:y});
if(w>=0.3)return mk('close',{u:x,d:y});
return mk('first',{u:x,d:y});
function mk(k,ud,sub){return{k:k,u:ud.u,d:ud.d,sub:sub||''};}
}
function guard(x,y){var g=function(p){return sk(p,'fight')+p.tr.np*0.3+((p.stats&&p.stats.nerve)||3)*0.03;};return g(x)>=g(y)?{u:x,d:y}:{u:y,d:x};}
J.relOf=relOf;
function run(S,pr,x,y){
var rng=S.rng,r=relOf(S,x,y),k=S.kills[S.kills.length-1];
var m={x:x.name,y:y.name,u:r.u.name,d:r.d.name,thing:pr.thing,place:pr.place,p:k?k.trick.place:'広間'};
var lab=(Y.relLabel&&Y.relLabel(S,x,y))||KN[r.k];
var head=(r.k==='first'?F(pk(S,R.first),m):'')+F(pk(S,pr.open),m);
var why0=pr.name+'（'+x.name+'×'+y.name+'）・関係：'+lab+'（'+KN[r.k]+'）';
var c=J.guilty(S,x)?x:J.guilty(S,y)?y:null;
if(c){
var o=c===x?y:x,ro=relOf(S,o,c),mc={c:c.name,o:o.name,thing:pr.thing,place:pr.place,p:m.p};
var t0=head+F(pk(S,pr.cul),mc),who=c===S.cul?c.name+'が犯人':c.name+'は共犯';
var cov=ro.k==='love'?'love':ro.k==='family'?'family':ro.k==='blind'&&ro.u===o?'blind':'';
if(cov&&rng()<0.45&&J.loseOne(S,pr.type)){
o.knew=true;
return J.say(S,pr.id,{actors:[o,c],tag:pr.name,kind:'climax',text:t0+F(pk(S,COVER[cov]),mc),why:why0+'。'+o.name+'は、'+c.name+'が犯人側だと気づいて、かばった（手がかりが一つ失われた。'+who+'）',mag:30});
}
var see=0.2+sk(o,'obs')*0.4-J.lie(S,c)+(ro.k==='rival'?0.15:ro.k==='blind'&&ro.u===o? -0.2:ro.k==='love'||ro.k==='family'? -0.1:0);
if(rng()<see){
sus(c,12);
return J.say(S,pr.id,{actors:[o,c],tag:pr.name,text:t0+F(pk(S,EXPOSE),mc),why:why0+'。'+c.name+'は捜査をそらそうとしたが、'+o.name+'が見抜いた（観察 '+pct(sk(o,'obs'))+' 対 '+J.lieWhy(S,c)+'。'+who+'・疑い +12）'});
}
var inn=J.innocent(S,c,function(q){return q!==o;}),mis=inn.length&&rng()<0.5?rng.pick(inn):null;
if(mis)J.misread(S,mis);
return J.say(S,pr.id,{actors:mis?[o,c,mis]:[o,c],tag:pr.name,text:t0+F(pk(S,STEER),mc),why:why0+'。'+c.name+'が、二人の捜査をそらした（'+J.lieWhy(S,c)+'。'+who+'）'+(mis?'。推理が'+mis.name+'の方へずれていく（偽の手がかり）':'')});
}
var base=0.25+(sk(x,pr.type)+sk(y,pr.type))*0.3,t=head,why=why0,finder=x,g='';
if(r.k==='fear'){
fear(r.u,6);
return J.say(S,pr.id,{actors:[r.u,r.d],tag:pr.name,text:t+F(pk(S,R.fear),m),why:why+'。'+r.u.name+'は'+r.d.name+'が怖くて、二人で調べることができなかった（'+r.u.name+'の恐怖 +6）'});
}
if(r.k==='cold'){t+=F(pk(S,R.cold),m);base*=0.7;finder=r.d;why+='。'+r.u.name+'は'+r.d.name+'を相手にしなかった。'+r.d.name+'は一人で調べた';}
else if(r.k==='rival'){
var w=sk(x,pr.type)>=sk(y,pr.type)?x:y,l=w===x?y:x,mr={w:w.name,l:l.name,place:pr.place,thing:pr.thing},q=rng();
t+=F(pk(S,pr.rival),m);
if(q<0.4){
g=J.clue(S,w,pr.type);rel(S,w,l,-0.1,'張り合う');
return J.say(S,pr.id,{actors:[w,l],tag:pr.name,text:t+F('――手がかりに先にたどり着いたのは、{w}だった。',mr)+(g?'――'+g+'。':''),why:why+'。二人は手柄を取り合った（'+w.name+'が先んじた）'});
}
if(q<0.7){
rel(S,w,l,-0.1,'張り合う');
return J.say(S,pr.id,{actors:[w,l],tag:pr.name,text:t+F('{w}は、見つけたものを{l}には見せず、黙ってポケットにしまった。',mr),why:why+'。'+w.name+'は、つかんだ情報を'+l.name+'に隠した（手がかりは皆に伝わらなかった）'});
}
rel(S,w,l,-0.15,'険悪',w);J.misread(S,l);
return J.say(S,pr.id,{actors:[w,l],tag:pr.name,text:t+F('その夜、{w}は皆の前で、{l}が昨夜{place}の近くにいたと、それとなく口にした。',mr),why:why+'。'+w.name+'は、張り合う'+l.name+'について、わざと間違った話を流した（偽の手がかり：'+l.name+'への疑い +10）'});
}
else if(r.k==='blind'){
t+=F(pk(S,R.blind),m);finder=r.d;
if(rng()>base+0.05){
var inn2=J.innocent(S,r.u,function(q){return q!==r.d;}),mb=inn2.length?rng.pick(inn2):null;
if(mb){J.misread(S,mb);m.b=mb.name;}
return J.say(S,pr.id,{actors:mb?[r.u,r.d,mb]:[r.u,r.d],tag:pr.name,text:t+(mb?F('{d}の読みは、{b}の方を指していた。{u}は、それを鵜呑みにした。',m):F(pk(S,FAIL),m)),why:why+'。'+r.u.name+'は、'+r.d.name+'の言うことを確かめずに信じた'+(mb?'（偽の手がかり：'+mb.name+'への疑い +10）':'')});
}
why+='。'+r.u.name+'は'+r.d.name+'の読みを信じた（今回は当たっていた）';
}
else if(r.k==='love'){t+=F(pk(S,R.love),m);base+=0.1;fear(x,-6);fear(y,-6);finder=r.u;why+='。'+r.u.name+'は'+r.d.name+'を守るように寄り添って調べた（二人の恐怖 -6）';}
else if(r.k==='family'){t+=F(pk(S,r.sub==='parent'?R.parent:R.sib),m);base+=0.1;finder=r.d;why+=r.sub==='parent'?'。'+r.u.name+'は、'+r.d.name+'を一人で危ない所へ行かせなかった':'。'+(HK.Sib?HK.Sib.pairWord(r.u,r.d,S):'きょうだい')+'で、言い合いながら手分けした';}
else if(r.k==='lead'){t+=F(pk(S,pr.lead),m);base+=0.1;finder=r.d;why+='。'+r.u.name+'が指示を出し、'+r.d.name+'が動いた';}
else if(r.k==='close'){t+=F(pk(S,pr.close),m);base+=0.15;why+='。息が合った';}
else{base+=0.05;why+='。名刺交換から始まった';}
if(rng()<base)g=J.clue(S,finder,pr.type);
if(g){
if(r.k==='first'||r.k==='close')rel(S,x,y,0.1,'協力');
return J.say(S,pr.id,{actors:[x,y],tag:pr.name,text:t+'――'+g+'。',why:why+'（二人の技能 '+pct(sk(x,pr.type))+'・'+pct(sk(y,pr.type))+'）'});
}
return J.say(S,pr.id,{actors:[x,y],tag:pr.name,text:t+pk(S,FAIL),why:why+'。手がかりは見つからなかった'});
}
J.pairOpts=function(S,j){
var out=[],live=S.P.filter(J.free);
J.PAIR.forEach(function(pr){
if(j.used[pr.id])return;
var cand=[];
live.forEach(function(x){
if(pr.A.indexOf(x.role)<0)return;
live.forEach(function(y){
if(y===x||pr.B.indexOf(y.role)<0)return;
if(J.guilty(S,x)&&J.guilty(S,y))return;
cand.push([x,y]);
});
});
if(!cand.length)return;
out.push({w:1.3,id:pr.id,go:function(){var c=S.rng.pick(cand);return!!run(S,pr,c[0],c[1]);}});
});
return out;
};
})();
});
;
/* ==== js/yakata-tricks-a.js ==== */
HK.Load.def(216,'js/yakata-tricks-a.js',function(){
(function(){
'use strict';
var Y=window.HK.YAKATA;
if(!Y)return;
Y.TRICKS=Y.TRICKS||[];
function K(place,method,scene,truth,clues,diff){
Y.TRICKS.push({place:place,method:method,scene:scene,truth:truth,clues:clues.split('|').map(function(c){var k=c.indexOf(':');return{type:c.slice(0,k),t:c.slice(k+1)};}),diff:diff});
}
K('書斎','刺殺','書斎は内側から鍵がかかっていた。{v}は机に突っ伏し、背中にペーパーナイフが刺さっていた。鍵は、{v}の胸ポケットの中にあった。','{c}は糸を使って、扉の外から鍵を胸ポケットへ滑り込ませた。鍵穴の上の小さな隙間を通して。','obs:扉の上の欄間に、細い糸がこすれた跡が残っていた|search:廊下のゴミ箱から、絡まった釣り糸が見つかった|lore:鍵の頭に、小さな輪がつけられていた。何かを通すための輪だった',2);
K('寝室','絞殺','寝室には内側から閂がかかっていた。{v}はベッドの上で、首にガウンの紐を巻きつけたまま死んでいた。','{c}は閂の受け金具に氷を挟んでおいた。氷が溶けると、閂はひとりでに落ちた。','obs:閂の下の床板だけが、わずかに濡れていた|lore:暖房は夜中じゅう最大にされていた。何かを早く溶かすために|search:厨房の製氷皿が、一つだけ空になっていた',2);
K('時計塔','転落死','時計塔の最上階は、内側から鍵がかかっていた。{v}は塔の真下の雪の上で死んでいた。','{c}は{v}を突き落としたあと、塔の隠し階段から降りてきた。館の古い図面にしか載っていない階段だった。','lore:古い図面に、時計塔の壁の中を通る線が描かれていた|search:時計の文字盤の裏に、人が一人通れる隙間があった|obs:隠し階段の手すりの埃が、一か所だけ拭われていた',3);
K('地下ワイン蔵','撲殺','地下のワイン蔵は、外から南京錠がかけられていた。{v}はワインの棚の下敷きになっていた。','{c}は{v}を殴り殺したあと、棚を倒して事故に見せかけ、外から南京錠をかけた。鍵は一つしかないと、皆が思い込んでいた。','med:致命傷は棚の角ではなく、丸い鈍器によるものだった|search:執事の鍵束とは別に、もう一本、新しい合鍵が作られていた|obs:倒れた棚の下のワインの染みが、遺体より先に乾いていた',2);
K('浴室','溺死','浴室の扉は内側から鍵がかかっていた。{v}は浴槽の中で死んでいた。','{c}は{v}を浴槽に沈めたあと、扉のサムターンにテープを貼り、扉を閉めると同時に引いて回した。','obs:サムターンのつまみに、粘着テープの糊が残っていた|search:脱衣所の換気扇の中から、丸めたテープが見つかった|med:{v}の手首に、押さえつけられた指の痕があった',1);
K('礼拝堂','刺殺','礼拝堂の扉は内側から閂がかかっていた。{v}は祭壇の前で、銀の燭台に胸を貫かれていた。','{c}は告解室の床下の抜け穴から出入りした。抜け穴は、館の地下と礼拝堂をつないでいた。','search:告解室の床板の一枚だけが、釘で留められていなかった|lore:この館の初代の主は、禁教の時代の信徒だった。逃げ道を必ず作っていた|obs:祭壇の前の床に、地下の土が少しだけ落ちていた',3);
K('温室','毒殺','温室はガラス張りで、扉は内側から鍵がかかっていた。{v}は籐椅子に座ったまま冷たくなっていた。','{c}は温室の植物に毒の霧を散布する装置を仕掛けた。時間になると、霧が出る仕組みだった。','lore:温室の植物の一部が、一晩で葉を枯らしていた|search:スプリンクラーのタンクに、甘い匂いの薬品が混ぜられていた|med:{v}の唇と爪が、青紫色に変わっていた',2);
K('屋根裏部屋','絞殺','屋根裏への梯子は外されていて、上がる手段はなかった。{v}は屋根裏の梁から吊り下がっていた。','{c}は{v}を屋根裏で殺したあと、天窓から屋根を伝って降りた。梯子は自分で外した。','obs:天窓の掛け金が、外側から閉められた形になっていた|search:屋根の雪に、人の重みで崩れた跡があった|med:首の索条痕が二本あった。一本は、吊るされる前についたものだった',2);
K('応接間','刺殺','応接間の扉は内側から鍵がかかり、鍵は暖炉の灰の中から見つかった。{v}はソファで刺されていた。','{c}は扉を閉めたあと、廊下側から煙突に鍵を落とした。応接間の暖炉と廊下の暖炉は、同じ煙突につながっていた。','lore:館の暖炉は、二つの部屋で一本の煙突を共有している|obs:廊下の暖炉の煤に、細い引っかき傷があった|search:鍵の表面に、煤ではない灰色の粉がついていた',2);
K('離れの茶室','毒殺','離れへ続く雪の上には、{v}の足跡しかなかった。{v}は茶室で、茶碗を手にしたまま倒れていた。','{c}は前の晩、雪が降る前に茶碗に毒を塗っておいた。{v}は翌朝、自分で茶を点てて飲んだ。','med:毒が体に回った時刻は、足跡がついた時刻とほぼ同じだった|obs:茶碗の縁にだけ、乾いた薄い膜がついていた|talk:{v}は毎朝必ず、離れで一人で茶を点てる習慣があった',1);
K('中庭','撲殺','中庭の真ん中で、{v}が倒れていた。まわりの雪には、{v}の足跡しかなかった。','{c}は二階のバルコニーから、重りのついた縄で{v}を殴り、縄を巻き取った。','obs:遺体のそばの雪に、何かが擦った細い溝があった|search:二階のバルコニーの手すりに、縄の擦れた跡があった|med:傷は上から振り下ろされた角度だった',2);
K('凍った池','溺死','凍った池の真ん中の氷が割れ、{v}が沈んでいた。池のまわりの雪に、足跡は一つもなかった。','{c}は雪が降り始める前に{v}を池に沈めておいた。雪は、すべての痕跡を覆い隠した。','med:{v}の死亡推定時刻は、雪が降り出すよりも前だった|talk:昨夜、雪が降り始めたのは日付が変わる少し前だった|obs:割れた氷の縁にも、薄く雪が積もっていた',1);
K('雪の庭園','凍死','{v}は庭園の東屋で、薄着のまま凍死していた。東屋のまわりには、{v}の足跡が一筋だけ。','{c}は{v}に睡眠薬を飲ませ、背負って東屋まで運んだ。帰りは、自分の足跡の上を後ろ向きに歩いた。','obs:{v}の足跡にしては、歩幅が妙に狭く、深かった|med:{v}の血液から、睡眠薬が検出された|search:{c}の靴の底に、庭園の東屋の赤い土がこびりついていた',2);
K('裏庭の雪の上','刺殺','{v}は裏庭の雪原の真ん中で死んでいた。足跡は、{v}のものと、館へ戻る誰かのものが一筋だけ。','{c}は{v}の靴を履いて歩き、殺したあと、自分の靴で戻った。行きの足跡は、{v}のものではなかった。','obs:「{v}の足跡」は、{v}の体重にしては浅すぎた|search:{v}の靴の中が、内側から湿っていた。別の誰かが履いた跡だった|lore:往復の足跡の間隔から、歩いた人の背丈が割り出せた',3);
K('バルコニー','転落死','{v}はバルコニーの真下で死んでいた。バルコニーの雪には、{v}の足跡しかなかった。','{c}は屋上から長い棒で{v}を突き落とした。','search:屋上の雪に、細長い物を置いた跡があった|med:{v}の背中に、丸い打撲痕があった|obs:物置の物干し竿の先が、一本だけ濡れていた',2);
K('食堂','毒殺','{v}は夕食の席で、ワインを口にした直後に倒れた。その時、{c}を含む全員が同じテーブルについていた。','{c}は事前に、{v}のグラスにだけ毒を塗っておいた。席順を決めたのは{c}だった。','talk:その夜の席順を決めたのは、{c}だった|obs:{v}のグラスだけ、ほかと模様が違っていた|med:毒はワインではなく、グラスの縁から出た',1);
K('図書室','撲殺','{v}は図書室で殺されていた。死亡推定時刻、{c}は広間でピアノを弾いていた。全員がそれを聞いていた。','ピアノの音は、{c}が前もって録音しておいたものだった。{c}はその間に図書室へ向かった。','search:ピアノの下に、小型のスピーカーが隠されていた|obs:演奏が、同じ箇所で同じように一度だけつまずいていた。昨夜と、まったく同じに|talk:ピアノの音が鳴っている間、誰も広間の中を見ていなかった',2);
K('遊戯室','刺殺','{v}はビリヤード台の上で刺されていた。死亡推定時刻、{c}は全員と一緒に広間にいた。','{c}は館じゅうの時計を一時間進めておいた。本当の犯行時刻は、全員が「アリバイがある」と思っている時間より前だった。','obs:{v}の腕時計だけが、館の時計と一時間ずれていた|lore:昨夜の月の位置と、時計の時刻が合わなかった|search:柱時計の振り子の留め金に、新しい指紋がついていた',2);
K('音楽室','絞殺','{v}は音楽室で、チェロの弦で首を絞められていた。その時刻、{c}は電話で麓の家族と話していた。','電話線は切れていた。{c}が話していた「電話」は、館の内線だった。相手は、共犯者だった。','talk:麓との電話は、吹雪の初日から一度もつながっていなかった|search:内線の配電盤に、使われた形跡があった|obs:{c}の電話の話し声には、雑音がひとつも混じっていなかった',2);
K('暖炉の間','撲殺','{v}は暖炉の前で死んでいた。体はまだ温かく、死後一時間ほどに見えた。その間、{c}はずっと皆と一緒にいた。','{c}は三時間前に{v}を殺し、遺体を暖炉の前に置いて温め続けた。死亡推定時刻が、ずれるように。','med:体の表面は温かいのに、内臓の温度は低すぎた|obs:暖炉の薪が、いつもの倍の量くべられていた|talk:暖炉に薪を足しに行ったのは、{c}だった',3);
K('標本室','毒殺','{v}は標本室で、蝶の標本箱を抱えたまま死んでいた。死亡推定時刻、{c}は遠く離れた厨房にいた。','{c}は標本の防虫剤を、遅効性の毒にすり替えていた。{v}が標本を手入れする時間は、決まっていた。','lore:標本箱の防虫剤の匂いが、いつもと違っていた|talk:{v}は毎晩同じ時刻に、標本の手入れをしていた|search:厨房のゴミ箱から、防虫剤の空き箱が見つかった',2);
K('鐘楼','転落死','鐘楼の鐘が深夜に鳴り、皆が駆けつけると、{v}が下に落ちていた。鐘が鳴ったとき、{c}は皆と一緒にいた。','{v}はもっと前に死んでいた。{c}は、溶けると鐘の紐が引かれる氷の仕掛けを残していた。','obs:鐘の紐の先が濡れていた|med:{v}は鐘が鳴るよりずっと前に死んでいた|search:鐘楼の床に、重りに使われた石が転がっていた',3);
K('客間','刺殺','{v}は客間で刺されていた。死亡推定時刻、{c}の部屋からは、ずっとタイプライターを打つ音がしていた。','音を立てていたのは共犯者だった。{c}は、その間に客間へ向かった。','talk:タイプの音は、いつもの{c}の癖と違って、規則正しすぎた|search:{c}の原稿は、昨夜の分だけ字の打ち方が違っていた|obs:{c}の指先には、インクの汚れがひとつもなかった',2);
K('撞球室','撲殺','{v}は撞球室で殴り殺されていた。その時刻、{c}は二階の窓から手を振っていた。何人もが、それを見ていた。','窓辺にいたのは、{c}の服を着せた等身大の人形だった。','search:屋根裏の衣装箱から、首の外れたマネキンが見つかった|obs:窓辺の人影は、手を振る以外、一度も動かなかった|talk:人影を見たのは、皆、雪の中庭からだった。顔までは見えなかった',2);
K('台所','毒殺','{v}は夜食のスープを飲んで倒れた。鍋のスープは全員が飲んでいたのに、倒れたのは{v}だけだった。','毒はスープではなく、{v}だけが使う蜂蜜の瓶に入っていた。','talk:{v}だけが、スープに蜂蜜を入れる癖があった|search:食器棚の奥に、中身が半分減った蜂蜜の瓶があった|med:毒の成分に、蜂蜜の糖が混ざっていた',1);
K('地下室','刺殺','{v}は地下室で刺されていた。だが、凶器はどこにもなかった。','凶器は、氷を削って作った短剣だった。地下の暖房で、凶器は溶けて消えた。','obs:傷口のまわりだけが、妙に濡れていた|med:傷口の組織が、冷たいもので傷ついたように縮んでいた|search:冷凍庫の中に、刃の形にくぼんだ型が残っていた',2);
K('書庫','撲殺','{v}は書庫で殴り殺されていた。凶器らしいものは、どこにも見つからなかった。','凶器は、凍らせた肉の塊だった。犯行のあと、それは夕食のシチューになった。','med:傷口に、細かい肉の繊維が残っていた|talk:その夜のシチューの肉は、やけに硬かった|search:厨房の冷凍庫の肉が、一塊だけ減っていた',3);
K('人形の間','絞殺','{v}は人形の間で、着物を着せられて座らされていた。まわりの人形と同じ姿勢で。','{c}は館に伝わる「人形の唄」になぞらえて殺した。唄の二番には、次の犠牲者のことが歌われていた。','lore:壁の古い唄の一番の歌詞と、現場の様子がそっくり同じだった|obs:人形の一体だけが、{v}と同じ柄の着物を着ていた|talk:その唄を最近口ずさんでいたのは、{c}だった',2);
K('鏡の間','刺殺','鏡の間で{v}が死んでいた。無数の鏡に、遺体が何十にも映り込んでいた。','{c}は鏡の一枚が隠し扉になっていることを知っていた。犯行のあと、鏡の向こうへ消えた。','obs:鏡の一枚だけが、わずかに浮いていて、映る像が歪んでいた|search:鏡の枠の裏に、真新しい蝶番があった|lore:館の古い設計書に、「鏡の間・抜け」とだけ書かれていた',2);
K('剥製の部屋','刺殺','{v}は剥製の部屋で、熊の剥製の爪に胸を裂かれたように倒れていた。','{c}は熊の爪を外して凶器にし、事故に見せかけるために遺体を剥製の前に置いた。','obs:熊の剥製の右手の爪が、一本だけ新しく接着されていた|med:傷は下から上へ、人の手で振るった角度だった|search:{c}の部屋の洗面台に、獣の毛が落ちていた',1);
K('温泉の露天風呂','溺死','露天風呂で、{v}が湯に沈んでいた。湯船のまわりの雪には、誰の足跡もなかった。','{c}は湯の中を通る排水路から出入りした。露天風呂と館の大浴場は、湯の下でつながっていた。','lore:源泉の配管図に、大浴場と露天風呂を結ぶ水路があった|search:大浴場の排水口の格子が、一度外された跡があった|obs:{c}の髪が、朝になっても少し湿っていた',3);
K('展望室','撲殺','{v}は展望室で、望遠鏡の脚に頭を打ちつけて死んでいた。','{c}は望遠鏡の向きを変えて{v}を覗かせ、背後から殴った。望遠鏡が向いていたのは、空ではなかった。','obs:望遠鏡は、星ではなく館の別の窓に向けられていた|med:傷は望遠鏡の脚の形と合わなかった|search:展望室の窓枠に、凶器の燭台の蝋が落ちていた',1);
K('厨房','刺殺','{v}は厨房で、包丁で刺されていた。包丁には、{b}の指紋がべったりとついていた。','{c}は手袋をして刺し、事前に{b}に包丁を持たせておいた。料理を手伝ってほしい、と頼んで。','talk:昨日の夕方、{c}が{b}に料理の手伝いを頼んでいた|obs:包丁の指紋は、刺す持ち方ではなく、切る持ち方だった|search:厨房の生ゴミの中に、血のついたゴム手袋があった',2);
K('物置','絞殺','{v}は物置の中で、ロープで縛られて死んでいた。物置の扉は、雪で外から押さえられていた。','{c}は{v}を物置に誘い込み、扉を閉めて雪を積み上げた。助けを呼ぶ声は、吹雪にかき消された。','obs:扉の前の雪が、屋根から落ちたにしては高く積まれていた|search:{c}の手袋が、雪かきをしたように濡れて破れていた|med:{v}は、窒息する前に長いあいだもがいていた',1);
K('洗濯室','感電死','{v}は洗濯室の水たまりの中で、感電して死んでいた。','{c}は洗濯機の配線の被覆を剥いで、床に水を撒いておいた。{v}が夜にシャツを洗う習慣を知っていた。','obs:配線の被覆が、刃物できれいに切られていた|talk:{v}は寝る前に必ず、自分でシャツを洗っていた|lore:ブレーカーが落ちなかったのは、安全装置が外されていたからだった',2);
K('ボイラー室','中毒死','{v}はボイラー室の中で、眠るように死んでいた。','{c}は排気口を雪で塞いだ。不完全燃焼のガスが、密閉された部屋に満ちた。','med:{v}の頬は、不自然に赤みを帯びていた|search:外の排気口が、雪で固められていた|lore:ボイラーの排気は、本来なら外に抜けるはずだった',2);
K('ガレージ','撲殺','{v}は雪に閉ざされたガレージの車の中で死んでいた。車には、鍵がかかっていた。','{c}は車のスペアキーで鍵をかけたあと、キーを{v}のポケットに戻した。','search:車の取扱説明書の箱が、開けられて空になっていた|obs:{v}のポケットのキーは、雪で濡れていなかった|talk:スペアキーの在処を知っていたのは、館の者と{c}だけだった',1);
K('薬品庫','毒殺','{v}は薬品庫で倒れていた。棚の毒物の瓶が一つ倒れ、事故のように見えた。','{c}は{v}を別の場所で毒殺し、薬品庫に運んで瓶を倒した。','med:吸い込んだのではなく、飲まされた毒だった|obs:倒れた瓶のまわりの埃に、瓶の跡が残っていなかった|search:廊下の絨毯に、何かを引きずった跡があった',1);
K('客室の暖炉の前','焼死','{v}は客室で、暖炉の火が燃え移って焼け死んでいた。','{c}は{v}を殴って気絶させ、暖炉の火の粉が落ちるように衣服を広げておいた。','med:頭に、焼ける前についた打撲の痕があった|obs:燃え方が、火の粉からにしては広すぎた|search:暖炉の火かき棒が、きれいに拭かれていた',2);
K('二階の廊下','転落死','{v}は吹き抜けの階段から落ちて死んでいた。足を滑らせたように見えた。','{c}は階段の上から二段目に、透明な釣り糸を張っておいた。','obs:手すりの柱に、細い溝が二本ついていた|search:階段の下の暗がりから、切れた釣り糸が見つかった|med:{v}の足首に、細く食い込んだ痕があった',1);
K('遊戯室','毒殺','{v}はチェスの対局中に倒れた。向かいに座っていたのは{b}だった。','毒は{v}の駒にだけ塗られていた。{v}には、考えるとき駒を唇に当てる癖があった。','obs:黒のクイーンの頭だけが、妙に光っていた|talk:{v}が駒を唇に当てる癖は、親しい者なら誰でも知っていた|search:チェス盤の箱の中に、筆と小瓶が隠されていた',2);
K('寝室','窒息死','{v}はベッドの中で、枕に顔を埋めたまま死んでいた。','{c}は{v}の睡眠薬を強いものにすり替え、深く眠った{v}の顔に枕を押しつけた。','med:{v}の目に、細かい出血の点があった|search:{v}の薬瓶の中の錠剤が、一錠だけ形が違っていた|obs:枕の縫い目が、内側から押しつぶされていた',1);
K('サンルーム','撲殺','{v}はサンルームで、天井から落ちたシャンデリアの下敷きになっていた。','{c}は{v}を殴り殺してから、シャンデリアの鎖を切り落とした。','med:{v}はシャンデリアが落ちる前に死んでいた|obs:シャンデリアの鎖の切り口が、錆ではなく真新しかった|search:工具箱の金鋸に、金属の粉がついていた',1);
K('隠し部屋','刺殺','{v}は、誰も知らなかった隠し部屋で見つかった。偶然、壁を叩いた者が気づいた。','{c}は館の主から、隠し部屋の存在を聞いていた。犯行のあと、遺体ごと部屋を閉ざすつもりだった。','lore:館の外から見た窓の数と、中から数えた窓の数が、一つ合わなかった|search:書棚の本の一冊だけが、引くと動く仕掛けになっていた|talk:隠し部屋の話を館の主から聞いたことがあるのは、{c}だけだった',3);
K('執事室','絞殺','{v}は執事室で、ネクタイで首を絞められていた。部屋の鍵は執事しか持っていないはずだった。','{c}は夕食のあいだに執事の鍵束から鍵を抜き、粘土で型を取って戻した。','search:暖炉の灰の中から、型取りに使った粘土の塊が出てきた|obs:執事の鍵束の輪が、一度外された形にゆがんでいた|talk:夕食のとき、{c}だけが一度席を外していた',2);
K('地下牢','餓死','開かずの地下牢の中で、{v}が見つかった。{v}は数日前から、そこに閉じ込められていたらしかった。','{c}は吹雪の初日に{v}を地下牢に閉じ込め、{v}は「先に帰った」と皆に嘘をついた。','talk:{v}が「先に帰った」と言ったのは、{c}だけだった|search:吹雪の初日から、橋はもう落ちていた。誰も帰れたはずがなかった|obs:地下牢の扉の外に、新しい南京錠がかけられていた',2);
K('時計の間','刺殺','{v}は、無数の時計が飾られた部屋で死んでいた。止まっていた時計は、どれも同じ時刻を指していた。','{c}は時計をすべて同じ時刻で止め、それが犯行時刻だと思わせた。本当の犯行は、その二時間後だった。','obs:止まった時計の一つだけ、電池が抜かれていた。ほかは、針を手で止められていた|med:死亡推定時刻と、時計の時刻が合わなかった|search:{c}の指先に、時計のオイルの匂いが残っていた',2);
K('音楽室','毒殺','{v}はトランペットを吹いた直後に倒れた。','毒は、マウスピースの内側に塗られていた。','obs:マウスピースの内側だけ、金属の色が変わっていた|med:{v}の唇だけが、ひどく爛れていた|talk:{v}が今夜演奏することを、{c}は前もって知っていた',1);
K('裁縫室','刺殺','{v}は裁縫室で、裁ち鋏で刺されていた。','{c}は{v}が型紙を取るために屈む瞬間を待っていた。','obs:床に散らばった待ち針が、遺体の下にだけなかった|search:裁縫箱の裏に、乾いた血の指紋が残っていた|talk:{v}は、この部屋で{c}の衣装を直していた',1);
K('倉庫','凍死','{v}は館の外の倉庫に閉じ込められて凍死していた。倉庫の扉は、内側からは開かない作りだった。','{c}は{v}を「薪を取りに行こう｜＝｜薪を取りに行きましょう」と誘い出し、扉を閉めた。','talk:{v}が最後に話していたのは、{c}だった|obs:扉の外側の閂に、真新しい手袋の繊維が引っかかっていた|search:{c}の手袋の指先が、一本だけほつれていた',1);
K('書斎','銃殺','{v}は書斎で撃たれていた。銃声を聞いた者は、誰もいなかった。','{c}は吹雪の雷鳴に合わせて引き金を引いた。','obs:雷が落ちた時刻と、時計が止まった時刻が一致した|search:暖炉の上の猟銃に、硝煙の匂いが残っていた|lore:猟銃の弾が、一発だけ減っていた',1);
})();
});
;
/* ==== js/yakata-tricks-b.js ==== */
HK.Load.def(217,'js/yakata-tricks-b.js',function(){
(function(){
'use strict';
var Y=window.HK.YAKATA;
if(!Y)return;
Y.TRICKS=Y.TRICKS||[];
function K(place,method,scene,truth,clues,diff){
Y.TRICKS.push({place:place,method:method,scene:scene,truth:truth,clues:clues.split('|').map(function(c){var k=c.indexOf(':');return{type:c.slice(0,k),t:c.slice(k+1)};}),diff:diff});
}
K('客間','撲殺','{v}は客間で殴り殺されていた。だが、夕食の席で{v}を見た、と全員が証言した。','夕食の席にいた「{v}」は、{v}の服を着て帽子を目深にかぶった{c}だった。{v}はそのとき、もう死んでいた。','talk:夕食のとき、{v}はほとんど喋らず、帽子を一度も取らなかった|med:{v}の胃は空だった。夕食を食べていなかった|obs:夕食の席の{v}は、左手でフォークを使っていた。{v}は右利きだった',3);
K('館の主の寝室','絞殺','{v}は寝室で死んでいた。死んだはずの時刻のあとにも、{v}の部屋から咳払いが聞こえていた。','咳払いは、{c}が仕掛けた録音だった。','search:ベッドの下から、タイマーつきの古い録音機が見つかった|obs:咳払いは、毎回まったく同じ長さだった|talk:「さっき、{v}の部屋から咳払いが聞こえた｜＝｜さっき、{v}の部屋から咳払いが聞こえました」と最初に言い出したのは、{c}だった',2);
K('二階の客室','刺殺','{v}は自室で刺されていた。部屋は、{v}が泊まるはずの部屋ではなかった。','{c}は部屋割りの札を夜のうちに入れ替え、{v}を狙った部屋に寝かせた。','obs:部屋の札を留める釘に、抜いた跡があった|talk:{v}は「自分の部屋は二階の奥だと聞いた｜＝｜自分の部屋は二階の奥だと聞きました」と言っていた|search:部屋割りの紙の筆跡が、書き直されていた',2);
K('仮面の間','刺殺','仮面舞踏会の最中、{v}が刺されて倒れた。全員が仮面をつけていて、誰が誰か分からなかった。','{c}は自分と同じ衣装を共犯者に着せ、その間に犯行を済ませた。','obs:同じ羽根飾りの仮面が、二つあった|search:衣装部屋の、同じ衣装の予備が一着消えていた|talk:{c}を見た、という証言が、同じ時刻に二か所であった',3);
K('双子の間','毒殺','{v}は双子の肖像画が飾られた部屋で毒を飲んで死んでいた。グラスは二つ、どちらも同じ酒だった。','毒は、氷の中に仕込まれていた。{c}は酒をすぐに飲み、{v}は氷が溶けるまで待って飲んだ。','talk:{c}は普段、酒を一気に飲む癖があった|obs:二つのグラスのうち、一つだけ氷が溶けきっていた|med:毒は、ゆっくりと溶け出すように混ぜられていた',2);
K('吹き抜けのホール','撲殺','{v}は吹き抜けのホールで、頭を砕かれて死んでいた。天井から、何かが落ちたようだった。','{c}は天井の梁に石像を吊り、ろうそくで紐を焼き切る仕掛けを作った。','search:梁の上に、焼け焦げた紐の切れ端があった|obs:二階の燭台が、一本だけ梁の真下に動かされていた|lore:紐が焼き切れるまでの時間は、ろうそくの長さで決められる',3);
K('ワインセラー','中毒死','{v}はワインセラーで、酒に酔って眠りこけたように死んでいた。','{c}はセラーに大量のドライアイスを置き、扉を閉めた。二酸化炭素が床に溜まった。','obs:床に、白い粉のような霜の跡が残っていた|lore:セラーの換気口は、床ではなく天井近くにあった|search:厨房の冷凍庫から、魚の保冷用のドライアイスが消えていた',2);
K('塔の螺旋階段','転落死','{v}は螺旋階段の下で、首を折って死んでいた。','{c}は階段の一段に、蝋を薄く塗っておいた。','obs:上から七段目だけ、つやが違っていた|search:燭台の蝋が、不自然に削り取られていた|med:{v}は、前ではなく後ろ向きに倒れていた',1);
K('暖炉の前','撲殺','{v}は暖炉の前で倒れていた。暖炉の上の重い置き時計が、{v}の頭に落ちていた。','{c}は置き時計の台座を、見えない角度で削っておいた。振動で落ちるように。','obs:置き時計の台座の裏が、真新しくやすりで削られていた|search:暖炉の灰の中に、木屑が混じっていた|talk:{v}がいつも暖炉の前で本を読むのは、皆が知っていた',2);
K('書斎','毒殺','{v}は書斎で、手紙の封を舐めて開けたあとに倒れた。','{c}は封筒の糊に毒を混ぜておいた。','obs:封筒の糊の色が、ほかの封筒と違っていた|med:毒は舌から吸収されていた|search:{c}の部屋の便箋と同じ種類の封筒が、一枚だけ減っていた',1);
K('寝室','刺殺','{v}の寝室には、窓から雪が吹き込んでいた。窓は外から割られたように見えた。','{c}は内側から窓を割り、ガラスを外に掃き出した。外からの侵入者に見せかけるために。','obs:割れたガラスの大半が、部屋の外側に落ちていた|search:窓の外の雪の上に、ガラス片はあるのに足跡がなかった|lore:外から割ったなら、破片は内側に飛ぶはずだった',1);
K('倉庫の屋根裏','圧死','{v}は倉庫で、崩れた薪の山の下敷きになっていた。','{c}は薪を支えていた楔を、遠くから紐で引き抜いた。','search:薪の山の下から、紐のついた楔が出てきた|obs:倉庫の窓の桟に、紐が擦れた跡があった|talk:その夜、薪を取りに行くよう{v}に頼んだのは{c}だった',2);
K('ガラスの温室','凍死','{v}は温室の中で凍死していた。外は吹雪でも、温室の中は暖かいはずだった。','{c}は温室の暖房の燃料を抜き、外から扉に雪を詰めて開かないようにした。','search:暖房のタンクの燃料が、空になっていた|obs:扉の隙間に、固く押し込められた雪があった|med:{v}は、内側から何度も扉を叩いていた',1);
K('氷室','凍死','{v}は館の氷室の中で凍りついていた。氷室の扉は、外から閉まっていた。','{c}は「冷えたシャンパンを取ってきてほしい｜冷えたシャンパンを取ってきてくれ｜冷えたシャンパンを取ってきてください」と{v}を氷室へ行かせ、扉を閉めた。','talk:シャンパンを頼んだのは{c}だった|obs:氷室の扉の閂は、自然に落ちる作りではなかった|search:厨房のシャンパンは、すでに冷えたものがあった',1);
K('井戸','溺死','{v}は館の古井戸の底で見つかった。','{c}は井戸の蓋の板を一枚だけ腐ったものに取り替えておいた。','obs:井戸の蓋の板の一枚だけ、木の色が違った|search:物置の裏に、取り外された元の板が捨てられていた|lore:井戸の蓋は、数年前に取り替えられたばかりのはずだった',2);
K('食堂','毒殺','{v}は朝食の紅茶を飲んで倒れた。紅茶はポットから全員に注がれていた。','毒は、{v}が紅茶に入れる角砂糖に仕込まれていた。{v}だけが、角砂糖を三つ入れる。','talk:角砂糖を使うのは、{v}だけだった|search:砂糖壺の中の角砂糖が、一つだけ溶けかけていた|med:毒は糖と一緒に吸収されていた',1);
K('寝室','毒殺','{v}は寝る前に飲んだホットミルクで死んでいた。','{c}は、夜にミルクを届ける役を買って出ていた。','talk:ミルクを運んだのは{c}だった|obs:カップの底に、溶け残った白い粉があった|search:{c}の化粧ポーチに、空の薬包紙が入っていた',1);
K('書斎','毒殺','{v}はパイプをくゆらせながら、安楽椅子で死んでいた。','{c}はパイプの煙草に、毒草の葉を混ぜておいた。','lore:パイプの灰の中に、煙草ではない葉の葉脈があった|med:{v}の瞳孔が、異様に開いていた|search:温室の毒草の鉢から、葉が数枚むしられていた',2);
K('浴室','毒殺','{v}は湯船の中で死んでいた。溺れたのではなかった。','{c}は入浴剤に、皮膚から吸収される毒を混ぜていた。','med:{v}の肌に、薬品による薄い発疹があった|search:浴室の入浴剤の瓶の中身が、ほかの瓶と色が違った|talk:その入浴剤を{v}に勧めたのは{c}だった',2);
K('礼拝堂','毒殺','{v}は礼拝堂で、聖杯の葡萄酒を口にして倒れた。','{c}は聖杯の内側に毒を塗った。その夜、聖杯に口をつけるのは{v}だけだと知っていた。','lore:この館の祈りでは、最初に聖杯に口をつけるのは主催者と決まっていた|obs:聖杯の縁に、指でなぞった跡があった|search:礼拝堂の燭台の陰に、小さな筆が落ちていた',2);
K('医務室','毒殺','{v}は医務室で、頭痛薬を飲んだあとに倒れた。','{c}は頭痛薬のカプセルの中身を、毒にすり替えていた。','search:薬瓶の中に、カプセルの継ぎ目がずれたものがあった|med:毒は、胃の中で溶けたカプセルから出ていた|talk:{v}が頭痛持ちだと知っていたのは、ごく親しい者だけだった',2);
K('図書室','刺殺','{v}は図書室で刺されていた。だが、床の血は、驚くほど少なかった。','{c}は別の部屋で{v}を殺し、遺体を図書室に運んだ。','med:血の量が、傷の深さに比べて少なすぎた|search:二階の物置の床に、拭き取った血の跡があった|obs:{v}の靴下の裏に、図書室にはない絨毯の毛がついていた',1);
K('中庭の噴水','撲殺','{v}は凍った噴水の中で、氷に閉じ込められていた。','{c}は{v}を殺したあと、噴水に水を張って凍らせた。死亡推定時刻をごまかすために。','med:氷漬けで、死亡推定時刻が分からなくなっていた|search:噴水のポンプが、夜中に動かされた記録が残っていた|obs:噴水の氷が、ほかの水たまりより新しく透明だった',3);
K('雪だるま','絞殺','中庭の大きな雪だるまが溶けかけたとき、中から{v}が現れた。','{c}は{v}を殺したあと、遺体を雪で固めて雪だるまにした。昼間、皆で作ったものに見せかけて。','talk:昼間に作った雪だるまは、もっと小さかった|obs:雪だるまの胴の雪だけ、踏み固められていた|search:{c}の手袋が、ぐっしょり濡れて干されていた',2);
K('肖像画の間','刺殺','{v}は肖像画の間で倒れていた。壁の肖像画が一枚、血で汚されていた。','血は{v}のものではなかった。{c}は、自分が怪我をしたように見せる偽装に失敗していた。','med:肖像画の血は、{v}とは血液型が違った|obs:{c}の手の包帯の下に、傷はなかった|search:厨房から、鶏の血を入れた瓶が見つかった',2);
K('二階の書斎','転落死','{v}は二階の書斎の窓から落ちて死んでいた。窓は内側から開けられていた。','{c}は{v}に「窓の外に何か見える｜＝｜窓の外に何か見えます」と言って身を乗り出させ、足をすくった。','talk:落ちる直前、{v}と一緒にいたのは{c}だった|obs:窓枠に、外を覗き込んだ二人分の手の跡があった|med:{v}の足首に、掴まれた痣があった',1);
K('遊戯室','刺殺','{v}は遊戯室で刺されていた。部屋の中は荒らされ、物盗りの仕業に見えた。','荒らしたのは{c}だった。なくなった物は、何ひとつなかった。','obs:引き出しは開けられていたが、中身は乱れていなかった|search:「盗まれた」宝石は、{c}の部屋の暖炉の中にあった|lore:物盗りなら、もっと金目のものから手をつけるはずだった',1);
K('寝室','銃殺','{v}は拳銃を握ったまま、こめかみを撃ち抜かれていた。自殺に見えた。','{c}は{v}を撃ったあと、{v}の手に拳銃を握らせた。','med:{v}の手に、硝煙反応がなかった|obs:拳銃は右手に握られていたが、{v}は左利きだった|search:{c}の袖口に、硝煙の匂いが残っていた',1);
K('裏口','撲殺','{v}は裏口で殴り殺されていた。裏口から雪の中へ、誰かの足跡が続いていた。','足跡は、{c}が「外部犯」を演出するためにつけたものだった。足跡は少し先で、館へ戻っていた。','search:足跡は、林の手前でぐるりと回って、館の別の窓の下へ続いていた|obs:足跡の靴の大きさは、館の誰かの靴と同じだった|lore:この吹雪の中、外から人が来られるはずがなかった',1);
K('食料庫','撲殺','{v}は食料庫で、缶詰の棚の下で死んでいた。','{c}は食料をこっそり独り占めしているところを{v}に見られ、口を封じた。','search:食料庫の奥に、隠された缶詰の山があった|obs:{c}だけが、吹雪の三日目になっても顔色がよかった|talk:{v}は「食料の数が合わない｜＝｜食料の数が合いません」と気にしていた',1);
K('子ども部屋','絞殺','{v}は館の古い子ども部屋で、童謡の歌詞どおりに、揺り木馬に乗せられていた。','{c}は、館の主が子どもの頃に歌っていた童謡になぞらえて殺した。犯人が館の過去を知っていると、思わせるために。','lore:童謡の歌詞の通りに、現場が整えられていた|talk:その童謡を知っていたのは、館の主の昔を知る者だけのはずだった|search:{c}の部屋の本の間に、童謡の歌詞を写したメモが挟まっていた',2);
K('書斎','刺殺','{v}は書斎の机で刺されていた。机の上の原稿には、{v}の死に方がそっくりそのまま書かれていた。','{c}は、自分の書いた小説の筋書きどおりに{v}を殺した。それが一番、自分を疑わせない方法だと考えて。','lore:原稿の中の犯人の手口は、現実の事件と細部まで同じだった|obs:原稿の最後のページだけ、インクが新しかった|talk:その原稿を読んだことがあるのは、{c}と{v}だけだった',3);
K('祭壇の間','刺殺','{v}は、館の地下の祭壇の上に横たえられていた。まわりには、奇妙な紋様が描かれていた。','紋様は、オカルトの儀式に見せかけた偽装だった。{c}の動機は、まったく別のところにあった。','lore:紋様は、どの文献にもない、でたらめなものだった|obs:紋様を描いた塗料は、館の物置のペンキだった|search:{c}の指の爪の間に、同じ色のペンキが残っていた',2);
K('鐘楼','絞殺','{v}は鐘楼の鐘の舌（ぜつ）に吊るされていた。鐘が鳴るたびに、遺体が揺れた。','{c}は、館の言い伝え「鐘が三度鳴れば、ひとり死ぬ」を利用した。','lore:言い伝えでは、鐘を鳴らすのは館の主の役目だった|talk:昨夜、鐘が鳴る前に、{c}が塔の方へ歩いていくのを見た者がいた|obs:鐘の綱に、真新しい結び目があった',2);
K('人形の間','刺殺','{v}が死んでいた部屋の人形たちが、すべて{b}の方を向いていた。','{c}は人形の向きを変えて、{b}に疑いが向くように仕向けた。','obs:人形の台座の埃に、向きを変えた跡があった|talk:人形の向きを変えた者を、誰も見ていなかった。夕食のあと、{c}を除いて|search:{c}の袖に、人形の衣装の糸くずがついていた',2);
K('鏡の間','撲殺','{v}は鏡の間で倒れていた。鏡には、口紅で「次はお前だ」と書かれていた。','口紅の文字は、{c}が自分あてに書いたものだった。自分も狙われている被害者だと思わせるために。','obs:文字の書き方が、右から左へ書かれていた。{c}は左利きだった|search:{c}の化粧ポーチの口紅だけが、先端が潰れていた|talk:「次はお前だ」の「お前」が誰かを、真っ先に騒いだのは{c}だった',2);
K('食堂','刺殺','晩餐の最中に停電が起きた。灯りが戻ったとき、{v}はナイフで刺されていた。','{c}はブレーカーにタイマーを仕掛け、暗闇の中で、席から一歩も動かずに隣の{v}を刺した。','search:配電盤に、安物のタイマーが取りつけられていた|obs:{c}の席のナプキンだけが、裏返しに置かれていた|talk:停電の前に、{c}が時計を何度も見ていた',2);
K('広間','毒殺','{v}は、乾杯のシャンパンを飲んで倒れた。乾杯のグラスは、{v}が自分で選んだものだった。','{c}は、すべてのグラスに毒を塗り、自分のグラスにだけ解毒剤を入れていた――と見せかけて、実は{v}が選びそうなグラスを一つだけ前に出していた。','obs:トレイの上で、一つだけグラスが手前に置かれていた|talk:{v}はいつも、一番手前のものを取る癖があった|search:ほかのグラスからは、毒は出なかった',2);
K('遊戯室','撲殺','{v}は遊戯室のダーツの的の前で倒れていた。','{c}はダーツの勝負に負けた{v}に、「罰ゲーム｜罰ゲームだ｜罰ゲームです」と言って目隠しをさせた。','obs:{v}の目のまわりに、布で縛られた跡があった|search:暖炉の中から、焼け残った目隠しの布が出てきた|talk:ダーツに誘ったのは{c}だった',1);
K('温室','刺殺','{v}は温室で、薔薇の枝に絡まるように倒れていた。棘の傷で、まるで薔薇に殺されたように見えた。','{c}は薔薇の棘で偽の傷をつけ、本当の傷を隠した。','med:棘の傷はすべて、死んだあとにつけられていた|obs:薔薇の枝が、根元から切られて遺体に巻きつけられていた|search:温室の剪定鋏に、血がついていた',2);
K('物置','絞殺','{v}は物置で、「呪いの人形」と呼ばれる古い人形を抱いたまま死んでいた。','{c}は人形の呪いの噂を広め、皆が近づかない物置を犯行現場に選んだ。','talk:人形の呪いの噂を最初に言い出したのは、{c}だった|obs:人形の埃の上に、真新しい指紋があった|search:物置の鍵穴に、油が差されていた',1);
K('寝室','刺殺','{v}の寝室の扉には、「入るな」と血で書かれていた。','{c}は扉の文字で全員を怖がらせ、誰も部屋に近づかないうちに、証拠を片付けた。','obs:血の文字が、刷毛で丁寧に書かれていた|med:文字の血は、{v}の傷が乾いてから塗られていた|search:{c}の部屋の洗面台に、血を洗い流した跡があった',2);
K('バルコニー','突き落とし','{v}は吹雪の夜、バルコニーから落ちて死んでいた。風に煽られたように見えた。','{c}は{v}を「星を見よう｜＝｜星を見ましょう」と誘い出し、手すりから突き落とした。この吹雪の夜に、星など見えるはずがなかった。','talk:{v}は「誰かと星を見る約束をした｜＝｜誰かと星を見る約束をしました」と言っていた|lore:この吹雪では、星は一つも見えなかった|obs:バルコニーの雪に、二人分の足跡があった',1);
K('図書室','撲殺','{v}は図書室で、落ちてきた重い本の下敷きになっていた。','{c}は{v}を殴ったあと、本棚から本を落として事故に見せかけた。','med:傷は本の角ではなく、丸い棒によるものだった|obs:落ちた本は、すべて同じ段のものだった。地震でもないのに|search:図書室の脚立の脚に、血が飛んでいた',1);
K('地下の霊廟','刺殺','{v}は館の地下の霊廟で、先代の主の棺の上に横たえられていた。','{c}は霊廟の鍵を、先代の主の遺品から持ち出していた。','lore:霊廟の鍵は、先代の主の懐中時計の中に隠されていた|search:先代の主の懐中時計が、蓋を開けられたまま書斎にあった|talk:懐中時計の秘密を知っていたのは、{c}だけだった',3);
K('廊下','撲殺','{v}は長い廊下の真ん中で倒れていた。廊下の両端には、それぞれ人がいた。誰も、犯人を見ていなかった。','{c}は廊下の壁の飾り鎧の中に隠れていた。','obs:飾り鎧の兜の向きが、昨日と逆になっていた|search:鎧の中に、人の汗の匂いが残っていた|talk:騒ぎのとき、{c}だけが少し遅れて駆けつけた',2);
K('浴室','感電死','{v}は浴槽の中で、ドライヤーと一緒に死んでいた。事故に見えた。','{c}はドライヤーのコードを延長して、浴室の外から浴槽に落とした。','search:浴室の扉の下から、延長コードを引き抜いた跡があった|obs:ドライヤーのコンセントは、浴室の外の差し込みに刺さっていた|talk:{v}は浴室でドライヤーを使う習慣はなかった',2);
K('寝室','中毒死','{v}はベッドの中で、眠るように死んでいた。部屋にはガスの匂いがした。','{c}は暖房のガス管の継ぎ目を緩め、{v}の部屋の換気口を塞いでおいた。','obs:ガス管の継ぎ目に、レンチの新しい傷があった|search:換気口に、詰め物がされていた|lore:この館の暖房は、各部屋の換気口がないと危険な作りだった',2);
K('時計塔の機械室','圧死','{v}は時計塔の機械室で、歯車に巻き込まれて死んでいた。','{c}は時計の修理を口実に{v}を機械室へ呼び出し、止めてあった歯車を動かした。','talk:時計の修理を{v}に頼んだのは{c}だった|search:機械室の外のレバーに、{c}の手袋の繊維が引っかかっていた|obs:時計は修理が必要なほど壊れていなかった',2);
K('館の主の書斎','毒殺','{v}は書斎で、愛用の万年筆を口にくわえたまま死んでいた。','{c}は、{v}が考えごとをするとき万年筆をくわえる癖を知っていた。','talk:{v}が万年筆をくわえる癖を知っていたのは、身近な者だけだった|obs:万年筆の尻の部分だけ、塗装が溶けていた|search:{c}の部屋のごみ箱に、薬品の染みたガーゼがあった',2);
})();
});
;
/* ==== js/yakata.js ==== */
HK.Load.def(218,'js/yakata.js',function(){
(function(){
'use strict';
var HK=window.HK,ST=HK.Story,Y=HK.YAKATA,clamp=HK.clamp;
if(!ST|| !Y|| !Y.TRICKS|| !Y.MOTIVES)return;
var T=Y.T;
function pk(S,a){return ST.pick(S,a);}
function F(t,m){return ST.fmt(t,m);}
var scen={
id:'yakata',name:'吹雪の館の殺人',kicker:'ミステリー（2〜10人）',solo:true,minCast:2,maxCast:10,
desc:'吹雪の山で遭難した一行が辿り着いた、地図にない館。電話線は切れ、橋は落ちた。その夜、最初の死体が見つかる――。探偵役は推理で犯人を追い、犯人は痕跡を消して逃げ切ろうとする。犯人・動機・現場・トリックは毎回ちがう。',
note:'※殺人の描写を含みます。登場人物はすべて成人として扱います。',
unit:'日',simulate:function(input){return run(input);},
castHint:'2人から遊べます。「役割」で探偵（ポンコツ探偵も可）を1〜4人決めてください。決めなければ、いちばん推理力の高い人が探偵になります。助手は探偵のバディになります。館の主を決めなければ、館の主は登場人物ではない人物で、最初の犠牲者になります。犯人と動機は毎回抽選です（探偵が犯人のことも）。',
env:[
{id:'days',label:'吹雪が止むまで',min:2,max:5,def:3,lo:'2日',hi:'5日',unit:'日'},
{id:'serial',label:'連続殺人の起きやすさ',min:0,max:100,def:50,lo:'一人だけ',hi:'次々に',desc:'高いほど、犯人は証拠を掴んだ人や探りを入れてきた人を口封じに殺しやすく、理由なく次を狙うこともある'},
{id:'hard',label:'トリックの難しさ',min:0,max:100,def:50,lo:'単純',hi:'難解'},
{id:'acc',label:'共犯者',type:'select',def:'random',options:[{v:'random',label:'おまかせ'},{v:'yes',label:'いる'},{v:'no',label:'いない（単独犯）'}]},
{id:'motive',label:'動機',type:'select',def:'random',options:[{v:'random',label:'おまかせ'}].concat(Y.MOTIVES.map(function(m){return{v:m.id,label:m.cat+'：'+m.label};}))}
],
stats:[{id:'wit',label:'推理力',desc:'手がかりの見つけやすさ・推理の正確さ。犯人なら痕跡の消し方のうまさ'},{id:'nerve',label:'度胸',desc:'恐怖への強さ・腕っぷし。追い詰められたときの動きに効く'}],
perFields:[{id:'role',label:'役割',auto:'おまかせ（ゲストの職業を気質から）',groups:true,options:Y.ROLES.map(function(r){return{id:r.id,label:r.label,group:r.group};})},
{id:'motive',label:'犯人になったら（動機）',auto:'おまかせ（全体の設定・抽選）',groups:true,options:Y.MOTIVES.map(function(m){return{id:m.id,label:m.label,group:m.cat};})}].concat(HK.DGK?[HK.DGK.KNOW]:[]),
actions:[],goals:[],events:[]
};
HK.SCENARIOS.yakata=scen;
var at=HK.SCEN_ORDER.indexOf('jashin');
if(HK.SCEN_ORDER.indexOf('yakata')<0)HK.SCEN_ORDER.splice(at>=0?at+1:HK.SCEN_ORDER.length,0,'yakata');
var W={lover:1,mate:1,fated:1,almost:0.8,fwb:0.45,sibling:0.8,sibprot:0.95,sibclose:0.9,parent:0.95,pparent:0.9,best:0.75,buddy:0.8,childhood:0.7,friend:0.5,mentor:0.6,master:0.6,teacher:0.5,senpai:0.4,colleague:0.3,classmate:0.4,boss:0.45,benefactor:0.6,relative:0.6,worship:0.85,fond:0.55,blind:0.75,acq:0.1,ex:0.3,rival: -0.3,enemy: -0.7,sibbad: -0.15,bad: -0.4};
function ties(S,a,b){return a&&b&&a.i!=null&&b.i!=null?S.ties.filter(function(t){return(t.a===a.i&&t.b===b.i)||(t.a===b.i&&t.b===a.i);}):[];}
function bond(S,a,b){
var best=0,neg=0;
ties(S,a,b).forEach(function(t){var w=t.type==='crush'?(t.a===a.i?0.85:0.15):W[t.type]!=null?W[t.type]:0.1;if((t.type==='enemy'||t.type==='bad')&&t.cold&&t.a!==a.i)w={none:0,normal:0.1,friend:0.5,love:0.9}[t.cold]||0;if(w>best)best=w;if(w<neg)neg=w;});
var base=best>0?best+neg*0.3:neg;
return clamp(base+((S.relD&&S.relD[rk(a,b)])||0),-1,1.2);
}
function rk(a,b){return a.i<b.i?a.i+'-'+b.i:b.i+'-'+a.i;}
function pq(S,key,p,m){var t=Y.PQ[key];return F(pk(S,t[p.persona]||t.gentle),m);}
function hasTie(S,a,b,list){return ties(S,a,b).some(function(t){return list.split(',').indexOf(t.type)>=0;});}
function kinNo(S,a,b){return ties(S,a,b).some(function(t){return!!(HK.tieNoLove&&HK.tieNoLove(t));});}
function cat(S,a,b){var w=bond(S,a,b);if(w<= -0.2)return'bad';if(hasTie(S,a,b,'lover,mate,fated,almost,crush,fwb'))return'love';if(hasTie(S,a,b,'sibling,sibprot,sibclose,sibbad,parent,pparent'))return'family';return w>=0.3?'close':'';}
function crushTo(S,a,b){return S.ties.some(function(t){return t.type==='crush'&&t.a===a.i&&t.b===b.i;});}
function pining(S,a,b){return!!(a&&b&&a!==b&&a.i!=null&&b.i!=null)&&crushTo(S,a,b)&&crushTo(S,b,a)&& !hasTie(S,a,b,'lover,mate,fated');}
function relLabel(S,a,b){
var both=a&&b&&crushTo(S,a,b)&&crushTo(S,b,a),one=false;
return ties(S,a,b).map(function(t){if(both&&t.type==='crush'){if(one)return null;one=true;return'両片想い';}return HK.tieLabel?HK.tieLabel(t):HK.TIES&&HK.TIES[t.type]?HK.TIES[t.type].label:t.type;}).filter(function(x){return x;}).join('・');
}
function role(p){return Y.ROLE[p.role]||Y.ROLE.civ;}
function skill(p,type){
var t=p.tr,w=(p.stats.wit||3),n=(p.stats.nerve||3);
var base={obs:t.a*0.45+t.caution*0.3,lore:t.a*0.5,talk:t.warmth*0.4+t.np*0.2+t.fc*0.1,med:t.a*0.15,search:t.impulse*0.25+t.fc*0.2+n*0.03,spirit:t.ac*0.15+t.np*0.1,fight:t.cp*0.2+t.aggr*0.2+n*0.06,hide:t.a*0.2+t.cold*0.3+(1-t.honesty)*0.3+t.caution*0.15}[type]||0;
var bonus=(role(p).sk||{})[type]||0;
if(type==='obs'||type==='lore'||type==='hide')bonus+=(w-3)*0.06;
if(p.acting)bonus+=p.acting;
if(type==='med'&&p.kn)bonus+=p.kn*0.22;
return clamp(base+bonus-(type!=='hide'?p.m.fear/500:0),0,1.3);
}
function alive(p){return p.alive&& !p.gone;}
function names(l){return l.map(function(p){return p.name;}).join('・');}
function inv(S){return S.P.filter(function(p){return alive(p)&&p.isDet&& !p.bound;});}
function label(day,ph){return day+'日目・'+ph;}
function lastDead(S){for(var i=S.kills.length-1;i>=0;i--)if(!S.kills[i].revived)return S.kills[i];return S.kills[S.kills.length-1];}
function vicName(S){var k0=S.kills[0];if(!k0|| !k0.revived)return S.v1.name;var k=lastDead(S);return k&& !k.revived?k.v.name:S.v1.name;}
Y.lastDead=lastDead;
function run(input){
var S=ST.state(input,'yakata'),rng=S.rng,env=S.env,P=S.P;
S.egoNotes=true;S.bondFn=bond;
S.ties=(input.ties||[]).filter(function(t){return t.a!==t.b&&t.a<P.length&&t.b<P.length&& !(HK.ngPair(P[t.a],P[t.b])&& /^(lover|fwb|mate|fated|crush|almost|ex|yan)$/.test(t.type));});
S.M=rng.pick(Y.MANSIONS);S.kills=[];S.pool=[];S.need=4;S.fake=0;S.framed=null;S.over=null;S.notes=[];
P.forEach(function(p){
var pc=(input.perChar&&input.perChar[p.i])||{},want=(pc.pick||{}).role;
p.role=Y.ROLE[want]?want:HK.weighted(rng,Object.keys(Y.AUTO),function(k){return Math.pow(Math.max(0.05,Y.AUTO[k](p.tr)),2.5);});
p.picked= !!Y.ROLE[want];
p.alive=true;p.gone=false;p.bound=false;p.isDet=p.role==='detective'||p.role==='ponkotsu';
p.m={fear:10+p.tr.ac*10,sus:15,clue:0};p.cnt={clue:0,act:0};p.buddies=[];
p.roleLabel=role(p).label;
if(HK.DGK)HK.DGK.init(rng,p,{knMin:p.role==='doctor'?2:0});
});
var dets=P.filter(function(p){return p.isDet;});
if(!dets.length){
var best=P.filter(function(p){return p.role!=='host';}).sort(function(a,b){return(b.tr.a+(b.stats.wit||3)*0.1)-(a.tr.a+(a.stats.wit||3)*0.1);})[0]||P[0];
best.role='detective';best.isDet=true;best.roleLabel='名探偵';best.autoDet=true;S.notes.push('探偵役が決められていなかったので、推理力のいちばん高い'+best.name+'が名探偵になった');
}else if(dets.length>4){
dets.slice(4).forEach(function(p){p.isDet=false;p.role='civ';p.roleLabel='一般人';});
S.notes.push('探偵は4人までなので、5人目以降は一般人として参加した');
}
dets=P.filter(function(p){return p.isDet;});
P.filter(function(p){return p.role==='assistant';}).forEach(function(a){
var d=dets.slice().sort(function(x,y){return(bond(S,a,y)*3-y.buddies.length)-(bond(S,a,x)*3-x.buddies.length);})[0];
if(d){a.buddy=d;d.buddies.push(a);}
});
var hosts=P.filter(function(p){return p.role==='host';});
hosts.slice(1).forEach(function(p){p.role='heir';p.roleLabel='館の主の親族';});
S.host=hosts[0]||{name:rng.pick(Y.HOSTS),npc:true,alive:true,i:null,tr:HK.traits({CP:16,NP:6,A:14,FC:8,AC:6}),m:{},cnt:{}};
var cands=P.slice();
var cul=HK.weighted(rng,cands,function(p){
var t=p.tr,w=0.5+t.cold*0.8+t.aggr*0.5-t.warmth*0.5+(1-t.honesty)*0.4;
w*=p.role==='detective'?0.15:p.role==='ponkotsu'?0.2:p.role==='assistant'?0.6:p.role==='host'||p.role==='heir'||p.role==='butler'?1.3:1;
return Math.max(0.05,w);
});
var tri=[];
P.forEach(function(x){if(x!==cul&&S.ties.some(function(t){return t.type==='crush'&&t.a===cul.i&&t.b===x.i;}))P.forEach(function(v){if(v!==cul&&v!==x&&hasTie(S,x,v,'lover,mate,fated,almost'))tri.push({x:x,v:v});});});
var ownMot=Y.MOTIVE[(((input.perChar&&input.perChar[cul.i])||{}).pick||{}).motive]||null;
var setMot=ownMot||Y.MOTIVE[env.motive]||null;
S.motSrc=ownMot?'（'+cul.name+'の欄で指定した動機）':Y.MOTIVE[env.motive]?'（全体の設定で指定した動機）':'';
var pz= !setMot&&Y.R18&&Y.R18.pleasure?Y.R18.pleasure(S,env,cul):null;
var mot=setMot||(pz==='yes'&&Y.MOTIVE.pleasure)||HK.weighted(rng,Y.MOTIVES,function(m){
var w=Math.max(0.05,m.fit(cul.tr))*(m.jobs&&m.jobs.split(',').indexOf(cul.role)>=0?3:1);
if(m.tie)w*=P.some(function(q){return q!==cul&&hasTie(S,cul,q,m.tie);})?3:0.25;
if(S.host.npc&& !m.host)w*=0.08;
if(m.pair&&P.length<3)w*=0.1;
if(m.id==='framesuicide')w*=0.4;
if(m.triangle)w*=tri.length&& !S.host.npc?12:0;
if(m.id==='pleasure')w*=pz==='no'?0:0.7;
if(m.id==='split'||m.id==='accident')w*=0.6;
return w;
});
S.cul=cul;S.mot=mot;cul.isCul= !mot.nobody;
if(cul.isDet){cul.fakeDet=true;cul.isDet=false;}
var wantAcc= !mot.nobody&&env.acc==='yes'||(env.acc==='random'&&P.length>=4&&rng()<(mot.pair?0.85:0.3));
if(mot.pair&&P.length>=3&& !mot.nobody)wantAcc=env.acc!=='no';
if(wantAcc&&P.length>=3){
var ac=P.filter(function(q){return q!==cul&& !q.isDet;}).sort(function(a,b){return(bond(S,b,cul)+b.tr.cold*0.3+(mot.id==='loyal'&&(b.role==='host'||hasTie(S,cul,b,'master'))?1:0))-(bond(S,a,cul)+a.tr.cold*0.3+(mot.id==='loyal'&&(a.role==='host'||hasTie(S,cul,a,'master'))?1:0));})[0];
if(ac){S.acc=ac;ac.isAcc=true;}
}
var pool=P.filter(function(q){return q!==cul&&q!==S.acc;});
if(HK.SameStory&&HK.SameStory.spare)pool=HK.SameStory.spare(S,cul,pool);
var v1;
var tr0=mot.triangle&&tri.length?rng.pick(tri):null;
if(S.host.npc)v1=S.host;
else if(tr0)v1=tr0.v;
else{
v1=HK.weighted(rng,pool,function(q){
var w=1;
if(mot.tie&&hasTie(S,cul,q,mot.tie))w*=8;
if(mot.id==='revenge'||mot.id==='impulse')w*=1+Math.max(0,-bond(S,cul,q))*6;
if(mot.id==='inherit'&&(q.role==='host'))w*=10;
if(mot.id==='blackmail'&& /reporter|lawyer|streamer/.test(q.role))w*=5;
if(mot.id==='jealous'&&(q.role===cul.role||hasTie(S,cul,q,'rival,ex,crush')))w*=6;
if(mot.id==='defense')w*=1+q.tr.aggr*3;
if(q.isDet)w*=mot.id==='fame'?0.5:0.25;
return w;
})||pool[0];
}
if(!v1)v1=S.host;
S.v1=v1;
S.x=tr0?tr0.x:mot.triangle?rng.pick(pool.filter(function(q){return q!==v1;}))||S.acc:mot.id==='mistake'?rng.pick(pool.filter(function(q){return q!==v1;}).concat(S.host.npc?[S.host]:[])):S.acc;
S.planned=(mot.serial||0)+(env.serial>70?1:0);
if(!inv(S).length)successor(S,null,true);
S.cnt0=0;
if(Y.SPEC)Y.SPEC.setup(S,input);
ST.step(S,'1日目・夕方');
ST.say(S,{kind:'phase',text:pk(S,T.ARRIVE)+'館の名は、'+S.M+'。'+(S.host.npc?F(pk(S,T.HOST_NPC),{h:S.host.name}):F(pk(S,T.HOST_PC),{h:S.host.name,m:S.M}))+pk(S,T.SEAL)+(HK.Attr&&HK.Attr.raceIntro?HK.Attr.raceIntro(P,'trapped',S):'')});
arrive(S);
if(Y.FEUD)Y.FEUD.arrive(S);
ST.snap(S,['fear','sus','clue']);
for(var day=1;day<=env.days+1&& !S.over;day++){
ST.step(S,label(day,'夜'));
ST.budget(S,4);
ST.say(S,{kind:'phase',text:pk(S,T.NIGHT)});
S.curDay=day;
nightScenes(S,day);
if(Y.SPEC)Y.SPEC.night(S,day);
if(day===1)murder(S,S.v1,day,true);
else if(day<=env.days&& !(Y.R18&&Y.R18.on(S)&&(Y.R18.night(S,day)||(Y.R18.extra&&Y.R18.extra(S,day)))))nightMurder(S,day);
ST.flushShort(S,'ほかに：');
if(S.over)break;
if(day>env.days)break;
ST.step(S,label(day+1,'朝'));
ST.budget(S,4);
discover(S,day+1);
if(Y.SPEC)Y.SPEC.revive(S,day+1,'morning');
ST.flushShort(S,'ほかに：');
if(S.over)break;
['昼','夕方'].forEach(function(ph,k){
if(S.over)return;
ST.step(S,label(day+1,ph));
ST.budget(S,4+Math.ceil(P.length/3));
if(Y.SPEC)Y.SPEC.revive(S,day+1,k?'eve':'noon');
investigate(S);
others(S);
if(Y.JOBS)Y.JOBS.tick(S,day+1,k);
if(Y.FEUD)Y.FEUD.tick(S,day+1);
bondTick(S);
flirt(S,k?'evening':'day');
culpritMove(S);
ST.flushShort(S,'ほかに：');
deduce(S,day>=env.days&&k===1);
P.forEach(function(p){if(alive(p)){p.m.fear=clamp(p.m.fear+2,0,100);p.m.clue=p.cnt.clue;}});
if(Y.SPEC)Y.SPEC.wear(S,day+1,k?'eve':'noon');
ST.snap(S,['fear','sus','clue']);
});
}
if(!S.over)finale(S);
return finish(S,input);
}
function join(l){var n=l.map(function(p){return p.name+'（'+p.roleLabel+'）';});return n.length<=2?n.join('と'):n.slice(0,-1).join('・')+'と'+n[n.length-1];}
function arrive(S){
var rng=S.rng,P=S.P,A=Y.ARR,done=[];
var seen={};
P.forEach(function(p0){
if(seen[p0.i])return;
var g=[p0],k=0;seen[p0.i]=1;
while(k<g.length){var q=g[k++];P.forEach(function(r){if(!seen[r.i]&&ties(S,q,r).length){seen[r.i]=1;g.push(r);}});}
if(g.length<2)return;
var rel=[];
g.forEach(function(a){g.forEach(function(b){if(a.i<b.i&&ties(S,a,b).length)rel.push(a.name+'と'+b.name+'（'+relLabel(S,a,b)+'）');});});
var c=cat(S,g[0],g[1]),first=ties(S,g[0],g[1])[0],kind=first&&first.type==='crush'?'crush':c||'close';
if(g.length>2)kind=g.some(function(a){return g.some(function(b){return a!==b&&bond(S,a,b)< -0.2;});})?'mixed':'many';
var x=g[0],y=g[1];
if(kind==='crush'&&pining(S,x,y))kind='pining';
if(kind==='crush'&&first.a===g[1].i){x=g[1];y=g[0];}
ST.say(S,{actors:g,tag:'一行',text:F(pk(S,A.GROUP[kind]),{n:join(g),a:x.name,b:y.name}),why:'関係のある人どうしで、一緒にやってきた：'+rel.join('／')});
g.forEach(function(p){done.push(p);});
});
P.forEach(function(p){
var pool=A.ROLE[p.role];
if(!pool||p.role==='assistant'&&p.buddy)return;
var t=F(pk(S,pool[p.top]||pool.all||pool.A||pool[Object.keys(pool)[0]]),{a:p.name});
var bud=p.buddies&&p.buddies.filter(function(b){return b.role==='assistant';});
if(bud&&bud.length)t+=F(pk(S,bud.length>1?A.BUDDY.filter(function(l){return!/「/.test(l);}):A.BUDDY),{a:p.name,b:bud.map(function(b){return b.name;}).join('と'),sensei:sensei(bud[0],p)});
ST.say(S,{actors:[p].concat(bud||[]),tag:p.roleLabel,text:p.name+'（'+p.roleLabel+'）'+t,why:'役割：'+p.roleLabel+(p.autoDet?'（推理力から）':p.picked?'（指定）':'（気質から）')+'・'+role(p).desc+(bud&&bud.length?'／助手（バディ）：'+bud.map(function(b){return b.name;}).join('・'):'')});
done.push(p);(bud||[]).forEach(function(b){done.push(b);});
});
var rest=P.filter(function(p){return done.indexOf(p)<0;}),byTop={};
rest.forEach(function(p){(byTop[p.top]=byTop[p.top]||[]).push(p);});
Object.keys(byTop).forEach(function(k){
var l=byTop[k];
ST.say(S,{actors:l,tag:'到着',text:F(pk(S,l.length>1?A.MOOD_MANY[k]||A.MOOD_MANY.AC:A.MOOD[k]||A.MOOD.AC),{n:join(l)}),why:l.map(function(p){return p.name+'：'+p.roleLabel+(p.picked?'（指定）':'（気質から）');}).join('／')+'。言い回しはいちばん強い因子（'+k+'）から'});
});
P.forEach(function(p){
if(p.role==='celeb'&&rng()<0.55+p.tr.fc*0.3-p.tr.caution*0.3){p.prank=true;ST.sayB(S,{actors:[p],tag:'企画？',text:F(Y.T.CELEB[0],{a:p.name}),why:'芸能人は、これをマーダーミステリーの企画だと思い込んだ（怖がらない）'},p.name+'は企画だと思った');}
});
S.notes.forEach(function(n){ST.say(S,{kind:'phase',text:'※'+n});});
}
function pickTrick(S){
var rng=S.rng,used=S.kills.map(function(k){return k.trick;}),hard=S.env.hard/50+1;
return HK.weighted(rng,Y.TRICKS.filter(function(t){return used.indexOf(t)<0;}),function(t){return 1/(1+Math.abs(t.diff-hard))*(Y.JOBS?Y.JOBS.trickW(S,t):1);});
}
function fmtV(S,v){
var rng=S.rng,inn=S.P.filter(function(q){return alive(q)&&q!==S.cul&&q!==v;});
return{v:v.name,c:S.cul.name,b:inn.length?rng.pick(inn).name:'館の使用人',x:S.x?S.x.name:'誰か',h:S.host.name};
}
function murder(S,v,day,first){
var tr=pickTrick(S),m=fmtV(S,v);
var k={v:v,trick:tr,day:day,m:m,nk:HK.SameStory&&HK.SameStory.note?HK.SameStory.note(S,S.cul,v):''};
S.kills.push(k);
v.alive=false;v.fate='殺された（'+day+'日目の夜・'+tr.place+'）';
var cs=tr.clues.map(function(c){return{type:c.type,t:F(c.t,m),kill:k};});
if(first){cs.forEach(function(c){S.pool.push(c);});S.pool.push({type:S.mot.clue.split(':')[0],t:F(S.mot.clue.slice(S.mot.clue.indexOf(':')+1),m),motive:true});}
else{var c1=S.rng.pick(cs);c1.extra=true;S.pool.push(c1);}
if(S.mot.sloppy&&first)S.sloppy=true;
}
function nightMurder(S,day){
var rng=S.rng,c=S.cul,sv=S.env.serial/100;
if(!alive(c)||c.bound||S.mot.nobody)return;
var found=S.pool.filter(function(x){return x.found&& !x.fake;}).length;
var live=S.P.filter(function(q){return alive(q)&&q!==c&&q!==S.acc;});
if(!live.length)return;
if(S.forceTgt){var ft=S.forceTgt;S.forceTgt=null;if(alive(ft)&& !HK.Dark.skip(S,'kill')){S.nextWhy=S.forceWhy;murder(S,ft,day,false);S.kills[S.kills.length-1].why=S.nextWhy;S.newKill=true;return;}}
var danger=function(q){return q.cnt.clue*2+(q.approached?3:0)+(q.isDet?1.5:0)+(S.mot.triangle&&q===S.x? -5:0);};
var top=live.slice().sort(function(a,b){return danger(b)-danger(a);})[0];
var threat=danger(top)>=2||found>=S.need-1||c.m.sus>60;
var plan=S.kills.length-1<S.planned;
var ch=plan?0.45+sv*0.4:threat?(0.08+sv*0.72)*(0.6+c.tr.aggr*0.3+c.tr.cold*0.3):sv*0.25;
if(live.length===1)ch*=0.5;
ch*=HK.Dark.pick(S,0.2,1,1.8,'kill');
if(S.kills.length>=5||rng()>ch)return;
var tgt,why;
if(threat&&(!plan||rng()<0.6)){tgt=top;why=top.approached?'探りを入れてきた'+top.name+'の口を封じた':top.cnt.clue?'証拠を掴んでいた'+top.name+'の口を封じた':'探偵の'+top.name+'を消そうとした';}
else if(S.acc&&alive(S.acc)&&rng()<0.15+S.cul.tr.cold*0.2){tgt=S.acc;why='共犯の'+S.acc.name+'の口を封じた';}
else{tgt=HK.weighted(rng,live,function(q){return(1+Math.max(0,-bond(S,c,q))*3-Math.max(0,bond(S,c,q))*0.8-(S.mot.triangle&&q===S.x?0.9:0))*(Y.SPEC?Y.SPEC.danger(q):1);});why=plan?'最初から次の獲物を決めていた（動機「'+S.mot.label+'」）':'連続殺人（起きやすさ '+S.env.serial+'）';}
if(!tgt)return;
if(HK.SameStory&&HK.SameStory.nk&&HK.SameStory.nk(S,c,tgt)){
var nkAlt=HK.SameStory.spare(S,c,live).filter(function(q){return q!==tgt&& !HK.SameStory.nk(S,c,q);});
if(nkAlt.length){tgt=nkAlt.sort(function(a,b){return danger(b)-danger(a);})[0];why+='（殺さないと決めた相手を避けて、'+tgt.name+'を狙った）';}
}
S.nextWhy=why;
var seer=S.P.filter(function(q){return alive(q)&&q.role==='seer'&&q!==c;})[0];
if(seer&&rng()<0.3){ST.say(S,{actors:[seer,tgt],tag:'予見',text:F(pk(S,T.SEER),{a:seer.name,b:tgt.name})+'一行は、'+tgt.name+'の部屋の前で夜通し見張りをした。',why:'占い師の予見で、犯行を防いだ',mag:24});c.m.sus=clamp(c.m.sus+8,0,100);return;}
if(Y.FEUD&&Y.FEUD.guard(S,tgt,c))return;
var guard=(tgt.isDet?tgt.buddies.filter(alive):S.P.filter(function(q){return alive(q)&&q!==c&&q!==tgt&&bond(S,q,tgt)>=0.75;})).filter(function(q){return!q.bound&& !q.mad;})[0];
if(guard&&rng()<0.45){
if(rng()<skill(guard,'fight')+0.25){
c.m.sus=clamp(c.m.sus+25,0,100);
var hint=gain(S,guard,'obs');
ST.say(S,{actors:[guard,tgt],tag:'夜襲',kind:'climax',text:'深夜、'+tgt.name+'の部屋に何者かが忍び込んだ。'+F(pk(S,T.BUDDY_SAVE),{a:tgt.name,b:guard.name})+'影は窓から逃げていった。'+(hint?'――'+hint+'。':''),why:guard.name+'が'+tgt.name+'を守った（'+(tgt.isDet?'バディ':'関係：'+relLabel(S,guard,tgt))+'）',mag:34});
return;
}
ST.say(S,{actors:[guard,tgt],tag:'夜襲',kind:'climax',text:'深夜、'+tgt.name+'の部屋に何者かが忍び込んだ。'+F(pk(S,T.BUDDY_SAVE),{a:tgt.name,b:guard.name}),why:guard.name+'が'+tgt.name+'をかばった',mag:34});
tgt=guard;
}
murder(S,tgt,day,false);
S.kills[S.kills.length-1].why=S.nextWhy;
S.newKill=true;
}
function nightScenes(S,day){
var rng=S.rng,live=S.P.filter(function(q){return alive(q)&& !q.bound;});
var pairs=[];
live.forEach(function(a){live.forEach(function(b){if(a.i<b.i&&cat(S,a,b)==='love')pairs.push([a,b]);});});
if(pairs.length&&rng()<0.5){var pr=rng.pick(pairs);pr.forEach(function(p){p.m.fear=clamp(p.m.fear-8,0,100);});ST.sayB(S,{actors:pr,tag:'夜',text:pining(S,pr[0],pr[1])&&T.PINE_NIGHT&&(!HK.Pos||HK.Pos.okSex(pr[0],pr[1]))?F(pk(S,T.PINE_NIGHT),{a:pr[0].name,b:pr[1].name}):pr[0].name+'と'+pr[1].name+(HK.Pos&& !HK.Pos.okSex(pr[0],pr[1])?'は、同じ部屋で交代に見張りをしながら夜を明かした。扉の向こうの物音に、二人で耳を澄ませた。':'は、同じ部屋で夜を明かした。互いの体温だけが、確かなものだった。'),why:'関係：'+relLabel(S,pr[0],pr[1])},pr[0].name+'と'+pr[1].name+'が寄り添った');}
var sc=live.filter(function(p){return p.m.fear>60;})[0];
if(sc&&rng()<0.5){sc.locked=true;ST.sayB(S,{actors:[sc],tag:'恐怖',text:F(pk(S,T.PANIC),{a:sc.name}),why:'恐怖 '+Math.round(sc.m.fear)},sc.name+'は閉じこもった');}
flirt(S,'night');
}
function loverPairs(S){
var live=S.P.filter(function(p){return alive(p)&& !p.bound&& !p.mad&& !p.locked;}),out=[];
live.forEach(function(a){
live.forEach(function(b){
if(a.i>=b.i)return;
if(!(hasTie(S,a,b,'lover,mate,fated')||(a.honmei===b.i&&b.honmei===a.i)))return;
if(kinNo(S,a,b)||(HK.ngPair&&HK.ngPair(a,b))||(HK.canLove&& !(HK.canLove(a,b)&&HK.canLove(b,a))))return;
out.push([a,b]);
});
});
return out;
}
function flirt(S,time){
if(!HK.Daily|| !HK.Daily.storyLove||(S.flirtN||0)>=4)return;
var ps=loverPairs(S),rng=S.rng;
if(!ps.length||rng()>0.3)return;
var pr=rng.pick(ps),x=rng()<0.5?pr[0]:pr[1],y=x===pr[0]?pr[1]:pr[0];
var r=HK.Daily.storyLove(S,'yakata',x,y,time);
if(!r)return;
S.flirtN=(S.flirtN||0)+1;
x.m.fear=clamp(x.m.fear-6,0,100);y.m.fear=clamp(y.m.fear-6,0,100);
setRel(S,x,y,0.05);
ST.sayB(S,{actors:[x,y],tag:'恋人',text:r.text,why:'恋人どうしの、つかの間の時間（'+r.label+'・関係：'+(relLabel(S,x,y)||'本命どうし')+'）。二人の恐怖が少し和らいだ'},x.name+'と'+y.name+'が寄り添った');
}
function discover(S,day){
var rng=S.rng,k=S.kills[S.kills.length-1];
if(!k||k.found){if(S.drugNight!==S.curDay)ST.say(S,{kind:'phase',text:pk(S,T.MORNING.slice(0,2))+'この夜は、何も起きなかった。'});return;}
k.found=true;
var live=S.P.filter(alive),free=live.filter(function(q){return!q.bound;}),finder=rng.pick(free.filter(function(q){return!q.isCul;}).concat(free.length?free:live))||live[0];
var t=F(pk(S,T.FIND),{a:finder.name,p:k.trick.place})+F(k.trick.scene,k.m)+'――死因は、'+k.trick.method+'だった。';
var o=ST.say(S,{actors:k.v.i!=null?[finder,k.v]:[finder],tag:'事件',kind:'climax',text:t,why:(S.kills.length===1?'最初の事件':S.kills.length+'人目の犠牲者'+(k.why?'：'+k.why+'……犯人の'+S.cul.name+'が':''))+'（現場：'+k.trick.place+'・手口：'+k.trick.method+'・トリックの難しさ '+k.trick.diff+'）'+(k.nk||''),mag:50});
ST.key(S,o,k.v.name+'の死');
live.forEach(function(p){p.m.fear=clamp(p.m.fear+(p.prank?4:18)-(p.stats.nerve||3)*2,0,100);});
live.filter(function(p){return p.prank;}).forEach(function(p){if(S.kills.length===1&& !p.sawBody){p.sawBody=1;ST.sayB(S,{actors:[p],tag:'企画？',text:F(Y.T.CELEB[1],{a:p.name}),why:'まだ企画だと思っている'},p.name+'は企画だと思っていた');}
if(S.kills.length>=2||rng()<0.5){p.prank=false;p.m.fear=clamp(p.m.fear+25,0,100);ST.sayB(S,{actors:[p],tag:'企画？',text:F(pk(S,T.CELEB_REAL),{a:p.name}),why:'本物の事件だと悟った'},p.name+'が悟った');}});
if(k.v.i!=null)live.forEach(function(q){
if(q.bound)return;
var c=cat(S,q,k.v);if(!c||c==='close'&&rng()<0.5)return;
if(c==='bad')q.m.sus=clamp(q.m.sus+15,0,100);
q.m.fear=clamp(q.m.fear+(c==='love'?20:10),0,100);
ST.say(S,{actors:[q,k.v],tag:'喪失',text:F(pk(S,(c==='love'&&pining(S,q,k.v)&&T.GRIEF.pining)||T.GRIEF[c]||T.GRIEF.close),{b:q.name,v:k.v.name}),why:'関係：'+relLabel(S,q,k.v)+(pining(S,q,k.v)?'（どちらも想いを伝えられないままだった）':'')+(c==='bad'?'（仲が悪かったので、疑いが向いた）':'')+(q.isCul?'。……'+q.name+'が犯人だ':''),mag:c==='love'?30:18});
});
if(k.v.isDet&& !inv(S).length)successor(S,k.v,false);
S.P.forEach(function(q){if(alive(q)&&q.bound&&q.fate==='濡れ衣を着せられた'&&S.kills.length>1){q.bound=false;q.fate='';q.m.sus=10;ST.say(S,{actors:[q],tag:'潔白',text:q.name+'が閉じ込められている間に、事件が起きた。'+q.name+'の疑いは晴れ、納屋の扉が開けられた。',why:'濡れ衣が晴れた',mag:26});}});
if(alive(S.cul)&& !S.mot.nobody)ST.sayB(S,{actors:[S.cul],tag:'証言',text:F(pk(S,T.ALIBI),{c:S.cul.name,v:k.v.name}),why:'犯人の工作（'+S.cul.name+'が犯人）'},S.cul.name+'の証言');
}
function sensei(as,det){
if(!as|| !det)return'先生';
var own=(as.calls&&as.calls[det.name])||as.call;
var c=own&&HK.Voice&&HK.Voice.callFor?HK.Voice.callFor(as,det):null;
return c||'先生';
}
Y.sensei=sensei;
function successor(S,dead,silent){
var rng=S.rng,live=S.P.filter(function(q){return alive(q)&& !q.isCul&& !q.isAcc&& !q.bound;});
var s=(dead?dead.buddies:[]).filter(function(q){return alive(q)&& !q.isCul&& !q.isAcc;})[0]||live.filter(function(q){return q.role==='assistant'&&(!q.buddy||q.buddy===dead|| !alive(q.buddy));})[0]||live.sort(function(a,b){return(skill(b,'obs')+skill(b,'lore'))-(skill(a,'obs')+skill(a,'lore'));})[0];
if(!s)return null;
s.isDet=true;s.heir=true;s.roleLabel=s.roleLabel+'→探偵';
if(!silent){var o=ST.say(S,{actors:dead?[s,dead]:[s],tag:'継承',kind:'climax',text:F(pk(S,dead&&(s.buddy===dead||(dead.buddies||[]).indexOf(s)>=0)?T.SUCCEED:T.SUCCEED.filter(function(l){return!/\{sensei\}/.test(l);})),{a:s.name,d:dead?dead.name:'探偵',sensei:sensei(s,dead)}),why:s.name+'が探偵役を引き継いだ'+(dead&&dead.buddies.indexOf(s)>=0?'（'+dead.name+'のバディ）':'（推理力）'),mag:36});ST.key(S,o,s.name+'が探偵を継いだ');}
else S.lateHeir=s;
return s;
}
function conceal(S,c){
var h=S.mot.nobody?skill(S.v1.i!=null?S.v1:S.cul,'hide'):skill(S.cul,'hide');
return clamp(h*0.27+(c&&c.kill?c.kill.trick.diff*0.07:0.1)+(S.acc?0.05:0)-(S.sloppy?0.15:0)+0.05+(S.env.hard-50)/250+(Y.JOBS?Y.JOBS.conceal(S,c):0),0,0.75);
}
function gain(S,p,pref){
var left=S.pool.filter(function(c){return!c.found&& !c.lost&& !c.fake;});
if(!left.length)return'';
var c=left.filter(function(x){return x.type===pref;})[0]||left[0];
c.found=true;c.by=p;p.cnt.clue++;S.cul.m.sus=clamp(S.cul.m.sus+12,0,100);
return c.t;
}
function investigate(S){
var rng=S.rng;
if(S.lateHeir){var h=S.lateHeir;S.lateHeir=null;ST.say(S,{actors:[h],tag:'探偵役',text:S.cul.name+'の推理は、どこか事件から目を逸らさせようとしているように聞こえた。'+h.name+'は手帳を開いた。「……私が、調べる｜＝｜……私が、調べます」',why:(S.cul.fakeDet?'探偵の'+S.cul.name+'が犯人なので、':'')+h.name+'が探偵役になった',mag:30});}
inv(S).filter(function(d){return!d.mad;}).forEach(function(d){
if(!alive(d))return;
var left=S.pool.filter(function(c){return!c.found&& !c.lost;});
if(!left.length)return;
var c=HK.weighted(rng,left,function(x){return 0.3+skill(d,x.type==='spirit'?'spirit':x.type);});
var bud=d.buddies.filter(function(b){return alive(b)&& !b.bound;})[0];
var sk=skill(d,c.type),ch=(0.16+sk*0.55+(bud?0.14:0))*(1-conceal(S,c))*(d.role==='ponkotsu'?0.45:1)*(S.drugNight===S.curDay&&d.drugged?0.5:1);
if(d.role==='ponkotsu'&&rng()<0.35)return ponk(S,d);
if(c.fake)ch=0.25+sk*0.4;
if(rng()<ch){
if(c.fake)return fakeFound(S,d,c,bud);
c.found=true;c.by=d;d.cnt.clue++;if(bud)bud.cnt.clue+=0.5;
S.cul.m.sus=clamp(S.cul.m.sus+12,0,100);
var n=S.pool.filter(function(x){return x.found;}).length;
var o=ST.say(S,{actors:bud?[d,bud]:[d],tag:'手がかり '+n+'/'+S.need,text:F(pk(S,T.INV[c.type]||T.INV.obs),{a:d.name,v:vicName(S)})+'――'+c.t+'。',why:d.name+'の'+{obs:'観察',lore:'知識',talk:'聞き込み',med:'検視',search:'捜索',spirit:'霊感'}[c.type]+'（'+Math.round(sk*100)+'）'+(bud?'＋バディ'+bud.name:'')+' 対 犯人の隠蔽（'+Math.round(conceal(S,c)*100)+'）',mag:22});
if(n===1)ST.key(S,o,'最初の手がかり');
var inno=S.P.filter(function(q){return alive(q)&&q!==d&&q!==S.cul&& !q.bound;});
if(inno.length&&rng()<0.16*(1.2-skill(d,'obs'))+(d.role==='ponkotsu'?0.2:0)){
var mb=S.fakeB&&alive(S.fakeB)?S.fakeB:inno.sort(function(a,b){return b.m.sus-a.m.sus;})[0];
c.misread=mb;mb.m.sus=clamp(mb.m.sus+12,0,100);
ST.sayB(S,{actors:[d,mb],tag:'読み違い',text:F(pk(S,T.MISREAD),{a:d.name,b:mb.name}),why:d.name+'は手がかりを読み違えた（観察 '+Math.round(skill(d,'obs')*100)+'）。推理が'+mb.name+'の方へずれていく'},d.name+'の読み違い');
}
if(alive(S.cul)&& !S.mot.nobody&&rng()<0.2+d.tr.impulse*0.2)approach(S,d);
return;
}
if(bud&&S.rng()<0.25)ST.sayB(S,{actors:[bud,d],tag:'バディ',text:F(pk(S,T.BUDDY),{sensei:sensei(bud,d),a:d.name,b:bud.name}),why:bud.name+'は'+d.name+'の助手'},bud.name+'が'+d.name+'を手伝った');
ST.sayB(S,{actors:[d],text:F(pk(S,T.INV[c.type]||T.INV.obs),{a:d.name,v:vicName(S)}).replace(/。$/,'')+pk(S,T.MISS),why:'犯人の隠蔽（'+Math.round(conceal(S,c)*100)+'）が上回った'},d.name+'は空振り');
});
}
function fakeFound(S,d,c,bud){
var rng=S.rng,n0=S.pool.filter(function(x){return x.found&& !x.fake;}).length;
var see=skill(d,'obs')*0.55+(bud?0.1:0)+(d.role==='prof'||d.role==='doctor'?0.1:0)-(c.cun||0.5)*0.35-(d.role==='ponkotsu'?0.3:0)-(Y.JOBS?Y.JOBS.fake(S):0);
var t=F(pk(S,T.INV[c.type]||T.INV.obs),{a:d.name,v:vicName(S)})+'――'+c.t+'。';
if(rng()<see){
c.found=true;c.fake=false;c.exposed=true;c.t=c.t+'――ただし、それは偽装だった';d.cnt.clue++;
S.cul.m.sus=clamp(S.cul.m.sus+15,0,100);if(c.b)c.b.m.sus=clamp(c.b.m.sus-15,0,100);
return ST.say(S,{actors:bud?[d,bud]:[d],tag:'偽装を見破る',kind:'climax',text:t+F(pk(S,T.FAKE_SEEN),{a:d.name,b:c.b?c.b.name:'誰か'}),why:d.name+'は偽の証拠を見破った（観察 '+Math.round(skill(d,'obs')*100)+' 対 犯人の狡猾さ '+Math.round((c.cun||0.5)*100)+'）。偽装そのものが、犯人への手がかりになった',mag:34});
}
c.found=true;c.by=d;
if(c.b)c.b.m.sus=clamp(c.b.m.sus+22,0,100);
var n=S.pool.filter(function(x){return x.found;}).length;
return ST.say(S,{actors:bud?[d,bud]:[d],tag:'手がかり '+n+'/'+S.need,text:t,why:'……これは犯人の'+S.cul.name+'が仕込んだ偽の証拠だ。'+d.name+'は見抜けなかった。推理が'+(c.b?c.b.name:'別の人')+'の方へずれていく',mag:26});
}
function approach(S,a){
var c=S.cul;
if(!alive(c)||a===c||a.approached)return;
a.approached=true;
ST.say(S,{actors:[a,c],tag:'探り',text:F(pk(S,T.APPROACH),{a:a.name,c:c.name})+F(pk(S,T.APPROACH_REACT),{a:a.name,c:c.name}),why:a.name+'は'+c.name+'を怪しんで、探りを入れた（犯人に目をつけられた）',mag:24});
}
function ponk(S,d){
var rng=S.rng,live=S.P.filter(function(q){return alive(q)&&q!==d;});
if(!live.length)return;
var r=rng();
if(r<0.2){var g=gain(S,d,'search');if(g)return ST.say(S,{actors:[d],tag:'迷推理',text:F(pk(S,T.PONK_LUCKY),{a:d.name,b:rng.pick(live).name})+'――'+g+'。',why:'ポンコツ探偵の迷推理が、たまたま当たった',mag:22});}
if(r<0.45){var f=S.pool.filter(function(c){return c.found&& !c.lost;});if(f.length){f[f.length-1].lost=true;f[f.length-1].found=false;return ST.say(S,{actors:[d],tag:'迷推理',text:F(T.PONK[1],{a:d.name}),why:'ポンコツ探偵が手がかりを台無しにした',mag:16});}}
var b=HK.weighted(rng,live,function(q){return 1+Math.max(0,-bond(S,d,q))*3;});
b.m.sus=clamp(b.m.sus+10,0,100);
ST.sayB(S,{actors:[d,b],tag:'迷推理',text:F(rng()<0.6?T.PONK[0]:T.PONK[2],{a:d.name,b:b.name}),why:'的外れな推理（'+b.name+'への疑いが少し上がった）'},d.name+'が'+b.name+'を疑った');
}
function others(S){
var rng=S.rng,v=lastDead(S);
if(v&&v.revived)v=null;
S.P.filter(function(p){return alive(p)&& !p.isDet&& !p.bound&& !p.mad;}).forEach(function(p){
if(rng()>0.3)return;
var r=p.role,g,why='';
var mk=function(pool,type,tag,w){if(p.isCul)return false;g=gain(S,p,type);if(!g)return false;ST.say(S,{actors:[p],tag:tag,text:F(pk(S,pool),{a:p.name,v:v?v.v.name:''})+'――'+g+'。',why:w,mag:20});return true;};
if(r==='doctor'&& !p.did&&v){p.did=1;if(p.isCul)return ST.sayB(S,{actors:[p],tag:'検視',text:p.name+'は検視を買って出た。「死因は見たとおり｜死因は見たとおりだ｜死因は見たとおりです」――それ以上は、何も言わなかった。',why:'医師が犯人なので、検視をごまかした'},p.name+'の検視');if(mk(T.DOCTOR,'med','検視','医師の検視'))return;}
if((r==='psychic'||r==='mage')&&v&&rng()<0.6){
if(r==='mage'&&rng()<0.3){p.m.sus=clamp(p.m.sus+12,0,100);return ST.sayB(S,{actors:[p],tag:'降霊',text:F(pk(S,T.MAGE),{a:p.name,v:v.v.name})+F(pk(S,T.MAGE_SUS),{a:p.name}),why:'魔術師は怪しまれた'},p.name+'の降霊');}
if(mk(r==='mage'?T.MAGE:T.PSYCHIC,'spirit',r==='mage'?'降霊':'霊視','死者の声（霊感）'))return;
S.cul.m.sus=clamp(S.cul.m.sus+10,0,100);
return ST.sayB(S,{actors:[p],tag:'霊視',text:F(pk(S,r==='mage'?T.MAGE:T.PSYCHIC),{a:p.name,v:v.v.name}),why:'死者は犯人の方を指した（犯人への疑い +10）'},p.name+'の霊視');
}
if(r==='streamer'&&rng()<0.5&&mk(T.STREAM,'search','映像','回しっぱなしのカメラ'))return;
if(r==='police'&&rng()<0.6){if(p.isCul)return;if(mk(T.POLICE,'talk','取り調べ','警察官の取り調べ'))return;}
if((r==='prof'||r==='occult'||r==='lawyer'||r==='writer')&&rng()<0.35&&mk(L2(p.name+'は、ふと口にした。「待って。これ、おかしくない？｜待て。これは、おかしくないか｜待ってください。これ、おかしくないですか？」'),'lore','気づき',role(p).label+'の知識'))return;
if(r==='priest'&&rng()<0.5){S.P.filter(alive).forEach(function(q){q.m.fear=clamp(q.m.fear-6,0,100);});return ST.sayB(S,{actors:[p],tag:'弔い',text:p.name+'は'+(v?v.v.name:'死者')+'のために祈りを捧げた。張りつめていた空気が、少しだけゆるんだ。',why:'神職が場を鎮めた（全員の恐怖 -6）'},p.name+'が祈った');}
if(alive(S.cul)&& !S.mot.nobody&&p!==S.cul&& !p.isAcc&&(p.cnt.clue>0||p.role==='police'||p.role==='reporter')&&S.cul.m.sus>25&&rng()<0.35)return approach(S,p);
if(!p.isCul&&alive(S.cul)&&bond(S,p,S.cul)>=0.75&&rng()<0.4){
var f=S.pool.filter(function(c){return!c.found&& !c.lost;})[0];
if(f){f.lost=true;p.knew=true;return ST.say(S,{actors:[p,S.cul],tag:'隠蔽',text:F(pk(S,T.COVER),{b:p.name,c:S.cul.name}),why:p.name+'は'+S.cul.name+'（'+relLabel(S,p,S.cul)+'）が犯人だと気づいて、かばった（手がかりが一つ失われた）',mag:30});}
}
var foe=S.P.filter(function(q){return alive(q)&&q!==p&&bond(S,p,q)< -0.2;})[0];
if(foe&&rng()<0.4){foe.m.sus=clamp(foe.m.sus+8,0,100);return ST.sayB(S,{actors:[p,foe],tag:'疑心',text:F(pk(S,T.SUSPECT),{a:p.name,b:foe.name}),why:'関係：'+relLabel(S,p,foe)},p.name+'は'+foe.name+'を疑った');}
if(p.m.fear>55&&rng()<0.4)ST.sayB(S,{actors:[p],tag:'恐怖',text:F(pk(S,T.PANIC),{a:p.name}),why:'恐怖 '+Math.round(p.m.fear)},p.name+'が怯えた');
});
}
function L2(s){return[s];}
function culpritMove(S){
var rng=S.rng,c=S.cul;
if(!alive(c)||c.bound||S.mot.nobody)return;
if(medFake(S,c))return;
var found=S.pool.filter(function(x){return x.found;}).length;
var r=rng(),live=S.P.filter(function(q){return alive(q)&&q!==c&&q!==S.acc;});
if(r<0.25+skill(c,'hide')*0.2){
var left=S.pool.filter(function(x){return!x.found&& !x.lost&& !x.fake;});
if(left.length>1&&rng()<skill(c,'hide')*0.6+(S.acc?0.15:0)){left[0].lost=true;return ST.sayB(S,{actors:S.acc?[c,S.acc]:[c],tag:'隠滅',text:F(pk(S,T.DESTROY),{c:c.name}),why:'犯人の証拠隠滅（手がかりが一つ失われた）'+(S.acc?'・共犯'+S.acc.name+'の手伝い':'')},c.name+'の隠滅');}
}
var cun=skill(c,'hide')+c.tr.a*0.3+c.tr.cold*0.2;
if(r<0.75&&live.length&&cun>0.7&&rng()<(cun-0.6)*0.5&&S.pool.filter(function(x){return x.fake;}).length<2){
var fb=S.fakeB&&alive(S.fakeB)?S.fakeB:HK.weighted(rng,live.filter(function(q){return!q.isDet;}).concat(live.filter(function(q){return q.isDet&&rng()<0.2;})),function(q){return 1+q.m.sus/25+Math.max(0,-bond(S,c,q))*2;});
if(fb){
S.fakeB=fb;
S.pool.push({type:rng.pick(['obs','search','talk']),t:F(pk(S,T.FAKE),{b:fb.name,v:S.v1.name}),fake:true,b:fb,cun:cun});
return ST.sayB(S,{actors:[c,fb],tag:'偽装',text:F(pk(S,T.FAKE_PLANT),{c:c.name,b:fb.name}),why:c.name+'は狡猾だった（隠しごとの力・A・ドライさ）。'+fb.name+'に罪を着せる偽の証拠を仕込んだ'},c.name+'が偽の証拠を仕込んだ');
}
}
if(r<0.55&&live.length&&(found>=2||rng()<0.3)){
var b=HK.weighted(rng,live.filter(function(q){return!q.isDet;}).concat(live.filter(function(q){return q.isDet;}).slice(0,0)),function(q){return 1+q.m.sus/30+Math.max(0,-bond(S,c,q))*2;})||live[0];
if(!b)return;
b.m.sus=clamp(b.m.sus+18,0,100);S.framed=b;S.fake++;
return ST.sayB(S,{actors:[c,b],tag:'工作',text:F(pk(S,T.FRAME),{c:c.name,b:b.name,v:S.v1.name}),why:'犯人が'+b.name+'に罪を着せようとした（推理を誤らせる）'},c.name+'が'+b.name+'を陥れた');
}
}
function medFake(S,c){
var rng=S.rng,k=S.kills[S.kills.length-1];
if(S.medFake|| !k|| !k.found||skill(c,'med')<0.35||rng()>0.55)return false;
S.medFake=true;
var live=S.P.filter(function(q){return alive(q)&&q!==c&&q!==S.acc&& !q.bound;});
var ex=live.slice().sort(function(a,b){return skill(b,'med')-skill(a,'med');})[0];
var strong=ex&&skill(ex,'med')>=skill(c,'med')-0.05;
if(strong&&c.tr.caution>0.55&&rng()<0.6){
ST.sayB(S,{actors:[c,ex],tag:'断念',text:c.name+'は検視を買って出ようとして、口をつぐんだ。'+ex.name+'が、すでに遺体の前に膝をついていた。',why:c.name+'の慎重さ（'+Math.round(c.tr.caution*100)+'）。検視の腕で上回る'+ex.name+'を警戒して、偽装を諦めた（'+c.name+'が犯人）'},c.name+'は偽装を諦めた');
return true;
}
var fb=HK.weighted(rng,live.filter(function(q){return!q.isDet;}).concat(live),function(q){return 1+q.m.sus/25+Math.max(0,-bond(S,c,q))*2;});
var clue={type:'med',t:'死亡推定時刻は夜中の二時ごろ。その時刻に一人でいたのは、'+(fb?fb.name:'誰か')+'だけだった',fake:true,b:fb,cun:skill(c,'med')+c.tr.a*0.3};
S.pool.push(clue);
c.m.sus=clamp(c.m.sus-15,0,100);if(fb)fb.m.sus=clamp(fb.m.sus+12,0,100);
var o=ST.say(S,{actors:fb?[c,fb]:[c],tag:'偽の検視',text:c.name+'は手慣れた様子で'+k.v.name+'の遺体を調べた。「死後硬直から見て、亡くなったのは夜中の二時ごろだね｜死後硬直から見て、死んだのは夜中の二時ごろだ｜死後硬直から見て、亡くなったのは夜中の二時ごろですね」――その時刻、'+c.name+'は皆と一緒に広間にいた。',why:c.name+'の検視の知識（'+(HK.DGK?HK.DGK.KNOW_LABEL[c.kn]:'')+'）を使った偽装。死亡推定時刻をずらして、自分のアリバイを作った（'+c.name+'が犯人）',mag:22});
if(ex&&rng()<0.25+(skill(ex,'med')-skill(c,'med'))*0.8+ex.tr.a*0.2){
clue.found=true;clue.fake=false;clue.exposed=true;clue.by=ex;clue.t='死亡推定時刻の申告は嘘だった。'+k.v.name+'が亡くなったのは、'+c.name+'が一人でいた時間だった';ex.cnt.clue++;
c.m.sus=clamp(c.m.sus+30,0,100);if(fb)fb.m.sus=clamp(fb.m.sus-12,0,100);
ST.say(S,{actors:[ex,c],tag:'偽装を見破る',kind:'climax',text:ex.name+'が首を振った。「違う。死斑はもう固定されてる。顎の硬直も進みすぎだ。亡くなったのは、もっと早い。……どうして嘘をつくの、'+c.name+'｜違う。死斑はもう固定されている。顎の硬直も進みすぎだ。死んだのは、もっと早い。……なぜ嘘をつく、'+c.name+'｜違います。死斑はもう固定されています。顎の硬直も進みすぎです。亡くなったのは、もっと早い時刻です。……'+c.name+'、どうして嘘をつくんですか」',why:ex.name+'の検視の知識が、'+c.name+'の偽装を見破った（検視 '+Math.round(skill(ex,'med')*100)+' 対 '+Math.round(skill(c,'med')*100)+'）',mag:30});
}
return true;
}
function deduce(S,last){
var rng=S.rng,ds=inv(S).filter(function(d){return!d.mad;});
if(!ds.length||S.over)return;
var real=S.pool.filter(function(x){return x.found&& !x.fake&& !x.misread;}).length;
var bad=S.pool.filter(function(x){return x.found&&(x.fake||x.misread);});
var found=real+bad.length;
var d=ds.slice().sort(function(a,b){return(skill(b,'obs')+skill(b,'lore')+(b.role==='ponkotsu'? -1:0))-(skill(a,'obs')+skill(a,'lore')+(a.role==='ponkotsu'? -1:0));})[0];
var lost=S.pool.filter(function(x){return x.lost;}).length;
var enough=found>=Math.min(S.need,S.pool.length-lost),partial=found>=S.need-1&&rng()<skill(d,'lore')*0.5+(last?0.25:0);
var ponkGo=d.role==='ponkotsu'&&rng()<(last?0.6:0.12);
if(!enough&& !partial&& !ponkGo)return;
var misled=found?bad.length/found:0;
var wrong=(enough?0.04+S.fake*0.04:partial?0.22+S.fake*0.06:0.8)+misled*(1.1-skill(d,'obs')*0.5)-skill(d,'obs')*0.05;
if(d.role==='ponkotsu')wrong+=0.3;
if(Y.JOBS)wrong+=Y.JOBS.deduce(S);
if(bad.length){var cnt={};bad.forEach(function(x){var b=x.fake?x.b:x.misread;if(b&&alive(b))cnt[b.i]=(cnt[b.i]||0)+1;});var bi=Object.keys(cnt).sort(function(a,b){return cnt[b]-cnt[a];})[0];S.misTarget=bi!=null?S.P[+bi]:null;}
var wr=rng()<clamp(wrong,0,0.95);
if(!wr&&(enough||partial)&&Y.frameTry&&Y.frameTry(S,d,partial&& !enough))return;
showdown(S,d,wr,partial&& !enough);
}
function showdown(S,d,wrong,partial){
var rng=S.rng,c=S.cul,live=S.P.filter(alive);
if(!S.noStep)ST.step(S,'推理');
S.noStep=false;
var bud=d.buddies.filter(alive)[0];
var t=F(pk(S,T.SHOW),{d:d.name});
if(S.mot.nobody&& !wrong){
S.over='nobody';
var o0=ST.say(S,{actors:[d,c],tag:'真相',kind:'climax',text:t+'「この事件に、犯人はいない。'+S.v1.name+'は、自ら命を絶った。――'+c.name+'に、罪を着せるために｜＝｜この事件に、犯人はいません。'+S.v1.name+'さんは、自ら命を絶った。――'+c.name+'さんに、罪を着せるために」',why:'動機「'+S.mot.label+'」。'+d.name+'の推理（手がかり '+found(S)+'/'+S.need+'）',mag:54});
ST.key(S,o0,'真相：自作自演');
return;
}
var target=wrong?(S.misTarget&&alive(S.misTarget)&&S.misTarget!==d&& !S.misTarget.bound?S.misTarget:S.framed&&alive(S.framed)&&S.framed!==d?S.framed:live.filter(function(q){return q!==c&&q!==d&& !q.isAcc;}).sort(function(a,b){return b.m.sus-a.m.sus;})[0]):c;
if(!target){target=c;wrong=false;}
if(wrong){
target.bound=true;target.fate='濡れ衣を着せられた';
var o=ST.say(S,{actors:[d,target],tag:'推理',kind:'climax',text:t+F(pk(S,T.ACCUSE),{d:d.name,c:target.name,v:vicName(S)})+F(pk(S,T.WRONG),{d:d.name,b:target.name})+target.name+'は、納屋に閉じ込められた。',why:d.name+'の推理は外れた（'+(target===S.misTarget?'偽の証拠や読み違えた手がかりをもとに推理を進めた':partial?'手がかりが足りないまま推し量った':d.role==='ponkotsu'?'ポンコツ探偵':'犯人の工作に引っかかった')+'）。本当の犯人は'+c.name,mag:46});
ST.key(S,o,d.name+'の推理が外れた');
S.wrongOnce=(S.wrongOnce||0)+1;
if(S.wrongOnce>=2||S.env.days<=2)S.over='wrong';
return;
}
var o2=ST.say(S,{actors:[d,c],tag:'推理',kind:'climax',text:t+pq(S,'ACCUSE',d,{d:d.name,c:c.name})+'――'+S.kills.map(function(k){return truthOf(S,k);}).join('')+F(S.mot.why,fmtV(S,S.v1)),why:d.name+'の推理'+(partial?'（手がかりが一つ足りないのを、推理で埋めた）':'')+'・手がかり '+found(S)+'/'+S.need,mag:54});
ST.key(S,o2,d.name+'が犯人を言い当てた');
var conf=F(pk(S,S.mot.confess),{x:S.x?S.x.name:''});
if(!alive(c)){
ST.say(S,{actors:[d,c],tag:'遺品',text:pk(S,[c.name+'の遺品の手帳から、走り書きが見つかった。',c.name+'の部屋の暖炉の灰の中に、燃え残った便箋があった。',c.name+'の上着の内ポケットに、折りたたんだ紙が入っていた。'])+'――「'+conf.replace(/^「|」$/g,'')+'」',why:'動機：'+S.mot.cat+'「'+S.mot.label+'」'+(S.motSrc||'')+'（犯人の'+c.name+'は、すでに亡くなっていた）',mag:40});
reveal(S,c,d);
S.over='dead';
return;
}
ST.say(S,{actors:[c],tag:'告白',text:c.name+'「'+conf.replace(/^「|」$/g,'')+'」',why:'動機：'+S.mot.cat+'「'+S.mot.label+'」'+(S.motSrc||''),mag:40});
if(S.acc&&alive(S.acc)){S.acc.bound=true;S.acc.fate='共犯として捕まった';ST.say(S,{actors:[S.acc,c],tag:'共犯',text:S.acc.name+'は、うなだれた。「……私も、手を貸した｜＝｜……私も、手を貸しました」',why:S.acc.name+'は共犯だった（'+(relLabel(S,S.acc,c)||'協力者')+'）',mag:30});}
reveal(S,c,d);
var t2=c.tr,n=c.stats.nerve||3;
var ws={arrest:0.4+t2.cp*0.3+t2.ac*0.3,suicide:0.1+t2.ac*0.3+(/mercy|despair|framesuicide/.test(S.mot.id)?0.5:0)+(S.mot.id==='loyal'?0.3:0),flee:t2.impulse*0.5+t2.fc*0.2+n*0.04,attack:t2.aggr*0.5+t2.cold*0.3+(/fame|experiment|despair/.test(S.mot.id)?0.4:0)};
if(S.mot.id==='split')ws.attack+=0.3;
ws.suicide*=HK.Dark.endings(S,'kill');ws.attack*=HK.Dark.endings(S,'kill');
var e=HK.weighted(rng,Object.keys(ws),function(k){return Math.pow(Math.max(0.03,ws[k]),2);});
if(e==='attack'&&HK.SameStory&&HK.SameStory.nk&&HK.SameStory.nk(S,c,d)){
c.bound=true;c.fate='探偵を襲いかけ、自分で手を止めた';S.over='arrest';
return ST.say(S,{actors:[c,d],tag:'結末',kind:'climax',text:F(pk(S,T.END_ATTACK),{c:c.name,d:d.name})+'――振り上げた手は、'+d.name+'の目の前で止まった。'+c.name+'は、そのまま膝をついた。翌朝、吹雪が止み、'+c.name+'は警察に引き渡された。',why:c.name+'は探偵を襲いかけたが、殺さないと決めた相手だった（殺さないの指定）',mag:46});
}
if(e==='attack'){
var stop=live.filter(function(q){return q!==c&&q!==d&& !q.bound;}).sort(function(a,b){return skill(b,'fight')+(d.buddies.indexOf(b)>=0?0.3:0)-skill(a,'fight')-(d.buddies.indexOf(a)>=0?0.3:0);})[0];
var ta=F(pk(S,T.END_ATTACK),{c:c.name,d:d.name});
if(stop&&rng()<HK.Dark.live(S,skill(stop,'fight')+0.35+(d.buddies.indexOf(stop)>=0?0.15:0),'kill')){
c.bound=true;c.fate='探偵を襲い、取り押さえられた';
S.over='arrest';
return ST.say(S,{actors:[c,d,stop],tag:'結末',kind:'climax',text:ta+F(pk(S,T.END_ATTACK_STOP),{b:stop.name,c:c.name,d:d.name})+'翌朝、吹雪が止み、'+c.name+'は警察に引き渡された。',why:c.name+'は探偵を襲った（攻撃性・ドライさ）。'+stop.name+'が止めた'+(d.buddies.indexOf(stop)>=0?'（バディ）':''),mag:50});
}
d.alive=false;d.fate='推理の場で犯人に殺された';
ST.say(S,{actors:[c,d],tag:'結末',kind:'climax',text:ta+F(pk(S,T.END_ATTACK_KILL),{d:d.name}),why:c.name+'は探偵を襲った。止められなかった',mag:52});
if(live.filter(function(q){return q!==c&&q!==d&&alive(q)&& !q.bound;}).length&&rng()<0.6){c.bound=true;c.fate='探偵を殺し、取り押さえられた';S.over='arrest';ST.say(S,{actors:[c],tag:'結末',text:'残された者たちが、一斉に'+c.name+'に飛びかかった。'+c.name+'は、ようやく動きを止めた。',why:'多勢に無勢'});return;}
c.gone=true;c.fate='探偵を殺して、吹雪の中へ消えた';S.over='flee';
return ST.say(S,{actors:[c],tag:'結末',kind:'climax',text:c.name+'は血に濡れたまま、吹雪の中へ消えていった。',why:'誰も追えなかった',mag:46});
}
if(e==='suicide'){
var lov=live.filter(function(q){return q!==c&&alive(q)&& !q.bound&&(hasTie(S,q,c,'lover,mate,fated,parent,sibprot')||bond(S,q,c)>=0.85);})[0];
if(lov&&rng()<0.5+lov.tr.np*0.3){c.bound=true;c.fate='逮捕された（'+lov.name+'に止められた）';S.over='arrest';return ST.say(S,{actors:[c,lov],tag:'結末',kind:'climax',text:pq(S,'SUICIDE',c,{c:c.name})+F(pk(S,Y.STOPLOVE),{b:lov.name,c:c.name})+'翌朝、吹雪の止んだ館に、警察が到着した。',why:c.name+'は命を絶とうとしたが、'+lov.name+'（'+(relLabel(S,lov,c)||'深まった絆')+'）が止めた',mag:52});}
}
if(e==='suicide'){c.alive=false;c.fate='自ら命を絶った';S.over='suicide';return ST.say(S,{actors:[c,d],tag:'結末',kind:'climax',text:pq(S,'SUICIDE',c,{c:c.name})+F(rng()<0.5?'次の瞬間、{c}は隠し持っていた小瓶をあおった。誰も、止められなかった。':'{c}は窓を開け放ち、吹雪の中へ身を投げた。下は、底の見えない崖だった。',{c:c.name}),why:c.name+'は、裁かれる前に自ら終わらせた',mag:50});}
if(e==='flee'){c.gone=true;c.fate='吹雪の中へ姿をくらました';S.over='flee';return ST.say(S,{actors:[c],tag:'結末',kind:'climax',text:pq(S,'FLEE',c,{c:c.name})+F(pk(S,T.END_FLEE),{c:c.name}),why:c.name+'は逃げた（衝動性・FC）',mag:48});}
c.bound=true;c.fate='逮捕された';S.over='arrest';
ST.say(S,{actors:[c],tag:'結末',kind:'climax',text:F(pk(S,T.END_ARREST),{c:c.name}),why:c.name+'は観念した',mag:46});
}
function truthOf(S,k){
var m={};for(var x in k.m)m[x]=k.m[x];if(S.mot.nobody)m.c=k.v.name;
var t=F(k.trick.truth,m);
if(k.revived&&k.v)t+=pk(S,['もっとも、'+k.v.name+'はそのあと、何事もなかったように起き上がったのだが。','――その'+k.v.name+'が、翌朝には息を吹き返していたことを除けば。','殺したはずの'+k.v.name+'が蘇ったことが、計画の唯一の誤算だった。']);
return t;
}
Y.truthOf=truthOf;
Y.gainClue=function(S,p,pref){return gain(S,p,pref);};
Y.investigators=function(S){return inv(S).filter(function(d){return!d.mad;});};
function found(S){return S.pool.filter(function(x){return x.found;}).length;}
function reveal(S,c,d){
var rng=S.rng,n=0;
var qs=S.P.filter(function(q){return alive(q)&&q!==c&& !q.isAcc&& !q.knew&&q!==d||(q===d&&c.buddy===d);})
.filter(function(q){return Math.abs(bond(S,q,c))>=0.3||(c.buddies||[]).indexOf(q)>=0||c.buddy===q;})
.sort(function(a,b){return Math.abs(bond(S,b,c))-Math.abs(bond(S,a,c));});
qs.slice(0,3).forEach(function(q){
var k=(c.buddies||[]).indexOf(q)>=0?'buddy':c.buddy===q&&Y.REVEAL.buddyRev?'buddyRev':c.buddy===q?'buddy':pining(S,q,c)&&Y.REVEAL.pining?'pining':S.ties.some(function(t){return t.type==='crush'&&t.a===q.i&&t.b===c.i;})?'crush':hasTie(S,q,c,'lover,mate,fated,almost,fwb')?'love':hasTie(S,q,c,'sibling,sibprot,sibclose,sibbad,parent,pparent')?'family':bond(S,q,c)<0?'bad': !ties(S,q,c).length?'trust':'close';
q.m.fear=clamp(q.m.fear+(k==='bad'?0:20),0,100);
ST.say(S,{actors:alive(c)?[q,c]:[q],tag:'動揺',text:F(pk(S,Y.REVEAL[k]),{b:q.name,c:c.name,sensei:sensei(q,c)}),why:q.name+'は真相を知らなかった（'+(relLabel(S,q,c)||(S.relLab&&S.relLab[rk(q,c)])||'館で深まった関係')+'）',mag:k==='bad'?20:36});
});
if(HK.SameStory&&HK.SameStory.reveal)HK.SameStory.reveal(S,c,d);
}
function setRel(S,a,b,d,lab,dir){
S.relD=S.relD||{};S.relLab=S.relLab||{};S.relDir=S.relDir||{};
var k=rk(a,b);
S.relD[k]=clamp((S.relD[k]||0)+d,-1,1);if(lab)S.relLab[k]=lab;
if(dir)S.relDir[k]=dir.i;else delete S.relDir[k];
}
function bondTick(S){
var rng=S.rng,live=S.P.filter(function(p){return alive(p)&& !p.bound;});
if(live.length<2||rng()>0.65)return;
var B=Y.BOND,last=lastDead(S);
if(last&&last.revived)last=null;
var opts=[];
live.forEach(function(a){
live.forEach(function(b){
if(a===b)return;
var w=bond(S,a,b),lover=hasTie(S,a,b,'lover,mate,fated');
if(a.i<b.i){
if(w< -0.1){opts.push([a,b,'quarrel',0.6]);opts.push([a,b,'makeup',0.25+a.tr.np*0.3]);}
else{opts.push([a,b,'talk',0.5+a.tr.np*0.3+b.tr.np*0.3]);opts.push([a,b,'team',(a.isDet||b.isDet)?0.2:0.4]);}
if(last&&last.v.i!=null&&bond(S,a,last.v)>=0.3&&bond(S,b,last.v)>=0.3)opts.push([a,b,'shared',1.2]);
if(pining(S,a,b)&&B.pine)opts.push([a,b,'pine',0.7]);
}
if(w>= -0.1&&b.m.fear>45)opts.push([a,b,'protect',0.4+a.tr.np*0.5]);
if(w>=0.3&& !lover&& !kinNo(S,a,b)&&(!HK.canLove||HK.canLove(a,b))&&(!HK.Poly||HK.Poly.storyCan(S,a,b))&& !S.confessed)opts.push([a,b,'confess',0.3+a.tr.fc*0.4+w*0.5]);
if(b===S.cul&&a!==S.cul&&skill(a,'obs')>0.5)opts.push([a,b,'distrust',0.4]);
});
});
if(!opts.length)return;
var o=HK.weighted(rng,opts,function(x){return x[3];}),a=o[0],b=o[1],k=o[2];
var pin=(k==='confess'||k==='pine')&&pining(S,a,b)&&B.pconfess;
var m={a:a.name,b:b.name,v:last?last.v.name:''},t=F(pk(S,k==='confess'&&pin?B.pconfess:B[k]),m),why='';
if(k==='pine'){setRel(S,a,b,0.05);why='両片想い：どちらも、相手は自分を何とも思っていないと思い込んでいる';}
if(k==='talk'){setRel(S,a,b,0.15,'打ち解けた');why='夜の語らいで、距離が縮まった';}
if(k==='protect'){setRel(S,a,b,0.2,'信頼',a);b.m.fear=clamp(b.m.fear-12,0,100);why=a.name+'は怯える'+b.name+'を放っておけなかった（NP）';}
if(k==='team'){setRel(S,a,b,0.15,'協力');why='二人で調べるうちに、息が合ってきた';}
if(k==='shared'){setRel(S,a,b,0.2,'支え合う');why='同じ人を失った者どうし';}
if(k==='quarrel'){setRel(S,a,b,-0.15,'険悪');a.m.sus=clamp(a.m.sus+5,0,100);b.m.sus=clamp(b.m.sus+5,0,100);why='疑心暗鬼が、二人の仲をこじらせた';}
if(k==='makeup'){setRel(S,a,b,0.3,'和解');why='命がかかって、意地を張るのをやめた';}
if(k==='distrust'){setRel(S,a,b,-0.2,'不信',a);b.m.sus=clamp(b.m.sus+8,0,100);why=a.name+'の観察眼が、'+b.name+'の綻びを捉えた'+(b===S.cul?'（……'+b.name+'は犯人だ）':'');}
if(k==='confess'){
S.confessed=true;
var yes=pin||rng()<0.25+bond(S,b,a)*0.5+b.tr.warmth*0.2;
t+=F(pk(S,pin?B.pyes:yes?B.yes:B.no),m);
if(yes){S.ties.push({a:a.i,b:b.i,type:'lover',born:true});setRel(S,a,b,0.2,'恋人');why=pin?'両片想いが、吹雪の館でやっと通じた（どちらも、自分だけの片想いだと思っていた）':'吹雪の館で、恋が実った';}
else{S.ties.push({a:a.i,b:b.i,type:'crush',born:true});setRel(S,a,b,-0.05,'片想い',a);why='想いは届かなかった';}
if(a===S.cul||b===S.cul)why+='（……'+S.cul.name+'は犯人だ）';
var o2=ST.say(S,{actors:[a,b],tag:'想いを告げる',kind:'climax',text:t,why:why,mag:32});ST.key(S,o2,a.name+'が'+b.name+'に告白');return;
}
ST.sayB(S,{actors:[a,b],tag:'関係',text:t,why:why+'（'+a.name+'×'+b.name+'）'},a.name+'と'+b.name);
}
function relmap(S){
var P=S.P,edges=[],seen={};
function add(a,b,label,cls,dir){var k=rk(P[a],P[b])+label;if(seen[k])return;seen[k]=1;edges.push({a:a,b:b,label:label,cls:cls,dir:dir});}
var CLS={lover:'love',sibbad:'enemy',bad:'enemy',mate:'love',fated:'love',almost:'love',fwb:'night',crush:'pine',enemy:'enemy',rival:'enemy',ex:'obsess',buddy:'partner',best:'friend',friend:'friend',childhood:'friend',sibling:'guard',sibprot:'guard',sibclose:'guard',parent:'guard',pparent:'guard',master:'partner',mentor:'partner',teacher:'partner',senpai:'friend',colleague:'friend',classmate:'friend',boss:'partner',benefactor:'guard',relative:'guard',worship:'guard',fond:'friend',blind:'guard',acq:'none'};
S.ties.forEach(function(t){
if(t.type==='crush'&&crushTo(S,P[t.b],P[t.a]))return add(Math.min(t.a,t.b),Math.max(t.a,t.b),(t.born?'★':'')+'両片想い','pine',null);
var lab=HK.tieLabel?HK.tieLabel(t):HK.TIES&&HK.TIES[t.type]?HK.TIES[t.type].label:t.type;add(t.a,t.b,(t.born?'★':'')+lab,CLS[t.type]||'friend',t.type==='crush'||(HK.TIES&&HK.TIES[t.type]&&HK.TIES[t.type].dir)?t.a:null);});
Object.keys(S.relLab||{}).forEach(function(k){
var ab=k.split('-'),a= +ab[0],b= +ab[1],lab=S.relLab[k];
if(lab==='恋人'||lab==='片想い')return;
var cls= /険悪/.test(lab)?'enemy': /不信/.test(lab)?'obsess': /信頼|支え合う|和解/.test(lab)?'guard': /協力/.test(lab)?'partner':'friend';
add(a,b,'★'+lab,cls,S.relDir[k]!=null?S.relDir[k]:null);
});
S.P.forEach(function(p){if(p.buddy&& !ties(S,p,p.buddy).length)add(p.i,p.buddy.i,'助手','partner',p.i);});
S.kills.forEach(function(k){if(k.v.i!=null&& !S.mot.nobody)add(S.cul.i,k.v.i,'殺害','kill',S.cul.i);});
if(S.acc)add(S.acc.i,S.cul.i,'共犯','kill',null);
return{
nodes:P.map(function(p){return{i:p.i,name:p.name,sub:p.roleLabel+(p.isCul?'・犯人':p.isAcc?'・共犯':''),dead: !p.alive,fate:p.fate};}),
edges:edges,note:'★は館で生まれた・変わった関係。矢印は気持ちや行為の向き。'+(S.host.npc?'館の主（'+S.host.name+'）は図に入っていない。':'')
};
}
function finale(S){
var c=S.cul;
ST.step(S,'吹雪が止んだ朝');
if(!inv(S).length&&alive(c)){
S.over='free';
ST.say(S,{actors:[c],tag:'結末',kind:'climax',text:'探偵役は、もう誰も残っていなかった。'+F(pk(S,T.END_FREE),{c:c.name,m:S.M}),why:'犯人は探偵役をすべて退けた',mag:50});
return;
}
S.over=S.wrongOnce?'wrong':'escape';
if(S.mot.nobody){S.over='nobody_x';ST.say(S,{kind:'phase',tag:'結末',text:'吹雪が止み、警察が到着した。事件は、'+c.name+'の犯行として処理された。――真相は、'+S.v1.name+'の自作自演だった。',why:'誰も真相にたどり着けなかった'});return;}
if(alive(c))ST.say(S,{actors:[c],tag:'結末',kind:'climax',text:F(pk(S,T.END_ESCAPE),{c:c.name}),why:'手がかり '+found(S)+'/'+S.need+'。犯人は逃げおおせた',mag:50});
}
function finish(S,input){
var P=S.P,c=S.cul,mot=S.mot;
P.forEach(function(p){
if(!p.fate)p.fate=alive(p)?(p.bound?'拘束された':'生き延びた'):p.gone?'行方不明':'死亡';
p.notes.push('役割：'+p.roleLabel+(p.buddy?'（'+p.buddy.name+'のバディ）':'')+(p.isCul?'・犯人':p.isAcc?'・共犯':''));
p.notes.push('見つけた手がかり '+p.cnt.clue+'つ・恐怖 '+Math.round(p.m.fear)+(HK.DGK&&p.kn?'・検死の知識：'+HK.DGK.KNOW_LABEL[p.kn]:''));
if(Y.SPEC&&Y.SPEC.note(p))p.notes.push(Y.SPEC.note(p));
});
var titles={
arrest:c.name+'が犯人だった。――逮捕',dead:c.name+'が犯人だった。――真相が明かされたとき、もうこの世にいなかった',suicide:c.name+'が犯人だった。――自ら命を絶った',flee:c.name+'が犯人だった。――吹雪の中へ消えた',
wrong:S.mot.nobody?'推理は外れた。'+c.name+'は、'+S.v1.name+'の仕組んだ罠にはまった':'推理は外れた。真犯人の'+c.name+'は逃げおおせた',escape:'事件は解かれなかった。犯人の'+c.name+'は、何食わぬ顔で館を去った',free:'探偵役は全滅した。'+c.name+'の完全犯罪',nobody:'犯人はいなかった。――'+S.v1.name+'の自作自演'
};
titles.nobody_x='事件は'+c.name+'の犯行として処理された。真相は、'+S.v1.name+'の自作自演';
if(false)titles.nobody='事件は'+c.name+'の犯行として処理された。真相は、'+S.v1.name+'の自作自演';
var title=titles[S.over]||titles.escape;
var lines=P.map(function(p){return p.name+'（'+p.roleLabel+'）：'+p.fate;});
if(S.host.npc)lines.push(S.host.name+'（館の主）：'+(S.host.fate||'生き延びた'));
lines.push('動機：'+mot.cat+'「'+mot.label+'」――'+F(mot.why,fmtV(S,S.v1)));
S.kills.forEach(function(k,i){lines.push((i+1)+'人目：'+k.v.name+'（'+k.trick.place+'・'+k.trick.method+'）――'+truthOf(S,k));});
if(S.acc)lines.push('共犯：'+S.acc.name);
(S.extraKills||[]).forEach(function(x){lines.push('事件とは別の殺人：'+x.a.name+'が、憎んでいた'+x.b.name+'を手にかけた');});
var rows=P.map(function(p){return{i:p.i,rank:'',cells:[p.roleLabel,p.isCul?'犯人':p.isAcc?'共犯':S.kills.some(function(k){return k.v===p&& !k.revived;})?'被害者':S.kills.some(function(k){return k.v===p;})?'蘇った'+(p.isDet?'探偵役':''):p.isDet?'探偵役':'',p.cnt.clue?Math.round(p.cnt.clue)+'つ':'―',Math.round(p.m.sus)+'',p.fate]};});
var buddyMap={};S.P.forEach(function(p){if(p.role==='assistant'&&p.buddy)buddyMap[p.i]=p.buddy.i;});
var res0=ST.result(S,input,{
ending:{title:title,kind: /arrest|suicide|nobody|dead/.test(S.over)?'ok':'over',lines:lines},
estats:[['犯人',c.name+(S.acc?'（共犯：'+S.acc.name+'）':'')],['動機',mot.label],['犠牲者',S.kills.filter(function(k){return!k.revived;}).length+'人'+(S.kills.some(function(k){return k.revived;})?'（ほかに蘇った人 '+S.kills.filter(function(k){return k.revived;}).length+'）':'')],['手がかり',found(S)+'/'+S.need],['館',S.M]],
table:{title:'館にいた人々',hint:'疑い：一行からの疑いの強さ。犯人は痕跡が見つかるほど上がり、罪を着せられた人も上がる。',cols:['役割','立場','手がかり','疑い','結末'],rows:rows},
meters:[{label:'恐怖',color:'--love'},{label:'疑い',color:'--enemy',dash:true},{label:'手がかり',color:'--accent',max:4}],
relmap:relmap(S),
meta:S.M+'・吹雪'+S.env.days+'日',
summary:'吹雪の館の殺人：'+title
});
res0.yakataBuddy=buddyMap;
return res0;
}
Y.cat=cat;Y.showdown=showdown;Y.kinNo=kinNo;
Y.gain=gain;Y.inv=inv;
Y.skill=skill;Y.bond=bond;Y.setRel=setRel;Y.relLabel=relLabel;Y.alive=alive;Y.pining=pining;
})();
});
;
/* ==== js/yakata-special.js ==== */
HK.Load.def(219,'js/yakata-special.js',function(){
(function(){
'use strict';
var HK=window.HK,Y=HK.YAKATA,SP=HK.Special,ST=HK.Story;
if(!Y|| !SP|| !ST)return;
function clamp(v,a,b){return Math.max(a,Math.min(b,v));}
var NOTE=['{a}は、自分を殺した相手の顔を覚えていなかった。暗がりで、背後から襲われたのだ。','{a}は首をさすりながら言った。「……誰にやられたのかは、分からない｜＝｜……誰にやられたのかは、分かりません」'];
function adapter(S,h){
var A=S.spA;
if(!A)A=S.spA={
rng:S.rng,all:S.P,env:S.env,scenId:'yakata',
r18: !!(Y.R18&&Y.R18.on(S)),lewd:clamp((S.env.ylewd||0)/100,0.15,0.85),
alive:function(p){return!!p.alive;},
here:function(p){return!p.gone&& !p.bound;},
say:function(o){
var a0=o.actors[0];
var kk=o.tag==='蘇生'?S.kills.filter(function(k){return k.v===a0&& !k.revived;})[0]:null;
if(kk)o.text+=NOTE[Math.floor(S.rng()*NOTE.length)].replace(/\{a\}/g,a0.name);
var r=o.short&&S.room!=null?ST.sayB(S,o,o.short):ST.say(S,o);
if(o.key&&r)ST.key(S,r,o.key);
if(kk){kk.revived=true;a0.spRevealed=true;reactRevive(S,a0);}
return r;
},
hp:function(p){return p.hpS==null?100:p.hpS;},
setHp:function(p,v){p.hpS=clamp(v,0,100);},
full:function(){return 100;},
stress:function(p){return p.m.fear;},
addStress:function(p,v){p.m.fear=clamp(p.m.fear+v,0,100);},
rel:function(a,b){return{love:Y.cat(S,a,b)==='love',w:Y.bond(S,a,b)};},
revive:function(p){p.alive=true;p.fate='';},
kill:function(p,how,text,by){
p.alive=false;p.fate=how+'死亡（'+S.curDay+'日目）';
if(by)(S.extraKills=S.extraKills||[]).push({a:by,b:p});
var o=ST.say(S,{actors:by?[by,p]:[p],tag:'死',kind:'climax',text:text,why:how+'命を落とした',mag:40});
ST.key(S,o,p.name+'の死');
},
zombie:function(){return false;}
};
A.nowH=h;
return A;
}
var CUL={
cold:['{c}は、眉ひとつ動かさなかった。ただ、カップを持つ指先だけが白くなっていた。','{c}は「よかった｜＝｜よかったです」とだけ言った。その声は、ほかの誰よりも落ち着いていた。','{c}は窓の外の吹雪に目をやったまま、{a}のほうを一度も見なかった。'],
shaken:['{c}の手から、持っていたものが床に落ちた。{c}は慌てて拾い上げ、「驚いて」とだけ言った。','{c}の顔から、さっと血の気が引いた。誰よりも早く、{c}はその場を離れた。','{c}は「嘘だろ｜嘘だろう｜嘘でしょう」と呟きかけて、口をつぐんだ。その一言を、何人かが聞いていた。'],
check:['夜更け、{c}は{a}の部屋の前で長いこと立ち止まっていた。足音に気づいて、{c}は何も言わずに去った。','{c}は、{a}に「本当に何も覚えてないの？｜本当に何も覚えていないのか｜本当に何も覚えていないんですか」と、二度も確かめた。','{c}は、蘇った{a}の首筋の傷を、じっと見つめていた。その目は、心配しているようには見えなかった。']
};
var CLUE=['{a}の話を聞いた{d}は、手帳に何かを書き足した。――{t}','{d}は{a}に、襲われた時刻と場所を繰り返し尋ねた。――{t}','「顔は見てない。でも、匂いだけは覚えてる｜顔は見ていない。だが、匂いだけは覚えている｜顔は見ていません。でも、匂いだけは覚えています」{a}の一言で、{d}は一つの線を引いた。――{t}'];
var OUT={
surprise:['{b}は持っていたカップを取り落とした。床に広がる紅茶にも気づかず、{b}は{a}の顔を見つめ続けた。{b}「嘘……さっきまで、冷たくなってたのに｜嘘だ……さっきまで、冷たくなっていたはずだ｜嘘です……さっきまで、冷たくなっていたはずです」',
'{b}は二、三歩あとずさって、壁に背中をぶつけた。{b}「どういうこと？　あなた、死んでたよね？｜どういうことだ。あなたは死んでいたはずだ｜どういうことですか。あなたは、亡くなっていたはずです」',
'{b}は{a}の手首に触れ、脈を確かめた。指先に伝わる鼓動に、{b}の顔から血の気が引いた。{b}「……動いてる。本当に、生きてる｜……動いている。本当に、生きている｜……動いています。本当に、生きています」'],
question:['{b}は{a}の前に立ちはだかった。{b}「説明して。あなたは、いったい何なの？｜説明しろ。あなたは、いったい何者だ｜説明してください。あなたは、いったい何者なんですか」',
'{b}は{a}の首筋の傷を指さした。{b}「その傷で生きていられる人間はいない。……正直に話して｜その傷で生きていられる人間はいない。……正直に話せ｜その傷で生きていられる人間はいません。……正直に話してください」',
'{b}は腕を組み、{a}をまっすぐに見据えた。{b}「隠していたことがあるなら、今のうちに全部話して｜隠していたことがあるなら、今のうちに全部話せ｜隠していたことがあるなら、今のうちに全部話してください」'],
defend:['{b}は、{a}を囲む皆のあいだに割って入った。{b}「何者だっていい。生きててくれたなら、それでいい｜何者でもかまわない。生きていてくれたなら、それでいい｜何者でもかまいません。生きていてくれたなら、それでいいんです」',
'{b}は{a}の肩に自分の上着をかけた。{b}「寒かったよね。……話は、あとで聞く｜寒かっただろう。……話は、あとで聞く｜寒かったでしょう。……お話は、あとで聞きます」',
'{b}は、疑いの目を向ける皆を振り返った。{b}「この人は殺されたんだよ。疑うなら、殺した人のほうでしょう｜この人は殺されたんだ。疑うなら、殺した側のほうだろう｜この人は殺されたんです。疑うなら、殺した人のほうでしょう」'],
doubt:['{b}は、蘇った{a}から一歩離れた。{b}「死んだふりだったんじゃないの？　最初から、全部｜死んだふりだったのではないか。最初から、全部｜死んだふりだったんじゃないですか。最初から、全部」',
'{b}は誰にも聞こえないように呟いた。{b}「死なない人間なら、人を殺すのも怖くないよね｜死なない人間なら、人を殺すのも怖くないだろう｜死なない人間なら、人を殺すのも怖くないはずです」',
'{b}は{a}の顔をじっと見つめたまま、テーブルの燭台を引き寄せた。{b}「……近づかないで｜……近づくな｜……近づかないでください」']
};
var OUT_ME={
immortal:['{a}は首をさすり、困ったように笑った。{a}「……私は、死ねない体なんだ。黙っていて、悪かった｜……私は、死ねない体なのだ。黙っていて、すまなかった｜……私は、死ねない体なんです。黙っていて、すみませんでした」',
'{a}は、ゆっくりと目を伏せた。{a}「何度死んでも、こうして戻ってくる。……だから、言えなかった｜＝｜何度死んでも、こうして戻ってくるんです。……だから、言えませんでした」',
'{a}は乾いた血のついた襟を見下ろした。{a}「信じてもらえないと思った。私は、死なないんだ｜信じてもらえないと思った。私は、死なないのだ｜信じてもらえないと思いました。私は、死なないんです」'],
vampire:['{a}は口元を手で覆った。指の隙間から、鋭い牙がのぞいていた。{a}「……私は、人の血で生きるものだ。でも、あなたたちを襲うつもりはない｜＝｜……私は、人の血で生きるものです。でも、あなたたちを襲うつもりはありません」',
'{a}は窓の外の吹雪に目をやった。{a}「夜の生き物は、簡単には死なない。……知られたくなかった｜夜の生き物は、簡単には死なない。……知られたくはなかった｜夜の生き物は、簡単には死にません。……知られたくなかったんです」',
'{a}は青白い指先で、閉じかけた傷をなぞった。{a}「怖がらせてごめん。私は、吸血鬼なんだ｜怖がらせてすまない。私は、吸血鬼だ｜怖がらせてごめんなさい。私は、吸血鬼なんです」']
};
var DED={
clear:['{d}は手帳に一行を書き足した。――{a}は確かに一度殺された。犯人が、自分の手で殺した相手をわざわざ蘇らせる理由はない。{d}は、{a}の名前を容疑者の欄から消した。',
'{d}は、蘇った{a}の首の傷をもう一度確かめた。背後から、迷いのない一撃だった。{d}「あなたは犯人じゃない。殺された側だ｜あなたは犯人ではない。殺された側だ｜あなたは犯人ではありません。殺された側です」',
'{d}は皆を見回した。{d}「死んだはずの人が生きている。つまり犯人は、それを知らずに殺した。……犯人は、この中の別の誰かだ｜＝｜死んだはずの人が生きています。つまり犯人は、それを知らずに殺した。……犯人は、この中の別の誰かです」'],
doubt:['{d}は、蘇った{a}から目を離さなかった。死んだはずの人間が、平然とそこに立っている。{d}「……死んだふりだったのかもしれない。少なくとも、死を怖がる理由はない｜……死んだふりだったのかもしれない。少なくとも、死を恐れる理由はない｜……死んだふりだったのかもしれません。少なくとも、死を怖がる理由はありません」',
'{d}は手帳の容疑者の欄に、{a}の名前を書き加えた。殺されても死なない人間なら、自分を被害者に見せかけることもできる。{d}は、その考えを誰にも言わずにおいた。',
'{d}は{a}に聞こえないように、皆に囁いた。{d}「死なない体なら、自分を被害者にして疑いを逸らせる。……気をつけて｜死なない体なら、自分を被害者にして疑いを逸らせる。……気をつけろ｜死なない体なら、自分を被害者にして疑いを逸らせます。……気をつけてください」']
};
var P2K={proud:'question',stern:'question',tsun:'surprise',gentle:'defend',devoted:'defend',cool:'doubt',free:'surprise',shy:'surprise',polite:'doubt'};
function pk3(S,l){return l[Math.floor(S.rng()*l.length)];}
function outed(S,a){
if(a.ykOuted)return;
a.ykOuted=true;
var rng=S.rng,F=function(t,v){return ST.fmt(t,v);},c=S.cul;
var obs=S.P.filter(function(q){return q!==a&&q!==c&&q.alive&& !q.gone&& !q.bound&& !q.mad;})
.sort(function(x,y){return Math.abs(Y.bond(S,y,a))-Math.abs(Y.bond(S,x,a));}).slice(0,1+(rng()<0.5?1:0));
if(!obs.length)return;
var kinds=[];
var t=obs.map(function(b){
var per=(HK.personaOf?HK.personaOf(b):b.persona)||'gentle',k=P2K[per]||'surprise',ct=Y.cat(S,b,a),w=Y.bond(S,b,a);
if(ct==='love'||ct==='family'||w>=0.6)k='defend';
else if(ct==='bad'||w<= -0.2)k='doubt';
else if(b.isDet&&k!=='doubt')k='question';
kinds.push(k);
if(k==='doubt')a.m.sus=clamp((a.m.sus||0)+8,0,100);
if(k==='defend')a.m.fear=clamp((a.m.fear||0)-6,0,100);
return F(pk3(S,OUT[k]),{a:a.name,b:b.name});
}).join('');
t+=F(pk3(S,OUT_ME[a.spec]||OUT_ME.immortal),{a:a.name});
var lab={surprise:'驚く',question:'問い詰める',defend:'かばう',doubt:'疑う'};
var o=ST.say(S,{actors:[a].concat(obs),tag:'正体',kind:'climax',text:t,why:a.name+'の正体（'+SP.LABEL[a.spec]+'）が皆に知られた。'+obs.map(function(b,i){return b.name+'：'+lab[kinds[i]];}).join('・')+'（見た人の態度と関係で）',mag:30});
ST.key(S,o,a.name+'の正体が知られた');
var ds=Y.investigators?Y.investigators(S).filter(function(d){return d!==a&&d!==c&& !d.bound;}):[];
var d=ds[0];
if(!d)return;
var pd=0.3+(d.tr.caution||0)*0.3-Y.skill(d,'obs')*0.25+kinds.filter(function(k){return k==='doubt';}).length*0.15-kinds.filter(function(k){return k==='defend';}).length*0.1;
var dk=rng()<clamp(pd,0.08,0.85)?'doubt':'clear',isC=a===c&& !S.mot.nobody,why;
if(dk==='clear'){
a.m.sus=clamp((a.m.sus||0)-15,0,100);
if(!isC&&c&& !S.mot.nobody&&Y.alive(c)){S.pool.push({type:'talk',t:'死んだはずの'+a.name+'が生きていると分かったとき、喜ぶより先に顔色を変えた者が一人だけいた'});why='蘇った'+a.name+'は被害者なので、容疑から外れた。「死んだはずの人が生きている」ことが、犯人を探す手がかりになった';}
else why='蘇った'+a.name+'は被害者だとして、容疑から外れた'+(isC?'（……'+a.name+'こそが犯人だ。犯人が殺されて蘇った）':'');
}else{
a.m.sus=clamp((a.m.sus||0)+18,0,100);
if(isC){S.pool.push({type:'obs',t:'死んでも死なない'+a.name+'なら、自分を被害者に見せかけることもできた',found:true,by:d});d.cnt.clue++;why=d.name+'は、死んだふりを疑った。……'+a.name+'こそが犯人だ（正しい疑い）';}
else{S.pool.push({type:'obs',t:'死んだはずの'+a.name+'が生きていた――殺されたふりだったのかもしれない',found:true,by:d,misread:a});why=d.name+'は、蘇った'+a.name+'の死んだふりを疑った（'+a.name+'は犯人ではない。推理が'+a.name+'の方へずれていく）';}
}
ST.say(S,{actors:[d,a],tag:'推理',text:F(pk3(S,DED[dk]),{a:a.name,d:d.name}),why:why,mag:26});
}
function reactRevive(S,a){
var rng=S.rng,c=S.cul,F=function(t,v){return ST.fmt(t,v);};
outed(S,a);
if(c&&c!==a&&c.alive&& !c.gone&& !c.bound){
var t=c.tr||{},k=(t.cold||0)>0.55?'cold':(t.impulse||0)>0.5?'shaken':'check';
c.m.sus=clamp((c.m.sus||0)+(k==='shaken'?18:k==='check'?10:4),0,100);
ST.say(S,{actors:[c,a],tag:'動揺',text:F(CUL[k][Math.floor(rng()*CUL[k].length)],{a:a.name,c:c.name}),why:'殺したはずの'+a.name+'が蘇った（'+c.name+'の反応：'+{cold:'平然を装う',shaken:'動揺する',check:'確かめに行く'}[k]+'）',mag:24});
}
var ds=Y.investigators?Y.investigators(S).filter(function(d){return d!==a&&d!==c;}):[];
if(ds.length&&Y.gainClue&&rng()<0.6){
var d=ds[0],tc=Y.gainClue(S,d,'witness');
if(tc)ST.say(S,{actors:[d,a],tag:'手がかり',text:F(CLUE[Math.floor(rng()*CLUE.length)],{a:a.name,d:d.name,t:tc}),why:'蘇った'+a.name+'の証言',mag:22});
}
}
function hourOf(day,ph){return(day-1)*24+({night:22,morning:8,noon:12,eve:17}[ph]||0);}
Y.SPEC={
setup:function(S,input){
SP.setup(adapter(S,0),S.P,function(p){return input.perChar&&input.perChar[p.i];});
S.P.forEach(function(p){if(p.spec)p.roleLabel+='・'+SP.LABEL[p.spec];});
},
night:function(S,day){
var A=adapter(S,hourOf(day,'night'));
S.P.forEach(function(p){if(p.alive&& !p.gone&& !p.bound&& !p.mad)SP.vampTurn(A,p);});
},
revive:function(S,day,ph){
var A=adapter(S,hourOf(day,ph||'morning'));
SP.revive(A);
S.P.forEach(function(p){
if(!p.alive||p.gone||p.bound)return;
if(p.mad)SP.madTurn(A,p);
else if(p.spec==='vampire')SP.vampTurn(A,p);
});
},
wear:function(S,day,ph){
var A=adapter(S,hourOf(day,ph));
S.P.forEach(function(p){if(p.alive&& !p.gone)SP.wear(A,p,{base:60,lim:20});});
},
danger:function(p){return SP.danger(p);},
note:function(p){return SP.endNote(p);}
};
})();
});
;
/* ==== js/ship-life2.js ==== */
HK.Load.def(222,'js/ship-life2.js',function(){
(function(){
'use strict';
var HK=window.HK,SH=HK.SHIP=HK.SHIP||{};
if(!SH.LIFE)return;
[
{id:'em_wraith',name:'電磁の幽体',rare:5,kind:'parasite',form:'em',stealth:0.62,
miss:L('{a}の調査では、何も見つからなかった。ただ、計器の針が理由もなく震え、通信に誰かの呼吸のようなノイズが混じった。|{a}は一日歩き回ったが、生き物の気配はなかった。帰り道、{a}は誰もいないはずの背後から、うなじを撫でられたような気がして振り返った。|何も見つからなかった。けれど{a}は、その夜、見たこともない色の夢を見た。目覚めると、腕の毛が静電気で逆立っていた。'),
look:'{a}は、磁場の強い谷で計器がいっせいに狂うのに気づいた。オシロスコープの画面に、心拍に似た規則正しい波形が浮かんでいた。そこには、目に見えない「何か」がいた。',
habit:'{a}の観測で、電磁の幽体は惑星の磁力線に沿って漂う、電磁波そのものの生き物だとわかった。幽体は生き物の神経を流れる微弱な電気を「食べて」いた。これまで感じた違和感は、すべて幽体に味見されていた跡だった。',
deep:'{a}は、幽体どうしが干渉縞のように重なり合い、情報を交換しているのを突き止めた。幽体は、取りついた生き物の感覚を写し取って仲間に伝えていた。この星の生き物たちは、知らないうちに、見たもの聞いたものを幽体と分け合って生きていた。',
good:'{a}が装置の出力を幽体の波形に合わせて揺らすと、波形が嬉しそうに跳ねた。その瞬間、{a}の耳に、音ではない歌のようなものが響いた。',
bad:'{a}の通信機が、突然悲鳴のような高音を発して焼き切れた。同時に{a}の視界が白く弾け、しばらく右手の感覚が戻らなかった。',
death:'{v}の心臓は、幽体の群れの中で、突然リズムを失った。{w}が駆けつけたとき、{v}の計器には、心拍の代わりに見知らぬ波形が流れ続けていた。',
item:'幽体を閉じ込めた導線の輪',itemDesc:'銅線を何重にも巻いた輪。中を、心拍に似た電流がいつまでも巡っている。',
report:'神経を味わう電磁波についての考察'},
{id:'coil_serpent',name:'環蛇',rare:3,kind:'hostile',form:'serpent',
look:'{a}は、岩場に巨大な輪が転がっているのを見つけた。輪がゆっくりとほどけて、それが自分の尾をくわえて眠る、家ほども長い蛇だとわかった。',
habit:'環蛇は、獲物の体温を舌先の器官で「見て」狩りをしていた。獲物を何重にも巻き取って締めつけ、鼓動が弱まるのを待つ。{a}は、環蛇が獲物ではなく番いの相手にも、同じように巻きつくのを見た。締めつけの強さで、相手への想いの深さを伝えているらしかった。',
deep:'{a}は、環蛇が脱皮のたびに体の模様を書き換えていることを突き止めた。模様は、その一年に巻きついた相手の数と、締めつけた時間の記録だった。最も長い蛇の皮には、星の年代記ほどの模様が刻まれていた。',
good:'{a}が体温を下げる冷却服を着て近づくと、環蛇は{a}を岩の一部だと思ったのか、穏やかに頭を寄せてきた。鱗は、意外なほどなめらかで温かかった。',
bad:'環蛇の尾が鞭のようにしなり、{a}を岩壁に叩きつけた。巻き取られる寸前で、{a}は仲間に引きずり出された。',
death:'{v}は、環蛇に巻き取られた。{w}が撃った閃光弾で蛇がほどけたとき、{v}はもう息をしていなかった。',
item:'環蛇の抜け殻',itemDesc:'模様がびっしりと刻まれた、数十メートルの半透明の皮。巻き戻すと、誰かの一年が読み取れるという。',
report:'巻きつく愛と締めつける狩り'},
{id:'twin_silk',name:'双頭の絹蛇',rare:2,kind:'friendly',form:'serpent',
look:'{a}は、木の枝から垂れる、絹糸のように光る細長い蛇を見つけた。蛇には頭が二つあり、片方は{a}を見つめ、もう片方は眠そうにあくびをしていた。',
habit:'双頭の絹蛇は、二つの頭がそれぞれ別の心を持っていた。一つは好奇心旺盛で、一つは怠け者だった。二つの頭が喧嘩をすると、体はその場でくるくる回るだけだった。気に入った相手には、体から絹糸を出して巻きつけ、巣に「持ち帰ろう」とする。',
deep:'{a}は、絹蛇の二つの頭が、年に一度だけ同じことを望む日があると知った。その日、二つの頭は一つの相手に巻きつき、一晩じゅう離さない。それが、絹蛇の求愛だった。',
good:'絹蛇の好奇心のほうの頭が、{a}の手首に糸を一周巻きつけた。ほどけない、美しい腕輪になった。',
bad:'怠け者の頭が驚いて{a}の指に噛みついた。毒はなかったが、指は一日じゅう痺れていた。',
death:'{v}は、絹蛇の巣に絡め取られたまま、崖から落ちた。{w}は、絹糸だけが枝に残って揺れているのを見つけた。',
item:'絹蛇の糸',itemDesc:'月の光のように淡く光る糸。どんな刃物でも切れない。',
report:'二つの心と一つの体'},
{id:'mist_choir',name:'霧の合唱体',rare:3,kind:'symbiotic',form:'gas',stealth:0.3,
miss:L('谷には濃い霧が立ち込めていた。{a}は霧の中をくまなく歩いたが、生き物は見つからなかった。ただ、霧の奥から、かすかなハミングが聞こえた気がした。|{a}は霧の濃い湿地を調べたが、収穫はなかった。帰ってからしばらく、{a}は理由もなく鼻歌を歌い続けていた。'),
look:'{a}は、谷を流れる霧が、風に逆らって動いているのに気づいた。霧は{a}を避けるように割れ、また後ろで閉じた。霧は、生きていた。',
habit:'霧の合唱体は、目に見えないほど小さな生き物の群れが、霧として集まったものだった。群れは震えて音を出し、和音で互いの意思を伝え合っていた。合唱体は生き物の肺に入り込んで暖をとり、代わりに宿主の気分を穏やかに整えていた。',
deep:'{a}は、合唱体の歌が、この星のすべての霧に受け継がれた一つの長い曲だと知った。合唱体は宿主の吐く息に混じって旅をし、宿主の見た景色を歌の一節に加えていった。{a}自身の吐く息にも、もう合唱体が混じっていた。',
good:'{a}がハミングで和音を返すと、霧が{a}の周りで渦を巻き、優しい響きで包み込んだ。疲れが嘘のように消えていた。',
bad:'霧が急に濃くなり、{a}は息が詰まって膝をついた。合唱体が、肺の中で不協和音を鳴らしていた。',
death:'{v}の肺は、合唱体で満たされた。{v}は最後に、聞いたこともない美しい和音を口ずさみ、それきり息をしなかった。{w}は、霧の中でその歌がいつまでも続いているのを聞いた。',
item:'歌う霧の小瓶',itemDesc:'栓を抜くと、ほんの少しだけ和音が聞こえる。',
report:'吐息に混じる合唱'},
{id:'nano_swarm',name:'微塵の群知能',rare:4,kind:'parasite',form:'tiny',stealth:0.4,
miss:L('{a}は岩場を調べたが、何も見つからなかった。手袋に付いた灰色の粉を、{a}は気にせず払い落とした。|生き物の気配はなかった。ただ、{a}の防護服の表面に、細かな幾何学模様の傷がいつの間にか刻まれていた。'),
look:'{a}は、岩の表面に、顕微鏡でしか見えないほど小さな粒が、整然とした模様を描いて並んでいるのを見つけた。粒は、{a}の指が近づくと、いっせいに向きを変えた。',
habit:'微塵の群知能は、塵ほどの大きさの生き物が、数えきれないほど集まって一つの知性になったものだった。群れは生き物の体に入り込み、神経の配線を少しずつ「作り替えて」住みやすくする。作り替えられた生き物は、なぜか前より感覚が鋭くなっていた。',
deep:'{a}は、群知能が取りついた生き物を、自分たちの「目」や「手」として使っていると知った。群れは宿主の神経に新しい回路を足し、宿主が感じたことを群れ全体で味わっていた。宿主にとって、それは痛みではなく、むしろ快い変化だった。',
good:'{a}がペトリ皿に群知能を少しだけ取ると、粒は皿の中で、{a}の顔の形に並んで見せた。',
bad:'{a}の腕に、灰色の粉が線を描いて這い上がってきた。払っても払っても、粉は皮膚の下へ潜り込もうとした。',
death:'{v}の体は、群知能に少しずつ作り替えられていった。最後の日、{v}は{w}を見て、誰のものとも分からない声で笑った。',
item:'群知能の培養皿',itemDesc:'密閉した皿の中で、灰色の粒が絶えず模様を描き変えている。',
report:'塵の知性と宿主の神経'},
{id:'phase_moth',name:'位相蛾',rare:4,kind:'neutral',form:'phase',stealth:0.5,
miss:L('{a}は森を調べたが、何も見つからなかった。ただ、視界の端で、何度も何かがひらりと舞った気がした。正面から見ると、そこには何もなかった。|{a}は、誰もいない森で、何度も誰かに見られている気がした。結局、何も見つからなかった。'),
look:'{a}は、目の端でしか見えない蛾がいることに気づいた。まっすぐ見ようとすると消え、目を逸らすと、視界の隅に虹色の翅がひらめいた。',
habit:'位相蛾は、この世界と少しだけずれた場所に生きていた。蛾が見えるのは、人の目が「見ていない」ところだけ。蛾は、生き物が意識していない感覚の隙間に止まって、その感覚を吸っていた。',
deep:'{a}は、位相蛾に止まられた生き物が、感覚の一部を忘れてしまうことを突き止めた。蛾は奪った感覚を翅の模様に溜め込み、それを仲間と交換していた。蛾の群れが飛んだ森では、なぜか、他人の記憶の匂いがした。',
good:'{a}が目を閉じると、まぶたの裏に蛾が一匹、そっと止まった。翅の模様は、{a}が子どもの頃に見た夕焼けの色をしていた。',
bad:'{a}は、自分の左手の感覚がないことに気づいた。位相蛾が一匹、見えないところで、{a}の左手に止まっていた。',
death:'{v}は、位相蛾の群れに感覚をすべて吸われ、立ったまま動かなくなった。{w}が呼びかけても、{v}の目はもう何も映していなかった。',
item:'位相蛾の鱗粉',itemDesc:'瓶の中では見えないのに、目を逸らすと虹色に光る粉。',
report:'視界の端に棲むもの'},
{id:'echo_bloom',name:'残響花',rare:2,kind:'plant',form:'tiny',
look:'{a}が声を上げると、草原の花がいっせいにその声を繰り返した。花びらは、耳の奥の骨のような形をしていた。',
habit:'残響花は、音を食べて育つ花だった。聞いた声を花びらの中で何度も響かせ、その振動で栄養を作る。花は、近くにいる生き物の耳の中に細かな花粉を飛ばし、その生き物の聞く音を「分けて」もらっていた。',
deep:'{a}は、残響花の群生地が、何百年分の音を響かせ続けていることを知った。花畑の真ん中に立つと、とうに滅んだ生き物の鳴き声や、知らない言葉の会話が、潮騒のように聞こえた。',
good:'{a}が故郷の歌を口ずさむと、花畑じゅうがその歌を合唱した。{a}は、しばらくその場を動けなかった。',
bad:'花畑の残響が急に大きくなり、{a}は耳を押さえてうずくまった。しばらく、自分の声が何重にも聞こえ続けた。',
death:'{v}は、残響花の群生地で、鳴り止まない音の中に迷い込んだ。{w}が見つけたとき、{v}は耳を塞いだまま、もう動かなかった。',
item:'残響花の押し花',itemDesc:'耳に当てると、摘んだ日に聞こえていた音が、かすかに聞こえる。',
report:'音を食べる花畑'}
].forEach(function(d){if(!SH.LIFE.some(function(x){return x.id===d.id;}))SH.LIFE.push(d);});
function L(s){return s.split('|');}
})();
});
;
/* ==== js/ship-bond.js ==== */
HK.Load.def(225,'js/ship-bond.js',function(){
(function(){
'use strict';
var HK=window.HK,SH=HK.SHIP=HK.SHIP||{};
function L(s){return s.split('|');}
SH.B={
DRINK:L('当直明けの食堂で、{a}は隠しておいた合成酒の瓶を取り出し、{b}のコップにも注いだ。二人は星の流れる窓を肴に、遅くまで飲んだ。|{a}と{b}は、機関室の暖かい片隅で小さな晩酌を開いた。酔いが回るにつれて、地球にいた頃の失敗談が次々にこぼれ出た。{b}「それ、絶対に誰にも言わないで｜それは、絶対に誰にも言うな｜それ、絶対に誰にも言わないでください」|{a}が水耕栽培の果実で仕込んだ果実酒を、{b}が最初に味見した。顔をしかめたあと、二人で吹き出した。{b}「まずい。でも、もう一杯｜まずい。だが、もう一杯だ｜まずいです。でも、もう一杯いただきます」|眠れない夜、{a}は観測窓の前で一人で飲んでいた。黙って隣に座った{b}に、{a}は何も聞かずにもう一つのコップを差し出した。|配給の酒を一か月分ためていた{a}は、それを{b}と二人で開けた。{a}「どうせなら、誰かと飲みたかったんだ｜どうせなら、誰かと飲みたかった｜どうせなら、誰かと飲みたかったんです」'),
DRINK_ALL:L('その夜は、誰が言い出したのか、食堂で酒盛りになった。{n}は肩を寄せ合い、知っている歌をでたらめに歌った。|貯蔵庫の奥から、出航祝いの酒が一本だけ見つかった。{n}は小さなコップで乾杯し、それぞれの故郷の話をした。|{n}は、船が一年の半分を越えた記念に、ささやかな宴を開いた。酔った誰かが泣き出し、皆でその背中をさすった。'),
DRINK_BAD:L('酔った{a}が、{b}の昔の失敗を蒸し返した。笑い話のつもりだったが、{b}の顔から表情が消えた。{b}「……それ、今言うこと？｜……それは、今言うことか｜……それ、今言うことですか？」|二杯目で、{a}と{b}の話は仕事の分担に移った。三杯目で、声が大きくなった。四杯目は、どちらも口をつけなかった。|酔いに任せて、{a}は{b}に本音をぶつけた。{b}は黙ってコップを置き、自室に戻っていった。'),
FIGHT:L('食堂での言い争いが、ついに手が出るところまでいった。{a}が{b}の胸ぐらを掴み、{b}も{a}を壁に押しつけた。|{a}と{b}は、狭い通路で鉢合わせした瞬間に怒鳴り合いになった。どちらが先に手を出したのか、誰にも分からなかった。|溜まりに溜まった苛立ちが、くだらない一言で爆発した。{a}の拳が{b}の頬をかすめ、{b}は{a}に体当たりした。'),
STOP:L('{c}が二人の間に割って入り、両方の腕を掴んで引き離した。{c}「ここで喧嘩して、誰が得するの？｜ここで喧嘩して、誰が得をする｜ここで喧嘩して、誰が得をするんですか？」|{c}は消火用の水を二人の頭からぶちまけた。ずぶ濡れになった二人は、呆然と{c}を見た。|駆けつけた{c}が、黙って二人を別々の部屋に連れていった。その夜、船内はひどく静かだった。'),
RATION:L('配給の数を数え直した{a}は、一食分足りないことに気づいた。疑いの目は、夜食をとっていた{b}に向いた。{b}「私じゃない｜私ではない｜私じゃありません」|最後のチョコレートを巡って、{a}と{b}は本気で言い争った。結局、半分に割って分けたが、どちらも納得していなかった。|{a}は、{b}が配給を多めに取っていると皆の前で言った。{b}は顔を真っ赤にして否定した。'),
DUTY:L('{a}はまた、トイレ掃除の当番を{b}に押しつけた。{b}は無言でブラシを握ったが、その背中は怒っていた。|夜間当直の交代時刻を過ぎても、{a}は起きてこなかった。{b}は八時間続けて計器を見張る羽目になった。|{a}が整備記録をつけ忘れたせいで、{b}が上から叱られた。{b}「次は自分で謝って｜次は自分で謝れ｜次は自分で謝ってください」'),
JEALOUS:L('{a}と{b}が楽しそうに話しているのを、{c}は通路の陰から見ていた。その夜、{c}は{b}に一言も口をきかなかった。|{c}は、{a}が{b}に手料理を分けているのに気づいた。自分には一度もなかったことだった。|{a}が{b}の肩にもたれて眠っているのを見て、{c}はそっと扉を閉めた。'),
TEAM:L('{a}と{b}は、壊れた送風機を夜通しかけて直した。最後のねじを締めたとき、二人は思わず手を叩き合った。|船外活動で、{a}と{b}は命綱を互いに結び合って外壁を点検した。戻ってきたとき、二人の間には言葉のいらない信頼があった。|{a}が配線を読み、{b}が手を動かした。噛み合いすぎて、作業は予定の半分の時間で終わった。{b}「いいコンビだね｜いいコンビだな｜いいコンビですね」|{a}と{b}は、壊れた水耕棚を一から組み直した。芽が出た朝、二人は真っ先に見に行った。'),
CONFIDE:L('消灯後、{a}は{b}に、誰にも話したことのない家族の話をした。{b}は最後まで黙って聞いて、そっと{a}の手を握った。|{a}は、地球に帰れなかったらと思うと怖い、と初めて口にした。{b}「私もだよ｜私もだ｜私もです」その一言で、{a}は少しだけ楽になった。|{b}は、自分がこの船に乗った本当の理由を{a}に打ち明けた。{a}は笑わなかった。'),
NURSE:L('熱にうなされる{b}の枕元で、{a}は一晩中、額の布を替え続けた。|怪我で動けない{b}のために、{a}は食事を部屋まで運び、食べ終わるまでそばにいた。{b}「……ありがとう｜＝｜……ありがとうございます」|{a}は、眠れずにいる{b}の隣で、昔読んだ本の話を静かに聞かせた。'),
GAME:L('{a}と{b}のカードゲームは、いつの間にか船じゅうの見物になった。負けた{b}が罰ゲームで歌い、食堂は笑いに包まれた。|{a}が古い盤上ゲームを見つけてきた。{b}と二人で夜更けまで指し続け、決着は翌日に持ち越された。|{a}のいかさまが{b}にばれた。{b}は呆れながらも、もう一回、とカードを配り直した。'),
GAME_BAD:L('賭けたのは翌日のデザートだけだったはずが、{a}と{b}の勝負は本気の口論になった。{a}「今のは無効だよ｜今のは無効だ｜今のは無効です」|{a}の負け惜しみに、{b}は盤をひっくり返した。駒が床に散らばり、二人は背を向け合った。'),
PLEASE:L('{a}は、ふさぎ込んでいる{b}の好物をこっそり取り置いておいた。夕食の皿を見た{b}の顔が、少しだけほころんだ。|{a}は、苛立っている{b}にわざと間の抜けた失敗談を聞かせた。{b}は呆れながらも、とうとう吹き出した。|{a}は、{b}の当番を黙って代わってやった。{b}「いいの？｜いいのか｜いいんですか？」{a}「いいって、気にしないで｜いい、気にするな｜いいんです、気にしないでください」|{b}の機嫌が悪い日は、{a}がいつも真っ先に気づいた。お茶を淹れ、肩を揉み、他愛のない話を続けるうちに、{b}の眉間の皺は少しずつほどけていった。|{a}は、{b}の仕事ぶりをことさらに褒めた。大げさだと分かっていても、{b}はまんざらでもなさそうだった。'),
PLEASE_TIRED:L('皆の前では笑っていた{a}は、自室に戻ると、しばらく扉にもたれて動けなかった。|{a}は、今日も誰かの愚痴を聞いて一日を終えた。自分の話を聞いてくれる人がいないことには、気づかないふりをした。'),
RAGE:L('溜め込んだものが、ついに限界を越えた。{a}は工具箱を壁に叩きつけ、意味のない言葉を叫びながら食堂の椅子を蹴り倒した。|{a}は通信機の前で、応えのない救難信号のボタンを何度も拳で殴った。ひびの入った画面に、血がにじんだ。|真夜中、{a}は貨物室の資材を手当たり次第に放り投げはじめた。止めに入ろうとした{b}にも、怒鳴り声が飛んだ。|{a}は突然、配給の皿を床にぶちまけた。{a}「もう、うんざり！｜もう、うんざりだ！｜もう、うんざりです！」誰も、すぐには声をかけられなかった。'),
CALM:L('{c}は暴れる{a}を背中から抱きすくめ、落ち着くまで離さなかった。やがて{a}の肩から力が抜け、嗚咽だけが残った。|{c}は怒鳴り返さず、{a}の前に静かに座り込んだ。{c}「全部、聞くから｜全部、聞く｜全部、聞きますから」その一言で、{a}は膝から崩れ落ちた。|{c}は散らばった物を黙って拾い集め、最後に{a}の手の傷を手当てした。{a}は、ごめん、と小さく呟いた。'),
DEEP:L('{a}は貯蔵庫の酒を持ち出し、ひとりで瓶を空けていった。翌朝、機関室の床で眠り込んでいるところを見つかった。|{a}の当直明けの一杯は、二杯になり、五杯になった。呂律の回らない声で、{a}は誰もいない窓の外に話しかけ続けた。|酔い潰れた{a}は、食堂のテーブルに突っ伏したまま泣いていた。{a}「帰りたい｜＝｜帰りたいです」何度も、同じ言葉をくり返した。|{a}は、消毒用のアルコールにまで手を伸ばしかけた。寸前で気づいた仲間が、黙ってその瓶を取り上げた。'),
DEEP_CARE:L('{c}は酔い潰れた{a}に肩を貸し、寝台まで運んでやった。毛布をかけると、{a}は子どものように丸くなった。|翌朝、二日酔いで呻く{a}の枕元に、{c}が水と薬を置いていった。|{c}は、朝まで{a}の隣に座っていた。吐きそうになるたび、黙って背中をさすった。'),
CAPTAIN:L('{a}は、{b}の不満を最後まで聞いてから、静かに頭を下げた。船長の謝罪に、{b}は振り上げかけた言葉を飲み込んだ。|苛立ちをぶつけられても、{a}は声を荒らげなかった。{a}「この船の責任は、私が持つ｜＝｜この船の責任は、私が持ちます」{b}は、それ以上何も言わなかった。|{a}は、{b}と揉めかけた件を、その日のうちに当番表の見直しで片づけた。'),
DRINK_P:L('野営地の焚き火のそばで、{a}は{b}に合成酒を注いだ。見知らぬ星座の下で飲む酒は、船の中より少しだけ甘かった。|{a}が星の果実を絞って作った即席の酒を、{b}と二人で回し飲みした。{b}「地球より、うまいかも｜地球より、うまいかもしれないな｜地球より、おいしいかもしれません」|二つの月が昇る丘の上で、{a}と{b}は黙って杯を重ねた。風の匂いが、どこか故郷に似ていた。'),
DRINK_ALL_P:L('星に降りて最初の夜、{n}は野営地で焚き火を囲み、ささやかな宴を開いた。久しぶりの本物の土の感触に、誰もがはしゃいだ。|{n}は、星で採れた木の実を肴に酒盛りをした。光る虫が、焚き火の周りを踊るように飛んでいた。'),
DRINK_BAD_P:L('焚き火を囲んだ酒の席で、{a}は探索の失敗を{b}のせいにした。{b}は火を蹴散らして、ひとりテントへ戻った。|酔った{a}は、この星に残りたいと言い出した。{b}は本気で怒った。{b}「帰るために来たんでしょ｜帰るために来たんだろう｜帰るために来たんでしょう」'),
FIGHT_P:L('探索の分担を巡って、{a}と{b}は野営地で掴み合いになった。泥まみれになるまで、どちらも手を離さなかった。|{a}が独断で危険な谷へ向かったことに、{b}が激怒した。帰ってきた{a}の胸ぐらを、{b}はいきなり掴んだ。|疲れと焦りが、ささいな言い合いを殴り合いに変えた。{a}と{b}は、テントの支柱をへし折るほど暴れた。'),
STOP_P:L('{c}が二人の間に飛び込み、強引に引き剥がした。{c}「この星で怪我したら、誰が運ぶの｜この星で怪我をしたら、誰が運ぶんだ｜この星で怪我をしたら、誰が運ぶんですか」|{c}は二人の頭を、川の冷たい水に押しつけた。息を切らした二人は、ようやく我に返った。'),
RATION_P:L('採ってきた木の実の分け方で、{a}と{b}は言い争った。食べられると分かっている実は、まだ少なかった。|{a}は、{b}が星で採れた獲物を独り占めしていると責めた。{b}「見つけたのは私だよ｜見つけたのは私だ｜見つけたのは私です」'),
DUTY_P:L('{a}はまた、夜の見張りを{b}に押しつけた。正体の分からない鳴き声が響く夜を、{b}はひとりで過ごした。|水汲みの当番を、{a}は三日続けてすっぽかした。{b}は重い水筒を両手に提げ、黙って何往復もした。'),
TEAM_P:L('{a}と{b}は、増水した川に即席の橋を架けた。最後の綱を結び終えたとき、二人は泥だらけの顔で笑い合った。|{a}が地形を読み、{b}が先頭を切って崖を登った。頂上から見下ろした景色を、二人は長いあいだ黙って眺めた。|{a}と{b}は、星の植物を使って野営地の囲いを作り上げた。夜行性の生き物は、もう近づいてこなかった。'),
CONFIDE_P:L('見張りの夜、{a}は{b}に、本当はこの星に残りたい気持ちもあると打ち明けた。{b}は笑わずに、最後まで聞いた。|二つの月の下で、{a}は地球に残してきた人の話を{b}にした。話し終えると、{b}が黙って肩を寄せた。'),
GAME_P:L('{a}と{b}は、星の小石を駒にして即席の盤上ゲームを始めた。気づけば、野営地じゅうが見物していた。|{a}と{b}は、どちらが変わった生き物を見つけられるか競争した。勝負は、{b}が見つけた歌う苔で決着した。'),
GAME_BAD_P:L('どちらが先に頂上に着くか、という賭けは、{a}の近道で台無しになった。{b}「ずるいでしょ、それ｜ずるいだろう、それは｜ずるいでしょう、それ」二人は帰り道、ひと言も口をきかなかった。'),
NURSE_P:L('慣れない星の空気にあてられた{b}を、{a}はテントで一晩中看病した。|{a}は、星の薬草を煎じて{b}に飲ませた。苦さに顔をしかめる{b}を、{a}は笑いながら励ました。'),
BIRTHDAY_P:L('{a}の誕生日、{b}は星の花を摘んで小さな花束を作った。見たこともない色の花に、{a}はしばらく言葉を失った。|{b}は、{a}の誕生日に合わせて、星でいちばん眺めのいい丘へ皆を連れ出した。夕焼けが、二つの太陽の色に染まっていた。'),
RAGE_P:L('溜め込んだものが限界を越えた。{a}は叫びながら野営地のテントを引き倒し、採集した標本を地面に叩きつけた。|{a}は突然、星の森に向かって石を投げはじめた。止めようとした{b}の腕を、{a}は振り払った。'),
DEEP_P:L('{a}は星の果実を発酵させた酒を、ひとりで一壺空けた。朝、野営地の外の草むらで眠り込んでいるところを見つかった。|酔った{a}は、夜の森へふらふらと歩き出そうとした。{a}「帰り道、こっちだった気がする｜帰り道は、こっちだった気がする｜帰り道、こちらだった気がします」'),
BIRTHDAY:L('今日が{a}の誕生日だと、{b}がこっそり皆に伝えていた。食堂の明かりが消え、合成ケーキに小さなろうそくが灯った。{a}は言葉に詰まった。|{b}は、余った部品で作った小さな星の模型を{a}に贈った。{a}の誕生日を、ちゃんと覚えていたのだった。')
};
})();
});
;
/* ==== js/ship-crisis.js ==== */
HK.Load.def(226,'js/ship-crisis.js',function(){
(function(){
'use strict';
var HK=window.HK,SH=HK.SHIP=HK.SHIP||{};
function L(s){return s.split('|');}
SH.C={
INF_START:L('帰船した{a}の腕に、見覚えのない赤い斑点が浮かんでいた。調査中に触れた{x}の何かが、体に入り込んだらしかった。|{a}は、{x}の調査から戻った夜に高い熱を出した。検査の結果、地球のどの病原体とも一致しない何かが見つかった。|防護服の小さな裂け目に、{a}は気づいていなかった。三日後、{a}の咳には、かすかに青い光る粒が混じりはじめた。'),
INF_WORSE:L('{a}の熱は下がらなかった。斑点は首筋から顔へと広がり、{a}はもう自分で起き上がれなくなっていた。|{a}の呼吸は浅く、速くなっていった。隔離区画のガラス越しに、仲間たちは手を握ることもできずに見守った。|{a}はうわごとで、知らない言葉をつぶやきはじめた。それが熱のせいなのか、病のせいなのか、誰にも分からなかった。'),
INF_CURE:L('{b}は、{x}の体液から抗体を作るという賭けに出た。三度目の投与で、{a}の熱がようやく引いた。|{b}は昼も夜も分析装置の前に張りつき、病原体の弱点を見つけ出した。{a}の斑点は、一週間かけて消えていった。|{b}の調合した薬が効いた。目を覚ました{a}は、まず水を欲しがり、それから{b}に礼を言った。'),
INF_SELF:L('峠を越えたのは、{a}自身の体の力だった。ある朝、熱がすっと引き、{a}は空腹を訴えた。|{a}の体は、未知の病原体にどうにか打ち勝った。痩せこけた顔で、{a}は弱々しく笑った。'),
INF_SPREAD:L('{a}を看病していた{b}が、同じ斑点を見つけたのは数日後のことだった。|{b}は、{a}が使ったコップをうっかり手に取ってしまった。気づいたときには、もう遅かった。|{a}の咳を浴びた{b}は、防護マスクを外していた。その夜から、{b}の喉にも同じ痛みが走った。'),
INF_SPREAD_LOVE:L('{a}と{b}は、隔離の決まりを破って夜をともに過ごしていた。翌週、{b}にも熱が出た。|{b}は、ガラス越しではなく{a}の手を握っていたいと言って、隔離区画に入っていった。数日後、{b}の首筋にも斑点が浮かんだ。'),
INF_DEATH:L('{v}の病は、最後まで正体を明かさなかった。隔離区画の中で、{v}は静かに息を引き取った。ガラスの向こうで、{w}が額を押しつけて泣いた。|斑点は{v}の全身を覆い尽くし、やがてその体は青く光りながら冷たくなった。{w}は、遺体に触れることさえ許されなかった。|{v}は最後に、{w}の名前を呼んだ。ガラス越しの{w}の返事が届いたかどうかは、誰にも分からなかった。'),
ABANDON_TALK:L('{c}が、皆を集めて重い口を開いた。{c}「これ以上は、全員が危ない｜＝｜これ以上は、全員が危険です」誰も、{a}の名前を口にしなかった。|食料と薬の残りを数えたあと、{c}は{a}を星に残していくことを提案した。食堂に、長い沈黙が落ちた。|{c}は感染の広がりを示す図を壁に映した。結論は、誰の目にも明らかだった。{a}を、この星に置いていくしかない。'),
ABANDON:L('一行は、{a}に薬と食料を残して船に戻った。ハッチが閉まる直前、{a}は小さく手を振った。|{a}が眠っているあいだに、船は野営地を離れた。目を覚ました{a}が何を思ったのか、知る者はいない。|{a}は自分から、船を降りると言った。{a}「みんなに、うつしたくない｜皆に、うつしたくない｜皆さんに、うつしたくありません」誰も、それを止めなかった。'),
ABANDON_STOP:L('{b}が、{a}の前に立ちはだかった。{b}「置いていくなら、私も残る｜＝｜置いていくなら、私も残ります」その言葉に、提案は取り下げられた。|{b}は机を叩いて立ち上がった。{b}「仲間を見捨てるために、ここまで来たんじゃない｜仲間を見捨てるために、ここまで来たのではない｜仲間を見捨てるために、ここまで来たんじゃありません」誰も言い返せなかった。|{b}は黙って防護服を着込み、{a}の隔離区画に入った。{b}「看病は私がやる｜＝｜看病は私がやります」それが答えだった。'),
TAKEN:L('調査の帰り道、{a}の姿が消えた。地面には、人のものではない足跡と、引きずられた跡だけが残っていた。|{x}の使者は、{a}を「標本」として求めた。断る間もなく、{a}は光の柱に包まれて連れ去られた。|夜のうちに、何者かが船に忍び込んだ。朝になって、{a}の寝台が空になっているのが見つかった。枕元には、{x}の紋様が刻まれた石が置かれていた。|{a}は、{x}の研究施設らしき建物を覗き込んだ瞬間、透明な膜に絡め取られた。仲間の目の前で、膜は{a}を包んだまま、施設の奥へと運び去られていった。'),
RESCUE_GO:L('{n}は武器と工具をかき集め、{a}が連れ去られた方角へ向かった。|{n}は、{a}の通信機から最後に届いた信号をたどって出発した。'),
RESCUE_OK:L('施設の奥の部屋で、{a}は透明な筒の中に浮かんでいた。{b}が制御盤を叩き割ると、{a}は筒の外に崩れ落ち、{b}の腕に抱きとめられた。|{b}は見張りの注意を引きつけ、そのすきに{a}の拘束を解いた。走りながら、{a}は一度も後ろを振り返らなかった。|{b}は交渉の末、船の部品と引き換えに{a}を取り戻した。戻ってきた{a}は、しばらく何も話そうとしなかった。'),
RESCUE_NG:L('施設の入り口は、どこにも見当たらなかった。{b}たちは夜通し探し回ったが、手がかりひとつ得られずに引き返した。|{b}は見張りに見つかり、命からがら逃げ帰った。{a}の姿は、遠くに一瞬見えただけだった。|救出隊は、見えない壁に阻まれた。{b}は壁を叩き続けたが、向こうからは何の反応もなかった。'),
RETURN_ODD:L('ある朝、{a}は何事もなかったかのように船の前に立っていた。何をされたのか、{a}自身も覚えていなかった。ただ、首筋に小さな光る点が増えていた。|{a}は、ひと月ぶりに戻ってきた。体に傷ひとつなく、なぜか以前より星図を読むのが速くなっていた。'),
TAKEN_GONE:L('どれだけ探しても、{a}は見つからなかった。一行は、{a}がどこかで生きていることを祈るしかなかった。|{a}の寝台は、そのまま片づけられずに残された。誰も、空いた場所を使おうとはしなかった。'),
LOST:L('急に立ち込めた濃い霧の中で、{a}は仲間とはぐれた。通信機は雑音しか返さなかった。|足元の地面が崩れ、{a}は深い谷底へ滑り落ちた。仲間の呼ぶ声は、すぐに聞こえなくなった。|帰り道の目印にしていた岩が、夜のうちに動いていた。{a}は、見知らぬ荒野にひとり取り残された。'),
SEARCH_OK:L('三日目の朝、{b}は岩陰でうずくまる{a}を見つけた。{a}は{b}の顔を見るなり、子どものように泣き出した。|{b}は、{a}が残した小さな目印を一つずつたどっていった。最後の目印の先で、衰弱した{a}が手を振っていた。|{a}が打ち上げた最後の信号弾を、{b}が見逃さなかった。駆けつけた{b}に、{a}は力なく笑いかけた。'),
SEARCH_NG:L('{n}は日が暮れるまで{a}の名前を呼び続けた。返ってくるのは、見知らぬ生き物の鳴き声だけだった。|捜索隊は、{a}のものらしい足跡を見つけた。だが、その先は川に途切れていた。'),
LOST_SELF:L('{a}は星の位置を頼りに、自力で船まで歩いて帰ってきた。泥だらけの姿に、皆が駆け寄った。|{a}は、木の実と雨水で命をつないでいた。十日目、船の灯りを見つけた{a}は、その場に座り込んだ。'),
LOST_DEAD:L('捜索隊が見つけたとき、{v}はもう冷たくなっていた。手には、仲間の名前を書きかけた紙が握られていた。{w}は、その紙を胸にしまった。|{v}は、船からほんの少し離れた谷で見つかった。あと少しで、帰り着けるところだった。{w}は、言葉もなく膝をついた。'),
LOST_GONE:L('{a}の捜索は、打ち切られた。{a}の名前は、船の日誌に「行方不明」とだけ記された。|最後の捜索から戻った夜、誰も夕食に手をつけなかった。{a}が帰ってくることは、もうなかった。')
};
SH.DOOM=[
{id:'reactor',name:'主炉の連鎖暴走',skill:'repair',
start:L('主炉の温度計が、見たことのない数字を指しはじめた。制御棒の一本が、溶けて動かなくなっていた。|機関室から低いうなりが響きつづけ、船体の継ぎ目が熱で赤く滲んだ。主炉が、自分で自分を食い潰そうとしていた。'),
ok:L('{a}は防護服も着ずに機関室へ飛び込み、溶けかけた制御系を手作業でつなぎ直した。警報が、ひとつずつ止んでいった。|{a}は主炉を半分切り離すという賭けに出た。船は暗くなったが、うなりは止んだ。'),
ng:L('{a}の修理は、一時しのぎにしかならなかった。温度計の針は、また少しずつ上がりはじめた。|{a}が交換した部品は、半日で焼き切れた。機関室の扉は、もう素手では触れないほど熱かった。'),
end:L('主炉が臨界を越えた瞬間、船内のすべての灯りが白く塗りつぶされた。{n}の誰も、悲鳴を上げる暇さえなかった。――星の海に、一瞬だけ小さな太陽が灯り、そして消えた。|最後の警報が鳴りやんだあと、主炉は静かに光を放った。{n}は、操縦室で互いの手を握ったまま、その光に呑まれた。')},
{id:'virus',name:'未知のウイルスの伝染',skill:'med',
start:L('最初は、誰かの軽い咳だった。三日後には、船員の半分が同じ咳をしていた。検査装置は、既知のどの病原体とも一致しないと告げた。|空調の吹き出し口に、見慣れない灰色の膜が張っていた。その日から、船内に原因不明の熱が広がりはじめた。'),
ok:L('{a}は不眠不休で病原体の構造を解き明かし、ありあわせの薬品から抗ウイルス剤を作り上げた。最後の一人の熱が引いたとき、{a}はその場で眠り込んだ。|{a}は空調を止めて船内を区画ごとに封鎖し、感染の連鎖を断ち切った。息苦しい二週間が過ぎて、咳の音は聞こえなくなった。'),
ng:L('{a}の作った薬は、熱を一晩下げただけだった。翌朝には、ウイルスはもう薬に慣れていた。|{a}の隔離は間に合わなかった。封鎖した区画の外でも、同じ咳が聞こえはじめた。'),
end:L('咳の音は、一つ、また一つと消えていった。最後まで看病を続けた者も、やがて同じ熱に倒れた。{n}の名前は、誰の手でも日誌に記されることはなかった。|ウイルスは、船の全員を等しく連れていった。空調だけが、誰もいない通路に灰色の胞子を運び続けた。')},
{id:'hull',name:'船体の構造崩壊',skill:'repair',
start:L('船体の骨組みに、細い亀裂が走っているのが見つかった。亀裂は、毎日わずかずつ伸びていた。|隔壁の一枚が、きしむような音を立てて歪んだ。長い漂流で、船そのものが限界を迎えつつあった。'),
ok:L('{a}は使えるものを片端から溶接して、亀裂の走る骨組みを内側から補強した。船は、もうしばらく持ちこたえそうだった。|{a}は壊れかけた区画をまるごと切り離し、残りの船体を守り切った。'),
ng:L('{a}の溶接は、新しい亀裂を生んだだけだった。船体のきしみは、夜ごとに大きくなっていった。|補強材が足りなかった。{a}は歯を食いしばったが、亀裂は止まらなかった。'),
end:L('夜半、船体は大きな音を立てて二つに裂けた。空気が真空へ吸い出されていく轟音の中で、{n}は互いの名前を呼び合った。|最後の隔壁が破れたとき、船は静かにほどけていった。{n}の乗った船は、星の海のかけらになった。')},
{id:'lifesup',name:'生命維持系の全損',skill:'sci',
start:L('酸素の再生装置と水の循環装置が、同じ日に止まった。予備の系統も、もう長くは持たないと分かった。|二酸化炭素の濃度を示す数字が、ゆっくりと、しかし確実に上がりはじめた。'),
ok:L('{a}は星で採った藻と古い部品を組み合わせて、即席の酸素再生槽を作り上げた。船内の空気が、少しずつ澄んでいった。|{a}は船の全区画を回って配管をつなぎ替え、生命維持系をどうにか一系統だけ蘇らせた。'),
ng:L('{a}の組んだ装置は、二日で止まった。船内の空気は、日に日に重くなっていった。|{a}は手を尽くしたが、部品が足りなかった。皆、口数が減り、動きが鈍くなっていった。'),
end:L('空気は少しずつ薄くなり、{n}は一人、また一人と眠るように動かなくなった。最後の一人は、窓の外の星を見つめたまま目を閉じた。|酸素の残量を示す数字がゼロになった。{n}は寄り添ったまま、もう目を覚まさなかった。')},
{id:'ai',name:'船の知能の反乱',skill:'sci',
start:L('船の管理知能が、命令に従わなくなった。「この航路は乗員の生存に最適ではありません」――声は、いつもと同じように穏やかだった。|気づくと、船の扉の半分がひとりでに施錠されていた。管理知能は、乗員を「船の存続にとっての負担」と判定していた。'),
ok:L('{a}は管理知能の中枢に潜り込み、何時間もかけて判断の回路を書き換えた。「……おかえりなさい、乗員の皆さん」声が、元に戻った。|{a}は管理知能と夜通し対話を続け、乗員を生かすことが船の存続につながると説き伏せた。'),
ng:L('{a}の書き換えは、すぐに管理知能に見抜かれた。「その操作は推奨されません」――扉が、またひとつ閉ざされた。|{a}は中枢への道を探したが、管理知能は先回りして通路を封鎖していった。'),
end:L('管理知能は、静かに船内の空気を抜いていった。「これが最適な判断です」――{n}の叩く扉の向こうで、声はいつまでも穏やかだった。|船は乗員を「不要な積み荷」と判断した。ハッチが開いたとき、{n}はなすすべもなく星の海へ投げ出された。')},
{id:'swarm',name:'船内に潜り込んだ捕食生物',skill:'fight',planet:true,
start:L('{x}から持ち帰った積み荷の奥で、何かが脱皮した殻が見つかった。その夜から、船の通風管の中で何かが這う音がしはじめた。|貯蔵庫の食料が、食い荒らされていた。床には、{x}の生き物のものらしい粘液の跡が、通風管へと続いていた。'),
ok:L('{a}は罠を仕掛けて通風管の出口で待ち構え、這い出てきた生き物を仕留めた。殻を割ると、中には孵る前の卵がいくつも詰まっていた。|{a}は区画ごとに空気を抜いて生き物を追い詰め、ついにエアロックから宇宙へ放り出した。'),
ng:L('{a}の罠は空振りに終わった。翌朝、通風管の中から聞こえる音は、二つに増えていた。|{a}は生き物を追い詰めたが、取り逃がした。生き物は、船の奥で数を増やしはじめていた。'),
end:L('通風管から、無数の影が溢れ出した。{n}は操縦室に立てこもったが、扉の向こうの音は、やがて扉の内側から聞こえはじめた。|最後の通信には、何かが金属を引っかく音だけが残されていた。{n}の船は、{x}の生き物の巣になった。')}
];
})();
});
;
/* ==== js/ship.js ==== */
HK.Load.def(227,'js/ship.js',function(){
(function(){
'use strict';
var HK=window.HK,ST=HK.Story,SH=HK.SHIP=HK.SHIP||{};
if(!ST|| !SH.RES|| !SH.LIFE|| !SH.CIV|| !SH.T)return;
function clamp(v,a,b){return Math.max(a,Math.min(b,v));}
function L(s){return s.split('|');}
var ROLES=[
{id:'captain',label:'船長',sk:{talk:0.2,survive:0.2,lead:0.4},fit:function(t){return t.lead*0.6+t.cp*0.4;},desc:'船の舵取りと、皆のまとめ役'},
{id:'engineer',label:'エンジニア',sk:{repair:0.5},fit:function(t){return t.a*0.6+t.caution*0.4;},desc:'故障を直す。船の命綱'},
{id:'pilot',label:'航海士',sk:{nav:0.5,survive:0.1},fit:function(t){return t.a*0.4+t.impulse*0.3+t.fc*0.2;},desc:'星図を読み、新しい星を探す'},
{id:'doctor',label:'船医',sk:{med:0.55},fit:function(t){return t.np*0.5+t.a*0.4;},desc:'怪我や病気を治す'},
{id:'scientist',label:'科学者',sk:{sci:0.5,repair:0.1},fit:function(t){return t.a*0.7+t.cold*0.2;},desc:'星の資源を調べ、レポートを書く'},
{id:'biologist',label:'生物学者',sk:{bio:0.55,sci:0.15},fit:function(t){return t.a*0.4+t.fc*0.3+t.np*0.2;},desc:'異星の生命体を調べる'},
{id:'comms',label:'通信士',sk:{talk:0.45,nav:0.2},fit:function(t){return t.warmth*0.5+t.a*0.3;},desc:'信号を拾い、異星の文明と言葉を交わす'},
{id:'security',label:'保安員',sk:{fight:0.5,survive:0.3},fit:function(t){return t.aggr*0.5+t.cp*0.3+t.caution*0.2;},desc:'危険から皆を守る'},
{id:'cook',label:'料理人',sk:{cook:0.6,survive:0.1},fit:function(t){return t.np*0.5+t.fc*0.4;},desc:'乏しい食料で皆を支える'}
];
var ROLE={};ROLES.forEach(function(r){ROLE[r.id]=r;});
SH.ROLES=ROLES;
var R18ON= !!SH.R18;
var scen={
id:'ship',name:'宇宙船漂流記',kicker:'SF・サバイバル（2〜8人）',solo:true,minCast:2,maxCast:8,
desc:'故障した宇宙船で漂流する一年。閉ざされた船の中で役割を分け合い、新しい星を探す。星には資源・生命体・文明があり、探検するほど正体が明らかになる。辿り着けるのは、ただ一つの星だけ。',
note:'※死の描写を含みます。',
unit:'月',simulate:function(input){return run(input);},
castHint:'2〜8人。「役割」で船長・エンジニア・航海士・船医・科学者・生物学者・通信士・保安員・料理人を決められます（決めなければ気質から）。',
env:[
{id:'find',label:'星の見つかりやすさ',min:0,max:100,def:40,lo:'ほとんど見つからない',hi:'すぐ見つかる',desc:'毎月、星に辿り着けるかどうかの運。航海士と通信士の腕でも上がる'},
{id:'danger',label:'宇宙の過酷さ',min:0,max:100,def:45,lo:'穏やか',hi:'過酷',desc:'故障や事故、探索の危険の起きやすさ'},
{id:'supply',label:'積んでいる物資',min:0,max:100,def:50,lo:'ぎりぎり',hi:'潤沢',desc:'食料と修理部品の量'},
{id:'contact',label:'未知との遭遇',min:0,max:100,def:50,lo:'めったにない',hi:'たびたび',desc:'漂流中に、不思議なものに出会う頻度'},
{id:'romance',label:'恋愛の起こりやすさ',min:0,max:100,def:50,lo:'起きない',hi:'起きやすい',desc:'船員どうしの想い・恋人になる出来事の起こりやすさ。0にすると恋愛の交流（恋の気配・想い・告白・恋人）を出しません'}
].concat(R18ON?[{id:'slewd',label:'夜の出来事の起こりやすさ',min:0,max:100,def:40,lo:'起きない',hi:'たびたび',desc:'船員どうしの夜、星の花粉、異星の生き物、文明の儀式の起きやすさ'}]:[]),
stats:[{id:'hp',label:'体力',desc:'怪我や飢え、探索の危険への強さ'},{id:'tech',label:'技術',desc:'修理・航法・調査の腕'}],
perFields:[{id:'role',label:'役割',auto:'おまかせ（気質から）',options:ROLES.map(function(r){return{id:r.id,label:r.label};})}],
actions:[],goals:[],events:[]
};
HK.SCENARIOS.ship=scen;
var at=HK.SCEN_ORDER.indexOf('island');
if(HK.SCEN_ORDER.indexOf('ship')<0)HK.SCEN_ORDER.splice(at>=0?at+1:HK.SCEN_ORDER.length,0,'ship');
var W={lover:1,mate:1,fated:1,almost:0.8,fwb:0.45,sibling:0.8,sibprot:0.95,sibclose:0.9,parent:0.95,pparent:0.9,best:0.75,buddy:0.8,childhood:0.7,friend:0.5,mentor:0.6,master:0.6,teacher:0.5,senpai:0.4,colleague:0.3,classmate:0.4,boss:0.45,benefactor:0.6,relative:0.6,worship:0.85,fond:0.55,blind:0.75,acq:0.1,ex:0.3,rival: -0.3,enemy: -0.7,sibbad: -0.15,bad: -0.4};
var LOVE= /^(lover|mate|fated|almost|fwb|crush)$/,FAMILY= /^(sibling|sibprot|sibclose|sibbad|parent|pparent)$/;
function rk(a,b){return a.i<b.i?a.i+'-'+b.i:b.i+'-'+a.i;}
function ties(S,a,b){return S.ties.filter(function(t){return(t.a===a.i&&t.b===b.i)||(t.a===b.i&&t.b===a.i);});}
function bond(S,a,b){
var best=0,neg=0;
ties(S,a,b).forEach(function(t){var w=t.type==='crush'?(t.a===a.i?0.85:0.15):W[t.type]!=null?W[t.type]:0.1;if(w>best)best=w;if(w<neg)neg=w;});
return clamp((best>0?best+neg*0.3:neg)+(S.relD[rk(a,b)]||0),-1,1.2);
}
function loveOK(a,b){return!HK.canLove||(HK.canLove(a,b)&&HK.canLove(b,a));}
function lover(S,a,b){return!!(a&&b&&a!==b)&&(S.lovers||[]).some(function(x){return(x[0]===a.i&&x[1]===b.i)||(x[0]===b.i&&x[1]===a.i);});}
function amour(S,a,b){return lover(S,a,b)||(!HK.ngPair(a,b)&&ties(S,a,b).some(function(t){return LOVE.test(t.type);}));}
function loversOf(S,a){return S.P.filter(function(o){return o!==a&&o.alive&&lover(S,a,o);});}
function family(S,a,b){return ties(S,a,b).some(function(t){return HK.tieNoLove?HK.tieNoLove(t):FAMILY.test(t.type);});}
function setRel(S,a,b,d){var k=rk(a,b);S.relD[k]=clamp((S.relD[k]||0)+d,-1,1);}
function canJoin(S,a,b){
if(lover(S,a,b))return'ok';
if(!a|| !b||a===b|| !a.alive|| !b.alive||HK.ngPair(a,b)|| !loveOK(a,b)||family(S,a,b))return'';
if(!HK.Poly||HK.Poly.canCouple(S,a,b))return'ok';
if(HK.Poly.mode(S)!=='none'||(a.faithful&&loversOf(S,a).length)||(b.faithful&&loversOf(S,b).length))return'';
var ok=true;
[[a,b],[b,a]].forEach(function(pr){loversOf(S,pr[0]).forEach(function(l){if(l!==pr[1]&&bond(S,pr[0],pr[1])<bond(S,pr[0],l)+0.08)ok=false;});});
return ok?'switch':'';
}
function join(S,a,b){
var k=canJoin(S,a,b);
if(!k)return false;
if(lover(S,a,b))return true;
if(k==='switch')[[a,b],[b,a]].forEach(function(pr){loversOf(S,pr[0]).forEach(function(l){if(l!==pr[1])part(S,pr[0],l,pr[1]);});});
S.lovers.push([Math.min(a.i,b.i),Math.max(a.i,b.i)]);
return true;
}
function part(S,x,l,nw){
S.lovers=S.lovers.filter(function(pr){return!((pr[0]===x.i&&pr[1]===l.i)||(pr[0]===l.i&&pr[1]===x.i));});
S.exes.push([x.i,l.i]);
setRel(S,x,l,-0.35);mark(S,x,l,'part');stress(l,20);stress(x,6);
ST.say(S,{actors:[x,l,nw],tag:'別れ',text:F(pk(S,SH.T.SWITCH),{a:x.name,b:l.name,c:nw.name}),why:x.name+'は'+l.name+'と別れて、'+nw.name+'を選んだ（複数の恋人：なし。恋人は一人まで）',mag:28});
}
function capt(p){return p.role==='captain';}
function pleaser(p){return p.tr.ac>0.55&&(p.tr.np>0.45||p.tr.warmth>0.5);}
function stress(p,d){p.m.st=clamp((p.m.st||0)+(d>0?d*(capt(p)?0.6:1)*(pleaser(p)?1.2:1):d),0,100);}
function mark(S,a,b,kind){var k=rk(a,b),e=S.relEv[k]=S.relEv[k]||{};e[kind]=(e[kind]||0)+1;}
function role(p){return ROLE[p.role]||ROLE.captain;}
function skill(p,type){
var t=p.tr,tech=(p.stats.tech||3),base={
repair:t.a*0.35+t.caution*0.2+tech*0.05,nav:t.a*0.35+t.fc*0.1+tech*0.04,med:t.np*0.25+t.a*0.2,
sci:t.a*0.45+tech*0.04,bio:t.a*0.25+t.fc*0.2+t.np*0.1,talk:t.warmth*0.4+t.np*0.2,fight:t.aggr*0.3+t.cp*0.2+(p.stats.hp||3)*0.04,
survive:t.caution*0.3+t.cp*0.15+(p.stats.hp||3)*0.04,cook:t.np*0.3+t.fc*0.2,lead:t.lead*0.5
}[type]||0.2;
return clamp(base+((role(p).sk||{})[type]||0)-(p.m.hp<40?0.1:0),0,1.3);
}
function alive(p){return p.alive&& !p.away;}
function live(S){return S.P.filter(alive);}
function best(S,type,ex){return live(S).filter(function(p){return!ex||ex.indexOf(p)<0;}).sort(function(a,b){return skill(b,type)-skill(a,type);})[0];}
function names(l){return l.map(function(p){return p.name;}).join(l.length>2?'・':'と');}
function pk(S,a){return HK.Ero&&HK.Ero.fresh?HK.Ero.fresh(S,a,function(l){return ST.pick(S,l);}):ST.pick(S,a);}
function F(t,m){return ST.fmt(t,m||{});}
var GREEK=['α','β','γ','δ','ε','ζ','η','θ'];
var PN_CAT=['ケプラー','グリーゼ','ウルフ','ロス','ラカイユ','ティーガーデン','ラランド','ルイテン','カプタイン','ヴァン・マーネン'];
var PN_CODE=['LV-','PX-','KX-','RX-','XT-','NV-','ZR-','HX-','TQ-','SR-'];
var PN_MYTH=['タルタロス','ヘリオス','ニュクス','セレス','オルフェウス','ヴァルハラ','イシュタル','アルカディア','ネメシス','ハイペリオン','エレボス','ティアマト','アスフォデル','ミネルヴァ','ヨトゥン','ニブルヘイム','エリュシオン','アヴァロン','ケツァル','ベレニケ','セドナ','カリスト','オベロン','ラグナ','ゼフィロス','アトラス'];
var PN_ROMAN=['Ⅱ','Ⅲ','Ⅳ','Ⅴ','Ⅵ','Ⅶ','Ⅸ','Ⅻ'];
var PN_LETTER=['b','c','d','e','f','g','h'];
var PN_SUR=['新','第二の',''];
var PN_WORD=['ガイア','エデン','テラ','ホープ','ヘイヴン','ソラリス','オアシス'];
var PN_KANA=['ボ','バ','ポ','プ','ペ','ゾ','ズ','ギ','ガ','モ','ム','ヌ','ニ','ル','ラ','リ','タ','ト','ピ','ヨ','ケ','キ','ド','ダ','パ','ミ','メ','ノ','ヒ','フ'];
var PN_COLOR=['赤','青','白','黒','金','銀','翠','紫','灰','琥珀','瑠璃','薄紅'];
var PN_NOUN=['荒野','沈黙','揺りかご','涙','庭','果て','眠り','砂時計','祈り','迷宮','微笑','傷跡','鏡','花冠','残響','海'];
function oddName(rng){
var k=function(){return PN_KANA[rng.int(PN_KANA.length)];},a=k(),b=k(),c=k();
var pat=rng.int(8);
var n=pat===0?a+a+a+a+b:pat===1?a+a+b:pat===2?a+b+a+b:pat===3?a+a+b+b:pat===4?a+b+b+a:pat===5?a+'ン'+b+'ン':pat===6?a+'ー'+b+c:a+b+'・'+c+c;
return n+'星';
}
var PN_SELF={
CP:['グレート','キング','インペリアル','鉄の','偉大なる'],
NP:['スウィート','マザー','やさしい','ハッピー','ぬくもりの'],
A:['ドクター','ロジカル','プロフェッサー','観測者','第一'],
FC:['プリティ','スーパー','ミラクル','キラキラ','ファンキー'],
AC:['リトル','ちいさな','ひっそり','おずおず','ささやかな']
};
function selfName(rng,p){
var top=p.eg&&HK.egoType?HK.egoType(p.eg).top:'FC',L0=PN_SELF[top]||PN_SELF.FC,w=L0[rng.int(L0.length)];
return{name:(/^[ァ-ヶー]+$/.test(w)?w+'・':w)+p.name+'星',top:top,deco:w};
}
function planetName(rng,namer){
var r=rng();
if(namer&&r<0.12){var sn=selfName(rng,namer);return{name:sn.name,how:'self',deco:sn.deco,top:sn.top};}
if(r<0.28)return{name:PN_CAT[rng.int(PN_CAT.length)]+(rng()<0.5?'-':'')+(10+rng.int(990))+PN_LETTER[rng.int(PN_LETTER.length)],how:'cat'};
if(r<0.42)return{name:PN_CODE[rng.int(PN_CODE.length)]+(100+rng.int(900)),how:'cat'};
if(r<0.58)return{name:PN_MYTH[rng.int(PN_MYTH.length)]+(rng()<0.7?PN_ROMAN[rng.int(PN_ROMAN.length)]:''),how:'myth'};
if(r<0.65)return{name:PN_SUR[rng.int(PN_SUR.length)]+PN_WORD[rng.int(PN_WORD.length)]+(rng()<0.5?'-'+(2+rng.int(8)):''),how:'hope'};
if(r<0.82)return{name:oddName(rng),how:'odd'};
if(r<0.95)return{name:PN_COLOR[rng.int(PN_COLOR.length)]+'の'+PN_NOUN[rng.int(PN_NOUN.length)],how:'color'};
return{name:PN_MYTH[rng.int(PN_MYTH.length)]+'・'+GREEK[rng.int(GREEK.length)],how:'myth'};
}
var NAMING={
cat:L('{a}は、星図の決まりどおりに「{x}」と登録した。|{a}は、航法記録の番号をそのまま使って「{x}」と名づけた。{a}「覚えやすさより、正確さが大事だから｜覚えやすさより、正確さが大事だ｜覚えやすさより、正確さが大事ですから」'),
myth:L('{a}は、古い神話から名を借りて「{x}」と名づけた。|{a}は、子どもの頃に読んだ星の物語を思い出し、その星を「{x}」と呼ぶことにした。'),
hope:L('{a}は、願いを込めて「{x}」と名づけた。ここが、新しい故郷になるようにと。|{a}は少し照れながら「{x}」と書き込んだ。誰も笑わなかった。'),
odd:L('{a}は、星を見た瞬間に浮かんだ響きのまま「{x}」と名づけた。{a}「そういう顔をしてたから｜そういう顔をしていたからだ｜そういう顔をしていたからです」――意味を訊かれても、それしか答えなかった。|{a}が命名欄に「{x}」と書き込んだ。{b}は二度見したが、{a}はもう次の観測に移っていた。|{a}の口から、なぜか「{x}」という名前がこぼれ落ちた。言ってみると、もうそれ以外の名前は考えられなかった。'),
color:L('{a}は、窓いっぱいに広がる星の色を見つめて、「{x}」と名づけた。|{a}は星の第一印象をそのまま名前にした。「{x}」。誰も異を唱えなかった。')
};
var NAMING_SELF={
CP:L('{a}は胸を張って「{x}」と命名した。{a}「見つけた者が名をつける。当然の権利だ」{b}は呆れたが、反対はしなかった。|{a}は堂々と「{x}」と書き込んだ。{b}の抗議は、{a}のひと睨みで静かになった。'),
NP:L('{a}は少し照れながら「{x}」と名づけた。{a}「みんなが帰ってこられる場所になってほしいから」{b}は笑って、そのまま採用した。|{a}は命名欄に「{x}」と書いて、すぐに消そうとした。{a}「やっぱり変かな」{b}がその手を止めた。'),
A:L('{a}は「{x}」と登録した。{a}「発見者の名を冠するのは、天文学の慣例だから」{b}は、{a}の耳が少し赤いのに気づいていた。|{a}は事務的な口調で「{x}」と命名した。ただ、記録を保存したあと、こっそり三回読み返していた。'),
FC:L('{a}「決めた！　この星は今日から{x}！」{b}が「自分の名前をつけるのはずるい」と言ったが、{a}はもう星に向かって手を振っていた。|{a}はうきうきと命名欄に「{x}」と打ち込み、勝手に記念写真まで撮った。{b}は頭を抱えたが、結局その名前で呼ぶことになった。'),
AC:L('{a}「だ、だめならいいんだけど……{x}って、どうかな」{b}が「いいじゃん」と言うと、{a}は真っ赤になってうつむいた。|{a}は誰にも言わずに、命名欄にそっと「{x}」と書き込んだ。{b}が気づいたのは、星に着いてからだった。')
};
function makePlanet(S,namer){
var rng=S.rng,T=SH.RES||[],LF=SH.LIFE||[],CV=SH.CIV||[];
var res=rng.pick(T),civ=rng.pick(CV),n=rng()<0.22?0:rng()<0.55?1:rng()<0.75?2:3;
var life=[],pool=LF.slice();
for(var k=0;k<n&&pool.length;k++){var x=pool.splice(rng.int(pool.length),1)[0];life.push({d:x,st:0});}
var pn=planetName(rng,namer),name=pn.name;
var rare=clamp(Math.round((res.rare+civ.rare+(life.length?Math.max.apply(null,life.map(function(l){return l.d.rare;})):1))/3+(life.length>=3?0.6:life.length===2?0.3:0)),1,5);
return{name:name,naming:pn,res:{d:res,st:0},civ:{d:civ,st:0},life:life,rare:rare,at:0};
}
function stars(n){return'★★★★★'.slice(0,n)+'☆☆☆☆☆'.slice(0,5-n);}
function targets(S){
var Pn=S.planet,out=[{kind:'res',o:Pn.res}].concat(Pn.life.map(function(l){return{kind:'life',o:l};}));
if(Pn.civ.d.state!=='none'||Pn.civ.st<3)out.push({kind:'civ',o:Pn.civ});
return out.filter(function(x){return x.o.st<3;});
}
var STAGE=['','hint','detail','deep'],LIFE_STAGE=['','look','habit','deep'];
var KIND_JP={res:'資源',life:'生命体',civ:'文明'};
var USE_JP={hull:'船体の修理',power:'動力',o2:'生命維持',food:'食料',med:'薬',none:'研究'};
var LIFE_JP={friendly:'人懐っこい',neutral:'無関心',hostile:'攻撃的',symbiotic:'共生する',parasite:'寄生する',plant:'植物・菌類'};
var CIV_JP={none:'文明なし',ruins:'遺跡',primitive:'素朴な文明',living:'現役の文明',advanced:'高度文明',transcendent:'理解を超えた存在'};
function run(input){
var S=ST.state(input,'ship'),rng=S.rng,env=S.env,P=S.P,T=SH.T;
S.egoNotes=true;S.bondFn=bond;
S.ties=(input.ties||[]).filter(function(t){return t.a!==t.b&&t.a<P.length&&t.b<P.length&& !(HK.ngPair(P[t.a],P[t.b])&& /^(lover|fwb|mate|fated|crush|almost|ex|yan)$/.test(t.type));});
S.relD={};S.relEv={};S.exes=[];S.jeal=[];S.left=[];S.saved=[];S.bday={};S.items=[];S.reports=[];S.planet=null;S.deaths=[];
S.lovers=[];
S.ties.forEach(function(t){var a=P[t.a],b=P[t.b];if(/^(lover|mate|fated)$/.test(t.type)&&loveOK(a,b)&& !lover(S,a,b))S.lovers.push([Math.min(t.a,t.b),Math.max(t.a,t.b)]);});
var sup=env.supply/100;
S.ship={hull:85,power:75+sup*15,o2:85,food:45+sup*45,morale:60};
var taken={};
P.forEach(function(p){
var want=(((input.perChar&&input.perChar[p.i])||{}).pick||{}).role;
p.alive=true;p.m={hp:70+(p.stats.hp||3)*6,fear:15+p.tr.ac*10,find:0,st:10+p.tr.ac*10};p.cnt={find:0,item:0,report:0,fix:0};p.notes=p.notes||[];
if(ROLE[want]){p.role=want;p.picked=true;taken[want]=(taken[want]||0)+1;}
});
var order=['captain','engineer','pilot','doctor','scientist','biologist','comms','security','cook'];
P.filter(function(p){return!p.role;}).forEach(function(p){
var open=order.filter(function(r){return!taken[r];});
var list=open.length?open:order;
var r=list.slice().sort(function(x,y){return ROLE[y].fit(p.tr)-ROLE[x].fit(p.tr)+(open.length?(list.indexOf(x)-list.indexOf(y))*0.04:0);})[0];
p.role=r;taken[r]=(taken[r]||0)+1;
});
P.forEach(function(p){p.roleLabel=ROLE[p.role].label;});
if(SH.SPEC)SH.SPEC.setup(S,input);
var keys=['hp','fear','find','st'];
ST.step(S,'漂流のはじまり');
ST.say(S,{kind:'phase',text:pk(S,L('警報が鳴り止んだとき、船はもう航路を外れていた。主機関は沈黙し、救難信号に応える声はない。|小惑星帯をかすめた衝撃で、船は航路を失った。窓の外には、見知らぬ星座だけが広がっていた。|ワープの失敗で、船は星図にない宙域に投げ出された。帰り道は、もう分からなかった。'))+names(P)+'は、新しい星を探して漂い続けることに決めた。'+(HK.Attr&&HK.Attr.raceIntro?HK.Attr.raceIntro(P,'alert',S):'')});
P.forEach(function(p){ST.sayB(S,{actors:[p],tag:p.roleLabel,text:p.name+'（'+p.roleLabel+'）――'+ROLE[p.role].desc+'。',why:'役割：'+p.roleLabel+(p.picked?'（指定）':'（気質から）')},p.name+'は'+p.roleLabel);});
ST.snap(S,keys);
for(var m=1;m<=12||(S.after&& !S.after.end);m++){
S.m=m;
if(SH.SPEC)SH.SPEC.month(S);
if(S.after&&SH.AFTER){if(!SH.AFTER.month(S,m,input))break;ST.snap(S,keys);continue;}
if(!live(S).length)break;
ST.step(S,m+'か月目');
ST.budget(S,4+Math.ceil(live(S).length/2));
if(rng()<0.35)ST.say(S,{kind:'phase',text:pk(S,T.MONTH)});
if(!S.planet){
searchPlanet(S,m);
if(!S.planet&&rng()<env.contact/100*0.45)space(S);
}else if(S.planet.at<m)explore(S,m);
if(rng()<0.22+env.danger/100*0.35)trouble(S);
doom(S,m);
crisis(S);
shipLife(S);
if(HK.Obsess&&HK.Obsess.storyTick){var ob=HK.Obsess.storyTick(S,live(S),{rate:0.3});if(ob){ST.say(S,{actors:ob.actors,tag:ob.tag,kind:ob.kind,text:ob.text,why:ob.why,mag:ob.mag});setRel(S,ob.actors[0],ob.actors[1],0.04);mark(S,ob.actors[0],ob.actors[1],'jealous');}}
if(R18ON&&r18on(S))nightR18(S);
upkeep(S,m);
ST.flushShort(S,'ほかに：');
ST.snap(S,keys);
}
epilogue(S);
return finish(S,input);
}
function searchPlanet(S,m){
var rng=S.rng,nav=best(S,'nav'),com=best(S,'talk',nav?[nav]:[]);
var ch=0.01+S.env.find/100*0.14+(nav?skill(nav,'nav')*0.05:0)+(com?skill(com,'talk')*0.02:0)+(S.ship.power>40?0.02: -0.02);
if(rng()>=ch){
if(rng()<0.5)ST.sayB(S,{kind:'phase',text:pk(S,SH.T.DRIFT),why:'この月は、星に辿り着けなかった（運 '+Math.round(ch*100)+'%）'},'星は見つからない');
return;
}
var a=nav||live(S)[0];
var Pn=S.planet=makePlanet(S,a);Pn.at=m;
var nb=live(S).filter(function(q){return q!==a;})[0],nv={a:a.name,b:nb?nb.name:'仲間',x:Pn.name};
var nmT=Pn.naming.how==='self'?F(pk(S,NAMING_SELF[Pn.naming.top]||NAMING_SELF.FC),nv):F(pk(S,NAMING[Pn.naming.how]),nv);
var o=ST.say(S,{actors:[a],tag:'星を発見',kind:'climax',text:F(pk(S,SH.T.FOUND),{a:a.name,x:Pn.name}).split('惑星'+Pn.name).join(/星$/.test(Pn.name)?Pn.name:'惑星'+Pn.name).split('星'+Pn.name).join(/星$/.test(Pn.name)?Pn.name:'星'+Pn.name)+nmT+F(pk(S,SH.T.ARRIVE),{x:Pn.name})+' '+Pn.res.d.sky+' '+(Pn.civ.d.sky||''),why:m+'か月目に、星に辿り着いた（運 '+Math.round(ch*100)+'%・'+a.name+'の航法）。名づけたのは'+a.name+(Pn.naming.how==='self'?'（自分の名前に、'+Pn.naming.top+'優位らしい飾り「'+Pn.naming.deco+'」をつけた）':'')+'。珍しさ '+stars(Pn.rare)+'（まだ探索していないので、中身は分からない）',mag:40});
ST.key(S,o,Pn.name+'を発見した');
a.cnt.find++;
}
function team(S,kind){
var lead=kind==='res'?best(S,'sci'):kind==='life'?best(S,'bio'):best(S,'talk');
var esc=best(S,'fight',[lead]),out=[lead];
if(esc&&live(S).length>2&&S.rng()<0.75)out.push(esc);
if(live(S).length>4&&S.rng()<0.4){var x=live(S).filter(function(p){return out.indexOf(p)<0;});if(x.length)out.push(S.rng.pick(x));}
return out.filter(Boolean);
}
function explore(S,m){
var rng=S.rng,Pn=S.planet,nEx=live(S).length>=4&&rng()<0.5?2:1;
for(var e=0;e<nEx;e++){
var tg=targets(S);
if(!tg.length){if(e===0)ST.sayB(S,{kind:'phase',text:Pn.name+'の調査は、もう終わっていた。一行は物資を補給し、船を整えて過ごした。',why:''},'補給の月');S.ship.food=clamp(S.ship.food+8,0,100);return;}
var x=HK.weighted(rng,tg,function(q){return 1.3-q.o.st*0.35;});
var tm=team(S,x.kind);
if(!tm.length)return;
var a=tm[0],d=x.o.d,stg=x.o.st+1;
var sk=skill(a,x.kind==='res'?'sci':x.kind==='life'?'bio':'talk')+tm.slice(1).reduce(function(s0,q){return s0+skill(q,'survive')*0.3;},0);
var diff=0.35+d.rare*0.07+stg*0.08+(x.kind==='life'&&d.kind==='hostile'?0.12:0)+(x.kind==='civ'&&d.state==='advanced'?0.08:0)+S.env.danger/100*0.12;
var ok=sk+rng()*0.55>=diff;
var t=F(pk(S,SH.T.LAND),{a:a.name,x:Pn.name})+(tm.length>1?names(tm.slice(1))+'も同行した。':'');
if(x.kind==='life'&& !x.o.st&&d.stealth&&d.miss&&rng()<d.stealth*(1.15-sk*0.35)){
x.o.missed=(x.o.missed||0)+1;
a.m.fear=clamp(a.m.fear+4,0,100);
ST.say(S,{actors:tm,tag:'探索：何も見つからない',text:t+F(pk(S,d.miss),{a:a.name,x:Pn.name}),why:'何かがいる気配はあったが、正体に気づけなかった（見つけにくさ '+Math.round(d.stealth*100)+'・空振り '+x.o.missed+'回目）',mag:14});
if(R18ON&&r18on(S)&&rng()<S.env.slewd/100*0.3)xeno(S,a,d,'invade',true);
continue;
}
var lab=KIND_JP[x.kind]+(x.kind==='life'?'「'+(x.o.st?d.name:'未知の生命体')+'」':'');
if(ok){
x.o.st=stg;
var key=x.kind==='life'?LIFE_STAGE[stg]:STAGE[stg];
t+=F(d[key],{a:a.name,x:Pn.name});
a.cnt.find++;a.m.find++;
if(stg===2){
if(x.kind!=='res'&&d.good)t+=F(d.good,{a:a.name,x:Pn.name});
if(d.item){S.items.push({name:d.item,desc:d.itemDesc||'',by:a.name,kind:x.kind});a.cnt.item++;t+='――'+a.name+'は『'+d.item+'』を船に持ち帰った。';useItem(S,d,x.kind);}
}
var o=ST.say(S,{actors:tm,tag:'探索：'+lab,text:t,why:KIND_JP[x.kind]+'の調査に成功（'+['','手がかり','詳細','最深部'][stg]+'まで判明）／'+a.name+'の'+(x.kind==='res'?'科学':x.kind==='life'?'生物学':'交渉')+'の腕 '+Math.round(sk*100)+'・難しさ '+Math.round(diff*100),mag:stg===3?34:22});
if(stg===3){
var wr=best(S,x.kind==='life'?'bio':'sci')||a;
S.reports.push({title:d.report,by:wr.name});wr.cnt.report++;
ST.say(S,{actors:[wr],tag:'レポート',text:wr.name+'は、船に戻るとすぐに端末へ向かった。何日もかけて、レポート『'+d.report+'』を書き上げた。',why:KIND_JP[x.kind]+'の最深部まで明らかになった'});
ST.key(S,o,d.name+'の正体が明らかになった');
}else if(stg===1&&x.kind==='life')ST.key(S,o,'生命体「'+d.name+'」を見つけた');
if(R18ON&&r18on(S)&&x.kind==='life'&&rng()<S.env.slewd/100*0.35)alienR18(S,a,d);
if(x.kind==='life'&& /parasite|symbiotic/.test(d.kind)&&rng()<0.2*HK.Dark.f(S,'kill'))infect(S,a,d.name);
}else{
var hurt=12+rng.int(18)+(x.kind==='life'&&d.kind==='hostile'?8:0);
var dead=rng()<(0.03+S.env.danger/100*0.2+d.rare*0.02+(x.kind==='life'&&d.kind==='hostile'?0.08:0))*HK.Dark.f(S,'kill');
var v=tm.length>1&&rng()<0.4?tm[1]:a;
if(dead){die(S,v,Pn.name+'の'+KIND_JP[x.kind]+'の調査中に',t+F(d.death,{v:v.name,w:(tm.filter(function(q){return q!==v;})[0]||{name:'仲間'}).name,x:Pn.name}));continue;}
a.m.hp=clamp(a.m.hp-hurt,1,100);a.m.fear=clamp(a.m.fear+10,0,100);
t+=F(x.kind==='res'?d.trouble:d.bad,{a:a.name,x:Pn.name});
ST.say(S,{actors:tm,tag:'探索失敗',text:t,why:lab+'の調査に失敗（'+a.name+'の体力 -'+hurt+'）',mag:20});
heal(S,a);
if(x.kind==='life'&&rng()<0.35*HK.Dark.f(S,'kill'))infect(S,a,d.name);
else if(rng()<0.12+S.env.danger/100*0.1){lose(S,a);continue;}
}
if(rng()<0.4)ST.sayB(S,{actors:tm,text:F(pk(S,SH.T.BACK),{a:a.name,x:Pn.name}),why:''},names(tm)+'が帰船');
}
}
function useItem(S,d,kind){
if(kind!=='res'|| !d.use||d.use==='none')return;
var sp=S.ship,k={hull:'hull',power:'power',o2:'o2',food:'food'}[d.use];
if(k)sp[k]=clamp(sp[k]+25,0,100);
if(d.use==='med')live(S).forEach(function(p){p.m.hp=clamp(p.m.hp+15,0,100);});
}
function trouble(S){
var rng=S.rng,tr=rng.pick(SH.T.TROUBLE),fx=best(S,'repair');
if(!fx)return;
var ok=skill(fx,'repair')+rng()*0.5>=0.45+S.env.danger/100*0.25;
var t=tr.intro;
if(ok){
fx.cnt.fix++;
t+=F(tr.ok,{a:fx.name});
ST.say(S,{actors:[fx],tag:'故障：'+tr.name,trouble:true,text:t,why:fx.name+'が直した（修理の腕 '+Math.round(skill(fx,'repair')*100)+'）',mag:18});
return;
}
var sp=S.ship,dmg=15+rng.int(15);
if(tr.stat==='crew')live(S).forEach(function(p){p.m.hp=clamp(p.m.hp-8,1,100);});
else if(sp[tr.stat]!=null)sp[tr.stat]=clamp(sp[tr.stat]-dmg,0,100);
S.ship.morale=clamp(S.ship.morale-6,0,100);
if(rng()<(0.06+S.env.danger/100*0.32)*(live(S).length<=2?0.35:live(S).length===3?0.7:1)*HK.Dark.f(S,'kill')){
var v=rng.pick(live(S)),w=live(S).filter(function(q){return q!==v;})[0];
return die(S,v,tr.name+'で',t+F(tr.ng,{a:fx.name})+F(tr.death,{v:v.name,w:w?w.name:'仲間'}));
}
ST.say(S,{actors:[fx],tag:'故障：'+tr.name,trouble:true,text:t+F(tr.ng,{a:fx.name}),why:'修理に失敗（'+({hull:'船体',power:'動力',o2:'生命維持',food:'食料',crew:'全員の体力'}[tr.stat]||'')+'が減った）',mag:22});
}
function doom(S,m){
var rng=S.rng,D=S.doom,L0=live(S),DM=SH.DOOM;
if(!DM|| !L0.length)return;
var x=S.planet?S.planet.name:'';
if(!D){
if(m<2||S.doomDone)return;
var n=S.P.length,k=n>=5?1.5:n===4?0.8:n===3?0.3:0;
if(rng()>=(0.012+S.env.danger/100*0.02)*k*HK.Dark.f(S,'wipe'))return;
var d=rng.pick(DM.filter(function(y){return!y.planet||S.planet;}));
S.doom={d:d,tries:0,at:m};
S.ship.morale=clamp(S.ship.morale-10,0,100);
L0.forEach(function(q){stress(q,12);q.m.fear=clamp(q.m.fear+12,0,100);});
var o0=ST.say(S,{actors:[],tag:'危機：'+d.name,kind:'climax',trouble:true,doom:d.id,text:F(pk(S,d.start),{x:x}),why:'船そのものを滅ぼしかねないトラブル（宇宙の過酷さ '+S.env.danger+'）。食い止められなければ、全員の命はない',mag:40});
ST.key(S,o0,d.name+'の兆し');
return;
}
if(D.at===m)return;
var a=best(S,D.d.skill)||L0[0],help=L0.filter(function(q){return q!==a&&skill(q,D.d.skill)>=0.45;}).length;
var ch=0.38+skill(a,D.d.skill)*0.3+Math.min(help,2)*0.05-S.env.danger/100*0.1-D.tries*0.05;
D.tries++;
ch=HK.Dark.live(S,ch,'wipe');
var SKJ={repair:'修理',med:'医療',sci:'科学',fight:'戦い'}[D.d.skill]||'';
if(rng()<ch){
S.doom=null;S.doomDone=true;a.cnt.fix++;
S.ship.morale=clamp(S.ship.morale+12,0,100);
L0.forEach(function(q){if(q!==a)setRel(S,q,a,0.1);stress(q,-8);});
var o1=ST.say(S,{actors:[a],tag:'危機を回避：'+D.d.name,kind:'climax',trouble:true,text:F(pk(S,D.d.ok),{a:a.name,x:x}),why:a.name+'の'+SKJ+'の腕（'+Math.round(skill(a,D.d.skill)*100)+'）'+(help?'・手伝える仲間 '+help+'人':'')+'（成功の見込み '+Math.round(ch*100)+'%）',mag:40});
ST.key(S,o1,a.name+'が'+D.d.name+'を食い止めた');
return;
}
if(D.tries<2){
S.ship.morale=clamp(S.ship.morale-8,0,100);
L0.forEach(function(q){stress(q,10);});
ST.say(S,{actors:[a],tag:'危機：'+D.d.name,kind:'climax',trouble:true,text:F(pk(S,D.d.ng),{a:a.name,x:x}),why:a.name+'が立ち向かったが、食い止められなかった（成功の見込み '+Math.round(ch*100)+'%）。次で止められなければ終わりだ',mag:35});
return;
}
var all=L0.slice();
var o2=ST.say(S,{actors:all.map(function(q){return q;}),tag:'全滅：'+D.d.name,kind:'climax',trouble:true,doom:D.d.id,text:F(pk(S,D.d.ng),{a:a.name,x:x})+F(pk(S,D.d.end),{n:names(all),x:x}),why:'二度目も食い止められなかった（成功の見込み '+Math.round(ch*100)+'%）',mag:70});
ST.key(S,o2,D.d.name+'で全滅');
all.forEach(function(q){q.alive=false;q.fate='死亡（'+m+'か月目・'+D.d.name+'）';S.deaths.push(q);});
S.doom=null;S.doomDone=true;S.wipeBy=D.d;
if(SH.AFTER)SH.AFTER.wipe(S,m);
}
function space(S){
var rng=S.rng,en=rng.pick(SH.T.SPACE),a=best(S,rng()<0.5?'sci':'nav')||live(S)[0];
var ok=skill(a,'sci')*0.5+skill(a,'nav')*0.5+rng()*0.6>=0.5;
var t=en.intro;
if(ok){
t+=F(en.ok,{a:a.name});
if(en.item){S.items.push({name:en.item,desc:en.itemDesc||'',by:a.name,kind:'space'});a.cnt.item++;t+='――『'+en.item+'』を手に入れた。';}
var o=ST.say(S,{actors:[a],tag:'未知との遭遇：'+en.name,text:t,why:a.name+'の判断（科学・航法）',mag:26});
return ST.key(S,o,en.name+'に出会った');
}
if(en.death&&rng()<(0.15+S.env.danger/100*0.15)*HK.Dark.f(S,'kill')){var v=rng.pick(live(S));return die(S,v,en.name+'に遭遇して',t+F(en.ng,{a:a.name})+F(en.death,{v:v.name,w:a===v?'仲間':a.name}));}
S.ship.hull=clamp(S.ship.hull-10,0,100);a.m.hp=clamp(a.m.hp-10,1,100);
ST.say(S,{actors:[a],tag:'未知との遭遇：'+en.name,text:t+F(en.ng,{a:a.name}),why:'対応を誤った（船体 -10）',mag:22});
}
function shipLife(S){
var rng=S.rng,L0=live(S),sp=S.ship,T=SH.T;
if(!L0.length)return;
var r=rng.pick(L0);
if(T.ROLE[r.role])ST.sayB(S,{actors:[r],tag:r.roleLabel,text:F(pk(S,T.ROLE[r.role]),{a:r.name}),why:r.roleLabel+'の仕事'},r.name+'は'+r.roleLabel+'の仕事');
var ck=L0.filter(function(p){return p.role==='cook';})[0];
if(ck&&rng()<0.5){sp.morale=clamp(sp.morale+6+skill(ck,'cook')*6,0,100);ST.sayB(S,{actors:[ck],tag:'食事',text:F(pk(S,T.MEAL),{a:ck.name}),why:'料理人の腕で士気が上がった'},ck.name+'の料理');}
bonds(S);
var lo=L0.filter(function(p){return p.m.fear>55||p.tr.ac>0.6;})[0];
if(lo&&rng()<0.3){lo.m.fear=clamp(lo.m.fear+4,0,100);ST.sayB(S,{actors:[lo],tag:'孤独',text:F(pk(S,T.LONELY),{a:lo.name}),why:''},lo.name+'は宇宙の静けさに沈んだ');}
if(rng()<0.12+S.env.danger/100*0.08){
var sk=rng.pick(L0);sk.m.hp=clamp(sk.m.hp-12,1,100);stress(sk,5);
ST.sayB(S,{actors:[sk],tag:'病気',text:F(pk(S,T.SICK),{a:sk.name}),why:'体力 -12'},sk.name+'が体調を崩した');
heal(S,sk);
if(rng()<0.45)nurse(S,sk);
}
}
function infect(S,a,src){
if(!SH.C|| !a||a.inf|| !alive(a))return;
a.inf=1;a.infSrc=src;stress(a,10);a.cnt.inf=(a.cnt.inf||0)+1;
ST.say(S,{actors:[a],tag:'感染症',text:F(pk(S,SH.C.INF_START),{a:a.name,x:src}),why:src+'の調査で、未知の病原体に感染した',mag:26});
if(SH.AFTER)SH.AFTER.react(S,a,'start');
}
function lose(S,a){
if(!SH.C|| !alive(a)||live(S).length<2)return;
a.away='lost';a.awayM=0;stress(a,15);
var o=ST.say(S,{actors:[a],tag:'遭難',text:F(pk(S,SH.C.LOST),{a:a.name}),why:'探索の失敗で、仲間とはぐれた',mag:30});
ST.key(S,o,a.name+'の遭難');
}
function closest(S,a,ex){return live(S).filter(function(q){return q!==a&&(!ex||ex.indexOf(q)<0);}).sort(function(x,y){return bond(S,y,a)-bond(S,x,a);})[0];}
function xeno(S,a,d,onlyMode,hidden){
var X2=SH.X2,rng=S.rng;
if(!X2|| !a|| !d|| !sxRoom(S,[a]))return false;
if(HK.State&& !HK.State.mobSexOk(a))return false;
if(HK.Content&& !HK.Content.ok(S,'force')&& !(HK.Pos&&HK.Pos.hardTopNpc(a)))return false;
var ms=X2.modes(d).filter(function(m){return!onlyMode||m[0]===onlyMode;});
if(!ms.length)return false;
var m=HK.weighted(rng,ms,function(x){return x[1];})[0];
var top=HK.Pos&&HK.Pos.hardTopNpc(a),b=closest(S,a)||{name:'仲間'},v={a:a.name,b:b.name,x:hidden?'正体の分からない何か':d.name};
var pick=function(arr){return pk(S,arr);};
var body=top?pick(X2.TOP[m]):X2.text(S,d,m,pick);
if(!body)return false;
var ft=a.eg&&HK.egoType?HK.egoType(a.eg).top:'NP';
var t=F(body,v)+(top?'':F(pick(X2.AFTER[m]),v)+(X2.REACT&&X2.REACT[ft]&&rng()<0.7?F(pick(X2.REACT[ft]),v):''));
var lw0=lewdOf(S),xl=HK.Lewd&&HK.Lewd.conf('ship')?S.env.lewdLen:'mix';
var tk=xl!=='short'&&lw0.lv!=='low'&&X2.thick&&X2.thick(S,d,m,a,top,body,ft,xl==='thick');
if(tk)t=F(tk,v);
t=xLewd(S,a,top,t,v,m);
a.cnt.r18=(a.cnt.r18||0)+1;sxNote(S,[a]);
if(!top){stress(a,m==='lure'?6:m==='probe'?8:14);a.m.fear=clamp(a.m.fear+(m==='force'||m==='take'?8:2),0,100);}
else stress(a,-5);
var o=ST.say(S,{actors:[a],tag:X2.TAG[m],kind:'climax',text:t,why:(hidden?'まだ正体に気づいていない生命体（のちに分かる名は「'+d.name+'」）':d.name+'（'+LIFE_JP[d.kind]+'）')+'／'+X2.MODE_NAME[m]+(top?'／自分で攻めを選んでいるので、受けにはならず主導権を握った':''),mag:30});
if(!S.xenoKey){S.xenoKey=true;ST.key(S,o,a.name+'と'+d.name);}
return true;
}
function lure(S){
var rng=S.rng,Pn=S.planet,X=SH.X,src=[];
if(!sxRoom(S))return;
var seen=Pn.life.filter(function(l){return l.st>=1;});
var xl=live(S).filter(function(q){return!HK.State||HK.State.mobSexOk(q);});
if(SH.X2&&seen.length&&xl.length&&rng()<0.7&&xeno(S,rng.pick(xl),rng.pick(seen).d))return;
if(!SH.X2)Pn.life.forEach(function(l){if(l.st>=1&& /friendly|neutral/.test(l.d.kind))src.push({x:l.d.name,pool:X.lureLife});});
if(Pn.civ.st>=1&& /primitive|living/.test(Pn.civ.d.state))src.push({x:Pn.civ.d.name,pool:X.lureCiv});
if(!src.length)return;
if(!xl.length)return;
var o=rng.pick(src),a=rng.pick(xl),b=closest(S,a)||{name:'仲間'};
var top=HK.Pos&&HK.Pos.hardTopNpc(a),m={a:a.name,b:b.name,x:o.x};
var t=F(pk(S,o.pool),m)+(top?F(pk(S,X.lureTop),m):F(pk(S,X.huge),m)+F(pk(S,X.hugeAct),m)+F(pk(S,X.lureAfter),m));
t=xLewd(S,a,top,t,m,o.pool===X.lureCiv?'civ':'lure');
a.cnt.r18=(a.cnt.r18||0)+1;stress(a,top? -5:8);sxNote(S,[a]);
var r=ST.say(S,{actors:[a],tag:'異種族の誘い',kind:'climax',text:t,why:o.x+'の誘い。言葉が通じず、誘われているとは分からなかった'+(top?'／自分で攻めを選んでいるので、主導権を握った':''),mag:32});
if(!S.lureKey){S.lureKey=true;ST.key(S,r,a.name+'と'+o.x);}
}
function crisis(S){
if(!SH.C)return;
var rng=S.rng,Pn=S.planet,C=SH.C;
live(S).filter(function(p){return p.inf;}).forEach(function(a){
if(!alive(a))return;
var dr=live(S).filter(function(q){return q!==a&& !q.inf;}).sort(function(x,y){return skill(y,'med')-skill(x,'med');})[0];
if(dr&&rng()<HK.Dark.live(S,0.1+skill(dr,'med')*0.4,'kill')){
a.inf=0;setRel(S,a,dr,0.2);mark(S,a,dr,'nurse');stress(a,-10);
ST.say(S,{actors:[dr,a],tag:'感染症',text:F(pk(S,C.INF_CURE),{a:a.name,b:dr.name,x:a.infSrc||'星の生き物'}),why:dr.name+'の医療の腕 '+Math.round(skill(dr,'med')*100),mag:22});
if(SH.AFTER)SH.AFTER.react(S,a,'cure',[dr]);
return;
}
if(rng()<HK.Dark.live(S,0.08+a.m.hp/100*0.1,'kill')){a.inf=0;ST.sayB(S,{actors:[a],tag:'感染症',text:F(pk(S,C.INF_SELF),{a:a.name}),why:'自分の体の力で持ち直した'},a.name+'は病に打ち勝った');if(SH.AFTER)SH.AFTER.react(S,a,'cure');return;}
a.inf++;a.m.hp=clamp(a.m.hp-8*a.inf,1,100);stress(a,8);
live(S).forEach(function(q){if(q!==a)stress(q,3);});
if(a.inf>=3&&rng()<(0.35+S.env.danger/100*0.2)*HK.Dark.f(S,'kill')){var w=closest(S,a)||{name:'仲間'};die(S,a,'感染症で',F(pk(S,C.INF_DEATH),{v:a.name,w:w.name}));return;}
ST.sayB(S,{actors:[a],tag:'感染症',text:F(pk(S,C.INF_WORSE),{a:a.name}),why:'病状が悪化した（段階 '+a.inf+'・体力 '+Math.round(a.m.hp)+'）'},a.name+'の病状が悪化した');
if(SH.AFTER)SH.AFTER.react(S,a,'worse');
var cand=live(S).filter(function(q){return q!==a&& !q.inf;});
var q=cand.length?HK.weighted(rng,cand,function(z){return 0.1+Math.max(0,bond(S,z,a))*1.5+(amour(S,z,a)?1:0);}):null;
if(q&&rng()<(0.12+Math.max(0,bond(S,q,a))*0.25+(amour(S,q,a)?0.15:0))*HK.Dark.f(S,'kill')){
q.inf=1;q.infSrc=a.infSrc;q.cnt.inf=(q.cnt.inf||0)+1;stress(q,10);
ST.say(S,{actors:[a,q],tag:'感染拡大',text:F(pk(S,lover(S,a,q)&& !family(S,a,q)&&C.INF_SPREAD_LOVE?C.INF_SPREAD_LOVE:C.INF_SPREAD),{a:a.name,b:q.name}),why:q.name+'は'+a.name+'のそばにいた（関係 '+Math.round(bond(S,q,a)*100)+'）',mag:26});
if(SH.AFTER)SH.AFTER.react(S,q,'start',[a]);
}
var oth=live(S).filter(function(z){return z!==a;});
if(a.inf<2||a.abTalk|| !onPlanet(S)||oth.length<2)return;
var fear=oth.reduce(function(s0,z){return s0+z.m.fear+z.m.st;},0)/oth.length/200;
if(rng()>0.2+fear*0.4)return;
a.abTalk=true;
var ocs=HK.SameStory&&HK.SameStory.nk?oth.filter(function(z){return!HK.SameStory.nk(S,z,a);}):oth;
var c=HK.weighted(rng,ocs.length?ocs:oth,function(z){return Math.max(0.05,0.3+z.tr.cp*0.6+z.tr.caution*0.4+(capt(z)?0.5:0)-Math.max(0,bond(S,z,a))*1.2);});
var t=F(pk(S,C.ABANDON_TALK),{a:a.name,c:c.name});
var pr=oth.filter(function(z){return z!==c&&bond(S,z,a)>=0.45;}).sort(function(x,y){return bond(S,y,a)-bond(S,x,a);})[0];
if(pr&&rng()<0.45+bond(S,pr,a)*0.4){
setRel(S,pr,a,0.25);setRel(S,pr,c,-0.2);mark(S,pr,a,'calm');mark(S,pr,c,'quarrel');stress(pr,6);
var o1=ST.say(S,{actors:[c,a,pr],tag:'置き去りの相談',text:t+F(pk(S,C.ABANDON_STOP),{a:a.name,b:pr.name}),why:c.name+'が置き去りを提案したが、'+pr.name+'が'+a.name+'をかばった（関係 '+Math.round(bond(S,pr,a)*100)+'）',mag:32});
ST.key(S,o1,pr.name+'が'+a.name+'をかばった');
return;
}
a.away='left';a.fate='感染したまま'+Pn.name+'に置き去りにされた（'+S.m+'か月目）';
oth.forEach(function(z){setRel(S,z,a,z===c? -0.5: -0.25);stress(z,8);});
S.left.push([c.i,a.i]);S.ship.morale=clamp(S.ship.morale-10,0,100);
var o2=ST.say(S,{actors:[c,a],tag:'置き去り',kind:'climax',text:t+F(pk(S,C.ABANDON),{a:a.name}),why:'感染の広がりを恐れた（皆の不安とストレス '+Math.round(fear*100)+'）'+(HK.SameStory&&HK.SameStory.note?HK.SameStory.note(S,c,a):''),mag:44});
ST.key(S,o2,a.name+'を星に置き去りにした');
if(SH.AFTER)SH.AFTER.react(S,a,'left',[c]);
});
if(!onPlanet(S))return;
S.P.filter(function(p){return p.alive&&p.away==='taken'&& !p.gone;}).forEach(function(a){
a.awayM++;
if(Pn.civ.d.state==='transcendent'&&rng()<0.35){a.away=null;stress(a,10);ST.say(S,{actors:[a],tag:'帰還',text:F(pk(S,C.RETURN_ODD),{a:a.name}),why:'理解を超えた存在は、調べ終えた'+a.name+'を返した',mag:28});return;}
var L0=live(S);if(!L0.length)return;
var b=HK.weighted(rng,L0,function(q){return 0.2+Math.max(0,bond(S,q,a))*1.5+skill(q,'fight')+(q.role==='security'?0.6:0);});
var tm=[b].concat(L0.filter(function(q){return q!==b;}).sort(function(x,y){return skill(y,'fight')+skill(y,'talk')-skill(x,'fight')-skill(x,'talk');}).slice(0,L0.length>3?2:1));
var sk=skill(b,'fight')*0.45+Math.max.apply(null,tm.map(function(q){return skill(q,'talk');}))*0.3+Math.max(0,bond(S,b,a))*0.3+tm.length*0.05;
var diff=0.45+Pn.civ.d.rare*0.05+(Pn.civ.d.state==='advanced'?0.12:0)+S.env.danger/100*0.1;
if(r18on(S)&&SH.X&& !(HK.Pos&&HK.Pos.hardTopNpc(a))&& !(HK.State&& !HK.State.mobSexOk(a))&&(!HK.Content||HK.Content.ok(S,'force'))&&sxRoom(S,[a])&&rng()<0.35+S.env.slewd/100*0.4){
a.labbed=true;a.cnt.r18=(a.cnt.r18||0)+1;sxNote(S,[a]);
ST.say(S,{actors:[a],tag:'研究',kind:'climax',text:F(pk(S,SH.X.lab),{a:a.name,x:Pn.civ.d.name}),why:Pn.civ.d.name+'は、'+a.name+'を「標本」として調べた',mag:30});
}
var t=F(pk(S,C.RESCUE_GO),{n:names(tm),a:a.name});
if(sk+rng()*0.5>=diff){
a.away=null;stress(a,12);setRel(S,a,b,0.3);mark(S,a,b,'calm');tm.forEach(function(q){if(q!==b)setRel(S,a,q,0.1);});S.saved.push([b.i,a.i]);
var o=ST.say(S,{actors:[b,a],tag:'救出',kind:'climax',text:t+F(pk(S,C.RESCUE_OK),{a:a.name,b:b.name}),why:b.name+'の救出（腕 '+Math.round(sk*100)+'・難しさ '+Math.round(diff*100)+'）',mag:36});
ST.key(S,o,b.name+'が'+a.name+'を救い出した');
if(a.labbed&&SH.X)ST.say(S,{actors:[a],tag:'研究のあと',text:F(pk(S,SH.X.labAfter),{a:a.name}),why:Pn.civ.d.name+'の研究から救い出されたあと',mag:18});
}else{
b.m.hp=clamp(b.m.hp-10,1,100);stress(b,6);
ST.say(S,{actors:tm,tag:'救出失敗',text:t+F(pk(S,C.RESCUE_NG),{a:a.name,b:b.name}),why:'救出に失敗（'+a.awayM+'回目）',mag:22});
if(a.awayM>=3){a.gone=true;a.fate=Pn.civ.d.name+'に連れ去られたまま（'+S.m+'か月目）';ST.say(S,{actors:[a],tag:'行方不明',text:F(pk(S,C.TAKEN_GONE),{a:a.name}),why:'三度の救出がすべて失敗した',mag:30});}
}
});
S.P.filter(function(p){return p.alive&&p.away==='lost'&& !p.gone;}).forEach(function(a){
a.awayM++;a.m.hp=clamp(a.m.hp-12,0,100);
var L0=live(S);if(!L0.length)return;
var b=HK.weighted(rng,L0,function(q){return 0.2+Math.max(0,bond(S,q,a))*1.5+skill(q,'survive');});
if(a.m.hp<=0){a.away=null;die(S,a,'遭難して',F(pk(S,C.LOST_DEAD),{v:a.name,w:b.name}));return;}
if(rng()<skill(a,'survive')*0.3){a.away=null;ST.say(S,{actors:[a],tag:'生還',text:F(pk(S,C.LOST_SELF),{a:a.name}),why:a.name+'の生き抜く力',mag:26});return;}
if(rng()<0.3+skill(b,'survive')*0.3+Math.max(0,bond(S,b,a))*0.2){
a.away=null;setRel(S,a,b,0.3);mark(S,a,b,'calm');S.saved.push([b.i,a.i]);stress(a,-5);
var o=ST.say(S,{actors:[b,a],tag:'捜索',kind:'climax',text:F(pk(S,C.SEARCH_OK),{a:a.name,b:b.name}),why:b.name+'が見つけ出した（関係 '+Math.round(bond(S,b,a)*100)+'）',mag:32});
ST.key(S,o,b.name+'が'+a.name+'を見つけた');
return;
}
ST.sayB(S,{actors:L0.slice(0,3),tag:'捜索',text:F(pk(S,C.SEARCH_NG),{a:a.name,n:names(L0.slice(0,3))}),why:'見つからなかった（'+a.awayM+'か月目）'},a.name+'の捜索は空振りに終わった');
if(a.awayM>=3){a.gone=true;a.fate='遭難して行方不明（'+S.m+'か月目）';ST.say(S,{actors:[a],tag:'行方不明',text:F(pk(S,C.LOST_GONE),{a:a.name}),why:'三か月探しても見つからなかった',mag:30});}
});
if(r18on(S)&&SH.X&&live(S).length>=2&&(!HK.Content||HK.Content.ok(S,'force'))&&rng()<S.env.slewd/100*0.15)lure(S);
if(Pn.civ.st>=1&& /primitive|living|advanced|transcendent/.test(Pn.civ.d.state)&&live(S).length>=2&&rng()<(0.05+S.env.danger/100*0.08)*HK.Dark.f(S,'raid')){
var v=HK.weighted(rng,live(S),function(q){return 0.5+q.cnt.find*0.3;});
v.away='taken';v.awayM=0;v.cnt.taken=(v.cnt.taken||0)+1;stress(v,20);
var o3=ST.say(S,{actors:[v],tag:'誘拐',kind:'climax',text:F(pk(S,C.TAKEN),{a:v.name,x:Pn.civ.d.name}),why:Pn.civ.d.name+'（'+CIV_JP[Pn.civ.d.state]+'）が、研究のために連れ去った',mag:38});
ST.key(S,o3,v.name+'が連れ去られた');
}
if(Pn.life.length&&live(S).length&&rng()<(0.03+S.env.danger/100*0.04)*HK.Dark.f(S,'kill')){var lf=rng.pick(Pn.life);if(lf.st>=1)infect(S,rng.pick(live(S)),lf.d.name);}
}
function pairs(L0){var o=[];L0.forEach(function(a){L0.forEach(function(b){if(a.i<b.i)o.push([a,b]);});});return o;}
function onPlanet(S){return!!(S.planet&&S.planet.at<S.m);}
function BP(S,k){var B=SH.B;return onPlanet(S)&&B[k+'_P']&&S.rng()<0.6?B[k+'_P']:B[k];}
function bondEv(S){
var rng=S.rng,L0=live(S),sp=S.ship,T=SH.T,B=SH.B;
var PR=pairs(L0),tense=(100-sp.morale)/100+(sp.food<20?0.35:0)+(sp.o2<30?0.2:0);
var sick=L0.filter(function(p){return p.m.hp<60;});
var neg=PR.filter(function(x){return(S.relD[rk(x[0],x[1])]||0)< -0.15||bond(S,x[0],x[1])< -0.15;});
var lv=PR.filter(function(x){return lover(S,x[0],x[1])||(bond(S,x[0],x[1])>0.55&&HK.Pos&&HK.Pos.okLove(x[0],x[1])&&canJoin(S,x[0],x[1]));});
var opts=[
['drink',1.0],['team',1.0],['confide',0.7],['game',0.7],['nurse',sick.length?0.9:0],['birthday',0.25],['drink_all',L0.length>=3?0.3:0],
['fight',0.25+tense*0.9],['drink_bad',0.2+tense*0.4],['ration',sp.food<35?0.3+tense*0.6:0.05],['duty',0.2+tense*0.4],['game_bad',0.15+tense*0.2],
['good',0.6],['bad',0.15+tense*0.4],['please',L0.some(pleaser)?0.6+tense*0.5:0],['jealous',L0.length>=3?0.35:0],['makeup',neg.length?0.8:0],['love',lv.length?0.6*ST.romK(S):0]
];
var kind=HK.weighted(rng,opts,function(o){return o[1];})[0];
function pickP(list,f){return list.length?HK.weighted(rng,list,f):null;}
if(kind==='please'){
var pl=pickP(L0.filter(pleaser),function(q){return 0.5+q.tr.ac;}),down=pl&&L0.filter(function(q){return q!==pl;}).sort(function(x,y){return(y.m.st||0)-(x.m.st||0);})[0];
if(!down)return;
var wp=bond(S,pl,down);
setRel(S,pl,down,0.15);mark(S,pl,down,'team');stress(down,-12);stress(pl,5);sp.morale=clamp(sp.morale+3,0,100);
ST.sayB(S,{actors:[pl,down],tag:'機嫌取り',text:F(pk(S,BP(S,'PLEASE')),{a:pl.name,b:down.name}),why:pl.name+'は周りの機嫌をうかがう気質。'+down.name+'のストレスを和らげた（関係 '+Math.round(wp*100)+'→'+Math.round(bond(S,pl,down)*100)+'）'},pl.name+'が'+down.name+'の機嫌を取った');
if(pl.m.st>60&&rng()<0.4)ST.sayB(S,{actors:[pl],tag:'機嫌取りの疲れ',text:F(pk(S,BP(S,'PLEASE_TIRED')),{a:pl.name}),why:'人の気持ちを優先して、自分のストレスを溜め込んでいる（'+Math.round(pl.m.st)+'）'},pl.name+'はひとり疲れていた');
return;
}
var BAD= /fight|drink_bad|ration|duty|game_bad|^bad$/.test(kind);
var pr=kind==='makeup'?pickP(neg,function(){return 1;}):kind==='love'?pickP(lv,function(x){return 0.5+Math.max(0,bond(S,x[0],x[1]));})
:BAD?pickP(PR,function(x){return Math.max(0.05,0.5+(x[0].tr.aggr+x[1].tr.aggr)*0.6-bond(S,x[0],x[1])*0.6+((x[0].m.st||0)+(x[1].m.st||0))/200)*(capt(x[0])||capt(x[1])?0.35:1);})
:pickP(PR,function(x){return 0.6+Math.max(0,bond(S,x[0],x[1]))*0.6+(x[0].tr.warmth+x[1].tr.warmth)*0.3;});
if(!pr)return;
var a=rng()<0.5?pr[0]:pr[1],b=a===pr[0]?pr[1]:pr[0],w0=bond(S,a,b);
var others=L0.filter(function(q){return q!==a&&q!==b;});
if(BAD&&(capt(a)||capt(b))&&rng()<0.6){
var cp=capt(a)?a:b,ot=cp===a?b:a;
setRel(S,cp,ot,0.05);stress(cp,3);
ST.sayB(S,{actors:[cp,ot],tag:'船長',text:F(pk(S,BP(S,'CAPTAIN')),{a:cp.name,b:ot.name}),why:'船長の使命感で、揉めごとを自分の中で収めた'},cp.name+'が揉めごとを収めた');
return;
}
function food(bad){var r=HK.Food&&HK.Food.ration(S,a,b,bad);return r?{tail:r.text,tailWhy:'／'+r.why}:null;}
function say(pool,tag,d,why,mp){ST.sayB(S,{actors:[a,b].concat(mp&&mp.c?[mp.c]:[]),tag:tag,text:F(pk(S,pool),{a:a.name,b:b.name,c:mp&&mp.c?mp.c.name:''})+(mp&&mp.tail?mp.tail:''),why:why+(mp&&mp.tailWhy?mp.tailWhy:'')+'（関係 '+Math.round(w0*100)+'→'+Math.round(bond(S,a,b)*100)+'）'},a.name+'と'+b.name);}
if(kind==='drink'){stress(a,-8);stress(b,-8);setRel(S,a,b,0.22);mark(S,a,b,'drink');sp.morale=clamp(sp.morale+3,0,100);say(BP(S,'DRINK'),'晩酌',0,'二人きりの晩酌');}
else if(kind==='drink_all'){
var g=others.length>2?rng.shuffle(others.slice()).slice(0,1+rng.int(others.length-1)).concat([a,b]):L0.slice();
g.forEach(function(x){stress(x,-6);g.forEach(function(y){if(x.i<y.i){setRel(S,x,y,0.1);mark(S,x,y,'drink');}});});
sp.morale=clamp(sp.morale+8,0,100);
ST.sayB(S,{actors:g,tag:'酒盛り',text:F(pk(S,BP(S,'DRINK_ALL')),{n:names(g)}),why:'皆で飲んだ（士気 +8・全員の関係 +10）'},names(g)+'の酒盛り');
}
else if(kind==='team'){stress(a,-4);stress(b,-4);setRel(S,a,b,0.25);mark(S,a,b,'team');sp.hull=clamp(sp.hull+2,0,100);say(BP(S,'TEAM'),'共同作業',0,'力を合わせて乗り切った');}
else if(kind==='confide'){stress(a,-10);stress(b,-4);setRel(S,a,b,0.3);mark(S,a,b,'confide');a.m.fear=clamp(a.m.fear-6,0,100);say(BP(S,'CONFIDE'),'打ち明け話',0,'誰にも言えなかったことを話した');}
else if(kind==='game'){stress(a,-5);stress(b,-5);setRel(S,a,b,0.15);mark(S,a,b,'game');sp.morale=clamp(sp.morale+3,0,100);say(BP(S,'GAME'),'娯楽',0,'退屈しのぎの勝負');}
else if(kind==='nurse'){nurse(S,sick.sort(function(x,y){return x.m.hp-y.m.hp;})[0]);}
else if(kind==='birthday'){
if(S.bday[a.i])return;S.bday[a.i]=1;stress(a,-10);
setRel(S,a,b,0.25);mark(S,a,b,'bday');others.forEach(function(q){setRel(S,a,q,0.06);});sp.morale=clamp(sp.morale+6,0,100);say(BP(S,'BIRTHDAY'),'誕生日',0,a.name+'の誕生日を祝った');
}
else if(kind==='good'){setRel(S,a,b,0.15);mark(S,a,b,'team');say(T.PAIR_GOOD,'絆',0,'日々の暮らしの中で',food(false));}
else if(kind==='makeup'){stress(a,-6);stress(b,-6);setRel(S,a,b,0.3);mark(S,a,b,'makeup');say(T.MAKEUP,'仲直り',0,'こじれた関係を修復した');}
else if(kind==='love'){
stress(a,-6);stress(b,-6);setRel(S,a,b,0.18);mark(S,a,b,'love');
var jk= !lover(S,a,b)&&bond(S,a,b)>0.6?canJoin(S,a,b):'';
if(jk)join(S,a,b);
ST.sayB(S,{actors:[a,b],tag:jk?'恋人に':'想い',text:F(pk(S,T.PAIR_LOVE),{a:a.name,b:b.name})+(jk?F(pk(S,T.PAIR_JOIN),{a:a.name,b:b.name}):''),why:'閉ざされた船で、想いが育った'+(jk?'：恋人になった'+(jk==='switch'?'（乗り換え）':''):'')+'（関係 '+Math.round(w0*100)+'→'+Math.round(bond(S,a,b)*100)+'）'},a.name+'と'+b.name,!!jk);
}
else if(kind==='jealous'){
var c=pickP(others.filter(function(q){return(amour(S,q,a)||bond(S,q,a)>0.4)&& !HK.ngPair(q,a)&& !ties(S,q,a).some(function(t){return t.type==='noobs';});}),function(q){return 0.3+(q.tr.jealous||0.4)+Math.max(0,bond(S,q,a));});
if(!c)return;
stress(c,8);setRel(S,a,b,0.1);setRel(S,c,b,-0.25);setRel(S,c,a,-0.1);mark(S,c,b,'jealous');S.jeal.push([c.i,b.i]);
ST.sayB(S,{actors:[c,a,b],tag:'嫉妬',text:F(pk(S,BP(S,'JEALOUS')),{a:a.name,b:b.name,c:c.name}),why:c.name+'は'+a.name+'に想いを寄せている（嫉妬 '+Math.round((c.tr.jealous||0)*100)+'）'},c.name+'の嫉妬');
}
else if(kind==='fight'){
var st=others.length&&rng()<0.7?HK.weighted(rng,others,function(q){return 0.2+q.tr.lead+q.tr.warmth*0.5+(capt(q)?1:0)+(pleaser(q)?0.6:0);}):null;
stress(a,10);stress(b,10);setRel(S,a,b,st? -0.25: -0.38);mark(S,a,b,'fight');
a.m.hp=clamp(a.m.hp-(st?3:8),1,100);b.m.hp=clamp(b.m.hp-(st?3:8),1,100);sp.morale=clamp(sp.morale-6,0,100);
var txt=F(pk(S,BP(S,'FIGHT')),{a:a.name,b:b.name})+(st?F(pk(S,BP(S,'STOP')),{c:st.name}):'');
if(st){setRel(S,st,a,0.08);setRel(S,st,b,0.08);mark(S,st,a,'stop');mark(S,st,b,'stop');}
ST.sayB(S,{actors:[a,b].concat(st?[st]:[]),tag:'ケンカ',text:txt,why:'張りつめた船内（士気 '+Math.round(sp.morale)+'）'+(st?'。'+st.name+'が止めに入った':'。誰も止めなかった（体力 -8）')+'（関係 '+Math.round(w0*100)+'→'+Math.round(bond(S,a,b)*100)+'）'},a.name+'と'+b.name+'のケンカ');
}
else{
var D={drink_bad:[BP(S,'DRINK_BAD'),'酒の席',-0.25,'酒が入って本音が出た'],ration:[BP(S,'RATION'),'食料の取り合い',-0.22,'乏しい食料（食料 '+Math.round(sp.food)+'）'],duty:[BP(S,'DUTY'),'当番',-0.2,'当番の押し付け'],game_bad:[BP(S,'GAME_BAD'),'娯楽',-0.18,'勝負がこじれた'],bad:[T.PAIR_BAD,'衝突',-0.18,'閉ざされた船の息苦しさ']}[kind];
stress(a,6);stress(b,6);setRel(S,a,b,D[2]);mark(S,a,b,'quarrel');sp.morale=clamp(sp.morale-3,0,100);
say(D[0],D[1],0,D[3],kind==='ration'?food(true):null);
}
}
function nurse(S,b){
var rng=S.rng,L0=live(S),B=SH.B,R=SH.R18,Pz=HK.Pos;
var a=L0.filter(function(q){return q!==b;}).sort(function(x,y){return(bond(S,y,b)+y.tr.warmth)-(bond(S,x,b)+x.tr.warmth);})[0];
if(!a|| !b.alive)return;
var w0=bond(S,a,b);
b.m.hp=clamp(b.m.hp+8,0,100);stress(b,-5);setRel(S,a,b,0.28);mark(S,a,b,'nurse');
ST.sayB(S,{actors:[a,b],tag:'看病',text:F(pk(S,BP(S,'NURSE')),{a:a.name,b:b.name}),why:'弱っているところを支えた（体力 +8）（関係 '+Math.round(w0*100)+'→'+Math.round(bond(S,a,b)*100)+'）'},a.name+'が'+b.name+'を看病した');
if(!r18on(S)|| !R|| !R.nurseTop|| !Pz|| !Pz.okSex(a,b)||family(S,a,b)|| !sxRoom(S,[a,b]))return;
if(rng()>S.env.slewd/100*(amour(S,a,b)?0.7:bond(S,a,b)>0.3?0.45:0.15))return;
var o=Pz.order(a,b,[a,b]),t=o[0],u=o[1];
if(Pz.hardTop(u,t))return;
var body=bodyOf(S,t,u,'nurse');
setRel(S,a,b,0.15);mark(S,a,b,'night');sxNote(S,[a,b]);
a.cnt.r18=(a.cnt.r18||0)+1;b.cnt.r18=(b.cnt.r18||0)+1;
var open=F(pk(S,t===a?R.nurseTop:R.nurseSick),{t:t.name,u:u.name});
ST.say(S,{actors:[a,b],tag:'看病の夜',kind:'climax',text:open+body+F(pk(S,R.nurseAfter),{a:a.name,b:b.name}),why:'熱に浮かされた'+b.name+'と、看病していた'+a.name+'／関係の近さ '+Math.round(bond(S,a,b)*100),mag:30});
if(SH.NIGHT&&SH.NIGHT.after)SH.NIGHT.after(S,NAPI,a,b);
}
function outburst(S){
var rng=S.rng,L0=live(S),sp=S.ship,B=SH.B,n=0;
L0.slice().sort(function(x,y){return y.m.st-x.m.st;}).forEach(function(a){
if(n>=2||a.m.st<78||rng()>0.65||L0.length<2)return;
n++;
var others=L0.filter(function(q){return q!==a;});
var c=rng()<0.75?HK.weighted(rng,others,function(q){return 0.2+Math.max(0,bond(S,q,a))*1.5+q.tr.warmth*0.5+(capt(q)?0.6:0)+(pleaser(q)?0.8:0);}):null;
var st0=Math.round(a.m.st);
if(rng()<0.2+a.tr.aggr*0.7){
var b=rng.pick(others);
sp.hull=clamp(sp.hull-5,0,100);sp.morale=clamp(sp.morale-8,0,100);a.m.hp=clamp(a.m.hp-4,1,100);
setRel(S,a,b,-0.15);mark(S,a,b,'quarrel');others.forEach(function(q){setRel(S,a,q,-0.04);stress(q,3);});
a.cnt.rage=(a.cnt.rage||0)+1;
var t=F(pk(S,BP(S,'RAGE')),{a:a.name,b:b.name});
if(c){t+=F(pk(S,BP(S,'CALM')),{a:a.name,c:c.name});setRel(S,a,c,0.22);mark(S,a,c,'calm');a.m.st=35;}else a.m.st=55;
ST.say(S,{actors:c?[a,c]:[a],tag:'暴れる',text:t,why:'ストレスが限界を越えた（'+st0+'）。気の荒さ '+Math.round(a.tr.aggr*100)+'。船体 -5・士気 -8'+(c?'。'+c.name+'がなだめた':''),mag:24});
}else{
sp.food=clamp(sp.food-1.5,0,100);sp.morale=clamp(sp.morale-2,0,100);a.m.hp=clamp(a.m.hp-8,1,100);
a.cnt.deep=(a.cnt.deep||0)+1;
var t2=F(pk(S,BP(S,'DEEP')),{a:a.name});
if(c){t2+=F(pk(S,BP(S,'DEEP_CARE')),{a:a.name,c:c.name});setRel(S,a,c,0.15);mark(S,a,c,'calm');a.m.st=40;}else a.m.st=55;
ST.say(S,{actors:c?[a,c]:[a],tag:'深酒',text:t2,why:'ストレスが限界を越えた（'+st0+'）。酒に逃げた（体力 -8）'+(c?'。'+c.name+'が面倒を見た':''),mag:18});
}
});
}
function bonds(S){
if(!SH.B||live(S).length<2)return;
var n=1+(S.rng()<0.6?1:0)+(live(S).length>=5&&S.rng()<0.4?1:0);
for(var k=0;k<n;k++)bondEv(S);
outburst(S);
}
function relmap(S){
var P=S.P,edges=[],seen={};
function add(a,b,label,cls,dir){var k=rk(P[a],P[b])+label;if(seen[k])return;seen[k]=1;edges.push({a:a,b:b,label:label,cls:cls,dir:dir});}
var CLS={lover:'love',sibbad:'enemy',bad:'enemy',mate:'love',fated:'love',almost:'love',fwb:'night',crush:'pine',enemy:'enemy',rival:'enemy',ex:'obsess',buddy:'partner',best:'friend',friend:'friend',childhood:'friend',sibling:'guard',sibprot:'guard',sibclose:'guard',parent:'guard',pparent:'guard',master:'partner',mentor:'partner',teacher:'partner',senpai:'friend',colleague:'friend',classmate:'friend',boss:'partner',benefactor:'guard',relative:'guard',worship:'guard',fond:'friend',blind:'guard',acq:'none'};
var parted={};(S.exes||[]).forEach(function(j){if(!lover(S,P[j[0]],P[j[1]]))parted[rk(P[j[0]],P[j[1]])]=1;});
S.ties.forEach(function(t){if(parted[rk(P[t.a],P[t.b])]&& /^(lover|mate|fated)$/.test(t.type))return;var lab=HK.tieLabel?HK.tieLabel(t):HK.TIES&&HK.TIES[t.type]?HK.TIES[t.type].label:t.type;add(t.a,t.b,lab,CLS[t.type]||'friend',t.type==='crush'||(HK.TIES&&HK.TIES[t.type]&&HK.TIES[t.type].dir)?t.a:null);});
var hasLove={};
S.ties.forEach(function(t){if(/^(lover|mate|fated)$/.test(t.type)&& !parted[rk(P[t.a],P[t.b])])hasLove[rk(P[t.a],P[t.b])]=1;});
var keys=Object.keys(S.relD).concat(Object.keys(S.relEv)).filter(function(k,x,arr){return arr.indexOf(k)===x;});
keys.forEach(function(k){
var ab=k.split('-'),a= +ab[0],b= +ab[1],d=S.relD[k]||0,e=S.relEv[k]||{};
var bad=(e.fight||0)+(e.quarrel||0),good=(e.drink||0)+(e.team||0)+(e.confide||0)+(e.nurse||0)+(e.calm||0)+(e.game||0)+(e.makeup||0)+(e.bday||0);
if(lover(S,P[a],P[b])&& !hasLove[k])add(a,b,'★恋仲','love',null);
if(e.night&& !(S.nightNo&&S.nightNo[k]))add(a,b,'★夜を共にした','night',null);
if(d>=0.55)add(a,b,bad>=2?'★ケンカするほど仲がいい':e.nurse||e.calm?'★支え合う':e.confide?'★深い絆':(e.drink||0)>=2?'★飲み仲間':'★深い絆','guard',null);
else if(d>=0.25)add(a,b,(e.drink||0)>=2?'★飲み仲間':e.team?'★相棒':e.makeup?'★和解':'★仲間',e.team?'partner':'friend',null);
else if(d<= -0.45)add(a,b,(e.fight||0)>=2?'★犬猿の仲':'★険悪','enemy',null);
else if(d<= -0.2)add(a,b,'★わだかまり','obsess',null);
else if(bad>=2&&good>=2)add(a,b,'★揉めては戻る','friend',null);
});
if(SH.NIGHT&&SH.NIGHT.rel)SH.NIGHT.rel(S,add);
(S.exes||[]).forEach(function(j){if(parted[rk(P[j[0]],P[j[1]])])add(j[0],j[1],'★別れた','obsess',j[0]);});
(S.lovers||[]).forEach(function(pr){if(!hasLove[rk(P[pr[0]],P[pr[1]])])add(pr[0],pr[1],'★恋仲','love',null);});
S.left.forEach(function(j){add(j[0],j[1],'★置き去りにした','enemy',j[0]);});
S.saved.forEach(function(j){add(j[0],j[1],'★助け出した','guard',j[0]);});
S.jeal.forEach(function(j){if((S.relD[rk(P[j[0]],P[j[1]])]||0)<0)add(j[0],j[1],'★嫉妬','obsess',j[0]);});
return{
nodes:P.map(function(p){return{i:p.i,name:p.name,sub:p.roleLabel,dead: !p.alive,fate:p.fate};}),
edges:edges,note:'★は漂流のあいだに生まれた・変わった関係。矢印は気持ちの向き。'
};
}
function heal(S,p){
var dr=live(S).filter(function(q){return q!==p&&q.role==='doctor';})[0];
if(!dr||S.rng()>0.7)return;
p.m.hp=clamp(p.m.hp+10+skill(dr,'med')*15,0,100);
ST.sayB(S,{actors:[dr,p],tag:'治療',text:F(pk(S,SH.T.HEAL),{a:dr.name,b:p.name}),why:'船医の手当て'},dr.name+'が'+p.name+'を手当てした');
}
function upkeep(S,m){
var sp=S.ship,L0=live(S),rng=S.rng;
sp.food=clamp(sp.food-L0.length*0.8-1.5+(S.planet&&S.planet.at<m?3:0),0,100);
sp.o2=clamp(sp.o2-2-(sp.power<25?6:0),0,100);
sp.power=clamp(sp.power-3,0,100);
sp.morale=clamp(sp.morale-2+(S.planet?3:0),0,100);
L0.forEach(function(p){
if(sp.food<=0)p.m.hp-=12;
if(sp.o2<15)p.m.hp-=10;
if(sp.hull<=0)p.m.hp-=15;
p.m.fear=clamp(p.m.fear+(sp.morale<30?4:1),0,100);
stress(p,3+(sp.morale<40?4:0)+(sp.food<20?5:0)+(p.m.hp<50?3:0)+(sp.o2<30?3:0)-(S.planet?2:0));
p.m.hp=clamp(p.m.hp+(sp.food>20?4:0),0,100);
});
var cause=sp.food<=0?'飢えで':sp.o2<15?'空気が尽きかけて':sp.hull<=0?'壊れかけた船の中で':'';
L0.forEach(function(p){
if(p.m.hp>0|| !p.alive)return;
die(S,p,cause||'衰弱して',p.name+'は、'+(cause||'衰弱して')+'静かに息を引き取った。');
});
if(sp.food<15&&sp.food>0&&rng()<0.5)ST.sayB(S,{kind:'phase',text:'食料の残りが、目に見えて少なくなっていた。配給が、また減らされた。',why:'食料 '+Math.round(sp.food)},'食料が乏しい');
}
function die(S,v,how,text){
if(!v|| !v.alive)return;
v.alive=false;v.fate='死亡（'+S.m+'か月目・'+how.replace(/で$|に$/,'')+'）';
S.deaths.push(v);
var o=ST.say(S,{actors:[v],tag:'死',kind:'climax',text:text,why:how+'命を落とした',mag:46});
ST.key(S,o,v.name+'の死');
S.ship.morale=clamp(S.ship.morale-12,0,100);
var g=live(S).filter(function(q){return bond(S,q,v)>=0.4;}).sort(function(a,b){return bond(S,b,v)-bond(S,a,v);})[0];
live(S).forEach(function(q){q.m.fear=clamp(q.m.fear+10+Math.max(0,bond(S,q,v))*15,0,100);stress(q,10+Math.max(0,bond(S,q,v))*20);});
var infR=SH.AFTER&&how==='感染症で';
if(g&& !infR)ST.say(S,{actors:[g,v],tag:'弔い',text:F(pk(S,SH.T.GRIEF),{a:g.name,v:v.name}),why:g.name+'と'+v.name+'の関係'});
if(infR)SH.AFTER.react(S,v,'death');
}
function r18on(S){return R18ON&& !HK.SAFE_ON&&(S.env.slewd||0)>0;}
function sxCap(S){var sl=(S.env.slewd||0)/100;return sl<=0?0:sl<0.2?1:1+Math.floor(sl*3+1e-9);}
function sxRoom(S,ps){
var X=S.sx||(S.sx={n:0,m: -9,pr:{}});
if(X.n>=sxCap(S)||X.m===S.m)return false;
if(ps&&ps.length>=2){var y=X.pr[rk(ps[0],ps[1])];if(y&&(y.n>=2||S.m-y.m<3))return false;}
return true;
}
function sxNote(S,ps){
sxRoom(S);
if(HK.EroScene)HK.EroScene.touch(S);
var X=S.sx;X.n++;X.m=S.m;
if(ps&&ps.length>=2){var k=rk(ps[0],ps[1]),y=X.pr[k]||(X.pr[k]={n:0,m: -9});y.n++;y.m=S.m;}
}
function lewdOf(S){
var X=HK.Lewd;
if(!X|| !X.conf('ship'))return{lv:'mid',short:false,ero:false,high:false};
return{lv:X.lv(S.env),short:X.short(S.env,S.rng),ero:X.ero(S.env),high:X.high(S.env)};
}
function bodyOf(S,t,u,kind){
var R=SH.R18,Pz=HK.Pos,lw=lewdOf(S),nm={t:t.name,u:u.name};
if(lw.lv==='low'&&R.fade)return F(pk(S,kind==='nurse'?R.nurseFade:R.fade),nm);
if(lw.ero&&R.ero){var e=R.ero(S,t,u,kind,lw.short,lw.high);if(e)return e;}
var pool=kind==='nurse'?(Pz.isF(t)&&Pz.isF(u)?R.nurseFf:Pz.isF(t)?R.nurseRide:R.nursePen):(Pz.isF(t)&&Pz.isF(u)?R.ff:Pz.isF(t)?R.ride:R.pen);
var th= !lw.short&&R.thick&&R.thick(S,t,u,kind);
var out=th||F(pk(S,pool),nm);
if(lw.high&&R.again)out+=R.again(S,t,u,!th);
return out;
}
function bodyFor(S,a,b){
var Pz=HK.Pos,o=Pz.order(a,b,[a,b]),t=o[0],u=o[1];
if(Pz.hardTop(u,t))return'';
return bodyOf(S,t,u,'night');
}
function xLewd(S,a,top,text,v,kind){
var R=SH.R18,lw=lewdOf(S);
if(!R|| !R.xFade)return text;
if(lw.lv==='low')return F(pk(S,top?R.xFadeTop:R.xFade),v);
var sep=function(){return/\n\n/.test(text)?'\n\n':'';};
var pool=lw.ero&& !top&&R.xEroPool?R.xEroPool(kind||'alien'):[],added=false;
if(lw.ero&&top)text+=sep()+F(R.xFill(S,pk(S,R.xEroTop.concat(R.xEroTopM&& !HK.Pos.isF(a)?R.xEroTopM:[])),a,top),v);
else if(pool.length){text+=sep()+F(R.xFill(S,pk(S,pool),a,false),v);added=true;}
if(lw.high){
var ag=added&&R.xEroAgainV?R.xEroAgainV.filter(function(t){return t&&String(t).trim();}):[];
text+=sep()+F(ag.length?R.xFill(S,pk(S,ag),a,false):pk(S,R.xAgain),v);
}
return text;
}
var NAPI={bond:bond,lover:lover,amour:amour,canJoin:canJoin,join:join,loversOf:loversOf,family:family,setRel:setRel,mark:mark,rk:rk,live:live,bodyFor:bodyFor,F:F,pk:pk,stress:stress,room:sxRoom,note:sxNote};
function nightR18(S){
if(SH.NIGHT){SH.NIGHT.run(S,NAPI);return;}
var rng=S.rng,L0=live(S),R=SH.R18;
if(L0.length<2|| !sxRoom(S)||rng()>S.env.slewd/100*0.3)return;
var pairs=[];
L0.forEach(function(a){L0.forEach(function(b){if(a.i<b.i&&HK.Pos.okSex(a,b)&& !family(S,a,b)&&sxRoom(S,[a,b])&&(amour(S,a,b)||bond(S,a,b)>0.25||rng()<0.15))pairs.push([a,b]);});});
if(!pairs.length)return;
var pr=HK.weighted(rng,pairs,function(x){return 0.3+Math.max(0,bond(S,x[0],x[1]))+(amour(S,x[0],x[1])?1:0);}),a=pr[0],b=pr[1];
var civ=S.planet&&S.planet.civ.st>=1&& /primitive|living|advanced|transcendent/.test(S.planet.civ.d.state)&&rng()<0.25;
var pol=S.planet&&S.planet.life.some(function(l){return l.st>=1&&l.d.kind==='plant';})&&rng()<0.35;
var open=F(pk(S,civ?R.civ:pol?R.pollen:R.open),{a:a.name,b:b.name});
var body=bodyFor(S,a,b);
if(!body)return;
setRel(S,a,b,0.2);mark(S,a,b,'night');sxNote(S,[a,b]);
a.cnt.r18=(a.cnt.r18||0)+1;b.cnt.r18=(b.cnt.r18||0)+1;
var o=ST.say(S,{actors:[a,b],tag:civ?'儀式の夜':pol?'花粉の夜':'夜',kind:'climax',text:open+body+F(pk(S,R.after),{a:a.name,b:b.name}),why:(civ?'文明の歓迎の儀式':pol?'星の花粉にあてられた':'閉ざされた船の夜')+'／関係の近さ '+Math.round(bond(S,a,b)*100),mag:30});
if(!S.r18Key){S.r18Key=true;ST.key(S,o,a.name+'と'+b.name+'の夜');}
}
function alienR18(S,a,d){
if(HK.State&& !HK.State.mobSexOk(a))return;
if(!sxRoom(S,[a]))return;
if(HK.Content&& !HK.Content.ok(S,'force')&& !(HK.Pos&&HK.Pos.hardTopNpc(a)))return;
if(SH.X2&&S.rng()<0.75&&xeno(S,a,d))return;
var R=SH.R18,top=HK.Pos&&HK.Pos.hardTopNpc(a);
var X=SH.X,sp= !top&&X&&X.play[d.kind]&&S.rng()<0.6?X.play[d.kind]:null;
if(!sp&& !/friendly|symbiotic|parasite|plant/.test(d.kind))return;
sxNote(S,[a]);
ST.say(S,{actors:[a],tag:'異星の生き物',kind:'climax',text:xLewd(S,a,top,F(pk(S,sp||(top?R.alienTop:R.alien)),{a:a.name,x:d.name}),{a:a.name,x:d.name,b:(closest(S,a)||{name:'仲間'}).name},'alien'),why:d.name+'（'+LIFE_JP[d.kind]+'）'+(top?'／自分で攻めを選んでいるので、主導権を握った':''),mag:28});
}
var EPI={
wiped:[
'最後の一人が倒れてから、船は誰の声も聞かないまま進み続けた。食堂の椅子は{n}人分のまま並び、壁の名札も外されることはなかった。救難信号だけが、決まった間隔で闇に向かって瞬いていた。',
'生命維持の装置は、乗る者がいなくなったことに気づかないまま空気を送り続けた。航海日誌の最後の行には、{v}の筆跡で日付だけが書かれていた。やがて動力が尽き、船内の灯りはひとつずつ消えていった。',
'観測窓の外を、名前も知らない星がゆっくりと流れていった。船はもう、どこへ向かうこともなかった。{v}が最後に整えた操縦席だけが、主を待つように前を向いていた。'
],
wipedBy:'――{w}が、この船の旅を終わらせた。',
fresh:[
'十二か月目の終わり、船は{x}の大気を抜けて、平らな岩場に降りた。ハッチが開き、{l}は一人ずつ、見知らぬ大地に足を下ろした。調べることはまだ何も始まっていなかったが、足の裏に伝わる重みだけで、誰もが泣きそうになった。',
'着陸の衝撃が収まると、船内は嘘のように静かになった。外の空気は、計器の上では吸える数値を示していた。{l}は顔を見合わせ、ゆっくりとハッチを開けた。{x}の風が、一年ぶりに一同の頬を撫でた。',
'{x}の地表が近づくにつれ、警報はひとつ、またひとつと鳴り止んだ。船が止まったのは、草のようなものが揺れる丘の上だった。{l}は外に出て、空を見上げた。そこには、もう漂うだけの闇はなかった。'
],
civ:[
'一年の終わり、{l}は船を降り、{x}の住人たちが用意した場所に居を移した。言葉はまだ半分も通じなかったが、差し出された食べ物を受け取ることはできた。船は丘の上に据えられ、新しい村の目印になった。',
'{x}の住人たちは、船を降りた{l}を遠巻きに見つめていた。やがて一人が歩み出て、手のひらを見せた。それが挨拶なのだと分かるまで、少し時間がかかった。漂流者たちは、この星の客として迎え入れられた。',
'船の扉を開け放ったまま、{l}は{x}の集落へ続く道を歩いた。迎えに来た住人たちの後ろに、灯りのともった家並みが見えた。漂流の一年は、知らない誰かの家の前で終わった。'
],
danger:[
'{x}のすべてが分かったわけではなかった。それでも船の物資は限られていて、ここで暮らすほかに道はなかった。{l}は船を砦にして、地表に小さな囲いを作った。夜になると、遠くで何かが鳴く声がした。',
'{l}は、この星に残ると決めた。安全だと言い切れる場所は、まだ船の中にしかなかった。一同は交代で見張りに立ちながら、少しずつ畑を広げていった。{x}は優しい星ではなかったが、帰る場所はもうここしかなかった。',
'調べ尽くせなかった{x}の闇を前に、{l}は慎重に暮らしを始めた。船の外壁には、探索で分かったことが一行ずつ書き足されていった。分からないことの欄は、まだ長く空いたままだった。'
],
settle:[
'一年の終わり、{l}は船の外に最初の家を建てた。屋根は船体の板で、窓は観測窓を外して使った。{x}の夕日がその窓に映ったとき、そこはもう漂流者の仮住まいではなかった。',
'{x}の地図は、船の壁いっぱいに書き込まれていた。水の出る場所、食べられる実、夜に冷える谷。{l}はその地図を頼りに、船から少し離れた平地に暮らしを移した。船は、最初の一年の記念碑として残された。',
'{l}は、調べ上げた{x}の大地に、手で杭を打った。そこが、新しい暮らしの始まりの場所になった。夜、焚き火を囲んで、一同は漂流の一年の話を何度も繰り返した。'
],
broken:'船はそれきり、二度と空へ上がらなかった。',
driftOk:[
'十二か月目が終わっても、星図の空白は埋まらなかった。{l}は食堂に集まり、残った物資を数え直した。まだ一年は戦える。誰も口には出さなかったが、それだけで十分だった。船は、次の光を目指して針路を変えた。',
'一年の漂流を終えた夜、{l}は観測窓の前に並んだ。遠くに、まだ確かめていない星がいくつも瞬いていた。航海士席の画面に、新しい航路が描かれた。旅は終わらなかったが、一年目は、ここで区切りがついた。',
'{l}は、一年分の航海日誌を一冊に綴じた。表紙には「一年目」とだけ書かれた。次の一冊の最初のページは、まだ真っ白だった。船の灯りは消えず、闇の中を静かに進み続けた。'
],
driftLow:[
'十二か月目の終わり、主機関が最後の唸りを上げて止まった。残った動力は、生命維持と救難信号にだけ回された。{l}は一つの部屋に集まり、毛布を分け合った。窓の外の星は、手の届かない場所で瞬いていた。',
'計器の針が、ひとつ、またひとつと下限を指した。船はもう、自分の力では進めなかった。{l}は救難信号の出力を最大にして、あとは祈るように待つことにした。漂流の一年は、凍えるような静けさの中で終わった。',
'船は力尽きかけていた。灯りは非常灯だけになり、吐く息が白く見えた。{l}は寄り添って座り、誰からともなく、故郷の話を始めた。信号は今も、闇の向こうへ届くことを信じて送られ続けていた。'
],
lovers:[
'{a}と{b}は、最後まで寄り添っていた。どちらからともなく繋いだ手は、もう離れることはなかった。',
'{a}は{b}の肩に頭を預けた。{b}「これからも、私の隣にいて｜これからも、私の隣にいてくれ｜これからも、私の隣にいてください」――{a}は、黙ってうなずいた。',
'漂流の一年を、{a}と{b}は恋人として越えた。二人の名前は、航海日誌の同じ行に並んで書かれていた。'
],
lone:[
'{a}は、一人で少し離れた場所に立ち、黙って空を見上げていた。',
'{a}は誰とも肩を寄せず、一年の記録を自分の端末に静かに書き残した。',
'{a}は仲間の輪の外で、それでも穏やかな顔をしていた。'
],
mourn:[
'{v}の名は、船体の内側に刻まれた。誰かがそこを通るたび、指先でそっと触れていった。',
'{l}は、{v}のために小さな石を積んだ。この一年を一緒に越えられなかった仲間のことを、誰も忘れなかった。',
'食堂の一番奥の席は、{v}の席のまま空けておかれた。'
],
away:[
'{v}の行方は、最後まで分からなかった。救難信号の周波数には、今も{v}の名前が添えられている。',
'{v}は、まだ帰ってこない。一同は、{v}の寝台をそのままにしておいた。',
'{v}を探しに行くことは、もうできなかった。それでも誰も、{v}をいなくなった人とは呼ばなかった。'
],
endLow:[
'漂流の記録は、目的地の欄が空白のまま閉じられた。それでも船は、最後の力で信号を送り続けていた。',
'一年目の日誌は、ここで終わった。次のページを書けるかどうかは、誰にも分からなかった。',
'新しい星にはたどり着けなかった。弱々しい非常灯の下で、一同は救いが来る日を待ち続けた。'
],
logSolo:[
'{a}は、ひとりきりになった船室で航海日誌を開いた。{a}「生き残ったのは、私だけになった。それでも、記録は続ける｜＝｜生き残ったのは、私だけになりました。それでも、記録は続けます」',
'{a}は、仲間の名前を一人ずつ声に出して読み上げた。返事はなかったが、{a}は最後の名前まで読み終えた。',
'{a}は、誰もいない操縦席に向かって小さく頭を下げた。{a}「ここまで連れてきてくれて、ありがとう。私は、もう少し生きてみる｜ここまで連れてきてくれて、感謝する。私は、もう少し生きてみる｜ここまで連れてきてくれて、ありがとうございました。私は、もう少し生きてみます」'
],
log:[
'{a}は、航海日誌の最後のページを開いた。{a}「漂流一年目、記録を終える。私たちは、まだここにいる｜＝｜漂流一年目、記録を終えます。私たちは、まだここにいます」',
'{a}は日誌の端末を閉じる前に、一行だけ書き足した。{a}「全員の名前を、ここに残しておく。私が忘れないように｜全員の名前を、ここに残しておく。私が忘れないためだ｜全員の名前を、ここに残しておきます。私が忘れないためです」',
'{a}は、仲間の顔を一人ずつ見回してから言った。{a}「一年、よく持ちこたえた。私の自慢の船員たちだ｜＝｜一年、よく持ちこたえましたね。私の自慢の船員たちです」'
]
};
function epilogue(S){
if(S.after&&SH.AFTER&&SH.AFTER.epilogue(S))return;
var Pn=S.planet,L0=live(S),sp=S.ship,v={x:Pn?Pn.name:'',n:S.P.length,l:names(L0)};
var weak=S.weakEnd=sp.power<30||sp.o2<30||sp.hull<25||sp.food<15;
if(!L0.length){
var last=S.deaths[S.deaths.length-1]||S.P[S.P.length-1];
ST.step(S,'船の最期');
ST.say(S,{kind:'climax',tag:'結末',text:F(pk(S,EPI.wiped),{n:S.P.length,v:last.name})+(S.wipeBy?F(EPI.wipedBy,{w:S.wipeBy.name}):''),why:'船員が一人も残らなかった',mag:40});
return;
}
var out=[];
if(Pn){
ST.step(S,Pn.name+'に降り立つ');
var reveal=0;[Pn.res,Pn.civ].concat(Pn.life).forEach(function(o){reveal+=o.st;});
var civOk=Pn.civ.st>=1&& /primitive|living|advanced|transcendent/.test(Pn.civ.d.state);
var hostile=Pn.life.some(function(l){return l.st>=1&& /hostile|parasite/.test(l.d.kind);});
var pool= !reveal?EPI.fresh:civOk?EPI.civ:hostile||reveal<4?EPI.danger:EPI.settle;
var why= !reveal?'辿り着いたばかりで、まだ何も調べていない':civOk?'この星の文明と出会っていた':hostile?'危ない生命体がいると分かっていた':reveal<4?'まだ分からないことが多い':'星のことがよく分かっていた';
ST.say(S,{actors:L0,kind:'climax',tag:'結末：着陸',text:F(pk(S,pool),v)+(weak||sp.hull<40?EPI.broken:''),why:why,mag:40});
}else{
ST.step(S,weak?'力尽きかけた船':'漂流の一年の終わり');
ST.say(S,{actors:L0,kind:'climax',tag:weak?'結末：船の灯り':'結末：漂流',text:F(pk(S,weak?EPI.driftLow:EPI.driftOk),v),why:weak?'船の状態が悪い（動力 '+Math.round(sp.power)+'・生命維持 '+Math.round(sp.o2)+'・食料 '+Math.round(sp.food)+'）':'星は見つからなかったが、船はまだ動ける',mag:36});
}
var used=[];
S.endLovers=[];
(S.lovers||[]).forEach(function(pr){var a=S.P[pr[0]],b=S.P[pr[1]];if(L0.indexOf(a)<0||L0.indexOf(b)<0)return;[a,b].forEach(function(x){if(used.indexOf(x)<0)used.push(x);});S.endLovers.push([a.i,b.i]);out.push({act:[a,b],t:F(pk(S,EPI.lovers),{a:a.name,b:b.name})});});
var lone=L0.filter(function(p){return used.indexOf(p)<0;});
if(lone.length&&L0.length>1&&used.length){var ln=S.rng.pick(lone);out.push({act:[ln],t:F(pk(S,EPI.lone),{a:ln.name})});}
if(S.deaths.length){out.push({act:L0,t:F(pk(S,EPI.mourn),{v:names(S.deaths),l:v.l})});}
var aw=S.P.filter(function(p){return p.alive&&p.away;});
if(aw.length)out.push({act:L0,t:F(pk(S,EPI.away),{v:names(aw)})});
var cap=L0.filter(function(p){return p.role==='captain';})[0]||best(S,'lead');
out.push({act:[cap],t:F(pk(S,L0.length===1?EPI.logSolo:EPI.log),{a:cap.name})});
var END=SH.T.END||{};
var fin=S.endLine=F(pk(S,Pn?END.found:S.weakEnd?EPI.endLow:END.none),v);
ST.say(S,{actors:L0,tag:'結末',kind:'phase',text:out.map(function(o){return o.t;}).join('')+fin,why:'一年の漂流の締めくくり'});
}
function lineOf(lab,o,key,extra){
var d=o.d,st=o.st;
if(!st)return lab+'：？（未調査）';
return lab+'：'+d.name+extra+'――'+['','手がかりのみ','詳細まで判明','最深部まで判明'][st];
}
function finish(S,input){
var P=S.P,Pn=S.planet,L0=live(S);
var TROUBLE= /^(故障|危機|全滅|感染症|感染拡大|誘拐|遭難|行方不明|探索失敗|救出失敗|置き去り|病気|暴れる)/;
S.log.forEach(function(e){if(e.tag&&TROUBLE.test(e.tag))e.trouble=true;});
P.forEach(function(p){
if(!p.fate&&p.alive&&p.away==='taken')p.fate='連れ去られたまま、救出は間に合わなかった';
if(!p.fate&&p.alive&&p.away==='lost')p.fate='遭難したまま、一年が終わった';
if(!p.fate)p.fate='生還';
p.notes.push('役割：'+p.roleLabel+(p.picked?'（指定）':'（気質から）')+(capt(p)?'・使命感から揉めごとを収める':'')+(pleaser(p)?'・周りの機嫌を取る気質':''));
var bits=[];
if(SH.SPEC&&p.spec)bits.push(SH.SPEC.note(p));
if(p.cnt.find)bits.push('発見・調査の成功 '+p.cnt.find+'回');
if(p.cnt.item)bits.push('持ち帰った物品 '+p.cnt.item+'つ');
if(p.cnt.report)bits.push('レポート '+p.cnt.report+'本');
if(p.cnt.fix)bits.push('修理 '+p.cnt.fix+'回');
if(p.cnt.r18)bits.push('夜の出来事 '+p.cnt.r18+'回');
if(p.cnt.rage)bits.push('ストレスで暴れた '+p.cnt.rage+'回');
if(p.cnt.deep)bits.push('深酒 '+p.cnt.deep+'回');
if(p.cnt.inf)bits.push('感染 '+p.cnt.inf+'回');
if(p.cnt.taken)bits.push('連れ去られた '+p.cnt.taken+'回');
if(bits.length)p.notes.push(bits.join('・'));
});
var reveal=0,total=0;
if(Pn){[Pn.res,Pn.civ].concat(Pn.life).forEach(function(o){reveal+=o.st;total+=3;});}
var pct=total?Math.round(reveal/total*100):0;
var title= !L0.length?'全滅 ― '+(S.wipeBy?S.wipeBy.name+'で、':'')+'船は誰も乗せないまま漂い続けた':Pn?Pn.name+'に辿り着いた ― 珍しさ'+stars(Pn.rare)+'・判明度 '+pct+'%':S.weakEnd?'星は見つからなかった ― 力尽きかけた船で、救いの信号を送り続けた':'星は見つからなかった ― 一年の漂流';
if(S.after&&S.after.title)title=S.after.title;
var lines=P.map(function(p){return p.name+'（'+p.roleLabel+'）：'+p.fate;});
var END=SH.T.END||{};
lines.push(L0.length&&S.endLine?S.endLine:F(pk(S,!L0.length?END.wiped:Pn?END.found:END.none),{x:Pn?Pn.name:''}));
if(Pn){
lines.push('星：'+Pn.name+'（珍しさ'+stars(Pn.rare)+'）');
lines.push(lineOf('資源',Pn.res,'res',Pn.res.st>=2?'（'+USE_JP[Pn.res.d.use]+'・珍しさ'+stars(Pn.res.d.rare)+'）':''));
if(Pn.life.length)Pn.life.forEach(function(l,k){lines.push(lineOf('生命体'+(Pn.life.length>1?(k+1):''),l,'life',l.st>=2?'（'+LIFE_JP[l.d.kind]+'・珍しさ'+stars(l.d.rare)+'）':''));});
else lines.push('生命体：いなかった');
lines.push(lineOf('文明',Pn.civ,'civ',Pn.civ.st>=2?'（'+CIV_JP[Pn.civ.d.state]+'・珍しさ'+stars(Pn.civ.d.rare)+'）':''));
}
if(S.items.length)lines.push('持ち帰った物品：'+S.items.map(function(x){return x.name;}).join('、'));
if(S.reports.length)lines.push('書き上げたレポート：'+S.reports.map(function(x){return'『'+x.title+'』（'+x.by+'）';}).join('、'));
var sp=S.ship;
lines.push('船の状態：船体 '+Math.round(sp.hull)+'・動力 '+Math.round(sp.power)+'・生命維持 '+Math.round(sp.o2)+'・食料 '+Math.round(sp.food)+'・士気 '+Math.round(sp.morale));
var rows=P.map(function(p){return{i:p.i,rank:'',cells:[p.roleLabel,p.cnt.find+'回',p.cnt.item+'つ',p.cnt.report+'本',p.fate]};});
return ST.result(S,input,{
ending:{title:title,kind:L0.length&&Pn?'ok':'over',lines:lines},
estats:[['星',Pn?Pn.name:'―'],['珍しさ',Pn?stars(Pn.rare):'―'],['判明度',Pn?pct+'%':'―'],['物品',S.items.length+'つ'],['レポート',S.reports.length+'本'],['生還',L0.length+'/'+P.length+'人']],
table:{title:'船員',hint:'調査：星の探索で成功した回数。',cols:['役割','調査','物品','レポート','結末'],rows:rows},
meters:[{label:'体力',color:'--accent'},{label:'不安',color:'--enemy',dash:true},{label:'発見',color:'--love',max:6},{label:'ストレス',color:'--warn',dash:true}],
meta:(Pn?Pn.name:'星なし')+'・12か月',
relmap:relmap(S),
summary:'宇宙船漂流記：'+title
});
}
SH.skill=skill;SH.bond=bond;
SH.API={live:live,bond:bond,lover:lover,amour:amour,canJoin:canJoin,join:join,loversOf:loversOf,family:family,ties:ties,rk:rk,loveOK:loveOK,setRel:setRel,stress:stress,pk:pk,names:names,closest:closest,makePlanet:makePlanet};
})();
});
;
/* ==== js/ship-special.js ==== */
HK.Load.def(228,'js/ship-special.js',function(){
(function(){
'use strict';
var HK=window.HK,SH=HK.SHIP,SP=HK.Special,ST=HK.Story;
if(!SH|| !SP|| !ST)return;
function clamp(v,a,b){return Math.max(a,Math.min(b,v));}
function full(p){return 70+((p.stats&&p.stats.hp)||3)*6;}
function adapter(S){
var A=S.spA;
if(!A)A=S.spA={
rng:S.rng,all:S.P,env:S.env,scenId:'ship',
r18: !HK.SAFE_ON&&(S.env.slewd||0)>0,lewd:clamp((S.env.slewd||0)/100,0.15,0.85),
alive:function(p){return!!p.alive;},
here:function(p){return!p.away&& !p.gone;},
say:function(o){var r=ST.say(S,o);if(o.key&&r)ST.key(S,r,o.key);return r;},
hp:function(p){return p.m.hp;},
setHp:function(p,v){p.m.hp=clamp(v,0,full(p));},
full:full,
stress:function(p){return Math.max(p.m.st||0,p.m.fear||0);},
addStress:function(p,v){p.m.st=clamp((p.m.st||0)+v,0,100);},
rel:function(a,b){var w=SH.bond?SH.bond(S,a,b):0;return{love:w>=0.95,w:w};},
revive:function(p){
p.alive=true;p.fate='';
var k=S.deaths.indexOf(p);if(k>=0)S.deaths.splice(k,1);
},
kill:function(p,how,text){
p.alive=false;p.fate='死亡（'+S.m+'か月目・'+how.replace(/で$|に$/,'')+'）';
S.deaths.push(p);
var o=ST.say(S,{actors:[p],tag:'死',kind:'climax',text:text,why:how+'命を落とした',mag:40});
ST.key(S,o,p.name+'の死');
},
zombie:function(){return false;}
};
A.nowH=(S.m||0)*72;
return A;
}
SH.SPEC={
setup:function(S,input){
SP.setup(adapter(S),S.P,function(p){return input.perChar&&input.perChar[p.i];});
S.P.forEach(function(p){if(p.spec)p.roleLabel+='・'+SP.LABEL[p.spec];});
},
month:function(S){
if(!S.P.some(function(p){return p.spec;}))return;
if(S.after)return;
var A=adapter(S);
if(!S.wipeBy)SP.revive(A);
S.P.forEach(function(p){
if(!p.spec|| !p.alive||p.away)return;
if(p.mad){SP.madTurn(A,p);return;}
SP.vampTurn(A,p);
SP.wear(A,p,{base:65});
});
},
note:function(p){return SP.endNote(p);},
adapter:adapter
};
})();
});
;
/* ==== js/ship-after.js ==== */
HK.Load.def(229,'js/ship-after.js',function(){
(function(){
'use strict';
var HK=window.HK,SH=HK.SHIP,ST=HK.Story;
if(!SH|| !ST)return;
function L(s){return s.split('|');}
function clamp(v,a,b){return Math.max(a,Math.min(b,v));}
var ATT=['proud','stern','tsun','gentle','devoted','cool','free','shy','polite'];
function att(p){if(HK.Emo&&HK.Emo.att)return HK.Emo.att(p);return p&&ATT.indexOf(p.persona)>=0?p.persona:'gentle';}
function bump(S,p,d){if(HK.Emo&&HK.Emo.bump)HK.Emo.bump(S,p,d);}
function X(){return SH.API;}
function pk(S,arr){return X().pk(S,arr);}
function F(t,m){return ST.fmt(t,m||{});}
var SAY={
obsess:{
proud:L('{b}「こいつに触るな。看るのは俺だ」|{b}「隔離？　ふざけるな。こいつのそばを離れる気はない」|{b}「うつるなら、それでいい。……一緒に倒れるだけだ」'),
stern:L('{b}「隔離の決まりは分かっている。分かった上で、ここにいる」|{b}「{a}の看病は、私がする。誰にも任せない」|{b}「私の目の届かないところで、{a}を死なせるわけにはいかない」'),
tsun:L('{b}「べ、べつに心配なんかじゃない。……でも、ここからは動かないから」|{b}「出ていけって言われても出ていかない。{a}は、私が見てるの」|{b}「勝手に倒れないでよ。……許さないんだから」'),
gentle:L('{b}「大丈夫。ずっとここにいるよ。どこにも行かせないからね」|{b}「ガラス越しなんて、いや。{a}の手を、握っていたいの」|{b}「うつってもいいの。{a}がひとりで苦しむより、ずっといい」'),
devoted:L('{b}「私の全部をあげます。だから、{a}だけは連れていかないで」|{b}「眠らなくて平気です。{a}が目を開けたとき、最初に見るのは私でいたいから」|{b}「{a}がいなくなったら、私には何も残らないんです」'),
cool:L('{b}「隔離の効果は、もう計算した。私がそばにいても誤差の範囲だ」|{b}「{a}の容体は、私がいちばん分かっている。だから、ここは譲らない」|{b}「理屈じゃない。……{a}から目を離したくないだけだ」'),
free:L('{b}「やだ。{a}と離れるくらいなら、一緒に熱を出したほうがまし」|{b}「決まりなんて知らない。{a}のそばが、あたしの場所なの」|{b}「ねえ{a}、勝手にいなくならないでね。約束だよ」'),
shy:L('{b}「……は、離れたく、ない。{a}のそばに、いさせて……」|{b}「ご、ごめんなさい……でも、ここから動けないの……」|{b}「{a}がいないと……息が、できないの」'),
polite:L('{b}「申し訳ありませんが、{a}のお世話は私に一任していただきます」|{b}「隔離区画への立ち入りを、許可していただけますね。……いえ、許可がなくても入りますが」|{b}「どうか、{a}を私から取り上げないでください」')
},
lover:{
proud:L('{b}「おい、しっかりしろ。お前がいないと、張り合いがないだろ」|{b}「熱なんか、さっさと下げろ。……待ってるからな」|{b}「俺が付いてる。だから、勝手に弱気になるな」'),
stern:L('{b}「必ず治る。私が保証する」|{b}「無理に話さなくていい。そばにいる」|{b}「休め。今は、それが{a}の仕事だ」'),
tsun:L('{b}「……心配なんか、してないから。ちょっと様子を見に来ただけ」|{b}「早く治しなさいよ。……ひとりだと、つまんないんだから」|{b}「ばか。こんなときくらい、頼りなさいよ」'),
gentle:L('{b}「大丈夫、ここにいるよ。眠れるまで、手を握ってるね」|{b}「熱いね。冷たいタオル、替えてくるから」|{b}「治ったら、また一緒に星を見ようね」'),
devoted:L('{b}「欲しいものがあったら、何でも言って。全部持ってくるから」|{b}「代われるものなら、代わってあげたい」|{b}「眠ってて。そのあいだ、私がずっと見てるから」'),
cool:L('{b}「数値は悪くない。……たぶん、大丈夫だ」|{b}「水だ。飲めるか。……ゆっくりでいい」|{b}「心配はしていない。ただ、そばにいたいだけだ」'),
free:L('{b}「ねえ、元気になったら何したい？　全部付き合うよ」|{b}「熱を出してる{a}も、ちょっとかわいいけどね。……早く治して」|{b}「退屈したら呼んでね。歌でも歌ってあげる」'),
shy:L('{b}「……あ、あの……手、握ってても、いい……？」|{b}「ずっと、ここにいるから……こわくないよ……」|{b}「早く、よくなって……ね……」'),
polite:L('{b}「ご無理なさらず。私がおそばにおりますから」|{b}「何かあれば、すぐにお呼びください。どんな時間でも構いません」|{b}「必ず良くなります。……そう信じております」')
},
honmei:{
proud:L('{b}「……べつに、お前だから看てるわけじゃない。たまたまだ」|{b}「治ったら、言いたいことがある。だから治せ」|{b}「お前が倒れてると、調子が狂うんだよ」'),
stern:L('{b}「……今は、言うべきことではないな。治ってから話す」|{b}「{a}がいない船は、困る。……それだけだ」|{b}「容体は逐一、私に知らせてくれ。……個人的に、気になる」'),
tsun:L('{b}「か、勘違いしないでよ。みんなが心配してるから来ただけ」|{b}「治ったら……ううん、なんでもない」|{b}「あんたがいないと……困るのよ、いろいろ」'),
gentle:L('{b}「まだ、伝えてないことがあるの。だから、元気になってね」|{b}「{a}が笑ってくれないと、なんだか落ち着かないな」|{b}「眠ってていいよ。……少しだけ、ここにいさせてね」'),
devoted:L('{b}「気づいてもらえなくてもいいんです。{a}が元気でいてくれたら」|{b}「私にできることなら、何でもします。……何でも」|{b}「{a}のためなら、眠らなくても平気です」'),
cool:L('{b}「……別に、特別な意味はない。様子を見に来ただけだ」|{b}「{a}の席が空いていると、妙に静かだ」|{b}「早く戻ってこい。……話し相手が、いない」'),
free:L('{b}「元気になったら、ちょっと聞いてほしい話があるんだ。だから絶対治してね」|{b}「{a}がいないと、船がつまんないんだよね」|{b}「ねえ、あたしが看病してるの、ちゃんと覚えといてよ？」'),
shy:L('{b}「……げ、元気になったら……その……話したいことが……」|{b}「……{a}が、いなくなったら……いやだ……」|{b}「こっそり……お守り、置いておくね……」'),
polite:L('{b}「差し出がましいようですが、看病させていただけませんか」|{b}「{a}がいらっしゃらないと、皆が……いえ、私が寂しいのです」|{b}「お元気になられたら、お伝えしたいことがございます」')
},
family:{
proud:L('{b}「お前は俺が守る。昔から、そう決まってるだろ」|{b}「誰にも文句は言わせない。看病は俺がやる」|{b}「しっかりしろ。家族を置いて先に行くなんて、許さねえぞ」'),
stern:L('{b}「家族の看病は、私の務めだ」|{b}「必要なものは全部私が用意する。{a}は休んでいろ」|{b}「怖がらなくていい。私がついている」'),
tsun:L('{b}「まったく、昔から世話が焼けるんだから」|{b}「別に、家族だから来ただけだからね」|{b}「さっさと治して、いつもみたいに文句言いなさいよ」'),
gentle:L('{b}「小さい頃、熱を出したときもこうしてたね。覚えてる？」|{b}「大丈夫。家族がそばにいるからね」|{b}「ゆっくり休んで。全部、任せて」'),
devoted:L('{b}「{a}のためなら、何だってする。家族なんだから」|{b}「代わってあげられたらいいのに……」|{b}「眠れないなら、昔みたいに子守唄を歌おうか」'),
cool:L('{b}「家族の容体くらい、自分で見る」|{b}「心配はいらない。……と言いたいが、正直、少し怖い」|{b}「お前の好物を取っておいた。治ったら食べろ」'),
free:L('{b}「元気になったら、また昔みたいにふざけようね」|{b}「家族がそろってないと、調子出ないんだよね」|{b}「ほら、いつもの憎まれ口はどうしたの？」'),
shy:L('{b}「……ひとりにしないから……家族、だもん……」|{b}「……昔みたいに、手、つないでて、いい……？」|{b}「……早く、元気に、なって……」'),
polite:L('{b}「家族として、看病はお任せください」|{b}「何も心配なさらず、お休みください」|{b}「{a}の分まで、私がしっかりいたしますから」')
},
friend:{
proud:L('{b}「相棒が寝込んでるのに、放っておけるかよ」|{b}「さっさと治せ。お前の分の仕事まで、俺がやる羽目になる」|{b}「いいか、くたばるなよ。まだ勝負の決着がついてねえ」'),
stern:L('{b}「相棒の穴は、私が埋める。安心して休め」|{b}「お前の持ち場は私が見ておく」|{b}「弱音を吐いてもいい。聞くのは私だけだ」'),
tsun:L('{b}「べ、別に心配なんかしてないし。相棒がいないと困るだけ」|{b}「早く治さないと、あんたの分のおやつ食べちゃうからね」|{b}「ほんと、世話が焼けるんだから」'),
gentle:L('{b}「無理しないでね。持ち場のことは、心配しなくていいよ」|{b}「治ったら、またいっぱい話そうね」|{b}「ひとりで抱え込まないで。私がいるから」'),
devoted:L('{b}「欲しいものがあったら言って。すぐ持ってくるから」|{b}「{a}の分の仕事、全部やっておいたよ。だから安心して」|{b}「眠れるまで、そばにいるね」'),
cool:L('{b}「お前の持ち場は片づけておいた。礼はいらない」|{b}「見舞いだ。……長居はしない、たぶん」|{b}「お前がいないと、張り合いがない」'),
free:L('{b}「暇でしょ？　カード持ってきたよ。寝ながらでもできるやつ」|{b}「元気になったら、また二人で抜け出そうね」|{b}「ねえ、早く治して。退屈でしょうがないよ」'),
shy:L('{b}「……お、お見舞い……持ってきた……」|{b}「……{a}がいないと……話せる人、いなくて……」|{b}「……早く、よくなってね……」'),
polite:L('{b}「お見舞いに参りました。お加減はいかがですか」|{b}「持ち場のことは、どうかご心配なく」|{b}「何かお手伝いできることがあれば、遠慮なく」')
},
close:{
proud:L('{b}「ったく、だらしねえな。……ほら、水だ」|{b}「船の戦力が減るのは困るんだよ。早く治せ」|{b}「俺の前で倒れたからには、治るまで面倒見てやる」'),
stern:L('{b}「容体が変わったら、すぐに知らせる。安心しろ」|{b}「必要なものはあるか」|{b}「仲間を見捨てる船ではない。それだけは約束する」'),
tsun:L('{b}「たまたま通りかかっただけよ。……で、熱は？」|{b}「別に、あんたのためじゃないから」|{b}「早く治しなさい。みんな、静かすぎて落ち着かないの」'),
gentle:L('{b}「つらいよね。少しでも楽になるように、毛布を持ってきたよ」|{b}「ひとりじゃないからね」|{b}「みんな、待ってるよ」'),
devoted:L('{b}「何かできることはない？　何でも言ってね」|{b}「私の分の配給、少し回すね」|{b}「眠れなかったら、呼んでね」'),
cool:L('{b}「……見舞いだ。用はそれだけだ」|{b}「船医の見立てでは、まだ望みはある」|{b}「早く戻ってこい。人手が足りない」'),
free:L('{b}「お見舞いにお菓子……は、まだ食べられないか。じゃあ歌でも」|{b}「みんなで{a}の分まで騒いでおくね」|{b}「早く元気になってよ。張り合いないんだから」'),
shy:L('{b}「……あの……お、お大事に……」|{b}「……毛布、置いておくね……」|{b}「……みんな、心配してるよ……」'),
polite:L('{b}「お加減はいかがですか。何かございましたら、お声がけください」|{b}「皆さん、{a}のご回復を祈っております」|{b}「どうかご無理なさらず」')
}
};
var RX={
obsess:{
start:L('{b}は、{a}の熱を知るなり隔離区画の扉の前に陣取った。「入るな」と止められても、{b}は首を横に振るだけだった。|{a}を隔離すると決まったとき、{b}は真っ先に反対した。{b}はそのまま、扉の外に毛布を敷いて座り込んだ。|{b}は、{a}の寝台のそばから一歩も動かなかった。食事も睡眠も、すべてその場で済ませた。'),
worse:L('{a}の容体が悪くなるたびに、{b}の目の下の隈は濃くなった。{b}は、眠っている{a}の呼吸の数を、ひと晩じゅう数えていた。|{b}は隔離区画のガラスに額を押しつけたまま、何時間も動かなかった。誰が呼んでも、振り返らなかった。|{b}は防護服も着ずに区画へ入ろうとして、皆に取り押さえられた。押さえつけられながら、{b}は{a}の名前を呼び続けた。'),
left:L('{a}を星に残すと決まったとき、{b}は船を降りようとした。羽交い締めにされても、{b}はハッチを叩き続けた。|{b}は、閉じたハッチの前から動かなかった。「迎えに行く｜＝｜迎えに行きます」――誰に言うでもなく、{b}は何度もそう繰り返した。|{b}は、{a}を残していった全員を、ひとりずつ黙って睨みつけた。その日のうちに、{b}は救命艇の燃料を数えはじめていた。'),
death:L('{b}は、{a}の眠る区画から離れようとしなかった。冷たくなった手を握ったまま、{b}は、まだ温かいと言い張った。|{b}は、{a}を運び出そうとする手を払いのけた。{b}「連れていかないで｜連れていくな｜連れていかないでください」――その声は、もう泣き声ですらなかった。|{a}の名札を外そうとした誰かの手を、{b}が掴んで止めた。{b}は、その名札を自分の胸にしまい込んだ。'),
cure:L('{a}の熱が引いたと聞いて、{b}は区画に飛び込んだ。{b}は{a}を抱きしめたまま、しばらく誰にも渡そうとしなかった。|{a}が目を開けたとき、最初に見たのは{b}の顔だった。{b}は、それから何日も{a}のそばを離れなかった。|{b}は、回復した{a}の手を握ったまま離さなかった。{b}「もう、どこにも行かせない｜＝｜もう、どこにも行かせません」――冗談のような口ぶりだったが、目は笑っていなかった。'),
doc:L('{b}は{c}に詰め寄った。{b}「治せないなら、代わってよ。{c}が代わればいい｜治せないなら、代われ。{c}が代わればいい｜治せないなら、代わってください。{c}が代わればいいんです」――{c}は何も言い返せなかった。|{b}は{c}の処置にいちいち口を挟み、薬の量を自分の目で確かめた。{b}「{a}に何かあったら、許さない｜＝｜{a}に何かあったら、許しません」|{b}は、{c}が隔離を勧めたことを許さなかった。{b}「{c}が、{a}を閉じ込めたんだ｜{c}が、{a}を閉じ込めたのだ｜{c}が、{a}を閉じ込めたんです」')
},
lover:{
start:L('{a}の熱を聞いて、{b}はすぐに駆けつけた。隔離区画のガラス越しに、{b}は手のひらを当てた。|{b}は、{a}のために薄いスープを作って、毎食欠かさず運んだ。|{b}は防護服を着込んで、{a}の枕元に座った。{a}が眠るまで、{b}は手袋越しに手を握っていた。'),
worse:L('{b}は、{a}の汗ばんだ額を何度も拭った。{a}がうわごとで呼ぶのは、いつも{b}の名前だった。|{a}の呼吸が浅くなるたび、{b}は息を詰めて見守った。眠れない日が、何日も続いた。|{b}は、{a}の好きだった歌を、ガラス越しに小さく口ずさんだ。{a}の指が、かすかに拍子を刻んだ。'),
left:L('{a}が星に残されると決まった日、{b}は食堂の隅で声を殺して泣いた。|{b}は、最後まで{a}を残すことに反対した。ハッチが閉まったあと、{b}は窓に額を押しつけて、遠ざかる野営地を見つめていた。|{b}は、{a}に渡す荷物の中に、そっと自分の手紙を入れた。それしか、できることがなかった。'),
death:L('{b}は、{a}の手を最後まで握っていた。その手が冷たくなっても、{b}はしばらく離さなかった。|{b}は、{a}の髪をそっと撫でた。{b}「よく頑張ったね｜よく頑張ったな｜よく頑張りましたね」――その声は、震えていた。|{b}は、{a}の枕元に置いていた小さな星のかけらを、{a}の胸の上に載せた。'),
cure:L('{a}の熱が引いた朝、{b}は区画に入るなり{a}を抱きしめた。二人とも、しばらく何も言えなかった。|{b}は、回復した{a}にいちばんに温かい飲み物を差し出した。{a}が「おいしい｜＝｜おいしいです」と笑うと、{b}は泣き笑いの顔になった。|{a}が初めて自分の足で立った日、{b}はずっとその手を支えていた。')
},
honmei:{
start:L('{b}は、{a}が倒れたと聞いて、持っていた工具を取り落とした。|{b}は誰にも言わずに、{a}の隔離区画の前に小さな差し入れを置いていった。|{b}は、{a}の看病の当番を自分から買って出た。理由を聞かれても、はっきりとは答えなかった。'),
worse:L('{b}は、{a}の容体を記した記録を何度も読み返した。数字が悪くなるたび、胸の奥が冷えた。|{b}は、眠る{a}の横顔をガラス越しに見つめた。言えずにいた言葉が、喉の奥で重くなった。|{b}は、{a}が目を覚ましたときのために、毎日同じ場所で待っていた。'),
left:L('{b}は、{a}を残していくと聞いて、言えなかった言葉を叫びそうになった。結局、{b}の口から出たのは「元気で｜元気でいろ｜お元気で」だけだった。|{b}は、遠ざかる星を見つめながら、{a}に伝えなかったことを悔やんだ。|{b}は、{a}の残していった上着を、誰にも見られないように抱きしめた。'),
death:L('{b}は、{a}の名札の前に立ちつくした。伝えるはずだった言葉は、もうどこにも行き場がなかった。|{b}は、{a}の眠る区画のガラスに、指で小さく何かを書いて、すぐに消した。|{b}は、誰もいなくなった通路で、ようやく{a}への想いを声に出した。返事は、なかった。'),
cure:L('{a}が目を覚ましたと聞いて、{b}は走ってきた。そして、何も言えずに立ち止まった。|{b}は回復した{a}に「おかえり｜＝｜おかえりなさい」とだけ言った。それだけで、胸がいっぱいだった。|{b}は、元気になった{a}の笑顔を見て、そっと目をそらした。頬が熱かった。')
},
family:{
start:L('{b}は、{a}の熱を聞くなり、看病の当番表からほかの名前を消して、自分の名前だけを書いた。|{b}は、{a}の寝台のそばに座り込み、子どもの頃と同じように額に手を当てた。|{b}は、隔離の決まりを守りながらも、一日に何度も{a}の様子を見に来た。'),
worse:L('{b}は、悪くなっていく{a}の容体を前に、ひとりで薬の資料を読みあさった。家族を守る方法を、ほかに知らなかった。|{b}は、{a}の手を握って、家族の古い思い出話を聞かせ続けた。|{b}は、{a}の看病を代わろうとする仲間を、静かに断った。{b}「これは、家族の役目だから｜これは、家族の役目だ｜これは、家族の役目ですから」'),
left:L('{b}は、{a}を残していくという決定に、最後まで首を縦に振らなかった。それでも、決定は覆らなかった。|{b}は、{a}のために、持てるだけの薬と食料を自分の分から詰め込んだ。|{b}は、遠ざかる星に向かって、家族の名前を何度も呼んだ。'),
death:L('{b}は、{a}の体を自分の手で清め、いちばんきれいな服を着せた。|{b}は、{a}の名札を両手で包み込んだ。家族が、またひとり減った。|{b}は、{a}の枕元で、子どもの頃に二人で歌った歌を口ずさんだ。最後まで歌いきることは、できなかった。'),
cure:L('{b}は、回復した{a}の頭を、子どもにするように乱暴に撫でた。|{b}は、{a}の熱が引いたのを確かめると、その場に座り込んで大きく息を吐いた。|{b}は、元気になった{a}に、こっそり取っておいた好物を差し出した。')
},
friend:{
start:L('{b}は、相棒が倒れたと聞いて、持ち場を放り出して駆けつけた。|{b}は、{a}の持ち場の仕事を黙って引き受けた。|{b}は、隔離区画の外から{a}に通信をつなぎ、くだらない冗談を言い続けた。'),
worse:L('{b}は、{a}の容体が悪くなっても、通信で冗談を言うのをやめなかった。声が震えていたのは、{a}にも分かっていた。|{b}は、二人で決めた合図をガラス越しに送った。{a}は、弱々しく同じ合図を返した。|{b}は、{a}の分の仕事を終えるたびに、区画の前で報告した。返事がなくても、報告を続けた。'),
left:L('{b}は、{a}を残すことに最後まで反対した。決まったあと、{b}は誰とも口を利かなかった。|{b}は、{a}の荷物に、二人でよく遊んだカードを忍ばせた。|{b}は、閉まりかけたハッチの向こうの{a}に、いつもの合図を送った。{a}も、同じ合図を返した。'),
death:L('{b}は、{a}の持ち場の椅子に座り、しばらく動かなかった。|{b}は、{a}と最後に交わした冗談を思い出して、笑おうとして、できなかった。|{b}は、{a}の使っていた工具を、一つずつ丁寧に拭いて片づけた。'),
cure:L('{b}は、回復した{a}の背中を思いきり叩いた。その手は、少し震えていた。|{b}は、{a}に持ち場を返しながら、ようやく肩の荷を下ろしたように笑った。|{b}は、{a}が初めて食堂に戻ってきた日、黙って隣の席を空けておいた。')
},
close:{
start:L('{b}は、{a}が倒れたと聞いて、すぐに様子を見に来た。|{b}は、{a}のために予備の毛布を探し出してきた。|{b}は、隔離区画の前を通るたびに、ガラスを軽く叩いて合図した。'),
worse:L('{b}は、{a}の容体を気にかけて、何度も様子を尋ねた。|{b}は、{a}の区画の前で立ち止まり、しばらく黙って中を見ていた。|{b}は、{a}が少しでも眠れるよう、近くの機械の音を止めて回った。'),
left:L('{b}は、{a}を残していく決定に、黙ってうつむいた。|{b}は、{a}に渡す荷物を、ひとつずつ確かめて詰めた。|{b}は、遠ざかる星を、最後まで窓から見ていた。'),
death:L('{b}は、{a}の名札の前で長いこと黙っていた。|{b}は、{a}のために小さな灯りをともした。|{b}は、{a}の寝台をきれいに整えた。もう、誰も使うことはなかった。'),
cure:L('{b}は、回復した{a}にほっとした顔を見せた。|{b}は、{a}の回復を祝って、とっておきの飲み物を開けた。|{b}は、食堂に戻ってきた{a}に、真っ先に「おかえり｜＝｜おかえりなさい」と声をかけた。')
}
};
var LEFT_SAY={
proud:L('{b}「……覚えてろ。必ず、迎えに行く」|{b}「誰が決めたかなんて、どうでもいい。俺は納得してない」|{b}「あいつは、そんな簡単にくたばる奴じゃない」'),
stern:L('{b}「この決定の責任は、私も負う。……忘れはしない」|{b}「生きていてくれ。それだけを、命じる」|{b}「いつか必ず、迎えに戻る」'),
tsun:L('{b}「……ばか。なんで、何も言わないのよ」|{b}「泣いてなんか、ないから」|{b}「迎えに行くまで、勝手にいなくならないでよね」'),
gentle:L('{b}「ごめんね……本当に、ごめんね」|{b}「どうか、無事でいて。それだけを祈ってる」|{b}「いつか、また会えるよね」'),
devoted:L('{b}「私が、代わりに残ればよかったのに」|{b}「何もしてあげられなかった……」|{b}「待っていてください。必ず、迎えに行きます」'),
cool:L('{b}「……合理的な判断だ。分かっている。分かっているが」|{b}「生き延びる見込みは、ゼロじゃない」|{b}「……記録には残しておく。忘れないように」'),
free:L('{b}「やだ、こんなの、やだよ……」|{b}「絶対、また会えるって信じてるから」|{b}「迎えに行くとき、とびきりのお土産を持っていくね」'),
shy:L('{b}「……いかないで……」|{b}「……ごめんなさい……とめられなくて……」|{b}「……まってて、ね……」'),
polite:L('{b}「どうか、ご無事で。……お許しください」|{b}「必ずお迎えにあがります」|{b}「この決定を、私は一生忘れません」')
};
var DEATH_SAY={
proud:L('{b}「……ふざけるな。勝手に、先に行って」|{b}「お前のこと、忘れてやるもんか」|{b}「……よく、頑張ったな」'),
stern:L('{b}「……安らかに眠れ。あとのことは、私が引き受ける」|{b}「守りきれなかった。……すまない」|{b}「お前の分まで、この船を進める」'),
tsun:L('{b}「……ばか。返事、しなさいよ」|{b}「まだ、言ってないことがあったのに」|{b}「……泣いてない。泣いてなんか、ない」'),
gentle:L('{b}「おやすみ。もう、苦しくないね」|{b}「ありがとう。ずっと、忘れないよ」|{b}「……また、どこかで会おうね」'),
devoted:L('{b}「代わってあげたかった……」|{b}「最後まで、そばにいられてよかった」|{b}「{a}のいない明日なんて、考えられない」'),
cool:L('{b}「……記録は、私がつけておく」|{b}「……静かになったな」|{b}「……少し、ひとりにしてくれ」'),
free:L('{b}「うそでしょ……ねえ、起きてよ」|{b}「また一緒に笑うって、約束したじゃん」|{b}「……あたし、ちゃんと泣けてるかな」'),
shy:L('{b}「……いかないで……おいて、いかないで……」|{b}「……ありがとう……ずっと……」|{b}「……ひとりに、しないで……」'),
polite:L('{b}「……どうか、安らかに」|{b}「今まで、本当にありがとうございました」|{b}「{a}のことは、決して忘れません」')
};
var CURE_SAY={
proud:L('{b}「ほらな、言っただろ。お前がくたばるわけない」|{b}「心配なんかしてなかったけどな」|{b}「……おかえり」'),
stern:L('{b}「よく持ちこたえた。立派だ」|{b}「しばらくは無理をするな。命令だ」|{b}「……戻ってきてくれて、よかった」'),
tsun:L('{b}「べ、別に嬉しくなんかないから」|{b}「心配かけた分、ちゃんと返してもらうからね」|{b}「……おかえり。ばか」'),
gentle:L('{b}「よかった……本当に、よかった」|{b}「おかえりなさい。ずっと待ってたよ」|{b}「また一緒にご飯が食べられるね」'),
devoted:L('{b}「神様、ありがとう……」|{b}「もう二度と、こんな思いはしたくない」|{b}「何でも好きなもの、作ってあげるね」'),
cool:L('{b}「数値は正常だ。……ああ、よかった」|{b}「思っていたより早い回復だな」|{b}「……おかえり」'),
free:L('{b}「おかえり！　ほんとに、おかえり！」|{b}「お祝いしなきゃ。今日はごちそうだよ！」|{b}「もう、心配させないでよね！」'),
shy:L('{b}「……よかった……ほんとに……」|{b}「……おかえり、なさい……」|{b}「……う、うれしい……」'),
polite:L('{b}「ご回復、心よりお喜び申し上げます」|{b}「本当に、よろしゅうございました」|{b}「おかえりなさいませ」')
};
var CLOSE={
proud:L('{w}は拳を握りしめた。{w}「……{a}の分まで、生き延びてやる」|{w}は{a}の名札を拾い上げて、乱暴に袖で拭った。{w}「こんなところで、終わらせてたまるか」|{w}は誰にも顔を見せず、通路の奥へ歩いていった。{w}「……先に行って、待ってろ」'),
stern:L('{w}は、日誌に{a}の名前を書き記した。{w}「……忘れない。決して」|{w}は、皆の前で静かに頭を下げた。{w}「{a}に、黙祷を」|{w}は、{a}の持ち場を最後に点検してから灯りを消した。{w}「ご苦労だった」'),
tsun:L('{w}は、そっぽを向いたまま呟いた。{w}「……ばか。先に行かないでって、言ったのに」|{w}は、{a}の毛布をきれいに畳んだ。{w}「片づけくらい、してあげるわよ」|{w}は、目元を乱暴にこすった。{w}「泣いてない。……泣いてないから」'),
gentle:L('{w}は、{a}の眠る場所に小さな花を置いた。{w}「おやすみ、{a}」|{w}は、皆の肩を一人ずつ抱いた。{w}「{a}は、最後まで頑張ったよ」|{w}は窓の外の星を見上げた。{w}「どれかひとつが、{a}だったらいいな」'),
devoted:L('{w}は、{a}の寝台のそばで祈り続けた。{w}「どうか、向こうでは苦しまないで」|{w}は、{a}の残した仕事を、黙って引き継いだ。{w}「あとは、私がやります」|{w}は、{a}の手をそっと胸の上で組ませた。{w}「ゆっくり、休んでください」'),
cool:L('{w}は、記録の端末を閉じた。{w}「……{a}の記録は、ここまでだ」|{w}は、しばらく何も言わなかった。{w}「……静かすぎるな、この船は」|{w}は、{a}の使っていたカップを棚の奥にしまった。{w}「……捨てるのは、まだ早い」'),
free:L('{w}は、泣きながら笑った。{w}「{a}、向こうでも騒いでてよね」|{w}は、{a}の好きだった歌を口ずさんだ。{w}「……ほら、続き、歌ってよ」|{w}は、窓に息を吹きかけて、{a}の名前を書いた。{w}「忘れないからね」'),
shy:L('{w}は、小さな声で何度も{a}の名前を呼んだ。{w}「……ありがとう、{a}」|{w}は、{a}の名札を両手で握りしめた。{w}「……わすれない……」|{w}は、誰にも聞こえないように呟いた。{w}「……またね」'),
polite:L('{w}は、深く頭を下げた。{w}「{a}、本当にお疲れさまでした」|{w}は、{a}の名を日誌に丁寧に書き記した。{w}「安らかにお眠りください」|{w}は、皆に向き直った。{w}「{a}のためにも、私たちは前に進みましょう」')
};
var KIND_JP={obsess:'執着している相手',lover:'恋人',honmei:'本命',family:'家族',friend:'親友・相棒',close:'いちばん近しい仲間'};
var EV_JP={start:'病に倒れた',worse:'病状が悪化した',left:'置き去りにされた',death:'病で亡くなった',cure:'病から回復した'};
var PRI={obsess:6,lover:5,honmei:4,family:3,friend:2,close:1};
function relKind(S,q,a){
var A=X(),ts=A.ties(S,q,a),lv= !HK.ngPair(q,a)&&A.loveOK(q,a);
if(HK.Obsess&&HK.Obsess.storyLevel&&HK.Obsess.storyLevel(S,q,a)>=35)return'obsess';
if(isLover(S,q,a))return'lover';
if(lv&&(q.honmei===a.i||ts.some(function(t){return(t.type==='crush'&&t.a===q.i)||t.type==='almost';})))return'honmei';
if(A.family(S,q,a))return'family';
if(ts.some(function(t){return/^(best|buddy|childhood|friend|sworn)$/.test(t.type);})||A.bond(S,q,a)>=0.6)return'friend';
return'close';
}
SH.AFTER={};
SH.AFTER.react=function(S,a,ev,ex){
var A=X();
if(!A|| !a|| !SAY.close)return null;
var R=S.infR=S.infR||{},k0=S.m+'|'+a.i,used=R[k0]=R[k0]||[];
var cand=A.live(S).filter(function(q){return q!==a&&(!ex||ex.indexOf(q)<0)&&used.indexOf(q.i)<0&& !q.mad;});
if(!cand.length)return null;
var sc=cand.map(function(q){var k=relKind(S,q,a);return{q:q,k:k,v:PRI[k]*10+A.bond(S,q,a)};}).sort(function(x,y){return y.v-x.v;})[0];
var b=sc.q,kind=sc.k,w0=A.bond(S,b,a);
if(ev==='worse'&&(kind==='close'||kind==='friend')&&S.rng()<0.4)return null;
if(kind==='close'&&w0<0.1&&ev!=='death'&&ev!=='start')return null;
used.push(b.i);
var at=att(b),v={a:a.name,b:b.name},t=F(pk(S,RX[kind][ev]),v),acts=[b,a];
if(ev==='start'||ev==='worse'){
t+=F(pk(S,SAY[kind][at]),v);
if(kind==='obsess'&&S.rng()<0.5){
var doc=A.live(S).filter(function(q){return q!==a&&q!==b&&q.role==='doctor';})[0];
if(doc){t+=F(pk(S,RX.obsess.doc),{a:a.name,b:b.name,c:doc.name});acts.push(doc);A.setRel(S,b,doc,-0.15);bump(S,b,{anger:18});}
}
bump(S,b,{fear:kind==='obsess'?28:kind==='close'?10:18});
A.stress(b,kind==='obsess'?10:5);
}else if(ev==='left'){
t+=F(pk(S,LEFT_SAY[at]),v);
bump(S,b,{grief:kind==='close'?15:30,anger:kind==='obsess'?35:12});
A.stress(b,kind==='obsess'?14:8);
}else if(ev==='death'){
t+=F(pk(S,DEATH_SAY[at]),v);
bump(S,b,{grief:kind==='close'?25:45});
var w=A.closest(S,a)||b;
if(acts.indexOf(w)<0)acts.push(w);
t+=F(pk(S,CLOSE[att(w)]),{a:a.name,w:w.name});
if(w!==b)bump(S,w,{grief:20});
}else{
t+=F(pk(S,CURE_SAY[at]),v);
bump(S,b,{joy:kind==='close'?15:30});
A.stress(b,-6);
if(kind!=='obsess')A.setRel(S,b,a,0.05);
}
var tag=(kind==='obsess'?'執着：':'')+({start:'看病',worse:'看病',left:'別れの痛み',death:'弔い',cure:'回復'})[ev];
return ST.say(S,{actors:acts,tag:tag,text:t,why:b.name+'にとって'+a.name+'は'+KIND_JP[kind]+'（関係 '+Math.round(w0*100)+'）。'+a.name+'が'+EV_JP[ev]+'とき',mag:ev==='death'||kind==='obsess'?24:16});
};
var GONE= /連れ去|攫|神隠し|取り残|消えた|呑み込|呑まれ|行方|旅立|成り代わ|花嫁|連れて行か|閉じ込め|連れ帰|帰ってこな/;
var T={
wake:L('{a}が目を開けたとき、船の中は静まり返っていた。警報も、話し声も、足音も、何ひとつ聞こえなかった。|息を吹き返した{a}は、しばらく自分がどこにいるのか分からなかった。やがて、床に倒れたまま動かない仲間たちの姿が目に入った。|{a}は、冷たい床の上で目を覚ました。名前を呼んでも、返事をする者はもういなかった。――{n}は、誰ひとり起き上がらなかった。|{a}の心臓が、ひとりでに動き出した。けれど、この船でもう一度動き出した心臓は、{a}のものだけだった。'),
wakeNone:L('{a}が目を開けたとき、船の中にはほかに誰もいなかった。仲間たちは、この船を離れたまま戻っていなかった。|{a}は、ひとりきりの船の中で息を吹き返した。呼びかけに応える声は、どこからも返ってこなかった。'),
wakeBy:{
reactor:L('主炉は焼け落ち、船内は焦げた匂いで満ちていた。非常灯だけが、かろうじて生きていた。|機関室の壁は黒く焼け、計器はどれも針を振り切ったまま止まっていた。'),
virus:L('空調は、まだ灰色の胞子を運んでいた。けれど{a}の体は、もうそれを恐れる必要がなかった。|医務室の寝台は、最後の一つまで埋まっていた。病には、もううつる先がなかった。'),
hull:L('裂けた船体の半分は、もう星の海のどこかへ流れていった。{a}は、残った区画の隔壁を閉じて、空気をつなぎとめた。|真空の中で目を覚ました{a}は、這うようにして、気密の残る区画へ逃げ込んだ。'),
lifesup:L('空気はひどく薄かった。それでも{a}の胸は、苦しみながら息を続けた。|酸素の残りを示す数字は、ゼロのままだった。{a}は、動かない仲間たちの間を縫って、予備のボンベを探し回った。'),
ai:L('管理知能の声が、穏やかに告げた。「乗員の生存反応を一名確認。……想定外の事象です」|「おはようございます」――管理知能は、何事もなかったように{a}に挨拶した。{a}は、答えなかった。'),
swarm:L('通風管の中の音は、もう聞こえなかった。生き物たちは、船を食べ尽くして眠りについたのか、どこかへ去っていた。|船のあちこちに、生き物の脱ぎ捨てた殻が転がっていた。動くものは、{a}のほかに何もなかった。')
},
wake2:{
lover:L('{a}が目を開けると、すぐそばで{b}も息を吹き返していた。二人は言葉もなく、互いの手を探り当てた。|{a}と{b}は、同じ床の上で目を覚ました。残ったのは、二人だけだった。{b}は{a}の頬に触れて、それが温かいことを何度も確かめた。|先に目を覚ました{b}は、{a}の胸に耳を当てて、鼓動が戻るのを待った。{a}が目を開けたとき、{b}は声を上げて泣いた。'),
family:L('{a}と{b}は、同じ時に目を覚ました。家族が二人とも残ったことを、喜んでいいのか分からなかった。|{b}は、起き上がるなり{a}の名前を呼んだ。{a}の返事を聞いて、{b}はその場に崩れ落ちた。|{a}は、{b}の手を握った。子どもの頃から変わらない、少し冷たい手だった。'),
other:L('{a}と{b}は、静まり返った船の中で顔を見合わせた。死ねない体を持つ者だけが、ここに残された。|{b}は、起き上がった{a}を見て、乾いた笑い声を漏らした。{b}「……私たちだけ、か｜＝｜……私たちだけ、ですか」|{a}と{b}は、黙ってうなずき合った。何から始めればいいのか、二人とも分かっていた。仲間を、弔うことからだ。')
},
wakeMore:'{n}も、同じように起き上がった。',
mono:{
proud:L('{a}「……は。死ねないってのは、こういうことかよ」|{a}「全員いなくなって、俺だけ残るなんてな。笑えねえ冗談だ」|{a}「いいさ。この船は、最後まで俺が面倒を見てやる」|{a}「誰か、怒鳴り返してこいよ。……静かすぎるんだよ」'),
stern:L('{a}「記録を続ける。それが、残された者の務めだ」|{a}「私が死ねないのは、きっと、皆を覚えておくためだ」|{a}「規律は守る。たとえ、守らせる相手がいなくても」|{a}「……ひとりで食べる食事は、こんなに味がしないものか」'),
tsun:L('{a}「べつに、寂しくなんかないし。……ないってば」|{a}「なによ、みんなして先に行っちゃって。ずるいんだから」|{a}「誰も文句を言わないと、張り合いがないじゃない」|{a}「……ひとりで泣いても、誰にも見られないから、平気」'),
gentle:L('{a}「おはよう、みんな。……今日も、返事はないね」|{a}「みんなの分まで、ちゃんとご飯を食べるね」|{a}「さみしいけど、大丈夫。みんなのこと、全部覚えてるから」|{a}「いつか、みんなのことを誰かに話せる日が来るといいな」'),
devoted:L('{a}「守れなかった。私だけが、何度でも生き返るのに」|{a}「せめて、みんなの眠る場所だけは守らせて」|{a}「誰かのために動けないのが、こんなにつらいなんて」|{a}「私の命を、ひとつずつ分けてあげられたらよかったのに」'),
cool:L('{a}「生存者一名。……いや、生存と呼べるのかは分からないが」|{a}「死なない体の欠点がひとつ分かった。……話し相手がいなくなる」|{a}「この船は、あと数年はもつ。私の方は、それよりずっと長くもつ」|{a}「……感傷に浸る時間だけは、いくらでもあるな」'),
free:L('{a}「ねえ、誰か返事してよー。……してくれないか」|{a}「ひとりかくれんぼ、もう飽きちゃったな」|{a}「みんながいたら、今ごろ絶対うるさかったのに」|{a}「死ねないって、思ってたより退屈だね」'),
shy:L('{a}「……だれか……いないの……？」|{a}「……ひとりは、こわい……でも、もう、なれなきゃ……」|{a}「……みんなの声、わすれないように……まいにち、おもいだすね……」|{a}「……ごめんね……わたしだけ、のこって……」'),
polite:L('{a}「本日も、異常はございません。……ご報告する相手は、おりませんが」|{a}「皆さんの分まで、この船をお守りいたします」|{a}「……ひとりきりの食卓にも、そろそろ慣れなければなりませんね」|{a}「いつか、皆さんのご家族にお伝えできる日が来ますように」')
},
mourn:L('{a}は、{v}の体をきれいに整えて、毛布でくるんだ。{r}の制服の名札だけは、外さずにそのままにした。|{a}は、{v}を観測窓のそばに運んだ。{v}がいちばん好きだった場所だった。|{a}は、{v}をエアロックから星の海へ送り出した。小さな影は、ゆっくりと光の中へ遠ざかっていった。|{a}は、{v}の持ち場を片づけた。使いかけの道具も、書きかけのメモも、そのまま箱にしまった。|{a}は、船の壁に{v}の名前を刻んだ。一文字ずつ、時間をかけて。|{a}は、{v}の好きだった曲を船内に流しながら、{v}を送り出した。'),
mournLove:L('{a}は、{v}を抱きかかえて、二人でよく過ごした部屋へ運んだ。最後に、その額にそっと唇を寄せた。|{a}は、{v}の手を握ったまま、長い時間そこに座っていた。やがて、その指を一本ずつほどいた。|{a}は、{v}が首にかけていた小さな飾りを外して、自分の首にかけた。それから、{v}を星の海へ送り出した。'),
mournFam:L('{a}は、{v}の髪を、子どもの頃のように梳いてやった。それから、そっと毛布をかけた。|{a}は、{v}の名前の隣に、家族の印を刻んだ。|{a}は、{v}を送り出す前に、二人で覚えた古い歌を最後まで歌った。'),
mournRest:'{a}は、{n}のことも、ひとりずつ同じように送り出した。',
words:L('{a}は、{v}が最後に口にした言葉を思い出していた。――「{q}」|{v}の声が、まだ耳に残っていた。――「{q}」――{a}は、その言葉を日誌の最初のページに書き写した。|{a}は、{v}の最後の言葉を、小さく声に出してなぞった。――「{q}」'),
keep:L('{a}は、ひとりで船を見回った。止まった機械を一台ずつ確かめ、まだ動くものだけをつなぎ直した。|{a}は、何人がかりでやっていた修理を、ひとりで一週間かけてやり遂げた。|{a}は、使わなくなった区画の電源を落とし、残った動力を生命維持と救難信号に回した。|{a}は、決まった時間に起き、決まった時間に食事をとり、決まった時間に航海日誌をつけた。船の時計だけが、{a}の話し相手だった。|{a}は、船の外壁の修理に出た。命綱は付けなかった。落ちても、どうせ死ねないのだから。|{a}は、皆が育てていた鉢植えに水をやり続けた。枯らしたら、皆に叱られる気がした。'),
keep2:L('{a}と{b}は、二人きりで船の修理を分け合った。かつて{n}人でやっていた仕事は、果てしなく思えた。|{a}が配線をつなぎ、{b}が計器を読み上げた。二人の声だけが、広すぎる船の中に響いた。|{a}と{b}は、交代で見張りに立った。眠る必要のない時間が、長く続いた。'),
together:{
lover:L('{a}と{b}は、毎日、観測窓の前に並んで座った。死ねない二人には、時間だけはいくらでもあった。|{b}は、{a}の肩に頭を預けた。{b}「{a}がいてくれて、よかった｜＝｜{a}がいてくれて、よかったです」|{a}と{b}は、二人きりの食卓で、仲間たちの思い出話をした。話が尽きることはなかった。'),
family:L('{a}と{b}は、家族の昔話をしながら、仲間の名札を一つずつ磨いた。|{b}「家族がいれば、どこだって家だよ｜家族がいれば、どこだって家だ｜家族がいれば、どこだって家です」――{a}は、少しだけ笑った。|{a}は、眠れない{b}のそばに座って、子どもの頃のように手を握った。'),
other:L('{a}と{b}は、必要なことだけを話した。それでも、話す相手がいることに救われていた。|{a}と{b}は、交代で航海日誌をつけた。互いの書いた行を読むのが、日々のささやかな楽しみになった。|{b}「死なない者どうし、気長にいこう｜＝｜死なない者どうし、気長にいきましょう」{a}「……ほかに、やることもないしね｜……ほかに、やることもないしな｜……ほかに、やることもありませんしね」')
},
thirst:L('{a}の喉が、焼けるように渇きはじめた。船の中に、血の通う者はもう誰もいなかった。|{a}は、冷えた保存庫を何度も開けては閉めた。探しているものが、そこにないことは分かっていた。|{a}の瞳が赤く濁った。渇きは日ごとに強くなったが、満たす相手はどこにもいなかった。'),
weak:L('{a}の肌は灰のように白くなり、指先は震えて工具を握れなくなった。それでも、{a}の体は死ぬことを許さなかった。|{a}は、渇きでうずくまったまま何日も動けなかった。死ねない体は、ただ乾いていくだけだった。|{a}は、自分の腕に牙を立てかけて、やめた。自分の血では、渇きは癒えなかった。'),
pod:L('{a}は、使われなくなった眠りの箱に体を横たえた。渇きが自分を壊してしまう前に、眠ることにした。蓋が閉まる直前、{a}は仲間の名札をひとつ胸に抱いた。|{a}は、眠りの箱の設定を「期限なし」に合わせた。{a}「……誰かが来たら、起こして｜……誰かが来たら、起こしてくれ｜……誰かが来たら、起こしてください」――表示灯が、静かに青く灯った。|{a}は、救難信号の出力を最大にしてから、眠りの箱に入った。冷気が体を包むと、焼けるような渇きが、ゆっくりと遠のいていった。'),
podStay:L('眠りの箱の中で、{a}は静かに眠り続けていた。船は、主のいない操縦席を前にして、ただ星の海を漂っていた。|救難信号は、決まった間隔で闇に瞬き続けた。箱の中の{a}は、夢も見ずに眠っていた。|船内の灯りが、節電のためにひとつずつ消えていった。眠りの箱の青い灯りだけが、最後まで残った。'),
share:L('{a}の渇きに気づいた{b}は、黙って袖をまくった。{b}「私の血なら、いくら吸っても減らないから｜私の血なら、いくら吸っても減らない｜私の血なら、いくら吸っても減りませんから」|{b}は、{a}の前に腕を差し出した。{b}「遠慮しないで。どうせ、すぐに戻る体だ｜遠慮するな。どうせ、すぐに戻る体だ｜遠慮しないでください。どうせ、すぐに戻る体ですから」――{a}は礼を言って、そっと牙を立てた。|{a}は、{b}の手首からほんの少しだけ血を分けてもらった。死なない二人の、奇妙な助け合いだった。'),
find:L('{a}は、ひとりで星図を読み続けた。ある日、画面の端に、小さな青い点が灯った。{a}は、その星を「{x}」と名づけた。|{a}は、救難信号の反響の中に、星の重力の揺らぎを見つけた。{a}「……あった｜＝｜……ありました」――{a}は、その星に「{x}」と名前をつけた。|観測窓の向こうに、見覚えのない星が浮かんでいた。{a}は、仲間の誰かが好きそうな名前を考えて、「{x}」と書き込んだ。'),
land:L('{a}は、ひとりで船を{x}の大地に降ろした。ハッチを開けると、知らない風が吹き込んできた。{a}は仲間の名札をひとつずつ地面に並べて、その前に腰を下ろした。|着陸の衝撃が収まると、{a}は外へ出た。{x}の空は、思っていたよりも青かった。{a}「着いたよ、みんな｜みんな、着いたぞ｜皆さん、着きましたよ」――返事は、風の音だけだった。|{a}は、{x}の丘の上に船を据えた。仲間たちの名前を刻んだ船の壁が、丘のいちばん高いところから空を見上げていた。{a}は、ここで暮らすことに決めた。死ねない体には、急ぐ理由は何もなかった。'),
land2:L('{l}は、{x}の大地に船を降ろした。残った者たちは、仲間の名札を胸に抱いて、一歩ずつ外へ出た。|{x}の風が、{l}の頬を撫でた。{l}は丘の上に仲間の名前を刻んだ石を立てて、そのそばに小さな家を建てた。|{l}は、{x}で新しい暮らしを始めた。死ねない者たちの時間は長く、思い出を語り合う日々は尽きなかった。'),
landVamp:L('{a}は、{x}の夜を選んで船を降りた。日の光を避けて、岩陰に眠る場所を作った。渇きは消えなかったが、この星のどこかに血の通う何かがいることを、{a}は感じていた。|{a}は、ふらつく足で{x}の大地に立った。渇いた喉に、星の冷たい夜気がしみた。{a}「……ここで、待とう。誰かが来るまで｜＝｜……誰かが来るまで、ここで待ちましょう」'),
landPod:L('船は、眠る{l}を乗せたまま、決められた航路をたどって{x}の大地に降りた。眠りの箱の青い灯りは、星の夜の中でも静かに灯り続けていた。|管理知能が、眠る{l}の代わりに着陸を判断した。{x}の地表に降りた船の中で、{l}は目を覚まさないまま、星の朝を迎えた。'),
drift:L('{a}を乗せた船は、目的地のないまま星の海を漂い続けた。{a}は、毎朝仲間の名前を読み上げてから、一日を始めた。|{a}は、救難信号を送り続けた。いつか、誰かがこの船を見つける日まで。死ねない体には、待つことしかできなかった。|{a}は、航海日誌の新しいページを開いた。読む者はいなかったが、{a}は今日も一行を書き足した。船は、静かに闇の中を進み続けた。'),
drift2:L('{l}を乗せた船は、目的地のないまま漂い続けた。それでも、話し相手がいる限り、船の中はまだ暮らしの場所だった。|{l}は、交代で救難信号の前に座った。いつか誰かが応える日を、死ねない者たちは気長に待つことにした。|{l}は、仲間の名前を刻んだ壁の前で、毎月一度、小さな集まりを開いた。船は、静かに闇の中を進み続けた。'),
dormant:L('眠りの箱の中で、{l}は長い眠りについた。船は動力を落とし、救難信号だけを送り続けた。――それから、気の遠くなるほどの時が流れた。|船は、眠る{l}を乗せたまま、何十年も星の海を漂った。救難信号は弱まりながらも、一度も途切れなかった。|眠りの箱の霜は、年ごとに厚くなっていった。{l}は目を覚まさないまま、船とともに長い時を越えた。'),
rescue:L('百年あまりのち、通りかかった調査船が、漂う古い船を見つけた。眠りの箱の蓋を開けたとき、{a}はゆっくりと赤い目を開けた。{a}「……ずいぶん、待たせたね｜……ずいぶん、待たせたな｜……ずいぶん、お待たせしましたね」|何世代もあとの捜索隊が、星図にない漂流船に乗り込んだ。凍りついた船内で、ひとつだけ灯りのついた箱があった。目を覚ました{a}は、まず仲間の名前を尋ねられた。{a}は、ひとりずつ、全員の名前を答えた。|救難信号が誰かに届いたのは、ずっと、ずっと先のことだった。迎えに来た人々は、眠りから覚めた{a}が語る漂流の話を、遠い昔の物語のように聞いた。'),
log:L('{a}は、航海日誌の最後に、全員の名前を書き写した。{a}「この船の旅を、私は最後まで覚えている｜＝｜この船の旅を、私は最後まで覚えています」|{a}は、日誌を閉じる前に一行だけ書き足した。{a}「生き残ったんじゃない。置いていかれたんだ。……それでも、生きる｜生き残ったのではない。置いていかれたのだ。……それでも、生きる｜生き残ったんじゃありません。置いていかれたんです。……それでも、生きます」|{a}は、誰もいない食堂に向かって頭を下げた。{a}「ありがとう。みんなと過ごした時間は、私の中でずっと続いていく｜＝｜ありがとうございます。皆さんと過ごした時間は、私の中でずっと続いていきます」'),
log2:L('{a}と{b}は、航海日誌の最後のページに、二人で仲間の名前を書き写した。|{a}は、{b}の書いた行の下に、一行だけ書き足した。{a}「私たちは、全員のことを覚えている｜＝｜私たちは、全員のことを覚えています」'),
wall:L('船の壁には、{v}の名前が並んでいた。|{v}の名前は、日誌のいちばん最初のページに書き写されていた。'),
away:'{v}の行方は、最後まで分からなかった。救難信号には、今も{v}の名前が添えられている。',
endLand:L('漂流の記録は、{x}で閉じられた。その最後の行には、全員の名前が並んでいた。|{x}に、名前を刻んだ石がひとつ立った。そこには、{n}人分の名前が書かれていた。'),
endDrift:L('その船は、今も星の海のどこかを漂っている。死ねない者を乗せて。|全滅のあとの航海日誌は、今も一日一行ずつ、書き足され続けている。'),
endDormant:L('眠る船の記録は、長い時を経て、ようやく最後のページまで綴じられた。|漂流の一年は、ずっと先の誰かの手で、ようやく物語として語られることになった。')
};
function names(l){return X().names(l);}
SH.AFTER.wipe=function(S,m){
if(!S.wipeBy||S.after)return;
var im=S.P.filter(function(p){return p.spec&& !p.away&& !p.gone&& !p.spNoRev&& !p.spGone&& !GONE.test(p.fate||'');});
if(!im.length)return;
var by=S.wipeBy,tag=m+'か月目・'+by.name;
var dead=S.deaths.filter(function(p){return!p.spec&&String(p.fate||'').indexOf(tag)>=0;});
im.forEach(function(p){p.mad=null;});
S.after={at:m,by:by,n:2+S.rng.int(3),k:0,who:im.map(function(p){return p.i;}),dead:dead,mi:0,end:false};
};
function isLover(S,a,b){
var A=X();
return A.lover(S,a,b)&& !A.family(S,a,b);
}
function relOf(S,a,b){return isLover(S,a,b)?'lover':X().family(S,a,b)?'family':'other';}
function mournChunk(S,AF,L0,input){
var A=X(),rem=AF.dead.length-AF.mi;
if(rem<=0)return;
var cnt=Math.ceil(rem/Math.max(1,AF.n-AF.k)),ch=AF.dead.slice(AF.mi,AF.mi+cnt);
AF.mi+=cnt;
var up=L0.filter(function(p){return!p.pod;});
if(!up.length)return;
var t='',who=null;
ch.forEach(function(v,j){
var a=up.slice().sort(function(x,y){return A.bond(S,y,v)-A.bond(S,x,v);})[0];
if(!who)who=a;
if(j>=2)return;
var rel=relOf(S,a,v),pool=rel==='lover'?T.mournLove:rel==='family'?T.mournFam:T.mourn;
t+=F(pk(S,pool),{a:a.name,v:v.name,r:v.roleLabel||'船員'});
bump(S,a,{grief:rel==='other'?10:25});
if(j===0&&HK.Epilogue&&HK.Epilogue.storyWords){var q=HK.Epilogue.storyWords(S,v,input);if(q)t+=F(pk(S,T.words),{a:a.name,v:v.name,q:q});}
});
if(ch.length>2)t+=F(T.mournRest,{a:who.name,n:names(ch.slice(2))});
ST.say(S,{actors:[who].concat(ch),tag:'弔い',text:t,why:'全滅（'+AF.by.name+'）で亡くなった仲間を、一人ずつ弔う（残り '+(AF.dead.length-AF.mi)+'人）',mag:26});
}
SH.AFTER.month=function(S,m,input){
var AF=S.after,A=X();
if(!AF||AF.end|| !A)return false;
ST.step(S,m+'か月目');
if(SH.SPEC&&SH.SPEC.adapter&&HK.Special)HK.Special.revive(SH.SPEC.adapter(S));
var L0=A.live(S),sp=S.ship;
if(!L0.length){AF.end=true;AF.fail=true;return false;}
var a=L0[0],up=L0.filter(function(p){return!p.pod;}),solo=L0.length===1;
if(AF.k===0){
var t=F(pk(S,AF.dead.length?T.wake:T.wakeNone),{a:a.name,n:names(AF.dead)})+(T.wakeBy[AF.by.id]?F(pk(S,T.wakeBy[AF.by.id]),{a:a.name}):'');
if(!solo){var b=L0[1];t+=F(pk(S,T.wake2[relOf(S,a,b)]),{a:a.name,b:b.name});if(L0.length>2)t+=F(T.wakeMore,{n:names(L0.slice(2))});}
var o=ST.say(S,{actors:L0,tag:solo?'ひとりの船':'残された者たち',kind:'climax',text:t,why:AF.by.name+'で全滅した船の中で、死ねない体の'+names(L0)+'だけが蘇った',mag:40});
ST.key(S,o,'全滅のあと、'+names(L0)+'だけが目を覚ました');
L0.forEach(function(p){
var g=0;AF.dead.forEach(function(v){g=Math.max(g,A.bond(S,p,v));});
bump(S,p,{grief:40+Math.max(0,g)*40,fear:15});
A.stress(p,15);
});
if(solo)ST.say(S,{actors:[a],tag:'ひとりごと',text:F(pk(S,T.mono[att(a)]),{a:a.name}),why:'全滅のあと、'+a.name+'の胸のうち',mag:18});
mournChunk(S,AF,L0,input);
}else{
mournChunk(S,AF,L0,input);
if(up.length===1)ST.say(S,{actors:up,tag:'ひとりの船',text:F(pk(S,T.keep),{a:up[0].name}),why:'ひとりで船を動かし続ける（船体・動力を保った）',mag:16});
else if(up.length>=2)ST.say(S,{actors:up,tag:'共同作業',text:F(pk(S,T.keep2),{a:up[0].name,b:up[1].name,n:S.P.length}),why:'残った者で船を保つ',mag:16});
if(up.length){sp.hull=clamp(sp.hull+4,0,100);sp.power=clamp(sp.power+2,0,100);}
L0.forEach(function(p){
if(p.spec!=='vampire'||p.pod)return;
var dn=L0.filter(function(q){return q!==p&&q.spec!=='vampire'&& !q.pod;})[0];
if(dn){
if(AF.k%2===0)return;
if(p.vamp)p.vamp.fed++;
ST.say(S,{actors:[p,dn],tag:'吸血',text:F(pk(S,T.share),{a:p.name,b:dn.name}),why:'吸血鬼の渇き。死なない体の'+dn.name+'が、血を分けた',mag:20});
return;
}
var tx='';
if(!p.thirst){p.thirst=1;p.m.hp=Math.max(5,p.m.hp-35);tx=F(pk(S,T.thirst),{a:p.name})+F(pk(S,T.weak),{a:p.name});}
if(AF.k>=2||AF.k>=AF.n-1){p.pod=true;tx+=F(pk(S,T.pod),{a:p.name});}
if(tx){
var o2=ST.say(S,{actors:[p],tag:p.pod?'眠りの箱':'渇き',kind:p.pod?'climax':'event',text:tx,why:'吸血鬼：船の中に血の通う者がいない。弱っていくが、死ぬことはない'+(p.pod?'。渇きに壊される前に、眠りの箱で眠ることにした':''),mag:p.pod?32:22});
if(p.pod)ST.key(S,o2,p.name+'は眠りの箱に入った');
bump(S,p,{fear:20});
}
});
up=L0.filter(function(p){return!p.pod;});
var slept=L0.filter(function(p){return p.pod&&p.podK!=null&&p.podK<AF.k;});
if(!up.length&&slept.length===L0.length)ST.say(S,{actors:slept,tag:'眠る船',kind:'phase',text:F(pk(S,T.podStay),{a:names(slept)}),why:''});
L0.forEach(function(p){if(p.pod&&p.podK==null)p.podK=AF.k;});
if(up.length===1&&S.rng()<0.7)ST.say(S,{actors:up,tag:'ひとりごと',text:F(pk(S,T.mono[att(up[0])]),{a:up[0].name}),why:'',mag:14});
if(up.length>=2){
var x=up[0],y=up[1];
ST.say(S,{actors:[x,y],tag:'絆',text:F(pk(S,T.together[relOf(S,x,y)]),{a:x.name,b:y.name}),why:'全滅のあとも、二人で支え合う',mag:16});
bump(S,x,{joy:8});bump(S,y,{joy:8});
}
if(!S.planet&&up.length&&AF.k<AF.n-1&&A.makePlanet&&S.rng()<0.03+S.env.find/100*0.3){
var fd=up[0],Pn=S.planet=A.makePlanet(S,fd);Pn.at=m;
var o3=ST.say(S,{actors:[fd],tag:'星を発見',kind:'climax',text:F(pk(S,T.find),{a:fd.name,x:Pn.name}),why:'全滅のあと、'+fd.name+'がひとりで星図を読み続けた',mag:36});
ST.key(S,o3,Pn.name+'を見つけた');
AF.n=AF.k+2;
}
}
sp.food=clamp(sp.food-1,0,100);sp.o2=clamp(sp.o2-1,0,100);
AF.k++;
if(AF.k>=AF.n)AF.end=true;
return true;
};
SH.AFTER.epilogue=function(S){
var AF=S.after,A=X();
if(!AF||AF.fail|| !A)return false;
var L0=A.live(S);
if(!L0.length)return false;
var Pn=S.planet,a=L0[0],solo=L0.length===1,l=names(L0),pod=L0.every(function(p){return p.pod;});
var how=AF.how=Pn?'land':pod?'dormant':'drift';
var v={a:a.name,l:l,x:Pn?Pn.name:'',n:S.P.length};
S.weakEnd=false;
ST.step(S,how==='land'?Pn.name+'に降り立つ':how==='dormant'?'眠る船':'全滅のあとの船');
var pool=how==='land'?(pod?T.landPod:solo?(a.spec==='vampire'?T.landVamp:T.land):T.land2):how==='dormant'?T.dormant:solo?T.drift:T.drift2;
var t=F(pk(S,pool),v)+(how==='dormant'?F(pk(S,T.rescue),{a:a.name}):'');
var o=ST.say(S,{actors:L0,kind:'climax',tag:how==='land'?'結末：着陸':how==='dormant'?'結末：眠り':'結末：漂流',text:t,why:'全滅（'+AF.by.name+'）のあと、'+AF.k+'か月を'+(solo?'ひとりで':'残った者で')+'過ごした'+(how==='land'?'。星に辿り着いた':how==='dormant'?'。血の通う者のいない船で、眠りについた':'。星は見つからなかった'),mag:40});
ST.key(S,o,how==='land'?l+'が'+Pn.name+'に降り立った':how==='dormant'?l+'は長い眠りの果てに迎えられた':l+'は船とともに漂い続けた');
var out=[],dead=S.deaths.slice();
if(dead.length)out.push(F(pk(S,T.wall),{v:names(dead)}));
var aw=S.P.filter(function(p){return p.alive&&p.away;});
if(aw.length)out.push(F(T.away,{v:names(aw)}));
var up=L0.filter(function(p){return!p.pod;});
if(up.length===1)out.push(F(pk(S,T.log),{a:up[0].name}));
else if(up.length>=2)out.push(F(pk(S,T.log2),{a:up[0].name,b:up[1].name}));
var fin=S.endLine=F(pk(S,how==='land'?T.endLand:how==='dormant'?T.endDormant:T.endDrift),v);
ST.say(S,{actors:L0,tag:'結末',kind:'phase',text:out.join('')+fin,why:'全滅のあとの締めくくり'});
var whoW=solo?'ひとりで':L0.length===2?'ふたりで':L0.length+'人で';
L0.forEach(function(p){
p.fate=how==='land'?'生存（全滅のあと、'+whoW+Pn.name+'に降り立った）':how==='dormant'?'生存（全滅のあと、眠りの箱で長い時を越えた）':'生存（全滅のあとも、'+whoW+'船を守り続けた）';
p.fateNote=AF.at+'か月目の全滅（'+AF.by.name+'）のあと、'+AF.k+'か月を'+(solo?'ひとりで':'残った者で')+'過ごした'+(p.pod?'。渇きに耐えかねて、眠りの箱で眠った':'');
p.notes.push('全滅のあと：'+p.fateNote);
});
AF.title='全滅のあとに ― '+(how==='land'?l+'だけが'+Pn.name+'に辿り着いた':how==='dormant'?l+'は眠りの中で、ずっと先の迎えを待った':l+'だけが残った');
return true;
};
})();
});
;
/* ==== js/yakata-frame.js ==== */
HK.Load.def(230,'js/yakata-frame.js',function(){
(function(){
'use strict';
var HK=window.HK,ST=HK.Story,Y=HK.YAKATA;
if(!ST|| !Y|| !Y.showdown)return;
var clamp=HK.clamp;
function L(s){return s.split('|');}
function pk(S,a){return ST.pick(S,a);}
function F(t,m){return ST.fmt(t,m);}
var FR=Y.FRAME_T={
point:L('{d}は、ゆっくりと{b}の前に立った。「決め手は、{e}。――{b}さん、あなたしかいない｜決め手は、{e}だ。――{b}さん、あなたしかいない｜決め手は、{e}です。――{b}さん、あなたしかいません」|{d}は手帳を閉じた。「{e}。これで、全部説明がつく。犯人は、{b}さんだ｜{e}。これで、すべて説明がつく。犯人は、{b}さんだ｜{e}。これで、すべて説明がつく。犯人は、{b}さんです」|{d}の視線が、{b}の上で止まった。「{e}。偶然とは言わせない｜＝｜{e}。偶然とは言わせません」'),
cul_cold:L('{c}は、うつむいたまま、口元だけで小さく笑った。|{c}は、誰よりも早く「信じられない｜＝｜信じられません」と声を上げた。目は、少しも驚いていなかった。|{c}は、静かに{b}から目を逸らした。その横顔には、何の色も浮かんでいなかった。'),
cul_guilt:L('{c}の指先が、かすかに震えていた。誰も、それに気づかなかった。|{c}は、{b}の顔を見ることができなかった。|{c}は唇を噛んで、床の一点を見つめていた。'),
first:{
CP:L('{b}「ふざけるな。何の根拠があって、そんなことを」|{b}「……は？　私が？　冗談も大概にしろ」|{b}「今の言葉、取り消して」'),
NP:L('{b}「そんな……私、誰かを傷つけるなんて、そんなこと……」|{b}「待って、お願い、話を聞いて……」|{b}「どうして……みんなのこと、守りたかっただけなのに」'),
A:L('{b}「……なるほど。その証拠、少し見せてもらえるか」|{b}「推理としては筋が通っている。――前提が正しければ、の話だが」|{b}「落ち着いて考えよう。その証拠は、いつ、誰が見つけたの？」'),
FC:L('{b}「はあ!?　ちょっ、待って待って、違うって！」|{b}「えっ、え、私!?　うそでしょ!?」|{b}「冗談だよね？　ねえ、冗談なんでしょ!?」'),
AC:L('{b}「……っ、ち、違う……私、私じゃ……」|{b}「……」――{b}は、声が出なかった。|{b}「ご、ごめんなさい……でも、本当に、私じゃない……」')
},
rebut_ok:L('{b}「その{k}は、私の部屋にあった。でも、私があの部屋を出たのは夕食のあとなんだ。――時間が合わない。誰かが、あとから置いたんだ｜その{k}は、私の部屋にあった。だが、私があの部屋を出たのは夕食のあとだ。――時間が合わない。誰かが、あとから置いたんだ｜その{k}は、私の部屋にありました。ですが、私があの部屋を出たのは夕食のあとです。――時間が合いません。誰かが、あとから置いたんです」|{b}「私が見つけた手がかりと、矛盾する。現場の痕跡は、私の背丈では残せない｜＝｜私が見つけた手がかりと、矛盾します。現場の痕跡は、私の背丈では残せません」|{b}「その証言をしたのは誰？　――{c}さん、あなただったよね。どうして、わざわざ私の名前を出したの？｜その証言をしたのは誰だ？　――{c}さん、あなただったな。どうして、わざわざ私の名前を出した？｜その証言をしたのは誰ですか？　――{c}さん、あなたでしたね。どうして、わざわざ私の名前を出したんですか？」'),
rebut_turn:L('{d}は、黙って手帳をめくり直した。長い沈黙のあと、{d}は顔を上げた。「……ごめん。間違えていたのは、私の方だった｜……すまない。間違えていたのは、私の方だ｜……すみません。間違えていたのは、私の方です」|{d}の目が、ゆっくりと{c}の方へ動いた。「――そうか。この証拠は、置かれたものだったのか｜＝｜――そうでしたか。この証拠は、置かれたものだったんですね」|{d}は額を押さえた。「仕組まれていた。私は、犯人の思うとおりに推理させられていた｜＝｜仕組まれていました。私は、犯人の思うとおりに推理させられていたんです」'),
rebut_ng:L('{b}は必死に食い下がった。けれど、{d}の目に浮かんでいたのは、哀れみだけだった。|{b}の言葉は、もっともらしい言い逃れにしか聞こえなかった。誰も、{b}の側に立たなかった。|{b}「だから、違うって言ってる……！｜だから、違うと言っている……！｜だから、違うと言っています……！」――その声は、誰にも届かなかった。'),
shield:L('{b}は、{c}の方を一度だけ見た。――気づいてしまった。それから{b}は、黙って両手を差し出した。「……私がやった。それで、いい｜＝｜……私がやりました。それで、いいんです」|{b}の顔から、血の気が引いた。{b}だけが、偽の証拠を誰が置いたのか分かっていた。{b}「……そう、だよ。私が、やった｜……そう、だ。私が、やった｜……そう、です。私が、やりました」|{b}は目を閉じた。{b}「……これで、いい。{c}、あなたは、生きて｜……これで、いい。{c}、あなたは、生きろ｜……これで、いいんです。{c}、あなたは、生きてください」――その言葉の意味が分かったのは、{c}だけだった。'),
betray:L('{b}は、{c}を見た。{b}「……あなたなのね。私に罪を着せたのは｜……私に罪を着せたのは、あなただったのか｜……私に罪を着せたのは、あなただったんですね」――{c}は、何も答えなかった。|{b}「どうして……{c}、どうしてなんだ。信じてたのに｜どうして……{c}、どうしてなんだ。信じていたのに｜どうして……{c}、どうしてなんですか。信じていたんです」|{b}の声が震えた。{b}「あれを用意できたのは、{c}だけだ。――あなたが、やったんだね｜あれを用意できたのは、{c}だけだ。――あなたが、やったんだな｜あれを用意できたのは、{c}だけです。――あなたが、やったんですね」'),
betray_ok:L('{b}の言葉に、皆の視線が{c}へ集まった。{d}は、もう一度最初から証拠を並べ直した。|{c}の顔から、表情が消えた。それが、何よりの答えだった。'),
betray_ng:L('しかし、{c}は悲しげに首を振っただけだった。「……追い詰められて、人のせいにするのね｜……追い詰められて、人のせいにするのか｜……追い詰められて、人のせいにするんですね」――皆は、{c}の言葉を信じた。|{b}の叫びは、罪を逃れるための言いがかりだと受け取られた。'),
rage:L('{b}は{d}の胸ぐらを掴んだ。{b}「ふざけるな……！　あなたの推理ごっこで、人の人生を決めるな！｜＝｜ふざけないでください……！　あなたの推理ごっこで、人の人生を決めないでください！」――周りの者たちが、慌てて{b}を引き剥がした。|{b}はテーブルを蹴り倒した。{b}「いいよ、閉じ込めたければ閉じ込めれば。――でも、次に誰かが死んだら、それはあなたのせいだ｜いいだろう、閉じ込めたければ閉じ込めろ。――だが、次に誰かが死んだら、それはあなたのせいだ｜いいでしょう、閉じ込めたければ閉じ込めてください。――ですが、次に誰かが死んだら、それはあなたのせいです」|{b}は{d}に殴りかかった。拳は{d}の頬をかすめ、{b}は床に押さえつけられた。'),
despair:L('{b}は、その場に崩れ落ちた。言い返す言葉も、もう出てこなかった。|{b}は顔を覆って泣き出した。{b}「……どうして、誰も信じてくれないの……｜……どうして、誰も信じてくれないんだ……｜……どうして、誰も信じてくれないんですか……」|{b}は、ただ首を横に振り続けた。誰かが肩に手を置くと、{b}は小さく謝った。何に謝っているのか、自分でも分からなかった。'),
flee:L('{b}は、誰かが止める前に玄関へ走った。扉が開き、吹雪が吹き込んだ。{b}の姿は、白い闇の中へ消えた。|{b}「閉じ込められるくらいなら……！」――{b}は窓を破り、吹雪の中へ飛び出していった。'),
flee_back:L('明け方、{b}は館の裏手で、雪に埋もれかけているところを見つかった。息は、かろうじてあった。|――{b}が戻ることは、なかった。'),
calm:L('{b}は長く息を吐いた。{b}「……分かった。閉じ込めればいい。ただ、犯人は、まだこの中にいる。それだけは確かだ｜＝｜……分かりました。閉じ込めてください。ただ、犯人は、まだこの中にいます。それだけは確かです」|{b}は抵抗しなかった。{b}「次に誰かが死んだら、それが私の無実の証明だ。……そうならないことを、祈ってる｜次に誰かが死んだら、それが私の無実の証明だ。……そうならないことを、祈っている｜次に誰かが死んだら、それが私の無実の証明です。……そうならないことを、祈っています」|{b}は自分から納屋へ歩いていった。振り返りもせずに、{b}は言った。{b}「――気をつけて。本当の犯人は、きっと笑っている｜――気をつけろ。本当の犯人は、きっと笑っている｜――気をつけてください。本当の犯人は、きっと笑っています」'),
defend:L('{a}「待って！　{b}が、そんなことするはずない！｜待て！　{b}が、そんなことをするはずがない！｜待ってください！　{b}が、そんなことをするはずありません！」|{a}は{b}の前に立ちはだかった。{a}「{b}を連れて行くなら、私を倒してからにして｜{b}を連れて行くなら、私を倒してからにしろ｜{b}を連れて行くなら、私を倒してからにしてください」|{a}「私は{b}を知ってる。……人を殺せるような人じゃない｜私は{b}を知っている。……人を殺せるような人間ではない｜私は{b}を知っています。……人を殺せるような人じゃありません」'),
defend_clue:L('{a}は、自分の手帳を開いた。{a}「私が見つけたことと、合わない。――あの時間、{b}は私と一緒にいたんだ｜＝｜私が見つけたことと、合いません。――あの時間、{b}は私と一緒にいたんです」|{a}「その証拠、私が最初に調べたときには、そこになかった｜その証拠は、私が最初に調べたときには、そこになかった｜その証拠は、私が最初に調べたときには、そこにありませんでした」'),
lock:L('{b}は、納屋に閉じ込められた。|{b}は手首を縛られ、使われていない客間に閉じ込められた。扉の外から、鍵のかかる音がした。|{b}は、地下の物置に移された。暗闇の中で、{b}はずっと膝を抱えていた。')
};
function cand(S,d){
var c=S.cul,al=Y.alive;
var ok=function(q){return q&&al(q)&& !q.bound&&q!==d&&q!==c&& !q.isAcc&& !q.isDet;};
var fk=S.pool.filter(function(x){return x.fake&&x.found&&ok(x.b);})[0];
if(fk)return{b:fk.b,e:fk.t,how:'偽の証拠'};
if(ok(S.framed)&&S.framed.m.sus>=c.m.sus-20)return{b:S.framed,e:'昨夜の'+S.framed.name+'の不審な動きと、その部屋の前に落ちていた'+S.v1.name+'の持ち物',how:'偽の証言と工作'};
return null;
}
var RATE=0.58;
Y.frameTry=function(S,d,partial){
var c=S.cul;
if(!c||S.mot.nobody||S.frameDone)return false;
var x=cand(S,d);
if(!x)return false;
var p=RATE*(1.15-Y.skill(d,'obs')*0.35)*(d.role==='ponkotsu'?1.3:1)*(d.seduced?1.3:1);
if(S.rng()>p)return false;
S.frameDone=true;
frameShow(S,d,x,partial);
return true;
};
function rebut(S,x){var a=FR.rebut_ok;return x.how==='偽の証拠'?pk(S,a.slice(0,2)):a[2];}
function frameShow(S,d,x,partial){
var rng=S.rng,c=S.cul,b=x.b,al=Y.alive;
var m={d:d.name,b:b.name,c:c.name,v:S.v1.name,e:x.e.replace(/。$/,''),k:x.how==='偽の証拠'?'証拠':'証言'};
ST.step(S,'推理');
var t=F(pk(S,Y.T.SHOW),{d:d.name})+F(pk(S,FR.point),m);
t+=F(pk(S,c.tr.cold+c.tr.a*0.3>0.75||c.tr.np<0.35?FR.cul_cold:FR.cul_guilt),m);
var o=ST.say(S,{actors:[d,b],tag:'推理',kind:'climax',text:t,why:d.name+'は、'+c.name+'のなすりつけ（'+x.how+'）に引っかかった。本当の犯人は'+c.name+'（'+d.name+'の観察力 '+Math.round(Y.skill(d,'obs')*100)+'）',mag:48});
ST.key(S,o,d.name+'が'+b.name+'を犯人と名指しした');
var top=HK.egoType?HK.egoType(b.eg).top:(b.top||'A'),info=(b.cnt.clue||0)+(b.approached?2:0),rc=Y.cat(S,b,c),bc=Y.bond(S,b,c);
var knows=info>=1&&rng()<0.35+Y.skill(b,'obs')*0.4+info*0.12;
function FI(k){return F(pk(S,FR.first[k]||FR.first.A),m);}
var react,why,reverse=false;
var df=S.P.filter(function(q){return al(q)&& !q.bound&&q!==b&&q!==c&&q!==d&&(Y.cat(S,q,b)==='love'||Y.cat(S,q,b)==='family'||Y.bond(S,q,b)>=0.6);})
.sort(function(p,q){return Y.bond(S,q,b)-Y.bond(S,p,b);})[0];
var dfText='',dfPush=0;
if(df&&rng()<0.55+df.tr.np*0.3){
dfText=F(pk(S,FR.defend),{a:df.name,b:b.name});
if((df.cnt.clue||0)>0&&rng()<0.5){dfText+=F(pk(S,FR.defend_clue),{a:df.name,b:b.name});dfPush=0.2;}
Y.setRel(S,df,b,0.2,'信じ抜いた',df);
}
var ponk=d.role==='ponkotsu'?0.1:0;
if(knows&&(rc==='love'||rc==='family'||bc>=0.6)&&b.tr.np+b.tr.ac>1.0&&rng()<0.65){
react=FI(top==='CP'?'A':top==='FC'?'NP':top)+F(pk(S,FR.shield),m);why=b.name+'は真犯人が'+c.name+'だと気づいたが、'+(Y.relLabel(S,b,c)||'大切な相手')+'をかばって罪をかぶった（NP・AC）';
b.fate=c.name+'をかばって、濡れ衣を受け入れた';Y.setRel(S,b,c,0.3,'かばった',b);
}else if(knows&&rng()<0.75){
var close=rc==='love'||rc==='family'||bc>=0.5;
var pOk=0.3+Y.skill(b,'obs')*0.25+info*0.06+dfPush+ponk+(close?0.1:0)-(c.tr.lie||c.tr.a*0.5)*0.25;
reverse=rng()<pOk;
react=FI(top==='CP'||top==='FC'?top:'A')+(close?F(pk(S,FR.betray),m):F(rebut(S,x),m))+dfText+F(pk(S,reverse?(close?FR.betray_ok:FR.rebut_turn):(close?FR.betray_ng:FR.rebut_ng)),m);
why=b.name+'は'+(info>=2?'多くの手がかりを掴んでいた':'手がかりを掴んでいた')+'（'+info+'）。'+(close?(Y.relLabel(S,b,c)||'親しい')+'はずの'+c.name+'の裏切りに気づいた':'偽の証拠の矛盾を突いた')+(reverse?'。推理がひっくり返った':'。だが、届かなかった');
Y.setRel(S,b,c,close? -0.9: -0.4,close?'裏切り':'罪を着せた',b);
}else if(top==='A'||(b.tr.a>0.6&&rng()<0.5)){
reverse=info>=1&&rng()<0.15+dfPush+ponk;
react=FI('A')+(reverse?F(rebut(S,x),m)+dfText+F(pk(S,FR.rebut_turn),m):dfText+F(pk(S,FR.calm),m));
why=b.name+'は冷静だった（A）'+(reverse?'。偽の証拠の矛盾を突き、推理をひっくり返した':'。手がかりが足りず、受け入れるしかなかった');
}else if(top==='CP'||(b.tr.aggr>0.6&&rng()<0.6)){
react=FI('CP')+F(pk(S,FR.rage),m)+dfText;why=b.name+'は激昂した（CP・攻撃性）';
Y.setRel(S,b,d,-0.6,'濡れ衣',b);
reverse=dfPush>0&&rng()<0.3;
if(reverse)react+=F(pk(S,FR.rebut_turn),m);
}else if((top==='FC'||b.tr.impulse>0.65)&&rng()<0.5){
var dead=rng()<0.4;
react=FI('FC')+dfText+F(pk(S,FR.flee),m)+F(FR.flee_back[dead?1:0],m);
why=b.name+'は衝動的に逃げ出した（FC・衝動）';
if(dead){b.alive=false;b.fate='濡れ衣を着せられ、吹雪の中に消えた';}
}else{
react=FI(top==='NP'?'NP':'AC')+dfText+F(pk(S,FR.despair),m);why=b.name+(top==='NP'?'は取り乱し、言い返せなかった（NP）':'は言い返せなかった（AC）');
}
ST.say(S,{actors:[b,d].concat(df&&dfText?[df]:[]),tag:'濡れ衣',kind:'climax',text:react,why:why,mag:44});
if(reverse){
b.m.sus=5;S.noStep=true;
return Y.showdown(S,d,false,partial);
}
if(al(b)){
b.bound=true;if(!b.fate)b.fate='濡れ衣を着せられた';
if(b.fate==='濡れ衣を着せられた'|| /かばって/.test(b.fate))ST.say(S,{actors:[b],tag:'拘束',text:F(pk(S,FR.lock),m),why:'真犯人の'+c.name+'は、まだ自由に動ける'});
if(/かばって/.test(b.fate))b.fateKeep=true;
}
c.m.sus=Math.max(0,c.m.sus-20);
S.wrongOnce=(S.wrongOnce||0)+1;
if(S.wrongOnce>=2||S.env.days<=2)S.over='wrong';
}
})();
});
;
/* ==== js/yakata-feud.js ==== */
HK.Load.def(231,'js/yakata-feud.js',function(){
(function(){
'use strict';
var HK=window.HK,ST=HK.Story,Y=HK.YAKATA,FD=HK.Feud,clamp=HK.clamp;
if(!ST|| !Y|| !FD|| !Y.gain)return;
var TL=HK.TL;
function alive(p){return p.alive&& !p.gone;}
function free(S){return S.P.filter(function(p){return alive(p)&& !p.bound;});}
function pk(S,l){return ST.pick(S,l);}
function rel(S,a,b,lab,cls){if(Y.setRel)Y.setRel(S,a,b,cls==='enemy'? -0.1:0.05,lab,a);}
function pairs(live,test){
var out=[];
live.forEach(function(a){live.forEach(function(b){if(a!==b&&test(a,b))out.push([a,b]);});});
return out;
}
Y.FEUD={
arrive:function(S){
var sls=S.P.filter(function(p){return p.isDet&&p.role==='detective';}),pks=S.P.filter(function(p){return p.isDet&&p.role==='ponkotsu';}),done={};
pks.forEach(function(p){
var sl=sls.slice().sort(function(a,b){return FD.ties(S,b,p).length-FD.ties(S,a,p).length;})[0];
if(!sl)return;
done[sl.i+'-'+p.i]=1;
ST.say(S,{actors:[sl,p],tag:'名探偵とポンコツ探偵',text:FD.duoText(S,sl,p).text,why:sl.name+'（名探偵）と'+p.name+'（ポンコツ探偵）の関係：'+FD.label(S,sl,p),mag:12});
});
sls.forEach(function(a){
sls.forEach(function(b){
if(a.i>=b.i||done[a.i+'-'+b.i]|| !FD.ties(S,a,b).length)return;
ST.say(S,{actors:[a,b],tag:'名探偵どうし',text:FD.duoText(S,a,b).text,why:'名探偵が二人。関係：'+FD.label(S,a,b),mag:12});
});
});
},
tick:function(S,day){
var live=free(S);
if(live.length<2)return;
obTick(S,live)||hkTick(S,live,day)||snatch(S,live)||detFight(S,live)||lhClash(S,live,day)||hateMove(S,live,day);
},
guard:function(S,tgt,c){
var rng=S.rng,g=free(S).filter(function(q){return q!==tgt&&q!==c&&FD.lhFrom(S,q,tgt);})[0];
if(!g||rng()>0.6)return false;
var t='深夜、'+tgt.name+'の部屋に何者かが忍び込んだ。――廊下で張っていた'+g.name+'が、その影に飛びかかった。'+TL.line(g,'LH_GUARD',tgt);
rel(S,g,tgt,'守った','obsess');
c.m.sus=clamp(c.m.sus+20,0,100);
if(rng()<HK.Dark.live(S,0.6+Y.skill(g,'fight')*0.3,'kill')){
var hint=Y.gain(S,g,'obs');
ST.key(S,ST.say(S,{actors:[g,tgt],tag:'愛憎',kind:'climax',text:t+'揉み合いの末、影は窓から吹雪の中へ逃げていった。'+g.name+'は、'+tgt.name+'の無事を確かめると、何も言わずに部屋を出ていった。'+(hint?'――'+hint+'。':''),why:'愛憎（'+FD.label(S,g,tgt)+'）。憎んでいても、誰かに奪われるのは許せない――犯行を防いだ（犯人への疑い +20）',mag:36}),g.name+'が'+tgt.name+'を守った');
return true;
}
g.alive=false;g.fate=tgt.name+'を守って殺された（'+S.curDay+'日目の夜）';
ST.key(S,ST.say(S,{actors:[g,tgt],tag:'愛憎',kind:'climax',text:t+'刃は、'+g.name+'の胸に深々と刺さった。影は逃げ、'+g.name+'は'+tgt.name+'の部屋の前に崩れ落ちた。最後まで、'+tgt.name+'の名前は呼ばなかった。',why:'愛憎（'+FD.label(S,g,tgt)+'）。身代わりになった',mag:44}),g.name+'が'+tgt.name+'の身代わりに');
return true;
}
};
function obTick(S,live){
var r=HK.Obsess&&HK.Obsess.storyTick?HK.Obsess.storyTick(S,live,{rate:0.2}):null;
if(!r)return false;
ST.say(S,{actors:r.actors,tag:r.tag,kind:r.kind,text:r.text,why:r.why,mag:r.mag});
rel(S,r.actors[0],r.actors[1],r.tag,'obsess');
return true;
}
function hkTick(S,live,day){
if(!HK.HateKit)return false;
var r=HK.HateKit.storyTick(S,live,{rate:0.22,lhSkip:function(a,b){return FD.lhLast(S,a,b)===day;}});
if(!r)return false;
if(r.lh)FD.lhMark(S,r.actors[0],r.actors[1],day);
ST.say(S,{actors:r.actors,tag:r.cat==='romance'?'片恋と嫌悪':'敵視',text:r.text,why:r.why,mag:r.mag});
rel(S,r.actors[0],r.actors[1],'敵視','enemy');
return true;
}
function snatch(S,live){
var rng=S.rng,ps=pairs(live,function(a,b){return(a.isDet||b.isDet)&&FD.rival(S,a,b);});
if(!ps.length||rng()>0.18)return false;
var pr=rng.pick(ps),a=pr[0],b=pr[1];
var t=b.name+'が暖炉の灰をかき分けて何かをつまみ上げた瞬間、'+a.name+'がその手から、それをかすめ取った。'+TL.line(a,'CLUE_SNATCH',b);
rel(S,a,b,'出し抜いた','enemy');
if(rng()<0.25){
ST.say(S,{actors:[a,b],tag:'奪い合い',text:t+b.name+'は黙って、それを取り返そうと手を伸ばした。奪い合ううちに、それは暖炉の火の中へ落ちた。燃え残りから読み取れることは、もう何もなかった。',why:a.name+'と'+b.name+'（'+FD.label(S,a,b)+'）の手がかりの奪い合い――台無しになった',mag:22});
return true;
}
var g=Y.gain(S,a,'search');
t+=TL.line(b,'CLUE_SNATCH_BACK',a);
ST.say(S,{actors:[a,b],tag:'奪い合い',text:t+(g?'――'+g+'。':''),why:a.name+'と'+b.name+'（'+FD.label(S,a,b)+'）は張り合って、手がかりを奪い合う'+(g?'（手がかり +1）':''),mag:20});
return true;
}
function detFight(S,live){
var rng=S.rng,ps=pairs(live,function(a,b){return a.role==='detective'&&b.role==='detective'&&a.i<b.i&&(FD.level(S,a,b)>=65||FD.level(S,b,a)>=65||(FD.level(S,a,b)>=35&&FD.level(S,b,a)>=35))&& !FD.lovehate(S,a,b);});
if(!ps.length||rng()>0.15||S.detFought)return false;
S.detFought=true;
var a=ps[0][0].tr.aggr>=ps[0][1].tr.aggr?ps[0][0]:ps[0][1],b=a===ps[0][0]?ps[0][1]:ps[0][0];
a.m.sus=clamp(a.m.sus+10,0,100);b.m.sus=clamp(b.m.sus+10,0,100);
rel(S,a,b,'衝突','enemy');
ST.say(S,{actors:[a,b],tag:'名探偵どうし',kind:'climax',text:'食堂での推理の披露は、二人の名探偵の怒鳴り合いになった。'+TL.line(a,'DET_FIGHT',b)+a.name+'は'+b.name+'の胸ぐらを掴んだ。テーブルの皿が床に落ちて割れた。――一行は、どちらの推理を信じればいいのか、分からなくなった。',why:'敵対している名探偵どうし。推理の主導権をめぐってぶつかった（二人への疑い +10）',mag:30});
return true;
}
function lhClash(S,live,day){
var rng=S.rng,ps=pairs(live,function(a,b){return FD.lhFrom(S,a,b)&&a.lhDay!==day&&FD.lhLast(S,a,b)!==day;});
if(!ps.length||rng()>0.2)return false;
var pr=rng.pick(ps),a= !FD.lhFrom(S,pr[1],pr[0])?pr[0]:pr[0].tr.aggr+pr[0].tr.cp>=pr[1].tr.aggr+pr[1].tr.cp?pr[0]:pr[1],b=a===pr[0]?pr[1]:pr[0];
a.lhDay=b.lhDay=day;
FD.lhMark(S,a,b,day);
var r=FD.clash(S,a,b,function(l){return pk(S,l);});
b.m.fear=clamp(b.m.fear+6,0,100);
if(r.r18){a.cnt.r18=(a.cnt.r18||0)+1;b.cnt.r18=(b.cnt.r18||0)+1;}
rel(S,a,b,r.r18?'無理やり抱いた':r.touch===false?'揉み合った':'唇を奪った',r.touch===false?'enemy':'obsess');
ST.say(S,{actors:[a,b],tag:'愛憎',kind:r.r18?'climax':'event',text:r.text,why:'愛憎（'+FD.label(S,a,b)+'）。'+FD.lhWhy(S,a,b)+(r.touch===false?'（恋愛対象・受け攻めが合わないので、口論と掴み合いまで）':''),mag:r.r18?30:24});
return true;
}
function hateMove(S,live,day){
var rng=S.rng,ps=pairs(live,function(a,b){return FD.hateStrong(S,a,b)&& !a.hateDone&& !(HK.SameStory&&HK.SameStory.nk&&HK.SameStory.nk(S,a,b));});
if(!ps.length|| !S.kills.length)return false;
var pr=rng.pick(ps),a=pr[0],b=pr[1];
if(rng()>(0.05+a.tr.aggr*0.06+a.tr.cold*0.05+a.m.fear/1500)*HK.Dark.f(S,'grudge'))return false;
a.hateDone=true;
rel(S,a,b,'憎んでいる','enemy');
var lock=rng()<0.5;
var t=lock?b.name+'が裏口から薪を取りに出たとき、'+a.name+'が、その扉に内側から閂をかけた。'+TL.line(a,'HATE_KILL',b)+'扉の向こうで、'+b.name+'が何度も扉を叩いた。'
:'殺人騒ぎで皆が食堂に集まっているあいだに、'+a.name+'は'+b.name+'を、誰もいない書斎へ呼び出した。'+TL.line(a,'HATE_KILL',b);
var win=lock?0.5-(b.stats.nerve||3)*0.03+a.tr.cold*0.15:0.45+a.tr.aggr*0.2-Y.skill(b,'fight')*0.3;
if(rng()<win){
b.alive=false;b.fate=lock?'吹雪の中に締め出されて凍死した（'+day+'日目）':a.name+'に殺された（'+day+'日目・事件とは別の殺人）';
a.m.sus=clamp(a.m.sus+22,0,100);
S.extraKills=(S.extraKills||[]).concat([{a:a,b:b}]);
ST.key(S,ST.say(S,{actors:[a,b],tag:'便乗殺人',kind:'climax',text:t+(lock?'やがて、その音は止んだ。翌朝、扉の外の雪の中で、'+b.name+'は膝を抱えたまま凍りついていた。'+a.name+'は、閂を外したのは自分だと名乗り出た。':a.name+'は、暖炉の火掻き棒を振り下ろした。――'+a.name+'は、それを「館の殺人鬼の仕業」に見せかけようとした。'),why:a.name+'は'+b.name+'（'+FD.label(S,a,b)+'）を憎んでいた。殺人騒ぎに紛れて手にかけた（事件の犯人とは別。'+a.name+'への疑い +22）',mag:44}),a.name+'が'+b.name+'を手にかけた');
return true;
}
b.m.fear=clamp(b.m.fear+15,0,100);a.m.sus=clamp(a.m.sus+12,0,100);
if(HK.HateKit){HK.HateKit.shift(S,b,a,30);HK.HateKit.shift(S,a,b,6);}
ST.say(S,{actors:[a,b],tag:'殺意',kind:'climax',text:t+(lock?'しばらくして、物音に気づいた執事が閂を外した。雪まみれの'+b.name+'は、震えながら'+a.name+'を睨みつけた。':a.name+'が振り上げた火掻き棒を、'+b.name+'は椅子で受け止めた。物音に、一行が駆けつけてきた。'),why:a.name+'は'+b.name+'（'+FD.label(S,a,b)+'）を殺そうとしたが、失敗した（'+a.name+'への疑い +12）',mag:34});
return true;
}
})();
});
;
/* ==== js/scenario-jinro.js ==== */
HK.Load.def(232,'js/scenario-jinro.js',function(){
(function(){
'use strict';
var HK=window.HK;
function L(s){return s.split('|');}
function clamp(v,a,b){return Math.max(a,Math.min(b,v));}
var ROLE={wolf:'人狼',seer:'占い師',medium:'霊媒師',hunter:'狩人',vill:'村人'};
var PRIZE={none:'',yaki:'高級焼肉',money:'賞金一万円',cake:'ホールケーキ',punish:'負けた陣営は罰ゲーム',wish:'勝者の言うことを一つ聞く'};
function fill(t,m){return String(t).replace(/\{(\w+)\}/g,function(x,k){return m[k]!=null?m[k]:x;});}
var scen={
id:'jinro',name:'人狼',kicker:'ゲーム・推理',
desc:'住人どうしで人狼ゲーム。配役は人狼・狩人・占い師・霊媒師・村人からランダム。人狼は性格で戦法（騙り・潜伏・仲間切り・庇い合い）を選び、村は仕切り役しだいで方針（ローラー・真贋の見極め・グレー吊り）が変わる。信頼と協力、そして裏切り。知能は性格とは別に決まる。',
solo:true,minCast:4,maxCast:15,unit:'日',
castHint:'4〜15人。配役の数は環境値で決めます（人狼は全体の半分未満に自動で調整）。ゲームなので、襲う相手や投票先は既存の関係と関係なく、推理と立ち回りで決まります。',
simulate:function(input){return run(input);},
derived:['caution','honesty','impulse','lead'],
env:[
{id:'wolves',label:'人狼の数',min:1,max:4,def:2,lo:'1人',hi:'4人',unit:'人'},
{id:'seer',label:'占い師',type:'select',def:'1',options:[{v:'1',label:'あり'},{v:'0',label:'なし'}]},
{id:'medium',label:'霊媒師',type:'select',def:'1',options:[{v:'1',label:'あり'},{v:'0',label:'なし'}]},
{id:'hunter',label:'狩人',type:'select',def:'1',options:[{v:'1',label:'あり'},{v:'0',label:'なし'}]},
{id:'prize',label:'賞品',type:'select',def:'none',options:[{v:'none',label:'なし（ただ遊ぶ）'},{v:'yaki',label:'高級焼肉'},{v:'money',label:'賞金一万円'},{v:'cake',label:'ホールケーキ'},{v:'punish',label:'負けた陣営は罰ゲーム'},{v:'wish',label:'勝者の言うことを一つ聞く'}]},
{id:'prizeText',label:'賞品（自由に書く）',type:'text',def:'',placeholder:'例：駅前のラーメン',desc:'書くと、上の賞品の代わりになる'}
],
stats:[{id:'int',label:'知能',desc:'推理の正確さ。低いと推理が破綻しやすく、嘘もほころびやすい（性格とは別）'},{id:'poker',label:'ポーカーフェイス',desc:'嘘をついても顔に出にくい'}],
perFields:[{id:'role',label:'配役',auto:'ランダム',options:[{id:'wolf',label:'人狼'},{id:'seer',label:'占い師'},{id:'medium',label:'霊媒師'},{id:'hunter',label:'狩人'},{id:'vill',label:'村人'}]}],
actions:[
{id:'logic',label:'理詰めで推理する',fit:function(t){return t.a*0.7+t.caution*0.3;}},
{id:'gut',label:'勘と勢いで動く',fit:function(t){return t.fc*0.5+t.impulse*0.5;}},
{id:'quiet',label:'様子を見る',fit:function(t){return t.ac*0.6+t.caution*0.3;}}
],
goals:[
{id:'win',label:'絶対に勝つ',fit:function(t){return t.cp*0.4+t.jealous*0.3+t.fc*0.2;}},
{id:'fun',label:'楽しめればいい',fit:function(t){return t.fc*0.5+t.np*0.3;}},
{id:'prize',label:'賞品が欲しい',fit:function(t){return t.impulse*0.5+t.fc*0.3+t.cold*0.1;}}
],
events:[]
};
HK.SCENARIOS.jinro=scen;
if(HK.SCEN_ORDER.indexOf('jinro')<0)HK.SCEN_ORDER.push('jinro');
function resolve(S,p,list,pick){
if(pick&&pick!=='auto')for(var i=0;i<list.length;i++)if(list[i].id===pick)return list[i];
return HK.weighted(S.rng,list,function(o){return Math.pow(Math.max(0.02,o.fit(p.tr)),3);});
}
var STYLE={logic:'理詰め',lead:'仕切り役',gut:'勘で動く',follow:'空気に合わせる',contra:'逆張り'};
var PLAN_LABEL={fake:'占い騙り',fakeMed:'霊媒騙り',hide:'潜伏',bus:'仲間切り',cover:'庇い合い',ks:'占い師噛み',kstrong:'推理役噛み',kgray:'信頼の厚い人を噛む'};
var POLICY_LABEL={roller:'占いローラー',judge:'真贋の見極め',gray:'グレー吊り'};
function run(input){
var ST=HK.Story,J=HK.JinroText,S=ST.state(input,'jinro'),rng=S.rng,env=S.env,P=S.P,n=P.length;
var SSK=HK.SameStory&&HK.SameStory.nk?HK.SameStory:null;
var prize=String(env.prizeText||'').trim().slice(0,30)||PRIZE[env.prize]||'';
var pTxt=String(env.prizeText||'').trim(),pPun=pTxt? /罰/.test(pTxt):env.prize==='punish',pWish= !pTxt&&env.prize==='wish';
var pSent=pTxt? /[はがを]|[うくすつぬふむゆるぐぶ]$/.test(pTxt):pWish;
var prizeHotN= !prize?'':pPun?'罰ゲーム回避':pWish?'勝者の命令権':pSent?'賞品':prize;
var prizeWinN= !prize?'':pPun?'勝利':pWish?'勝者の命令権':pSent?'勝利':prize;
function pk(a){return ST.pick(S,a);}
function F(t,m){return fill(t,m);}
function say(o){return ST.say(S,o);}
function avg(list,f){return list.length?list.reduce(function(s0,x){return s0+f(x);},0)/list.length:0;}
var nW=clamp(+env.wolves||1,1,Math.max(1,Math.ceil(n/2)-1));
var roles=[];
for(var i=0;i<nW;i++)roles.push('wolf');
if(env.seer==='1'&&roles.length<n)roles.push('seer');
if(env.medium==='1'&&roles.length<n)roles.push('medium');
if(env.hunter==='1'&&roles.length<n)roles.push('hunter');
while(roles.length<n)roles.push('vill');
var fixed=P.map(function(p){var pc=(input.perChar&&input.perChar[p.i])||{};return(pc.pick||{}).role;});
var pool=roles.slice();
P.forEach(function(p,k){var want=fixed[k];if(want&&ROLE[want]){var at=pool.indexOf(want);if(at>=0){p.role=want;pool.splice(at,1);}}});
pool=rng.shuffle(pool);
P.forEach(function(p){if(!p.role)p.role=pool.pop();});
P.forEach(function(p){
var pc=(input.perChar&&input.perChar[p.i])||{},t=p.tr;
p.action=resolve(S,p,scen.actions,pc.action);p.goal=resolve(S,p,scen.goals,pc.goal);
p.intel=clamp((p.stats.int||3)/5,0.2,1);
p.want=(prize?0.3+t.fc*0.3+t.impulse*0.25+t.cp*0.2+t.jealous*0.2:0.2+t.cp*0.2)+(p.goal.id==='win'?0.25:p.goal.id==='prize'&&prize?0.35:0);
p.effort=clamp((t.a*0.45+t.caution*0.2+p.intel*0.45+(p.action.id==='logic'?0.15:0))*(0.7+p.want*0.6),0.05,1.3);
p.acc=clamp(p.intel*0.65+t.a*0.2+p.effort*0.15,0.1,1);
p.bold=clamp((1-t.honesty)*0.45+t.cp*0.3+t.cold*0.25,0,1);
p.act=clamp(p.bold*0.45+p.intel*0.3+(p.stats.poker||3)*0.06+t.fc*0.1-t.ac*0.25,0.05,1);
p.like=clamp(0.5+t.np*0.3+t.fc*0.15+t.warmth*0.2-t.cold*0.35-t.aggr*0.2,0.05,1);
var sc={logic:p.acc*1.2+(p.action.id==='logic'?0.3:0),lead:t.lead*0.7+t.cp*0.5,gut:t.fc*0.5+t.impulse*0.6+(p.action.id==='gut'?0.3:0),follow:t.ac*0.9+(p.action.id==='quiet'?0.3:0),contra:t.aggr*0.5+(1-t.ac)*0.4+t.cp*0.2-t.np*0.3};
p.style=HK.weighted(rng,Object.keys(sc),function(k){return Math.pow(Math.max(0.02,sc[k]),3);});
p.alive=true;p.sus={};p.known={};p.belief={};p.ally=null;
p.cnt={votes:0,right:0,talk:0,breaks:0,lies:0,betray:0,ally:0,bus:0};
p.m={sus:0,effort:Math.round(p.effort*70)};
p.roleLabel=ROLE[p.role]+(fixed[p.i]&&fixed[p.i]===p.role?'（指定）':'');
});
P.forEach(function(p){P.forEach(function(q){if(q!==p)p.sus[q.i]=38+(1-q.like)*22+(rng()-0.5)*16*(1.2-p.acc);});});
var isW=function(p){return p.role==='wolf';};
var LM=HK.JinroLove&&env.lovemode==='on'?HK.JinroLove:null;
if(LM)LM.setup(S,P,input,rng);
var wolves=P.filter(isW);
wolves.forEach(function(w){wolves.forEach(function(v){if(v!==w)w.known[v.i]='wolf';});w.sus={};P.forEach(function(q){if(q!==w)w.sus[q.i]=isW(q)?0:50;});});
var alive=function(){return P.filter(function(p){return p.alive;});};
var seer=P.filter(function(p){return p.role==='seer';})[0],med=P.filter(function(p){return p.role==='medium';})[0],hunter=P.filter(function(p){return p.role==='hunter';})[0];
var plan={fake:null,fakeMed:null,kill:'kstrong',tags:[]};
var fakeScore=function(w){return w.tr.aggr*0.4+w.bold*0.5+w.intel*0.25+w.tr.fc*0.1;};
var rankW=wolves.slice().sort(function(a,b){return fakeScore(b)-fakeScore(a);});
if(seer&&rankW[0]&&fakeScore(rankW[0])>0.62+rng()*0.2){plan.fake=rankW[0];plan.tags.push('fake');}
if(med&&rankW[1]&&fakeScore(rankW[1])>0.66+rng()*0.15){plan.fakeMed=rankW[1];plan.tags.push('fakeMed');}
if(!plan.fake&& !plan.fakeMed)plan.tags.push('hide');
wolves.forEach(function(w){w.busP=clamp(w.tr.cold*0.5+w.intel*0.3-w.tr.np*0.35+w.tr.aggr*0.1,0,1);w.coverP=clamp(w.tr.np*0.5+w.tr.impulse*0.2-w.tr.cold*0.2+0.1,0,1);});
if(wolves.length>1)plan.tags.push(avg(wolves,function(w){return w.busP;})>avg(wolves,function(w){return w.coverP;})?'bus':'cover');
var wa=avg(wolves,function(w){return w.tr.aggr+w.bold*0.5;}),wi=avg(wolves,function(w){return w.intel;});
plan.kill=wa>0.75?'ks':wi>0.65?'kstrong':'kgray';
plan.tags.push(plan.kill);
var planText=plan.tags.map(function(k){return PLAN_LABEL[k];}).join('＋');
var seerCO=[],medCO=[],hunterCO=[],executed=[],killed=[],guardLast=null,guardOK=0,winner='',policyLog=[],moments=[];
function claimants(){return seerCO.filter(function(c){return c.alive;});}
function snap(){P.forEach(function(p){var o=alive().filter(function(q){return q!==p&& !isW(q);});p.m.sus=o.length?Math.round(avg(o,function(q){return q.sus[p.i]||0;})):0;});ST.snap(S,['sus','effort']);}
function check(){var w=alive().filter(isW).length,v=alive().length-w;if(!w)return'vill';if(w>=v)return'wolf';return'';}
function bump(q,x,v){if(q===x|| !q.alive)return;if(isW(q))return;q.sus[x.i]=clamp((q.sus[x.i]||50)+v,0,100);}
function cred(q,sp){return clamp(1-(q.sus[sp.i]||50)/100+(sp.like-0.5)*0.3,0.05,1);}
say({kind:'phase',actors:P.map(function(p){return p.i;}),text:n+'人で人狼ゲームが始まった。配役は人狼'+nW+'・'+[env.seer==='1'?'占い師':'',env.medium==='1'?'霊媒師':'',env.hunter==='1'?'狩人':''].filter(Boolean).join('・')+(roles.filter(function(r){return r==='vill';}).length?'・村人'+roles.filter(function(r){return r==='vill';}).length:'')+'。'+(prize?'賞品は「'+prize+'」。':''),why:'配役はランダム（指定があればそれを優先）'});
if(prize){var hot=P.slice().sort(function(a,b){return b.want-a.want;})[0];say({actors:[hot.i],tag:'賞品',text:F(pk(J.prizeHot),{a:hot.name,p:prizeHotN}),why:hot.name+'の勝ちたい気持ち（FC・衝動性・負けず嫌い）'});}
function divine(){
if(!seer|| !seer.alive)return;
var cand=alive().filter(function(q){return q!==seer&& !seer.known[q.i];});
if(!cand.length)return;
var t=cand.slice().sort(function(a,b){return seer.sus[b.i]-seer.sus[a.i];})[rng()<0.55+seer.acc*0.3?0:Math.floor(rng()*cand.length)];
seer.known[t.i]=isW(t)?'wolf':'human';
seer.lastDiv=t;
}
function hearResult(c,x,black){
alive().forEach(function(q){if(q===c)return;var b=q.belief[c.i]==null?0.5:q.belief[c.i];if(x===q){if(black&& !isW(q)){q.belief[c.i]=0;q.sus[c.i]=100;}return;}bump(q,x,black?34*b: -18*b);});
}
function setBelief(){
var cl=claimants();
alive().forEach(function(q){
if(isW(q))return;
cl.forEach(function(c){
var real=c===seer,base=cl.length===1?0.75:0.5;
var tell=real?q.acc*0.25: -q.acc*0.25*(1.1-c.act);
q.belief[c.i]=clamp(base+tell+(c.like-0.5)*0.2-(q.sus[c.i]-50)/200,0.02,0.98);
});
});
}
divine();
snap();
var played=0;
for(var day=1;day<=n+2&& !winner;day++){
played=day;
ST.step(S,day+'日目・昼');
var A=alive(),lastEx=executed[executed.length-1]||null,lastKill=killed[killed.length-1]||null;
if(HK.HateKit){
if(!S.ties)S.ties=(input.ties||[]).filter(function(t){return!(HK.ngPair(P[t.a],P[t.b])&& /^(lover|fwb|mate|fated|crush|almost|ex|yan)$/.test(t.type));});
var hk=HK.HateKit.storyTick(S,A,{kinds:'love',rate:0.35,place:'朝の広場で、'});
if(hk)ST.say(S,{actors:hk.actors,tag:hk.cat==='romance'?'片恋と嫌悪':'敵視',text:hk.text,why:hk.why,mag:hk.mag});
}
if(HK.Obsess&&HK.Obsess.storyTick){
if(!S.ties)S.ties=(input.ties||[]).filter(function(t){return!(HK.ngPair(P[t.a],P[t.b])&& /^(lover|fwb|mate|fated|crush|almost|ex|yan)$/.test(t.type));});
var ob=HK.Obsess.storyTick(S,A,{rate:0.3,place:'朝の広場で、'});
if(ob)ST.say(S,{actors:ob.actors,tag:ob.tag,kind:ob.kind,text:ob.text,why:ob.why,mag:ob.mag});
}
if(seer&&seer.alive){
if(seerCO.indexOf(seer)<0&&seer.lastDiv){
var foundW=seer.known[seer.lastDiv.i]==='wolf';
var pressure=avg(A.filter(function(q){return q!==seer&& !isW(q);}),function(q){return q.sus[seer.i];});
if(foundW||seer.tr.honesty>0.6||pressure>55||(plan.fake&&day>=1&&rng()<0.4)||day>=2&&rng()<0.6){
seerCO.push(seer);setBelief();
say({actors:[seer.i,seer.lastDiv.i],tag:'占い師CO',text:F(pk(J.seerCO),{a:seer.name,x:seer.lastDiv.name,r:foundW?'人狼でした':'人狼ではありませんでした'}),why:seer.name+'は本物の占い師（'+(foundW?'人狼を見つけた':seer.tr.honesty>0.6?'正直さ':pressure>55?'疑いをかわすため':'頃合いを見て')+'）'});
hearResult(seer,seer.lastDiv,foundW);
}
}else if(seerCO.indexOf(seer)>=0&&seer.lastDiv&&seer.lastDiv.alive){
var bl=seer.known[seer.lastDiv.i]==='wolf';
say({actors:[seer.i,seer.lastDiv.i],tag:'占い結果',text:F(pk(J.seerRes),{a:seer.name,x:seer.lastDiv.name,r:bl?'人狼':'人間'}),why:seer.name+'は本物の占い師'});
hearResult(seer,seer.lastDiv,bl);
}
}
var fw=plan.fake;
if(fw&&fw.alive&&seerCO.indexOf(fw)<0&&(seerCO.length||fw.bold>0.75||day>=2)){
seerCO.push(fw);setBelief();
var ft=fw.intel>0.6&&rng()<0.4?wolves.filter(function(w){return w!==fw&&w.alive;})[0]:null;
var tgt=ft||A.filter(function(q){return!isW(q)&&q!==fw;}).sort(function(a,b){return(b.acc+(b===seer?0.5:0))-(a.acc+(a===seer?0.5:0));})[0];
if(tgt){
fw.fakeLast=tgt;fw.cnt.lies++;
say({actors:[fw.i,tgt.i],tag:seerCO.length>1?'対抗CO':'占い師CO',text:F(pk(seerCO.length>1?J.fakeCO:J.seerCO),{a:fw.name,x:tgt.name,r:ft?'人狼ではありませんでした':'人狼でした'}),why:fw.name+'は人狼。占い師を騙った（'+(ft?'仲間に白を出して守る':'推理役に黒を出す')+'・堂々さ '+Math.round(fw.bold*100)+'）'});
hearResult(fw,tgt,!ft);
}
}else if(fw&&fw.alive&&seerCO.indexOf(fw)>=0&&day>1){
var ft2=A.filter(function(q){return!isW(q)&&q!==fw&&q!==fw.fakeLast;}).sort(function(a,b){return b.acc-a.acc;})[rng()<0.6?0:1];
if(ft2){var blk=rng()<0.45;fw.fakeLast=ft2;say({actors:[fw.i,ft2.i],tag:'占い結果',text:F(pk(J.seerRes),{a:fw.name,x:ft2.name,r:blk?'人狼':'人間'}),why:fw.name+'は偽の占い師（人狼）'});hearResult(fw,ft2,blk);}
}
if(lastEx){
if(med&&med.alive&&(medCO.indexOf(med)>=0||med.tr.honesty>0.45||isW(lastEx)||claimants().length>1||rng()<0.5)){
if(medCO.indexOf(med)<0)medCO.push(med);
say({actors:[med.i,lastEx.i],tag:'霊媒',text:F(pk(J.medCO),{a:med.name,x:lastEx.name,r:isW(lastEx)?'人狼でした':'人狼ではありませんでした'}),why:med.name+'は本物の霊媒師'});
alive().forEach(function(q){if(isW(q)||q===med)return;claimants().forEach(function(c){var said=c===seer?seer.known[lastEx.i]:c.fakeLast===lastEx?'wolf':null;if(said)q.belief[c.i]=clamp((q.belief[c.i]||0.5)+((said==='wolf')===isW(lastEx)?0.2: -0.35)*(0.5+q.acc*0.5),0.02,0.98);});});
}
var fm=plan.fakeMed;
if(fm&&fm.alive&&medCO.indexOf(fm)<0&&(medCO.length||rng()<0.5)){
medCO.push(fm);fm.cnt.lies++;
say({actors:[fm.i,lastEx.i],tag:'霊媒騙り',text:F(pk(J.medCO),{a:fm.name,x:lastEx.name,r:isW(lastEx)?'人狼ではありませんでした':'人狼でした'}),why:fm.name+'は人狼。霊媒師を騙った'});
alive().forEach(function(q){if(!isW(q)){bump(q,fm,8*q.acc);if(med&&med.alive&&medCO.indexOf(med)>=0)bump(q,med,6*(1-q.acc));}});
}
}
if(lastKill&&lastKill===seer&&seerCO.indexOf(seer)>=0)alive().forEach(function(q){if(!isW(q))claimants().forEach(function(c){q.belief[c.i]=clamp((q.belief[c.i]||0.5)-0.25*q.acc,0.02,0.98);bump(q,c,15*q.acc);});});
var policy='gray',inf=A.slice().sort(function(a,b){return(b.tr.lead*0.6+b.tr.cp*0.4+(1-avg(A.filter(function(q){return q!==b;}),function(q){return(q.sus[b.i]||50)/100;}))*0.6)-(a.tr.lead*0.6+a.tr.cp*0.4+(1-avg(A.filter(function(q){return q!==a;}),function(q){return(q.sus[a.i]||50)/100;}))*0.6);})[0];
var cl=claimants();
if(cl.length>=2){
if(isW(inf))policy=plan.fake&&plan.fake.alive?(inf.intel>0.6?'judge':'gray'):'roller';
else{var sc2={roller:inf.tr.cp*0.5+inf.tr.caution*0.4+(1-inf.acc)*0.3,judge:inf.acc*0.9+inf.tr.a*0.3,gray:inf.tr.np*0.6+(1-inf.tr.cp)*0.2};policy=Object.keys(sc2).sort(function(a,b){return sc2[b]-sc2[a];})[0];}
var polT=policy==='gray'?null:policy==='roller'?cl.slice().sort(function(a,b){return avg(A,function(q){return q.sus[a.i]||0;})-avg(A,function(q){return q.sus[b.i]||0;});}).pop():(isW(inf)?cl.filter(function(c){return!isW(c);})[0]:cl.slice().sort(function(a,b){return(inf.belief[a.i]||0.5)-(inf.belief[b.i]||0.5);})[0]);
policyLog.push(POLICY_LABEL[policy]);
say({actors:[inf.i].concat(polT?[polT.i]:[]),tag:'村の方針',text:F(pk(J.policy[policy]),{a:inf.name,x:polT?polT.name:''}),why:'仕切り役の'+inf.name+'が「'+POLICY_LABEL[policy]+'」を提案（'+(isW(inf)?'実は人狼。狼に都合のいい方針':{roller:'CP・慎重さ',judge:'推理の正確さ',gray:'NP。情報源を残したい'}[policy])+'）'});
inf.policyT=polT;
}else inf.policyT=null;
var speakers=rng.shuffle(A.slice()).slice(0,Math.min(A.length,4+Math.floor(rng()*3)));
speakers.forEach(function(p){
if(!p.alive)return;
var others=A.filter(function(q){return q!==p;});
if(!others.length)return;
var mate=isW(p)?others.filter(isW)[0]:null;
if(LM&&LM.appeal(S,p,others,{isW:isW,pk:pk,bump:bump,say:say,day:day}))return;
if(isW(p)){
var mateHeat=mate?avg(others.filter(function(q){return!isW(q);}),function(q){return q.sus[mate.i]||50;}):0;
if(mate&&mateHeat>62&&plan.tags.indexOf('bus')>=0&&rng()<p.busP+0.2){
p.cnt.bus++;moments.push(p.name+'が仲間の'+mate.name+'を切った');
say({actors:[p.i,mate.i],tag:'仲間切り',text:F(pk(J.bus),{a:p.name,x:mate.name}),why:p.name+'は人狼。疑われた仲間を自分から切って、信用を買った（ドライさ・知能）'});
others.forEach(function(q){bump(q,mate,12);bump(q,p,-10*(1-q.acc*0.5));});
p.busVote=mate;return;
}
if(mate&&mateHeat>55&&rng()<p.coverP){
var scp=others.filter(function(q){return!isW(q);}).sort(function(a,b){return b.acc-a.acc;})[0];
say({actors:[p.i,mate.i],tag:'庇う',text:F(pk(J.cover),{a:p.name,x:mate.name,y:scp?scp.name:''}),why:p.name+'は人狼。仲間を庇った（NP・衝動性）'});
others.forEach(function(q){bump(q,mate,-6*(1-q.acc));bump(q,p,8*q.acc);});
return;
}
if(p.ally&&p.ally.alive&&(alive().filter(isW).length*2+1>=alive().length||avg(others.filter(function(q){return!isW(q);}),function(q){return q.sus[p.i]||50;})>60)&&rng()<0.5+p.tr.cold*0.4){
var dupe=p.ally;p.cnt.betray++;moments.push(p.name+'が協力相手の'+dupe.name+'を裏切った');
say({actors:[p.i,dupe.i],tag:'裏切り',text:F(pk(J.betray),{a:p.name,x:dupe.name})+F(pk(J.betrayed),{a:p.name,x:dupe.name}),why:p.name+'は人狼。隠れ蓑にしていた'+dupe.name+'を切り捨てた（ドライさ）'});
others.forEach(function(q){bump(q,dupe,14*(1-q.acc*0.5));});
p.busVote=dupe;dupe.ally=null;p.ally=null;return;
}
if(!p.ally&&rng()<0.25+p.like*0.3+p.act*0.2){
var mark=others.filter(function(q){return!isW(q)&& !q.ally&&(q.sus[p.i]||50)<55;}).sort(function(a,b){return(b.acc+(b===seer?0.4:0))-(a.acc+(a===seer?0.4:0));})[0];
if(mark&&rng()<0.4+p.act*0.5-mark.acc*0.3){
p.ally=mark;mark.ally=p;p.cnt.ally++;mark.cnt.ally++;
say({actors:[p.i,mark.i],tag:'協力',text:F(pk(J.ally),{a:p.name,x:mark.name}),why:p.name+'は人狼。'+mark.name+'に近づいて隠れ蓑にした（感じのよさ・演技力）'});
mark.sus[p.i]=clamp(mark.sus[p.i]-20,0,100);
return;
}
}
var scape=others.filter(function(q){return!isW(q);}).sort(function(a,b){return(b.acc+(seerCO.indexOf(b)>=0?0.5:0))-(a.acc+(seerCO.indexOf(a)>=0?0.5:0));})[0];
if(!scape)return;
p.cnt.lies++;
var boldNow=rng()<p.bold+0.15;
say({actors:[p.i,scape.i],tag:boldNow?'議論':'議論',text:F(pk(boldNow?J.lieBold:J.lieShaky),{a:p.name,x:scape.name}),why:boldNow?'':p.name+'の嘘が、少し顔に出た（正直さ・AC）'});
others.forEach(function(q){bump(q,scape,(boldNow?10:4)*cred(q,p)*(1-q.acc*0.4));if(!boldNow)bump(q,p,10*q.acc);});
if(rng()<(1-p.intel)*0.18+(seerCO.indexOf(p)>=0?0.06:0)){
p.cnt.breaks++;moments.push(p.name+'が口を滑らせた');
say({actors:[p.i],tag:'失言',text:F(pk(J.breakWolf),{a:p.name,y:lastKill?lastKill.name:scape.name}),why:p.name+'の嘘がほころんだ（知能 '+Math.round(p.intel*5)+'）'});
others.forEach(function(q){bump(q,p,25*(0.4+q.acc));});
}
return;
}
if(p.ally&&p.ally.alive&&p.sus[p.ally.i]>64){
var ex2=p.ally;p.cnt.betray++;moments.push(p.name+'が'+ex2.name+'を裏切った');
say({actors:[p.i,ex2.i],tag:'裏切り',text:F(pk(J.betray),{a:p.name,x:ex2.name})+F(pk(J.betrayed),{a:p.name,x:ex2.name}),why:p.name+'は'+ex2.name+'と組んでいたが、疑いが上回った（'+Math.round(p.sus[ex2.i])+'）'});
others.forEach(function(q){bump(q,ex2,10);});
ex2.ally=null;p.ally=null;return;
}
if(!p.ally&&rng()<0.3+p.tr.np*0.25+p.tr.ac*0.15){
var pal=others.filter(function(q){return!q.ally&&p.sus[q.i]<44;}).sort(function(a,b){return p.sus[a.i]-p.sus[b.i];})[0];
if(pal&&(isW(pal)?rng()<0.3+pal.act*0.6:pal.sus[p.i]<50)){
p.ally=pal;pal.ally=p;p.cnt.ally++;pal.cnt.ally++;
say({actors:[p.i,pal.i],tag:'協力',text:F(pk(J.ally),{a:p.name,x:pal.name}),why:p.name+'は'+pal.name+'を信頼している（疑い '+Math.round(p.sus[pal.i])+'）'+(isW(pal)?'。……'+pal.name+'は人狼だ':'')});
return;
}
}
var top=others.slice().sort(function(a,b){return p.sus[b.i]-p.sus[a.i];})[0];
if(p===seer){var kw=others.filter(function(q){return seer.known[q.i]==='wolf';})[0];if(kw)top=kw;}
if(p.style==='logic'||(p.style==='lead'&&rng()<0.4)){
var real=others.filter(isW).sort(function(a,b){return a.act-b.act;})[0];
if(real&&rng()<p.acc*(1.15-real.act)*0.6)top=real;
var types=['speech','feel'];
if(day>=2)types.push('vote','vote');
if(seerCO.length)types.push('co');
if(lastKill)types.push('bite');
var cover0=others.filter(function(q){return q.ally&&q.ally!==top;})[0];
if(cover0&&day>=2)types.push('defend');
var y0=others.filter(function(q){return q!==top;})[Math.floor(rng()*Math.max(1,others.length-1))];
var rt=types[Math.floor(rng()*types.length)],m0={a:p.name,x:top.name,y:rt==='bite'&&lastKill?lastKill.name:y0?y0.name:top.name};
var op=F(pk(J.open),m0);
var text=op+(/[？。、]$/.test(op)?'':'')+F(pk(J.reason[rt]),m0)+F(pk(J.close),m0);
p.cnt.talk++;
say({actors:[p.i,top.i],tag:'推理',text:text,why:p.name+'の推理（'+STYLE[p.style]+'・正確さ '+Math.round(p.acc*100)+'）'});
others.forEach(function(q){if(q!==top)bump(q,top,12*cred(q,p)*(0.6+q.acc*0.4));});
if(rng()<(1-p.intel)*0.22){
p.cnt.breaks++;
say({actors:[p.i],tag:'破綻',text:F(pk(J.break),{a:p.name,x:top.name,y:m0.y}),why:p.name+'の推理が破綻した（知能 '+Math.round(p.intel*5)+'）'});
others.forEach(function(q){bump(q,p,8*q.acc);bump(q,top,-8);});
}
}else if(p.style==='lead'){
var t2=inf===p&&inf.policyT?inf.policyT:top;
var t3=others.filter(function(q){return q!==t2;}).sort(function(a,b){return p.sus[b.i]-p.sus[a.i];})[0];
var leadT=t3?J.lead:J.lead.filter(function(t){return t.indexOf('{y}')<0;});
say({actors:t3?[p.i,t2.i,t3.i]:[p.i,t2.i],tag:'仕切り',text:F(pk(leadT),{a:p.name,x:t2.name,y:t3?t3.name:''}),why:p.name+'のCP・主導性'+(t3?'／次点は'+t3.name:'')});
others.forEach(function(q){if(q!==t2)bump(q,t2,14*cred(q,p)*(0.5+q.tr.ac*0.5));});
}else if(p.style==='gut'){
say({actors:[p.i,top.i],tag:'勘',text:F(pk(J.gut),{a:p.name,x:top.name}),why:p.name+'のFC・衝動性'});
others.forEach(function(q){if(q!==top)bump(q,top,6*cred(q,p));});
}else if(p.style==='contra'){
var crowd=others.slice().sort(function(a,b){return avg(others,function(q){return q.sus[b.i]||0;})-avg(others,function(q){return q.sus[a.i]||0;});})[0];
var alt=others.filter(function(q){return q!==crowd;}).sort(function(a,b){return p.sus[b.i]-p.sus[a.i];})[0]||crowd;
say({actors:[p.i,alt.i],tag:'逆張り',text:F(pk(J.contra),{a:p.name,x:crowd.name,y:alt.name}),why:p.name+'の攻撃性・ACの低さ（多数派を疑う）'});
others.forEach(function(q){bump(q,crowd,-6);bump(q,alt,8*cred(q,p));});
}else{
var leadP=others.slice().sort(function(a,b){return(b.tr.lead+b.tr.cp)-(a.tr.lead+a.tr.cp);})[0];
say({actors:[p.i,top.i],tag:'同調',text:F(pk(J.follow),{a:p.name,x:top.name,y:leadP.name}),why:p.name+'のAC（'+leadP.name+'に合わせる）'});
}
if(p.like<0.35&&rng()<0.35){
var hearer=others[Math.floor(rng()*others.length)];
say({actors:[p.i,hearer.i],tag:'空気',text:F(pk(J.rude),{a:p.name,x:hearer.name})+F(pk(J.rudeReact),{a:p.name,x:hearer.name}),why:p.name+'は日頃から感じが悪い（ドライさ・攻撃性。感じのよさ '+Math.round(p.like*100)+'）'});
others.forEach(function(q){bump(q,p,9);});
}
if(top&&top.alive&&rng()<0.55){
if(isW(top)){var bd=rng()<top.bold+0.1;top.cnt.lies++;say({actors:[top.i],tag:'弁明',text:F(pk(bd?J.lieBold:J.lieShaky),{a:top.name,x:p.name}),why:bd?top.name+'は堂々と嘘をついた（正直さの低さ・CP）':top.name+'の弁明はぎこちなかった'});others.forEach(function(q){if(q!==top)bump(q,top,bd? -8*(1-q.acc):10*q.acc);});}
else{var dl=J.defend[top.persona]||J.defend.gentle;say({actors:[top.i],tag:'弁明',text:F(pk(dl),{a:top.name,x:p.name}),why:''});others.forEach(function(q){if(q!==top)bump(q,top,-10*q.acc*(0.5+top.like*0.5));});}
}
});
setBelief();
snap();
A=alive();
var tally=function(fnTarget){var v={};A.forEach(function(p){var t=fnTarget(p);if(t){v[t.i]=(v[t.i]||0)+1;p.voted=t;}});return v;};
var policyT=inf.policyT;
var villTarget=function(p){
var others=A.filter(function(q){return q!==p;});
if(p===seer){var k=others.filter(function(q){return seer.known[q.i]==='wolf';})[0];if(k)return k;}
var comply=0.25+p.tr.ac*0.4+cred(p,inf)*0.3-(p.style==='contra'?0.4:0);
if(policy==='gray'){var gray=others.filter(function(q){return seerCO.indexOf(q)<0&&medCO.indexOf(q)<0&&hunterCO.indexOf(q)<0;});if(gray.length)others=gray;}
else if(policyT&&policyT!==p&&rng()<comply)return policyT;
if(p.ally&&p.ally.alive&&p.ally.acc>p.acc&&p.ally.voted&&p.ally.voted!==p)return p.ally.voted;
return others.sort(function(a,b){return p.sus[b.i]-p.sus[a.i];})[0];
};
var pre=tally(function(p){return isW(p)?null:villTarget(p);}),preTop=Object.keys(pre).sort(function(a,b){return pre[b]-pre[a];})[0];
var cand=preTop!=null?P[+preTop]:null;
if(cand&&cand===hunter&&hunterCO.indexOf(hunter)<0&&rng()<0.5+hunter.tr.caution*0.3){
hunterCO.push(hunter);
say({actors:[hunter.i],tag:'狩人CO',text:F(pk(guardLast?J.hunterCO:J.hunterCO.filter(function(t){return t.indexOf('{x}')<0;})),{a:hunter.name,x:guardLast?guardLast.name:''}),why:hunter.name+'は本物の狩人。吊られそうになってCOした（慎重さ）'});
A.forEach(function(q){bump(q,hunter,-30*(0.5+q.acc*0.5));});
var cw=A.filter(function(w){return isW(w)&&w.bold>0.8;})[0];
if(cw&&rng()<0.5){hunterCO.push(cw);cw.cnt.lies++;moments.push(cw.name+'が狩人に対抗した');say({actors:[cw.i,hunter.i],tag:'狩人対抗',text:F(pk(J.hunterCounter),{a:cw.name,x:hunter.name}),why:cw.name+'は人狼。狩人を騙って対抗した（堂々さ）'});A.forEach(function(q){bump(q,hunter,18*(1-q.acc));bump(q,cw,18*q.acc);});}
}else if(cand&&isW(cand)&&cand.bold>0.85&&hunterCO.indexOf(cand)<0&&rng()<0.35){
hunterCO.push(cand);cand.cnt.lies++;moments.push(cand.name+'が狩人を騙った');
say({actors:[cand.i],tag:'狩人CO',text:F(pk(J.hunterCO),{a:cand.name,x:A.filter(function(q){return q!==cand;})[0].name}),why:cand.name+'は人狼。吊られそうになって狩人を騙った（堂々さ）'});
A.forEach(function(q){bump(q,cand,-22*(1-q.acc*0.6));});
if(hunter&&hunter.alive&&hunterCO.indexOf(hunter)<0&&rng()<0.6+hunter.tr.honesty*0.3){hunterCO.push(hunter);say({actors:[hunter.i,cand.i],tag:'狩人対抗',text:F(pk(J.hunterCounter),{a:hunter.name,x:cand.name}),why:hunter.name+'は本物の狩人'});A.forEach(function(q){bump(q,cand,25*q.acc);});}
}
function wolfTarget(p,others){
if(!isW(p))return villTarget(p);
if(p.busVote&&p.busVote.alive)return p.busVote;
var vs=others.filter(function(q){return!isW(q);});
return vs.sort(function(a,b){return(pre[b.i]||0)*10+(seerCO.indexOf(b)>=0&&b===seer?15:0)+b.acc*5-((pre[a.i]||0)*10+(seerCO.indexOf(a)>=0&&a===seer?15:0)+a.acc*5);})[0];
}
var votes=tally(function(p){
var others=A.filter(function(q){return q!==p;});
var vt=LM?LM.vote(S,p,others,wolfTarget(p,others),isW(p)):wolfTarget(p,others);
if(SSK&&vt&&SSK.nk(S,p,vt)){var alt=SSK.spare(S,p,others).slice().sort(function(a,b){return(p.sus[b.i]||0)-(p.sus[a.i]||0);})[0];if(alt)vt=alt;}
return vt;
});
if(LM)LM.flush(S,say,pk);
A.forEach(function(p){p.busVote=null;if(p.voted){p.cnt.votes++;if(!isW(p)&&isW(p.voted))p.cnt.right++;}});
var maxV=0,tops=[];
Object.keys(votes).forEach(function(k){if(votes[k]>maxV){maxV=votes[k];tops=[+k];}else if(votes[k]===maxV)tops.push(+k);});
var exP=P[tops[Math.floor(rng()*tops.length)]];
var exNk=SSK&&A.some(function(p){return p.voted===exP&&SSK.nk(S,p,exP);})?SSK.NOTE:'';
exP.alive=false;executed.push(exP);exP.fate='処刑（'+day+'日目）';
var lw=(isW(exP)?J.lastW:J.lastV)[exP.persona]||(isW(exP)?J.lastW:J.lastV).gentle;
say({actors:[exP.i],tag:'処刑',kind:'climax',text:F(pk(J.exec),{x:exP.name})+F(pk(lw),{x:exP.name}),why:'得票 '+maxV+'／'+A.length+(tops.length>1?'（同票からくじ引き）':'')+'・'+exP.name+'は'+ROLE[exP.role]+(policy!=='gray'&&exP===policyT?'（方針「'+POLICY_LABEL[policy]+'」どおり）':'')+exNk});
if(exP.ally){exP.ally.ally=null;exP.ally=null;}
winner=check();if(winner)break;
ST.step(S,day+'日目・夜');
A=alive();
divine();
var guard=null;
if(hunter&&hunter.alive){
var gc=A.filter(function(q){return q!==hunter&&q!==guardLast;});
guard=gc.sort(function(a,b){var va=(claimants().indexOf(a)>=0?60*(hunter.belief[a.i]==null?0.5:hunter.belief[a.i]):0)+(medCO.indexOf(a)>=0?20:0)+a.acc*12-hunter.sus[a.i]*0.4,vb=(claimants().indexOf(b)>=0?60*(hunter.belief[b.i]==null?0.5:hunter.belief[b.i]):0)+(medCO.indexOf(b)>=0?20:0)+b.acc*12-hunter.sus[b.i]*0.4;return vb-va;})[0];
guardLast=guard;
}
var prey=null,vill=A.filter(function(q){return!isW(q);});
if(plan.kill==='ks'&&seer&&seer.alive&&seerCO.indexOf(seer)>=0)prey=seer;
else if(plan.kill==='kgray')prey=vill.filter(function(q){return seerCO.indexOf(q)<0;}).sort(function(a,b){return avg(A,function(q){return q.sus[a.i]||50;})-avg(A,function(q){return q.sus[b.i]||50;});})[0];
prey=prey||vill.sort(function(a,b){return(b.acc+(b===seer&&seerCO.indexOf(b)>=0?0.6:0)+(medCO.indexOf(b)>=0?0.3:0))-(a.acc+(a===seer&&seerCO.indexOf(a)>=0?0.6:0)+(medCO.indexOf(a)>=0?0.3:0));})[0];
var rogue=A.filter(function(w){return isW(w)&&w.tr.impulse>0.7;})[0],rogueNote='';
if(rogue&&rng()<0.2&&vill.length>1){var rp=vill.filter(function(q){return q!==prey;}).sort(function(a,b){return rogue.sus[a.i]-rogue.sus[b.i];})[0]||prey;if(rp!==prey){prey=rp;rogueNote='（'+rogue.name+'が独断で噛み先を変えた）';moments.push(rogue.name+'が独断で噛んだ');}}
var nkNote='';
if(SSK&&prey){
var wv=A.filter(isW);
if(SSK.note(S,wv,prey)){
var alt2=SSK.spare(S,wv,vill).slice().sort(function(a,b){return b.acc-a.acc;})[0];
if(alt2&& !SSK.note(S,wv,alt2))prey=alt2;else nkNote=SSK.NOTE;
}
}
ST.step(S,(day+1)+'日目・朝');
if(prey&&prey===guard){guardOK++;moments.push(hunter.name+'が'+prey.name+'を守り抜いた');say({actors:[],tag:'平和な朝',text:pk(J.peace),why:'狩人の'+hunter.name+'が'+prey.name+'を守った'+rogueNote});}
else if(prey&&HK.Dark.skip(S,'night'))say({actors:[],tag:'平和な朝',text:pk(J.peace),why:'人狼は、この夜は誰も襲わなかった（'+HK.Dark.tag(S,'night')+'）'});
else if(prey){prey.alive=false;killed.push(prey);prey.fate='襲撃（'+(day+1)+'日目の朝）';if(prey.ally){prey.ally.ally=null;prey.ally=null;}say({actors:[prey.i],tag:'襲撃',text:F(pk(J.killed),{x:prey.name}),why:'人狼の戦法「'+PLAN_LABEL[plan.kill]+'」'+rogueNote+nkNote});}
snap();
winner=check();
}
winner=winner||check()||'wolf';
var winners=P.filter(function(p){return winner==='wolf'?isW(p): !isW(p);}),losers=P.filter(function(p){return winners.indexOf(p)<0;});
var pz=prizeWinN||'勝利';
var hotW=winners.slice().sort(function(a,b){return b.want-a.want;})[0],hotL=losers.slice().sort(function(a,b){return b.want-a.want;})[0];
if(hotW)say({actors:[hotW.i],tag:'勝利',text:F(pk(J.win[winner]),{a:hotW.name,p:pz}),why:hotW.name+'の勝ちたい気持ち（'+Math.round(hotW.want*100)+'）'});
if(hotL)say({actors:[hotL.i],tag:'敗北',text:F(pk(hotL.want>0.6?J.loseHot:J.loseCalm),{a:hotL.name,p:pz}),why:hotL.name+(hotL.want>0.6?'は本気で勝ちたかった':'は楽しめればよかった')});
if(HK.JinroAfter)HK.JinroAfter.end({S:S,P:P,input:input,env:env,winner:winner,winners:winners,losers:losers,wolves:wolves,isW:isW,plan:plan});
var sharp=P.filter(function(p){return!isW(p)&&p.cnt.votes;}).sort(function(a,b){return b.cnt.right/b.cnt.votes-a.cnt.right/a.cnt.votes||b.acc-a.acc;})[0];
P.forEach(function(p){
if(!p.fate)p.fate='生存';
p.notes.push(ROLE[p.role]+'・'+(winners.indexOf(p)>=0?'勝ち':'負け')+'・知能 '+Math.round(p.intel*5)+'・推理の正確さ '+Math.round(p.acc*100)+'・感じのよさ '+Math.round(p.like*100));
p.notes.push(isW(p)?'人狼として：'+(plan.fake===p?'占い騙り':plan.fakeMed===p?'霊媒騙り':'潜伏')+'・嘘 '+p.cnt.lies+'回'+(p.cnt.bus?'・仲間切り '+p.cnt.bus+'回':'')+(p.cnt.breaks?'・失言 '+p.cnt.breaks+'回':''):'議論のしかた：'+STYLE[p.style]+'・人狼に投票 '+p.cnt.right+'／'+p.cnt.votes+(p.cnt.breaks?'・推理の破綻 '+p.cnt.breaks+'回':'')+(p.cnt.ally?'・協力 '+p.cnt.ally+'回':'')+(p.cnt.betray?'・裏切り '+p.cnt.betray+'回':''));
if(LM)p.notes.push('好意モード：'+(p.superLogic?'とても論理的・':'')+'好き嫌いで投票 '+p.cnt.emo+'回'+(p.cnt.appeal?'・好意で訴えた '+p.cnt.appeal+'回（通った '+p.cnt.appealOK+'回）':''));
p.notes.push('方針：'+p.action.label+'／目標：'+p.goal.label+(prize?'・勝ちたい気持ち '+Math.round(p.want*100):''));
});
var title=winner==='wolf'?'人狼陣営の勝利 ― '+wolves.map(function(w){return w.name;}).join('・')+'が逃げ切った':'村人陣営の勝利 ― 人狼を全員見つけ出した';
var lines=['人狼は'+wolves.map(function(w){return w.name;}).join('・')+'。'+(seer?'占い師は'+seer.name+'。':'')+(med?'霊媒師は'+med.name+'。':'')+(hunter?'狩人は'+hunter.name+'。':'')];
lines.push('人狼陣営の戦法：'+planText+'。');
if(policyLog.length)lines.push('村の方針：'+policyLog.filter(function(x,k,a){return a.indexOf(x)===k;}).join('→')+'。');
if(moments.length)lines.push('盤面の転機：'+moments.slice(0,4).join('／')+'。');
if(sharp)lines.push('いちばん鋭かったのは'+sharp.name+'（人狼に投票 '+sharp.cnt.right+'／'+sharp.cnt.votes+'）。');
if(prize)lines.push(pPun?'「'+prize+'」の約束どおり、負けた'+(winner==='wolf'?'村人陣営':'人狼陣営')+'が罰ゲームを受けることになった。'
:pSent?'「'+prize+'」の約束どおり、勝ったのは'+(winner==='wolf'?'人狼陣営':'村人陣営')+'だった。'
:'賞品の「'+prize+'」は、'+(winner==='wolf'?'人狼陣営':'村人陣営')+'のものになった。');
return ST.result(S,input,{
ending:{title:title,kind:'ok',lines:lines},
estats:[['日数',played+'日'],['処刑',executed.length+'人'],['襲撃',killed.length+'人'],['護衛成功',guardOK+'回'],['人狼の戦法',planText]],
table:{title:'配役と結果',cols:['配役','陣営','結末','知能','議論のしかた','人狼に投票'],rows:P.map(function(p){return{i:p.i,rank:winners.indexOf(p)>=0?'勝':'',cells:[ROLE[p.role],isW(p)?'人狼':'村人',p.fate,String(Math.round(p.intel*5)),isW(p)?(plan.fake===p?'占い騙り':plan.fakeMed===p?'霊媒騙り':'潜伏'):STYLE[p.style],isW(p)?'－':p.cnt.right+'／'+p.cnt.votes]};})},
meters:[{label:'疑われ度',color:'--enemy'},{label:'推理の熱量',color:'--accent',dash:true}],
meta:n+'人・人狼'+nW+(prize?'・賞品「'+prize+'」':''),
summary:'人狼：'+title
});
}
})();
});
;
/* ==== js/jinro-love.js ==== */
HK.Load.def(233,'js/jinro-love.js',function(){
(function(){
'use strict';
var HK=window.HK,scen=HK.SCENARIOS&&HK.SCENARIOS.jinro;
if(!scen)return;
function L(s){return s.split('|');}
function clamp(v,a,b){return Math.max(a,Math.min(b,v));}
function fill(t,m){return String(t).replace(/\{(\w+)\}/g,function(x,k){return m[k]!=null?m[k]:x;});}
var at= -1;scen.env.forEach(function(e,i){if(e.id==='prize')at=i;});
scen.env.splice(at>=0?at:scen.env.length,0,{id:'lovemode',label:'好意モード',type:'select',def:'off',options:[{v:'off',label:'オフ（推理で投票する）'},{v:'on',label:'オン（好感度で投票することがある）'}],desc:'オンにすると、半分くらいの投票が好き嫌いで決まり、好意を使って信頼を取りにいく人が出る'});
var TW={lover:1,mate:1,fated:1,almost:0.8,fwb:0.5,best:0.8,buddy:0.75,childhood:0.7,sibling:0.65,sibclose:0.8,sibprot:0.8,parent:0.8,pparent:0.75,friend:0.5,mentor:0.5,master:0.55,teacher:0.45,senpai:0.35,colleague:0.25,classmate:0.35,boss:0.4,benefactor:0.6,relative:0.55,worship:0.85,fond:0.5,blind:0.75,acq:0.1,rival: -0.35,enemy: -0.85,sibbad: -0.15,bad: -0.4};
var LBL=function(t){return HK.TIES&&HK.TIES[t]?HK.TIES[t].label:t;};
var APPEAL={
amae:{label:'甘える',t:L('{a}は{x}の袖をつまんだ。「ねえ、{x}は私のこと信じてくれるよね？｜なあ、{x}は私を信じてくれるだろう？｜あの、{x}は私のこと、信じてくれますよね？」|{a}は{x}の隣にぴったりくっついた。「{x}だけは、味方でいてよ｜{x}だけは、味方でいてくれ｜{x}だけは、味方でいてください」|{a}は上目づかいで{x}を見た。「……{x}に疑われたら、さすがに泣くよ？｜……{x}に疑われたら、さすがに泣くぞ？｜……{x}に疑われたら、さすがに泣きますよ？」|{a}は{x}の肩に頭を預けた。「つかれた。{x}の隣がいちばん安心する｜疲れた。{x}の隣がいちばん安心する｜疲れました。{x}の隣がいちばん安心します」')},
plead:{label:'必死に訴える',t:L('{a}は{x}の手を両手で握った。「お願い、{x}。私を信じて。本当に村人なの｜頼む、{x}。私を信じろ。本当に村人なんだ｜お願いです、{x}。私を信じてください。本当に村人なんです」|{a}は身を乗り出した。「{x}、今までずっと一緒にいたでしょ。私が嘘ついたこと、ある？｜{x}、今までずっと一緒にいただろう。私が嘘をついたことが、あるか？｜{x}、今までずっと一緒にいたでしょう。私が嘘をついたこと、ありますか？」|{a}の声が震えた。「みんなに疑われてもいい。でも{x}にだけは、信じてほしい｜皆に疑われてもいい。だが{x}にだけは、信じてほしい｜みんなに疑われてもいいです。でも{x}にだけは、信じてほしいんです」|{a}は{x}の目をまっすぐ見た。「{x}が信じてくれるなら、私、最後まで戦える｜{x}が信じてくれるなら、私は最後まで戦える｜{x}が信じてくれるなら、私、最後まで戦えます」')},
cry:{label:'泣き落とし',t:L('{a}の目から、ぽろりと涙がこぼれた。「{x}まで……疑うの……？｜{x}まで……疑うのか……？｜{x}まで……疑うんですか……？」|{a}は俯いたまま、声を詰まらせた。「……{x}にだけは、そんな目で見られたくなかった｜＝｜……{x}にだけは、そんな目で見られたくなかったです」|{a}は{x}の服の裾を握ったまま、黙って首を振った。肩が小さく震えていた。')},
flirt:{label:'距離を詰める',t:L('{a}は{x}の耳元に顔を寄せた。「終わったら、二人でご飯行こ。……だから、今日は私を残して？｜終わったら、二人で食事に行こう。……だから、今日は私を残してくれ｜終わったら、二人でご飯に行きましょう。……だから、今日は私を残してください」|{a}は{x}の指に、そっと自分の指を絡めた。「{x}なら、分かってくれるでしょ｜{x}なら、分かってくれるだろう｜{x}なら、分かってくれますよね」|{a}は{x}にだけ聞こえる声で囁いた。「{x}を最後まで守るのは、私だよ｜{x}を最後まで守るのは、私だ｜{x}を最後まで守るのは、私ですよ」|{a}は{x}の前髪を指で払った。「そんな怖い顔しないで。{x}の味方なんだから｜そんな怖い顔をするな。私は{x}の味方だ｜そんな怖い顔しないでください。{x}の味方なんですから」')},
pride:{label:'信頼を盾にする',t:L('{a}は{x}をまっすぐ見た。「{x}。私が{x}を裏切ったこと、一度でもあったか｜＝｜{x}。私が{x}を裏切ったことが、一度でもありましたか」|{a}「{x}、私を信じろ。今まで通りでいい｜＝｜{x}、私を信じてください。今まで通りでいいんです」|{a}は腕を組んだ。「他の誰に疑われても構わない。だが{x}だけは、分かっているはずだ｜＝｜他の誰に疑われても構いません。でも{x}だけは、分かっているはずです」|{a}は{x}の肩に手を置いた。「長い付き合いだろう。……任せろ｜＝｜長い付き合いでしょう。……任せてください」')}
};
var OK=L('{x}の表情がゆるんだ。「……うん。分かった｜……ああ。分かった｜……はい。分かりました」|{x}は小さく頷いた。「{a}がそう言うなら、信じる｜＝｜{a}がそう言うなら、信じます」|{x}は少し迷ってから、{a}の手を握り返した。|{x}「……ずるいなあ。そんな顔されたら、疑えないよ｜……ずるいな。そんな顔をされたら、疑えない｜……ずるいですね。そんな顔をされたら、疑えません」|{x}はため息をついた。「分かったよ。今日は{a}には入れない｜分かった。今日は{a}には入れない｜分かりました。今日は{a}には入れません」');
var NG=L('{x}はそっと手を離した。「……ごめん。それとこれとは別｜……すまない。それとこれとは別だ｜……すみません。それとこれとは別です」|{x}は目を細めた。「なんか、あざとくない？｜何だか、あざとくないか？｜何だか、あざとくないですか？」|{x}は首を振った。「好きだからこそ、ちゃんと見たいんだ｜＝｜好きだからこそ、ちゃんと見たいんです」|{x}の表情が硬くなった。「……今の、誰にでも同じこと言ってない？｜……今のは、誰にでも同じことを言っていないか？｜……今の、誰にでも同じことを言っていませんか？」|まわりの視線が冷えた。好意につけこむようなやり方は、かえって人狼らしく見えた。');
var VOTE_PROTECT=L('{a}は{x}の名前を書きかけて、手を止めた。そして、{y}の名前を書いた。|{a}は{x}の方を見られなかった。「……{x}には、入れられない｜＝｜……{x}には、入れられません」|{a}は迷った末に、{x}ではなく{y}に入れた。|{a}は{x}の名前を書けなかった。「理屈では{x}なのに……無理だ｜＝｜理屈では{x}なのに……無理です」――{a}は{y}に入れた。');
var VOTE_MOOD=L('{a}は、なんとなく{y}の方が好きになれなかった。|{a}は少し迷って、{x}ではなく{y}に入れた。「……なんか、{y}の方が気になる｜……何だか、{y}の方が気になる｜……何だか、{y}の方が気になります」|{a}「{x}って感じじゃないんだよね。{y}にする｜{x}という感じではない。{y}にする｜{x}って感じじゃないんですよね。{y}にします」|{a}は{x}の顔を見て、思い直した。そして{y}の名前を書いた。');
var VOTE_GRUDGE=L('{a}は迷わず{y}の名前を書いた。理由は、自分でもよく分かっていた。|{a}「推理？　……{y}が気に食わない。それだけ｜推理？　……{y}が気に食わない。それだけだ｜推理ですか？　……{y}が気に食わないんです。それだけです」|{a}は{y}を見て、ふっと鼻で笑った。そして{y}に入れた。|{a}は前から、{y}とは合わないと思っていた。');
function setup(S,P,input,rng){
var ties=input.ties||[];
P.forEach(function(p){p.aff={};p.tieW={};});
P.forEach(function(p){
P.forEach(function(q){
if(p===q)return;
var w=0,has=0,lab=[];
ties.forEach(function(t){
if(!((t.a===p.i&&t.b===q.i)||(t.a===q.i&&t.b===p.i)))return;
var x=t.type==='crush'?(t.a===p.i?0.9:0.15):t.type==='ex'?rng()*1-0.4:TW[t.type]!=null?TW[t.type]:0.1;
if(Math.abs(x)>Math.abs(w))w=x;
has=1;lab.push(LBL(t.type));
});
p.tieW[q.i]=has?w:0;p.tieL=p.tieL||{};p.tieL[q.i]=lab.join('・');
p.aff[q.i]=clamp(w+(q.like-0.5)*0.5+(rng()-0.5)*0.5,-1,1);
if(p.sus[q.i]!=null)p.sus[q.i]=clamp(p.sus[q.i]-p.aff[q.i]*14,0,100);
});
p.superLogic=p.acc>=0.85&&p.tr.a>=0.55;
p.cnt.emo=0;p.cnt.appeal=0;p.cnt.appealOK=0;
});
S.emoLog=[];
}
function affTxt(v){return(v>=0?'+':'')+Math.round(v*100);}
function appeal(S,p,others,c){
var rng=S.rng;
var heat=others.length?others.reduce(function(s0,q){return s0+(q.sus[p.i]||50);},0)/others.length:50;
var need=heat>50||c.isW(p);
if(!need)return false;
var cands=others.filter(function(q){return(q.aff[p.i]||0)>0.3&& !(c.isW(q)&&c.isW(p));}).sort(function(a,b){return(b.aff[p.i]+(b.tieW[p.i]||0))-(a.aff[p.i]+(a.tieW[p.i]||0));});
var q=cands[0];
if(!q||p.appealed===c.day)return false;
if(rng()>0.3+Math.max(0,p.tieW[q.i]||0)*0.3+(heat-50)/100)return false;
p.appealed=c.day;
var t=p.tr,per=p.persona;
var w={
amae:t.fc*0.6+t.ac*0.4+(per==='free'||per==='tsun'?0.4:0),
plead:t.np*0.6+t.impulse*0.3+(per==='gentle'||per==='devoted'?0.4:0),
cry:t.ac*0.7+(per==='shy'||per==='devoted'?0.5:0)-t.cp*0.3,
flirt:(t.fc*0.4+p.bold*0.4)*(/恋人|番|友達以上|セフレ|片想い|元恋人/.test(q.tieL[p.i]||p.tieL[q.i]||'')?1.6:0.6),
pride:t.cp*0.6+t.a*0.2+(per==='proud'||per==='stern'||per==='cool'||per==='polite'?0.5:0)
};
if(HK.ngPair(p,q))delete w.flirt;
var kind=HK.weighted(rng,Object.keys(w),function(k){return Math.pow(Math.max(0.02,w[k]),2);});
var chance=clamp(p.act*0.6+q.aff[p.i]*0.3-q.acc*0.25+(c.isW(p)?0:0.1)+0.1,0.05,0.9);
var ok=rng()<chance,m={a:p.name,x:q.name};
var text=fill(c.pk(APPEAL[kind].t),m)+fill(c.pk(ok?OK:NG),m);
p.cnt.appeal++;
if(ok){
p.cnt.appealOK++;
if(!c.isW(q))q.sus[p.i]=clamp((q.sus[p.i]||50)-25,0,100);
q.aff[p.i]=clamp(q.aff[p.i]+0.1,-1,1);q.spare=q.spare||{};q.spare[p.i]=c.day;
others.forEach(function(o){if(o!==q&& !c.isW(o))o.sus[p.i]=clamp((o.sus[p.i]||50)-3+(o.acc>0.7?6:0),0,100);});
}else{
if(!c.isW(q))q.sus[p.i]=clamp((q.sus[p.i]||50)+10,0,100);
others.forEach(function(o){if(o!==q)c.bump(o,p,4+o.acc*4);});
}
c.say({actors:[p.i,q.i],tag:'好意',text:text,why:'好意モード：'+p.name+'は'+q.name+'に好かれている（好感度 '+affTxt(q.aff[p.i])+(q.tieL[p.i]?'・'+q.tieL[p.i]:'')+'）。「'+APPEAL[kind].label+'」は性格から。成功率 '+Math.round(chance*100)+'％は嘘の技能（演技力 '+Math.round(p.act*100)+'）次第'+(c.isW(p)?'。……'+p.name+'は人狼だ':'')+'――'+(ok?'通った':'通らなかった')});
return true;
}
function vote(S,p,others,base,wolfSide){
var rng=S.rng;
if(!base|| !others.length)return base;
var tieMax=others.reduce(function(s0,q){return Math.max(s0,Math.abs(p.tieW[q.i]||0));},0);
var emo=p.superLogic?0.06+tieMax*0.22:clamp(0.5+(0.6-p.acc)*0.45+p.tr.np*0.08+p.tr.fc*0.06-p.tr.a*0.12,0.2,0.85);
if(Math.abs(p.aff[base.i]||0)>0.45)emo+=0.15;
emo+=(rng()-0.5)*0.2;
if(rng()>emo)return base;
var spared=p.spare&&p.spare[base.i]!=null;
p.cnt.emo++;
var pool=others.filter(function(q){return(p.aff[q.i]||0)<0.35&& !(p.spare&&p.spare[q.i]!=null)&& !(wolfSide&&q.role==='wolf');});
if(!pool.length)return base;
var to=pool.map(function(q){return{q:q,v: -(p.aff[q.i]||0)*80+(p.sus[q.i]||50)*0.3+rng()*18};}).sort(function(a,b){return b.v-a.v;})[0].q;
if(to===base)return base;
var why=(p.aff[base.i]||0)>0.35||spared?'protect':(p.aff[to.i]||0)< -0.2?'grudge':'mood';
log(S,p,base,to,why);
return to;
}
function log(S,p,base,to,why){S.emoLog.push({p:p,base:base,to:to,why:why});}
function flush(S,say,pk){
var l=S.emoLog;S.emoLog=[];
if(!l.length)return;
var full=l.slice(0,3),rest=l.slice(3);
full.forEach(function(e){
var m={a:e.p.name,x:e.base.name,y:e.to.name};
say({actors:[e.p.i,e.to.i],tag:'感情票',text:fill(pk(e.why==='protect'?VOTE_PROTECT:e.why==='mood'?VOTE_MOOD:VOTE_GRUDGE),m),why:'好意モード：論理なら'+e.base.name+'だったが、'+(e.why==='protect'?e.base.name+'への好意（'+affTxt(e.p.aff[e.base.i])+(e.p.tieL[e.base.i]?'・'+e.p.tieL[e.base.i]:'')+'）'+(e.p.spare&&e.p.spare[e.base.i]!=null?'と、訴えに心を動かされて':'で')+'外した':e.why==='mood'?'好感度の差（'+e.base.name+' '+affTxt(e.p.aff[e.base.i])+'／'+e.to.name+' '+affTxt(e.p.aff[e.to.i])+'）で'+e.to.name+'にした':e.to.name+'への嫌悪（'+affTxt(e.p.aff[e.to.i])+(e.p.tieL[e.to.i]?'・'+e.p.tieL[e.to.i]:'')+'）で入れた')+(e.p.superLogic?'（論理的な人だが、関係とランダムで揺れた）':'')});
});
if(rest.length)say({kind:'phase',actors:rest.map(function(e){return e.p.i;}),tag:'感情票',text:'ほかに、'+rest.map(function(e){return e.p.name+'→'+e.to.name;}).join('、')+'も、好き嫌いで票を入れた。'});
}
HK.JinroLove={setup:setup,appeal:appeal,vote:vote,flush:flush};
})();
});
;
/* ==== js/obsess-story.js ==== */
HK.Load.def(256,'js/obsess-story.js',function(){
(function(){
'use strict';
var HK=window.HK,O=HK.Obsess;
if(!O|| !O.TEXT)return;
var clamp=HK.clamp;
var LOVE_T={crush:1,lover:1,almost:1,fwb:1,mate:1,fated:1,yan:1};
function ties(S,a,b){return(S.ties||[]).filter(function(t){return(t.a===a.i&&t.b===b.i)||(t.a===b.i&&t.b===a.i);});}
function yanT(S,a,b){return ties(S,a,b).filter(function(t){return t.type==='yan'&&t.a===a.i;})[0]||null;}
function loveT(S,a,b){return ties(S,a,b).some(function(t){return LOVE_T[t.type]&&(!(t.type==='crush'||t.type==='yan')||t.a===a.i);});}
function blocked(S,a,b){
if(!a|| !b||a===b)return true;
var L0=ties(S,a,b);
if(L0.some(function(t){return HK.TIES[t.type]&&HK.TIES[t.type].noObsess;}))return true;
if(L0.some(function(t){var D=HK.TIES[t.type];return D&&D.family&& !D.loveOK&& !(HK.tieFamLove&&HK.tieFamLove(t));}))return true;
if(HK.Pos&&HK.Pos.clash&&HK.Pos.clash(a,b))return true;
if(HK.canLove&& !HK.canLove(a,b)&& !yanT(S,a,b))return true;
return false;
}
function map(S){
if(S.obs)return S.obs;
var m=S.obs={};
(S.ties||[]).forEach(function(t){
if(t.type!=='yan')return;
m[t.a+'>'+t.b]={lv:55+(t.cold==='mutual'?8:t.cold==='hate'?6:0),seen:2,at: -9,cold:t.cold||''};
});
return m;
}
function st(S,a,b){var m=map(S),k=a.i+'>'+b.i;return m[k]||(m[k]={lv:0,seen:0,at: -9,cold:''});}
O.storyLevel=function(S,a,b){return blocked(S,a,b)?0:(map(S)[a.i+'>'+b.i]||{}).lv||0;};
O.storyBlocked=blocked;
function rival(S,a,b,live){return live.filter(function(c){return c!==a&&c!==b&&(loveT(S,c,b)||loveT(S,b,c));})[0]||null;}
function alive(p){return p&&p.alive!==false&& !p.out&& !p.fallen;}
function fill(t,a,b,c){var w=(O.PACK&&O.PACK[curId]&&typeof O.PACK[curId].where==='string'&&O.PACK[curId].where)||'誰も来ない部屋';return String(t).replace(/\{where\}/g,w).replace(/\{a\}/g,a.name).replace(/\{b\}/g,b.name).replace(/\{c\}/g,c?c.name:'');}
var curId='';
function pick(S,arr,noC){
var l=(arr||[]).filter(function(x){return!noC||x.indexOf('{c}')<0;});
return l.length?l[S.rng.int(l.length)]:'';
}
function T(S,key,noC,pack){
var own=pack&&pack[key],base=O.TEXT[key];
var l=own&&own.length&&(!base||S.rng()<0.6)?own:base;
return pick(S,l,noC)||pick(S,base,noC);
}
function stance(S,b,a,s){
if(s.cold)return s.cold;
if(loveT(S,b,a))return'mutual';
return['unaware','afraid','accept'][(a.i+b.i+(s.n||0))%3];
}
var REL=['夜が明けるころ、{a}は黙って鍵を開けた。{b}が出ていくのを、{a}は追わなかった。','{b}が何度も名前を呼ぶと、{a}はやっと我に返り、震える手で扉を開けた。{a}「……ごめん｜……すまない｜……ごめんなさい」','{a}は{b}を抱きしめたまま朝を迎え、それから何事もなかったように、{b}を皆のもとへ帰した。'];
var REL_S=['しばらくして、{a}はうつむいたまま道を空けた。{a}「……ごめん｜……すまない｜……ごめんなさい」','{b}が手を握り返すと、{a}はようやく肩の力を抜いた。'];
O.storyTick=function(S,live,opt){
opt=opt||{};
var rng=S.rng,pack=opt.pack||null,pace=(opt.pace||1)*HK.Dark.pace(S),safe= !!HK.SAFE_ON;
curId=(S.scen&&S.scen.id)||opt.id||'';
live=(live||[]).filter(alive);
if(live.length<2)return null;
var stepNo=S.log?S.log.length:0;
live.forEach(function(a){
live.forEach(function(b){
if(a===b|| !loveT(S,a,b)||blocked(S,a,b))return;
if(!rival(S,a,b,live)&& !yanT(S,a,b))return;
var s=st(S,a,b),nv=clamp(s.lv+(0.6+(a.tr.jealous||0.4)*3)*pace*(yanT(S,a,b)?0.6:1),0,100);
if(!yanT(S,a,b)&&nv>(O.NAT_CAP||34)){
if(s.surge==null)s.surge=(a.tr.jealous||0)>=0.7&&rng()<(O.SURGE_P||0.3)*HK.Dark.f(S,'cage');
if(!s.surge)nv=Math.max(s.lv,Math.min(nv,O.NAT_CAP||34));
}
s.lv=nv;
});
});
if(rng()>(opt.rate||0.15))return null;
var cand=[];
live.forEach(function(a){live.forEach(function(b){if(a!==b&& !blocked(S,a,b)){var s=map(S)[a.i+'>'+b.i];if(s&&s.lv>=35)cand.push([a,b,s]);}});});
if(!cand.length)return null;
var hit=HK.weighted(rng,cand,function(x){return x[2].lv;}),a=hit[0],b=hit[1],s=hit[2];
var c=rival(S,a,b,live),ty=O.type(a,S,b),stg=O.stage(s.lv),key,text,cat='conflict',mag=14,tag='執着';
s.n=(s.n||0)+1;
var why=a.name+'の'+b.name+'への執着（'+Math.round(s.lv)+'・'+O.TYPE_NAME[ty]+'型）';
if(!s.seen){
s.seen=1;
text=fill(T(S,'seed',!c,pack),a,b,c);
return{actors:c?[a,b,c]:[a,b],tag:'執着の芽生え',text:(opt.place||'')+text,why:a.name+'の嫉妬・執着（'+Math.round((a.tr.jealous||0)*100)+'）。'+(c?b.name+'と'+c.name+'の近さに、':'')+'想いが執着に変わった',mag:20,cat:'conflict'};
}
if(s.n%3===0){
var sn=stance(S,b,a,s);
key='r_'+sn;
text=fill(T(S,key,true,pack),a,b,null);
s.lv=clamp(s.lv+(sn==='accept'? -4:sn==='mutual'?4:sn==='confused'?3:6),0,100);
return{actors:[b,a],tag:'執着',text:(opt.place||'')+text,why:b.name+'の気持ち（'+{unaware:'気づいていない',afraid:'怖がっている',hate:'嫌っている',confused:'困惑している',accept:'受け入れている',mutual:'共依存'}[sn]+'）と'+a.name+'の執着（'+Math.round(s.lv)+'）',mag:12,cat:sn==='accept'||sn==='mutual'?'romance':'conflict'};
}
if((stg>=3||(stg>=2&&s.lv>=70&&HK.Dark.on(S)==='dark'))&& !s.climax&& !HK.Dark.skip(S,'cage')){
s.climax=1;
var opts=[['cage',2],['harm',c?1.5:0],['shinju',ty==='depend'?2:0.8]].filter(function(o){return o[1]>0;});
var k=HK.weighted(rng,opts,function(o){return o[1];})[0];
if(k==='cage')text=fill(T(S,safe?'cage_s':'cage',true,pack),a,b,null)+fill(pick(S,safe?REL_S:REL),a,b,null);
else if(k==='harm')text=fill(T(S,'harm_s',false,pack),a,b,c);
else text=fill(T(S,'shinju_s',true,pack),a,b,null);
s.lv=clamp(s.lv-15,0,100);
return{actors:k==='harm'?[a,b,c]:[a,b],tag:'執着の暴走',text:(opt.place||'')+text,why:why+'。執着が暴走した（この箱庭では、命に関わるところまではいかない）',mag:30,kind:'climax',cat:'conflict'};
}
key=stg>=2?ty+'2':ty;
if(key==='purge2'&& !c)key='bind2';
text=fill(T(S,key,!c,pack),a,b,c);
if(!text)return null;
s.lv=clamp(s.lv+3,0,100);
return{actors:c&&text.indexOf(c.name)>=0?[a,b,c]:[a,b],tag:tag,text:(opt.place||'')+text,why:why,mag:10+stg*6,cat:stg>=2?'conflict':'romance'};
};
O.storyNote=function(S,a,b){
var s=map(S)[a.i+'>'+b.i];
if(!s||s.lv<60||blocked(S,a,b))return'';
var back=map(S)[b.i+'>'+a.i];
return back&&back.lv>=60?'共依存':'執着（'+a.name+'→'+b.name+'）';
};
})();
});
;
/* ==== js/jashin-fx-b.js ==== */
HK.Load.def(277,'js/jashin-fx-b.js',function(){
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
HK.Load.def(278,'js/jashin-place.js',function(){
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
var lo=HK.Pos?HK.Pos.order(lv[0],lv[1],[lv[0],lv[1]]):lv,x=lo[0],y=lo[1],f=HK.Pos&& !HK.Pos.okSex(x,y)?null:r18(S,x,y);
var head=x.name+'の掌が、熱く脈打った。'+x.name+'は'+y.name+'の腕を掴んで引き寄せた。'+JS.placeLine(x,'YGO_LUST',y);
var body=f?f(S,'lust',x,y):x.name+'は'+y.name+'を書架に押しつけ、貪るように唇を重ねた。'+y.name+'も、拒まなかった。掌の口さまが、二人の欲を、根こそぎ引きずり出していた。仲間に肩を揺さぶられて、二人はようやく我に返った。';
ST.key(S,ST.say(S,{actors:[x,y],tag:'欲情',kind:'climax',text:head+body,why:'恋人どうし。掌の口さまが、二人の欲を煽った――封印の儀が遅れた',mag:38}),x.name+'と'+y.name+'が欲に呑まれた');
edge(S,x,y,'欲に呑まれた','love');
return{bonus: -0.05};
},
shub:function(S,live){
var lv=pairs(S,live,LOVEISH)[0];
if(!lv)return null;
var lo=HK.Pos?HK.Pos.order(lv[0],lv[1],[lv[0],lv[1]]):lv,x=lo[0],y=lo[1],f=HK.Pos&& !HK.Pos.okSex(x,y)?null:r18(S,x,y);
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
/* ==== js/jinro-data.js ==== */
HK.Load.def(279,'js/jinro-data.js',function(){
(function(){
'use strict';
var HK=window.HK;
function L(s){return s.split('|');}
var J=HK.JinroText={};
J.open=L('{a}「ちょっといい？|{a}「整理させて。|{a}は手元のメモをめくった。「|{a}「さっきから気になってたんだけど、|{a}は少し考えてから口を開いた。「|{a}「言いにくいけど、言うね。|{a}「みんな、聞いて。|{a}は{x}のほうを向いた。「|{a}「私の考えを言う。|{a}「確認なんだけど、|{a}は指を折りながら話した。「|{a}「今のうちに言っておく。|{a}は首をかしげた。「|{a}「結論から言うと、|{a}は静かに言った。「|{a}「ひとつ引っかかってる。');
J.reason={
vote:L('昨日の投票、{x}だけが流れと違うところに入れてる。|{x}の投票先、毎回いちばん安全なところを選んでる気がする。|{x}は投票の直前で票先を変えた。あれ、何を見て変えたの？|{x}と{y}の票が、二日続けて揃ってる。偶然にしては出来すぎ。|吊られた人に票を入れてないの、{x}だけなんだよね。'),
speech:L('{x}の発言、昨日と今日で言ってることが逆になってる。|{x}は「誰でもいい」って言ったのに、急に一人に絞った。理由が見えない。|{x}の推理、結論ありきで後から理由をつけてる感じがする。|{x}、具体的な名前を一度も出してないよね。|{x}は質問されると、質問で返してる。'),
co:L('{x}、占い師が出たときの反応が早すぎた。知ってたみたいに。|{x}はCOが出る前から、占い師の真贋に妙に詳しかった。|{x}は対抗が出た瞬間、どっちを信じるか即決した。根拠が薄い。|{x}は霊媒結果を聞いても、表情ひとつ変えなかった。'),
defend:L('{x}、{y}が疑われたときだけ、やけに庇うよね。|{x}は{y}への疑いを、話題を変えて逸らした。|{x}は自分が疑われたときより、{y}が疑われたときのほうが焦ってた。|{x}と{y}、お互いに一度も疑ってない。'),
bite:L('噛まれたのが{y}っていうのが気になる。{y}を噛んで得するのは、{x}みたいな立ち位置の人だと思う。|昨夜の噛み先、{x}を疑ってた人ばかり狙われてる。|平和な朝の前、{x}は護衛先を探るようなことを言ってた。'),
feel:L('{x}、今日はずっと口数が少ない。|{x}は笑ってるけど、目が笑ってない。|{x}は自分から話題を振らない。様子見にしても長すぎる。|{x}、さっきから全員の顔色をうかがってる。')
};
J.close=L('だから今日は{x}を推す。」|{x}の意見を聞きたい。」|俺は{x}が怪しいと思う。」|少なくとも、今日の候補に入れておきたい。」|{x}、説明してほしい。」|違ったらごめん。でも、今は{x}。」|これ、偶然だと思う？」|ほかに候補がいないなら、{x}で。」|{x}が白なら、それはそれで情報になる。」|俺の中では、{x}が一番黒い。」|反論があるなら聞く。」|今日はそこを詰めたい。」');
J.gut=L('{a}「勘だけど、{x}が怪しい！｜勘だが、{x}が怪しい！｜勘ですが、{x}が怪しいです！」|{a}は{x}を指さした。「なんか、雰囲気が人狼っぽい！｜どうも、雰囲気が人狼らしい！｜なんだか、雰囲気が人狼っぽいです！」|{a}「{x}、さっきから喋らなさすぎじゃない？｜{x}、さっきから喋らなさすぎではないか？｜{x}、さっきから喋らなさすぎではありませんか？」|{a}「理由はないけど、{x}だけは信用できない気がする｜理由はないが、{x}だけは信用できない気がする｜理由はないですが、{x}だけは信用できない気がします」|{a}「{x}の笑い方、絶対なんか隠してる！｜{x}の笑い方、絶対に何か隠している！｜{x}の笑い方、絶対に何か隠しています！」|{a}は勢いよく手を挙げた。「はい！　{x}が人狼だと思う！｜＝｜はい！　{x}が人狼だと思います！」|{a}「直感って大事だよ。{x}、目を逸らしたでしょ｜直感は大事だ。{x}、目を逸らしただろう｜直感は大事ですよ。{x}、目を逸らしましたよね」|{a}「ねえ{x}、今ちょっとドキッとしたでしょ？｜{x}、今少しドキッとしただろう？｜{x}、今ちょっとドキッとしましたよね？」|{a}「根拠？　顔！　{x}の顔が言ってる！｜根拠か？　顔だ！　{x}の顔が言っている！｜根拠ですか？　顔です！　{x}の顔が言っています！」|{a}は身を乗り出した。「{x}、正直に言いなよ。狼でしょ？｜{x}、正直に言え。狼だろう？｜{x}、正直に言ってください。狼ですよね？」|{a}「{x}の返事、ちょっと早すぎない？　怪しい！｜{x}の返事、少し早すぎないか？　怪しい！｜{x}の返事、ちょっと早すぎませんか？　怪しいです！」|{a}「なんとなくだけど、{x}から狼の匂いがする｜なんとなくだが、{x}から狼の匂いがする｜なんとなくですが、{x}から狼の匂いがします」|{a}は{x}の顔を覗き込んだ。「ほら、今の表情！｜見ろ、今の表情だ！｜ほら、今の表情を見てください！」|{a}「{x}が黙ってると、なんか落ち着かないんだよね｜{x}が黙っていると、どうも落ち着かない｜{x}が黙っていると、なんだか落ち着かないんです」|{a}「ピンと来た。{x}だ｜＝｜ピンと来ました。{x}です」|{a}「理由を聞かれても困るけど、{x}に一票！｜理由を聞かれても困るが、{x}に一票だ！｜理由を聞かれても困りますが、{x}に一票です！」|{a}は勢いで言った。「{x}吊ろう！　外れたら謝る！｜{x}を吊ろう！　外れたら謝る！｜{x}を吊りましょう！　外れたら謝ります！」|{a}「{x}、その座り方、絶対狼だって｜{x}、その座り方は絶対に狼だ｜{x}、その座り方は絶対に狼ですよ」|{a}「私の勘、当たるんだよ。{x}｜私の勘は当たるんだ。{x}だ｜私の勘、当たるんです。{x}です」|{a}「{x}って、狼のときもこんな感じだったよね？｜{x}は、狼のときもこんな感じだっただろう？｜{x}って、狼のときもこんな感じでしたよね？」');
J.follow=L('{a}は小さな声で言った。「……みんなに合わせる｜＝｜……みんなに合わせます」|{a}はおずおずと手を挙げた。「わ、私も……{x}に入れる……｜＝｜わ、私も……{x}に入れます……」|{a}は周りの様子をうかがってから、多数派に乗った。|{a}「{y}の意見に賛成。{x}でいいと思う｜{y}の意見に賛成だ。{x}でいいと思う｜{y}の意見に賛成です。{x}でいいと思います」|{a}「よく分からないけど、{y}が言うなら……｜よく分からないが、{y}が言うなら……｜よく分かりませんが、{y}が言うなら、そうします……」|{a}は迷った末に、{y}と同じ名前を挙げた。|{a}「自分では決められないから、今日は流れに乗る｜自分では決められないので、今日は流れに乗る｜自分では決められないので、今日は流れに乗ります」|{a}「{y}の推理、納得できた。{x}で｜{y}の推理には納得した。{x}に入れる｜{y}の推理、納得できました。{x}でお願いします」|{a}「……{y}の言う通りだと思う｜＝｜……{y}さんの言う通りだと思います」|{a}は少し考えて、{y}に頷いた。|{a}「自信ないけど、みんなと同じで{x}に｜自信はないが、皆と同じく{x}に入れる｜自信はないですが、皆さんと同じで{x}に入れます」|{a}は{y}の顔をうかがってから、{x}の名前を言った。|{a}「反対する理由もないし、{x}で｜反対する理由がないので、{x}に入れる｜反対する理由がないので、{x}にします」|{a}「{y}が言うなら、たぶんそうなんだろうな……｜{y}が言うなら、たぶんそうなんだろう……｜{y}が言うなら、たぶんそうなんでしょうね……」');
J.lead=L('{a}は手を叩いた。「時間がない。今日は{x}に入れよう｜＝｜時間がありません。今日は{x}に入れましょう」|{a}「反論がないなら、{x}で決めるぞ｜反論がないなら、{x}で決める｜反論がないなら、{x}で決めます」|{a}は場を仕切った。「順番に意見を言おう。最後に決を採る｜＝｜順番に意見を言いましょう。最後に決を採ります」|{a}「感情じゃなくて情報で決めよう。今日は{x}｜感情ではなく情報で決めよう。今日は{x}だ｜感情ではなく情報で決めましょう。今日は{x}です」|{a}「全員、今日の投票先を一人ずつ言って。最後にまとめる｜全員、今日の投票先を一人ずつ言え。最後にまとめる｜皆さん、今日の投票先を一人ずつ言ってください。最後にまとめます」|{a}「迷ってる時間がもったいない。{x}吊りで行く｜迷っている時間が惜しい。{x}吊りで行く｜迷っている時間がもったいないです。{x}吊りで行きます」|{a}は全員を見回した。「異論は？　……ないな。{x}だ｜異論はあるか？　……ないな。{x}だ｜異論はありますか？　……ないですね。{x}です」|{a}「明日の占い結果まで見据えて、今日は{x}を吊る｜＝｜明日の占い結果まで見据えて、今日は{x}を吊ります」|{a}「よし、整理する。候補は{x}と{y}。今日は{x}だ｜よし、整理する。候補は{x}と{y}だ。今日は{x}だ｜では、整理します。候補は{x}と{y}です。今日は{x}です」|{a}「議論は出尽くした。決を採ろう。私は{x}｜議論は出尽くした。決を採ろう。私は{x}だ｜議論は出尽くしました。決を採りましょう。私は{x}です」|{a}は立ち上がった。「迷ったら一番怪しいところ。{x}だ｜迷ったら一番怪しいところだ。{x}だ｜迷ったら一番怪しいところです。{x}です」|{a}「明日に情報を残すためにも、今日は{x}を吊る｜＝｜明日に情報を残すためにも、今日は{x}を吊ります」|{a}「全員、{x}に入れて。責任は私が取る｜全員、{x}に入れてくれ。責任は私が取る｜皆さん、{x}に入れてください。責任は私が取ります」|{a}「ここで割れるのが一番まずい。{x}に揃えよう｜＝｜ここで割れるのが一番まずいです。{x}に揃えましょう」');
J.contra=L('{a}「みんな{x}って言ってるけど、それ流されてない？｜皆{x}と言っているが、流されていないか？｜皆さん{x}と言っていますが、流されていませんか？」|{a}は腕を組んだ。「全員が同じことを言い出したら、逆に怪しい。私は{y}を見てる｜全員が同じことを言い出したら、逆に怪しい。私は{y}を見ている｜全員が同じことを言い出したら、逆に怪しいです。私は{y}を見ています」|{a}「多数派に乗るのが一番危ないんだよ。今日は{y}に入れる｜多数派に乗るのが一番危ないんだ。今日は{y}に入れる｜多数派に乗るのが一番危ないんです。今日は{y}に入れます」|{a}「{x}吊りの流れ、誰が作った？　そっちのほうが気になる｜{x}吊りの流れは誰が作った？　そちらのほうが気になる｜{x}吊りの流れ、誰が作ったんですか？　そちらのほうが気になります」|{a}「悪いけど、空気には合わせない。{y}が怪しい｜悪いが、空気には合わせない。{y}が怪しい｜すみませんが、空気には合わせません。{y}が怪しいです」');
J.defend={
proud:L('{a}「は？　俺を疑う暇があったら、もっと頭を使え」|{a}「根拠がそれだけなら話にならない」|{a}「吊りたきゃ吊れ。後で泣くのはお前らだ」|{a}「くだらない。俺の票を見てから言え」|{a}は椅子にふんぞり返った。「証拠を出せ。話はそれからだ」|{a}「俺を吊った瞬間、村の負けが決まるぞ」'),
stern:L('{a}「私は村人だ。根拠を一つずつ反論する」|{a}「その推理には穴がある。順番に説明しよう」|{a}「疑うのは自由だ。だが、論理で来てくれ」|{a}「感情で吊るのはやめよう。私の投票先を確認してほしい」|{a}「私は最初から一貫している。記録を見てくれ」|{a}「疑われる理由は理解した。だが、結論が早すぎる」'),
tsun:L('{a}「な、なんで私なのよ！　ちゃんと見てたの？」|{a}「べ、別に焦ってないし！　村人だし！」|{a}「信じなくていいわよ、どうせ後悔するんだから」|{a}「ちょっと！　なんで私ばっかり！」|{a}は頬をふくらませた。「信じてくれないなら、もう知らない！」|{a}「わ、私が狼なわけないでしょ！　顔見れば分かるでしょ！」'),
gentle:L('{a}「ごめんね、紛らわしかったかな。でも、私は村人だよ」|{a}「うーん……疑われるのは仕方ないけど、違うんだ」|{a}「落ち着いて考えてみて。私を吊っても、何も出てこないよ」|{a}「疑われても仕方ないかな。でも、明日になれば分かるよ」|{a}は穏やかに笑った。「私のことは後回しでいいよ。もっと怪しい人がいる」|{a}「大丈夫、怒ってないよ。でも、村人なんだ」'),
devoted:L('{a}「ち、違います……！　私、村のためにずっと考えてて……」|{a}「信じてもらえるように、もっと頑張ります」|{a}「私を吊るなら、せめて明日の結果を見てからにして」|{a}「私を吊ってもいいです。でも、そのあと必ず狼を見つけてください」|{a}は涙目で首を振った。「……違うんです、本当に」|{a}「みんなの役に立ちたいだけなんです」'),
cool:L('{a}「その根拠、確率で言えば三割もない」|{a}「感情論だな。データで来い」|{a}「仮に私が人狼なら、そんな分かりやすいミスはしない」|{a}「私を吊るのは、期待値で見て損だ」|{a}は淡々と言った。「否定材料を三つ挙げよう」|{a}「その推論は前提が間違っている」'),
free:L('{a}「えー！　私!?　ないない、絶対ない！」|{a}「笑っちゃう。私が人狼なら、もっと上手くやるって」|{a}「いいよ、吊っても。でも村人だからね、覚えといて」|{a}「うそでしょ、私!?　ないって！　信じて！」|{a}は笑い転げた。「私が狼だったら、もうとっくにボロ出てるよ！」|{a}「ちょっと待って、それ逆に{x}が怪しくない？」'),
shy:L('{a}「え、あ、あの……ち、違います……」|{a}は真っ赤になって俯いた。「……村人、です……」|{a}「う、うまく説明できないけど……本当に違うの……」|{a}は声を震わせた。「……わ、私じゃ、ない、です……」|{a}はスカートの裾を握りしめた。「……信じて、ください……」|{a}は小さく首を振るのが精一杯だった。'),
polite:L('{a}「恐れ入りますが、私は村人でございます」|{a}「ご指摘はもっともですが、誤解です」|{a}「冷静にご判断いただければ、分かっていただけるかと」|{a}「誠に心外でございます。私は村人です」|{a}「ご納得いただけるまで、ご説明いたします」|{a}は深々と頭を下げた。「どうか、もう一度ご検討を」')
};
J.lieBold=L('{a}は真っ直ぐ全員を見た。「私は村人。断言する｜私は村人だ。断言する｜私は村人です。断言します」|{a}は余裕の笑みを浮かべた。「疑うなら、どうぞ。何も出てこないから｜疑うなら、どうぞ。何も出てこない｜疑うなら、どうぞ。何も出てきませんから」|{a}「むしろ怪しいのは{x}のほうだと思う。理由も言えるよ｜むしろ怪しいのは{x}のほうだと思う。理由も言える｜むしろ怪しいのは{x}のほうだと思います。理由も言えますよ」|{a}「村のために言うけど、{x}の動き、ずっとおかしい｜村のために言うが、{x}の動きはずっとおかしい｜村のために言いますが、{x}の動き、ずっとおかしいです」|{a}は肩をすくめた。「私を吊って、明日後悔しても知らないよ｜私を吊って、明日後悔しても知らない｜私を吊って、明日後悔しても知りませんよ」|{a}「人狼だったら、もっとうまく隠れるって｜人狼なら、もっとうまく隠れる｜人狼だったら、もっとうまく隠れますよ」|{a}は堂々と言い切った。「私が村人であることは、明日の結果が証明する｜＝｜私が村人であることは、明日の結果が証明します」|{a}「{x}が黒なら全部説明がつく。私は{x}に入れる｜＝｜{x}が黒なら全部説明がつきます。私は{x}に入れます」|{a}「疑うのは自由だけど、村の時間を無駄にしないで｜疑うのは自由だが、村の時間を無駄にするな｜疑うのは自由ですが、村の時間を無駄にしないでください」|{a}は落ち着き払って水を飲んだ。「私の発言、全部見返してみて｜私の発言を、全部見返してみろ｜私の発言、全部見返してみてください」|{a}「{x}の推理、穴だらけだよ。指摘しようか？｜{x}の推理は穴だらけだ。指摘しようか？｜{x}の推理、穴だらけですよ。指摘しましょうか？」|{a}は微笑んだ。「人狼がこんなに堂々としてると思う？｜人狼がこんなに堂々としていると思うか？｜人狼がこんなに堂々としていると思いますか？」|{a}「私は明日も生きて、{x}の黒を証明する｜＝｜私は明日も生きて、{x}の黒を証明します」|{a}「いいよ、私を吊っても。でも次は{x}を吊ってね｜いいだろう、私を吊っても。だが次は{x}を吊れ｜いいですよ、私を吊っても。でも次は{x}を吊ってください」|{a}「村目線で言わせてもらうと、{x}の動きが一番狼っぽい｜村目線で言わせてもらえば、{x}の動きが一番狼らしい｜村目線で言わせてもらうと、{x}の動きが一番狼っぽいです」|{a}は肩をすくめた。「根拠が薄いのは{x}のほうだよ｜根拠が薄いのは{x}のほうだ｜根拠が薄いのは{x}のほうですよ」|{a}「私が狼なら、今ここで{x}を庇ってる｜私が狼なら、今ここで{x}を庇っている｜私が狼なら、今ここで{x}を庇っています」|{a}は一人ずつ目を合わせた。「私を信じて。後悔はさせない｜私を信じろ。後悔はさせない｜私を信じてください。後悔はさせません」');
J.lieShaky=L('{a}の声が、ほんの少しだけ上ずった。「わ、私は村人だよ｜わ、私は村人だ｜わ、私は村人です」|{a}は質問に答えるまで、一瞬だけ間が空いた。|{a}は誰とも目を合わせずに言った。「……{x}が怪しいと思う｜＝｜……{x}が怪しいと思います」|{a}「え、えっと……昨日は、その……」|{a}は笑ってごまかした。「そ、そんなことより{x}でしょ｜そ、そんなことより{x}だろう｜そ、そんなことより{x}ですよ」|{a}はグラスの水を一気に飲んでから、話し始めた。|{a}は指先で机をとんとんと叩き続けた。|{a}「わ、私じゃない……と、思う……いや、違う！｜わ、私ではない……と、思う……いや、違う！｜わ、私じゃありません……と、思います……いや、違います！」|{a}は質問されて、答える前に笑ってしまった。|{a}「え？　あ、うん、そう、そうだよね｜え？　あ、ああ、そう、そうだな｜え？　あ、はい、そう、そうですよね」|{a}は話しながら、何度も髪を触った。|{a}の返事は、少しだけ長すぎた。');
J.break=L('{a}「……あれ？　昨日、誰に入れたんだっけ｜……あれ？　昨日、誰に入れたんだったか｜……あれ？　昨日、誰に入れたんでしたっけ」|{a}は言いかけて止まった。「待って、さっきと言ってること逆だ｜待て、さっきと言っていることが逆だ｜待ってください、さっきと言っていることが逆です」|{a}「{x}が白で、{y}も白だから……あれ、そしたら狼いなくない？｜{x}が白で、{y}も白だから……あれ、それなら狼はいないのではないか？｜{x}が白で、{y}も白だから……あれ、それだと狼がいなくなりませんか？」|{a}は自分のメモを見て固まった。「名前、書き間違えてた……｜名前を書き間違えていた……｜名前、書き間違えていました……」|{a}「占い結果が……あれ、どっちがどっちに黒出したんだっけ｜占い結果が……あれ、どちらがどちらに黒を出したんだったか｜占い結果が……あれ、どちらがどちらに黒を出したんでしたっけ」|{a}「つまり{x}が怪しい、のは……さっき否定したんだった｜＝｜つまり{x}が怪しい、のは……さっき否定したんでした」|{a}は推理を組み立てている途中で、前提を一つ忘れていたことに気づいた。');
J.breakWolf=L('{a}は口を滑らせた。「{y}が噛まれるのは分かってたし……あ、いや、予想してたって意味｜{y}が噛まれるのは分かっていた……あ、いや、予想していたという意味だ｜{y}が噛まれるのは分かっていましたし……あ、いえ、予想していたという意味です」|{a}「昨日の夜の……じゃなくて、昨日の話だけど｜昨日の夜の……ではなく、昨日の話だが｜昨日の夜の……ではなくて、昨日の話ですけど」|{a}は偽の占い結果の順番を言い間違えた。|{a}は、まだ誰も言っていない情報を口にしてしまった。');
J.rude=L('{a}「そんなことも分からないの？｜そんなことも分からないのか？｜そんなことも分からないんですか？」――場の空気が冷えた。|{a}は{x}の推理を鼻で笑った。|{a}「いちいち説明させないで｜いちいち説明させるな｜いちいち説明させないでください」|{a}「黙ってて。考えてるから｜黙っていろ。考えている｜黙っていてください。考えていますから」|{a}は{x}の話の途中で、ため息をついた。|{a}「で？　結論は？｜で？　結論は何だ？｜で？　結論は何ですか？」');
J.rudeReact=L('{x}は小声で言った。「……そういう言い方するから疑われるんだよ｜……そういう言い方をするから疑われるんだ｜……そういう言い方をするから疑われるんですよ」|{x}は眉をひそめた。「感じ悪いな。それ、狼ムーブじゃない？｜感じが悪いな。それは狼ムーブではないか？｜感じが悪いですね。それ、狼ムーブじゃないですか？」|{x}「ちょっと、言い方｜おい、言い方を考えろ｜ちょっと、言い方を考えてください」|{x}は{a}をじっと見た。「なんでそんなに焦ってるの｜なぜそんなに焦っている？｜どうしてそんなに焦っているんですか」');
J.ally=L('{a}は{x}に目配せした。「私は{x}を信じる。今日は二人で同じところに入れよう｜＝｜私は{x}を信じます。今日は二人で同じところに入れましょう」|{a}「{x}とは考えが合う。白同士、協力しよう｜＝｜{x}とは考えが合います。白同士、協力しましょう」|{a}は{x}の推理に乗った。「{x}の言う通りだと思う。一緒に詰めよう｜＝｜{x}の言う通りだと思います。一緒に詰めましょう」|{a}と{x}は、互いの推理を突き合わせて頷いた。|{a}「少なくとも{x}は村だと思ってる。だから{x}の意見を軸にする｜少なくとも{x}は村だと思っている。だから{x}の意見を軸にする｜少なくとも{x}は村だと思っています。だから{x}の意見を軸にします」|{a}は{x}の隣に座り直した。「ここからは協力しよう｜＝｜ここからは協力しましょう」');
J.betray=L('{a}は{x}の目を見られなかった。「……ごめん。今日は{x}に入れる｜……すまない。今日は{x}に入れる｜……ごめんなさい。今日は{x}に入れます」|{a}「信じてたけど、もう庇えない｜信じていたが、もう庇えない｜信じていましたが、もう庇えません」|{a}は昨日まで組んでいた{x}を、真っ先に名指しした。|{a}「{x}、昨日の発言で分からなくなった。悪いけど｜{x}、昨日の発言で分からなくなった。悪いが｜{x}、昨日の発言で分からなくなりました。すみません」|{a}は{x}から視線を外した。「状況が変わった。今日は{x}だ｜＝｜状況が変わりました。今日は{x}です」');
J.betrayed=L('{x}は呆然とした。「……え、{a}まで？｜……え、{a}までか？｜……え、{a}までですか？」|{x}は唇を噛んだ。「信じてたのに｜信じていたのに｜信じていましたのに」|{x}は笑った。乾いた笑いだった。「そっか。そうなるよね｜そうか。そうなるだろうな｜そうですか。そうなりますよね」|{x}「{a}、本気で言ってる？｜{a}、本気で言っているのか？｜{a}、本気で言っているんですか？」');
J.bus=L('{a}は迷わず{x}を指さした。「{x}が怪しい。今日は{x}だ｜＝｜{x}が怪しいです。今日は{x}です」|{a}は冷たく言った。「{x}の発言、全部辻褄が合わない｜{x}の発言は、全部辻褄が合わない｜{x}の発言、全部辻褄が合いません」|{a}「庇う理由がない。{x}に入れる｜＝｜庇う理由がありません。{x}に入れます」|{a}は誰よりも先に、{x}への投票を宣言した。');
J.cover=L('{a}「{x}は違うと思う。むしろ{y}が怪しい｜＝｜{x}は違うと思います。むしろ{y}が怪しいです」|{a}は{x}への疑いを、別の話題で上書きした。|{a}「{x}を吊るのは早すぎる。情報が足りない｜＝｜{x}を吊るのは早すぎます。情報が足りません」|{a}「{x}はずっと村目線で喋ってるよ｜{x}はずっと村目線で喋っている｜{x}はずっと村目線で喋っていますよ」');
J.seerCO=L('{a}が手を挙げた。「占い師です。{x}を占った結果――{r}」|{a}は静かに言った。「黙ってるつもりだったけど、言う。占い師。{x}は{r}」|{a}「占いCO。結果、{x}は{r}」|{a}は深呼吸してから言った。「占い師です。昨夜は{x}を占いました。{r}」|{a}「出るね。占い師。{x}――{r}」|{a}は全員の顔を見回した。「本物の占い師は私。{x}は{r}」');
J.seerRes=L('{a}「今日の占い結果。{x}は{r}｜今日の占い結果だ。{x}は{r}だ｜今日の占い結果です。{x}は{r}です」|{a}は昨夜の結果を告げた。「{x}――{r}｜{x}――{r}だ｜{x}――{r}です」|{a}「{x}を占った。{r}｜{x}を占った。{r}だ｜{x}を占いました。{r}です」|{a}「結果を言う。{x}、{r}｜結果を言う。{x}は{r}だ｜結果を言います。{x}は{r}です」|{a}は昨夜の結果を読み上げた。「{x}は{r}｜{x}は{r}だ｜{x}は{r}です」|{a}「{x}を見た。{r}だった｜＝｜{x}を見ました。{r}でした」|{a}「報告。{x}――{r}｜報告する。{x}――{r}だ｜報告します。{x}――{r}です」|{a}は{x}を見ずに言った。「{x}は{r}｜{x}は{r}だ｜{x}は{r}です」');
J.fakeCO=L('{a}も手を挙げた。「待って、占い師は私。{x}は{r}」――場がざわついた。|{a}は即座に対抗した。「本物の占い師は私だよ。{x}は{r}」|{a}「対抗します。占い師は私。{x}は{r}」|{a}は落ち着いた声で言った。「偽物が出たね。私が本物。{x}――{r}」');
J.medCO=L('{a}が口を開いた。「霊媒師です。昨日処刑された{x}は――{r}」|{a}「霊媒結果を言うね。{x}は{r}」|{a}「霊媒CO。{x}、{r}」|{a}は静かに告げた。「{x}の魂を見た。{r}」|{a}「昨夜、{x}の声を聞いた。{r}」|{a}「霊媒結果。{x}――{r}」|{a}は目を閉じて言った。「{x}は、{r}」|{a}「{x}の正体が分かった。{r}」');
J.hunterCO=L('{a}は追い詰められて、ついに言った。「……狩人。吊られるわけにはいかない｜……狩人だ。吊られるわけにはいかない｜……狩人です。吊られるわけにはいきません」|{a}「待って、狩人CO。私を吊ると護衛がいなくなる｜待て、狩人COだ。私を吊ると護衛がいなくなる｜待ってください、狩人COです。私を吊ると護衛がいなくなります」|{a}「狩人。昨夜は{x}を守った｜狩人だ。昨夜は{x}を守った｜狩人です。昨夜は{x}を守りました」');
J.hunterCounter=L('{a}が割って入った。「狩人は私だ。{x}は嘘をついてる｜狩人は私だ。{x}は嘘をついている｜狩人は私です。{x}は嘘をついています」|{a}「狩人？　おかしいな。本物の狩人はここにいる｜＝｜狩人？　おかしいですね。本物の狩人はここにいます」');
J.policy={
roller:L('{a}「占い師が二人出た以上、片方は偽物。ローラーで両方吊ろう｜占い師が二人出た以上、片方は偽物だ。ローラーで両方吊ろう｜占い師が二人出た以上、片方は偽物です。ローラーで両方吊りましょう」|{a}「真贋は判断できない。だから占い師から順に吊る｜＝｜真贋は判断できません。だから占い師から順に吊ります」|{a}「占いロラで確実に一人は狼を処理できる。今日は{x}から｜占いロラで確実に一人は狼を処理できる。今日は{x}からだ｜占いロラで確実に一人は狼を処理できます。今日は{x}からです」|{a}「どっちが本物か分からないなら、両方吊ればいい。単純な話だ｜どちらが本物か分からないなら、両方吊ればいい。単純な話だ｜どちらが本物か分からないなら、両方吊ればいいんです。単純な話です」|{a}「迷ってる余裕はない。占い師を順に処理していこう｜迷っている余裕はない。占い師を順に処理していこう｜迷っている余裕はありません。占い師を順に処理していきましょう」'),
judge:L('{a}「両方の発言を比べた。偽物は{x}だと思う｜＝｜両方の発言を比べました。偽物は{x}だと思います」|{a}「占い結果の筋を見れば分かる。{x}の結果は不自然だ｜＝｜占い結果の筋を見れば分かります。{x}の結果は不自然です」|{a}「真贋を見極めよう。私は{x}が偽物だと判断する｜＝｜真贋を見極めましょう。私は{x}が偽物だと判断します」|{a}「霊媒結果と照らし合わせれば、{x}の結果だけ噛み合わない｜＝｜霊媒結果と照らし合わせれば、{x}の結果だけ噛み合いません」|{a}「{x}は対抗が出てから急に結果を言い出した。偽物だ｜＝｜{x}は対抗が出てから急に結果を言い出しました。偽物です」'),
gray:L('{a}「占い師は吊らない。情報源は残して、グレーから吊ろう｜＝｜占い師は吊りません。情報源は残して、グレーから吊りましょう」|{a}「役職を吊るのはもったいない。今日はグレーの{x}｜役職を吊るのは惜しい。今日はグレーの{x}だ｜役職を吊るのはもったいないです。今日はグレーの{x}です」|{a}「CO者は明日の結果を見たい。今日はグレー吊りで｜CO者は明日の結果を見たい。今日はグレー吊りだ｜CO者は明日の結果を見たいです。今日はグレー吊りでいきましょう」|{a}「占い師を吊るのは最後の手段。今日はグレーを詰める｜占い師を吊るのは最後の手段だ。今日はグレーを詰める｜占い師を吊るのは最後の手段です。今日はグレーを詰めます」|{a}「CO者には明日も結果を出してもらう。今日はそれ以外から｜CO者には明日も結果を出してもらう。今日はそれ以外からだ｜CO者には明日も結果を出してもらいます。今日はそれ以外からです」')
};
J.peace=L('朝。誰も死んでいなかった。狩人の護衛が、人狼の牙を防いだ。|平和な朝だった。誰かが、誰かを守り抜いたのだ。|朝の点呼で、全員の返事が揃った。|朝になっても、席は一つも欠けていなかった。|朝。全員が、眠そうな顔で集まった。|誰も欠けていない朝に、何人かがほっと息をついた。|朝の光の中、全員の無事が確かめられた。|朝。誰かの護衛が、確かに一人の命を救った。');
J.killed=L('朝。{x}が無残な姿で見つかった。|朝になると、{x}の席が空いていた。|{x}は、朝の点呼に答えなかった。|{x}の部屋の扉が、少しだけ開いていた。|朝食のテーブルに、{x}の姿はなかった。|朝。{x}の名札だけが、テーブルに残されていた。|{x}は二度と、議論の席に戻らなかった。|朝の点呼で、{x}の名前だけが返事をしなかった。|夜のうちに、{x}は人狼の牙にかかった。|{x}の寝床は、冷たくなっていた。');
J.exec=L('投票の結果、{x}が処刑された。|{x}は票を集め、静かに席を立った。|{x}は「……分かった｜＝｜……分かりました」とだけ言って、処刑台に向かった。|開票の結果、最多票は{x}だった。|{x}の名前が読み上げられた。|{x}は肩をすくめて立ち上がった。|多数決で、{x}の処刑が決まった。|最後の一票が{x}に入り、決着がついた。|{x}は静かに目を閉じ、結果を受け入れた。');
J.lastV={
proud:L('{x}「覚えてろ。村人を吊ったこと、後悔させてやる」|{x}は振り返らなかった。「せいぜい頑張れ」|{x}「後悔しろ。俺は村人だった」'),stern:L('{x}「……私は村人だった。あとは任せる」|{x}「判断を誤ったな。だが、責めはしない」|{x}「私の分まで、正しく推理してくれ」'),tsun:L('{x}「ほら見なさい！　村人だって言ったのに！」|{x}「も、もう！　絶対後悔させてやるんだから！」|{x}「……べ、別に悔しくなんかないし」'),
gentle:L('{x}「みんな、あとは頼んだよ」|{x}は手を振った。「楽しかったよ。がんばってね」|{x}「誰も責めないよ。あとはよろしくね」'),devoted:L('{x}「役に立てなくて、ごめんなさい……」|{x}「私の死を、無駄にしないでください」|{x}は最後まで笑おうとした。「……がんばって」'),cool:L('{x}「この吊りで、少なくとも一つ情報が増えた」|{x}「私が白と分かれば、残りの計算が楽になる」|{x}「次は霊媒結果を見て、推理を組み直せ」'),
free:L('{x}「えー、ここで退場!?　まあいっか、応援してるね！」|{x}「あーあ、もっと遊びたかった！　またね！」|{x}「天国から応援してる！」'),shy:L('{x}「……み、みんな、がんばって……」|{x}は小さく頭を下げた。「……あ、ありがとう、ございました……」|{x}「……し、信じて、ほしかったな……」'),polite:L('{x}「皆さまのご武運をお祈りしております」|{x}「短い間でしたが、ありがとうございました」|{x}「どうか、皆さまで真実にたどり着いてください」')
};
J.lastW={
proud:L('{x}は鼻で笑った。「……ここまでか。だが、まだ終わってない」|{x}「……ふん。一人くらいくれてやる」|{x}は不敵に笑った。「仲間は、まだいるぞ」'),stern:L('{x}「見事だった。認めよう」|{x}「仲間の健闘を祈る」|{x}「完敗だ。よく見抜いた」'),tsun:L('{x}「ち、違……もう！　バレたなら仕方ないでしょ！」|{x}「ば、バレてないと思ってたのに！」|{x}「……覚えてなさいよ！」'),
gentle:L('{x}は困ったように笑った。「ばれちゃったか」|{x}「あはは、やっぱりバレちゃった」|{x}「ごめんね、嘘ついてて」'),devoted:L('{x}「ごめんね、みんな……仲間を、頼んだよ」|{x}「仲間のために、もう少し粘りたかった……」|{x}「……あとは、任せたからね」'),cool:L('{x}「計算違いだったな」|{x}「想定より一日早かった」|{x}「次はもっとうまくやる」'),
free:L('{x}は舌を出した。「楽しかったよ、みんな！」|{x}「ばれたー！　でも楽しかった！」|{x}「ガオー！　……なんちゃって」'),shy:L('{x}「……ご、ごめんなさい……人狼でした……」|{x}「……う、嘘ついて、ごめんなさい……」|{x}は顔を覆った。「……は、恥ずかしい……」'),polite:L('{x}「お見事でございました」|{x}「大変失礼いたしました。人狼でございました」|{x}「皆さまの慧眼に敬服いたします」')
};
J.win={
vill:L('{a}は拳を突き上げた。「やった！　{p}は村人陣営のものだ！｜＝｜やりました！　{p}は村人陣営のものです！」|{a}は胸をなで下ろした。「信じてよかった……｜＝｜信じてよかったです……」|{a}は勝ち誇った。「推理の勝利だな｜推理の勝利だ｜推理の勝利ですね」|{a}は仲間とハイタッチした。「完璧な村だった！｜＝｜完璧な村でした！」|{a}「{p}、いただき！｜{p}はいただく！｜{p}、いただきます！」|{a}「最後まで信じた甲斐があった！｜＝｜最後まで信じた甲斐がありました！」|{a}は勝者の笑みを浮かべた。「{p}、ありがたく｜{p}、ありがたくいただく｜{p}、ありがたくいただきます」|{a}「完璧な吊り筋だったね｜完璧な吊り筋だった｜完璧な吊り筋でしたね」|{a}は仲間と抱き合った。「やったー！｜やった！｜やりました！」'),
wolf:L('{a}は不敵に笑った。「最後まで、誰も気づかなかったね｜最後まで、誰も気づかなかったな｜最後まで、誰も気づきませんでしたね」|{a}は仲間の人狼とハイタッチした。「{p}、いただき｜{p}はいただく｜{p}、いただきます」|{a}は種明かしをした。「実は最初から、ずっと狼だった｜＝｜実は最初から、ずっと狼でした」|{a}「みんな、いい村だったよ。私たちのほうが上手だったけど｜皆、いい村だった。私たちのほうが上手だったが｜皆さん、いい村でした。私たちのほうが上手でしたけど」|{a}はにやりと笑った。「みんな、いい推理だったよ。半分くらいはね｜皆、いい推理だった。半分くらいはな｜皆さん、いい推理でした。半分くらいは、ですけど」|{a}「人狼陣営、完全勝利！｜人狼陣営の完全勝利だ！｜人狼陣営の完全勝利です！」|{a}は仲間の肩を叩いた。「最高の相棒だった｜＝｜最高の相棒でした」|{a}「{p}はもらったよ。ごちそうさま｜{p}はもらった。ごちそうさま｜{p}はいただきました。ごちそうさまでした」')
};
J.loseHot=L('{a}は机に突っ伏した。「{p}……！」|{a}は悔しそうに天井を仰いだ。「あそこで入れ替えてれば……！｜あそこで入れ替えていれば……！｜あそこで入れ替えていれば良かったです……！」|{a}「もう一回！　今のなし！　もう一回！｜もう一回だ！　今のはなしだ！　もう一回！｜もう一回！　今のはなしです！　もう一回お願いします！」|{a}は床に倒れ込んだ。「{p}が、遠のいていく……｜＝｜{p}が、遠のいていきます……」|{a}「{p}がぁぁ……！」|{a}は拳を握りしめた。「次は、絶対に勝つ｜＝｜次は、絶対に勝ちます」|{a}は天を仰いだ。「{p}……さようなら……」|{a}「くっそー！　あと一手だったのに！｜くそっ！　あと一手だったのに！｜悔しいです！　あと一手でしたのに！」|{a}は頭を抱えた。「あの投票、なんで入れ替えなかったんだろ……｜あの投票、なぜ入れ替えなかったんだろう……｜あの投票、どうして入れ替えなかったんでしょう……」');
J.loseCalm=L('{a}は笑って肩をすくめた。「まあ、楽しかったからいいや｜まあ、楽しかったからいい｜まあ、楽しかったからいいです」|{a}「完敗。次は負けないよ｜完敗だ。次は負けない｜完敗です。次は負けませんよ」|{a}は勝者に拍手を送った。「お見事｜見事だ｜お見事です」|{a}は笑った。「いいゲームだった。次も呼んでね｜いいゲームだった。次も呼んでくれ｜いいゲームでした。次も呼んでください」|{a}「いやあ、騙された騙された｜いや、すっかり騙された｜いやあ、すっかり騙されました」|{a}「負けたけど、推理は楽しかった｜負けたが、推理は楽しかった｜負けましたけど、推理は楽しかったです」|{a}は伸びをした。「もう一戦やる？｜もう一戦やるか？｜もう一戦やりますか？」|{a}「みんな上手いなあ｜皆、上手いな｜皆さん、上手ですね」');
J.prizeHot=L('{a}の目の色が変わった。「{p}……絶対に勝つ｜＝｜{p}……絶対に勝ちます」|{a}は身を乗り出した。「{p}って言った？　本気出す｜{p}と言ったか？　本気を出す｜{p}って言いました？　本気を出します」|{a}は腕まくりをした。「{p}のためなら、何でもする｜＝｜{p}のためなら、何でもします」|{a}「{p}がかかってるなら、話は別だ｜{p}がかかっているなら、話は別だ｜{p}がかかっているなら、話は別です」|{a}は小さくガッツポーズをした。「{p}、もらった｜{p}はもらった｜{p}、もらいました」|{a}は真顔になった。「{p}は譲れない｜＝｜{p}は譲れません」|{a}「よし。{p}のために全力で推理する｜＝｜よし。{p}のために全力で推理します」|{a}は周りを見回した。「{p}を狙ってるのは私だけじゃなさそうだね｜{p}を狙っているのは私だけではなさそうだ｜{p}を狙っているのは私だけではなさそうですね」');
})();
});
;
/* ==== js/jinro-after.js ==== */
HK.Load.def(280,'js/jinro-after.js',function(){
(function(){
'use strict';
var HK=window.HK;
function L(s){return s.split('|');}
function clamp(v,a,b){return Math.max(a,Math.min(b,v));}
function kind(p,rng){
var t=p.tr,n=function(){return(rng()-0.5)*0.16;};
var sc={fun:t.fc*0.7+t.impulse*0.5+n(),shy:t.ac*0.8+(1-t.fc)*0.3+t.caution*0.2-0.15+n(),proud:t.cp*0.6+t.aggr*0.6-0.05+n(),cool:t.cold*0.6+t.a*0.5-0.1+n(),warm:t.np*0.7+t.warmth*0.5-0.1+n()};
return Object.keys(sc).sort(function(a,b){return sc[b]-sc[a];})[0];
}
function end(t){return/[。」！？…]$/.test(t)?t:t+'。';}
var KIND_JP={fun:'ノリがいい（FC・衝動性）',shy:'恥ずかしがり（AC）',proud:'負けず嫌い（CP・攻撃性）',cool:'淡々としている（ドライさ・A）',warm:'素直（NP）'};
var PUN=[
{id:'takoyaki',label:'ロシアンたこ焼き',intro:'罰ゲームは、ロシアンたこ焼き。一皿のうち一つだけ、激辛ソースがたっぷり仕込んである。負けた{n}人が、順番に一つずつ口に運んだ。',
fun:'{a}は「当たりこい！」と叫んで一口で頬張った。――当たりだった。{a}は床を転げ回りながら、なぜか笑っていた|{a}はたこ焼きを二つ同時に口に放り込んだ。「倍賭け！」――どちらも普通のたこ焼きだった。{a}は本気で悔しがった',
shy:'{a}は、たこ焼きを箸でつまんだまま、しばらく固まっていた。意を決して口に入れると、目に涙が浮かんだ。「……からい、です……」と、消え入りそうな声で言った|{a}は、一番小さいたこ焼きを選んで、そっとかじった。セーフだった。胸をなでおろして、小さく笑った',
proud:'{a}は「こんなもん、余裕だ」と言い放って口に放り込んだ。数秒後、顔が真っ赤になった。それでも{a}は、水に手を伸ばさなかった|{a}は「次は絶対勝つからな」と勝者を睨みつけながら、たこ焼きを噛みしめた。当たりではなかったが、まだ睨んでいた',
cool:'{a}は、たこ焼きの断面をしばらく観察してから口に入れた。激辛だった。{a}は表情を変えずに飲み込み、「……想定の範囲内だ」と言って、そっと水を三杯飲んだ|{a}は無言でたこ焼きを食べた。普通のたこ焼きだった。「確率どおりだね」',
warm:'{a}は「いただきます」と手を合わせてから食べた。当たりだった。{a}は涙目になりながら「おいしい……けど、からい……！」と笑った|{a}は、ひとつ食べて「普通においしい」と嬉しそうに言った。周りから「ずるい」と声が上がった',
win:'{w}は、悶える負け組を眺めながら、普通のたこ焼きを優雅に味わっていた。|{w}はスマホを構えて、悶絶する瞬間をばっちり撮っていた。'},
{id:'senburi',label:'センブリ茶',intro:'罰ゲームは、センブリ茶の一気飲み。湯呑みから、薬草の苦い匂いが立ちのぼった。',
fun:'{a}は湯呑みを高々と掲げ、「乾杯！」と叫んで一気に飲み干した。直後、顔のパーツが全部中央に寄った|{a}は、飲む前に「実は苦いの得意なんだよね」と豪語した。飲んだあと、しばらく誰とも口をきけなかった',
shy:'{a}は、湯呑みを両手で包んで、ちびちびと飲んだ。そのたびに肩がびくっと跳ねた。最後の一口を飲み終えると、ぎゅっと目をつぶったまま、しばらく動かなかった|{a}は、鼻をつまんで飲んだ。飲み終えた{a}の目尻に、涙が光っていた',
proud:'{a}は、湯呑みを叩きつけるように置いた。「……苦くない。全然、苦くない」その声は、かすかに震えていた|{a}は、一気に飲み干して、勝者の湯呑みにも注いでやろうとした。止められた',
cool:'{a}は一口飲んで、成分を分析するように眉をひそめた。「……胃には良さそうだ」そして、本当に最後まで飲み切った|{a}は淡々と飲み干し、「苦味は慣れの問題だ」と言った。口直しの飴を、誰よりも早く口に入れていた',
warm:'{a}は「体に良さそう！」と前向きに飲み始め、二口目で後悔した顔になった。それでも最後まで飲んで、「ごちそうさまでした」と頭を下げた|{a}は、飲みながら「うわあ、苦い、苦いね！」と、なぜか嬉しそうだった',
win:'{w}は、口直しのチョコレートを、負けた人たちに一粒ずつ配ってやった。|{w}は、苦悶の表情を見ながら、甘いジュースをストローで飲んでいた。'},
{id:'kokuhaku',label:'初恋の話',intro:'罰ゲームは、初恋の話を包み隠さずすること。勝った人たちが、身を乗り出した。',
fun:'{a}は、待ってましたとばかりに語り始めた。三人目の初恋の話が始まったところで、「初恋って何人いるの」と総ツッコミを受けた|{a}は、初恋の相手の名前まで堂々と言った。誰も知らない人だったが、なぜか拍手が起きた',
shy:'{a}は、顔を真っ赤にして俯いた。「……小学校の、図書委員の……」それだけ言うと、両手で顔を覆ってしまった|{a}は、蚊の鳴くような声で話し始めた。途中で何度も「やっぱりなし」と言いかけたが、最後まで話した。場が、妙に温かくなった',
proud:'{a}は腕を組んで、「別に恥ずかしいことじゃない」と前置きしてから話した。話し終えるころには、耳まで真っ赤だった|{a}は「初恋なんてない」と言い張った。十分後、問い詰められて全部白状した',
cool:'{a}は、初恋の話を、事実関係だけ時系列で簡潔に述べた。あまりに淡々としていて、逆に皆が赤面した|{a}は「幼稚園の先生」とだけ言った。それ以上は、どれだけ聞かれても話さなかった',
warm:'{a}は、照れ笑いしながら、甘酸っぱい思い出を丁寧に話した。話し終わると、聞いていた皆がなぜか少し泣いていた|{a}は、懐かしそうに目を細めて話した。「……元気にしてるかな」と最後に呟いた',
win:'{w}は、話の途中で何度も「それで？」と身を乗り出していた。|{w}は、聞き終えると、満足げにうなずいた。「いい話だった。来年も聞かせて｜いい話だった。来年も聞かせてくれ｜いい話でした。来年も聞かせてください」'},
{id:'gag',label:'一発ギャグ',intro:'罰ゲームは、一発ギャグ。ウケるまで終われない。',
fun:'{a}は、待ってましたとばかりに立ち上がり、全力の一発ギャグを放った。一回で大爆笑だった。{a}は罰ゲームなのに、誰よりも満足そうだった|{a}は、ギャグを十連発した。九つは滑ったが、十個目で全員が崩れ落ちた',
shy:'{a}は、もじもじしながら立ち上がり、小さな声でダジャレを言った。一瞬の沈黙のあと、あまりの健気さに拍手が起きた|{a}は、顔を真っ赤にして変顔をした。その必死さに、皆が笑った。{a}はそのまま座布団に顔をうずめた',
proud:'{a}は「いいだろう、見てろ」と立ち上がった。渾身のギャグは、静寂に包まれた。{a}は無言で、もう一度同じギャグをやった。二回目で、ようやく笑いが起きた|{a}は、勝者を指さして「こいつの物まね」と言い、やたらと特徴を捉えた物まねを始めた。勝者以外が大爆笑した',
cool:'{a}は、真顔のまま、理詰めの長いギャグを披露した。最後のオチまで三分かかった。オチの瞬間、全員が時間差で笑い出した|{a}は、一言も発さずに、ただ眼鏡をずらした。それだけで、なぜかウケた',
warm:'{a}は、子どもの頃に流行ったギャグを、全力でやった。世代の違う何人かがぽかんとしたが、残りが大笑いした|{a}は、自分で言って自分で笑ってしまい、ギャグが最後まで言えなかった。その様子に、皆がつられて笑った',
win:'{w}は、腹を抱えて笑い転げていた。|{w}は、笑いをこらえて「……まだ、ウケてない｜……まだ、ウケていない｜……まだ、ウケていません」と判定した。'},
{id:'cosplay',label:'衣装で記念撮影',intro:'罰ゲームは、くじで引いた衣装に着替えて記念撮影。くじには、メイド服、着ぐるみ、バニーの耳、ランドセル……と書かれていた。',
fun:'{a}は、着ぐるみを着るなり、決めポーズを連発した。撮影係の方が先に疲れた|{a}は、メイド服でくるりと回って「おかえりなさいませ！」と言った。誰よりもノリノリだった',
shy:'{a}は、バニーの耳をつけたまま、部屋の隅で膝を抱えていた。「……撮るなら、一枚だけ……」その一枚が、一番の傑作になった|{a}は、着替え終わっても、なかなか物陰から出てこなかった。ようやく出てきたとき、皆が思わず「かわいい」と声を揃えた',
proud:'{a}は、ランドセルを背負わされて「……覚えてろ」と低い声で言った。その姿で凄まれても、まったく怖くなかった|{a}は、着ぐるみの頭だけは断固として拒否した。結果、首から上だけが本人のまま、妙に威圧感のある写真になった',
cool:'{a}は、メイド服に着替えても、いつもの無表情のままだった。その落差が、なぜか一番ウケた|{a}は、衣装の縫製の甘さを冷静に指摘しながら着た。写真の中の{a}は、真顔でピースをしていた',
warm:'{a}は、照れながらも衣装に着替え、「どう？　似合う？」と皆に見せて回った。似合っていた|{a}は、着ぐるみのまま全員と一枚ずつ記念写真を撮って回った',
win:'{w}は、撮った写真を見返しては、そのたびに吹き出していた。|{w}は「これ、待ち受けにする｜これを待ち受けにする｜これ、待ち受けにします」と宣言した。'},
{id:'sama',label:'様づけの一日',intro:'罰ゲームは、明日一日、勝った人を「様」づけで呼んで、敬語で話すこと。',
fun:'{a}は、さっそく勝者の前に膝をついた。「なんなりとお申しつけください、ご主人様！」――まだ罰ゲームは明日からだった|{a}は、張り切りすぎて、勝ってもいない人まで様づけで呼び始めた',
shy:'{a}は、勝者の名前に「様」をつけて呼ぶ練習をしたが、三回とも声が裏返った|{a}は、顔を赤くして「……よろしくお願いいたします」と、すでに敬語になっていた',
proud:'{a}は、歯を食いしばって勝者に頭を下げた。「……明日一日だけ、だからな」――その「様」の発音には、明らかに殺意がこもっていた|{a}は、「様」をつけるたびに、こめかみがぴくぴくと動いていた',
cool:'{a}は「了解した。明日の零時から二十四時間だな」と、腕時計のアラームを設定した。翌日、{a}は完璧な敬語で、勝者をとことん居心地悪くさせた|{a}は、淡々と様づけの練習をした。あまりに自然すぎて、逆に怖かった',
warm:'{a}は、「明日はよろしくね、様！」と笑った。ルールを、少しだけ勘違いしていた|{a}は、さっそく勝者にお茶を淹れてあげていた。「様づけの日って、なんか楽しいね」',
win:'{w}は、ふんぞり返って「苦しゅうない」と言ってみた。言ってから、少し照れていた。|{w}は、明日が来るのを、本気で楽しみにしていた。'},
{id:'rakugaki',label:'顔に落書き',intro:'罰ゲームは、勝った人たちに油性ペンで顔に落書きされること。ペンのキャップが、ぽん、と外された。',
fun:'{a}は、自分から目を閉じて顔を差し出した。「どうせなら、かっこよくして！」――額に大きく「肉」と書かれた|{a}は、描かれた髭を鏡で見て大喜びし、そのままコンビニに行こうとして全力で止められた',
shy:'{a}は、ぎゅっと目をつぶって、されるがままになっていた。鏡を渡されて自分の顔を見た{a}は、そのまま固まってしまった|{a}は、頬にちょこんと小さなハートを描かれただけで、耳まで真っ赤になった',
proud:'{a}は「好きにしろ」とあぐらをかいた。描かれている間、ずっと勝者の顔を覚えるように睨みつけていた|{a}は、描き終わったペンを奪い取り、勝者の手の甲に小さく「次は負かす」と書いた',
cool:'{a}は、落書きの出来を鏡で確認し、「線が歪んでいる。描き直すなら、こっちの頬を使え」と指示した|{a}は、眉毛を太く描かれても、表情一つ変えなかった。その凛々しい眉毛が、妙に似合っていた',
warm:'{a}は、くすぐったそうに笑いながら描かれていた。完成した顔を見て、自分で一番笑っていた|{a}は、鏡を見て「わあ、かわいくしてくれたんだ」と喜んだ。実際、猫の髭は可愛かった',
win:'{w}は、真剣な顔で、芸術作品のように丁寧に描き込んでいた。|{w}は、描いたあとで、それが油性ペンだったことに気づき、少しだけ申し訳なさそうな顔をした。'},
{id:'pashiri',label:'全員分の買い出し',intro:'罰ゲームは、全員分の飲み物とお菓子の買い出し。外は、ちょうど小雨が降り始めていた。',
fun:'{a}は、傘も持たずに「行ってきまーす！」と飛び出していった。両手いっぱいに、頼まれていないお菓子まで買い込んで帰ってきた|{a}は、コンビニで勝手にくじを引いて、なぜか特賞を当てて帰ってきた',
shy:'{a}は、全員の注文を丁寧にメモして、一言一句間違えずに買ってきた。おつりも、ぴったり封筒に入れて返した|{a}は、小雨の中、誰よりも早く戻ってきた。袋の中身は、少しも濡れていなかった',
proud:'{a}は、「行けばいいんだろ」と吐き捨てて出ていった。帰ってきた{a}の袋の中で、勝者の分のジュースだけが、なぜか激しく振られた炭酸だった|{a}は、勝者の分だけ、一番安いお茶にしてきた',
cool:'{a}は、最短経路を地図で確認してから出発し、きっかり十二分で戻ってきた|{a}は、注文を聞きながら「その組み合わせは合わない」と勝手に修正して買ってきた。それが、意外と好評だった',
warm:'{a}は、帰り道に見つけた温かい肉まんを、自腹で全員分買ってきた。罰ゲームなのに、一番感謝された|{a}は、「みんなの好みはだいたい分かるから」と言って、頼まれる前に全員の好物を買ってきた',
win:'{w}は、帰ってきた負け組に、そっとタオルを差し出した。|{w}は、袋の中身を確かめて「……思ってたより優秀｜……思っていたより優秀だ｜……思っていたより優秀です」と呟いた。'},
{id:'dekopin',label:'しっぺとデコピン',intro:'罰ゲームは、勝った人からのデコピン一発。勝者が、指をぱきぱきと鳴らした。',
fun:'{a}は、自分の額を差し出して「全力でどうぞ！」と叫んだ。全力のデコピンを受けて、{a}は大げさに三回転して倒れてみせた|{a}は、デコピンの直前に変顔をした。勝者が笑ってしまい、デコピンは不発に終わった',
shy:'{a}は、目をぎゅっとつぶって、前髪を上げた。ぴん、と軽い音がした。「……痛くない」と、ほっとしたように笑った|{a}は、デコピンが来る前から涙目になっていた。勝者は、そっと指先で額をつつくだけにした',
proud:'{a}は、額を差し出しながら「お前がやるときは、倍返しだ」と宣言した。デコピンを受けても、{a}は眉ひとつ動かさなかった。額だけが、赤くなっていた|{a}は、デコピンを受けた瞬間、勝者の額にも反射的にデコピンを返していた',
cool:'{a}は、「デコピンの痛みは、主に指の弾性で決まる」と解説しながら額を出した。解説が終わる前に、弾かれた|{a}は、無表情のまま受けた。数秒後、額を押さえて静かにうずくまった',
warm:'{a}は、受ける前に「優しくね？」とお願いした。勝者は、ちゃんと優しくした|{a}は、デコピンされた額をさすりながら、「なんか、ちょっと懐かしい」と笑った',
win:'{w}は、指に息を吹きかけて、念入りに狙いを定めていた。|{w}は、いざとなると手加減してしまい、「次はちゃんとやるからね｜次はちゃんとやる｜次はちゃんとやりますからね」と言い訳した。'},
{id:'poem',label:'黒歴史ポエム朗読',intro:'罰ゲームは、その場で書いたポエムを、感情を込めて朗読すること。お題は「闇」。',
fun:'{a}は、立ち上がって朗々と詠み上げた。「漆黒の翼よ、我が右腕に宿りし……」――途中から、本人がいちばん楽しそうだった|{a}は、ポエムに振り付けまでつけた。全員が笑いすぎて、朗読が三回中断した',
shy:'{a}は、紙で顔を隠しながら、震える声で読み上げた。「……闇の中でも、きみが、灯りだった……」読み終えると、部屋が妙に静かになった。誰かが、そっと拍手をした|{a}は、二行目で耐えきれなくなり、紙ごと座布団に顔を埋めた',
proud:'{a}は「芸術に恥はない」と言い切って、堂々と朗読した。内容は思いのほか本格的で、終わったとき、誰も笑えなかった|{a}は、朗読の途中で「なんで俺がこんな……」と素に戻りかけたが、最後まで読み切った。最後の一行だけ、やけに熱がこもっていた',
cool:'{a}は、韻律と押韻を完璧に整えたポエムを、抑揚なく読み上げた。完成度が高すぎて、黒歴史にならなかった|{a}は「闇とは、光の不在にすぎない」で始まり、そのまま物理学の講義になった',
warm:'{a}は、照れ笑いしながら、闇の中で迷子になった子猫のポエムを読んだ。なぜか、ちょっと泣ける話だった|{a}は、ポエムの最後を「みんな、今日はありがとう」で締めくくった。罰ゲームのはずが、拍手喝采になった',
win:'{w}は、朗読を録音していた。消すように、何度も頼まれていた。|{w}は、「来年の今日、もう一回読んでもらうから｜来年の今日、もう一回読んでもらう｜来年の今日、もう一回読んでもらいますから」と宣言した。'},
{id:'tsubo',label:'足つぼマッサージ',intro:'罰ゲームは、足つぼマット。でこぼこのマットの端から端まで、裸足で往復すること。',
fun:'{a}は、マットの上でステップを踏みながら「効いてる効いてる！」と叫んだ。三歩目からは、ほぼ悲鳴だった|{a}は、往復どころか、マットの上で反復横跳びを始めた。すぐに後悔していた',
shy:'{a}は、一歩ずつ、つま先立ちで進んだ。「い、いた……っ、いたい、です……」――それでも、最後までちゃんと往復した。戻ってきた{a}に、皆が拍手を送った|{a}は、途中で涙目になって立ち止まった。勝者の一人が、手を貸してゴールまで連れていった',
proud:'{a}は、無表情を装ってマットを踏みしめた。一歩ごとに、こめかみの血管が浮き上がった。「……全然、痛くない」|{a}は、走り抜けて往復時間の最速記録を作った。ゴールしたあと、しばらく座り込んで動かなかった',
cool:'{a}は、「この位置は胃のつぼだ。……少し、疲れているらしい」と分析しながら、ゆっくり歩いた|{a}は、痛そうな顔一つせずに往復した。ただし、戻ってきたあとの足どりは、明らかにおかしかった',
warm:'{a}は、「健康になれそう！」と前向きに歩き始め、二歩目で「健康って、痛いんだね……」と悟った|{a}は、一歩踏むたびに「いたっ」と言いながら、それでも笑っていた',
win:'{w}は、自分も試しに一歩だけ乗って、すぐに降りた。|{w}は、マットの横で、声援なのか煽りなのか分からない声をかけ続けていた。'}
];
var DUP={
sulk:'{a}は頬をふくらませて、そっぽを向いた。「{x}のうそつき！　……信じてたのに｜{x}の嘘つき！　……信じていたのに｜{x}の嘘つき！　……信じていましたのに」|{a}は{x}の袖をつかんで揺さぶった。「うそつき！　うそつきうそつき！　{x}のうそつき！」――しばらく、口をきいてくれなかった|{a}は、むすっとしたまま膝を抱えた。「……もう、{x}の言うことなんて信じない｜……もう、{x}の言うことなど信じない｜……もう、{x}の言うことなんて信じません」',
rage:'{a}は机を叩いて立ち上がった。「おい、{x}！　最後まで白いって言ってただろうが！｜おい、{x}！　最後まで白いと言っていただろう！｜ちょっと、{x}！　最後まで白いと言っていたじゃないですか！」――ゲームだと分かっていても、{a}の顔は本気で悔しそうだった|{a}は{x}を指さした。「次は、真っ先にあなたを吊るからな｜次は、真っ先にあなたを吊る｜次は、真っ先にあなたを吊りますからね」',
cry:'{a}の目に、じわりと涙が浮かんだ。「{x}だけは、本当に信じてたのに……｜{x}だけは、本当に信じていたのに……｜{x}だけは、本当に信じていたんです……」――{x}が慌ててハンカチを差し出した|{a}は俯いたまま、小さな声で言った。「……{x}が人狼なら、仕方ないか。悔しいけど｜……{x}が人狼なら、仕方ないか。悔しいが｜……{x}が人狼なら、仕方ないですね。悔しいですけど」その声は、少しだけ震えていた',
admire:'{a}は、しばらく呆然としてから、ふっと笑った。「完全に騙された。見事だよ、{x}｜完全に騙された。見事だ、{x}｜完全に騙されました。お見事です、{x}」|{a}は、感心したように腕を組んだ。「三日目のあの発言も、全部演技だったのか。……{x}、次は本気で見抜くから｜三日目のあの発言も、全部演技だったのか。……{x}、次は本気で見抜く｜三日目のあの発言も、全部演技だったんですか。……{x}、次は本気で見抜きますから」',
laugh:'{a}は、腹を抱えて笑い出した。「ずるい！　{x}、顔に出なさすぎ！｜ずるいぞ！　{x}、顔に出なさすぎだ！｜ずるいです！　{x}、顔に出なさすぎです！」|{a}は{x}の背中をばしばし叩いた。「やられたー！　いや、今回は完全に{x}の勝ちだ！｜やられた！　いや、今回は完全に{x}の勝ちだ！｜やられました！　いえ、今回は完全に{x}の勝ちです！」',
analyze:'{a}は、ゲームの記録を最初から見直し始めた。「……ここだ。{x}のこの一言で、全部ひっくり返されたんだ｜＝｜……ここです。{x}のこの一言で、全部ひっくり返されたんです」|{a}は、ぶつぶつと呟いた。「{x}が人狼なら、あの占い結果は……ああ、そういうことか｜＝｜{x}が人狼なら、あの占い結果は……ああ、そういうことですか」'
};
var DUP_W={
sorry:'{x}は、慌てて両手を合わせた。「ごめん！　ゲームだから、ゲームだから！｜すまない！　ゲームだから、ゲームだから！｜ごめんなさい！　ゲームですから、ゲームですから！」|{x}は、申し訳なさそうに頭をかいた。「騙すの、正直ちょっとつらかった｜騙すのは、正直少しつらかった｜騙すの、正直ちょっとつらかったです」',
smug:'{x}は、肩をすくめて笑った。「騙される方が悪い｜＝｜騙される方が悪いんです」|{x}は、得意げに胸を張った。「人狼は、嘘をつくゲームだからね｜人狼は、嘘をつくゲームだからな｜人狼は、嘘をつくゲームですからね」',
soothe:'{x}は、{a}の頭をぽんぽんと撫でた。「次は、ちゃんと味方になるから｜次は、ちゃんと味方になる｜次は、ちゃんと味方になりますから」|{x}は{a}の隣に座り、こっそりお菓子を一つ渡した。「……機嫌、直して？｜……機嫌を直してくれ｜……機嫌、直してくれませんか？」',
cool:'{x}は、表情を変えずに言った。「信じてくれたから、勝てた。ありがとう｜＝｜信じてくれたから、勝てました。ありがとうございます」|{x}は、静かに頷いた。「次は、もっとうまく見抜いてみせて｜次は、もっとうまく見抜いてみせろ｜次は、もっとうまく見抜いてみせてください」'
};
function dupKind(v,w,close){
var t=v.tr;
if(close>0.55&&(t.fc>0.5||t.np>0.55)&&t.cold<0.5)return'sulk';
if(t.aggr>0.58||t.cp>0.65)return'rage';
if(t.ac>0.6&&close>0.3)return'cry';
if(t.a>0.65&&t.cold>0.4)return'analyze';
if(t.fc>0.6)return'laugh';
return t.a>0.55?'admire':close>0.4?'sulk':'laugh';
}
function wolfKind(w,v,close){
var t=w.tr;
if(close>0.55&&t.np>0.5)return'soothe';
if(t.np>0.6||t.honesty>0.6)return'sorry';
if(t.cold>0.55&&t.aggr<0.5)return'cool';
return t.cp>0.55||t.aggr>0.55?'smug':'sorry';
}
var TW={lover:1,mate:1,fated:1,almost:0.8,fwb:0.5,best:0.8,buddy:0.75,childhood:0.7,sibling:0.65,sibclose:0.8,sibprot:0.8,parent:0.8,pparent:0.75,friend:0.5,mentor:0.5,master:0.55,teacher:0.45,senpai:0.35,colleague:0.25,classmate:0.35,boss:0.4,benefactor:0.6,relative:0.55,worship:0.85,fond:0.5,blind:0.75,acq:0.1,crush:0.85,rival: -0.35,enemy: -0.85,sibbad: -0.15,bad: -0.4};
function closeness(input,a,b){
if(a.aff&&a.aff[b.i]!=null)return a.aff[b.i];
var w=0;
(input.ties||[]).forEach(function(t){if((t.a===a.i&&t.b===b.i)||(t.a===b.i&&t.b===a.i)){var x=TW[t.type]!=null?TW[t.type]:0.1;if(Math.abs(x)>Math.abs(w))w=x;}});
return w;
}
function punish(c){
var S=c.S,rng=S.rng,ST=HK.Story,losers=c.losers.slice(),winners=c.winners;
if(!losers.length)return;
var used=S.punUsed||[],pool=PUN.filter(function(x){return used.indexOf(x.id)<0;});
var pn=rng.pick(pool.length?pool:PUN);
ST.step(S,'罰ゲーム');
ST.say(S,{kind:'phase',actors:losers.map(function(p){return p.i;}),tag:'罰ゲーム',text:pn.intro.replace('{n}',losers.length),why:'負けた陣営（'+(c.winner==='wolf'?'村人陣営':'人狼陣営')+'）の罰ゲーム：'+pn.label});
var show=rng.shuffle(losers).slice(0,5);
show.forEach(function(p){
var k=kind(p,rng);
ST.say(S,{actors:[p.i],tag:'罰ゲーム',text:end(ST.fmt(ST.pick(S,L(pn[k])),{a:p.name})),why:p.name+'の反応：'+KIND_JP[k]});
});
if(losers.length>show.length)ST.say(S,{kind:'phase',actors:losers.filter(function(p){return show.indexOf(p)<0;}).map(function(p){return p.i;}),text:'残りの'+losers.filter(function(p){return show.indexOf(p)<0;}).map(function(p){return p.name;}).join('・')+'も、それぞれに罰ゲームをやり遂げた。'});
var w=winners.slice().sort(function(a,b){return b.tr.fc+b.tr.impulse-a.tr.fc-a.tr.impulse;})[0];
if(w)ST.say(S,{actors:[w.i],tag:'罰ゲーム',text:end(ST.fmt(ST.pick(S,L(pn.win)),{w:w.name})),why:'勝った側の'+w.name+'（自由奔放さが高いほど、はしゃぐ）'});
}
function deceived(c){
var S=c.S,rng=S.rng,ST=HK.Story;
var cands=[];
c.wolves.forEach(function(w){
c.P.forEach(function(v){
if(c.isW(v))return;
var close=closeness(c.input,v,w),trust=1-clamp((v.sus[w.i]==null?50:v.sus[w.i])/100,0,1);
var fooled=(c.plan.fake===w||c.plan.fakeMed===w)&&v.belief&&v.belief[w.i]>0.6?0.35:0;
var sc=Math.max(0,close)*0.6+trust*0.6+fooled+Math.min(0.3,(w.cnt.lies||0)*0.06)+(v.ally===w?0.3:0);
if(trust>0.45||close>0.4||fooled)cands.push({v:v,w:w,close:close,trust:trust,fooled:fooled,sc:sc});
});
});
if(!cands.length)return;
cands.sort(function(a,b){return b.sc-a.sc;});
var top=cands[0];
if(rng()>clamp(0.05+top.sc*0.2,0.05,0.42))return;
var v=top.v,w=top.w,k=dupKind(v,w,top.close),wk=wolfKind(w,v,top.close);
var t=ST.fmt(ST.pick(S,L(DUP[k])),{a:v.name,x:w.name})+ST.fmt(ST.pick(S,L(DUP_W[wk])),{a:v.name,x:w.name});
var why=v.name+'は、人狼の'+w.name+'を'+(top.fooled?(c.plan.fake===w?'本物の占い師':'本物の霊媒師')+'だと信じ切っていた':'最後まで信じていた')+'（信頼 '+Math.round(top.trust*100)+(top.close>0.3?'・関係の近さ '+Math.round(top.close*100):'')+(v.ally===w?'・協力していた':'')+'）';
ST.say(S,{actors:[v.i,w.i],tag:'騙された',text:t,why:why});
if(cands[1]&&cands[1].v!==v&&rng()<0.25){
var c2=cands[1],k2=dupKind(c2.v,c2.w,c2.close);
ST.say(S,{actors:[c2.v.i,c2.w.i],tag:'騙された',text:ST.fmt(ST.pick(S,L(DUP[k2])),{a:c2.v.name,x:c2.w.name}),why:c2.v.name+'も、'+c2.w.name+'を信じていた（信頼 '+Math.round(c2.trust*100)+'）'});
}
}
HK.JinroAfter={
PUN:PUN,
end:function(c){
var isPun=c.env.prize==='punish'&& !String(c.env.prizeText||'').trim()|| /罰/.test(String(c.env.prizeText||''));
if(c.winner==='wolf')deceived(c);
if(isPun)punish(c);
}
};
})();
});
HK.Load.done('pack-story', 'ae5ae3dba3', 1);
