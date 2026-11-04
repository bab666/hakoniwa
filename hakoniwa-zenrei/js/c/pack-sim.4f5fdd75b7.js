;
/* ==== js/daily-kit.js ==== */
HK.Load.def(15,'js/daily-kit.js',function(){
(function(){
'use strict';
var HK=window.HK;
HK.MINI=HK.MINI||{};
var D=(HK.Daily=HK.Daily||{});
function L(s){return s.split('|');}
var TIMES=['morning','day','evening','night'];
var TL={morning:'朝',day:'昼',evening:'夕方',night:'夜'};
var TC={m:'morning',d:'day',e:'evening',n:'night'};
D.TIME_LABEL=TL;
function sp(label,full,t,props,extra){
var o={label:label,full:full,time:{morning:t[0],day:t[1],evening:t[2],night:t[3]},props:L(props)};
if(extra)for(var k in extra)o[k]=extra[k];
return o;
}
D.PLACES={
home:{label:'自宅',spots:{
living:sp('居間','自宅の居間',[1,2,3,3],'居間のテレビは、見る人のいない番組を小さな音で流していた。|ソファのクッションは、いつの間にか片方に寄っていた。|ローテーブルの上には、読みかけの雑誌とリモコンが並んでいた。|[d]窓から入る光が、床に四角い日だまりを作っていた。|[n]部屋の明かりを一つ落とすと、居間は急に静かになった。|壁の時計の秒針が、思ったより大きな音を立てていた。'),
bedroom:sp('寝室','自宅の寝室',[3,0.5,0.5,3],'枕元には、充電中のスマホが二つ並んでいた。|[m]カーテンの隙間から、朝の光が細く差し込んでいた。|[n]枕元の小さな明かりだけが、寝室を照らしていた。|布団は、片側だけがやけに乱れていた。|[m]目覚まし時計は、今日も感謝されることなく鳴り終えた。|ベッドの脇には、読みかけの本が伏せてあった。'),
kitchen:sp('台所','自宅の台所',[3,1,3,1],'換気扇が、低い音で回り続けていた。|[m]トースターが、ちん、と軽い音を立てた。|流しには、洗いかけのマグカップが一つ残っていた。|冷蔵庫には、買い物のメモがマグネットで留めてあった。|[e]鍋の蓋が、ことことと小さく揺れていた。|[n]台所の明かりの下で、やかんがゆっくり湯気を上げていた。'),
bath:sp('風呂','自宅の風呂',[0.5,0,1,3],'湯船から、白い湯気がゆっくり立ちのぼっていた。|脱衣所の棚には、たたんだタオルが二枚並んでいた。|シャンプーの詰め替えは、今日も後回しになっていた。|換気扇の音に混じって、ぽたりと水の落ちる音がした。|洗面台の鏡は、すっかり曇っていた。'),
entrance:sp('玄関','自宅の玄関',[3,1,2,1],'玄関には、脱ぎっぱなしの靴が二足、斜めに並んでいた。|靴箱の上には、合鍵と小銭の入った皿が置いてあった。|傘立てには、どちらのものか分からないビニール傘が刺さっていた。|[m]玄関のドアを開けると、朝の空気がひやりと流れ込んだ。|玄関の明かりは、少し暗いまま替えられていなかった。')
}},
town:{label:'街',spots:{
cafe:sp('カフェ','街のカフェ',[1,3,2,0.3],'店の奥から、豆を挽く音が聞こえていた。|[d]窓際の席には、午後の日差しがやわらかく落ちていた。|テーブルの上で、カップの湯気が細く揺れていた。|店内には、低い音量でジャズが流れていた。|ケーキのショーケースの明かりが、やけに眩しかった。'),
super:sp('スーパー','近所のスーパー',[0.5,2,3,0.5],'[e]タイムセールの放送が、店内に響いていた。|カゴの中身は、予定よりずいぶん増えていた。|特売の札が、野菜売り場で揺れていた。|レジの列は、思ったより長かった。|試食のウインナーの匂いが、通路まで漂っていた。'),
park:sp('公園','街の公園',[1.5,3,2,0.5],'ベンチの横で、鳩が何かをついばんでいた。|遠くで、犬の吠える声がした。|噴水の水音が、話し声をちょうどよく消していた。|[d]芝生の上に、木漏れ日がまだらに落ちていた。|[e]街灯が一つ、また一つと灯りはじめた。|自販機の明かりが、小道の脇でぼんやり光っていた。'),
station:sp('駅','駅',[3,1,2,2],'改札の電子音が、途切れずに鳴り続けていた。|発車のベルが、ホームの向こうで短く鳴った。|駅前のロータリーには、迎えの車が何台か停まっていた。|[m]ホームには、眠そうな顔の通勤客が並んでいた。|[n]終電の案内が、電光掲示板に流れていた。|駅の売店から、温かいコーヒーの匂いがした。'),
night:sp('夜の街','夜の繁華街',[0,0,1,3],'ネオンの光が、濡れた路面ににじんでいた。|客引きの声が、通りのあちこちから聞こえていた。|コンビニの明かりだけが、やけに白かった。|どこかの店から、カラオケの歌声が漏れていた。|タクシーの空車の赤い文字が、通りを流れていった。'),
famires:sp('ファミレス','駅前のファミレス',[0.5,2,2,3],'ドリンクバーのグラスは、もう三杯目だった。|呼び出しのチャイムが、店の奥で鳴った。|窓の外を、ヘッドライトがゆっくり流れていった。|メニューの写真は、実物より少しだけ豪華だった。|[n]深夜の店内は、客もまばらで静かだった。|テーブルの端には、伝票が丸めて差してあった。')
}},
trip:{label:'旅先',spots:{
onsen:sp('温泉','温泉宿',[1,1,2,3],'湯けむりの向こうで、湯の流れる音が絶えなかった。|浴衣の帯は、どう結んでも少し曲がった。|旅館の廊下には、ほのかに木の香りがした。|[n]部屋の窓からは、宿の明かりが点々と見えた。|卓球台の脇に、古いマッサージチェアが並んでいた。|湯上がりの瓶の牛乳が、やけにおいしかった。'),
sea:sp('海','海辺',[1,3,1,0],'波の音が、寄せては返していた。|砂浜には、消えかけた落書きが残っていた。|潮風が、髪を好き勝手に揺らしていた。|[d]日差しで、砂が足の裏に熱かった。|[e]水平線の近くで、空が橙色に染まっていた。|海の家から、焼きそばの匂いが漂ってきた。',{months:[6,7,8,9]}),
festival:sp('夏祭り','夏祭りの境内',[0,0.5,3,2],'提灯の明かりが、参道にずらりと並んでいた。|遠くで、太鼓の音が腹に響いた。|屋台の焼きとうもろこしの匂いが、通りに満ちていた。|金魚すくいの水槽が、明かりを映して揺れていた。|下駄の音が、あちこちで鳴っていた。',{months:[7,8]}),
fireworks:sp('花火大会','花火大会の河川敷',[0,0,0,3],'夜空に大きな花火が開いて、少し遅れて音が届いた。|河川敷には、レジャーシートがぎっしり並んでいた。|打ち上がるたびに、どこからともなく歓声が上がった。|火薬の匂いが、風に乗って流れてきた。|屋台のラムネの瓶の中で、ビー玉が鳴った。',{months:[7,8]})
}},
work:{label:'職場・学校',spots:{
office:sp('職場','職場',[2,3,2,0.5],'コピー機が、紙を吐き出し続けていた。|机の上には、付箋だらけのモニターが並んでいた。|給湯室のポットが、湯の沸いた合図を鳴らした。|[n]フロアの明かりは、ほとんど消えていた。|電話の呼び出し音が、奥の席で鳴りやまなかった。|自販機の缶コーヒーは、今日も少しぬるかった。'),
school:sp('学校','学校',[2,3,2,0],'廊下の向こうから、吹奏楽部の音が聞こえていた。|黒板には、消し忘れた日付が残っていた。|[e]グラウンドから、運動部の掛け声が響いていた。|窓際のカーテンが、風でふわりとふくらんだ。|購買のパンの残りは、今日もあんパンだけだった。|[m]予鈴が、廊下にのんびりと鳴り響いた。')
}},
island:{label:'島',spots:{
beach:sp('浜辺','島の浜辺',[2,3,3,1],'波打ち際に、流れ着いた木切れが転がっていた。|砂の上に、小さな蟹の足跡が続いていた。|潮が引いて、岩の上に貝が光っていた。|[e]夕日が、海を一面の橙色に変えていた。|[m]浜辺には、夜のうちに打ち上げられた海藻が並んでいた。|沖のほうを、海鳥がゆっくり横切っていった。'),
base:sp('拠点','島の拠点',[2,2,3,3],'焚き火の燃えさしが、まだかすかに赤かった。|椰子の葉で葺いた屋根が、風でかさかさ鳴った。|拠点の隅には、拾い集めた貝殻が山になっていた。|[n]焚き火の明かりが、拠点の壁に影を揺らしていた。|乾かしていた服が、枝の上でひらひらしていた。'),
forest:sp('森','島の森',[1,3,1,0],'木々のあいだから、鳥の鳴き声が降ってきた。|足元の落ち葉が、一歩ごとに柔らかく沈んだ。|甘い匂いのする実が、枝先に揺れていた。|湿った土の匂いが、森の奥から流れてきた。|[d]木漏れ日が、苔の上にまだらに落ちていた。'),
spring:sp('泉のほとり','島の泉のほとり',[2,2,1,0],'泉の水は、底の小石まで透けて見えた。|湧き水の音が、絶え間なく続いていた。|泉のほとりには、水を汲むための殻が並べてあった。|水面に、木の葉が一枚浮かんでいた。|冷たい水に手を浸すと、指先がじんとした。')
}},
room:{label:'白い部屋',spots:{
bed:sp('ベッドのそば','白い部屋のベッドのそば',[2,1,1,3],'ベッドの脇の小さな棚に、水のボトルが並んでいた。|白い天井は、どこまでも同じ白さだった。|枕が二つ、きちんと並べて置かれていた。|照明は、時間に関係なく同じ明るさだった。|毛布の端が、床に少しだけ垂れていた。'),
corner:sp('部屋の隅','白い部屋の隅',[1,2,2,2],'白い壁には、継ぎ目ひとつ見当たらなかった。|部屋の隅には、差し入れの空き箱が積まれていた。|空調の音だけが、低く続いていた。|壁に背を預けると、ひんやりと冷たかった。|扉は、今日も開く気配がなかった。'),
table:sp('テーブル','白い部屋のテーブル',[2,2,2,1],'テーブルの上には、差し入れの食事のトレーが置かれていた。|紙コップが二つ、テーブルの端に並んでいた。|テーブルの角には、条件の書かれた紙が伏せてあった。|差し入れの箱の中身は、前と少しだけ違っていた。|椅子の脚が、白い床にかすかな音を立てた。')
}}
};
D.spot=function(id){var p=String(id||'').split('.'),G=D.PLACES[p[0]];return G&&G.spots[p[1]]||null;};
function expand(list){
var out=[];
(list||[]).forEach(function(id){
if(id.indexOf('.')>=0){if(D.spot(id)&&out.indexOf(id)<0)out.push(id);return;}
var G=D.PLACES[id];if(!G)return;
Object.keys(G.spots).forEach(function(k){if(out.indexOf(id+'.'+k)<0)out.push(id+'.'+k);});
});
return out;
}
D.expand=expand;
D.at=function(ctx,c){
if(!ctx)return null;
if(ctx._dailyCur)return ctx._dailyCur.spot;
if(ctx.scen&&ctx.scen.places)return(c&&c.place)||ctx.placeId||null;
return null;
};
D.label=function(ctx,c){var id=D.at(ctx,c),s=id&&D.spot(id);return s?s.label:'';};
var FAM={sibling:'sib',sibprot:'sib',sibclose:'sib',twin:'sib',sibbad:'sib',parent:'parent',pparent:'parent',relative:'rel'};
function famTie(ctx,a,b){
if(!HK.Ties|| !HK.Ties.all)return null;
var l=HK.Ties.all(ctx,a,b);
for(var i=0;i<l.length;i++){var k=FAM[l[i].type];if(k)return{t:l[i],kind:k==='rel'&&l[i].step?'sib':k};}
return null;
}
D.famTie=famTie;
function couple(ctx,a,b){return!!(a&&b&&a!==b&&ctx.pair(a,b).couple);}
function lovers(ctx,a,b){return couple(ctx,a,b)&& !ctx.pair(a,b).kin&& !famTie(ctx,a,b)&&HK.canLove(a,b)&&HK.canLove(b,a)&& !(HK.ngPair&&HK.ngPair(a,b));}
function friendly(ctx,a,b,lo){var x=ctx.R(a,b),y=ctx.R(b,a);return x.aff>(lo==null?8:lo)&&y.aff>0&&x.ten<45&&y.ten<50;}
function colleague(ctx,a,b){return!!(HK.Ties&&(HK.Ties.has(ctx,a,b,'colleague')||HK.Ties.has(ctx,a,b,'boss')||HK.Ties.has(ctx,a,b,'classmate')))||(ctx.scen&&ctx.scen.id==='classroom');}
D.REL={
lovers:lovers,
friend:function(ctx,a,b){return!couple(ctx,a,b)&& !famTie(ctx,a,b)&&friendly(ctx,a,b);},
colleague:function(ctx,a,b){return!couple(ctx,a,b)&& !famTie(ctx,a,b)&&colleague(ctx,a,b)&&friendly(ctx,a,b,-5);},
family:function(ctx,a,b){return!couple(ctx,a,b)&& !!famTie(ctx,a,b);},
any:function(ctx,a,b){return ctx.R(a,b).ten<55&&ctx.R(b,a).ten<60&&ctx.R(a,b).aff> -20;}
};
D.mood=function(c){return HK.Emo&&HK.Emo.mood&&c?HK.Emo.mood(c)||'calm':'calm';};
function older(a,b){
if(a.age&&b.age&& +a.age!== +b.age)return+a.age> +b.age;
return a.i<b.i;
}
function orient(ctx,a,b,ft){
var t=ft.t;
if(t.type==='sibprot'||ft.kind==='parent')return t.a===a.i?[a,b]:[b,a];
if(ft.kind==='sib'&&HK.Sib){
var o=HK.Sib.info(a,b,{tie:t});
if(o.pos==='ue')return[b,a];
if(o.pos==='shita')return[a,b];
return a.i<b.i?[a,b]:[b,a];
}
return older(a,b)?[a,b]:[b,a];
}
function callOf(y,x,list){
if(y.calls&&y.calls[x.name])return y.calls[x.name];
return list[(x.i*3+y.i)%list.length];
}
function sibCombo(E,Y){
var g=E.gender,h=Y.gender;
if(g==='m'&&h==='m')return'兄弟';
if(g==='f'&&h==='f')return'姉妹';
if(g==='f'&&h==='m')return'姉弟';
if(g==='m'&&h==='f')return'兄妹';
return'きょうだい';
}
function sibKey(E,Y,t){
if(!HK.Sib)return sibCombo(E,Y);
var o=HK.Sib.info(E,Y,{tie:t});
if(!o.g|| !o.ga)return'きょうだい';
if(o.pos==='twin')return'双子';
if(o.pos!=='shita')return'きょうだい';
return sibCombo(E,Y);
}
function kinTokens(ft,E,Y){
if(ft.kind==='sib'&&HK.Sib){
var SB=HK.Sib,env={tie:ft.t},kd=SB.pairWord(E,Y,env);
if(ft.t.step&&kd!=='きょうだい')kd='義理の'+kd;
return{kind:kd,ue:SB.word(Y,E,'plain',env),shita:SB.word(E,Y,'plain',env),yobi:SB.callFor(Y,E,env)};
}
if(ft.kind==='sib'){
var combo=sibCombo(E,Y),up=E.gender==='m'?'兄':E.gender==='f'?'姉':'きょうだい',dn=Y.gender==='m'?'弟':Y.gender==='f'?'妹':'きょうだい';
if(combo==='きょうだい'){up='きょうだい';dn='きょうだい';}
var yobi=combo==='きょうだい'?E.name:callOf(Y,E,E.gender==='m'?['兄さん','兄貴','お兄ちゃん']:['姉さん','姉貴','お姉ちゃん']);
if(ft.t.step&&combo!=='きょうだい')combo='義理の'+combo;
return{kind:combo,ue:up,shita:dn,yobi:yobi};
}
if(ft.kind==='parent'){
var pp=ft.t.type==='pparent';
var oya=pp?'親代わり':E.gender==='m'?'父':E.gender==='f'?'母':'親';
var ko=Y.gender==='m'?'息子':Y.gender==='f'?'娘':'子';
var oy=pp|| !(E.gender==='m'||E.gender==='f')?(Y.calls&&Y.calls[E.name])||E.name:callOf(Y,E,E.gender==='m'?['父さん','お父さん','親父']:['母さん','お母さん','おふくろ']);
return{oya:oya,ko:ko,oyayobi:oy};
}
return{shin:'親戚'};
}
function fill(s,tk){return s.replace(/\{(kind|ue|shita|yobi|oya|ko|oyayobi|shin)\}/g,function(m,k){return tk&&tk[k]!=null?tk[k]:'';});}
D.SIB_LINE={
'兄弟':L('{sibs}というのは、黙っていても通じるところがあった。|{b}にとって、{sib:b→a}の{a}の背中は、いつまでも少しだけ大きかった。|言葉が少ないのは{sibs}だからだろうか。それでも、二人のあいだの空気は柔らかかった。'),
'姉妹':L('{sibs}の話は、いつの間にか三つくらいに枝分かれしていた。|{a}は、{sib:a→b}の{b}の顔に、自分そっくりの表情を見つけて少し笑った。|同じところで同時に笑うのは、この{sibs}の昔からの癖だった。'),
'姉弟':L('{a}にとって{b}は、いくつになっても手のかかる{sib:a→b}だった。|{b}は、{sib:b→a}に頭が上がらないことを、とうに受け入れていた。|{sib:b→a}の小言を聞き流すのが、{b}は昔から上手だった。'),
'兄妹':L('{b}は、{sib:b→a}の不器用な優しさを、とっくに見抜いていた。|{a}は、{sib:a→b}の{b}にだけは昔から甘かった。|{sib:b→a}に言い返す{sib:a→b}の口ぶりは、小さいころとまるで同じだった。'),
'双子':L('{sibs}というのは、言葉より先に目で話すものらしかった。|{a}と{b}は、同じところで同時に吹き出した。生まれたときからの癖だった。|{a}が言いかけたことを、{b}が先に口にした。{sibs}のあいだでは、珍しいことでもなかった。'),
'きょうだい':L('{sibs}の気安さは、何年たっても変わらなかった。|同じ家で育った二人の笑い方は、どこか似ていた。|{a}と{b}のやり取りには、{sibs}にしか分からない呼吸があった。')
};
var SPECS=(D.SPECS=[]);
function E(id,cat,scope,w,when,fx,texts,meta){SPECS.push({id:id,args:[id,cat,scope,w,when,fx,texts],meta:meta});}
var CALM='calm,joy',SOFT='calm,joy,grief,fear,shame';
E('d_wake','bond','p','np*.5+fc*.3+.4','','ab:aff3;ba:aff3,trust2',
'{a}は、なかなか起きない{b}の肩を三回揺すった。{b}「あと五分……｜＝｜あと五分……」{a}「さっきもそう言った｜＝｜さっきもそう言いました」――結局、五分では済まなかった。|{a}が目を覚ますと、{b}はもう起きていて、{a}の寝顔を眺めていた。{a}「……いつから見てたの｜……いつから見ていた｜……いつから見ていたんですか」{b}「さあ｜さあな｜さあ、どうでしょう」|{a}は目覚ましを止めて、隣で丸まっている{b}の布団をそっとめくった。{b}は眉をひそめて、枕に顔をうずめた。|{b}の寝息があまりに穏やかで、{a}は起こすのを少しだけ先延ばしにした。',
{at:'home.bedroom',tm:'m',rel:'lovers'});
E('d_oversleep','bond','p','fc*.5+ac*.2+.3','','as:4;bs:4;ab:aff2;ba:aff2',
'時計を見た{a}が跳ね起きた。{a}「なんで起こしてくれなかったの｜なぜ起こしてくれなかった｜なぜ起こしてくれなかったんですか」{b}「起こしたよ。三回｜起こした。三回だ｜起こしました。三回です」――言い合いながら、二人は大急ぎで支度をした。|{a}と{b}は、そろって目覚ましを止めてしまったらしい。顔を見合わせたあと、二人とも笑うしかなかった。|{b}が寝坊した。{a}は文句を言いながらも、{b}の分のパンを袋に入れて手渡した。',
{at:'home.bedroom',tm:'m',rel:'lovers'});
E('d_breakfast','bond','p','np*.5+a*.2+.4','','ab:aff3,trust2;ba:aff3,trust2',
'{a}が目玉焼きを焼くあいだ、{b}はパンを焼く係だった。焼き加減の好みは、いまだに一致しない。|{b}は、{a}のコーヒーにだけ砂糖を一つ入れた。言われなくても覚えていた。|寝ぼけた{a}が、塩と砂糖を取り違えた。{b}は一口食べて、黙って自分の皿と取り替えた。|{a}と{b}は、トーストをかじりながら今日の予定を言い合った。半分は聞き流していた。',
{at:'home.kitchen',tm:'m',rel:'lovers'});
E('d_seeoff','bond','p','np*.6+.3','','ab:aff2;ba:aff3,trust2',
'{a}「行ってきます｜行ってくる｜行ってきます」{b}「ハンカチ持った？｜ハンカチは持ったか｜ハンカチ、持ちましたか？」{a}「……持ってない｜……持っていない｜……持っていません」――{b}は笑って、引き出しから一枚出した。|{b}は玄関で、{a}の襟の折れを直した。{a}は照れくさそうに「行ってくるね｜行ってくる｜行ってきます」と言った。|{a}が靴を履くあいだ、{b}は鍵を持って待っていた。毎日のことなのに、見送りは一度も欠かさなかった。',
{at:'home.entrance',tm:'m',rel:'lovers'});
E('d_homecoming','bond','p','np*.6+.3','','ab:aff3;ba:aff3;as:-5',
'{a}が帰ると、{b}が玄関まで出てきた。{b}「おかえり｜＝｜おかえりなさい」――それだけで、一日の疲れが半分になった。|{b}は、{a}の鞄を受け取って、かわりに温かいタオルを渡した。|{a}「ただいま｜＝｜ただいま戻りました」{b}「遅いよ｜遅い｜遅いですよ」――言葉とは裏腹に、{b}は{a}の上着を受け取って、掛けてやった。',
{at:'home.entrance',tm:'en',rel:'lovers'});
E('d_cook','bond','p','np*.5+fc*.2+.4','','ab:aff3,trust2;ba:aff3,trust2',
'{a}が野菜を切り、{b}が味をみた。{b}「もうちょっと塩｜もう少し塩だ｜もう少し塩ですね」{a}「さっきも足したよ｜さっきも足した｜さっきも足しました」――夕飯は、少しだけしょっぱくなった。|{b}は{a}の好物を作ろうとして、レシピを三回見直した。出来上がりを一口食べた{a}は、何も言わずにおかわりをよそった。|{a}と{b}は、狭い台所で肩をぶつけながら夕飯を作った。何度ぶつかっても、どちらも場所を譲らなかった。',
{at:'home.kitchen',tm:'e',rel:'lovers'});
E('d_cookfail','bond','p','fc*.5+.3','','ab:aff2;ba:aff3',
'{a}の作った料理は、見た目だけはよかった。{b}は一口食べて、そっと水を飲んだ。{a}「……正直に言って｜……正直に言え｜……正直に言ってください」{b}「次は、もっとよくなるよ｜次は、もっとよくなる｜次は、もっとよくなります」|{b}が焦がしたものを、{a}は「香ばしいね｜香ばしいな｜香ばしいですね」と言い張って全部食べた。|{a}と{b}は、味のしない何かを前に、どこで間違えたのかを真剣に話し合った。最後は二人とも笑っていた。',
{at:'home.kitchen,island.base',tm:'de',rel:'lovers,friend'});
E('d_dineout','bond','p','fc*.4+np*.3+.3','','ab:aff3;ba:aff3',
'{a}と{b}は、メニューを前に十分迷った。結局、いつもと同じものを頼んだ。|{b}は、{a}が頼んだものを一口もらった。{a}も黙って、{b}の皿からひと口取った。|店を出たあと、{a}「おいしかったね｜うまかったな｜おいしかったですね」{b}「また来よう｜＝｜また来ましょう」――言いながら、二人とも次はどこにするか考えていた。',
{at:'town.cafe,town.famires',tm:'de',rel:'lovers'});
E('d_picky','bond','p','cp*.3+fc*.3+.3','','ab:aff2;ba:aff2',
'{b}は皿の端に、苦手なものをそっと寄せた。{a}は見逃さなかった。{a}「残さないよ｜残さない｜残しません」{b}「……子ども扱い｜……子ども扱いだ｜……子ども扱いです」|{a}が苦手なものを避けているのを見て、{b}は自分の皿のものと黙って交換してやった。|{a}と{b}は、好きな食べ物の話で盛り上がった。苦手な食べ物の話になると、もっと盛り上がった。',
{at:'home.kitchen,town.famires,island.base,room.table',tm:'de',rel:'lovers,friend'});
E('d_shop','bond','p','fc*.5+.3','','ab:aff3;ba:aff3',
'{a}がカゴを持ち、{b}が中身を増やした。レジに着くころ、カゴは二つになっていた。|{b}はお菓子の棚の前で立ち止まった。{a}「一つだけ｜＝｜一つだけです」{b}「二つ｜＝｜二つです」――結局、三つ買った。|{a}と{b}は、どちらの好きなアイスを買うかで小さく揉めた。両方買うことで決着した。|{a}はメモを見ながら歩き、{b}はメモにないものばかりカゴに入れた。',
{at:'town.super',tm:'de',rel:'lovers'});
E('d_clean','bond','p','a*.4+np*.2+.3','','ab:trust3;ba:trust3',
'{a}が掃除機をかけ、{b}が棚を拭いた。途中で出てきた古い写真に、二人とも手が止まった。|{b}は、{a}が「捨てないよ｜捨てない｜捨てません」と言い張る箱を前に腕を組んだ。箱は、また押し入れの中に戻された。|{a}と{b}は、休日の午前を丸ごと片づけに使った。片づいた部屋で飲んだお茶は、いつもよりおいしかった。',
{at:'home.living',tm:'d',rel:'lovers'});
E('d_tidy','bond','p','a*.4+np*.3+.3','','ab:trust3,aff1;ba:trust3,aff1',
'{a}と{b}は、{place}を手分けして片づけた。それだけで、少し暮らしらしくなった。|{a}が散らかったものを拾い集め、{b}がそれを並べ直した。言葉は少なかったが、手はよく合った。|{b}「ここ、もう少し片づけたら広く使えるよ｜ここは、もう少し片づけたら広く使える｜ここ、もう少し片づけたら広く使えますよ」{a}「やろう｜やるか｜やりましょう」――二人で動くと、思ったより早く終わった。',
{at:'island.base,room.corner',tm:'de',rel:'any'});
E('d_bath','bond','p','np*.5+.3','','ab:aff3;ba:aff3;as:-4;bs:-4',
'風呂上がりの{b}の髪を、{a}がドライヤーで乾かした。{b}は目を閉じて、されるがままになっていた。|{a}「お湯、ぬるくなってない？｜お湯、ぬるくなっていないか｜お湯、ぬるくなっていませんか？」{b}「ちょうどいいよ｜ちょうどいい｜ちょうどいいです」――先に入った{b}は、{a}のために湯を足しておいてくれた。|{a}と{b}は、どちらが先に風呂に入るかでじゃんけんをした。勝った{a}は、なぜか後に入ると言い出した。',
{at:'home.bath',tm:'n',rel:'lovers'});
E('d_bedtime','romance','p','np*.4+ac*.2+.4','','ab:aff3,att2;ba:aff3,att2;as:-5;bs:-5',
'明かりを消したあとも、{a}と{b}は小さな声で話し続けた。最後に何を話していたのか、翌日にはどちらも覚えていなかった。|{b}は{a}の手を探して、指を絡めた。{a}「おやすみ｜＝｜おやすみなさい」{b}「おやすみ｜＝｜おやすみなさい」――それだけで、よく眠れた。|{a}は、隣で眠る{b}の寝息を数えているうちに、自分も眠っていた。|{b}「今日、楽しかった？｜今日は、楽しかったか｜今日、楽しかったですか？」{a}「うん｜ああ｜はい」{b}「よかった｜＝｜よかったです」――二人は肩を寄せて目を閉じた。',
{at:'home.bedroom,island.base,room.bed',tm:'n',rel:'lovers',mood:SOFT});
E('d_bedtalk','bond','p','fc*.3+np*.3+.3','','ab:aff3,trust3;ba:aff3,trust3',
'{a}と{b}は、横になってからも、なかなか話をやめなかった。話題は、小さいころのくだらない思い出ばかりだった。|{b}「起きてる？｜起きているか｜起きていますか？」{a}「起きてるよ｜起きている｜起きています」――暗がりの中で、二人はとりとめのない話を続けた。|{a}が眠りかけたころ、{b}がぽつりと言った。{b}「明日も、よろしくね｜明日も、よろしく｜明日も、よろしくお願いします」{a}は半分眠ったまま頷いた。',
{at:'trip.onsen,island.base,room.bed',tm:'n',rel:'friend',mood:SOFT});
E('d_date_park','romance','p','fc*.3+np*.3+.3','','ab:aff3,att3;ba:aff3,att3',
'{a}と{b}は、公園のベンチで一本の缶コーヒーを分け合った。特に何をするでもない午後だった。|{b}がボートに乗りたいと言い出した。漕ぎ手の{a}は、思ったより同じ場所をぐるぐる回った。|{a}と{b}は、休日の公園をあてもなく歩いた。手をつなぐきっかけを、どちらも少し探していた。',
{at:'town.park',tm:'d',rel:'lovers'});
E('d_date_cafe','romance','p','a*.3+np*.3+.3','','ab:aff3,att2;ba:aff3,att2',
'{a}は、{b}が頼んだケーキの写真を撮り終えるのを、辛抱強く待った。{b}「はい、食べていいよ｜ほら、食べていい｜はい、食べていいですよ」{a}「自分のだけど｜自分のだがな｜自分のですけど」|{a}と{b}は、窓際の席で同じ本の話をした。読んだ感想は、見事に正反対だった。|{b}は、{a}の口元についた泡を見て、黙って紙ナプキンを差し出した。',
{at:'town.cafe',tm:'d',rel:'lovers'});
E('d_sea','romance','p','fc*.5+.3','','ab:aff3,att3;ba:aff3,att3',
'{a}と{b}は、波打ち際を並んで歩いた。{b}が急に水をかけてきて、{a}もやり返した。|{b}は貝殻を一つ拾って、{a}の手のひらに載せた。{b}「今日の記念｜今日の記念だ｜今日の記念です」|{a}と{b}は、砂浜に座って波を眺めた。帰る時間を、どちらも口にしなかった。',
{at:'trip.sea',tm:'de',rel:'lovers'});
E('d_fest','romance','p','fc*.5+.3','','ab:aff3,att3;ba:aff3,att3',
'{a}は射的で、{b}が欲しがった景品を三発目で落とした。{b}は大げさに拍手した。|人混みではぐれかけて、{b}は{a}の袖をつかんだ。そのまま、離さずに歩いた。|{a}と{b}は、一つのりんご飴を交代でかじった。{b}「甘すぎるよ｜甘すぎる｜甘すぎます」{a}「それがいい｜＝｜それがいいです」',
{at:'trip.festival',tm:'en',rel:'lovers'});
E('d_fireworks','romance','p','ac*.3+np*.3+.3','','ab:aff3,att4;ba:aff3,att4',
'大きな花火が上がった瞬間、{a}は花火ではなく{b}の横顔を見ていた。|{b}「来年も、ここで見よう｜＝｜来年も、ここで見ましょう」{a}「うん｜ああ｜はい」――言葉の続きは、次の花火の音にかき消された。|{a}と{b}は、レジャーシートの上で肩を寄せた。打ち上がるたびに、{b}が小さく声を上げた。',
{at:'trip.fireworks',tm:'n',rel:'lovers'});
E('d_onsen','romance','p','fc*.3+ac*.3+.3','','ab:aff3,att3;ba:aff3,att3;as:-6;bs:-6',
'浴衣姿の{b}を見て、{a}はしばらく言葉が出なかった。{b}「何？｜何だ｜何ですか？」{a}「……似合うよ｜……似合う｜……似合います」|湯上がりの{a}と{b}は、旅館の卓球台で本気の勝負をした。浴衣が乱れるたびに、試合は中断した。|{a}と{b}は、部屋の窓辺で湯冷ましのお茶を飲んだ。遠くの宿の明かりを、二人で数えた。',
{at:'trip.onsen',tm:'en',rel:'lovers'});
E('d_station_bye','romance','p','ac*.4+np*.2+.3','','ab:att3,aff2;ba:att3,aff2',
'改札の前で、{a}と{b}は「じゃあ｜では｜では」と三回言った。三回とも、どちらも動かなかった。|{b}は、改札を通ったあとで振り返って、小さく手を振った。{a}は、{b}が見えなくなるまで立っていた。|{a}「着いたら連絡して｜着いたら連絡しろ｜着いたら連絡してください」{b}「うん｜ああ｜はい」――{b}からの連絡は、電車が動き出してすぐに来た。',
{at:'town.station',tm:'en',rel:'lovers'});
E('d_rain','romance','p','np*.4+.3','','ab:aff3,att2;ba:aff3,att2',
'駅を出たところで、雨が降り出した。{a}の傘は一本だけだった。二人で入ると、{a}の肩だけが雨に打たれた。|{b}は雨宿りのあいだ、{a}の前髪についた雨粒を指で払った。雨はなかなか止まなかったが、どちらも急がなかった。|{a}「傘、持ってきてない｜傘を持ってきていない｜傘、持ってきていません」{b}「知ってた｜知っていた｜知っていました」――{b}は鞄から、折りたたみ傘を二本出した。',
{at:'town.station',tm:'de',rel:'lovers'});
E('d_rain_friend','bond','p','fc*.4+np*.2+.3','','ab:aff3;ba:aff3',
'急な雨に、{a}と{b}は軒下で立ち往生した。{a}「走る？｜走るか｜走りますか？」{b}「走ろう｜＝｜走りましょう」――着くころには、二人ともずぶ濡れだった。|{b}は、傘を忘れた{a}に置き傘を貸してやった。{a}「返すの、いつになるか分からないよ｜返すのは、いつになるか分からない｜返すのが、いつになるか分かりません」{b}「知ってる｜知っている｜知っています」|雨の音を聞きながら、{a}と{b}は止むのを待った。話すことは、いくらでもあった。',
{at:'town.station,work.school,work.office',tm:'de',rel:'friend,colleague'});
E('d_rain_home','bond','p','ac*.3+np*.3+.3','','ab:aff3;ba:aff3;as:-5;bs:-5',
'雨の休日、{a}と{b}は出かけるのをやめて、毛布にくるまって映画を観た。二本目の途中で、{b}は眠っていた。|窓を打つ雨音を聞きながら、{a}は本を読み、{b}はその肩にもたれていた。|{b}「今日は一歩も外に出ない｜＝｜今日は一歩も外に出ません」{a}「賛成｜＝｜賛成です」――二人は昼過ぎまでパジャマのままだった。',
{at:'home.living',tm:'d',rel:'lovers',mood:SOFT});
E('d_rain_base','bond','p','np*.3+.3','','ab:aff2,trust2;ba:aff2,trust2',
'雨が屋根を叩くあいだ、{a}と{b}は拠点で膝を抱えて座っていた。{b}「止んだら、何する？｜止んだら、何をする｜止んだら、何をしますか？」{a}「とりあえず、乾かす｜＝｜とりあえず、乾かします」|雨漏りする隅に、{a}が大きな葉を一枚差し込んだ。{b}は「天才｜天才だな｜天才ですね」と笑った。|{a}と{b}は、雨音に負けないように、少し大きな声で話した。そのうち、どうでもいい話ばかりになった。',
{at:'island.base',tm:'de',rel:'any',mood:SOFT});
E('d_sick','help','p','np*.6+.3','','ab:aff3;ba:aff5,trust5;bs:-8',
'熱を出した{b}の枕元に、{a}はおかゆとスポーツドリンクを置いた。{b}「うつるよ｜うつるぞ｜うつりますよ」{a}「うつらないよ｜うつらない｜うつりません」|{a}は、寝込んでいる{b}の額のタオルを何度も替えた。{b}は眠ったまま、少しだけ表情を緩めた。|{b}が「何もいらないよ｜何もいらない｜何もいりません」と言うので、{a}は黙って隣に座っていた。しばらくして、{b}が小さく「ありがとう｜＝｜ありがとうございます」と言った。|{a}は、{b}の好きなプリンを三つ買ってきた。{b}「多いよ｜多い｜多いです」{a}「治るまでの分｜治るまでの分だ｜治るまでの分です」',
{at:'home.bedroom',tm:'de',rel:'lovers,friend',mood:SOFT});
E('d_sickcare','help','p','np*.6+.3','','ab:aff2;ba:aff4,trust5;bs:-8',
'{a}は、具合の悪そうな{b}を横にさせて、ずっとそばについていた。|{a}は、冷たい水で濡らした布を{b}の額に当てた。{b}「……悪いね｜……悪いな｜……すみません」{a}「お互いさま｜お互いさまだ｜お互いさまです」|{b}が眠るまで、{a}は他愛ない話を小さな声で続けた。',
{at:'island.base,room.bed',tm:'mden',rel:'any',mood:SOFT});
E('d_famires','bond','p','fc*.4+.3','','ab:aff3,trust2;ba:aff3,trust2',
'終電を逃した{a}と{b}は、駅前のファミレスで始発を待つことにした。ドリンクバーのおかわりは、とうとう五杯目になった。|{a}と{b}は、深夜のファミレスでポテトをつまみながら、昔の失敗談を言い合った。笑いすぎて、店員に二度見された。|{b}は眠気に負けて、テーブルに突っ伏した。{a}は自分の上着を、そっと{b}の肩に掛けた。|{a}「始発まで、あと何時間？｜始発まで、あと何時間だ｜始発まで、あと何時間ですか？」{b}「数えないほうがいいよ｜数えないほうがいい｜数えないほうがいいです」――二人は、もう一品だけ頼んだ。',
{at:'town.famires',tm:'n',rel:'lovers,friend'});
E('d_night_walk','bond','p','fc*.3+a*.2+.3','','ab:aff2,trust2;ba:aff2,trust2',
'帰り道、{a}と{b}は一駅分を歩いて帰ることにした。夜風が、頭をちょうどよく冷ましてくれた。|{a}は、コンビニの前で{b}に温かい缶のお茶を放った。{b}は危うく受け取って、笑った。|{a}と{b}は、ネオンの明るい通りを抜けて、静かな裏道に入った。話し声が、急に大きく聞こえた。',
{at:'town.night',tm:'n',rel:'lovers,friend,colleague'});
E('d_spat','conflict','p','fc*.3+cp*.3+.2','','ab:ten6;ba:ten6',
'{a}と{b}は、テレビのチャンネルのことで言い合いになった。五分後には、どちらも何を争っていたのか忘れていた。|{b}「靴下、また裏返しのまま｜靴下、また裏返しのままだ｜靴下、また裏返しのままです」{a}「そっちこそ、電気つけっぱなし｜そっちこそ、電気がつけっぱなしだ｜そちらこそ、電気がつけっぱなしです」――小さな不満が、立て続けに出てきた。|{a}が、{b}のとっておいたプリンを食べてしまった。{b}はしばらく口をきかなかった。',
{at:'home.living',tm:'en',rel:'lovers',mood:'calm,joy,anger'});
E('d_makeup','bond','p','np*.4+ac*.3+.3','ten>8','ab:ten-10,aff3;ba:ten-10,aff3',
'{a}は、黙って{b}の好きなものを二つ買って帰った。{b}はそれを見て、こらえきれずに笑った。仲直りは、それで済んだ。|{b}「さっきは、言いすぎた｜＝｜さっきは、言いすぎました」{a}「こっちも｜＝｜こちらもです」――二人は同じタイミングで謝って、また少し笑った。|{a}は、{b}の背中に向かって小さく「ごめん｜すまない｜すみません」と言った。{b}は振り向かずに、手だけをこちらに伸ばした。',
{at:'home.living,home.kitchen,town.park',tm:'en',rel:'lovers',mood:'calm,joy,anger,grief'});
E('d_spat_friend','conflict','p','fc*.3+cp*.3+.2','','ab:ten4;ba:ten4,aff-1',
'{a}と{b}は、どちらが先に約束を忘れていたかで言い合った。どちらの記憶も、少しずつ都合よくできていた。|{b}の何気ない一言に、{a}はむっとした。{b}はすぐに気づいて、「今のはなし｜今のはなしだ｜今のはなしです」と言い直した。|{a}と{b}は、くだらないことで意地を張って、しばらく口をきかなかった。先に吹き出したのは{b}だった。',
{at:'town.cafe,work.school,work.office,island.base',tm:'de',rel:'friend',mood:'calm,joy,anger'});
E('d_anniv_out','romance','p','np*.3+cp*.2+.3','','ab:aff4,att3;ba:aff4,att3',
'{a}は、記念日のために予約していた店に{b}を連れていった。{b}は、席に着くまでずっと照れくさそうだった。|{b}は、{a}の前に小さな包みを置いた。{b}「覚えてた？｜覚えていたのか｜覚えていたんですか？」{a}「当たり前｜当たり前だ｜当たり前です」――{a}の鞄からも、同じくらいの包みが出てきた。|{a}と{b}は、付き合い始めた日の話をした。お互いの記憶が、細かいところで食い違っていた。',
{at:'town.cafe',tm:'de',rel:'lovers'});
E('d_anniv_home','romance','p','np*.4+.3','','ab:aff4,att2;ba:aff4,att2',
'{b}は、記念日だからと小さなケーキを二つ買って帰った。{a}は、すっかり忘れていた顔をした。|{a}は、{b}との写真を一枚だけ選んで、写真立てに入れて飾った。{b}は気づいて、しばらく眺めていた。|{a}と{b}は、記念日の祝い方で意見が分かれた。結局、家でいつもの夕飯を少しだけ豪華にした。',
{at:'home.living',tm:'en',rel:'lovers'});
E('d_pet','bond','p','np*.4+fc*.3+.3','','ab:aff3;ba:aff3',
'{a}と{b}は、公園で人懐っこい犬にじゃれつかれた。{b}はすっかり骨抜きになって、なかなか立ち上がらなかった。|ベンチの下から、野良猫が顔を出した。{a}がそっと手を伸ばすと、猫は{b}のほうへ歩いていった。|{b}「犬、飼いたいね｜犬を飼いたいな｜犬、飼いたいですね」{a}「散歩、毎日だよ｜散歩は毎日だぞ｜散歩、毎日ですよ」{b}「……猫にする？｜……猫にするか｜……猫にしますか？」',
{at:'town.park',tm:'mde',rel:'lovers,friend'});
E('d_pet_home','bond','p','np*.5+.3','','ab:aff3;ba:aff3;as:-4',
'{a}と{b}の飼い猫は、今日も{b}の膝の上を選んだ。{a}は少しだけ面白くなさそうだった。|金魚の水槽の掃除を、{a}と{b}は二人がかりでやった。金魚は、終わるまでずっと逃げ回っていた。|{b}は、もらってきた鉢植えに名前をつけた。{a}は毎日、律儀にその名前を呼んで水をやった。',
{at:'home.living',tm:'de',rel:'lovers'});
E('d_photo','bond','p','fc*.5+.3','','ab:aff3;ba:aff3',
'{a}が{b}を撮ろうとすると、{b}はわざと変な顔をした。十枚撮って、まともなのは一枚もなかった。|{b}は、{a}と並んで写真を撮った。画面の中の二人は、思ったよりいい顔をしていた。|{a}は、景色に見とれている{b}の横顔を、こっそり一枚だけ撮った。',
{at:'trip.sea,town.park,trip.festival,trip.onsen',tm:'de',rel:'lovers,friend'});
E('d_photo_old','romance','p','ac*.3+np*.3+.3','','ab:aff3,att2;ba:aff3,att2',
'{a}と{b}は、スマホの中の昔の写真を見返した。{b}「この髪型、なんで止めてくれなかったの｜この髪型、なぜ止めてくれなかった｜この髪型、なぜ止めてくれなかったんですか」|{b}は、{a}の古いアルバムを見つけて、ページをめくるたびに笑った。{a}は取り返そうとして、あきらめた。|{a}と{b}は、出会ったころの写真を並べて、今の二人と見比べた。思ったほど変わっていなかった。',
{at:'home.living',tm:'en',rel:'lovers'});
E('d_cafe_friend','bond','p','fc*.4+np*.2+.3','','ab:aff3,trust2;ba:aff3,trust2',
'{a}と{b}は、新しくできたカフェの列に三十分並んだ。味の感想は「並んだ甲斐はあった、たぶん｜＝｜並んだ甲斐はありました、たぶん」で一致した。|{b}は{a}の近況を聞きながら、ケーキを半分残して{a}のほうへ押しやった。|{a}と{b}は、カフェで二時間しゃべった。中身は、ほとんど覚えていない。',
{at:'town.cafe',tm:'de',rel:'friend'});
E('d_park_friend','bond','p','fc*.4+.3','','ab:aff3;ba:aff3',
'{a}と{b}は、公園のベンチでソフトクリームを食べた。溶けるのが早くて、話どころではなかった。|{b}がフリスビーを投げ、{a}が全力で追いかけた。三回目で、二人とも息が上がった。|{a}と{b}は、公園を一周しながら、最近あったことを順番に話した。',
{at:'town.park',tm:'de',rel:'friend'});
E('d_office','bond','p','a*.3+np*.3+.3','','ab:trust3;ba:trust3',
'{a}と{b}は、昼休みに同じ定食屋の同じ席に座った。注文も、いつものだった。|{b}は、{a}の机に付箋を一枚貼っていった。「おつかれ。会議、長かったね｜おつかれ。会議、長かったな｜おつかれさまです。会議、長かったですね」|{a}が資料の山に埋もれていると、{b}が半分を黙って引き取っていった。',
{at:'work.office',tm:'d',rel:'colleague,friend'});
E('d_overtime','bond','p','a*.4+cp*.2+.3','','ab:trust3,aff2;ba:trust3,aff2;as:3;bs:3',
'残業のフロアに、{a}と{b}だけが残っていた。{b}「何か食べに行く？｜何か食べに行くか｜何か食べに行きますか？」{a}「これが終わったら｜＝｜これが終わったら」――終わったのは、店が閉まる間際だった。|{a}は、{b}の分の缶コーヒーも買ってきた。二人は黙って、同じ画面をにらんだ。|{b}が大きく伸びをした。{a}「帰ろう｜＝｜帰りましょう」{b}「あと十分｜＝｜あと十分です」――十分は、三十分になった。',
{at:'work.office',tm:'en',rel:'colleague'});
E('d_school_am','bond','p','fc*.4+.3','','ab:aff2;ba:aff2',
'校門の前で、{a}は{b}に追いついた。{a}「宿題やった？｜宿題はやったか｜宿題、やりましたか？」{b}「やってない｜やっていない｜やっていません」――二人は並んで、少し早足になった。|{b}は、教室に入るなり{a}の机に飴を一つ置いた。{a}は気づいて、小さく手を上げた。|{a}と{b}は、予鈴が鳴るまで、昨日観たテレビの話をした。',
{at:'work.school',tm:'m',rel:'friend,colleague'});
E('d_school_lunch','bond','p','fc*.3+np*.3+.3','','ab:aff3;ba:aff3',
'昼休み、{a}と{b}は購買のパンを半分ずつ交換した。どちらも、相手のほうが当たりだと思っていた。|{b}は、{a}の弁当のおかずを一つだけもらった。お返しに、自分の卵焼きを置いていった。|{a}と{b}は、屋上へ続く階段に座って昼ごはんを食べた。',
{at:'work.school',tm:'d',rel:'friend,colleague'});
E('d_school_after','bond','p','ac*.3+np*.3+.3','','ab:aff3,trust2;ba:aff3,trust2',
'がらんとした放課後の教室で、{a}と{b}は日直の日誌を書いた。三行目で、書くことがなくなった。|{a}は、部活帰りの{b}を昇降口で待っていた。{b}「待ってたの？｜待っていたのか｜待っていたんですか？」{a}「たまたま｜＝｜たまたまです」|{a}と{b}は、夕日の差す廊下を並んで歩いた。話すことがなくても、気まずくはなかった。',
{at:'work.school',tm:'e',rel:'friend,colleague'});
E('d_isl_beach','bond','p','fc*.4+.3','','ab:aff2,trust2;ba:aff2,trust2',
'{a}と{b}は、浜辺で使えそうなものを拾い集めた。{b}が見つけた瓶の中には、何も入っていなかった。|{b}が、波打ち際で平たい石を投げた。四回跳ねた。{a}は五回を狙って、二回で沈めた。|{a}と{b}は、砂の上に大きく字を書いた。波が来るたびに、少しずつ消えていった。',
{at:'island.beach',tm:'mde',rel:'any'});
E('d_isl_spring','bond','p','np*.4+.3','','ab:aff2,trust2;ba:aff2,trust2;as:-4;bs:-4',
'{a}と{b}は、泉で顔を洗った。水の冷たさに、二人そろって声を上げた。|{b}は、汲んだ水を{a}に先に飲ませた。{a}「毒見？｜毒見か｜毒見ですか？」{b}「親切｜親切だな｜親切です」|{a}と{b}は、泉のほとりでしばらく足を水に浸していた。',
{at:'island.spring',tm:'md',rel:'any'});
E('d_isl_forest','bond','p','fc*.3+a*.3+.3','','ab:trust3;ba:trust3',
'{a}と{b}は、森で甘い実を見つけた。どちらが先に食べるかで、少しだけ揉めた。|{b}は、枝に引っかかった{a}の袖を外してやった。{a}「ありがとう｜＝｜ありがとうございます」{b}「どういたしまして」|{a}と{b}は、森の小道に目印の布を結びながら歩いた。帰り道は、迷わずに済んだ。',
{at:'island.forest',tm:'md',rel:'any'});
E('d_room_talk','bond','p','fc*.3+np*.3+.3','','ab:aff2,trust2;ba:aff2,trust2;as:-4;bs:-4',
'{a}と{b}は、白い壁にもたれて、この部屋を出たら何を食べたいかを言い合った。三つ目あたりで、二人とも空腹を思い出した。|{b}は、差し入れのトレーを二つに分けて、多いほうを{a}に寄せた。|{a}と{b}は、時計のない部屋で、しりとりを始めた。百を超えたあたりで、どちらも数えるのをやめた。|{a}は、壁の継ぎ目を探すふりをして、{b}の隣に腰を下ろした。',
{at:'room.corner,room.table',tm:'mden',rel:'any',mood:SOFT});
E('d_room_routine','bond','p','a*.4+.3','','ab:trust3;ba:trust3',
'{a}と{b}は、閉じ込められてから決めた順番どおりに、身の回りを整えた。決まりごとがあるだけで、少し落ち着いた。|{b}は、毎回同じ場所に座る{a}の癖に気づいて、少しだけ笑った。|{a}と{b}は、何回目か分からない食事を、向かい合って食べた。',
{at:'room.bed,room.table',tm:'mden',rel:'any'});
E('d_g_duty','bond','p','np*.4+a*.2+.3','n>=3','ab:trust2;ba:trust2;ga:aff1',
'当番の{a}が困っていると、{b}と{c}が何も言わずに手を貸した。三人でやると、あっという間に終わった。|{a}は当番表を作り、{b}が文句を言い、{c}が黙ってその表を壁に貼った。|{a}と{b}は当番を押しつけ合ったが、見かねた{c}がじゃんけんで決めさせた。負けたのは{c}本人だった。',
{at:'work.school,island.base,home.kitchen',tm:'de',rel:'any',g:1});
E('d_g_seat','bond','p','np*.4+fc*.2+.3','n>=3','ab:aff2;ba:aff2',
'{a}が早めに来て、みんなの分の席を取っておいた。遅れて来た{b}と{c}は、口をそろえて礼を言った。|{b}は、{a}と{c}の分まで場所を取ろうとして、荷物を広げすぎた。|席の並びで、{a}と{b}と{c}は少しだけ揉めた。結局、くじ引きで決めた。',
{at:'town.famires,trip.fireworks,town.park,work.school',tm:'den',rel:'any',g:1});
E('d_g_game','bond','p','fc*.5+.3','n>=3','ab:aff2;ba:aff2;ga:aff1',
'{a}の提案で、ゲーム大会が始まった。{b}が勝ち続け、{c}が本気で悔しがった。決着がつくまで、誰もやめようと言わなかった。|{a}と{b}と{c}は、トランプで罰ゲームを賭けた。負けた{b}は、みんなの飲み物を取りに行かされた。|{c}がルールを勝手に増やすので、ゲームは途中から誰にも分からなくなった。{a}と{b}は、それでも笑っていた。|じゃんけん大会の決勝は、{a}と{c}だった。{b}が審判を務め、勝負は七回のあいこまでもつれた。',
{at:'home.living,room.corner,trip.onsen',tm:'en',rel:'any',g:1});
E('d_g_nabe','bond','p','np*.4+fc*.3+.3','n>=3','ab:aff2;ba:aff2;ga:aff1',
'{a}と{b}と{c}は、一つの鍋を囲んだ。{b}が具を入れる順番にこだわり、{c}は気にせず全部入れた。|鍋奉行の{a}は、{b}と{c}の箸の動きを厳しく見張っていた。{b}「もう食べていい？｜もう食べていいか｜もう食べていいですか？」{a}「まだ｜＝｜まだです」|{c}が最後の肉を取ろうとした瞬間、{a}と{b}の箸も同時に伸びた。三人は顔を見合わせて、じゃんけんを始めた。|締めの雑炊を作る係は、{b}に決まった。{a}と{c}は、鍋の前で真剣に見守った。',
{at:'home.living,trip.onsen',tm:'en',rel:'any',g:1});
E('d_g_move','help','p','np*.5+.3','n>=3','ab:aff2,trust2;ba:aff2,trust3',
'{a}の引っ越しを、{b}と{c}が手伝った。段ボールの中から古い漫画が出てくるたびに、作業が止まった。|{b}と{c}が重い棚を運び、{a}が指示を出した。{c}「もっと右｜＝｜もっと右です」{b}「さっき左って言ったじゃん｜さっき左と言った｜さっき左と言いましたよ」|引っ越しが終わったあと、{a}と{b}と{c}は、何もない部屋の床に座ってピザを食べた。',
{at:'home.living',tm:'d',rel:'any',g:1});
E('d_g_guest','bond','p','np*.4+fc*.2+.3','n>=3','ab:aff2;ba:aff2',
'{a}の家に、{b}と{c}が遊びに来た。{a}は前の日から張り切って掃除をしていた。|来客の{c}は、手土産のケーキを{a}と{b}の前に置いた。{a}「三つしかないよ｜三つしかない｜三つしかありません」{c}「三人だから｜三人だからな｜三人ですから」|{b}が淹れたお茶を、{a}と{c}は同時に「濃いよ｜濃い｜濃いです」と言った。{b}は聞こえないふりをした。',
{at:'home.living,home.entrance',tm:'de',rel:'any',g:1});
E('d_g_sea','bond','p','fc*.5+.3','n>=3','ab:aff2;ba:aff2;ga:aff1',
'{a}と{b}と{c}は、砂浜でビーチボールを打ち合った。{c}の打ったボールは、毎回あらぬ方向へ飛んでいった。|{b}が砂に埋められ、{a}と{c}がその上に立派な城を作った。|{a}は、{b}と{c}の分のかき氷を買ってきた。三人の舌は、それぞれ違う色になった。',
{at:'trip.sea',tm:'d',rel:'any',g:1});
E('d_g_isl','bond','p','np*.3+a*.3+.3','n>=3','ab:trust2;ba:trust2;ga:trust1',
'{a}と{b}と{c}は、{place}で一日の収穫を並べた。{c}の取ってきた貝がいちばん多くて、{c}はしばらく得意げだった。|{b}が火の番をし、{a}と{c}が交代で薪を運んだ。手順が決まると、島の暮らしは少し楽になった。|{a}と{b}と{c}は、次の日の当番を決めた。誰がいちばん早起きかで、少しだけ揉めた。',
{at:'island.beach,island.base',tm:'de',rel:'any',g:1});
E('d_g_room','bond','p','np*.3+fc*.3+.3','n>=3','ab:aff2,trust1;ba:aff2,trust1',
'{a}と{b}と{c}は、差し入れの食事を三等分した。{c}が切り分けると、なぜか毎回{c}の分が少し大きかった。|{a}が「この部屋の決まりごと」を作ろうと言い出し、{b}と{c}が一つずつ案を出した。|{a}と{b}と{c}は、ここを出たら最初に行きたい場所を順番に言った。三人とも、なぜか食べ物の店だった。',
{at:'room.corner,room.table',tm:'mden',rel:'any',g:1});
E('d_g_photo','bond','p','fc*.5+.3','n>=3','ab:aff2;ba:aff2',
'{a}が腕を伸ばして、{b}と{c}と一緒に写真を撮った。三人とも、目をつむっていた。|集合写真で、{b}はいつも端に立とうとした。{a}と{c}が両側から引っぱって、真ん中に立たせた。|{c}がタイマーをセットして走ってきたが、間に合わなかった。写真には、{a}と{b}と、{c}の背中が写っていた。',
{at:'trip.sea,trip.onsen,trip.festival,town.park',tm:'de',rel:'any',g:1});
E('d_g_lunch','bond','p','np*.3+fc*.3+.3','n>=3','ab:aff2;ba:aff2',
'昼休み、{a}と{b}と{c}は机をくっつけて弁当を広げた。おかずの交換は、毎回同じ相手と同じものだった。|{b}と{c}は、元気のない{a}を、昼休みに甘いもので励ました。|{a}と{b}と{c}は、昼休みにそろって同じものを頼もうとして、最後の一つを譲り合った。',
{at:'work.school,work.office',tm:'d',rel:'any',g:1});
var LOVE_AT='home.living,town.famires,trip.festival,trip.onsen,work.school,island.base,room.table';
E('d_gl_cheer','bond','p','np*.3+fc*.4+.3','n>=3','ab:aff2;ba:aff2,trust2',
'{a}は、並んで座る{b}と{c}を見て、わざとらしく咳払いした。{a}「はいはい、お二人さん」――{b}は赤くなり、{c}は笑って{b}の肩を叩いた。|{a}は、{b}と{c}の分の飲み物を先に用意しておいた。{a}「たまには二人でゆっくりして｜たまには二人でゆっくりしろ｜たまには二人でゆっくりしてください」――{b}と{c}は顔を見合わせて、礼を言った。|{b}と{c}の小さな言い合いを、{a}が笑いながら仲裁した。{a}「はい、仲直りの握手｜ほら、仲直りの握手だ｜はい、仲直りの握手をしましょう」――二人はしぶしぶ、でも嬉しそうに手を握った。|{a}は、{b}が{c}の話ばかりするのを聞いて、にやにや笑った。{a}「ほんと、仲いいね｜本当に、仲がいいな｜本当に、仲がいいですね」',
{at:LOVE_AT,tm:'den',rel:'friend,any',g:1,love:'warm'});
E('d_gl_help','help','p','np*.5+.3','n>=3','ab:aff2;ba:aff2,trust3',
'{a}は、{c}への贈り物に迷う{b}の買い物に付き合った。三軒目でようやく決まると、{a}は自分のことのように喜んだ。|{b}は、{c}の好物の作り方を{a}に教わった。{a}「これで{c}も喜ぶよ｜これで{c}も喜ぶ｜これで{c}さんも喜びますよ」――味見をした{c}は、何も知らずにおかわりをした。|{a}は、{b}と{c}が並んで歩けるように、わざと少し後ろを歩いた。',
{at:'town.super,town.cafe,home.kitchen,work.school',tm:'de',rel:'friend,any',g:1,love:'warm'});
E('d_gl_yaki','conflict','p','jealous*.8+.5','n>=3','ab:ten3,att1;ba:aff2;jea',
'{b}が{c}の皿にばかり取り分けるのを見て、{a}は少しだけやきもちを焼いた。気づいた{b}は、{a}の皿にもいちばん大きいのをのせた。|{c}と楽しそうに話す{b}を、{a}は横目で見ていた。{a}「……楽しそうだね｜……楽しそうだな｜……楽しそうですね」――やきもちが声に出てしまって、{a}は自分で慌てた。|{b}が{c}の冗談に笑い転げるたび、{a}の口数が減っていった。小さなやきもちに先に気づいたのは{c}で、さりげなく席を外した。|{a}は、{b}が{c}の髪についた糸くずを取ってやるのを見て、胸の奥がちくりとした。小さなやきもちだった。',
{at:LOVE_AT,tm:'den',rel:'lovers',g:1,love:'yaki'});
E('d_gl_yaki2','conflict','p','jealous*.8+.5','n>=3','ab:ten3,att1;ba:aff2;jea',
'{b}が{c}の相談に長いこと乗っているあいだ、{a}はやきもきしながら待っていた。戻ってきた{b}に、{a}はわざとそっけなく「おかえり｜＝｜おかえりなさい」と言った。小さな嫉妬だった。|{c}が{b}を連れ出して買い出しに行った。残された{a}は、二人が戻るまで落ち着かなかった。やきもちだと、自分でも分かっていた。|{a}は、{b}と{c}の仲のよさに少し妬けて、その日は{b}の隣の席を誰にも譲らなかった。',
{at:'home.living,town.cafe,work.school,island.base,room.corner',tm:'de',rel:'lovers',g:1,love:'yaki'});
E('d_k_old','bond','p','np*.3+fc*.3+.3','','ab:aff3,trust2;ba:aff3,trust2',
'{a}と{b}は、小さいころに二人で隠したおやつの話をした。{b}「あれ、{yobi}が全部食べたんでしょ｜あれは、{yobi}が全部食べたんだろう｜あれ、{yobi}が全部食べたんでしょう」{a}「時効｜時効だ｜時効です」|{b}は、{a}が昔、自転車の乗り方を教えてくれた日のことを覚えていた。{a}は、転んで泣いた{b}のことしか覚えていなかった。|{a}と{b}は、実家の古い間取りを思い出しながら、どこで何をして叱られたかを数え上げた。数は{a}のほうが多かった。',
{at:'home.living,island.base,room.corner,town.famires,trip.onsen',tm:'en',rel:'family',kin:'sib',mood:SOFT});
E('d_k_ask','help','p','np*.4+.3','','ab:trust3;ba:trust3,aff2',
'{b}「{yobi}、ちょっと頼みがあるんだけど｜{yobi}、頼みがある｜{yobi}、ちょっと頼みがあります」{a}「お金以外なら｜＝｜お金以外なら」{b}「……じゃあいい｜……ならいい｜……では、いいです」{a}「冗談。何？｜冗談だ。何だ｜冗談です。何ですか？」|{a}は、{b}に頼まれた用事を、文句を言いながらも全部片づけた。{b}は、昔からこうだったと思い出した。|{a}に頼みごとをされた{b}は、一度は断って、三十分後には黙って引き受けていた。',
{at:'home.living,home.kitchen,island.base,room.table,town.cafe',tm:'de',rel:'family',kin:'sib'});
E('d_k_nag','conflict','p','cp*.4+np*.2+.2','','ab:ten2,trust1;ba:ten3',
'{a}「ちゃんと食べてる？｜ちゃんと食べているか｜ちゃんと食べていますか？」{b}「食べてるよ｜食べている｜食べています」{a}「何を｜＝｜何をですか」{b}「……いろいろ｜＝｜……いろいろです」――{a}の小言は、そこから十分続いた。|{b}は、{a}の脱ぎっぱなしの上着を拾いながら言った。{b}「それ昔から直ってない｜それは昔から直っていない｜それ昔から直っていません」|{a}は{b}の寝癖を指さして笑い、{b}は{a}の口の端のソースを指さして笑い返した。小言は、いつも相打ちだった。',
{at:'home.living,home.kitchen,island.base,room.corner',tm:'den',rel:'family',kin:'sib',mood:'calm,joy,anger'});
E('d_k_gift','help','p','np*.6+.3','','ab:aff3;ba:aff4,trust3;bs:-6',
'{a}は、{b}の好物を袋いっぱいに詰めて持ってきた。{a}「どうせ、ちゃんと食べてないと思って｜どうせ、ちゃんと食べていないと思ってな｜どうせ、ちゃんと食べていないと思って」{b}「……当たってる｜……当たっている｜……当たっています」|{b}は、疲れた顔の{a}に、温かい飲み物と甘いものを差し入れた。{a}「気が利くようになったね｜気が利くようになったな｜気が利くようになりましたね」{b}「前から｜前からだ｜前からです」|{a}は、{b}が好きだった駄菓子を見つけて、一つだけ買ってきた。{b}は懐かしそうに、それを半分に割った。|{b}は、差し入れの袋を{a}に押しつけた。中には、{a}が小さいころから好きなお菓子ばかり入っていた。',
{at:'home.entrance,home.kitchen,work.office,work.school,town.station',tm:'de',rel:'family',kin:'sib',mood:SOFT});
E('d_k_chores','bond','p','a*.3+np*.3+.3','','ab:trust3;ba:trust3',
'{a}が洗い物をし、{b}が拭いて棚に戻した。何も言わなくても、小さいころからの分担は変わっていなかった。|{a}と{b}は、どちらがゴミ出しをするかで、じゃんけんを三回やり直した。|{b}は、{a}が畳んだ洗濯物を、黙って畳み直した。{a}は見ないふりをした。',
{at:'home.kitchen,home.living',tm:'de',rel:'family',kin:'sib'});
E('d_p_old','bond','p','np*.4+.3','','ab:aff3,trust2;ba:aff3,trust2',
'{a}は、{b}が小さかったころの話を始めた。{b}「その話、もう百回聞いた｜＝｜その話、もう百回聞きました」{a}「百一回目｜百一回目だ｜百一回目です」|{b}は、{a}の若いころの写真を見て、しばらく黙った。{b}「……今の自分と、同じくらいの歳だ｜＝｜……今の自分と、同じくらいの歳です」|{a}と{b}は、昔の家族旅行で道に迷った話をした。迷った原因については、今も意見が分かれていた。',
{at:'home.living,island.base,trip.onsen',tm:'en',rel:'family',kin:'parent',mood:SOFT});
E('d_p_ask','help','p','np*.4+.3','','ab:trust3,aff2;ba:trust3',
'{b}は、{a}に頼まれた買い物のメモを見て苦笑いした。字の癖は、昔から変わっていなかった。|{a}は、{b}に重いものを運ぶのを頼んだ。{b}が軽々と持ち上げるのを見て、{a}は少しだけ寂しそうに笑った。|{b}「{oyayobi}、これの使い方分かる？｜{oyayobi}、これの使い方は分かるか｜{oyayobi}、これの使い方、分かりますか？」{a}「分からない｜＝｜分かりません」――二人で説明書を読んで、三十分かけてようやく動かした。',
{at:'home.living,home.kitchen,town.cafe',tm:'de',rel:'family',kin:'parent'});
E('d_p_nag','conflict','p','cp*.4+np*.3+.2','','ab:ten2;ba:ten3,trust1',
'{a}「ちゃんと寝てるの？｜ちゃんと寝ているのか｜ちゃんと寝ているんですか？」{b}「寝てるよ｜寝ている｜寝ています」{a}「顔に、寝てないって書いてある｜顔に、寝ていないと書いてある｜顔に、寝ていないと書いてあります」――{b}は返す言葉がなかった。|{a}の小言が三つ目に入ったところで、{b}は「はいはい｜＝｜はいはい」と立ち上がった。{a}は、その背中にまだ何か言っていた。|{b}は、{a}の口うるささに顔をしかめながらも、言われたとおりに上着を一枚羽織った。',
{at:'home.living,home.kitchen,home.entrance',tm:'den',rel:'family',kin:'parent',mood:'calm,joy,anger'});
E('d_p_gift','help','p','np*.6+.3','','ab:aff3;ba:aff4,trust3;bs:-6',
'{a}は、作りすぎたおかずをタッパーに詰めて、{b}に持たせた。{b}「多いよ｜多い｜多いです」{a}「残ったら冷凍｜残ったら冷凍だ｜残ったら冷凍です」|{b}は、{a}の好きな店の菓子を手土産に持ってきた。{a}は「無駄遣いしてね｜無駄遣いしろ｜無駄遣いしてください」と言いながら、いちばん先に箱を開けた。|{a}は、差し入れの袋の底に、手書きのメモを一枚忍ばせていた。{b}がそれに気づいたのは、家に帰ってからだった。',
{at:'home.entrance,home.kitchen,work.office,town.station',tm:'de',rel:'family',kin:'parent',mood:SOFT});
E('d_r_old','bond','p','fc*.4+.3','','ab:aff3;ba:aff3',
'{a}と{b}は、{shin}の集まりで毎年同じ席に座らされた話をした。二人とも、あの席が苦手だった。|{b}は、{a}が昔、お年玉をこっそり多めにくれたことを覚えていた。{a}「覚えてなくていいのに｜覚えていなくていいのに｜覚えていなくていいのに」|{a}と{b}は、{shin}のおばさんの口癖を真似し合って、声を殺して笑った。',
{at:'home.living,trip.onsen,island.base',tm:'en',rel:'family',kin:'rel'});
E('d_r_gift','help','p','np*.5+.3','','ab:aff2,trust2;ba:aff3,trust2',
'{a}は、田舎から送られてきた野菜を、{b}の分まで袋に分けて持ってきた。|{b}は、{shin}から預かった荷物を{a}に届けに来た。荷物より、{b}の近況報告のほうが長かった。|{a}と{b}は、{shin}の結婚祝いを何にするかで、駅前の店を三軒回った。',
{at:'home.entrance,home.kitchen,town.station',tm:'de',rel:'family',kin:'rel'});
E('d_r_ask','help','p','np*.4+.3','','ab:trust3;ba:trust3',
'{b}「{shin}で頼めるの、{a}くらいしかいなくて｜{shin}で頼める者は、{a}くらいしかいなくてな｜{shin}で頼めるのが、{a}さんくらいしかいないんです」{a}「で、何？｜で、何だ｜で、何ですか？」――頼みごとは、思ったより小さなことだった。|{a}は、{b}の相談を最後まで黙って聞いて、それから「任せて｜任せろ｜任せてください」と言った。|{b}は、{a}に頼まれた用事を、ついでのように片づけておいた。{shin}づきあいは、それくらいの距離がちょうどよかった。',
{at:'home.living,town.cafe,island.base',tm:'de',rel:'family',kin:'rel'});
var BUILT=null;
function build(){
if(BUILT)return BUILT;
if(!HK.E)return[];
BUILT=SPECS.map(function(s){
var ev=HK.E.apply(null,s.args),m=s.meta;
ev.daily=true;
ev.dm={
at:m.at.split(','),tm:m.tm.split('').map(function(c){return TC[c];}),rel:m.rel.split(','),
mood:(m.mood||CALM).split(','),g: !!m.g,love:m.love||'',kin:m.kin||'',
texts:String(s.args[6]).split('|')
};
return ev;
});
return BUILT;
}
D.build=build;
try{
Object.defineProperty(HK.MINI,'daily',{
configurable:true,enumerable:true,
get:function(){return build().concat(D.extra||[]);},
set:function(v){var b=build();D.extra=(v||[]).filter(function(e){return b.indexOf(e)<0;});}
});
}catch(e){}
var CONF=(D.CONF={});
function monthOf(ctx){var m= /^(\d{1,2})月/.exec(ctx.label||'');return m? +m[1]:null;}
function spotsFor(ctx,ev,conf,a,b){
var M=monthOf(ctx),out=[];
ev.dm.at.forEach(function(id){
if(conf.spots.indexOf(id)<0)return;
if(conf.allow&& !conf.allow(ctx,id,ev,a,b))return;
if(conf.homeLovers===false&&id.indexOf('home.')===0&&ev.dm.rel.indexOf('lovers')>=0)return;
var S=D.spot(id);
if(S.months&&M!=null&&S.months.indexOf(M)<0)return;
ev.dm.tm.forEach(function(t){
if(conf.timeOf&&conf.timeOf(ctx)&&conf.timeOf(ctx)!==t)return;
var w=S.time[t]||0;
if(conf.noNight&&t==='night'&&conf.noNight.indexOf(id.split('.')[0])>=0)w=0;
if(w>0)out.push({spot:id,time:t,w:w});
});
});
return out;
}
function moodOk(ev,a,b){return ev.dm.mood.indexOf(D.mood(a))>=0&&(!b||ev.dm.mood.indexOf(D.mood(b))>=0);}
function relOk(ctx,ev,a,b){for(var i=0;i<ev.dm.rel.length;i++){var f=D.REL[ev.dm.rel[i]];if(f&&f(ctx,a,b))return true;}return false;}
function unused(ctx,ev){var U=ctx._dailyUsed||{};return ev.dm.texts.some(function(t){return!U[t];});}
function thirdFor(ctx,ev,a,b){
var O=ctx.others(a).filter(function(o){return o!==b&&o.alive!==false&&ctx.others(b).indexOf(o)>=0;});
if(ev.dm.love==='warm'){
if(couple(ctx,a,b)||ctx.R(a,b).att>40)return null;
O=O.filter(function(c){return lovers(ctx,b,c)&& !couple(ctx,a,c)&&ctx.R(a,c).aff>0&&ctx.R(a,c).att<40;});
}else if(ev.dm.love==='yaki'){
if(!lovers(ctx,a,b))return null;
O=O.filter(function(c){return!couple(ctx,a,c)&& !couple(ctx,b,c)&& !famTie(ctx,b,c)&& !(HK.Obsess&&HK.Obsess.coLove&&HK.Obsess.coLove(ctx,a,c,b))&&ctx.R(b,c).aff> -5;});
}
return O.length?O:null;
}
function eligible(ctx,a,b,conf){
var key=ctx.stepIndex+':'+a.i+':'+(b?b.i:'-')+':'+ctx.log.length;
if(ctx._dEl&&ctx._dEl.key===key)return ctx._dEl.list;
var list=[];
if(b&&(!conf.when||conf.when(ctx))){
var tieOff=ctx.env&&ctx.env.tieEv==='off',n=ctx.present().length;
build().forEach(function(ev){
if(ev.dm.g&&n<3)return;
if(ev.dm.kin){
if(tieOff)return;
var ft=famTie(ctx,a,b);
if(!ft||ft.kind!==ev.dm.kin||couple(ctx,a,b))return;
if(ft.t.noev==='off')return;
}else if(!relOk(ctx,ev,a,b))return;
if(!moodOk(ev,a,b))return;
if(ev.cat==='romance'&&(!ctx.romanceOk([a,b])||HK.lockOut(a,b)))return;
if(!unused(ctx,ev))return;
var S=spotsFor(ctx,ev,conf,a,b);
if(!S.length)return;
if(ev.when&& !ev.when(ctx,a,b))return;
var cs=null;
if(ev.dm.g){cs=thirdFor(ctx,ev,a,b);if(!cs)return;}
var w=ev.w(ctx,a,b)*(ev.dm.love==='warm'?0.6:ev.dm.love==='yaki'?1.4:ev.dm.g?0.5:1);
if(ev.dm.kin&&ft&&ft.t.kg)w*=ft.t.kg==='bad'?(ev.cat==='conflict'?1.8:0.4):(ev.cat==='conflict'?0.4:1.4);
if(!(w>0))return;
list.push({ev:ev,w:w,spots:S,cs:cs});
});
}
ctx._dEl={key:key,list:list};
return list;
}
function pickProp(ctx,spot,time){
var U=ctx._dailyUsed,S=D.spot(spot),tag=time.charAt(0);
var ok=S.props.filter(function(p){var m= /^\[([mden]+)\]/.exec(p);return!m||m[1].indexOf(tag)>=0;}).filter(function(p){return!U[p];});
if(!ok.length)return'';
var p=ctx.rng.pick(ok);U[p]=1;
return p.replace(/^\[[mden]+\]/,'');
}
D.FOOD={d_breakfast:'meal',d_cook:'meal',d_g_nabe:'meal',d_dineout:'out',d_famires:'out',d_date_cafe:'out',d_picky:'picky',
d_shop:'gift',d_k_gift:'gift',d_p_gift:'gift',d_school_lunch:'share',d_g_lunch:'share'};
function runDaily(ctx,a,b,conf){
var list=eligible(ctx,a,b,conf);
if(!list.length)return null;
var it=HK.weighted(ctx.rng,list,function(x){return x.w;}),ev=it.ev;
var U=ctx._dailyUsed=ctx._dailyUsed||{};
var where=HK.weighted(ctx.rng,it.spots,function(x){return x.w;});
var A=a,B=b,tk=null,ft=null;
if(ev.dm.kin){ft=famTie(ctx,a,b);var o=orient(ctx,a,b,ft);A=o[0];B=o[1];tk=kinTokens(ft,A,B);}
var C=it.cs?ctx.pick(it.cs):null;
var texts=ev.dm.texts,had={pick:Object.prototype.hasOwnProperty.call(ctx,'pick'),others:Object.prototype.hasOwnProperty.call(ctx,'others')};
var pick0=ctx.pick,others0=ctx.others,res,food=null;
ctx._dailyCur={spot:where.spot,time:where.time};
ctx.pick=function(arr){
if(Array.isArray(arr)&&typeof arr[0]==='string'&&arr.some(function(t){return texts.indexOf(t)>=0;})){
var f=arr.filter(function(t){return!U[t];});
var t=pick0.call(this,f.length?f:arr);
if(texts.indexOf(t)>=0)U[t]=1;
return t;
}
return pick0.call(this,arr);
};
if(C)ctx.others=function(x){return x===A?[C]:others0.call(this,x);};
try{
res=ev.run(ctx,A,B);
if(res&&res.text&&HK.Food&&D.FOOD[ev.id])food=HK.Food.daily(ctx,D.FOOD[ev.id],A,B,C);
}
finally{
if(had.pick)ctx.pick=pick0;else delete ctx.pick;
if(had.others)ctx.others=others0;else delete ctx.others;
ctx._dailyCur=null;
}
if(!res|| !res.text)return null;
var text=fill(res.text,tk);
if(ft&&ft.kind==='sib'&&ctx.rng()<0.5){
var SL=D.SIB_LINE[sibKey(A,B,ft.t)]||D.SIB_LINE['きょうだい'],sl=SL.filter(function(x){return!U[x];});
if(sl.length){var line=ctx.rng.pick(sl);U[line]=1;text+=ctx.t(line,A,B);}
}
if(food&&food.text){text+=food.text;res.why=(res.why||'その場の流れ')+'／'+food.why;}
if(HK.Attr&&HK.Attr.heightDaily&&HK.Attr.heightDiff(A,B)){var hgt=HK.Attr.heightDaily(ctx,A,B,lovers(ctx,A,B),U);if(hgt){text+=hgt;res.look=true;}}
if(ctx.rng()<0.4){var pr=pickProp(ctx,where.spot,where.time);if(pr)text=pr+text;}
var S=D.spot(where.spot),tag='';
if(ev.dm.love==='warm')tag='（日常の三人・仲良し）';
else if(ev.dm.love==='yaki')tag='（日常の三人・やきもち）';
else if(ev.dm.g)tag='（日常・三人以上）';
else if(ft)tag='（日常・'+(ft.kind==='sib'?tk.kind:ft.kind==='parent'?'親子':'親族')+'）';
res.text=text;
res.cat=ev.cat;
res.why='日常（'+TL[where.time]+'・'+S.full+'）：'+(res.why||'その場の流れ')+tag;
if(C&& !res.with)res.with=[C];
return res;
}
D.run=runDaily;
D.BASE=7;
function hubW(id,conf){
if(conf._n==null)conf._n=Math.max(20,((HK.MINI[id]||[]).length));
return conf.weight*D.BASE*conf._n/50;
}
D.install=function(scen,opts){
var id=typeof scen==='string'?scen:scen&&scen.id;
if(!id)return null;
opts=opts||{};
var conf=CONF[id]={spots:expand(opts.places||['home','town']),weight:opts.weight==null?1:opts.weight,when:opts.when||null,homeLovers:opts.homeLovers,noNight:opts.noNight||null};
var ev={
id:'daily_'+id,cat:'bond',scope:'pair',mini:true,noOdd:true,dailyHub:true,
when:function(ctx,a,b){return!!b&&eligible(ctx,a,b,conf).length>0;},
w:function(){return hubW(id,conf);},
run:function(ctx,a,b){return runDaily(ctx,a,b,conf);}
};
HK.MINI[id]=(HK.MINI[id]||[]).filter(function(e){return e.id!==ev.id;}).concat([ev]);
if(typeof scen==='object'&&opts.main)scen.places=conf.spots;
return ev;
};
D.install('classroom',{places:['work.school','town.cafe','town.super','town.park','town.station','town.famires','trip.sea','trip.festival','trip.fireworks','home.living','home.kitchen','home.entrance'],weight:0.3,homeLovers:false,noNight:['town']});
D.install('omega',{places:['home','town','trip','work.office'],weight:0.3});
D.install('island',{places:['island'],weight:0.3,when:function(ctx){
var P=ctx.present();if(P.length<2||ctx.stepIndex<2)return false;
var st=P.reduce(function(s,c){return s+(c.stress||0);},0)/P.length;
return(ctx.food||0)>=P.length*6&&st<55;
}});
D.install('whiteroom',{places:['room'],weight:0.3,when:function(ctx){return+((ctx.env||{}).hours)>=48&&ctx.stepIndex>=3;}});
D.PLACES.yakata={label:'吹雪の館',spots:{
lounge:sp('談話室','吹雪の館の談話室',[1,3,3,1],'談話室の柱時計が、低い音で時を刻んでいた。|テーブルの上には、誰かが置きっぱなしにしたチェス盤があった。|窓の外では、吹雪が途切れずに鳴っていた。|本棚には、背表紙の色あせた洋書がぎっしり並んでいた。|[en]ランプの灯りが、談話室の隅に柔らかな影を落としていた。'),
hearth:sp('暖炉の前','吹雪の館の暖炉の前',[1,1,3,3],'暖炉の薪が、ぱちりと音を立ててはぜた。|炉棚の上で、古い置き時計の振り子が揺れていた。|[n]暖炉の火だけが、広間をほの赤く照らしていた。|敷物の上には、誰かが畳んだ毛布が置いてあった。|火のそばに干した手袋から、かすかに湯気が立っていた。'),
guest:sp('客室','吹雪の館の客室',[3,1,1,3],'客室の窓には、霜が細かな模様を描いていた。|[m]カーテンの隙間から、雪明かりが白く差し込んでいた。|[n]枕元のランプが、小さく灯っていた。|寝台の脇の水差しには、まだ半分ほど水が残っていた。|扉の鍵は、二重にかけてあった。'),
court:sp('雪の中庭','吹雪の館の雪の中庭',[2,3,2,0],'中庭の噴水は、すっかり凍りついていた。|積もった雪が、足音を吸い込んでいった。|[d]雲の切れ間から、薄い日差しが雪の上にこぼれた。|庭木の枝から、雪の塊がどさりと落ちた。|吐く息が、白く長く伸びていった。')
}};
D.PLACES.village={label:'地図にない村',spots:{
inn:sp('宿','村の民宿',[2,1,3,3],'民宿の廊下は、歩くたびにぎしりと鳴った。|囲炉裏の鉄瓶が、しゅんしゅんと湯気を上げていた。|[n]行灯の明かりが、障子に二人の影を映していた。|部屋の隅には、色あせた布団が重ねてあった。|[m]台所から、味噌汁の匂いが漂ってきた。'),
shrine:sp('社','村の社',[2,2,2,0],'社の鈴の緒は、風もないのに小さく揺れていた。|苔むした狛犬が、参道の両脇からこちらを見下ろしていた。|境内の杉の木立が、昼でも薄暗い影を落としていた。|賽銭箱の上に、誰かが供えた野の花が置いてあった。|石段の隙間から、細い草が伸びていた。'),
field:sp('畑','村の畑',[2,3,2,0],'畑の畝には、見たことのない赤い葉の作物が並んでいた。|遠くで、案山子が首をかしげたように傾いていた。|用水路の水が、ちょろちょろと音を立てて流れていた。|[d]青い空の下で、虫の羽音だけが聞こえていた。|[e]夕焼けが、畑一面を橙色に染めていた。'),
engawa:sp('夜の縁側','民宿の夜の縁側',[0,0,1,3],'[n]縁側の向こうで、蛍が一つ、また一つと光った。|蚊取り線香の煙が、ゆっくりと夜気に溶けていった。|[n]月明かりが、庭の飛び石を白く浮かび上がらせていた。|軒下の風鈴が、ちりんと一度だけ鳴った。|縁側の板は、昼の温もりをまだ少し残していた。')
}};
D.STORY=D.STORY||{};
D.STORY.yakata={places:'yakata',scenes:[
{at:['lounge','hearth'],t:L('{a}は{b}の隣に腰を下ろし、そっと肩を寄せた。{b}は読みかけの本を閉じて、{a}の手に自分の手を重ねた。{a}「こんな時なのに、あなたの隣だと落ち着く｜こんな時だというのに、あなたの隣だと落ち着く｜こんな時なのに、あなたの隣だと落ち着きます」{b}「……私も。今だけ、こうしていよう｜……私もだ。今だけ、こうしていよう｜……私もです。今だけ、こうしていましょう」')},
{at:['hearth'],t:L('暖炉の前で、{a}は{b}の冷えた指先を両手で包み、息を吹きかけて温めた。{b}は照れくさそうに笑って、{a}の額に自分の額をこつんと当てた。{b}「誰かに見られたら、どうするの｜誰かに見られたら、どうする｜誰かに見られたら、どうするんですか」{a}「見せておけばいい。恋人なんだから｜見せておけばいい。恋人なのだから｜見せておけばいいんです。恋人なんですから」')},
{at:['guest'],t:L('客室の扉に鍵をかけてから、{a}は{b}を後ろから抱きしめた。{b}は{a}の腕に手を添えて、しばらく黙って吹雪の音を聞いていた。{b}「明日も、ちゃんと隣にいて｜明日も、ちゃんと隣にいてくれ｜明日も、ちゃんと隣にいてください」{a}「約束する。どこにも行かない｜＝｜約束します。どこにも行きません」')},
{at:['court'],t:L('雪の中庭を見回る途中で、{b}が足を滑らせた。{a}がとっさに抱きとめると、二人の顔がすぐそこにあった。{a}は少し迷ってから、{b}の頬に軽く口づけた。{b}「……見回りの途中だよ｜……見回りの途中だぞ｜……見回りの途中ですよ」{a}「だから、少しだけ｜だから、少しだけだ｜だから、少しだけです」')},
{at:['lounge'],t:L('談話室のチェス盤を挟んで、{a}と{b}は向かい合っていた。{b}が駒を動かすたびに、テーブルの下で二人の膝が触れた。{a}「わざと負けてくれてるでしょ｜わざと負けているだろう｜わざと負けてくれていますよね」{b}「勝ったら何かくれるなら、本気を出す｜勝ったら何かくれるのなら、本気を出す｜勝ったら何かいただけるなら、本気を出します」')},
{at:['court','lounge'],t:L('窓辺で雪を見ていた{b}の首に、{a}が自分のマフラーを巻きつけた。巻き終えたあとも、{a}はマフラーの端を離さなかった。{b}「これじゃ、あなたが寒いよ｜これでは、あなたが寒いだろう｜これでは、あなたが寒いでしょう」{a}「寒くなったら、あなたにくっつくから平気｜寒くなったら、あなたにくっつくから平気だ｜寒くなったら、あなたにくっつきますから平気です」')}
]};
D.STORY.jashin={places:'village',scenes:[
{at:['inn'],t:L('民宿の囲炉裏端で、{a}は{b}の湯呑みに茶を注ぎ足した。手渡すとき、{b}の指がわざと{a}の指に触れた。{b}「村を出たら、二人でどこかの温泉に行こう｜＝｜村を出たら、二人でどこかの温泉に行きましょう」{a}「生きて帰る理由が、またひとつ増えた｜＝｜生きて帰る理由が、またひとつ増えました」')},
{at:['shrine'],t:L('社の石段に並んで腰かけ、{a}と{b}は手を繋いだまま村を見下ろしていた。{a}がそっと肩にもたれると、{b}は黙って頭を撫でた。{a}「神様の前でこんなことしたら、罰が当たるかな｜神の前でこんなことをしたら、罰が当たるだろうか｜神様の前でこんなことをしたら、罰が当たるでしょうか」{b}「当たるなら、私が全部引き受ける｜＝｜当たるなら、私が全部引き受けます」')},
{at:['field'],t:L('畑の畦道で、{b}が{a}の髪についた藁くずを摘まみ取った。そのまま{b}の指は、{a}の頬をなぞって離れなかった。{a}「村の人が見てる｜村の者が見ている｜村の人が見ています」{b}「見せつけておけば、誰も手を出さない｜見せつけておけば、誰も手を出さないだろう｜見せつけておけば、誰も手を出しませんよ」')},
{at:['engawa'],t:L('夜の縁側で、{a}と{b}は一枚の羽織に二人でくるまっていた。蛍の光が通り過ぎるたびに、{b}は{a}の手を握り直した。{b}「怖いのに、今だけは少し幸せ｜怖いはずなのに、今だけは少し幸せだ｜怖いはずなのに、今だけは少し幸せです」{a}「私も。……帰っても、またこうしよう｜私もだ。……帰っても、またこうしよう｜私もです。……帰っても、またこうしましょう」')},
{at:['inn'],t:L('布団を並べて敷いたあと、{b}は{a}の布団にそっと潜り込んだ。{a}は何も言わずに場所を空け、{b}を腕の中に収めた。{a}「あなたの足、冷たい｜あなたの足は、冷たい｜あなたの足、冷たいですね」{b}「だから温めて。……今夜は離れないで｜だから温めてくれ。……今夜は離れるな｜だから温めてください。……今夜は離れないでください」')},
{at:['engawa','shrine'],t:L('{a}は摘んできた野の花を一輪、{b}の髪に挿した。{b}は照れ隠しに{a}の袖を引き、短く口づけた。{b}「こういうことは、無事に帰ってからにして｜こういうことは、無事に帰ってからにしろ｜こういうことは、無事に帰ってからにしてください」{a}「じゃあ、続きは帰ってから｜では、続きは帰ってからだ｜では、続きは帰ってからにします」')}
]};
D.storyLove=function(S,id,a,b,time){
var C=D.STORY[id],G=C&&D.PLACES[C.places];
if(!G|| !a|| !b|| !S|| !S.rng)return null;
var U=S._dailyUsed=S._dailyUsed||{},cand=[];
C.scenes.forEach(function(sc,k){
sc.at.forEach(function(sid){var s=G.spots[sid],w=s&&s.time[time]||0;if(w>0)cand.push({sc:sc,k:k,sid:sid,w:w*(U[id+':'+k]?0.15:1)});});
});
if(!cand.length)return null;
var c=HK.weighted(S.rng,cand,function(x){return x.w;}),s=G.spots[c.sid],tag=time.charAt(0);
U[id+':'+c.k]=1;
var props=s.props.filter(function(p){var m= /^\[([mden]+)\]/.exec(p);return(!m||m[1].indexOf(tag)>=0)&& !U[p];});
var prop=props.length?props[Math.floor(S.rng()*props.length)]:'';
if(prop)U[prop]=1;
var lines=c.sc.t.filter(function(t){return!U[t];}),t=(lines.length?lines:c.sc.t)[Math.floor(S.rng()*(lines.length||c.sc.t.length))];
U[t]=1;
return{text:prop.replace(/^\[[mden]+\]/,'')+t.replace(/\{a\}/g,a.name).replace(/\{b\}/g,b.name),spot:c.sid,label:s.label};
};
})();
});
;
/* ==== js/hate-kit.js ==== */
HK.Load.def(38,'js/hate-kit.js',function(){
(function(){
'use strict';
var HK=window.HK,clamp=HK.clamp;
if(!HK.TL)return;
var TL=HK.TL;
function L(s){return s.split('|');}
function isCtx(x){return!!(x&&x.R&&x.pair&&x.chars);}
function tieList(x,a,b){
if(isCtx(x))return HK.Ties?HK.Ties.all(x,a,b):[];
return(x.ties||[]).filter(function(t){return(t.a===a.i&&t.b===b.i)||(t.a===b.i&&t.b===a.i);});
}
function hateTie(x,a,b){
var l=tieList(x,a,b);
for(var i=0;i<l.length;i++){var D=HK.TIES[l[i].type];if(D&&D.hate&&l[i].a===a.i)return l[i];}
for(var j=0;j<l.length;j++){var D2=HK.TIES[l[j].type];if(D2&&D2.hate&& !l[j].cold)return l[j];}
return null;
}
function backOf(x,a,b){
var l=tieList(x,a,b);
for(var i=0;i<l.length;i++){var D=HK.TIES[l[i].type];if(D&&D.hate&&l[i].a===a.i&&l[i].cold)return l[i].cold;}
return'';
}
var LOVE_T='lover,mate,fated,almost,crush,fwb',FRIEND_T='friend,best,buddy,childhood,colleague,sibclose,twin,sibling,senpai,mentor,classmate,boss,benefactor,relative,worship,fond,blind';
function hasT(x,a,b,list){return tieList(x,a,b).some(function(t){return list.split(',').indexOf(t.type)>=0&&(t.type!=='crush'||t.a===a.i);});}
function storyMap(S){
if(S.hate)return S.hate;
var m=S.hate={};
(S.ties||[]).forEach(function(t){
var D=HK.TIES[t.type];
if(!D|| !D.hate)return;
var v=D.hate===2?(t.grade==='hate'?92:78):46;
m[t.a+'>'+t.b]=Math.max(m[t.a+'>'+t.b]||0,v);
if(!t.cold)m[t.b+'>'+t.a]=Math.max(m[t.b+'>'+t.a]||0,v);
});
return m;
}
var H=HK.HateKit={
level:function(x,a,b){
if(!a|| !b||a===b)return 0;
if(isCtx(x)){var r=x.R(a,b);return clamp(r.ten*0.9-r.aff*0.7,0,100);}
return storyMap(x)[a.i+'>'+b.i]||0;
},
hater:function(x,a,b){return!backOf(x,b,a)&&H.level(x,a,b)>=35;},
band:function(lv){return lv>=65?'enemy':lv>=35?'bad':'';},
shift:function(x,a,b,d){
var b0=H.band(H.level(x,a,b));
if(isCtx(x))x.mod(a,b,d>0?{ten:d*0.8,aff: -d*0.4}:{ten:d*0.6,aff: -d*0.6});
else{var m=storyMap(x),k=a.i+'>'+b.i;m[k]=clamp((m[k]||0)+d,0,100);}
var b1=H.band(H.level(x,a,b));
if(b0===b1)return'';
if(b1==='enemy')return a.name+'の胸の内で、'+b.name+'への苛立ちは、はっきりとした敵意に変わった。';
if(b0==='enemy')return a.name+'の'+b.name+'への敵意は、少しだけ角が取れた。まだ、好きにはなれないけれど。';
if(b1==='bad')return a.name+'は、いつの間にか'+b.name+'のことを、はっきり嫌うようになっていた。';
return a.name+'は、もう前ほど'+b.name+'を嫌ってはいなかった。';
},
stance:function(x,b,a){
var back=backOf(x,a,b);
if(back)return back;
if(H.level(x,b,a)>=35)return'hate';
if(hasT(x,b,a,LOVE_T))return'love';
if(isCtx(x)){
var r=x.R(b,a);
if(r.att>=40&&r.aff>=25)return'love';
if(r.aff>=22)return'friend';
return r.aff>=0?'normal':'none';
}
return hasT(x,b,a,FRIEND_T)?'friend':'normal';
},
style:function(p){
var t=p.tr||{};
var act=(t.aggr||0)*0.45+(t.cp||0)*0.25+(t.impulse||0)*0.25+(t.fc||0)*0.1-(t.ac||0)*0.3-(t.caution||0)*0.15;
if(act>0.28)return'active';
if((t.cold||0)>0.58)return'cold';
return'passive';
},
rstyle:function(p){
var t=p.tr||{};
var l=[['np',t.np||0],['cp',(t.cp||0)-0.02],['fc',(t.fc||0)-0.04],['cold',(t.cold||0)-0.06],['ac',(t.ac||0)-0.03]].sort(function(u,v){return v[1]-u[1];});
return l[0][1]>0.55?l[0][0]:'mild';
},
drive:function(p,role){
var t=p.tr||{};
if(role==='hater')return clamp(0.35+(t.aggr||0)*0.5+(t.impulse||0)*0.3+(t.cp||0)*0.2-(t.ac||0)*0.25-(t.caution||0)*0.2,0.1,1.2);
return clamp(0.35+(t.np||0)*0.4+(t.fc||0)*0.3-(t.cold||0)*0.3-(t.ac||0)*0.2,0.1,1.2);
},
forceful:function(x,a,b){
var t=a.tr||{};
return H.level(x,a,b)>=65&&(t.aggr||0)*0.5+(t.cp||0)*0.3+(t.impulse||0)*0.2>0.45;
},
forcer:function(x,a,b){
var P=HK.Pos,can=function(f,o){return(!P||P.order(f,o,[f,o])[0]===f)&& !(HK.Avoid&&HK.Avoid.of(x,f,o));};
return H.forceful(x,a,b)&&can(a,b)?a:H.forceful(x,b,a)&&can(b,a)?b:null;
},
pairs:function(x,list,min){
var out=[];
list.forEach(function(a){list.forEach(function(b){if(a!==b&& !backOf(x,b,a)){var lv=H.level(x,a,b);if(lv>=(min||35))out.push({a:a,b:b,lv:lv,band:H.band(lv),st:H.stance(x,b,a)});}});});
return out;
},
why:function(x,a,b){
var lv=Math.round(H.level(x,a,b)),st=H.stance(x,b,a),bd=H.band(lv);
var SL={avoid:b.name+'は'+a.name+'を苦手に思い、避けている',hate:'お互いに敵視',none:b.name+'はなんとも思っていない',normal:b.name+'はふつうに接している',friend:b.name+'は友人だと思っている',love:b.name+'は'+a.name+'を愛している'};
return a.name+'→'+b.name+'：'+(bd==='enemy'?'敵対':'不仲')+'（嫌悪 '+lv+'）／'+SL[st];
}
};
var N={
meet:{
enemy:{active:L('{a}は{b}に気づくと、まっすぐ歩み寄った。|{a}は{b}の姿を見るなり、足を止めて睨みつけた。'),cold:L('{a}は{b}を一瞥し、氷のような目で見下ろした。|{a}は{b}に気づいても、表情ひとつ変えなかった。目だけが、冷えきっていた。'),passive:L('{a}は{b}に気づくと、表情を消して距離を取った。握った拳が、かすかに震えていた。|{a}は{b}の姿を見つけて、物陰に身を引いた。')},
bad:{active:L('{a}は{b}を見るなり、露骨に顔をしかめた。|{a}は{b}と目が合うと、聞こえよがしに舌打ちをした。'),cold:L('{a}は{b}に気づいても、目も合わせなかった。|{a}は{b}をいないものとして扱った。'),passive:L('{a}は{b}に気づくと、さりげなく反対側へ回った。|{a}は{b}の姿を見て、小さくため息をついた。')}
},
oblivious:L('{b}は、{a}の視線にすら気づいていなかった。|{b}は、自分が睨まれていることに、まるで気づいていなかった。'),
mutualSilent:L('{b}も、無言で睨み返した。|{b}は、ふん、と鼻を鳴らしてそっぽを向いた。'),
loveBlush:L('{b}の頬が、少しだけ緩んだ。|{b}は、{a}の顔を見ただけで、ほっとしたように笑った。'),
loveAfter:L('{a}は、その笑顔から目を逸らした。|{a}は、何も答えずに背を向けた。{b}は、それでも嬉しそうだった。'),
friendAfter:L('{a}は返事をしなかった。{b}は気にした様子もなく、隣に並んだ。|{a}の眉間の皺が、ほんの少しだけ深くなった。'),
normalAfter:L('{a}は返事もせずに通り過ぎた。{b}は首を傾げた。|{a}は聞こえないふりをした。'),
harass:L('{a}は、わざと{b}の肩にぶつかって通り過ぎた。|{a}は、{b}の荷物を、聞こえよがしに蹴飛ばした。|{a}は、{b}の分の食べ物を、何も言わずに自分の皿へ移した。|{a}は、{b}が話し始めると、わざと大きな声でかぶせた。'),
shrug:L('{b}は肩をすくめただけで、気にも留めなかった。|{b}は荷物を拾い直して、何事もなかったように歩き出した。'),
hurt:L('{b}は小さく「ごめん｜すまない｜すみません」とだけ言って、俯いた。|{b}は唇を噛んで、何も言い返さなかった。'),
thaw:L('{a}は、しばらく黙っていた。|{a}は目を逸らして、小さく息を吐いた。'),
snubCold:L('{a}は、聞こえないふりをした。|{a}は、{b}の差し出した手を、見もしなかった。'),
snubPassive:L('{a}は黙って席を立った。|{a}は、気づかないふりをして、別の誰かに話しかけた。'),
inviteYes:L('{a}は少し迷ってから、黙ってついていった。|{a}は舌打ちをしながらも、{b}の隣で手を動かした。'),
defendLead:L('誰かが{a}の陰口を言いかけたとき、{b}がそれを遮った。|{a}が責められかけたとき、{b}が前に出た。'),
giftLead:L('{b}は、取っておいた甘いものを、{a}に差し出した。|{b}は、どこかで見つけてきた小さな花を、{a}に差し出した。'),
leanLead:L('{b}は、{a}の隣に、そっと腰を下ろした。|{b}は、{a}のほつれた袖を、黙って繕ってから、そのまま隣に座った。'),
disgustAfter:{ac:L('{b}は差し出した手を、ゆっくり引っ込めた。|{b}は「ごめんね｜すまない｜ごめんなさい」と笑ったけれど、その目は濡れていた。'),np:L('それでも、{b}は笑っていた。「嫌われてても、いいんだ｜嫌われていても、いいんだ｜嫌われていても、いいんです」|{b}は少しだけ寂しそうに笑って、それ以上は近づかなかった。'),fc:L('{b}は「つれないなあ｜つれないな｜つれないですね」と笑って、またすぐ隣に戻ってきた。|{b}はまったく懲りていなかった。'),other:L('{b}は、それ以上何も言わなかった。|{b}は黙って、{a}から一歩離れた。')},
melt:L('{a}は追い払おうとして、やめた。|{a}は、しばらく黙っていた。それから、小さく舌打ちをして、そのままにさせた。'),
quarrelEnemy:L('{a}は{b}の胸ぐらを掴み、壁に押しつけた。|二人は、互いの襟首を掴んだまま、睨み合った。周りが慌てて割って入った。'),
quarrelBad:L('二人の言い合いは、しばらく続いた。|言い合いは、どちらも引かないまま、平行線で終わった。')
};
var NC={
harass:L('{a}は、狭い中でわざと肘を張り、{b}の肩を冷たい壁へ押しのけた。|{a}は、{b}の足の甲を、わざと踵で踏みつけた。|{a}は、{b}が身じろぎするたびに、聞こえよがしに舌打ちをした。|{a}は、背中で{b}を壁際へ押しやり、自分だけ楽な姿勢を取った。'),
shrug:L('{b}は押しのけられた肩をそっと戻して、何事もなかったように前を向いた。|{b}は小さく息を吐いただけで、相手にしなかった。|{b}は肩をすくめようとして、狭さにあきらめた。それきり、気にも留めなかった。'),
snubCold:L('{a}は、聞こえないふりをした。|{a}は、肩が触れ合う距離にいながら、{b}をいないものとして扱った。|{a}は、{b}の声に、冷たい壁のほうへ顔を背けた。'),
snubPassive:L('{a}は、できるかぎり身を縮めて、{b}に背中を向けた。|{a}は、息を殺して、聞こえないふりをした。|{a}は、額を壁に押しつけるようにして、{b}から目を逸らした。'),
giftLead:L('{b}は、ポケットに残っていた飴を、{a}の手にそっと押しつけた。|{b}は、くしゃくしゃのハンカチを取り出して、{a}に差し出した。|{b}は、ポケットのガムを一枚、{a}の手に握らせた。'),
leanLead:L('{b}は、狭い中で、{a}の肩にそっと額を寄せた。|{b}は、押しつけられた体を離そうとせず、そっと{a}に寄り添った。|{b}は、{a}の手の甲に、そっと指先を重ねた。'),
disgustAfter:{ac:N.disgustAfter.ac,np:L('それでも、{b}は笑っていた。「嫌われてても、いいんだ｜嫌われていても、いいんだ｜嫌われていても、いいんです」|{b}は少しだけ寂しそうに笑って、触れないように、そっと身を引いた。|{b}は何も言わずに、くっついていた肩を、ほんの少しだけ離した。'),fc:L('{b}は「つれないなあ｜つれないな｜つれないですね」と笑って、また肩を寄せてきた。|{b}はまったく懲りていなかった。|{b}は笑って、くっついた肩を離そうとしなかった。'),other:L('{b}は、それ以上何も言わなかった。|{b}は黙って、できるかぎり{a}から体を離した。|{b}は唇を引き結んで、壁のほうへ目を逸らした。')},
melt:L('{a}は押しのけようとして、やめた。|{a}は、しばらく黙っていた。それから、小さく舌打ちをして、そのままにさせた。|{a}は身をよじりかけて、あきらめたように力を抜いた。'),
quarrelEnemy:L('{a}は{b}の胸ぐらを掴み、壁に押しつけた。背中を打った壁が、鈍い音を立てた。|二人は、鼻先が触れそうな距離で睨み合った。逃げ場のない狭さの中で、荒い息だけがぶつかった。|{a}は苛立ちまぎれに壁を蹴った。鈍い音が響き、{b}は顔をしかめて睨み返した。'),
quarrelBad:L('狭い中で、言い合いはしばらく続いた。声を落としても、互いの息がかかる距離だった。|言い合いは、どちらも引かないまま途切れた。背を向けることもできず、二人は気まずく黙り込んだ。|二人は小声で言い合い、やがて同時にそっぽを向いた。向けた先には、冷たい壁しかなかった。')
};
function cramped(x){return!!(x&&x.hkSpace==='cramped');}
function NN(x,k){return cramped(x)&&NC[k]?NC[k]:N[k];}
function F(t,a,b){return t.replace(/\{a\}/g,a.name).replace(/\{b\}/g,b.name);}
function P(x,l){return x.pickArr?x.pickArr(l):l[(x.rng()*l.length)|0];}
var AV={
lead:L('{a}が{b}のほうへ歩いてきた。|{a}は{b}を見つけると、わざとらしく声をかけてきた。|{a}が何か言いたげに、{b}の前に立った。'),
ignore:L('{b}は気づかないふりをして、手元から目を上げなかった。{a}の声は、宙に浮いたまま消えた。|{b}は小さく会釈だけして、すっとその場を離れた。苦手な相手とは、関わらないのがいちばんだった。|{b}は{a}と目を合わせないまま、「……今、忙しいから｜……今、忙しい｜……今、忙しいんです」とだけ言った。'),
third:L('{b}は返事をせずに、近くにいた{c}の袖を引いた。{c}は事情を察して、{b}と{a}のあいだにさりげなく立った。|{b}は{c}に目で助けを求めた。{c}「その話なら私が聞く｜＝｜その話なら私が聞きます」――{b}はほっと息をついた。|{b}は{a}から逃げるように{c}の隣へ移り、{c}にばかり話しかけた。{a}の言葉は、行き場をなくした。'),
proxy:L('{b}「……代わりに聞いておいて｜……代わりに聞いておいてくれ｜……代わりに聞いておいてください」――そう言い残して、{b}は席を外した。{c}は苦笑して、{a}に向き直った。|{b}は{a}への用件を、全部{c}に頼んだ。{a}が何を言っても、返ってくるのは{c}の声だった。|{b}は{a}の前に{c}を押し出した。「この件は{c}に任せてあるから｜この件は{c}に任せてある｜この件は{c}に任せてあります」――{c}は肩をすくめて、{a}の相手を引き受けた。')
};
var AVC={
lead:L('{a}が、狭い中で{b}のほうへ顔を向けた。|{a}は、わざとらしく{b}に声をかけてきた。|{a}が何か言いたげに、{b}の肩を指でつついた。'),
ignore:L('{b}は気づかないふりをして、目を閉じた。{a}の声は、狭い暗がりに吸い込まれて消えた。|{b}は小さく会釈だけして、できるかぎり身を縮めた。苦手な相手とは、関わらないのがいちばんだった。|{b}は{a}と目を合わせないまま、「……今、話しかけないで｜……今、話しかけるな｜……今、話しかけないでください」とだけ言った。')
};
function thirdOf(x,a,b){
var L0=isCtx(x)?x.present():(x.P||[]).filter(function(p){return p&&p.alive!==false&& !p.gone&& !p.out;});
L0=L0.filter(function(c){return c!==a&&c!==b&&(!isCtx(x)||x.R(c,b).aff>0);});
return L0.length?L0[(x.rng()*L0.length)|0]:null;
}
H.avoid=function(x,a,b,place){
var cr=cramped(x),c=cr?null:thirdOf(x,a,b),r=x.rng(),k= !c||r<0.4?'ignore':r<0.7?'third':'proxy';
var t=(place||'')+F(P(x,(cr?AVC:AV).lead),a,b)+F(P(x,(cr?AVC:AV)[k]),a,b).replace(/\{c\}/g,c?c.name:'');
if(isCtx(x)){if(x.stress)x.stress(b,4);if(c)x.mod2(b,c,{trust:4},{aff:2});}
var why={ignore:'無視した',third:(c?c.name:'')+'を頼った',proxy:(c?c.name:'')+'に代わりに対応させた'}[k];
var o={text:t+H.shift(x,a,b,3),why:H.why(x,a,b)+'／'+b.name+'は'+a.name+'を避け、'+why,mag:14,cat:k==='ignore'?'solo':'bond'};
if(c)o.with=[c];
return o;
};
H.meet=function(x,a,b,place){
var lv=H.level(x,a,b),band=H.band(lv)||'bad',st=H.stance(x,b,a),sty=H.style(a),rs=H.rstyle(b);
if(st==='avoid')return H.avoid(x,a,b,place);
var t=(place||'')+F(P(x,N.meet[band][sty]),a,b),d=0;
if(sty==='active')t+=TL.line(a,band==='enemy'?'H_MEET_ENEMY':'H_MEET_BAD',b);
if(st==='hate'){t+=rs==='ac'||rs==='cold'?F(P(x,N.mutualSilent),a,b):TL.line(b,'R_HATE_BACK',a);d=3;H.shift(x,b,a,3);}
else if(st==='none'){
if(sty!=='active'||rs==='cold'){t+=F(P(x,N.oblivious),a,b);d=4;}
else{t+=TL.line(b,'R_MEET_NONE',a);d=3;}
}else if(st==='normal'){t+=TL.line(b,'R_MEET_NORMAL',a)+F(P(x,N.normalAfter),a,b);d=2;}
else if(st==='friend'){t+=TL.line(b,'R_MEET_FRIEND',a)+F(P(x,N.friendAfter),a,b);d=(a.tr.np||0)>0.6? -3:2;}
else{t+=TL.line(b,'R_MEET_LOVE',a)+F(P(x,N.loveBlush),a,b)+F(P(x,N.loveAfter),a,b);d=2;}
var sh=H.shift(x,a,b,d);
return{text:t+sh,why:H.why(x,a,b)+'／'+a.name+'は'+{active:'正面から絡む',cold:'冷たく無視する',passive:'避ける'}[sty],mag:band==='enemy'?22:16,cat:'conflict'};
};
H.harass=function(x,a,b){
var st=H.stance(x,b,a),rs=H.rstyle(b),lv=H.level(x,a,b);
if(st==='avoid')return H.avoid(x,a,b);
var t=F(P(x,NN(x,'harass')),a,b)+TL.line(a,'H_JAB',b),d=0,why='';
if(st==='hate'){t+=TL.line(b,'R_HATE_BACK',a);H.shift(x,b,a,4);d=4;why='お互いに敵視';}
else if(rs==='np'||(st==='friend'&&rs!=='cold')||(st==='love'&&rs!=='ac')){
t+=TL.line(b,'R_PEACE',a);
if(x.rng()<0.25+(b.tr.np||0)*0.3-(a.tr.aggr||0)*0.25-lv/400){t+=F(P(x,N.thaw),a,b)+TL.line(a,'H_THAW',b);d= -14;why=b.name+'の歩み寄りで、'+a.name+'の角が取れた';}
else{t+=TL.line(a,'H_BACKFIRE',b);d=8;why=b.name+'の歩み寄りが、かえって'+a.name+'の癇に障った';}
}else if(rs==='cp'){t+=TL.line(b,'R_PUSHBACK',a);d=6;H.shift(x,b,a,12);why=b.name+'は言い返した（'+b.name+'の嫌悪も上がった）';}
else if(rs==='fc'){t+=TL.line(b,'R_TEASE',a);d=5;why=b.name+'はからかって受け流した';}
else if(rs==='cold'){t+=F(P(x,NN(x,'shrug')),a,b);d=5;why=b.name+'は気にも留めなかった（それがまた癇に障った）';}
else{t+=F(P(x,N.hurt),a,b)+TL.line(b,'R_PUZZLED',a);d=st==='love'?1:2;why=b.name+'は理由が分からず傷ついた';}
if(isCtx(x)&&x.stress)x.stress(b,st==='love'?12:6);
return{text:t+H.shift(x,a,b,d),why:H.why(x,a,b)+'／'+why,mag:20,cat:'conflict'};
};
H.snub=function(x,a,b){
var st=H.stance(x,b,a),rs=H.rstyle(b),sty=H.style(a);
if(st==='avoid')return H.avoid(x,a,b);
var line=st==='friend'?'R_INVITE':st==='love'?'R_MEET_LOVE':'R_MEET_NORMAL';
var t=TL.line(b,line,a)+F(P(x,NN(x,sty==='cold'?'snubCold':'snubPassive')),a,b),d=2;
if(rs==='fc'||(st==='love'&&rs==='np')){t+=TL.line(b,'R_TEASE',a);d=3;}
else if(rs==='ac'||st==='love'){t+=F(P(x,N.hurt),a,b);if(isCtx(x)&&x.stress)x.stress(b,8);}
return{text:t+H.shift(x,a,b,d),why:H.why(x,a,b)+'／'+a.name+'は'+(sty==='cold'?'冷たく無視した':'避けた'),mag:14,cat:'solo'};
};
H.friendGap=function(x,a,b){
if(x.rng()<0.45){
var t=F(P(x,N.defendLead),a,b)+TL.line(b,'R_DEFEND',a)+TL.line(a,'H_CONFUSED',b);
return{text:t+H.shift(x,a,b,-12),why:H.why(x,a,b)+'／敵視している相手に、かばわれた（嫌悪 -12）',mag:22,cat:'bond'};
}
var t2=TL.line(b,'R_INVITE',a),yes=x.rng()<0.3+(a.tr.np||0)*0.3-H.level(x,a,b)/300;
t2+=yes?F(P(x,N.inviteYes),a,b):TL.line(a,'H_REFUSE',b);
return{text:t2+H.shift(x,a,b,yes? -8:2),why:H.why(x,a,b)+'／'+(yes?'しぶしぶ誘いに乗った':'誘いを断った'),mag:16,cat:'bond'};
};
H.loveGap=function(x,a,b,lead){
var gift= !lead&&x.rng()<0.5;
var t=(lead||F(P(x,NN(x,gift?'giftLead':'leanLead')),a,b))+TL.line(b,gift?'R_APPROACH':'R_LEAN',a),lv=H.level(x,a,b);
if(x.rng()<0.12+(a.tr.np||0)*0.15-lv/500){
t+=F(P(x,NN(x,'melt')),a,b)+TL.line(a,'H_CONFUSED',b);
return{text:t+H.shift(x,a,b,-14),why:H.why(x,a,b)+'／好意を向けられて、嫌悪が揺らいだ',mag:24,cat:'romance'};
}
var rs=H.rstyle(b);
var DA=NN(x,'disgustAfter');
t+=TL.line(a,'H_DISGUST',b)+F(P(x,DA[rs]||DA.other),a,b);
if(isCtx(x)&&x.stress)x.stress(b,rs==='ac'?16:8);
return{text:t+H.shift(x,a,b,6),why:H.why(x,a,b)+'／好意が、嫌悪で返された',mag:22,cat:'romance'};
};
H.quarrel=function(x,a,b){
var lv=H.level(x,a,b),enemy=lv>=65||H.level(x,b,a)>=65,t;
if(enemy)t=TL.line(a,'H_THREAT',b)+TL.line(b,'R_HATE_BACK',a)+F(P(x,NN(x,'quarrelEnemy')),a,b);
else t=TL.line(a,'BAD_BLAME',b)+TL.line(b,'BAD_RETORT',a)+F(P(x,NN(x,'quarrelBad')),a,b);
if(isCtx(x)&&x.stress){x.stress(a,6);x.stress(b,6);}
var s1=H.shift(x,a,b,4),s2=H.shift(x,b,a,4);
return{text:t+s1+s2,why:H.why(x,a,b)+'／'+(enemy?'敵対どうしの衝突':'不仲どうしの口論'),mag:enemy?26:18,cat:'conflict'};
};
H.pick=function(x,a,b){
var st=H.stance(x,b,a),sty=H.style(a),r=x.rng();
if(st==='hate')return H.quarrel(x,a,b);
if(st==='avoid')return H.avoid(x,a,b);
if(st==='love'&&r<0.55)return H.loveGap(x,a,b);
if(st==='friend'&&r<0.5)return H.friendGap(x,a,b);
return sty==='active'?H.harass(x,a,b):H.snub(x,a,b);
};
H.install=function(scen,opt){
if(!scen|| !scen.events||scen.hateKit)return;
scen.hateKit=opt=opt||{};
var W=opt.w||1;
function okKinds(ctx,a,b){
if(opt.kinds!=='love')return true;
return H.stance(ctx,b,a)==='love'||hasT(ctx,a,b,LOVE_T);
}
if(opt.meet!==false)HK.addTo(scen.events,{
id:'hk_meet',label:'敵視する相手と顔を合わせる',cat:'conflict',scope:'pair',
when:function(ctx,a,b){var pf=ctx.pair(a,b);if(opt.atStart&&ctx.stepIndex>0)return false;return!(pf.hkMet&&pf.hkMet[a.i])&&H.hater(ctx,a,b)&&okKinds(ctx,a,b);},
w:function(ctx,a,b){return 6*W*H.drive(a,'hater');},
run:function(ctx,a,b){var pf=ctx.pair(a,b);(pf.hkMet=pf.hkMet||{})[a.i]=1;var r=H.meet(ctx,a,b,opt.place?opt.place(ctx,a):'');return{text:r.text,why:r.why,mag:r.mag,cat:r.cat,with:r.with};}
});
HK.addTo(scen.events,{
id:'hk_hater',label:'敵視する相手に突っかかる',cat:'conflict',scope:'pair',
when:function(ctx,a,b){return H.hater(ctx,a,b)&&okKinds(ctx,a,b)&&(ctx.pair(a,b).hkAt==null||ctx.stepIndex-ctx.pair(a,b).hkAt>=2);},
w:function(ctx,a,b){return 1.6*W*H.drive(a,'hater')*(0.7+H.level(ctx,a,b)/100);},
run:function(ctx,a,b){
ctx.pair(a,b).hkAt=ctx.stepIndex;
var st=H.stance(ctx,b,a),r=st==='hate'?H.quarrel(ctx,a,b):H.style(a)==='active'?H.harass(ctx,a,b):H.snub(ctx,a,b);
return{text:r.text,why:r.why,mag:r.mag,cat:r.cat,with:r.with};
}
});
HK.addTo(scen.events,{
id:'hk_receiver',label:'敵視されていると知らずに近づく',cat:'bond',scope:'pair',
when:function(ctx,b,a){var st=H.stance(ctx,b,a);return H.hater(ctx,a,b)&&st!=='hate'&&st!=='avoid'&&okKinds(ctx,a,b)&&(ctx.pair(a,b).hkAt==null||ctx.stepIndex-ctx.pair(a,b).hkAt>=2);},
w:function(ctx,b,a){var st=H.stance(ctx,b,a);return 1.4*W*H.drive(b,'receiver')*(st==='love'?1.6:st==='friend'?1.3:0.6);},
run:function(ctx,b,a){
ctx.pair(a,b).hkAt=ctx.stepIndex;
var st=H.stance(ctx,b,a),r=st==='love'?H.loveGap(ctx,a,b,opt.approach?opt.approach(ctx,a,b):''):st==='friend'?H.friendGap(ctx,a,b):H.snub(ctx,a,b);
return{text:r.text,why:r.why,mag:r.mag,cat:r.cat==='romance'&&opt.kinds==='love'?'romance':r.cat};
}
});
};
H.storyTick=function(S,live,opt){
opt=opt||{};
var ps=H.pairs(S,live).filter(function(p){return opt.kinds!=='love'||p.st==='love'||hasT(S,p.a,p.b,LOVE_T);});
if(!ps.length)return null;
S.hkMet=S.hkMet||{};
var fresh=ps.filter(function(p){return!S.hkMet[p.a.i+'>'+p.b.i];});
if(fresh.length){
var f=fresh[(S.rng()*fresh.length)|0];
S.hkMet[f.a.i+'>'+f.b.i]=1;
if(opt.meet!==false){var m=H.meet(S,f.a,f.b,opt.place||'');m.actors=[f.a,f.b];return m;}
}
if(S.rng()>(opt.rate||0.12))return null;
var p=ps[(S.rng()*ps.length)|0];
var r=H.pick(S,p.a,p.b);
r.actors=[p.a,p.b];
return r;
};
})();
});
;
/* ==== js/feud-kit.js ==== */
HK.Load.def(39,'js/feud-kit.js',function(){
(function(){
'use strict';
var HK=window.HK;
if(!HK)return;
var clampG=function(v,lo,hi){return v<lo?lo:v>hi?hi:v;};
function gTies(x,a,b){
if(x&&x.R&&x.pair)return HK.Ties?HK.Ties.all(x,a,b):[];
return((x&&x.ties)||[]).filter(function(t){return(t.a===a.i&&t.b===b.i)||(t.a===b.i&&t.b===a.i);});
}
var G=HK.Gap={
self:function(x,a,b){
var v=0,l=gTies(x,a,b);
l.forEach(function(t){
var from=t.a===a.i;
if(t.type==='yan'&&from)v=Math.max(v,55);
if(t.type==='honmei'&&from)v=Math.max(v,70);
if(t.type==='blind'&&from)v=Math.max(v,75);
if(t.type==='enemy'&&(from|| !t.cold))v=Math.max(v,t.grade==='hate'?90:60);
if(t.type==='fear'&&from)v=Math.max(v,60);
});
if(x&&x.R&&HK.Obsess&&HK.Obsess.state){var pf=x.pair(a,b);if(pf.ob&&pf.ob[a.i])v=Math.max(v,pf.ob[a.i].lv||0);}
else if(x&&x.obs&&x.obs[a.i+'>'+b.i])v=Math.max(v,x.obs[a.i+'>'+b.i].lv||0);
return clampG(v,0,100);
},
back:function(x,a,b,opt){
if(opt&&opt.back!=null)return{to:clampG(opt.back,0,100),other:clampG(opt.other||0,0,100)};
if(!(x&&x.R&&x.chars))return{to:0,other:0};
var to=clampG(x.R(b,a).aff,0,100),other=0;
x.chars.forEach(function(c){if(c!==a&&c!==b&&c.alive!==false)other=Math.max(other,clampG(x.R(b,c).aff,0,100));});
return{to:to,other:other};
},
of:function(x,a,b,opt){
if(!x|| !a|| !b||a===b)return 0;
var s=opt&&opt.self!=null?opt.self:G.self(x,a,b),bk=G.back(x,a,b,opt);
if(s<=0)return 0;
var g=Math.max(0,s-bk.to)/100;
if(bk.other>bk.to)g+=(bk.other-bk.to)/200;
return clampG(g,0,1);
},
k:function(x,a,b,opt){
var d=HK.Dark?HK.Dark.pick(x,0.6,1,1.4):1;
return(1+1.2*G.of(x,a,b,opt))*d;
},
why:function(x,a,b,opt){
var s=opt&&opt.self!=null?opt.self:G.self(x,a,b),g=G.of(x,a,b,opt);
if(s<=0)return'';
return'想いの差：'+(g>=0.55?'大':g>=0.25?'中':'小')+'（自分 '+Math.round(s)+'／相手 '+Math.round(G.back(x,a,b,opt).to)+'）';
}
};
if(!HK.TL)return;
var LOVE='lover,mate,fated,almost,crush,fwb,ex',HATE='enemy,bad,sibbad',RIVAL='rival',CLOSE='friend,colleague,buddy,childhood,best,sibling,sibprot,sibclose,twin,parent,pparent,mentor,master,teacher,classmate,boss,benefactor,relative,worship,fond,blind';
function inL(t,l){return l.split(',').indexOf(t)>=0;}
function ties(S,a,b){return(S.ties||[]).filter(function(t){return(t.a===a.i&&t.b===b.i)||(t.a===b.i&&t.b===a.i);});}
function has(S,a,b,l){return ties(S,a,b).some(function(t){return inL(t.type,l);});}
function love(S,a,b){return ties(S,a,b).some(function(t){return inL(t.type,LOVE)&&(t.type!=='crush'||t.a===a.i||t.b===a.i);});}
function lv(S,a,b){return HK.HateKit?HK.HateKit.level(S,a,b):has(S,a,b,HATE)?50:0;}
var NOTOUCH=['{a}は{b}の胸ぐらを掴みかけて、寸前でその手を下ろした。{a}「もういい。顔も見たくない｜＝｜もう結構です。顔も見たくありません」――{a}は背を向けて、足音も荒く出ていった。','{a}は{b}の肩を突き飛ばした。{b}もすぐに{a}の腕を払いのけた。二人は荒い息のまま睨み合い、どちらも一歩も引かなかった。','{a}は{b}に掴みかかったが、{b}はその手を冷たく振り払った。{b}「触らないで。話はもう終わり｜触るな。話はもう終わりだ｜触らないでください。話はもう終わりです」――{a}は拳を握りしめたまま、何も言い返せなかった。','{a}と{b}は、互いの腕を掴んだまま、一歩も引かずに睨み合った。先に目を逸らしたほうが負けだと、二人とも分かっていた。'];
var NOTOUCH_AFTER=['それきり、二人は目も合わせなかった。','仲間が割って入るまで、二人の睨み合いは続いた。','残された沈黙は、口論の前よりも重かった。'];
var KISS=['{a}は{b}の腕を掴んで壁に押しつけ、噛みつくように唇を奪った。{b}が{a}の頬を張った。それでも、{a}は離さなかった。','{a}は{b}の胸ぐらを掴み、そのまま強く抱きすくめた。{b}がもがくほど、{a}の腕には力がこもった。'];
var REV=['{a}は{b}の胸ぐらを掴んだ。{b}はその手首を掴み返し、逆に{a}を壁に押しつけて、噛みつくように唇を奪った。{a}が{b}の頬を張っても、{b}は離さなかった。','{a}は{b}に掴みかかった。{b}は{a}の両手首をひとまとめに押さえ込み、「……で？」と見下ろした。{a}は唇を噛んで、顔を背けた。'];
function lhOld(S,a,b){
var LH=HK.LoveHate;
if(LH&&LH.off&&(LH.off(S,a,b)||LH.off(S,b,a)))return false;
if(ties(S,a,b).some(function(t){return t.noev==='off'&&inL(t.type,LOVE+','+RIVAL+','+HATE);}))return false;
return love(S,a,b)&&(lv(S,a,b)>=35||lv(S,b,a)>=35||has(S,a,b,RIVAL));
}
function lhSet(S,a,b){return!!(HK.LoveHate&&HK.LoveHate.dir(S,a,b));}
function lhKey(a,b){return a.i<b.i?a.i+'-'+b.i:b.i+'-'+a.i;}
var F=HK.Feud={
ties:ties,has:has,level:lv,
lovehate:function(S,a,b){return lhSet(S,a,b)?HK.LoveHate.any(S,a,b):lhOld(S,a,b);},
lhFrom:function(S,a,b){return lhSet(S,a,b)?HK.LoveHate.has(S,a,b):lhOld(S,a,b);},
lhWhy:function(S,a,b){return(lhSet(S,a,b)&&HK.LoveHate.why(S,a,b))||'憎しみと執着が、同じだけ育っている';},
lhMark:function(S,a,b,t){(S.lhLast=S.lhLast||{})[lhKey(a,b)]=t;},
lhLast:function(S,a,b){var m=S.lhLast&&S.lhLast[lhKey(a,b)];return m==null?null:m;},
touchOk:function(S,a,b){
if(!a|| !b||a===b|| !HK.canLove|| !HK.canLove(a,b)|| !HK.canLove(b,a))return false;
if(HK.ngExplicit&&HK.ngExplicit(a,b))return false;
return!HK.Pos||HK.Pos.okSex(a,b);
},
bodyOk:function(S,a,b){return F.touchOk(S,a,b)&&(!HK.LoveHate||HK.LoveHate.sexOk(S,a,b));},
forceOk:function(S,a,b){var LH=HK.LoveHate;return!lhSet(S,a,b)|| !(LH&&LH.face)||LH.face(S,a,b)==='hate';},
hate:function(S,a,b){return lv(S,a,b)>=35&& !love(S,a,b);},
hateStrong:function(S,a,b){return lv(S,a,b)>=65&& !love(S,a,b);},
rival:function(S,a,b){return has(S,a,b,RIVAL)||lv(S,a,b)>=35||lv(S,b,a)>=35;},
duo:function(S,sl,pk){
var sp=ties(S,sl,pk).filter(function(t){return t.type==='senpai';})[0];
if(sp)return sp.a===sl.i?'DUO_SENPAI_S':'DUO_SENPAI_P';
if(F.lovehate(S,sl,pk)||has(S,sl,pk,RIVAL+','+HATE))return'DUO_RIVAL';
if(love(S,sl,pk))return'DUO_LOVE';
if(has(S,sl,pk,CLOSE))return'DUO_CLOSE';
return'DUO_NONE';
},
duoText:function(S,sl,pk){
var k=F.duo(S,sl,pk),lead={
DUO_SENPAI_S:sl.name+'は、後輩の'+pk.name+'を振り返った。',
DUO_SENPAI_P:sl.name+'は、先輩の'+pk.name+'を見て、眉間を押さえた。',
DUO_RIVAL:sl.name+'は、'+pk.name+'の顔を見るなり、目を細めた。',
DUO_LOVE:sl.name+'は、'+pk.name+'の袖を、そっと引いた。',
DUO_CLOSE:sl.name+'は、'+pk.name+'を見て、小さく笑った。',
DUO_NONE:sl.name+'は、初めて会う'+pk.name+'を、横目で値踏みした。'
}[k];
return{k:k,text:lead+HK.TL.line(sl,k,pk)};
},
label:function(S,a,b){return ties(S,a,b).map(function(t){return HK.tieLabel?HK.tieLabel(t):HK.TIES&&HK.TIES[t.type]?HK.TIES[t.type].label:t.type;}).join('・')||'なし';},
clash:function(S,a,b,pick){
var t=a.name+'と'+b.name+'の口論は、いつの間にか怒鳴り合いになっていた。'+HK.TL.line(a,'LH_CLASH',b);
var fill=function(x){return x.replace(/\{a\}/g,a.name).replace(/\{b\}/g,b.name);};
if(!F.touchOk(S,a,b))return{text:t+(pick?fill(pick(NOTOUCH))+pick(NOTOUCH_AFTER):''),r18:false,touch:false};
var Pz=HK.Pos,aTop= !Pz||Pz.order(a,b,[a,b])[0]===a;
var pk=pick||function(l){return l[0];};
if(aTop&&F.r18Clash&&F.r18On&&F.r18On(S)&&F.bodyOk(S,a,b)&&F.forceOk(S,a,b)){
if(Pz&&Pz.ff(a,b))return{text:t+ffClash(S,a,b,pk)+HK.TL.line(a,'LH_AFTER',b),r18:true,touch:true};
return{text:t+F.r18Clash(S,a,b)+HK.TL.line(a,'LH_AFTER',b),r18:true,touch:true};
}
var l=aTop?KISS:REV;
return{text:t+(pick?fill(pick(l)):'')+HK.TL.line(a,'LH_AFTER',b),r18:false,touch:true};
}
};
var L2=function(s){return s.split('|');};
F.hateGrade=function(x,a,b){
return ties(x&&x.R&&x.pair?{ties:HK.Ties?HK.Ties.all(x,a,b):[]}:x,a,b).some(function(t){return t.type==='enemy'&&t.grade==='hate'&&t.a===a.i;});
};
F.HATE={
demean:L2('{a}は皆の前で、{b}の失敗をわざとらしく数え上げた。「よくそれで平気な顔をしていられるね｜よくそれで平気な顔をしていられるな｜よくそれで平気な顔をしていられますね」――笑い声が起きるのを、{a}は冷たい目で確かめていた。|{a}は{b}の意見を最後まで聞かずに遮った。「誰も{b}にそんなこと頼んでない｜誰も{b}にそんなことは頼んでいない｜誰も{b}にそんなことは頼んでいません」――その言い方には、はっきりとした侮蔑がこもっていた。|{a}は{b}の持ち物を指先でつまみ上げ、汚いものでも見るように放り捨てた。「こういうところに、育ちが出るよね｜こういうところに、育ちが出るものだ｜こういうところに、育ちが出ますよね」'),
trap:L2('{a}は自分のしくじりを、さりげなく{b}のせいにした。辻褄の合う話を、{a}は前もって用意していた。|{a}は{b}が任された段取りに、こっそり手を入れた。何も知らない{b}は、皆の前で恥をかくことになった。|{a}は{b}にわざと間違ったことを教えた。{b}がその通りに動いて失敗するのを、{a}は少し離れたところから眺めていた。'),
isolate:L2('{a}は{c}の耳もとで、{b}についての根も葉もない話を囁いた。{c}はその日から、{b}と目を合わせなくなった。|{a}は{b}を誘わないように、{c}に念を押した。「あの人がいると、空気が悪くなるから｜あの人がいると、空気が悪くなる｜あの人がいると、空気が悪くなりますから」|{a}は{b}が席を外したすきに、{c}たちに{b}の陰口を吹き込んだ。戻ってきた{b}を迎えたのは、気まずい沈黙だった。'),
harm:L2('{a}は{b}が一人になるのを待って、背後から突き飛ばした。{b}は硬い床に叩きつけられ、しばらく起き上がれなかった。|{a}は{b}の足もとに、わざと危ないものを仕掛けておいた。{b}は手を深く切り、血が止まらなかった。|{a}は{b}の水筒に、何かを混ぜた。{b}はその夜、ひどい熱と吐き気に苦しんだ。'),
harmKill:L2('{a}は{b}を人目のない場所へ呼び出し、二度と戻らせなかった。帰ってきた{a}の袖口には、乾いた血がこびりついていた。|{a}は{b}が助けを求める声を聞きながら、扉を閉めた。{a}がもう一度扉を開けたとき、{b}はもう動かなかった。|{a}は最後まで{b}の目を見ていた。「ずっと、こうしたかった｜＝｜ずっと、こうしたかったんです」――それが、{b}が聞いた最後の言葉だった。'),
threat:L2('{a}は{b}の前に立ちふさがり、低い声で告げた。「次に私の前に出てきたら、ただじゃおかない｜次に私の前に出てきたら、ただではおかない｜次に私の前に出てきたら、ただではおきません」|{a}は{b}の胸ぐらを掴みかけて、寸前で手を止めた。その目に宿ったものの冷たさに、{b}は思わず後ずさった。|{a}は{b}の荷物の上に、「消えろ｜＝｜消えてください」と書いた紙を置いた。字は、隠す気もないほど{a}のものだった。')
};
F.HATE_RE={
demean:{
proud:L2('{b}は拳を握りしめた。「言いたいことはそれだけか。……覚えてろよ」'),stern:L2('{b}は表情を変えずに言った。「事実と違う。訂正してもらう」――声は低く、震えていなかった。'),
tsun:L2('{b}「な、なによ……！　そんな言い方しなくてもいいでしょ！」{b}の目には、悔し涙がにじんでいた。'),gentle:L2('{b}は困ったように笑ったが、膝の上の手は小さく震えていた。「……そう見えるなら、ごめんね」'),
devoted:L2('{b}は俯いて唇を噛んだ。「私、そんなに駄目かな……」――誰も、その問いには答えなかった。'),cool:L2('{b}は肩をすくめた。「論点がずれている。私の話をしたいなら、根拠を出して」'),
free:L2('{b}は「はいはい、私が悪うございました」とおどけてみせた。けれど、そのあと{b}はしばらく誰とも口をきかなかった。'),shy:L2('{b}は真っ赤になって俯き、何も言い返せなかった。小さな背中が、さらに小さくなった。'),
polite:L2('{b}は丁寧に頭を下げた。「ご指摘、肝に銘じます」――その丁寧さが、かえって場を冷やした。')
},
trap:{
proud:L2('{b}「……ふざけんな。誰がやったか、分かってんだよ」{b}は{a}を睨みつけたが、証拠は何もなかった。'),stern:L2('{b}は黙って責めを受けた。言い訳をするより先に、誰がこれを仕組んだのかを考えていた。'),
tsun:L2('{b}「私じゃないもん！　……信じてくれなくても、私じゃない！」'),gentle:L2('{b}は皆に謝った。自分のせいではないと分かっていても、責める相手を探す気にはなれなかった。'),
devoted:L2('{b}は何度も頭を下げた。「ごめんなさい、私がちゃんとしていれば……」――{a}は、その姿を見て薄く笑った。'),cool:L2('{b}は失敗の跡を一つずつ確かめ、手が加えられた箇所に気づいた。{b}は何も言わず、{a}の顔を見た。'),
free:L2('{b}は「あれ、おかしいな」と首をかしげた。笑ってごまかしたが、その目は{a}のほうを鋭く見ていた。'),shy:L2('{b}は泣きそうな顔で立ち尽くした。どうしてこうなったのか、{b}にはまるで分からなかった。'),
polite:L2('{b}は静かに言った。「私の不手際ということにしておきます。……今は、ですが」')
},
isolate:{
proud:L2('{b}は空いた席を見て舌打ちした。「群れなきゃ何もできねえ連中だな」――強がりの声は、少しかすれていた。'),stern:L2('{b}は誰にも声をかけず、一人で黙々と自分の務めを続けた。背筋だけは、まっすぐに伸ばしたままだった。'),
tsun:L2('{b}「べ、別に一人でも平気だし！」――そう言った{b}は、誰もいない方を向いて目をこすった。'),gentle:L2('{b}は輪から外されたことに気づいて、そっと離れた。誰かを責めるより、自分が何をしたのかを考えていた。'),
devoted:L2('{b}は何度も皆の顔をうかがった。誰も目を合わせてくれないことが、何より堪えた。'),cool:L2('{b}は周りの態度の変化を冷静に見ていた。誰が話を流したのか、見当はついていた。'),
free:L2('{b}は一人で鼻歌を歌いながら、平気なふりをした。歌は、途中で途切れた。'),shy:L2('{b}は隅のほうで膝を抱えた。話しかけられないことには慣れているつもりだったのに、胸が痛かった。'),
polite:L2('{b}は「お邪魔のようですので」と小さく会釈して、その場を離れた。')
},
harm:{
proud:L2('{b}は痛みに顔を歪めながら、{a}を睨み返した。「……やってくれたな」'),stern:L2('{b}は呻き声一つ上げずに傷を押さえた。その目は、まっすぐ{a}に向いていた。'),
tsun:L2('{b}「痛っ……な、なんでこんなこと……！」{b}の声は、恐怖と怒りで裏返っていた。'),gentle:L2('{b}は傷を押さえて座り込んだ。「……どうして、ここまで」――その問いに、{a}は答えなかった。'),
devoted:L2('{b}は震える声で言った。「私、何かしたなら謝るから……もう、やめて」'),cool:L2('{b}は自分の傷の具合を淡々と確かめた。「これは事故じゃない」――それだけを、はっきり口にした。'),
free:L2('{b}は笑おうとして、うまく笑えなかった。痛みより、{a}の目のほうが怖かった。'),shy:L2('{b}は声も出せずに震えていた。{a}の影が、すぐそばにあった。'),
polite:L2('{b}は荒い息を整えてから言った。「……このことは、決して忘れません」')
}
};
F.HATE_RE.threat=F.HATE_RE.harm;
})();
});
;
/* ==== js/hate-love.js ==== */
HK.Load.def(40,'js/hate-love.js',function(){
(function(){
'use strict';
var HK=window.HK;
if(!HK|| !HK.Ties)return;
function L(s){return s.split('|');}
function isCtx(x){return!!(x&&x.R&&x.pair&&x.chars);}
function tieList(x,a,b){
if(isCtx(x))return HK.Ties.all(x,a,b);
return((x&&x.ties)||[]).filter(function(t){return(t.a===a.i&&t.b===b.i)||(t.a===b.i&&t.b===a.i);});
}
var PS=['proud','stern','tsun','gentle','devoted','cool','free','shy','polite'];
function ps(c){var p=HK.personaOf?HK.personaOf(c):c.persona;return PS.indexOf(p)>=0?p:'gentle';}
function here(c){return!!c&&(!HK.State||HK.State.here(c));}
function rnd(x){return x.rng?x.rng():Math.random();}
function pick(x,l){if(isCtx(x))return x.pick(l);if(x.pickArr)return x.pickArr(l);return l[Math.floor(rnd(x)*l.length)];}
function fill(t,m){return String(t).replace(/\{(a|b|c|t)\}/g,function(s,k){return m[k]?m[k].name:s;});}
var LH=HK.LoveHate={
dir:function(x,a,b){
if(!x|| !a|| !b||a===b)return'';
var fa=false,fb=false;
tieList(x,a,b).forEach(function(t){
if(t.type==='lovehate'){
if(t.cold==='both'){fa=fb=true;return;}
if(t.a===a.i)fa=true;else fb=true;
return;
}
if((t.type!=='enemy'&&t.type!=='bad')|| !t.lh)return;
if(t.lh==='both'){fa=fb=true;return;}
if((t.lh==='a')===(t.a===a.i))fa=true;else fb=true;
});
return fa&&fb?'both':fa?'a':fb?'b':'';
},
face:function(x,a,b){
var l=tieList(x,a,b),has=function(re){return l.some(function(t){return re.test(t.type);});};
if(has(/^(enemy|bad|sibbad)$/)||l.some(function(t){return/^(mentor|master|boss|teacher)$/.test(t.type)&&t.cold==='bad';}))return'hate';
if(has(/^(lover|spouse|ex|fwb|crush|honmei|mate|fated|almost|fiance|yan)$/))return'love';
var kin=l.filter(function(t){return HK.TIES[t.type]&&HK.TIES[t.type].family;});
if(kin.length)return kin.some(function(t){return t.love==='ok';})?'love':'kin';
return'peer';
},
off:function(x,a,b){
if(a.ng&&a.ng.indexOf(b.i)>=0)return true;
if(b.ng&&b.ng.indexOf(a.i)>=0)return true;
if(HK.lockOut&&HK.lockOut(a,b))return true;
if(isCtx(x)){
if(HK.Ties.apathy&&(HK.Ties.apathy(x,a,b)||HK.Ties.fears(x,a,b)||HK.Ties.fears(x,b,a)))return true;
}else if(tieList(x,a,b).some(function(t){return(t.type==='apathy'&&t.a===a.i)||t.type==='fear'||(t.noev==='off'&&t.type==='lovehate');})){
return true;
}
return false;
},
has:function(x,a,b){
var d=LH.dir(x,a,b);
return(d==='a'||d==='both')&& !LH.off(x,a,b);
},
any:function(x,a,b){return LH.has(x,a,b)||LH.has(x,b,a);},
mutual:function(x,a,b){return LH.has(x,a,b)&&LH.has(x,b,a);},
sexOk:function(x,a,b){
if(HK.SAFE_ON|| !a|| !b||a===b)return false;
if(HK.State&& !HK.State.pairSex(a,b))return false;
if(HK.sexBlocked&&HK.sexBlocked(a,b))return false;
var free= !!(HK.State&&HK.State.freeSex&&HK.State.freeSex(x,a,b));
if(HK.ngSexPair?HK.ngSexPair(a,b):HK.ngPair&&HK.ngPair(a,b))return false;
if((!HK.canLove(a,b)|| !HK.canLove(b,a))&& !free)return false;
if(HK.Pos&& !HK.Pos.okSex(a,b))return false;
if(isCtx(x)&&x.pair(a,b).kin)return false;
return true;
},
targets:function(x,a){
var L0=isCtx(x)?x.chars:(x.P||[]);
return L0.filter(function(o){return o&&o!==a&&here(o)&&LH.has(x,a,o);});
},
k:function(x,a,b){return LH.mutual(x,a,b)?2.6:LH.any(x,a,b)?2:1;},
why:function(x,a,b){
var m=LH.mutual(x,a,b);
return m?a.name+'と'+b.name+'は、互いに愛憎を抱いている（口では嫌い合いながら、離れられない）':LH.has(x,a,b)?a.name+'は'+b.name+'に愛憎を抱いている（口では嫌いながら、構わずにいられない）':LH.has(x,b,a)?b.name+'は'+a.name+'に愛憎を抱いている（口では嫌いながら、構わずにいられない）':'';
}
};
var ES=HK.Esteem={
raw:function(x,a,b){
if(!x|| !a|| !b||a===b)return'';
var r='';
tieList(x,a,b).forEach(function(t){if((t.type==='inferior'||t.type==='superior')&&t.a===a.i)r=t.type;});
return r;
},
off:function(x,a,b){
if(isCtx(x))return!!(HK.Ties.apathy&&(HK.Ties.apathy(x,a,b)||HK.Ties.fears(x,a,b)||HK.Ties.fears(x,b,a)));
return tieList(x,a,b).some(function(t){return(t.type==='apathy'&&t.a===a.i)||t.type==='fear'||((t.type==='inferior'||t.type==='superior')&&t.a===a.i&&t.noev==='off');});
},
of:function(x,a,b){var r=ES.raw(x,a,b);return r&& !ES.off(x,a,b)?r:'';},
inferior:function(x,a,b){return ES.of(x,a,b)==='inferior';},
superior:function(x,a,b){return ES.of(x,a,b)==='superior';},
targets:function(x,a){
var L0=isCtx(x)?x.chars:(x.P||[]);
return L0.filter(function(o){return o&&o!==a&&here(o)&&ES.of(x,a,o);}).map(function(o){return{who:o,kind:ES.of(x,a,o)};});
}
};
var KAMAU={
jab:{
label:'わざと突っかかる',
lead:L('{a}は、{b}の前をわざとゆっくり横切った。肩が触れるか触れないかの距離だった。{b}が顔を上げると、{a}は待っていたように口を開いた。|{a}は、{b}が何か言うたびに、いちいち反対のことを言った。{b}が呆れた顔をしても、やめる気配はなかった。{b}の目がこちらを向くたびに、{a}の口元は少しだけ緩んだ。|{a}は、{b}の手元を覗き込んで、聞こえよがしにため息をついた。{b}が手を止めても、{a}は立ち去らなかった。むしろ{b}の隣に陣取って、腕を組んだ。'),
say:{
proud:L('「その程度で得意になってるの？　見てられない｜その程度で得意になっているのか。見ていられない｜その程度で得意になっているんですか。見ていられません」|「あなたの顔を見ると、一日が台無しになる｜あなたの顔を見ると、一日が台無しだ｜あなたの顔を見ると、一日が台無しになります」'),
stern:L('「やり方が雑すぎる。私が見ていないと、何もできないの？｜やり方が雑すぎる。私が見ていないと、何もできないのか｜やり方が雑すぎます。私が見ていないと、何もできないんですか」|「あなたの欠点なら、いくらでも挙げられる。聞きたい？｜あなたの欠点なら、いくらでも挙げられる。聞きたいか｜あなたの欠点なら、いくらでも挙げられます。聞きますか」'),
tsun:L('「べ、別に見てたわけじゃないから。あなたが目障りなだけ｜べ、別に見ていたわけではない。あなたが目障りなだけだ｜べ、別に見ていたわけではありません。あなたが目障りなだけです」|「ちょっと、こっち向いて。……違う、用なんてない｜おい、こっちを向け。……違う、用などない｜ちょっと、こちらを向いてください。……違います、用なんてありません」'),
gentle:L('「……あなたって、本当に嫌な人だね。どうしてそうなの｜……あなたは、本当に嫌なやつだ。どうしてそうなんだ｜……あなたは、本当に嫌な方ですね。どうしてそうなんですか」|「その言い方、また誰かを怒らせるよ。……私以外の誰かを｜その言い方では、また誰かを怒らせるぞ。……私以外の誰かを｜その言い方では、また誰かを怒らせますよ。……私以外の誰かを」'),
devoted:L('「あなたなんか、嫌い。……嫌いだから、ちゃんと見張ってる｜あなたなど、嫌いだ。……嫌いだから、ちゃんと見張っている｜あなたなんて、嫌いです。……嫌いだから、ちゃんと見張っているんです」|「また無茶してる。……べつに、心配なんかしてない｜また無茶をしている。……べつに、心配などしていない｜また無茶をしていますね。……べつに、心配なんかしていません」'),
cool:L('「あなたの判断には、穴が三つある。言われなきゃ分からない？｜あなたの判断には、穴が三つある。言われなければ分からないのか｜あなたの判断には、穴が三つあります。言われなければ分かりませんか」|「非効率。見ているこっちが疲れる｜非効率だ。見ているこちらが疲れる｜非効率です。見ているこちらが疲れます」'),
free:L('「うわ、また{b}。今日も冴えない顔してる｜うわ、また{b}か。今日も冴えない顔をしているな｜うわ、また{b}ですか。今日も冴えない顔をしていますね」|「ねえ、退屈だから相手して。……嫌いだけど｜おい、退屈だから相手をしろ。……嫌いだがな｜あの、退屈なので相手をしてください。……嫌いですけど」'),
shy:L('「そ、それ、間違ってる……。き、嫌いだから、言ってるだけ……｜そ、それは、間違っている……。き、嫌いだから、言っているだけだ……｜そ、それ、間違っています……。き、嫌いだから、言っているだけです……」|「あ、あなたのそういうところ、ほんとに苦手……｜あ、あなたのそういうところが、本当に苦手だ……｜あ、あなたのそういうところ、本当に苦手です……」'),
polite:L('「相変わらず、品のないやり方をするね｜相変わらず、品のないやり方をする｜相変わらず、品のないやり方をなさいますね」|「あなたと話すのは、本当に疲れる｜あなたと話すのは、本当に疲れる｜あなたとお話しするのは、本当に疲れます」')
}
},
sit:{
label:'嫌味を言いながら隣に座る',
lead:L('{a}は、空いている席がほかにいくらでもあるのに、{b}の隣に腰を下ろした。肘が当たるほど近かった。{b}が眉をひそめても、{a}は動こうとしなかった。|{a}は{b}の隣にどかりと座り、わざとらしく脚を組んだ。視線は前に向けたままだった。けれど、意識が隣に向いているのは、見ていれば分かった。|{b}が一人で座っていると、{a}がやって来て、当然のように隣を陣取った。ほかに座る場所がないとでも言いたげな顔だった。辺りの席は、どれも空いていた。'),
say:{
proud:L('「勘違いしないで。ここが一番ましな席なだけ｜勘違いするな。ここが一番ましな席なだけだ｜勘違いしないでください。ここが一番ましな席なだけです」|「あなたの隣なんて最悪。……でも、どく気はない｜あなたの隣など最悪だ。……だが、どく気はない｜あなたの隣なんて最悪です。……でも、どく気はありません」'),
stern:L('「監視しているだけ。あなたが何をしでかすか分からないから｜監視しているだけだ。あなたが何をしでかすか分からないからな｜監視しているだけです。あなたが何をしでかすか分かりませんから」|「私の隣にいる限り、勝手な真似はさせない｜＝｜私の隣にいる限り、勝手な真似はさせません」'),
tsun:L('「た、たまたま空いてたから座っただけ！　隣があなたなのは不運｜た、たまたま空いていたから座っただけだ！　隣があなたなのは不運だ｜た、たまたま空いていたから座っただけです！　隣があなたなのは不運です」|「こっち見ないで。……見ないでって言ったのに、どうして見ないの｜こっちを見るな。……見るなとは言ったが、なぜ本当に見ない｜こちらを見ないでください。……見ないでと言いましたけど、どうして見ないんですか」'),
gentle:L('「……座るよ。あなたの隣が嫌なのは、変わらないけど｜……座るぞ。あなたの隣が嫌なのは、変わらないが｜……座りますね。あなたの隣が嫌なのは、変わりませんけど」|「一人で黙ってると、余計に嫌な顔に見える。だから、ここにいる｜一人で黙っていると、余計に嫌な顔に見える。だから、ここにいる｜一人で黙っていると、余計に嫌な顔に見えます。だから、ここにいます」'),
devoted:L('「嫌いな人の隣にいるのも、修行みたいなもの｜嫌いなやつの隣にいるのも、修行のようなものだ｜嫌いな人の隣にいるのも、修行のようなものです」|「どいてあげない。あなたが嫌がるなら、なおさら｜どいてやらない。あなたが嫌がるなら、なおさらだ｜どいてあげません。あなたが嫌がるなら、なおさらです」'),
cool:L('「ここが一番、全体を見渡せる。あなたが隣なのは誤差｜ここが一番、全体を見渡せる。あなたが隣なのは誤差だ｜ここが一番、全体を見渡せます。あなたが隣なのは誤差です」|「黙って座っていて。話しかけられると集中できない｜黙って座っていろ。話しかけられると集中できない｜黙って座っていてください。話しかけられると集中できません」'),
free:L('「よいしょ。うわ、隣はあなたか。最悪。……まあいいや｜よし。うわ、隣はあなたか。最悪だ。……まあいい｜よいしょ。うわ、隣はあなたですか。最悪です。……まあいいです」|「ほら、詰めて詰めて。嫌いな人の隣ほど落ち着くって言うし｜ほら、詰めろ。嫌いなやつの隣ほど落ち着くと言うだろう｜ほら、詰めてください。嫌いな人の隣ほど落ち着くと言いますし」'),
shy:L('「と、隣……い、嫌だけど、ほかに空いてないから……｜と、隣……い、嫌だが、ほかに空いていないから……｜と、隣……い、嫌ですけど、ほかに空いていませんから……」|「は、話しかけないで……。そ、そばにいるだけ、だから……｜は、話しかけるな……。そ、そばにいるだけ、だ……｜は、話しかけないでください……。そ、そばにいるだけ、ですから……」'),
polite:L('「失礼。あなたの隣しか空いていなかったもので｜失礼。あなたの隣しか空いていなかったものでな｜失礼いたします。あなたの隣しか空いておりませんでしたので」|「ご一緒したくはないけれど、仕方がないね｜一緒にいたくはないが、仕方がない｜ご一緒したくはありませんが、仕方がありませんね」')
}
},
grab:{
label:'物を取り上げて追いかけさせる',
lead:L('{a}は、{b}が手にしていたものを、すれ違いざまにひょいと取り上げた。{b}が手を伸ばすと、{a}はそれを高く掲げて一歩下がった。取り返そうとする{b}を、{a}はしばらく好きに追いかけさせた。|{a}は、{b}が置いたばかりの持ち物を拾い上げ、そのまま歩き出した。{b}が呼び止めても、振り返らなかった。追いかけてくる足音を、{a}は背中で確かめていた。|{a}は{b}の手から目当てのものを奪うと、届かない高さの棚に置いてしまった。{b}が文句を言いながら取りに行くのを、{a}は腕を組んで眺めていた。その顔は、どこか満足げだった。'),
say:{
proud:L('「欲しかったら取りに来れば？　あなたの足で｜欲しければ取りに来い。あなたの足でな｜欲しければ取りに来てください。あなたの足で」|「取られる方が悪い。悔しかったら追いかけてきて｜取られる方が悪い。悔しければ追いかけてこい｜取られる方が悪いんです。悔しければ追いかけてきてください」'),
stern:L('「管理が甘い。没収する｜管理が甘い。没収だ｜管理が甘いですね。没収します」|「返してほしければ、まず私の話を聞いて｜返してほしければ、まず私の話を聞け｜返してほしければ、まず私の話を聞いてください」'),
tsun:L('「べ、別にあなたの物が欲しかったわけじゃない！　……ほら、取り返してみなよ｜べ、別にあなたの物が欲しかったわけではない！　……ほら、取り返してみろ｜べ、別にあなたの物が欲しかったわけではありません！　……ほら、取り返してみてください」|「返してほしい？　じゃあ、ちゃんと私の名前を呼んで｜返してほしいか。なら、ちゃんと私の名前を呼べ｜返してほしいですか。では、ちゃんと私の名前を呼んでください」'),
gentle:L('「これ、しばらく預かるね。……返してほしかったら、ついてきて｜これは、しばらく預かる。……返してほしければ、ついてこい｜これは、しばらくお預かりしますね。……返してほしければ、ついてきてください」|「ふふ、こっちだよ。……べつに、あなたと遊びたいわけじゃないけど｜ふっ、こっちだ。……べつに、あなたと遊びたいわけではないが｜ふふ、こちらですよ。……べつに、あなたと遊びたいわけではありませんけど」'),
devoted:L('「取り返せるものなら、取り返してみて｜取り返せるものなら、取り返してみろ｜取り返せるものなら、取り返してみてください」|「追いかけてくるあなた、必死すぎて……いい気味｜追いかけてくるあなたは、必死すぎて……いい気味だ｜追いかけてくるあなたは、必死すぎて……いい気味です」'),
cool:L('「これがないと困るよね。困ればいい｜これがないと困るだろう。困ればいい｜これがないとお困りですよね。困ればいいんです」|「返してほしいなら、理由を三つ挙げて｜返してほしいなら、理由を三つ挙げろ｜返してほしいなら、理由を三つ挙げてください」'),
free:L('「へへ、もーらい。返してほしかったら鬼ごっこね｜ふん、もらった。返してほしければ鬼ごっこだ｜へへ、いただきです。返してほしければ鬼ごっこですよ」|「ほらほら、こっちこっち。……遅い、遅すぎ｜ほら、こっちだ。……遅い、遅すぎる｜ほらほら、こちらですよ。……遅いです、遅すぎます」'),
shy:L('「こ、これ……か、返してほしかったら、追いかけてきて……｜こ、これは……か、返してほしければ、追いかけてこい……｜こ、これ……か、返してほしければ、追いかけてきてください……」|「あ、あなたが困ってるの、ちょっとだけ、いい気味……｜あ、あなたが困っているのは、少しだけ、いい気味だ……｜あ、あなたが困っているのは、少しだけ、いい気味です……」'),
polite:L('「これ、少しのあいだ預かるね｜これは、少し預かる｜こちら、少々お預かりいたしますね」|「取り返したいなら、どうぞ自分の足で｜取り返したいなら、自分の足で来い｜取り返したいのでしたら、どうぞご自分の足でいらしてください」')
}
},
care:{
label:'世話を焼いて「勘違いするな」',
lead:L('{a}は、{b}の上着のほつれに気づくと、黙って針と糸を取り出した。{b}が礼を言いかけると、{a}は顔をしかめて遮った。手つきだけは、妙に丁寧だった。|{a}は、食事をとっていない{b}の前に、無言で皿を置いた。{b}が驚いて顔を上げると、{a}はもう背を向けていた。耳の先が、わずかに赤かった。|{a}は、{b}の手の傷を見つけると、乱暴にその手首を掴んで手当てを始めた。痛いと言われても、手は止めなかった。巻き終えた包帯は、驚くほどきれいに整っていた。'),
say:{
proud:L('「勘違いしないで。あなたに倒れられると、こっちが迷惑なだけ｜勘違いするな。あなたに倒れられると、こっちが迷惑なだけだ｜勘違いしないでください。あなたに倒れられると、こちらが迷惑なだけです」|「礼なんか言わないで。気持ち悪い｜礼など言うな。気持ちが悪い｜お礼なんて言わないでください。気持ちが悪いです」'),
stern:L('「勘違いしないで。放っておくと、全体の足を引っ張るから｜勘違いするな。放っておくと、全体の足を引っ張るからだ｜勘違いしないでください。放っておくと、全体の足を引っ張りますから」|「これは義務。あなたのためじゃない｜これは義務だ。あなたのためではない｜これは義務です。あなたのためではありません」'),
tsun:L('「か、勘違いしないで！　余ってたから、仕方なく……｜か、勘違いするな！　余っていたから、仕方なく……｜か、勘違いしないでください！　余っていたから、仕方なくです……」|「あなたのためじゃないから！　……でも、残したら許さない｜あなたのためではない！　……だが、残したら許さない｜あなたのためではありません！　……でも、残したら許しません」'),
gentle:L('「……勘違いしないで。見ていられなかっただけ｜……勘違いするな。見ていられなかっただけだ｜……勘違いしないでください。見ていられなかっただけです」|「嫌いな人でも、怪我は怪我。それだけ｜嫌いなやつでも、怪我は怪我だ。それだけだ｜嫌いな人でも、怪我は怪我です。それだけです」'),
devoted:L('「勘違いしないで。あなたが弱ってると、張り合いがないだけ｜勘違いするな。あなたが弱っていると、張り合いがないだけだ｜勘違いしないでください。あなたが弱っていると、張り合いがないだけです」|「嫌い。……嫌いだけど、ちゃんと食べて｜嫌いだ。……嫌いだが、ちゃんと食べろ｜嫌いです。……嫌いですけど、ちゃんと食べてください」'),
cool:L('「勘違いしないで。合理的に判断しただけ｜勘違いするな。合理的に判断しただけだ｜勘違いしないでください。合理的に判断しただけです」|「あなたが倒れたときの損失を計算した。それだけ｜あなたが倒れたときの損失を計算した。それだけだ｜あなたが倒れたときの損失を計算しました。それだけです」'),
free:L('「勘違いしないでね。ただの気まぐれだから｜勘違いするな。ただの気まぐれだ｜勘違いしないでくださいね。ただの気まぐれですから」|「はい、これ。嫌いな人にも優しい私、えらいでしょ｜ほら、これだ。嫌いなやつにも優しい私は、えらいだろう｜はい、これです。嫌いな人にも優しい私、えらいでしょう」'),
shy:L('「か、勘違い、しないで……。た、たまたま、だから……｜か、勘違い、するな……。た、たまたま、だ……｜か、勘違い、しないでください……。た、たまたま、ですから……」|「べ、べつに、心配なんか……し、してない……｜べ、べつに、心配など……し、していない……｜べ、べつに、心配なんか……し、していません……」'),
polite:L('「勘違いしないでね。礼儀として、放っておけなかっただけ｜勘違いするな。礼儀として、放っておけなかっただけだ｜勘違いなさらないでくださいね。礼儀として、放っておけなかっただけです」|「お礼は結構。あなたに借りを作られるのは、不愉快だから｜礼は結構だ。あなたに借りを作られるのは、不愉快だからな｜お礼は結構です。あなたに借りを作られるのは、不愉快ですから」')
}
},
cut:{
label:'ほかの人といる相手に割り込む',
lead:L('{b}が{c}と話し込んでいるところへ、{a}がずかずかと割って入った。{c}が目を丸くしても、{a}は気にも留めなかった。{a}の視線は、最初から{b}にしか向いていなかった。|{a}は、{b}と{c}のあいだに無理やり割って入った。用事があるような顔をしていたが、口から出たのは{b}への嫌味だけだった。{c}は苦笑して、そっと一歩下がった。|{b}が{c}に笑いかけた、その瞬間だった。{a}はわざと大きな音を立てて、二人のそばに荷物を置いた。会話は、そこで途切れた。'),
say:{
proud:L('「楽しそうだね。あなたの笑い声、うるさくて仕事にならない｜楽しそうだな。あなたの笑い声がうるさくて、仕事にならない｜楽しそうですね。あなたの笑い声がうるさくて、仕事になりません」|「{c}と話してる暇があるなら、こっちの用を先に片づけて｜{c}と話している暇があるなら、こっちの用を先に片づけろ｜{c}と話している暇があるなら、こちらの用を先に片づけてください」'),
stern:L('「話は終わり？　終わっていなくても、こっちが先｜話は終わりか。終わっていなくても、こちらが先だ｜お話は終わりましたか。終わっていなくても、こちらが先です」|「無駄話は後にして。あなたに言うことがある｜無駄話は後にしろ。あなたに言うことがある｜無駄話は後にしてください。あなたに言うことがあります」'),
tsun:L('「ふ、ふーん、ずいぶん仲良さそうじゃない。……べつに、どうでもいいけど！｜ふん、ずいぶん仲がよさそうだな。……べつに、どうでもいいが！｜ふ、ふーん、ずいぶん仲がよさそうですね。……べつに、どうでもいいですけど！」|「ちょっと、あなたに用があるの！　……な、何の用かは、今考える｜おい、あなたに用がある！　……な、何の用かは、今考える｜ちょっと、あなたに用があるんです！　……な、何の用かは、今考えます」'),
gentle:L('「ごめんね、{c}。この人、少し借りるよ｜すまない、{c}。この人を、少し借りる｜ごめんなさい、{c}。この方を、少しお借りしますね」|「……あなた、誰にでもそういう顔をするんだね。知らなかった｜……あなたは、誰にでもそういう顔をするんだな。知らなかった｜……あなたは、誰にでもそういう顔をなさるんですね。知りませんでした」'),
devoted:L('「話の途中でごめん。でも、こっちが先約だから｜話の途中ですまない。だが、こちらが先約だ｜お話の途中でごめんなさい。でも、こちらが先約ですから」|「あなたの相手は、私がする。……嫌々だけど｜あなたの相手は、私がする。……嫌々だが｜あなたのお相手は、私がします。……嫌々ですけど」'),
cool:L('「話の腰を折って悪いね。でも、優先順位はこっちが上｜話の腰を折って悪いな。だが、優先順位はこちらが上だ｜お話の腰を折ってすみません。でも、優先順位はこちらが上です」|「{c}との話、あと何分かかる？　待つ気はないけど｜{c}との話は、あと何分かかる。待つ気はないが｜{c}とのお話は、あと何分かかりますか。待つ気はありませんけど」'),
free:L('「はい、そこまで。{b}は今から私の暇つぶし担当｜よし、そこまでだ。{b}は今から私の暇つぶしの相手だ｜はい、そこまでです。{b}は今から私の暇つぶしの担当です」|「楽しそうなとこ悪いけど、混ぜて。……あ、{b}は嫌いだけど｜楽しそうなところ悪いが、混ぜろ。……ああ、{b}は嫌いだがな｜楽しそうなところ、すみません。混ぜてください。……あ、{b}は嫌いですけど」'),
shy:L('「あ、あの……ご、ごめん、{b}に、用があって……｜あ、あの……す、すまない、{b}に、用があって……｜あ、あの……ご、ごめんなさい、{b}に、用があって……」|「……そ、そんなに楽しそうにしなくても、いいのに……｜……そ、そんなに楽しそうにしなくても、いいだろう……｜……そ、そんなに楽しそうにしなくても、いいじゃないですか……」'),
polite:L('「お話し中に失礼。{b}、少しいい？｜話し中に失礼。{b}、少しいいか｜ご歓談中に失礼いたします。{b}、少しよろしいですか」|「楽しそうなところを悪いね。嫌いな人の笑顔は、目に障るもので｜楽しそうなところを悪いな。嫌いなやつの笑顔は、目に障るのでな｜楽しそうなところを申し訳ありません。嫌いな方の笑顔は、目に障るもので」')
}
}
};
var BACK={
lead:L('{b}は眉を吊り上げて言い返した。そのくせ、{a}から離れようとはしなかった。二人の言い合いは、なぜかいつまでも終わらなかった。|{b}は負けじと睨み返した。けれど、その手は{a}の袖を軽く掴んでいた。どちらが先に離すか、張り合っているようでもあった。|{b}は鼻で笑って、同じだけの嫌味を返した。言い返されるたびに、{a}の口数は増えた。傍から見れば、仲がいいようにしか見えなかった。'),
say:{
proud:L('「はあ？　こっちの台詞。……で、次は何？｜はあ？　こっちの台詞だ。……で、次は何だ｜はあ？　こちらの台詞です。……で、次は何ですか」|「うるさい。……あなたこそ、どこにも行かないで｜うるさい。……あなたこそ、どこにも行くな｜うるさいです。……あなたこそ、どこにも行かないでください」'),
stern:L('「同じ言葉を、そっくり返す。……まだ用は済んでいない｜＝｜同じ言葉を、そっくりお返しします。……まだ用は済んでいません」|「あなたに言われる筋合いはない。……座るなら、詰めて｜あなたに言われる筋合いはない。……座るなら、詰めろ｜あなたに言われる筋合いはありません。……座るなら、詰めてください」'),
tsun:L('「な、何なの！　あなたこそ、私のことばっかり見てるくせに！｜な、何だ！　あなたこそ、私のことばかり見ているくせに！｜な、何ですか！　あなたこそ、私のことばかり見ているくせに！」|「べ、別にあなたなんか待ってなかったし！｜べ、別にあなたなど待っていなかった！｜べ、別にあなたなんて待っていませんでした！」'),
gentle:L('「……あなたも大概だね。でも、もう少しここにいていいよ｜……あなたも大概だな。だが、もう少しここにいていい｜……あなたも大概ですね。でも、もう少しここにいていいですよ」|「嫌いな人に構われるのも、案外悪くない……なんて、言わないけど｜嫌いなやつに構われるのも、案外悪くない……とは、言わないが｜嫌いな方に構われるのも、案外悪くない……なんて、言いませんけど」'),
devoted:L('「あなたなんか嫌い。……だから、私も離れてあげない｜あなたなど嫌いだ。……だから、私も離れてやらない｜あなたなんて嫌いです。……だから、私も離れてあげません」|「そうやって私に構うの、やめたら？　……やめなくていいけど｜そうやって私に構うのは、やめたらどうだ。……やめなくていいが｜そうやって私に構うの、やめたらどうですか。……やめなくていいですけど」'),
cool:L('「あなたの行動、もう読めてる。……付き合ってあげる｜あなたの行動は、もう読めている。……付き合ってやる｜あなたの行動は、もう読めています。……付き合ってあげます」|「無駄な時間。……あと五分だけ、無駄にしてあげる｜無駄な時間だ。……あと五分だけ、無駄にしてやる｜無駄な時間です。……あと五分だけ、無駄にしてあげます」'),
free:L('「あはは、必死すぎ。……いいよ、遊んであげる｜はは、必死すぎだ。……いいだろう、遊んでやる｜あはは、必死すぎです。……いいですよ、遊んであげます」|「嫌いな人同士、仲良くやろうよ｜嫌いなやつ同士、仲良くやろう｜嫌いな人同士、仲良くやりましょうよ」'),
shy:L('「わ、私だって……あ、あなたのこと、き、嫌いなんだから……っ｜わ、私だって……あ、あなたのことが、き、嫌いなんだ……っ｜わ、私だって……あ、あなたのことが、き、嫌いなんですから……っ」|「……い、行かないで、とは、言ってない……｜……い、行くな、とは、言っていない……｜……い、行かないで、とは、言っていません……」'),
polite:L('「まあ、ご挨拶だね。……相手をしてあげる｜ずいぶんな挨拶だな。……相手をしてやる｜まあ、ご挨拶ですね。……お相手して差し上げます」|「お互い、嫌い合っているのにね。不思議と、退屈はしない｜お互い、嫌い合っているのにな。不思議と、退屈はしない｜お互い、嫌い合っているはずなんですけどね。不思議と、退屈はしません」')
}
};
var NOFEEL={
cold:L('{b}は、{a}のほうを見もしなかった。返事の代わりに、小さく肩をすくめただけだった。{a}の言葉は、行き場をなくして宙に浮いた。|{b}は面倒くさそうに{a}を一瞥し、すぐに手元へ目を戻した。相手にするだけ無駄だと、顔に書いてあった。{a}は唇を噛んだ。|{b}は眉ひとつ動かさずに、{a}の脇をすり抜けた。{a}が何をしたいのか、考える気もないようだった。残された{a}は、舌打ちをひとつした。'),
annoy:L('{b}は露骨に顔をしかめて、{a}から一歩離れた。何を企んでいるのかと、疑うような目だった。{a}がなぜ自分に絡んでくるのか、{b}には見当もつかなかった。|{b}は、うんざりしたように息を吐いた。嫌っている相手に付きまとわれるほど、迷惑なことはなかった。{b}はそのまま、{a}に背を向けた。|{b}は{a}の手を払いのけた。触れられた場所を、汚れでも落とすように軽くはたいた。{a}の顔が、一瞬だけ歪んだ。')
};
var JEAL={
iyami:{label:'嫌味',to:'t',lead:L('{t}と{b}が笑い合っているのを、{a}は少し離れたところから見ていた。腹の底が、じりじりと焦げるようだった。気づけば{a}は、二人のすぐそばまで歩み寄っていた。|{b}が{t}の肩に触れたのを見て、{a}の手の中で、握っていた器がみしりと鳴った。顔だけは平然としていた。けれど、出てきた声は自分でも驚くほど冷たかった。|{a}は、{t}が{b}に向けた笑顔を見てしまった。自分には、一度も向けられたことのない顔だった。{a}はわざと足音を立てて、二人に近づいた。')},
jama:{label:'邪魔',to:'t',lead:L('{a}は、{t}と{b}が並んで座っているところへ、わざと割り込んで腰を下ろした。{b}が押し出されるように端へずれた。{a}は何食わぬ顔で、{t}にだけ話しかけた。|{t}と{b}の話が弾みかけたところで、{a}が{t}に用事を言いつけた。どう考えても、今でなくてもいい用事だった。{t}がしぶしぶ立ち上がると、{a}は満足そうに鼻を鳴らした。|{a}は、{t}と{b}のあいだに、わざと大きな荷物を置いた。二人の距離は、それだけで一歩ぶん開いた。{a}はその荷物の上に、ふてぶてしく腰かけた。')},
yatsu:{label:'八つ当たり',to:'b',lead:L('{a}は、{t}と{b}が親しげに話すのを、黙って見ていた。それから、手近な箱を思いきり蹴飛ばした。大きな音に振り返った{b}を、{a}は鋭く睨みつけた。|{a}は、{t}が{b}に笑いかけるのを見てから、ずっと機嫌が悪かった。話しかけてきた{b}にも、ろくに返事をしなかった。苛立ちの理由を、{a}は自分でも認めたくなかった。|{a}は、{b}の些細な言い間違いに、いつになく強い調子で噛みついた。{b}は目を丸くした。原因が{t}にあることは、{a}を見ていれば分かった。')},
teki:{label:'その人への敵意',to:'b',lead:L('{a}は、{t}のそばを離れようとしない{b}の前に立ちはだかった。上から下まで、値踏みするように眺めた。その目には、隠す気もない敵意があった。|{a}は、{b}が{t}に差し出した飲み物を、横から取り上げて飲み干した。{b}が抗議しかけると、{a}は空の器を突き返した。{t}はあきれたようにため息をついた。|{a}は{b}の耳元で、低く囁いた。{t}には聞こえない声だった。{b}の顔から、さっと血の気が引いた。')}
};
var JEAL_T={
proud:L('「へえ、{b}とはずいぶん楽しそうだね。私の前では一度も笑わないくせに｜ほう、{b}とはずいぶん楽しそうだな。私の前では一度も笑わないくせに｜へえ、{b}とはずいぶん楽しそうですね。私の前では一度も笑わないくせに」|「勝手にすれば。……{b}なんかと、どこへでも行けばいい｜勝手にしろ。……{b}などと、どこへでも行けばいい｜勝手にしてください。……{b}なんかと、どこへでも行けばいいんです」'),
stern:L('「{b}と馴れ合うのは結構。ただ、私の目の届くところでやって｜{b}と馴れ合うのは結構だ。ただし、私の目の届くところでやれ｜{b}と馴れ合うのは結構です。ただ、私の目の届くところでやってください」|「浮かれていると、足をすくわれる。……{b}に、特に｜浮かれていると、足をすくわれるぞ。……{b}に、特にな｜浮かれていると、足をすくわれますよ。……{b}に、特に」'),
tsun:L('「な、何なの、{b}とばっかり！　……べ、別に、羨ましくなんかないけど！｜な、何だ、{b}とばかり！　……べ、別に、羨ましくなどない！｜な、何ですか、{b}とばかり！　……べ、別に、羨ましくなんかありません！」|「あなたなんか、{b}とでも仲良くしてればいい。……ばか｜あなたなど、{b}とでも仲良くしていろ。……ばかが｜あなたなんて、{b}とでも仲良くしていればいいんです。……ばかなんですから」'),
gentle:L('「……{b}と一緒だと、そんなふうに笑うんだね｜……{b}と一緒だと、そんなふうに笑うんだな｜……{b}と一緒だと、そんなふうに笑うんですね」|「楽しそうで何より。……私には関係ないけど｜楽しそうで何よりだ。……私には関係ないが｜楽しそうで何よりです。……私には関係ありませんけど」'),
devoted:L('「{b}のどこがいいの？　……言わなくていい。聞きたくない｜{b}のどこがいいんだ。……言わなくていい。聞きたくない｜{b}のどこがいいんですか。……言わなくていいです。聞きたくありません」|「あなたが誰と笑ってても、私には関係ない。……関係ないのに｜あなたが誰と笑っていても、私には関係ない。……関係ないのに｜あなたが誰と笑っていても、私には関係ありません。……関係ないのに」'),
cool:L('「{b}との会話、生産性がない。見ていて分かる｜{b}との会話は、生産性がない。見ていて分かる｜{b}との会話は、生産性がありません。見ていて分かります」|「あなたの判断力、{b}の前だと落ちるみたいだね｜あなたの判断力は、{b}の前だと落ちるようだな｜あなたの判断力は、{b}の前だと落ちるようですね」'),
free:L('「えー、{b}とそんなに楽しい？　私といる方が面白いのに｜ほう、{b}とそんなに楽しいか。私といる方が面白いだろうに｜えー、{b}とそんなに楽しいですか。私といる方が面白いのに」|「ふーん、いいんじゃない。……つまんない｜ふん、いいんじゃないか。……つまらない｜ふーん、いいんじゃないですか。……つまらないです」'),
shy:L('「……{b}と、た、楽しそう、だね……｜……{b}と、た、楽しそう、だな……｜……{b}と、た、楽しそう、ですね……」|「わ、私には……あ、あんな顔、しないくせに……｜わ、私には……あ、あんな顔は、しないくせに……｜わ、私には……あ、あんな顔、なさらないくせに……」'),
polite:L('「{b}とは、ずいぶん親しくしているんだね｜{b}とは、ずいぶん親しくしているな｜{b}とは、ずいぶん親しくなさっているんですね」|「どうぞ、二人でごゆっくり。……私は、少しも気にしていないから｜どうぞ、二人でごゆっくり。……私は、少しも気にしていない｜どうぞ、お二人でごゆっくり。……私は、少しも気にしておりませんから」')
};
var JEAL_R={
proud:L('「{t}に馴れ馴れしくしないで。目障り｜{t}に馴れ馴れしくするな。目障りだ｜{t}に馴れ馴れしくしないでください。目障りです」|「あなた、{t}の何なの？　……答えなくていい。聞きたくない｜あなたは、{t}の何だ。……答えなくていい。聞きたくない｜あなたは、{t}の何なんですか。……答えなくていいです。聞きたくありません」'),
stern:L('「{t}に近づくのは控えて。理由は言わない｜{t}に近づくのは控えろ。理由は言わない｜{t}に近づくのは控えてください。理由は申し上げません」|「あなたの軽率さが、{t}に移ると困る｜＝｜あなたの軽率さが、{t}に移ると困ります」'),
tsun:L('「ちょっと、{t}にくっつきすぎ！　……べ、別に、私には関係ないけど！｜おい、{t}にくっつきすぎだ！　……べ、別に、私には関係ないが！｜ちょっと、{t}にくっつきすぎです！　……べ、別に、私には関係ありませんけど！」|「あなた、{t}のこと何も分かってない。……分かってるのは、私だけ｜あなたは、{t}のことを何も分かっていない。……分かっているのは、私だけだ｜あなたは、{t}のことを何も分かっていません。……分かっているのは、私だけです」'),
gentle:L('「ごめん、今あなたと話す気分じゃない。……{t}のせいでね｜すまない、今あなたと話す気分ではない。……{t}のせいでな｜ごめんなさい、今あなたと話す気分ではありません。……{t}のせいで」|「{t}と仲がいいんだね。……それ以上は、近づかないで｜{t}と仲がいいんだな。……それ以上は、近づくな｜{t}と仲がよろしいんですね。……それ以上は、近づかないでください」'),
devoted:L('「{t}は、あなたが思うような人じゃない。……私の方が、よく知ってる｜{t}は、あなたが思うような人間ではない。……私の方が、よく知っている｜{t}は、あなたが思うような方ではありません。……私の方が、よく知っています」|「{t}の隣は、あなたの場所じゃない｜{t}の隣は、あなたの場所ではない｜{t}の隣は、あなたの場所ではありません」'),
cool:L('「{t}にあなたは釣り合わない。客観的な評価｜{t}にあなたは釣り合わない。客観的な評価だ｜{t}にあなたは釣り合いません。客観的な評価です」|「あなたがいると、私の計算が狂う。{t}のそばにいるときは、特に｜あなたがいると、私の計算が狂う。{t}のそばにいるときは、特にな｜あなたがいると、私の計算が狂います。{t}のそばにいるときは、特に」'),
free:L('「ねえ、{t}は私のおもちゃなんだけど。勝手に遊ばないで｜おい、{t}は私のおもちゃだ。勝手に遊ぶな｜あの、{t}は私のおもちゃなんですけど。勝手に遊ばないでください」|「{t}とそんなに仲良くして、楽しい？　……ふーん｜{t}とそんなに仲良くして、楽しいか。……ふん｜{t}とそんなに仲良くして、楽しいですか。……そうですか」'),
shy:L('「あ、あの……{t}に、あんまり、近づかないで……｜あ、あの……{t}に、あまり、近づくな……｜あ、あの……{t}に、あまり、近づかないでください……」|「……あ、あなたなんか、き、嫌い……｜……あ、あなたなど、き、嫌いだ……｜……あ、あなたなんて、き、嫌いです……」'),
polite:L('「{t}と親しいのは結構。ただ、節度はわきまえて｜{t}と親しいのは結構だ。ただし、節度はわきまえろ｜{t}と親しくなさるのは結構です。ただ、節度はわきまえてください」|「失礼。あなたの顔を見ると、なぜか苛立つもので｜失礼。あなたの顔を見ると、なぜか苛立つのでな｜失礼いたしました。あなたの顔を見ると、なぜか苛立つもので」')
};
var JEAL_TAIL={
both:L('{t}は呆れたように{a}を見た。けれど、その口元はほんの少しだけ緩んでいた。|{t}は「何なの」と眉をひそめた。そのくせ、{b}との話はそこで切り上げて、{a}のほうへ向き直った。|{t}は舌打ちをして、{a}の腕を掴んで引き寄せた。言い合いが始まると、{t}の目はもう{a}しか見ていなかった。'),
one:L('{t}は、{a}が何に苛立っているのか分からないまま、首を傾げた。|{t}は{a}の不機嫌を、いつものことだと受け流した。|{t}は肩をすくめて、{b}との話に戻った。{a}の苛立ちの理由など、考えもしなかった。')
};
function kamauKind(x,a,b,c){
var t=a.tr||{},w=[
['jab',0.6+(t.aggr||0)*0.6+(t.cp||0)*0.3],
['sit',0.6+(t.fc||0)*0.3+(t.np||0)*0.2],
['grab',0.45+(t.fc||0)*0.5+(t.impulse||0)*0.3],
['care',0.45+(t.np||0)*0.6+(t.ac||0)*0.2],
['cut',c?0.6+(t.jealous||0)*0.6:0]
],sum=0,r;
w.forEach(function(q){sum+=q[1];});
r=rnd(x)*sum;
for(var i=0;i<w.length;i++){r-=w[i][1];if(r<=0)return w[i][0];}
return'jab';
}
function hateLv(x,a,b){return HK.HateKit&&HK.HateKit.level?HK.HateKit.level(x,a,b):0;}
var CRAMPED={
jab:L('{a}は、狭い中でわざと{b}の肩に肘をぶつけた。{b}が顔を向けると、{a}は待っていたように口を開いた。|{a}は、{b}が何か言うたびに、いちいち反対のことを言った。{b}が呆れた顔をしても、やめる気配はなかった。{b}の目がこちらを向くたびに、{a}の口元は少しだけ緩んだ。|{a}は、{b}の耳元で、聞こえよがしにため息をついた。{b}が身をよじっても、{a}は顔を背けようとしなかった。むしろ、ほんの少しだけ{b}のほうへ体を寄せた。'),
cold:L('{b}は、{a}のほうを見もしなかった。返事の代わりに、小さく肩をすくめただけだった。{a}の言葉は、行き場をなくして宙に浮いた。|{b}は面倒くさそうに{a}を一瞥し、すぐに目を閉じた。相手にするだけ無駄だと、顔に書いてあった。{a}は唇を噛んだ。|{b}は眉ひとつ動かさずに、壁のほうへ顔を向けた。{a}が何をしたいのか、考える気もないようだった。肩を並べたまま、{a}は舌打ちをひとつした。'),
annoy:L('{b}は露骨に顔をしかめて、できるかぎり{a}から体を離した。何を企んでいるのかと、疑うような目だった。{a}がなぜ自分に絡んでくるのか、{b}には見当もつかなかった。|{b}は、うんざりしたように息を吐いた。嫌っている相手とこの狭さに押し込められているだけでも、迷惑でしかなかった。{b}は身をよじって、{a}に背を向けた。|{b}は{a}の手を払いのけた。触れられた場所を、汚れでも落とすように軽くはたいた。{a}の顔が、一瞬だけ歪んだ。')
};
var HARD={jab:1,grab:1,cut:1,quarrel:1,chase:1,snap:1,vie:1,jeal:1},SOFT={care:1,kcare:1,lose:1,rescue:1};
LH.HARD=HARD;LH.SOFT=SOFT;
LH.mark=function(x,a,b,kind){
var o={kind:kind,hard: !!HARD[kind],soft: !!SOFT[kind]};
if(isCtx(x)){o.at=x.stepIndex;var pf=x.pair(a,b);(pf.lhK=pf.lhK||{})[a.i]=o;}
else{x._lhTick=x._lhTick||0;o.at=x._lhTick;(x.lhK=x.lhK||{})[a.i+'>'+b.i]=o;}
return o;
};
LH.lastMark=function(x,a,b){return isCtx(x)?((x.pair(a,b).lhK||{})[a.i]||null):((x.lhK||{})[a.i+'>'+b.i]||null);};
var FACE_JA={hate:'嫌悪',love:'素直になれない恋',kin:'口の悪い家族',peer:'張り合う相手'};
LH.FACE_JA=FACE_JA;
function faceKind(x,a,fc,c){
var FK=LH.FX&&LH.FX.KAMAU&&LH.FX.KAMAU[fc],t=a.tr||{};
if(!FK)return'';
var w=Object.keys(FK).map(function(k){return[k,FK[k].w?FK[k].w(t):0.5];});
if(c&&fc!=='kin')w.push(['cut',0.45+(t.jealous||0)*0.6]);
var sum=0,r;
w.forEach(function(q){sum+=q[1];});
r=rnd(x)*sum;
for(var i=0;i<w.length;i++){r-=w[i][1];if(r<=0)return w[i][0];}
return w[0][0];
}
LH.kamau=function(x,a,b,c){
var cr= !!(x&&x.hkSpace==='cramped'),fc=LH.face(x,a,b),FX=LH.FX||{},FK= !cr&&fc!=='hate'&&FX.KAMAU?FX.KAMAU[fc]:null;
var kind=cr?'jab':FK?faceKind(x,a,fc,c):kamauKind(x,a,b,c);
var K=(FK&&FK[kind])||KAMAU[kind],m={a:a,b:b,c:c};
var text=pick(x,cr?CRAMPED.jab:K.lead)+a.name+pick(x,K.say[ps(a)]);
var both=LH.has(x,b,a),react,NF=FK&&FX.NOFEEL?FX.NOFEEL[fc]:null;
if(both){text+=pick(x,(FK&& !cr&&FX.BACK_LEAD&&FX.BACK_LEAD[fc])||BACK.lead)+b.name+pick(x,((FK&&FX.BACK_SAY&&FX.BACK_SAY[fc])||BACK.say)[ps(b)]);react=b.name+'も同じ気持ち（愛憎：双方）。言い返しながら、構い返した';}
else if(NF&& !cr){text+=pick(x,NF);react=b.name+'は愛憎を持たない。'+a.name+'の態度に首を傾げた';}
else if(hateLv(x,b,a)>=35&&rnd(x)<0.6){text+=pick(x,cr?CRAMPED.annoy:NOFEEL.annoy);react=b.name+'は愛憎を持たない（ふつうの敵対）。苛立って突き放した';}
else{text+=pick(x,cr?CRAMPED.cold:NOFEEL.cold);react=b.name+'は愛憎を持たない（ふつうの敵対）。気にも留めなかった';}
if(isCtx(x)){
x.mod(a,b,{att:3,ten:2});
if(both)x.mod(b,a,{att:3,ten:1});else x.mod(b,a,{ten:2});
var pf=x.pair(a,b);pf.lhN=(pf.lhN||0)+1;
}else{var k=a.i+'>'+b.i;x.lhN=x.lhN||{};x.lhN[k]=(x.lhN[k]||0)+1;}
LH.mark(x,a,b,kind);
return{text:fill(text,m),why:LH.why(x,a,b)+'／表の顔：'+FACE_JA[fc]+'／'+K.label+'／'+react,kind:kind,both:both,face:fc};
};
function recentClose(ctx,t,b){
var log=ctx.log||[];
for(var i=log.length-1,n=0;i>=0&&n<14;i--,n++){
var e=log[i];
if(!e||e.step<ctx.stepIndex-1)break;
if(e.kind!=='event'|| !/^(romance|bond|help)$/.test(e.cat))continue;
var ac=e.actors||[];
if(ac.indexOf(t.i)>=0&&ac.indexOf(b.i)>=0)return true;
}
return false;
}
function closeNow(ctx,t,b){var r=ctx.R(t,b);return r.aff+r.att>70;}
function noJeal(ctx,a,t){return(HK.Obsess&&HK.Obsess.noTie&&HK.Obsess.noTie(ctx,a,t))||(ctx.env&&ctx.env.romance===0);}
function jealTarget(ctx,a,b){
var best=null,bs=0;
LH.targets(ctx,a).forEach(function(t){
if(t===b||noJeal(ctx,a,t)||LH.has(ctx,b,t))return;
if(ctx.scen&&ctx.scen.othersFor&&ctx.others(a).indexOf(t)<0)return;
var s=recentClose(ctx,t,b)?2:closeNow(ctx,t,b)?1:0;
if(s>bs){bs=s;best=t;}
});
return best?{t:best,s:bs}:null;
}
if(HK.COMMON){
HK.addTo(HK.COMMON,{
id:'tie_lh_kamau',label:'好きの裏返しでわざと突っかかる',cat:'conflict',scope:'pair',
when:function(ctx,a,b){
if(!LH.has(ctx,a,b)|| !here(a)|| !here(b))return false;
var pf=ctx.pair(a,b),at=pf.lhAt&&pf.lhAt[a.i];
return at==null||ctx.stepIndex-at>=2;
},
w:function(ctx,a){var t=a.tr||{};return 1.1+(t.fc||0)*0.4+(t.impulse||0)*0.3+(t.aggr||0)*0.2;},
run:function(ctx,a,b){
var pf=ctx.pair(a,b);(pf.lhAt=pf.lhAt||{})[a.i]=ctx.stepIndex;
var cs=ctx.others(b).filter(function(o){return o!==a&&here(o)&&ctx.R(b,o).aff>10;}),c=cs.length?ctx.pick(cs):null;
var r=LH.kamau(ctx,a,b,c);
var o={text:r.text,why:r.why,mag:16,cat:'conflict'};
if(r.kind==='cut'&&c)o.with=[c];
return o;
}
});
HK.addTo(HK.COMMON,{
id:'tie_lh_jeal',label:'愛憎の相手が誰かと親しくて妬く',cat:'conflict',scope:'pair',
when:function(ctx,a,b){
if(!here(a)|| !here(b)|| !LH.targets(ctx,a).length)return false;
var j=jealTarget(ctx,a,b);
if(!j)return false;
var pf=ctx.pair(a,j.t),at=pf.lhJAt&&pf.lhJAt[a.i];
return at==null||ctx.stepIndex-at>=1;
},
w:function(ctx,a,b){var j=jealTarget(ctx,a,b);return j?(1+(a.tr.jealous||0))*(j.s===2?3:0.6):0;},
run:function(ctx,a,b){
var j=jealTarget(ctx,a,b);
if(!j)return null;
var t=j.t,pf=ctx.pair(a,t);
(pf.lhJAt=pf.lhJAt||{})[a.i]=ctx.stepIndex;pf.lhJeal=(pf.lhJeal||0)+1;
var tr=a.tr||{},kinds=[['iyami',0.7+(tr.cp||0)*0.3],['jama',0.6+(tr.fc||0)*0.4],['yatsu',0.4+(tr.aggr||0)*0.5+(tr.impulse||0)*0.2],['teki',0.4+(tr.aggr||0)*0.4+(tr.jealous||0)*0.3]];
var k=HK.weighted(ctx.rng,kinds,function(q){return q[1];})[0],J=JEAL[k],m={a:a,b:b,t:t};
var fc=LH.face(ctx,a,t),FX=LH.FX||{},JT=(fc!=='hate'&&FX.JEAL_T&&FX.JEAL_T[fc])||JEAL_T,JTL=(fc!=='hate'&&FX.JEAL_TAIL&&FX.JEAL_TAIL[fc])||JEAL_TAIL;
var text=ctx.pick(J.lead)+a.name+ctx.pick((J.to==='t'?JT:JEAL_R)[ps(a)])+ctx.pick(JTL[LH.has(ctx,t,a)?'both':'one']);
if(J.to==='t')LH.mark(ctx,a,t,'jeal');
ctx.mod(a,b,{ten:10,aff: -6});ctx.mod(a,t,{att:7,ten:0});ctx.stress(a,6);
if(HK.Obsess&&HK.Obsess.feed)HK.Obsess.feed(ctx,a,t,3);
return{with:[t],text:fill(text,m),why:a.name+'の嫉妬（愛憎）。'+t.name+'が'+b.name+'と'+(j.s===2?'親しくしたばかりだった':'親しげにしていた')+'。口では嫌っている相手なのに、我慢ならなかった／表の顔：'+FACE_JA[fc]+'／'+J.label,mag:18};
}
});
}
var H=HK.HateKit;
if(H&&H.storyTick&& !H.storyTick._lh){
var st0=H.storyTick;
H.storyTick=function(S,live,opt){
opt=opt||{};
if(opt.kinds==='love')return st0.apply(this,arguments);
S._lhTick=(S._lhTick||0)+1;
var more=LH.storyMore?LH.storyMore(S,live||[],opt):null;
if(more)return more;
var ps0=[];
(live||[]).forEach(function(a){(live||[]).forEach(function(b){if(a!==b&&here(a)&&here(b)&&LH.has(S,a,b)&& !(opt.lhSkip&&opt.lhSkip(a,b)))ps0.push([a,b]);});});
if(ps0.length&&S.rng()<(opt.rate||0.12)*1.4){
var p=ps0[Math.floor(S.rng()*ps0.length)],a=p[0],b=p[1];
var cs=live.filter(function(o){return o!==a&&o!==b&&here(o);}),c=cs.length&&S.rng()<0.4?cs[Math.floor(S.rng()*cs.length)]:null;
var r=LH.kamau(S,a,b,c);
return{text:(opt.place||'')+r.text,why:r.why,mag:16,cat:'conflict',actors:r.kind==='cut'&&c?[a,b,c]:[a,b],lh:true};
}
return st0.apply(this,arguments);
};
H.storyTick._lh=true;
}
var LAB={
kusare:{name:'腐れ縁（愛憎）',cls:'obsess',pol:0},kusare1:{name:'腐れ縁（愛憎）',cls:'obsess',pol:0},
lhkin:{name:'口の悪い家族',cls:'partner',pol:1},lhkin1:{name:'口の悪い家族',cls:'partner',pol:1}
};
var COUPLE_NAME='喧嘩ばかりの恋人';
var OVER= /^(lovehate|rivals|night|vague|dislike|awkward|strangers|oneway|obsess|fwbsettle|fwbend|friends|pining|guard|accomplice)$/;
var KIN_OVER= /^(kinbond|kinfeud|guard|accomplice|awkward|strangers)$/;
var END=null;
LH.refine=function(ctx,A,B,pf,cl){
if(!cl|| !pf||pf.kill)return null;
var ha=LH.has(ctx,A,B),hb=LH.has(ctx,B,A);
if(!ha&& !hb)return null;
var body= !!(pf.night||pf.hateSex||pf.hateNight),n=(pf.lhN||0)+(pf.lhJeal||0)+(pf.lhLewd||0)*2+(pf.lhMore||0);
if(!body&&n<3)return null;
if(HK.LABELS)for(var k in LAB)if(!HK.LABELS[k])HK.LABELS[k]=LAB[k];
var fc=LH.face(ctx,A,B);
if(pf.couple){
if(cl.id==='lovers'){
if(!END||END.log!==ctx.log)END={log:ctx.log,m:{}};
END.m[A.i+'-'+B.i]=END.m[B.i+'-'+A.i]='couple';
}
return null;
}
if(fc==='kin')return KIN_OVER.test(cl.id)?(ha&&hb?{id:'lhkin'}:{id:'lhkin1',dir:ha?A.i:B.i}):null;
if(!OVER.test(cl.id))return null;
return ha&&hb?{id:'kusare'}:{id:'kusare1',dir:ha?A.i:B.i};
};
function isCouple(ctx,A,B){return!!(END&&END.log===ctx.log&&END.m[A.i+'-'+B.i]);}
LH.pairText=function(ctx,A,B,cl){
if(!cl)return null;
if(cl.id==='lovers'&&isCouple(ctx,A,B))return'顔を合わせれば言い合いになり、そのたびにどちらからともなく元の鞘に収まった。喧嘩の数だけ、二人は恋人のままだった。';
if(!LAB[cl.id])return null;
if(cl.id==='kusare')return'顔を合わせれば憎まれ口を叩き合い、それでも互いのそばを離れられない――そんな腐れ縁になった。';
if(cl.id==='lhkin')return'口を開けば文句ばかり言い合い、それでも困ったときにいちばん先に駆けつけるのは、いつも互いだった。口の悪い家族のままだった。';
var x=ctx.chars[cl.dir],y=x===A?B:A;
if(cl.id==='lhkin1')return x.name+'は'+y.name+'に口うるさく当たり続けた。それでも、'+y.name+'が困ったときに真っ先に動くのは、いつも'+x.name+'だった。';
return x.name+'は口では'+y.name+'を嫌い続けながら、結局'+y.name+'から離れられなかった。腐れ縁と呼ぶほかない関係だった。';
};
var TR=HK.TieRel;
if(TR&& !TR._lhHooked){
TR._lhHooked=true;
HK.wrap(TR,'refine',function(rf0){return function(ctx,A,B,pf,cl){var r=LH.refine(ctx,A,B,pf,cl);return r||(rf0?rf0.apply(this,arguments):null);};});
HK.wrap(TR,'pairText',function(pt0){return function(ctx,A,B,cl){return LH.pairText(ctx,A,B,cl)||(pt0?pt0.apply(this,arguments):null);};});
}
LH.endBegin=function(){END=null;};
LH.endPatch=function(r){
if(r&&END&&r.pairs)r.pairs.forEach(function(p){if(p.label==='lovers'&&END.m[p.a+'-'+p.b]){p.lh='couple';p.name=COUPLE_NAME;}});
END=null;
return r;
};
if(HK.LABELS)for(var k0 in LAB)if(!HK.LABELS[k0])HK.LABELS[k0]=LAB[k0];
})();
});
;
/* ==== js/hate-love-more.js ==== */
HK.Load.def(41,'js/hate-love-more.js',function(){
(function(){
'use strict';
var HK=window.HK,LH=HK&&HK.LoveHate;
if(!LH|| !HK.Ties)return;
function L(s){return s.split('|');}
function isCtx(x){return!!(x&&x.R&&x.pair&&x.chars);}
var PS=['proud','stern','tsun','gentle','devoted','cool','free','shy','polite'];
function ps(c){var p=HK.personaOf?HK.personaOf(c):c.persona;return PS.indexOf(p)>=0?p:'gentle';}
function here(c){return!!c&&(!HK.State||HK.State.here(c));}
function rnd(x){return x.rng?x.rng():Math.random();}
function pick(x,l){if(isCtx(x))return x.pick(l);if(x.pickArr)return x.pickArr(l);return l[Math.floor(rnd(x)*l.length)];}
function fill(t,m){return String(t).replace(/\{(a|b|c|t|w)\}/g,function(s,k){var v=m[k];return v==null?s:typeof v==='string'?v:v.name;});}
function tr(c){return(c&&c.tr)||{};}
var FX=LH.FX={};
FX.KAMAU={
love:{
quarrel:{
label:'喧嘩をふっかけて引き止める',w:function(t){return 0.6+(t.aggr||0)*0.4+(t.cp||0)*0.3;},
lead:L('{a}は、{b}の些細な言い間違いを拾って、わざわざ言い返した。言い合いはすぐに熱を帯び、{b}が呆れて背を向けかけた。その袖を、{a}の指がとっさに掴んでいた。|{a}は、{b}の段取りにいちいち口を挟んだ。{b}がもういいと立ち上がると、{a}は慌てたように前に回り込んだ。言い過ぎたとは、どうしても口にできなかった。|{a}と{b}の言い合いは、いつものように取るに足らないことから始まった。{b}が話を切り上げようとするたび、{a}は新しい文句を見つけて引き止めた。終わらせたくないのは、文句のほうではなかった。'),
say:{
proud:L('「まだ話は終わってない。勝手に行かないで｜まだ話は終わっていない。勝手に行くな｜まだ話は終わっていません。勝手に行かないでください」|「怒ってるのはこっち。……だから、ここにいて｜怒っているのはこっちだ。……だから、ここにいろ｜怒っているのはこちらです。……だから、ここにいてください」'),
stern:L('「話の途中で席を立つのは、感心しない｜＝｜話の途中で席を立つのは、感心しません」|「納得のいく答えを聞くまで、帰さない｜＝｜納得のいく答えを伺うまで、帰しません」'),
tsun:L('「べ、別に引き止めてなんかない！　話が終わってないだけ！｜べ、別に引き止めてなどいない！　話が終わっていないだけだ！｜べ、別に引き止めてなんかいません！　話が終わっていないだけです！」|「どこ行くの。……ち、違う、気になったわけじゃないから｜どこへ行く。……ち、違う、気になったわけではない｜どこへ行くんですか。……ち、違います、気になったわけではありません」'),
gentle:L('「言い過ぎた……とは言わないけど。もう少しだけ、ここにいて｜言い過ぎた……とは言わないが。もう少しだけ、ここにいてくれ｜言い過ぎた……とは言いませんけど。もう少しだけ、ここにいてください」|「怒ったまま別れるのは、嫌なんだ｜＝｜怒ったまま別れるのは、嫌なんです」'),
devoted:L('「あなたのそういうところ、本当に嫌。……でも、行かないで｜あなたのそういうところが、本当に嫌だ。……だが、行くな｜あなたのそういうところ、本当に嫌です。……でも、行かないでください」|「怒ってる私を置いていくなんて、許さない｜怒っている私を置いていくなど、許さない｜怒っている私を置いていくなんて、許しません」'),
cool:L('「議論はまだ終わってない。結論を出すまで付き合って｜議論はまだ終わっていない。結論を出すまで付き合え｜議論はまだ終わっていません。結論を出すまで付き合ってください」|「感情的になってるのは認める。それでも、帰っていいとは言ってない｜感情的になっているのは認める。それでも、帰っていいとは言っていない｜感情的になっているのは認めます。それでも、帰っていいとは言っていません」'),
free:L('「えー、もう行っちゃうの？　喧嘩の続き、まだでしょ｜もう行くのか。喧嘩の続きが、まだだろう｜えー、もう行ってしまうんですか。喧嘩の続き、まだでしょう」|「怒った顔、もうちょっと見せてよ。……冗談だって｜怒った顔を、もう少し見せろ。……冗談だ｜怒った顔、もう少し見せてくださいよ。……冗談ですって」'),
shy:L('「ま、待って……ま、まだ、怒ってる、から……｜ま、待て……ま、まだ、怒っている、からな……｜ま、待ってください……ま、まだ、怒っています、から……」|「い、行っちゃ、やだ……じゃ、じゃなくて、話、終わってない……｜い、行くな……い、いや、話が、終わっていない……｜い、行っては、嫌です……い、いえ、話が、終わっていません……」'),
polite:L('「話の途中で帰るのは、礼儀に反するよ｜話の途中で帰るのは、礼儀に反する｜お話の途中でお帰りになるのは、礼儀に反しますよ」|「腹が立っているのは本当。だから、もう少しここにいて｜腹が立っているのは本当だ。だから、もう少しここにいろ｜腹が立っているのは本当です。だから、もう少しここにいてください」')
}
},
chase:{
label:'突き放しておいて追いかける',w:function(t){return 0.5+(t.fc||0)*0.3+(t.jealous||0)*0.3;},
lead:L('{a}は、近づいてきた{b}を冷たくあしらった。{b}が肩をすくめて離れていくと、{a}の足は勝手にその後を追っていた。追いついてから、{a}は何を言うつもりだったのか考えた。|{a}は、放っておけと言わんばかりに{b}に背を向けた。けれど{b}が本当に離れていくと、{a}は落ち着かなくなった。気づけば、{b}の行き先をそれとなく確かめに行っていた。|{a}は、{b}が差し出した手をわざと払いのけた。{b}が困ったように笑って引き下がると、今度は{a}のほうから{b}の隣へ戻ってきた。何事もなかったような顔をしていた。'),
say:{
proud:L('「追いかけてきたわけじゃない。たまたま同じ方向なだけ｜追いかけてきたわけではない。たまたま同じ方向なだけだ｜追いかけてきたわけではありません。たまたま同じ方向なだけです」|「さっきのは、あなたが悪い。……謝るなら、聞いてあげる｜さっきのは、あなたが悪い。……謝るなら、聞いてやる｜さっきのは、あなたが悪いんです。……謝るなら、聞いてあげます」'),
stern:L('「勝手にいなくなるな、とは言っていない。……ただ、行き先くらいは言って｜勝手にいなくなるな、とは言っていない。……ただ、行き先くらいは言え｜勝手にいなくなるな、とは申していません。……ただ、行き先くらいはおっしゃってください」|「あなたを見張るのは、私の役目だから｜あなたを見張るのは、私の役目だからな｜あなたを見張るのは、私の役目ですから」'),
tsun:L('「つ、ついてきたんじゃない！　こっちに用があっただけ！｜つ、ついてきたのではない！　こっちに用があっただけだ！｜つ、ついてきたんじゃありません！　こちらに用があっただけです！」|「ほんとに行っちゃうなんて、思わなかった……な、何でもない！｜本当に行ってしまうとは、思わなかった……な、何でもない！｜本当に行ってしまうなんて、思いませんでした……な、何でもありません！」'),
gentle:L('「……さっきは、ごめん。でも、謝ったわけじゃないから｜……さっきは、すまない。だが、謝ったわけではないからな｜……さっきは、ごめんなさい。でも、謝ったわけではありませんから」|「一人にしてって言ったのは、私だけど。……本当に一人にしなくても、いいのに｜一人にしろと言ったのは、私だが。……本当に一人にしなくても、いいだろう｜一人にしてと言ったのは、私ですけど。……本当に一人にしなくても、いいじゃないですか」'),
devoted:L('「離れろって言ったのに、どうして本当に離れるの｜離れろと言ったのに、なぜ本当に離れる｜離れてと言ったのに、どうして本当に離れるんですか」|「あなたなんか知らない。……知らないから、そばで見てる｜あなたなど知らない。……知らないから、そばで見ている｜あなたなんて知りません。……知らないから、そばで見ているんです」'),
cool:L('「距離を置いたのは私。詰めるのも、私が決める｜距離を置いたのは私だ。詰めるのも、私が決める｜距離を置いたのは私です。詰めるのも、私が決めます」|「あなたが視界から消えると、落ち着かない。それだけ｜あなたが視界から消えると、落ち着かない。それだけだ｜あなたが視界から消えると、落ち着きません。それだけです」'),
free:L('「なーんだ、ほんとに帰るんだ。つまんないの｜何だ、本当に帰るのか。つまらない｜なんだ、本当に帰るんですね。つまらないです」|「怒らせたのは私だけど、置いてくのはなし｜怒らせたのは私だが、置いていくのはなしだ｜怒らせたのは私ですけど、置いていくのはなしです」'),
shy:L('「わ、私、ついてきたわけじゃ……な、ない……｜わ、私は、ついてきたわけでは……な、ない……｜わ、私、ついてきたわけでは……あ、ありません……」|「さ、さっきの……ほ、本気じゃ、ない、から……｜さ、さっきのは……ほ、本気では、ない……｜さ、さっきの……ほ、本気では、ありません、から……」'),
polite:L('「失礼。さっきの続きを、言いそびれていたから｜失礼。さっきの続きを、言いそびれていた｜失礼いたします。先ほどの続きを、申し上げそびれておりましたので」|「突き放したのは私だね。……それでも、黙って行かれるのは困る｜突き放したのは私だな。……それでも、黙って行かれるのは困る｜突き放したのは私ですね。……それでも、黙って行かれるのは困ります」')
}
}
},
kin:{
kcare:{
label:'口うるさく世話を焼く',w:function(t){return 0.6+(t.np||0)*0.5+(t.ac||0)*0.2;},
lead:L('{a}は、散らかった{b}の持ち物を、文句を言いながら片づけ始めた。{b}が手伝おうとすると、邪魔だとばかりに手を払った。片づけ終わった棚は、{b}が使いやすい順に並んでいた。|{a}は、{b}の顔色が悪いのに気づくと、頼まれてもいないのに温かい飲み物を淹れてきた。{b}の前に乱暴に置いて、すぐにそっぽを向いた。湯気の向こうで、{a}はちらちらと{b}の様子をうかがっていた。|{a}は、{b}の上着の襟が曲がっているのを見つけて、舌打ちしながら直した。小言は止まらなかった。それでも、手つきは昔から変わらず丁寧だった。'),
say:{
proud:L('「勘違いしないで。身内がだらしないと、私が恥をかくだけ｜勘違いするな。身内がだらしないと、私が恥をかくだけだ｜勘違いしないでください。身内がだらしないと、私が恥をかくだけです」|「礼なんかいらない。昔から、あなたは手がかかるんだから｜礼などいらない。昔から、あなたは手がかかる｜お礼なんていりません。昔から、あなたは手がかかるんですから」'),
stern:L('「家族だから言う。そのだらしなさは直して｜家族だから言う。そのだらしなさは直せ｜家族だから申し上げます。そのだらしなさは直してください」|「放っておけば同じことを繰り返す。だから、私がやる｜＝｜放っておけば同じことを繰り返します。だから、私がやります」'),
tsun:L('「か、勘違いしないで！　見てて苛々するから、やってるだけ！｜か、勘違いするな！　見ていて苛々するから、やっているだけだ！｜か、勘違いしないでください！　見ていて苛々するから、やっているだけです！」|「家族だから仕方なく、だからね！　……ちゃんと飲んで｜家族だから仕方なく、だ！　……ちゃんと飲め｜家族だから仕方なく、ですからね！　……ちゃんと飲んでください」'),
gentle:L('「……昔から、あなたは放っておくとこれだから。仕方ないね｜……昔から、あなたは放っておくとこれだ。仕方ない｜……昔から、あなたは放っておくとこれですから。仕方ありませんね」|「文句は言うよ。言いながら、やるけど｜文句は言うぞ。言いながら、やるがな｜文句は言いますよ。言いながら、やりますけど」'),
devoted:L('「あなたの世話なんか、焼きたくて焼いてるわけじゃない｜あなたの世話など、焼きたくて焼いているわけではない｜あなたのお世話なんて、焼きたくて焼いているわけではありません」|「いつまでも手のかかる人。……ほら、じっとして｜いつまでも手のかかるやつだ。……ほら、じっとしていろ｜いつまでも手のかかる方ですね。……ほら、じっとしていてください」'),
cool:L('「あなたが倒れたら、家の段取りが狂う。合理的な判断｜あなたが倒れたら、家の段取りが狂う。合理的な判断だ｜あなたが倒れたら、家の段取りが狂います。合理的な判断です」|「何年あなたを見てきたと思ってるの。不調くらい分かる｜何年あなたを見てきたと思っている。不調くらい分かる｜何年あなたを見てきたと思っているんですか。不調くらい分かります」'),
free:L('「はいはい、どうせまた私がやるんでしょ。分かってたけど｜はいはい、どうせまた私がやるんだろう。分かっていたがな｜はいはい、どうせまた私がやるんでしょう。分かっていましたけど」|「感謝してよね。……嘘、別にいらない｜感謝しろ。……冗談だ、別にいらない｜感謝してくださいね。……嘘です、別にいりません」'),
shy:L('「べ、別に、心配したわけじゃ……か、家族、だから……｜べ、別に、心配したわけでは……か、家族、だからな……｜べ、別に、心配したわけでは……か、家族、ですから……」|「こ、これ……の、飲んで。い、いらないなら、いい、けど……｜こ、これを……の、飲め。い、いらないなら、いい、が……｜こ、これ……の、飲んでください。い、いらないなら、いい、ですけど……」'),
polite:L('「勘違いしないでね。身内の不始末は、見過ごせないだけ｜勘違いするな。身内の不始末は、見過ごせないだけだ｜勘違いなさらないでくださいね。身内の不始末は、見過ごせないだけです」|「お礼は結構。小言のほうを、ちゃんと聞いてほしいな｜礼は結構だ。小言のほうを、ちゃんと聞け｜お礼は結構です。小言のほうを、ちゃんと聞いてくださいね」')
}
},
snap:{
label:'虫の居所が悪くて八つ当たりする',w:function(t){return 0.5+(t.aggr||0)*0.5+(t.impulse||0)*0.2;},
lead:L('{a}は、{b}が話しかけてきたとたん、ろくに聞きもせずに言い返した。苛立ちの原因は、{b}とは関係のないことだった。言ってしまってから、{a}は気まずそうに目を逸らした。|{a}は、{b}の置いた物の位置が気に入らないと、乱暴に置き直した。{b}が理由を尋ねても、{a}はむっつりと黙っていた。ただ、{b}のそばからは離れようとしなかった。|{a}は朝から機嫌が悪かった。その矛先が向くのは、決まって{b}だった。遠慮のいらない相手だと、{a}自身がいちばんよく知っていた。'),
say:{
proud:L('「うるさい。今はあなたの顔を見たくない｜＝｜うるさいです。今はあなたの顔を見たくありません」|「何？　文句があるなら、はっきり言えば｜何だ。文句があるなら、はっきり言え｜何ですか。文句があるなら、はっきりおっしゃってください」'),
stern:L('「話しかけるのは後にして。今は機嫌が悪い｜話しかけるのは後にしろ。今は機嫌が悪い｜話しかけるのは後にしてください。今は機嫌が悪いんです」|「あなたに当たっているわけではない。……たぶん｜＝｜あなたに当たっているわけではありません。……たぶん」'),
tsun:L('「な、何よ！　あなたのせいじゃないけど、あなたが悪い！｜な、何だ！　あなたのせいではないが、あなたが悪い！｜な、何ですか！　あなたのせいではありませんけど、あなたが悪いんです！」|「こっち見ないで！　……見ないでってば｜こっちを見るな！　……見るなと言っている｜こちらを見ないでください！　……見ないでと言っているでしょう」'),
gentle:L('「……ごめん、今は放っておいて。あなたのせいじゃないから｜……すまない、今は放っておいてくれ。あなたのせいではない｜……ごめんなさい、今は放っておいてください。あなたのせいではありませんから」|「八つ当たりなのは、分かってる。分かってるけど｜八つ当たりなのは、分かっている。分かってはいるが｜八つ当たりなのは、分かっています。分かってはいるんですけど」'),
devoted:L('「あなたにしか、こんな顔できないんだから。我慢して｜あなたにしか、こんな顔はできない。我慢しろ｜あなたにしか、こんな顔はできないんですから。我慢してください」|「怒ってない。……怒ってるけど、あなたにじゃない｜怒っていない。……怒っているが、あなたにではない｜怒っていません。……怒っていますけど、あなたにではありません」'),
cool:L('「今の私は非効率。近づかないほうが、あなたのため｜今の私は非効率だ。近づかないほうが、あなたのためだ｜今の私は非効率です。近づかないほうが、あなたのためです」|「原因はあなたじゃない。でも、あなたしか言える相手がいない｜原因はあなたではない。だが、あなたしか言える相手がいない｜原因はあなたではありません。でも、あなたしか言える相手がいないんです」'),
free:L('「あー、もう、全部むかつく。あなたも含めて｜ああ、もう、全部むかつく。あなたも含めてな｜あー、もう、全部むかつきます。あなたも含めて、です」|「機嫌？　悪いよ。見れば分かるでしょ｜機嫌か。悪い。見れば分かるだろう｜機嫌ですか。悪いです。見れば分かるでしょう」'),
shy:L('「い、今は……は、話しかけないで……っ｜い、今は……は、話しかけるな……っ｜い、今は……は、話しかけないでください……っ」|「ご、ごめ……で、でも、あ、あなたが、そこにいるから……｜す、すま……だ、だが、あ、あなたが、そこにいるからだ……｜ご、ごめんなさ……で、でも、あ、あなたが、そこにいるからです……」'),
polite:L('「悪いけど、今は一人にしてくれる？｜悪いが、今は一人にしてくれ｜申し訳ありませんが、今は一人にしていただけますか」|「あなたに当たるのは筋違いだね。分かっているよ｜あなたに当たるのは筋違いだな。分かっている｜あなたに当たるのは筋違いですね。分かっています」')
}
}
},
peer:{
vie:{
label:'張り合いながら目で追う',w:function(t){return 0.6+(t.cp||0)*0.3+(t.aggr||0)*0.3;},
lead:L('{a}は、{b}が手をつけた仕事に、わざと同じように取りかかった。{b}がちらりと見ると、{a}は手を速めた。勝ち負けなど誰も決めていないのに、{a}の目は{b}の手元ばかり追っていた。|{a}は、{b}が褒められるのを聞いて、聞こえよがしに鼻を鳴らした。そのくせ、{b}が何をどうやったのか、あとでこっそり確かめていた。張り合う相手から、目を離せなかった。|{a}は、{b}が何か言うたびに、自分のほうが上だと言い返した。{b}が笑って流しても、{a}は引き下がらなかった。気づけば、{a}の一日は{b}を基準に回っていた。'),
say:{
proud:L('「その程度で満足してるの？　私なら、もっとうまくやる｜その程度で満足しているのか。私なら、もっとうまくやる｜その程度で満足しているんですか。私なら、もっとうまくやります」|「あなたにだけは、負けたくない｜＝｜あなたにだけは、負けたくありません」'),
stern:L('「手順が甘い。私の隣で、よく見ていて｜手順が甘い。私の隣で、よく見ていろ｜手順が甘いです。私の隣で、よく見ていてください」|「あなたが基準。だから、気を抜かないで｜あなたが基準だ。だから、気を抜くな｜あなたが基準です。だから、気を抜かないでください」'),
tsun:L('「べ、別にあなたを意識してるわけじゃない！　たまたま同じことしてるだけ！｜べ、別にあなたを意識しているわけではない！　たまたま同じことをしているだけだ！｜べ、別にあなたを意識しているわけではありません！　たまたま同じことをしているだけです！」|「次は負けないから。……見てて｜次は負けない。……見ていろ｜次は負けませんから。……見ていてください」'),
gentle:L('「……あなたって、何でもそつなくこなすね。腹が立つくらい｜……あなたは、何でもそつなくこなすな。腹が立つくらいだ｜……あなたは、何でもそつなくこなしますね。腹が立つくらいです」|「あなたがやるなら、私もやる。それだけ｜あなたがやるなら、私もやる。それだけだ｜あなたがやるなら、私もやります。それだけです」'),
devoted:L('「あなたが走るなら、私も走る。置いていかれるのは嫌｜あなたが走るなら、私も走る。置いていかれるのは嫌だ｜あなたが走るなら、私も走ります。置いていかれるのは嫌です」|「あなたの背中を追うのは、癪だけど慣れた｜あなたの背中を追うのは、癪だが慣れた｜あなたの背中を追うのは、癪ですけど慣れました」'),
cool:L('「あなたの記録は把握している。次で上回る｜＝｜あなたの記録は把握しています。次で上回ります」|「比べる相手がいるのは効率的。あなたで、ちょうどいい｜比べる相手がいるのは効率的だ。あなたで、ちょうどいい｜比べる相手がいるのは効率的です。あなたで、ちょうどいいんです」'),
free:L('「勝負しよ、勝負。負けたほうが今日一日、言うこと聞くの｜勝負だ。負けたほうが今日一日、言うことを聞け｜勝負しましょう、勝負。負けたほうが今日一日、言うことを聞くんです」|「やるじゃん。……ちょっとだけね｜やるな。……少しだけだ｜やりますね。……少しだけですけど」'),
shy:L('「わ、私だって……で、できるもん……｜わ、私だって……で、できる……｜わ、私だって……で、できます……」|「ま、負けない……あ、あなたにだけは……｜ま、負けない……あ、あなたにだけは……｜ま、負けません……あ、あなたにだけは……」'),
polite:L('「お見事。……次は、私が勝たせてもらうけれど｜見事だ。……次は、私が勝たせてもらうが｜お見事です。……次は、私が勝たせていただきますけれど」|「あなたと競うのは、悪くない退屈しのぎだね｜あなたと競うのは、悪くない退屈しのぎだ｜あなたと競うのは、悪くない退屈しのぎですね」')
}
},
lose:{
label:'わざと負けてみせる',w:function(t){return 0.4+(t.np||0)*0.4+(t.ac||0)*0.2;},
lead:L('{a}と{b}の勝負は、最後の最後で{a}の手が止まった。{b}が勝ったと気づくまで、少し間があった。{a}は大げさに舌打ちして、悔しがってみせた。|{a}は、{b}が落ち込んでいるのを見て、いつもの張り合いをわざと手加減した。{b}の顔がほころぶと、{a}は面白くなさそうに腕を組んだ。負けたのが、なぜか少しも悔しくなかった。|{a}は、{b}との言い合いで、珍しく先に折れた。{b}が意外そうに目を丸くした。{a}は、勝ちを譲ったことを悟られまいと、わざとらしく顔をしかめた。'),
say:{
proud:L('「今日は調子が悪かっただけ。勘違いしないで｜今日は調子が悪かっただけだ。勘違いするな｜今日は調子が悪かっただけです。勘違いしないでください」|「勝ちは貸しにしておく。次は返してもらうから｜勝ちは貸しにしておく。次は返してもらうぞ｜勝ちは貸しにしておきます。次は返していただきますから」'),
stern:L('「今のは私の油断。二度目はない｜今のは私の油断だ。二度目はない｜今のは私の油断です。二度目はありません」|「勝ったのなら、胸を張って。うつむかれると、こっちが困る｜勝ったのなら、胸を張れ。うつむかれると、こちらが困る｜勝ったのなら、胸を張ってください。うつむかれると、こちらが困ります」'),
tsun:L('「て、手加減なんかしてない！　本気で負けたの！｜て、手加減などしていない！　本気で負けたんだ！｜て、手加減なんかしていません！　本気で負けたんです！」|「よ、喜びすぎ！　……べつに、いいけど｜よ、喜びすぎだ！　……べつに、いいが｜よ、喜びすぎです！　……べつに、いいですけど」'),
gentle:L('「……おめでとう。悔しいから、二度は言わない｜＝｜……おめでとうございます。悔しいので、二度は言いません」|「そんなに嬉しそうにされたら、怒れないね｜そんなに嬉しそうにされたら、怒れないな｜そんなに嬉しそうにされたら、怒れませんね」'),
devoted:L('「負けてあげたんじゃない。……そういうことにしておいて｜負けてやったのではない。……そういうことにしておけ｜負けてあげたのではありません。……そういうことにしておいてください」|「あなたが笑うなら、一回くらい負けてもいい。……一回だけ｜あなたが笑うなら、一回くらい負けてもいい。……一回だけだ｜あなたが笑うなら、一回くらい負けてもいいです。……一回だけ、です」'),
cool:L('「計算違い。……ということにしておく｜計算違いだ。……ということにしておく｜計算違いです。……ということにしておきます」|「勝率の調整。深い意味はない｜勝率の調整だ。深い意味はない｜勝率の調整です。深い意味はありません」'),
free:L('「あーあ、負けちゃった。今日だけ、特別ね｜ああ、負けた。今日だけ、特別だ｜あーあ、負けてしまいました。今日だけ、特別ですよ」|「その顔、見たかったんだよね。……なんでもない｜その顔が、見たかったんだ。……何でもない｜その顔、見たかったんですよね。……何でもありません」'),
shy:L('「ま、負けちゃった……で、でも、よ、よかった、ね……｜ま、負けた……だ、だが、よ、よかった、な……｜ま、負けてしまいました……で、でも、よ、よかった、ですね……」|「て、手加減、なんて……し、してない……｜て、手加減など……し、していない……｜て、手加減、なんて……し、していません……」'),
polite:L('「参ったね。今日はあなたの勝ちだ｜参ったな。今日はあなたの勝ちだ｜参りました。今日はあなたの勝ちです」|「次も同じように譲るとは、思わないでね｜次も同じように譲るとは、思うな｜次も同じように譲るとは、思わないでくださいね」')
}
}
}
};
FX.BACK_LEAD={
love:L('{b}も負けじと言い返した。そのくせ、{a}の手を振りほどこうとはしなかった。言い合いの終わりは、いつもどちらかが黙って隣に座ることだった。|{b}は呆れたように息をついて、{a}の額を指で弾いた。言葉は辛辣だったが、目は笑っていた。二人の喧嘩は、周りから見ればじゃれ合いにしか見えなかった。|{b}は、{a}と同じだけの文句を返した。言い返されるたびに、{a}は少しだけ安心した顔をした。どちらも、相手が本気で離れていかないことを知っていた。'),
kin:L('{b}も負けずに言い返した。物心ついた頃から、二人の口喧嘩は変わらなかった。言い合いながら、{b}は{a}の分の椅子をさりげなく引いていた。|{b}は、うんざりした顔で{a}に同じだけの小言を返した。けれど、{a}が手を止めると、{b}も黙って手伝い始めた。家族の口喧嘩は、いつもそうやって終わった。|{b}は鼻で笑って、{a}の昔の失敗を持ち出した。{a}も負けずに、{b}の昔の失敗を並べ立てた。どちらの話も、互いが誰よりよく覚えていた。'),
peer:L('{b}も負けじと張り合ってきた。どちらが先に音を上げるか、二人とも意地になっていた。いつの間にか、その勝負を二人とも楽しんでいた。|{b}は、にやりと笑って挑発を返した。{a}が言い返すと、{b}はさらに言い返した。張り合える相手がいることを、二人とも口には出さなかった。|{b}は肩をすくめて、{a}の隣に並んだ。張り合うなら受けて立つ、と言わんばかりだった。二人の目は、同じものを見ていた。')
};
FX.BACK_SAY={
love:{
proud:L('「それはこっちの台詞。……で、まだいるでしょ？｜それはこっちの台詞だ。……で、まだいるんだろう｜それはこちらの台詞です。……で、まだいるんでしょう？」|「あなたこそ、素直になったら？　……私もならないけど｜あなたこそ、素直になったらどうだ。……私もならないが｜あなたこそ、素直になったらどうですか。……私もなりませんけど」'),
stern:L('「言いたいことは分かった。……私も、引く気はない｜＝｜おっしゃりたいことは分かりました。……私も、引く気はありません」|「あなたが折れるまで、ここを動かない｜＝｜あなたが折れるまで、ここを動きません」'),
tsun:L('「な、何なの！　あなたこそ、私がいないと駄目なくせに！｜な、何だ！　あなたこそ、私がいないと駄目なくせに！｜な、何ですか！　あなたこそ、私がいないと駄目なくせに！」|「べ、別に、追いかけてくるのを待ってたわけじゃないし！｜べ、別に、追いかけてくるのを待っていたわけではない！｜べ、別に、追いかけてくるのを待っていたわけではありません！」'),
gentle:L('「……ほんと、意地っ張りだね。私もだけど｜……本当に、意地っ張りだな。私もだが｜……本当に、意地っ張りですね。私もですけど」|「喧嘩しても、結局ここに戻ってくるんだから｜喧嘩しても、結局ここに戻ってくるんだからな｜喧嘩しても、結局ここに戻ってくるんですから」'),
devoted:L('「怒ってるあなたも、嫌いじゃない。……言わせないで｜怒っているあなたも、嫌いではない。……言わせるな｜怒っているあなたも、嫌いではありません。……言わせないでください」|「離れてあげない。あなたが嫌がっても｜離れてやらない。あなたが嫌がってもな｜離れてあげません。あなたが嫌がっても」'),
cool:L('「この口論、何度目か数えてる？　……私は数えてる｜この口論は何度目か、数えているか。……私は数えている｜この口論、何度目か数えていますか。……私は数えています」|「結論。あなたは面倒で、私は離れる気がない｜結論だ。あなたは面倒で、私は離れる気がない｜結論です。あなたは面倒で、私は離れる気がありません」'),
free:L('「あはは、また喧嘩。……飽きないね、私たち｜はは、また喧嘩か。……飽きないな、私たちは｜あはは、また喧嘩ですね。……飽きませんね、私たち」|「仲直りは、あなたからね。私は絶対しない｜仲直りは、あなたからだ。私は絶対にしない｜仲直りは、あなたからですよ。私は絶対にしません」'),
shy:L('「わ、私だって……お、怒ってる、んだから……っ｜わ、私だって……お、怒っている、んだ……っ｜わ、私だって……お、怒っている、んですから……っ」|「……は、離れて、なんて……い、言ってない……｜……は、離れろ、とは……い、言っていない……｜……は、離れて、なんて……い、言っていません……」'),
polite:L('「まったく、手のかかる人だね。……お互いさまだけど｜まったく、手のかかるやつだ。……お互いさまだが｜まったく、手のかかる方ですね。……お互いさまですけど」|「喧嘩の続きは、またあとで。今は隣にいて｜喧嘩の続きは、またあとだ。今は隣にいろ｜喧嘩の続きは、またあとで。今は隣にいてください」')
},
kin:{
proud:L('「あなたに言われたくない。昔から、だらしないのはそっち｜あなたに言われたくない。昔から、だらしないのはそっちだ｜あなたに言われたくありません。昔から、だらしないのはそちらです」|「はいはい、分かった。……あとで手伝ってあげる｜はいはい、分かった。……あとで手伝ってやる｜はいはい、分かりました。……あとで手伝ってあげます」'),
stern:L('「小言なら、私のほうが言いたいことは多い｜＝｜小言なら、私のほうが申し上げたいことは多いです」|「口の減らないところは、昔から変わらない｜＝｜口の減らないところは、昔から変わりませんね」'),
tsun:L('「う、うるさい！　あなただって、昔はもっとひどかったくせに！｜＝｜う、うるさいです！　あなただって、昔はもっとひどかったくせに！」|「べ、別に、言い返したかったわけじゃない！｜べ、別に、言い返したかったわけではない！｜べ、別に、言い返したかったわけではありません！」'),
gentle:L('「……お互いさまでしょ。昔から、ずっと｜……お互いさまだろう。昔から、ずっとな｜……お互いさまでしょう。昔から、ずっと」|「文句を言い合える相手がいるのは、悪くないね｜文句を言い合える相手がいるのは、悪くないな｜文句を言い合える相手がいるのは、悪くありませんね」'),
devoted:L('「あなたの小言なんか、聞き飽きた。……だから、まだ言って｜あなたの小言など、聞き飽きた。……だから、まだ言え｜あなたの小言なんて、聞き飽きました。……だから、まだ言ってください」|「身内だから、遠慮しないだけ｜身内だから、遠慮しないだけだ｜身内ですから、遠慮しないだけです」'),
cool:L('「同じ指摘、去年も聞いた。進歩がないのはお互い｜同じ指摘を、去年も聞いた。進歩がないのはお互いだ｜同じご指摘、去年も伺いました。進歩がないのはお互いです」|「家族の口論は、統計的に終わらない｜＝｜家族の口論は、統計的に終わりません」'),
free:L('「出た、いつもの小言。もう覚えちゃったよ｜出たな、いつもの小言が。もう覚えた｜出ました、いつもの小言。もう覚えてしまいましたよ」|「言い返すのも面倒。……でも言い返す｜言い返すのも面倒だ。……だが言い返す｜言い返すのも面倒です。……でも言い返します」'),
shy:L('「わ、私だって……い、言いたいこと、ある……｜わ、私だって……い、言いたいことは、ある……｜わ、私だって……い、言いたいこと、あります……」|「……む、昔から、そう、だよね……｜……む、昔から、そう、だな……｜……む、昔から、そう、ですよね……」'),
polite:L('「相変わらずだね。……そういうところは、嫌いじゃないよ｜相変わらずだな。……そういうところは、嫌いではない｜相変わらずですね。……そういうところは、嫌いではありませんよ」|「小言はお互いさま。今日はこのくらいにしておこう｜小言はお互いさまだ。今日はこのくらいにしておこう｜小言はお互いさまです。今日はこのくらいにしておきましょう」')
}
};
FX.NOFEEL={
love:L('{b}は、{a}の剣幕にきょとんとした。何をそんなに怒っているのか、まるで分からないようだった。{b}が穏やかに笑うと、{a}はますます不機嫌そうに口を尖らせた。|{b}は{a}の文句を、いつものことだと受け流した。{a}が本当は何を言いたいのか、{b}は気づいていなかった。{a}は、伝わらないもどかしさに唇を噛んだ。|{b}は困ったように眉を下げて、{a}の言い分を最後まで聞いた。言い返すことはしなかった。その素直さが、{a}にはかえって癪に障った。'),
kin:L('{b}は、また始まったとばかりに肩をすくめた。{a}の小言には、子どもの頃から慣れっこだった。適当に相槌を打ちながら、{b}は手元の作業を続けた。|{b}は{a}の剣幕に目を丸くして、それから小さく笑った。昔から変わらない、と言いたげな顔だった。{a}は、その顔がいちばん気に食わなかった。|{b}は、{a}がなぜ自分にばかり当たるのか、深く考えなかった。家族とはそういうものだと思っていた。{a}は、言葉にできない苛立ちを飲み込んだ。'),
peer:L('{b}は、{a}が張り合ってくるのを不思議そうに眺めた。勝ち負けにこだわる気は、{b}にはなかった。{a}だけが、空回りするように熱くなっていた。|{b}は、{a}の挑発を笑って受け流した。相手にされないことが、{a}にはいちばん堪えた。{a}は、次こそはと拳を握った。|{b}は、{a}の言葉にただ頷いて、自分の用事に戻っていった。{a}が何を求めていたのか、{b}は気づいていなかった。{a}は、{b}の背中をしばらく睨んでいた。')
};
FX.JEAL_T={
love:{
proud:L('「{b}とは、ずいぶん楽しそうだったね。私といるときより楽しそうに見えた｜{b}とは、ずいぶん楽しそうだったな。私といるときより楽しそうに見えた｜{b}とは、ずいぶん楽しそうでしたね。私といるときより楽しそうに見えました」|「誰と笑おうと勝手だけど。……私の前でやらないで｜誰と笑おうと勝手だが。……私の前でやるな｜誰と笑おうとご勝手ですけど。……私の前でやらないでください」'),
stern:L('「{b}との距離が近すぎる。自覚はある？｜{b}との距離が近すぎる。自覚はあるか｜{b}との距離が近すぎます。自覚はありますか」|「あなたの隣が誰の場所か、忘れたわけじゃないよね｜あなたの隣が誰の場所か、忘れたわけではないだろう｜あなたの隣が誰の場所か、お忘れではありませんよね」'),
tsun:L('「な、何よ、{b}とばっかり！　……べ、別に妬いてなんかない！｜な、何だ、{b}とばかり！　……べ、別に妬いてなどいない！｜な、何ですか、{b}とばかり！　……べ、別に妬いてなんかいません！」|「私のほうを見てってば、ばか｜私のほうを見ろ、ばか｜私のほうを見てください、ばか」'),
gentle:L('「……{b}と、楽しそうだったね。少しだけ、妬けた｜……{b}と、楽しそうだったな。少しだけ、妬けた｜……{b}と、楽しそうでしたね。少しだけ、妬けました」|「怒ってないよ。……怒ってないけど、今日はそばにいて｜怒っていない。……怒ってはいないが、今日はそばにいろ｜怒っていませんよ。……怒っていませんけど、今日はそばにいてください」'),
devoted:L('「{b}に笑いかけるのは、やめて。……私だけにして｜{b}に笑いかけるのは、やめろ。……私だけにしろ｜{b}に笑いかけるのは、やめてください。……私だけにしてください」|「あなたが誰を見てても、私はあなたしか見てない。腹が立つ｜あなたが誰を見ていても、私はあなたしか見ていない。腹が立つ｜あなたが誰を見ていても、私はあなたしか見ていません。腹が立ちます」'),
cool:L('「{b}と話しているときのあなた、判断が甘い。……見ていて分かる｜{b}と話しているときのあなたは、判断が甘い。……見ていて分かる｜{b}と話しているときのあなたは、判断が甘いです。……見ていて分かります」|「嫉妬は非合理。……分かっていても、止まらない｜嫉妬は非合理だ。……分かっていても、止まらない｜嫉妬は非合理です。……分かっていても、止まりません」'),
free:L('「ねえ、{b}とばっかり遊んでずるい。私も構って｜おい、{b}とばかり遊んでずるいぞ。私も構え｜ねえ、{b}とばかり遊んでずるいです。私も構ってください」|「ふーん、楽しそうでよかったね。……つまんない｜ふん、楽しそうでよかったな。……つまらない｜ふーん、楽しそうでよかったですね。……つまらないです」'),
shy:L('「……{b}と、な、仲良さそう、だった、ね……｜……{b}と、な、仲がよさそう、だった、な……｜……{b}と、な、仲がよさそう、でした、ね……」|「わ、私といるときより……た、楽しそう、だった……｜わ、私といるときより……た、楽しそう、だった……｜わ、私といるときより……た、楽しそう、でした……」'),
polite:L('「{b}と、ずいぶん打ち解けたんだね｜{b}と、ずいぶん打ち解けたんだな｜{b}と、ずいぶん打ち解けたんですね」|「どうぞ、お好きに。……あとで、ゆっくり話を聞かせてもらうけれど｜どうぞ、好きにしろ。……あとで、ゆっくり話を聞かせてもらうがな｜どうぞ、お好きに。……あとで、ゆっくりお話を聞かせていただきますけれど」')
},
kin:{
proud:L('「{b}とはずいぶん仲がいいんだね。家では見せない顔だった｜{b}とはずいぶん仲がいいんだな。家では見せない顔だった｜{b}とはずいぶん仲がよろしいんですね。家では見せない顔でした」|「{b}なんかと出かけて、夕飯までに帰ってこなかったら許さない｜{b}などと出かけて、夕飯までに帰ってこなかったら許さない｜{b}なんかと出かけて、夕飯までに帰ってこなかったら許しません」'),
stern:L('「{b}と付き合うのは構わない。ただ、家のことを忘れないで｜{b}と付き合うのは構わない。ただし、家のことを忘れるな｜{b}と付き合うのは構いません。ただ、家のことを忘れないでください」'),
tsun:L('「な、何なの、{b}ばっかり！　……べ、別に寂しくなんかないし！｜な、何だ、{b}ばかり！　……べ、別に寂しくなどない！｜な、何ですか、{b}ばかり！　……べ、別に寂しくなんかありません！」'),
gentle:L('「……{b}といると、楽しそうだね。家では見ない顔だ｜……{b}といると、楽しそうだな。家では見ない顔だ｜……{b}といると、楽しそうですね。家では見ない顔です」'),
devoted:L('「あなたのことを一番知ってるのは、私。{b}じゃない｜あなたのことを一番知っているのは、私だ。{b}ではない｜あなたのことを一番知っているのは、私です。{b}ではありません」'),
cool:L('「{b}に頼るのは非効率。家族の私に言えば早い｜{b}に頼るのは非効率だ。家族の私に言えば早い｜{b}に頼るのは非効率です。家族の私に言えば早いです」'),
free:L('「えー、{b}と遊ぶの？　たまには家族の相手もしてよ｜ほう、{b}と遊ぶのか。たまには家族の相手もしろ｜えー、{b}と遊ぶんですか。たまには家族の相手もしてくださいよ」'),
shy:L('「……{b}と、ば、ばっかり……ず、ずるい……｜……{b}と、ば、ばかり……ず、ずるい……｜……{b}と、ば、ばかり……ず、ずるいです……」'),
polite:L('「{b}と親しいのは結構。……家族を後回しにしない限りはね｜{b}と親しいのは結構だ。……家族を後回しにしない限りはな｜{b}と親しくなさるのは結構です。……家族を後回しになさらない限りは、ですけれど」')
},
peer:{
proud:L('「{b}なんかとつるんで、腕が落ちても知らないから｜{b}などとつるんで、腕が落ちても知らないぞ｜{b}なんかとつるんで、腕が落ちても知りませんから」'),
stern:L('「{b}と馴れ合っている暇があるなら、私と勝負して｜{b}と馴れ合っている暇があるなら、私と勝負しろ｜{b}と馴れ合っている暇があるなら、私と勝負してください」'),
tsun:L('「な、何よ、{b}と仲良くしちゃって！　私との勝負はどうなったの！｜な、何だ、{b}と仲良くして！　私との勝負はどうなった！｜な、何ですか、{b}と仲良くして！　私との勝負はどうなったんですか！」'),
gentle:L('「……{b}と組むんだ。私じゃないんだね｜……{b}と組むのか。私ではないんだな｜……{b}と組むんですね。私ではないんですね」'),
devoted:L('「あなたの隣で競っていいのは、私だけ｜あなたの隣で競っていいのは、私だけだ｜あなたの隣で競っていいのは、私だけです」'),
cool:L('「{b}では、あなたの相手には足りない。客観的に見て｜{b}では、あなたの相手には足りない。客観的に見てな｜{b}では、あなたのお相手には足りません。客観的に見て、です」'),
free:L('「えー、{b}と遊んでるの？　私と張り合うほうが面白いのに｜ほう、{b}と遊んでいるのか。私と張り合うほうが面白いだろうに｜えー、{b}と遊んでいるんですか。私と張り合うほうが面白いのに」'),
shy:L('「……{b}とは、た、楽しそう……｜……{b}とは、た、楽しそうだな……｜……{b}とは、た、楽しそうですね……」'),
polite:L('「{b}と親しくするのは結構。ただ、私との決着がまだだよ｜{b}と親しくするのは結構だ。ただし、私との決着がまだだ｜{b}と親しくなさるのは結構です。ただ、私との決着がまだですよ」')
}
};
FX.JEAL_TAIL={
love:{
both:L('{t}は、妬いているのかと言いかけて、{a}の顔を見てやめた。代わりに、{a}の袖を引いて歩き出した。|{t}は呆れたように笑って、{a}の額を指でつついた。それから{b}に軽く会釈して、{a}の隣へ戻ってきた。|{t}はわざと{b}との話を続けてみせた。{a}が本気で拗ねる寸前に、ようやく{a}のほうへ向き直った。'),
one:L('{t}は、{a}がなぜ不機嫌なのか分からないまま、困ったように笑った。|{t}は{a}の剣幕に目を瞬かせ、{b}と顔を見合わせた。|{t}は{a}の言葉を冗談だと受け取って、軽く笑い飛ばした。')
},
kin:{
both:L('{t}は鼻で笑って、{a}の頭を乱暴にかき回した。子どもの頃と同じやり方だった。|{t}は、やれやれと肩をすくめて、{b}に断ってから{a}のほうへ戻ってきた。|{t}は{a}に同じだけの文句を返した。言い合ううちに、{b}のことは二人とも忘れていた。'),
one:L('{t}は、{a}の不機嫌をいつもの癇癪だと受け流した。|{t}は{a}の剣幕に首を傾げ、{b}との話に戻った。|{t}は、家族の小言には慣れているとばかりに、軽く手を振った。')
},
peer:{
both:L('{t}はにやりと笑って、{a}の挑発に乗った。{b}との話は、そこで終わりになった。|{t}は、勝負なら受けて立つと言わんばかりに{a}を見返した。{b}は苦笑して、その場を譲った。|{t}は{a}の言葉に言い返し、気づけばいつもの張り合いが始まっていた。{b}の存在は、すっかり置き去りにされた。'),
one:L('{t}は、{a}がなぜ突っかかってくるのか分からず、首を傾げた。|{t}は{a}の言葉を軽く受け流し、{b}との話を続けた。|{t}は、{a}が何に張り合っているのかも知らずに、笑って手を振った。')
}
};
var RESCUE={
lead:{
hate:L('{b}が{w}と知ったとき、真っ先に駆けつけたのは{a}だった。普段は顔を合わせるたびに睨み合っている相手だった。周りが呆気にとられるなか、{a}は黙って{b}の前に立った。|{b}が{w}――それを見た{a}の足は、考えるより先に動いていた。嫌っているはずの相手のために、{a}は誰よりも早く手を伸ばした。{b}は、信じられないものを見るような目で{a}を見上げた。|{b}が{w}とき、{a}は舌打ちをひとつして、{b}のそばへ行った。周りの誰かが動くのを待つ気はなかった。{a}の手つきは乱暴だったが、迷いはなかった。'),
love:L('{b}が{w}と知ったとたん、{a}は喧嘩の最中だったことも忘れて駆け出した。誰よりも先に、{b}のそばに膝をついた。顔はまだ怒ったままだった。|{b}が{w}とき、{a}は迷わずその隣に立った。昨日まで口をきいていなかった相手だった。それでも、{b}を一人にしておく気は、{a}には少しもなかった。|{b}が{w}――{a}はそれを聞くなり、周りを押しのけて{b}のもとへ向かった。{b}の顔を見るなり、{a}は悪態をついた。悪態をつきながら、手だけは休まなかった。'),
kin:L('{b}が{w}と知るや、{a}はすぐに駆けつけた。家族のことになると、{a}の動きは誰より早かった。口から出るのは、相変わらず小言ばかりだった。|{b}が{w}とき、真っ先にそばにいたのは{a}だった。普段は文句ばかり言い合っている二人だった。{a}は、昔からそうしてきたように、{b}の前に立った。|{b}が{w}――{a}はため息をつきながらも、誰より先に{b}の世話を焼き始めた。手のかかる身内だと、何度もぼやいた。ぼやく声は、少し震えていた。'),
peer:L('{b}が{w}と知ったとき、{a}は張り合っていたことなど放り出して駆けつけた。周りの誰より早かった。{b}が目を丸くするのも構わず、{a}はその腕を引いた。|{b}が{w}とき、{a}は迷わず{b}の隣に立った。いつも競っている相手が弱っているのを、見ていられなかった。{a}は、それを誰にも悟られたくなかった。|{b}が{w}――{a}はそれを見るなり、黙って{b}のそばに行った。勝ち負けの相手がいないのはつまらない、と自分に言い聞かせた。手を貸す理由は、それで十分だった。')
},
say:{
proud:L('「勘違いしないで。あなたを助けたわけじゃない。目障りだっただけ｜勘違いするな。あなたを助けたわけではない。目障りだっただけだ｜勘違いしないでください。あなたを助けたわけではありません。目障りだっただけです」|「借りを作ったと思わないで。……早く立って｜借りを作ったと思うな。……早く立て｜借りを作ったと思わないでください。……早く立ってください」'),
stern:L('「動ける者が動いただけ。礼はいらない｜動ける者が動いただけだ。礼はいらない｜動ける者が動いただけです。お礼はいりません」|「黙って、じっとしていて。小言は元気になってから｜黙って、じっとしていろ。小言は元気になってからだ｜黙って、じっとしていてください。小言は元気になってからです」'),
tsun:L('「か、勘違いしないで！　たまたま近くにいただけなんだから！｜か、勘違いするな！　たまたま近くにいただけだ！｜か、勘違いしないでください！　たまたま近くにいただけなんですから！」|「べ、別に心配なんかしてない！　……ほら、つかまって｜べ、別に心配などしていない！　……ほら、つかまれ｜べ、別に心配なんかしていません！　……ほら、つかまってください」'),
gentle:L('「……勘違いしないで。放っておけなかっただけ｜……勘違いするな。放っておけなかっただけだ｜……勘違いしないでください。放っておけなかっただけです」|「大丈夫、私がいる。……今だけはね｜大丈夫だ、私がいる。……今だけはな｜大丈夫です、私がいます。……今だけは、ですけど」'),
devoted:L('「あなたを助けるのは、私。ほかの誰にも譲らない｜あなたを助けるのは、私だ。ほかの誰にも譲らない｜あなたを助けるのは、私です。ほかの誰にも譲りません」|「嫌いな人でも、見捨てたら寝覚めが悪いから｜嫌いなやつでも、見捨てたら寝覚めが悪いからな｜嫌いな方でも、見捨てたら寝覚めが悪いですから」'),
cool:L('「勘違いしないで。損得を計算した結果｜勘違いするな。損得を計算した結果だ｜勘違いしないでください。損得を計算した結果です」|「あなたがいないと、比べる相手がいなくなる。それだけ｜あなたがいないと、比べる相手がいなくなる。それだけだ｜あなたがいないと、比べる相手がいなくなります。それだけです」'),
free:L('「あーあ、世話が焼けるなあ。貸しひとつね｜ああ、世話が焼ける。貸しひとつだ｜あーあ、世話が焼けますね。貸しひとつですよ」|「勘違いしないでね、ただの気まぐれ｜勘違いするな、ただの気まぐれだ｜勘違いしないでくださいね、ただの気まぐれです」'),
shy:L('「か、勘違い、しないで……た、たまたま、だから……｜か、勘違い、するな……た、たまたま、だ……｜か、勘違い、しないでください……た、たまたま、ですから……」|「だ、大丈夫……？　……じゃ、じゃなくて、しっかりして……っ｜だ、大丈夫か……？　……い、いや、しっかりしろ……っ｜だ、大丈夫ですか……？　……い、いえ、しっかりしてください……っ」'),
polite:L('「勘違いしないでね。見過ごすのは、私の流儀に反するだけ｜勘違いするな。見過ごすのは、私の流儀に反するだけだ｜勘違いなさらないでくださいね。見過ごすのは、私の流儀に反するだけです」|「お礼は結構。借りは、いずれ返してもらうから｜礼は結構だ。借りは、いずれ返してもらう｜お礼は結構です。借りは、いずれ返していただきますから」')
},
tail:{
both:L('{b}は何か言い返そうとして、やめた。代わりに、差し出された手を黙って握り返した。|{b}は、{a}の悪態に悪態で返した。けれど、その声には少しも力がこもっていなかった。|{b}は、ありがとうの代わりに鼻を鳴らした。{a}も、それで十分だという顔をした。'),
one:L('{b}は、{a}がなぜ自分を助けたのか分からず、戸惑ったように{a}を見つめた。|{b}は小さく礼を言った。{a}は、聞こえなかったふりをした。|{b}は、{a}の背中を見ながら、助けられた理由を考えていた。答えは、どこにも見つからなかった。')
}
};
var REGRET={
lead:{
hate:L('{a}は、言い捨てて離れていく{b}の背中を、黙って見送った。言い過ぎたとは思わなかった。思わないようにしていた。|{a}は、一人になってから、自分の手のひらをじっと見つめた。さっき{b}に向けた言葉が、まだ喉の奥に引っかかっていた。嫌いな相手に何を言おうと、気にする理由などないはずだった。|{a}は、少し離れたところから{b}の横顔をうかがった。何か言わなければと思った。けれど、どんな言葉を探しても、出てくるのは憎まれ口ばかりだった。'),
love:L('{a}は、{b}が黙って背を向けたのを見て、追いかけようとした足を止めた。引き止める言葉は、いくらでもあった。その一つも、素直な形では出てこなかった。|{a}は、さっきの言い合いを頭の中で何度もやり直した。どのやり直しでも、{a}は結局同じことを言っていた。{b}の傷ついた顔だけが、少しずつ鮮明になっていった。|{a}は、{b}の背中に向かって口を開きかけ、閉じた。謝るのは癪だった。それでも、このまま{b}が遠ざかるのは、もっと嫌だった。'),
kin:L('{a}は、{b}のいるほうへ何度か足を向けかけては、そのたびに引き返した。言い過ぎたのは分かっていた。家族だからこそ、どう謝ればいいのか分からなかった。|{a}は、{b}が黙り込んだのを見て、ばつが悪そうに頭を掻いた。昔から、先に謝るのは{b}のほうだった。今日ばかりは、そうもいかない気がした。|{a}は、{b}の背中を見ながら、さっきの自分の言葉を思い返した。当たる相手を間違えたのは、分かっていた。分かっていて、{b}にしか当たれなかった。'),
peer:L('{a}は、{b}が言い返さずに去っていくのを見て、拍子抜けしたように立ち尽くした。張り合う相手がいなくなると、勝ちも負けもなかった。{a}は、振り上げた拳の下ろし方が分からなかった。|{a}は、少し言い過ぎたかもしれないと思った。{b}は、いつものように笑い返してはこなかった。その沈黙が、どんな言い返しよりも堪えた。|{a}は、{b}の背中を目で追いながら、次にかける言葉を探していた。勝負の話なら、いくらでもできた。それ以外の話の仕方を、{a}は知らなかった。')
},
say:{
proud:L('「……別に、言い過ぎてなんかない｜……別に、言い過ぎてなどいない｜……別に、言い過ぎてなんかいません」'),
stern:L('「……間違ったことは言っていない。……はず｜……間違ったことは言っていない。……はずだ｜……間違ったことは申していません。……はずです」'),
tsun:L('「な、何よ、あんな顔して……私が悪いみたいじゃない……｜な、何だ、あんな顔をして……私が悪いみたいではないか……｜な、何ですか、あんな顔をして……私が悪いみたいじゃないですか……」'),
gentle:L('「……どうして、あんな言い方しかできないんだろう｜……なぜ、あんな言い方しかできないんだろうな｜……どうして、あんな言い方しかできないんでしょう」'),
devoted:L('「……謝らない。謝らないけど、行かないで｜……謝らない。謝らないが、行くな｜……謝りません。謝りませんけど、行かないでください」'),
cool:L('「……今の発言は、最適ではなかった｜＝｜……今の発言は、最適ではありませんでした」'),
free:L('「……あー、やっちゃった。ま、いっか……よくないか｜……ああ、やってしまった。まあいい……よくないか｜……あー、やってしまいました。まあいいです……よくないですね」'),
shy:L('「……ご、ごめん、って……い、言えたら、いいのに……｜……す、すまない、と……い、言えたら、いいのだが……｜……ご、ごめんなさい、って……い、言えたら、いいんですけど……」'),
polite:L('「……少し、言葉が過ぎたかな｜……少し、言葉が過ぎたか｜……少し、言葉が過ぎましたね」')
}
};
var SELFHATE={
lead:{
hate:L('{a}は、{b}に手を貸したあと、一人になってから壁を拳で叩いた。なぜあんなことをしたのか、自分でも分からなかった。嫌っている相手に優しくした自分が、何より許せなかった。|{a}は、さっき{b}に向けた自分の声を思い出して、顔をしかめた。あれでは、まるで{b}を気にかけているようだった。{a}は、その考えを振り払うように頭を振った。|{a}は、{b}が礼を言ったときの顔を、頭から追い出せずにいた。礼を言われる筋合いなど、なかったはずだった。{a}は、甘くなった自分に苛立った。'),
love:L('{a}は、{b}の世話を焼いたあとで、どっと疲れたように座り込んだ。喧嘩中だったはずなのに、体が勝手に動いていた。結局いつもこうだ、と{a}は自分に呆れた。|{a}は、さっき{b}にかけた優しい言葉を、取り消したくてたまらなかった。意地を張ると決めていたのに、あっさり崩れてしまった。{a}は、そんな自分がいちばん腹立たしかった。|{a}は、{b}の前ではつい素直になってしまう自分が嫌だった。今日もまた、言うつもりのなかったことを言ってしまった。{a}は、熱くなった頬を手の甲で冷やした。'),
kin:L('{a}は、{b}の世話を焼いたあとで、深いため息をついた。文句を言うつもりが、気づけば手を貸していた。家族の前だと、どうしてこうも甘くなるのか。|{a}は、{b}に優しくしてしまった自分に、一人で舌打ちした。いつも小言を言っている手前、示しがつかなかった。{a}は、さっきのことは忘れようと決めた。|{a}は、{b}が素直に礼を言ったのを思い出して、顔をしかめた。礼を言われるのは、どうにも居心地が悪かった。小言を言っているほうが、よほど気が楽だった。'),
peer:L('{a}は、{b}に手を貸したことを、早くも後悔していた。張り合う相手に塩を送るなど、らしくなかった。{a}は、自分の甘さに歯噛みした。|{a}は、{b}がほっとした顔をしたのを思い出して、落ち着かなくなった。あんな顔を見るために手を貸したわけではなかった。{a}は、そう自分に言い聞かせた。|{a}は、一人になってから、さっきの自分の行いを振り返った。競う相手に優しくしてどうする、と呟いた。それでも、手を貸したことを取り消したいとは思えなかった。')
},
say:{
proud:L('「……何をやってるんだか。あんな人に優しくするなんて｜……何をやっているんだ。あんなやつに優しくするとは｜……何をやっているんでしょう。あんな人に優しくするなんて、ばかみたいです」'),
stern:L('「……甘い。自分で自分が許せない｜＝｜……甘いです。自分で自分が許せません」'),
tsun:L('「な、何であんなことしたの、私……ばかみたい……｜な、なぜあんなことをした、私は……ばかみたいだ……｜な、何であんなことをしたんでしょう、私……ばかみたいです……」'),
gentle:L('「……どうして、放っておけなかったんだろう｜……なぜ、放っておけなかったんだろうな｜……どうして、放っておけなかったんでしょう」'),
devoted:L('「……嫌いなのに。嫌いなはずなのに｜……嫌いなのに。嫌いなはずなのにな｜……嫌いなのに。嫌いなはずなんですけど」'),
cool:L('「……非合理な行動だった。再発を防がないと｜……非合理な行動だった。再発を防がねばならない｜……非合理な行動でした。再発を防がないといけません」'),
free:L('「……あー、らしくない。忘れよ、忘れよ｜……ああ、らしくない。忘れよう｜……あー、らしくないです。忘れましょう」'),
shy:L('「……な、なんで、あんな……は、恥ずかしい……｜……な、なぜ、あんな……は、恥ずかしい……｜……な、なんで、あんな……は、恥ずかしいです……」'),
polite:L('「……我ながら、甘いことをしたものだね｜……我ながら、甘いことをしたものだ｜……我ながら、甘いことをしたものですね」')
}
};
var MIXED={
lead:{
hate:L('{b}は、{a}の手を借りたことに気づくと、ぱっと顔を明るくした。屈託のない顔で礼を言われた。{a}は、胸の奥で嬉しさと苛立ちが同時に暴れるのを感じた。|{b}は、{a}が用意したものを見て、目を輝かせた。その素直な喜び方が、{a}には眩しかった。嬉しいのか腹立たしいのか、{a}には自分でも分からなかった。|{b}が、{a}のおかげだと周りに話しているのが聞こえた。{a}は思わず足を止めた。口元が緩みかけるのを、{a}は必死に噛み殺した。'),
love:L('{b}は、{a}がしてくれたことに気づくと、嬉しそうに{a}の袖を引いた。喧嘩の最中だったことなど、すっかり忘れたような顔だった。{a}は、素直に喜べない自分がもどかしかった。|{b}は、{a}の気遣いに顔をほころばせた。その笑顔が見たかったはずなのに、{a}は目を逸らした。嬉しいと言ってしまえば、負けのような気がした。|{b}が、{a}に向かって心底嬉しそうに笑った。{a}の胸は高鳴った。同じくらい、そんな自分に腹が立った。'),
kin:L('{b}は、{a}が手を回してくれたことに気づくと、昔と同じ顔で笑った。{a}は、その顔に弱かった。弱いのが、悔しかった。|{b}は、{a}の用意したものを見て、嬉しそうに礼を言った。{a}は返事の代わりに鼻を鳴らした。照れくささと腹立たしさが、半分ずつだった。|{b}が{a}のおかげだと素直に喜ぶのを見て、{a}は落ち着かなくなった。いつもは文句しか言わない相手に、礼を言われるのは慣れなかった。{a}は、わざと不機嫌な顔を作った。'),
peer:L('{b}は、{a}が手を貸してくれたと知って、意外そうに、それから嬉しそうに笑った。{a}は、その顔を見て拍子抜けした。張り合う相手に喜ばれるのは、妙に居心地が悪かった。|{b}は、{a}のおかげで上手くいったと、屈託なく礼を言った。{a}は、勝ったような負けたような気分になった。嬉しさと悔しさが、同じだけ胸に残った。|{b}が喜ぶ顔を見て、{a}は思わず口元を緩めかけた。慌てて、いつもの張り合う顔に戻した。{b}には、たぶん見られていた。')
},
say:{
proud:L('「……そんなに喜ばなくていい。調子が狂う｜＝｜……そんなに喜ばなくていいです。調子が狂います」'),
stern:L('「礼を言われるようなことはしていない。……顔を上げて｜礼を言われるようなことはしていない。……顔を上げろ｜お礼を言われるようなことはしていません。……顔を上げてください」'),
tsun:L('「な、何よ、その顔！　べ、別に嬉しくなんかないんだから！｜な、何だ、その顔は！　べ、別に嬉しくなどない！｜な、何ですか、その顔！　べ、別に嬉しくなんかありません！」'),
gentle:L('「……そんなふうに笑われると、困るよ｜……そんなふうに笑われると、困る｜……そんなふうに笑われると、困ります」'),
devoted:L('「喜んでくれるのは、嬉しい。……嬉しいのが、腹が立つ｜＝｜喜んでくださるのは、嬉しいです。……嬉しいのが、腹が立ちます」'),
cool:L('「その反応は想定外。……喜ばれる理由が、分からない｜その反応は想定外だ。……喜ばれる理由が、分からない｜その反応は想定外です。……喜ばれる理由が、分かりません」'),
free:L('「えー、そんなに？　……ふーん、まあ、悪い気はしないけど｜そんなにか。……ふん、まあ、悪い気はしないが｜えー、そんなにですか。……ふーん、まあ、悪い気はしませんけど」'),
shy:L('「そ、そんな顔、されたら……ど、どうしたらいいか……｜そ、そんな顔を、されたら……ど、どうしたらいいのか……｜そ、そんな顔、されたら……ど、どうしたらいいか、分かりません……」'),
polite:L('「喜んでもらえたなら何より。……少し、複雑だけれどね｜喜んでもらえたなら何よりだ。……少し、複雑だがな｜喜んでいただけたなら何よりです。……少し、複雑ですけれど」')
}
};
var MAKEUP={
lead:{
hate:L('{a}は、{b}の前に、いつかの持ち物を黙って差し出した。返しそびれていた、と言い訳のように付け加えた。それが仲直りのつもりだと、{b}にはすぐに分かった。|{a}は、用もないのに{b}のところへやって来た。聞きたいことがある、と言いながら、何も聞かなかった。{b}は呆れながらも、隣に座る場所を空けた。|{a}は、{b}が困っている作業に、横から黙って手を出した。礼も謝罪も、どちらも口にしなかった。それでも、さっきまでの険しい空気は、いつの間にか消えていた。'),
love:L('{a}は、{b}の好きなものを手に、何食わぬ顔で戻ってきた。余ったから、とだけ言って押しつけた。{b}が笑うと、{a}はようやく肩の力を抜いた。|{a}は、{b}の隣に黙って腰を下ろした。謝る言葉は、最後まで出てこなかった。代わりに、肩がほんの少しだけ{b}のほうへ傾いた。|{a}は、{b}に用事を頼むふりをして話しかけた。用事は、すぐに済んだ。それでも二人は、しばらくその場を離れなかった。'),
kin:L('{a}は、{b}の分の食事を、いつもより少し多めに取り分けた。何も言わずに、{b}の前に置いた。それが、{a}なりの謝り方だった。|{a}は、{b}が探していた物を見つけて、放るように渡した。前から知っていた、とぶっきらぼうに言った。二人の喧嘩は、それで終わりになった。|{a}は、何事もなかったように{b}に話しかけた。昔から、喧嘩のあとはいつもそうだった。{b}も、何事もなかったように答えた。'),
peer:L('{a}は、{b}のところへやって来て、次の勝負を持ちかけた。さっきのことには、一言も触れなかった。{b}が受けて立つと、{a}は少しだけほっとした顔をした。|{a}は、{b}に借りていた道具を返しに来た。ついでのように、さっきは言い過ぎた、と早口で言った。聞き返される前に、{a}はさっさと背を向けた。|{a}は、{b}の手が空くのを待って、さりげなく隣に並んだ。張り合う理由を探しているようでもあった。{b}が笑いかけると、{a}もつられて口元を緩めた。')
},
say:{
proud:L('「これ、返しに来ただけ。……ついでに、さっきのことは水に流してあげる｜これを返しに来ただけだ。……ついでに、さっきのことは水に流してやる｜これを返しに来ただけです。……ついでに、さっきのことは水に流してあげます」|「謝ったりしないから。……でも、もう怒ってない｜謝ったりはしない。……だが、もう怒っていない｜謝ったりしませんから。……でも、もう怒っていません」'),
stern:L('「さっきの件は、もう終わりにする。異論はある？｜さっきの件は、もう終わりにする。異論はあるか｜先ほどの件は、もう終わりにします。異論はありますか」|「用があって来た。……用は、今思い出す｜＝｜用があって参りました。……用は、今思い出します」'),
tsun:L('「べ、別に仲直りしに来たわけじゃないから！　余ったから持ってきただけ！｜べ、別に仲直りしに来たわけではない！　余ったから持ってきただけだ！｜べ、別に仲直りしに来たわけではありません！　余ったから持ってきただけです！」|「……さっきの、ちょっとだけ言い過ぎた。ちょっとだけね！｜……さっきのは、少しだけ言い過ぎた。少しだけだぞ！｜……さっきの、少しだけ言い過ぎました。少しだけですよ！」'),
gentle:L('「……これ、あなたの分。食べるでしょ｜……これは、あなたの分だ。食べるだろう｜……これ、あなたの分です。召し上がるでしょう」|「さっきのこと、まだ怒ってる？　……私は、もういいよ｜さっきのことを、まだ怒っているか。……私は、もういい｜さっきのこと、まだ怒っていますか。……私は、もういいですよ」'),
devoted:L('「あなたがいないと、張り合いがないの。……だから、戻ってきただけ｜あなたがいないと、張り合いがない。……だから、戻ってきただけだ｜あなたがいないと、張り合いがないんです。……だから、戻ってきただけです」|「謝らない。その代わり、隣にいてあげる｜謝らない。その代わり、隣にいてやる｜謝りません。その代わり、隣にいてあげます」'),
cool:L('「冷戦を続けるのは非効率。今日で終わりにしよう｜冷戦を続けるのは非効率だ。今日で終わりにしよう｜冷戦を続けるのは非効率です。今日で終わりにしましょう」|「この件の貸し借りは、帳消し。……異論は受け付けない｜この件の貸し借りは、帳消しだ。……異論は受け付けない｜この件の貸し借りは、帳消しです。……異論は受け付けません」'),
free:L('「ねえ、まだ怒ってる？　私はもう飽きちゃった｜まだ怒っているか。私はもう飽きた｜あの、まだ怒っていますか。私はもう飽きてしまいました」|「はい、これ。仲直りの印……とかじゃないからね｜ほら、これだ。仲直りの印……などではないぞ｜はい、これです。仲直りの印……とかではありませんからね」'),
shy:L('「あ、あの……こ、これ……か、返しに、来た、だけ……｜あ、あの……こ、これを……か、返しに、来た、だけだ……｜あ、あの……こ、これ……か、返しに、来た、だけです……」|「さ、さっきは……そ、その……な、何でも、ない……｜＝｜さ、さっきは……そ、その……な、何でも、ありません……」'),
polite:L('「さっきは失礼。……お詫びではないけれど、これを｜さっきは失礼した。……詫びではないが、これを｜先ほどは失礼いたしました。……お詫びではありませんけれど、こちらを」|「この話は、ここまでにしよう。お互いのために｜この話は、ここまでにしよう。互いのためにな｜このお話は、ここまでにいたしましょう。お互いのために」')
},
tail:{
both:L('{b}は鼻を鳴らして受け取った。けれど、その口元はわずかに緩んでいた。|{b}は呆れたように笑って、{a}の言い訳に付き合ってやった。|{b}は、同じくらい不器用な言い方で、{a}の言い訳を受け入れた。'),
one:L('{b}は、{a}が何をしに来たのか分からないまま、とりあえず礼を言った。|{b}は首を傾げながらも、{a}の言い分を受け入れた。|{b}は、{a}がなぜか機嫌を直したらしいことだけは察した。')
}
};
FX.EV={rescue:RESCUE,regret:REGRET,selfhate:SELFHATE,mixed:MIXED,makeup:MAKEUP};
var EV_JA={rescue:'相手の危機に真っ先に動いた',regret:'突き放したあとの戸惑い',selfhate:'優しくしたあとの自己嫌悪',mixed:'相手が喜ぶのを見て複雑',makeup:'素直になれない仲直り'};
function weakE(ctx,c){
if(!c|| !here(c))return'';
var f=c.flags||{};
if(typeof c.hp==='number'&&c.hp<=60)return'けがを負って、まともに動けなくなった';
if(f.down&&f.down<900)return'倒れて動けなくなった';
if(f.ostra)return'皆から爪弾きにされた';
if(f.exposed)return'隠していたことを暴かれた';
if((c.stress||0)>=82)return'追い詰められて取り乱した';
return'';
}
function weakOf(x,c){
var CF=HK.ColdFear;
if(CF&&CF.weak){try{return CF.weak(x,c)||'';}catch(e){return'';}}
return isCtx(x)?weakE(x,c):'';
}
function canMove(c){return here(c)&& !(c.flags&&(c.flags.down||c.flags.cagePair!=null))&&(!HK.State|| !HK.State.canAct||HK.State.canAct(c));}
function nowOf(x){return isCtx(x)?x.stepIndex:(x._lhTick||0);}
function follow(x,a,b,k){
var mk=LH.lastMark(x,a,b),d=mk?nowOf(x)-mk.at: -1;
if(!mk)return null;
if(k==='regret')return mk.hard&& !mk.rg&&d>=1&&d<=3?mk:null;
if(k==='makeup')return mk.hard&& !mk.mu&&d>=2&&d<=8?mk:null;
if(k==='selfhate'||k==='mixed')return mk.soft&& !mk.af&&d>=1&&d<=3?mk:null;
return null;
}
function helpedNow(ctx,a,b){
var log=ctx.log||[];
for(var i=log.length-1,n=0;i>=0&&n<16;i--,n++){
var e=log[i];
if(!e||e.step<ctx.stepIndex-1)break;
if(e.kind!=='event'||e.cat!=='help')continue;
var ac=e.actors||[];
if(ac[0]===a.i&&ac.indexOf(b.i)>0)return true;
}
return false;
}
function softNow(ctx,a,b){
if(follow(ctx,a,b,'selfhate'))return true;
var pf=ctx.pair(a,b),k='h'+a.i;
if(pf.lhHelpAt&&pf.lhHelpAt[k]===ctx.stepIndex)return false;
return helpedNow(ctx,a,b);
}
function useSoft(x,a,b){
var mk=follow(x,a,b,'selfhate');
if(mk){mk.af=true;return;}
if(isCtx(x)){var pf=x.pair(a,b);(pf.lhHelpAt=pf.lhHelpAt||{})['h'+a.i]=x.stepIndex;}
}
function textOf(x,k,a,b,w){
var T=FX.EV[k],fc=LH.face(x,a,b),both=LH.has(x,b,a),m={a:a,b:b,w:w||''};
var t=pick(x,T.lead[fc]||T.lead.hate)+a.name+pick(x,T.say[ps(a)]);
if(T.tail)t+=pick(x,T.tail[both?'both':'one']);
return{text:fill(t,m),fc:fc,both:both};
}
function whyOf(x,k,a,b,fc,extra){return LH.why(x,a,b)+'／表の顔：'+(LH.FACE_JA?LH.FACE_JA[fc]:fc)+'／'+EV_JA[k]+(extra?'（'+extra+'）':'');}
function urgeMark(ctx,a,b,from){if(!HK.SAFE_ON)ctx.pair(a,b).lhUrge={by:a.i,to:b.i,at:ctx.stepIndex,from:from};}
if(HK.COMMON){
var base=function(ctx,a,b){return!!b&&LH.has(ctx,a,b)&&here(a)&&here(b);};
var more=function(ctx,a,b){var pf=ctx.pair(a,b);pf.lhMore=(pf.lhMore||0)+1;};
HK.addTo(HK.COMMON,[{
id:'tie_lh_rescue',label:'嫌っているはずの相手の危機に真っ先に動く',cat:'help',scope:'pair',tie:'lovehate',pri:true,noOdd:true,
when:function(ctx,a,b){
if(!base(ctx,a,b)|| !canMove(a))return false;
var w=weakOf(ctx,b),pf=ctx.pair(a,b);
return!!w&& !(pf.lhResc&&pf.lhResc[a.i]===w);
},
w:function(ctx,a){var t=tr(a);return 2.2+(t.np||0)*0.5+(t.impulse||0)*0.3;},
run:function(ctx,a,b){
var w=weakOf(ctx,b);
if(!w)return null;
var pf=ctx.pair(a,b);(pf.lhResc=pf.lhResc||{})[a.i]=w;
var r=textOf(ctx,'rescue',a,b,w);
ctx.mod(a,b,{aff:3,trust:4});ctx.mod(b,a,{aff:5,trust:6,ten: -3});
ctx.stress(b,-6);
LH.mark(ctx,a,b,'rescue');more(ctx,a,b);
return{text:r.text,why:whyOf(ctx,'rescue',a,b,r.fc,b.name+'は'+w),mag:20,cat:'help'};
}
},{
id:'tie_lh_regret',label:'突き放したあとで言葉を探して戸惑う',cat:'conflict',scope:'pair',tie:'lovehate',pri:true,noOdd:true,
when:function(ctx,a,b){return base(ctx,a,b)&& !!follow(ctx,a,b,'regret');},
w:function(ctx,a){var t=tr(a);return 2.2+(t.np||0)*0.4+(t.ac||0)*0.3;},
run:function(ctx,a,b){
var mk=follow(ctx,a,b,'regret');
if(!mk)return null;
mk.rg=true;
var r=textOf(ctx,'regret',a,b);
ctx.stress(a,4);ctx.mod(a,b,{att:2,ten: -1});
more(ctx,a,b);urgeMark(ctx,a,b,'regret');
return{text:r.text,why:whyOf(ctx,'regret',a,b,r.fc,'直前に強く当たった'),mag:12,cat:'conflict'};
}
},{
id:'tie_lh_selfhate',label:'優しくしてしまった自分を責める',cat:'conflict',scope:'pair',tie:'lovehate',pri:true,noOdd:true,
when:function(ctx,a,b){return base(ctx,a,b)&&softNow(ctx,a,b);},
w:function(ctx,a){var t=tr(a);return 1.8+(t.cp||0)*0.4+(t.ac||0)*0.3;},
run:function(ctx,a,b){
if(!softNow(ctx,a,b))return null;
useSoft(ctx,a,b);
var r=textOf(ctx,'selfhate',a,b);
ctx.stress(a,5);ctx.mod(a,b,{ten:2});
more(ctx,a,b);
return{text:r.text,why:whyOf(ctx,'selfhate',a,b,r.fc,'直前に'+b.name+'に優しくした'),mag:12,cat:'conflict'};
}
},{
id:'tie_lh_mixed',label:'相手が喜ぶのを見て嬉しさと苛立ちが混ざる',cat:'bond',scope:'pair',tie:'lovehate',pri:true,noOdd:true,
when:function(ctx,a,b){return base(ctx,a,b)&&softNow(ctx,a,b)&&ctx.R(b,a).aff>=15;},
w:function(ctx,a,b){return 2+Math.min(1,ctx.R(b,a).aff/60);},
run:function(ctx,a,b){
if(!softNow(ctx,a,b))return null;
useSoft(ctx,a,b);
var r=textOf(ctx,'mixed',a,b);
ctx.mod(a,b,{att:3,aff:2,ten:1});ctx.mod(b,a,{aff:2});
more(ctx,a,b);urgeMark(ctx,a,b,'mixed');
return{text:r.text,why:whyOf(ctx,'mixed',a,b,r.fc,b.name+'が喜んだ'),mag:14,cat:'bond'};
}
},{
id:'tie_lh_makeup',label:'口実を付けて素直になれない仲直りをする',cat:'bond',scope:'pair',tie:'lovehate',pri:true,noOdd:true,
when:function(ctx,a,b){return base(ctx,a,b)&& !!follow(ctx,a,b,'makeup');},
w:function(ctx,a){var t=tr(a);return 1.8+(t.np||0)*0.4+(t.a||0)*0.2;},
run:function(ctx,a,b){
var mk=follow(ctx,a,b,'makeup');
if(!mk)return null;
mk.mu=true;
var r=textOf(ctx,'makeup',a,b);
ctx.mod(a,b,{ten: -6,aff:3});ctx.mod(b,a,{ten: -5,aff:3});
more(ctx,a,b);
return{text:r.text,why:whyOf(ctx,'makeup',a,b,r.fc,'喧嘩から区切りをおいて'),mag:14,cat:'bond'};
}
}]);
}
LH.storyMore=function(S,live,opt){
if(!S||S.hkSpace==='cramped'|| !live||live.length<2)return null;
var cand=[];
live.forEach(function(a){
if(!canMove(a))return;
live.forEach(function(b){
if(a===b|| !here(b)|| !LH.has(S,a,b)||(opt.lhSkip&&opt.lhSkip(a,b)))return;
var w=weakOf(S,b);
if(w&& !((S.lhResc||{})[a.i+'>'+b.i]===w))cand.push({k:'rescue',a:a,b:b,w:w,p:3});
if(follow(S,a,b,'regret'))cand.push({k:'regret',a:a,b:b,p:2});
if(follow(S,a,b,'makeup'))cand.push({k:'makeup',a:a,b:b,p:1.5});
if(follow(S,a,b,'selfhate'))cand.push({k:S.rng()<0.5?'mixed':'selfhate',a:a,b:b,p:2});
});
});
if(!cand.length||S.rng()>(opt.rate||0.12)*1.6)return null;
var sum=0,r,c=cand[0];
cand.forEach(function(q){sum+=q.p;});
r=S.rng()*sum;
for(var i=0;i<cand.length;i++){r-=cand[i].p;if(r<=0){c=cand[i];break;}}
var mk=LH.lastMark(S,c.a,c.b);
if(c.k==='rescue'){(S.lhResc=S.lhResc||{})[c.a.i+'>'+c.b.i]=c.w;LH.mark(S,c.a,c.b,'rescue');}
else if(mk){if(c.k==='regret')mk.rg=true;else if(c.k==='makeup')mk.mu=true;else mk.af=true;}
var t=textOf(S,c.k,c.a,c.b,c.w);
S.lhN=S.lhN||{};var key=c.a.i+'>'+c.b.i;S.lhN[key]=(S.lhN[key]||0)+1;
return{text:(opt.place||'')+t.text,why:whyOf(S,c.k,c.a,c.b,t.fc,c.k==='rescue'?c.b.name+'は'+c.w:''),mag:c.k==='rescue'?20:12,
cat:c.k==='rescue'?'help':c.k==='mixed'||c.k==='makeup'?'bond':'conflict',actors:[c.a,c.b],lh:true,lhKind:c.k};
};
})();
});
;
/* ==== js/mood-dial.js ==== */
HK.Load.def(59,'js/mood-dial.js',function(){
(function(){
'use strict';
var HK=window.HK;
if(!HK)return;
var MUL={
mild:{kill:0.35,shinju:0.35,cage:0.35,harm:0.35,breakup:0.35,cheat:0.35,heartbreak:0.35,madness:0.35,fall:0.5,raid:0.35,wipe:0.5,grudge:0.35,spite:0.35,assault:0.35,night:0.7},
dark:{kill:1.8,shinju:1.8,cage:1.8,harm:1.8,breakup:1.8,cheat:1.8,heartbreak:1.8,madness:1.8,fall:1.8,raid:1.8,wipe:1.8,grudge:1.8,spite:1.8,assault:1.8}
};
var DEATH={kill:1,shinju:1,madness:1,raid:1,wipe:1,night:1,grudge:1};
var PACE={mild:0.6,dark:1.4},END={mild:0.4,dark:1.6},NOTE={mild:'展開：穏やか',dark:'展開：重い'};
var LBL={mild:'穏やか',normal:'ふつう',dark:'重い'};
function envOf(x){return x&&x.env&&typeof x.env==='object'?x.env:x;}
function lv(v){return v==='mild'||v==='dark'||v==='normal'?v:'';}
var D=HK.Dark={
MUL:MUL,DEATH:DEATH,
on:function(x,kind){
var e=envOf(x);
if(kind&&DEATH[kind]){var d=lv(e&&e.death);if(d)return d;}
var v=e&&e.heavy;return v==='mild'||v==='dark'?v:'normal';
},
split:function(x){var e=envOf(x);return!!lv(e&&e.death);},
f:function(x,kind){var m=MUL[D.on(x,kind)];return m?(m[kind]!=null?m[kind]:1):1;},
live:function(x,p,kind){var k=D.f(x,kind||'kill');return k===1?p:1-(1-p)*k;},
pace:function(x,kind){return PACE[D.on(x,kind)]||1;},
skip:function(x,kind){var k=D.f(x,kind);if(!(k<1))return false;var r=x&&x.rng;return typeof r==='function'?r()>k:false;},
endings:function(x,kind){return END[D.on(x,kind)]||1;},
note:function(x){
var h=D.on(x),d=D.on(x,'kill'),out=[];
if(NOTE[h])out.push(NOTE[h]);
if(d!==h)out.push('死ネタ：'+LBL[d]);
return out.join('／');
},
tag:function(x,kind){var l=D.on(x,kind);return(kind&&DEATH[kind]&&D.split(x)?'死ネタの重さ：':'展開の重さ：')+LBL[l];},
pick:function(x,mild,normal,dark,kind){var l=D.on(x,kind);return l==='mild'?mild:l==='dark'?dark:normal;},
keep:function(src,env){
env.heavy=D.on(src);
var d=lv(src&&src.death);if(d)env.death=d;
return env;
},
cheat:function(ctx,a,b){
if(!ctx|| !ctx.chars|| !ctx.pair|| !a|| !b||ctx.pair(a,b).couple)return false;
return ctx.chars.some(function(c){return c!==a&&c!==b&&c.alive!==false&&(ctx.pair(a,c).couple||ctx.pair(b,c).couple);});
},
OFF_MILD:{force:1,violence:1,abuse:1},
FEW:[0.3,0.3,0.3,0.3,0.3,0.5],
few:function(ctx){var n=ctx&&ctx.chars?ctx.chars.length:99;return n<D.FEW.length?D.FEW[n]:1;}
};
if(HK.GLOBAL_ENV&& !HK.GLOBAL_ENV.some(function(e){return e.id==='heavy';})){
var item={
id:'heavy',label:'展開の重さ',type:'select',def:'normal',all:1,
options:[
{v:'mild',label:'穏やか：別れ・浮気・監禁・堕ちなどが起こりにくい（起きないわけではない）'},
{v:'normal',label:'ふつう'},
{v:'dark',label:'重い：起こりやすい'}
]
};
Object.defineProperty(item,'desc',{
enumerable:true,
get:function(){
var s='監禁・危害・別れ・浮気・失恋・堕ちなど、死なない重い展開の起こりやすさを変える（全箱庭で共通）。下の「死ネタの重さ」が「展開の重さに合わせる」のままなら、死・心中などもこれに合わせて変わる';
return s;
}
});
HK.GLOBAL_ENV.push(item);
}
if(HK.GLOBAL_ENV&& !HK.GLOBAL_ENV.some(function(e){return e.id==='death';})){
HK.GLOBAL_ENV.push({
id:'death',label:'死ネタの重さ',type:'select',def:'auto',all:1,
options:[
{v:'auto',label:'展開の重さに合わせる'},
{v:'mild',label:'穏やか：死・心中・殺し合い・発狂が起こりにくい（起きないわけではない）'},
{v:'normal',label:'ふつう'},
{v:'dark',label:'重い：起こりやすい'}
],
desc:'死・心中・殺し合い・命に関わる危害・発狂・全滅・襲撃での死の起こりやすさだけを変える（全箱庭で共通）。死ネタだけ軽くしたいときは「穏やか」に。浮気・別れなどは「展開の重さ」で変わり、住人の設定の「一途」「恋愛相手の固定」でも防げる'
});
}
var C=HK.Content;
if(C&&C.on&& !C.on._dark){
var on0=C.on;
C.on=function(env,tag,scenId){
if(D.OFF_MILD[tag]&&D.on(env)==='mild'&& !(scenId&&C.CORE&&C.CORE[scenId]))return false;
return on0.apply(this,arguments);
};
C.on._dark=true;
}
})();
});
;
/* ==== js/free-sex.js ==== */
HK.Load.def(62,'js/free-sex.js',function(){
(function(){
'use strict';
var HK=window.HK;
if(!HK|| !HK.State)return;
function L(s){return s.split('|');}
function eng(ctx){return!!(ctx&&HK.Ctx&&ctx instanceof HK.Ctx);}
function people(ctx){return(ctx&&(ctx.chars||ctx.P))||[];}
function rnd(ctx){return ctx&&ctx.rng?ctx.rng():Math.random();}
function pick(ctx,arr){
if(eng(ctx))return ctx.pick(arr);
if(HK.Story&&HK.Story.pick&&ctx&&ctx.recent)return HK.Story.pick(ctx,arr);
return arr[Math.floor(rnd(ctx)*arr.length)];
}
function fill(t,a,b){return String(t).replace(/\{a\}/g,a.name).replace(/\{b\}/g,b.name);}
function noneOf(a,b){return a&&a.likes==='none'?a:b&&b.likes==='none'?b:null;}
function freeOne(a,b){return noneOf(a,b)||(HK.lockOut(a,b)?a:b);}
function noneFree(a,b){
if(!HK.Pos|| !HK.Pos.sexLikeOf|| !noneOf(a,b))return false;
return!(HK.ngPair&&HK.ngPair(a,b))|| !!(HK.lockSexOnly&&HK.lockSexOnly(a,b));
}
function offPair(a,b){return!!((a.loveOff&&a.loveOff.indexOf(b.i)>=0)||(b.loveOff&&b.loveOff.indexOf(a.i)>=0));}
var ROM0_P=0.2;
function pairRoll(c,a,b){
var t=String(c.seed)+':'+Math.min(a.i,b.i)+'-'+Math.max(a.i,b.i),h=0x811c9dc5;
for(var i=0;i<t.length;i++){h^=t.charCodeAt(i);h=Math.imul(h,0x01000193)>>>0;}
return h/4294967296;
}
function rom0(a,b){
var c=HK._curCtx;
return!!(c&&eng(c)&&c.chars&&c.chars[a.i]===a&&c.chars[b.i]===b&&c.env&&c.env.romance===0&& !(c.scen&&c.scen.romanceCore))&&pairRoll(c,a,b)<ROM0_P;
}
HK.State.rom0=rom0;
function kindOf(a,b){
if(!a|| !b||a===b)return'';
if(HK.lockSexOnly&&HK.lockSexOnly(a,b))return'lock';
if(noneFree(a,b))return'none';
if(offPair(a,b)&& !(HK.ngPair&&HK.ngPair(a,b)))return'off';
if(HK.Pos&&HK.Pos.hostile&&HK.Pos.hostile(a,b)&& !(HK.ngPair&&HK.ngPair(a,b)))return'host';
if(rom0(a,b)&& !(HK.ngPair&&HK.ngPair(a,b)))return'off';
return'';
}
HK.State.freeSex=function(ctx,a,b){
if(!a|| !b||a===b||HK.SAFE_ON)return false;
var kd=kindOf(a,b);
if(!kd)return false;
if((kd==='host'||kd==='off')&&eng(ctx)&&ctx.pair(a,b).couple)return false;
if(!HK.State.pairSex(a,b))return false;
if(HK.sexBlocked&&HK.sexBlocked(a,b))return false;
if(a.role==='teacher'||b.role==='teacher'||a.minor||b.minor)return false;
if(eng(ctx)&&ctx.pair(a,b).kin)return false;
return true;
};
HK.sexFree=HK.State.freeSex;
var F=HK.FreeSex={};
F.kind=function(ctx,a,b){return kindOf(a,b);};
F.lust=function(ctx,a,b){var k=kindOf(a,b);return(k==='off'||k==='host')&&HK.State.freeSex(ctx,a,b);};
F.chance=function(ctx,a,b,k){
var hk=HK.Pos&&HK.Pos.hostK?HK.Pos.hostK(a,b):1;
var d=HK.Pos&&HK.Pos.sexDrive?HK.Pos.sexDrive(ctx,a,b)/(hk>0?hk:1):0;
return HK.clamp(d*(k==null?1:k)*(F.loverOf(ctx,a,b.i)||F.loverOf(ctx,b,a.i)?0.3:1)*(HK.Pos&&HK.Pos.nightK?HK.Pos.nightK(ctx):1),0,0.95)*hk;
};
F.loversOf=function(ctx,x,notI){
if(!x|| !HK.lockAny(x))return[];
var L=HK.locks(x),P=people(ctx),out=[];
if(L.indexOf(notI)>=0)return[];
for(var k=0;k<L.length;k++){var y=P[L[k]];if(y&&y!==x&&HK.State.here(y)&&out.indexOf(y)<0)out.push(y);}
return out;
};
F.loverOf=function(ctx,x,notI){return F.loversOf(ctx,x,notI)[0]||null;};
F.factor=function(ctx,a,b,noLib){
return(F.loverOf(ctx,a,b.i)||F.loverOf(ctx,b,a.i)?0.3:1)*(!noLib&&HK.Pos&&HK.Pos.libMul?HK.Pos.libMul([a,b])*(HK.Pos.reasonK?HK.Pos.reasonK(ctx,a,b):1):1)*(!noLib&&HK.Pos&&HK.Pos.hostK?HK.Pos.hostK(a,b):1);
};
F.fallOk=function(ctx,x,y){
if(!x|| !y||x===y)return false;
var c=eng(ctx)?ctx:undefined;
if(HK.canLove&& !(HK.canLove(x,y,c)&&HK.canLove(y,x,c)))return false;
if(HK.Avoid&&HK.Avoid.of&&HK.Avoid.of(ctx,x,y))return false;
return kindOf(x,y)!=='host';
};
F.mark=function(ctx,a,b){
if(eng(ctx)){
var pf=ctx.pair(a,b),kd=kindOf(a,b);
pf.night=true;pf.fwb=true;pf.couple=false;pf.since=null;
pf.freeSex=(pf.freeSex||0)+1;
if(kd==='off'||kd==='host'){var k0=ctx.k;ctx.k=1;ctx.mod2(a,b,{aff:2,att:3},{aff:2,att:3});ctx.k=k0;}
return pf;
}
var k=Math.min(a.i,b.i)+'-'+Math.max(a.i,b.i);
ctx.freeSex=ctx.freeSex||{};
ctx.freeSex[k]=(ctx.freeSex[k]||0)+1;
return null;
};
})();
});
;
/* ==== js/mini.js ==== */
HK.Load.def(65,'js/mini.js',function(){
(function(){
'use strict';
var HK=window.HK;
HK.MINI=HK.MINI||{};
var TR={cp:1,np:1,a:1,fc:1,ac:1,caution:1,aggr:1,warmth:1,honesty:1,impulse:1,jealous:1,lead:1,cold:1};
var REL={aff:1,trust:1,ten:1,att:1};
var FACT={cp:'CP',np:'NP',a:'A',fc:'FC',ac:'AC'};
function val(ctx,a,b,tok){
if(/^-?[\d.]+$/.test(tok))return parseFloat(tok);
var who=a,t=tok;
if(t.indexOf('B.')===0){who=b;t=t.slice(2);}
if(!who)return 0;
if(TR[t])return who.tr[t];
if(t.charAt(0)==='#')return ctx.stat(who,t.slice(1));
if(REL[t])return b?ctx.R(a,b)[t]:0;
if(t.charAt(0)==='r'&&REL[t.slice(1)])return b?ctx.R(b,a)[t.slice(1)]:0;
if(t==='stress')return who.stress;
if(t==='hp')return who.hp;
if(t==='drunk')return who.flags.drunk||0;
if(t==='aphro')return who.flags.aphro||0;
if(t==='food')return ctx.food||0;
if(t==='step')return ctx.stepIndex;
if(t==='n')return ctx.present().length;
if(t==='romance')return ctx.env.romance/100;
if(t==='kills')return who.flags.kills||0;
if(t==='rroom')return ctx.flags.romantic?1:0;
if(t==='one')return ctx.flags.isOne?1:0;
if(t==='allies')return b&&ctx.pair(a,b).allied?1:0;
if(t==='couple')return b&&ctx.pair(a,b).couple?1:0;
if(t==='night')return b&&ctx.pair(a,b).night?1:0;
if(t==='pact')return b&&(ctx.pair(a,b).pact||ctx.pair(a,b).allied)?1:0;
if(t==='fwb'){return b&&HK.Ties&&HK.Ties.has(ctx,a,b,'fwb')?1:0;}
if(t==='love')return b&&HK.canLove(a,b)?1:0;
if(t==='leader')return who.flags.leader?1:0;
if(t==='griev')return who.flags.grief!=null?1:0;
return 0;
}
function parseExpr(s){
var terms=[];
String(s||'0').replace(/\s/g,'').replace(/([+-]?)([^+-]+)/g,function(m,sign,body){
var mul=1,tok=body,p;
if((p=body.indexOf('*'))>0){tok=body.slice(0,p);mul=parseFloat(body.slice(p+1));}
else if((p=body.indexOf('/'))>0){tok=body.slice(0,p);mul=1/parseFloat(body.slice(p+1));}
terms.push({tok:tok,mul:sign==='-'? -mul:mul});
return m;
});
return terms;
}
function parseWhen(s){
if(!s)return null;
return s.split('&').map(function(c){
var m=c.match(/^([^<>=!]+)(<=|>=|<|>|=)(-?[\d.]+)$/);
return m?{tok:m[1],op:m[2],v:parseFloat(m[3])}:null;
}).filter(Boolean);
}
function parseFx(s){
var out=[];
String(s||'').split(';').forEach(function(part){
part=part.trim();
if(!part)return;
var i=part.indexOf(':');
if(i<0){out.push({k:part});return;}
var k=part.slice(0,i),body=part.slice(i+1),d={};
if(/^(as|bs|ahp|bhp|food)$/.test(k)){out.push({k:k,v:parseFloat(body)});return;}
body.split(',').forEach(function(kv){var m=kv.match(/^([a-z]+)(-?[\d.]+)$/);if(m)d[m[1]]=parseFloat(m[2]);});
out.push({k:k,d:d});
});
return out;
}
function evalTerms(ctx,a,b,terms){
var s=0;
for(var i=0;i<terms.length;i++)s+=val(ctx,a,b,terms[i].tok)*terms[i].mul;
return s;
}
function why(ctx,a,b,terms){
var best=null,bv=0;
terms.forEach(function(t){
if(t.mul<=0)return;
if(/^-?[\d.]+$/.test(t.tok))return;
var raw=val(ctx,a,b,t.tok),base=t.tok.replace(/^B\./,'');
if(TR[base]&&raw<0.5)return;
if((REL[base]||REL[base.slice(1)])&&raw<15)return;
var v=raw*t.mul;
if(v>bv){bv=v;best=t;}
});
if(!best)return'その場の流れ';
var tok=best.tok,who=a;
if(tok.indexOf('B.')===0){who=b;tok=tok.slice(2);}
if(!who)return'';
if(FACT[tok])return who.name+'の'+FACT[tok]+'（'+Math.round(who.eg[FACT[tok]])+'）';
if(TR[tok])return who.name+'の'+HK.TRAIT_NAME[tok]+'（'+Math.round(who.tr[tok]*100)+'）';
if(tok.charAt(0)==='#')return who.name+'の'+statLabel(ctx,tok.slice(1))+' '+ctx.stat(who,tok.slice(1));
var RN={aff:'好意',trust:'信頼',ten:'緊張',att:'惹かれ'};
if(REL[tok]&&b)return a.name+'から'+b.name+'への'+RN[tok]+'（'+Math.round(ctx.R(a,b)[tok])+'）';
if(tok.charAt(0)==='r'&&REL[tok.slice(1)]&&b)return b.name+'から'+a.name+'への'+RN[tok.slice(1)]+'（'+Math.round(ctx.R(b,a)[tok.slice(1)])+'）';
if(tok==='stress')return who.name+'の焦り（'+Math.round(who.stress)+'）';
if(tok==='drunk')return who.name+'の酔い';
if(tok==='aphro')return who.name+'に回った媚薬';
if(tok==='hp')return who.name+'の体力';
return'';
}
function statLabel(ctx,id){
var s=(ctx.scen.stats||[]).filter(function(x){return x.id===id;})[0];
return s?s.label:id;
}
HK.TAILS={
bond:{
CP:['{b}は「ふうん｜ふむ｜そうですか」と言いながら、最後まで聞いていた。','{b}は腕を組んだまま、それでも最後まで付き合った。','{b}は呆れた顔をしたが、席は立たなかった。'],
NP:['{b}は目を細めて頷いた。','{b}はそれを嬉しそうに聞いていた。','{b}は「ありがとう｜感謝する｜ありがとうございます」と、少し照れたように言った。'],
A:['{b}は少し考えてから、的確な一言を返した。','{b}は表情を変えずに、でもちゃんと聞いていた。','{b}は話の続きを促した。'],
FC:['{b}は手を叩いて笑った。','{b}がすぐに話を広げて、話題は思わぬ方へ転がった。','{b}は「それな」と身を乗り出した。'],
AC:['{b}は遠慮がちに、それでも嬉しそうに笑った。','{b}は相槌を打ちながら、相手の顔色を窺っていた。','{b}は何度も頷いた。']
},
romance:{
CP:['{b}は咳払いでごまかした。','{b}は「調子に乗らないで｜調子に乗るな｜調子に乗らないでください」と言いながら、目を逸らさなかった。','{b}の口元が、ほんのわずかに緩んだ。'],
NP:['{b}は柔らかく笑い返した。','{b}はそっと距離を詰めた。','{b}は「そういうとこ、ずるいよね｜そういうところが、ずるいな｜そういうとこ、ずるいですよね」と笑った。'],
A:['{b}は一瞬だけ言葉を探した。','{b}は平静を装ったが、瞬きの回数が増えていた。','{b}は何も言わなかったが、離れもしなかった。'],
FC:['{b}は声を上げて笑って、やり返した。','{b}はわざと顔を近づけてきた。','{b}は「もっと言って｜もっと言え｜もっと言ってください」と冗談めかした。'],
AC:['{b}は耳まで赤くなった。','{b}は俯いて、返事をし損ねた。','{b}は聞こえなかったふりをした。顔は真っ赤だった。']
},
conflict:{
CP:['{b}は真正面から睨み返した。','{b}は「言いたいことがあるなら言って｜言いたいことがあるなら言え｜言いたいことがあるなら言ってください」と低く言った。','{b}は一歩も引かなかった。'],
NP:['{b}は悲しそうに眉を下げた。','{b}は「何かあった？｜何かあったか｜何かありました？」と逆に気遣った。','{b}は言い返さずに、ただ受け止めた。'],
A:['{b}は淡々と事実だけを指摘し返した。','{b}は相手にしない、という顔をした。','{b}は冷静に距離を取った。'],
FC:['{b}は即座に言い返した。','{b}は鼻で笑った。','{b}は聞こえるように舌打ちした。'],
AC:['{b}は黙って俯いた。','{b}は笑ってごまかしたが、手が震えていた。','{b}は「ごめん｜すまない｜すみません」と、謝る必要のないことを謝った。']
},
help:{
CP:['{b}は「別に頼んでない｜別に頼んでいない｜別に頼んでません」と言いつつ、受け取った。','{b}は礼の代わりに小さく頷いた。','{b}は少し悔しそうだった。'],
NP:['{b}は「次は自分が」と微笑んだ。','{b}は深く頭を下げた。','{b}は嬉しそうに受け取った。'],
A:['{b}は「助かった｜＝｜助かりました」と短く言った。','{b}はそのお返しを、頭の中の帳簿につけた。','{b}は事務的に礼を言ったが、声は柔らかかった。'],
FC:['{b}は「最高！｜最高だ｜最高です！」と抱きついた。','{b}は大げさに感謝して、周りを笑わせた。','{b}はすっかり元気を取り戻した。'],
AC:['{b}は何度も「ごめんね｜すまない｜すみません」と言った。','{b}は泣きそうな顔で礼を言った。','{b}は申し訳なさそうに肩をすくめた。']
}
};
HK.TAILS.solo={
CP:['{a}は誰にも弱みを見せなかった。','{a}の眉間の皺は、しばらく消えなかった。','{a}は「当然でしょ｜当然だ｜当然です」と自分に言い聞かせた。'],
NP:['それでも{a}は、皆の様子を目で追っていた。','{a}はふと、誰かのことを思い出した。','{a}は、ほかの誰かの分まで心配していた。','{a}は、自分より先に相手の心配をしていた。','{a}の視線は、気づけば相手のほうを向いていた。'],
A:['{a}は頭の中で、次の手を三つ考えた。','{a}の表情からは、何も読み取れなかった。','{a}は手帳に何かを書きつけた。'],
FC:['{a}は鼻歌まじりだった。','{a}はすぐに飽きて、別のことを始めた。','{a}は一人で小さく笑った。'],
AC:['{a}は誰かに見られていないか、何度も振り返った。','{a}は小さくため息をついた。','{a}は、自分のしたことが正しかったのか考え込んだ。']
};
HK.TAILS_Q={
CP:['{b}は少し間を置いてから、短く答えた。','{b}は「さあね｜さあな｜さあ、どうでしょう」とはぐらかした。','{b}は答えをはぐらかして、肩をすくめた。'],
NP:['{b}は少し考えてから、丁寧に答えた。','{b}は笑って、ちゃんと答えた。','{b}は相手の顔を見て、正直に答えた。'],
A:['{b}は少し考えてから、短く答えた。','{b}は表情を変えずに、簡潔に答えた。','{b}は一瞬だけ言葉を探してから、答えた。'],
FC:['{b}は即答した。','{b}は冗談で返して、それから本当のことを答えた。','{b}は「それ聞く？｜それを聞くか｜それ、聞きます？」と笑ってから答えた。'],
AC:['{b}は少し迷ってから、小さな声で答えた。','{b}は答えに詰まって、目を泳がせた。','{b}は俯いたまま、ぽつりと答えた。']
};
var Q_END= /[？?]」(?:と[^。「」]{0,16}(?:訊|尋ね|聞)いた)?。?$/,Q_PASS= /[？?]」と[^。「」]{0,16}(?:訊|尋ね|聞)(?:か|ね)れた。?$/;
function askEnd(text,a,b){
if(!text|| !a|| !b||text.indexOf(b.name+'「')>=0)return'';
var pass=Q_PASS.test(text);
if(!pass&& !Q_END.test(text))return'';
var qi=text.lastIndexOf('「'),st=text.lastIndexOf('。',qi)+1,sen=text.slice(st,qi);
if(sen.indexOf(b.name+'は')>=0&&sen.indexOf(a.name+'は')<0)return'';
if(!(sen.indexOf(a.name)>=0||sen===''))return'';
return pass?'a':'b';
}
HK.askEnd=askEnd;
function tail(ctx,who,cat,self,text){
var T=HK.TAILS[cat];
if(!T|| !who)return'';
if(!self&&text&&text.indexOf(who.name+'「')>=0)return'';
var sub=HK.tailSub&&HK.tailSub(cat,text);
if(sub&&HK.TAILS_SUB&&HK.TAILS_SUB[sub])T=HK.TAILS_SUB[sub];
var top=HK.voiceTop(who);
return self?ctx.t(ctx.pick(T[top]),who):ctx.t(ctx.pick(T[top]),null,who);
}
function applyFx(ctx,a,b,fx){
fx.forEach(function(f){
switch(f.k){
case'ab':if(b)ctx.mod(a,b,f.d,1.4);break;
case'ba':if(b)ctx.mod(b,a,f.d,1.4);break;
case'as':ctx.stress(a,f.v);break;
case'bs':if(b)ctx.stress(b,f.v);break;
case'ahp':a.hp=Math.min(100,a.hp+f.v);if(a.hp<=0)ctx.kill(a,null,ctx.label+'の出来事で');break;
case'bhp':if(b){b.hp=Math.min(100,b.hp+f.v);if(b.hp<=0)ctx.kill(b,null,ctx.label+'の出来事で');}break;
case'food':ctx.food=Math.max(0,(ctx.food||0)+f.v);break;
case'ga':ctx.others(a).forEach(function(o){ctx.mod(a,o,f.d);});break;
case'gab':ctx.others(a).forEach(function(o){ctx.mod(o,a,f.d);});break;
case'sec':if(b)ctx.pair(a,b).secret=true;break;
case'jea':if(b)ctx.pair(a,b).jealous++;break;
case'couple':if(b)ctx.pair(a,b).couple=true;break;
case'nite':if(b)ctx.pair(a,b).night=true;break;
case'unnite':if(b){var pn=ctx.pair(a,b);pn.night=false;pn.wasNight=true;}break;
case'brk':if(b){var pb=ctx.pair(a,b);if(pb.allied||pb.pact)pb.allyBroken=true;pb.allied=false;pb.pact=false;}break;
}
});
}
var LOVE_TXT= /恋|好きな人|好きか|誰が誰を|付き合って|告白|片想い|本命|デート|キス|ときめ|惹かれ|両想い/;
function loveTalkOk(ctx,L){
if(ctx.scen&&ctx.scen.romanceCore)return true;
if(ctx.env&&ctx.env.romance===0)return false;
return!L.some(function(x){return x&&x.likes==='none';});
}
HK.loveTalkOk=loveTalkOk;HK.LOVE_TXT=LOVE_TXT;
function ageFits(t,a,b){
if(/同い年|同じ年/.test(t))return a.age===b.age;
if(/\{b\}(?:が|は|の方が|のほうが)年上/.test(t))return b.age>a.age;
if(/\{b\}(?:が|は|の方が|のほうが)年下/.test(t))return b.age<a.age;
if(/\{a\}(?:が|は|の方が|のほうが)年上/.test(t))return a.age>b.age;
if(/\{a\}(?:が|は|の方が|のほうが)年下/.test(t))return a.age<b.age;
return true;
}
var FRIEND_TXT= /ずっとも|ずっと友|友達(?:じゃ|では|で|に|の)(?:いられ|戻れ|まま)|友人(?:では|で|に|の)(?:いられ|戻れ|まま)/,UNPAIRED_TXT= /付き合って(?:も)?いない|付き合ってない/;
var FAM_TIES=['parent','pparent','sibling','sibprot','sibclose','twin','sibbad','stepsib','relative'],LOVE_TIES=['lover','spouse','mate','fiance','fated'];
function tieAny(ctx,a,b,l){return!!(HK.Ties&&HK.Ties.has&&ctx.ties)&&l.some(function(t){return HK.Ties.has(ctx,a,b,t);});}
var FIRSTMEET_TXT= /初めまして|はじめまして|名前(?:くらい)?(?:を)?教え合|名前、なんて呼べば|名前、なんと呼べば|なんとお呼びすれば|名前は、何と呼べば|名前は、なんと呼べば|自己紹介|名乗り合|会ったばかり/;
function sealedLate(ctx){return!!(ctx&&ctx.scen&&(ctx.scen.id==='whiteroom'||ctx.scen.sealedRoom)&&ctx.stepIndex>=1);}
function relFits(ctx,t,a,b){
if(FIRSTMEET_TXT.test(t)&&sealedLate(ctx))return false;
if(!b)return true;
var fr=FRIEND_TXT.test(t),un=UNPAIRED_TXT.test(t);
if(REL_ANY.test(t)&& !relTextFits(relClass(ctx,a,b),t))return false;
if(!fr&& !un)return true;
var cp= !!ctx.pair(a,b).couple||tieAny(ctx,a,b,LOVE_TIES);
if(un&&cp)return false;
if(fr&&(cp||tieAny(ctx,a,b,FAM_TIES)))return false;
return true;
}
var REL_CLS={parent:'fam',sibling:'fam',sibprot:'fam',sibclose:'fam',sibbad:'fam',twin:'fam',stepsib:'fam',relative:'fam',pparent:'pfam',
spouse:'spouse',lover:'lover',fiance:'lover',mate:'lover',colleague:'work',boss:'work',senpai:'work',classmate:'school',teacher:'school',mentor:'school',ex:'ex',acq:'weak'};
var REL_SKIP={noobs:1,fated:1},REL_ORDER=['spouse','fam','pfam','lover','ex','work','school','known','weak'];
function relClass(ctx,a,b){
if(!b|| !HK.Ties|| !HK.Ties.all|| !ctx.ties)return'none';
var best='none',tl=HK.Ties.all(ctx,a,b);
if(!ctx.tiesAll&&Array.isArray(ctx.ties)&&a&&b)tl=ctx.ties.filter(function(t){return t&&((t.a===a.i&&t.b===b.i)||(t.a===b.i&&t.b===a.i));});
tl.forEach(function(t){
if(!t||REL_SKIP[t.type])return;
var c=REL_CLS[t.type]||(t.like&&REL_CLS[t.like])||'known';
if(t.spouse&&c==='lover')c=t.married==='separated'?'lover':'spouse';
if(best==='none'||REL_ORDER.indexOf(c)<REL_ORDER.indexOf(best))best=c;
});
return best;
}
var MEET_TXT= /初めまして|はじめまして|名前、なんて呼べば|名前、なんと呼べば|なんとお呼びすれば|名前(?:くらい)?(?:を)?教え合|初対面|見知らぬ(?:誰か|相手|人|者|他人)|赤の他人|名前も知らな|名前しか知らな|名前を知っているだけ|名前のほかは|互いのことを(?:ほとんど|何も|よく)知らな|会ったばかりの|連絡先を(?:交換(?!し直)|聞|訊|教え|渡)|連絡先(?:だけ|も交換)|互いの連絡先|全員の連絡先|住所を(?:聞|訊|教え|交換)|また会えたら|またどこかで|今度、?ご飯でも|名刺を(?:渡|交換|差し出)/;
var WARM_TXT= /すっかり打ち解け|打ち解けていた|仲間になった気が|話すほど、相手の考え方|こんな顔で話す人だった|本当の名前を教え|名前を教え合|(?:子ども|子供)の頃の夢(?:って|は)|好きな食べ物(?:って|は)何|休みの日は何(?:して|を)|どんな人が(?:タイプ|好み)|どんな人に惹かれ|出身はどこ|こんな場所でなければ、?話さなかった|昔の話をした。誰にも話したことのない|将来なりたいものを初めて|家族は何人|(?:きょうだい|兄弟)(?:、|は)いる|ご兄弟は/;
var KNOWN_TXT= /久しぶりに会(?!え)|久しぶりだな|卒業以来|何年ぶり|昔から(?:の知り合い|知って)|(?:子ども|子供|幼い|小さい)(?:の)?頃から(?:知って|一緒|の仲|の付き合い|の知り合い)|昔みたいに|家に帰ったら|また家で|うちに帰ったら|同じ家に帰/;
var NEWCP_TXT= /馴れ初め|付き合い始めた(?:という|らしい|って)|付き合うことになっ|二人が付き合い|恋人(?:になった|同士になった|どうしになった)|改めて待ち合わせ|それからも会うようになっ|初めてのデート|条件(?:じゃ|で)なくても、またしたい/;
var HOME_TXT= /家まで送|それぞれの家|別々の家|上がっていく|家に帰ったら会えな|家の前で別れ|うちに来(?:て|い)|うちにいらして|一番近い[^。]{0,8}の部屋|次の約束を口に/;
var OUT_TXT= /会釈|他人行儀に|どこに住んで|何の仕事を|お仕事は|ご職業/,WORKQ_TXT= /どこで働い|何の仕事を|お仕事は|ご職業|職場はどこ/;
var REL_ANY=new RegExp([MEET_TXT,WARM_TXT,KNOWN_TXT,NEWCP_TXT,HOME_TXT,OUT_TXT,WORKQ_TXT].map(function(r){return r.source;}).join('|'));
function relTextFits(c,t){
if(c==='none')return!KNOWN_TXT.test(t);
if(c!=='weak'&&MEET_TXT.test(t))return false;
if((c==='fam'||c==='pfam'||c==='spouse'||c==='lover')&&WARM_TXT.test(t))return false;
if((c==='fam'||c==='spouse'||c==='lover')&&NEWCP_TXT.test(t))return false;
if(c==='spouse'&&HOME_TXT.test(t))return false;
if((c==='fam'||c==='pfam'||c==='spouse')&&OUT_TXT.test(t))return false;
if(c==='work'&&WORKQ_TXT.test(t))return false;
return true;
}
function relGroupFits(ctx,g,t){
if(!g||g.length<2|| !REL_ANY.test(t))return true;
var cs=[];
for(var i=0;i<g.length;i++)for(var j=i+1;j<g.length;j++)cs.push(relClass(ctx,g[i],g[j]));
var allKnown=cs.every(function(c){return c!=='none'&&c!=='weak';}),noneKnown=cs.every(function(c){return c==='none';});
if(allKnown&&MEET_TXT.test(t))return false;
if(noneKnown&&KNOWN_TXT.test(t))return false;
return true;
}
function relFilter(ctx,list,a,b){
if(!list|| !b)return list;
var c=relClass(ctx,a,b);
var late=sealedLate(ctx);
return list.filter(function(t){return!(late&&FIRSTMEET_TXT.test(t))&&(!REL_ANY.test(t)||relTextFits(c,t));});
}
var BYSTAND_TXT= /周り(?:が|は|の誰か|の人|のほう)|居合わせた人|周囲(?:が|の人)/;
function dropBystand(ctx,t){
if(typeof t!=='string'|| !BYSTAND_TXT.test(t)||(ctx&&(!ctx.present||ctx.present().length>2)))return t;
var ss=[],cur='',d=0;
for(var i=0;i<t.length;i++){var ch=t.charAt(i);cur+=ch;if(ch==='「')d++;else if(ch==='」')d=Math.max(0,d-1);if(ch==='。'&&d===0){ss.push(cur);cur='';}}
if(cur)ss.push(cur);
var keep=ss.filter(function(x){return x.indexOf('「')>=0|| !BYSTAND_TXT.test(x);});
return keep.length&&keep.length<ss.length?keep.join(''):t;
}
HK.dropBystand=dropBystand;HK.BYSTAND_TXT=BYSTAND_TXT;
HK.relClass=relClass;HK.relFilter=relFilter;HK.sealedLate=sealedLate;HK.relGroupFits=relGroupFits;HK.relTextFits=relTextFits;
HK.REL_TXT={FIRSTMEET:FIRSTMEET_TXT,MEET:MEET_TXT,WARM:WARM_TXT,KNOWN:KNOWN_TXT,NEWCP:NEWCP_TXT,HOME:HOME_TXT,OUT:OUT_TXT,WORKQ:WORKQ_TXT,ANY:REL_ANY};
HK.relFits=relFits;
HK.E=function(id,cat,scope,w,when,fx,texts){
var terms=parseExpr(w),conds=parseWhen(when),effects=parseFx(fx);
var list=String(texts).split('|');
var sc=scope.charAt(0)==='p'?'pair':'solo';
var GRP= /皆|全員|みんな|何人か|周り|周囲|誰か|一同|クラス中|教室中|ほかの誰|他の誰|誰も/;
var allGroup=list.every(function(t){return GRP.test(t.replace(/\{[a-z]+\}/g,''));});
var tcat=cat==='romance'||cat==='conflict'||cat==='help'?cat:'bond';
var loveOnly=list.every(function(t){return LOVE_TXT.test(t);}),hasLove=list.some(function(t){return LOVE_TXT.test(t);});
var withTail=scope==='p+',selfTail=scope==='s+';
var jea=effects.some(function(f){return f.k==='jea';});
if(jea){var c0=conds;conds=(c0||[]).concat([{jea:1}]);}
if(effects.some(function(f){return f.k==='couple';}))conds=(conds||[]).concat([{cpl:1}]);
var sexEv=effects.some(function(f){return f.k==='nite';});
return{
id:id,cat:cat,scope:sc,mini:true,sex:sexEv||undefined,
when:conds?function(ctx,a,b){
for(var i=0;i<conds.length;i++){
if(conds[i].jea){if(b&&HK.Obsess&& !HK.Obsess.jealOk(ctx,a,b))return false;continue;}
if(conds[i].cpl){if(b&&HK.Poly&& !HK.Poly.canTry(ctx,a,b))return false;continue;}
var v=val(ctx,a,b,conds[i].tok),c=conds[i];
if(c.op==='>'&& !(v>c.v))return false;
if(c.op==='<'&& !(v<c.v))return false;
if(c.op==='>='&& !(v>=c.v))return false;
if(c.op==='<='&& !(v<=c.v))return false;
if(c.op==='='&&v!==c.v)return false;
}
return true;
}:null,
w:function(ctx,a,b){if((scope==='g'||allGroup)&&ctx.present().length<3)return 0;if(loveOnly&& !loveTalkOk(ctx,[a,b]))return 0;return Math.max(0,evalTerms(ctx,a,b,terms));},
run:function(ctx,a,b){
applyFx(ctx,a,b,effects);
if(jea&&b&&HK.Obsess)HK.Obsess.feed(ctx,a,b,4);
var c=null;
if(list.some(function(t){return t.indexOf('{c}')>=0;})){
var pool=ctx.others(a).filter(function(o){return o!==b;});
c=pool.length?ctx.pick(pool):null;
}
var cand=c?list:list.filter(function(t){return t.indexOf('{c}')<0;});
if(hasLove&& !loveTalkOk(ctx,[a,b,c])){var nl=cand.filter(function(t){return!LOVE_TXT.test(t);});if(nl.length)cand=nl;}
if(b&&a.age&&b.age){var ag=cand.filter(function(t){return ageFits(t,a,b);});if(ag.length)cand=ag;else return null;}
if(b&&cand.some(function(t){return FRIEND_TXT.test(t)||UNPAIRED_TXT.test(t)||REL_ANY.test(t)||FIRSTMEET_TXT.test(t);})){var rf=cand.filter(function(t){return relFits(ctx,t,a,b);});if(rf.length)cand=rf;else return null;}
var text=ctx.t(ctx.pick(cand.length?cand:list),a,b,c);
var isQ=withTail&&b?askEnd(text,a,b):'',ans=isQ==='a'?a:b;
if(withTail&&b&&(ctx.rng()<0.55||isQ))text+=isQ?ctx.t(ctx.pick(HK.TAILS_Q[HK.voiceTop(ans)]||HK.TAILS_Q.A),null,ans):tail(ctx,b,tcat,false,text);
if(selfTail&&ctx.rng()<0.5)text+=tail(ctx,a,'solo',true);
return{text:text,why:why(ctx,a,b,terms),with:c?[c]:null};
}
};
};
HK.addMini=function(scenId,list){
var L=HK.MINI[scenId]||(HK.MINI[scenId]=[]);
if(HK.addTo)HK.addTo(L,list);else HK.MINI[scenId]=L.concat(list);
};
})();
});
;
/* ==== js/ego-image.js ==== */
HK.Load.def(95,'js/ego-image.js',function(){
(function(){
"use strict";
var IMG={
"CP":["深い紺","#2b3a67","鷹","高いところから全体を見渡し、群れの先頭に立つ","ベチバーとシダーウッド","背筋が伸びるような、乾いた木の香り"],
"NP":["蜂蜜色","#f0b94a","カピバラ","そばにいるだけで、まわりの空気がゆるむ","ミルクとはちみつ","あたたかくて、深呼吸したくなる甘さ"],
"A":["月白","#a9bccd","フクロウ","慌てず騒がず、静かに状況を見ている","紙とインクと紅茶","書斎のような、落ち着いた知的な香り"],
"FC":["ひまわりオレンジ","#f59a3c","イルカ","楽しいことに真っ先に飛び込み、まわりを笑顔にする","グレープフルーツとオレンジ","弾けるような、明るい柑橘の香り"],
"AC":["藤色","#a995cf","ウサギ","耳がよく、相手の気配をそっと感じとる","ラベンダーと白檀","やわらかく寄り添う、静かな香り"],
"BAL":["オパール","#b4cfd6","カメレオン","場に合わせて、色を自在に変えられる","ネロリとベルガモットのブレンド","光の角度で表情が変わる、澄んだ香り"],
"CP+NP":["深い翡翠","#2f6f5e","シェパード犬","群れを導き、守ることも忘れない","ヒノキとはちみつ","凛とした木の香りに、ほのかな甘さ"],
"CP+A":["鋼の青","#3f5b7a","ハヤブサ","狙いを定めたら迷わず、的確に動く","ベチバーとミント","冷たく澄んだ、切れ味のある香り"],
"CP+FC":["緋色","#c8453b","ライオン","堂々と先頭に立ち、情熱で周りを引っぱる","レザーとブラックペッパー","熱を帯びた、ぴりっと華やかな香り"],
"CP+AC":["紺藤","#4a4a7c","ラブラドール","ルールを守って誠実に、人にも寄り添う","白檀とシダーウッド","背筋が伸びつつ、気持ちが落ち着く香り"],
"NP+CP":["琥珀","#c98a2e","ゴールデンレトリバー","面倒見がよく、芯のあるところもある","焼きたてのパンとバター","家に帰ったときのような、安心する香り"],
"NP+A":["若草","#8fb878","アルパカ","穏やかに構えて、落ち着いて受け止める","カモミールのハーブティー","ゆっくり肩の力が抜ける、やさしい香り"],
"NP+FC":["杏色","#f4a36b","トイプードル","人なつこくて、愛されることも世話することも上手","バニラとオレンジ","ふんわり甘く、少し弾むような香り"],
"NP+AC":["桜色","#f2c1cc","ヒツジ","やわらかく、ひとの気持ちを包み込む","ホワイトムスクと洗いたてのコットン","清潔でやさしい、肌になじむ香り"],
"A+CP":["鉄紺","#34495e","コウテイペンギン","冷静に、きちんと列を守って進む","ベチバーと万年筆のインク","きりっと整った、凛々しい書斎の香り"],
"A+NP":["青磁","#8cb8b0","ゾウ","ものごとをよく覚えていて、穏やかに見守る","ハーブとホワイトティー","静かで、ほっとする澄んだ香り"],
"A+FC":["夜明けの空色","#6aa6d6","カラス","好奇心が旺盛で、観察力がある","雨上がりの土とミント","ひんやり爽やかな、探検の朝の香り"],
"A+AC":["霧の灰青","#8d9db0","黒猫","距離をとりつつ、そっと見守る","古書とラベンダー","静かな夜に似合う、ひそやかな香り"],
"FC+CP":["朱赤","#e2562b","チーター","やりたいことに一直線、スピードで駆けぬける","ジンジャーとシトラス","元気が出る、スパイシーな明るさ"],
"FC+NP":["珊瑚","#f27f6b","ラッコ","無邪気で、仲間をいつも大切にする","ピーチとバニラ","ふわっと甘く、みんなが笑顔になる香り"],
"FC+A":["ターコイズ","#37b5b0","キツネ","好奇心いっぱいで、ひらめきが速い","ライムとミント","ぱっと目が覚める、軽やかな香り"],
"FC+AC":["桃色","#f5a3b0","ポメラニアン","はしゃぎながら、相手の顔色もちゃんと見ている","いちごとマシュマロ","甘酸っぱく、くすっと笑える香り"],
"AC+CP":["紺藤","#5c5f93","柴犬","ひかえめに、でも筋はしっかり通す","白檀とヒノキ","凛としてやさしい、お香のような香り"],
"AC+NP":["薄藤","#c7b0d8","シマエナガ","ちいさくて、そっと寄り添う","ミルクティーとホワイトムスク","ふわふわと、やさしくなじむ香り"],
"AC+A":["霞んだ青藤","#8c98c0","ロシアンブルー","静かに観察して、必要なときだけ寄ってくる","雨のあとの庭と白茶","しっとり澄んだ、落ち着く香り"],
"AC+FC":["すみれ色","#b890e0","モモンガ","ひかえめなのに、ふっと身軽に飛び出す","ベリーとスミレ","ほんのり甘く、ちょっと気まぐれな香り"]
};
var KEYS=["CP","NP","A","FC","AC"];
function danger(lv){
var cp=lv[0],np=lv[1],a=lv[2],fc=lv[3],ac=lv[4],c=[];
if(cp>=3&&np<=2)c.push(["支配",(cp-2)+(3-np),(cp===4&&np<=2)||(cp>=3&&np===1)]);
if(fc>=3&&ac<=2&&a<=2)c.push(["衝動",(fc-2)+(3-ac)+(3-a),(fc===4&&ac===1)||(fc===4&&a===1)]);
if(a>=3&&np<=2&&fc<=2)c.push(["冷徹",(a-2)+(3-np)+(3-fc),a===4&&(np===1||fc===1)]);
if(ac>=3&&fc<=2&&np<=3)c.push(["抑圧",(ac-2)+(3-fc)+(cp>=3?1:0),(ac===4&&fc===1)||(ac>=3&&fc<=2&&cp>=3)]);
if(np===4&&(cp>=3||ac>=3))c.push(["重愛",(np-2)+(cp>=3?1:0)+(ac>=3?1:0),cp>=3&&ac>=3]);
if(!c.length)return null;
c.sort(function(x,y){return y[1]-x[1];});
return c[0][0]+(c[0][2]?"2":"1");
}
var DANGER={
"支配1":["鉄紺","#2f3f58","革と鉄","近寄りがたいほど凛とした、張りつめた香り","ドーベルマン","忠実で隙がなく、守るものには容赦しない"],
"支配2":["黒鉄","#26292f","硝煙と黒胡椒","逆らえない重さのある、息が詰まるほど濃い香り","オオカミ","群れを従え、背を向けることを許さない"],
"衝動1":["朱赤","#d9482b","ガソリンとスパイス","火がつく前の、危うい高揚を含んだ香り","ジャガー","音もなく距離を詰め、一瞬で動く"],
"衝動2":["緋色","#b3122a","火薬と煙草","触れたら燃え移りそうな、荒々しい香り","黒豹","気が向いた瞬間に牙をむく、制御の効かない美しさ"],
"冷徹1":["氷青","#8fb5cf","冷たい金属と氷","感情を見せない、澄んだ冷たい香り","ハヤブサ","感情を挟まず、獲物だけを見て急降下する"],
"冷徹2":["凍てつく鈍色","#5d6770","消毒液と冷たい石","体温を感じさせない、研ぎ澄まされた香り","コブラ","動かずに見据え、迷いなく一撃を放つ"],
"抑圧1":["煤けた藍","#3b4a63","湿った苔と古い木","しんとした奥に、何かを溜め込んだ香り","ヤマネコ","人に慣れず、本音を見せない"],
"抑圧2":["墨紫","#3a2b4a","墨と線香の煙","静けさの底で、じっと熱を抱えた香り","ニシキヘビ","静かに潜み、溜めた力で絡め取る"],
"重愛1":["熟れた葡萄","#6e2b52","熟した果実と蜜蝋","甘さの奥に、手放せない重みのある香り","オシドリ","一途に寄り添い、離れることを恐れる"],
"重愛2":["乾いた血の色","#5b1522","甘ったるい樹脂と煙","甘く絡みついて離れない、濃密な香り","ジョロウグモ","美しい糸を張り、一度捕らえたら離さない"]
};
var BALT={
"CP,NP,A":["深緑","#2f5d50","ウマ","芯が強く、穏やかに人を乗せて走る","ヒノキ、紅茶、はちみつ","落ち着いた森のような、信頼できる香り"],
"CP,NP,FC":["琥珀赤","#b5532a","ヒグマ","面倒見がよく、いざというときは頼もしい","革、バニラ、オレンジ","あたたかく、少し野性味のある香り"],
"CP,NP,AC":["栗色","#7a5640","ウシ","どっしり構えて、辛抱強く支える","ヒノキ、ミルク、白檀","素朴で、いつまでも落ち着く香り"],
"CP,A,FC":["瑠璃紺","#263f7a","ワシ","高い視点と行動力を、同時に持っている","ベチバー、紙、ライム","凛として、少し挑戦的な香り"],
"CP,A,AC":["鈍色","#5e6a78","ゾウ","慎重に、ぶれずに歩み続ける","シダー、インク、白檀","静かで、重みのある香り"],
"CP,FC,AC":["茜色","#b4503c","イノシシ","まっすぐに進みつつ、周りの様子も見ている","スパイス、革、ムスク","ぬくもりと熱のある、力強い香り"],
"NP,A,FC":["翡翠","#3aa38b","カワウソ","賢く遊び、仲間にもやさしい","ミント、はちみつ、レモン","澄んでいて、やさしく弾ける香り"],
"NP,A,AC":["若竹","#7fa36b","シカ","穏やかに様子を見て、必要なときだけ動く","ハーブティー、白茶、ムスク","木漏れ日のような、静かな香り"],
"NP,FC,AC":["桃色","#f0a79c","ネコ","甘え上手で、人の気配にも敏感","ピーチ、ミルク、ムスク","ふんわりとやわらかい香り"],
"A,FC,AC":["水色","#66b3d6","リス","好奇心と用心深さを、器用に使い分ける","ライム、紙、ラベンダー","軽やかで、すっと抜ける香り"],
"CP,NP,A,FC":["オーロラ緑","#4fb59b","キツネ","知恵と愛嬌を、場面で使い分ける","柑橘、樹木、紅茶","明るさと落ち着きが同居した香り"],
"CP,NP,A,AC":["松葉色","#5b7a5a","ゾウガメ","ゆっくり、確実に、長く寄り添う","杉、紅茶、白檀","古い庭のような、深い安心感のある香り"],
"CP,NP,FC,AC":["朱鷺色","#e68f8f","ニホンザル","仲間思いで、場を明るくも厳しくもできる","スパイス、蜂蜜、ムスク","人肌のようにあたたかい香り"],
"CP,A,FC,AC":["鋼青","#4f6f94","ワタリガラス","賢く、よく見て、よく動く","ベチバー、インク、ライム","冴えて、どこか謎めいた香り"],
"NP,A,FC,AC":["薄萌黄","#b6d27a","タヌキ","おだやかに、人の輪に溶け込む","ハーブ、ミルク、レモン","やわらかく、親しみやすい香り"]
};
var MAIN_ADJ={CP:"張りつめた",NP:"ぬくもりの滲む",A:"冴えた",FC:"熱を帯びた",AC:"霞んだ"};
var MAIN_HEX={CP:"#2b3a67",NP:"#f0b94a",A:"#a9bccd",FC:"#f59a3c",AC:"#a995cf",BAL:"#b4cfd6"};
var MAIN_NOTE={CP:"ベチバー",NP:"ベンゾイン",A:"紙とインク",FC:"ブラッドオレンジ",AC:"白檀",BAL:"ベルガモット"};
var SUB={
CP:["鋼の艶を帯びる","#3b5b9a","ヒノキ"],NP:["ぬくもりを残す","#e0a23a","バニラ"],A:["冷たい光を含む","#8fa5b8","ミント"],
FC:["朱が差す","#e5732b","ライム"],AC:["藤の霞がかかる","#9a7fc0","ムスク"]
};
var LOW={
CP:"余韻は、力の抜けた青い草のよう",NP:"余韻は、冷えた金属のよう",A:"余韻は、理屈抜きで揺れる花のよう",
FC:"余韻は、静まり返った墨のよう",AC:"余韻は、遠慮なく刺す香辛料のよう","=":"余韻は、どこにも偏らない透明感"
};
var LOW_PRI=["AC","FC","A","NP","CP"];
var CORE={
levelsOf:function(code){return code.split("").map(function(g){return 4-"ABCD".indexOf(g);});},
typeOf:function(code){
var lv=CORE.levelsOf(code),max=Math.max.apply(null,lv),tops=[];
lv.forEach(function(v,i){if(v===max)tops.push(i);});
if(tops.length>=3)return{main:"BAL",sub:null};
var prio=[3,1,2,0,4],main,sub;
if(tops.length===2){var ordered=prio.filter(function(p){return tops.indexOf(p)>=0;});main=ordered[0];sub=ordered[1];}
else{main=tops[0];var rest=prio.filter(function(p){return p!==main;});sub=rest.reduce(function(best,p){return lv[p]>lv[best]?p:best;},rest[0]);}
return{main:KEYS[main],sub:KEYS[sub]};
}
};
function hex2(h){return[1,3,5].map(function(i){return parseInt(h.substr(i,2),16);});}
function mix(h1,h2,t){
var a=hex2(h1),b=hex2(h2);
return"#"+a.map(function(v,i){var x=Math.round(v*(1-t)+b[i]*t);return(x<16?"0":"")+x.toString(16);}).join("");
}
function of(code){
var C=CORE,tp=C.typeOf(code),lv=C.levelsOf(code);
var sub=(tp.main!=="BAL"&&tp.sub&&lv[KEYS.indexOf(tp.sub)]>=3)?tp.sub:"";
var sum=lv.reduce(function(p,v){return p+v;},0);
var mn=Math.min.apply(null,lv),allSame=lv.every(function(v){return v===lv[0];});
var low=allSame?"=":LOW_PRI.filter(function(k){return lv[KEYS.indexOf(k)]===mn;})[0];
var dg=tp.main==="BAL"?null:danger(lv),sp=sub?SUB[sub]:null;
var key=sub?tp.main+"+"+sub:tp.main,base=IMG[key]||IMG[tp.main];
var tops="";
if(tp.main==="BAL"){
var mx=Math.max.apply(null,lv);tops=KEYS.filter(function(k,i){return lv[i]===mx;}).join(",");
if(BALT[tops]){key="BAL:"+tops;base=BALT[tops];}
}
var state=tp.main==="BAL"?"tops:"+tops:dg?dg:sub?"s"+sub:(sum<=9?"n0":sum>=14?"n2":"n1");
if(!dg){
var hex=sum<=9?mix(base[1],"#ffffff",0.35):sum>=14?mix(base[1],"#000000",0.12):base[1];
return{key:key,state:state,low:low,danger:"",color:(sum<=9?"淡い":"")+base[0],hex:hex,animal:base[2],animalWhy:base[3],
scent:base[4],scentWhy:base[5]+"。"+LOW[low]};
}
var d=DANGER[dg],h=mix(d[1],MAIN_HEX[tp.main],0.25);
if(sp)h=mix(h,sp[1],0.15);
return{key:key,state:state,low:low,danger:dg,color:MAIN_ADJ[tp.main]+d[0]+(sp?"（"+sp[0]+"）":""),hex:h,
animal:d[4],animalWhy:d[5],
scent:MAIN_NOTE[tp.main]+"、"+d[2]+(sp?"、かすかに"+sp[2]:""),
scentWhy:d[3]+"。"+LOW[low]};
}
window.HK.EgoImage={of:of};
})();
});
;
/* ==== js/omega-detective.js ==== */
HK.Load.def(99,'js/omega-detective.js',function(){
(function(){
'use strict';
var HK=window.HK,OM=HK.OMEGA;
var D=OM.DET={};
function L(s){return s.split('|');}
function isDet(c){return c.om.job==='pi';}
function isAsst(c){return c.om.job==='assistant';}
D.buddy=function(a,b){return(isDet(a)&&isAsst(b))||(isAsst(a)&&isDet(b));};
function sleuth(c){return isDet(c)||isAsst(c)||c.om.job==='detective'||c.om.job==='police';}
D.buddyCtx=function(ctx,a,b){
if(D.buddy(a,b))return true;
var t=HK.Ties&&HK.Ties.get(ctx,a,b);
return!!(t&&t.type==='buddy'&&(sleuth(a)||sleuth(b)));
};
D.order=function(a,b){
var r=function(c){return isDet(c)?3:c.om.job==='detective'?2:c.om.job==='police'?1:0;};
return r(a)>=r(b)?[a,b]:[b,a];
};
var PLACE=L('高級ホテルのスイートルーム|閉館後の美術館|港の倉庫街|老舗旅館の離れ|会員制のαクラブ|Ω専用シェルターの屋上|雪に閉ざされた山荘|深夜の大学病院');
var VICTIM=L('製薬会社の社長|抑制剤の研究者|有名なαの俳優|番を持たないΩの資産家|β専門の結婚相談所の所長|地方議員|フェロモン香水の調香師|元・刑事');
var MOTIVE=L('番を奪われた恨み|偽造抑制剤の利権|運命の番をめぐる嫉妬|第二性を偽っていた秘密|スイッチを隠していた過去|遺産と番契約|Ωへの差別への復讐|十年前の未解決事件');
var CULPRIT=L('被害者の番|第一発見者の秘書|穏やかな顔をした主治医|被害者の運命の番|口数の少ないバーテンダー|被害者の双子のきょうだい|事件を通報した隣人|捜査の初日から協力的だった刑事');
var TRICK=L('香水で消されたフェロモンの痕跡|抑制剤の空き瓶の数の違い|うなじの噛み跡の向き|発情期の周期表に書き足された一行|αにしか届かない高さの指紋|βには分からないはずの匂いの記述|時計の止まった時刻と、雨が止んだ時刻のずれ');
var ST=[
{n:'依頼',t:L('「{place}で、{victim}が死体で見つかった｜＝｜{place}で、{victim}が死体で見つかりました」――警察からの電話を切った{a}が振り返ると、{b}はもうコートを手にしていた。|事務所の扉を叩いたのは、{victim}の家族だった。「警察は自殺だと言うんです」――{a}と{b}は顔を見合わせた。|新聞の片隅に、{place}での{victim}の死が小さく載っていた。{a}は記事を指で叩いた。「これは殺しだ｜＝｜これは殺しです」'),fx:{ab:{trust:3},ba:{trust:3}}},
{n:'現場',t:L('{place}の床に這いつくばる{a}の呟きを、{b}は一字一句漏らさず手帳に書き留めた。|現場に残った匂いに、{a}が眉をひそめた。「{trick}……妙だな｜{trick}……妙だ｜{trick}……妙ですね」{b}はすかさず写真を撮った。|{b}が見落としかけた小さな傷を、{a}が指差した。「ここだ｜＝｜ここです」――二人の頭がぶつかりそうなほど近づいた。'),fx:{ab:{trust:4,aff:2},ba:{trust:5}}},
{n:'聞き込み',t:L('{b}は人当たりのよさで関係者の口を開かせ、{a}は横で黙って相手の目の動きを見ていた。|張り込みの車の中で、{a}と{b}は一つのあんぱんを半分に分けた。夜明けまで、話は尽きなかった。|動機は「{motive}」らしい。{b}が聞き出した証言に、{a}は珍しく「よくやった｜＝｜よくやりましたね」と言った。'),fx:{ab:{aff:4,trust:4},ba:{aff:5,att:3}}},
{n:'危機',t:L('犯人に気づかれた。夜道で{b}が背後から襲われ、駆けつけた{a}が身を挺して庇った。{a}の腕から血が流れていた。「……無事か｜＝｜……無事ですか」|{a}が犯人に追い詰められた瞬間、{b}が消火器を振りかぶって割って入った。「先生に何すんだ！｜先生に何をする！｜先生に何をするんですか！」|{b}が囮を買って出た。物陰で待つ{a}は、{b}の足音が途切れるたびに息が止まりそうだった。'),fx:{ab:{att:8,aff:8,trust:8},ba:{att:9,aff:8,trust:10}},mag:25},
{n:'推理',t:L('関係者を集めた{a}は、静かに告げた。「犯人は――{culprit}、あなただ｜＝｜犯人は――{culprit}、あなたです」決め手は、{b}が拾った「{trick}」だった。|{a}の推理が一点で詰まったとき、{b}が「{trick}」と呟いた。{a}は目を見開き、それから笑った。「……そういうことか｜＝｜……そういうことですか」犯人は{culprit}だった。|{culprit}が膝をついた。動機は「{motive}」。{a}は{b}にだけ聞こえる声で「あなたのおかげだ｜＝｜あなたのおかげです」と言った。'),fx:{ab:{trust:10,aff:6},ba:{trust:8,aff:6,att:4}},mag:20},
{n:'余韻',t:L('事件のあと、二人は事務所で冷めたコーヒーを飲んだ。{b}が「お疲れさま｜お疲れ｜お疲れさまでした」と言うと、{a}は「あなたもね｜あなたもだ｜あなたもお疲れさまでした」と、{b}の頭を雑に撫でた。|{a}は事件の報告書の最後に、助手の欄へ{b}の名前を丁寧に書き足した。|帰り道、{b}は{a}の包帯を巻き直した。「無茶しないでよ｜無茶をするな｜無茶しないでくださいよ」「あなたがいるから無茶できる｜＝｜あなたがいるから無茶できるんです」'),fx:{ab:{aff:6,att:4},ba:{aff:6,att:5}}}
];
var BANTER=L('{b}「先生、また靴下が左右違うよ｜先生、また靴下が左右違う｜先生、また靴下が左右違います」{a}「推理に支障はない｜＝｜推理に支障はありません」|{a}は{b}の淹れたコーヒーにしか口をつけなかった。本人は気づいていない。|{a}「あなたは私の脳の外付けメモリだ｜＝｜あなたは私の脳の外付けメモリです」{b}「褒めてる？｜褒めているのか？｜褒めていますか？」{a}「最大級に」|{b}は{a}の散らかった机を片づけながら、「先生がいないと困る人、結構いるよ｜先生がいないと困る人は、結構いる｜先生がいないと困る人、結構いますよ」と言った。{a}は「あなたは？｜あなたはどうだ？｜あなたはどうですか？」と訊きそうになって、やめた。|{a}が徹夜明けにソファで寝落ちすると、{b}は黙って毛布をかけた。|依頼人に「お二人は番なんですか」と訊かれて、{a}と{b}は同時に「違う｜＝｜違います」と答えた。|{b}は{a}の推理を一番近くで聞ける助手の席が、実は気に入っていた。|{a}は事件のない日、{b}を理由もなく食事に誘った。「推理の燃料だ｜＝｜推理の燃料です」と言い張った。');
var SOLO=L('{a}は依頼人のいない事務所で、未解決事件のファイルを一人でめくっていた。|{a}は助手がいない分、聞き込みも張り込みも一人でこなした。帰りの電車で、少しだけ誰かと話したくなった。|{a}は一人で殺人事件を解決した。祝ってくれる相手はいなかった。');
function fill(ctx,s,a,b,cs){
return ctx.t(s.replace(/\{place\}/g,cs.place).replace(/\{victim\}/g,cs.victim).replace(/\{motive\}/g,cs.motive).replace(/\{culprit\}/g,cs.culprit).replace(/\{trick\}/g,cs.trick),a,b);
}
function newCase(ctx){
var r=ctx.rng;
return{stage:0,place:r.pick(PLACE),victim:r.pick(VICTIM),motive:r.pick(MOTIVE),culprit:r.pick(CULPRIT),trick:r.pick(TRICK)};
}
D.events=[
{
id:'det_case',label:'探偵と助手で事件を追う',cat:'bond',scope:'pair',pri:true,
when:function(ctx,a,b){
if(!D.buddyCtx(ctx,a,b))return false;
var st=ctx.om.det;
return st.cur?st.lastStep!==ctx.stepIndex:ctx.stepIndex-(st.doneAt==null? -9:st.doneAt)>=4;
},
w:function(){return 2.4;},
run:function(ctx,a,b){
var st=ctx.om.det,ab=D.order(a,b),A=ab[0],W=ab[1];
if(!st.cur){st.cur=newCase(ctx);st.n++;}
var cs=st.cur,S=ST[cs.stage];
st.lastStep=ctx.stepIndex;
if(S.fx.ab)ctx.mod(A,W,S.fx.ab);
if(S.fx.ba)ctx.mod(W,A,S.fx.ba);
var text='【事件'+st.n+'・'+S.n+'】'+fill(ctx,ctx.pick(S.t),A,W,cs);
cs.stage++;
if(cs.stage>=ST.length){st.cur=null;st.doneAt=ctx.stepIndex;st.solved++;}
return{cat:cs.stage===4?'help':'bond',text:text,why:OM.jobName(A)+'（'+A.name+'）と'+OM.jobName(W)+'（'+W.name+'）のバディ',mag:S.mag||10};
}
},
{
id:'det_banter',label:'探偵と助手の日常のかけあい',cat:'bond',scope:'pair',
when:function(ctx,a,b){return D.buddyCtx(ctx,a,b);},
w:function(){return 1.1;},
run:function(ctx,a,b){
var ab=D.order(a,b);
ctx.mod2(ab[0],ab[1],{aff:3,trust:3},{aff:3,trust:3,att:2});
return{text:ctx.t(ctx.pick(BANTER),ab[0],ab[1]),why:'バディの日常'};
}
},
{
id:'det_solo',label:'助手のいない探偵のひとり仕事',cat:'solo',scope:'solo',
when:function(ctx,a){return isDet(a)&& !ctx.present().some(function(o){return isAsst(o);});},
w:function(){return 0.6;},
run:function(ctx,a){ctx.stress(a,3);return{text:ctx.t(ctx.pick(SOLO),a),why:'助手のいない探偵'};}
}
];
})();
});
;
/* ==== js/solo-kit.js ==== */
HK.Load.def(141,'js/solo-kit.js',function(){
(function(){
'use strict';
var HK=window.HK,DG=HK.DG;
var clamp=HK.clamp;
var K=HK.SoloKit={};
K.W_CL='高鳴り';
K.hero=function(S,src,pc){
var rng=S.rng,scen=S.scen;
var h={
i:0,name:src.name,eg:src.eg,memo:src.memo||'',tr:HK.traits(src.eg),
stats:{},hp:100,pleasure:0,sens:1,corrupt:0,climax:0,dev:{},curses:[],items:[],cloth:4,
gender:src.gender||'',likes:src.likes||'',tone:src.tone||'',fp:src.fp||'',pos:src.pos||'',
ng:Array.isArray(src.loveNG)?src.loveNG.filter(function(x){return x>=0;}):[]
};
if(HK.charFlags)HK.charFlags(src,h,scen&&scen.id);
h.top=HK.egoType(src.eg).top;
h.reason=clamp(55+h.eg.A*1.1+h.eg.CP*0.9,40,100);
h.persona=HK.personaOf(h);
(scen.stats||[]).forEach(function(s){var v=pc.stats&&pc.stats[s.id];h.stats[s.id]=v==null||v==='random'?1+rng.int(5): +v;});
function resolve(list,p){
if(!list|| !list.length)return{id:'',label:''};
if(p&&p!=='auto')for(var k=0;k<list.length;k++)if(list[k].id===p)return list[k];
return HK.weighted(rng,list,function(o){return Math.pow(Math.max(0.02,o.fit(h.tr)),3);});
}
h.action=resolve(scen.actions,pc.action);h.goal=resolve(scen.goals,pc.goal);
h.autoAction= !pc.action||pc.action==='auto';h.autoGoal= !pc.goal||pc.goal==='auto';
return h;
};
K.state=function(input,scenId){
var scen=HK.SCENARIOS[scenId],env={};
scen.env.forEach(function(e){env[e.id]=input.env&&input.env[e.id]!=null?input.env[e.id]:e.def;});
env.ct=input.env&&input.env.ct!=null?String(input.env.ct):'';
if(HK.Dark)HK.Dark.keep(input.env,env);else env.heavy='normal';
var S={scen:scen,rng:HK.rng(input.seed),env:env,log:[],hist:[],turns:[],recent:[],flags:{},cnt:{},q:[],step:0,label:''};
S.h=K.hero(S,input.chars[0],(input.perChar&&input.perChar[0])||{});
S.party=[S.h];
return S;
};
K.pick=function(S,arr){
var U=S._kUse=S._kUse||new Map(),free=[],i,t;
function k(x){return typeof x==='string'?'$'+x:x;}
for(i=0;i<arr.length;i++)if(!U.get(k(arr[i])))free.push(arr[i]);
if(free.length)t=free[S.rng.int(free.length)];
else{t=arr[0];for(i=1;i<arr.length;i++)if(U.get(k(arr[i]))<U.get(k(t)))t=arr[i];}
S._kUseN=(S._kUseN||0)+1;U.set(k(t),S._kUseN);
S.recent.push(t);if(S.recent.length>24)S.recent.shift();
return t;
};
var DUNGEON_RE= /迷宮|罠|魔物|次の部屋|冒険者|宝箱|階層|最深部|ダンジョン|魔導|呪い/;
K.DUNGEON_RE=DUNGEON_RE;
K.noDg=function(S,arr){
if(!arr||(S.scen&&S.scen.id==='dungeon'))return arr||[];
return arr.filter(function(x){return!DUNGEON_RE.test(String(x));});
};
K.climaxPool=function(S,h){
var sg=K.stage(h),base=DG.CLIMAX[h.persona][sg],id=S.scen&&S.scen.id;
if(id==='dungeon')return base;
var f=base.filter(function(x){return!DUNGEON_RE.test(x);}),x=K.CLIMAX_SOLO&&K.CLIMAX_SOLO[h.persona]&&K.CLIMAX_SOLO[h.persona][sg];
return(f.length?f:base).concat(x||[]);
};
K.fmt=function(S,str,vars){
var v=vars||{};
return String(str).replace(/\{([a-z]+)\}/g,function(m,k){
if(k==='a')return S.h.name;
if(v[k]!=null)return v[k];
if(S.vars&&S.vars[k]!=null)return S.vars[k];
return m;
});
};
K.say=function(S,o){
o.n=S.log.length;o.room=S.step;o.floor=0;
o.v={r:Math.round(Math.max(0,S.h.reason)),p:Math.round(S.h.pleasure),c:Math.round(S.h.corrupt)};
if(o.kind!=='step'&&HK.EroScene&&HK.EroScene.hit(S,o))o.lewd=true;
S.log.push(o);
return o;
};
K.step=function(S,label){S.label=label;return K.say(S,{kind:'step',text:label});};
K.key=function(S,o,why){o.key=true;S.turns.push({n:o.n,why:why});};
K.stage=function(h){return h.corrupt<20?0:h.corrupt<40?1:h.corrupt<60?2:h.corrupt<80?3:4;};
K.will=function(h){return clamp(h.tr.cp*0.35+h.tr.a*0.25+h.reason/100*0.4,0,1);};
K.tail=function(S,p,noBody){
var h=S.h,sg=K.stage(h);
if(S.rng()>(p==null?0.45:p))return'';
if(!noBody&&DG.ENDURE&&sg<=2&&S.rng()<0.4){var en=K.noDg(S,DG.ENDURE[h.persona]);return en.length?' '+K.fmt(S,K.pick(S,en)):'';}
var tl=K.noDg(S,DG.TAILS[h.persona][sg]);
return tl.length?' '+K.fmt(S,K.pick(S,tl)):'';
};
K.moan=function(S){
var h=S.h,l=DG.MOAN&&DG.MOAN[h.persona];
if(HK.Moan&&HK.Moan.say){var sg=K.stage(h),mv=HK.Moan.say(S,h,'climax',{novel:true,force:sg<=1&&K.will(h)>=0.45,fall:sg>=3},l&&l.length?function(){return K.pick(S,l);}:null);return mv?'「'+mv+'」':'';}
return'「'+K.pick(S,l)+'」';
};
K.stim=function(S,power,opt){
opt=opt||{};
var h=S.h,rng=S.rng;
var part=opt.part||'all';
var dev=part==='all'?0:h.dev[part]||0;
var lew=S.env.harsh!=null?S.env.harsh:S.env.wild!=null?S.env.wild:S.env.lewd!=null?S.env.lewd:55;
var gain=power*(0.55+lew/100*0.9)*h.sens*(1+dev*0.13)*(opt.mult||1)*rng.range(0.8,1.2);
var w=K.will(h);
gain*=1.12-w*0.42;
if(opt.mind)gain*=1.15-h.tr.cold*0.35;
if(opt.shame)h.reason-=2+h.tr.ac*4;
h.pleasure+=gain;
h.reason-=gain*(0.13+(opt.mind?0.08:0))*(1-w*0.45)*(S.k||1);
if(part!=='all')h.dev[part]=Math.min(10,(h.dev[part]||0)+1);
else DG.PART_ORDER.forEach(function(k){h.dev[k]=Math.min(10,(h.dev[k]||0)+0.25);});
var out=[];
while(h.pleasure>=100&&out.length<4)out.push(K.climax(S,{silent:opt.defer||opt.silent}));
return{gain:gain,climaxes:out};
};
K.climax=function(S,opt){
var h=S.h,rng=S.rng;
h.climax++;
var w=K.will(h);
var gainC=4.5+h.climax*1.25+h.tr.fc*4+h.tr.ac*3-h.tr.cp*3;
h.corrupt+=Math.max(3,gainC*1.4)*(S.k||1);
h.reason-=(4+h.climax)*(1-w*0.4)*(S.k||1);
h.sens+=0.05;
h.pleasure=15+rng.int(20);
var text=(rng()<0.5?K.moan(S):'')+K.fmt(S,K.pick(S,K.climaxPool(S,h)));
if(opt&&opt.silent)return text;
var o=K.say(S,{kind:'climax',tag:K.W_CL,text:text,why:h.climax===1?'初めての'+K.W_CL:h.climax+'回目'});
if(h.climax===1)K.key(S,o,'最初の'+K.W_CL);
return text;
};
K.logClimax=function(S,list){
list.forEach(function(text){
var o=K.say(S,{kind:'climax',tag:K.W_CL,text:text,why:S.h.climax===1?'初めての'+K.W_CL:''});
if(S.h.climax===1&& !S.flags.firstKey){S.flags.firstKey=true;K.key(S,o,'最初の'+K.W_CL);}
});
};
K.settle=function(S){
var h=S.h;
h.reason=clamp(h.reason,-5,100);
if(h.reason<50)h.corrupt+=(50-h.reason)/8*(S.k||1);
if(h.pleasure>70)h.corrupt+=1.2*(S.k||1);
h.corrupt=clamp(h.corrupt,0,100);h.pleasure=clamp(h.pleasure,0,100);h.sens=clamp(h.sens,0.6,3.5);
if(h.reason<=0)h.corrupt=100;
if(h.corrupt>=100){h.fallen=true;return true;}
return false;
};
K.snap=function(S,extra){
var h=S.h,o={n:S.log.length,f:0,r:Math.round(Math.max(0,h.reason)),p:Math.round(h.pleasure),c:Math.round(h.corrupt),hp:Math.round(h.hp)};
if(extra)for(var k in extra)o[k]=extra[k];
S.hist.push(o);
};
K.finish=function(S,input,E,advice,extra){
var h=S.h;
if(E&&Array.isArray(E.lines)&&HK.Dark&&HK.Dark.note(S))E.lines.push(HK.Dark.note(S));
var hero={
i:0,name:h.name,eg:h.eg,memo:h.memo,top:h.top,persona:h.persona,tone:h.tone,stats:h.stats,tr:h.tr,
action:h.action.label,goal:h.goal.label,goalId:h.goal.id,autoAction:h.autoAction,autoGoal:h.autoGoal,
reason:Math.max(0,Math.round(h.reason)),pleasure:Math.round(h.pleasure),corrupt:Math.round(h.corrupt),hp:Math.round(h.hp),
sens:Math.round(h.sens*100)/100,climax:h.climax,dev:h.dev,cloth:h.cloth,curses:[],items:[],fate:E.kind==='over'?'陥落':'',fallTitle:'',fallText:''
};
var res={
solo:true,scenId:S.scen.id,seed:input.seed,env:S.env,input:input,hero:hero,heroes:[hero],party:false,noGear:true,
log:S.log,hist:S.hist,turns:S.turns,cnt:S.cnt,ending:E,advice:advice,stepCount:S.hist.length-1,mids:[],boss:'',themeLabel:S.scen.name,reached:1,floors:1
};
if(extra)for(var k in extra)res[k]=extra[k];
res.outcome=E.title;
res.summary=h.name+'：'+E.title;
res.chars=[{name:h.name,i:0}];
return res;
};
})();
});
;
/* ==== js/endings.js ==== */
HK.Load.def(149,'js/endings.js',function(){
(function(){
'use strict';
var HK=window.HK;
var E=(HK.Endings={});
var CIRC='①②③④⑤⑥⑦⑧⑨⑩⑪⑫⑬⑭⑮⑯⑰⑱⑲⑳';
function ctxOf(res){
var C=res.chars;
var nm=function(i){return C[i].name;};
var pair=function(a,b){
var lo=Math.min(a,b),hi=Math.max(a,b);
return res.pairs.filter(function(p){return p.a===lo&&p.b===hi;})[0];
};
var names=function(list,k){
k=k||10;
var arr=list.map(function(c){return typeof c==='number'?nm(c):c.name;});
return arr.length>k?arr.slice(0,k).join('・')+'ほか'+(arr.length-k)+'人（計'+arr.length+'人）':arr.join('・');
};
var byFate=function(re){return C.filter(function(c){return re.test(c.fate);});};
var livePair=function(p){return!(C[p.a]&&C[p.a].alive===false)&& !(C[p.b]&&C[p.b].alive===false);};
var withLabel=function(ids){return res.pairs.filter(function(p){return ids.indexOf(p.label)>=0&&livePair(p);});};
var pn=function(p){return nm(p.a)+'×'+nm(p.b);};
if(HK.pairName)pn=function(p){return HK.pairName(res,p);};
var pn2=function(a,b){return pn({a:a,b:b});};
return{C:C,nm:nm,pair:pair,names:names,byFate:byFate,withLabel:withLabel,pn:pn,pn2:pn2,livePair:livePair};
}
function mainPairs(res,X,skip){
return res.pairs.filter(function(p){return p.label!=='strangers'&&(!skip|| !skip(p));})
.sort(function(a,b){return b.intensity-a.intensity;}).slice(0,3)
.map(function(p){return X.pn(p)+'＝'+(p.tie?((HK.Sib&&HK.Sib.resLabel(p.tie,res))||p.tie.label)+'→':'')+p.name+(p.surprise?'（意外）':'')+(X.livePair&& !X.livePair(p)&& /^(?:love|night|pine|friend|partner|guard|obsess)$/.test(p.cls||'')?'（死別）':'');});
}
function deathLines(res,X){
var dead=X.C.filter(function(c){return!c.alive&&c.deathLabel;});
dead.sort(function(a,b){
var ia=res.log.findIndex?res.log.findIndex(function(e){return e.kind==='death'&&e.actors[0]===a.i;}):0;
var ib=res.log.findIndex?res.log.findIndex(function(e){return e.kind==='death'&&e.actors[0]===b.i;}):0;
return ia-ib;
});
var lines=dead.map(function(c,k){
return(CIRC.charAt(k)||'・')+' '+c.deathLabel+'　'+c.name+'　'+(c.killedBy!=null?X.nm(c.killedBy)+'の手で。':'')+(c.deathHow||'');
});
var late=X.C.filter(function(c){return!c.alive&& !c.deathLabel;});
if(late.length)lines.push((CIRC.charAt(dead.length)||'・')+' 最後に　'+(late.length>10?'残っていた'+late.length+'人全員':X.names(late))+'　'+(late[0].fateNote||''));
return lines;
}
E.deathLines=function(res,X){return deathLines(res,X);};
E.ctxOf=ctxOf;
E.build=function(res){
var f=E[res.scenId];
var X=ctxOf(res);
var out=f?f(res,X):{headline:res.outcome||'',stats:[],lines:[]};
(res.end.notes||[]).forEach(function(l){out.lines.push(l);});
if(HK.Dark&&HK.Dark.note(res))out.lines.push(HK.Dark.note(res));
var mp=mainPairs(res,X);
if(mp.length)out.lines.push('主な関係：'+mp.join('、'));
if(HK.Epilogue)HK.Epilogue.build(res,out);
return out;
};
E.omega=function(res,X){
var O=res.end.omega||{},SX={a:'α',b:'β',o:'Ω'},lines=[],EN=O.ending;
var head=EN?'結末「'+EN.title+'」――'+EN.text+(EN.timeout?'（3年見守っても、それ以上は動かなかった）':''):'';
(EN&&EN.others||[]).forEach(function(o){lines.push(o.text);});
X.C.forEach(function(c,i){lines.push(c.name+'　'+SX[O.orig[i]]+(O.orig[i]!==O.sex[i]?'→'+SX[O.sex[i]]:'')+'・'+O.job[i]+'　'+c.fate);});
(O.quit||[]).forEach(function(i){lines.push(X.nm(i)+'：スイッチで'+SX[O.sex[i]]+'になり、'+O.job[i]+'を辞めることになった。');});
var dates=O.dates||[];
if(dates.length){
var last={};
dates.forEach(function(d){last[d.a+'-'+d.b]=d;});
Object.keys(last).slice(0,3).forEach(function(k){var d=last[k];lines.push(X.pn2(d.a,d.b)+'の最近のデート：'+d.place);});
}
if((O.gifts||[]).length){var g=O.gifts[O.gifts.length-1];lines.push('最後の贈り物：'+X.nm(g.from)+'→'+X.nm(g.to)+'「'+g.name+'」');}
if(O.cases)lines.push('探偵と助手が解決した事件：'+O.cases+'件');
return{
headline:head,
stats:[['結末まで',O.months+'か月'],['カップル',(O.couples||[]).length+'組'],['番',(O.couples||[]).filter(function(c){return c[2];}).length+'組'],['愛咬',(O.amagami||0)+'回'],['デート',dates.length+'回'],['発情期',(O.heats||0)+'回']],
lines:lines
};
};
E.whiteroom=function(res,X){
var ex=res.end.exits,room=res.end.room||{};
var LF=room.left&&HK.RoomLeft?room.left:null,later=LF&&LF.rescued?LF.who:[];
var isLater=function(c){return later.indexOf(c.i)>=0;};
var out=X.byFate(/脱出/).filter(function(c){return!isLater(c);});
var stayed=X.C.filter(function(c){return/自分から残った/.test(c.fate)||(isLater(c)&&LF.stayed.indexOf(c.i)>=0);});
var left=X.C.filter(function(c){return stayed.indexOf(c)<0&&(!/脱出/.test(c.fate)||isLater(c));});
var isOne=HK.roomOnlyOne?HK.roomOnlyOne(res.env):HK.roomRules(res.env)[0].k==='one';
var headline,lines=['部屋：「'+(room.label||HK.roomLabel(res.env))+'」'];
if(isOne){
var e=ex[0];
if(!e)headline='誰も扉をくぐれなかった。全員がまだ部屋の中にいる。';
else if(e.how==='sacrifice')headline=X.nm(e.b)+'が'+X.nm(e.a)+'を外へ逃がし、自分は部屋に残った。';
else headline=X.nm(e.a)+'だけが、'+X.names(left)+'を置いて部屋を出た。';
if(e)lines.push(e.label+'　'+(e.how==='sacrifice'?X.nm(e.b)+'が'+X.nm(e.a)+'の背中を押した':X.nm(e.a)+'が'+X.nm(e.b)+'の隙をついた'));
}else{
var pairs=ex.filter(function(e){return e.group==null;}),group=ex.filter(function(e){return e.group!=null&& !e.trio;})[0];
var trios=ex.filter(function(e){return e.trio;});
if(group)headline='条件を満たし、'+X.names(group.group)+'が全員で部屋を出た。';
else if(trios.length)headline=trios.map(function(e){return X.names(e.group)+'の'+(['','','二人','三人','四人','五人'][e.group.length]||e.group.length+'人');}).join('と')+'が、一緒に条件を満たした。'+(pairs.length?'ほかに'+pairs.map(function(e){return X.nm(e.a)+'×'+X.nm(e.b);}).join('、')+'も成立。':'')+(left.length?X.names(left)+'は取り残された。':'');
else if(pairs.length)headline=pairs.map(function(e){return X.pn2(e.a,e.b);}).join('、')+(pairs.length>1?' の'+pairs.length+'組':'')+'が成立。'+(left.length?X.names(left)+'は取り残された。':'');
else headline='誰も条件を満たせず、'+(left.length>2?'全員':X.names(left))+'が部屋に取り残された。';
if(stayed.length)headline+=X.names(stayed)+'は条件を満たしたが、自分から部屋に残った。';
var along=[];ex.forEach(function(e){(e.along||[]).forEach(function(i){if(along.indexOf(i)<0)along.push(i);});});
if(along.length)headline+=X.names(along)+'は、条件を満たした人と一緒に部屋を出た。';
if(out.length)headline+=out.length+'人で脱出した。';
ex.forEach(function(e){
if(e.along&&e.along.length)lines.push(e.label+'　'+X.names(e.along)+'　'+(e.group?X.names(e.group):X.pn2(e.a,e.b))+'が条件を満たして開いた扉から、一緒に脱出');
if(e.trio){lines.push(e.label+'　'+X.names(e.group)+'　'+(['','','二人','三人','四人','五人'][e.group.length]||e.group.length+'人')+'で一緒に条件を満たして脱出。部屋を出たあとは「'+(e.bondLabel||'―')+'」');return;}
if(e.group!=null)return;
var p=X.pair(e.a,e.b);
lines.push(e.label+'　'+X.pn2(e.a,e.b)+'　条件を満たして'+(e.stay!=null?X.nm(e.a)+'が脱出（'+X.nm(e.stay)+'は自分から残った）':'脱出')+'。部屋を出たあとの関係は「'+(p?p.name:'―')+'」');
});
if(group)lines.push(group.label+'　全員で脱出');
}
if(LF){
headline+=HK.RoomLeft.note(res,X);
lines.push('取り残された人の結末：'+LF.title+(LF.id==='friend'&&LF.by&&LF.by.length?'（'+X.nm(LF.by[0])+'が外から扉を開けた）':''));
(LF.vows||[]).forEach(function(v){lines.push(X.nm(v.a)+'：'+X.nm(v.b)+'に'+{hate:'借りを返すと誓った',obsess:'必ず会いに行くと決めた',lovehate:'もう一度会うと誓った（愛憎）',abandon:'置いていかれた恨みを忘れないと誓った'}[v.k]);});
}
(room.consumed||[]).forEach(function(c){
lines.push(c.item+'：'+c.total+'/'+c.n+c.unit+(c.by.length?'（'+c.by.map(function(x){return X.nm(x.i)+' '+x.n+c.unit;}).join('・')+'）':''));
});
left.forEach(function(c){
var best=res.pairs.filter(function(p){return(p.a===c.i||p.b===c.i)&&p.label!=='strangers';}).sort(function(a,b){return b.intensity-a.intensity;})[0];
lines.push(c.name+'：'+(isLater(c)?c.fateNote:c.fate)+(best?'。最後に残った感情は'+X.nm(best.a===c.i?best.b:best.a)+'への「'+best.name+'」':''));
});
if(LF)HK.RoomLeft.afterLines(res).forEach(function(l){lines.push(l);});
var con=(room.consumed||[])[0];
return{
headline:headline,
stats:[['脱出',out.length+'人'+(later.length?'＋あとから'+later.length+'人':'')],['成立したペア',(function(){var pn=ex.filter(function(e){return e.group==null&& !e.how;}).length,tn=ex.filter(function(e){return e.trio;}).length;return tn?(pn?pn+'組＋':'')+'三人で'+tn+'組':pn+'組';})()],['取り残し',left.length+'人']].concat(con?[[con.item,con.total+'/'+con.n+con.unit]]:[['経過',res.stepCount+'時間']]),
lines:lines
};
};
E.goukon=function(res,X){
var tg=res.end.together,lines=[];
var couples=X.withLabel(['lovers']);
var night=tg.filter(function(t){return t.night&& !t.cage;}),cage=tg.filter(function(t){return t.cage;});
var headline=tg.length
?tg.map(function(t){return X.pn2(t.a,t.b);}).join('、')+'が二人で店を出た'+(night.length||cage.length?'（うち'+[night.length?night.length+'組はお持ち帰り':'',cage.length?cage.length+'組は途中で抜けた（監禁）':''].filter(Boolean).join('、')+'）':'')+'。'
:'誰も二人きりでは帰らなかった。';
if(couples.length)headline+='カップル成立：'+couples.map(X.pn).join('、')+'。';
tg.forEach(function(t){
var p=X.pair(t.a,t.b);
lines.push(X.pn2(t.a,t.b)+'　'+(t.cage?'途中で店を抜けた（'+X.nm(t.a)+'による監禁）':t.night?'お持ち帰り':'一緒に帰った')+'。関係は「'+(p?p.name:'―')+'」');
});
var solo=X.byFate(/一人で帰った/),crushed=X.byFate(/潰れた/);
if(solo.length)lines.push('一人で帰った：'+X.names(solo));
if(crushed.length)lines.push('潰れた：'+X.names(crushed));
var kusG=X.withLabel(['kusare','kusare1']);
if(kusG.length)lines.push('腐れ縁（愛憎）：'+kusG.map(X.pn).join('、'));
var kenG=couples.filter(function(p){return p.lh==='couple';}),kinG=X.withLabel(['lhkin','lhkin1']);
if(kenG.length)lines.push('喧嘩ばかりの恋人：'+kenG.map(X.pn).join('、'));
if(kinG.length)lines.push('口の悪い家族：'+kinG.map(X.pn).join('、'));
var ones=X.withLabel(['oneway']);
if(ones.length)lines.push('片想いのまま：'+ones.map(function(p){return X.nm(p.dir)+'→'+X.nm(p.dir===p.a?p.b:p.a);}).join('、'));
return{
headline:headline,
stats:[['カップル成立',couples.length+'組'],['一緒に帰った',tg.length+'組'],['一人で帰った',solo.length+'人'],['潰れた',crushed.length+'人']],
lines:lines
};
};
E.classroom=function(res,X){
var lovers=X.withLabel(['lovers']),rivals=X.withLabel(['rivals','dislike']),friends=X.withLabel(['friends','partners']);
var F=res.factions&&res.factions.final,R=HK.Factions?HK.Factions.REGIME:{};
var span=res.env.span==='term'?'一学期':'一年';
var headline=span+'が終わり、'+(lovers.length?lovers.map(X.pn).join('、')+'が付き合い始めた':'恋人は生まれなかった')+'。'+
(F?'クラスは「'+R[F.regime]+'」'+(F.groups.length?'（'+F.groups.map(function(g){return X.nm(g.leader)+'派';}).join('・')+'）':'')+'に落ち着いた。':'');
var lines=[];
if(rivals.length)lines.push('犬猿の仲：'+rivals.map(X.pn).join('、'));
var kus=X.withLabel(['kusare','kusare1']);
if(kus.length)lines.push('腐れ縁（愛憎）：'+kus.map(X.pn).join('、'));
var kenC=lovers.filter(function(p){return p.lh==='couple';}),kinC=X.withLabel(['lhkin','lhkin1']);
if(kenC.length)lines.push('喧嘩ばかりの恋人：'+kenC.map(X.pn).join('、'));
if(kinC.length)lines.push('口の悪い家族：'+kinC.map(X.pn).join('、'));
var ones=X.withLabel(['oneway','pining']);
if(ones.length)lines.push('言えなかった想い：'+ones.map(function(p){return p.label==='pining'?X.pn(p)+'（両片想い）':X.nm(p.dir)+'→'+X.nm(p.dir===p.a?p.b:p.a);}).join('、'));
var absent=X.byFate(/休みがち/),nogo=X.byFate(/不登校/);
if(absent.length)lines.push('三学期、教室にいないことが増えた：'+X.names(absent));
if(nogo.length)headline+=X.names(nogo)+'は、最後まで教室に戻らなかった。';
if(F&&F.loners.length&&F.groups.length)lines.push('どの派閥にも属さなかった：'+X.names(F.loners));
return{
headline:headline,
stats:[['恋人',lovers.length+'組'],['友人・相棒',friends.length+'組'],['犬猿',rivals.length+'組'],['不登校',nogo.length+'人'],['体制',F?R[F.regime]:'―']],
lines:lines
};
};
E.island=function(res,X){
var n=X.C.length;
var rescued=X.byFate(/救助/),raft=X.byFate(/イカダ/),dead=X.C.filter(function(c){return!c.alive;}),stay=X.byFate(/島に残った/);
var solo=X.C.filter(function(c){return c.alive&& /抜け出した|助けを呼びに/.test(c.fate);});
var home=rescued.length+raft.length+solo.length;
var how=[rescued.length?'救助'+rescued.length:'',raft.length?'イカダ'+raft.length:'',solo.length?'単独'+solo.length:''].filter(Boolean).join('・');
var headline=n+'人中'+home+'人が帰還'+(home?'（'+how+'）':'')+
(dead.length?'、'+dead.length+'人が島で死亡':'')+(stay.length?'、'+stay.length+'人が島に残った':'')+'。';
if(!dead.length&&home===n)headline='全員が生きて島を出た（'+how+'）。';
var lines=[];
if(home)lines.push('帰還：'+X.names(rescued.concat(raft)));
solo.forEach(function(c){lines.push((/助けを呼びに/.test(c.fate)?'先に島を出た：':'抜け駆け：')+c.name+'（'+c.fateNote+'）');});
if(res.end.raft){
var r=res.end.raft,onboard=r.crew;
var behind=X.C.filter(function(c){return onboard.indexOf(c.i)<0&&c.alive;});
var mates=onboard.filter(function(i){return i!==r.by;});
lines.push(r.label+'　'+(mates.length?X.nm(r.by)+'がイカダに'+X.names(mates)+'を乗せて島を離れた':X.nm(r.by)+'が一人でイカダを漕ぎ出した')+(behind.length?'。'+X.names(behind)+'は浜に残された':''));
}
if(res.end.radio)lines.push('壊れた無線機が直り、外と連絡がついた。');
deathLines(res,X).forEach(function(l){lines.push(l);});
if(stay.length)lines.push('島に残った：'+stay.map(function(c){return c.name+'（'+c.fateNote+'）';}).join('、'));
var lead=X.C.filter(function(c){return c.leader;});
if(lead.length)lines.push('まとめ役：'+X.names(lead));
var I=res.end.isl;
if(I){
lines.push('拠点：'+['野宿のまま','雨よけの屋根まで','寝床つきの小屋まで','快適な拠点まで'][Math.min(3,Math.floor(I.base/34))]+'整えた');
var top=I.dishes.slice().sort(function(a,b){return b.q-a.q;})[0];
if(top)lines.push('いちばんの御馳走：'+X.nm(top.by)+'の「'+top.dish+'」');
if(I.ate)lines.push('飢えの果てに、口にしてはならないものを口にした者がいた。');
(I.slain||[]).forEach(function(x){lines.push('討伐：'+X.nm(x.hero)+'たちが'+x.b+'を仕留めた');});
if(I.weapons&&I.weapons.length)lines.push('作った武器：'+I.weapons.map(function(w){return w.n;}).join('・'));
}
var F=res.factions&&res.factions.final;
if(F&&F.groups.length)lines.push('最後の体制：'+HK.Factions.REGIME[F.regime]+'（'+F.groups.map(function(g){return X.nm(g.leader)+'派'+g.members.length+'人';}).join('・')+(F.loners.length?'・無所属'+F.loners.length+'人':'')+'）');
return{
headline:headline,
stats:[['帰還',home+'/'+n+'人'],['死亡',dead.length+'人'],['島に残った',stay.length+'人'],['経過',res.stepCount+'日']],
lines:lines
};
};
E.trial=function(res,X){
var cases=res.end.cases,n=X.C.length;
var wrong=cases.filter(function(c){return!c.solved;})[0];
var mm=X.byFate(/^黒幕（/)[0],bust=X.byFate(/黒幕を暴いて/);
var alive=X.C.filter(function(c){return c.alive&&c!==mm;});
var days=Math.ceil(res.stepCount/4);
var rebels=X.byFate(/黒幕を倒して脱出/);
var headline;
if(bust.length)headline=(cases.length?cases.length+'件の事件のあと、':'')+'黒幕の正体を暴いた。黒幕は宿泊客の'+mm.name+'だった。'+X.names(bust)+'がホテルを出た。';
else if(rebels.length)headline=(cases.length?cases.length+'件の事件のあと、':'')+'黒幕への反撃に成功した。'+X.names(rebels)+'が、黒幕からゲームの鍵を奪ってホテルを脱出した。';
else if(wrong){
var grads=X.byFate(/生還|卒業/);
headline=cases.length+'件目の裁判で投票を外した。犯人の'+X.nm(wrong.killer)+(grads.length>1?'と共犯の'+X.nm(wrong.acc):'')+'だけが生きて帰り、ほかの全員が処刑された。';
}else if(!cases.length)headline=days+'日間、一度も殺人は起きなかった。'+X.names(alive)+'は'+(res.env.endrule==='out'?'全員でホテルを出た。':'ホテルに残った。');
else if(!alive.length)headline=cases.length+'件の事件の末、宿泊客は一人も残らなかった。';
else headline=cases.length+'件の事件をすべて解き明かし、生き残った'+X.names(alive)+'が'+(res.env.endrule==='out'?'ホテルを出た。':'ホテルに残った。');
if(mm&& !bust.length)headline+= /最後に/.test(mm.fate)?'最後に、黒幕が宿泊客の'+mm.name+'だったと明かされた。':'黒幕は宿泊客の'+mm.name+'だった。';
var lines=cases.map(function(c,k){
var vs=c.victims&&c.victims.length?c.victims:[c.victim];
var first=c.prior?'　最初の犯行：'+X.nm(c.prior.killer)+'が'+X.nm(c.prior.victim)+'を殺害':'';
return(CIRC.charAt(k)||'・')+' '+c.label.replace(/・(学級)?裁判/,'')+'　被害者：'+vs.map(X.nm).join('・')+first+'　犯人：'+X.nm(c.killer)+(c.acc!=null?'（共犯：'+X.nm(c.acc)+'）':'')+'　動機：'+c.motive+'　→ '+
(c.solved?'見破られて処刑'+(c.det!=null?'（決め手は'+X.nm(c.det)+'の推理）':''):'見破れず。'+X.nm(c.wrong)+'に票が集まった');
});
var inCase={};
cases.forEach(function(c){(c.victims&&c.victims.length?c.victims:[c.victim]).forEach(function(v){inCase[v]=1;});if(c.prior)inCase[c.prior.victim]=1;});
X.C.forEach(function(c){
if(c.alive||inCase[c.i]|| /裁判で/.test(c.fateNote||''))return;
var how=String(c.fateNote||'').replace(/^[^、]*、/,'');
lines.push((/黒幕|見せしめ/.test(how)&&c.killedBy==null?'黒幕による処刑：':'死亡：')+c.name+'（'+how+'）');
});
var dets={};
cases.forEach(function(c){if(c.solved&&c.det!=null)dets[c.det]=(dets[c.det]||0)+1;});
var top=Object.keys(dets).sort(function(a,b){return dets[b]-dets[a];})[0];
if(top!=null)lines.push('探偵役：'+X.nm(+top)+'（'+dets[top]+'件の決め手）');
return{
headline:headline,
stats:[['事件',cases.length+'件'],['正しい投票',cases.filter(function(c){return c.solved;}).length+'/'+cases.length],(!rebels.length&& !wrong&&res.env.endrule!=='out'?['ホテルに残った',alive.length+'/'+n+'人']:['生還',(rebels.length?rebels.length:wrong?X.byFate(/生還|卒業/).length:alive.length)+'/'+n+'人']),['経過',days+'日']],
lines:lines
};
};
E.br=function(res,X){
var n=X.C.length;
var win=X.byFate(/優勝/)[0],esc=X.byFate(/脱出/),home=X.byFate(/生還|生存/);
var dead=X.C.filter(function(c){return!c.alive;});
var headline;
if(win)headline='優勝は'+win.name+'。'+(win.kills?win.kills+'人を手にかけて':'一人も殺さずに')+'最後の一人になった。';
else if(esc.length)headline=X.names(esc)+'が首輪を外して会場から脱出した。'+(dead.length?'死者'+dead.length+'人。':'');
else if(home.length)headline='時間切れまで生き延びた'+X.names(home)+'が生還した。';
else headline='時間切れ。生き残っていた全員の首輪が作動し、生還者はいなかった。';
var lines=deathLines(res,X);
var killers=X.C.filter(function(c){return c.kills;}).sort(function(a,b){return b.kills-a.kills;});
if(killers.length)lines.push('手にかけた人数：'+killers.map(function(c){return c.name+' '+c.kills+'人';}).join('、'));
var nk=X.C.filter(function(c){return!c.kills&& /誰も殺さない/.test(c.goal);});
if(nk.length)lines.push('「誰も殺さない」を貫いた：'+X.names(nk));
return{
headline:headline,
stats:[['生還',(win?1:0)+esc.length+home.length+'/'+n+'人'],['死亡',dead.length+'人'],['殺害',killers.reduce(function(s,c){return s+c.kills;},0)+'件'],['経過',res.stepCount+'区切り']],
lines:lines
};
};
if(HK.simulate&&HK.wrap&&HK.LoveHate&&HK.LoveHate.endPatch)HK.wrap(HK,'simulate',function(sim0){
var f=function(){
var LH=HK.LoveHate;
LH.endBegin();
return LH.endPatch(sim0.apply(this,arguments));
};
for(var ks in sim0)if(Object.prototype.hasOwnProperty.call(sim0,ks))f[ks]=sim0[ks];
return f;
});
})();
});
;
/* ==== js/epilogue.js ==== */
HK.Load.def(150,'js/epilogue.js',function(){
(function(){
'use strict';
var HK=window.HK;
if(!HK|| !HK.Ctx)return;
var Ctx=HK.Ctx,Emo=HK.Emo;
function L(s){return s.split('|');}
function safe(){return!!HK.SAFE_ON;}
function hash(s){s=String(s);var h=2166136261;for(var i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619);}return(h>>>0)/4294967296;}
function pickH(arr,key){return arr&&arr.length?arr[Math.floor(hash(key)*arr.length)%arr.length]:'';}
function pickU(arr,key,used){
if(!arr|| !arr.length)return'';
var k0=Math.floor(hash(key)*arr.length)%arr.length;
if(!used)return arr[k0];
for(var d=0;d<arr.length;d++){var t=arr[(k0+d)%arr.length];if(!used[t]){used[t]=1;return t;}}
return arr[k0];
}
var ATT=['proud','stern','tsun','gentle','devoted','cool','free','shy','polite'];
function att(c){
if(Emo&&Emo.att)return Emo.att(c);
return c&&ATT.indexOf(c.persona)>=0?c.persona:'gentle';
}
var LW={
kill:{
proud:L('{to}……くそ、こんなところで、終わりかよ|{to}ざまあねえな……あとは、勝手にやれ|{to}覚えてろ……俺は、まだ……'),
stern:L('{to}……油断した。私の、落ち度だ|{to}あとを、頼む……振り返るな|{to}……悔いは、ない。そう、思わせてくれ'),
tsun:L('{to}……べつに、痛くなんか、ない|{to}泣くな……泣いたら、許さない|{to}……ばか。こんなときくらい、そばにいろ'),
gentle:L('{to}……大丈夫。怖くないよ|{to}ありがとう……楽しかった、ね|{to}誰も、恨まないで……お願い'),
devoted:L('{to}……ごめんなさい。最後まで、役に立てなくて|{to}どうか、生きて……それだけで、いいんです|{to}……みんなは、無事……？'),
cool:L('{to}……計算違い、か。まあ、いい|{to}……思ったより、静かだな|{to}あとの判断は、任せる……間違えるなよ'),
free:L('{to}……あはは、ドジったなあ|{to}……もっと、遊びたかった、な|{to}笑ってよ……ほら、いつもみたいに'),
shy:L('{to}……こわい、です……手、にぎって……|{to}ご、ごめんね……先に、いくね|{to}……ずっと、言えなかった、ことが……'),
polite:L('{to}……お見苦しいところを、お見せしました|{to}どうか、お元気で……|{to}……今まで、ありがとうございました')
},
accident:{
proud:L('{to}……は、こんな、間抜けな終わり方かよ|{to}来るな……俺のことは、いい|{to}……悪くねえ人生だった、ってことに、しとけ'),
stern:L('{to}……足を、取られた……すまない|{to}構うな……先へ、進め|{to}……ここまで、か。存外、あっけない'),
tsun:L('{to}……なによ、その顔……平気だって、言ってる|{to}……こんなの、ずるい……|{to}あんたのせいじゃ、ないから……絶対に'),
gentle:L('{to}……あれ、なんだか、眠いや|{to}大丈夫、だから……そんな顔、しないで|{to}……空、きれいだね'),
devoted:L('{to}……私のことは、置いていってください|{to}……みんなが、無事なら……よかった|{to}すみません……最後まで、お手伝い、できなくて'),
cool:L('{to}……運が、なかったな|{to}……確率の、問題だ。気に、するな|{to}……もう、いい。行け'),
free:L('{to}……うそ、でしょ……まだ、やりたいこと、いっぱい……|{to}……へへ、ちょっと、休むね|{to}またね……って、言わせてよ'),
shy:L('{to}……いたい、です……|{to}……ひとりに、しないで……|{to}……ごめんなさい……ありがとう……'),
polite:L('{to}……申し訳ありません。お先に、失礼いたします|{to}……どうか、私のことはお気になさらず|{to}……皆さんに、よろしくお伝えください')
},
sacrifice:{
proud:L('{to}行け！　ここは、俺が止める|{to}……借りは、返したぞ|{to}振り向くんじゃねえ……走れ'),
stern:L('{to}これが、私の務めだ|{to}……行け。立ち止まることは、許さん|{to}守れたなら……それでいい'),
tsun:L('{to}か、勘違いしないでよ……あんたのためじゃ、ないんだから|{to}早く、行きなさいよ……ばか|{to}……ちゃんと生き残らなかったら、許さないから'),
gentle:L('{to}いいんだ……こうしたかったんだよ|{to}……無事で、よかった|{to}……みんなのこと、頼んだよ'),
devoted:L('{to}……やっと、お役に立てました|{to}私は、いいんです……どうか、生きてください|{to}……守れて、よかった……'),
cool:L('{to}……合理的な判断だ。君が生きるほうが、いい|{to}……悪くない、交換だろう|{to}……振り返るな。時間の無駄だ'),
free:L('{to}へへ……かっこよかった、でしょ？|{to}……行って！　早く！|{to}……あたしの分まで、楽しんでよね'),
shy:L('{to}……やっと、勇気、出せた……|{to}……こわかった、けど……よかった……|{to}……にげて……おねがい……'),
polite:L('{to}……どうか、お先に。ここは私が|{to}……お役に立てて、光栄です|{to}……振り返らずに、お進みください')
},
suicide:{
proud:L('{to}……俺の終わりは、俺が決める|{to}止めるなよ……もう、決めたんだ|{to}……誰のせいでも、ねえ'),
stern:L('{to}……始末は、自分でつける|{to}……許せとは、言わない|{to}これで償いになるとは思わない。だが……'),
tsun:L('{to}……止めないで。お願いだから|{to}……ほんとは、もっと、ちゃんと……|{to}……ばいばい'),
gentle:L('{to}……疲れちゃった。ごめんね|{to}……あなたは、生きてね|{to}……ありがとう。もう、いいんだ'),
devoted:L('{to}……私がいないほうが、きっと……|{to}ごめんなさい……ごめんなさい……|{to}……どうか、忘れてください'),
cool:L('{to}……結論は、もう出ている|{to}……これが、最善だった|{to}……説明は、残してある'),
free:L('{to}……もう、いいや|{to}……最後くらい、自分で選ばせてよ|{to}……笑って、見送ってよ'),
shy:L('{to}……ごめんね……もう、がんばれない……|{to}……さよなら……|{to}……誰にも、言えなかった……'),
polite:L('{to}……身勝手を、お許しください|{to}……お世話に、なりました|{to}……どうか、お幸せに')
},
disease:{
proud:L('{to}……情けねえな、こんな、ことで|{to}……そんな顔、すんな。俺は、平気だ|{to}……あとは、頼んだぞ'),
stern:L('{to}……体が、言うことを、聞かん|{to}……看病、感謝する|{to}……私のことは、もう、いい'),
tsun:L('{to}……べつに、つらくなんか、ない……|{to}……もうちょっと、そこにいて|{to}……看病、下手くそ……でも、ありがと'),
gentle:L('{to}……あったかいね、その手|{to}……少し、眠るね|{to}……ありがとう。そばにいてくれて'),
devoted:L('{to}……ご迷惑を、おかけしました|{to}……最後まで、そばに、いてくれて……|{to}……私、ちゃんと、頑張れましたか……？'),
cool:L('{to}……症状からして、もう長くない|{to}……記録は、残してある。役立てろ|{to}……思ったより、怖くないものだな'),
free:L('{to}……ねえ、なにか、話してよ|{to}……元気になったら、また……|{to}……あーあ、つまんないの'),
shy:L('{to}……そばに、いて……|{to}……手、はなさないで……|{to}……ありがとう……うれしかった……'),
polite:L('{to}……お手を煩わせて、申し訳ありません|{to}……どうか、お体を大事に|{to}……ありがとうございました。本当に')
}
};
var LW_TO={
proud:L('{t}……お前に会えて、まあ、悪くなかった|{t}……先に行って、待っててやる|{t}……お前だけは、生きろよ'),
stern:L('{t}……お前と過ごした時間は、悪くなかった|{t}……すまない。約束を、守れなかった|{t}……生きろ。それが、最後の頼みだ'),
tsun:L('{t}……あんたのこと、ほんとは……|{t}……忘れたら、承知しないから|{t}……最後に、顔、見せて'),
gentle:L('{t}……会えて、よかった|{t}……笑っていてね。ずっと|{t}……ありがとう。大事に思ってたよ'),
devoted:L('{t}……あなたに会えて、幸せでした|{t}……どうか、私の分まで|{t}……ずっと、お慕いしていました'),
cool:L('{t}……君と出会ったのは、計算外だった。いい意味で|{t}……君が生きているなら、それでいい|{t}……最後に見るのが君で、よかった'),
free:L('{t}……ねえ、楽しかったね|{t}……あたしのこと、忘れないでよ|{t}……また、どこかで'),
shy:L('{t}……ずっと、そばにいたかった……|{t}……あのね……ありがとう……|{t}……泣かないで……'),
polite:L('{t}……あなたにお会いできて、本当によかった|{t}……どうか、お幸せに|{t}……ありがとうございました。……さようなら')
};
var LW_BETRAY=L('{t}……どうして……|{t}……お前に、なら……|{t}……それでも、恨めないんだ|{t}……そっか。お前だったんだ');
var SOFT=[[/くそ、/g,'ああ、'],[/ざまあねえな/g,'かっこ悪いな']];
function soften(q){if(!safe())return q;SOFT.forEach(function(r){q=q.replace(r[0],r[1]);});return q;}
var KIND_SUI= /自ら|命を絶|身を投げ|自害|自分で終わら/,KIND_SAC= /身代わり|かば|庇|盾に|囮|犠牲|生贄|守って|守ろう|足止め/,KIND_DIS= /病|感染|衰弱|飢え|凍え|熱が|発作|寒さ|渇き|脱水|老い|酸素|咳/,KIND_KILL= /刺|撃|殴|斬|噛|襲|殺|銃|刃|致命傷|首を|処刑|手で|絞め|突き落|毒を盛/;
P_kind.KINDS=['kill','accident','sacrifice','suicide','disease'];
function P_kind(how,killer){
var s=String(how||'');
if(KIND_SUI.test(s))return'suicide';
if(KIND_SAC.test(s))return'sacrifice';
if(killer||KIND_KILL.test(s))return'kill';
if(KIND_DIS.test(s))return'disease';
return'accident';
}
function tieHas(ctx,a,b,re){
if(!HK.Ties|| !ctx.ties)return false;
try{return HK.Ties.all(ctx,a,b).some(function(t){return re.test(t.type);});}catch(e){return false;}
}
function addressee(ctx,v){
var C=(ctx.chars||[]).filter(function(o){return o!==v&&o.alive!==false&& !o.out;});
if(!C.length)return null;
var lov=C.filter(function(o){return ctx.pair(v,o).couple||tieHas(ctx,v,o,/^(?:lover|spouse|mate|fated)$/);})[0];
if(lov)return{c:lov,why:'lover'};
if(v.honmei!=null&&ctx.chars[v.honmei]&&C.indexOf(ctx.chars[v.honmei])>=0)return{c:ctx.chars[v.honmei],why:'honmei'};
var ob=C.filter(function(o){return(v.flags&&v.flags.cagePair===o.i)||tieHas(ctx,v,o,/^yan$/);})[0];
if(ob)return{c:ob,why:'obsess'};
var best=null,bv=55;
C.forEach(function(o){var r=ctx.R(v,o);if(r&&r.aff>bv){bv=r.aff;best=o;}});
return best?{c:best,why:'close'}:null;
}
function compose(v,kind,to,killer,key){
var a=att(v),q;
if(to&&killer&&to===killer)q=pickH(LW_BETRAY,key+'|b');
else if(to&&hash(key+'|to')<0.5)q=pickH(LW_TO[a],key+'|t');
else q=pickH((LW[kind]||LW.accident)[a],key+'|k');
q=q.replace(/\{to\}/g,to?to.name+'、':'').replace(/\{t\}/g,to?to.name+'、':'');
return soften(q);
}
var X=HK.Epilogue={LW:LW,LW_TO:LW_TO,LW_BETRAY:LW_BETRAY,kind:P_kind,hash:hash};
function revives(c){return!!(HK.Special&&HK.Special.canRevive&&HK.Special.canRevive(c));}
X.revives=revives;
X.last=function(ctx,c,how,killer){
if(!ctx|| !c)return null;
var kind=P_kind(how,killer),ad=addressee(ctx,c),to=ad?ad.c:null;
var q=compose(c,kind,to,killer,(ctx.seed||0)+'|'+c.name+'|'+(ctx.stepIndex||0));
return{q:q,kind:kind,to:to?to.i:null,line:c.name+'「'+q+'」'};
};
HK.wrap(Ctx.prototype,'kill',function(kill1){return function(v,killer,how){
var was= !!(v&&v.alive);
var r=kill1.apply(this,arguments);
if(was&&v.alive===false&& !v.lastWords&& !revives(v)){
var lw=null;
try{lw=X.last(this,v,how,killer);}catch(e){lw=null;}
if(lw){
v.lastWords=lw.line;v.lastTo=lw.to;v.lastKind=lw.kind;
var pd=this.pending&&this.pending[this.pending.length-1];
if(pd&&pd.kind==='death'&&pd.actors&&pd.actors[0]===v&&hash((this.seed||0)+'|lw|'+v.i)<0.6){
pd.text+='　――'+v.name+'が最期に遺した言葉：「'+lw.q+'」';
v.lastLogged=true;
}
}
}
return r;
};});
X.summary=function(ctx,chars){
(ctx.chars||[]).forEach(function(c,k){
var s=chars[k];
if(!s|| !c.lastWords||revives(c))return;
s.lastWords=c.lastWords;s.lastTo=c.lastTo;s.lastKind=c.lastKind;
if(Array.isArray(s.notes))s.notes.push('最期の言葉：'+c.lastWords);
});
};
var PLACE={island:'あの島',zombie:'あの街',classroom:'あの教室',goukon:'あの店',whiteroom:'あの部屋',omega:'あの街',br:'あの島',trial:'あの施設',jashin:'あの村',yakata:'あの館',ship:'あの船',jinro:'あの村'};
var AF={
live:{
proud:L('{a}は相変わらず偉そうな口をきいていたが、{p}の話になると少しだけ黙った。|{a}は「あんなの大したことなかった｜＝｜あんなの大したことなかったです」と言い張り続けた。|{a}は前よりほんの少しだけ、人の話を聞くようになった。'),
stern:L('{a}は{p}でのことを教訓として胸に刻み、以前にも増して自分を律した。|{a}は毎朝同じ時間に起き、同じように一日を始めた。それが{a}なりの区切りだった。|{a}は多くを語らなかったが、{p}で学んだことを忘れなかった。'),
tsun:L('{a}は「別に、いい思い出なんかじゃない｜＝｜別に、いい思い出なんかじゃありません」と言いながら、{p}の話を何度も持ち出した。|{a}はそっけない態度のまま、それでも皆との連絡を絶やさなかった。|{a}は素直じゃないまま、少しだけ素直になった。'),
gentle:L('{a}はいつもの穏やかさで、{p}でのことを笑い話に変えていった。|{a}は、{p}で出会った人たちのことを、今も大切に思っている。|{a}の周りには、変わらず人が集まった。'),
devoted:L('{a}は誰かの役に立てたことを、前よりも少しだけ誇らしく思えるようになった。|{a}は{p}で世話になった人たちに、一人ずつ手紙を書いた。|{a}は相変わらず人のために走り回っていたが、自分を休ませることも覚えた。'),
cool:L('{a}は{p}での出来事を、自分なりに整理して書き残した。|{a}は以前と同じ顔で日常に戻った。ただ、人を見る目は少し変わった。|{a}は「合理的じゃなかったけど、悪くなかった｜合理的ではなかったが、悪くなかった｜合理的ではありませんでしたが、悪くなかったです」と振り返った。'),
free:L('{a}は{p}でのことを、会う人ごとに面白おかしく話して回った。|{a}は次の楽しいことを探して、もう走り出していた。|{a}は変わらず自由気ままだったが、{p}でのことだけは大事にしまっていた。'),
shy:L('{a}は{p}でのことを思い出すたび、少しだけ勇気が出るようになった。|{a}は小さな声のままだったが、言いたいことは言えるようになった。|{a}は{p}でのことを、そっと日記に書き留めた。'),
polite:L('{a}は以前と変わらぬ丁寧さで、{p}で関わった人たちに礼を尽くした。|{a}は「良い経験をさせていただきました」と、穏やかに微笑んだ。|{a}の物腰は変わらなかったが、その目には前にはなかった強さがあった。')
},
escape:{
proud:L('{a}は{p}を出たあと、二度と振り返らなかった。少なくとも、そう見せていた。|{a}は生き延びたことを、自分の腕のおかげだと言い張った。|{a}は外の世界に戻っても、しばらくは壁を背にして眠った。'),
stern:L('{a}は{p}を出たその日から、元の暮らしを淡々と取り戻していった。|{a}は生き延びた者の務めとして、{p}で起きたことを正確に書き残した。|{a}は{p}を出たあとも、出口の位置を確かめる癖が抜けなかった。'),
tsun:L('{a}は「もう二度と御免だから｜もう二度と御免だ｜もう二度と御免ですから」と言いながら、{p}のあった方角をときどき見ていた。|{a}は出てこられたことを、誰にも感謝しなかった。心の中では、何度もしていた。|{a}は外に出てすぐ、強がりを言う相手がそばにいないことに気づいた。'),
gentle:L('{a}は{p}を出たあと、ゆっくり時間をかけて日常に戻っていった。|{a}は外の光の中で、「帰ってこられたね｜帰ってこられたな｜帰ってこられましたね」と小さく笑った。|{a}は{p}から持ち帰った小さなものを、ずっと手元に置いている。'),
devoted:L('{a}は{p}を出たあとも、残してきた人たちのことを考え続けた。|{a}は助けてくれた人たちに恩を返す方法を、ずっと探している。|{a}は帰り着いた夜、ようやく自分のために泣いた。'),
cool:L('{a}は{p}を出たあと、起きたことを一つずつ記録にまとめた。|{a}は生還の理由を「運と判断｜運と判断だ｜運と判断です」だと短く答えた。|{a}は外に出ても、しばらく人の多い場所を避けていた。'),
free:L('{a}は{p}を出た瞬間、大声で笑った。泣いているようにも見えた。|{a}は外に出たその足で、食べたかったものを片っ端から食べに行った。|{a}は「次はもっと楽しいところがいい｜＝｜次はもっと楽しいところがいいです」と言って、空を見上げた。'),
shy:L('{a}は{p}を出たあと、しばらく誰とも話せなかった。それでも、生きていた。|{a}は外の世界の音に、少しずつ慣れていった。|{a}は帰り道、何度も後ろを振り返った。'),
polite:L('{a}は{p}を出たあと、関わった人たちに一人ずつ礼を伝えて回った。|{a}は「おかげさまで｜＝｜おかげさまで」と頭を下げ、元の暮らしに戻っていった。|{a}は外に出てからも、{p}で出会った人たちのことを折に触れて思い出した。')
},
dead:{
proud:L('{a}の強気な笑い方を、残された者たちは何度も思い出した。|{a}がいたら何と言ったか――皆、ときどきそれを口にした。|{a}の名前が出るたび、誰かが「あいつらしい」と苦笑した。'),
stern:L('{a}の残した言葉を、残された者たちは指針のように大切にした。|{a}が最後まで守ろうとしたものは、確かに誰かに受け継がれた。|{a}の几帳面な字の書き置きは、今も誰かの手元にある。'),
tsun:L('{a}が素直に言えなかった気持ちは、残された者たちのほうがよく分かっていた。|{a}の憎まれ口が聞こえない静けさに、皆はなかなか慣れなかった。|{a}が隠していた優しさを、皆はあとになって一つずつ知った。'),
gentle:L('{a}の穏やかな笑顔は、残された者たちの心に長く残った。|{a}のことを思い出すと、なぜか皆、少しだけ優しくなれた。|{a}がいた場所には、いつも誰かが花を置いた。'),
devoted:L('{a}が尽くしてくれたことを、残された者たちは決して忘れなかった。|{a}の「大丈夫ですか」という声を、皆は何度も思い出した。|{a}が守ろうとした人たちは、{a}の分まで生きようと決めた。'),
cool:L('{a}の冷静な言葉は、残された者たちが迷ったときの道しるべになった。|{a}が最後に何を考えていたのか、誰にも分からなかった。|{a}の不在は、皆が思っていたよりずっと大きかった。'),
free:L('{a}の笑い声が聞こえない日々は、ひどく静かだった。|{a}がやりたがっていたことを、残された者たちは代わりに一つずつ叶えた。|{a}のことを話すとき、皆は泣きながら笑った。'),
shy:L('{a}が小さな声で言っていたことを、皆はあとになって大切に思い出した。|{a}がそっと残したものを、誰かが今も大事に持っている。|{a}のことを、残された者たちはもっと知りたかったと思った。'),
polite:L('{a}の丁寧な言葉遣いを、残された者たちは懐かしく思い出した。|{a}の礼儀正しいお辞儀を、皆はいつまでも覚えていた。|{a}に返しきれなかった礼を、皆はそれぞれの形で返そうとした。')
},
caged:{
proud:L('{a}は閉じ込められたまま、それでも屈したふりだけはしなかった。|{a}の強がりは、扉の向こうで少しずつ削られていった。|{a}は、いつか必ず出てやると、毎晩自分に言い聞かせた。'),
stern:L('{a}は閉ざされた部屋で、日付を数えることだけはやめなかった。|{a}は屈せず、ただ静かに機会を待ち続けた。|{a}は自分を保つために、決まった時間に決まったことを繰り返した。'),
tsun:L('{a}は閉じ込められた部屋で、「平気だから｜平気だ｜平気ですから」と誰にともなく言い続けた。|{a}は差し出される食事を、意地で半分だけ残した。|{a}は泣き言を言わなかった。言えば、負けだと思った。'),
gentle:L('{a}は閉じ込められたまま、それでも相手に穏やかに話しかけ続けた。|{a}は窓の外の空を見ることを、一日の楽しみにしていた。|{a}の笑顔は、少しずつ薄くなっていった。'),
devoted:L('{a}は閉じ込められたまま、外の皆が無事でいることだけを願った。|{a}は相手の機嫌をうかがうことに、すっかり慣れてしまった。|{a}は、いつか誰かが迎えに来てくれると信じていた。'),
cool:L('{a}は閉じ込められた部屋で、逃げ道を探し続けた。|{a}は相手の行動の癖を、ひとつ残らず覚えていった。|{a}は感情を殺し、時を待った。'),
free:L('{a}は閉じ込められた部屋で、壁に落書きをして日々をやり過ごした。|{a}の明るさは、閉ざされた日々の中で少しずつ失われた。|{a}は外の風の匂いを、何度も夢に見た。'),
shy:L('{a}は閉じ込められた部屋の隅で、小さくなって過ごした。|{a}は声を上げることもできず、ただ扉の音に怯えていた。|{a}は、外にいる誰かの名前を、毎晩そっと呼んだ。'),
polite:L('{a}は閉じ込められたまま、礼儀正しさだけは決して手放さなかった。|{a}は丁寧な言葉で、毎日同じお願いを繰り返した。|{a}は静かに、自分が誰であったかを忘れないようにしていた。')
},
fallen:{
proud:L('{a}はすっかり牙を抜かれ、かつての強気は見る影もなかった。|{a}は、あの日々を忘れられなくなったことを、誰にも言えなかった。|{a}は強がりを言いかけては、途中でやめるようになった。'),
stern:L('{a}が守ってきた規律は、あの日を境に崩れたままだった。|{a}は自分を律する言葉を、もう思い出せなかった。|{a}はかつての自分を恥じながら、それでも元には戻れなかった。'),
tsun:L('{a}はもう、意地を張ることさえしなくなった。|{a}は「違う｜＝｜違います」と言いかけては、黙ってうつむいた。|{a}の素直さは、望んだのとは違う形で手に入ってしまった。'),
gentle:L('{a}は穏やかに微笑んだまま、どこか遠くを見るようになった。|{a}は、あの日々のことを、懐かしむような目で語った。|{a}の柔らかさは、前とは違う色を帯びていた。'),
devoted:L('{a}は尽くす相手を、すっかり取り違えてしまっていた。|{a}は今も、あの声に呼ばれるのを待っている。|{a}は、自分が何を望んでいるのか分からなくなっていた。'),
cool:L('{a}は自分に何が起きたのかを分析しようとして、そのたびに考えるのをやめた。|{a}の冷静さは、ある一点でだけ、もう働かなくなっていた。|{a}は理屈では割り切れないものを、抱えたまま生きることにした。'),
free:L('{a}はあの日々を、むしろ楽しかったと笑って話した。|{a}は前よりずっと奔放になり、周りを戸惑わせた。|{a}は、もう一度あの場所に行きたいと、こっそり口にした。'),
shy:L('{a}は、あの日々のことを思い出しては、ひとりで顔を赤くしていた。|{a}は前よりもっと無口になり、何かを隠すように過ごした。|{a}は、誰にも言えない秘密をひとつ抱えて生きることになった。'),
polite:L('{a}は変わらず丁寧な言葉を使ったが、その目は前とは違っていた。|{a}は「もう、元には戻れません」と、静かに微笑んだ。|{a}は品のよさを保ったまま、あの日々の名残りを抱えていた。')
}
};
var REL={
with:L('隣には、いつも{b}がいた。|{b}と並んで歩く姿が、よく見かけられた。|{b}とは、今も変わらず一緒にいる。'),
lost:L('{b}のいない日々に、まだ慣れることはできなかった。|ふとした瞬間に、{b}の名前を呼びそうになった。|{b}の分まで生きる――それだけを支えにしていた。'),
deadWith:L('{b}は、今も{a}のことを想い続けている。|{b}は{a}の残したものを、何ひとつ捨てられなかった。|{b}は毎年、{a}を想う日を一日だけ作った。'),
keep:L('{b}への想いは、今も胸の中で静かに続いていた。|いつかもう一度、{b}に想いを伝える日が来るのかもしれない。|{b}の名前を聞くと、今でも少しだけ胸が高鳴った。'),
gave:L('{b}への想いには、もう区切りがついていた。|{b}を想った日々は、今では少し懐かしい思い出になった。|{b}のことを思い出しても、もう前ほどは胸が痛まなかった。')
};
var MOOD={
calm:L('日々は静かに、元の形を取り戻した。|何もかもが、穏やかに過ぎていった。|それで十分だと、{a}は思った。'),
joy:L('思い出すたびに、自然と笑みがこぼれた。|その顔は、いつも晴れやかだった。|楽しかった――それが、いちばん素直な感想だった。'),
grief:L('ただ、ときどき遠くを見る目をした。|心の傷が癒えるには、まだ時間がかかりそうだった。|笑えるようになるまで、長い時間がかかった。'),
fear:L('夜中にふと目を覚ます癖だけは、抜けなかった。|物音に振り返る癖が、しばらく残った。|安心して眠れるようになるまで、少し時間がかかった。'),
anger:L('許せないことが、ひとつだけ残っていた。|あのときの悔しさは、まだ消えていなかった。|胸の中の怒りを、うまく手放せずにいた。'),
shame:L('あのときの自分を、まだ少し恥じていた。|思い出すと、今でも顔が熱くなった。|自分のしたことを、誰にも打ち明けられずにいた。')
};
var PAIR={
love:L('{a}と{b}は、その後も並んで歩いていた。|{a}と{b}は、あの日のことを二人だけの思い出にした。|{a}と{b}は、今も変わらず互いの隣にいる。'),
pining:L('{a}と{b}は、その後も互いの言葉を待ち続けた。|{a}と{b}は、何度目かに会ったとき、ようやく同じことを言いかけた。|{a}と{b}の距離は、近いまま、まだ縮まりきらなかった。'),
oneway:L('{x}は、{y}への想いをそっと抱えたまま過ごした。|{x}は今も、{y}の姿を目で追ってしまう。|{x}の想いが{y}に届く日が来るのかは、まだ分からない。'),
onewayKeep:L('{x}は、断られたあとも{y}を想い続けた。いつかもう一度伝える日が来るのかは、まだ分からない。|{x}は{y}への想いを、捨てずに持ち続けた。急がず、押しつけず、ただそばで。|{x}は今も、{y}の幸せをいちばんに願っている。その想いは、少しも色あせていない。|{x}は{y}の隣で、変わらずに笑っていた。胸の奥の想いは、まだそこにあった。'),
onewayGive:L('{x}は、{y}への想いに区切りをつけた。思い出すと、まだ少しだけ胸が痛んだ。|{x}は{y}と、少しずつ普通に話せるようになった。あの日の想いは、もう過去のものになりつつあった。|{x}は{y}への想いを、きれいな思い出としてしまい込んだ。'),
night:L('{a}と{b}は、名前のない関係のまま、ときどき会った。|{a}と{b}は、あの夜のことに触れないまま、それでも連絡を絶たなかった。|{a}と{b}の関係に名前がつくのは、もう少し先のことになりそうだった。'),
apart:L('{a}と{b}は、別々の道を歩き始めた。|{a}と{b}は、すれ違っても会釈だけで済ませるようになった。|{a}と{b}が元に戻ることは、なかった。'),
rival:L('{a}と{b}は、顔を合わせるたびに火花を散らした。|{a}と{b}は、互いを意識しながら、決して歩み寄らなかった。|{a}と{b}の因縁は、まだ終わっていなかった。'),
friend:L('{a}と{b}は、その後も気の置けない仲だった。|{a}と{b}は、困ったときに真っ先に連絡し合う仲になった。|{a}と{b}は、ときどき集まっては、あの日々の話をした。'),
obsess:L('{a}と{b}の関係は、どこか歪んだまま続いた。|{a}と{b}は、離れようとしても、結局また引き寄せられた。|{a}と{b}のあいだにあるものを、周りの誰も言い当てられなかった。'),
kusare:L('{a}と{b}は、その後も顔を合わせるたびに憎まれ口を叩き合った。それでも、どちらも相手から離れようとはしなかった。|{a}と{b}は、二度と顔も見たくないと言い合った翌日に、また同じ場所で鉢合わせた。|{a}と{b}の喧嘩は、今もどこかで続いている。周りはもう、止めようともしなかった。'),
kusare1:L('{x}は今も、{y}の顔を見るたびに悪態をつく。それでいて、{y}の姿が見えないと、なぜか落ち着かなかった。|{x}は、{y}のことなど嫌いだと言い続けた。言い続けるために、何度でも{y}に会いに行った。|{x}が{y}に向ける嫌味は、相変わらず手厳しかった。{y}がそれに慣れてしまったことだけが、{x}には少し不満だった。'),
lhcouple:L('{a}と{b}は、その後も顔を合わせるたびに言い合いをした。言い合いが終わると、どちらからともなく隣に座った。|{a}と{b}の喧嘩は、恋人になってからも減らなかった。減らないまま、二人は離れなかった。|{a}と{b}は、今日もつまらないことで口喧嘩をしている。周りはもう、それを二人の仲のよさだと思っていた。'),
lhkin:L('{a}と{b}は、その後も口を開けば文句を言い合った。それでも、困ったときに真っ先に連絡するのは互いだった。|{a}と{b}の口喧嘩は、家族の集まりの名物になった。止める者は、もういなかった。|{a}と{b}は、相変わらず互いの欠点ばかり並べ立てた。並べ立てられるほど、互いのことをよく知っていた。'),
lhkin1:L('{x}は今も、{y}の顔を見るたびに小言を言う。それでいて、{y}が困っていると、誰より先に手を貸した。|{x}は、{y}のことなど知らないと言い続けた。言い続けながら、{y}の好物だけは欠かさず覚えていた。|{x}の口の悪さは、{y}の前でだけ増した。{y}はもう、それが{x}なりの気遣いだと知っていた。')
};
var PAIR_TINT={
joy:L('二人とも、よく笑うようになった。|二人の笑い声が、よく聞こえた。'),
grief:L('二人のあいだには、まだ消えない悲しみがあった。|二人とも、失ったもののことは口にしなかった。'),
anger:L('二人のあいだのわだかまりは、すぐには消えなかった。|ときどき、言葉がとげを帯びた。'),
fear:L('二人とも、あの日の怖さをまだ忘れられずにいた。|二人は、互いが無事であることを何度も確かめ合った。'),
shame:L('二人とも、あのときのことになると目をそらした。|二人は、あの日のことを笑い話にはできずにいた。')
};
var LABEL_G={lovers:'love',bonded:'love',fatedmate:'love',mated:'love',pining:'pining',oneway:'oneway',night:'night',vague:'night',fwbsettle:'night',breakup:'apart',fwbend:'apart',allybreak:'apart',rivals:'rival',dislike:'rival',kinfeud:'rival',lovehate:'rival',kusare:'kusare',kusare1:'kusare1',lhkin:'lhkin',lhkin1:'lhkin1',awkward:'apart',friends:'friend',partners:'friend',kinbond:'friend',accomplice:'friend',guard:'friend',obsess:'obsess'};
var CLS_G={love:'love',pine:'pining',night:'night',enemy:'rival',partner:'friend',friend:'friend',guard:'friend',obsess:'obsess'};
X.AF=AF;X.REL=REL;X.MOOD=MOOD;X.PAIR=PAIR;
var GONE= /連れ去|行方不明|神隠し|消えた|取り残|流され|姿をくらま|逃亡|逮捕|取り押さえ|濡れ衣/,CAGED= /監禁|囚われ|閉じ込め|幽閉/,FALLEN= /堕ち|陥落|虜|巫女になった|従者|眷属|堕とされ/,ESC= /脱出|救助|生還|帰還|逃げ延び|街を出|島を出|抜け出|助けを呼びに|イカダ|生き延び/;
function fateCat(c){
var f=String(c.fate||'');
if(c.alive===false)return'dead';
if(c.caged||CAGED.test(f))return'caged';
if(FALLEN.test(f))return'fallen';
if(GONE.test(f))return'';
if(ESC.test(f))return'escape';
return'live';
}
X.fateCat=fateCat;
function topMood(e,th){
if(!e)return'calm';
var best='calm',bv=th;
['joy','grief','fear','anger','shame','lust'].forEach(function(k){if(k==='lust'&&safe())return;if(e[k]!=null&&e[k]>=bv){bv=e[k];best=k;}});
return best;
}
function fill(t,m){return String(t).replace(/\{(\w+)\}/g,function(x,k){return m[k]!=null?m[k]:x;});}
function relOf(res,c){
var C=res.chars||[];
if(c.lossOf!=null&&C[c.lossOf]&&C[c.lossOf].alive===false)return{k:'lost',b:C[c.lossOf]};
var lov=null,lost=null;
(res.pairs||[]).forEach(function(p){
if(p.a!==c.i&&p.b!==c.i)return;
var o=C[p.a===c.i?p.b:p.a],g=LABEL_G[p.label]||CLS_G[p.cls];
if(!o)return;
if(g==='love'||(p.tie&& /^(?:lover|spouse|mate|fated)$/.test(p.tie.type)&&g!=='apart'&&g!=='rival')){if(o.alive===false)lost=lost||o;else if(/^(?:live|escape)$/.test(fateCat(o)))lov=lov||o;}
else if(o.alive===false&&(g==='pining'||(g==='oneway'&&p.dir===c.i)))lost=lost||o;
});
if(lov)return{k:'with',b:lov};
if(lost)return{k:'lost',b:lost};
return{k:'alone',b:null};
}
function one(t,a){
var k=a==='polite'?2:a==='stern'||a==='cool'?1:0;
return String(t).replace(/「([^「」]*｜[^「」]*)」/g,function(m,q){
var v=q.split('｜'),out=[];
v.forEach(function(x,i){out[i]=x==='＝'&&i>0?out[i-1]:x;});
return'「'+(out[Math.min(k,out.length-1)]||out[0])+'」';
});
}
X.one=one;
X.after=function(res,c,used){
if(!res|| !c)return'';
var fc=fateCat(c);
if(!fc)return'';
var a=att(c),seed=String(res.seed!=null?res.seed:''),p=PLACE[res.scenId]||'あの場所';
var base=pickU(AF[fc][a],seed+'|'+c.name+'|'+fc,used),rel=relOf(res,c),tail='';
var m={a:c.name,p:p,b:rel.b?rel.b.name:''};
var hpB=c.hpTo!=null&&c.hpSt&&(res.chars||[])[c.hpTo];
if(fc==='dead'){if(rel.k==='with')tail=pickU(REL.deadWith,seed+c.name+'dw',used);}
else if(fc==='live'||fc==='escape'){
if(rel.k==='lost')tail=pickU(REL.lost,seed+c.name+'l',used);
else if(rel.k==='with')tail=pickU(REL.with,seed+c.name+'w',used);
else if(hpB&&hpB.alive!==false){m.b=hpB.name;tail=pickU(/^keep/.test(c.hpSt)?REL.keep:REL.gave,seed+c.name+'hp',used);}
else{
var md=topMood(c.emo,20);
if(md==='lust')tail=HK.Emo&&HK.Emo.AFTER_LUST?pickU(HK.Emo.AFTER_LUST,seed+c.name+'m',used):'';
else if(md!=='calm'|| !(res.chars||[]).some(function(o){return o.alive===false;}))tail=pickU(MOOD[md]||MOOD.calm,seed+c.name+'m',used);
}
}
return one(fill(base+tail,m),a);
};
X.pairAfter=function(res,p,used){
var C=res.chars||[],A=C[p.a],B=C[p.b];
if(!A|| !B)return'';
var g=p.lh==='couple'?'lhcouple':LABEL_G[p.label]||CLS_G[p.cls];
if(!g|| !PAIR[g])return'';
var seed=String(res.seed!=null?res.seed:''),x=p.dir===p.b?B:A,y=x===A?B:A;
if(g==='oneway'&&x.hpSt&&x.hpTo===y.i)g= /^keep/.test(x.hpSt)?'onewayKeep':'onewayGive';
var t=pickU(PAIR[g],seed+'|'+A.name+B.name+g,used);
var ma=topMood(A.emo,25),mb=topMood(B.emo,25),tint='';
var tk=ma==='grief'||mb==='grief'?'grief':ma==='anger'||mb==='anger'?'anger':ma==='fear'||mb==='fear'?'fear':ma==='shame'&&mb==='shame'?'shame':ma==='joy'&&mb==='joy'?'joy':'';
if(tk&&PAIR_TINT[tk])tint=pickU(PAIR_TINT[tk],seed+A.name+B.name+tk,used);
return fill(t+tint,{a:A.name,b:B.name,x:x.name,y:y.name});
};
var MAXL=8;
function covered(res,E){
var C=res.chars||[],done={};
var byName={};
C.forEach(function(c){byName[c.name]=c.i;if(c.afterDone|| /その後は「/.test(c.fateNote||''))done[c.i]=1;});
(E.lines||[]).forEach(function(l){
if(typeof l!=='string')return;
var m=l.match(/^(.+?)のその後――/);
if(!m)return;
var who=m[1];
if(byName[who]!=null){done[byName[who]]=1;return;}
C.forEach(function(c){if(who.indexOf(c.name)>=0)done[c.i]=1;});
});
return done;
}
X.build=function(res,E){
if(!res|| !E|| !Array.isArray(E.lines)|| !Array.isArray(res.chars)||res.solo)return E;
try{
var C=res.chars,done=covered(res,E),out=[],used={};
var pairs=(res.pairs||[]).filter(function(p){
var A=C[p.a],B=C[p.b];
return A&&B&&A.alive!==false&&B.alive!==false&& !done[p.a]&& !done[p.b]&&(LABEL_G[p.label]||CLS_G[p.cls]);
}).sort(function(x,y){var lx=(LABEL_G[x.label]||CLS_G[x.cls])==='love'?1:0,ly=(LABEL_G[y.label]||CLS_G[y.cls])==='love'?1:0;return(ly-lx)||(y.intensity-x.intensity);});
var np=0;
pairs.forEach(function(p){
if(done[p.a]||done[p.b]||out.length>=MAXL)return;
var g=LABEL_G[p.label]||CLS_G[p.cls];
if(g!=='love'&&np>=2)return;
var t=X.pairAfter(res,p,used);
if(!t)return;
done[p.a]=done[p.b]=1;np++;
out.push(C[p.a].name+'と'+C[p.b].name+'のその後――'+t);
});
var rest=C.filter(function(c){return!done[c.i];});
rest.sort(function(x,y){return(x.alive===false?0:1)-(y.alive===false?0:1)||x.i-y.i;});
rest.forEach(function(c){
if(out.length>=MAXL)return;
var t=X.after(res,c,used);
if(t)out.push(c.name+'のその後――'+t);
});
out.forEach(function(l){E.lines.push(l);});
var last=[];
C.forEach(function(c){
if(!c.lastWords)return;
var nt=(c.notes||[]).filter(function(n){return typeof n==='string'&&n.indexOf('最期の言葉：')===0;})[0];
last.push({i:c.i,name:c.name,text:nt?nt.slice(6):c.lastWords,at:c.deathLabel||''});
});
if(last.length){
var order={};
(res.log||[]).forEach(function(e,n){if(e&&e.kind==='death'&&e.actors&&order[e.actors[0]]==null)order[e.actors[0]]=n;});
last.sort(function(x,y){return(order[x.i]==null?1e9:order[x.i])-(order[y.i]==null?1e9:order[y.i]);});
E.last=last;
}
}catch(e){}
return E;
};
X.html=function(E,res,paint){
if(!E|| !E.last|| !E.last.length)return'';
var esc=HK.escape||function(s){return String(s);},P=paint||function(t){return esc(t);};
return'<div class="elast"><div class="eyebrow" style="margin-top:12px">最期の言葉</div><ul class="elines">'+
E.last.map(function(x){return'<li>'+(x.at?'<span class="nums" style="color:var(--muted)">'+esc(x.at)+'</span>　':'')+P(x.text,res)+'</li>';}).join('')+'</ul></div>';
};
var STORY_LW={jashin:1,yakata:1,ship:1,jinro:1};
function storyAddressee(S,p,input){
var P=S.P,live=function(q){return q&&q!==p&&q.alive!==false&& !q.out&& !q.gone&& !q.taken;};
var ts=(input&&input.ties)||[];
for(var k=0;k<ts.length;k++){
var t=ts[k];
if(!/^(?:lover|spouse|mate|fated)$/.test(t.type))continue;
var o=t.a===p.i?P[t.b]:t.b===p.i?P[t.a]:null;
if(live(o))return o;
}
if(p.honmei!=null&&live(P[p.honmei]))return P[p.honmei];
for(k=0;k<ts.length;k++){var t2=ts[k];if(t2.type==='yan'&&t2.a===p.i&&live(P[t2.b]))return P[t2.b];}
if(S.bondFn){
var best=null,bv=0.55;
P.forEach(function(q){if(!live(q))return;var v=0;try{v=S.bondFn(S,p,q);}catch(e){v=0;}if(v>bv){bv=v;best=q;}});
return best;
}
return null;
}
function storyRel(S,p,input){
var P=S.P,ts=(input&&input.ties)||[],lov=null,lost=null;
ts.forEach(function(t){
if(!/^(?:lover|spouse|mate|fated)$/.test(t.type))return;
var o=t.a===p.i?P[t.b]:t.b===p.i?P[t.a]:null;
if(!o||o===p)return;
if(o.alive===false)lost=lost||o;else if(/^(?:live|escape)$/.test(fateCat({alive:true,fate:o.fate||'',caged: !!o.bound})))lov=lov||o;
});
return lov?{k:'with',b:lov}:lost?{k:'lost',b:lost}:{k:'alone',b:null};
}
X.story=function(S,res,input){
if(!S|| !res|| !S.scen)return;
if(HK.Emo&&HK.Emo.storySummary)HK.Emo.storySummary(S,res);
if(res.heroes&&S.P)S.P.forEach(function(p,k){if(p&&p.alive===false&&res.heroes[k])res.heroes[k].dead=true;});
if(!STORY_LW[S.scen.id]|| !res.ending|| !Array.isArray(res.ending.lines))return;
try{
var P=S.P,key0=P.map(function(p){return p.name;}).join(',')+'|'+(input&&input.seed);
var dead=P.filter(function(p){return p&&p.alive===false&& !revives(p)&& !p.lwNone;});
dead.sort(function(x,y){return(x._emoDeathN==null?1e9:x._emoDeathN)-(y._emoDeathN==null?1e9:y._emoDeathN);});
var lastL=[];
dead.forEach(function(p){
var how=(p.how||'')+' '+(p.fate||''),kind=P_kind(how,null),to=storyAddressee(S,p,input);
var q=compose(p,kind,to,null,key0+'|'+p.name);
p.lastWords=p.name+'「'+q+'」';
var line=p.name+'が最期に遺した言葉：「'+q+'」';
if(p._emoDeathN!=null&&S.log[p._emoDeathN]&&typeof S.log[p._emoDeathN].text==='string'&&hash(key0+'|lw|'+p.i)<0.6)S.log[p._emoDeathN].text+='　――'+line;
if(lastL.length<3)lastL.push(line);
var h=res.heroes&&res.heroes[p.i];
if(h)h.lastWords=p.lastWords;
});
lastL.forEach(function(l){res.ending.lines.push(l);});
var done={};
res.ending.lines.forEach(function(l){if(typeof l!=='string')return;var m=l.match(/^(.+?)のその後――/);if(m)P.forEach(function(p){if(m[1].indexOf(p.name)>=0)done[p.i]=1;});});
var fake={scenId:S.scen.id,seed:input&&input.seed,chars:[],pairs:[]};
var used={},n=0,order=P.slice().sort(function(x,y){return(x.alive===false?0:1)-(y.alive===false?0:1)||x.i-y.i;});
order.forEach(function(p){
if(!p||done[p.i]||n>=MAXL)return;
var c={i:p.i,name:p.name,persona:p.persona,tone:p.tone,fate:p.fate||'',alive:p.alive!==false&& !p.dead,emo:p.emo||null,caged: !!p.bound};
if(!c.alive&&revives(p)){
res.ending.lines.push(c.name+'のその後――'+fill(pickU(IMM_AFTER,String(input&&input.seed)+'|'+c.name+'|imm',used),{a:c.name})+'これで'+((p.spRev||0)+1)+'回蘇ったことになる。');
n++;
return;
}
var fc=fateCat(c);
if(!fc)return;
var a=att(c),seed=String(fake.seed!=null?fake.seed:''),pl=PLACE[fake.scenId]||'あの場所',rel=storyRel(S,p,input);
var base=pickU(AF[fc][a],seed+'|'+c.name+'|'+fc,used),tail='';
if(fc==='dead'){if(rel.k==='with')tail=pickU(REL.deadWith,seed+c.name+'dw',used);}
else if(fc==='live'||fc==='escape'){
if(rel.k==='lost')tail=pickU(REL.lost,seed+c.name+'l',used);
else if(rel.k==='with')tail=pickU(REL.with,seed+c.name+'w',used);
else{var md=topMood(c.emo,20);tail=md==='lust'?(HK.Emo&&HK.Emo.AFTER_LUST?pickU(HK.Emo.AFTER_LUST,seed+c.name+'m',used):''):md!=='calm'|| !dead.length?pickU(MOOD[md]||MOOD.calm,seed+c.name+'m',used):'';}
}
res.ending.lines.push(c.name+'のその後――'+fill(base+tail,{a:c.name,p:pl,b:rel.b?rel.b.name:''}));
n++;
});
}catch(e){}
};
var IMM_AFTER=L('{a}の体は、すべてが終わったあとで、静かに傷を塞いだ。{a}は目を開けると、何事もなかったように服の埃を払った。'+
'|{a}が倒れていた場所には、しばらくして、もう誰もいなかった。{a}はまた起き上がり、次の場所へ歩き出していた。'+
'|{a}は、物語が閉じたあとで息を吹き返した。止まっていた心臓は、何事もなかったように動き出した。');
X.IMM_AFTER=IMM_AFTER;
X.storyWords=function(S,p,input){
if(!S|| !S.P|| !p||revives(p))return'';
var key0=S.P.map(function(q){return q.name;}).join(',')+'|'+(input&&input.seed);
return compose(p,P_kind((p.how||'')+' '+(p.fate||''),null),storyAddressee(S,p,input),null,key0+'|'+p.name);
};
})();
});
;
/* ==== js/rel-kit.js ==== */
HK.Load.def(165,'js/rel-kit.js',function(){
(function(){
'use strict';
var HK=window.HK;
var RK=HK.RelKit={};
RK.L=function(s){return s.split('|');};
RK.fill=function(t,m){return String(t).replace(/\{(\w+)\}/g,function(x,k){return m[k]!=null?m[k]:x;});};
function exact(ctx,a,b,type){
var l=HK.Ties?HK.Ties.all(ctx,a,b):[];
for(var i=0;i<l.length;i++)if(l[i].type===type)return l[i];
return null;
}
RK.exact=exact;
RK.kind=function(ctx,a,b){
var t;
if((t=exact(ctx,a,b,'sibprot')))return t.a===a.i?'protA':'protB';
if(exact(ctx,a,b,'sibclose')||exact(ctx,a,b,'twin'))return'sibclose';
if((t=exact(ctx,a,b,'teacher')))return t.a===a.i?'teacherA':'teacherB';
if((t=exact(ctx,a,b,'mentor')))return t.a===a.i?'mentorA':'mentorB';
return null;
};
RK.tone=function(c){return HK.toneOf?HK.toneOf(c):'';};
RK.noRomance=function(ctx,a,b){
var l=HK.Ties?HK.Ties.all(ctx,a,b):[];
return l.some(function(t){return HK.tieNoLove(t);})||(l.some(function(t){return t.type==='teacher';})&& !HK.tiesLove(l));
};
RK.locked=function(a){return a&&HK.lockAny(a);};
RK.lockedTo=function(a,b){return a&&b&&HK.lockTo(a,b);};
RK.cool=function(ctx,a,b,id,gap){
var pf=ctx.pair(a,b),k='_rk_'+id;
if(pf[k]!=null&&ctx.stepIndex-pf[k]<(gap||6))return false;
return true;
};
RK.mark=function(ctx,a,b,id){ctx.pair(a,b)['_rk_'+id]=ctx.stepIndex;};
RK.mourn=function(scen,TEXT,idPre){
scen.events.push({
id:idPre+'_mourn',cat:'solo',scope:'solo',
when:function(ctx,a){
return ctx.chars.some(function(o){return o!==a&& !o.alive&& !(a.flags.mourned||{})[o.i]&&(RK.kind(ctx,a,o)||RK.lockedTo(a,o));});
},
w:function(){return 2.4;},
run:function(ctx,a){
var o=ctx.chars.filter(function(x){return x!==a&& !x.alive&& !(a.flags.mourned||{})[x.i]&&(RK.kind(ctx,a,x)||RK.lockedTo(a,x));})[0];
a.flags.mourned=a.flags.mourned||{};a.flags.mourned[o.i]=true;
var k=RK.kind(ctx,a,o)||'lock';
ctx.stress(a,18);
var res={text:RK.fill(ctx.pick(TEXT[k]||TEXT.lock),{a:a.name,b:o.name}),why:a.name+'は、'+o.name+'を失った（'+({protA:'我が子のように守ってきた{sib:a→b}',protB:'守ってくれた{sib:a→b}',sibclose:'親友のような{sib:a→b}',teacherA:'教え子',teacherB:'先生',mentorA:'弟子',mentorB:'師匠',lock:HK.locks(a).length>1?'恋愛の相手と決めていた一人':'ただ一人と決めていた相手'})[k]+'）',mag:30,with:[o]};
if(HK.Sib){res.text=HK.Sib.fill(res.text,a,o,null,ctx);res.why=HK.Sib.fill(res.why,a,o,null,ctx);}
return res;
}
});
};
})();
});
;
/* ==== js/food.js ==== */
HK.Load.def(191,'js/food.js',function(){
(function(){
'use strict';
var HK=window.HK;
if(!HK)return;
function L(s){return s.split('|');}
var F=HK.Food={};
var A=HK.Attr||{};
F.TASTES=A.TASTES||['甘い','しょっぱい','辛い','酸っぱい','苦い','あっさり','こってり'];
var TN={'甘い':'甘い','しょっぱい':'しょっぱい','辛い':'辛い','酸っぱい':'酸っぱい','苦い':'ほろ苦い','あっさり':'あっさりした','こってり':'こってりした'};
var P9=['proud','stern','tsun','gentle','devoted','cool','free','shy','polite'];
var TEASE={proud:1,tsun:1,free:1};
var HONEST={proud:1,stern:1,cool:1,free:1};
function arr(v){return A.foodWords?A.foodWords(v):Array.isArray(v)?v.slice(0,5):[];}
F.like=function(c){return c?arr(c.foodLike):[];};
F.hate=function(c){return c?arr(c.foodHate):[];};
F.taste=function(c){return c&&A.tasteList?A.tasteList(c.taste):[];};
F.badTastes=function(c){return c&&A.tasteHateList?A.tasteHateList(c):[];};
F.has=function(c){return!!c&&(F.like(c).length>0||F.hate(c).length>0||F.taste(c).length>0||F.badTastes(c).length>0);};
F.any=function(list){return(list||[]).some(function(c){return c&&F.has(c);});};
F.tasteWord=function(t){return TN[t]||t||'';};
function persona(c){var p=c&&HK.personaOf?HK.personaOf(c):'gentle';return P9.indexOf(p)>=0?p:'gentle';}
F.persona=persona;
function rnd(x){return typeof x==='function'?x:x&&x.rng;}
function pick(x,list){return list[Math.floor(rnd(x)()*list.length)];}
function fresh(x,list){
var U=x._foodUsed=x._foodUsed||{},f=list.filter(function(t){return!U[t];});
var t=pick(x,f.length?f:list);U[t]=1;return t;
}
function fill(t,v){
return t.replace(/\{(a|b|c|dish|taste|like|hate)\}/g,function(m,k){
var o=v[k];
if(k==='a'||k==='b'||k==='c')return o&&o.name?o.name:'';
return o==null?'':String(o);
});
}
function hit(dish,words){
if(!dish)return'';
for(var i=0;i<words.length;i++)if(words[i]&&(dish.indexOf(words[i])>=0||words[i].indexOf(dish)>=0))return words[i];
return'';
}
function mod(ctx,a,b,d){if(ctx&&typeof ctx.mod==='function'&&ctx.R&&a&&b&&a!==b)ctx.mod(a,b,d);}
function joy(ctx,c,d){if(ctx&&ctx.R&&HK.Emo&&HK.Emo.bump&&c)HK.Emo.bump(ctx,c,d);}
function tr(c,k){return c&&c.tr&&typeof c.tr[k]==='number'?c.tr[k]:0.5;}
var DISH={
home:L('肉じゃが|カレー|オムライス|生姜焼き|親子丼|焼き魚の定食|野菜炒め|味噌汁とおにぎり'),
morning:L('トースト|目玉焼き|焼き鮭の朝ごはん|フレンチトースト|卵焼き|おにぎりと味噌汁'),
cafe:L('パスタ|オムライス|サンドイッチ|ケーキ|グラタン|パンケーキ'),
famires:L('ハンバーグ|ドリア|山盛りのポテト|パフェ|唐揚げ|ナポリタン'),
school:L('焼きそばパン|唐揚げ弁当|購買のおにぎり|日替わりの定食'),
island:L('魚の塩焼き|貝のスープ|焼いた芋|木の実の和え物'),
room:L('差し入れの弁当|サンドイッチ|レトルトのカレー'),
trip:L('旅館の会席|地元の名物料理|焼きそば|浜焼き'),
nabe:L('寄せ鍋|キムチ鍋|すき焼き|水炊き|もつ鍋'),
feast:L('山菜の煮しめ|川魚の甘露煮|猪鍋|里芋の煮っころがし|赤飯'),
ship:L('配給のペースト食|乾燥野菜のスープ|合成肉のステーキ|宇宙食のカレー')
};
F.DISH=DISH;
F.dishFor=function(ctx,eater,kind){
var lk=F.like(eater);
if(lk.length&&rnd(ctx)()<0.45)return pick(ctx,lk);
return pick(ctx,DISH[kind]||DISH.home);
};
F.cook=function(ctx,who,dish,q){
var t=F.taste(who),r=rnd(ctx)();
var taste=t.length&&r<0.6?pick(ctx,t):pick(ctx,F.TASTES);
return{dish:dish||pick(ctx,DISH.home),taste:taste,q:q};
};
var REACT={
good:{
proud:L('{a}は{dish}をひと口食べて、しばらく黙った。{a}「……悪くない。いや、うまい」|{a}は無言で{dish}を平らげ、空になった器を突き出した。おかわりの合図だった。|{a}「{taste}味付けか。……こういうのでいいんだよ」――ぶっきらぼうな声の割に、箸は止まらなかった。'),
stern:L('{a}は背筋を伸ばしたまま{dish}を味わい、短く頷いた。{a}「うまい。手間をかけたのが分かる」|{a}は一口ごとに箸を置き、丁寧に{dish}を味わった。最後に「見事だ」とだけ言った。|{a}「{taste}味付けは、好みだ」――めったに褒めない{a}の一言に、場の空気が少し和らいだ。'),
tsun:L('{a}「べ、別に、うまいとか思ってないし」――そう言いながら、{a}の{dish}はいちばん先になくなった。|{a}は{dish}をひと口食べて、ぷいと顔を背けた。耳まで赤かった。{a}「……まあまあ、だし」|{a}「……{taste}の、嫌いじゃない」――{a}はそれだけ言って、黙っておかわりをよそった。'),
gentle:L('{a}は{dish}をひと口食べて、ふわりと笑った。{a}「おいしい。なんだか、ほっとする味」|{a}「{taste}味付け、好きなんだ。ありがとう」――{a}は、最後のひと口まで大事そうに食べた。|{a}は{dish}を味わいながら、何度も「おいしいね」と繰り返した。'),
devoted:L('{a}「とってもおいしいです……！」――{a}は目を輝かせて、{dish}を一口ずつ噛みしめた。|{a}は{dish}を食べ終えると、「作り方、今度教えてもらえますか」と真剣な顔で頼んだ。|{a}「{taste}の、大好きなんです」――{a}は嬉しそうに、器を両手で包んだ。'),
cool:L('{a}は{dish}をひと口食べて、わずかに目を見開いた。{a}「……火の通し方がちょうどいい。うまい」|{a}「{taste}味付けで、素材の味も残ってる。よくできてる」――淡々とした口ぶりの割に、{a}はおかわりをした。|{a}は黙々と{dish}を口に運び、気づけば皿は空になっていた。それが{a}なりの感想だった。'),
free:L('{a}「うまっ！　なにこれ、めちゃくちゃおいしい！」――{a}は{dish}をかき込んで、頬をふくらませた。|{a}は{dish}をひと口食べるなり、足をばたばたさせた。{a}「{taste}の最高！　おかわり！」|{a}「これ毎日食べたい！」――{a}は{dish}の器を抱えたまま、満面の笑みを浮かべた。'),
shy:L('{a}は{dish}をひと口食べて、小さく「……おいしい」とつぶやいた。顔が少し赤かった。|{a}「あ、あの、すごくおいしい、です……」――{a}は消え入りそうな声で言って、また一口食べた。|{a}は{taste}味付けの{dish}を、こっそり二杯目までよそっていた。見つかって、真っ赤になった。'),
polite:L('{a}は{dish}をひと口味わい、丁寧に手を合わせた。{a}「とてもおいしいです。ありがとうございます」|{a}「{taste}味付けが、とても好みです」――{a}は姿勢を正したまま、きれいに{dish}を食べ終えた。|{a}「こんなにおいしいものをいただけるなんて」――{a}は、最後のひと口まで丁寧に味わった。')
},
meh:{
proud:L('{a}は{dish}を食べて、肩をすくめた。{a}「普通だな。食えりゃいい」|{a}「可もなく不可もなく、ってとこか」――{a}はそう言いつつ、残さず食べた。|{a}は{dish}を黙って食べ終えた。うまいともまずいとも言わなかった。'),
stern:L('{a}は{dish}を静かに食べ、「悪くはない」とだけ言った。|{a}「味は、まあ普通だ。腹は満たせる」――{a}は淡々と箸を進めた。|{a}は{dish}を残さず食べ、器をきちんと重ねた。感想は特になかった。'),
tsun:L('{a}「ふつう。……ふつうだってば」――{a}は、なぜか二回言った。|{a}は{dish}をつつきながら、「まあ、食べられなくはないけど」と小さく言った。|{a}「別に文句はないし」――{a}はそっけなく言って、黙々と食べた。'),
gentle:L('{a}は{dish}を食べて、にこにこと「うん、おいしいよ」と言った。いつもどおりの、やさしい感想だった。|{a}「やさしい味だね」――{a}はそう言って、ゆっくり食べた。|{a}は{dish}を食べ終えて、「ごちそうさま」と穏やかに手を合わせた。'),
devoted:L('{a}「おいしいです」――{a}は笑顔で言ったが、いつもほど目は輝いていなかった。|{a}は{dish}をきちんと食べ終えて、「ごちそうさまでした」と頭を下げた。|{a}「次は、違う味付けのも食べてみたいです」――{a}は遠慮がちに付け足した。'),
cool:L('{a}「可もなく不可もなく、だな」――{a}は{dish}を分析するように食べ進めた。|{a}は{dish}を食べて、「悪くない。改善の余地はあるが」とだけ言った。|{a}は黙々と{dish}を食べた。感想を聞かれて、少し考えてから「標準的」と答えた。'),
free:L('{a}「うーん、ふつう！　でもお腹すいてたからおいしい！」――{a}は笑って{dish}を平らげた。|{a}は{dish}を食べながら、もう次に食べたいものの話を始めていた。|{a}「まあまあかな！」――{a}は正直に言って、けらけら笑った。'),
shy:L('{a}は{dish}を小さな口で食べて、「……おいしい、と思います」と自信なさげに言った。|{a}は感想を聞かれて、少し困ったように笑った。{a}「ふ、ふつうに、おいしいです」|{a}は黙って{dish}を食べ終え、そっと「ごちそうさま」とつぶやいた。'),
polite:L('{a}「ごちそうさまでした。おいしくいただきました」――{a}の感想は、いつもどおり礼儀正しかった。|{a}は{dish}を丁寧に食べ終え、静かに手を合わせた。|{a}「やさしいお味ですね」――{a}は穏やかに言って、残さず食べた。')
},
bad:{
proud:L('{a}は{dish}をひと口食べて、顔をしかめた。{a}「……なんだこれ。{taste}にもほどがあるだろ」|{a}「まずい」――{a}は即答した。それでも、出されたものは全部食べた。|{a}は{dish}を飲み込んで、水をあおった。{a}「次はもうちょいましなもん作れよ」'),
stern:L('{a}は{dish}を一口食べて、眉間に皺を寄せた。{a}「……正直に言う。これは、うまくない」|{a}は表情を変えずに{dish}を食べきり、「次は味見をしてから出すといい」と静かに言った。|{a}「味が強すぎる。だが、食べられないほどではない」――{a}はそう言って、最後まで箸を置かなかった。'),
tsun:L('{a}「うわ、なにこれ。……べ、別に、食べないとは言ってないし」――{a}は顔をしかめたまま、{dish}をつついた。|{a}は{dish}をひと口食べて、ものすごい顔をした。{a}「下手くそ。……でも、残すのはもったいないから」|{a}「まずい！　まずいけど、次も味見してあげてもいい」――{a}はそっぽを向いて言った。'),
gentle:L('{a}は{dish}をひと口食べて、一瞬だけ固まった。それから、何事もなかったように笑った。{a}「うん、大丈夫。食べられるよ」|{a}「ちょっと、思ってたのと違う味かも。でも、作ってくれたのが嬉しい」――{a}はやさしく言って、箸を進めた。|{a}は苦笑いしながら、{dish}を最後まで食べた。{a}「次は一緒に作ろうか」'),
devoted:L('{a}「だ、大丈夫です、おいしいです……！」――{a}は涙目で言って、無理やり{dish}を飲み込んだ。|{a}は顔色ひとつ変えずに{dish}を食べきろうとして、途中でそっと水を飲んだ。|{a}「作ってもらえただけで、嬉しいので」――{a}は健気に笑って、最後まで食べた。'),
cool:L('{a}は{dish}をひと口食べて、冷静に言った。{a}「火が強すぎた。それと、味の配分が偏ってる」|{a}「まずい、というより、方向性の問題だな」――{a}は淡々と原因を分析しはじめた。|{a}は無表情で{dish}を飲み込み、「改善点は三つある」と指を立てた。'),
free:L('{a}「うえっ、なにこれ！」――{a}は正直すぎる声を上げて、それから吹き出した。{a}「ごめん、でもこれはさすがに！」|{a}は{dish}をひと口食べて、変な顔をしてみせた。{a}「{taste}の通り越して、新しい味がする！」|{a}「これ、罰ゲームのやつ？」――{a}はけらけら笑いながら、それでも全部食べた。'),
shy:L('{a}は{dish}をひと口食べて、固まった。何か言おうとして、結局「……い、いただきます」ともう一度言った。|{a}はまずいとは言えずに、小さく小さく{dish}を食べ続けた。|{a}「あ、あの……ちょっとだけ、お水、もらってもいいですか」――{a}は申し訳なさそうに言った。'),
polite:L('{a}は表情を崩さずに{dish}を口に運び、「個性的なお味ですね」とだけ言った。|{a}「お気持ちはとても嬉しいです。……少しだけ、お水をいただけますか」――{a}は穏やかに言った。|{a}は丁寧に{dish}を食べきり、「ごちそうさまでした」と頭を下げた。少しだけ、笑顔が硬かった。')
}
};
var TASTE_BY=L('{b}の{dish}は、今日は{taste}味付けだった。|ひと口目で分かった。{b}の作った{dish}は、{taste}仕上がりだ。|{b}が作った{dish}は、{taste}味に寄っていた。|{b}の{dish}は、いつもより{taste}味付けになっていた。');
var TASTE_NO=L('{dish}は、{taste}味付けだった。|運ばれてきた{dish}は、{taste}仕上がりだった。|ひと口食べると、{dish}は思ったより{taste}味だった。');
var LIKE_DISH=L('{dish}は、{a}の好物だった。|{a}の前に置かれたのは、好物の{dish}だった。|{a}は、好物の{dish}を前にして目を輝かせた。');
var AFTER={
good:L('{b}は、少し得意げに鼻を鳴らした。|{b}は照れくさそうに笑って、{a}の器にもう一杯よそった。|{b}「でしょ｜だろう｜でしょう」――{b}は胸を張った。|{b}は、きれいになった{a}の器を見て、こっそり嬉しそうにしていた。'),
tease:L('{b}「うるさい。じゃあ次は{a}が作って｜うるさい。では次は{a}が作れ｜うるさいですよ。では次は{a}が作ってください」――言い返しながら、{b}も少し笑っていた。|{b}は{a}の頭を軽く小突いた。二人とも、なんだか楽しそうだった。|{b}「覚えてろ｜覚えていろ｜覚えていてください」――{b}は悔しそうに言って、もう次の献立を考えはじめた。'),
care:L('{b}は申し訳なさそうに頭をかいた。{a}の気遣いが、かえって身にしみた。|{b}「……次は、ちゃんと味見する｜……次は、きちんと味見する｜……次は、ちゃんと味見します」――{a}は笑って頷いた。|{b}は、文句ひとつ言わずに食べてくれた{a}に、こっそり感謝した。')
};
F.verdict=function(ctx,c,taste,dish,q){
var s=0,why=[];
if(q!=null)s+=[-1.2,-0.2,0.6,1.2][Math.max(0,Math.min(3,q))];
var lk=hit(dish,F.like(c)),hs=hit(dish,F.hate(c));
if(lk){s+=2;why.push('好物（'+lk+'）');}
if(hs){s-=2.5;why.push('嫌いな食べ物（'+hs+'）');}
if(taste&&F.taste(c).indexOf(taste)>=0){s+=1.6;why.push('好きな味（'+taste+'）');}
else if(taste&&F.badTastes(c).indexOf(taste)>=0){s-=1.4;why.push('苦手な味（'+taste+'）');}
if(!F.has(c)){s+=(tr(c,'np')*0.4+tr(c,'fc')*0.4-tr(c,'cp')*0.5)-0.15;why.push('好みは決めていない（気質から）');}
s+=(rnd(ctx)()-0.5)*1.6;
return{v:s>=0.8?'good':s<= -0.8?'bad':'meh',why:why.join('・'),like:lk,hate:hs};
};
F.react=function(ctx,c,taste,dish,o){
o=o||{};
var V=F.verdict(ctx,c,taste,dish,o.q),p=persona(c);
var t=fill(fresh(ctx,REACT[V.v][p]),{a:c,b:o.cook,dish:dish,taste:F.tasteWord(taste)});
return{v:V.v,text:t,why:c.name+'：'+({good:'うまい',meh:'ふつう',bad:'まずい'})[V.v]+'（'+(V.why||'味の当たり外れ')+'）',like:V.like,hate:V.hate,persona:p};
};
var HATE={
proud:L('{b}が出した皿に{hate}を見つけて、{a}ははっきり言った。{a}「{hate}は食わない。悪いな」|{a}は{hate}を箸でつまんで、黙って{b}の皿に移した。{a}「これだけは無理だ」|{a}「{hate}入ってんじゃねえか」――{a}は顔をしかめたが、ほかのものはきれいに食べた。'),
stern:L('{a}は{hate}を前にして、一瞬だけ箸を止めた。{a}「……実は{hate}が苦手だ。だが、出されたものは食べる」|{a}は{hate}を一息に飲み込み、表情を崩さなかった。あとで{b}にだけ「苦手なんだ」と打ち明けた。|{a}「{hate}は好かん。……次からは抜いてくれると助かる」――{a}は言うべきことを言って、残りを黙って食べた。'),
tsun:L('{a}「べ、別に{hate}が嫌いなわけじゃないし」――そう言う{a}の箸は、{hate}だけを器用に避けていた。|{a}は{hate}をこっそり皿の端に寄せた。{b}に見つかって、{a}「……見なかったことにして」|{a}は意地で{hate}を口に入れ、涙目で飲み込んだ。{a}「よ、余裕だし」'),
gentle:L('{a}は{hate}がのった皿を前に、にこにこと「いただきます」と言った。苦手なことは、最後まで口にしなかった。|{a}は{hate}を、ほかのおかずと一緒にそっと口に運んだ。{b}には、苦手だと気づかれないように。|{a}「うん、おいしいよ」――{hate}を飲み込んだあと、{a}はこっそり水を多めに飲んだ。'),
devoted:L('{a}は{hate}を見て一瞬固まったが、すぐに笑顔を作った。{a}「いただきます……！」|{a}は苦手な{hate}を、{b}が用意してくれたものだからと、目をつぶって食べきった。|{a}「お、おいしいです」――{hate}を食べる{a}の手は、少しだけ震えていた。'),
cool:L('{a}は{hate}を見て、淡々と言った。{a}「{hate}は食べない主義なんだ。理由は聞かないでくれ」|{a}「{hate}が苦手だ。食感が合わない」――{a}は理由まで正確に説明して、{hate}だけを皿の端に除けた。|{a}は{hate}を除けながら、{b}に代わりのものを頼んだ。迷いのない手つきだった。'),
free:L('{a}「あっ、{hate}！　ごめん、これだけ無理！」――{a}は両手を合わせて、{hate}を{b}の皿に移した。|{a}は{hate}を見るなり「うげっ」と声を上げた。正直すぎて、{b}は怒る気も失せた。|{a}「{hate}ってさ、なんでこの世にあるんだろうね」――{a}は真顔で言って、{hate}を避けて食べた。'),
shy:L('{a}は{hate}を前に、何も言えずにうつむいた。結局、小さく切って少しずつ飲み込んだ。|{a}は{hate}を残すこともできず、もじもじと箸を動かした。{b}が気づいて、そっと皿を引き取った。|{a}「だ、大丈夫です……」――{hate}を口に入れた{a}は、今にも泣きそうだった。'),
polite:L('{a}は{hate}を前にして、穏やかに微笑んだ。{a}「いただきます」――苦手であることは、おくびにも出さなかった。|{a}「申し訳ありません、{hate}が少し苦手でして」――{a}は丁寧に詫びてから、ほかのものをきれいに食べた。|{a}は{hate}を上品に口に運び、静かに飲み込んだ。表情は最後まで崩れなかった。')
};
F.hateScene=function(ctx,a,b,item){
var h=F.hate(a);
if(!h.length)return null;
item=item&&h.indexOf(item)>=0?item:pick(ctx,h);
var p=persona(a),t=fresh(ctx,HATE[p]);
var honest=HONEST[p]||(p==='polite'&& /申し訳/.test(t))||(p==='stern');
var hide= !honest;
if(honest)mod(ctx,b,a,{trust:1});
else if(ctx&&ctx.R&&typeof ctx.stress==='function')ctx.stress(a,2);
return{text:fill(t,{a:a,b:b,hate:item}),why:a.name+'の嫌いな食べ物（'+item+'）を出された：'+(hide?'苦手を隠した':'正直に言った')+'（態度「'+((HK.PERSONA&&HK.PERSONA[p]&&HK.PERSONA[p].label)||p)+'」）',hide:hide};
};
var TALK={
remember:L('{a}は、{b}の好物が{like}だということを、ちゃんと覚えていた。|{a}「{like}、好きだったよね｜{like}が好きだったな｜{like}、お好きでしたよね」――{b}は、前に一度話しただけのことを覚えられていて、少し照れた。|{b}が前に一度だけ口にした「{like}が好き」を、{a}は忘れていなかった。'),
gift:L('{a}は帰り道に、{b}の好きな{like}を買ってきた。{b}の顔が、ぱっと明るくなった。|{a}は「ついでだから｜ついでだ｜ついでですから」と言って、{b}に{like}を差し入れた。ついでにしては、ちょうど{b}の好きな店のものだった。|{a}がそっと置いていった袋の中には、{b}の好物の{like}が入っていた。'),
share:L('{a}は、自分の分の{like}を、黙って{b}の皿に取り分けた。{b}の好物だと知っていた。|{a}「{like}、こっちの分もあげる｜{like}、こちらの分もやる｜{like}、こちらの分も差し上げます」――{b}の好物だと、とっくに知っていた。|{a}は大皿の{like}を、{b}の分だけ多めによそった。'),
hate:L('{a}は、{b}が{hate}を苦手なのを覚えていて、{b}の皿の{hate}を黙って引き取った。|{a}「{hate}、抜いといたよ｜{hate}は抜いておいた｜{hate}、抜いておきました」――{b}は、前に一度話しただけの苦手を覚えられていて、少し驚いた。|{a}は注文のとき、さりげなく「片方は{hate}抜きで｜片方は{hate}抜きで頼む｜片方は{hate}抜きでお願いします」と言い添えた。{b}の分だった。'),
self:L('{a}は好物の{like}の話になると、急に早口になった。|{a}は、{like}さえあれば機嫌がいい。今日もそうだった。|{a}は「{like}が食べたい｜＝｜{like}が食べたいです」と、今日三回目の独り言を言った。'),
selfTaste:L('{a}は、何でも{taste}味付けにしたがる。今日も例外ではなかった。|{a}は{taste}ものに目がない。今日も、つい手が伸びた。|{a}の好みは、昔から{taste}味付けだった。')
};
F.talk=function(ctx,a,b,kinds){
if(!a)return null;
kinds=kinds||['remember','gift','share','hate'];
var bl=b?F.like(b):[],bh=b?F.hate(b):[],ks=[];
kinds.forEach(function(k){if(k==='hate'?bh.length:bl.length)ks.push(k);});
var k,v={a:a,b:b};
if(ks.length){k=pick(ctx,ks);if(k==='hate')v.hate=pick(ctx,bh);else v.like=pick(ctx,bl);}
else if(F.like(a).length){k='self';v.like=pick(ctx,F.like(a));}
else if(F.taste(a).length){k='selfTaste';v.taste=F.tasteWord(pick(ctx,F.taste(a)));}
else return null;
if(k==='gift'||k==='share'||k==='hate')mod(ctx,b,a,{aff:2});
if(k==='remember')mod(ctx,b,a,{aff:1,trust:1});
var who=k==='self'||k==='selfTaste'?a:b;
return{text:fill(fresh(ctx,TALK[k]),v),why:who.name+'の'+(k==='hate'?'嫌いな食べ物（'+v.hate+'）':k==='selfTaste'?'好きな味':'好物（'+v.like+'）'),kind:k};
};
F.meal=function(ctx,cook,eater,dish,o){
o=o||{};
if(!eater)return null;
var hs=F.hate(eater),hd=hit(dish,hs);
if(hs.length&&(hd||(o.hateChance&&rnd(ctx)()<o.hateChance)))return F.hateScene(ctx,eater,cook||o.server||eater,hd||null);
var M=F.cook(ctx,cook&&cook!==eater?cook:null,dish,o.q);
var lk=hit(M.dish,F.like(eater));
var head=(lk?fill(fresh(ctx,LIKE_DISH),{a:eater,dish:M.dish}):'')+fill(fresh(ctx,cook&&cook!==eater?TASTE_BY:TASTE_NO),{b:cook,dish:M.dish,taste:F.tasteWord(M.taste)});
var R=F.react(ctx,eater,M.taste,M.dish,{q:o.q,cook:cook});
var text=head+R.text,mode='';
if(cook&&cook!==eater){
mode=R.v==='good'?'good':R.v==='bad'?(TEASE[R.persona]?'tease':'care'):'';
if(mode&& !o.noAfter)text+=fill(fresh(ctx,AFTER[mode]),{a:eater,b:cook});
if(mode==='good'){mod(ctx,eater,cook,{aff:3,trust:1});mod(ctx,cook,eater,{aff:1});joy(ctx,eater,{joy:5});}
else if(mode==='tease'){mod(ctx,eater,cook,{aff:1});mod(ctx,cook,eater,{aff:1,ten:1});}
else if(mode==='care'){mod(ctx,cook,eater,{aff:3,trust:2});}
}else if(R.v==='good')joy(ctx,eater,{joy:4});
return{text:text,v:R.v,taste:M.taste,dish:M.dish,why:'味付けは'+M.taste+'・'+R.why+(mode==='good'?'（'+eater.name+'→'+cook.name+' 好意＋）':mode==='tease'?'（からかい）':mode==='care'?'（気遣い）':''),mode:mode};
};
var DAILY_P={meal:0.75,out:0.7,share:0.55,gift:0.6,picky:0.85};
function spotKind(ctx){
var s=HK.Daily&&HK.Daily.at?String(HK.Daily.at(ctx)||''):'';
if(ctx._dailyCur&&ctx._dailyCur.time==='morning'&& /^home/.test(s))return'morning';
if(/^island/.test(s))return'island';
if(/^room/.test(s))return'room';
if(/cafe/.test(s))return'cafe';
if(/famires/.test(s))return'famires';
if(/school|office/.test(s))return'school';
if(/^trip/.test(s))return'trip';
return'home';
}
F.daily=function(ctx,kind,a,b,c){
var P=[a,b,c].filter(Boolean);
if(!F.any(P)|| !DAILY_P[kind])return null;
if(rnd(ctx)()>=DAILY_P[kind])return null;
var withPref=P.filter(F.has);
if(kind==='picky'){
var hh=P.filter(function(x){return F.hate(x).length;});
if(hh.length){var e0=pick(ctx,hh);return F.hateScene(ctx,e0,e0===a?b:a);}
return F.talk(ctx,a,b,['remember','share'])||F.talk(ctx,b,a,['remember','share']);
}
if(kind==='gift')return F.talk(ctx,a,b,['gift','remember'])||F.talk(ctx,b,a,['gift','remember']);
if(kind==='share'){
var x=F.like(b).length||F.hate(b).length?[a,b]:F.like(a).length||F.hate(a).length?[b,a]:[a,b];
return F.talk(ctx,x[0],x[1],['share','hate','remember']);
}
var cook=kind==='meal'?a:null;
var eaters=P.filter(function(x){return x!==cook;}),pref=eaters.filter(F.has);
var eater=pick(ctx,pref.length?pref:eaters.length?eaters:withPref);
if(!eater)return null;
var dish=kind==='meal'&&c?pick(ctx,DISH.nabe):F.dishFor(ctx,eater,spotKind(ctx));
return F.meal(ctx,cook,eater,dish,{hateChance:0.12,server:eater===a?b:a});
};
var INTRO={
like:L('{a}がぽろっと「{like}に目がなくて｜{like}に目がないのだ｜{like}に目がないんです」と言うと、{b}が「わかる｜分かる｜分かります」と身を乗り出した。|好物を聞かれた{a}は、迷わず「{like}」と答えた。答えるのが少し早すぎて、皆が笑った。|{a}は{like}のおいしい店の話を始めて、止まらなくなった。{b}がスマホに店の名前をメモしていた。'),
hate:L('{a}が「{hate}だけはどうしても無理｜{hate}だけはどうしても無理だ｜{hate}だけはどうしても無理なんです」と言うと、{b}が「えっ、おいしいのに｜なに、うまいのにか｜えっ、おいしいですよ」と目を丸くした。|苦手な食べ物の話で、{a}は{hate}について熱く語った。誰も止められなかった。|{a}「{hate}は、昔からずっと苦手で｜{hate}は、昔からずっと苦手だ｜{hate}は、昔からずっと苦手なんです」――少し恥ずかしそうに言う{a}に、{b}が笑った。'),
taste:L('{a}は「味付けは、断然{taste}のが好き｜味付けは、断然{taste}のが好きだ｜味付けは、断然{taste}のが好きです」と言い切った。{b}は「意外｜意外だ｜意外です」と目を瞬かせた。|{b}が「{a}って、{taste}もの好きそう｜{a}は、{taste}ものが好きそうだ｜{a}は、{taste}ものがお好きそうですね」と言うと、{a}は「なんで分かったの｜なぜ分かった｜どうして分かったんですか」と驚いた。|{a}の好みが{taste}味付けだと分かって、{b}は「今度いい店がある｜＝｜今度、いいお店がありますよ」と言った。'),
same:L('{a}と{b}の好物が、どちらも{like}だと分かった。二人は顔を見合わせて、なぜか握手をした。|「{like}！」――{a}と{b}の声が、せーので重なった。好物が同じだった。|{a}と{b}は、{like}の話で妙に意気投合した。周りが置いていかれるほどだった。')
};
F.intro=function(ctx,list,topic){
var P=(list||[]).filter(Boolean);
if(!F.any(P))return null;
if(!topic&&rnd(ctx)()>=0.12)return null;
var cand=[];
for(var i=0;i<P.length;i++)for(var j=0;j<P.length;j++){
if(i===j)continue;
var x=P[i],y=P[j],same=F.like(x).filter(function(w){return F.like(y).indexOf(w)>=0;});
if(same.length&&i<j&&topic!=='hate')cand.push({k:'same',a:x,b:y,like:same[0],w:3});
if(F.like(x).length&&topic!=='hate'&&topic!=='taste')cand.push({k:'like',a:x,b:y,w:2});
if(F.hate(x).length&&(topic==='hate'|| !topic))cand.push({k:'hate',a:x,b:y,w:topic==='hate'?3:1});
if(F.taste(x).length&&topic!=='hate')cand.push({k:'taste',a:x,b:y,w:topic==='taste'?3:1});
}
if(!cand.length)return null;
var tot=cand.reduce(function(s,o){return s+o.w;},0),r=rnd(ctx)()*tot,it=cand[0];
for(var n=0;n<cand.length;n++){r-=cand[n].w;if(r<0){it=cand[n];break;}}
var v={a:it.a,b:it.b};
if(it.k==='same')v.like=it.like;
else if(it.k==='like')v.like=pick(ctx,F.like(it.a));
else if(it.k==='hate')v.hate=pick(ctx,F.hate(it.a));
else v.taste=F.tasteWord(pick(ctx,F.taste(it.a)));
if(it.k==='same'){mod(ctx,it.a,it.b,{aff:3});mod(ctx,it.b,it.a,{aff:3});}
else mod(ctx,it.b,it.a,{aff:1});
return{text:fill(fresh(ctx,INTRO[it.k]),v),why:it.a.name+'の'+({like:'好物（'+v.like+'）',hate:'嫌いな食べ物（'+v.hate+'）',taste:'好きな味',same:'好物が'+it.b.name+'と同じ（'+v.like+'）'})[it.k],a:it.a,b:it.b,kind:it.k};
};
var RATION={
good:L('配給の箱の中に、{b}の好物の{like}味の非常食がひとつだけ入っていた。{a}は黙ってそれを{b}に回した。|{a}は自分の配給から、{b}の好きな{like}を少しだけ取り分けた。|{b}の好物が{like}だと知っていた{a}は、配給の献立表を見て「今日は当たりだよ｜今日は当たりだ｜今日は当たりですよ」と教えた。'),
bad:L('取り合いになったのは、{a}の好物の{like}の缶詰だった。|{a}は、{like}だけは譲れないと言い張った。|{a}は、最後の{like}を{b}に先に取られて、むっとした。'),
hate:L('配給のメニューは、{a}の嫌いな{hate}だった。{a}は黙って半分を{b}に押しつけた。|{a}は{hate}入りのペーストを前に、長いこと睨み合っていた。|{a}「また{hate}か｜＝｜また{hate}ですか」――配給の箱を開けた{a}は、天井を仰いだ。')
};
F.ration=function(S,a,b,bad){
if(!F.any([a,b]))return null;
if(rnd(S)()>=0.45)return null;
var k,v={a:a,b:b};
if(bad&&F.like(a).length){k='bad';v.like=pick(S,F.like(a));}
else if(bad&&F.like(b).length){k='bad';v={a:b,b:a,like:pick(S,F.like(b))};}
else if(!bad&&F.like(b).length){k='good';v.like=pick(S,F.like(b));}
else if(!bad&&F.like(a).length){k='good';v={a:b,b:a,like:pick(S,F.like(a))};}
else if(F.hate(a).length){k='hate';v.hate=pick(S,F.hate(a));}
else if(F.hate(b).length){k='hate';v={a:b,b:a,hate:pick(S,F.hate(b))};}
else return null;
return{text:fill(fresh(S,RATION[k]),v),why:(k==='good'?v.b:v.a).name+'の'+(k==='hate'?'嫌いな食べ物（'+v.hate+'）':'好物（'+v.like+'）')};
};
var FEAST={
like:L('膳の料理の中に、{a}の好物の{like}に似た一品があった。{a}の箸が、そこだけやけに進んだ。|{a}は村の女たちに好物を聞かれて、「{like}」と答えた。女たちは顔を見合わせて、「次の宴で出そうかね」と笑った。|{a}は山菜の煮しめをつつきながら、「{like}が食べたいな｜{like}が食べたいものだ｜{like}が食べたいです」と小さくつぶやいた。隣の村人には聞こえなかったらしい。'),
hate:L('{a}の前の小鉢には、苦手な{hate}が入っていた。{a}は村人の目を気にして、黙って飲み込んだ。|{a}は膳の{hate}を、こっそり隣の皿に移した。誰にも見られていないことを祈った。|{a}は{hate}ののった皿を前に、箸を止めたまま固まっていた。村の女が「遠慮しないで」と笑った。')
};
var LONG=L('{a}は焚き火を見つめながら、「帰ったら、{like}が食べたい｜＝｜帰ったら、{like}が食べたいです」とつぶやいた。|{a}「{like}……{like}が食べたい……｜＝｜{like}……{like}が食べたいです……」――島に来てから、それが{a}の口癖になっていた。|{a}は{like}の味を思い出そうとして、うまく思い出せずに少しだけ寂しくなった。|{a}が「これ、ちょっと{like}に似てる｜これは、少し{like}に似ている｜これ、ちょっと{like}に似ています」と言うと、皆が一斉に「似てない｜似ていない｜似ていません」と言った。');
F.longing=function(ctx,c){
var l=F.like(c);
if(!l.length)return null;
var v={a:c,like:pick(ctx,l)};
return{text:fill(fresh(ctx,LONG),v),why:c.name+'の好物（'+v.like+'）'};
};
F.feast=function(S,list,dishKind){
var P=(list||[]).filter(F.has);
if(!P.length||rnd(S)()>=0.6)return null;
var a=pick(S,P),v={a:a};
if(F.like(a).length&&rnd(S)()<0.55){v.like=pick(S,F.like(a));return{text:fill(fresh(S,FEAST.like),v),why:a.name+'の好物（'+v.like+'）',who:a};}
if(F.hate(a).length&&rnd(S)()<0.5){v.hate=pick(S,F.hate(a));return{text:fill(fresh(S,FEAST.hate),v),why:a.name+'の嫌いな食べ物（'+v.hate+'）',who:a};}
var dish=pick(S,DISH[dishKind]||DISH.feast),taste=pick(S,F.TASTES);
var head=fill(fresh(S,TASTE_NO),{dish:dish,taste:F.tasteWord(taste)}),R=F.react(S,a,taste,dish,{});
return{text:head+R.text,why:'味付けは'+taste+'・'+R.why,who:a};
};
F.HOOK={
classroom:{c_bento:'share',c_canteen:'gift',c_roof:'share',c_invite_alone:'share',c_lunch_early:'self'}
};
F.hookMini=function(scen,map){
(HK.MINI&&HK.MINI[scen]||[]).forEach(function(ev){
var k=map[ev.id];
if(!k||ev._foodHook||typeof ev.run!=='function')return;
var run0=ev.run;
ev._foodHook=k;
ev.run=function(ctx,a,b){
var r=run0.apply(this,arguments);
if(!r|| !r.text|| !F.any(k==='self'?[a]:[a,b]))return r;
if(rnd(ctx)()>=0.4)return r;
var x=k==='self'?F.talk(ctx,a,null):k==='gift'?F.talk(ctx,a,b,['gift','remember']):F.talk(ctx,a,b,['share','hate','remember'])||F.talk(ctx,b,a,['share','hate','remember']);
if(x){r.text+=x.text;r.why=(r.why?r.why+'／':'')+x.why;}
return r;
};
});
};
Object.keys(F.HOOK).forEach(function(s){F.hookMini(s,F.HOOK[s]);});
})();
});
;
/* ==== js/fam-kin.js ==== */
HK.Load.def(206,'js/fam-kin.js',function(){
(function(){
'use strict';
var HK=window.HK;
HK.kinNG=function(P,ties){
if(!P|| !HK.tieNoLove)return;
(ties||[]).forEach(function(t){
if(!t||t.a===t.b|| !HK.tieNoLove(t))return;
var a=P[t.a],b=P[t.b];
if(!a|| !b||a===b)return;
if(!Array.isArray(a.ng))a.ng=[];
if(!Array.isArray(b.ng))b.ng=[];
if(a.ng.indexOf(b.i)<0)a.ng.push(b.i);
if(b.ng.indexOf(a.i)<0)b.ng.push(a.i);
});
if(HK.loveOffMark)HK.loveOffMark(P,ties);
if(HK.hostMark)HK.hostMark(P,ties);
};
HK.fearNG=function(P,ties){
if(!P)return;
(ties||[]).forEach(function(t){
if(!t||t.a===t.b||(t.type!=='apathy'&&t.type!=='fear'))return;
var a=P[t.a],b=P[t.b];
if(!a|| !b||a===b)return;
var lv= !!(HK.tieLoveOK&&HK.tieLoveOK(t)),f=lv?'noSex':'noLove';
if(t.type==='fear'){
if(lv&&HK.fearHold)HK.fearHold(a,b);
if(HK.tieBodyOK&&HK.tieBodyOK(t)){
if(HK.loveOffMark&& !lv)HK.loveOffMark(P,[t]);
var fo=a.fearOf=Array.isArray(a.fearOf)?a.fearOf:[],fb=a.fearBody=Array.isArray(a.fearBody)?a.fearBody:[];
if(fo.indexOf(b.i)<0)fo.push(b.i);
if(fb.indexOf(b.i)<0)fb.push(b.i);
return;
}
}
[[a,b],[b,a]].forEach(function(q){var l=q[0][f]=Array.isArray(q[0][f])?q[0][f]:[];if(l.indexOf(q[1].i)<0)l.push(q[1].i);});
});
};
var ST=HK.Story;
if(ST&&ST.state&& !ST.state._kin){
var st0=ST.state;
ST.state=function(input,scenId){
var S=st0.apply(this,arguments);
HK.kinNG(S&&S.P,input&&input.ties);
HK.fearNG(S&&S.P,input&&input.ties);
return S;
};
ST.state._kin=true;
}
})();
});
;
/* ==== js/obsess-kit.js ==== */
HK.Load.def(318,'js/obsess-kit.js',function(){
(function(){
'use strict';
var HK=window.HK;
if(!HK)return;
var clamp=HK.clamp,O=HK.Obsess=HK.Obsess||{};
O.PACK=O.PACK||{};
function L(s){return s.split('|');}
function R(ctx,a,b){return ctx.R(a,b);}
var SAFE=function(){return!!HK.SAFE_ON;};
function tieAll(ctx,a,b){return HK.Ties?HK.Ties.all(ctx,a,b):[];}
O.yanTie=function(ctx,a,b){var l=tieAll(ctx,a,b);for(var i=0;i<l.length;i++)if(l[i].type==='yan'&&l[i].a===a.i)return l[i];return null;};
O.noTie=function(ctx,a,b){return tieAll(ctx,a,b).some(function(t){return HK.TIES[t.type]&&HK.TIES[t.type].noObsess;});};
O.blocked=function(ctx,a,b){
if(!a|| !b||a===b)return true;
if(O.noTie(ctx,a,b))return true;
var pf=ctx.pair(a,b);
if(pf.kin)return true;
if(ctx.env&&ctx.env.romance===0)return true;
if(HK.lockOut(a,b))return true;
if(HK.Ties&&HK.Ties.apathy&&(HK.Ties.apathy(ctx,a,b)||HK.Ties.fears(ctx,a,b)))return true;
var y0=O.yanTie(ctx,a,b),nl=y0&&HK.noLovePair&&HK.noLovePair(a,b);
var a1=nl?Object.assign({},a,{noLove:null}):a,b1=nl?Object.assign({},b,{noLove:null}):b;
var chk=function(){return(!pf.couple&& !HK.canLove(a1,b1)&& !(y0&&HK.canLove(Object.assign({},a1,{likes:''}),b1)))|| !!(HK.Pos&&HK.Pos.clash&&HK.Pos.clash(a1,b1));};
return y0&&HK.Pos&&HK.Pos.forceOpen?HK.Pos.forceOpen(ctx,[a1,b1],chk):chk();
};
O.jealOk=function(ctx,a,c){return!(c&&O.blocked(ctx,a,c));};
function st(ctx,a,b){
var pf=ctx.pair(a,b),m=pf.ob=pf.ob||{};
if(!m[a.i]){
var y=O.yanTie(ctx,a,b);
m[a.i]={lv:y?55+(y.cold==='mutual'?8:y.cold==='hate'?6:0):0,set: !!y,seen:y?2:0,at: -9,climax:null,cage:null};
}
return m[a.i];
}
O.state=st;
O.why=function(ctx,a,b){return why(ctx,a,b,st(ctx,a,b));};
O.level=function(ctx,a,b){return O.blocked(ctx,a,b)?0:st(ctx,a,b).lv;};
O.stage=function(lv){return lv>=80?3:lv>=60?2:lv>=35?1:0;};
O.NAT_CAP=34;
O.surgeOk=function(a,att){return(a.tr.jealous||0)>=0.7&&att>=70;};
O.SURGE_P=0.2;
O.add=function(ctx,a,b,d){
if(O.blocked(ctx,a,b)|| !b.alive)return 0;
var kit=ctx.scen&&ctx.scen.obsessKit,s=st(ctx,a,b),k=d>0?(0.55+a.tr.jealous*0.9)*((kit&&kit.pace)||1):1;
if(d>0)k*=HK.Dark.pace(ctx);
if(d>0&&HK.Gap&&O.subOf(ctx,a,b))k*=1+0.5*HK.Gap.of(ctx,a,b);
var nv=clamp(s.lv+d*k,0,100);
if(d>0&& !s.set&&nv>O.NAT_CAP){
if(s.surge==null)s.surge=(O.surgeOk(a,R(ctx,a,b).att)||(HK.Dark.on(ctx)==='dark'&&(a.tr.jealous||0)>=0.5&&R(ctx,a,b).att>=60))&&ctx.rng()<O.SURGE_P*HK.Dark.f(ctx,'cage');
if(!s.surge)nv=Math.max(s.lv,Math.min(nv,O.NAT_CAP));
}
s.lv=nv;
return s.lv;
};
O.feed=function(ctx,a,c,d){if(c&&R(ctx,a,c).att>=30)O.add(ctx,a,c,d||6);};
function near(ctx,a,b){return(a.flags.cagePair!=null&&a.flags.cagePair===b.i)|| !ctx.scen.othersFor||ctx.others(a).indexOf(b)>=0;}
O.near=near;
function away(c){return!c||c.alive===false||c.out||c.gone||c.taken|| !!(c.flags&&c.flags.knocked);}
O.away=away;
O.target=function(ctx,a,min){
var best=null,bv=min==null?35:min;
ctx.chars.forEach(function(o){
if(o===a||away(o)||away(a)|| !near(ctx,a,o))return;
if((a.flags.cagePair!=null&&a.flags.cagePair!==o.i)||(o.flags.cagePair!=null&&o.flags.cagePair!==a.i))return;
var pf=ctx.pair(a,o);
if(!pf.ob|| !pf.ob[a.i]){if(!O.yanTie(ctx,a,o))return;}
var v=O.level(ctx,a,o);
if(v>=bv){bv=v;best=o;}
});
return best;
};
O.obsessorOf=function(ctx,b){
var best=null,bv=34;
ctx.chars.forEach(function(o){if(o===b||away(o)||away(b)|| !near(ctx,b,o))return;if((b.flags.cagePair!=null&&b.flags.cagePair!==o.i)||(o.flags.cagePair!=null&&o.flags.cagePair!==b.i))return;var v=(ctx.pair(o,b).ob&&ctx.pair(o,b).ob[o.i])||O.yanTie(ctx,o,b)?O.level(ctx,o,b):0;if(v>bv){bv=v;best=o;}});
return best;
};
var SUB={devote:'devote',bind:'bind',purge:'purge',dep:'depend',depend:'depend',hatelove:'hatelove'};
O.subOf=function(x,a,b){
if(!x|| !a|| !b)return'';
var l=x.R&&x.pair?tieAll(x,a,b):(x.ties||[]).filter(function(t){return(t.a===a.i&&t.b===b.i)||(t.a===b.i&&t.b===a.i);});
for(var i=0;i<l.length;i++)if(l[i].type==='yan'&&l[i].a===a.i&&l[i].sub&&SUB[l[i].sub])return SUB[l[i].sub];
return'';
};
O.type=function(a,x,b){
var sb=x&&b?O.subOf(x,a,b):'';
if(sb)return sb;
var t=a.tr,s={
devote:t.np*0.85+t.ac*0.25,
bind:t.cp*0.85+t.lead*0.3,
purge:t.aggr*0.85+(1-t.np)*0.35,
depend:t.ac*0.7+(1-t.fc)*0.35+(1-t.a)*0.2
},best='devote';
Object.keys(s).forEach(function(k){if(s[k]>s[best])best=k;});
return best;
};
O.TYPE_NAME={devote:'献身',bind:'束縛',purge:'排除',depend:'依存',hatelove:'試す'};
O.stance=function(ctx,b,a){
var y=O.yanTie(ctx,a,b);
if(y&&y.cold)return y.cold;
var r=R(ctx,b,a);
if(r.att>48&&r.aff>30)return'mutual';
if(r.aff< -12)return'hate';
if(r.ten>42)return'afraid';
if(r.aff>30&&r.trust>20)return'accept';
return'unaware';
};
function setLover(ctx,x,y){var T0=HK.Ties;return!!(T0&&(T0.has(ctx,x,y,'lover')||T0.has(ctx,x,y,'mate')||T0.has(ctx,x,y,'fated')));}
O.coLove=function(ctx,a,b,c){return!!(a&&b&&c&&setLover(ctx,a,b)&&(setLover(ctx,c,b)||setLover(ctx,a,c)));};
O.rival=function(ctx,a,b){
var best=null,bv=40;
ctx.chars.forEach(function(c){
if(c===a||c===b||away(c)|| !near(ctx,a,c))return;
if(O.coLove(ctx,a,b,c))return;
if(HK.Ties&&HK.Ties.apathy&&HK.Ties.apathy(ctx,a,c))return;
var r=R(ctx,b,c),v=r.att+r.aff*0.5+(ctx.pair(b,c).couple?60:0);
if(v>bv){bv=v;best=c;}
});
return best;
};
O.TEXT={
seed:L('{c}と笑う{b}を見たとき、{a}の中で何かが静かに形を変えた。――あの笑顔は、自分だけに向いていればいい。|{a}は気づくと、{b}がどこで誰といるかを、いつも目で追うようになっていた。|{b}が{c}の名前を口にするたび、{a}の胸の奥で何かが軋んだ。それはもう、ただの嫉妬ではなかった。'),
devote:L('{a}は{b}の好きなものを全部覚えていた。頼まれてもいないのに、それが毎日{b}の手元に届いた。|{a}「{b}のためなら、なんでもするよ。……なんでも｜{b}のためなら、なんでもする。……なんでもだ｜{b}のためなら、なんでもします。……なんでもです」|{a}は{b}が困る前に、全部片づけておいた。{b}が誰かに頼る必要なんて、ないように。'),
bind:L('{a}「さっき、誰と話してた？｜さっき、誰と話していた？｜さっき、誰と話していたんですか？」{b}が答えるまで、{a}は目を逸らさなかった。|{a}は{b}の一日の予定を、本人よりも正確に把握していた。|{a}「どこ行くの。……一人で？　本当に？｜どこへ行く。……一人でか？　本当にか？｜どこへ行くんですか。……一人で？　本当にですか？」'),
purge:L('{b}に話しかけた相手を、{a}は黙って見つめていた。相手はそれきり、{b}に近づかなくなった。|{a}は{b}の隣の席を、誰にも譲らなかった。|{a}「{b}に近づく理由、ある？｜{b}に近づく理由があるのか？｜{b}に近づく理由が、ありますか？」{a}の笑顔に、相手は言葉を失った。'),
depend:L('{a}「行かないで。……{b}がいないと、どうしていいか分からない｜行くな。……{b}がいないと、どうしていいか分からない｜行かないでください。……{b}がいないと、どうしていいか分かりません」|{a}は{b}の袖を、離そうとしなかった。|{a}は{b}から返事がないだけで、目に見えて落ち着きをなくした。'),
devote2:L('{a}は{b}の持ち物を、いつのまにか全部把握していた。なくした物は、{a}がいつも先に見つけた。|{b}の行く先々に、{a}が「偶然」いた。|{a}「{b}のことは、私が一番わかってる。だから、ほかの人はいらないよね｜{b}のことは、私が一番わかっている。だから、ほかの人間はいらないだろう｜{b}のことは、私が一番わかっています。だから、ほかの人はいりませんよね」'),
bind2:L('{a}は{b}の持ち物を勝手に確かめ、知らない名前を見つけるたびに問い詰めた。|{a}「今日はどこにも行かないで。約束して｜今日はどこにも行くな。約束しろ｜今日はどこにも行かないでください。約束してください」それは頼みではなく、命令だった。|{a}は{b}が誰と何分話したかまで数えていた。'),
purge2:L('{a}は{c}を呼び出し、低い声で告げた。「{b}に近づくな｜＝｜{b}に近づかないでください」|{c}の持ち物が、いつのまにか壊されていた。{c}は{a}の視線に気づいて、背筋が冷えた。|{a}は{c}についての良くない噂を、さりげなく{b}の耳に入れた。'),
hatelove:L('{a}は{b}の姿が見えなくなると、黙って探しに出た。見つけると、何も言わずに隣に立った。「……勝手にいなくならないで。腹が立つから｜……勝手にいなくなるな。腹が立つ｜……勝手にいなくならないでください。腹が立ちますから」|{b}が危ない目に遭いかけたとき、{a}は誰より先に飛び出して{b}をかばった。そのあとで、{a}は{b}を睨んだ。「守ってやったなんて、思わないで｜守ってやったなどと、思うな｜守ってあげたなんて、思わないでください」|{a}は{b}の言葉尻を捕まえて、静かに責めた。「そういうところが、本当に嫌い｜そういうところが、本当に嫌いだ｜そういうところが、本当に嫌いです」――それでも、{a}は{b}のそばを離れなかった。|{a}は{b}に、わざと答えにくいことを訊いた。「私と{b}の大事なもの、どっちを選ぶ？｜私と{b}の大事なもの、どちらを選ぶ？｜私と{b}の大事なもの、どちらを選びますか？」答えを待つ{a}の目は、試すようで、すがるようでもあった。'),
hatelove2:L('{a}は{b}の腕を掴んで引き戻した。「どこへ行く気？　……行かせない。憎くて仕方ないのに、いなくなるのはもっと許せない｜どこへ行く気だ？　……行かせない。憎くて仕方ないのに、いなくなるのはもっと許せない｜どこへ行く気ですか？　……行かせません。憎くて仕方ないのに、いなくなるのはもっと許せません」|{a}は{b}の古傷になっている失敗を、わざと皆の前で口にした。{b}が顔をこわばらせると、{a}は満足そうに、そして少しだけ苦しそうに笑った。|{a}「私のことだけ考えて苦しめばいい｜＝｜私のことだけ考えて苦しめばいいんです」――そう言い捨てた夜、{a}は{b}の部屋の前で、朝まで座り込んでいた。|{a}は{b}をかばって傷を負い、手当てしようとした{b}の手を払いのけた。「触らないで。……優しくされると、憎めなくなる｜触るな。……優しくされると、憎めなくなる｜触らないでください。……優しくされると、憎めなくなります」'),
depend2:L('{a}「{b}に捨てられたら、生きてる意味なんてない｜{b}に捨てられたら、生きている意味などない｜{b}に捨てられたら、生きている意味なんてありません」{a}の手首には、新しい傷があった。|{a}は{b}が少し離れただけで泣き崩れ、{b}は戻るしかなかった。|{a}「ねえ、私だけ見てて。……じゃないと、何するか分からない｜私だけを見ていろ。……でないと、何をするか分からない｜ねえ、私だけ見ていてください。……でないと、何をするか分かりません」'),
r_unaware:L('{b}は{a}の気遣いを、ただの優しさだと思っていた。|{b}「いつもありがとう、{a}｜{a}、いつも感謝している｜{a}、いつもありがとうございます」{b}の無邪気な笑顔に、{a}は満足そうに目を細めた。'),
r_afraid:L('{b}は{a}の視線を感じるたび、肩をこわばらせるようになった。|{b}は{a}を避けて遠回りした。気づいた{a}の表情が、すっと消えた。|{b}「……{a}、少し、距離を置かせて｜……{a}、少し、距離を置かせてくれ｜……{a}、少し、距離を置かせてください」その言葉が、{a}をさらに追い詰めた。'),
r_hate:L('{b}「いい加減にして。気持ち悪い｜いい加減にしろ。気持ち悪い｜いい加減にしてください。気持ち悪いです」{a}は笑ったまま、その言葉を胸にしまい込んだ。|{b}は{a}の差し出した物を、受け取らずに通り過ぎた。'),
r_confused:L('{b}は{a}の差し出した手を、払いのけることも握り返すこともできずにいた。「……どうしたらいいのか、分からないんだ｜……どうすればいいのか、分からない｜……どうしたらいいのか、分からないんです」|{b}は{a}の重さに気づいていた。それでも、昔からの情が邪魔をして、突き放す言葉が出てこなかった。|{b}「やめてほしい、とは思う。でも……{a}を一人にするのも、怖い｜やめてほしい、とは思う。だが……{a}を一人にするのも、怖い｜やめてほしい、とは思います。でも……{a}を一人にするのも、怖いんです」――{b}自身、どちらが本心か分からなかった。'),
r_accept:L('{b}は{a}の重さを知っていて、それでも手を取った。「……私にしか、{a}は止められないから｜……私にしか、{a}は止められないからだ｜……私にしか、{a}は止められませんから」|{b}「大丈夫。どこにも行かないよ｜大丈夫だ。どこにも行かない｜大丈夫です。どこにも行きません」その一言で、{a}の目に光が戻った。'),
r_mutual:L('{a}が{b}を縛り、{b}もまた{a}を手放せなかった。二人の世界は、二人だけで閉じていった。|{b}「私以外を見たら、許さないから｜私以外を見たら、許さない｜私以外を見たら、許しませんから」{a}は嬉しそうに頷いた。どちらがどちらを縛っているのか、もう分からなかった。'),
r_calm:L('{b}は{a}を正面から見て、ゆっくり言った。「心配しなくていい。ちゃんと、ここにいる｜＝｜心配なさらないでください。ちゃんと、ここにいます」{a}の肩から、少しだけ力が抜けた。|{b}は{a}の手を握り、話を最後まで聞いた。{a}の目に、ようやく涙がにじんだ。'),
cage:L('{a}は{b}を{where}に連れ込み、外から鍵をかけた。{a}は{b}を監禁したのだった。「ここなら、誰にも邪魔されないね｜ここなら、誰にも邪魔されない｜ここなら、誰にも邪魔されませんね」|目を覚ますと、{b}は{where}に閉じ込められていて、手首は柔らかな布で縛られていた。枕元で、{a}が微笑んでいた。「おはよう。もう、どこにも行かなくていいよ｜おはよう。もう、どこにも行かなくていい｜おはようございます。もう、どこにも行かなくていいんですよ」|{a}は{b}の持ち物を全部取り上げた。「{b}、外の世界なんて、もういらないでしょう？｜{b}、外の世界など、もういらないだろう？｜{b}、外の世界なんて、もういりませんよね？」そう言って{a}は{b}を{where}へ閉じ込めた。「{b}のことは私が守る。だから……ここで一緒に暮らそう｜{b}のことは私が守る。だから……ここで一緒に暮らすんだ｜{b}のことは私が守ります。だから……ここで一緒に暮らしましょう」'),
cage_s:L('{a}は{b}を空き部屋に誘い込み、扉の前に立ちふさがった。「……今日は、ここにいて｜……今日は、ここにいろ｜……今日は、ここにいてください」|{a}は{b}の手を離さず、「もうどこにも行かせない｜＝｜もうどこにも行かせません」とだけ言った。{b}は、その目が笑っていないことに気づいた。'),
cageDay:L('{a}は毎日、{b}のために食事を運んだ。{b}が一口食べるたび、{a}は幸せそうに笑った。|{b}が窓の外を見ていると、{a}は静かにカーテンを閉めた。|{a}は{b}の髪を梳きながら、子守唄のように名前を呼び続けた。'),
escape:L('{b}は{a}が眠ったすきに、震える手で鍵を外し、外へ逃げ出した。|{b}はわずかな隙を見逃さなかった。{a}の腕をすり抜け、扉の外へ走った。'),
rescue:L('{c}は{b}の姿が見えないことに気づき、探し回った末に閉ざされた扉を見つけた。扉を破ると、そこに{b}と{a}がいた。|{c}が扉を叩き続けた。{a}は観念したように、{b}の手を離した。'),
release:L('{a}は泣きながら、{b}の手首の布をほどいた。「……ごめん。ごめんね｜……すまない。すまない｜……ごめんなさい。ごめんなさい」|{b}が何も言わずに{a}を抱きしめると、{a}は子どものように泣いて、扉の鍵を開けた。'),
cageEnd:L('{a}は最後まで、{b}を{where}から出さなかった。扉の鍵は、今も{a}だけが持っている。|{b}が{where}に閉じ込められていることを、外の誰も知らないまま時間が過ぎた。{a}は今日も、{b}のもとへ帰っていく。'),
harm:L('{a}は{c}を人気のない場所に呼び出した。数時間後、{c}は血まみれで見つかった。{a}は{b}の隣で、何事もなかったように笑っていた。|{c}は背後から突き飛ばされ、階段の下で動けなくなった。振り返ると、{a}が見下ろしていた。|{a}は{c}の飲み物に、何かを混ぜた。{c}はその夜、ひどく苦しんだ。'),
harm_s:L('{a}は{c}を呼び出し、「{b}に二度と近づかないで｜{b}に二度と近づくな｜{b}に二度と近づかないでください」と迫った。その声の冷たさに、{c}は震え上がった。|{c}の机には、「{b}に近づくな｜＝｜{b}に近づかないでください」と書かれた紙が何度も入れられた。字は、{a}のものによく似ていた。'),
harmKill:L('{a}は{c}を呼び出し、二度と戻らせなかった。{a}は{b}のもとに帰ってくると、「もう大丈夫だよ｜もう大丈夫だ｜もう大丈夫ですよ」と囁いた。|{c}の最期の言葉を聞いたのは、{a}だけだった。{a}は手を洗い、{b}を迎えに行った。'),
shinju:L('{a}は{b}の手を引き、高い場所の縁に立った。「一緒なら、怖くないよね｜一緒なら、怖くないだろう｜一緒なら、怖くありませんよね」――二人の姿は、そのまま見えなくなった。|{a}は{b}に最後の口づけをして、用意していた薬を二人分、静かに飲み干した。|{a}「生まれ変わっても、私だけのものでいて｜生まれ変わっても、私だけのものでいろ｜生まれ変わっても、私だけのものでいてください」――{a}は{b}を抱きしめたまま、目を閉じた。'),
shinjuFail:L('{a}は{b}の手を引き、高い場所の縁に立った。だが{b}は、{a}の腕を強く引き戻した。「……生きて。私と一緒に｜……生きろ。私と一緒に｜……私と一緒に、生きてください」{a}は崩れ落ちて泣いた。|{a}が用意した薬を、{b}は床に叩きつけた。「そんなことのために、一緒にいたいんじゃない｜そんなことのために、一緒にいたいわけではない｜そんなことのために、一緒にいたいんじゃありません」'),
shinju_s:L('{a}は{b}の手を引いて、屋上の柵の前に立った。「……ねえ、このまま二人で消えちゃおうか｜……このまま二人で消えてしまおうか｜……ねえ、このまま二人で消えてしまいましょうか」{b}が強く手を握り返すと、{a}はようやく我に返った。|{a}は{b}の肩にもたれて、「二人だけの世界に行けたらいいのに｜二人だけの世界に行けたらいいのだが｜二人だけの世界に行けたら、いいのですが」と呟いた。{b}は答えられず、ただ手を握っていた。')
};
function T(ctx,key,noC){
var p=O.PACK[ctx.scen&&ctx.scen.id],own=p&&p[key],base=O.TEXT[key]||(O.CAGE_NIGHT||{})[key];
var ok=function(l){return(l||[]).filter(function(x){return!noC||x.indexOf('{c}')<0;});};
own=ok(own);base=ok(base);
var arr=own.length?(base.length&& !(p.only&&p.only.indexOf(key)>=0)&&ctx.rng()<0.35?base:own):base;
return arr.length?ctx.pick(arr):'';
}
O.text=T;
O.where=function(ctx,a,b){
var p=O.PACK[ctx.scen&&ctx.scen.id],w=p&&p.where;
if(typeof w==='function')w=w(ctx,a,b);
return w||'誰も来ない部屋';
};
function F(ctx,txt,a,b,c){
if(txt&&txt.indexOf('{where}')>=0)txt=txt.split('{where}').join(O.where(ctx,a,b));
var s=ctx.t(txt,a,b,c),k=ctx.scen&&ctx.scen.obsessKit;
return k&&k.fill?k.fill(ctx,s,a,b,c):s;
}
O.fill=F;
function cool(ctx,s,n){var kit=ctx.scen&&ctx.scen.obsessKit,c=kit&&kit.cool!=null?kit.cool:2;return ctx.stepIndex-s.at>=Math.min(n||2,c);}
function why(ctx,a,b,s){var sb=O.subOf(ctx,a,b),g=sb&&HK.Gap?HK.Gap.why(ctx,a,b):'';return a.name+'の'+b.name+'への執着（'+Math.round(s.lv)+'・'+O.TYPE_NAME[O.type(a,ctx,b)]+'型'+(g?'・'+g:'')+'）';}
O.tick=function(ctx){
var kit=ctx.scen&&ctx.scen.obsessKit,k=(kit&&kit.tick)||1;
ctx.chars.forEach(function(b){
if(b.flags.caged==null)return;
var a=ctx.chars[b.flags.caged];
if(a&&a.alive&& !a.out)return;
var pf=a?ctx.pair(a,b):null;
if(pf){pf.captive=null;pf.captiveEnded=pf.captiveEnded||'gone';var s=pf.ob&&pf.ob[a.i];if(s){s.cage=null;s.climax=null;}}
if(a)delete a.flags.cagePair;
delete b.flags.cagePair;delete b.flags.caged;
});
ctx.chars.forEach(function(a){
if(!a.alive||a.out)return;
var b=ctx.crush?ctx.crush(a,42):null;
if(!b|| !near(ctx,a,b)||O.blocked(ctx,a,b)|| !O.rival(ctx,a,b))return;
O.add(ctx,a,b,(1.5+a.tr.jealous*4)*k);
});
};
function seed(ctx,a,b,s){
var c=O.rival(ctx,a,b);
s.seen=1;
if(c)ctx.mod(a,c,{ten:10,aff: -6});
return{with:c?[b,c]:[b],cat:'conflict',text:F(ctx,T(ctx,'seed',!c),a,b,c),why:a.name+'の嫉妬・執着（'+Math.round(a.tr.jealous*100)+'）。'+(c?b.name+'と'+c.name+'の近さに、':'')+'想いが執着に変わった',mag:22};
}
O.act=function(ctx,a,opt){
opt=opt||{};
if(a.flags.caged!=null)return null;
var b=O.target(ctx,a);
if(!b)return null;
var s=st(ctx,a,b),stg=O.stage(s.lv),ty=O.type(a,ctx,b),c=O.rival(ctx,a,b);
if(!cool(ctx,s))return null;
s.at=ctx.stepIndex;
if(!s.seen)return seed(ctx,a,b,s);
if(s.cage)return O.cageTick(ctx,a,b,s,opt);
var gp=HK.Gap&&O.subOf(ctx,a,b)?HK.Gap.of(ctx,a,b):0;
if((stg>=3||(stg>=2&&s.lv>=70&&(HK.Dark.on(ctx)==='dark'||gp>=0.6)))&& !s.climax){var cl=O.climax(ctx,a,b,s,ty,c,opt);if(cl)return cl;}
var key=stg>=2?ty+'2':ty;
if(key==='purge2'&& !c)key='bind2';
var txt=T(ctx,key,!c);
if(!txt)return null;
var dB=stg>=2?{ten:8,aff: -2}:{att:2,ten:3};
ctx.mod(a,b,{att:3});
ctx.mod(b,a,dB);
if(key==='purge2'&&c){ctx.mod(c,a,{ten:14,aff: -10});ctx.mod(a,c,{ten:10});ctx.stress(c,8);}
if(ty==='depend'&&stg>=2){ctx.stress(a,10);ctx.stress(b,8);}
if(ty==='hatelove'){ctx.mod(b,a,{ten:4,aff: -2});ctx.stress(b,stg>=2?8:4);}
O.add(ctx,a,b,3+a.tr.jealous*2);
return{with:c&& /\{c\}/.test(txt)?[b,c]:[b],cat:stg>=2||ty==='hatelove'?'conflict':'romance',text:F(ctx,txt,a,b,c),why:why(ctx,a,b,s),mag:10+stg*8};
};
O.react=function(ctx,b){
var a=O.obsessorOf(ctx,b);
if(!a)return null;
var s=st(ctx,a,b);
if(s.cage|| !cool(ctx,s,1))return null;
var stn=O.stance(ctx,b,a),ty=O.type(a,ctx,b),key,d;
if((stn==='accept'||stn==='unaware')&&b.tr.np+b.tr.a*0.5>1.0&&ctx.rng()<0.5){key='r_calm';d= -12;ctx.mod2(a,b,{trust:8},{trust:4});}
else if(stn==='mutual'){key='r_mutual';d=6;ctx.mod2(a,b,{att:6,aff:4},{att:6,aff:4});}
else if(stn==='accept'){key='r_accept';d=ty==='devote'||ty==='depend'? -6:3;ctx.mod2(a,b,{aff:5},{aff:3,att:4});ctx.stress(b,5);}
else if(stn==='hate'){key='r_hate';d=ty==='devote'?4:12;ctx.mod2(a,b,{ten:8},{ten:10,aff: -6});ctx.stress(a,10);}
else if(stn==='confused'){key='r_confused';d=ty==='devote'?2:6;ctx.mod2(a,b,{att:2},{ten:4,aff:2});ctx.stress(b,8);}
else if(stn==='afraid'){key='r_afraid';d=ty==='devote'?3:9;ctx.mod2(a,b,{ten:6},{ten:8});ctx.stress(b,10);}
else{key='r_unaware';d=2;ctx.mod2(a,b,{att:2},{aff:3});}
s.at=ctx.stepIndex;
O.add(ctx,a,b,d);
return{with:[a],cat:key==='r_hate'||key==='r_afraid'?'conflict':'romance',text:F(ctx,T(ctx,key),a,b),why:b.name+'の気持ち（'+{unaware:'気づいていない',afraid:'怖がっている',hate:'嫌っている',confused:'困惑している',accept:'受け入れている',mutual:'共依存'}[stn]+'）と'+a.name+'の執着（'+Math.round(s.lv)+'）',mag:10};
};
O.climax=function(ctx,a,b,s,ty,c,opt){
var safe=SAFE(),stn=O.stance(ctx,b,a),opts=[];
if(HK.Dark.skip(ctx,'cage'))return null;
var gk=HK.Gap&&O.subOf(ctx,a,b)?HK.Gap.k(ctx,a,b):1;
if(opt.cage!==false&&a.flags.caged==null&&b.flags.caged==null)opts.push(['cage',(ty==='bind'?3:ty==='devote'||ty==='hatelove'?2:1.4)*HK.Dark.f(ctx,'cage')*gk]);
if(opt.harm!==false&&c)opts.push(['harm',(ty==='purge'?3.5:ty==='hatelove'?1.8:ty==='bind'?1.4:0.6)*HK.Dark.f(ctx,'harm')*HK.Dark.pick(ctx,0.6,1,1.6)*gk]);
if(opt.shinju!==false)opts.push(['shinju',(ty==='depend'?3:stn==='mutual'?2.2:ty==='hatelove'?1.5:0.7)*(opt.shinjuW==null?1:opt.shinjuW)*HK.Dark.f(ctx,'shinju')*HK.Dark.pick(ctx,0.6,1,1.6,'shinju')]);
var more=opt.more?opt.more(ctx,a,b,s,ty,c,safe)||[]:[];
more.forEach(function(m){if(m[1]>0)opts.push(m);});
if(!opts.length)return null;
var hit=HK.weighted(ctx.rng,opts,function(o){return o[1];}),pick=hit[0];
s.climax=pick;
var pf=ctx.pair(a,b);
if(hit[2]){var mr=hit[2](ctx,a,b,s,ty,c);if(mr)return mr;s.climax=null;return null;}
if(pick==='cage'){
if(safe){s.climax=null;s.lv=clamp(s.lv-12,0,100);}
else{s.cage={from:ctx.stepIndex,n:0};pf.captive={by:a.i};a.flags.cagePair=b.i;b.flags.cagePair=a.i;b.flags.caged=a.i;}
if(HK.Emo){HK.Emo.bump(ctx,b,{fear:safe?25:45},a.name+'の執着');HK.Emo.bump(ctx,a,safe?{anger:15}:{lust:25,anger:10});}
ctx.mod(b,a,{ten:20,trust: -12});ctx.stress(b,20);
return{with:[b],cat:'conflict',text:F(ctx,T(ctx,safe?'cage_s':'cage'),a,b),why:why(ctx,a,b,s)+'。執着が暴走した',mag:45};
}
if(pick==='harm'){
var lethal= !safe&&opt.lethal!==false&&(ty==='purge'||(ty==='hatelove'&&gk>1.6))&&s.lv>=90&&ctx.rng()<0.35*HK.Dark.f(ctx,'kill')*gk;
if(lethal&&HK.Attr&&HK.Attr.spare&&HK.Attr.spare(ctx,c,a))lethal=false;
s.climax=null;s.lv=clamp(s.lv-10,0,100);
ctx.mod(c,a,{ten:35,aff: -30,trust: -30});ctx.mod(b,a,{ten:12,trust: -10});
if(lethal&&ctx.kill){ctx.kill(c,a,b.name+'に執着する'+a.name+'の手で');ctx.pair(a,c).obHarm=true;return{with:[b,c],cat:'kill',text:F(ctx,T(ctx,'harmKill'),a,b,c),why:why(ctx,a,b,s)+'。恋敵の'+c.name+'を排除した',mag:60};}
if(!safe){c.hp=Math.max(1,(c.hp||100)-40);ctx.stress(c,25);}
ctx.pair(a,c).obHarm=true;
return{with:[b,c],cat:'conflict',text:F(ctx,T(ctx,safe?'harm_s':'harm'),a,b,c),why:why(ctx,a,b,s)+'。恋敵の'+c.name+'に矛先が向いた',mag:45};
}
var resist=stn==='mutual'?0.15:stn==='accept'?0.45:stn==='confused'?0.6:0.75;
resist+=b.tr.np*0.15+b.tr.a*0.1;
resist=HK.Dark.live(ctx,resist,'shinju');
if(safe||opt.lethal===false||ctx.rng()<resist||(HK.Attr&&HK.Attr.spare&&HK.Attr.spare(ctx,b,a))){
ctx.mod2(a,b,{trust:10,att:6},{ten:14,att:4});ctx.stress(a,20);ctx.stress(b,25);
s.lv=clamp(s.lv-25,0,100);s.climax=null;
return{with:[b],cat:'conflict',text:F(ctx,T(ctx,safe?'shinju_s':'shinjuFail'),a,b),why:why(ctx,a,b,s)+(safe?'。「二人だけの世界」に誘い、':'。心中に誘い、')+b.name+'が引き止めた',mag:45};
}
pf.shinju={by:a.i};
if(ctx.kill){ctx.kill(b,a,a.name+'との心中で');ctx.kill(a,null,b.name+'との心中で');}
return{with:[b],cat:'kill',text:F(ctx,T(ctx,'shinju'),a,b),why:why(ctx,a,b,s)+'。'+(stn==='mutual'?'二人とも、それを望んでいた':b.name+'は逃げきれなかった'),mag:70};
};
O.cageTick=function(ctx,a,b,s,opt){
s.cage.n++;
var safe=SAFE(),c=null;
ctx.chars.forEach(function(o){if(!c&&o!==a&&o!==b&& !away(o)&&near(ctx,a,o)&&R(ctx,o,b).aff+R(ctx,o,b).trust>55&&ctx.rng()<0.25+s.cage.n*0.08)c=o;});
var end=null;
if(c)end='rescue';
else if(ctx.rng()<0.12+b.tr.caution*0.15+b.tr.aggr*0.1+s.cage.n*0.05)end='escape';
else if(O.stance(ctx,b,a)!=='mutual'&&s.cage.n>=2&&ctx.rng()<0.18+a.tr.np*0.15)end='release';
if(end){
var days=s.cage.n;
s.cage=null;ctx.pair(a,b).captiveEnded=end;ctx.pair(a,b).captive=null;delete a.flags.cagePair;delete b.flags.cagePair;delete b.flags.caged;
if(end==='rescue'){ctx.mod(c,a,{ten:25,aff: -20,trust: -25});ctx.mod2(b,c,{trust:20,aff:15},{aff:8});}
ctx.mod(b,a,{ten:15,trust: -15});s.lv=clamp(s.lv-(end==='release'?25:10),0,100);s.climax=null;
return{with:c?[b,c]:[b],cat:end==='rescue'?'help':'conflict',text:F(ctx,T(ctx,end,!c),a,b,c),why:a.name+(SAFE()?'の囲い込み（':'による監禁（')+days+'区切りで終わった）',mag:30};
}
var stn0=O.stance(ctx,b,a);
var forced= !(stn0==='mutual'||stn0==='accept');
var gate=function(){return ctx.romanceOk([a,b])&&HK.Pos&&HK.Pos.okSex&&HK.Pos.okSex(a,b)&&(!HK.Avoid||HK.Avoid.okSex(ctx,a,b));};
var night= !safe&&opt.night!==false&&(!forced||(!HK.Content||HK.Content.ok(ctx,'force')))&&(forced&&HK.Pos&&HK.Pos.forceOpen?HK.Pos.forceOpen(ctx,[a,b],gate):gate())&&ctx.rng()<0.55;
if(night){
var ord=HK.Pos.order(a,b),top=ord[0]===a;
ctx.pair(a,b).night=true;
ctx.mod2(a,b,{att:6},{att:4,ten:6});
return{with:[b],cat:'romance',sex:true,force:forced,text:F(ctx,T(ctx,top?'top':'bottom'),a,b),why:a.name+'による監禁の夜（執着 '+Math.round(s.lv)+(stn0==='mutual'?'・共依存':stn0==='accept'?'・受け入れている':'')+'）'+(forced&&HK.Pos.noneWhy?HK.Pos.noneWhy(ctx,[a,b]):''),mag:30};
}
ctx.mod(b,a,{ten:4});ctx.stress(b,6);
return{with:[b],cat:'conflict',text:F(ctx,T(ctx,'cageDay'),a,b),why:a.name+(SAFE()?'の囲い込み（':'による監禁（')+s.cage.n+'区切り目）',mag:15};
};
O.finishCage=function(ctx){
if(SAFE())return;
ctx.chars.forEach(function(b){
if(b.flags.caged==null||b.alive===false||b.flags.cageDone)return;
var a=ctx.chars[b.flags.caged];
if(!a||a.alive===false)return;
b.flags.cageDone=true;
b.fate='監禁';
b.fateNote=a.name+'に閉じ込められたまま、外に出られずにいる';
a.fateNote=(a.fateNote?a.fateNote+'。':'')+b.name+'を閉じ込めたまま';
ctx.say({kind:'event',cat:'conflict',actors:[a,b],cageOk:true,text:F(ctx,T(ctx,'cageEnd'),a,b),why:a.name+'による監禁（結末まで続いた）',mag:30});
});
};
O.classify=function(ctx,A,B,pf){
if(pf.shinju)return{id:'shinju',dir:pf.shinju.by};
if(pf.captive)return{id:'captive',dir:pf.captive.by};
var m=pf.ob;
if(!m)return null;
var la=m[A.i]?m[A.i].lv:0,lb=m[B.i]?m[B.i].lv:0;
if(Math.max(la,lb)>=60&& !O.blocked(ctx,la>=lb?A:B,la>=lb?B:A))return{id:la>=60&&lb>=60?'codep':'yandere',dir:la>=lb?A.i:B.i};
return null;
};
O.pairText=function(ctx,A,B,cl){
var x=cl.dir!=null?ctx.chars[cl.dir]:A,y=x===A?B:A,s=(ctx.pair(A,B).ob||{})[x.i]||{};
var safe=SAFE();
switch(cl.id){
case'shinju':return x.name+'は'+y.name+'を誰にも渡さないまま、二人で逝くことを選んだ。';
case'captive':return safe?x.name+'は'+y.name+'をそばから離さず、外の世界から遠ざけたまま終わった。':x.name+'は'+y.name+'を閉じ込めたまま、外の世界から隠し続けている。';
case'codep':return'互いが互いを縛り、二人だけで閉じた関係になった。';
case'yandere':return x.name+'から'+y.name+'への想いは、執着になった'+(ctx.pair(A,B).captiveEnded?(safe?'（囲い込みは':'（監禁は')+{rescue:'救い出されて',escape:y.name+'が逃げ出して',release:x.name+'が手を離して',gone:'二人が離ればなれになって'}[ctx.pair(A,B).captiveEnded]+'終わった）':'')+'。'+(s.lv>=80?'もう、誰にも止められない。':'');
}
return null;
};
if(HK.LABELS){
HK.LABELS.shinju={name:'心中',cls:'kill',pol: -2};
HK.LABELS.captive={name:SAFE()?'囲い込み':'監禁',cls:'obsess',pol: -1};
HK.LABELS.yandere={name:'執着',cls:'obsess',pol:0};
HK.LABELS.codep={name:'共依存',cls:'obsess',pol:0};
}
O.install=function(scen,opt){
if(!scen|| !scen.events||scen.obsessKit)return;
scen.obsessKit=opt=opt||{};
var W=opt.w||1;
var after0=scen.after;
scen.after=function(ctx){var r=after0?after0.apply(this,arguments):undefined;O.tick(ctx);if(opt.after)opt.after(ctx);return r;};
var fin0=scen.finish;
scen.finish=function(ctx){var r=fin0?fin0.apply(this,arguments):undefined;O.finishCage(ctx);return r;};
HK.addTo(scen.events,{
id:'ob_act',label:'執着が行動に出る',cat:'conflict',noOdd:true,pri:true,
when:function(ctx,a){return!!O.target(ctx,a);},
w:function(ctx,a){var b=O.target(ctx,a),s=st(ctx,a,b);return W*(s.cage?4:1+s.lv/30)*(opt.wAct||1);},
run:function(ctx,a){var r=O.act(ctx,a,opt);if(r&&opt.decorate)r=opt.decorate(ctx,a,r)||r;return r;}
});
HK.addTo(scen.events,{
id:'ob_react',label:'執着された側が受け止める',cat:'bond',noOdd:true,
when:function(ctx,b){return!!O.obsessorOf(ctx,b);},
w:function(){return W*1.6;},
run:function(ctx,b){return O.react(ctx,b);}
});
if(opt.extra)HK.addTo(scen.events,opt.extra.slice());
};
})();
});
;
/* ==== js/rel-bad-story.js ==== */
HK.Load.def(355,'js/rel-bad-story.js',function(){
(function(){
'use strict';
var HK=window.HK,ST=HK.Story;
if(!ST)return;
var RB=HK.RelBad=HK.RelBad||{};
var STORY=RB.STORY=RB.STORY||{};
RB.EXTRA=RB.EXTRA||[];
function L(s){return s.split('|');}
function fill(t,m){return String(t).replace(/\{(\w+)\}/g,function(x,k){return m[k]!=null?m[k]:x;});}
var TPL={
sbSpat:{k:'sibbad',w:function(a){return 0.6+a.tr.aggr*0.6+a.tr.cp*0.3;},why:'反りの合わない{sibs}（攻撃性・CP）'},
sbCompare:{k:'sibbad',w:function(a){return 0.35+(a.tr.jealous||0)*0.8+a.tr.ac*0.3;},why:'昔から{sib:a→b}と比べられてきた（嫉妬深さ・AC）'},
sbGrudge:{k:'sibbad',w:function(a){return 0.45+a.tr.np*0.6;},why:'仲は悪くても、{sib:a→b}を放っておけない（NP）'},
sbDefend:{k:'sibbad',w:function(a){return 0.3+a.tr.cp*0.5;},need3:true,why:'他人に{sib:a→b}を悪く言われると黙っていられない（CP）'},
sbMemory:{k:'sibbad',w:function(a){return 0.25+a.tr.np*0.3+a.tr.fc*0.2;},why:'子どもの頃の思い出が、少しだけ角を取った'},
sbMakeup:{k:'sibbad',w:function(){return 1.2;},need:function(n){return n>=3;},why:'いがみ合ってきた{sibs}が、ようやく歩み寄った'},
bdClash:{k:'bad',w:function(a){return 0.6+a.tr.cp*0.5+a.tr.aggr*0.4;},why:'もともと反りが合わない（CP・攻撃性）'},
bdSnark:{k:'bad',w:function(a){return 0.4+a.tr.cold*0.5+a.tr.fc*0.2;},why:'皮肉（ドライさ）'},
bdForced:{k:'bad',w:function(a){return 0.5+a.tr.a*0.4+a.tr.ac*0.2;},why:'気に食わない相手でも、組むしかなかった（A）'},
bdCredit:{k:'bad',w:function(a){return 0.35+a.tr.cp*0.4+(1-(a.tr.honesty||0.5))*0.3;},why:'手柄と責任の押し付け合い（CP・正直さの低さ）'},
bdThaw:{k:'bad',w:function(a){return 0.35+a.tr.np*0.4+a.tr.a*0.2;},need:function(n){return n>=1;},why:'相手の意外な一面を見た（NP・A）'},
bdBlowup:{k:'bad',w:function(a){return 1+a.tr.aggr*0.5;},need:function(n){return n>=2;},why:'溜まっていたものが爆発した'}
};
RB.TPL_KEYS=Object.keys(TPL);
var LABEL={sibbad:'きょうだい（不仲）',bad:'不仲'};
var SKIP= /クライマックス|生贄|罰ゲーム|結末|エピローグ|解決|脱出|最後|真相/;
function free(S,p){return p&&p.alive!==false&& !p.out&& !p.taken&& !p.bound&& !p.fallen&& !p.captor;}
function key(a,b){return a.i<b.i?a.i+'-'+b.i:b.i+'-'+a.i;}
function choose(S,P,ties,TX,rng){
var opts=[];
ties.forEach(function(t){
var A=P[t.a],B=P[t.b];
if(!free(S,A)|| !free(S,B))return;
var pk=key(A,B),used=S.rbUsed[pk]||[],n=used.length;
[[A,B],[B,A]].forEach(function(ab){
var a=ab[0],b=ab[1];
RB.TPL_KEYS.forEach(function(k){
var D=TPL[k];
if(D.k!==t.type|| !TX[k]||used.indexOf(k)>=0)return;
if(D.need&& !D.need(n))return;
var cs=D.need3?P.filter(function(q){return q!==a&&q!==b&&free(S,q);}):[];
if(D.need3&& !cs.length&& !TX.cNPC)return;
opts.push({a:a,b:b,k:k,pk:pk,c:cs.length?cs[rng.int(cs.length)]:null,w:Math.max(0.05,D.w(a))});
});
});
});
return opts.length?HK.weighted(rng,opts,function(o){return o.w;}):null;
}
function make(S,o,TX){
var D=TPL[o.k];
if(!S.recent)S.recent=[];
(S.rbUsed[o.pk]=S.rbUsed[o.pk]||[]).push(o.k);
S.rbN=(S.rbN||0)+1;
var t=fill(ST.pick(S,L(TX[o.k])),{a:o.a.name,b:o.b.name,c:o.c?o.c.name:TX.cNPC||'誰か'});
if(!/[。」！？]$/.test(t))t+='。';
var lab=LABEL[D.k],why=o.a.name+'と'+o.b.name+'：'+D.why;
if(HK.Sib){
var env={ties:S.ties||S.input&&S.input.ties||(HK.Sib._cur&&HK.Sib._cur.ties)||[]};
if(D.k==='sibbad')lab=HK.Sib.tieLabel({type:'sibbad',a:o.a.i,b:o.b.i},o.a,o.b)||lab;
t=HK.Sib.fill(t,o.a,o.b,o.c,env);why=HK.Sib.fill(why,o.a,o.b,o.c,env);
}
return{actors:o.c?[o.a,o.b,o.c]:[o.a,o.b],tag:lab,text:t,why:why+'（'+lab+'）'};
}
RB.choose=choose;RB.make=make;RB.free=free;
var st0=ST.state;
ST.state=function(input,scenId){
var S=st0(input,scenId);
S.rbTies=(input.ties||[]).filter(function(t){return(t.type==='sibbad'||(t.type==='bad'&& !t.cold))&&t.noev!=='off'&&S.P[t.a]&&S.P[t.b];});
S.rbUsed={};
return S;
};
var JR_DAY1= /投票|票を|票先|票が|矛盾|昨日|初日|吊ら|吊れ|処刑/;
function jrDay1(S,label,TX){
if(!TX|| !(S.scen&&S.scen.id==='jinro'&& /^1日目/.test(label||'')))return TX;
var o={};
Object.keys(TX).forEach(function(k){
if(typeof TX[k]!=='string'||k==='cNPC'){o[k]=TX[k];return;}
var a=TX[k].split('|').filter(function(t){return!JR_DAY1.test(t);});
if(a.length)o[k]=a.join('|');
});
return o;
}
var step0=ST.step;
ST.step=function(S,label){
var o=step0(S,label);
var TX=jrDay1(S,label,STORY[S.scen&&S.scen.id]);
if(TX&&S.rbTies&&S.rbTies.length&& !SKIP.test(label||'')&&(S.rbN||0)<5&&S.rng()<0.42){
var c=choose(S,S.P,S.rbTies,TX,S.rng);
if(c)ST.say(S,make(S,c,TX));
}
if(S.scen&&S.scen.id==='ship'&&HK.HateKit&& !SKIP.test(label||'')&&(S.ties||[]).some(function(t){return(t.type==='bad'||t.type==='enemy')&&t.cold;})){
var hk=HK.HateKit.storyTick(S,S.P.filter(function(p){return p.alive&& !p.away;}),{rate:0.15});
if(hk)ST.say(S,{actors:hk.actors,tag:hk.cat==='romance'?'片恋と嫌悪':'敵視',text:hk.text,why:hk.why,mag:hk.mag});
}
for(var xi=0;xi<RB.EXTRA.length;xi++)RB.EXTRA[xi](S,label);
return o;
};
STORY.jashin={
sbSpat:'民宿の部屋割りで、{a}と{b}はまた揉めた。「なんであなたと同じ部屋なんだよ｜なぜあなたと同じ部屋なのだ｜どうしてあなたと同じ部屋なんですか」「こっちの台詞｜こちらの台詞だ｜こちらの台詞です」――廊下を通りかかった女将が、そっと襖を閉めた|{a}は{b}の調べてきた話を、鼻で笑った。「どうせまた、聞き間違いだろ｜どうせまた、聞き間違いだろう｜どうせまた、聞き間違いでしょう」{b}は黙って、{a}の手帳をひったくった',
sbCompare:'村の老人が{b}の顔を見て「しっかりした子じゃ」と目を細めた。{a}には目もくれなかった。{a}は、子どもの頃から何度も見てきた光景だと思った|{a}は、{b}が村人と打ち解けていくのを遠巻きに見ていた。「……昔から、大人に好かれるのはあいつだ｜＝｜……昔から、大人に好かれるのはあの人です」',
sbGrudge:'怪異に怯えて眠れない{b}の部屋の前に、{a}は一晩中座り込んでいた。朝、{b}が襖を開けると、{a}は「たまたま｜たまたまだ｜たまたまです」と言って立ち去った|{b}が村人に袖を掴まれたとき、{a}が割り込んで振り払った。「……こいつに用があるなら、先に私を通せ｜＝｜……この人に用があるなら、先に私を通してください」',
sbDefend:'{c}が「{b}のせいで村人に目をつけられた｜＝｜{b}のせいで村人に目をつけられました」と言い出すと、{a}が冷たく言い返した。「あいつを責めていいのは、私だけだ｜＝｜あの人を責めていいのは、私だけです」|{c}が{b}の勘違いを笑うと、{a}は真顔で言った。「……あいつの勘は、昔からよく当たる。黙って聞け｜＝｜……あの人の勘は、昔からよく当たります。黙って聞いてください」',
sbMemory:'夜、{a}は窓の外の祭り囃子を聞きながら言った。「……子どもの頃、夏祭りであなたが迷子になって、二人で泣きながら帰ったよな｜……子どもの頃、夏祭りであなたが迷子になって、二人で泣きながら帰ったな｜……子どもの頃、夏祭りであなたが迷子になって、二人で泣きながら帰りましたよね」{b}は、少しだけ笑った|{a}は、{b}が怖いときに耳たぶを触る癖が、子どもの頃から変わっていないことに気づいた',
sbMakeup:'村を出る算段をつけながら、{a}がぽつりと言った。「……生きて帰れたら、ちゃんと話そう。今までのこと全部｜……生きて帰れたら、今までのことを全部、きちんと話そう｜……生きて帰れたら、今までのこと全部、ちゃんと話しましょう」{b}は、黙ってうなずいた|{a}は、自分のお守りを{b}の手に押しつけた。「……持っとけ。あなたの方が、危なっかしいから｜……持っておけ。あなたの方が、危なっかしい｜……持っていてください。あなたの方が、危なっかしいですから」',
bdClash:'{a}と{b}は、祠を調べるか村を出るかで真っ向から対立した。二人の言い合いを、村人たちが遠巻きに見ていた|集めた手がかりの読み方をめぐって、{a}と{b}はまたぶつかった',
bdSnark:'{a}は、{b}が村人から聞き出した話を聞き終えると、肩をすくめた。「すごいね。三十分かけて、天気の話を聞いてきたんだ｜大したものだ。三十分かけて、天気の話を聞いてきたのか｜すごいですね。三十分かけて、天気の話を聞いてきたんですね」|{b}が怪異に悲鳴を上げると、{a}は言った。「村じゅうに居場所を知らせてくれて、ありがとう｜村じゅうに居場所を知らせてくれて、感謝する｜村じゅうに居場所を知らせてくださって、ありがとうございます」',
bdForced:'古い蔵の重い扉は、二人がかりでないと開かなかった。{a}と{b}は顔も見ずに、扉に肩を押し当てた|{a}が見張り、{b}が古文書を書き写す。口はきかなかったが、作業は驚くほど早く終わった',
bdCredit:'手がかりを見つけたのはどっちか、{a}と{b}は民宿に戻るまで言い合っていた|村人に怪しまれた原因を、{a}は{b}の質問のせいにし、{b}は{a}の態度のせいにした',
bdThaw:'{a}は、{b}が泣いている村の子どもに、自分の飴を分けてやっているのを見た|{b}が、{a}の落とした手帳を、雨に濡れないよう懐に入れて持ってきた。「……大事なものでしょ｜……大事なものだろう｜……大事なものでしょう」',
bdBlowup:'恐怖と疲れで、{a}と{b}の言い合いは、とうとう掴み合いになった。{c}が二人のあいだに割って入った|{a}と{b}の怒鳴り声が、静まり返った村に響いた。{c}が慌てて、雨戸を閉めた'
};
STORY.yakata={
sbSpat:'暖炉の前の一番いい椅子をめぐって、{a}と{b}はまた口論になった。吹雪の館に閉じ込められても、{sibs}喧嘩だけは通常運転だった|夕食の席で、{a}は{b}のフォークの持ち方に文句をつけた。{b}は、{a}の皿にだけ山盛りの人参を盛った',
sbCompare:'館の主人が{b}の教養を褒めると、{a}はワイングラスを強く握った。「……あいつはいつも、こういう場所で得をする｜＝｜……あの人はいつも、こういう場所で得をするんです」|{a}は、子どもの頃に{b}とだけ写った家族写真が一枚もないことを、なぜか思い出していた',
sbGrudge:'最初の死体が見つかった夜、{a}は{b}の部屋の前で、毛布をかぶって朝まで見張った。「……勘違いするな。眠れなかっただけだ｜＝｜……勘違いしないでください。眠れなかっただけです」|{b}が凍えた手で暖炉に薪をくべていると、{a}が黙って手袋を投げてよこした',
sbDefend:'{c}が「{b}が一番怪しい｜＝｜{b}が一番怪しいです」と言い出すと、{a}は立ち上がった。「あいつに人なんか殺せない。そういう度胸がないんだ。……私が保証する｜あいつに人など殺せない。そういう度胸がないのだ。……私が保証する｜あの人に人なんて殺せません。そういう度胸がないんです。……私が保証します」|{c}が{b}の証言をあげつらうと、{a}が冷たく言った。「その言い方は、{sib:b→a}として聞き流せないな｜その言い方は、{sib:b→a}として聞き流せない｜その言い方は、{sib:b→a}として聞き流せません」',
sbMemory:'停電した廊下で、{a}は手探りで{b}の腕を掴んだ。「……昔、二人で別荘に泊まったときも、こうやって停電したよな｜……昔、二人で別荘に泊まったときも、こうして停電したな｜……昔、二人で別荘に泊まったときも、こうやって停電しましたよね」|窓の外の吹雪を眺めながら、{a}と{b}は、子どもの頃に雪合戦で泣かせ合った話をした',
sbMakeup:'犯人が分かった夜、{a}は{b}の隣に腰を下ろした。「……疑って、悪かった｜＝｜……疑って、すみませんでした」{b}は「お互いさまでしょ｜お互いさまだ｜お互いさまでしょう」と言って、{a}にもたれかかった|{a}は、{b}の淹れた紅茶を、初めて「うまい｜＝｜おいしいです」と言った',
bdClash:'{a}と{b}は、犯人の候補をめぐって真っ向から対立した。暖炉の火が爆ぜる音だけが、二人の沈黙を埋めた|部屋に閉じこもるか、皆で一か所にいるか、{a}と{b}の意見はまた割れた',
bdSnark:'{a}は{b}の推理を聞き終えると、ゆっくり拍手した。「素晴らしい。犯人以外は全員当てはまるね｜素晴らしい。犯人以外は全員当てはまるな｜素晴らしいですね。犯人以外は全員当てはまります」|{b}が悲鳴を上げて廊下を駆けてくると、{a}は言った。「次の死体が見つかったのかと思ったら、蜘蛛か｜＝｜次の死体が見つかったのかと思ったら、蜘蛛ですか」',
bdForced:'地下室の重い扉を開けるため、{a}と{b}は並んで鉄の取っ手を引いた。扉は、一度で開いた|{a}が証言を書き留め、{b}が時刻表を作る。不本意ながら、二人の記録は館で一番正確だった',
bdCredit:'凶器を見つけたのはどちらか、{a}と{b}は食堂で言い争った|疑いをかけられた原因を、{a}は{b}の余計な一言のせいにした',
bdThaw:'{a}は、{b}が怯えている使用人に、そっと自分の部屋の鍵を渡しているのを見た|{b}が、{a}の熱を出した額に、黙って冷たいタオルを載せていった',
bdBlowup:'疑心暗鬼の果てに、{a}と{b}は食堂で胸ぐらを掴み合った。{c}が燭台を置いて、二人を引き剥がした|{a}が{b}を「犯人だ｜＝｜犯人です」と指さし、{b}も{a}を指さし返した。{c}が「二人とも落ち着いて｜二人とも落ち着け｜二人とも落ち着いてください」と叫んだ'
};
STORY.rpg={
sbSpat:'隊列の順番で、{a}と{b}はまた揉めた。「前衛は私だって決めてただろ｜前衛は私だと決めていただろう｜前衛は私だと決めていたでしょう」「決めてない｜決めていない｜決めていません」――後ろの仲間たちがため息をついた|{a}は{b}の持ってきた地図を広げ、鼻で笑った。「これ、上下逆｜これは、上下逆だ｜これ、上下逆です」',
sbCompare:'{b}が宝箱の鍵をあっさり開けると、仲間たちが歓声を上げた。{a}はひとり、剣の柄を握りしめた。「……昔から、器用なのはあいつの方だ｜＝｜……昔から、器用なのはあの人の方です」|ギルドで{b}の評判を聞かされ、{a}は酒場の隅で黙って杯をあおった',
sbGrudge:'魔物の爪を受けて倒れた{b}の前に、{a}が盾を構えて立ちふさがった。「……立てるか。立てないなら、背負ってやる｜＝｜……立てますか。立てないなら、背負います」|{a}は、{b}の折れた杖の代わりに、自分の予備の短剣を渡した。「なくすなよ。親父の形見なんだ｜なくすな。父の形見なのだ｜なくさないでくださいね。父の形見なんです」',
sbDefend:'{c}が「{b}のせいで罠にかかった｜＝｜{b}のせいで罠にかかりました」と責めると、{a}が割って入った。「あいつのミスは、私のミスだ。文句は私に言え｜＝｜あの人のミスは、私のミスです。文句は私に言ってください」|{c}が{b}の腕前をけなすと、{a}は剣を抜きかけた。「……もう一度言ってみろ｜＝｜……もう一度言ってみてください」',
sbMemory:'野営の焚き火を囲みながら、{a}が言った。「……昔、裏山の洞窟を二人で探検したよな。あなた、コウモリで泣いてた｜……昔、裏山の洞窟を二人で探検したな。あなたは、コウモリで泣いていた｜……昔、裏山の洞窟を二人で探検しましたよね。あなた、コウモリで泣いていました」{b}は「泣いてない｜泣いていない｜泣いていません」と小さく笑った|{a}と{b}は、子どもの頃にごっこ遊びで決めた合図を、戦闘中に無意識に使っていた',
sbMakeup:'最下層の手前で、{a}は{b}に手を差し出した。「……ここから先は、一緒に行こう｜……ここから先は、一緒に行くぞ｜……ここから先は、一緒に行きましょう」{b}は、その手を強く握った|{a}は、手に入れた一番いい装備を、黙って{b}に譲った',
bdClash:'{a}と{b}は、進むか引き返すかで真っ向から対立した。迷宮の通路に、二人の声が反響した|戦利品の分け方をめぐって、{a}と{b}はまたぶつかった',
bdSnark:'{a}は、{b}の放った魔法が天井に当たったのを見て言った。「すごいね。天井、倒した｜大したものだ。天井を倒した｜すごいですね。天井、倒しました」|{b}が罠を踏んでしまうと、{a}は拍手した。「さすが、罠の発見がうまい。体で｜さすがだ、罠の発見がうまい。体でな｜さすがですね、罠の発見がお上手です。体で」',
bdForced:'巨大な魔物を前に、{a}と{b}は背中合わせに剣を構えた。打ち合わせもないのに、二人の連携は完璧だった|{a}が囮になり、{b}が仕留める。口はきかなかったが、作戦は一度で決まった',
bdCredit:'ボスを倒したのは自分の一撃だと、{a}も{b}も譲らなかった|罠にかかった原因を、{a}は{b}の足音のせいにし、{b}は{a}の松明のせいにした',
bdThaw:'{a}は、{b}が戦闘のあと、倒した魔物にまで小さく祈りを捧げているのを見た|{b}が、{a}の傷に、自分の最後の回復薬をこっそり使っていた',
bdBlowup:'{a}と{b}の口論は、とうとう剣を抜く寸前までいった。{c}が二人のあいだに盾を突き立てた|{a}と{b}が掴み合いになり、{c}が「ここ、ダンジョンの中だよ！｜ここは、ダンジョンの中だ！｜ここ、ダンジョンの中ですよ！」と叫んで止めた'
};
STORY.jinro={
sbSpat:'席に着くなり、{a}と{b}はもう言い合っていた。「あなた、家でもすぐ顔に出るから、人狼引いたらすぐ分かる｜あなたは家でもすぐ顔に出るから、人狼を引いたらすぐ分かる｜あなた、家でもすぐ顔に出るから、人狼を引いたらすぐ分かりますよ」「そっちこそ｜そちらこそだ｜そちらこそ」|{a}は{b}の発言に、食い気味にかぶせた。「はい嘘。こいつ、嘘つくとき鼻触るから｜はい、嘘だ。こいつは、嘘をつくとき鼻を触る｜はい、嘘です。この人、嘘をつくとき鼻を触るんです」',
sbCompare:'{b}の推理に皆がうなずくのを見て、{a}は小さく舌打ちした。「……昔から、口がうまいのはあいつだ｜＝｜……昔から、口がうまいのはあの人です」|{a}は、家族でボードゲームをすると、いつも{b}が勝っていたことを思い出していた',
sbGrudge:'{b}に疑いが集中したとき、{a}がぼそりと言った。「……あいつ、本当に人狼のときは、もっと黙る。今のは違う｜……あいつは、本当に人狼のときは、もっと黙る。今のは違う｜……あの人、本当に人狼のときは、もっと黙ります。今のは違います」|吊られそうになって言葉に詰まった{b}に、{a}が助け舟を出した。「最後まで聞いてやれよ｜最後まで聞いてやれ｜最後まで聞いてあげてください」',
sbDefend:'{c}が「{sibs}なら、どうせ口裏合わせてる｜{sibs}なら、どうせ口裏を合わせている｜{sibs}なら、どうせ口裏を合わせてますよ」と言うと、{a}が即座に返した。「こいつと口裏なんか合わせられるか。仲悪いんだから｜こいつと口裏など合わせられるか。仲が悪いのだから｜この人と口裏なんて合わせられません。仲が悪いんですから」|{c}が{b}の喋り方をからかうと、{a}が真顔で言った。「それ、ゲームと関係ないだろ｜それは、ゲームと関係ないだろう｜それ、ゲームと関係ないでしょう」',
sbMemory:'休憩中、{a}がぽつりと言った。「……子どもの頃、二人でこのゲームのルール覚えたよな。あなた、最初は人狼が何か分かってなかった｜……子どもの頃、二人でこのゲームのルールを覚えたな。あなたは、最初は人狼が何か分かっていなかった｜……子どもの頃、二人でこのゲームのルールを覚えましたよね。あなた、最初は人狼が何か分かっていませんでした」|{a}と{b}は、同時に同じ相手に投票して、思わず顔を見合わせた',
sbMakeup:'ゲームのあと、{a}は{b}に缶ジュースを投げた。「……今日の推理、悪くなかった｜……今日の推理は、悪くなかった｜……今日の推理、悪くなかったです」{b}は、少し照れたように受け取った|帰り際、{a}と{b}は並んで歩きながら、さっきのゲームの反省会をしていた。久しぶりに、ちゃんと話した',
bdClash:'{a}と{b}は、初日の投票先をめぐって真っ向から対立した|{a}が誰かを疑うたびに、{b}は反対した。理由は、{a}が言ったから、だけだった',
bdSnark:'{a}は、{b}の推理を聞き終えると言った。「すごい。人狼の方が助かる推理だね｜大したものだ。人狼の方が助かる推理だな｜すごいですね。人狼の方が助かる推理です」|{b}が占い師を名乗ると、{a}は笑った。「へえ。そういう設定でいくんだ｜ほう。そういう設定でいくのか｜へえ。そういう設定でいくんですね」',
bdForced:'{a}と{b}は、同じ相手を怪しいと思っていた。不本意ながら、二人の推理はぴたりと噛み合った|{a}が論点を並べ、{b}が矛盾を突く。気に食わない相手でも、議論の相性だけは良かった',
bdCredit:'人狼を吊れたのは誰の推理のおかげか、{a}と{b}は言い合った|村人を吊ってしまった責任を、{a}は{b}に、{b}は{a}に押し付けた',
bdThaw:'{a}は、{b}が初心者の参加者に、こっそりルールを教えているのを見た|{b}が、{a}の推理の正しかった点を、皆の前で認めた。{a}は、どう返せばいいか分からなかった',
bdBlowup:'{a}と{b}の口論は、ゲームの外にまではみ出した。{c}が「ゲームだから！　ゲームだから！｜ゲームだ！　ゲームだ！｜ゲームですから！　ゲームですから！」と二人を引き離した|{a}が{b}を「絶対に人狼｜絶対に人狼だ｜絶対に人狼です」と言い、{b}も{a}を言い返した。{c}が机を叩いて止めた'
};
STORY.locker={
cNPC:'外にいる誰か',
sbSpat:'狭いロッカーの中で、{a}と{b}は肘をぶつけ合った。「狭いんだから、もっと詰めろよ｜狭いのだから、もっと詰めろ｜狭いんですから、もっと詰めてください」「これ以上詰められない｜＝｜これ以上詰められません」――よりによって、{sib:a→b}と閉じ込められるなんて|{a}は、{b}の髪が顔に当たるたびに文句を言った。{b}は、わざと頭を振った',
sbCompare:'{b}が仕掛けの暗号を先に読み解きかけると、{a}は唇を噛んだ。「……こういうの、昔からあなたの方が得意だよな｜……こういうのは、昔からあなたの方が得意だな｜……こういうの、昔からあなたの方が得意ですよね」|{a}は、子どもの頃に{b}と同じ部屋に押し込められていたことを思い出して、うんざりした',
sbGrudge:'息苦しさで{b}の顔色が悪くなると、{a}は黙って体をずらし、通気口の前を{b}に譲った|{b}が震えだすと、{a}は舌打ちしながら、自分の上着を{b}の肩にかけた。「……昔から、狭いところ苦手だっただろ｜……昔から、狭いところが苦手だっただろう｜……昔から、狭いところが苦手だったでしょう」',
sbDefend:'ロッカーの外から、{c}の笑い声がした。「{sibs}で閉じ込められるとか、ウケる｜{sibs}で閉じ込められるとは、笑える｜{sibs}で閉じ込められるなんて、笑えますね」{a}は扉を蹴った。「笑うな。こいつを笑っていいのは私だけだ｜＝｜笑わないでください。この人を笑っていいのは私だけです」|{c}が扉越しに{b}をからかうと、{a}が怒鳴り返した。「黙ってろ！｜黙っていろ！｜黙っていてください！」',
sbMemory:'暗闇の中で、{a}がぽつりと言った。「……子どもの頃、かくれんぼで、二人で押し入れに入って出られなくなったことあったな｜……子どもの頃、かくれんぼで、二人で押し入れに入って出られなくなったことがあったな｜……子どもの頃、かくれんぼで、二人で押し入れに入って出られなくなったことがありましたね」{b}は、くすっと笑った|{a}と{b}は、昔家族で覚えた数え歌を、小さな声で数えながら時間を潰した',
sbMakeup:'扉が開くまでの長い時間、{a}は初めて、ずっと言えなかったことを{b}に話した。{b}は、黙って聞いていた|ロッカーを出たとき、{a}は{b}の背中を軽く叩いた。「……あなたと一緒で、まあ、助かった｜＝｜……あなたと一緒で、まあ、助かりました」',
bdClash:'{a}と{b}は、仕掛けの解き方をめぐって狭いロッカーの中で言い合った|どっちのせいで閉じ込められたのか、{a}と{b}の意見は真っ向から割れた',
bdSnark:'{a}は、{b}が必死に扉を押しているのを見て言った。「引くんじゃない？　それ｜それは、引くのではないか？｜それ、引くんじゃないですか？」|{b}がため息をつくと、{a}は言った。「酸素、無駄遣いしないで｜酸素を無駄遣いするな｜酸素、無駄遣いしないでください」',
bdForced:'扉の仕掛けは、二人同時にボタンを押さないと開かなかった。{a}と{b}は、狭い中で無理やり体勢を変え、同時に押した|{a}が暗号を読み、{b}がダイヤルを回す。気に食わない相手でも、手順は完璧だった',
bdCredit:'扉の鍵が一つ外れたとき、{a}も{b}も自分の手柄だと言い張った|閉じ込められた時間が延びたのを、{a}と{b}は互いのせいにした',
bdThaw:'{a}は、{b}がずっと自分の方に体を寄せて、{a}が楽に立てるようにしてくれていたことに気づいた|{b}が、苦しそうな{a}に、自分の水を差し出した。「……飲んで。そっちの方が、顔色悪い｜……飲め。そちらの方が、顔色が悪い｜……飲んでください。そちらの方が、顔色が悪いです」',
bdBlowup:'狭さと苛立ちで、{a}と{b}はとうとう怒鳴り合いになった。ロッカーががたがたと揺れた|{a}と{b}の口論は、ロッカーの外まで響いた。誰かが扉を叩いて「落ち着いて！｜落ち着け！｜落ち着いてください！」と叫んだ'
};
STORY.saimin={
cNPC:'遊びに来ていた友人',
sbSpat:'{a}は、{b}が持ってきた振り子を見て鼻で笑った。「それ、昔あなたが通販で買って、一回で飽きたやつだろ｜それは、昔あなたが通販で買って、一回で飽きたものだろう｜それ、昔あなたが通販で買って、一回で飽きたものでしょう」|{a}と{b}は、催眠の練習台をどっちがやるかで、子どもみたいに揉めた',
sbCompare:'{b}の暗示の声は、驚くほど落ち着いていた。{a}は、昔から人前で話すのが上手かったのは{b}の方だと思い出して、少しむっとした|{a}は、また{b}に負けるのが嫌で、催眠にかからないよう必死に目をこすった',
sbGrudge:'催眠のあとで頭痛を訴えた{b}に、{a}は文句を言いながら、冷たいタオルと水を持ってきた|ふらついた{b}の腕を、{a}がとっさに掴んだ。「……危なっかしいな、ほんとに｜……本当に、危なっかしいな｜……本当に、危なっかしいですね」',
sbDefend:'{c}が「{sibs}なのに催眠ごっことか｜{sibs}なのに催眠ごっことはな｜{sibs}なのに催眠ごっこですか」と笑うと、{a}が睨んだ。「ほっとけ｜放っておけ｜放っておいてください」|{c}が{b}をからかうと、{a}は黙って{c}を部屋から追い出した',
sbMemory:'{a}は、{b}の手の中で揺れる五円玉を見ながら言った。「……子どもの頃、これでお互いに催眠ごっこしたよな。どっちもかからなかったけど｜……子どもの頃、これでお互いに催眠ごっこをしたな。どちらもかからなかったが｜……子どもの頃、これでお互いに催眠ごっこをしましたよね。どちらもかかりませんでしたけど」|揺れる振り子を見つめるうちに、{a}は、昔{b}と縁側で昼寝をした夏の日を思い出していた',
sbMakeup:'催眠が解けたあと、{a}はぽつりと言った。「……本当は、ずっと話したかったことがある｜＝｜……本当は、ずっと話したかったことがあるんです」{b}は、黙って隣に座った|{a}と{b}は、催眠ごっこの結果を笑い合った。久しぶりに、二人で笑った',
bdClash:'{a}と{b}は、催眠が本物かインチキかで言い合いになった|{a}の暗示のかけ方に、{b}がいちいち口を挟んだ',
bdSnark:'{a}は、{b}がかけようとしている暗示の台本を読んで言った。「これ、眠くなるのはかける側の方だね｜これは、眠くなるのはかける側の方だな｜これ、眠くなるのはかける側の方ですね」|{b}が真剣な顔で振り子を揺らすと、{a}は欠伸をした。「あ、ごめん。効いてきたのかも、退屈で｜ああ、すまない。効いてきたのかもしれない、退屈で｜あ、すみません。効いてきたのかもしれません、退屈で」',
bdForced:'本に書かれた手順は、二人でないとできなかった。{a}と{b}はしぶしぶ向き合い、言われたとおりに呼吸を合わせた|{a}が数を数え、{b}が手を叩く。気に食わない相手でも、段取りだけはうまくいった',
bdCredit:'催眠がうまくいったのは、かける側の腕か、かかる側の素直さか、{a}と{b}は言い合った|催眠が失敗した理由を、{a}は{b}の集中力のせいにした',
bdThaw:'{a}は、催眠のあとでぼんやりしている自分に、{b}が毛布をかけてくれていたことに気づいた|{b}が、{a}の失敗を、誰にも言わずに黙っていてくれた',
bdBlowup:'{a}と{b}の言い合いは、とうとう怒鳴り合いになった。振り子が床に落ちて、からんと音を立てた|{a}が「二度とやらない｜＝｜二度とやりません」と言い、{b}も「こっちの台詞｜こちらの台詞だ｜こちらの台詞です」と言い返した。部屋の空気が凍りついた'
};
})();
});
HK.Load.done('pack-sim', '4f5fdd75b7', 1);
