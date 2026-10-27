;
/* ==== js/scenarios-b.js ==== */
HK.Load.def(78,'js/scenarios-b.js',function(){
(function(){
'use strict';
var HK=window.HK;
function R(ctx,a,b){return ctx.R(a,b);}
function names(list){return list.map(function(c){return c.name;}).join('・');}
function add(s){HK.SCENARIOS[s.id]=s;if(HK.SCEN_ORDER.indexOf(s.id)<0)HK.SCEN_ORDER.push(s.id);}
add({
id:'island',name:'無人島',kicker:'サバイバル・共同生活',
desc:'漂着した島で救助を待つ日々。食料が尽きれば体力が削れ、人間関係も削れる。',
unit:'日',preRel:0,lethal:true,factions:true,
derived:['caution','lead','cold','warmth'],
env:[
{id:'days',label:'救助までの日数',min:4,max:15,def:8,lo:'4日',hi:'15日',unit:'日'},
{id:'res',label:'島の資源',min:0,max:100,def:50,lo:'岩だらけ',hi:'果物が実る'},
{id:'storm',label:'天候の荒さ',min:0,max:100,def:40,lo:'凪',hi:'嵐続き'},
{id:'faction',label:'派閥が生まれる人数',min:3,max:8,def:4,lo:'3人から',hi:'8人から',unit:'人以上',desc:'この人数を下回ると派閥には分かれない。上回っても、引っぱる人や信頼がなければ生まれない'},
{id:'bugs',label:'虫を食べる描写',type:'select',def:'yes',options:[{v:'yes',label:'あり（幼虫やイナゴも食料になる）'},{v:'no',label:'なし（虫は食料に出てこない）'}],desc:'「なし」にすると、採集で虫を捕まえたり、虫を料理したりする場面が出なくなる'},
{id:'rescue',label:'救助',type:'select',def:'yes',options:[{v:'yes',label:'最終日に船が来る'},{v:'no',label:'来ない（イカダで脱出するしかない）'}]}
],
stats:[
{id:'hp',label:'体力',desc:'空腹や嵐、ケンカでの耐久'},
{id:'know',label:'サバイバル知識',desc:'食料探しとイカダ作りの成功率'}
],
actions:[
{id:'food',label:'食料を探しに行く',fit:function(t){return t.np*0.4+t.a*0.4;},bias:{help:1.6}},
{id:'base',label:'拠点を作る',fit:function(t){return t.a*0.6+t.caution*0.4;},bias:{solo:1.3,escape:1.3}},
{id:'gather',label:'皆をまとめる',fit:function(t){return t.lead;},bias:{conflict:1.4,bond:1.3}},
{id:'wait',label:'海を見て救助を待つ',fit:function(t){return t.ac*0.6+(1-t.a)*0.4;},bias:{solo:1.8}},
{id:'explore',label:'一人で島を探索する',fit:function(t){return t.fc*0.6+t.cold*0.4;},bias:{solo:1.6,escape:1.4}}
],
goals:[
{id:'all',label:'全員で帰る',fit:function(t){return t.np;},bias:{help:1.8,betray:0.3}},
{id:'self',label:'自分が生き延びる',fit:function(t){return t.cold;},bias:{betray:2,help:0.6}},
{id:'lead',label:'島のリーダーになる',fit:function(t){return t.lead;},bias:{conflict:1.7}},
{id:'stay',label:'本当は帰りたくない',fit:function(t){return(t.fc*0.5+t.ac*0.3)*0.85-t.np*0.04;},bias:{bond:1.5,romance:1.4,escape:0.3}},
{id:'guard',label:'誰かを守る',fit:function(t){return t.np*0.7+t.cp*0.3;},bias:{help:2},needsFocus:true}
],
steps:function(env){var s=[];for(var i=1;i<=env.days;i++)s.push(i+'日目');return s;},
setup:function(ctx){
ctx.place='島';
ctx.food=20+ctx.env.res*0.6;
ctx.flags.raft=0;
ctx.chars.forEach(function(c){c.hp=70+ctx.stat(c,'hp')*6;c.flags.stash=0;});
},
phase:function(ctx,s,n){
var P=ctx.present(),rng=ctx.rng;
if(s===0)ctx.say({text:names(P)+'は、見知らぬ浜辺で目を覚ました。'+(HK.Attr&&HK.Attr.raceIntro?HK.Attr.raceIntro(P,'alert',ctx):'')});
},
after:function(ctx){
var P=ctx.present(),need=P.length*6;
ctx.food+=ctx.env.res/100*6*ctx.rng();
if(ctx.food>=need){ctx.food-=need;P.forEach(function(c){c.hp=Math.min(100,c.hp+3);});}
else{
var short=1-ctx.food/need;ctx.food=0;
P.forEach(function(c){
if(c.flags.stash>0){c.flags.stash-=6;return;}
c.hp-=short*(10+(5-ctx.stat(c,'hp'))*3);
c.stress=HK.clamp(c.stress+short*15,0,100);
if(c.hp<=0)ctx.kill(c,null,'飢えと疲労で倒れた');
});
}
if(ctx.flags.raft>=100&& !ctx.flags.raftDone){
ctx.flags.raftDone=true;
var builder=ctx.chars[ctx.flags.raftBy];
if(builder&&builder.alive&& !builder.out&&(ctx.env.rescue==='no'||builder.goal.id!=='stay')){
var crew=[builder].concat(ctx.others(builder).filter(function(o){return R(ctx,builder,o).trust>15||builder.goal.id==='all';}).slice(0,3));
crew.forEach(function(c){c.out=true;c.fate='イカダで脱出';c.fateNote=builder.name+'のイカダで海へ出た';});
ctx.flags.raftCrew={by:builder.i,crew:crew.map(function(c){return c.i;}),label:ctx.label};
var left=ctx.present();
left.forEach(function(o){ctx.k=1;ctx.mod(o,builder,{ten:25,aff: -20,trust: -30});});
ctx.say({kind:'event',cat:'escape',actors:crew,text:'イカダが完成した。'+names(crew)+'が海へ漕ぎ出した。'+(left.length?names(left)+'は浜に残された。':''),why:builder.name+'が選んだ乗員（信頼15以上）',mag:40});
}
}
},
end:function(ctx){return ctx.present().length===0;},
finish:function(ctx){
var P=ctx.present();
if(ctx.env.rescue==='yes'||ctx.flags.radio){
if(ctx.flags.radio&&ctx.env.rescue!=='yes')ctx.say({text:'修理した無線機の呼びかけが届いていた。'});
P.forEach(function(c){
if(c.goal.id==='stay'&&ctx.rng()<0.45){c.fate='島に残った';c.fateNote='救助船に乗らなかった';}
else{c.fate='救助';c.fateNote='最終日の船で帰還した（体力 '+Math.max(0,Math.round(c.hp))+'）';}
});
if(P.length)ctx.say({text:'水平線に船影が見えた。'+names(P)+'は浜で手を振った。'});
}else P.forEach(function(c){c.fate='島に残った';c.fateNote='救助は来なかった';});
},
events:[
{
id:'forage',cat:'help',scope:'solo',
w:function(ctx,a){return 0.4+a.tr.np*0.4+a.tr.a*0.3+(ctx.food<20?0.5:0);},
run:function(ctx,a){
var ok=ctx.rng()<0.25+ctx.stat(a,'know')*0.1+ctx.env.res/300;
if(!ok){a.hp-=4;ctx.stress(a,8);return{cat:'solo',text:ctx.t('{a}は半日歩き回ったが、手ぶらで戻ってきた。',a),why:'サバイバル知識 '+ctx.stat(a,'know')+'・島の資源'};}
var amt=10+ctx.stat(a,'know')*4;
if(a.goal.id==='self'&&a.tr.cold>0.55){
a.flags.stash+=amt*0.6;ctx.food+=amt*0.4;
return{cat:'betray',text:ctx.t('{a}は魚を獲って戻った。持ち帰った量は、獲った量より少なかった。',a),why:a.name+'の目標「自分が生き延びる」とドライさ'};
}
ctx.food+=amt;
ctx.others(a).forEach(function(o){ctx.mod(o,a,{trust:5,aff:4});});
return{text:ctx.t(ctx.pick(['{a}が岩場で貝を山ほど獲ってきた。その夜は久しぶりに腹が満ちた。','{a}が森の奥で食べられる果実を見つけた。']),a),why:a.name+'のNP・A／知識 '+ctx.stat(a,'know')};
}
},
{
id:'stashfound',cat:'conflict',scope:'pair',
when:function(ctx,a,b){return b.flags.stash>4;},
w:function(ctx,a){return a.tr.a*0.8+a.tr.cp*0.4;},
run:function(ctx,a,b){
ctx.food+=b.flags.stash;b.flags.stash=0;
ctx.others(b).forEach(function(o){ctx.mod(o,b,{trust: -25,ten:20,aff: -10});});
ctx.mod(b,a,{ten:25});
return{text:ctx.t(ctx.few()?'{a}が、{b}の寝床の下に隠された食料を見つけた。{a}は黙ってそれを半分に分けた。':'{a}が、{b}の寝床の下に隠された食料を見つけた。全員の前で、それは山分けされた。',a,b),why:a.name+'の観察力（A）とCP（不正を許さない）'};
}
},
{
id:'firewatch',cat:'bond',scope:'pair',
w:function(ctx,a,b){return 0.4+(R(ctx,a,b).aff+R(ctx,a,b).att)/100;},
run:function(ctx,a,b){
var rom=R(ctx,a,b).att>30&&R(ctx,b,a).att>25;
ctx.mod2(a,b,{trust:8,aff:5,att:rom?7:2},{trust:8,aff:5,att:rom?7:2});
return{cat:rom?'romance':'bond',text:ctx.t(rom?'火の番をしながら、{a}と{b}は肩を寄せて眠った。どちらから寄ったのかはわからない。':'{a}と{b}が焚き火の番をした。島に来る前の話をした。',a,b),why:rom?'互いの惹かれ':'夜の静けさ'};
}
},
{
id:'nurseisl',cat:'help',scope:'pair',
when:function(ctx,a,b){return b.hp<60;},
w:function(ctx,a,b){return a.tr.np*1.4+(a.focus===b?1:0);},
run:function(ctx,a,b){
b.hp=Math.min(100,b.hp+15);a.hp-=3;
ctx.mod2(a,b,{aff:5},{aff:12,trust:12,att:5});
return{text:ctx.t('熱を出した{b}を、{a}が一晩中看病した。',a,b),why:a.name+'のNP（'+Math.round(a.eg.NP)+'）と'+b.name+'の体力低下（'+Math.round(b.hp)+'）'};
}
},
{
id:'clash',cat:'conflict',scope:'pair',
when:function(ctx,a,b){return a.tr.lead>0.5&&b.tr.lead>0.5;},
w:function(ctx,a){return a.tr.lead+(a.goal.id==='lead'?0.8:0);},
run:function(ctx,a,b){
ctx.mod2(a,b,{ten:15,aff: -5},{ten:15,aff: -5});
ctx.others(a).forEach(function(o){if(o!==b)ctx.stress(o,5);});
return{text:ctx.t('拠点の場所を巡って{a}と{b}が対立した。二人とも、自分の案を譲らなかった。',a,b),why:'二人とも主導性が高い（CP・A高、AC低）'};
}
},
{
id:'raft',cat:'escape',scope:'solo',
when:function(ctx){return!ctx.flags.raftDone;},
w:function(ctx,a){return(a.tr.a*0.6+a.tr.fc*0.2)*(a.goal.id==='stay'?0.2:1)*(ctx.env.rescue==='no'?1.8:0.6);},
run:function(ctx,a){
var gain=8+ctx.stat(a,'know')*5+ctx.rng()*10;
ctx.flags.raft+=gain;ctx.flags.raftBy=ctx.flags.raftBy==null?a.i:ctx.flags.raftBy;
if(ctx.chars[ctx.flags.raftBy]!==a&&ctx.rng()<0.5)ctx.flags.raftBy=a.i;
return{text:ctx.t('{a}は流木を集め、蔓で縛っていった。イカダの進み具合 '+Math.min(100,Math.round(ctx.flags.raft))+'%。',a),why:a.name+'のA／知識 '+ctx.stat(a,'know')};
}
},
{
id:'foodfight',cat:'combat',scope:'pair',
when:function(ctx,a,b){return ctx.food<15&&(R(ctx,a,b).ten>30||a.stress>60);},
w:function(ctx,a){return a.tr.aggr*0.9-0.2;},
run:function(ctx,a,b){
var r=ctx.fight(a,b,{lethality:0.55,noEvade:true});
return{text:ctx.t('最後の干し魚を巡って、{a}が{b}に掴みかかった。',a,b)+r.text,why:'飢え・緊張と'+a.name+'の攻撃性。'+r.why};
}
},
{
id:'sea',cat:'solo',scope:'solo',
w:function(ctx,a){return 0.2+a.tr.ac*0.4+a.stress/150+(a.goal.id==='stay'?0.4:0);},
run:function(ctx,a){
ctx.stress(a,a.goal.id==='stay'? -15: -5);
return{text:ctx.t(a.goal.id==='stay'?'{a}は夕焼けの海を眺めていた。帰りたい、とは一度も口にしていない。':'{a}は一人で海を眺めていた。水平線には何も見えない。',a),why:'目標「'+a.goal.label+'」'};
}
}
]
});
})();
});
;
/* ==== js/island-cook.js ==== */
HK.Load.def(126,'js/island-cook.js',function(){
(function(){
'use strict';
var HK=window.HK;
var IC=HK.IslandCook={};
var CAT={
fish:['ハゼ','小アジ','ベラ','カサゴ','メバル','アジ','サバ','イサキ','ヒラメ','真鯛','カツオ','大きなハタ','フグ','ボラ','ブダイ','ハリセンボン','ウツボ','シイラ'],
squid:['タコ','イカ','アオリイカ'],crust:['伊勢海老','カニ','ヤシガニ'],shell:['貝','ウニ','ハマグリ','サザエ','トコブシ','カキ','ナマコ'],
meat:['野ウサギ','野ヤギ','イノシシ','大トカゲ','ヘビ','毒蛇'],bird:['野鳥','ハト','カモ'],egg:['海鳥の卵'],
fruit:['ヤシの実','バナナ','木の実','マンゴー','パパイヤ','グアバ','パッションフルーツ','野生のパイナップル','野イチゴ','イチジク','スターフルーツ','ライム','ドラゴンフルーツ','サトウキビ','マカダミアナッツ','クルミ'],
veg:['海藻','野草','山芋','タロイモ','ヤムイモ','野生のネギ','ツワブキ','長命草','アロエ','ノビル'],
mush:['ヒラタケに似たキノコ','タマゴタケ','アミガサタケ','キクラゲ','白い傘のキノコ','派手な赤いキノコ'],
insect:['カブトムシの幼虫','セミ','イナゴ','コオロギ','カミキリムシの幼虫','カブトムシ','シロアリ']
};
function catOf(name){for(var k in CAT)if(CAT[k].indexOf(name)>=0)return k;return'veg';}
var MENU={
fish:[
['{x}の丸焦げ','{x}の生かじり','半生の{x}','{x}を石の上で焼いたもの','鱗ごと焼いた{x}'],
['{x}の塩焼き','{x}の串焼き','{x}の石焼き','{x}のぶつ切り汁','+{x}と{y}の煮込み','{x}の干物'],
['{x}の香草焼き','{x}の葉包み蒸し','{x}の潮汁','{x}のなめろう風','+{x}と{y}の蒸し焼き','{x}の竹筒炊き','{x}の炙り'],
['{x}の姿造り','{x}の燻製','{x}のアクアパッツァ風','{x}のカルパッチョ風','+{x}と{y}のブイヤベース風','{x}の塩釜焼き','{x}の漬け丼風（芋の上に）','{x}の昆布締め風']
],
squid:[['{x}の丸焼き','ちぎった{x}'],['{x}の串焼き','{x}の塩茹で','{x}の足の炙り'],['{x}の墨煮','{x}の刺身','+{x}と{y}の炒め煮','{x}の一夜干し'],['{x}のぶつ切りマリネ','{x}の詰め物焼き','+{x}と{y}の香草煮','{x}のやわらか煮']],
crust:[['{x}の殻ごと焼き','{x}の生'],['茹でた{x}','{x}の石焼き','{x}の甲羅焼き'],['{x}の味噌焼き','{x}の鬼殻焼き','+{x}と{y}の汁物','{x}の蒸し焼き'],['{x}のテルミドール風','{x}のココナッツ蒸し','+{x}と{y}の贅沢鍋','{x}の具足煮']],
shell:[['生の{x}','焦げた{x}'],['{x}の網焼き','{x}の潮汁','{x}の浜焼き'],['{x}の酒蒸し風（ヤシの汁で）','{x}の殻焼き','+{x}と{y}のスープ'],['{x}のガーリック焼き風','{x}の磯辺焼き','+{x}と{y}のリゾット風','{x}の和え物']],
meat:[['生焼けの{x}','{x}の丸焦げ','固い{x}の肉'],['{x}の串焼き','{x}の丸焼き','{x}の塩焼き','{x}の干し肉'],['{x}の香草焼き','{x}の煮込み','+{x}と{y}のシチュー','{x}の葉包み焼き','{x}のスペアリブ'],['{x}の燻製ハム','{x}のロースト・果実ソース','+{x}と{y}の蒸し焼き','{x}のココナッツカレー風','{x}の骨付き炙り']],
bird:[['焦げた{x}','羽が残った{x}'],['{x}の丸焼き','{x}の串焼き','{x}の塩焼き'],['{x}のスープ','{x}の香草詰め焼き','+{x}と{y}の鍋'],['{x}のロースト','{x}の燻製','+{x}の{y}詰め蒸し焼き']],
egg:[['生の{x}','殻ごと焼いた{x}'],['ゆで{x}','{x}の石焼き'],['{x}の目玉焼き（平石で）','+{x}と{y}の炒り卵'],['{x}のオムレツ風','+{x}と{y}の茶碗蒸し風（ヤシの殻で）','{x}の味玉']]
};
MENU.mush=[['生の{x}','焦げた{x}','{x}の丸かじり'],['{x}の網焼き','{x}のスープ','{x}の串焼き','{x}の塩焼き'],['{x}の葉包み焼き','+{x}と{y}の炊き込み','{x}のソテー（ヤシ油で）','{x}の澄ましスープ'],['{x}のアヒージョ風','{x}のリゾット風','+{x}と{y}のキッシュ風','{x}の濃厚ポタージュ']];
MENU.insect=[['生きたままの{x}','{x}の丸焦げ','{x}の丸かじり'],['{x}の丸焼き','{x}の素焼き','{x}の串焼き','{x}の塩炒り','{x}のスープ'],['{x}の素揚げ（ヤシ油で）','{x}の佃煮風','+{x}と{y}の炒め物','{x}の香ばし焼き'],['{x}のパリパリ揚げ・香草塩','{x}の甘露煮','{x}のペースト・クラッカー添え','+{x}と{y}の春巻き風']];
MENU.fruit=[['割った{x}','かじった{x}'],['焼き{x}','{x}の果汁'],['{x}の蒸し菓子','+{x}と{y}の甘煮','{x}のジャム風'],['{x}のタルト風','{x}のパンケーキ風','+{x}と{y}のデザート盛り']];
MENU.veg=[['生の{x}','茹ですぎた{x}'],['{x}のおひたし','{x}の汁','焼き{x}'],['{x}の和え物','+{x}と{y}の炊き込み','{x}のすり流し'],['{x}のポタージュ風','+{x}と{y}の天ぷら風（ヤシ油で）','{x}のガレット風']];
['fish','squid','crust','shell','meat','bird','egg','veg'].forEach(function(k){
MENU[k][1]=MENU[k][1].concat(['{x}のスープ']);
MENU[k][2]=MENU[k][2].concat(['+{x}と{y}のスープ']);
MENU[k][3]=MENU[k][3].concat(['{x}の滋味スープ']);
});
MENU.fruit[1]=MENU.fruit[1].concat(['{x}の甘いスープ','焼き{x}の皮ごと']);
var SEASON=[
{t:'海水を煮詰めた塩',need:1},{t:'浜で摘んだ香草',need:2},{t:'野生の柑橘の汁',need:2},{t:'野生の唐辛子',need:2},
{t:'ココナッツミルク',need:2,item:'ヤシの実'},{t:'海藻の出汁',need:2,item:'海藻'},{t:'燻した木の香り',need:3},{t:'焦がした果実の甘み',need:3,item:'バナナ'},
{t:'ウニの塩辛',need:3,item:'ウニ'},{t:'貝の旨み',need:2,item:'貝'},{t:'木の実を砕いた衣',need:3,item:'木の実'},{t:'何も入れない素材の味',need:0}
];
var TASTE=[
['なんとか腹は膨れた。','誰も感想を言わなかった。','食べられないことはなかった。','「…食べ物ではある」と誰かが言った。'],
['素朴だが、ちゃんとおいしかった。','まあまあの味だった。','温かいだけで、ありがたかった。','思ったよりいけた。'],
['全員が無言でおかわりを求めた。','島に来て一番の御馳走だった。','一口目で、誰かが「うま」と漏らした。','鍋の底まできれいになくなった。'],
['「ここに店を出せる」と誰かが言った。','盛り付けまで美しく、しばらく誰も手をつけられなかった。','全員が黙って、ゆっくり味わった。','「帰ってもこれが食べたい」と誰かが言った。']
];
function pickNew(ctx,list,used){
var fresh=list.filter(function(x){return!used[x];});
var src=fresh.length?fresh:list;
return src[ctx.rng.int(src.length)];
}
IC.dish=function(ctx,got,q){
var I=ctx.isl,used=(I.usedDish=I.usedDish||{});
I.usedMain=I.usedMain||{};
var main=HK.weighted(ctx.rng,got,function(g){return(g.tier+1)*(I.usedMain[g.name]?0.35:1.5)*(/幼虫|カブトムシ|セミ|イナゴ|コオロギ|シロアリ/.test(g.name)?1.6:1);})||got[0];I.usedMain[main.name]=(I.usedMain[main.name]||0)+1;
var side=got.filter(function(g){return g!==main&&catOf(g.name)!==catOf(main.name);})[0]||got.filter(function(g){return g!==main;})[0];
var qq=q>=2&&ctx.rng()<0.28?q-1:q;
var tmpl=MENU[catOf(main.name)][qq].filter(function(t){return t.charAt(0)!=='+'||side;});
var t=pickNew(ctx,tmpl,used);
used[t]=1;
var name=t.replace(/^\+/,'').replace(/\{x\}/g,main.name).replace(/\{y\}/g,side?side.name:'');
var have=got.map(function(g){return g.name;});
var ss=SEASON.filter(function(x){return x.need<=q+1&&(!x.item||have.indexOf(x.item)>=0);});
var season=q===0?null:pickNew(ctx,ss.map(function(x){return x.t;}),I.usedSeason=I.usedSeason||{});
if(season)I.usedSeason[season]=1;
return{name:name,main:main,season:season,taste:ctx.rng.pick(TASTE[q])};
};
function line(ctx,list,a,b){return ctx.t(ctx.pick(list),a,b);}
IC.helper=function(ctx,cook,q){
var P=ctx.present(),rng=ctx.rng;
if(P.length<2||rng()>0.6)return null;
var h=ctx.most(ctx.others(cook),function(c){return c.tr.np*0.5+c.tr.warmth*0.4+ctx.R(c,cook).aff/80+ctx.R(c,cook).att/80+rng()*0.6;});
if(!h)return null;
var hs=ctx.stat(h,'cook'),cs=ctx.stat(cook,'cook'),att=ctx.R(h,cook).att+ctx.R(cook,h).att;
var kind,dq=0,text,fx;
if(att>55&&HK.canLove(h,cook)&&rng()<0.6)kind='sweet';
else if(h.tr.fc>0.62&&rng()<0.5)kind='sneak';
else if(hs<=2)kind='clumsy';
else if(hs>=4)kind='duo';
else if(cook.tr.np>0.55&&cs>hs)kind='teach';
else kind='care';
var L={
sweet:['{b}が「味見して｜味見をしてくれ｜味見してください」と木のスプーンを差し出した。{a}はそれを口に入れて、ちょっと間を置いてから「…おいしい｜＝｜…おいしいです」と言った。','鍋をかき混ぜる{b}の後ろから、{a}が覗き込んだ。肩が触れて、二人ともしばらく動かなかった。','{a}は{b}の頬についた煤を、指でそっと拭った。{b}は「…ありがと｜…ありがとう｜…ありがとうございます」と鍋に視線を戻した。','狭い調理場で、{a}と{b}の手が何度もぶつかった。三回目からは、どちらも謝らなくなった。','{b}が熱がって指を振ると、{a}はその手を取って海水に浸した。'],
sneak:['{a}は「味見」と称して、焼けたそばから三切れ食べた。{b}に手を叩かれた。','{a}がつまみ食いしようと伸ばした手を、{b}は見もせずに菜箸で払った。','{a}は手伝うと言いながら、気づけば火のそばで一番いい匂いを嗅いでいるだけだった。','{a}「これ失敗作？食べていい？｜これは失敗作か？食べていいか？｜これ失敗作ですか？食べていいですか？」{b}「失敗してない｜失敗していない｜失敗していません」{a}「じゃあ味見｜では味見だ｜では、味見します」','{a}はこっそり一口食べて「うまっ」と声に出してしまい、つまみ食いがバレた。'],
clumsy:['{a}は魚の鱗取りを任されて、鱗を顔中に飛ばした。{b}が吹き出した。','{a}は塩を「ひとつまみ」と言われて、ひとつかみ入れた。{b}が慌てて水で薄めた。','{a}は芋の皮むきで指を切りかけた。{b}「貸して｜貸せ｜貸してください」{a}「やだ、やる｜嫌だ、やる｜嫌です、やります」','魚と目が合った{a}は、悲鳴を上げて{b}の背中に隠れた。','{a}が火加減を見ている間に、鍋が一つ真っ黒になった。{b}は何も言わずにもう一つ作り直した。','{a}「これ、どこまで切ればいいの｜これは、どこまで切ればいいのか｜これ、どこまで切ればいいんですか」{b}「…そこで止めて。そこ。止めて！｜…そこで止めろ。そこだ。止めろ！｜…そこで止めてください。そこです。止めてください！」'],
duo:['{a}と{b}は言葉を交わさずに、下ごしらえと火の番を分担した。息がぴったりだった。','{a}が「隠し味に、これどう？｜隠し味に、これはどうだ？｜隠し味に、これはどうですか？」と柑橘を差し出した。{b}は一口かじって、黙って鍋に絞った。','{a}と{b}は味付けで小さく揉めた。結局、両方の案を半分ずつ入れた。それが一番おいしかった。','二人がかりの料理は、いつもより一品多かった。'],
teach:['{b}は{a}の手を取って、包丁の角度を教えた。{a}は真剣な顔で頷いた。','{b}「魚はね、お腹から開くの｜魚は、腹から開くんだ｜魚は、お腹から開くんです」{a}は言われた通りにして、初めてうまくいった。','{b}が火の起こし方を教えると、{a}は三回目で成功して小さく跳ねた。','{b}「上手いじゃん｜上手いじゃないか｜お上手ですね」{a}は照れて、残りの魚を全部捌いた。'],
care:['{a}は大きな葉を洗って、全員分の皿を並べた。','{a}は{b}が作っている間、ずっと隣で火に枝をくべていた。','{a}は{b}に「先に食べて。作った人が一番｜先に食べろ。作った者が一番だ｜先に食べてください。作った人が一番です」と一番いいところを取り分けた。','{a}は流木を削って、{b}専用の菜箸を作った。','{a}は料理中の{b}の額の汗を、そっと拭った。']
}[kind];
text=line(ctx,L,h,cook);
if(kind==='clumsy'&&rng()<0.4)dq= -1;
if(kind==='duo')dq=1;
if(kind==='sneak'&&rng()<0.3)dq= -1;
fx=function(){
var g={sweet:[4,8],sneak:[3,1],clumsy:[4,2],duo:[4,2],teach:[5,2],care:[5,2]}[kind];
ctx.mod2(h,cook,{aff:g[0],trust:3,att:kind==='sweet'?g[1]:0},{aff:g[0],trust:3,att:kind==='sweet'?g[1]:0});
ctx.stress(h,-5);ctx.stress(cook,-5);
};
var why={sweet:'二人の惹かれ（'+Math.round(att/2)+'）',sneak:h.name+'のFC（'+Math.round(h.eg.FC)+'）',clumsy:h.name+'の料理 '+hs+'（不器用）',duo:'二人とも料理が得意（'+hs+'・'+cs+'）',teach:cook.name+'のNPと料理の腕',care:h.name+'のNP（'+Math.round(h.eg.NP)+'）'}[kind];
return{who:h,kind:kind,dq:dq,text:text,fx:fx,why:'料理の手伝い：'+why,cat:kind==='sweet'?'romance':'bond'};
};
})();
});
;
/* ==== js/island-life.js ==== */
HK.Load.def(127,'js/island-life.js',function(){
(function(){
'use strict';
var HK=window.HK;
var isl=HK.SCENARIOS.island;
if(!isl)return;
function R(ctx,a,b){return ctx.R(a,b);}
function names(list){return list.map(function(c){return c.name;}).join('・');}
function pk(ctx,arr){return arr[ctx.rng.int(arr.length)];}
function sk(ctx,c,id){return ctx.stat(c,id);}
isl.stats=isl.stats.concat([
{id:'cook',label:'料理',desc:'同じ食材でも豪華な料理にできる。うまい食事は体力と気持ちを回復させる'},
{id:'fish',label:'釣り',desc:'大物が釣れる確率。漁獲量にも効く'},
{id:'hunt',label:'狩猟',desc:'鳥や獣を獲る力。危険な獲物に返り討ちに遭いにくい'},
{id:'build',label:'拠点づくり',desc:'寝床や屋根を整える力。拠点がよいほど夜にしっかり回復する'}
]);
isl.actions=isl.actions.concat([
{id:'fishing',label:'釣りに行く',fit:function(t){return t.a*0.4+t.caution*0.3+(1-t.fc)*0.2;},bias:{solo:1.3,help:1.3}},
{id:'hunting',label:'狩りに出る',fit:function(t){return t.aggr*0.6+t.fc*0.3;},bias:{solo:1.4,combat:1.2}},
{id:'cooking',label:'料理番をする',fit:function(t){return t.np*0.6+t.fc*0.2;},bias:{help:1.6,bond:1.3}}
]);
isl.env=isl.env.concat([
{id:'dark',label:'飢えの果て',type:'select',def:'yes',options:[{v:'yes',label:'あり（殺し合い・人を食べることも）'},{v:'mild',label:'揉めるまで'}]}
]);
var FISH=[
['ハゼ',1,3],['小アジ',1,4],['ベラ',1,3],['カサゴ',2,5],['メバル',2,5],['アジ',2,6],['サバ',2,7],['イサキ',3,8],
['タコ',3,8],['フグ',3,8],['イカ',3,7],['ヒラメ',4,10],['真鯛',4,12],['カツオ',4,14],['伊勢海老',5,10],['大きなハタ',5,16],
['ボラ',1,4],['ブダイ',2,6],['ハリセンボン',2,5],['ウツボ',3,9],['シイラ',4,13],['アオリイカ',4,9]
];
var GAME=[['野鳥',1,5],['ハト',1,4],['カモ',2,7],['ヤシガニ',2,7],['野ウサギ',2,8],['大トカゲ',2,8],['海鳥の卵',1,4],['ヘビ',2,5],['野ヤギ',4,16],['イノシシ',5,22]];
var FORAGE=[
['ヤシの実',4],['バナナ',5],['マンゴー',5],['パパイヤ',5],['グアバ',3],['パッションフルーツ',3],['野生のパイナップル',4],['野イチゴ',2],['イチジク',3],
['スターフルーツ',3],['ライム',2],['ドラゴンフルーツ',4],['サトウキビ',3],['マカダミアナッツ',3],['クルミ',3],
['貝',5],['ハマグリ',5],['サザエ',5],['トコブシ',4],['カキ',5],['ウニ',4],['ナマコ',4],['カニ',4],['海藻',3],
['野草',2],['山芋',5],['タロイモ',6],['ヤムイモ',6],['野生のネギ',2],['ツワブキ',2],['長命草',2],['アロエ',2],['ノビル',2],
['ヒラタケに似たキノコ',3,0.15],['タマゴタケ',3,0.25],['アミガサタケ',3,0.1],['キクラゲ',3,0],['白い傘のキノコ',3,0.5],['派手な赤いキノコ',3,0.8],
['カブトムシの幼虫',3,0,'掘り出した'],['セミ',2,0,'捕まえた'],['イナゴ',2,0,'捕まえた'],['コオロギ',2,0,'捕まえた'],['カミキリムシの幼虫',3,0,'掘り出した'],['カブトムシ',2,0,'捕まえた'],['シロアリ',2,0,'集めた']
];
var FORAGE_NOBUG=FORAGE.filter(function(f){return!/幼虫|セミ|イナゴ|コオロギ|カブトムシ|シロアリ|ムシ/.test(f[0]);});
function catchFish(ctx,c){
var s=sk(ctx,c,'fish'),tier=Math.min(5,Math.max(1,Math.round(s*0.7+ctx.rng()*2.4+ctx.env.res/60-0.6)));
var list=FISH.filter(function(f){return f[1]<=tier&&f[1]>=tier-2;});
var f=pk(ctx,list),n=1+ctx.rng.int(1+s);
return{name:f[0],n:n,food:f[2]*(0.6+n*0.4),tier:f[1],who:c,how:'釣った'};
}
function hunt(ctx,c){
var s=sk(ctx,c,'hunt'),g=pk(ctx,GAME.filter(function(x){return x[1]<=s+1;}));
if(g[1]>=4&&ctx.rng()>0.35+s*0.1){c.hp-=12+ctx.rng.int(10);return{fail:true,name:g[0],who:c};}
var wb=ctx.isl&&ctx.isl.weapons?Math.min(0.2,ctx.isl.weapons.length*0.05):0;
if(ctx.rng()>0.3+s*0.13+wb)return{miss:true,name:g[0],who:c};
return{name:g[0],n:1,food:g[2],tier:g[1],who:c,how:g[0]==='海鳥の卵'?'見つけた':g[0]==='ヤシガニ'?'捕まえた':'仕留めた'};
}
function forage(ctx,c){
var f=pk(ctx,ctx.env.bugs==='no'?FORAGE_NOBUG:FORAGE),n=1+ctx.rng.int(2+sk(ctx,c,'know'));
var toxic=f[2]&&ctx.rng()<f[2]*(1.1-sk(ctx,c,'know')*0.18);
if(f[2]&& !toxic&&ctx.rng()<f[2]*0.5)return{miss:true,name:f[0],who:c,wary:true};
return{name:f[0],n:n,food:f[1]*(0.5+n*0.3)*(0.6+ctx.env.res/120),tier: /キノコ|タケ|キクラゲ/.test(f[0])?2:1,who:c,how:f[3]||(/キノコ|タケ|キクラゲ/.test(f[0])?'見つけた':'集めた'),toxic:toxic};
}
function meal(ctx,s){
var P=ctx.present(),rng=ctx.rng,I=ctx.isl,got=[],fails=[];
P.forEach(function(c){
if(c.hp<25||(I.hungry>=2&&c.stress>70&&rng()<0.3))return;
var aid=c.action&&c.action.id,r;
var wf=sk(ctx,c,'fish')+(aid==='fishing'?3:0),wh=sk(ctx,c,'hunt')+(aid==='hunting'?3:0),wg=2+(aid==='food'?3:0);
if(aid==='cooking'||aid==='base'){wf*=0.4;wh*=0.4;wg*=0.5;}
var roll=rng()*(wf+wh+wg);
if(roll<wf)r=catchFish(ctx,c);else if(roll<wf+wh)r=hunt(ctx,c);else r=forage(ctx,c);
if(r.fail||r.miss)fails.push(r);else got.push(r);
});
var total=got.reduce(function(a,g){return a+g.food;},0)*(0.3+ctx.env.res/220);
got.sort(function(a,b){return b.tier-a.tier;});
ctx.food+=total;
var cook=ctx.most(P,function(c){return sk(ctx,c,'cook')+(c.action&&c.action.id==='cooking'?2:0)+c.tr.np*0.5+rng()*1.6-(I.lastCook===c.i&&I.cookStreak>=2?3:0);});
I.cookStreak=I.lastCook===cook.i?(I.cookStreak||0)+1:1;I.lastCook=cook.i;
var best=got[0];
function unit(g){return/釣った/.test(g.how)|| /幼虫|セミ|イナゴ|コオロギ|カブトムシ|ムシ/.test(g.name)?'匹': /シロアリ/.test(g.name)?'':'つ';}
function say1(g){return g.who.name+'が'+g.name+(g.n>1&&unit(g)?g.n+unit(g):'')+'を'+g.how;}
var parts=got.slice(0,3).map(say1);
fails.forEach(function(f){
if(f.fail)parts.push(f.who.name+'は'+f.name+'に返り討ちに遭った');
});
if(!got.length){
I.lastMeal=0;
ctx.act2({actors:[cook],cat:'solo',text:(parts.length?parts.join('。')+'。':'')+'今日は誰も、何も獲れなかった。'+(P.length>2?'夕食は水だけだった。':''),why:'漁・狩りの不発'});
return;
}
var help=HK.IslandCook.helper(ctx,cook);
var q=HK.clamp(Math.round(sk(ctx,cook,'cook')*0.75-1+(best.tier>=3?0.6:0)+(rng()-0.5)*1.4)+(help?help.dq:0),0,3);
if(ctx.food<P.length*4)q=Math.min(q,1);
var D=HK.IslandCook.dish(ctx,got,q),dish=D.name;
best=D.main;
if(got.indexOf(best)>2)parts[Math.min(2,parts.length-1)]=say1(best);
var bad=got.filter(function(g){return g.toxic;})[0];
var poison=((best.name==='フグ'||(/貝|カキ/.test(best.name)&&rng()<0.08))&&sk(ctx,cook,'cook')<4)||(bad&&rng()>sk(ctx,cook,'cook')*0.12);
I.lastMeal=q;
I.dishes.push({s:s,dish:dish,by:cook.i,q:q});
var fx=function(){
P.forEach(function(c){
c.hp=Math.min(100,c.hp+q*2.6);
c.stress=HK.clamp(c.stress-q*5,0,100);
if(c!==cook&&q>=2)ctx.mod(c,cook,{aff:q*1.5,trust:q});
});
};
var line=parts.join('。')+'。'+cook.name+(help?'と'+help.who.name:'')+'が「'+dish+'」を作った。'+(D.season?'味付けは'+D.season+'。':'')+D.taste;
if(q>=3&&P.length>2&&rng()<0.6){
var fan=ctx.most(ctx.others(cook),function(c){return c.tr.fc+c.tr.warmth;});
line+=fan.name+'「'+pk(ctx,['おかわり！','ねえ、これ帰ってからも作って','料理人だったの？','もう帰らなくていいかも'])+'」';
}
if(help)ctx.act2({actors:[help.who,cook],cat:help.cat,fx:help.fx,text:help.text,why:help.why+(help.dq>0?'（料理の出来が上がった）':help.dq<0?'（料理の出来が下がった）':''),mag:6});
ctx.act2({actors:[cook],cat:q>=2?'bond':'help',fx:fx,text:line,why:cook.name+'の料理 '+sk(ctx,cook,'cook')+'・食材「'+best.name+'」',mag:q*3});
if(HK.Food&&P.length>1&&HK.Food.any(P)){
var fe=ctx.others(cook).filter(function(c){return P.indexOf(c)>=0;}),fp=fe.filter(HK.Food.has),eater=(fp.length?fp:fe)[ctx.rng.int((fp.length?fp:fe).length||1)];
if(eater)ctx.act2({actors:[eater,cook],cat:'bond',fx:function(){
var r=HK.Food.meal(ctx,cook,eater,dish,{q:q});
var lg=r&&HK.Food.like(eater).length&&ctx.rng()<0.35?HK.Food.longing(ctx,eater):null;
if(lg){r.text+=lg.text;r.why+='／'+lg.why;}
return r;
},text:function(r){return r&&r.text;},why:function(r){return r?'料理の味：'+r.why:'';},mag:3});
}
if(poison){
var vic=pk(ctx,P.length>1?ctx.others(cook):P);
vic.hp-=25;
if(bad){
var fg=bad.who;
var mt=pk(ctx,['夜中、'+vic.name+'が急に笑い出して止まらなくなった。原因は'+fg.name+'が採ってきた'+bad.name+'だった。',vic.name+'は焚き火に向かって「綺麗な蝶がいっぱいいる｜綺麗な蝶がたくさんいる｜綺麗な蝶がいっぱいいます」と言い続けた。'+fg.name+'「…あのキノコ、やっぱりダメなやつだった？｜…あのキノコは、やはり駄目なものだったか？｜…あのキノコ、やっぱりダメなものでしたか？」',vic.name+'は夜通し吐き続けた。'+fg.name+'は青い顔で背中をさすり、「ごめん、ごめん｜すまない、すまない｜ごめんなさい、ごめんなさい」と繰り返した。',vic.name+'の手がしびれて、貝殻のスプーンを落とした。'+fg.name+'「'+bad.name+'、似てたんだよ、食べられるやつに…｜'+bad.name+'は、食べられるものに似ていたんだ…｜'+bad.name+'、食べられるものに似ていたんです…」']);
ctx.act2({actors:[vic,fg],cat:'conflict',fx:function(){ctx.mod(vic,fg,{ten:10,trust: -6});ctx.mod(fg,vic,{aff:3});ctx.stress(fg,10);},text:mt,why:fg.name+'のサバイバル知識 '+sk(ctx,fg,'know')+'（毒キノコを見分けられなかった）'});
}else
ctx.act2({actors:[vic,cook],cat:'conflict',fx:function(){ctx.mod(vic,cook,{ten:15,trust: -10});},text:'夜中、'+vic.name+'が腹を押さえて転げ回った。'+(vic===cook?vic.name+'「…自分で作ったのに…｜…自分で作ったというのに…｜…自分で作ったんですけど…」':vic.name+'「…'+cook.name+'、あれ、ちゃんと火通した？｜…'+cook.name+'、あれにはちゃんと火を通したのか？｜…'+cook.name+'、あれ、ちゃんと火を通しましたか？」'),why:'料理の腕が足りず、毒にあたった'});
}
}
var BASE=['野宿','雨よけの屋根','寝床つきの小屋','快適な拠点'];
function build(ctx){
var P=ctx.present(),I=ctx.isl;
var add=0,best=null,bv=0;
P.forEach(function(c){
var w=sk(ctx,c,'build')*(c.action&&c.action.id==='base'?1.6:0.5)*(c.hp>30?1:0.3);
add+=w;if(w>bv){bv=w;best=c;}
});
var before=Math.floor(I.base/34);
I.base=Math.min(100,I.base+add*2.2);
var lv=Math.min(3,Math.floor(I.base/34));
if(lv>before&&best){
ctx.act2({actors:[best],cat:'help',fx:function(){ctx.others(best).forEach(function(o){ctx.mod(o,best,{trust:6,aff:3});});},
text:best.name+'の指揮で、拠点が「'+BASE[lv]+'」になった。'+pk(ctx,['今夜から、雨に濡れずに眠れる。','寝床に葉を敷き詰めると、ふかふかになった。','焚き火の周りに、ちゃんとした居場所ができた。']),why:'拠点づくり '+sk(ctx,best,'build')});
}
return lv;
}
function hungerTurn(ctx){
var I=ctx.isl,P=ctx.present(),rng=ctx.rng;
if(I.hungry<2||P.length<2)return;
var heat=I.hungry*0.18+P.reduce(function(a,c){return a+c.stress;},0)/P.length/250;
if(rng()>heat)return;
var a=ctx.most(P,function(c){return c.tr.aggr+c.stress/100+c.tr.cold*0.5-c.tr.np*0.5;});
var b=ctx.most(ctx.others(a),function(c){return R(ctx,a,c).ten/50-R(ctx,a,c).aff/60+(c.hp<40?0.5:0);});
var dark=ctx.env.dark!=='mild';
var lvl=I.hungry+(a.stress>75?1:0)+(a.tr.cold>0.65?1:0);
if(dark&&lvl>=4&&R(ctx,a,b).aff<10&&rng()<0.45){
var r=ctx.fight(a,b,{lethality:1.3,ambush:true,canSpare:R(ctx,a,b).aff>0});
ctx.act2({actors:[a,b],cat:'combat',text:'飢えが'+a.name+'の中の何かを壊した。'+a.name+'「…ごめん。でも、もう無理なんだ｜…すまない。だが、もう無理なんだ｜…ごめんなさい。でも、もう無理なんです」'+r.text,why:'飢え'+I.hungry+'日目・'+a.name+'の攻撃性とドライさ。'+r.why});
ctx.flush();
if(r.killed)I.corpse={v:b.i,by:a.i};
return;
}
var lines=[
[a.name+'「あなた、昨日の分も食べたでしょ｜あなた、昨日の分も食べただろう｜あなた、昨日の分も食べましたよね」'+b.name+'「食べてない！｜食べていない！｜食べていません！」','食べ物の取り分で口論になった'],
[a.name+'は'+b.name+'の手から貝殻の器を叩き落とした。'+a.name+'「働いてない奴に食わせる分はない｜働いていない者に食わせる分はない｜働いていない人に食べさせる分はありません」','働き分を巡る衝突'],
[a.name+'「誰のせいでこうなったと思ってるの｜誰のせいでこうなったと思っている｜誰のせいでこうなったと思っているんですか」'+b.name+'は何も言い返さなかった。','飢えで責任をなすりつけた'],
['焚き火の前で、'+a.name+'と'+b.name+'が掴み合いになった。原因は、焦げた魚の頭一つだった。','空腹が理性を削った']
];
var L=pk(ctx,lines);
ctx.act2({actors:[a,b],cat:'conflict',fx:function(){ctx.mod2(a,b,{ten:16,aff: -8},{ten:18,aff: -10,trust: -8});ctx.others(a).forEach(function(o){if(o!==b)ctx.stress(o,6);});},text:L[0],why:L[1]+'（飢え'+I.hungry+'日目）'});
}
function corpseTurn(ctx){
var I=ctx.isl,rng=ctx.rng;
if(ctx.env.dark==='mild'||I.ate)return;
var dead=ctx.chars.filter(function(c){return!c.alive&&(I.buried||[]).indexOf(c.i)>=0;});
if(!dead.length||I.hungry<3)return;
var P=ctx.present();
var a=ctx.most(P,function(c){return c.tr.cold+c.stress/100-c.tr.np*0.6+(I.corpse&&I.corpse.by===c.i?0.6:0);});
if(!a||rng()>0.25+a.tr.cold*0.3+I.hungry*0.05)return;
var v=I.corpse&&dead.indexOf(ctx.chars[I.corpse.v])>=0?ctx.chars[I.corpse.v]:pk(ctx,dead);
I.ate=true;
ctx.food+=25;
var eaters=P.filter(function(c){return c===a||c.tr.cold+c.stress/100>1||rng()<0.3;});
var refused=P.filter(function(c){return eaters.indexOf(c)<0;});
ctx.act2({actors:eaters,cat:'betray',fx:function(){
eaters.forEach(function(c){c.stress=HK.clamp(c.stress+20,0,100);});
refused.forEach(function(c){eaters.forEach(function(e){ctx.mod(c,e,{aff: -25,trust: -20,ten:25});});});
eaters.forEach(function(e){eaters.forEach(function(f){if(e!==f){ctx.mod(e,f,{trust:8});ctx.pair(e,f).secret=true;}});});
},text:'その夜、焚き火で焼かれていた肉が何だったのか、'+a.name+'は説明しなかった。'+v.name+'の墓は、少し浅くなっていた。'+(refused.length?refused.map(function(c){return c.name;}).join('・')+'は、最後まで口をつけなかった。':'誰も、何も言わなかった。'),why:'飢え'+I.hungry+'日目。'+a.name+'のドライさと極限状態',mag:40});
}
var oldSetup=isl.setup,oldAfter=isl.after;
isl.setup=function(ctx){
oldSetup(ctx);
ctx.isl={base:0,hungry:0,dishes:[],lastMeal:0};
};
isl.after=function(ctx,s,n){
var I=ctx.isl;
meal(ctx,s);
var lv=build(ctx);
var need=ctx.present().length*6;
I.hungry=ctx.food+ctx.env.res/100*3<need?I.hungry+1:0;
if(I.hungry===2)ctx.incident('二日続けて、まともな食事がない。焚き火の周りの会話が減った。');
if(I.hungry===4)ctx.incident('飢えて四日目。誰もが、誰かの取り分を数えていた。');
oldAfter(ctx,s,n);
var heal=[0,4,8,13][lv];
var stormy=ctx.env.storm/100*ctx.rng();
ctx.present().forEach(function(c){
c.hp=Math.min(100,c.hp+heal-(lv===0?stormy*8:0));
if(I.hungry>=2)c.stress=HK.clamp(c.stress+I.hungry*4,0,100);
});
hungerTurn(ctx);
corpseTurn(ctx);
};
isl.notes=function(ctx){return ctx.isl;};
var stash=isl.events.filter(function(e){return e.id==='stashfound';})[0];
if(stash){
var run0=stash.run;
stash.run=function(ctx,a,b){
var r=run0(ctx,a,b);
b.flags.exposed={by:a.i,at:ctx.stepIndex};
r.text+=a.name+'「これ、何？｜これは何だ？｜これ、何ですか？」'+b.name+'は目を逸らした。';
return r;
};
}
isl.events=isl.events.concat([
{
id:'steal',cat:'betray',scope:'solo',
when:function(ctx,a){return ctx.isl&&ctx.isl.hungry>=1&& !a.flags.exposed;},
w:function(ctx,a){return(a.tr.cold*0.6+a.tr.impulse*0.3-a.tr.np*0.4+a.stress/200)*(a.goal.id==='self'?1.6:0.8);},
run:function(ctx,a){
a.flags.stash=(a.flags.stash||0)+8;ctx.food=Math.max(0,ctx.food-8);
return{text:ctx.t(pk(ctx,['夜中、{a}は共有の食料袋に手を入れた。','{a}は干し魚を一切れ、袖に隠した。','{a}は見張りの交代の隙に、ヤシの実を一つ埋めた。']),a),why:a.name+'のドライさ・衝動と飢え'};
}
},
{
id:'quarrel_thief',cat:'conflict',scope:'pair',
when:function(ctx,a,b){return b.flags.exposed&& !b.flags.apologized&&ctx.stepIndex-b.flags.exposed.at<=2&& !b.flags.quarreled;},
w:function(ctx,a,b){return 0.6+a.tr.cp*0.8+R(ctx,a,b).ten/60;},
run:function(ctx,a,b){
b.flags.quarreled=true;
ctx.mod2(a,b,{ten:18,trust: -10},{ten:14});
var back=b.tr.cp>0.6?b.name+'「生き残るためだろ。あなただって腹減ってるくせに｜生き残るためだろう。あなただって腹が減っているくせに｜生き残るためでしょう。あなただって、お腹が空いているじゃないですか」':b.tr.ac>0.6?b.name+'は唇を噛んで、黙って俯いた。':b.name+'「…ちょっとだけのつもりだった｜…少しだけのつもりだった｜…ちょっとだけのつもりでした」';
return{text:a.name+'「仲間だと思ってたのに｜仲間だと思っていたのに｜仲間だと思っていましたのに」'+back,why:a.name+'のCP（不正を許さない）'};
}
},
{
id:'apology',cat:'help',scope:'pair',
when:function(ctx,a,b){return a.flags.exposed&& !a.flags.apologized&&ctx.stepIndex-a.flags.exposed.at>=1&&(b.i===a.flags.exposed.by||ctx.rng()<0.3);},
w:function(ctx,a){return 0.4+a.tr.ac*0.8+a.tr.np*0.6+a.tr.honesty*0.3-a.tr.cp*0.3;},
run:function(ctx,a,b){
a.flags.apologized=true;
var how=a.tr.ac>0.6?a.name+'は'+b.name+'の前で、額を砂につけた。「ごめんなさい。本当に、ごめんなさい」':
a.tr.fc>0.6?a.name+'は獲ってきた一番大きな魚を差し出した。「これでチャラ…にはならないよね。ごめん｜これで帳消し…にはならないな。すまない｜これでチャラ…にはなりませんよね。ごめんなさい」':
a.tr.cp>0.6?a.name+'はしばらく黙ってから、ぶっきらぼうに言った。「…悪かった。二度としない」':
a.name+'は'+b.name+'の隣に座って、小さな声で言った。「ずっと言わなきゃって思ってた。ごめん｜ずっと言わなければと思っていた。すまない｜ずっと言わなきゃと思っていました。ごめんなさい」';
var forgive=b.tr.np*0.6+R(ctx,b,a).aff/100+0.25>ctx.rng();
if(forgive){
ctx.mod2(a,b,{trust:10,aff:6,ten: -12},{trust:12,aff:8,ten: -15});
ctx.others(a).forEach(function(o){if(o!==b)ctx.mod(o,a,{trust:6,ten: -6});});
how+=b.name+pk(ctx,['「…次やったら海に放り込むからね｜…次やったら海に放り込むからな｜…次やったら海に放り込みますからね」と、少し笑った。','は黙って、'+a.name+'の頭を一度だけ叩いた。','「腹が減ってたのは、みんな同じだよ｜腹が減っていたのは、皆同じだ｜お腹が空いていたのは、みんな同じですよ」と言った。','は「もういいよ｜もういい｜もういいですよ」と言って、魚を半分に割った。']);
}else{
ctx.mod2(a,b,{ten:4},{ten:6});
how+=b.name+pk(ctx,['は返事をしなかった。','「謝って済むなら、腹は減らない｜＝｜謝って済むなら、お腹は空きません」と背を向けた。','は「信用は、獲り直せないよ｜信用は、獲り直せない｜信用は、獲り直せませんよ」と言った。']);
}
return{cat:forgive?'help':'conflict',text:how,why:(forgive?b.name+'のNPが許した':b.name+'は許さなかった')+'（'+a.name+'のAC・NP）',mag:10};
}
},
{
id:'campfire_talk',cat:'bond',scope:'pair',
w:function(ctx,a,b){return 0.3+(ctx.isl&&ctx.isl.lastMeal>=2?0.4:0)+a.tr.warmth*0.3;},
run:function(ctx,a,b){
ctx.mod2(a,b,{aff:5,trust:4},{aff:5,trust:4});
var L=['{a}「帰ったら、最初に何食べたい？｜帰ったら、最初に何を食べたい？｜帰ったら、最初に何を食べたいですか？」{b}「…今日の魚、かな｜…今日の魚、だな｜…今日の魚、でしょうか」','{a}「この島、星がすごいね｜この島は、星がすごいな｜この島、星がすごいですね」{b}「怖いくらい｜怖いくらいだ｜怖いくらいです」','{a}「もし救助が来なかったら、どうする？｜＝｜もし救助が来なかったら、どうしますか？」{b}「そのときは、ここで店でも開こう｜＝｜そのときは、ここで店でも開きましょう」','{a}「私、{b}がいてよかった｜私は、{b}がいてよかった｜私、{b}さんがいてよかったです」{b}「急にどうしたの｜急にどうした｜急にどうしたんですか」','{a}「寝てる間、私が火の番代わろうか｜寝ている間、私が火の番を代わろうか｜寝ている間、私が火の番を代わりましょうか」{b}「ありがと。じゃあ、隣で寝る｜ありがとう。では、隣で寝る｜ありがとうございます。では、隣で寝ますね」'];
return{text:ctx.t(pk(ctx,L),a,b),why:'食後の焚き火'};
}
}
]);
})();
});
;
/* ==== js/island-hazard.js ==== */
HK.Load.def(128,'js/island-hazard.js',function(){
(function(){
'use strict';
var HK=window.HK;
var isl=HK.SCENARIOS.island;
if(!isl)return;
function R(ctx,a,b){return ctx.R(a,b);}
function pk(ctx,arr){return arr[ctx.rng.int(arr.length)];}
function sk(ctx,c,id){return ctx.stat(c,id);}
function names(list){return list.map(function(c){return c.name;}).join('・');}
isl.env=isl.env.concat([{id:'danger',label:'危険な生き物',min:0,max:100,def:40,lo:'いない',hi:'うようよ',desc:'毒蛇やイノシシが出る頻度。出たら討伐するか避けるかを話し合う'}]);
var BEASTS=[
{id:'habu',name:'毒蛇',venom:true,pow:0.55,dmg:14,meat:8,
sign:['{a}が拠点の裏で、大きな蛇の抜け殻を見つけた。{a}「…これ、腕くらい太くない？｜…これは、腕くらい太くないか？｜…これ、腕くらい太くないですか？」','夜中、草むらで何かが這う音がした。{a}「今の、聞こえた？｜今のが、聞こえたか？｜今の、聞こえましたか？」','{a}は岩の上で日向ぼっこする、三角頭の蛇を見た。黙って後ずさった。'],
attack:['{a}の足首に、草むらから飛び出した毒蛇が噛みついた。{a}「痛っ…！」二つの小さな穴から血が滲んだ。','薪を拾おうとした{a}の手に、毒蛇が食らいついた。','寝床の葉の下に、毒蛇が潜んでいた。{a}の悲鳴で全員が飛び起きた。']},
{id:'mukade',name:'大ムカデ',venom:true,pow:0.4,dmg:10,meat:0,
sign:['{a}の靴の中から、手のひらほどのムカデが這い出してきた。{a}「…」声も出なかった。','倒木をひっくり返した{a}が、赤黒いムカデの群れを見て凍りついた。'],
attack:['眠っていた{a}の首筋を、大ムカデが這った。次の瞬間、焼けるような痛みが走った。','{a}が岩の隙間に手を入れた瞬間、大ムカデに噛まれた。腕が見る見る腫れた。']},
{id:'boar',name:'気の荒いイノシシ',venom:false,pow:0.7,dmg:24,meat:22,
sign:['{a}が森の入り口で、地面がめちゃくちゃに掘り返されているのを見つけた。{a}「…デカいのがいる｜…大きいのがいる｜…大きいのがいます」','夜、拠点の食料が荒らされていた。蹄の跡が残っていた。'],
attack:['茂みから飛び出したイノシシが、{a}を跳ね飛ばした。{a}は太腿を押さえてうずくまった。','{a}は果物を採っている最中にイノシシと鉢合わせし、牙で脚を裂かれた。']},
{id:'spider',name:'毒グモ',venom:true,pow:0.3,dmg:8,meat:0,
sign:['拠点の屋根の裏に、拳ほどの毛むくじゃらのクモが巣を張っていた。{a}「無理無理無理」'],
attack:['{a}が上着を着た瞬間、袖の中のクモに噛まれた。{a}「…なんか、手がしびれる｜…何か、手がしびれる｜…なんだか、手がしびれます」']}
];
var WEAPONS=[
{n:'竹槍',t:'{a}は竹の先を石で斜めに削いで、竹槍を作った。'},{n:'銛',t:'{a}は流木の先に、研いだ貝殻を蔓で縛りつけて銛にした。'},
{n:'石斧',t:'{a}は平たい石を何時間も研いで、石斧を作った。「これで叩けば一発｜これで叩けば一発だ｜これで叩けば一発です」'},{n:'弓矢',t:'{a}はしなる枝と蔓で弓を張った。矢羽は海鳥の羽根だった。'},
{n:'投石紐',t:'{a}は布を裂いて投石紐を編んだ。試しに投げた石が、ヤシの実を割った。'},{n:'松明',t:'{a}は乾いた葉を束ねて、松明を何本も作った。「火なら、どんな生き物も怯む｜＝｜火なら、どんな生き物も怯みます」'},
{n:'木の盾',t:'{a}は流木を蔓で編んで、小さな盾を作った。'},{n:'棍棒',t:'{a}は太い枝の先に石を括りつけて、棍棒を作った。'},
{n:'落とし穴',t:'{a}は獣道に穴を掘り、上を葉で覆って罠を仕掛けた。'},{n:'二股の枝',t:'{a}は先が二股の枝を削った。「蛇は頭を押さえるのが一番｜蛇は頭を押さえるのが一番だ｜蛇は頭を押さえるのが一番です」'}
];
function venomTick(ctx){
ctx.present().forEach(function(c){
if(!c.flags.venom)return;
c.hp-=6+(c.flags.venom>2?4:0);
c.flags.venom--;
if(c.hp<=0){ctx.kill(c,null,'毒が全身に回った');return;}
var nurse=ctx.most(ctx.others(c),function(o){return o.tr.np+sk(ctx,o,'know')*0.15+R(ctx,o,c).aff/100;});
if(nurse&&ctx.rng()<0.35+nurse.tr.np*0.3+sk(ctx,nurse,'know')*0.08){
c.flags.venom=0;c.hp=Math.min(100,c.hp+8);
ctx.act2({actors:[nurse,c],cat:'help',fx:function(){ctx.mod2(nurse,c,{aff:5},{aff:12,trust:14});},
text:pk(ctx,[nurse.name+'は'+c.name+'の傷口を縛り、毒を吸い出しては吐いた。「動かないで。大丈夫だから｜動くな。大丈夫だ｜動かないでください。大丈夫ですから」',nurse.name+'は森で見つけた解毒の葉を噛み潰して、'+c.name+'の傷に貼った。熱が、少しずつ引いていった。',nurse.name+'は一晩中、'+c.name+'の手を握っていた。朝には腫れが引いていた。'+c.name+'「…ずっといたの？｜…ずっといたのか？｜…ずっといたんですか？」']),
why:nurse.name+'のNP・サバイバル知識 '+sk(ctx,nurse,'know')});
}
});
}
function hazardTurn(ctx){
var I=ctx.isl,P=ctx.present(),rng=ctx.rng,env=ctx.env;
if(!I||P.length<2)return;
I.weapons=I.weapons||[];
var H=I.hz;
if(!H){
if((I.hzCount||0)>=2||ctx.stepIndex<1||rng()>(env.danger==null?40:env.danger)/100*0.38)return;
var b=pk(ctx,BEASTS);
I.hz=H={b:b,stage:'sign'};I.hzCount=(I.hzCount||0)+1;
var f=ctx.most(P,function(c){return c.tr.caution+c.tr.fc*0.3+rng()*0.5;});
ctx.act2({actors:[f],cat:'solo',fx:function(){P.forEach(function(c){ctx.stress(c,6);});},text:ctx.t(pk(ctx,b.sign),f),why:'島の危険な生き物（'+b.name+'）の気配'});
return;
}
var B=H.b;
if(H.stage==='sign'||(H.stage==='avoid'&&rng()<0.4)){
var v=ctx.most(P,function(c){return(1-c.tr.caution)+(c.action&& /food|explore|hunting/.test(c.action.id)?0.4:0)+rng()*0.6;});
v.hp-=B.dmg+rng.int(8);
if(B.venom)v.flags.venom=3;
ctx.act2({actors:[v],cat:'solo',fx:function(){P.forEach(function(c){ctx.stress(c,8);if(c!==v)ctx.mod(c,v,{aff:3});});},text:ctx.t(pk(ctx,B.attack),v),why:B.name+'の襲撃'+(B.venom?'（毒）':'')+'。'+v.name+'の慎重さ '+Math.round(v.tr.caution*100)});
if(v.hp<=0){ctx.kill(v,null,B.name+'に襲われた');ctx.flush();}
H.stage='council';H.attacks=(H.attacks||0)+1;
return;
}
if(H.stage==='council'){
var lead=ctx.most(P,function(c){return c.tr.lead+c.tr.aggr*0.5+sk(ctx,c,'hunt')*0.1;});
var shy=ctx.most(ctx.others(lead),function(c){return c.tr.caution+c.tr.ac*0.5;});
var vote=P.reduce(function(s,c){return s+c.tr.aggr+c.tr.cp*0.5+sk(ctx,c,'hunt')*0.12-c.tr.caution*0.8;},0)/P.length+(H.attacks>=2?0.4:0);
var go=vote>0.2||rng()<0.25;
H.stage=go?'arm':'avoid';
ctx.act2({actors:[lead,shy],cat:go?'bond':'conflict',fx:function(){ctx.mod2(lead,shy,{ten:go?3:8},{ten:go?5:3});},
text:go?lead.name+'「このままじゃ、また誰かがやられる。こっちから'+B.name+'を仕留めに行こう｜このままでは、また誰かがやられる。こちらから'+B.name+'を仕留めに行こう｜このままでは、また誰かがやられます。こちらから'+B.name+'を仕留めに行きましょう」'+shy.name+'「…本気？｜…本気か？｜…本気ですか？」'+lead.name+'「本気。まずは武器｜本気だ。まずは武器だ｜本気です。まずは武器からです」':
lead.name+'「'+B.name+'を退治しに行くべきだ｜＝｜'+B.name+'を退治しに行くべきです」'+shy.name+'「危なすぎる。近づかなければいいだけでしょ｜危なすぎる。近づかなければいいだけだろう｜危なすぎます。近づかなければいいだけでしょう」結局、拠点の周りに近づかないことになった。',
why:'討伐か回避か（全員の攻撃性・CP・狩猟と慎重さの綱引き）'});
return;
}
if(H.stage==='arm'){
var makers=P.slice().sort(function(x,y){return(sk(ctx,y,'build')+sk(ctx,y,'hunt')+y.tr.a*2)-(sk(ctx,x,'build')+sk(ctx,x,'hunt')+x.tr.a*2);}).slice(0,Math.min(3,P.length));
var made=[];
makers.forEach(function(m){
var w=pk(ctx,WEAPONS.filter(function(x){return!I.weapons.some(function(y){return y.n===x.n;});}).concat(WEAPONS.slice(0,1)));
var q=sk(ctx,m,'build')+sk(ctx,m,'hunt')*0.5+rng()*2;
I.weapons.push({n:w.n,q:q,by:m.i});
made.push(ctx.t(w.t,m)+(q<3?'…ちょっと頼りない。':q>6?'出来は上々だった。':''));
});
ctx.act2({actors:makers,cat:'help',fx:function(){makers.forEach(function(m){ctx.others(m).forEach(function(o){ctx.mod(o,m,{trust:4});});});},text:'討伐の準備。'+made.join(''),why:'拠点づくり・狩猟の腕で武器の出来が決まる'});
H.stage='hunt';
return;
}
if(H.stage==='hunt'){
var party=P.slice().sort(function(x,y){return(y.tr.aggr+sk(ctx,y,'hunt')*0.2+y.hp/200)-(x.tr.aggr+sk(ctx,x,'hunt')*0.2+x.hp/200);}).slice(0,Math.min(3,P.length));
var guard=ctx.most(P.filter(function(c){return party.indexOf(c)<0;}),function(c){return c.tr.np+party.reduce(function(s,p){return s+R(ctx,c,p).aff;},0)/150;});
if(guard&&guard.tr.np>0.6&&rng()<0.5)party.push(guard);
var wq=I.weapons.reduce(function(s,w){return s+w.q;},0);
var power=party.reduce(function(s,c){return s+sk(ctx,c,'hunt')*0.04+c.tr.aggr*0.08+c.tr.a*0.03;},0)+wq*0.012+rng()*0.5;
var need=B.pow+0.32+rng()*0.5;
var offw=I.weapons.filter(function(w){return!/盾|松明|落とし穴/.test(w.n);});
var wpn=offw.length?pk(ctx,offw).n:I.weapons.length?pk(ctx,I.weapons).n:'素手';
var hero=ctx.most(party,function(c){return c.tr.aggr+sk(ctx,c,'hunt')*0.2+rng()*0.5;});
var text,fx,cat='combat',why='討伐隊の狩猟・攻撃性＋武器（'+I.weapons.map(function(w){return w.n;}).join('・')+'）';
var intro=names(party)+'は'+wpn+'を手に、'+B.name+'の巣へ向かった。';
if(power>need+0.25){
fx=function(){party.forEach(function(c){ctx.others(c).forEach(function(o){ctx.mod(o,c,{trust:8,aff:4});});party.forEach(function(d){if(c!==d)ctx.mod(c,d,{trust:10,aff:6});});});P.forEach(function(c){ctx.stress(c,-15);});if(B.meat)ctx.food+=B.meat;};
text=intro+pk(ctx,[hero.name+'の'+wpn+'が、'+B.name+'の頭を正確に捉えた。'+hero.name+'「…やった、やった！｜…やった、やったぞ！｜…やった、やりました！」','三方向から追い詰め、最後は'+hero.name+'がとどめを刺した。帰り道、全員が少しだけ笑っていた。',hero.name+'「今だ！｜＝｜今です！」の合図で一斉にかかった。'+B.name+'は動かなくなった。'])+(B.meat?'その夜は'+B.name+'の肉で宴になった。':'拠点に、ようやく安心が戻った。');
H.stage='done';I.slain=(I.slain||[]).concat([{b:B.name,hero:hero.i}]);
}else if(power>need-0.15){
var hurt=pk(ctx,party);
fx=function(){hurt.hp-=B.dmg*0.7;if(B.venom)hurt.flags.venom=2;party.forEach(function(c){ctx.stress(c,6);});if(B.meat)ctx.food+=B.meat*0.6;};
text=intro+B.name+'は仕留めた。だが'+hurt.name+'が深手を負った。'+hurt.name+'「…平気。平気だから、そんな顔しないで｜…平気だ。平気だから、そんな顔をするな｜…平気です。平気ですから、そんな顔をしないでください」';
H.stage='done';I.slain=(I.slain||[]).concat([{b:B.name,hero:hero.i}]);
}else{
var down=pk(ctx,party);
fx=function(){down.hp-=B.dmg*1.3;if(B.venom)down.flags.venom=3;P.forEach(function(c){ctx.stress(c,12);});};
text=intro+pk(ctx,[B.name+'は想像以上に素早かった。'+down.name+'がやられ、全員で引きずるようにして逃げ帰った。',wpn+'は'+B.name+'に弾かれた。'+down.name+'「逃げろ！｜＝｜逃げてください！」――撤退するしかなかった。']);
H.stage='avoid';why+='（力が及ばなかった）';
cat='conflict';
}
ctx.act2({actors:party,cat:cat,fx:fx,text:text,why:why,mag:20});
party.forEach(function(c){if(c.hp<=0&&c.alive)ctx.kill(c,null,B.name+'の討伐で命を落とした');});
ctx.flush();
if(H.stage==='avoid')H.retry=(H.retry||0)+1;
if(H.stage==='avoid'&&H.retry<2&&rng()<0.5)H.stage='arm';
return;
}
if(H.stage==='done'&&rng()<0.5)I.hz=null;
}
var after0=isl.after;
isl.after=function(ctx,s,n){
after0(ctx,s,n);
venomTick(ctx);
hazardTurn(ctx);
};
HK.IslandHazard={BEASTS:BEASTS,WEAPONS:WEAPONS};
})();
});
;
/* ==== js/mini-island.js ==== */
HK.Load.def(141,'js/mini-island.js',function(){
(function(){
'use strict';
var E=window.HK.E;
window.HK.addMini('island',[
E('i_fish','help','s+','#know*.12+a*.3+np*.2','','food:8;gab:trust2','{a}は尖らせた木の枝で、岩場の魚を三匹突いた。|{a}は潮だまりで、手づかみで小魚を捕まえた。|{a}はシャツを網代わりにして、小エビをすくった。|{a}は流木で罠を作り、翌朝カニを二匹捕まえた。|{a}は蔓で釣り糸を編み、貝殻の針で魚を釣り上げた。|{a}は夜の浜で、松明に寄ってきた魚を捕まえた。'),
E('i_fish_fail','solo','s+','fc*.3+impulse*.3-#know*.05','','as:6;ahp:-3','{a}は一日中釣り糸を垂れて、一匹も釣れなかった。|{a}は魚を追いかけて、岩で足を切った。|{a}は捕まえた魚を、手を滑らせて逃がした。|{a}は罠を仕掛けた場所を忘れた。|{a}は海に入りすぎて、波にさらわれかけた。|{a}は捕まえたカニに、指を挟まれた。'),
E('i_fruit','help','s+','fc*.3+#know*.08+.2','','food:6;gab:aff2','{a}は森の奥で、熟れたバナナの房を見つけた。|{a}はヤシの木に登って、実を二つ落とした。|{a}は見たことのない赤い実を見つけ、一つ齧って安全を確かめてから持ち帰った。|{a}は崖の上に、野生のパパイヤを見つけた。|{a}は鳥がついばんでいる実なら食べられると判断した。|{a}は木の根元に生えた芋を、手で掘り出した。'),
E('i_coconut','bond','p+','fc*.4+a*.2','','ab:aff3;ba:aff3','{a}と{b}は、ヤシの実を割るのに一時間格闘した。|{a}は{b}と、ココナッツの汁を回し飲みした。|{a}は{b}に、ヤシの実の割り方を教えた。|{a}と{b}は、石でヤシの実を叩き続けて、ついに割れた瞬間に歓声を上げた。|{a}は{b}が割ったヤシの実を「最高｜最高だ｜最高です」と褒めた。|{a}と{b}は、ヤシの実の殻を器にした。'),
E('i_share_food','help','p+','np*.6','food<20','ba:aff5,trust5;ahp:-3;bhp:3','{a}は自分の分の魚を半分、{b}の皿に移した。|{a}は{b}に「お腹空いてないから｜腹は減っていないから｜お腹は空いていませんから」と嘘をついて、食べ物を譲った。|{a}は一番大きな貝を、{b}に渡した。|{a}は{b}が食べ終わるまで、自分は手をつけなかった。|{a}は{b}のために、焼き魚の骨を取ってやった。|{a}は{b}に、最後のバナナを譲った。'),
E('i_hoard','betray','s','cold*.5+caution*.3-np*.3','food<25','food:-4;ahp:4','{a}は干し魚を一切れ、こっそり寝床の下に隠した。|{a}は見つけた果実のうち、二つを誰にも言わずに食べた。|{a}は自分だけの秘密の食料庫を、岩陰に作った。|{a}は配給の列に、二回並んだ。|{a}は見つけた湧き水の場所を、誰にも教えなかった。|{a}は夜中に起き出して、一人で食料を口にした。'),
E('i_cook','bond','g','np*.4+fc*.3','food>10','gab:aff3;food:-2','{a}は海水を煮詰めて塩を作り、焼き魚に振った。皆が感動した。|{a}は葉っぱで魚を包んで蒸し焼きにした。|{a}は木の実を潰して、ペースト状の料理を作った。|{a}は貝のスープを作って、皆に配った。|{a}は焼いた芋に、ヤシの汁をかけた。|{a}は食材を並べて「今日のコース料理｜本日のコース料理だ｜本日のコース料理です」と言って笑わせた。'),
E('i_hunger','solo','s+','stress/100+.2','food<10','as:5;ahp:-2','{a}は空腹で、何度も目が覚めた。|{a}は草を噛んで、空腹をごまかした。|{a}は食べ物の夢を見て、泣きながら起きた。|{a}は空腹でめまいがして、砂浜に座り込んだ。|{a}は木の皮を剥いで、食べられないか試した。|{a}は「何か食べたい｜＝｜何か食べたいです」と、一日中呟いていた。'),
E('i_rain','help','g','a*.4+#know*.08','','gab:trust3','{a}は大きな葉を何枚も並べて、雨水を溜める仕組みを作った。|{a}はヤシの殻を並べて、雨水を集めた。|{a}は布を木に張って、朝露を集めた。|{a}は海水を蒸留する装置を、石と葉で作ろうとした。|{a}は竹の節を切って、水筒を作った。|{a}は雨が降り出すと、真っ先に器を外に並べた。'),
E('i_thirst','solo','s+','stress/100+.15','','as:4','{a}は唇がひび割れて、話すたびに血が滲んだ。|{a}は海水を飲みかけて、慌てて吐き出した。|{a}は葉の裏の露を、舌で舐めた。|{a}は一口の水を、何分もかけて飲んだ。|{a}は喉の渇きで、夜中に何度も目が覚めた。|{a}は誰かが水を飲むのを、じっと見ていた。'),
E('i_shelter','help','p+','a*.4+np*.2+#know*.06','','ab:trust4;ba:trust4','{a}と{b}は、ヤシの葉を重ねて屋根を作った。|{a}は{b}と、流木で寝床の骨組みを組んだ。|{a}と{b}は、洞窟の入り口に石を積んで風除けを作った。|{a}は{b}に、葉っぱの編み方を教えた。|{a}と{b}は、拠点の周りに溝を掘って雨水の流れを変えた。|{a}は{b}と、寝床を少しでも高くするための台を作った。'),
E('i_fire','help','s+','#know*.1+a*.3+cp*.2','','gab:trust3;as:-3','{a}は木の枝をこすり合わせて、三時間かけて火を起こした。|{a}は眼鏡のレンズで、日光を集めて火をつけた。|{a}は湿った薪を乾かす方法を、皆に教えた。|{a}は夜通し、焚き火の番をした。|{a}は火種を絶やさないために、交代制を提案した。|{a}は火打ち石になりそうな石を、浜で見つけた。'),
E('i_fire_fail','conflict','p+','impulse*.4+fc*.2','','ba:ten5;as:4','{a}が薪を乱暴に足して、せっかくの火が消えた。|{a}は火の番をしながら眠ってしまった。{b}がそれに気づいた。|{a}は火に濡れた葉をくべて、煙で皆をむせさせた。|{a}が焚き火の近くで転んで、薪をぶちまけた。|{a}は火を大きくしすぎて、屋根の葉を焦がした。|{a}は火を消し忘れて、夜中に小さなボヤを起こした。'),
E('i_tool','help','s+','a*.4+#know*.1','','gab:trust2','{a}は貝殻を研いで、ナイフ代わりにした。|{a}は蔓を編んで、丈夫なロープを作った。|{a}は石を割って、斧のようなものを作った。|{a}は流れ着いたペットボトルで、浮きを作った。|{a}は動物の骨で、針を作った。|{a}は竹で、魚を獲る罠を作った。'),
E('i_signal','escape','g','a*.4+lead*.3','','gab:trust2','{a}は砂浜に、石で大きく「SOS」と並べた。|{a}は救助の目印になるように、一番高い木の上に白い布を結びつけた。|{a}は狼煙用に、湿った葉を集めておいた。|{a}は鏡の破片で、空に向かって光を反射させ続けた。|{a}は夜の浜に、三つの焚き火を三角形に並べた。|{a}は空き瓶に手紙を詰めて、海に流した。'),
E('i_map','escape','s+','a*.5+fc*.2','','as:-2','{a}は島を一周して、地面に地図を描いた。|{a}は島の高台から、周囲に他の島が見えないか探した。|{a}は太陽の位置から、方角を割り出した。|{a}は潮の満ち引きの時間を、毎日記録した。|{a}は星の位置から、ここがどの辺りかを推測しようとした。|{a}は島の植物の種類から、緯度を推測した。'),
E('i_explore','solo','s+','fc*.5+impulse*.2','','as:-3','{a}は一人で島の反対側まで歩いた。そこには誰かの古い足跡があった。|{a}は森の奥で、崩れかけた小屋を見つけた。|{a}は崖の下に、小さな入り江を見つけた。|{a}は島の中央の池で、水浴びをした。|{a}は高台に登って、島全体を見渡した。|{a}は洞窟の奥に、古い落書きを見つけた。'),
E('i_find_wreck','bond','p+','fc*.4+a*.3','','ab:trust4;ba:trust4;sec','{a}と{b}は、岩礁に乗り上げた古い船の残骸を見つけた。|{a}と{b}は、砂に埋もれた錆びた缶を掘り出した。|{a}と{b}は、浜に流れ着いたスーツケースを開けた。|{a}は{b}と、誰かが残した日記の切れ端を見つけた。|{a}と{b}は、古い焚き火の跡を見つけた。自分たちより前に、誰かがいた。|{a}と{b}は、浜に打ち上げられた救命ボートの残骸を見つけた。'),
E('i_lost','help','p+','np*.4+lead*.3','','ba:trust8,aff5','{a}は森で迷った{b}を、日が暮れる前に見つけ出した。|{a}は{b}の名前を叫びながら、森を探し回った。|{a}は迷子になった{b}を、焚き火の煙で導いた。|{a}は{b}の足跡を辿って、崖の下で動けなくなっている{b}を見つけた。|{a}は{b}を背負って、拠点まで戻った。|{a}は{b}を見つけた瞬間、怒鳴りかけて、抱きしめた。'),
E('i_cliff','solo','s+','impulse*.5+fc*.2','','ahp:-8;as:5','{a}は崖を登ろうとして、足を滑らせた。|{a}は鳥の巣から卵を取ろうとして、木から落ちた。|{a}は深い場所で泳いで、足をつった。|{a}は鋭い岩に、手のひらを切った。|{a}は毒のある植物に触れて、腕が腫れた。|{a}は日差しを浴びすぎて、熱を出した。'),
E('i_crab','bond','g','fc*.5','','gab:aff2','{a}は捕まえたヤシガニに名前をつけて、ペットにしようとした。|{a}は浜で亀の産卵を見つけて、皆を呼んだ。|{a}は島の鳥に、毎朝パンくずのような何かを与えていた。|{a}は夜の浜で光る夜光虫を、皆に見せた。|{a}はイルカの群れを見つけて、浜を走り回った。|{a}は小さなトカゲを肩に乗せていた。'),
E('i_snake','help','p+','aggr*.4+np*.3','','ba:trust6,aff4','{a}は{b}の足元の蛇を、棒で払いのけた。|{a}は{b}の寝床に入り込んだサソリを、素早く追い払った。|{a}は{b}に飛びかかろうとした野犬を、石を投げて追い払った。|{a}は{b}の腕に止まった大きな虫を、手で払った。|{a}は{b}が刺された傷口から、毒を吸い出した。|{a}は{b}を背に庇いながら、猪と睨み合った。'),
E('i_bug','solo','s+','ac*.4+caution*.3','','as:5','{a}は夜中、顔の上を何かが這っていく感触で目を覚ました。|{a}は蚊に刺されて、一晩中掻きむしっていた。|{a}は寝床に大きな蜘蛛がいるのを見て、悲鳴を上げた。|{a}は虫が怖くて、森に入れなかった。|{a}は蟻の行列が、食料に向かっているのを見つけた。|{a}は耳に入った虫を、なかなか出せなかった。'),
E('i_sunset','romance','p+','att/50+warmth*.2','att>10','ab:att5;ba:att5','{a}と{b}は、砂浜に並んで夕日が沈むのを見ていた。|{a}は{b}と、星が流れるたびに数を数えた。|{a}と{b}は、満月の夜の浜辺を歩いた。|{a}は{b}に、星座の名前を教えた。半分はでたらめだった。|{a}と{b}は、波打ち際で裸足になった。|{a}は{b}と、朝焼けを見るために早起きした。'),
E('i_heat','solo','s+','ac*.3+.2','','as:4;ahp:-2','{a}は昼の暑さで、何もできずに木陰で横たわっていた。|{a}は日焼けで、肩の皮が剥けた。|{a}は汗が止まらず、塩の跡が服に浮かんでいた。|{a}は砂浜の熱さに、裸足で飛び跳ねた。|{a}は暑さで食欲をなくした。|{a}は暑さでぼんやりして、同じことを二回言った。'),
E('i_swim','bond','p+','fc*.5','','ab:aff4;ba:aff4','{a}と{b}は、浅瀬で水をかけ合った。|{a}は{b}と、どちらが遠くまで泳げるか競争した。|{a}と{b}は、潮だまりで小さな魚を追いかけた。|{a}は{b}を背中に乗せて、浅瀬を泳いだ。|{a}と{b}は、波に乗って浜まで流された。|{a}は{b}に、仰向けに浮かぶ方法を教えた。'),
E('i_bath','romance','p','att/50+impulse*.2','att>20','ab:att6;ba:att4','{a}は池で水浴びをしている{b}を見かけて、慌てて背を向けた。|{a}は{b}の背中を、池の水で流してやった。|{a}は{b}が水浴びをしている間、見張り役を買って出た。|{a}は濡れた{b}の髪を、葉っぱで拭いてやった。|{a}は日焼けした{b}の肩に、アロエを塗った。|{a}は{b}の濡れたシャツが、肌に張りついているのを見てしまった。'),
E('i_rainy','bond','p+','warmth*.3+trust/80','','ab:trust4;ba:trust4','{a}と{b}は、雨宿りの洞窟で身を寄せ合った。|{a}と{b}は、雨音を聞きながら他愛ない話をした。|{a}は{b}と、雨漏りする屋根の下で一枚の布を分け合った。|{a}は{b}に、雨の日の思い出を話した。|{a}と{b}は、雨の中を笑いながら走った。|{a}は濡れた{b}に、乾いた葉を被せた。'),
E('i_lead','conflict','g','lead*.6','n>2','gab:trust2,ten1','{a}は全員の作業分担を決めた。文句を言う者はいなかった。|{a}は「今日から朝は六時起き｜今日から朝は六時起きだ｜今日から朝は六時起きです」と宣言した。|{a}は食料の管理を一手に引き受けた。|{a}は島のルールを、砂浜に書き出した。|{a}は勝手に森へ入るなと、全員に釘を刺した。|{a}は毎晩、焚き火の前で翌日の計画を発表した。'),
E('i_lazy','conflict','s','fc*.4+cold*.3-ac*.3','','gab:ten2,aff-2;as:-3','{a}は一日中、木陰で寝ていた。|{a}は作業を手伝わずに、海で泳いでいた。|{a}は自分の当番を忘れて、どこかへ行っていた。|{a}は「どうせ助けが来る｜＝｜どうせ助けが来ます」と言って、何もしなかった。|{a}は誰かが集めた薪を、勝手に使った。|{a}は食事のときだけ、真っ先に現れた。'),
E('i_complain','conflict','p+','cp*.4+stress/100','stress>35','ab:ten5;ba:ten5','{a}は{b}の仕事ぶりに、いちいち文句をつけた。|{a}は{b}に「あなたのやり方じゃ冬を越せない｜あなたのやり方では冬を越せない｜あなたのやり方では冬を越せません」と言った。|{a}は{b}の作った屋根を「すぐ崩れる｜＝｜すぐ崩れます」と言った。|{a}は{b}の焼いた魚を「生焼け｜生焼けだ｜生焼けです」と言って突き返した。|{a}は{b}が集めた木の実を「毒かもしれない｜＝｜毒かもしれません」と捨てた。|{a}は{b}の楽観的な言葉に「現実を見ろ｜＝｜現実を見てください」と言った。'),
E('i_thank','bond','p+','np*.4+ac*.3','','ba:aff4;ab:aff2','{a}は{b}に、魚を獲ってくれた礼を言った。|{a}は{b}の作った寝床で、久しぶりにぐっすり眠れたと言った。|{a}は{b}に「あなたがいてよかった｜＝｜あなたがいてよかったです」と言った。|{a}は{b}の手の傷を見て、何も言わずに薬草を貼った。|{a}は{b}に、貝殻のネックレスを作って渡した。|{a}は{b}の働きぶりを、皆の前で褒めた。'),
E('i_night_talk','romance','p+','att/50+honesty*.3','att>10','ab:att5,trust4;ba:att5,trust4','{a}は火の番をしながら、{b}に「帰ったら何したい？｜帰ったら何をしたい？｜帰ったら何をしたいですか？」と訊いた。|{a}と{b}は、焚き火の前で互いの家族の話をした。|{a}は{b}に、島に来てよかったと思う瞬間があると言った。|{a}と{b}は、夜通し星を見ながら話していた。|{a}は{b}に「ここを出ても、会える？｜ここを出ても、会えるか？｜ここを出ても、会えますか？」と訊いた。|{a}は{b}に、この島で一番好きな場所を教えた。'),
E('i_cuddle','romance','p','att/40+stress/150','att>25&ratt>15','ab:att6,trust5;ba:att6,trust5','寒い夜、{a}と{b}は一つの寝床で身を寄せ合って眠った。|{a}は{b}の手を握ったまま、眠りに落ちた。|{a}は眠る{b}の髪を、指で梳いていた。|{a}は{b}の背中に腕を回して、寒さから守った。|{a}は{b}の肩に頭を乗せて、波の音を聞いていた。|{a}は{b}の寝顔に、そっと葉っぱを被せて日を遮った。'),
E('i_secret_spot','romance','p+','att/50+fc*.2','att>20','ab:att5,trust5;ba:att5,trust5;sec','{a}は{b}だけに、島の裏の小さな滝を教えた。|{a}は{b}を、誰も知らない洞窟の奥に連れて行った。|{a}と{b}は、二人だけの秘密の浜辺を見つけた。|{a}は{b}に、自分しか知らない果実の木を教えた。|{a}は{b}を、夜光虫が光る入り江に案内した。|{a}は{b}と、二人だけが知る合図を決めた。'),
E('i_steal_catch','conflict','p','a*.4+cp*.4','B.cold>.5','ab:ten8,trust-8;ba:ten6','{a}は、{b}が夜中に食料庫に忍び込むのを見てしまった。|{a}は{b}の寝床から、甘い果実の匂いがすることに気づいた。|{a}は{b}が配給量をごまかしているのに気づいた。|{a}は{b}の口元に、隠れて食べた魚の脂が光っているのを見た。|{a}は{b}が水を多めに取っているのを見て、何も言わずに睨んだ。|{a}は{b}の隠し場所を突き止めた。'),
E('i_gossip','conflict','p','jealous*.5+fc*.2','ten>20','ab:ten4;sec','{a}は{c}に、{b}がサボっているという話をした。|{a}は{b}が夜中に何をしているか、{c}と噂し合った。|{a}は{b}が食料をくすねているのではないかと、{c}に耳打ちした。|{a}は{b}の態度について、{c}に愚痴をこぼした。|{a}は{b}が一人で何かを企んでいると、{c}に話した。|{a}は{c}に「{b}は信用できない｜＝｜{b}は信用できません」と言った。'),
E('i_fight','conflict','p+','aggr*.6+stress/100','ten>35','ab:ten8,aff-4;ba:ten8,aff-4','{a}と{b}は、薪の割り当てをめぐって怒鳴り合った。|{a}は{b}を突き飛ばした。{b}は砂浜に尻もちをついた。|{a}と{b}は、どちらが火の番をサボったかで揉めた。|{a}は{b}の作った罠を、わざと壊した。|{a}と{b}は、取っ組み合いの喧嘩をして、二人とも擦り傷を作った。|{a}は{b}に「出て行け｜＝｜出て行ってください」と言った。島に出て行く場所はなかった。'),
E('i_reconcile','help','p+','np*.4+ac*.3','ten>25','ab:ten-10,trust5;ba:ten-10,trust5','{a}は{b}に、獲れたばかりの魚を差し出した。仲直りの印だった。|{a}は{b}の隣に座って、黙って一緒に海を見た。|{a}は{b}に「ここで喧嘩してても仕方ない｜ここで喧嘩をしていても仕方がない｜ここで喧嘩していても仕方ありません」と言った。|{a}は{b}の壊れた罠を、夜のうちに直しておいた。|{a}は{b}に、昨日のことを謝った。|{a}と{b}は、焚き火を挟んで、気まずそうに笑い合った。'),
E('i_teach','help','p+','np*.3+#know*.1','B.#know<3','ba:trust5,aff3','{a}は{b}に、食べられる草と食べられない草の見分け方を教えた。|{a}は{b}に、ロープの結び方を教えた。|{a}は{b}に、火の起こし方を根気よく教えた。|{a}は{b}に、魚のさばき方を教えた。|{a}は{b}に、潮の読み方を教えた。|{a}は{b}に、太陽で時間を知る方法を教えた。'),
E('i_vote','conflict','g','lead*.4+cp*.3','n>3','gab:ten2','{a}は「誰がリーダーか、ちゃんと決めよう｜誰がリーダーか、きちんと決めよう｜誰がリーダーか、ちゃんと決めましょう」と言い出した。|{a}は島のルールを多数決で決めようと提案した。|{a}は食料の分け方に、不満を持つ者の意見を集めた。|{a}は「働かない者には分けない｜＝｜働かない人には分けません」と言った。|{a}は拠点を移すべきだと主張して、議論を巻き起こした。|{a}は夜の見張りの順番を、くじで決めようと言った。'),
E('i_homesick','solo','s+','ac*.3+np*.3','','as:6','{a}は家族の写真を、何度も見返していた。|{a}は海の向こうを見つめて、帰りたいと呟いた。|{a}は母親の料理の味を思い出して、泣いた。|{a}は誰かの誕生日を、島で過ごしてしまったことに気づいた。|{a}は帰ったら謝りたい人のことを考えていた。|{a}は夢の中で、自分の部屋のベッドに寝ていた。'),
E('i_diary','solo','s+','a*.3+ac*.3','','as:-4','{a}は木の皮に、毎日の出来事を刻んでいた。|{a}は砂浜に、今日の日付を書いた。|{a}は誰にも見せない日記を、貝殻の裏に書いていた。|{a}は島での日々を、いつか本にしようと思っていた。|{a}は今日あったことを、声に出して記録していた。|{a}は日記に、誰かの名前を何度も書いていた。'),
E('i_breakdown','solo','s','stress/70+ac*.2','stress>60','as:-5;gab:ten2','{a}は突然、海に向かって走り出した。誰かが止めなければ、どこまでも泳いでいきそうだった。|{a}は夜中に叫び声を上げて、皆を起こした。|{a}は食べ物を見ても、何も口にしなくなった。|{a}は「もう助けなんか来ない｜もう助けなど来ない｜もう助けなんか来ません」と繰り返した。|{a}は誰とも目を合わせなくなった。|{a}は笑いが止まらなくなった。'),
E('i_hope','help','g','np*.4+fc*.4','','gab:aff2;as:-3','{a}は「明日はきっと船が来る｜＝｜明日はきっと船が来ます」と毎晩言い続けた。|{a}は皆を集めて、帰ったら何をするか一人ずつ言わせた。|{a}は島での生活を、キャンプだと思えばいいと言った。|{a}は誰かの誕生日を、木の実のケーキで祝った。|{a}は空から見えるように、浜に皆の名前を大きく書いた。|{a}は「生きて帰る｜＝｜生きて帰ります」と、皆で拳を合わせた。'),
E('i_care_injury','help','p+','np*.6','B.hp<70','ba:aff6,trust6;bhp:6','{a}は{b}の足の傷を、真水で丁寧に洗った。|{a}は{b}の腫れた手首に、濡れた布を巻いた。|{a}は{b}のために、薬草をすり潰した。|{a}は熱のある{b}の額に、冷たい石を当てた。|{a}は{b}が歩けない間、代わりに食料を運んだ。|{a}は{b}の背中のとげを、一本ずつ抜いた。'),
E('i_weak','solo','s+','1.1-hp/100','hp<60','as:4','{a}は体力が落ちて、立ち上がるたびにふらついた。|{a}は傷が化膿して、熱っぽかった。|{a}は痩せた自分の腕を見て、驚いた。|{a}は少し歩いただけで、息が切れた。|{a}は食べてもすぐに吐いてしまった。|{a}はもう泳げないと思った。'),
E('i_play','bond','g','fc*.6','','gab:aff3;as:-4','{a}は浜辺に線を引いて、ビーチバレーを始めた。|{a}は砂でお城を作り始めた。そのうち全員が手伝っていた。|{a}は貝殻で作った駒で、即席のチェスを始めた。|{a}は流木で作ったバットで、ココナッツ野球を始めた。|{a}は砂浜に巨大な絵を描いた。|{a}は鬼ごっこを始めて、大人げなく本気で走った。'),
E('i_carve','bond','p+','fc*.3+np*.3','','ba:aff5;ab:aff3','{a}は流木で、{b}の顔を彫った。全然似ていなかった。|{a}は貝殻で、{b}の名前を浜に並べた。|{a}は{b}に、木の実で作ったブレスレットを渡した。|{a}は{b}の誕生日に、花の冠を作った。|{a}は{b}に、きれいな石を拾って渡した。|{a}は{b}のために、ヤシの葉で帽子を編んだ。'),
E('i_raft_idea','escape','p+','a*.4+fc*.3','','ab:trust4;ba:trust4','{a}は{b}と、イカダの設計図を砂に描いた。|{a}は{b}に、潮の流れに乗れば隣の島に着けるかもしれないと話した。|{a}と{b}は、イカダに使えそうな丸太を探した。|{a}は{b}と、帆に使える布がないか話し合った。|{a}は{b}に、イカダで出るなら二人で行こうと言った。|{a}と{b}は、浮力の計算をした。'),
E('i_stay_wish','romance','p','att/50+fc*.2','att>30','ab:att5','{a}は、このまま{b}と島で暮らすのも悪くないと思ってしまった。|{a}は救助が来なければいいと、一瞬だけ思った。|{a}は{b}と二人でいる時間が、島に来る前より長いことに気づいた。|{a}は{b}が笑うのを見て、帰りたいと思わなくなっている自分に気づいた。|{a}は{b}と並んで眠る夜が、終わってほしくなかった。|{a}は「帰ったら、もう会わないのかな｜帰ったら、もう会わないのだろうか｜帰ったら、もう会わないんでしょうか」と思った。'),
E('i_watch','bond','p+','caution*.4+np*.2','','ab:trust5;ba:trust5','{a}と{b}は、夜の見張りを交代でした。|{a}は{b}の見張りの番に、こっそり付き合った。|{a}と{b}は、夜の浜で物音に身構えた。風の音だった。|{a}は{b}に「寝てていい｜寝ていていい｜寝ていていいですよ」と言って、見張りを代わった。|{a}と{b}は、見張りの間ずっと小声で話していた。|{a}は{b}の見張り中に、温かい飲み物を持って行った。'),
E('i_dream','bond','p+','honesty*.3+warmth*.3','','ab:aff3;ba:aff3','{a}は{b}に、昨夜見た夢の話をした。夢の中で二人は、普通に街を歩いていた。|{a}と{b}は、島を出たら行きたいレストランのリストを作った。|{a}は{b}に、子どもの頃に描いた将来の夢の話をした。|{a}と{b}は、無人島に一つだけ持ってくるなら何か、という話で笑った。|{a}は{b}に、帰ったら飼いたい犬の名前を考えさせた。|{a}と{b}は、島に名前をつけた。'),
E('i_jealous','conflict','p','jealous*.6+att/80','att>25','ab:ten4;as:6;jea','{a}は、{b}が別の誰かと笑いながら魚を焼いているのを遠くから見ていた。|{a}は{b}が別の誰かの寝床の隣に移ったことに気づいた。|{a}は{b}が別の誰かに貝殻を渡すのを見てしまった。|{a}は{b}と別の誰かが、二人で森に入っていくのを見た。|{a}は{b}が別の誰かの怪我を手当てしているのを見て、胸が痛んだ。|{a}は{b}の笑い声が、自分に向いていないことが悔しかった。'),
E('i_storm_prep','help','g','a*.4+caution*.4','','gab:trust3','{a}は雲の形を見て、嵐が来ると予言した。翌日、本当に来た。|{a}は嵐に備えて、食料を高い場所に移した。|{a}は拠点の屋根を、蔓で何重にも縛った。|{a}は嵐の前に、皆を洞窟に避難させた。|{a}は風向きが変わったことに、最初に気づいた。|{a}は嵐の夜に備えて、水を多めに溜めた。'),
E('i_odd','solo','s+','fc*.4+cold*.2','','as:-3','{a}は島の生活にすっかり適応して、腰に葉を巻いていた。|{a}はヤシの木に話しかけるようになった。|{a}は自分を島の王だと名乗り始めた。|{a}は貝殻で、自分専用の食器を揃えた。|{a}は朝日に向かって、謎の体操をするのが日課になった。|{a}は流木に顔を描いて、話し相手にしていた。')
]);
})();
});
;
/* ==== js/mini-extra-b.js ==== */
HK.Load.def(145,'js/mini-extra-b.js',function(){
(function(){
'use strict';
var E=window.HK.E;
window.HK.addMini('island',[
E('i_shell','solo','s+','fc*.3+ac*.2+.1','','as:-3','{a}は浜辺で、桜色の貝殻を集めていた。|{a}は打ち上げられた流木の形を、何かに見立てて遊んでいた。|{a}は波打ち際で、自分の足跡が消えていくのを見ていた。|{a}は砂浜に寝転んで、雲の形を数えた。|{a}は潮風に吹かれながら、何も考えない時間を過ごした。|{a}は浜で拾ったガラス玉を、光にかざしていた。'),
E('i_salt','help','s+','a*.4+#know*.08','','gab:trust2;food:2','{a}は海水を煮詰めて、ひとつまみの塩を作った。|{a}は魚を干して、保存食を作った。|{a}は燻製の作り方を思い出して、試してみた。|{a}は木の実を乾燥させて、非常食にした。|{a}は貝を塩漬けにして、壺代わりの殻にしまった。|{a}は食料の保存場所を、虫が来ない高い枝に移した。'),
E('i_birdegg','help','s+','fc*.4+#know*.06','','food:5;ahp:-2','{a}は崖の鳥の巣から、卵を三つ持ち帰った。|{a}は木に登って、鳥の卵を探した。|{a}は浜辺で、海鳥が残した卵を見つけた。|{a}は親鳥に襲われながら、卵を一つだけ取った。|{a}は卵を焚き火で焼いて、皆に配った。|{a}は卵を割ったら中身が雛になっていて、そっと戻した。'),
E('i_clean','help','g','cp*.3+np*.3','','gab:trust2','{a}は拠点の周りの掃除を始めた。|{a}は全員の寝床の葉を、新しいものに替えた。|{a}は食べ残しを遠くに捨てて、虫が寄らないようにした。|{a}はトイレの場所を決めて、皆に守らせた。|{a}は洗濯場を川の下流に決めた。|{a}は拠点の入り口に、靴を脱ぐ場所を作った。'),
E('i_laundry','bond','p+','np*.3+warmth*.3','','ab:aff3;ba:aff3','{a}は{b}の服を、自分の服と一緒に川で洗った。|{a}は{b}と並んで、川で服を叩き洗いした。|{a}は{b}の破れたシャツを、植物の繊維で繕った。|{a}は{b}に、乾いた自分の上着を貸した。|{a}と{b}は、洗った服を木の枝に干しながら話した。|{a}は{b}の靴の泥を、落としてやった。'),
E('i_hut_build','bond','p+','a*.3+np*.3','step>=2','ab:trust5,aff3;ba:trust5,aff3','{a}と{b}は、二人用の小屋を建て始めた。|{a}は{b}と、小屋の窓をどこにするかで盛り上がった。|{a}と{b}は、小屋の床に乾いた草を敷き詰めた。|{a}は{b}と、小屋の入り口に貝殻の暖簾を下げた。|{a}と{b}は、完成した小屋の前で記念写真を撮るふりをした。|{a}は{b}と、小屋に名前をつけた。'),
E('i_star_nav','escape','p+','a*.5+#know*.06','','ab:trust4;ba:trust4','{a}は{b}に、北極星の見つけ方を教えた。|{a}は{b}と、星の動きから季節を推測した。|{a}は{b}と、夜空を見ながら方角を確かめた。|{a}は{b}と、潮の流れの向きを観察した。|{a}は{b}に、雲の流れで天気を読む方法を教えた。|{a}は{b}と、島からの脱出ルートを星で決めようとした。'),
E('i_coconut_fall','solo','s','impulse*.4+.1','','ahp:-6;gab:aff1','{a}の頭のすぐ横に、ヤシの実が落ちてきた。|{a}は熟れすぎた果実で、腹を壊した。|{a}は岩場の苔で、盛大に滑った。|{a}は蜂の巣を突いて、刺されまくった。|{a}は鳥にフンを落とされて、皆に笑われた。|{a}はクラゲに刺されて、腕が赤く腫れた。'),
E('i_teamwork','bond','g','lead*.3+warmth*.3','n>2','gab:trust3,aff2','{a}の号令で、全員で大きな丸太を運んだ。|{a}は皆で手をつないで、浅瀬の魚を追い込む漁を提案した。|{a}は全員で拠点の屋根を一気に張り替える段取りを組んだ。|{a}の提案で、夜は全員で輪になって眠ることにした。|{a}は皆で歌いながら、薪を割った。|{a}は皆を集めて、島に来てからの日数を数え直した。'),
E('i_old_letter','solo','s+','a*.3+np*.3','','as:4','{a}は岩の隙間に挟まった、古い手紙を見つけた。|{a}は洞窟の壁に、誰かが刻んだ日付の跡を見つけた。|{a}は浜に埋もれた、錆びたナイフを掘り出した。|{a}は前の漂流者が残した、小さな墓標を見つけた。|{a}は誰かの名前が刻まれた木の札を、見なかったことにした。|{a}は島に以前いた誰かの、生活の跡を見つけた。'),
E('i_spear_teach','bond','p+','cp*.3+#know*.08','','ab:trust4;ba:trust4','{a}は{b}に、銛の構え方を教えた。|{a}は{b}と、どちらが先に魚を突けるか勝負した。|{a}は{b}の銛の先を、もっと鋭く削ってやった。|{a}は{b}に、魚が岩陰に隠れる習性を教えた。|{a}は{b}と、浅瀬で魚を挟み撃ちにした。|{a}は{b}に、獲れた魚の一番いいところを譲った。'),
E('i_ownership','conflict','p+','cp*.4+jealous*.3','','ab:ten5;ba:ten5','{a}は「ここは私の場所｜ここは私の場所だ｜ここは私の場所です」と、{b}に寝床の位置を譲らなかった。|{a}は{b}が自分の作った道具を勝手に使ったことに怒った。|{a}は{b}に、見つけた果樹は自分のものだと主張した。|{a}は{b}が自分の釣り場に来たことに、文句を言った。|{a}は{b}に「勝手に触らないで｜勝手に触るな｜勝手に触らないでください」と言った。|{a}は{b}が自分の分の水を飲んだと疑った。'),
E('i_illness_fear','solo','s+','caution*.4+stress/150','','as:5','{a}は咳をするたびに、病気ではないかと怯えた。|{a}は小さな傷が化膿しないか、毎日確かめていた。|{a}は誰かが熱を出すと、距離を置いた。|{a}は自分の体が弱っていくのを、恐ろしく感じていた。|{a}は水が原因で腹を壊したのではないかと疑った。|{a}は「病気になったら終わりだよ｜病気になったら終わりだ｜病気になったら終わりです」と呟いた。'),
E('i_flower','romance','p+','att/60+np*.2','att>15','ab:att4;ba:att5','{a}は{b}の髪に、島に咲いていた花を挿した。|{a}は{b}に、花の冠を編んで被せた。|{a}は{b}の寝床の横に、毎朝花を一輪置いていた。|{a}は{b}に、この島で一番きれいな花を見せに連れて行った。|{a}は{b}に、花の名前を勝手につけて教えた。|{a}は{b}の手首に、蔓の腕輪を巻いた。'),
E('i_kiss','romance','p','att/40+impulse*.2','att>35&ratt>30','ab:att7,aff5;ba:att7,aff5','夕日が沈む浜辺で、{a}は{b}に口づけた。|{a}は{b}の濡れた髪をかき上げて、唇を寄せた。|焚き火の明かりの中で、{a}と{b}の影が一つになった。|{a}は{b}に「帰ってもこうしていたい｜＝｜帰ってもこうしていたいです」と言って、額を寄せた。|{a}は{b}の頬に、潮の味がするキスをした。|{a}と{b}は、波の音に紛れて静かにキスをした。'),
E('i_bad_mood','conflict','p+','stress/80+cp*.2','stress>45','ab:ten5;ba:ten4','{a}は{b}の何気ない一言に、ひどく苛立った。|{a}は{b}が笑っているのが、なぜか許せなかった。|{a}は{b}に「のんきでいいね｜のんきでいいよな｜のんきでいいですね」と嫌味を言った。|{a}は{b}が作業を手伝ってくれても、礼を言わなかった。|{a}は{b}に、自分の不安をぶつけてしまった。|{a}は{b}の楽観に「現実が見えてない｜現実が見えていない｜現実が見えていません」と言った。'),
E('i_routine','solo','s+','cp*.3+a*.3','step>=2','as:-4','{a}は毎朝同じ時間に起きて、同じ順番で仕事をこなした。|{a}は島での生活を、一日のスケジュールに落とし込んだ。|{a}は規則正しく生活することで、正気を保っていた。|{a}は日の出とともに起き、日の入りとともに眠った。|{a}は毎日の作業を、誰よりも先に終わらせた。|{a}は自分のルールを、一日も破らなかった。'),
E('i_spirit_night','bond','g','fc*.4+np*.3','step>=2','gab:aff3;as:-4','{a}は焚き火を囲んで、怪談を始めた。皆、本気で怖がった。|{a}は即興で島の歌を作って、皆に教えた。|{a}は焚き火の周りで踊り出した。|{a}は皆の前で、一人芝居を披露した。|{a}は星空の下で、皆に昔話を聞かせた。|{a}は焚き火で焼いたマシュマロのようなものを、皆に配った。'),
E('i_carry','help','p+','np*.4+#hp*.08','B.hp<70','ba:aff5,trust5;ahp:-3','{a}は疲れ切った{b}の荷物を、代わりに担いだ。|{a}は{b}を背負って、拠点まで戻った。|{a}は{b}の分の水汲みを、黙って引き受けた。|{a}は{b}に肩を貸して、浜まで歩いた。|{a}は{b}の分の薪も集めてきた。|{a}は{b}に「休んでて｜休んでいろ｜休んでいてください」と言って、作業を代わった。'),
E('i_mutiny','conflict','g','aggr*.4+cp*.3-lead*.2','n>3','gab:ten3','{a}は「リーダーのやり方には従えない｜＝｜リーダーのやり方には従えません」と皆の前で言った。|{a}はリーダーの決めた配給量に、真っ向から反対した。|{a}は自分の仲間を集めて、別の場所に拠点を作ろうとした。|{a}は夜の見張りの当番を、勝手に変えた。|{a}は「誰が島のルールを決めたの｜誰が島のルールを決めたんだ｜誰が島のルールを決めたんですか」と言った。|{a}は食料庫の管理を、自分に任せろと迫った。'),
E('i_escape_dream','solo','s+','fc*.3+ac*.3','','as:-3','{a}は水平線の向こうに、故郷の街を思い描いた。|{a}は帰ったら真っ先に、熱いシャワーを浴びると決めていた。|{a}は帰ったら食べたいものを、指折り数えた。|{a}は島を出る夢を、毎晩のように見た。|{a}は帰ったら、会いたい人に会いに行こうと決めた。|{a}は帰れたら、この島での日々を誰かに話したいと思った。'),
E('i_feud','conflict','p+','aggr*.4+ten/60','ten>40','ab:ten6,trust-4;ba:ten6,trust-4','{a}は{b}の寝床に、わざと砂を撒いた。|{a}は{b}の釣った魚を、勝手に食べた。|{a}は{b}が話し始めると、わざと席を立った。|{a}は{b}の作業を、手伝うふりをして邪魔した。|{a}は{b}に、あてつけのように大声で独り言を言った。|{a}は{b}の道具を、海に投げ捨てた。'),
E('i_shared_secret','bond','p+','honesty*.3+trust/60','trust>25','ab:trust6;ba:trust6;sec','{a}は{b}に、救助が来ても帰りたくない理由を話した。|{a}は{b}に、島に来る前に何から逃げていたかを打ち明けた。|{a}は{b}にだけ、隠し持っている食料の場所を教えた。|{a}は{b}に、誰にも言えない後悔を話した。|{a}は{b}と、二人だけの秘密の合図を決めた。|{a}は{b}に、本当の名前を教えた。'),
E('i_thunder','help','p+','np*.4+cp*.2','','ba:trust5,aff4','雷が鳴った瞬間、{a}は{b}の手を掴んで洞窟に駆け込んだ。|{a}は雷に怯える{b}の耳を、手で塞いだ。|{a}は{b}に、雷が遠ざかるまで数を数えさせた。|{a}は雷の夜、{b}の隣で眠らずにいた。|{a}は{b}に「大丈夫、落ちないよ｜大丈夫だ、落ちない｜大丈夫です、落ちません」と言った。根拠はなかった。|{a}は雷の光に照らされた{b}の顔を、忘れられなかった。'),
E('i_footprint','solo','s','a*.3+caution*.3','step>=3','as:6;gab:ten1','{a}は浜辺に、誰のものでもない足跡を見つけた。|{a}は夜中、森の奥に明かりを見た気がした。|{a}は拠点の物の配置が、少し変わっていることに気づいた。|{a}は誰かに見られている気配を、ずっと感じていた。|{a}は島に、自分たち以外の誰かがいる気がした。|{a}は遠くで、誰かの話し声を聞いた気がした。'),
E('i_raft_test','escape','s+','impulse*.4+a*.2','step>=3','ahp:-4','{a}は試作のイカダに乗って、浅瀬で転覆した。|{a}は丸太一本で沖に出ようとして、慌てて戻ってきた。|{a}はイカダの浮力を確かめるために、何度も海に入った。|{a}は帆にした布が風を受けるのを見て、歓声を上げた。|{a}はイカダの縄が緩んでいることに気づいて、結び直した。|{a}はイカダを試すために、潮の満ちる時間を待った。'),
E('i_age_talk','bond','p+','warmth*.3+honesty*.3','','ab:aff3,trust3;ba:aff3,trust3','{a}は{b}に、自分の歳を初めて言った。|{a}は{b}と、子どもの頃に好きだったテレビ番組の話をした。|{a}は{b}に、自分の仕事のことを話した。|{a}は{b}と、互いの住んでいた街の話をした。|{a}は{b}に、昔の自分の写真を見せたいと言った。|{a}は{b}と、それぞれの「普通の一日」の話をした。'),
E('i_teasing','bond','p+','fc*.5','','ab:aff3;ba:aff3','{a}は{b}のぼさぼさの髪を見て、鳥の巣みたいだと笑った。|{a}は{b}の日焼けの跡を、からかった。|{a}は{b}の寝言を真似して、皆を笑わせた。|{a}は{b}が魚を逃がした話を、一日中ネタにした。|{a}は{b}に「島の生活、似合ってるよ｜島の生活が、似合っているな｜島の生活、似合っていますよ」と言った。|{a}は{b}のヒゲを見て「遭難者っぽい｜遭難者のようだな｜遭難者っぽいです」と言った。'),
E('i_gift_food','romance','p+','np*.3+att/60','att>20','ab:att4;ba:att5,aff3','{a}は{b}に、一番甘い果実を取っておいた。|{a}は{b}のために、殻を剥いた貝を並べた。|{a}は{b}に、焼きたての魚の一番いいところを差し出した。|{a}は{b}に、ヤシの汁を最初に飲ませた。|{a}は{b}の好きな木の実を覚えていて、毎日一つ持って来た。|{a}は{b}に、自分で作った小さな塩の結晶を渡した。'),
E('i_alone_time','solo','s+','cold*.4+ac*.2','','as:-5','{a}は誰にも告げずに、島の反対側で一人の時間を過ごした。|{a}は皆から離れた岩場で、海を眺めていた。|{a}は一人で歩くことで、頭を整理していた。|{a}は皆の声が聞こえない場所で、深呼吸をした。|{a}は一人になる時間がないと、息が詰まりそうだった。|{a}は一人で星を見て、少しだけ泣いた。'),
E('i_mediate','help','p+','np*.4+a*.3','n>2','ba:trust4;as:4','{a}は対立している二人の間に入って、話をまとめた。|{a}は{b}の不満を聞いて、それとなく他の人に伝えた。|{a}は{b}に、相手の気持ちを代弁してやった。|{a}は{b}と誰かの喧嘩を、冗談で収めた。|{a}は{b}に「あの人も悪気はないよ｜あいつも悪気はない｜あの人も悪気はないんです」と言った。|{a}は{b}の言い分を、最後まで聞いた。'),
E('i_scavenge_wreck','help','s+','fc*.3+a*.3','','food:4;gab:trust2','{a}は難破船の残骸から、使えそうな鍋を見つけてきた。|{a}は流れ着いたビニールシートで、雨よけを作った。|{a}は難破船から、錆びたナイフと缶詰を持ち帰った。|{a}は浜に流れ着いた木箱から、ロープを手に入れた。|{a}は難破船の帆布を剥がして、寝床に敷いた。|{a}は流れ着いたガラス瓶を、水筒にした。'),
E('i_dance','romance','p+','fc*.4+att/60','att>15','ab:att5;ba:att5','{a}は{b}の手を取って、焚き火の前で踊り出した。|{a}は{b}と、波の音に合わせてゆっくり揺れた。|{a}は{b}に、昔習ったダンスのステップを教えた。|{a}は{b}をくるりと回して、砂に足を取られて二人で転んだ。|{a}は{b}と、月明かりの浜辺で踊った。|{a}は{b}と、手拍子だけでワルツを踊った。'),
E('i_dark_thought','solo','s+','cold*.3+stress/100','food<15&stress>40','as:3','{a}は、人数が減れば食料が足りると考えてしまった。|{a}は誰が一番役に立っていないかを、考えていた。|{a}は自分だけが生き残る方法を、頭の中で計算していた。|{a}は誰かが寝ている間に、何ができるかを考えてしまった。|{a}は自分の考えの恐ろしさに、首を振った。|{a}は自分がまだ人間でいられるか、不安になった。'),
E('i_promise','bond','p+','np*.3+honesty*.3','trust>20','ab:trust6,aff4;ba:trust6,aff4','{a}は{b}と、どちらかが先に救助されたら必ず迎えに来ると約束した。|{a}は{b}と、帰ったら一緒に海に行こうと笑った。|{a}は{b}と、生きて帰ることを誓い合った。|{a}は{b}に「あなたを置いては行かない｜＝｜あなたを置いては行きません」と言った。|{a}は{b}と、この島のことは一生忘れないと言い合った。|{a}は{b}と、小指を絡めて約束した。'),
E('i_rationing','conflict','p+','cp*.4+a*.3','food<20','ab:ten3;ba:ten4','{a}は{b}が食べ物を多く取ろうとするのを、手で制した。|{a}は{b}に、今日の分はもう終わりだと告げた。|{a}は{b}の食べるペースが早すぎると注意した。|{a}は{b}に、明日の分を残しておけと言った。|{a}は{b}の皿から、一切れを戻させた。|{a}は{b}に「みんな我慢してる｜みんな我慢している｜みんな我慢しています」と言った。'),
E('i_fever_dream','solo','s+','1-hp/100','hp<50','as:4','{a}は熱にうなされながら、家族の名前を呼んでいた。|{a}は朦朧とした意識の中で、救助のヘリの音を聞いた気がした。|{a}は自分がもう助からないのではないかと思った。|{a}は誰かの手を握ったまま、浅い眠りに落ちた。|{a}は熱で、島が揺れているように感じた。|{a}は「まだ死ねない｜＝｜まだ死ねません」と小さく呟いた。'),
E('i_watch_sea','romance','p','att/50','att>25','ab:att5','{a}は海で泳ぐ{b}の姿を、浜からずっと見ていた。|{a}は{b}が笑うたびに、島に来てよかったと思ってしまった。|{a}は{b}の日焼けした腕を、きれいだと思った。|{a}は{b}が寝言で呟いた名前が、自分であってほしいと思った。|{a}は{b}の後ろ姿を、目に焼きつけようとした。|{a}は{b}が自分の名前を呼ぶ声が、好きだった。'),
E('i_trust_fall','bond','p+','trust/60+warmth*.2','trust>25','ab:trust5;ba:trust5','{a}は{b}に、崖を降りる命綱を任せた。|{a}は{b}に、自分が眠る間の見張りを頼んだ。|{a}は{b}の判断を、迷わず信じた。|{a}は{b}に、自分の大事なものを預けた。|{a}は{b}が止めた道を、素直に引き返した。|{a}は{b}に「あなたの言う通りにする｜＝｜あなたの言う通りにします」と言った。'),
E('i_wildlife_eat','help','s+','aggr*.3+#know*.08','','food:7;as:4','{a}は罠にかかった野ウサギを、皆のために捌いた。|{a}は島の野生のヤギを、追い詰めて捕まえた。|{a}は大きなトカゲを捕まえて「鶏肉みたいな味｜鶏肉のような味だ｜鶏肉みたいな味です」と言い張った。|{a}は海亀を捕まえかけて、結局逃がした。|{a}は捕まえた鳥を、手を震わせながら絞めた。|{a}は初めて生き物を殺したことに、しばらく黙っていた。'),
E('i_wave_play','bond','p+','fc*.5','','ab:aff4;ba:aff4;as:-4','{a}は{b}と、大きな波が来るたびに浜を走って逃げた。|{a}と{b}は、波に向かって叫び合った。|{a}は{b}の手を引いて、波打ち際に二人で転がって笑った。|{a}と{b}は、砂に互いの名前を書いて、波に消されるのを見ていた。|{a}は{b}と、どちらが波に負けないか勝負した。|{a}と{b}は、濡れた砂で城を作って、波に壊されて笑った。'),
E('i_stay_strong','help','g','cp*.3+lead*.3','n>2','gab:trust3;as:-2','{a}は「泣いてもお腹は膨れないよ｜泣いても腹は膨れない｜泣いてもお腹は膨れません」と言って、皆を作業に戻らせた。|{a}は弱音を吐く者に、仕事を与えた。|{a}は誰よりも早く起きて、皆の手本になった。|{a}は「私たちは生き残る｜＝｜私たちは生き残ります」と、毎朝繰り返した。|{a}は不安を口にする者の肩を叩いて、黙って頷いた。|{a}は自分が倒れるわけにはいかないと、歯を食いしばった。'),
E('i_end_count','solo','s+','a*.4+.1','step>=4','as:2','{a}は木に刻んだ線を数えて、島に来てからの日数を確かめた。|{a}は誰かの誕生日を、島で迎えてしまったと気づいた。|{a}は、もう何日目か分からなくなっていた。|{a}は伸びた爪を見て、時間の経過を実感した。|{a}は月の満ち欠けで、日数を数えていた。|{a}は「あと何日耐えればいい？｜あと何日耐えればいい｜あと何日耐えればいいんですか？」と空に訊いた。')
]);
window.HK.addMini('br',[
E('b_dawn','solo','s+','.3+np*.1','','as:-3','{a}は朝焼けを見て、まだ生きていることに安堵した。|{a}は夜明けの冷たい空気を、深く吸い込んだ。|{a}は鳥の声で目を覚まして、一瞬だけここがどこか忘れた。|{a}は朝日に照らされた島の景色が、皮肉なほど美しいと思った。|{a}は夜明けまで生き延びたことを、指を折って数えた。|{a}は朝露で喉を潤した。'),
E('b_ammo','solo','s+','a*.4+aggr*.3','','as:-2','{a}は残りの弾数を、何度も数え直した。|{a}は武器の手入れを、丁寧に行った。|{a}は刃物を、石で研いだ。|{a}は即席の武器を、拾った鉄パイプで作った。|{a}は武器を手放さないように、手首に紐で結んだ。|{a}は武器を構えたまま、うとうとしかけた。'),
E('b_rival_spot','conflict','p','a*.3+caution*.3','allies<1','ab:ten6','{a}は遠くの崖の上に、{b}の姿を見つけた。|{a}は{b}が武器を持って歩いているのを、木陰から見ていた。|{a}は{b}の居場所を、地図に書き込んだ。|{a}は{b}が誰かと一緒にいるのを見て、警戒を強めた。|{a}は{b}が通った跡を、追うべきか迷った。|{a}は{b}の背中を、武器の照準越しに見つめた。'),
E('b_offer','bond','p+','warmth*.4+np*.3','allies<1&ten<35','ab:trust5;ba:trust5','{a}は{b}に、両手を上げて近づいた。|{a}は{b}に「水を分けるから、話を聞いて｜水を分けるから、話を聞いてくれ｜水を分けますから、話を聞いてください」と言った。|{a}は{b}に、自分の武器を地面に置いて見せた。|{a}は{b}に、一緒に脱出の方法を探そうと持ちかけた。|{a}は{b}に、昔のクラスの話をして警戒を解いた。|{a}は{b}に「私は誰も殺してない｜私は誰も殺していない｜私は誰も殺していません」と言った。'),
E('b_betray_think','betray','s','cold*.4+aggr*.3','step>3','as:-2','{a}は、同盟相手が眠ったら終わらせるつもりだった。|{a}は、最後の二人になったときのことを考えていた。|{a}は誰を最後に残すべきかを、冷静に計算していた。|{a}は仲間の背中を見ながら、武器の位置を確かめた。|{a}は誰を利用できるかを、頭の中でリストにしていた。|{a}は情を捨てると、心の中で決めた。'),
E('b_team_split_food','help','p+','np*.4+warmth*.2','allies>0','ba:aff4;ab:aff3','{a}は{b}と、最後の缶詰を半分ずつ分けた。|{a}は{b}に、一番いいところを譲った。|{a}は{b}が食べるのを見届けてから、自分の分を食べた。|{a}は{b}に、甘いものを残しておいた。|{a}は{b}と、空腹を紛らわすために料理の話をした。|{a}は{b}に、昔食べた一番美味しいものの話をさせた。'),
E('b_hide_together','romance','p','att/50+caution*.2','allies>0&att>25','ab:att5,trust4;ba:att5,trust4','{a}と{b}は、狭い押し入れの中で息を殺していた。体が触れ合っていた。|{a}は{b}の口を手で塞いで、足音が遠ざかるのを待った。|{a}と{b}は、暗闇の中で互いの手を握っていた。|{a}は{b}を自分の背中に隠して、物陰に身を潜めた。|{a}と{b}は、心臓の音が聞こえる距離で隠れていた。|{a}は{b}の震えを止めるように、肩を抱いた。'),
E('b_wounded_ally','help','p+','np*.5+aff/60','allies>0&B.hp<60','ba:aff7,trust7;bhp:8','{a}は{b}の傷を、自分のシャツを裂いて縛った。|{a}は{b}が意識を失わないように、話しかけ続けた。|{a}は{b}を背負って、安全な場所まで運んだ。|{a}は{b}のために、薬を探しに危険な場所へ向かった。|{a}は{b}の手を握って「死なないで｜死ぬな｜死なないでください」と言った。|{a}は{b}の額の汗を拭いながら、夜を明かした。'),
E('b_promise_ally','bond','p+','honesty*.3+np*.3','allies>0','ab:trust7,aff4;ba:trust7,aff4','{a}は{b}と、最後の二人になっても殺し合わないと誓った。|{a}は{b}と、一緒に首輪を外す方法を見つけようと約束した。|{a}は{b}に「どちらかが死んだら、残った方が家族に伝える｜＝｜どちらかが死んだら、残った方が家族に伝えます」と言った。|{a}は{b}と、互いの家族の名前を教え合った。|{a}は{b}と、生き残ったら必ず会おうと約束した。|{a}は{b}に、自分の最後の言葉を預けた。'),
E('b_hunted','solo','s+','caution*.4+stress/120','','as:7','{a}は誰かに追われている気配を感じて、何時間も走り続けた。|{a}は自分の足跡を消しながら、慎重に進んだ。|{a}は追跡者をまくために、わざと遠回りをした。|{a}は振り返るたびに、誰かの影を見た気がした。|{a}は追手から逃れるために、冷たい川を渡った。|{a}は気配が消えるまで、木の上で動かなかった。'),
E('b_killer_rep','conflict','s','kills*.5+aggr*.3','kills>0','gab:ten3;as:-2','{a}が人を殺したという噂が、生き残りの間に広まっていた。|{a}は自分を恐れる視線を、肌で感じていた。|{a}は誰かが自分を見て逃げ出すのを見た。|{a}は「殺人者」と呼ばれるのを、聞いてしまった。|{a}はもう誰も自分に近づかないことを悟った。|{a}は自分の名前が恐怖とともに囁かれているのを知った。'),
E('b_ally_romance2','romance','p+','att/50+np*.2','allies>0&att>30','ab:att6;ba:att6','{a}は{b}の寝顔に、そっと上着をかけた。|{a}は{b}が笑ったのを見て、ここが戦場だということを一瞬忘れた。|{a}は{b}の手を握ったまま、眠りに落ちた。|{a}は{b}に「あなたがいるから、まだ戦える｜＝｜あなたがいるから、まだ戦えます」と言った。|{a}は{b}の頬についた泥を、指で拭った。|{a}は{b}に、生きて帰ったら伝えたいことがあると言った。'),
E('b_scared_child','help','p+','np*.6','B.stress>50','ba:aff7,trust7;bs:-10','{a}は震えて動けない{b}の手を引いて、物陰に連れて行った。|{a}は{b}に「大丈夫、私がいるよ｜大丈夫だ、私がいる｜大丈夫です、私がいます」と言った。|{a}は泣きじゃくる{b}を、胸に抱き寄せた。|{a}は{b}が落ち着くまで、そばを離れなかった。|{a}は{b}の代わりに、見張りを引き受けた。|{a}は{b}に、子どもの頃に聞いた子守唄を歌った。'),
E('b_radio','escape','s+','a*.4+fc*.2','','as:-2','{a}は拾った無線機から、主催者たちの会話を聞いた。|{a}はラジオから、外の世界のニュースが流れているのに気づいた。|{a}は無線で、他の生き残りと交信しようとした。|{a}は主催者の通信の周波数を、メモに書き留めた。|{a}は無線から聞こえる笑い声に、怒りを覚えた。|{a}は無線を通して、誰かの助けを求める声を聞いた。'),
E('b_spare_kid','help','p','np*.5-aggr*.3','allies<1','ba:aff8,trust5;ab:aff3','{a}は武器を向けてきた{b}に、自分の食料を投げ渡した。|{a}は{b}に、自分の隠れ家を譲った。|{a}は{b}に、安全な場所を教えて立ち去った。|{a}は{b}の命乞いに、黙って頷いた。|{a}は{b}が逃げるのを、追わなかった。|{a}は{b}に「あなたは生きて｜あなたは生きろ｜あなたは生きてください」と言った。'),
E('b_shout_name','solo','s+','np*.3+fc*.3','','as:4','{a}は森の中で、友達の名前を叫んで探した。|{a}は「誰かいない？｜誰かいないか｜誰かいませんか？」と叫んで、すぐに後悔した。|{a}は返事のない呼びかけを、何度も繰り返した。|{a}は自分の声が、誰かを呼び寄せてしまう危険を忘れていた。|{a}は誰かの名前を呼びながら、涙が止まらなかった。|{a}は叫び声の後の沈黙に、背筋が凍った。'),
E('b_photo','solo','s+','np*.3+ac*.3','','as:3','{a}は財布の中の家族写真を、何度も見返した。|{a}はクラスの集合写真を、ポケットの中で握りしめていた。|{a}は誰かと撮ったプリクラを、そっと胸に当てた。|{a}は写真の中の笑顔を、もう一度見たいと思った。|{a}は写真の裏に、何かを書き残した。|{a}は写真を見て、生きて帰る理由を思い出した。'),
E('b_vengeance_plan','conflict','p','griev*.5+cold*.3','griev>0','ab:ten8','{a}は{b}が仲間を殺したと信じて、罠を仕掛けた。|{a}は{b}の通りそうな道に、待ち伏せの準備をした。|{a}は{b}の行動パターンを、執拗に観察した。|{a}は{b}の居場所を、他の生き残りに聞いて回った。|{a}は{b}を殺す方法を、何通りも考えた。|{a}は{b}への復讐だけを、生きる理由にしていた。'),
E('b_ally_skill','bond','p+','a*.3+#agi*.06','allies>0','ab:trust4;ba:trust4','{a}は{b}に、音を立てずに歩く方法を教えた。|{a}は{b}と、互いの得意なことを活かした役割分担を決めた。|{a}は{b}の器用さに、何度も助けられた。|{a}は{b}に、武器の扱い方を教えた。|{a}は{b}と、敵の動きを予測する練習をした。|{a}は{b}に、応急手当の仕方を教えた。'),
E('b_bluff','conflict','p+','cold*.3+a*.3+fc*.2','allies<1','ba:ten6;bs:5','{a}は空の銃を構えて、{b}を威嚇した。|{a}は「仲間が周りにいるよ｜仲間が周りにいる｜仲間が周りにいます」と嘘をついて、{b}を追い払った。|{a}は{b}に、自分が何人も殺したと言った。嘘だった。|{a}は{b}に、毒を持っていると思わせた。|{a}は{b}の前で、わざと余裕のある笑みを浮かべた。|{a}は{b}に、禁止エリアの偽の情報を教えた。'),
E('b_cooking','bond','p+','np*.3+fc*.3','allies>0','ab:aff4;ba:aff4','{a}は{b}と、民家の台所で即席の料理を作った。|{a}は{b}に、缶詰を温めて出した。|{a}は{b}と、見つけたお菓子を分け合った。|{a}は{b}に、まともな食事を作ると約束した。|{a}は{b}と、焚き火で芋を焼いた。|{a}は{b}に、手料理を振る舞って「うまい｜＝｜おいしいです」と言わせた。'),
E('b_rule','solo','s+','a*.4+cp*.3','','as:-3','{a}は「夜は動かない、水場には近づかない｜＝｜夜は動かない、水場には近づかないことです」と、自分のルールを決めた。|{a}は生き残るための三か条を、心の中で唱えた。|{a}は誰も信じないと、決めていた。|{a}は一度決めた隠れ家を、二日以上使わないと決めた。|{a}は武器を持った相手には近づかないと決めた。|{a}は誰かを殺す前に、必ず三秒数えると決めていた。'),
E('b_ghost','solo','s+','stress/80+ac*.2','step>4','as:6','{a}は死んだはずの誰かの声を、聞いた気がした。|{a}は森の中で、誰かの影が手招きするのを見た。|{a}は夢と現実の区別が、つかなくなっていた。|{a}は自分の名前を呼ぶ声に、振り返った。誰もいなかった。|{a}は死んだ友達と、話をしている気がした。|{a}は自分がもう死んでいるのではないかと思った。'),
E('b_rescue_try','help','p+','np*.5+cp*.3','B.hp<50','ba:aff7,trust7;ahp:-6','{a}は{b}が襲われているのを見て、迷わず飛び込んだ。|{a}は{b}を助けるために、自分の身を危険にさらした。|{a}は{b}を襲っていた誰かに、石を投げつけた。|{a}は{b}の盾になって、傷を負った。|{a}は{b}を連れて、命からがら逃げ出した。|{a}は{b}に「怪我はない？｜怪我はないか｜怪我はありませんか？」と、自分の傷より先に訊いた。'),
E('b_ruthless','conflict','p','cold*.5+aggr*.4','allies<1&step>2','ab:ten8;ba:ten6','{a}は武器を持たない{b}を見ても、躊躇しなかった。|{a}は{b}に「あなたが生きてる意味はない｜あなたが生きている意味はない｜あなたが生きている意味はありません」と言った。|{a}は{b}の命乞いを、聞かないふりをした。|{a}は{b}の背中に、照準を合わせた。|{a}は{b}が逃げる方向を、冷静に読んだ。|{a}は{b}の仲間を先に始末しようと考えた。'),
E('b_last_words','solo','s+','1-hp/100+np*.2','hp<40','as:4','{a}は自分の傷を見て、残された時間が少ないことを悟った。|{a}は血で、木の幹に誰かへの言葉を書いた。|{a}は最期に会いたい人の顔を、思い浮かべた。|{a}は自分の死に場所を、自分で選ぼうと思った。|{a}は空を見上げて、きれいだと思った。|{a}は「まだやり残したことがある｜＝｜まだやり残したことがあります」と呟いた。'),
E('b_cooperate_kill','betray','p','cold*.4+aggr*.3','allies>0&step>3','ab:trust2;ba:trust2','{a}は{b}と、共通の敵を倒す計画を立てた。|{a}は{b}と、他の生き残りを罠にかける作戦を練った。|{a}は{b}に、強い武器を持つ相手から先に倒そうと持ちかけた。|{a}は{b}と、手分けして標的を追い詰めた。|{a}は{b}に「生き残るには、こうするしかない｜＝｜生き残るには、こうするしかありません」と言った。|{a}は{b}の手を汚させたくなくて、自分が前に出た。'),
E('b_forgive','help','p+','np*.5+a*.2','ten>40','ab:ten-12;ba:ten-10,trust5','{a}は自分を傷つけた{b}を、許すことにした。|{a}は{b}に「あなたも怖かったんでしょ｜あなたも怖かったんだろ｜あなたも怖かったんでしょう」と言った。|{a}は{b}が自分を襲った理由を、理解しようとした。|{a}は{b}に、もう恨んでいないと告げた。|{a}は{b}の武器を、そっと地面に置かせた。|{a}は{b}に「ここで殺し合っても、何も残らないよ｜ここで殺し合っても、何も残らない｜ここで殺し合っても、何も残りません」と言った。'),
E('b_count','solo','s+','a*.4+cold*.2','step>2','as:2','{a}は残りの人数と、自分が最後に残る確率を計算した。|{a}は誰がまだ生きているかを、放送で整理した。|{a}は残りの生存者の武器を、推測していた。|{a}は自分が殺さずに済む方法を、まだ探していた。|{a}は残り時間と禁止エリアの広がりを、計算していた。|{a}は誰と誰が組んでいるかを、地図の上で整理した。'),
E('b_hug','romance','p','att/40+np*.2','att>40&ratt>30','ab:att6,aff5;ba:att6,aff5','{a}は再会した{b}を、何も言わずに抱きしめた。|{a}は{b}の背中に腕を回して、震えが止まるまで離さなかった。|{a}は{b}の肩に顔を埋めて、生きていてよかったと言った。|{a}は{b}を抱き寄せて、髪に顔を埋めた。|{a}は{b}の体温を確かめるように、強く抱いた。|{a}は{b}を抱きしめたまま、夜明けまで動かなかった。'),
E('b_wrong_target','conflict','p','impulse*.4+stress/100','stress>45','ab:ten5;ba:ten8,trust-8','{a}は物音に驚いて、{b}に武器を向けてしまった。|{a}は{b}を敵と見間違えて、石を投げた。|{a}は{b}が自分を狙っていると思い込んだ。|{a}は{b}の差し出した手を、罠だと疑った。|{a}は{b}の声を聞き間違えて、逃げ出した。|{a}は{b}が裏切ったと思い込んで、問い詰めた。'),
E('b_supply_drop','conflict','s','aggr*.4+fc*.3','step>2','as:3;ahp:5','{a}は主催者が投下した物資を、危険を承知で取りに行った。|{a}は広場に置かれた補給物資に、誰よりも早く駆けつけた。|{a}は補給物資を巡って、誰かと鉢合わせしかけた。|{a}は罠かもしれない物資を、遠くから観察していた。|{a}は補給物資の中身が、空だったことに絶望した。|{a}は物資を持ち帰る途中で、誰かの視線を感じた。'),
E('b_ally_fight','conflict','p+','cp*.4+stress/100','allies>0&ten>20','ab:ten6;ba:ten6','{a}は{b}と、次にどこへ向かうかで言い争った。|{a}は{b}が勝手に動いたことを責めた。|{a}は{b}に「あなたのせいで見つかるところだった｜＝｜あなたのせいで見つかるところでした」と言った。|{a}は{b}の判断を信用できなくなっていた。|{a}は{b}と、食料の分け方で揉めた。|{a}は{b}に「足手まとい｜足手まといだ｜足手まといです」と言ってしまった。'),
E('b_play_dead','solo','s+','a*.4+caution*.4','','as:5','{a}は誰かが近づいてきたとき、死んだふりをしてやり過ごした。|{a}は血のついた服を着て、倒れているふりをした。|{a}は地面に伏せて、息を止めた。|{a}は自分の上を誰かが通り過ぎるまで、動かなかった。|{a}は死体の横に並んで、死体のふりをした。|{a}は息を殺しすぎて、気を失いかけた。'),
E('b_spy_ally','betray','p','cold*.4+a*.3','allies>0','ab:trust-5','{a}は{b}が眠っている間に、その鞄の中身を調べた。|{a}は{b}が隠し持っている武器を、こっそり確かめた。|{a}は{b}の本当の目的を、探ろうとした。|{a}は{b}が誰かと連絡を取っていないか、監視していた。|{a}は{b}の言葉の裏を、いつも考えていた。|{a}は{b}の弱点を、ノートに書き留めていた。'),
E('b_mercy_ask','solo','s+','ac*.4+np*.3','hp<60','as:6','{a}は「殺さないで｜殺すな｜殺さないでください」と、誰もいない森に向かって呟いた。|{a}は生き残るためなら、何でもすると誓った。|{a}は武器を捨てて、白旗を上げようか迷った。|{a}は誰かに見つかったら、命乞いをしようと決めていた。|{a}は自分の弱さが、恥ずかしかった。|{a}は助けを求める声を、喉の奥で押し殺した。'),
E('b_hold_hands','romance','p+','att/50+warmth*.2','allies>0&att>30','ab:att5,trust4;ba:att5,trust4','{a}は{b}と、手を繋いだまま森を抜けた。|{a}は{b}の手を引いて、禁止エリアから逃げ出した。|{a}は{b}の手を握って「離さないでよ｜離すなよ｜離さないでくださいね」と言った。|{a}は{b}と、繋いだ手から勇気をもらっていた。|{a}は{b}の手の冷たさを、自分の手で温めた。|{a}は{b}と手を繋いだまま、星を見上げた。'),
E('b_strategy','escape','p+','a*.5+lead*.2','allies>0','ab:trust5;ba:trust5','{a}は{b}と、禁止エリアの進行を予測して移動ルートを決めた。|{a}は{b}と、主催者の監視の目を逃れる方法を考えた。|{a}は{b}と、最後の局面での動き方を話し合った。|{a}は{b}に、生き残りの数が減ったときの作戦を伝えた。|{a}は{b}と、首輪の爆破範囲について推理した。|{a}は{b}と、島の地形を利用した罠を考えた。'),
E('b_regret','solo','s+','np*.4+honesty*.3','','as:5','{a}は昔、誰かに言えなかった謝罪の言葉を思い出していた。|{a}は誰かにもっと優しくすればよかったと後悔した。|{a}は教室で無視していた誰かのことを、今になって思い出した。|{a}は最後に親と喧嘩したまま家を出たことを、悔やんだ。|{a}は伝えられなかった想いを、胸の奥で反芻した。|{a}はもう一度、普通の日に戻りたいと願った。'),
E('b_noise_make','conflict','s','fc*.3+impulse*.3','','as:4;gab:ten1','{a}は空き缶を蹴飛ばして、大きな音を立ててしまった。|{a}はくしゃみを堪えきれなかった。|{a}は足を滑らせて、枯れ枝を盛大に踏み折った。|{a}はお腹の音が大きすぎて、隠れ場所がばれるかと思った。|{a}は落としたペットボトルが、坂を転がっていくのを見送った。|{a}は眠りながら、寝言を言ってしまった。'),
E('b_save_enemy','help','p','np*.6-cold*.2','allies<1&B.hp<50','ba:aff8,trust6;bhp:6','{a}は倒れている{b}を見つけて、迷った末に手当てをした。|{a}は敵だった{b}に、水を飲ませた。|{a}は{b}の傷を縛って、立ち去った。|{a}は{b}を安全な場所まで運んだ。|{a}は{b}に「借りは返さなくていいよ｜借りは返さなくていい｜借りは返さなくていいです」と言った。|{a}は{b}に、自分の包帯を投げ渡した。'),
E('b_light','solo','s+','fc*.3+np*.2','','as:-3','{a}は夜空の星を見上げて、ここがどこでも星は同じだと思った。|{a}は月明かりの下で、自分の影を見つめた。|{a}は蛍の光を見つけて、少しだけ心が軽くなった。|{a}は遠くの灯台の光を、希望のように見つめた。|{a}は朝日が昇るのを見て、もう一日生きようと思った。|{a}は焚き火の炎を見つめて、家の暖炉を思い出した。'),
E('b_question','bond','p+','honesty*.3+a*.2','allies>0','ab:trust4;ba:trust4','{a}は{b}に「もし最後の二人になったら、どうする？｜もし最後の二人になったら、どうする｜もし最後の二人になったら、どうしますか？」と訊いた。|{a}は{b}に、なぜ自分を信じたのかを訊いた。|{a}は{b}に、ここに来る前に何をしていたかを訊いた。|{a}は{b}に、一番会いたい人は誰かを訊いた。|{a}は{b}に、誰かを殺したことがあるかを訊いた。|{a}は{b}に、生き残ったら最初に何をしたいかを訊いた。'),
E('b_trade','bond','p+','a*.3+warmth*.2','allies<1&ten<30','ab:trust3;ba:trust3','{a}は{b}と、水と包帯を交換する取引をした。|{a}は{b}に、禁止エリアの情報と食料を交換しようと持ちかけた。|{a}は{b}と、互いを見逃すという約束を交わした。|{a}は{b}に、武器の弾と引き換えに地図を渡した。|{a}は{b}と、次に会うまでは敵対しないと決めた。|{a}は{b}に、安全な水場の場所を教える代わりに食料をもらった。'),
E('b_curse_org','escape','g','cp*.4+aggr*.3','','gab:trust2','{a}は監視カメラに向かって、主催者への呪いの言葉を吐いた。|{a}は首輪に向かって「絶対に許さない｜＝｜絶対に許しません」と叫んだ。|{a}は放送に向かって、石を投げつけた。|{a}は「こんなゲーム、終わらせてやる｜＝｜こんなゲーム、終わらせてみせます」と宣言した。|{a}は主催者の旗を、引きずり下ろした。|{a}は壁に、主催者への怒りを書き殴った。'),
E('b_child_memory','solo','s+','np*.3+ac*.3','','as:3','{a}は子どもの頃に遊んだ公園のことを、なぜか思い出していた。|{a}は母親に読んでもらった絵本の一節を、口ずさんだ。|{a}は初めて自転車に乗れた日のことを思い出した。|{a}は小学生の頃の夏休みの匂いを、思い出した。|{a}は誰かに褒められた記憶を、一つずつ数えた。|{a}は子どもの頃の自分に、今の自分を見せたくないと思った。'),
E('b_watch_over','help','p','np*.5+aff/60','aff>35','ab:aff4;as:3','{a}は遠くから、{b}が無事かどうかを見守っていた。|{a}は{b}に気づかれないように、その後をついて行った。|{a}は{b}に近づこうとする誰かを、遠くから牽制した。|{a}は{b}の隠れ家の周りに、こっそり罠を仕掛けて守った。|{a}は{b}が生きていることを、放送のたびに確かめていた。|{a}は{b}のために、食料を置いて立ち去った。'),
E('b_fatigue','solo','s+','stress/100+.1','step>3','as:3;ahp:-2','{a}は眠気と疲労で、立っているのがやっとだった。|{a}は足の裏の豆が潰れて、歩くたびに痛んだ。|{a}は空腹と疲れで、判断が鈍っていた。|{a}はもう走れないと思った。|{a}は自分の手が震えて、武器をうまく握れなかった。|{a}は一瞬だけ、すべてを投げ出したくなった。')
]);
})();
});
;
/* ==== js/island-after.js ==== */
HK.Load.def(174,'js/island-after.js',function(){
(function(){
'use strict';
var HK=window.HK,E=HK&&HK.Endings;
if(!E|| !E.island)return;
function L(s){return s.split('|');}
function hash(s){var h=7;for(var i=0;i<s.length;i++)h=(h*31+s.charCodeAt(i))%99991;return h;}
function pick(arr,key,used){var h=hash(key);for(var k=0;k<arr.length;k++){var t=arr[(h+k)%arr.length];if(!used[t]){used[t]=1;return t;}}return arr[h%arr.length];}
function topOf(c){var eg=c.eg||{},best='NP',bv= -1;['CP','NP','A','FC','AC'].forEach(function(k){if((eg[k]||0)>bv){bv=eg[k]||0;best=k;}});return best;}
var T={
home:{
CP:L('{a}は帰国後、島での日々を誰にも愚痴らなかった。ただ、非常用の水と食料だけは、今も家に必ず置いている。|{a}は戻ってすぐ、仕事に復帰した。「休んでいる暇はない」――そう言いながら、ときどき窓の外の海の方角を見ていた。|{a}は島で決めた当番表の写しを、いまも手帳に挟んでいる。'),
NP:L('{a}は帰国後も、島で一緒だった人たちに季節ごとに連絡を入れた。「元気？　ちゃんと食べてる？」|{a}は島で覚えた火の起こし方を、近所の子どもたちに教えるようになった。|{a}は戻ってからしばらく、温かいお風呂に入るたびに少し泣いた。'),
A:L('{a}は島での記録をまとめ、遭難したときの手引きとして公開した。思いのほか読まれた。|{a}は帰国後、あの島の潮の流れを調べ直し、自分たちが流れ着いた理由を突き止めた。|{a}は島で何日目に何をしたかを、今でも正確に言える。'),
FC:L('{a}は帰国の翌週には、島の話を面白おかしく語る人気者になっていた。|{a}は「また行きたい」と言って周りを呆れさせた。半分は本気だった。|{a}は島で焼いた魚の味が忘れられず、釣りを始めた。'),
AC:L('{a}は戻ってからも、ふとした物音で目を覚ます夜が続いた。それでも、少しずつ眠れるようになった。|{a}は島で助けてくれた人に、帰国後に改めて手紙を書いた。何度も書き直した。|{a}は、島では言えなかった「ありがとう」を、帰りの船の上でようやく口にした。')
},
lead:L('まとめ役だった{a}は、帰国後も皆から頼られ続けた。本人は「もう島じゃないんだから」と苦笑いしていた。|{a}は島で皆をまとめた経験を、二度と使いたくないと思いつつ、職場で何度も役立てることになった。|{a}は、全員の名前を書いた紙を、いまも財布に入れている。'),
kill:L('{a}は帰国後、島で起きたことを一度も口にしなかった。夢の中でだけ、何度もあの浜に立っていた。|{a}は帰ってきた。けれど、手を洗う回数だけは、島に行く前より増えていた。|{a}は、島で自分がしたことを、誰にも許してもらおうとは思わなかった。'),
solo:L('一人で島を出た{a}は、残してきた人たちのことを、帰ってからも考え続けた。|{a}は無事に帰り着いた。けれど、島の話を振られるたびに、黙って話題を変えた。|{a}は、自分だけ先に島を出たことを、最後まで誰にも謝れなかった。'),
stay:L('{a}は島に残った。今では、浜に流れ着く瓶を拾っては、中の手紙を読むのが日課になっている。|{a}は島に小屋を建て直し、自分だけの暮らしを始めた。「ここのほうが、息がしやすい」|{a}は島に残り、毎朝、水平線に船影がないかを確かめる。見つけても、手は振らないかもしれない。'),
pairHome:L('{a}と{b}は、帰国後も一緒に暮らし始めた。部屋の隅には、島で拾った貝殻が並んでいる。|{a}と{b}は、毎年、島から戻った日に二人で海を見に行く。|{a}と{b}は、島での日々を「最悪で、最高だった」と口をそろえて言う。'),
pairStay:L('{a}と{b}は、二人で島に残った。小屋は少しずつ大きくなり、浜には二人分の足跡が毎朝つく。|{a}と{b}は、迎えの船を見送った。「ここが、二人の家だから」|{a}と{b}は島に残り、夕暮れになると、並んで火を焚いた。')
};
var isl0=E.island;
E.island=function(res,X){
var out=isl0.apply(this,arguments);
if(!out|| !Array.isArray(out.lines)|| !X|| !X.C)return out;
var seed=String(res.seed!=null?res.seed:''),done={},used={};
var lovers=(res.pairs||[]).filter(function(p){return p.label==='lovers';});
function homeOf(c){return c.alive&& /救助|イカダ|抜け出した|助けを呼びに/.test(c.fate||'');}
function stayOf(c){return c.alive&& /島に残った/.test(c.fate||'');}
var after=[];
lovers.forEach(function(p){
var a=X.C[p.a],b=X.C[p.b];
if(!a|| !b||done[a.i]||done[b.i])return;
var both=homeOf(a)&&homeOf(b)?'pairHome':stayOf(a)&&stayOf(b)?'pairStay':'';
if(!both)return;
done[a.i]=done[b.i]=true;
after.push(a.name+'と'+b.name+'のその後――'+pick(T[both],a.name+b.name+seed,used).replace(/\{a\}/g,a.name).replace(/\{b\}/g,b.name));
});
X.C.forEach(function(c){
if(done[c.i]|| !c.alive)return;
var pool;
if(stayOf(c))pool=T.stay;
else if(!homeOf(c))return;
else if(/抜け出した/.test(c.fate||''))pool=T.solo;
else if(c.kills>0)pool=T.kill;
else if(c.leader)pool=T.lead;
else pool=T.home[topOf(c)];
after.push(c.name+'のその後――'+pick(pool,c.name+seed,used).replace(/\{a\}/g,c.name));
});
after.slice(0,8).forEach(function(l){out.lines.push(l);});
return out;
};
})();
});
;
/* ==== js/island-rel.js ==== */
HK.Load.def(187,'js/island-rel.js',function(){
(function(){
'use strict';
var HK=window.HK,RK=HK.RelKit,isl=HK.SCENARIOS.island;
if(!isl|| !RK)return;
var EV=isl.events,L=RK.L,fill=RK.fill;
function add(o){EV.push(o);}
function mm(a,b){return{a:a.name,b:b?b.name:''};}
function up(c,id){c.stats[id]=Math.min(5,(c.stats[id]||3)+1);}
var T={
lesson:L('{a}は砂浜に枝で図を描いた。「いいか、{b}。北極星はこっち。ここが今日の授業だ｜いいか、{b}。北極星はこちらだ。ここが今日の授業だ｜いいですか、{b}。北極星はこちらです。ここが今日の授業です」|{a}は{b}に、木の枝で火を起こす方法を一から教えた。煙が上がったとき、{b}は子どものように声を上げた。|{a}は{b}に、食べられる貝と食べられない貝の見分け方を、黒板代わりの岩に書いて教えた。「テストに出すぞ｜＝｜テストに出しますよ」|{a}は{b}と並んで夕日を見ながら、潮の満ち引きの仕組みを話した。授業より、ずっと真剣に聞いてくれた。'),
shield:L('嵐の夜、{a}は{b}を岩陰に押し込み、自分の背中で雨風を受け止めた。|崖から落ちかけた{b}の腕を、{a}は必死で掴んだ。手のひらの皮が剥けても、{a}は離さなかった。「生徒を落とす先生がいるか！｜＝｜生徒を落とす先生がいるものですか！」|{a}は高波から{b}をかばって、岩に肩を打ちつけた。「大丈夫だ。先生は頑丈なんだ｜＝｜大丈夫です。先生は頑丈なんです」'),
grown:L('{a}は熱を出した{b}のために、ひとりで水場まで往復した。「先生、今日は休んでて｜先生、今日は休んでいてくれ｜先生、今日は休んでてください」|{a}は釣った魚を、真っ先に{b}の前に置いた。「先生に教わった通りにやったら、釣れた｜＝｜先生に教わった通りにやったら、釣れました」|{a}は{b}が眠っているあいだに、雨漏りする屋根を直しておいた。いつも守られてばかりだった。'),
scold:L('{a}は勝手に沖まで泳ごうとした{b}を、浜から怒鳴りつけた。{b}は「授業じゃないんだから｜授業じゃないんだ｜授業じゃないんですから」と言い返した。|{a}は火の番をさぼった{b}を叱った。{b}はふてくされて、背中を向けたまま眠ったふりをした。'),
rebelT:L('{a}は{b}に言い返した。「ここじゃ先生も生徒もないでしょ｜ここでは先生も生徒もないだろう｜ここでは先生も生徒もないでしょう」――{b}は少しだけ寂しそうに笑った。|{a}は{b}の言いつけを破って、ひとりで森の奥まで探検に行った。戻った{a}を、{b}は叱らずに迎えた。'),
train:L('{a}は{b}の手を取って、銛の構えを直させた。「波を読め。魚は、波の切れ目に来る｜＝｜波を読んでください。魚は、波の切れ目に来ます」|{a}は{b}に、罠の仕掛け方を一度だけ見せた。二度目は、{b}にやらせた。|{a}は{b}の結んだロープを黙ってほどき、もう一度結ばせた。三度目で、{a}は小さく頷いた。|{a}は{b}に、星と風から天気を読む方法を教えた。「明日は荒れる。覚えておけ｜＝｜明日は荒れます。覚えておいてください」'),
surpass:L('{a}が釣り上げた大物を見て、{b}は目を見開いた。「……もう、私より上手いな｜＝｜……もう、私より上手いですね」|嵐の前兆に先に気づいたのは、{a}だった。{b}は弟子の判断に黙って従い、その夜、誰も怪我をしなかった。'),
protFood:L('{a}は自分の分の焼き魚を、黙って{b}の皿に移した。「腹減ってないから｜腹は減っていない｜お腹は空いていませんから」|{a}はやっと見つけた果物を、皮をむいて{b}に渡した。自分は、皮の裏をかじった。|{a}は{b}が寝ているあいだに、自分の水を{b}の分に足しておいた。'),
protStorm:L('嵐の夜、{a}は{b}を毛布でくるみ、自分は外側で寝た。雨に打たれ続けた背中が、朝には冷えきっていた。|雷が鳴るたびに、{a}は{b}の肩を抱き寄せた。子どもの頃、雷が怖いと泣いていた{sib:a→b}だった。'),
protRebel:L('{a}は{b}に言い返した。「もう子どもじゃない。魚くらい自分で獲れる｜＝｜もう子どもじゃありません。魚くらい自分で獲れます」――{b}は何も言えなかった。|{a}は{b}の制止を振り切って、ひとりで崖の上の鳥の巣を取りに行った。戻ってきた{a}を、{b}は泣きながら叱った。'),
protCare:L('{a}は日焼けで真っ赤になった{b}の肩に、アロエを塗ってやった。「昔からすぐ赤くなるんだから｜昔から、すぐに赤くなるんだからな｜昔からすぐ赤くなるんですから」|{a}は{b}の髪についた砂を、丁寧に払った。{b}は「子ども扱いしないで｜子ども扱いするな｜子ども扱いしないでください」と言いながら、黙って払われていた。|{a}は眠れない{b}の背中を、子どもの頃のように一晩中さすり続けた。'),
closeSignal:L('{a}と{b}は、子どもの頃に作った秘密の合図で、離れた浜から互いの無事を知らせ合った。|{a}と{b}は、砂浜に二人だけに分かる暗号を書いて伝言にした。'),
closeRace:L('{a}と{b}は、どちらが多く貝を獲れるか競争した。結果は引き分けで、二人とも同じ数だと言い張った。|{a}と{b}は浜辺で相撲を取って、二人して波に倒れ込んだ。笑い声が、浜じゅうに響いた。|{a}と{b}は、どちらの寝床が上等か言い合い、最後には二人で一つの寝床を作った。'),
closeMemory:L('{a}と{b}は、昔の家族旅行の海の話をして笑った。「あのときも、あなたが溺れかけたよね｜あのときも、あなたが溺れかけただろう｜あのときも、あなたが溺れかけましたよね」|{a}は{b}に、子どもの頃に隠したおやつの場所を白状した。{b}は「やっぱりあなたか｜＝｜やっぱりあなたでしたか」と吹き出した。'),
lockRefuse:L('焚き火のそばで{b}が想いを口にしかけたとき、{a}はそっと首を振った。「ごめん。心に決めた人がいる｜すまない。心に決めた人がいる｜ごめんなさい。心に決めた人がいます」|{a}は{b}の差し出した花を、困ったように受け取った。「ありがとう。でも、気持ちには応えられない｜＝｜ありがとうございます。でも、気持ちには応えられません」|{a}は{b}の視線に気づいて、静かに言った。「……あの人以外は、考えられないんだ｜＝｜……あの人以外は、考えられないんです」'),
lockDevote:L('{a}は一番いい貝を、迷わず{b}に渡した。|{a}は{b}のために、浜で一番きれいな貝殻を探して首飾りにした。|{a}は{b}が火の番をする夜は、決まって隣で眠った。|{a}は{b}の寝床にだけ、乾いた草を多めに敷いておいた。'),
lockSeek:L('{a}は、ここにいない{b}のことばかり考えていた。島のどこかで、生きていると信じていた。|{a}は砂浜に{b}の名前を書いた。波が消すたびに、また書いた。'),
anikiRally:L('{a}は浜に皆を集めて、役割を割り振った。「漁と薪と水汲み。全員で回せば、なんとかなる｜＝｜漁と薪と水汲みです。全員で回せば、なんとかなります」|{a}はしょげている{b}の背中を叩いた。「明日は私が大物を釣ってやる。期待しとけ｜明日は私が大物を釣ってやる。期待しておけ｜明日は私が大物を釣ってみせます。期待していてください」|{a}は一番きつい夜の見張りを、当たり前のように自分の番にした。|{a}は「全員で帰る｜＝｜全員で帰ります」と言い切った。根拠はなかった。それでも、皆は少しだけ顔を上げた。'),
anikiAlone:L('皆が眠ったあと、{a}はひとりで波打ち際に座り、声を殺して泣いた。朝になると、いつもの顔で皆を起こした。|{a}は誰にも見られていないのを確かめてから、海に向かって大声で叫んだ。それから、何事もなかったように拠点へ戻った。'),
kansai:L('{a}は焚き火を囲む皆に軽口を叩いた。「無人島で魚ばっか食べてたら、帰る頃にはエラ生えてるで」皆が吹き出した。|{a}は{b}の肩を叩いた。「しゃあない、なんとかなるて」――根拠はなかったが、{b}は少し笑った。|{a}は釣れなかった日も、「明日は大漁や」と言い切った。')
};
var MOURN={
protA:L('{a}は{b}が眠っていた寝床に、ひとりで横になった。まだ少しだけ、温かい気がした。|{a}は{b}の名前を海に向かって叫んだ。波の音しか、返ってこなかった。'),
protB:L('{a}は{b}がいつもしてくれたように、焚き火の番をした。ずっと守られていたのだと、ひとりになって初めて知った。|{a}は{b}の口癖を真似てみた。「腹減ってないから｜腹は減っていない｜お腹は空いていませんから」――言いながら、涙が止まらなかった。'),
sibclose:L('{a}は二人で作った秘密の合図を、誰もいない浜で一度だけ送った。返ってくる合図は、もうなかった。|{a}は{b}との競争の続きを、ひとりで砂浜に書いた。勝負は、ずっと引き分けのままだ。'),
teacherA:L('{a}は{b}に教えた星を見上げた。教え子は、もうそれを見ることがない。|{a}は砂浜に{b}の名前を書いて、その横に花丸を描いた。'),
teacherB:L('{a}は{b}に教わった方法で、ひとりで火を起こした。煙が目に染みたことにした。|{a}は{b}の最後の授業を、何度も思い出していた。'),
mentorA:L('{a}は{b}の銛を、自分の銛の隣に立てた。弟子を失った師は、何も言わなかった。|{a}は{b}に最後まで「よくやった｜＝｜よくやりました」と言えなかったことを、波の音を聞きながら悔やんでいた。'),
mentorB:L('{a}は{b}に教わった罠を、ひとりで仕掛けた。今度は一度で、うまくいった。見せたい相手は、もういなかった。|{a}は{b}の教えを守って、明日の天気を空から読んだ。'),
lock:L('{a}は{b}のいない浜辺で、それでも生きていた。ほかの誰かを好きになる日は、きっと来ない。|{a}は{b}の名前を、誰にも聞こえない声で呼んだ。心に決めた人は、最後まで一人だけだった。')
};
function ev(id,cat,kindOk,gap,w,run){
add({id:id,cat:cat,scope:'pair',
when:function(ctx,a,b){return kindOk(ctx,a,b)&&RK.cool(ctx,a,b,id,gap);},
w:w,
run:function(ctx,a,b){RK.mark(ctx,a,b,id);return run(ctx,a,b);}});
}
function is(k){return function(ctx,a,b){return RK.kind(ctx,a,b)===k;};}
ev('ir_lesson','help',is('teacherA'),5,function(ctx,a,b){return 0.6+a.tr.np*0.6+a.tr.cp*0.4;},
function(ctx,a,b){ctx.mod2(a,b,{trust:4},{trust:8,aff:5});ctx.stress(b,-10);if(ctx.rng()<0.35)up(b,ctx.pick(['fish','build','cook']));return{text:fill(ctx.pick(T.lesson),mm(a,b)),why:a.name+'は'+b.name+'の先生（NP・CP。教え導こうとする）'};});
ev('ir_shield','help',function(ctx,a,b){return RK.kind(ctx,a,b)==='teacherA'&&(ctx.env.storm>40||ctx.rng()<0.3);},8,function(ctx,a){return 0.4+a.tr.np*0.7+a.tr.cp*0.3-a.tr.caution*0.2;},
function(ctx,a,b){a.hp-=6+ctx.rng.int(8);ctx.mod(b,a,{aff:12,trust:14});return{text:fill(ctx.pick(T.shield),mm(a,b)),why:a.name+'は生徒の'+b.name+'をかばった（NP'+Math.round(a.eg.NP)+'）',mag:18};});
ev('ir_grown','help',function(ctx,a,b){return RK.kind(ctx,a,b)==='teacherB'&&(b.hp<75||b.stress>35);},7,function(ctx,a){return 0.5+a.tr.np*0.6+a.tr.fc*0.2;},
function(ctx,a,b){b.hp=Math.min(100,b.hp+6);ctx.mod2(a,b,{trust:6},{aff:10,trust:12});return{text:fill(ctx.pick(T.grown),mm(a,b)),why:'生徒の'+a.name+'が、先生の'+b.name+'を支えた',mag:16};});
ev('ir_scold','conflict',function(ctx,a,b){var k=RK.kind(ctx,a,b);return k==='teacherA'||k==='teacherB';},8,
function(ctx,a,b){return RK.kind(ctx,a,b)==='teacherA'?a.tr.cp*0.6*(b.tr.impulse+b.tr.fc):a.tr.fc*0.4+a.tr.impulse*0.4+a.stress/150;},
function(ctx,a,b){var k=RK.kind(ctx,a,b);ctx.mod2(a,b,{ten:8},{ten:10,aff: -3});return{text:fill(ctx.pick(k==='teacherA'?T.scold:T.rebelT),mm(a,b)),why:k==='teacherA'?a.name+'（先生）のCPと、'+b.name+'の衝動性がぶつかった':'生徒の'+a.name+'が反発した（FC・衝動性）'};});
ev('ir_train','bond',is('mentorA'),5,function(ctx,a){return 0.6+a.tr.cp*0.5+a.tr.a*0.3;},
function(ctx,a,b){var sk=ctx.pick(['fish','hunt','build']);b.flags.trained=(b.flags.trained||0)+1;up(b,sk);ctx.mod2(a,b,{trust:5},{trust:8,aff:4});return{text:fill(ctx.pick(T.train),mm(a,b)),why:'師の'+a.name+'が、弟子の'+b.name+'に稽古をつけた（CP・A）。'+b.name+'の'+{fish:'釣り',hunt:'狩猟',build:'拠点づくり'}[sk]+'が'+b.stats[sk]+'になった'};});
ev('ir_surpass','help',function(ctx,a,b){return RK.kind(ctx,a,b)==='mentorB'&&(a.flags.trained||0)>=2;},12,function(ctx,a){return 0.5+a.tr.np*0.3+a.tr.a*0.3;},
function(ctx,a,b){ctx.mod(b,a,{trust:15,aff:8});ctx.food=(ctx.food||0)+6;return{text:fill(ctx.pick(T.surpass),mm(a,b)),why:'弟子の'+a.name+'が、師の'+b.name+'に並んだ（稽古 '+a.flags.trained+'回）',mag:22};});
ev('ir_pfood','help',function(ctx,a,b){return RK.kind(ctx,a,b)==='protA'&&(ctx.food<25||b.hp<70);},4,function(ctx,a){return 0.8+a.tr.np*0.8;},
function(ctx,a,b){a.hp-=4;b.hp=Math.min(100,b.hp+5);ctx.mod(b,a,{aff:8,trust:6});return{text:fill(ctx.pick(T.protFood),mm(a,b)),why:a.name+'は{sib:a→b}の'+b.name+'を我が子のように守る（NP'+Math.round(a.eg.NP)+'）'};});
ev('ir_pstorm','help',function(ctx,a,b){return RK.kind(ctx,a,b)==='protA'&&ctx.env.storm>30;},7,function(ctx,a){return 0.5+a.tr.np*0.6;},
function(ctx,a,b){a.hp-=3;ctx.stress(b,-12);ctx.mod(b,a,{aff:8});return{text:fill(ctx.pick(T.protStorm),mm(a,b)),why:a.name+'の、{sib:a→b}への庇護（NP）'};});
ev('ir_prebel','conflict',is('protB'),10,function(ctx,a){return a.tr.fc*0.5+a.tr.cp*0.3+a.tr.impulse*0.3-a.tr.ac*0.3;},
function(ctx,a,b){ctx.mod2(a,b,{ten:8},{ten:6});ctx.stress(b,10);a.flags.grownUp=true;return{text:fill(ctx.pick(T.protRebel),mm(a,b)),why:'{sib:b→a}の'+a.name+'が、'+b.name+'の庇護に反発した（FC・CP）'};});
ev('ir_pcare','help',is('protA'),4,function(ctx,a,b){return 0.5+a.tr.np*0.6+b.stress/100;},
function(ctx,a,b){ctx.stress(b,-12);ctx.mod(b,a,{aff:5});return{text:fill(ctx.pick(T.protCare),mm(a,b)),why:a.name+'の、{sib:a→b}への世話焼き（NP）'};});
ev('ir_csig','bond',is('sibclose'),5,function(ctx,a){return 0.6+a.tr.fc*0.5;},
function(ctx,a,b){ctx.mod2(a,b,{trust:8,aff:4},{trust:8,aff:4});ctx.stress(a,-6);ctx.stress(b,-6);var r=ctx.rng();return{text:fill(ctx.pick(r<0.35?T.closeSignal:r<0.7?T.closeRace:T.closeMemory),mm(a,b)),why:'親友のような{sibs}（FC）'};});
add({id:'ir_lrefuse',cat:'romance',scope:'pair',
when:function(ctx,a,b){return RK.locked(a)&& !RK.lockedTo(a,b)&&ctx.R(b,a).att>35&& !ctx.pair(a,b).lockRef;},
w:function(ctx,a,b){return 0.8+ctx.R(b,a).att/60;},
run:function(ctx,a,b){ctx.pair(a,b).lockRef=true;ctx.mod(b,a,{att: -10,ten:6});ctx.stress(b,12);var t=HK.lockNames(ctx.chars,a);return{text:fill(ctx.pick(T.lockRefuse),mm(a,b)),why:a.name+'は恋愛の相手を'+(t?t+'と':'')+'決めている。'+b.name+'の想い（惹かれ '+Math.round(ctx.R(b,a).att)+'）には応えない'};}});
ev('ir_ldevote','romance',function(ctx,a,b){return RK.lockedTo(a,b);},5,function(ctx,a,b){return 0.8+a.tr.np*0.4+a.tr.ac*0.3+ctx.R(a,b).att/80;},
function(ctx,a,b){ctx.mod(a,b,{att:6,aff:4});ctx.mod(b,a,{aff:6,att:3});return{text:fill(ctx.pick(T.lockDevote),mm(a,b)),why:a.name+'の想う相手は、'+(HK.locks(a).length>1?b.name+'たち（決めた人）':b.name+'ただ一人')};});
ev('ir_aniki','help',function(ctx,a){return RK.tone(a)==='aniki';},5,function(ctx,a,b){return 0.6+a.tr.np*0.5+a.tr.lead*0.4+b.stress/100;},
function(ctx,a,b){ctx.others(a).forEach(function(o){ctx.stress(o,-5);ctx.mod(o,a,{trust:4});});return{text:fill(ctx.pick(T.anikiRally),mm(a,b)),why:a.name+'の面倒見のよさ（NP・CP。兄貴・姉貴分）'};});
add({id:'ir_anikiAlone',cat:'solo',scope:'solo',
when:function(ctx,a){return RK.tone(a)==='aniki'&&a.stress>45&& !a.flags.anikiCry;},
w:function(ctx,a){return 0.6+a.stress/100;},
run:function(ctx,a){a.flags.anikiCry=true;ctx.stress(a,-15);return{text:fill(ctx.pick(T.anikiAlone),mm(a)),why:'頼られる側の'+a.name+'にも、限界はある（ストレス '+Math.round(a.stress)+'）'};}});
ev('ir_kansai','bond',function(ctx,a){return RK.tone(a)==='kansai';},6,function(ctx,a,b){return 0.3+a.tr.fc*0.6+b.stress/120;},
function(ctx,a,b){ctx.stress(b,-8);ctx.mod(b,a,{aff:4});return{text:fill(ctx.pick(T.kansai),mm(a,b)),why:a.name+'の軽口（FC）'};});
var GUARD={
help:L('{a}は{b}の様子がおかしいのに気づいて、黙って隣に座った。「顔に出てる。半分よこせ｜顔に出ている。半分よこせ｜顔に出ていますよ。半分ください」――荷物の話なのか、気持ちの話なのか、{b}には分かっていた。|{a}は{b}の分の見張りを代わった。「次はあなたの番ね｜次はあなたの番だ｜次はあなたの番ですよ」|{a}はふらつく{b}に肩を貸した。「重い｜＝｜重いです」{b}は言い返した。「うるさい｜＝｜うるさいです」――いつものやりとりだった。|{a}は{b}の手当てをしながら言った。「これで貸し一つ｜これで貸し一つだ｜これで貸し一つですね」'),
repay:L('今度は{a}が、弱った{b}に肩を貸した。「この前の借り。これでチャラな｜この前の借りだ。これで帳消しだ｜この前の借りです。これでチャラですね」|{a}は{b}の分まで働いた。「貸し借りなしだろ｜貸し借りなしだろう｜貸し借りなしでしょう」――{b}は小さく笑った。|{a}は{b}の隣に座った。前に、{b}がそうしてくれたように。')
};
add({id:'ir_cguard',cat:'help',scope:'pair',
when:function(ctx,a,b){return RK.kind(ctx,a,b)==='sibclose'&&(b.hp<85||b.stress>25||ctx.food<20)&&RK.cool(ctx,a,b,'cguard',4);},
w:function(ctx,a,b){return 0.8+a.tr.np*0.4+a.tr.fc*0.2+(ctx.pair(a,b).owe===a.i?2:0);},
run:function(ctx,a,b){
RK.mark(ctx,a,b,'cguard');
var pf=ctx.pair(a,b),repay=pf.owe===a.i;
pf.owe=repay?null:b.i;
b.hp=Math.min(100,b.hp+5);ctx.stress(b,-10);
ctx.mod2(a,b,{trust:8,aff:5},{trust:8,aff:5});
return{text:fill(ctx.pick(repay?GUARD.repay:GUARD.help),{a:a.name,b:b.name}),why:repay?a.name+'が'+b.name+'に借りを返した（親友のような{sibs}は、守り合う）':a.name+'が'+b.name+'を支えた（今度は'+b.name+'が返す番）'};
}});
RK.mourn(isl,MOURN,'ir');
})();
});
;
/* ==== js/island-escape.js ==== */
HK.Load.def(188,'js/island-escape.js',function(){
(function(){
'use strict';
var HK=window.HK,isl=HK.SCENARIOS&&HK.SCENARIOS.island,RK=HK.RelKit;
if(!isl)return;
var L=function(s){return s.split('|');};
function fill(t,m){return String(t).replace(/\{(\w+)\}/g,function(x,k){return m[k]!=null?m[k]:x;});}
function names(list){return list.map(function(c){return c.name;}).join('・');}
function R(ctx,a,b){return ctx.R(a,b);}
function note(ctx,s){(ctx.flags.endNotes=ctx.flags.endNotes||[]).push(s);}
if(!(isl.stats||[]).some(function(s){return s.id==='luck';}))(isl.stats=isl.stats||[]).push({id:'luck',label:'運',desc:'通りがかりの船に気づく・海を渡りきる幸運'});
function selfish(ctx,a){
var g=a.goal?a.goal.id:'';
return a.tr.cold*0.5+a.tr.impulse*0.2+(g==='self'?0.4:0)+a.stress/220+(a.flags.ostra?0.3:0)-a.tr.np*0.4-(g==='all'?0.45:0)-(g==='guard'?0.3:0)-(g==='stay'?1:0);
}
function talk(a){return a.tr.lead*0.35+a.tr.a*0.25+(1-a.tr.honesty)*0.25+a.tr.warmth*0.15;}
function conscience(a){return a.tr.np*0.5+a.tr.honesty*0.3+a.tr.cp*0.2;}
function luck(ctx,a){return ctx.stat(a,'luck');}
function seaOK(ctx,a){return ctx.rng()<0.42+ctx.stat(a,'know')*0.06+luck(ctx,a)*0.05-ctx.env.storm/250;}
var T={
shipSee:L('{a}が、水平線に小さな船影を見つけた。|岩場で貝を獲っていた{a}の目に、沖をゆく漁船の白い帆が映った。|夜明け前、{a}だけが、沖に揺れる灯りに気づいた。|{a}は、遠くでエンジンの音がした気がして顔を上げた。本当に、船だった。'),
shipCall:L('{a}は叫びながら浜へ走った。全員で火に生木をくべ、黒い煙を空へ上げた。|{a}の声で全員が飛び起き、服を振り、鍋を叩き、声が嗄れるまで叫んだ。|{a}は鏡代わりの金属片で、船に向かって日光を返し続けた。'),
shipYes:L('船が、ゆっくりと向きを変えた。|汽笛が一度、短く鳴った。気づいてもらえたのだ。|船から小舟が下ろされ、こちらに向かってきた。'),
shipNo:L('船影は、そのまま水平線の向こうへ消えた。誰も、しばらく口をきかなかった。|煙は風に流され、船は気づかずに去っていった。|あと少しだった。船は一度も振り返らなかった。'),
shipAlone:L('{a}は誰にも声をかけず、そのまま海に飛び込んで船へ泳いだ。|{a}は皆が眠っているうちに、ひとりで岬の先まで走り、船に手を振った。|{a}は一瞬、拠点の方を振り返った。それから、ひとりで船へ向かって泳ぎ出した。'),
shipTell:L('{a}は船員に、島に仲間が残っていることを伝えた。|{a}は船の上で、島の場所を何度も説明した。「まだ、みんないるの｜まだ、皆が残っているんだ｜まだ、みんないるんです」|船室で毛布にくるまりながら、{a}はようやく島の皆のことを話した。'),
shipSilent:L('{a}は船員に何も言わなかった。島の方角を、二度と見なかった。|{a}は「一人で漂流してた｜一人で漂流していた｜一人で漂流していました」とだけ答えた。|{a}は温かいスープを飲みながら、島のことを口にするのをやめた。'),
raftBreak:L('完成したイカダで沖へ出た途端、大波が来た。蔓がほどけ、丸太がばらばらになった。全員、泳いで浜へ戻るしかなかった。|試し漕ぎのイカダは、潮の流れに押し戻されて岩に打ちつけられた。半分が壊れた。|イカダは三人目が乗ったところで傾き、ゆっくりと沈んだ。'),
sraft:L('{a}は皆が眠ったあと、岩陰で丸太を縛っていた。|{a}は薪拾いと言って森へ入り、蔓を集めて隠した。|{a}は自分の分の食料を少しずつ、乾いた葉に包んで隠していた。|{a}は誰にも見られない入り江に、小さなイカダの骨組みを作っていた。|{a}は潮の満ち引きを、毎晩ひとりで確かめていた。'),
found:L('{a}が、入り江の岩陰に隠された小さなイカダを見つけた。そばには、{b}の上着が置いてあった。|{a}は、夜中に森へ入っていく{b}の後をつけた。そこには、一人乗りのイカダがあった。|{a}は、{b}が隠していた食料の包みと、蔓の束を見つけた。'),
excuse:L('{b}は少しも慌てなかった。「見つかっちゃったか。……実は、一人で先に出て、助けを呼んでこようと思ってたんだ。言ったら止められると思って｜見つかったか。……実は、一人で先に出て、助けを呼んでこようと思っていた。言えば止められると思った｜見つかってしまいましたか。……実は、一人で先に出て、助けを呼んでこようと思っていたんです。言ったら止められると思ったんです」|{b}は目を伏せた。「みんなに期待させたくなかった。成功するか分からないから、黙って行って、船を連れて戻るつもりだった｜皆に期待させたくなかった。成功するか分からないから、黙って行って、船を連れて戻るつもりだった｜みんなに期待させたくなかったんです。成功するか分からないので、黙って行って、船を連れて戻るつもりでした」|{b}は真剣な顔で言った。「全員で乗れるイカダは作れない。なら、一番体力のある誰かが行くしかないじゃん｜全員で乗れるイカダは作れない。ならば、一番体力のある誰かが行くしかないだろう｜全員で乗れるイカダは作れません。なら、一番体力のある誰かが行くしかないでしょう」|{b}は笑ってみせた。「サプライズにしたかったんだけどな。助けを呼んでくる係、私がやるよ｜驚かせたかったのだがな。助けを呼んでくる役は、私がやる｜サプライズにしたかったんですけどね。助けを呼んでくる係、私がやります」'),
believe:L('{a}は、しばらく{b}を見つめたあと頷いた。「……分かった。皆には、私から話す｜＝｜……分かりました。皆には、私から話します」|{a}は「一人で背負わないで｜一人で背負うな｜一人で背負わないでください」と言った。翌朝、皆で{b}を送り出すことになった。|{a}は納得した。話を聞いた皆も、最後には{b}に頭を下げた。'),
exposed:L('{a}は{b}の言い訳を最後まで聞かなかった。「一人分しかないイカダで、誰を助けに行くって？｜一人分しかないイカダで、誰を助けに行くというんだ｜一人分しかないイカダで、誰を助けに行くというんですか」|{b}の言葉は、しどろもどろだった。{a}はイカダを皆の前に引きずり出した。|{a}は黙って、{b}が隠していた食料の包みを皆の前に広げた。それで十分だった。'),
ostraStart:L('その日から、誰も{b}に話しかけなくなった。|{b}の寝床は、焚き火から一番遠い場所に移された。|{b}の分の魚は、皆が食べ終わったあとの骨だけになった。'),
ostraMeal:L('{a}は{b}の器に、魚を半分しか入れなかった。「抜け駆けするやつには、これで十分だ｜＝｜抜け駆けする人には、これで十分です」|{a}は焚き火に近づいた{b}に、無言で背を向けた。|{a}は「あなたの分はない｜＝｜あなたの分はありません」とだけ言って、{b}の前で最後の果物を分けた。|{a}は{b}が汲んできた水を、わざと地面にこぼした。'),
ostraAlone:L('{a}はひとり、拠点から離れた岩場で膝を抱えて眠った。|{a}は誰とも目を合わせないまま、黙々と薪を割った。|{a}は皆の笑い声を、遠くの砂浜で聞いていた。|{a}は自分で獲った小魚を、ひとりで焼いて食べた。'),
ostraForgive:L('{a}は皆の目を盗んで、{b}に焼き魚を一匹持っていった。「……食べなよ。私は、許したわけじゃないけど｜……食べろ。私は、許したわけではないがな｜私は、許したわけではありません。……でも、食べてください」|{a}は焚き火の輪に、{b}の場所を空けた。誰も何も言わなかったが、{b}は少しだけそこに座った。|{a}は皆に言った。「怖かったのは、全員同じだろ。もういいじゃないか｜怖かったのは、全員同じだろう。もういいではないか｜怖かったのは、全員同じでしょう。もういいじゃないですか」|{a}は{b}の隣で黙って網を繕った。それが{a}なりの、許しだった。'),
ostraApology:L('{a}は皆の前で、砂に額をつけた。「本当に、ごめん｜本当に、すまない｜本当に、ごめんなさい」|{a}は自分の取り分を全部差し出して、頭を下げた。|{a}は誰よりも早く起きて、全員分の水を汲んできた。毎朝、黙って。'),
ostraSpite:L('{a}は夜中に、拠点の干し魚をひとつ盗んで食べた。もう、失うものはなかった。|{a}は皆が作っていたイカダの蔓を、こっそり一本切った。|{a}は聞こえるように言った。「どうせあなたたちも、チャンスがあれば逃げるくせに｜どうせあなたたちも、機会があれば逃げるだろう｜どうせあなたたちも、チャンスがあれば逃げるんでしょう」'),
night:L('夜明け前、{a}はひとりでイカダを押し出した。誰も気づかなかった。|満月の夜、{a}は音を立てないように、隠していたイカダに乗り込んだ。|{a}は焚き火の番を代わると言い、皆が眠ったのを確かめてから、入り江へ向かった。'),
nightPair:L('夜明け前、{a}は{b}を起こした。「来て。二人なら、なんとかなる｜来い。二人なら、なんとかなる｜来てください。二人なら、なんとかなります」――二人を乗せたイカダが、静かに入り江を離れた。|{a}は{b}の手を引いて入り江へ走った。皆には、何も言わなかった。'),
invite:L('{a}は{b}にだけ打ち明けた。「イカダがある。一緒に行こう｜＝｜イカダがあります。一緒に行きましょう」|{a}は{b}の耳元で囁いた。「今夜、ここを出る。あなただけは連れていく｜＝｜今夜、ここを出ます。あなただけは連れていきます」'),
refuseKeep:L('{b}は首を振った。「皆を置いていけない｜皆を置いてはいけない｜皆を置いていけません」――それでも{b}は、そのことを誰にも言わなかった。|{b}は「行けない｜＝｜行けません」とだけ言った。一晩中、眠れなかった。'),
refuseTell:L('{b}は首を振り、翌朝、皆の前でそのことを話した。「黙ってるのは、違うと思った｜黙っているのは、違うと思った｜黙っているのは、違うと思いました」|{b}は{a}を止めた。「行くなら、全員で行く方法を考えよう｜＝｜行くなら、全員で行く方法を考えましょう」――そして、皆を起こした。'),
morning:L('朝、{a}の寝床は空だった。入り江には、イカダを引きずった跡だけが残っていた。|{a}がいないことに気づいたのは、朝の水汲みのときだった。浜に、小さな舟の跡があった。|{a}の荷物が、きれいさっぱり消えていた。'),
angry:L('{a}は砂を蹴り上げた。「あいつ、一人で逃げやがった！｜＝｜あの人、一人で逃げました！」|{a}は拳を震わせた。「信じてたのに｜信じていたのに｜信じていたんです」|{a}は吐き捨てるように言った。「最初から、そういうやつだったんだよ｜最初から、そういうやつだったんだ｜最初から、そういう人だったんです」|{a}は黙って、{b}の使っていた器を海に投げた。'),
defend:L('{a}は、ぽつりと言った。「……あいつなりに、限界だったんだよ｜……あいつなりに、限界だったんだ｜……あの人なりに、限界だったんです」|{a}は「もし助かったら、助けを呼んでくれるかもしれない｜＝｜もし助かったら、助けを呼んでくれるかもしれません」と言った。誰も答えなかった。|{a}は{b}の寝床をそのままにしておいた。戻ってくる気がした。'),
letterLove:L('{a}は寝床に、貝殻で文字を書き残していた。「必ず迎えに来る。待ってて｜必ず迎えに来る。待っていろ｜必ず迎えに来ます。待っていてください」|{a}は砂の上に、こう書き残していた。「{b}へ。ごめん。生きて会いたい｜{b}へ。すまない。生きて会いたい｜{b}へ。ごめんなさい。生きて会いたいです」'),
letterTie:L('{a}は寝床に、木の皮の書き置きを残していた。「{b}、あとは頼む｜＝｜{b}、あとはお願いします」|{a}は浜の流木に、こう刻んでいた。「{b}だけは、無事でいて｜{b}だけは、無事でいてくれ｜{b}だけは、無事でいてください」'),
letterNone:L('{a}は拠点の柱に、一言だけ刻んでいた。「ごめん｜すまない｜ごめんなさい」|書き置きは、なかった。|{a}は焚き火の灰に、指で書き残していた。「先に行く｜＝｜先に行きます」'),
back:L('三日後、{a}がぼろぼろになって浜に打ち上げられた。イカダは、どこにもなかった。|波打ち際に、{a}が倒れていた。海は、一人では越えられなかった。|夕方、{a}が泳いで戻ってきた。誰も手を貸さなかった。'),
lostSea:L('沖へ出た{a}の姿は、それきり見えなくなった。|数日後、浜に{a}のイカダの破片が流れ着いた。'),
msgSincere:L('{a}は名乗り出た。「イカダは一人乗りが限界だ。私が行って、必ず船を連れて戻る｜＝｜イカダは一人乗りが限界です。私が行って、必ず船を連れて戻ります」|{a}は言った。「みんなの分まで、私が行く。待ってて｜皆の分まで、私が行く。待っていろ｜みんなの分まで、私が行きます。待っていてください」|{a}は自分の取り分の食料を皆に残して、空の荷物でイカダに乗ると言った。'),
msgSmooth:L('{a}は焚き火の前で、静かに話し始めた。「全員は乗れない。だったら、一番泳げて、一番体力があるやつが助けを呼びに行くべきだ｜＝｜全員は乗れません。だったら、一番泳げて、一番体力がある人が助けを呼びに行くべきです」――それは、{a}のことだった。|{a}は地図を砂に描いて、皆を説得した。「潮の流れは、私が一番分かってる。私が行けば、三日で船が来る｜潮の流れは、私が一番分かっている。私が行けば、三日で船が来る｜潮の流れは、私が一番分かっています。私が行けば、三日で船が来ます」|{a}は穏やかに笑った。「誰かが行かなきゃいけないなら、私が行くよ。……みんなのためにね｜誰かが行かねばならないなら、私が行く。……皆のためだ｜誰かが行かなければいけないなら、私が行きます。……みんなのためです」|{a}は涙ぐんでみせた。「本当は怖い。でも、みんなを助けたいの｜本当は怖い。だが、皆を助けたい｜本当は怖いです。でも、みんなを助けたいんです」'),
msgOk:L('皆は{a}に、なけなしの干し魚を持たせた。イカダが沖へ遠ざかっていくのを、全員で見送った。|{a}は皆と一人ずつ握手をしてから、イカダに乗った。|皆が浜に並んで手を振った。{a}は一度だけ、振り返った。'),
msgNo:L('{b}が首を振った。「あなた一人で行くなら、皆で行く。イカダは全員のものだ｜＝｜あなた一人で行くなら、皆で行きます。イカダは全員のものです」|{b}は{a}をじっと見た。「本当に、戻ってくるつもりなの？｜本当に、戻ってくるつもりなのか？｜本当に、戻ってくるつもりなんですか？」――{a}は答えに詰まった。|話し合いは夜まで続き、結局、誰も一人では行かないことになった。'),
msgSeen:L('{b}は冷たく言った。「助けを呼ぶ、ね。一人で逃げたいだけだろ｜助けを呼ぶ、か。一人で逃げたいだけだろう｜助けを呼ぶ、ですか。一人で逃げたいだけでしょう」――焚き火の輪が、静まり返った。|{b}は{a}の荷物を指さした。「戻ってくる人が、そんなに食料を持っていく？｜戻ってくるやつが、そんなに食料を持っていくか？｜戻ってくる人が、そんなに食料を持っていきますか？」'),
helpCome:L('水平線に、大きな船が現れた。甲板で、{a}が手を振っていた。|沖から汽笛が聞こえた。{a}が呼んだ救助船だった。|ヘリの音がした。{a}は、約束を守ったのだ。'),
helpCall:L('{a}は本土に着くなり、警察に駆け込んだ。「島に、まだ仲間がいるの｜島に、まだ仲間がいるんだ｜島に、まだ仲間がいるんです」|{a}は病院のベッドから、何度も島の場所を伝えた。'),
noCall:L('{a}は本土に着いた。だが、島のことは誰にも話さなかった。|{a}は無事に家へ帰った。島の皆が待っていることを、思い出さないようにしていた。')
};
function pick(ctx,arr){return arr[Math.floor(ctx.rng()*arr.length)];}
function mm(a,b){return{a:a.name,b:b?b.name:''};}
function tieOf(ctx,a,b){
if(RK&&RK.kind&&RK.kind(ctx,a,b))return RK.kind(ctx,a,b);
var l=HK.Ties&&HK.Ties.all?HK.Ties.all(ctx,a,b):[];
for(var i=0;i<l.length;i++){var d=HK.TIES[l[i].type];if(d&&d.pol>0)return l[i].type;}
return null;
}
function enemyTie(ctx,a,b){var l=HK.Ties&&HK.Ties.all?HK.Ties.all(ctx,a,b):[];return l.some(function(t){var d=HK.TIES[t.type];return d&&d.pol<0;});}
function closest(ctx,a,list){
var best=null,bv= -1e9;
list.forEach(function(o){if(o===a)return;var r=R(ctx,a,o),v=r.aff+r.att*0.8+r.trust*0.3+(tieOf(ctx,a,o)?30:0)+(HK.lockTo(a,o)?60:0);if(v>bv){bv=v;best=o;}});
return best&&bv>40?best:null;
}
function sail(ctx,a,crew,how){
var ok=seaOK(ctx,a);
if(!ok){
if(ctx.rng()<0.3){crew.forEach(function(c){c.out=false;ctx.kill(c,null,'一人で漕ぎ出した海で消息を絶った');});ctx.say({kind:'event',cat:'death',actors:crew,text:fill(pick(ctx,T.lostSea),mm(a)),why:'海は荒れていた（天候 '+ctx.env.storm+'・運 '+luck(ctx,a)+'）',mag:30});return'lost';}
crew.forEach(function(c){c.out=false;c.hp-=20;ctx.stress(c,25);c.flags.sraft=0;});
ctx.say({kind:'event',cat:'escape',actors:crew,text:fill(pick(ctx,T.back),mm(a)),why:'一人では海を越えられなかった（知識 '+ctx.stat(a,'know')+'・運 '+luck(ctx,a)+'）',mag:20});
return'back';
}
crew.forEach(function(c){c.out=true;c.fate=how.fate;c.fateNote=how.note;});
return'ok';
}
function hostile(ctx,a,o){var r=R(ctx,a,o);return Math.max(0,r.ten-r.aff*0.6-r.trust*0.3)+(enemyTie(ctx,a,o)?25:0);}
function bonds(ctx,a){
var left=ctx.present().filter(function(o){return o!==a;}),friend=null,fv=0,foes=[];
left.forEach(function(o){
var r=R(ctx,a,o),v=r.aff+r.trust*0.5+r.att*0.5+(tieOf(ctx,a,o)?30:0)+(HK.lockTo(a,o)?60:0);
if(v>fv){fv=v;friend=o;}
if(hostile(ctx,a,o)>32||r.aff< -18)foes.push(o);
});
return{left:left,friend:fv>=55?friend:null,foes:foes};
}
function decideHelp(ctx,a,sincere){
var B=bonds(ctx,a),p=sincere?0.85:conscience(a)*0.8,why;
if(B.friend){p=Math.max(p,0.95);why='島に'+B.friend.name+'が残っている（'+(HK.lockTo(a,B.friend)?'想う相手':tieOf(ctx,a,B.friend)?'大事な関係':'仲が良い')+'）';}
else if(B.foes.length&&B.foes.length>=B.left.length/2){p*=sincere?0.7:0.3;why='島に残っているのは、'+names(B.foes)+'のような折り合いの悪い相手ばかり';}
else why=a.name+'の良心（NP・本音の出やすさ・CP）';
return{does:ctx.rng()<p,why:why};
}
function watcher(ctx,a){
var best=null,bv=0;
ctx.present().forEach(function(o){
if(o===a)return;
var h=hostile(ctx,o,a)+Math.max(0,-R(ctx,o,a).aff)*0.5;
if(h<25)return;
var v=Math.min(0.7,(o.tr.a*0.35+o.tr.caution*0.25+h/160)*0.85);
if(v>bv){bv=v;best=o;}
});
return best&&ctx.rng()<bv?best:null;
}
T.caught=L('{b}は、{a}が拠点を抜け出すのを見ていた。{b}は{a}の腕を掴み、低く言った。「どこへ行く気？｜どこへ行く気だ｜どこへ行くつもりですか」|{b}は眠ったふりをして、ずっと{a}を見張っていた。「やっぱりね｜やっぱりな｜やっぱりそうでしたか」|{a}が入り江へ向かう足音に、{b}だけが目を開けた。{b}は大声で皆を起こした。|{b}は{a}の前に立ちふさがった。「あなただけ助かるなんて、許さない｜あなただけ助かるなど、許さない｜あなただけ助かるなんて、許しません」');
T.caughtShip=L('{b}がそれに気づき、{a}の腕を掴んで引き戻した。「一人で行かせるか｜＝｜一人で行かせはしません」――{b}の怒鳴り声で、皆が浜へ駆けてきた。|泳ぎ出そうとした{a}の前に、{b}が立ちふさがった。「皆を呼んで。今すぐ｜皆を呼べ。今すぐだ｜皆を呼んでください。今すぐです」');
function callHelp(ctx,a,sincere){
var D=decideHelp(ctx,a,sincere),does=D.does;
if(does){
ctx.flags.helpAt=ctx.stepIndex+2+Math.floor(ctx.rng()*2);ctx.flags.helpBy=a.i;
a.fateNote+='。本土で救助を呼んだ';
ctx.say({kind:'phase',cat:'escape',actors:[a],text:fill(pick(ctx,T.helpCall),mm(a)),why:D.why});
}else{
ctx.flags.noReturn=a.i;a.fateNote+='。島のことは誰にも話さなかった';
ctx.say({kind:'phase',cat:'betray',actors:[a],text:fill(pick(ctx,T.noCall),mm(a)),why:(/折り合い/.test(D.why)?D.why+'。見捨てた':a.name+'の良心は、助けを呼ぶほどには働かなかった（NP '+Math.round(a.eg.NP)+'）')});
}
return does;
}
function ostracize(ctx,b,by){
b.flags.ostra=true;b.flags.ostraN=0;b.flags.sraft=0;
if(by)(by.flags.harm=by.flags.harm||{})[b.i]=(by.flags.harm[b.i]||0)+2;
ctx.others(b).forEach(function(o){ctx.mod(o,b,{trust: -35,aff: -18,ten:22});ctx.mod(b,o,{ten:12});});
ctx.stress(b,25);
ctx.flags.ostraList=(ctx.flags.ostraList||[]).concat([b.i]);
}
function angerAt(ctx,gone){
var P=ctx.present();if(!P.length)return;
P.forEach(function(o){ctx.k=1;ctx.mod(o,gone,{trust: -40,aff: -22,ten:25});});
var mad=ctx.most(P,function(o){return o.tr.cp*0.5+o.tr.aggr*0.5;});
var kind=ctx.most(P.filter(function(o){return o!==mad;}),function(o){return o.tr.np*0.7+R(ctx,o,gone).aff/100;});
ctx.say({kind:'event',cat:'conflict',actors:[mad,gone],text:fill(pick(ctx,T.angry),mm(mad,gone)),why:mad.name+'のCP・攻撃性（置いていかれた怒り）',mag:18});
if(kind&&kind.tr.np>0.55)ctx.say({kind:'event',cat:'help',actors:[kind,gone],text:fill(pick(ctx,T.defend),mm(kind,gone)),why:kind.name+'のNP（責めきれない）'});
}
function letter(ctx,a){
var P=ctx.present(),dear=closest(ctx,a,P);
var love=dear&&(HK.lockTo(a,dear)||R(ctx,a,dear).att>40);
var t=love?T.letterLove:dear&&tieOf(ctx,a,dear)?T.letterTie:T.letterNone;
if(dear&&t!==T.letterNone)ctx.stress(dear,18);
return fill(pick(ctx,t),mm(a,dear));
}
var EV=isl.events;
EV.push({id:'ie_ship',cat:'escape',scope:'solo',
when:function(ctx){return ctx.stepIndex>=1&&(ctx.flags.ships||0)<2&&ctx.flags.helpAt==null;},
w:function(ctx,a){return(0.03+luck(ctx,a)*0.03)*(ctx.env.rescue==='no'?1.6:1);},
run:function(ctx,a){
ctx.flags.ships=(ctx.flags.ships||0)+1;
var see=fill(pick(ctx,T.shipSee),mm(a)),P=ctx.present();
if(P.length>1&&selfish(ctx,a)>0.45&&ctx.rng()<0.65){
var wt=watcher(ctx,a);
if(wt){ctx.mod2(a,wt,{ten:12},{ten:10,trust: -12});ctx.others(a).forEach(function(o){if(o!==wt)ctx.mod(o,a,{trust: -8});});see+=fill(pick(ctx,T.shipAlone),mm(a))+fill(pick(ctx,T.caughtShip),mm(a,wt));a=wt;}
else if(ctx.rng()<0.35+luck(ctx,a)*0.1){
a.out=true;a.fate='一人で島を抜け出した';a.fateNote=ctx.label+'、通りがかりの船に一人で泳ぎ着いた';
var TD=decideHelp(ctx,a,false),tell=TD.does;
if(tell){ctx.flags.helpAt=ctx.stepIndex+1+Math.floor(ctx.rng()*2);ctx.flags.helpBy=a.i;a.fateNote+='。船員に島のことを伝えた';}
else{ctx.flags.noReturn=a.i;a.fateNote+='。島のことは黙っていた';}
var e={cat:'betray',text:see+fill(pick(ctx,T.shipAlone),mm(a))+fill(pick(ctx,tell?T.shipTell:T.shipSilent),mm(a)),why:a.name+'のドライさ・目標（'+a.goal.label+'）と運 '+luck(ctx,a)+'。'+TD.why,mag:35};
ctx.pending=(ctx.pending||[]).concat([{kind:'event',cat:'phase',text:fill(pick(ctx,T.morning),mm(a))}]);
ctx.flags.angerQ=(ctx.flags.angerQ||[]).concat([a.i]);
return e;
}
if(!wt){ctx.stress(a,10);
return{cat:'solo',text:see+fill(pick(ctx,T.shipAlone),mm(a))+'――だが、船は'+a.name+'に気づかないまま去った。'+a.name+'は濡れた服のまま、何食わぬ顔で拠点に戻った。',why:a.name+'のドライさ（一人で行こうとした）。運が足りなかった'};}
}
var p=0.25+luck(ctx,a)*0.08+(ctx.isl&&ctx.isl.base?ctx.isl.base/400:0)+a.tr.lead*0.1;
if(ctx.rng()<p){
var stayed=[];
P.forEach(function(c){var sr=HK.IslandStay?HK.IslandStay.decide(ctx,c,'ship',c.goal.id==='stay'&&ctx.rng()<0.35):null;if(sr){c.flags.stayR=sr;stayed.push(c);}});
P=P.filter(function(c){return stayed.indexOf(c)<0;});
if(!P.length){P=stayed.splice(0,1);P[0].flags.stayR=null;}
if(stayed.length)HK.IslandStay.follow(ctx,stayed,P).forEach(function(x){if(P.length>1){x[0].flags.stayR=x[1];stayed.push(x[0]);P.splice(P.indexOf(x[0]),1);}});
ctx.flags.stayLater=stayed;
P.forEach(function(c){c.out=true;c.fate='救助（通りがかりの船）';c.fateNote=ctx.label+'、'+a.name+'が見つけた船に拾われた（体力 '+Math.max(0,Math.round(c.hp))+'）';});
ctx.flags.earlyShip={by:a.i,label:ctx.label};
return{cat:'escape',text:see+fill(pick(ctx,T.shipCall),mm(a))+pick(ctx,T.shipYes)+names(P)+'は、'+ctx.label+'に島を離れた。',why:a.name+'の運 '+luck(ctx,a)+'（全員を呼んだのはNP・主導性）',mag:45};
}
P.forEach(function(c){ctx.stress(c,10);});
return{cat:'escape',text:see+fill(pick(ctx,T.shipCall),mm(a))+pick(ctx,T.shipNo),why:'船は気づかなかった（運 '+luck(ctx,a)+'）'};
}});
EV.push({id:'ie_sraft',cat:'solo',scope:'solo',
when:function(ctx,a){return ctx.present().length>1&&selfish(ctx,a)>0.42&& !ctx.flags.helpAt&&(a.flags.sraft||0)<100;},
w:function(ctx,a){return(selfish(ctx,a)*0.9+(a.flags.ostra?0.4:0))*(ctx.env.rescue==='no'?1.5:0.8);},
run:function(ctx,a){
a.flags.sraft=(a.flags.sraft||0)+12+ctx.stat(a,'know')*5+ctx.rng()*8;
return{cat:'solo',text:fill(pick(ctx,T.sraft),mm(a)),why:a.name+'のドライさ・目標「'+a.goal.label+'」（自分用のイカダ '+Math.min(100,Math.round(a.flags.sraft))+'%）'};
}});
EV.push({id:'ie_found',cat:'conflict',scope:'pair',
when:function(ctx,a,b){return(b.flags.sraft||0)>(b.flags.sfound?60:20);},
w:function(ctx,a,b){return 0.6+a.tr.a*0.9+a.tr.caution*0.4+a.tr.cp*0.3+b.flags.sraft/120;},
run:function(ctx,a,b){
b.flags.sfound=true;
var t=fill(pick(ctx,T.found),mm(a,b));
if(selfish(ctx,a)>0.5&&R(ctx,a,b).trust> -10&&ctx.rng()<0.6){
b.flags.partner=a.i;ctx.mod2(a,b,{trust:10},{trust:8});
return{cat:'betray',text:t+a.name+'は皆を呼ばなかった。代わりに、低い声で言った。「私も乗せて。そうしたら、黙っててあげる｜私も乗せろ。そうしたら、黙っていてやる｜私も乗せてください。そうしたら、黙っていてあげます」',why:a.name+'も自分が助かりたい（ドライさ）。二人は秘密を共有した'};
}
var sus=a.tr.a*0.6+Math.max(0,-R(ctx,a,b).trust)/100+hostile(ctx,a,b)/120;
if(talk(b)+ctx.rng()*0.35>sus+0.42){
ctx.mod(a,b,{trust:6});
var e={cat:'escape',text:t+fill(pick(ctx,T.excuse),mm(a,b))+fill(pick(ctx,T.believe),mm(a,b)),why:b.name+'の口のうまさ（主導性・A・本音の出にくさ）が、'+a.name+'の疑い（A）を上回った',mag:20};
depart(ctx,b,conscience(b)>0.55);
return e;
}
ctx.flags.raft=(ctx.flags.raft||0)+b.flags.sraft*0.4;
ostracize(ctx,b,a);
return{cat:'conflict',text:t+fill(pick(ctx,T.exposed),mm(a,b))+fill(pick(ctx,T.ostraStart),mm(a,b))+'隠しイカダの丸太は、皆のイカダに回された。',why:a.name+'のA（言い訳を見抜いた）。'+b.name+'は村八分になった',mag:30};
}});
function depart(ctx,a,sincere){(ctx.flags.departQ=ctx.flags.departQ||[]).push({i:a.i,s:sincere});}
function departNow(ctx,a,sincere){
if(!a.alive||a.out)return;
var r=sail(ctx,a,[a],{fate:'助けを呼びに島を出た',note:ctx.label+'、「助けを呼んでくる」と一人でイカダを出した'});
if(r==='ok'){ctx.say({kind:'event',cat:'escape',actors:[a],text:fill(pick(ctx,T.msgOk),mm(a))});a.flags.msgr=true;ctx.flags.msgr=a.i;callHelp(ctx,a,sincere);}
}
EV.push({id:'ie_messenger',cat:'escape',scope:'solo',
when:function(ctx,a){return(!ctx.flags.raftDone&&(ctx.flags.raft||0)>=40||(a.flags.sraft||0)>=55)&&ctx.flags.msgr==null&&ctx.flags.msgTry!==ctx.stepIndex&&ctx.present().length>=3&& !a.flags.ostra;},
w:function(ctx,a){var s=selfish(ctx,a);return Math.max(0,s)*talk(a)*3+((a.flags.sraft||0)>=55?talk(a):0)+(conscience(a)>0.6?a.tr.np*0.5:0);},
run:function(ctx,a){
ctx.flags.msgTry=ctx.stepIndex;
var sincere=conscience(a)+ctx.rng()*0.2>0.6&&selfish(ctx,a)<0.35;
var speech=fill(pick(ctx,sincere?T.msgSincere:T.msgSmooth),mm(a));
var O=ctx.others(a),doubter=ctx.most(O,function(o){return o.tr.a*0.6-R(ctx,o,a).trust/100+o.tr.cp*0.2;});
var own=(a.flags.sraft||0)>=55,acc=(sincere?0.55:talk(a)*0.9)+((own?70:ctx.flags.raft)-55)/150+R(ctx,doubter,a).trust/200-doubter.tr.a*0.35+0.15-O.reduce(function(t,o){return t+hostile(ctx,o,a);},0)/Math.max(1,O.length)/120;
if(ctx.rng()<acc){
if(own){a.flags.sraft=0;a.flags.sfound=true;speech=a.name+'は、自分で作っていたイカダのことを打ち明けた。'+speech;}else ctx.flags.raft=15;
O.forEach(function(o){ctx.mod(o,a,{trust:sincere?10:6});});
var e={cat:'escape',text:speech,why:(sincere?a.name+'のNP・責任感（本心から）':a.name+'の口のうまさ（主導性・A・本音の出にくさ）')+'。皆のイカダを託された',mag:30};
depart(ctx,a,sincere);
return e;
}
if(!sincere&&doubter.tr.a>0.55&&ctx.rng()<0.6){
O.forEach(function(o){ctx.mod(o,a,{trust: -15,ten:10});});
return{cat:'conflict',text:speech+fill(pick(ctx,T.msgSeen),mm(a,doubter)),why:doubter.name+'のA（下心を見抜いた）'};
}
return{cat:'conflict',text:speech+fill(pick(ctx,T.msgNo),mm(a,doubter)),why:'皆は'+a.name+'に、全員のイカダを預けなかった'};
}});
EV.push({id:'ie_omeal',cat:'conflict',scope:'pair',
when:function(ctx,a,b){return b.flags.ostra&& !a.flags.ostra;},
w:function(ctx,a){return 0.4+a.tr.cp*0.5+a.tr.cold*0.4+a.tr.aggr*0.3;},
run:function(ctx,a,b){b.hp-=5;ctx.stress(b,10);ctx.mod(b,a,{ten:8,aff: -6});(a.flags.harm=a.flags.harm||{})[b.i]=(a.flags.harm[b.i]||0)+1;return{text:fill(pick(ctx,T.ostraMeal),mm(a,b)),why:a.name+'のCP・ドライさ（抜け駆けを許さない）'};}});
EV.push({id:'ie_oalone',cat:'solo',scope:'solo',
when:function(ctx,a){return a.flags.ostra;},
w:function(){return 0.6;},
run:function(ctx,a){ctx.stress(a,6);return{text:fill(pick(ctx,T.ostraAlone),mm(a)),why:a.name+'は村八分のまま'};}});
EV.push({id:'ie_oforgive',cat:'help',scope:'pair',
when:function(ctx,a,b){return b.flags.ostra&& !a.flags.ostra;},
w:function(ctx,a,b){return 0.3+a.tr.np*1.4+R(ctx,a,b).aff/120+(tieOf(ctx,a,b)?0.6:0)-a.tr.cp*0.3;},
run:function(ctx,a,b){(a.flags.forgave=a.flags.forgave||{})[b.i]=true;lift(ctx,b,1);b.hp=Math.min(100,b.hp+5);ctx.mod2(a,b,{trust:5},{aff:14,trust:14});return{cat:'help',text:fill(pick(ctx,T.ostraForgive),mm(a,b)),why:a.name+'のNP（'+Math.round(a.eg.NP)+'）'+(b.flags.ostra?'':'。'+b.name+'は輪に戻された')};}});
EV.push({id:'ie_oapology',cat:'help',scope:'solo',
when:function(ctx,a){return a.flags.ostra;},
w:function(ctx,a){return 0.2+a.tr.ac*1.1+a.tr.np*0.4-a.tr.cp*0.3;},
run:function(ctx,a){lift(ctx,a,1);ctx.others(a).forEach(function(o){ctx.mod(o,a,{trust:6,ten: -6});});return{text:fill(pick(ctx,T.ostraApology),mm(a)),why:a.name+'のAC（償いたい）'+(a.flags.ostra?'':'。皆は、少しずつ'+a.name+'を許した')};}});
EV.push({id:'ie_ospite',cat:'betray',scope:'solo',
when:function(ctx,a){return a.flags.ostra;},
w:function(ctx,a){return a.tr.aggr*0.8+a.tr.fc*0.3-a.tr.ac*0.4+a.stress/200;},
run:function(ctx,a){ctx.food=Math.max(0,(ctx.food||0)-4);ctx.flags.raft=Math.max(0,(ctx.flags.raft||0)-6);ctx.others(a).forEach(function(o){ctx.mod(o,a,{ten:8,trust: -6});});return{text:fill(pick(ctx,T.ostraSpite),mm(a)),why:a.name+'の攻撃性・FC（追い詰められて開き直った）'};}});
function lift(ctx,b,n){
b.flags.ostraN=(b.flags.ostraN||0)+n;
if(b.flags.ostra&&b.flags.ostraN>=3){b.flags.ostra=false;ctx.others(b).forEach(function(o){ctx.mod(o,b,{trust:12,ten: -10});});}
}
var origAfter=isl.after;
isl.after=function(ctx,s,n){
(ctx.flags.stayLater||[]).forEach(function(c){HK.IslandStay.apply(ctx,c,c.flags.stayR,'通りがかりの船に乗らなかった');c.out=true;});
ctx.flags.stayLater=[];
var P=ctx.present();
if((ctx.flags.raft||0)>=100&& !ctx.flags.raftDone&&(ctx.flags.raftFail||0)<2){
var bd=ctx.chars[ctx.flags.raftBy]||P[0];
var avgL=P.reduce(function(t,c){return t+luck(ctx,c);},0)/Math.max(1,P.length);
if(bd&&ctx.rng()>0.5+ctx.stat(bd,'know')*0.07+avgL*0.03-ctx.env.storm/220){
ctx.flags.raftFail=(ctx.flags.raftFail||0)+1;ctx.flags.raft=35+ctx.rng()*20;
P.forEach(function(c){c.hp-=5;ctx.stress(c,10);});
ctx.say({kind:'event',cat:'escape',actors:P,text:pick(ctx,T.raftBreak),why:'イカダは嵐と潮に耐えられなかった（'+bd.name+'の知識 '+ctx.stat(bd,'know')+'・天候 '+ctx.env.storm+'）',mag:18});
}
}
if(origAfter&&ctx.present().length)origAfter.call(this,ctx,s,n);
(ctx.flags.departQ||[]).forEach(function(d){departNow(ctx,ctx.chars[d.i],d.s);});
ctx.flags.departQ=[];
(ctx.flags.angerQ||[]).forEach(function(i){angerAt(ctx,ctx.chars[i]);});
ctx.flags.angerQ=[];
ctx.present().forEach(function(a){
if((a.flags.sraft||0)<100|| !a.alive||a.out||a.flags.ostra&&ctx.rng()<0.3)return;
var rest=ctx.present().filter(function(o){return o!==a;});if(!rest.length)return;
var crew=[a],partner=a.flags.partner!=null?ctx.chars[a.flags.partner]:null,txt='';
if(!partner|| !partner.alive||partner.out){
partner=null;
var dear=closest(ctx,a,rest);
if(dear&&a.tr.np*0.5+R(ctx,a,dear).aff/150+(HK.lockTo(a,dear)?0.4:0)>0.55){
txt=fill(pick(ctx,T.invite),mm(a,dear));
if(selfish(ctx,dear)>0.2||R(ctx,dear,a).att>45||HK.lockTo(dear,a))partner=dear;
else if(dear.tr.cp*0.5+dear.tr.honesty*0.5>0.55){
ostracize(ctx,a,dear);a.flags.sfound=true;
ctx.say({kind:'event',cat:'conflict',actors:[a,dear],text:txt+fill(pick(ctx,T.refuseTell),mm(a,dear))+fill(pick(ctx,T.ostraStart),mm(dear,a)),why:dear.name+'のCP・本音の出やすさ（黙っていられなかった）',mag:25});
return;
}else{ctx.stress(dear,20);txt+=fill(pick(ctx,T.refuseKeep),mm(a,dear));}
}
}
var wt=watcher(ctx,a);
if(wt&&wt!==partner){
ctx.flags.raft=(ctx.flags.raft||0)+a.flags.sraft*0.4;a.flags.sfound=true;
ostracize(ctx,a,wt);if(partner&& !partner.flags.ostra)ostracize(ctx,partner,wt);
ctx.say({kind:'event',cat:'conflict',actors:[a,wt],text:txt+fill(pick(ctx,T.caught),mm(a,wt))+fill(pick(ctx,T.ostraStart),mm(wt,a)),why:wt.name+'は'+a.name+'を敵視していて、目を離さなかった（A・慎重さ・緊張）',mag:28});
return;
}
if(partner)crew.push(partner);
var lt=letter(ctx,a);
a.flags.sraft=0;
ctx.say({kind:'event',cat:'betray',actors:crew,text:txt+(partner?fill(pick(ctx,T.nightPair),mm(a,partner)):fill(pick(ctx,T.night),mm(a))),why:a.name+'のドライさ・目標「'+a.goal.label+'」（自分だけ助かりたい）',mag:35});
var r=sail(ctx,a,crew,{fate:'一人で島を抜け出した',note:ctx.label+'、隠していたイカダで'+(partner?partner.name+'と二人で':'一人で')+'夜のうちに島を出た'});
if(r==='back'){crew.forEach(function(c){if(!c.flags.ostra)ostracize(ctx,c,null);});return;}
if(r==='ok'){
if(partner)partner.fate=a.name+'と島を抜け出した';
ctx.say({kind:'phase',cat:'phase',text:fill(pick(ctx,T.morning),mm(a))+lt});
crew.forEach(function(c){angerAt(ctx,c);});
callHelp(ctx,a,false);
}
});
if(ctx.flags.helpAt!=null&&ctx.stepIndex>=ctx.flags.helpAt){
var hb=ctx.chars[ctx.flags.helpBy],Q=ctx.present();
ctx.flags.helpAt=null;
if(Q.length&&hb){
Q.forEach(function(c){
var sr=HK.IslandStay?HK.IslandStay.decide(ctx,c,'help',c.goal.id==='stay'&&ctx.rng()<0.35):null;
if(sr){HK.IslandStay.apply(ctx,c,sr,'迎えの船に乗らなかった');c.out=true;return;}
c.out=true;c.fate='救助（呼ばれた船）';c.fateNote=ctx.label+'、'+hb.name+'が呼んだ船で帰還した（体力 '+Math.max(0,Math.round(c.hp))+'）';ctx.mod(c,hb,{trust:20,aff:12,ten: -15});
});
ctx.say({kind:'event',cat:'escape',actors:Q,text:fill(pick(ctx,T.helpCome),mm(hb)),why:hb.name+'が本土で救助を呼んだ',mag:40});
note(ctx,hb.name+'が呼んだ救助船で、'+names(Q.filter(function(c){return c.out;}))+'が帰還した。');
}
}
};
var origEnd=isl.end;
isl.end=function(ctx,s,n){return ctx.present().length===0||(origEnd?origEnd.call(this,ctx,s,n):false);};
var origFinish=isl.finish;
isl.finish=function(ctx){
if(origFinish)origFinish.call(this,ctx);
if(ctx.flags.earlyShip)note(ctx,ctx.flags.earlyShip.label+'、'+ctx.chars[ctx.flags.earlyShip.by].name+'が見つけた通りがかりの船で島を離れた。');
var nr=ctx.flags.noReturn!=null?ctx.chars[ctx.flags.noReturn]:null;
if(nr&&nr.alive)note(ctx,nr.name+'は先に本土へ着いていた。島に残る皆のことは、誰にも話さなかった。');
(ctx.flags.ostraList||[]).forEach(function(i){var c=ctx.chars[i];note(ctx,'村八分：'+c.name+(c.flags.ostra?'（最後まで許されなかった）':'（のちに輪へ戻された）'));});
};
})();
});
;
/* ==== js/island-stay.js ==== */
HK.Load.def(189,'js/island-stay.js',function(){
(function(){
'use strict';
var HK=window.HK,isl=HK.SCENARIOS&&HK.SCENARIOS.island;
if(!isl)return;
function L(s){return s.split('|');}
function fill(t,m){return String(t).replace(/\{(\w+)\}/g,function(x,k){return m[k]!=null?m[k]:x;});}
function pick(ctx,a){return a[Math.floor(ctx.rng()*a.length)];}
function posTie(ctx,a,b){
var l=HK.Ties&&HK.Ties.all?HK.Ties.all(ctx,a,b):[];
return l.some(function(t){var d=HK.TIES[t.type];return d&&d.pol>0;});
}
var T={
ostra:L('{a}は桟橋の手前で足を止めた。「私がいなくても、誰も困らないだろ｜私がいなくても、誰も困らないだろう｜私がいなくても、誰も困らないでしょう」――あの日から、誰も{a}と目を合わせなかった。|{a}は船を見送った。抜け駆けしようとしたあの夜から、皆の輪に戻れたことは一度もなかった。|{a}は「みんなと同じ船には乗れない｜皆と同じ船には乗れない｜みなさんと同じ船には乗れません」と言った。誰も引き止めなかった。'),
lonely:L('{a}は船に乗らなかった。島での日々、誰ともろくに打ち解けられなかった。帰っても、それは同じだと思った。|{a}は、皆が抱き合って喜ぶ輪の外にいた。その輪に入れないまま、黙って浜に残った。'),
heart:L('{a}は、{b}が{c}の手を取って船に乗るのを見ていた。それを見届けてから、{a}は浜に背を向けた。|{a}は{b}の隣に乗る勇気がなかった。同じ船で、{b}と{c}の笑い声を聞き続けるのは無理だった。|{a}は笑って手を振った。「私はもう少しここにいる｜＝｜私はもう少しここにいます」――{b}が{c}を選んだことは、ずっと前から分かっていた。'),
unreq:L('{a}は、{b}の顔を最後まで見られなかった。届かない想いを抱えたまま、同じ船に揺られる気にはなれなかった。|{a}の想いは、{b}には一度も届かなかった。{a}は島に残ることで、それに区切りをつけた。'),
unsaid:L('{a}は最後まで、{b}に言えなかった。{b}が自分を何とも思っていないことくらい、分かっているつもりだった。{a}は笑って手を振り、浜に残った。|{a}は船に乗りかけて、{b}の背中を見た。隣に座れば、きっと言ってしまう。困らせるくらいなら、と{a}は桟橋を降りた。|{a}は{b}に「元気でね｜元気でな｜お元気でいてください」とだけ言った。言いかけた本当の言葉は、喉の奥で止まったままだった。{b}も、同じ言葉を飲み込んでいたことを、{a}は知らなかった。'),
refused:L('{a}は、焚き火の夜に{b}に断られた言葉を、まだ覚えていた。「ごめん。心に決めた人がいる｜すまない。心に決めた人がいる｜ごめんなさい。心に決めた人がいます」――{a}は、船に乗らなかった。|{b}に気持ちを伝えて、断られた。それから{a}は、帰りたいと口にしなくなった。'),
grief:L('{a}は、{b}を埋めた丘を振り返った。「一人にはしておけない｜＝｜一人にはしておけません」|{a}は{b}の墓に花を供えてから、船に向かって首を振った。|{a}は「{b}を置いては帰れない｜＝｜{b}を置いては帰れません」と言った。誰も、それ以上は言えなかった。'),
guilt:L('{a}は自分の手を見つめた。{b}をあんな目に遭わせて、何事もなかったように帰れるはずがなかった。|{a}は船に乗る皆を見送った。{b}のことを、本土でどう説明すればいいのか分からなかった。'),
withLove:L('{a}は、浜に残ると決めた{b}の隣に立った。「あなたが残るなら、私も残る｜＝｜あなたが残るなら、私も残ります」|{a}は船の縁に掛けた足を下ろした。振り返ると、{b}が浜で待っていた。|{a}は{b}の手を握った。「帰る場所なんて、ここでいい｜帰る場所など、ここでいい｜帰る場所なんて、ここでいいんです」'),
leader:L('{a}は、自分たちで建てた小屋を見上げた。「ここを守る人間も要るだろう｜＝｜ここを守る人間も要るでしょう」|{a}は皆に言った。「次に流れ着く誰かのために、ここを残しておく｜＝｜次に流れ着く誰かのために、ここを残しておきます」'),
free:L('{a}は「明日のことを考えなくていい毎日が、こんなに楽しいなんて｜明日のことを考えなくていい毎日が、これほど楽しいとは思わなかった｜明日のことを考えなくていい毎日が、こんなに楽しいなんて思いませんでした」と言って、船に背を向けた。|{a}は浜で一番高い椰子の木に登って、船が見えなくなるまで手を振った。降りてくる気はなかった。|{a}は伸びをして笑った。「時計も上司もない。こんなに息がしやすいの、初めてなんだ｜時計も上司もない。これほど息がしやすいのは、初めてだ｜時計も上司もありません。こんなに息がしやすいのは、初めてなんです」|{a}は船を見送りながら、裸足で砂を蹴った。帰りたい理由が、一つも思いつかなかった。'),
escape:L('{a}は、鳴りやまない電話と、断れない約束のことを思い出した。ここには、どちらもない。|{a}は船に乗りかけて、立ち止まった。「帰ったら、また誰かの期待に合わせるだけだ｜＝｜帰ったら、また誰かの期待に合わせるだけです」|{a}は、帰ったあとの毎日を思い浮かべた。誰かの顔色をうかがい、頼まれごとを断れない日々。{a}は首を振った。|{a}は小さく言った。「戻ったら、また『いい子』に戻らなきゃいけないから｜戻れば、また『いい子』に戻らなければならないからだ｜戻ったら、また『いい子』に戻らなければいけませんから」'),
reason:L('{a}は本土の暮らしと島の暮らしを、指を折って比べてみせた。結論は、島だった。|{a}は「帰ったところで、待っている人も仕事もない｜＝｜帰ったところで、待っている人も仕事もありません」と言った。感傷はなく、ただの計算だった。|{a}は淡々と言った。「島の方が、合理的に暮らせる。食料も水も確保できた｜＝｜島の方が、合理的に暮らせます。食料も水も確保できました」|{a}は救助船の乗組員に、ここに残る理由を三つ並べてみせた。どれも筋が通っていた。'),
care:L('{a}は、皆で植えた芋の畑を見下ろした。「収穫まで、見届けたい｜＝｜収穫まで、見届けたいです」|{a}は浜に流れ着いた傷ついた海鳥を抱えていた。「この子が飛べるようになるまでは｜＝｜この子が飛べるようになるまでは、残ります」|{a}は、島で懐いた野良のヤギの頭を撫でた。「この子を置いていけない｜＝｜この子を置いていけません」|{a}は「誰かが流れ着いたとき、手当てできる人間がいた方がいい｜＝｜誰かが流れ着いたとき、手当てできる人間がいた方がいいです」と言った。')
};
function reasons(ctx,c,onBoard){
var out=[],others=ctx.chars.filter(function(o){return o!==c;});
var live=others.filter(function(o){return o.alive;});
var tr=live.length?live.reduce(function(t,o){return t+ctx.R(o,c).trust+ctx.R(o,c).aff*0.5;},0)/live.length:0;
if(c.flags.ostra||(ctx.flags.ostraList||[]).indexOf(c.i)>=0)out.push({k:'ostra',s:c.flags.ostra?0.5:0.3,why:'村八分にされた（皆からの信頼 平均'+Math.round(tr)+'）'});
else if(tr< -6&&live.length>=2)out.push({k:'lonely',s:0.18+Math.min(0.2,-tr/200)+c.tr.ac*0.1,why:'皆からの信頼・好意が低いまま（平均'+Math.round(tr)+'）'});
others.forEach(function(b){
var att=ctx.R(c,b).att;if(att<28|| !b.alive)return;
var rival=null,rv=0;
live.forEach(function(x){if(x===c||x===b)return;var v=Math.min(ctx.R(b,x).att,ctx.R(x,b).att);if(v>rv){rv=v;rival=x;}});
if(rival&&rv>32&&rv>ctx.R(b,c).att+5)out.push({k:'heart',s:0.2+att/250+c.tr.ac*0.1,b:b,c:rival,why:c.name+'は'+b.name+'に惹かれていた（'+Math.round(att)+'）が、'+b.name+'は'+rival.name+'と結ばれた'});
else if(ctx.pair(b,c).lockRef)out.push({k:'refused',s:0.2+att/250,b:b,why:b.name+'に想いを断られた（'+b.name+'は恋愛の相手を決めている）'});
else if(HK.Ties&&HK.Ties.pining&&HK.Ties.pining(ctx,c,b)){if(att>38)out.push({k:'unsaid',s:0.08+att/320+c.tr.ac*0.12,b:b,why:b.name+'とは両片想い（'+Math.round(att)+'／'+b.name+'から '+Math.round(ctx.R(b,c).att)+'）なのに、届かない想いだと思い込んだまま言えなかった'});}
else if(ctx.R(b,c).att<att*0.45&&att>38)out.push({k:'unreq',s:0.1+att/300+c.tr.ac*0.1,b:b,why:b.name+'への片想い（'+Math.round(att)+'）が届かなかった（'+b.name+'から '+Math.round(ctx.R(b,c).att)+'）'});
});
others.forEach(function(b){
if(b.alive)return;
var r=ctx.R(c,b),close=r.aff+r.att*0.6+(posTie(ctx,c,b)?30:0)+(HK.lockTo(c,b)?50:0);
if(b.killedBy===c.i)out.push({k:'guilt',s:0.2+c.tr.np*0.2+c.tr.ac*0.15,b:b,why:c.name+'は'+b.name+'の死に関わった（NP・ACが罪悪感を強める）'});
else if(close>40)out.push({k:'grief',s:0.2+close/350+c.tr.np*0.1,b:b,why:b.name+'を島で失った（好意 '+Math.round(r.aff)+'）'});
});
if(c.leader)out.push({k:'leader',s:0.08+c.tr.cp*0.1,why:'まとめ役としての責任（CP）'});
out.sort(function(x,y){return y.s-x.s;});
return out;
}
function selfReason(c){
var t=c.tr,m=[['free',t.fc,'FC（自由でいたい）'],['escape',t.ac,'AC（元の生活の窮屈さ）'],['reason',t.a*0.9+t.cold*0.2,'A（島の方が合理的）'],['care',t.np*0.9,'NP（島で世話をしたいものがある）']];
m.sort(function(x,y){return y[1]-x[1];});
return{k:m[0][0],s:0.35,why:'目標「本当は帰りたくない」。いちばん強いのは'+m[0][2]};
}
function line(ctx,c,r){return fill(pick(ctx,T[r.k]),{a:c.name,b:r.b?r.b.name:'',c:r.c?r.c.name:''});}
HK.IslandStay={
decide:function(ctx,c,kind,forced){
var R=reasons(ctx,c);
if(forced){
if(R[0]&&R[0].s>0.2){var r1=Object.assign({},R[0]);if(c.goal&&c.goal.id==='stay')r1.why+='（もともと「本当は帰りたくない」気持ちもあった）';return r1;}
return selfReason(c);
}
if(!R.length)return null;
var top=R[0],p=top.s*(kind==='ship'?0.45:0.7)+(c.goal&&c.goal.id==='stay'?0.08:0)-(c.goal&&c.goal.id==='all'?0.1:0);
return ctx.rng()<p?top:null;
},
apply:function(ctx,c,r,how){
c.fate='島に残った';c.fateNote=how+'――'+r.why;
c.flags.stayWhy=r;
ctx.say({kind:'event',cat:'solo',actors:[c].concat(r.b?[r.b]:[]),text:line(ctx,c,r),why:'船に乗らなかった理由：'+r.why,mag:20});
},
follow:function(ctx,stayers,boarders){
var add=[];
boarders.forEach(function(x){
if(stayers.indexOf(x)>=0)return;
var love=null;
stayers.forEach(function(s){var v=Math.min(ctx.R(x,s).att,ctx.R(s,x).att)+(HK.lockTo(x,s)?40:0);if(v>45&&(!love||v>love.v))love={s:s,v:v};});
if(love&&ctx.rng()<0.45+x.tr.np*0.2+x.tr.impulse*0.15){
var r={k:'withLove',s:1,b:love.s,why:'想う相手の'+love.s.name+'が島に残ると決めた（互いの惹かれ '+Math.round(love.v)+'）'};
add.push([x,r]);
}
});
return add;
}
};
var origFinish=isl.finish;
isl.finish=function(ctx){
var P=ctx.present();
if(origFinish)origFinish.call(this,ctx);
var shipCame=ctx.env.rescue==='yes'||ctx.flags.radio;
if(!shipCame|| !P.length)return;
var stayers=[],boarders=[];
P.forEach(function(c){
if(c.fate==='島に残った'){
var r=HK.IslandStay.decide(ctx,c,'final',true);
HK.IslandStay.apply(ctx,c,r,'救助船に乗らなかった');stayers.push(c);
}else if(c.fate==='救助'){
var r2=HK.IslandStay.decide(ctx,c,'final',false);
if(r2){HK.IslandStay.apply(ctx,c,r2,'救助船に乗らなかった');stayers.push(c);}else boarders.push(c);
}
});
HK.IslandStay.follow(ctx,stayers,boarders).forEach(function(x){HK.IslandStay.apply(ctx,x[0],x[1],'救助船に乗らなかった');});
};
})();
});
;
/* ==== js/island-corpse.js ==== */
HK.Load.def(190,'js/island-corpse.js',function(){
(function(){
'use strict';
var HK=window.HK,isl=HK.SCENARIOS&&HK.SCENARIOS.island;
if(!isl)return;
function L(s){return s.split('|');}
function fill(t,m){return String(t).replace(/\{(\w+)\}/g,function(x,k){return m[k]!=null?m[k]:x;});}
function names(l){return l.map(function(c){return c.name;}).join('・');}
function posTie(ctx,a,b){var l=HK.Ties&&HK.Ties.all?HK.Ties.all(ctx,a,b):[];return l.some(function(t){var d=HK.TIES[t.type];return d&&d.pol>0;});}
var T={
funeral:L('{a}は見晴らしのいい丘に穴を掘り、{v}を埋めた。皆で流木を組んで、小さな墓標を立てた。|{a}が言い出して、{v}を浜の椰子の木の根元に葬った。誰からともなく、花を摘んで供えた。|{a}は{v}の顔を海水で清め、自分の上着でくるんでから土をかけた。|{a}は{v}の墓の前で、短い言葉を述べた。声は途中で途切れた。|{a}は{v}の墓に、{v}が気に入っていた貝殻を並べた。'),
alone:L('{a}は一人で{v}を埋めた。ほかの誰も、手を貸さなかった。|墓を掘ったのは{a}だけだった。皆は遠巻きに、それを見ていた。'),
propose:L('{p}は焚き火を見つめたまま言った。「……{v}を、このまま土に返すのは、もったいない｜＝｜……{v}を、このまま土に返すのは、もったいないです」|{p}は淡々と言った。「腐らせるくらいなら、生きている私たちの役に立ってもらう方がいい。{v}だって、そう思うはず｜腐らせるくらいなら、生きている私たちの役に立ってもらう方がいい。{v}だって、そう思うはずだ｜腐らせるくらいなら、生きている私たちの役に立ってもらう方がいいです。{v}だって、そう思うはずです」|{p}は皆を見回した。「綺麗事で腹は膨れない。分かってるだろ｜綺麗事で腹は膨れない。分かっているだろう｜綺麗事でお腹は膨れません。分かっているでしょう」|{p}は小さな声で、誰も言い出せなかったことを口にした。「……食べよう｜＝｜……食べましょう」'),
oppose:L('{a}が{p}の前に立ちはだかった。「{v}は、ちゃんと埋める。それだけは譲らない｜{v}は、きちんと埋める。それだけは譲らない｜{v}は、ちゃんと埋めます。それだけは譲りません」|{a}は{p}の胸ぐらを掴んだ。「それ以上言ったら、あなたを許さない｜それ以上言えば、あなたを許さない｜それ以上言ったら、あなたを許しません」|{a}は静かに首を振った。「人として、それだけはしちゃいけない｜人として、それだけはしてはならない｜人として、それだけはしてはいけません」|{a}は泣きながら叫んだ。「{v}は、食べ物じゃない！｜{v}は、食べ物ではない！｜{v}は、食べ物じゃありません！」'),
agree:L('{a}は目を伏せたまま、小さく頷いた。|{a}は何も言わずに、ナイフを差し出した。|{a}は「……仕方ない｜＝｜……仕方ありません」とだけ言った。'),
eatWin:L('その夜の焚き火で何が焼かれていたのか、誰も口にしなかった。{v}の墓は、作られなかった。|話し合いは、{p}の言う通りになった。{v}の分の食料が、皆に分けられた。'),
eatLose:L('{p}の言葉は、誰にも受け入れられなかった。{v}は丘の上に埋められ、{p}は少し離れた場所からそれを見ていた。|結局、{v}は皆の手で葬られた。その日から、{p}に話しかける者は少なくなった。'),
love:L('{a}は皆が眠ったあと、{v}のそばにひとりで座っていた。「ずっと一緒にいられる方法、これしか思いつかなかった｜ずっと一緒にいられる方法は、これしか思いつかなかった｜ずっと一緒にいられる方法、これしか思いつかなかったんです」――翌朝、{v}の亡骸には布がきちんと掛け直されていた。|{a}は{v}の手を握ったまま、長いこと動かなかった。やがて{a}は、小さく呟いた。「ひとつになろう｜＝｜ひとつになりましょう」|{a}は{v}の髪をひと房切り取り、それから――誰にも見せない場所で、{v}の一部を自分のものにした。|{a}は誰にも気づかれないように、{v}の亡骸の一部を持ち去った。「これで、もう離れない｜＝｜これで、もう離れません」'),
loveSeen:L('{b}は、{a}が{v}の亡骸のそばで何をしていたのかに気づいてしまった。「……何してるの｜……何をしている｜……何をしているんですか」{a}は、穏やかに笑っていた。|{b}は{a}の口元に残ったものを見て、声を失った。|{b}は{a}の荷物の中に、布に包まれた{v}の一部を見つけた。'),
loveAfter:L('{a}は、{v}の墓の前でだけ、幸せそうな顔をした。|{a}は誰に言うでもなく呟いた。「大丈夫。{v}は、ここにいるから｜大丈夫だ。{v}は、ここにいる｜大丈夫です。{v}は、ここにいますから」――そう言って、自分の胸に手を当てた。'),
shun:L('{a}は青ざめて、その場から離れた。|{a}は口を押さえて、海の方へ走っていった。|{a}は何も見なかったことにした。')
};
function stances(ctx,c,v){
var r=ctx.R(c,v),close=r.aff+r.att*0.8+(posTie(ctx,c,v)?30:0)+(HK.lockTo(c,v)?60:0);
var I=ctx.isl||{},n=ctx.present().length,hungry=Math.min(0.25,(I.hungry||0)*0.05)+(ctx.food<n*6?0.08:0);
var t=c.tr;
return{
close:close,
bury:0.25+t.np*0.45+t.cp*0.3+t.ac*0.15+Math.max(0,close)/200+ctx.rng()*0.15,
love:close>45?t.jealous*0.6+t.impulse*0.25+t.fc*0.1-t.cp*0.3-t.np*0.1+Math.min(0.3,close/400)+c.stress/400+ctx.rng()*0.15:0,
prag:t.cold*0.55+t.a*0.3-t.np*0.35-Math.max(0,close)/200+hungry+ctx.rng()*0.15
};
}
function scene(ctx,v,late){
var P=ctx.present();if(!P.length)return;
var I=ctx.isl=ctx.isl||{},dark=ctx.env.dark!=='mild'&& !(late>=2),m={v:v.name};
var S=P.map(function(c){return{c:c,s:stances(ctx,c,v)};});
var lovers=dark?S.filter(function(x){return x.s.love>0.7&&ctx.rng()<(x.s.love-0.6)*1.1;}):[];
lovers.slice(0,1).forEach(function(x){
var a=x.c;
ctx.stress(a,-12);a.flags.ateLove=v.i;
ctx.act2({actors:[a],cat:'betray',odd:true,text:fill(ctx.pick(T.love),{a:a.name,v:v.name}),why:a.name+'の執着・衝動（嫉妬・執着 '+Math.round(a.tr.jealous*100)+'）と、'+v.name+'への想い（'+Math.round(x.s.close)+'）。愛着があるからこそ、離れたくなかった',mag:35});
(I.loveAte=I.loveAte||[]).push({by:a.i,v:v.i});
var seer=ctx.most(P.filter(function(o){return o!==a;}),function(o){return o.tr.a*0.5+o.tr.caution*0.3;});
if(seer&&ctx.rng()<0.3+seer.tr.a*0.4){
ctx.act2({actors:[seer,a],cat:'conflict',fx:function(){ctx.mod(seer,a,{aff: -25,trust: -25,ten:30});ctx.stress(seer,20);},text:fill(ctx.pick(T.loveSeen),{a:a.name,b:seer.name,v:v.name})+fill(ctx.pick(T.shun),{a:seer.name}),why:seer.name+'のA・慎重さ（気づいてしまった）'});
a.flags.loveSeen=true;
}
});
var prop=dark&& !I.ate?S.filter(function(x){return x.s.prag>0.62;}).sort(function(x,y){return y.s.prag-x.s.prag;})[0]:null;
if(prop&&ctx.rng()>(prop.s.prag-0.55)*1.8)prop=null;
if(prop){
var p=prop.c;m.p=p.name;
var sup=S.filter(function(x){return x!==prop&&x.s.prag>x.s.bury*0.8;}),opp=S.filter(function(x){return x!==prop&&x.s.prag<=x.s.bury*0.8;});
var wt=function(l){return l.reduce(function(t,x){return t+0.6+x.c.tr.lead*0.6+(x.s.bury>0.9||x.s.prag>0.9?0.3:0);},0);};
var yes=wt([prop].concat(sup)),no=wt(opp);
var head=fill(ctx.pick(T.propose),m);
var loud=opp.slice().sort(function(x,y){return y.s.bury-x.s.bury;})[0];
if(loud)head+=fill(ctx.pick(T.oppose),{a:loud.c.name,p:p.name,v:v.name});
if(sup.length)head+=fill(ctx.pick(T.agree),{a:sup[0].c.name});
if(yes>no){
I.ate=true;ctx.food=(ctx.food||0)+25;
var eaters=[p].concat(sup.map(function(x){return x.c;})),refused=opp.map(function(x){return x.c;});
ctx.act2({actors:eaters,cat:'betray',fx:function(){
eaters.forEach(function(c){ctx.stress(c,15);});
refused.forEach(function(c){eaters.forEach(function(e){ctx.mod(c,e,{aff: -25,trust: -20,ten:25});});ctx.stress(c,15);});
eaters.forEach(function(e){eaters.forEach(function(f){if(e!==f){ctx.mod(e,f,{trust:8});ctx.pair(e,f).secret=true;}});});
},text:head+fill(ctx.pick(T.eatWin),m)+(refused.length?names(refused)+'は、最後まで口をつけなかった。':''),why:p.name+'のドライさ・A（合理的に考えた）。賛成 '+eaters.length+'人・反対 '+refused.length+'人（主導性で重みづけ）',mag:40});
return;
}
ctx.act2({actors:[p].concat(loud?[loud.c]:[]),cat:'conflict',fx:function(){opp.forEach(function(x){ctx.mod(x.c,p,{trust: -15,aff: -12,ten:15});});},text:head+fill(ctx.pick(T.eatLose),m),why:'弔いたい気持ち（NP・CP・AC・'+v.name+'への好意）が勝った。反対 '+opp.length+'人'});
I.buried=(I.buried||[]).concat([v.i]);
return;
}
var lead=S.slice().sort(function(x,y){return y.s.bury-x.s.bury;})[0];
var helpers=S.filter(function(x){return x!==lead&&x.s.bury>0.55;});
var solo= !helpers.length&&P.length>1;
ctx.act2({actors:[lead.c].concat(helpers.map(function(x){return x.c;})),cat:'help',fx:function(){helpers.forEach(function(x){ctx.mod(x.c,lead.c,{trust:6,aff:4});});P.forEach(function(c){ctx.stress(c,-4);});},text:fill(ctx.pick(solo?T.alone:T.funeral),{a:lead.c.name,v:v.name}),why:lead.c.name+'のNP・CP（'+v.name+'をきちんと弔いたい）'+(solo?'。ほかの皆は、弔う気持ちが薄かった':'')});
I.buried=(I.buried||[]).concat([v.i]);
var la=(I.loveAte||[]).filter(function(x){return x.v===v.i;})[0];
if(la&&ctx.chars[la.by].alive&& !ctx.chars[la.by].out&&ctx.rng()<0.6)ctx.say({kind:'event',cat:'solo',odd:true,actors:[ctx.chars[la.by]],text:fill(ctx.pick(T.loveAfter),{a:ctx.chars[la.by].name,v:v.name}),why:''});
}
T.found0=L('朝、{a}が離れた岩場に{v}の様子を見に行った。{v}は、膝を抱えたまま冷たくなっていた。|{a}は、夜のうちに{v}の焚き火が消えていたことに気づいた。駆けつけたときには、もう遅かった。');
T.found1=L('{v}の姿を見かけなくなって、{d}日が経った。{a}が森の奥を探しに行き、倒れている{v}を見つけた。|{a}は、{v}が寝床にしていた岩陰を{d}日ぶりに覗いた。{v}は、そこにいた。もう動かなかった。|{v}がいないことに、誰も{d}日のあいだ気づかなかった。最初に気づいたのは{a}だった。');
T.found2=L('{d}日後、{a}は浜に集まる海鳥を追って、{v}を見つけた。誰にも看取られなかった亡骸だった。|{a}が{v}を見つけたのは、{d}日も経ってからだった。{a}はその場に膝をついた。');
T.never=L('{v}の姿は、それきり見えなくなった。探す者は、いなかった。');
T.regret=L('{a}は{v}の墓の前で、長いこと動けなかった。「……あのとき、一言でも声をかけていれば｜＝｜……あのとき、一言でも声をかけていればよかったんです」|{a}は、{v}に食事を分けなかった日のことを、何度も思い出した。|{a}は夜になると、{v}が一人で膝を抱えていた岩場の方を見るようになった。|{a}は誰にも聞こえない声で呟いた。「ごめん。許してやればよかった｜すまない。許してやればよかった｜ごめんなさい。許してあげればよかったです」|{a}は{v}の墓に、自分の分の魚を一切れ供えた。生きているうちに渡すべきだった。');
T.regretFight=L('{a}は、{v}と最後に交わした言葉が喧嘩だったことを、ずっと悔やんでいた。|{a}は{v}の墓の前で、言えなかった「ごめん｜すまない｜ごめんなさい」を、やっと口にした。|{a}は{v}に言い放った言葉を思い出して、夜中に何度も目を覚ました。');
T.regretForgive=L('{a}は{v}の墓に手を合わせた。「もっと早く、皆を止めればよかった｜＝｜もっと早く、皆を止めればよかったです」|{a}は、{v}にこっそり魚を渡していた夜のことを思い出した。それだけでは、足りなかった。');
T.noRegret=L('{a}は{v}の墓を一瞥しただけだった。「自業自得じゃん｜自業自得だろう｜自業自得でしょう」|{a}は肩をすくめた。「抜け駆けしようとしたのは、あいつの方だ｜＝｜抜け駆けしようとしたのは、あの人の方です」|{a}は何も言わなかった。後悔している様子は、なかった。');
function regret(ctx,v){
var P=ctx.present(),said=0;
P.forEach(function(o){
if(said>=3)return;
var harm=(o.flags.harm||{})[v.i]||0,forg=(o.flags.forgave||{})[v.i],r=ctx.R(o,v);
var fought=r.ten>45&&r.aff<10,shunned=v.flags.ostra&& !forg;
if(!harm&& !fought&& !shunned&& !forg)return;
var t=o.tr,score=t.np*0.45+t.ac*0.3+t.honesty*0.15-t.cold*0.35+Math.min(0.3,harm*0.1)+(forg?0.2:0)+ctx.rng()*0.25;
var m={a:o.name,v:v.name};
if(score>(fought&& !harm&& !shunned&& !forg?0.6:0.5)){
said++;
var pool=forg?T.regretForgive:(harm||shunned)?T.regret:T.regretFight;
ctx.act2({actors:[o],cat:'solo',fx:function(){ctx.stress(o,12+harm*3);},text:fill(ctx.pick(pool),m),why:o.name+'のNP・AC（後悔）'+(harm?'。'+v.name+'を村八分にした（'+harm+'回）':fought?'。'+v.name+'とは揉めたままだった（緊張 '+Math.round(r.ten)+'）':forg?'。こっそり許していたが、守りきれなかった':'。'+v.name+'を遠ざけたままだった')});
}else if((harm||shunned)&&t.cold>0.55&&ctx.rng()<0.6){
said++;
ctx.act2({actors:[o],cat:'conflict',text:fill(ctx.pick(T.noRegret),m),why:o.name+'のドライさ（後悔しない）'});
}
});
}
function findChance(ctx,v,days){
var best=null,bv=0;
ctx.present().forEach(function(o){
var r=ctx.R(o,v),x=o.tr.np*0.3+o.tr.a*0.2+o.tr.caution*0.15+Math.max(0,r.aff)/200+((o.flags.forgave||{})[v.i]?0.35:0);
if(x>bv){bv=x;best=o;}
});
return best&&ctx.rng()<bv*0.55+days*0.12?best:null;
}
var origFinish=isl.finish;
isl.finish=function(ctx){
if(origFinish)origFinish.call(this,ctx);
(ctx.flags.lostBody||[]).forEach(function(x){
var v=ctx.chars[x.v];
v.fateNote+='（亡骸は、最後まで誰にも見つけられなかった）';
(ctx.flags.endNotes=ctx.flags.endNotes||[]).push(fill(ctx.pick(T.never),{v:v.name})+'――'+v.name+'は村八分のまま、一人で死んだ。');
});
};
var origAfter=isl.after;
isl.after=function(ctx,s,n){
if(origAfter)origAfter.call(this,ctx,s,n);
ctx.flags.corpseDone=ctx.flags.corpseDone||{};
ctx.chars.forEach(function(v){
if(v.alive||ctx.flags.corpseDone[v.i])return;
ctx.flags.corpseDone[v.i]=true;
if(/海/.test(v.deathHow||''))return;
if(v.flags.ostra){(ctx.flags.lostBody=ctx.flags.lostBody||[]).push({v:v.i,at:ctx.stepIndex});return;}
scene(ctx,v);regret(ctx,v);
});
var LB=ctx.flags.lostBody||[];
ctx.flags.lostBody=LB.filter(function(x){
var v=ctx.chars[x.v],d=ctx.stepIndex-x.at,f=findChance(ctx,v,d);
if(!f)return true;
var pool=d<=0?T.found0:d<=2?T.found1:T.found2;
ctx.act2({actors:[f],cat:'help',fx:function(){ctx.present().forEach(function(o){ctx.stress(o,8);});},text:fill(ctx.pick(pool),{a:f.name,v:v.name,d:Math.max(1,d)}),why:v.name+'は村八分のまま、皆から離れた場所で死んだ。見つけたのは'+f.name+'（NP・A・慎重さ'+((f.flags.forgave||{})[v.i]?'・こっそり許していた':'')+'）'+(d?'。'+d+'日後':''),mag:25});
v.fateNote+='（亡骸は'+(d?d+'日後に':'その日のうちに')+f.name+'が見つけた）';
scene(ctx,v,d);regret(ctx,v);
return false;
});
};
})();
});
;
/* ==== js/island-sea.js ==== */
HK.Load.def(191,'js/island-sea.js',function(){
(function(){
'use strict';
var HK=window.HK;
var isl=HK.SCENARIOS&&HK.SCENARIOS.island;
if(!isl)return;
function R(ctx,a,b){return ctx.R(a,b);}
function pk(ctx,arr){return ctx.pick(arr);}
function sk(ctx,c,id){return ctx.stat(c,id);}
function T(ctx,s,a,b,c){return ctx.t(s,a,b,c);}
function aid(c){return c.action&&c.action.id;}
function tie(ctx,a,b,ty){return HK.Ties&&HK.Ties.has?HK.Ties.has(ctx,a,b,ty):null;}
function bondOf(ctx,a,b){
var ab=R(ctx,a,b),ba=R(ctx,b,a),pf=ctx.pair(a,b);
if(HK.Ties&&HK.Ties.pining&&HK.Ties.pining(ctx,a,b))return'pining';
if(pf.couple||tie(ctx,a,b,'lover')||tie(ctx,a,b,'mate')||(ab.att>45&&ba.att>45))return'love';
if(ab.att>48&&HK.canLove(a,b))return'crush';
if(tie(ctx,a,b,'rival')||tie(ctx,a,b,'enemy')||ab.ten>38||ab.aff< -15)return'rival';
if(ab.trust< -8)return'wary';
if(ab.aff>30&&ab.trust>18)return'friend';
return'plain';
}
var BOND_WHY={love:'惹かれ合う二人',pining:'両片想いの二人',crush:'片想いの相手と',rival:'張り合う二人',wary:'信用しきれない相手と',friend:'気心の知れた二人',plain:'まだよく知らない相手と'};
function warm(k){return k==='love'||k==='pining'||k==='crush';}
var BIG=[
{n:'カジキ',food:30,pull:0.85},{n:'ロウニンアジ',food:22,pull:0.7},{n:'巨大なハタ',food:24,pull:0.6},
{n:'キハダマグロ',food:28,pull:0.8},{n:'大ダコ',food:18,pull:0.55},{n:'サメ',food:26,pull:0.9},
{n:'人の背丈ほどあるウツボ',food:16,pull:0.6},{n:'巨大なエイ',food:20,pull:0.75}
];
function rescuerFor(ctx,a){
var cand=ctx.others(a).filter(function(o){return o.hp>30;});
if(!cand.length)return null;
return ctx.most(cand,function(o){var r=R(ctx,o,a);return r.aff/70+r.att/120+o.tr.np*0.6+o.tr.aggr*0.2-o.tr.caution*0.2+sk(ctx,o,'hp')*0.05;});
}
function sweptAway(ctx,a,what){
var P=ctx.present(),rng=ctx.rng,res=rescuerFor(ctx,a);
var intro=a.name+'の体が、竿ごと海へ引きずり込まれた。'+pk(ctx,[what+'は止まらなかった。','波が'+a.name+'の頭を越えた。','岸から伸ばされた手は、あと少しで届かなかった。']);
if(res){
var r=R(ctx,res,a),love=bondOf(ctx,res,a);
var go=0.18+res.tr.np*0.25+Math.max(0,r.aff)/250+(warm(love)?0.2:0)-(love==='rival'?0.1:0)-res.tr.caution*0.15-(ctx.env.storm||0)/400;
if(rng()<go){
var lines={
love:[res.name+'は迷わず海に飛び込んだ。'+a.name+'の腕を掴み、離さなかった。浜に這い上がった二人は、しばらく抱き合ったまま動けなかった。'+res.name+'「…二度と、こんなことしないで｜…二度と、こんなことはするな｜…二度と、こんなことしないでください」',
res.name+'は'+a.name+'の名前を叫びながら泳いだ。浜に引き上げたあと、'+a.name+'は咳き込みながら言った。'+a.name+'「…ねえ、今の、人工呼吸した？｜…おい、今の、人工呼吸したのか｜…あの、今の、人工呼吸しました？」'+res.name+'「してない！　…まだ｜していない！　…まだだ｜してません！　…まだ」'],
pining:[res.name+'は誰より先に海へ飛び込み、'+a.name+'を浜まで引きずり上げた。'+a.name+'「なんで、そこまで…｜なぜ、そこまで…｜なんで、そこまで…」'+res.name+'「…誰でも助ける｜＝｜…誰でも助けます」本当は誰でもよくなかった。'+a.name+'は、その言葉を真に受けて少しだけ落ち込んだ。',
res.name+'は'+a.name+'を抱えて岸まで泳ぎ切った。二人は砂の上で、同時に「ごめん｜すまない｜すみません」と言った。何を謝ったのか、どちらもわからなかった。濡れた手は、しばらく離れなかった。',
'浜に引き上げられた'+a.name+'は、咳き込みながら'+res.name+'の手を握っていた。'+a.name+'「…嫌だったでしょ、こんなの｜…嫌だっただろう、こんなのは｜…嫌だったでしょう、こんなの」'+res.name+'「嫌なわけない｜嫌なわけがない｜嫌なわけありません」言ってから、'+res.name+'は慌てて「仲間だし｜仲間だ｜仲間ですし」と付け足した。'+a.name+'は「だよね｜だな｜ですよね」と笑って、その夜は眠れなかった。'],
crush:[res.name+'は服のまま海に飛び込み、'+a.name+'を浜まで引っ張ってきた。'+a.name+'「ありがと…｜ありがとう…｜ありがとうございます…」'+res.name+'は濡れた前髪で、真っ赤な顔を隠した。',
res.name+'は'+a.name+'を抱えて岸まで泳ぎ切った。'+a.name+'「重かったでしょ｜重かっただろう｜重かったでしょう」'+res.name+'「…全然｜…全然だ｜…全然です」本当は腕がちぎれそうだった。'],
rival:[res.name+'は舌打ちして海に飛び込んだ。'+a.name+'を浜に放り出すと、'+res.name+'「借りにしとくね。高くつくから｜借りにしておく。高くつくぞ｜借りにしておきます。高くつきますよ」'+a.name+'「…頼んでない｜…頼んでいない｜…頼んでません」'+res.name+'「知ってる｜知っている｜知ってます」',
res.name+'は蔓を投げて'+a.name+'を引き上げた。'+a.name+'「なんで助けたの｜なぜ助けた｜なんで助けたんですか」'+res.name+'「あなたに死なれたら、張り合う相手がいなくなるでしょ｜あなたに死なれたら、張り合う相手がいなくなる｜あなたに死なれたら、張り合う相手がいなくなります」'],
wary:[res.name+'は少しだけ迷ってから、流木を投げた。'+a.name+'はそれにしがみついて、どうにか浜に戻った。二人とも、ありがとうもごめんも言わなかった。',
res.name+'が引き上げてくれた。'+a.name+'は息を整えながら、'+res.name+'を見直していた。'],
friend:[res.name+'「つかまって！｜つかまれ！｜つかまってください！」――'+res.name+'が投げた蔓のロープを、'+a.name+'は必死で掴んだ。浜に上がった二人は、ずぶ濡れのまま笑い転げた。'+a.name+'「魚に釣られるとこだった｜魚に釣られるところだった｜魚に釣られるとこでした」',
res.name+'は'+a.name+'の襟首を掴んで、浅瀬まで引きずってきた。'+res.name+'「釣りに行って、釣られて帰ってくる人がいる？｜釣りに行って、釣られて帰ってくるやつがあるか｜釣りに行って、釣られて帰ってくる人がいますか」'],
plain:[res.name+'が海に飛び込んで、'+a.name+'を引き上げた。'+a.name+'はそれまで'+res.name+'とろくに話したこともなかった。その夜、'+a.name+'は焚き火で'+res.name+'の服を一番いい場所に干した。',
res.name+'が浅瀬から手を伸ばし、'+a.name+'を掴んだ。'+a.name+'「…助かった。本当に｜＝｜…助かりました。本当に」']
};
ctx.act2({actors:[res,a],cat:warm(love)?'romance':'help',mag:22,
fx:function(){
a.hp-=10;res.hp-=8;ctx.stress(a,12);
ctx.mod2(res,a,{aff:6,trust:6,ten:love==='rival'? -6:0},{aff:14,trust:18,ten:love==='rival'? -10:0,att:warm(love)?8:0});
ctx.others(res).forEach(function(o){if(o!==a)ctx.mod(o,res,{trust:5});});
},
text:intro+pk(ctx,lines[love]),why:res.name+'が助けに飛び込んだ（NP・'+BOND_WHY[love]+'）'});
return;
}
}
if(rng()<0.12+sk(ctx,a,'hp')*0.06+sk(ctx,a,'know')*0.04){
ctx.act2({actors:[a],cat:'solo',mag:14,
fx:function(){a.hp-=18;ctx.stress(a,10);},
text:intro+pk(ctx,[a.name+'は竿を手放し、潮の流れに逆らわず斜めに泳いだ。一時間後、岩場に打ち上げられるようにして戻ってきた。'+a.name+'「…竿、持っていかれた｜＝｜…竿、持っていかれました」',
a.name+'は流木にしがみついて、夕方には浜に戻ってきた。髪に海藻を巻きつけたまま「ただいま｜＝｜ただいま戻りました」と言った。誰も笑わなかったが、あとで全員が思い出し笑いをした。']),
why:a.name+'の体力 '+sk(ctx,a,'hp')+'・サバイバル知識 '+sk(ctx,a,'know')+'（自力で岸へ）'});
if(a.hp<=0){ctx.kill(a,null,'海に引き込まれ、浜まで戻る力が残っていなかった');ctx.flush();}
return;
}
ctx.act2({actors:[a],cat:'solo',mag:30,
fx:function(){
a.out=true;a.fate='海に流された';a.fateNote=ctx.label+'、'+what+'に海へ引き込まれ、そのまま沖へ流された';
a.flags.adrift={at:ctx.stepIndex,by:what};
P.forEach(function(o){if(o!==a)ctx.stress(o,6+Math.max(0,R(ctx,o,a).aff)/6);});
},
text:intro+pk(ctx,['浜に残された者たちが気づいたときには、'+a.name+'の頭は波間の小さな点になっていた。',a.name+'の叫び声は、すぐに波の音にかき消された。日が暮れても、'+a.name+'は戻らなかった。']),
why:'助けが間に合わなかった（'+what+'の力）'});
}
isl.events=isl.events.concat([
{
id:'i_bigone',cat:'help',scope:'solo',
when:function(ctx,a){return a.hp>25&&(a.flags.bigTry||0)<2&&(aid(a)==='fishing'||sk(ctx,a,'fish')>=4||ctx.rng()<0.2);},
w:function(ctx,a){return(aid(a)==='fishing'?0.7:0.12)+sk(ctx,a,'fish')*0.06+a.tr.fc*0.1;},
run:function(ctx,a){
var rng=ctx.rng,F=pk(ctx,BIG),P=ctx.present();
a.flags.bigTry=(a.flags.bigTry||0)+1;
var helper=ctx.others(a).filter(function(o){return R(ctx,o,a).aff>15&&o.tr.np+R(ctx,o,a).aff/100>0.6&&rng()<0.5;})[0]||null;
var power=sk(ctx,a,'fish')*0.12+a.hp/300+a.tr.a*0.1+a.tr.caution*0.08+rng()*0.5+(helper?0.2:0)-F.pull*0.35;
var hook=a.name+'の釣り竿が、折れそうなほどしなった。'+pk(ctx,['糸の先で、'+F.n+'が暴れていた。','海面が割れて、'+F.n+'の背中が見えた。',a.name+'「で、でかい！　なんかでかいの来た！｜で、でかい！　何かでかいのが来た！｜で、でかいです！　何か大きいのが来ました！」']);
if(power>0.86){
var fan=ctx.others(a).length?ctx.most(ctx.others(a),function(o){return o.tr.fc+o.tr.warmth+R(ctx,o,a).aff/100;}):null;
ctx.food+=F.food;
P.forEach(function(o){if(o!==a)ctx.mod(o,a,{aff:4,trust:4});ctx.stress(o,-8);});
if(helper)ctx.mod2(a,helper,{aff:6,trust:6},{aff:4,trust:5});
var cheer=fan?pk(ctx,[fan.name+'「今夜はごちそうだ！｜今夜はごちそうだ｜今夜はごちそうです！」',fan.name+'は'+F.n+'の横に寝転がって、大きさを比べた。'+fan.name+'「負けた｜＝｜負けました」',fan.name+'「これ、帰ったら絶対誰も信じてくれないやつ｜これは、帰っても誰も信じてくれないだろうな｜これ、帰ったら絶対誰も信じてくれないやつです」',fan.name+'は'+a.name+'を胴上げしようとして、二人とも砂に転がった。']):'';
return{cat:'help',mag:18,with:helper?[helper]:null,
text:hook+(helper?helper.name+'が後ろから'+a.name+'の腰を抱えて、二人がかりで引いた。':'')+'一時間の格闘の末、'+a.name+'は'+F.n+'を浜に引き上げた。'+cheer,
why:a.name+'の釣り '+sk(ctx,a,'fish')+'・体力'+(helper?'・'+helper.name+'の加勢':'')};
}
if(power>0.64){
var doubt=ctx.others(a).length?pk(ctx,ctx.others(a)):null;
ctx.stress(a,6);
return{cat:'solo',mag:8,
text:hook+pk(ctx,['糸が、ぷつりと切れた。',a.name+'がよろけた瞬間、'+F.n+'は針を外して海の底へ消えた。'])+(doubt?a.name+'は両手をいっぱいに広げて「このくらいあった｜＝｜このくらいありました」と言い張った。'+doubt.name+'「…へえ｜…ほう｜…そうですか」日を追うごとに、その魚は大きくなっていった。':a.name+'はしばらく、何もない海面を見つめていた。'),
why:a.name+'の釣り '+sk(ctx,a,'fish')+'（'+F.n+'に逃げられた）'};
}
ctx.say({kind:'event',cat:'solo',actors:[a],text:hook+a.name+'は竿を離さなかった。それが間違いだった。',why:F.n+'の引き（'+a.name+'の釣り '+sk(ctx,a,'fish')+'・体力 '+Math.round(a.hp)+'）',mag:10});
sweptAway(ctx,a,F.n);
return null;
}
}
]);
function adriftTurn(ctx){
var rng=ctx.rng;
ctx.chars.forEach(function(c){
if(!c.alive|| !c.out|| !c.flags.adrift||c.flags.adrift.done)return;
var days=ctx.stepIndex-c.flags.adrift.at;
if(days<1)return;
c.hp-=10+rng.int(8);
if(c.hp<=0||days>=5){
c.flags.adrift.done=true;
c.fateNote=c.flags.adrift.by+'に海へ引き込まれ、沖へ流されたまま戻らなかった';
if(c.hp<=0){c.out=false;ctx.kill(c,null,'海に流され、戻らなかった');ctx.flush();}
return;
}
if(rng()>0.12+sk(ctx,c,'hp')*0.04+sk(ctx,c,'know')*0.04)return;
c.flags.adrift.done=true;c.out=false;c.fate='';c.fateNote='';
var P=ctx.present().filter(function(o){return o!==c;});
var how=pk(ctx,[
c.name+'は、島の反対側の浜に打ち上げられていた。流木にしがみついたまま、'+['','丸一','二','三','四'][days]+'日を海の上で過ごしていた。',
'朝、浜にイルカの群れが来た。その真ん中に、流木に乗った'+c.name+'がいた。'+c.name+'「…イルカ、意外と話が通じる｜＝｜…イルカ、意外と話が通じます」',
c.name+'は、手作りの筏のようなものに乗って戻ってきた。'+c.name+'「流されてる間、暇だったから｜流されている間、暇だった｜流されてる間、暇でしたから」',
'岩場で釣りをしていた者が、波間の頭に気づいた。'+c.name+'だった。日焼けで、顔が真っ赤に腫れていた。'
]);
if(!P.length){ctx.act2({actors:[c],cat:'solo',text:how,why:c.name+'の体力とサバイバル知識（漂流から帰還）',mag:20});return;}
var first=ctx.most(P,function(o){return R(ctx,o,c).aff/60+R(ctx,o,c).att/80+o.tr.warmth;});
var bd=bondOf(ctx,first,c);
var meet=bd==='pining'?pk(ctx,[
first.name+'は'+c.name+'の顔を見た瞬間、泣き出した。'+c.name+'は、自分のために泣く人がいるとは思っていなかった。'+c.name+'「…心配、してくれたの｜…心配、してくれたのか｜…心配、してくれたんですか」'+first.name+'「当たり前でしょ｜当たり前だ｜当たり前でしょう」――その「当たり前｜当たり前だ｜当たり前です」の意味を、二人は別々に受け取った。',
first.name+'は'+c.name+'に駆け寄って、抱きつく寸前で止まった。'+first.name+'「…おかえり｜＝｜…おかえりなさい」'+c.name+'も伸ばしかけた腕を、そっと下ろした。流されている間ずっと'+first.name+'のことを考えていたとは、言えなかった。',
c.name+'「流されてる間、ずっと会いたい人がいた｜流されている間、ずっと会いたい人がいた｜流されてる間、ずっと会いたい人がいました」'+first.name+'は笑って「誰？｜誰だ｜誰ですか？」と聞いた。'+c.name+'は「…内緒｜…内緒だ｜…内緒です」と目をそらした。'+first.name+'はその夜、焚き火を見ながら、それが自分ならいいのにと思った。'
]):{
love:first.name+'は駆け寄って、'+c.name+'を抱きしめた。何も言えなかった。'+c.name+'「…ただいま｜＝｜…ただいま戻りました」',
crush:first.name+'は'+c.name+'の顔を見た瞬間、泣き出した。自分でも驚くほど、止まらなかった。',
rival:first.name+'「…遅いんだよ｜…遅い｜…遅いんですよ」'+c.name+'「待ってたの？｜待っていたのか｜待っていたんですか？」'+first.name+'「待ってない｜待っていない｜待ってません」焚き火のそばには、'+c.name+'の分の魚が三日分、取ってあった。',
wary:first.name+'は'+c.name+'を見て、少し肩の力を抜いた。疑っていたのが、急に馬鹿らしくなった。',
friend:first.name+'「生きてたー！｜生きていた！｜生きてましたー！」――'+first.name+'は'+c.name+'に飛びついて、二人そろって波打ち際に倒れた。',
plain:first.name+'は'+c.name+'に水を渡した。'+c.name+'は一気に飲み干して、「生き返った｜＝｜生き返りました」と言った。'
}[bd];
ctx.act2({actors:[c,first],cat:warm(bd)?'romance':'bond',mag:24,
fx:function(){c.hp=Math.max(c.hp,15);P.forEach(function(o){ctx.stress(o,-10);ctx.mod(o,c,{aff:4});});ctx.mod2(first,c,{aff:8,trust:6},{aff:10,trust:8,att:warm(bd)?6:0});},
text:how+meet,why:c.name+'が漂流から帰還（'+days+'日）。'+first.name+'の好意'});
});
}
var SOLO_FIND=[
{t:'{a}は森の奥で、澄んだ湧き水を見つけた。口に含むと、甘かった。',fx:function(ctx,a){ctx.present().forEach(function(o){ctx.stress(o,-6);if(o!==a)ctx.mod(o,a,{trust:4});});},cat:'help'},
{t:'{a}は崖の下で、半分砂に埋もれた救命ボートの残骸を見つけた。使える板とロープが残っていた。',fx:function(ctx){if(!ctx.flags.raftDone)ctx.flags.raft=(ctx.flags.raft||0)+10;},cat:'escape'},
{t:'{a}は野生のバナナが群生している谷を見つけた。両腕いっぱいに抱えて帰った。',fx:function(ctx,a){ctx.food+=12;ctx.others(a).forEach(function(o){ctx.mod(o,a,{aff:3});});},cat:'help'},
{t:'{a}は洞窟の奥で、誰かの日記を見つけた。最後のページには「明日、船が来る気がする｜＝｜明日、船が来る気がします」とだけ書いてあった。日付は四十年前だった。',fx:function(ctx,a){ctx.stress(a,8);},cat:'solo'},
{t:'{a}は浜で、コルク栓のされた瓶を拾った。中の手紙には、外国語で「宿題を代わりにやってくれる人を募集」と書いてあった。',fx:function(ctx,a){ctx.stress(a,-4);},cat:'solo'},
{t:'{a}は島の一番高い岩に登った。水平線の向こうに、うっすらと別の島影が見えた気がした。',fx:function(ctx,a){ctx.present().forEach(function(o){ctx.stress(o,-5);});},cat:'escape'},
{t:'{a}は朽ちた小屋の中で、錆びたナイフと釣り針の入った缶を見つけた。',fx:function(ctx,a){ctx.others(a).forEach(function(o){ctx.mod(o,a,{trust:4});});if(!ctx.flags.raftDone)ctx.flags.raft=(ctx.flags.raft||0)+4;},cat:'help'},
{t:'{a}はコウモリだらけの洞窟に入ってしまい、悲鳴を上げながら全力で引き返した。',fx:function(ctx,a){ctx.stress(a,8);a.hp-=3;},cat:'solo'}
];
var SOLO_FUNNY=[
'{a}は道に迷って三時間歩き、たどり着いたのは出発した浜だった。砂浜には自分の足跡が、きれいな円を描いていた。',
'{a}は猿に帽子を盗まれた。追いかけて木に登ったら、今度は靴も盗まれた。',
'{a}はヤシの実に顔を描いて「ココさん」と名付け、一時間ほど身の上話をしてから帰ってきた。ココさんは聞き上手だった。',
'{a}は泥沼にはまり、全身泥まみれで拠点に戻った。見張りが悲鳴を上げて棒を振り回した。',
'{a}は「ここは俺の島」と彫られた木の看板を見つけた。日付は二十年前だった。',
'{a}は探索に出たはずが、日当たりのいい岩の上で昼寝してしまい、片側だけ日焼けして帰ってきた。',
'{a}は「秘密基地にちょうどいい｜＝｜秘密基地にちょうどいいです」と言って木の上に小屋を作り始め、夕方には降りられなくなっていた。',
'{a}は砂浜で巨大なヤドカリと睨み合い、十五分後に負けを認めて道を譲った。'
];
var SOLO_FUNNY_REACT=['{b}は涙が出るほど笑った。','{b}「…何してたの、一日｜…何をしていた、一日｜…何をしていたんですか、一日」','{b}はその話を、その夜三回せがんだ。','{b}は黙って、{a}の肩を叩いた。'];
isl.events=isl.events.concat([
{
id:'i_solo_find',cat:'solo',scope:'solo',
w:function(ctx,a){return(aid(a)==='explore'?0.9:0.12)+a.tr.fc*0.2+sk(ctx,a,'know')*0.03;},
run:function(ctx,a){
var f=pk(ctx,SOLO_FIND);
f.fx(ctx,a);
return{cat:f.cat,text:T(ctx,f.t,a),why:a.name+'が一人で島を探索した（FC・サバイバル知識 '+sk(ctx,a,'know')+'）',mag:8};
}
},
{
id:'i_solo_funny',cat:'bond',scope:'pair',
w:function(ctx,a){return(aid(a)==='explore'?0.55:0.08)+a.tr.fc*0.25+a.tr.impulse*0.15;},
run:function(ctx,a,b){
ctx.mod2(a,b,{aff:3},{aff:4,ten: -3});ctx.stress(a,-4);ctx.stress(b,-5);
return{text:T(ctx,pk(ctx,SOLO_FUNNY),a,b)+T(ctx,pk(ctx,SOLO_FUNNY_REACT),a,b),why:a.name+'のFC・衝動（一人の探索で起きた珍事）',mag:6};
}
},
{
id:'i_solo_gift',cat:'romance',scope:'pair',
when:function(ctx,a,b){var k=bondOf(ctx,a,b);return warm(k)||k==='rival'||k==='friend';},
w:function(ctx,a,b){return(aid(a)==='explore'?0.5:0.08)+R(ctx,a,b).att/120+R(ctx,a,b).aff/200;},
run:function(ctx,a,b){
var k=bondOf(ctx,a,b),rb=R(ctx,b,a);
var G={
love:['{a}は探索の帰りに見つけた桜色の貝殻を、黙って{b}の手のひらに載せた。{b}はそれを、寝床の枕元に置いた。','{a}は「誰にも教えてない場所」に{b}を連れていった。夕日がまっすぐ差し込む、小さな入り江だった。'],
pining:['{a}は森で摘んだ白い花を、「余ったから｜余った｜余りましたから」と言って{b}に渡した。同じ日の夕方、{b}も「たまたま見つけた｜＝｜たまたま見つけました」と言って、同じ白い花を{a}に差し出した。二人はしばらく、互いの手の花を見比べていた。',
'{a}は一番きれいな貝殻を拾って、{b}に渡そうとして、やめた。どうせ、ただの貝殻だと思われる。翌朝、{b}の枕元には、{b}が{a}に渡しそびれた貝殻がもう一つ並んでいた。',
'{a}は甘い木の実を「みんなに」と言って配り、いちばん熟れたのだけを{b}の分に回した。{b}は気づかなかったふりをした。{a}がそうするのは誰にでもだと、{b}は思い込んでいた。'],
crush:['{a}は森で摘んだ白い花を、渡すかどうか一時間迷った。結局「…落ちてた｜…落ちていた｜…落ちてました」と言って{b}に押しつけた。','{a}は一番形のいい貝殻を拾って、{b}に渡すためだけに遠回りして帰った。'],
rival:['{a}は探索で見つけた巨大な果実を、わざわざ{b}の目の前で齧った。{a}「探せばあるのに｜探せばある｜探せばあるんですけどね」{b}「…明日はもっとでかいの見つけてくる｜…明日はもっとでかいのを見つけてくる｜…明日はもっと大きいのを見つけてきます」','{a}は自作の島の地図を、{b}にだけ見せびらかした。'],
friend:['{a}は「{b}が好きそう｜{b}が好きそうだ｜{b}が好きそうです」と言って、変な形の流木を持ち帰った。{b}は大喜びで、それを拠点の入り口に飾った。','{a}は{b}のために、甘い木の実をポケットいっぱいに詰めて帰った。']
}[k];
var fx;
if(k==='rival')fx=function(){ctx.mod2(a,b,{ten:4,aff:2},{ten:6,aff:1});};
else if(k==='friend')fx=function(){ctx.mod2(a,b,{aff:5},{aff:6,trust:3});};
else fx=function(){ctx.mod2(a,b,{att:4},{att:k==='love'||rb.att>25?7:2,aff:4});};
fx();
return{cat:k==='rival'?'conflict':k==='friend'?'bond':'romance',text:T(ctx,pk(ctx,G),a,b),why:'探索の土産（'+BOND_WHY[k]+'）',mag:8};
}
}
]);
var DUO={
love:[
['{a}と{b}は、川を渡るとき自然に手を繋いだ。渡り終えても、どちらも手を離さなかった。',{att:6,aff:4},{att:6,aff:4},'romance'],
['{a}と{b}は、森の奥に青く光るラグーンを見つけた。{b}「ここ、二人だけの秘密にしよう｜ここは、二人だけの秘密にする｜ここ、二人だけの秘密にしましょう」',{att:5,trust:5},{att:5,trust:5},'romance','sec'],
['{a}は滑りやすい岩場で{b}を支えようとして、二人そろって潮だまりに落ちた。ずぶ濡れのまま、しばらく笑いが止まらなかった。',{aff:5,att:3},{aff:5,att:3},'romance']
],
pining:[
['{a}と{b}は二人きりで探索に出た。川を渡るとき、二人は同時に手を差し出し、同時に引っ込めた。結局、どちらも一人で渡った。',{att:4},{att:4},'romance'],
['崖の上で、{a}が「あのさ｜あのな｜あのですね」と言った。{b}も「あのさ｜あのな｜あのですね」と言った。{a}「…先どうぞ｜…先に言え｜…先にどうぞ」{b}「いや、たいしたことじゃないから｜いや、たいしたことではない｜いや、たいしたことじゃないですから」二人とも、言いかけたことの続きを言わないまま拠点に戻った。',{att:5},{att:5},'romance'],
['探索の帰り道、{b}が「疲れた｜＝｜疲れました」と言った。{a}は黙ってしゃがみ、背中を差し出した。背負われながら、{b}は「{a}は誰にでも優しい｜＝｜{a}は誰にでも優しいです」と思い、{a}は「{b}は誰にでも甘える｜＝｜{b}は誰にでも甘えます」と思っていた。',{att:6,trust:3},{att:6,trust:4},'romance'],
['森の奥で、{a}と{b}は夕立に降られて、狭い岩陰に二人で押し込まれた。肩が触れていた。{a}「…狭くてごめん｜…狭くてすまない｜…狭くてすみません」{b}「…こっちの台詞｜…こっちの台詞だ｜…こっちの台詞です」雨がやんでも、どちらもすぐには立ち上がらなかった。',{att:6,aff:3},{att:6,aff:3},'romance']
],
crush:[
['{a}は{b}と二人で探索に出られることになり、前の晩あまり眠れなかった。当日、{a}は緊張で三回転んだ。',{att:5},{aff:3},'romance'],
['{a}は{b}の前でいいところを見せようと崖の上の果実に手を伸ばし、落ちてきた果実を顔で受け止めた。{b}は声を上げて笑った。',{att:3,aff:2},{aff:5},'romance'],
['探索の帰り道、{b}が「疲れた｜＝｜疲れました」と言った。{a}は無言でしゃがんで背中を差し出した。拠点までの道のりは、行きより短く感じた。',{att:6},{att:4,trust:5},'romance']
],
rival:[
['{a}と{b}は、どっちの道が正しいかで三十分言い争い、別々の道を進んで、同じ場所で再会した。二人とも、何も言わなかった。',{ten:3,aff:2},{ten:3,aff:2},'conflict'],
['{a}と{b}は「どっちが多く食べ物を見つけるか｜どちらが多く食べ物を見つけるか｜どっちが多く食べ物を見つけるかです」で勝負した。結果は引き分けで、その日の夕食はいつもの倍だった。',{ten: -4,aff:4},{ten: -4,aff:4},'bond','food'],
['崖の途中で{a}の足場が崩れた。とっさに腕を掴んだのは{b}だった。{b}「…貸しだよ｜…貸しだぞ｜…貸しですよ」{a}「…わかってる｜…わかっている｜…わかっています」帰り道、二人はいつもより少しだけ並んで歩いた。',{trust:10,ten: -8},{trust:4,ten: -4},'help']
],
wary:[
['{a}は{b}と二人で崖沿いを歩くことになった。{a}はずっと、{b}より海側を歩かないように気をつけていた。{b}も同じことをしていた。',{ten:4},{ten:4},'conflict'],
['{b}が岩陰で何かを拾ってポケットに入れたのを、{a}は見逃さなかった。{a}「今の、何？｜今の、何だ｜今の、何ですか？」{b}「…貝殻｜＝｜…貝殻です」本当に貝殻だった。気まずい沈黙だけが残った。',{trust:2,ten:5},{trust: -4,ten:4},'conflict'],
['足をくじいた{a}に、{b}は黙って肩を貸した。{a}は、自分が{b}の何を疑っていたのか、思い出せなくなった。',{trust:12,aff:5},{trust:3},'help']
],
friend:[
['{a}が{b}を肩車して、高い枝のマンゴーをもぎ取った。二人の連携は完璧だった。帰りに{a}が「重かった｜＝｜重かったです」と言うまでは。',{aff:5,trust:4},{aff:4,trust:4},'bond','food'],
['{a}と{b}は難破船の残骸を探検して、船長室で古い望遠鏡を見つけた。二人は交代で「陸だー！｜陸だ！｜陸です！」と叫んで遊んだ。',{aff:6},{aff:6},'bond'],
['{a}と{b}は、探索中に見つけた一番変な形の石を拠点に持ち帰り、「島の神様」として祀った。翌日から、なぜか全員がそれに手を合わせるようになった。',{aff:5},{aff:5},'bond']
],
plain:[
['{a}と{b}は、黙々と森を歩いた。帰る頃には、好きな食べ物と嫌いな虫の話くらいはするようになっていた。',{aff:4,trust:3},{aff:4,trust:3},'bond'],
['{a}と{b}は、どちらが先に頂上に着くか競争して、頂上で二人とも倒れた。息が整うまで、空を見上げて笑っていた。',{aff:5},{aff:5},'bond'],
['{a}は{b}が意外なほど方向感覚がいいことを知った。{b}は{a}が意外なほど虫に弱いことを知った。',{trust:4,aff:3},{aff:3},'bond']
]
};
var GROUP=[
'{a}を隊長に、探検隊が結成された。地図を書き、隊旗を作り、隊歌まで決めたところで日が暮れた。探検は明日になった。',
'{a}の号令で島の奥地へ向かった探検隊は、「伝説の果樹園」を発見した。パイナップル畑だった。全員が無言で食べた。',
'{a}たちの探検隊は、島の地図を三人がそれぞれ書いた。三枚とも、まったく違う形の島になった。',
'{a}が先頭で藪をかき分けていると、後ろの{c}が「静かに｜静かにしろ｜静かにしてください」と言った。全員が息を殺した。巨大なヤドカリが一匹、横切っていった。',
'探検の途中、{a}が「今、誰か歌った？｜今、誰か歌ったか｜今、誰か歌いましたか？」と言った。誰も歌っていなかった。全員で走って帰った。翌朝、それが鳥の声だとわかった。'
];
isl.events=isl.events.concat([
{
id:'i_duo_explore',cat:'bond',scope:'pair',
when:function(ctx,a,b){return a.hp>20&&b.hp>20;},
w:function(ctx,a,b){
var e=(aid(a)==='explore'||aid(a)==='food'?0.5:0.1)+(aid(b)==='explore'||aid(b)==='food'?0.3:0);
return e+Math.abs(R(ctx,a,b).aff)/200+R(ctx,a,b).att/200+R(ctx,a,b).ten/250;
},
run:function(ctx,a,b){
var k=bondOf(ctx,a,b),L=pk(ctx,DUO[k]);
ctx.mod2(a,b,L[1],L[2]);
if(L[4]==='food')ctx.food+=8;
if(L[4]==='sec')ctx.pair(a,b).secret=true;
ctx.stress(a,-3);ctx.stress(b,-3);
return{cat:L[3],text:T(ctx,L[0],a,b),why:'二人で探索（'+BOND_WHY[k]+'）',mag:10};
}
},
{
id:'i_expedition',cat:'bond',scope:'solo',
when:function(ctx){return ctx.present().length>=3&& !(ctx.flags.expN>=2);},
w:function(ctx,a){return(aid(a)==='explore'||aid(a)==='gather'?0.35:0.06)+a.tr.lead*0.2+a.tr.fc*0.15;},
run:function(ctx,a){
ctx.flags.expN=(ctx.flags.expN||0)+1;
var others=ctx.others(a),c=others.length?pk(ctx,others):null;
others.forEach(function(o){ctx.mod2(a,o,{aff:3},{aff:3,trust:2});ctx.stress(o,-5);});
ctx.stress(a,-5);ctx.food+=4;
return{text:T(ctx,pk(ctx,c?GROUP:GROUP.filter(function(s){return s.indexOf('{c}')<0;})),a,null,c),why:a.name+'の主導性・FC（探検隊）',mag:8,with:c?[c]:null};
}
}
]);
var after0=isl.after;
isl.after=function(ctx,s,n){
after0(ctx,s,n);
adriftTurn(ctx);
};
HK.IslandSea={bondOf:bondOf};
})();
});
;
/* ==== js/island-love.js ==== */
HK.Load.def(192,'js/island-love.js',function(){
(function(){
'use strict';
var HK=window.HK,isl=HK.SCENARIOS&&HK.SCENARIOS.island;
if(!isl)return;
function L(s){return s.split('|');}
function R(ctx,a,b){return ctx.R(a,b);}
function ps(c){return(HK.personaOf?HK.personaOf(c):c.persona)||'gentle';}
function pk(ctx,o,c){var t=o[ps(c)]||o.gentle;return ctx.pick(t);}
var IL=HK.IslandLove=HK.IslandLove||{};
IL.confessPre=IL.confessPre||function(){return'';};
isl.catBias=Object.assign({},isl.catBias||{},{romance:1.8});
var T={
hardship:L('嵐で拠点の屋根が飛ばされた夜、{a}と{b}は一枚の布を二人で押さえ続けた。雨に打たれながら、何度も目が合った。朝になって嵐が去ったとき、{a}は{b}の横顔から目を離せなくなっていた。|崖の上で足を滑らせた{a}の腕を、{b}が掴んで引き上げた。二人で岩場に倒れ込み、しばらく息を整えた。「……ありがとう｜……助かった｜……ありがとうございます」と言った声が、自分でも驚くほど震えていた。|水が尽きかけた日、{a}と{b}は二人きりで島の奥まで水場を探しに出た。日暮れ近くにようやく湧き水を見つけて、二人で子どものように笑い合った。帰り道、{a}は{b}の手を引いていたことに、浜に着くまで気づかなかった。|食料の当番が{a}と{b}に回ってきた日、二人は朝から晩まで一緒に浜を歩いた。収穫は貝が少しだけだったのに、不思議と疲れなかった。焚き火の前で別れるとき、{a}はもう少し話していたかったと思った。'),
fire:L('火の番が{a}と{b}の二人になった夜、焚き火の音だけがしばらく続いた。やがて{b}が、島に来る前の暮らしの話をぽつりと始めた。{a}は相槌を打ちながら、炎に照らされた{b}の顔ばかり見ていた。|夜更けの焚き火の前で、{a}は{b}に毛布を半分かけた。「寒いでしょ｜寒いだろう｜寒いでしょう」と言うと、{b}は黙って肩を寄せてきた。触れた肩の温かさが、火よりずっと気になった。|{a}と{b}は焚き火のそばに並んで寝転がり、星の名前を言い合った。知っている星座はすぐに尽きて、二人で勝手な名前をつけ始めた。笑い声が止んだとき、{a}は隣の{b}の息遣いばかりを聞いていた。|満月の夜、{a}は眠れずに浜へ出た。波打ち際に先客がいて、それは{b}だった。二人は何も言わずに並んで座り、月が傾くまで海を見ていた。'),
care:L('{a}は日焼けで真っ赤になった{b}の背中に、潰したアロエを塗ってやった。{b}がくすぐったそうに身をよじるたびに、{a}の指先が熱くなった。塗り終えたあとも、{a}はしばらく手のひらの感触を忘れられなかった。|岩で足を切った{b}の傷を、{a}は真水で丁寧に洗った。{b}が痛みに顔をしかめると、{a}は「すぐ終わるから｜すぐ終わる｜すぐ終わりますから」と、{b}の手を握らせた。包帯代わりの布を巻き終えても、二人の手は離れなかった。|熱を出した{b}の額に、{a}は一晩じゅう濡らした布を当て続けた。朝方、目を覚ました{b}は、うたた寝する{a}の手が自分の手に重なっているのに気づいた。{b}は、その手をそっと握り返した。'),
jealous:L('{a}は、{c}と楽しそうに笑う{b}を、離れた場所から見ていた。胸の奥が、ちくりと痛んだ。その夜、{a}は焚き火の輪に加わらず、一人で寝床に入った。|{b}が{c}に釣った魚を分けているのを見て、{a}は持っていた薪を取り落とした。自分でも理由の分からない苛立ちに、{a}は戸惑った。拾い上げた薪を、{a}はいつもより強く火に放り込んだ。|浜で{b}と{c}が肩を並べて歩いているのを、{a}は見てしまった。何でもないことのはずだった。それなのに、その日の{a}は、誰とも口をきかなかった。'),
couple:L('{a}と{b}は、拠点の端に二人だけの寝床を作った。椰子の葉を重ねて、小さな屋根までつけた。誰も何も言わなかったが、皆が少しだけ温かい目で二人を見ていた。|{a}は浜で一番きれいな貝殻を拾って、紐を通して{b}の首にかけた。{b}は照れくさそうにそれを指でつまみ、「似合う？｜似合うか｜似合いますか？」と訊いた。{a}が頷くと、{b}は嬉しそうに笑った。|朝の漁から戻った{a}を、{b}が浜で待っていた。二人は獲れた魚を見せ合い、どちらが大きいかで言い合った。その言い合いさえ、どこか楽しそうだった。|夜、{a}と{b}は焚き火から少し離れたところで、手を繋いで座っていた。救助が来たら、という話を二人はしなかった。今は、この島の夜だけで十分だった。')
};
var CONF={
proud:L('{a}は{b}を浜の端まで呼び出し、腕を組んだまま言った。「……一度しか言わない。私は、{b}が好きだ」|{a}はそっぽを向いたまま、{b}に言った。「勘違いするなよ。……でも、{b}がいないと、調子が出ない」'),
stern:L('{a}は{b}の前に立ち、背筋を伸ばした。「けじめとして言っておく。私は、{b}に惹かれている」|{a}は焚き火の前で、{b}をまっすぐに見た。「中途半端は好まない。……{b}のことが、好きだ」'),
tsun:L('{a}は{b}に貝殻を押しつけた。「べ、別に深い意味はない。……ないけど、好き、かも」|{a}は真っ赤な顔で、{b}の袖を掴んだ。「勘違いしないで。……ただ、ずっと一緒にいたいだけ」'),
gentle:L('{a}は焚き火の明かりの中で、{b}の手をそっと取った。「ねえ、{b}。……ずっと、好きだった」|{a}は穏やかに微笑んで、{b}に言った。「この島に来てよかったって、初めて思えた。{b}がいたから」'),
devoted:L('{a}は{b}の前で、ぎゅっと手を握りしめた。「私なんかが言っていいのか分からないけど……{b}のことが、好きです」|{a}は{b}のために獲った魚を差し出しながら、小さな声で言った。「{b}の役に立ちたいんです。……ずっと、そばで」'),
cool:L('{a}は波打ち際で、{b}の隣に腰を下ろした。「……回りくどいのは苦手だ。{b}が好きだ」|{a}は火の番の終わりに、静かに言った。「ここ数日、気づくと{b}のことを考えている。……たぶん、そういうことだ」'),
free:L('{a}は浜で{b}の前に回り込み、満面の笑みで言った。「ねえ、{b}！　好き！　付き合って！」|{a}は{b}の手を引いて海に飛び込み、ずぶ濡れのまま笑った。「言っちゃう。{b}のこと、めちゃくちゃ好き」'),
shy:L('{a}は何度も口を開きかけては閉じ、やっと小さな声を出した。「あ、あの……{b}のこと……好き、です」|{a}は砂浜に指で文字を書いて、{b}に見せた。そこには「すき」とだけ書いてあった。{a}は顔を覆った。'),
polite:L('{a}は{b}の前で姿勢を正し、深く頭を下げた。「突然で失礼いたします。……{b}を、お慕いしております」|{a}は月明かりの中で、{b}に静かに告げた。「こんな場所で申し上げるのは不躾ですが……{b}のことが、好きです」')
};
var YES={
proud:L('{b}はしばらく黙っていたが、やがてふんと鼻を鳴らした。「遅い。……私のほうが、先に好きだった」|{b}は{a}の額を指で弾いた。「仕方ないな。……私の隣は、{a}にくれてやる」'),
stern:L('{b}は目を閉じて一つ息をつき、それからしっかりと頷いた。「受けよう。中途半端にはしない」|{b}は{a}の手を取った。「私も、同じ気持ちだ。……大切にする」'),
tsun:L('{b}は顔を真っ赤にして目を逸らした。「……し、知ってたし。私も、だし」|{b}は{a}の胸を軽く叩いた。「ばか。……もっと早く言ってよ」'),
gentle:L('{b}は目を細めて、{a}の手を包み込んだ。「うん。……私も、{a}のことが好き」|{b}は少し涙ぐんで、それから笑った。「嬉しい。……ありがとう、言ってくれて」'),
devoted:L('{b}は両手で口を覆い、何度も頷いた。「私で、いいんですか……？　嬉しい、です」|{b}は{a}の手を握り返した。「私も、ずっと{a}のことばかり考えていました」'),
cool:L('{b}は少しだけ目を見開き、それから小さく笑った。「……奇遇だ。私も、同じことを考えていた」|{b}は短く答えた。「いいよ。……断る理由が、見つからない」'),
free:L('{b}は{a}に飛びついた。「やった！　私も好き！　ずっと待ってた！」|{b}は声を上げて笑った。「えー、先に言われた！　もちろん、いいよ！」'),
shy:L('{b}は俯いたまま、小さく頷いた。耳まで真っ赤だった。「わ、私も……です」|{b}は{a}の袖をそっと掴んだ。言葉は出てこなかったが、その手は離れなかった。'),
polite:L('{b}は静かに微笑んで、丁寧に頭を下げた。「光栄です。……私も、お慕いしておりました」|{b}は{a}の手をそっと取った。「喜んで。……どうぞ、よろしくお願いいたします」')
};
var NO={
proud:L('{b}はきっぱりと首を振った。「悪いが、そういう目で見たことはない」|{b}は腕を組んだ。「気持ちは受け取っておく。……でも、応えられない」'),
stern:L('{b}は姿勢を正したまま答えた。「すまない。今は、誰ともそういう関係にはなれない」|{b}は目を逸らさずに言った。「誠実に答える。……私の気持ちは、そこにはない」'),
tsun:L('{b}は慌てて手を振った。「ちょ、ちょっと待って。……ごめん、そういうのじゃないから」|{b}は唇を噛んだ。「……嫌いじゃない。でも、ごめん」'),
gentle:L('{b}は困ったように眉を下げた。「ありがとう。……でも、ごめんね。{a}のことは、大切な仲間だから」|{b}は{a}の手をそっと離した。「気持ちは嬉しい。だけど、応えられない」'),
devoted:L('{b}は泣きそうな顔で頭を下げた。「ご、ごめんなさい……私、{a}にそんな気持ちは……」|{b}は何度も謝った。「ごめんなさい。{a}のことは好きだけど、そういう好きじゃなくて」'),
cool:L('{b}は少し考えてから、静かに首を振った。「……正直に言う。そういう感情は、ない」|{b}は淡々と答えた。「ありがとう。でも、応えるつもりはない。……すまない」'),
free:L('{b}は頭をかいた。「あー……ごめん！　{a}のことは好きだけど、友達としてなんだ」|{b}は申し訳なさそうに笑った。「ごめん、そういうのはピンとこないや」'),
shy:L('{b}は小さく後ずさり、首を横に振った。「ご、ごめんなさい……」と言うのが精一杯だった。|{b}は泣き出しそうな顔で俯いた。「私……まだ、そういうの、分からなくて……」'),
polite:L('{b}は深く頭を下げた。「お気持ちは大変ありがたいのですが……お受けできません」|{b}は申し訳なさそうに目を伏せた。「申し訳ございません。私には、もったいないお言葉です」')
};
var AFTER_YES=L('二人のあいだに、照れくさい沈黙が落ちた。波の音がやけに大きく聞こえた。やがてどちらからともなく、そっと手を繋いだ。|その夜、焚き火の輪の中で、二人の座る距離は昨日より近かった。誰も何も訊かなかった。それでも、皆が気づいていた。|遠くで誰かが口笛を吹いた。二人は慌てて離れて、それから顔を見合わせて笑った。');
var AFTER_NO=L('{a}は「そっか｜そうか｜そうですか」とだけ言って、笑ってみせた。浜に戻る足取りは、行きよりずっと重かった。その夜、{a}は火の番を代わってもらわなかった。|{a}は何も言わずに頷いた。一人で岩場まで歩いて、しばらく海を見ていた。波が、何度も足元を洗っていった。|気まずい空気が、しばらく二人のあいだに残った。それでも次の日、{b}はいつものように{a}に朝食を取り分けた。{a}には、それが少しだけ痛かった。');
function couple(ctx,a,b){return ctx.pair(a,b).couple;}
function tgt(ctx,a){
var C=ctx.others(a),best=null,bv= -1e9;
for(var i=0;i<C.length;i++){
var c=C[i],p=ctx.pair(a,c);
if(p.couple)return c;
if(HK.lockOut(a,c))continue;
if(p.kin||p.rejected===a.i|| !HK.canLove(a,c)|| !HK.canLove(c,a))continue;
var r=R(ctx,a,c),v=r.att+r.aff*0.4-r.ten*0.3+(p.chem||1)*8;
if(v>bv){bv=v;best=c;}
}
return best;
}
IL.target=tgt;
var add=function(o){
var when0=o.when,w0=o.w,run0=o.run;
isl.events.push({
id:o.id,cat:o.cat,scope:'self',
when:function(ctx,a){var b=tgt(ctx,a);return!!b&&ctx.romanceOk([a,b])&&when0(ctx,a,b);},
w:function(ctx,a){var b=tgt(ctx,a);return b?w0(ctx,a,b)*1.6:0;},
run:function(ctx,a){var b=tgt(ctx,a),r=run0(ctx,a,b);if(r)r.with=[b].concat(r.with||[]);return r;}
});
};
add({
id:'il_hardship',cat:'romance',scope:'pair',
when:function(ctx,a,b){return ctx.stepIndex>=1&&R(ctx,a,b).aff> -5&& !couple(ctx,a,b)&&R(ctx,a,b).att<60;},
w:function(ctx,a,b){return 0.35+(a.stress+b.stress)/260+(ctx.env.storm||0)/300+Math.max(0,R(ctx,a,b).aff)/200;},
run:function(ctx,a,b){
ctx.mod2(a,b,{att:9,aff:4,trust:3},{att:6,aff:4,trust:3});
ctx.stress(a,-6);ctx.stress(b,-6);
return{text:ctx.t(ctx.pick(T.hardship),a,b),why:'苦しい場面を一緒に越えた（ストレス '+Math.round(a.stress)+'・'+Math.round(b.stress)+'）。吊り橋のように、'+a.name+'が'+b.name+'を意識しはじめた'};
}
});
add({
id:'il_fire',cat:'romance',scope:'pair',
when:function(ctx,a,b){var r=R(ctx,a,b);return(r.att>10||r.aff>20)&& !couple(ctx,a,b)&&r.ten<55;},
w:function(ctx,a,b){var r=R(ctx,a,b);return 0.35+r.att/70+a.tr.warmth*0.3+a.tr.ac*0.2;},
run:function(ctx,a,b){
ctx.mod2(a,b,{att:8,aff:4},{att:6+b.tr.ac*4,aff:4});
return{text:ctx.t(ctx.pick(T.fire),a,b),why:a.name+'の温かさ（NP）と、'+b.name+'への惹かれ（'+Math.round(R(ctx,a,b).att)+'）。夜の焚き火が、二人の距離を縮めた'};
}
});
add({
id:'il_care',cat:'romance',scope:'pair',
when:function(ctx,a,b){return R(ctx,a,b).aff>12&& !couple(ctx,a,b);},
w:function(ctx,a,b){return 0.3+a.tr.np*0.5+(100-(b.hp==null?100:b.hp))/150;},
run:function(ctx,a,b){
ctx.mod2(a,b,{att:6,aff:5},{att:9,aff:6,trust:4});
if(b.hp!=null)b.hp=Math.min(100,b.hp+4);
return{text:ctx.t(ctx.pick(T.care),a,b),why:a.name+'の面倒見（NP）。手当てで触れた手が、'+b.name+'の胸を騒がせた'};
}
});
add({
id:'il_jealous',cat:'romance',scope:'pair',
when:function(ctx,a,b){
if(R(ctx,a,b).att<35||couple(ctx,a,b))return false;
return ctx.others(b).some(function(c){return c!==a&&(ctx.pair(b,c).couple||R(ctx,b,c).att>30||R(ctx,b,c).aff>45);});
},
w:function(ctx,a,b){return 0.25+a.tr.ac*0.4+R(ctx,a,b).att/120;},
run:function(ctx,a,b){
var cs=ctx.others(b).filter(function(c){return c!==a&&(ctx.pair(b,c).couple||R(ctx,b,c).att>30||R(ctx,b,c).aff>45);});
var c=cs.sort(function(x,y){return R(ctx,b,y).att+R(ctx,b,y).aff-R(ctx,b,x).att-R(ctx,b,x).aff;})[0];
ctx.mod(a,b,{att:5});ctx.mod(a,c,{ten:10,aff: -4});
return{text:ctx.t(ctx.pick(T.jealous),a,b,c),with:[c],why:a.name+'の'+b.name+'への惹かれ（'+Math.round(R(ctx,a,b).att)+'）。'+b.name+'と'+c.name+'の近さが、胸に刺さった'};
}
});
add({
id:'il_confess',cat:'romance',scope:'pair',
when:function(ctx,a,b){
var r=R(ctx,a,b),p=ctx.pair(a,b),fell=p.fellBy===a.i;
if(p.couple||p.confessed[a.i])return false;
if(HK.Poly&& !HK.Poly.canTry(ctx,a,b))return false;
return fell?r.att>30:r.att>42&&r.aff>26;
},
w:function(ctx,a,b){var p=ctx.pair(a,b);return 0.9+a.tr.honesty*1.2+a.tr.fc*0.4+a.stress/200+(p.fellBy===a.i?2.5:0)+R(ctx,a,b).att/80;},
run:function(ctx,a,b){
var p=ctx.pair(a,b),rb=R(ctx,b,a),fell=p.fellBy===a.i;
p.confessed[a.i]=true;
var ok=(rb.att>30&&rb.aff>20)||rb.att>46||(p.night&&rb.aff>25);
var t=IL.confessPre(ctx,a,b)+ctx.t(pk(ctx,CONF,a),a,b);
if(ok){
p.couple=true;
ctx.mod2(a,b,{aff:16,att:10,trust:10,ten: -10},{aff:16,att:12,trust:8,ten: -10});
t+=ctx.t(pk(ctx,YES,b),a,b)+ctx.t(ctx.pick(AFTER_YES),a,b);
return{mag:32,text:t,why:a.name+'が想いを告げた（惹かれ '+Math.round(R(ctx,a,b).att)+(fell?'・夜を過ごして恋に落ちた':'')+'）。'+b.name+'の側にも気持ちが育っていた（好意 '+Math.round(rb.aff)+'・惹かれ '+Math.round(rb.att)+'）'};
}
p.rejected=a.i;
ctx.mod2(a,b,{ten:12,att: -6},{ten:8,aff: -2});
ctx.stress(a,25);
t+=ctx.t(pk(ctx,NO,b),a,b)+ctx.t(ctx.pick(AFTER_NO),a,b);
return{mag:22,text:t,why:a.name+'が想いを告げた（惹かれ '+Math.round(R(ctx,a,b).att)+'）。'+b.name+'の気持ちはまだ育っていなかった（好意 '+Math.round(rb.aff)+'・惹かれ '+Math.round(rb.att)+'）'};
}
});
add({
id:'il_couple',cat:'romance',scope:'pair',
when:function(ctx,a,b){return couple(ctx,a,b);},
w:function(ctx,a,b){return 0.4+a.tr.warmth*0.3;},
run:function(ctx,a,b){
ctx.mod2(a,b,{aff:5,att:4,trust:3},{aff:5,att:4,trust:3});
ctx.stress(a,-5);ctx.stress(b,-5);
return{text:ctx.t(ctx.pick(T.couple),a,b),why:'恋人どうしになった'+a.name+'と'+b.name};
}
});
})();
});
;
/* ==== js/island-cheer.js ==== */
HK.Load.def(193,'js/island-cheer.js',function(){
(function(){
'use strict';
var HK=window.HK,isl=HK.SCENARIOS&&HK.SCENARIOS.island,G=HK.RelGroup;
if(!isl|| !G)return;
var L=G.L;
function R(ctx,a,b){return ctx.R(a,b);}
function ev(o){isl.events.push(o);}
function W(x){return function(ctx,a){return x+a.tr.np*0.15+(a.tr.warmth||0)*0.12;};}
function wish(ctx,b,not){return G.mutualOf(ctx,b,not)||G.crushOf(ctx,b,not);}
var T={
watch:L('夜の見張りの順番が{b}に回ってくると、{a}は黙って槍を取り上げた。「今夜は私が立つ。{c}のところに行ってきなよ｜今夜は私が立つ。{c}のところに行ってこい｜今夜は私が立ちます。{c}のところに行ってきてください」――{b}は何か言いかけて、結局、小さく頭を下げた。|{a}は{b}と見張りの番を代わった。焚き火のそばで{c}が待っているのを、{a}は知っていたからだ。夜明けまで海を見張りながら、{a}は時々、浜の二つの影を振り返った。|夜中、見張りに立とうとした{b}の肩を、{a}が後ろから押し戻した。「今夜は私。{c}が寒そうにしてた｜今夜は私が立つ。{c}が寒そうにしていた｜今夜は私が立ちます。{c}が寒そうにしていました」――{b}が戻っていくと、{c}は毛布の端を持ち上げて、隣を空けた。'),
share:L('潮だまりで貝を拾ってきた{a}は、{b}と{c}の器にだけ、こっそり二つずつ多く入れた。{b}が気づいて目を上げると、{a}は唇に指を当てた。二人はその晩、肩を寄せ合って同じ火で貝を焼いた。|{a}は獲れた魚のいちばん脂の乗ったところを切り分けて、{b}と{c}の前に置いた。「二人で食べて。私はさっき味見しすぎた｜二人で食べろ。私はさっき味見をしすぎた｜お二人で食べてください。私はさっき味見をしすぎました」――もちろん嘘だった。{b}と{c}は顔を見合わせてから、一切れを{a}の口に押し込んだ。|食料が乏しい日でも、{a}は{b}と{c}の分の椰子の実を、いちばん甘そうなものから選んで取っておいた。二人が並んで実を割るのを、{a}は少し離れた岩の上から眺めていた。それだけで、空腹が少しまぎれる気がした。'),
fire:L('その夜、{a}は大きなあくびをして、「先に寝る｜＝｜先に休みます」と言った。ほかの皆も、なぜか一斉に寝床に引き上げた。焚き火の前には、{b}と{c}だけが残された。|{a}は焚き火に太い流木を一本くべてから、「これで朝までもつ｜＝｜これで朝までもちます」と言って立ち上がった。去り際に{b}の肩をぽんと叩いた。火の粉が上がる中、{b}と{c}は少しずつ距離を詰めた。|夕食のあと、{a}は皆を誘って、浜の反対側へ流れ星を探しに行った。誘われなかった{b}と{c}は、焚き火の番として残された。戻ってきた{a}が見たのは、一枚の布にくるまって並んで眠る二人の姿だった。'),
work:L('翌日の分担を決めるとき、{a}は{b}と{c}を薪拾いの組にした。「二人なら、遠くの森まで行ける｜二人なら、遠くの森まで行けるだろう｜お二人なら、遠くの森まで行けるでしょう」――夕方、二人は約束の倍の薪を抱えて、笑いながら戻ってきた。|{a}は、水汲みの当番表の{b}の隣に、{c}の名前を書き足した。湧き水までの道は、二人で歩くには少し長い。その日、二人が戻ってきたのは、いつもよりずいぶん遅かった。|イカダの材料を集める組を、{a}はくじ引きで決めると言った。{b}と{c}が同じ組になったのは、偶然ではなかった。くじを作ったのは{a}だった。'),
gift:{
couple:L('{a}は何日もかけて白い貝殻を二つ選び抜き、細い蔓を通して首飾りを作った。焚き火の前で、{a}はそれを{b}と{c}に一つずつ手渡した。「お揃い。島で一番いい貝だから｜揃いだ。島で一番いい貝だからな｜お揃いです。島で一番いい貝ですから」|{a}は流木を削って、二人掛けの小さな椅子を作った。拠点の端の、夕日がいちばんよく見える場所にそれを据えると、{b}と{c}を手招きした。二人が腰を下ろすと、椅子は少しだけ傾いたが、二人にはちょうどいい幅だった。|{a}は椰子の葉を編んで、{b}と{c}の寝床に小さな屋根をかけた。雨の夜、二人の寝床だけが濡れずに済んだ。翌朝、{b}と{c}は、獲れたての魚を一匹ずつ{a}に差し出した。'),
bound:L('{b}と{c}の寝床が一つになったことに、皆とっくに気づいていた。{a}は代表して、花を編んだ冠を二つ作った。照れる二人の頭にそれを載せると、浜に小さな拍手が起きた。|{a}は海辺の岩に、{b}と{c}の名前を並べて刻んだ。「救助が来ても、これは残る｜＝｜救助が来ても、これは残ります」――{b}は黙って{a}を抱きしめ、{c}はその上から二人まとめて腕を回した。|{a}は浜で見つけた二枚貝の、ぴったり合う両側を{b}と{c}に一枚ずつ渡した。「片方だけじゃ閉じない貝。……二人みたい｜片方だけでは閉じない貝だ。……二人のようだな｜片方だけでは閉じない貝です。……お二人のようですね」――二人は貝殻を重ねて、照れくさそうに笑った。')
},
tease:L('朝、{b}と{c}が同じ方向から歩いてくるのを見て、{a}はにやりと笑った。「おはよう。今日も仲がよろしいことで｜おはよう。今日も仲がよろしいことだ｜おはようございます。今日も仲がよろしいことですね」――{b}は砂を蹴り、{c}は聞こえないふりをした。|{a}は、{b}と{c}が二人で編んだ不格好な籠を手に取って、しげしげと眺めた。「共同作業の成果、ってやつ？｜共同作業の成果、というやつか｜共同作業の成果、というものですか」――{b}が真っ赤になって籠を奪い返し、{c}は笑いをこらえきれずに背を向けた。{a}は、二人の籠がいちばん丈夫なのを知っていた。|浜で{b}が{c}の日焼けした背中に薬草を塗っているのを、{a}は遠くから眺めて口笛を吹いた。{b}が睨むと、{a}は両手を上げて退散した。退散しながら、{a}は二人に聞こえないくらいの声で、「よかったね｜よかったな｜よかったですね」と呟いた。'),
sea:{
pair:L('波の穏やかな昼下がり、{a}と{b}、{c}と{d}は、四人で海に入った。誰がいちばん遠くまで泳げるかで競争になり、結局全員で溺れかけて笑った。浜に上がると、二組はそれぞれの相手の髪から海藻を取ってやった。|浅瀬で、{a}と{b}の組と、{c}と{d}の組が、魚の手づかみ勝負をした。{b}が一匹捕まえると、{d}が負けじと二匹捕まえた。その日の夕食の魚は、いつもより少しだけ多かった。|{a}と{b}は、{c}と{d}を誘って入り江まで泳いだ。岩の上に四人で寝転がって、濡れた体を日に干した。誰からともなく、島を出たら四人でまた海に行こうという話になった。'),
group:L('{c}が「泳ぎに行こう｜泳ぎに行くぞ｜泳ぎに行きましょう」と言い出し、{a}と{b}を海へ引っ張っていった。{c}は二人に思い切り水をかけてから、さっさと沖へ逃げた。{a}と{b}は顔を見合わせて、二人がかりで{c}を追いかけた。|暑い昼下がり、{c}は{a}と{b}を誘って浅瀬に入った。{c}は潜って拾ってきたきれいな貝を、黙って{b}に渡した。それから{c}は、「{a}に渡しなよ｜{a}に渡せ｜{a}に渡してください」と目配せした。{b}は照れながら、それを{a}の手のひらに載せた。|{a}と{b}と{c}は、三人で波打ち際を歩いた。{c}はわざと二人の数歩前を歩き、時々振り返っては、並んで歩く二人をからかった。打ち寄せる波が、三人の足跡を順番に消していった。')
},
stars:{
pair:L('雲のない夜、{a}と{b}、{c}と{d}は、四人で砂浜に寝転んで星を見た。{c}が星座の名前を適当にでっち上げ、{b}がそれにさらに嘘を重ねた。笑い疲れた頃、二組はそれぞれ、相手の手を探して握っていた。|流れ星が一つ落ちた。{a}と{b}、{c}と{d}は、四人とも慌てて目を閉じた。何を願ったのかは、誰も言わなかったが、二組とも相手の顔をちらりと見ていた。|夜の浜で、{a}と{b}の組と{c}と{d}の組は、どちらが先に流れ星を見つけるかを競った。勝った{d}が{c}に抱きつき、負けた{a}と{b}は肩をすくめて笑った。夜風が冷たくなるまで、四人は空を見上げていた。'),
group:L('{c}は{a}と{b}を誘って、浜で星を見た。三人で並んで寝転ぶと、{c}は「流れ星には、二人の分も願っとく｜流れ星には、二人の分も願っておく｜流れ星には、お二人の分も願っておきます」と言った。{a}と{b}は、空を見上げたまま、そっと指を絡めた。|夜、{c}は焚き火から少し離れた砂の上に、三人分の寝転ぶ場所をならした。{a}と{b}を真ん中に寝かせて、{c}は端に転がった。星の名前を知っている者は誰もいなかったので、三人で勝手に名前をつけた。|{a}と{b}が並んで星を見ているところに、{c}が椰子の実を三つ抱えてやってきた。「お邪魔虫の差し入れ｜邪魔者からの差し入れだ｜お邪魔虫からの差し入れです」――{a}と{b}は笑って、{c}のために間を空けた。')
},
soudan:L('岩場で並んで釣り糸を垂らしながら、{b}は{a}に、{c}のことを打ち明けた。{a}は浮きから目を離さずに、最後まで聞いた。魚が一匹かかったのを合図に、{a}は口を開いた。|水汲みの帰り道、{b}は重い甕を下ろして、{a}に相談を持ちかけた。{c}の隣にいると、うまく息ができないのだという。{a}は甕を半分持ってやりながら、少し考えた。|夜、寝床で背中合わせになったとき、{b}が小声で{a}を呼んだ。{c}のことが頭から離れない、と{b}は言った。{a}は寝返りを打って、{b}のほうを向いた。'),
comfort:{
two:L('{b}の想いが届かなかった日の夕方、{a}と{d}は{b}を岬の先まで連れ出した。三人で何も言わずに、海に沈む夕日を見た。日が沈みきったとき、{b}がぽつりと「明日も、魚を獲る｜＝｜明日も、魚を獲ります」と言った。|{a}と{d}は、その晩の焚き火で、{b}の好物の貝ばかり焼いた。{b}は、食べきれないほどの貝の山を前に、少しだけ笑った。その夜、三人は火が消えるまで並んで座っていた。|翌朝、{b}が目を覚ますと、寝床の横に、{a}と{d}が集めてきた色とりどりの貝殻が並んでいた。砂の上には、拙い字で「＠＠元気出せ」と書いてあった。{b}は貝殻を一つずつ拾って、大事にしまった。'),
one:L('{b}の想いが届かなかったその夜、{a}は焚き火の番を代わってもらい、{b}の隣に座った。二人とも、しばらく黙って炎を見ていた。やがて{a}は、焼いた芋を半分に割って、大きいほうを{b}に渡した。|{a}は{b}を誘って、夜明け前の浜を歩いた。空が白んでいくのを、二人で黙って見ていた。朝日が水平線から顔を出したとき、{a}は{b}のほうを向いた。|岩場の陰で膝を抱えている{b}を見つけて、{a}は隣に腰を下ろした。波の音だけが、しばらく二人の間を埋めていた。{a}は{b}の肩に、自分の上着を掛けた。')
}
};
ev({
id:'is_watch',cat:'bond',scope:'pair',
when:function(ctx,a,b){var c=G.loveOf(ctx,b,a);return!!c&&G.thirdOk(ctx,a,b,c)&&G.once(ctx,'watch',[a,b,c]);},
w:W(0.45),
run:function(ctx,a,b){
var c=G.loveOf(ctx,b,a);G.mark(ctx,'watch',[a,b,c]);
ctx.mod2(b,c,{att:4,aff:3,trust:2},{att:4,aff:3,trust:2});ctx.mod(b,a,{trust:4,aff:3});ctx.stress(a,4);ctx.stress(b,-6);
return{with:[c],text:ctx.t(ctx.pick(T.watch),a,b,c),why:a.name+'が、'+b.name+'と'+c.name+'のために見張りを代わった（応援・仲良し）',mag:9};
}
});
ev({
id:'is_share',cat:'bond',scope:'pair',
when:function(ctx,a,b){var c=G.loveOf(ctx,b,a);return!!c&&G.thirdOk(ctx,a,b,c)&&(a.hp==null||a.hp>35)&&G.once(ctx,'share',[a,b,c]);},
w:W(0.4),
run:function(ctx,a,b){
var c=G.loveOf(ctx,b,a);G.mark(ctx,'share',[a,b,c]);
if(a.hp!=null)a.hp=Math.max(1,a.hp-2);
[b,c].forEach(function(x){if(x.hp!=null)x.hp=Math.min(100,x.hp+1);});
ctx.mod2(b,c,{aff:3,att:3},{aff:3,att:3});ctx.mod(b,a,{aff:4,trust:3});ctx.mod(c,a,{aff:3,trust:2});
return{with:[c],text:ctx.t(ctx.pick(T.share),a,b,c),why:a.name+'が、'+b.name+'と'+c.name+'に食べ物を多めに分けた（応援・仲良し）',mag:8};
}
});
ev({
id:'is_fire',cat:'bond',scope:'pair',
when:function(ctx,a,b){var c=G.loveOf(ctx,b,a);return!!c&&G.thirdOk(ctx,a,b,c)&&ctx.present().length>=3&&G.once(ctx,'fire',[a,b,c]);},
w:function(ctx,a,b){var c=G.loveOf(ctx,b,a);return(c&& !G.couple(ctx,b,c)?0.55:0.32)+a.tr.np*0.12;},
run:function(ctx,a,b){
var c=G.loveOf(ctx,b,a);G.mark(ctx,'fire',[a,b,c]);
ctx.mod2(b,c,{att:5,aff:3,trust:3},{att:5,aff:3,trust:3});ctx.mod(b,a,{trust:3});
return{with:[c],text:ctx.t(ctx.pick(T.fire),a,b,c),why:a.name+'が、夜の焚き火で'+b.name+'と'+c.name+'を二人きりにした（応援・仲良し）',mag:9};
}
});
ev({
id:'is_work',cat:'bond',scope:'pair',
when:function(ctx,a,b){var c=G.mutualOf(ctx,b,a);return!!c&&G.thirdOk(ctx,a,b,c)&&G.once(ctx,'work',[b,c]);},
w:function(ctx,a){return 2.2+a.tr.lead*0.6+a.tr.np*0.3;},
run:function(ctx,a,b){
var c=G.mutualOf(ctx,b,a);G.mark(ctx,'work',[b,c]);
ctx.mod2(b,c,{att:5,trust:4},{att:5,trust:4});
if(ctx.food!=null)ctx.food+=2;
return{with:[c],text:ctx.t(ctx.pick(T.work),a,b,c),why:a.name+'が、'+b.name+'と'+c.name+'を同じ作業に組んだ（応援・仲良し）',mag:8};
}
});
ev({
id:'is_gift',cat:'bond',scope:'pair',
when:function(ctx,a,b){var c=G.partnerOf(ctx,b,a);return!!c&&G.thirdOk(ctx,a,b,c)&&G.once(ctx,'gift',[b,c]);},
w:W(0.5),
run:function(ctx,a,b){
var c=G.partnerOf(ctx,b,a),st=G.stage(ctx,b,c);G.mark(ctx,'gift',[b,c]);
ctx.mod2(b,c,{aff:4,att:2},{aff:4,att:2});ctx.mod2(a,b,{aff:3},{aff:5,trust:4});ctx.mod2(a,c,{aff:3},{aff:5,trust:4});
[a,b,c].forEach(function(x){ctx.stress(x,-6);});
return{with:[c],text:ctx.t(ctx.pick(T.gift[st==='bound'?'bound':'couple'])+G.byPer(ctx,G.BLESS,a),a,b,c),why:a.name+'が、恋人どうしの'+b.name+'と'+c.name+'に手作りの贈り物をして祝福した（祝福・仲良し）',mag:11};
}
});
ev({
id:'is_tease',cat:'bond',scope:'pair',
when:function(ctx,a,b){var c=G.partnerOf(ctx,b,a);return!!c&&G.thirdOk(ctx,a,b,c)&&G.once(ctx,'tease',[a,b,c]);},
w:function(ctx,a){return 0.3+a.tr.fc*0.2;},
run:function(ctx,a,b){
var c=G.partnerOf(ctx,b,a);G.mark(ctx,'tease',[a,b,c]);
ctx.mod2(b,c,{att:3,aff:2},{att:3,aff:2});ctx.mod2(a,b,{aff:2},{aff:2,trust:2});ctx.stress(b,-4);ctx.stress(c,-4);
return{with:[c],text:ctx.t(ctx.pick(T.tease),a,b,c),why:a.name+'が、恋人どうしの'+b.name+'と'+c.name+'を冷やかした（冷やかし・仲良し）',mag:8};
}
});
function company(ctx,a,b){
var cd=G.otherCouple(ctx,a,b);
if(cd&&G.pairOk(ctx,cd[0],cd[1]))return{k:'pair',c:cd[0],d:cd[1]};
var f=G.here(ctx).filter(function(x){return G.thirdOk(ctx,x,a,b)&&G.thirdOk(ctx,x,b,a);});
return f.length?{k:'group',c:f[0],d:null}:null;
}
function outing(id,key,label,w0){
ev({
id:id,cat:'bond',scope:'pair',
when:function(ctx,a,b){return G.couple(ctx,a,b)&&G.pairOk(ctx,a,b)&& !!company(ctx,a,b)&&ctx.flags[id+'At']!==ctx.stepIndex&&(key!=='sea'||(ctx.env.storm||0)<75);},
w:function(){return w0;},
run:function(ctx,a,b){
var m=company(ctx,a,b),c=m.c,d=m.d;
ctx.flags[id+'At']=ctx.stepIndex;
ctx.mod2(a,b,{att:3,aff:3},{att:3,aff:3});
if(d)ctx.mod2(c,d,{att:2,aff:3},{att:2,aff:3});
[[a,c],[b,c]].concat(d?[[a,d],[b,d]]:[]).forEach(function(p){ctx.mod2(p[0],p[1],{aff:2,trust:2},{aff:2,trust:2});});
[a,b,c,d].forEach(function(x){if(x)ctx.stress(x,-6);});
var who=m.k==='pair'?a.name+'と'+b.name+'、'+c.name+'と'+d.name+'の二組で':c.name+'が、恋人どうしの'+a.name+'と'+b.name+'と一緒に';
return{with:d?[c,d]:[c],text:G.fill(ctx,ctx.pick(T[key][m.k]),a,b,c,d),why:who+label+'（'+(m.k==='pair'?'ダブルデート・':'みんなで・')+'仲良し）',mag:9};
}
});
}
outing('is_sea','sea','海に入った',0.5);
outing('is_stars','stars','星を見た',0.5);
ev({
id:'is_soudan',cat:'bond',scope:'pair',
when:function(ctx,a,b){var c=wish(ctx,b,a);return!!c&&G.thirdOk(ctx,a,b,c)&&G.friendly(ctx,b,a)&&G.once(ctx,'soudan',[a,b,c]);},
w:function(ctx,a,b){return 2+b.tr.honesty*0.6+(G.rel(ctx,a,b)?0.6:0);},
run:function(ctx,a,b){
var c=wish(ctx,b,a);G.mark(ctx,'soudan',[a,b,c]);
ctx.mod2(a,b,{trust:4,aff:2},{trust:5,aff:3});ctx.mod(b,c,{att:3});
return{with:[c],text:ctx.t(G.relLead(ctx,a,b)+ctx.pick(T.soudan)+G.byPer(ctx,G.CHEER,a),a,b,c),why:b.name+'が'+a.name+'に、'+c.name+'への想いを相談した（恋の相談・仲良し）',mag:8};
}
});
ev({
id:'is_comfort',cat:'bond',scope:'pair',
when:function(ctx,a,b){var x=G.turnedDown(ctx,b);return!!x&&x!==a&& !G.couple(ctx,a,b)&&R(ctx,a,b).att<40&&G.friendly(ctx,a,b)&&G.once(ctx,'comfort',[a,b]);},
w:function(ctx,a,b){return 2.5+a.tr.np*0.8+b.stress/100;},
run:function(ctx,a,b){
var x=G.turnedDown(ctx,b);G.mark(ctx,'comfort',[a,b]);
var d=ctx.present().filter(function(o){return o!==a&&o!==b&&o!==x&& !G.couple(ctx,o,b)&&R(ctx,o,b).att<40&&G.friendly(ctx,o,b)&&G.friendly(ctx,o,a);})[0]||null;
ctx.mod2(a,b,{aff:3,trust:3},{aff:5,trust:6});ctx.stress(b,-14);
if(d){ctx.mod2(d,b,{aff:3,trust:3},{aff:5,trust:5});ctx.mod2(a,d,{aff:2},{aff:2});}
var text=G.fill(ctx,G.relLead(ctx,a,b)+ctx.pick(T.comfort[d?'two':'one'])+G.byPer(ctx,G.COMFORT,a),a,b,null,d);
return{with:d?[d]:[],text:text,why:b.name+'の想いは届かなかった。'+a.name+(d?'と'+d.name:'')+'が励ました（励まし・仲良し）',mag:10};
}
});
})();
});
;
/* ==== js/island-love-r18.js ==== */
HK.Load.def(207,'js/island-love-r18.js',function(){
(function(){
'use strict';
var HK=window.HK,isl=HK.SCENARIOS&&HK.SCENARIOS.island,IL=HK.IslandLove;
if(!isl|| !IL)return;
function L(s){return s.split('|');}
function R(ctx,a,b){return ctx.R(a,b);}
function ps(c){return(HK.personaOf?HK.personaOf(c):c.persona)||'gentle';}
function pk(ctx,o,c){return ctx.pick(o[ps(c)]||o.gentle);}
function fill(t,a,b){return t.replace(/\{a\}/g,a.name).replace(/\{b\}/g,b.name);}
var REG={stern:0.65,polite:0.6,shy:0.5,cool:0.5,proud:0.45,tsun:0.36,gentle:0.18,devoted:0.12,free:0.06};
var FALL={devoted:0.55,gentle:0.46,shy:0.44,tsun:0.42,free:0.36,proud:0.28,polite:0.32,cool:0.26,stern:0.22};
var T_REG={
proud:L('翌朝、{a}は誰よりも早く起きて、昨夜の寝床を蹴散らすように片づけた。{b}と目が合うと、{a}は顔をしかめた。「……昨夜のことは忘れろ。あれは、島のせいだ」|{a}は朝の漁に出たまま、昼まで戻ってこなかった。戻ってくると、{b}の前を素通りした。「勘違いするなよ。一度きりだ」と、すれ違いざまに低く言った。'),
stern:L('翌朝、{a}は浜で長いあいだ海を見ていた。やがて{b}の前に来て、深く頭を下げた。「昨夜のことは、私の過ちだ。……二度と、あってはならない」|{a}はいつもより厳しい顔で、朝の点呼をした。{b}の名前を呼ぶときだけ、声がわずかに揺れた。そのあと{a}は{b}を呼び止め、「あれは、なかったことにしてほしい」と言った。'),
tsun:L('翌朝、{a}は{b}と目が合った瞬間、真っ赤になって背を向けた。「ち、違うから！　昨日のは、その……事故みたいなものだから！」|{a}は{b}が差し出した朝食を受け取らなかった。「昨夜のは、なし。……なしだから」と言い張る声は、少しだけ震えていた。'),
gentle:L('翌朝、{a}は困ったように笑って、{b}に言った。「昨夜のこと……私たち、少しどうかしてたね」その笑顔は、どこか寂しそうだった。|{a}は{b}の分の水を汲みながら、ぽつりと言った。「大切な仲間だから、こういうのは……もう、やめておこう」'),
devoted:L('翌朝、{a}は{b}の前で何度も謝った。「ごめんなさい、私、あんなことをするつもりじゃ……」{b}が何か言う前に、{a}は逃げるように浜へ駆けていった。|{a}は朝から{b}を避けていた。夕方になってようやく、「昨夜のことは、忘れてください」とだけ伝えた。'),
cool:L('翌朝、{a}はいつもと変わらない顔で火を起こしていた。{b}が隣に座ると、{a}は淡々と言った。「昨夜のは、判断を誤った。……繰り返すつもりはない」|{a}は{b}に、昨夜のことをどう思っているかと訊かれた。{a}は少し黙ってから、「間違いだった」とだけ答えた。'),
free:L('翌朝、{a}は珍しく浮かない顔をしていた。{b}に声をかけられると、{a}は頭をかいた。「昨夜のは、ノリっていうか……ごめん、ちょっと違ったかも」|{a}は{b}に、あっけらかんと言った。「昨日のは、なかったことにしよっか。気まずいの、嫌だし」笑ってはいたが、目は笑っていなかった。'),
shy:L('翌朝、{a}は寝床から出てこなかった。{b}が様子を見に行くと、{a}は毛布を頭までかぶったまま、小さな声で言った。「き、昨日のことは……忘れて、ください……」|{a}は一日じゅう、{b}と目を合わせられなかった。夜になって、{a}はやっと口を開いた。「あれは、間違いで……私、そういうつもりじゃ……」'),
polite:L('翌朝、{a}は乱れた身なりを丁寧に整えてから、{b}の前に立った。「昨夜は、大変な失礼をいたしました。……どうか、お忘れください」|{a}は{b}に深々と頭を下げた。「あのようなことは、二度とあってはなりません」顔を上げた{a}の頬は、まだ少し赤かった。')
};
var T_FALL={
proud:L('翌朝から、{a}はなぜか{b}の姿ばかり目で追っていた。気づくたびに舌打ちして、目を逸らした。それでも、また目が{b}を探していた。|{a}は{b}が別の誰かと笑っているのを見て、持っていた銛を握りしめた。認めたくなかった。けれど、もう誤魔化せなかった。'),
stern:L('翌朝、{a}は自分の胸の高鳴りに戸惑っていた。一夜のことと割り切るつもりだった。けれど{b}の声を聞くたびに、その決意が崩れていった。|{a}は手帳の端に、何度も{b}の名前を書いては消した。けじめをつけなければならない、と{a}は思った。'),
tsun:L('翌朝、{a}は{b}の顔を見るたびに、昨夜のことを思い出して真っ赤になった。「べ、別に意識なんてしてない」と誰にともなく言った。してないはずなのに、胸がうるさかった。|{a}は{b}のために一番大きな魚を焼いて、黙って押しつけた。理由を訊かれても、答えられなかった。'),
gentle:L('翌朝、{a}は{b}の寝顔を見つめたまま、しばらく動けなかった。この人のことが好きなのだと、静かに分かった。{a}は{b}の髪についた砂を、そっと払った。|{a}は一日じゅう、{b}のことばかり考えていた。焚き火の前で、{a}は小さく笑った。こんな気持ちは、久しぶりだった。'),
devoted:L('翌朝から、{a}は{b}のために何でもしたくなった。水を汲み、寝床を整え、一番いい貝を取っておいた。{b}に「ありがとう」と言われるたびに、胸がいっぱいになった。|{a}は{b}の背中を見つめながら、もう戻れないと思った。昨夜から、{a}の世界の真ん中には{b}がいた。'),
cool:L('翌朝、{a}は自分が{b}のことばかり考えていることに気づいた。一度きりのことだと、理屈では分かっていた。理屈では、どうにもならなかった。|{a}は{b}が漁から戻るのを、浜でずっと待っていた。待っている理由を、{a}は自分でもうまく説明できなかった。'),
free:L('翌朝、{a}は{b}を見るなり、満面の笑みで手を振った。昨夜から、{b}のことが頭から離れなかった。こんなに誰かに夢中になるのは、初めてだった。|{a}は{b}のあとをついて回った。「なんか、{b}といると楽しいんだよね」と笑った。その笑顔は、昨日までと少し違っていた。'),
shy:L('翌朝、{a}は{b}と目が合うたびに、慌てて俯いた。昨夜の{b}の声が、耳から離れなかった。{a}は、自分が恋に落ちたのだと気づいた。|{a}は{b}の後ろ姿を、物陰からそっと見つめていた。話しかけたいのに、言葉が出てこなかった。胸の奥が、ずっと温かかった。'),
polite:L('翌朝、{a}は{b}に挨拶をしようとして、声が上ずった。昨夜から、{b}のことを考えない時間がなかった。{a}は、自分の気持ちに名前がついたことを知った。|{a}は{b}の分の朝食を、いつもより丁寧に取り分けた。手が触れたとき、{a}の頬が赤く染まった。')
};
var T_ASK=L('焚き火が小さくなった頃、{a}は{b}の隣に座り、そっと手を重ねた。|夜の浜で、{a}は{b}を呼び止めた。「……今夜も、一緒にいたい」|寝床に戻ろうとする{b}の手首を、{a}が掴んだ。');
var T_REFUSE={
proud:L('{b}はその手を振り払った。「一度きりだと言っただろう」――{b}は背を向けて、自分の寝床へ戻っていった。|{b}は{a}を睨みつけた。「調子に乗るな。あれは、もう終わったことだ」'),
stern:L('{b}は静かに首を振った。「同じ過ちは、繰り返さない」――そう言って、{b}は{a}から一歩離れた。|{b}は{a}の手をそっと外した。「すまない。……けじめは、守らせてくれ」'),
tsun:L('{b}は真っ赤になって{a}の手をはねのけた。「だ、だめ！　昨日のはなしって言ったでしょ！」|{b}は顔を背けた。「……ばか。そういうの、ずるいから」それでも、{b}はその場を離れなかった。'),
gentle:L('{b}は困ったように微笑んで、{a}の手を両手で包んだ。「ごめんね。……今夜は、やめておこう」|{b}は{a}の頬に触れかけて、手を止めた。「優しくしてくれるのは嬉しい。でも、もう少しだけ待って」'),
devoted:L('{b}は泣きそうな顔で首を振った。「ごめんなさい……私、また流されてしまいそうで、怖いんです」|{b}は{a}から目を逸らした。「{a}のことは、大事です。だから、もう間違えたくないんです」'),
cool:L('{b}は表情を変えずに言った。「やめておこう。……あれは、繰り返すべきじゃなかった」|{b}は{a}の手を見下ろして、静かに外した。「冷静になれ。お互いのためだ」'),
free:L('{b}は少し困ったように笑った。「うーん、今日はパス！　……ごめん、ちょっとまだ整理できてない」|{b}は{a}の手をぶんぶん振ってから離した。「また今度、ね。今度があれば、だけど」'),
shy:L('{b}はびくりと肩を震わせて、手を引っ込めた。「ご、ごめんなさい……まだ、無理です……」|{b}は真っ赤な顔で俯いた。「き、昨日のこと、まだ……ちゃんと考えられなくて……」'),
polite:L('{b}は丁寧に頭を下げた。「申し訳ございません。昨夜のようなことは、もう……」|{b}は{a}の手を取って、そっと戻した。「お気持ちは嬉しいのです。ですが、どうかご容赦ください」')
};
var T_REFUSE_AFTER=L('{a}はそれ以上何も言わずに、寝床へ戻った。眠れない夜が、長く続いた。|残された{a}は、小さくなった焚き火をしばらく見つめていた。波の音が、やけに耳についた。|二人のあいだに、ぎこちない沈黙が落ちた。それでも翌朝、{b}は{a}に朝食を取り分けた。');
var T_GIVE={
proud:L('「……一度きりだと言ったはずなのにな」と{b}は苦く笑った。そして、自分から{a}の襟を掴んで引き寄せた。|{b}は長いあいだ{a}を睨んでいた。やがて小さく息を吐いた。「お前のせいだ。……全部、お前のせいだ」'),
stern:L('{b}は目を閉じて、長く息を吐いた。「あれを過ちだと言った私が、間違っていたのかもしれない」――{b}は、{a}の手を取った。|{b}はしばらく黙っていた。それから、まっすぐに{a}を見た。「けじめは、自分でつける。……今夜は、そばにいてほしい」'),
tsun:L('{b}は真っ赤な顔で、{a}の袖を掴んだ。「か、勘違いしないで。……今夜だけ、特別だから」|{b}は唇を噛んで、それから小さく言った。「……もう一回くらい、いいでしょ」'),
gentle:L('{b}は少し泣きそうな顔で笑った。「やめておこうって言ったのに……私のほうが、我慢できなかったね」|{b}は{a}の頬に手を添えた。「ずっと考えてた。……やっぱり、{a}がいい」'),
devoted:L('{b}は震える声で言った。「間違いだって、自分に言い聞かせてきました。……でも、もう無理です」|{b}は{a}の胸に額を押しつけた。「また流されるんじゃなくて……今度は、自分で選びたいんです」'),
cool:L('{b}は小さく首を振った。「繰り返すべきじゃないと言ったな。……撤回する」|{b}は{a}をまっすぐに見た。「考えた。何度も考えた。……結論は、変わらなかった」'),
free:L('{b}は頭をかいて笑った。「やっぱ無理！　なかったことにするの、もうやめた！」|{b}は{a}に抱きついた。「ごめん、強がってた。……ほんとは、ずっとこうしたかった」'),
shy:L('{b}は消え入りそうな声で言った。「わ、私……あれから、ずっと……」――それ以上は言葉にならず、{b}は{a}の手をきゅっと握った。|{b}は{a}の袖を引いて、俯いたまま言った。「……こ、今夜は、いい、です」'),
polite:L('{b}は姿勢を正して、静かに告げた。「あの夜を過ちと申しましたが……撤回させてください」|{b}は{a}の手を両手で包んだ。「はしたないと思われても構いません。……今夜は、おそばにいさせてください」')
};
var T_CONF_PRE=L('あの夜から、{a}は{b}のことばかり考えていた。一夜のことだと割り切るには、気持ちが大きくなりすぎていた。{a}は、もう黙っていられなかった。|{a}は眠れない夜をいくつも過ごした。目を閉じるたびに、あの夜の{b}が浮かんだ。{a}は浜で{b}を呼び止めた。|{a}は何日も迷った末に、{b}の前に立った。あの夜がなければ、気づかなかった気持ちだった。');
IL.confessPre=function(ctx,a,b){return ctx.pair(a,b).fellBy===a.i?fill(ctx.pick(T_CONF_PRE),a,b):'';};
function aftermath(ctx,a,b,was){
var p=ctx.pair(a,b);
if(p.couple&&was.couple)return'';
if(was.couple||(HK.Ties&&HK.Ties.has&&HK.Ties.has(ctx,a,b,'fwb'))||HK.lockTo(a,b)||HK.lockTo(b,a))return'';
var out='',rng=ctx.rng;
var two=rng()<0.5?[a,b]:[b,a];
for(var k=0;k<2;k++){
var x=two[k],y=two[1-k],rx=R(ctx,x,y);
if(p.regret==null&&p.fellBy==null&&rng()<(REG[ps(x)]||0.2)+Math.max(0,x.tr.cp-0.5)*0.4-rx.att/400){
p.regret=x.i;p.regretAt=ctx.stepIndex;
if(!was.couple)p.couple=false;
ctx.mod2(x,y,{ten:10,att: -4},{ten:6});
return fill(pk(ctx,T_REG,x),x,y);
}
}
for(k=0;k<2;k++){
x=two[k];y=two[1-k];
if(p.couple||p.fellBy!=null)break;
if(rng()<(FALL[ps(x)]||0.2)+x.tr.ac*0.12+(60-Math.min(60,R(ctx,x,y).att))/400){
p.fellBy=x.i;
ctx.mod(x,y,{att:24,aff:12});
out=fill(pk(ctx,T_FALL,x),x,y);
break;
}
}
return out;
}
function wrap(id){
if(HK.atEvent){HK.atEvent(isl,id,wrapEv);return;}
var e0=isl.events.filter(function(e){return e.id===id;})[0];
if(e0)wrapEv(e0);
}
function wrapEv(ev){
var when0=ev.when,run0=ev.run;
ev.when=function(ctx,a,b){
var p=ctx.pair(a,b);
if(p.regret!=null){
var x=p.regret===a.i?a:b,y=x===a?b:a,r=R(ctx,x,y);
if(!(r.aff>52&&r.att>40&&ctx.stepIndex-p.regretAt>=2))return false;
}
return when0.apply(this,arguments);
};
ev.run=function(ctx,a,b){
var p=ctx.pair(a,b),was={couple: !!p.couple},give='';
if(p.regret!=null){
var x=p.regret===a.i?a:b,y=x===a?b:a;
give=fill(pk(ctx,T_GIVE,x),y,x);
p.regret=null;p.gaveIn=x.i;
p.couple=true;
}
var r=run0.apply(this,arguments);
if(!r|| !r.text)return r;
if(give){r.text=give+r.text;r.why=(r.why||'')+'。一度は過ちと言った'+(p.gaveIn===a.i?a.name:b.name)+'が、好意の深さに折れた';return r;}
var am=aftermath(ctx,a,b,was);
if(am){
r.text+=(/\n\n/.test(r.text)?'\n\n':'')+am;
r.why=(r.why||'')+(p.regret!=null?'。'+ctx.chars[p.regret].name+'は、この夜を過ちと考えた（態度・CP）':p.fellBy!=null?'。'+ctx.chars[p.fellBy].name+'は、この夜をきっかけに恋に落ちた':'');
}
return r;
};
}
wrap('ir18_night');
wrap('ir18_sit');
function refTgt(ctx,a){
var C=ctx.others(a);
for(var i=0;i<C.length;i++){
var b=C[i],p=ctx.pair(a,b);
if(p.regret===b.i&&R(ctx,a,b).att>35&&(p.refusedAt==null||ctx.stepIndex-p.refusedAt>=2)&&ctx.romanceOk([a,b]))return b;
}
return null;
}
HK.addTo(isl.events,{
id:'il18_refuse',cat:'romance',scope:'self',r18:true,
when:function(ctx,a){return!!refTgt(ctx,a);},
w:function(ctx,a){var b=refTgt(ctx,a);return b?0.8+R(ctx,a,b).att/60+a.tr.impulse*0.4:0;},
run:function(ctx,a){
var b=refTgt(ctx,a),p=ctx.pair(a,b);
p.refusedAt=ctx.stepIndex;
ctx.mod2(a,b,{ten:6,att:3},{ten:4,aff:3});
ctx.stress(a,10);
return{with:[b],text:fill(ctx.pick(T_ASK),a,b)+fill(pk(ctx,T_REFUSE,b),a,b)+fill(ctx.pick(T_REFUSE_AFTER),a,b),why:b.name+'は、あの夜を過ちと考えている（'+(HK.PERSONA&&HK.PERSONA[ps(b)]?HK.PERSONA[ps(b)].label:ps(b))+'）。好意が深くなるまで、二度目は受け入れない（'+b.name+'→'+a.name+' 好意 '+Math.round(R(ctx,b,a).aff)+'）',mag:18};
}
});
})();
});
;
/* ==== js/incidents-survival.js ==== */
HK.Load.def(383,'js/incidents-survival.js',function(){
(function(){
'use strict';
var HK=window.HK;
HK.INCIDENTS=HK.INCIDENTS||{};
function R(ctx,a,b){return ctx.R(a,b);}
function names(list){return list.map(function(c){return c.name;}).join('・');}
function hurt(ctx,c,v,how){c.hp-=v;if(c.hp<=0&&c.alive)ctx.kill(c,null,how);}
function without(list,x){return list.filter(function(c){return x.indexOf?x.indexOf(c)<0:c!==x;});}
function fav(ctx,a,pool){
var best=null,bv=25;
pool.forEach(function(o){if(o===a)return;var r=R(ctx,a,o),v=r.aff*0.6+r.att;if(v>bv){bv=v;best=o;}});
return best;
}
HK.INCIDENTS.island=[
{
id:'storm',once:false,
force:function(ctx,s){return s>0&&ctx.rng()<ctx.env.storm/100*0.38;},
run:function(ctx){
var P=ctx.present(),rng=ctx.rng;
ctx.incident('夜半から嵐になった。雨が横殴りに叩きつけ、拠点の屋根が軋んでいる。');
var weak=P.slice().sort(function(x,y){return x.hp-y.hp;})[0];
var guard=ctx.most(without(P,[weak]),function(c){return c.tr.np+c.tr.cp*0.3;});
var keeper=ctx.most(without(P,[weak,guard]),function(c){return c.tr.a+c.tr.caution*0.5;});
var panic=ctx.most(P,function(c){return c.tr.ac*0.6+c.tr.impulse*0.4+c.stress/100;});
var loner=ctx.most(P,function(c){return c.tr.cold;});
var spared={};
if(guard&&guard.tr.np>0.45){
spared[weak.i]=1;
ctx.act2({actors:[guard,weak],cat:'help',fx:function(){hurt(ctx,guard,6,'嵐の中で'+weak.name+'をかばい続けた');ctx.mod2(guard,weak,{aff:4},{aff:12,trust:14,att:4});},
text:ctx.t('{a}は、一番弱っていた{b}を壁際に押しやり、自分の体で雨風を受けた。',guard,weak),why:guard.name+'のNP（'+Math.round(guard.eg.NP)+'）。'+weak.name+'の体力が最も低かった'});
}
var saved=false;
if(keeper&&keeper.tr.a>0.5){
saved=true;
ctx.act2({actors:[keeper],cat:'help',fx:function(){ctx.others(keeper).forEach(function(o){ctx.mod(o,keeper,{trust:4});});},
text:ctx.t('{a}は真っ先に食料を岩陰へ運んでいた。人より先に物資を守る判断だった。',keeper),why:keeper.name+'のA（'+Math.round(keeper.eg.A)+'）：優先順位をつけるのが早い'});
}
if(panic&&panic.stress>25&&panic.tr.ac+panic.tr.impulse>0.9){
var holder=ctx.closest(panic);
ctx.act2({actors:[panic,holder],cat:'solo',fx:function(){if(holder)ctx.mod2(panic,holder,{trust:8,att:3},{aff:3});ctx.stress(panic,10);},
text:holder?ctx.t('{a}が叫んで外へ飛び出しかけた。{b}がその腕を掴んで引き戻した。',panic,holder):ctx.t('{a}は叫び声を上げて、膝を抱えた。',panic),
why:panic.name+'のAC・衝動性と溜まった焦り（'+Math.round(panic.stress)+'）'});
}
if(loner&&loner.tr.cold>0.65&&loner!==guard){
ctx.act2({actors:[loner],cat:'solo',fx:function(){ctx.others(loner).forEach(function(o){ctx.mod(o,loner,{aff: -5,ten:4});});},
text:ctx.t('朝になって、{a}が一人で奥の洞窟に避難していたことが分かった。',loner),why:loner.name+'のドライさ（A高・NP低）'});
}
ctx.food=Math.max(0,ctx.food-(saved?6:16));
P.forEach(function(c){
if(!c.alive||spared[c.i])return;
c.stress=HK.clamp(c.stress+12,0,100);
hurt(ctx,c,5+rng()*10*(1.4-ctx.stat(c,'hp')*0.15),'嵐の夜に力尽きた');
});
ctx.say({text:saved?'嵐が去ったあと確かめると、食料はなんとか半分残っていた。':'嵐が去ったあと確かめると、蓄えていた食料の多くが波にさらわれていた。'});
}
},
{
id:'famine',
force:function(ctx,s){return s>=2&&ctx.food<8;},
min:2,
run:function(ctx){
var P=ctx.present();
ctx.incident(ctx.few()?'食料が底をついた。二人は焚き火の前で顔を見合わせた。':'食料が底をついた。全員が焚き火の前に集まった。');
var lead=ctx.most(P,function(c){return c.tr.lead;});
ctx.act2({actors:[lead],cat:'conflict',fx:function(){
ctx.others(lead).forEach(function(o){if(o.tr.fc>0.6&&o.tr.ac<0.5)ctx.mod(o,lead,{ten:10});else ctx.mod(o,lead,{trust:5});});
},text:ctx.t('{a}が配給制を提案した。一日に貝ふたつ。反論する者もいたが、他に案はなかった。',lead),why:lead.name+'の主導性（CP・A）'});
var giver=ctx.most(without(P,[lead]).concat(lead),function(c){return c.tr.np-c.tr.cold*0.5;});
var weak=P.slice().sort(function(x,y){return x.hp-y.hp;})[0];
if(giver&&giver!==weak&&giver.tr.np>0.55){
ctx.act2({actors:[giver,weak],cat:'help',mag:10,fx:function(){giver.hp-=10;weak.hp=Math.min(100,weak.hp+10);ctx.mod2(giver,weak,{aff:5},{aff:16,trust:16,att:6});},
text:ctx.t('その夜、{a}は自分の分を黙って{b}の横に置いた。{b}が気づいたのは翌朝だった。',giver,weak),why:giver.name+'のNP（'+Math.round(giver.eg.NP)+'）。自分の体力（'+Math.round(giver.hp)+'）より相手を優先した'});
}
var grab=ctx.most(P,function(c){return c.tr.aggr*0.6+c.tr.cold*0.4;});
if(grab&&grab.tr.aggr>0.6&&grab!==giver){
var who=ctx.most(ctx.others(grab),function(o){return o.tr.cp+o.tr.a*0.5;});
ctx.act2({actors:[grab,who],cat:'conflict',fx:function(){grab.hp+=6;ctx.others(grab).forEach(function(o){ctx.mod(o,grab,{trust: -12,ten:10});});ctx.mod2(who,grab,{ten:15},{ten:10});},
text:ctx.t('配給の貝を一つ余計に取った{a}を、{b}が見逃さなかった。「数えてるんだよ｜数えているんだ｜数えているんですよ」',grab,who),why:grab.name+'の攻撃性・ドライさ／'+who.name+'のCP・A（不正を許さない）'});
}
ctx.food+=6;
P.forEach(function(c){c.stress=HK.clamp(c.stress+10,0,100);});
}
},
{
id:'crate',from:1,
run:function(ctx){
var P=ctx.present(),rng=ctx.rng;
var kinds=['酒','ナイフ','無線機','日記','缶詰'];
var kind=rng.pick(kinds);
var label={'酒':'ウイスキーの瓶が三本','ナイフ':'大ぶりのナイフが一本','無線機':'壊れた無線機','日記':'前にこの島へ流れ着いた誰かの日記','缶詰':'缶詰が十数個'}[kind];
var opener=ctx.most(P,function(c){return c.tr.fc+c.tr.impulse*0.5;});
ctx.incident('浜に木箱が打ち上げられていた。');
ctx.act2({actors:[opener],cat:'solo',text:ctx.t('真っ先に駆け寄って蓋をこじ開けたのは{a}だった。中には、'+label+'。',opener),why:opener.name+'のFC（好奇心）'});
if(kind==='酒'){
var pairs=[];
ctx.act2({actors:P,cat:'bond',fx:function(){
P.forEach(function(a){ctx.stress(a,-18);P.forEach(function(b){if(a!==b&&R(ctx,a,b).att>20){ctx.mod(a,b,{att:7});pairs.push([a,b]);}});});
},text:'その夜は小さな宴になった。久しぶりに誰かが笑った。',why:'酒と島の緊張の反動'});
var drunk=ctx.most(P,function(c){return c.tr.impulse+c.tr.honesty*0.5;});
var tg=fav(ctx,drunk,P);
if(tg)ctx.act2({actors:[drunk,tg],cat:'romance',fx:function(){ctx.mod2(drunk,tg,{att:6},{att:R(ctx,tg,drunk).att>25?10:2,aff:3});},
text:ctx.t('酔った{a}が{b}の肩にもたれて、何か言いかけて、やめた。',drunk,tg),why:drunk.name+'の衝動性と、'+tg.name+'への惹かれ（'+Math.round(R(ctx,drunk,tg).att)+'）'});
}else if(kind==='ナイフ'){
var taker=ctx.most(P,function(c){return c.tr.cp+c.tr.aggr*0.6;});
ctx.act2({actors:[taker],cat:'conflict',fx:function(){
taker.flags.knife=true;
ctx.others(taker).forEach(function(o){if(o.tr.caution>0.55)ctx.mod(o,taker,{ten:10,trust: -6});else ctx.mod(o,taker,{trust:3});});
},text:ctx.t('ナイフは{a}が預かることになった。「私が持ってるのが一番安全｜私が持っているのが一番安全だ｜私が持っているのが一番安全です」と言って。',taker),why:taker.name+'のCP×攻撃性。慎重な者ほど警戒した'});
}else if(kind==='無線機'){
var fixer=ctx.most(P,function(c){return c.tr.a+ctx.stat(c,'know')*0.15;});
var ok=rng()<0.2+ctx.stat(fixer,'know')*0.1+fixer.tr.a*0.25;
ctx.act2({actors:[fixer],cat:'escape',mag:ok?25:0,fx:function(){
if(ok){ctx.flags.radio=true;P.forEach(function(o){ctx.stress(o,-20);if(o!==fixer)ctx.mod(o,fixer,{trust:10,aff:6});});}
else ctx.stress(fixer,10);
},text:ok?ctx.t('{a}が二晩かけて無線機を直した。雑音の向こうで、確かに誰かが応答した。',fixer):ctx.t('{a}は無線機を分解して、また組み立てた。何度やっても雑音しか出なかった。',fixer),why:fixer.name+'のA／サバイバル知識 '+ctx.stat(fixer,'know')});
}else if(kind==='日記'){
var reader=ctx.most(P,function(c){return c.tr.a;});
var sus=ctx.most(P,function(c){return c.tr.jealous;});
var tgt=ctx.most(ctx.others(sus),function(o){return R(ctx,sus,o).ten-R(ctx,sus,o).trust*0.5;});
ctx.act2({actors:[reader],cat:'solo',fx:function(){P.forEach(function(o){ctx.stress(o,12);});},
text:ctx.t('{a}が日記を読み上げた。前の漂流者たちは、最後の十日間で互いを疑い始め、一人ずつ減っていったらしい。',reader),why:'島に流れ着いた過去の記録'});
if(tgt)ctx.act2({actors:[sus,tgt],cat:'conflict',fx:function(){ctx.mod2(sus,tgt,{ten:12,trust: -10},{ten:5});},
text:ctx.t('その夜から、{a}は{b}が眠るまで目を閉じなくなった。',sus,tgt),why:sus.name+'の嫉妬・執着（疑い深さ）'});
}else{
var dist=ctx.most(P,function(c){return c.tr.np+c.tr.lead*0.5;});
ctx.food+=28;
ctx.act2({actors:[dist],cat:'help',fx:function(){ctx.others(dist).forEach(function(o){ctx.mod(o,dist,{trust:5,aff:3});});},
text:ctx.t('缶詰は{a}がきっちり人数分に分けた。',dist),why:dist.name+'のNP・主導性'});
}
}
},
{
id:'beast',from:1,
w:function(ctx){return 0.8+ctx.env.storm/200;},
run:function(ctx){
var P=ctx.present(),rng=ctx.rng;
var victim=rng.pick(P);
var rescuer=ctx.most(ctx.others(victim),function(o){return o.tr.np*0.5+o.tr.aggr*0.5+Math.max(0,R(ctx,o,victim).aff)/80;});
var runner=ctx.most(without(P,[victim,rescuer]),function(o){return o.tr.caution;});
ctx.incident('森の奥から、猪が飛び出してきた。');
if(rescuer&&rescuer.tr.np*0.5+rescuer.tr.aggr*0.5>0.45){
ctx.act2({actors:[rescuer,victim],cat:'help',mag:12,fx:function(){hurt(ctx,rescuer,8+rng()*10,'猪に突かれた傷がもとで');ctx.mod2(rescuer,victim,{aff:5},{aff:14,trust:14,att:6});},
text:ctx.t('牙が{b}に向かった瞬間、{a}が流木で猪を殴りつけた。猪は逃げ、{a}の腕には深い傷が残った。',rescuer,victim),why:rescuer.name+'の'+(rescuer.tr.np>rescuer.tr.aggr?'NP（守りたい）':'攻撃性（迷わず殴る）')});
}else{
ctx.act2({actors:[victim],cat:'solo',fx:function(){hurt(ctx,victim,18,'猪に襲われた傷がもとで');},
text:ctx.t('{a}は猪の牙に脚をやられた。誰も間に合わなかった。',victim),why:'偶然'});
}
if(runner&&runner!==rescuer&&runner.tr.caution>0.6){
ctx.act2({actors:[runner,victim],cat:'solo',fx:function(){ctx.mod(victim,runner,{aff: -8,ten:8});},
text:ctx.t('猪が暴れているあいだ、{a}は一人で木の上に逃げていた。{b}は、そのことを忘れなかった。',runner,victim),why:runner.name+'の慎重さ（'+Math.round(runner.tr.caution*100)+'）'});
}
}
},
{
id:'mushroom',
run:function(ctx){
var P=ctx.present();
var eater=ctx.most(P,function(c){return c.tr.impulse+(1-c.tr.a)*0.5+c.stress/150;});
var nurse=ctx.most(ctx.others(eater),function(o){return o.tr.np;});
var mock=ctx.most(ctx.others(eater),function(o){return o.tr.cp*(1-o.tr.np);});
ctx.incident('森で、見たことのない色のキノコが見つかった。');
ctx.act2({actors:[eater],cat:'solo',fx:function(){hurt(ctx,eater,22,'毒キノコに当たって');ctx.stress(eater,15);},
text:ctx.t('止める間もなく{a}が一口かじった。一時間後、{a}は激しく吐いていた。',eater),why:eater.name+'の衝動性（FC高・A低）と空腹'});
if(eater.alive&&nurse&&nurse.tr.np>0.45)ctx.act2({actors:[nurse,eater],cat:'help',fx:function(){eater.hp+=10;ctx.mod2(nurse,eater,{aff:3},{aff:12,trust:12});},
text:ctx.t('{a}は{b}の背中をさすり続け、真水を少しずつ飲ませた。',nurse,eater),why:nurse.name+'のNP'});
if(eater.alive&&mock&&mock!==nurse&&mock.tr.cp>0.6)ctx.act2({actors:[mock,eater],cat:'conflict',fx:function(){ctx.mod(eater,mock,{ten:12,aff: -6});},
text:ctx.t('「だから言ったじゃん｜だから言っただろう｜だから言ったでしょう」と{a}が吐き捨てた。{b}は言い返す気力もなかった。',mock,eater),why:mock.name+'のCP高・NP低'});
}
},
{
id:'ship',from:1,
run:function(ctx){
var P=ctx.present();
var sig=ctx.most(P,function(c){return c.tr.a+c.tr.lead*0.5;});
ctx.incident('水平線に船影が見えた。');
ctx.act2({actors:[sig],cat:'escape',text:ctx.t(ctx.few()?'{a}が真っ先に狼煙を上げた。二人で浜に並び、声が嗄れるまで叫んだ。':'{a}が真っ先に狼煙を上げた。全員で浜に並び、声が嗄れるまで叫んだ。',sig),why:sig.name+'のA・主導性'});
ctx.say({text:'船は、こちらに気づかないまま遠ざかっていった。'});
P.forEach(function(c){c.stress=HK.clamp(c.stress+16,0,100);});
var blamer=ctx.most(ctx.others(sig),function(o){return o.tr.aggr+o.stress/100;});
if(blamer&&blamer.tr.aggr>0.55)ctx.act2({actors:[blamer,sig],cat:'conflict',fx:function(){ctx.mod2(blamer,sig,{ten:14,aff: -6},{ten:10});},
text:ctx.t('「火を焚くのが遅かったんだ｜火を焚くのが遅かった｜火を焚くのが遅かったんです」{a}は{b}のせいにした。',blamer,sig),why:blamer.name+'の攻撃性と失望'});
var comf=ctx.most(P,function(c){return c.tr.np+c.tr.fc*0.3;});
var low=ctx.most(ctx.others(comf),function(o){return o.stress;});
if(comf&&low&&comf.tr.np>0.5)ctx.act2({actors:[comf,low],cat:'help',fx:function(){ctx.stress(low,-15);ctx.mod(low,comf,{aff:8,trust:8});},
text:ctx.t('砂浜に座り込んだ{b}の隣に、{a}が黙って腰を下ろした。「次は気づいてもらえる｜＝｜次は気づいてもらえます」',comf,low),why:comf.name+'のNP'});
}
},
{
id:'water',min:2,
run:function(ctx){
var P=ctx.present();
var lead=ctx.most(P,function(c){return c.tr.lead+c.tr.fc*0.3;});
var mate=ctx.most(ctx.others(lead),function(o){return R(ctx,lead,o).trust+R(ctx,lead,o).att*0.5;});
ctx.incident('湧き水が濁り始めた。新しい水源を探しに行く必要がある。');
var found=ctx.rng()<0.45+(ctx.stat(lead,'know')+ctx.stat(mate,'know'))*0.05;
ctx.act2({actors:[lead,mate],cat:R(ctx,lead,mate).att>30?'romance':'bond',fx:function(){
ctx.mod2(lead,mate,{trust:10,att:4,aff:5},{trust:10,att:4,aff:5});
if(found)P.forEach(function(c){c.hp=Math.min(100,c.hp+8);});else{lead.hp-=6;mate.hp-=6;}
},text:ctx.t('{a}は{b}を連れて島の奥へ向かった。'+(found?'崖の下で澄んだ湧き水を見つけ、二人で頭から浴びた。':'一晩、岩陰で身を寄せ合って過ごし、何も見つけられずに戻った。'),lead,mate),why:lead.name+'が最も信頼していた相手を選んだ'});
P.forEach(function(o){
if(o===lead||o===mate)return;
var c=ctx.crush(o,55);
if(c===lead||c===mate)ctx.act2({actors:[o,c===lead?mate:lead],cat:'conflict',fx:function(){ctx.mod(o,c===lead?mate:lead,{ten:10});ctx.pair(o,c===lead?mate:lead).jealous++;},
text:ctx.t('二人が戻るまで、{a}は一度も森の入り口から目を離さなかった。',o),why:o.name+'は'+c.name+'に惹かれていた'});
});
}
},
{
id:'vote',min:3,from:2,
run:function(ctx){
var P=ctx.present(),votes={},lines=[];
ctx.incident('誰がこの島のまとめ役になるか、決めることになった。');
P.forEach(function(a){
var pick=a.tr.cp>0.75&&a.tr.ac<0.35?a:ctx.most(ctx.others(a),function(o){return R(ctx,a,o).trust+R(ctx,a,o).aff*0.4+o.tr.lead*20;});
votes[pick.i]=(votes[pick.i]||0)+1;
lines.push(a.name+'→'+pick.name);
});
var win=ctx.most(P,function(c){return(votes[c.i]||0)*10;});
ctx.act2({actors:[win],cat:'bond',mag:10,fx:function(){win.flags.leader=true;ctx.stress(win,8);},
text:ctx.t('まとめ役は{a}に決まった（'+lines.join('、')+'）。',win),why:'信頼と主導性で投票'});
P.forEach(function(o){
if(o===win||o.tr.lead<0.62)return;
ctx.act2({actors:[o,win],cat:'conflict',fx:function(){ctx.mod(o,win,{ten:14});},
text:ctx.t('まとめ役が決まって皆が拍手する中、{a}だけは手を叩かなかった。',o),why:o.name+'も主導性が高い（CP・A高、AC低）'});
});
}
},
{
id:'campfire',min:2,
run:function(ctx){
var P=ctx.present();
ctx.incident('風の止んだ夜、焚き火を囲んで、島に来る前の話をした。');
var talker=ctx.most(P,function(c){return c.tr.honesty+c.stress/200;});
var silent=ctx.most(ctx.others(talker),function(c){return c.tr.cold+(1-c.tr.honesty)*0.5;});
ctx.act2({actors:[talker],cat:'bond',fx:function(){ctx.others(talker).forEach(function(o){ctx.mod(o,talker,{trust:7,aff:4});});},
text:ctx.t('{a}は、帰っても誰も待っていないのだと笑って言った。火の粉がはぜる音だけが返ってきた。',talker),why:talker.name+'の本音の出やすさ（FC高・AC低）'});
if(silent&&silent.tr.cold>0.5){
var asker=ctx.most(ctx.others(silent),function(o){return R(ctx,o,silent).att+o.tr.np*20;});
ctx.act2({actors:[silent,asker],cat:'solo',fx:function(){ctx.mod(asker,silent,{att:4,trust: -2});},
text:ctx.t('{a}は自分の番が来ても話さなかった。{b}だけが、その横顔をしばらく見ていた。',silent,asker),why:silent.name+'のドライさ。'+asker.name+'の関心'});
}
}
},
{
id:'fever',from:2,
run:function(ctx){
var P=ctx.present();
var sick=ctx.most(P,function(c){return(100-c.hp)/100+(5-ctx.stat(c,'hp'))*0.1;});
ctx.incident('朝になって、'+sick.name+'が高熱を出して起き上がれなくなった。');
var carers=ctx.others(sick).filter(function(o){return o.tr.np>0.5||R(ctx,o,sick).aff>35;});
var avoid=ctx.others(sick).filter(function(o){return carers.indexOf(o)<0&&o.tr.caution>0.55;});
hurt(ctx,sick,14,'熱が下がらないまま');
carers.slice(0,2).forEach(function(c,k){
if(k>0&& !sick.alive)return;
ctx.act2({actors:[c,sick],cat:'help',fx:function(){sick.hp+=6;c.hp-=4;ctx.mod2(c,sick,{aff:4},{aff:10,trust:10,att:4});},
text:ctx.t('{a}は一晩中、{b}の額の布を替え続けた。',c,sick),why:c.name+(c.tr.np>0.5?'のNP':'の'+sick.name+'への好意')});
});
if(!sick.alive){ctx.flush();return;}
if(avoid.length)ctx.act2({actors:[avoid[0],sick],cat:'solo',fx:function(){ctx.mod(sick,avoid[0],{aff: -5});},
text:ctx.t('{a}は「うつると困る｜＝｜うつると困ります」と言って、寝床を離れた場所に移した。',avoid[0],sick),why:avoid[0].name+'の慎重さ'});
}
}
];
HK.INCIDENTS.br=[
{
id:'vote',min:3,from:2,
w:function(){return 1.2;},
run:function(ctx){
var P=ctx.present(),votes={},ballots=[];
ctx.incident('放送：「特別ゲーム。生存者全員で投票し、最多票の一名を処刑する。白票は本人の首輪を作動させる」');
P.forEach(function(a){
var pick=ctx.most(ctx.others(a),function(o){var r=R(ctx,a,o);return r.ten-r.aff*0.6-r.trust*0.3+(a.flags.revenge===o.i?60:0);});
votes[pick.i]=(votes[pick.i]||0)+1;
ballots.push({a:a,b:pick});
});
var top=ctx.most(P,function(c){return(votes[c.i]||0)*10;});
var max=votes[top.i];
var tied=P.filter(function(c){return votes[c.i]===max;});
if(ballots.length<=8)ctx.say({text:'開票：'+ballots.map(function(x){return x.a.name+'→'+x.b.name;}).join('、')});
else ctx.say({text:'開票：'+P.filter(function(c){return votes[c.i];}).sort(function(x,y){return votes[y.i]-votes[x.i];}).slice(0,5).map(function(c){return c.name+' '+votes[c.i]+'票';}).join('、')+(P.length>5?'ほか':'')});
var shown=0;
ballots.forEach(function(x){
var r=R(ctx,x.a,x.b);
if(r.aff>20&&shown++ <6)ctx.act2({actors:[x.a,x.b],cat:'betray',odd:true,fx:function(){ctx.mod(x.b,x.a,{trust: -30,ten:25,aff: -15});},
text:ctx.t('{a}は、好意を持っていたはずの{b}の名前を書いていた。',x.a,x.b),why:'生き残るための計算。'+x.a.name+'の'+(x.a.tr.cold>0.55?'ドライさ':'恐怖')});
else ctx.act2({actors:[x.a,x.b],cat:'conflict',fx:function(){ctx.mod(x.b,x.a,{ten:10,trust: -8});},text:'',why:''});
});
if(tied.length>1){
ctx.say({text:'同票。'+names(tied)+'の首輪から電流が流れた。'});
tied.forEach(function(c){hurt(ctx,c,28,'投票ゲームの電流で');});
}else{
ctx.kill(top,null,'投票ゲームで処刑された（'+max+'票）');
P.forEach(function(o){
if(o===top|| !o.alive||R(ctx,o,top).aff<35)return;
ballots.forEach(function(x){if(x.b===top&&x.a!==o){ctx.k=1;ctx.mod(o,x.a,{ten:20,aff: -12});o.flags.revenge=x.a.i;}});
});
}
}
},
{
id:'dilemma',min:2,
run:function(ctx){
var P=ctx.present(),rng=ctx.rng;
var a=rng.pick(P),b=ctx.most(ctx.others(a),function(o){return Math.abs(R(ctx,a,o).aff)+R(ctx,a,o).ten;});
ctx.incident('放送：「'+a.name+'と'+b.name+'は別々の部屋へ。『信じる』か『裏切る』か、ボタンを一つ押せ」');
function choose(x,y){var r=R(ctx,x,y);return r.trust+x.tr.np*40-x.tr.cold*30-(x.goal.id==='last'?25:0)+rng()*30*(0.5+ctx.chaos)>25;}
var ca=choose(a,b),cb=choose(b,a);
var txt,why;
if(ca&&cb){
txt='二人とも『信じる』を押した。扉が開き、二人分の水と食料が置かれていた。';
ctx.act2({actors:[a,b],cat:'bond',mag:15,fx:function(){a.hp=Math.min(100,a.hp+15);b.hp=Math.min(100,b.hp+15);ctx.mod2(a,b,{trust:25,aff:10},{trust:25,aff:10});},text:txt,why:'互いの信頼（'+Math.round(R(ctx,a,b).trust)+'／'+Math.round(R(ctx,b,a).trust)+'）'});
}else if(!ca&& !cb){
ctx.act2({actors:[a,b],cat:'betray',fx:function(){hurt(ctx,a,30,'信頼ゲームの罰で');hurt(ctx,b,30,'信頼ゲームの罰で');ctx.mod2(a,b,{ten:15},{ten:15});},
text:'二人とも『裏切る』を押した。両方の首輪が鳴った。',why:'互いに相手を信じきれなかった'});
}else{
var tr=ca?b:a,vi=ca?a:b;
ctx.act2({actors:[tr,vi],cat:'betray',mag:20,fx:function(){tr.hp=Math.min(100,tr.hp+20);hurt(ctx,vi,40,tr.name+'に裏切られた信頼ゲームで');ctx.mod(vi,tr,{trust: -60,ten:40,aff: -25});vi.flags.revenge=tr.i;},
text:ctx.t('{a}は『裏切る』を、{b}は『信じる』を押した。',tr,vi),why:tr.name+'のドライさ（'+Math.round(tr.tr.cold*100)+'）／'+vi.name+'の'+(vi.tr.np>0.55?'NP':'信頼')});
}
}
},
{
id:'roulette',min:2,from:3,
run:function(ctx){
var P=ctx.rng.shuffle(ctx.present()).slice(0,4),rng=ctx.rng;
ctx.incident('放送：「'+names(P)+'は体育館へ。弾は一発、六つの穴。順番に引き金を引け」');
var first=ctx.most(P,function(c){return c.tr.cp*0.5+c.tr.fc*0.5+c.tr.cold*0.3;});
ctx.act2({actors:[first],cat:'solo',text:ctx.t('最初に銃を取ったのは{a}だった。',first),why:first.name+'の'+(first.tr.cp>first.tr.fc?'CP（自分で決めたい）':'FC（どうせなら先に）')});
var order=[first].concat(P.filter(function(c){return c!==first;}));
var left=6;
for(var t=0;t<8;t++){
var cur=order[t%order.length];
if(!cur.alive)continue;
var sub=ctx.most(P.filter(function(o){return o!==cur&&o.alive;}),function(o){return R(ctx,o,cur).aff/100+o.tr.np*0.5;});
var shooter=cur;
if(sub&&R(ctx,sub,cur).aff>45&&sub.tr.np>0.55&&rng()<0.6){
shooter=sub;
ctx.act2({actors:[sub,cur],cat:'help',mag:20,fx:function(){ctx.mod2(sub,cur,{aff:5},{aff:20,trust:20,att:10});},
text:ctx.t('{b}の番で、{a}が銃を奪った。「代わる｜代わろう｜代わります」',sub,cur),why:sub.name+'のNPと'+cur.name+'への好意（'+Math.round(R(ctx,sub,cur).aff)+'）'});
}
if(rng()<1/left){ctx.kill(shooter,null,'ロシアンルーレットの'+(7-left)+'発目で');break;}
left--;
ctx.say({text:shooter.name+'、空砲。'});
if(left<=1)break;
}
P.forEach(function(c){if(c.alive)c.stress=HK.clamp(c.stress+18,0,100);});
}
},
{
id:'confession',min:2,from:1,
run:function(ctx){
var P=ctx.present(),picks={};
if(P.length>10)P=ctx.rng.shuffle(P).slice(0,10);
ctx.incident('放送：「紙に一番大切な人の名前を書け。両想いだった二人には、救急箱と食料を与える」');
P.forEach(function(a){picks[a.i]=fav(ctx,a,ctx.others(a));});
var done={};
P.forEach(function(a){
var b=picks[a.i];
if(!b){ctx.act2({actors:[a],cat:'solo',text:ctx.t('{a}の紙は白紙だった。',a),why:a.name+'に、名前を書くほどの相手がいなかった'});return;}
if(done[a.i])return;
if(picks[b.i]===a){
done[a.i]=done[b.i]=1;
ctx.pair(a,b).confessed[a.i]=ctx.pair(a,b).confessed[b.i]=true;
ctx.act2({actors:[a,b],cat:'romance',mag:25,fx:function(){a.hp=Math.min(100,a.hp+20);b.hp=Math.min(100,b.hp+20);ctx.mod2(a,b,{att:14,aff:10,trust:12},{att:14,aff:10,trust:12});},
text:ctx.t('{a}と{b}の名前が並んで読み上げられた。互いの名前を書いていた。',a,b),why:'両想い（惹かれ '+Math.round(R(ctx,a,b).att)+'／'+Math.round(R(ctx,b,a).att)+'）'});
}else{
var c=picks[b.i];
ctx.act2({actors:[a,b],cat:'romance',fx:function(){ctx.mod(b,a,{att:b.tr.np>0.5?6:2,ten:b.tr.cold>0.6?4:0});ctx.stress(a,12);if(c){ctx.mod(a,c,{ten:12});ctx.pair(a,c).jealous++;}},
text:ctx.t('{a}は{b}の名前を書いた。'+(c?'{b}が書いたのは{c}だった。':'{b}の紙は白紙だった。'),a,b,c),why:'一方通行の想いが、全員の前で明かされた'});
}
});
}
},
{
id:'crate',min:2,
run:function(ctx){
var P=ctx.present();
ctx.incident('放送：「分校の屋上に救急箱を一つ置いた。一人分だ」');
var claim=ctx.most(P,function(c){return c.tr.aggr*0.6+c.tr.cold*0.4+(100-c.hp)/200;});
var rival=ctx.most(ctx.others(claim),function(o){return o.tr.aggr+(100-o.hp)/150;});
var giver=ctx.most(P,function(c){return c.tr.np-c.tr.cold*0.5;});
if(giver&&giver.tr.np>0.65&&giver!==claim){
var weak=P.slice().sort(function(x,y){return x.hp-y.hp;})[0];
if(weak!==giver){
ctx.act2({actors:[giver,weak],cat:'help',mag:15,fx:function(){weak.hp=Math.min(100,weak.hp+35);ctx.mod2(giver,weak,{aff:5},{aff:18,trust:18});},
text:ctx.t('救急箱を手にした{a}は、それを自分には使わず{b}に投げ渡した。',giver,weak),why:giver.name+'のNP（'+Math.round(giver.eg.NP)+'）'});
return;
}
}
if(rival&&rival.tr.aggr>0.5){
var r=ctx.fight(claim,rival,{lethality:0.6});
ctx.act2({actors:[claim,rival],cat:'combat',fx:function(){if(r.winner)r.winner.hp=Math.min(100,r.winner.hp+30);},
text:ctx.t('屋上で{a}と{b}が鉢合わせた。',claim,rival)+r.text,why:'物資の奪い合い。'+(r.why||'')});
}else{
ctx.act2({actors:[claim],cat:'solo',fx:function(){claim.hp=Math.min(100,claim.hp+30);ctx.others(claim).forEach(function(o){ctx.mod(o,claim,{ten:4});});},
text:ctx.t('救急箱は{a}が持ち去った。',claim),why:claim.name+'の攻撃性・ドライさ'});
}
}
},
{
id:'hostage',min:3,from:2,
run:function(ctx){
var P=ctx.present(),rng=ctx.rng;
var v=rng.pick(P);
ctx.incident('放送：「'+v.name+'を灯台に拘束した。日没までに誰も来なければ首輪を作動させる」');
var res=ctx.most(ctx.others(v),function(o){return Math.max(0,R(ctx,o,v).aff)/60+o.tr.np*0.5+(o.focus===v?1:0)-o.tr.caution*0.3;});
var score=Math.max(0,R(ctx,res,v).aff)/60+res.tr.np*0.5+(res.focus===v?1:0)-res.tr.caution*0.3;
if(score>0.55){
ctx.act2({actors:[res,v],cat:'help',mag:25,fx:function(){hurt(ctx,res,20,v.name+'を助けに灯台へ向かって');ctx.mod2(res,v,{aff:6},{aff:22,trust:25,att:10});},
text:ctx.t('日没の十分前、灯台の扉を蹴破ったのは{a}だった。',res,v),why:res.name+'の'+(res.focus===v?'目標（'+v.name+'を守る）':'NPと'+v.name+'への好意')});
}else{
ctx.kill(v,null,'灯台で、誰にも助けられないまま');
ctx.others(v).forEach(function(o){if(o.alive&&R(ctx,o,v).aff>35)ctx.act2({actors:[o,v],cat:'solo',fx:function(){ctx.stress(o,25);},text:ctx.t('{a}は灯台の方角を見ないようにしていた。',o,v),why:o.name+'の慎重さが、'+v.name+'への好意（'+Math.round(R(ctx,o,v).aff)+'）に勝った'});});
}
}
},
{
id:'dinner',min:3,
run:function(ctx){
var P=ctx.present(),rng=ctx.rng;
ctx.incident('放送：「食堂に人数分の食事を用意した。一皿だけ、毒が入っている」');
var taster=ctx.most(P,function(c){return c.tr.np*0.6+c.tr.fc*0.3+(c.goal.id==='save'?0.5:0);});
var forcer=ctx.most(P,function(c){return c.tr.cp*(1-c.tr.np);});
var meek=ctx.most(ctx.others(forcer),function(o){return o.tr.ac;});
var tasterUsed=taster;
if(forcer.tr.cp>0.7&&forcer.tr.np<0.4&&meek&&meek.tr.ac>0.6){
tasterUsed=meek;
ctx.act2({actors:[forcer,meek],cat:'conflict',fx:function(){ctx.mod(meek,forcer,{ten:20,trust: -15});},
text:ctx.t('「あなたが先に食べなよ｜あなたが先に食え｜あなたが先に食べてください」{a}は{b}の前に皿を押しやった。{b}は逆らわなかった。',forcer,meek),why:forcer.name+'のCP高・NP低／'+meek.name+'のAC（'+Math.round(meek.eg.AC)+'）'});
}else{
ctx.act2({actors:[taster],cat:'help',fx:function(){ctx.others(taster).forEach(function(o){ctx.mod(o,taster,{trust:6,aff:4});});},
text:ctx.t('「毒見なら私がやる｜＝｜毒見なら私がやります」{a}が真っ先にスプーンを取った。',taster),why:taster.name+'のNP・FC'});
}
var poisoned=rng.pick(P);
var nose=ctx.most(ctx.others(poisoned),function(o){return o.tr.a;});
if(nose&&rng()<nose.tr.a*0.55){
ctx.act2({actors:[nose,poisoned],cat:'help',mag:15,fx:function(){ctx.mod(poisoned,nose,{trust:18,aff:10});},
text:ctx.t('{b}が口をつける直前、{a}がその皿を払い落とした。「匂いが違う｜＝｜匂いが違います」',nose,poisoned),why:nose.name+'のA（'+Math.round(nose.eg.A)+'）：観察力'});
}else{
ctx.act2({actors:[poisoned],cat:'solo',fx:function(){hurt(ctx,poisoned,poisoned===tasterUsed?55:45,'毒入りの皿を引いて');},text:ctx.t('毒の皿を引いたのは{a}だった。',poisoned),why:'偶然'});
}
}
},
{
id:'zone',from:2,
run:function(ctx){
var P=ctx.present();
if(P.length<2)return;
var a=ctx.rng.pick(P);
var b=ctx.most(ctx.others(a),function(o){return R(ctx,a,o).ten+R(ctx,a,o).att;});
ctx.incident('放送：「'+a.name+'の潜伏地点を禁止エリアに指定する」');
var r=R(ctx,a,b);
if(r.ten>35&&a.tr.aggr>0.45){
var f=ctx.fight(a,b);
ctx.act2({actors:[a,b],cat:'combat',text:ctx.t('追い出された{a}は、逃げた先で{b}と出くわした。',a,b)+f.text,why:'強制移動。積もった緊張（'+Math.round(r.ten)+'）。'+f.why});
}else{
ctx.act2({actors:[a,b],cat:r.att>30?'romance':'bond',fx:function(){ctx.mod2(a,b,{trust:8,att:4},{trust:6,att:4});},
text:ctx.t('追い出された{a}は、逃げた先で{b}と出くわした。{b}は黙って、隠れ家の奥を空けた。',a,b),why:b.name+'の側に敵意がなかった'});
}
}
}
];
})();
});
HK.Load.done('scen-island', 'eb2bd23279', 1);
