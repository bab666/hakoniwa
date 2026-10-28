;
/* ==== js/zombie-core.js ==== */
HK.Load.def(140,'js/zombie-core.js',function(){
(function(){
'use strict';
var HK=window.HK,Z=HK.ZB;
var PARTS=['朝','昼','夕方','夜'];
function L(s){return s.split('|');}
function names(list){return list.map(function(c){return c.name;}).join('・');}
function AR(ctx,i){return ctx.zb.A[i];}
function an(ctx,i){return ctx.zb.A[i].name;}
function inArea(ctx,i){return ctx.present().filter(function(o){return o.z.area===i;});}
function here(ctx,c){if(c.z.alone)return[];return ctx.present().filter(function(o){return o!==c&&o.z.area===c.z.area&& !o.z.alone;});}
function tieT(ctx,a,b){var t=HK.Ties&&HK.Ties.get(ctx,a,b);return t?(t.like||t.type):'';}
function day(ctx){return Math.floor(ctx.stepIndex/4)+1;}
function part(ctx){return ctx.stepIndex%4;}
function lastDay(ctx){return day(ctx)>=ctx.env.days;}
function luck(ctx,c){return ctx.stat(c,'luck');}
function wname(c){return c.weapon?c.weapon.name:'素手';}
function spare(ctx,v,k){return!!(HK.Attr&&HK.Attr.spare&&HK.Attr.spare(ctx,v,k));}
var SPARE_TAKE=L('{a}は眠っている{b}の首筋に手を伸ばしかけて、止めた。「……あなたまで連れていけない｜……あなたまでは連れていけない｜……あなたまで連れていくことはできません」――{a}は{b}の寝顔を見つめたまま、朝まで動かなかった。|'+
'{a}は{b}の手を握ったまま、長いあいだ黙っていた。「一緒に、と思ったけど……やっぱりできない｜一緒に、と思った。……だが、できない｜一緒に、と思いました。……でも、できません」――{a}は握っていたものを窓の外へ放り、{b}の隣で膝を抱えた。|'+
'{a}は{b}に覆いかぶさりかけて、自分の手が震えているのに気づいた。「……あなたには、生きててほしい｜……あなたには、生きていてほしい｜……あなたには、生きていてほしいんです」――{a}はその夜、終わらせるのをやめた。');
Z.inArea=inArea;Z.here=here;Z.an=an;Z.day=day;Z.part=part;Z.names=names;
var scen={
id:'zombie',name:'ゾンビの街',kicker:'サバイバル・パニック',
desc:'ゾンビのはびこる街で7日間を生き延びる。開始地点はランダムで、街は9つのエリア。咬まれれば、いつかは向こう側へ。食料の奪い合い、錯綜する噂、狂人・宗教家・軍人・迷子の子。舞台は日本か、銃の出回る海外の街か。',
note:'※死・自死・殺人の描写を含みます。',
unit:'日',perUnit:4,preRel:2,lethal:true,maxCast:20,
derived:['caution','aggr','warmth','cold'],
exclude:['lighten','tease','compliment','glance','lecture'],
catBias:{romance:0.75,combat:1.1,betray:1.1},
decay:0.97,miniShare:0.9,actRate:0.45,
env:[
{id:'region',label:'舞台',type:'select',def:'jp',options:[{v:'jp',label:'日本の地方都市'},{v:'us',label:'海外の街（銃が出回っている）'}]},
{id:'days',label:'生き延びる日数',min:3,max:10,def:7,lo:'3日',hi:'10日',unit:'日'},
{id:'outbreak',label:'ゾンビの多さ',min:0,max:100,def:50,lo:'まばら',hi:'街を埋め尽くす',desc:'多いほど群れに出くわしやすく、咬まれやすい。日を追うごとに増えていく'},
{id:'turn',label:'発症までの早さ',min:0,max:100,def:50,lo:'数日もつ',hi:'数時間で',desc:'咬まれてからゾンビになるまで。実際には本人の体力と運でも変わる'},
{id:'rumor',label:'情報の錯綜',min:0,max:100,def:55,lo:'ほぼ正確',hi:'デマだらけ',desc:'SNS・ラジオ・人づての噂にデマが混ざる割合。安全な地区や救助の場所も、信じたものが本当とは限らない'},
{id:'npc',label:'NPCの出現',min:0,max:100,def:55,lo:'ほぼ出ない',hi:'次々に現れる',desc:'狂人・宗教家・軍人・迷子の子・医者・略奪者など、住人以外の生存者'},
{id:'end',label:'最終日',type:'select',def:'heli',options:[{v:'heli',label:'救助ヘリが来る（着陸地点は噂しだい）'},{v:'none',label:'救助は来ない（生き延びるだけ）'},{v:'burn',label:'街ごと焼き払われる（脱出するしかない）'}]}
],
stats:[
{id:'hp',label:'体力',desc:'格闘・飢えへの強さ。咬まれてから発症するまでの長さにも効く'},
{id:'luck',label:'運',desc:'咬まれにくさ・物資の見つけやすさ・脱出の成功率。発症までの長さにも効く'}
],
perFields:[
{id:'fam',label:'家族',auto:'いない（設定しなければ）',options:[{id:'none',label:'いない'},{id:'in',label:'街のどこかにいる'},{id:'out',label:'街の外にいる'}]}
],
actions:[
{id:'hole',label:'立てこもる',fit:function(t){return t.caution;},bias:{solo:1.3,combat:0.7}},
{id:'loot',label:'物資を探して回る',fit:function(t){return t.a*0.5+t.fc*0.3+0.1;},bias:{help:1.2}},
{id:'seek',label:'知り合いを探す',fit:function(t){return t.warmth;},bias:{bond:1.5,help:1.3}},
{id:'info',label:'情報を集める',fit:function(t){return t.a*0.6+t.caution*0.3;},bias:{solo:1.2}},
{id:'hunt',label:'ゾンビを狩る',fit:function(t){return t.aggr;},bias:{combat:1.6}}
],
goals:[
{id:'live',label:'とにかく生き延びる',fit:function(t){return t.caution*0.6+t.cold*0.4;}},
{id:'escape',label:'街を出る',fit:function(t){return t.a*0.5+t.lead*0.3+t.fc*0.2;},bias:{escape:1.8}},
{id:'family',label:'家族と合流する',fit:function(t){return t.np*0.6+t.ac*0.3;},bias:{help:1.3}},
{id:'protect',label:'大切な人を守る',fit:function(t){return t.np;},bias:{help:2},needsFocus:true},
{id:'chaos',label:'この混乱を利用する',fit:function(t){return t.cold*0.5+t.aggr*0.5-t.np*0.4;},bias:{betray:2,combat:1.4,help:0.5}}
],
steps:function(env){var s=[];for(var d=1;d<=env.days;d++)PARTS.forEach(function(p){s.push(d+'日目・'+p);});return s;},
othersFor:function(ctx,a){if(a.z&&a.z.alone)return[];return ctx.present().filter(function(c){return c!==a&&c.z&&a.z&&c.z.area===a.z.area&& !c.z.alone;});},
longRun:function(env){return env.days>=6;},
setup:function(ctx){setup(ctx);},
phase:function(ctx,s,n){phase(ctx,s,n);},
after:function(ctx,s,n){after(ctx,s,n);},
end:function(ctx){return ctx.present().length===0&&ctx.stepIndex>0;},
finish:function(ctx){finish(ctx);},
events:[]
};
HK.SCENARIOS.zombie=scen;
var ti=HK.SCEN_ORDER.indexOf('trial');
if(ti<0)ti=HK.SCEN_ORDER.indexOf('br');
if(ti<0)ti=HK.SCEN_ORDER.indexOf('island');
if(HK.SCEN_ORDER.indexOf('zombie')<0){if(ti>=0)HK.SCEN_ORDER.splice(ti+1,0,'zombie');else HK.SCEN_ORDER.push('zombie');}
Z.scen=scen;
function setup(ctx){
var rng=ctx.rng,env=ctx.env,reg=env.region==='us'?'us':'jp';
var base=18+env.outbreak*0.62;
var zb=ctx.zb={
reg:reg,A:Z.AREAS[reg].map(function(a,i){return{i:i,name:a.name,def:a,z:HK.clamp(base*a.danger*(0.8+rng()*0.4),3,100),food:Math.round(a.food*10+rng()*3),loot:a.loot,bar:0,fallen:false,seen:{}};}),
npcs:[],zpc:[],net:8+rng.int(9),stats:{bites:0,turned:0,putdown:0,npcDead:0,escaped:0},
safe: -1,heli: -1,fallAt: -1,rumors:{},moves:[]
};
var r0=rng();
zb.safe=r0<0.55?5:r0<0.8?7: -1;
if(zb.safe>=0&&rng()<0.55)zb.fallAt=(2+rng.int(Math.max(2,env.days-2)))*4+rng.int(4);
if(env.end==='heli')zb.heli=rng.pick([5,7,2,8]);
ctx.place='街';
var W=Z.WEAPONS[reg];
ctx.chars.forEach(function(c){
c.hp=62+ctx.stat(c,'hp')*7;
c.weapon=Z.weapon(rng.pick(W.start));
if(reg==='us'&& !c.weapon.gun&&rng()<0.18)c.weapon=Z.weapon(rng.pick([['拳銃',7,1,1],['リボルバー',7,1,1]]));
var z=c.z={area:rng.int(9),food:1+rng.int(3),bitten:null,aware:false,decided:false,turnAt: -1,wound: -1,hunger:0,know:{},safe:null,heliAt:null,family:null,moved:false,path:[],kills:0,believe:{}};
z.start=z.area;z.path.push(z.area);
var fp=(c.pick||{}).fam,kin=ctx.chars.filter(function(o){var t=tieT(ctx,c,o);return o!==c&&(t==='parent'||t==='sibling');})[0];
if(kin)z.family={pc:kin.i,rel:tieT(ctx,c,kin)==='sibling'|| /^sib/.test((HK.Ties.get(ctx,c,kin)||{}).type||'')?(HK.Sib?HK.Sib.word(c,kin,'plain',ctx):'きょうだい'):'家族',state:'ok'};
else if(fp==='none')z.family=null;
else if(fp==='in'||fp==='out'){
var inside=fp==='in';
z.family={rel:rng.pick(Z.FAMILY),inside:inside,area:inside?rng.int(9): -1,state:'ok',known:true};
}
if(c.goal.id==='family'&& !z.family)c.goal=scen.goals[c.tr.cold>0.55?0:1];
if(c.goal.id==='family'&&z.family&&z.family.pc!=null){c.focus=ctx.chars[z.family.pc];}
});
}
function phase(ctx,s,n){
var zb=ctx.zb,rng=ctx.rng;
zb.moves=[];
ctx.present().forEach(function(c){c.z.moved=false;});
if(s===0){intro(ctx);ctx.present().forEach(function(a){ctx.present().forEach(function(b){if(a!==b&&a.z.area===b.z.area)ctx.pair(a,b).zmet=true;});});pacts(ctx);}
if(s>0&&part(ctx)===0)morning(ctx);
if(zb.fallAt===s&&zb.safe>=0)shelterFalls(ctx);
Z.spawnNPC(ctx);
moveAll(ctx);
pacts(ctx);
hordes(ctx);
Z.escapes(ctx);
Z.npcStep(ctx);
zombiesAct(ctx);
}
function after(ctx,s,n){
ctx.present().forEach(function(c){if(c.hp<=0)ctx.kill(c,null,'傷と疲労が重なって');});
ctx.flush();
infection(ctx);
wounds(ctx);
if(part(ctx)===3){hunger(ctx);despair(ctx);}
ctx.present().forEach(function(c){ctx.stress(c,0.5+(part(ctx)===3?2:0)+(here(ctx,c).length? -1.5:1.5));});
if(s===n-1)finale(ctx);
ctx.flush();
}
function intro(ctx){Z.intro(ctx);var rl=(HK.Attr&&HK.Attr.raceIntro?HK.Attr.raceIntro(ctx.present(),'alert',ctx):'');if(rl)ctx.say({text:rl});}
function morning(ctx){
var zb=ctx.zb,rng=ctx.rng,d=day(ctx);
zb.A.forEach(function(A){A.z=HK.clamp(A.z*(1.05+ctx.env.outbreak/900)+2+rng()*4,0,100);A.bar=Math.max(0,A.bar-0.05);});
var t=d+'日目の朝。';
if(ctx.stepIndex===zb.net||(ctx.stepIndex>zb.net&& !zb.netDown)){zb.netDown=true;t+='スマホの電波が、ついに消えた。もう誰とも連絡は取れない。';}
else if(!zb.netDown&&rng()<0.4)t+=rng.pick(['ラジオは同じ避難の呼びかけを繰り返している。','SNSのタイムラインは、悲鳴と祈りとデマで埋まっていた。','遠くで、ヘリのローター音が聞こえた気がした。']);
else t+=rng.pick(['街のどこかで、火事の煙が上がっている。','昨日より、呻き声が近い。','朝なのに、鳥の声が一つもしない。']);
if(lastDay(ctx))t+=ctx.env.end==='heli'?'今日、救助が来る――そういう噂だった。':ctx.env.end==='burn'?'上空を、爆撃機らしき影が旋回していた。':'最後の一日だ。';
ctx.say({text:t});
ctx.present().forEach(function(c){
var f=c.z.family;
if(!f||f.pc!=null||f.state!=='ok')return;
var risk=f.inside?AR(ctx,f.area).z/100*0.18:0.04;
if(rng()<risk)f.state=rng()<0.55?'zombie':'dead';
if(zb.netDown||rng()>0.45)return;
var k=f.state==='ok'?(rng()<0.75?'ok':'silent'):rng()<0.6?'bad':'silent';
if(k==='ok'&&f.inside&&rng()<0.3){var na=rng.pick(Z.adj(f.area));f.area=na;}
var raw=rng.pick(Z.FAMILY_NEWS[k]);
var txt=ctx.t(raw,c).replace(/\{f\}/g,/\{a\}/.test(raw)?f.rel:c.name+'の'+f.rel).replace(/\{place\}/g,f.inside?an(ctx,f.area):'街の外の避難所');
if(k==='bad'){f.heard=true;ctx.stress(c,22);}
ctx.act2({actors:[c],cat:'solo',text:txt,why:'家族との連絡（電波が生きているうち）',mag:k==='bad'?20:6});
Z.goalShift(ctx,c,k==='bad'?'familyBad':null);
});
}
function shelterFalls(ctx){
var zb=ctx.zb,A=AR(ctx,zb.safe);
A.fallen=true;A.z=Math.min(100,A.z+55);
var P=inArea(ctx,zb.safe);
ctx.say({kind:'event',cat:'phase',actors:P,text:A.name+'が落ちた。'+(zb.reg==='us'?'州兵のバリケード':'バリケード')+'の内側で、誰かが発症したのだ。'+(P.length?names(P)+'は、悲鳴の中を逃げ出すしかなかった。':'安全な場所は、もうどこにもないのかもしれない。'),why:'安全だった場所も、いつかは落ちる',mag:30});
P.forEach(function(c){ctx.stress(c,15);});
zb.safe= -1;
}
function exitArea(ctx,c){
var ex=[];
ctx.zb.A.forEach(function(A,i){if(A.def.exit)ex.push(i);});
return ex.sort(function(x,y){return Z.dist(c.z.area,x)-Z.dist(c.z.area,y);})[0];
}
function foodArea(ctx,c){
var best=c.z.area,bv= -1;
ctx.zb.A.forEach(function(A,i){var v=A.food*2-Z.dist(c.z.area,i)*3-A.z/10;if(v>bv){bv=v;best=i;}});
return best;
}
function destOf(ctx,c){
var z=c.z,g=c.goal.id,f=z.family;
if(z.cult!=null){var np=ctx.zb.npcs[z.cult];if(np&&np.alive)return np.area;}
if(z.alone)return z.area;
if(Z.cureDest){var cd=Z.cureDest(ctx,c);if(cd!=null)return cd;}
if(Z.obsDest){var od=Z.obsDest(ctx,c);if(od!=null)return od;}
if(Z.seekDest&&g==='seek'){var sd=Z.seekDest(ctx,c);if(sd!=null)return sd;}
if(ctx.env.end==='burn'&&(z.know.burn||day(ctx)>=ctx.env.days-1))return exitArea(ctx,c);
if(lastDay(ctx)&&z.heliAt!=null)return z.heliAt;
if(g==='escape')return exitArea(ctx,c);
if(g==='family'&&f){
if(f.pc!=null){var k=ctx.chars[f.pc];return k.alive&& !k.out?k.z.area:z.area;}
if(f.inside&& !f.found)return f.area;
if(!f.inside)return exitArea(ctx,c);
}
if(g==='protect'&&c.focus&&c.focus.alive&& !c.focus.out)return c.focus.z.area;
if(z.drug&& !z.drugDone&&z.bitten){var h=3;return h;}
if(z.food<=0&&c.z.hunger>=1)return foodArea(ctx,c);
if(z.safe!=null&&z.safe!==z.area)return z.safe;
if(c.action.id==='loot'&&AR(ctx,z.area).food<=1)return foodArea(ctx,c);
var sh=ctx.zb.A.filter(function(A){return A.def.shelter;})[0];
if(sh&&sh.fallen)z.noShelter=true;
if(sh&& !z.noShelter&&(c.action.id!=='hole'||AR(ctx,z.area).z>55)&&(g==='live'||g==='protect'||g==='family'))return sh.i;
if(AR(ctx,z.area).z>62)return Z.adj(z.area).sort(function(x,y){return AR(ctx,x).z-AR(ctx,y).z;})[0];
if(c.action.id==='seek'){
var want=ctx.chars.filter(function(o){return o!==c&&o.alive&& !o.out&&(ctx.R(c,o).aff>35||tieT(ctx,c,o));}).sort(function(x,y){return ctx.R(c,y).aff-ctx.R(c,x).aff;})[0];
if(want)return want.z.area;
}
return z.area;
}
Z.destOf=destOf;
function groups(ctx){
var P=ctx.present(),par={};
P.forEach(function(c){par[c.i]=c.i;});
function f(x){while(par[x]!==x)x=par[x]=par[par[x]];return x;}
P.forEach(function(a){
P.forEach(function(b){
if(a.i>=b.i||a.z.area!==b.z.area||a.z.alone||b.z.alone||a.z.cult!=null||b.z.cult!=null)return;
var pf=ctx.pair(a,b),t=tieT(ctx,a,b),TD=t?HK.TIES[t]:null;
if(pf.allied||(TD&&TD.pol>0)||(ctx.R(a,b).trust>14&&ctx.R(b,a).trust>14&&ctx.R(a,b).ten<50))par[f(a.i)]=f(b.i);
});
});
var G={};
P.forEach(function(c){var r=f(c.i);(G[r]=G[r]||[]).push(c);});
return Object.keys(G).map(function(k){return G[k];});
}
Z.groups=groups;
function moveAll(ctx){
var rng=ctx.rng,night=part(ctx)===3,lines=[];
groups(ctx).forEach(function(g){
var lead=ctx.most(g,function(c){return c.tr.lead+(c.goal.id==='escape'||c.goal.id==='family'?0.2:c.goal.id==='obsess'?0.35:c.goal.id==='seek'?0.3:0);});
var gd=destOf(ctx,lead);
var go=g.slice();
if(g.length>1)g.forEach(function(c){
if(c===lead)return;
var d=destOf(ctx,c);
if(d!==gd&&d!==c.z.area&&(c.goal.id==='family'||c.goal.id==='protect'||c.goal.id==='obsess'||c.goal.id==='seek'||(c.goal.id==='escape'&&rng()<0.4))&&rng()<(c.goal.id==='obsess'||(Z.seekBold&&Z.seekBold(ctx,c))?0.85:c.goal.id==='seek'?0.6:0.55)-ctx.R(c,lead).aff/250){
go.splice(go.indexOf(c),1);
moveOne(ctx,[c],d,lines);
ctx.act2({actors:[c,lead],cat:'solo',fx:function(){ctx.mod2(c,lead,{trust: -3},{trust: -2,ten:3});},text:ctx.t(ctx.pick(['{a}は「ここで別れる｜＝｜ここで別れます」と言った。{b}が止める前に、{a}はもう背中を向けていた。','{a}は{b}たちに頭を下げて、一人で'+an(ctx,Z.step(c.z.area===d?lead.z.area:c.z.path[c.z.path.length-1],d))+'の方へ歩き出した。','「行かなきゃいけない場所がある｜行かなければならない場所がある｜行かなければならない場所があります」――{a}は{b}の制止を振り切った。']),c,lead),why:c.name+'の目標「'+c.goal.label+'」が、群れの行き先と違った'});
}
});
if(!go.length||gd===lead.z.area)return;
if(night&&rng()<(lead.goal.id==='obsess'?0.35:Z.seekBold&&Z.seekBold(ctx,lead)?0.2:lead.goal.id==='seek'?0.6:0.75)&&AR(ctx,lead.z.area).z<70)return;
moveOne(ctx,go,gd,lines);
});
if(lines.length)ctx.say({kind:'phase',cat:'phase',text:'移動：'+lines.join('／')});
meetings(ctx);
}
function moveOne(ctx,g,dest,lines){
var from=g[0].z.area,to=Z.step(from,dest);
if(to===from)return;
g.forEach(function(c){c.z.area=to;c.z.moved=true;c.z.path.push(to);});
lines.push(names(g)+' '+an(ctx,from)+'→'+an(ctx,to));
}
function meetings(ctx){
var P=ctx.present();
P.forEach(function(a){
if(!a.z.moved)return;
var there=P.filter(function(o){return o!==a&&o.z.area===a.z.area&& !ctx.pair(a,o).zmet;});
if(!there.length)return;
var b=ctx.most(there,function(o){return Math.abs(ctx.R(a,o).aff)+ctx.R(a,o).att+(tieT(ctx,a,o)?50:0);});
there.forEach(function(o){ctx.pair(a,o).zmet=true;});
var to=a.z.area,t0=tieT(ctx,a,b),TD=t0?HK.TIES[t0]:null;
if(HK.HateKit){
var HKt=HK.HateKit,la=HKt.level(ctx,a,b),lb=HKt.level(ctx,b,a);
if(la>=35||lb>=35){
var hx=la>=lb?a:b,hy=hx===a?b:a,hm=HKt.meet(ctx,hx,hy,an(ctx,to)+'で、');
(ctx.pair(hx,hy).hkMet=ctx.pair(hx,hy).hkMet||{})[hx.i]=1;
return ctx.act2({actors:[hx,hy],cat:hm.cat,text:hm.text,why:hm.why,mag:hm.mag});
}
}
if(Z.reunion){var rr=Z.reunion(ctx,a,b,to);if(rr)return ctx.act2(rr);}
var kind=TD&&TD.pol>0?'kin':ctx.R(a,b).ten>35||(TD&&TD.pol<0)?'bad':ctx.R(a,b).aff+ctx.R(b,a).aff>40?'good':'new';
var T={
kin:['{a}は'+an(ctx,to)+'で{b}の姿を見つけた。生きていた――{a}は駆け寄って、{b}の肩を掴んだ。','{a}と{b}は、'+an(ctx,to)+'で互いに武器を向けかけて、同時に名前を呼んだ。'],
good:[an(ctx,to)+'の物陰から現れたのは、{b}だった。{a}は構えた'+wname(a)+'を、ゆっくり下ろした。','{a}は'+an(ctx,to)+'で、見覚えのある顔を見つけた。{b}だ。知った顔がこんなに嬉しいとは思わなかった。'],
new:['{a}は'+an(ctx,to)+'で、{b}と出くわした。生きている人間を見るのは、半日ぶりだった。',an(ctx,to)+'の暗がりから、{b}が両手を上げて出てきた。「噛まれてない。人間だ｜噛まれていない。人間だ｜噛まれていません。人間です」','{a}が'+an(ctx,to)+'に着くと、先に{b}がいた。{b}は'+wname(b)+'を握ったまま、{a}をじっと見ていた。'],
bad:['{a}は'+an(ctx,to)+'で{b}と鉢合わせた。どちらも、武器を下ろさなかった。',an(ctx,to)+'にいたのは{b}だった。{a}は舌打ちをこらえた。よりによって、こいつか。']
}[kind];
ctx.act2({actors:[a,b],cat:kind==='bad'?'conflict':'bond',fx:function(){if(kind==='bad')ctx.mod2(a,b,{ten:6},{ten:6});else ctx.mod2(a,b,{aff:kind==='new'?3:8,trust:kind==='new'?5:8},{aff:kind==='new'?3:8,trust:kind==='new'?5:8});},
text:ctx.t(ctx.pick(T),a,b),why:{kin:'再会（'+(TD?(function(){var tt=HK.Ties.get(ctx,a,b);return HK.Sib&&HK.Sib.isSibTie(tt)&&HK.tieLabel?HK.tieLabel(tt):TD.label;})():'')+'）',good:'再会（好意）',new:'居合わせた',bad:'もともとの緊張'}[kind],mag:kind==='kin'?16:8});
});
}
var PACT=L('{a}と{b}は、どちらからともなく「一緒に行こう｜＝｜一緒に行きましょう」と言った。ひとりでいるよりは、ましだった。|{a}は{b}に、見張りを交代でやらないかと持ちかけた。{b}は少し迷ってから頷いた。|{a}と{b}は、無言で背中を合わせた。言葉より先に、生き延びるための同盟ができていた。|{b}は{a}を信用していなかった。それでも、夜をひとりで越すよりはいいと、{a}の差し出した手を取った。');
function pacts(ctx){Z.pacts(ctx);}
var HORDE={
open:L('{area}の角を曲がった瞬間、呻き声の壁にぶつかった。|{area}で、割れた窓から何十本もの腕が伸びてきた。|{area}の静けさは罠だった。物陰から、ゾンビの群れがあふれ出した。|{who}の足音に、{area}じゅうのゾンビが一斉に顔を上げた。|{area}に、どこからか腐臭が流れ込んできた。気づいたときには、通りの両側から群れが迫っていた。'),
night:L('夜の{area}で、懐中電灯の光が、こちらを向いた無数の白い目を照らした。|真っ暗な{area}で、すぐ近くから呻き声がした。一つではなかった。|夜の{area}に、ガラスの割れる音が響いた。バリケードが破られたのだ。'),
flee:L('{who}は振り返らずに走り、どうにか群れをまいた。|{who}は非常階段を駆け上がり、扉に鍵をかけて息をひそめた。|{who}は車の下に潜り込み、足音が遠ざかるまで息を止めていた。'),
fight:L('{who}は武器を構え、群れの先頭から一体ずつ頭を潰していった。|{who}は狭い通路に群れを誘い込み、入口で迎え撃った。|{who}は背中合わせになって、群れが途切れるまで武器を振るい続けた。'),
loud:L('銃声が響き渡り、{area}じゅうのゾンビが音の方へ集まってきた。|{w}の轟音が、遠くの群れまで呼び寄せてしまった。')
};
function power(c){return(c.weapon?c.weapon.pow:0)*5+c.hp*0.25+c.tr.aggr*12+c.tr.a*6;}
function hordes(ctx){
var rng=ctx.rng,tm=[0.8,0.7,1.0,1.35][part(ctx)];
groups(ctx).forEach(function(g){
g=g.filter(function(c){return c.alive&& !c.out;});
if(!g.length)return;
var A=AR(ctx,g[0].z.area);
var moved=g.some(function(c){return c.z.moved;});
var p=HK.clamp(A.z/100*tm*(moved?1.3:0.75)*(1-A.bar*0.6)*(g.some(function(c){return c.action.id==='hunt';})?1.3:1)*0.5,0,0.8);
if(rng()>p)return;
hordeEvent(ctx,g,A);
});
}
Z.hordeEvent=function(ctx,g,A){return hordeEvent(ctx,g,A);};
function hordeEvent(ctx,g,A){
var rng=ctx.rng,zb=ctx.zb,who=names(g);
var t=ctx.pick(part(ctx)===3&&rng()<0.6?HORDE.night:HORDE.open).replace(/\{area\}/g,A.name).replace(/\{who\}/g,who);
var pw=g.reduce(function(s,c){return s+power(c);},0)/Math.sqrt(g.length),threat=A.z*(0.6+rng()*0.8)*(part(ctx)===3?1.25:1);
var fight=g.some(function(c){return c.action.id==='hunt'||c.tr.aggr>0.6;})&&pw+rng()*30>threat*0.8;
var why=A.name+'のゾンビの多さ（'+Math.round(A.z)+'）'+(part(ctx)===3?'・夜':'');
var actors=g.slice(),mag=18;
if(fight){
t+=ctx.pick(HORDE.fight).replace(/\{who\}/g,who);
A.z=Math.max(0,A.z-8-pw/10);
g.forEach(function(c){c.z.kills+=1+rng.int(3);});
var gun=g.filter(function(c){return c.weapon&&c.weapon.loud;})[0];
if(gun){t+=ctx.pick(HORDE.loud).replace(/\{area\}/g,A.name).replace(/\{w\}/g,gun.weapon.name);A.z=Math.min(100,A.z+14);}
why+='／'+who+'の戦う力（武器・攻撃性）';
}else{
t+=ctx.pick(HORDE.flee).replace(/\{who\}/g,who);
why+='／逃げるしかなかった';
}
var risk=HK.clamp(A.z/100*0.2*(fight?0.8:1)*(part(ctx)===3?1.25:1),0.03,0.6)*HK.Dark.few(ctx);
if(rng()<risk){
var v=HK.weighted(rng,g,function(c){return 1.2/(0.6+luck(ctx,c)*0.25+(c.weapon?c.weapon.pow:0)*0.04)*(c.hp<50?1.4:1)*(c.z.bitten?0.6:1);});
var res=victim(ctx,g,v,A);
t+=res.text;why+='／'+res.why;mag=res.mag;
res.with.forEach(function(x){if(actors.indexOf(x)<0)actors.push(x);});
}else if(rng()<0.3){
var hurt=rng.pick(g);
hurt.hp-=8+rng.int(10);if(hurt.z.wound<0)hurt.z.wound=ctx.stepIndex;
var hurtDead=hurt.hp<=0?hurt:null;
t+=ctx.t(rng.pick(['逃げる途中で、{a}はガラスで腕を深く切った。','{a}は転んで、足首をひねった。傷口から血が止まらない。','{a}の肩を、ゾンビの爪がかすめた。咬まれてはいない――はずだ。']),hurt);
why+='／'+hurt.name+'が負傷（化膿すると危ない）';
}
g.forEach(function(c){if(c.alive)ctx.stress(c,8);});
ctx.act2({actors:actors.filter(function(c){return c;}),cat:fight?'combat':'escape',text:t,why:why,mag:mag});
if(typeof hurtDead!=='undefined'&&hurtDead&&hurtDead.alive){ctx.kill(hurtDead,null,A.name+'で負った傷が元で');ctx.flush();}
}
var VIC={
bite:L('――{v}の悲鳴が上がった。腕に、くっきりと歯形が残っていた。|――{v}は足首を掴まれて転び、ふくらはぎに歯を立てられた。|――{v}の首元に、生ぬるい息がかかった。振り払ったときには、もう肩口を咬まれていた。'),
scratch:L('――{v}は群れの中を抜けるとき、どこかを引っかかれた気がした。暗くて、よく見えなかった。'),
eaten:L('――{v}は群れの中に引きずり込まれた。伸ばした手は、誰にも届かなかった。|――{v}は転んだ。起き上がる前に、群れが覆いかぶさった。'),
save:L('――{s}は{v}の前に飛び出し、{v}の代わりに腕を咬まれた。「行って！｜行け！｜行ってください！」|――{s}は{v}を扉の内側へ突き飛ばし、自分は外に残った。扉の向こうで、{s}の叫び声が途切れた。'),
shut:L('――{x}は、{v}がまだ外にいるのを見て、それでも扉を閉めて鍵をかけた。扉を叩く{v}の声が、すぐに悲鳴に変わった。|――{x}は{v}の手を振りほどいて、一人で非常口へ走った。'),
bait:L('――{x}は、すぐ後ろにいた{v}の背中を、群れの方へ突き飛ばした。そのあいだに、{x}は逃げ切った。|――{x}は{v}の足を引っかけた。倒れた{v}に群れが群がる隙に、{x}は姿を消した。'),
drag:L('――{v}は群れの中に引きずり込まれかけた。{o}が{v}の腕を掴み、力ずくで引き戻した。この人数では、一人欠ければ残った者も長くはもたない。{v}の脚は深く裂かれ、しばらくは自分で歩けそうになかった。|'+
'――{v}は転んだ。覆いかぶさってくる群れの中から、{o}が{v}の襟首を掴んで引きずり出した。「＠{o}＠一人でも欠けたら終わりなんだから｜一人でも欠けたら終わりだ｜一人でも欠けたら終わりなんです」――{o}の声は震えていた。{v}は肩を深く裂かれ、その夜から熱を出して寝込んだ。'),
dragAlone:L('――{v}は群れの中に引きずり込まれかけたが、瓦礫の隙間に転がり込んで、どうにか難を逃れた。脚を深く裂かれ、しばらくは動けそうになかった。|――{v}は群れに押し倒されかけて、必死に這って逃げた。背中を深く引き裂かれ、物陰で丸一日、起き上がれなかった。')
};
function victim(ctx,g,v,A){
var rng=ctx.rng,out={text:'',why:'',mag:28,with:[]};
var others=g.filter(function(o){return o!==v;});
if(Z.tieVictim){var tv=Z.tieVictim(ctx,g,v,A);if(tv)return tv;}
var saver=others.filter(function(o){return ctx.R(o,v).aff>45&&o.tr.np>0.5;}).sort(function(x,y){return ctx.R(y,v).aff-ctx.R(x,v).aff;})[0];
if(saver&&rng()<0.18+saver.tr.np*0.3){
var dies=rng()<0.45;
ctx.pair(saver,v).sacrifice=saver.i;
ctx.mod(v,saver,{aff:30,trust:30,att:8});
out.text=ctx.pick(VIC.save).replace(/\{s\}/g,saver.name).replace(/\{v\}/g,v.name);
out.why=saver.name+'の'+v.name+'への想い（好意 '+Math.round(ctx.R(saver,v).aff)+'）とNP';
if(dies&& /外に残った/.test(out.text))ctx.kill(saver,null,v.name+'をかばって、群れに呑まれた');
else infect(ctx,saver,'horde',true);
out.mag=40;return out;
}
var cold=others.filter(function(o){return o.tr.cold+o.tr.aggr*0.5>0.95&&ctx.R(o,v).aff<25&& !spare(ctx,v,o);})[0];
if(cold&&rng()<(0.22+(cold.goal.id==='chaos'?0.25:0)+ctx.R(cold,v).ten/200)*HK.Dark.f(ctx,'grudge')){
var bait=cold.tr.aggr>0.55&&(ctx.R(cold,v).ten>30||cold.goal.id==='chaos')&&rng()<0.55;
out.text=ctx.pick(bait?VIC.bait:VIC.shut).replace(/\{x\}/g,cold.name).replace(/\{v\}/g,v.name);
out.why=cold.name+'のドライさ（'+Math.round(cold.tr.cold*100)+'）'+(bait?'と攻撃性。'+v.name+'への緊張 '+Math.round(ctx.R(cold,v).ten):'');
out.with=[cold];
ctx.pair(cold,v)[bait?'bait':'abandoned']=cold.i;
others.forEach(function(o){if(o!==cold)ctx.mod(o,cold,{trust: -25,ten:20});});
if(bait||rng()<0.55)ctx.kill(v,bait?cold:null,bait?cold.name+'にゾンビの群れへ突き飛ばされた':cold.name+'に扉の外へ締め出され、群れに呑まれた');
else{infect(ctx,v,'horde',true);v.z.leftBy=cold.i;}
ctx.mod(v,cold,{aff: -40,trust: -60,ten:40});
out.mag=45;return out;
}
var dk=HK.Dark.f(ctx,'kill'),e1=0.35*dk,e2=0.06*dk,r1=v.hp<40?rng():1,r2=r1<e1?1:rng();
var near=r1<e1?r1/e1:r2<e2?r2/e2:1;
if(near<1&&near>=HK.Dark.few(ctx)){
var dr=others.filter(function(o){return o.alive;}).sort(function(x,y){return ctx.R(y,v).aff-ctx.R(x,v).aff;})[0];
v.hp=Math.max(6,v.hp-25);if(v.z.wound<0)v.z.wound=ctx.stepIndex;ctx.stress(v,20);
out.text=ctx.pick(dr?VIC.drag:VIC.dragAlone).replace(/\{v\}/g,v.name).replace(/\{o\}/g,dr?dr.name:'');
out.why=v.name+'は群れに呑まれかけたが、重傷で済んだ（少人数：'+ctx.chars.length+'人。一人欠ければ残りも危うい）';
if(dr){ctx.mod(v,dr,{aff:12,trust:15});out.with=[dr];}
out.mag=34;return out;
}
if(near<1){
out.text=ctx.pick(VIC.eaten).replace(/\{v\}/g,v.name);
out.why=v.name+'の体力の消耗（'+Math.max(0,Math.round(v.hp))+'）と運';
ctx.kill(v,null,A.name+'でゾンビの群れに呑まれた');
out.mag=40;return out;
}
var scratch=rng()<0.22;
out.text=ctx.pick(scratch?VIC.scratch:VIC.bite).replace(/\{v\}/g,v.name);
out.why=v.name+'の運（'+luck(ctx,v)+'）';
infect(ctx,v,'horde',!scratch);
return out;
}
Z.victim=victim;
function infect(ctx,c,by,aware){
if(!c.alive||c.z.bitten)return;
var speed=1.7-ctx.env.turn/100*1.4;
var dur=Math.max(1,Math.round((1.5+ctx.stat(c,'hp')*0.7+luck(ctx,c)*0.6)*speed+ctx.rng()*3));
c.z.bitten={at:ctx.stepIndex,by:by};c.z.turnAt=ctx.stepIndex+dur;c.z.aware= !!aware;c.z.decided=false;
ctx.zb.stats.bites++;
ctx.stress(c,aware?30:5);
if(Z.onInfect)Z.onInfect(ctx,c,by,aware);
}
Z.infect=infect;
var BITE={
fever:L('{a}は、水を飲もうとして手が震えていることに気づいた。肩の小さな傷が、熱を持って脈打っていた。|{a}の耳の奥で、低い耳鳴りが止まらなかった。腕の引っかき傷を見て、すべてを理解した。|{a}は急に寒気がして、毛布を二枚重ねた。それでも震えは止まらなかった。足首の傷が、黒く変色していた。|{a}は、自分の爪の色がおかしいことに気づいた。思い当たる傷は、ひとつしかなかった。|{a}の額が、焼けるように熱い。袖をまくると、いつのまにか腕に小さな引っかき傷があり、まわりが黒ずんでいた。――あのときだ。|{a}は、指先の感覚がなくなっていることに気づいた。首筋の小さな傷が、脈打つように疼いていた。'),
hide:L('{a}は咬み跡を、袖の上から押さえた。誰にも言わない。言えば、どうなるか分かっている。|{a}は傷口に包帯を巻き、「ガラスで切った｜＝｜ガラスで切りました」と言った。声は落ち着いていた。|{a}は咬み跡を隠したまま、いつもより少しだけ明るく振る舞った。'),
tell:L('{a}は袖をまくって、咬み跡を見せた。「咬まれた。……ごめん｜咬まれた。……すまない｜咬まれました。……ごめんなさい」|{a}は皆の前で、静かに言った。「たぶん、もう長くない｜＝｜たぶん、もう長くありません」'),
leave:L('{a}は、眠っている{b}の顔をしばらく見つめてから、音を立てずに出ていった。置き手紙には「ありがとう｜＝｜ありがとうございました」とだけあった。|「先に行ってて。すぐ追いつくから｜先に行っていろ。すぐ追いつく｜先に行っていてください。すぐ追いつきますから」――{a}は{b}にそう言って、反対の方向へ歩き出した。追いつくつもりは、なかった。|{a}は{b}に咬み跡を見せずに、「一人で行きたいところがある｜＝｜一人で行きたいところがあります」とだけ言った。{b}は何も聞かずに頷いた。'),
promise:L('{a}は{b}の手を取り、自分の額に当てさせた。「その時が来たら、あなたがやって。ほかの誰でもなく｜その時が来たら、あなたがやってくれ。ほかの誰でもなく｜その時が来たら、ほかの誰でもなく、あなたがやってください」|{a}は{b}に、自分の武器を握らせた。「私が私じゃなくなったら、迷わないで｜私が私でなくなったら、迷うな｜私が私でなくなったら、迷わないでください」――{b}は答えられなかった。'),
suicide:L('{a}は、まだ自分が自分であるうちに、終わらせることにした。最後に書いたメモには、誰かの名前が一つだけあった。|{a}は皆から離れた部屋で、静かに目を閉じた。ゾンビになって誰かを襲うくらいなら――それが{a}の選んだ最後だった。'),
suicide1:L('{a}は、まだ自分が自分であるうちに、終わらせることにした。最後に書いたメモには、誰かの名前が一つだけあった。|{a}はひとりきりの部屋で、静かに目を閉じた。ゾンビになって誰かを襲うくらいなら――それが{a}の選んだ最後だった。'),
shinju:L('{a}は{b}に咬み跡を見せた。{b}は泣かなかった。「じゃあ、一緒に行こう｜では、一緒に行こう｜では、一緒に行きましょう」――二人は手を繋いだまま、屋上の縁に立った。|「あなたのいない世界で生き延びて、何になるの｜あなたのいない世界で生き延びて、何になる｜あなたのいない世界で生き延びて、何になるんですか」{b}はそう言って、{a}の手を握った。朝、二人は寄り添ったまま冷たくなっていた。|{a}と{b}は、最後の夜を二人きりで過ごした。残った薬を分け合って飲み、互いの名前を呼びながら眠った。'),
cut:L('{a}は噂を信じた。ベルトで二の腕をきつく縛り、{w}を振り上げた。|「切り落とせば助かるかもしれない｜＝｜切り落とせば助かるかもしれません」――{a}は歯を食いしばり、自分の腕に{w}を当てた。')
};
var FEW_CLEAN=1;
var FEW_CLEAN_T=L('{a}の咬み跡は赤く腫れたが、熱は出なかった。……どうやら、感染はしなかったらしい。|{a}は一晩じゅう、熱が出るのを待っていた。朝になっても、額は冷たいままだった。歯は、皮膚の奥までは届いていなかったらしい。');
function infection(ctx){
var s=ctx.stepIndex;
ctx.present().forEach(function(c){
var z=c.z;
if(!z.bitten|| !c.alive||c.out)return;
if(z.dkAt!==z.bitten.at){z.dkAt=z.bitten.at;if(HK.Dark.on(ctx,'kill')==='mild'&&ctx.rng()<0.75){z.bitten=null;z.turnAt= -1;if(z.aware)ctx.act2({actors:[c],cat:'solo',text:ctx.t('{a}の咬み跡は赤く腫れたが、熱は出なかった。……どうやら、感染はしなかったらしい。',c),why:'傷が浅かった（'+HK.Dark.tag(ctx,'kill')+'）',mag:18});return;}
var fw=HK.Dark.few(ctx);
if(fw<1&&ctx.rng()<(1-fw)*FEW_CLEAN){z.bitten=null;z.turnAt= -1;if(z.aware)ctx.act2({actors:[c],cat:'solo',text:ctx.t(ctx.pick(FEW_CLEAN_T),c),why:'傷が浅かった（運がよかった）',mag:18});return;}}
if(!z.aware&&s>=z.turnAt-1){z.aware=true;ctx.act2({actors:[c],cat:'solo',text:ctx.t(ctx.pick(BITE.fever),c),why:'気づかないうちに感染していた（引っかき傷）',mag:20});}
if(z.aware&& !z.decided&&s>z.bitten.at-1){z.decided=true;decide(ctx,c);}
if(Z.shinjuCheck&&c.alive&& !c.out&&Z.shinjuCheck(ctx,c))return;
if(c.alive&& !c.out&&s>=z.turnAt)turn(ctx,c);
});
}
function decide(ctx,c){
var rng=ctx.rng,mates=here(ctx,c),z=c.z;
var close=mates.slice().sort(function(x,y){return(ctx.R(c,y).aff+ctx.R(y,c).aff)-(ctx.R(c,x).aff+ctx.R(x,c).aff);})[0];
var lovers=mates.filter(function(o){var pf=ctx.pair(c,o);return(pf.couple||tieT(ctx,c,o)==='lover'||(ctx.R(c,o).att>55&&ctx.R(o,c).att>55))&&ctx.R(o,c).aff>55;});
var lover=lovers.length>1?ctx.most(lovers,function(o){return ctx.R(o,c).aff;}):lovers[0];
var opts=[];
if(mates.length){
opts.push(['hide',(1-c.tr.honesty)*0.9+c.tr.cold*0.3+(c.goal.id==='chaos'?0.4:0)]);
opts.push(['tell',c.tr.honesty*0.8+(close?ctx.R(c,close).trust/120:0)]);
opts.push(['leave',c.tr.np*0.7+c.tr.cp*0.2+(close?ctx.R(c,close).aff/200:0)]);
if(close&&ctx.R(c,close).trust>40)opts.push(['promise',c.tr.cp*0.4+c.tr.a*0.4+ctx.R(c,close).trust/150]);
if(lover&&(lover.tr.ac+lover.tr.jealous+lover.tr.np*0.5>1.2||ctx.R(lover,c).aff>80))opts.push(['shinju',0.5+lover.tr.ac*0.4+ctx.R(lover,c).aff/200]);
}
opts.push(['suicide',(c.tr.cp*0.3+c.tr.a*0.25+c.tr.cold*0.2)*(mates.length?0.45:0.75)+c.stress/700]);
if(z.know.cut&&c.weapon&&c.weapon.pow>=3)opts.push(['cut',0.4+c.tr.impulse*0.4]);
if(z.know.drug&& !z.drugDone)opts.push(['drug',0.5+c.tr.a*0.3]);
if(!mates.length)opts.push(['wait',0.6+c.tr.ac*0.3]);
if(Z.biteOpts)Z.biteOpts(ctx,c,opts,mates,close,lover);
var pick=HK.weighted(rng,opts,function(o){return Math.pow(Math.max(0.02,o[1]),2);})[0];
var LBL={hide:'隠す',tell:'打ち明ける',leave:'仲間から離れる',promise:'その時は頼むと託す',shinju:'恋人と心中する',suicide:'ゾンビになる前に終わらせる',cut:'腕を切り落とす',drug:'病院の薬に賭ける',wait:'一人で待つ'};
if(Z.BITE_LABEL)for(var lk in Z.BITE_LABEL)LBL[lk]=Z.BITE_LABEL[lk];
var why=c.name+'は咬まれたと知って「'+LBL[pick]+'」を選んだ（'+HK.egoType(c.eg).top+'優位の気質'+(lover&&pick==='shinju'?'・'+lover.name+'の想い':'')+'）';
switch(pick){
case'hide':
z.hiding=true;
ctx.act2({actors:[c],cat:'solo',text:ctx.t(ctx.pick(BITE.hide),c),why:why,mag:18});
break;
case'tell':
ctx.act2({actors:[c].concat(mates),cat:'solo',text:ctx.t(ctx.pick(BITE.tell),c),why:why,mag:22});
Z.groupReaction(ctx,c);
break;
case'leave':
z.alone=true;
var na=Z.adj(z.area).sort(function(x,y){return inArea(ctx,x).length-inArea(ctx,y).length;})[0];
var lvr=lover&&Z.loveLeave?lover:null;
ctx.act2({actors:[c,lvr||close],cat:'solo',fx:function(){ctx.mod(lvr||close,c,{aff:8});},text:lvr?Z.loveLeave(ctx,c,lvr):Z.leaveLetter&&ctx.rng()<0.8?Z.leaveLetter(ctx,c,close,mates):ctx.t(ctx.pick(BITE.leave),c,close),why:why+(lvr?'／恋人の'+lvr.name+'には、何も言わずに':''),mag:26});
z.area=na;z.path.push(na);
break;
case'promise':
ctx.pair(c,close).promise=c.i;
ctx.act2({actors:[c,close],cat:'romance',fx:function(){ctx.mod2(c,close,{trust:10,aff:6},{trust:10,aff:8});ctx.stress(close,20);},text:ctx.t(ctx.pick(BITE.promise),c,close),why:why,mag:26});
break;
case'shinju':
ctx.pair(c,lover).shinju=true;
ctx.act2({actors:[c,lover],cat:'romance',text:ctx.t(ctx.pick(BITE.shinju),c,lover),why:why,mag:55});
ctx.kill(c,null,lover.name+'と心中した（咬まれていた）');
ctx.kill(lover,null,'咬まれた'+c.name+'と心中した');
break;
case'suicide':
var dep=mates.filter(function(o){return ctx.R(c,o).aff>55&&o.stress>50&&ctx.R(o,c).aff>40;})[0];
if(dep&&c.tr.ac+c.tr.np+c.tr.jealous>1.4&&ctx.rng()<0.4){
if(spare(ctx,dep,c)){
ctx.pair(c,dep).noKillStop=c.i;
ctx.act2({actors:[c,dep],cat:'conflict',fx:function(){ctx.mod2(c,dep,{aff:4,ten:6},{ten:8});},text:ctx.t(ctx.pick(SPARE_TAKE),c,dep),why:why+'／'+dep.name+'を一人にできない想いはあったが、'+c.name+'は'+dep.name+'を「憎悪を持っても殺さない」相手にしている（相手ごとの設定）',mag:30});
break;
}
if(dep.tr.caution*0.5+dep.tr.aggr*0.4>ctx.rng()){
ctx.pair(c,dep).zmercyTry=c.i;
ctx.act2({actors:[c,dep],cat:'betray',fx:function(){ctx.mod2(c,dep,{ten:10},{ten:30,trust: -35});},text:ctx.t('{a}は咬み跡を押さえながら、{b}の首に手をかけた。「一人で残していけない」――{b}は{a}の手を振りほどいた。{a}は泣きながら、ひとりで部屋を出ていった。',c,dep),why:why+'／'+dep.name+'を残していけない（AC・NP・執着）が、'+dep.name+'は抵抗した',mag:45});
ctx.kill(c,null,'ゾンビになる前に、自ら命を絶った');
break;
}
ctx.pair(c,dep).zmercy=c.i;
ctx.act2({actors:[c,dep],cat:'death',text:ctx.t('{a}は{b}の寝顔を見下ろした。「一人で残していけない。ごめん｜一人で残していけない。すまない｜一人で残していけません。ごめんなさい」――朝、二人は並んで冷たくなっていた。',c,dep),why:why+'／'+dep.name+'を一人にできない想い（好意 '+Math.round(ctx.R(c,dep).aff)+'）',mag:55});
ctx.kill(dep,c,'「一人で残していけない」と言う'+c.name+'の手で');
ctx.kill(c,null,dep.name+'を道連れに、ゾンビになる前に命を絶った');
break;
}
ctx.act2({actors:[c],cat:'solo',text:ctx.t(ctx.pick(mates.length?BITE.suicide:BITE.suicide1),c),why:why,mag:40});
ctx.kill(c,null,'ゾンビになる前に、自ら命を絶った');
break;
case'cut':
var ok=ctx.rng()<HK.Dark.live(ctx,0.3+luck(ctx,c)*0.04,'kill')&&ctx.stepIndex-z.bitten.at<=2;
c.hp-=30;z.wound=ctx.stepIndex;
var tc=ctx.t(ctx.pick(BITE.cut),c).replace(/\{w\}/g,wname(c));
if(c.hp<=0){ctx.act2({actors:[c],cat:'solo',text:tc+'出血が止まらなかった。',why:why,mag:40});ctx.kill(c,null,'咬まれた腕を自分で切り落とし、失血で');break;}
if(ok){z.bitten=null;z.turnAt= -1;z.cut=true;}
ctx.act2({actors:[c],cat:'solo',text:tc+(ok?'……熱は、翌朝には引いていた。噂は本当だったのかもしれない。':'痛みで気を失いかけながら、{a}は傷口を焼いた。それでも、熱は引かなかった。'.replace(/\{a\}/g,c.name)),why:why+'／噂「'+Z.RUMORS.filter(function(r){return r.id==='cut';})[0].t+'」'+(ok?'（間に合った）':'（手遅れだった）'),mag:38});
break;
case'drug':
z.drug=true;
ctx.act2({actors:[c],cat:'solo',text:ctx.t('{a}は、病院に発症を遅らせる薬があるという噂に賭けることにした。',c),why:why,mag:12});
break;
default:
if(Z.biteRun&&Z.biteRun(ctx,c,pick,why,mates,close,lover))break;
ctx.act2({actors:[c],cat:'solo',text:ctx.t(ctx.pick((Z.BITTEN_ALONE||['{a}は一人きりの部屋で、咬み跡を眺めて夜を待った。']).map(function(x){return x.replace(/\{area\}/g,an(ctx,z.area));})),c),why:why,mag:15});
}
}
function turn(ctx,c,quiet){
var zb=ctx.zb,rng=ctx.rng,z=c.z;
var bestT=null,bv=90;
ctx.chars.forEach(function(o){
if(o===c|| !o.alive||o.out)return;
var v=ctx.R(c,o).aff+ctx.R(c,o).att+(['lover','parent','sibling'].indexOf(tieT(ctx,c,o))>=0?40:0);
if(v>bv){bv=v;bestT=o;}
});
var bond=bestT&&(c.tr.jealous>0.5||c.tr.ac>0.6||c.tr.np>0.65||bv>140)&&rng()<0.75;
c.alive=false;c.hp=0;c.diedAt=ctx.stepIndex;c.fate='ゾンビ化';c.deathLabel=ctx.label;
var src=z.bitten&&typeof z.bitten.by==='number'?ctx.chars[z.bitten.by].name+'に咬まれた傷から':z.bitten&&z.bitten.npc?z.bitten.npc+'に咬まれた傷から':'咬まれた傷から';
c.deathHow=src+'ゾンビになった';
c.fateNote=ctx.label+'、'+an(ctx,z.area)+'で'+c.deathHow+(bond?'。'+bestT.name+'を探してさまよっている':'');
zb.stats.turned++;
var zp={i:c.i,area:z.area,type:bond?'bond':'wild',target:bond?bestT.i:null,down:false,at:ctx.stepIndex};
zb.zpc.push(zp);
ctx.pending=ctx.pending||[];
ctx.pending.push({kind:'death',cat:'death',actors:[c],text:c.name+'　ゾンビ化　―― '+an(ctx,z.area)+'で、'+(bond?bestT.name+'の名前を呼ぶような呻き声を上げて':'人の言葉をなくして'),mag:60});
ctx.chars.forEach(function(o){if(o.alive&&o!==c&&ctx.R(o,c).aff>35){ctx.stress(o,ctx.R(o,c).aff*0.4);o.flags.grief=c.i;}});
ctx.flush();
var mates=inArea(ctx,z.area);
if(mates.length&& !quiet){
var t=z.hiding?ctx.t('隠していた咬み跡が、{a}の体を内側から変えた。{a}の目から光が消え、そばにいた仲間の方へ、ぎこちなく首を回した。',c)
:ctx.t(ctx.pick(['{a}の呼吸が止まった。数秒後、{a}の指がぴくりと動いた。目を開けた{a}は、もう{a}ではなかった。','{a}は苦しげに咳き込み、それから動かなくなった。次に顔を上げたとき、{a}の口からこぼれたのは、言葉ではなく呻き声だった。']),c);
ctx.act2({actors:[c].concat(mates),cat:'death',text:t,why:'発症（咬まれてから '+(ctx.stepIndex-(z.bitten?z.bitten.at:ctx.stepIndex))+' 区切り。体力'+ctx.stat(c,'hp')+'・運'+luck(ctx,c)+'）'+(bond?'／'+bestT.name+'への愛着が強く、その人だけを追うゾンビになった':''),mag:30});
zombieAttack(ctx,zp,true);
}
}
Z.turn=turn;
var ZA={
put:L('{d}は、{z}だったものの前に立った。「……ごめん｜……すまない｜……ごめんなさい」――{w}が振り下ろされ、{z}はもう二度と動かなかった。|{d}は{z}の目を見ないようにして、引き金を引いた。銃声のあと、{d}はしばらくその場から動けなかった。|{d}は{z}を抱きしめるようにして押さえ込み、自分の手で終わらせた。{d}の肩は、ずっと震えていた。'),
promise:L('{d}は約束を守った。{z}が目を開ける前に、{w}を振り下ろした。「その時は、あなたが｜＝｜その時は、あなたにお願いします」――あの声が、耳から離れなかった。|{d}は、{z}がゾンビとして立ち上がるのを待たなかった。それが、{z}との最後の約束だった。'),
hesitate:L('{v}は{z}を見て、動けなくなった。「……{z}？　分かる？　私だよ｜……{z}？　分かるか、私だ｜……{z}？　分かりますか、私です」――返事の代わりに、{z}が{v}に飛びかかった。|{v}は{z}の顔に、まだ{z}の面影を探してしまった。その一瞬の迷いで、腕を掴まれた。'),
bite:L('{z}の歯が、{v}の腕に食い込んだ。|{z}は{v}に覆いかぶさり、首筋に咬みついた。|{v}は{z}を振りほどいたが、手首にはくっきりと歯形が残っていた。'),
eat:L('{z}は{v}に飛びかかり、床に引きずり倒した。助けに入れる者は、誰もいなかった。|{z}の重みの下で、{v}は最後まで{z}の名前を呼んでいた。'),
flee:L('{v}は{z}の腕をすり抜け、扉の向こうへ逃げ込んだ。扉を叩く音が、朝まで続いた。|{v}は泣きながら走った。後ろから聞こえる足音が、{z}のものだと分かっていた。'),
seek:L('{z}は、{t}のいる方角へ、迷わずに歩き続けていた。|{z}は{t}がかつて通った道を、なぞるように歩いていた。'),
see:L('{v}は通りの向こうに、{z}の姿を見つけた。服も髪型も、最後に会ったときのままだった。顔だけが、違っていた。|{v}は、ガラス越しに{z}と目が合った。{z}は、{v}を見ても何も感じていないようだった。')
};
function zfill(t,m){return t.replace(/\{(\w+)\}/g,function(x,k){return m[k]!=null?m[k]:x;});}
function zombiesAct(ctx){
var rng=ctx.rng,zb=ctx.zb;
zb.zpc.forEach(function(zp){
if(zp.down||zp.at===ctx.stepIndex)return;
var c=ctx.chars[zp.i],T=zp.target!=null?ctx.chars[zp.target]:null;
if(zp.type==='bond'&&T&&T.alive&& !T.out){
if(T.z.area!==zp.area){
zp.area=Z.step(zp.area,T.z.area);
if(rng()<0.25)ctx.act2({actors:[c,T],cat:'phase',text:zfill(ctx.pick(ZA.seek),{z:c.name,t:T.name}),why:c.name+'はゾンビになっても、'+T.name+'への愛着だけが残っていた'});
}
if(T.z.area===zp.area&&rng()<0.75)return zombieAttack(ctx,zp,false);
}else{
if(zp.type==='bond')zp.type='wild';
if(Z.pairMove&&Z.pairMove(ctx,zp)){}
else if(rng()<0.45)zp.area=rng.pick(Z.adj(zp.area));
if(inArea(ctx,zp.area).length&&rng()<0.45)return zombieAttack(ctx,zp,false);
}
var v=inArea(ctx,zp.area).filter(function(o){return ctx.R(o,c).aff>30;})[0];
if(v&&rng()<0.3){ctx.stress(v,14);ctx.act2({actors:[v,c],cat:'solo',text:(Z.pairSee&&Z.pairSee(ctx,v,c,zp))||(Z.loverSee&&Z.loverSee(ctx,v,c))||zfill(ctx.pick(ZA.see),{v:v.name,z:c.name}),why:v.name+'の'+c.name+'への好意（'+Math.round(ctx.R(v,c).aff)+'）',mag:18});}
});
}
function zombieAttack(ctx,zp,first){
var rng=ctx.rng,zb=ctx.zb,c=ctx.chars[zp.i];
var P=inArea(ctx,zp.area);
if(!P.length)return;
var T=zp.target!=null&&P.indexOf(ctx.chars[zp.target])>=0?ctx.chars[zp.target]:HK.weighted(rng,P,function(o){return 1+ctx.R(c,o).aff/60;});
if(!T)T=rng.pick(P);
if(Z.loverZombie&& !zp.loveDone){
var lvs=P.filter(function(o){return Z.isLover(ctx,o,c);}),lv0=lvs.length>1?ctx.most(lvs,function(o){return ctx.R(c,o).aff;}):lvs[0];
if(lv0){T=lv0;if(Z.loverZombie(ctx,zp,T,P))return;}
}
if(Z.crushZombie&&Z.crushZombie(ctx,zp,P))return;
var prom=P.filter(function(o){return ctx.pair(o,c).promise===c.i;})[0];
var d=prom||ctx.most(P,function(o){return o.tr.cp*0.4+o.tr.a*0.3+o.tr.cold*0.35+o.tr.aggr*0.2+(o.weapon?o.weapon.pow*0.05:0)-Math.max(0,ctx.R(o,c).aff)/110;});
var will=d.tr.cp*0.4+d.tr.a*0.3+d.tr.cold*0.35+d.tr.aggr*0.2+(d.weapon?d.weapon.pow*0.05:0)-Math.max(0,ctx.R(d,c).aff)/110+(prom?0.45:0);
var actors=[c].concat(P);
if(will>0.42+rng()*0.5&& !(d===T&&first&&rng()<0.4)){
zp.down=true;zb.stats.putdown++;
ctx.pair(d,c).putdown=d.i;
var t=zfill(ctx.pick(prom?ZA.promise:ZA.put),{d:d.name,z:c.name,w:wname(d)});
ctx.stress(d,12+Math.max(0,ctx.R(d,c).aff)*0.4);
c.fateNote+='。最後は'+d.name+'の手で眠らされた';
ctx.act2({actors:actors,cat:'combat',text:t,why:d.name+'の決断（CP・A・ドライさ'+(prom?'・約束':'')+'）／'+c.name+'への好意 '+Math.round(ctx.R(d,c).aff),mag:40});
return;
}
var hes=ctx.R(T,c).aff>45,t2=hes?zfill(ctx.pick(ZA.hesitate),{v:T.name,z:c.name}):'';
var r=rng()-(hes?0.15:0)+(T.weapon?T.weapon.pow*0.02:0)+luck(ctx,T)*0.03;
var why=(zp.type==='bond'&&zp.target===T.i?'ゾンビになった'+c.name+'は、'+T.name+'だけを追ってきた':'ゾンビになった'+c.name+'は、目の前にいた'+T.name+'を襲った')+(hes?'／'+T.name+'の迷い（好意 '+Math.round(ctx.R(T,c).aff)+'）':'');
var eatP=0.22*HK.Dark.few(ctx);
if(r<eatP&&Z.riseTogether&&rng()<Z.riseChance(ctx,zp,T)){
ctx.pair(T,c).zbite=c.i;
Z.riseTogether(ctx,zp,T,{pre:t2});
}else if(r<eatP){
ctx.pair(T,c).zkill=c.i;
ctx.act2({actors:actors,cat:'death',text:t2+zfill(ctx.pick(ZA.eat),{v:T.name,z:c.name}),why:why,mag:50});
ctx.kill(T,c,'ゾンビになった'+c.name+'に喰い殺された');
}else if(r<0.62){
ctx.pair(T,c).zbite=c.i;
ctx.act2({actors:actors,cat:'combat',text:t2+zfill(ctx.pick(ZA.bite),{v:T.name,z:c.name}),why:why,mag:40});
infect(ctx,T,c.i,true);
}else{
var fi=Z.fleeInfect?Z.fleeInfect(ctx,zp,T,hes):'';
ctx.act2({actors:actors,cat:'escape',text:t2+zfill(ctx.pick(ZA.flee),{v:T.name,z:c.name})+fi,why:why+'／'+T.name+'の運と武器'+(fi?'／逃げ切ったが、感染していた':''),mag:fi?32:24});
ctx.stress(T,15);
if(zp.type==='bond'&&T.alive){var na=rng.pick(Z.adj(T.z.area));T.z.area=na;T.z.path.push(na);}
}
}
Z.zombieAttack=zombieAttack;
function wounds(ctx){
ctx.present().forEach(function(c){
var z=c.z;
if(z.wound<0||z.bitten)return;
var age=ctx.stepIndex-z.wound;
if(age>=2&& !z.fever&&ctx.rng()<0.1+ctx.stat(c,'hp')*0.03){z.wound= -1;return;}
if(age>=4&&ctx.rng()<0.3*HK.Dark.f(ctx,'kill')*HK.Dark.few(ctx)){
c.hp-=4+ctx.rng.int(6);ctx.stress(c,5);
if(!z.fever){z.fever=true;ctx.act2({actors:[c],cat:'solo',text:ctx.t(ctx.pick(Z.FESTER||['{a}の傷口が赤く腫れ、熱を持ち始めた。']),c),why:'負傷から '+age+' 区切り、手当てができていない',mag:15});}
if(c.hp<=0)ctx.kill(c,null,'傷口からの感染症で、高熱にうなされたまま');
}
});
}
function hunger(ctx){
var rng=ctx.rng;
ctx.present().forEach(function(c){
var z=c.z;
if(z.food>0){z.food--;z.hunger=Math.max(0,z.hunger-1);return;}
z.hunger++;
c.hp-=(5+z.hunger*5-ctx.stat(c,'hp'))*HK.Dark.f(ctx,'wipe')*HK.Dark.few(ctx);
ctx.stress(c,6+z.hunger*3);
if(z.hunger===2||(z.hunger>=3&&rng()<0.4))ctx.act2({actors:[c],cat:'solo',text:ctx.t(rng.pick(Z.HUNGER||['{a}の手持ちの食料は、もう何もない。水だけで、また一日が終わった。']),c),why:'食料が尽きて '+z.hunger+' 日目',mag:10});
if(c.hp<=0)ctx.kill(c,null,'飢えと渇きで倒れた');
});
}
var DESP={
stop:L('{a}が窓枠に足をかけたとき、{b}が後ろから抱きついて引きずり下ろした。「勝手に終わるな｜＝｜勝手に終わらないでください」――{a}は{b}の腕の中で、声を上げて泣いた。|{b}は、{a}が手にしていた薬の瓶を取り上げた。何も言わずに、ただ隣に座った。'),
alone:L('{a}は、もう走れなかった。誰もいない{area}の片隅で、{a}は自分で自分を終わらせた。|{a}は最後に、空を見上げた。どこにも、ヘリの音はしなかった。|{a}の残したメモには、「ごめん、もう無理だった｜すまない、もう無理だった｜ごめんなさい、もう無理でした」とだけ書かれていた。'),
group:L('{a}は、皆が眠っている間に部屋を抜け出した。朝、{a}は非常階段の踊り場で見つかった。もう息はなかった。|{a}は見張りの交代の時間になっても、戻ってこなかった。屋上の柵の外に、{a}の靴がそろえて置いてあった。'),
take:L('「一人で置いていけない｜＝｜一人で置いていけません」――{a}は眠っている{b}の上に、そっと覆いかぶさった。そして、自分も後を追った。|{a}は{b}の手を握り、「先に行って。すぐ行くから｜先に行け。すぐ行く｜先に行ってください。すぐ行きますから」と言った。{b}が目を閉じたあと、{a}は約束を守った。'),
fail:L('{a}は{b}を手にかけようとした。{b}は目を覚まし、{a}を突き飛ばした。「何するんだよ！｜何をする！｜何するんですか！」――{a}は自分の手を見つめて、崩れ落ちた。')
};
function despair(ctx){
var rng=ctx.rng;
ctx.present().forEach(function(c){
if(!c.alive||c.out)return;
var mates=here(ctx,c),grief=c.flags.grief!=null;
var risk=(c.stress-76)/100+(c.z.bitten&&c.z.aware?0.06:0)+(grief?0.05:0)+(c.z.family&&c.z.family.heard?0.04:0)-c.tr.fc*0.06-c.tr.np*0.03-c.tr.cp*0.03;
if(!mates.length)risk*=1.4;
if(risk<=0||rng()>risk*0.35*HK.Dark.f(ctx,'kill')*HK.Dark.few(ctx))return;
var dep=mates.filter(function(o){return ctx.R(c,o).aff>45&&(o.stress>40||(o.z.bitten&&o.z.aware)||tieT(ctx,c,o)==='parent'||tieT(ctx,c,o)==='lover');})[0];
if(dep&&c.tr.ac+c.tr.np+c.tr.jealous>1.2&&rng()<0.7){
if(spare(ctx,dep,c)){
ctx.pair(c,dep).noKillStop=c.i;
c.stress=Math.max(0,c.stress-20);
ctx.act2({actors:[c,dep],cat:'conflict',fx:function(){ctx.mod2(c,dep,{aff:4,ten:6},{ten:8});},text:ctx.t(ctx.pick(SPARE_TAKE),c,dep),why:c.name+'の絶望（焦り '+Math.round(c.stress+20)+'）／'+c.name+'は'+dep.name+'を「憎悪を持っても殺さない」相手にしている（相手ごとの設定）',mag:30});
return;
}
var resist=dep.tr.caution*0.5+dep.tr.aggr*0.4+(dep.stress<75?0.2:0)>rng();
if(resist){
ctx.pair(c,dep).zmercyTry=c.i;
ctx.act2({actors:[c,dep],cat:'betray',fx:function(){ctx.mod2(c,dep,{ten:10},{ten:35,trust: -40});},text:ctx.t(ctx.pick(DESP.fail),c,dep),why:c.name+'の「一人では置いていけない」（AC・NP）／'+dep.name+'が抵抗した',mag:38});
c.stress=Math.min(100,c.stress+10);
return;
}
ctx.pair(c,dep).zmercy=c.i;
ctx.act2({actors:[c,dep],cat:'death',text:ctx.t(ctx.pick(DESP.take),c,dep),why:c.name+'の絶望（焦り '+Math.round(c.stress)+'）と、'+dep.name+'を一人にできない想い（好意 '+Math.round(ctx.R(c,dep).aff)+'）',mag:55});
ctx.kill(dep,c,'「一人では置いていけない」と言う'+c.name+'の手で');
ctx.kill(c,null,dep.name+'を道連れに、自ら命を絶った');
return;
}
var st=mates.filter(function(o){return ctx.R(o,c).aff>30;}).sort(function(x,y){return ctx.R(y,c).aff-ctx.R(x,c).aff;})[0];
if(st&&rng()<HK.Dark.live(ctx,st.tr.np*0.6+ctx.R(st,c).aff/150,'kill')){
c.stress=Math.max(0,c.stress-35);
ctx.act2({actors:[c,st],cat:'help',fx:function(){ctx.mod2(c,st,{aff:12,trust:15},{aff:8,trust:6});},text:ctx.t(ctx.pick(DESP.stop),c,st),why:c.name+'の追い詰められ方（焦り '+Math.round(c.stress+35)+'）／'+st.name+'が止めた（好意 '+Math.round(ctx.R(st,c).aff)+'・NP）',mag:35});
return;
}
ctx.act2({actors:[c].concat(mates),cat:'death',text:ctx.t(ctx.pick(mates.length?DESP.group:DESP.alone),c).replace(/\{area\}/g,an(ctx,c.z.area)),why:c.name+'の追い詰められ方（焦り '+Math.round(c.stress)+'）'+(grief?'・大切な人を失った':'')+(mates.length?'':'・ひとりきり'),mag:45});
ctx.kill(c,null,'絶望の果てに、自ら命を絶った');
});
}
function finale(ctx){
var zb=ctx.zb,env=ctx.env,P=ctx.present();
if(env.end==='heli'){
var at=zb.heli,got=P.filter(function(c){return c.z.area===at&&c.z.keep==null;});
ctx.say({text:'最終日の夜明け前。ローター音が、'+an(ctx,at)+'の上空に近づいてきた。'});
if(got.length){
got.forEach(function(c){c.out=true;c.fate='救助された';c.fateNote=an(ctx,at)+'から救助ヘリで街を出た';});
ctx.say({kind:'event',cat:'escape',actors:got,text:names(got)+'は、'+an(ctx,at)+'に降りてきたヘリに飛び乗った。眼下の街が、ゆっくりと遠ざかっていった。',why:'救助ヘリの着陸地点（'+an(ctx,at)+'）にいた',mag:50});
}
var miss=ctx.present();
if(miss.length)ctx.say({kind:'event',cat:'phase',actors:miss,text:names(miss)+'は、遠ざかるローター音を、'+miss.map(function(c){return an(ctx,c.z.area);}).filter(function(v,i,a){return a.indexOf(v)===i;}).join('や')+'で聞いていた。'+(miss.some(function(c){return c.z.heliAt!=null&&c.z.heliAt!==at;})?'信じていた噂の場所は、違っていた。':''),why:'救助ヘリの場所を知らなかった／デマを信じていた',mag:25});
}else if(env.end==='burn'){
ctx.say({text:'最終日の夜。空が白く光った。'});
P.forEach(function(c){ctx.kill(c,null,'街ごと焼き払われた');});
ctx.flush();
}
ctx.present().forEach(function(c){c.fate='生き延びた';c.fateNote=env.days+'日目の夜明けを、'+an(ctx,c.z.area)+'で迎えた'+(c.z.keep!=null?'。閉じ込めた'+ctx.chars[c.z.keep].name+'のそばで、これからも暮らしていく':'');});
}
function finish(ctx){
var zb=ctx.zb;
ctx.chars.forEach(function(c){if(c.alive&& !c.out&&c.fate!=='生き延びた'){c.fate='生き延びた';}});
var notes=[];
notes.push('安全な場所の真相：'+(zb.safeOrig!=null&&zb.safeOrig>=0?an(ctx,zb.safeOrig)+'は本当に安全だった'+(zb.fallAt>=0&&zb.fallAt<=ctx.stepIndex?'（'+Math.floor(zb.fallAt/4+1)+'日目に落ちた）':''):'街に安全な場所はなかった'));
if(ctx.env.end==='heli')notes.push('救助ヘリの着陸地点：'+an(ctx,zb.heli));
ctx.flags.endNotes=notes;
var esc=ctx.chars.filter(function(c){return c.out;});
ctx.flags.outcome=esc.length+ctx.present().length?'生存 '+(esc.length+ctx.present().length)+'/'+ctx.chars.length+'人':'全滅';
ctx.flags.zombie={
map:{names:zb.A.map(function(A){return A.name;}),z0:zb.z0||[],z1:zb.A.map(function(A){return Math.round(A.z);}),shelter:zb.A.map(function(A){return!!A.def.shelter;}),exit:zb.A.map(function(A){return!!A.def.exit;}),safe:zb.safeOrig,fell:zb.fallAt>=0&&zb.fallAt<=ctx.stepIndex,heli:ctx.env.end==='heli'?zb.heli: -1,
chars:ctx.chars.map(function(c){var zp=zb.zpc.filter(function(z){return z.i===c.i;})[0];return{s:c.z.start,l:zp&& !zp.down?zp.area:c.z.area,f:c.fate||''};})},
reg:zb.reg,stats:zb.stats,days:ctx.env.days,
zpc:zb.zpc.map(function(z){return{i:z.i,type:z.type,target:z.target,down:z.down,area:an(ctx,z.area)};}),
npcs:zb.npcs.map(function(n){return{name:n.name,type:n.type,alive:n.alive,note:n.note||''};}),
chars:ctx.chars.map(function(c){return{start:an(ctx,c.z.start),last:an(ctx,c.z.area),weapon:wname(c),kills:c.z.kills,bitten: !!c.z.bitten,family:c.z.family?(c.z.family.pc!=null?null:c.z.family.rel+'：'+({ok:c.z.family.found?'合流できた':'最後に聞いた限りでは無事',zombie:c.z.family.found?'ゾンビになっていた':c.z.family.heard?'最後の連絡は悪い知らせだった':'安否不明',dead:c.z.family.found?'亡くなっていた':c.z.family.heard?'最後の連絡は悪い知らせだった':'安否不明'}[c.z.family.state]||'')):null};})
};
}
var setup0=setup;
setup=function(ctx){setup0(ctx);ctx.zb.safeOrig=ctx.zb.safe;ctx.zb.z0=ctx.zb.A.map(function(A){return Math.round(A.z);});};
scen.setup=function(ctx){setup(ctx);};
})();
});
;
/* ==== js/zombie-opening.js ==== */
HK.Load.def(141,'js/zombie-opening.js',function(){
(function(){
'use strict';
var HK=window.HK,Z=HK.ZB;
function L(s){return s.split('|');}
function names(list){return list.map(function(c){return c.name;}).join('・');}
function an(ctx,i){return ctx.zb.A[i].name;}
function wname(c){return c.weapon?c.weapon.name:'素手';}
function f(t,m){return t.replace(/\{(\w+)\}/g,function(x,k){return m[k]!=null?m[k]:x;});}
var OPEN={
attack:{
w:1.4,
t:L('{area}のドアが内側から破られた。{g}は、悲鳴を上げる暇もなく走り出していた。――始まりは、逃げている最中だった。|「伏せて！｜伏せろ！｜伏せてください！」――{a}の声と同時に、窓ガラスが砕けて腕が何本も突っ込んできた。{area}での最初の一分は、ただ必死だった。|{a}は{w}を握りしめたまま、{area}の通路を後ずさっていた。目の前のゾンビは、ついさっきまで隣で喋っていた誰かの顔をしていた。|エレベーターの扉が開いた瞬間、そこにいたのは乗客ではなかった。{g}は{area}の非常階段へ転がり込んだ。'),
fx:'attack'
},
hide:{
w:1.1,
t:L('{g}は{area}の倉庫に閉じこもって、もう六時間になる。扉の向こうを、足を引きずる音が何度も行き来した。|{area}の更衣室のロッカーの中で、{a}は膝を抱えていた。隙間から、外をうろつく影が見えた。|{g}は{area}のトイレの個室に鍵をかけ、スマホの明かりを手で覆っていた。電池は残り12%。'),
fx:'calm'
},
wake:{
w:0.9,
t:L('{a}が目を覚ましたのは、{area}の床の上だった。何があったのか思い出せない。ただ、口の中に血の味がした。|{a}は点滴の針を引き抜いて、ベッドから起き上がった。誰もいない病棟に、ナースコールだけが鳴り続けていた。|{a}は横転した車の中で意識を取り戻した。シートベルトを外すと、窓の外から白く濁った目がこちらを覗いていた。'),
fx:'hurt'
},
work:{
w:1,
t:L('{g}は、仕事中だった。{area}のレジの前で客が倒れ、起き上がったとき、もう客ではなかった。|{a}は{area}で、いつもどおりの一日を始めるはずだった。同僚が窓の外を指さして「なにあれ」と言うまでは。|{area}の朝礼の最中に、警報が鳴った。{g}は、上司が誰かに噛みつくところを見てしまった。'),
fx:'calm'
},
saved:{
w:0.9,min:2,
t:L('ゾンビに組みつかれた{a}の横から、{b}が{w2}で一体を引き剥がした。「立って！｜立て！｜立ってください！」――見知らぬ誰かに命を救われたのが、この街での最初の出来事だった。|{b}は、{area}の路地で動けなくなっていた{a}の腕を掴んで引きずり起こした。お礼を言う暇もなかった。|{a}が叩いた扉を、内側から開けてくれたのは{b}だった。「早く入って。……噛まれてないよね？｜早く入れ。……噛まれていないな？｜早く入ってください。……噛まれていませんよね？」'),
fx:'saved'
},
party:{
w:0.6,
t:L('{g}は、{area}で開かれていた誰かの誕生日会の帰りだった。ケーキの箱を抱えたまま、{g}は呻き声の中を走った。|{area}の映画館で、{g}はゾンビ映画を観ていた。エンドロールのあと外に出ると、スクリーンの続きが始まっていた。'),
fx:'calm'
},
scratch:{
w:0.45,
t:L('{a}は{area}の騒ぎの中で転び、誰かの手に足首を掴まれた。振り払って逃げ切った――はずだった。足首の引っかき傷を、{a}はまだ気にしていなかった。|揉み合いの最中、{a}の腕を何かがかすめた。ただの擦り傷だと、{a}は思った。'),
fx:'scratch'
},
npc:{
w:0.6,
t:L('{g}のそばには、迷子の子どもが一人いた。名前を訊いても、泣くばかりで答えなかった。|{area}で、迷彩服の男が{g}に銃口を向けていた。「噛まれていないなら、両手を上げてゆっくり来い」'),
fx:'npc'
}
};
var LOOK=L('{look}。|あたりには、{look}。|振り返ると、{look}。');
Z.intro=function(ctx){
var zb=ctx.zb,rng=ctx.rng,groups={};
ctx._touched={};ctx._mag=0;ctx.k=1;
ctx.chars.forEach(function(c){(groups[c.z.area]=groups[c.z.area]||[]).push(c);});
ctx.say({text:(zb.reg==='us'?'アメリカの地方都市':'地方都市')+'に「それ」が現れて三日目。電気はまだ通っているが、警察も病院も機能していない。街は9つのエリアに分断された。'});
var used={};
Object.keys(groups).forEach(function(k){
var g=rng.shuffle(groups[k]),A=zb.A[+k];
var kind=HK.weighted(rng,Object.keys(OPEN),function(x){var o=OPEN[x];if((o.min||1)>g.length)return 0;if(x==='npc'&&ctx.env.npc<20)return 0;return o.w/(1+(used[x]||0)*2);});
used[kind]=(used[kind]||0)+1;
var O=OPEN[kind],a=g[0],b=g[1]||g[0];
var t=f(ctx.pick(O.t),{g:names(g),a:a.name,b:b.name,area:A.name,w:wname(a),w2:wname(b)});
if(kind!=='wake'&&rng()<0.6)t+=f(ctx.pick(LOOK),{look:A.def.look});
var why='開始地点はランダム（仲の良さとは関係なし）',mag=10;
if(O.fx==='attack'){g.forEach(function(c){ctx.stress(c,15);});A.z=Math.min(100,A.z+6);mag=20;why+='／襲われている最中から始まる';}
if(O.fx==='hurt'){a.hp-=10;a.z.wound=0;why+='／'+a.name+'は怪我をしている';}
if(O.fx==='saved'&&g.length>1){ctx.mod2(a,b,{aff:18,trust:20},{trust:10,aff:6});ctx.pair(a,b).allied=true;why+='／'+b.name+'が'+a.name+'を助けた';mag=18;}
if(O.fx==='scratch'){Z.infect(ctx,a,'horde',false);why+='／'+a.name+'はすでに引っかかれている（本人は気づいていない）';mag=16;}
if(O.fx==='npc'){
var child= /迷子/.test(t);
Z.spawnNPCAt(ctx,child?'child':'soldier',+k);
}
ctx.say({kind:'event',cat:O.fx==='attack'?'escape':'solo',actors:g,text:t,why:why,mag:mag});
});
ctx.chars.forEach(function(c){
var fm=c.z.family;
if(!fm||fm.pc!=null)return;
if(fm.inside)ctx.say({kind:'event',cat:'solo',actors:[c],text:c.name+'の'+fm.rel+'は、'+an(ctx,fm.area)+'の近くにいるはずだ。'+(c.goal.id==='family'?c.name+'は、まずそこへ向かうと決めた。':''),why:'家族の居場所（街の中）'});
else ctx.say({kind:'event',cat:'solo',actors:[c],text:c.name+'の'+fm.rel+'は、街の外にいる。'+(c.goal.id==='family'?'会いに行くには、この街を出るしかない。':''),why:'家族の居場所（街の外）'});
});
};
var PACT2=L('{a}と{b}は、どちらからともなく「一緒に行こう｜＝｜一緒に行きましょう」と言った。ひとりでいるよりは、ましだった。|{a}は{b}に、見張りを交代でやらないかと持ちかけた。{b}は少し迷ってから頷いた。|{b}は{a}を信用していなかった。それでも、夜をひとりで越すよりはいいと、{a}の差し出した手を取った。|{a}と{b}は互いの持ち物を床に並べた。食料、電池、{w}。「……組む？｜……組むか｜……組みましょうか」「組もう｜＝｜組みましょう」|{a}は{b}に名前を訊いた。この街で誰かの名前を覚えるのは、三日ぶりだった。|{a}は無言で{b}に缶コーヒーを放った。それが、同盟の合図だった。');
var PACTG=L('{g}は、{area}の一室で身を寄せ合った。最初に段取りを決めたのは{lead}だった。|{lead}が「ここで夜を越す。見張りは二人ずつ｜＝｜ここで夜を越します。見張りは二人ずつです」と言い、{g}はそれに従った。誰も、ほかの案を持っていなかった。|{g}は輪になって座り、それぞれが知っていることを話した。話が終わる頃には、自然と{lead}の顔を見るようになっていた。|{area}に集まった{g}は、まず噛まれていないことを確かめ合った。{lead}が全員の腕を順番に見て回った。');
var PACTK=L('{a}と{b}は顔を見合わせて、黙って頷いた。言葉はいらなかった。|{a}は{b}の無事を確かめると、すぐに荷物を半分持った。「行こう。今度は離れないで｜行くぞ。今度は離れるな｜行きましょう。今度は離れないでください」|{a}と{b}は、いつもの調子で軽口を叩き合った。そうでもしないと、膝が震えそうだった。|{b}は{a}の顔を見るなり、張りつめていたものが切れたように座り込んだ。{a}はその隣に腰を下ろし、見張りは自分がやると言った。');
var DOUBT=L('{d}だけは、少し離れた場所に座っていた。|{d}は、誰とも目を合わせようとしなかった。|{d}は「足手まといは置いていく｜＝｜足手まといは置いていきます」と小さく付け加えた。|{d}は、自分の荷物を抱えたまま眠った。');
Z.pacts=function(ctx){
var rng=ctx.rng,P=ctx.present(),byArea={};
P.forEach(function(a){
P.forEach(function(b){
if(a.i>=b.i||a.z.area!==b.z.area||a.z.alone||b.z.alone)return;
var pf=ctx.pair(a,b);
if(pf.allied||pf.noPact)return;
var ra=ctx.R(a,b),rb=ctx.R(b,a);
if(ra.ten>45||rb.ten>45||(a.goal.id==='chaos'&&b.goal.id==='chaos')){if(rng()<0.3)pf.noPact=true;return;}
if(rng()>0.45+(a.tr.warmth+b.tr.warmth)*0.15)return;
pf.allied=true;
ctx.mod2(a,b,{trust:14,aff:5},{trust:14,aff:5});
var k=a.z.area;
(byArea[k]=byArea[k]||{pairs:[],who:[]}).pairs.push([a,b]);
[a,b].forEach(function(x){if(byArea[k].who.indexOf(x)<0)byArea[k].who.push(x);});
});
});
Object.keys(byArea).forEach(function(k){
var B=byArea[k],g=B.who,t,why='同じ'+an(ctx,+k)+'に居合わせた。生き延びるための同盟';
if(g.length===2){
var p=B.pairs[0];
var known=HK.Ties&&HK.Ties.get(ctx,p[0],p[1]);
t=f(ctx.pick(known?PACTK:PACT2),{a:p[0].name,b:p[1].name,w:wname(p[0])});
if(known)why='もともと知った仲（'+(HK.Sib&&HK.Sib.isSibTie(known)&&HK.tieLabel?HK.tieLabel(known):HK.TIES&&HK.TIES[known.like||known.type]?HK.TIES[known.like||known.type].label:'知り合い')+'）。同じ'+an(ctx,+k)+'で合流した';
}else{
var lead=ctx.most(g,function(c){return c.tr.lead;});
t=f(ctx.pick(PACTG),{g:names(g),lead:lead.name,area:an(ctx,+k)});
var d=g.filter(function(c){return c!==lead&&c.tr.cold>0.6&&c.tr.warmth<0.45;})[0];
if(d&&rng()<0.7)t+=f(ctx.pick(DOUBT),{d:d.name});
why+='（まとめ役：'+lead.name+'の主導性）';
}
ctx.act2({actors:g,cat:'bond',text:t,why:why,mag:10});
});
};
})();
});
;
/* ==== js/zombie-events.js ==== */
HK.Load.def(142,'js/zombie-events.js',function(){
(function(){
'use strict';
var HK=window.HK,Z=HK.ZB,scen=Z.scen,EV=scen.events;
function L(s){return s.split('|');}
function names(list){return list.map(function(c){return c.name;}).join('・');}
function tieT(ctx,a,b){var t=HK.Ties&&HK.Ties.get(ctx,a,b);return t?(t.like||t.type):'';}
function wname(c){return c.weapon?c.weapon.name:'素手';}
function luck(ctx,c){return ctx.stat(c,'luck');}
function an(ctx,i){return Z.an(ctx,i);}
function spare(ctx,v,k){return!!(HK.Attr&&HK.Attr.spare&&HK.Attr.spare(ctx,v,k));}
var GOAL={};
scen.goals.forEach(function(g){GOAL[g.id]=g;});
Z.setGoal=function(ctx,c,id,why,text){
if(!c.alive||c.out||c.goal.id===id)return;
var from=c.goal.label;
c.goal=GOAL[id];
c.goalHist=(c.goalHist||[]).concat([id]);
ctx.act2({actors:[c],cat:'solo',text:(text?ctx.t(text,c):'')+c.name+'の目標が変わった：「'+from+'」→「'+c.goal.label+'」',why:why,mag:14});
};
Z.goalShift=function(ctx,c,trig){
var f=c.z.family,rng=ctx.rng;
if(trig==='familyBad'&&c.goal.id==='family'){
var close=Z.here(ctx,c).filter(function(o){return ctx.R(c,o).aff>35;})[0];
if(c.tr.cold+c.tr.aggr>1.2&&rng()<0.5)Z.setGoal(ctx,c,'chaos','家族の悲報で、'+c.name+'の中の何かが切れた（ドライさ・攻撃性）','{a}はスマホを握りつぶすように閉じた。もう、守るものはない。');
else if(close){c.focus=close;Z.setGoal(ctx,c,'protect','家族を失った'+c.name+'は、そばにいる'+close.name+'を守ることにした');}
else Z.setGoal(ctx,c,'live','家族の悲報。それでも、生きなければならない');
}
};
EV.push({
id:'z_goal',cat:'solo',scope:'solo',
when:function(ctx,a){a.z.gr=goalReason(ctx,a);return!!a.z.gr;},
w:function(){return 1.6;},
run:function(ctx,a){
var r=a.z.gr||goalReason(ctx,a);
if(!r)return null;
if(r.focus)a.focus=r.focus;
var from=a.goal.label;a.goal=GOAL[r.id];
a.goalHist=(a.goalHist||[]).concat([r.id]);
return{text:ctx.t(r.text,a,r.focus)+a.name+'の目標が変わった：「'+from+'」→「'+a.goal.label+'」',why:r.why,mag:14};
}
});
function goalReason(ctx,a){
var z=a.z,g=a.goal.id,d=Z.day(ctx);
if(z.cult!=null||z.bitten)return null;
if(g!=='escape'&&z.know.burn&&ctx.env.end==='burn'&&a.tr.a+a.tr.caution>0.9)return{id:'escape',text:'{a}は、街ごと焼き払われるという話を、本当だと判断した。',why:'噂「街ごと焼き払う」を信じた（冷静さ・慎重さ）'};
if(g==='chaos'&&a.stress<30&&a.tr.np>0.45&&Z.here(ctx,a).some(function(o){return ctx.R(a,o).aff>45;})){var f0=Z.here(ctx,a).filter(function(o){return ctx.R(a,o).aff>45;})[0];return{id:'protect',focus:f0,text:'{a}は、{b}の寝顔を見ながら、自分が何をしようとしていたのかを考えた。',why:a.name+'の中に残っていたNPと、'+f0.name+'への好意'};}
if((g==='live'||g==='chaos')&&z.food<=0&&z.hunger>=2&&a.tr.a>0.5)return{id:'escape',text:'{a}は空腹の頭で考えた。この街に残っていても、飢えて死ぬだけだ。',why:'食料が尽きた（飢え '+z.hunger+' 日）'};
if(g==='protect'&&a.focus&& !a.focus.alive){
if(a.tr.cold+a.tr.aggr>1.1)return{id:'chaos',text:'{a}は'+a.focus.name+'を守れなかった。{a}の目から、何かが消えた。',why:'守りたかった人を失った（ドライさ・攻撃性）'};
return{id:'escape',text:'{a}は'+a.focus.name+'の形見を握りしめた。「生きて、この街を出る。それが約束だよ｜生きて、この街を出る。それが約束だ｜生きて、この街を出ます。それが約束です」',why:'守りたかった人を失った'};
}
if(g==='live'&&d>=3&&a.tr.fc+a.tr.lead>1.15&&Z.here(ctx,a).length===0&&ctx.rng()<0.3)return{id:'escape',text:'{a}は、籠城に飽きていた。「待ってても、何も来ないよ｜待っていても、何も来ない｜待っていても、何も来ません」',why:a.name+'のFC・主導性'};
if(g==='family'&&z.family&&z.family.found&&z.family.state==='ok')return{id:'escape',text:'{a}は'+z.family.rel+'の手を引いた。「一緒に、この街を出よう｜＝｜一緒に、この街を出ましょう」',why:'家族と合流できた'};
if(g==='family'&&z.family&&z.family.found&&z.family.state!=='ok'){
var cl=Z.here(ctx,a).filter(function(o){return ctx.R(a,o).aff>30;})[0];
if(cl)return{id:'protect',focus:cl,text:'{a}には、もう帰る場所がない。だから、隣にいる{b}だけは。',why:'家族を失い、そばの'+cl.name+'に心が向いた'};
return{id:'live',text:'{a}は'+z.family.rel+'のいない世界で、それでも生きることにした。',why:'家族を失った'};
}
return null;
}
EV.push({
id:'z_family_reach',cat:'solo',scope:'solo',pri:true,
when:function(ctx,a){var f=a.z.family;return f&&f.pc==null&&f.inside&& !f.found&&a.z.area===f.area;},
w:function(){return 6;},
run:function(ctx,a){
var f=a.z.family,rng=ctx.rng,rel=f.rel;
if(f.state==='ok'&&rng()<0.25){
f.area=rng()<0.6&&ctx.zb.safe>=0?ctx.zb.safe:rng.pick(Z.adj(f.area));
return{text:ctx.t('{a}は'+rel+'のいるはずの場所にたどり着いた。誰もいなかった。壁に、'+rel+'の字で「'+an(ctx,f.area)+'へ行く」と書かれていた。',a),why:'家族は先に動いていた',mag:18};
}
f.found=true;
if(f.state==='ok'){
f.with=true;a.stress=Math.max(0,a.stress-30);
return{cat:'help',text:ctx.t(rng.pick(['{a}がドアを叩くと、中から'+rel+'の声がした。扉が開いた瞬間、{a}は'+rel+'を抱きしめていた。',an(ctx,a.z.area)+'の避難所の片隅に、'+rel+'がいた。{a}の名前を呼んで、'+rel+'は泣き出した。']),a),why:'家族は無事だった（'+an(ctx,a.z.area)+'）',mag:35};
}
if(f.state==='dead'){
ctx.stress(a,35);a.flags.grief= -1;
return{text:ctx.t('{a}がたどり着いたとき、'+rel+'はもう冷たくなっていた。{a}は'+rel+'の手を握ったまま、夜が来るまで動けなかった。',a),why:'家族は亡くなっていた',mag:40};
}
var put=a.tr.cp*0.4+a.tr.a*0.35+a.tr.cold*0.3,flee=a.tr.caution*0.6,hug=a.tr.np*0.4+a.tr.ac*0.4+a.stress/200;
var k=HK.weighted(rng,['put','flee','hug'],function(x){return Math.pow(Math.max(0.03,{put:put,flee:flee,hug:hug}[x]),2);});
ctx.stress(a,40);a.flags.grief= -1;
var base='{a}が見つけた'+rel+'は、もう'+rel+'ではなかった。濁った目が、{a}の方を向いた。';
if(k==='put')return{cat:'combat',text:ctx.t(base+'{a}は'+wname(a)+'を握り直し、「……ごめん｜……すまない｜……すみません」と一度だけ言った。',a),why:a.name+'の決断（CP・A・ドライさ）',mag:45};
if(k==='flee')return{cat:'escape',text:ctx.t(base+'{a}は後ずさり、扉を閉めて、外から鍵をかけた。扉の向こうで、'+rel+'が爪を立てる音がした。',a),why:a.name+'の慎重さ',mag:40};
Z.infect(ctx,a,null,true);a.z.bitten.npc=rel;
return{cat:'death',text:ctx.t(base+'{a}は武器を下ろした。両腕を広げて、'+rel+'を抱きしめた。首筋に歯が食い込んでも、{a}は腕をほどかなかった。',a),why:a.name+'のNP・ACと、追い詰められ方（焦り '+Math.round(a.stress)+'）',mag:55};
}
});
function wantsOut(ctx,c){
var g=c.goal.id,f=c.z.family;
if(c.z.cult!=null||c.z.alone)return false;
if(g==='escape')return true;
if(g==='family'&&f&&f.pc==null&& !f.inside)return true;
if(ctx.env.end==='burn'&&(c.z.know.burn||Z.day(ctx)>=ctx.env.days-1))return true;
return false;
}
var ESC={
ok:{
0:L('{who}は線路に降り、トンネルの闇の中を隣の市へ歩き始めた。振り返ると、街の灯りが一つずつ消えていくのが見えた。|{who}は、乗り捨てられた車のキーを見つけた。ハイウェイの封鎖線を突き破り、街を後にした。'),
8:L('{who}は、漁船のエンジンをどうにかかけた。岸壁に群がるゾンビを置き去りにして、船は沖へ出た。|{who}は貨物船の船倉に潜り込んだ。汽笛が鳴り、船はゆっくりと岸を離れた。')
},
fail:L('出口は封鎖されていた。{who}は、バリケードの向こうから銃口を向けられて引き返した。|{who}が出口にたどり着いたとき、そこは群れに埋め尽くされていた。|{who}は出口の手前で、足を止めるしかなかった。夜の闇が深すぎた。|{who}がたどり着いた出口には、乗り捨てられた車が何台も折り重なっていた。どかすには、人手も時間も足りなかった。|{who}は出口の目前で、物陰から飛び出してきた群れに追い返された。|出口の向こうから、拡声器の声がした。「感染の疑いのある者は通過できない」――{who}は、引き返すしかなかった。|{who}が目指した道は、崩れた高架に塞がれていた。|{who}は出口までの最後の通りで、群れの足音に囲まれた。息を殺して、来た道を戻った。|出口の手前で雨が降り出した。視界がきかず、{who}は進むのを諦めた。|{who}は出口にたどり着いたが、鉄の門には太い鎖が巻かれていた。|{who}の前で、出口へ続く橋が爆破された。誰がやったのかは分からない。|出口の前に、昨日までなかったはずの検問が敷かれていた。{who}は、明かりを避けて引き返した。|{who}は出口に向かう途中で、仲間の一人が足をくじいた。全員で戻るしかなかった。|出口の見張り台から、誰かが無言で石を投げてきた。{who}は、それ以上近づけなかった。'),
react:{cp:L('{a}は唇を噛んだ。「次は別の道を探そう。必ず出るよ｜次は別の道を探す。必ず出る｜次は別の道を探します。必ず出ます」|{a}は皆を振り返った。「下を向かないで。まだ終わってないよ｜下を向くな。まだ終わっていない｜下を向かないでください。まだ終わっていません」'),np:L('{a}は、うつむく仲間の肩を一人ずつ叩いて回った。|{a}は「大丈夫、みんな無事だったんだから、それでいいよ｜大丈夫だ。みんな無事だった、それでいい｜大丈夫です。みんな無事だったんですから、それで十分です」と笑ってみせた。'),a:L('{a}は、見張りの交代時間と群れの動きを手帳に書き留めた。次の機会のために。|{a}は地図に×印をつけて、残りの出口を数え直した。'),fc:L('{a}は空き缶を思いきり蹴飛ばした。「なんなの、もう！｜なんなんだ、もう！｜なんなんですか、もう！」|{a}は道端に座り込んで、空に向かって叫んだ。'),ac:L('{a}は物陰で、声を殺して泣いた。|{a}は「私のせいで遅れたのかな｜私のせいで遅れたのか｜私のせいで遅れたんでしょうか」と、何度も繰り返した。')}
};
Z.escapes=function(ctx){
var zb=ctx.zb,rng=ctx.rng;
Z.groups(ctx).forEach(function(g){
var A=zb.A[g[0].z.area];
if(!A.def.exit)return;
var want=g.filter(function(c){return wantsOut(ctx,c);});
if(!want.length)return;
var lead=ctx.most(want,function(c){return c.tr.lead;});
var crew=g.filter(function(o){return want.indexOf(o)>=0||ctx.R(o,lead).aff>30||ctx.pair(o,lead).couple||o.focus===lead;});
var p=0.05+crew.reduce(function(s,c){return s+luck(ctx,c);},0)/crew.length*0.03+(zb.escort&&zb.escort.area===A.i&&ctx.stepIndex<=zb.escort.until?0.3:0)-A.z/300+Z.day(ctx)*0.025+(ctx.env.end==='burn'&&Z.day(ctx)>=ctx.env.days-1?0.15:0);
if(Z.day(ctx)===1)p*=0.3;
if(Z.part(ctx)===3)p*=0.6;
var who=names(crew);
if(rng()<p){
crew.forEach(function(c){c.out=true;c.fate='街を脱出';c.fateNote=ctx.label+'、'+A.name+'から'+A.def.exit.replace(/^(.*)$/,'$1')+'ことで街を出た'+(c.z.family&&c.z.family.pc==null&& !c.z.family.inside?'。'+c.z.family.rel+'のいる街の外へ':'');});
zb.stats.escaped+=crew.length;
var left=g.filter(function(o){return crew.indexOf(o)<0;});
var t=ctx.pick(ESC.ok[A.i]||ESC.ok[0]).replace(/\{who\}/g,who);
if(left.length){
var why1=function(o){
var f=o.z.family;
if(o.z.cult!=null)return o.name+'は教団のもとを離れなかった';
if(o.goal.id==='family'&&f)return o.name+'は「'+(f.pc!=null?ctx.chars[f.pc].name:f.rel||'家族')+'を置いていけない」と首を振った';
if(o.goal.id==='protect'&&o.focus&&o.focus.alive&& !o.focus.out)return o.name+'は'+o.focus.name+'のそばに残ると決めていた';
if(o.goal.id==='chaos')return o.name+'は、この混乱の街の方が性に合っていると笑った';
if(o.tr.ac>0.6)return o.name+'は足がすくんで、一歩も動けなかった';
if(o.tr.np>0.6)return o.name+'は「まだ助けを待ってる人がいるよ｜まだ助けを待っている人がいる｜まだ助けを待っている人がいます」と言って残った';
if(o.tr.a>0.6)return o.name+'は「その道は危ないよ｜その道は危険だ｜その道は危険です」と判断して、別の機会を待つことにした';
return o.name+'は、ここに残ると言った';
};
t+=left.map(why1).join('。')+'。';left.forEach(function(o){crew.forEach(function(c){ctx.mod(o,c,{aff: -4,ten:4});});});}
ctx.act2({actors:crew.concat(left),cat:'escape',text:t,why:'出口（'+A.name+'）にたどり着いた。脱出の成功率は運・ゾンビの多さ'+(zb.escort&&zb.escort.area===A.i?'・軍人の護衛':'')+'で決まる',mag:45});
}else if(rng()<0.45){
crew.forEach(function(c){ctx.stress(c,8);});
zb.failUsed=zb.failUsed||[];
var fl=ESC.fail.filter(function(t){return zb.failUsed.indexOf(t)<0;});if(!fl.length){zb.failUsed=[];fl=ESC.fail;}
var ft=ctx.pick(fl);zb.failUsed.push(ft);
var rx=null,rk='',rv=0;
crew.forEach(function(c){['cp','np','a','fc','ac'].forEach(function(k){if(c.tr[k]>rv){rv=c.tr[k];rx=c;rk=k;}});});
var tail=rx&&rv>0.6&&rng()<0.7?ctx.pick(ESC.react[rk]).replace(/\{a\}/g,rx.name):'';
ctx.act2({actors:crew,cat:'escape',text:ft.replace(/\{who\}/g,who)+tail,why:'脱出に失敗（'+A.name+'のゾンビの多さ '+Math.round(A.z)+'）'+(tail?'。'+rx.name+'の'+rk.toUpperCase()+'が反応に出た':''),mag:14});
}
});
};
var GR={
kill:L('{k}は黙って立ち上がり、{c}の背後に回った。「待って｜待て｜待ってください」と誰かが言うより早く、{w}が振り下ろされた。|「今のうちに終わらせるべきだよ｜今のうちに終わらせるべきだ｜今のうちに終わらせるべきです」――{k}はそう言って、{c}に{w}を向けた。{c}は、目を閉じて頷いた。|{k}は{c}に「ごめん｜すまない｜すみません」と言った。それが、{c}が最後に聞いた言葉だった。'),
stand:L('{k}が{w}を構えた瞬間、{p}が{c}の前に立ちはだかった。「やるなら、私から先にやって｜やるなら、私から先にやれ｜やるなら、私から先にやってください」――{k}は舌打ちをして、武器を下ろした。|{p}は{c}を背中にかばった。「まだ{c}は{c}だよ｜まだ{c}は{c}だ｜まだ{c}さんは{c}さんです」――{k}と{p}は、しばらく睨み合ったままだった。'),
fightP:L('{k}と{p}は、{c}をめぐって掴み合いになった。'),
accept:L('{p}は{c}の隣に座り、咬み跡に包帯を巻き直した。「最後まで一緒にいるよ｜最後まで一緒にいる｜最後まで一緒にいます」|{p}は「その時が来るまで、普通に過ごそう｜＝｜その時が来るまで、普通に過ごしましょう」と言って、{c}の好きだった歌を口ずさんだ。|誰も、{c}を置いていこうとは言わなかった。'),
leave:L('{who}は、{c}を残して出ていった。扉を閉める前に、誰も振り返らなかった。|翌朝、{c}が目を覚ますと、{who}の荷物は消えていた。')
};
function gfill(t,m){return t.replace(/\{(\w+)\}/g,function(x,k){return m[k]!=null?m[k]:x;});}
Z.groupReaction=function(ctx,c){
var rng=ctx.rng,mates=Z.here(ctx,c);
if(!mates.length)return;
var K=null,kv= -9,P=null,pv= -9,leavers=[];
mates.forEach(function(o){
var r=ctx.R(o,c),pf=ctx.pair(o,c);
var k=o.tr.cold*0.55+o.tr.cp*0.35+(o.z.know.blood?0.25:0)+(o.goal.id==='chaos'?0.3:0)-r.aff/90-o.tr.np*0.35;
var p=r.aff/80+o.tr.np*0.5+(pf.couple||tieT(ctx,o,c)==='lover'?0.6:0);
if(k>kv){kv=k;K=o;}
if(p>pv){pv=p;P=o;}
if(o.tr.caution>0.55&&r.aff<15&&o!==P)leavers.push(o);
});
var m={c:c.name,k:K.name,p:P?P.name:'',w:wname(K)};
if(kv>0.3&&rng()<0.4+kv*0.4&& !spare(ctx,c,K)){
if(P&&P!==K&&pv>0.75){
if(K.tr.aggr>0.6&&rng()<0.4){
var fr=ctx.fight(K,P,{noEvade:true,canSpare:true});
ctx.act2({actors:[K,P,c],cat:'combat',text:gfill(ctx.pick(GR.fightP),m)+fr.text,why:K.name+'は「今のうちに殺すべき」、'+P.name+'は「守るよ」。'+fr.why,mag:40});
if(P.alive&&fr.winner===P)return;
if(!P.alive||fr.winner===K){
ctx.pair(K,c).zexec=K.i;
ctx.act2({actors:[K,c],cat:'death',text:gfill(ctx.pick(GR.kill),m),why:K.name+'のドライさ（'+Math.round(K.tr.cold*100)+'）',mag:45});
ctx.kill(c,K,'発症する前に、'+K.name+'の手で');
}
return;
}
ctx.act2({actors:[K,P,c],cat:'conflict',fx:function(){ctx.mod2(K,P,{ten:20},{ten:25,trust: -15});ctx.mod(c,P,{aff:20,trust:25});},text:gfill(ctx.pick(GR.stand),m),why:P.name+'の'+c.name+'への想い（好意 '+Math.round(ctx.R(P,c).aff)+'）が、'+K.name+'を止めた',mag:35});
return;
}
var mercy=ctx.R(K,c).aff>25;
ctx.pair(K,c)[mercy?'zmercy':'zexec']=K.i;
ctx.act2({actors:[K,c].concat(mates.filter(function(o){return o!==K;})),cat:'death',fx:function(){mates.forEach(function(o){if(o!==K)ctx.mod(o,K,{ten:15,trust: -10});});},text:gfill(ctx.pick(GR.kill),m),why:K.name+'の判断（ドライさ '+Math.round(K.tr.cold*100)+'・CP'+(K.z.know.blood?'・「返り血でも感染するよ」というデマを信じていた':'')+'）'+(mercy?'／情のある別れ':''),mag:48});
ctx.kill(c,K,mercy?'発症する前に、'+K.name+'の手で静かに':'発症する前に、'+K.name+'に殺された');
return;
}
if(leavers.length&&leavers.length>=mates.length/2&& !(P&&pv>0.75)){
leavers.forEach(function(o){ctx.pair(o,c).abandoned=o.i;var na=ctx.rng.pick(Z.adj(o.z.area));o.z.area=na;o.z.path.push(na);});
ctx.act2({actors:[c].concat(leavers),cat:'betray',fx:function(){leavers.forEach(function(o){ctx.mod(c,o,{aff: -20,trust: -30});});ctx.stress(c,20);},text:gfill(ctx.pick(GR.leave),{who:names(leavers),c:c.name}),why:names(leavers)+'の慎重さ（感染が怖い）',mag:32});
return;
}
if(P)ctx.act2({actors:[P,c],cat:'help',fx:function(){ctx.mod2(P,c,{aff:8,trust:8},{aff:15,trust:15});c.stress=Math.max(0,c.stress-20);},text:gfill(ctx.pick(GR.accept),m),why:P.name+'のNPと'+c.name+'への好意',mag:28});
};
function believeRumor(ctx,c){
var zb=ctx.zb,rng=ctx.rng,wrong=rng()<ctx.env.rumor/100*0.75;
var pool=[];
if(ctx.env.end==='heli'||rng()<0.4)pool.push('heliPlace');
pool.push('safePlace');
Z.RUMORS.forEach(function(r){if(!c.z.know[r.id])pool.push(r.id);});
var id=rng.pick(pool),text,truth;
if(id==='heliPlace'){
var real=ctx.env.end==='heli'?zb.heli: -1,at= !wrong&&real>=0?real:rng.pick([2,5,7,8,4,0].filter(function(x){return x!==real;}));
c.z.heliAt=at;c.z.know.heli=true;truth=at===real;
text='「最終日、救助ヘリは'+an(ctx,at)+'に降りる」';
}else if(id==='safePlace'){
var at2= !wrong&&zb.safe>=0?zb.safe:rng.pick([0,1,2,3,4,5,6,7,8].filter(function(x){return x!==zb.safe;}));
c.z.safe=at2;truth=at2===zb.safe;
text='「'+an(ctx,at2)+'はまだ安全らしい」';
}else{
var r=Z.RUMORS.filter(function(x){return x.id===id;})[0];
c.z.know[id]=true;
truth=r.truth==='env'?(id==='burn'?ctx.env.end==='burn':ctx.env.end==='heli'):r.truth;
if(truth===false&& !wrong&&rng()<0.6){c.z.know[id]=false;return{text:'「'+r.t+'」という書き込みを、{a}はデマだと見抜いた。',truth:true,id:id};}
text='「'+r.t+'」';
}
return{text:text+'という話を、{a}は信じた。',truth:truth,id:id};
}
EV.push({
id:'z_info',cat:'solo',scope:'solo',
w:function(ctx,a){return(a.action.id==='info'?1.8:0.45)*(ctx.zb.netDown?0.45:1);},
run:function(ctx,a){
var r=believeRumor(ctx,a);
var how=ctx.zb.netDown?ctx.pick(['{a}は手回しラジオのダイヤルを、ゆっくり回した。','{a}は電柱に貼られた手書きのビラを読んだ。','{a}は通りすがりの生存者と、短く情報を交換した。']):ctx.pick(Z.SNS_HOW);
return{text:ctx.t(how+r.text,a),why:'情報集め'+(r.truth===true?'（本当の情報）':r.truth==='maybe'?'（真偽不明）':'（デマ）')+'／情報の錯綜 '+ctx.env.rumor};
}
});
EV.push({
id:'z_tell',cat:'bond',scope:'pair',
when:function(ctx,a,b){return(a.z.safe!=null&&a.z.safe!==b.z.safe)||(a.z.heliAt!=null&&a.z.heliAt!==b.z.heliAt);},
w:function(ctx,a,b){return 0.6+a.tr.warmth*0.5+ctx.R(b,a).trust/100;},
run:function(ctx,a,b){
var heli=a.z.heliAt!=null&&a.z.heliAt!==b.z.heliAt,belief=ctx.R(b,a).trust+b.tr.ac*30>25+ctx.rng()*40;
var what=heli?'救助ヘリは'+an(ctx,a.z.heliAt)+'に来る':an(ctx,a.z.safe)+'は安全だ';
if(belief){if(heli)b.z.heliAt=a.z.heliAt;else b.z.safe=a.z.safe;ctx.mod2(a,b,{trust:3},{trust:5});}
else ctx.mod(b,a,{ten:3});
return{text:ctx.t('{a}は{b}に、「'+what+'」と話した。'+(belief?'{b}はそれを信じた。':'{b}は「どこで聞いたの、それ｜どこで聞いたんだ、それ｜どこで聞いたんですか、それ」と眉をひそめた。'),a,b),why:b.name+'の'+a.name+'への信頼（'+Math.round(ctx.R(b,a).trust)+'）'};
}
});
EV.push({
id:'z_loot',cat:'solo',scope:'solo',
w:function(ctx,a){return(a.action.id==='loot'?1.6:0.6)+(a.z.food<=0?1:0);},
run:function(ctx,a){
var A=ctx.zb.A[a.z.area],rng=ctx.rng,l=luck(ctx,a);
var r=rng()+l*0.08;
if(A.food>0&&r<0.75){
var got=Math.min(A.food,1+rng.int(2)+(l>=4?1:0));A.food-=got;a.z.food+=got;
return{cat:'help',text:ctx.t(rng.pick(['{a}は'+A.name+'の荒らされた棚の奥から、缶詰を'+got+'つ見つけた。','{a}は倒れた自販機をこじ開け、ペットボトルと菓子パンを手に入れた。','{a}は誰かの置いていったリュックの中に、非常食を見つけた。']),a),why:a.name+'の運（'+l+'）と'+A.name+'の残り物資'};
}
var W=Z.WEAPONS[ctx.zb.reg];
if(r>0.6&&rng()<A.loot){
var wl=A.def.guns&&rng()<0.6?W.gun:W.loot,w=Z.weapon(rng.pick(wl));
if(!a.weapon||w.pow>a.weapon.pow){var old=wname(a);a.weapon=w;return{text:ctx.t('{a}は'+A.name+'で'+w.name+'を見つけた。'+old+'を捨てて、持ち替えた。',a),why:A.name+'は武器が見つかりやすい（'+Math.round(A.loot*100)+'）'};}
}
if(A.def.med&&r>0.5&&a.z.wound>=0){a.z.wound= -1;a.z.fever=false;a.hp=Math.min(100,a.hp+12);return{cat:'help',text:ctx.t('{a}は'+A.name+'の薬品庫で、抗生物質と包帯を見つけた。',a),why:'病院の医療品'};}
if(A.def.med&&a.z.drug&&a.z.bitten&& !a.z.drugDone){
a.z.drugDone=true;
var real=rng()<0.35;
if(real)a.z.turnAt+=6;
return{text:ctx.t('{a}は病院の研究棟で、噂の薬らしいアンプルを見つけ、自分の腕に打った。'+(real?'……熱が、少しだけ引いた。':'何も変わらなかった。'),a),why:'噂「病院に発症を遅らせる薬があるんだって」'+(real?'（効いた：発症が遅れた）':'（効かなかった）'),mag:25};
}
ctx.stress(a,5);
if(rng()<0.3)Z.hordeEvent(ctx,[a].concat(Z.here(ctx,a).filter(function(o){return ctx.R(a,o).trust>15;})),A);
return{text:ctx.t(rng.pick((Z.LOOT_NONE||['{a}は{area}を探し回ったが、食べられるものは何も残っていなかった。']).map(function(x){return x.replace(/\{area\}/g,A.name);})),a),why:A.name+'の物資は残り少ない'};
}
});
EV.push({
id:'z_barricade',cat:'solo',scope:'solo',
w:function(ctx,a){return(a.action.id==='hole'?1.5:0.4)*(1-ctx.zb.A[a.z.area].bar);},
run:function(ctx,a){
var A=ctx.zb.A[a.z.area],add=0.15+a.tr.a*0.1+Z.here(ctx,a).length*0.05;
A.bar=Math.min(0.9,A.bar+add);
return{text:ctx.t(ctx.pick((Z.BARRICADE||['{a}は{area}の入口に、机と棚を積み上げた。']).map(function(x){return x.replace(/\{area\}/g,A.name);})),a),why:a.name+'の慎重さ。籠城しやすさ '+Math.round(A.bar*100)+'%'};
}
});
EV.push({
id:'z_hunt',cat:'combat',scope:'solo',
when:function(ctx,a){return a.action.id==='hunt'||a.tr.aggr>0.65;},
w:function(ctx,a){return a.tr.aggr*1.2+(a.action.id==='hunt'?0.8:0);},
run:function(ctx,a){
var A=ctx.zb.A[a.z.area],rng=ctx.rng,n=2+rng.int(4)+(a.weapon?Math.round(a.weapon.pow/2):0);
A.z=Math.max(0,A.z-n);a.z.kills+=n;
if(a.weapon&&a.weapon.loud)A.z=Math.min(100,A.z+8);
var bit=rng()<0.06-luck(ctx,a)*0.008;
if(bit){Z.infect(ctx,a,'horde',true);return{text:ctx.t('{a}は'+wname(a)+'で'+n+'体を片づけた。最後の一体の歯が、{a}の手の甲をかすめていた。',a),why:a.name+'の攻撃性。深追いしすぎた',mag:30};}
return{text:ctx.t(rng.pick(['{a}は'+wname(a)+'を手に、'+A.name+'のゾンビを'+n+'体片づけた。','{a}は'+A.name+'の通りで、群れから外れたゾンビを一体ずつ仕留めていった。（'+n+'体）'])+(a.weapon&&a.weapon.loud?'音が、また別の群れを呼んだ。':''),a),why:a.name+'の攻撃性（'+Math.round(a.tr.aggr*100)+'）と武器「'+wname(a)+'」'};
}
});
EV.push({
id:'z_share',cat:'help',scope:'pair',
when:function(ctx,a,b){return a.z.food>=1&&b.z.food<=0;},
w:function(ctx,a,b){return a.tr.np*1.3+Math.max(0,ctx.R(a,b).aff)/60+(b.z.hunger?0.5:0);},
run:function(ctx,a,b){
a.z.food--;b.z.food++;
ctx.mod2(a,b,{aff:3},{aff:10,trust:12});
return{text:ctx.t(ctx.pick(['{a}は最後の缶詰を開け、半分を{b}に差し出した。','{a}は「お腹、鳴ってるよ｜腹、鳴ってるぞ｜お腹、鳴っていますよ」と言って、自分のカロリーバーを{b}に放った。','{a}は{b}が眠っている間に、{b}のリュックにそっと乾パンを入れておいた。']),a,b),why:a.name+'のNP（'+Math.round(a.eg.NP)+'）／'+b.name+'の食料が尽きていた'};
}
});
EV.push({
id:'z_food_fight',cat:'conflict',scope:'pair',
when:function(ctx,a,b){return a.z.food<=0&&b.z.food>=1&&a.z.hunger>=1;},
w:function(ctx,a,b){return Math.max(0.02+a.z.hunger*0.02,a.tr.aggr+a.tr.cold*0.6+a.z.hunger*0.3-a.tr.np*0.5-Math.max(0,ctx.R(a,b).aff)/60)*(0.5+ctx.env.strife/100);},
run:function(ctx,a,b){
var rng=ctx.rng,steal=a.tr.caution>a.tr.aggr;
var snap=a.tr.np>0.6&&a.tr.cold<0.45&&rng()<0.06+a.stress/500+a.z.hunger*0.03;
if(a.tr.np>0.6&&a.tr.cold<0.45&& !snap){
if(a.tr.ac>0.55||rng()<0.4){ctx.stress(a,10);return{cat:'solo',text:ctx.t(ctx.pick(['{a}は{b}の缶詰に目をやって、すぐに逸らした。腹が鳴っても、何も言わなかった。','{a}は空腹を隠して、「平気｜＝｜平気です」と笑ってみせた。{b}は気づかなかった。']),a,b),why:a.name+'の飢え（'+a.z.hunger+'日）。NPが高く、人のものには手を出せない'};}
var give=b.tr.np*0.6+Math.max(0,ctx.R(b,a).aff)/80+0.2>rng();
if(give){b.z.food--;a.z.food++;ctx.mod2(a,b,{aff:8,trust:6},{aff:4});}
else ctx.mod2(a,b,{ten:4},{ten:2});
return{cat:give?'help':'bond',text:ctx.t(give?'{a}は頭を下げて、{b}に少しだけ分けてもらえないか頼んだ。{b}は黙って缶詰を半分渡した。':'{a}は{b}に、食べ物を少し分けてほしいと頼んだ。{b}は首を振った。{a}はそれ以上言わなかった。',a,b),why:a.name+'の飢え（'+a.z.hunger+'日）。盗まずに頼んだ（NP）。'+b.name+'は'+(give?'応じた（NP・好意）':'応じなかった')};
}
if(steal){
var caught=rng()<b.tr.caution*0.6+b.tr.a*0.3;
b.z.food--;if(!caught)a.z.food++;
ctx.mod2(a,b,{ten:5},caught?{ten:25,trust: -30,aff: -12}:{trust: -5});
return{cat:'betray',text:ctx.t(caught?'夜中、{a}は{b}のリュックに手を入れた。その手首を、{b}が掴んだ。「……何してるの｜……何をしている｜……何をしているんですか」':'{a}は{b}が眠っている隙に、{b}の缶詰を一つ抜き取った。{b}は朝、首を傾げていた。',a,b),why:a.name+'の飢え（'+a.z.hunger+'日）と慎重さ'+(caught?'／'+b.name+'が気づいた':'')+(snap?'。NPの高い'+a.name+'には、らしくない行動（飢えと焦り '+Math.round(a.stress)+'）':''),odd:snap};
}
if(rng()<0.35+a.tr.aggr*0.3&&b.tr.aggr>0.4){
var fr=ctx.fight(a,b,{lethality:0.9});
if(fr.winner===a&&b.alive){a.z.food+=b.z.food;b.z.food=0;}
return{cat:'combat',text:ctx.t('{a}は{b}に「食べ物、よこして｜食い物をよこせ｜食べ物を、渡してください」と詰め寄った。{b}が拒むと、{a}は掴みかかった。',a,b)+fr.text,why:a.name+'の飢え（'+a.z.hunger+'日）と攻撃性。'+fr.why+(snap?'。NPの高い'+a.name+'には、らしくない行動':''),mag:30,odd:snap};
}
b.z.food--;a.z.food++;
ctx.mod2(a,b,{ten:6},{ten:18,aff: -10,trust: -15});
return{text:ctx.t('{a}は{b}に'+wname(a)+'を向けて、食料を一つ出させた。「恨まないでね。お腹が減ってるの｜恨むなよ。腹が減ってるんだ｜恨まないでください。お腹が減っているんです」',a,b),why:a.name+'の飢えと攻撃性'};
}
});
var MURDER=L('{a}は、{b}を群れのいる路地へ誘い込んだ。「こっち｜こっちだ｜こちらです」――{a}だけが、引き返してきた。|{a}は、{b}と二人きりになるのを待っていた。屋上の縁で、{a}は{b}の背中を押した。|「ゾンビかと思った｜＝｜ゾンビかと思いました」――{a}はそう言うつもりで、{b}に'+'{wa}'+'を向けた。|{a}は眠っている{b}の部屋の外から、そっと鍵をかけた。窓の外には、群れが集まり始めていた。');
EV.push({
id:'z_murder',cat:'betray',dk:'kill',scope:'pair',
when:function(ctx,a,b){
var r=ctx.R(a,b),t=tieT(ctx,a,b);
return(r.ten>45||t==='enemy'||t==='rival'||a.goal.id==='chaos')&&r.aff<15&&a.tr.cold+a.tr.aggr>1.0&& !ctx.pair(a,b).couple&& !spare(ctx,b,a);
},
w:function(ctx,a,b){var r=ctx.R(a,b),wit=Z.here(ctx,a).length-1;return(0.25+r.ten/70+(a.goal.id==='chaos'?0.7:0)+(['enemy','rival'].indexOf(tieT(ctx,a,b))>=0?0.5:0))/(1+wit*0.8)*(0.4+ctx.env.strife/80);},
run:function(ctx,a,b){
var rng=ctx.rng,wit=Z.here(ctx,a).filter(function(o){return o!==b;});
var t=ctx.t(ctx.pick(MURDER),a,b);
var why=a.name+'の、'+b.name+'への緊張（'+Math.round(ctx.R(a,b).ten)+'）とドライさ・攻撃性'+(a.goal.id==='chaos'?'／目標「この混乱を利用する｜＝｜この混乱を利用します」':'')+'。この街では、誰が死んでもゾンビのせいにできる';
if(b.tr.caution*rng()>0.45){
ctx.mod2(a,b,{ten:10},{ten:40,trust: -50,aff: -30});
return{text:t+ctx.t('――だが{b}は寸前で気づき、逃げ延びた。{b}はもう、{a}に背中を見せない。',a,b),why:why+'／'+b.name+'の慎重さ',mag:35};
}
ctx.pair(a,b).zmurder=a.i;
ctx.kill(b,a,'この混乱に紛れて、'+a.name+'に殺された');
var seen=wit.filter(function(o){return o.tr.a+o.tr.caution>1.0&&rng()<0.5;})[0];
if(seen){ctx.mod(seen,a,{ten:35,trust: -45});ctx.pair(seen,a).sawMurder=true;t+=ctx.t('――{c}だけが、それを見ていた。',a,b,seen);}
return{text:t,why:why,with:seen?[seen]:null,mag:50};
}
});
EV.push({
id:'z_notice',cat:'conflict',scope:'pair',
when:function(ctx,a,b){return b.z.hiding&&b.z.bitten&& !b.z.exposed;},
w:function(ctx,a){return 0.6+a.tr.a+a.tr.caution*0.6;},
run:function(ctx,a,b){
var rng=ctx.rng,r=ctx.R(a,b);
b.z.exposed=true;
if(r.aff>45&&rng()<0.55){
ctx.pair(a,b).secret=true;ctx.mod2(a,b,{trust:5},{trust:20,aff:10});
return{cat:'help',text:ctx.t('{a}は{b}の袖の下の咬み跡に気づいた。{a}は何も言わずに、新しい包帯を{b}に渡した。「……皆には、言わない｜＝｜……皆には、言いません」',a,b),why:a.name+'の観察眼（A・慎重さ）と、'+b.name+'への好意（'+Math.round(r.aff)+'）',mag:30};
}
b.z.hiding=false;
var t=ctx.t('{a}は{b}の腕を掴んで、袖をまくり上げた。そこには、黒ずんだ咬み跡があった。{a}は低く訊いた。「いつから？｜いつからだ｜いつからですか」',a,b);
ctx.mod2(a,b,{ten:20,trust: -20},{ten:15});
ctx.pending=(ctx.pending||[]);
setTimeout0(ctx,function(){Z.groupReaction(ctx,b);});
return{text:t,why:a.name+'の観察眼（A・慎重さ）。'+b.name+'は咬み跡を隠していた',mag:32};
}
});
function setTimeout0(ctx,fn){(ctx.zb.later=ctx.zb.later||[]).push(fn);}
Z.later=setTimeout0;
var after0=scen.after;
scen.after=function(ctx,s,n){
var L0=ctx.zb.later||[];ctx.zb.later=[];
L0.forEach(function(fn){fn();});
after0(ctx,s,n);
};
EV.push({
id:'z_treat',cat:'help',scope:'pair',
when:function(ctx,a,b){return b.z.wound>=0&& !b.z.bitten;},
w:function(ctx,a,b){return a.tr.np+a.tr.a*0.5;},
run:function(ctx,a,b){
var ok=ctx.rng()<0.35+a.tr.a*0.3+a.tr.np*0.2;
if(ok){b.z.wound= -1;b.z.fever=false;b.hp=Math.min(100,b.hp+8);}
ctx.mod2(a,b,{aff:3},{aff:8,trust:10,att:2});
return{text:ctx.t(ok?'{a}は沸かした湯で{b}の傷口を洗い、きつく縛り直した。「化膿させないでね｜化膿させるなよ｜化膿させないでくださいね」':'{a}は{b}の傷に、ありったけの消毒液をかけた。{b}は歯を食いしばった。腫れは、引かなかった。',a,b),why:a.name+'の手当て（NP・A）'+(ok?'':'／道具が足りなかった')};
}
});
EV.push({
id:'z_comfort',cat:'help',scope:'pair',
when:function(ctx,a,b){return b.stress>55;},
w:function(ctx,a,b){return a.tr.np*0.9+Math.max(0,ctx.R(a,b).aff)/70;},
run:function(ctx,a,b){
b.stress=Math.max(0,b.stress-18-a.tr.np*10);
ctx.mod2(a,b,{aff:4},{aff:8,trust:8});
return{text:ctx.t(ctx.pick(['{b}の手が震えて止まらなかった。{a}はその手を、自分の両手で包んだ。','{a}は{b}の隣に座り、何も言わずに肩を貸した。{b}は、ようやく少しだけ眠った。','{a}は{b}に、この街を出たら何を食べたいかを訊いた。{b}は泣きながら笑って、「ラーメン」と答えた。']),a,b),why:b.name+'の追い詰められ方（焦り '+Math.round(b.stress)+'）／'+a.name+'のNP'};
}
});
EV.push({
id:'z_watch',cat:'romance',scope:'pair',
when:function(ctx,a,b){return Z.part(ctx)===3&&HK.canLove(a,b);},
w:function(ctx,a,b){return 0.4+ctx.R(a,b).att/60+ctx.R(b,a).att/90;},
run:function(ctx,a,b){
ctx.mod2(a,b,{att:6,aff:4,trust:4},{att:6,aff:4,trust:4});
return{text:ctx.t(ctx.pick(['見張りの番が、{a}と{b}に回ってきた。二人は肩を寄せ合い、窓の外の闇を見つめながら、小声で昔の話をした。','停電の夜、{a}と{b}は一本の懐中電灯を二人で持った。消してしまえば、互いの息遣いしか聞こえなかった。','{a}は見張り中にうとうとした{b}の頭を、そっと自分の肩に乗せた。']),a,b),why:'夜の見張り（惹かれ '+Math.round(ctx.R(a,b).att)+'）'};
}
});
EV.push({
id:'z_last',cat:'romance',scope:'pair',
when:function(ctx,a,b){var r=ctx.R(a,b);return HK.canLove(a,b)&&r.att>34&&r.aff>15&& !ctx.pair(a,b).couple&& !ctx.pair(a,b).zconf&&(!HK.Poly||HK.Poly.canTry(ctx,a,b))&&(a.stress>45||a.z.bitten);},
w:function(ctx,a){return 0.6+a.tr.honesty+(a.z.bitten?1:0);},
run:function(ctx,a,b){
var rb=ctx.R(b,a),yes=rb.att>28&&rb.aff>15,pf=ctx.pair(a,b);
pf.zconf=true;
if(yes){pf.couple=true;ctx.mod2(a,b,{aff:12,trust:10,att:8},{aff:12,trust:10,att:8});}
else ctx.mod2(a,b,{att: -4},{aff:4});
var t=a.z.bitten?'{a}は咬み跡を隠したまま、{b}に言った。「死ぬ前に、言っておきたかった。好きだった｜＝｜死ぬ前に、言っておきたかったんです。好きでした」':ctx.pick(['「どうせ明日死ぬかもしれないなら｜＝｜どうせ明日死ぬかもしれませんから」――{a}は{b}に、ずっと言えなかったことを言った。','{a}は、崩れかけたビルの非常階段で、{b}に好きだと言った。']);
return{text:ctx.t(t+(yes?'{b}は返事の代わりに、{a}を強く抱きしめた。':'{b}は「生き延びたら、もう一回言って｜生き延びたら、もう一度言え｜生き延びたら、もう一度言ってください」と答えた。'),a,b),why:'追い詰められた状況で、'+a.name+'の本音（本音の出やすさ '+Math.round(a.tr.honesty*100)+'）が出た',mag:30};
}
});
function romShift(ctx){return ctx.env.romance==null?0:(ctx.env.romance-50)/50;}
EV.push({
id:'z_confess',cat:'romance',scope:'pair',
when:function(ctx,a,b){var r=ctx.R(a,b),pf=ctx.pair(a,b),d=romShift(ctx);return HK.canLove(a,b)&&r.att>38-d*12&&r.aff>20-d*10&& !pf.couple&& !pf.zconf&&(!HK.Poly||HK.Poly.canTry(ctx,a,b))&& !pf.kin&& !HK.lockOut(a,b);},
w:function(ctx,a,b){return 0.35+a.tr.honesty*0.8+ctx.R(a,b).att/120;},
run:function(ctx,a,b){
var d=romShift(ctx),rb=ctx.R(b,a),yes=rb.att>30-d*10&&rb.aff>15-d*8&& !HK.lockOut(b,a),pf=ctx.pair(a,b);
pf.zconf=true;
if(yes){pf.couple=true;ctx.mod2(a,b,{aff:10,trust:8,att:8},{aff:10,trust:8,att:8});}
else{ctx.mod2(a,b,{att: -4},{aff:2});ctx.stress(a,10);}
var t=ctx.pick(['見張りの交代のとき、{a}は{b}の隣に座ったまま言った。「こんな時に言うことじゃないけど……好き｜こんな時に言うことじゃないが……好きだ｜こんな時に言うことじゃないですけど……好きです」','隠れ家の暗がりで、{a}は{b}にだけ聞こえる声で言った。「生き延びたら、じゃなくて、今言っておきたい。好き｜生き延びたら、ではなく、今言っておきたい。好きだ｜生き延びたら、ではなくて、今言っておきたいです。好きです」','缶詰を分け合いながら、{a}はふと手を止めた。「……{b}のこと、ずっと見てた｜……{b}のことを、ずっと見ていた｜……{b}さんのこと、ずっと見ていました」']);
return{text:ctx.t(t+(yes?ctx.pick(['{b}は少し黙ってから、{a}の手を握り返した。','{b}は「知ってた｜知っていた｜知っていました」と小さく笑って、{a}の肩に頭を預けた。']):ctx.pick(['{b}は困ったように目を伏せた。「今は、生き延びることしか考えられない｜＝｜今は、生き延びることしか考えられません」','{b}は答えず、見張りの窓の外へ目をやった。'])),a,b),why:a.name+'の惹かれ（'+Math.round(ctx.R(a,b).att)+'）と本音の出やすさ。'+b.name+'の惹かれ（'+Math.round(rb.att)+'）・好意（'+Math.round(rb.aff)+'）',mag:yes?28:18};
}
});
EV.push({
id:'z_close',cat:'romance',sex:true,scope:'pair',
when:function(ctx,a,b){var pf=ctx.pair(a,b);return HK.canLove(a,b)&&HK.canLove(b,a)&&(pf.couple||(ctx.R(a,b).att>40&&ctx.R(b,a).att>36))&& !pf.zclose;},
w:function(ctx,a,b){return 0.5+ctx.R(a,b).att/80+(Z.part(ctx)===3?0.6:0);},
run:function(ctx,a,b){
var pf=ctx.pair(a,b);pf.zclose=true;pf.night=true;
ctx.mod2(a,b,{att:8,aff:8,trust:6},{att:8,aff:8,trust:6});
return{text:ctx.t(ctx.pick(['生きていることを確かめるように、{a}は{b}に口づけた。その夜、二人はバリケードの内側で、互いの体温だけを頼りに眠った。','{b}が「怖い｜＝｜怖いです」とこぼした。{a}は{b}を抱き寄せ、朝まで離さなかった。','{a}と{b}は、誰もいない屋上で手を繋いで、燃える街を眺めていた。どちらからともなく、唇が重なった。']),a,b),why:'極限状態で、互いの惹かれ（'+Math.round(ctx.R(a,b).att)+'／'+Math.round(ctx.R(b,a).att)+'）が溢れた',mag:24};
}
});
EV.push({
id:'z_plan',cat:'conflict',scope:'pair',
when:function(ctx,a,b){return a.goal.id!==b.goal.id&&(a.goal.id==='escape'||b.goal.id==='escape'||a.goal.id==='family');},
w:function(ctx,a){return 0.35+a.tr.lead*0.6;},
run:function(ctx,a,b){
var rng=ctx.rng,win=a.tr.lead+ctx.R(b,a).trust/100>b.tr.lead+rng()*0.6;
if(win&&b.goal.id!=='family'&&b.goal.id!=='chaos'){var from=b.goal.label;b.goal=a.goal;ctx.mod2(a,b,{trust:4},{trust:4});return{cat:'bond',text:ctx.t('{a}は{b}を説得した。「'+a.goal.label+'。それしかない」――{b}は、少し考えてから頷いた。',a,b)+b.name+'の目標が変わった：「'+from+'」→「'+b.goal.label+'」',why:a.name+'の主導性と、'+b.name+'からの信頼',mag:12};}
ctx.mod2(a,b,{ten:8},{ten:8});
return{text:ctx.t('{a}と{b}は、これからどうするかで言い争いになった。{a}は「'+a.goal.label+'」、{b}は「'+b.goal.label+'」。どちらも譲らなかった。',a,b),why:'目標の違い'};
}
});
EV.push({
id:'z_weapon_give',cat:'help',scope:'pair',
when:function(ctx,a,b){return a.weapon&&b.weapon&&a.weapon.pow>=b.weapon.pow+3;},
w:function(ctx,a,b){return a.tr.np*0.6+Math.max(0,ctx.R(a,b).aff)/70;},
run:function(ctx,a,b){
var w=a.weapon;a.weapon=b.weapon;b.weapon=w;
ctx.mod2(a,b,{aff:3},{aff:10,trust:12});
return{text:ctx.t('{a}は自分の'+w.name+'を{b}に押しつけた。「あなたのほうが危なっかしいよ。持ってて｜あなたのほうが危なっかしい。持ってろ｜あなたのほうが危なっかしいです。持っていてください」',a,b),why:a.name+'のNPと、'+b.name+'への好意'};
}
});
var E=HK.E;
HK.addMini('zombie',[
E('z_m_hide','solo','s+','caution*.6+.1','','as:3','{a}は押し入れの中で膝を抱え、外を歩く足音が遠ざかるのを待った。|{a}は浴槽に身を沈め、蓋の隙間から息をした。|{a}は車の後部座席に毛布をかぶって横たわり、窓の外を通る影を数えた。|{a}はスーパーの冷凍庫の中に隠れた。寒さで歯が鳴るのを、必死に抑えた。|{a}は駐車場の車の下に潜り込み、近づいてくる足を見つめていた。|{a}は試着室のカーテンの陰で、息を止めた。|{a}は公衆トイレの天井の点検口から、天井裏に逃げ込んだ。'),
E('z_m_noise','solo','s+','caution*.4+stress/150','','as:6','{a}は、どこかで鳴り続ける防犯ブザーの音に耳を塞いだ。|{a}は、隣の部屋から聞こえる爪の音に、ずっと身を固くしていた。|{a}の背後で、空き缶が転がる音がした。振り向いても、誰もいなかった。|{a}は、遠くで誰かが助けを呼ぶ声を聞いた。行くべきか迷っているうちに、声は聞こえなくなった。|{a}は、壁越しに聞こえる規則正しいノックの音に、一晩中眠れなかった。|{a}は、どこかで犬が吠え続けるのを聞いていた。急に、吠えなくなった。'),
E('z_m_photo','solo','s+','np*.4+ac*.3','','as:4','{a}はスマホの写真フォルダを遡った。三日前の自分は、こんな日が来るなんて思っていなかった。|{a}は財布に入れていた古い写真を、何度も見返した。|{a}は、録音しておいた誰かの声を、音量を最小にして聞いた。|{a}は、スマホに残った最後の写真を見た。ランチの写真だった。|{a}は、誰かの家で見つけたアルバムを、つい最後までめくってしまった。|{a}は、写真の中の笑っている自分に、「呑気だね｜呑気だな｜呑気ですね」と言った。'),
E('z_m_tv','solo','s+','a*.4+.15','','as:5','{a}は電池式のテレビで、同じ避難の呼びかけが流れ続けるのを見ていた。キャスターの声が、途中で途切れた。|{a}は警察無線の周波数に合わせたラジオで、「全隊、撤退」という声を聞いた。|{a}はラジオで、聞き覚えのある地名が「封鎖区域」と呼ばれるのを聞いた。|{a}は電池式のテレビをつけた。映ったのは、誰もいないスタジオだった。|{a}は防災無線の「ただちに避難してください」という放送が、三日前から同じ録音であることに気づいた。|{a}はテレビの砂嵐を、しばらくぼんやりと眺めていた。'),
E('z_m_dark','solo','s+','fc*.4+cold*.3','','as:-4','{a}は、ゾンビ映画の主人公ならここでどうするか考えて、少しだけ笑った。|{a}は、「出勤しなくていいんだ｜出勤しなくていい｜出勤しなくていいんですね」という事実だけは、少し嬉しかった。|{a}は、ゾンビ映画の知識が意外と役に立つことに、複雑な気持ちになった。|{a}は、終わったら絶対に誰かに自慢してやる、と思った。生き延びた話ほど、いい自慢はない。|{a}は、明日の会議の資料がもう誰にも必要ないことを思って、変な笑いが出た。|{a}は、ゾンビにあだ名をつけて気を紛らわせた。今日見かけた中では「スーツ」がいちばんしつこかった。|{a}は「ローンの支払いも、もう関係ないね｜ローンの支払いも、もう関係ないな｜ローンの支払いも、もう関係ありませんね」と呟いて、少しだけ笑った。'),
E('z_m_pray','solo','s+','ac*.5+np*.2','','as:-5','{a}は、信じたこともない神様に祈った。|{a}は、子どもの頃に覚えた歌を、声に出さずに歌った。|{a}は、お守りを握りしめて目を閉じた。|{a}は、誰に祈ればいいのか分からないまま、手を合わせた。|{a}は、空に向かって「頼むよ｜頼む｜お願いします」とだけ言った。|{a}は、神社の鳥居の前で、ためらいながら一礼した。'),
E('z_m_body','solo','s+','np*.3+ac*.3+.1','','as:8','{a}は、通りに倒れた誰かの顔に、自分のジャケットをかけた。|{a}は、ベビーカーが一つ転がっているのを見て、目を逸らした。|{a}は、通りに散らばった誰かの買い物袋を見て、その人の夕飯の献立を考えてしまった。|{a}は、乗り捨てられた車の中に、チャイルドシートが空のまま残っているのを見た。|{a}は、壁に残る誰かの手形を見ないようにして、足を速めた。|{a}は、倒れていた誰かの手から、握られたままのスマホをそっと外した。画面には、まだ通話中の表示が残っていた。'),
E('z_m_rest','solo','s+','caution*.3+stress/100','','as:-8;ahp:4','{a}は鍵のかかる部屋を見つけて、二時間だけ泥のように眠った。|{a}は屋上の給水タンクの陰で、少しだけ目を閉じた。|{a}は誰もいない保健室のベッドで、靴を履いたまま横になった。|{a}はコインランドリーの乾燥機に背を預けて、少しだけうとうとした。|{a}は銀行の金庫室に入り込み、重い扉を閉めて、久しぶりに深く眠った。|{a}は図書館の書庫の奥で、本を枕にして眠った。'),
E('z_m_rain','solo','s+','.2','','as:-2','雨が降り出した。{a}は空き缶で雨水を受けながら、雨音がゾンビの呻き声を消してくれることに感謝した。|雨が降り出した。{a}は軒下で雨音を聞きながら、少しだけ目を閉じた。|雨の中、{a}はビニール傘を差して歩いた。こんな日でも、傘を差す自分がおかしかった。|激しい雨が、通りの血を洗い流していった。{a}は窓越しに、それをずっと見ていた。|雨上がりの水たまりに、青空が映っていた。{a}は、それを踏まずに避けて歩いた。'),
E('z_m_note','solo','s+','a*.3+ac*.3','','as:-2','{a}は手帳に、今日生き延びた理由を書き出した。三つ目で、ペンが止まった。|{a}は壁に、生存者向けの伝言を書き残した。「'+'{a}'+'、生きてます」|{a}は手帳に、今日すれ違った生存者の特徴を書き留めた。いつか、誰かの役に立つかもしれない。|{a}は、地図の余白に「ここに水あり」と書き込んだ。|{a}は、避難所の伝言板に貼られた無数の紙の中に、知っている名前を探した。'),
E('z_m_talk','bond','p+','warmth*.5+.15','','ab:aff4,trust3;ba:aff4,trust3','{a}と{b}は、小声で好きな食べ物の話をした。話しているあいだだけは、外の呻き声が聞こえなかった。|{a}は{b}に、この騒ぎが始まった日のことを話した。{b}も、自分の三日前のことを話した。|{a}と{b}は、生き延びたら何をするかを順番に言い合った。'),
E('z_m_joke','bond','p+','fc*.6','','ab:aff4;ba:aff5;bs:-6','{a}が「この状況、絶対あとでネタになるね｜この状況、絶対あとでネタになるな｜この状況、絶対あとでネタになりますね」と言い、{b}は不謹慎だと言いながら吹き出した。|{a}はゾンビの歩き方を真似して、{b}に本気で怒られた。それから二人で、声を殺して笑った。'),
E('z_m_snap','conflict','p+','stress/90+cp*.3','stress>50','ab:ten8;ba:ten8,aff-3','{a}は{b}の足音がうるさいと怒鳴った。怒鳴った声のほうが、ずっとうるさかった。|{b}が「大丈夫だよ｜大丈夫だ｜大丈夫ですよ」と言うと、{a}は噛みついた。「何が大丈夫なの｜何が大丈夫なんだ｜何が大丈夫なんですか」'),
E('z_m_watchtrust','bond','p+','a*.3+lead*.3','','ab:trust6;ba:trust6','{a}と{b}は、合図の決め方を決めた。口笛二回で「逃げて｜逃げろ｜逃げてください」。|{a}は{b}に、はぐれたときの集合場所を決めておこうと言った。'),
E('z_m_suspect','conflict','p+','caution*.4+jealous*.3','trust<20','ab:ten8,trust-4','{a}は眠ったふりをしながら、{b}の様子を窺っていた。|{a}は{b}の咳を聞くたびに、そっと武器に手を伸ばした。'),
E('z_m_carry','help','p+','np*.5+#hp/10','','ba:aff6,trust6;bhp:4','{a}は足を引きずる{b}に肩を貸して、階段を上がった。|{a}は{b}の重い荷物を、黙って自分のリュックに移した。'),
E('z_m_hand','romance','p+','att/60+np*.2','love>0','ab:att5;ba:att5','逃げるとき、{a}は{b}の手を掴んでいた。安全な場所に着いても、どちらもその手を離さなかった。|{a}は{b}の頬についた煤を、指でぬぐった。'),
E('z_m_cover','help','p+','np*.4+aggr*.3','','ba:trust8,aff4','{a}は{b}の背後に迫っていたゾンビを、間一髪で叩き伏せた。|{a}は{b}に「下がってて｜下がってろ｜下がっていてください」と言って、扉の前に立った。'),
E('z_m_blame','conflict','p+','cp*.5+stress/120','','ab:ten8;ba:ten10,aff-4','{a}は{b}が物音を立てたせいで群れに見つかったと責めた。|{a}は「あなたが来なければ、あの人は死ななかった｜あなたが来なければ、あいつは死ななかった｜あなたが来なければ、あの人は死ななかったんです」と{b}に言った。言ってから、後悔した。')
]);
var LB=HK.LABELS;
LB.zshinju={name:'心中',cls:'obsess',pol:0};
LB.zmercy={name:'情けの一撃',cls:'kill',pol: -1};
LB.zexec={name:'発症前に殺した',cls:'kill',pol: -2};
LB.zkill={name:'ゾンビになって喰らった',cls:'kill',pol: -2};
LB.zbite={name:'ゾンビになって咬んだ',cls:'kill',pol: -2};
LB.putdown={name:'とどめを刺した',cls:'obsess',pol: -1};
LB.sacrifice={name:'身代わり',cls:'guard',pol:2};
LB.zabandon={name:'見捨てた',cls:'enemy',pol: -2};
LB.zbait={name:'囮にした',cls:'kill',pol: -2};
LB.zmurder={name:'混乱に紛れて殺した',cls:'kill',pol: -2};
LB.zparted={name:'死に別れ',cls:'pine',pol:1};
scen.classifyFirst=function(ctx,A,B,pf){
var d=function(i){return i;};
if(pf.shinju)return{id:'zshinju'};
if(pf.zkill!=null)return{id:'zkill',dir:d(pf.zkill)};
if(pf.zbite!=null)return{id:'zbite',dir:d(pf.zbite)};
if(pf.zmercy!=null)return{id:'zmercy',dir:d(pf.zmercy)};
if(pf.zexec!=null)return{id:'zexec',dir:d(pf.zexec)};
if(pf.zmurder!=null)return{id:'zmurder',dir:d(pf.zmurder)};
if(pf.bait!=null)return{id:'zbait',dir:d(pf.bait)};
if(pf.putdown!=null)return{id:'putdown',dir:d(pf.putdown)};
if(pf.sacrifice!=null)return{id:'sacrifice',dir:d(pf.sacrifice)};
if(pf.abandoned!=null)return{id:'zabandon',dir:d(pf.abandoned)};
var lov=function(x,y){var r=ctx.R(x,y);return r.aff>35&&r.att>38;};
if((!A.alive|| !B.alive)&&(pf.couple||tieT(ctx,A,B)==='lover'||(lov(A,B)&&lov(B,A))))return{id:'zparted'};
return null;
};
scen.pairText=function(ctx,A,B,cl){
var n=function(i){return ctx.chars[i].name;},o=function(i){return i===A.i?B.name:A.name;};
switch(cl.id){
case'zshinju':return'咬まれた一人と、それを一人にできなかった一人。二人は一緒に逝くことを選んだ。';
case'zkill':return'ゾンビになった'+n(cl.dir)+'が、'+o(cl.dir)+'を喰い殺した。';
case'zbite':return'ゾンビになった'+n(cl.dir)+'が、'+o(cl.dir)+'に咬みついた。';
case'zmercy':return n(cl.dir)+'は、'+o(cl.dir)+'を一人にしないために、自分の手で終わらせた。';
case'zexec':return'咬まれた'+o(cl.dir)+'を、'+n(cl.dir)+'が発症前に殺した。';
case'zmurder':return n(cl.dir)+'は、この混乱に紛れて'+o(cl.dir)+'を殺した。';
case'zbait':return n(cl.dir)+'は、'+o(cl.dir)+'をゾンビの群れへの囮にした。';
case'putdown':return'ゾンビになった'+o(cl.dir)+'を、'+n(cl.dir)+'が自分の手で眠らせた。';
case'sacrifice':return n(cl.dir)+'は、'+o(cl.dir)+'の身代わりになった。';
case'zabandon':return n(cl.dir)+'は、'+o(cl.dir)+'を見捨てて逃げた。';
case'zparted':var dd= !A.alive?A:B,lv=dd===A?B:A;return'想い合っていた二人は、'+dd.name+(dd.fate==='ゾンビ化'?'がゾンビになったことで':'の死で')+'引き裂かれた。'+(lv.alive?lv.name+'は生き延びた。':'');
}
return null;
};
scen.charNote=function(ctx,c){
var z=c.z,f=z.family,path=z.path.filter(function(v,i,a){return i===0||a[i-1]!==v;}).map(function(i){return an(ctx,i);});
var t='足取り：'+path.join('→')+'　武器：'+wname(c)+(z.kills?'　倒したゾンビ '+z.kills+'体':'');
if(f&&f.pc==null)t+='　家族：'+f.rel+'（'+(f.inside?'街の中':'街の外')+(f.found?'・'+{ok:'合流できた',zombie:'ゾンビになっていた',dead:'亡くなっていた'}[f.state]:f.heard?'・悪い知らせが届いた':'')+'）';
if(z.cut)t+='　咬まれた腕を処置して助かった';
if(c.goalHist&&c.goalHist.length)t+='　目標の変化：'+c.goalHist.map(function(g){return GOAL[g]?GOAL[g].label:(g&&g.label)||String(g);}).join('→');
var rum=[];
if(z.safe!=null)rum.push('「'+an(ctx,z.safe)+'は安全」'+(z.safe===ctx.zb.safeOrig?'（本当）':'（デマ）'));
if(z.heliAt!=null)rum.push('「ヘリは'+an(ctx,z.heliAt)+'」'+(ctx.env.end==='heli'&&z.heliAt===ctx.zb.heli?'（本当）':'（デマ）'));
if(z.know.blood)rum.push('「返り血でも感染」（デマ）');
if(rum.length)t+='　信じた噂：'+rum.join('・');
return t;
};
HK.Endings.zombie=function(res,X){
var Zr=res.end.zombie||{},n=X.C.length;
var resc=X.byFate(/救助/),esc=X.byFate(/脱出/),live=X.byFate(/生き延びた/),zomb=X.byFate(/ゾンビ/),dead=X.C.filter(function(c){return!c.alive&& !/ゾンビ/.test(c.fate);});
var surv=resc.length+esc.length+live.length;
var head=surv?Zr.days+'日間を生き延びたのは'+X.names(resc.concat(esc,live))+'。'+(resc.length?'救助ヘリに乗れたのは'+X.names(resc)+'。':'')+(esc.length?'自力で街を出たのは'+X.names(esc)+'。':'')
:'誰も、'+Zr.days+'日目の朝を迎えられなかった。';
var lines=HK.Endings.deathLines(res,X);
(Zr.zpc||[]).forEach(function(z){
lines.push(X.nm(z.i)+'はゾンビになり、'+(z.down?'最後は誰かの手で眠らされた。':z.type==='bond'&&z.target!=null?X.nm(z.target)+'を探して'+z.area+'をさまよっている。':z.area+'をさまよっている。'));
});
var fam=(Zr.chars||[]).map(function(c,i){return c.family?X.nm(i)+'の'+c.family:null;}).filter(Boolean);
if(fam.length)lines.push('家族：'+fam.join('、'));
var npcs=(Zr.npcs||[]);
if(npcs.length)lines.push('出会った生存者：'+npcs.map(function(p){return Z.NPC_TYPES[p.type].label+'の'+p.name+(p.note?'（'+p.note+'）':p.alive?'':'（死亡）');}).join('、'));
return{
headline:head,
stats:[['生存',surv+'/'+n+'人'],['死亡',dead.length+'人'],['ゾンビ化',zomb.length+'人'],['咬まれた回数',(Zr.stats?Zr.stats.bites:0)+'回']],
lines:lines
};
};
})();
});
;
/* ==== js/zombie-bite.js ==== */
HK.Load.def(143,'js/zombie-bite.js',function(){
(function(){
'use strict';
var HK=window.HK,Z=HK.ZB,scen=Z&&Z.scen;
if(!scen)return;
var EV=scen.events;
function L(s){return s.split('|');}
function wname(c){return c.weapon?c.weapon.name:'素手';}
function luck(ctx,c){return ctx.stat(c,'luck');}
function tieT(ctx,a,b){var t=HK.Ties&&HK.Ties.get(ctx,a,b);return t?(t.like||t.type):'';}
function fill(t,m){return t.replace(/\{(\w+)\}/g,function(x,k){return m[k]!=null?m[k]:x;});}
function sayOf(ctx,c,T){var l=T[c.persona]||T.gentle;return c.name+ctx.pick(l);}
var TROUBLE=[
['{a}が{area}で冷蔵庫を開けた瞬間、中に押し込まれていたゾンビが倒れかかってきた。',0.55],
['{area}のトイレの個室から、ドアの下を這って腕が伸び、{a}の足首を掴んだ。',0.6],
['{a}が死体だと思ってまたいだものが、目を開けた。',0.65],
['エレベーターの扉が開いた。中には、ぎっしりとゾンビが詰まっていた。',0.7],
['{area}の天井の板が抜け、ゾンビが{a}の真上に落ちてきた。',0.65],
['{a}のポケットで、電源を切り忘れたスマホが大音量で鳴った。{area}じゅうのゾンビが振り向いた。',0.6],
['{area}の駐車場で、{a}が触れた車の防犯アラームが鳴り響いた。',0.55],
['{a}が{area}の角を曲がると、子どもの姿をしたゾンビが立っていた。{a}の手が、一瞬止まった。',0.6],
['{area}の自動ドアが、停電から復旧して勝手に開いた。外にいた群れが、なだれ込んできた。',0.7],
['{a}がくしゃみをこらえきれなかった。{area}の静寂が破れた。',0.5],
['{area}の階段で、上からも下からも呻き声が近づいてきた。{a}は挟まれた。',0.75],
['{a}が床下収納を開けると、そこには隠れたまま発症した誰かがいた。',0.6],
['{area}で、{a}は助けを求める声を聞いて駆けつけた。声の主は、もう人間ではなかった。',0.6],
['ゾンビになった犬が、{area}の茂みから{a}に飛びかかってきた。',0.65],
['{a}が{area}で物資を漁っていると、背後の棚がゆっくり倒れてきた。棚の向こうに、ゾンビがいた。',0.55],
['{area}の窓ガラスが割れ、ゾンビの腕が{a}の髪を掴んだ。',0.6],
['{a}が寝ていた部屋のドアノブが、ゆっくりと回った。',0.55],
['{area}のマンホールの蓋が持ち上がり、下水からゾンビが這い出してきた。',0.55],
['{a}は{area}のバスの中に隠れようとした。座席の陰で、乗客たちがまだ座っていた。全員、こちらを向いた。',0.7],
['{area}で、車の下からゾンビの手が伸びて{a}のすねを掴んだ。',0.6],
['{a}が見張り台にしていた{area}の屋上の扉を、内側から何かが叩き始めた。',0.6],
['倒したはずのゾンビが、{a}が背を向けた瞬間に起き上がった。頭を外していたのだ。',0.65],
['{area}のプールで水を汲もうとした{a}の手を、水底から伸びた手が引きずり込もうとした。',0.65],
['{a}がバリケード代わりに積んだ家具が、ゾンビの重みで崩れ始めた。',0.6],
['{area}に、ヘリの音を追ってきた群れが流れ込んできた。{a}の逃げ道が塞がれた。',0.7],
['{a}が{area}で見つけた生存者は、腕を隠していた。話している途中で、その目が白く濁った。',0.65],
['夜明け前の霧の中、{a}は{area}でゾンビとぶつかった。一メートルも離れていなかった。',0.6],
['{a}が{area}で拾った缶詰の山が崩れ、甲高い音が響いた。',0.5],
['{area}の病院のベッドで、シーツをかぶった遺体が起き上がった。',0.65],
['{a}が{area}で水を飲んでいると、水面に、背後に立つ影が映った。',0.6]
];
var OUT={
escape:L('{a}は息を止めて後ずさり、扉を閉めて全体重でふさいだ。|{a}は持っていた荷物を投げつけ、その隙に駆け抜けた。|{a}は窓から飛び降りて、植え込みに転がり込んだ。足首が痛んだが、咬まれてはいない。|{a}は咄嗟に死んだふりをした。ゾンビは{a}の上を通り過ぎていった。'),
fight:L('{a}は{w}を振り下ろした。一撃で、頭が砕けた。|{a}は{w}で喉元を突き、倒れたところで頭を潰した。手が震えていた。|{a}は叫び声を上げて{w}を振り回し、三体を倒してようやく息をついた。|{a}は相手の顎を押さえて{w}を突き立てた。生温かいものが手を伝った。'),
hurt:L('{a}は振りほどいたが、転んだ拍子に額を割った。|{a}はどうにか逃げ切ったが、爪で腕を深く裂かれていた。咬まれてはいない――たぶん。|{a}は逃げる途中で釘を踏み抜いた。'),
save:L('――{b}が横から{bw}で殴りつけ、ゾンビを{a}から引き剥がした。「ぼーっとしないで！｜ぼーっとするな！｜ぼーっとしないでください！」|――{b}が{a}の襟首を掴んで引き戻した。ゾンビの歯が、{a}の鼻先で空を噛んだ。|――{b}の投げた消火器が、ゾンビの頭に命中した。{b}は「借りは返せよ｜借りは返せ｜借りは返してくださいね」と言った。')
};
var SHOUT={
proud:L('「どいて！｜どけ！｜どいてください！」|「来るなら来なよ！｜来るなら来い！｜来るなら来なさい！」|「ちっ、しつこい！｜＝｜ちっ、しつこいですね！」'),
stern:L('「下がって！｜下がれ！｜下がってください！」|「落ち着いて……一体ずつだよ｜落ち着け……一体ずつだ｜落ち着いてください……一体ずつです」|「構えて！｜構えろ！｜構えてください！」'),
tsun:L('「ちょ、来ないでってば！｜ちょ、来るなと言っている！｜ちょ、来ないでくださいってば！」|「やだやだやだ、あっち行って！｜嫌だ、嫌だ、あっちへ行け！｜いやです、いやです、あっちへ行ってください！」|「な、何よもう！｜な、何なんだもう！｜な、何なんですかもう！」'),
gentle:L('「ごめんね……っ！｜すまない……っ！｜ごめんなさい……っ！」|「みんな、下がって！｜みんな、下がれ！｜みなさん、下がってください！」|「お願い、来ないで……！｜頼む、来ないでくれ……！｜お願いです、来ないでください……！」'),
devoted:L('「み、みんなには触らせない！｜＝｜み、みんなには触らせません！」|「私が引きつける！｜＝｜私が引きつけます！」|「逃げて！｜逃げろ！｜逃げてください！」'),
cool:L('「数は三。行けるよ｜数は三。行ける｜数は三。行けます」|「頭を狙う。それだけ｜頭を狙う。それだけだ｜頭を狙います。それだけです」|「退路は右だよ｜退路は右だ｜退路は右です」'),
free:L('「うわーっ！　無理無理無理！｜うわっ！　無理だ、無理だ！｜うわーっ！　無理です、無理です！」|「ちょっと待って聞いてない！｜待て、聞いていない！｜ちょっと待ってください、聞いてません！」|「こっちこっち！　走って！｜こっちだ！　走れ！｜こっちです！　走ってください！」'),
shy:L('「ひっ……！」|「い、いや……っ、来ないで……！｜い、嫌だ……っ、来るな……！｜い、いや……っ、来ないでください……！」|「た、たすけて……！｜た、助けてくれ……！｜た、助けてください……！」'),
polite:L('「ご、ごめん……っ！｜す、すまない……っ！｜失礼いたします……っ！」|「下がって！｜下がれ！｜お下がりください！」|「悪いけど、帰って！｜悪いが、帰ってくれ！｜申し訳ございませんが、お引き取りを！」')
};
EV.push({
id:'z_trouble',cat:'combat',scope:'solo',
when:function(ctx,a){return!a.out&&ctx.zb.A[a.z.area].z>8;},
w:function(ctx,a){var A=ctx.zb.A[a.z.area];return(0.8+A.z/100*2.6)*(Z.part(ctx)===3?1.3:1)*(1-A.bar*0.5)*(a.action.id==='loot'||a.action.id==='hunt'?1.3:1);},
run:function(ctx,a){
var rng=ctx.rng,A=ctx.zb.A[a.z.area],mates=Z.here(ctx,a);
var tr=HK.weighted(rng,TROUBLE,function(x,i){return 1/(1+((ctx.zb.trUsed||{})[i]||0)*3);});
var ti=TROUBLE.indexOf(tr);ctx.zb.trUsed=ctx.zb.trUsed||{};ctx.zb.trUsed[ti]=(ctx.zb.trUsed[ti]||0)+1;
var v=mates.length&&rng()<0.3?rng.pick(mates):a;
var m={a:v.name,area:A.name,w:wname(v)};
var t=fill(tr[0],m)+(rng()<0.45?sayOf(ctx,v,SHOUT):'');
var danger=tr[1]*(0.8+A.z/250)*(Z.part(ctx)===3?1.15:1);
var skill=luck(ctx,v)*0.05+(v.weapon?v.weapon.pow:0)*0.035+v.tr.a*0.1+v.tr.caution*0.08+(v.hp/100)*0.12+rng()*0.55;
var why=A.name+'のゾンビの多さ（'+Math.round(A.z)+'）／'+v.name+'の運・武器・冷静さ';
var actors=[v].concat(mates.filter(function(o){return o!==v;})).concat(v!==a?[a]:[]);
actors=actors.filter(function(c,i){return actors.indexOf(c)===i;});
ctx.stress(v,10);
var gap=skill-danger*HK.Dark.pick(ctx,0.8,1,1.6,'kill')*(0.5+0.5*HK.Dark.few(ctx));
if(gap>0.12){
var fight=v.tr.aggr+(v.weapon?v.weapon.pow*0.06:0)>0.55&&rng()<0.7;
t+=fill(ctx.pick(fight?OUT.fight:OUT.escape),m);
if(fight){v.z.kills++;A.z=Math.max(0,A.z-2);}
return{with:actors,text:t,why:why+'：切り抜けた',mag:14};
}
var helper=mates.filter(function(o){return o!==v&&ctx.R(o,v).aff>10&&o.tr.aggr+o.tr.np>0.7;}).sort(function(x,y){return ctx.R(y,v).aff-ctx.R(x,v).aff;})[0];
if(helper&&rng()<HK.Dark.live(ctx,0.45+ctx.R(helper,v).aff/250,'kill')){
t+=fill(ctx.pick(OUT.save),{a:v.name,b:helper.name,bw:wname(helper)});
ctx.mod(v,helper,{aff:10,trust:14});
return{with:actors,text:t,why:why+'／'+helper.name+'がとっさに助けた（'+v.name+'への好意 '+Math.round(ctx.R(helper,v).aff)+'）',mag:22};
}
if(gap> -0.12){
v.hp-=8+rng.int(12);if(v.z.wound<0)v.z.wound=ctx.stepIndex;
t+=fill(ctx.pick(OUT.hurt),m);
return{with:actors,text:t,why:why+'：けがを負った（化膿すると危ない）',mag:18};
}
if(Z.ZA_TEXT&&Z.zombieAssault&&Z.loveLv(ctx)!=='off'&&(!HK.Content||HK.Content.ok(ctx,'force'))&& !(HK.Pos&& !HK.Pos.canReceive(v))&& !(HK.State&& !HK.State.mobSexOk(v))&& !v.z.zassault&&rng()<(0.1+(Z.part(ctx)===3?0.05:0))*(ctx.env.zlust==null?1:ctx.env.zlust/50)*HK.Dark.f(ctx,'assault')){
v.z.zassault=true;v.flags.mobHit={at:ctx.stepIndex,by:'ゾンビ'};
var ra=Z.zombieAssault(ctx,v,[a].concat(mates).filter(function(o,i,arr){return o!==v&&arr.indexOf(o)===i;}),A);
ra.with.forEach(function(x){if(actors.indexOf(x)<0)actors.push(x);});
return{with:actors,text:t+ra.text,why:((HK.Pos&&HK.Pos.FORCE_MARK)||'〔合意のない展開〕')+why+'／'+ra.why,mag:ra.mag,lewd:true};
}
var res=Z.victim(ctx,[v].concat(mates.filter(function(o){return o!==v;})),v,A);
res.with.forEach(function(x){if(actors.indexOf(x)<0)actors.push(x);});
return{with:actors,text:t+res.text,why:why+'／'+res.why,mag:res.mag};
}
});
var REACT={
tq:L('{r}は自分のベルトを引き抜き、{c}の二の腕をきつく縛り上げた。「動かないで。毒が回っちゃう｜動くな。毒を回すな｜動かないでください。毒が回ります」――それが効くのかどうか、誰も知らなかった。|{r}は水筒の水を{c}の傷にかけ、シャツを裂いて巻きつけた。手が震えて、うまく結べなかった。'),
cutOk:L('{r}は一瞬だけ目を閉じた。それから{c}の腕を押さえつけ、{w}を振り下ろした。{c}の絶叫が{area}に響いた。――傷口を焼いた翌朝、{c}の熱は上がらなかった。|「恨むなよ｜恨むな｜恨まないでください」――{r}は{c}の口にタオルを噛ませ、{w}で咬まれた腕を落とした。{c}は気を失った。目を覚ましたとき、{c}はまだ{c}のままだった。'),
cutBad:L('{r}は{c}の腕に{w}を振り下ろした。けれど、遅かった。切り口の向こうで、黒い筋がもう肩まで伸びていた。|{r}は震える手で{c}の腕を落とした。止血が追いつかない。{c}の顔から、みるみる血の気が引いていった。'),
aim:L('{r}は無言で{w}を{c}に向けた。「……離れろ。三歩下がれ｜＝｜……離れてください。三歩下がってください」|{r}は{c}から距離を取り、武器を握り直した。目は{c}の咬み跡から離れなかった。'),
deny:L('{r}は{c}の腕を見て、首を振った。「咬まれてない。かすっただけ。そうでしょ？｜咬まれていない。かすっただけだ。そうだろう？｜咬まれていません。かすっただけです。そうでしょう？」――{c}は答えなかった。|{r}は{c}の傷を両手で押さえた。「大丈夫、大丈夫だから｜大丈夫だ。大丈夫だから｜大丈夫です、大丈夫ですから」――誰に言い聞かせているのか、分からなかった。'),
hold:L('{r}は咬み跡ごと{c}を抱きしめた。「まだ、ちゃんとここにいる。まだ大丈夫だ｜＝｜まだ、ちゃんとここにいます。まだ大丈夫です」|{r}は{c}の血だらけの手を握って、離さなかった。'),
panic:L('{r}は悲鳴を上げて後ずさった。「咬まれた、咬まれたって！｜咬まれた、咬まれたんだ！｜咬まれました、咬まれたんです！」――その声に、周りの全員が凍りついた。|{r}は{c}から目を逸らし、出口の方を何度も見た。')
};
var RSAY={
proud:L('「……クソが」|「勝手に死なないで。許さないから｜勝手に死ぬな。許さねえぞ｜勝手に死なないでください。許しませんよ」'),
stern:L('「……覚悟を決めて。あなたも、私もだよ｜……覚悟を決めろ。あなたも、私もだ｜……覚悟を決めてください。あなたも、私もです」|「手当てをするよ。じっとしてて｜手当てをする。黙っていろ｜手当てをします。じっとしていてください」'),
tsun:L('「ば、ばか！　なんで避けないの……！｜ば、ばか！　なぜ避けない……！｜ば、ばか！　なんで避けないんですか……！」|「やだ……やだってば……！｜嫌だ……嫌だと言っている……！｜いやです……いやですってば……！」'),
gentle:L('「大丈夫、大丈夫だよ……｜大丈夫だ、大丈夫だ……｜大丈夫です、大丈夫ですよ……」|「痛いよね。そばにいるから｜痛いだろう。そばにいる｜痛いですよね。そばにいますから」'),
devoted:L('「私が、私がなんとかする……！｜＝｜私が、私がなんとかします……！」|「代わりに咬まれればよかった……｜＝｜代わりに咬まれればよかったです……」'),
cool:L('「感染から発症まで、まだ時間はあるよ。考えて｜感染から発症まで、まだ時間はある。考えろ｜感染から発症まで、まだ時間はあります。考えてください」|「……切るなら、今しかないよ｜……切るなら、今しかない｜……切るなら、今しかありません」'),
free:L('「うそ、うそでしょ……！？｜嘘だ、嘘だろう……！？｜うそ、うそですよね……！？」|「だいじょぶ、絶対だいじょぶだから……！｜大丈夫だ、絶対に大丈夫だ……！｜大丈夫です、絶対大丈夫ですから……！」'),
shy:L('「ひっ……ち、血が……」|「ど、どうしよう、どうしよう……｜ど、どうする、どうすれば……｜ど、どうしましょう、どうしましょう……」'),
polite:L('「お願い、しっかりして……！｜頼む、しっかりしろ……！｜どうか、お気を確かに……！」|「すぐに手当てするね｜すぐに手当てする｜すぐに手当ていたします」')
};
Z.onInfect=function(ctx,c,by,aware){
if(!aware)return;
Z.later(ctx,function(){
if(!c.alive||c.out|| !c.z.bitten)return;
var mates=Z.here(ctx,c);
if(!mates.length||ctx.rng()>0.85)return;
var rng=ctx.rng,A=ctx.zb.A[c.z.area];
var r=mates.slice().sort(function(x,y){return(ctx.R(y,c).aff+ctx.R(y,c).trust*0.5)-(ctx.R(x,c).aff+ctx.R(x,c).trust*0.5);})[0];
var ra=ctx.R(r,c),lover=tieT(ctx,r,c)==='lover'||ctx.pair(r,c).couple;
var opts=[
['tq',r.tr.np*0.5+r.tr.a*0.3+0.1],
['aim',r.tr.cold*0.6+r.tr.caution*0.3-ra.aff/120],
['deny',r.tr.ac*0.4+r.tr.np*0.3+ra.aff/150],
['hold',(lover?0.6:0)+ra.aff/120+r.tr.np*0.2],
['panic',r.tr.caution*0.4+r.tr.ac*0.3-ra.aff/150]
];
if(r.weapon&&r.weapon.pow>=3)opts.push(['cut',r.tr.a*0.4+r.tr.cp*0.3+r.tr.cold*0.3+ra.trust/200+(r.z.know.cut?0.3:0)]);
var k=HK.weighted(rng,opts,function(o){return Math.pow(Math.max(0.03,o[1]),2);})[0];
var m={r:r.name,c:c.name,w:wname(r),area:A.name},t,why=c.name+'が咬まれた瞬間、'+r.name+'は';
if(k==='cut'){
var ok=rng()<0.42+luck(ctx,c)*0.03+r.tr.a*0.1;
c.hp-=35;c.z.wound=ctx.stepIndex;
t=fill(ctx.pick(ok?REACT.cutOk:REACT.cutBad),m);
why+='その場で腕を切り落とした（'+r.name+'の決断力：A・CP・ドライさ）'+(ok?'――間に合った':'――間に合わなかった');
if(ok){c.z.bitten=null;c.z.turnAt= -1;c.z.cut=true;ctx.mod(c,r,{trust:20,aff:10});}
ctx.stress(r,25);
ctx.act2({actors:[r,c],cat:'help',text:t+(rng()<0.5?sayOf(ctx,r,RSAY):''),why:why,mag:42});
if(c.hp<=0&&c.alive)ctx.kill(c,null,r.name+'に咬まれた腕を切り落とされ、失血で');
return;
}
t=fill(ctx.pick(REACT[k]),m);
why+={tq:'止血した（NP・A）',aim:'武器を向けた（ドライさ・慎重さ）',deny:'咬まれたことを認めなかった（AC・好意）',hold:'抱きしめた（'+(lover?'恋人':'好意 '+Math.round(ra.aff))+'）',panic:'取り乱した（慎重さ・AC）'}[k];
if(k==='tq')c.z.turnAt+=1;
if(k==='aim'||k==='panic')ctx.mod2(r,c,{ten:15},{ten:12,trust: -10});
if(k==='hold'||k==='deny')ctx.mod(c,r,{aff:8,trust:6});
ctx.act2({actors:[r,c],cat:k==='aim'||k==='panic'?'conflict':'help',text:t+(rng()<0.55?sayOf(ctx,r,RSAY):''),why:why,mag:26});
});
};
Z.BITE_LABEL={shield:'仲間を逃がす盾になる',confess:'想いを告げる',video:'最後の伝言を残す',berserk:'最後まで戦い抜く',gift:'持ち物を託す',lastnight:'恋人と最後の夜を過ごす'};
var LAST={
proud:L('「……悪くなかったよ、あなたたちといるのは｜……悪くなかったぜ、あなたたちといるのは｜……悪くありませんでしたよ、あなたたちといるのは」|「泣かないで。うっとうしいよ｜泣くな。うっとうしい｜泣かないでください。うっとうしいです」|「私の分まで、しぶとく生きて｜私の分まで、しぶとく生きろ｜私の分まで、しぶとく生きてください」'),
stern:L('「後は頼むよ。……それだけ｜後は頼む。……それだけだ｜後は頼みます。……それだけです」|「生きて。それが最後のお願い｜生きろ。それが最後の命令だ｜生きてください。それが最後の命令です」|「みんなと戦えたことを、誇りに思うよ｜みんなと戦えたことを、誇りに思う｜みなさんと戦えたことを、誇りに思います」'),
tsun:L('「べ、別に、寂しくなんかないから……っ｜べ、別に、寂しくなどない……っ｜べ、別に、寂しくなんかありませんから……っ」|「……ありがと。一回しか言わないから｜……感謝する。一度しか言わない｜……ありがとうございます。一回しか言いませんから」|「私のこと、忘れたら許さないから｜私のことを、忘れたら許さない｜私のこと、忘れたら許しませんから」'),
gentle:L('「みんな、ありがとう。……楽しかったよ｜みんな、ありがとう。……楽しかった｜みなさん、ありがとうございました。……楽しかったです」|「大丈夫。私は、平気だから｜大丈夫だ。私は、平気だ｜大丈夫です。私は、平気ですから」|「ちゃんとご飯、食べてね｜ちゃんと飯を食べろ｜ちゃんとご飯、食べてくださいね」'),
devoted:L('「役に立てて、よかった｜＝｜お役に立てて、よかったです」|「最後まで、そばにいられなくてごめん｜最後まで、そばにいられなくてすまない｜最後まで、そばにいられなくてごめんなさい」|「どうか、生きて｜どうか、生きてくれ｜どうか、生きてください」'),
cool:L('「合理的な判断だよ。……後悔はない｜合理的な判断だ。……後悔はない｜合理的な判断です。……後悔はありません」|「確率的に、これが最善だった｜＝｜確率的に、これが最善でした」|「……感情が追いつかないね。不思議だ｜……感情が追いつかないな。不思議だ｜……感情が追いつきませんね。不思議です」'),
free:L('「楽しかった！　ほんとに！｜楽しかった！　本当に！｜楽しかったです！　本当に！」|「泣かないでよー、笑って送ってよ！｜泣くな、笑って送ってくれ！｜泣かないでくださいよー、笑って送ってください！」|「次に生まれたら、また遊ぼうね！｜次に生まれたら、また遊ぼう！｜次に生まれたら、また遊びましょうね！」'),
shy:L('「あ、ありがとう……ずっと、言えなかった……｜＝｜あ、ありがとうございます……ずっと、言えませんでした……」|「こ、こわいけど……みんながいたから……｜こ、怖いが……みんながいたから……｜こ、こわいですけど……みなさんがいたから……」|「わ、わすれないで、ね……｜わ、忘れないで、くれ……｜わ、忘れないで、ください……」'),
polite:L('「今まで、ありがとう｜今まで、世話になった｜今まで、ありがとうございました」|「みんな、どうか無事で｜みんな、どうか無事でいてくれ｜皆様、どうかご無事で」|「お世話になったね｜世話になった｜お世話になりました」')
};
Z.biteOpts=function(ctx,c,opts,mates,close,lover){
if(mates.length){
opts.push(['shield',c.tr.np*0.45+c.tr.cp*0.3+(close?ctx.R(c,close).aff/220:0)]);
opts.push(['gift',c.tr.np*0.4+c.tr.a*0.2+0.05]);
var crush=mates.filter(function(o){return ctx.R(c,o).att>45&&o!==lover;}).sort(function(x,y){return ctx.R(c,y).att-ctx.R(c,x).att;})[0];
if(crush){c.z.crush=crush.i;opts.push(['confess',0.3+ctx.R(c,crush).att/150+c.tr.fc*0.2]);}
if(lover&&(!HK.Pos||HK.Pos.okSex(c,lover)))opts.push(['lastnight',0.35+ctx.R(c,lover).att/180]);
}
opts.push(['video',c.tr.ac*0.3+c.tr.np*0.3+(c.z.family?0.35:0)]);
opts.push(['berserk',c.tr.aggr*0.45+c.tr.fc*0.15-c.tr.ac*0.2]);
};
Z.biteRun=function(ctx,c,pick,why,mates,close,lover){
var rng=ctx.rng,A=ctx.zb.A[c.z.area],last=sayOf(ctx,c,LAST),m={a:c.name,area:A.name,w:wname(c)};
if(pick==='shield'){
ctx.act2({actors:[c].concat(mates),cat:'death',fx:function(){mates.forEach(function(o){ctx.mod(o,c,{aff:20,trust:20});ctx.stress(o,25);});},text:fill(ctx.pick(L('{area}に群れが押し寄せた夜、{a}は皆を裏口へ押しやり、ひとり正面のバリケードの前に立った。「どうせ私はもうすぐ終わる。だったら、使い道くらい選ばせて｜どうせ私はもうすぐ終わる。だったら、使い道くらい選ばせろ｜どうせ私はもうすぐ終わります。だったら、使い道くらい選ばせてください」|{a}は咬み跡を隠さずに言った。「群れは私が引きつける。その間に行って｜群れは私が引きつける。その間に行け｜群れは私が引きつけます。その間に行ってください」――{a}は{w}を握り、わざと大きな音を立てて通りへ出ていった。|{a}は仲間たちが車に乗り込むのを見届けてから、ゾンビの群れの方へ歩き出した。振り返らなかった。')),m)+last,why:why,mag:55});
A.z=Math.max(0,A.z-20);
ctx.kill(c,null,'咬まれたあと、仲間を逃がすため群れの前に残った');
return true;
}
if(pick==='confess'){
var o=ctx.chars[c.z.crush];
if(!o|| !o.alive)return false;
var yes=ctx.R(o,c).att+ctx.R(o,c).aff>70;
ctx.act2({actors:[c,o],cat:'romance',fx:function(){ctx.mod2(c,o,{att:10,aff:10},{att:yes?15:5,aff:12});if(yes)ctx.pair(c,o).couple=true;},text:fill(ctx.pick(L('{a}は咬み跡を見せてから、{b}に向き直った。「言わずに終わるのは、嫌だから。……ずっと好きだった｜言わずに終わるのは、嫌だ。……ずっと好きだった｜言わずに終わるのは、嫌ですから。……ずっと好きでした」|「どうせもうすぐ、私は私じゃなくなる。だから言う。{b}、好きだ｜どうせもうすぐ、私は私ではなくなる。だから言う。{b}、好きだ｜どうせもうすぐ、私は私じゃなくなります。だから言います。{b}、好きです」')),{a:c.name,b:o.name})+(yes?fill(ctx.pick(L('{b}は何も言わずに{a}を抱きしめた。「……遅いよ。私も｜……遅い。私もだ｜……遅いですよ。私もです」|{b}は泣きながら{a}に口づけた。咬み跡のことなど、どうでもよかった。')),{a:c.name,b:o.name}):fill(ctx.pick(L('{b}は言葉を失って、ただ{a}の手を握った。|{b}は「ごめん｜すまない｜すみません」と言いかけて、やめた。代わりに、最後まで隣に座っていた。')),{a:c.name,b:o.name})),why:why+'／'+o.name+'への惹かれ '+Math.round(ctx.R(c,o).att),mag:38});
Z.later(ctx,function(){if(c.alive&&Z.groupReaction)Z.groupReaction(ctx,c);});
return true;
}
if(pick==='video'){
var to=c.z.family?c.z.family.rel||'家族':rng.pick(['誰か','まだ見ぬ誰か','昔の友人']);
ctx.act2({actors:[c],cat:'solo',text:fill(ctx.pick(L('{a}は割れたスマホを立てかけて、録画ボタンを押した。「{to}へ。……これを見てるってことは｜{to}へ。……これを見ているということは｜＝」――そこで{a}は笑って、撮り直した。|{a}はノートの最後のページに、{to}への手紙を書いた。一枚では足りなかった。|{a}はボイスレコーダーに、{to}への伝言を吹き込んだ。最後は、声にならなかった。')),{a:c.name,to:to})+last,why:why,mag:26});
return true;
}
if(pick==='berserk'){
var k=3+rng.int(6);c.z.kills+=k;A.z=Math.max(0,A.z-12);c.hp-=15;
ctx.act2({actors:[c].concat(mates),cat:'combat',text:fill(ctx.pick(L('{a}は咬み跡を見下ろして、笑った。「なら、もう怖いものはない｜＝｜なら、もう怖いものはありません」――{a}は{w}を担いで{area}の群れに飛び込み、'+k+'体を叩き潰した。|{a}は残り時間を数えるのをやめた。代わりに、{area}のゾンビを数えて、一体ずつ減らしていった。（'+k+'体）')),m),why:why,mag:34});
if(c.hp<=0&&c.alive)ctx.kill(c,null,'咬まれたあと、最後まで群れと戦って');
return true;
}
if(pick==='gift'){
var r=close||mates[0];
if(!r)return false;
if(c.weapon&&(!r.weapon||c.weapon.pow>r.weapon.pow)){var w=r.weapon;r.weapon=c.weapon;c.weapon=w;}
r.z.food+=c.z.food;c.z.food=0;
ctx.act2({actors:[c,r],cat:'help',fx:function(){ctx.mod(r,c,{aff:15,trust:15});},text:fill(ctx.pick(L('{a}は自分のリュックを{b}に押しつけた。「食料と、武器と、地図。……もう、私には要らない｜＝｜食料と、武器と、地図です。……もう、私には要りません」|{a}は{b}に、ポケットの中身を一つずつ渡した。最後に渡したのは、家の鍵だった。')),{a:c.name,b:r.name})+last,why:why,mag:28});
return true;
}
if(pick==='lastnight'&&lover&&lover.alive){
ctx.pair(c,lover).night=true;
ctx.act2({actors:[c,lover],cat:'romance',sex:true,fx:function(){ctx.mod2(c,lover,{att:12,aff:12},{att:12,aff:12});ctx.stress(lover,20);},text:fill(ctx.pick(L('{a}は{b}に咬み跡を見せた。{b}は何も言わず、{a}の手を引いて奥の部屋へ行った。最後の夜だった。二人は、朝まで互いの名前を呼び合った。|「最後くらい、普通の恋人でいたい｜＝｜最後くらい、普通の恋人でいたいです」――{a}と{b}は、拾ったろうそくを灯して、壊れたソファで抱き合った。')),{a:c.name,b:lover.name}),why:why+'／恋人の'+lover.name,mag:40});
ctx.pair(c,lover).promise=c.i;
return true;
}
return false;
};
})();
});
;
/* ==== js/zombie-love.js ==== */
HK.Load.def(144,'js/zombie-love.js',function(){
(function(){
'use strict';
var HK=window.HK,Z=HK.ZB;
if(!Z|| !Z.scen)return;
var EV=Z.scen.events;
function L(s){return s.split('|');}
function tie(ctx,a,b){return HK.Ties?HK.Ties.get(ctx,a,b):null;}
function fill(t,m){return t.replace(/\{(\w+)\}/g,function(x,k){return m[k]!=null?m[k]:x;});}
Z.isLover=function(ctx,a,b){
if(!a|| !b||a===b)return false;
var has=HK.tieHas||function(){return false;};
return!!ctx.pair(a,b).couple|| !!(has(ctx,a,b,'lover')||has(ctx,a,b,'mate')||has(ctx,a,b,'fated'));
};
Z.isCrush=function(ctx,a,b){
if(!a|| !b||a===b||Z.isLover(ctx,a,b))return false;
if(HK.Ties&&HK.Ties.from(ctx,a,b,'crush'))return true;
if(HK.Ties&&HK.Ties.has(ctx,a,b,'crush'))return false;
return HK.canLove(a,b)&&ctx.R(a,b).att>48&&ctx.R(b,a).att<30;
};
Z.isPining=function(ctx,a,b){return!!(HK.Ties&&HK.Ties.pining&&HK.Ties.pining(ctx,a,b));};
Z.loveLv=function(ctx){
var X=HK.Lewd;
if(X&&X.conf('zombie'))return X.lv(ctx.env)==='low'?'fade':'high';
var v=ctx.env.zlewd;return v==='off'||v==='high'?v:'fade';
};
var LV=Z.LOVE={
nightAsk:{
proud:L('「＠{a}＠……明日、どっちかが死んでても文句言わないでね｜……明日、どちらかが死んでいても文句は言うなよ｜……明日、どちらかが死んでいても文句は言わないでくださいね」{a}はそう言って、{b}を引き寄せた。|{a}は{b}の手首を掴んだ。「＠{a}＠今夜だけは、見張りなんかどうでもいい｜＝｜今夜だけは、見張りなんかどうでもいいです」|「＠{a}＠……震えてるの、寒さのせいにしときなよ｜……震えているのは、寒さのせいにしておけ｜……震えているのは、寒さのせいにしておいてください」{a}はぶっきらぼうに言って、毛布の端を持ち上げた。'),
stern:L('{a}は長いあいだ黙っていた。「＠{a}＠……明日の保証はないよ。だから、今夜はあなたのそばにいたい｜……明日の保証はない。だから、今夜はあなたのそばにいたい｜……明日の保証はありません。だから、今夜はあなたのそばにいたいです」|{a}は{b}の頬に触れた。「＠{a}＠後悔だけは、残したくない｜＝｜後悔だけは、残したくありません」|{a}は見張りの交代表を閉じた。「＠{a}＠今夜の当番は、代わってもらった。……理由は、聞かないで｜今夜の当番は、代わってもらった。……理由は、聞くな｜今夜の当番は、代わってもらいました。……理由は、聞かないでください」'),
tsun:L('「＠{a}＠べ、別に、最後だからとかじゃないけど……っ｜べ、別に、最後だからというわけじゃないが……っ｜べ、別に、最後だからとかじゃありませんけど……っ」{a}は{b}の袖を掴んで離さなかった。|「＠{a}＠……今夜くらい、素直になってあげる。明日はどうなるか、わかんないし｜……今夜くらい、素直になってやる。明日はどうなるか、分からないからな｜……今夜くらい、素直になってあげます。明日はどうなるか、分かりませんし」|「＠{a}＠か、勘違いしないでよ。寒いから、くっつくだけなんだから｜か、勘違いするなよ。寒いから、くっつくだけだ｜か、勘違いしないでくださいね。寒いから、くっつくだけなんですから」{a}はそう言って、{b}の毛布に潜り込んだ。'),
gentle:L('「＠{a}＠ねえ、{b}。……今夜は、ずっとくっついててもいい？｜{b}。……今夜は、ずっとくっついていてもいいか？｜あの、{b}さん。……今夜は、ずっとくっついていてもいいですか？」|{a}は{b}の髪を撫でた。「＠{a}＠最後かもしれないなら、ちゃんと覚えておきたいの。{b}のこと、全部｜最後かもしれないなら、ちゃんと覚えておきたい。{b}のことを、全部｜最後かもしれないなら、ちゃんと覚えておきたいんです。{b}さんのこと、全部」|{a}は{b}の手を両手で包んだ。「＠{a}＠怖いね。……でも、{b}がいるから、今夜は眠れそう｜怖いな。……だが、{b}がいるから、今夜は眠れそうだ｜怖いですね。……でも、{b}さんがいるから、今夜は眠れそうです」'),
devoted:L('「＠{a}＠明日、もし私がいなくなっても……今夜のことは、覚えていてね｜明日、もし私がいなくなっても……今夜のことは、覚えていてくれ｜明日、もし私がいなくなっても……今夜のことは、覚えていてください」|{a}は震える手で、{b}のシャツのボタンに触れた。「＠{a}＠最後かもしれないから……お願い｜最後かもしれないから……頼む｜最後かもしれませんから……お願いします」|{a}は{b}の傷の手当てを終えると、その手を離さなかった。「＠{a}＠今夜は……私に、全部預けて｜今夜は……私に、全部預けてくれ｜今夜は……私に、全部預けてください」'),
cool:L('「＠{a}＠生き残る確率なんて、もう考えたくない｜生き残る確率など、もう考えたくない｜生き残る確率なんて、もう考えたくありません」{a}はそう言って、{b}の首筋に顔を埋めた。|{a}は懐中電灯を消した。「＠{a}＠……今夜は、あなたのことだけ考えさせて｜……今夜は、あなたのことだけ考えさせろ｜……今夜は、あなたのことだけ考えさせてください」|{a}は残りの弾数を数え終えて、銃を置いた。「＠{a}＠計算はやめた。……今は、{b}だけでいい｜＝｜計算はやめました。……今は、{b}さんだけでいいです」'),
free:L('「＠{a}＠ねえ、どうせ明日死ぬかもしれないならさ｜どうせ明日死ぬかもしれないならな｜ねえ、どうせ明日死ぬかもしれないなら」{a}は笑って、{b}に覆いかぶさった。「＠{a}＠後悔しないこと、しよ？｜後悔しないことを、しよう｜後悔しないこと、しましょう？」|「＠{a}＠生きてるうちに、いっぱい触っときたいの！｜生きているうちに、たくさん触っておきたい！｜生きているうちに、いっぱい触っておきたいんです！」{a}は{b}に抱きついた。笑っていたが、目は赤かった。|{a}は缶詰の最後の桃を{b}の口に放り込み、笑った。「＠{a}＠デザートのあとは、こっちね｜デザートのあとは、こっちだ｜デザートのあとは、こっちですね」'),
shy:L('「＠{a}＠あ、あの……っ、今夜、だけ……そばに、いて……｜あ、あの……っ、今夜、だけ……そばに、いてくれ……｜あ、あの……っ、今夜、だけ……そばに、いてください……」|{a}は真っ赤になって、それでも{b}の手を自分の胸に当てた。「＠{a}＠……生きてるって、確かめたいの｜……生きていると、確かめたい｜……生きてるって、確かめたいんです」|{a}は寝袋の中で、そっと{b}の背中に額を押しつけた。「＠{a}＠……こっち、向いて、くれる……？｜……こっちを、向いて、くれるか……？｜……こっち、向いて、くれますか……？」'),
polite:L('「＠{a}＠はしたないお願いだって、分かってる。……でも、明日があるとは限らないから｜はしたない頼みだと、分かっている。……だが、明日があるとは限らない｜はしたないお願いだと、分かっております。……ですが、明日があるとは限りませんので」|{a}は{b}の前に膝をついた。「＠{a}＠今夜だけは、恋人として、そばにいさせて｜今夜だけは、恋人として、そばにいさせてくれ｜今夜だけは、恋人として、お側に」|{a}は小さく頭を下げた。「＠{a}＠今夜ひと晩だけ、わがままを言わせて。……抱きしめて、くれる？｜今夜ひと晩だけ、わがままを言わせてくれ。……抱きしめて、くれるか？｜今夜ひと晩だけ、わがままを言わせてください。……抱きしめて、いただけますか」')
},
nightFade:L('二人は、バリケードの奥の狭い部屋で、互いの体温を確かめ合った。外では、ゾンビのうめき声がいつまでも続いていた。|割れた窓から月明かりが差し込んでいた。{a}と{b}は、生きていることを確かめるように、何度も名前を呼び合った。|毛布一枚の下で、{a}と{b}は朝まで離れなかった。どちらも、明日のことは口にしなかった。|発電機の音に紛れて、二人の息遣いが重なった。それが、この街で聞いたいちばん優しい音だった。'),
nightAfter:L('明け方、{b}は{a}の寝顔を見つめながら、「生き延びたら、もう一回｜＝｜生き延びたら、もう一回しましょう」と小さく呟いた。|朝になって、{a}は{b}の首筋に残った痕を指でなぞった。「……これで、どこにいても分かるね｜……これで、どこにいても分かる｜……これで、どこにいても分かりますね」|{a}と{b}は、同じ毛布にくるまったまま、朝日が昇るのを待った。外の音は、もう気にならなかった。|二人は、互いの体に咬み跡がないことを確かめ合ってから、ようやく少しだけ笑った。'),
leaveBit:L('{a}は眠っている{b}の額に口づけてから、そっと立ち上がった。置き手紙には「愛してる。探さないで｜愛している。探すな｜愛しています。探さないでください」とだけ書いてあった。|{a}は{b}が見張りに立った隙に、裏口から出ていった。{b}のリュックには、{a}の分の食料が全部押し込まれていた。|「ちょっと水を汲んでくる｜＝｜ちょっと水を汲んできます」――{a}は{b}に笑いかけて出ていき、二度と戻らなかった。咬み跡のことは、最後まで言わなかった。|{a}は{b}の指から、自分が贈った指輪をそっと外して、{b}のポケットに入れ直した。それから、音を立てずに部屋を出た。'),
leaveSelf:L('食料は、あと一人分しかなかった。{a}は{b}が眠っているあいだに、それを{b}の枕元に置いて、外へ出ていった。|{a}は群れの気配に気づいた。{b}を起こさずに外へ出て、わざと大きな音を立てながら、反対の方向へ走った。|{a}は足の怪我を隠していた。「足手まといにだけは、なりたくない｜＝｜足手まといにだけは、なりたくありません」――{a}は書き置きを残して、夜明け前に出ていった。|{a}は{b}の寝顔を長いあいだ見つめていた。「必ず迎えに来る｜＝｜必ず迎えに来ます」――そう書いた紙を残して、{a}は一人で救助の噂を確かめに出た。'),
found:L('{b}が目を覚ますと、隣は冷たかった。置き手紙を読んで、{b}は声を上げずに泣いた。|{b}は空っぽの寝袋を見て、すぐに上着を掴んだ。「探す。絶対に｜＝｜絶対に、探します」|{b}は書き置きを握りつぶした。「勝手に決めるなよ……！｜勝手に決めるな……！｜勝手に決めないでください……！」――そのまま、{a}の足跡を追って外へ飛び出した。|{b}は置き手紙を何度も読み返してから、丁寧に折りたたんで胸ポケットにしまった。'),
see:L('{v}は通りの向こうに{z}を見つけた。{z}は、{v}が最後に贈ったマフラーを、まだ首に巻いていた。|{v}は、ガラス越しに{z}と目が合った。{z}が首を傾げた。その癖は、生きていたころと同じだった。|{v}は{z}の名前を呼びかけて、自分の口を手で塞いだ。'),
talk:L('{v}は武器を下ろした。「{z}、私だよ。……分かる？｜{z}、私だ。……分かるか？｜{z}、私です。……分かりますか？」――{z}は一瞬だけ動きを止めた。それが答えなのかどうか、{v}には分からなかった。|{v}は泣きながら、{z}に昨日の話をした。{z}はうめき声を上げながら近づいてきた。{v}は、最後まで後ずさらなかった。|{v}は{z}の前に立ちはだかり、仲間に叫んだ。「撃たないで！　まだ、{z}かもしれない！｜撃つな！　まだ、{z}かもしれない！｜撃たないでください！　まだ、{z}かもしれません！」'),
embrace:L('{v}は武器を捨てて、{z}を抱きしめた。「一人にしてごめん。……今、行くから｜一人にしてすまない。……今、行く｜一人にしてごめんなさい。……今、行きますから」――{z}の歯が、{v}の首筋に沈んだ。|{v}は逃げなかった。{z}に咬まれながら、{v}は{z}の背中を撫で続けた。「これで、ずっと一緒だね｜これで、ずっと一緒だ｜これで、ずっと一緒ですね」|{v}は{z}の腕の中に自分から飛び込んだ。仲間の叫び声は、もう聞こえていなかった。'),
self:L('{v}は、仲間が武器を構える前に前へ出た。「……{z}は、私がやる。誰にも、触らせない｜＝｜……{z}は、私がやります。誰にも、触らせません」――{v}は泣きながら、それをやり遂げた。|{v}は{z}の目を最後まで見つめていた。「愛してる。おやすみ｜愛している。おやすみ｜愛しています。おやすみなさい」――{v}の手は、一度も震えなかった。|{v}は{z}を抱きしめるようにして動きを止め、そのまま、終わらせた。崩れ落ちた{z}の手を、{v}はしばらく握ったままだった。'),
chain:L('{v}は{z}を倒すことができなかった。代わりに、{z}をビルの一室に閉じ込め、扉を鎖で縛った。毎晩、{v}は扉の前に座って、{z}に話しかけた。|{v}は{z}の手足を縛って、部屋の奥に寝かせた。「治る薬が見つかるかもしれない｜＝｜治る薬が見つかるかもしれません」――仲間は誰も、何も言わなかった。'),
after:{
proud:L('{v}は壁を殴りつけた。拳から血が出ても、殴るのをやめなかった。'),
stern:L('{v}は何も言わずに、{z}の名前をナイフで柱に刻んだ。'),
tsun:L('{v}「ばか……ばか、ばか……っ！　置いていかないって、言ったじゃない……！」'),
gentle:L('{v}は{z}の好きだった歌を、小さな声で口ずさんだ。最後まで歌えなかった。'),
devoted:L('{v}は、{z}のいない世界で生きる理由を、一晩中探していた。'),
cool:L('{v}はいつもどおりの顔で見張りに立った。ただ、その夜は一度も瞬きをしなかった。'),
free:L('{v}はずっと笑っていた。笑っていないと、壊れてしまいそうだった。'),
shy:L('{v}は膝を抱えたまま、{z}の名前を何度も、何度も呼んでいた。'),
polite:L('{v}は「失礼いたします」と誰にともなく言い、部屋の隅で静かに泣いた。')
},
rush:L('「明日、どっちかが死ぬかもしれないだろ。だから今言う｜明日、どちらかが死ぬかもしれないだろう。だから今言う｜明日、どちらかが死ぬかもしれません。だから今言います」――{a}は{b}の返事も待たずに、好きだと言った。|{a}は群れから逃げ込んだ物置の中で、息を切らしたまま言った。「……好き。今言わないと、一生言えない気がした｜……好きだ。今言わないと、一生言えない気がした｜……好きです。今言わないと、一生言えない気がしたんです」|{a}は見張りの交代のとき、{b}を呼び止めた。「生きて帰れたら、なんて待てない。好きだ｜＝｜生きて帰れたら、なんて待てません。好きです」|{a}は{b}の袖を掴んだ。「死ぬ前に、一個だけ。……ずっと、好きだった｜死ぬ前に、一つだけ。……ずっと、好きだった｜死ぬ前に、一つだけ。……ずっと、好きでした」'),
rushYes:L('{b}は少し驚いた顔をしてから、{a}の手を握り返した。「……遅いよ｜……遅い｜……遅いですよ」|{b}は黙って、{a}の肩に額を預けた。それが答えだった。|{b}は「こんな時に｜こんな時にか｜こんな時にですか」と笑って、それから泣いた。「……私も｜＝｜……私もです」'),
rushNo:L('{b}は困ったように目を伏せた。「……ごめん。今は、生き延びることしか考えられない｜……すまない。今は、生き延びることしか考えられない｜……ごめんなさい。今は、生き延びることしか考えられません」|{b}は「生き延びたら、ちゃんと聞く｜＝｜生き延びたら、ちゃんと聞きます」とだけ言った。{a}は、それで十分だと思うことにした。|{b}は何も答えなかった。{a}は「言えてよかった｜＝｜言えてよかったです」と笑って、先に歩き出した。'),
press:L('{a}は{b}を壁際に追い詰めた。「どうせ世界は終わるんだ。……なら、我慢する意味なんてないだろ｜どうせ世界は終わるのだ。……なら、我慢する意味などないだろう｜どうせ世界は終わるんです。……なら、我慢する意味なんてないでしょう」|{a}は{b}の手首を掴んで、強引に唇を重ねた。「明日死ぬかもしれないのに、遠慮なんかしてられない｜明日死ぬかもしれないのに、遠慮などしていられない｜明日死ぬかもしれないのに、遠慮なんかしていられません」|{a}は{b}の寝床に潜り込んだ。「一人で寝るの、もう無理。……いいでしょ？｜一人で寝るのは、もう無理だ。……いいだろう？｜一人で寝るのは、もう無理です。……いいでしょう？」'),
pressYes:L('{b}は一瞬だけ抵抗して、それから{a}の背中に腕を回した。外の闇より、{a}の体温の方がましだった。|{b}は「……今夜だけだからな｜……今夜だけだ｜……今夜だけですからね」と言った。その声は、拒んでいなかった。'),
pressNo:L('{b}は{a}の胸を突き飛ばした。「こんな時だからって、何してもいいわけじゃない｜こんな時だからといって、何をしてもいいわけではない｜こんな時だからって、何をしてもいいわけではありません」――それから数日、{b}は{a}と目を合わせなかった。|{b}は{a}の手を振りほどいた。「……今のは、聞かなかったことにする｜＝｜……今のは、聞かなかったことにします」{a}は、自分が何をしたのかに気づいて、しばらく動けなかった。'),
grave:L('{a}は、眠る{b}の横顔を見つめながら決めた。この気持ちは、言わない。言わずに、守る。|{a}は{b}が別の誰かと笑っているのを見て、そっと目を逸らした。「……それでいい。生きててくれれば｜……それでいい。生きていてくれれば｜……生きていてくれれば、それでいいんです」|{a}はノートの最後のページに{b}への想いを書いて、そのページを破って燃やした。灰になるまで、見届けた。|{a}は自分の胸に誓った。この想いは墓まで持っていく。その代わり、{b}だけは、必ずこの街から出す。'),
guard:L('{a}は自分の分の缶詰を、黙って{b}のリュックに入れた。{b}は気づかなかった。|{a}は{b}の見張りの番を、何も言わずに代わった。「眠れないから｜眠れないからだ｜眠れないんです」と嘘をついた。|群れが近づいたとき、{a}は真っ先に{b}の前に立った。理由を訊かれても、「たまたま近かったから｜たまたま近かっただけだ｜たまたま近かっただけです」としか言わなかった。|{a}は{b}の靴紐がほどけているのに気づいて、黙ってしゃがみ、結び直した。{b}が礼を言うと、{a}はそっぽを向いた。|{a}は{b}が眠るまで、ずっと扉の前に座っていた。'),
rushM:L('「明日、どっちかが死ぬかもしれないだろ。だから今言う｜明日、どちらかが死ぬかもしれないだろう。だから今言う｜明日、どちらかが死ぬかもしれません。だから今言います」――{a}がそう切り出したとき、{b}も同時に口を開いていた。「待って、私も今、言おうとしてた｜待て、私も今、言おうとしていた｜待ってください、私も今、言おうとしていました」|{a}は群れから逃げ込んだ物置の中で、息を切らしたまま言った。「……好き。どうせ{b}は、私のことなんか何とも思ってないだろうけど｜……好きだ。どうせ{b}は、私のことなど何とも思っていないだろうが｜……好きです。どうせ{b}は、私のことなんか何とも思っていないでしょうけど」|見張りの交代のとき、{a}は{b}を呼び止めた。{b}も、{a}を呼び止めようとしていた。二人の「あのさ」が、ぴったり重なった。{a}は、先に言った。「……ずっと、好きだった｜＝｜……ずっと、好きでした」|{a}は{b}の袖を掴んだ。「死ぬ前に、一個だけ。……ずっと、好きだった。迷惑なのは分かってる｜死ぬ前に、一つだけ。……ずっと、好きだった。迷惑なのは分かっている｜死ぬ前に、一つだけ。……ずっと、好きでした。迷惑なのは分かっています」'),
rushMYes:L('{b}はしばらく呆然として、それから笑い出した。「……それ、こっちの台詞｜……それは、こっちの台詞だ｜……それ、こちらの台詞です」|{b}は顔を覆った。「ずっと、私の片想いだと思ってた｜ずっと、私の片想いだと思っていた｜ずっと、私の片想いだと思っていました」――{a}も、まったく同じことを思っていた。二人は顔を見合わせて、力が抜けたように座り込んだ。|{b}は{a}の手を握り返した。「何とも思ってないわけないでしょ。……こっちの台詞だよ、それ｜何とも思っていないわけがないだろう。……それは、こっちの台詞だ｜何とも思っていないわけがないでしょう。……それは、こちらの台詞です」|{b}は泣きながら笑った。「私も、ずっと好きだった。こんな街になるまで、二人して何やってたんだろうね｜私も、ずっと好きだった。こんな街になるまで、二人して何をやっていたんだろうな｜私も、ずっと好きでした。こんな街になるまで、二人して何をやっていたんでしょうね」'),
pressM:L('{a}は{b}を壁際に追い詰めた。「どうせ世界は終わるんだ。……嫌なら、突き飛ばして。それで諦める｜どうせ世界は終わる。……嫌なら、突き飛ばしてくれ。それで諦める｜どうせ世界は終わるんです。……嫌なら、突き飛ばしてください。それで諦めます」|{a}は{b}の手首を掴んで、唇を重ねた。嫌われる覚悟は、とっくにできていた。|{a}は{b}の寝床に潜り込んだ。「一人で寝るの、もう無理。……迷惑なのは分かってる｜一人で寝るのは、もう無理だ。……迷惑なのは分かっている｜一人で寝るのは、もう無理です。……迷惑なのは分かっています」'),
pressMYes:L('{b}は突き飛ばさなかった。代わりに{a}の襟を掴んで、自分から引き寄せた。「……遅い。ずっとこうしたかったのは、私の方｜……遅い。ずっとこうしたかったのは、私の方だ｜……遅いです。ずっとこうしたかったのは、私の方です」|{b}は{a}の背中に腕を回して、震える声で言った。「ずっと、私だけだと思ってた｜ずっと、私だけだと思っていた｜ずっと、私だけだと思っていました」――{a}は、自分の耳を疑った。|{b}は「……今夜だけ、なんて言わないでよ｜……今夜だけ、などと言うな｜……今夜だけ、なんて言わないでください」と言った。{a}がその意味に気づくまで、少し時間がかかった。それは、こっちの台詞だった。'),
graveM:L('{a}は、眠る{b}の横顔を見つめながら決めた。この気持ちは、言わない。――同じ夜、背中合わせの寝袋の中で、{b}も同じことを決めていた。|{a}はノートの最後のページに{b}への想いを書いて、破って燃やした。数日前、{b}も同じようにページを一枚燃やしていたことを、{a}は知らない。|{a}は自分の胸に誓った。この想いは墓まで持っていく。{b}はどうせ、私のことなんか見ていないのだから。――{b}もまた、まったく同じ理由で口を閉ざしていた。|{a}は{b}が別の誰かと笑っているのを見て、そっと目を逸らした。その一瞬あと、{b}がこちらを振り返ったことに、{a}は気づかなかった。'),
guardM:L('{a}は自分の分の缶詰を、黙って{b}のリュックに入れた。その晩、{a}は自分のリュックに、見覚えのない缶詰が入っているのを見つけた。|{a}は{b}の見張りの番を代わろうとして、扉の前で{b}と鉢合わせた。{b}も、{a}の番を代わりに来たところだった。「……眠れないから｜……眠れないからだ｜……眠れないんです」「……私も｜＝｜……私もです」|群れが近づいたとき、{a}は{b}の前に立った。同時に{b}も{a}の前に出ようとして、二人は肩をぶつけた。「なんで前に出るの｜なぜ前に出る｜なぜ前に出るんですか」「そっちこそ｜＝｜そちらこそです」|{a}は{b}が眠るまで、扉の前に座っていた。{b}は寝たふりをしたまま、どうして自分なんかのためにと思っていた。|{a}は{b}の靴紐を黙って結び直した。礼を言う{b}の顔が赤いことに、{a}は気づかなかった。そっぽを向いた自分の顔も、同じくらい赤かった。')
};
function say(ctx,c,T){var l=T[c.persona]||T.gentle;return ctx.pick(l);}
EV.push({
id:'z_lv_night',cat:'romance',sex:true,scope:'pair',
when:function(ctx,a,b){
if(Z.loveLv(ctx)==='off'|| !Z.isLover(ctx,a,b))return false;
if(HK.Pos&& !HK.Pos.okSex(a,b))return false;
if(Z.part(ctx)<2)return false;
var pf=ctx.pair(a,b);
if((pf.zlvN||0)+(pf.sitN||0)+(pf.zr18||0)>=2||(pf.zlvAt!=null&&ctx.stepIndex-pf.zlvAt<6))return false;
if(pf.sitAt!=null&&ctx.stepIndex-pf.sitAt<4)return false;
return Z.day(ctx)>=2||a.stress>35||b.stress>35||a.z.bitten||b.z.bitten;
},
w:function(ctx,a,b){return 1.2+(a.stress+b.stress)/120+ctx.R(a,b).att/90+(Z.part(ctx)===3?0.8:0);},
run:function(ctx,a,b){
var pf=ctx.pair(a,b);pf.zlvN=(pf.zlvN||0)+1;pf.zlvAt=ctx.stepIndex;pf.night=true;
ctx.mod2(a,b,{att:8,aff:8,trust:6},{att:8,aff:8,trust:6});
a.stress=Math.max(0,a.stress-12);b.stress=Math.max(0,b.stress-12);
var lv=Z.loveLv(ctx),v={a:a.name,b:b.name};
var lead= !HK.Pos||HK.Pos.order(a,b,[a,b])[0]===a,askL=(LV.nightAsk[a.persona]||LV.nightAsk.gentle).filter(function(s){return lead|| !/覆いかぶさ|手首を掴|引き寄せ/.test(s);});
var ask=ctx.pick(askL.length?askL:LV.nightAsk.gentle),t=(/^\u300c/.test(ask)?a.name:'')+fill(ask,v);
var body=lv==='high'&&LV.nightHigh?LV.nightHigh(ctx,a,b):fill(ctx.pick(LV.nightFade),v);
return{text:t+body+fill(ctx.pick(LV.nightAfter),v),why:'恋人どうし（'+Z.day(ctx)+'日目の夜）。明日の保証がない（焦り '+Math.round(a.stress)+'・'+Math.round(b.stress)+'）',mag:34};
}
});
EV.push({
id:'z_lv_vanish',cat:'solo',scope:'pair',
when:function(ctx,a,b){
if(!Z.isLover(ctx,a,b)||a.z.vanished||a.z.bitten||Z.day(ctx)<2)return false;
return(a.z.food<=0&&b.z.food<=1)||a.hp<45||ctx.zb.A[a.z.area].z>55;
},
w:function(ctx,a,b){return 0.12+a.tr.np*0.25+a.tr.cp*0.1+(a.hp<45?0.25:0)-a.tr.jealous*0.15;},
run:function(ctx,a,b){
a.z.vanished=true;a.z.vanishFrom=b.i;
a.z.food=Math.max(0,a.z.food);b.z.food+=a.z.food;a.z.food=0;
var na=Z.adj(a.z.area).sort(function(x,y){return ctx.zb.A[y].z-ctx.zb.A[x].z;})[0];
var m={a:a.name,b:b.name};
var t=fill(ctx.pick(LV.leaveSelf),m);
a.z.area=na;a.z.path.push(na);
ctx.mod(b,a,{aff:10});
Z.later(ctx,function(){lostReact(ctx,a,b);});
return{text:t,why:a.name+'は恋人の'+b.name+'のために、黙って姿を消した（NP・CP'+(a.hp<45?'・怪我':'')+'）',mag:30};
}
});
function lostReact(ctx,a,b){
if(!b.alive||b.out)return;
ctx.stress(b,22);
var t=fill(ctx.pick(LV.found),{a:a.name,b:b.name});
if(b.goal.id!=='chaos'&&b.tr.np+b.tr.impulse>0.9){b.focus=a;if(b.goal.id!=='protect'){b.goal=Z.scen.goals.filter(function(g){return g.id==='protect';})[0]||b.goal;}}
ctx.act2({actors:[b,a],cat:'solo',text:t,why:b.name+'は、'+a.name+'がいなくなったことに気づいた',mag:26});
}
Z.loveLeave=function(ctx,c,lover){
Z.later(ctx,function(){lostReact(ctx,c,lover);});
return fill(ctx.pick(LV.leaveBit),{a:c.name,b:lover.name});
};
Z.loverZombie=function(ctx,zp,T,P){
var c=ctx.chars[zp.i];
if(!T|| !Z.isLover(ctx,T,c)||zp.loveDone)return false;
zp.loveDone=true;
var rng=ctx.rng,aff=ctx.R(T,c).aff,m={v:T.name,z:c.name};
var opts=[
['talk',0.4+T.tr.np*0.4+T.tr.ac*0.2],
['embrace',(aff>70?0.15:0.03)+T.tr.ac*0.18+T.tr.jealous*0.15+(T.tr.np>0.6&&T.tr.ac>0.5?0.2:0)+(T.stress>60?0.15:0)],
['self',T.tr.cp*0.35+T.tr.a*0.3+T.tr.cold*0.2+(T.weapon&&T.weapon.pow>=3?0.15:0)],
['chain',0.15+T.tr.np*0.25+T.tr.caution*0.2+(P.length>1?0.15:0)]
];
var k=HK.weighted(rng,opts,function(o){return Math.pow(Math.max(0.03,o[1]),2);})[0];
var actors=[T,c].concat(P.filter(function(o){return o!==T;}));
var tail=' '+fill(say(ctx,T,LV.after),m);
ctx.stress(T,30);
if(k==='embrace'&&Z.riseTogether&&rng()<0.5){
ctx.pair(T,c).zbite=c.i;
Z.riseTogether(ctx,zp,T,{pre:fill(ctx.pick(LV.embrace),m),why:T.name+'は、ゾンビになった恋人の'+c.name+'を拒まず、その場で同じものになった（好意 '+Math.round(aff)+'・AC・執着）'});
return true;
}
if(k==='embrace'){
ctx.act2({actors:actors,cat:'death',text:fill(ctx.pick(LV.embrace),m),why:T.name+'は、ゾンビになった恋人の'+c.name+'を拒まなかった（好意 '+Math.round(aff)+'・AC・執着）',mag:55});
ctx.pair(T,c).zbite=c.i;
if(Z.infect)Z.infect(ctx,T,c.i,true);else ctx.kill(T,c,'ゾンビになった恋人の'+c.name+'に、自分から咬まれた');
return true;
}
if(k==='self'){
zp.down=true;ctx.zb.stats.putdown++;ctx.pair(T,c).putdown=T.i;
c.fateNote=(c.fateNote||'')+'。最後は恋人の'+T.name+'の手で眠らされた';
ctx.act2({actors:actors,cat:'combat',text:fill(ctx.pick(LV.self),m)+tail,why:T.name+'は、恋人の'+c.name+'を自分の手で眠らせると決めた（CP・A・ドライさ）',mag:50});
return true;
}
if(k==='chain'){
zp.down=true;zp.chained=true;
c.fateNote=(c.fateNote||'')+'。恋人の'+T.name+'に、部屋に閉じ込められた';
ctx.act2({actors:actors,cat:'help',text:fill(ctx.pick(LV.chain),m)+tail,why:T.name+'は、恋人の'+c.name+'を倒せなかった（NP・慎重さ）',mag:44});
return true;
}
ctx.act2({actors:actors,cat:'solo',text:fill(ctx.pick(LV.talk),m),why:T.name+'は、ゾンビになった'+c.name+'に話しかけた（NP・AC）',mag:36});
return false;
};
Z.loverSee=function(ctx,v,c){
return Z.isLover(ctx,v,c)?fill(ctx.pick(LV.see),{v:v.name,z:c.name}):null;
};
LV.crushZ={
keep:L('{v}は、ゾンビになった{z}の手足を縛り、地下の倉庫に閉じ込めた。扉に鍵をかけてから、{v}は初めて笑った。「やっと、どこにも行かなくなった｜＝｜やっと、どこにも行かなくなりました」|{v}は{z}の首に革のベルトを巻き、部屋の柱に繋いだ。「もう、誰のことも見なくていいよ。……これで、ずっと私のものだ｜もう、誰のことも見なくていい。……これで、ずっと私のものだ｜もう、誰のことも見なくていいですよ。……これで、ずっと私のものです」|{v}は{z}をシーツでくるみ、自分の寝床の隣に寝かせた。うめき声に、{v}は一晩中相槌を打った。「やっと、ちゃんと話を聞いてくれるね｜やっと、ちゃんと話を聞いてくれる｜やっと、ちゃんと話を聞いてくれますね」|{v}は{z}を空き部屋に閉じ込め、外から板を打ちつけた。扉に額を当てて、{v}は囁いた。「これで、あなたは私のもの。……誰にも、渡さない｜これで、あなたは私のものだ。……誰にも、渡さない｜これで、あなたは私のものです。……誰にも、渡しません」'),
keepVisit:L('{v}は今夜も、閉じ込めた{z}に話しかけていた。返事がないことには、もう慣れていた。|{v}は{z}の髪を、毎朝とかしてやった。{z}は、一度も嫌がらなかった。生きていたころと違って。|{v}は{z}の分の食事を、毎日扉の前に置いた。手つかずのまま、腐っていった。|{v}は扉越しに、{z}に今日あったことを報告した。「ねえ、聞いてる？｜おい、聞いているか？｜あの、聞いていますか？」――うめき声が答えた。{v}は満足そうに頷いた。'),
keepEnd:L('{v}は街を出なかった。地下の倉庫の前に椅子を置いて、そこで暮らすことにした。|救助のヘリの音が聞こえても、{v}は窓の外を見なかった。扉の向こうに、全部があったから。'),
say:L('{v}は{z}の前に立ち、初めて口にした。「ずっと、好きだった｜＝｜ずっと、好きでした」――{z}は、うめき声で答えた。それでも{v}は、少しだけ救われた顔をした。|{v}は{z}に向かって言った。「生きてるうちに、言えばよかった｜生きているうちに、言えばよかった｜生きているうちに、言えばよかったです」――{z}の濁った目に、{v}の泣き顔が映っていた。'),
self:L('{v}は仲間の武器を押しのけた。「……最後くらい、触れてもいいよね｜……最後くらい、触れてもいいだろう｜……最後くらい、触れてもいいですよね」――{v}は{z}を抱きしめるようにして、終わらせた。|{v}は{z}の目を見つめたまま、引き金を引いた。「一度も、こっちを見てくれなかったね｜一度も、こちらを見てくれなかった｜一度も、こちらを見てくれませんでしたね」――その声は、ひどく優しかった。'),
keepM:L('{v}は、ゾンビになった{z}を地下の倉庫に閉じ込めた。{z}の上着のポケットから、{v}の名前を何度も書いては消したメモが落ちた。{v}はそれを拾わずに、扉に鍵をかけた。「……今さら、そんなの」|{v}は{z}を空き部屋に閉じ込め、外から板を打ちつけた。「生きてるうちは、私なんか見てなかったくせに｜生きているうちは、私など見ていなかったくせに｜生きているうちは、私なんか見ていなかったじゃないですか」――{z}が誰を見ていたのか、{v}だけが知らなかった。|{v}は{z}をシーツでくるみ、自分の寝床の隣に寝かせた。うめき声に相槌を打ちながら、{v}は言った。「やっと、こっちを見てくれるね｜やっと、こちらを見てくれる｜やっと、こちらを見てくれますね」――ずっと見ていたのは、{z}も同じだった。'),
sayM:L('{v}は{z}の前に立ち、初めて口にした。「ずっと、好きだった｜＝｜ずっと、好きでした」――{z}の喉から、うめき声とは違う短い音が漏れた。それが「私も」に聞こえたのは、きっと気のせいだった。|{v}は{z}に向かって言った。「生きてるうちに、言えばよかった｜生きているうちに、言えばよかった｜生きているうちに、言えばよかったです」――あとで{z}の荷物から、{v}に宛てた渡せなかった手紙が見つかった。書き出しは「ずっと、好きでした」だった。|{v}は{z}の濁った目を見つめて言った。「どうせ、迷惑だったよね｜どうせ、迷惑だっただろう｜どうせ、迷惑でしたよね」――{v}がなくしたと思っていたお守りが、{z}の首から下がっていた。'),
selfM:L('{v}は仲間の武器を押しのけた。「……最後くらい、触れてもいいよね｜……最後くらい、触れてもいいだろう｜……最後くらい、触れてもいいですよね」――{v}は{z}を抱きしめるようにして、終わらせた。{z}の胸ポケットから、{v}と二人で写った写真がこぼれ落ちた。|{v}は{z}の目を見つめたまま、引き金を引いた。「一度も、こっちを見てくれなかったね｜一度も、こちらを見てくれなかった｜一度も、こちらを見てくれませんでしたね」――{z}がずっと見ていたのは、{v}の背中だった。そのことを、{v}は最後まで知らなかった。|{v}は{z}を眠らせたあと、{z}の手に握られていた紙を開いた。「生きて帰れたら、{v}に言う」――{v}は、その場から動けなくなった。')
};
Z.crushZombie=function(ctx,zp,P){
var c=ctx.chars[zp.i];
if(zp.crushDone)return false;
var o=P.filter(function(x){return Z.isCrush(ctx,x,c)||(HK.Unreq&&HK.Unreq.crushOn(ctx,x,c));})[0];
if(!o)return false;
zp.crushDone=true;
var rng=ctx.rng,m={v:o.name,z:c.name};
var unreq=HK.Unreq&&HK.Unreq.cold(ctx,o,c);
var pin=Z.isPining(ctx,o,c),PK=function(k){return LV.crushZ[pin?k+'M':k];};
var opts=[
['keep',(HK.Obsess&& !HK.Obsess.jealOk(ctx,o,c)? -9:0)+o.tr.jealous*0.55+o.tr.ac*0.25+o.stress/160+(unreq?0.25:0)-o.tr.cp*0.15-o.tr.np*0.1],
['say',0.35+o.tr.honesty*0.3+o.tr.np*0.2],
['self',o.tr.cp*0.3+o.tr.a*0.25+o.tr.cold*0.2+(o.weapon&&o.weapon.pow>=3?0.15:0)]
];
var k=HK.weighted(rng,opts,function(x){return Math.pow(Math.max(0.03,x[1]),2);})[0];
var actors=[o,c].concat(P.filter(function(x){return x!==o;}));
ctx.stress(o,k==='keep'? -20:25);
if(k==='keep'){
zp.down=true;zp.kept=o.i;o.z.keep=c.i;o.z.keepArea=zp.area;
c.fateNote=(c.fateNote||'')+(pin?'。両片想いだった':'。片想いしていた')+o.name+'に、閉じ込められた';
ctx.act2({actors:actors,cat:'betray',text:fill(ctx.pick(PK('keep')),m),why:o.name+'は、'+(pin?'両片想いだった（'+o.name+'はそれを知らない）':'片想いの相手だった')+c.name+'を手放さなかった（執着 '+Math.round(o.tr.jealous*100)+'・AC・焦り '+Math.round(o.stress)+(unreq?'・生きているうちは相手にされなかった':'')+'）',mag:52});
return true;
}
if(k==='self'){
zp.down=true;ctx.zb.stats.putdown++;ctx.pair(o,c).putdown=o.i;
c.fateNote=(c.fateNote||'')+(pin?'。最後は、両片想いだった':'。最後は、片想いしていた')+o.name+'の手で眠らされた';
ctx.act2({actors:actors,cat:'combat',text:fill(ctx.pick(PK('self')),m),why:o.name+'は、'+(pin?'両片想いだった相手を、想いを知らないまま':'片想いの相手を')+'自分の手で眠らせた（CP・A・ドライさ）',mag:46});
return true;
}
ctx.act2({actors:actors,cat:'romance',text:fill(ctx.pick(PK('say')),m),why:o.name+'は、ゾンビになった'+c.name+'に、やっと想いを告げた'+(pin?'（両片想いだった。'+c.name+'も同じ気持ちだったことを、'+o.name+'は知らない）':''),mag:38});
return false;
};
EV.push({
id:'z_keep_visit',cat:'solo',scope:'solo',
when:function(ctx,a){return a.z.keep!=null&&(a.z.keepN||0)<3;},
w:function(){return 4;},pri:true,
run:function(ctx,a){
a.z.keepN=(a.z.keepN||0)+1;
var c=ctx.chars[a.z.keep],last=a.z.keepN>=3||Z.day(ctx)>=ctx.env.days;
a.z.area=a.z.keepArea;a.goal=Z.scen.goals.filter(function(g){return g.id==='live';})[0]||a.goal;
if(last)a.fateNote='閉じ込めた'+c.name+'のそばで暮らすことを選んだ';
return{text:fill(ctx.pick(last?LV.crushZ.keepEnd:LV.crushZ.keepVisit),{v:a.name,z:c.name}),why:a.name+'は、閉じ込めた'+c.name+'のもとを離れない',mag:last?30:18};
}
});
EV.push({
id:'z_cr_feel',cat:'romance',scope:'pair',
when:function(ctx,a,b){var pf=ctx.pair(a,b);return Z.isCrush(ctx,a,b)&& !pf.zcr&& !pf.zconf&&(Z.day(ctx)>=2||a.stress>40)&&(!HK.Poly||HK.Poly.canTry(ctx,a,b));},
w:function(ctx,a,b){return 0.8+ctx.R(a,b).att/70+a.stress/120;},
run:function(ctx,a,b){
var pf=ctx.pair(a,b),rng=ctx.rng,m={a:a.name,b:b.name};
var opts=[
['rush',0.3+a.tr.honesty*0.5+a.tr.impulse*0.3+a.stress/200],
['press',a.tr.aggr*0.45+a.tr.impulse*0.35+a.tr.fc*0.15-a.tr.np*0.2-a.tr.ac*0.25+(a.goal.id==='chaos'?0.3:0)],
['grave',a.tr.ac*0.45+a.tr.np*0.3+a.tr.caution*0.2-a.tr.honesty*0.2+(ctx.present().some(function(o){return o!==a&&o!==b&&Z.isLover(ctx,b,o);})?0.5:0)]
];
if(HK.Pos&&HK.Pos.hardTop(b,a))opts=opts.filter(function(o){return o[0]!=='press';});
var k=HK.weighted(rng,opts,function(o){return Math.pow(Math.max(0.03,o[1]),2);})[0];
pf.zcr=k;
var rb=ctx.R(b,a),loveOK=HK.canLove(b,a);
if(Z.isPining(ctx,a,b)){
if(k==='rush'||k==='press'){
pf.zconf=true;pf.couple=true;
ctx.mod2(a,b,{att:12,aff:12,trust:8},{att:12,aff:12,trust:8});
if(k==='rush')return{text:fill(ctx.pick(LV.rushM),m)+fill(ctx.pick(LV.rushMYes),m),why:a.name+'は、終わりかけた街で告白を急いだ（本音の出やすさ・衝動性・焦り '+Math.round(a.stress)+'）／両片想いだった。'+b.name+'も、ずっと同じ気持ちだった',mag:34};
pf.night=true;
var txm=fill(ctx.pick(LV.pressM),m)+fill(ctx.pick(LV.pressMYes),m);
if(Z.loveLv(ctx)==='high'&&LV.pressHigh)txm+=LV.pressHigh(ctx,a,b);
return{cat:'romance',sex:true,text:txm,why:a.name+'は、どうせ終わる世界ならと踏み込んだ（攻撃性・衝動性）／両片想いだった。'+b.name+'は拒まなかった',mag:34};
}
[[a,b],[b,a]].forEach(function(p){
var x=p[0],y=p[1];
x.focus=y;x.z.vow=y.i;
if(x.goal.id!=='chaos'&&x.goal.id!=='family')x.goal=Z.scen.goals.filter(function(g){return g.id==='protect';})[0]||x.goal;
});
ctx.mod2(a,b,{aff:8},{aff:8});
return{text:fill(ctx.pick(LV.graveM),m),why:a.name+'も'+b.name+'も、相手への想いを墓まで持っていくと決めた（両片想い。どちらも、相手は自分を何とも思っていないと思い込んでいる）。目標「大切な人を守る」',mag:28};
}
if(k==='rush'){
pf.zconf=true;
var yes=loveOK&&rb.att>26&&rb.aff>15;
if(yes){pf.couple=true;ctx.mod2(a,b,{att:10,aff:12,trust:8},{att:14,aff:12,trust:8});}
else ctx.mod2(a,b,{att: -3},{aff:4});
return{text:fill(ctx.pick(LV.rush),m)+fill(ctx.pick(yes?LV.rushYes:LV.rushNo),m),why:a.name+'は、終わりかけた街で告白を急いだ（本音の出やすさ・衝動性・焦り '+Math.round(a.stress)+'）'+(yes?'／'+b.name+'も惹かれていた':''),mag:32};
}
if(k==='press'){
var ok=loveOK&&rb.att>34&&b.tr.fc+b.tr.impulse>0.7;
if(ok){pf.night=true;ctx.mod2(a,b,{att:10,aff:4},{att:10,aff:2,ten:4});}
else ctx.mod2(a,b,{ten:6},{ten:18,trust: -18,aff: -10});
var tx=fill(ctx.pick(LV.press),m)+fill(ctx.pick(ok?LV.pressYes:LV.pressNo),m);
if(ok&&Z.loveLv(ctx)==='high'&&LV.pressHigh)tx+=LV.pressHigh(ctx,a,b);
return{cat:ok?'romance':'conflict',sex:ok,text:tx,why:a.name+'は、どうせ終わる世界ならと関係を迫った（攻撃性・衝動性）'+(ok?'':'／'+b.name+'は拒んだ'),mag:32};
}
a.focus=b;a.z.vow=b.i;
if(a.goal.id!=='chaos'&&a.goal.id!=='family')a.goal=Z.scen.goals.filter(function(g){return g.id==='protect';})[0]||a.goal;
ctx.mod(a,b,{aff:8});
return{text:fill(ctx.pick(LV.grave),m),why:a.name+'は、'+b.name+'への想いを墓まで持っていくと決めた（AC・NP）。目標「大切な人を守る」',mag:26};
}
});
EV.push({
id:'z_cr_guard',cat:'help',scope:'pair',
when:function(ctx,a,b){return a.z.vow===b.i&&(ctx.pair(a,b).zgd||0)<3&& !(ctx.pair(a,b).couple&&HK.Ties&&HK.Ties.from(ctx,a,b,'crush')&&HK.Ties.from(ctx,b,a,'crush'));},
w:function(){return 2.2;},
run:function(ctx,a,b){
var pf=ctx.pair(a,b);pf.zgd=(pf.zgd||0)+1;
if(a.z.food>0&&b.z.food<=1){a.z.food--;b.z.food++;}
b.stress=Math.max(0,b.stress-6);
ctx.mod2(a,b,{aff:3},{trust:6,aff:4});
var pin=Z.isPining(ctx,a,b);
return{text:fill(ctx.pick(pin?LV.guardM:LV.guard),{a:a.name,b:b.name}),why:a.name+'は想いを隠したまま、'+b.name+'を守り続けている'+(pin?'（両片想い。'+b.name+'も同じことをしている）':''),mag:18};
}
});
})();
});
;
/* ==== js/zombie-together.js ==== */
HK.Load.def(145,'js/zombie-together.js',function(){
(function(){
'use strict';
var HK=window.HK,Z=HK.ZB;
if(!Z|| !Z.scen|| !Z.turn)return;
var EV=Z.scen.events;
function L(s){return s.split('|');}
function fill(t,m){return t.replace(/\{(\w+)\}/g,function(x,k){return m[k]!=null?m[k]:x;});}
function lover(ctx,a,b){return Z.isLover?Z.isLover(ctx,a,b):false;}
function zpOf(ctx,i){return ctx.zb.zpc.filter(function(z){return z.i===i;})[0];}
Z.zpOf=zpOf;
var T=Z.TOGETHER={
rise:L('{v}の悲鳴が途切れた。しばらくして、{v}はゆっくりと起き上がった。濁った目で{z}を見つめ、それから、{z}の隣に並んだ。|{z}に組み伏せられた{v}は、もう抵抗しなかった。数分後、二つの影が、同じ足取りで通りへ出ていった。|{v}は{z}の腕の中で動かなくなった。やがて{v}の指がぴくりと動き、{z}の服の裾を掴んだ。生きていたころと、同じ仕草だった。'),
riseLove:L('{v}は最後まで{z}を抱きしめていた。咬まれても、離さなかった。やがて{v}の呼吸が止まり――そして、{v}は{z}と同じ目をして顔を上げた。二人は、手を繋いだまま歩き出した。|「やっと、同じになれたね｜やっと、同じになれた｜やっと、同じになれましたね」――{v}の最後の言葉は、それだった。起き上がった{v}は、{z}の肩に頭を預けるようにして、並んでさまよい始めた。|{v}は{z}に咬まれながら、笑っていた。日が沈むころ、二人のゾンビが、寄り添うように瓦礫の街を歩いていた。'),
seePair:L('{v}は通りの向こうに、{z}と{p}を見つけた。二人は、肩が触れ合うほど近くを、同じ方向へ歩いていた。|{v}は窓の外を、{z}と{p}が並んで通り過ぎるのを見た。{p}の手は、{z}の袖を掴んだままだった。|{v}は、{z}と{p}が寄り添うように立ち尽くしているのを見た。生きていたころより、ずっと穏やかな顔に見えた。'),
scratch:L('――そのとき{v}は、袖口に小さな血の染みができていることに、まだ気づいていなかった。|――逃げ込んだ先で、{v}は手の甲の擦り傷を舐めた。ただの擦り傷だと思った。|――{v}は息を整えながら、首筋のひりつきを汗のせいだと思った。'),
bitHide:L('――逃げ切った。だが、{v}の腕には、くっきりと歯形が残っていた。{v}は袖を下ろして、何も言わなかった。|――扉を閉めたあと、{v}は自分のふくらはぎを見下ろした。破れたズボンの下に、赤黒い咬み跡があった。'),
plan:L('{a}は{b}に咬み跡を見せた。{b}は長いあいだ黙っていた。「……まだ、時間はあるんだよね｜……まだ、時間はあるんだな｜……まだ、時間はあるんですよね」「たぶん、数日｜＝｜たぶん、数日です」「じゃあ、その数日を全部ちょうだい。最後の日に、一緒に行こう｜では、その数日を全部くれ。最後の日に、一緒に行こう｜では、その数日を全部ください。最後の日に、一緒に行きましょう」|{a}と{b}は、地図の上で一つの場所を指さした。昔、二人で行こうと話していた海の見える丘だった。「そこで、終わろう｜＝｜そこで、終わりにしましょう」|{b}は{a}の咬み跡に、そっと口づけた。「一人では行かせない。発症する前の晩に、二人で｜＝｜一人では行かせません。発症する前の晩に、二人で」――{a}は泣きながら頷いた。'),
days:L('{a}と{b}は、残された時間を数えるのをやめた。崩れたカフェで、二人は賞味期限切れのクッキーを分け合い、何年も先の話をした。|{a}の熱は少しずつ上がっていた。{b}は一晩中、{a}の額を冷やし続けた。「あと少しだけ、このままで｜＝｜あと少しだけ、このままでいさせてください」|{a}と{b}は、空っぽの映画館の座席に並んで座った。スクリーンには何も映らなかったが、二人は最後まで席を立たなかった。|{b}は{a}の好きだった曲を、何度も口ずさんだ。{a}はそのたびに、少しだけ音程の外れたハーモニーを重ねた。'),
goBoth:L('約束の夜、{a}と{b}は丘の上に立った。指を絡めたまま、二人は同時に目を閉じた。――翌朝、そこには寄り添うように眠る二人だけが残っていた。|{a}と{b}は、最後の薬を半分ずつ分け合った。「おやすみ｜＝｜おやすみなさい」「おやすみ｜＝｜おやすみなさい」――それが、二人の最後の会話だった。|{b}は{a}を抱きしめたまま、屋上の縁から一歩、踏み出した。{a}は最後に、{b}の名前を呼んだ。'),
goStop:L('その瞬間、{a}は{b}の手を振りほどいた。「やっぱり、だめだ。あなたは生きて｜やっぱり、だめだ。あなたは生きろ｜やっぱり、だめです。あなたは生きてください」――{a}は{b}を突き飛ばし、ひとりで闇の中へ消えた。|{a}は{b}の手から薬を奪い取った。「あなたの分まで、私が持っていく｜＝｜あなたの分まで、私が持っていきます」――{b}が止める間もなく、{a}は一人で全部を飲み込んだ。|最後の瞬間、{a}は笑って言った。「ごめん、嘘ついた。一緒には行かない｜すまない、嘘をついた。一緒には行かない｜ごめんなさい、嘘をつきました。一緒には行きません」――{a}はひとりで、扉の向こうへ歩いていった。'),
goFail:L('約束の夜、{b}はどうしても、最後の一歩を踏み出せなかった。{a}の熱い手を握ったまま、{b}は泣き崩れた。――その夜明け、{a}の呼吸が止まった。|{b}は武器を握ったまま、震えて動けなかった。「ごめん……ごめん、できない……｜すまない……すまない、できない……｜ごめんなさい……ごめんなさい、できません……」――{a}は{b}の頬を撫でて、「いいよ｜いいんだ｜いいんです」と言った。それが、{a}としての最後の言葉だった。'),
goRise:L('約束の夜、二人が手を取り合った瞬間、{a}の目から光が消えた。発症が、ほんの少しだけ早かった。――{a}の歯が、{b}の首筋に沈んだ。{b}は抵抗しなかった。「……いいよ。これで、一緒だ｜……いい。これで、一緒だ｜……いいんです。これで、一緒です」|{a}は最後の口づけの途中で、{b}の唇を咬み破った。{b}は痛みに顔をしかめて、それから、泣きながら笑った。'),
dayLabel:{shinjuPlan:'恋人と最後の日々を過ごし、心中する'}
};
Z.riseTogether=function(ctx,zp,v,opt){
opt=opt||{};
var c=ctx.chars[zp.i],love=lover(ctx,v,c),m={v:v.name,z:c.name};
v.z.bitten=v.z.bitten||{at:ctx.stepIndex,by:c.i};
v.z.hiding=false;
if(!opt.silent)ctx.act2({actors:[c,v],cat:'death',text:(opt.pre||'')+fill(ctx.pick(love?T.riseLove:T.rise),m),why:opt.why||('ゾンビになった'+c.name+'に襲われた'+v.name+'は、その場でゾンビになった'+(love?'（恋人どうし）':'')),mag:55});
var n0=ctx.zb.zpc.length;
Z.turn(ctx,v,true);
var nz=ctx.zb.zpc[n0];
if(nz){
nz.with=c.i;nz.type='wild';nz.target=null;nz.area=zp.area;
zp.with=v.i;if(zp.type==='bond'&&zp.target===v.i)zp.type='wild';
v.fateNote=ctx.label+'、'+Z.an(ctx,zp.area)+'で'+c.name+'に襲われてゾンビになった。'+c.name+'と並んでさまよっている';
c.fateNote=(c.fateNote||'').replace(/。[^。]*を探してさまよっている$/,'')+'。'+v.name+'と並んでさまよっている';
}
};
Z.riseChance=function(ctx,zp,v){
var c=ctx.chars[zp.i];
return(lover(ctx,v,c)?0.6:ctx.R(v,c).aff>45?0.4:0.25);
};
Z.pairMove=function(ctx,zp){
if(zp.with==null)return false;
var pz=zpOf(ctx,zp.with);
if(!pz||pz.down){zp.with=null;return false;}
if(zp.at>pz.at||(zp.at===pz.at&&zp.i>pz.i)){zp.area=pz.area;return true;}
return false;
};
Z.pairSee=function(ctx,v,c,zp){
if(!zp||zp.with==null)return null;
var p=ctx.chars[zp.with],pz=zpOf(ctx,zp.with);
if(!p|| !pz||pz.down||pz.area!==zp.area)return null;
return fill(ctx.pick(T.seePair),{v:v.name,z:c.name,p:p.name});
};
Z.fleeInfect=function(ctx,zp,v,hes){
var rng=ctx.rng,r=rng(),m={v:v.name};
if(v.z.bitten)return'';
var p=0.18+(hes?0.1:0)-(v.weapon?v.weapon.pow*0.01:0);
if(r<p*0.55){Z.infect(ctx,v,zp.i,false);return fill(ctx.pick(T.scratch),m);}
if(r<p){Z.infect(ctx,v,zp.i,true);v.z.hiding=v.tr.honesty<0.55;return fill(ctx.pick(T.bitHide),m);}
return'';
};
var biteOpts0=Z.biteOpts,biteRun0=Z.biteRun;
if(Z.BITE_LABEL)Z.BITE_LABEL.shinjuPlan=T.dayLabel.shinjuPlan;
Z.biteOpts=function(ctx,c,opts,mates,close,lv){
if(biteOpts0)biteOpts0(ctx,c,opts,mates,close,lv);
if(lv&&lv.alive&&c.z.turnAt-ctx.stepIndex>=4){
opts.push(['shinjuPlan',0.3+lv.tr.ac*0.3+lv.tr.jealous*0.2+ctx.R(lv,c).aff/220+c.tr.np*0.15]);
}
};
Z.biteRun=function(ctx,c,pick,why,mates,close,lv){
if(pick==='shinjuPlan'&&lv&&lv.alive){
var pf=ctx.pair(c,lv);
pf.sjPlan={by:c.i,with:lv.i,at:Math.max(ctx.stepIndex+2,c.z.turnAt-1),days:0};
c.z.sj=pf.sjPlan;lv.z.sj=pf.sjPlan;
ctx.mod2(c,lv,{aff:10,att:8},{aff:10,att:8});
ctx.act2({actors:[c,lv],cat:'romance',text:fill(ctx.pick(T.plan),{a:c.name,b:lv.name}),why:why+'／発症まで、まだ '+(c.z.turnAt-ctx.stepIndex)+' 区切りある',mag:40});
return true;
}
return biteRun0?biteRun0(ctx,c,pick,why,mates,close,lv):false;
};
EV.push({
id:'z_sj_days',cat:'romance',scope:'pair',pri:true,
when:function(ctx,a,b){var p=a.z.sj;return p&&p===b.z.sj&&p.by===a.i&&p.days<2&&ctx.stepIndex<p.at;},
w:function(){return 4;},
run:function(ctx,a,b){
var p=a.z.sj;p.days++;
ctx.mod2(a,b,{aff:5,att:5},{aff:5,att:5});
return{text:fill(ctx.pick(T.days),{a:a.name,b:b.name}),why:'心中を約束した二人の、残された時間（約束の日まで '+(p.at-ctx.stepIndex)+' 区切り）',mag:26};
}
});
Z.shinjuCheck=function(ctx,c){
var p=c.z.sj;
if(!p||p.done||p.by!==c.i||ctx.stepIndex<p.at)return false;
var b=ctx.chars[p.with];
p.done=true;
if(!b|| !b.alive||b.out||b.z.area!==c.z.area)return false;
var rng=ctx.rng,m={a:c.name,b:b.name};
var opts=[
['both',0.5+b.tr.ac*0.3+b.tr.jealous*0.2+ctx.R(b,c).aff/250],
['stop',c.tr.np*0.45+c.tr.cp*0.25+(b.goal.id==='escape'?0.15:0)],
['fail',b.tr.caution*0.35+b.tr.np*0.15+(1-b.tr.impulse)*0.15],
['rise',0.18+(c.z.turnAt-ctx.stepIndex<=1?0.25:0)]
];
var k=HK.weighted(rng,opts,function(o){return Math.pow(Math.max(0.03,o[1]),2);})[0];
var why='約束の日。'+c.name+'と'+b.name+'の心中の結末';
if(k==='both'){
ctx.pair(c,b).shinju=true;
ctx.act2({actors:[c,b],cat:'romance',text:fill(ctx.pick(T.goBoth),m),why:why+'（'+b.name+'の想い：AC・執着・好意）',mag:58});
ctx.kill(c,null,'発症する前に、恋人の'+b.name+'と心中した');
ctx.kill(b,null,'咬まれた恋人の'+c.name+'と、約束どおり心中した');
return true;
}
if(k==='stop'){
ctx.act2({actors:[c,b],cat:'romance',text:fill(ctx.pick(T.goStop),m),why:why+'――'+c.name+'は最後に、'+b.name+'を生かすことを選んだ（NP・CP）',mag:52});
ctx.stress(b,40);b.flags.grief=c.i;
ctx.kill(c,null,'恋人の'+b.name+'を残して、ひとりで終わらせた');
return true;
}
if(k==='fail'){
ctx.act2({actors:[c,b],cat:'romance',text:fill(ctx.pick(T.goFail),m),why:why+'――'+b.name+'は、最後の一歩を踏み出せなかった（慎重さ・NP）',mag:48});
ctx.stress(b,35);
c.z.turnAt=ctx.stepIndex;
return false;
}
ctx.act2({actors:[c,b],cat:'death',text:fill(ctx.pick(T.goRise),m)+'――夜が明けるころ、'+c.name+'と'+b.name+'は、手を繋いだまま街へ降りていった。',why:why+'――発症の方が、ほんの少し早かった。二人ともゾンビになった',mag:58});
var n0=ctx.zb.zpc.length;
Z.turn(ctx,c,true);
var zp=ctx.zb.zpc[n0];
if(zp&&b.alive&& !b.out){zp.target=null;zp.type='wild';Z.riseTogether(ctx,zp,b,{silent:true});}
return true;
};
})();
});
;
/* ==== js/zombie-solo.js ==== */
HK.Load.def(146,'js/zombie-solo.js',function(){
(function(){
'use strict';
var HK=window.HK,Z=HK.ZB;
if(!Z|| !Z.scen)return;
function L(s){return s.split('|');}
var BY={
proud:L('{a}は割れたショーウィンドウに映る自分を見て、乱れた髪を手櫛で整えた。こんな連中に、みっともない姿は見せない。|{a}は{w}の汚れを拭いながら、「次はもっと上手くやるよ｜次はもっと上手くやる｜次はもっと上手くやります」と誰にともなく言った。|{a}は膝の震えに気づいて、一度強く叩いた。震えは止まった。止まったことにした。|{a}は地図に赤ペンで線を引いた。「逃げるんじゃないよ。こっちから出ていくんだ｜逃げるんじゃない。こっちから出ていくんだ｜逃げるんじゃありません。こっちから出ていくんです」|{a}は呻き声のする方へ、わざと一歩踏み出してから引き返した。怖くないと証明したかった。誰に、とは考えなかった。|{a}は配給の列に並ぶ夢を見て、腹を立てながら目を覚ました。|{a}は割れた鏡の前で、余裕のある顔を作る練習をした。その顔を、忘れたくなかった。|{a}は自販機を蹴り倒して、出てきた缶コーヒーを一本だけ拾った。残りは、後から来る誰かのために置いていった。|「＠＠助けてください」と書かれた段ボールを見て、{a}は鼻で笑った。それから、その段ボールの下に水を一本置いた。|{a}は誰もいない{area}で、ひとりごとのように文句を並べた。声に出しているあいだは、怖さを忘れられた。|{a}はゾンビの群れを上から見下ろして、「数が多いだけの雑魚だよ｜数が多いだけの雑魚だ｜数が多いだけの雑魚です」と吐き捨てた。手すりを握る指が白かった。|{a}は靴紐を固く結び直した。走るためじゃない。踏みとどまるためだ、と自分に言った。|{a}は誰かが残したメモ「＠＠もう無理」を見つけ、裏に「＠＠無理じゃない」と書き足した。|{a}は眠れなかった。目を閉じると、昨日逃げた背中ばかりが浮かんだ。逃げたのは自分じゃない、と三回言った。|{a}は棚から高い酒を一本取った。「どうせ誰も払わないし｜どうせ誰も払わない｜どうせ誰も払いませんし」――一口だけ飲んで、蓋を閉めた。|{a}は{w}を振る素振りを百回やった。九十回目あたりで、腕より先に心が折れそうになった。|{a}は「生き延びたら、この街のお偉いさんに文句を言ってやる｜＝｜生き延びたら、この街のお偉いさんに文句を言ってやります」と決めた。目標は、くだらないほどいい。|{a}は弱音を吐きかけて、唇を噛んだ。血の味がした。それでよかった。|{a}は空き家の表札を見て、勝手に「邪魔するよ｜邪魔するぞ｜お邪魔します」と言った。返事がないのが、妙に癪だった。|{a}は傷だらけの手を眺めた。「勲章だよ｜勲章だ｜勲章です」と言ってみたが、誰も聞いていなかった。|{a}は小さな焚き火の前で、明日の段取りを三通り考えた。どれも、自分が先頭に立つ案だった。|{a}は夜中に物音で跳ね起き、それが自分の腹の音だと気づいて、誰にも見られていないことに安堵した。|{a}は壁に「＠＠ここは私の縄張りだ」と書きかけて、子どもっぽいと思ってやめた。|{a}は救助のヘリが来ても、自分は最後に乗ってやると思った。先に乗るのは、負けた気がする。|{a}は鏡の中の自分に「しっかりして｜しっかりしろ｜しっかりしてください」と言った。鏡の中の自分も、同じ顔で同じことを言っていた。|{a}は落ちていた新聞の見出し「＠＠政府、事態を把握」を、黙って丸めて捨てた。|{a}はラジオのチャンネルを一周させて、何も入らないと分かると、電池を抜いてポケットにしまった。|{a}はすり減った靴底を見て、舌打ちした。「靴屋も、この街にはもう無いか｜＝｜靴屋も、この街にはもう無いですね」|{a}は手首の脈を数えた。速い。それを恐怖と呼ぶのは、まだ早い。|{a}は階段に座り込み、五分だけ休むと決めた。きっかり五分で立ち上がった。'),
stern:L('{a}は残りの水と食料を数え、手帳に一日あたりの配分を書いた。計算は三回やり直しても同じだった。|{a}は{w}の手入れをした。刃こぼれを確かめ、布で拭き、元の位置に戻す。手順を守っているあいだは、心が静かだった。|{a}は時計を見て、決めた時刻ちょうどに見張りの位置を変えた。誰も見ていなくても、規律は規律だ。|{a}は{area}の見取り図を描いた。出口、死角、逃げ道。線は定規で引いたようにまっすぐだった。|{a}は泣きそうになった自分を叱った。「泣くのは、全部終わってからだよ｜泣くのは、全部終わってからだ｜泣くのは、全部終わってからです」|{a}は眠る前に、明日やることを五つ書いた。五つ目は「＠＠生きている」だった。|{a}は壁の伝言板に、見つけた安全な道を丁寧な字で書き残した。|{a}は床に散らばったガラスを、音を立てないよう一枚ずつ拾い集めた。|{a}は家族に宛てた手紙を書きかけて、日付の欄で手が止まった。今日が何日か、自信がなかった。|{a}は腕立て伏せを二十回やった。体が動くことを、毎朝確かめることにしていた。|{a}は冷蔵庫の中身を消費期限の順に並べ直した。電気はもう来ていなかった。|{a}は、ゾンビの動きを手帳に記録した。「＠＠音に反応。夜は活発。階段は苦手」――観察は、恐怖を少しだけ薄めた。|{a}は誰もいない部屋で、背筋を伸ばして食事をとった。乾パン二枚でも、食事は食事だ。|{a}は「＠＠規則を破った者から死ぬ」と、自分で作った規則を読み返した。規則は三つしかなかった。|{a}は靴を脱がずに眠った。いつでも走れるように。|{a}は救急箱の中身を確認し、足りないものを書き出した。包帯、消毒液、それから――希望、と書きかけて消した。|{a}はラジオの周波数を一つずつ確かめた。雑音の中に人の声を探すのは、根気の仕事だった。|{a}は時間を決めて仮眠をとった。目覚ましがなくても、決めた時間に目が覚めた。|{a}は割れた窓に段ボールを貼り、隙間をテープで三重に塞いだ。|{a}は、昨日の自分の判断を一つずつ点検した。間違いは二つ。どちらも、もう取り返しがつかなかった。|{a}は倒れていた誰かに手を合わせ、名前の分かるものを探した。見つかった社員証を、ポケットにしまった。|{a}は心の中で点呼をとった。返事をする顔の数が、日に日に減っていた。|{a}は「慌てない、走らない、叫ばない」と三回唱えてから、扉を開けた。|{a}は汚れた服を、残り少ない水で丁寧に洗った。身なりを崩したら、心も崩れる気がした。|{a}は非常階段の段数を数えて、暗闇でも降りられるように頭に叩き込んだ。|{a}は拾った地図の誤りを、赤で訂正した。この地図を、次に誰かが使うかもしれない。|{a}は感情を書かない日記をつけていた。今日の欄には「＠＠異常なし」と書いた。異常しかなかった。|{a}は靴紐の結び目を確かめ、二重にした。小さなほころびが命取りになる。|{a}は{w}を抱いたまま、壁際に座って夜明けを待った。目は閉じなかった。|{a}は、生き延びた日数を壁に刻んだ。線は一本ずつ、同じ長さだった。'),
tsun:L('{a}は誰もいないのを確かめてから、小さく「怖い｜＝｜怖いです」と言った。言ってから、誰かに聞かれていないか三回確かめた。|{a}は落ちていたぬいぐるみを拾い、「別に、可哀想だからじゃない｜＝｜別に、可哀想だからじゃありません」と言いながらリュックに入れた。|{a}は「平気だし｜平気だ｜平気ですし」と呟いた。誰に向けて言ったのか、自分でも分からなかった。|{a}は野良猫に缶詰を半分分けた。「余っただけ。勘違いしないで｜余っただけだ。勘違いするな｜余っただけです。勘違いしないでください」――猫は何も勘違いしていなかった。|{a}は昨日言いすぎたことを思い出して、枕代わりのリュックに顔を埋めた。|{a}はひとりで{w}を振り回してみて、思ったより重くて、誰も見ていなくてよかったと思った。|{a}は暗闇で物音がするたびに「出てきてよ｜出てこい｜出てきなさい」と小声で凄んだ。出てこられたら困るくせに。|{a}は、誰かが残した「＠＠生きてる人いますか」という落書きの下に、「＠＠いるけど、何か」と書き足した。|{a}は空を見上げて「助けに来るなら早く来てよね｜助けに来るなら早く来い｜助けに来るなら早く来てください」と文句を言った。ヘリの音は、しなかった。|{a}は窓ガラスに映った自分の泣き顔を見て、「これは汗｜これは汗だ｜これは汗です」と言った。|{a}は誰かの分まで取っておいた飴を、ポケットの中で握りしめた。渡す口実を、まだ考えていた。|{a}は「もう誰にも頼らない｜＝｜もう誰にも頼りません」と決めた。決めた五分後、誰かの名前を呼びそうになった。|{a}は髪をまとめ直した。こんな世界でも、だらしない格好は嫌だった。誰に見せるわけでもないのに。|{a}は缶詰の開け方が分からず、十分格闘したあげく、八つ当たり気味に{w}でこじ開けた。|{a}は寝言で誰かの名前を呼んだ。起きてから、誰にも聞かれていなかったことに心底ほっとした。|{a}は「こんなの映画で見たことあるし、全然平気｜こんなもの、映画で見たことがある。全然平気だ｜こんなの映画で見たことありますし、全然平気です」と言った。映画では、そう言った人から死んでいた。|{a}は道端に咲いていた花を一輪摘んで、すぐに捨てて、少し歩いてから戻って拾った。|{a}は手の震えを止めようとして、腕を組んだ。偉そうなポーズになった。|{a}は「心配なんかしてない｜心配などしていない｜心配なんかしていません」と言いながら、さっき来た方角を何度も振り返った。|{a}はひとりで食べる乾パンに「まずい｜＝｜まずいです」と文句を言い、全部食べた。|{a}は誰も見ていない屋上で、思い切り叫びたくなった。叫ばなかった。代わりに小さく地団駄を踏んだ。|{a}は廃墟の本屋で少女漫画を一冊見つけ、「暇つぶし｜暇つぶしだ｜暇つぶしです」と言って最後まで読んだ。最後のページで、少し泣いた。|{a}は「明日になったら、ちょっとくらい優しくしてあげてもいい｜明日になったら、少しくらい優しくしてやってもいい｜明日になったら、ちょっとくらい優しくしてあげてもいいです」と考えた。明日が来る保証は、どこにもなかった。|{a}は震える声を誤魔化すために、わざと大きな咳払いをした。響きすぎて、慌てて口を押さえた。|{a}は割れたスマホの画面を何度もつけた。来ないと分かっている通知を、待っていた。|{a}は膝を抱えて「寂しくない｜＝｜寂しくありません」と三回唱えた。四回目は、声にならなかった。|{a}は壁に書かれた「＠＠ありがとう」の落書きを見つけて、照れくさそうにそっぽを向いた。自分宛てでもないのに。|{a}は靴擦れに絆創膏を貼りながら、「痛くない｜＝｜痛くありません」と言い張った。言い張る相手は、誰もいなかった。|{a}は窓の外のゾンビに向かって「あなたたちのせいで台無し｜あなたたちのせいで台無しだ｜あなたたちのせいで台無しです」と毒づいた。ゾンビは、何も言い返さなかった。|{a}は眠る前に、明日会えたら謝ろうと決めた。そして、どう謝らずに済ませるかを考え始めた。'),
gentle:L('{a}は残っていたティーバッグで、ぬるいお茶を淹れた。「……意外と、落ち着くなあ｜……意外と、落ち着くな｜……意外と、落ち着きますね」|{a}は鉢植えに、貴重な水をほんの少しだけあげた。枯らすのは、かわいそうだった。|{a}は通りすがりに、倒れた自転車をそっと起こしておいた。持ち主が戻ってくるかもしれない。|{a}は毛布にくるまって、子守唄を口ずさんだ。誰のためでもなく、自分のために。|{a}は窓辺の小鳥に、乾パンのかけらを分けた。小鳥は、怖がらずに食べてくれた。|{a}は「大丈夫、大丈夫」と自分の手をさすった。昔、誰かがそうしてくれたように。|{a}は散らかった部屋を、少しだけ片付けた。次に来た人が、ほっとできるように。|{a}は行き場をなくしたように歩くゾンビの背中を見送りながら、「あなたにも、帰る家があったんだよね｜あなたにも、帰る家があったんだな｜あなたにも、帰る家があったんですよね」と呟いた。|{a}は空き家の台所で、残っていた米を炊こうとして、ガスが止まっていることを思い出した。「困ったなあ｜困ったな｜困りましたね」|{a}は夕焼けがきれいなことに気づいて、少しだけ足を止めた。こんな日でも、空はきれいだった。|{a}は割れた写真立てを拾い、ガラスを外して、写真だけを棚に戻した。|{a}は誰かが書いた「＠＠助けて」の落書きの横に、「＠＠この先の道は安全です」と書き足した。|{a}は迷い犬の頭を撫でた。「一緒に行く？｜一緒に行くか？｜一緒に行きますか？」――犬は、しっぽを振った。|{a}は腕の擦り傷に、自分で絆創膏を貼った。「はい、よくがんばりました」|{a}は手帳に、今日うれしかったことを一つだけ書いた。「＠＠雨水が甘かった」|{a}はラジオから流れた古い歌に、ほんの少し体を揺らした。電池が切れるまで、聞いていた。|{a}は眠れない夜、羊を数えた。三百を超えたところで、羊の中にゾンビが混ざり始めたのでやめた。|{a}は割れたマグカップを見て、少し悲しくなった。誰かのお気に入りだったのかもしれない。|{a}はカーテンの隙間から朝日が差すのを見て、「おはよう」と小さく言った。|{a}は誰もいない公園のブランコを、そっと押した。きい、と懐かしい音がした。|{a}は持ってきた飴を、一つずつ大事に数えた。会えた人に、一つずつあげようと思っていた。|{a}は、ゾンビになってしまった人たちのために、心の中で手を合わせた。|{a}はほつれた袖を、拾った針と糸で繕った。針を持つ手は、思ったより落ち着いていた。|{a}は「なんとかなるよ｜なんとかなる｜なんとかなりますよ」と言ってみた。言ってみると、本当になんとかなりそうな気がした。|{a}は道端のお地蔵さまに、乾パンを一枚お供えした。|{a}は曇った窓ガラスに、指で笑顔を描いた。曇りが消えるまで、ずっと眺めていた。|{a}は眠る前に、今日すれ違った人たちの無事を祈った。名前も知らない人たちだった。|{a}はひとりでしりとりをした。「＠＠り」で始まる言葉が、なかなか出てこなかった。|{a}は、壊れたオルゴールのねじを巻いてみた。三音だけ、鳴った。|{a}は「明日は晴れるといいね｜明日は晴れるといいな｜明日は晴れるといいですね」と、誰もいない部屋に話しかけた。'),
devoted:L('{a}は「まだ頑張れる｜＝｜まだ頑張れます」と小さく言って、重いリュックを背負い直した。|{a}は誰かの役に立つものを探して、{area}の棚を端から確かめた。見つけた包帯を、宝物のようにしまった。|{a}は足の痛みを誰にも言わないと決めた。言えば、きっと心配をかける。|{a}は、はぐれた人のために、壁に矢印と名前を書き残した。「＠＠私はこっちへ行きました」|{a}は自分の分の食料を、半分だけ別の袋に分けた。誰かに会えたときのために。|{a}は泣きたくなって、代わりに笑ってみた。笑えたので、少しだけ安心した。|{a}は夜中に何度も目を覚まし、そのたびに物音の方を確かめた。誰かを守れるのは、起きている人だけだ。|{a}は手帳に「＠＠次に会ったら言うことリスト」を書いた。全部、「＠＠ありがとう」から始まっていた。|{a}は自分の靴に新聞紙を詰めて、少しでも長く歩けるように工夫した。|{a}は傷だらけの手に息を吹きかけた。「大丈夫。まだ、ちゃんと動く｜大丈夫だ。まだ、ちゃんと動く｜大丈夫です。まだ、ちゃんと動きます」|{a}は落ちていた子ども用の水筒を拾って、きれいに洗った。いつか誰かに渡すつもりだった。|{a}は「私がしっかりしなきゃ｜私がしっかりしなければ｜私がしっかりしなければいけません」と、何度目かの決意をした。|{a}は眠る前に、今日助けられなかった人の顔を一人ずつ思い出して、ごめんなさいと言った。|{a}は階段で息が上がるのを悟られないように、深呼吸でごまかす練習をした。|{a}は誰かが置いていった傘を、そのまま置いておいた。持ち主が取りに戻るかもしれないから。|{a}は家族の写真を胸ポケットに入れ直した。「待っててね｜待っていてくれ｜待っていてくださいね」|{a}は掃除用具入れに隠れながら、見つかったときの言い訳ではなく、逃げ方を考えた。|{a}は小さな声で、自分を励ます歌を作った。歌詞は「＠＠まだ平気」しかなかった。|{a}は拾ったペンライトを確かめ、ひとつしかないそれを、誰かのために取っておくことにした。|{a}はゾンビの呻き声に怯えながらも、扉の前を離れなかった。ここが破られたら、奥まで届いてしまう。|{a}は眠気に負けそうになるたびに、手の甲をつねった。痕が、いくつも並んだ。|{a}は今日歩いた道を地図に書き込んだ。誰かが、この道で助かるかもしれない。|{a}は「迷惑をかけない｜＝｜迷惑をかけません」と心の中で繰り返した。それが、ここで生きる理由のひとつだった。|{a}は窓の外の星を数えて、知っている人の数だけ「無事でいて｜無事でいてくれ｜無事でいてください」と願った。|{a}は、空になった水のボトルを捨てずに取っておいた。雨が降れば、また使える。|{a}は自分の擦り傷より先に、拾った救急箱の中身を整理した。|{a}は眠る前に、明日の自分に「えらかったね｜よくやった｜えらかったですね」と言ってあげた。|{a}は崩れた瓦礫を一つずつどけて、通れる隙間を作った。爪が割れても、手を止めなかった。|{a}はひとりでも、いただきますと言ってから乾パンを食べた。|{a}は誰かの忘れ物の手袋を拾い、自分ではめずにリュックにしまった。持ち主に返せる日が来ると、信じていた。'),
cool:L('{a}は残りの水、食料、日数を頭の中で並べた。計算の結果は、楽観できるものではなかった。|{a}はゾンビの群れの動きを三十分観察し、一定の周期で南へ流れることに気づいた。メモに書いた。|{a}は感情を後回しにした。処理するのは、安全が確保されてからでいい。|{a}は{w}の重心を確かめ、握る位置を指一本ぶんずらした。|{a}は{area}の出入り口を数え、最短の逃走経路を二つ決めた。三つ目は、使わずに済むことを願った。|{a}は窓ガラスに映る自分の顔が、思ったより疲れていることを確認した。事実として受け止めた。|{a}はラジオの断片的な放送から、救助の可能性を見積もった。数字は口に出さなかった。|{a}は倒れたゾンビを観察し、関節の固まり方を記録した。気分は悪かったが、情報は情報だ。|{a}は眠る場所を三回変えた。同じ場所に長くいるのは、不利だ。|{a}は泣き声のような音を聞いても動かなかった。罠の可能性がある。三分後、音は止んだ。|{a}は割れたスマホのメモ帳に、今日の判断を記録した。「＠＠正しかった：二。誤り：一。不明：多数」|{a}は空腹を「＠＠血糖値の低下」と言い換えた。言い換えても、腹は減った。|{a}は誰もいない部屋で、静かにチェスの駒を並べた。一人で指す対局は、いつも引き分けだった。|{a}は「パニックは最大の敵だよ｜パニックは最大の敵だ｜パニックは最大の敵です」と心の中で唱え、きっかり四秒かけて息を吐いた。|{a}は月の位置で、おおよその時刻を割り出した。時計の電池が切れても、困らない。|{a}は拾った鍵束の鍵を、近くの扉で一つずつ試した。七本目で開いた。中は空っぽだった。|{a}は家族の写真を一度だけ見て、すぐにしまった。今、必要な情報ではない。|{a}は物資の重さと移動の速さを比べ、リュックの中身を二割減らした。|{a}は、ゾンビの呻き声から数を推定しようとして、途中でやめた。知っても意味がない。|{a}は高い場所から街を見下ろし、煙の上がる位置を地図に書き込んだ。火は、北から広がっていた。|{a}は眠りにつく前に、起きたらまずすることを一つだけ決めた。「＠＠確認」|{a}は落ちていた新聞の日付と、自分の記憶の日付を照らし合わせた。一日、ずれていた。|{a}はひとりで食事をとりながら、噛む回数を数えた。少ない量で満腹感を得るための、合理的な工夫だ。|{a}は{w}の汚れを落としながら、ふと手が止まった。その汚れが誰のものだったか、考えないことにした。|{a}は、震える指先を見つめて「＠＠疲労」と判定した。恐怖、とは書かなかった。|{a}は暗闇の中で、目が慣れるまでの秒数を計った。四十二秒。覚えておく。|{a}は、この街の地図を頭の中で何度も描き直した。描くたびに、通れる道が減っていた。|{a}は廃墟の図書館で、応急処置の本を見つけて三十分で読み切った。|{a}は「＠＠最悪の想定」を三つ並べ、一つずつ対処法を考えた。四つ目は、考えなかった。|{a}は、誰もいない交差点で信号が律儀に色を変えるのを、しばらく眺めていた。'),
free:L('{a}は誰もいないショッピングモールで、ショッピングカートに乗って通路を滑った。「これ、一回やってみたかったんだよね｜これを、一度やってみたかった｜これ、一回やってみたかったんですよね」|{a}は高級ホテルのスイートの鍵を見つけて、ベッドの上で跳ねた。外では、相変わらず呻き声がしていた。|{a}はゾンビの歩き方を真似して、一人で笑った。笑っているうちに、少し泣けた。|{a}はブティックで一番派手な服を着て、鏡の前でポーズを決めた。「世界の終わりくらい、好きな服を着てもいいでしょ｜世界の終わりくらい、好きな服を着てもいいだろう｜世界の終わりくらい、好きな服を着てもいいでしょう」|{a}は屋上で寝転がって、雲の形に名前をつけた。三つ目は「＠＠でっかいゾンビ」だった。|{a}はゲームセンターの電気が生きているのを見つけて、クレーンゲームを一回だけやった。取れなかった。|{a}はスプレーで、壁に大きく「＠＠ゾンビ立入禁止」と書いた。効果は、なかった。|{a}はコンビニのアイスケースを開けて、溶けかけたアイスを片っ端から食べた。「もったいないじゃん｜もったいない｜もったいないですから」|{a}は道路のど真ん中に寝転んでみた。車が一台も来ないのが、少しだけ気持ちよかった。|{a}は廃墟のカラオケ店で、電源の入らないマイクを握って一曲歌った。拍手は、自分でした。|{a}は「＠＠明日死ぬかもしれないなら、今日やりたいことリスト」を作った。一番上は「＠＠昼寝」だった。|{a}は拾った自転車で、坂道を全力で下った。風が気持ちよかった。曲がり角に、ゾンビがいた。|{a}はペットショップの檻を全部開けて回った。「好きに生きなよ。私もそうする｜好きに生きろ。私もそうする｜好きに生きてください。私もそうします」|{a}は{w}にマジックで名前をつけた。「これからよろしくね、相棒｜これからよろしく頼む、相棒｜これからよろしくお願いしますね、相棒」|{a}は空き家のピアノで、知っている曲を一曲弾いた。ゾンビが集まってきたので、急いで逃げた。|{a}は「ゾンビってさ、ちょっとかわいくない？｜ゾンビというのは、少しかわいくないか？｜ゾンビって、ちょっとかわいくないですか？」と誰もいない空間に言った。誰も同意しなかった。|{a}はショーウィンドウのマネキンと記念写真を撮った。スマホの電池は、残り三パーセントだった。|{a}はスーパーで高い肉の缶詰を見つけて、「今日はパーティーだ｜＝｜今日はパーティーです」と宣言した。参加者は一人だった。|{a}は寝袋の中で、明日の予定を考えた。「生きる。あと、なんか楽しいこと｜生きる。あと、何か楽しいことをする｜生きます。あと、何か楽しいことをします」|{a}は、壊れた自販機を揺すってジュースを出す方法を編み出した。三回に一回、成功した。|{a}は誰もいない遊園地の観覧車を見上げて、「動いてたら乗ったのになあ｜動いていたら乗ったのにな｜動いていたら乗ったんですけどね」と言った。|{a}はゾンビの群れの頭上を、雨どいを伝って渡った。下を見なければ、平気だった。|{a}は退屈しのぎに、屋上から紙飛行機を飛ばした。一機だけ、ずいぶん遠くまで飛んだ。|{a}は鼻歌を歌いながら歩いていて、歌っている場合じゃないことを三回思い出した。|{a}は壊れたテレビの前で、一人ニュースキャスターごっこをした。「本日の天気は、晴れ時々ゾンビです」|{a}は空き缶を蹴りながら歩いた。音でゾンビが寄ってくるので、仕方なく拾ってリュックにしまった。|{a}は廃墟の本屋で旅行雑誌を見つけて、行きたい場所に印をつけた。「全部終わったら、行く｜＝｜全部終わったら、行きます」|{a}はお風呂に入りたすぎて、雨の中で頭を洗った。気持ちよかったが、寒かった。|{a}は道端のゾンビに「お疲れさまでーす」と手を振った。返事の代わりに、追いかけられた。|{a}は星がこんなに見えるのは街の明かりが消えたおかげだと気づいて、「悪いことばっかりじゃないね｜悪いことばかりではないな｜悪いことばかりじゃありませんね」と言った。'),
shy:L('{a}は物陰で膝を抱えて、自分の心臓の音がうるさすぎないか心配していた。|{a}は誰かの足音を聞いて隠れた。足音が通り過ぎてから、それが生きている人だったかもしれないと気づいた。|{a}はノートの隅に、今日の出来事を小さな字で書いた。誰かに読まれる心配は、もうなかった。|{a}は声を出す練習をした。「た、助けて｜た、助けてくれ｜た、助けてください」――小さすぎて、自分にしか聞こえなかった。|{a}は図書館の奥の書架の間に隠れて、本の匂いに少しだけ安心した。|{a}はひとりでいるのが楽だと思った。そう思った自分が、少しだけ寂しかった。|{a}は、話しかけられたときのための言葉を考えた。「あ、あの、生きてる｜あ、あの、生きている｜あ、あの、生きてます」|{a}はゾンビの前を通るとき、思わず「ご、ごめん｜す、すまない｜す、すみません」と小声で謝った。|{a}は毛布を頭からかぶって、外の音を聞かないようにした。それでも、聞こえた。|{a}は壁の落書き「＠＠みんなどこ？」を見て、自分も同じことを書きたくなった。ペンを持って、やめた。|{a}は暗闇の中で、自分の名前を小さく呼んでみた。ちゃんと自分がここにいることを、確かめたかった。|{a}はロッカーの中で、何時間もじっとしていた。狭い場所の方が、少しだけ怖くなかった。|{a}は拾ったイヤホンを片耳につけた。何も流れていないのに、外の音が少し遠くなった気がした。|{a}は、誰かに見られている気がして振り向いた。マネキンだった。ほっとして、少しだけ泣いた。|{a}は、自分が足手まといなんじゃないかと、ひとりで何度も考えた。|{a}は、トイレの個室に鍵をかけて、やっと深く息ができた。|{a}はスケッチブックに、窓から見える景色を描いた。ゾンビは、描かなかった。|{a}は誰かの書き置き「＠＠生きて」を見つけて、ぎゅっと握りしめた。知らない人の字なのに、温かかった。|{a}は猫を見つけたが、声をかけるのが恥ずかしくて、そっと缶詰だけ置いて離れた。|{a}はひとりきりの部屋で、小声でありがとうの練習をした。次に誰かに助けられたら、ちゃんと言えるように。|{a}は自分の息が白くなるのを見て、まだ生きていると思った。|{a}は、誰もいない教室で、自分の席に似た場所に座ってみた。少しだけ、落ち着いた。|{a}は物音を立てないように、靴を脱いで手に持って歩いた。|{a}は眠る前に、明日は誰かに話しかけてみようと決めた。毎晩、同じことを決めていた。|{a}は涙が出そうになって、袖で押さえた。泣き声で、ゾンビが来たら困る。|{a}は、自分の影がやけに大きく見えて、少しだけ驚いた。|{a}は、鏡に映る自分と目を合わせられなかった。|{a}は廃墟の本屋で、好きだった作家の新刊を見つけた。発売日は、あの日の翌日だった。|{a}は、ポケットの中のお守りを何度も握った。中身が何なのかは、知らなかった。|{a}は「ここにいても、いいのかな｜ここにいても、いいのだろうか｜ここにいても、いいんでしょうか」と呟いた。答える人は、いなかった。'),
polite:L('{a}は誰もいない店に入るとき、「お邪魔するね｜邪魔をする｜失礼いたします」と小さく頭を下げた。|{a}は持ち出した食料のメモを、レジに置いていった。「＠＠後日、必ずお支払いします」|{a}は避難所の名簿に、自分の名前を丁寧な字で書き込んだ。ほかに書き込む人は、もういなかった。|{a}はゾンビとすれ違うとき、思わず会釈をしてしまった。|{a}は乱れた服の襟を整え、深呼吸をした。「取り乱しちゃいけないね｜取り乱してはいけないな｜取り乱してはいけませんね」|{a}は空き家の仏壇に手を合わせ、「少しだけ、お邪魔するね｜少しだけ、邪魔をする｜少しだけ、お邪魔いたします」と言った。|{a}は崩れた本棚の本を、元の場所に戻した。誰も読まないと分かっていても。|{a}は拾ったハンカチに刺繍された名前を見て、「返せるといいんだけど｜返せるといいのだが｜お返しできるといいのですが」と呟いた。|{a}はひとりで食事をとる前に、きちんと手を合わせた。「いただきます」|{a}は手帳に、今日お世話になった人の名前を書いた。名前を知らない人は「＠＠白いシャツの方」と書いた。|{a}は壊れた扉に「＠＠立入禁止・危険です」と丁寧な字で貼り紙をした。|{a}は靴の泥を落としてから、空き家に上がった。|{a}は「ごめんね｜すまない｜申し訳ございません」と言いながら、{w}を振り下ろした。|{a}は眠る前に、明日の予定を声に出して確認した。「明朝、水の確保。昼、移動。……以上｜明朝、水の確保。昼、移動。……以上だ｜明朝、水の確保。昼、移動。……以上です」|{a}は散らかった{area}を、通れる程度に片付けた。次に来る方が、怪我をなさらないように。|{a}は壁の伝言板に「＠＠この先、安全です。どうぞお気をつけて」と書き残した。|{a}は拾った手紙を読まずに、宛先の家のポストに入れた。郵便は、もう来ないけれど。|{a}は窓の外の荒れた街を見て、「ずいぶん変わっちゃったね｜随分と変わってしまったな｜随分と変わってしまいましたね」と静かに言った。|{a}は乱れた髪を拾った櫛で整えた。身だしなみは、心を保つための礼儀だった。|{a}は泣きそうになると背筋を伸ばした。姿勢を正すと、不思議と涙は引っ込んだ。|{a}は道端のゾンビに「どうか、安らかに」と頭を下げてから、その横を通り過ぎた。|{a}は借りた毛布をきちんと畳んで元の場所に戻した。|{a}は「お疲れさま｜＝｜お疲れさまでした」と自分に言った。今日も一日、生き延びた。|{a}は使った分の水の量を手帳に記録した。誰に報告するわけでもないのに。|{a}は紅茶の缶を見つけて、「今日はちょっと贅沢しちゃおう｜今日は少し贅沢をしよう｜今日は少し贅沢をさせていただきます」と一杯だけ淹れた。|{a}は自分の言葉遣いが崩れかけているのに気づいて、口を押さえた。「……いけないね｜……いけないな｜……いけませんね」|{a}は誰もいない駅で、時刻表を見上げた。次の電車の時刻を確認する癖が、抜けなかった。|{a}は拾った傘を差して雨の中を歩いた。「借りるね｜借りるぞ｜お借りいたします」|{a}は空き家の冷蔵庫に貼られていた家族写真を、そっと元の位置に戻した。|{a}は眠る前に、今日見送った方々のために、静かに黙祷を捧げた。')
};
var BY_TONE={
aniki:L('{a}は皆の分の水を数え直し、自分の分を一番少なくした。「足りなきゃ、なんとかする」|{a}はひとりになると、大きく息を吐いた。頼られる顔をしていられるのは、誰かが見ているあいだだけだった。|{a}は{w}を担ぎ直して、「よし」と自分に気合を入れた。|{a}は物陰で震えている野良犬に、「お前もか。大丈夫だ、なんとかなる」と声をかけた。|{a}は弱音を吐きそうになって、頬を両手で叩いた。「しっかりしろ。お前が崩れたら、誰が支えるんだ」|{a}は空き家の台所で、ありあわせの材料から温かいものを作った。食べる相手がいないのが、少しだけ寂しかった。|{a}は壁に、はぐれた仲間への伝言を大きな字で書いた。「腹減ったら戻ってこい」|{a}は眠る前に、明日誰を先に歩かせて、誰を後ろに置くかを考えた。自分はいつも一番後ろだった。|{a}は{area}の見回りを、誰に頼まれたわけでもなく三周した。|{a}は拾った絆創膏の箱を、自分のためではなく誰かのためにリュックにしまった。|{a}は夜空を見上げて、「全員連れて帰る」と小さく言った。言葉にしておかないと、折れそうだった。|{a}は泣いている子どもの声が聞こえた気がして、反射的に走り出した。誰もいなかった。それでも、しばらくその場を探した。|{a}はひとりで缶詰を開けて、半分だけ食べた。残りは、誰かが来たときのために取っておいた。|{a}は自分の手の傷に気づいて、舌打ちした。「これくらい、どうってことない」|{a}は拾ったトランシーバーに向かって、「生きてる奴、返事しろ」と何度も呼びかけた。|{a}は崩れかけた階段に板を渡して、後から来る人が通れるようにした。|{a}は「怖くないのか」と自分に訊いて、「怖いに決まってるだろ」と自分で答えた。|{a}は誰かが残した「もう疲れた」という落書きの隣に、「よく頑張った」と書き足した。|{a}は靴紐を結び直しながら、昔誰かに言われた「お前がいると安心する」という言葉を思い出していた。|{a}はふと、自分は誰に頼ればいいんだろう、と思った。答えは出なかった。')
};
var TIME=[
L('{a}は朝の光で目を覚まし、まだ生きていることを確かめるように指を一本ずつ動かした。|{a}は朝露をハンカチに含ませて、乾いた唇を湿らせた。|{a}は朝もやの{area}を見渡した。昨日より、静かだった。|{a}は、鳥の声がしない朝にも、少しずつ慣れてきてしまった。|{a}は寝癖を手で押さえながら、今日の最初の一歩をどこに置くか考えた。|{a}は朝日に目を細めて、「今日も、か｜＝｜今日も、ですか」と呟いた。|{a}は空き家の窓を開けて、冷たい朝の空気を胸いっぱいに吸った。腐臭が混じっていた。|{a}は夜のあいだに増えた呻き声の数を、耳で数えた。|{a}は寝袋から出るのに、いつもより時間がかかった。体が、正直だった。|{a}は朝一番に、靴の中にゴキブリがいないか確かめた。いた。|{a}は、夢の中では誰も死んでいなかったことを、少しのあいだ噛みしめた。|{a}は朝焼けの空に向かって、小さく伸びをした。骨が鳴った。'),
L('{a}は昼の日差しの下、ゾンビの動きが鈍いうちに{area}を歩き回った。|{a}は日なたで靴下を乾かしながら、少しだけうとうとした。|{a}は昼の静けさが、夜よりも怖いと思った。何かが隠れていても、気づけない。|{a}は日陰を選んで歩いた。汗の匂いで寄ってこられたら困る。|{a}は昼下がりの{area}で、誰もいないベンチに腰を下ろした。蝉の声のような耳鳴りがした。|{a}は太陽の位置を確かめて、日没までの時間を逆算した。|{a}は昼の光の下で、改めて自分の手の汚れを見た。夜より、ずっと汚かった。|{a}は日差しで温まった缶詰を開けた。ぬるかった。|{a}は青空を見上げた。こんなに晴れているのに、どこからも助けは来ない。|{a}は昼のうちに、夜をどこで過ごすかを決めておいた。|{a}は割れたアスファルトの隙間から、草が伸びているのを見つけた。街は、もう人のものではなくなりかけていた。|{a}は日光で温まった壁に背中を預けて、少しだけ目を閉じた。'),
L('{a}は夕焼けの中、長く伸びた自分の影を見つめた。影は、少し震えていた。|{a}は日が沈む前に、眠る場所の扉を三回確かめた。|{a}は夕暮れの{area}で、遠くの家々の窓に灯りがひとつもないことを確かめた。|{a}は夕方の風が冷たくなるのを感じて、上着の前を合わせた。|{a}は西の空が赤く染まるのを見て、火事なのか夕焼けなのか、一瞬分からなかった。|{a}は暗くなる前に、残りの懐中電灯の電池を確かめた。|{a}は夕暮れの帰り道を思い出した。帰る場所があったころの道を。|{a}は日が沈んでいくのを、何もできずに見ていた。夜が来る。|{a}は薄暗くなった{area}で、物の影がゾンビに見えて、何度も足を止めた。|{a}は夕焼け空にカラスが一羽だけ飛んでいくのを見送った。|{a}は夕方のうちに水を汲んでおいた。夜に出歩くのは、自殺行為だ。|{a}は空の色が変わるのを見ながら、今日も生き延びたことを数に入れた。'),
L('{a}は真っ暗な{area}で、自分の呼吸の音だけを聞いていた。|{a}は夜の寒さに震えながら、毛布の中で膝を抱えた。|{a}は闇の向こうで何かが引きずられる音を聞いて、朝まで眠れなかった。|{a}は月明かりだけを頼りに、そっと水を飲んだ。|{a}は眠りかけては、遠くの悲鳴で目を覚ました。悲鳴は、だんだん遠くなっていった。|{a}は夜空を見上げて、星がこんなに多かったことを初めて知った。|{a}は夜のあいだ、ずっと扉に背中を押し当てていた。|{a}は寝息の代わりに、自分の心臓の音を数えて夜を越えた。|{a}は暗闇で手探りに乾パンを探し当て、音を立てないようにゆっくり噛んだ。|{a}は夜風が窓を鳴らすたびに、身を固くした。|{a}は懐中電灯をつけかけて、やめた。光は、目印になる。|{a}は夜明けまでの時間を、知っている歌を頭の中で順番に歌ってやり過ごした。')
];
function fill(t,m){return t.replace(/\{(\w+)\}/g,function(x,k){return m[k]!=null?m[k]:x;});}
Z.soloFlavor=function(ctx,a){
var per=HK.personaOf(a),tn=HK.toneOf?HK.toneOf(a):per,pool=BY_TONE[tn]&&ctx.rng()<0.6?BY_TONE[tn]:BY[per]||BY.gentle;
var t=ctx.rng()<0.3?ctx.pick(TIME[Z.part?Z.part(ctx):0]||TIME[0]):ctx.pick(pool);
var area=ctx.zb&&ctx.zb.A[a.z.area]?ctx.zb.A[a.z.area].name:'この場所';
return fill(t,{a:a.name,area:area,w:a.weapon?a.weapon.name:'鉄パイプ'});
};
Z.SOLO_BY=BY;Z.SOLO_TIME=TIME;
Z.HUNGER=L('{a}の手持ちの食料は、もう何もない。水だけで、また一日が終わった。|{a}は空腹で眠れず、ポケットの中の飴の包み紙を何度も確かめた。|{a}の視界が、空腹で白くかすんだ。|{a}は雨水を溜めたペットボトルを、少しずつ大事に飲んだ。|{a}は空っぽの缶詰の内側を、指でなぞった。何も残っていなかった。|{a}の腹が鳴った。静かな部屋に、その音がやけに響いた。|{a}は歯磨き粉を少しだけ舐めて、甘さで空腹をごまかした。|{a}は道端の草が食べられるかどうか、本気で考え始めていた。|{a}はベルトの穴を、また一つ詰めた。|{a}は食べ物の夢を見た。目が覚めると、口の中に何の味も残っていなかった。|{a}は立ち上がろうとして、めまいでしゃがみ込んだ。|{a}は空腹を紛らわすために、ひたすら水を飲んだ。胃が、ちゃぷんと鳴った。|{a}は、ゴミ箱の中にまだ食べられるものがないか、確かめずにはいられなかった。|{a}は指先が冷たくなっていくのを感じた。体が、燃やすものを探していた。|{a}は空のリュックを逆さに振った。乾パンのかけらが、ひとつだけ落ちてきた。|{a}は自分の手の甲が、いつの間にか骨ばっていることに気づいた。');
Z.BITTEN_ALONE=L('{a}は一人きりの部屋で、咬み跡を眺めて夜を待った。|{a}は誰もいない{area}で、思い出せる限りの人の顔を思い浮かべた。|{a}は咬み跡に包帯を巻き、きつく縛った。それで何かが変わるとは、思っていなかった。|{a}は、自分がゾンビになったときのために、扉の外に「危険」と書いた紙を貼った。|{a}はひとりで、残っていた一番いい缶詰を開けた。最後の晩餐にしては、ずいぶん質素だった。|{a}は、咬み跡が少しずつ黒く広がっていくのを、他人事のように眺めていた。|{a}は、まだ自分の言葉が話せるうちに、録音アプリに声を残した。|{a}は{area}の窓から、ゆっくり沈む夕日を見ていた。見られるのは、たぶんこれが最後だった。');
Z.FESTER=L('{a}の傷口が赤く腫れ、熱を持ち始めた。咬まれたわけじゃない。ただの化膿だ――それでも、ここでは命取りになる。|{a}は傷口の膿を拭いながら、抗生物質という言葉を何度も思い浮かべた。|{a}は傷口を水で洗った。最後のきれいな水だった。|{a}は熱っぽい額を、冷たい壁に押し当てた。|{a}は包帯を替えようとして、替えの包帯がもうないことに気づいた。|{a}の傷口から、嫌な匂いがし始めた。|{a}は熱で揺れる視界の中、傷口を見ないようにして包帯を巻き直した。');
Z.LOOT_NONE=L('{a}は{area}を探し回ったが、食べられるものは何も残っていなかった。|{a}は物音を立てすぎた。棚を漁る手を止めて、息を殺した。|{a}は{area}の棚を端から開けたが、どこもすでに誰かに漁られたあとだった。|{a}が見つけたのは、賞味期限の切れた調味料だけだった。|{a}は{area}の冷蔵庫を開けて、すぐに閉めた。中身は、もう食べ物ではなかった。|{a}はやっと見つけた缶詰が、へこんで膨らんでいるのを見て、そっと棚に戻した。|{a}は{area}の奥で、空っぽの段ボールの山を見つけた。誰かが、根こそぎ持っていったらしい。|{a}は自販機の小銭口まで探ったが、出てきたのはレシートだけだった。|{a}は{area}を一時間探して、見つけたのは電池二本だけだった。|{a}は棚の上に手を伸ばして、埃の積もった空箱を落とした。思ったより大きな音がした。');
Z.BARRICADE=L('{a}は{area}の入口に、机と棚を積み上げた。|{a}は窓に板を打ちつけ、隙間に新聞紙を詰めた。|{a}は階段に空き缶を並べて、鳴子を作った。|{a}は扉の取っ手に、モップの柄を差し込んで閂にした。|{a}はガラス戸の内側に、本棚を倒して塞いだ。|{a}は廊下に割れたガラスを撒いておいた。踏めば、音で分かる。|{a}はカーテンを閉め切り、隙間をガムテープで塞いで、中の光が漏れないようにした。|{a}は非常口の扉を、ロープで何重にも縛った。|{a}は二階への階段に、ソファを押し上げて詰まらせた。|{a}は入口の前に、水を張ったバケツと洗剤を撒いた。滑って転べば、時間が稼げる。');
var E=HK.E;
if(E&&HK.addMini)HK.addMini('zombie',[
E('z_m2_radio','solo','s+','a*.3+caution*.2','','as:3','{a}は手回しラジオのハンドルを回し続けた。聞こえてきたのは、同じ録音の避難指示だけだった。|{a}はラジオから聞こえた「生存者の方は」という声に耳を寄せた。続きは、雑音に消えた。|{a}はラジオのつまみを少しずつ回して、どこかの誰かの独り言のような放送を見つけた。その人も、ひとりだった。'),
E('z_m2_mirror','solo','s+','ac*.3+stress/150','','as:4','{a}は割れた鏡に映った自分の顔が、知らない人のように見えた。|{a}は鏡の前で、無理に笑ってみた。目が笑っていなかった。|{a}は鏡に映る自分の頬がこけているのを見て、慌てて目を逸らした。'),
E('z_m2_wash','solo','s+','cp*.3+.15','','as:-4;ahp:2','{a}は貴重な水で、顔だけを洗った。それだけで、少し生き返った気がした。|{a}は濡らしたタオルで体を拭いた。三日ぶりだった。|{a}は川の水で手を洗った。水が冷たすぎて、指先の感覚がなくなった。'),
E('z_m2_pet','solo','s+','np*.5+fc*.2','','as:-6','{a}は痩せた猫を見つけて、缶詰の汁を少しだけ分けてやった。|{a}は首輪をつけたままの犬が、主人の帰りを待つように玄関に座っているのを見た。|いつの間にか、野良犬が{a}のあとをついて歩いていた。追い払う気には、なれなかった。'),
E('z_m2_child','solo','s+','np*.4+ac*.2','','as:6','{a}は小学校の前を通り、校庭に残されたランドセルを見ないようにした。|{a}は公園の砂場に、作りかけの砂の城が残っているのを見つけた。|{a}は、道に落ちていた片方だけの小さな靴を拾い、塀の上に置いた。'),
E('z_m2_sky','solo','s+','fc*.3+ac*.2','','as:-5','{a}は空を見上げた。飛行機雲が一本もない空を見るのは、初めてだった。|{a}は、月がやけに明るい夜だと思った。街の灯りが全部消えたせいだった。|{a}は、遠くの山の稜線が、こんなにはっきり見える街だったことを知った。'),
E('z_m2_phone','solo','s+','np*.3+ac*.3','','as:5','{a}は圏外のスマホで、届かないと分かっているメッセージを打った。送信ボタンは押さなかった。|{a}は、最後に届いたメッセージを読み返した。「＠＠今日、何時に帰る？」|{a}はスマホの電池を節約するために電源を切った。もう一度つける勇気が、なかなか出なかった。'),
E('z_m2_sound','solo','s+','caution*.5','','as:7','{a}は遠くで鳴り続ける車のクラクションを聞いていた。いつまでも、止まらなかった。|{a}の頭上で、誰もいないはずの部屋の床がきしんだ。|{a}は、どこかの家の目覚まし時計が毎朝同じ時間に鳴るのを、時計代わりにしていた。'),
E('z_m2_cook','solo','s+','a*.3+np*.2','','as:-5;ahp:3','{a}はカセットコンロで、缶詰のスープを温めた。湯気を見ているだけで、泣きそうになった。|{a}は乾麺を水でふやかして、無理やり食べた。思ったより、悪くなかった。|{a}は見つけたインスタントコーヒーを、水に溶かして飲んだ。冷たくて、苦くて、懐かしかった。'),
E('z_m2_count','solo','s+','a*.4+cp*.2','','as:-2','{a}は、この数日で見た生存者の数を指折り数えた。片手で足りた。|{a}は、ゾンビになった知り合いの数を数えかけて、やめた。|{a}は、あと何日分の食料があるかを数えて、その日付をカレンダーに丸で囲んだ。'),
E('z_m2_write','solo','s+','ac*.3+a*.2','','as:-3','{a}は、誰かに宛てるわけでもない手紙を書いた。宛名の欄は、空けたままにした。|{a}は壁に、自分が生きていた証のように名前と日付を書いた。|{a}は日記の最後のページに、「まだ大丈夫｜まだ大丈夫だ｜まだ大丈夫です」と書いた。前のページにも、同じことが書いてあった。'),
E('z_m2_memory','solo','s+','np*.3+ac*.3','','as:3','{a}は、あの日の朝に食べた朝ごはんを思い出そうとした。思い出せなかった。|{a}は、最後に笑ったのがいつだったか考えた。|{a}は、何気なく通っていたコンビニの店員の顔を思い出した。名前は、知らなかった。'),
E('z_m2_sleep','solo','s+','caution*.3+stress/120','','as:-6;ahp:3','{a}は浴室の鍵を閉めて、乾いた浴槽の中で眠った。|{a}は車の中で、シートを倒して少しだけ眠った。窓の外を、何かが何度も横切った。|{a}は押し入れの上の段で丸くなって眠った。子どもの頃の、隠れんぼを思い出した。')
]);
Z.scen.events.push({
id:'z_mood',cat:'solo',scope:'solo',
when:function(ctx,a){return!a.z.cult&& !(a.z.zombie);},
w:function(ctx,a){return 1.6+a.stress/120+(Z.here(ctx,a).length?0:0.8);},
run:function(ctx,a){
ctx.stress(a,-3);
return{text:Z.soloFlavor(ctx,a),why:a.name+'のひとりの時間（'+(HK.toneLabel?HK.toneLabel(a):(HK.PERSONA[HK.personaOf(a)]||HK.PERSONA.gentle).label)+'）'};
}
});
})();
});
;
/* ==== js/zombie-letter.js ==== */
HK.Load.def(147,'js/zombie-letter.js',function(){
(function(){
'use strict';
var HK=window.HK,Z=HK.ZB;
if(!Z|| !Z.scen)return;
function L(s){return s.split('|');}
function fill(t,m){return t.replace(/\{(\w+)\}/g,function(x,k){return m[k]!=null?m[k]:x;});}
var GO=L('{a}は、眠っている{b}を起こさないように、そっと荷物をまとめた。|{a}は見張りの交代の隙に、裏口から外へ出た。|{a}は夜明け前、まだ暗いうちに{b}の寝顔を一度だけ見て、出ていった。|{a}は自分の食料と水を半分残して、静かに扉を閉めた。|{a}は{b}が水を汲みに出たあいだに、姿を消した。|{a}は皆が眠ったのを確かめてから、扉の鍵を内側から開けた。|{a}は自分の武器だけを持って、残りの荷物は全部置いていった。');
var AT=L('{b}の枕元に、一枚の紙が残されていた。|{b}のリュックのポケットに、折りたたんだメモが入っていた。|扉の内側に、{a}の字で書かれた紙が貼ってあった。|{b}の靴の中に、小さく折った紙が押し込まれていた。|残された乾パンの箱の裏に、走り書きがあった。');
var BODY={
crushA:L('「ずっと好きだった。言えないまま行くのは、ずるいよね。ごめん。｜ずっと好きだった。言えないまま行くのは、ずるいな。すまない。｜ずっと好きでした。言えないまま行くのは、ずるいですよね。ごめんなさい。」|「最後だから書くね。{b}のことが好きだった。返事はいらない。生きて。｜最後だから書く。{b}のことが好きだった。返事はいらない。生きろ。｜最後だから書きます。{b}のことが好きでした。返事はいりません。生きてください。」|「本当は、最後まで隣にいたかった。好きだったよ。……読んだら、捨てていいから。｜本当は、最後まで隣にいたかった。好きだった。……読んだら、捨てていい。｜本当は、最後まで隣にいたかったです。好きでした。……読んだら、捨てていいですから。」'),
crushB:L('「{b}の気持ちには、気づいてた。応えられなくて、ごめん。でも、嬉しかった。｜{b}の気持ちには、気づいていた。応えられなくて、すまない。だが、嬉しかった。｜{b}の気持ちには、気づいていました。応えられなくて、ごめんなさい。でも、嬉しかったです。」|「いつも見ててくれて、ありがとう。最後まで、ちゃんと向き合えなくてごめん。｜いつも見ていてくれて、ありがとう。最後まで、ちゃんと向き合えなくてすまない。｜いつも見ていてくれて、ありがとうございました。最後まで、ちゃんと向き合えなくてごめんなさい。」|「{b}に優しくしてもらった分、何も返せなかった。どうか、ほかの誰かと幸せに。｜{b}に優しくしてもらった分、何も返せなかった。どうか、ほかの誰かと幸せになってくれ。｜{b}に優しくしてもらった分、何も返せませんでした。どうか、ほかの誰かと幸せになってください。」'),
crushM:L('「ずっと好きだった。{b}にとっては、ただの仲間だったと思うけど。最後だから、それだけ。｜ずっと好きだった。{b}にとっては、ただの仲間だっただろうが。最後だから、それだけだ。｜ずっと好きでした。{b}にとっては、ただの仲間だったと思いますけど。最後だから、それだけです。」|「返事はいらない。分かってるから。{b}が私のことを何とも思ってないのは、ずっと前から。……それでも、好きだった。｜返事はいらない。分かっている。{b}が私のことを何とも思っていないのは、ずっと前からだ。……それでも、好きだった。｜返事はいりません。分かってますから。{b}が私のことを何とも思っていないのは、ずっと前から知っています。……それでも、好きでした。」|「迷惑だと思って、最後まで言えなかった。好き。読んだら、忘れて。｜迷惑だと思って、最後まで言えなかった。好きだ。読んだら、忘れてくれ。｜迷惑だと思って、最後まで言えませんでした。好きです。読んだら、忘れてください。」|「もし、ほんの少しでも同じ気持ちだったら――なんて、考えるだけ無駄だよね。好きだったよ。生きて。｜もし、ほんの少しでも同じ気持ちだったら――などと、考えるだけ無駄だな。好きだった。生きろ。｜もし、ほんの少しでも同じ気持ちだったら――なんて、考えるだけ無駄ですよね。好きでした。生きてください。」'),
parentA:L('「ちゃんと食べること。夜は一人で出歩かないこと。……最後まで、口うるさくてごめんね。愛してる。｜ちゃんと食べること。夜は一人で出歩かないこと。……最後まで、口うるさくてすまない。愛している。｜ちゃんと食べること。夜は一人で出歩かないこと。……最後まで、口うるさくてごめんなさい。愛しています。」|「あなたが生まれた日のこと、今でも覚えてる。生きて。それだけでいい。｜あなたが生まれた日のことを、今でも覚えている。生きろ。それだけでいい。｜あなたが生まれた日のことを、今でも覚えています。生きてください。それだけでいいんです。」|「守ってあげられなくて、ごめん。でも、もう一人で大丈夫。あなたは、自慢の子だよ。｜守ってやれなくて、すまない。だが、もう一人で大丈夫だ。あなたは、自慢の子だ。｜守ってあげられなくて、ごめんなさい。でも、もう一人で大丈夫です。あなたは、自慢の子です。」'),
child:L('「今まで育ててくれて、ありがとう。最後に親不孝をして、ごめん。｜今まで育ててくれて、感謝している。最後に親不孝をして、すまない。｜今まで育ててくれて、ありがとうございました。最後に親不孝をして、ごめんなさい。」|「追いかけてこないで。お願い。最後くらい、言うことを聞いて。｜追いかけてくるな。頼む。最後くらい、言うことを聞いてくれ。｜追いかけてこないでください。お願いします。最後くらい、言うことを聞いてください。」|「ちゃんと、ありがとうを言えばよかった。……ありがとう。｜＝｜ちゃんと、ありがとうを言えばよかったです。……ありがとうございました。」'),
protA:L('「ずっと、我が子みたいに思ってた。最後まで守ってやれなくて、ごめん。あとは、自分の足で生きろ。｜ずっと、我が子のように思っていた。最後まで守ってやれなくて、すまない。あとは、自分の足で生きろ。｜ずっと、我が子のように思っていました。最後まで守ってあげられなくて、ごめんなさい。あとは、自分の足で生きてください。」|「ちゃんと食べろ。夜はひとりで出歩くな。……最後まで口うるさくて、悪かったな。｜ちゃんと食べろ。夜はひとりで出歩くな。……最後まで口うるさくて、すまなかった。｜ちゃんと食べてください。夜はひとりで出歩かないでください。……最後まで口うるさくて、すみませんでした。」|「あなたが生まれた日のこと、今でも覚えてる。生きろ。それだけでいい。｜あなたが生まれた日のことを、今でも覚えている。生きろ。それだけでいい。｜あなたが生まれた日のことを、今でも覚えています。生きてください。それだけでいいんです。」'),
protB:L('「ずっと守ってもらってばかりだった。最後くらい、守らせて。｜ずっと守ってもらってばかりだった。最後くらい、守らせてくれ。｜ずっと守ってもらってばかりでした。最後くらい、守らせてください。」|「追いかけてこないで。今度は、言うことを聞いてほしい。｜追いかけてくるな。今度は、言うことを聞いてほしい。｜追いかけてこないでください。今度は、言うことを聞いてほしいんです。」|「親代わりみたいに育ててくれて、ありがとう。……大好きだったよ。｜親代わりのように育ててくれて、ありがとう。……大好きだった。｜親代わりのように育ててくれて、ありがとうございました。……大好きでした。」'),
sibclose:L('「{sibs}で、親友で、相棒だった。全部ひっくるめて、ありがとう。｜＝｜{sibs}で、親友で、相棒でした。全部ひっくるめて、ありがとうございました。」|「先に行く。泣くなよ。泣いたら、あの世から笑ってやるから。｜先に行く。泣くな。泣いたら、あの世から笑ってやる。｜先に行きます。泣かないでくださいね。泣いたら、あの世から笑いますから。」|「秘密の暗号、覚えてる？　……最後の一行は、それで書いておいた。｜秘密の暗号、覚えているか。……最後の一行は、それで書いておいた。｜秘密の暗号、覚えていますか？　……最後の一行は、それで書いておきました。」'),
teacherA:L('「最後の授業だよ。生き延びること。合格点は、それだけ。｜最後の授業だ。生き延びること。合格点は、それだけだ。｜最後の授業です。生き延びること。合格点は、それだけです。」|「あなたたちの先生でいられて、幸せだった。卒業おめでとう、とは言えないけど。｜あなたたちの先生でいられて、幸せだった。卒業おめでとう、とは言えないが。｜あなたたちの先生でいられて、幸せでした。卒業おめでとう、とは言えませんけれど。」|「答えは、もう教えてある。あとは自分で解いて。｜答えは、もう教えてある。あとは自分で解け。｜答えは、もう教えてあります。あとは自分で解きなさい。」'),
teacherB:L('「先生、今までありがとう。最後に、宿題をさぼるね。｜先生、今まで世話になった。最後に、宿題をさぼる。｜先生、今までありがとうございました。最後に、宿題をさぼります。」|「先生に教わったこと、全部持っていく。だから、先生は生きて。｜先生に教わったことは、全部持っていく。だから、先生は生きてくれ。｜先生に教わったこと、全部持っていきます。だから、先生は生きてください。」|「一度くらい、先生に褒められたかったな。｜一度くらい、先生に褒められたかった。｜一度くらい、先生に褒められたかったです。」'),
mentorA:L('「教えられることは、すべて教えた。あとは、あなたの道だ。｜＝｜教えられることは、すべて教えました。あとは、あなたの道です。」|「振り返るな。それが最後の稽古だ。｜＝｜振り返らないでください。それが最後の稽古です。」|「よい弟子を持った。悔いはない。｜＝｜よい弟子を持ちました。悔いはありません。」'),
mentorB:L('「師匠、最後まで未熟な弟子でごめん。教えは、絶対に忘れない。｜師匠、最後まで未熟な弟子ですまない。教えは、決して忘れない。｜師匠、最後まで未熟な弟子で申し訳ありません。教えは、決して忘れません。」|「いつか、師匠の背中に追いつきたかった。｜＝｜いつか、師匠の背中に追いつきたかったです。」|「ここから先は、ひとりで行く。今まで、ありがとう。｜ここから先は、ひとりで行く。今まで、世話になった。｜ここから先は、ひとりで行きます。今まで、ありがとうございました。」'),
sibling:L('「喧嘩ばっかりだったけど、{sibs}でよかった。……絶対に、追いかけてくるなよ。｜喧嘩ばかりだったが、{sibs}でよかった。……絶対に、追いかけてくるな。｜喧嘩ばかりでしたけど、{sibs}でよかったです。……絶対に、追いかけてこないでくださいね。」|「昔借りたままのゲーム、返せなくなった。ごめん。生き延びて。｜昔借りたままのゲーム、返せなくなった。すまない。生き延びろ。｜昔借りたままのゲーム、返せなくなりました。ごめんなさい。生き延びてください。」|「家族の分まで、生きて。それから、たまには思い出して。｜家族の分まで、生きろ。それから、たまには思い出してくれ。｜家族の分まで、生きてください。それから、たまには思い出してください。」'),
senpai:L('「頼りない先輩でごめん。ここから先は、あなたの判断を信じる。｜頼りない先輩ですまない。ここから先は、あなたの判断を信じる。｜頼りない先輩でごめんなさい。ここから先は、あなたの判断を信じます。」|「最後の指示だよ。振り返らずに、生き延びること。｜最後の指示だ。振り返らずに、生き延びること。｜最後の指示です。振り返らずに、生き延びてください。」|「あなたは、もう一人でも大丈夫。……いい後輩だったよ。｜あなたは、もう一人でも大丈夫だ。……いい後輩だった。｜あなたは、もう一人でも大丈夫です。……いい後輩でしたよ。」'),
kohai:L('「先輩、今までありがとう。最後に勝手なことをして、ごめん。｜先輩、今まで世話になった。最後に勝手なことをして、すまない。｜先輩、今までお世話になりました。最後に勝手なことをして、すみません。」|「教えてもらったこと、一つも無駄にしない。だから先輩も、生きて。｜教えてもらったことは、一つも無駄にしない。だから先輩も、生きてくれ。｜教えてもらったこと、一つも無駄にしません。だから先輩も、生きてください。」|「先輩の背中、ずっと追いかけてた。……先に行くね。｜先輩の背中を、ずっと追いかけていた。……先に行く。｜先輩の背中、ずっと追いかけてました。……先に行きます。」'),
master:L('「これは命令だ。探すな。生きろ。｜＝｜これは命令です。探さないでください。生きてください。」|「長いあいだ、よく仕えてくれた。今日で、あなたは自由だ。｜＝｜長いあいだ、よく仕えてくれました。今日で、あなたは自由です。」|「最後まで世話をかけたな。……感謝してる。｜最後まで世話をかけた。……感謝している。｜最後までお世話をかけましたね。……感謝しています。」'),
servant:L('「そばを離れて、ごめん。どうか、無事でいて。｜そばを離れる無礼を、許してくれ。どうか、無事でいろ。｜お側を離れるご無礼を、お許しください。どうか、ご無事で。」|「最後まで仕えられなくて、ごめん。｜最後まで仕えられず、すまない。｜最後までお仕えできず、申し訳ございません。」|「どうか、気にしないで。あなたが生きてくれることだけが、望みだよ。｜どうか、気にするな。あなたが生きてくれることだけが、望みだ。｜どうか、お気になさらず。あなたが生きてくださることだけが、望みです。」'),
best:L('「あなたがいたから、ここまで来られた。ありがとう、親友。｜＝｜あなたがいたから、ここまで来られました。親友、ありがとうございました。」|「二人で行く約束、守れなくてごめん。代わりに、あなたは絶対に行って。｜二人で行く約束を、守れなくてすまない。代わりに、あなたは絶対に行け。｜二人で行く約束、守れなくてごめんなさい。代わりに、あなたは絶対に行ってください。」|「泣くなよ。あなたが泣くと、こっちまで泣けてくるんだから。｜泣くな。あなたが泣くと、こっちまで泣けてくる。｜泣かないでくださいね。あなたが泣くと、こっちまで泣けてくるんですから。」'),
buddy:L('「相棒へ。背中は、もう預けられない。今まで、ありがとな。｜相棒へ。背中は、もう預けられない。今まで、ありがとう。｜相棒へ。背中は、もう預けられません。今まで、ありがとうございました。」|「最後の作戦。あなたは北へ行って。……振り返らないで。｜最後の作戦だ。あなたは北へ行け。……振り返るな。｜最後の作戦です。あなたは北へ行ってください。……振り返らないでください。」|「あなたと組めて、悪くなかった。いや、最高だった。｜＝｜あなたと組めて、悪くなかったです。いえ、最高でした。」'),
childhood:L('「子どものころの秘密基地、覚えてる？　あそこで待ってる。……嘘だけど。｜子どものころの秘密基地、覚えているか。あそこで待っている。……嘘だが。｜子どものころの秘密基地、覚えてますか？　あそこで待ってます。……嘘ですけど。」|「ずっと一緒だったね。最後だけ、ひとりで行かせて。｜ずっと一緒だったな。最後だけ、ひとりで行かせてくれ。｜ずっと一緒でしたね。最後だけ、ひとりで行かせてください。」|「小さいころから、ずっと助けてもらってばっかりだった。今度は、守る番。だから、来ないで。｜小さいころから、ずっと助けてもらってばかりだった。今度は、守る番だ。だから、来るな。｜小さいころから、ずっと助けてもらってばかりでした。今度は、守る番です。だから、来ないでください。」'),
almost:L('「友達でいるのが、ずっと苦しかった。……なんて、最後に言うことじゃないね。元気で。｜友達でいるのが、ずっと苦しかった。……などと、最後に言うことではないな。元気でいろ。｜友達でいるのが、ずっと苦しかったです。……なんて、最後に言うことじゃありませんね。お元気で。」|「あのとき言いかけたこと、本当は分かってた。同じ気持ちだった。｜あのとき言いかけたことは、本当は分かっていた。同じ気持ちだった。｜あのとき言いかけたこと、本当は分かっていました。同じ気持ちでした。」|「もし、ちゃんと始まっていたら。そう考えるのは、もうやめにする。ありがとう。｜＝｜もし、ちゃんと始まっていたら。そう考えるのは、もうやめにします。ありがとうございました。」'),
fwb:L('「都合のいい関係のまま終わるのも、悪くなかった。……嘘。ちょっとだけ、寂しい。｜都合のいい関係のまま終わるのも、悪くなかった。……嘘だ。少しだけ、寂しい。｜都合のいい関係のまま終わるのも、悪くなかったです。……嘘です。ちょっとだけ、寂しいです。」|「最後くらい、ちゃんと言っとく。一緒にいて、楽しかった。｜最後くらい、ちゃんと言っておく。一緒にいて、楽しかった。｜最後くらい、ちゃんと言っておきます。一緒にいて、楽しかったです。」|「探さなくていい。そういう約束だったでしょ。｜探さなくていい。そういう約束だっただろう。｜探さなくていいです。そういう約束だったでしょう。」'),
ex:L('「別れたあとも、結局頼ってばかりだった。ごめん。それから、ありがとう。｜別れたあとも、結局頼ってばかりだった。すまない。それから、ありがとう。｜別れたあとも、結局頼ってばかりでした。ごめんなさい。それから、ありがとうございました。」|「あのころ、もっと素直になればよかった。……今さら遅いけど。｜あのころ、もっと素直になればよかった。……今さら遅いが。｜あのころ、もっと素直になればよかったです。……今さら遅いですけど。」|「次は、ちゃんと幸せになって。ほかの誰かと。｜次は、ちゃんと幸せになれ。ほかの誰かと。｜次は、ほかの誰かと、ちゃんと幸せになってください。」'),
rival:L('「勝負は、あなたの勝ちでいい。だから、絶対に生き残れ。負けたら許さない。｜＝｜勝負は、あなたの勝ちでいいです。だから、絶対に生き残ってください。負けたら許しません。」|「最後まで張り合えて、楽しかった。……絶対に言わないつもりだったけど。｜最後まで張り合えて、楽しかった。……絶対に言わないつもりだったが。｜最後まで張り合えて、楽しかったです。……絶対に言わないつもりでしたけど。」|「決着は、あの世でつける。それまで来るなよ。｜決着は、あの世でつける。それまで来るな。｜決着は、あの世でつけます。それまで来ないでくださいね。」'),
enemy:L('「あなたのことは最後まで嫌いだった。でも、死ねとは思ってない。｜あなたのことは最後まで嫌いだった。だが、死ねとは思っていない。｜あなたのことは最後まで嫌いでした。でも、死ねとは思っていません。」|「これで清々するだろ。……せいぜい、長生きしろ。｜これで清々するだろう。……せいぜい、長生きしろ。｜これで清々するでしょう。……せいぜい、長生きしてください。」|「借りは返した。これで、貸し借りなしだ。｜＝｜借りは返しました。これで、貸し借りなしです。」'),
worshipA:L('「{b}のために生きられて、幸せだった。これからも、遠くから祈ってる。｜{b}のために生きられて、幸せだった。これからも、遠くから祈っている。｜{b}のために生きられて、幸せでした。これからも、遠くから祈っています。」|「{b}は、私のすべてだった。だから、私のことで泣かないで。{b}が笑っていてくれれば、それでいい。｜{b}は、私のすべてだった。だから、私のことで泣くな。{b}が笑っていてくれれば、それでいい。｜{b}は、私のすべてでした。だから、私のことで泣かないでください。{b}が笑っていてくれれば、それでいいんです。」|「最後まで盾でいられなかった。ごめん。どうか生きて。それだけが、最後の願い。｜最後まで盾でいられなかった。すまない。どうか生きてくれ。それだけが、最後の願いだ。｜最後まで盾でいられませんでした。ごめんなさい。どうか生きてください。それだけが、最後の願いです。」'),
worshipB:L('「{b}へ。私を追ってこないで。{b}の命は、{b}のものだ。｜{b}へ。私を追ってくるな。{b}の命は、{b}のものだ。｜{b}へ。私を追ってこないでください。{b}の命は、{b}のものです。」|「ずっと支えてくれてありがとう。これからは、自分のために生きて。｜ずっと支えてくれてありがとう。これからは、自分のために生きろ。｜ずっと支えてくれてありがとうございました。これからは、自分のために生きてください。」|「{b}が信じてくれたから、ここまで来られた。でも、もう私を探さなくていい。｜{b}が信じてくれたから、ここまで来られた。だが、もう私を探さなくていい。｜{b}が信じてくれたから、ここまで来られました。でも、もう私を探さなくていいんです。」'),
beneA:L('「恩なんて、もう十分返してもらった。これからは、自分のために生きて。｜恩なら、もう十分返してもらった。これからは、自分のために生きろ。｜恩なんて、もう十分返してもらいました。これからは、自分のために生きてください。」|「あの日{b}を助けたことは、私の人生でいちばんいい選択だった。｜＝｜あの日{b}を助けたことは、私の人生でいちばんいい選択でした。」|「借りを返そうなんて思わなくていい。生きていてくれれば、それで十分。｜借りを返そうなどと思わなくていい。生きていてくれれば、それで十分だ。｜借りを返そうなんて思わなくていいです。生きていてくれれば、それで十分です。」'),
beneB:L('「受けた恩を、最後まで返しきれなかった。それだけが心残り。｜受けた恩を、最後まで返しきれなかった。それだけが心残りだ。｜受けた恩を、最後まで返しきれませんでした。それだけが心残りです。」|「{b}に救ってもらった命を、ここで手放すことを許して。｜{b}に救ってもらった命を、ここで手放すことを許してくれ。｜{b}に救ってもらった命を、ここで手放すことを許してください。」|「あの日、手を差し伸べてくれてありがとう。おかげで、いい人生だった。｜＝｜あの日、手を差し伸べてくれてありがとうございました。おかげで、いい人生でした。」'),
bossA:L('「最後の指示。私を探さないで。生き延びて、皆をまとめて。｜最後の指示だ。私を探すな。生き延びて、皆をまとめろ。｜最後の指示です。私を探さないでください。生き延びて、皆をまとめてください。」|「{b}は、私の自慢の部下だった。あとは任せる。｜＝｜{b}は、私の自慢の部下でした。あとは任せます。」|「上司らしいことを、最後に一つだけ。振り返らずに行け。｜＝｜上司らしいことを、最後に一つだけ。振り返らずに行ってください。」'),
bossB:L('「最後に勝手なことをして、ごめん。仕事のことも、それ以外のことも、教わってばかりだった。｜最後に勝手なことをして、すまない。仕事のことも、それ以外のことも、教わってばかりだった。｜最後に勝手なことをして、すみません。仕事のことも、それ以外のことも、教わってばかりでした。」|「{b}の下で働けてよかった。どうか、生き延びて。｜{b}の下で働けてよかった。どうか、生き延びてくれ。｜{b}の下で働けてよかった。どうか、生き延びてください。」|「報告。私は、ここまで。今までありがとう。｜報告する。私は、ここまでだ。世話になった。｜報告します。私は、ここまでです。お世話になりました。」'),
classmate:L('「学生のころ、もっと話しておけばよかった。また会えて嬉しかった。｜＝｜学生のころ、もっと話しておけばよかったです。また会えて嬉しかったです。」|「卒業アルバムの寄せ書き、覚えてる？　あそこに書いたこと、本当だったよ。｜卒業アルバムの寄せ書き、覚えているか。あそこに書いたことは、本当だった。｜卒業アルバムの寄せ書き、覚えてますか？　あそこに書いたこと、本当だったんですよ。」|「同じクラスでよかった。元気で。｜同じクラスでよかった。元気でいろ。｜同じクラスでよかったです。お元気で。」'),
relative:L('「親戚の皆に会ったら、よろしく伝えて。私の分まで、家族を頼む。｜親戚の皆に会ったら、よろしく伝えてくれ。私の分まで、家族を頼む。｜親戚の皆さんに会ったら、よろしく伝えてください。私の分まで、家族をお願いします。」|「子どものころ、親戚の集まりで遊んでもらったこと、ずっと覚えてる。ありがとう。｜子どものころ、親戚の集まりで遊んでもらったことは、ずっと覚えている。ありがとう。｜子どものころ、親戚の集まりで遊んでもらったこと、ずっと覚えています。ありがとうございました。」|「家族のこと、頼んだ。{b}なら、きっと大丈夫。｜家族のことは、頼んだ。{b}なら、きっと大丈夫だ。｜家族のこと、お願いします。{b}なら、きっと大丈夫です。」'),
yanA:L('「{b}を一人にしたくなかった。ずっと、ずっと見てた。……ごめんね、最後まで重くて。｜{b}を一人にしたくなかった。ずっと、ずっと見ていた。……最後まで重くて、すまない。｜{b}を一人にしたくありませんでした。ずっと、ずっと見ていました。……最後まで重くて、ごめんなさい。」|「私がいなくなっても、{b}が誰かのものになるのは嫌。でも、生きて。それだけは、本当。｜私がいなくなっても、{b}が誰かのものになるのは嫌だ。だが、生きろ。それだけは、本当だ。｜私がいなくなっても、{b}が誰かのものになるのは嫌です。でも、生きてください。それだけは、本当です。」'),
yanB:L('「追いかけてこないで。今度だけは、言うことを聞いて。｜追いかけてくるな。今度だけは、言うことを聞いてくれ。｜追いかけてこないでください。今度だけは、言うことを聞いてください。」|「{b}の気持ちは、重かった。でも、嫌いじゃなかった。｜{b}の気持ちは、重かった。だが、嫌いではなかった。｜{b}の気持ちは、重かったです。でも、嫌いじゃありませんでした。」'),
friend:L('「今までありがとう。楽しかったよ。｜今までありがとう。楽しかった。｜今までありがとうございました。楽しかったです。」|「急にいなくなって、ごめん。理由は、聞かないで。｜急にいなくなって、すまない。理由は、聞くな。｜急にいなくなって、ごめんなさい。理由は、聞かないでください。」|「生き延びて、いつか誰かに、この話をしてやって。｜生き延びて、いつか誰かに、この話をしてやってくれ。｜生き延びて、いつか誰かに、この話をしてあげてください。」'),
colleague:L('「お疲れさま。引き継ぎは、できなかった。｜＝｜お疲れさまでした。引き継ぎは、できませんでした。」|「職場で隣の席だったころが、今はすごく懐かしい。どうか元気で。｜職場で隣の席だったころが、今はすごく懐かしい。どうか元気でいろ。｜職場で隣の席だったころが、今はすごく懐かしいです。どうかお元気で。」|「最後の業務連絡。生き延びて。以上。｜最後の業務連絡だ。生き延びろ。以上。｜最後の業務連絡です。生き延びてください。以上です。」'),
acq:L('「短いあいだだったけど、ありがとう。｜短いあいだだったが、世話になった。｜短いあいだでしたが、お世話になりました。」|「名前くらいしか知らないのに、ここまで一緒に来てくれてありがとう。｜＝｜名前くらいしか知らないのに、ここまで一緒に来てくれてありがとうございました。」|「どうか、無事で。｜どうか、無事でいろ。｜どうか、ご無事で。」'),
warm:L('「一緒にいられて、本当によかった。ありがとう。さようなら。｜＝｜一緒にいられて、本当によかったです。ありがとうございました。さようなら。」|「先に行くね。ゆっくり、来てね。……ゆっくり、だよ。｜先に行く。ゆっくり、来い。……ゆっくり、だぞ。｜先に行きますね。ゆっくり、来てくださいね。……ゆっくり、ですよ。」|「あなたと会えたことが、この地獄の中で一番の幸運だった。｜＝｜あなたと会えたことが、この地獄の中で一番の幸運でした。」'),
plain:L('「ありがとう。｜＝｜ありがとうございました。」|「先に行く。気にしないで。｜先に行く。気にするな。｜先に行きます。気にしないでください。」|「元気で。｜元気でいろ。｜お元気で。」'),
curt:L('「探すな。｜＝｜探さないでください。」|「世話になった。それだけだ。｜＝｜お世話になりました。それだけです。」|「これで足手まといが一人減る。喜べ。｜＝｜これで足手まといが一人減ります。喜んでください。」')
};
var SIGN={
proud:L('追伸：泣いたら許さない。|追伸：一人でも、しっかりやれ。'),
stern:L('追伸：水と食料の配分表は、リュックの中。|追伸：規則は守ること。'),
tsun:L('追伸：別に、寂しくなんかない。|追伸：心配しなくていいから。……ほんとに。'),
gentle:L('追伸：ちゃんと寝てね。|追伸：飴、置いていくね。'),
devoted:L('追伸：残した食料、使ってね。|追伸：迷惑ばかりかけて、ごめんなさい。'),
cool:L('追伸：北の道は塞がっている。南から行け。|追伸：感情的にならないこと。'),
free:L('追伸：楽しかった！|追伸：二人分、楽しいことしてね。'),
shy:L('追伸：ちゃんと顔を見て言えなくて、ごめん。|追伸：……ありがとう、って、言えなくてごめんね。'),
polite:L('追伸：お借りしていた毛布は、畳んでおきました。|追伸：どうか、お体を大切に。'),
aniki:L('追伸：みんなのこと、頼んだ。|追伸：残した缶詰は、全員で分けろ。|追伸：泣くのは一回だけにしとけ。')
};
var READ_M=L('{b}は手紙を読み終えて、声を上げずに泣いた。「……こっちの台詞だよ｜……こっちの台詞だ｜……こっちの台詞ですよ」――答える相手は、もういなかった。|{b}は、自分のポケットに入れたままの、渡せなかった手紙を取り出した。書き出しは、同じ言葉だった。|{b}は手紙を握りしめた。「何とも思ってないわけ、ないでしょ｜何とも思っていないわけが、ないだろう｜何とも思っていないわけ、ないでしょう」――その声は、誰にも届かなかった。|{b}は手紙を何度も読み返した。迷惑だと思って言えなかったのは、{b}も同じだった。');
var READ=L('{b}は、手紙を読み終えてもしばらく動けなかった。|{b}は手紙を握りしめて、外に飛び出しかけた。誰かに腕を掴まれて、止められた。|{b}は、手紙を丁寧に折りたたんで、胸ポケットにしまった。|{b}は手紙の字が、最後の方だけ震えていることに気づいた。');
function kindOf(ctx,a,b){
var T=HK.Ties;
if(T){
if(T.pining&&T.pining(ctx,a,b))return'crushM';
if(T.from(ctx,a,b,'crush'))return'crushA';
if(T.from(ctx,b,a,'crush'))return'crushB';
if(T.get&&HK.tieFamLove&&HK.tieFamLove(T.get(ctx,a,b))&&(ctx.pair(a,b).couple||(ctx.R(a,b).att>40&&ctx.R(b,a).att>30)))return'crushA';
if(T.from(ctx,a,b,'sibprot')&&T.has(ctx,a,b,'sibprot').type==='sibprot')return'protA';
if(T.from(ctx,b,a,'sibprot')&&T.has(ctx,a,b,'sibprot').type==='sibprot')return'protB';
if(T.has(ctx,a,b,'sibclose'))return'sibclose';
if(T.from(ctx,a,b,'teacher'))return'teacherA';
if(T.from(ctx,b,a,'teacher'))return'teacherB';
if(T.from(ctx,a,b,'mentor'))return'mentorA';
if(T.from(ctx,b,a,'mentor'))return'mentorB';
if(T.has(ctx,a,b,'pparent')&&T.has(ctx,a,b,'pparent').type==='pparent'&&ctx.R(a,b).att>40&&ctx.R(b,a).att>30)return'crushA';
if(T.from(ctx,a,b,'parent'))return'parentA';
if(T.from(ctx,b,a,'parent'))return'child';
if(T.from(ctx,a,b,'senpai'))return'senpai';
if(T.from(ctx,b,a,'senpai'))return'kohai';
if(T.from(ctx,a,b,'master'))return'master';
if(T.from(ctx,b,a,'master'))return'servant';
if(T.from(ctx,a,b,'worship'))return'worshipA';
if(T.from(ctx,b,a,'worship'))return'worshipB';
if(T.from(ctx,a,b,'yan'))return'yanA';
if(T.from(ctx,b,a,'yan'))return'yanB';
if(T.from(ctx,a,b,'benefactor'))return'beneA';
if(T.from(ctx,b,a,'benefactor'))return'beneB';
if(T.from(ctx,a,b,'boss'))return'bossA';
if(T.from(ctx,b,a,'boss'))return'bossB';
var order=['sibling','relative','best','buddy','childhood','almost','fwb','ex','rival','enemy','friend','classmate','colleague','acq'];
for(var i=0;i<order.length;i++)if(T.has(ctx,a,b,order[i]))return order[i];
if(T.has(ctx,a,b,'fated')||T.has(ctx,a,b,'mate'))return'almost';
}
var r=ctx.R(a,b),aff=r.aff;
if(r.att>55&&aff>30)return'crushA';
return aff>=45?'warm':aff>=10?'plain':'curt';
}
Z.leaveLetter=function(ctx,a,b,mates){
var rng=ctx.rng,m={a:a.name,b:b?b.name:''};
if(!b)return fill(ctx.pick(['{a}は、誰にも何も言わずに出ていった。床に「ごめん」とだけ書かれた紙が残っていた。','{a}は皆が眠っているあいだに、静かに姿を消した。']),m);
var kind=kindOf(ctx,a,b),per=HK.toneOf&&SIGN[HK.toneOf(a)]?HK.toneOf(a):HK.personaOf(a);
var t=fill(ctx.pick(GO),m)+fill(ctx.pick(AT),m)+fill(ctx.pick(BODY[kind]||BODY.plain),m);
if(SIGN[per]&&rng()<0.4&&kind!=='curt')t+=ctx.pick(SIGN[per]);
if(mates&&mates.length>1&&rng()<0.35)t+='――裏には、小さく「みんなにも、よろしく」と書き足してあった。';
if(kind==='crushM')t+=fill(ctx.pick(READ_M),m);
else if(rng()<0.45)t+=fill(ctx.pick(READ),m);
if(kind==='mentorB'&&HK.Ties&&HK.Ties.mentorWord)t=HK.Ties.mentorWord(t,b,a);
return HK.Sib?HK.Sib.fill(t,a,b,null,ctx):t;
};
Z.letterKind=kindOf;
var LOVE={
proud:L('「お前を置いていくのは、これが最初で最後だ。……愛してた。いや、愛してる。」|「泣くな。胸を張って生きろ。お前なら、できる。」'),
stern:L('「約束を破ることを許してほしい。あなたと生きる、という約束を。」|「最後まで、あなたを守るつもりでした。守れる形が、これしかなかった。」'),
tsun:L('「別に、あんたのためじゃない。……うそ。全部、あんたのため。好きだった。」|「追いかけてきたら、一生口きかないから。……生きてね。」'),
gentle:L('「ちゃんとご飯食べてね。ときどき思い出してくれるくらいで、いいよ。」|「あなたといた時間、全部宝物だった。ありがとう。」'),
devoted:L('「最後まで、あなたの役に立ちたかった。ごめんね。大好き。」|「二人分、生きて。それが、最後のお願い。」'),
cool:L('「合理的に考えて、これが最善だ。……合理的じゃない部分で、愛してる。」|「感情を整理する時間がなかった。だから、結論だけ書く。愛してる。」'),
free:L('「最高に楽しかった！　だから泣かないで。笑って送り出して。」|「次に生まれ変わっても、また見つけてね。約束。」'),
shy:L('「面と向かって言えなかったから、手紙で言うね。……好き。ずっと、好き。」|「最後まで勇気が出なくて、ごめん。愛してる、って書くだけで手が震えてる。」'),
polite:L('「あなたと過ごした日々を、心から感謝しております。どうか、お幸せに。」|「最後の我儘をお許しください。……お慕いしておりました。」'),
aniki:L('「最後まで面倒見てやれなくて、悪い。お前は強いから、大丈夫だ。……愛してる。」|「お前を守るのが、生きる理由だった。これからは、自分のために生きろ。」')
};
var love0=Z.loveLeave;
if(love0){
Z.loveLeave=function(ctx,c,lover){
var t=love0.apply(this,arguments);
if(ctx.rng()<0.6){
var per=HK.toneOf&&LOVE[HK.toneOf(c)]?HK.toneOf(c):HK.personaOf(c),m={a:c.name,b:lover.name};
t=fill(ctx.pick(GO),m)+fill(ctx.pick(AT),m)+fill(ctx.pick(LOVE[per]||LOVE.gentle),m);
}
return t;
};
}
})();
});
;
/* ==== js/zombie-seek.js ==== */
HK.Load.def(148,'js/zombie-seek.js',function(){
(function(){
'use strict';
var HK=window.HK,Z=HK.ZB;
if(!Z|| !Z.scen)return;
var scen=Z.scen,EV=scen.events;
function L(s){return s.split('|');}
function fill(t,m){return String(t).replace(/\{(\w+)\}/g,function(x,k){return m[k]!=null?m[k]:x;});}
function free(a){return a&&a.alive&& !a.out&&a.z&& !a.z.alone&& !a.z.vanished&&a.z.cult==null&& !a.z.bitten&& !(a.flags&&a.flags.caged!=null);}
function present(o){return o&&o.alive&& !o.out&&o.z;}
function kind(ctx,a,o){
var T=HK.Ties;
if(!T)return'care';
if(T.from(ctx,a,o,'worship'))return'worship';
if(T.from(ctx,a,o,'yan'))return'yan';
var all=T.all(ctx,a,o);
function has(t){return all.some(function(x){return x.type===t;});}
if(has('lover')||has('mate')||has('fated')||ctx.pair(a,o).couple)return'lover';
if(has('sibprot'))return'sib';
if(T.from(ctx,a,o,'parent')||T.from(ctx,a,o,'pparent'))return'parent';
if(T.from(ctx,o,a,'parent')||T.from(ctx,o,a,'pparent'))return'child';
if(has('sibling')||has('sibprot')||has('sibclose')||has('sibbad'))return'sib';
if(has('relative'))return'relative';
if(T.from(ctx,a,o,'benefactor'))return'beneA';
if(T.from(ctx,o,a,'benefactor'))return'beneB';
if(T.from(ctx,a,o,'boss'))return'bossA';
if(T.from(ctx,o,a,'boss'))return'bossB';
if(T.from(ctx,o,a,'worship'))return'worshipped';
if(T.from(ctx,a,o,'crush')||has('almost'))return'crush';
if(has('best')||has('childhood')||has('buddy'))return'best';
if(has('classmate'))return'classmate';
if(has('colleague')||has('senpai'))return'colleague';
return'care';
}
var GROUP={lover:'love',crush:'love',parent:'fam',child:'fam',sib:'fam',relative:'fam',beneA:'bene',beneB:'bene',bossA:'boss',bossB:'boss',worship:'worship',yan:'yan',worshipped:'friend',best:'friend',classmate:'friend',colleague:'friend',care:'friend'};
var KNAME={lover:'恋人',crush:'想いを寄せる相手',parent:'我が子',child:'親',sib:'きょうだい',relative:'親族',beneA:'かつて助けた相手',beneB:'恩人',bossA:'部下',bossB:'上司',worship:'信仰する相手',yan:'執着する相手',worshipped:'自分を慕う相手',best:'親友',classmate:'同級生',colleague:'同僚',care:'大切な相手'};
function kn(ctx,k,a,T){return k==='sib'&&HK.Sib?HK.Sib.word(a,T,'plain',ctx):KNAME[k];}
function bold(k){return k==='worship'||k==='yan';}
function depth(ctx,a,o){
if(HK.Grief&&HK.Grief.depth)return HK.Grief.depth(ctx,a,o).d;
var r=ctx.R(a,o);
return Math.max(0,r.aff)*0.8+Math.max(0,r.trust)*0.3;
}
Z.seekKind=kind;
Z.seekDepth=depth;
var GO={
lover:L('{a}は、{b}がいないまま夜を越すことに耐えられなかった。{a}「{b}を探しに行く。止めても無駄だ｜＝｜{b}を探しに行きます。止めても無駄です」|{a}は{b}と最後に交わした言葉を思い出していた。あれが最後になるなんて、認めない。{a}は黙って荷物をまとめた。|{a}は、{b}の笑った顔ばかり思い出していた。{a}「{b}は生きてる。迎えに行く｜{b}は生きている。迎えに行く｜{b}は生きています。迎えに行きます」'),
parent:L('{a}は{b}の名前を何度もつぶやいた。我が子がこの街のどこかにいる。それだけで、じっとしてはいられなかった。|{a}「{b}を探す。親が探さないで、誰が探すんだ｜{b}を探す。親が探さずに、誰が探すというのだ｜{b}を探します。親が探さないで、誰が探すんですか」――{a}の声は、少しも震えていなかった。'),
child:L('{a}は、{b}がまだどこかで自分を待っている気がしてならなかった。{a}「親を探しに行く。……一人でも｜＝｜……一人でも、親を探しに行きます」|{a}は{b}の顔を思い浮かべて、唇を噛んだ。今度は、自分が迎えに行く番だった。'),
sib:L('{a}は{b}のことを考えていた。{sib:a→b}なら、きっとどこかで踏ん張っている。{a}「{b}を探しに行く｜＝｜{b}を探しに行きます」|{a}「{b}のことだ、どうせ無茶をしてる。迎えに行ってやらないと｜{b}のことだ、どうせ無茶をしている。迎えに行ってやらねばならない｜{b}のことですから、どうせ無茶をしています。迎えに行かないといけません」――{a}は笑ってみせたが、目は笑っていなかった。'),
relative:L('{a}は、{b}のことが頭から離れなかった。同じ家に住んでいなくても、親族は親族だ。{a}「{b}を探す。放ってはおけない｜＝｜{b}を探します。放ってはおけません」|{a}は、親戚の集まりで{b}と並んで座った日のことを思い出した。あの顔を、もう一度見たかった。'),
beneA:L('{a}は、かつて手を差し伸べた{b}のことを思った。あのとき助けた命を、こんなところで終わらせたくない。{a}「{b}を探しに行く｜＝｜{b}を探しに行きます」|{a}「{b}は一人で抱え込む性分だ。誰かが行ってやらないと｜{b}は一人で抱え込む性分だ。誰かが行ってやらねばならない｜{b}は一人で抱え込む性分です。誰かが行ってあげないといけません」――{a}は立ち上がった。'),
beneB:L('{a}は、{b}に救われた日のことを思い出していた。今度は自分が恩を返す番だ。{a}「{b}を探す。この命は、{b}にもらったものだから｜{b}を探す。この命は、{b}にもらったものだ｜{b}を探します。この命は、{b}にもらったものですから」|{a}「{b}がいなければ、私はとっくにいなかった｜＝｜{b}がいなければ、私はとっくにいませんでした」――{a}は迷わず、外へ出る支度を始めた。'),
bossA:L('{a}は、散り散りになった部下のことを考えていた。{a}「{b}を探す。部下を置いて、上の人間だけ逃げるわけにはいかない｜＝｜{b}を探します。部下を置いて、上の人間だけ逃げるわけにはいきません」|{a}は{b}の仕事ぶりを思い出した。几帳面で、無理をする部下だった。{a}は黙って装備を確かめた。'),
bossB:L('{a}は、{b}の指示がない心細さに気づいた。いつも先頭にいた背中が、今はどこにもない。{a}「{b}を探しに行く｜＝｜{b}を探しに行きます」|{a}「{b}は、きっと誰かをかばって無茶をしてる｜{b}は、きっと誰かをかばって無茶をしている｜{b}は、きっと誰かをかばって無茶をしています」――{a}は、上司の性分をよく知っていた。'),
worship:L('{a}にとって、{b}のいない世界には何の意味もなかった。{a}「{b}を探す。{b}のためなら、この身がどうなってもいい｜＝｜{b}を探します。{b}のためなら、この身がどうなっても構いません」|{a}は祈るように手を組み、{b}の名前を唱えた。それから、群れのうろつく通りへ迷わず踏み出した。|{a}「{b}が生きている限り、私も生きる。だから、探す｜＝｜{b}が生きている限り、私も生きます。だから、探します」――{a}の目には、もう{b}しか映っていなかった。'),
worshipped:L('{a}は、いつもそばにいた{b}の姿がないことに、思いのほか動揺していた。{a}「……{b}を探しに行く｜＝｜……{b}を探しに行きます」|{a}は、{b}がいつも自分の後ろを歩いていたことを思い出した。振り返っても、そこには誰もいなかった。'),
yan:L('{a}は、{b}が自分の目の届かないところにいることが、何より耐えられなかった。{a}「{b}を見つける。誰より先に｜＝｜誰より先に、{b}を見つけます」|{a}は爪を噛みながら、地図の上の{b}がいそうな場所に印をつけた。印は、街じゅうに増えていった。'),
crush:L('{a}は、{b}に想いを伝えないまま離ればなれになったことを悔やんでいた。{a}「{b}を探す。言いたいことが、まだ残ってる｜{b}を探す。言いたいことが、まだ残っている｜{b}を探します。言いたいことが、まだ残っています」|{a}は{b}の声を思い出して、胸を押さえた。会えないまま終わるのは、嫌だった。'),
best:L('{a}には、{b}がどこで踏ん張っているか、手に取るように分かる気がした。{a}「{b}を迎えに行く。一人にはさせない｜＝｜{b}を迎えに行きます。一人にはさせません」|{a}「{b}が死ぬわけがない。……だから、探しに行く｜＝｜{b}が死ぬわけがありません。……だから、探しに行きます」'),
classmate:L('{a}は、学生のころ同じクラスだった{b}の顔を思い出した。あの頃の仲間で、生きていると信じられるのは{b}だけだった。{a}「{b}を探す｜＝｜{b}を探します」|{a}は、教室の窓際で{b}と話した放課後を思い出していた。{a}「{b}を見つけて、あの頃の話をしたい｜＝｜{b}を見つけて、あの頃の話をしたいです」'),
colleague:L('{a}は、同じ職場の{b}のことを考えていた。{a}「{b}を探す。仕事仲間を見捨てるのは、性に合わない｜＝｜{b}を探します。仕事仲間を見捨てるのは、性に合いません」|{a}は、職場で毎朝顔を合わせていた{b}を思い出した。あの挨拶が、急に恋しくなった。'),
care:L('{a}は、{b}のことが気がかりでならなかった。{a}「{b}を探しに行く｜＝｜{b}を探しに行きます」|{a}は、別れ際の{b}の顔を思い出していた。あのまま、終わりにしたくなかった。')
};
var ASK={
base:L('{a}は出会う生存者ごとに、{b}の背格好を伝えて回った。|{a}は避難所の掲示板に貼られた尋ね人の紙を、端から一枚ずつ確かめた。|{a}は壁に「{b}へ。{area}にいる｜＝｜{b}へ。{area}にいます」と書き残し、自分の名前を添えた。|{a}は崩れた交番の無線機で、{b}の名前を何度も呼びかけた。'),
worship:L('{a}はゾンビのうろつく大通りの真ん中で、{b}の名前を叫んだ。呻き声が近づいてきても、{a}は呼ぶのをやめなかった。|{a}は群れの切れ目を突っ切って、向こう側にいた生存者に{b}のことを訊きに行った。|{a}は崩れかけた建物に一人で入り、部屋という部屋をのぞいて回った。{b}がそこにいるかもしれない、それだけの理由だった。'),
yan:L('{a}は{b}の足跡らしきものを、地面に這いつくばって追った。|{a}は{b}を見かけたという生存者の肩を掴み、何度も同じことを訊き直した。|{a}は{b}が通りそうな道に、一人で夜通し立っていた。')
};
var HEARD=L('{p}で{b}を見た、という話が聞けた。{a}の顔に、ようやく血の気が戻った。|{p}の方で、{b}によく似た人を見たという噂が耳に入った。{a}はすぐに地図を広げた。');
var NOHEAR=L('{b}を見た人はいなかった。{a}は「生きてる｜生きている｜生きています」と、自分に言い聞かせた。|手がかりは何もなかった。{a}は人のいない通りを、長いあいだ見つめていた。');
var RISK=L('――叫び声に引き寄せられたゾンビが、{a}に掴みかかった。振りほどいたとき、腕にはっきりと歯形が残っていた。|――物陰から伸びてきた手が、{a}の足首を掴んだ。{a}が気づいたときには、ふくらはぎを咬まれていた。');
var HURT=L('――飛び出してきたゾンビを振り払うとき、{a}は腕を深く切った。それでも、{a}は止まらなかった。|――{a}は群れに追われて転び、膝をひどく擦りむいた。痛みより、{b}の手がかりのほうが大事だった。');
var FRET={
love:L('{a}は眠れなかった。{b}が今どこで、どんな目に遭っているのか。考えるたびに胸が潰れそうだった。|{a}は{b}の写真を何度も見返した。画面が暗くなるたび、また明かりをつけた。電池が減っていくのも構わなかった。|{a}「{b}、どこにいるの｜{b}、どこにいる｜{b}、どこにいるんですか」――つぶやいた声は、夜の呻き声にかき消された。'),
fam:L('{a}は{b}の好物の缶詰を見つけて、鞄にしまった。会えたら渡す。そう決めておかないと、立っていられなかった。|{a}「どこにいるんだ、{b}｜＝｜{b}、どこにいるんですか」――つぶやいた声は、夜の呻き声にかき消された。|{a}は、{b}がまだ小さかったころの顔ばかり思い出していた。いまの{b}がどこにいるのか、誰も知らなかった。'),
bene:L('{a}は、{b}に何ひとつ返せていないことばかり考えていた。このまま会えなかったら――その先は、考えたくなかった。|{a}は{b}にもらった言葉を、口の中で何度も繰り返した。そうしていないと、焦りで叫び出しそうだった。'),
boss:L('{a}は時計を見た。{b}と最後に言葉を交わしてから、もうずいぶん経つ。{a}「……遅い｜＝｜……遅いです」|{a}は{b}ならどう動くかを考えた。考えるほど、{b}が危ない場所にいる気がしてならなかった。'),
worship:L('{a}は{b}の名前を唱え続けていた。食べることも眠ることも、もうどうでもよかった。{a}「{b}のいない朝なんて、来なくていい｜{b}のいない朝など、来なくていい｜{b}のいない朝なんて、来なくていいです」|{a}は自分の腕に爪を立てて、痛みで焦りをごまかした。{b}が見つかるまで、休むことは許されない気がした。|{a}は夜の街へ出ようとして、扉の前で止められた。{a}「{b}が待ってる。行かせて｜{b}が待っている。行かせろ｜{b}が待っています。行かせてください」――{a}は本気で、止めた手を振りほどこうとした。'),
yan:L('{a}は、{b}が自分以外の誰かと一緒にいるかもしれないと考えて、壁を殴った。拳から血がにじんでも、{a}は気づかなかった。|{a}は{b}の名前を、手帳の端から端まで書き連ねていた。|{a}「{b}は私のことを待ってる。待ってるに決まってる｜{b}は私のことを待っている。待っているに決まっている｜{b}は私のことを待っています。待っているに決まっています」――{a}は誰に言うでもなく、同じ言葉を繰り返した。'),
friend:L('{a}は{b}のことを考えて、何度も通りの向こうに目をやった。|{a}「{b}なら、きっと大丈夫だ｜＝｜{b}なら、きっと大丈夫です」――そう言いながら、{a}の足はそわそわと落ち着かなかった。')
};
var FOUND={
love:L('{a}はついに{b}を見つけた。走り寄って抱きしめると、{b}の体温が確かにそこにあった。{a}「探した。……もう離れない｜＝｜探しました。……もう離れません」|{a}は{area}で{b}の背中を見つけて、名前を叫んだ。振り向いた{b}の顔を見た瞬間、{a}の膝から力が抜けた。'),
fam:L('{a}は{area}で{b}の姿を見つけて、その場に崩れ落ちそうになった。{a}「よかった……本当に、よかった｜＝｜よかった……本当に、よかったです」――{a}は{b}の手を握って離さなかった。|{a}は{area}で{b}を見つけるなり、全身に傷がないか確かめた。{a}「探したんだよ。……無事でよかった｜探したんだぞ。……無事でよかった｜探したんですよ。……無事でよかったです」'),
bene:L('{a}は{area}で{b}を見つけた。{a}「やっと会えた。今度は、私が力になる番だ｜＝｜やっと会えました。今度は、私が力になる番です」|{a}は{area}で{b}の無事な姿を見て、深く頭を下げた。顔を上げたとき、{a}の目は赤くなっていた。'),
boss:L('{a}は{area}で{b}と合流した。{a}「無事？｜無事か｜ご無事ですか」――短い言葉に、探し回った時間の重さがこもっていた。|{a}は{area}で{b}を見つけて、大きく息を吐いた。{a}「よかった。……本当に、よかった｜＝｜よかった。……本当に、よかったです」'),
worship:L('{a}は{area}で{b}を見つけた瞬間、膝をついた。{a}「{b}……生きていてくれた｜＝｜{b}……生きていてくれたんですね」――{a}は{b}の足元で、子どものように泣いた。|{a}は{b}の姿を見つけて、震える手を伸ばした。触れていいのか分からず、指先は{b}の袖の手前で止まった。{a}「探したよ。ずっと｜探した。ずっと｜ずっと、探していました」'),
yan:L('{a}は{area}で{b}を見つけると、腕を掴んで引き寄せた。{a}「どこに行ってたの。……もう、目を離さない｜どこに行っていた。……もう、目を離さない｜どこに行っていたんですか。……もう、目を離しません」|{a}は{b}の顔を両手で挟んで、何度も確かめた。{a}「本物だ。{b}だ。……もう、どこにも行かせない｜＝｜本物です。{b}です。……もう、どこにも行かせません」'),
friend:L('{a}は{area}で{b}を見つけて、大きく手を振った。{a}「やっと見つけた！｜＝｜やっと見つけました！」|{a}は{area}で{b}の肩を叩いた。{a}「探したよ。生きててよかった｜探したぞ。生きていてよかった｜探しましたよ。生きていてよかったです」')
};
var WB_RE={
'':L('{b}は、自分を探し回っていたという{a}の話に、目を丸くした。'),
accept:L('{b}は{a}の頭にそっと手を置いた。{b}「よく来た。……ありがとう｜よく来た。……礼を言う｜よく来てくれました。……ありがとうございます」'),
confused:L('{b}は困ったように目をそらした。{b}「そこまでしなくても……｜＝｜そこまでしなくても、いいんですよ」――それでも{a}は、{b}の無事を喜び続けていた。'),
dominate:L('{b}は足元の{a}を見下ろした。{b}「遅い。……まあいいや、ついてきて｜遅い。……まあいい、ついてこい｜遅いです。……まあいいでしょう、ついてきてください」――{a}は、それだけで救われたような顔をした。'),
cherish:L('{b}は{a}を立たせて、まっすぐ目を見た。{b}「探してくれてありがとう。{a}も、無事でよかった｜探してくれて感謝する。{a}も、無事でよかった｜探してくれてありがとうございます。{a}も、無事でよかったです」')
};
var SOUGHT={
base:L('{a}は、ずっと{b}を探して街を歩き回っていた。|{a}は、{b}を探して、いくつものエリアを越えてきたのだった。'),
worship:L('{a}は群れのいる通りを何度も越えて、{b}を探し続けてきたのだった。服は破れ、腕には擦り傷がいくつもあった。|{a}は、{b}を探すために、危険と言われる場所ばかりを選んで歩いてきた。'),
yan:L('{a}は、{b}のいそうな場所を一つ残らず回ってきたのだった。その目は、少し血走っていた。')
};
var LOST={
dead:L('{a}は、探していた{b}がもういないと知った。足元が崩れていくようだった。|{a}は、{b}がもうこの世にいないと聞いた。握りしめていた地図が、手から落ちた。'),
deadW:L('{a}は、{b}がもうこの世にいないと知った。{a}は何も言わなかった。祈る言葉も、もう出てこなかった。'),
deadY:L('{a}は、{b}がもうこの世にいないと知った。{a}「嘘。{b}は私を置いていかない｜嘘だ。{b}は私を置いていかない｜嘘です。{b}は私を置いていきません」――{a}は笑おうとして、うまく笑えなかった。'),
out:L('{a}は、{b}がすでに街を出たと知った。安堵と寂しさが、同時に押し寄せた。|{a}は、{b}が救助されて街を離れたと聞いた。{a}「……そっか。よかった｜……そうか。よかった｜……そうですか。よかったです」')
};
function goalObj(T){return{id:'seek',label:T.name+'を探す',bias:{help:1.15,bond:1.2,solo:1.1}};}
function goalText(a,from){return a.name+'の目標が変わった：「'+from+'」→「'+a.goal.label+'」';}
function protectGoal(){return scen.goals.filter(function(g){return g.id==='protect';})[0];}
function target(ctx,a){return a.goal&&a.goal.id==='seek'&&a.z.skT!=null?ctx.chars[a.z.skT]:null;}
Z.seekTarget=target;
Z.seekBold=function(ctx,a){var T=target(ctx,a);return!!(T&&bold(kind(ctx,a,T)));};
function urge(ctx,a,o){
var d=depth(ctx,a,o),k=kind(ctx,a,o);
var p=HK.clamp((d-52)/220,0,0.35);
if(!p)return{p:0,d:d,k:k};
p*=0.7+(a.tr.warmth||0.5)*0.6;
p*=1-(a.tr.cold||0)*0.4;
if(bold(k))p*=2.2;
else if(k==='lover'||k==='parent'||k==='child')p*=1.25;
else if(k==='beneB')p*=1.2;
if(a.action&&a.action.id==='seek')p*=1.4;
if(a.goal.id==='chaos')p*=0.4;
if((a.z.skQuit||{})[o.i]!=null&&ctx.stepIndex-a.z.skQuit[o.i]<8)p*=0.2;
return{p:Math.min(0.9,p),d:d,k:k};
}
function eligible(ctx,a){
if(!free(a)|| !a.goal)return false;
var g=a.goal.id;
if(g==='seek'||g==='obsess')return false;
return true;
}
function pickT(ctx,a){
var best=null;
ctx.chars.forEach(function(o){
if(o===a|| !present(o)||o.z.area===a.z.area)return;
if(a.goal.id==='protect'&&a.focus===o)return;
if(a.goal.id==='family'&&a.z.family&&a.z.family.pc===o.i)return;
var u=urge(ctx,a,o);
if(u.p>0&&(!best||u.d>best.d)){best=u;best.o=o;}
});
return best;
}
function start(ctx,a,u){
var T=u.o,from=a.goal.label;
a.z.skPrev=a.goal;a.z.skT=T.i;a.z.skKnow=null;a.z.skAt=ctx.stepIndex;a.z.skFret=ctx.stepIndex;a.z.skFrets=0;a.z.skK=u.k;
a.goal=goalObj(T);a.goalHist=(a.goalHist||[]).concat([a.goal]);
a.z.skCount=(a.z.skCount||0)+1;
ctx.stress(a,bold(u.k)?10:5);
var m={a:a.name,b:T.name,area:Z.an(ctx,a.z.area)};
ctx.act2({actors:[a,T],cat:'solo',text:ctx.t(fill(ctx.pick(GO[u.k]||GO.care),m),a,T)+goalText(a,from),
why:a.name+'にとって'+T.name+'は'+kn(ctx,u.k,a,T)+'（関係の深さ '+Math.round(u.d)+'）。別の場所にいて、まだ会えていない'+(bold(u.k)?'／'+(u.k==='worship'?'信仰':'執着')+'する側は、危険を顧みずに探しに行く':''),mag:14+(bold(u.k)?6:0)});
}
function done(ctx,a,T,how){
var from=a.goal.label,k=a.z.skK||kind(ctx,a,T);
if(how==='found'){var P=protectGoal();a.goal=P||a.z.skPrev;a.focus=T;}
else{a.goal=a.z.skPrev||scen.goals[0];if(how==='quit')(a.z.skQuit=a.z.skQuit||{})[T.i]=ctx.stepIndex;}
a.goalHist=(a.goalHist||[]).concat([a.goal.id||a.goal]);
a.z.skT=null;a.z.skKnow=null;
return goalText(a,from);
}
function foundText(ctx,a,T){
var k=a.z.skK||kind(ctx,a,T),g=GROUP[k]||'friend',m={a:a.name,b:T.name,area:Z.an(ctx,a.z.area)};
var t=ctx.t(fill(ctx.pick(FOUND[g]),m),a,T);
if(k==='worship'){var wt=HK.Ties.from(ctx,a,T,'worship'),re=WB_RE[(wt&&wt.cold)||'']||WB_RE[''];t+=ctx.t(fill(ctx.pick(re),m),a,T);}
return t;
}
function foundFx(ctx,a,T,k){
ctx.mod2(a,T,{aff:6,trust:5},{aff:bold(k)?3:6,trust:5});
if(k==='yan')ctx.mod(a,T,{att:4});
a.stress=Math.max(0,a.stress-(bold(k)?30:20));
}
Z.seekMet=function(ctx,a,b){
var out={pre:'',post:'',who:[]};
[[a,b],[b,a]].forEach(function(p){
var s=p[0],T=p[1];
if(target(ctx,s)!==T)return;
var k=s.z.skK||kind(ctx,s,T),m={a:s.name,b:T.name};
out.pre+=fill(ctx.pick(SOUGHT[k]||SOUGHT.base),m);
foundFx(ctx,s,T,k);
out.post+=done(ctx,s,T,'found');
out.who.push(s.name+'は'+T.name+'（'+kn(ctx,k,s,T)+'）を探していた');
});
return out.who.length?out:null;
};
EV.push({
id:'zs_ask',cat:'solo',scope:'solo',noOdd:true,pri:true,
when:function(ctx,a){var T=target(ctx,a);return!!(T&&present(T)&&free(a)&&T.z.area!==a.z.area&&(a.z.skKnow==null||a.z.skKnow===a.z.area));},
w:function(ctx,a){return 3+(Z.seekBold(ctx,a)?2:0);},
run:function(ctx,a){
var T=target(ctx,a),rng=ctx.rng,k=a.z.skK,A=ctx.zb.A[a.z.area];
var hit=rng()<(bold(k)?0.8:0.7),wrong=hit&&rng()<ctx.env.rumor/100*0.5;
var m={a:a.name,b:T.name,area:A.name};
var t=ctx.t(fill(ctx.pick(ASK[k]||ASK.base),m),a,T),why=a.name+'の目標「'+a.goal.label+'」。';
var risky=bold(k)&&A.z>25;
if(risky){
A.z=Math.min(100,A.z+3);
var rb=rng();
if(rb<A.z/100*0.12){t+=fill(ctx.pick(RISK),m);Z.infect(ctx,a,'horde',true);why+='危険を顧みずに探し回り、咬まれた（'+A.name+'のゾンビの多さ '+Math.round(A.z)+'）';ctx.stress(a,6);return{text:t,why:why,mag:30};}
if(rb<A.z/100*0.45){a.hp-=6+rng.int(8);if(a.z.wound<0)a.z.wound=ctx.stepIndex;t+=fill(ctx.pick(HURT),m);why+='危険を顧みずに探し回って、けがをした／';}
}
if(hit){
var cand=Z.adj(T.z.area).filter(function(x){return x!==a.z.area;});
var p=wrong&&cand.length?rng.pick(cand):T.z.area;
a.z.skKnow=p;
t+=ctx.t(fill(ctx.pick(HEARD),m).replace(/\{p\}/g,ctx.zb.A[p].name),a,T);
}else t+=ctx.t(fill(ctx.pick(NOHEAR),m),a,T);
ctx.stress(a,3);
return{text:t,why:why+'噂を聞き回った'+(hit?(wrong?'（デマ：情報の錯綜 '+ctx.env.rumor+'）':'（本当の情報）'):'（手がかりなし）'),mag:10};
}
});
Z.seekDest=function(ctx,c){
var T=target(ctx,c);
if(!T|| !present(T))return null;
if(c.z.skKnow!=null&&c.z.skKnow!==c.z.area)return c.z.skKnow;
var adj=Z.adj(c.z.area),seen=function(x){return c.z.path.filter(function(p){return p===x;}).length;};
return adj.slice().sort(function(x,y){return seen(x)-seen(y)||((x+ctx.stepIndex+c.i)%3)-((y+ctx.stepIndex+c.i)%3);})[0];
};
function tick(ctx,s,n){
if(s>=n-1)return;
var shown=0;
ctx.chars.forEach(function(a){
if(!a.alive||a.out|| !a.z)return;
var T=target(ctx,a);
if(T){
var k=a.z.skK||kind(ctx,a,T),m={a:a.name,b:T.name};
if(!T.alive||T.out){
var lt= !T.alive?(k==='worship'?LOST.deadW:k==='yan'?LOST.deadY:LOST.dead):LOST.out;
if(!T.alive)ctx.stress(a,bold(k)?30:20);
var tx=ctx.t(fill(ctx.pick(lt),m),a,T);
ctx.act2({actors:[a],cat:'solo',text:tx+done(ctx,a,T,'lost'),why:'探していた'+T.name+'に、もう会えない',mag:20});
return;
}
if(!free(a))return;
if(T.z.area===a.z.area&& !T.z.alone){
foundFx(ctx,a,T,k);
var ft=foundText(ctx,a,T);
ctx.act2({actors:[a,T],cat:'bond',text:ft+done(ctx,a,T,'found'),why:a.name+'は'+kn(ctx,k,a,T)+'の'+T.name+'を探し続けていた（探し始めてから '+(ctx.stepIndex-a.z.skAt)+' 区切り）。ようやく会えた',mag:22});
return;
}
if(a.z.skKnow!=null&&a.z.skKnow!==T.z.area&&ctx.rng()<0.35)a.z.skKnow=T.z.area;
var gap=bold(k)?2:3;
if(ctx.stepIndex-a.z.skFret>=gap&&shown<3&&ctx.rng()<0.7){
shown++;
a.z.skFret=ctx.stepIndex;a.z.skFrets++;
ctx.stress(a,bold(k)?9:5);
var g=GROUP[k]||'friend';
ctx.act2({actors:[a],cat:'solo',text:ctx.t(fill(ctx.pick(FRET[g]),m),a,T),why:a.name+'は'+T.name+'を探しているが、まだ見つからない（'+(ctx.stepIndex-a.z.skAt)+' 区切り）'+(bold(k)?'。焦りは日ごとに深くなる':''),mag:10+(bold(k)?4:0)});
if(!bold(k)&&a.z.skFrets>=3&&depth(ctx,a,T)<80&&ctx.rng()<0.4){
ctx.act2({actors:[a],cat:'solo',text:ctx.t(fill('{a}は、{b}を探すのをいったんやめることにした。{a}「生きていれば、きっとどこかで会える｜＝｜生きていれば、きっとどこかで会えます」',m),a,T)+done(ctx,a,T,'quit'),why:'探しても見つからず、区切りをつけた（関係の深さ '+Math.round(depth(ctx,a,T))+'）',mag:10});
}
}
return;
}
if(s<0|| !eligible(ctx,a))return;
var u=pickT(ctx,a);
if(u&&ctx.rng()<u.p)start(ctx,a,u);
});
}
var af0=scen.after;
scen.after=function(ctx,s,n){var r=af0?af0.apply(this,arguments):undefined;tick(ctx,s,n);ctx.flush();return r;};
})();
});
;
/* ==== js/zombie-bonds.js ==== */
HK.Load.def(150,'js/zombie-bonds.js',function(){
(function(){
'use strict';
var HK=window.HK,Z=HK.ZB,RK=HK.RelKit;
if(!Z|| !Z.scen|| !RK)return;
var EV=Z.scen.events,L=RK.L;
function fill(t,m){return String(t).replace(/\{(\w+)\}/g,function(x,k){return m[k]!=null?m[k]:x;});}
function tie(ctx,a,b,type){return HK.Ties&&HK.Ties.has(ctx,a,b,type);}
function ok(c){return c&&c.alive&& !c.out&&c.z&& !c.z.alone;}
function loveOk(ctx,x,y,t){
if(!HK.canLove|| !HK.canLove(x,y)|| !HK.canLove(y,x))return false;
if(!ctx.romanceOk([x,y])||RK.noRomance(ctx,x,y))return false;
if(t&&HK.tieOptNoLove&&HK.tieOptNoLove(t))return false;
if(HK.lockOut(x,y)||HK.lockOut(y,x))return false;
return true;
}
function grown(ctx,a,b,aff,trust){return ctx.R(a,b).aff>aff&&ctx.R(b,a).aff>aff&&ctx.R(a,b).trust>trust&&ctx.R(b,a).trust>trust;}
function loveP(ctx,a,b,before){var m=Math.max(ctx.R(a,b).att,ctx.R(b,a).att);return(before?0.4:0.12)+HK.clamp(m/100,0,0.4);}
function att(ctx,a,b,v){return ctx.R(a,b).att>v||ctx.R(b,a).att>v;}
var T={
cm:{
pat:L('{a}と{b}は、見張りの合間に学生のころの話をした。誰が何をやらかしたか、二人ともよく覚えていた。|{a}は{b}に、同じクラスだった誰かの名前を挙げて「生きてると思う？｜生きていると思うか｜生きていると思いますか」と訊いた。{b}は少し黙ってから、「生きてる｜生きている｜生きています」と答えた。|{a}「学生のころ、避難訓練なんて真面目にやってなかったな｜学生のころ、避難訓練など真面目にやっていなかったな｜学生のころ、避難訓練なんて真面目にやっていませんでした」――{b}は「今なら満点が取れる｜＝｜今なら満点が取れます」と笑った。'),
keep:L('{a}は{b}の分の水を、黙って取り分けておいた。学生のころ、弁当を分け合ったのと同じ手つきだった。|{a}と{b}は、昔の席順みたいに並んで眠った。どちらかが寝返りを打つたび、もう一人が目を開けて確かめた。|{a}は、{b}が学生のころから暗い場所を苦手にしていたのを覚えていた。夜の見回りは、いつも{a}が先に立った。'),
grow:L('{a}は{b}に、学生のころ言えなかったことを打ち明けた。{a}「本当は、もっと{b}と話したかった｜＝｜本当は、もっと{b}と話したかったです」――{b}は驚いた顔をしてから、「同じことを思ってた｜同じことを思っていた｜同じことを思っていました」と言った。|{a}と{b}は、卒業してからの年月を埋めるように話し続けた。気づけば、学生のころより近くにいた。'),
love:L('{a}は{b}の横顔を見ながら、学生のころの淡い気持ちを思い出していた。あの頃は言えなかった。{a}「……今なら、言ってもいいかな｜……今なら、言ってもいいだろうか｜……今なら、言ってもいいでしょうか」――{b}は答える代わりに、{a}の手を握った。|{a}と{b}は、昔話の途中で黙り込んだ。目が合ったまま、どちらも視線を外さなかった。同級生のままでいるには、二人とも近づきすぎていた。')
},
co:{
pat:L('{a}と{b}は、職場の当番表みたいに見張りの順番を決めた。決めるのに一分もかからなかった。|{a}は物資の数を数えて、{b}に伝えた。{b}「了解。じゃあ明日の分はこう割り振る｜了解した。では明日の分はこう割り振る｜承知しました。では明日の分はこう割り振ります」――仕事の打ち合わせと、何も変わらなかった。|{a}「職場の誰が一番うまく生き延びてると思う？｜職場の誰が一番うまく生き延びていると思うか｜職場の誰が一番うまく生き延びていると思いますか」――{b}は即答で、同じ名前を挙げた。'),
keep:L('{a}は疲れきった{b}の見張りを、黙って代わった。{a}「貸しにしとく｜貸しにしておく｜貸しにしておきます」――職場でよく交わした言葉だった。|{a}と{b}は、残り少ない食料をきっちり半分にした。どちらも相手の分を多くしようとして、少し揉めた。'),
grow:L('{a}は{b}に、職場では見せたことのない弱音をこぼした。{b}は笑わずに聞いて、{a}の肩に手を置いた。仕事仲間という言葉では、もう足りなかった。|{a}と{b}は、仕事の話をしなくなった。代わりに、子どものころの話や、本当にやりたかったことを話した。'),
love:L('{a}は、職場で毎日見ていたはずの{b}の顔を、初めて見るような気がした。{a}「仕事のときより、今の{b}のほうがいい｜＝｜仕事のときより、今の{b}のほうがいいです」――言ってから、{a}は自分の言葉に赤くなった。|{a}と{b}は、肩を寄せ合って夜を越した。同僚の距離では、もう眠れなかった。')
},
boss:{
patA:L('{a}は{b}に短く指示を出した。{a}「右の通路を確認して。三分で戻って｜右の通路を確認。三分で戻れ｜右の通路を確認してください。三分で戻ってください」――{b}は返事より先に動いていた。|{a}は{b}の報告を聞きながら、地図に印を足していった。職場でも、この街でも、二人のやり方は変わらなかった。|{a}は、{b}の顔色が悪いことに気づいて、何も言わずに休憩を指示した。'),
patB:L('{b}は{a}の指示を待たずに、次に要るものを用意していた。長年の仕事で身についた癖だった。|{b}は{a}の背中を見ながら歩いた。どんな現場でも、この背中についていけば何とかなる。そう思わせる上司だった。|{b}「{a}、物資の残りは三日分｜{a}、物資の残りは三日分だ｜{a}、物資の残りは三日分です」――報告を受けた{a}は、小さくうなずいた。'),
keepA:L('{a}は自分の分の食料を、さりげなく{b}の側に寄せた。{a}「上の人間は、腹が減っても平気なもんだよ｜上の人間は、腹が減っても平気なものだ｜上の人間は、お腹が空いても平気なものです」|{a}は夜中に起き出して、{b}の毛布をかけ直した。職場では、決して見せない顔だった。'),
keepB:L('{b}は{a}の手の傷に気づいて、黙って手当てをした。{a}「大げさだよ｜大げさだ｜大げさです」――{b}「上司に倒れられたら困る｜＝｜上司に倒れられたら困ります」|{b}は、{a}が無理をしすぎないよう、見張りの順番をこっそり入れ替えた。'),
grow:L('{a}は{b}に言った。{a}「もう職場じゃない。上も下もない｜もう職場ではない。上も下もない｜もう職場ではありません。上も下もありません」――{b}は少し迷ってから、初めて{a}を肩書きなしで呼んだ。|{b}が{a}の判断に、初めて真っ向から異を唱えた。{a}は黙って聞き、それから{b}の案を採った。{a}「{b}のほうが正しい｜＝｜{b}のほうが正しいです」――二人のあいだで、何かが変わった。|{a}と{b}は、職場では一度もしなかった話をした。仕事を離れたら、二人はこんなにも話が合った。'),
love:L('{a}は{b}を見つめて、言葉を探した。{a}「部下として見られなくなった。……困ったことに｜＝｜困ったことに……部下として見られなくなりました」――{b}は笑って、{a}の手を取った。|{b}は{a}の肩にもたれた。{a}は払いのけなかった。職場の外で、二人はただの二人になっていた。')
},
ws:{
patA:L('{a}は自分の食料を削って、{b}の分を多くした。{a}「{b}が食べてくれれば、それでいい｜＝｜{b}が食べてくれれば、それでいいんです」|{a}は夜通し、{b}の眠る部屋の前に座って見張りを続けた。誰に頼まれたわけでもなかった。|{a}は{b}の言葉を、一言も聞き漏らすまいとしていた。{b}が何気なく言ったことまで、{a}は大切に覚えていた。|{a}は手に入れたばかりの武器を、{b}に差し出した。{a}「{b}が持っているほうが、私は安心できる｜＝｜{b}が持っているほうが、私は安心できます」'),
patB:{
'':L('{b}は、なぜか自分の荷物がいつも整っていることに首をかしげた。{a}が毎晩直していることには、まだ気づいていなかった。|{b}は{a}がいつも近くにいることを、ただの偶然だと思っていた。'),
accept:L('{b}は{a}の差し出した水を、礼を言って受け取った。{a}はそれだけで、満ち足りた顔をした。|{b}は{a}の献身を、静かに受け入れていた。{b}「{a}がいてくれて、助かってる｜{a}がいてくれて、助かっている｜{a}がいてくれて、助かっています」'),
confused:L('{b}は、また自分の分だけ多い食料を見て、困った顔をした。{b}「{a}、こういうのはやめてほしい｜{a}、こういうことはやめてくれ｜{a}、こういうのはやめてください」――{a}は笑って首を振るだけだった。|{b}は{a}の視線の重さに、ときどき息苦しさを覚えた。それでも、{a}を突き放すことはできなかった。'),
dominate:L('{b}は{a}に、一番危ない見回りを命じた。{a}は迷わずうなずいた。{b}にとって{a}は、都合のいい駒だった。|{b}は{a}の持ってきた食料を、礼も言わずに取り上げた。{a}はそれを、当然のことのように見ていた。'),
cherish:L('{b}は{a}の分の食料を、{a}の前に押し戻した。{b}「{a}も食べて。私のために倒れられたら、困る｜{a}も食べろ。私のために倒れられたら、困る｜{a}も食べてください。私のために倒れられたら、困ります」|{b}は、自分を守ろうとする{a}の手を握った。{b}「{a}が無事でいることが、私には一番大事だ｜＝｜{a}が無事でいることが、私には一番大事です」')
},
keep:L('{a}は{b}の靴紐を結び直し、上着のほつれを繕った。{b}が気づく前に、すべて済ませていた。|{a}は{b}が眠りにつくまで、そばで祈るように手を組んでいた。|{a}は{b}の通る道の瓦礫を、先回りして片付けておいた。'),
love:L('{b}は、自分を崇めるように見つめる{a}の頬に、そっと手を添えた。{b}「{a}、崇めるんじゃなくて、隣にいてほしい｜{a}、崇めるのではなく、隣にいてほしい｜{a}、崇めるのではなく、隣にいてください」――{a}は信じられないという顔で、{b}の手に自分の手を重ねた。|{a}は{b}の前でひざまずこうとして、{b}に引き止められた。{b}は{a}を立たせて、そのまま抱き寄せた。崇拝は、ゆっくりと恋に変わっていった。'),
dominate:L('{b}は{a}に命じた。{b}「私以外の言うことは聞くな｜＝｜私以外の言うことは聞かないでください」――{a}は迷わずうなずいた。その従順さに、{b}は満足そうに笑った。|{b}は{a}の忠誠を試すように、無理な命令を重ねた。{a}はひとつも拒まなかった。支配と服従は、日ごとに深くなっていった。'),
cherish:L('{b}は{a}に、自分のために命を投げ出すようなことはしないでほしいと頼んだ。{a}は長いあいだ黙っていたが、やがて小さくうなずいた。{a}「{b}が望むなら、生きる｜＝｜{b}が望むなら、生きます」|{b}は{a}と並んで座り、自分の弱さを打ち明けた。{a}は初めて、{b}をただの人として見た。それでも、想いは少しも揺らがなかった。'),
confused:L('{b}は{a}を突き放そうとした。{b}「私は、{a}が思うような人間じゃない｜私は、{a}が思うような人間ではない｜私は、{a}が思うような人間ではありません」――{a}は首を振った。{a}「それでも、{b}は私の光だ｜＝｜それでも、{b}は私の光です」|{b}は{a}に、自分を崇めるのはやめてほしいと言った。{a}は静かに聞いてから、それでもいつもと同じように{b}の水を汲んできた。'),
grow:L('{a}は{b}を守るためなら、何でもすると誓った。{b}は困ったように笑ったが、その誓いを拒まなかった。|{a}は{b}の役に立てた日には、眠る前に小さく祈った。{a}にとって、{b}のそばにいることが信仰そのものだった。'),
firm:L('{b}に冷たく突き放されても、{a}の想いは少しも揺らがなかった。{a}「{b}がどう思っていてもいい。私は、{b}を信じている｜＝｜{b}がどう思っていても構いません。私は、{b}を信じています」|{a}は{b}に怒鳴られても、黙って頭を下げた。そして次の朝も、いつもと同じように{b}の分の水を汲んできた。'),
firmBait:L('{b}に囮にされたことを、{a}は少しも恨んでいなかった。{a}「{b}の役に立てたなら、それでいい｜＝｜{b}の役に立てたなら、それでいいんです」――その言葉に、嘘はひとつもなかった。|{a}は群れに咬まれかけた腕をさすりながら、{b}の隣に戻った。{a}「次も、{b}のためなら行く｜＝｜次も、{b}のためなら行きます」')
},
bn:{
patA:L('{a}は{b}の様子を、何かと気にかけていた。{a}「無理はしないで。せっかく拾った命なんだから｜無理はするな。せっかく拾った命だ｜無理はしないでください。せっかく拾った命です」|{a}は{b}に、生き延びるための知恵を一つずつ教えた。かつて{b}を助けた日と同じように。'),
patB:L('{b}は{a}の荷物を、当然のように自分が背負った。{b}「{a}に受けた恩に比べれば、こんなもの｜{a}に受けた恩に比べれば、こんなものは何でもない｜{a}に受けた恩に比べれば、こんなもの何でもありません」|{b}は、{a}が少しでも休めるよう、見張りを率先して引き受けた。|{b}は{a}の好みを覚えていて、見つけた食料の中から{a}の好きなものを取り分けた。'),
keep:L('{a}「もう恩は返してもらったよ｜もう恩は返してもらった｜もう恩は返してもらいました」――{b}は首を振った。{b}「まだ、全然足りない｜まだ、まったく足りない｜まだ、全然足りません」|{b}が差し出した缶詰を、{a}は半分だけ受け取った。{a}「残りは{b}が食べる。それが、私への恩返しだ｜＝｜残りは{b}が食べてください。それが、私への恩返しです」'),
grow:L('{b}は{a}が群れに囲まれかけたとき、迷わず飛び込んで{a}を引きずり出した。{b}「あの日の借りを、ようやく返せた｜＝｜あの日の借りを、ようやく返せました」――{a}は息を切らしながら、{b}の肩を抱いた。|{b}は、熱を出した{a}を一晩じゅう看病した。{a}が目を開けると、{b}は泣き笑いの顔をしていた。{b}「今度は、私が助ける番だった｜＝｜今度は、私が助ける番でした」|{a}は{b}に言った。{a}「もう、恩人と恩を受けた側じゃない。対等な仲間だ｜もう、恩人と恩を受けた側ではない。対等な仲間だ｜もう、恩人と恩を受けた側ではありません。対等な仲間です」――{b}は少し迷ってから、その言葉を受け取った。'),
love:L('{b}は、感謝だけでは説明のつかない気持ちに気づいていた。{b}「{a}のそばにいたいのは、恩のためだけじゃない｜{a}のそばにいたいのは、恩のためだけではない｜{a}のそばにいたいのは、恩のためだけではありません」――{a}は、驚いたように{b}を見つめ返した。|{a}は、恩を返そうと必死な{b}の手を止めた。{a}「もういい。恩じゃなくて、{b}自身にそばにいてほしい｜もういい。恩ではなく、{b}自身にそばにいてほしい｜もういいんです。恩ではなく、{b}自身にそばにいてほしいんです」')
},
rl:{
pat:L('{a}と{b}は、親戚の誰がどこにいるはずだったかを指折り数えた。半分も数えないうちに、二人とも黙り込んだ。|{a}「祖母の家のほう、無事だと思う？｜祖母の家のほうは、無事だと思うか｜祖母の家のほうは、無事だと思いますか」――{b}は答えられずに、遠くの煙を見つめた。|{a}と{b}は、最後に親族みんなで集まった日の話をした。誰が何を持ってきて、誰が酔いつぶれたか。笑っているうちに、二人とも目が赤くなった。'),
fam:L('{a}は{b}に、{f}の消息を尋ねた。{b}も同じことを訊こうとしていた。親族どうし、案じている顔は同じだった。|{a}は、{f}と最後に連絡が取れたときのことを{b}に話した。{b}は黙って聞いて、{a}の肩を抱いた。'),
keep:L('{a}は{b}の擦り傷に、子どものころのように絆創膏を貼ってやった。{b}「いつまで子ども扱いする気？｜いつまで子ども扱いする気だ｜いつまで子ども扱いするつもりですか」――そう言いながら、{b}は嬉しそうだった。|{a}と{b}は、親族の誰かに会えたときのために、伝言を書いて壁に貼った。二人の名前を、並べて書いた。'),
grow:L('{a}は{b}に言った。{a}「親戚なんて、年に一度会うだけだと思ってた。……今は、{b}がいてくれてよかった｜親戚など、年に一度会うだけだと思っていた。……今は、{b}がいてくれてよかった｜親戚なんて、年に一度会うだけだと思っていました。……今は、{b}がいてくれてよかったです」――{b}は黙って、{a}の背中を叩いた。|{a}と{b}は、生き延びたら親族みんなで集まろうと約束した。誰が残っているかは分からなかった。それでも、二人は約束をやめなかった。'),
love:L('{a}は{b}を見つめて、ふと言葉を失った。親戚として見てきたはずの顔が、今は違って見えた。|{a}と{b}は、親族の誰にも言えない気持ちを抱えたまま、肩を寄せ合っていた。')
}
};
function flatEv(id,type,key,label){
EV.push({
id:id,cat:'bond',scope:'pair',
when:function(ctx,a,b){return!!tie(ctx,a,b,type)&&RK.cool(ctx,a,b,id,2);},
w:function(ctx,a,b){return 1+(a.tr.np+a.tr.fc)*0.3;},
run:function(ctx,a,b){
RK.mark(ctx,a,b,id);
var t=tie(ctx,a,b,type),rng=ctx.rng,P=T[key],pf=ctx.pair(a,b),k;
if(grown(ctx,a,b,35,30)&&RK.cool(ctx,a,b,id+'G',8)&&rng()<0.45){
RK.mark(ctx,a,b,id+'G');
k=loveOk(ctx,a,b,t)&&rng()<loveP(ctx,a,b,pf['_zb_'+key])?'love':'grow';
}else k=rng()<0.4?'keep':'pat';
if(k==='love')ctx.mod2(a,b,{att:8,aff:5},{att:8,aff:5});
else if(k==='grow'){pf['_zb_'+key]=(pf['_zb_'+key]||0)+1;var la=loveOk(ctx,a,b,t)?3:0;ctx.mod2(a,b,{aff:7,trust:8,att:la},{aff:7,trust:8,att:la});}
else if(k==='keep'){ctx.mod2(a,b,{aff:3,trust:4},{aff:3,trust:4});ctx.stress(b,-4);}
else ctx.mod2(a,b,{aff:2,trust:2},{aff:2,trust:2});
return{cat:k==='love'?'romance':k==='keep'?'help':'bond',text:ctx.t(ctx.pick(P[k]),a,b),
why:a.name+'と'+b.name+'は'+label+({pat:'',keep:'／いつもの距離で支え合う',grow:'／'+(key==='cm'?'昔話から距離が縮まった':'仕事の外で信頼が深まった')+'（好意・信頼が高い）',love:'／親しさが恋に変わった（惹かれ）'}[k])};
}
});
}
flatEv('zb_classmate','classmate','cm','同級生');
flatEv('zb_colleague','colleague','co','同僚');
EV.push({
id:'zb_boss',cat:'bond',scope:'pair',
when:function(ctx,a,b){return!!tie(ctx,a,b,'boss')&&RK.cool(ctx,a,b,'zb_boss',2);},
w:function(ctx,a,b){return 1+a.tr.cp*0.3+a.tr.np*0.2;},
run:function(ctx,a,b){
RK.mark(ctx,a,b,'zb_boss');
var t=tie(ctx,a,b,'boss'),A=ctx.chars[t.a],B=ctx.chars[t.b],rng=ctx.rng,pf=ctx.pair(A,B),k;
if(grown(ctx,A,B,30,40)&&RK.cool(ctx,A,B,'zb_bossG',8)&&rng()<0.45){
RK.mark(ctx,A,B,'zb_bossG');
k=loveOk(ctx,A,B,t)&&rng()<loveP(ctx,A,B,pf._zb_boss)?'love':'grow';
}else if(rng()<0.4)k=a===A?'keepA':'keepB';
else k=a===A?'patA':'patB';
if(k==='love')ctx.mod2(A,B,{att:8,aff:5},{att:8,aff:5});
else if(k==='grow'){pf._zb_boss=(pf._zb_boss||0)+1;var lb=loveOk(ctx,A,B,t)?3:0;ctx.mod2(A,B,{aff:6,trust:10,ten: -4,att:lb},{aff:7,trust:8,ten: -4,att:lb});}
else if(k==='keepA'){ctx.mod2(A,B,{aff:3},{trust:5,aff:3});ctx.stress(B,-5);}
else if(k==='keepB'){ctx.mod2(A,B,{trust:5,aff:3},{aff:2});A.hp=Math.min(100,A.hp+3);}
else ctx.mod2(A,B,{trust:3},{trust:4});
return{cat:k==='love'?'romance': /^keep/.test(k)?'help':'bond',text:ctx.t(ctx.pick(T.boss[k]),A,B),
why:A.name+'（上司）と'+B.name+'（部下）'+({patA:'：上司として指示を出し、部下を守る',patB:'：部下として上司を立てる',keepA:'：部下を気づかう',keepB:'：上司を支える',grow:'：職場の外で、対等な信頼に変わった（好意・信頼が高い）',love:'：上下の関係が恋に変わった（惹かれ）'}[k])};
}
});
EV.push({
id:'zb_worship',cat:'help',scope:'pair',
when:function(ctx,a,b){return!!tie(ctx,a,b,'worship')&&RK.cool(ctx,a,b,'zb_worship',2);},
w:function(ctx,a,b){var t=tie(ctx,a,b,'worship');return t.a===a.i?1.1+a.tr.ac*0.3+a.tr.np*0.2:0.6;},
run:function(ctx,a,b){
RK.mark(ctx,a,b,'zb_worship');
var t=tie(ctx,a,b,'worship'),A=ctx.chars[t.a],B=ctx.chars[t.b],rng=ctx.rng,cold=t.cold||'',pf=ctx.pair(A,B),k,txt;
var rb=ctx.R(B,A);
if((pf.zbBait&& !pf.zbBaitSeen)||((rb.ten>30||rb.aff<0||cold==='confused'||cold==='dominate')&&RK.cool(ctx,A,B,'zb_wsFirm',6)&&rng()<0.3)){
var bait=pf.zbBait&& !pf.zbBaitSeen;
if(bait)pf.zbBaitSeen=true;
RK.mark(ctx,A,B,'zb_wsFirm');
ctx.mod(A,B,{aff:3,trust:3});
ctx.stress(A,4);
return{cat:'solo',text:ctx.t(ctx.pick(bait?T.ws.firmBait:T.ws.firm),A,B),why:A.name+'は'+B.name+'を信仰している。'+(bait?'囮にされても':'冷たくされても')+'、その想いは揺らがない'};
}
if(grown(ctx,A,B,20,20)&&RK.cool(ctx,A,B,'zb_wsG',7)&&rng()<0.4){
RK.mark(ctx,A,B,'zb_wsG');
if(cold==='dominate')k='dominate';
else if(t.love==='ok'&&loveOk(ctx,A,B,t)&&rb.aff>25&&(att(ctx,A,B,6)||rb.aff>45)&&rng()<0.6)k='love';
else k=cold==='cherish'?'cherish':cold==='confused'?'confused':'grow';
}else k=rng()<0.35?'keep':a===A?'patA':'patB';
if(k==='love')ctx.mod2(A,B,{att:10,aff:4},{att:10,aff:8});
else if(k==='dominate'){pf.zbDom=(pf.zbDom||0)+1;ctx.mod2(A,B,{trust:4},{trust:5,aff: -2});ctx.stress(A,6);}
else if(k==='cherish'){ctx.mod2(A,B,{aff:5,trust:5},{aff:8,trust:6});ctx.stress(A,-10);}
else if(k==='confused'){ctx.mod2(A,B,{aff:2},{ten:4,aff:2});}
else if(k==='grow')ctx.mod2(A,B,{aff:5,trust:5},{aff:4,trust:4});
else if(k==='keep')ctx.mod2(A,B,{aff:3,trust:3},{trust:cold==='dominate'?1:3,aff:cold==='cherish'||cold==='accept'?3:1});
else if(k==='patB')ctx.mod2(A,B,{aff:2},{aff:cold==='dominate'?0:2});
else ctx.mod2(A,B,{aff:2,trust:2},{trust:2});
txt=k==='patB'?(T.ws.patB[cold]||T.ws.patB['']):T.ws[k];
return{cat:k==='love'?'romance':k==='dominate'?'conflict':k==='patB'||k==='confused'?'bond':'help',text:ctx.t(ctx.pick(txt),A,B),
why:A.name+'は'+B.name+'を信仰している'+(cold&&HK.WORSHIP_BACK&&HK.WORSHIP_BACK[cold]?'（'+B.name+'は'+HK.WORSHIP_BACK[cold].short+'）':'')+({patA:'：すべてを捧げようとする',patB:'：信仰される側から見た'+A.name,keep:'：変わらない献身',love:'：「恋愛に発展：する」の組。崇拝が恋に変わった',dominate:'：信仰を利用した支配と服従が深まった',cherish:'：大切に思う相手が、生きてほしいと願った',confused:'：重荷に感じる相手が突き放そうとしても、想いは変わらない',grow:'：献身が深まった'}[k])};
}
});
EV.push({
id:'zb_benefactor',cat:'help',scope:'pair',
when:function(ctx,a,b){return!!tie(ctx,a,b,'benefactor')&&RK.cool(ctx,a,b,'zb_bene',2);},
w:function(ctx,a,b){var t=tie(ctx,a,b,'benefactor');return t.b===a.i?1+a.tr.ac*0.3:0.7+a.tr.np*0.3;},
run:function(ctx,a,b){
RK.mark(ctx,a,b,'zb_bene');
var t=tie(ctx,a,b,'benefactor'),A=ctx.chars[t.a],B=ctx.chars[t.b],rng=ctx.rng,pf=ctx.pair(A,B),k;
var need=A.hp<70||A.stress>45||ctx.zb.A[A.z.area].z>40;
if(need&&RK.cool(ctx,A,B,'zb_beneG',7)&&rng()<0.45){
RK.mark(ctx,A,B,'zb_beneG');
k=loveOk(ctx,A,B,t)&&rng()<loveP(ctx,A,B,pf.zbRepaid)?'love':'grow';
}else k=rng()<0.35?'keep':a===A?'patA':'patB';
if(k==='love')ctx.mod2(A,B,{att:8,aff:5},{att:8,aff:5});
else if(k==='grow'){pf.zbRepaid=(pf.zbRepaid||0)+1;var lr=loveOk(ctx,A,B,t)?3:0;ctx.mod2(A,B,{aff:8,trust:10,att:lr},{aff:4,trust:6,att:lr});A.hp=Math.min(100,A.hp+6);ctx.stress(A,-8);}
else if(k==='keep')ctx.mod2(A,B,{aff:3,trust:2},{aff:3,trust:3});
else if(k==='patB'){ctx.mod2(A,B,{aff:2,trust:3},{aff:2});ctx.stress(A,-3);}
else ctx.mod2(A,B,{aff:2},{trust:3,aff:2});
return{cat:k==='love'?'romance':'help',text:ctx.t(ctx.pick(T.bn[k]),A,B),
why:A.name+'（恩人）と'+B.name+'（恩を受けた側）'+({patA:'：恩人は相手を気にかける',patB:'：恩を返そうとする',keep:'：恩は簡単には消えない',grow:'：恩返し（'+A.name+'が弱っていた／危ない場所だった）。関係が対等に近づいた',love:'：恩返しの先で、感謝が恋に変わった（惹かれ）'}[k])};
}
});
EV.push({
id:'zb_relative',cat:'bond',scope:'pair',
when:function(ctx,a,b){return!!tie(ctx,a,b,'relative')&&RK.cool(ctx,a,b,'zb_rel',2);},
w:function(ctx,a,b){return 0.8+a.tr.np*0.3;},
run:function(ctx,a,b){
RK.mark(ctx,a,b,'zb_rel');
var t=tie(ctx,a,b,'relative'),rng=ctx.rng,pf=ctx.pair(a,b),k,m={f:''};
var fam=a.z.family&&a.z.family.pc==null?a.z.family:b.z.family&&b.z.family.pc==null?b.z.family:null;
if(grown(ctx,a,b,35,40)&&RK.cool(ctx,a,b,'zb_relG',8)&&rng()<0.45){
RK.mark(ctx,a,b,'zb_relG');
k=HK.tieFamLove&&HK.tieFamLove(t)&&loveOk(ctx,a,b,null)&&rng()<loveP(ctx,a,b,pf._zb_rel)?'love':'grow';
}else if(rng()<0.35)k='keep';
else k=fam&&rng()<0.6?'fam':'pat';
if(k==='fam')m.f=(fam===a.z.family?a.name:b.name)+'の'+fam.rel;
if(k==='love')ctx.mod2(a,b,{att:7,aff:4},{att:7,aff:4});
else if(k==='grow'){pf._zb_rel=(pf._zb_rel||0)+1;var lf=HK.tieFamLove&&HK.tieFamLove(t)&&loveOk(ctx,a,b,null)?3:0;ctx.mod2(a,b,{aff:7,trust:9,att:lf},{aff:7,trust:9,att:lf});}
else if(k==='keep'){ctx.mod2(a,b,{aff:3,trust:4},{aff:3,trust:4});ctx.stress(b,-4);}
else{ctx.mod2(a,b,{aff:3,trust:3},{aff:3,trust:3});ctx.stress(a,2);ctx.stress(b,2);}
return{cat:k==='love'?'romance':k==='keep'?'help':'bond',text:ctx.t(fill(ctx.pick(T.rl[k]),m),a,b),
why:a.name+'と'+b.name+'は親族'+({pat:'：家族の消息を案じ合う',fam:'：家族の消息を案じ合う',keep:'：いざとなれば助け合う',grow:'：家族としての絆が深まった（好意・信頼が高い）',love:'：「恋愛：あり」の親族。想いが変わった（惹かれ）'}[k])};
}
});
var VT={
decoy:L('――{d}は{w}に命じた。{d}「囮になって｜囮になれ｜囮になってください」――{w}は一瞬もためらわず、群れの前へ飛び出していった。{d}はその背中を振り返りもせずに逃げた。|――{d}は{w}の背中を押して、短く言った。{d}「行って。私が逃げるまで、引きつけて｜行け。私が逃げるまで、引きつけろ｜行ってください。私が逃げるまで、引きつけてください」――{w}は黙ってうなずき、わざと大きな音を立てて走り出した。'),
shield:L('――{w}は{v}の前に身を投げ出した。{w}「{v}には、指一本触れさせない｜＝｜{v}には、指一本触れさせません」|――{w}は{v}に伸びた腕の前へ、迷わず自分の体を差し出した。{w}にとって、{v}を守ること以上に大事なことはなかった。'),
bene:L('――{w}は{v}に伸びた腕の前へ飛び込んだ。{w}「あの日の恩、ここで返す｜あの日の恩を、ここで返す｜あの日の恩、ここでお返しします」|――{w}は{v}を突き飛ばして、自分が群れの前に残った。{w}「{v}に助けてもらった命だ。使いどころは、ここしかない｜＝｜{v}に助けてもらった命です。使いどころは、ここしかありません」'),
boss:L('――{w}は{v}の背中を押した。{w}「先に行って。ここは私が食い止める｜先に行け。ここは私が食い止める｜先に行ってください。ここは私が食い止めます」――{v}が振り返ったときには、{w}はもう群れのほうを向いていた。|――{w}は{v}を扉の内側へ押し込んだ。{w}「部下を逃がすのが、上の人間の仕事だから｜部下を逃がすのが、上の人間の仕事だ｜部下を逃がすのが、上の人間の仕事です」'),
rel:L('――{w}は{v}の襟首を掴んで、力任せに引き戻した。{w}「親族を、こんなところで死なせはしない｜＝｜親族を、こんなところで死なせはしません」――二人はもつれ合うように転がり、群れの手からかろうじて逃れた。|――{w}は{v}の腕を掴んで、群れの中から引きずり出した。{w}「離さないで。家族に会うまで、絶対に離さないで｜離すな。家族に会うまで、絶対に離すな｜離さないでください。家族に会うまで、絶対に離さないでください」')
};
var OUT={
die:L('{w}の声は、すぐに群れの呻き声に呑まれた。|{w}の姿は、群れの向こうに消えた。それきり、戻ってこなかった。'),
bite:L('戻ってきた{w}の腕には、くっきりと歯形が残っていた。|{w}の肩に、ゾンビの歯が深く食い込んでいた。それでも{w}は、最後まで退かなかった。'),
hurt:L('{w}は傷だらけで戻ってきた。それでも{w}は、無事な姿を確かめて、ほっとしたように息をついた。|{w}はしばらくして、足を引きずりながら戻ってきた。咬まれては、いなかった。')
};
var DEC_OUT={
bite:L('戻ってきた{w}の腕には、歯形が残っていた。{w}「役に立てた｜＝｜役に立てました」――{w}はそれだけ言って、{d}に笑いかけた。'),
hurt:L('{w}は血まみれで戻ってきた。それでも{d}の無事を確かめると、{w}はほっとしたように息をついた。')
};
var REL_HURT=L('{w}の腕には擦り傷ができていたが、咬まれてはいなかった。|{w}は{v}の無事を確かめてから、ようやく自分の傷に気づいた。');
var BOSS_HURT=L('{w}はしばらくして、足を引きずりながら戻ってきた。{w}「部下を置いて、上の人間だけ逃げられない｜部下を置いて、上の人間だけ逃げるわけにはいかない｜部下を置いて、上の人間だけ逃げるわけにはいきません」');
function outcome(ctx,w,v,kind,A,out,m){
var rng=ctx.rng,r=rng(),die=kind==='rel'?0:kind==='decoy'?0.2:0.16,bite=kind==='rel'?0.12:0.45;
if(r<die){
out.text+=fill(ctx.pick(OUT.die),m);
ctx.pair(w,v).sacrifice=w.i;
ctx.kill(w,null,kind==='decoy'?v.name+'の命令で囮になり、群れに呑まれた':v.name+'をかばって、'+A.name+'で群れに呑まれた');
return'die';
}
if(r<bite){out.text+=fill(ctx.pick(kind==='decoy'?DEC_OUT.bite:OUT.bite),m);Z.infect(ctx,w,'horde',true);return'bite';}
w.hp-=10+rng.int(10);if(w.z.wound<0)w.z.wound=ctx.stepIndex;
out.text+=fill(ctx.pick(kind==='decoy'?DEC_OUT.hurt:kind==='boss'?BOSS_HURT:kind==='rel'?REL_HURT:OUT.hurt),m);
return'hurt';
}
Z.tieVictim=function(ctx,g,v,A){
var rng=ctx.rng,H=HK.Ties;
if(!H)return null;
var others=g.filter(function(o){return o!==v&&o.alive&& !o.out&& !o.z.bitten&& !o.z.alone;});
if(!others.length)return null;
var out={text:'',why:'',mag:40,with:[]},w=null,kind='',d=null;
others.forEach(function(o){var t= !w&&H.from(ctx,o,v,'worship');if(t&&t.cold==='dominate'&&rng()<0.6){w=o;kind='decoy';d=v;}});
if(!w)others.forEach(function(o){var t= !w&&H.from(ctx,o,v,'worship');if(t&&t.cold!=='dominate'&&rng()<0.55+o.tr.ac*0.2){w=o;kind='shield';}});
if(!w)others.forEach(function(o){if(!w&&H.from(ctx,v,o,'benefactor')&&ctx.R(o,v).aff>30&&rng()<0.4+o.tr.np*0.2){w=o;kind='bene';}});
if(!w)others.forEach(function(o){if(!w&&H.from(ctx,o,v,'boss')&&ctx.R(o,v).trust>20&&rng()<0.25+o.tr.np*0.25+o.tr.cp*0.15){w=o;kind='boss';}});
if(!w)others.forEach(function(o){if(!w&&H.has(ctx,o,v,'relative')&&ctx.R(o,v).aff>20&&rng()<0.3+o.tr.np*0.2){w=o;kind='rel';}});
if(!w)return null;
var m={w:w.name,v:v.name,d:d?d.name:''};
out.text=fill(ctx.pick(VT[kind]),m);
out.with=[w];
var res=outcome(ctx,w,v,kind,A,out,m);
if(kind==='decoy'){
ctx.pair(w,v).zbBait=(ctx.pair(w,v).zbBait||0)+1;
ctx.mod(v,w,{trust:4});
ctx.mod(w,v,{trust:2});
g.forEach(function(o){if(o!==w&&o!==v&&o.alive)ctx.mod(o,v,{trust: -15,ten:12});});
out.why=v.name+'は'+w.name+'の信仰を利用して支配している。群れに捕まりかけた'+v.name+'は、'+w.name+'に囮を命じた（'+w.name+'：'+{die:'群れに呑まれた',bite:'咬まれた',hurt:'けがをして戻った'}[res]+'）';
}else{
ctx.mod(v,w,{aff:kind==='rel'?12:22,trust:kind==='rel'?15:25,att:kind==='shield'||kind==='bene'?4:0});
if(kind==='bene')ctx.pair(w,v).zbRepaid=(ctx.pair(w,v).zbRepaid||0)+1;
if(kind==='rel'){v.hp-=4+rng.int(6);}
ctx.stress(v,res==='die'?30:10);
out.why={shield:w.name+'は'+v.name+'を信仰している。迷わず盾になった',bene:w.name+'は恩人の'+v.name+'に、命を張って恩を返した',boss:'上司の'+w.name+'が、部下の'+v.name+'を逃がすために残った',rel:'親族の'+w.name+'が、'+v.name+'を力ずくで引き戻した'}[kind]+'（'+w.name+'：'+{die:'群れに呑まれた',bite:'咬まれた',hurt:kind==='rel'?'二人とも逃げ延びた':'けがをして戻った'}[res]+'）';
}
out.mag=res==='die'?45:36;
return out;
};
})();
});
;
/* ==== js/zombie-cure.js ==== */
HK.Load.def(163,'js/zombie-cure.js',function(){
(function(){
'use strict';
var HK=window.HK,Z=HK.ZB;
if(!Z|| !Z.scen)return;
var EV=Z.scen.events;
function L(s){return s.split('|');}
function fill(t,m){return t.replace(/\{(\w+)\}/g,function(x,k){return m[k]!=null?m[k]:x;});}
function alive(c){return c&&c.alive&& !c.out;}
var GOAL={id:'cure',label:'治療薬を手に入れる',bias:{help:1.4,combat:1.2}};
var T=Z.CURE={
rumor:L('ラジオの雑音の向こうで、誰かが言った。「{area}の地下に、感染を治す試薬が残っている」|SNSに、{area}の研究員を名乗る投稿が流れた。「治療薬の試作品が、まだ保管庫にある」――すぐに削除された。|壁に、乱れた字の落書きがあった。「{area}　薬　まだある　治る」'),
rumorOff:L('拾った無線機から、途切れ途切れの声が聞こえた。「……{area}……試薬……治る……」|生存者が残したメモに、「{area}の保管庫に治療薬」と書かれていた。'),
hear:L('{a}はその噂を聞いた瞬間、立ち上がっていた。{b}を、元に戻せるかもしれない。|{a}は噂を何度も頭の中で繰り返した。デマかもしれない。それでも、{b}のためなら。|{a}は武器を握り直した。「{area}に行く。{b}を、治す｜＝｜{area}に行きます。{b}を、治します」'),
hearM:L('{a}はその噂を聞いた瞬間、立ち上がっていた。{b}は、私のことなんか何とも思っていなかった。それでも、元に戻したかった。|{a}は噂を何度も頭の中で繰り返した。{b}が戻ってきても、言うつもりはない。ただ、もう一度笑ってほしかった。|{a}は武器を握り直した。「{area}に行く｜＝｜{area}に行きます」――理由を訊かれて、{a}は「仲間だから｜仲間だからだ｜仲間ですから」とだけ答えた。'),
obstacle:[
{n:'群れ',t:L('{area}の入口は、ゾンビの群れで埋まっていた。{a}は{w}を構え、隙間を縫うように走った。|保管庫へ続く廊下に、白衣のゾンビがひしめいていた。{a}は息を殺して、一体ずつ数えた。')},
{n:'危険な薬品庫',t:L('薬品庫の扉の向こうは、割れた薬瓶から漏れた薬品の煙で満ちていた。{a}は袖で口を覆って踏み込んだ。|保管庫は電子ロックで閉ざされていた。非常電源を探して、{a}は真っ暗な地下を這い回った。')},
{n:'先客',t:L('保管庫の前には、先客がいた。銃を構えた男が、「これは俺たちのだ」と言った。|薬を独り占めしようとする白衣の男が、{a}の前に立ちふさがった。「渡さない。これは研究成果だ」')}
],
win:L('――{a}は、震える手で銀色のケースを掴んだ。中には、青く光るアンプルが一本だけ入っていた。|――棚の奥に、ラベルの剥がれかけた小箱があった。「試作品・投与注意」。{a}はそれを胸に抱えて、走った。'),
lose:L('――{a}は引き返すしかなかった。腕から血が流れていた。|――{a}は這うようにして逃げ出した。薬は、まだあの奥にある。'),
bit:L('――逃げる途中、{a}の足首に、何かが噛みついた。'),
fake:L('保管庫は、空っぽだった。棚には「回収済み」の札が一枚だけ残っていた。噂は、デマだった。{a}はその場に座り込んだ。|ケースの中身は、ただのビタミン剤だった。{a}は笑おうとして、笑えなかった。'),
give:L('{a}は{b}の腕を押さえ、アンプルの中身を一気に注ぎ込んだ。「戻ってきて｜戻ってこい｜戻ってきてください」|{a}は{b}の首筋に針を刺した。「お願い。お願いだから｜頼む。頼むから｜お願いです。お願いですから」'),
giveZ:L('{a}は{b}に組みつき、もみ合いながら首筋に針を刺した。|{a}は{b}の正面に立ち、伸びてきた腕をかいくぐって、胸に針を突き立てた。'),
giveChain:L('{a}は鎖で繋いだ{b}の腕に、全身の体重をかけて針を突き立てた。{b}が呻き声を上げた。|{a}は閉じ込めていた部屋の扉を開け、暴れる{b}を押さえつけて、首筋に針を刺した。'),
cured:L('{b}の体が大きく痙攣した。やがて、濁っていた目に、ゆっくりと光が戻った。「……{a}？」――{a}は声を上げて泣いた。|長い沈黙のあと、{b}が咳き込んだ。人間の咳だった。「……なんで、泣いてるの｜……なぜ、泣いているんだ｜……どうして、泣いているんですか」――{a}は答えられずに、{b}を抱きしめた。|{b}の肌から、灰色の斑点がすうっと引いていった。{b}は自分の手を見つめて、それから{a}を見た。「……ただいま｜＝｜……ただいま戻りました」'),
curedM:L('{b}の濁っていた目に、ゆっくりと光が戻った。「……{a}？」――{a}は泣きながら言った。「好きだった。ずっと。迷惑でも、言わずに死なせるのは嫌だった｜＝｜好きでした。ずっと。迷惑でも、言わずに死なせるのは嫌でした」――{b}は、かすれた声で笑った。「……それ、こっちの台詞｜……それは、こちらの台詞だ｜……それは、こちらの台詞です」|長い沈黙のあと、{b}が咳き込んだ。人間の咳だった。「……なんで、そこまでしてくれたの｜……なぜ、そこまでしてくれたんだ｜……どうして、そこまでしてくれたんですか」――{a}は答えに詰まって、結局、本当のことを言った。{b}は顔を覆った。「私だけだと、思ってた｜私だけだと、思っていた｜私だけだと、思っていました」|{b}の肌から、灰色の斑点がすうっと引いていった。{b}は{a}を見て、最初に言った。「ゾンビになる前に、言えばよかったって、ずっと思ってた｜ゾンビになる前に、言えばよかったと、ずっと思っていた｜ゾンビになる前に、言えばよかったと、ずっと思っていました」――{a}は、自分も同じことを考えていたと気づいた。'),
curedBitM:L('{b}の熱は、その夜のうちに引いた。目を覚ました{b}は、{a}の手を握ったまま言った。「咬まれたとき、いちばん後悔したのは、{a}に好きって言わなかったこと｜咬まれたとき、いちばん後悔したのは、{a}に好きだと言わなかったことだ｜咬まれたとき、いちばん後悔したのは、{a}に好きだと言わなかったことです」――{a}は、しばらく返事ができなかった。「……こっちの台詞｜……こちらの台詞だ｜……こちらの台詞です」|朝、{b}は「お腹すいた｜腹が減った｜お腹がすきました」と言った。それから、少し迷って付け足した。「あと、ずっと好きだった｜＝｜あと、ずっと好きでした」――{a}は、持っていた缶詰を落とした。|{b}の咬み跡の黒ずみが薄れていくのを、{a}は一晩中見守った。夜明けに目を開けた{b}は、{a}を見るなり泣き出した。「何とも思われてないと思ってたのに。なんで、ここまで｜何とも思われていないと思っていたのに。なぜ、ここまで｜何とも思われていないと思っていたのに。どうして、ここまでしてくれたんですか」'),
curedBit:L('{b}の熱は、その夜のうちに引いた。咬み跡の黒ずみが、少しずつ薄れていった。|朝、{b}は「お腹すいた｜腹が減った｜お腹がすきました」と言った。それが、{a}がこの世で聞いたいちばん嬉しい言葉だった。'),
melt:L('{b}の体が、内側から泡立ち始めた。皮膚が溶け、背中から何本もの触手が這い出した。{a}が悲鳴を上げる前に、それはもう{b}の形をしていなかった。|{b}が絶叫した。骨が軋み、肉が裂け、溶けた体の中から、ぬめった触手が四方へ伸びた。薬は、効きすぎた。'),
grab:L('触手が{a}の手足に巻きつき、宙に吊り上げた。'),
grabM:L('触手が{a}の手足に巻きつき、{m}の目の前で宙に吊り上げた。|悲鳴を上げる{m}の前で、触手は{a}を軽々と持ち上げた。'),
save:L('――{m}が叫びながら飛び込み、{w}で触手を叩き切った。落ちてきた{a}を、{m}は全身で受け止めた。怪物は甲高い声を上げて、闇の奥へ逃げていった。|――{m}が{w}を振りかざして怪物に飛びかかった。触手が緩んだ一瞬、{a}は床に転がり落ちた。'),
saveKill:L('――{m}たちは一斉に飛びかかった。何度も、何度も{w}を振り下ろし、やがてかつて{b}だったものは動かなくなった。|――銃声が何発も響いた。触手が力を失い、{a}は床に落ちた。{b}だったものは、もう動かなかった。'),
caught:L('――{m}が助けに飛び込んだ。だが、別の触手が{m}の足首を捕らえ、同じように吊り上げた。|――「離して！｜離せ！｜離してください！」{m}が触手に斬りかかった。その腕に、二本目、三本目の触手が絡みついた。'),
abandon:L('――仲間たちは、どうすることもできなかった。{m}は、吊るされた{a}から目を逸らして走った。背後の声は、角を曲がっても聞こえていた。|――{m}は{a}の名前を叫びながら、走るしかなかった。振り返ることは、できなかった。'),
eaten:L('触手が{a}の体を絡め取った。{a}は最後まで、それが{b}だったことを忘れなかった。|{a}は逃げなかった。かつて{b}だったものに抱かれて、{a}は飲み込まれていった。'),
flee:L('{a}は触手を振りほどき、血まみれになって逃げ出した。背後で、かつて{b}だったものが、聞いたことのない声で鳴いていた。'),
gone:L('{a}が薬を握りしめて戻ったとき、{b}はもう、どこにもいなかった。――間に合わなかった。{a}は薬を握りつぶした。ガラスが手に食い込んでも、離さなかった。|{a}は、{b}の亡骸の前に膝をついた。手の中のアンプルが、ひどく軽かった。「……遅かった。全部、遅かった｜＝｜……遅かった。全部、遅かったんです」|{a}はアンプルを地面に叩きつけようとして、できなかった。{b}を救うはずだったものを、壊すことさえできなかった。'),
goneM:L('{a}は、{b}の亡骸の前に膝をついた。{b}の手には、くしゃくしゃの紙が握られていた。「{a}に、ちゃんと言う｜＝｜{a}に、ちゃんと言います」――{a}の名前だった。|{a}が薬を握りしめて戻ったとき、{b}はもういなかった。{b}の寝床に、{a}の古いハンカチが畳んで置いてあった。ずっと、持っていたのだ。|{a}は、{b}の亡骸の前に膝をついた。「何とも思われてなくても、よかったのに｜何とも思われていなくても、よかったのに｜何とも思われていなくても、よかったんです」――{b}の荷物の中の日記には、毎日のように{a}の名前があった。'),
goneDespair:L('その夜、{a}は誰とも口をきかなかった。目から、何かが消えていた。|{a}は空のアンプルを首から下げた。もう、生き延びる理由が見つからなかった。')
};
function stateOf(ctx,o){
if(alive(o))return o.z.bitten?'bitten':'ok';
var zp=Z.zpOf?Z.zpOf(ctx,o.i):null;
if(zp&& !zp.monster&&(!zp.down||zp.chained||zp.kept))return'zombie';
return'gone';
}
function dear(ctx,c,o){
if(Z.isLover&&Z.isLover(ctx,c,o))return 3;
if(HK.Ties&&(HK.Ties.has(ctx,c,o,'parent')||HK.Ties.has(ctx,c,o,'sibling')))return 3;
if(HK.Ties&&HK.Ties.from(ctx,c,o,'crush'))return 2;
return ctx.R(c,o).aff>55?1:0;
}
function targetOf(ctx,c){
var best=null,bv=0;
ctx.chars.forEach(function(o){
if(o===c)return;
var st=stateOf(ctx,o),d=dear(ctx,c,o);
if((st==='bitten'||st==='zombie')&&d>bv){bv=d;best=o;}
});
return best;
}
function placeOf(ctx,o){
if(alive(o))return o.z.area;
var zp=Z.zpOf(ctx,o.i);
return zp?zp.area:null;
}
Z.cureDest=function(ctx,c){
var q=c.z.cureQ,zb=ctx.zb;
if(!q||q.done)return null;
if(q.stage==='seek')return zb.cure.area;
if(q.stage==='have'){var p=placeOf(ctx,ctx.chars[q.target]);return p!=null?p:null;}
return null;
};
function startQuest(ctx,c,o,heard){
if(c.z.cureQ||c.goal.id==='chaos'||c.z.bitten)return;
c.z.cureQ={target:o.i,stage:'seek',tries:0,prevGoal:c.goal};
var from=c.goal.label;
c.goal=GOAL;
var m={a:c.name,b:o.name,area:Z.an(ctx,ctx.zb.cure.area)},pin=Z.isPining&&Z.isPining(ctx,c,o);
ctx.act2({actors:[c,o],cat:'solo',text:(heard?fill(ctx.pick(pin?T.hearM:T.hear),m):'')+c.name+'の目標が変わった：「'+from+'」→「'+GOAL.label+'」',why:c.name+'は、'+(stateOf(ctx,o)==='zombie'?'ゾンビになった':'咬まれた')+o.name+'を治したい'+(pin?'（両片想いの相手。想いは告げていない）':''),mag:26});
}
function endQuest(ctx,c,goalId){
var q=c.z.cureQ;q.done=true;
c.goal=Z.scen.goals.filter(function(g){return g.id===goalId;})[0]||q.prevGoal||c.goal;
}
function rumor(ctx){
var zb=ctx.zb,rng=ctx.rng;
if(zb.cure||Z.part(ctx)!==0||Z.day(ctx)<2)return;
var need=ctx.present().some(function(c){return!!targetOf(ctx,c);});
if(rng()>(need?0.07:0.015))return;
var medA=zb.A.filter(function(A){return A.def.med;})[0];
var area=medA&&rng()<0.7?medA.i:rng.int(zb.A.length);
zb.cure={area:area,real:rng()>ctx.env.rumor/100*0.55,taken:false};
var m={area:Z.an(ctx,area)};
var heard=ctx.present().filter(function(c){return rng()<(zb.netDown?0.4:0.7);});
ctx.say({kind:'event',cat:'phase',actors:heard,text:fill(ctx.pick(zb.netDown?T.rumorOff:T.rumor),m)+(heard.length?'――'+Z.names(heard)+'が、その話を耳にした。':''),why:'治療薬の噂（情報の錯綜 '+ctx.env.rumor+'）',mag:24});
heard.forEach(function(c){c.z.know.cure=true;var o=targetOf(ctx,c);if(o)startQuest(ctx,c,o,true);});
}
function raid(ctx,c,q){
var rng=ctx.rng,zb=ctx.zb,ob=rng.pick(T.obstacle),mates=Z.here(ctx,c);
var m={a:c.name,area:Z.an(ctx,zb.cure.area),w:c.weapon?c.weapon.name:'素手'};
var p=0.3+ctx.stat(c,'luck')*0.04+(c.weapon?c.weapon.pow*0.03:0)+c.tr.caution*0.1+mates.length*0.06+q.tries*0.12;
q.tries++;
var t=fill(ctx.pick(ob.t),m),why=c.name+'は「'+ob.n+'」を越えようとした（運・武器・仲間 '+mates.length+'人）';
if(zb.cure.taken){ctx.act2({actors:[c],cat:'solo',text:t+'――保管庫は、すでに荒らされていた。誰かが先に持ち去ったあとだった。',why:why,mag:20});ctx.stress(c,25);endQuest(ctx,c,'live');return;}
if(rng()<p){
if(!zb.cure.real){ctx.act2({actors:[c].concat(mates),cat:'solo',text:t+fill(ctx.pick(T.fake),m),why:why+'――噂はデマだった',mag:30});ctx.stress(c,35);endQuest(ctx,c,'live');return;}
zb.cure.taken=true;q.stage='have';
ctx.act2({actors:[c].concat(mates),cat:'help',text:t+fill(ctx.pick(T.win),m),why:why+'――治療薬を手に入れた',mag:36});
return;
}
c.hp-=14+rng.int(16);ctx.stress(c,12);
var bitten=ob.n==='群れ'&&rng()<0.3;
ctx.act2({actors:[c].concat(mates),cat:'combat',text:t+fill(ctx.pick(bitten?T.bit:T.lose),m),why:why+'――越えられなかった',mag:28});
if(bitten&&Z.infect)Z.infect(ctx,c,null,true);
if(c.hp<=0)ctx.kill(c,null,'治療薬を取りに行き、'+ob.n+'に阻まれて');
}
function dose(ctx,c,q){
var rng=ctx.rng,o=ctx.chars[q.target],st=stateOf(ctx,o),m={a:c.name,b:o.name};
var pin= !!(HK.Ties&&HK.Ties.from(ctx,c,o,'crush')&&HK.Ties.from(ctx,o,c,'crush')&& !ctx.pair(c,o).couple);
if(st==='ok'){endQuest(ctx,c,'live');return;}
if(st==='gone'){
ctx.stress(c,50);
var deep=c.stress>85&&c.tr.ac+c.tr.np>1.1&&rng()<0.3;
ctx.act2({actors:[c,o],cat:'death',text:fill(ctx.pick(pin?T.goneM:T.gone),m)+fill(ctx.pick(T.goneDespair),m),why:c.name+'は治療薬を手に入れた。だが、'+o.name+'はもういなかった（焦り '+Math.round(c.stress)+'）'+(pin?'。両片想いだった――'+o.name+'も、同じ気持ちだった':''),mag:44});
endQuest(ctx,c,c.tr.cold+c.tr.aggr>1.2?'chaos':'live');
if(deep)ctx.kill(c,null,o.name+'に間に合わなかった治療薬を握りしめたまま、自ら');
return;
}
var zombie=st==='zombie',zp=zombie?Z.zpOf(ctx,o.i):null;
var okP=zombie?0.4:0.6;
q.done=true;
var giveT=zombie?(zp.chained||zp.kept?T.giveChain:T.giveZ):T.give;
if(rng()<okP){
if(zombie){
zp.down=true;zp.cured=true;zp.chained=false;zp.kept=false;
o.alive=true;o.hp=35;o.fate='';o.deathHow='';o.diedAt=null;o.fateNote='';
o.z.bitten=null;o.z.turnAt= -1;o.z.area=zp.area;o.z.aware=false;o.z.decided=false;o.z.cured=true;
o.stress=60;
}else{o.z.bitten=null;o.z.turnAt= -1;o.z.aware=false;o.z.cured=true;o.z.hiding=false;}
ctx.mod2(c,o,{aff:15,trust:15},{aff:25,trust:25,att:10});
if(pin){ctx.pair(c,o).couple=true;ctx.pair(c,o).zconf=true;ctx.mod2(c,o,{att:10},{att:10});}
ctx.act2({actors:[c,o],cat:pin?'romance':'help',text:fill(ctx.pick(giveT),m)+fill(ctx.pick(zombie?(pin?T.curedM:T.cured):(pin?T.curedBitM:T.curedBit)),m),why:c.name+'は'+o.name+'に治療薬を投与した――'+(zombie?'ゾンビから人間に戻った':'感染が治った')+(pin?'。両片想いだった二人は、ようやく想いが通じた':''),mag:50});
c.goal=q.prevGoal&&q.prevGoal.id!=='cure'?q.prevGoal:Z.scen.goals[0];
if(o.z.keep!=null)o.z.keep=null;
return;
}
var head=fill(ctx.pick(zombie?(zp.chained||zp.kept?T.giveChain:T.giveZ):T.give),m)+fill(ctx.pick(T.melt),m);
if(!zombie){o.z.bitten=o.z.bitten||{at:ctx.stepIndex,by:null};Z.turn(ctx,o,true);zp=Z.zpOf(ctx,o.i);}
if(zp){zp.loveDone=true;zp.crushDone=true;zp.monster=true;zp.down=false;zp.chained=false;zp.kept=false;zp.type='wild';zp.target=null;zp.area=c.z.area;}
o.fateNote=(o.fateNote||'')+'。治療薬で体が溶け、触手の怪物になった';
ctx.stress(c,40);
var mates=Z.here(ctx,c).filter(function(x){return x!==o&&alive(x);});
var lv=Z.cureAssault?Z.loveLv(ctx):'off';
var forceOk= !HK.Content||HK.Content.ok(ctx,'force');
function sexOK(x){
var P=HK.Pos,S=HK.State;
if(!forceOk||(S&&(!S.r18ok(x)|| !S.r18ok(o)||(!S.mobSexOk(x)&&(x.sexLocks||[]).indexOf(o.i)<0))))return false;
if(x.sexLocks&&x.sexLocks.length&&x.sexLocks.indexOf(o.i)<0)return false;
return!P||(P.canReceive(x)&&P.okSex(o,x)&&P.order(o,x,[o,x])[0]===o);
}
var sexual=lv!=='off'&&sexOK(c)&&rng()<0.6;
var lvr=Z.loverOf?Z.loverOf(ctx,c,o,mates):null,lvHere=lvr&&mates.indexOf(lvr)>=0;
var pow=mates.reduce(function(s0,x){return s0+(x.weapon?x.weapon.pow:0);},0);
var brave=mates.reduce(function(s0,x){return Math.max(s0,x.tr.np*0.5+x.tr.cp*0.3+x.tr.aggr*0.3);},0);
var save=Math.min(0.85,0.1+ctx.stat(c,'luck')*0.03+mates.length*0.17+pow*0.02+brave*0.2+(lvHere?0.15:0));
var mm={a:c.name,b:o.name,m:mates.length?Z.names(mates.slice(0,2)):'',m1:mates.length?mates[0].name:''};
var body=fill(ctx.pick(mates.length?T.grabM:T.grab),mm)+(sexual?Z.cureAssault(ctx,c,o,mates,lv):'')+(Z.loverShock?Z.loverShock(ctx,c,lvr,lvHere,sexual):'');
var whyH=c.name+'の投与した治療薬で、'+o.name+'は触手の怪物になった';
if(!mates.length){
if(rng()<0.18+ctx.stat(c,'luck')*0.03){
c.hp-=30;
ctx.act2({actors:[c,o],cat:'escape',text:head+fill(ctx.pick(T.flee),mm),why:whyH+'――'+c.name+'は辛くも逃げた',mag:52});
if(c.hp<=0)ctx.kill(c,null,'怪物になった'+o.name+'から逃げきれず');
else{var na=rng.pick(Z.adj(c.z.area));c.z.area=na;c.z.path.push(na);endQuest(ctx,c,'escape');}
return;
}
var whole=sexual&&Z.CURE_R18&&rng()<0.35?(lv==='high'?Z.CURE_R18:Z.CURE_R18_FADE):null;
ctx.act2({actors:[c,o],cat:'death',text:head+(whole?fill(ctx.pick(T.grab),mm)+fill(ctx.pick(whole),mm):body+fill(ctx.pick(sexual?(lv==='high'?T.dieSex:T.dieFade):T.eaten),mm)),why:whyH+'（その場に、誰もいなかった）',mag:60,lewd:sexual});
ctx.kill(c,null,sexual?'治療薬で怪物になった'+o.name+'に襲われ、喰い殺された':'治療薬で怪物になった'+o.name+'に喰われた');
return;
}
var actors=[c,o].concat(mates);
var r2=rng();
if(r2<save){
var hero=ctx.most(mates,function(x){return x.tr.np*0.5+x.tr.cp*0.3+(x.weapon?x.weapon.pow*0.05:0);});
var kill=pow>=8&&rng()<0.5;
c.hp-=sexual?25:35;ctx.stress(c,45);
mates.forEach(function(x){ctx.stress(x,20);ctx.mod(c,x,{aff:15,trust:20});});
if(kill){zp.down=true;ctx.zb.stats.putdown++;o.fateNote+='。仲間たちの手で倒された';}
else{zp.area=rng.pick(Z.adj(zp.area));}
ctx.act2({actors:actors,cat:'help',text:head+body+fill(ctx.pick(kill?T.saveKill:T.save),{a:c.name,b:o.name,m:hero.name,w:hero.weapon?hero.weapon.name:'素手'})+(sexual&&lv!=='off'?fill(ctx.pick(T.afterSave),mm):''),why:whyH+'――仲間（'+mates.length+'人・武器・NP/CP）が助け出した（助かる見込み '+Math.round(save*100)+'%）',mag:58,lewd:sexual});
if(c.hp<=0)ctx.kill(c,null,'怪物になった'+o.name+'から助け出されたが、傷が深すぎて');
else endQuest(ctx,c,'live');
return;
}
if(r2<save+(1-save)*0.4){
var vic=ctx.most(mates,function(x){return x.tr.np+x.tr.impulse*0.5;});
var body2=sexual&&sexOK(vic)?Z.cureAssault(ctx,vic,o,mates.filter(function(x){return x!==vic;}).concat([]),lv,{second:true,first:c}):'';
ctx.act2({actors:actors,cat:'death',text:head+body+fill(ctx.pick(T.caught),{a:c.name,b:o.name,m:vic.name})+body2+fill(ctx.pick(sexual?(lv==='high'?T.dieSex:T.dieFade):T.eaten),mm),why:whyH+'――助けに入った'+vic.name+'も巻き込まれた',mag:64,lewd:sexual});
ctx.kill(c,null,sexual?'治療薬で怪物になった'+o.name+'に、仲間の前で襲われ、喰い殺された':'治療薬で怪物になった'+o.name+'に喰われた');
vic.hp-=45+rng.int(30);ctx.stress(vic,40);
if(vic.hp<=0||rng()<0.5)ctx.kill(vic,null,c.name+'を助けに入り、怪物になった'+o.name+'に'+(sexual?'捕まって':'')+'喰われた');
return;
}
mates.forEach(function(x){ctx.stress(x,30);x.flags.grief=c.i;});
ctx.act2({actors:actors,cat:'death',text:head+body+fill(ctx.pick(T.abandon),mm)+fill(ctx.pick(sexual?(lv==='high'?T.dieSex:T.dieFade):T.eaten),mm),why:whyH+'――仲間は、助けられなかった',mag:62,lewd:sexual});
ctx.kill(c,null,sexual?'治療薬で怪物になった'+o.name+'に、仲間の前で襲われ、喰い殺された':'治療薬で怪物になった'+o.name+'に、仲間の前で喰われた');
mates.forEach(function(x){var na=rng.pick(Z.adj(x.z.area));x.z.area=na;x.z.path.push(na);});
}
var after0=Z.scen.after;
Z.scen.after=function(ctx,s,n){
after0.call(this,ctx,s,n);
if(!ctx.zb)return;
rumor(ctx);
var zb=ctx.zb;
if(!zb.cure)return;
ctx.present().forEach(function(c){
if(!c.z.cureQ&&c.z.know.cure){var o=targetOf(ctx,c);if(o)startQuest(ctx,c,o,false);}
var q=c.z.cureQ;
if(!q||q.done|| !alive(c))return;
if(q.stage==='seek'&&c.z.area===zb.cure.area)raid(ctx,c,q);
else if(q.stage==='have'){
var o=ctx.chars[q.target],st=stateOf(ctx,o);
if(st==='gone'||st==='ok'||placeOf(ctx,o)===c.z.area)dose(ctx,c,q);
}
});
ctx.flush();
};
HK.addTo(EV,{
id:'z_cure_tell',cat:'bond',scope:'pair',
when:function(ctx,a,b){return a.z.know.cure&& !b.z.know.cure&& !!ctx.zb.cure;},
w:function(ctx,a,b){return 0.6+(targetOf(ctx,b)?1.5:0);},
run:function(ctx,a,b){
b.z.know.cure=true;
var o=targetOf(ctx,b);
if(o)Z.later(ctx,function(){startQuest(ctx,b,o,true);});
return{text:ctx.t('{a}は{b}に、治療薬の噂を伝えた。「'+Z.an(ctx,ctx.zb.cure.area)+'にあるらしい。本当かどうかは分からないけど｜'+Z.an(ctx,ctx.zb.cure.area)+'にあるらしい。本当かどうかは分からないが｜本当かどうかは分かりませんが、'+Z.an(ctx,ctx.zb.cure.area)+'にあるらしいです」',a,b),why:'噂が人づてに広まった'};
}
});
})();
});
;
/* ==== js/zombie-assault.js ==== */
HK.Load.def(164,'js/zombie-assault.js',function(){
(function(){
'use strict';
var HK=window.HK,Z=HK.ZB;
if(!Z|| !Z.scen)return;
function L(s){return s.split('|');}
function fill(t,m){return t.replace(/\{(\w+)\}/g,function(x,k){return m[k]!=null?m[k]:x;});}
function alive(c){return c&&c.alive&& !c.out;}
Z.loversOf=function(ctx,v,except){
return ctx.chars.filter(function(o){return o!==v&&o!==except&&alive(o)&&Z.isLover&&Z.isLover(ctx,v,o);});
};
Z.loverOf=function(ctx,v,except,among){
var L=Z.loversOf(ctx,v,except);
if(among&&L.length>1){var h=L.filter(function(o){return among.indexOf(o)>=0;});if(h.length)return h.length>1?ctx.most(h,function(o){return ctx.R(o,v).aff;}):h[0];}
return L[0]||null;
};
var SHOCK={
here:L('{L}の絶叫が響いた。「{a}に触るな――っ！」|{L}は、恋人が目の前で汚されていくのを見ていた。膝が、言うことを聞かなかった。|{L}は{a}の名前を呼んだ。何度も。喉が裂けるほど。'),
hereNs:L('{L}の絶叫が響いた。「{a}――っ！」|{L}は、恋人が目の前で引きずり倒されるのを見ていた。'),
after:L('助け出されたあと、{a}は{L}に触れられるたびに体をこわばらせた。{L}は何も言わず、ただ一晩中、少し離れた場所に座っていた。|{L}は{a}を抱きしめた。{a}は、抱きしめ返せなかった。|{L}はその夜、誰もいない場所で壁を殴り続けた。拳から血が出ても、やめなかった。'),
away:L('――そのころ{L}は、別の場所で{a}の帰りを待っていた。'),
news:L('{L}が{a}の最期を知ったのは、ずっとあとのことだった。{L}は、その場に崩れ落ちた。|{L}は{a}の身に起きたことを、仲間の口から聞いた。最後まで聞くことは、できなかった。')
};
Z.loverShock=function(ctx,v,L0,here,sexual){
if(!L0)return'';
ctx.stress(L0,here?45:20);L0.flags.grief=v.i;
ctx.mod(L0,v,{aff:5});
return here?fill(ctx.pick(sexual?SHOCK.here:SHOCK.hereNs),{a:v.name,L:L0.name}):'';
};
function loverNews(ctx,v,L0,here){
if(!L0||here)return;
Z.later(ctx,function(){
if(!alive(L0))return;
ctx.stress(L0,30);
ctx.act2({actors:[L0,v],cat:'solo',text:fill(ctx.pick(SHOCK.news),{a:v.name,L:L0.name}),why:L0.name+'は、恋人の'+v.name+'を失った',mag:34});
});
}
Z.zombieAssault=function(ctx,v,mates,A,o){
var rng=ctx.rng,X=Z.ZA_TEXT,lv=Z.loveLv(ctx)==='high'?'high':'fade';
var L0=Z.loverOf(ctx,v,null,mates),here=L0&&mates.indexOf(L0)>=0;
var pow=mates.reduce(function(s0,x){return s0+(x.weapon?x.weapon.pow:0);},0);
var brave=mates.reduce(function(s0,x){return Math.max(s0,x.tr.np*0.5+x.tr.cp*0.3+x.tr.aggr*0.3);},0);
var save=Math.min(0.85,0.1+ctx.stat(v,'luck')*0.03+mates.length*0.17+pow*0.02+brave*0.2+(here?0.15:0));
if(o&&o.live)save=Math.min(0.9,save+o.live);
var fw=HK.Dark&&HK.Dark.few?HK.Dark.few(ctx):1;
if(fw<1)save=1-(1-save)*fw;
if(ctx.zb)ctx.zb.zaN=(ctx.zb.zaN||0)+1;
var m={a:v.name,area:A.name,m:mates.length?Z.names(mates.slice(0,2)):'',L:L0?L0.name:''};
var t=X.body(ctx,v,mates,lv,L0)+Z.loverShock(ctx,v,L0,here,true);
var why=A.name+'で、ゾンビの群れに押し倒された（'+v.name+'は攻め指定ではない）';
var actors=[v].concat(mates);
ctx.stress(v,40);
if(!mates.length){
if(o&&o.sated&&rng()<o.live){
v.hp=Math.max(1,v.hp-15);
return{with:actors,text:t+fill(ctx.pick(o.sated),m),why:why+'――一人きりだったが、群れは興味を失ったように離れていった（咬まれずに済んだ）',mag:50};
}
var crawl=0.3+ctx.stat(v,'luck')*0.03;
if(rng()<(fw<1?1-(1-crawl)*fw:crawl)){
v.hp-=30;Z.infect(ctx,v,null,true);
loverNews(ctx,v,null,true);
return{with:actors,text:t+fill(ctx.pick(X.crawl),m),why:why+'――一人きりで、どうにか這い出した。だが、咬まれていた',mag:50};
}
ctx.kill(v,null,'ゾンビの群れに押し倒され、喰い殺された');
Z.loversOf(ctx,v).forEach(function(o){loverNews(ctx,v,o,false);});
return{with:actors,text:t+fill(ctx.pick(lv==='high'?X.die:X.dieFade),m),why:why+'（その場に、誰もいなかった）',mag:58};
}
var r=rng();
if(r<save){
var hero=here&&rng()<0.6?L0:ctx.most(mates,function(x){return x.tr.np*0.5+x.tr.cp*0.3+(x.weapon?x.weapon.pow*0.05:0);});
v.hp-=20;ctx.stress(v,20);
mates.forEach(function(x){ctx.stress(x,18);ctx.mod(v,x,{aff:12,trust:18});});
var bitten=rng()<0.35;
if(bitten)Z.infect(ctx,v,null,true);
var hm={a:v.name,m:hero.name,w:hero.weapon?hero.weapon.name:'素手',L:L0?L0.name:''};
return{with:actors,text:t+fill(ctx.pick(hero===L0?X.saveL:X.save),hm)+(bitten?fill(ctx.pick(X.bitAfter),m):'')+(L0?fill(ctx.pick(SHOCK.after),m):''),why:why+'――'+(hero===L0?'恋人の':'')+hero.name+'たちが助け出した（仲間 '+mates.length+'人・助かる見込み '+Math.round(save*100)+'%）'+(bitten?'。だが咬まれていた':''),mag:54};
}
if(r<save+(1-save)*0.4){
var vic=here&&rng()<0.5?L0:ctx.most(mates,function(x){return x.tr.np+x.tr.impulse*0.5;});
var cv=X.cover?X.cover(ctx,v,vic,mates,lv,t,why):null;
if(cv)return cv;
var top= !!X.caughtTop&&(X.inv? !X.inv(vic): !!(HK.Pos&&HK.Pos.hardTopNpc(vic)));
var t2=t+fill(ctx.pick(top?X.caughtTop:X.caught),{a:v.name,m:vic.name})+fill(ctx.pick(lv==='high'?X.die:X.dieFade),m);
ctx.kill(v,null,'ゾンビの群れに押し倒され、仲間の前で喰い殺された');
vic.hp-=40+rng.int(25);ctx.stress(vic,40);
if(vic.hp<=0)ctx.kill(vic,null,v.name+'を助けに入り、ゾンビの群れに喰われた');
else Z.infect(ctx,vic,null,true);
return{with:actors,text:t2,why:why+'――助けに入った'+vic.name+'も巻き込まれた',mag:60};
}
mates.forEach(function(x){ctx.stress(x,30);x.flags.grief=v.i;var na=rng.pick(Z.adj(x.z.area));x.z.area=na;x.z.path.push(na);});
ctx.kill(v,null,'ゾンビの群れに押し倒され、仲間の前で喰い殺された');
return{with:actors,text:t+fill(ctx.pick(X.abandon),m)+fill(ctx.pick(lv==='high'?X.die:X.dieFade),m),why:why+'――仲間は、助けられなかった'+(here?'（恋人の'+L0.name+'の目の前で）':''),mag:60};
};
})();
});
;
/* ==== js/zombie-map.js ==== */
HK.Load.def(165,'js/zombie-map.js',function(){
(function(){
'use strict';
var HK=window.HK;
if(!HK.Endings|| !HK.Endings.zombie)return;
function esc(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];});}
function KEY(){return HK.STORE?HK.STORE.key('hakoniwa_zmap_open'):'hakoniwa_zmap_open';}
function isOpen(){try{return localStorage.getItem(KEY())!=='0';}catch(e){return true;}}
function tag(f){
if(/救助/.test(f))return['救助','ok','救'];
if(/脱出/.test(f))return['脱出','ok','脱'];
if(/ゾンビ/.test(f))return['ゾンビ','z','ゾ'];
if(/生き延び/.test(f))return['生存','ok','生'];
return['死亡','dead','死'];
}
var X0=16,Y0=16,CW=92,CH=104,SEA=40,ROAD=4.5;
var VW=X0+CW*3+SEA,VH=Y0+CH*3+SEA;
function f1(v){return Math.round(v*10)/10;}
function pt(p){return f1(p[0])+','+f1(p[1]);}
function jit(n,a){return((n*7919)%11/10-0.5)*a;}
var JN=[];
(function(){
for(var r=0;r<4;r++){
JN[r]=[];
for(var c=0;c<4;c++){
var ic=c>0&&c<3,ir=r>0&&r<3;
JN[r][c]=[X0+c*CW+(ic?jit(r*4+c+3,10):jit(r*4+c+17,4)),Y0+r*CH+(ir?jit(r*4+c+29,10):jit(r*4+c+41,4))];
}
}
})();
function add(a,b){return[a[0]+b[0],a[1]+b[1]];}
function toward(a,b,d){var dx=b[0]-a[0],dy=b[1]-a[1],l=Math.sqrt(dx*dx+dy*dy)||1;return[a[0]+dx/l*d,a[1]+dy/l*d];}
var BLK=[0,1,2,3,4,5,6,7,8].map(function(i){
var r=Math.floor(i/3),c=i%3;
var q=[add(JN[r][c],[ROAD,ROAD]),add(JN[r][c+1],[-ROAD,ROAD]),add(JN[r+1][c+1],[-ROAD,-ROAD]),add(JN[r+1][c],[ROAD,-ROAD])];
var pts=[];
q.forEach(function(p,k){
var ch=[0,6,11][(i*5+k*3+1)%3];
if(!ch){pts.push(p);return;}
pts.push(toward(p,q[(k+3)%4],ch),toward(p,q[(k+1)%4],ch));
});
var L=Math.max(q[0][0],q[3][0]),R=Math.min(q[1][0],q[2][0]),T=Math.max(q[0][1],q[1][1]),B=Math.min(q[2][1],q[3][1]);
return{pts:pts,d:pts.map(pt).join(' '),L:L,R:R,T:T,B:B,cx:(L+R)/2,w:R-L,h:B-T};
});
function lines(name){
var s=String(name||''),a=Array.from(s),m,k;
if(a.length<=6)return[s];
if((m=s.match(/^(.+?)([（(].*)$/)))return[m[1],m[2]];
if((k=s.indexOf('・'))>0&&k<s.length-1)return[s.slice(0,k+1),s.slice(k+1)];
if((m=s.match(/^(.+?)(モール|通り|地区|病院|事務所|住宅街|住宅地|パーク|公園|センター)$/)))return[m[1],m[2]];
if((k=s.indexOf('の'))>0&&k<s.length-2)return[s.slice(0,k+1),s.slice(k+1)];
var h=Math.ceil(a.length/2);
return[a.slice(0,h).join(''),a.slice(h).join('')];
}
function defs(res,M){
var Z=HK.ZB||{},A=Z.AREAS||{},reg=res.end.zombie.reg,list=A[reg]||[];
return M.names.map(function(n,i){
var d=list[i]&&list[i].name===n?list[i]:null;
Object.keys(A).forEach(function(k){if(!d)d=(A[k]||[]).filter(function(x){return x.name===n;})[0]||null;});
return d||{name:n,exit:M.exit[i]?'出口':''};
});
}
function exitKind(d){
var e=String(d.exit||'');
if(/船|海|沖/.test(e))return'sea';
if(/線路|電車|鉄道/.test(e))return'rail';
return'road';
}
function symbol(d,b){
var n=d.name||'',x=b.cx,y=b.T+b.h*0.6,o='';
if(d.med)return'<path class="zm-sym zm-med" d="M'+f1(x-3.5)+' '+f1(y-11)+'h7v7.5h7.5v7h-7.5v7.5h-7v-7.5h-7.5v-7h7.5z"/>';
if(d.guns){
var s=[];
for(var k=0;k<10;k++){var rr=k%2?5:12,an= -Math.PI/2+k*Math.PI/5;s.push(f1(x+Math.cos(an)*rr)+','+f1(y+Math.sin(an)*rr));}
return'<polygon class="zm-sym" points="'+s.join(' ')+'"/>';
}
if(d.shelter)return'<path class="zm-sym" d="M'+f1(x-13)+' '+f1(y-2)+'L'+f1(x)+' '+f1(y-13)+'L'+f1(x+13)+' '+f1(y-2)+'v14h-26z"/><rect class="zm-ground" x="'+f1(x-3)+'" y="'+f1(y+4)+'" width="6" height="8"/>';
if(/公園|パーク/.test(n)){
[[-24,-8],[-12,4],[2,-12],[16,2],[26,-10],[-30,10],[8,12],[22,16],[-18,18]].forEach(function(p,k){o+='<circle class="zm-tree" cx="'+f1(x+p[0])+'" cy="'+f1(y+p[1])+'" r="'+(k%3?3.2:4.4)+'"/>';});
return o+'<ellipse class="zm-pond" cx="'+f1(x-2)+'" cy="'+f1(y+2)+'" rx="8" ry="4.5"/>';
}
if(/モール/.test(n))return'<rect class="zm-sym zm-bld" x="'+f1(x-22)+'" y="'+f1(y-12)+'" width="44" height="22" rx="2"/><path class="zm-symln" d="M'+f1(x-22)+' '+f1(y-1)+'h44M'+f1(x)+' '+f1(y-12)+'v22"/>';
if(/商店|ダイナー|通り/.test(n)){
for(var j=0;j<6;j++)o+='<rect class="zm-sym zm-bld" x="'+f1(x-33+j*11)+'" y="'+f1(y-4)+'" width="8.5" height="8" rx="1"/>';
return o;
}
if(/住宅/.test(n)){
[[-26,-10],[-12,-12],[4,-10],[18,-12],[-20,4],[-4,6],[12,4],[26,6]].forEach(function(p){o+='<rect class="zm-sym zm-bld" x="'+f1(x+p[0]-4)+'" y="'+f1(y+p[1]-3.5)+'" width="8" height="7" rx="1"/>';});
return o;
}
if(/ダウンタウン|駅/.test(n)){
[[-24,-12,14,12],[-6,-14,10,16],[8,-10,16,10],[-20,4,12,10],[0,6,18,9]].forEach(function(p){o+='<rect class="zm-sym zm-bld" x="'+f1(x+p[0])+'" y="'+f1(y+p[1])+'" width="'+p[2]+'" height="'+p[3]+'" rx="1"/>';});
return o;
}
if(/港/.test(n)){
[[-24,-10],[-12,-10],[0,-10],[-24,0],[-12,0],[12,4]].forEach(function(p){o+='<rect class="zm-sym zm-bld" x="'+f1(x+p[0])+'" y="'+f1(y+p[1])+'" width="10" height="6" rx="0.5"/>';});
return o;
}
return'';
}
function base(res,M,D,end,cap){
var o='<svg class="zm-svg" viewBox="0 0 '+VW+' '+VH+'" width="'+VW+'" height="'+VH+'" role="img" aria-label="'+esc('街の地図（'+cap+'）')+'" focusable="false">';
o+='<rect class="zm-land" x="0" y="0" width="'+VW+'" height="'+VH+'"/>';
var seaI=D.map(function(d,i){return M.exit[i]&&exitKind(d)==='sea'?i: -1;}).filter(function(i){return i>=0;})[0];
var hasSea=seaI===8||(seaI==null&& /港/.test(M.names[8]||''));
if(hasSea){
var xc=JN[3][3][0]+11,yb=JN[3][3][1]+11,ya=JN[1][3][1]+CH*0.42,xa=JN[3][1][0]+CW*0.42;
var ym=(ya+yb)/2,xm=(xa+xc)/2;
o+='<path class="zm-sea" d="M'+VW+' '+f1(ya)+'Q'+f1(xc+4)+' '+f1(ya+1)+' '+f1(xc)+' '+f1(ya+16)+
'Q'+f1(xc-5)+' '+f1(ym)+' '+f1(xc)+' '+f1(yb-20)+'Q'+f1(xc)+' '+f1(yb)+' '+f1(xc-20)+' '+f1(yb)+
'Q'+f1(xm)+' '+f1(yb+5)+' '+f1(xa+16)+' '+f1(yb)+'Q'+f1(xa+1)+' '+f1(yb+1)+' '+f1(xa)+' '+VH+'L'+VW+' '+VH+'Z"/>';
[[VW-13,ya+40],[VW-15,yb-8],[xa+40,VH-9],[VW-34,VH-6]].forEach(function(p){o+='<path class="zm-wave" d="M'+f1(p[0]-6)+' '+f1(p[1])+'q1.5 -2.4 3 0t3 0t3 0t3 0"/>';});
o+='<text class="zm-sealb" x="'+f1(VW-8)+'" y="'+f1(VH-10)+'">海</text>';
}
var ring=[];
for(var c=0;c<4;c++)ring.push(JN[0][c]);
for(var r=1;r<4;r++)ring.push(JN[r][3]);
for(c=2;c>=0;c--)ring.push(JN[3][c]);
for(r=2;r>=1;r--)ring.push(JN[r][0]);
var rd=ring.map(pt).join(' ');
o+='<polygon class="zm-edge" points="'+rd+'"/><polygon class="zm-ground zm-gring" points="'+rd+'"/>';
D.forEach(function(d,i){
if(!M.exit[i])return;
var b=BLK[i],k=exitKind(d),rr=Math.floor(i/3),cc=i%3;
if(k==='sea'&&i===8&&hasSea){
o+='<rect class="zm-pier" x="'+f1(b.R-2)+'" y="'+f1(b.T+b.h*0.3)+'" width="20" height="3.2"/><rect class="zm-pier" x="'+f1(b.L+b.w*0.5)+'" y="'+f1(b.B-2)+'" width="3.2" height="20"/>';
o+='<path class="zm-route" d="M'+f1(b.R+18)+' '+f1(b.T+b.h*0.3+1.6)+'Q'+f1(VW-8)+' '+f1(b.B)+' '+f1(VW-5)+' '+f1(VH-22)+'"/>';
o+='<path class="zm-arrow" d="M'+f1(VW-9.5)+' '+f1(VH-26)+'L'+f1(VW-5)+' '+f1(VH-20)+'L'+f1(VW-1.5)+' '+f1(VH-26.5)+'"/>';
return;
}
var up=rr===0||(rr!==2&&cc!==0&&cc!==2),left= !up&&cc===0,x,y,d1;
if(up||rr===2){
x=b.L+b.w*0.27;y=up?b.T:b.B;
d1='M'+f1(x)+' '+f1(y)+'V'+(up?0:VH);
}else{
y=b.T+b.h*0.3;x=left?b.L:b.R;
d1='M'+f1(x)+' '+f1(y)+'H'+(left?0:VW);
}
if(k==='rail')o+='<path class="zm-rail" d="'+d1+'"/><path class="zm-railt" d="'+d1+'"/>';
else o+='<path class="zm-hwy" d="'+d1+'"/><path class="zm-hwyc" d="'+d1+'"/>';
var ex=up||rr===2?f1(x):(left?2:VW-2),ey=up?2:rr===2?VH-2:f1(y);
if(up)o+='<path class="zm-arrow" d="M'+f1(x-4.5)+' 7.5L'+f1(x)+' 2.5L'+f1(x+4.5)+' 7.5"/>';
o+='<text class="zm-exlb" x="'+f1((up||rr===2?x:ex)+7)+'" y="'+(up?10.5:f1(ey-3))+'">'+esc(k==='rail'?'線路・街の外へ':'街の外へ')+'</text>';
});
var cl='';
[1,2].forEach(function(r){cl+='M'+JN[r].map(pt).join('L');});
[1,2].forEach(function(c){cl+='M'+[0,1,2,3].map(function(r){return pt(JN[r][c]);}).join('L');});
o+='<path class="zm-cl" d="'+cl+'"/>';
D.forEach(function(d,i){
var b=BLK[i],z=(end?M.z1:M.z0)[i]||0;
o+='<polygon class="zm-blk" points="'+b.d+'"/>'+symbol(d,b);
if(z>0)o+='<polygon class="zm-fog" points="'+b.d+'" style="fill-opacity:'+(Math.min(100,z)/100*0.5).toFixed(2)+'"/>';
var nc=z>=30?Math.min(5,Math.floor((z-15)/15)):0;
[[0.14,0.62],[0.86,0.66],[0.2,0.9],[0.8,0.9],[0.5,0.52]].slice(0,nc).forEach(function(p,k){
var gx=b.L+b.w*p[0]+jit(i*5+k,4),gy=b.T+b.h*p[1];
o+='<circle class="zm-zd" cx="'+f1(gx)+'" cy="'+f1(gy)+'" r="1.5"/><circle class="zm-zd" cx="'+f1(gx+3.4)+'" cy="'+f1(gy+1.2)+'" r="1.3"/><circle class="zm-zd" cx="'+f1(gx+1.2)+'" cy="'+f1(gy+3.6)+'" r="1.3"/>';
});
var badges=[],fell=false;
if(M.shelter[i]){fell=end&&M.fell&&M.safe===i;badges.push(fell?'避難所（陥落）':'避難所');}
if(M.exit[i])badges.push('出口');
if(end&&M.heli===i)badges.push('ヘリ');
if(end&&M.safe===i&& !M.fell)badges.push('本当に安全');
var ty=b.T+13;
if(badges.length){
var bt=badges.join('・'),bl=Array.from(bt).length,fs=Math.min(8,(b.w-8)/bl),bw=bl*fs+6;
o+='<g class="zm-bdg'+(fell?' fell':'')+'"><rect x="'+f1(b.L+2)+'" y="'+f1(b.T-4.5)+'" width="'+f1(bw)+'" height="'+f1(fs+4)+'" rx="2"/>'+
'<text x="'+f1(b.L+5)+'" y="'+f1(b.T-4.5+fs+1.1)+'" style="font-size:'+f1(fs)+'px">'+esc(bt)+'</text></g>';
ty=b.T+18;
}
var ls=lines(d.name);
ls.forEach(function(l,k){
var fz=Math.min(10.5,(b.w-6)/Math.max(1,Array.from(l).length));
o+='<text class="zm-nm" x="'+f1(b.cx)+'" y="'+f1(ty+k*11.5)+'"'+(fz<10.5?' style="font-size:'+f1(fz)+'px"':'')+'>'+esc(l)+'</text>';
});
o+='<text class="zm-zc" x="'+f1(b.cx)+'" y="'+f1(ty+ls.length*11.5-1)+'">ゾンビ '+z+'</text>';
});
return o+'</svg>';
}
function pins(res,M,end){
var by=[[],[],[],[],[],[],[],[],[]];
M.chars.forEach(function(c,k){var a=end?c.l:c.s;if(res.chars[k]&&by[a])by[a].push(k);});
var o='';
by.forEach(function(ks,i){
var n=ks.length;
if(!n)return;
var b=BLK[i],rows=n<=3?1:n<=8?2:3,per=Math.ceil(n/rows),sm=rows>1;
var sp=Math.min(22,(b.w-18)/Math.max(1,per-1+(rows>1?0.5:0)));
for(var row=rows-1;row>=0;row--){
var part=ks.slice(row*per,row*per+per),m=part.length,tipY=b.B-(end?13:7)-row*(sm?15:17),off=rows>1?(row%2?sp/4: -sp/4):0;
part.forEach(function(k,j){
var ch=res.chars[k],mc=M.chars[k],t=end?tag(mc.f):null;
var x=b.cx+(j-(m-1)/2)*sp+off;
var col=t&&t[1]!=='ok'?'var(--enemy)':(HK.Icons.color&&HK.Icons.color(ch.name))||'var(--p'+(k%30)+')';
var av=HK.Icons.html(ch.name,k,26,t&&t[1]!=='ok'?'gone':'').replace(/ title="[^"]*"/,'');
o+='<span class="zm-pin'+(t?' '+t[1]:'')+(sm?' sm':'')+(t&&row===0?' lo':'')+'" style="left:'+(x/VW*100).toFixed(2)+'%;top:'+(tipY/VH*100).toFixed(2)+'%;--pc:'+col+'" title="'+esc(ch.name+(t?'：'+mc.f:''))+'">'+
av+(t?'<i data-s="'+t[2]+'"><b>'+t[0]+'</b></i>':'')+'</span>';
});
}
});
return o;
}
function map(res,M,D,end){
var cap=end?'最終日の状態':'開始時';
return'<figure class="zm-g"><figcaption>'+cap+'</figcaption><div class="zm-map" style="--ar:'+(VH/VW*100).toFixed(3)+'%">'+base(res,M,D,end,cap)+pins(res,M,end)+'</div></figure>';
}
HK.zombieMapHtml=function(res){
var M=res.end&&res.end.zombie&&res.end.zombie.map;
if(!M|| !M.names|| !HK.Icons)return'';
var D=defs(res,M);
return'<details class="zmap"'+(isOpen()?' open':'')+'>'+
'<summary>街のマップ（開始地点と最後の状態）</summary>'+
'<div class="zm-wrap">'+map(res,M,D,false)+map(res,M,D,true)+'</div>'+
'<p class="hint">区画の色が濃いほど、点々（群れ）が多いほどゾンビが多い。道でつながった上下左右の区画にしか移動できない。ピンは住人のいた場所。最後の状態では、亡くなった人（破線のピン）は倒れた場所、ゾンビになった人（斜線のピン）は今さまよっている場所に立っている。札は救助・脱出・生存・死亡・ゾンビ（図が狭いときは頭の1文字）。</p></details>';
};
document.addEventListener('toggle',function(e){
var d=e.target;
if(d&&d.classList&&d.classList.contains('zmap')){try{localStorage.setItem(KEY(),d.open?'1':'0');}catch(x){}}
},true);
var baseEnd=HK.Endings.zombie;
HK.Endings.zombie=function(res,X){
var o=baseEnd(res,X);
o.after=HK.zombieMapHtml(res);
return o;
};
})();
});
;
/* ==== js/zombie-special.js ==== */
HK.Load.def(174,'js/zombie-special.js',function(){
(function(){
'use strict';
var HK=window.HK,Z=HK.ZB,SP=HK.Special;
if(!Z|| !Z.scen|| !SP)return;
var LOVE= /^(lover|mate|fated|almost|fwb)$/;
var BACK=['{a}の濁った目に、少しずつ光が戻っていった。腐りかけていた肌が張りを取り戻し、{a}は自分の手を見つめた。指は、思ったとおりに動いた。','ゾンビの群れの中で、{a}の足が止まった。{a}は激しく咳き込み、黒い血を吐き出した。次に顔を上げたとき、{a}は人間の目をしていた。'];
function adapter(ctx){
var A=ctx.spA;
if(!A)A=ctx.spA={
rng:ctx.rng,all:ctx.chars,env:ctx.env,scenId:'zombie',
r18: !HK.SAFE_ON&&(ctx.env.zlewd!=null|| !!(HK.Lewd&&HK.Lewd.conf('zombie')))&&Z.loveLv(ctx)!=='off',lewd:Z.loveLv(ctx)==='high'?0.55:0.3,
alive:function(c){return!!c.alive;},
here:function(c){return!c.out&& !(c.flags&&c.flags.caged!=null);},
near:function(a,b){return a.z&&b.z&&a.z.area===b.z.area;},
say:function(o){
var e=ctx.act2({actors:o.actors,cat:o.tag==='吸血'||o.tag==='凶行'?'combat':'solo',text:o.text,why:o.why,mag:o.mag||0});
return e;
},
hp:function(c){return c.hp;},
setHp:function(c,v){c.hp=Math.max(0,Math.min(c.hpMax||100,v));},
full:function(c){return c.hpMax||100;},
stress:function(c){return c.stress;},
addStress:function(c,v){c.stress=Math.max(0,Math.min(100,c.stress+v));},
rel:function(a,b){
var t=HK.Ties&&HK.Ties.get(ctx,a,b),r=ctx.R(a,b);
return{love: !!((t&&LOVE.test(t.type||''))||ctx.pair(a,b).couple),w:Math.max(-1,Math.min(1,r.aff/80))};
},
relMod:function(b,a,how){ctx.mod(b,a,how==='力ずく'?{trust: -25,aff: -15}:how==='催眠'?{trust: -6}:{aff:6,trust:6});},
reviveText:function(c){return c.spWasZ?BACK[Math.floor(ctx.rng()*BACK.length)].replace(/\{a\}/g,c.name):null;},
revive:function(c){
var zb=ctx.zb;
c.spWasZ=c.fate==='ゾンビ化';
if(c.spWasZ){
zb.zpc=zb.zpc.filter(function(z){return z.i!==c.i;});
}
c.alive=true;c.fate='';c.fateNote='';c.deathHow='';c.diedAt=null;c.killedBy=null;
c.z.bitten=null;c.z.turnAt= -1;c.z.aware=false;c.z.decided=false;c.z.wound= -1;c.z.hiding=false;
},
kill:function(c,how,text,by){
ctx.act2({actors:by?[by,c]:[c],cat:'death',text:text,why:how+'命を落とした',mag:40});
ctx.kill(c,by||null,how);
},
zombie:function(c){return!!(c.z&&c.z.bitten);}
};
A.nowH=ctx.stepIndex*6;
return A;
}
var sc=Z.scen,setup0=sc.setup,phase0=sc.phase,after0=sc.after,finish0=sc.finish,end0=sc.end;
sc.end=function(ctx){return end0(ctx)&& !ctx.chars.some(function(c){return c.spec&& !c.alive&& !c.spNoRev&& !c.spGone&& !c.out;});};
sc.setup=function(ctx){
setup0(ctx);
ctx.chars.forEach(function(c){c.hpMax=c.hp;});
SP.setup(adapter(ctx),ctx.chars,function(c){return{pick:c.pick};});
};
sc.phase=function(ctx,s,n){
var A=adapter(ctx);
if(s>0)SP.revive(A);
phase0(ctx,s,n);
ctx.flush();
ctx.present().forEach(function(c){
if(!c.alive||c.out)return;
if(c.mad)SP.madTurn(A,c);
else if(c.spec==='vampire')SP.vampTurn(A,c);
});
};
sc.after=function(ctx,s,n){
after0(ctx,s,n);
var A=adapter(ctx);
ctx.present().forEach(function(c){SP.wear(A,c,{base:64,lim:26});});
if(s===n-1)SP.revive(A);
};
sc.finish=function(ctx){
finish0(ctx);
ctx.chars.forEach(function(c){var t=SP.endNote(c);if(t)c.fateNote=(c.fateNote?c.fateNote+'／':'')+t;});
};
})();
(function(){
'use strict';
var HK=window.HK,Z=HK.ZB,sc=Z&&Z.scen;
if(!sc)return;
function L(s){return s.split('|');}
function nm(list){list=list.map(function(c){return c.name;});return list.length>6?list.slice(0,6).join('・')+'ほか'+(list.length-6)+'人':list.join('・');}
function fill(t,o){return t.replace(/\{(\w+)\}/g,function(m,k){return o[k]!=null?o[k]:m;});}
var T={
heli:L('{G}を乗せたヘリは、朝日の中を海の方へ飛んでいった。窓の外で、街の煙が小さくなっていく。しばらく誰も口をきかなかった。|{G}は、ヘリの床に座りこんだまま毛布を肩にかけられた。隣にいる人の体温だけが、生き延びた証だった。|ヘリは街を離れ、海沿いに設けられた避難キャンプに着いた。降り立った{G}は、配られた温かい汁物を、黙って最後の一滴まで飲んだ。悪夢は、ひとまずここで終わった。'),
out:L('{G}は、街の境を越えたところで一度だけ振り返った。煙の上がる街は、もう遠い景色になっていた。|{G}は、検問の灯りを目指して夜道を歩き続けた。街の外にも、ちゃんと朝は来るらしかった。|街を抜け出した{G}は、知らない町の避難所で、久しぶりに靴を脱いで眠った。'),
stay:L('{D}日目の夜が明けた。{G}は{P}で、残った食料を数え直した。この先どうなるかは分からない。それでも、今日を生き延びた。|{G}は{P}の窓から、昇ってくる朝日を眺めた。呻き声は遠い。生き残った人だけの、静かな朝だった。|{D}日が過ぎた。{G}は{P}で、交代で見張りに立つ順番を決めた。この街で生きていくための、最初の決まりごとだった。'),
missed:L('ヘリの音が消えた空を、{G}はしばらく見上げていた。|救助は、{G}のいる場所には降りてこなかった。|乗りそこねたヘリの影を、{G}は黙って見送った。'),
zomb:L('{Z}は、今も呻き声の群れの中にいる。|{Z}だったものが、まだ街のどこかをさまよっている。|{Z}の名前を呼んでも、もう返事はない。'),
dead:L('{X}は、この{D}日間を越えられなかった。|{X}の名前を、生き残った人は忘れない。|{X}は、帰ってこなかった。'),
burn:L('{D}日目の夜、街は白い炎に包まれた。{X}の足跡も叫び声も、すべて灰の下に消えた。生き残った人は、一人もいなかった。|空が白く光ったあと、街には何も残らなかった。{X}がここで生きていたことを知る人は、もういない。|炎は朝まで燃え続けた。{X}が身を寄せ合った場所も、守ろうとしたものも、すべて灰になった。'),
wipe:L('{D}日目、街に動くものはもう人の姿をしていなかった。{X}の話は、ここで途切れた。|誰もいなくなった避難所で、手回しラジオだけが救助の呼びかけを繰り返していた。応える声は、もうなかった。|{D}日目。街には呻き声だけが残った。{X}がここで生きていたことを、知る人はいない。'),
burnOut:L('その夜、背後の街は白い炎に包まれた。|街を出たあと、遠くの空が白く光った。|夜になって、街は丸ごと焼き払われた。')
};
function closing(ctx){
var C=ctx.chars,env=ctx.env,D=parseInt(ctx.label,10)||env.days;
var heli=C.filter(function(c){return c.out&&c.fate==='救助された';});
var out=C.filter(function(c){return c.out&&c.fate!=='救助された';});
var stay=C.filter(function(c){return c.alive&& !c.out;});
var zomb=C.filter(function(c){return!c.alive&&c.fate==='ゾンビ化';});
var dead=C.filter(function(c){return!c.alive&&c.fate!=='ゾンビ化';});
var gone=zomb.concat(dead),t='',title;
var area=function(list){return list.map(function(c){return c.z&&ctx.zb.A[c.z.area]?ctx.zb.A[c.z.area].name:'';}).filter(function(v,i,a){return v&&a.indexOf(v)===i;}).join('や');};
if(!heli.length&& !out.length&& !stay.length){
t=fill(ctx.pick(env.end==='burn'&&D>=env.days?T.burn:T.wipe),{D:D,X:nm(gone)});
title=env.end==='burn'&&D>=env.days?'街は焼き払われた ― 全滅':'全滅';
}else{
if(heli.length)t+=fill(ctx.pick(T.heli),{G:nm(heli)});
if(out.length)t+=fill(ctx.pick(T.out),{G:nm(out)});
if(env.end==='burn'&&(heli.length||out.length)&&D>=env.days)t+=ctx.pick(T.burnOut);
if(stay.length)t+=(env.end==='heli'&&D>=env.days?fill(ctx.pick(T.missed),{G:nm(stay)}):'')+fill(ctx.pick(T.stay),{G:nm(stay),D:D,P:area(stay)||'街の片隅'});
if(zomb.length)t+=fill(ctx.pick(T.zomb),{Z:nm(zomb)});
if(dead.length)t+=fill(ctx.pick(T.dead),{X:nm(dead),D:D});
title=heli.length?'救助ヘリで脱出':out.length?'街を脱出':env.end==='heli'&&D>=env.days?'救助を逃して生き延びた':env.end==='none'&&D>=env.days?'最後の日を生き延びた':'生き延びた';
title+=' ― '+(ctx.flags.outcome||'');
}
ctx.flags.outcome=title;
ctx.say({kind:'step',cat:'phase',text:'結末'});
ctx.say({kind:'event',cat:'phase',cageOk:true,actors:heli.concat(out,stay).length?heli.concat(out,stay):gone,text:t,why:'結末：'+title,mag:30});
}
var fin0=sc.finish;
sc.finish=function(ctx){
var r=fin0?fin0.apply(this,arguments):undefined;
ctx.flush();
closing(ctx);
return r;
};
})();
});
;
/* ==== js/incidents-zombie.js ==== */
HK.Load.def(301,'js/incidents-zombie.js',function(){
(function(){
'use strict';
var HK=window.HK,K=HK.IncExtra;
if(!K)return;
HK.INCIDENTS=HK.INCIDENTS||{};
var R=K.R,L=K.L,loveOK=K.loveOK,zPair=K.zPair,zLive=K.zLive,spaced=K.spaced;
HK.INCIDENTS.zombie=[
{
id:'radio',min:1,from:1,
run:function(ctx){
var P=zLive(ctx);
if(!P.length)return;
ctx.incident(ctx.pick(L('ノイズまじりの臨時放送が流れた。「⁠――生存者は、北の高台へ。繰り返す……」放送は途中で途切れた。|拾ったラジオから、自衛隊の呼びかけが聞こえた。「⁠救助は継続中。むやみに動かず――」そこで電波が消えた。')));
P.forEach(function(c){ctx.stress(c,-6);});
var doubt=ctx.most(P,function(c){return c.tr.a*0.7+c.tr.caution*0.4;});
var hope=ctx.most(P.filter(function(c){return c!==doubt;}),function(c){return c.tr.fc*0.6+c.tr.impulse*0.4;});
if(doubt&&doubt.tr.a>0.55)ctx.act2({actors:[doubt],cat:'solo',text:ctx.t('{a}は放送の内容を書き留め、繰り返し聞き直した。「録音かもしれない。……鵜呑みにはしない｜＝｜録音かもしれません。……鵜呑みにはしません」',doubt),why:doubt.name+'のA（'+Math.round(doubt.eg.A)+'）：冷静に疑う'});
if(hope)ctx.act2({actors:[hope],cat:'solo',fx:function(){ctx.stress(hope,-8);},text:ctx.t('{a}は思わず拳を握った。「まだ、誰かが動いてるんだ｜まだ、誰かが動いているのか｜まだ、誰かが動いているんですね」',hope),why:hope.name+'のFC：希望に飛びつく'});
}
},
{
id:'rain',once:false,min:1,from:1,
run:function(ctx){
var P=zLive(ctx);
if(!P.length)return;
ctx.incident(ctx.pick(L('冷たい雨が降り出した。雨音にまぎれて、群れのうめき声が遠のいていく。|夕方から土砂降りになった。ゾンビたちは軒下で動きを止め、街が少しだけ静かになった。')));
P.forEach(function(c){ctx.stress(c,-3);});
var pr=zPair(ctx,P,15);
if(pr)ctx.act2({actors:pr,cat:R(ctx,pr[0],pr[1]).att>35&&loveOK(ctx,pr[0],pr[1])?'romance':'bond',fx:function(){ctx.mod2(pr[0],pr[1],loveOK(ctx,pr[0],pr[1])?{aff:5,att:3}:{aff:5},loveOK(ctx,pr[0],pr[1])?{aff:5,att:3}:{aff:5});},
text:ctx.t(ctx.pick(L('雨宿りの軒下で、{a}と{b}は濡れた肩を寄せ合った。しばらく、どちらも何も言わなかった。|{a}は{b}に、乾いた上着を半分かけた。「雨の音、嫌いじゃない｜雨の音は、嫌いではない｜雨の音、嫌いじゃないです」と{b}が言った。')),pr[0],pr[1]),why:'雨で群れが静まった（ハプニングの頻度 '+ctx.env.incident+'）'});
}
},
{
id:'blackout',once:false,min:1,from:2,
run:function(ctx){
var P=zLive(ctx);
if(!P.length)return;
ctx.incident(ctx.pick(L('街の明かりが、一斉に消えた。最後まで点いていた信号機も、もう光らない。|変電所が落ちたらしい。どの建物も真っ暗になり、闇の中で何かが窓を叩く音だけが残った。')));
P.forEach(function(c){ctx.stress(c,8+c.tr.ac*6);});
var keep=ctx.most(P,function(c){return c.tr.caution*0.6+c.tr.cp*0.4;});
if(keep&&keep.tr.caution>0.5)ctx.act2({actors:[keep],cat:'help',fx:function(){ctx.others(keep).forEach(function(o){ctx.mod(o,keep,{trust:4});});},text:ctx.t('{a}は手探りで懐中電灯を探し当て、光が外に漏れないよう布で覆った。',keep),why:keep.name+'の慎重さ'});
var pr=zPair(ctx,P,25,true);
if(pr)ctx.act2({actors:pr,cat:'romance',fx:function(){ctx.mod2(pr[0],pr[1],{att:5,trust:3},{att:5,trust:3});},
text:ctx.t(ctx.pick(L('暗闇の中で、{a}の手が{b}の手を探し当てた。どちらも、離そうとしなかった。|「……そこにいる？｜……そこにいるのか｜……そこにいますか？」{b}の声に、{a}は肩を触れ合わせて答えた。')),pr[0],pr[1]),why:'停電の暗闇で、互いの存在を確かめ合った'});
}
},
{
id:'siren',min:1,from:2,
run:function(ctx){
var P=zLive(ctx);
if(!P.length)return;
ctx.incident('遠くでサイレンが鳴り続けている。音のする方へ、群れがゆっくりと流れていった。');
P.forEach(function(c){ctx.stress(c,6);});
var go=ctx.most(P,function(c){return c.tr.impulse*0.6+c.tr.fc*0.4;});
var stop=go?ctx.most(P.filter(function(c){return c!==go&&c.z&&go.z&&c.z.area===go.z.area;}),function(c){return c.tr.caution*0.6+c.tr.np*0.3;}):null;
if(go&&go.tr.impulse>0.55){
if(stop&&stop.tr.caution>0.45)ctx.act2({actors:[stop,go],cat:'help',fx:function(){ctx.mod2(stop,go,{trust:3},{ten:3,trust:4});},text:ctx.t('「様子を見に行こう｜＝｜様子を見に行きましょう」と言いかけた{b}の袖を、{a}が掴んだ。「群れが向かってる方だよ。行かないで｜群れが向かっている方だ。行くな｜群れが向かっている方です。行かないでください」',stop,go),why:stop.name+'の慎重さが、'+go.name+'の衝動性を止めた'});
else ctx.act2({actors:[go],cat:'solo',fx:function(){ctx.stress(go,6);},text:ctx.t('{a}は窓から身を乗り出して、サイレンの方角をいつまでも見ていた。',go),why:go.name+'の衝動性'});
}
}
},
{
id:'airdrop',min:1,from:2,
run:function(ctx){
var P=zLive(ctx);
if(!P.length)return;
var a=ctx.rng.pick(P);
ctx.incident('ヘリの音が近づき、パラシュートつきの箱が'+a.name+'のいる辺りに落ちてきた。');
ctx.act2({actors:[a],cat:'help',fx:function(){if(a.z){a.z.food=(a.z.food||0)+2;a.z.hunger=0;}ctx.stress(a,-6);},text:ctx.t('{a}は群れの隙をついて箱を引きずり込んだ。中身は缶詰と水だった。',a),why:a.name+'の近くに物資が落ちた（運）'});
var mates=P.filter(function(o){return o!==a&&o.z&&a.z&&o.z.area===a.z.area&& !o.z.alone;});
if(mates.length){
var b=ctx.rng.pick(mates);
if(a.tr.np>0.5||R(ctx,a,b).aff>30)ctx.act2({actors:[a,b],cat:'bond',fx:function(){if(b.z)b.z.food=(b.z.food||0)+1;ctx.mod(b,a,{aff:8,trust:8});},text:ctx.t('{a}は缶詰を半分、黙って{b}の前に置いた。',a,b),why:a.name+'のNP・'+b.name+'への好意'});
else if(a.tr.cold>0.55)ctx.act2({actors:[a,b],cat:'conflict',fx:function(){ctx.mod(b,a,{ten:10,aff: -5});},text:ctx.t('{a}は箱を抱えたまま、{b}に背を向けた。「見つけたのは私だよ｜見つけたのは私だ｜見つけたのは私です」',a,b),why:a.name+'のドライさ'});
}
}
},
{
id:'scream',once:false,min:1,from:3,
run:function(ctx){
var P=zLive(ctx);
if(!P.length)return;
ctx.incident('夜の向こうで、誰かの悲鳴が上がった。そして、急に途切れた。');
P.forEach(function(c){ctx.stress(c,5+c.tr.np*5);});
var help=ctx.most(P,function(c){return c.tr.np*0.7+c.tr.cp*0.3;});
var cold=help?ctx.most(P.filter(function(c){return c!==help&&c.z&&help.z&&c.z.area===help.z.area;}),function(c){return c.tr.cold;}):null;
if(help&&help.tr.np>0.55){
if(cold&&cold.tr.cold>0.5)ctx.act2({actors:[cold,help],cat:'conflict',fx:function(){ctx.mod2(cold,help,{ten:4},{ten:8,aff: -3});},text:ctx.t('立ち上がった{b}の前に、{a}が立ちはだかった。「今行っても、死体が一つ増えるだけだよ｜今行っても、死体が一つ増えるだけだ｜今行っても、死体が一つ増えるだけです」',cold,help),why:cold.name+'のドライさと、'+help.name+'のNPがぶつかった'});
else ctx.act2({actors:[help],cat:'solo',fx:function(){ctx.stress(help,8);},text:ctx.t('{a}は耳を塞いだ。助けに行けなかった自分を、朝まで責め続けた。',help),why:help.name+'のNP'});
}
}
},
{
id:'message',min:1,from:2,
run:function(ctx){
var P=zLive(ctx);
if(!P.length)return;
var a=ctx.rng.pick(P);
ctx.incident(a.name+'は、壁にスプレーで書かれた伝言を見つけた。「⁠生きてる。○○中学の屋上にいる。――ユウキ」日付は三日前だった。');
ctx.act2({actors:[a],cat:'solo',fx:function(){ctx.stress(a,a.tr.np>0.5? -4:2);},text:ctx.t(a.tr.np>0.5?'{a}は伝言の下に、自分の名前と日付を書き足した。誰かが読むかもしれない。':'{a}は伝言をしばらく眺めて、何も書かずに立ち去った。',a),why:a.name+(a.tr.np>0.5?'のNP：ほかの生存者を思う':'の慎重さ：痕跡を残さない')});
}
}
];
spaced(HK.INCIDENTS.zombie,4);
})();
});
;
/* ==== js/zombie-npc.js ==== */
HK.Load.def(306,'js/zombie-npc.js',function(){
(function(){
'use strict';
var HK=window.HK,Z=HK.ZB;
function L(s){return s.split('|');}
var CHILD={jp:L('ミウ|ソウタ|ハルト|ユイ|リク|コハル|メイ|タイチ'),us:L('リリー|ノア|エマ|ルーカス|ミア|オリバー|ゾーイ|ベン')};
function nm(n){return n.label;}
function fillN(ctx,t,n,a,b){if(HK.Mob)t=HK.Mob.you(t,n,n.type==='child'?'ちゃん':'さん');return ctx.t(t,a,b).replace(/\{n\}/g,n.label).replace(/\{area\}/g,Z.an(ctx,n.area));}
function luck(ctx,c){return ctx.stat(c,'luck');}
function power(c){return(c.weapon?c.weapon.pow:0)*5+c.hp*0.25+c.tr.aggr*12+c.tr.a*6;}
Z.spawnNPC=function(ctx){
var zb=ctx.zb,rng=ctx.rng;
if(ctx.stepIndex===0)return;
var live=zb.npcs.filter(function(n){return n.alive;}).length;
var rate=ctx.env.npc/100*0.42*(live>=5?0.3:1);
if(rng()>rate)return;
var occ=[];
ctx.present().forEach(function(c){if(occ.indexOf(c.z.area)<0)occ.push(c.z.area);});
var area=occ.length&&rng()<0.8?rng.pick(occ):rng.int(9);
var used={};
zb.npcs.forEach(function(n){used[n.type]=(used[n.type]||0)+1;});
var type=HK.weighted(rng,Object.keys(Z.NPC_TYPES),function(k){return Z.NPC_TYPES[k].w/(1+(used[k]||0)*1.5)*(k==='soldier'?0.6+Z.day(ctx)*0.12:1);});
var T=Z.NPC_TYPES[type],pool=type==='child'?CHILD[zb.reg]:Z.NPC_NAMES[zb.reg];
var taken=zb.npcs.map(function(n){return n.name;});
var name=rng.pick(pool.filter(function(x){return taken.indexOf(x)<0;}).concat(pool.length?[]:['名無し']))||rng.pick(pool);
var n={id:zb.npcs.length,type:type,name:name,label:T[zb.reg]+name,area:area,alive:true,with:null,at:ctx.stepIndex,met:false,turnAt:type==='bitten'?ctx.stepIndex+2+rng.int(4): -1,cult:[],deserter:type==='soldier'&&rng()<0.22,gun:zb.reg==='us'&&rng()<0.6};
if(type==='child')n.label='迷子の'+(zb.reg==='us'?'':'子・')+name;
zb.npcs.push(n);
};
Z.spawnNPCAt=function(ctx,type,area){
var zb=ctx.zb,rng=ctx.rng,T=Z.NPC_TYPES[type],pool=type==='child'?CHILD[zb.reg]:Z.NPC_NAMES[zb.reg];
var name=rng.pick(pool);
var n={id:zb.npcs.length,type:type,name:name,label:T[zb.reg]+name,area:area,alive:true,with:null,at:0,met:false,turnAt: -1,cult:[],deserter:false,gun:zb.reg==='us'};
if(type==='child')n.label='迷子の'+(zb.reg==='us'?'':'子・')+name;
zb.npcs.push(n);
return n;
};
Z.npcStep=function(ctx){
var zb=ctx.zb,rng=ctx.rng;
zb.npcs.forEach(function(n){
if(!n.alive)return;
if(n.with!=null){
var w=ctx.chars[n.with];
if(w.alive&& !w.out)n.area=w.z.area;
else if(w.out&&n.type==='child'){n.out=true;n.alive=false;n.note=w.name+'と一緒に街を出た';return;}
else{n.with=null;if(n.type==='child')n.alone=true;}
}
if(n.turnAt>=0&&ctx.stepIndex>=n.turnAt)return npcTurns(ctx,n);
var P=Z.inArea(ctx,n.area);
if(!P.length)return;
var fn=NPC[n.type];
if(!n.met){n.met=true;return fn.meet(ctx,n,P);}
if(fn.again&&(n.agains||0)<4&&rng()<(n.type==='child'?0.22:0.15)){n.agains=(n.agains||0)+1;fn.again(ctx,n,P);}
});
};
function npcTurns(ctx,n){
var zb=ctx.zb,rng=ctx.rng;
n.alive=false;n.turned=true;n.note='ゾンビになった';
zb.stats.npcDead++;
var P=Z.inArea(ctx,n.area);
zb.A[n.area].z=Math.min(100,zb.A[n.area].z+4);
if(!P.length)return;
var v=HK.weighted(rng,P,function(c){return n.with===c.i?3:1;});
var t=fillN(ctx,rng.pick(['夜中、{n}の包帯の下から、黒い血が滲み出した。{n}は起き上がり、いちばん近くで眠っていた{a}に覆いかぶさった。','{n}は「大丈夫、ただの切り傷だ」と言っていた。その{n}が、白く濁った目で{a}の方を向いた。']),n,v);
if(rng()<0.5-luck(ctx,v)*0.05){Z.infect(ctx,v,null,true);v.z.bitten.npc=n.label;t+=ctx.t('{a}の腕に、歯形が残った。',v);}
else t+=ctx.t('{a}は寸前で身をかわし、{n}だったものの頭に'+(v.weapon?v.weapon.name:'椅子')+'を振り下ろした。',v).replace(/\{n\}/g,n.label);
ctx.act2({actors:P,cat:'combat',text:t,why:n.label+'は咬まれていたことを隠していた',mag:30});
}
var NPC={
soldier:{
meet:function(ctx,n,P){
var zb=ctx.zb,rng=ctx.rng;
var bit=P.filter(function(c){return c.z.bitten&&(c.z.aware||c.z.hiding);})[0];
if(n.deserter){
var a=ctx.most(P,function(c){return c.weapon?c.weapon.pow:0;});
var resist=P.filter(function(c){return c.tr.aggr>0.6;})[0];
if(resist&&rng()<0.45){
var win=power(resist)+rng()*40>60+rng()*30;
if(win){n.alive=false;n.note=resist.name+'に倒された';zb.stats.npcDead++;resist.flags.npcKill=(resist.flags.npcKill||0)+1;return ctx.act2({actors:P,cat:'combat',text:fillN(ctx,'銃を突きつけて物資を奪おうとした脱走兵の{n}に、{a}が飛びかかった。もみ合いの末、銃声が一発。床に倒れていたのは{n}の方だった。',n,resist),why:n.label+'は部隊を見捨てた脱走兵／'+resist.name+'の攻撃性',mag:32});}
ctx.kill(resist,null,'脱走兵の'+n.label+'に撃たれた');
return ctx.act2({actors:P,cat:'combat',text:fillN(ctx,'脱走兵の{n}に、{a}が掴みかかった。銃声が響き、{a}が崩れ落ちた。{n}は食料を袋に詰めて、振り返らずに出ていった。',n,resist),why:n.label+'は部隊を見捨てた脱走兵',mag:40});
}
P.forEach(function(c){c.z.food=Math.max(0,c.z.food-1);});
if(a.weapon&&a.weapon.gun){a.weapon=Z.weapon(['素手',0]);}
return ctx.act2({actors:P,cat:'conflict',text:fillN(ctx,'{n}は部隊章を剥がした迷彩服を着ていた。「食い物と弾を置いていけ」――銃口を向けられて、'+Z.names(P)+'は従うしかなかった。',n),why:n.label+'は脱走兵だった',mag:22});
}
if(bit&&rng()<(bit.z.hiding?0.55:0.95)){
var def=P.filter(function(c){return c!==bit&&ctx.R(c,bit).aff>50&&c.tr.aggr+c.tr.np>0.9;})[0];
if(def&&rng()<0.5){
var ok=power(def)+rng()*40>55+rng()*35;
if(ok){n.alive=false;n.note=def.name+'に倒された';zb.stats.npcDead++;ctx.pair(def,bit).defendedZ=def.i;return ctx.act2({actors:[def,bit],cat:'combat',fx:function(){ctx.mod(bit,def,{aff:20,trust:25});},text:fillN(ctx,'{n}は{b}の咬み跡を見つけ、無言で銃を構えた。その腕に、{a}が体ごとぶつかった。――気がつくと、{a}の手には{n}の銃があり、{n}はもう動かなかった。',n,def,bit),why:def.name+'の'+bit.name+'への想い（好意 '+Math.round(ctx.R(def,bit).aff)+'）が、軍人に向かわせた',mag:45});}
ctx.kill(def,null,'咬まれた'+bit.name+'をかばって、'+n.label+'に撃たれた');
}
ctx.act2({actors:P,cat:'death',text:fillN(ctx,'{n}は'+(bit.z.hiding?'{a}の袖の下の咬み跡を見逃さなかった':'{a}の咬み跡を見た')+'。「規則だ。悪く思うな」――乾いた銃声が一発だけ響いた。',n,bit),why:'軍人は咬まれた者を見逃さない'+(bit.z.hiding?'（'+bit.name+'は隠していた）':''),mag:45});
ctx.kill(bit,null,n.label+'に射殺された（咬まれていた）');
return;
}
var heli=ctx.env.end==='heli'&&rng()<0.7,t;
if(heli){P.forEach(function(c){c.z.heliAt=zb.heli;c.z.know.heli=true;});t='{n}は無線を確かめてから言った。「最終日の朝、'+Z.an(ctx,zb.heli)+'に救助ヘリが降りる。それまで生きていろ」';}
else if(zb.safe>=0){P.forEach(function(c){c.z.safe=zb.safe;});t='{n}は地図を広げ、'+Z.an(ctx,zb.safe)+'に丸をつけた。「今のところ、あそこはまだ持ちこたえている」';}
else t='{n}は首を横に振った。「安全な場所なんて、もうない。俺の部隊も、昨日の夜に全滅した」';
P.forEach(function(c){c.z.know.bite=true;c.z.know.head=true;if(c.goal.id==='escape')zb.escort={area:n.area,until:ctx.stepIndex+3};});
ctx.act2({actors:P,cat:'help',text:fillN(ctx,rng.pick(['{area}で、迷彩服の{n}が銃を下ろした。','{n}は瓦礫の陰から現れ、「民間人か」と短く訊いた。'])+t,n),why:n.label+'は正確な情報を持っていた',mag:22});
},
again:function(ctx,n,P){
var rng=ctx.rng,c=rng.pick(P);
ctx.act2({actors:P,cat:'help',fx:function(){c.z.food++;},text:fillN(ctx,rng.pick(['{n}は{a}に、軍用の携行食を一袋渡した。「食え。倒れられると迷惑だ」','{n}は夜通し見張りに立ち、{a}たちに数時間の眠りをくれた。']),n,c),why:n.label+'の手助け'});
}
},
priest:{
meet:function(ctx,n,P){
var rng=ctx.rng;
var t=fillN(ctx,rng.pick(['{area}の広場で、{n}が瓦礫の上に立って叫んでいた。「これは審判だ！　咬まれた者は救われる、新しい体を授かるのだ！」','{n}は、教会の扉を開けて{a}たちを招き入れた。蝋燭の火の向こうに、十数人の信者が並んでいた。','{n}は穏やかな声で言った。「怖がらなくていい。終わりは、救いです」']),n,P[0]);
var rec=P.filter(function(c){return c.stress>50&&c.tr.ac+(1-c.tr.a)>1.0&&c.z.cult==null;}).sort(function(x,y){return y.stress-x.stress;})[0];
P.forEach(function(c){c.z.food++;});
if(rec&&rng()<0.5){
rec.z.cult=n.id;n.cult.push(rec.i);rec.stress=Math.max(0,rec.stress-30);
var keep=Z.here(ctx,rec).filter(function(o){return ctx.R(o,rec).aff>40;})[0];
t+=ctx.t('{a}は、気づけば{n}の手を握って泣いていた。その夜、{a}は信者たちの輪に加わった。',rec).replace(/\{n\}/g,n.label);
if(keep)t+=ctx.t('{b}が呼んでも、{a}はもう振り返らなかった。',rec,keep);
return ctx.act2({actors:P,cat:'solo',text:t,why:rec.name+'の追い詰められ方（焦り '+Math.round(rec.stress+30)+'）とAC。救いの言葉にすがった',mag:30});
}
ctx.act2({actors:P,cat:'help',text:t+'その夜は、温かいスープが配られた。',why:n.label+'の教会（食料+1）',mag:12});
},
again:function(ctx,n,P){
var rng=ctx.rng,zb=ctx.zb;
var mem=n.cult.map(function(i){return ctx.chars[i];}).filter(function(c){return c.alive&& !c.out&&c.z.area===n.area;});
if(!mem.length||rng()>0.45)return;
var res=P.filter(function(o){return mem.indexOf(o)<0&&mem.some(function(m){return ctx.R(o,m).aff>35;});})[0];
if(res&&rng()<0.35+res.tr.cp*0.3+res.tr.np*0.2){
mem.forEach(function(m){m.z.cult=null;ctx.mod(m,res,{aff:20,trust:20});});
return ctx.act2({actors:[res].concat(mem),cat:'help',text:fillN(ctx,'儀式の杯が回り始めたとき、{a}が祭壇を蹴り倒した。「帰るよ｜帰るぞ｜帰りますよ」――'+Z.names(mem)+'の手から、杯が落ちた。',n,res),why:res.name+'の想い（'+Z.names(mem)+'への好意）とCP',mag:40});
}
n.alive=false;n.note='信者たちと「旅立った」';zb.stats.npcDead++;
ctx.act2({actors:mem,cat:'death',text:fillN(ctx,'{n}は信者たちに杯を配った。「新しい世界で会いましょう」――朝、礼拝堂の長椅子に、眠るように並んだ人々がいた。その中に、'+Z.names(mem)+'もいた。',n),why:Z.names(mem)+'は'+n.label+'の教えにすがっていた',mag:50});
mem.forEach(function(m){ctx.kill(m,null,n.label+'の教団の集団自決で');});
}
},
madman:{
meet:function(ctx,n,P){
var rng=ctx.rng,zb=ctx.zb,a=rng.pick(P);
if(rng()<0.4){
var r=Z.RUMORS.filter(function(x){return x.truth===false;});
var rm=rng.pick(r);
P.forEach(function(c){c.z.know[rm.id]=true;});
return ctx.act2({actors:P,cat:'solo',fx:function(){P.forEach(function(c){ctx.stress(c,6);});},text:fillN(ctx,'{n}は{a}の肩を掴み、唾を飛ばしながら叫んだ。「'+rm.t+'！　知らないのか！？」――そして笑いながら走り去った。',n,a),why:n.label+'の言葉（デマ）を、'+Z.names(P)+'は聞いてしまった'});
}
var mp=40+rng()*45,ap=power(a)+rng()*30;
if(ap>mp){
n.alive=false;n.note=a.name+'に倒された';zb.stats.npcDead++;
a.flags.npcKill=(a.flags.npcKill||0)+1;ctx.stress(a,14);
return ctx.act2({actors:P,cat:'combat',text:fillN(ctx,rng.pick(['{n}が鉈を振り回しながら{a}に襲いかかった。{a}は無我夢中で'+(a.weapon?a.weapon.name:'拳')+'を振るった。我に返ったとき、{n}は動かなくなっていた。人間を、殺した。','{n}は「お前もあいつらの仲間だろう！」と叫んで{a}に飛びかかった。もみ合いの末、{n}は階段を転げ落ちて、それきりだった。']),n,a),why:a.name+'の戦う力（'+Math.round(ap)+'）が'+n.label+'を上回った',mag:30});
}
a.hp-=15+rng.int(15);if(a.z.wound<0)a.z.wound=ctx.stepIndex;
if(a.hp<=0){ctx.act2({actors:P,cat:'death',text:fillN(ctx,'{n}の鉈が、{a}の頭上に振り下ろされた。',n,a),why:n.label+'は正気を失っていた',mag:40});ctx.kill(a,null,n.label+'に襲われて');return;}
ctx.act2({actors:P,cat:'combat',text:fillN(ctx,'{n}は{a}に斬りかかり、{a}の腕を深く切り裂いてから、笑い声とともに闇に消えた。',n,a),why:n.label+'は正気を失っていた',mag:22});
},
again:function(ctx,n,P){
ctx.act2({actors:P,cat:'solo',fx:function(){P.forEach(function(c){ctx.stress(c,8);});},text:fillN(ctx,ctx.pick(['{area}のどこかで、{n}の調子外れの歌声が響いていた。歌声は、少しずつ近づいてくる。','壁に、赤いペンキで大きな笑顔が描かれていた。{n}の仕業だろう。']),n),why:n.label+'がまだうろついている'});
}
},
child:{
meet:function(ctx,n,P){
var rng=ctx.rng,a=ctx.most(P,function(c){return c.tr.np+c.tr.warmth*0.5;});
if(a.tr.np<0.35&&a.tr.cold>0.6&&rng()<0.6){
n.alone=true;
return ctx.act2({actors:P,cat:'solo',fx:function(){P.forEach(function(c){if(c.tr.np>0.5)ctx.stress(c,12);});},text:fillN(ctx,'物陰で、{n}が膝を抱えて泣いていた。{a}は足を止めかけて、それから首を振った。「連れていけない。足手まといになる｜＝｜連れていけません。足手まといになります」',n,a),why:a.name+'のドライさ（'+Math.round(a.tr.cold*100)+'）',mag:18});
}
n.with=a.i;a.z.child=n.id;
ctx.act2({actors:P,cat:'help',fx:function(){ctx.stress(a,-8);},text:fillN(ctx,rng.pick(['{area}の車の陰で、{n}が泣きじゃくっていた。{a}はしゃがんで目線を合わせ、「{you}も、一緒に行こう｜＝｜{you}も、一緒に行きましょう」と手を差し出した。','{n}は「ママを待ってる」と言って動こうとしなかった。{a}は{n}を背負い、「ママには、生きてたら会えるから｜ママには、生きていれば会える｜ママには、生きていれば会えますから」と言った。','{n}は{a}の服の裾を掴んで離さなかった。{a}は諦めて、{n}の手を握り直した。']),n,a),why:a.name+'のNP（'+Math.round(a.eg.NP)+'）',mag:20});
},
again:function(ctx,n,P){
var rng=ctx.rng,zb=ctx.zb,a=n.with!=null?ctx.chars[n.with]:null;
if(!a)return;
if(zb.A[n.area].def.shelter&& !zb.A[n.area].fallen&&rng()<0.5){
n.with=null;n.alive=false;n.out=true;n.note='避難所で母親と再会した';a.z.child=null;
return ctx.act2({actors:[a],cat:'help',fx:function(){ctx.stress(a,-20);},text:fillN(ctx,'避難所の人混みの中から、誰かが{n}の名前を叫んだ。{n}は{a}の手を離して駆け出し、泣き崩れる母親の腕に飛び込んだ。{a}は手を振って、それから少しだけ泣いた。',n,a),why:'避難所までたどり着いた',mag:30});
}
if(zb.A[n.area].z>45&&rng()<0.14){
n.turnAt=ctx.stepIndex+2+rng.int(3);n.bit=true;
return ctx.act2({actors:[a],cat:'combat',fx:function(){ctx.stress(a,25);},text:fillN(ctx,'{n}の悲鳴が上がった。{a}が振り向いたときには、{n}の小さな足首に歯形がついていた。{a}は{n}を抱きしめたまま、しばらく動けなかった。',n,a),why:'子どもを守りきれなかった（'+Z.an(ctx,n.area)+'のゾンビの多さ）',mag:38});
}
if(n.bit&&rng()<0.5){
n.alive=false;n.note=a.name+'の腕の中で眠った';zb.stats.npcDead++;
var put=a.tr.cp*0.4+a.tr.a*0.4>0.55;
return ctx.act2({actors:[a],cat:'death',fx:function(){ctx.stress(a,35);a.flags.grief= -1;},text:fillN(ctx,put?'{n}の熱が上がりきる前に、{a}は{n}を膝に乗せて、子守唄を歌った。歌い終わったとき、{a}の手の中で、すべてが終わっていた。':'{n}は{a}の腕の中で、「……ありがと」と言って目を閉じた。{a}は、{n}が二度と目を開けないことを、ずっと祈っていた。',n,a),why:'咬まれた子ども',mag:45});
}
ctx.act2({actors:[a],cat:'help',fx:function(){ctx.stress(a,-5);a.z.food=Math.max(0,a.z.food-(rng()<0.3?1:0));},text:fillN(ctx,rng.pick(['{a}は自分の分の食料を、{n}に半分あげた。','{n}は{a}の背中で眠っていた。{a}はその重さに、なぜか救われていた。','{n}が小声で歌を歌い始め、{a}は慌てて口を塞いだ。それから二人で、声を出さずに笑った。','{n}は{a}に、「ママ、どこにいると思う？」と訊いた。{a}は「きっと待ってる｜きっと待っている｜きっと待っていますよ」としか言えなかった。','{n}は拾ったクレヨンで、{a}の似顔絵を描いた。{a}はそれを、胸ポケットにしまった。','{n}が熱を出した。{a}は一晩中、{n}の額の濡れタオルを替え続けた。咬み跡は、どこにもなかった。']),n,a),why:a.name+'と'+n.label});
}
},
doctor:{
meet:function(ctx,n,P){
var rng=ctx.rng,cured=[];
P.forEach(function(c){c.z.know.bite=true;c.z.know.blood=false;if(c.z.wound>=0&& !c.z.bitten){c.z.wound= -1;c.z.fever=false;c.hp=Math.min(100,c.hp+15);cured.push(c);}});
var bit=P.filter(function(c){return c.z.bitten&&c.z.aware&&ctx.stepIndex-c.z.bitten.at<=2;})[0];
var t=fillN(ctx,'{area}の診療所に、{n}が一人で残っていた。「感染するのは咬み傷からだけだ。返り血はただの血だよ」',n)+(cured.length?Z.names(cured)+'の傷は、きちんと縫い直された。':'');
if(bit){
var ok=rng()<0.42+ctx.stat(bit,'hp')*0.03;
bit.hp-=25;
if(ok){bit.z.bitten=null;bit.z.turnAt= -1;bit.z.cut=true;t+=ctx.t('{n}は{a}の咬み跡を見て、メスを取った。「まだ間に合うかもしれない。歯を食いしばれ」――手術は朝まで続き、{a}の熱は、引いた。',bit).replace(/\{n\}/g,n.label);}
else t+=ctx.t('{n}は{a}の傷口を見て、黙ってメスを置いた。「……すまない。もう、全身に回ってる」',bit).replace(/\{n\}/g,n.label);
if(bit.hp<=0){ctx.act2({actors:P,cat:'death',text:t,why:'切断手術に体がもたなかった',mag:40});ctx.kill(bit,null,n.label+'の切断手術の最中に');return;}
return ctx.act2({actors:P,cat:'help',text:t,why:n.label+'の処置（'+bit.name+'の体力 '+ctx.stat(bit,'hp')+'）'+(ok?'：間に合った':'：手遅れ'),mag:ok?40:25});
}
ctx.act2({actors:P,cat:'help',text:t,why:n.label+'は正しい知識を持っていた',mag:16});
}
},
looter:{
meet:function(ctx,n,P){
var rng=ctx.rng,zb=ctx.zb;
var f=ctx.most(P,function(c){return c.tr.aggr+c.tr.cp*0.5+(c.weapon?c.weapon.pow*0.05:0);});
if(f.tr.aggr+f.tr.cp*0.5>0.75&&rng()<0.6){
var lp=45+rng()*35+(n.gun?25:0),fp=power(f)+rng()*35;
if(fp>lp){n.alive=false;n.note=f.name+'たちに追い払われた';return ctx.act2({actors:P,cat:'combat',text:fillN(ctx,'{n}たちが「食い物を出せ」と押し入ってきた。{a}は「{you}たちに渡す分はない｜＝｜{you}たちに渡す分はありません」と言い捨て、'+(f.weapon?f.weapon.name:'拳')+'で先頭の男を殴り倒した。残りは悲鳴を上げて逃げていった。',n,f),why:f.name+'の攻撃性・CP（'+Math.round(fp)+'）',mag:26});}
if(rng()<(n.gun?0.45:0.2)*HK.Dark.f(ctx,'raid')*HK.Dark.few(ctx)){ctx.act2({actors:P,cat:'death',text:fillN(ctx,'{n}たちに歯向かった{a}は、'+(n.gun?'至近距離から撃たれた':'数人がかりで殴り倒された')+'。',n,f),why:n.label+'たちは容赦がなかった',mag:42});ctx.kill(f,null,n.label+'たちに襲われて');P.forEach(function(c){c.z.food=0;});return;}
f.hp-=20;if(f.z.wound<0)f.z.wound=ctx.stepIndex;
if(f.hp<=0){ctx.act2({actors:P,cat:'death',text:fillN(ctx,'{n}たちに殴りかかった{a}は、袋叩きにされて動かなくなった。',n,f),why:'略奪者のほうが多かった',mag:40});ctx.kill(f,null,n.label+'たちに襲われて');return;}
P.forEach(function(c){c.z.food=Math.max(0,c.z.food-2);});
return ctx.act2({actors:P,cat:'combat',text:fillN(ctx,'{a}は「{you}たちに渡すものはない｜＝｜{you}たちに渡すものはありません」と{n}たちに殴りかかったが、多勢に無勢だった。食料をほとんど奪われ、{a}は肋骨を押さえてうずくまった。',n,f),why:'略奪者のほうが多かった',mag:26});
}
if(Z.raidTry&&Z.raidTry(ctx,n,P))return;
P.forEach(function(c){c.z.food=Math.max(0,c.z.food-1);ctx.stress(c,8);});
ctx.act2({actors:P,cat:'conflict',text:fillN(ctx,'{n}たちは'+(n.gun?'銃':'鉄パイプ')+'をちらつかせて、'+Z.names(P)+'の食料を半分持っていった。「命までは取らねえよ。今日のところはな」',n),why:'逆らわないほうを選んだ（慎重さ）',mag:18});
}
},
streamer:{
meet:function(ctx,n,P){
var rng=ctx.rng,zb=ctx.zb;
var r=rng()<ctx.env.rumor/100?rng.pick(Z.RUMORS.filter(function(x){return x.truth===false;})):rng.pick(Z.RUMORS.filter(function(x){return x.truth===true;}));
P.forEach(function(c){c.z.know[r.id]=true;});
zb.A[n.area].z=Math.min(100,zb.A[n.area].z+22);
var t=fillN(ctx,'{n}がスマホに向かって喋っていた。「同接三万人！　みんな、'+r.t+'って情報入ってます！」――その声とライトに、ゾンビが集まり始めていた。',n);
if(rng()<0.5){n.alive=false;n.note='配信中に群れに呑まれた';zb.stats.npcDead++;t+=fillN(ctx,'配信は、{n}の悲鳴で途切れた。',n);}
ctx.act2({actors:P,cat:'solo',fx:function(){P.forEach(function(c){ctx.stress(c,10);});},text:t,why:n.label+'の配信（'+(r.truth?'本当の情報':'デマ')+'）と、その騒音',mag:22});
Z.hordeEvent(ctx,P,zb.A[n.area]);
}
},
old:{
meet:function(ctx,n,P){
var rng=ctx.rng,a=rng.pick(P);
a.z.food+=2;
ctx.act2({actors:P,cat:'help',text:fillN(ctx,rng.pick(['{n}は、家の戸口で{a}たちを手招きした。「わしはここを動かんよ。これを持っていきなさい」――缶詰と、乾パンだった。','{n}は「孫が迎えに来るんだ」と言って、玄関先に座り続けていた。{a}に、炊いたばかりの握り飯を二つくれた。']),n,a),why:n.label+'の厚意（食料+2）',mag:14});
},
again:function(ctx,n,P){
var rng=ctx.rng;
if(rng()<0.5){
n.alive=false;n.turned=true;n.note='ゾンビになっていた';ctx.zb.stats.npcDead++;
ctx.act2({actors:P,cat:'solo',fx:function(){P.forEach(function(c){ctx.stress(c,10);});},text:fillN(ctx,'もう一度通りかかった{n}の家の戸口に、{n}は座っていた。同じ姿勢のまま、白く濁った目で、迎えの来ない道の先を見ていた。',n),why:'動かないことを選んだ人の結末',mag:20});
}
}
},
bitten:{
meet:function(ctx,n,P){
var rng=ctx.rng,a=ctx.most(P,function(c){return c.tr.np-c.tr.cold*0.5;});
var sees=P.filter(function(c){return c.tr.a+c.tr.caution>1.1;})[0];
if(sees&&rng()<0.55){
return ctx.act2({actors:P,cat:'conflict',text:fillN(ctx,'{n}は「仲間に入れてほしい」と頭を下げた。{a}は{n}の腕の包帯を見て、首を横に振った。「{you}、その傷を見せてくれ｜＝｜{you}、その傷を見せてください」――{n}は黙って、来た道を引き返していった。',n,sees),why:sees.name+'の冷静さと慎重さ（A・AC）',mag:16});
}
if(a.tr.np>0.5||rng()<0.4){
n.with=a.i;
return ctx.act2({actors:P,cat:'help',text:fillN(ctx,'{n}は「ガラスで切った」と言って、包帯の腕をかばっていた。{a}は少し迷ってから、{n}を仲間に入れた。',n,a),why:a.name+'のNP（'+Math.round(a.eg.NP)+'）',mag:14});
}
ctx.act2({actors:P,cat:'solo',text:fillN(ctx,'{n}が助けを求めて近づいてきた。{a}たちは、扉を開けなかった。',n,a),why:'危険は冒せない',mag:10});
}
}
};
Z.NPC=NPC;
})();
});
;
/* ==== js/zombie-reunion.js ==== */
HK.Load.def(307,'js/zombie-reunion.js',function(){
(function(){
'use strict';
var HK=window.HK,Z=HK.ZB;
if(!Z)return;
function L(s){return s.split('|');}
function tie(ctx,a,b){return HK.Ties&&HK.Ties.get(ctx,a,b);}
function wname(c){return c.weapon?c.weapon.name:'素手';}
function fill(t,m){return t.replace(/\{(\w+)\}/g,function(x,k){return m[k]!=null?m[k]:x;});}
var SCENE={
lover:L('{area}の物陰から現れたのは{b}だった。{a}は武器を放り出して走り、{b}を抱きしめた。二人とも、しばらく何も言えなかった。|{a}は{area}で、聞き慣れた足音を聞いた。振り返ると{b}がいた。{a}は{b}の顔を両手で挟んで、生きているか確かめるように何度も撫でた。|{a}と{b}は、{area}の瓦礫越しに目が合った。次の瞬間には、互いの腕の中にいた。{b}の肩が震えていた。|{a}は{area}で{b}を見つけるなり、怒ったように「どこ行ってたんだよ｜どこへ行っていたんだ｜どこへ行っていたんですか」と言った。言い終わる前に、{b}を強く抱き寄せていた。'),
fwb:L('{area}で{b}と鉢合わせた。{a}は一瞬、どんな顔をすればいいのか分からなかった。体だけの関係のはずなのに、安堵で膝が抜けそうだった。|{a}は{area}で{b}を見つけて、「……生きてたんだ｜……生きていたのか｜……生きていたんですね」とだけ言った。{b}は「お互いね｜お互いさまだ｜お互いさまです」と笑った。その笑顔に、{a}は少し動揺した。'),
almost:L('{area}にいたのは{b}だった。{a}は駆け寄りかけて、途中で足を止めた。抱きしめていい関係なのか、分からなかった。|{a}と{b}は、{area}で向かい合ったまま、どちらからともなく手を伸ばした。指先が触れて、二人とも慌てて手を引っ込めた。'),
crushA:L('{area}で{b}の姿を見つけた瞬間、{a}の心臓が跳ねた。こんな状況でも、やっぱり{b}が好きだった。|{a}は{area}で{b}を見つけて、泣きそうになるのを必死にこらえた。ずっと想っていた人が、生きていた。'),
crushM:L('{area}で{b}の姿を見つけた瞬間、{a}は駆け寄りかけて、足を止めた。{b}も同じように、一歩踏み出したところで止まっていた。二人とも「……無事でよかった｜＝｜……無事でよかったです」とだけ言って、目をそらした。|{a}は{area}で{b}を見つけて、泣きそうになるのを必死にこらえた。{b}の目も赤かったが、{a}はそれを、ただの疲れだと思った。|{area}の瓦礫越しに、{a}と{b}の目が合った。「会いたかった｜＝｜会いたかったです」と言いかけて、{a}は「……生きてたんだ｜……生きていたのか｜……生きていたんですね」に言い直した。{b}も、まったく同じ言い直しをしていた。|{a}は{area}で{b}に声をかけた。{b}は驚いた顔をして、それから慌てて髪を直した。{a}は、自分の声が上ずっていたことに気づかれなかったか、そればかり気にしていた。'),
crushB:L('{area}で{a}に声をかけられ、{b}は驚いた顔をした。{a}の目が、少し赤かった。|{a}は{area}で{b}を見つけて、ほっとしたように笑った。{b}はその笑顔の意味に、まだ気づいていなかった。'),
ex:L('{area}にいたのは、別れた{b}だった。{a}は気まずさより先に、生きていたことに安堵している自分に驚いた。|{a}と{b}は{area}で目が合い、同時に視線を逸らした。「……生きてたんだ｜……生きていたのか｜……生きていたんですね」「そっちこそ｜そっちこそだ｜あなたこそです」それ以上、言葉は続かなかった。|{a}は{area}で{b}を見つけた。昔の口癖で名前を呼びそうになって、飲み込んだ。'),
parent:L('{area}で、{a}は{b}を見つけた。我が子が生きていた。{a}は駆け寄り、{b}の全身に傷がないか確かめた。|{a}は{area}で{b}の名前を叫んだ。振り返った{b}の顔を見た瞬間、{a}の目から涙があふれた。|{a}は{area}の避難者の列の中に、{b}の背中を見つけた。人をかき分けて、{b}の腕を掴んだ。もう離さない。'),
child:L('{area}で、{a}は{b}を見つけた。親が生きていた。{a}は子どもの頃みたいに、{b}にしがみついた。|{a}は{area}で{b}の姿を見つけて、声が出なかった。{b}が「無事でよかった｜＝｜無事でよかったです」と言って、{a}の頭を撫でた。|{a}は{area}で{b}を見つけた。「なんで連絡くれなかったんだよ｜なぜ連絡をよこさなかった｜どうして連絡をくれなかったんですか」と怒鳴りながら、泣いていた。'),
protA:L('{area}で、{a}は{b}を見つけた。{sib:a→b}が、生きていた。{a}は駆け寄り、我が子にするように{b}の全身に傷がないか確かめた。|{a}は{area}で{b}の名前を叫んだ。振り向いた{b}を、{a}は何も言わずに抱きしめた。「……よかった。本当に、よかった｜＝｜……よかった。本当に、よかったです」|{a}は{b}の顔を両手で挟んで、泣きそうな顔で睨んだ。「勝手にいなくなるな。心臓が止まるかと思った｜＝｜勝手にいなくならないでください。心臓が止まるかと思いました」'),
protB:L('{area}で、{a}は{b}を見つけた。{a}は子どもの頃みたいに、{b}の背中にしがみついた。|{a}は{area}で{b}の姿を見つけて、声が出なかった。{b}が先に気づいて、「怪我は？　腹は減ってないか｜怪我は？　腹は減っていないか｜怪我は？　お腹は空いていませんか」と矢継ぎ早に訊いた。|{a}は{b}に駆け寄った。{b}は{a}の頭をくしゃくしゃに撫でた。昔から、ずっとそうだった。'),
sibclose:L('{area}で{b}を見つけた{a}は、言葉より先に笑っていた。{b}も笑っていた。「やっぱり生きてた｜やはり生きていたか｜やっぱり生きていましたね」「そっちこそ｜そっちこそだ｜あなたこそです」|{a}と{b}は、ハイタッチをしてから、ようやく抱き合った。{sibs}で、一番の親友だった。|{a}は{area}で{b}を見つけて、「遅い｜＝｜遅いです」と言った。{b}は「お互い様｜お互い様だ｜お互い様です」と言い返して、{a}の荷物を半分持った。'),
teacherA:L('{area}で、{a}は教え子の{b}を見つけた。「……よく、生きていてくれた｜＝｜……よく、生きていてくれました」――{a}は、教壇で見せたことのない顔をしていた。|{a}は{area}で{b}を見つけると、まず出席を取るように名前を呼んだ。{b}は「はい」と答えて、泣き出した。'),
teacherB:L('{area}で、{a}は{b}を見つけた。「先生……！」――{a}は駆け寄って、{b}の袖を掴んだ。|{a}は{area}で{b}の姿を見つけた。学校で見ていたより、ずっと小さく、疲れて見えた。それでも、{b}は「よく頑張ったな｜＝｜よく頑張りましたね」と笑った。'),
mentorA:L('{area}で、{a}は弟子の{b}を見つけた。「腕は鈍っていないようだな｜＝｜腕は鈍っていないようですね」――{a}はそう言って、{b}の肩を一度だけ叩いた。|{a}は{area}で{b}を見つけた。{b}の構えを見て、{a}は小さく頷いた。教えたことは、ちゃんと生きていた。'),
mentorB:L('{area}で、{a}は師の{b}を見つけた。{a}は思わず頭を下げた。「無事で……！｜無事だったか……！｜ご無事で……！」|{a}は{area}で{b}を見つけて、背筋を伸ばした。{b}の前では、どんな状況でも弟子でいたかった。'),
sibling:L('{area}で{b}を見つけた{a}の第一声は、「遅いよ｜遅いぞ｜遅いですよ」だった。{b}は「そっちこそ｜そっちこそだ｜あなたこそです」と言い返して、それから二人で笑った。|{a}は{area}で{b}を見つけて、無言で肩をぶつけた。いつもの挨拶だった。目だけが濡れていた。|{a}と{b}は{area}で再会するなり、どっちが先に連絡しなかったかで言い合いになった。言い合いながら、互いの怪我を確かめていた。'),
best:L('{area}で{b}の姿を見つけた{a}は、声も出さずに駆け寄り、拳を突き出した。{b}も黙って拳を合わせた。それで十分だった。|{a}は{area}で{b}を見つけて、「絶対生きてると思ってた｜必ず生きていると思っていた｜絶対生きていると思っていました」と言った。本当は、何度も最悪を考えていた。|{a}と{b}は{area}で、同時に「あなたかよ！｜あなたか！｜あなたでしたか！」と叫んだ。それから、声を殺して笑い合った。'),
childhood:L('{area}にいたのは、幼馴染の{b}だった。{a}は子どもの頃のあだ名で{b}を呼んだ。{b}は「その呼び方やめろ｜その呼び方はやめろ｜その呼び方はやめてください」と言いながら、泣き笑いの顔をしていた。|{a}は{area}で{b}を見つけて、「昔、ゾンビごっこしたよな｜昔、ゾンビごっこをしたな｜昔、ゾンビごっこをしましたよね」と言った。{b}は「笑えない｜＝｜笑えません」と言って、それから笑った。'),
buddy:L('{area}の暗がりから、{b}が武器を構えたまま現れた。{a}を見て、{b}は構えを解いた。「背中、空いてるぞ｜背中が空いているぞ｜背中、空いていますよ」――二人は自然に背中を合わせた。|{a}は{area}で{b}と合流した。言葉は要らなかった。{a}が右を、{b}が左を見張った。'),
friend:L('{area}で{b}を見つけた{a}は、思わず名前を呼んだ。知った顔が、こんなに心強いとは思わなかった。|{a}は{area}で{b}と再会した。「無事だった？｜無事だったか？｜無事でしたか？」「なんとか｜どうにか無事だ｜なんとか、無事です」――それだけの会話に、ひどく救われた。|{a}と{b}は{area}で鉢合わせて、互いに武器を向けかけて、同時に「なんだ、あなたか｜＝｜なんだ、あなたでしたか」と言った。'),
colleague:L('{area}で、{a}は職場で見慣れた{b}の顔を見つけた。「……今日、出勤しなくていいよね｜……今日、出勤しなくていいんだな｜……今日、出勤しなくていいですよね」と{b}が言い、{a}は思わず吹き出した。|{a}は{area}で{b}と合流した。仕事の話しかしたことがない相手なのに、手を握り合っていた。'),
senpaiA:L('{area}で、{a}は後輩の{b}を見つけた。「よく生きてたな｜よく生きていたな｜よく生きていましたね」――{a}が頭を撫でると、{b}は堪えていた涙をこぼした。|{a}は{area}で{b}を見つけ、真っ先に「怪我は｜＝｜怪我はありませんか」と訊いた。先輩としての癖だった。'),
senpaiB:L('{area}で、{a}は先輩の{b}を見つけた。「先輩……！」――{a}は駆け寄って、{b}の袖を掴んだ。|{a}は{area}で{b}を見つけて、ほっとして膝から崩れた。{b}が「立て。まだ終わってない｜立て。まだ終わっていない｜立ってください。まだ終わっていません」と手を差し出した。'),
masterA:L('{area}で、{a}は{b}を見つけた。「遅いよ｜遅いぞ｜遅いですよ」――{a}はそう言ったが、声がわずかに震えていた。|{a}は{area}で{b}の姿を見つけ、「無事か｜＝｜ご無事ですか」と一言だけ訊いた。'),
masterB:L('{area}で、{a}は主である{b}を見つけた。{a}は膝をつき、「守れなくて、ごめん｜守れず、すまない｜お守りできず、申し訳ありません」と頭を下げた。|{a}は{area}で{b}を見つけて、すぐに{b}の前に立った。「ここからは、私が盾になる｜＝｜ここからは、私が盾になります」'),
rival:L('{area}にいたのは{b}だった。「……生きてたか｜……生きていたか｜……生きていたんですね」{a}は鼻で笑った。「当たり前だ｜＝｜当たり前です」{b}も笑った。どちらも少し、嬉しそうだった。|{a}は{area}で{b}を見つけて、「何体倒した？｜＝｜何体倒しましたか？」と訊いた。{b}は「あなたより多い｜＝｜あなたより多いです」と即答した。|{a}と{b}は{area}で鉢合わせ、一瞬だけ睨み合った。それから、どちらからともなく同じ方向を向いて武器を構えた。'),
enemy:L('{area}にいたのは{b}だった。{a}は武器を下ろさなかった。{b}も下ろさなかった。ゾンビより先に、互いを警戒していた。|{a}は{area}で{b}と目が合った。「……今は休戦だ｜＝｜……今は休戦です」{b}が言った。{a}は答えず、武器の柄を握り直した。|{a}は{area}で{b}を見つけた。よりによって、こいつか。{a}は聞こえるように舌打ちした。'),
acq:L('{area}で、{a}はどこかで見た顔を見つけた。{b}だ。顔見知り程度の相手なのに、生きている知り合いがいることが、ひどく嬉しかった。|{a}は{area}で{b}と再会した。名前を思い出すのに、少し時間がかかった。それでも、知った顔だった。'),
spark:L('{area}で{b}と目が合った瞬間、{a}は場違いに胸が高鳴った。こんな時に、何を考えているんだろう。|{area}の薄暗がりで{b}の顔を見つけて、{a}はなぜか、まず髪を整えたくなった。'),
good:L('{area}の物陰から現れたのは、{b}だった。{a}は構えた{w}を、ゆっくり下ろした。|{a}は{area}で、見覚えのある顔を見つけた。{b}だ。知った顔がこんなに嬉しいとは思わなかった。'),
bad:L('{a}は{area}で{b}と鉢合わせた。どちらも、武器を下ろさなかった。|{area}にいたのは{b}だった。{a}は舌打ちをこらえた。よりによって、こいつか。'),
classmate:L('{area}で、{a}は見覚えのある横顔を見つけた。学生のころ同じクラスだった{b}だ。{a}「{b}……？　生きてたんだ｜{b}……？　生きていたのか｜{b}……？　生きていたんですね」――{b}は、あの頃と同じ顔で笑った。|{a}と{b}は、{area}の瓦礫越しに目が合った。一瞬の間のあと、二人は同時に、学生時代のあだ名を口にした。|{a}は{area}で{b}と鉢合わせた。卒業以来の再会が、こんな街の真ん中になるとは思わなかった。{a}「{b}、変わってないな｜{b}、変わっていないな｜{b}、変わっていませんね」'),
bossA:L('{area}で、{a}は部下の{b}を見つけた。{a}「{b}、無事か。報告は後でいい｜＝｜{b}、無事ですか。報告は後で構いません」――{b}の肩を叩いた{a}の手は、わずかに震えていた。|{a}は{area}で{b}の姿を見つけると、真っ先に怪我の有無を確かめた。{a}「よく生き延びた。ここからは一緒に動く｜＝｜よく生き延びました。ここからは一緒に動きましょう」'),
bossB:L('{area}で、{a}は上司の{b}を見つけた。{a}「{b}……！　無事だった｜{b}……！　無事だったか｜{b}……！　ご無事でしたか」――思わず駆け寄った{a}に、{b}はいつもの調子で「遅いよ｜遅いぞ｜遅いですよ」と返した。|{a}は{area}で{b}を見つけて、背筋を伸ばした。こんな状況でも、{b}の前では部下の顔に戻っていた。'),
worshipA:L('{area}で{b}の姿を見つけた瞬間、{a}はその場に膝をついた。{a}「{b}……よかった。本当によかった｜＝｜{b}……よかった。本当によかったです」――{a}は祈るように両手を組んだまま、しばらく顔を上げられなかった。|{a}は{area}で{b}を見つけると、駆け寄って{b}の前に立ちはだかった。{a}「もう大丈夫。ここからは、私が{b}の盾になる｜＝｜もう大丈夫です。ここからは、私が{b}の盾になります」'),
worshipB:L('{area}にいたのは{b}だった。{a}の姿を見た瞬間、{b}は持っていた荷物を取り落とし、泣きそうな顔で駆け寄ってきた。|{a}は{area}で{b}と再会した。{b}は{a}の無事を確かめると、何度も何度も頭を下げた。'),
beneA:L('{area}で、{a}はかつて助けた{b}を見つけた。{b}は{a}に気づくと、深々と頭を下げた。{a}「頭なんか下げなくていい。生きててくれれば、それで十分だ｜頭など下げなくていい。生きていてくれれば、それで十分だ｜頭なんて下げなくていいです。生きていてくれれば、それで十分です」|{a}は{area}で{b}と再会した。{a}の顔を見た{b}の目が、みるみる潤んでいった。'),
beneB:L('{area}で、{a}は恩人の{b}を見つけた。{a}「{b}……！　今度は、私が恩を返す番だ｜＝｜{b}……！　今度は、私が恩を返す番です」――{a}は{b}の荷物を、半ば奪うように背負った。|{a}は{area}で{b}を見つけて、言葉より先に頭を下げていた。あの日{b}に救われなければ、{a}は今ここにいなかった。'),
relative:L('{area}にいたのは、親戚の{b}だった。{a}「{b}！　よかった、無事で｜{b}！　よかった、無事だったか｜{b}！　無事でよかったです」――二人はしばらく、互いの家族の消息を確かめ合った。|{a}は{area}で{b}を見つけて、思わず子どもの頃の呼び方で名前を呼んだ。親戚の集まりでしか会わなかった顔が、今はこんなにも心強かった。'),
yanA:L('{area}で{b}を見つけた瞬間、{a}は駆け寄って{b}の手首を掴んだ。{a}「やっと見つけた。……もう、離さないから｜やっと見つけた。……もう、離さない｜やっと見つけました。……もう、離しませんから」――その指には、痛いほどの力がこもっていた。|{a}は{area}で{b}の姿を見つけて、息を呑んだ。{a}「{b}。ずっと、ずっと探してた｜{b}。ずっと、ずっと探していた｜{b}。ずっと、ずっと探していました」――{a}は{b}から一瞬も目を離さなかった。'),
yanB:L('{area}にいたのは{b}だった。{b}は{a}を見るなり、まっすぐ歩み寄ってきた。その目は、少しも笑っていなかった。|{a}が{area}に着くと、{b}が待っていたかのように立っていた。{b}「遅かったね、{a}｜遅かったな、{a}｜遅かったですね、{a}」'),
new:L('{a}は{area}で、{b}と出くわした。生きている人間を見るのは、半日ぶりだった。|{area}の暗がりから、{b}が両手を上げて出てきた。「噛まれてない。人間だ｜噛まれていない。人間だ｜噛まれていません。人間です」|{a}が{area}に着くと、先に{b}がいた。{b}は武器を握ったまま、{a}をじっと見ていた。|{a}は{area}で{b}と鉢合わせ、互いに武器を向けたまま十秒見つめ合った。先に「……ゾンビじゃないよな｜……ゾンビではないな｜……ゾンビじゃないですよね」と言ったのは{b}だった。')
};
var PIN_SOUGHT=L('話を聞くと、{a}も{b}も、互いを探して街を歩き回っていた。二人とも「たまたま通りかかった｜＝｜たまたま通りかかったんです」と言い張った。|{a}は{b}を探していたことを隠した。{b}も、{a}を探していたことを隠した。同じ地図に、同じ印がついていた。|{b}の手には、{a}が行きそうな場所を書き出したメモが握られていた。{a}のポケットにも、似たようなメモが入っていた。');
var STATE={
hurt:L('{a}は{b}の服が血で汚れているのに気づき、顔色を変えた。「誰にやられたの。見せて｜誰にやられた。見せろ｜誰にやられたんですか。見せてください」|{b}は足を引きずっていた。{a}は何も言わずに、{b}の腕を自分の肩に回した。'),
bandageSee:L('{a}は{b}の腕の包帯に目を留めた。「……それ、何の傷？｜……それは、何の傷だ？｜……それ、何の傷ですか？」{b}は「ガラスで切った｜＝｜ガラスで切りました」と答えた。{a}は、それ以上訊かなかった。訊けなかった。|{a}は{b}の額の汗が、妙に多いことに気づいた。{b}は目を合わせようとしなかった。'),
bandageMiss:L('{b}は袖を引っ張って、腕を隠していた。{a}は再会の喜びで、それに気づかなかった。'),
bitten:L('{b}は再会の喜びもそこそこに、袖をまくった。「……ごめん。咬まれてる｜……すまない。咬まれている｜……ごめんなさい。咬まれています」{a}の顔から、表情が消えた。|{b}は{a}に抱きつかれながら、耳元で囁いた。「離れて。私、もうすぐ、だめになる｜離れろ。私は、もうすぐ、だめになる｜離れてください。私、もうすぐ、だめになります」'),
child:L('{b}の背中には、知らない子どもがしがみついていた。「拾った。置いていけなかった｜＝｜拾いました。置いていけなかったんです」|{b}の後ろから、小さな子どもが{a}を見上げていた。'),
sought:L('{a}は息を切らしていた。ずっと、{b}を探して街を歩き回っていたのだ。|「探したんだよ｜探したんだぞ｜探したんですよ」――{a}の声は掠れていた。'),
weak:L('{b}は痩せて、ひどく憔悴していた。{a}は持っていた最後の食料を、黙って{b}の手に押しつけた。')
};
var SAY={
joy:{
proud:L('「……遅いよ。心配させないで｜……遅えんだ。心配させやがって｜……遅いですよ。心配させないでください」|「生きてるなら連絡くらいしてよ｜生きてるなら連絡くらいしろ｜生きているなら、連絡くらいしてください」|「ふん。あなたが死ぬわけないと思ってた｜ふん。あなたが死ぬわけがないと思っていた｜ふん。あなたが死ぬわけないと思っていました」'),
stern:L('「……無事で、何よりだよ｜……無事で、何よりだ｜……無事で、何よりです」|「よく生き延びたね。ここからは一緒に行こう｜よく生き延びた。ここからは共に行く｜よく生き延びましたね。ここからは共に行きましょう」|「顔を見せて。……ああ、本物だね｜顔を見せろ。……ああ、本物だな｜顔を見せてください。……ああ、本物ですね」'),
tsun:L('「べ、別に心配してなかったし！　……ほんとに、生きてる？｜べ、別に心配などしていない！　……本当に、生きているのか？｜べ、別に心配なんてしていませんでしたから！　……本当に、生きていますか？」|「遅い！　どれだけ待ったと思ってるの！｜遅い！　どれだけ待ったと思っている！｜遅いです！　どれだけ待ったと思っているんですか！」|「な、泣いてないから！　目にゴミが入っただけ！｜な、泣いていない！　目にゴミが入っただけだ！｜な、泣いていませんから！　目にゴミが入っただけです！」'),
gentle:L('「よかった……本当に、よかった｜＝｜よかった……本当に、よかったです」|「怪我はない？　お腹すいてない？｜怪我はないか？　腹は減っていないか？｜お怪我はありませんか？　お腹はすいていませんか？」|「会えてよかった。もう大丈夫だよ｜会えてよかった。もう大丈夫だ｜会えてよかったです。もう大丈夫ですよ」'),
devoted:L('「ずっと、ずっと探してた……！｜ずっと、ずっと探していた……！｜ずっと、ずっと探してました……！」|「無事でよかった……私、もう離れないから｜無事でよかった……私は、もう離れない｜無事でよかった……私、もう離れません」|「何でもする。だから、そばにいさせて｜何でもする。だから、そばにいさせてくれ｜何でもします。だから、そばにいさせてください」'),
cool:L('「生存確認。……悪くない知らせだね｜生存確認。……悪くない知らせだ｜生存確認。……悪くない知らせです」|「あなたが生きてる確率は、四割だと見積もってた。外れてよかった｜あなたが生きている確率は、四割だと見積もっていた。外れてよかった｜あなたが生きている確率は、四割だと見積もっていました。外れてよかったです」|「合流できたなら、生存率は上がるよ｜合流できたなら、生存率は上がる｜合流できたなら、生存率は上がります」'),
free:L('「うわー！　生きてたー！　よかったー！｜おお！　生きていたか！　よかった！｜わあ！　生きてたんですね！　よかったです！」|「やったやった！　もう一人じゃない！｜やった！　もう一人じゃない！｜やりました！　もう一人じゃありません！」|「ねえ聞いて、ここまで来るのめっちゃ大変だったんだよ！｜聞いてくれ、ここまで来るのは本当に大変だった！｜聞いてください、ここまで来るの、すごく大変だったんですよ！」'),
shy:L('「よ、よかった……っ、ほんとに、よかった……｜よ、よかった……っ、本当に、よかった……｜よ、よかったです……っ、本当に、よかったです……」|「ひ、ひとりで、こわかった……｜ひ、ひとりで、怖かった……｜ひ、ひとりで、こわかったです……」|「あ、会えて……う、うれしい……｜あ、会えて……う、嬉しい……｜あ、会えて……う、うれしい、です……」'),
polite:L('「無事で、本当によかった｜無事で、何よりだ｜ご無事で、何よりでございます」|「会えて安心したよ｜会えて安心した｜お会いできて安心いたしました」|「怪我はない？｜怪我はないか？｜お怪我はございませんか」')
},
worry:{
proud:L('「誰にやられたの。言って｜誰にやられた。言え｜誰にやられたんですか。言ってください」|「無茶して……動かないで、見せて｜無茶しやがって……動くな、見せろ｜無茶をして……動かないでください、見せてください」'),
stern:L('「傷を見せて。手当てするから｜傷を見せろ。手当てする｜傷を見せてください。手当てします」|「歩ける？　無理なら背負うよ｜歩けるか。無理なら背負う｜歩けますか。無理なら背負います」'),
tsun:L('「ちょ、ちょっと、怪我してるじゃない！　ばか！｜ちょ、ちょっと待て、怪我をしているじゃないか！　ばか！｜ちょ、ちょっと、怪我してるじゃないですか！　ばか！」|「べ、別に心配じゃないけど、ちゃんと手当てしてよね｜べ、別に心配ではないが、ちゃんと手当てしろ｜べ、別に心配じゃありませんけど、ちゃんと手当てしてください」'),
gentle:L('「痛かったね。すぐ手当てするから｜痛かっただろう。すぐ手当てする｜痛かったですね。すぐ手当てしますから」|「無理しないで。私が支えるよ｜無理をするな。私が支える｜無理しないでください。私が支えます」'),
devoted:L('「わ、私が手当てする！　じっとしてて｜わ、私が手当てする！　じっとしていろ｜わ、私が手当てします！　じっとしててください」|「代われるなら、代わりたい……｜＝｜代われるなら、代わりたいです……」'),
cool:L('「出血量は多くない。まだ間に合うよ｜出血量は多くない。まだ間に合う｜出血量は多くありません。まだ間に合います」|「感染の兆候は……今のところないよ｜感染の兆候は……今のところない｜感染の兆候は……今のところありません」'),
free:L('「うわ、痛そう！　大丈夫！？｜うわ、痛そうだな！　大丈夫か！？｜うわ、痛そうです！　大丈夫ですか！？」|「待ってて、絆創膏あるから！｜待っていろ、絆創膏がある！｜待っててください、絆創膏ありますから！」'),
shy:L('「だ、大丈夫……？　ち、血が……｜だ、大丈夫か……？　ち、血が……｜ち、血が……。だ、大丈夫ですか……？」|「わ、私、何かできること……｜＝｜わ、私に、何かできることは……」'),
polite:L('「怪我、見てもいい？｜怪我を見せてくれ｜お怪我を拝見してもよろしいですか」|「どうか、無理しないで｜どうか、無理をするな｜どうか、ご無理をなさらないでください」')
},
tense:{
proud:L('「近寄らないで。あなたを信用する理由はないよ｜近寄るな。あなたを信用する理由はない｜近寄らないでください。あなたを信用する理由はありません」|「妙な真似をしたら、ゾンビより先に片づけるから｜妙な真似をしたら、ゾンビより先に片づける｜妙な真似をしたら、ゾンビより先に片づけますよ」'),
stern:L('「……今は休戦だよ。でも、背中は見せない｜……今は休戦だ。だが、背中は見せない｜……今は休戦です。ですが、背中は見せません」|「互いに干渉しない。それが条件だよ｜互いに干渉しない。それが条件だ｜互いに干渉しない。それが条件です」'),
tsun:L('「な、なんであなたがここにいるの……！｜な、なぜあなたがここにいる……！｜な、なんであなたがここにいるんですか……！」|「べ、別に一緒にいたいわけじゃないから！｜べ、別に一緒にいたいわけじゃない！｜べ、別に一緒にいたいわけじゃありませんから！」'),
gentle:L('「……今は、争ってる場合じゃないよね｜……今は、争っている場合じゃない｜……今は、争っている場合じゃありませんよね」|「ここでは、仲良くしよう？｜ここでは、揉めずにいこう｜ここでは、仲良くしましょう？」'),
devoted:L('「……あの、今だけは、協力しない？｜……今だけは、協力しないか｜……あの、今だけは、協力しませんか」|「私、争いたくない｜私は、争いたくない｜私、争いたくないです」'),
cool:L('「合理的に考えれば、手を組むべきだよ。感情は別として｜合理的に考えれば、手を組むべきだ。感情は別として｜感情は別として、合理的に考えれば、手を組むべきです」|「あなたが裏切る確率を計算中だよ｜あなたが裏切る確率を計算中だ｜あなたが裏切る確率を計算中です」'),
free:L('「うわ、最悪……まあいっか、今は休戦ね！｜うわ、最悪だ……まあいい、今は休戦だ！｜うわ、最悪です……まあいいです、今は休戦ですね！」|「げっ。……ま、ゾンビよりはマシか！｜＝｜げっ。……まあ、ゾンビよりはマシですね！」'),
shy:L('「ひっ……あ、あの、わ、私、何もしない……｜ひっ……あ、あの、わ、私は、何もしない……｜ひっ……あ、あの、わ、私、何もしません……」|「こ、こわい……」'),
polite:L('「ここは、一時休戦にしない？｜ここは、一時休戦としよう｜ここは、一時休戦といたしませんか」|「お互い、干渉はなしってことで｜お互い、干渉はなしだ｜お互い、干渉はなしということで」')
},
shy:{
proud:L('「……別に、あなたを探してたわけじゃないよ｜……別に、あなたを探していたわけじゃない｜……別に、あなたを探していたわけじゃありません」|「無事なら、それでいい。……それだけ｜無事なら、それでいい。……それだけだ｜無事なら、それでいいです。……それだけです」'),
stern:L('「……顔を見て、安心した。それだけだよ｜……顔を見て、安心した。それだけだ｜……顔を見て、安心しました。それだけです」|「あなたが無事でよかった。……本当に｜＝｜あなたが無事でよかったです。……本当に」'),
tsun:L('「べ、別に会いたかったわけじゃないんだからね……！｜べ、別に会いたかったわけじゃないからな……！｜べ、別に会いたかったわけじゃないんですからね……！」|「……ちょっとだけ、ほっとした。ちょっとだけ｜……少しだけ、ほっとした。少しだけだ｜……ちょっとだけ、ほっとしました。ちょっとだけです」'),
gentle:L('「……会いたかった｜＝｜……会いたかったです」|「ずっと、あなたのこと考えてた｜ずっと、あなたのことを考えていた｜ずっと、あなたのことを考えていました」'),
devoted:L('「あなたが生きててくれて……それだけで、私……」|「もう一度会えたら、言いたいことがあったんだ｜もう一度会えたら、言いたいことがあった｜もう一度会えたら、言いたいことがあったんです」'),
cool:L('「……あなたの生存を、私は想定以上に喜んでるみたい｜……あなたの生存を、私は想定以上に喜んでいるらしい｜……あなたの生存を、私は想定以上に喜んでいるようです」|「理由は分からないけど、安心した｜理由は分からないが、安心した｜理由は分かりませんが、安心しました」'),
free:L('「えへへ、会えた！　……なんか、照れるね｜はは、会えた！　……なんだか、照れるな｜えへへ、会えました！　……なんか、照れますね」|「ねえ、手、つないでいい？｜なあ、手を、つないでいいか？｜あの、手、つないでもいいですか？」'),
shy:L('「あ、あの……ずっと、心配で……」|「か、顔、見られて……よかった……｜か、顔を、見られて……よかった……｜か、顔、見られて……よかったです……」'),
polite:L('「会いたかった……って言っても、いいかな｜会いたかった……と言ってもいいか｜お会いしたかった……と申し上げても、よろしいでしょうか」|「無事で、本当によかった｜＝｜ご無事で、本当によかったです」')
},
grief:{
proud:L('「……ふざけないで。あなたが、なんで｜……ふざけるな。あなたが、なんで｜……ふざけないでください。あなたが、なんで」|「嘘でしょ……嘘だって言って｜嘘だろう……嘘だと言え｜嘘ですよね……嘘だと言ってください」'),
stern:L('「……そうか。……分かった」|「最後まで、私がそばにいるよ｜最後まで、私がそばにいる｜最後まで、私がそばにいます」'),
tsun:L('「や、やだ……嘘でしょ……ばか……っ｜い、嫌だ……嘘だろう……ばか……っ｜い、嫌です……嘘ですよね……ばか……っ」|「なんで、なんでよ……せっかく会えたのに……！｜なぜだ、なぜなんだ……せっかく会えたのに……！｜どうして、どうしてですか……せっかく会えたのに……！」'),
gentle:L('「……それでも、会えてよかった｜＝｜……それでも、会えてよかったです」|「大丈夫。最後まで一緒にいるよ｜大丈夫だ。最後まで一緒にいる｜大丈夫です。最後まで一緒にいます」'),
devoted:L('「いやだ……っ、置いていかないで……｜嫌だ……っ、置いていくな……｜いやです……っ、置いていかないでください……」|「私が、なんとかする。なんとか……｜＝｜私が、なんとかします。なんとか……」'),
cool:L('「……発症までの時間を、計算させて｜……発症までの時間を、計算させてくれ｜……発症までの時間を、計算させてください」|「……方法はあるよ。たぶん。探す｜……方法はある。たぶん。探す｜……方法はあります。たぶん。探します」'),
free:L('「え……やだ、そんなの、やだよ……｜え……嫌だ、そんなの、嫌だ……｜え……いやです、そんなの、いやです……」|「うそ、うそうそ……ねえ、うそでしょ……？｜嘘だ、嘘だ……なあ、嘘だろう……？｜うそ、うそです……ねえ、うそですよね……？」'),
shy:L('「う、うそ……い、いや……っ」|「そ、そんな……わ、わたし……」'),
polite:L('「……そんな……お願い、嘘だって言って｜……そんな……頼む、嘘だと言ってくれ｜……そんな……どうか、嘘だとおっしゃってください」|「最後まで、そばにいるよ｜最後まで、そばにいる｜最後まで、お側におります」')
}
};
var FLAT={
say:L('{a}「生きてたか｜生きていたか｜生きていたんですね」{b}「そっちこそ｜そっちこそだ｜あなたこそです」――それだけで、二人には十分だった。|{a}「顔、ひどいことになってるぞ｜顔が、ひどいことになっているぞ｜顔、ひどいことになっていますよ」{b}「あなたもね｜あなたもな｜あなたもですよ」――二人は同時に吹き出した。|{a}「先に死んだら許さないって言ったよな｜先に死んだら許さないと言ったはずだ｜先に死んだら許さないって言いましたよね」{b}「言ってない。でも、同じこと思ってた｜言っていない。だが、同じことを思っていた｜言っていません。でも、同じことを思っていました」|{a}「腹減った｜腹が減った｜お腹が空きました」{b}「第一声がそれかよ｜第一声がそれか｜第一声がそれですか」――いつもの調子に、二人とも少しだけ泣きそうになった。|{a}「よし、ここからは二人でいくぞ｜よし、ここからは二人で行くぞ｜よし、ここからは二人で行きましょう」{b}「最初からそのつもりだ｜＝｜最初からそのつもりです」'),
sought:L('話を聞くと、{a}も{b}も、互いを探して街を歩き回っていた。すれ違っていたのが、少しおかしかった。|{a}は{b}を探していた。{b}も{a}を探していた。二人は顔を見合わせて、「だと思った｜＝｜だと思いました」と同時に言った。'),
hurt:L('{a}は{b}の傷を見て眉をひそめ、{b}も{a}の擦り傷を指さした。「お互いボロボロだな｜＝｜お互いボロボロですね」――二人は黙って、互いの手当てをした。|{a}が{b}の腕に包帯を巻くと、{b}は{a}の額の傷に絆創膏を貼った。貸し借りは、なしだった。'),
weak:L('{a}と{b}は、最後の缶詰をきっちり半分に分けた。昔から、おやつはいつも半分こだった。|{a}は乾パンを割って、{b}と同じ大きさにした。どちらも、大きい方を取ろうとはしなかった。')
};
function kindOf(ctx,a,b){
var t=tie(ctx,a,b),ra=ctx.R(a,b),rb=ctx.R(b,a);
if(t){
var ty=t.type,first=t.a===a.i;
if(ty==='lover'||ty==='mate'||ty==='fated')return'lover';
if(HK.tieFamLove&&HK.tieFamLove(t)&&(ctx.pair(a,b).couple||(ra.att>45&&rb.att>40)))return'lover';
if(ty==='sibprot')return first?'protA':'protB';
if(ty==='sibclose')return'sibclose';
if(ty==='teacher')return first?'teacherA':'teacherB';
if(ty==='mentor')return first?'mentorA':'mentorB';
if(ty==='pparent'&&(ctx.pair(a,b).couple||(ra.att>45&&rb.att>40)))return'lover';
if(ty==='parent'||ty==='pparent')return first?'parent':'child';
if(ty==='senpai')return first?'senpaiA':'senpaiB';
if(ty==='master')return first?'masterA':'masterB';
if(ty==='worship')return first?'worshipA':'worshipB';
if(ty==='benefactor')return first?'beneA':'beneB';
if(ty==='boss')return first?'bossA':'bossB';
if(ty==='yan')return first?'yanA':'yanB';
if(ty==='crush')return HK.Ties.pining&&HK.Ties.pining(ctx,a,b)?'crushM':first?'crushA':'crushB';
if(SCENE[ty])return ty;
}
if(ra.ten>40||ra.aff< -20)return'bad';
if(ra.att>45&&ra.aff>20)return'spark';
if(ra.aff+rb.aff>40)return'good';
return'new';
}
var MOOD={protA:'joy',protB:'joy',sibclose:'joy',teacherA:'joy',teacherB:'joy',mentorA:'joy',mentorB:'joy',lover:'joy',fwb:'shy',almost:'shy',crushA:'shy',crushB:'joy',crushM:'shy',ex:'shy',parent:'joy',child:'joy',sibling:'joy',best:'joy',childhood:'joy',buddy:'joy',friend:'joy',colleague:'joy',senpaiA:'joy',senpaiB:'joy',masterA:'joy',masterB:'joy',rival:'tense',enemy:'tense',acq:'joy',spark:'shy',good:'joy',bad:'tense',new:null,classmate:'joy',bossA:'joy',bossB:'joy',worshipA:'joy',worshipB:'joy',beneA:'joy',beneB:'joy',relative:'joy',yanA:'shy',yanB:null};
var FX={
protA:[12,10,0,0],protB:[12,10,0,0],sibclose:[12,12,0,0],teacherA:[8,10,0,0],teacherB:[8,10,0,0],mentorA:[8,12,0,0],mentorB:[10,14,0,0],
lover:[12,10,8,0],fwb:[8,6,8,0],almost:[10,8,10,0],crushA:[8,6,10,0],crushB:[8,8,4,0],crushM:[8,6,10,0],ex:[6,4,6,4],parent:[12,10,0,0],child:[12,10,0,0],sibling:[10,10,0,2],
best:[12,12,0,0],childhood:[10,10,2,0],buddy:[8,14,0,0],friend:[8,8,0,0],colleague:[6,8,0,0],senpaiA:[8,8,0,0],senpaiB:[8,10,2,0],masterA:[6,8,0,0],masterB:[8,12,0,0],
rival:[3,5,2,4],enemy:[0,-2,0,8],acq:[5,5,0,0],spark:[6,4,8,0],good:[8,8,0,0],bad:[0,0,0,6],new:[3,5,0,0],
classmate:[8,8,0,0],bossA:[6,10,0,0],bossB:[8,12,0,0],worshipA:[10,10,0,0],worshipB:[6,6,0,0],beneA:[8,8,0,0],beneB:[12,12,0,0],relative:[10,10,0,0],yanA:[6,2,6,2],yanB:[2,-2,0,6]
};
Z.reunion=function(ctx,a,b,to){
var rng=ctx.rng,k=kindOf(ctx,a,b),A=ctx.zb.A[to];
var m={a:a.name,b:b.name,area:A.name,w:wname(a)};
var t=fill(ctx.pick(SCENE[k]),m),extra='',mood=MOOD[k],why=(k==='new'?'居合わせた（':'再会（')+({protA:'我が子のように守ってきた{sib:a→b}',protB:'守ってくれた{sib:a→b}',sibclose:'{sib:a→b}',teacherA:'教え子',teacherB:'先生',mentorA:'弟子',mentorB:'師匠',lover:'恋人',fwb:'セフレ',almost:'友達以上恋人未満',crushA:'片想いの相手',crushB:'自分を想う相手',crushM:'両片想いの相手',ex:'元恋人',parent:'我が子',child:'親',sibling:'{sib:a→b}',best:'親友',childhood:'幼馴染',buddy:'バディ',friend:'友人',colleague:'同僚',senpaiA:'後輩',senpaiB:'先輩',masterA:'従者',masterB:'主',rival:'ライバル',enemy:'敵対',acq:'知人',spark:'惹かれていた相手',good:'好意のある相手',bad:'緊張のある相手',new:'初対面',classmate:'同級生',bossA:'部下',bossB:'上司',worshipA:'信仰する相手',worshipB:'自分を信仰する相手',beneA:'かつて助けた相手',beneB:'恩人',relative:'親族',yanA:'執着する相手',yanB:'自分に執着する相手'}[k])+'）';
var close=k!=='new'&&k!=='bad'&&k!=='enemy'&&k!=='rival'&&k!=='acq';
var sk=Z.seekMet?Z.seekMet(ctx,a,b):null;
if(sk){extra+=sk.pre;why+='／'+sk.who.join('／');}
else if(close&&(a.focus===b||(a.action&&a.action.id==='seek'&&tie(ctx,a,b))||(a.z.family&&a.z.family.pc===b.i))&&rng()<0.6){extra+=fill(ctx.pick(k==='sibclose'?FLAT.sought:k==='crushM'?PIN_SOUGHT:STATE.sought),m);why+=k==='crushM'?'／二人とも互いを探していたが、どちらもそれを隠した':'／'+a.name+'は'+b.name+'を探していた';}
var bz=b.z;
if(bz.bitten&&bz.aware&& !bz.hiding&&close&&rng()<0.7){
extra+=fill(ctx.pick(STATE.bitten),m);mood='grief';ctx.stress(a,25);
why+='／'+b.name+'はすでに咬まれていた';
Z.later(ctx,function(){if(b.alive&& !b.out&&Z.groupReaction)Z.groupReaction(ctx,b);});
}else if(bz.bitten&&bz.hiding){
if(a.tr.a+a.tr.caution*0.5>0.7+rng()*0.5){extra+=fill(ctx.pick(STATE.bandageSee),m);ctx.pair(a,b).zsuspect=true;why+='／'+a.name+'は'+b.name+'の傷に引っかかった（A・慎重さ）';}
else if(close)extra+=fill(ctx.pick(STATE.bandageMiss),m);
}else if(b.hp<50&&close){extra+=fill(ctx.pick(k==='sibclose'?FLAT.hurt:STATE.hurt),m);mood=k==='sibclose'?mood:'worry';if(k==='sibclose'){a.hp=Math.min(100,a.hp+4);b.hp=Math.min(100,b.hp+4);}why+='／'+b.name+'はけがをしていた';}
else if((b.z.hunger>=2||(k==='sibclose'&&a.z.hunger>=2))&&close&&rng()<0.6){if(k==='sibclose'){var tot=a.z.food+b.z.food;a.z.food=Math.floor(tot/2);b.z.food=tot-a.z.food;}extra+=fill(ctx.pick(k==='sibclose'?FLAT.weak:STATE.weak),m);}
if(bz.child&&rng()<0.7)extra+=fill(ctx.pick(STATE.child),m);
var sayA=mood&&SAY[mood][a.persona]?a.name+ctx.pick(SAY[mood][a.persona]):'';
if(/^(?:classmate|bossA|bossB|worshipA|worshipB|beneA|beneB|relative|yanA|yanB)$/.test(k)&&(t.indexOf(a.name+'「')>=0||k==='worshipA'))sayA='';
var moodB=mood==='grief'?null:k==='crushA'?'joy':k==='crushB'?'shy':mood;
var sayB=moodB&&rng()<0.55&&SAY[moodB][b.persona]?b.name+ctx.pick(SAY[moodB][b.persona]):'';
if(k==='sibclose'){
sayB='';
sayA=mood!=='grief'&&t.indexOf('「')<0?fill(ctx.pick(FLAT.say),m):'';
why=why.replace(a.name+'は'+b.name+'を探していた','二人とも互いを探していた');
}
var f=FX[k]||FX.new;
if(a.z.family&&a.z.family.pc===b.i){a.z.family.found=true;a.z.family.with=true;}
if(b.z.family&&b.z.family.pc===a.i){b.z.family.found=true;b.z.family.with=true;}
if(close){a.stress=Math.max(0,a.stress-12);b.stress=Math.max(0,b.stress-10);}
return{
actors:[a,b],cat:k==='enemy'||k==='bad'||k==='rival'?'conflict':k==='lover'||k==='spark'||k==='almost'||k==='crushM'?'romance':'bond',
fx:function(){ctx.mod2(a,b,{aff:f[0],trust:f[1],att:f[2],ten:f[3]},{aff:f[0],trust:f[1],att:f[2],ten:f[3]});},
text:HK.Sib?HK.Sib.fill(t+extra+sayA+sayB+(sk?sk.post:''),a,b,null,ctx):t+extra+sayA+sayB+(sk?sk.post:''),why:HK.Sib?HK.Sib.fill(why,a,b,null,ctx):why,mag:close?(mood==='grief'?40:18):8
};
};
})();
});
;
/* ==== js/zombie-rel.js ==== */
HK.Load.def(308,'js/zombie-rel.js',function(){
(function(){
'use strict';
var HK=window.HK,Z=HK.ZB,RK=HK.RelKit;
if(!Z|| !Z.scen|| !RK)return;
var EV=Z.scen.events,L=RK.L,fill=RK.fill;
function m2(a,b,ctx){return{a:a.name,b:b.name,area:ctx.zb.A[a.z.area].name,w:a.weapon?a.weapon.name:'素手'};}
function danger(ctx,c){return ctx.zb.A[c.z.area].z;}
function add(o){HK.addTo(EV,o);}
var T={
lesson:L('{a}は崩れた教室の黒板に、チョークで逃げ道を描いた。「いいか、{b}。ここが今日の授業だ｜＝｜いいですか、{b}。ここが今日の授業です」|{a}は{b}の隣に座り、いつもの口調で言った。「パニックになったら、深呼吸を三回。それから考える。テストに出るぞ｜＝｜パニックになったら、深呼吸を三回。それから考えます。テストに出ますよ」|{a}は{b}に、止血の仕方を一つずつ教えた。教壇に立っていたときと、同じ声だった。|{a}は{b}のノートの切れ端に、安全な道順を書いて渡した。「なくすなよ。宿題より大事だ｜なくすな。宿題より大事だ｜なくさないでください。宿題より大事です」'),
shield:L('ゾンビが窓を破った瞬間、{a}は{b}を背中にかばった。腕を引っかかれても、{a}は一歩も退かなかった。「先生の後ろにいて！｜先生の後ろにいろ！｜先生の後ろにいてください！」|{a}は{b}の手を引いて走り、自分が最後に扉をくぐった。閉まる直前、{a}の肩を何かがかすめた。|{a}は群れの前に立ちはだかった。「生徒には指一本触れさせない｜＝｜生徒には指一本触れさせません」――{w}を握る手が、震えていた。'),
grown:L('{b}が足を挫いたとき、{a}は迷わず{b}を背負った。「先生、軽いね｜先生、軽いな｜先生、軽いですね」――{b}は「重いって言って｜重いと言え｜重いと言ってください」と笑った。|{a}は{b}の背後に迫るゾンビを、震える手で突き倒した。「先生、今度は私の番だよ｜先生、今度は私の番だ｜先生、今度は私の番です」|{a}は眠っている{b}に毛布をかけた。いつも守られてばかりだった。今夜くらいは、見張りを代わりたかった。'),
scold:L('{a}は勝手に外へ出ようとした{b}の腕を掴んだ。「死にたいのか！｜＝｜死にたいんですか！」――{b}は振り払った。「先生面すんなよ、もう学校なんてないんだ｜先生面をするな、もう学校などないんだ｜先生面しないでください、もう学校なんてないんです」|{a}は{b}を叱った。{b}は唇を噛んで黙り込み、しばらく{a}と口をきかなかった。'),
rebelT:L('{a}は{b}の指示を無視して、ひとりで物資を取りに行った。戻った{a}を、{b}は叱らずに抱きしめた。|{a}は{b}に言い返した。「先生だって怖いくせに｜先生だって怖いのだろう｜先生だって、怖いんでしょう」――{b}は否定しなかった。'),
train:L('{a}は{b}に{w}の握り方を直させた。「力で振るな。体重で振れ｜＝｜力で振らないでください。体重で振ってください」――三度目で、{b}の一撃は空気を裂いた。|{a}は{b}に、足音を殺す歩き方を教えた。{b}がうまくできると、{a}は何も言わずに頷いた。それが一番の褒め言葉だった。|{a}は{b}と背中合わせに立ち、群れの動きを読む稽古をつけた。「目で追うな。気配で数えろ｜＝｜目で追わないでください。気配で数えてください」|{a}は{b}の構えを一瞥して、「まだ甘い｜＝｜まだ甘いです」とだけ言った。{b}は悔しそうに、もう一度構え直した。'),
surpass:L('{b}が三体に囲まれたとき、割って入ったのは{a}だった。教わった通りの、無駄のない一撃だった。{b}は小さく笑った。「……教えることは、もうないか｜＝｜……教えることは、もうありませんか」|{a}は{b}より先に危険に気づき、{b}の腕を引いた。一瞬遅れて、{b}のいた場所にゾンビが倒れ込んだ。{b}は弟子の背中を、黙って見つめた。'),
mentorLast:L('{a}は咬み跡を見せずに、{b}に{w}を渡した。「これからは、あなたが誰かを守る番だ｜＝｜これからは、あなたが誰かを守る番です」|{a}は{b}を呼んで、最後の稽古をつけた。{b}が一本取ったとき、{a}は満足そうに目を閉じた。|{a}は{b}に言った。「振り返るな。それが最後の教えだ｜＝｜振り返らないでください。それが最後の教えです」――{b}はまだ、その意味を知らなかった。'),
protFood:L('{a}は自分の分の缶詰を、黙って{b}の前に置いた。「腹減ってないから｜腹は減っていない｜お腹は空いていませんから」――腹の虫が鳴ったのは、そのすぐあとだった。|{a}は乾パンを二つに割って、大きい方を{b}に渡した。昔から、ずっとそうしてきた。|{a}は{b}が寝ているあいだに、自分の水を{b}のボトルに移した。'),
protDecoy:L('{a}は{b}を物置に押し込み、外から扉を閉めた。「十数えたら逃げろ。絶対に、振り返るな｜＝｜十数えたら逃げてください。絶対に、振り返らないでください」――{a}はわざと大きな音を立てて、群れを引きつけた。|{a}は{b}の頭を撫でて、「すぐ戻る｜＝｜すぐ戻ります」と言った。それから、ゾンビのいる方へ走っていった。|群れが迫ったとき、{a}は迷わず{b}の前に出た。{sib:a→b}を守るのは、自分の役目だった。'),
protRebel:L('{a}は{b}に言い返した。「もう子どもじゃない。自分のことは自分で決める｜もう子どもではない。自分のことは自分で決める｜もう子どもじゃありません。自分のことは自分で決めます」――{b}は言葉を失った。|{a}は{b}の制止を振り切って、ひとりで偵察に出た。戻ってきた{a}を、{b}は泣きながら叱った。|{a}は{b}の過保護に耐えきれず、声を荒げた。「守られてばっかりじゃ、生き残れないんだよ！｜守られてばかりでは、生き残れないんだ！｜守られてばかりじゃ、生き残れないんです！」'),
protHide:L('{a}は{b}の腕の咬み跡を見て、自分の包帯で黙って隠した。「誰にも言うな。……どうにかする｜＝｜誰にも言わないでください。……どうにかします」|{a}は{b}の熱を確かめて、震える声で言った。「大丈夫。ただの風邪だ｜大丈夫だ。ただの風邪だ｜大丈夫です。ただの風邪です」――嘘だと、二人とも分かっていた。'),
protCare:L('{a}は眠れない{b}の背中を、子どもの頃のように一晩中さすり続けた。|{a}は{b}の髪についた血を、残り少ない水で丁寧に拭った。「ほら、きれいになった｜＝｜ほら、きれいになりました」|{a}は{b}の靴紐が解けているのに気づいて、しゃがんで結び直した。{b}は「子ども扱いすんな｜子ども扱いするな｜子ども扱いしないでください」と言いながら、黙って結ばれていた。'),
closeSignal:L('{a}と{b}は、子どもの頃に決めた口笛の合図を思い出した。短く二回で「来い」、長く一回で「逃げろ」。|{a}と{b}は、壁越しに指で暗号を叩き合った。家族にしか分からない、くだらない遊びの名残だった。'),
closeBack:L('{a}と{b}は背中合わせになって、群れを迎え撃った。互いの呼吸だけで、どちらが右を受け持つか分かった。|{a}が叫ぶより先に、{b}は動いていた。生まれたときから一緒にいる相手だった。'),
closeMemory:L('{a}と{b}は、昔の家族旅行の話をして笑った。笑い声が大きすぎて、二人で慌てて口を押さえた。|{a}は{b}に、子どもの頃に隠したおやつの場所を白状した。{b}は「やっぱりあなたか｜やはりあなたか｜やっぱりあなたでしたか」と吹き出した。|{a}と{b}は、どうでもいいことで言い合いをして、五分後には肩を並べて眠っていた。'),
lockRefuse:L('{b}が想いを口にしかけたとき、{a}はそっと首を振った。「ごめん。心に決めた人がいる｜すまない。心に決めた人がいる｜ごめんなさい。心に決めた人がいます」|{a}は{b}の差し出した手を、優しく、けれどはっきりと離した。「その気持ちには、応えられない｜＝｜その気持ちには、応えられません」|{b}の視線に気づいて、{a}は困ったように笑った。「……あの人以外は、考えられないんだ｜……あの人以外は、考えられない｜……あの人以外は、考えられないんです」'),
lockDevote:L('{a}はどんなに疲れていても、{b}の見張りの時間だけは必ず起きていた。|{a}は見つけたチョコレートを、自分では一口も食べずに{b}に渡した。|{a}は{b}の名前を、眠る前に一度だけ小さく呼ぶのが癖になっていた。|{a}は{b}の後ろを、いつも半歩だけ遅れて歩いた。何かあったら、すぐに盾になれるように。'),
lockSeek:L('{a}は、ここにいない{b}のことばかり考えていた。生きていると、信じるしかなかった。|{a}は壁に、{b}だけに分かる印を刻んで回った。いつか、{b}がこれを見つけてくれるように。|{a}は{b}の名前を書いた紙を、お守りのように胸ポケットに入れていた。'),
anikiRally:L('{a}はみんなの顔を見回して、手を叩いた。「よし、腹が減っては戦えない。飯にするぞ」――張り詰めた空気が、少しだけ緩んだ。|{a}は泣いている{b}の頭をくしゃくしゃにした。「泣いていい。そのかわり、泣き終わったら一緒に行くぞ」|{a}は一番危ない見張りの時間を、当たり前のように自分の番にした。|{a}は「全員で帰る。一人も置いていかない」と言い切った。根拠はなかった。それでも、皆は少しだけ顔を上げた。'),
anikiAlone:L('皆が眠ったあと、{a}はひとりで外に出て、声を殺して泣いた。朝になると、いつもの顔に戻っていた。|{a}は誰にも見られていないのを確かめてから、震える手を握りしめた。「……しっかりしろ。頼られてるんだ」'),
kansai:L('{a}の軽口が、張り詰めた空気を少しだけ緩めた。「こんなん、帰ったら一生の笑い話にしたるわ」|{a}は{b}の肩を叩いた。「しゃあない、なんとかなるて」――根拠はなかったが、{b}は少し笑った。|{a}は缶詰の残りを数えて、「まあ、なんとかなるやろ」と言った。誰よりも先に、その言葉を信じようとしていた。')
};
var MOURN={
protA:L('{a}は{b}の遺した靴を抱きしめて、声を上げずに泣いた。守ると、約束していたのに。|{a}は{b}の名前を何度も呼んだ。返事は、もうなかった。我が子のように育ててきた、たった一人の{sib:a→b}だった。'),
protB:L('{a}は{b}がいつも背負っていたリュックを、自分で背負った。重かった。ずっと、こんなに重いものを背負わせていたのだと知った。|{a}は{b}の口癖を真似してみた。「腹減ってないから｜腹は減っていない｜お腹は空いていませんから」――言いながら、涙が止まらなかった。'),
sibclose:L('{a}は二人で決めた口笛を、誰もいない夜に一度だけ吹いた。返ってくる音は、もうなかった。|{a}は{b}と最後に言い合った、くだらない喧嘩の内容を思い出した。謝りそびれたままだった。'),
teacherA:L('{a}は{b}の名前を、出席簿の最後に書き足した。そこに丸をつけることは、もう二度とない。|{a}は{b}に教えた逃げ道を、ひとりで何度もなぞった。教えたことは、間違っていなかったはずなのに。'),
teacherB:L('{a}は{b}に教わった通りに、深呼吸を三回した。それから、ひとりで考えた。|{a}は{b}が書いてくれた道順のメモを、ぼろぼろになるまで握りしめていた。'),
mentorA:L('{a}は{b}の武器を拾い上げ、手入れをしてから、自分の横に置いた。弟子を失った師は、何も言わなかった。|{a}は{b}に最後まで「よくやった」と言えなかったことを、ずっと悔やんでいた。'),
mentorB:L('{a}は{b}の最後の教えを思い出して、振り返らずに歩き出した。泣くのは、全部終わってからだと決めた。|{a}は{b}の構えを真似て、群れの前に立った。師の背中は、もう前にない。それでも、教えはここにある。'),
lock:L('{a}は{b}のいない世界で、それでも息をしていた。ほかの誰かを好きになる日は、きっと来ない。|{a}は{b}の名前を、誰にも聞こえない声で呼んだ。心に決めた人は、最後まで一人だけだった。')
};
add({id:'zr_lesson',cat:'help',scope:'pair',
when:function(ctx,a,b){return RK.kind(ctx,a,b)==='teacherA'&&RK.cool(ctx,a,b,'lesson',5);},
w:function(ctx,a,b){return 0.6+a.tr.np*0.6+a.tr.cp*0.4+b.stress/120;},
run:function(ctx,a,b){RK.mark(ctx,a,b,'lesson');ctx.mod2(a,b,{trust:4},{trust:8,aff:5});ctx.stress(b,-10);return{text:fill(ctx.pick(T.lesson),m2(a,b,ctx)),why:a.name+'は'+b.name+'の先生（NP・CP。教え導こうとする）'};}});
add({id:'zr_shield',cat:'help',scope:'pair',
when:function(ctx,a,b){return RK.kind(ctx,a,b)==='teacherA'&&danger(ctx,a)>35&&RK.cool(ctx,a,b,'shield',8);},
w:function(ctx,a,b){return 0.4+a.tr.np*0.7+a.tr.cp*0.3-a.tr.caution*0.2;},
run:function(ctx,a,b){RK.mark(ctx,a,b,'shield');a.hp-=8+ctx.rng.int(10);ctx.mod(b,a,{aff:12,trust:14});ctx.stress(b,8);return{text:fill(ctx.pick(T.shield),m2(a,b,ctx)),why:a.name+'は生徒の'+b.name+'をかばった（NP'+Math.round(a.eg.NP)+'）',mag:18};}});
add({id:'zr_grown',cat:'help',scope:'pair',
when:function(ctx,a,b){return RK.kind(ctx,a,b)==='teacherB'&&(b.hp<70||b.stress>40)&&RK.cool(ctx,a,b,'grown',7);},
w:function(ctx,a,b){return 0.5+a.tr.np*0.6+a.tr.fc*0.2;},
run:function(ctx,a,b){RK.mark(ctx,a,b,'grown');ctx.mod2(a,b,{trust:6},{aff:10,trust:12});ctx.stress(b,-8);return{text:fill(ctx.pick(T.grown),m2(a,b,ctx)),why:'生徒の'+a.name+'が、先生の'+b.name+'を支えた',mag:16};}});
add({id:'zr_scold',cat:'conflict',scope:'pair',
when:function(ctx,a,b){var k=RK.kind(ctx,a,b);return(k==='teacherA'||k==='teacherB')&&RK.cool(ctx,a,b,'scold',8);},
w:function(ctx,a,b){var k=RK.kind(ctx,a,b);return k==='teacherA'?a.tr.cp*0.6*(b.tr.impulse+b.tr.fc):a.tr.fc*0.4+a.tr.impulse*0.4+a.stress/150;},
run:function(ctx,a,b){RK.mark(ctx,a,b,'scold');var k=RK.kind(ctx,a,b);ctx.mod2(a,b,{ten:8},{ten:10,aff: -3});return{text:fill(ctx.pick(k==='teacherA'?T.scold:T.rebelT),m2(a,b,ctx)),why:k==='teacherA'?a.name+'（先生）のCPと、'+b.name+'の衝動性がぶつかった':'生徒の'+a.name+'が反発した（FC・衝動性）'};}});
add({id:'zr_train',cat:'bond',scope:'pair',
when:function(ctx,a,b){return RK.kind(ctx,a,b)==='mentorA'&&RK.cool(ctx,a,b,'train',5);},
w:function(ctx,a,b){return 0.6+a.tr.cp*0.5+a.tr.a*0.3+b.tr.ac*0.2;},
run:function(ctx,a,b){RK.mark(ctx,a,b,'train');ctx.mod2(a,b,{trust:5},{trust:8,aff:4});b.flags.trained=(b.flags.trained||0)+1;if(b.weapon&&b.flags.trained===2)b.weapon=Object.assign({},b.weapon,{pow:b.weapon.pow+2});return{text:fill(ctx.pick(T.train),m2(a,b,ctx)),why:'師の'+a.name+'が、弟子の'+b.name+'に稽古をつけた（CP・A）'+(b.flags.trained===2?'。'+b.name+'の腕が上がった（武器の威力＋2）':'')};}});
add({id:'zr_surpass',cat:'help',scope:'pair',
when:function(ctx,a,b){return RK.kind(ctx,a,b)==='mentorB'&&(a.flags.trained||0)>=1&&danger(ctx,a)>30&&RK.cool(ctx,a,b,'surpass',10);},
w:function(ctx,a,b){return 0.4+a.tr.np*0.4+a.tr.aggr*0.3+(a.flags.trained||0)*0.2;},
run:function(ctx,a,b){RK.mark(ctx,a,b,'surpass');ctx.mod(b,a,{trust:15,aff:8});ctx.mod(a,b,{aff:6});return{text:fill(ctx.pick(T.surpass),{a:a.name,b:b.name}),why:'弟子の'+a.name+'が、師の'+b.name+'を救った（稽古 '+a.flags.trained+'回）',mag:22};}});
add({id:'zr_mlast',cat:'help',scope:'pair',
when:function(ctx,a,b){return RK.kind(ctx,a,b)==='mentorA'&&a.z.bitten&&a.z.aware&& !a.flags.mlast;},
w:function(){return 3;},
run:function(ctx,a,b){a.flags.mlast=true;if(a.weapon&&(!b.weapon||a.weapon.pow>b.weapon.pow)){var wp=b.weapon;b.weapon=a.weapon;a.weapon=wp;}ctx.mod(b,a,{trust:10,aff:8});ctx.stress(b,15);return{text:fill(ctx.pick(T.mentorLast),m2(a,b,ctx)),why:'咬まれた師の'+a.name+'が、弟子の'+b.name+'に最後の教えを遺した',mag:30};}});
add({id:'zr_pfood',cat:'help',scope:'pair',
when:function(ctx,a,b){return RK.kind(ctx,a,b)==='protA'&&a.z.food>0&&b.z.food<=1&&RK.cool(ctx,a,b,'pfood',4);},
w:function(ctx,a,b){return 0.8+a.tr.np*0.8;},
run:function(ctx,a,b){RK.mark(ctx,a,b,'pfood');a.z.food--;b.z.food++;a.hp-=3;ctx.mod(b,a,{aff:8,trust:6});return{text:fill(ctx.pick(T.protFood),m2(a,b,ctx)),why:a.name+'は{sib:a→b}の'+b.name+'を我が子のように守る（NP'+Math.round(a.eg.NP)+'）'};}});
add({id:'zr_pdecoy',cat:'help',scope:'pair',
when:function(ctx,a,b){return RK.kind(ctx,a,b)==='protA'&&danger(ctx,a)>50&& !a.flags.decoy;},
w:function(ctx,a,b){return 0.3+a.tr.np*0.6+a.tr.cp*0.2-a.tr.caution*0.3;},
run:function(ctx,a,b){a.flags.decoy=true;a.hp-=15+ctx.rng.int(15);ctx.mod(b,a,{aff:14,trust:10});ctx.stress(b,25);if(a.hp<=0)ctx.kill(a,null,(HK.Sib?HK.Sib.word(a,b,'plain',ctx):'弟妹')+'の'+b.name+'を逃がすため、群れを引きつけて');return{text:fill(ctx.pick(T.protDecoy),m2(a,b,ctx)),why:a.name+'は{sib:a→b}の'+b.name+'の囮になった（危険度 '+Math.round(danger(ctx,a))+'）',mag:30};}});
add({id:'zr_prebel',cat:'conflict',scope:'pair',
when:function(ctx,a,b){return RK.kind(ctx,a,b)==='protB'&&RK.cool(ctx,a,b,'prebel',10);},
w:function(ctx,a,b){return a.tr.fc*0.5+a.tr.cp*0.3+a.tr.impulse*0.3-a.tr.ac*0.3;},
run:function(ctx,a,b){RK.mark(ctx,a,b,'prebel');ctx.mod2(a,b,{ten:8},{ten:6});ctx.stress(b,10);a.flags.grownUp=true;return{text:fill(ctx.pick(T.protRebel),m2(a,b,ctx)),why:'{sib:b→a}の'+a.name+'が、'+b.name+'の庇護に反発した（FC・CP）'};}});
add({id:'zr_phide',cat:'help',scope:'pair',
when:function(ctx,a,b){return RK.kind(ctx,a,b)==='protA'&&b.z.bitten&& !b.flags.phid;},
w:function(ctx,a,b){return 1+a.tr.np*0.8-a.tr.honesty*0.4;},
run:function(ctx,a,b){b.flags.phid=true;ctx.pair(a,b).secret=true;ctx.stress(a,25);ctx.mod(b,a,{trust:12});return{text:fill(ctx.pick(T.protHide),m2(a,b,ctx)),why:a.name+'は{sib:a→b}の'+b.name+'が咬まれていると知り、かばった',mag:26};}});
add({id:'zr_pcare',cat:'help',scope:'pair',
when:function(ctx,a,b){return RK.kind(ctx,a,b)==='protA'&&RK.cool(ctx,a,b,'pcare',4);},
w:function(ctx,a,b){return 0.5+a.tr.np*0.6+b.stress/100;},
run:function(ctx,a,b){RK.mark(ctx,a,b,'pcare');ctx.stress(b,-12);ctx.mod(b,a,{aff:5});return{text:fill(ctx.pick(T.protCare),m2(a,b,ctx)),why:a.name+'の、{sib:a→b}への世話焼き（NP）'};}});
add({id:'zr_csig',cat:'bond',scope:'pair',
when:function(ctx,a,b){return RK.kind(ctx,a,b)==='sibclose'&&RK.cool(ctx,a,b,'csig',6);},
w:function(ctx,a,b){return 0.6+a.tr.fc*0.4+a.tr.a*0.2;},
run:function(ctx,a,b){RK.mark(ctx,a,b,'csig');ctx.mod2(a,b,{trust:8},{trust:8});return{text:fill(ctx.pick(ctx.rng()<0.5?T.closeSignal:T.closeMemory),m2(a,b,ctx)),why:'親友のような{sibs}'};}});
add({id:'zr_cback',cat:'help',scope:'pair',
when:function(ctx,a,b){return RK.kind(ctx,a,b)==='sibclose'&&danger(ctx,a)>35&&RK.cool(ctx,a,b,'cback',6);},
w:function(ctx,a,b){return 0.5+a.tr.aggr*0.3+a.tr.np*0.3;},
run:function(ctx,a,b){RK.mark(ctx,a,b,'cback');ctx.mod2(a,b,{trust:10,aff:4},{trust:10,aff:4});ctx.stress(a,-6);ctx.stress(b,-6);return{text:fill(ctx.pick(T.closeBack),m2(a,b,ctx)),why:'親友のような{sibs}の連携（危険度 '+Math.round(danger(ctx,a))+'）',mag:14};}});
add({id:'zr_lrefuse',cat:'romance',scope:'pair',
when:function(ctx,a,b){return RK.locked(a)&& !RK.lockedTo(a,b)&&ctx.R(b,a).att>35&& !ctx.pair(a,b).lockRef;},
w:function(ctx,a,b){return 0.8+ctx.R(b,a).att/60;},
run:function(ctx,a,b){ctx.pair(a,b).lockRef=true;ctx.mod(b,a,{att: -10,ten:6});ctx.stress(b,12);var t=HK.lockNames(ctx.chars,a);return{text:fill(ctx.pick(T.lockRefuse),{a:a.name,b:b.name}),why:a.name+'は恋愛の相手を'+(t?t+'と':'')+'決めている。'+b.name+'の想い（惹かれ '+Math.round(ctx.R(b,a).att)+'）には応えない'};}});
add({id:'zr_ldevote',cat:'romance',scope:'pair',
when:function(ctx,a,b){return RK.lockedTo(a,b)&&RK.cool(ctx,a,b,'ldev',5);},
w:function(ctx,a,b){return 0.8+a.tr.np*0.4+a.tr.ac*0.3+ctx.R(a,b).att/80;},
run:function(ctx,a,b){RK.mark(ctx,a,b,'ldev');ctx.mod(a,b,{att:6,aff:4});ctx.mod(b,a,{aff:6,att:3});return{text:fill(ctx.pick(T.lockDevote),{a:a.name,b:b.name}),why:a.name+'の想う相手は、'+(HK.locks(a).length>1?b.name+'たち（決めた人）':b.name+'ただ一人')};}});
function lseekTo(ctx,a){var L=HK.lockPeople(ctx.chars,a).filter(function(t){return t.alive&& !t.out&&t.z&&a.z&&t.z.area!==a.z.area;});return L.length>1?L[(a.flags.lseekN||0)%L.length]:L[0]||null;}
add({id:'zr_lseek',cat:'solo',scope:'solo',
when:function(ctx,a){if(!RK.locked(a))return false;var t=lseekTo(ctx,a);if(!t)return false;return a.flags.lseekAt==null||ctx.stepIndex-a.flags.lseekAt>6;},
w:function(ctx,a){return 0.7+a.tr.ac*0.4+a.tr.np*0.3;},
run:function(ctx,a){a.flags.lseekAt=ctx.stepIndex;var t=lseekTo(ctx,a);a.flags.lseekN=(a.flags.lseekN||0)+1;if(a.tr.np+a.tr.impulse>0.9){a.focus=t;}return{text:fill(ctx.pick(T.lockSeek),{a:a.name,b:t.name}),why:a.name+'は、離れた場所にいる'+t.name+'を想っている'+(a.focus===t?'（探しに行くと決めた）':'')};}});
add({id:'zr_aniki',cat:'help',scope:'pair',
when:function(ctx,a,b){return RK.tone(a)==='aniki'&&RK.cool(ctx,a,b,'aniki',5);},
w:function(ctx,a,b){return 0.6+a.tr.np*0.5+a.tr.lead*0.4+b.stress/100;},
run:function(ctx,a,b){RK.mark(ctx,a,b,'aniki');Z.here(ctx,a).forEach(function(o){ctx.stress(o,-6);ctx.mod(o,a,{trust:4});});return{text:fill(ctx.pick(T.anikiRally),{a:a.name,b:b.name}),why:a.name+'の面倒見のよさ（NP・CP。兄貴・姉貴分）'};}});
add({id:'zr_anikiAlone',cat:'solo',scope:'solo',
when:function(ctx,a){return RK.tone(a)==='aniki'&&a.stress>45&& !a.flags.anikiCry;},
w:function(ctx,a){return 0.6+a.stress/100;},
run:function(ctx,a){a.flags.anikiCry=true;ctx.stress(a,-15);return{text:fill(ctx.pick(T.anikiAlone),{a:a.name}),why:'頼られる側の'+a.name+'にも、限界はある（ストレス '+Math.round(a.stress)+'）'};}});
add({id:'zr_kansai',cat:'bond',scope:'pair',
when:function(ctx,a,b){return RK.tone(a)==='kansai'&&RK.cool(ctx,a,b,'kansai',6);},
w:function(ctx,a,b){return 0.3+a.tr.fc*0.6+b.stress/120;},
run:function(ctx,a,b){RK.mark(ctx,a,b,'kansai');ctx.stress(b,-8);ctx.mod(b,a,{aff:4});return{text:fill(ctx.pick(T.kansai),{a:a.name,b:b.name}),why:a.name+'の軽口（FC）'};}});
var GUARD={
help:L('{a}は{b}の様子がおかしいのに気づいて、黙って隣に座った。「顔に出てる。半分よこせ｜顔に出ている。半分よこせ｜顔に出ています。半分ください」――荷物の話なのか、気持ちの話なのか、{b}には分かっていた。|{a}は{b}の分の見張りを代わった。「次はあなたの番な｜次はあなたの番だ｜次はあなたの番です」|{a}はふらつく{b}に肩を貸した。「重い｜＝｜重いです」「うるさい｜＝｜うるさいです」――いつものやりとりだった。|{a}は{b}の手当てをしながら言った。「これで貸し一つ｜これで貸し一つだ｜これで貸し一つです」'),
repay:L('今度は{a}が、弱った{b}に肩を貸した。「この前の借り。これでチャラな｜この前の借りだ。これで帳消しだ｜この前の借りです。これで帳消しですね」|{a}は{b}の分まで働いた。「貸し借りなしだろ｜貸し借りなしだろう｜貸し借りなしでしょう」――{b}は小さく笑った。|{a}は{b}の隣に座った。前に、{b}がそうしてくれたように。')
};
add({id:'zr_cguard',cat:'help',scope:'pair',
when:function(ctx,a,b){return RK.kind(ctx,a,b)==='sibclose'&&(b.hp<60||b.stress>50||b.z.food<=0)&&RK.cool(ctx,a,b,'cguard',4);},
w:function(ctx,a,b){return 0.8+a.tr.np*0.4+a.tr.fc*0.2+(ctx.pair(a,b).owe===a.i?2:0);},
run:function(ctx,a,b){
RK.mark(ctx,a,b,'cguard');
var pf=ctx.pair(a,b),repay=pf.owe===a.i;
pf.owe=repay?null:b.i;
if(b.z.food<=0&&a.z.food>1){a.z.food--;b.z.food++;}b.hp=Math.min(100,b.hp+5);ctx.stress(b,-10);
ctx.mod2(a,b,{trust:8,aff:5},{trust:8,aff:5});
return{text:fill(ctx.pick(repay?GUARD.repay:GUARD.help),{a:a.name,b:b.name}),why:repay?a.name+'が'+b.name+'に借りを返した（親友のような{sibs}は、守り合う）':a.name+'が'+b.name+'を支えた（今度は'+b.name+'が返す番）'};
}});
RK.mourn(Z.scen,MOURN,'zr');
})();
});
;
HK.Load.def(308.5,'tone:scen-zombie',function(){
HK.Load.toneData("mixed",{"F":[
["ガラスで切った","ガラスで切りました。平気だよ",1],
["来るなら来い！","来るなら来てください！",1]],
"O":{
"ローンの支払いも、もう関係ないな":"ローンの支払いも、もう関係ないですね。ちょっと得した気分",
"感染の疑いのある者は通過できない":"感染の疑いのある方は通れません。ごめんね",
"ここで別れる":"ここでお別れです。……じゃあね",
"お怪我はございませんか":"お怪我はありませんか？　大丈夫？",
"申し訳ございませんが、お引き取りを！":"申し訳ないですけど、お引き取りください！　これ以上は無理だから！",
"生存確認。……悪くない知らせだ":"生存確認です。……悪くない知らせだね",
"探したんだぞ":"探したんですよ。どこ行ってたの",
"咬まれてない。かすっただけ。そうでしょ？":"咬まれてないです。かすっただけ。そうでしょ？",
"咬まれた。……ごめん":"咬まれました。……ごめん",
"化膿させるなよ":"化膿させないでくださいね。気をつけて",
"お下がりください！":"お下がりください！　危ないから！",
"今日、何時に帰る？":"今日、何時に帰ります？",
"ちょっと待って聞いてない！":"ちょっと待ってください、聞いてない！",
"うわー！　生きてたー！　よかったー！":"うわー！　生きてたんですね！　よかったー！",
"お前のほうが危なっかしい。持ってろ":"あなたのほうが危なっかしいですよ。持ってて",
"どこで聞いたんだ、それ":"それ、どこで聞いたんですか",
"ねえ聞いて、ここまで来るのめっちゃ大変だったんだよ！":"ねえ聞いてください、ここまで来るのめっちゃ大変だったんだよ！",
"きっと待ってる":"きっと待ってますよ。だから帰ろう",
"数は三。行ける":"数は三です。行けるよ",
"怪我はない？　お腹すいてない？":"怪我はないですか？　お腹すいてない？",
"連れていけない。足手まといになる":"連れていけないです。足手まといになるよ",
"た、たすけて……！":"た、たすけてください……！　お願い……！",
"ちっ、しつこい！":"ちっ、しつこいです！　もうやだ！",
"動くな。毒を回すな":"動かないでください。毒が回るよ",
"会えてよかった。もう大丈夫だよ":"会えてよかったです。もう大丈夫だよ",
"その時が来るまで、普通に過ごそう":"その時が来るまで、普通に過ごしましょう。それでいいじゃん",
"何でもします。だから、そばにいさせてください":"何でもします。だから、そばにいさせてください。お願いだよ",
"群れは私が引きつける。その間に行って":"群れは私が引きつけます。その間に行って",
"ひ、ひとりで、こわかった……":"ひ、ひとりで、こわかったです……ほんとに……",
"腹、鳴ってるぞ":"お腹、鳴ってますよ。我慢してたでしょ",
"なら、もう怖いものはない":"なら、もう怖いものはないです。どこへでも行けるよ",
"やったやった！　もう一人じゃない！":"やったやった！　もう一人じゃないです！　ほんとにうれしいよ！",
"次はもっと上手くやる":"次はもっと上手くやります。見ててよ",
"べ、別に心配してなかったし！　……ほんとに、生きてる？":"べ、別に心配してなかったです！　……ほんとに、生きてる？",
"……覚悟を決めろ。お前も、私もだ":"……覚悟を決めてください。あなたも、私もだよ",
"その道は危険だ":"その道は危険です。やめときなよ",
"ごめん、もう無理だった":"ごめんなさい、もう無理だった",
"どうせ俺はもうすぐ終わる。だったら、使い道くらい選ばせろ":"どうせ私はもうすぐ終わります。だったら、使い道くらい選ばせてよ",
"生きて、この街を出る。それが約束だ":"生きて、この街を出ます。それが約束だよ",
"全部終わったら、行く":"全部終わったら、行きます。待っててよ",
"どうせ誰も払わない":"どうせ誰も払わないですよ。分かってるじゃん",
"……悪くなかったぜ、お前らといるのは":"……悪くなかったです、あなたたちといるのは。楽しかったよ",
"これ、一回やってみたかったんだよね":"これ、一回やってみたかったんですよ。わくわくするじゃん",
"勝手に死ぬな。許さねえぞ":"勝手に死なないでください。許さないよ",
"み、みんなには触らせません！":"み、みんなには触らせません！　来るなら私にしてよ！",
"後は頼む。……それだけだ":"後は頼みます。……それだけだよ",
"食料と、武器と、地図。……もう、俺には要らない":"食料と、武器と、地図です。……もう、私には要らないよ",
"まだ、ちゃんとここにいる。まだ大丈夫だ":"まだ、ちゃんとここにいます。まだ大丈夫だよ",
"生きる。あと、なんか楽しいこと":"生きます。あと、なんか楽しいことしたいな",
"俺の分まで、しぶとく生きろ":"私の分まで、しぶとく生きてください。約束だよ",
"私が引きつけます！":"私が引きつけます！　早く行って！",
"ちょ、来ないでってば！":"ちょ、来ないでください！　ほんとに怒るよ！",
"数が多いだけの雑魚だ":"数が多いだけの雑魚です。怖がることないよ",
"私が私じゃなくなったら、迷わないで":"私が私じゃなくなったら、迷わないでください。お願いだよ",
"何するんだよ！":"何するんですか！　危ないじゃん！",
"生きてるなら連絡くらいしろ":"生きてるなら連絡くらいしてください。心配したじゃん",
"慌てない、走らない、叫ばない":"慌てない、走らない、叫ばない、ですよ。分かった？",
"お前が生きている確率は、四割だと見積もっていた。外れてよかった":"あなたが生きている確率は、四割だと見積もっていました。外れてよかったよ",
"大丈夫。まだ、ちゃんと動く":"大丈夫です。まだ、ちゃんと動くよ",
"お役に立てて、よかったです":"お役に立てて、よかったです。ちょっと嬉しいな",
"合流できたなら、生存率は上がる":"合流できたなら、生存率は上がります。心強いよ",
"はい、よくがんばりました":"はい、よくがんばりました。えらいよ",
"私はこっちへ行きました":"私はこっちへ行きました。ついてきてよ",
"代わりに咬まれればよかった……":"代わりに咬まれればよかったです……私なんかがさ……",
"咬まれた、咬まれたって！":"咬まれました、本当なんだって！",
"泣くな。うっとうしい":"泣かないでください。うっとうしいよ",
"大丈夫。わたしは、平気だから":"大丈夫です。私は、平気だから",
"泣くのは、全部終わってからだ":"泣くのは、全部終わってからです。今は我慢して",
"ここにいても、いいのかな":"ここにいても、いいんですかね。邪魔じゃない？",
"恨むなよ。腹が減ってるんだ":"恨まないでくださいね。お腹が減ってるんだよ",
"お願い。お願いだから":"お願いです。お願いだから",
"誰にやられた。見せろ":"誰にやられたんですか。見せてよ",
"痛かったね。すぐ手当てするから":"痛かったですよね。すぐ手当てするから",
"その時が来たら、お前がやってくれ。ほかの誰でもなく":"その時が来たら、あなたがやってください。ほかの誰でもなく、だよ"}});
HK.Load.toneData("noja",{"F":[
["……悪くなかったぜ、お前らといるのは","……悪くなかったぞ、おぬしらといるのは"],
["怪我はない？　お腹すいてない？","怪我はないか？　腹は減っておらぬか？"],
["世界の終わりくらい、好きな服を着てもいいでしょ","世の終わりくらい、好きな衣を着てもよかろう",1],
["何でもします。だから、そばにいさせてください","何でもする。ゆえに、そばにおらせてたもれ",1],
["べ、別に心配してなかったし！　……ほんとに、生きてる？","べ、別に心配などしておらなんだ！　……まことに、生きておるのか？",1],
["あ、会えて……う、うれしい、です……","あ、会えて……う、うれしいのじゃ……",1],
["一緒にいられて、本当によかった。ありがとう。さようなら。","共にいられて、まことによかった。感謝する。さらばじゃ。",1],
["お前が生きている確率は、四割だと見積もっていた。外れてよかった","おぬしが生きておる確率は、四割と見積もっておった。外れてよかったわ",1],
["ゾンビかと思った","ゾンビかと思うたぞ",1],
["やだやだやだ、あっち行って！","嫌じゃ嫌じゃ、あっちへ行け！",1],
["群れは私が引きつける。その間に行って","群れは私が引きつける。その間に行け",1],
["……意外と、落ち着くなあ","……意外と、落ち着くのう",1],
["はい、よくがんばりました","はい、よう頑張ったのう",1],
["大丈夫だ。みんな無事だった、それでいい","案ずるな。皆が無事であった、それで十分じゃ",1],
["なんなんだ、もう！","なんなのじゃ、もう！",1],
["その時が来るまで、普通に過ごそう","その時が来るまで、常のとおり過ごそうぞ",1],
["早く入れ。……噛まれていないな？","早う入れ。……噛まれてはおらぬな？",1],
["雨の音は、嫌いではない","雨の音は、嫌いではないのう",1],
["様子を見に行こう","様子を見に行くとしようかの",1],
["まだ、ちゃんとここにいる。まだ大丈夫だ","まだ、ちゃんとここにおる。まだ大事ないぞ",1]],
"O":{
"ローンの支払いも、もう関係ないな":"借金の払いも、もはや関わりないのう",
"感染の疑いのある者は通過できない":"感染の疑いある者は通さぬ",
"ここで別れる":"ここで別れるぞ",
"お怪我はございませんか":"怪我はないか",
"申し訳ございませんが、お引き取りを！":"悪いが、引き取ってもらおう！",
"生存確認。……悪くない知らせだ":"生きておるのを確かめた。……悪くない知らせじゃ",
"探したんだぞ":"探したのじゃぞ",
"咬まれてない。かすっただけ。そうでしょ？":"咬まれてはおらぬ。かすっただけじゃ。そうじゃろう？",
"咬まれた。……ごめん":"咬まれた。……すまぬ",
"化膿させるなよ":"膿ませるでないぞ",
"お下がりください！":"下がれい！",
"今日、何時に帰る？":"今日は何刻に帰る？",
"ちょっと待って聞いてない！":"待て、聞いておらぬぞ！",
"うわー！　生きてたー！　よかったー！":"おお！　生きておったか！　よかった！",
"お前のほうが危なっかしい。持ってろ":"おぬしのほうが危なっかしい。持っておれ",
"どこで聞いたんだ、それ":"それは、どこで聞いた",
"ねえ聞いて、ここまで来るのめっちゃ大変だったんだよ！":"のう聞け、ここまで来るのはたいそう難儀したのじゃ！",
"きっと待ってる":"きっと待っておる",
"数は三。行ける":"数は三じゃ。いける"}});
HK.Load.toneData("kansai",{"F":[
["あ、会えて……う、うれしい、です……","あ、会えて……う、うれしい……"],
["ずっと、ずっと探してました……！","ずっと、ずっと探してたんや……！"],
["その時が来たら、お前がやってくれ。ほかの誰でもなく","その時が来たら、あんたがやって。ほかの誰でもなく、あんたが",1],
["……悪くなかったぜ、お前らといるのは","……悪なかったで、あんたらとおるのは",1],
["やるなら、私から先にやれ","やるんやったら、私から先にやり",1],
["群れは私が引きつける。その間に行って","群れは私が引きつけとく。その間に行って",1],
["お役に立てて、よかったです","役に立ててよかったわ",1],
["生き延びたら、この街のお偉いさんに文句を言ってやる","生き延びたら、この街のお偉いさんに文句言うたるわ",1],
["勝手に死ぬな。許さねえぞ","勝手に死んだらあかん。許さへんで",1],
["ここにいても、いいのかな","ここにおっても、ええんかな",1],
["動かないで。毒が回っちゃう","動かんといて。毒が回ってまう",1],
["その時が来るまで、普通に過ごそう","その時が来るまで、普通に過ごそか",1],
["あなたが来なければ、あの人は死ななかった","あんたが来えへんかったら、あの人は死なんかった",1],
["様子を見に行こう","ちょっと様子見に行こか",1]],
"O":{
"ローンの支払いも、もう関係ないな":"ローンの支払いも、もう関係あらへんな",
"感染の疑いのある者は通過できない":"感染の疑いある人は通されへん",
"ここで別れる":"ここで別れよ",
"お怪我はございませんか":"ケガあらへん？",
"申し訳ございませんが、お引き取りを！":"悪いけど、帰ってもらうで！",
"生存確認。……悪くない知らせだ":"生存確認や。……悪ない知らせやな",
"探したんだぞ":"探したんやで",
"咬まれてない。かすっただけ。そうでしょ？":"咬まれてへん。かすっただけや。せやろ？",
"咬まれた。……ごめん":"咬まれてもうた。……ごめんな",
"化膿させるなよ":"化膿させたらあかんで",
"お下がりください！":"下がって！",
"今日、何時に帰る？":"今日、何時に帰る？",
"ちょっと待って聞いてない！":"ちょっ、待って聞いてへん！",
"うわー！　生きてたー！　よかったー！":"うわー！　生きてたー！　よかったー！",
"お前のほうが危なっかしい。持ってろ":"あんたのほうが危なっかしいわ。持っとき",
"どこで聞いたんだ、それ":"それ、どこで聞いたん",
"ねえ聞いて、ここまで来るのめっちゃ大変だったんだよ！":"なあ聞いて、ここまで来るのめっちゃ大変やってん！",
"きっと待ってる":"きっと待っとるで",
"数は三。行ける":"数は三や。いけるで"}});
HK.Load.toneData("mukuchi",{"F":[
["……悪くなかったぜ、お前らといるのは","……悪くなかった。お前らといるのは"],
["ちっ、しつこい！","……しつこい"],
["腹、鳴ってるぞ","……腹、鳴ってる"],
["世界の終わりくらい、好きな服を着てもいいでしょ","……最後くらい、好きな服",1],
["何でもします。だから、そばにいさせてください","……何でもする。そばに、いさせて",1],
["靴屋も、この街にはもう無いか","……靴屋も、もう無いか",1],
["一緒にいられて、本当によかった。ありがとう。さようなら。","……一緒にいられて、よかった。……さようなら",1],
["まだ、ちゃんとここにいる。まだ大丈夫だ","……まだ、ここにいる。……大丈夫",1],
["こっちこっち！　走って！","……こっち。走って",1],
["楽しかった！　ほんとに！","……楽しかった。……ほんとに",1]],
"O":{
"ローンの支払いも、もう関係ないな":"……ローン、もう関係ない",
"感染の疑いのある者は通過できない":"……疑いある人、通れない",
"ここで別れる":"……ここで、別れる",
"お怪我はございませんか":"……怪我、ない？",
"申し訳ございませんが、お引き取りを！":"……帰って",
"生存確認。……悪くない知らせだ":"……生きてる。いい知らせ",
"探したんだぞ":"……探した",
"咬まれてない。かすっただけ。そうでしょ？":"……咬まれてない。かすっただけ",
"咬まれた。……ごめん":"……咬まれた。ごめん",
"化膿させるなよ":"……化膿、させないで",
"お下がりください！":"……下がって",
"今日、何時に帰る？":"……今日、何時",
"ちょっと待って聞いてない！":"……待って。聞いてない",
"うわー！　生きてたー！　よかったー！":"……生きてた。よかった",
"お前のほうが危なっかしい。持ってろ":"……そっちが、危ない。持ってて",
"どこで聞いたんだ、それ":"……どこで、聞いた",
"ねえ聞いて、ここまで来るのめっちゃ大変だったんだよ！":"……ここまで、大変だった",
"きっと待ってる":"……きっと、待ってる",
"数は三。行ける":"……三体。行ける"}});
HK.Load.toneData("polite",{"F":[
["……そこにいますか？","……そこに、いらっしゃいますか？",1]],
"O":{
"ローンの支払いも、もう関係ないな":"ローンの支払いも、もう関係ありませんね",
"感染の疑いのある者は通過できない":"感染の疑いのある方は、通過できません",
"ここで別れる":"ここでお別れです",
"生存確認。……悪くない知らせだ":"生存を確認しました。……悪くない知らせです",
"探したんだぞ":"探したんですよ",
"咬まれてない。かすっただけ。そうでしょ？":"咬まれていません。かすっただけです。そうですよね？",
"咬まれた。……ごめん":"咬まれました。……すみません",
"化膿させるなよ":"化膿させないでくださいね",
"今日、何時に帰る？":"今日は何時にお帰りですか？",
"ちょっと待って聞いてない！":"ちょっと待ってください、聞いていません！",
"うわー！　生きてたー！　よかったー！":"ああ！　生きていたんですね！　よかった！",
"お前のほうが危なっかしい。持ってろ":"あなたのほうが危なっかしいです。持っていてください",
"どこで聞いたんだ、それ":"それは、どこでお聞きになったんですか",
"ねえ聞いて、ここまで来るのめっちゃ大変だったんだよ！":"聞いてください、ここまで来るのは本当に大変だったんです！",
"きっと待ってる":"きっと待っていますよ",
"数は三。行ける":"数は三です。行けます"}});
HK.Load.toneData("gentleman",{"F":[
["……覚悟を決めろ。お前も、私もだ","……覚悟を決めたまえ。君も、私もだ"],
["手当てをする。黙っていろ","手当てをしよう。少し静かにしていたまえ"],
["生きろ。それが最後の命令だ","生きたまえ。それが最後の命令だ"],
["どうせ俺はもうすぐ終わる。だったら、使い道くらい選ばせろ","どうせ私はもうすぐ終わる。ならば、使い道くらい選ばせてくれたまえ",1],
["その時が来るまで、普通に過ごそう","その時が来るまで、普段どおりに過ごそうじゃないか",1],
["連れていけない。足手まといになる","連れていくわけにはいかない。足手まといになるからね",1],
["規則を破った者から死ぬ","規則を破った者から死ぬ。覚えておきたまえ",1],
["慌てない、走らない、叫ばない","慌てない、走らない、叫ばない。いいね",1],
["後は頼む。……それだけだ","後は頼むよ。……それだけだ",1],
["まだ助けを待っている人がいる","まだ助けを待っている人がいるのだよ",1],
["ごめん、もう無理だった","すまない、もう手遅れだったよ",1],
["腹、鳴ってるぞ","腹が鳴っているよ",1],
["動くな。毒を回すな","動かないでくれたまえ。毒が回る",1],
["大丈夫だ。みんな無事だった、それでいい","大丈夫だよ。皆が無事だった、それで十分だ",1],
["なんなんだ、もう！","なんなのだね、まったく！",1],
["早く入れ。……噛まれていないな？","早く入りたまえ。……噛まれてはいないね？",1],
["群れが向かっている方だ。行くな","群れが向かっている方角だ。行ってはいけない",1],
["雨の音、嫌いじゃない","雨の音というのも、悪くないものだね",1],
["生きて、この街を出る。それが約束だ","生きて、この街を出よう。それが約束だからね",1]],
"O":{
"ローンの支払いも、もう関係ないな":"ローンの支払いも、もう関係ないね",
"感染の疑いのある者は通過できない":"感染の疑いがある者は、通すわけにはいかないよ",
"ここで別れる":"ここで別れるとしよう",
"お怪我はございませんか":"怪我はないかね",
"申し訳ございませんが、お引き取りを！":"すまないが、お引き取り願おう！",
"生存確認。……悪くない知らせだ":"生存確認だ。……悪くない知らせだね",
"探したんだぞ":"探したのだよ",
"咬まれてない。かすっただけ。そうでしょ？":"咬まれてはいない。かすっただけだ。そうだろう？",
"咬まれた。……ごめん":"咬まれてしまった。……すまない",
"化膿させるなよ":"化膿させないようにしたまえ",
"お下がりください！":"下がりたまえ！",
"今日、何時に帰る？":"今日は何時に帰るかね？",
"ちょっと待って聞いてない！":"待ちたまえ、聞いていないよ！",
"うわー！　生きてたー！　よかったー！":"おお！　生きていたか！　よかった！",
"お前のほうが危なっかしい。持ってろ":"君のほうが危なっかしい。持っていたまえ",
"どこで聞いたんだ、それ":"それは、どこで聞いたのかね",
"ねえ聞いて、ここまで来るのめっちゃ大変だったんだよ！":"聞いてくれたまえ、ここまで来るのは大変だったのだよ！",
"きっと待ってる":"きっと待っているよ",
"数は三。行ける":"数は三だ。行けるよ"}});
HK.Load.toneData("ane",{"F":[
["……意外と、落ち着くなあ","……意外と、落ち着くわねえ"],
["その時が来たら、お前がやってくれ。ほかの誰でもなく","その時が来たら、あなたがやってちょうだい。ほかの誰でもなくね"],
["感染の疑いのある者は通過できない","感染の疑いがある人は通せないわ"],
["腹、鳴ってるぞ","お腹、鳴ってるわよ"],
["あ、ありがとう、ございます……っ","あ……ありがとう……っ",1],
["大丈夫、みんな無事だったんだから、それでいいよ","大丈夫。みんな無事だった、それだけでいいのよ",1]]});
HK.Load.toneData("aniki",{"F":[
["一緒にいられて、本当によかった。ありがとう。さようなら。","一緒にいられて、本当によかったよ。ありがとね。……じゃあね"],
["ふん。お前が死ぬわけないと思ってた","ほらな。お前が死ぬわけねえって思ってたよ。……よかった",1],
["生きてるなら連絡くらいしろ","生きてるなら連絡くらいしろって。心配すんだろ",1],
["感染の疑いのある者は通過できない","悪いが、感染の疑いがある奴は通せねえんだ",1],
["その時が来るまで、普通に過ごそう","その時が来るまでは、普通に過ごそうぜ",1],
["咬まれた。……ごめん","咬まれた。……悪い",1],
["群れは私が引きつける。その間に行って","群れは私が引きつける。その間に行きな",1],
["群れが向かっている方だ。行くな","そっちは群れが向かってる方だ。行くんじゃねえ",1]]});
HK.Load.toneData("calm",{"F":[
["お前が生きている確率は、四割だと見積もっていた。外れてよかった","お前は生きていないかもしれないと思っていた。外れてよかった"],
["合流できたなら、生存率は上がる","合流できたなら、きっと生き延びられる"],
["確率的に、これが最善だった","これが最善だった"],
["どうせ俺はもうすぐ終わる。だったら、使い道くらい選ばせろ","どうせ私はもうすぐ終わる。だったら、使い道くらい選ばせてくれ",1],
["感染の疑いのある者は通過できない","感染の疑いがある人は通せない",1],
["その時が来るまで、普通に過ごそう","その時が来るまで、普通に過ごそう",1],
["生存確認。……悪くない知らせだ","無事だったんだね。……よかった",1],
["合理的な判断だ。……後悔はない","筋の通った判断だ。……後悔はない",1],
["……発症までの時間を、計算させてくれ","……あとどれくらい時間があるか、数えさせてくれ",1]]});
HK.Load.toneData("chara",{"F":[
["うわー！　生きてたー！　よかったー！","うわー！　生きてたー！　マジよかったー！",1],
["ねえ聞いて、ここまで来るのめっちゃ大変だったんだよ！","ねえ聞いて、ここまで来んのマジ大変だったんだって！",1],
["やったやった！　もう一人じゃない！","やったやった！　もうぼっちじゃねー！",1],
["ちょっと待って聞いてない！","ちょっと待って、聞いてないんだけど！",1],
["こっちこっち！　走って！","こっちこっち！　走って走って！",1],
["だいじょぶ、絶対だいじょぶだから……！","だいじょぶ、ぜってーだいじょぶだから……！",1],
["連れていけない。足手まといになる","連れていけないって……足手まといになっちゃうし",1],
["今行っても、死体が一つ増えるだけだ","今行っても、死体が一つ増えるだけだって"],
["感染の疑いのある者は通過できない","感染してるかもしれない人は通せねーんだわ"],
["うそ、うそでしょ……！？","うそ、マジかよ……！？"],
["どうせ俺はもうすぐ終わる。だったら、使い道くらい選ばせろ","どうせ私、もうすぐ終わるし。だったら、使い道くらい選ばせろって"],
["本日の天気は、晴れ時々ゾンビです","今日の天気は、晴れ時々ゾンビっす！"],
["様子を見に行こう","ちょい様子見に行こ"],
["咬まれてない。かすっただけ。そうでしょ？","咬まれてないって。かすっただけ。そうっしょ？"],
["ローンの支払いも、もう関係ないな","ローンの支払いも、もう関係ないわ"],
["好きに生きなよ。私もそうする","好きに生きなよ。私もそうする！"],
["今日はパーティーだ","今日はパーティーっしょ！"],
["食料と、武器と、地図。……もう、俺には要らない","食料と、武器と、地図。……もう、私には要らねーわ"],
["お前のほうが危なっかしい。持ってろ","あんたのほうが危なっかしいって。持ってな"],
["まだ助けを待っている人がいる","まだ助けを待ってる人がいるって"],
["これからよろしくね、相棒","これからよろしく〜、相棒"],
["群れは私が引きつける。その間に行って","群れは私が引きつける！　その間に行って！"],
["なら、もう怖いものはない","なら、もう怖いもんなしっしょ"],
["その道は危険だ","その道、ヤバいって"],
["腹、鳴ってるぞ","腹、鳴ってんじゃん"],
["あなたと会えたことが、この地獄の中で一番の幸運だった。","あんたと会えたことが、この地獄の中で一番の幸運だったわ。"],
["一人で行きたいところがある","一人で行きたいとこあるんだよね"],
["探したんだぞ","マジ探したわ"],
["……離れろ。三歩下がれ","……離れろって。三歩下がれ"],
["誰にやられた。見せろ","誰にやられたんだよ。見せて"],
["ずっと、我が子みたいに思ってた。最後まで守ってやれなくて、ごめん。あとは、自分の足で生きろ。","ずっと、マジで自分の子どもみたいに思ってたわ。最後まで守ってやれなくてゴメン。あとは、自分の足で生きてけって。"],
["大丈夫、みんな無事だったんだから、それでいいよ","だいじょぶだいじょぶ、みんな無事ならそれでオッケーっしょ",1]]});
HK.Load.toneData("cool",{"F":[
["お前が生きている確率は、四割だと見積もっていた。外れてよかった","お前の生存確率は、四割と見積もっていた。外れてよかった",1],
["どうせ俺はもうすぐ終わる。だったら、使い道くらい選ばせろ","どうせ私はもうすぐ終わる。なら、使い道くらい自分で選ぶ",1],
["感染の疑いのある者は通過できない","感染の疑いがある者は通過できない",1],
["その時が来るまで、普通に過ごそう","その時が来るまで、通常どおりに過ごそう",1],
["合流できたなら、生存率は上がる","合流できたなら、生存率は上がる",1],
["生存確認。……悪くない知らせだ","生存確認。……悪くない知らせだ",1],
["咬まれた。……ごめん","咬まれた。……すまない",1],
["群れは私が引きつける。その間に行って","群れは私が引きつける。その間に行け",1]]});
HK.Load.toneData("darui",{"F":[
["……悪くなかったぜ、お前らといるのは","……わるくなかった……あんたらといるのは……"],
["うわー！　生きてたー！　よかったー！","……うわ……生きてた。……よかった"],
["ちっ、しつこい！","……ちっ……しつこい"],
["どうせ俺はもうすぐ終わる。だったら、使い道くらい選ばせろ","……どうせ私はもうすぐ終わる。……だったら、使い道くらい選ばせて"],
["咬まれた。……ごめん","……咬まれた。……ごめん"],
["咬まれてない。かすっただけ。そうでしょ？","……咬まれてない。……かすっただけ。……そうでしょ？"],
["探したんだぞ","……探したんだよ"],
["お前のほうが危なっかしい。持ってろ","……あんたのほうが、危なっかしい。……持ってて",1],
["その時が来るまで、普通に過ごそう","……その時が来るまで、普通に。……ごろごろでいい",1],
["な、泣いてないから！　目にゴミが入っただけ！","……泣いてない。……目にゴミが入っただけ",1],
["ねえ聞いて、ここまで来るのめっちゃ大変だったんだよ！","……聞いて。……ここまで来るの、わりとたいへんだった",1],
["べ、別に心配してなかったし！　……ほんとに、生きてる？","……心配してなかったし。……ほんとに、生きてる？",1],
["まだ助けを待っている人がいる","……まだ助け、待ってる人がいる。……行くか",1],
["ローンの支払いも、もう関係ないな","……ローン。……もう関係ない",1],
["感染の疑いのある者は通過できない","……感染してるかもなら、通せない。……ごめん",1],
["本日の天気は、晴れ時々ゾンビです","……本日の天気。……晴れ、ときどきゾンビ",1],
["私が私じゃなくなったら、迷わないで","……私が私じゃなくなったら。……迷わないで",1],
["群れは私が引きつける。その間に行って","……群れは私が引きつける。……その間に、行って",1],
["連れていけない。足手まといになる","……連れてけない。……足手まとい",1],
["うそ、うそでしょ……！？","……うそ……うそでしょ……",1]]});
HK.Load.toneData("devoted",{"F":[
["あ、ありがとう、ございます……っ","あ、ありがとう、ございます……っ",1],
["ごめん、もう無理だ","すみません、もう無理です",1]]});
HK.Load.toneData("devoted_p",{"F":[
["あ、ありがとう、ございます……っ","あ、ありがと……っ",1],
["食い物をよこせ","食べ物、分けて……お願い",1],
["腹、鳴ってるぞ","お腹、鳴ってるよ",1],
["どこで聞いたんだ、それ","どこで聞いたの、それ",1],
["連れていけない。足手まといになる","ごめんね……連れていけない。足手まといに、なっちゃう",1]]});
HK.Load.toneData("free",{"F":[
["感染の疑いのある者は通過できない","感染してるかもしれない人は通せないよ"],
["本日の天気は、晴れ時々ゾンビです","本日の天気は、晴れ時々ゾンビです！",1],
["お前のほうが危なっかしい。持ってろ","きみのほうが危なっかしいよ！　持ってて！",1],
["その時が来るまで、普通に過ごそう","その時が来るまで、普通に過ごそうね！",1],
["まだ助けを待っている人がいる","まだ助けを待ってる人がいるよ！　行こう！",1],
["ローンの支払いも、もう関係ないな","ローンの支払いも、もう関係ないね！",1],
["私が私じゃなくなったら、迷わないで","私が私じゃなくなったら、迷わないで！",1],
["群れは私が引きつける。その間に行って","群れは私が引きつける！　その間に行って！",1],
["連れていけない。足手まといになる","連れていけないよ！　足手まといになっちゃう",1]],
"S":[
"咬まれた。……ごめん"]});
HK.Load.toneData("genki",{"F":[
["その時が来るまで、普通に過ごそう","その時が来るまで、普通に過ごしましょう"],
["どうか、お気を確かに……！","しっかりしてください……！"],
["随分と変わってしまいましたね","ずいぶん変わっちゃいましたね"],
["ご無事で、何よりでございます","無事でよかったですー！",1],
["お会いできて安心いたしました","会えてよかったですー！　安心しました！",1],
["今日は少し贅沢をさせていただきます","今日はちょっとだけ、贅沢しちゃいます！",1],
["お怪我はございませんか","ケガ、ないですか？",1],
["雨の音、嫌いじゃないです","雨の音、嫌いじゃないんです",1]]});
HK.Load.toneData("gentle",{"F":[
["あ、ありがとう、ございます……っ","あ、ありがとう……っ",1],
["どこで聞いたんだ、それ","どこで聞いたの、それ",1]]});
HK.Load.toneData("gentle_n",{"F":[
["感染の疑いのある者は通過できない","感染の疑いがある人は、ごめんね、通してあげられないんだ"],
["あ、ありがとう、ございます……っ","あ、ありがとう……っ",1],
["どこで聞いたんだ、それ","どこで聞いたの、それ",1],
["大丈夫、みんな無事だったんだから、それでいいよ","大丈夫。みんな無事だった、それだけでいいよ",1],
["怪我はない？　お腹すいてない？","怪我はない？　……お腹、すいてない？",1]]});
HK.Load.toneData("gyaru",{"F":[
["お前のほうが危なっかしい。持ってろ","きみのほうが危なっかしいって。持っててよ",1],
["その時が来るまで、普通に過ごそう","その時が来るまで、フツーに過ごそ",1],
["まだ助けを待っている人がいる","まだ助け待ってる人いるんだって！　急ご！",1],
["ローンの支払いも、もう関係ないな","ローンの支払いも、もう関係ないじゃん！",1],
["本日の天気は、晴れ時々ゾンビです","本日の天気は〜、晴れ時々ゾンビ！",1],
["私が私じゃなくなったら、迷わないで","私が私じゃなくなったら、迷わないでね",1],
["群れは私が引きつける。その間に行って","群れは私が引きつけるし！　その間に行って！",1],
["連れていけない。足手まといになる","連れてくのはムリ！　足手まといになっちゃうし",1],
["録音かもしれない。……鵜呑みにはしない","録音かもしれないじゃん。……鵜呑みにはしないし"],
["今行っても、死体が一つ増えるだけだ","今行っても、死体が一個増えるだけだって"],
["雨の音、嫌いじゃない","雨の音、嫌いじゃないんだよね"],
["どうせ俺はもうすぐ終わる。だったら、使い道くらい選ばせろ","どうせ私、もうすぐ終わるし。だったら、使い道くらい選ばせてよ"],
["好きに生きなよ。私もそうする","好きに生きなよ。私もそうする！"],
["今日はパーティーだ","今日はパーティーだよ！"],
["食料と、武器と、地図。……もう、俺には要らない","食料と、武器と、地図。……もう、私には要らないし"],
["生きて、この街を出る。それが約束だ","生きて、この街出るよ。それが約束だからね"],
["化膿させるなよ","化膿させないでよ"],
["きっと待ってる","きっと待ってるって"],
["動くな。毒を回すな","動かないで。毒回っちゃうから"],
["その道は危険だ","その道、マジ危ないって"],
["腹、鳴ってるぞ","お腹、鳴ってるよ"],
["全部終わったら、行く","全部終わったら、行くね"],
["まだ、ちゃんとここにいる。まだ大丈夫だ","まだ、ちゃんとここにいる。まだ大丈夫だし"],
["あなたと会えたことが、この地獄の中で一番の幸運だった。","あんたと会えたことが、この地獄の中で一番の幸運だったよ。"],
["探したんだぞ","探したんだけど！"],
["……離れろ。三歩下がれ","……離れて。三歩下がってよ"],
["誰にやられた。見せろ","誰にやられたの。見せて"],
["……ごめん。咬まれてる","……ゴメン。咬まれてる"],
["ずっと、我が子みたいに思ってた。最後まで守ってやれなくて、ごめん。あとは、自分の足で生きろ。","あんたのこと、ずっとマジの子供みたいに思ってたよ。最後まで守ってやれなくてゴメン。あとは、自分の足で生きて。"],
["あなたが来なければ、あの人は死ななかった","あんたが来なきゃ、あの人は死ななかったし",1],
["様子を見に行こう","ちょっと様子見に行こ",1]]});
HK.Load.toneData("hero",{"F":[
["うわー！　生きてたー！　よかったー！","うおおお！　生きてたのか！　よかったぁ！",1],
["ねえ聞いて、ここまで来るのめっちゃ大変だったんだよ！","なあ聞いてくれ、ここまで来るのめちゃくちゃ大変だったんだぜ！",1],
["やったやった！　もう一人じゃない！","やったぞ！　もう一人じゃない！",1],
["ちょっと待って聞いてない！","ちょっと待てって！　聞いてねえぞ！",1],
["こっちこっち！　走って！","こっちだ！　走れ、走れ！",1],
["だいじょぶ、絶対だいじょぶだから……！","大丈夫だ、絶対大丈夫だから……！",1],
["咬まれた。……ごめん","咬まれた。……すまん",1],
["連れていけない。足手まといになる","連れていけねえ。……足手まといになっちまう",1],
["大丈夫だ。みんな無事だった、それでいい","大丈夫だぜ！　みんな無事だった、それで十分だ！",1],
["ガラスで切った","ガラスで切っただけだ！　平気だぜ",1]]});
HK.Load.toneData("kohai",{"F":[
["お下がりください！","下がってくださいっす！"],
["お会いできて安心いたしました","会えて安心したっす"],
["お返しできるといいのですが","お返しできるといいんすけど"],
["どうか、お気を確かに……！","しっかりしてくださいっす……！"],
["今日、何時に帰る？","今日、何時に帰るっすか？"],
["咬まれてない。かすっただけ。そうでしょ？","咬まれてないっす。かすっただけ。そうっすよね？"],
["申し訳ございませんが、お引き取りを！","すんませんけど、帰ってくださいっす！"],
["皆様、どうかご無事で","皆さん、どうか無事でいてくださいっす"],
["ご無事で、何よりでございます","無事でよかったっす！",1],
["今日は少し贅沢をさせていただきます","今日はちょっと贅沢させてもらうっす",1],
["連れていけない。足手まといになる","連れていけないっす。足手まといになるっすから",1],
["その時が来るまで、普通に過ごそう","その時が来るまで、普通に過ごすっすよ",1],
["お怪我はございませんか","ケガ、ないっすか？",1],
["すぐに手当ていたします","すぐに手当てするっす",1],
["化膿させるなよ","化膿させないでくださいっすよ",1],
["大丈夫です。みんな無事だったんですから、それで十分です","大丈夫っすよ。みんな無事だったんすから、それで十分っす",1],
["動かないでください。毒が回ります","動かないでくださいっす！　毒が回っちゃうっすから",1],
["様子を見に行きましょう","様子、見に行ってみましょうよ",1]]});
HK.Load.toneData("mystic",{"F":[
["数は三。行ける","数は三。行けるさ"],
["お前が生きている確率は、四割だと見積もっていた。外れてよかった","君が生きている気は、半分くらいしかしていなかったんだ。外れてよかった",1],
["どうせ俺はもうすぐ終わる。だったら、使い道くらい選ばせろ","どうせ私はもうすぐ終わるんだ。だったら、使い道くらい選ばせておくれよ",1],
["感染の疑いのある者は通過できない","感染の疑いがある人は通れないんだ",1],
["その時が来るまで、普通に過ごそう","その時が来るまで、普通に過ごそうよ",1],
["合流できたなら、生存率は上がる","合流できたなら、生き延びられる気がするんだ",1],
["生存確認。……悪くない知らせだ","生きていたんだね。……悪くない知らせだ",1],
["大丈夫だ。みんな無事だった、それでいい","大丈夫さ。みんな無事だった、それでいいんだよ",1],
["噛まれていない。人間だ","噛まれていないよ。人間さ",1]]});
HK.Load.toneData("ojou",{"F":[
["恨むなよ。腹が減ってるんだ","恨まないでくださいまし。お腹が空いているのですわ"],
["立入禁止・危険です","ここは立入禁止で、危険ですわ"],
["その時が来るまで、普通に過ごそう","その時が来るまで、いつもどおりに過ごしましょう",1],
["化膿させるなよ","化膿させないでくださいましね",1],
["先に行くね。ゆっくり、来てね。……ゆっくり、だよ。","先に参りますわね。ゆっくり、いらしてくださいまし。……ゆっくり、ですわよ。",1],
["様子を見に行きましょう","様子を見にまいりましょう",1],
["下を向かないでください。まだ終わっていません","下を向いてはなりませんわ。まだ終わっておりませんのよ",1]]});
HK.Load.toneData("proud",{"F":[
["ふん。お前が死ぬわけないと思ってた","ふん。お前が死ぬわけねえと思ってた。……思ってたからな",1],
["生きてるなら連絡くらいしろ","生きてるなら連絡くらい寄越せ",1],
["感染の疑いのある者は通過できない","感染の疑いがある奴は通さねえ",1],
["その時が来るまで、普通に過ごそう","その時が来るまで、普通に過ごせ",1]]});
HK.Load.toneData("shy",{"F":[
["ここで別れる","こ、ここで……別れよう……"],
["感染の疑いのある者は通過できない","か、感染の疑いがある人は……と、通しちゃ、だめなの……"],
["あ、ありがとう、ございます……っ","あ、ありがとう、ございます……っ",1],
["食い物をよこせ","た、食べ物……わ、分けて……",1]]});
HK.Load.toneData("stern",{"F":[
["咬まれてない。かすっただけ。そうでしょ？","咬まれていない。かすっただけだ。そうだろう？"],
["どうせ俺はもうすぐ終わる。だったら、使い道くらい選ばせろ","どうせ私はもうすぐ終わる。ならば、使い道くらい選ばせろ",1],
["感染の疑いのある者は通過できない","感染の疑いのある者は通過できん",1],
["その時が来るまで、普通に過ごそう","その時が来るまで、普段どおりに過ごす",1],
["先に行くね。ゆっくり、来てね。……ゆっくり、だよ。","先に行く。ゆっくり来るんだぞ。……ゆっくり、だ。",1],
["大丈夫だ。みんな無事だった、それでいい","問題ない。全員無事だった、それで十分だ",1]]});
HK.Load.toneData("tsun",{"F":[
["……ありがと。一回しか言わないから","……ありがと。い、一回しか言わないから"],
["お前のほうが危なっかしい。持ってろ","あんたのほうが危なっかしいのよ。……持ってなさい",1],
["その時が来るまで、普通に過ごそう","その時が来るまで、普通に過ごすの。……いいわね？",1],
["まだ助けを待っている人がいる","まだ助けを待ってる人がいるの。……ほら、行くわよ",1],
["ローンの支払いも、もう関係ないな","ローンの支払いも、もう関係ないわね",1],
["感染の疑いのある者は通過できない","感染してるかもしれない人は、通せないわよ。……悪いけど",1],
["本日の天気は、晴れ時々ゾンビです","本日の天気は、晴れ時々ゾンビ。……傘、持ってきなさいよ",1],
["私が私じゃなくなったら、迷わないで","私が私じゃなくなったら……迷わないでよね",1],
["群れは私が引きつける。その間に行って","群れは私が引きつけるから。その間に行きなさいよ",1],
["連れていけない。足手まといになる","連れていけないわよ。足手まといになるだけでしょ",1],
["咬まれた。……ごめん","咬まれた。……ご、ごめん",1]]});
HK.Load.toneData("tsun_n",{"F":[
["……ありがと。一回しか言わないから","……ありがと。い、一回しか言わないからな"],
["な、何よもう！","な、何だよもう！"],
["お前のほうが危なっかしい。持ってろ","お前のほうが危なっかしい。持ってろ",1],
["その時が来るまで、普通に過ごそう","その時が来るまで、普通に過ごそう",1],
["な、泣いてないから！　目にゴミが入っただけ！","な、泣いてない！　目にゴミが入っただけだ！",1],
["べ、別に心配してなかったし！　……ほんとに、生きてる？","べ、別に心配してなかったからな！　……本当に、生きてるんだよな？",1],
["まだ助けを待っている人がいる","まだ助けを待っている人がいる",1],
["ローンの支払いも、もう関係ないな","ローンの支払いも、もう関係ないな",1],
["感染の疑いのある者は通過できない","感染の疑いがある者は、通せない",1],
["本日の天気は、晴れ時々ゾンビです","本日の天気は、晴れ時々ゾンビだ",1],
["私が私じゃなくなったら、迷わないで","私が私じゃなくなったら、迷うな",1],
["群れは私が引きつける。その間に行って","群れは私が引きつける。その間に行け",1],
["連れていけない。足手まといになる","連れていけない。足手まといになる",1]],
"S":[
"咬まれた。……ごめん"]});
HK.Load.toneData("usan",{"F":[
["お前のほうが危なっかしい。持ってろ","あんたのほうが危なっかしいねえ。持っておいで",1],
["その時が来るまで、普通に過ごそう","その時が来るまで、普通に過ごそうじゃないの",1],
["まだ助けを待っている人がいる","まだ助けを待ってる人がいるんだよねえ",1],
["ローンの支払いも、もう関係ないな","ローンの支払いも、もう関係ないねえ",1],
["会えてよかった。もう大丈夫だよ","会えてよかったよ。もう大丈夫だからねえ",1],
["感染の疑いのある者は通過できない","感染してるかもしれない人は、通せないんだよねえ。悪いね",1],
["本日の天気は、晴れ時々ゾンビです","本日の天気は、晴れ時々ゾンビだねえ",1],
["私が私じゃなくなったら、迷わないで","私が私じゃなくなったら、迷わないでおくれよ",1],
["群れは私が引きつける。その間に行って","群れは私が引きつけておくよ。その間に行きな",1],
["連れていけない。足手まといになる","連れていけないねえ。足手まといになるからさ",1],
["どこで聞いたんだ、それ","どこで聞いたんだい、それ",1],
["大丈夫、みんな無事だったんだから、それでいいよ","大丈夫さ、みんな無事だったんだから、それでいいじゃないの",1],
["次は別の道を探そう。必ず出るよ","次は別の道を探そうかねえ。必ず出るさ",1]]});
HK.Load.toneData("yankee",{"F":[
["お役に立てて、よかったです","役に立てたなら、よかった"],
["こっちこっち！　走って！","こっちこっち！　走れ！"],
["これからよろしくね、相棒","これからよろしくな、相棒"],
["まだ助けを待っている人がいる","まだ助けを待ってる人がいるんだよ"],
["やだやだやだ、あっち行って！","嫌だっつってんだろ、あっち行けって！"],
["何でもします。だから、そばにいさせてください","何でもする。だから、そばにいさせてくれ"],
["感染の疑いのある者は通過できない","感染の疑いがあるやつは通れねえ"],
["次に生まれたら、また遊ぼうね！","次に生まれたら、また遊ぼうな！"],
["泣かないでよー、笑って送ってよ！","泣くなって、笑って送ってくれよ！"],
["群れは私が引きつける。その間に行って","群れは私が引きつける。その間に行け"],
["靴屋も、この街にはもう無いか","靴屋も、この街にはもうねえか"],
["怪我はない？　お腹すいてない？","怪我ねえか？　腹減ってねえか？",1],
["ねえ聞いて、ここまで来るのめっちゃ大変だったんだよ！","なあ聞けよ、ここまで来るのめっちゃ大変だったんだぞ！",1],
["その時が来たら、お前がやってくれ。ほかの誰でもなく","そ、その時が来たら、お前がやってくれ。ほかの誰でもなく",1],
["ちょっと待って聞いてない！","ちょっ、待て、聞いてねえぞ！",1],
["大丈夫だ。みんな無事だった、それでいい","大丈夫だっつの。みんな無事だった、それでいいんだよ",1],
["行かなければならない場所がある","行かなきゃなんねえ場所があんだよ",1],
["群れが向かっている方だ。行くな","群れが向かってる方だぞ。行くんじゃねえ",1],
["まだ、誰かが動いているのか","まだ、誰か動いてんのかよ",1],
["雨の音は、嫌いではない","雨の音、嫌いじゃねえよ",1],
["様子を見に行こう","ちょっと様子見に行くぞ",1],
["……そこにいるのか","……そこにいんのか？",1]]});
HK.Load.toneData("sondai",{"F":[
["どうせ俺はもうすぐ終わる。だったら、使い道くらい選ばせろ","どうせ私はもうすぐ終わるのだよ。ならば、使い道くらい選ばせたまえ",1],
["その時が来るまで、普通に過ごそう","その時が来るまで、普段どおりに過ごせばよいのだよ",1],
["群れは私が引きつける。その間に行って","群れは私が引きつける。その間に行きたまえ",1],
["ゾンビかと思った","ゾンビかと思ったよ",1],
["動くな。毒を回すな","動くでない。毒が回る",1],
["腹、鳴ってるぞ","腹が鳴っているぞ",1],
["食い物をよこせ","食い物をよこしたまえ",1],
["後は頼む。……それだけだ","後は頼むよ。……それだけだ",1],
["慌てない、走らない、叫ばない","慌てない、走らない、叫ばない。いいかね",1],
["離れて。私、もうすぐ、だめになる","離れてくれたまえ。私は、もうすぐ、だめになる",1],
["規則を破った者から死ぬ","規則を破った者から死ぬのだよ",1],
["大丈夫だ。みんな無事だった、それでいい","案ずることはない。諸君が無事だった、それで十分だよ",1],
["下を向くな。まだ終わっていない","下を向くものではない。まだ終わってはいないのだよ",1],
["なんなんだ、もう！","いったい何なのかね、まったく！",1],
["群れが向かっている方だ。行くな","群れが向かっている方角だぞ。行くんじゃない",1],
["今行っても、死体が一つ増えるだけだ","今行ったところで、死体が一つ増えるだけだよ",1],
["様子を見に行こう","様子を見に行こうではないか",1]]});
HK.Load.toneData("boku_n",{"F":[
["次は別の道を探そう。必ず出るよ","次は、別の道を探そう。……大丈夫、必ず出られるよ",1]]});
HK.Load.toneData("god",{"F":[
["大丈夫だ。みんな無事だった、それでいい","案ずるな。皆が無事であった、それでよい",1],
["今行っても、死体が一つ増えるだけだ","今行ったところで、骸が一つ増えるのみよ",1],
["様子を見に行こう","様子を見に参ろう",1]]});
HK.Load.toneData("keigo_sarc",{"F":[
["お下がりください！","下がってください。邪魔です",1]]});
HK.Load.toneData("keigo_flat",{"F":[
["あなたが来なければ、あの人は死ななかったんです","あなたが来なければ、あの人は死んでいませんでした。それだけです",1]]});
HK.Load.toneData("ronkyaku",{"F":[
["大丈夫だ。みんな無事だった、それでいい","大丈夫なのだよ。皆が無事だった、それで十分だ",1],
["群れが向かっている方だ。行くな","群れが向かっている方角だ。行くな",1],
["……そこにいるのか","……そこにいるのかね",1]]});
HK.Load.toneData("chara_down",{"F":[
["ご無事で、何よりでございます","無事でよかったですよー。ほんとに",1],
["まだ、誰かが動いているんですね","……まだ、誰か動いてるんですね",1]]});
});
HK.Load.done('scen-zombie', '6a480354fa', 1);
