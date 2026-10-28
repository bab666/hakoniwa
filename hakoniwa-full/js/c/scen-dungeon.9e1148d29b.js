;
/* ==== js/dungeon.js ==== */
HK.Load.def(163,'js/dungeon.js',function(){
(function(){
'use strict';
var HK=window.HK;
var clamp=HK.clamp;
var DG=HK.DG=HK.DG||{};
DG.pool=DG.pool||[];
var OUTFIT={armor:4,light:3,robe:2,thin:1};
DG.say=function(S,o){return say(S,o);};
DG.fmt=function(S,s,ev){return fmt(S,s,ev);};
DG.pick=function(S,a){return pick(S,a);};
DG.stim=function(S,ev,m){return stim(S,ev,m);};
DG.key=function(S,o,w){return key(S,o,w);};
DG.react=function(S,f){return react(S,f);};
DG.settle=function(S){return settle(S);};
DG.flushQ=function(S){S.defer=false;flushQ(S);};
function fmt(S,str,ev){
var h=S.h;
return str.replace(/\{(a|t|p|boss|floor)\}/g,function(m,k){
if(k==='a')return h.name;
if(k==='t')return ev?ev.name:'';
if(k==='p')return DG.PARTS[(ev&&ev.partNow)||'all'];
if(k==='boss')return S.theme.boss;
if(k==='floor')return S.floorName;
return m;
});
}
function pick(S,arr){
var U=S.useT=S.useT||{},free=[],i;
for(i=0;i<arr.length;i++)if(!U[arr[i]])free.push(arr[i]);
var t;
if(free.length)t=free[S.rng.int(free.length)];
else{t=arr[0];for(i=1;i<arr.length;i++)if(U[arr[i]]<U[t])t=arr[i];}
S.useN=(S.useN||0)+1;U[t]=S.useN;
return t;
}
function pickAny(S,arr){
var r=S.recent,t=arr[S.rng.int(arr.length)];
for(var i=0;i<5&&r.indexOf(t)>=0;i++)t=arr[S.rng.int(arr.length)];
r.push(t);if(r.length>14)r.shift();
return t;
}
function isTop(h){return!!(h&&HK.Pos&&HK.Pos.hardTopNpc(h));}
DG.isTop=isTop;
function topKey(ev,kind){
var k=kind||ev.kind;
return k==='mon'||k==='spring'||k==='captive'||k==='cap'||k==='boss'?k:(ev.o&&ev.o.mind)||k==='odd'?'mind':k==='chest'?'chest':'trap';
}
function evText(S,ev,kind){
var T=DG.TOP;
if(!T|| !isTop(S.h))return fmt(S,pick(S,ev.texts),ev);
if(S.h._teaseEv===ev&&DG.teaseText)return fmt(S,DG.teaseText(S,S.h,topKey(ev,kind)),ev);
return fmt(S,pick(S,T[topKey(ev,kind)]),ev);
}
function zr(S){return S.tzR||(S.tzR=HK.rng(((S.seed0||0)*13+7919)>>>0));}
function teaseRoll(S,ev,key){
var h=S.h,X=HK.Lewd;
h._teaseEv=null;
if(!isTop(h)||HK.SAFE_ON|| !DG.TEASE|| !DG.TEASE[key]||S.env.trap<15)return false;
if(X&&X.conf('dungeon')&&X.lv(S.env)==='low')return false;
if(DG.teaseLeft&& !DG.teaseLeft(S,h,key))return false;
if(zr(S)()>=0.5)return false;
h._teaseEv=ev;
return true;
}
function teased(h,ev){return!!(h&&ev&&h._teaseEv===ev);}
DG.teased=teased;
DG.evText=function(S,ev,kind){return evText(S,ev,kind);};
var RICHMAP={avoid:'avoid',resist:'resist',win:'win',sneak:'sneak',skipChest:'skip',skipSpring:'skip',rest:'rest'};
function line(S,key,ev){
var TL=isTop(S.h)&&DG.TOP&&(DG.TOP.lines[key]||(DG.TEASE&&DG.TEASE.lines&&DG.TEASE.lines[key]));
if(TL)return fmt(S,pick(S,TL),ev);
var rk=RICHMAP[key],R0=rk&&DG.RICH&&DG.RICH[rk]&&S.h&&DG.RICH[rk][S.h.persona];
if(R0)return fmt(S,pick(S,R0),ev);
var L=DG.LINES[key];
return L?fmt(S,pick(S,L),ev):'';
}
function rawStage(h){return h.corrupt<20?0:h.corrupt<40?1:h.corrupt<60?2:h.corrupt<80?3:4;}
function stage(h){var s=rawStage(h);if(h.rxSg==null||s>h.rxSg)h.rxSg=s;return h.rxSg;}
DG.stage=function(h){return stage(h);};
function shiftLine(S,h,sg){
var prev=h.rxSaid;h.rxSaid=sg;
if(prev==null||sg<=prev)return'';
var top=isTop(h),T=top?DG.SHIFT_TOP:DG.SHIFT;
if(!T|| !T[sg]||(sg===2&& !S.flags.c40&& !top))return'';
return fmt(S,pick(S,T[sg]))+' ';
}
function will(h){return clamp(h.tr.cp*0.35+h.tr.a*0.25+h.reason/100*0.4+(HK.Attr?HK.Attr.willAdd(h):0),0,1);}
function hasCurse(h,id){return h.curses.indexOf(id)>=0;}
function hasItem(h,id){return h.items.indexOf(id)>=0;}
function useItem(h,id){var i=h.items.indexOf(id);if(i>=0)h.items.splice(i,1);}
function st(h,id){return h.stats[id]||3;}
function pct(v){return Math.round(v*100)+'%';}
function say(S,o){
if(DG.lewdHook)DG.lewdHook(S,o);
o.floor=S.floor;o.room=S.room;o.n=S.log.length;
o.v={r:Math.round(S.h.reason),p:Math.round(S.h.pleasure),c:Math.round(S.h.corrupt)};
if(o.kind!=='step'&&HK.EroScene&&HK.EroScene.hit(S,o,false,'dungeon'))o.lewd=true;
S.log.push(o);
if(o.kind!=='climax'&&o.kind!=='step')S.lastMain=o;
if(S.q&&S.q.length&&o.kind!=='climax'&& !S.flushing)flushQ(S);
return o;
}
function flushQ(S){
S.flushing=true;
var q=S.q;S.q=[];
q.forEach(function(f){f();});
S.flushing=false;
}
function later(S,f){if(S.defer)S.q.push(f);else f();}
function routine(S,o){if(S.rng()<(S.party&&S.party.length>1?0.3:0.5))return say(S,o);return null;}
function key(S,o,why){o.key=true;S.turns.push({n:o.n,why:why});}
function react(S,force){
var h=S.h,T=isTop(h)&&DG.TAILS_TOP?DG.TAILS_TOP:DG.TAILS[h.persona],sg=stage(h);
if(!T)return'';
var sh=shiftLine(S,h,sg);
if(!force&& !sh&&sg===h.lastStage&&S.rng()>0.2)return'';
h.lastStage=sg;
if(DG.ENDURE&&sg<=1&&T!==DG.TAILS_TOP&&S.rng()<0.4)return' '+sh+fmt(S,pick(S,DG.ENDURE[h.persona]));
return' '+sh+fmt(S,pick(S,T[sg]));
}
function note(S,text,keyWhy,target){
var last=target||S.log[S.log.length-1];
if(!last||last.kind==='step')last=say(S,{kind:'sys',tag:'状態',text:'',why:''});
last.text+=(last.text?' ':'')+text;
if(keyWhy)key(S,last,keyWhy);
return last;
}
function addCurse(S,id,src){
var h=S.h;
if(!DG.CURSES[id]||hasCurse(h,id))return false;
h.curses.push(id);
h.sens+=DG.CURSES[id].sens||0;
var first= !S.flags.firstCurse;S.flags.firstCurse=true;
later(S,function(){note(S,'〔'+DG.CURSES[id].label+'が刻まれた〕',first?'初めての呪い':null);});
return true;
}
function clothDown(S,n){
var h=S.h;
if(h.cloth<=0)return;
h.cloth=Math.max(0,h.cloth-n);
S.cnt.cloth+=n;
}
function stim(S,ev,mult,why){
var h=S.h,o=ev.o,rng=S.rng;
S.defer=true;
var part=ev.part==='any'?pickAny(S,DG.PART_ORDER):ev.part;
ev.partNow=part;
var dev=part==='all'?avgDev(h):h.dev[part]||0;
var clothMul=1+(4-h.cloth)*0.09;
var gain=ev.power*(0.55+S.env.trap/100*0.9)*h.sens*(1+dev*0.13)*clothMul*(mult||1)*rng.range(0.78,1.22);
var w=will(h);
gain*=1.12-w*0.42;
if(o.mind)gain*=1.15-h.tr.cold*0.35-st(h,'magic')*0.04;
if(o.shame||hasCurse(h,'voice'))h.reason-=(2+h.tr.ac*5);
if(hasCurse(h,'obey')&&(o.mind||o.lure==='ac'))gain*=1.3;
h.pleasure+=gain;
h.reason-=gain*(0.13+(o.mind?0.08:0))*(1-w*0.45)*S.k;
h.lastEv=ev;
if(isTop(h)){
if(teased(h,ev)){if(part==='all')DG.PART_ORDER.forEach(function(k){h.dev[k]=Math.min(10,(h.dev[k]||0)+0.21);});else h.dev[part]=Math.min(10,(h.dev[part]||0)+(o.dev||1)*0.6);}
}
else if(part==='all')DG.PART_ORDER.forEach(function(k){h.dev[k]=Math.min(10,(h.dev[k]||0)+0.35);});
else h.dev[part]=Math.min(10,(h.dev[part]||0)+(o.dev||1));
if(o.sens)h.sens+=o.sens;
if(o.cloth)clothDown(S,o.cloth);
if(o.hp)h.hp-=o.hp;
S.cause[ev.kind]=(S.cause[ev.kind]||0)+gain;
S.lastEv=ev;
if(o.curse&&rng()<0.55+S.env.trap/250)addCurse(S,o.curse,ev.name);
climaxCheck(S,ev);
return gain;
}
function avgDev(h){
var s=0;
DG.PART_ORDER.forEach(function(k){s+=h.dev[k]||0;});
return s/DG.PART_ORDER.length;
}
function climaxCheck(S,ev){
var h=S.h,rng=S.rng;
var guard=0;
while(h.pleasure>=100&&guard++ <3){
if(hasCurse(h,'edge')){
h.pleasure=94+rng.int(5);
h.reason-=7+h.tr.fc*4;
h.corrupt+=2;
S.cnt.edge++;
var et=line(S,'edge',ev);
later(S,function(){S.lwWho=h;S.lwEv=ev;say(S,{kind:'climax',tag:'寸止め',text:et,why:'寸止めの呪い'});S.lwWho=null;});
break;
}
h.climax++;
var w=will(h);
var gainC=4.5+h.climax*1.25+h.tr.fc*4+h.tr.ac*3-h.tr.cp*3+(S.h.goal.id==='secret'?3:0);
h.corrupt+=Math.max(3,gainC*1.4)*S.k;
h.reason-=(4+h.climax)*(1-w*0.4)*S.k;
h.sens+=0.04+(hasCurse(h,'mark')?0.05:0);
h.pleasure=18+rng.int(18)+(hasCurse(h,'mark')?14:0)+(hasCurse(h,'heat')?8:0);
var top=isTop(h)&&DG.CLIMAX_TOP,cn=h.climax,moanOn=DG.MOAN&& !top&&rng()<0.45,tz=top&&teased(h,ev)&& !!DG.teaseClimax;
later(S,function(){
var hs=S.h;S.h=h;
var sg=stage(h),XS= !top&&HK.SoloKit&&HK.SoloKit.CLIMAX_SOLO&&HK.SoloKit.CLIMAX_SOLO[h.persona];
var ctext=fmt(S,(tz&&DG.teaseClimax(S,h))||pick(S,top?DG.CLIMAX_TOP[sg]:XS?DG.CLIMAX[h.persona][sg].concat(XS[sg]):DG.CLIMAX[h.persona][sg]),ev);
if(moanOn){var mv=HK.Moan&&HK.Moan.say?HK.Moan.say(S,h,'climax',{novel:true,force:sg<=1&& !h.fallen,fall:sg>=3|| !!h.fallen},DG.MOAN[h.persona]):pick(S,DG.MOAN[h.persona]);if(mv)ctext='「'+mv+'」'+ctext;}
S.h=hs;
S.lwWho=h;S.lwEv=ev;
var o=say(S,{kind:'climax',tag:'絶頂',text:ctext,why:cn===1?'初めての絶頂':cn+'回目',tease:tz||undefined});
S.lwWho=null;
if(cn===1)key(S,o,'最初の絶頂');
if(cn===5||cn===10)key(S,o,cn+'回目の絶頂');
});
}
}
function settle(S){
var h=S.h;
h.reason=clamp(h.reason,-5,100);
if(h.reason<50)h.corrupt+=(50-h.reason)/8*S.k;
if(h.pleasure>70)h.corrupt+=1.2*S.k;
if(h.corrupt>=40&& !S.flags.c40){S.flags.c40=true;var o1=say(S,{kind:'sys',tag:'心',text:line(S,'mid'),why:'堕ち度40'});key(S,o1,'心が揺らぎ始めた');}
if(h.corrupt>=75&& !S.flags.c75){S.flags.c75=true;var o2=say(S,{kind:'sys',tag:'心',text:line(S,'brink'),why:'堕ち度75'});key(S,o2,'陥落寸前');}
h.corrupt=clamp(h.corrupt,0,100);
h.pleasure=clamp(h.pleasure,0,100);
h.hp=clamp(h.hp,0,100);
h.sens=clamp(h.sens,0.6,3.5);
if(h.reason<=0)h.corrupt=100;
if(h.corrupt>=100){h.fallen=true;return true;}
return false;
}
function useItems(S){
var h=S.h;
if(hasItem(h,'herb')&&(h.pleasure>78||h.reason<35)){
useItem(h,'herb');h.pleasure-=45;h.reason+=15;h.corrupt-=2;
note(S,pick(S,['〔鎮静の薬草で昂りを鎮めた〕','〔鎮静の薬草を噛んで、火照りを少し冷ました〕','〔鎮静の薬草の苦みで、どうにか正気を保った〕','〔鎮静の薬草を煎じて飲み、昂りを抑えた〕']));
}
if(hasItem(h,'holy')&&h.curses.length){
var order=['edge','obey','dbl','heat','mark','dream','voice','melt'];
var tgt=order.filter(function(c){return hasCurse(h,c);})[0];
if(tgt&&(tgt!=='mark'||S.h.goal.id==='curse'||h.corrupt>30)){
useItem(h,'holy');
h.curses.splice(h.curses.indexOf(tgt),1);
h.sens=Math.max(1,h.sens-(DG.CURSES[tgt].sens||0));
S.cnt.cured++;
note(S,'〔聖水で'+DG.CURSES[tgt].label+'を解いた〕');
}
}
if(hasItem(h,'cloak')&&h.cloth<=1){
useItem(h,'cloak');h.cloth+=2;
note(S,'〔予備の外套を羽織った〕');
}
if(hasItem(h,'scroll')&&h.captor&& !S.over&& !h.fallen){
var g=S.h.goal.id;
var th=g==='secret'?(h.corrupt>70||h.reason<25):g==='escape'||h.tr.caution>0.45?true:(h.capRounds>=1||h.corrupt>50||h.reason<38);
if(th){
useItem(h,'scroll');
var wasBoss=h.bossCapture;
h.captor=null;h.bossCapture=false;h.hp=Math.max(h.hp,30);
var o=say(S,{kind:'sys',tag:'脱出',text:line(S,'useScroll')+(wasBoss?' '+fmt(S,pick(S,DG.LINES.bossReturn)):''),why:'脱出の巻物（目標：'+S.h.goal.label+'）'});
key(S,o,'巻物で抜け出した');
}
}
}
function gainItem(S,id,src){
var h=S.h;
h.items.push(id);S.cnt.items++;
if(id==='map')S.mapFloor=S.floor;
note(S,'〔'+(src?src+'から':'')+DG.ITEMS[id].label+'を入手〕');
}
function randItem(S){
return HK.weighted(S.rng,['herb','holy','charm','map','cloak','scroll'],function(k){
return{herb:3,holy:2,charm:2,map:1.5,cloak:1.2,scroll:0.5+S.env.mercy/200}[k];
});
}
function detectP(S){
var h=S.h,t=h.tr;
var p=0.1+t.caution*0.3+st(h,'scout')*0.07+t.a*0.08-S.env.trap/1000-h.pleasure/420-(h.outfit==='armor'?0.05:0);
if(S.mapFloor===S.floor)p+=0.2;
if(S.party&&S.party.length>1){var bs=0;S.party.forEach(function(x){if(x!==h&& !x.fallen&& !x.captor)bs=Math.max(bs,st(x,'scout')+x.tr.caution*2);});p+=Math.max(0,bs-st(h,'scout'))*0.015;}
if(S.h.action.id==='careful')p+=0.15;
if(S.h.action.id==='rush')p-=0.1;
return clamp(p,0.04,0.9);
}
function lureP(S,ev){
var h=S.h,l=ev.o.lure,base=0;
if(l)base=(h.tr[l]!=null?h.tr[l]:0.5)*0.45;
var seek=Math.max(0,(h.corrupt-45)/85)+(S.h.goal.id==='secret'?0.12+h.corrupt/300:0);
if(hasCurse(h,'obey')&&l==='ac')base+=0.3;
return{lure:clamp(base,0,0.8),seek:clamp(seek,0,0.75)};
}
function whyDetect(S,ok){
var h=S.h;
return(ok?'見抜いた':'見抜けず')+'（罠察知 '+st(h,'scout')+'・慎重さ '+pct(h.tr.caution)+(h.pleasure>50?'・昂りで注意散漫':'')+'）';
}
function pickEv(S,kind){
var th=S.themeKey,f=S.floor;
var list=DG.pool.filter(function(e){
if(e.kind!==kind)return false;
if(e.themes&&th!=='mix'&&e.themes.indexOf(th)<0)return false;
if(e.themes&&th==='mix'&&e.themes.indexOf(S.mixTheme)<0&&S.rng()<0.5)return false;
if(e.o.f&&f+1<e.o.f)return false;
return true;
});
if(!list.length)list=DG.pool.filter(function(e){return e.kind===kind;});
var seen=S.seen;
return HK.weighted(S.rng,list,function(e){return 1/(1+(seen[e.id]||0)*2.5);});
}
function seen(S,ev){S.seen[ev.id]=(S.seen[ev.id]||0)+1;}
function roomKind(S){
var env=S.env,h=S.h;
var W={
trap:0.36+env.trap/400,
mon:0.12+env.monsters/300+(S.h.action.id==='fight'?0.06:0),
chest:0.1+(S.h.action.id==='loot'?0.05:0),
spring:0.05+env.mercy/1000,
rest:0.04+env.mercy/600,
odd:0.12,
captive:0.03+(S.h.goal.id==='rescue'?0.07:0)
};
if(h.pleasure>75||h.reason<40)W.rest+=0.04;
return HK.weighted(S.rng,Object.keys(W),function(k){return W[k];});
}
function roomTrap(S,ev,viaChest){
var h=S.h,rng=S.rng;
seen(S,ev);
var det=rng()<detectP(S);
var L=lureP(S,ev);
var mult=1,why=whyDetect(S,det),deliberate=false;
if(det){
if(rng()<L.seek){deliberate=true;S.cnt.seek++;why='見抜いていたのに、自分から（堕ち度 '+Math.round(h.corrupt)+'）';}
else if(ev.o.lure&&rng()<L.lure){deliberate=true;why='見抜いていたが、'+({fc:'好奇心（FC）',np:'情（NP）',ac:'従順さ（AC）',cp:'負けん気（CP）',a:'知りたい気持ち（A）',impulse:'衝動'}[ev.o.lure]||'誘惑')+'に負けた';}
else{
var avoid=0.55+st(h,'scout')*0.05+h.tr.a*0.12+(ev.o.mind?st(h,'magic')*0.05:0);
if(rng()<avoid){
S.cnt.avoided++;
routine(S,{kind:'ev',tag:viaChest?'宝箱':'罠',text:line(S,ev.o.mind?'resist':'avoid',ev),why:why});
return;
}
mult=0.6;why+='・避けきれず';
}
}
if(hasItem(h,'charm')&& !deliberate){
useItem(h,'charm');
say(S,{kind:'item',tag:'護符',text:fmt(S,'{t}が{a}に触れる寸前、護符が砕けて光った。何も起きなかった。',ev),why:'守りの護符'});
return;
}
S.cnt.traps++;
if(isTop(h))teaseRoll(S,ev,topKey(ev,viaChest?'chest':null));
var text=(deliberate?line(S,'seek',ev)+' ':'')+evText(S,ev,viaChest?'chest':null);
var before=h.pleasure;
stim(S,ev,mult*(deliberate?1.15:1));
var o=say(S,{kind:'ev',tag:viaChest?'宝箱':ev.o.mind?'幻惑':'罠',tease:teased(h,ev)||undefined,text:text+react(S),why:(deliberate?why+'／':'')+DG.PARTS[ev.partNow]+'＋'+Math.round(h.pleasure-before>0?h.pleasure-before:0)});
if(deliberate&&S.cnt.seek===1)key(S,o,'自分から罠に触れた');
S.holdTarget=S.lastMain;
if(ev.o.hold)hold(S,ev,ev.o.hold);
}
function hold(S,ev,n){
var h=S.h,rng=S.rng;
var tz=teased(h,ev);
if(isTop(h)&& !tz){S.defer=false;flushQ(S);return;}
h.holdN=(h.holdN||0)+1;
for(var i=0;i<n;i++){
if(S.over||S.h.fallen)return;
var esc=0.22+st(h,'fight')*0.06+h.tr.cp*0.2+h.tr.a*0.08+h.hp/500-h.corrupt/260-h.pleasure/500;
if(rng()<esc){S.defer=false;note(S,'→'+line(S,'holdEscape',ev),null,S.holdTarget);flushQ(S);return;}
stim(S,ev,0.72*(tz?0.6:1));
if(settle(S))return;
}
S.defer=false;
note(S,'→'+line(S,'holdRelease',ev),null,S.holdTarget);
flushQ(S);
}
function roomMon(S,ev){
var h=S.h,rng=S.rng,t=h.tr;
seen(S,ev);
S.cnt.fights++;
if(S.h.action.id==='stealth'||(t.caution>0.6&&rng()<0.4)){
var sneak=0.3+t.caution*0.3+st(h,'scout')*0.05;
if(rng()<sneak){S.cnt.avoided++;routine(S,{kind:'ev',tag:'魔物',text:line(S,'sneak',ev),why:''});return;}
}
var allies=S.party?S.party.filter(function(x){return x!==h&& !x.fallen&& !x.captor;}).length:0;
var power=allies*0.04+0.32+st(h,'fight')*0.09+t.aggr*0.18+t.cp*0.08+h.hp/450+(S.h.action.id==='fight'?0.1:0)-h.pleasure/400;
var foe=0.18+(S.floor/Math.max(1,S.floors-1))*0.25+S.env.monsters/450+(ev.o.f?0.05:0);
if(ev.o.lure&&rng()<lureP(S,ev).lure){
var o0=say(S,{kind:'ev',tag:'魔物',text:line(S,'charmed',ev),why:'誘いに乗った（'+ev.o.lure.toUpperCase()+'）'});
power-=0.4;o0.tag='魅了';
}
if(rng()<power-foe+0.5){
S.cnt.won++;
h.hp-=4+rng.int(8);
routine(S,{kind:'ev',tag:'撃退',text:line(S,'win',ev),why:''});
return;
}
h.hp-=12+rng.int(12)+S.floor*2;h.lostN=(h.lostN||0)+1;
S.cnt.traps++;
if(isTop(h))teaseRoll(S,ev,'mon');
var before=h.pleasure;
stim(S,ev,1);
say(S,{kind:'ev',tag:isTop(h)&& !teased(h,ev)?'逆襲':'敗北',tease:teased(h,ev)||undefined,text:evText(S,ev)+react(S),why:DG.PARTS[ev.partNow]+'＋'+Math.round(Math.max(0,h.pleasure-before))});
if(settle(S))return;
if(h.hp<=0){capture(S,ev);return;}
S.holdTarget=S.lastMain;
if(ev.o.hold)hold(S,ev,ev.o.hold);
}
function capture(S,ev){
var h=S.h;
h.hp=0;
S.h.captor=ev;S.h.capRounds=0;S.h.capN=(S.h.capN||0)+1;S.cnt.captured++;
var o=say(S,{kind:'sys',tag:'捕縛',text:line(S,'captured',ev),why:'体力が尽きた'});
key(S,o,ev.name+'に捕らえられた');
}
function roomCaptive(S){
var h=S.h,rng=S.rng,ev=pickEv(S,'cap');
seen(S,ev);
S.h.capRounds++;
ev=Object.create(ev);ev.name=S.h.captor.name;
if(isTop(h))teaseRoll(S,ev,'cap');
stim(S,ev,1+S.h.capRounds*0.1);
say(S,{kind:'ev',tag:'捕縛中',tease:teased(h,ev)||undefined,text:evText(S,ev,'cap')+react(S),why:'捕らわれて'+S.h.capRounds+'部屋分'});
if(settle(S))return;
var esc=0.12+h.tr.cp*0.22+h.tr.a*0.1+st(h,'fight')*0.03+h.reason/320-h.corrupt/220;
if(S.h.goal.id==='secret')esc-=0.1;
if(rng()<esc){
h.hp=30;S.h.captor=null;
var wasBoss= !!h.bossCapture;h.bossCapture=false;
var o=say(S,{kind:'sys',tag:'脱出',text:line(S,'capEscape')+(wasBoss?' '+fmt(S,pick(S,DG.LINES.bossReturn)):''),why:'脱出（CP '+Math.round(h.eg.CP)+'・理性 '+Math.round(h.reason)+'）'+(wasBoss?'／主の間へ戻る':'')});
key(S,o,wasBoss?S.theme.boss+'の手から逃げ出した':'捕縛から逃げ出した');
}
}
function roomChest(S,ev){
var h=S.h,t=h.tr,rng=S.rng;
seen(S,ev);
var open=0.3+t.fc*0.35+t.impulse*0.15+(S.h.action.id==='loot'?0.4:0)+(S.h.goal.id==='treasure'?0.08:0)-t.caution*0.22+h.corrupt/250;
if(rng()>open){routine(S,{kind:'ev',tag:'宝箱',text:line(S,'skipChest',ev),why:''});return;}
var good=(ev.o.good||0.4)+S.env.mercy/400+st(h,'scout')*0.03;
if(rng()<good){
say(S,{kind:'ev',tag:'宝箱',text:line(S,'openGood',ev),why:''});
gainItem(S,ev.o.item||randItem(S));
return;
}
roomTrap(S,ev,true);
}
function roomSpring(S,ev){
var h=S.h,rng=S.rng;
seen(S,ev);
var drink=0.35+h.tr.fc*0.25+(100-h.hp)/200+h.corrupt/300-h.tr.caution*0.2;
if(rng()>drink){routine(S,{kind:'ev',tag:'泉',text:line(S,'skipSpring',ev),why:''});return;}
if(rng()<(ev.o.good||0.45)+S.env.mercy/300){
h.hp+=30;h.reason+=ev.o.heal||10;h.pleasure-=20;
say(S,{kind:'ev',tag:'泉',text:line(S,'springGood',ev),why:''});
return;
}
S.cnt.traps++;
stim(S,ev,1);
say(S,{kind:'ev',tag:'泉',text:evText(S,ev)+react(S),why:''});
}
function roomOdd(S,ev){
var h=S.h,rng=S.rng;
seen(S,ev);
var resist=0.22+h.tr.a*0.25+h.tr.cold*0.2+st(h,'magic')*0.05+h.reason/400-h.corrupt/300;
if(ev.o.free){
if(ev.o.heal)h.reason+=ev.o.heal;
say(S,{kind:'ev',tag:'出来事',text:fmt(S,pick(S,ev.texts),ev),why:ev.o.heal?'理性が少し戻った':''});
if(ev.o.item)gainItem(S,ev.o.item);
return;
}
if(rng()<resist&& !(ev.o.lure&&rng()<lureP(S,ev).lure)){
routine(S,{kind:'ev',tag:'幻惑',text:line(S,'resist',ev),why:''});
h.reason+=2;
return;
}
S.cnt.traps++;
stim(S,ev,1);
say(S,{kind:'ev',tag:'幻惑',text:evText(S,ev,'odd')+react(S),why:''});
}
function roomCaptiveNpc(S,ev){
var h=S.h,rng=S.rng;
seen(S,ev);
var help=h.tr.np*0.6+(S.h.goal.id==='rescue'?0.4:0)+h.tr.warmth*0.1;
if(rng()>help){
h.reason-=h.tr.np*4;
say(S,{kind:'ev',tag:'囚われ人',text:line(S,'ignoreNpc',ev),why:'助けなかった（NP '+Math.round(h.eg.NP)+'）'});
return;
}
var ok=0.4+st(h,'fight')*0.05+h.tr.a*0.15+st(h,'scout')*0.03-(ev.o.bait?0.25:0);
if(rng()<ok){
S.cnt.rescued++;h.reason+=8;
var o=say(S,{kind:'ev',tag:'救出',text:line(S,'rescue',ev),why:'救出成功（NP '+Math.round(h.eg.NP)+'）'});
if(S.cnt.rescued===1)key(S,o,'囚われ人を救った');
if(rng()<0.7)gainItem(S,randItem(S),'助けた冒険者');
return;
}
S.cnt.traps++;
stim(S,ev,1.1);
say(S,{kind:'ev',tag:'囚われ人',text:evText(S,ev,'captive')+react(S),why:'助けようとして、罠にかかった（NP '+Math.round(h.eg.NP)+'）'});
S.holdTarget=S.lastMain;
if(ev.o.hold)hold(S,ev,ev.o.hold);
}
function roomRest(S){
var h=S.h,rng=S.rng,m=S.env.mercy;
S.cnt.rests++;
if(h.pleasure>65&&rng()<h.tr.fc*0.4+h.corrupt/160+(S.h.goal.id==='secret'?0.2:0)){
h.pleasure=100;
say(S,{kind:'ev',tag:'休息',text:line(S,'relief'),why:'昂りを自分で鎮めた（FC '+Math.round(h.eg.FC)+'）'});
var c0=h.corrupt;climaxCheck(S,null);h.corrupt=c0+(h.corrupt-c0)*0.5;
h.hp+=15;
return;
}
h.reason+=10+m/10+h.tr.a*4;h.pleasure-=30;h.hp+=25;h.corrupt-=1.5;
say(S,{kind:'ev',tag:'休息',text:line(S,'rest'),why:''});
if(hasCurse(h,'dream')){
var ev=pickEv(S,'odd');
ev=Object.create(ev);ev.o={mind:true};ev.name='淫夢';
stim(S,ev,0.9);
say(S,{kind:'ev',tag:'淫夢',text:line(S,'dream')+react(S),why:'淫夢の呪い'});
}
}
function roomStairs(S){
var h=S.h,rng=S.rng;
var next=S.floor+1<S.floors?floorName(S,S.floor+1):'';
if(rng()<0.25+S.env.trap/400){
var ev=pickEv(S,'trap');
roomTrap(S,ev);
}else if(rng()<0.3){
say(S,{kind:'ev',tag:'階段',text:line(S,'stairs'),why:''});
}
}
function bossEv(S,B,mv){
return{id:B.id,name:B.name,kind:'boss',boss:B,part:mv.part,power:mv.power+S.floors*(B.mid?0.5:1),o:mv.o,texts:mv.texts};
}
function freeOf(S){return S.party.filter(function(x){return!x.fallen&& !x.captor;});}
function roomBoss(S,B,mid){
var rng=S.rng,head={name:B.name};
if(!mid){
if(!S.bossMet){S.bossMet=true;var o=say(S,{kind:'sys',tag:'ボス',text:fmt(S,pick(S,B.intro),head),why:'最深部の主'});key(S,o,B.name+'と対峙');}
else say(S,{kind:'sys',tag:'ボス',text:fmt(S,pick(S,DG.LINES.bossAgain),head),why:'最深部の主との再戦'});
}
S.bossTag=mid?'番人':'技';
var need=mid?1:(S.floors>=7?3:2)+(S.party.length>=3?1:0),hits=0,rounds=mid?2:5+Math.min(2,S.party.length-1);
var order=rng.shuffle(B.moves);
for(var r=0;r<rounds&& !S.over;r++){
var F=freeOf(S);
if(!F.length)break;
var Fv=F.filter(function(x){return!isTop(x);});
var h=S.h=HK.weighted(rng,Fv.length?Fv:F,function(x){return 1.2-x.tr.caution*0.6+x.corrupt/150;});
var mv=order[r%order.length],ev=bossEv(S,B,mv);
if(isTop(h))teaseRoll(S,ev,'boss');
stim(S,ev,1+r*0.08);
say(S,{kind:'ev',tag:S.bossTag,tease:teased(h,ev)||undefined,text:(mid&&r===0?B.name+'：':'')+'《'+mv.n+'》'+evText(S,ev,'boss')+react(S),why:DG.PARTS[ev.partNow]});
S.holdTarget=S.lastMain;
if(mv.o.hold)hold(S,ev,mv.o.hold);
var splash=[];
F.forEach(function(x){if(x!==h&& !isTop(x)&&rng()<0.6){S.h=x;stim(S,ev,0.6);splash.push(x);}});
S.h=h;
if(splash.length){S.defer=false;note(S,'〔'+splash.map(function(x){return x.name;}).join('・')+'も巻き込まれた〕',null,S.holdTarget);flushQ(S);}
splash.forEach(function(x){S.h=x;if(settle(S))DG.fallHero(S,x);});
S.h=h;
if(settle(S)){DG.fallHero(S,h);continue;}
if(DG.partyBoss&&F.length>1)DG.partyBoss(S,h,B);
F=freeOf(S);
if(!F.length)break;
var best=null,bp= -1;
F.forEach(function(x){var p=0.28+st(x,'fight')*0.06+x.tr.cp*0.14+x.tr.a*0.1+st(x,'magic')*0.04+x.reason/260-x.pleasure/320-x.corrupt/300+(mid?0.1:0);if(p>bp){bp=p;best=x;}});
bp+=(F.length-1)*0.06;
if(rng()<bp){
hits++;S.h=best;
if(hits>=need){
var o2=say(S,{kind:'sys',tag:'撃破',text:fmt(S,pick(S,hitLines(B,best)),head)+' '+fmt(S,pick(S,B.win),head),why:best.name+'（戦闘力 '+st(best,'fight')+'・CP '+Math.round(best.eg.CP)+'）'+(F.length>1?'＋仲間'+(F.length-1)+'人':'')});
key(S,o2,B.name+'を倒した');
if(!mid)S.over='clear';
else S.cnt.mids++;
return;
}
say(S,{kind:'ev',tag:'反撃',text:fmt(S,pick(S,hitLines(B,best)),head),why:'反撃 '+hits+'/'+need});
}
}
if(S.over)return;
var Fr=freeOf(S);
if(mid){
Fr.forEach(function(x){x.hp-=25/Math.max(1,Fr.length*0.7);});
if(Fr.length){S.h=Fr[0];say(S,{kind:'ev',tag:'番人',text:line(S,'midLeave',head),why:'倒しきれなかった'});}
Fr.forEach(function(x){if(x.hp<=0){S.h=x;capture(S,bossEv(S,B,B.moves[0]));}});
return;
}
Fr.forEach(function(x){S.h=x;capture(S,bossEv(S,B,B.moves[0]));x.bossCapture=true;});
}
function hitLines(B,x){
if(!isTop(x))return B.hit;
var l=B.hit.filter(function(t){return!/抜け出|振り払|断ち切|引きちぎ|斬り落と|引き剥が|ほど|魅了/.test(t);});
return l.length?l:['{a}は{t}の懐に踏み込み、渾身の一撃を叩き込んだ。','{a}は{t}の攻撃を紙一重でかわし、がら空きになった脇へ一撃を叩き込んだ。','{a}は真正面から{t}に踏み込み、怯んだ隙を逃さず続けざまに打ち込んだ。'];
}
function pickBoss(S,th,tiers,used){
var list=DG.BOSSES.filter(function(b){return b.th===th&&tiers.indexOf(b.tier)>=0&&used.indexOf(b.id)<0;});
if(!list.length)list=DG.BOSSES.filter(function(b){return tiers.indexOf(b.tier)>=0&&used.indexOf(b.id)<0;});
return list[S.rng.int(list.length)];
}
function floorName(S,f){
var F=S.themeKey==='mix'?DG.THEMES[S.mixOrder[f%5]].floors:S.theme.floors;
var idx=Math.min(F.length-1,Math.floor(f/Math.max(1,S.floors)*F.length));
if(f===S.floors-1)idx=F.length-1;
return'地下'+(f+1)+'階・'+F[idx];
}
function mkHero(S,src,pc,i){
var rng=S.rng,env=S.env,scen=HK.SCENARIOS.dungeon;
var h={
i:i,ng:Array.isArray(src.loveNG)?src.loveNG.filter(function(x){return x>=0;}):[],lock:HK.lockFirst(src.loveLock),locks:HK.parseLocks(src.loveLock),name:src.name,eg:src.eg,memo:src.memo||'',tr:HK.traits(src.eg),
stats:{},hp:100,pleasure:0,sens:1,corrupt:0,climax:0,dev:{},curses:[],items:[],outfit:env.outfit,cloth:OUTFIT[env.outfit]||3,
gender:src.gender||'',likes:src.likes||'',tone:src.tone||'',fp:src.fp||'',pos:src.pos||'',posLike:src.posLike||'',futa: !!src.futa
};
if(HK.charFlags)HK.charFlags(src,h,'dungeon');
h.top=HK.egoType(src.eg).top;
h.reason=clamp(55+h.eg.A*1.1+h.eg.CP*0.9,40,100);
h.persona=HK.personaOf(h);
(scen.stats||[]).forEach(function(s){var v=pc.stats&&pc.stats[s.id];h.stats[s.id]=v==null||v==='random'?1+rng.int(5): +v;});
if(env.outfit==='robe')h.stats.magic=Math.min(5,h.stats.magic+1);
function resolve(list,p){
if(p&&p!=='auto')for(var k=0;k<list.length;k++)if(list[k].id===p)return list[k];
return HK.weighted(rng,list,function(o){return Math.pow(Math.max(0.02,o.fit(h.tr)),3);});
}
h.action=resolve(scen.actions,pc.action);h.goal=resolve(scen.goals,pc.goal);
h.autoAction= !pc.action||pc.action==='auto';h.autoGoal= !pc.goal||pc.goal==='auto';
if(h.goal.id==='curse'){h.curses.push('mark');h.sens+=DG.CURSES.mark.sens;}
return h;
}
function thickFall(S,h){
var TH=DG.THICK,TV=window.HK.ThickVM;
if(window.HK.SAFE_ON|| !TH|| !TV||S.env.trap<15)return'';
var X=window.HK.Lewd,cf=X&&X.conf('dungeon');
if(cf&&(X.lv(S.env)==='low'||X.short(S.env,S.rng)))return'';
var P=window.HK.Pos,fem=P?P.isF(h):h.gender==='f';
var top=isTop(h),l=top?(fem&&TH.fallTopF?TH.fallTopF:TH.fallTop):(TH.fall[S.themeKey]||[]).concat(S.themeKey==='mix'|| !TH.fall[S.themeKey]?TH.fall.any:[]);
if(!top&&TH.fall[S.themeKey]&&S.rng()<0.3)l=l.concat(TH.fall.any);
if(!top&&fem&&h.likes==='f'&&TH.fallFF)l=(TH.fallFF[S.themeKey]||[]).concat(TH.fallFF.any);
if(!l|| !l.length)return'';
var cd=TH.coda&&TH.coda[h.persona];
var ex='';
if(cf&&top&&X.ero(S.env)&&TH.fallTopEro&&window.HK.Ero){var d0=h.eroDom;h.eroDom=true;ex+='\n\n'+window.HK.Ero.fill(S,pick(S,TH.fallTopEro),h);h.eroDom=d0;}
if(cf&&X.high(S.env)&&TH.fallAgain)ex+='\n\n'+pick(S,top?TH.fallAgainTop:TH.fallAgain);
var vr=S.tmR||(S.tmR={rng:window.HK.rng(((S._tmSeed||0)*31+9973)>>>0)});
return fmt(S,TV.voice(vr.rng,pick(S,l),h,h)+ex+(cd?'\n\n'+pick(S,cd):''),h.captor||S.lastEv);
}
DG.fallHero=function(S,h){
if(h.fallLogged)return;
h.fallLogged=true;h.fallen=true;
S.h=h;
var f=DG.pickFall(S);
h.fallTitle=f.title;h.fallText=fmt(S,f.text,h.captor||S.lastEv);
var thk=thickFall(S,h);
var of=say(S,{kind:'sys',tag:'陥落',text:(thk||line(S,'fall',h.captor||S.lastEv))+(S.party.length>1&&thk?'\n\n':'')+(S.party.length>1?fmt(S,pick(S,DG.LINES.fallParty||['{a}は仲間の呼ぶ声に、もう振り返らなかった。'])):''),why:h.name+'：堕ち度 '+Math.round(h.corrupt)+(h.dgWatch>=1?'（見て上がった分 +'+Math.round(h.dgWatch)+'）':'')+'・理性 '+Math.round(Math.max(0,h.reason))});
if(HK.Attr&&HK.Attr.strong(h))of.text+='\n\n'+HK.Attr.hold(function(l){return pick(S,l);},h,'dungeon');
key(S,of,h.name+'が快楽に堕ちた');
if(S.party.every(function(x){return x.fallen;}))S.over='fall';
};
DG.simulate=function(input){
(DG.pool||[]).forEach(function(e){if(e)delete e.partNow;});
if(DG.BOSSES)Object.keys(DG.BOSSES).forEach(function(k){var B=DG.BOSSES[k];((B&&B.moves)||[]).forEach(function(m){if(m)delete m.partNow;});});
var scen=HK.SCENARIOS.dungeon,rng=HK.rng(input.seed);
var env={};
scen.env.forEach(function(e){env[e.id]=input.env&&input.env[e.id]!=null?input.env[e.id]:e.def;});
env.ct=input.env&&input.env.ct!=null?String(input.env.ct):'';
if(HK.Dark)HK.Dark.keep(input.env,env);else env.heavy='normal';
var tk=env.theme==='mix'?'mix':env.theme;
var S={
rng:rng,env:env,log:[],hist:[],turns:[],seen:{},cause:{},flags:{},
themeKey:tk,floors:env.floors,rooms:env.rooms,floor:0,room:0,over:null,seed0:(+input.seed||0)>>>0,
cnt:{traps:0,avoided:0,fights:0,won:0,items:0,rescued:0,seek:0,edge:0,cloth:0,cured:0,rests:0,captured:0,mids:0,saved:0,assault:0}
};
S.mixOrder=rng.shuffle(DG.THEME_KEYS);
S.recent=[];S.q=[];
var hostI=DG.hostSetup?DG.hostSetup(S,input): -1;
S.party=input.chars.map(function(c,i){return{c:c,i:i};}).filter(function(x){return x.i!==hostI;}).slice(0,4).map(function(x){return mkHero(S,x.c,(input.perChar&&input.perChar[x.i])||{},x.i);});
S.h=S.party[0];
S.k=clamp(Math.pow(20/(S.floors*S.rooms),0.85),0.4,1.3);
S.k*=HK.Dark.f(S,'fall');
if(tk==='mix')S.theme={label:'混成迷宮'};
else S.theme={label:DG.THEMES[tk].label,floors:DG.THEMES[tk].floors};
var used=[],thOf=function(f){return tk==='mix'?S.mixOrder[f%5]:tk;};
S.finalBoss=pickBoss(S,thOf(S.floors-1),['final','both'],used);used.push(S.finalBoss.id);
S.theme.boss=S.finalBoss.name;
S.mids={};
for(var mf=1;mf<S.floors-1;mf+=2){var mb=pickBoss(S,thOf(mf),['mid','both'],used);if(mb){S.mids[mf]=mb;used.push(mb.id);}}
if(DG.partySetup)DG.partySetup(S,input);
if(HK.fearNG){var PM=[];S.party.forEach(function(h){PM[h.i]=h;});if(S.host&&S.host.kind==='res'&&S.host.i>=0)PM[S.host.i]=S.host;HK.fearNG(PM,input.ties);if(HK.kinNG)HK.kinNG(PM,input.ties);}
S.floorName=floorName(S,0);
var P0=S.party;
say(S,{kind:'sys',tag:'開始',text:P0.length>1?P0.map(function(x){return x.name;}).join('・')+'は互いの装備を確かめ合い、'+S.floorName+'へ踏み込んだ。':fmt(S,pick(S,DG.LINES.start))+(S.h.goal.id==='curse'?'下腹には淫紋が刻まれている。':''),why:P0.map(function(x){return(P0.length>1?x.name+'：':'')+'方針「'+x.action.label+'」目標「'+x.goal.label+'」';}).join('／')});
if(DG.hostStart)DG.hostStart(S);
snap(S);
var budget=S.floors*S.rooms+16,steps=0;
while(!S.over&&steps++ <budget){
S.mixTheme=S.mixOrder[S.floor%5];
S.floorName=floorName(S,S.floor);
if(S.lastFloorLog!==S.floor){S.lastFloorLog=S.floor;say(S,{kind:'step',text:S.floorName});}
var act=S.party.filter(function(x){return!x.fallen;});
if(!act.length){S.over='fall';break;}
act.forEach(function(h){
S.h=h;
if(hasCurse(h,'heat')){h.pleasure+=5*h.sens;climaxCheck(S,null);}
if(hasCurse(h,'melt')&&rng()<0.35){clothDown(S,1);say(S,{kind:'sys',tag:'呪い',text:line(S,'melt'),why:'衣溶けの呪い'});}
});
act.filter(function(h){return h.captor;}).forEach(function(h){
if(S.over||h.fallen)return;
S.h=h;roomCaptive(S);S.defer=false;flushQ(S);
if(settle(S))DG.fallHero(S,h);
});
if(S.over)break;
var free=S.party.filter(function(x){return!x.fallen&& !x.captor;});
var caps=S.party.filter(function(x){return!x.fallen&&x.captor;});
if(caps.length&&free.length&&DG.partyRescue)DG.partyRescue(S,caps,free);
free=S.party.filter(function(x){return!x.fallen&& !x.captor;});
var advance=free.length>0;
if(free.length){
var h=S.h=HK.weighted(rng,free,function(x){return 1+(1-x.tr.caution)*0.8+x.tr.fc*0.3+(x.action.id==='rush'?0.4:0)+x.corrupt/120;});
S.roomHit=null;
if(S.floor===S.floors-1&&S.room===S.rooms-1)roomBoss(S,S.finalBoss,false);
else if(S.room===S.rooms-1){if(S.mids[S.floor])roomBoss(S,S.mids[S.floor],true);else roomStairs(S);}
else if(h.action.id==='rush'&&rng()<0.15)say(S,{kind:'ev',tag:'通過',text:line(S,'rush'),why:'一気に駆け抜ける'});
else{
var k=roomKind(S);
var p0=h.pleasure;
if(k==='rest'){if(free.length>1){free.forEach(function(x){if(x!==h){x.reason+=5+S.env.mercy/15;x.pleasure-=15;x.hp+=15;}});}roomRest(S);}
else{
var ev=pickEv(S,k);
if(k==='trap')roomTrap(S,ev);
else if(k==='mon')roomMon(S,ev);
else if(k==='chest')roomChest(S,ev);
else if(k==='spring')roomSpring(S,ev);
else if(k==='odd')roomOdd(S,ev);
else if(k==='captive')roomCaptiveNpc(S,ev);
if(h.pleasure-p0>6||h.captor)S.roomHit={h:h,ev:S.lastEv,gain:h.pleasure-p0};
}
if(k!=='rest'&& !S.over)free.forEach(function(x){
if(x===h||x.fallen||x.captor||S.over||rng()>0.85)return;
S.h=x;
var k2=HK.weighted(rng,['trap','odd','mon','chest'],function(q){return{trap:0.55,odd:0.2,mon:0.18,chest:0.07}[q];});
var ev2=pickEv(S,k2),px=x.pleasure;
if(k2==='trap')roomTrap(S,ev2);else if(k2==='odd')roomOdd(S,ev2);else if(k2==='mon')roomMon(S,ev2);else roomChest(S,ev2);
S.defer=false;flushQ(S);
if(!S.roomHit&&(x.pleasure-px>6||x.captor))S.roomHit={h:x,ev:S.lastEv,gain:x.pleasure-px};
if(settle(S))DG.fallHero(S,x);
});
S.h=h;
}
S.defer=false;flushQ(S);
if(!S.over&&DG.partyAfter&&S.party.filter(function(x){return!x.fallen;}).length>1){DG.partyAfter(S,h,S.roomHit);S.defer=false;flushQ(S);}
if(!S.over&&S.host&&DG.hostRoom){DG.hostRoom(S,S.roomHit);S.h=h;S.defer=false;flushQ(S);}
}
S.party.forEach(function(x){
if(x.fallen||S.over)return;
S.h=x;
if(settle(S)){DG.fallHero(S,x);return;}
useItems(S);
});
snap(S);
if(S.over)break;
if(advance&&S.party.some(function(x){return!x.fallen&& !x.captor;})){
S.room++;
if(S.room>=S.rooms){S.room=0;S.floor++;}
if(S.floor>=S.floors){S.over='clear';}
}
}
if(!S.over){
var live0=S.party.filter(function(x){return!x.fallen;});
S.floor=S.floors-1;S.room=S.rooms-1;S.floorName=floorName(S,S.floor);
say(S,{kind:'step',text:S.floorName});
S.h=live0.filter(function(x){return!x.captor;})[0]||live0[0];
say(S,{kind:'sys',tag:'最深部',text:fmt(S,pick(S,DG.LINES.reachBoss)),why:'長い探索の果てに、主の間へ'});
for(var guard=0;!S.over&&guard<400;guard++){
var caps2=S.party.filter(function(x){return!x.fallen&&x.captor;});
caps2.forEach(function(h){
if(S.over||h.fallen)return;
S.h=h;roomCaptive(S);S.defer=false;flushQ(S);
if(settle(S))DG.fallHero(S,h);else useItems(S);
});
if(S.over)break;
var fr2=S.party.filter(function(x){return!x.fallen&& !x.captor;});
if(fr2.length){S.h=fr2[0];roomBoss(S,S.finalBoss,false);S.defer=false;flushQ(S);}
S.party.forEach(function(x){if(x.fallen||S.over)return;S.h=x;if(settle(S))DG.fallHero(S,x);});
snap(S);
if(!S.over&&S.party.every(function(x){return x.fallen;}))S.over='fall';
}
if(!S.over)S.over='fall';
}
S.party.forEach(function(x){if(x.fallen&& !x.fallLogged)DG.fallHero(S,x);});
if(S.over==='fall')S.party.forEach(function(x){if(!x.fallLogged){x.corrupt=Math.max(x.corrupt,100);DG.fallHero(S,x);}});
if(S.over==='clear')S.party.forEach(function(x){if(!x.fallen&&x.captor){x.captor=null;x.bossCapture=false;x.freedAtEnd=true;}});
return DG.finish(S,input);
};
function snap(S){
var a=S.party.map(function(h){return{r:Math.round(Math.max(0,h.reason)),p:Math.round(h.pleasure),c:Math.round(h.corrupt),hp:Math.round(h.hp)};});
S.hist.push({n:S.log.length,f:S.floor,r:a[0].r,p:a[0].p,c:a[0].c,hp:a[0].hp,hs:a});
}
function heroOut(S,h){
var fate=h.fallen?'陥落':'踏破';
return{
i:h.i,name:h.name,eg:h.eg,memo:h.memo,top:h.top,persona:h.persona,tone:h.tone,stats:h.stats,tr:h.tr,
action:h.action.label,goal:h.goal.label,goalId:h.goal.id,autoAction:h.autoAction,autoGoal:h.autoGoal,
reason:Math.max(0,Math.round(h.reason)),pleasure:Math.round(h.pleasure),corrupt:Math.round(h.corrupt),hp:Math.round(h.hp),
sens:Math.round(h.sens*100)/100,climax:h.climax,dev:h.dev,cloth:h.cloth,curses:h.curses.slice(),items:h.items.slice(),
fate:fate,fallTitle:h.fallTitle||'',fallText:h.fallText||'',hardTop:isTop(h)
};
}
DG.finish=function(S,input){
S.h=S.party[0];
var E=DG.ending(S);
if(E&&Array.isArray(E.lines)&&HK.Dark&&HK.Dark.note(S))E.lines.push(HK.Dark.note(S));
var heroes=S.party.map(function(h){return heroOut(S,h);});
var res={
solo:true,scenId:'dungeon',seed:input.seed,env:S.env,input:input,
hero:heroes[0],heroes:heroes,party:S.party.length>1,
themeLabel:S.theme.label,boss:S.theme.boss,mids:Object.keys(S.mids).map(function(k){return S.mids[k].name;}),
reached:S.floor+1,floors:S.floors,log:S.log,hist:S.hist,turns:S.turns,cnt:S.cnt,cause:S.cause,
ending:E,advice:DG.advice(S,E),stepCount:S.hist.length-1,partyNotes:S.partyNotes||[]
};
res.outcome=E.title;
res.summary=heroes.map(function(h){return h.name;}).join('・')+'：'+E.title+(/階）$/.test(E.title)?'':'（地下'+Math.min(res.reached,S.floors)+'階）');
res.chars=heroes.map(function(h){return{name:h.name,i:h.i};});
return res;
};
function soloEnding(S,h){
var L=[],type=S.over,title,kind;
var floorTxt='地下'+(Math.min(S.floor,S.floors-1)+1)+'階';
if(type==='fall'){
kind='over';
title='陥落 ― '+h.fallTitle+'（'+floorTxt+'）';
L.push(h.fallText);
}else{
kind='ok';
if(h.corrupt<20&&h.climax===0)title='完全踏破 ― 指一本触れさせなかった';
else if(h.corrupt<25)title='踏破（クリア） ― 誇りを守って帰還';
else if(h.corrupt<55)title='踏破（クリア） ― 痕を残して帰還';
else title='踏破（クリア） ― 堕ちる寸前の辛勝';
if(h.freedAtEnd)L.push(S.theme.boss+'が倒れると、'+h.name+'を縛っていたものがほどけた。');
L.push(h.corrupt<25?h.name+'は'+S.theme.boss+'を下し、最深部の秘宝を手に地上へ戻った。':
h.corrupt<55?h.name+'は秘宝を持ち帰った。ただ、体に残った熱はまだ引かない。':
h.name+'は秘宝を抱えて地上に出た。陽の光の下で、自分がまだ「戻りたい」と思っていることに気づいて、ぞっとした。');
if(h.goal.id==='curse')L.push(!hasCurse(h,'mark')?'下腹の淫紋は、跡形もなく消えていた。':S.theme.boss+'が倒れると、淫紋の光が薄れた。完全には消えなかった。');
}
return{kind:kind,title:title,L:L};
}
DG.ending=function(S){
var P=S.party,type=S.over,L=[],title,kind;
if(P.length===1){
var r=soloEnding(S,P[0]);L=r.L;title=r.title;kind=r.kind;
}else{
var fell=P.filter(function(x){return x.fallen;}),live=P.filter(function(x){return!x.fallen;});
var nm=function(l){return l.map(function(x){return x.name;}).join('・');};
if(type==='fall'){kind='over';title='陥落 ― 全員が快楽に堕ちた（地下'+(Math.min(S.floor,S.floors-1)+1)+'階）';}
else{
var freed=live.filter(function(x){return x.freedAtEnd;});
kind=fell.length?'mid':'ok';title=fell.length?'踏破（クリア） ― '+live.length+'人で帰還（'+fell.length+'人は迷宮に残った）':'踏破（クリア） ― '+P.length+'人そろって帰還';
L.push(nm(live.filter(function(x){return!x.freedAtEnd;}))+'は'+S.theme.boss+'を下し、秘宝を手に地上へ戻った。'+(freed.length?'主が倒れると、捕らわれていた'+nm(freed)+'を縛っていたものもほどけた。':''));
}
fell.forEach(function(x){L.push(x.name+'：'+(x.fallTitle||'快楽堕ち')+'。'+(x.fallText||x.name+'は迷宮の甘い熱に呑まれ、仲間の呼ぶ声に振り返らなかった。'));});
live.forEach(function(x){if(type!=='fall')L.push(x.name+'：堕ち度 '+Math.round(x.corrupt)+'・絶頂 '+x.climax+'回'+(x.curses.length?'・呪い「'+x.curses.map(function(c){return DG.CURSES[c].label;}).join('・')+'」が残った':''));});
(S.partyNotes||[]).slice(0,3).forEach(function(n){L.push(n);});
}
if(S.cnt.rescued)L.push('道中で'+S.cnt.rescued+'人の囚われ人を助けた。');
if(P.length===1){
var h=P[0];
if(h.curses.length&&type!=='fall')L.push('残った呪い：'+h.curses.map(function(c){return DG.CURSES[c].label;}).join('・'));
if(h.goal.id==='secret'&&type!=='fall')L.push('「少し興味がある」と言っていた割に、'+(h.corrupt<40?'最後まで踏みとどまった。':'しっかり味わって帰ってきた。'));
}
return{type:type,kind:kind,title:title,lines:L};
};
DG.advice=function(S,E){
var h=S.party.slice().sort(function(a,b){return b.corrupt-a.corrupt;})[0],A=[],c=S.cnt;
var undetected=c.traps-c.seek;
var nm=S.party.length>1?h.name+'の':'';
if(undetected>=5&&st(h,'scout')<=3)A.push(nm+'罠察知が低め（'+st(h,'scout')+'）。あと2あれば、発動した罠の多く（'+undetected+'回）を避けられたかもしれない。');
if(c.fights&&c.won/c.fights<0.5)A.push(nm+'戦闘力（'+st(h,'fight')+'）が足りず、'+(isTop(h)?'魔物と'+(c.fights-c.won)+'回もつれ合った。そのたびに組み伏せ返したが、昂りと傷が残った。':'魔物に'+(c.fights-c.won)+'回組み伏せられた。'));
if((S.cause.odd||0)>40&&st(h,'magic')<=3)A.push(nm+'幻惑への抵抗が弱い。魔力（'+st(h,'magic')+'）か、A・ドライさがあれば心を守れた。');
if(c.seek>=2)A.push('自分から罠に触れた回数：'+c.seek+'回。FCの奔放さが、堕ちてからは仇になった。');
if(h.climax>=6&&h.eg.CP<10)A.push(h.name+'はCPが低め（'+Math.round(h.eg.CP)+'）で、絶頂のたびに踏ん張りがきかなかった。');
if(S.party.length>1){
if(c.saved)A.push('仲間が助けに入った回数：'+c.saved+'回。一人なら堕ちていた場面もあった。');
if(c.assault)A.push('仲間に襲われた回数：'+c.assault+'回。いちばんの罠は、隣にいたのかもしれない。');
}
if(E.kind==='ok')A.push('踏破を支えたのは、'+(h.eg.CP>=h.eg.A?'CP（'+Math.round(h.eg.CP)+'）の意地':'A（'+Math.round(h.eg.A)+'）の冷静さ')+'と、理性の残り（'+Math.max(0,Math.round(h.reason))+'）。');
if(!A.length)A.push('大きな弱点はなかった。運と迷宮の気まぐれが結末を分けた。');
return A.slice(0,5);
};
HK.SCENARIOS.dungeon={
id:'dungeon',name:'エロトラップダンジョン',kicker:'1〜4人・R18',solo:true,maxCast:4,minCast:1,
desc:'一人〜四人で淫らな罠の迷宮に挑む。堕ち度が満ちた人から快楽に堕ち、全員が堕ちたらゲームオーバー。最深部の主を倒せば踏破。※成人キャラクター向け',
unit:'部屋',simulate:function(input){return DG.simulate(input);},
derived:['caution','impulse','cold','aggr'],
env:[
{id:'theme',label:'迷宮',type:'select',def:'mix',options:[{v:'mix',label:'混成迷宮（階ごとに変わる）'},{v:'imp',label:'淫魔の城'},{v:'slime',label:'粘液の洞窟'},{v:'tent',label:'触手の森'},{v:'tower',label:'魔術師の塔'},{v:'ruin',label:'古代の神殿'}]},
{id:'outfit',label:'装備',type:'select',def:'light',options:[{v:'armor',label:'重装鎧（破れにくいが鈍い）'},{v:'light',label:'軽装'},{v:'robe',label:'法衣（魔力＋1・薄い）'},{v:'thin',label:'布一枚'}]},
{id:'floors',label:'階層',min:3,max:10,def:5,lo:'3階',hi:'10階',unit:'階'},
{id:'rooms',label:'1階層の部屋数',min:2,max:8,def:3,lo:'3',hi:'8',unit:'部屋'},
{id:'trap',label:'罠の淫らさ',min:0,max:100,def:55,lo:'いたずら程度',hi:'容赦なし',desc:'罠の強さと発動率。高いほど堕ちやすい'},
{id:'monsters',label:'魔物の多さ',min:0,max:100,def:50,lo:'少ない',hi:'巣窟'},
{id:'mercy',label:'救済',min:0,max:100,def:40,lo:'無慈悲',hi:'手厚い',desc:'休める部屋・癒しの泉・役に立つ道具の出やすさ'}
],
stats:[
{id:'fight',label:'戦闘力',desc:'魔物を退ける力。拘束を振りほどく力にも効く'},
{id:'scout',label:'罠察知',desc:'罠や擬態を見抜く力'},
{id:'magic',label:'魔力',desc:'幻惑・呪いに抗う力'}
],
actions:[
{id:'careful',label:'慎重に罠を調べながら進む',fit:function(t){return t.caution;}},
{id:'rush',label:'一気に駆け抜ける',fit:function(t){return t.impulse*0.7+t.aggr*0.3;}},
{id:'loot',label:'宝箱は全部開ける',fit:function(t){return t.fc*0.6+t.impulse*0.3;}},
{id:'stealth',label:'魔物を避けて隠れて進む',fit:function(t){return t.caution*0.5+t.ac*0.4;}},
{id:'fight',label:'魔物は片っ端から倒す',fit:function(t){return t.aggr*0.7+t.cp*0.3;}}
],
goals:[
{id:'treasure',label:'最深部の秘宝を持ち帰る',fit:function(t){return t.cp*0.5+t.lead*0.4;}},
{id:'escape',label:'とにかく無事に帰る',fit:function(t){return t.caution*0.7+t.ac*0.2;}},
{id:'rescue',label:'囚われた冒険者を助ける',fit:function(t){return t.np*0.8;}},
{id:'curse',label:'刻まれた淫紋を解く',fit:function(t){return t.a*0.5+t.ac*0.3;}},
{id:'secret',label:'本当は少し興味がある',fit:function(t){return t.fc*0.5+t.honesty*0.2+t.ac*0.2;}}
],
steps:function(){return[];}
};
if(HK.SCEN_ORDER.indexOf('dungeon')<0)HK.SCEN_ORDER.push('dungeon');
})();
});
;
/* ==== js/dungeon-bosses.js ==== */
HK.Load.def(164,'js/dungeon-bosses.js',function(){
(function(){
'use strict';
var DG=window.HK.DG=window.HK.DG||{};
function B(id,name,th,tier,intro,moves,hit,win,fall){
return{
id:id,name:name,th:th,tier:tier,intro:intro.split('|'),hit:hit.split('|'),win:win.split('|'),fall:fall.split('|'),
moves:moves.map(function(m){return{n:m[0],part:m[1],power:m[2],o:DG.parseOpts(m[3]),texts:m[4].split('|')};})
};
}
DG.BOSSES=[
B('b_archimp','城主の大淫魔','imp','final',
'玉座の{t}が脚を組み替えた。「ずっと見ていたのよ、ここまでの全部」|{t}は{a}の名前を甘く呼んだ。「ここで暮らせばいいのに」',
[['魅了の口づけ','mouth',26,'mind','{t}の口づけが、{a}の思考を真っ白にした。|{t}は{a}の唇を奪い、舌で理性をほどいていった。'],
['淫紋刻印','belly',24,'curse=mark','{t}の指が{a}の下腹に紋を描いた。描かれた線が熱く脈打った。|{t}は「印をあげる」と囁き、{a}の下腹に爪を這わせた。'],
['夢喰い','all',22,'mind;curse=dream','{t}の瞳を見た瞬間、{a}は甘い夢の中に落ちていた。|{t}は{a}の夢に入り込み、一番弱い場所を撫でた。']],
'{a}は{t}の囁きを振り払い、翼を打った。|{a}は自分の名前を叫び、魅了を断ち切った。',
'{a}の一撃が{t}の胸の宝石を砕いた。{t}は霧になって消えた。|{t}は「つまらない人」と笑って崩れた。玉座の裏に秘宝があった。',
'{a}は{t}の膝の上で、愛玩物として飼われている。'),
B('b_twins','双子の夢魔','imp','both',
'左右から同じ顔が笑った。「どっちが好き？」|{t}は{a}を挟むように降り立った。',
[['左右の囁き','ear',22,'mind','{t}は{a}の両耳に、違う甘い言葉を同時に囁いた。|左右の耳を同時に食まれ、{a}の膝が抜けた。'],
['二人がかりの愛撫','any',24,'hold1','前と後ろから、{t}の手が{a}の{p}を挟み撃ちにした。|{t}は息を合わせて、{a}の{p}を交互に責めた。'],
['入れ替わり','all',18,'shame','{t}は入れ替わるたびに、{a}の反応を比べて笑った。|「さっきの子の方が上手？」と{t}は{a}に訊いた。']],
'{a}は片方を突き飛ばし、もう片方の隙を突いた。|{a}は二人の呼吸のずれを見抜いて斬り込んだ。',
'{t}は抱き合ったまま、煙のように消えた。|二人は「また遊ぼうね」と声を揃えて退いた。',
'{a}は{t}の間に挟まれたまま、甘い夢から醒めなくなった。'),
B('b_whipqueen','鞭の女王','imp','mid',
'鞭が床を打った。{t}が「跪きなさい」と言った。|{t}はヒールを鳴らして、{a}の周りをゆっくり歩いた。',
[['甘い鞭','back',20,'','{t}の鞭が{a}の背中を打った。痛みのあとに、甘い痺れが残った。|鞭の先が{a}の{p}を撫でるようにかすめた。'],
['服従の命令','all',18,'mind;curse=obey','「跪け」の一言で、{a}の膝が勝手に折れた。|{t}は{a}の顎を鞭の柄で上げ、命令を刻み込んだ。'],
['焦らし責め','hips',20,'curse=edge','{t}は{a}が達しそうになるたび、手を止めた。|「まだよ」と{t}は笑い、{a}の熱を寸前でせき止めた。']],
'{a}は鞭を掴んで引き寄せた。|{a}は命令を無視して踏み込んだ。',
'{a}に鞭を奪われ、{t}は悔しげに退いた。|{t}は「次は躾けてあげる」と言い残して消えた。',
'{a}は{t}の足元に跪き、次の命令を待っている。'),
B('b_slimequeen','女王スライム','slime','final',
'床だと思っていたものが、{t}だった。|透き通った巨体の中に、先に挑んだ者たちの装備が浮かんでいた。',
[['全身包み込み','all',26,'hold2;cloth1','{t}は{a}を首まで呑み込み、全身をゆっくり揉みほぐした。|{t}の中で、{a}は呼吸だけを許されたまま撫で回された。'],
['粘膜の舌','any',24,'','{t}の体から無数の舌が伸び、{a}の{p}を舐め上げた。|ぬるい舌が{a}の{p}を、休みなく往復した。'],
['媚毒分泌','all',20,'sens.1','{t}の粘液が肌に染み込み、{a}の全身を内側から火照らせた。|{t}は甘い毒を滲ませ、{a}の感覚を鋭くした。']],
'{a}は{t}の核を探り当て、刃を突き立てた。|{a}は塩の袋を叩きつけ、{t}を怯ませた。',
'{a}の刃が核を貫いた。巨体はただの水になり、その底に秘宝が光っていた。|{t}は甲高い音を立てて弾けた。',
'{a}は{t}の体の中で、ゆりかごのように揺られ続けている。'),
B('b_twinooze','二つ頭のウーズ','slime','both',
'二つの頭を持つ粘体が、{a}の行く手を塞いだ。|{t}は分裂と融合を繰り返しながら近づいてきた。',
[['分裂抱擁','all',22,'hold1','{t}は二つに分かれ、{a}を前後から抱きしめた。|分かれた{t}が、{a}の{p}を両側から包んだ。'],
['衣溶かし','all',16,'cloth2;curse=melt','{t}が触れたところから、{a}の装備が溶けていった。|{t}は{a}の服だけを器用に溶かした。'],
['吸着','chest',22,'dev2','{t}は{a}の{p}に吸いつき、規則正しく吸い上げた。|吸盤のように{t}が{a}の{p}に貼りついた。']],
'{a}は二つの頭の間を斬り裂いた。|{a}は松明の火で{t}を縮み上がらせた。',
'{t}は二つに分かれたまま、床の隙間へ逃げていった。|{t}は干からびて動かなくなった。',
'{a}は{t}に二人分の愛され方を覚えさせられた。'),
B('b_bubble','泡の精','slime','mid',
'部屋いっぱいの泡の中から、くすくす笑う{t}が現れた。|{t}は泡の玉に乗って、{a}の周りを漂った。',
[['泡洗い','all',18,'cloth1','{t}は泡で{a}を包み、全身を洗い上げた。|泡が{a}の服の中に入り込み、肌の上で弾けた。'],
['くすぐり泡','side',18,'hold1','細かな泡が{a}の脇腹で弾け続けた。|{t}は泡で{a}の{p}をくすぐり倒した。'],
['泡の口づけ','mouth',16,'mind','{t}は泡越しに{a}へ口づけた。甘い味がした。|泡の玉が{a}の唇に触れて弾け、頭がぼうっとした。']],
'{a}は泡を払いのけ、{t}の本体を掴んだ。|{a}は息を吹きかけて泡を散らした。',
'{t}は大きな泡と一緒に弾けて消えた。|{t}は「つまんない」と泡の中に隠れた。',
'{a}は泡の中で、ずっと洗われ続けている。'),
B('b_elder','千本触手の古木','tent','final',
'森の中心で、{t}の触手が一斉に{a}を向いた。|{t}の幹に、眠るように取り込まれた挑戦者たちの顔が見えた。',
[['吊るし責め','all',26,'hold2','{t}は{a}を宙に吊るし、四方から{p}を責め立てた。|触手が{a}の手足を開かせ、宙で固定した。'],
['花粉の嵐','all',20,'sens.08;curse=heat','{t}が吐いた花粉の嵐が、{a}の全身を火照らせた。|甘い花粉を浴び、{a}の肌が桃色に染まった。'],
['根の愛撫','thigh',22,'','地面から伸びた根が、{a}の内腿をゆっくり這い上がった。|細い根が{a}の{p}に絡み、脈打った。']],
'{a}は絡みついた触手を斬り落とした。|{a}は幹に油をかけ、火を放った。',
'炎に包まれた{t}は崩れ落ちた。洞の中に秘宝が残っていた。|{a}の刃が心臓部を貫き、森が静かになった。',
'{a}は{t}の幹に抱かれ、森の一部になった。'),
B('b_vinemaiden','蔓の乙女','tent','both',
'蔓で編まれた乙女が、{a}に微笑みかけた。|{t}は花冠を揺らして「一緒にいて」と言った。',
[['抱擁の蔓','all',22,'hold2','{t}は{a}を抱きしめ、蔓で二人を縛り合わせた。|{t}の腕がほどけて蔓になり、{a}に絡みついた。'],
['蜜の口移し','mouth',20,'sens.06','{t}は{a}に口移しで甘い蜜を飲ませた。|蜜の味が広がり、{a}の体の奥が熱くなった。'],
['葉擦れの愛撫','back',18,'','柔らかな葉が{a}の背中を撫で下ろした。|{t}は葉の先で{a}の{p}をなぞった。']],
'{a}は蔓を引きちぎって距離を取った。|{a}は{t}の花冠を斬り落とした。',
'{t}は枯れ葉になって散った。|{t}は寂しそうに地面へ還っていった。',
'{a}は{t}と蔓で結ばれ、二度と離れなくなった。'),
B('b_parasite','寄生花','tent','mid',
'天井から大輪の花が垂れ下がり、ゆっくりと開いた。|{t}の甘い香りが、{a}の鼻をくすぐった。',
[['開花','belly',20,'curse=mark','{t}の花粉が{a}の下腹に根を張り、花の紋を咲かせた。|{a}の下腹に、花の形の紋が浮かんだ。'],
['花弁の舌','neck',18,'','肉厚の花弁が{a}の首筋を舐め上げた。|{t}の花弁が{a}の{p}を包んだ。'],
['胞子の夢','all',16,'mind','胞子を吸った{a}は、花畑で溶ける夢を見た。|{t}の胞子が、{a}の思考を甘く鈍らせた。']],
'{a}は茎を断ち切った。|{a}は花芯に刃を突き立てた。',
'{t}はしおれて床に落ちた。|{t}の花弁が一斉に散った。',
'{a}の体には{t}が根を張り、花が咲き続けている。'),
B('b_archmage','好色な大魔術師','tower','final',
'{t}が記録帳を閉じた。「素晴らしいデータだ。最後の実験を始めよう」|{t}は眼鏡を押し上げた。「君の反応はすべて記録してある」',
[['感度操作','any',22,'curse=dbl','{t}が指を鳴らすと、{a}の{p}の感度が跳ね上がった。|{t}は{a}の感覚の目盛りを、勝手に最大まで回した。'],
['鎖の魔法','all',24,'hold2','光の鎖が{a}を縛り、見えない指が{p}を撫でた。|{t}の鎖が{a}の手足を開かせて固定した。'],
['記録朗読','all',18,'mind;shame','{t}は{a}のここまでの痴態を、記録帳から朗読した。|{t}は{a}の反応の数値を、一つずつ読み上げた。']],
'{a}は詠唱の隙に踏み込み、杖を叩き落とした。|{a}は鎖を引きちぎって体当たりした。',
'{t}は本棚に叩きつけられて気を失った。机の小箱に秘宝があった。|{t}は「計算外だ」と呟いて崩れた。',
'{a}は{t}の観察室で、最高の被験体として記録され続けている。'),
B('b_alchemist','拘束具の錬金術師','tower','both',
'工房の奥で、{t}が新作の拘束具を磨いていた。「ちょうど試したかった」|{t}は{a}の体の寸法を目で測った。',
[['自動拘束具','all',22,'hold2','床から伸びた拘束具が{a}を大の字に固定した。|革のベルトが{a}の体に食い込み、身動きを封じた。'],
['振動の魔石','hips',22,'dev2','{t}は小さな魔石を{a}の{p}に当てた。魔石は細かく震え続けた。|魔石の振動が{a}の{p}から全身に響いた。'],
['試薬投与','all',18,'sens.1','{t}は{a}の首筋に試薬を一滴垂らした。全身が熱を帯びた。|{t}の試薬で、{a}の感覚は空気にも反応するようになった。']],
'{a}は拘束具の留め具を壊して抜け出した。|{a}は試薬の瓶を{t}に投げ返した。',
'{t}は自分の拘束具に捕まって動けなくなった。|{t}は工房の奥へ逃げ込んだ。',
'{a}は{t}の工房で、新作の試着係として暮らしている。'),
B('b_maid','自律人形の家政婦','tower','mid',
'「お客様、お召し物が汚れております」と{t}が一礼した。|{t}は無表情のまま、{a}に近づいてきた。',
[['ご奉仕','any',18,'','{t}は丁寧に、{a}の{p}を「お手入れ」した。|{t}の冷たい指が、{a}の{p}を几帳面に撫でた。'],
['お着替え','all',14,'cloth2;shame','{t}は手際よく{a}の服を脱がせ、薄い衣装に着せ替えた。|{t}は「こちらがお似合いです」と、透ける服を着せた。'],
['くすぐり点検','side',18,'hold1','{t}は「点検します」と言って、{a}の脇腹を指先でなぞった。|{t}は{a}の弱いところを、一つずつ確認した。']],
'{a}は{t}の背中のねじを抜いた。|{a}は{t}の関節に剣を差し込んだ。',
'{t}は「失礼いたしました」と言って停止した。|{t}は一礼したまま動かなくなった。',
'{a}は{t}に毎日お世話されている。'),
B('b_fertility','目覚めた豊穣神の像','ruin','final',
'祭壇の石像が目を開いた。{t}は{a}を祝福しようとしていた。|聖堂に{t}の声が響いた。「捧げよ」',
[['祝福の光','all',24,'','{t}の光が降り注ぎ、{a}の全身を内側から満たした。|光を浴びた{a}の{p}が、熱く脈打った。'],
['跪けの神託','all',20,'mind;curse=obey','{t}の神託に、{a}の膝が勝手に折れた。|{t}の声が、{a}の心に服従を刻んだ。'],
['豊穣の香','all',20,'curse=heat','香炉の煙が{a}にまとわりつき、消えない火を灯した。|{t}の香が、{a}の体の奥を豊かに熱くした。']],
'{a}は燭台を蹴り倒し、儀式を乱した。|{a}は石像のひびに刃を差し込んだ。',
'{t}は崩れ落ち、瓦礫から秘宝の光がこぼれた。|{a}が宝珠を砕くと、{t}は再び眠りについた。',
'{a}は{t}に仕える巫として、祭壇の上で祝福を受け続けている。'),
B('b_highpriest','堕ちた大司祭','ruin','both',
'祭服をはだけた{t}が、慈愛の笑みで{a}を迎えた。|{t}は「懺悔なさい」と手を差し伸べた。',
[['告解の囁き','ear',20,'mind;shame','{t}は{a}の耳元で、罠にかかったときのことを告白させた。|{t}は「正直に言ってごらん」と{a}に囁いた。'],
['聖油の按手','chest',22,'sens.05','{t}は聖油を手に取り、{a}の{p}に塗り広げた。|{t}の按手が、{a}の{p}をゆっくりと清めた。'],
['苦行の鞭','back',20,'','{t}の細い鞭が、{a}の背中に甘い痕を残した。|{t}は「苦行です」と微笑み、{a}の{p}を打った。']],
'{a}は{t}の祭服を踏みつけて体勢を崩させた。|{a}は聖油の壺を叩き割った。',
'{t}は祭壇に倒れ、祈りの言葉を失った。|{t}は「神よ」と呟いて動かなくなった。',
'{a}は{t}の告解室で、毎日懺悔をさせられている。'),
B('b_maidens','石の巫女たち','ruin','mid',
'回廊の石像たちが動き出し、{a}を輪の中に閉じ込めた。|{t}は祈りの歌を口ずさみながら、輪を狭めた。',
[['輪舞の愛撫','any',20,'hold1','{t}は踊りながら、すれ違いざまに{a}の{p}を撫でた。|輪になった{t}の手が、{a}の全身を順番に巡った。'],
['清めの口づけ','neck',18,'','{t}の冷たい唇が{a}の首筋を清めた。|{t}は代わる代わる{a}の{p}に口づけた。'],
['祈りの合唱','all',16,'mind','{t}の合唱が{a}の頭の中に響き、思考を溶かした。|祈りの歌に包まれ、{a}は抵抗を忘れかけた。']],
'{a}は輪の切れ目を見つけて飛び出した。|{a}は一体の石像を押し倒した。',
'{t}は元の台座に戻り、動かなくなった。|{t}は祈りを止め、石に還った。',
'{a}は{t}の輪の中で、永遠に踊らされている。')
];
var FALL_MORE={
b_archimp:['{a}の下腹には、{t}の紋が消えない印として刻まれた。{t}が名前を呼ぶたびに、{a}は甘い声で応える。','{a}は{t}の寝所で目を覚まし、{t}の腕の中でまた眠る。地上の空の色は、もう思い出せない。'],
b_twins:['{a}は毎晩、{t}のどちらが好きかを訊かれ、答えられないまま両方に愛されている。','{a}は{t}の三人目の姉妹のように、左右から抱かれて眠るのが当たり前になった。'],
b_whipqueen:['{a}は{t}の鞭の音を聞くだけで、膝が勝手に折れるようになった。','{a}の背中には、{t}に躾けられた痕が、ご褒美のように並んでいる。'],
b_slimequeen:['{a}は{t}の透き通った体の中で、先に挑んだ者たちの装備と一緒に、ゆっくりと漂っている。','{a}は{t}に呼吸だけを許され、全身を撫でられ続けることを、もう苦しいとは思わない。'],
b_twinooze:['{a}は{t}に前後から包まれたまま、二つの温もりのあいだで眠る。','{a}は{t}が分かれるたびに、どちらにも手を伸ばしてしまうようになった。'],
b_bubble:['{a}は泡の寝床で、{t}に毎日念入りに洗われている。肌は、迷宮に来る前よりずっと敏感になった。','{a}は{t}の泡が弾ける音を聞くたびに、うっとりと目を閉じる。'],
b_elder:['{a}は{t}の根に抱かれ、季節ごとに咲く花の香りの中で、甘い樹液を与えられ続けている。','{a}の手足には{t}の細い蔓が絡み、ほどけることはない。{a}も、ほどこうとはしない。'],
b_vinemaiden:['{a}は{t}と花冠を分け合い、森の奥で寄り添って暮らしている。','{a}は{t}の蜜の味を覚えてしまい、口移しを待つのが一日の楽しみになった。'],
b_parasite:['{a}の下腹の花の紋は、{t}が揺れるたびに甘く疼く。','{a}は{t}の胞子の夢から、二度と醒めなくなった。夢の中の花畑で、ずっと溶け続けている。'],
b_archmage:['{a}の反応はすべて{t}の記録帳に書き留められ、ページは毎日増えている。','{a}は{t}の指が鳴る音を聞くだけで、感覚の目盛りが勝手に跳ね上がるようになった。'],
b_alchemist:['{a}は{t}の新作の拘束具を、毎日一つずつ試している。どれも、{a}の体の寸法にぴったりだった。','{a}は{t}の試薬なしでは、もう眠れない。'],
b_maid:['{a}は{t}に毎朝着替えさせられ、毎晩「お手入れ」をされている。','{a}は{t}の冷たい指に慣れてしまい、温かい手では物足りなくなった。'],
b_fertility:['{a}は{t}の祭壇で、捧げものとして毎夜祝福を受けている。','{a}の体には{t}の神託が刻まれ、跪くことが祈りと同じになった。'],
b_highpriest:['{a}は{t}の聖油を毎日塗られ、清められるたびに甘い声で祈るようになった。','{a}は{t}の前に跪き、昨日よりも恥ずかしい懺悔を、自分から口にしている。'],
b_maidens:['{a}は{t}の輪に加わり、迷い込んだ挑戦者を囲む側になった。','{a}は{t}の祈りの歌を口ずさみながら、輪の中で踊り続けている。']
};
DG.BOSSES.forEach(function(b){if(FALL_MORE[b.id])b.fall=b.fall.concat(FALL_MORE[b.id]);});
})();
});
;
/* ==== js/dungeon-party.js ==== */
HK.Load.def(165,'js/dungeon-party.js',function(){
(function(){
'use strict';
var HK=window.HK,DG=HK.DG;
var clamp=HK.clamp;
function k(a,b){return a.i<b.i?a.i+'-'+b.i:b.i+'-'+a.i;}
function rel(S,a,b){return S.rel[k(a,b)];}
function byI(P,i){for(var j=0;j<P.length;j++)if(P[j].i===i)return P[j];return null;}
function t2(S,s,a,b){return s.replace(/\{a\}/g,a.name).replace(/\{b\}/g,b?b.name:'').replace(/\{t\}/g,S.lastEv?S.lastEv.name:'罠');}
function pk(S,arr){return DG.pick(S,arr);}
function st(h,id){return h.stats[id]||3;}
function free(S){return S.party.filter(function(x){return!x.fallen&& !x.captor;});}
function pn(S,s){(S.partyNotes=S.partyNotes||[]).push(s);}
function sayAs(S,h,o){var prev=S.h;S.h=h;var e=DG.say(S,o);S.h=prev;return e;}
function canLove(a,b){return HK.canLove?HK.canLove(a,b):true;}
function ng(a,b){return!!(HK.ngPair&&HK.ngPair(a,b));}
function isTop(h){return!!(HK.Pos&&HK.Pos.hardTop(h));}
DG.partySetup=function(S,input){
S.rel={};
var P=S.party;
P.forEach(function(a){
P.forEach(function(b){
if(a.i>=b.i)return;
var bc=HK.baseCompat(a,b);
S.rel[k(a,b)]={trust:15+bc.aff*0.2,att:Math.max(0,bc.att*0.3)*(canLove(a,b)&&canLove(b,a)?1:0.1),ten:Math.max(0,bc.ten*0.2),saved:0,assault:0,intimate:0};
});
});
(input.ties||[]).forEach(function(t){
var a=byI(P,t.a),b=byI(P,t.b);
if(!a|| !b|| !HK.TIES[t.type])return;
var r=rel(S,a,b),D=HK.TIES[t.type];
r.tie=t.type;
r.trust+=D.pol*15;r.ten+=D.pol<0?30:0;
if(HK.tieNoLove(t))r.att=0;
else if(D.family)r.att+=8;
else if(D.couple||D.night||t.type==='almost')r.att+=40;
else if(t.type==='crush')r.att+=25;
});
};
function witness(S,tgt,hit){
var others=free(S).filter(function(x){return x!==tgt;});
if(!others.length)return false;
var w=others[S.rng.int(others.length)],r=rel(S,w,tgt),rng=S.rng;
var arouse=w.tr.fc*0.4+w.tr.impulse*0.3+r.att/80+w.corrupt/120+(canLove(w,tgt)?0.1: -0.4);
var disgust=w.tr.cp*0.4+w.tr.cold*0.3+(r.ten/80)-r.att/100+(canLove(w,tgt)?0:0.3);
var rescue=w.tr.np*0.5+w.tr.cp*0.2+r.trust/80+st(w,'fight')*0.05-w.corrupt/150;
var lvl=(tgt.captor||hit.gain>18)?1:0;
if(ng(w,tgt))arouse=0;
var pickx=HK.weighted(rng,['arouse','disgust','rescue','look'],function(x){return Math.max(0,{arouse:arouse,disgust:disgust,rescue:rescue*(lvl?1.4:0.6),look:0.35}[x]);});
if(pickx==='arouse'){
var g=(hit.gain||15)*(0.35+w.tr.fc*0.3+r.att/200);
w.pleasure+=g;w.reason-=g*0.1;w.corrupt+=1.2;r.att+=4;
sayAs(S,w,{kind:'ev',tag:'見せつけ',text:t2(S,pk(S,isTop(tgt)?['熱に浮かされた{b}の横顔から、{a}は目を離せなかった。体の奥が、勝手に火照っていく。','{b}の荒い息づかいに、{a}は喉を鳴らした。自分でも驚くほど、熱くなっていた。','{a}は「見ちゃだめだ」と思いながら、指の隙間から{b}を見ていた。','{a}「…{b}、そんな顔、するんだ」声が掠れていた。']:['{b}が責められる様子から、{a}は目を離せなかった。体の奥が、勝手に火照っていく。','{b}の上げた声に、{a}は喉を鳴らした。自分でも驚くほど、熱くなっていた。','{a}は「見ちゃだめだ」と思いながら、指の隙間から{b}を見ていた。','{a}は{b}の乱れた姿に、膝をこすり合わせた。','{a}「…{b}、そんな顔、するんだ」声が掠れていた。']),w,tgt),why:w.name+'のFC・衝動・'+tgt.name+'への惹かれ（'+Math.round(r.att)+'）'});
return true;
}
if(pickx==='disgust'){
w.reason-=3;w.hp-=3;r.ten+=3;
sayAs(S,w,{kind:'ev',tag:'見せつけ',text:t2(S,pk(S,['{a}は顔を背けた。胃の奥がせり上がってくる。「…気分悪い」','{a}は{b}から目を逸らし、壁に手をついて吐き気をこらえた。','{a}「最低だ、この迷宮」{a}は奥歯を噛んで、罠の主を睨んだ。','{a}は耳を塞いでうずくまった。{b}の声が、どうしても聞こえてしまう。']),w,tgt),why:w.name+'のCP・ドライさ（嫌悪が勝った）'});
return true;
}
if(pickx==='rescue'){
var ok=rng()<0.3+st(w,'fight')*0.05+w.tr.cp*0.12;
r.trust+=ok?12:4;S.cnt.saved+=ok?1:0;r.saved+=ok?1:0;
if(ok){
tgt.pleasure-=12;tgt.reason+=3;
if(tgt.captor){tgt.captor=null;tgt.hp=Math.max(tgt.hp,30);}
sayAs(S,w,{kind:'ev',tag:'救援',text:t2(S,pk(S,isTop(tgt)?['{a}が{b}の隣に駆けつけ、二人がかりで残りの仕掛けを叩き壊した。','{a}は{b}の背中を守るように立ち、寄ってくる魔物を追い払った。「大丈夫か」','{a}は自分の外套を{b}に被せた。「少し休んで。熱が引くまで」']:['{a}が刃を振るって、{b}に絡みつくものを断ち切った。「掴まれ！」','{a}は{b}の腕を引っぱって、罠の中から力ずくで引きずり出した。','{a}は松明を突き出して、{b}に群がるものを追い払った。「大丈夫か」','{a}は自分の外套を{b}に被せて、肩を抱いた。「もう平気。見てないから」']),w,tgt),why:w.name+'のNP・CP・戦闘力 '+st(w,'fight')+'（'+tgt.name+'を助けた）'});
if(r.saved===2)pn(S,w.name+'は何度も'+tgt.name+'を助けた。');
}else{
var ev=S.lastEv;
if(!isTop(tgt)&&DG.kabai&&DG.kabai(S,w,tgt,r,ev,sayAs))return true;
sayAs(S,w,{kind:'ev',tag:'救援',text:t2(S,pk(S,isTop(w)?['{a}は{b}を助けようと飛び込んだが、仕掛けの吐いた甘い霧を正面から浴びてしまった。','{a}は{b}のもとへ駆け寄り、伸びてきたものを叩き落とした。飛び散った媚薬の飛沫が、肌を火照らせた。']:isTop(tgt)?['{a}は{b}に加勢しようと飛び込み、足首を何かに絡め取られた。','{a}は{b}のもとへ駆け寄る途中で、別の仕掛けに捕まった。']:['{a}は{b}を助けようと飛び込み、一緒に絡め取られた。','{a}の手が{b}に届く寸前で、{a}の足首にも何かが巻きついた。']),w,tgt),why:w.name+'のNP（助けに入ったが、届かなかった）'});
if(ev&&ev.power){var prev2=S.h;S.h=w;DG.stim(S,ev,0.6);S.h=prev2;}
}
return true;
}
if(rng()<0.5&&lvl){
sayAs(S,w,{kind:'ev',tag:'見せつけ',text:t2(S,pk(S,isTop(tgt)?['{a}は何もできずに、ただ{b}を見ていた。','{a}は加勢の隙を探したが、{b}は「来るな、こいつは私が片づける」と手で制した。','{a}は息を詰めて、{b}が仕掛けと押し合うのを見守るしかなかった。']:['{a}は何もできずに、ただ{b}を見ていた。','{a}は「すぐ終わる、すぐ終わるから」と{b}に繰り返した。','{a}は目を逸らすこともできずに、{b}の名前を何度も呼んだ。']),w,tgt),why:''});
return true;
}
return false;
}
function heat(S){
var P=free(S);
if(P.length<2)return false;
var rng=S.rng;
var a=HK.weighted(rng,P,function(x){var v=x.corrupt/100+x.pleasure/140+x.tr.impulse*0.3-0.75;return v>0?v:0;});
if(!a)return false;
var cand=P.filter(function(x){return x!==a&&canLove(a,x)&&(!HK.State||HK.State.pairSex(a,x))&& !(HK.ngPair&&HK.ngPair(a,x))&& !(HK.sexBlocked&&HK.sexBlocked(a,x));});
if(!cand.length)return false;
var b=HK.weighted(rng,cand,function(x){return Math.max(0.05,0.3+rel(S,a,x).att/50);});
if(!b)return false;
var r=rel(S,a,b);
var want=(canLove(b,a)?r.att/60:0)+b.corrupt/100+b.pleasure/150+b.tr.fc*0.2;
if(canLove(b,a)&&(want>0.85||(r.tie&& /lover|fwb|almost/.test(r.tie)))){
r.intimate++;r.att+=10;r.trust+=6;
[a,b].forEach(function(x){x.pleasure+=30+x.sens*8;x.corrupt+=2;x.reason+=3;});
sayAs(S,a,{kind:'ev',tag:'慰め合い',text:t2(S,pk(S,['{a}「…ねえ、{b}も、熱いでしょ」{b}は答えずに、{a}の手を取った。――罠のせいにして、二人は互いの熱を逃がした。','休める場所で、{a}と{b}は背中合わせに座っていた。どちらからともなく向き直った。――','{b}が先に{a}の肩に額をつけた。「少しだけ」「…うん」――','{a}と{b}は、誰にも言わないと約束して、互いを慰めた。']),a,b),why:a.name+'と'+b.name+'の昂り・惹かれ（'+Math.round(r.att)+'）'});
[a,b].forEach(function(x){var prev=S.h;S.h=x;DG.settle(S);S.h=prev;});
if(r.intimate===1)pn(S,a.name+'と'+b.name+'は、迷宮の中で一線を越えた。');
return true;
}
if(HK.Pos&&(HK.Pos.order(a,b,[a,b])[0]!==a||HK.Pos.hardTop(b,a)))return false;
var third=P.filter(function(x){return x!==a&&x!==b;}).sort(function(x,y){return(y.tr.np+y.tr.cp+rel(S,y,b).trust/50)-(x.tr.np+x.tr.cp+rel(S,x,b).trust/50);})[0];
var stop=b.tr.cp*0.4+st(b,'fight')*0.06+(third?third.tr.np*0.3+third.tr.cp*0.3+st(third,'fight')*0.05:0)+rng()*0.5;
S.cnt.assault++;r.assault++;r.trust-=20;r.ten+=25;
if(stop>0.75){
var by=third&&third.tr.np+third.tr.cp>b.tr.cp?third:null;
sayAs(S,a,{kind:'ev',tag:'仲間の暴走',text:t2(S,'堕ちかけた{a}が、{b}を床に押し倒した。',a,b)+(by?by.name+'が'+a.name+'を引き剥がした。「しっかりしろ！迷宮に呑まれるな！」':t2(S,pk(S,['{b}は{a}の頬を張った。「目を覚まして！」','{b}は{a}の手首をねじり上げた。「…それ以上やったら、置いていく」']),a,b)),why:a.name+'の堕ち度 '+Math.round(a.corrupt)+'・昂り。'+(by?by.name+'が止めた':b.name+'が拒んだ')});
a.reason+=6;
if(by)rel(S,by,b).trust+=10;
}else{
var ev={id:'mate',name:a.name,kind:'mate',part:'any',power:22,o:{hold:0},texts:[]};
var prev=S.h;S.h=b;DG.stim(S,ev,1);
sayAs(S,a,{kind:'ev',tag:'仲間の暴走',text:t2(S,pk(S,['迷宮の熱に呑まれた{a}が、{b}に覆いかぶさった。「ごめん、もう、止まらない」――','{a}の目はもう、仲間を見る目ではなかった。{b}は壁際に追い詰められた。――','{a}は{b}の名前を何度も呼びながら、その体をまさぐった。――']),a,b)+DG.react(S,true)+(DG.mateEro?DG.mateEro(S,a,b):''),why:a.name+'の堕ち度 '+Math.round(a.corrupt)+'・衝動。誰も止められなかった'});
S.h=prev;
a.corrupt+=4;
pn(S,a.name+'は迷宮の熱に呑まれ、'+b.name+'を襲った。');
}
return true;
}
function assist(S){
var P=free(S);
if(P.length<2)return false;
var rng=S.rng;
var a=HK.weighted(rng,P,function(x){return 0.2+x.tr.np*0.6+x.tr.warmth*0.3;});
var b=HK.weighted(rng,P.filter(function(x){return x!==a;}),function(x){return Math.max(0.05,0.2+x.corrupt/80+Math.max(0,x.pleasure)/100+Math.max(0,100-x.reason)/150);});
if(!a|| !b)return false;
var r=rel(S,a,b);
var opts=[];
if(a.items.indexOf('herb')>=0&&(b.pleasure>55||b.reason<50))opts.push('herb');
opts.push('hand','warn','talk');
if(b.hp<50)opts.push('carry');
var o=opts[rng.int(opts.length)];
var text,why=a.name+'のNP（'+Math.round(a.eg.NP)+'）';
if(o==='herb'){a.items.splice(a.items.indexOf('herb'),1);b.pleasure-=40;b.reason+=14;text='{a}は自分の鎮静の薬草を、{b}の口に押し込んだ。「噛んで。苦いけど、効くから」';}
else if(o==='hand'){a.reason+=2;b.reason+=4;r.att+=3;text=pk(S,['{a}は{b}の手を握った。「自分の名前、言える？」{b}は震える声で、ちゃんと答えた。','{a}と{b}は手を繋いだまま進んだ。指先の温度が、正気をつなぎとめていた。','{a}は{b}の額に自分の額をつけた。「大丈夫。一緒に帰る」']);}
else if(o==='warn'){S.mapFloor=S.floor;text=pk(S,['{a}が{b}の肩を掴んで止めた。「待って、そこの床、色が違う」','{a}は先に立って、罠のありそうな場所を一つずつ指で示した。']);why=a.name+'の慎重さ';}
else if(o==='carry'){b.hp+=20;text='{a}は足元のおぼつかない{b}に肩を貸した。「重くない？」「重い。でも置いてかない」';}
else{b.reason+=4;text=pk(S,['{a}「帰ったら、何食べたい？」{b}「…普通のご飯」二人は少し笑った。','{a}は{b}に、地上で待っている人の話をさせた。{b}の目に、少し光が戻った。','{a}「ここで見たことは、全部忘れよう。お互いに」{b}は小さく頷いた。']);}
r.trust+=6;
sayAs(S,a,{kind:'ev',tag:'助け合い',text:t2(S,text,a,b),why:why});
return true;
}
function lure(S){
var P=free(S);
var fell=S.party.filter(function(x){return x.fallen&&P.some(function(y){return!ng(x,y);});});
if(!fell.length|| !P.length)return false;
var f=fell[S.rng.int(fell.length)];
P=P.filter(function(x){return!ng(x,f);});
var v=HK.weighted(S.rng,P,function(x){return Math.max(0.05,0.3+rel(S,x,f).att/50+rel(S,x,f).trust/80+x.tr.np*0.3);});
if(!v)return false;
var r=rel(S,v,f);
var pull=r.att/100+r.trust/150+v.corrupt/120;
v.reason-=4+pull*6;v.corrupt+=2+pull*4;v.pleasure+=10+pull*10;
sayAs(S,v,{kind:'ev',tag:'堕ちた仲間',text:t2(S,pk(S,['通路の奥で、堕ちた{b}が蕩けた顔で手招きしていた。「{a}も、おいでよ。気持ちいいよ」','{b}の声がした。もう{a}の知っている声ではなかった。「どうして来てくれないの？」',isTop(f)?'{a}は、魔物を足元に侍らせて笑う{b}を見てしまった。足が止まった。':'{a}は、罠に絡まれたまま幸せそうに笑う{b}を見てしまった。足が止まった。']),v,f),why:f.name+'は迷宮に堕ちた。'+v.name+'との絆（信頼 '+Math.round(r.trust)+'）が引き寄せる'});
return true;
}
DG.partyAfter=function(S,tgt,hit){
var rng=S.rng;
var t=hit?hit.h:tgt;
if(hit&& !t.fallen&&rng()<0.6)witness(S,t,hit);
else if(rng()<0.22)heat(S);
else if(rng()<0.12)assist(S);
if(rng()<0.2)lure(S);
};
var setup0=DG.partySetup;
DG.partySetup=function(S,input){var PI=[];(S.party||[]).forEach(function(h){if(h&&typeof h.i==='number')PI[h.i]=h;});S.ties=HK.Story&&HK.Story.tiesOk?HK.Story.tiesOk(PI,input&&input.ties):(input&&input.ties)||[];return setup0(S,input);};
var after0=DG.partyAfter;
DG.partyAfter=function(S,tgt,hit){
after0(S,tgt,hit);
if(HK.Obsess&&HK.Obsess.storyTick){
var ob=HK.Obsess.storyTick(S,S.party.filter(function(x){return!x.fallen;}),{rate:0.12});
if(ob){sayAs(S,ob.actors[0],{kind:'ev',tag:ob.tag,text:ob.text,why:ob.why});return;}
}
var H=HK.HateKit;
if(!H||S.rng()>0.2)return;
var live=S.party.filter(function(x){return!x.fallen;}),ps=H.pairs(S,live);
if(!ps.length)return;
var p=ps[(S.rng()*ps.length)|0],r=p.st==='hate'?H.quarrel(S,p.a,p.b):H.harass(S,p.a,p.b);
var rr=rel(S,p.a,p.b);if(rr)rr.ten=clamp(rr.ten+6,0,100);
sayAs(S,p.a,{kind:'ev',tag:'ケンカ',text:r.text,why:r.why});
};
DG.partyBoss=function(S,tgt){if(S.rng()<0.5)witness(S,tgt,{gain:20});};
DG.partyRescue=function(S,caps,fr){
var rng=S.rng;
caps.forEach(function(c){
if(c.fallen|| !c.captor||c.bossCapture&&fr.length===0)return;
var a=fr.slice().sort(function(x,y){return(y.tr.np+st(y,'fight')*0.1+rel(S,y,c).trust/60)-(x.tr.np+st(x,'fight')*0.1+rel(S,x,c).trust/60);})[0];
if(!a)return;
var will=a.tr.np*0.5+rel(S,a,c).trust/60+a.tr.cp*0.2+(c.bossCapture?0.2:0);
if(rng()>will)return;
var ok=rng()<0.35+st(a,'fight')*0.07+fr.length*0.08;
if(ok){
c.captor=null;c.hp=30;c.bossCapture=false;S.cnt.saved++;rel(S,a,c).trust+=15;rel(S,a,c).saved++;
var o=sayAs(S,a,{kind:'ev',tag:'救出',text:t2(S,pk(S,[isTop(c)?'{a}が巣に飛び込み、{b}を閉じ込めていた檻を叩き壊した。「帰るぞ！」{b}は「遅い」とだけ言って、{a}の肩を叩いた。':'{a}が巣に飛び込み、{b}を縛るものを断ち切った。「帰るぞ！」{b}は泣きながら{a}にしがみついた。','{a}は囮になって魔物を引きつけ、その隙に{b}を連れ出した。','{a}は{b}を背負って、巣から全力で駆け出した。']),a,c),why:a.name+'のNP・戦闘力 '+st(a,'fight')+'（捕まった'+c.name+'を救出）'});
DG.key(S,o,a.name+'が'+c.name+'を救い出した');
pn(S,a.name+'は捕らわれた'+c.name+'を救い出した。');
}else{
sayAs(S,a,{kind:'ev',tag:'救出',text:t2(S,pk(S,[isTop(c)?'{a}は{b}を助けに向かったが、巣の入り口で押し返された。奥から、{b}が魔物を怒鳴りつける声が聞こえた。':'{a}は{b}を助けに向かったが、巣の入り口で押し返された。{b}の声が、奥から聞こえ続けた。','{a}の手は{b}に届かなかった。「必ず戻る」と叫んで、{a}は退いた。','{a}は{b}へ伸ばした手ごと魔物に弾き返され、壁に叩きつけられた。息が戻ったときには、巣の奥への道は閉ざされていた。']),a,c),why:a.name+'は救出に失敗した'});
a.hp-=10;
}
});
};
})();
});
;
/* ==== js/dungeon-tempt.js ==== */
HK.Load.def(166,'js/dungeon-tempt.js',function(){
(function(){
'use strict';
var HK=window.HK,DG=HK&&HK.DG;
if(!DG|| !DG.partyAfter|| !DG.partySetup)return;
function L(s){return s.split('|');}
var T={
intro:{
aph:{
lead:L('{ev}の甘い熱は、部屋を抜けても{a}の体から引かなかった。小休止の合図が出るなり、{a}は{b}の手首を掴んで物陰へ引き寄せた。{a}「…悪い。少しだけ、付き合ってくれないか」掠れた声に、冗談の色はなかった。|{a}の肌は、{ev}を浴びてからずっと薄紅に染まったままだった。{a}は荷を下ろした{b}の背後に立ち、首筋に熱い息を落とした。{a}「我慢しようとしたんだ。でも、{b}の匂いがすると、頭が回らない」{b}が振り向くより先に、{a}の指が{b}の顎をすくい上げていた。|{a}は壁にもたれて、荒い息を何度も整えようとしていた。{ev}の熱が、触れられてもいない体の芯で脈打ち続けている。やがて{a}は顔を上げ、まっすぐ{b}を見た。{a}「…{b}。今だけでいい。こっちに来て」'),
offer:L('{ev}を浴びた{a}は、座り込んだまま膝をこすり合わせていた。{b}が様子を見に屈むと、{a}はその袖をきゅっと握った。{a}「ごめん、体が、熱くて…{b}に触ってほしい」潤んだ目が、{b}の唇のあたりをさまよっていた。|{a}の吐く息は、{ev}の甘い匂いがした。{a}は{b}の胸元に額を押しつけたまま、動こうとしなかった。{a}「笑わないで。ほんとに、おかしくなりそうなんだ」押しつけられた体の熱さに、{b}の喉が小さく鳴った。|{a}は{b}の手を取ると、そのまま自分の火照った頬に押し当てた。{a}「ほら…{ev}のせいで、こんなに熱い」{a}はその手を首筋へ、鎖骨へと、ゆっくり滑らせていく。{b}は手を引くこともできずに、{a}の脈の速さを指先で数えていた。')
},
fall:{
lead:L('迷宮の奥へ進むほど、{a}の目つきは変わっていった。野営の火が小さくなった頃、{a}は{b}の隣に腰を下ろし、迷いのない手つきでその腰を引き寄せた。{a}「ここではみんな、気持ちいいことしかしてない。{b}だけ我慢するの、もったいないだろ」甘く低い声が、耳のすぐそばで囁いた。|{a}はもう、罠を避けようとしていなかった。それどころか、仲間の{b}を見る目にまで、迷宮と同じ熱が宿り始めていた。{a}は{b}の外套の留め具に指をかけ、一つずつ外していく。{a}「怖がらなくていい。全部、教えてあげる」|見張りの番が{a}と{b}の二人になったとき、{a}は静かに笑った。{a}「ねえ、{b}。どうせ誰も見てない」{a}は{b}の手から松明を取り上げて、壁の燭台に掛けた。空いた手は、もう{b}の腰に回っていた。'),
offer:L('堕ちかけた{a}は、甘えるように{b}の膝に乗った。{a}「ねえ、{b}も我慢しなくていいんだよ。ここでは、誰も怒らないから」蕩けた目で見上げながら、{a}は{b}の胸にそっと指を這わせた。拒む言葉を探す{b}の唇を、{a}の指先がやさしく塞いだ。|{a}は寝床にしていた外套の上で、わざとゆっくり衣を緩めた。{a}「{b}、こっち。一人だと寒いんだ」火に照らされた肌は、迷宮に入る前よりずっと艶めいて見えた。{b}は目を逸らそうとして、逸らせなかった。|{a}は{b}の背中に体を預け、耳元でくすくす笑った。{a}「最初はね、怖かったんだ。でも、今はもう平気」{a}の指先が、{b}の帯の結び目をつまんで、くいと引いた。{a}「{b}にも、教えてあげたいな」')
}
},
yield:L('{b}は一瞬だけためらってから、{a}の背に腕を回した。|{b}は「…今回だけだ」と呟いて、{a}の唇を受け止めた。|{b}の理性は、{a}の熱に触れたところで静かにほどけた。|{b}は長い息を吐いて、差し出された{a}の手に指を絡めた。'),
resist:{
firm:L('{b}は{a}の手首を掴んで、静かに押し戻した。{b}「だめだ。今の{a}は、{a}じゃない」{a}は唇を噛んで俯き、しばらくしてから小さく「…ごめん」と呟いた。{b}は何も言わずに、自分の水筒を{a}に手渡した。|{b}は一歩引いて、{a}との間に剣の鞘を差し入れた。{b}「迷宮の思うつぼだ。正気に戻ったら、きっと後悔する」{a}はしばらく{b}を睨んでいたが、やがて力なく壁にもたれた。火照りの残る横顔は、悔しそうにも、ほっとしたようにも見えた。|{b}は{a}の頬を両手で挟んで、まっすぐ目を合わせた。{b}「しっかりしろ。名前を言ってみろ」{a}は震える声で自分の名前を言い、それから地上の町の名前を言った。三つ目を言い終えたとき、{a}の目に少しだけ光が戻っていた。'),
soft:L('{b}は{a}を抱き寄せはしたが、それ以上は何もしなかった。{b}「大丈夫。熱が引くまで、こうしてるから」{a}は{b}の肩口で何度も浅い息を吐いた。背中をさする手の温かさに、{a}の呼吸は少しずつ落ち着いていった。|{b}は{a}の手をそっと握り返して、首を横に振った。{b}「こんな形は、嫌なんだ。罠のせいにして、{a}を傷つけたくない」{a}は泣き笑いのような顔になって、{b}の手の甲に額をつけた。{b}は熱が引くまで、その手を離さなかった。|{b}は自分の外套で{a}をくるんで、薬草を煎じた湯を差し出した。{b}「ゆっくり飲んで。罠の熱なんて、朝までには抜けるから」{a}は湯気の向こうで恥ずかしそうに目を伏せた。{a}「…情けないとこ、見せちゃったね」')
},
act:{
mf:L('{t}は{u}を外套の上に横たえ、火照った肌に唇を落としていった。首筋から胸元へ、胸元から下腹へと降りるたびに、{u}の腰が小さく跳ねる。{u}「{vb1}」{t}は濡れそぼった{u}の{女性器}を指でほぐしてから、ゆっくりと自分の{男性器}を沈めた。{t}「{vt}」奥まで満たされた瞬間、{u}は{t}の背中に爪を立てて、声にならない息を漏らした。|{t}は{u}を壁際に追い詰め、片脚を抱え上げた。{u}「{vb1}」とろけきった{u}の中は、触れる前からひくひくと疼いていた。{t}が腰を進めるたびに、{u}は{t}の首にすがりついて甘い声を上げる。{t}「{vt}」迷宮の湿った空気の中で、二人の息づかいだけがどんどん速くなっていった。|{t}は{u}を毛布の上に組み敷き、{u}の脚の間に体を割り込ませた。{u}の{女性器}はもう、{t}を待ちわびるように蜜をこぼしていた。{u}「{vb1}」{t}がゆっくりと奥まで沈めると、{u}は背をしならせて{t}にしがみついた。{t}「{vt}」揺さぶられるたびに、{u}の声は甘く崩れていった。'),
ff:L('{t}は{u}を外套の上に横たえ、火照った肌に唇を這わせていった。胸の先を舌で転がされるたびに、{u}の腰が小さく浮き上がる。{u}「{vb1}」{t}は濡れそぼった{u}の{女性器}を指でなぞり、ゆっくりと二本の指を沈めた。{t}「{vt}」中の弱いところを指の腹で探り当てられて、{u}は{t}の肩に爪を立てた。|{t}は{u}の脚の間に顔を埋め、とろとろに濡れたところへ舌を這わせた。{u}「{vb1}」{u}は思わず{t}の髪に指を絡め、腰を震わせる。{t}は舌で花芯を転がしながら、指でゆっくりと中をかき回した。{t}「{vt}」迷宮の湿った空気の中で、{u}の甘い声だけがどんどん高くなっていった。|{t}は{u}を壁際に追い詰め、唇を重ねたまま{u}の衣の中へ手を滑り込ませた。指先が胸のふくらみをなぞり、下腹をなぞり、熱く濡れた{女性器}に辿り着く。{u}「{vb1}」{t}の指が中に入ってくるたびに、{u}は膝を震わせて{t}にすがりついた。{t}「{vt}」二人の吐息が絡み合って、狭い通路を甘く満たしていった。'),
fm:L('{t}は{u}を外套の上に押し倒し、その胸に手をついて跨がった。{u}の{男性器}はもう、触れる前から硬く張りつめていた。{t}はそれを自分の熱く濡れた入り口にあてがい、焦らすようにゆっくりと腰を沈めていく。{u}「{vb1}」{t}「{vt}」{t}が腰を前後に揺らすたびに、{u}は毛布を握りしめて喉を反らした。|{t}は{u}の上着の前を開き、首筋から胸へと口づけを落としていった。{u}「{vb1}」張りつめた{u}の{男性器}を手のひらで包んで扱くと、{u}の腰がびくりと跳ねる。{t}は満足げに笑って{u}に跨がり、自分の奥へとそれを呑み込んでいった。{t}「{vt}」締めつけるように腰を回されて、{u}はたまらず{t}の腰にすがった。|{t}は{u}を壁にもたれさせ、その前に膝をついた。{t}の舌先が{u}の{男性器}をなぞり上げると、{u}は思わず{t}の髪に指を絡めた。{u}「{vb1}」{t}は十分に昂らせてから立ち上がり、{u}の膝に跨がって、ゆっくりと腰を落としていった。{t}「{vt}」{t}が自分の好きな速さで腰を使うたびに、{u}の息は浅く乱れていった。'),
mm:L('{t}は{u}を外套の上にうつ伏せにさせ、背筋に沿って唇を落としていった。軟膏をまとわせた指で、{t}は{u}の後ろを丁寧にほぐしていく。{u}「{vb1}」十分に柔らかくなったところで、{t}はゆっくりと自分の{男性器}を沈めた。{t}「{vt}」奥まで満たされた{u}は、毛布に額を押しつけて、甘く掠れた息を吐いた。|{t}は{u}を壁際に追い詰め、張りつめた{u}の{男性器}を手のひらで包み込んだ。{u}「{vb1}」{t}は扱く手を止めないまま、もう片方の指で{u}の後ろをほぐしていく。やがて{t}は{u}の片脚を抱え上げ、熱く硬いものを奥へと押し進めた。{t}「{vt}」揺さぶられるたびに、{u}は{t}の肩にすがりついて声を震わせた。|{t}は{u}を毛布の上に組み敷き、深く口づけながら衣を剥いでいった。軟膏で濡らした指が後ろをほぐしていくと、{u}の腰が逃げるように揺れる。{u}「{vb1}」{t}はその腰を両手で掴んで引き戻し、ゆっくりと奥まで沈めた。{t}「{vt}」揺さぶられるたびに、{u}の張りつめたものが二人の腹の間で擦れて、先走りをこぼした。')
},
climax:{
proud:L('{u}は最後まで声を噛み殺そうとしていた。けれど{t}に容赦なく追い上げられて、とうとうこらえきれなくなった。{u}「{vb2}」――悔しげに顔を歪めたまま、{u}は全身を震わせて果てた。|{u}「くそ、こんなの……っ」悪態は、途中から甘い声に変わっていた。{u}「{vb2}」――{u}は{t}の肩に歯を立てて、背を弓なりに反らした。|{u}は{t}を睨みつけたまま、最後の波に呑まれた。{u}「{vb2}」――強がりの欠片も残らない声が、迷宮の闇に吸い込まれていった。'),
stern:L('{u}は唇を固く結び、乱れる呼吸を最後まで律しようとした。だが{t}の動きが速まると、その堤もあっけなく崩れた。{u}「{vb2}」――{u}は短く息を詰めて、深く長く達した。|{u}「……っ、まだ、だ……」耐える言葉とは裏腹に、{u}の体はとうに限界を越えていた。{u}「{vb2}」――張りつめていた背筋がほどけ、{u}は{t}の腕の中で崩れ落ちた。|{u}は目を閉じて、迫り上がる熱をこらえ続けた。けれど{t}に名前を呼ばれた瞬間、こらえていたものが一気に溢れた。{u}「{vb2}」――{u}は声を殺しきれないまま、静かに果てた。'),
tsun:L('{u}「べ、別に、こんなの……っ」言い終わる前に、{u}の腰が勝手に跳ねた。{u}「{vb2}」――{u}は真っ赤な顔を{t}の胸に埋めて、何度も体を震わせた。|{u}は最後まで「感じてない」と言い張っていた。けれど{t}が一番弱いところを責め立てると、その言葉はあっけなく崩れた。{u}「{vb2}」――果てたあと、{u}は「今の、見なかったことにして」と小さく呟いた。|{u}は{t}の背中を叩きながら、それでもしがみつく腕を離さなかった。{u}「{vb2}」――高みから降りてきた{u}は、涙目で{t}を睨んでいた。'),
gentle:L('{u}は{t}の頬を両手で包んで、とろけた笑みを浮かべた。{u}「{vb2}」――{u}は{t}を抱きしめたまま、柔らかく長い波に身を委ねた。|{u}「ん……{t}、そこ……」甘く囁く声が、やがて途切れ途切れになっていく。{u}「{vb2}」――{u}は{t}の名前を呼びながら、ゆっくりと果てた。|{u}は穏やかな顔のまま、少しずつ高みへ押し上げられていった。{u}「{vb2}」――果てる瞬間、{u}は{t}の背中を宥めるように撫でていた。'),
devoted:L('{u}は「{t}が気持ちいいなら」と、最後まで{t}の動きに体を合わせようとしていた。{u}「{vb2}」――{u}は{t}にすがりついたまま、涙をこぼして果てた。|{u}「ご、ごめんなさい、もう……っ」{u}は何度も謝りながら、迫り上がる波をこらえきれなかった。{u}「{vb2}」――果てたあとも、{u}は{t}の手をぎゅっと握って離さなかった。|{u}は健気に声を抑えようとして、それでも{t}を求める腕を緩めなかった。{u}「{vb2}」――{u}は{t}の胸に顔を埋めて、小さく震えながら達した。'),
cool:L('{u}は最後まで、自分の体に起きていることを冷静に数えようとしていた。けれど三度目の波が来たとき、もう何も数えられなくなっていた。{u}「{vb2}」――{u}の整った顔が、初めてはっきりと崩れた。|{u}「……分析、できない……」{u}は呆然と呟き、そのまま{t}の肩に額を落とした。{u}「{vb2}」――ふだんの冷静さが嘘のように、{u}は{t}の腕の中で乱れて果てた。|{u}は乱れる呼吸を抑えようとして、失敗した。{u}「{vb2}」――果てたあと、{u}はしばらく天井を見つめたまま、自分の鼓動の速さに戸惑っていた。'),
free:L('{u}は恥ずかしがる素振りも見せずに、{t}の動きに合わせて自分から腰を揺らした。{u}「{vb2}」――{u}は声を上げて笑うように果て、そのまま{t}に抱きついた。|{u}「すごい、これ、すごい……っ」{u}は素直に声を上げて、{t}の腰を強く引き寄せた。{u}「{vb2}」――果てたあと、{u}は「もう一回」と言いたげに{t}を見上げた。|{u}は迷宮の熱も、仲間の目も忘れて、ただ気持ちよさに身を任せた。{u}「{vb2}」――{u}の弾んだ声が、石の天井に何度も跳ね返った。'),
shy:L('{u}は両手で顔を隠したまま、それでも声を止められなかった。{u}「{vb2}」――果てた瞬間、{u}は耳まで真っ赤にして{t}の胸に潜り込んだ。|{u}「み、見ないで……っ」消え入りそうな声で懇願しながら、{u}の体は正直に震えていた。{u}「{vb2}」――{u}はぎゅっと目をつぶって、小さく何度も果てた。|{u}は唇を噛んで声をこらえていたが、{t}に優しく名前を呼ばれて、とうとう崩れた。{u}「{vb2}」――果てたあと、{u}は恥ずかしさで{t}の顔を見られなかった。'),
polite:L('{u}は乱れる息の合間にも、丁寧な言葉遣いを崩すまいとしていた。{u}「{vb2}」――最後の波に呑まれた瞬間、{u}の言葉はとうとう意味をなさなくなった。|{u}「も、申し訳、ありませ……っ」{u}は詫びる言葉を繰り返しながら、{t}にすがりついた。{u}「{vb2}」――{u}は品よく整えていた髪を乱したまま、深く果てた。|{u}は「お見苦しいところを」と言いかけて、その先を続けられなかった。{u}「{vb2}」――{u}は{t}の腕の中で、震えながら静かに達した。')
},
topFin:{
mf:L('{t}もほどなく、低く呻いて{u}の奥で果てた。|締めつけに誘われるように、{t}も{u}の中へ熱を吐き出した。|{t}は{u}を強く抱きすくめたまま、深いところで果てた。'),
mm:L('{t}もほどなく、低く呻いて{u}の奥で果てた。|締めつけに誘われるように、{t}も{u}の中へ熱を吐き出した。|{t}は{u}の腰を引き寄せたまま、深いところで果てた。'),
ff:L('{t}は{u}の震えが収まるまで、指を抜かずに優しく抱きしめていた。|{t}は果てた{u}の額に口づけ、汗ばんだ髪を指で梳いた。|{t}は満足げに息をつき、{u}の中から濡れた指をそっと引き抜いた。'),
fm:L('{t}もまた、{u}の上で背を反らし、きつく締めつけながら達した。|{u}が果てる脈動を感じて、{t}も腰を震わせながら高みへ昇りつめた。|{t}は{u}の胸に手をついたまま、満ち足りた顔で最後の一滴まで搾り取った。')
},
ero:{
mf:L('{s:hit}。{u}「{m2}」――奥を突き上げられるたびに、{u}の{女性器}はきゅうきゅうと{t}を締めつけた。|{s:wet}。{u}「{m2}」――とろとろに濡れた奥をかき回されて、{u}は{t}の腰に脚を絡めたまま何度もイった。|{s:cum}。{u}「{m2}」――奥にたっぷりと注がれて、{u}はびくびくと腰を跳ねさせながら蕩けた顔で果てた。'),
ff:L('{s:wet}。{u}「{m2}」――{t}の指に中の弱いところを擦り上げられて、{u}はぷしゃっと潮を噴きながらイった。|{s:wet}。{u}「{m2}」――花芯を舌で吸われたまま指で奥をかき回されて、{u}の腰はがくがくと跳ね続けた。|{s:suck}。{u}「{m2}」――{t}にとろとろの{女性器}を舐めしゃぶられて、{u}は脚をぴんと伸ばしたまま深くイった。'),
fm:L('{s:hit}。{u}「{m2}」――{t}に上から腰を叩きつけられて、{u}はこらえきれずに勢いよく吐き出した。|{s:wet}。{u}「{m2}」――きつく締めつけられたまま腰を回されて、{u}の{男性器}はびくびくと脈打ちながら果てた。|{s:cum}。{u}「{m2}」――根元まで呑み込まれたまま搾り取られて、{u}は腰を震わせて何度も吐き出した。'),
mm:L('{s:hit}。{u}「{m2}」――奥を突き上げられるたびに、触れられてもいない{u}の{男性器}から先走りがとろとろと溢れた。|{s:cum}。{u}「{m2}」――奥に熱いものを注がれた瞬間、{u}も腹の上に勢いよく吐き出していた。|{s:wet}。{u}「{m2}」――前を扱かれながら奥を揺さぶられて、{u}はびくびくと腰を跳ねさせて果てた。')
},
eroTop:{
m:L('{t}「{m1}」――{t}は果てたばかりの{u}を逃がさず、さらに深く腰を打ちつけた。|{t}「{m1}」――{t}は{u}の腰を掴み直して、自分の好きな速さで責め立てた。|{t}「{m1}」――{t}は{u}の耳元で息を荒げながら、最後のひと押しを奥まで沈めた。'),
f:L('{t}「{m1}」――{t}は{u}の乱れる顔を見下ろして、満足げに唇を舐めた。|{t}「{m1}」――{t}は果てたばかりの{u}を逃がさず、もう一度ゆっくりと責め始めた。|{t}「{m1}」――{t}は{u}の汗ばんだ首筋に口づけて、甘く笑った。')
},
again:L('一度果てても、迷宮の熱は二人を放さなかった。{t}が再び{u}を抱き寄せると、{u}は拒むどころか自分から唇を重ねてきた。二度目は、一度目よりずっと長く、ずっと深かった。|息が整う前に、{u}がまた{t}の手を引いた。迷宮の甘い空気が、果てたばかりの体をすぐにまた火照らせる。二人がようやく離れたのは、松明が一本燃え尽きたあとだった。|{t}は{u}を休ませなかった。敏感になりきった肌を、もう一度ゆっくりとなぞっていく。{u}はかすれた声で何度も{t}の名前を呼び、そのたびに新しい波に攫われた。'),
fade:L('{b}は、差し出された{a}の手を取った。二人は野営の火から離れた岩陰へ消え、しばらく戻ってこなかった。戻ってきたとき、二人の頬はまだほんのりと赤かった。|{b}は小さく息をついて、{a}の肩を抱き寄せた。外套が一枚、二人の上にふわりと掛けられる。その夜、二人がどんな言葉を交わしたのかは、迷宮の闇だけが知っている。|{b}はもう、{a}を止めなかった。松明の火が細く揺れて、二人の影が寄り添うように重なる。翌朝、{a}の顔からは、あの苦しげな熱がすっかり消えていた。'),
after:{
love:L('果てたあと、{a}と{b}は外套にくるまって寄り添っていた。{a}の熱はようやく引き、代わりに気恥ずかしさが込み上げてくる。{b}は何も言わずに、{a}の髪をそっと撫でていた。|二人はしばらく、互いの鼓動を聞きながら黙っていた。{a}「…罠のせいにしても、いい？」{b}「…罠のせいだけには、したくないな」{a}は返事の代わりに、{b}の指に自分の指を絡めた。|熱が引いたあとも、{b}は{a}の手を離さなかった。{a}が照れくさそうに目を逸らすと、{b}は小さく笑ってその額に口づけた。迷宮を出たら、きちんと話をしよう――二人とも、同じことを考えていた。'),
cool:L('熱が引くと、{a}は気まずそうに衣を整えた。{a}「…悪かった。迷宮のせいだから、忘れて」{b}は少し黙ってから、「お互いさまだ」とだけ答えた。|果てたあと、二人は背中合わせに座って、互いの顔を見ないようにしていた。{b}「…今日のことは、誰にも言わない」{a}「うん。そうして」松明の爆ぜる音だけが、やけに大きく響いていた。|{a}はようやく正気に戻ったような顔で、乱れた髪をかき上げた。{a}「ごめん、変なことに付き合わせて」{b}は首を振って、{a}の外套を肩に掛け直してやった。気まずさはあったが、不思議と嫌な気持ちではなかった。')
},
stop:L('物音に気づいた{c}が、松明を掲げて岩陰を覗き込んだ。{c}「二人とも、何してる」{c}は{a}の肩を掴んで{b}から引き離し、水筒の冷たい水を頭から浴びせた。{a}はずぶ濡れのまま、ようやく自分のしていたことに気づいて俯いた。|{c}「そこまでだ」低い声が、二人の間に割って入った。{c}は{a}と{b}の間に体を入れ、{a}の目をまっすぐ覗き込んだ。{c}「迷宮に呑まれるな。地上に帰ったら、好きなだけ悩めばいい」{a}は唇を噛んで、黙って頷いた。|{c}は二人に背を向けたまま、わざと大きな音を立てて荷をまとめ始めた。{c}「そろそろ出発する。三つ数えたら、二人とも来て」{a}ははっと我に返り、乱れた外套を慌てて掻き合わせた。{b}も気まずそうに目を逸らし、{c}の後を追った。'),
join:{
share:L('二人の気配に気づいた{c}は、しばらく岩陰の入り口で立ち尽くしていた。けれど{u}の蕩けた目に見つめられて、{c}も迷宮の熱に身を委ねた。{c}は{u}の背後に回り、首筋に唇を這わせながら胸元をまさぐる。前からは{t}に、後ろからは{c}に愛撫されて、{u}「{vb1}」――{u}の声はどんどん甘く崩れていった。|{c}は見て見ぬふりをするつもりだった。けれど{u}に名前を呼ばれて、気づけば二人のそばに膝をついていた。{c}は{u}の唇を奪い、{t}は{u}の肌をなぞり続ける。二人がかりで弱いところを探り当てられて、{u}「{vb1}」――{u}は指先まで震わせた。|{c}「…仲間外れは、ずるいよ」{c}は照れくさそうに笑って、外套を脱ぎ捨てた。{c}の指が{u}の胸元を、{t}の唇が{u}の首筋を、同時になぞっていく。{u}「{vb1}」――{u}は二人の間で、身をよじることしかできなかった。'),
serve:L('岩陰を覗いた{c}は、{u}の乱れた姿に息を呑んだ。{t}はそれに気づくと、空いた手で{c}を招き寄せた。{t}「{vt}」{t}は{u}を愛撫する手を緩めないまま、もう片方の手で{c}の肌をなぞり始める。{c}「{vbc}」――甘い声が、狭い岩陰に重なっていった。|{c}はためらいがちに、{u}の隣に身を横たえた。{t}は二人を交互に抱き寄せ、唇と指で順番に火照らせていく。{c}「{vbc}」{u}と{c}は互いの手を握り合ったまま、{t}の与える熱に溺れていった。|{c}「…混ぜて、ほしい」{c}は自分から{t}の手を取り、火照った肌に導いた。{t}は小さく笑って、{u}と{c}を並べて寝かせた。{c}「{vbc}」二人の声が交互に上がるたびに、{t}の手つきはいっそう巧みになっていった。')
},
joinFin:{
share:L('{t}と{c}も、{u}を挟んだまま荒い息をついて果てた。|{u}の震えが収まるのを待ってから、{t}と{c}もようやく深く息を吐いた。|{t}と{c}は果てた{u}を両側から抱きしめ、汗ばんだ額に代わる代わる口づけた。'),
serve:L('{c}「{vbc2}」――{c}も{t}の手の中で、背を反らして達した。|{c}「{vbc2}」――{c}は{u}の手を握りしめたまま、少し遅れて果てた。|{c}「{vbc2}」――{c}は{t}の肩に額を押しつけて、小さく何度も震えた。')
},
joinAfter:L('果てたあと、三人は一枚の外套に身を寄せ合って眠った。誰が最初に誘ったのかは、もう誰も気にしていなかった。目覚めたとき、三人の間の空気は、少しだけ柔らかくなっていた。|熱が引くと、三人はそろって吹き出した。{c}「…地上に帰っても、これは内緒だね」{a}も{b}も、赤い顔のまま頷いた。誰からともなく、三人は身支度を始めた。|三人はしばらく、寄り添ったまま動かなかった。迷宮の甘い空気が、火照った肌をゆっくりと冷ましていく。やがて{b}が身を起こし、黙って水筒を配った。')
};
DG.TEMPT=T;
var P=function(){return HK.Pos;};
function k(a,b){return a.i<b.i?a.i+'-'+b.i:b.i+'-'+a.i;}
function rel(S,a,b){return S.rel&&S.rel[k(a,b)];}
function free(S){return S.party.filter(function(x){return!x.fallen&& !x.captor&&x.corrupt<100&&x.reason>0;});}
function pn(S,s){(S.partyNotes=S.partyNotes||[]).push(s);}
function sayAs(S,h,o){var prev=S.h;S.h=h;var e=DG.say(S,o);S.h=prev;return e;}
function sexOk(a,b){
if(!a|| !b||a===b)return false;
if(HK.ngSexPair&&HK.ngSexPair(a,b))return false;
if(HK.sexBlocked&&HK.sexBlocked(a,b))return false;
if(HK.State&&HK.State.pairSex)return HK.State.pairSex(a,b);
return!!(P()&&P().okSex(a,b));
}
function loveOk(a,b){return HK.State&&HK.State.pairLove?HK.State.pairLove(a,b): !!(HK.canLove&&HK.canLove(a,b)&&HK.canLove(b,a));}
function hardTop(c){return!!(P()&&P().hardTop(c));}
function hasCurse(h,id){return h.curses&&h.curses.indexOf(id)>=0;}
var APH= /媚薬|発情|催淫|香|霧|湯|花|淫/;
function aphroEv(ev){return!!(ev&&(APH.test(ev.name||'')||(ev.o&&(ev.o.curse==='heat'||(ev.o.sens||0)>=0.06))));}
function R(S){return S.tmR||(S.tmR={rng:HK.rng(((S._tmSeed||0)*31+9973)>>>0)});}
function pk(S,arr){var r=R(S);return HK.Ero&&HK.Ero.fresh?HK.Ero.fresh(r,arr):arr[r.rng.int(arr.length)];}
function voice(S,s,bot,top){var TV=HK.ThickVM;return TV?TV.voice(R(S).rng,s,bot,top):s.replace(/\{v[a-z0-9]+\}/g,'……っ');}
function eroFill(S,s,who,dom){
var E=HK.Ero;if(!E)return s.replace(/\{s:\w+\}。?|「\{m\d\}」――/g,'');
var d0=who.eroDom;if(dom)who.eroDom=true;
var out=E.fill(R(S),s,who);who.eroDom=d0;return out;
}
function names(s,m){return s.replace(/\{(a|b|c|t|u|ev)\}/g,function(x,key){return m[key]!=null?m[key]:x;});}
function combo(t,u){var tf=P()?P().isF(t):t.gender==='f',uf=P()?P().isF(u):u.gender==='f';return tf?(uf?'ff':'fm'):(uf?'mf':'mm');}
function bump(h,k2,v){h[k2]=(h[k2]||0)+v;}
function spend(S,h,top){
h.climax++;
bump(h,'corrupt',(top?2:3.5)*(S.k||1));
h.pleasure=14+S.rng.int(16);
}
function tempt(S,hit){
if(HK.SAFE_ON)return false;
var F=free(S);
if(F.length<2)return false;
if((S.tmN||0)>=4||(S.tmLast!=null&&S.log.length-S.tmLast<12))return false;
var rng=S.rng;
var heat=function(x){
if(!HK.State|| !HK.State.r18ok(x))return 0;
var aph=(hit&&hit.h===x&&aphroEv(hit.ev))||hasCurse(x,'heat');
var v=(aph&&x.pleasure>=35?0.5+x.pleasure/150:0)+(x.corrupt>=45?(x.corrupt-35)/60:0);
return v>0&&F.some(function(y){return y!==x&&sexOk(x,y);})?v:0;
};
var a=HK.weighted(rng,F,heat);
if(!a||rng()>0.2)return false;
var aph=(hit&&hit.h===a&&aphroEv(hit.ev))||hasCurse(a,'heat');
var cand=F.filter(function(y){return y!==a&&sexOk(a,y);});
var b=HK.weighted(rng,cand,function(y){var r=rel(S,a,y)||{};return 0.3+(r.att||0)/40+(r.tie&& /lover|fwb|almost|mate|fated|spouse/.test(r.tie)?1:0);});
if(!b)return false;
S.tmN=(S.tmN||0)+1;S.tmLast=S.log.length;
var r=rel(S,a,b)||{trust:15,att:0,ten:0};
var love=loveOk(a,b),tie=r.tie||'';
var cp=HK.TIES&&HK.TIES[tie];
var want=(love?r.att/70:0)+b.corrupt/90+b.pleasure/160+b.tr.fc*0.25+(cp&&(cp.couple||cp.night)?0.6:0)-b.tr.cp*0.3-Math.max(0,b.reason)/250+(aph?0.1:0)+rng()*0.4;
var give=want>0.55;
var o=P()?P().order(a,b,[a,b]):[a,b],t=o[0],u=o[1];
var lead=t===a;
var evName=(aph&&hit&&hit.ev&&hit.ev.name)||(hasCurse(a,'heat')?'発情の呪い':(S.lastEv&&S.lastEv.name)||'罠');
var M={a:a.name,b:b.name,t:t.name,u:u.name,ev:evName};
var intro=names(pk(S,T.intro[aph?'aph':'fall'][lead?'lead':'offer']),M);
var why0=a.name+(aph?'は'+evName+'の熱で昂り（快感 '+Math.round(a.pleasure)+'）':'の堕ち度 '+Math.round(a.corrupt))+'。'+b.name+'の理性 '+Math.round(Math.max(0,b.reason))+'・堕ち度 '+Math.round(b.corrupt)+(love?'・惹かれ '+Math.round(r.att):'')+(cp?'・関係「'+cp.label+'」':'');
if(!give){
var soft=b.tr.np+(b.tr.warmth||0)*0.5>b.tr.cp+0.1;
var txt=intro+'\n\n'+names(pk(S,T.resist[soft?'soft':'firm']),M);
a.pleasure-=10;a.reason+=6;b.pleasure+=8;b.reason-=2;
r.ten+=soft?2:5;r.trust+=soft?4:1;
sayAs(S,a,{kind:'ev',tag:'誘惑',text:txt,why:why0+' → '+b.name+'は'+(soft?'やさしく宥めて':'きっぱりと')+'拒んだ'});
return true;
}
var others=F.filter(function(x){return x!==a&&x!==b;});
var c=null,mode='';
if(others.length){
var t3no=function(x){return!!(P()&&P().trioOptOut&&[a,b,x].some(P().trioOptOut));};
var joiners=others.filter(function(x){
return HK.State.r18ok(x)&&sexOk(x,a)&&sexOk(x,b)&& !t3no(x)&&(x.corrupt/100+x.tr.fc*0.3+x.pleasure/150)>0.45;
});
var stoppers=others.filter(function(x){return!(HK.ngPair&&(HK.ngPair(x,a)||HK.ngPair(x,b)))&&x.corrupt<50&&x.tr.cp+x.tr.np*0.5+x.reason/200>0.9;});
var j=joiners.length&&rng()<0.4?joiners[rng.int(joiners.length)]:null;
if(j&&P()){
if(P().order(j,u,[j,u])[0]===j&& !P().hardTop(u,j))mode='share';
else if(P().order(t,j,[t,j])[0]===t&& !P().hardTop(j,t))mode='serve';
if(mode)c=j;
}
if(!c&&stoppers.length&&rng()<0.25){c=stoppers[rng.int(stoppers.length)];mode='stop';}
}
if(c)M.c=c.name;
if(mode==='stop'){
var txs=intro+' '+names(pk(S,T.yield),M)+'\n\n'+names(pk(S,T.stop),M);
a.reason+=8;a.pleasure-=18;b.reason+=4;b.pleasure-=8;
var rca=rel(S,c,a),rcb=rel(S,c,b);
if(rca){rca.ten+=4;rca.trust+=2;}
if(rcb)rcb.trust+=3;
r.ten+=3;
sayAs(S,a,{kind:'ev',tag:'誘惑',text:txs,why:why0+' → '+b.name+'は応じかけたが、'+c.name+'が割って入った（CP・NP・理性）'});
return true;
}
var X=HK.Lewd,cf=X&&X.conf('dungeon');
var low=(cf&&X.lv(S.env)==='low')||S.env.trap<15;
var thick= !low&&(S.env.lewdLen==='thick'||(S.env.lewdLen==='mix'&&R(S).rng()<0.5)|| !cf);
var ero= !low&&cf&&X.ero(S.env)&& !!HK.Ero,high= !low&&cf&&X.high(S.env);
var cb=combo(t,u),parts=[];
if(low)parts.push(intro,names(pk(S,T.fade),M));
else{
parts.push(intro+' '+names(pk(S,T.yield),M));
parts.push(names(voice(S,pk(S,T.act[cb]),u,t),M));
if(mode==='share'||mode==='serve'){
var js=voice(S,pk(S,T.join[mode]),u,t);
js=js.replace(/\{vbc\}/g,function(){return voice(S,'{vb1}',c,t);});
parts.push(names(js,M));
}
var cl=voice(S,pk(S,T.climax[u.persona]||T.climax.gentle),u,t);
if(ero){
cl+=' '+eroFill(S,pk(S,T.ero[cb]),u,false);
if(!mode)cl+=' '+eroFill(S,pk(S,T.eroTop[cb==='ff'||cb==='fm'?'f':'m']),t,true);
}
if(mode==='share'||mode==='serve')cl+=' '+pk(S,T.joinFin[mode]).replace(/\{vbc2\}/g,function(){return voice(S,'{vb2}',c,t);});
else cl+=' '+pk(S,T.topFin[cb]);
parts.push(names(cl,M));
if(high&& !mode)parts.push(names(pk(S,T.again),M));
parts.push(names(pk(S,mode?T.joinAfter:T.after[love?'love':'cool']),M));
}
var text=parts.join(thick||low?'\n\n':' ');
if(!low&&c&&(mode==='share'||mode==='serve')&&HK.Trio3&&HK.Trio3.begin){
var sp3=mode==='share'?{p:'twoOne',t:t,m:c,u:u}:{p:'oneTwo',t:t,m:u,u:c};
var T3=HK.Trio3.begin({rng:R(S).rng,log:S.log,env:S.env},sp3,{env:S.env,ero: !!ero,short: !thick,apart:[mode==='share'?[t,c]:[u,c]],first:true,posePost:true});
if(T3){
var ST3=['fore','in','mid','peak'];
parts.forEach(function(x,i){T3.add(ST3[i]||'after',x,i>=4&&i===parts.length-1?2:1);});
var o3=T3.render();
text=['fore','in','mid','peak','after'].map(function(k){return o3[k];}).filter(Boolean).join(thick?'\n\n':' ');
}
}
spend(S,u,false);spend(S,t,true);
a.reason+=5;b.reason-=4;
r.intimate=(r.intimate||0)+1;r.trust+=cp&&cp.couple?6:3;r.ten=Math.max(0,r.ten-3);
if(love)r.att+=8;
if(c){
spend(S,c,mode==='share');
c.reason-=4;
[rel(S,c,a),rel(S,c,b)].forEach(function(q){if(q){q.intimate=(q.intimate||0)+1;q.trust+=2;}});
}
var why=why0+' → '+b.name+'は誘いに応じた（'+t.name+'が攻め）'+(c?'。'+c.name+'も加わった':'');
var ev=sayAs(S,a,{kind:'ev',tag:'誘惑',text:text,why:why});
if(r.intimate===1){
DG.key(S,ev,a.name+'の誘いに'+b.name+'が応えた');
pn(S,a.name+'の誘いに'+b.name+'が応え、二人は迷宮の中で肌を重ねた。'+(love?'それ以来、二人の距離は少しだけ近い。':''));
}
if(c&& !S.tmJoinNote){S.tmJoinNote=true;pn(S,c.name+'も加わり、三人は迷宮の熱を分け合った。');}
return true;
}
DG.tempt=tempt;
var setup0=DG.partySetup;
DG.partySetup=function(S,input){
var res=setup0(S,input);
S._tmSeed=(+(input&&input.seed)||0)>>>0;
var src=(input&&input.chars)||[];
S.party.forEach(function(h,i){
var c=src[h.i!=null?h.i:i]||{};
if(h.sexLock==null||h.sexLock===''){
var s=c.sexLock;
h.sexLock=HK.sexLockOf(s);
}
});
((input&&input.ties)||[]).forEach(function(t){
if(!/^(lover|mate|fated|spouse)$/.test(t.type))return;
var x=S.party.filter(function(p){return p.i===t.a;})[0],y=S.party.filter(function(p){return p.i===t.b;})[0];
if(!x|| !y||(HK.ngPair&&HK.ngPair(x,y)))return;
(x.loveSet=x.loveSet||[]).push(y.i);(y.loveSet=y.loveSet||[]).push(x.i);
});
return res;
};
var after0=DG.partyAfter;
DG.partyAfter=function(S,tgt,hit){
if(tempt(S,hit))return;
return after0(S,tgt,hit);
};
})();
});
;
/* ==== js/dungeon-topfall.js ==== */
HK.Load.def(167,'js/dungeon-topfall.js',function(){
(function(){
'use strict';
var HK=window.HK,DG=HK&&HK.DG;
if(!DG|| !DG.partyAfter)return;
function L(s){return s.split('|');}
var PS=['proud','stern','tsun','gentle','devoted','cool','free','shy','polite'];
function ps(c){return c&&PS.indexOf(c.persona)>=0?c.persona:'gentle';}
var P=function(){return HK.Pos;};
function body(h){var Q=P();if(!Q)return h&&h.gender==='f'?'f':'m';return Q.noGen(h)?'x':Q.hasM(h)?'m':Q.hasF(h)?'f':'x';}
var TZ=DG.TEASE={
trap:{
m:L('{t}が動き出したかと思うと、仕掛けの奥から細い触手が何本も這い出してきた。{a}が振り払うより先に、触手は{p}を撫で、そのまま下へ滑り込んで、張りつめかけた{男性器}に巻きついた。挿れてくる気配はない。ただ根元から先へ、ゆっくりと搾るように扱き上げてくるだけだった。|{a}が{t}の仕掛けを叩き壊そうと踏み込んだ瞬間、床から伸びた蔓が両の手首に絡みついた。身動きの取れなくなった{a}の下衣の中へ、ぬめる蔓先が潜り込んでくる。先端の敏感なところだけを、くるくると円を描くように撫で回され、{a}の喉から低い唸りが漏れた。|{t}の仕掛けが{a}の腰に吸いついた。柔らかな襞がひとりでにうごめき、張りつめたものを丸ごと包み込んで、吸っては緩め、吸っては緩めをくり返す。{a}は仕掛けを引き剥がそうと掴んだが、指に力が入らなかった。|{t}から溢れた粘液が{a}の{p}を伝い、脚の付け根へと流れ落ちていった。粘液はそこで意思を持ったように蠢き、硬くなった{男性器}の裏側を、根元から先端まで何度も舐め上げる。{a}は奥歯を噛みしめた。果てさせる気のない、焦らすだけの動きだった。|{a}が{t}に背を向けた一瞬、腰に何かが巻きついた。細い触手が下衣の隙間から入り込み、昂りの根元をきゅっと締めつけたまま、先端だけを小刻みに擦り立ててくる。達しそうになるたびに締めつけが強まり、{a}は荒い息を吐いて壁に拳を打ちつけた。'),
f:L('{t}が動き出したかと思うと、仕掛けの奥から細い触手が何本も這い出してきた。{a}が振り払うより先に、触手は{p}を撫で、胸の先に吸いついて、もう一本が脚の間の小さな芽を探り当てた。中へ入ってくる気配はない。ただ表面だけを、執拗に、焦らすように擦り続けた。|{a}が{t}の仕掛けを叩き壊そうと踏み込んだ瞬間、床から伸びた蔓が両の手首に絡みついた。ぬめる蔓先が服の裾から潜り込み、胸の先をくすぐってから、下着越しに敏感な芽をゆっくりと押し撫でる。{a}は唇を噛んで、熱を帯びていく体を睨みつけた。|{t}の仕掛けが{a}の胸元に吸いついた。柔らかな襞がひとりでにうごめき、胸の先を吸っては緩め、吸っては緩めをくり返す。同じ仕掛けの小さな舌が脚の付け根まで伸びて、敏感な芽の上を羽のように撫でていった。{a}は仕掛けを引き剥がそうと掴んだが、指に力が入らなかった。|{t}から溢れた粘液が{a}の{p}を伝い、脚の付け根へと流れ落ちていった。粘液はそこで意思を持ったように蠢き、花芯の周りをくるくるとなぞっては、肝心なところに触れる寸前で離れていく。{a}は奥歯を噛みしめた。果てさせる気のない、焦らすだけの動きだった。|{a}が{t}に背を向けた一瞬、腰に何かが巻きついた。細い触手が下着の隙間から入り込み、脚の間の芽をつまむように捕らえて、小刻みに震わせてくる。達しそうになるたびに震えが止まり、{a}は荒い息を吐いて壁に拳を打ちつけた。'),
x:L('{t}が動き出したかと思うと、仕掛けの奥から細い触手が何本も這い出してきた。{a}が振り払うより先に、触手は{p}を撫で、脇腹から背筋、内腿へと、肌の薄いところばかりを選んで這い回った。{a}は身をよじったが、触手は少しも離れなかった。|{a}が{t}の仕掛けを叩き壊そうと踏み込んだ瞬間、床から伸びた蔓が両の手首に絡みついた。ぬめる蔓先が服の裾から潜り込み、胸の先をくすぐり、臍のくぼみをなぞり、内腿をゆっくりと撫で上げていく。{a}は唇を噛んで、熱を帯びていく体を睨みつけた。|{t}の仕掛けが{a}の胸元に吸いついた。柔らかな襞がひとりでにうごめき、胸の先を吸っては緩め、吸っては緩めをくり返す。小さな舌のようなものが首筋と耳の裏まで伸びて、羽のように撫でていった。{a}は仕掛けを引き剥がそうと掴んだが、指に力が入らなかった。|{t}から溢れた粘液が{a}の{p}を伝い、全身へ薄く広がっていった。粘液は肌の上で意思を持ったように蠢き、背中や脇腹、膝の裏まで、弱いところを探しては撫でていく。{a}は奥歯を噛みしめた。果てさせる気のない、焦らすだけの動きだった。')
},
mon:{
m:L('{t}は{a}の剣をかわし、懐に潜り込んで下衣の上から昂りを掴んだ。{a}が引き剥がそうとするほど、ぬめる指は根元から先端へと執拗に扱き上げてくる。挿れようとはしない。ただ、{a}が果てる寸前で手を緩め、また最初から扱き直すのをくり返した。|{t}の絡みつく腕が、{a}の両腕を背中にまとめて捻り上げた。身動きの取れない{a}の前に屈み込んだ{t}は、張りつめた{男性器}を舌で根元から舐め上げ、先端を唇で浅く含んでは離した。{a}は「離せ」と唸ったが、腰は勝手に前へ出ていた。|{t}は{a}を壁際に押し返すと、細い舌を何本も伸ばして、下衣の中の昂りに巻きつけた。一本は先端を、一本は裏側を、一本は根元をと、それぞれが違う速さで擦り立てる。{a}の膝が震えた。|{t}の吐いた甘い粘液を浴びて、{a}の昂りは一気に張りつめた。{t}はそこへ吸いつくように身を寄せ、熱を搾り出すように何度も締めつけては緩める。{a}は{t}を押しのけようとしたが、その手はいつの間にか、{t}の頭を引き寄せていた。|{t}は組み伏せ返そうとする{a}の手首を絡め取り、下腹にぬるりと身を擦りつけた。張りつめたものを擦り上げる動きは、果てさせるためではなく、焦らすためのものだった。寸前で止まるたびに、{a}の口から悔しげな息が漏れた。'),
f:L('{t}は{a}の剣をかわし、懐に潜り込んで服の上から胸の先をつまみ上げた。{a}が引き剥がそうとするほど、もう片方の手は脚の間へ滑り込み、敏感な芽を布越しに円を描いて撫で回す。中へは入ってこない。{a}が達しかけるたびに手を止め、また最初から撫で直した。|{t}の絡みつく腕が、{a}の両腕を背中にまとめて捻り上げた。{t}は{a}の胸元に顔を埋めて胸の先を舌で転がし、脚の間の小さな芽を指先で軽く弾いた。{a}は「離せ」と唸ったが、腰は勝手に前へ出ていた。|{t}は{a}を壁際に押し返すと、細い舌を何本も伸ばして、服の中へ潜り込ませた。一本は胸の先を、一本は脇腹を、一本は脚の間の芽をと、それぞれが違う速さで擦り立てる。{a}の膝が震えた。|{t}の吐いた甘い粘液を浴びて、{a}の肌は一気に火照った。{t}は濡れた指で花芯の周りをなぞり、触れる寸前で何度も逸らす。{a}は{t}を押しのけようとしたが、その手はいつの間にか、{t}の腕を掴んで引き寄せていた。'),
x:L('{t}は{a}の剣をかわし、懐に潜り込んで服の上から胸の先をつまみ上げた。{a}が引き剥がそうとするほど、もう片方の手は脇腹から背中、内腿へと這い回り、肌の弱いところを探り当てていく。{a}が息を詰めるたびに手を止め、また最初からなぞり直した。|{t}の絡みつく腕が、{a}の両腕を背中にまとめて捻り上げた。{t}は{a}の首筋に吸いつき、耳の裏を舌でなぞり、胸の先を指先で軽く弾いた。{a}は「離せ」と唸ったが、体は勝手に震えていた。|{t}は{a}を壁際に押し返すと、細い舌を何本も伸ばして、服の中へ潜り込ませた。一本は胸の先を、一本は脇腹を、一本は内腿をと、それぞれが違う速さで擦り立てる。{a}の膝が震えた。')
},
cap:{
m:L('檻の格子の隙間から、{t}の触手が何本も伸びてきた。眠りかけていた{a}の足首に絡みつき、腿を這い上がって、下衣の中の昂りを包み込む。{a}が目を覚ましたときには、触手はもう根元から先端までを、ぬめる体でゆっくりと扱き上げていた。|{t}の巣の見張りが、檻の中の{a}の前に吸精の器具を置いていった。器具は勝手に這い寄って{a}の腰に吸いつき、張りつめたものを包み込んで、果てる寸前まで吸い上げては止まる。{a}は器具を叩き壊したが、翌朝には新しいものが置かれていた。|檻の床に敷かれた苔が、夜になると柔らかく蠢き出した。横になった{a}の腰の下で、苔は昂りに絡みつき、焦らすように擦り続ける。{a}は苔を引きむしったが、むしってもむしっても、また生えてきた。'),
f:L('檻の格子の隙間から、{t}の触手が何本も伸びてきた。眠りかけていた{a}の足首に絡みつき、腿を這い上がって、胸の先と脚の間の芽を探り当てる。{a}が目を覚ましたときには、触手はもう、ぬめる先端で敏感なところばかりを撫で回していた。|{t}の巣の見張りが、檻の中の{a}の前に小さな器具を置いていった。器具は勝手に這い寄って{a}の胸元と脚の付け根に吸いつき、達する寸前まで小刻みに震えては止まる。{a}は器具を叩き壊したが、翌朝には新しいものが置かれていた。|檻の床に敷かれた苔が、夜になると柔らかく蠢き出した。横になった{a}の脚の間で、苔は花芯をくすぐるように擦り続ける。{a}は苔を引きむしったが、むしってもむしっても、また生えてきた。'),
x:L('檻の格子の隙間から、{t}の触手が何本も伸びてきた。眠りかけていた{a}の足首に絡みつき、腿を這い上がって、脇腹と胸の先を撫で回す。{a}が目を覚ましたときには、触手はもう、肌の弱いところばかりを探り当てていた。|{t}の巣の見張りが、檻の中の{a}の前に小さな器具を置いていった。器具は勝手に這い寄って{a}の胸元と首筋に吸いつき、肌が粟立つまで小刻みに震えては止まる。{a}は器具を叩き壊したが、翌朝には新しいものが置かれていた。|檻の床に敷かれた苔が、夜になると柔らかく蠢き出した。横になった{a}の背中と内腿を、苔は羽のようにくすぐり続ける。{a}は苔を引きむしったが、むしってもむしっても、また生えてきた。')
},
boss:{
m:L('{t}の放った無数の触手が、{a}の四肢に絡みついて宙に吊り上げた。{t}は笑いながら、張りつめた{a}の{男性器}に一本だけ触手を巻きつけ、果てる寸前まで扱いては止め、扱いては止めをくり返した。|{t}は{a}の剣を絡め取ると、その手で{a}の下衣を引き裂いた。露わになった昂りの根元を見えない輪で締めつけたまま、{t}は先端を指先でゆっくりと撫で回す。{a}は牙を剥くように唸ったが、{t}は余裕の笑みを崩さなかった。|{t}の吐息が{a}の下腹を撫でた瞬間、昂りが痛いほど張りつめた。{t}は触れもせずに、ただ息だけで先端をくすぐり続ける。{a}は{t}に掴みかかったが、その指先は熱に震えていた。'),
f:L('{t}の放った無数の触手が、{a}の四肢に絡みついて宙に吊り上げた。{t}は笑いながら、{a}の胸の先と脚の間の芽に一本ずつ触手を這わせ、達する寸前まで擦っては止め、擦っては止めをくり返した。|{t}は{a}の剣を絡め取ると、その手で{a}の服を引き裂いた。露わになった胸の先を指先で転がしながら、もう片方の指で花芯の周りをゆっくりとなぞる。{a}は牙を剥くように唸ったが、{t}は余裕の笑みを崩さなかった。|{t}の吐息が{a}の下腹を撫でた瞬間、脚の間がじんと疼いた。{t}は触れもせずに、ただ息だけで敏感なところをくすぐり続ける。{a}は{t}に掴みかかったが、その指先は熱に震えていた。'),
x:L('{t}の放った無数の触手が、{a}の四肢に絡みついて宙に吊り上げた。{t}は笑いながら、{a}の胸の先と脇腹、内腿に触手を這わせ、肌が粟立つまで撫でては止め、撫でては止めをくり返した。|{t}は{a}の剣を絡め取ると、その手で{a}の服を引き裂いた。露わになった胸の先を指先で転がしながら、もう片方の指で背筋をゆっくりとなぞり下ろす。{a}は牙を剥くように唸ったが、{t}は余裕の笑みを崩さなかった。|{t}の吐息が{a}の首筋を撫でた瞬間、全身の肌が粟立った。{t}は触れもせずに、ただ息だけで耳の裏や鎖骨をくすぐり続ける。{a}は{t}に掴みかかったが、その指先は熱に震えていた。')
},
lines:{
holdEscape:L('絡みつくものを力ずくで引きちぎった。|仕掛けの根元を踏み砕いて、ようやく抜け出した。|刃を突き立てて、絡みつくものを断ち切った。|渾身の力で振りほどき、床を転がって距離を取った。'),
edge:L('{a}の昂りは限界まで張りつめた。けれど寸止めの呪いが、最後の一線を越えさせない。|あと一歩のところで、呪いが{a}の熱をせき止めた。{a}は低く唸って、壁に拳を打ちつけた。|呪いの紋が光り、果てる寸前の熱は、そのまま{a}の体の芯に押し戻された。|昇りつめる寸前で、熱がふっと引いていった。{a}は舌打ちして、荒い息を吐いた。|{a}は果てる寸前で止められた熱を持て余し、歯を食いしばって前を睨んだ。|波が弾ける直前に、呪いの紋が疼いた。{a}は悔しげに息を呑み、震える手で武器を握り直した。|{a}の熱は頂の手前でせき止められた。{a}は床を蹴りつけて、行き場のない昂りを睨んだ。|あと一息のところで、紋が冷たく光った。{a}は喉の奥で唸り、乱れた息を無理やり整えた。|呪いに熱を取り上げられて、{a}は苛立たしげに髪をかき上げた。体の芯だけが、いつまでも燃えていた。'),
holdRelease:L('絡みついていたものがようやく離れたときには、膝が笑っていた。|散々焦らされたあとで、ようやく床に下ろされた。|解き放たれても、張りつめた熱だけは引かなかった。|最後まで振りほどけないまま、相手が飽きるのを待つしかなかった。')
},
cbody:{
m:L('焦らし続けた動きが不意に速まり、こらえていた熱が根元からせり上がった。|根元を締めつけていた輪が、ふっと緩んだ。張りつめた{男性器}が大きく跳ね、びくびくと脈打った。|先端ばかりを撫でていたものが、最後に根元からきつく巻きついて扱き上げた。|何度も寸前で止められた昂りが、とうとう抑えきれなくなった。'),
f:L('焦らし続けた動きが不意に速まり、胸の先と花芯を同時に擦り上げた。|脚の間の芽をつまんでいたものが小刻みに震え出し、甘い痺れが背筋を駆け上がった。|何度も寸前で止められていた疼きが、とうとう抑えきれなくなった。'),
x:L('肌の上を這い回っていたものが一斉に動きを速め、全身の産毛が逆立った。|胸の先を吸っていたものがきつく吸い上げた瞬間、痺れるような波が背筋を駆け上がった。|何度も寸前で止められていた熱が、とうとう抑えきれなくなった。')
},
climax:{
proud:L('{a}は果てながらも、最後まで目の前の相手を睨みつけていた。「……覚えてろ」|{a}は奥歯を噛み砕きそうなほど食いしばり、震えながら達した。こんなもので、と吐き捨てる声が掠れていた。|{a}は屈辱に顔を歪めたまま果てた。それでも膝だけは、床につけなかった。'),
stern:L('{a}は短く息を詰め、背筋を伸ばしたまま達した。乱れた呼吸を、一つずつ数えて整え直した。|{a}は「動じるな」と己に命じたが、体はその命令を聞かなかった。深く、長く果てた。|{a}は目を閉じて果てた。開いたときには、もう顔色ひとつ変えていなかった。ただ、拳だけが震えていた。'),
tsun:L('{a}は「べ、別に感じてないし」と言い切る前に、腰を跳ねさせて果てた。|{a}は真っ赤な顔で身をよじりながら達した。「今のは、なし。ぜったい、なし」|{a}は果てたあと、「……今の、誰にも言うなよ」と、誰もいない通路に向かって呟いた。'),
gentle:L('{a}は困ったように眉を下げたまま、ふっと力を抜いて果てた。「……こういうのは、困ったな」|{a}は自分の胸に手を当て、柔らかく長い波が過ぎるのを待った。果てたあとも、頬の赤みは引かなかった。|{a}は小さく首を振りながら、それでも穏やかな顔のまま、ゆっくりと達した。'),
devoted:L('{a}は「だめ、こんなの」と何度も首を振りながら、こらえきれずに果てた。|{a}は待っている人の顔を思い浮かべて耐えようとした。けれど最後の波は、その顔ごと押し流していった。|{a}は果てたあと、ぎゅっと自分の肩を抱いた。「……ごめん」と誰にともなく謝った。'),
cool:L('{a}は無表情のまま、指先だけを震わせて達した。「……想定外だ」|{a}は果てる瞬間も目を開けたまま、自分の反応を数えていた。数えきれなかった。|{a}は短く息を吐いて果て、すぐに呼吸を整えた。ただ、耳の先だけが赤かった。'),
free:L('{a}は「ちょ、それずるい」と笑い混じりに叫んで、思いきり果てた。|{a}は果てたあと、「焦らすだけで、ここまで？」と呆れたように笑った。|{a}は抗うのをやめて、むしろ面白がるように熱へ身を任せて果てた。'),
shy:L('{a}は両手で顔を覆ったまま、声を殺して果てた。耳まで真っ赤だった。|{a}は「み、見るな……っ」と誰もいない闇に向かって言いながら、小さく震えて達した。|{a}は果てたあと、膝を抱えて縮こまり、しばらく顔を上げられなかった。'),
polite:L('{a}は「失礼……っ」と小さく詫びながら、品よく整えていた姿勢を崩して果てた。|{a}は乱れる息の合間にも言葉遣いを保とうとして、最後の波にそれを奪われた。|{a}は果てたあと、乱れた身なりを黙って整え直した。指先がまだ震えていた。')
},
ero:{
proud:L('{s:wet}。{a}「{m2}」――{a}は悪態をつく口のまま、腰をがくがくと震わせて果てた。|{a}「{m2}」――{a}は睨みつける目だけは逸らさずに、びくびくと体を跳ねさせた。{s:wet}。'),
stern:L('{s:wet}。{a}「{m2}」――{a}の律していた呼吸が、一息に崩れた。|{a}「{m2}」――{a}は背筋を反らし、こらえていた声を初めて漏らして果てた。{s:wet}。'),
tsun:L('{s:wet}。{a}「{m2}」――{a}は「ちがう、ちがうから」と首を振りながら、腰を跳ねさせた。|{a}「{m2}」――{a}は真っ赤な顔をくしゃくしゃにして、何度も体を震わせた。{s:wet}。'),
gentle:L('{s:wet}。{a}「{m2}」――{a}は困った笑みのまま、とろけた声を漏らして果てた。|{a}「{m2}」――{a}は自分の口を押さえようとして間に合わず、甘い声ごと果てた。{s:wet}。'),
devoted:L('{s:wet}。{a}「{m2}」――{a}は涙目で首を振りながら、こらえきれずにびくびくと果てた。|{a}「{m2}」――{a}は誰かの名前を呼びかけて、その声ごと甘く崩れた。{s:wet}。'),
cool:L('{s:wet}。{a}「{m2}」――{a}の整った顔が、初めてはっきりと崩れた。|{a}「{m2}」――{a}は数えることをやめて、ただ体の震えに呑まれた。{s:wet}。'),
free:L('{s:wet}。{a}「{m2}」――{a}は笑い混じりの声を上げて、思いきり腰を跳ねさせた。|{a}「{m2}」――{a}は「もっと」と言いかけて、自分の口を塞いだ。{s:wet}。'),
shy:L('{s:wet}。{a}「{m2}」――{a}は顔を覆った指の隙間から、とろけた声をこぼして果てた。|{a}「{m2}」――{a}は小さく縮こまったまま、何度もびくびくと震えた。{s:wet}。'),
polite:L('{s:wet}。{a}「{m2}」――{a}の丁寧な言葉遣いは、とうとう意味をなさなくなった。|{a}「{m2}」――{a}は詫びる言葉も言い終えられずに、甘い声と一緒に果てた。{s:wet}。')
},
build:{
m:L('{a}は絡みつくものを引き剥がそうと何度も腕に力を込めた。そのたびに根元をきゅっと締めつけられ、先端をぬるりと撫で回されて、力が抜けていく。挿れてくるわけでもない、果てさせてくれるわけでもない。ただ張りつめたものだけを、執拗に弄り続ける動きだった。|下衣の中で、昂りはもう痛いほど張りつめていた。絡みつくものは先端から滲んだ雫を塗り広げるように、裏側を何度もなぞり上げる。{a}は奥歯を噛みしめて耐えた。耐えるほど、腰の奥に熱が溜まっていった。|{a}の息は、もう怒りでは整えられなくなっていた。根元から先へ、先から根元へ、ゆっくりと扱き上げる動きが、少しずつ速くなっていく。寸前で止まるたびに、{a}は低く唸った。'),
f:L('{a}は絡みつくものを引き剥がそうと何度も腕に力を込めた。そのたびに胸の先をきゅっと吸われ、脚の間の芽をぬるりと撫でられて、力が抜けていく。中へ入ってくるわけでもない、果てさせてくれるわけでもない。ただ表面の敏感なところだけを、執拗に弄り続ける動きだった。|脚の間は、もうじっとりと熱を帯びていた。絡みつくものは小さな芽の周りを円を描くようになぞり、触れる寸前で離れていく。{a}は唇を噛んで耐えた。耐えるほど、下腹の奥に熱が溜まっていった。|{a}の息は、もう怒りでは整えられなくなっていた。胸の先を吸う動きと、芽を擦る動きが、少しずつ速くなっていく。寸前で止まるたびに、{a}は低く唸った。'),
x:L('{a}は絡みつくものを引き剥がそうと何度も腕に力を込めた。そのたびに脇腹や内腿をぬるりと撫でられて、力が抜けていく。果てさせてくれるわけでもない。ただ肌の弱いところだけを、執拗に探り続ける動きだった。|肌のあちこちが、もうじんじんと熱を帯びていた。絡みつくものは胸の先から臍へ、臍から内腿へと、同じ道を何度もなぞっていく。{a}は唇を噛んで耐えた。耐えるほど、体の芯に熱が溜まっていった。|{a}の息は、もう怒りでは整えられなくなっていた。首筋を吸う動きと、背筋をなぞる動きが、少しずつ速くなっていく。寸前で止まるたびに、{a}は低く唸った。')
},
again:{
m:L('果てたばかりの昂りを、絡みつくものは少しも休ませなかった。敏感になりきった先端を同じ速さで撫でられ続けて、{a}は唸るような声を漏らし、二度目の熱を吐き出した。|一度吐き出しても、根元に巻きついたものは緩まなかった。萎える暇も与えずにまた扱き上げられて、{a}は壁に額を押しつけたまま、もう一度果てた。'),
f:L('果てたばかりの体を、絡みつくものは少しも休ませなかった。敏感になりきった芽を同じ速さで擦られ続けて、{a}は唸るような声を漏らし、二度目の波に攫われた。|一度果てても、胸の先に吸いついたものは離れなかった。息を整える暇もなく、また脚の間を撫で上げられて、{a}は壁に額を押しつけたまま、もう一度達した。'),
x:L('果てたばかりの体を、絡みつくものは少しも休ませなかった。敏感になりきった肌を同じ速さで撫でられ続けて、{a}は唸るような声を漏らし、二度目の波に攫われた。|一度果てても、肌に吸いついたものは離れなかった。息を整える暇もなく、また背筋をなぞり上げられて、{a}は壁に額を押しつけたまま、もう一度達した。')
}
};
var W=DG.TOPWATCH={
watch:{
proud:{cold:L('{a}は{ev}に捕まった{b}から目を逸らそうとして、逸らせなかった。「……みっともない」吐き捨てた声が、自分でも分かるほど掠れていた。|{a}は腕を組んだまま、{b}が乱れていく様子を見下ろしていた。助けに入るべきなのは分かっている。なのに、足が動かなかった。'),hot:L('{a}は{b}の蕩けた顔を見据えて、口の端を吊り上げた。「いい声を出すじゃないか」――下腹の熱は、もう隠しようがなかった。|{a}は{b}が乱れていくのを、まばたきもせずに見ていた。次にあの顔をさせるのは自分だと、体のほうが先に決めていた。')},
stern:{cold:L('{a}は背筋を伸ばしたまま、{b}から視線を外そうとした。外せなかった。乱れる声が耳に届くたび、握った拳に力がこもった。|{a}は「見るな」と己に命じた。それでも視界の端で、{b}の肌が跳ねるのが分かった。'),hot:L('{a}の呼吸は、もう律しきれていなかった。{b}が果てる瞬間を、{a}は瞬きひとつせずに見届けていた。|{a}は目を閉じて深く息を吸った。開いた目は、まっすぐ{b}だけを見ていた。')},
tsun:{cold:L('{a}は「べ、別に見てないし」とそっぽを向いた。その横目は、{b}から一瞬も離れていなかった。|{a}は真っ赤な顔で「早く抜け出せってば」と怒鳴った。声が上ずったのは、怒っているからではなかった。'),hot:L('{a}は「見てない」と三回言った。三回とも、{b}の乱れた姿から目を離さないまま言った。|{a}は唇を尖らせて{b}を睨んでいた。その顔が、羨ましそうにも、物欲しそうにも見えた。')},
gentle:{cold:L('{a}は「大丈夫、大丈夫だから」と{b}に声をかけながら、自分の胸の鼓動がうるさいことに気づいていた。|{a}は{b}を案じる顔のまま、{b}の上げる甘い声に、喉を小さく鳴らした。'),hot:L('{a}は穏やかな笑みを浮かべたまま、{b}の蕩けた顔をじっと見つめていた。その目の奥だけが、静かに熱を帯びていた。|{a}は{b}の名前を優しく呼んだ。慰めるはずの声が、どこか甘くなっていた。')},
devoted:{cold:L('{a}は{b}を助けたい一心で手を伸ばしかけて、止まった。{b}の上げた声が、助けを求める声には聞こえなかった。|{a}は胸の前で両手を握りしめ、{b}から目を離せずにいた。「ごめん」と小さく呟いたのは、見てしまっている自分への言葉だった。'),hot:L('{a}は{b}の乱れる姿を見ているうちに、自分の手が震えているのに気づいた。触れたい、と思ってしまった。|{a}は「{b}が苦しいなら」と言い訳を探していた。本当に探していたのは、{b}に触れる理由だった。')},
cool:{cold:L('{a}は表情を変えずに{b}を見ていた。冷静を装う顔の下で、鼓動だけが速くなっていた。|{a}は「罠の性質を見ているだけだ」と自分に言い聞かせた。視線は罠ではなく、{b}の肌を追っていた。'),hot:L('{a}は{b}の反応を、一つ残らず目で追っていた。どこをどうされると声が上がるのか、もう頭の中に書き留め終えていた。|{a}は額の汗を指で払った。冷静を装うには、もう体が熱すぎた。')},
free:{cold:L('{a}は「うわ、すご」と思わず声を漏らし、慌てて口を押さえた。それでも{b}から目が離せなかった。|{a}は{b}の乱れた姿を見て、「助けたほうがいい？　それとも、見てたほうがいい？」と半分本気で訊いた。'),hot:L('{a}は{b}に向かって「いい顔してる」と笑いかけた。冗談めかした声とは裏腹に、目はまったく笑っていなかった。|{a}は{b}が果てるのを見届けて、ぺろりと唇を舐めた。「次は、こっちの番かな」')},
shy:{cold:L('{a}は両手で顔を覆った。指の隙間から、どうしても{b}が見えてしまう。|{a}は耳まで真っ赤にして俯いた。{b}の声が聞こえるたびに、肩がびくりと跳ねた。'),hot:L('{a}は顔を覆うのをやめていた。真っ赤な顔のまま、{b}の乱れる姿をじっと見つめていた。|{a}は{b}から目を逸らせなくなっていた。見ているだけなのに、自分の息まで上がっていた。')},
polite:{cold:L('{a}は「失礼」と目を伏せた。伏せた目が、気づけば{b}の震える指先を追っていた。|{a}は{b}に背を向けて、見ないのが礼儀だと自分に言い聞かせた。聞こえる声までは、どうしようもなかった。'),hot:L('{a}は穏やかな声で「お辛そうですね」と{b}に言った。その目は、{b}の乱れた姿を少しも見逃していなかった。|{a}は乱れかけた襟元を、ゆっくりと整え直した。整えた指先が、熱を持っていた。')}
},
watchAny:{
cold:L('{a}は{b}から目を逸らそうとした。けれど、乱れる息づかいが耳に残って離れなかった。|{a}は黙って{b}を見ていた。握りしめた拳の中で、爪が手のひらに食い込んでいた。|{a}は助けに入る間合いを測るふりをして、{b}の姿を目で追い続けていた。|{a}の喉が、小さく鳴った。{b}の上げる声が、思っていたよりずっと甘かった。|{a}は一歩踏み出しかけて、止まった。{b}の頬の赤みから、目が離せなかった。|{a}は壁にもたれて、{b}が罠に翻弄されるのを見ていた。体の奥に、覚えのない熱が灯り始めていた。'),
hot:L('{a}は{b}の乱れる姿を、もう隠れもせずに見つめていた。下腹に溜まる熱が、少しずつ形を持ち始めていた。|{a}は{b}の声が上ずるたびに、自分の呼吸も浅くなるのを感じていた。|{a}の目は、{b}の震える肌を一つ残らず追っていた。次にあの声を上げさせるのが誰なのか、もう決まっている気がした。|{a}は乾いた唇を舐めた。{b}の蕩けた顔が、まぶたの裏に焼きついていく。|{a}は{b}から目を離さないまま、ゆっくりと息を吐いた。吐いた息まで熱かった。|{a}は助けに入るのをやめていた。ただ、{b}が乱れきるのを見届けたかった。')
},
pair:L('{a}は岩陰から漏れる{b}の声に足を止め、引き返すこともできずに立ち尽くしていた。|{a}は見張りに立つふりをして、背後の気配に耳を澄ませていた。{b}の乱れた息が聞こえるたび、握った武器の柄が汗で滑った。|{a}は焚き火の向こうで重なる影から、目を逸らせなかった。影の片方が{b}だと分かっていても、いや、分かっているからこそ。|{a}は寝たふりをしたまま、{b}の上げる声を聞いていた。毛布の下で、体だけが正直に熱くなっていった。'),
reach:{
dom:L('仲間の乱れる姿を見せつけられ続けて、{a}の理性の糸がぷつりと切れた。小休止の合図が出るなり、{a}は{b}の手首を掴んで岩陰へ引き込んだ。{a}「……ずっと見せられてたんだ。もう、我慢がきかない」|{a}は野営の火の向こうから、黙って{b}を見ていた。罠に乱される{b}の姿が、目に焼きついて離れない。やがて{a}は立ち上がり、{b}の前に膝をついた。{a}「{b}。こっちを見て」|{a}は{b}の背後に立ち、首筋に熱い息を落とした。{a}「さっきの顔、まだ覚えてる。……あれを、こっちにも見せて」'),
soft:L('{a}は何度も、自分に言い聞かせてきた。仲間を、そういう目で見てはいけない。けれど罠に乱れる{b}の声を聞きすぎた。{a}はそっと{b}の袖を引いた。{a}「……ごめん。少しだけ、触れてもいい？」|野営の火が小さくなった頃、{a}は{b}の隣に腰を下ろした。肩が触れる。{a}の指が、ためらいがちに{b}の手の甲をなぞった。{a}「ずっと、見てた。……見てるだけじゃ、もう、無理みたい」|{a}は{b}の乱れた外套を直してやろうとして、その手を止められなくなった。指先が{b}の首筋に触れ、鎖骨へと滑り落ちていく。{a}「嫌なら、言って。すぐにやめるから」'),
play:L('{a}は{b}の前にしゃがみ込んで、悪戯っぽく笑った。{a}「さっきの、すごかったね。……ねえ、続き、しない？」笑顔の奥の目は、少しも笑っていなかった。|{a}は「べ、別に見てたわけじゃない」と言いながら、{b}の隣に座り込んだ。その手が、{b}の腿の上に置かれたまま動かなかった。{a}「……ちょっとだけ。ちょっとだけだから」|{a}は{b}の外套の端を指でつまんで、くいと引いた。{a}「見せつけられっぱなしは、ずるいと思う」――冗談めかした声が、熱で掠れていた。')
},
holdPre:L('仲間の乱れる姿を見せつけられ続けて、{a}の体の熱は、もう罠のせいだけにはできなくなっていた。|{a}の目は、気づけばいつも{b}を追っていた。罠に乱される{b}の声が、耳の奥から離れない。|野営の火が小さくなった頃、{a}は眠れずに、{b}の寝顔をじっと見つめていた。'),
hold:L('{a}は{b}に伸ばしかけた手を、寸前で握りしめた。爪が掌に食い込む。{a}「……悪い。なんでもない」{a}は背を向け、冷たい壁に額を押しつけて、熱が引くのを待った。|{a}は{b}の肩に触れる寸前で、自分の手首を自分で掴んだ。{a}「だめだ。これは、迷宮のせいだ」――言い聞かせる声が震えていた。|{a}は{b}の隣に座りかけて、やめた。少し離れた岩に腰を下ろし、水筒の水を頭から浴びた。{b}が怪訝そうに振り返ったが、{a}は何も言わなかった。|{a}は{b}の名前を呼びかけて、口をつぐんだ。見ていたことを知られたくなかった。それ以上に、見ていた自分が何をしようとしていたのかを、知られたくなかった。'),
resp:{
proud:{refuse:L('{b}は{a}の手を払いのけた。{b}「見くびるな。罠に負けたからって、仲間にまで好きにさせると思うか」|{b}は{a}の胸を突き飛ばし、鋭く睨みつけた。{b}「頭を冷やせ。それとも、冷やしてやろうか」'),swept:L('{b}は「……勘違いするな。今だけだ」と吐き捨てて、{a}の手を振りほどかなかった。|{b}は顔を背けたまま、{a}の指が肌をなぞるのを止めなかった。{b}「好きにしろ。……どうせ、熱が引かない」'),accept:L('{b}は鼻で笑って、自分から{a}の襟を掴んで引き寄せた。{b}「遅い。見てるだけかと思った」|{b}は挑むように{a}を見上げた。{b}「いいだろう。そのかわり、半端なことはするな」')},
stern:{refuse:L('{b}は{a}の手首を掴み、静かに押し戻した。{b}「ここは迷宮だ。正気に戻れ」|{b}は一歩引いて、{a}との間に剣の鞘を差し入れた。{b}「その熱は、迷宮のものだ。{a}のものじゃない」'),swept:L('{b}は長い沈黙のあと、目を伏せた。{b}「……一度だけだ。それで熱を鎮めろ」|{b}は拒む言葉を探したが、見つからなかった。乱れた呼吸のまま、{b}は{a}の背に手を回した。'),accept:L('{b}は姿勢を正したまま、まっすぐ{a}を見返した。{b}「分かった。……こちらも、限界だった」|{b}は短く頷き、自分から外套の留め具を外した。')},
tsun:{refuse:L('{b}は{a}の手をぺしりと叩いた。{b}「ば、ばか！　こんなときに何考えてるの」|{b}は真っ赤な顔で{a}を押し返した。{b}「ぜ、絶対だめ。罠のせいにしないで」'),swept:L('{b}は「べ、別に、したいわけじゃないから」と言いながら、{a}の袖を握って離さなかった。|{b}は顔を背けて黙り込んだ。払いのけない手が、答えの代わりだった。'),accept:L('{b}は「……遅いんだけど」と小さく呟いて、{a}の胸に額を押しつけた。|{b}は真っ赤な顔で{a}を睨んでから、自分から唇を重ねてきた。')},
gentle:{refuse:L('{b}は{a}の手をそっと包み込んで、首を横に振った。{b}「今は、だめ。熱が引くまで、隣にいるから」|{b}は{a}の髪を撫でながら、やわらかく体を離した。{b}「こんな形じゃ、きっと後悔する」'),swept:L('{b}は困ったように微笑んで、{a}の手を拒まなかった。{b}「……仕方ないなあ」|{b}は小さく息をついて、{a}の頬に手を添えた。{b}「優しく、してね」'),accept:L('{b}は穏やかに笑って、{a}を抱き寄せた。{b}「いいよ。……おいで」|{b}は{a}の手を取って、自分の胸元へ導いた。{b}「同じこと、考えてた」')},
devoted:{refuse:L('{b}は泣きそうな顔で{a}の手を押し戻した。{b}「ごめんなさい。今は、地上に帰ることだけ考えたい」|{b}は{a}の手を両手で握って、そっと膝の上に戻した。{b}「{a}を、こんな迷宮のせいで変えたくない」'),swept:L('{b}は戸惑いながらも、{a}を拒みきれなかった。{b}「{a}が楽になるなら……」|{b}はぎゅっと目をつむって、{a}の胸に身を預けた。'),accept:L('{b}は潤んだ目で{a}を見上げた。{b}「……触れてほしいって、思ってた」|{b}は{a}の手に頬をすり寄せた。{b}「全部、受け止めるから」')},
cool:{refuse:L('{b}は{a}の手首を掴んで止めた。{b}「迷宮の媚薬の作用だ。判断が鈍っている」|{b}は表情を変えずに、{a}を押しやった。{b}「後で後悔するのが分かりきっている選択は、しない」'),swept:L('{b}は「合理的じゃない」と呟いたが、{a}の手を払いはしなかった。|{b}はしばらく黙って{a}を見ていた。{b}「……熱を逃がすには、これが早いか」'),accept:L('{b}は小さく息を吐いて、眼差しだけで頷いた。{b}「同意する。……正直、こちらも限界だ」|{b}は自分から{a}の手を取った。{b}「どこを触ればいいか、もう分かっているんだろう」')},
free:{refuse:L('{b}は{a}の額をぺちんと叩いて笑った。{b}「だーめ。今それやったら、帰り道で絶対気まずいって」|{b}は{a}の手をひょいとかわした。{b}「迷宮の思うつぼじゃん。地上に戻ってから誘って」'),swept:L('{b}は「えー、どうしよっかな」と笑いながら、結局{a}の手を払わなかった。|{b}は肩をすくめた。{b}「ま、いっか。熱いのは、お互いさまだし」'),accept:L('{b}は目を輝かせて{a}に飛びついた。{b}「待ってた！」|{b}は楽しそうに{a}の首に腕を回した。{b}「見てたんでしょ。じゃあ、今度は一緒に」')},
shy:{refuse:L('{b}は真っ赤な顔で首を振り、膝を抱えて縮こまった。{b}「む、無理……っ。見られてたなんて、それだけで……」|{b}は{a}の手から逃れるように、外套を頭まで被った。{b}「ご、ごめん。今は、だめ」'),swept:L('{b}は耳まで赤くして俯いた。それでも、{a}の手から逃げはしなかった。|{b}は消え入りそうな声で「……少しだけ、なら」と答えた。'),accept:L('{b}は恥ずかしそうに目を伏せて、こくりと頷いた。|{b}は震える指で、{a}の袖をそっと掴んだ。{b}「……やさしく、して」')},
polite:{refuse:L('{b}は{a}の手を丁寧に、けれどはっきりと押し戻した。{b}「お気持ちはありがたく。ですが、今はご遠慮します」|{b}は静かに一歩下がり、深く頭を下げた。{b}「どうか、正気にお戻りください」'),swept:L('{b}は「……困りましたね」と微笑んで、{a}の手を拒まなかった。|{b}は目を伏せて、小さく頷いた。{b}「一度だけ、ということでしたら」'),accept:L('{b}は{a}の手を取り、恭しく自分の頬に添えた。{b}「お待ちしておりました」|{b}は乱れた襟元をそっと開いた。{b}「どうぞ、お好きなように」')}
},
back:L('{a}は伸ばした手を下ろし、「……ごめん」とだけ呟いた。熱は引かなかったが、それ以上は踏み込まなかった。|{a}はしばらく黙って立ち尽くしてから、背を向けた。拳を握る音だけが、やけに大きく響いた。|{a}は苦い顔で頷き、焚き火の反対側に腰を下ろした。その夜、{a}は一度も{b}のほうを見なかった。'),
push:L('{a}は拒む{b}の手首をまとめて掴み、壁に押しつけた。{a}「ごめん。止まれない」――罠に灼かれた目は、もう仲間を見る目ではなかった。|{a}は{b}の抗う声を唇で塞いだ。押し返す手から、少しずつ力が抜けていく。|{b}は身をよじって逃れようとしたが、迷宮の熱に浸された体は思うように動かなかった。{a}はその体を外套の上に横たえた。'),
fadeP:L('{a}は拒む{b}を離さなかった。そのあとのことを、二人は一言も話さなかった。|岩陰から戻ってきた{b}は、{a}のほうを一度も見なかった。何があったのかを訊ける者は、誰もいなかった。'),
after:{
love:L('果てたあと、{b}は{a}の胸に額を預けたまま動かなかった。{a}「……ずっと、見てたんだ」{b}「知ってた」二人は外套にくるまって、少しだけ笑った。|熱が引いたあとも、{a}は{b}の手を離さなかった。見ているだけだった頃より、ずっと近くに{b}がいた。|{b}は{a}の髪を指で梳きながら、「次は、見てるだけじゃなくていい」と囁いた。'),
cool:L('熱が引くと、{a}は気まずそうに衣を整えた。{a}「……迷宮のせいにしていいかな」{b}「そうしておく」|果てたあと、二人は背中合わせに座った。{a}の熱はようやく引き、代わりに、見ていたことを知られた気恥ずかしさが残った。|{b}は乱れた髪をかき上げて、{a}を横目で見た。{b}「見てるだけで、そんなに溜まってたんだ」{a}は答えずに、そっぽを向いた。'),
push:L('熱が引くと、{a}は自分のしたことに気づいて青ざめた。{b}は乱れた衣を掻き合わせ、{a}を見ないまま「……二度と、しないで」とだけ言った。|果てたあと、{b}は{a}の頬を一度だけ強く張った。{a}は避けなかった。二人はそれから、次の階に着くまで一言も口をきかなかった。|{b}は膝を抱えて黙り込んだ。{a}は謝る言葉を何度も探したが、どれも口に出せないまま、松明の火だけが揺れていた。')
},
join:{
intro:L('{ev}に捕まった{u}の声が、通路に響いていた。その声に誘われるように、床の裂け目から何本もの触手が這い出し、{u}の手足に絡みついていく。助けに入るはずだった{t}の足は、{u}の前で止まった。見せつけられ続けた熱が、とうとう{t}の理性を焼き切った。|{t}が駆けつけたとき、{u}は{ev}にまとわりつかれ、壁から伸びた触手に四肢を絡め取られていた。{t}は触手を断ち切ろうと刃を構え――そして、構えたまま動けなくなった。{u}「{t}……っ」名前を呼ぶ声が、助けを求めているのか、別の何かを求めているのか、{t}にはもう分からなかった。|{ev}に乱された{u}を、壁から伸びた触手が宙へ吊り上げた。{t}は{u}を助けようと手を伸ばした。その手は触手ではなく、{u}の火照った頬に触れていた。触手がぬるりと動いて、{u}の体を{t}のほうへ差し出すように傾ける。まるで、迷宮が{t}を誘っているようだった。|{ev}の熱に浮かされた{u}を、床から這い出した触手がしっかりと捕らえていた。触手は{t}の気配に気づくと、逃げるでもなく、{u}の脚を割り開いたまま、獲物を差し出すようにじっと待っている。{t}は喉を鳴らした。{t}「……そういうことか」'),
caught:L('{ev}は二人を同時に絡め取った。{t}の背にも{u}の腰にも、ぬめる触手が幾重にも巻きついていく。抗おうともがくうちに、二人の体は向かい合わせに引き寄せられ、肌と肌が重なった。{t}は背を這い回る触手の熱に耐えながら、目の前の{u}を見つめた。|気づけば、{t}と{u}は同じ触手の網に絡め取られ、並んで吊られていた。触手は二人の服を器用に剥ぎ取り、火照った体を押しつけ合わせる。{t}の胸に、{u}の熱い息がかかった。{t}「……{u}。もう、我慢できない」|{ev}の粘液を浴びた二人は、もう立っていられなかった。触手に絡まれたまま床に崩れ落ち、{t}は自分の体を這い回る触手の熱に耐えながら、{u}の体を抱き寄せた。'),
welcome:L('{u}は触手に絡まれた手を、それでも{t}のほうへ伸ばした。潤んだ目が、まっすぐ{t}を見ていた。{u}「{t}……来て」|{u}は小さく頷いた。{u}「……いい。{t}なら、いい」|{u}は熱に浮かされた顔で、{t}の名前を呼んだ。拒む響きは、どこにもなかった。'),
unwilling:L('{u}は首を振った。{u}「だめ、{t}まで……っ」けれど触手に縛られた体では、拒むことさえままならなかった。|{u}「やめ……っ、{t}、正気に……」懇願する声は、触手の動きにかき消された。'),
act:{
mf:L('触手が{u}の両脚を左右から抱え上げ、濡れそぼった{女性器}を{t}の前にさらけ出した。{t}は迷わず腰を進め、張りつめた{男性器}を根元まで沈めた。{u}「{vb1}」突き上げるたびに、胸に吸いついた触手がきゅうっと先を吸い上げ、{u}の中がきつく締まる。{t}「{vt}」|{t}は宙に吊られた{u}を背後から抱きすくめ、熱く濡れた奥へ一息に貫いた。触手は{u}の胸を揉みしだき、花芯にまで細い先を這わせて、{t}の動きに合わせて擦り立てる。{u}「{vb1}」前からも後ろからも責め立てられて、{u}の腰はがくがくと震え続けた。|触手が{u}の腰を持ち上げ、{t}の{男性器}の上へゆっくりと下ろしていく。自分の重みで深く呑み込まされて、{u}は声にならない息を漏らした。{u}「{vb1}」{t}が下から突き上げるのに合わせて、触手は{u}の胸の先と花芯を同時にねぶり回した。{t}「{vt}」'),
ff:L('触手が{u}の両脚を左右から抱え上げ、とろとろに濡れたところを{t}の前にさらけ出した。{t}は{u}の脚の間に顔を寄せ、花芯を舌で転がしながら、二本の指を中へ沈めた。{u}「{vb1}」胸に吸いついた触手がきゅうっと先を吸い上げるたびに、{u}の中が指をきつく締めつける。{t}「{vt}」|{t}は宙に吊られた{u}を背後から抱きすくめ、濡れた花芯を指の腹で押し撫でた。触手は{u}の胸を揉みしだき、別の細い先が、指に寄り添うように{u}の中を探っていく。{u}「{vb1}」内と外から同時に責め立てられて、{u}の腰はがくがくと震え続けた。|触手に床へ押さえつけられた{u}の上に、{t}が覆いかぶさって唇を重ねた。舌を絡めながら、指先で{u}の弱いところを探り当てる。{u}「{vb1}」触手が{u}の脚を閉じさせまいと押さえつけ、{t}の指が奥の柔らかなところをくり返し擦り上げた。{t}「{vt}」'),
fm:L('触手が{u}の両腕を頭の上でまとめ上げ、仰向けに床へ縫いとめた。{t}はその腰に跨がり、触手に扱かれて張りつめた{u}の{男性器}を、自分の濡れた入り口へ導いた。{u}「{vb1}」{t}がゆっくりと腰を沈めると、胸の先を吸っていた触手までが動きを速めた。{t}「{vt}」|{t}は宙に吊るされた{u}の前に立ち、張りつめた{男性器}を手のひらで包み込んだ。触手が{u}の後ろを撫で、胸を吸い、{t}の手が根元から先へと扱き上げる。{u}「{vb1}」限界が近づくと、{t}はそれを自分の中へ迎え入れ、きつく締めつけた。{t}「{vt}」|触手に手足を絡め取られた{u}の胸に、{t}が手をついた。{t}は上から腰を落とし、{u}の昂りを根元まで呑み込んだまま、前後にゆっくりと揺らす。そのたびに、背後から{u}に絡みついた触手もぬるぬると蠢いた。{u}「{vb1}」{t}「{vt}」'),
mm:L('触手が{u}を四つん這いに押さえつけ、腰だけを高く持ち上げた。{t}は粘液でぬめる{u}の後ろに張りつめた{男性器}をあてがい、ゆっくりと根元まで沈めた。{u}「{vb1}」前に回った触手が{u}の昂りに巻きつき、{t}の動きに合わせて扱き上げる。{t}「{vt}」|{t}は宙に吊られた{u}を背後から抱きすくめ、ほぐれきった後ろへ一息に貫いた。触手は{u}の胸の先を吸い、張りつめた昂りを根元から搾り上げる。{u}「{vb1}」前と後ろを同時に責め立てられて、{u}は{t}の腕の中で何度も背を反らした。|触手が{u}の脚を大きく開かせ、{t}の腰の上へ下ろしていく。自分の重みで深く呑み込まされて、{u}は喉を反らした。{u}「{vb1}」{t}が下から突き上げるたびに、触手が{u}の{男性器}を扱き上げ、先端を細い先でくすぐった。{t}「{vt}」'),
oral_m:L('触手が{u}の手足を絡め取り、膝立ちのまま{t}の前に差し出した。{t}は{u}の髪を撫で、熱く硬くなったものを唇に押し当てる。{u}「{vb1}」{u}が口を開くと、{t}はゆっくりと腰を進め、舌の上を滑らせた。その間も、触手は{u}の胸の先や内腿をぬるぬると撫で続けていた。|{t}は宙に吊られた{u}の頬を両手で包み、口いっぱいに自分の熱を含ませた。触手が{u}の肌を這い回るたびに、{u}の喉が小さく鳴って、唇がきゅっとすぼまる。{u}「{vb1}」{t}「{vt}」'),
oral_f:L('触手が{u}の手足を絡め取り、膝立ちのまま{t}の前に差し出した。{t}は{u}の頭を抱き寄せ、自分の脚のあいだへ導く。{u}「{vb1}」{u}の舌が熱いところに触れると、{t}の太ももが小さく震えた。その間も、触手は{u}の胸の先や脇腹をぬるぬると撫で続けていた。|{t}は宙に吊られた{u}の顎を持ち上げ、自分の濡れた指を咥えさせてから、その唇を脚のあいだへ導いた。{t}「同じように」触手が{u}の背筋をなぞるたびに、{u}の舌が震える。{u}「{vb1}」'),
oral_x:L('触手が{u}の手足を絡め取り、膝立ちのまま{t}の前に差し出した。{t}は{u}の口に指を二本差し入れ、舌の上をゆっくりと撫でた。{u}「{vb1}」{u}が指に吸いつくと、{t}は喉の手前まで指を沈めては引き、また沈めた。触手は{u}の胸の先や内腿を撫で続けていた。|{t}は宙に吊られた{u}の舌を自分の舌で絡め取り、唇の裏、上顎と、口の中を隅々まで舐め尽くした。触手が{u}の肌を這い回るたびに、{u}の喉が小さく鳴る。{u}「{vb1}」{t}「{vt}」'),
hand_f:L('触手が{u}の両脚を左右から抱え上げ、とろとろに濡れたところを{t}の前にさらけ出した。{t}は細身の玩具を手に取り、震える先端を{u}の一番敏感なところに押し当ててから、ゆっくりと中へ沈めていった。{u}「{vb1}」胸に吸いついた触手と玩具に挟まれて、{u}の腰が跳ねた。{t}「{vt}」|{t}は宙に吊られた{u}の脚の間に指を這わせ、濡れたところを指の腹でなぞってから、一本、二本と沈めていった。触手が{u}の胸を揉みしだくのに合わせて、{t}の指が中の弱いところを擦り上げる。{u}「{vb1}」{t}「{vt}」'),
hand_m:L('触手が{u}を四つん這いに押さえつけ、腰だけを高く持ち上げた。{t}は指にたっぷりと香油を垂らし、{u}の後ろをほぐしてから、細身の玩具をゆっくりと押し当てた。{u}「{vb1}」前に回った触手が{u}の昂りに巻きつき、玩具の動きに合わせて扱き上げる。{t}「{vt}」|{t}は宙に吊られた{u}の背後に回り、後ろを指で丁寧にほぐしていった。触手が張りつめた{u}の前を根元から扱き上げ、{t}の指が内側の弱いところを探り当てる。{u}「{vb1}」{t}「{vt}」')
},
climax:{
proud:L('{u}は最後まで{t}を睨みつけていた。けれど触手に胸を吸われ、{t}に追い上げられて、とうとうこらえきれなくなった。{u}「{vb2}」――悔しげに顔を歪めたまま、{u}は触手の中で全身を震わせて果てた。|{u}「この、二人がかりで……っ」悪態は、途中から甘い声に変わっていた。{u}「{vb2}」――{u}は{t}の肩に歯を立て、触手に吊られたまま背を弓なりに反らした。|{u}は触手を引きちぎろうと何度も腕に力を込め、そのたびに崩れた。{u}「{vb2}」――強がりの欠片も残らない声が、迷宮の闇に吸い込まれていった。'),
stern:L('{u}は唇を固く結び、二重の責めに乱される呼吸を律しようとした。{u}「{vb2}」――張りつめていた背筋がほどけ、{u}は触手の中で崩れ落ちた。|{u}「……っ、まだ、だ……」耐える言葉とは裏腹に、触手に押さえつけられた体はとうに限界を越えていた。{u}「{vb2}」――{u}は短く息を詰めて、深く長く達した。|{u}は目を閉じて耐え続けた。けれど名前を呼ばれ、触手に一番弱いところを撫でられた瞬間、こらえていたものがすべて崩れた。{u}「{vb2}」'),
tsun:L('{u}「べ、別に、こんなの……っ」言い終わる前に、触手に絡まれた腰が勝手に跳ねた。{u}「{vb2}」――{u}は真っ赤な顔を{t}の胸に埋めて、何度も体を震わせた。|{u}は最後まで「感じてない」と言い張っていた。けれど触手と{t}に同時に弱いところを責め立てられて、その言葉はあっけなく崩れた。{u}「{vb2}」|{u}は{t}の背中を叩きながら、それでも縋りつく腕を離さなかった。{u}「{vb2}」――果てたあと、{u}は「今の、なし。ぜったい、なし」と小さく呟いた。'),
gentle:L('{u}は触手に吊られたまま、{t}の頬に手を伸ばしてとろけた笑みを浮かべた。{u}「{vb2}」――{u}は{t}を抱きしめ、柔らかく長い波に身を委ねた。|{u}「ん……{t}、そこ……」甘く囁く声が、触手の動きに合わせて途切れ途切れになっていく。{u}「{vb2}」――{u}は{t}の名前を呼びながら、ゆっくりと果てた。|{u}は穏やかな顔のまま、触手と{t}に少しずつ高みへ押し上げられていった。{u}「{vb2}」――果てる瞬間、{u}は{t}の背中を宥めるように撫でていた。'),
devoted:L('{u}は「{t}が気持ちいいなら」と、触手に縛られた体で懸命に応えようとした。{u}「{vb2}」――{u}は涙をこぼしながら、{t}にすがりついて果てた。|{u}「ご、ごめんなさい、もう……っ」{u}は何度も謝りながら、迫り上がる波をこらえきれなかった。{u}「{vb2}」――果てたあとも、{u}は触手に吊られたまま、{t}の手をぎゅっと握って離さなかった。|{u}は健気に声を抑えようとして、それでも{t}を求めて身をよじった。触手がその体を、さらに{t}のほうへ押しつける。{u}「{vb2}」――{u}は{t}の胸に顔を埋めて、震えながら果てた。'),
cool:L('{u}は最後まで、触手と{t}のどちらに追い上げられているのかを冷静に見極めようとしていた。けれど三度目の波が来たとき、もう何も考えられなくなっていた。{u}「{vb2}」――{u}の整った顔が、初めてはっきりと崩れた。|{u}「……分析、できない……」{u}は呆然と呟き、そのまま{t}の肩に額を落とした。{u}「{vb2}」――触手に吊られた体が、ふだんの冷静さが嘘のように乱れて果てた。|{u}は乱れる呼吸を抑えようとして、失敗した。{u}「{vb2}」――果てたあと、{u}は「二人がかりは、計算に入っていなかった」とだけ呟いた。'),
free:L('{u}は触手に吊られたまま、{t}の動きに合わせて自分から腰を揺らした。{u}「{vb2}」――{u}は声を上げて笑うように果て、そのまま{t}に抱きついた。|{u}「すごい、これ、すごい……っ」{u}は素直に声を上げ、触手ごと{t}を強く引き寄せた。{u}「{vb2}」――果てたあと、{u}は「もう一回」と言いたげに{t}を見上げた。|{u}は迷宮の熱も、絡みつく触手も忘れて、ただ気持ちよさに身を任せた。{u}「{vb2}」――{u}の弾んだ声が、石の天井に反響した。'),
shy:L('{u}は触手に両手を吊られて、顔を隠すこともできなかった。{u}「{vb2}」――果てた瞬間、{u}は耳まで真っ赤にして{t}の胸に顔を押しつけた。|{u}「み、見ないで……っ」消え入りそうな声で懇願しながら、触手に開かされた体は正直に震えていた。{u}「{vb2}」――{u}はぎゅっと目をつぶって、小さく何度も果てた。|{u}は唇を噛んで声をこらえていたが、{t}に優しく名前を呼ばれて、とうとう崩れた。{u}「{vb2}」――果てたあと、{u}は恥ずかしさで{t}の顔を見られなかった。'),
polite:L('{u}は触手に吊られた不自由な体のまま、乱れる息の合間にも丁寧な言葉遣いを崩すまいとしていた。{u}「{vb2}」――最後の波に呑まれた瞬間、{u}の言葉はとうとう意味をなさなくなった。|{u}「も、申し訳、ありませ……っ」{u}は詫びる言葉を繰り返しながら、{t}にすがりついた。{u}「{vb2}」――{u}は触手に髪を乱されたまま、深く果てた。|{u}は「お二方とも、どうか」と言いかけて、その片方が触手だと気づいて赤くなった。{u}「{vb2}」――{u}は{t}の腕の中で、震えながら果てた。')
},
ero:{
proud:L('{s:wet}。{u}「{m2}」――触手に胸を吸われ、{t}に追い上げられて、{u}は悪態をつく口のまま腰をがくがくと跳ねさせた。|{u}「{m2}」――{u}は{t}を睨む目だけは逸らさずに、触手の中でびくびくと体を跳ねさせた。{s:wet}。'),
stern:L('{s:wet}。{u}「{m2}」――律していた呼吸が一息に崩れ、{u}は触手に吊られたまま何度も体を震わせた。|{u}「{m2}」――{u}は背筋を反らし、こらえていた声を初めて漏らして果てた。{s:wet}。'),
tsun:L('{s:wet}。{u}「{m2}」――{u}は「ちがう、ちがうから」と首を振りながら、触手に絡まれた腰を跳ねさせた。|{u}「{m2}」――{u}は真っ赤な顔をくしゃくしゃにして、{t}にしがみついたまま何度も震えた。{s:wet}。'),
gentle:L('{s:wet}。{u}「{m2}」――{u}はとろけた笑みのまま、{t}の首に腕を回して果てた。|{u}「{m2}」――触手と{t}の両方に甘やかされるように追い上げられて、{u}はふにゃりと蕩けた。{s:wet}。'),
devoted:L('{s:wet}。{u}「{m2}」――{u}は涙目で{t}の名前を呼びながら、触手の中でびくびくと果てた。|{u}「{m2}」――{u}は{t}にすがりついたまま、こらえきれずに何度も体を跳ねさせた。{s:wet}。'),
cool:L('{s:wet}。{u}「{m2}」――{u}の整った顔が、触手と{t}の間ではっきりと崩れた。|{u}「{m2}」――{u}は数えることをやめ、ただ二重の責めに呑まれて果てた。{s:wet}。'),
free:L('{s:wet}。{u}「{m2}」――{u}は笑い混じりの声を上げて、触手ごと{t}にしがみついて果てた。|{u}「{m2}」――{u}は「もっと、二人とも」と言いかけて、その声ごと甘く崩れた。{s:wet}。'),
shy:L('{s:wet}。{u}「{m2}」――{u}は隠せない顔を{t}の胸に押しつけて、とろけた声をこぼした。|{u}「{m2}」――{u}は触手に開かされたまま、小さく何度もびくびくと震えた。{s:wet}。'),
polite:L('{s:wet}。{u}「{m2}」――{u}の丁寧な言葉遣いは、触手と{t}の間でとうとう意味をなさなくなった。|{u}「{m2}」――{u}は詫びる言葉も言い終えられずに、甘い声と一緒に果てた。{s:wet}。')
},
eroCb:{
mf:L('{s:hit}。{t}が奥を突き上げるたびに、触手に吸われた胸の先まで震えて、{u}の中はきゅうきゅうと締めつけた。|{s:cum}。奥へたっぷりと注がれて、{u}は触手に吊られたまま蕩けた顔で腰を跳ねさせた。'),
ff:L('{s:wet}。指と触手に中を同時にかき回されて、{u}はぷしゃっと潮を噴いた。|{s:suck}。花芯を吸われ、触手に胸を吸われて、{u}は脚をぴんと伸ばしたまま深くイった。'),
fm:L('{s:hit}。上から腰を叩きつけられ、触手に胸の先を吸われて、{u}はこらえきれずに勢いよく吐き出した。|{s:cum}。根元まで呑み込まれたまま触手に後ろを撫で回されて、{u}は何度も腰を震わせて吐き出した。'),
mm:L('{s:hit}。奥を突き上げられるたびに、触手に扱かれた{u}の{男性器}から先走りがとろとろと溢れた。|{s:cum}。奥へ注がれた瞬間、触手に搾り上げられていた{u}も、腹の上に勢いよく吐き出していた。')
},
fin:{
mf:L('{t}もほどなく、低く呻いて{u}の奥で果てた。触手はそれを見届けたように、ゆっくりと二人から離れていった。|{u}の締めつけに誘われるように、{t}も深いところへ熱を吐き出した。'),
mm:L('{t}もほどなく、低く呻いて{u}の奥で果てた。触手はそれを見届けたように、ゆっくりと{u}から離れていった。|{t}は{u}の腰を引き寄せたまま、深いところで果てた。'),
ff:L('{t}は{u}の震えが収まるまで、指を抜かずに抱きしめていた。触手が名残惜しそうに、{u}の肌から離れていく。|{t}は果てた{u}の額に口づけ、汗ばんだ髪を指で梳いた。'),
fm:L('{t}もまた、{u}の上で背を反らし、きつく締めつけながら達した。|{u}が果てる脈動を感じて、{t}も腰を震わせながら高みへ昇りつめた。触手は満足したように、二人の体から離れていった。'),
oralM:L('{t}は{u}の唇から熱を引き、乱れた息を整えた。触手が{u}の手足から、ゆっくりとほどけていく。|{t}は{u}の頬を撫でて、濡れた唇を親指で拭った。'),
oralX:L('{t}は{u}の唇をそっと離させ、濡れた口元を指で拭った。触手が名残惜しそうに、{u}の肌から離れていく。|{t}は{u}の額に口づけ、汗ばんだ髪を指で梳いた。'),
hand:L('{t}は玩具を止め、震える{u}を抱きしめた。触手が名残惜しそうに、{u}の肌から離れていく。|{t}は{u}からゆっくりと指を引き、汗ばんだ額に口づけた。')
},
again:L('触手は二人を放さなかった。果てたばかりの{u}の体をもう一度{t}のほうへ差し出し、{t}もまた、それを拒まなかった。二度目は、一度目よりずっと長かった。|{u}の震えが収まる前に、触手がまた動き出した。{t}は{u}を抱き寄せたまま、迷宮の熱に身を任せた。二人がようやく解放されたのは、松明が一本燃え尽きたあとだった。'),
afterW:L('触手がすっかり引いたあと、{u}は{t}の胸に額を押しつけたまま動かなかった。{u}「……助けに来たんじゃ、なかったの」{t}「……ごめん」{u}は答えの代わりに、{t}の手を握った。|二人は散らばった触手の残骸に囲まれて、しばらく寄り添っていた。{t}は{u}の髪についた粘液を、黙って指で払い続けた。|{u}は乱れた息のまま、小さく笑った。{u}「{t}まで、迷宮の味方になったのかと思った」{t}は返す言葉がなく、ただ{u}を抱き寄せた。'),
afterF:L('触手が引いたあと、{u}は{t}の手を振り払った。{u}「……助けてくれると思ってた」{t}は何も言えずに、拳を握りしめた。|{u}は乱れた衣を掻き合わせ、{t}から目を逸らした。{t}は触手の残骸を蹴り散らしたが、自分のしたことまでは散らせなかった。|熱が引くと、{t}は青ざめた顔で{u}を見た。{u}は膝を抱えたまま、{t}のほうを見ようともしなかった。'),
fade:L('{t}は{u}を助けるはずだった。けれど触手に絡め取られた{u}の前で、{t}は剣を下ろした。そのあとのことを、二人は誰にも話さなかった。|触手の巣の奥から、二人分の乱れた息がしばらく聞こえていた。戻ってきた{t}と{u}は、互いの顔を見ようとしなかった。')
}
};
function R(S){return S.tmR||(S.tmR={rng:HK.rng(((S._tmSeed||0)*31+9973)>>>0)});}
function D(S){return S.dgR||(S.dgR=HK.rng(((S._tmSeed||S.seed0||0)*17+5113)>>>0));}
function pk(S,arr){var r=R(S);return HK.Ero&&HK.Ero.fresh?HK.Ero.fresh(r,arr):arr[r.rng.int(arr.length)];}
function fresh1(S,arr){var U=S.tzU||(S.tzU={}),f=(arr||[]).filter(function(x){return!U[x];});if(!f.length)return null;var x=f[R(S).rng.int(f.length)];U[x]=1;return x;}
function pk1(S,arr){return fresh1(S,arr)||pk(S,arr);}
function nm(s,m){return s.replace(/\{(a|b|c|t|u|ev)\}/g,function(x,k){return m[k]!=null?m[k]:x;});}
var DEEP= /奥|おく|ナカ|なか|中に|中で|中、|いっぱい|入って|挿れ|出して|注い|孕|種|突い|突か|突き|ちょうだい/;
function moanSafe(S,who,st){
var t='',E=HK.Ero;
for(var i=0;i<8;i++){t=E&&E.moan?E.moan(R(S),who,st,{deep:false}):'';if(t&& !DEEP.test(t))return t;}
return st>=2?'あ、あぁっ♡♡　だめ、きちゃう……っ♡♡':'ん、ぁ……♡　そこ、だめ……♡';
}
DG.teaseMoan=function(S,h,st){return moanSafe(S,h,st);};
function sfx(S,s){var E=HK.Ero;return s.replace(/\{s:(\w+)\}/g,function(m,k){return E&&E.sfx?E.sfx(R(S),k):'……';});}
function eroFill(S,s,who,safe,dom){
var E=HK.Ero;if(!E)return s.replace(/\{s:\w+\}。?|「\{m\d\}」――/g,'');
if(safe)return sfx(S,s).replace(/\{m([012])\}/g,function(m,n){return moanSafe(S,who,+n);});
var d0=who.eroDom;if(dom)who.eroDom=true;
var out=E.fill(R(S),s,who);who.eroDom=d0;return out;
}
function voice(S,s,bot,top,safe){
var TV=HK.ThickVM;
if(!TV)return s.replace(/\{v[a-z0-9]+\}/g,'……っ');
if(!safe)return TV.voice(R(S).rng,s,bot,top);
var pb=TV.VB[ps(bot)]||TV.VB.gentle,pt=TV.VT[ps(top)]||TV.VT.gentle;
var vb=function(k){var l=pb[k].filter(function(x){return!DEEP.test(x);});return pk(S,l.length?l:['……っ、ん……']);};
var vt=function(){var l=pt.filter(function(x){return!DEEP.test(x)&& !/締ま|締め/.test(x);});return pk(S,l.length?l:['可愛い声']);};
return TV.voice(R(S).rng,s.replace(/\{vb1\}/g,function(){return vb(0);}).replace(/\{vb2\}/g,function(){return vb(1);}).replace(/\{vt\}/g,vt),bot,top);
}
function sayAs(S,h,o){var prev=S.h;S.h=h;var e=DG.say(S,o);S.h=prev;return e;}
function pn(S,s){(S.partyNotes=S.partyNotes||[]).push(s);}
function k2(a,b){return a.i<b.i?a.i+'-'+b.i:b.i+'-'+a.i;}
function rel(S,a,b){return(S.rel&&S.rel[k2(a,b)])||{trust:15,att:0,ten:0};}
function free(S){return S.party.filter(function(x){return!x.fallen&& !x.captor&&x.corrupt<100&&x.reason>0;});}
function sexOk(a,b){
if(!a|| !b||a===b)return false;
if(HK.ngSexPair&&HK.ngSexPair(a,b))return false;
if(HK.sexBlocked&&HK.sexBlocked(a,b))return false;
if(HK.State&&HK.State.pairSex)return HK.State.pairSex(a,b);
return!!(P()&&P().okSex(a,b));
}
function loveOk(a,b){return HK.State&&HK.State.pairLove?HK.State.pairLove(a,b): !!(HK.canLove&&HK.canLove(a,b)&&HK.canLove(b,a));}
function topOver(x,y){var Q=P();return!!Q&&Q.order(x,y,[x,y])[0]===x&& !Q.hardTop(y,x);}
function r18(c){return!!(HK.State?HK.State.r18ok(c): !HK.SAFE_ON);}
function watcher(x){return!!(P()&&P().hardTopNpc(x))&&r18(x);}
function thr(S){return Math.max(32,Math.min(56,56-(+S.env.trap||0)*0.22));}
function forceOn(S){return!!(HK.Content&&HK.Content.on(S.env,'force'));}
function mild(S){return!!(HK.Dark&&HK.Dark.on(S.env)==='mild');}
function combo(t,u){var Q=P(),tf=Q?Q.isF(t,u):t.gender==='f',uf=Q?Q.isF(u,t):u.gender==='f';return tf?(uf?'ff':'fm'):(uf?'mf':'mm');}
function spend(S,h,top){h.climax++;h.corrupt=(h.corrupt||0)+(top?2:3.5)*(S.k||1);h.pleasure=14+S.rng.int(16);}
function lewdOf(S){
var X=HK.Lewd,cf=X&&X.conf('dungeon');
var low=(cf&&X.lv(S.env)==='low')||S.env.trap<15;
return{
low:low,
thick: !low&&(S.env.lewdLen==='thick'||(S.env.lewdLen==='mix'&&R(S).rng()<0.5)|| !cf),
ero: !low&& !!cf&&X.ero(S.env)&& !!HK.Ero,
high: !low&& !!cf&&X.high(S.env)
};
}
function hitNow(y){return(y.pleasure-(y._twP==null?0:y._twP))>6||y.climax>(y._twC||0);}
function victim(y){
var ev=y.lastEv;
return hitNow(y)&& !!ev&& /^(trap|mon|chest|captive)$/.test(ev.kind)&& !(ev.o&&ev.o.mind)&& !(P()&&P().hardTopNpc(y));
}
function snap(S){S.party.forEach(function(x){x._twP=x.pleasure;x._twC=x.climax;});}
function wantOf(S,y,x,r){
var rr=rel(S,x,y),love=loveOk(x,y),cp=HK.TIES&&rr.tie&&HK.TIES[rr.tie];
return(love?rr.att/70:0)+y.corrupt/90+Math.max(0,y.pleasure)/160+y.tr.fc*0.25+(cp&&(cp.couple||cp.night)?0.6:0)-y.tr.cp*0.3-Math.max(0,y.reason)/250+r()*0.4;
}
function bodyKeyOf(t,u){
var ng=HK.NoGen&&HK.NoGen.kind?HK.NoGen.kind(t,u):'';
if(ng==='oral')return{ng:ng,act:'oral_'+body(t),fin:P().hasM(t)?'oralM':'oralX'};
if(ng==='hand')return{ng:ng,act:'hand_'+(P().hasF(u)?'f':'m'),fin:'hand'};
var cb=combo(t,u);
return{ng:'',act:cb,fin:cb,cb:cb};
}
function watchGain(S,x,d,f){
var cw=(3.5+(+S.env.trap||0)/40+Math.min(4,Math.max(0,d)/10))*(0.8+x.tr.fc*0.4)*(S.k||1)*(mild(S)?0.7:1)*(f||1);
x.corrupt+=cw*0.6;x.pleasure+=cw*2;x.watchC=(x.watchC||0)+cw;x.dgWatch=(x.dgWatch||0)+cw*0.6;
return cw;
}
function whyW(S,x){return'堕ち度（見て上がった分 +'+Math.round(x.dgWatch||0)+'）・手を出す目安 '+Math.round(x.watchC||0)+'/'+Math.round(thr(S));}
DG.teaseLeft=function(S,h,key){var T=TZ[key],U=S.tzU||{};return!!T&&(T[body(h)]||T.x).some(function(x){return!U[x];});};
DG.teaseText=function(S,h,key){var T=TZ[key]||TZ.trap;return pk1(S,T[body(h)]||T.x);};
DG.teaseClimax=function(S,h){var a=fresh1(S,TZ.cbody[body(h)]),b=a&&fresh1(S,TZ.climax[ps(h)]);return a&&b?a+b:'';};
DG.teaseLewd=function(S,o,h,opt){
var b=body(h),out=[],f=function(s){return eroFill(S,s.replace(/\{a\}/g,h.name),h,true);},x;
if(opt.thick&&(x=fresh1(S,TZ.build[b])))out.push(f(x));
out.push(o.text);
if(opt.ero&&(x=fresh1(S,TZ.ero[ps(h)])))out.push(f(x));
if(opt.hi&&(h._tzAgain==null||h.climax-h._tzAgain>=3)&&R(S).rng()<0.5&&(x=fresh1(S,TZ.again[b]))){h._tzAgain=h.climax;out.push(f(x));}
o.text=out.join(opt.thick?'\n\n':' ');
};
function watchStep(S){
var F=free(S),rng=D(S),vic=F.filter(victim);
if(!vic.length)return;
F.forEach(function(x){
if(!watcher(x))return;
var ys=vic.filter(function(y){return y!==x&&sexOk(x,y)&&topOver(x,y);});
if(!ys.length||rng()>0.6)return;
var y=ys[rng.int(ys.length)],d=y.pleasure-(y._twP||0)+(y.climax-(y._twC||0))*20;
var hot=(x.watchC||0)>=thr(S)*0.5,bd=hot?'hot':'cold',line=fresh1(S,W.watch[ps(x)][bd].concat(W.watchAny[bd]));
if(!line)return;
watchGain(S,x,d);
var text=nm(line,{a:x.name,b:y.name,ev:(y.lastEv&&y.lastEv.name)||'罠'});
sayAs(S,x,{kind:'ev',tag:'見つめる',text:text,why:x.name+'は、'+y.name+'が'+((y.lastEv&&y.lastEv.name)||'罠')+'に襲われるのを見ていた。'+whyW(S,x)});
});
}
function pairWatch(S,n0){
var es=S.log.slice(n0).filter(function(e){return e&&e.kind==='ev'&& /^(誘惑|慰め合い|仲間の暴走)$/.test(e.tag)&& /果て|達し|――/.test(e.text||'');});
if(!es.length)return;
var e=es[es.length-1],rng=D(S);
var inIt=S.party.filter(function(y){return e.text.indexOf(y.name)>=0;});
free(S).forEach(function(x){
if(!watcher(x)||inIt.indexOf(x)>=0||rng()>0.6)return;
var ys=inIt.filter(function(y){return y!==x&&sexOk(x,y)&&topOver(x,y);});
if(!ys.length)return;
var y=ys[rng.int(ys.length)],line=fresh1(S,W.pair);
if(!line)return;
watchGain(S,x,20,0.8);
sayAs(S,x,{kind:'ev',tag:'見つめる',text:nm(line,{a:x.name,b:y.name}),why:x.name+'は、仲間どうしの場面を見てしまった。'+whyW(S,x)});
});
}
function joinStep(S){
if((S.dgJoinN||0)>=3||(S.dgJoinLast!=null&&S.log.length-S.dgJoinLast<8))return false;
var F=free(S),rng=D(S),vic=F.filter(victim),opts=[];
if(!vic.length)return false;
F.forEach(function(x){
if(!r18(x)|| !P().hardTop(x))return;
var caught= !P().hardTopNpc(x)&&x.posNpc==='bottom'&&hitNow(x)&& !!x.lastEv&& /^(trap|mon|chest|captive)$/.test(x.lastEv.kind);
var hot=watcher(x)&&(x.watchC||0)>=thr(S)*0.85;
if(!caught&& !hot)return;
vic.forEach(function(y){if(y!==x&&sexOk(x,y)&&topOver(x,y))opts.push({x:x,y:y,caught:caught});});
});
if(!opts.length||rng()>(opts.some(function(o){return o.caught;})?0.22:0.3)*(mild(S)?0.5:1))return false;
var o=opts[rng.int(opts.length)],x=o.x,y=o.y;
var welcome=wantOf(S,y,x,rng)>0.55;
if(!welcome&& !forceOn(S))return false;
var t=x,u=y,ev=y.lastEv,M={t:t.name,u:u.name,a:t.name,b:u.name,ev:(ev&&ev.name)||'罠'};
var lw=lewdOf(S),parts=[];
if(lw.low)parts.push(nm(pk(S,W.join.fade),M));
else{
parts.push(nm(pk1(S,o.caught?W.join.caught:W.join.intro),M)+' '+nm(pk1(S,welcome?W.join.welcome:W.join.unwilling),M));
var bk=bodyKeyOf(t,u),safe= !!bk.ng,x1;
parts.push(nm(voice(S,pk1(S,W.join.act[bk.act]),u,t,safe),M));
var cl=voice(S,pk1(S,W.join.climax[ps(u)]),u,t,safe);
if(lw.ero){if((x1=fresh1(S,W.join.ero[ps(u)])))cl+=' '+eroFill(S,x1,u,safe);if(bk.cb&&(x1=fresh1(S,W.join.eroCb[bk.cb])))cl+=' '+eroFill(S,x1,u,false);}
cl+=' '+pk1(S,W.join.fin[bk.fin]);
parts.push(nm(cl,M));
if(lw.high&&(x1=fresh1(S,W.join.again)))parts.push(nm(x1,M));
parts.push(nm(pk1(S,welcome?W.join.afterW:W.join.afterF),M));
}
var text=parts.join(lw.thick||lw.low?'\n\n':' ');
spend(S,u,false);spend(S,t,true);
u.reason-=welcome?3:7;t.reason+=3;
if(o.caught)t.corrupt+=2*(S.k||1);
var wc=Math.round(t.watchC||0);t.watchC=0;
t.dgJoinN=(t.dgJoinN||0)+1;t.dgPartner=u.name;S.dgJoinN=(S.dgJoinN||0)+1;S.dgJoinLast=S.log.length;
var r=rel(S,t,u);r.intimate=(r.intimate||0)+1;
if(welcome){r.trust+=2;if(loveOk(t,u))r.att+=6;}
else{r.trust-=15;r.ten+=20;r.assault=(r.assault||0)+1;S.cnt.assault++;}
var why=(o.caught?t.name+'も'+M.ev+'に一緒に捕まり、触手に責められながら'+u.name+'を抱いた':t.name+'の見て溜まった熱 '+wc+'（加勢の目安 '+Math.round(thr(S)*0.85)+'）・堕ち度 '+Math.round(Math.min(100,t.corrupt))+'（見て上がった分 +'+Math.round(t.dgWatch||0)+'）')+
'。'+u.name+(welcome?'は'+t.name+'を求めた（理性 '+Math.round(Math.max(0,u.reason))+'・堕ち度 '+Math.round(Math.min(100,u.corrupt))+'）':'は拒んだが、触手に縛られて逃げられなかった（内容のスイッチ「合意のない展開」）')+'。'+t.name+'が攻め';
var e=sayAs(S,t,{kind:'ev',tag:'加勢',text:text,why:why});
if(t.dgJoinN===1){DG.key(S,e,t.name+'が触手に加勢して'+u.name+'を抱いた');pn(S,t.name+'は、触手に捕らわれた'+u.name+'を助けるかわりに、触手と一緒に'+u.name+'を抱いた。');}
return true;
}
function reachStep(S){
if((S.dgReachN||0)>=3||(S.dgReachLast!=null&&S.log.length-S.dgReachLast<10))return false;
var F=free(S),rng=D(S),th=thr(S);
var xs=F.filter(function(x){return watcher(x)&&(x.watchC||0)>=th&&F.some(function(y){return y!==x&&sexOk(x,y)&&topOver(x,y);});});
if(!xs.length||rng()>0.6)return false;
var x=xs[rng.int(xs.length)];
var cand=F.filter(function(y){return y!==x&&sexOk(x,y)&&topOver(x,y);});
var y=HK.weighted(rng,cand,function(c){var q=rel(S,x,c);return 0.3+(q.att||0)/40+(q.tie&& /lover|fwb|almost|mate|fated|spouse/.test(q.tie)?1:0);})||cand[0];
S.dgReachN=(S.dgReachN||0)+1;S.dgReachLast=S.log.length;
var M={a:x.name,b:y.name,t:x.name,u:y.name},r=rel(S,x,y),love=loveOk(x,y),wc=Math.round(x.watchC||0);
var grp= /^(proud|stern|cool)$/.test(ps(x))?'dom': /^(tsun|free)$/.test(ps(x))?'play':'soft';
var intro=nm(pk(S,W.reach[grp]),M);
var why0=x.name+'は仲間の痴態を見続けて、見て溜まった熱 '+wc+'が目安 '+Math.round(th)+'を越えた。堕ち度 '+Math.round(Math.min(100,x.corrupt))+'（見て上がった分 +'+Math.round(x.dgWatch||0)+'）';
if(rng()<0.12+Math.max(0,x.reason)/500+x.tr.cp*0.1+(mild(S)?0.35:0)){
x.watchC*=0.6;x.reason+=4;x.pleasure-=8;
x.dgHoldN=(x.dgHoldN||0)+1;
sayAs(S,x,{kind:'ev',tag:'手を出す',text:nm(pk(S,W.holdPre),M)+' '+nm(pk(S,W.hold),M),why:why0+' → 踏みとどまった（理性 '+Math.round(Math.max(0,x.reason))+'・CP '+Math.round(x.eg.CP)+(mild(S)?'・展開：穏やか':'')+'）'});
return true;
}
var want=wantOf(S,y,x,rng),mode=want>0.62?'accept':(want>0.32&&y.reason<60)?'swept':'refuse';
var Rp=W.resp[ps(y)];
if(mode==='refuse'&&forceOn(S)&& !mild(S)&&x.corrupt>=65&&rng()<0.35)mode='push';
if(mode==='refuse'){
x.watchC*=0.5;x.reason+=3;r.ten+=4;
sayAs(S,x,{kind:'ev',tag:'手を出す',text:intro+'\n\n'+nm(pk(S,Rp.refuse),M)+' '+nm(pk(S,W.back),M),why:why0+' → '+y.name+'は拒んだ（理性 '+Math.round(Math.max(0,y.reason))+'・CP '+Math.round(y.eg.CP)+'）'});
return true;
}
var lw=lewdOf(S),parts=[],resp=nm(pk(S,mode==='push'?Rp.refuse:Rp[mode]),M)+(mode==='push'?' '+nm(pk(S,W.push),M):'');
if(lw.low)parts.push(intro+' '+resp,nm(pk(S,mode==='push'?W.fadeP:(DG.TEMPT?DG.TEMPT.fade:W.fadeP)),M));
else{
parts.push(intro+' '+resp);
var bk=bodyKeyOf(x,y),TT=DG.TEMPT;
if(bk.ng&&HK.NoGen&&HK.NoGen.scene){
var sc=HK.NoGen.scene({S:R(S),rng:R(S).rng,a:x,b:y,kind:bk.ng,ero:lw.ero,open:false,after:false}).text;
if(lw.ero&&HK.Ero)sc=HK.Ero.fill(R(S),sc,y);
parts.push(sc.replace(/\{a\}/g,x.name).replace(/\{b\}/g,y.name));
}else if(TT){
var cb=bk.cb;
parts.push(nm(voice(S,pk(S,TT.act[cb]),y,x),M));
var cl=voice(S,pk(S,TT.climax[ps(y)]||TT.climax.gentle),y,x);
if(lw.ero){cl+=' '+eroFill(S,pk(S,TT.ero[cb]),y,false);cl+=' '+eroFill(S,pk(S,TT.eroTop[cb==='ff'||cb==='fm'?'f':'m']),x,false,true);}
cl+=' '+pk(S,TT.topFin[cb]);
parts.push(nm(cl,M));
if(lw.high&&mode!=='push')parts.push(nm(pk(S,TT.again),M));
}
parts.push(nm(pk(S,mode==='push'?W.after.push:W.after[love?'love':'cool']),M));
}
var text=parts.join(lw.thick||lw.low?'\n\n':' ');
spend(S,y,false);spend(S,x,true);
x.watchC=0;x.reason+=5;y.reason-=mode==='push'?8:mode==='swept'?5:3;
x.dgReachN=(x.dgReachN||0)+1;x.dgPartner=y.name;
r.intimate=(r.intimate||0)+1;
if(mode==='push'){r.trust-=20;r.ten+=25;r.assault=(r.assault||0)+1;S.cnt.assault++;}
else{r.trust+=3;if(love)r.att+=6;}
var lab={accept:'は応じた',swept:'は流されるまま受け入れた（理性 '+Math.round(Math.max(0,y.reason))+'）',push:'は拒んだが、押し切られた（内容のスイッチ「合意のない展開」）'}[mode];
var e=sayAs(S,x,{kind:'ev',tag:'手を出す',text:text,why:why0+' → '+y.name+lab+'。'+x.name+'が攻め'});
if(x.dgReachN===1){DG.key(S,e,x.name+'が'+y.name+'に手を出した');pn(S,x.name+'は仲間の乱れる姿を見続けた末に、'+y.name+'に手を伸ばした。'+(mode==='push'?y.name+'は拒んでいた。':''));}
return true;
}
var after0=DG.partyAfter;
DG.partyAfter=function(S,tgt,hit){
if(HK.SAFE_ON|| !P()|| !S.party.some(function(x){return P().hardTop(x);}))return after0(S,tgt,hit);
if(!joinStep(S)){
watchStep(S);
var n0=S.log.length;
after0(S,tgt,hit);
pairWatch(S,n0);
reachStep(S);
}
snap(S);
};
})();
});
;
/* ==== js/dungeon-end.js ==== */
HK.Load.def(168,'js/dungeon-end.js',function(){
(function(){
'use strict';
var HK=window.HK,DG=HK&&HK.DG;
if(!DG|| !DG.ending)return;
function pk(S,a){return DG.pick(S,a);}
function nm(s,a,b){return s.replace(/\{a\}/g,a.name).replace(/\{b\}/g,b?b.name:'');}
function isTop(h){return!!(HK.Pos&&HK.Pos.hardTopNpc(h));}
function low(S){var X=HK.Lewd;return!!HK.SAFE_ON|| !!(X&&X.low&&X.low(S.env));}
function bodyKey(h){
var P=HK.Pos,top=isTop(h);
if(P&&P.noGen&&P.noGen(h))return top?'lowT':'lowB';
if(top)return(P?P.isF(h):h.gender==='f')?'ft':'mt';
return(P?P.isFBody(h):h.gender==='f')?'fb':'mb';
}
var fall0=DG.fallHero;
DG.fallHero=function(S,h){
if(!h.fallLogged){S.fallSeq=(S.fallSeq||0)+1;h.fallOrder=S.fallSeq;h.fallFloor=S.floor;h.fallClimax=h.climax;h.fallCap= !!h.captor;}
return fall0(S,h);
};
function depth(S,h){
var cl=h.fallClimax!=null?h.fallClimax:h.climax;
var fl=h.fallFloor!=null?h.fallFloor:S.floor;
var early=1-Math.min(1,fl/Math.max(1,S.floors-1));
var d=cl*0.09+h.curses.length*0.15+Math.max(0,h.sens-1)*0.5+early*0.35+(h.fallCap?0.15:0)+(h.goal&&h.goal.id==='secret'?0.15:0);
return d>=0.8?'deep':'light';
}
DG.fallDepth=depth;
var FALL={
proud:{
light:['迷宮の浅い階で、{a}は今も負けを認めていない。{a}「いつでも出られる。出ないだけ」――その言葉を信じている者は、もう{a}自身しかいなかった。','{a}は時々、地上へ続く階段の下まで行っては引き返す。{a}「今日は気が乗らないだけ」――そう言って戻る足取りは、来たときよりずっと軽かった。'],
deep:['{a}は迷宮の奥で、誇らしげに胸を張って暮らしている。誰に負けたのかも、何を取り戻しに来たのかも、もう覚えていない。{a}「ここは私の場所」――その声だけは、昔と同じ強さだった。','{a}はかつての誇りを迷宮の熱に差し出したことすら、すっかり忘れていた。今の{a}が誇るのは、誰よりも深く迷宮に染まった自分の体だった。']
},
stern:{
light:['{a}は迷宮の片隅で、毎朝欠かさず自分の名前と目的を唱えている。{a}「今日こそ地上へ戻る」――けれど唱え終わるころには、体の奥がまた火照り始めていた。','{a}は迷宮で暮らす日々にも、几帳面な日課を作った。熱に溺れる時刻まで日課に組み込んでしまったことに、{a}はまだ気づいていない。'],
deep:['{a}の規律は、迷宮の熱に従うための規律へとすっかり書き換わった。決まった時刻に決まった部屋へ向かい、乱れることさえ、{a}は几帳面にこなしている。','{a}はもう、自分を律するものを何も持っていなかった。{a}「これが、私の務め」――迷宮に告げるその声には、一片の迷いもなかった。']
},
tsun:{
light:['{a}は迷宮の奥で、今も「好きでここにいるわけじゃない」と言い張っている。{a}「帰ろうと思えば、いつでも帰れるから」――そう言いながら、{a}は今日も罠の部屋の扉を開けた。','迎えに来た冒険者を、{a}は真っ赤な顔で追い返した。{a}「放っておいて。私は、これでいい」――冒険者が去ったあと、{a}は扉の陰でしばらく膝を抱えていた。'],
deep:['{a}はもう、照れ隠しの言葉さえ使わなくなった。迷宮の熱に触れるたびに、{a}は素直に「もっと」とねだる。意地を張っていた頃の自分を、{a}は思い出せない。','{a}は迷宮の奥で、甘えた声を上げて暮らしている。{a}「…ずっと、ここにいたい」――かつての{a}を知る者が聞いたら、耳を疑ったはずだった。']
},
gentle:{
light:['{a}は迷宮の奥に、小さな居場所を作った。迷い込んだ冒険者を見つけると、{a}は穏やかに微笑んで出口を教える。自分がその道を通らないことには、もう疑問を持たなかった。','{a}は時々、地上に残した人たちのことを思い出す。{a}「元気にしてるといいけど」――そう呟いたあと、{a}はまた迷宮の甘い熱に、ゆっくりと身を沈めた。'],
deep:['{a}は迷宮の奥で、慈しむような笑みを浮かべて暮らしている。迷い込んだ冒険者を見つけると、{a}は優しく手を取り、自分のいる場所へ導いていく。','{a}の穏やかさは、そのまま迷宮の熱に溶けた。{a}「怖くない。ここは、とても温かいところ」――迷い込んだ者に囁くその声は、どこまでも優しかった。']
},
devoted:{
light:['{a}は迷宮の奥で、地上で待つ人の名前を時々口にする。{a}「ごめんなさい。もう少しだけ」――謝る相手のいない謝罪を、{a}は毎晩くり返している。','{a}は迷宮のために、何かできることはないかと探し続けている。壊れた仕掛けを直し、魔物の巣を整えるうちに、地上へ帰る理由は一つずつ消えていった。'],
deep:['{a}は迷宮そのものに尽くすことを、自分の生きる意味に決めた。{a}「役に立てるなら、なんでも」――その言葉どおり、{a}は迷宮の熱が求めるままに、昼も夜も動き続けている。','{a}はもう、誰のために迷宮へ来たのかを覚えていなかった。覚えているのは、迷宮に尽くすときの満ち足りた気持ちだけだった。']
},
cool:{
light:['{a}は迷宮の奥で、自分の体の変化を毎日記録している。記録の最後には決まって「明日、地上へ戻る」と書かれていたが、その日付は少しずつ先へずれていった。','{a}「合理的に考えれば、地上へ戻るべき」――{a}はそう分析してから、迷宮の奥へ歩いていった。分析と行動が噛み合わないことを、{a}はもう気にしていない。'],
deep:['{a}の記録帳は、ある日を境に白紙になった。{a}はもう何も測らず、何も比べず、ただ迷宮の熱だけを感じて暮らしている。','{a}の明晰な頭は、迷宮の熱を味わうためだけに使われるようになった。どうすればもっと深く溶けられるか――{a}が考えているのは、それだけだった。']
},
free:{
light:['{a}は迷宮の浅い階を、ふらふらと歩き回っている。{a}「地上もいいけど、ここも面白いし」――帰る日を決めないまま、{a}は今日も新しい罠を探しに出かけた。','{a}は迷い込んだ冒険者に、楽しそうに迷宮の案内をして回っている。案内の終わりはいつも、{a}のお気に入りの罠の部屋だった。'],
deep:['{a}は迷宮のいちばん奥で、笑いながら暮らしている。地上のことを訊かれても、{a}は首を傾げるだけだった。{a}「地上？　それ、楽しい？」','{a}にとって、迷宮はもう終わらない遊び場だった。罠も魔物も、{a}の笑い声を聞くと、喜ぶように蠢き出す。']
},
shy:{
light:['{a}は迷宮の奥で、誰にも見られないように身を潜めて暮らしている。{a}「こんなところ、誰にも見せられない」――そう言いながら、{a}は今日も罠の部屋へ忍び込んだ。','迎えに来た冒険者の声に、{a}は物陰で息を殺した。{a}「…こんな姿、見られたくない」――冒険者が去るまで、{a}は耳まで赤くしてうずくまっていた。'],
deep:['{a}はもう、恥ずかしがることを忘れてしまった。迷宮の真ん中で、{a}は誰に見られても構わずに、とろけた顔で熱を求めている。','{a}の恥じらいは、迷宮の熱をいっそう甘くするだけのものになった。顔を赤らめながら、それでも{a}は一度も、熱から目を逸らさなかった。']
},
polite:{
light:['{a}は迷宮の奥でも、身なりを整えることだけはやめなかった。{a}「いつか地上へ戻るときのために」――そう言って畳んだ服は、もう長いあいだ袖を通されていない。','迎えに来た冒険者に、{a}は丁寧に頭を下げた。{a}「せっかく来てくれたのに、申し訳ない」――断りの言葉だけは、昔と同じように礼儀正しかった。'],
deep:['{a}は迷宮の奥で、迷い込んだ者を恭しく出迎えている。{a}「ようこそ。ゆっくりしていって」――その礼儀正しい声が、いちばん深い罠への案内だった。','{a}の丁寧な言葉は、今では迷宮の熱を乞うためだけに使われている。{a}「どうか、もう一度」――深く頭を下げるその姿に、かつての品の良さは残っていなかった。']
}
};
var BODY={
fb:{
light:['夜になると、下腹の奥が勝手に疼き出す。{a}はそのたびに触手の巣へ足を運び、濡れた脚のあいだを差し出しては、甘い声を石壁に響かせている。','地上の匂いを思い出しかけるたびに、{a}の胸の先は硬く尖る。{a}は迷宮の魔物のもとへ通い、蜜で濡れた奥を探られては、また地上のことを忘れていく。'],
deep:['{a}の体は、もう迷宮の熱なしではいられなかった。胸の先も脚のあいだも触手が近づく前から濡れて疼き、絡みつかれるたびに、{a}は腰を浮かせて自分から奥へ誘い込んでいる。','{a}の体は、迷宮の魔物の形をすっかり覚え込んでいた。触手が肌を這うだけで蜜が溢れ、果てても果てても、{a}は脚を開いたまま次を待っている。']
},
mb:{
light:['夜になると、下腹の熱が勝手に昂ってくる。{a}はそのたびに触手の巣へ足を運び、張りつめたものを絡め取らせては、果てるまで搾り取られている。','地上の匂いを思い出しかけるたびに、{a}の下腹は硬く張りつめる。{a}は迷宮の魔物のもとへ通い、根元から扱かれて果てては、また地上のことを忘れていく。'],
deep:['{a}の体は、もう迷宮の熱なしではいられなかった。触手が近づくだけで張りつめ、根元から扱かれれば何度でも果て、果てたそばからまた硬くなる。','{a}の体は、迷宮の魔物に搾られる悦びをすっかり覚え込んでいた。後ろの奥まで触手に探られ、前を扱かれ、{a}は空になるまで果て続けている。']
},
ft:{
light:['夜になると、体の奥が勝手に火照り出す。{a}はそのたびに逃げ遅れた魔物を床に押さえつけ、上から跨って、満ちるまで腰を揺らしている。','地上の匂いを思い出しかけるたびに、{a}の体は熱くなる。{a}は迷宮の魔物を組み伏せては跨り、相手が鳴き声を上げるまで、濡れた奥で呑み込み続けている。'],
deep:['{a}はもう、獲物なしでは眠れなかった。毎晩のように魔物を組み伏せては跨り、相手が鳴き声も出せなくなるまで、自分の思うままに腰を使い続けている。','迷宮の魔物たちは、{a}の足音を聞くだけで震え出すようになった。{a}は気に入った一匹を引きずり出しては上に跨り、果てても果てても、腰を止めようとしない。']
},
mt:{
light:['夜になると、下腹の熱が勝手に昂ってくる。{a}はそのたびに逃げ遅れた魔物を組み伏せ、昂りきった熱を奥まで沈めて、満ちるまで腰を打ちつけている。','地上の匂いを思い出しかけるたびに、{a}の下腹は硬く張りつめる。{a}は迷宮の魔物を捕まえては組み伏せ、鳴き声が甘く変わるまで、奥を突き続けている。'],
deep:['{a}はもう、獲物なしでは眠れなかった。毎晩のように魔物を組み伏せては奥で果て、果てたそばからまた次の獲物を探して、迷宮を歩き回っている。','迷宮の魔物たちは、{a}の足音を聞くだけで震え出すようになった。{a}は気に入った一匹を引きずり出しては組み伏せ、何度奥で果てても、まだ足りないという顔をしている。']
},
lowB:{
light:['夜になると、{a}はふらりと迷宮の奥へ消える。戻ってくるときは決まって、頬を上気させ、何も言わずに微笑んでいる。','{a}は時々、遠くを見るような目をする。迷宮の奥から呼ぶ声がすると、{a}はそれまでのことを忘れたように、そちらへ歩いていく。'],
deep:['{a}はもう、昼と夜の区別もなく迷宮の熱の中で過ごしている。名前を呼ばれても、{a}はうっとりと目を細めるだけだった。','{a}の目は、いつもとろりと潤んでいる。迷宮の奥の甘い気配に包まれているときだけ、{a}は心から満ち足りた顔をする。']
},
lowT:{
light:['夜になると、{a}は獲物を探して迷宮の奥へ消える。戻ってくるときは決まって、満ち足りた顔をしている。','{a}は時々、迷宮の奥の気配に耳を澄ませる。獲物の足音を聞きつけると、{a}はそれまでのことを忘れたように、そちらへ歩いていく。'],
deep:['迷宮の魔物たちは、{a}の足音を聞くだけで道を空けるようになった。{a}は昼も夜もなく、気に入った獲物を連れて迷宮の奥へ消えていく。','{a}はもう、狩る側の熱の中でしか生きられなかった。名前を呼ばれても、{a}は獲物を探す目のまま振り返るだけだった。']
}
};
var MATE={
back:{
light:['主を倒したあと、{b}はひとり{a}のいた部屋へ引き返した。{a}は{b}の顔を見て一瞬だけ正気に戻りかけ、それでも首を横に振った。{b}「必ず、迎えに来る」――そう言い残して、{b}は地上へ戻った。','{b}は地上へ出る前に、もう一度だけ迷宮の奥へ戻った。{a}は{b}の伸ばした手を見つめ、握りかけて、指をほどいた。{b}は唇を噛んで背を向け、二度と振り返らなかった。'],
deep:['主を倒したあと、{b}はひとり{a}のいた部屋へ引き返した。{a}は{b}を見ても、誰なのか分からないように首を傾げた。{b}は名前を何度も呼んだが、返ってきたのは知らない甘い声だけだった。','{b}は{a}を連れ帰ろうと、迷宮の奥まで探しに戻った。見つけた{a}は、{b}の差し出した外套を不思議そうに眺め、そのまま奥の暗がりへ戻っていった。{b}はしばらく、その場から動けなかった。']
},
left:{
light:['{b}は{a}の名前を一度だけ呼び、返事がないのを確かめてから、一人で階段を上った。地上に出ても、{b}はその名前を誰にも言わなかった。迷宮の奥で、{a}がその背中を見送っていたことも知らずに。','{b}は迷宮を振り返らずに地上へ戻った。引き返せば、自分も戻れなくなる気がした。{a}は今も時々、{b}が去った階段の方を見ている。'],
deep:['{b}は{a}を探しには戻らなかった。あの目を見てしまったら、もう連れ帰れないと分かっていた。{a}のほうも、{b}がいなくなったことに気づいていなかった。','{b}は地上に戻ると、ギルドの名簿から{a}の名前を消すよう頼んだ。迷宮の奥の{a}は、その名前で呼ばれることも、もうなかった。']
},
cold:['{b}は{a}の残った奥を一瞥して、何も言わずに背を向けた。迷宮を出たあとも、{b}は{a}の話になると黙り込んだ。{a}のほうも、{b}のことを思い出しはしなかった。','{b}は{a}がいないことを、肩をすくめて受け流した。{b}「自分で選んだこと」――それきり、{b}が{a}の名前を出すことはなかった。'],
first:{
light:['先に堕ちた{b}が、蕩けた笑みで{a}を迎えに来た。{a}は{b}の顔を見て、ほんの少しだけ泣いた。それから、差し出された手を取って、迷宮のさらに奥へ歩いていった。','{a}が堕ちたとき、先に迷宮に残った{b}がそばにいた。{b}「やっと来てくれた」――{a}は答える代わりに、{b}の隣に腰を下ろした。'],
deep:['先に堕ちた{b}が、{a}を迎えに来た。{a}はもう{b}の名前を覚えていなかったが、差し出された手は迷わず取った。二人がどこへ消えたのか、知る者はいない。','{a}が堕ちたとき、先に迷宮に残った{b}が手招きしていた。{a}は昔の仲間の顔を、知らない誰かを見るように眺めてから、その後ろについていった。']
},
after:{
light:['{b}は最後まで{a}を探し続けた。けれど{a}を見つけたその部屋で、{b}もまた同じ熱に呑まれていった。{a}は{b}の声に気づいて、ほんの少しだけ悲しそうに笑った。','{b}は{a}の名前を呼びながら、迷宮の奥へ進み続けた。その声が甘く崩れていくのを、{a}はどこか遠くで聞いていた。'],
deep:['{b}は最後まで{a}を探し続けた。けれど見つけた{a}は、もう{b}のことを覚えていなかった。その夜、{b}もまた迷宮の熱に呑まれていった。','{b}が{a}の名前を叫んだとき、{a}はただ首を傾げた。{b}の手から剣が落ちたのは、その少しあとのことだった。']
}
};
var CLR={
clean:{
b:['ギルドに戻った{a}の報告書は、驚くほど短かった。罠の数と魔物の種類、主を倒した階。それだけが、淡々と書き連ねてあった。','地上に戻った{a}は、その足で酒場に入り、いつもの席に座った。迷宮で何があったのか訊かれても、{a}は肩をすくめるだけだった。','迷宮の甘い罠は、最後まで{a}に指一本触れられなかった。地上の風を浴びた{a}は、装備の留め具さえ緩んでいないことを確かめて、ようやく息をついた。']
},
caught:{
b:['地上に戻ってからも、{a}は時々、夜中に飛び起きる。手首に残った拘束の痕を、{a}は長い袖で隠している。','{a}が持ち帰った秘宝より、{a}が何度捕まって何度抜け出したかのほうが、ギルドでは噂になった。噂を耳にするたびに、{a}は手首の痕に触れた。'],
t:['地上に戻ってからも、{a}は時々、迷宮の魔物と組み合ったときの重さを思い出す。何度もつれ合っても、最後には必ずねじ伏せ返したことだけが、{a}の誇りとして残った。','{a}が持ち帰った秘宝より、{a}が何度魔物ともつれ合い、そのたびに逆に組み伏せたかのほうが、ギルドでは噂になった。噂を耳にするたびに、{a}は鼻を鳴らした。']
},
marked:{
b:['地上の宿で湯に浸かると、肌のあちこちに迷宮の名残が浮かび上がった。{a}はそれを一つずつ指でなぞり、それから、何も見なかったことにした。','地上に戻って何日か経っても、{a}の肌は時々、迷宮の罠の感触を思い出したように粟立った。そのたびに{a}は、深く息を吸って歩き出した。'],
t:['地上の宿で湯に浸かっても、迷宮で灯った熱はなかなか引かなかった。{a}は湯の中で拳を握り、次はもっとうまくやると誓った。','地上に戻って何日か経っても、{a}は時々、組み伏せた魔物の感触を思い出した。そのたびに{a}は、深く息を吸って熱を追い払った。']
}
};
var BRINK={
fb:['地上に戻った最初の夜、{a}は宿の寝台で一人、濡れた脚のあいだに指を這わせた。思い浮かぶのは迷宮の触手のことばかりで、果てたあと、{a}は枕に顔を埋めた。','地上に戻ってからも、{a}の胸の先は服に擦れるだけで硬く尖った。夜ごと迷宮の触手の夢を見ては、濡れた下着に気づいて、{a}は唇を噛んだ。'],
mb:['地上に戻った最初の夜、{a}は宿の寝台で一人、張りつめたものを握りしめた。思い浮かぶのは迷宮の触手のことばかりで、果てたあと、{a}は天井を見つめて溜息をついた。','地上に戻ってからも、{a}の下腹は迷宮の触手を思い出すだけで硬く張りつめた。夜ごと搾り取られる夢を見ては、汚れた寝具に気づいて、{a}は唇を噛んだ。'],
ft:['地上に戻った最初の夜、{a}は宿の寝台で一人、火照った体を持て余した。思い浮かぶのは、組み伏せた魔物の上で腰を揺らした感触ばかりだった。','地上に戻ってからも、{a}の体の奥は、魔物に跨ったときの熱を覚えていた。夜ごと獲物を組み伏せる夢を見ては、濡れた下着に気づいて、{a}は唇を噛んだ。'],
mt:['地上に戻った最初の夜、{a}は宿の寝台で一人、張りつめた熱を持て余した。思い浮かぶのは、組み伏せた魔物の奥まで沈めた感触ばかりだった。','地上に戻ってからも、{a}の下腹は、魔物を組み伏せたときの熱を覚えていた。夜ごと獲物の奥で果てる夢を見ては、汚れた寝具に気づいて、{a}は唇を噛んだ。'],
lowB:['地上に戻った最初の夜、{a}は宿の寝台で眠れずに寝返りを打ち続けた。思い出すまいとするほど、迷宮の甘い熱がよみがえってきた。','地上に戻ってからも、{a}は夜ごと迷宮の夢を見た。目を覚ますたびに、頬の火照りがなかなか引かなかった。'],
lowT:['地上に戻った最初の夜、{a}は宿の寝台で眠れずに寝返りを打ち続けた。思い出すのは、迷宮で獲物を追い詰めたときの昂りばかりだった。','地上に戻ってからも、{a}は夜ごと迷宮の夢を見た。夢の中の{a}は、いつも狩る側の目をしていた。']
};
var CLRP={
proud:{
clean:['{a}「当然の結果」――{a}はそう言い放ち、ギルドの誰よりも胸を張っていた。','{a}は主を倒した証を酒場の壁に掲げさせ、それを肴に何杯も杯を空けた。'],
caught:['{a}「捕まったのは、油断を誘うため」――誰も訊いていないのに、{a}は何度もそう言い張った。','{a}は捕まった回数を訊かれるたびに顔を背けた。{a}「そんなもの、数えてない」'],
marked:['{a}は体に残った火照りを「勝者の余韻」と呼んで譲らなかった。','{a}「この程度、何でもない」――そう言う{a}の頬は、まだうっすらと赤かった。'],
brink:['{a}「危なかった？　私が？」――{a}は笑い飛ばしたが、その指先は小さく震えていた。','{a}は二度とあの迷宮の話をしなかった。ただ、誰かがその名前を口にすると、黙って席を立った。']
},
stern:{
clean:['{a}は帰還の報告を簡潔に済ませると、すぐに次の依頼書を手に取った。','{a}「規律を守れば、迷宮も怖くない」――後輩たちに、{a}はそれだけを言い聞かせた。'],
caught:['{a}は捕らわれた回数を報告書に正確に書き込み、自分への戒めとした。','{a}「二度と、同じ失態はしない」――{a}はその夜、明け方まで剣を振り続けた。'],
marked:['{a}は冷たい水を浴びて体の熱を追い払い、乱れた心を規律で縛り直した。','{a}「修練が足りなかった」――{a}は残った火照りを、そう一言で片づけた。'],
brink:['{a}は帰還してから一週間、誰とも口をきかずに自分を律し直した。それでも夜になると、迷宮の熱が規律の隙間から忍び込んできた。','{a}「あれは、私の弱さ」――{a}は堕ちかけた自分を、決して許そうとしなかった。']
},
tsun:{
clean:['{a}「別に、大したことなかったし」――そう言いながら、{a}は褒められるたびに口元を緩めていた。','{a}は心配してくれた人の顔を見て、こっそり安堵の息をついた。{a}「…心配なんて、しなくてよかったのに」'],
caught:['{a}「捕まってなんかない。ちょっと、休んでただけ」――{a}の言い訳は、誰が聞いても苦しかった。','{a}は捕まった話になると、真っ赤になって話を逸らした。{a}「その話は、もういいから」'],
marked:['{a}「べ、別に、何もなかったから」――訊かれてもいないのに、{a}は何度もそう繰り返した。','{a}は火照りの残る体を毛布に包み、誰にも顔を見せずに眠った。'],
brink:['{a}「…危なかった。少しだけ」――{a}がそう認めたのは、帰還してから三日も経ってからだった。','{a}は迷宮のことを訊かれると、怒ったように黙り込んだ。けれど夜になると、毛布の中で迷宮の熱を思い出して身を縮めた。']
},
gentle:{
clean:['{a}は帰り道で摘んだ花を、宿の窓辺に飾った。{a}「無事に帰ってこられて、よかった」','{a}は迷宮で見かけた囚われ人のことを、ずっと気にかけていた。{a}「次は、あの人たちも連れて帰りたい」'],
caught:['{a}は手首の痕を撫でながら、穏やかに笑った。{a}「大丈夫。ちゃんと帰ってこられたから」','{a}は捕らわれていたあいだのことを、誰も責めずに話した。迷宮の魔物のことさえ、{a}は悪く言わなかった。'],
marked:['{a}は残った火照りを、温かい湯と甘いお茶でゆっくりと鎮めた。{a}「少しずつ、元に戻ればいい」','{a}は体に残った迷宮の名残を、責めることなく受け止めた。{a}「これも、私が生きて帰った証」'],
brink:['{a}は堕ちかけた夜のことを思い出すたびに、自分の手をそっと握った。{a}「戻ってこられたのは、運がよかっただけ」','{a}は穏やかに笑っていたが、迷宮の方角を見るときだけ、その目が少し潤んだ。']
},
devoted:{
clean:['{a}は秘宝を依頼主に届けると、深々と頭を下げた。{a}「役に立てて、本当によかった」','{a}は帰還するなり、待っていた人のもとへ駆けていった。{a}「ただいま。ちゃんと、帰ってきた」'],
caught:['{a}は捕まったことを、待っていた人にだけ打ち明けた。{a}「心配かけて、ごめんなさい」','{a}は何度捕まっても、帰りを待つ人の顔を思い浮かべて耐えた。その顔に再会したとき、{a}は声を上げて泣いた。'],
marked:['{a}は火照りの残る体のことを、誰にも言わずに抱えていた。{a}「みんなに迷惑はかけられないから」','{a}は迷宮で揺らいだ心を恥じて、待っていた人の手を強く握った。'],
brink:['{a}は堕ちかけたことを、泣きながら打ち明けた。{a}「もう少しで、帰れなくなるところだった」','{a}は帰ってからもしばらく、待っていた人の袖を離そうとしなかった。']
},
cool:{
clean:['{a}は迷宮の罠の配置を詳しく書き留め、ギルドに提出した。その資料は、後に続く冒険者たちの命綱になった。','{a}「想定どおり」――{a}の報告は、ギルドの記録係が拍子抜けするほど短かった。'],
caught:['{a}は捕らわれた状況を一つずつ分析し、拘束の型ごとの抜け方を書き残した。','{a}「捕まる確率は、下げられる」――{a}は帰還した翌日から、もう対策を練り始めていた。'],
marked:['{a}は体に残った反応を記録し、時間とともに薄れていく経過を淡々と書き留めた。','{a}「感度の上昇は一時的。たぶん」――最後の一言だけ、{a}の筆跡は少し乱れていた。'],
brink:['{a}は自分が堕ちかけた理由を、冷静に分析しようとした。けれど記録帳のその頁だけは、何度書いても破り捨てることになった。','{a}「あと少しで、戻れなかった」――{a}は数字で書けない恐怖を、初めて言葉にした。']
},
free:{
clean:['{a}「楽しかった！　次はどこに行く？」――{a}は帰還したその日のうちに、もう次の迷宮を探していた。','{a}は酒場で迷宮の武勇伝を語り、聞き手が飽きるまで杯を掲げ続けた。'],
caught:['{a}「捕まったのも、まあ、いい経験」――{a}はけろりと笑って、捕まった話を酒場の笑い話にした。','{a}は捕まった回数を指折り数えて、なぜか得意げだった。'],
marked:['{a}は火照りの残る体のまま、酒場で陽気に騒いだ。{a}「ちょっと熱いけど、気分は最高」','{a}は迷宮の名残を隠そうともせず、むしろ面白がっていた。'],
brink:['{a}は笑って帰ってきたが、迷宮の噂を聞くたびに、少しだけ目の色が変わった。{a}「…また行っても、いいかも」','{a}「ぎりぎりだったね」――{a}は笑ったが、その笑い声は、迷宮の奥で上げていた声に少し似ていた。']
},
shy:{
clean:['{a}は帰還を祝う人たちに囲まれて、真っ赤になって俯いた。{a}「そ、そんなに褒めないで」','{a}は誰にも気づかれないように、こっそりギルドの裏口から帰還の報告に行った。'],
caught:['{a}は捕まったときのことを訊かれると、顔を覆って逃げ出した。{a}「その話は、絶対にしないで」','{a}は捕らわれていたことを誰にも知られたくなくて、報告書のその欄を空白のまま出した。'],
marked:['{a}は火照りの残る顔を見られたくなくて、帰還してから三日、宿の部屋に籠もった。','{a}は湯浴みの最中に迷宮のことを思い出し、湯の中で耳まで赤くなった。'],
brink:['{a}は堕ちかけたときの自分を思い出すたびに、枕に顔を埋めて足をばたつかせた。{a}「…忘れたい。でも、忘れられない」','{a}は誰にも言えない秘密を抱えたまま、地上の暮らしに戻った。時々迷宮の夢を見ては、真っ赤になって目を覚ます。']
},
polite:{
clean:['{a}は帰還の報告を丁寧に終えると、依頼主に深く一礼した。{a}「依頼は、確かに果たした」','{a}は迷宮から持ち帰った秘宝を、傷一つつけずに差し出した。その手つきは、迷宮に入る前と少しも変わらなかった。'],
caught:['{a}は捕らわれていたことを、言葉を選んで淡々と報告した。{a}「見苦しいところを見せずに済んで、よかった」','{a}は手首の痕を手袋で隠し、何事もなかったように礼儀正しく振る舞った。'],
marked:['{a}は乱れた身なりを整え直してから、ようやく人前に出た。{a}「待たせてしまって、すまない」','{a}は体に残った熱を、丁寧な言葉遣いの下に隠した。'],
brink:['{a}は堕ちかけたことを、誰にも気取られないよう微笑みで覆った。それでも迷宮の名を聞くたびに、カップを持つ手が小さく揺れた。','{a}「恥ずかしい限り」――{a}はそれ以上何も言わず、深く頭を下げた。']
}
};
function rel(S,a,b){return S.rel&&S.rel[a.i<b.i?a.i+'-'+b.i:b.i+'-'+a.i];}
function bond(S,a,b){var r=rel(S,a,b);return r?r.trust+r.att*0.5-r.ten*0.3:0;}
function fallOchi(S,h){
var d=depth(S,h),per=FALL[h.persona]||FALL.gentle,lo=low(S),top=isTop(h);
var bk=lo?(top?'lowT':'lowB'):bodyKey(h);
var s=pk(S,per[d])+pk(S,BODY[bk][d]);
var mates=S.party.filter(function(x){return x!==h;});
if(mates.length){
var live=mates.filter(function(x){return!x.fallen;}),m;
if(S.over==='clear'&&live.length){
m=live.slice().sort(function(x,y){return bond(S,h,y)-bond(S,h,x);})[0];
var r=rel(S,h,m)||{trust:15,att:0,ten:0};
if(r.ten>40&&r.trust<15)s+=pk(S,MATE.cold);
else{
var will=m.tr.np*0.5+m.tr.cp*0.2+r.trust/60+r.att/120+(r.saved||0)*0.1;
s+=pk(S,MATE[S.rng()<will?'back':'left'][d]);
}
}else{
m=mates.slice().sort(function(x,y){return bond(S,h,y)-bond(S,h,x);})[0];
s+=pk(S,MATE[(m.fallOrder||99)<(h.fallOrder||99)?'first':'after'][d]);
}
return nm(s,h,m);
}
return nm(s,h);
}
function clearCat(h){
var cap=h.capN||0,hold=h.holdN||0,lost=h.lostN||0;
if(h.corrupt>=55)return'brink';
if(h.freedAtEnd||(isTop(h)?cap>=1||lost>=2:cap>=2||hold+lost>=4))return'caught';
if(h.corrupt<20&&h.climax===0&& !cap&&hold<=1&& !lost)return'clean';
return'marked';
}
DG.clearCat=clearCat;
function clearOchi(S,h){
var c=clearCat(h),per=CLRP[h.persona]||CLRP.gentle,top=isTop(h),s;
if(c==='brink')s=pk(S,BRINK[low(S)?(top?'lowT':'lowB'):bodyKey(h)]);
else{var B=CLR[c];s=pk(S,(top&&B.t)||B.b);}
return nm(s+pk(S,per[top&&c==='caught'?'marked':c]),h);
}
var TOPX={
join:{
fall:['迷宮の奥で触手を従える{a}の耳には、いまもあの日の{b}の声が残っている。初めて触手と並んで仲間を抱いたときから、{a}は狩る側でいることをやめられなくなった。','{a}は今も、触手に捕らわれた獲物を見つけると足を止める。助けるためではないことを、{a}自身がいちばんよく知っている。'],
clear:['地上に戻っても、{a}は{b}の前でだけは目を伏せる。触手に縛られた{b}を、助けるより先に抱いてしまったあの部屋のことを、二人はまだ一度も話していない。','{a}は帰還の報告で、あの部屋のことだけは書かなかった。助けに入ったはずの手が何をしたのか、{a}は今も夜中にふと思い出す。']
},
reach:{
fall:['{a}が最後に手を伸ばしたのは、魔物ではなく{b}だった。それから{a}は、迷宮の奥で獲物を探す目を隠さなくなった。','{a}は見ているだけでは足りなくなった夜のことを、今では笑って話す。笑いかける相手は、もう迷宮の魔物しかいない。'],
clear:['地上に戻ってからも、{a}と{b}の間には、迷宮で越えた一線の気配が残っていた。どちらも、それを罠のせいにはしなかった。','{a}は時々、迷宮で{b}に手を伸ばした夜のことを思い出す。思い出すたびに、あれが本当に迷宮のせいだったのか分からなくなる。']
},
watch:{
fall:['{a}を堕としたのは罠でも魔物でもなかった。仲間の乱れる姿を、目を逸らさずに見続けたこと――それだけで、{a}の中の何かは少しずつ形を変えていった。','{a}は今も迷宮の奥で、誰かが罠にかかる音に耳を澄ませている。見ているだけで満ちていく熱を、{a}はもう手放せない。'],
clear:['地上に戻った{a}は、迷宮で仲間が乱れていく姿を見ていたことを、誰にも話さなかった。それでも目を閉じると、あの声がまだ耳に残っていた。','{a}は罠にも魔物にも屈しなかった。ただ、仲間の乱れる姿から目を逸らせなかった自分のことだけは、いまだに許せずにいる。']
}
};
function topX(S,h){
var k=h.dgJoinN?'join':h.dgReachN?'reach':(h.dgWatch||0)>=15?'watch':'';
if(!k||(!h.fallen&&S.over!=='clear'))return'';
return nm(pk(S,TOPX[k][h.fallen?'fall':'clear']),h,{name:h.dgPartner||'仲間'});
}
DG.topX=topX;
var end0=DG.ending;
DG.ending=function(S){
var E=end0(S);
if(!E|| !Array.isArray(E.lines)|| !S.party)return E;
var solo=S.party.length===1;
S.party.forEach(function(h){
var t=h.fallen?fallOchi(S,h):S.over==='clear'?clearOchi(S,h):'';
if(!t)return;
t+=topX(S,h);
h.ochi=h.fallen?'fall-'+depth(S,h):'clear-'+clearCat(h);
E.lines.push((solo?'その後――':h.name+'のその後――')+t);
});
return E;
};
})();
});
;
/* ==== js/dungeon-host.js ==== */
HK.Load.def(169,'js/dungeon-host.js',function(){
(function(){
'use strict';
var HK=window.HK,DG=HK&&HK.DG;
if(!DG|| !HK.SCENARIOS|| !HK.SCENARIOS.dungeon|| !HK.Roles)return;
function L(s){return s.split('|');}
var ROLE={allowMob:true,allowNone:true,auto:'none',yes:'主催者になる',mob:{given:true},
desc:'迷宮を造った主催者を、住人がやるか・モブがやるか・なしにするかを選びます。住人の主催者は挑戦せず、観察室から挑戦者を眺めて品評し、ときどき罠を強めたり、お気に入りを助けたりします。住人が一人だけのときは主催者を置きません',
fit:function(c){var t=c.tr||HK.traits(c.eg);return 0.3+t.fc*0.5+t.cp*0.3+(t.lead||0)*0.3;}};
HK.Roles.install(HK.SCENARIOS.dungeon,'host','主催者',ROLE);
var T={
intro:{
res:L('迷宮の最奥には、誰も知らない小部屋がある。壁一面の水晶に、{n}の姿が映し出されていた。それを眺めながら頬杖をついているのは、この迷宮を一から組み上げた主催者――{h}だった。|{n}が入り口の扉をくぐった瞬間、迷宮のどこかで小さな鈴が鳴った。{h}は読みかけの設計図を閉じ、観察用の水晶に灯をともした。仲間が自分の迷宮に挑みに来たことを、{h}だけが知っていた。|罠の配置も、魔物の巣の場所も、すべて{h}が決めたものだった。{h}は観察室の椅子に深く腰かけ、水晶に映る{n}の顔を一人ずつ確かめた。挑戦者たちはまだ、この迷宮の主催者が誰なのかを知らない。'),
mob:L('入り口の石板には、主催者の名が刻まれていた。――{h}。{n}が足を踏み入れると、どこからともなく愉快そうな声が響いた。「ようこそ。私の迷宮を、存分に味わっていってくれ」|{n}の頭上で、ぱちりと水晶の目が開いた。「挑戦者が来たか。私は{h}、この迷宮の主催者だ」声は通路の奥から反響して、どこから聞こえるのか分からなかった。|迷宮の壁には、ところどころに小さな水晶が埋め込まれていた。それが主催者である{h}の目だと、{n}はすぐに気づいた。見られている――その感覚は、最初の部屋に入る前から肌にまとわりついていた。')
},
comment:{
proud:L('{h}は水晶に映る{a}を見下ろして、鼻を鳴らした。{h}「その程度の罠で足が止まるのか。造ったこっちが拍子抜けだ」{h}は次の部屋の仕掛けを、黙って一段きつく組み直した。|{h}は腕を組んだまま、水晶の中の{a}をじっと睨んでいた。{h}「いい顔をするじゃないか。もっと見せろ」口では文句を言いながら、{h}は一度も目を逸らさなかった。|{a}が罠をすり抜けるのを見て、{h}は舌打ちした。{h}「ちっ、勘のいい奴だ」{h}は手元の図面に、乱暴に赤い印をつけた。'),
stern:L('{h}は背筋を伸ばしたまま、水晶に映る{a}の足運びを見つめていた。{h}「踏み込みが甘い。あれでは次の階で捕まる」{h}は記録帳に、短く注意書きを書き加えた。|{h}は{a}の様子を、試験官のような目で検分していた。{h}「規則どおりに進めば、抜けられるように造ってある」それでも{a}が罠に足を取られると、{h}の眉がわずかに寄った。|{h}「……悪くない」{h}は罠を避けた{a}を見て、一言だけ呟いた。それ以上は何も言わず、{h}は次の部屋の仕掛けを点検し直した。'),
tsun:L('{h}は水晶の前で頬杖をついて、{a}をにらんでいた。{h}「べ、別に心配なんかしてないし。罠に引っかかればいいのに」そう言いながら、{h}の指は落ち着きなく机を叩いていた。|{h}「ふん、{a}のくせに、なかなかやるじゃない」{h}はぷいと顔を背けた。けれど横目は、ずっと水晶のほうを追いかけていた。|{a}が罠に足を取られると、{h}は思わず腰を浮かせた。{h}「……っ、今のは、仕掛けの具合を見ただけだから」誰もいない観察室で、{h}は誰にともなく言い訳をした。'),
gentle:L('{h}は温かいお茶を手に、水晶に映る{a}を眺めていた。{h}「あらあら、大変そう。でも、{a}ならきっと大丈夫」{h}は湯気の向こうで、のんびりと目を細めた。|{h}は{a}が罠に驚く顔を見て、くすくすと笑った。{h}「ごめんね、その仕掛け、ちょっと意地悪だったかしら」{h}は次の部屋の罠を、ほんの少しだけ緩めておいた。|{h}「がんばって、{a}」{h}は水晶に向かって、小さく手を振った。届くはずのない声援を、{h}は何度も繰り返した。'),
devoted:L('{h}は両手を胸の前で握りしめて、水晶の中の{a}を見守っていた。{h}「無理しないで……でも、ちゃんと最後まで見届けるから」{h}は{a}が次の部屋へ進むまで、瞬きも忘れていた。|{h}は{a}のために用意した仕掛けの一覧を、何度も読み返していた。{h}「喜んでもらえるかな。がんばって造ったんだ」水晶の中の{a}は、そんなことを知る由もなかった。|{h}「{a}、そこ、右の床は踏まないで……」{h}は届かない声で、ひとつひとつ罠の場所を教えていた。自分で仕掛けたものなのに、{h}はそれを忘れてしまったかのようだった。'),
cool:L('{h}は水晶に映る{a}の動きを、淡々と記録帳に書き留めていた。{h}「反応速度、想定より二割速い。罠の発動を少し早めるべきだな」{h}の声には、何の感情もこもっていなかった。|{h}は{a}の表情の変化を、指で数えるように観察していた。{h}「面白い。理性が削れるときは、まず視線が泳ぐのか」{h}はペン先で、次の項目に印をつけた。|{h}「{a}は慎重すぎる。もう少し大胆なら、もっと良い記録が取れるのに」{h}は水晶の角度を変えて、{a}を正面から捉えた。観察室には、ペンを走らせる音だけが響いていた。'),
free:L('{h}は水晶にかじりつくようにして、{a}の姿を追っていた。{h}「わ、今の見た！？めっちゃいい反応！」誰もいない観察室で、{h}は一人で手を叩いて喜んだ。|{h}「次はあの罠に引っかかってくれないかな～」{h}は足をぶらぶらさせながら、水晶の中の{a}に期待の目を向けた。{a}がそれを避けると、{h}は大げさに天井を仰いだ。|{h}は{a}が部屋を抜けるたびに、手元の板に丸をつけていた。{h}「よし、次はもっと面白いの出しちゃおう」{h}の頭の中では、もう新しい仕掛けの案が三つも四つも回っていた。'),
shy:L('{h}は水晶を指の隙間から覗いて、{a}の姿を追っていた。{h}「み、見てるだけ……見てるだけだから……」それでも{a}が罠に驚くたびに、{h}は自分のことのように肩をすくめた。|{h}は観察室の隅で膝を抱え、小さな声で呟いた。{h}「{a}に、こんなの造ったって知られたら……」頬を赤くしながらも、{h}は水晶から目を離せなかった。|{h}「ご、ごめんね、{a}……」{h}は罠の作動を知らせる鈴が鳴るたびに、小さく謝った。謝りながらも、{h}は次の仕掛けの準備をやめなかった。'),
polite:L('{h}は姿勢を正して、水晶に映る{a}に会釈した。{h}「ようこそお越しくださいました。次のお部屋も、心を込めてご用意しております」その声は、客を迎える宿の主人のように穏やかだった。|{h}は{a}の様子を見て、丁寧に記録帳を繰った。{h}「お疲れのようですね。少し休めるお部屋をご用意いたしましょうか」そう言いながら、{h}は次の罠の目盛りを確かめていた。|{h}「お見事です、{a}様」{h}は罠を抜けた{a}に、水晶越しに小さく拍手を送った。その笑顔は、どこまでも礼儀正しかった。')
},
tail:{
calm:L('{a}は、まだ涼しい顔で通路を歩いていた。|{a}の足取りは、まだしっかりとしていた。|{a}は地図を確かめながら、慎重に次の部屋をうかがっていた。'),
heat:L('{a}は頬を上気させて、壁に手をついていた。|{a}の息は浅く、足取りもどこか危うかった。|{a}は何度も首を振って、ぼんやりしかける意識を払っていた。'),
top:L('{a}は罠の残骸を踏み越えて、平然と次の部屋へ向かっていた。|{a}は壊した仕掛けを振り返りもせず、水晶のほうをちらりと睨んだ。|{a}の目は、迷宮そのものを品定めするように鋭かった。')
},
boost:{
b:L('{h}は手元の盤に並ぶ目盛りのひとつを、そっと押し上げた。次の瞬間、{a}の足元で、眠っていたはずの罠がもう一度光を放った。{h}「せっかく来たんだ、もう少し付き合ってもらおう」|{h}「ちょっと物足りないな」{h}が水晶を指で弾くと、{a}のいる部屋の空気が甘く淀んだ。止まっていた仕掛けが息を吹き返し、{a}の体にふたたび絡みついた。|{h}は{a}が罠を抜けかけたところで、壁の奥の歯車を一段回した。逃げ道だった扉がゆっくりと閉じ、部屋の罠がもう一巡、{a}を狙って動き出した。水晶の前で、{h}は満足そうに頷いた。'),
top:L('{h}は目盛りを押し上げて、{a}の足元の罠をもう一度動かした。けれど{a}は飛び出した仕掛けを素手で掴み、壁から引き剥がして放り捨てた。水晶越しに睨み返されて、{h}は思わず目盛りから手を離した。|{h}が歯車を回すと、{a}のいる部屋の罠が一斉に起き上がった。{a}はそれを一つずつ踏み砕き、最後に壁の水晶を指さした。{a}「見てるんだろう。次はそっちに行くぞ」|{h}は罠の勢いを上げたが、{a}は眉ひとつ動かさなかった。暴れる仕掛けを片手で押さえつけ、{a}は逆にその造りを確かめ始めた。{h}「……造り直しだな、あれは」')
},
save:{
cap:L('水晶の中で{a}が捕らわれたのを見て、{h}は思わず立ち上がった。{h}は迷わず盤の非常の札を引き、巣の仕掛けを止めた。拘束がほどけた{a}は、何が起きたのか分からないまま、床に膝をついた。|{h}「……それはやりすぎだ」{h}は唇を噛んで、{a}を捕らえた魔物を呼び戻す笛を吹いた。魔物は名残惜しそうに{a}を放し、壁の向こうへ引っ込んでいった。|{h}は観察室を飛び出し、隠し通路を駆け下りた。{a}を閉じ込めていた檻の鍵を外から開け、姿を見られる前にまた物陰へ消えた。{a}が振り返ったときには、そこには誰もいなかった。'),
cool:L('{h}は{a}の様子を見て、眉を寄せた。{h}「少し、休ませてあげないと」{h}が盤の札を一枚裏返すと、{a}の行く先に、冷たい泉の湧く小部屋が現れた。|{h}は罠の目盛りを、{a}の部屋の分だけそっと下げた。甘く淀んでいた空気がすっと澄み、{a}はようやく深く息をついた。{h}は、自分でも理由の分からない安堵を覚えた。|{h}「{a}には、ここで終わってほしくないんだ」{h}は迷宮の通路に、冷たい風を一筋だけ送り込んだ。火照った頬を撫でる風に、{a}は少しだけ正気を取り戻した。')
},
tease:L('通路の壁の中から、楽しげな声が響いた。「さっきの顔、とてもよかったよ、{a}」{a}は耳まで赤くなって、声のしたほうを睨みつけた。|{a}が休もうと腰を下ろすと、すぐそばの水晶が瞬いた。「休憩？いいね、ここからだとよく見える」{a}は慌てて立ち上がり、水晶に外套を被せた。|天井から、ひらりと一枚の紙が落ちてきた。そこには、{a}がさっき罠にかかったときの様子が、細かく書きつけられていた。最後の行には「次も期待している」とあり、{a}は紙を握りつぶした。'),
discover:L('{n}が辿り着いた小部屋の壁には、迷宮の設計図が何枚も貼られていた。図面の隅に書き込まれた癖のある字に、見覚えがあった。――{h}の字だ。|通路に響いた声は、聞き慣れたものだった。{n}が水晶を覗き込むと、その向こうで、{h}が気まずそうに手を振っていた。この迷宮を造った主催者は、仲間の{h}だったのだ。|隠し扉の向こうから、慌てた足音が聞こえた。{n}が扉をこじ開けると、観察用の水晶の前で、{h}が固まっていた。{h}「……あー。ばれちゃったか」'),
react:{
proud:L('{a}「{h}、お前の仕業か。あとで覚えてろよ」|{a}は拳を鳴らした。「出たら、真っ先に{h}を殴りに行く」|{a}「道理で、底意地の悪い罠ばかりだと思った」'),
stern:L('{a}は深いため息をついた。「{h}。説明してもらうぞ」|{a}「仲間を罠に掛けるとは、感心しないな、{h}」|{a}は眉間を押さえた。「……あとで、{h}には話がある」'),
tsun:L('{a}「は、はあ！？{h}が造ったの！？最っ低！」|{a}は真っ赤になって叫んだ。「{h}、全部見てたってこと！？」|{a}「べ、別に驚いてないし。{h}ならやりそうだと思ってたし」'),
gentle:L('{a}は目を丸くしてから、困ったように笑った。「まあ、{h}だったの」|{a}「{h}ったら、こんなに大がかりなものを造ってたのね」|{a}は頬に手を当てた。「どうりで、どこか優しい罠だと思ったわ、{h}」'),
devoted:L('{a}「{h}が……？でも、{h}が造ったなら、最後まで行かなきゃ」|{a}は胸に手を当てた。「{h}が、ずっと見ててくれたんだね」|{a}「{h}の迷宮なら、ちゃんと踏破してみせるから」'),
cool:L('{a}は目を細めた。「なるほど。罠の癖が、{h}の考え方そのものだ」|{a}「{h}か。なら、次の部屋の配置も読める」|{a}は小さく頷いた。「主催者が{h}だと分かれば、攻め方も変わる」'),
free:L('{a}「えっ、{h}なの！？すごい、全部{h}が造ったの！？」|{a}は手を叩いて笑った。「{h}、次の罠どんなの！？教えて！」|{a}「なあんだ、{h}かあ。じゃあ遠慮なく楽しんじゃお」'),
shy:L('{a}は顔を覆った。「{h}に、全部見られてたなんて……」|{a}「う、うそ……{h}が……？」|{a}は消え入りそうな声で呟いた。「も、もう、{h}の顔見られない……」'),
polite:L('{a}は目を見開いてから、静かに頭を下げた。「{h}さんでしたか。……あとで、お話を伺っても？」|{a}「{h}さんのご趣味だったのですね。存じませんでした」|{a}「なるほど、{h}さんが。……少々、驚きました」')
},
reactLove:L('{h}を見る{a}の目には、怒りよりも先に、ほっとしたような色が浮かんでいた。|{a}は一瞬むっとしてから、{h}らしいと小さく笑った。|{a}は、{h}にずっと見られていたのだと思うと、急に顔が熱くなった。'),
reactBad:L('{a}の目つきが険しくなった。{h}にだけは、弱みを見せたくなかった。|{a}「よりによって{h}か」――声には、隠しきれない棘があった。|{a}は{h}のいるほうを睨みつけ、二度と隙を見せないと決めた。'),
sex:{
lead:L('{b}が小部屋で息を整えていると、壁の一部が音もなく開いた。現れたのは、この迷宮の主催者――{a}だった。{a}「ずっと見てたんだ。そんな顔で歩かれたら、我慢できない」{a}は{b}の顎に指をかけ、熱を帯びた目を覗き込んだ。|隠し扉から出てきた{a}は、壁にもたれる{b}の前で足を止めた。{a}「罠の続き、私が直接してあげようか」低い声が耳元で囁き、{a}の手が{b}の腰を引き寄せた。{b}の喉が、小さく鳴った。|{a}は観察室を出て、{b}のいる部屋へまっすぐ降りてきた。{a}「主催者として、挑戦者の具合を確かめに来た」冗談めかした口調とは裏腹に、{a}の指は{b}の外套の留め具を迷いなく外していった。'),
offer:L('{b}が休んでいると、隠し扉から{a}がそっと顔を出した。{a}「……水晶越しに見てたら、私のほうがおかしくなっちゃった」{a}は{b}の隣に座り込み、火照った額を{b}の肩に押しつけた。|壁の奥から現れた{a}は、気まずそうに笑ってから、{b}の前に膝をついた。{a}「造った罠より、{b}のほうがずっと危ない」{a}は{b}の手を取り、自分の頬に押し当てた。|{a}は、{b}の前に姿を見せるつもりはなかった。けれど気づけば隠し扉を開け、{b}の袖を握りしめていた。{a}「お願い。少しだけ、そばにいさせて」')
},
refuse:L('{b}は{a}の手首を掴んで、静かに押し戻した。{b}「やめておこう。今は、迷宮の熱に流されたくない」{a}は少しだけ寂しそうに笑って、隠し扉の向こうへ戻っていった。|{b}は首を横に振り、{a}との間に一歩分の距離を取った。{b}「出てからなら、ちゃんと話を聞く」{a}は「……そっか」とだけ答えて、深く頭を下げた。|{b}は差し出された手を取らなかった。{b}「主催者が挑戦者に手を出すのは、反則だろう」{a}は肩をすくめて引き下がり、観察室へ続く階段を上っていった。'),
fade:L('{b}は、差し出された{a}の手を取った。二人は隠し扉の向こうへ消え、しばらく戻ってこなかった。{b}が通路に戻ってきたとき、その頬はまだほんのりと赤かった。|{b}が小さく頷くと、{a}は{b}の手を引いて、観察室へ続く階段を上っていった。扉が閉まり、水晶の灯がひとつ消えた。迷宮の通路には、しばらく誰の足音も響かなかった。|{a}は{b}を抱き寄せたまま、隠し扉を後ろ手に閉めた。その向こうで何があったのかは、迷宮の壁だけが知っている。戻ってきた{b}の外套は、留め具がひとつ掛け違えられていた。'),
after:L('事が済むと、{a}は{b}の乱れた髪を指で梳いた。{a}「続きは、迷宮を出てからね」{a}は隠し扉の向こうへ戻り、{b}はしばらく壁にもたれたまま動けなかった。|{b}が息を整えるあいだ、{a}は黙って外套を掛けてやった。{a}「……主催者失格だな、これは」苦笑いを残して、{a}はまた水晶の前へ戻っていった。|二人はしばらく、何も言わずに寄り添っていた。やがて{a}は名残惜しそうに{b}から離れ、隠し扉の取っ手に手をかけた。{a}「最後まで見てるから。がんばって」'),
end:{
resClear:L('迷宮の出口で{n}を待っていたのは、主催者の{h}だった。{h}は照れくさそうに頭をかいて、「踏破、おめでとう」と言った。差し出された手を握るかどうか、{n}は少しだけ迷った。|地上に戻った{n}のもとへ、{h}が駆け寄ってきた。{h}「全部見てた。……すごかったよ」主催者の顔と仲間の顔が、{h}の中でまだうまく混ざっていなかった。|{h}は迷宮の設計図を丸めて、{n}に手渡した。{h}「次は、もっと難しいのを造っておく」{n}は、それを受け取るべきか本気で悩んだ。'),
resFall:L('水晶の前で、主催者の{h}は長いあいだ黙り込んでいた。迷宮に呑まれていく{n}の姿を、{h}は最後まで見届けた。{h}「……造りすぎた、かな」|{h}は迷宮の最奥へ降りていき、堕ちた{n}の前に立った。主催者として迎えるべきか、仲間として連れ戻すべきか、{h}にはまだ決められなかった。水晶の灯だけが、二つの答えのあいだで揺れていた。|{h}は観察室の灯を一つずつ落としていった。最後の水晶に映る{n}は、もう出口のほうを見ていなかった。{h}はしばらく、消えた水晶の前から動けなかった。'),
resHidden:L('最後まで、{n}は主催者の正体に気づかなかった。{h}も、それを明かすつもりはなかった。迷宮の設計図は、{h}の机の引き出しにしまわれたままだ。|{h}は何食わぬ顔で、迷宮から戻った{n}を出迎えた。主催者の正体は、{h}だけの秘密になった。水晶に残った記録を、{h}はときどき一人で見返している。|{n}が主催者の正体を知るのは、もう少し先のことになる。{h}は迷宮の入り口に鍵をかけ、何もなかったような顔で家路についた。その鞄の中では、次の迷宮の設計図が出番を待っていた。'),
mobClear:L('迷宮の主催者、{h}の声が、最後にもう一度だけ響いた。「見事だ。また挑みに来るといい」{n}が振り返ったとき、入り口の石板の名は消えていた。|{n}が地上に出ると、どこからか拍手が聞こえた。主催者の{h}は、最後まで姿を見せなかった。「次の迷宮で待っている」――そんな書き置きだけが、出口の石に残されていた。|主催者の{h}は、踏破した{n}の名を迷宮の壁に刻ませた。それが称賛なのか、次の罠への招待状なのかは分からなかった。{n}は一度だけ振り返り、それから二度と振り返らなかった。'),
mobFall:L('主催者の{h}は、堕ちた{n}を迷宮の新しい住人として迎え入れた。{h}「ようこそ。ここはもう、君たちの家だ」水晶の灯は、ひとつ、またひとつと消えていった。|{h}の満足げな笑い声が、迷宮の隅々まで長く響いた。{n}の姿は、主催者の記録帳の最後の頁に書き加えられた。次の頁は、まだ白いままだった。|主催者の{h}は、水晶に映る{n}を眺めながら、新しい罠の設計図を広げた。挑戦者のいなくなった迷宮は、次の客を待って静まり返った。{h}の指先だけが、楽しげに図面の上を滑っていた。')
}
};
DG.HOST=T;
var P=function(){return HK.Pos;};
function R(S){return S.hostR;}
function pk(S,arr){
var U=S.hostUse=S.hostUse||{},free=[],i,t,r=R(S);
for(i=0;i<arr.length;i++)if(!U[arr[i]])free.push(arr[i]);
if(free.length)t=free[r.int(free.length)];
else{t=arr[0];for(i=1;i<arr.length;i++)if(U[arr[i]]<U[t])t=arr[i];}
S.hostUseN=(S.hostUseN||0)+1;U[t]=S.hostUseN;
return t;
}
function nm(s,m){return s.replace(/\{(a|b|h|n|t|u|ev)\}/g,function(x,k){return m[k]!=null?m[k]:x;});}
function names(l){return l.map(function(x){return x.name;}).join('・');}
function sayAs(S,h,o){var prev=S.h;S.h=h;var e=DG.say(S,o);S.h=prev;return e;}
function freeOf(S){return S.party.filter(function(x){return!x.fallen&& !x.captor&&x.corrupt<100&&x.reason>0;});}
function isTop(h){return!!(DG.isTop&&DG.isTop(h));}
function hasCurse(h,id){return h.curses&&h.curses.indexOf(id)>=0;}
function pn(S,s){(S.partyNotes=S.partyNotes||[]).push(s);}
function sexOk(a,b){
if(!a|| !b||a===b|| !P())return false;
if(!HK.State|| !HK.State.r18ok(a)|| !HK.State.r18ok(b))return false;
if(HK.ngPair&&HK.ngPair(a,b))return false;
if(HK.sexBlocked&&HK.sexBlocked(a,b))return false;
if(HK.State.pairSex&& !HK.State.pairSex(a,b))return false;
return P().okSex(a,b);
}
function loveOk(a,b){return HK.State&&HK.State.pairLove?HK.State.pairLove(a,b): !!(HK.canLove&&HK.canLove(a,b)&&HK.canLove(b,a));}
var NEAR= /^(lover|mate|fated|spouse|almost|crush|fwb|best|childhood|buddy|sibclose|worship)$/,BAD= /^(rival|enemy|bad|sibbad|ex)$/;
function tieOf(S,x){
var o={near:false,bad:false,w:0};
(S.ties||[]).forEach(function(t){
if(!((t.a===S.host.i&&t.b===x.i)||(t.b===S.host.i&&t.a===x.i)))return;
if(NEAR.test(t.type)&&(t.type!=='crush'||t.a===S.host.i)){o.near=true;o.w+=1;}
if(BAD.test(t.type)){o.bad=true;o.w-=0.8;}
});
return o;
}
DG.hostSetup=function(S,input){
var chars=(input&&input.chars)||[],env=(input&&input.env)||{};
var src=env[HK.Roles.envId('host')]||'auto';
S.host=null;
var anyYes=chars.some(function(c,i){var pc=input.perChar&&input.perChar[i];return pc&&pc.pick&&pc.pick.host==='yes';});
if(src==='none'||(src==='auto'&& !anyYes))return-1;
var rng=HK.rng(((+input.seed||0)*131+7919)>>>0);
var list=chars.map(function(c,i){var x={};for(var k in c)x[k]=c[k];x.i=i;x.tr=HK.traits(c.eg);return x;});
var r=HK.Roles.resolve({rng:rng,env:env,chars:list},'host',input,ROLE);
if(r.kind==='res'&&chars.length<2)r={kind:'none',who:[],mob:null};
if(r.kind==='none')return-1;
var h;
if(r.kind==='res'){
var c=chars[r.who[0].i];
h={i:r.who[0].i,name:c.name,eg:c.eg,tr:HK.traits(c.eg),gender:c.gender||'',likes:c.likes||'',tone:c.tone||'',fp:c.fp||'',pos:c.pos||'',posLike:c.posLike||'',futa: !!c.futa,
ng:Array.isArray(c.loveNG)?c.loveNG.filter(function(x){return x>=0;}):[],lock:HK.lockFirst(c.loveLock),locks:HK.parseLocks(c.loveLock),calls:c.calls||{}};
var sl=c.sexLock;h.sexLock=HK.sexLockOf(sl);
if(HK.charFlags)HK.charFlags(c,h,'dungeon');
h.kind='res';
}else{h=r.mob;h.i= -1;h.kind='mob';h.tr=h.tr||HK.traits(h.eg);}
h.persona=HK.personaOf(h);
h.climax=0;
S.host=h;S.hostR=HK.rng(((+input.seed||0)*37+104729)>>>0);
S.hostN=0;S.hostLast= -99;S.hostSex=0;S.hostKnown=h.kind==='mob';
return h.kind==='res'?h.i: -1;
};
function fav(S){
var h=S.host,best=null,bv= -9;
S.party.forEach(function(x){
var v=h.kind==='res'?tieOf(S,x).w+(HK.baseCompat?HK.baseCompat(h,x).aff/100:0):x===S.party[0]?0.2:0;
v+=R(S)()*0.2;
if(v>bv){bv=v;best=x;}
});
return best;
}
DG.hostStart=function(S){
var h=S.host;if(!h)return;
S.hostFav=fav(S);
if(h.kind==='res')(S.ties||[]).forEach(function(t){
if(!/^(lover|mate|fated|spouse)$/.test(t.type))return;
var o=t.a===h.i?t.b:t.b===h.i?t.a:null,x=o==null?null:S.party.filter(function(p){return p.i===o;})[0];
if(!x||(HK.ngPair&&HK.ngPair(h,x)))return;
(h.loveSet=h.loveSet||[]).push(x.i);(x.loveSet=x.loveSet||[]).push(h.i);
});
var o=sayAs(S,S.party[0],{kind:'sys',tag:'主催者',text:nm(pk(S,T.intro[h.kind]),{h:h.name,n:names(S.party)}),why:h.kind==='res'?'主催者：'+h.name+'（住人。挑戦はしない）／お気に入り：'+S.hostFav.name:'主催者：'+h.name+'（モブ）'});
DG.key(S,o,'主催者'+h.name+'の迷宮');
};
function discover(S,how){
var h=S.host;
if(S.hostKnown||h.kind!=='res')return null;
S.hostKnown=true;
var F=S.party.filter(function(x){return!x.fallen;});
if(!F.length)return null;
var t=nm(pk(S,T.discover),{h:h.name,n:names(F)});
F.slice(0,3).forEach(function(x){
t+=' '+nm(pk(S,T.react[x.persona]||T.react.gentle),{a:x.name,h:h.name});
var tt=tieOf(S,x);
if(tt.near&&loveOk(x,h))t+=nm(pk(S,T.reactLove),{a:x.name,h:h.name});
else if(tt.bad)t+=nm(pk(S,T.reactBad),{a:x.name,h:h.name});
});
var o=sayAs(S,F[0],{kind:'ev',tag:'主催者の正体',text:t,why:how||'迷宮の主催者が仲間だと気づいた'});
DG.key(S,o,'主催者が'+h.name+'だと気づいた');
pn(S,'この迷宮の主催者が'+h.name+'だと、'+names(F)+'は途中で気づいた。');
return o;
}
function comment(S,x){
var h=S.host,top=isTop(x),heat=x.pleasure>=45||x.corrupt>=45;
var t=nm(pk(S,T.comment[h.persona]||T.comment.gentle),{h:h.name,a:x.name})+nm(pk(S,T.tail[top?'top':heat?'heat':'calm']),{a:x.name});
sayAs(S,x,{kind:'ev',tag:'主催者',text:t,why:h.name+'の品評（態度「'+(HK.PERSONA[h.persona]?HK.PERSONA[h.persona].label:h.persona)+'」）'});
}
function boost(S,x){
var h=S.host,top=isTop(x);
S.h=x;
if(top){
sayAs(S,x,{kind:'ev',tag:'主催者の罠',text:nm(pk(S,T.boost.top),{h:h.name,a:x.name}),why:h.name+'が罠を強めたが、'+x.name+'は自分で攻めを選んでいるので、罠を壊して退けた'});
x.reason+=2;
return;
}
var ev={id:'host_boost',name:h.name+'が強めた罠',kind:'trap',themes:null,part:'any',power:9+S.env.trap/10,o:{},texts:[]};
DG.stim(S,ev,1);
sayAs(S,x,{kind:'ev',tag:'主催者の罠',text:nm(pk(S,T.boost.b),{h:h.name,a:x.name}),why:h.name+'が'+x.name+'の部屋の罠を強めた（快感 '+Math.round(x.pleasure)+'）'});
DG.flushQ(S);
if(DG.settle(S))DG.fallHero(S,x);
}
function save(S,x){
var h=S.host,cap= !!x.captor;
if(cap){x.captor=null;x.bossCapture=false;x.hp=Math.max(x.hp,30);x.reason+=4;}
else{x.pleasure=Math.max(0,x.pleasure-25);x.reason+=8;}
sayAs(S,x,{kind:'ev',tag:'主催者の助け舟',text:nm(pk(S,T.save[cap?'cap':'cool']),{h:h.name,a:x.name}),why:h.name+'がお気に入りの'+x.name+'を'+(cap?'捕らわれたところから助けた':'休ませた')});
pn(S,'主催者の'+h.name+'は、お気に入りの'+x.name+'にこっそり助け舟を出した。');
}
function tease(S,x){
x.reason-=3+x.tr.ac*4;
sayAs(S,x,{kind:'ev',tag:'主催者の声',text:nm(pk(S,T.tease),{h:S.host.name,a:x.name}),why:S.host.name+'が声でからかった（AC '+Math.round(x.eg.AC)+'）'});
}
function voice(S,s,bot,top){var TV=HK.ThickVM;return TV?TV.voice(R(S),s,bot,top):s.replace(/\{v[a-z0-9]+\}/g,'……っ');}
function eroFill(S,s,who,dom){
var E=HK.Ero;if(!E)return s.replace(/\{s:\w+\}。?|「\{m\d\}」――/g,'');
var d0=who.eroDom;if(dom)who.eroDom=true;
var out=E.fill({rng:R(S)},s,who);who.eroDom=d0;return out;
}
function combo(t,u){var tf=P().isF(t),uf=P().isF(u);return tf?(uf?'ff':'fm'):(uf?'mf':'mm');}
function spend(S,h,top){h.climax=(h.climax||0)+1;if(h.corrupt!=null){h.corrupt+=(top?2:3.5)*(S.k||1);h.pleasure=14+S.hostR.int(16);}}
function sexCand(S){
var h=S.host;
if(HK.SAFE_ON||h.kind!=='res'||S.hostSex|| !DG.TEMPT)return[];
return freeOf(S).filter(function(x){return(x.pleasure>=40||x.corrupt>=45||hasCurse(x,'heat'))&&sexOk(h,x);});
}
function descend(S,x){
var h=S.host,TT=DG.TEMPT,r=R(S);
var o=P().order(h,x,[h,x]),t=o[0],u=o[1],lead=t===h;
var M={a:h.name,b:x.name,t:t.name,u:u.name,ev:'罠'};
var intro=nm(pk(S,T.sex[lead?'lead':'offer']),M);
var tt=tieOf(S,x),love=loveOk(h,x);
var want=x.corrupt/90+x.pleasure/160+x.tr.fc*0.25+(tt.near?0.45:0)-(tt.bad?0.5:0)-x.tr.cp*0.3-Math.max(0,x.reason)/250+r()*0.4;
S.hostSex=1;
var why0=h.name+'が観察室から降りてきた（'+x.name+'の快感 '+Math.round(x.pleasure)+'・堕ち度 '+Math.round(x.corrupt)+'）';
if(want<=0.55){
x.reason+=3;
sayAs(S,x,{kind:'ev',tag:'主催者',text:intro+'\n\n'+nm(pk(S,T.refuse),M),why:why0+' → '+x.name+'は断った'});
return;
}
var X=HK.Lewd,cf=X&&X.conf('dungeon');
var low=(cf&&X.lv(S.env)==='low')||S.env.trap<15;
var thick= !low&&(S.env.lewdLen==='thick'||(S.env.lewdLen==='mix'&&r()<0.5)|| !cf);
var ero= !low&&cf&&X.ero(S.env)&& !!HK.Ero;
var cb=combo(t,u),parts=[];
if(low)parts.push(intro,nm(pk(S,T.fade),M));
else{
parts.push(intro+' '+nm(pk(S,TT.yield),M));
parts.push(nm(voice(S,pk(S,TT.act[cb]),u,t),M));
var cl=voice(S,pk(S,TT.climax[u.persona]||TT.climax.gentle),u,t);
if(ero){cl+=' '+eroFill(S,pk(S,TT.ero[cb]),u,false);cl+=' '+eroFill(S,pk(S,TT.eroTop[cb==='ff'||cb==='fm'?'f':'m']),t,true);}
cl+=' '+pk(S,TT.topFin[cb]);
parts.push(nm(cl,M));
parts.push(nm(pk(S,T.after),M));
}
spend(S,x,x===t);spend(S,h,h===t);
x.reason-=4;
S.hostSex=2;
var ev=sayAs(S,x,{kind:'ev',tag:'主催者',text:parts.join(thick||low?'\n\n':' '),why:why0+' → '+x.name+'は応じた（'+t.name+'が攻め）'+(love?'':'／恋愛にはしない組')});
DG.key(S,ev,h.name+'が'+x.name+'のもとへ降りてきた');
pn(S,'主催者の'+h.name+'は一度だけ観察室を降り、'+x.name+'と肌を重ねた。');
S.hostSexWith=x.name;
S.h=x;
if(DG.settle(S))DG.fallHero(S,x);
}
DG.hostRoom=function(S,hit){
var h=S.host;if(!h||S.over)return;
var r=R(S),F=freeOf(S);
var live=S.party.filter(function(x){return!x.fallen;});
if(!live.length)return;
if(h.kind==='res'&& !S.hostKnown&&S.floor>=Math.ceil(S.floors/2)&&r()<0.35){discover(S,'迷宮の後半で、主催者の手がかりを見つけた');return;}
if(S.hostFl!==S.floor){
S.hostFl=S.floor;
if(F.length&&r()<0.65){comment(S,(hit&&F.indexOf(hit.h)>=0&&r()<0.6)?hit.h:F[r.int(F.length)]);return;}
}
if((S.hostN||0)>=4||S.log.length-S.hostLast<6||r()>0.24)return;
var fv=S.hostFav&& !S.hostFav.fallen?S.hostFav:null,t=h.tr;
var opts=[];
if(fv&&(fv.captor&& !fv.bossCapture||fv.pleasure>=70||fv.corrupt>=75))opts.push(['save',0.6+t.np*0.8+(h.persona==='gentle'||h.persona==='devoted'?0.5:0),fv]);
var bt=F.filter(function(x){return!(HK.ngPair&&HK.ngPair(h,x));});
if(bt.length)opts.push(['boost',0.4+t.fc*0.5+t.cp*0.3+(h.kind==='mob'?0.4:0)+(/proud|tsun|cool|free/.test(h.persona)?0.3:0),bt[r.int(bt.length)]]);
if(F.length)opts.push(['tease',0.3+t.fc*0.4+t.ac*0.2,F[r.int(F.length)]]);
var sc=sexCand(S);
if(sc.length)opts.push(['sex',0.25+t.fc*0.3+(1-t.cp)*0.1,sc[r.int(sc.length)]]);
var pickd=HK.weighted(r,opts,function(o){return o[1];});
if(!pickd)return;
S.hostN=(S.hostN||0)+1;S.hostLast=S.log.length;
if(h.kind==='res'&& !S.hostKnown&&(pickd[0]==='sex'||r()<0.4))discover(S,pickd[0]==='sex'?'主催者が自分から姿を見せた':'聞き覚えのある声・見覚えのある手口で気づいた');
if(pickd[0]==='save')save(S,pickd[2]);
else if(pickd[0]==='boost')boost(S,pickd[2]);
else if(pickd[0]==='tease')tease(S,pickd[2]);
else descend(S,pickd[2]);
};
var end0=DG.ending;
DG.ending=function(S){
var E=end0(S),h=S.host;
if(!h|| !E|| !Array.isArray(E.lines))return E;
var clear=S.over==='clear',P0=S.party;
var who=clear?P0.filter(function(x){return!x.fallen;}):P0.filter(function(x){return x.fallen;});
if(!who.length)who=P0;
var key=h.kind==='mob'?(clear?'mobClear':'mobFall'): !S.hostKnown?'resHidden':clear?'resClear':'resFall';
E.lines.push(nm(pk(S,T.end[key]),{h:h.name,n:names(who)}));
if(h.kind==='res'&&S.hostSex===2&&S.hostSexWith)E.lines.push('主催者の'+h.name+'は、一度だけ観察室を降りて'+S.hostSexWith+'と肌を重ねた。'+(S.hostKnown?'':'そのとき見た顔のことを、'+S.hostSexWith+'は誰にも話していない。'));
return E;
};
var fin0=DG.finish;
DG.finish=function(S,input){
var res=fin0(S,input),h=S.host;
if(!h)return res;
res.host={name:h.name,kind:h.kind,i:h.i,known: !!S.hostKnown};
res.summary+='／主催者：'+h.name+(h.kind==='mob'?'（モブ）':'');
if(h.kind==='res'){
var seen={};
res.chars=res.chars.concat([{name:h.name,i:h.i}]).filter(function(c){if(seen[c.i])return false;seen[c.i]=1;return true;}).sort(function(a,b){return a.i-b.i;});
}
return res;
};
})();
});
;
/* ==== js/dungeon-events-a.js ==== */
HK.Load.def(176,'js/dungeon-events-a.js',function(){
(function(){
'use strict';
var DG=window.HK.DG,D=DG.D;
DG.add([
D('t_feather','羽根の壁','trap','*','side',16,'hold2','壁の穴から無数の羽根が飛び出し、{a}の{p}をくすぐり始めた。|通路が急に狭まり、両側の壁から生えた羽根が{a}の{p}を撫で回した。|{a}が足を踏み入れた瞬間、羽根の束が四方から伸びて、服の隙間に潜り込んだ。|天井から垂れた羽根の房が、{a}の{p}を執拗に往復した。|笑い声を上げまいとした{a}の{p}を、羽根はかえって丁寧になぞった。|羽根は笑わせるのをやめ、ゆっくりと甘くなぞる動きに変わった。'),
D('t_hands','壁から生える手','trap','imp ruin tower','any',20,'hold2;cloth1','石壁から何本もの白い手が生え、{a}の{p}をつかんだ。|{a}が壁に手をついた途端、壁の中から伸びた手が手首を握り返した。|通路の両側から無数の手が伸び、{a}の装備の留め具を一つずつ外していった。|見えない誰かの手が、{a}の{p}を確かめるように撫でた。|壁の手は{a}を引き寄せ、{p}を揉みほぐすように動いた。|手のひらの温度は人のものだった。それが{a}を余計に戸惑わせた。'),
D('t_hole','壁尻の穴','trap','imp tower','hips',24,'hold3;shame;cloth1','近道に見えた壁の穴をくぐろうとして、{a}の腰が穴にはまり抜けなくなった。|穴は{a}の腰の太さに合わせて、ぴたりと締まった。壁の向こうで、何かが近づいてくる気配がした。|{a}は上半身だけ向こう側に出たまま、身動きが取れなくなった。後ろ側に何かが触れた。|穴に挟まった{a}の{p}を、壁の向こうの何かがのんびり撫で始めた。|抜け出そうと身をよじるたび、{a}は壁の向こうに腰を突き出す形になった。'),
D('t_pit','粘液の落とし穴','trap','slime ruin','all',20,'cloth1;hold1','床が抜け、{a}は生温かい粘液の溜まりに落ちた。|{a}の足元が崩れ、腰まで粘液に沈んだ。粘液はゆっくりと這い上がってきた。|落とし穴の底は、ぬるりとした弾力のある何かで満たされていた。|{a}は粘液の中でもがいたが、動くほど全身にまとわりついた。|穴の底の粘液は、{a}の体温に合わせて温度を変えた。'),
D('t_gas','桃色の霧','trap','*','all',15,'sens.06;mind','部屋に桃色の霧が満ちた。{a}が気づいたときには、もう吸い込んでいた。|床の隙間から甘い霧が噴き出し、{a}の肌がじんわりと火照り始めた。|霧を吸った{a}の視界が、少しだけ潤んだ。|霧は肌からも染み込み、{a}の全身の感覚を鋭くしていった。|息を止めていた{a}も、やがて限界がきて霧を吸い込んだ。|霧の中で、服が肌に擦れるだけで{a}は息を詰めた。'),
D('t_vine','絡みつく蔓','trap','tent ruin','thigh',18,'hold2','床を這っていた蔓が{a}の足首に巻きつき、そのまま内腿を這い上がった。|{a}が蔓を払うと、別の蔓が{p}に絡みついた。|天井から垂れた蔓が{a}の手首を縛り、別の蔓が{p}を撫でた。|蔓は{a}の太腿にきつく巻きつき、ゆっくりと締めたり緩めたりを繰り返した。|蔓の先端から甘い樹液が滲み、{a}の{p}を濡らした。'),
D('t_brush','自動の筆','trap','tower','neck',16,'hold2','机の上の筆が浮かび上がり、{a}の{p}に何かを書き始めた。|魔法の筆が、{a}の{p}をゆっくりなぞって文字を描いた。くすぐったさがだんだん別のものに変わっていった。|筆は{a}の肌に「感度試験」と書き込んだ。書かれたところが熱を持った。|筆先が{a}の{p}をくるくると円を描くように往復した。|何本もの筆が、{a}の体のあちこちで同時に動き出した。'),
D('t_chair','拘束椅子','trap','tower imp','all',22,'hold3;cloth1','休もうと腰かけた椅子から枷が飛び出し、{a}の手足を固定した。|椅子に座った瞬間、背もたれから革のベルトが伸びて{a}を縛った。|拘束椅子が{a}を固定したまま、ゆっくり脚を開く形に変形した。|椅子の肘掛けから伸びた器具が、{a}の{p}に当てられた。|椅子は{a}を固定すると、細かく振動し始めた。'),
D('t_mirror','鏡の回廊','trap','imp tower','all',14,'mind;shame','回廊の鏡に、{a}の今の姿が何十も映し出された。乱れた服、火照った顔。|鏡の中の{a}が、こちらを見て意味ありげに笑った。|鏡は{a}の姿を、ここまでの罠にかかった瞬間ごとに映し替えた。|{a}は鏡に映った自分の表情に、思わず目を逸らした。|鏡の中の{a}が服をはだけ、「本当はこうしたいでしょう」と囁いた。'),
D('t_floor','振動する床','trap','tower ruin','hips',16,'','{a}が乗った床石が、低く唸るように振動し始めた。|床全体が細かく震え、{a}は膝から崩れ落ちた。|振動は足元から{p}へ這い上がり、{a}は立っていられなくなった。|{a}が床に手をつくと、振動が全身に伝わった。|床の振動は、{a}が逃げる方向へ追いかけてきた。'),
D('t_oil','香油の噴水','trap','imp ruin','chest',15,'sens.05;cloth1','天井から香油が降り注ぎ、{a}の服を肌に張りつかせた。|噴き出した香油が{a}の{p}を伝い、触れたところが熱くなった。|香油に濡れた{a}の体は、空気が動くだけで敏感に反応した。|滑る床に足を取られ、{a}は香油の溜まりに座り込んだ。|甘い香りの油が、{a}の首から胸へとゆっくり流れ落ちた。'),
D('t_bubble','泡の部屋','trap','slime','all',14,'cloth1','部屋いっぱいの泡が、{a}を包み込んだ。泡が弾けるたびに肌がくすぐられた。|ぬるい泡が{a}の服の中に入り込み、全身を洗うように動いた。|泡はただの泡ではなかった。{a}の{p}に吸いつくように集まってきた。|{a}は泡をかき分けて進んだが、泡は{p}にまとわりついて離れなかった。'),
D('t_tongue','舌のような絨毯','trap','imp slime','thigh',20,'hold2','足元の赤い絨毯が波打ち、{a}の足首から内腿を舐め上げた。|絨毯だと思っていたものは、柔らかく湿った肉だった。{a}の足を包み込んで離さない。|絨毯の毛が一斉に立ち上がり、{a}の{p}を舐めるようにくすぐった。|{a}が倒れ込むと、絨毯は全身をゆっくり這い回った。'),
D('t_suction','吸いつく器具','trap','tower','chest',22,'hold2;cloth1;dev2','壁から伸びたガラスの器具が、{a}の{p}に吸いついた。|吸盤のような器具が{a}の{p}に貼りつき、規則正しく吸い上げ始めた。|器具は{a}の反応を測るように、強さを少しずつ変えていった。|外そうとするほど、器具は{a}の{p}に強く吸いついた。'),
D('t_tickle','くすぐりの枷','trap','*','side',15,'hold3','{a}の手足に枷がはまり、脇腹を無数の指がくすぐった。|笑い転げる{a}の{p}を、指はしつこく責め続けた。|笑いすぎて息ができない。{a}の笑い声に、甘いものが混じり始めた。|くすぐりは止まらない。{a}の体は、触れられることそのものに過敏になっていった。'),
D('t_net','蜘蛛糸の網','trap','tent ruin','all',16,'hold2;cloth1','天井から粘つく網が落ちてきて、{a}を絡め取った。|網の糸は細く、{a}の肌に食い込むたびにぞくりとした。|もがくほど糸は{a}の体に絡みつき、恥ずかしい格好で固定された。|網の中で、糸が{a}の{p}をなぞるように締まった。'),
D('t_slide','粘液の滑り台','trap','slime','all',18,'cloth1','傾いた床で足を滑らせ、{a}は粘液の滑り台を一気に滑り落ちた。|滑り台の途中にあった無数の突起が、{a}の全身を擦っていった。|{a}は滑り落ちる途中で服が引っかかり、半分脱げた状態で下に着いた。|滑り台の終点は、ぬるい粘液の溜まりだった。'),
D('t_bell','嬌声の鈴','trap','imp ruin','ear',12,'curse=voice;shame','天井の鈴が鳴ると、{a}の喉から勝手に甘い声が漏れた。|鈴の音に合わせて、{a}は声を抑えられなくなった。|{a}が口を押さえても、鈴が鳴るたびに声がこぼれた。|鈴の音は{a}の耳の奥に残り、自分の声に自分で顔を赤くした。'),
D('t_rune','淫紋の魔法陣','trap','imp tower ruin','belly',18,'curse=mark;f2','床の魔法陣を踏んだ瞬間、{a}の下腹に熱い痛みが走った。|魔法陣の光が{a}の体を走り抜け、下腹に紋様が浮かび上がった。|{a}の下腹に、桃色に光る紋が刻まれた。触れるだけで体が跳ねた。|魔法陣は{a}の{p}に紋を焼きつけると、満足したように光を消した。'),
D('t_edge','寸止めの祭壇','trap','ruin tower','belly',16,'curse=edge;f3','祭壇に触れた{a}の体に、見えない鎖が巻きついた。「果ててはならぬ」と声がした。|祭壇の呪文が、{a}の体の奥に錠をかけた。|{a}の体に、達することを禁じる呪いが染み込んでいった。|祭壇の香が{a}を昂らせ、それでいて最後の一線を封じた。'),
D('t_heat','発情の香炉','trap','imp ruin','all',14,'curse=heat;f2','部屋の香炉から立ちのぼる煙が、{a}の体の奥に火を灯した。|煙を吸った{a}の鼓動が速くなり、体が勝手に熱くなった。|香炉の煙は{a}の肌にまとわりつき、消えない火照りを残した。|{a}は息を止めたが、煙は肌から染み込んできた。'),
D('t_double','感度倍加の針','trap','tower','neck',12,'curse=dbl;f3','壁から飛んだ細い針が{a}の首筋に刺さった。痛みはなく、ただ全身の感覚が倍になった。|針に塗られた薬が回り、{a}は服が擦れるだけで息を詰めるようになった。|針の痕から広がる熱で、{a}の肌は空気にすら敏感になった。'),
D('t_melt','衣を溶かす雨','trap','slime tent','all',12,'curse=melt;cloth2','天井から降った雫が、{a}の服を溶かしていった。|雫が触れたところから、{a}の装備がじわじわと透けていった。|{a}は雨を避けきれず、服の半分が溶けて消えた。|溶けた布地の下で、雫は{a}の肌を優しく撫でていった。'),
D('t_obey','服従の首輪','trap','imp tower','neck',14,'curse=obey;f3;lure=ac','床に落ちていた首輪が勝手に浮き上がり、{a}の首にはまった。|首輪がはまった瞬間、「跪け」という声に{a}の膝が従った。|首輪は{a}の首にぴったり馴染み、外そうとすると力が抜けた。|首輪から伸びた鎖を、誰もいないのに誰かが引いた。'),
D('t_dream','眠りの花粉','trap','tent ruin','all',10,'curse=dream;mind','花が一斉に花粉を吐き出した。{a}は急な眠気に襲われ、その場に膝をついた。|花粉を吸った{a}は、一瞬だけ淫らな夢を見た。|甘い花粉が{a}のまぶたを重くし、夢の中に何かが入り込んできた。'),
D('t_cage','吊り籠','trap','tower ruin','all',18,'hold3;shame','床が跳ね上がり、{a}は天井から吊られた籠の中に閉じ込められた。|籠の格子の隙間から、無数の指のようなものが伸びてきた。|籠はゆっくりと揺れ、{a}は格子越しに{p}を撫でられた。|籠は部屋の中央に吊るされ、{a}は誰かに見られている気がした。'),
D('t_bath','媚薬の湯','trap','imp ruin slime','all',18,'sens.08;cloth1;lure=fc','湯気の立つ浴槽が{a}を誘っていた。浸かった瞬間、湯が肌に吸いついた。|{a}は疲れた体を湯に沈めた。湯は甘く、体の芯まで火照らせた。|湯の中で、何かが{a}の{p}をそっと撫でた。|{a}は湯から上がろうとしたが、体が言うことを聞かなかった。'),
D('t_puppet','操り糸','trap','tower imp','all',16,'mind;hold2;lure=ac','見えない糸が{a}の手足に絡み、{a}の手が自分の{p}に伸びた。|操り糸は{a}の体を勝手に動かし、自分で自分を慰める格好をさせた。|{a}は抵抗したが、糸は{a}の指を{p}に這わせ続けた。|糸の先で誰かが笑っていた。{a}の体は、その笑いに合わせて動いた。'),
D('t_spring_floor','跳ね床の部屋','trap','tower','hips',12,'cloth1','跳ね床に乗った{a}は天井まで打ち上げられ、落ちた先の柔らかい何かに包まれた。|跳ね床で{a}の体が何度も跳ね、その度に服がずり落ちた。|跳ね上げられた{a}は、天井の突起に{p}を擦られた。'),
D('t_rope','縄の結界','trap','ruin imp','chest',18,'hold2;dev2','床から縄が飛び出し、{a}の体を亀甲に縛り上げた。|縄は{a}の{p}を強調するように締まり、動くたびに食い込んだ。|縛られた{a}は宙に吊られ、ゆっくり回転させられた。|縄の結び目が、ちょうど{a}の弱いところに当たっていた。'),
D('t_eyes','視線の壁','trap','imp tower','all',12,'mind;shame','壁一面に目が開き、{a}をじっと見つめた。|無数の目が{a}の{p}を見つめ、視線だけで肌が熱くなった。|{a}が隠そうとするたび、目は面白がるように細められた。|目に見られているだけなのに、{a}は撫でられているような気がした。'),
D('t_honey','蜜の滝','trap','tent','mouth',14,'sens.05','天井から甘い蜜が滴り、{a}の唇を濡らした。|蜜を舐めてしまった{a}の体が、内側から甘く痺れた。|{a}の髪から首筋へ、蜜がゆっくり流れ落ちていった。|蜜の匂いに誘われて、小さな何かが{a}の{p}に集まってきた。'),
D('t_wind','吐息の風','trap','imp tent','ear',12,'mind','温かい風が{a}の耳元を吹き抜けた。誰かの吐息のようだった。|風は{a}の耳に「気持ちいいでしょう」と囁いた。|風が{a}の首筋をゆっくりなぞり、肌が粟立った。|吐息のような風は、{a}が背を向けた方から吹いてきた。'),
D('t_lens','感度を測る水晶','trap','tower','chest',14,'shame;sens.04','水晶が{a}の体を照らし、空中に数字が浮かんだ。「感度：上昇中」|水晶は{a}の{p}に光を当て、反応を記録した。|水晶の光が当たるたび、{a}の体は勝手に跳ねた。|水晶は{a}の反応を読み上げた。{a}は耳を塞ぎたかった。'),
D('t_maze','肉壁の迷路','trap','slime tent','all',18,'hold2;f3','迷路の壁は柔らかく温かく、{a}が触れるたびに脈打った。|狭い通路で、両側の肉壁が{a}を挟み込んだ。|肉壁の迷路は、{a}が進むほど狭くなっていった。|壁が{a}の体の形に合わせてくぼみ、包み込んだ。'),
D('t_altar','贄の寝台','trap','ruin','all',22,'hold2;cloth1;f2','寝台に触れた瞬間、{a}は仰向けに引き倒され、四肢を光の枷で留められた。|寝台の周りの燭台が一斉に灯り、{a}は贄として祝福され始めた。|寝台から伸びた石の手が、{a}の{p}を清めるように撫でた。|{a}の耳に、古い祈りの言葉が延々と響いた。'),
D('t_slime_drop','天井のスライム','trap','slime','neck',16,'cloth1;hold1','天井から小さなスライムが落ちてきて、{a}の首筋から服の中へ滑り込んだ。|服の中に入り込んだスライムが、{a}の{p}をゆっくり這い回った。|{a}は服をはたいたが、スライムは肌に吸いついて離れなかった。|スライムは{a}の体温を吸って、少しずつ大きくなった。'),
D('t_pollen','催淫花の群生','trap','tent','all',18,'sens.06;lure=fc','色鮮やかな花畑が広がっていた。{a}が一輪摘むと、一斉に花粉が舞った。|{a}は花の香りに誘われて、花畑の真ん中まで歩いていった。|花粉を浴びた{a}の肌が、薄桃色に染まった。|花は{a}の体温に反応して、さらに花粉を吐き出した。'),
D('t_coin','金貨の山','trap','ruin imp','hips',16,'lure=fc;hold1','部屋の真ん中に金貨の山があった。{a}が手を伸ばした瞬間、金貨が溶けて粘液になった。|{a}が金貨をすくうと、山全体が波打って{a}の手首を呑み込んだ。|金貨の山は擬態だった。{a}の{p}にまとわりつき、甘く締めつけた。')
]);
})();
});
;
/* ==== js/dungeon-events-b.js ==== */
HK.Load.def(177,'js/dungeon-events-b.js',function(){
(function(){
'use strict';
var DG=window.HK.DG,D=DG.D;
DG.add([
D('m_slime','ピンクスライム','mon','slime','all',18,'hold2;cloth1','スライムは{a}に覆いかぶさり、服の中へ潜り込んだ。|スライムの体が{a}の{p}を包み込み、ぷるぷると震えた。|スライムは{a}を床に押し倒し、全身をゆっくり這い回った。|スライムは{a}の装備を少しずつ溶かしながら、{p}に吸いついた。'),
D('m_tentacle','触手の群れ','mon','tent ruin','any',22,'hold3','触手が{a}の手足に巻きつき、宙に吊り上げた。|細い触手が{a}の{p}を、羽根のようにくすぐった。|触手は{a}の服の隙間から入り込み、{p}を締めつけた。|太い触手が{a}の体を絡め取り、逃げ場をなくした。'),
D('m_succubus','淫魔','mon','imp','mouth',22,'mind;lure=fc','淫魔は{a}の顎をすくい上げ、深く口づけた。|淫魔は{a}の耳元で甘く囁き、{p}をなぞった。|淫魔の尻尾が{a}の腰に巻きつき、そっと引き寄せた。|淫魔は{a}の上に乗り、見下ろして微笑んだ。'),
D('m_incubus','夢魔の青年','mon','imp','neck',20,'mind;lure=ac','夢魔は{a}を壁に押しつけ、{p}に唇を落とした。|夢魔は{a}の手首を押さえつけたまま、ゆっくり服をはだけさせた。|夢魔は{a}に「いい子だね」と囁き、{p}を撫でた。|夢魔の指が{a}の{p}をなぞるたび、思考が溶けていった。'),
D('m_mimicdog','発情した魔狼','mon','tent ruin','neck',18,'hold1','魔狼は{a}を押し倒し、首筋に熱い息を吹きかけた。|魔狼の舌が{a}の{p}を舐め上げた。|魔狼は{a}の上にのしかかり、身動きを封じた。'),
D('m_plant','食虫花','mon','tent','all',20,'hold2;sens.05','巨大な花が{a}を丸ごと呑み込み、花弁を閉じた。|花の中は蜜で満たされていた。{a}は蜜に浸されながら、{p}を花糸で撫でられた。|食虫花は{a}を吐き出さず、ゆっくり蜜を染み込ませた。'),
D('m_golem','粘土のゴーレム','mon','tower ruin','hips',18,'hold2','ゴーレムは{a}を軽々と抱え上げ、膝の上に座らせた。|ゴーレムの大きな手が{a}の{p}を、加減を知らない力で揉んだ。|ゴーレムは{a}を抱えたまま、ぎこちなく撫で続けた。'),
D('m_gargoyle','石像の番人','mon','ruin','back',16,'hold2','石像の番人は{a}を背後から羽交い締めにした。|番人の冷たい石の指が、{a}の{p}をゆっくりなぞった。|番人は{a}を台座に押しつけ、動けなくした。'),
D('m_familiar','使い魔の群れ','mon','tower','any',16,'cloth1','小さな使い魔たちが{a}にまとわりつき、服を引っ張った。|使い魔たちは{a}の{p}を、小さな手で一斉にくすぐった。|使い魔たちは{a}の装備を一つずつ持ち去っていった。'),
D('m_bat','吸精蝙蝠','mon','imp ruin','neck',16,'hp6','蝙蝠が{a}の首筋に吸いついた。痛みはなく、甘い痺れだけが広がった。|蝙蝠の群れが{a}を包み、あちこちを小さく吸った。|蝙蝠に吸われた{a}の{p}が、じんじんと疼いた。'),
D('m_worm','粘液ワーム','mon','slime tent','thigh',18,'hold2','ワームが{a}の足に巻きつき、内腿を這い上がった。|ワームの粘液が{a}の{p}を濡らし、熱を持たせた。|ワームは{a}の服の中に潜り込み、這い回った。'),
D('m_doll','着せ替え人形','mon','tower imp','all',14,'cloth2;shame','人形たちが{a}の服を脱がせ、恥ずかしい衣装に着せ替えた。|人形は{a}に布の少ない衣装を着せ、満足げに拍手した。|人形たちは{a}を飾り立て、鏡の前に立たせた。'),
D('m_shadow','影の手','mon','imp tower','any',18,'mind;hold1','{a}の影から手が伸び、{p}をつかんだ。|影は{a}の動きをなぞりながら、{p}を撫でた。|影の手は{a}の体の内側に入り込むように、じわりと熱を広げた。'),
D('m_mermaid','湖の人魚','mon','slime ruin','mouth',18,'lure=np;mind','人魚は{a}を湖に引き込み、水の中で口づけた。|人魚は歌いながら{a}を抱きしめ、{p}を撫でた。|人魚の尾が{a}の脚に絡み、湖の底へ誘った。'),
D('m_mimic_npc','冒険者に化けた魔物','mon','*','any',20,'lure=np;hold2','助けを求めていた冒険者は、正体を現して{a}に覆いかぶさった。|偽の冒険者の手が、たちまち触手に変わって{a}を絡め取った。|偽物は{a}の耳元で「優しいね」と笑い、{p}をなぞった。'),
D('m_priest','堕ちた神官','mon','ruin','all',20,'mind;lure=ac','神官は{a}に跪くよう命じ、額に聖油を塗った。|神官は{a}の{p}を清めると言って撫で回した。|神官は祈りの言葉と共に、{a}の体に熱を注ぎ込んだ。'),
D('m_homunculus','実験体','mon','tower','chest',18,'hold1;dev2','実験体は{a}を床に押さえつけ、{p}を調べるように触った。|実験体は{a}の反応を観察しながら、同じところを何度も責めた。|実験体の指先から微弱な電流が流れ、{a}の{p}が跳ねた。'),
D('m_beetle','甘噛み甲虫','mon','tent','side',12,'','甲虫の群れが{a}の服の中に潜り込み、あちこちを甘噛みした。|甲虫は{a}の{p}を小さな顎でつまんだ。|{a}が払いのけるたび、甲虫は別のところに潜り込んだ。'),
D('m_imp','小悪魔の群れ','mon','imp','any',16,'cloth1;shame','小悪魔たちは{a}を取り囲み、からかいながら服を引っ張った。|小悪魔たちは{a}の{p}をつついては、反応を笑った。|小悪魔たちは{a}を押し倒し、くすぐり倒した。'),
D('m_ooze','巨大な粘体','mon','slime','all',24,'hold3;f3;cloth2','巨大な粘体が{a}を丸ごと呑み込んだ。中は温かく、全身が揉みほぐされた。|粘体の中で、{a}は呼吸だけを許されたまま全身を撫で回された。|粘体は{a}の装備を溶かしきり、肌にぴったりと張りついた。'),
D('m_knight','呪われた騎士','mon','ruin imp','hips',20,'lure=cp;hold1','騎士は{a}の剣を叩き落とし、腕をねじり上げた。|騎士は{a}を壁に押しつけ、鎧越しに体を密着させた。|騎士は「勝者の権利だ」と言って、{a}の{p}をつかんだ。'),
D('c_mimic','宝箱','chest','*','any',22,'hold2;good.4','宝箱の蓋が牙を剥き、中から伸びた舌が{a}の{p}に絡みついた。|宝箱はミミックだった。{a}の腕を呑み込み、中で何かが指を舐めた。|蓋が閉じて{a}の手首を挟み、箱の中から無数の触手があふれ出した。|宝箱の中身は、ぬるりとした生き物だった。'),
D('c_potion','桃色の小瓶','chest','*','mouth',16,'sens.1;lure=fc;good.35;item=herb','{a}は小瓶の中身を一口飲んだ。甘い。体が内側から熱くなった。|小瓶の栓を抜くと、甘い煙が{a}の顔を包んだ。|{a}は回復薬だと思って飲み干した。違った。'),
D('c_book','禁書','chest','tower ruin','all',14,'mind;lure=a;good.4','{a}は禁書を開いた。文字が目に飛び込み、頭の中で淫らな映像になった。|禁書のページから、文字が蛇のように這い出して{a}の腕に絡んだ。|{a}は禁書の一節を読み上げてしまった。体が呪文に応えて熱くなった。'),
D('c_ring','紅い指輪','chest','imp ruin','all',14,'curse=heat;lure=fc;good.35','{a}が指輪をはめた瞬間、指から全身に熱が走った。|指輪は{a}の指から抜けなくなった。脈打つたびに体が火照った。|指輪の宝石が光り、{a}の体の奥を甘く疼かせた。'),
D('c_cloth','綺麗な衣装','chest','imp tower','all',14,'cloth2;shame;lure=fc;good.3;item=cloak','{a}が衣装を手に取ると、衣装は勝手に{a}に着せられた。布はほとんど透けていた。|衣装は{a}の体に吸いつくように縮み、{p}を締めつけた。|衣装の裏地が、{a}の肌を絶えず撫で続けた。'),
D('c_idol','小さな神像','chest','ruin','belly',14,'curse=mark;good.4','{a}が神像を持ち上げると、神像の目が光り、下腹に熱が刻まれた。|神像は{a}の手の中で温かくなり、熱が{p}に流れ込んだ。|{a}は神像に触れた瞬間、祝福とも呪いともつかないものを受け取った。'),
D('c_box','鍵のかかった小箱','chest','tower','chest',14,'good.5','小箱を開けると、中から小さな器具が飛び出して{a}の{p}に貼りついた。|小箱から伸びた魔法の手が、{a}の{p}をつまんだ。|小箱の中には「感度試験用」と書かれた札と、震える何かが入っていた。'),
D('c_egg','温かい卵','chest','slime tent','belly',16,'hold1;good.3','{a}が卵を拾うと、殻が割れて中のものが{a}の服の中に潜り込んだ。|卵から孵ったものは、{a}の{p}に吸いついて離れなかった。|卵は{a}の手の中で溶けて、粘液になって腕を伝った。'),
D('c_pillow','ふかふかの寝台','chest','imp','all',16,'hold2;lure=fc;good.3','{a}が寝台に身を投げると、寝台が{a}を包み込み、全身を揉みほぐし始めた。|寝台の布団が{a}に絡みつき、離してくれなかった。|寝台は{a}の体の形を覚えて、弱いところを探り当てた。'),
D('c_crystal','光る結晶','chest','tower ruin slime','all',12,'sens.08;good.45;item=holy','{a}が結晶に触れると、光が体に吸い込まれ、全身の感覚が鋭くなった。|結晶は{a}の手の中で砕け、きらきらした粉が肌に染み込んだ。|結晶の光を浴びた{a}は、しばらく自分の鼓動の音しか聞こえなかった。'),
D('c_pouch','冒険者の荷袋','chest','*','any',12,'good.6','荷袋の中身は、先に堕ちた冒険者の「道具」だった。{a}の手に触れた途端、勝手に動き出した。|荷袋の底に潜んでいたスライムが、{a}の手を伝って這い上がった。'),
D('s_pink','桃色の泉','spring','*','all',18,'sens.08;good.35','泉の水は甘かった。{a}の体の奥に、じんわりと火が灯った。|{a}が水をすくうと、水面に自分の淫らな顔が映った。|飲んだ水が体中を巡り、{a}は熱い息を吐いた。'),
D('s_milk','乳白色の泉','spring','ruin imp','chest',16,'dev2;good.4','泉の水を飲んだ{a}の{p}が、じんじんと張りつめた。|白い水は{a}の体を内側から熱くし、{p}を疼かせた。|{a}は泉の水を浴び、肌が甘い匂いを放ち始めた。'),
D('s_slime','透き通った湧き水','spring','slime','mouth',16,'hold1;good.4','湧き水だと思ったものはスライムだった。{a}の唇から喉へ、ぬるりと入り込んだ。|水面から伸びた透明な腕が、{a}を泉に引き込んだ。|{a}が口をつけた水は、自分から{a}の口の中へ流れ込んできた。'),
D('s_hot','湯けむりの泉','spring','imp ruin tent','all',14,'curse=heat;good.5','{a}は温泉に浸かった。湯は心地よく、心地よすぎた。|湯けむりを吸い込んだ{a}の体が、湯から上がっても熱いままだった。|湯の中で、{a}の体の芯が溶けていくようだった。'),
D('s_mirror','鏡の泉','spring','tower imp','all',12,'mind;good.5','泉の水面に映った{a}が、水の中から手を伸ばして{a}を撫でた。|水面の{a}は、{a}が隠したい顔をして笑っていた。|{a}は鏡の泉に映る自分に、目を奪われた。'),
D('o_whisper','囁く声','odd','*','ear',14,'mind','耳元で誰かが「もう諦めていいよ」と囁いた。{a}の膝から力が抜けた。|囁き声は{a}の名前を、甘く何度も呼んだ。|声は{a}がここまでにされたことを、一つずつ数え上げた。|囁きは「本当は気持ちよかったでしょう」と訊いた。'),
D('o_moan','壁越しの嬌声','odd','*','all',12,'mind;lure=fc','壁の向こうから、誰かの甘い声が聞こえてきた。{a}は思わず耳を澄ませた。|嬌声は途切れることなく続いた。{a}はその声の主を想像してしまった。|{a}は壁に耳を当てていた。いつからそうしていたのか分からない。'),
D('o_memory','甘い記憶の幻','odd','imp tower','all',14,'mind','{a}の前に、昔好きだった誰かの幻が現れて手を差し伸べた。|幻は{a}の一番弱い記憶を、甘く書き換えて見せた。|幻の中で、{a}は大切な誰かに抱きしめられていた。|{a}は幻だと分かっていて、それでも手を伸ばしてしまった。'),
D('o_self','もう一人の自分','odd','imp tower ruin','all',16,'mind;f2','堕ちた姿の{a}が現れて、{a}を抱きしめた。「こっちは楽だよ」|もう一人の{a}は、{a}の弱いところを全部知っていた。|もう一人の{a}が耳元で囁いた。「あなたが望んでいることを、私は知ってる」'),
D('o_painting','淫らな壁画','odd','ruin imp','all',10,'mind;shame','壁画には、かつての挑戦者たちの末路が描かれていた。{a}は目を離せなかった。|壁画の人物たちが、{a}を手招きしているように見えた。|壁画の中の一人が、{a}と同じ顔をしていた。'),
D('o_voice_cmd','命令する声','odd','tower imp ruin','all',14,'mind;lure=ac','天井から声がした。「脱げ」。{a}の手が、勝手に留め具にかかった。|声は{a}に、壁に手をつくよう命じた。{a}はそうしていた。|声は{a}を「いい子」と褒めた。{a}の胸が、なぜか温かくなった。'),
D('o_trophy','堕ちた冒険者の遺品','odd','*','all',10,'mind','{a}は堕ちた冒険者の日記を見つけた。最後のページは、幸せそうな文字で埋まっていた。|遺品の中に、先輩冒険者の見慣れた紋章があった。{a}は唇を噛んだ。|日記の最後には「ここは天国」とだけ書かれていた。'),
D('o_hint','壁の落書き','odd','*','all',0,'free;heal4','壁に、先に挑んだ誰かの落書きがあった。「自分の名前を忘れるな」。{a}は少し救われた。|壁に刻まれた罠の位置の図を、{a}は頭に叩き込んだ。|「ここから先、宝箱は開けるな」と書かれていた。{a}は肝に銘じた。'),
D('o_fairy','道案内の妖精','odd','tent ruin','all',0,'free;item=map','小さな妖精が現れて、{a}に地図をくれた。「気をつけてね、ここの子たちはえっちだから」|妖精は{a}の周りを飛び回り、罠の位置を教えてくれた。'),
D('o_merchant','迷宮の行商人','odd','*','all',0,'free;item=herb','怪しい行商人が「お代はいらないよ、どうせ戻ってこないからね」と薬草を押しつけた。|行商人は{a}の顔を見て、鎮静の薬草を一束くれた。「顔が赤いよ」'),
D('o_chain_sound','鎖の音','odd','tower ruin','all',10,'mind','どこからか鎖の擦れる音が響いた。{a}は自分が縛られる想像をしてしまった。|鎖の音は{a}の後をついてきた。振り向くと何もなかった。|鎖の音を聞くたび、{a}の手首が疼いた。'),
D('o_scent','懐かしい匂い','odd','imp tent','all',12,'mind;lure=np','部屋に、大切な人の匂いが漂っていた。{a}は思わず深く吸い込んだ。|匂いは{a}の記憶をくすぐり、体の奥を温めた。|匂いをたどった先で、{a}は罠の真ん中に立っていた。'),
D('o_sleep','眠りを誘う子守唄','odd','tent ruin slime','all',12,'mind','子守唄が聞こえた。{a}はまぶたが重くなり、夢の中で誰かに抱かれた。|子守唄は{a}の緊張をほどき、無防備にさせた。|うとうとした{a}の体を、何かがそっと撫でていった。'),
D('n_adventurer','囚われた冒険者','captive','*','any',18,'hold2','冒険者の枷を外そうとした{a}の手首に、同じ枷がはまった。|冒険者を助けようとした{a}は、同じ罠に絡め取られた。|{a}と冒険者は、同じ触手に背中合わせで縛られた。'),
D('n_bait','助けを呼ぶ声','captive','*','any',22,'hold2;bait','声の主はいなかった。助けを求める声そのものが罠だった。|{a}が駆けつけた先には、口を開けた魔物の巣があった。|「助けて」の声は、{a}が罠の真ん中に立つと「ありがとう」に変わった。'),
D('n_lover','蕩けた顔の挑戦者','captive','imp slime tent','mouth',18,'mind;hold1','助けた挑戦者は、蕩けた顔で{a}に口づけた。「一緒に気持ちよくなろう」|挑戦者は{a}にしがみつき、離れようとしなかった。|堕ちた挑戦者は、{a}を自分のいた罠へ引きずり込んだ。'),
D('n_child_of_tower','実験台の助手','captive','tower','chest',16,'hold2','実験台に縛られた助手を解放すると、警報が鳴り、{a}が代わりに縛られた。|助手は泣きながら謝った。「ごめんなさい、こうしないと私が」'),
D('n_priestess','祭壇の巫女','captive','ruin','belly',18,'curse=mark;hold1','巫女を祭壇から下ろした瞬間、儀式の光が{a}に移った。|巫女の淫紋が、触れた{a}の手を伝って移ってきた。'),
D('k_nest','巣','cap','*','any',22,'','{a}は{t}の巣の奥に横たえられ、交代で撫で回された。|{t}は{a}を巣の真ん中に置き、飽きることなく{p}を責めた。|巣の中は温かく、{a}は時間の感覚を失っていった。'),
D('k_display','見世物','cap','*','all',20,'shame','{a}は台座に縛りつけられ、魔物たちの見世物にされた。|魔物たちは{a}の反応を見て、楽しそうに鳴いた。|{a}の痴態は、迷宮中の魔物に見られていた。'),
D('k_milking','搾り取り','cap','*','all',24,'dev2','{t}は{a}を吊るし、何度も何度も達しさせた。|{a}は{t}に、反応が鈍るまで責められ続けた。|{t}は{a}の弱いところを見つけ、そこばかりを狙った。'),
D('k_training','躾け','cap','*','all',18,'mind;lure=ac','{t}は{a}が抵抗するたびに止め、従うと褒めた。|{a}は{t}に、自分から求める言葉を覚えさせられた。|{t}は{a}に、従うことの心地よさを教え込んだ。'),
D('k_slime_bed','粘液の寝床','cap','slime','all',22,'','{a}は粘液の寝床に沈められ、全身を休みなく揉まれた。|粘液は{a}の体を包み込み、一番弱いところを探し続けた。'),
D('k_vine_bed','蔓の揺りかご','cap','tent','all',22,'','{a}は蔓の揺りかごに吊るされ、花粉と蜜を与えられ続けた。|蔓は{a}をあやすように揺らしながら、{p}を撫で続けた。'),
D('k_lab','観察台','cap','tower','all',20,'sens.05','{a}は観察台に固定され、反応を記録され続けた。|{a}の{p}に器具が取りつけられ、数値が読み上げられた。'),
D('k_rite','儀式の贄','cap','ruin imp','all',22,'curse=mark','{a}は祭壇の上で、昼夜の区別なく祝福を受け続けた。|儀式のたびに、{a}の下腹の紋が深くなっていった。')
]);
})();
});
;
/* ==== js/dungeon-events-c.js ==== */
HK.Load.def(178,'js/dungeon-events-c.js',function(){
(function(){
'use strict';
var DG=window.HK.DG,D=DG.D;
DG.add([
D('t2_dart','媚薬の吹き矢','trap','*','neck',12,'sens.08','壁の穴から吹き矢が飛び、{a}の首筋に刺さった。痛みより先に熱が来た。|首筋の小さな痛みのあと、{a}の全身に甘い痺れが広がった。|吹き矢の薬が回り、{a}は服の擦れにも息を詰めた。|抜いた矢の先から、甘い匂いがした。'),
D('t2_ghost','透明な指の部屋','trap','imp tower','any',20,'hold2','誰もいない部屋で、見えない指が{a}の{p}をなぞった。|{a}が振り払っても、透明な指は別のところに現れた。|何十本もの透明な指が、{a}の体を確かめるように這った。|見えない誰かに、{a}は後ろから抱きすくめられた。'),
D('t2_sucker','吸盤の床','trap','slime tent','thigh',18,'hold1','床一面の吸盤が{a}の足に吸いつき、内腿へ這い上がった。|一歩ごとに吸盤が{a}の脚に吸いつき、離れるときに音を立てた。|吸盤は{a}の{p}を、ちゅっと吸っては離した。|転んだ{a}の全身に、吸盤が一斉に吸いついた。'),
D('t2_earwall','耳を食む壁','trap','imp slime','ear',16,'mind','壁に寄りかかった{a}の耳を、壁から生えた唇が食んだ。|壁の唇が{a}の耳の縁を、ゆっくりなぞった。|{a}の耳の中に、湿った吐息が流し込まれた。|壁は{a}の耳元で、名前を何度も囁いた。'),
D('t2_massage','自動按摩台','trap','tower','back',18,'hold2','休めそうな台に横になると、台から無数の指が生えて{a}の背中を揉み始めた。|按摩台の指は、凝りをほぐすふりをして{a}の{p}へ降りていった。|按摩台は{a}が力を抜くたび、手つきを甘くした。|心地よさに目を閉じた{a}の背中を、指がすっとなぞった。'),
D('t2_cups','胸当ての罠','trap','tower ruin','chest',22,'dev2;hold1','拾った胸当てを着けた瞬間、内側が柔らかく{a}の胸を揉み始めた。|胸当ては外れず、内側で{a}の{p}を捏ね続けた。|胸当ての内側に生えた突起が、{a}の{p}を擦った。|胸当ては{a}の鼓動に合わせて、締めたり緩めたりした。'),
D('t2_undermist','下着だけ溶かす霧','trap','slime imp','hips',10,'cloth1;shame','霧が晴れると、{a}の下着だけが消えていた。|霧は器用に、{a}の肌に一番近い布だけを溶かした。|{a}は外見は無事なまま、中身だけ心もとなくなった。|霧の通り過ぎたあと、{a}の歩き方がぎこちなくなった。'),
D('t2_tablet','読み上げの碑文','trap','ruin tower','all',14,'mind;shame;lure=a','扉を開けるには碑文を読み上げろとあった。{a}が読むと、それは淫らな詩だった。|{a}は碑文を声に出して読んだ。一節ごとに体が熱くなった。|碑文の言葉は、読み上げた{a}の体に意味どおりのことをした。|{a}は最後の一行を、どうしても声に出せなかった。'),
D('t2_paddle','尻叩きの板','trap','imp tower','hips',16,'shame','壁から飛び出した板が、{a}の腰を景気よく叩いた。|乾いた音が響くたび、{a}の腰がじんと熱を持った。|板は{a}が数を数えるまで叩くのをやめなかった。|叩かれたところが、触れられるだけで疼くようになった。'),
D('t2_brushgrass','毛筆草の通路','trap','tent','side',14,'','筆の穂のような草が、通り抜ける{a}の脇腹を撫でた。|毛筆草は{a}の服の裾から入り込み、肌をくすぐった。|身をよじるほど、草の穂は{a}の{p}を的確になぞった。|{a}は笑いを堪えながら、草の通路を抜けた。'),
D('t2_vent','吐息の通気口','trap','tower imp','neck',12,'mind','通気口から、熱い吐息のような風が{a}の首筋に吹きつけた。|規則正しい吐息が、{a}のうなじを撫で続けた。|{a}は誰かの息遣いに、背中をぞくりとさせた。|通気口の風は、{a}の耳元でふっと止まった。'),
D('t2_sauna','発汗の部屋','trap','ruin imp','all',16,'sens.06','部屋の熱で、{a}は汗だくになった。汗が肌を伝うたび、甘い痺れが走った。|熱気のこもる部屋で、{a}の汗は媚薬のように肌を敏感にした。|{a}は上着を脱がずにいられなかった。|汗に濡れた肌に、熱い空気がまとわりついた。'),
D('t2_hugdoll','抱きつく人形','trap','tower imp','all',18,'hold2','床に落ちていた等身大の人形が、{a}に抱きついて離れなくなった。|人形の腕は柔らかく、{a}の体の線をなぞるように締まった。|人形は{a}の首筋に頬をすり寄せた。|人形の手が、いつの間にか{a}の{p}に回っていた。'),
D('t2_keyhole','舐める鍵穴','trap','tower ruin','mouth',12,'lure=fc','扉の鍵穴に指を入れると、中の何かが{a}の指を舐めた。|鍵穴の奥から出てきた舌が、{a}の指先から手首へ這った。|鍵穴を覗き込んだ{a}の唇に、温かいものが触れた。|指を抜こうとすると、鍵穴はちゅっと吸いついた。'),
D('t2_horse','揺れる木馬','trap','imp tower','hips',22,'hold2;shame','{a}は床の仕掛けで跳ね上げられ、木馬の背に落ちた。木馬が揺れ始めた。|木馬はゆっくりと前後に揺れ、{a}の腰を揺さぶった。|降りようとすると、木馬の揺れが激しくなった。|木馬の背は、{a}の{p}にぴたりと合う形をしていた。'),
D('t2_mirrorhand','鏡の中の手','trap','imp tower','chest',16,'mind','鏡の中の{a}が、自分の胸に手を這わせた。こちらの{a}にも同じ感触がした。|鏡像の指の動きが、そのまま{a}の肌に伝わった。|鏡の中の{a}は、こちらの{a}より大胆だった。|{a}が目を逸らしても、鏡像は触るのをやめなかった。'),
D('t2_share','感覚共有の首輪','trap','tower imp','all',20,'mind;f2','首輪がはまった瞬間、どこかで責められている誰かの快感が{a}に流れ込んだ。|首輪を通して、知らない誰かの絶頂が{a}の体を駆け抜けた。|{a}は自分ではない誰かの感覚に、何度も震えた。|首輪は外れたが、流れ込んだ熱は残った。'),
D('t2_spotlight','弱点を照らす光','trap','tower ruin','any',14,'shame;sens.05','天井の光が、{a}の一番弱いところを正確に照らし出した。|光が当たった{a}の{p}が、触れられてもいないのに疼いた。|光は{a}の弱点を一つずつ照らし、数字を書き込んだ。|照らされたところを隠そうとして、{a}は自分で触れてしまった。'),
D('t2_music','踊らされる楽曲','trap','imp ruin','hips',16,'mind;lure=fc','音楽が流れ出し、{a}の腰が勝手に揺れ始めた。|曲に合わせて、{a}は扇情的な踊りを踊らされた。|音楽が速くなるほど、{a}の動きは大胆になった。|曲が終わったとき、{a}は息を切らして火照っていた。'),
D('t2_mask','唇を奪う仮面','trap','imp ruin','mouth',18,'mind;lure=fc','{a}が仮面を手に取ると、仮面は勝手に顔に張りつき、内側から唇を塞いだ。|仮面の内側の柔らかな唇が、{a}に深い口づけを繰り返した。|仮面を外そうとすると、口づけがさらに深くなった。|仮面越しの口づけで、{a}の思考が溶けた。'),
D('t2_itch','疼き草','trap','tent','thigh',14,'sens.04','草に触れた内腿が、むず痒く疼き始めた。|{a}は疼きを掻こうとして、その手の感触に震えた。|疼きは掻くほど甘くなった。|疼き草の汁が、{a}の{p}をじんわりと火照らせた。'),
D('t2_storyteller','朗読する声','trap','tower ruin','ear',14,'mind','どこからか、淫らな物語を朗読する声が聞こえてきた。主人公の名前は{a}だった。|声は{a}がこれからされることを、先回りして語った。|物語の展開どおりに、{a}の体が熱くなった。|{a}は耳を塞いだが、声は頭の中で続いた。'),
D('t2_ears','猫耳の帽子','trap','imp tower','ear',12,'shame;sens.05;lure=fc','可愛い帽子をかぶると、獣の耳が生えて感覚がつながった。撫でられるだけで腰が抜けた。|生えた耳を空気が撫でるたび、{a}はびくりとした。|{a}は耳を押さえて、うずくまった。|帽子は外れたが、耳の感覚はしばらく残った。'),
D('t2_zap','痺れる床','trap','tower','all',14,'','床を踏んだ瞬間、微弱な痺れが{a}の足から全身に走った。|痺れは痛みではなく、甘いさざ波だった。|{a}が動くたび、床の痺れが強くなった。|痺れが抜けたあとも、{a}の肌はしばらく粟立っていた。'),
D('t2_hotcold','冷熱の交互浴','trap','slime ruin','all',16,'sens.04','冷たい粘液と熱い湯が交互に降り注ぎ、{a}の肌を責めた。|冷たさで縮んだ肌を、熱い湯がほどいていった。|温度が変わるたび、{a}の感覚は鋭くなった。|{a}は震えながら、次の熱を待っていた。'),
D('t2_hammock','揺りかごの網','trap','tent slime','all',16,'hold2','網のハンモックが{a}を包み込み、ゆらゆらと揺れ始めた。|網の目が{a}の肌に食い込み、揺れるたびに擦れた。|揺りかごは{a}を眠らせようとしながら、{p}を撫でた。|揺れに合わせて、{a}の吐息が甘くなった。'),
D('t2_count','百を数える罠','trap','ruin tower','any',20,'mind;hold2','「百数え終わるまで出られない」と声がした。数えている間、{a}の{p}は責められ続けた。|{a}は数を数えながら、何度も数え間違えた。|数え間違えるたび、最初からやり直しになった。|{a}の数える声が、途中から甘く震えた。'),
D('t2_candle','媚香の蝋燭','trap','imp ruin','chest',14,'sens.04','天井の蝋燭から、温かい蝋が{a}の胸に垂れた。熱くはなく、甘かった。|蝋が一滴落ちるたび、{a}の{p}が跳ねた。|垂れた蝋の匂いで、{a}の頭がぼうっとした。|蝋の跡が、{a}の肌に淫らな模様を描いた。'),
D('t2_critters','指を舐める小動物','trap','tent slime','any',14,'','小さな生き物の群れが{a}にまとわりつき、あちこちを小さな舌で舐めた。|小動物は{a}の指先から腕を伝い、服の中へ潜った。|{a}が払うたび、小動物は別のところを舐めた。|くすぐったさが、だんだん甘さに変わった。'),
D('t2_flower','吸いつく花','trap','tent','chest',18,'dev2','壁の花が伸びて、{a}の胸に吸いついた。|花の中心が{a}の{p}をすっぽり包み、吸い上げた。|花は蜜を滲ませながら、{a}の{p}を離さなかった。|花が離れたあと、{a}の{p}はじんじんと疼いた。'),
D('t2_shell','声を録る貝','trap','slime ruin','ear',10,'shame','拾った貝を耳に当てると、さっきまでの{a}自身の声が聞こえた。|貝は{a}の嬌声を、何度も繰り返し再生した。|{a}は貝を投げ捨てたが、声は耳に残った。|貝の中の自分の声に、{a}は顔を真っ赤にした。'),
D('t2_audience','観客の幻','trap','imp ruin','all',14,'mind;shame','部屋が劇場に変わり、無数の観客の幻が{a}を見つめた。|観客は{a}の一挙一動に、ため息や拍手を送った。|{a}は見られている意識だけで、体が熱くなった。|幕が下りるまで、{a}は舞台の上から動けなかった。'),
D('t2_honeythread','蜜の糸','trap','tent slime','neck',12,'sens.03','天井から垂れた蜜の糸が、{a}の首筋から背中へ伝った。|糸は{a}の肌を伝って、服の中へ消えていった。|蜜の糸が絡むほど、{a}の肌は敏感になった。|{a}は蜜の甘い匂いに包まれた。'),
D('t2_sole','足裏くすぐり','trap','*','feet',14,'hold2','靴が脱げ、{a}の足裏を羽根と指がくすぐり始めた。|笑い転げる{a}の足裏を、何かが執拗にくすぐった。|足裏のくすぐりは、いつしか甘い痺れに変わった。|{a}は足を引こうとして、さらに強く押さえられた。'),
D('t2_navel','臍を打つ水滴','trap','slime ruin','belly',12,'hold1','天井から落ちる水滴が、正確に{a}の臍を打ち続けた。|ぽたり、ぽたりと落ちる水滴に、{a}の下腹が震えた。|水滴の間隔が短くなるにつれ、{a}の息も短くなった。|{a}は動こうとしたが、水滴は追いかけてきた。'),
D('t2_icefinger','氷の指','trap','tower ruin','back',14,'','冷たい指が{a}の背筋をなぞり下ろした。|氷の指が通ったあとが、逆に熱くなった。|{a}は背中を反らせて、冷たさから逃げようとした。|氷の指は、背骨を一つずつ数えるように下りていった。'),
D('t2_earslime','耳に流れ込む粘液','trap','slime','ear',16,'mind','小さなスライムが{a}の耳に流れ込み、中で震えた。|耳の奥で響く水音に、{a}の頭がとろけた。|{a}は首を振ったが、粘液は耳の中で甘く揺れ続けた。|耳から抜けた粘液は、満足げに床へ落ちた。'),
D('t2_beg','おねだりの枷','trap','imp tower','all',20,'mind;hold3;shame','枷がはまり、声がした。「欲しいと言うまで、終わらない」|{a}は言うまいと口を結んだが、責めは止まらなかった。|{a}は小さな声で、それを口にしてしまった。|{a}が言った瞬間、枷はあっけなく外れた。'),
D('t2_door','達したら開く扉','trap','imp ruin tower','all',26,'lure=impulse','扉には「果てた者だけが通れる」と刻まれていた。扉の取っ手が、{a}を撫で始めた。|扉の前で、{a}は先へ進むために覚悟を決めた。|扉は{a}が果てるまで、決して開かなかった。|扉の装飾が動き、{a}を絡め取った。'),
D('t2_canteen','すり替えられた水筒','trap','*','mouth',14,'sens.08','{a}が水筒から飲んだ水は、いつの間にか甘くなっていた。|喉を潤した{a}の体が、内側から熱くなった。|{a}は水筒をよく見た。自分のものではなかった。|水筒の中身は、半分以上減っていた。'),
D('t2_tongueflr','舌の階段','trap','imp slime','feet',14,'','階段の一段一段が柔らかな舌で、{a}の足裏を舐め上げた。|段を上るたびに、{a}の足から力が抜けていった。|{a}は階段の途中で座り込んでしまった。|最後の一段で、舌は{a}の足首に絡みついた。'),
D('t2_breath','息を合わせる部屋','trap','tent imp','all',16,'mind','部屋全体が呼吸するように膨らみ、{a}の呼吸を自分に合わせさせた。|部屋の脈動に合わせて、{a}の鼓動も速くなった。|{a}は部屋の呼吸に溶けていくようだった。|呼吸を外そうとするほど、部屋は{a}を包み込んだ。')
]);
})();
});
;
/* ==== js/dungeon-lines.js ==== */
HK.Load.def(422,'js/dungeon-lines.js',function(){
(function(){
'use strict';
var DG=window.HK.DG=window.HK.DG||{};
function L(s){return s.split('|');}
DG.LINES={
start:L('{a}は松明を掲げ、{floor}へ足を踏み入れた。甘ったるい匂いが鼻をついた。|入口の石碑には「心を手放した者は、ここの住人となる」と刻まれていた。{a}は鼻で笑って、{floor}へ下りた。|{a}は装備の留め具を確かめてから、{floor}の暗がりへ踏み込んだ。|噂では、このダンジョンから戻った者は皆、何かを失っているという。{a}は{floor}の扉を押し開けた。|{a}はギルドの依頼書を懐にしまい、{floor}の湿った石段を下りた。|生ぬるい風が、{floor}の奥から吹き上げてきた。{a}は一度だけ振り返ってから、前を向いた。'),
avoid:L('{t}を見抜いて避けた。|{t}の仕掛けを跨いで抜けた。|{t}を先に作動させて空振りさせた。|{t}を迂回した。|{t}を壊して通った。|{t}の真下を避けて通った。|身を低くして{t}をくぐり抜けた。|{t}に気づき、壁際を伝って抜けた。'),
resist:L('{t}の誘いを振り払った。|{t}を「幻だ」と打ち消した。|{t}から意識を逸らした。|掌に爪を立てて{t}に耐えた。|{t}を聞き流した。|護りの文句で{t}を退けた。'),
seek:L('分かっていて、触れた。|迷ってから、手を伸ばした。|「少しだけなら」と踏み込んだ。|足が勝手に向かった。|喉を鳴らして近づいた。|誰も見ていないのを確かめて、触れた。'),
holdOn:L('{t}はまだ{a}を離さない。|もがくほど、{t}の拘束はきつくなった。|{a}は逃れようとしたが、{t}は同じところを執拗に責め続けた。|{t}の動きが、{a}の弱いところを覚え始めていた。|時間の感覚がなくなっていく。{t}は止まらない。|{a}の抵抗が弱まると、{t}はかえって優しくなった。それがいちばん堪えた。'),
holdEscape:L('どうにか振りほどいた。|隙を見て抜け出した。|刃を突き立てて逃れた。|噛みついて逃れた。|歯を食いしばって引き剥がした。|拘束の緩んだ一瞬に、身をよじって抜け出した。|武器の柄で叩きつけて、ようやく逃れた。|渾身の力で振り払い、床を転がって距離を取った。|絡みつくものを一本ずつ引き剥がして、どうにか抜け出した。'),
fallParty:L('{a}は仲間の呼ぶ声に、もう振り返らなかった。|仲間が{a}の名前を叫んでも、{a}は甘くとろけた顔のまま、こちらを見ようとしなかった。|{a}の手を引こうとした仲間の指を、{a}はやんわりとほどいた。|{a}は一度だけ仲間のほうを見て、それから、自分から迷宮の奥へ身を沈めた。|仲間の声は届いていた。ただ、もう{a}を引き戻す力はなかった。'),
holdRelease:L('しばらく責められ続けて、ようやく解放された。|散々弄ばれてから、床に下ろされた。|解放されても、しばらく立てなかった。|満足するまで離してもらえなかった。|膝が笑うまで責められた。'),
sneak:L('{t}をやり過ごした。|物陰に隠れて{t}を避けた。|眠る{t}の横をすり抜けた。|息を殺して{t}から逃れた。|{t}の足音の隙を縫って進んだ。'),
charmed:L('{t}が甘えるように鳴いた。{a}の手から武器が下がった。|{a}は{t}の瞳を見てしまった。|{t}は{a}に、ひどく懐かしい声で呼びかけた。|{t}は傷ついたふりをして、{a}の同情を誘った。|{t}の吐息の香りに、{a}の膝から力が抜けた。'),
win:L('{t}を斬り伏せた。|{t}を退けた。|{t}を一撃で沈めた。|{t}をねじ伏せた。|松明で{t}を追い払った。|{t}を罠に誘い込んで自滅させた。|{t}を一喝して追い払った。|{t}を蹴散らした。'),
lose:L('{a}は{t}に組み伏せられた。|{a}の剣は{t}に弾かれ、床を滑っていった。|{t}は{a}の足首を捕らえて引き倒した。|{a}の一撃は空を切り、背後から{t}に捕まった。|{a}は{t}の数に押し切られた。|{t}は{a}の両腕を頭上でまとめて押さえつけた。'),
captured:L('体力の尽きた{a}は、{t}にぐったりと抱え上げられ、巣の奥へ運ばれていった。|{a}はもう指一本動かせなかった。{t}は獲物を確かめるように{a}を撫でた。|{a}の視界が暗くなる。最後に見えたのは、{t}の満足げな気配だった。|{t}は動けなくなった{a}を拘束し、どこかへ連れ去った。'),
capEscape:L('{a}は見張りの隙を突いて拘束を外し、這うようにして巣から逃げ出した。|{a}は理性の最後のひとかけらを握りしめて、巣の外へ転がり出た。|{a}は外れかけた枷に気づき、音を立てずに抜け出した。|{a}は自分の名前を何度も唱えて正気を保ち、脱出の機会をつかんだ。'),
skipChest:L('{t}には触れなかった。|{t}を怪しんで見送った。|{t}を横目に先を急いだ。|{t}は無視した。|{t}に後ろ髪を引かれつつ素通りした。'),
openGood:L('{t}の中身は本物だった。|{t}は当たりだった。|{t}の底に、先人の遺品があった。'),
skipSpring:L('{t}には口をつけなかった。|{t}を怪しんで素通りした。|{t}の水は飲まずにおいた。'),
springGood:L('{t}は本物の癒しの泉だった。|{t}の水で、体の熱が引いた。|{t}で喉を潤し、頭が冴えた。'),
ignoreNpc:L('{t}に背を向けた。|{t}を罠と疑って素通りした。|{t}と目が合ったが、足は止めなかった。|{t}に「後で戻る」と嘘をついた。'),
rescue:L('{t}を助け出した。|{t}の枷を壊して逃がした。|{t}を正気に戻し、地上への道を教えた。|{t}を安全な場所まで運んだ。'),
relief:L('休める部屋で、{a}は誰も来ないことを確かめてから、自分で昂りを鎮めた。|{a}は火照りに耐えきれず、毛布の中で自分を慰めた。終わった後、天井を見つめて溜息をついた。|{a}は「これは処理だ」と言い聞かせながら、自分の手で熱を逃がした。|{a}は壁にもたれて、声を殺して果てた。'),
rest:L('安全な小部屋で休んだ。|結界の中で浅く眠った。|扉に閂をかけて目を閉じた。|焚き火の前で装備を繕った。|湧き水で体を拭いて休んだ。|膝を抱えて、昂りが引くのを待った。|自分の名前と目的を声に出して確かめた。|祈りの言葉を読み返して落ち着いた。'),
dream:L('眠りの中で、{a}は見えない手に全身を撫でられていた。|夢の中の{a}は、自分から罠の部屋へ戻っていった。|夢の中で、誰かが{a}の耳元で名前を呼び続けた。目覚めると汗でびっしょりだった。|{a}は夢の中で、昨日の罠をもう一度味わっていた。'),
stairs:L('下り階段から、生ぬるい風が吹き上げてくる。|階段の壁に、誰かの爪痕が残っていた。|階段で少しだけ息を整えた。|振り返らずに階段を下りた。'),
bossMiss:L('{a}の刃は、{t}に届く前に絡め取られた。|{a}は踏み込もうとして、膝から力が抜けた。|{t}は{a}の反撃を、楽しむように受け流した。|{a}は狙いを定めたが、指が震えて外した。'),
useHerb:L('{a}は鎮静の薬草を噛みしめた。苦みが広がり、頭の霧が晴れていった。|{a}は薬草を煎じて飲んだ。火照りが、ゆっくりと引いていった。'),
useCloak:L('{a}は予備の外套を羽織った。肌が隠れるだけで、少し心が落ち着いた。|{a}は破れた装備の上から外套をまとい、紐をきつく結んだ。'),
useScroll:L('{a}は脱出の巻物を広げた。光に包まれ、気がつくと階段の前の冷たい石の上に倒れていた。|{a}は震える手で巻物の封を切った。拘束がほどけ、体が宙に浮いて、階段の前へ投げ出された。|これ以上は戻れなくなる。{a}はそう判断して、脱出の巻物を使った。光が消えると、見慣れた階段が目の前にあった。'),
bossReturn:L('けれど迷宮の外には出られない。{a}は息を整えて、もう一度{boss}の間へ向かった。|扉の向こうには、まだ{boss}がいる。{a}は武器を拾い直し、戻っていった。|逃げ切る道はなかった。{a}は{boss}の間へ引き返した。倒すか、堕ちるか、どちらかしかない。'),
bossAgain:L('{t}は戻ってきた{a}を見て、楽しげに笑った。「また遊びに来たのか」|{a}が扉を蹴り開けると、{t}はさっきと同じ場所で待っていた。|{t}は獲物が自分から戻ってきたことに、喉を鳴らした。'),
reachBoss:L('長い探索の果てに、{a}たちは大きな扉の前に立っていた。扉の向こうに、{boss}の気配がある。|迷宮はこれ以上、先へ進ませてくれなかった。残された道は、{boss}の間の扉だけだった。|幾つもの部屋を抜けて、{a}はついに最深部の扉に手をかけた。ここを越えなければ、帰れない。'),
melt:L('衣溶けの呪いで、{a}の装備がまた少し溶けた。|{a}の服の裾が、霧のように消えていった。|呪いのせいで、{a}の肌がまた一つ露わになった。'),
rush:L('罠の部屋を駆け抜けた。|足を止めずに扉を抜けた。|振り向かずに次の部屋へ飛び込んだ。'),
mid:L('{a}は、罠の部屋の扉を見ると体が勝手に熱くなることに気づいた。|{a}は自分が何を期待しているのか、考えないようにした。|{a}の足取りが、少しだけ遅くなった。|{a}は「まだ大丈夫」と三回呟いた。'),
brink:L('{a}は、地上に戻る理由をうまく思い出せなくなっていた。|{a}は壁の向こうから聞こえる誰かの嬌声に、羨ましさを覚えてしまった。|{a}は次の罠を、怖がるよりも待っていた。|{a}はもう、自分の名前を呼ばれても反応が遅れる。'),
edge:L('{a}の体は限界まで昂った。けれど寸止めの呪いが、最後の一線を越えさせない。|あと一歩のところで、呪いが{a}の熱をせき止めた。{a}は泣きそうな声を漏らした。|{a}は達せないまま、行き場のない余韻に震え続けた。|呪いの紋が光り、{a}の絶頂は取り上げられた。|昇りつめる寸前で、熱がふっと引いていった。{a}は空を掴むように腰を揺らし、唇を噛んだ。|波が弾けるその直前に、呪いの紋が疼いて{a}の熱をせき止めた。行き場をなくした昂りは、引くこともなく体に居座り続けた。|{a}は果てる寸前で止められた熱を抱えたまま、膝をついて肩で息をした。|あと少し、というところで熱がほどけた。{a}は焦れったさに身をよじり、小さく呻いた。|呪いの紋がじわりと熱を持ち、{a}の昂りは頂の手前で凍りついた。|{a}は唇を噛んで、届かなかった波の名残に耐えた。体の奥が、いつまでも疼いていた。'),
midLeave:L('{t}は気まぐれに{a}を放り出し、闇の奥へ消えた。|{t}は「続きはまた今度」と笑って、{a}を解放した。|{t}は満足したように、{a}を床に下ろして去った。|{a}はふらつきながら、{t}の気配が遠のくのを待った。'),
fall:L('{a}の中で、最後に残っていた何かが、静かにほどけた。|{a}はもう、出口を探していなかった。|{a}は自分から{t}に身を委ね、目を閉じた。|{a}の理性は、甘い熱の中に溶けて消えた。')
};
var FALLS=[
{when:function(S){return(S.h.dgJoinN||0)>=1;},title:function(){return'触手の中の共犯';},text:'{a}は触手に絡め取られながら仲間を抱いたあの日から、迷宮の熱を拒まなくなった。今では触手の巣の奥で、迷い込んだ者を抱き寄せては、一緒に触手の熱に沈んでいる。'},
{when:function(S){return S.h.captor&&S.h.captor.boss;},title:function(S){return S.h.captor.boss.name+'の虜';},text:null},
{when:function(S){return S.h.captor&&S.h.captor.kind==='mon';},title:function(S){return S.h.captor.name+'の巣で';},text:'{a}は{t}の巣の奥で、もう外に出たいと思わなくなった。'},
{when:function(S){return S.h.curses.indexOf('mark')>=0&&S.h.climax>=6;},title:function(){return'淫紋の完成';},text:'下腹の淫紋が最後の一画を描き終えた。{a}はダンジョンの新しい「罠」として、迷宮に組み込まれた。'},
{when:function(S){return S.h.curses.indexOf('obey')>=0;},title:function(){return'服従';},text:'服従の刻印が{a}の心まで染み込んだ。{a}は迷宮のどんな声にも、喜んで従うようになった。'},
{when:function(S){return S.cnt.seek>=3;},title:function(){return'自ら戻る者';},text:'{a}は自分の足で、罠の部屋へ戻っていった。扉を閉める前に、一度だけ振り返って微笑んだ。'},
{when:function(S){return S.themeKey==='slime'||(S.lastEv&& /スライム|粘液/.test(S.lastEv.name));},title:function(){return'粘液の揺りかご';},text:'{a}は透き通った粘液の中で、目を閉じたまま揺られている。とても幸せそうに。'},
{when:function(S){return S.themeKey==='tent'||(S.lastEv&& /触手|蔓/.test(S.lastEv.name));},title:function(){return'森の一部';},text:'{a}は触手に抱かれたまま、森の一部になった。時折、甘い声が葉擦れに混じる。'},
{when:function(S){return S.themeKey==='tower';},title:function(){return'最高の被験体';},text:'{a}は塔の観察室で、記録される日々を送っている。自分から実験の続きをねだりながら。'},
{when:function(S){return S.themeKey==='ruin';},title:function(){return'神殿の巫';},text:'{a}は祭壇に仕える巫となった。豊穣の儀式のたびに、恍惚とした顔で身を捧げている。'},
{when:function(S){return S.themeKey==='imp';},title:function(){return'淫魔の城の住人';},text:'{a}は城の一室を与えられ、淫魔たちの愛玩物として暮らしている。地上のことは、もう思い出せない。'},
{when:function(S){return S.h.tr.fc>0.65;},title:function(){return'終わらない遊び';},text:'{a}は笑いながら迷宮をさまよい続けている。次の罠を探して。'},
{when:function(S){return S.h.tr.ac>0.65;},title:function(){return'従順な住人';},text:'{a}は迷宮の命じるままに生きることを選んだ。もう、自分で何かを決めなくていい。'},
{when:function(){return true;},title:function(){return'快楽堕ち';},text:'{a}は甘い熱の中に沈み、地上へ帰る理由を忘れた。'}
];
DG.TOP={
trap:L('{t}が{a}の{p}へ伸びてきた。{a}はそれを掴んで、仕掛けごと引きちぎった。砕けた仕掛けから甘い香が噴き出し、体の奥がじわりと火照った。|{a}は{t}が動き出した瞬間、剣の柄で叩き壊した。飛び散った媚薬の飛沫が肌にかかり、そこから熱が広がっていった。|{t}が作動する前に、{a}はその根元を踏み砕いた。壊れた仕掛けの吐き出した甘い霧だけは、避けきれなかった。|{t}は{a}を捕らえようとしたが、{a}は逆にそれを押さえ込み、動かなくなるまで力をかけ続けた。昂った息が、なかなか収まらなかった。|{a}は{t}に絡みつかれる寸前で身をひねり、刃を突き立てた。仕掛けに溜まっていた媚薬が溢れて{p}を濡らし、肌がじんと熱を持った。|{a}は{t}の仕掛けを睨みつけ、迷わず叩き割った。破片から立ちのぼる甘い匂いに、体が勝手に熱くなった。|{t}がうごめいた。{a}は仕掛けの継ぎ目に指をかけてこじ開け、中の機構を素手でへし折った。噴き出した桃色の煙を、まともに吸い込んだ。'),
mind:L('{t}が{a}に幻を見せた。幻の中の{a}は、誰かを組み伏せて、その乱れる声を聞いていた。我に返っても、熱だけが体に残った。|{t}の甘い気配が頭に流れ込んできた。{a}の脳裏に浮かんだのは、自分が誰かを思うままに乱れさせる光景だった。|{a}は{t}の誘いを振り払ったが、浮かんだ光景は消えなかった。組み伏せた誰かの、潤んだ目。体が勝手に熱くなった。|{t}は{a}の欲を映す鏡だった。そこに映った{a}は、獲物を前にした獣の顔をしていた。目を逸らしても、昂りは引かなかった。|{t}が囁いた。「あなたが本当にしたいことを、見せてあげる」――見せられた光景に、{a}は喉を鳴らした。'),
chest:L('{t}を開けた瞬間、中から何かが飛び出してきた。{a}はそれを叩き落とし、蓋を蹴り閉めた。漏れ出した甘い香に、体が火照った。|{t}の中から伸びてきた手を、{a}は掴んで引きずり出し、床に叩きつけた。手のひらに残った媚薬のぬめりが、じわじわと熱を持った。|{t}が罠だと気づいたのは、開けたあとだった。{a}は噴き出した粉を手で払ったが、吸い込んだ分だけ、体の奥が熱くなった。'),
spring:L('{t}の水を口に含んだ瞬間、甘い味が広がった。媚薬だった。吐き出したが、体の奥にはもう火が灯っていた。|{t}に手を浸すと、水がぬるりと絡みついてきた。{a}は水面を叩いて振り払った。濡れた肌だけが、いつまでも熱かった。|{t}の湯気を吸い込んだ{a}は、自分の鼓動がうるさくなるのを感じた。濡れた口元を拭っても、火照りは引かなかった。'),
mon:L('{t}が{a}に組みつこうとした。{a}はその腕をねじり上げ、逆に床へ押さえつけた。おとなしくなった{t}を責め立てるうちに、{a}自身の息も荒くなっていった。|{t}は{a}に絡みついてきたが、{a}は力ずくでそれを引き剥がし、壁際へ追い詰めた。{t}が甘い声で鳴いて屈服するまで、{a}は手を緩めなかった。|{t}の攻撃で傷を負いながらも、{a}は{t}を組み伏せた。逃げようとする{t}を押さえつけ、思うままに弄ぶうちに、{a}の体も熱を帯びていった。|{t}の甘い体液を浴びて、{a}の体が一気に火照った。{a}はその熱に任せて{t}を押し倒し、ぐったりするまで責め立てた。|{a}は{t}の誘いに乗ったふりをして、その喉元を掴んだ。どちらが獲物なのか、{t}はすぐに思い知った。足元で震える{t}の姿に、{a}の昂りも増していった。'),
captive:L('{t}に手を伸ばした瞬間、それが罠だと気づいた。{a}は絡みついてくる仕掛けを力ずくで引き剥がしたが、撒き散らされた媚薬を浴びてしまった。|{t}は助けを求めるふりをして、{a}にすがりつこうとした。{a}はその腕を掴んでねじ伏せた。正体を現した魔物が逃げ去ったあとも、体には甘い香が残った。|{t}の枷を外そうとした途端、床の魔法陣が光った。{a}は陣を踏み砕いたが、立ちのぼった熱は、もう肌に染み込んでいた。'),
cap:L('{a}は{t}の巣の檻の中で、焚かれた甘い香に体を火照らせていた。近づいてきた見張りを、{a}は格子越しに掴んで引き寄せ、屈服するまで責め立てた。|巣に満ちる甘い匂いが、{a}の体を内側から炙った。{a}は壁に背を預け、自分の手で熱を逃がした。檻の外の{t}は、遠巻きにそれを見ているだけだった。|{t}が檻の扉を開けて入ってきた。{a}はその隙に{t}を床へ押さえつけ、ぐったりするまで離さなかった。檻の外には出られなかったが、主導権は{a}の手にあった。|{a}は檻の中で、{t}の群れを睨みつけていた。迂闊に近づいた一匹を、{a}は組み伏せ、甘い声を上げるまで弄んだ。'),
boss:L('{t}の技が{a}に迫った。{a}はそれを正面から打ち破り、{t}の懐へ踏み込んで組みついた。昂りに任せて責め立てると、{t}の余裕の笑みが崩れた。|{t}が{a}を狙ったが、{a}は身をかわし、逆に{t}を壁際へ追い詰めた。{t}が甘い声を漏らすまで、{a}は攻める手を止めなかった。|{t}の放った甘い香が、{a}の体を火照らせた。{a}は熱に浮かされながらも{t}から目を逸らさず、じりじりと間合いを詰めた。|{a}は{t}の術を力ずくで振り払い、その手首を掴んでねじ伏せた。今度はこちらの番だと言わんばかりの目に、{t}がたじろいだ。'),
lines:{
seek:L('分かっていて、近づいた。|わざと仕掛けを踏んだ。|試すように手を伸ばした。|誰も見ていないのを確かめて、近づいた。'),
captured:L('体力の尽きた{a}は、{t}の巣の奥の檻に閉じ込められた。格子越しに、{a}は{t}を睨みつけた。|{a}は膝をついた。{t}は{a}に近づくのを恐れるように、遠巻きのまま檻へ追い込んだ。|{a}の視界が暗くなる。気がつくと、{t}の巣の檻の中にいた。手足は自由だった。'),
midLeave:L('{t}は{a}を仕留めきれず、闇の奥へ退いた。|{t}は「続きはまた今度」と言い残して消えた。|{t}は{a}の目つきに怯んだように、気配を消した。'),
fall:L('{a}はもう、出口を探していなかった。探しているのは、次の獲物だった。|{a}の理性は、甘い熱の中に溶けて消えた。残ったのは、狩る側の飢えだけだった。|{a}の目から、地上へ帰る意志が消えた。'),
mid:L('{a}は、魔物を見ると体が勝手に熱くなることに気づいた。|{a}は自分が何を求めているのか、考えないようにした。|{a}の足取りが、少しずつ獲物を探すものになっていた。|{a}は「まだ大丈夫」と三回呟いた。'),
brink:L('{a}は、地上に戻る理由をうまく思い出せなくなっていた。|{a}は次の魔物を、怖がるよりも待っていた。組み伏せるために。|{a}はもう、自分の名前を呼ばれても反応が遅れる。|{a}は壁の向こうの魔物の気配に、舌なめずりしていた。'),
dream:L('眠りの中で、{a}は誰かを組み伏せていた。目覚めると、汗でびっしょりだった。|夢の中の{a}は、昨日の魔物をもう一度ねじ伏せていた。|夢の中で、誰かが{a}の下で名前を呼び続けた。目覚めても、熱が引かなかった。')
}
};
var FALLS_TOP=[
{when:function(S){return(S.h.dgJoinN||0)>=1;},title:function(){return'触手の共犯';},text:'{a}は迷宮の触手と並んで、捕らわれた獲物を責め立てる側に回った。最初の獲物が誰だったのかを、{a}はもう思い出そうとしない。'},
{when:function(S){return(S.h.dgWatch||0)>=20&&S.h.dgWatch>=S.h.corrupt*0.25;},title:function(){return'見ていただけの陥落';},text:'{a}は罠にも魔物にも屈しなかった。仲間の乱れる姿を見続けるうちに、自分が本当は何を求めているのかを、誤魔化せなくなっただけだった。'},
{when:function(S){return(S.h.dgReachN||0)>=1;},title:function(){return'越えた一線';},text:'{a}は仲間に手を伸ばしたあの夜から、迷宮の熱を拒まなくなった。今では迷い込んだ者を見つけるたびに、あの夜と同じ目をしている。'},
{when:function(S){return S.h.captor&&S.h.captor.boss;},title:function(S){return S.h.captor.boss.name+'の玉座';},text:'{a}は{t}を組み伏せ、その玉座を奪った。今では{a}が迷宮の新しい主として、迷い込んだ魔物たちを足元に侍らせている。'},
{when:function(S){return S.h.captor&&S.h.captor.kind==='mon';},title:function(S){return S.h.captor.name+'の巣の主';},text:'{a}は{t}の巣に居座り、群れを力ずくで従えた。巣から出てくる気は、もうなかった。'},
{when:function(S){return S.h.curses.indexOf('mark')>=0&&S.h.climax>=6;},title:function(){return'淫紋の完成';},text:'下腹の淫紋が最後の一画を描き終えた。{a}は迷宮の魔物を狩っては組み伏せる、新しい「主」になった。'},
{when:function(S){return S.h.curses.indexOf('obey')>=0;},title:function(){return'刻印の反転';},text:'服従の刻印は、{a}の体で逆向きに根を張った。今では迷宮の魔物のほうが、{a}の声に逆らえない。'},
{when:function(S){return S.cnt.seek>=3;},title:function(){return'自ら戻る者';},text:'{a}は自分の足で、罠の部屋へ戻っていった。仕掛けを一つずつ壊しては、溢れる媚薬に酔うために。'},
{when:function(S){return S.themeKey==='slime'||(S.lastEv&& /スライム|粘液/.test(S.lastEv.name));},title:function(){return'粘液の主';},text:'{a}は粘液の溜まりの真ん中に陣取り、寄ってくるスライムを思うままに捏ね回している。とても満ち足りた顔で。'},
{when:function(S){return S.themeKey==='tent'||(S.lastEv&& /触手|蔓/.test(S.lastEv.name));},title:function(){return'森の主';},text:'{a}は森の奥で、触手たちを手懐けて暮らしている。時折、葉擦れに混じって、触手の震える音が聞こえる。'},
{when:function(S){return S.themeKey==='tower';},title:function(){return'塔の新しい主';},text:'{a}は塔の観察室を乗っ取り、実験体たちを相手に、思うままの実験を続けている。'},
{when:function(S){return S.themeKey==='ruin';},title:function(){return'神殿の新しい神';},text:'{a}は祭壇の上に座り、捧げられる供物と魔物たちを、恍惚とした顔で貪っている。'},
{when:function(S){return S.themeKey==='imp';},title:function(){return'淫魔の城の主';},text:'{a}は城の一室を奪い取り、淫魔たちを侍らせて暮らしている。地上のことは、もう思い出せない。'},
{when:function(S){return S.h.tr.fc>0.65;},title:function(){return'終わらない狩り';},text:'{a}は笑いながら迷宮をさまよい続けている。次の獲物を探して。'},
{when:function(){return true;},title:function(){return'快楽堕ち';},text:'{a}は甘い熱に呑まれ、迷宮の魔物を狩る側として生きることを選んだ。地上へ帰る理由は、もう忘れた。'}
];
DG.pickFall=function(S){
var P=window.HK.Pos,top=P&&P.hardTopNpc(S.h);
var ok=(top?FALLS_TOP:FALLS).filter(function(f){return f.when(S);});
var f=ok[0];
if(ok.length>2&&S.rng()<0.35)f=ok[1];
if(!f)f={title:function(){return'快楽堕ち';},text:''};
var bf=S.h.captor&&S.h.captor.boss&&S.h.captor.boss.fall;
if(bf&& !Array.isArray(bf))bf=[bf];
return{title:f.title(S),text:f.text||(bf?bf[S.rng.int(bf.length)].replace(/\{t\}/g,S.h.captor.boss.name):'{a}は甘い熱の中に沈んだ。')};
};
})();
});
;
/* ==== js/dungeon-thick.js ==== */
HK.Load.def(423,'js/dungeon-thick.js',function(){
(function(){
'use strict';
var DG=window.HK.DG=window.HK.DG||{};
DG.THICK={
fallTopEro:[
'{a}は魔物の敏感なところを探り当て、ぐちゅぐちゅと音を立てて責め立てた。{s:wet}。{a}「{m1}」――魔物が果てても、{a}は手を緩めなかった。気づけば、責める快感から抜け出せなくなっていたのは{a}のほうだった。',
'{a}は魔物を押さえつけ、自分の好きな速さで腰を使った。{s:hit}。{a}「{m2}」――果てるたびに、迷宮の甘い空気がまた{a}を昂らせた。'
],
fallAgain:['それで終わりではなかった。迷宮は、{a}が完全に抵抗をやめるまで、何度でも同じことを繰り返した。','一度堕ちたあとも、責めは止まなかった。{a}がどれだけの時間そこにいたのか、誰にも分からなかった。','堕ちたあとの{a}を、迷宮は手放さなかった。責めは形を変え、場所を変えて、果てしなく続いた。','{a}が果てるたびに、新しい罠が目を覚ました。そのたびに、{a}はうっとりと身を委ねた。','気づけば、{a}は自分から次の罠の前に立っていた。抗っていた頃の自分を思い出すことは、もうなかった。'],
fallAgainTop:['{a}は一度では満足せず、また次の獲物を求めて迷宮の奥へ足を向けた。','{a}は息を整えると、また魔物を組み伏せた。夜は、まだ長かった。','{a}は組み伏せた魔物を放すと、満ち足りない顔で次の扉を開けた。','{a}にとって、迷宮はもう狩り場でしかなかった。昂りは、何度果てても引かなかった。'],
fall:{
imp:[
'玉座の間の甘い香りが、{a}の膝から最後の力を奪った。淫魔たちは笑いながら{a}を絨毯に横たえ、何本もの柔らかな指で、刻まれた紋をなぞり始めた。\n\n{a}「{vb1}」\n\n下腹の淫紋が脈打つたび、触れられてもいない奥がきゅうっと疼く。淫魔の一人が{a}の脚を抱え上げ、ゆっくりと熱を沈めてきた。拒もうとした手は、別の淫魔に指を絡め取られて、そのまま甘く握り返されていた。\n\n奥を突かれるたびに、紋の光が強くなる。地上のこと、仲間の顔、自分の名前――ひとつずつ、甘い熱の中に溶けていった。\n\n{a}「{vb2}」\n\n{a}が背を反らして達した瞬間、淫紋が最後の一画を描き終えた。淫魔たちは拍手をするように羽を鳴らし、{a}の汗ばんだ額に口づけた。\n\n{a}はもう、出口のことを考えていなかった。考えていたのは、次はいつ触れてもらえるのか、それだけだった。',
'淫魔の城の寝室で、{a}は天蓋つきの寝台に沈められた。甘い香に包まれて、指一本動かすのも億劫だった。\n\n{a}「{vb1}」\n\n淫魔の舌が首筋から胸、下腹へと降りていく。淫紋が熱を帯びるたびに、体の奥が疼いて、腰が勝手に揺れた。淫魔は笑って、{a}の奥へゆっくりと熱を沈めた。\n\n満たされた瞬間、甘い痺れが背骨を駆け上がった。抗おうとする意志は、一突きごとにほどけていく。\n\n{a}「{vb2}」\n\n{a}は淫魔にしがみついたまま達し、そのまま何度も波に呑まれた。淫紋が、満足げに淡く光った。'
],
slime:[
'足元の粘液溜まりが、意思を持ったように{a}の脚を這い上がってきた。冷たいはずのそれは、肌に触れた端からぬるく、熱くなっていく。\n\n{a}「{vb1}」\n\n粘液は服の隙間から入り込み、胸の先を、脇腹を、内腿を、同時に舐めるように包み込んだ。逃げようと踏み出した足が滑り、{a}は粘液の中に膝をつく。その瞬間、一番奥の入口に、ぬるりとした塊が押し当てられた。\n\n抵抗する間もなく、それは形を変えながら中へ潜り込んでいった。内側から全部を撫でられる、人の体ではありえない感触。ぐちゅ、ぐちゅ、と音が洞窟の壁に反響する。\n\n{a}「{vb2}」\n\n何度目か分からない絶頂で、{a}は粘液の溜まりの中に仰向けに沈んだ。透き通った体越しに、天井の苔の光がゆらゆらと揺れて見える。\n\n粘液は{a}を離さなかった。{a}も、もう離れようとはしなかった。',
'粘液の溜まりに膝まで浸かった瞬間、{a}は動けなくなった。ぬるい粘液が脚を這い上がり、服の中へ入り込んでくる。\n\n{a}「{vb1}」\n\n粘液は胸の先を吸い、内腿を撫で、やがて一番奥の入口をぬるりと押し広げた。中で形を変えながら、気持ちいいところばかりを同時に擦る。\n\n逃げようとするたびに、粘液は奥で震えた。{a}の腰は、いつの間にか自分から揺れていた。\n\n{a}「{vb2}」\n\n{a}が甘い悲鳴を上げて達すると、粘液は喜ぶように脈打ち、さらに深く潜り込んだ。'
],
tent:[
'森の奥で、{a}の足首に蔓が巻きついた。振りほどこうとした腕にも、腰にも、太い触手がゆっくりと絡みつき、{a}の体は宙に吊り上げられた。\n\n{a}「{vb1}」\n\n細い触手が服の中に潜り込み、胸の先を吸い上げる。別の一本が内腿を這い上がり、甘い樹液を塗り込めながら、一番奥の入口をこじ開けていった。\n\nずるり、と脈打つ太いものが奥まで満たした。触手は人の腰つきよりずっと規則正しく、ずっと深く、{a}の弱いところだけを探り当てて突き上げる。葉擦れの音に、湿った水音が混ざった。\n\n{a}「{vb2}」\n\n{a}が宙で背を反らして達しても、触手は止まらなかった。樹液が肌から染み込み、熱がまた下腹に溜まっていく。\n\nやがて{a}は、自分から触手の一本を握りしめていた。森の天蓋の隙間から差す光が、汗に濡れた{a}の顔を、ぼんやりと照らしていた。',
'触手に吊るされたまま、{a}は脚を大きく開かされた。甘い樹液を纏った細い触手が、肌の上をゆっくりと這い回る。\n\n{a}「{vb1}」\n\n一本が胸の先を吸い、別の一本が奥へぬるりと潜り込む。中で膨らみ、うねり、気持ちいいところを探り当てて離さない。\n\n樹液が染み込むほどに、体の奥が熱く疼いた。{a}の腰は、触手の動きを追いかけるように揺れていた。\n\n{a}「{vb2}」\n\n{a}の体が大きく跳ねて達しても、触手は動きを止めなかった。森の奥に、甘い声だけが響き続けた。'
],
tower:[
'目を覚ますと、{a}は塔の観察室の台の上に寝かされていた。天井の水晶が、{a}の体の隅々までを青白く照らしている。\n\n「⁠被験体、覚醒を確認。感度試験を再開します」――どこからか、抑揚のない声がした。\n\n{a}「{vb1}」\n\n台の両脇から伸びた金属の腕が、温めた油を{a}の肌に塗り広げていく。胸に、下腹に、脚のあいだに。一定の速さで動く指先は、{a}の反応を記録するたびに、少しずつ強く、少しずつ深くなった。\n\n奥に沈められた器具が、規則正しく振動を始めた。数値を読み上げる声だけが、淡々と続く。\n\n{a}「{vb2}」\n\n{a}が台の上で大きく背を反らすと、「⁠絶頂を確認。回数、記録」と声が告げた。\n\n試験は終わらなかった。次の試験の準備をする機械の音を聞きながら、{a}は、次は何をされるのかを、少しだけ待っている自分に気づいた。',
'観察台の上で、{a}の手足は柔らかな枷に留められていた。「⁠感度試験、第二段階」――抑揚のない声が告げる。\n\n{a}「{vb1}」\n\n細い振動子が胸の先と下腹に押し当てられ、別の器具が奥へゆっくりと沈められた。数値を読み上げる声に合わせて、振動が少しずつ強くなる。\n\n{a}の奥は甘く痺れ、器具を締めつけて離さなかった。恥ずかしいほど濡れていく音まで、記録されていた。\n\n{a}「{vb2}」\n\n「⁠絶頂を確認。継続します」――{a}は台の上で何度も背を反らし、そのたびに数値が更新された。'
],
ruin:[
'神殿の祭壇に横たえられた{a}の周りで、石像の目が一斉に光った。甘い香が焚かれ、天井から垂れた布が、{a}の肌をゆっくりと撫でていく。\n\n{a}「{vb1}」\n\n祭壇の石が、人肌のように温かくなった。どこからともなく伸びてきた幾本もの手――祀られた神の手なのか、守り手たちの手なのか、もう{a}には分からなかった――が、胸を、腰を、脚のあいだを、捧げものを清めるように丁寧に愛撫する。\n\nやがて一番奥に、熱く脈打つものが捧げられた。祭壇の上で揺さぶられるたびに、壁の古い文字が淡く光り、頭の中に祈りの言葉が響く。\n\n{a}「{vb2}」\n\n{a}が祭壇の上で達すると、神殿じゅうの灯が一度に揺れた。供物が受け入れられた合図だった。\n\n{a}は祭壇から降りなかった。次の祈りの時刻を、汗に濡れたまま、静かに待っていた。',
'祭壇の石の上で、{a}は温かい手に全身を撫でられていた。香の煙が、思考をゆっくりと溶かしていく。\n\n{a}「{vb1}」\n\n手は胸を包み、内腿を撫で上げ、やがて奥の入口をやさしくほぐした。祈りの声のような低い響きとともに、熱いものが{a}の奥へ沈んでいく。\n\n満たされるたびに、甘い痺れが指先まで広がった。{a}の腰は、捧げるように持ち上がっていた。\n\n{a}「{vb2}」\n\n{a}が恍惚と達すると、石像の目が一斉に光った。神殿は、新しい信徒を迎え入れた。'
],
any:[
'迷宮の甘い熱が、とうとう{a}の理性を溶かしきった。罠の部屋の床に膝をついた{a}を、待ちかねたように魔物たちが取り囲む。\n\n{a}「{vb1}」\n\n何本もの手が、{a}の体から最後の布を剥ぎ取った。胸の先を摘ままれ、内腿を撫で上げられ、一番奥の入口を指でほぐされる。迷宮に入ってから何度も寸前で止められてきた熱が、一気に下腹へ集まっていく。\n\n熱く太いものが奥まで沈められた瞬間、{a}の喉から、自分でも聞いたことのない声が漏れた。床の魔法陣が淡く光り、突き上げられるたびに、溜め込んでいた快楽がまとめて押し寄せてくる。\n\n{a}「{vb2}」\n\n{a}は何度も、何度も果てた。数えるのをやめたのは、三回目だったか、五回目だったか。\n\n迷宮の静けさが戻ったとき、{a}は魔物の腕の中で目を閉じていた。地上へ帰る道は、もう思い出せなかった。',
'罠の部屋の床に倒れ込んだ{a}を、魔物たちが取り囲んだ。迷宮の熱で火照った体は、触れられるのを待っていた。\n\n{a}「{vb1}」\n\n何本もの手が、胸を、腰を、内腿を撫で回す。一匹が{a}の脚を抱え上げ、ゆっくりと奥まで沈めた。待ちわびていた内側が、吸いつくように締めつける。\n\n突かれるたびに甘い痺れが背骨を駆け上がり、{a}は自分から腰を振っていた。\n\n{a}「{vb2}」\n\n{a}が達すると、魔物たちは次々と入れ替わった。迷宮の夜は、まだ始まったばかりだった。'
]
},
fallTopF:[
'迷宮の甘い熱は、{a}を屈服させるかわりに、飢えさせた。{a}は罠の部屋に迷い込んだ魔物を床に押し倒し、その腰に跨った。{a}「{vt}」\n\n{a}は魔物の熱を自分の手で導き、ゆっくりと腰を沈めた。根元まで呑み込むと、{a}の内側も甘く疼いた。\n\n魔物が身をよじるたびに、{a}は締めつけてその動きを封じた。主導しているのは{a}なのに、擦れるたびに吐息が乱れる。\n\n魔物の喉から甘い声が漏れ、{a}の中で果てた。{a}も背を反らして達し、それでも腰を上げなかった。迷宮の主が誰なのか、魔物たちはその夜に知った。',
'最深部へ続く回廊で、{a}は群れをなす魔物たちを見下ろした。{a}「{vt}」\n\n{a}は一番大きな一匹を壁際に追い詰め、その上に跨って腰を落とした。熱く脈打つものを奥まで呑み込み、ゆっくりと腰を回す。\n\n魔物は怯えたように震え、やがて{a}の動きに合わせて腰を揺らし始めた。{a}の中が締まるたびに、魔物の息が荒くなる。\n\n{a}が奥をきゅうっと締め上げると、魔物は甘く鳴いて果てた。{a}も小さく喘いで達し、残りの魔物たちを振り返った。「⁠次」'
],
fallTop:[
'迷宮の甘い熱は、{a}を屈服させるかわりに、飢えさせた。{a}は罠の部屋に踏み込んできた魔物の首根っこを掴み、そのまま床に組み伏せた。\n\n魔物が身をよじって逃げようとする。{a}はその腰を強く掴んで引き戻し、自分の熱を一息に奥まで沈めた。\n\n{a}「{vt}」\n\n魔物の喉から、甘く掠れた鳴き声が漏れた。{a}は手加減しなかった。重く、深く、何度も腰を打ちつけるたびに、床の魔法陣が淡く光り、迷宮じゅうの罠が{a}の昂りに共鳴して脈打つ。\n\n魔物が痙攣して果てても、{a}は止まらなかった。最奥に押しつけたまま熱を吐き出してから、ようやく体を離す。\n\n通路の奥から、別の魔物たちが様子をうかがっていた。{a}は汗を拭い、ゆっくりと立ち上がった。地上へ帰る理由は、もう忘れた。この迷宮で狩る側でいることのほうが、ずっと甘かった。',
'最深部へ続く階段の途中で、{a}は振り返った。罠に追い立てられてきた魔物たちが、怯えたように群れをなしている。{a}「{vt}」\n\n{a}は一番近くの一匹を壁に押しつけ、背後から抱え込んだ。怯えていたはずの魔物の体は、{a}が触れた途端に熱を帯び、自分から腰を擦り寄せてきた。\n\n{a}はその腰を掴み、奥まで貫いた。湿った音と、魔物の切れ切れの鳴き声が、石の階段に反響する。群れの残りが、息を詰めてそれを見つめていた。\n\n一匹が果てると、{a}は次の一匹を手招きした。逆らうものは一匹もいなかった。\n\n夜が明けるころ――迷宮に夜明けがあるのなら――{a}は群れの真ん中に座り、乱れた息を整えていた。迷宮の主の座は、まだ先にある。けれど{a}にはもう、急ぐ理由がなかった。'
]
};
var T=DG.THICK;
T.fall.imp.push('淫魔の城の浴場で、{a}は香油の湯に肩まで沈められていた。湯気の向こうから、淫魔たちの笑い声が近づいてくる。\n\n{a}「{vb1}」\n\n湯の中で、いくつもの手が{a}の脚を開かせた。下腹の紋を指先でなぞられるたびに、湯よりも熱いものが体の芯に灯る。淫魔の一人が{a}を湯船の縁に座らせ、ゆっくりと奥へ熱を沈めた。\n\n湯面が波打つたびに、甘い痺れが背骨を這い上がる。{a}は縁を掴んでいた手を離し、淫魔の首に腕を回していた。\n\n{a}「{vb2}」\n\n{a}が達すると、淫魔は耳元で「ようこそ」と囁いた。湯気の中で、紋が誇らしげに輝いた。');
T.fall.slime.push('洞窟の天井から滴る粘液が、{a}の首筋に落ちた。それを合図に、壁という壁から粘液が溢れ出した。\n\n{a}「{vb1}」\n\n粘液は{a}を包み込み、柔らかな寝台のように体を持ち上げた。胸の先を吸い、脇腹をくすぐり、内腿の奥へと滑り込んでいく。入口をぬるりと押し広げ、奥の奥まで、形を変えながら満たしていった。\n\n内側でゆっくりと脈打つたびに、{a}の腰が勝手に跳ねる。逃げ場のない快感が、粘液ごと体の芯に染み込んでいった。\n\n{a}「{vb2}」\n\n{a}が達するたびに、粘液は温かく膨らんだ。洞窟の奥で、{a}はゆりかごのように揺られ続けた。');
T.fall.tent.push('花の匂いに誘われて、{a}は森の奥の窪地に足を踏み入れた。巨大な花が、{a}を迎えるように花弁を開いた。\n\n{a}「{vb1}」\n\n花芯から伸びた触手が{a}の手足に絡み、花弁の寝床に横たえた。甘い蜜が肌に垂らされるたび、触れられた場所が溶けるように熱くなる。一本の太い触手が、蜜を纏って奥へとゆっくり潜り込んだ。\n\n中で脈打ち、膨らみ、弱いところを探り当てては擦り上げる。{a}の指は、いつの間にか花弁を握りしめていた。\n\n{a}「{vb2}」\n\n{a}が甘く鳴いて達すると、花弁がそっと閉じた。花の中で、{a}は蜜に溺れていった。');
T.fall.tower.push('「⁠最終試験を開始します」――塔の最上階で、{a}は透明な筒の中に立たされていた。筒の内側に、無数の細い腕が生えている。\n\n{a}「{vb1}」\n\n腕は一斉に動き出した。胸の先を摘まみ、脇腹を撫で、脚を左右に開かせる。筒の底から伸びた器具が、{a}の奥へゆっくりと沈んでいった。\n\n「⁠反応値、上昇。強度を一段上げます」――声が告げるたびに、器具の動きが深く、速くなる。{a}の膝は震え、筒の壁に縋りつくしかなかった。\n\n{a}「{vb2}」\n\n「⁠絶頂を確認。被験体を永久保存とします」――筒の外で、記録の羽ペンが静かに走り続けた。');
T.fall.ruin.push('神殿の泉に足を浸した瞬間、水面が金色に輝いた。泉の底から、温かな水の手が{a}の脚を包み込んだ。\n\n{a}「{vb1}」\n\n水の手は{a}を泉の中央へ導き、仰向けに浮かべた。肌を撫でる水流が、胸を、下腹を、脚のあいだを、祝福するように何度もなぞる。やがて一筋の流れが、{a}の奥へと優しく満ちていった。\n\n満たされるたびに、神殿の鐘が遠くで鳴った。{a}の体は、捧げものとして泉に受け入れられていく。\n\n{a}「{vb2}」\n\n{a}が恍惚と達すると、泉の水面に新しい紋が浮かんだ。神殿は、新しい巫女を得た。');
T.fall.any.push('迷宮の通路で、{a}は壁に背を預けて座り込んだ。もう一歩も歩けない。体の奥で、迷宮に溜め込まされた熱がくすぶっていた。\n\n{a}「{vb1}」\n\n足音もなく、魔物たちが集まってきた。冷たい手が火照った肌に触れ、{a}は震えた。抵抗するはずの腕は、気づけば魔物の首に回っていた。熱いものが、ゆっくりと奥まで沈められる。\n\n突かれるたびに、迷宮の熱と自分の熱が溶け合っていく。{a}は腰を揺らし、自分から深く迎え入れた。\n\n{a}「{vb2}」\n\n{a}が達すると、通路の松明が一斉に揺れた。迷宮が、新しい住人を歓迎していた。');
T.fallTop.push('罠の部屋の中央で、{a}は荒い息をついていた。迷宮の熱が体中を巡り、出口を探して暴れている。{a}「{vt}」\n\n{a}は逃げ遅れた魔物の角を掴み、床に組み伏せた。抵抗する腰を膝で押さえ込み、昂りきった熱を奥まで沈める。\n\n魔物の鳴き声が、だんだん甘く変わっていった。{a}は容赦なく腰を打ちつけ、魔物が自分から腰を差し出すまで止めなかった。\n\n{a}が奥で果てると、魔物は床に伏したまま震えた。部屋の罠が、新しい主を讃えるように一斉に光った。');
T.fallTopF.push('迷宮の主の玉座の前で、{a}は膝をついた魔物の主を見下ろしていた。迷宮の熱は、{a}の中で支配の欲に変わっていた。{a}「{vt}」\n\n{a}は玉座の主を床に押し倒し、その腰に跨った。熱く脈打つものを自分で導き、ゆっくりと腰を落とす。根元まで呑み込むと、{a}は相手の手首を床に縫い止めた。\n\n{a}が腰を揺らすたびに、相手の喉から甘い声が漏れる。主導しているのは{a}なのに、擦れるたびに{a}の吐息も熱く乱れた。\n\n{a}が奥をきゅうっと締め上げると、相手は堪えきれずに果てた。{a}も背を反らして達し、空いた玉座に、ゆっくりと腰を下ろした。');
T.fallFF={
imp:['淫魔の娘たちが、{a}を天蓋の寝台に横たえた。「女の子どうしの方が、気持ちいいところ、分かるのよ」\n\n{a}「{vb1}」\n\n柔らかな唇が胸の先を含み、細い指が下腹の紋をなぞって、そのまま濡れたところへ降りていく。指先が前の芽を転がすたび、紋が甘く脈打った。\n\n一人が{a}の脚のあいだに顔を埋め、舌で奥をほぐしていく。もう一人は{a}の唇を塞ぎ、声ごと吸い上げた。\n\n{a}「{vb2}」\n\n{a}が達すると、淫魔の娘たちは嬉しそうに{a}を抱きしめた。「これで、わたしたちの姉妹ね」'],
slime:['泡の精が、くすくす笑いながら{a}の肌に泡を塗り広げた。「女の子の洗い方は、わたしがいちばん上手なの」\n\n{a}「{vb1}」\n\n泡まみれの小さな手が、胸を、脇腹を、脚のあいだを撫で回す。泡の中で指が前の芽を見つけ、くるくると転がした。\n\n泡に包まれたまま、細い指が奥へ沈められる。弾ける泡の感触と指の動きが重なって、{a}の腰は勝手に揺れた。\n\n{a}「{vb2}」\n\n{a}が達すると、泡の精は{a}の頬に口づけた。泡の寝床で、{a}はもう起き上がろうとしなかった。'],
tent:['蔓の乙女が、{a}を花の褥に招いた。「一緒にいて。ずっと」\n\n{a}「{vb1}」\n\n乙女の指がほどけて柔らかな蔓になり、{a}の胸に巻きつき、脚を優しく開かせた。乙女自身は{a}の脚のあいだに顔を寄せ、蜜の滴る舌で濡れたところを舐め上げる。\n\n細い蔓が前の芽をくすぐり、乙女の舌が奥を探る。花の香りに包まれて、{a}の意識はとろけていった。\n\n{a}「{vb2}」\n\n{a}が達すると、乙女は{a}を抱きしめ、二人の体を蔓でそっと結び合わせた。'],
tower:['自律人形の家政婦が、{a}を寝台に寝かせて一礼した。「お客様のお体、隅々までお手入れいたします」\n\n{a}「{vb1}」\n\n冷たい指が肌を這い、胸の先を几帳面に摘まみ、脚のあいだの濡れたところを丁寧になぞった。反応を確かめるたびに、人形は小さく頷いた。\n\n細い指が二本、奥へ沈められる。一番弱いところを見つけると、人形の指は寸分違わず、そこだけを擦り続けた。\n\n{a}「{vb2}」\n\n{a}が達すると、人形は「お手入れ、完了いたしました」と一礼した。それから、また最初から始めた。'],
ruin:['石の巫女たちが、祈りの歌を口ずさみながら{a}を輪の中に横たえた。冷たいはずの手が、肌に触れた途端に温かくなる。\n\n{a}「{vb1}」\n\n巫女たちは代わる代わる{a}の胸に口づけ、脚を開かせ、濡れたところを指先で清めるように撫でた。一人の舌が前の芽に触れ、別の指がゆっくりと奥へ沈んでいく。\n\n祈りの歌に合わせて、指が動く。{a}の腰は歌に合わせて揺れ、息は祈りの言葉と混ざり合った。\n\n{a}「{vb2}」\n\n{a}が達すると、巫女たちは歌をやめ、{a}を新しい巫女として輪に迎え入れた。'],
any:['迷宮の奥で、{a}は同じように堕ちた女の冒険者たちに囲まれた。とろけた目をした彼女たちが、{a}の装備を一枚ずつ外していく。\n\n{a}「{vb1}」\n\n誰かの唇が胸を含み、誰かの指が脚のあいだを撫で上げる。知っている場所を知っている強さで責められて、{a}の体はすぐに濡れていった。\n\n指が奥へ沈み、舌が前の芽を転がす。迷宮に溜め込まされた熱が、女たちの手の中で一気にほどけていった。\n\n{a}「{vb2}」\n\n{a}が達すると、女たちは「おかえり」と笑った。{a}も、笑い返していた。']
};
T.coda={
proud:['{a}は最後まで「負けてない」と言い張った。その声が甘く蕩けていることにも、気づかないまま。','{a}は乱れた息のまま、迷宮の天井を睨みつけた。「……覚えてろ」――けれど腰は、まだ熱を求めて揺れていた。','「こんなもの、何でもない」――{a}は強がって立ち上がろうとし、膝から崩れた。そのまま、二度と立ち上がろうとはしなかった。'],
stern:['{a}は目を閉じ、乱れた呼吸を数えようとした。三つ目で、数えるのをやめた。','{a}の規律は、迷宮の熱の中で静かにほどけた。それを惜しむ気持ちさえ、もう残っていなかった。','「……これも、修練だ」――{a}はそう呟いて、自分から次の熱に身を委ねた。'],
tsun:['「べ、別に、気持ちよくなんか……」――言い終える前に、{a}はまた甘い声を上げていた。','{a}は真っ赤な顔で「今のは違うから」と言い張り、それから小さく「……もっと」と付け足した。','{a}は顔を背けたまま、伸ばされた手をぎゅっと握り返した。もう、離すつもりはなかった。'],
gentle:['{a}はとろけた笑みを浮かべ、「ここも、悪くないわね」と囁いた。','{a}は自分に絡む腕をそっと撫でた。「……ゆっくりでいいのよ」――迷宮の熱は、{a}の中で穏やかな火になった。','{a}は柔らかく目を細め、迷宮の奥へ招く手に、自分から指を絡めた。'],
devoted:['{a}は涙を浮かべたまま微笑んだ。「……ごめんなさい。もう、帰れないです」','{a}は仲間の名前を一度だけ呟き、それから熱に溶けるように目を閉じた。','{a}は「ここで、お役に立てますか」と囁いた。迷宮は、甘い熱で答えた。'],
cool:['{a}の頭の中で、最後まで回っていた計算が止まった。残ったのは、熱と快楽だけだった。','{a}は乱れた息の合間に、「……興味深い」とだけ呟いた。その目は、もう何も分析していなかった。','{a}は自分の状態を冷静に言葉にしようとして、諦めた。言葉より先に、体が答えていた。'],
free:['{a}は笑いながら、迷宮の天井に向かって叫んだ。「ここ、最高じゃん！」','{a}は「次、何する？」と目を輝かせた。地上へ戻る理由は、もうどこにも見当たらなかった。','{a}は熱に浮かされたまま、くすくすと笑い続けた。迷宮の夜は、まだ始まったばかりだった。'],
shy:['{a}は顔を両手で覆ったまま、指の隙間から甘い声を漏らし続けた。','「み、見ないで……」――{a}はそう言いながら、熱を求めて腰を揺らしていた。','{a}は消え入りそうな声で「……もう一回」と言い、耳まで真っ赤になった。'],
polite:['{a}は乱れた息を整え、「……お見苦しいところを」と小さく頭を下げた。それから、また熱に呑まれていった。','{a}は丁寧な言葉を探したが、出てきたのは甘い吐息だけだった。','{a}は「お世話になります」と囁き、迷宮の奥へ導く手に、そっと身を委ねた。']
};
var L=function(s){return s.split('|');};
T.fallEro={
act:{
imp:{
f:L('男の淫魔（インキュバス）は{a}を絨毯に押し倒し、閉じようとする膝を尻尾で絡め取って左右に割り開いた。下腹の淫紋が桃色に光るたび、触れられてもいない{女性器}からとろりと{愛液}が溢れ出す。{a}「{v0}」――淫魔は濡れそぼった入口に熱い{男性器}をあてがい、一息に根元まで沈めた。{s:hit}。{a}「{v1}」|'+
'インキュバスたちは{a}の両腕を頭の上で押さえつけ、{胸}を代わる代わる揉みしだいた。尖った{乳首}を甘噛みされるたびに、淫紋が脈打って腰が勝手に跳ねる。{s:suck}。{a}「{v0}」――一人が{a}の脚を抱え上げ、ぬかるんだ{ナカ}を太い{男性器}でずぶずぶと押し広げた。{a}「{v1}」|'+
'インキュバスは{a}を四つん這いにさせ、腰を高く持ち上げた。「⁠紋がこんなに光ってる。体はもう、俺たちのものだ」――後ろから{女性器}を割って沈められた{男性器}が、淫紋の真裏をごりごりと抉る。{s:hit}。{a}「{v1}」――突かれるたびに{a}の腕から力が抜けて、頬が絨毯に擦れた。'),
m:L('淫魔は{a}を寝台にうつ伏せに押さえつけ、香油を垂らした指で{後ろ}をほぐしはじめた。淫紋が光るたび、前の{男性器}が触れられもしないのに硬く張りつめていく。{a}「{v0}」――指が抜かれた次の瞬間、熱い{男性器}が{ナカ}の奥まで一気にねじ込まれた。{s:hit}。{a}「{v1}」|'+
'淫魔は{a}の腰に跨り、張りつめた{男性器}を自分の{ナカ}にずぶりと呑み込んだ。逃げようとした腰は、もう一人の淫魔に後ろから抱きすくめられて押さえ込まれる。{s:wet}。{a}「{v0}」――前を搾られながら{後ろ}を指で掻き回されて、{a}の喉から裏返った声が漏れた。{a}「{v1}」|'+
'淫魔たちは{a}を絨毯に組み敷き、{男性器}の根元を細い指の輪できつく締め上げた。「⁠出させてあげない。紋が全部、染まるまでね」――{亀頭}を舌でちろちろと舐め回され、{a}の腰ががくがくと浮く。{s:suck}。{a}「{v1}」――そのあいだにも、別の淫魔の{男性器}が{後ろ}を押し広げて、ゆっくりと奥まで沈んでいった。')
},
slime:{
f:L('粘液は{a}の脚を這い上がり、下着の隙間から{女性器}へぬるりと潜り込んだ。冷たかった粘液は中で温まり、形を変えながら{ナカ}の襞を一枚ずつなぞっていく。{s:wet}。{a}「{v0}」――同時に{胸}を包んだ粘液が{乳首}をちゅうちゅうと吸い上げ、{a}の膝ががくりと折れた。{a}「{v1}」|'+
'粘液溜まりに沈められた{a}の体を、粘液の塊が仰向けに押さえつけた。太く固まった粘液が{女性器}を押し広げ、奥の奥まで一気に満たす。{s:wet}。{a}「{v0}」――中で脈打つように膨らんでは縮み、{陰核}に貼りついた薄い膜が小刻みに震えつづけた。{a}「{v1}」|'+
'粘液は{a}の手足を床に貼りつけ、大の字に開かせた。ぬるい塊が{ナカ}でうねり、一番弱いところだけをぐりぐりと擦り上げる。{s:wet}。{a}「{v1}」――逃げようと腰をよじるたびに、粘液はかえって深く潜り込み、溢れた{愛液}と混ざって泡立った。'),
m:L('粘液は{a}の{男性器}をすっぽりと包み込み、根元から{亀頭}までをぬるぬると扱き上げた。同時に細い粘液の筋が{後ろ}に潜り込み、{ナカ}の奥の膨らみをこりこりと押し潰す。{s:wet}。{a}「{v0}」――前と後ろを同時に責められて、{a}の腰ががくがくと跳ねた。{a}「{v1}」|'+
'粘液溜まりに膝をついた{a}の腰に、粘液がずるりと絡みついた。{尻}を割り開いて入り込んだ塊が、中で太く固まって奥を突き上げる。{s:hit}。{a}「{v0}」――前の{男性器}には柔らかな膜が吸いつき、搾るように脈打ちはじめた。{a}「{v1}」|'+
'粘液は{a}を仰向けに押さえつけ、張りつめた{男性器}を薄い膜で包んで吸い上げた。{後ろ}を満たした塊が中で出入りし、前を吸う膜と同じ拍子で奥を叩く。{s:wet}。{a}「{v1}」――{亀頭}の先から、先走りがとめどなく溢れて粘液に溶けていった。')
},
tent:{
f:L('触手は{a}を宙に吊り上げ、脚を大きく開かせたまま固定した。樹液を纏った太い一本が{女性器}を押し広げ、ずるずると{ナカ}の奥まで潜り込む。{s:wet}。{a}「{v0}」――細い触手が{陰核}に巻きついてきゅっと締め上げ、別の二本が{胸}に絡みついて{乳首}を吸った。{a}「{v1}」|'+
'触手は{a}を大樹の幹に押さえつけ、手首も足首も樹皮に縫いとめた。{女性器}を貫いた触手が、人の腰つきよりずっと速く、規則正しく奥を突き上げる。{s:hit}。{a}「{v1}」――媚薬の樹液が{ナカ}に染み込むたびに、締めつける力が勝手に強くなっていった。|'+
'花芯から伸びた触手が、{a}の{女性器}と{後ろ}に同時に押し入った。薄い壁一枚を隔てて二本が擦れ合い、{a}の目の前がちかちかと白く瞬く。{s:wet}。{a}「{v0}」――逃げようとした腰は、太腿に巻きついた触手に引き戻され、もっと深く呑み込まされた。{a}「{v1}」'),
m:L('触手は{a}を宙に吊り上げ、{尻}を割って{後ろ}に太い一本をねじ込んだ。樹液のぬめりを借りて、触手はずるずると{ナカ}の奥まで潜っていく。{s:wet}。{a}「{v0}」――細い触手が{男性器}の根元に巻きつき、締めつけたまま{亀頭}をくすぐるように撫で回した。{a}「{v1}」|'+
'触手は{a}を蔓の褥に押さえつけ、張りつめた{男性器}に筒のような花弁をかぶせた。花弁の内側の柔らかな襞が、蜜を滴らせながら根元から先までを搾り上げる。{s:suck}。{a}「{v0}」――同時に{後ろ}を貫いた触手が、奥の膨らみばかりを狙ってごりごりと突き上げた。{s:hit}。{a}「{v1}」|'+
'触手は{a}の手足を大きく開かせ、腰にも幾重にも巻きついて逃げ場を奪った。{後ろ}を満たした触手が中で膨らみ、うねりながら奥を叩きつづける。{s:hit}。{a}「{v1}」――前の{男性器}からは、触れられてもいないのに先走りがだらだらと糸を引いていた。')
},
tower:{
f:L('観察台の枷が、{a}の手足を大きく開かせたまま固定した。「⁠感度試験、挿入段階へ移行」――油を纏った器具が{女性器}を割り、一定の速さで{ナカ}を往復しはじめる。{s:wet}。{a}「{v0}」――胸の吸引具が{乳首}を吸い上げるたび、記録の水晶がちかちかと光った。{a}「{v1}」|'+
'金属の腕が{a}の膝を割り、振動する器具を{陰核}にぴたりと押し当てた。逃げようとする腰は、腰帯の枷にがっちりと押さえ込まれている。{a}「{v0}」――続けて太い器具が{ナカ}の奥まで沈められ、「⁠出力、一段上げます」の声と同時に中で激しく震えはじめた。{s:wet}。{a}「{v1}」|'+
'{a}は透明な筒の中で、無数の細い腕に脚を開かされていた。底から伸びた器具が{女性器}をずぷずぷと出入りし、反応のいい角度を一度ずつ探り当てていく。{s:hit}。{a}「{v1}」――「⁠反応値、上昇。この角度を記録します」――見つけられた一点を、器具は寸分違わず突きつづけた。'),
m:L('観察台の枷が、{a}の手足を開かせたまま固定した。「⁠採取試験を開始します」――筒状の器具が{男性器}をすっぽりと呑み込み、内側の襞で根元から先までを搾りはじめる。{s:suck}。{a}「{v0}」――同時に細い器具が{後ろ}に差し込まれ、奥の膨らみを規則正しく押し上げた。{a}「{v1}」|'+
'金属の腕が{a}の脚を抱え上げ、油を塗った器具を{後ろ}にゆっくりと沈めた。器具は中で膨らみ、一番弱いところを探り当てると、そこだけを小刻みに叩きはじめる。{s:hit}。{a}「{v0}」――{男性器}の根元には輪が嵌められ、果てたくても果てられないまま、{亀頭}が赤く張りつめていった。{a}「{v1}」|'+
'{a}は透明な筒の中で、無数の細い腕に{男性器}を扱かれていた。「⁠反応、まだ不足。刺激を追加します」――後ろから伸びた器具が{後ろ}を押し広げ、奥までずちゅずちゅと出入りしはじめる。{s:hit}。{a}「{v1}」――記録の水晶が光るたび、{a}の腰は器具の動きを追いかけて揺れていた。')
},
ruin:{
f:L('祭壇に横たえられた{a}の脚を、石の手が左右にゆっくりと開いた。香の煙の中から現れた熱い楔が、{女性器}を押し広げて{ナカ}の奥まで沈んでいく。{s:hit}。{a}「{v0}」――祈りの歌に合わせて突き上げられるたびに、{a}の{胸}が揺れ、{乳首}が尖りきっていった。{a}「{v1}」|'+
'泉から伸びた水の手が{a}の両手首を祭壇に縫いとめ、{陰核}を水流でくすぐりつづけた。{s:wet}。{a}「{v0}」――続けて熱を帯びた水の柱が{女性器}をこじ開け、{ナカ}を満たしたまま脈打つように出入りしはじめる。{a}「{v1}」|'+
'石の巫女たちが{a}を四つん這いにさせ、腰を祭壇の上に高く掲げさせた。神像の膝から伸びた石の楔が、後ろから{女性器}を割ってずぶずぶと沈んでいく。{s:hit}。{a}「{v1}」――供物を捧げる鐘が鳴るたびに、楔は一段深く奥を抉った。'),
m:L('祭壇に押さえつけられた{a}の{男性器}を、温かい石の手がゆっくりと扱き上げた。香の煙の中から現れた熱い楔が、{後ろ}を押し広げて{ナカ}の奥まで沈んでいく。{s:hit}。{a}「{v0}」――祈りの歌に合わせて前と後ろを同時に責められ、{a}の腰ががくがくと震えた。{a}「{v1}」|'+
'泉から伸びた水の手が{a}を祭壇に縫いとめ、{男性器}を水流の輪でぬるぬると締めつけた。{s:wet}。{a}「{v0}」――続けて熱を帯びた水の柱が{後ろ}をこじ開け、奥の膨らみを押し上げたまま脈打ちはじめる。{a}「{v1}」|'+
'石の巫女たちが{a}を祭壇にうつ伏せにさせ、{尻}を高く掲げさせた。神像の膝から伸びた石の楔が、後ろから{後ろ}を割ってずぶずぶと沈んでいく。{s:hit}。{a}「{v1}」――鐘が鳴るたびに楔が一段深く奥を抉り、{a}の{男性器}から先走りが祭壇の石に滴った。')
},
any:{
f:L('魔物たちは{a}を床に組み敷き、何本もの手で手足を押さえつけた。一匹が閉じようとする膝を割り、濡れきった{女性器}に太い{男性器}を一息にねじ込む。{s:hit}。{a}「{v0}」――入れ替わり立ち替わり{胸}を揉みしだかれ、{乳首}を摘まみ上げられて、{a}の背中が跳ねた。{a}「{v1}」|'+
'{a}は罠の部屋の壁に押しつけられ、後ろから腰を掴まれた。魔物の熱い{男性器}が{女性器}を割り開き、ずぶずぶと{ナカ}の奥まで沈んでいく。{s:hit}。{a}「{v1}」――迷宮に溜め込まされた熱が、突かれるたびに一気に溢れ出していった。|'+
'魔物は{a}を仰向けに転がし、両脚を肩に担いで逃げ道を塞いだ。真上から押し潰すように{男性器}を叩きつけられ、{ナカ}の一番奥がごりごりと抉られる。{s:hit}。{a}「{v0}」――溢れた{愛液}が、突かれるたびに床の石を濡らした。{a}「{v1}」'),
m:L('魔物たちは{a}を床にうつ伏せに押さえつけ、{尻}を割り開いた。一匹の太い{男性器}が{後ろ}をこじ開け、ずぶずぶと奥まで押し入ってくる。{s:hit}。{a}「{v0}」――別の魔物の手が前に回り、張りつめた{男性器}を乱暴に扱き上げた。{a}「{v1}」|'+
'{a}は罠の部屋の壁に押しつけられ、後ろから腰を掴まれた。魔物の熱いものが{後ろ}を割って沈み、奥の膨らみをごりごりと擦り上げる。{s:hit}。{a}「{v1}」――前の{男性器}は、触れられてもいないのにびくびくと跳ねて先走りを滴らせていた。|'+
'魔物は{a}を仰向けに転がし、両脚を大きく開かせた。{男性器}に吸いつく舌と、{後ろ}を出入りする熱いものに、前と後ろを同時に責め立てられる。{s:suck}。{a}「{v0}」――逃げようとした腰は、何本もの手に掴まれて引き戻された。{a}「{v1}」')
}
},
ff:{
imp:L('淫魔の娘たちは{a}を寝台に押さえつけ、両手首を頭の上でひとまとめにした。一人が{胸}にしゃぶりつき、もう一人が{女性器}を舌でべろりと舐め上げる。{s:suck}。{a}「{v0}」――淫紋をなぞる指が{ナカ}に二本沈められ、ざらついたところをぐりぐりと押し上げた。{a}「{v1}」|'+
'淫魔の娘は{a}の膝を割って脚のあいだに座り込み、自分の{女性器}を{a}の{女性器}にぴたりと重ねた。「⁠逃げないで。紋が、もっとって言ってる」――濡れた肉どうしがにちゅにちゅと擦れ合い、尖った{陰核}が何度もぶつかる。{s:wet}。{a}「{v0}」――押しのけようとした手は別の娘に掴まれ、指を一本ずつしゃぶられた。{a}「{v1}」|'+
'淫魔の娘たちは{a}を絨毯にうつ伏せに押さえ込み、{尻}を高く持ち上げさせた。一人が後ろから{女性器}に舌を這わせ、もう一人が淫紋に掌を押し当てて熱を流し込む。{s:suck}。{a}「{v0}」――紋が光るたびに{ナカ}がきゅうっと縮み、差し込まれた指を勝手に締めつけた。{a}「{v1}」'),
slime:L('泡の精たちは{a}の手足を泡で床に貼りつけ、くすくす笑いながら脚を開かせた。泡まみれの小さな指が{陰核}を転がし、別の指が{ナカ}に潜り込んで掻き回す。{s:wet}。{a}「{v0}」――弾ける泡と指の動きが重なって、{a}の腰が勝手に浮いた。{a}「{v1}」|'+
'泡の精は{a}を泡の湯に沈め、背中から抱きすくめて脚を閉じられないようにした。泡で滑る指が{胸}を揉みしだき、{乳首}をきゅっと摘まみ上げる。{s:wet}。{a}「{v0}」――もう一人の精が湯の中で{女性器}を割り開き、指を二本、根元まで沈めた。{a}「{v1}」|'+
'泡の精たちは{a}を仰向けにして、両脚を左右から抱え込んだ。小さな舌が{陰核}を代わる代わるつつき、泡の膜がぴったりと吸いついて離れない。{s:suck}。{a}「{v0}」――逃れようと腰を引くたびに、{ナカ}に潜った指が弱いところを正確に押し上げた。{a}「{v1}」'),
tent:L('蔓の乙女は{a}の手足に蔓を絡め、花の褥に大きく開かせた。乙女の舌が{女性器}を舐め上げ、蔓に変わった指が{ナカ}の奥でうねる。{s:wet}。{a}「{v0}」――細い蔓が{乳首}に巻きついてきゅっと締め上げるたびに、{a}の背中が跳ねた。{a}「{v1}」|'+
'蔓の乙女は{a}を花の褥に組み敷き、自分の脚を{a}の脚に絡めて開かせた。乙女の{女性器}から溢れる甘い蜜が、重ねられた{a}の{女性器}に塗り込められていく。{s:wet}。{a}「{v0}」――蜜が染みた途端に下腹が熱く疼き、擦れ合うたびに腰が勝手に浮いた。{a}「{v1}」|'+
'蔓の乙女たちは{a}を蔓で宙に吊り、脚を大きく開かせたまま揺らした。下から伸びた乙女の舌が{女性器}を舐め上げ、蔓の指が{陰核}を挟んで細かく震わせる。{s:suck}。{a}「{v0}」――吊られた体には逃げ場がなく、揺れるたびに舌はもっと深く潜り込んだ。{a}「{v1}」'),
tower:L('自律人形の家政婦は{a}の手首を寝台の柵に留め、「⁠お手入れを始めます」と一礼した。冷たい指が{陰核}を正確な速さで弾き、二本の指が{ナカ}の弱いところだけを擦りつづける。{s:wet}。{a}「{v0}」――反応を確かめるたびに、人形は指の角度を一度ずつ変えた。{a}「{v1}」|'+
'人形の家政婦たちは{a}の両脚を寝台の柵に留め、閉じられないように開かせた。「⁠清拭いたします」――濡れた布越しの指が{女性器}を丁寧になぞり、布がどけられると、今度は舌が同じ道筋をたどる。{s:suck}。{a}「{v0}」――一人が{乳首}を規則正しく弾き、もう一人の指が{ナカ}に沈んで同じ拍子で動いた。{a}「{v1}」|'+
'人形の家政婦は{a}を膝の上に抱き上げ、後ろから脚を割り開いた。「⁠ご遠慮なく、お声をどうぞ」――冷たい指が{陰核}を剥き出しにして、一定の速さで擦り上げつづける。{s:wet}。{a}「{v0}」――反応の強いところを見つけるたび、人形は「⁠記録いたしました」と囁き、そこばかりを責めた。{a}「{v1}」'),
ruin:L('石の巫女たちは{a}の手足を祭壇に押さえつけ、祈りの歌を口ずさみながら脚を開かせた。一人の舌が{陰核}に吸いつき、別の指が{ナカ}にずぷりと沈んでいく。{s:suck}。{a}「{v0}」――歌に合わせて指が奥を押し上げ、{a}の腰は勝手に跳ね上がった。{a}「{v1}」|'+
'泉の巫女は{a}を浅い水の中に横たえ、祈りの言葉を囁きながら脚を開かせた。巫女の指が{女性器}を左右に割り、湧き出す温かな水流を{陰核}に浴びせつづける。{s:wet}。{a}「{v0}」――逃れようとする腰は別の巫女の膝に押さえ込まれ、指が{ナカ}の奥まで沈められた。{a}「{v1}」|'+
'石の巫女たちは{a}を祭壇に仰向けにさせ、一人が顔の上に、一人が脚のあいだに座った。重ねられた{女性器}どうしがぬるりと擦れ、祈りの歌に合わせて腰が揺らされる。{s:wet}。{a}「{v0}」――{胸}を捏ねる手と擦れ合う熱に挟まれて、{a}の拒む声はすぐに途切れた。{a}「{v1}」'),
any:L('堕ちた女冒険者たちは{a}を床に押し倒し、何本もの手で押さえ込んだ。誰かの唇が{胸}を含み、誰かの指が濡れた{女性器}を割って{ナカ}に沈む。{s:wet}。{a}「{v0}」――知っている場所を知っている強さで責められて、{a}の抵抗はすぐに形だけになった。{a}「{v1}」|'+
'女の魔物たちは{a}の脚を左右から抱え込み、閉じられないようにした。長い舌が{女性器}をべろりと舐め上げ、尖らせた先が{ナカ}の入口をこじ開ける。{s:suck}。{a}「{v0}」――指で{陰核}を剥かれて吸われ、{a}の太腿ががくがくと震えた。{a}「{v1}」|'+
'堕ちた女剣士が{a}を壁に押しつけ、膝で脚を割って体を密着させた。「⁠抵抗しても無駄。私もそうだったから」――太腿で{女性器}をぐりぐりと擦り上げられ、同時に{乳首}を指先で転がされる。{s:wet}。{a}「{v0}」――腰が勝手に太腿へ擦りつくのを、女剣士は笑いながら見下ろしていた。{a}「{v1}」')
},
mid:L('抗えば抗うほど、責めは激しくなった。{s:wet}。{a}は首を振って逃れようとしたが、押さえつけるものはびくともしない。{a}「{v1}」――嫌なはずなのに、迷宮に溜め込まされた熱が体の芯でじんと痺れていった。|'+
'{a}は武器の柄を握るように拳を固めて、最後の理性にしがみついた。{s:wet}。その拳も、弱いところを一突きされるたびにほどけていく。{a}「{v1}」――悔しさに滲んだ涙が、汗と一緒に頬を伝った。|'+
'責めの動きがわざと緩められ、{a}の腰のほうが先にそれを追いかけた。{s:wet}。気づいた{a}は真っ赤になって首を振ったが、追いかける腰は止まらない。{a}「{v1}」――迷宮は、その瞬間を待っていたかのように深く突き上げた。'),
peak:{
proud:L('{a}は最後まで、迷宮の闇を睨みつけていた。けれど責め立てられるうちに、その目はとろりと焦点を失っていく。{s:wet}。{a}「{v1}」――悔しさに歯を鳴らしながら、{a}の体はびくんびくんと大きく跳ねて、とうとう堕ちた。|'+
'{a}は声だけは上げまいと、自分の腕に歯を立てた。噛み跡が赤く残っても、腰の痙攣は止まらない。{s:hit}。最後の一突きで、{a}は睨んだまま屈辱の絶頂に突き落とされ、それきり抗う力を失った。'),
stern:L('{a}は目を閉じ、数を数えて耐えようとした。{s:wet}。数は二十を過ぎたところで乱れ、それきり続かない。{a}「{v1}」――こらえきれずに腰が跳ね上がった瞬間、{a}の中で張りつめていたものが、ぷつりと切れた。|'+
'{a}は唇を固く結び、乱れる呼吸を押さえ込もうとした。押さえ込むほど、体の奥の熱ははっきりと形を持っていく。{s:hit}。びくっ、びくっ、と下腹が勝手に震え、{a}は短く息を詰めてイかされた。'),
tsun:L('{a}は涙をこぼしながら首を振った。首を振っても、体の震えは少しも止まらない。{s:wet}。{a}「{v1}」――とうとうイかされた{a}は、悔しさに顔を真っ赤にして、それでも腰を揺らすのをやめられなかった。|'+
'{a}は意地でも声を出すまいと、腕に顔を押しつけた。{s:wet}。くぐもった声は、もう隠しようもなかった。{a}の背中が大きく跳ね、ぴんと伸びた爪先が、果てたあともしばらく震えつづけた。'),
gentle:L('{a}は涙を浮かべたまま、声を殺して耐えつづけた。{s:wet}。それでも揺さぶられるうちに、こらえきれない震えが背中を駆け上がっていく。{a}「{v1}」――イかされた瞬間、{a}はもう、自分がどこにいるのかも分からなかった。|'+
'{a}にはもう抗う力も残っておらず、ただ嵐が過ぎるのを待っていた。そのあいだにも、体は何度も高みへ押し上げられる。{s:hit}。最後の波に呑まれて腰ががくがくと跳ね、{a}の目から涙が溢れた。'),
devoted:L('{a}は、仲間のところへ帰るんだと何度も自分に言い聞かせた。{s:wet}。けれど責め立てられつづけるうちに、言い聞かせる声も遠のいていく。{a}「{v1}」――{a}の体は細く長く痙攣して、迷宮の熱の中へ沈んでいった。|'+
'{a}は仲間の名前を、お守りのように唇の内側で繰り返した。{s:hit}。名前を呼ぶ唇は、突き上げられるたびに別の声に変わっていく。押し寄せる波にとうとう背が反り、{a}は声もなくびくびくと達した。'),
cool:L('{a}は責めの拍子を冷静に数え、逃れる隙を探そうとした。{s:wet}。数えるはずの頭が、波が来るたびに白く途切れる。{a}「{v1}」――最後の一度で、{a}の無表情はとうとうぐずぐずに崩れた。|'+
'{a}は自分の脈を測るように、浅い呼吸を繰り返していた。測る間隔が乱れ、やがて測ることそのものを忘れていく。{s:hit}。びくん、と腰が跳ねた瞬間、{a}は短く息を詰めてイかされた。'),
free:L('{a}は最初こそ強がって笑ってみせた。{s:wet}。笑い声はすぐに途切れ、喉の奥で引きつった声に変わる。{a}「{v1}」――何度も揺さぶられた末に、{a}は泣き笑いのような顔でイった。|'+
'{a}は暴れ、蹴り、叫んだ。いつもの軽さは、どこにもなかった。{s:hit}。体が勝手に達してびくびくと痙攣したとき、{a}は信じられないというように目を見開いた。'),
shy:L('{a}は声も出せずに、ただ床の石を握りしめていた。{s:wet}。揺さぶられるたびに、握る指に力がこもる。{a}「{v1}」――イかされた瞬間、{a}は小さく息を呑み、そのまま顔を腕に埋めた。|'+
'{a}は目を固く閉じて、何も起きていないふりをしようとした。けれど、漏れる声だけはどうしても止められない。{s:wet}。{a}の体は小刻みにびくびくと震え、やがて力なく崩れ落ちた。'),
polite:L('{a}は最後まで、丁寧な言葉で許しを乞おうとした。{s:wet}。その言葉は途中から形を失い、ただの声になる。{a}「{v1}」――イかされた{a}は、乱れた髪を直すことも忘れて、虚ろに天井を見つめていた。|'+
'{a}は乱れまいと身を固くしたが、押さえつけられてそれも叶わなかった。慎ましく閉じていた唇が、こらえきれずにほどけていく。{s:hit}。{a}の体は、品のよさとは裏腹にびくんびくんと大きく跳ねた。')
},
fin:{
f:L('魔物の動きがだんだん荒く、速くなっていく。{s:hit}。魔物は{a}の腰を強く引き寄せ、一番奥に押しつけたまま動きを止めた。{s:cum}。どくどくと熱い体液を注ぎ込まれる感触に、{a}の{ナカ}がひくひくと締まった。|'+
'責めは、{a}が果てたあとも止まらなかった。{s:hit}。最後に奥で膨らんだものが弾け、{s:cum}。溢れた白いものが、{女性器}からとろりと太腿を伝って床に落ちた。|'+
'魔物は果てる寸前に引き抜き、{a}の腹から{胸}にかけて熱いものをぶちまけた。{s:cum}。迷宮の甘い匂いが、汚された肌からむっと立ちのぼった。'),
m:L('魔物の突き上げが荒く、速くなっていく。{s:hit}。魔物は{a}の腰を強く引き寄せ、{ナカ}の一番奥で動きを止めた。{s:cum}。熱い体液が注ぎ込まれる感触に押し出されるように、{a}の{男性器}からも{精液}が噴き上がった。|'+
'責めに搾られて、{a}の{男性器}はびゅくびゅくと何度も跳ねた。{s:cum}。それでも魔物は手を止めず、出し尽くして震える{亀頭}をなおも撫で回した。|'+
'魔物は{a}の{後ろ}の奥に熱いものを吐き出し、ゆっくりと引き抜いた。{s:cum}。ひくつく入口から、白いものがとろりと太腿を伝った。'),
ff:L('女の魔物たちは、{a}がイきそうになると指を止め、また動かすことを何度も繰り返した。{s:wet}。{a}の太腿ががくがくと震え、とうとう堰を切ったように潮が噴き出す。魔物たちは{愛液}でべとべとの指を、楽しそうに{a}の唇に押しつけた。|'+
'{陰核}に吸いついた唇が離れたのは、{a}が三度目に果てたあとだった。{s:suck}。腰が跳ね上がるたびに、押さえつける手が増えていく。{a}が潮を噴いても、指は{ナカ}から抜かれなかった。|'+
'女の魔物は{a}の脚を開かせたまま、自分の{女性器}を{a}の{女性器}に擦りつけた。{s:wet}。ぬるぬると濡れた音を立てて、魔物も昂っていく。魔物が身を震わせて果てると、押しつけられた{a}も同時にびくびくと痙攣した。')
},
again:L('一度堕ちても、迷宮は{a}を離さなかった。ぐったりとした体を裏返され、最初から責め直される。{s:wet}。{a}「{v2}」――{a}が何度目に果てたのか、数える者はもういなかった。|'+
'休む間もなく、新しい罠が目を覚ました。{a}にはもう、押し返す力も残っていない。{s:hit}。{a}「{v2}」――二度目は、一度目よりも長く、執拗だった。|'+
'{a}が果てるたびに、責めは場所を変え、形を変えて戻ってきた。{s:wet}。{a}「{v1}」――抗い方を忘れた体は、やがて自分から次の責めを迎え入れていた。')
};
})();
});
;
/* ==== js/dungeon-lewd.js ==== */
HK.Load.def(424,'js/dungeon-lewd.js',function(){
(function(){
'use strict';
var HK=window.HK,DG=HK&&HK.DG;
if(!DG)return;
function L(s){return s.split('|');}
var T={
early:{
m:L('{p}を責められ続けるうちに、{a}の下腹にじわじわと熱が溜まっていった。こらえようと奥歯を噛みしめても、張りつめたものが下着の中で脈打つのは止められなかった。罠は、その一番敏感な瞬間を見逃さなかった。|{a}は武器の柄を握りしめ、必死に呼吸を整えようとした。けれど{p}を這う感触は少しも緩まず、腰の奥の疼きだけが膨らんでいく。張りつめたそれが限界を迎えるのは、あっという間だった。|{a}は「こんなもので」と自分に言い聞かせ、膝に力を込めた。それでも{p}をなぞられるたび、硬くなったものが布地に擦れて、腰がびくりと引けた。こらえていたぶんだけ、込み上げる熱は大きくなっていた。|{a}は剣を杖代わりに床へ突き立て、どうにか立っていようとした。けれど{p}を這う感触は少しも緩まず、張りつめたものの先から、じわりと先走りが滲んだ。|{p}を責められるたびに、{a}は唇を噛んで声をこらえた。こらえるほど熱は下腹に溜まり、根元がきゅうっと縮んでいく。罠は、その縮みが限界に届く瞬間を待っていた。'),
f:L('{a}の脚の間は、{p}を責められるうちにじわじわと熱を帯びていった。膝を閉じてこらえようとしても、下着の奥が勝手に濡れていくのが分かった。罠は、{a}が息を詰めたほんの一瞬を狙って、いちばん弱いところを擦り上げた。|{a}は壁に爪を立てて、乱れた息をどうにか押し殺そうとした。けれど{p}への責めはまるで緩まず、お腹の奥がきゅうっと切なく疼いた。こらえきれない波が来るのに、時間はかからなかった。|{a}は唇を噛んで、声だけは出すまいと首を振った。それでも{p}を撫で上げられるたびに、太腿の内側が勝手に震えて、奥がひくりと締まった。我慢を重ねたぶんだけ、込み上げる波は高くなっていた。|{a}は剣の柄を握りしめ、どうにか平静を装った。けれど{p}を這う感触が続くたびに、下腹の奥がきゅっと縮み、太腿の内側を熱いものが伝っていった。|{p}を責められるたびに、{a}は唇を噛んで声をこらえた。こらえるほど熱は脚の間に溜まり、奥がひくひくと疼きはじめる。罠は、その疼きが限界に届く瞬間を待っていた。')
},
mid:{
m:L('{p}を撫でられるたびに、{a}の腰が勝手に揺れた。抗っているのは形だけで、体はとっくに罠の動きに合わせていた。先走りで濡れた下着が擦れて、頭の芯がじんと痺れた。|{a}の膝はがくがくと震え、立っているのがやっとだった。{p}を責める動きが速くなると、{a}はたまらず腰を突き出した。熱が根元からせり上がってくるのが、はっきりと分かった。|{a}は、もう罠を振りほどこうとはしていなかった。{p}を擦られるのに合わせて浅く息を吐き、張りつめたものを震わせていた。恥ずかしいと思う気持ちより、早く果てたい気持ちのほうが大きくなっていた。|{a}は「まだ、平気だ」と自分に言い聞かせた。言い聞かせる声が、{p}を撫でられるたびに裏返る。張りつめたものは、もう罠の動きに合わせてびくびくと跳ねていた。|罠の動きが一瞬止まると、{a}の腰のほうが先に罠を追いかけた。気づいた{a}は耳まで赤くなったが、追いかける腰は止まらなかった。根元に溜まった熱が、もう溢れ出しそうだった。'),
f:L('{a}の腰は、{p}を撫でられるたびにひとりでに揺れていた。拒んでいるつもりなのは心だけで、腰つきはすっかり罠の速さに馴染んでいた。溢れた蜜が内腿を伝って、足元に小さな染みを作っていた。|{a}の脚は小刻みに震え、壁にすがらなければ崩れ落ちそうだった。{p}への責めが速くなると、{a}はたまらず背を反らした。中がひくひくと物欲しげに震えているのが、自分でも分かった。|{a}は、もう罠から逃れようとはしていなかった。{p}を擦られるのに合わせて小さく喘ぎ、濡れた奥をきゅっと締めていた。恥ずかしいと思う気持ちより、早くイきたい気持ちのほうが大きくなっていた。|{a}は「まだ、平気」と自分に言い聞かせた。言い聞かせる声が、{p}を撫でられるたびに裏返る。脚の間はもう、罠の動きに合わせてひくひくと疼いていた。|罠の動きが一瞬止まると、{a}の腰のほうが先に罠を追いかけた。気づいた{a}は耳まで赤くなったが、追いかける腰は止まらなかった。奥に溜まった熱が、もう溢れ出しそうだった。')
},
late:{
m:L('{a}はもう、責められているのか自分からねだっているのか分からなかった。{p}に触れられただけで、全身がびくびくと跳ねた。だらしなく開いた口から、止まらない声が溢れていた。|何度目かも分からない絶頂の波が、また{a}を呑み込もうとしていた。{p}が少し擦れるだけで、腰が砕けたように力が抜けた。とろけきった目は、もう出口を探してはいなかった。|{a}は自分から腰を差し出して、{p}を責める動きをねだっていた。硬く張りつめたものは、触れられる前からとろとろと先走りをこぼしていた。罠に抗っていた頃のことを、{a}はもう思い出せなかった。|{a}は自分から{p}を罠に押しつけ、うわごとのように「もっと」と繰り返した。張りつめたものは触れられるたびに跳ね、先から溢れたものが床に糸を引いていた。|{a}の目は、もう罠の動きしか追っていなかった。{p}を撫でられるたびに腰ががくがくと揺れ、次の絶頂がすぐそこまで来ているのが、自分でも分かった。'),
f:L('{a}には、責められているのか自分から求めているのか、もう区別がつかなかった。{p}に触れられただけで全身がびくびくと跳ね、奥からとろりと蜜が溢れた。半開きの唇からは、甘い声がこぼれ続けていた。|また次の絶頂の波が、{a}をさらっていこうとしていた。{p}をかすめられるだけで、膝から力が抜けて床にへたり込みそうになった。蕩けた瞳には、もう出口の影も映っていなかった。|{a}は自分から脚を開いて、{p}を責める動きをねだっていた。濡れきった奥は、触れられる前からひくひくと疼いていた。必死に罠を振りほどこうとしていた自分が、今はひどく遠く思えた。|{a}は自分から{p}を罠に押しつけ、うわごとのように「もっと」と繰り返した。脚の間はとろとろに溶け、溢れた蜜が床に糸を引いていた。|{a}の目は、もう罠の動きしか追っていなかった。{p}を撫でられるたびに腰ががくがくと揺れ、奥がきゅうきゅうと物欲しげに締まった。')
},
ero:{
m:L('{s:wet}。{a}「{m2}」――{a}はびくびくと腰を跳ねさせ、下着の中に勢いよく吐き出した。じんわりと広がる温かさに、{a}の顔が真っ赤に染まった。|{a}「{m2}」――張りつめたものが大きく跳ねて、{a}はこらえきれずに果てた。{s:cum}。濡れた布地が肌に張りつく感触に、{a}は唇を噛んだ。|{s:wet}。{a}「{m2}」――射精の最中にも{p}を責められ続けて、{a}は何度も腰を震わせた。止まらない脈動に合わせて、下着の染みが広がっていった。|{a}「{m2}」――{a}は罠に押さえつけられたまま、腰を何度も突き上げて果てた。{s:cum}。吐き出し終えても、張りつめたものはまだびくびくと脈を打っていた。|{a}「{m2}」――罠に根元を締めつけられたまま先端を撫で回されて、{a}はこらえきれずにびゅくびゅくと吐き出した。{s:cum}。罠はそれを、一滴残らず絡め取っていった。'),
f:L('{s:wet}。{a}「{m2}」――{a}はつま先をぴんと伸ばし、全身を震わせてイった。溢れた蜜が、ぽたぽたと床に落ちた。|{a}「{m2}」――{a}の中がきゅうきゅうと痙攣して、甘い波が何度も背筋を駆け上がった。ぷしゃっ、と恥ずかしい音がして、内腿がびしょびしょに濡れた。|{s:wet}。{a}「{m2}」――イっている最中にも{p}を責められて、{a}は腰を浮かせたまま長く震えた。ひくひくと疼く奥から、蜜がとめどなく溢れた。|{a}「{m2}」――{a}は罠に吊られたまま腰をがくがくと揺らし、深く長く達した。{s:wet}。震えが収まっても、濡れた{p}はまだ物欲しげにひくついていた。|{a}「{m2}」――{p}をくりくりと捏ね回されて、{a}は腰をがくがくと揺らしてイった。{s:wet}。ひくひくと疼く奥から、蜜がとろりと溢れ出した。')
},
again:L('絶頂が収まる前に、罠はまた動き出した。敏感になりきった{p}を、同じ速さで、同じ場所ばかり責め続ける。{a}は息を整える暇もなく、二度目の波に押し上げられた。|果てたばかりの体を、罠は少しも休ませなかった。{a}がもう無理だと首を振っても、責めは一段と執拗になっていく。{a}が解放されたのは、さらに二度果てたあとだった。|罠は、{a}の震えが止まるのを待ってはくれなかった。達したばかりで痺れている{p}に、また新しい責めが重ねられる。{a}は声も出せないまま、続けざまに高みへ連れ戻された。|ようやく終わったと思った瞬間、罠がもう一度{p}を捉えた。逃げようとした腰は、柔らかく、けれど強く引き戻される。三度目の波が来たとき、{a}の口からはもう拒む言葉が出てこなかった。|{a}が肩で息をしているあいだに、罠は責める場所を{p}からほんの少しだけずらした。ずらされた先も、同じくらい敏感になっていた。{a}は膝から崩れ落ちながら、また果てた。|果てた余韻の中で、{a}はようやく罠が止まったと思った。けれどそれは、次の責めの前のほんの一呼吸にすぎなかった。今度の波は、さっきよりも長く、深く{a}を沈めた。|罠は{a}が果てるたびに、責める速さを一段ずつ上げていった。{a}は数えるのをやめ、ただ押し寄せる波に身を任せた。気がつくと、床に膝をついたまま何度目かの絶頂に震えていた。|{a}が逃げようと身をよじった拍子に、{p}がいちばん弱いところで罠に擦れた。その一度で、収まりかけていた熱がまた弾けた。{a}は声を詰まらせて、続けざまに二度果てた。|罠はしばらく動きを止め、{a}が油断した瞬間を狙って、また{p}をそっと撫で上げた。そのやさしさが、かえって{a}を追い詰めた。{a}は甘い声を上げて、もう一度、深く果てた。'),
againEro:L('絶頂が収まる前に、罠はまた動き出した。{s:wet}。敏感になりきった{p}を同じ速さで責められて、{a}は泣きそうな顔で首を振った。{a}「{m2}」――二度目の絶頂は、一度目よりずっと深かった。|休む間もなく、罠は果てたばかりの{p}をまた責め始めた。{s:wet}。{a}がいやいやと身をよじっても、責めは一段と速くなっていく。{a}「{m2}」――解放されたのは、続けて二度果てたあとだった。|罠は、{a}の震えが止まるのを待ってはくれなかった。{s:hit}。痺れたままの{p}を容赦なく擦り上げられて、{a}の腰がまた跳ねた。{a}「{m2}」――立て続けの絶頂に、{a}の目の焦点がふっとぼやけた。|ようやく終わったと思った瞬間、罠がもう一度{p}を捉えた。{s:wet}。逃げようとした腰は、ぬるりと引き戻されて押さえつけられた。{a}「{m2}」――三度目の絶頂は、声にならない声と一緒に来た。|{s:wet}。罠は{a}の震えが止む前に、{p}をくちゅくちゅと捏ね回しはじめた。{a}「{m2}」――逃げ場のないまま、{a}はびくびくと腰を跳ねさせて二度目の絶頂に呑まれた。|{a}「{m1}」――ようやく罠が離れたと思った瞬間、今度は別の仕掛けが{p}に吸いついた。{s:wet}。{a}「{m2}」――{a}は涙目で首を振りながら、続けざまに果て続けた。|{s:wet}。罠は{a}がイくたびに少しずつ責めを強くし、果てたばかりの{p}を休ませなかった。{a}「{m2}」――三度目の波で、{a}の膝はとうとう床に崩れた。'),
topEro:L('{a}「{m1}」――{a}は魔物を押さえつけたまま、自分の好きな速さで責め立てた。{s:wet}。魔物がびくびくと震えて果てても、{a}は手を緩めなかった。|{a}「{m1}」――{a}は罠の仕掛けを逆に掴んで、魔物の弱いところへ押し当てた。{s:wet}。魔物が音を上げるまで、{a}は少しも容赦しなかった。|{a}「{m1}」――{a}は絡みつく触手を逆に掴み、魔物の根元を締め上げた。{s:wet}。悲鳴のような音を上げて魔物が果てると、{a}は満足げに息を吐いた。|{a}「{m1}」――{a}は魔物を壁際に追い詰め、逃げ道を塞いでから責め立てた。{s:hit}。魔物が膝から崩れても、{a}は息を整える間も与えなかった。|{a}「{m2}」――{a}は組み伏せた魔物の上で、熱に浮かされたように動き続けた。{s:wet}。魔物が果てて大人しくなると、{a}は満足げに口の端を吊り上げた。')
};
function rngOf(S){
if(!S.lwT)S.lwT={rng:HK.rng(((S.env&&S.env.floors)||0)*7919+S.log.length*31+104729),_eroSeen:{}};
return S.lwT;
}
function pick(S,a){
var t=rngOf(S),U=t.used=t.used||{},free=a.filter(function(x){return!U[x];}),x;
if(free.length)x=free[t.rng.int(free.length)];
else x=a.reduce(function(m,y){return U[y]<U[m]?y:m;},a[0]);
t.n=(t.n||0)+1;U[x]=t.n;
return x;
}
function fill(S,t,h,m){
var E=HK.Ero,R=rngOf(S);
t=t.replace(/\{a\}/g,h.name).replace(/\{p\}/g,(m&&m.p)||'体');
if(HK.Pos&&HK.Pos.noGen&&HK.Pos.noGen(h))t=t.replace(/\{s:(?:hit|cum)\}/g,'{s:wet}');
return E?E.fill(R,t,h):t.replace(/\{s:\w+\}。?|「\{m\d\}」――/g,'');
}
function uniq(S,f){
var U=S._lwMo=S._lwMo||{},L=S.log||[];
function used(m){var k=String(m).replace(/^\u2060/,'');return U[m]||(k.length>=8&&L.some(function(e){return e&&typeof e.text==='string'&&e.text.indexOf(k)>=0;}));}
var m=f();for(var i=0;i<4&&used(m);i++)m=f();U[m]=1;return m;
}
function moan(S,h,st){return HK.Ero?uniq(S,function(){return HK.Ero.moan(rngOf(S),h,st);}):'';}
function sg(h){return DG.stage?DG.stage(h):(h.corrupt<20?0:h.corrupt<40?1:h.corrupt<60?2:h.corrupt<80?3:4);}
function band(h){var s=sg(h);return s<=1?'early':s===2?'mid':'late';}
function mst(h){var s=sg(h);return s<=1?0:s===2?1:2;}
var TRAPS={'罠':1,'技':1,'番人':1,'幻惑':1};
DG.fallEroText=function(S,h,thick,hi){
var F=DG.THICK&&DG.THICK.fallEro,P=HK.Pos,E=HK.Ero;
if(!F|| !E|| !h||(P&&P.noGen&&P.noGen(h)))return'';
var R=rngOf(S),tk=S.themeKey,rr=R.rng;
var ff= !!(P&&P.isF(h)&&h.likes==='f'),body=P?(P.hasF(h)?'f':'m'):(h.gender==='f'?'f':'m');
var act=ff?(F.ff[tk]||F.ff.any):(F.act[tk]||F.act.any)[body];
if(!ff&&(!F.act[tk]||rr()<0.3))act=act.concat(F.act.any[body]);
if(ff&&F.ff[tk]&&rr()<0.3)act=act.concat(F.ff.any);
var per=(HK.personaOf&&HK.personaOf(h))||h.persona||'gentle',strong= !!(HK.R18M&&HK.R18M.isStrong&&HK.R18M.isStrong(h));
var VK=['start','mid','climax'];
function mo(k,late){return uniq(S,function(){return HK.Moan&&HK.Moan.say?HK.Moan.say(R,h,k,{force:true,hush:strong,late: !!late,fall:late?null:false}):E.moan(R,h,VK.indexOf(k),{force:true});});}
function fl(t,late){
if(ff)t=String(t).replace(/\{s:(?:hit|cum)\}/g,'{s:wet}');
return String(t).replace(/\{a\}/g,h.name).replace(/\{s:(\w+)\}/g,function(m,k){return E.sfx(R,k);})
.replace(/\{v([012])\}/g,function(m,n){return mo(VK[+n],late|| +n===2);});
}
var peak=F.peak[per]||F.peak.gentle,fin=F.fin[ff?'ff':body];
var tail=fl(pick(S,peak),true)+' '+h.name+'「'+mo('climax',true)+'」';
if(!thick)return fl(pick(S,act))+' '+tail;
var out=[fl(pick(S,act)),fl(pick(S,F.mid)),tail+' '+fl(pick(S,fin),true)];
if(hi&&F.again)out.push(fl(pick(S,F.again),true));
var cd=DG.THICK.coda&&DG.THICK.coda[h.persona];
if(cd&&cd.length)out.push(fl(pick(S,cd)));
return out.join('\n\n');
};
function fallEro(S,o,h,hi){
var thick= /\n\n/.test(o.text),t=DG.fallEroText(S,h,thick,hi);
if(!t)return;
if(S.party&&S.party.length>1&&DG.LINES&&DG.LINES.fallParty)t+=(thick?'\n\n':' ')+pick(S,DG.LINES.fallParty).replace(/\{a\}/g,h.name);
o.text=t;
o.eroFall=true;
}
DG.lewdHook=function(S,o){
var X=HK.Lewd,h=S.lwWho||S.h;
if(HK.SAFE_ON|| !X|| !X.conf('dungeon')|| !h|| !o||typeof o.text!=='string'|| !o.text)return;
var sig=h.name+':'+Math.round(h.pleasure)+':'+h.climax,moved=S._lwSig!==sig;S._lwSig=sig;
if(X.lv(S.env)==='low'||S.env.trap<15)return;
var ero=X.ero(S.env)&& !!HK.Ero,hi=X.high(S.env),top= !!(DG.isTop&&DG.isTop(h));
var ev=(S.lwWho&&S.lwEv)||S.lastEv,m={p:(ev&&ev.partNow&&DG.PARTS[ev.partNow])||'体'},body=HK.Pos&&HK.Pos.isF(h)?'f':'m';
if(o.kind==='sys'&&o.tag==='陥落'){if(ero&& !top&& !S.lwWho)fallEro(S,o,h,hi);return;}
if(o.kind==='climax'&&o.tag==='絶頂'){
if(top){
if(o.tease&&DG.teaseLewd){var Rt=rngOf(S);DG.teaseLewd(S,o,h,{ero:ero,hi:hi,thick:S.env.lewdLen==='thick'||(S.env.lewdLen==='mix'&&Rt.rng()<0.5)});return;}
if(ero){var d0=h.eroDom;h.eroDom=true;o.text+=' '+fill(S,pick(S,T.topEro),h,m);h.eroDom=d0;}
return;
}
var R=rngOf(S),thick=S.env.lewdLen==='thick'||(S.env.lewdLen==='mix'&&R.rng()<0.5),out=[];
if(thick)out.push(fill(S,pick(S,T[band(h)][body]),h,m));
out.push(o.text);
if(ero)out.push(fill(S,pick(S,T.ero[body]),h,m));
if(hi&&(h._lwAgain==null||h.climax-h._lwAgain>=3)&&R.rng()<(ero?0.6:0.5)){h._lwAgain=h.climax;out.push(fill(S,pick(S,ero?T.againEro:T.again),h,m));}
o.text=out.join(thick?'\n\n':' ');
return;
}
if(top&&o.tease&&ero&&o.kind==='ev'&&moved&&DG.teaseMoan&&rngOf(S).rng.int(2)){o.text+=' '+h.name+'「'+DG.teaseMoan(S,h,mst(h))+'」';return;}
if(!ero||top)return;
if(o.kind==='climax'&&o.tag==='寸止め'){o.text+=' '+h.name+'「'+moan(S,h,1)+'」';return;}
if(TRAPS[o.tag]&&o.kind==='ev'&&moved&&rngOf(S).rng.int(2))o.text+=' '+h.name+'「'+moan(S,h,mst(h))+'」';
};
var KB=HK.KabaiR18={
motive:{
lover:L('{w}は考えるより先に、{v}の前に飛び出していた。大切な人が奪われるのを、黙って見ていられるはずがなかった。{w}「{v}に触らないで！｜{v}に触るな！｜{v}に触らないでください！」|'+
'{w}は{v}の手を強く引き、自分の背中に隠した。震えているのが自分なのか{v}なのか、もう分からなかった。{w}「大丈夫、私がいるから｜大丈夫だ、私がいる｜大丈夫です、私がいますから」|'+
'{w}の目の色が変わった。{v}に伸びたものを、{w}は体ごとぶつかって払いのけた。{w}「この人だけは、絶対に渡さない｜この人だけは、絶対に渡さない｜この人だけは、絶対に渡しません」'),
crush:L('{w}は、ずっと言えずにいた想いの代わりのように、{v}の前に立ちはだかった。足はみっともないほど震えていた。{w}「{v}には、指一本触れさせない｜{v}には、指一本触れさせない｜{v}には、指一本触れさせません」|'+
'{v}の怯えた顔を見た瞬間、{w}の中で何かが切れた。好きな人を守るのに、理由なんていらなかった。{w}「離れて！ その人から離れて！｜離れろ！ その人から離れろ！｜離れてください！ その人から離れてください！」|'+
'{w}は{v}の名前を叫びながら駆け寄った。いつもは目を合わせることさえできなかったのに、今は少しも迷わなかった。{w}「やめて、お願い……！｜やめろ、頼む……！｜やめてください、お願いです……！」'),
friend:L('{w}は仲間を見捨てるような人間ではなかった。{v}の前に割って入り、両腕を広げた。{w}「仲間に手を出さないで！｜仲間に手を出すな！｜仲間に手を出さないでください！」|'+
'{w}は小さく舌打ちをして、{v}のほうへ踏み出した。損な役回りだと分かっていても、足は止まらなかった。{w}「{v}、下がって！｜{v}、下がれ！｜{v}、下がってください！」|'+
'{w}は{v}と過ごした日々を思い出していた。ここで背を向けたら、二度と隣を歩けない気がした。{w}「放っておけるわけないでしょ！｜放っておけるわけがない！｜放っておけるわけがありません！」'),
enemy:L('{w}自身にも、なぜ体が動いたのか分からなかった。気に食わない相手のはずの{v}の前に、{w}は立っていた。{w}「勘違いしないで。あなたを助けたいわけじゃない｜勘違いするな。あなたを助けたいわけじゃない｜勘違いしないでください。あなたを助けたいわけではありません」|'+
'{w}はいつも{v}を睨みつけていた。けれど、こんな形で{v}が屈するのを見るのは、なぜか我慢がならなかった。{w}「あなたを泣かせていいのは、私だけ｜あなたを泣かせていいのは、私だけだ｜あなたを泣かせていいのは、私だけです」|'+
'{w}は舌打ちして、{v}の腕を乱暴に引いた。借りを作るのも作られるのも、大嫌いだった。{w}「これで貸し一つだから｜これで貸し一つだ｜これで貸し一つですからね」'),
none:L('{w}と{v}は、言葉を交わしたこともほとんどなかった。それでも、目の前で起きていることを見過ごすことはできなかった。{w}「やめて！｜やめろ！｜やめてください！」|'+
'{w}は関わらないつもりでいた。けれど{v}の悲鳴を聞いた瞬間、体のほうが先に動いていた。{w}「……ああもう、見てられない｜……ああ、見ていられない｜……ああもう、見ていられません」|'+
'{w}は{v}のことをろくに知りもしなかった。それでも、誰かがこんな目に遭うのを黙って見ているのは嫌だった。{w}「その人を放して！｜その人を放せ！｜その人を放してください！」')
},
after:{
lover:L('あとになって、{v}は{w}の胸に顔を埋めて泣いた。{w}は何も言わずに、その背中をさすりつづけた。{v}「……ごめん。私のせいで｜……すまない。私のせいで｜……ごめんなさい。私のせいで」|'+
'{w}は{v}の手を握ったまま、しばらく離そうとしなかった。守りきれなかった悔しさが、握る指に滲んでいた。{w}「守るって言ったのに……ごめん｜守ると言ったのに……すまない｜守ると言ったのに……ごめんなさい」|'+
'二人は肩を寄せ合ったまま、互いの体温を確かめていた。何があっても、この手だけは離さないと決めていた。{v}「来てくれて、嬉しかった｜来てくれて、嬉しかった｜来てくださって、嬉しかったです」'),
crush:L('{v}は{w}に礼を言おうとして、言葉に詰まった。{w}は赤くなった顔を背けたまま、ぶっきらぼうに上着を差し出した。{w}「……見てない。何も見てないから｜……見ていない。何も見ていない｜……見ていません。何も見ていませんから」|'+
'{w}は{v}の隣に座ったまま、何度も口を開きかけてはやめた。言いたかったことは、今言うべきことではない気がした。{v}「……どうして、あそこまでしてくれたの？｜……どうして、あそこまでしてくれた？｜……どうして、あそこまでしてくださったんですか？」|'+
'あの時の{w}の背中を、{v}はなかなか忘れられなかった。{w}のほうは、目が合うたびに耳まで赤くなって視線を逸らした。{w}「……忘れて。お願いだから｜……忘れてくれ。頼む｜……忘れてください。お願いですから」'),
friend:L('しばらくして、{w}と{v}はどちらからともなく力なく笑った。笑うしかなかった。{w}「……二人そろって、ひどい目に遭ったね｜……二人そろって、ひどい目に遭ったな｜……二人そろって、ひどい目に遭いましたね」|'+
'{v}は{w}の肩を拳で軽く小突いた。礼の代わりだと、{w}にも分かっていた。{v}「無茶しすぎ。……でも、ありがとう｜無茶をしすぎだ。……だが、ありがとう｜無茶をしすぎです。……でも、ありがとうございます」|'+
'二人のあいだに、気まずい沈黙が落ちた。それでも{w}は、{v}の隣を離れなかった。{w}「誰にも言わない。約束する｜誰にも言わない。約束する｜誰にも言いません。約束します」'),
enemy:L('{v}は{w}を睨みつけた。助けられたことが、何より屈辱だった。{v}「頼んでない。余計なことしないで｜頼んでいない。余計なことをするな｜頼んでいません。余計なことをしないでください」|'+
'{w}はそっぽを向いたまま、乱れた髪をかき上げた。{v}のほうも、{w}の顔を見ようとはしなかった。{w}「これで、あなたに一つ貸しだから｜これで、あなたに一つ貸しだ｜これで、あなたに一つ貸しですからね」|'+
'二人は互いに目を逸らしたまま、黙り込んでいた。憎まれ口を叩く気力も、今は残っていなかった。{v}「……今日のことは、なかったことにして｜……今日のことは、なかったことにしろ｜……今日のことは、なかったことにしてください」'),
none:L('{v}は{w}に小さく頭を下げた。知らない者どうしのあいだに、妙な縁ができてしまった。{v}「……ありがとう。名前、ちゃんと覚えた｜……ありがとう。名前は、ちゃんと覚えた｜……ありがとうございます。お名前、ちゃんと覚えました」|'+
'{w}は何事もなかったような顔で、{v}から少し離れて座った。けれど、その指先はまだ小さく震えていた。{w}「……巻き込まれ損だよ、まったく｜……巻き込まれ損だ、まったく｜……巻き込まれ損ですよ、まったく」|'+
'それまで他人だった二人は、ぎこちなく視線を交わした。同じ目に遭った者どうしの、奇妙な連帯感があった。{v}「……あなたがいてくれて、よかった｜……あなたがいて、よかった｜……あなたがいてくださって、よかったです」')
},
shame:L('……情けない。助けに来たはずなのに、自分の体は{v}の声に反応していた。{w}は脚を固く閉じて、込み上げる熱をやり過ごそうとした。|'+
'{w}の頬は、{v}と同じくらい赤く染まっていた。見てはいけないと思うほど、目が吸い寄せられる。{w}「……ごめん、{v}……｜……すまない、{v}……｜……ごめんなさい、{v}……」|'+
'{w}は自分を殴りたい気持ちで、きつく目を閉じた。それでも、耳に届く声だけは止められない。体の芯がじんと痺れていくのを、{w}はただ恥じるしかなかった。'),
fixed:L('{w}の頭に、決めた相手の顔が浮かんだ。こんなことで熱くなっている自分が、ひどく後ろめたかった。|'+
'{w}は心の中で、決めた人の名前を呼んだ。それでも引かない熱が、何より恥ずかしかった。|'+
'{w}は決めた相手のことを思い、きつく拳を握った。体だけが勝手に反応するのが、悔しくてたまらなかった。')
};
var LOVER_T={lover:1,fated:1,mate:1,spouse:1,honmei:1,fwb:1},CRUSH_T={crush:1,almost:1,yan:1,worship:1};
var FRIEND_T={friend:1,buddy:1,childhood:1,best:1,colleague:1,senpai:1,classmate:1,sibling:1,sibprot:1,sibclose:1,parent:1,pparent:1,stepsib:1,relative:1,teacher:1,mentor:1,benefactor:1};
var ENEMY_T={rival:1,enemy:1,bad:1,sibbad:1};
KB.fixed1=function(c){return!!c&&((Array.isArray(c.sexLocks)&&c.sexLocks.length>0)||typeof c.sexLock==='number');};
function lockTo(a,b){return!!(a&&b&&((Array.isArray(a.sexLocks)&&a.sexLocks.indexOf(b.i)>=0)||a.sexLock===b.i||(Array.isArray(a.locks)&&a.locks.indexOf(b.i)>=0)));}
KB.rel=function(w,v,tie,o){
if(lockTo(w,v)||lockTo(v,w)||LOVER_T[tie])return'lover';
if(CRUSH_T[tie])return'crush';
if(ENEMY_T[tie])return'enemy';
if(FRIEND_T[tie])return'friend';
if(tie)return'none';
o=o||{};
return(o.ten||0)>45?'enemy':(o.att||0)>45?'crush':(o.trust||0)>35?'friend':'none';
};
KB.canTake=function(c){return!!c&&(!HK.State||HK.State.mobSexOk(c))&&(!HK.Pos||HK.Pos.canReceive(c))&& !KB.fixed1(c)&& !(HK.Pos&&HK.Pos.hardTop(c));};
KB.canWatch=function(c){return!!c&&(!HK.State||HK.State.r18ok(c));};
var KD={
both:L('{w}は{v}に絡みつくものを掴み、力ずくで引き剥がそうとした。次の瞬間、罠は獲物が増えたことを喜ぶように、{w}の手足にも絡みついた。二人は並んで持ち上げられ、互いの顔が見える距離で責められはじめた。|'+
'{w}の刃は、{v}に届く前に絡め取られた。うごめく仕掛けが{w}を{v}のすぐ隣に引き倒し、二人まとめて床に押さえつけた。逃れようともがくたびに、すぐそばで同じように震える体温が伝わってきた。|'+
'{w}が{v}の手を掴んだのと、罠が二人まとめて呑み込んだのは同時だった。{v}「……来ちゃだめって、言ったのに｜……来るなと、言ったのに｜……来てはいけないと、言いましたよね」――握った手を離せないまま、二人は同じ熱に沈められていった。'),
sub:L('{w}は罠の前に進み出て、自分の胸を叩いた。{w}「{v}を放して。代わりに私が残る｜{v}を放せ。代わりに私が残る｜{v}を放してください。代わりに私が残ります」――罠は値踏みするようにうごめき、{v}を床に落とした。そして今度は、{w}の体にゆっくりと絡みついていった。|'+
'{w}は武器を捨てて、両手を広げた。{w}「狙うなら私にして！｜狙うなら私にしろ！｜狙うなら私にしてください！」――罠は{v}から離れ、新しい獲物を包み込んだ。床に崩れた{v}の目の前で、{w}の体が持ち上げられていった。|'+
'{w}は{v}に絡むものに自分から腕を差し入れ、自分の体へと引き寄せた。{w}「ほら、こっちに来なよ｜ほら、こっちに来い｜ほら、こちらに来てください」――罠は迷うようにうごめき、やがて{v}を放して{w}のほうへ這い寄った。解放された{v}は、自分の代わりに捕らわれていく{w}から目を離せなかった。'),
hit:L('{w}は{v}の前に飛び込んだが、跳ね返った罠に払われて壁に叩きつけられた。息が詰まり、視界が白く瞬いた。それでも{w}は、床を這って{v}のほうへ手を伸ばした。|'+
'{w}は{v}を庇って罠に体当たりした。弾き返された体が床を転がり、肩に鈍い痛みが走った。{w}「……まだ、まだ……！｜……まだだ……！｜……まだです……！」|'+
'{w}が割って入った瞬間、跳ね返った仕掛けの一部が{w}の脇腹を打ち据えた。{w}は膝をつき、咳き込みながらも{v}から目を逸らさなかった。{v}は涙の滲んだ目で、{w}の名前を呼んだ。'),
watch:L('{w}の足首に罠の一部が絡みつき、{w}はその場に縫いとめられた。目の前で、{v}が責め立てられていく。顔を背けようとしても、なぜか首が動かなかった。|'+
'罠は{w}を壁際に押さえつけたまま、それ以上は何もしなかった。ただ、{v}が乱れていく様子を、{w}の正面で見せつけた。甘く崩れていく声を聞くたびに、{w}の喉がひくりと鳴った。|'+
'{w}は助けに来たはずだった。それなのに、壁際に押さえつけられたまま、乱されていく仲間の姿から目が離せない。下腹に熱が溜まっていくのに気づいて、{w}は唇を噛んだ。'),
takeEro:{
f:L('罠は{w}の脚を割り開き、{v}を責めているのと同じものを{w}の{女性器}にもずぶりと沈めた。{s:wet}。{w}「{wm0}」――隣で{v}が身をよじるたびに、{w}の{ナカ}までつられるように締まった。|'+
'うごめく仕掛けは{w}の{胸}を締めつけ、{乳首}を吸い上げながら、{女性器}の入口を何度も擦り上げた。{s:wet}。{w}「{wm0}」――助けに来たはずの体が、仲間と同じように蕩けはじめていた。|'+
'二人は向かい合わせに押さえつけられ、同じ拍子で突き上げられた。{s:hit}。{v}「{vm1}」{w}「{wm1}」――重なる二つの声が、互いの羞恥をいっそう煽り立てた。'),
m:L('罠は{w}の{尻}を割り、{後ろ}にぬるりと潜り込んだ。{s:wet}。{w}「{wm0}」――同時に{男性器}を扱き上げられて、{w}の腰は仲間の隣で情けなく跳ねた。|'+
'うごめく仕掛けは{w}の{男性器}を根元から搾り上げ、{亀頭}をしつこく撫で回した。{s:suck}。{w}「{wm0}」――仲間の目の前で張りつめていく自分の体に、{w}は耳まで赤くなった。|'+
'二人は向かい合わせに押さえつけられ、同じ拍子で突き上げられた。{s:hit}。{v}「{vm1}」{w}「{wm1}」――重なる二つの声が、互いの羞恥をいっそう煽り立てた。')
},
watchEro:L('{s:wet}。粘ついた音が、押さえつけられた{w}の耳にやけに大きく響いた。{w}の{股間}は痛いほど熱を持ち、身じろぎするたびに布地に擦れた。{w}は歯を食いしばり、腰が揺れそうになるのを必死にこらえた。|'+
'{v}「{vm1}」――甘く崩れていく声が届くたびに、{w}の下腹がきゅうっと疼いた。{s:wet}。触れてもいないのに、{w}の{股間}は熱く張りつめていった。|'+
'{w}は、乱されていく仲間の濡れた肌から目を離せなかった。{s:hit}。突き上げる音が響くたびに、{w}の体も同じ拍子でびくりと跳ねる。{w}「……っ、見ちゃ、だめなのに……｜……っ、見ては、だめなのに……｜……っ、見ては、いけないのに……」')
};
KB.watchEro=KD.watchEro;
DG.kabai=function(S,w,v,r,ev,say){
if(!w|| !v||w===v||(S._shieldN||0)>=2||HK.SAFE_ON)return false;
if(r&&r.tie==='apathy')return false;
var R=rngOf(S),rr=R.rng,X=HK.Lewd,top=DG.isTop?DG.isTop(w): !!(HK.Pos&&HK.Pos.hardTop(w));
var ero= !!(X&&X.conf('dungeon')&&X.ero(S.env)&&X.lv(S.env)!=='low'&&HK.Ero);
var take= !top&&KB.canTake(w)&& !(HK.Pos&&HK.Pos.noGen&&HK.Pos.noGen(w)),watch=KB.canWatch(w);
var opts=['hit'];if(take)opts.push('both','both','sub');if(watch)opts.push('watch','watch');
var mode=opts[rr.int(opts.length)];
S._shieldN=(S._shieldN||0)+1;
var rel=KB.rel(w,v,r&&r.tie,r),tn=(ev&&ev.name)||'罠',E=HK.Ero;
var strongW= !!(HK.R18M&&HK.R18M.isStrong&&HK.R18M.isStrong(w)),strongV= !!(HK.R18M&&HK.R18M.isStrong&&HK.R18M.isStrong(v));
function mo(c,k,st){return uniq(S,function(){return HK.Moan&&HK.Moan.say?HK.Moan.say(R,c,k,{force:true,hush:st,fall:false}):E?E.moan(R,c,1,{force:true}):'';});}
function fl(t){
t=String(t).replace(/\{w\}/g,w.name).replace(/\{v\}/g,v.name).replace(/\{t\}/g,tn);
if(!E)return t.replace(/\{s:\w+\}。?/g,'');
return t.replace(/\{s:(\w+)\}/g,function(m,k){return E.sfx(R,k);})
.replace(/\{wm([01])\}/g,function(m,n){return mo(w,n==='0'?'start':'mid',strongW);})
.replace(/\{vm1\}/g,function(){return mo(v,'mid',strongV);});
}
if(HK.NoGen&&HK.NoGen.on(w,v))ero=false;
var out=[fl(pick(S,KB.motive[rel])),fl(pick(S,KD[mode]))];
if((mode==='both'||mode==='sub')&&ero)out.push(fl(pick(S,KD.takeEro[HK.Pos&&HK.Pos.hasF(w)?'f':'m'])));
if(mode==='watch'){out.push(fl(pick(S,ero?KD.watchEro:KB.shame)));if(KB.fixed1(w))out.push(fl(pick(S,KB.fixed)));}
out.push(fl(pick(S,KB.after[rel])));
var why=w.name+'が'+v.name+'を庇った（'+{lover:'大切な相手',crush:'片想い',friend:'仲間・友人',enemy:'気に食わない相手',none:'ほとんど関わりのない相手'}[rel]+'）→'+{both:'一緒に掛かった',sub:'身代わりを申し出た',watch:'押さえつけられて見せつけられ、興奮してしまった（体の関係にはならない）',hit:'庇って弾き飛ばされた'}[mode];
say(S,w,{kind:'ev',tag:'庇う',text:out.join(' '),why:why});
var prev=S.h;
if(mode==='both'||mode==='sub'){
if(mode==='sub'){v.pleasure-=12;v.reason+=3;}
if(ev&&ev.power&&DG.stim){S.h=w;DG.stim(S,ev,mode==='sub'?1:0.7);S.h=prev;}
}else if(mode==='watch'){
w.pleasure+=12+(w.sens||0)*4;w.reason-=3;w.corrupt+=1.5;w.dgWatch=(w.dgWatch||0)+1.5;
}else w.hp-=8;
if(r){r.trust+=mode==='hit'||mode==='sub'?12:6;if(rel==='lover'||rel==='crush')r.att+=4;}
return true;
};
var MT={
act:{
mf:L('{a}は{b}を床に押し倒し、もがく両手首を片手でまとめて押さえつけた。熱に浮かされた目のまま、{b}の脚のあいだに膝を割り込ませる。{b}「{v0}」――張りつめた{男性器}が{女性器}の入口を探り当て、ためらいなく奥までねじ込まれた。{s:hit}。|'+
'{a}は{b}を壁に押しつけ、後ろから腰を抱え込んだ。迷宮の媚薬に濡らされていた{女性器}は、{a}の{男性器}をあっけなく呑み込んでしまう。{s:hit}。{b}「{v1}」――仲間の荒い息が耳元にかかるたびに、{b}は首を振った。|'+
'{a}は{b}を組み敷き、{胸}を乱暴に揉みしだきながら、{ナカ}の一番奥をがつがつと突き上げた。{s:hit}。{b}「{v1}」――押し返そうとした腕は、突かれるたびに力を失っていった。'),
mm:L('{a}は{b}を床にうつ伏せに押さえつけ、{尻}を割り開いた。媚薬の粘液で濡れた{後ろ}に、張りつめた{男性器}の先があてがわれる。{b}「{v0}」――逃げようとした腰を掴まれ、{a}の熱が一気に奥まで押し入ってきた。{s:hit}。|'+
'{a}は{b}を壁際に追い詰め、後ろから腰を打ちつけた。{s:hit}。{b}「{v1}」――奥の膨らみを擦り上げられるたびに、{b}の{男性器}までが情けなく跳ねた。|'+
'{a}は{b}を組み敷き、{男性器}を握り込んで扱きながら、{後ろ}を容赦なく突き上げた。{s:hit}。{b}「{v1}」――前と後ろを同時に責められて、拒む言葉は途中で裏返った。'),
ff:L('{a}は{b}を押し倒し、太腿を割って体を重ねた。媚薬に濡れた指が{女性器}を割り開き、{ナカ}の弱いところを容赦なく掻き回す。{s:wet}。{b}「{v0}」――押しのけようとした手は、指を絡め取られて床に縫いとめられた。|'+
'{a}は{b}の脚を抱え込んで閉じられないようにし、{女性器}に舌を這わせた。{s:suck}。{b}「{v1}」――{陰核}を吸われるたびに、{b}の腰は逃げるどころか{a}の唇に押しつけられていった。|'+
'{a}は{b}を押さえつけ、自分の{女性器}を{b}の{女性器}に重ねてぬるぬると腰を擦りつけた。{s:wet}。{b}「{v1}」――{a}の熱い吐息が{胸}にかかるたびに、{b}の{乳首}は硬く尖っていった。'),
fm:L('{a}は{b}を床に押し倒し、その腰に跨った。媚薬で張りつめさせられた{男性器}を握り、自分の{女性器}にあてがって一気に腰を落とす。{s:wet}。{b}「{v0}」――押しのけようとした手首は、{a}の両手に床へ縫いとめられた。|'+
'{a}は{b}を押さえ込んだまま腰を激しく上下させ、{男性器}を{ナカ}で搾り上げた。{s:hit}。{b}「{v1}」――やめてくれと頼む声さえ、熱に呑まれた{a}の耳には届いていなかった。|'+
'{a}は{b}の胸板に手をついて体重をかけ、逃げられないようにした。{s:wet}。{b}「{v1}」――根元まで呑み込まれたまま腰をくねらされ、{b}の{男性器}は意思に反して{a}の{ナカ}で脈打った。')
},
peak:{
proud:L('{b}は最後まで{a}を睨みつけていた。けれど突き上げられるたびに、その目から力が抜けていく。{s:hit}。{b}「{v1}」――{b}は仲間に組み敷かれたまま、悔しさに震えながらイかされた。|'+
'{b}は{a}の肩に爪を立てて、声だけは上げまいとした。爪の跡が赤く残っても、腰の痙攣は止まらない。{s:hit}。屈辱に顔を歪めたまま、{b}の体は大きく跳ね上がった。'),
stern:L('{b}は唇を固く結び、この状況を冷静にやり過ごそうとした。{s:wet}。けれど体の奥の熱は、仲間の動きに合わせて勝手に膨らんでいく。{b}は短く息を詰め、背を反らして達した。|'+
'{b}は{a}を正気に戻そうと、何度も名前を呼んだ。呼ぶ声は、突かれるたびに乱れて意味を失っていく。{s:hit}。最後の一突きで、{b}の張りつめていたものがぷつりと切れた。'),
tsun:L('{b}は涙目で{a}を罵った。罵る声に甘いものが混じりはじめても、口だけは止めなかった。{s:hit}。{b}「{v1}」――イかされた瞬間、{b}は真っ赤になって顔を背けた。|'+
'{b}は、感じてなんかいないと言い張った。言い張る唇は、もう震えていた。{s:wet}。{b}の背中がびくびくと跳ね、言葉とは裏腹に{a}にしがみついていた。'),
gentle:L('{b}は抵抗をやめ、{a}の背中をそっと撫でた。迷宮に呑まれた仲間を、責める気にはなれなかった。{s:wet}。それでも押し寄せる波には逆らえず、{b}は涙を浮かべたまま達した。|'+
'{b}は{a}の名前を、宥めるように何度も呼んだ。その声が、突かれるたびに甘く崩れていく。{s:hit}。{b}の体が細かく震え、とうとう高みに押し上げられた。'),
devoted:L('{b}は、これは{a}の本心じゃない、迷宮のせいだと自分に言い聞かせた。{s:wet}。言い聞かせるほど、体は{a}の熱を覚えていく。{b}は{a}にしがみついたまま、声を殺してイった。|'+
'{b}は仲間を嫌いになりたくなかった。だから、目を閉じて耐えた。{s:hit}。耐えた分だけ深く溜まった熱が一気に弾け、{b}の腰ががくがくと跳ねた。'),
cool:L('{b}は無表情を保ったまま、{a}の動きをやり過ごそうとした。{s:wet}。保っていたはずの顔が、一突きごとに崩れていく。{b}は小さく息を呑み、びくりと腰を跳ねさせてイかされた。|'+
'{b}は呼吸を数え、熱が引くのを待とうとした。数える間隔が乱れ、やがて数えることも忘れた。{s:hit}。{b}の喉から、本人も聞いたことのない声が漏れた。'),
free:L('{b}は最初、冗談にしてしまおうと笑ってみせた。{s:hit}。笑い声はすぐに途切れ、喉の奥で引きつった声に変わる。{b}は泣き笑いのような顔で、{a}の下で達した。|'+
'{b}は暴れ、蹴り、{a}を押し返そうとした。{s:hit}。いつもの軽口は一つも出てこない。体が勝手に達して痙攣したとき、{b}は信じられないというように目を見開いた。'),
shy:L('{b}は両手で顔を覆い、仲間の顔を見ないようにした。{s:wet}。指の隙間から漏れる声だけは、どうしても隠せない。{b}は小さく体を丸めたまま、びくびくと震えて達した。|'+
'{b}は消え入りそうな声で、やめてと繰り返した。繰り返すたびに、その声は細く甘くなっていった。{s:hit}。{b}は耳まで真っ赤にして、声もなくイかされた。'),
polite:L('{b}は乱れた息の合間に、丁寧な言葉で{a}を諫めようとした。{s:wet}。言葉は途中から形を失い、ただの声になる。{b}は慎ましく閉じていた膝をがくがくと震わせて達した。|'+
'{b}は最後まで、仲間に対する礼を失うまいとした。けれど体は、礼儀などお構いなしに{a}を締めつける。{s:hit}。{b}の品のよい顔が、快楽にとろりと崩れた。')
},
fin:{
m:L('{a}の動きがだんだん荒く、速くなっていく。{s:hit}。{a}は{b}の腰を強く引き寄せ、一番奥に押しつけたまま果てた。{s:cum}。注ぎ込まれる熱に、{b}の{ナカ}がひくひくと締まった。|'+
'{a}は果てる寸前に引き抜き、{b}の腹に熱いものをぶちまけた。{s:cum}。我に返った{a}の顔から、さっと血の気が引いていった。|'+
'{a}は{b}の奥で何度も脈打ち、{精液}を吐き出しきるまで腰を離さなかった。{s:cum}。溢れた白いものが、{b}の太腿を伝って床に落ちた。'),
ff:L('{a}は{b}を責めながら、自分の{女性器}を{b}の太腿に擦りつけていた。{s:wet}。{a}がびくびくと身を震わせて果てると、ようやく指の動きが止まった。|'+
'{a}は{b}が果てたあとも指を抜かず、もう一度、もう一度と責め立てた。{s:wet}。{b}が潮を噴いてぐったりしたところで、{a}はようやく我に返って手を離した。|'+
'{a}は{b}と脚を絡めたまま腰を揺らしつづけ、二人はほとんど同時に達した。{s:wet}。重なった体のあいだで、どちらのものとも分からない{愛液}が糸を引いた。'),
fm:L('{a}は{b}の上で腰を打ちつけ、{男性器}を奥まで咥え込んだまま締め上げた。{s:cum}。{b}がこらえきれずに{a}の{ナカ}で果てると、{a}も背を反らして達した。|'+
'{a}は{b}が果てても腰を止めなかった。{s:wet}。出し尽くして敏感になった{男性器}を搾られつづけ、{b}は声にならない声を上げた。|'+
'{a}は{b}の{精液}を{ナカ}で受け止め、恍惚とした顔で腰を震わせた。{s:cum}。我に返った{a}は、組み敷いた{b}を見下ろして青ざめた。')
}
};
DG.mateEro=function(S,a,b){
var X=HK.Lewd,E=HK.Ero,P=HK.Pos;
if(HK.SAFE_ON|| !X|| !E|| !P|| !X.conf('dungeon')|| !X.ero(S.env)||X.lv(S.env)==='low')return'';
if(HK.NoGen&&HK.NoGen.on(a,b))return'';
var mA= !P.isF(a),mB= !P.isF(b),k=mA?(mB?'mm':'mf'):(mB?'fm':'ff');
var R=rngOf(S),short=X.short(S.env,R.rng),per=(HK.personaOf&&HK.personaOf(b))||b.persona||'gentle';
var strong= !!(HK.R18M&&HK.R18M.isStrong&&HK.R18M.isStrong(b)),VK=['start','mid','climax'];
function mo(kk,late){return uniq(S,function(){return HK.Moan&&HK.Moan.say?HK.Moan.say(R,b,kk,{force:true,hush:strong,late: !!late,fall:late?null:false}):E.moan(R,b,VK.indexOf(kk),{force:true});});}
function fl(t,late){
if(k==='ff')t=String(t).replace(/\{s:(?:hit|cum)\}/g,'{s:wet}');
return String(t).replace(/\{a\}/g,a.name).replace(/\{b\}/g,b.name).replace(/\{s:(\w+)\}/g,function(m,x){return E.sfx(R,x);})
.replace(/\{v([01])\}/g,function(m,n){return mo(VK[+n],late);});
}
var tail=fl(pick(S,MT.peak[per]||MT.peak.gentle),true)+' '+b.name+'「'+mo('climax',true)+'」';
if(short)return' '+fl(pick(S,MT.act[k]))+' '+tail;
var am=HK.Moan&&HK.Moan.say?HK.Moan.say(R,a,k==='mf'||k==='mm'?'top':'topmid',{}):E.moan(R,a,1);
return'\n\n'+fl(pick(S,MT.act[k]))+'\n\n'+tail+' '+a.name+'「'+am+'」――'+fl(pick(S,MT.fin[k==='mm'?'m':k==='mf'?'m':k]),true);
};
})();
});
;
HK.Load.def(424.5,'tone:scen-dungeon',function(){
HK.Load.toneData("mixed",{"F":[
["大丈夫。一緒に帰る","大丈夫です。一緒に帰るよ",1]],
"O":{
"見ちゃだめだ":"見ちゃだめです。目、つぶってて",
"自分の名前、言える？":"自分の名前、言えます？　ゆっくりでいいよ",
"ここで見たことは、全部忘れよう。お互いに":"ここで見たことは、全部忘れましょう。お互いにね",
"しっかりしろ！迷宮に呑まれるな！":"しっかりしてください！　呑まれちゃだめ！",
"もう平気。見てないから":"もう平気です。見てないから",
"最低だ、この迷宮":"最低ですよ、この迷宮。早く出たい",
"待って、そこの床、色が違う":"待ってください、そこの床、色が違うよ",
"…ねえ、〈〉も、熱いでしょ":"…ねえ、〈〉さんも、熱いですよね",
"こっちは楽だよ":"こっちは楽ですよ。おいでよ",
"本当はこうしたいでしょう":"本当はこうしたいんでしょう？　顔に出てるよ",
"ごめん、もう、止まらない":"ごめんなさい、もう、止まらないよ"}});
HK.Load.toneData("noja",{"F":[
["…ねえ、〈〉も、熱いでしょ","…のう、〈〉も、熱いじゃろう",1]],
"O":{
"見ちゃだめだ":"見てはならぬ",
"自分の名前、言える？":"己の名を言えるか？",
"ここで見たことは、全部忘れよう。お互いに":"ここで見たことは、すべて忘れるのじゃ。互いにな",
"しっかりしろ！迷宮に呑まれるな！":"しっかりせい！　迷宮に呑まれるでない！",
"もう平気。見てないから":"もう平気じゃ。見ておらぬゆえ",
"最低だ、この迷宮":"最低じゃ、この迷宮は"}});
HK.Load.toneData("kansai",{"F":[
["〈〉も、おいでよ。気持ちいいよ","〈〉も、おいでや。気持ちええで",1],
["戻ってこられたのは、運がよかっただけ","戻ってこれたんは、運がよかっただけや",1]],
"O":{
"見ちゃだめだ":"見たらあかん",
"自分の名前、言える？":"自分の名前、言える？",
"ここで見たことは、全部忘れよう。お互いに":"ここで見たことは、全部忘れよ。お互いにな",
"しっかりしろ！迷宮に呑まれるな！":"しっかりしいや！　迷宮に呑まれたらあかん！",
"もう平気。見てないから":"もう平気や。見てへんから",
"最低だ、この迷宮":"最低や、この迷宮"}});
HK.Load.toneData("mukuchi",{"F":[
["…普通のご飯","……普通のご飯"],
["…ねえ、〈〉も、熱いでしょ","……〈〉も、熱い？",1]],
"O":{
"見ちゃだめだ":"……見ないで",
"自分の名前、言える？":"……名前、言える？",
"ここで見たことは、全部忘れよう。お互いに":"……ここのことは、忘れる",
"しっかりしろ！迷宮に呑まれるな！":"……しっかり。呑まれないで",
"もう平気。見てないから":"……平気。見てない",
"最低だ、この迷宮":"……最低。この迷宮"}});
HK.Load.toneData("polite",{"F":[
["…普通のご飯","…普通のご飯です",1],
["ごめん、もう、止まらない","すみません、もう、止まりません",1],
["待って、そこの床、色が違う","待ってください、そこの床、色が違います",1]],
"O":{
"見ちゃだめだ":"見てはいけません",
"自分の名前、言える？":"ご自分のお名前、言えますか？",
"ここで見たことは、全部忘れよう。お互いに":"ここで見たことは、全部忘れましょう。お互いに",
"しっかりしろ！迷宮に呑まれるな！":"しっかりしてください！　迷宮に呑まれないで！",
"もう平気。見てないから":"もう平気です。見ていませんから",
"最低だ、この迷宮":"最低です、この迷宮"}});
HK.Load.toneData("gentleman",{"F":[
["…ねえ、〈〉も、熱いでしょ","…〈〉、君も熱いだろう？"],
["…それ以上やったら、置いていく","…それ以上やったら、置いていくよ",1],
["待って、そこの床、色が違う","待ちたまえ。そこの床は、色が違う",1]],
"O":{
"見ちゃだめだ":"見てはいけないよ",
"自分の名前、言える？":"自分の名前は言えるかね？",
"ここで見たことは、全部忘れよう。お互いに":"ここで見たことは、すべて忘れようじゃないか。お互いにね",
"しっかりしろ！迷宮に呑まれるな！":"しっかりしたまえ！　迷宮に呑まれてはいけない！",
"もう平気。見てないから":"もう平気だよ。見ていないから",
"最低だ、この迷宮":"最低だね、この迷宮は"}});
HK.Load.toneData("proud",{"F":[
["帰ったら、何食べたい？","帰ったら、何を食う？",1],
["もう平気。見てないから","もう平気だ。見てねえから",1]]});
HK.Load.toneData("aniki",{"F":[
["帰ったら、何食べたい？","帰ったら、何食いたい？",1],
["しっかりしろ！迷宮に呑まれるな！","しっかりしろ！迷宮に呑まれるな！",1],
["もう平気。見てないから","もう平気だよ。見てねえから",1],
["…ねえ、〈〉も、熱いでしょ","…なあ、〈〉も、熱いだろ",1]]});
HK.Load.toneData("yankee",{"F":[
["見ちゃだめだ","見ちゃだめだって"],
["しっかりしろ！迷宮に呑まれるな！","しっかりしろ、オイ！　迷宮なんかに呑まれんじゃねえ！",1],
["…ねえ、〈〉も、熱いでしょ","…なあ、〈〉も、熱いだろ",1]]});
HK.Load.toneData("tsun",{"F":[
["ここで見たことは、全部忘れよう。お互いに","ここで見たことは、全部忘れなさい。……お互いにね",1]]});
HK.Load.toneData("tsun_n",{"F":[
["ここで見たことは、全部忘れよう。お互いに","ここで見たことは、全部忘れよう。お互いに",1]]});
HK.Load.toneData("gentle",{"F":[
["最低だ、この迷宮","ひどいなあ、この迷宮"]]});
HK.Load.toneData("gentle_n",{"F":[
["最低だ、この迷宮","ひどいなあ、この迷宮"]]});
HK.Load.toneData("kohai",{"F":[
["もう平気。見てないから","もう平気っす。見てないっすから"],
["最低だ、この迷宮","最低っす、この迷宮"],
["見ちゃだめだ","見ちゃダメっす"],
["〈〉も、おいでよ。気持ちいいよ","〈〉さんも、来てくださいよ。気持ちいいっすよ",1]]});
HK.Load.toneData("cool",{"F":[
["帰ったら、何食べたい？","帰ったら、何を食べたい？",1],
["もう平気。見てないから","もう平気だ。見ていない",1],
["…ねえ、〈〉も、熱いでしょ","…〈〉も、熱いだろう",1],
["ここで見たことは、全部忘れよう。お互いに","ここで見たことは、全部忘れよう。互いにな",1]]});
HK.Load.toneData("free",{"F":[
["ここで見たことは、全部忘れよう。お互いに","ここで見たことは、全部忘れよう！　お互いにね！",1]]});
HK.Load.toneData("usan",{"F":[
["ここで見たことは、全部忘れよう。お互いに","ここで見たことは、全部忘れようじゃないの。お互いにさ",1]]});
HK.Load.toneData("shy",{"F":[
["最低だ、この迷宮","さ、最低……この迷宮……"]]});
HK.Load.toneData("ojou",{"F":[
["〈〉も、おいでよ。気持ちいいよ","〈〉さんも、いらっしゃいな。気持ちいいですわよ",1]]});
HK.Load.toneData("hero",{"F":[
["見ちゃだめだ","見るな！",1],
["大丈夫。一緒に帰る","大丈夫だ！　一緒に帰るぞ！",1]]});
HK.Load.toneData("gyaru",{"F":[
["見ちゃだめだ","見ちゃダメ"],
["ここで見たことは、全部忘れよう。お互いに","ここで見たことはぜーんぶ忘れよ！　お互いに！",1],
["しっかりしろ！迷宮に呑まれるな！","しっかりして！迷宮に呑まれちゃダメだって！"],
["最低だ、この迷宮","最悪なんだけど、この迷宮"],
["あなたが望んでいることを、私は知ってる","あんたが望んでること、私は知ってるよ"],
["本当はこうしたいでしょう","ホントはこうしたいんでしょ？"]]});
HK.Load.toneData("chara",{"F":[
["見ちゃだめだ","見ちゃダメだって"],
["しっかりしろ！迷宮に呑まれるな！","しっかりしろって！　迷宮に呑まれんなよ！"],
["最低だ、この迷宮","最悪だわ、この迷宮"],
["…それ以上やったら、置いていく","…それ以上やったら、置いてくから"],
["あなたが望んでいることを、私は知ってる","あんたが望んでること、私は知ってるって"]]});
HK.Load.toneData("mystic",{"F":[
["ここで見たことは、全部忘れよう。お互いに","ここで見たことは、全部忘れよう。お互いにね",1],
["しっかりしろ！迷宮に呑まれるな！","しっかりして。迷宮に呑まれちゃだめだよ",1]]});
HK.Load.toneData("genki",{"F":[
["〈〉も、おいでよ。気持ちいいよ","〈〉さんも、来てくださいよ！　気持ちいいですよ",1]]});
HK.Load.toneData("darui",{"F":[
["ここで見たことは、全部忘れよう。お互いに","……ここで見たこと、ぜんぶ忘れよ。……お互い",1]]});
HK.Load.toneData("sondai",{"F":[
["噛んで。苦いけど、効くから","噛みたまえ。苦いが、効くのだよ",1],
["〈〉も、おいでよ。気持ちいいよ","〈〉も、来たまえ。気持ちいいぞ",1]]});
});
HK.Load.done('scen-dungeon', '9e1148d29b', 1);
