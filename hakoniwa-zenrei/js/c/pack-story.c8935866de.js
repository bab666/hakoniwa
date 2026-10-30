;
/* ==== js/obsess-story.js ==== */
HK.Load.def(298,'js/obsess-story.js',function(){
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
if(L0.some(function(t){return HK.tieNoLove(t);}))return true;
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
HK.Load.done('pack-story', 'c8935866de', 1);
